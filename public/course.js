/* Les 24 tours de la caserne : une course de karts à travers toute la caserne.
   Le départ est donné dans la grande cour du fond, sur l'allée de droite. On fait le tour des bâtiments du milieu (l'allée de droite, la cour du fond,
   l'allée de gauche), on revient dans la troisième cour, on passe sous le porche, on traverse la deuxième cour, on passe sous l'horloge,
   et dans la cour d'honneur on monte par une rampe sur le toit de gauche (la terrasse : parasols, tables, transats), on traverse la cour
   par un pont devant le bâtiment de l'horloge, on longe le toit de droite, on redescend par l'autre rampe et l'on repart sous les porches.
   Sous les porches, deux voies séparées : celle qui va vers le fond, celle qui revient.
   Deux tours ; des caisses de bonus : la peau de banane, la flaque d'huile, le fumigène, la boule de pétanque, le gyrophare, le turbo.
   Seul : contre quatre karts de la caserne. À plusieurs : ceux qui viennent à la grille de départ (dans la cour d'honneur) pendant le compte à rebours courent ensemble.
   Ce fichier n'est pas un module : la matrice le charge et l'exécute chez elle (eval direct) ; il se sert de M, THREE, tex, toile, envoyerWS… */

const KC = { L: 0, pts: null, N: 0, pas: .5, tours: 2, vmax: 17, grilleT: 12000 };
/* le tracé : des points de passage (x, hauteur, z, largeur de la piste), reliés par une courbe douce */
const VP = 2.3, VA = 3.7, VC = 5;   // (les largeurs : une voie sous les porches, les allées autour des bâtiments, la cour d'honneur et les toits)
const TRACE_K = [
  // l'allée de droite, dans la grande cour du fond (le départ), puis la cour du fond, l'allée de gauche
  [18.3, -.16, -90, VA], [18.3, -.42, -100, VA], [18.3, -.68, -110, VA], [18, -.98, -120, VA], [15.5, -1.1, -125.4, VA], [8, -1.13, -126.6, VA], [-5, -1.13, -126.6, VA],
  [-14.5, -1.1, -126.1, VA], [-17.8, -1, -121.5, VA], [-18, -.88, -116, VA], [-18, -.06, -106, VA], [-18, 0, -96, VA], [-18, 0, -84, VA], [-17.5, 0, -72.5, VA],
  // la troisième cour, le porche (voie du retour), la deuxième cour, le porche de l'horloge
  [-14, 0, -66.6, VA], [-8, 0, -65.4, VA], [-3.4, 0, -62.4, VA], [-1.25, 0, -57, VP], [-1.25, 0, -50, VP], [-1.25, 0, -44, VP], [-1.25, 0, -38, VP], [-1.25, 0, -30, VP], [-1.25, 0, -24, VP],
  // la cour d'honneur : la rampe de gauche, la terrasse, le pont, le toit de droite, la rampe de droite
  [-1.4, 0, -19.6, VP], [-2.8, 0, -15.6, VC], [-6.5, 0, -12.8, VC], [-9.5, .3, -9, VC], [-9.8, 3, -3, VC], [-10, 6.3, 1.5, VC], [-11.5, 7.6, 4.6, VC], [-14.5, 7.6, 6.8, VC],
  [-18.5, 7.6, 6.5, VC], [-21, 7.6, 3, VC], [-21, 7.6, -4, VC], [-20.5, 7.6, -10, VC], [-17.5, 7.6, -13.4, VC], [-12, 7.8, -14.7, VC], [0, 8.1, -14.7, VC], [12, 7.8, -14.7, VC],
  [17.5, 7.6, -13.4, VC], [20.5, 7.6, -10, VC], [21, 7.6, -4, VC], [21, 7.6, 3, VC], [18.5, 7.6, 6.5, VC], [14.5, 7.6, 6.8, VC], [11.5, 7.6, 4.6, VC], [10, 6.3, 1.5, VC],
  [9.8, 3, -3, VC], [9.5, .3, -9, VC], [6.5, 0, -12.8, VC], [2.8, 0, -15.6, VC], [1.4, 0, -19.6, VP],
  // le retour vers le fond : le porche de l'horloge, la deuxième cour, le porche (voie de l'aller), la troisième cour, l'allée de droite
  [1.25, 0, -24, VP], [1.25, 0, -30, VP], [1.25, 0, -38, VP], [1.25, 0, -44, VP], [1.25, 0, -50, VP], [1.25, 0, -57, VP], [3.4, 0, -62, VA], [8, 0, -64.6, VA], [14, 0, -65.4, VA],
  [17.6, 0, -69, VA], [18.3, 0, -76, VA], [18.3, 0, -82, VA]];
const TOIT_K = (x, z) => Math.abs(x) > 12.6 && Math.abs(x) < 24.4 && z > -17.8 && z < 7.8;   // (là où la piste roule sur un toit : pas de piliers dessous)
const COULEURS_K = [0xd8261e, 0x1e64d8, 0xf2c21a, 0x2aa84a, 0x9b3ad6, 0xf07a1a, 0x20b8c8, 0xe8e8e8];
const NOMS_BOTS = ["Le brigadier", "Le maréchal des logis", "L'adjudant", "Le trompette"];
const TETES_BOTS = ["images/gendarme-tete.png", "images/gendarme2-tete.png", "images/gendarme3-tete.png", "images/gendarme4-tete.png"];
const OBJETS_K = { banane: "🍌", huile: "🛢️", fumi: "💨", boule: "🎱", gyro: "🚨", turbo: "⚡" };

/* ---------- le circuit : la courbe, la piste en 3D, les barrières, les piliers, la ligne de départ, la terrasse ---------- */
function preparerTraceK() { if (KC.pts) return;
  const V = TRACE_K.map(([x, y, z]) => new THREE.Vector3(x, y, z)), c = new THREE.CatmullRomCurve3(V, true, "centripetal", .5);
  const L = c.getLength(), N = Math.ceil(L / KC.pas); KC.L = L; KC.N = N; KC.pts = []; KC.tan = []; KC.nor = []; KC.lar = [];
  for (let i = 0; i < N; i++) { const u = i / N, p = c.getPointAt(u), t = c.getTangentAt(u); KC.pts.push(p); KC.tan.push(t); const n = new THREE.Vector3(-t.z, 0, t.x).normalize(); KC.nor.push(n);
    // (la largeur : celle des deux points de passage les plus proches, mélangées selon la distance)
    let a = [1e9, 0], b = [1e9, 0]; for (const q of TRACE_K) { const d = Math.hypot(q[0] - p.x, q[2] - p.z, (q[1] - p.y) * 2); if (d < a[0]) { b = a; a = [d, q[3]]; } else if (d < b[0]) b = [d, q[3]]; }
    KC.lar.push((a[1] * b[0] + b[1] * a[0]) / (a[0] + b[0] || 1)); }
  // (on lisse la largeur, pour qu'elle change en douceur)
  for (let r = 0; r < 6; r++) KC.lar = KC.lar.map((w, i) => (KC.lar[(i - 1 + N) % N] + 2 * w + KC.lar[(i + 1) % N]) / 4);
  KC.courbe = c; }
// (un point de la piste : s le long du tracé, d sur le côté — à droite positif)
function surPiste(s, d, out) { const N = KC.N, k = ((s / KC.pas) % N + N) % N, i = Math.floor(k), f = k - i, j = (i + 1) % N;
  const p = out || new THREE.Vector3(); p.lerpVectors(KC.pts[i], KC.pts[j], f); const n = KC.nor[i]; p.x += n.x * d; p.z += n.z * d; return p; }
function largeur(s) { const N = KC.N, i = Math.floor((((s / KC.pas) % N) + N) % N); return KC.lar[i]; }
function tangente(s) { const N = KC.N, i = Math.floor((((s / KC.pas) % N) + N) % N); return KC.tan[i]; }
function capPiste(s) { const t = tangente(s); return Math.atan2(t.x, t.z); }
function pentePiste(s) { const t = tangente(s); return Math.asin(Math.max(-1, Math.min(1, t.y))); }
function courbure(s) { const a = capPiste(s), b = capPiste(s + 6); return Math.abs(Math.atan2(Math.sin(b - a), Math.cos(b - a))); }

function construirePisteK(scene) { preparerTraceK(); const G = new THREE.Group(); G.name = "piste-karts";
  const N = KC.N, LA = KC.lar, pos = [], uv = [], idx = [];
  const asph = toile(256, 512, x => { x.fillStyle = "#3a3b3f"; x.fillRect(0, 0, 256, 512); for (let i = 0; i < 4000; i++) { const v = 40 + Math.random() * 40; x.fillStyle = `rgba(${v},${v},${v + 3},.6)`; x.fillRect(Math.random() * 256, Math.random() * 512, 2, 2); }
    x.fillStyle = "#e9e6dc"; for (let y = 0; y < 512; y += 128) x.fillRect(124, y, 8, 64);   // (la ligne blanche du milieu, en tirets)
    for (let y = 0; y < 512; y += 32) { x.fillStyle = (y / 32) % 2 ? "#e8e8e8" : "#c8201c"; x.fillRect(0, y, 16, 32); x.fillRect(240, y, 16, 32); } });   // (les vibreurs rouges et blancs)
  for (let i = 0; i <= N; i++) { const k = i % N, p = KC.pts[k], n = KC.nor[k];
    const W = LA[k]; for (const sd of [-1, 1]) pos.push(p.x + n.x * W / 2 * sd, p.y + .06, p.z + n.z * W / 2 * sd);
    uv.push(0, i * KC.pas / 7.4, 1, i * KC.pas / 7.4);
    if (i < N) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); } }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  const ta = tex(asph); ta.wrapS = ta.wrapT = THREE.RepeatWrapping; const route = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: ta, roughness: .9, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 }));
  route.receiveShadow = true; G.add(route);
  // le dessous de la piste, quand elle est en l'air : une dalle de béton épaisse
  { const p2 = [], i2 = []; for (let i = 0; i <= N; i++) { const k = i % N, p = KC.pts[k], n = KC.nor[k], W = LA[k], h = p.y > .4 ? .45 : 0; for (const sd of [-1, 1]) p2.push(p.x + n.x * W / 2 * sd, p.y - h, p.z + n.z * W / 2 * sd); if (i < N) { const a = i * 2; i2.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } }
    const g2 = new THREE.BufferGeometry(); g2.setAttribute("position", new THREE.Float32BufferAttribute(p2, 3)); g2.setIndex(i2); g2.computeVertexNormals(); G.add(new THREE.Mesh(g2, new THREE.MeshStandardMaterial({ color: 0x8c8a84, roughness: .95, side: THREE.DoubleSide }))); }
  // les barrières : des murets rouges et blancs quand on est en l'air, des pneus empilés au sol (seulement dans les virages)
  const muretM = new THREE.MeshStandardMaterial({ map: tex(toile(128, 32, x => { for (let i = 0; i < 4; i++) { x.fillStyle = i % 2 ? "#f2f2f2" : "#c8201c"; x.fillRect(i * 32, 0, 32, 32); } })), roughness: .7 });
  muretM.map.wrapS = THREE.RepeatWrapping;
  for (const sd of [-1, 1]) { const p3 = [], u3 = [], i3 = []; let n0 = 0;
    for (let i = 0; i <= N; i++) { const k = i % N, p = KC.pts[k], n = KC.nor[k], W = LA[k], h = p.y > .4 ? .9 : .55, x = p.x + n.x * (W / 2 + .1) * sd, z = p.z + n.z * (W / 2 + .1) * sd;
      p3.push(x, p.y, z, x, p.y + h, z); u3.push(i * KC.pas / 2, 0, i * KC.pas / 2, 1); if (i < N) { const a = n0; i3.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); } n0 += 2; }
    const g3 = new THREE.BufferGeometry(); g3.setAttribute("position", new THREE.Float32BufferAttribute(p3, 3)); g3.setAttribute("uv", new THREE.Float32BufferAttribute(u3, 2)); g3.setIndex(i3); g3.computeVertexNormals();
    G.add(new THREE.Mesh(g3, Object.assign(muretM.clone(), { side: THREE.DoubleSide }))); }
  // les piliers sous la piste, quand elle est en l'air et pas sur un toit
  const pilM = new THREE.MeshStandardMaterial({ color: 0x9a968c, roughness: .9 });
  const surRouteBasse = (x, z) => { for (let j = 0; j < N; j += 2) { const q = KC.pts[j]; if (q.y < 1.5 && Math.hypot(q.x - x, q.z - z) < LA[j] / 2 + .6) return true; } return false; };
  for (let i = 0; i < N; i += 9) { const p = KC.pts[i]; if (p.y < 1.2) continue; for (const sd of [-1, 1]) { const n = KC.nor[i], W = LA[i], x = p.x + n.x * (W / 2 - .6) * sd, z = p.z + n.z * (W / 2 - .6) * sd; if (TOIT_K(x, z) || surRouteBasse(x, z)) continue;
      const h = p.y - .45, c = new THREE.Mesh(new THREE.CylinderGeometry(.22, .26, h, 10), pilM); c.position.set(x, h / 2, z); c.castShadow = true; G.add(c); } }
  // la ligne de départ en damier, et le portique « LES 24 TOURS DE LA CASERNE »
  { const s0 = 0, p = KC.pts[0], W = LA[0], cap = capPiste(s0), dam = tex(toile(256, 32, x => { for (let i = 0; i < 16; i++) for (let j = 0; j < 2; j++) { x.fillStyle = (i + j) % 2 ? "#111" : "#f4f4f4"; x.fillRect(i * 16, j * 16, 16, 16); } }));
    const l = new THREE.Mesh(new THREE.PlaneGeometry(W, .9), new THREE.MeshStandardMaterial({ map: dam, roughness: .8, polygonOffset: true, polygonOffsetFactor: -4 })); l.rotation.set(-Math.PI / 2, 0, cap); l.position.set(p.x, p.y + .075, p.z); G.add(l);
    const por = new THREE.Group(); por.position.set(p.x, p.y, p.z); por.rotation.y = cap + Math.PI / 2; G.add(por); const fer = new THREE.MeshStandardMaterial({ color: 0x24262c, metalness: .5, roughness: .4 });
    for (const sd of [-1, 1]) { const m = new THREE.Mesh(new THREE.BoxGeometry(.25, 5, .25), fer); m.position.set(0, 2.5, sd * (W / 2 + .5)); por.add(m); }
    const ban = toile(1024, 128, x => { x.fillStyle = "#14234a"; x.fillRect(0, 0, 1024, 128); x.fillStyle = "#ffd23a"; x.font = "900 66px Arial Black,Arial"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("🏁 LES 24 TOURS DE LA CASERNE 🏁", 512, 68); });
    const b = new THREE.Mesh(new THREE.BoxGeometry(.2, 1.1, W + 1.2), [fer, fer, fer, fer, new THREE.MeshBasicMaterial({ map: tex(ban) }), new THREE.MeshBasicMaterial({ map: tex(ban) })]); b.position.y = 5.2; b.rotation.y = Math.PI / 2; por.add(b); b.rotation.y = 0;
    b.geometry = new THREE.BoxGeometry(.2, 1.1, W + 1.2); }
  // la terrasse, sur le toit de gauche : parasols, tables, transats (entre la piste et le bord du toit, côté cour), bacs à fleurs le long de la piste
  { const coul = [0xd8261e, 0xf2c21a, 0x1e64d8, 0x2aa84a], toile2 = new THREE.MeshStandardMaterial({ color: 0xf0ece0, roughness: .8 });
    for (let k = 0; k < 5; k++) { const x = -14.8, z = -10.4 + k * 3.1, y = 7.45, g2 = new THREE.Group(); g2.position.set(x + (k % 2) * .4, y, z); G.add(g2);
      const mat = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, 2.2, 6), new THREE.MeshStandardMaterial({ color: 0xdddddd })); mat.position.y = 1.1; g2.add(mat);
      const par = new THREE.Mesh(new THREE.ConeGeometry(1.3, .5, 8, 1, true), new THREE.MeshStandardMaterial({ color: coul[k % 4], side: THREE.DoubleSide, roughness: .7 })); par.position.y = 2.2; g2.add(par);
      const tab = new THREE.Mesh(new THREE.CylinderGeometry(.45, .45, .05, 16), toile2); tab.position.y = .72; g2.add(tab); const pied = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, .72, 6), toile2); pied.position.y = .36; g2.add(pied);
      if (k % 2) { const tr = new THREE.Mesh(new THREE.BoxGeometry(.6, .12, 1.7), new THREE.MeshStandardMaterial({ color: coul[(k + 1) % 4] })); tr.position.set(-.9, .3, 0); tr.rotation.x = -.15; g2.add(tr); } }
    for (let k = 0; k < 4; k++) { const b = new THREE.Mesh(new THREE.BoxGeometry(.6, .5, 2.4), new THREE.MeshStandardMaterial({ color: 0x8a5a3a })); b.position.set(-17.8, 7.7, -10 + k * 3.6); G.add(b);
      const f = new THREE.Mesh(new THREE.SphereGeometry(.7, 8, 6), new THREE.MeshStandardMaterial({ color: 0x3f8a3a })); f.scale.set(.6, .6, 1.7); f.position.set(-17.8, 8.25, -10 + k * 3.6); G.add(f); } }
  // les caisses de bonus : trois rangées de quatre, sur la piste
  KC.caisses = []; const cm = new THREE.MeshStandardMaterial({ map: tex(toile(64, 64, x => { const gr = x.createLinearGradient(0, 0, 64, 64); gr.addColorStop(0, "#ffe25a"); gr.addColorStop(1, "#ff8a1a"); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); x.strokeStyle = "#7a3a00"; x.lineWidth = 4; x.strokeRect(2, 2, 60, 60); x.fillStyle = "#fff"; x.font = "900 44px Arial"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("?", 32, 35); })), emissive: 0x553300, emissiveIntensity: .6, transparent: true, opacity: .9 });
  const auPoint = (x, z, y = 0) => { let best = 0, bd = 1e9; KC.pts.forEach((q, i) => { const d = Math.hypot(q.x - x, q.z - z, (q.y - y) * 2); if (d < bd) { bd = d; best = i; } }); return best * KC.pas; };
  for (const [x, y, z] of [[18.3, -.6, -106], [-18, 0, -100], [-21, 7.6, -2], [21, 7.6, -2], [1.25, 0, -64]]) { const s0 = auPoint(x, z, y), W = largeur(s0);
    for (const f of [-.36, -.12, .12, .36]) { const d = f * W * 1.1, m = new THREE.Mesh(new THREE.BoxGeometry(.8, .8, .8), cm); surPiste(s0, d, m.position); m.position.y += .8; G.add(m); KC.caisses.push({ s: s0, d, m, retour: 0 }); } }
  scene.add(G); KC.G = G; return G; }

/* ---------- les karts ---------- */
function fabriquerKart(couleur, nom) { const g = new THREE.Group(), c = new THREE.MeshStandardMaterial({ color: couleur, roughness: .35, metalness: .3 }), noir = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: .8 });
  const caisse = new THREE.Mesh(new THREE.BoxGeometry(1.2, .32, 2), c); caisse.position.y = .38; g.add(caisse);
  const nez = new THREE.Mesh(new THREE.BoxGeometry(1, .22, .6), c); nez.position.set(0, .34, 1.15); g.add(nez);
  const aileron = new THREE.Mesh(new THREE.BoxGeometry(1.3, .08, .35), noir); aileron.position.set(0, .78, -1); g.add(aileron);
  for (const sx of [-.45, .45]) { const m = new THREE.Mesh(new THREE.BoxGeometry(.06, .3, .06), noir); m.position.set(sx, .62, -1); g.add(m); }
  const roues = []; for (const [x, z, r] of [[-.7, .72, .26], [.7, .72, .26], [-.72, -.7, .32], [.72, -.7, .32]]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(r, r, .26, 14), noir); w.rotation.z = Math.PI / 2; w.position.set(x, r, z); g.add(w); roues.push(w); }
  const volant = new THREE.Mesh(new THREE.TorusGeometry(.17, .03, 6, 16), noir); volant.position.set(0, .78, .38); volant.rotation.x = -1.1; g.add(volant);
  // le pilote : le corps, le casque à la couleur du kart, la visière
  const corps = new THREE.Mesh(new THREE.CylinderGeometry(.24, .3, .6, 10), new THREE.MeshStandardMaterial({ color: 0x1d2a44 })); corps.position.set(0, .82, -.15); g.add(corps);
  const casque = new THREE.Mesh(new THREE.SphereGeometry(.26, 16, 12), new THREE.MeshStandardMaterial({ color: couleur, roughness: .2, metalness: .2 })); casque.position.set(0, 1.28, -.12); g.add(casque);
  const vis = new THREE.Mesh(new THREE.SphereGeometry(.2, 12, 8, -Math.PI / 2, Math.PI, Math.PI / 3, Math.PI / 3), new THREE.MeshStandardMaterial({ color: 0x111111, roughness: .1, metalness: .6 })); vis.position.set(0, 1.28, -.05); vis.rotation.y = Math.PI; g.add(vis);
  // son nom au-dessus
  const et = toile(256, 48, x => { x.fillStyle = "rgba(0,0,0,.55)"; x.beginPath(); x.roundRect(0, 0, 256, 48, 14); x.fill(); x.fillStyle = "#fff"; x.font = "700 26px Arial"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(nom.slice(0, 18), 128, 25); });
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex(et), depthTest: false })); sp.scale.set(1.3, .25, 1); sp.position.y = 2.3; sp.renderOrder = 5; g.add(sp);
  // le gyrophare (allumé quand il est invincible)
  const gy = new THREE.Mesh(new THREE.SphereGeometry(.14, 10, 8), new THREE.MeshBasicMaterial({ color: 0x2a5cff })); gy.position.set(0, 1.98, -.12); gy.visible = false; g.add(gy);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return { g, roues, gy, casque, vis, corps, et: sp }; }
// (la tête du pilote : la photo du bonhomme, à la place du casque ; sans photo, on garde le casque)
function mettreTete(K, P) { if (!P) return; chargerTete(P.numero, P.tete_v, P.teteUrl).then(img => { if (!img || !img.width || !K.g.parent) return;
  const c = toile(img.width, img.height, x => x.drawImage(img, 0, 0)), h = .95, sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex(c), transparent: true, alphaTest: .05 }));
  sp.scale.set(h * img.width / img.height, h, 1); sp.position.set(0, 1.12 + h / 2 - .14, -.12); sp.renderOrder = 2; sp.center.set(.5, .5); K.g.add(sp); K.tete = sp; K.casque.visible = K.vis.visible = false; }).catch(() => {});
  if (P.couleur) K.corps.material.color.set(P.couleur); }   // (le blouson : la couleur de son bonhomme)
function nouveauPilote(o) { const K = fabriquerKart(o.couleur, o.nom); KC.scene.add(K.g); mettreTete(K, o.tete);
  return { id: o.id, nom: o.nom, bot: !!o.bot, humain: !!o.humain, moi: !!o.moi, K, s: o.s, d: o.d, h: capPiste(o.s), v: 0, tour: -1, prog: o.s - KC.L, fini: 0, spin: 0, glisse: 0, gyro: 0, turbo: 0, fumee: 0, objet: null, voie: o.d, bv: .86 + Math.random() * .1 }; }

/* ---------- la course : l'état, la grille, le compte à rebours ---------- */
const KR = { on: false, pil: [], moi: null, t0: 0, objets: [], obs: [], fin: [], hud: null, dern: 0, envoiT: 0, solo: true, attente: null };
function grilleK(n) { const r = Math.floor(n / 2), c = n % 2, s = KC.L - 2.5 - r * 3.4, e = Math.min(1.2, largeur(s) / 2 - .85); return { s, d: c ? e : -e }; }
// (entrer sur la grille : on rejoint une course annoncée il y a peu ; sinon on en lance une)
function entrerCourse() { if (KR.on || !M || M.lieu !== "grande" || !adminK()) return; KC.scene = M.scene; if (!KC.G || KC.G.parent !== M.scene) construirePisteK(M.scene); cacherVoitures(true);
  const moi = M.gens.get(M.moiNum); const ann = KR.attente && KR.attente.t0 > Date.now() + 1500 ? KR.attente : null;
  const t0 = ann ? ann.t0 : Date.now() + KC.grilleT; KR.t0 = t0; KR.on = true; KR.fin = []; KR.objets = []; KR.obs = [];
  KR.humains = ann ? [...ann.ids] : []; if (!KR.humains.includes(M.moiNum)) KR.humains.push(M.moiNum);
  if (!ann) envoyerWS({ t: "k_annonce", t0, ids: KR.humains }); else envoyerWS({ t: "k_rejoint", t0 });
  KR.moiInfo = { id: M.moiNum, nom: (moi && moi.info && moi.info.nom ? moi.info.nom.split(" ")[0] : "Moi"), couleur: COULEURS_K[(Number(M.moiNum) || 0) % COULEURS_K.length] };
  if (moi) { KR.moiPos = moi.g.position.clone(); moi.cible = null; moi.chemin = []; moi.g.visible = false; }
  M.course = KR; ouvrirHUD(); placerGrille(); bulle(null); }
function placerGrille() { for (const p of KR.pil) KC.scene.remove(p.K.g); KR.pil = [];
  const hs = [...KR.humains].sort((a, b) => a - b); KR.solo = hs.length <= 1;
  hs.forEach((id, i) => { const g = grilleK(i), moi = id === M.moiNum, P = M.gens.get(id), nom = moi ? KR.moiInfo.nom : (P && P.info && P.info.nom ? P.info.nom.split(" ")[0] : "Joueur");
    if (P && !moi) { P.g.visible = false; KR.caches = KR.caches || new Set(); KR.caches.add(P); }
    const inf = P && P.info ? { numero: P.info.numero ?? id, tete_v: P.info.tete_v, teteUrl: P.info.teteUrl, couleur: P.info.couleur } : null;
    const p = nouveauPilote({ id, nom, moi, humain: true, tete: inf, couleur: COULEURS_K[(Number(id) || 0) % COULEURS_K.length], ...g }); KR.pil.push(p); if (moi) KR.moi = p; });
  if (KR.solo) NOMS_BOTS.forEach((nom, i) => { const g = grilleK(hs.length + i); KR.pil.push(nouveauPilote({ id: "b" + i, nom, bot: true, tete: { teteUrl: TETES_BOTS[i], couleur: "#1c2541" }, couleur: COULEURS_K[(i + 3) % COULEURS_K.length], ...g })); });
  for (const p of KR.pil) majKart(p, 0); }
function quitterCourse() { if (!KR.on) return; KR.on = false; for (const p of KR.pil) KC.scene && KC.scene.remove(p.K.g); for (const o of KR.objets) o.m && o.m.parent && o.m.parent.remove(o.m); KR.pil = []; KR.objets = [];
  if (KC.G && KC.G.parent) KC.G.parent.remove(KC.G); cacherVoitures(false);
  for (const P of KR.caches || []) P.g.visible = true; KR.caches = null;
  const moi = M && M.gens.get(M.moiNum); if (moi) { moi.g.visible = true; if (KR.moiPos) moi.g.position.copy(KR.moiPos); }
  envoyerWS({ t: "k_part" }); if (M) M.course = null; fermerHUD(); moteurK(0); }

/* ---------- les commandes : clavier, manette (et manettes du casque), boutons à l'écran ---------- */
const KT = { g: 0, d: 0, gaz: 0, frein: 0, obj: 0, dera: 0 };
function commandesK() { const k = c => !!(typeof CLAV !== "undefined" && CLAV[c]), P = KR.pad || { axes: [0, 0, 0, 0], buttons: [] };
  const bt = i => { const b = P.buttons && P.buttons[i]; return !!(b && (b.pressed || b.value > .4)); };
  let dir = (k("ArrowRight") || k("KeyD") ? 1 : 0) - (k("ArrowLeft") || k("KeyA") || k("KeyQ") ? 1 : 0) + KT.d - KT.g + (Math.abs(P.axes[0] || 0) > .15 ? P.axes[0] : 0);
  dir = Math.max(-1, Math.min(1, dir));
  const tactile = matchMedia("(pointer: coarse)").matches && !P.vr;
  const gaz = k("ArrowUp") || k("KeyW") || k("KeyZ") || bt(7) || bt(0) || KT.gaz || (tactile && !KT.frein) || (P.vr && bt(7));
  const frein = k("ArrowDown") || k("KeyS") || bt(6) || bt(1) || KT.frein;
  const obj = k("Space") || k("KeyE") || bt(2) || bt(5) || KT.obj, dera = k("ShiftLeft") || k("ShiftRight") || bt(4);
  return { dir, gaz: gaz ? 1 : 0, frein: frein ? 1 : 0, obj, dera }; }

/* ---------- la conduite (la même pour nous, les karts de la caserne… et, de loin, pour les autres joueurs) ---------- */
function conduire(p, c, dt) { const W2 = Math.max(.25, largeur(p.s) / 2 - .75);
  if (p.spin > 0) { p.spin -= dt; p.v *= Math.pow(.18, dt); p.tourne = (p.tourne || 0) + dt * 14; c = { dir: 0, gaz: 0, frein: 0 }; } else p.tourne = 0;
  let vmax = KC.vmax * (p.bot ? p.bv : 1) * (p.gyro > 0 ? 1.22 : 1) * (p.turbo > 0 ? 1.45 : 1) * (p.fumee > 0 ? .78 : 1);
  if (p.fini) { c = { dir: 0, gaz: 0, frein: 1 }; vmax *= .5; }
  const pente = pentePiste(p.s); p.v += (c.gaz * 15 - c.frein * (p.v > 0 ? 26 : 6) - p.v * .45 - Math.sin(pente) * 9.8 * .55) * dt; if (p.turbo > 0) p.v += 20 * dt;
  p.v = Math.max(-5, Math.min(vmax, p.v));
  const capT = capPiste(p.s), k = Math.min(1, Math.abs(p.v) / 9), dera = c.dera && Math.abs(c.dir) > .3 && p.v > 10;
  if (p.glisse > 0) { p.glisse -= dt; p.h += (p.gl || 1) * 2.4 * dt; } else p.h -= c.dir * (dera ? 2.9 : 2.2) * k * dt * Math.sign(p.v || 1);
  if (dera) p.deraT = (p.deraT || 0) + dt; else { if ((p.deraT || 0) > .9 && p.v > 8) p.turbo = Math.max(p.turbo, .7); p.deraT = 0; }   // (un dérapage tenu : un petit turbo à la sortie)
  let rel = Math.atan2(Math.sin(p.h - capT), Math.cos(p.h - capT));
  p.s += p.v * Math.cos(rel) * dt; p.d -= p.v * Math.sin(rel) * dt;
  if (Math.abs(p.d) > W2) { p.d = Math.sign(p.d) * W2; p.v *= Math.pow(.25, dt * 3); rel *= .5; p.h = capT + rel; }   // (contre la barrière : on frotte, on ralentit, le kart se remet dans l'axe)
  p.gyro = Math.max(0, p.gyro - dt); p.turbo = Math.max(0, p.turbo - dt); p.fumee = Math.max(0, p.fumee - dt);
  // le tour : on passe la ligne (s repasse de L à 0) ; on compte la course comme une distance parcourue
  if (p.s >= KC.L) { p.s -= KC.L; p.tour++; } if (p.s < 0) { p.s += KC.L; p.tour--; }
  p.prog = p.tour * KC.L + p.s; }
function majKart(p, dt) { const pos = surPiste(p.s, p.d, p.K.g.position), pente = pentePiste(p.s);
  p.K.g.rotation.set(0, 0, 0); p.K.g.rotation.order = "YXZ"; p.K.g.rotation.y = p.h + (p.tourne || 0); p.K.g.rotation.x = -pente;
  for (const r of p.K.roues) r.rotation.x += p.v * dt * 3;
  p.K.et.visible = !p.moi && (!M.camera || M.camera.position.distanceTo(pos) > 4);
  p.K.gy.visible = p.gyro > 0; if (p.gyro > 0) p.K.gy.material.color.setHex(Math.floor(performance.now() / 120) % 2 ? 0x2a5cff : 0xff2a2a); }

/* ---------- les adversaires de la caserne (seul) ---------- */
function piloteBot(p, dt) { const devant = p.s + 9, cap = capPiste(devant), cb = courbure(p.s + 4);
  p.voieT = (p.voieT || 0) - dt; if (p.voieT <= 0) { p.voieT = 2 + Math.random() * 3; p.voie = (Math.random() - .5) * Math.max(0, largeur(p.s + 12) - 2.6); } { const lim = Math.max(0, largeur(p.s + 9) / 2 - .9); p.voie = Math.max(-lim, Math.min(lim, p.voie)); }
  // (éviter une banane ou une flaque juste devant)
  for (const o of KR.objets) if ((o.type === "banane" || o.type === "huile") && o.s > p.s && o.s - p.s < 12 && Math.abs(o.d - p.voie) < 1.4) p.voie = o.d > 0 ? o.d - 2.2 : o.d + 2.2;
  const vise = Math.atan2(-(p.voie - p.d), 9), voulu = cap + vise; const e = Math.atan2(Math.sin(voulu - p.h), Math.cos(voulu - p.h));
  const ralentir = cb > .55 && p.v > KC.vmax * .7; if (p.objet && Math.random() < dt * .35) utiliserObjet(p);
  return { dir: Math.max(-1, Math.min(1, -e * 2.2)), gaz: ralentir ? 0 : 1, frein: ralentir ? .4 : 0, dera: false }; }

/* ---------- les objets ---------- */
function tirerObjet(p) { const rang = classement().indexOf(p) + 1, n = KR.pil.length, r = Math.random(), dernier = rang > n / 2;
  return dernier ? (r < .25 ? "gyro" : r < .5 ? "turbo" : r < .7 ? "boule" : r < .85 ? "fumi" : "huile") : (r < .35 ? "banane" : r < .55 ? "huile" : r < .75 ? "boule" : r < .9 ? "fumi" : "turbo"); }
function utiliserObjet(p) { const o = p.objet; if (!o) return; p.objet = null;
  if (o === "gyro") { p.gyro = 6; if (p.moi) sireneK(); }
  else if (o === "turbo") { p.turbo = 1.8; if (p.moi) sonK("turbo"); }
  else { const lance = { type: o, s: o === "boule" ? p.s + 2 : p.s - 2.4, d: p.d, v: o === "boule" ? Math.max(p.v, 6) + 17 : 0, de: p.id, vie: o === "boule" ? 5 : o === "fumi" ? 6 : 60, t: performance.now() };
    poserObjet(lance); if (p.moi || p.bot && KR.solo) envoyerWS({ t: "k_obj", o: { type: lance.type, s: lance.s, d: lance.d, v: lance.v, vie: lance.vie } }); if (p.moi) sonK(o); }
  majHUD(); }
function poserObjet(o) { let m;
  if (o.type === "banane") { m = new THREE.Mesh(new THREE.TorusGeometry(.3, .1, 6, 12, Math.PI * 1.2), new THREE.MeshStandardMaterial({ color: 0xf5d13a, roughness: .5 })); m.rotation.x = -Math.PI / 2; }
  else if (o.type === "huile") { m = new THREE.Mesh(new THREE.CircleGeometry(1.5, 20), new THREE.MeshStandardMaterial({ color: 0x0a0a0c, roughness: .05, metalness: .8, transparent: true, opacity: .9 })); m.rotation.x = -Math.PI / 2; }
  else if (o.type === "fumi") { m = new THREE.Group(); const mt = new THREE.MeshBasicMaterial({ color: 0xd8342a, transparent: true, opacity: .45, depthWrite: false }); for (let i = 0; i < 9; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(1 + Math.random() * .8, 10, 8), mt); b.position.set((Math.random() - .5) * 4, .8 + Math.random() * 1.8, (Math.random() - .5) * 3); m.add(b); } }
  else if (o.type === "boule") { m = new THREE.Mesh(new THREE.SphereGeometry(.28, 16, 12), new THREE.MeshStandardMaterial({ color: 0x9aa3ad, metalness: .9, roughness: .25 })); }
  o.m = m; KC.scene.add(m); surPiste(o.s, o.d, m.position); m.position.y += o.type === "boule" ? .3 : o.type === "huile" ? .08 : o.type === "fumi" ? 0 : .12; KR.objets.push(o); }
function touche(p, o) { if (p.gyro > 0 || p.spin > 0) return false;
  const ds = Math.abs(((p.s - o.s + KC.L * 1.5) % KC.L) - KC.L / 2), dd = Math.abs(p.d - o.d), r = o.type === "huile" ? 1.6 : o.type === "fumi" ? 2.6 : 1;
  return ds < r && dd < r + .5; }
function majObjets(dt) { const now = performance.now();
  for (const o of KR.objets) { o.vie -= dt;
    if (o.type === "boule") { o.s = (o.s + o.v * dt) % KC.L; surPiste(o.s, o.d, o.m.position); o.m.position.y += .3; o.m.rotation.x += dt * 12; }
    if (o.type === "fumi") { o.m.children.forEach((b, i) => { b.scale.setScalar(1 + (6 - o.vie) * .08); b.position.y += dt * .15; }); o.m.children[0].material.opacity = Math.max(0, Math.min(.45, o.vie * .12)); }
    for (const p of KR.pil) { if (p.fini || (o.de === p.id && now - o.t < 600) || !touche(p, o)) continue;
      // (chacun ne vérifie que son propre kart, et les karts de la caserne ; pour les autres joueurs, c'est leur téléphone qui le fait)
      if (!(p.moi || p.bot)) continue;
      if (o.type === "fumi") { p.fumee = 2; if (p.moi) voileFumee(); continue; }
      if (o.type === "huile") { p.glisse = 1.1; p.gl = Math.random() < .5 ? -1 : 1; p.v *= .8; if (p.moi) sonK("glisse"); continue; }
      p.spin = 1.2; o.vie = 0; if (p.moi) sonK("aie"); } }
  KR.objets = KR.objets.filter(o => { if (o.vie > 0) return true; KC.scene.remove(o.m); return false; }); }

/* ---------- le classement, la boucle ---------- */
const classement = () => [...KR.pil].sort((a, b) => (b.fini ? 1e9 - b.fini : b.prog) - (a.fini ? 1e9 - a.fini : a.prog));
function majCourse(t, dt) { if (!KR.on || !M || !KC.G) return; dt = Math.min(.05, dt);
  const now = Date.now(), avant = now < KR.t0, c = commandesK();
  if (KR.moi && !avant) { if (c.obj && !KR.objPrec) utiliserObjet(KR.moi); }
  KR.objPrec = c.obj;
  for (const p of KR.pil) { if (avant) { majKart(p, 0); continue; }
    if (p.moi) conduire(p, c, dt); else if (p.bot) conduire(p, piloteBot(p, dt), dt); else { /* un autre joueur : on avance sa dernière position */ p.s += p.v * dt; if (p.s >= KC.L) p.s -= KC.L; }
    // les caisses
    if (p.moi || p.bot) for (const cs of KC.caisses) if (cs.m.visible && Math.abs(p.s - cs.s) < 1.1 && Math.abs(p.d - cs.d) < 1.1) { cs.m.visible = false; cs.retour = now + 3500; if (!p.objet) { p.objet = tirerObjet(p); if (p.moi) { sonK("caisse"); majHUD(); } } }
    // l'arrivée
    if ((p.moi || p.bot) && !p.fini && p.tour >= KC.tours) { p.fini = now - KR.t0; if (p.moi) { envoyerWS({ t: "k_fin", temps: p.fini }); sonK("arrivee"); arriveeK(); } }
    majKart(p, dt); }
  for (const cs of KC.caisses) { if (!cs.m.visible && now > cs.retour) cs.m.visible = true; cs.m.rotation.y += dt * 1.5; cs.m.position.y = surPiste(cs.s, cs.d).y + .8 + Math.sin(t / 300 + cs.s) * .1; }
  if (!avant) majObjets(dt);
  // notre position, pour les autres (8 fois par seconde)
  if (KR.moi && t - KR.envoiT > 125 && !KR.solo) { KR.envoiT = t; const p = KR.moi; envoyerWS({ t: "k_pos", s: +p.s.toFixed(2), d: +p.d.toFixed(2), h: +p.h.toFixed(3), v: +p.v.toFixed(2), tour: p.tour, sp: p.spin > 0 ? 1 : 0, g: p.gyro > 0 ? 1 : 0 }); }
  // notre bonhomme (invisible) suit le kart : c'est lui que suivent la caméra du casque et la carte
  const moiG = M.gens.get(M.moiNum); if (moiG && KR.moi) { moiG.g.position.copy(KR.moi.K.g.position); moiG.g.visible = false; if (M.vr && M.rendu.xr.isPresenting) M.vr.cap = KR.moi.h + Math.PI; }
  cameraK(dt); majHUD(t); moteurK(KR.moi ? Math.abs(KR.moi.v) / KC.vmax : 0);
  if (KR.moi && KR.moi.fini && KR.pil.every(p => p.fini || (!p.bot && !p.moi && now - (p.vu || 0) > 8000)) && !KR.podium) podiumK(); }
const cv3 = new THREE.Vector3(), cv4 = new THREE.Vector3(), cv5 = new THREE.Vector3();
function cameraK(dt) { const p = KR.moi; if (!p || (M.rendu && M.rendu.xr.isPresenting)) return; const cam = M.camera, f = cv3.set(Math.sin(p.h), 0, Math.cos(p.h));
  const voulu = cv4.copy(p.K.g.position).addScaledVector(f, -5.6); voulu.y = Math.max(voulu.y + 2.5, surPiste(p.s - 5.6, p.d, cv5).y + 2.2);   /* (dans la descente : la piste, derrière, est plus haute que le kart ; la caméra reste au-dessus) */ const k = 1 - Math.exp(-dt * 7); cam.position.lerp(voulu, KR.camPrete ? k : 1); KR.camPrete = true;
  cam.lookAt(p.K.g.position.x + f.x * 4, p.K.g.position.y + 1, p.K.g.position.z + f.z * 4); cam.fov = 68 + Math.min(10, Math.max(0, p.v - 12)); cam.updateProjectionMatrix(); }

/* ---------- les autres joueurs (par le serveur) ---------- */
function recuK(m) { if (!M) return; const de = m.de;
  if (m.t === "k_annonce") { if (!KR.on) { KR.attente = { t0: m.t0, ids: m.ids || [de] }; if (M.lieu === "grande" && adminK()) bulle("🏁 Une course de karts part dans " + Math.max(1, Math.round((m.t0 - Date.now()) / 1000)) + " s : va sur la grille de départ pour la rejoindre !", 5000); } return; }
  if (m.t === "k_rejoint") { if (KR.attente && KR.attente.t0 === m.t0 && !KR.attente.ids.includes(de)) KR.attente.ids.push(de);
    if (KR.on && m.t0 === KR.t0 && !KR.humains.includes(de)) { KR.humains.push(de); if (Date.now() < KR.t0) placerGrille(); } return; }
  if (!KR.on) return; const p = KR.pil.find(q => q.id === de);
  if (m.t === "k_pos" && p) { p.s = m.s; p.d = m.d; p.h = m.h; p.v = m.v; p.tour = m.tour; p.prog = m.tour * KC.L + m.s; p.tourne = m.sp ? performance.now() / 70 : 0; p.gyro = m.g ? 1 : 0; p.vu = Date.now(); }
  else if (m.t === "k_obj" && m.o) poserObjet({ ...m.o, de, t: performance.now() });
  else if (m.t === "k_fin" && p) { p.fini = m.temps; }
  else if (m.t === "k_part" && p) { KC.scene.remove(p.K.g); KR.pil = KR.pil.filter(q => q !== p); } }

/* ---------- l'écran : tour, position, objet, chrono, boutons du téléphone ---------- */
function ouvrirHUD() { fermerHUD(); const d = document.createElement("div"); KR.hud = d;
  d.style.cssText = "position:absolute;inset:0;z-index:20;pointer-events:auto;touch-action:none;font-family:'Arial Black',Arial,sans-serif;color:#fff;text-shadow:0 2px 4px #000";
  const tactile = matchMedia("(pointer: coarse)").matches;
  d.innerHTML = `<div style="position:absolute;left:12px;top:44px;font-size:26px" id="kPos"></div><div style="position:absolute;left:12px;top:78px;font:700 16px Arial" id="kTour"></div>
    <div style="position:absolute;left:50%;top:38px;transform:translateX(-50%);width:60px;height:60px;border-radius:14px;background:rgba(0,0,0,.45);border:3px solid #ffd23a;display:grid;place-items:center;font-size:36px" id="kObj"></div>
    <div style="position:absolute;left:50%;top:10px;transform:translateX(-50%);font:700 18px 'Courier New',monospace" id="kChrono"></div>
    <div style="position:absolute;left:50%;top:36%;transform:translate(-50%,-50%);font-size:96px;color:#ffd23a" id="kDecompte"></div>
    <div style="position:absolute;inset:0;background:radial-gradient(circle,rgba(200,40,30,.2),rgba(200,40,30,.75));opacity:0;transition:opacity .4s" id="kFumee"></div>
    <button type="button" id="kQuitter" style="pointer-events:auto;position:absolute;left:12px;top:106px;border:0;border-radius:99px;padding:6px 12px;background:rgba(0,0,0,.55);color:#fff;font:700 13px Arial">✕ Quitter la course</button>
    ${tactile ? `<div style="position:absolute;left:10px;bottom:14px;display:flex;gap:10px;pointer-events:auto">
      <button type="button" data-k="g" style="width:74px;height:74px;border-radius:50%;border:3px solid rgba(255,255,255,.7);background:rgba(0,0,0,.4);color:#fff;font-size:32px">◀</button>
      <button type="button" data-k="d" style="width:74px;height:74px;border-radius:50%;border:3px solid rgba(255,255,255,.7);background:rgba(0,0,0,.4);color:#fff;font-size:32px">▶</button></div>
      <div style="position:absolute;right:10px;bottom:14px;display:flex;gap:10px;pointer-events:auto">
      <button type="button" data-k="frein" style="width:64px;height:64px;border-radius:50%;border:3px solid rgba(255,255,255,.7);background:rgba(160,30,30,.55);color:#fff;font:700 14px Arial">FREIN</button>
      <button type="button" data-k="obj" style="width:74px;height:74px;border-radius:50%;border:3px solid #ffd23a;background:rgba(0,0,0,.45);color:#ffd23a;font:700 15px Arial">OBJET</button></div>` : `<div style="position:absolute;left:12px;bottom:12px;font:700 13px Arial;opacity:.85">⬆ accélérer · ⬇ freiner · ⬅ ➡ tourner · Maj déraper · Espace objet</div>`}`;
  for (const b of d.querySelectorAll("[data-k]")) { const k = b.dataset.k, on = v => e => { e.preventDefault(); e.stopPropagation(); KT[k] = v; };
    b.addEventListener("pointerdown", on(1)); b.addEventListener("pointerup", on(0)); b.addEventListener("pointercancel", on(0)); b.addEventListener("pointerleave", on(0)); }
  d.querySelector("#kQuitter").onclick = e => { e.stopPropagation(); quitterCourse(); };
  for (const ev of ["pointerdown", "pointerup", "click", "touchstart", "wheel"]) d.addEventListener(ev, e => e.stopPropagation());
  M.ctx.conteneur.appendChild(d); majHUD(0); }
function fermerHUD() { if (KR.hud) { KR.hud.remove(); KR.hud = null; } if (M && M.manMenu && M.manMenu.d && M.manMenu.d.id === "kFin") M.manMenu = null; for (const k in KT) KT[k] = 0; const f = document.getElementById("kFin"); if (f) f.remove(); KR.podium = false; }
function majHUD(t) { const d = KR.hud, p = KR.moi; if (!d || !p) return; const now = Date.now(), q = d.querySelector.bind(d);
  const rang = classement().indexOf(p) + 1; q("#kPos").textContent = rang + (rang === 1 ? "er" : "e") + " / " + KR.pil.length;
  q("#kTour").textContent = "Tour " + Math.max(1, Math.min(KC.tours, p.tour + 1)) + " / " + KC.tours; q("#kObj").textContent = p.objet ? OBJETS_K[p.objet] : "";
  const ms = p.fini || Math.max(0, now - KR.t0); q("#kChrono").textContent = chronoK(ms);
  const r = Math.ceil((KR.t0 - now) / 1000); q("#kDecompte").textContent = r > 0 ? (r > 5 ? "" : r) : now - KR.t0 < 900 ? "GO !" : "";
  if (r > 5) q("#kDecompte").innerHTML = `<div style="font:700 22px Arial;text-align:center">Départ dans ${r} s<br><small style="font-size:15px">les autres peuvent encore rejoindre la grille</small></div>`;
  if (r > 0 && r <= 3 && KR.bipR !== r) { KR.bipR = r; sonK("bip"); } if (r <= 0 && KR.bipR !== 0) { KR.bipR = 0; sonK("go"); }
  q("#kFumee").style.opacity = p.fumee > 0 ? 1 : 0; }
const chronoK = ms => { const s = ms / 1000; return Math.floor(s / 60) + ":" + (s % 60).toFixed(2).padStart(5, "0"); };
function voileFumee() { sonK("fumi"); }
function arriveeK() { const p = KR.moi, rang = classement().indexOf(p) + 1; bulle(`🏁 Arrivée ! ${rang}${rang === 1 ? "er" : "e"} en ${chronoK(p.fini)}`, 4000);
  try { const r = JSON.parse(localStorage.getItem("karts-record") || "null"); if (!r || p.fini < r) { localStorage.setItem("karts-record", JSON.stringify(p.fini)); KR.record = true; } } catch (e) {} }
function podiumK() { KR.podium = true; const d = document.createElement("div"); d.id = "kFin";
  d.style.cssText = "position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:21;background:rgba(10,14,34,.94);border:3px solid #ffd23a;border-radius:16px;padding:16px 20px;color:#fff;font:16px Arial;min-width:260px;max-width:88%";
  const L2 = classement(); let rec = null; try { rec = JSON.parse(localStorage.getItem("karts-record") || "null"); } catch (e) {}
  d.innerHTML = `<div style="font:900 24px 'Arial Black',Arial;color:#ffd23a;text-align:center;margin-bottom:8px">🏆 CLASSEMENT</div>` +
    L2.map((p, i) => `<div style="display:flex;justify-content:space-between;gap:16px;padding:3px 0;${p.moi ? "color:#7ef0ff;font-weight:700" : ""}"><span>${["🥇", "🥈", "🥉"][i] || (i + 1) + "."} ${p.nom}</span><span style="font-family:'Courier New',monospace">${p.fini ? chronoK(p.fini) : "—"}</span></div>`).join("") +
    (rec ? `<div style="margin-top:8px;text-align:center;opacity:.85">Ton record : ${chronoK(rec)}${KR.record ? " — nouveau record !" : ""}</div>` : "") +
    `<div style="display:flex;gap:10px;justify-content:center;margin-top:12px"><button type="button" id="kRejouer" style="border:0;border-radius:99px;padding:9px 16px;background:#ffd23a;color:#14215a;font:900 15px Arial">Rejouer</button><button type="button" id="kSortir" style="border:0;border-radius:99px;padding:9px 16px;background:#3a3f55;color:#fff;font:700 15px Arial">Quitter</button></div>`;
  for (const ev of ["pointerdown", "click"]) d.addEventListener(ev, e => e.stopPropagation());
  M.ctx.conteneur.appendChild(d); M.manMenu = { d };
  d.querySelector("#kRejouer").onclick = () => { d.remove(); quitterCourse(); KR.attente = null; setTimeout(entrerCourse, 50); };
  d.querySelector("#kSortir").onclick = () => { d.remove(); quitterCourse(); }; }

/* ---------- les sons (sans fichier : le moteur, les bips, la sirène) ---------- */
let kAudio = null, kMoteur = null;
function audioK() { try { kAudio = kAudio || new (window.AudioContext || window.webkitAudioContext)(); if (kAudio.state === "suspended") kAudio.resume(); } catch (e) {} return kAudio; }
function moteurK(n) { const a = audioK(); if (!a) return;
  if (!kMoteur && n > 0) { const o = a.createOscillator(), o2 = a.createOscillator(), g = a.createGain(), f = a.createBiquadFilter(); o.type = "sawtooth"; o2.type = "square"; f.type = "lowpass"; f.frequency.value = 600; g.gain.value = 0; o.connect(f); o2.connect(f); f.connect(g); g.connect(a.destination); o.start(); o2.start(); kMoteur = { o, o2, g }; }
  if (!kMoteur) return; const f = 55 + n * 120; kMoteur.o.frequency.setTargetAtTime(f, a.currentTime, .05); kMoteur.o2.frequency.setTargetAtTime(f * .5, a.currentTime, .05); kMoteur.g.gain.setTargetAtTime(KR.on ? .035 + n * .03 : 0, a.currentTime, .1);
  if (!KR.on && n === 0) { try { kMoteur.o.stop(); kMoteur.o2.stop(); } catch (e) {} kMoteur = null; } }
function sonK(q) { const a = audioK(); if (!a) return; const t0 = a.currentTime + .01;
  const bip = (f, d, type = "square", v = .1, dt = 0) => { const o = a.createOscillator(), g = a.createGain(); o.type = type; o.frequency.setValueAtTime(f, t0 + dt); g.gain.setValueAtTime(v, t0 + dt); g.gain.exponentialRampToValueAtTime(.001, t0 + dt + d); o.connect(g); g.connect(a.destination); o.start(t0 + dt); o.stop(t0 + dt + d + .02); return o; };
  if (q === "bip") bip(660, .25); else if (q === "go") bip(1320, .6);
  else if (q === "caisse") { bip(880, .08, "square", .08); bip(1175, .08, "square", .08, .08); bip(1568, .12, "square", .08, .16); }
  else if (q === "aie") { const o = bip(400, .6, "sawtooth", .12); o.frequency.exponentialRampToValueAtTime(80, t0 + .6); }
  else if (q === "glisse") { const o = bip(900, .5, "triangle", .08); o.frequency.exponentialRampToValueAtTime(300, t0 + .5); }
  else if (q === "turbo") { const o = bip(200, .7, "sawtooth", .1); o.frequency.exponentialRampToValueAtTime(900, t0 + .7); }
  else if (q === "fumi") { const b = a.createBuffer(1, a.sampleRate * .6, a.sampleRate), c = b.getChannelData(0); for (let i = 0; i < c.length; i++) c[i] = (Math.random() * 2 - 1) * (1 - i / c.length); const s = a.createBufferSource(), g = a.createGain(); g.gain.value = .15; s.buffer = b; s.connect(g); g.connect(a.destination); s.start(); }
  else if (q === "arrivee") [523, 659, 784, 1047].forEach((f, i) => bip(f, .25, "square", .08, i * .14));
  else bip(520, .1, "triangle", .06); }
function sireneK() { const a = audioK(); if (!a) return; const o = a.createOscillator(), g = a.createGain(), t0 = a.currentTime; o.type = "square"; g.gain.value = .05;
  for (let i = 0; i < 12; i++) o.frequency.setValueAtTime(i % 2 ? 640 : 960, t0 + i * .5); g.gain.setValueAtTime(.05, t0 + 5.6); g.gain.linearRampToValueAtTime(0, t0 + 6); o.connect(g); g.connect(a.destination); o.start(); o.stop(t0 + 6.1); }

/* la grille de départ : on vient la chercher dans la cour d'honneur, devant un garage (un panneau et un cercle l'indiquent) ; la course elle-même part du fond de la caserne */
const GRILLE_K = [-9.9, -9.8];   // (devant le garage du milieu, à gauche en regardant l'horloge : un cercle au sol devant le car de la Gendarmerie)
const adminK = () => !!(M && M.ctx && M.ctx.moiInfo && M.ctx.moiInfo().admin);   // (pour l'instant : l'administrateur seul)
const presGrille = (x, z) => adminK() && Math.hypot(x - GRILLE_K[0], z - GRILLE_K[1]) < 2;
// (pendant la course, les voitures garées sur le circuit s'effacent ; elles reviennent après)
function cacherVoitures(on) { if (!on) { for (const o of KR.cachees || []) o.visible = true; KR.cachees = null; return; } if (!M || !M.L || !M.scene) return;
  const R = (M.L.voitures || []).filter(([a, b, c, d]) => { const x = (a + b) / 2, z = (c + d) / 2, r = Math.hypot(b - a, d - c) / 2;
    for (let i = 0; i < KC.N; i += 2) { const q = KC.pts[i]; if (q.y < 1.5 && Math.hypot(q.x - x, q.z - z) < KC.lar[i] / 2 + r + .2) return true; } return false; });
  if (!R.length) return; KR.cachees = []; const sp = new THREE.Sphere();
  for (const o of M.scene.children) { if (o === KC.G || !(o.isMesh || o.isGroup) || !o.visible || o.userData.avatar) continue; if (o.isMesh) { if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere(); sp.copy(o.geometry.boundingSphere).applyMatrix4(o.matrixWorld); } else new THREE.Box3().setFromObject(o).getBoundingSphere(sp);
    if (sp.radius > 3 || sp.center.y > 2.4) continue; if (R.some(([a, b, c, d]) => sp.center.x > a - .3 && sp.center.x < b + .3 && sp.center.z > c - .3 && sp.center.z < d + .3)) { o.visible = false; KR.cachees.push(o); } } }
// (dans la cour d'honneur : le panneau de la grille de départ)
function decorCourse() { if (KR.on && M && M.lieu !== "grande") quitterCourse(); if (!M || M.lieu !== "grande" || (M.L && (M.L.apo || M.L.sh)) || !adminK()) return; if (KC.pan && KC.pan.parent === M.scene) return;
  const g = new THREE.Group(); g.position.set(GRILLE_K[0] + 2.4, 0, GRILLE_K[1] + 1.4); const fer = new THREE.MeshStandardMaterial({ color: 0x24262c, metalness: .5, roughness: .4 });
  const mat = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, 2.2, 8), fer); mat.position.y = 1.1; g.add(mat);
  const c = toile(512, 256, x => { x.fillStyle = "#14234a"; x.fillRect(0, 0, 512, 256); for (let i = 0; i < 16; i++) { x.fillStyle = i % 2 ? "#111" : "#f4f4f4"; x.fillRect(i * 32, 0, 32, 22); x.fillRect(i * 32 + (i % 2 ? -32 : 32) * 0, 234, 32, 22); }
    x.fillStyle = "#ffd23a"; x.font = "900 54px Arial Black,Arial"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("🏁 KARTS", 256, 92); x.fillStyle = "#fff"; x.font = "700 30px Arial"; x.fillText("Les 24 tours de la caserne", 256, 150); x.font = "700 24px Arial"; x.fillStyle = "#cfe3ff"; x.fillText("Viens ici pour courir", 256, 196); });
  const m = new THREE.MeshBasicMaterial({ map: tex(c) }), pan = new THREE.Mesh(new THREE.BoxGeometry(1.7, .85, .05), [fer, fer, fer, fer, m, m]); pan.position.y = 2.6; g.add(pan);
  const rond = new THREE.Mesh(new THREE.RingGeometry(1.6, 2, 40), new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: .55, depthWrite: false })); rond.rotation.x = -Math.PI / 2;
  { const [x0, z0] = GRILLE_K, h = (x, z) => { try { return M.L.hauteur ? M.L.hauteur(x, z, { g: { position: { x, y: 0, z } }, info: {} }) || 0 : 0; } catch (e) { return 0; } }; let y = 0; for (const [a, b] of [[0, 0], [2, 0], [-2, 0], [0, 2], [0, -2]]) y = Math.max(y, h(x0 + a, z0 + b)); rond.position.set(-2.4, y + .03, -1.4); }   // (le cercle passe sur le trottoir : posé à la hauteur du plus haut) g.add(rond);
  M.scene.add(g); KC.pan = g; }

KR.KC = KC; KR.capPiste = capPiste;   // (pour les essais)
({ entrerCourse, quitterCourse, majCourse, recuK, presGrille, decorCourse, KR });
