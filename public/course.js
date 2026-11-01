/* Les 24 tours de la caserne : une course de karts à travers toute la caserne.
   Le départ est donné dans la grande cour du fond, sur l'allée de droite. On fait le tour des bâtiments du milieu (l'allée de droite, la cour du fond,
   l'allée de gauche), on revient dans la troisième cour, on passe sous le porche, on traverse la deuxième cour, on passe sous l'horloge,
   et dans la cour d'honneur on monte par une rampe sur le toit de gauche (la terrasse : parasols, tables, transats), on traverse la cour
   par un pont devant le bâtiment de l'horloge, on longe le toit de droite, on redescend par l'autre rampe et l'on repart sous les porches.
   Sous les porches, deux voies séparées : celle qui va vers le fond, celle qui revient.
   Deux tours ; des caisses de bonus : la peau de banane, la flaque d'huile, le fumigène, la boule de pétanque, le gyrophare, le turbo.
   Seul : contre quatre karts de la caserne. À plusieurs : ceux qui viennent à la grille de départ (dans la cour d'honneur) pendant le compte à rebours courent ensemble.
   Ce fichier n'est pas un module : la matrice le charge et l'exécute chez elle (eval direct) ; il se sert de M, THREE, tex, toile, envoyerWS… */

const KC = { L: 0, pts: null, N: 0, pas: .5, tours: 2, vmax: 16, grilleT: 12000, ech: .46 };   // (ech : les karts et leurs pilotes, en plus petit — la piste est étroite sous les porches et dans les allées)
const EK = KC.ech;
/* le tracé : des points de passage (x, hauteur, z, largeur de la piste), reliés par une courbe douce */
const VP = 2.3, VA = 3.7, VC = 5;   // (les largeurs : une voie sous les porches, les allées autour des bâtiments, la cour d'honneur et les toits)
const TRACE_K = [
  // l'allée de droite, dans la grande cour du fond (le départ), puis la cour du fond, l'allée de gauche
  [18.3, -.16, -90, VA], [18.3, -.42, -100, VA], [18.3, -.68, -110, VA], [18, -.98, -120, VA], [15.5, -1.1, -125.4, VA], [8, -1.13, -126.6, VA], [-3, -1.13, -126.6, VA],
  // (par-dessus le local poubelle, au coin de l'allée de gauche : une rampe monte sur son toit, et redescend dans l'allée)
  [-9, -.2, -126.6, VA], [-14.5, 1.75, -126, VA], [-17.8, 2.05, -121.5, VA], [-18, 2.05, -116, VA], [-18, 1.2, -110.5, VA], [-18, .1, -105, VA], [-18, 0, -96, VA], [-18, 0, -84, VA], [-17.5, 0, -72.5, VA],
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
/* les pilotes qu'on peut choisir : son propre bonhomme, ou un personnage de la caserne (ce sont aussi les adversaires, quand on court seul) */
const PERSOS_K = [
  { id: "moi", nom: "Mon bonhomme" },
  // (des personnages dessinés pour la caserne, façon dessin animé)
  { id: "gendarme", nom: "Le gendarme Moustache", url: "images/karts/gendarme.png", combi: "#1c2a6a" },
  { id: "cantiniere", nom: "La cantinière", url: "images/karts/cantiniere.png", combi: "#f4f4f4" },
  { id: "pigeon", nom: "Le pigeon de la cour", url: "images/karts/pigeon.png", combi: "#7a8090" },
  { id: "gargouille", nom: "La gargouille", url: "images/karts/gargouille.png", combi: "#4a4e5a" },
  { id: "chat", nom: "Le chat de gouttière", url: "images/karts/chat.png", combi: "#d8701e" },
  { id: "mamie", nom: "La mamie du 3e", url: "images/karts/mamie.png", combi: "#c84a7a" },
  { id: "clairon", nom: "Le clairon", url: "images/karts/clairon.png", combi: "#2a5a2a" },
  { id: "pave", nom: "Le pavé de la cour", url: "images/karts/pave.png", combi: "#5a564e" }];
const persoK = id => PERSOS_K.find(q => q.id === id) || PERSOS_K[0];
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
  // les LED : une bande de lumière sur le haut des murets, de toutes les couleurs, qui défile (on la fait avancer à chaque image) ; un halo autour
  KC.ledTex = tex(toile(512, 8, x => { const C = ["#ff2a6a", "#ff9a1a", "#ffe23a", "#3aff7a", "#2ad8ff", "#5a6aff", "#c03aff"]; for (let i = 0; i < 64; i++) { x.fillStyle = C[i % C.length]; x.fillRect(i * 8, 0, 6, 8); } })); KC.ledTex.wrapS = THREE.RepeatWrapping;
  const ledM = new THREE.MeshBasicMaterial({ map: KC.ledTex, side: THREE.DoubleSide }), haloT = tex(toile(8, 64, x => { const gr = x.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(.5, "rgba(255,255,255,.55)"); gr.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = gr; x.fillRect(0, 0, 8, 64); }));
  const haloM = new THREE.MeshBasicMaterial({ map: KC.ledTex, alphaMap: haloT, transparent: true, opacity: .3, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  for (const sd of [-1, 1]) { const pl2 = [], u4 = [], i4 = [], ph = [], uh = [], ih = []; let n0 = 0;
    for (let i = 0; i <= N; i++) { const k = i % N, p = KC.pts[k], n = KC.nor[k], W = LA[k], hm = p.y > .4 ? .9 : .55, e = W / 2 + .1, x = p.x + n.x * e * sd, z = p.z + n.z * e * sd, y = p.y + hm, u = i * KC.pas / 4;
      pl2.push(x, y - .02, z, x, y + .045, z); u4.push(u, 0, u, 1); ph.push(x, y - .12, z, x, y + .16, z); uh.push(u, 0, u, 1);
      if (i < N) { const a = n0; i4.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); ih.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); } n0 += 2; }
    const mk = (P, U, I, m) => { const g4 = new THREE.BufferGeometry(); g4.setAttribute("position", new THREE.Float32BufferAttribute(P, 3)); g4.setAttribute("uv", new THREE.Float32BufferAttribute(U, 2)); g4.setIndex(I); const me = new THREE.Mesh(g4, m); me.frustumCulled = false; G.add(me); return me; };
    mk(pl2, u4, i4, ledM); mk(ph, uh, ih, haloM); }
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
  // les plaques turbo : des flèches jaunes au sol, sur les lignes droites
  KC.boosts = []; const tb = tex(toile(128, 256, x => { x.fillStyle = "#1a1a1a"; x.fillRect(0, 0, 128, 256); for (let i = 0; i < 3; i++) { const y = 200 - i * 80; const gr = x.createLinearGradient(0, y, 0, y - 60); gr.addColorStop(0, "#ff8a00"); gr.addColorStop(1, "#ffe24a"); x.fillStyle = gr; x.beginPath(); x.moveTo(10, y); x.lineTo(64, y - 60); x.lineTo(118, y); x.lineTo(118, y + 22); x.lineTo(64, y - 36); x.lineTo(10, y + 22); x.closePath(); x.fill(); } }));
  for (const [x, y, z] of [[18.3, -.3, -95], [0, -1.13, -126.6], [0, 8.1, -14.7], [-18, 0, -88]]) { const s0 = auPoint(x, z, y), W = largeur(s0), q = surPiste(s0, 0), m = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(2.2, W - .6), 2.4), new THREE.MeshBasicMaterial({ map: tb, transparent: true, opacity: .95, polygonOffset: true, polygonOffsetFactor: -6 }));
    m.rotation.order = "YXZ"; m.rotation.set(-Math.PI / 2, capPiste(s0) + Math.PI, 0);   /* (les flèches dans le sens de la course) */ m.position.set(q.x, q.y + .08, q.z); G.add(m); KC.boosts.push({ s: s0, w: Math.min(2.2, W - .6), m }); }
  scene.add(G); KC.G = G; return G; }

/* ---------- les karts ---------- */
/* le kart, comme un vrai kart de compétition : le châssis en tubes chromés, le plancher, les pontons et le carénage avant à la couleur de l'équipe,
   la plaque à numéro, le baquet, le moteur sur le côté et son pot, les pneus slicks (plus larges derrière) sur des jantes alu ;
   le pilote assis, les jambes allongées dans le nez, les bras au volant */
let numKart = 0;
function fabriquerKart(couleur, nom) { const g = new THREE.Group(), num = ++numKart;
  const c = new THREE.MeshStandardMaterial({ color: couleur, roughness: .28, metalness: .35 }), noir = new THREE.MeshStandardMaterial({ color: 0x141414, roughness: .85 }),
    chrome = new THREE.MeshStandardMaterial({ color: 0xd8dde3, roughness: .18, metalness: .95 }), alu = new THREE.MeshStandardMaterial({ color: 0xb9bec6, roughness: .3, metalness: .85 }),
    gomme = new THREE.MeshStandardMaterial({ color: 0x1b1b1d, roughness: .95 }), blanc = new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: .4 });
  const ajout = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); g.add(m); return m; };
  const tube = (x1, y1, z1, x2, y2, z2, r = .028, mat = chrome) => { const a2 = new THREE.Vector3(x1, y1, z1), b2 = new THREE.Vector3(x2, y2, z2), L = a2.distanceTo(b2), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, L, 8), mat);
    m.position.copy(a2).add(b2).multiplyScalar(.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b2.clone().sub(a2).normalize()); g.add(m); return m; };
  // le châssis : deux longerons, des traverses, le plancher
  for (const sx of [-.32, .32]) tube(sx, .2, -.85, sx, .2, .95);
  tube(-.32, .2, .95, .32, .2, .95); tube(-.62, .22, -.7, .62, .22, -.7, .035); tube(-.58, .2, .72, .58, .2, .72); tube(-.32, .2, -.2, .32, .2, -.2);
  ajout(new THREE.BoxGeometry(.62, .025, 1.5), noir, 0, .19, .1);
  // les pontons (à la couleur de l'équipe) et le pare-chocs arrière
  for (const sx of [-1, 1]) { const pt = ajout(new THREE.CapsuleGeometry(.12, .72, 4, 12), c, sx * .52, .28, -.02, Math.PI / 2, 0, 0); pt.scale.set(1.45, 1, .9);
    const num2 = toile(128, 80, x => { x.fillStyle = "#fff"; x.beginPath(); x.ellipse(64, 40, 58, 36, 0, 0, 7); x.fill(); x.fillStyle = "#111"; x.font = "900 54px Arial Black,Arial"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(String(num), 64, 44); });
    ajout(new THREE.PlaneGeometry(.3, .19), new THREE.MeshStandardMaterial({ map: tex(num2), transparent: true, roughness: .4, polygonOffset: true, polygonOffsetFactor: -2 }), sx * .7, .3, -.05, 0, sx * Math.PI / 2, 0); }
  tube(-.55, .3, -1.08, .55, .3, -1.08, .05, c); tube(-.42, .24, 1.3, .42, .24, 1.3, .035, chrome); for (const sx of [-.4, .4]) tube(sx, .3, -1.08, sx, .22, -.72, .03, noir);
  // le carénage avant (le nez), le spoiler, la plaque à numéro
  const nez = ajout(new THREE.CapsuleGeometry(.2, .45, 4, 12), c, 0, .3, 1.02, Math.PI / 2, 0, 0); nez.scale.set(1.9, 1, .7);
  ajout(new THREE.BoxGeometry(1.05, .07, .16), c, 0, .2, 1.32);
  const auto = toile(256, 64, x => { x.fillStyle = "#14234a"; x.beginPath(); x.roundRect(0, 0, 256, 64, 12); x.fill(); x.fillStyle = "#ffd23a"; x.font = "900 34px Arial Black,Arial"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("CASERNE NF", 128, 34); });
  ajout(new THREE.PlaneGeometry(.36, .09), new THREE.MeshStandardMaterial({ map: tex(auto), roughness: .4, polygonOffset: true, polygonOffsetFactor: -2 }), 0, .45, .86, -Math.PI / 2 + .35, 0, 0);
  const pl = toile(128, 96, x => { x.fillStyle = "#fff"; x.beginPath(); x.roundRect(2, 2, 124, 92, 14); x.fill(); x.fillStyle = "#111"; x.font = "900 70px Arial Black,Arial"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(String(num), 64, 52); });
  const plaque = ajout(new THREE.PlaneGeometry(.34, .25), new THREE.MeshStandardMaterial({ map: tex(pl), roughness: .5 }), 0, .44, 1.13, -.55, 0, 0);
  // le baquet, la colonne de direction, le volant
  ajout(new THREE.BoxGeometry(.44, .08, .42), noir, 0, .3, -.38); const dos = ajout(new THREE.BoxGeometry(.44, .5, .07), noir, 0, .55, -.6, -.28, 0, 0);
  tube(0, .26, .75, 0, .62, .36, .022, alu);
  const volant = ajout(new THREE.TorusGeometry(.15, .025, 8, 20), new THREE.MeshStandardMaterial({ color: 0x222222, roughness: .5 }), 0, .66, .3, -1.05, 0, 0);
  // le moteur (à droite, derrière le baquet), son carter, le pot d'échappement
  ajout(new THREE.BoxGeometry(.28, .26, .3), alu, .48, .4, -.55); ajout(new THREE.CylinderGeometry(.11, .11, .16, 12), noir, .48, .58, -.55);
  const potT = tube(.5, .36, -.72, .2, .4, -1.05, .035, chrome);
  // les roues : pneus slicks, jantes alu (elles tournent avec le pneu), plus larges derrière
  const roues = [], pivots = []; for (const [x, z, r, l] of [[-.6, .72, .23, .2], [.6, .72, .23, .2], [-.66, -.7, .27, .3], [.66, -.7, .27, .3]]) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(r, r, l, 22), gomme); w.rotation.z = Math.PI / 2;
    const jante = new THREE.Mesh(new THREE.CylinderGeometry(r * .6, r * .6, l + .012, 16), alu); w.add(jante);
    for (let k = 0; k < 3; k++) { const rayon = new THREE.Mesh(new THREE.BoxGeometry(r * 1.1, l + .02, .03), alu); rayon.rotation.y = k * Math.PI / 3; w.add(rayon); }
    if (z > 0) { const pv = new THREE.Group(); pv.position.set(x, r, z); pv.add(w); g.add(pv); pivots.push(pv); } else { w.position.set(x, r, z); g.add(w); } roues.push(w); }
  // les étincelles du dérapage (bleues, puis orange), sous les roues arrière ; la flamme du turbo, au pot d'échappement
  const etin = [-.66, .66].map(x => { const sp2 = new THREE.Sprite(new THREE.SpriteMaterial({ map: texEtincelle(), color: 0x6ab8ff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); sp2.position.set(x, .12, -.95); sp2.scale.setScalar(.5); sp2.visible = false; g.add(sp2); return sp2; });
  const flamme = new THREE.Mesh(new THREE.ConeGeometry(.12, .6, 10), new THREE.MeshBasicMaterial({ color: 0xffa020, transparent: true, opacity: .85, depthWrite: false, blending: THREE.AdditiveBlending })); flamme.rotation.x = -Math.PI / 2; flamme.position.set(.18, .4, -1.38); flamme.visible = false; g.add(flamme);
  // les phares (deux petites lampes blanches devant), le néon sous le kart (à sa couleur), les feux arrière
  const phareM = new THREE.MeshBasicMaterial({ color: 0xfff6dd }); for (const sx of [-.16, .16]) ajout(new THREE.SphereGeometry(.045, 10, 8), phareM, sx, .4, 1.2);
  const rougeM = new THREE.MeshBasicMaterial({ color: 0xff2020 }); for (const sx of [-.4, .4]) ajout(new THREE.BoxGeometry(.1, .05, .02), rougeM, sx, .34, -1.13);
  const neon = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 2.6), new THREE.MeshBasicMaterial({ map: texNeon(), color: couleur, transparent: true, opacity: .9, blending: THREE.AdditiveBlending, depthWrite: false })); neon.rotation.x = -Math.PI / 2; neon.position.y = .03; g.add(neon);
  // le pilote : la combinaison (à la couleur de son bonhomme), les bras au volant, les jambes dans le nez ; le casque s'il n'a pas de photo
  const combi = new THREE.MeshStandardMaterial({ color: 0x1d2a44, roughness: .7 });
  const corps = ajout(new THREE.CapsuleGeometry(.19, .32, 4, 12), combi, 0, .74, -.36, -.22, 0, 0);
  for (const sx of [-1, 1]) { const bras = new THREE.Mesh(new THREE.CapsuleGeometry(.055, .36, 4, 8), combi); const a2 = new THREE.Vector3(sx * .2, .88, -.3), b2 = new THREE.Vector3(sx * .13, .68, .26);
    bras.position.copy(a2).add(b2).multiplyScalar(.5); bras.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b2.clone().sub(a2).normalize()); g.add(bras);
    const gant = ajout(new THREE.SphereGeometry(.06, 8, 6), noir, sx * .13, .68, .28);
    const jambe = new THREE.Mesh(new THREE.CapsuleGeometry(.07, .62, 4, 8), combi); jambe.rotation.x = Math.PI / 2 - .12; jambe.position.set(sx * .12, .38, .3); g.add(jambe); }
  const casque = ajout(new THREE.SphereGeometry(.22, 18, 14), new THREE.MeshStandardMaterial({ color: couleur, roughness: .15, metalness: .25 }), 0, 1.18, -.34);
  const vis = ajout(new THREE.SphereGeometry(.18, 14, 8, -Math.PI / 2, Math.PI, Math.PI / 3, Math.PI / 3), new THREE.MeshStandardMaterial({ color: 0x111111, roughness: .05, metalness: .7 }), 0, 1.18, -.28, 0, Math.PI, 0);
  // son nom au-dessus
  const et = toile(256, 48, x => { x.fillStyle = "rgba(0,0,0,.55)"; x.beginPath(); x.roundRect(0, 0, 256, 48, 14); x.fill(); x.fillStyle = "#fff"; x.font = "700 26px Arial"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(nom.slice(0, 18), 128, 25); });
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex(et), depthTest: false })); sp.scale.set(1.3 / EK * .8, .25 / EK * .8, 1); sp.position.y = 2.3; sp.renderOrder = 5; g.add(sp);
  // le gyrophare (allumé quand il est invincible)
  const gy = new THREE.Mesh(new THREE.SphereGeometry(.14, 10, 8), new THREE.MeshBasicMaterial({ color: 0x2a5cff })); gy.position.set(0, 1.78, -.34); gy.visible = false; g.add(gy);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  const corpsK = new THREE.Group(); for (const o of [...g.children]) if (!roues.includes(o) && !pivots.includes(o) && !etin.includes(o) && o !== sp && o.material !== undefined && !(o.material && o.material.map === texNe)) corpsK.add(o); g.add(corpsK);
  return { g, roues, pivots, etin, flamme, corpsK, gy, casque, vis, corps, et: sp, coul: couleur }; }
let texNe = null; function texNeon() { return texNe = texNe || tex(toile(64, 128, x => { const gr = x.createRadialGradient(32, 64, 4, 32, 64, 60); gr.addColorStop(0, "rgba(255,255,255,.9)"); gr.addColorStop(.5, "rgba(255,255,255,.35)"); gr.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = gr; x.scale(1, 2); x.fillRect(0, 0, 64, 64); })); }
let texEt = null; function texEtincelle() { return texEt = texEt || tex(toile(64, 64, x => { const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(.3, "rgba(255,255,255,.8)"); gr.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
  x.strokeStyle = "rgba(255,255,255,.9)"; x.lineWidth = 3; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; x.beginPath(); x.moveTo(32, 32); x.lineTo(32 + Math.cos(a) * 30, 32 + Math.sin(a) * 30); x.stroke(); } })); }
// (la tête du pilote : la photo du bonhomme, à la place du casque ; sans photo, on garde le casque)
/* la tête du pilote : la photo détourée, posée sur les épaules (elle fait face à la caméra), en grand comme dans les jeux de karts */
function mettreTete(K, P) { if (!P) return; if (P.couleur) K.corps.material.color.set(P.couleur);   // (la combinaison)
  chargerTete(P.numero, P.tete_v, P.teteUrl).then(img => { if (!img || !img.width || !K.g.parent) return;
  const c = toile(img.width, img.height, x => x.drawImage(img, 0, 0)), h = 1.05, sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex(c), transparent: true, alphaTest: .05 }));
  sp.scale.set(h * img.width / img.height, h, 1); sp.position.set(0, 1.0 + h / 2 - .1, -.34); sp.renderOrder = 2; K.corpsK.add(sp); K.tete = sp; K.casque.visible = K.vis.visible = false; }).catch(() => {}); }
function nouveauPilote(o) { const K = fabriquerKart(o.couleur, o.nom); K.g.scale.setScalar(EK); KC.scene.add(K.g); mettreTete(K, o.tete);
  return { id: o.id, nom: o.nom, bot: !!o.bot, humain: !!o.humain, moi: !!o.moi, K, s: o.s, d: o.d, h: capPiste(o.s), v: 0, tour: -1, prog: o.s - KC.L, fini: 0, spin: 0, glisse: 0, gyro: 0, turbo: 0, fumee: 0, objet: null, voie: o.d, bv: .86 + Math.random() * .1 }; }

/* ---------- la course : l'état, la grille, le compte à rebours ---------- */
const KR = { on: false, pil: [], moi: null, t0: 0, objets: [], obs: [], fin: [], hud: null, dern: 0, envoiT: 0, solo: true, attente: null };
function grilleK(n) { const r = Math.floor(n / 2), c = n % 2, s = KC.L - 2 - r * 1.8, e = Math.min(.7, largeur(s) / 2 - .5); return { s, d: c ? e : -e }; }
// (entrer sur la grille : on rejoint une course annoncée il y a peu ; sinon on en lance une)
function entrerCourse() { if (KR.on || KR.choixEl || !M || M.lieu !== "grande" || !adminK()) return; choisirPilote(id => { KR.perso = id; lancerCourse(); }); }
/* l'écran du choix du pilote : son bonhomme, ou un personnage de la caserne */
function choisirPilote(fin) { const d = document.createElement("div"); KR.choixEl = d; let pris = null; try { pris = localStorage.getItem("karts-perso"); } catch (e) {}
  d.style.cssText = "position:absolute;inset:0;z-index:22;background:radial-gradient(circle at 50% 30%,rgba(30,50,110,.92),rgba(6,10,26,.97));color:#fff;font-family:Arial,sans-serif;overflow:auto;padding:16px 12px;box-sizing:border-box";
  d.innerHTML = `<div style="text-align:center;font:900 26px 'Arial Black',Arial;color:#ffd23a;margin:4px 0 2px">🏁 CHOISIS TON PILOTE</div><div style="text-align:center;font-size:13px;opacity:.8;margin-bottom:12px">Les autres seront tes adversaires</div>
    <div id="kGrille" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(104px,1fr));gap:10px;max-width:760px;margin:0 auto"></div>
    <div style="text-align:center;margin-top:14px"><button type="button" id="kChoixAnnuler" style="border:0;border-radius:99px;padding:8px 18px;background:#3a3f55;color:#fff;font:700 14px Arial">Annuler</button></div>`;
  const G = d.querySelector("#kGrille"), moi = M.gens.get(M.moiNum);
  for (const q of PERSOS_K) { const b = document.createElement("button"); b.type = "button"; b.dataset.id = q.id;
    b.style.cssText = `border:3px solid ${q.id === (pris || "moi") ? "#ffd23a" : "rgba(255,255,255,.25)"};border-radius:14px;background:rgba(255,255,255,.08);color:#fff;padding:8px 4px 6px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px;font:700 12px Arial`;
    b.innerHTML = `<div style="height:84px;display:flex;align-items:flex-end"><img alt="" style="max-height:84px;max-width:92px;object-fit:contain"></div><span>${q.nom}</span>`;
    const im = b.querySelector("img"); if (q.url) im.src = q.url; else if (moi && moi.info) chargerTete(moi.info.numero, moi.info.tete_v, moi.info.teteUrl).then(i => { if (i) im.src = i.src; else im.replaceWith(Object.assign(document.createElement("div"), { textContent: "🧑", style: "font-size:56px" })); }).catch(() => {});
    b.onclick = e => { e.stopPropagation(); try { localStorage.setItem("karts-perso", q.id); } catch (er) {} d.remove(); KR.choixEl = null; fin(q.id); }; G.appendChild(b); }
  d.querySelector("#kChoixAnnuler").onclick = e => { e.stopPropagation(); d.remove(); KR.choixEl = null; };
  for (const ev of ["pointerdown", "click", "touchstart", "wheel"]) d.addEventListener(ev, e => e.stopPropagation());
  M.ctx.conteneur.appendChild(d); }
function lancerCourse() { if (KR.on || !M || M.lieu !== "grande") return; KC.scene = M.scene; if (!KC.G || KC.G.parent !== M.scene) construirePisteK(M.scene); cacherVoitures(true); KC.scene = M.scene; if (!KC.G || KC.G.parent !== M.scene) construirePisteK(M.scene); cacherVoitures(true);
  const moi = M.gens.get(M.moiNum); const ann = KR.attente && KR.attente.t0 > Date.now() + 1500 ? KR.attente : null;
  const t0 = ann ? ann.t0 : Date.now() + KC.grilleT; KR.t0 = t0; KR.on = true; KR.fin = []; KR.objets = []; KR.obs = [];
  KR.humains = ann ? [...ann.ids] : []; if (!KR.humains.includes(M.moiNum)) KR.humains.push(M.moiNum);
  KR.persos = Object.assign(ann && ann.persos ? { ...ann.persos } : {}, { [M.moiNum]: KR.perso || "moi" });
  if (!ann) envoyerWS({ t: "k_annonce", t0, ids: KR.humains, perso: KR.perso || "moi" }); else envoyerWS({ t: "k_rejoint", t0, perso: KR.perso || "moi" });
  KR.moiInfo = { id: M.moiNum, nom: (moi && moi.info && moi.info.nom ? moi.info.nom.split(" ")[0] : "Moi"), couleur: COULEURS_K[(Number(M.moiNum) || 0) % COULEURS_K.length] };
  if (moi) { KR.moiPos = moi.g.position.clone(); moi.cible = null; moi.chemin = []; moi.g.visible = false; }
  M.course = KR; KR.passer = false; ouvrirHUD(); placerGrille(); bulle(null); nuitK(true);
  // la cinématique d'ouverture : la caméra survole tout le circuit, de haut, et vient se poser derrière notre kart sur la grille
  const D = Math.min(9500, t0 - Date.now() - 2600); KR.intro = D > 3000 ? { t: performance.now(), D } : null; KR.camPrete = false; }
function placerGrille() { for (const p of KR.pil) KC.scene.remove(p.K.g); KR.pil = [];
  const hs = [...KR.humains].sort((a, b) => a - b); KR.solo = hs.length <= 1;
  hs.forEach((id, i) => { const g = grilleK(i), moi = id === M.moiNum, P = M.gens.get(id), nom = moi ? KR.moiInfo.nom : (P && P.info && P.info.nom ? P.info.nom.split(" ")[0] : "Joueur");
    if (P && !moi) { P.g.visible = false; KR.caches = KR.caches || new Set(); KR.caches.add(P); }
    const q = persoK((KR.persos || {})[id]);
    const inf = q.url ? { teteUrl: q.url, couleur: q.combi } : P && P.info ? { numero: P.info.numero ?? id, tete_v: P.info.tete_v, teteUrl: P.info.teteUrl, couleur: P.info.couleur } : null;
    const p = nouveauPilote({ id, nom, moi, humain: true, tete: inf, couleur: COULEURS_K[(Number(id) || 0) % COULEURS_K.length], ...g }); KR.pil.push(p); if (moi) KR.moi = p; });
  if (KR.moi) { const L2 = new THREE.SpotLight(0xfff0d0, 40, 26, .55, .6, 1.4), cible = new THREE.Object3D(); L2.position.set(0, .6, 1.3); cible.position.set(0, -.5, 12); KR.moi.K.g.add(L2, cible); L2.target = cible; }
  if (KR.solo) { const dispo = PERSOS_K.filter(q => q.url && q.id !== KR.perso).sort(() => Math.random() - .5).slice(0, 4);
    dispo.forEach((q, i) => { const g = grilleK(hs.length + i); KR.pil.push(nouveauPilote({ id: "b" + i, nom: q.nom, bot: true, tete: { teteUrl: q.url, couleur: q.combi }, couleur: COULEURS_K[(i + 3) % COULEURS_K.length], ...g })); }); }
  for (const p of KR.pil) majKart(p, 0); }
/* la nuit, pendant la course : le clair de lune de la caserne ; les LED des murets et les phares font le reste */
function nuitK(on) { if (!M || !M.L || !M.L.setNuit) return; if (on) { if (KR.nuitAvant === undefined) KR.nuitAvant = !!M.L.nuit; M.L.setNuit(true); }
  else if (KR.nuitAvant !== undefined) { M.L.setNuit(KR.nuitAvant); KR.nuitAvant = undefined; } }
function quitterCourse() { if (!KR.on) return; KR.on = false; for (const p of KR.pil) KC.scene && KC.scene.remove(p.K.g); for (const o of KR.objets) o.m && o.m.parent && o.m.parent.remove(o.m); KR.pil = []; KR.objets = [];
  if (KC.G && KC.G.parent) KC.G.parent.remove(KC.G); cacherVoitures(false);
  for (const P of KR.caches || []) P.g.visible = true; KR.caches = null;
  const moi = M && M.gens.get(M.moiNum); if (moi) { moi.g.visible = true; if (KR.moiPos) moi.g.position.copy(KR.moiPos); }
  finCeremonie(); nuitK(false); envoyerWS({ t: "k_part" }); if (M) M.course = null; fermerHUD(); moteurK(0); }

/* ---------- les commandes : clavier, manette (et manettes du casque), boutons à l'écran ---------- */
const KT = { g: 0, d: 0, gaz: 0, frein: 0, obj: 0, dera: 0, vol: 0 };   // (les boutons de l'écran)
function commandesK() { const k = c => !!(typeof CLAV !== "undefined" && CLAV[c]), P = KR.pad || { axes: [0, 0, 0, 0], buttons: [] };
  const bt = i => { const b = P.buttons && P.buttons[i]; return !!(b && (b.pressed || b.value > .4)); };
  let dir = (k("ArrowRight") || k("KeyD") ? 1 : 0) - (k("ArrowLeft") || k("KeyA") || k("KeyQ") ? 1 : 0) + KT.d - KT.g + (KT.vol || 0) + (Math.abs(P.axes[0] || 0) > .15 ? P.axes[0] : 0);
  dir = Math.max(-1, Math.min(1, dir));
  const gaz = k("ArrowUp") || k("KeyW") || k("KeyZ") || bt(7) || bt(0) || KT.gaz || (P.vr && bt(7));
  const frein = k("ArrowDown") || k("KeyS") || bt(6) || bt(1) || KT.frein;
  const obj = k("Space") || k("KeyE") || bt(2) || bt(4) || KT.obj, dera = k("ShiftLeft") || k("ShiftRight") || k("KeyX") || bt(5) || !!KT.dera;
  return { dir, gaz: gaz ? 1 : 0, frein: frein ? 1 : 0, obj, dera }; }

/* ---------- la conduite (la même pour nous, les karts de la caserne… et, de loin, pour les autres joueurs) ---------- */
/* la conduite, façon karts d'arcade : un volant doux, de l'élan, et le dérapage — on le tient dans le virage, les étincelles passent du bleu
   à l'orange, et quand on le lâche, un petit turbo (plus long si elles étaient orange). Un petit saut au début du dérapage, le kart qui penche. */
function conduire(p, c, dt) { const W2 = Math.max(.25, largeur(p.s) / 2 - (.6 * EK + .12));
  if (p.spin > 0) { p.spin -= dt; p.v *= Math.pow(.18, dt); p.tourne = (p.tourne || 0) + dt * 14; c = { dir: 0, gaz: 0, frein: 0 }; p.derive = 0; p.charge = 0; } else p.tourne = 0;
  let vmax = KC.vmax * (p.bot ? p.bv : 1) * (p.gyro > 0 ? 1.2 : 1) * (p.turbo > 0 ? 1.38 : 1) * (p.fumee > 0 ? .78 : 1);
  if (p.fini) { c = { dir: 0, gaz: 0, frein: 1 }; vmax *= .5; }
  // le volant : on ne braque pas d'un coup
  p.dirS = (p.dirS || 0) + (c.dir - (p.dirS || 0)) * Math.min(1, dt * (Math.abs(c.dir) > Math.abs(p.dirS || 0) ? 7 : 10));
  // l'élan : une accélération forte au départ, plus douce en haut ; le frein, l'air, la pente
  const pente = pentePiste(p.s), av = p.v / vmax, pousse = c.gaz * (p.v < 0 ? 18 : 17 * (1 - .55 * Math.max(0, av)));
  p.v += (pousse - c.frein * (p.v > .5 ? 24 : 7) - p.v * .18 - Math.sign(p.v) * (c.gaz ? 0 : 2.2) - Math.sin(pente) * 9.8 * .55) * dt; if (p.turbo > 0 && p.v < vmax) p.v += 26 * dt;
  if (p.v > vmax) p.v += (vmax - p.v) * Math.min(1, dt * 3); p.v = Math.max(-5, Math.min(vmax * 1.08, p.v));
  const capT = capPiste(p.s), k = Math.min(1, Math.abs(p.v) / 7) * (1 - .22 * Math.max(0, Math.min(1, (p.v - 12) / 8)));
  // le dérapage : on appuie en tournant, à bonne vitesse
  if (!p.derive && c.dera && !p.deraPrec && Math.abs(p.dirS) > .2 && p.v > 7) { p.derive = Math.sign(p.dirS); p.charge = 0; p.saut = .22; if (p.moi) sonK("saut"); }
  if (p.derive && (!c.dera || p.v < 5)) { const n = p.charge > 1.7 ? 2 : p.charge > .85 ? 1 : 0; if (n && p.v > 6) { p.turbo = Math.max(p.turbo, n === 2 ? 1.25 : .7); if (p.moi) sonK("turbo"); } p.derive = 0; p.charge = 0; }
  p.deraPrec = c.dera; p.saut = Math.max(0, (p.saut || 0) - dt);
  let tour;
  if (p.glisse > 0) { p.glisse -= dt; tour = -(p.gl || 1) * 2.6; }
  else if (p.derive) { const appui = p.dirS * p.derive;   // (dans le sens du dérapage : on serre ; à contre : on élargit)
    tour = p.derive * (1.55 + .85 * appui) * k; p.charge += dt * (.7 + .6 * Math.max(0, appui)); p.v -= p.v * .08 * dt; }
  else tour = p.dirS * 2.15 * k;
  p.h -= tour * dt * Math.sign(p.v || 1);
  // (le kart, en dérapage, se met de travers ; on le dessine ainsi)
  p.travers = (p.travers || 0) + ((p.derive ? -p.derive * .42 : 0) - (p.travers || 0)) * Math.min(1, dt * 8);
  let rel = Math.atan2(Math.sin(p.h - capT), Math.cos(p.h - capT));
  // (en dérapage, l'élan glisse un peu vers l'extérieur du virage)
  const glisseLat = p.derive ? p.derive * .9 * Math.min(1, p.v / 14) : 0;
  p.s += p.v * Math.cos(rel) * dt; p.d -= (p.v * Math.sin(rel) - glisseLat) * dt;
  if (Math.abs(p.d) > W2) { p.d = Math.sign(p.d) * W2; p.v *= Math.pow(.35, dt * 3); rel *= .4; p.h = capT + rel; p.choc = (p.choc || 0) + dt; if (p.moi && p.v > 8 && (!p.chocT || performance.now() - p.chocT > 400)) { p.chocT = performance.now(); sonK("frotte"); } }   // (contre la barrière : on frotte, on ralentit, le kart se remet dans l'axe)
  p.gyro = Math.max(0, p.gyro - dt); p.turbo = Math.max(0, p.turbo - dt); p.fumee = Math.max(0, p.fumee - dt);
  p.acc = (p.acc || 0) + (((c.gaz && p.v < vmax * .9) ? 1 : c.frein ? -1 : 0) - (p.acc || 0)) * Math.min(1, dt * 5);
  if (p.s >= KC.L) { p.s -= KC.L; p.tour++; } if (p.s < 0) { p.s += KC.L; p.tour--; }
  p.prog = p.tour * KC.L + p.s; }
// (les karts se cognent : on s'écarte l'un de l'autre ; celui qui a le gyrophare envoie l'autre en tête-à-queue)
function chocsKarts() { const P = KR.pil; for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) { const a = P[i], b = P[j];
  if (!(a.moi || a.bot) && !(b.moi || b.bot)) continue; const ds = ((b.s - a.s + KC.L * 1.5) % KC.L) - KC.L / 2, dd = b.d - a.d, Ls = 1.35 * EK * 1.6, Ld = 1.25 * EK;
  if (Math.abs(ds) > Ls || Math.abs(dd) > Ld) continue;
  if (a.gyro > 0 && b.gyro <= 0 && b.spin <= 0) { b.spin = 1; continue; } if (b.gyro > 0 && a.gyro <= 0 && a.spin <= 0) { a.spin = 1; continue; }
  const pen = Ld - Math.abs(dd), sg = Math.sign(dd) || 1; if (a.moi || a.bot) a.d -= sg * pen * .5; if (b.moi || b.bot) b.d += sg * pen * .5;
  const der = ds > 0 ? a : b; if (der.moi || der.bot) der.v *= .97; if ((a.moi || b.moi) && (!KR.chocT || performance.now() - KR.chocT > 350)) { KR.chocT = performance.now(); sonK("choc"); } } }
function majKart(p, dt) { const pos = surPiste(p.s, p.d, p.K.g.position), pente = pentePiste(p.s), K = p.K, t = performance.now();
  if (p.saut > 0) pos.y += Math.sin((1 - p.saut / .22) * Math.PI) * .22;   // (le petit saut du dérapage)
  K.g.rotation.set(0, 0, 0); K.g.rotation.order = "YXZ"; K.g.rotation.y = p.h + (p.tourne || 0) + (p.travers || 0); K.g.rotation.x = -pente;
  // la caisse penche vers l'extérieur du virage, se cabre à l'accélération, plonge au freinage
  const roulis = -(p.dirS || 0) * .1 * Math.min(1, p.v / 10) + (p.derive ? p.derive * .07 : 0), tangage = -(p.acc || 0) * .05;
  K.corpsK.rotation.z += (roulis - K.corpsK.rotation.z) * Math.min(1, dt * 8); K.corpsK.rotation.x += (tangage - K.corpsK.rotation.x) * Math.min(1, dt * 6);
  K.corpsK.position.y = Math.sin(t / 45 + p.s) * .012 * Math.min(1, p.v / 6);   // (le moteur qui vibre)
  for (const r of K.roues) r.rotation.x += p.v * dt * 3; for (const pv of K.pivots) pv.rotation.y = -(p.dirS || 0) * .45;
  // les étincelles : bleues, puis orange quand le turbo est chargé
  const n = p.derive ? (p.charge > 1.7 ? 2 : p.charge > .85 ? 1 : 0) : -1;
  for (const e of K.etin) { e.visible = n >= 0 && p.v > 5; if (e.visible) { e.material.color.setHex(n === 2 ? 0xff8a1a : n === 1 ? 0x4aa8ff : 0xfff2c0); e.scale.setScalar((n === 0 ? .25 : .5) * (.7 + Math.random() * .6)); e.material.rotation = Math.random() * 6; } }
  K.flamme.visible = p.turbo > 0; if (p.turbo > 0) { K.flamme.scale.set(1, .7 + Math.random() * .7, 1); K.flamme.material.color.setHex(Math.random() < .5 ? 0xffa020 : 0x5ab0ff); }
  K.et.visible = !p.moi && (!M.camera || M.camera.position.distanceTo(pos) > 4);
  K.gy.visible = p.gyro > 0; if (p.gyro > 0) K.gy.material.color.setHex(Math.floor(t / 120) % 2 ? 0x2a5cff : 0xff2a2a); }

/* ---------- les adversaires de la caserne (seul) ---------- */
function piloteBot(p, dt) { const devant = p.s + 9, cap = capPiste(devant), cb = courbure(p.s + 4);
  p.voieT = (p.voieT || 0) - dt; if (p.voieT <= 0) { p.voieT = 2 + Math.random() * 3; p.voie = (Math.random() - .5) * Math.max(0, largeur(p.s + 12) - 1.4); } { const lim = Math.max(0, largeur(p.s + 9) / 2 - .5); p.voie = Math.max(-lim, Math.min(lim, p.voie)); }
  // (éviter une banane ou une flaque juste devant)
  for (const o of KR.objets) if ((o.type === "banane" || o.type === "huile") && o.s > p.s && o.s - p.s < 12 && Math.abs(o.d - p.voie) < 1) p.voie = o.d > 0 ? o.d - 1.4 : o.d + 1.4;
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
  else if (o.type === "huile") { m = new THREE.Mesh(new THREE.CircleGeometry(1.1, 20), new THREE.MeshStandardMaterial({ color: 0x0a0a0c, roughness: .05, metalness: .8, transparent: true, opacity: .9 })); m.rotation.x = -Math.PI / 2; }
  else if (o.type === "fumi") { m = new THREE.Group(); const mt = new THREE.MeshBasicMaterial({ color: 0xd8342a, transparent: true, opacity: .45, depthWrite: false }); for (let i = 0; i < 9; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(1 + Math.random() * .8, 10, 8), mt); b.position.set((Math.random() - .5) * 4, .8 + Math.random() * 1.8, (Math.random() - .5) * 3); m.add(b); } }
  else if (o.type === "boule") { m = new THREE.Mesh(new THREE.SphereGeometry(.28, 16, 12), new THREE.MeshStandardMaterial({ color: 0x9aa3ad, metalness: .9, roughness: .25 })); }
  o.m = m; KC.scene.add(m); surPiste(o.s, o.d, m.position); m.position.y += o.type === "boule" ? .3 : o.type === "huile" ? .08 : o.type === "fumi" ? 0 : .12; KR.objets.push(o); }
function touche(p, o) { if (p.gyro > 0 || p.spin > 0) return false;
  const ds = Math.abs(((p.s - o.s + KC.L * 1.5) % KC.L) - KC.L / 2), dd = Math.abs(p.d - o.d), r = o.type === "huile" ? 1.2 : o.type === "fumi" ? 2.4 : .75;
  return ds < r && dd < r + .5 * EK; }
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
  if (KR.intro && c.obj && !KR.objPrec) KR.passer = true;
  KR.objPrec = c.obj;
  for (const p of KR.pil) { if (avant) { majKart(p, 0); continue; }
    if (p.moi) conduire(p, c, dt); else if (p.bot) conduire(p, piloteBot(p, dt), dt); else { /* un autre joueur : on avance sa dernière position */ p.s += p.v * dt; if (p.s >= KC.L) p.s -= KC.L; }
    // les caisses
    if (p.moi || p.bot) for (const cs of KC.caisses) if (cs.m.visible && Math.abs(p.s - cs.s) < .8 && Math.abs(p.d - cs.d) < .7) { cs.m.visible = false; cs.retour = now + 3500; if (!p.objet) { p.objet = tirerObjet(p); if (p.moi) { sonK("caisse"); majHUD(); } } }
    // l'arrivée
    if ((p.moi || p.bot) && !p.fini && p.tour >= KC.tours) { p.fini = now - KR.t0; if (p.moi) { envoyerWS({ t: "k_fin", temps: p.fini }); sonK("arrivee"); arriveeK(); } }
    majKart(p, dt); }
  for (const cs of KC.caisses) { if (!cs.m.visible && now > cs.retour) cs.m.visible = true; cs.m.rotation.y += dt * 1.5; cs.m.position.y = surPiste(cs.s, cs.d).y + .8 + Math.sin(t / 300 + cs.s) * .1; }
  if (KC.ledTex) KC.ledTex.offset.x -= dt * .5; if (M.L && M.L.nuit === false && (!KR.nuitT || t - KR.nuitT > 2000)) { KR.nuitT = t; nuitK(true); }
  if (KR.cer) majCeremonie(dt);
  if (!avant) { majObjets(dt); chocsKarts();
    for (const p of KR.pil) if ((p.moi || p.bot) && !p.fini) for (const b of KC.boosts || []) if (Math.abs(p.s - b.s) < 1.2 && Math.abs(p.d) < b.w / 2) { if (p.turbo < .5 && p.moi) sonK("turbo"); p.turbo = Math.max(p.turbo, .9); } }
  // notre position, pour les autres (8 fois par seconde)
  if (KR.moi && t - KR.envoiT > 125 && !KR.solo) { KR.envoiT = t; const p = KR.moi; envoyerWS({ t: "k_pos", s: +p.s.toFixed(2), d: +p.d.toFixed(2), h: +p.h.toFixed(3), v: +p.v.toFixed(2), tour: p.tour, sp: p.spin > 0 ? 1 : 0, g: p.gyro > 0 ? 1 : 0, dr: p.derive || 0, ch: +(p.charge || 0).toFixed(1), st: +(p.dirS || 0).toFixed(2), tu: p.turbo > 0 ? 1 : 0 }); }
  // notre bonhomme (invisible) suit le kart : c'est lui que suivent la caméra du casque et la carte
  const moiG = M.gens.get(M.moiNum); if (moiG && KR.moi) { moiG.g.position.copy(KR.moi.K.g.position); moiG.g.visible = false; if (M.vr && M.rendu.xr.isPresenting) M.vr.cap = KR.moi.h + Math.PI; }
  cameraK(dt); majHUD(t); moteurK(KR.moi ? Math.abs(KR.moi.v) / KC.vmax : 0);
  if (KR.moi && KR.moi.fini && KR.pil.every(p => p.fini || (!p.bot && !p.moi && now - (p.vu || 0) > 8000)) && !KR.podium && !KR.cer) ceremonieK(); }
const cv3 = new THREE.Vector3(), cv4 = new THREE.Vector3(), cv5 = new THREE.Vector3();
function survolK(p, cam, dt) { const I = KR.intro, u = Math.min(1, (performance.now() - I.t) / I.D);
  if (u >= 1 || KR.passer) { KR.intro = null; KR.passer = false; KR.camH = p.h; return false; }   // (fini : la caméra de course reprend, en glissant depuis là où l'on est)
  const e = u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2, fin = p.s - 6.5, sc = fin - KC.L * .9 * (1 - e);
  const h = 2.4 + 24 * Math.pow(1 - e, 1.4), cote = Math.sin(u * Math.PI * 3) * 7 * (1 - e);
  const pos = surPiste(sc, cote, cv4); pos.y += h; const vise = surPiste(sc + 9 + 22 * (1 - e), 0, cv5); vise.y += .6;
  cam.position.lerp(pos, KR.camPrete ? 1 - Math.exp(-dt * 6) : 1); KR.camPrete = true; cam.lookAt(vise); cam.fov += (60 - cam.fov) * Math.min(1, dt * 3); cam.updateProjectionMatrix(); return true; }
function cameraK(dt) { const p = KR.moi; if (!p || KR.camLibre || (M.rendu && M.rendu.xr.isPresenting)) return; const cam = M.camera;
  if (KR.cer) { cameraCeremonie(cam, dt); return; }
  if (KR.intro && survolK(p, cam, dt)) return;
  // (la caméra suit le cap du kart avec un peu de retard : dans un dérapage, on voit le kart de travers)
  const voulu0 = p.h + (p.travers || 0) * .35; if (KR.camH === undefined || !KR.camPrete) KR.camH = voulu0; KR.camH += Math.atan2(Math.sin(voulu0 - KR.camH), Math.cos(voulu0 - KR.camH)) * Math.min(1, dt * 4.5);
  const f = cv3.set(Math.sin(KR.camH), 0, Math.cos(KR.camH)), recul = 3.3 + Math.min(1, Math.max(0, p.v - 10) * .1) + (p.turbo > 0 ? .4 : 0);
  const voulu = cv4.copy(p.K.g.position).addScaledVector(f, -recul); voulu.y = Math.max(voulu.y + 1.45, surPiste(p.s - recul, p.d, cv5).y + 1.3);   /* (dans la descente : la piste, derrière, est plus haute que le kart ; la caméra reste au-dessus) */
  const k = 1 - Math.exp(-dt * 8); cam.position.lerp(voulu, KR.camPrete ? k : 1); KR.camPrete = true;
  cam.lookAt(p.K.g.position.x + f.x * 3, p.K.g.position.y + .5, p.K.g.position.z + f.z * 3);
  const fov = 66 + Math.min(9, Math.max(0, p.v - 10) * .9) + (p.turbo > 0 ? 7 : 0); cam.fov += (fov - cam.fov) * Math.min(1, dt * 4); cam.updateProjectionMatrix(); }

/* ---------- les autres joueurs (par le serveur) ---------- */
function recuK(m) { if (!M) return; const de = m.de;
  if (m.t === "k_annonce") { if (!KR.on) { KR.attente = { t0: m.t0, ids: m.ids || [de], persos: { [de]: m.perso || "moi" } }; if (M.lieu === "grande" && adminK()) bulle("🏁 Une course de karts part dans " + Math.max(1, Math.round((m.t0 - Date.now()) / 1000)) + " s : va sur la grille de départ pour la rejoindre !", 5000); } return; }
  if (m.t === "k_rejoint") { if (KR.attente && KR.attente.t0 === m.t0) { if (!KR.attente.ids.includes(de)) KR.attente.ids.push(de); (KR.attente.persos = KR.attente.persos || {})[de] = m.perso || "moi"; }
    if (KR.on && m.t0 === KR.t0) (KR.persos = KR.persos || {})[de] = m.perso || "moi";
    if (KR.on && m.t0 === KR.t0 && !KR.humains.includes(de)) { KR.humains.push(de); if (Date.now() < KR.t0) placerGrille(); } return; }
  if (!KR.on) return; const p = KR.pil.find(q => q.id === de);
  if (m.t === "k_pos" && p) { p.s = m.s; p.d = m.d; p.h = m.h; p.v = m.v; p.tour = m.tour; p.prog = m.tour * KC.L + m.s; p.tourne = m.sp ? performance.now() / 70 : 0; p.gyro = m.g ? 1 : 0; p.derive = m.dr || 0; p.charge = m.ch || 0; p.dirS = m.st || 0; p.turbo = m.tu ? .2 : 0; p.vu = Date.now(); }
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
    <div id="kIntro" style="position:absolute;left:0;right:0;bottom:18%;text-align:center;pointer-events:auto"><div style="display:inline-block;padding:10px 22px;border-radius:14px;background:linear-gradient(90deg,rgba(20,35,74,0),rgba(20,35,74,.85) 20%,rgba(20,35,74,.85) 80%,rgba(20,35,74,0));font:900 30px 'Arial Black',Arial;color:#ffd23a;letter-spacing:.04em">🏁 LES 24 TOURS DE LA CASERNE</div><div style="font:700 13px Arial;opacity:.8;margin-top:6px">Toucher l'écran pour passer</div></div>
    <div style="position:absolute;inset:0;background:radial-gradient(circle,rgba(200,40,30,.2),rgba(200,40,30,.75));opacity:0;transition:opacity .4s" id="kFumee"></div>
    <button type="button" id="kQuitter" style="pointer-events:auto;position:absolute;left:12px;top:106px;border:0;border-radius:99px;padding:6px 12px;background:rgba(0,0,0,.55);color:#fff;font:700 13px Arial">✕ Quitter la course</button>
    ${tactile ? `<div id="kPalette" style="position:absolute;left:12px;bottom:22px;width:min(46vw,260px);height:74px;border-radius:40px;border:3px solid rgba(255,255,255,.75);background:linear-gradient(90deg,rgba(0,0,0,.55),rgba(0,0,0,.3) 50%,rgba(0,0,0,.55));pointer-events:auto;touch-action:none">
        <div style="position:absolute;left:14px;top:50%;transform:translateY(-50%);font-size:22px;opacity:.6">◀</div><div style="position:absolute;right:14px;top:50%;transform:translateY(-50%);font-size:22px;opacity:.6">▶</div>
        <div id="kManette" style="position:absolute;left:50%;top:50%;width:66px;height:66px;margin:-33px 0 0 -33px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff,#c9ced6 55%,#8a919c);box-shadow:0 3px 10px rgba(0,0,0,.6)"></div></div>
      <div style="position:absolute;right:12px;bottom:18px;display:grid;grid-template-columns:auto auto;gap:10px;align-items:end;pointer-events:auto">
        <div style="display:flex;flex-direction:column;gap:10px;align-items:center">
          <button type="button" data-k="obj" style="width:66px;height:66px;border-radius:50%;border:3px solid #ffd23a;background:rgba(0,0,0,.5);color:#ffd23a;font:700 13px Arial">OBJET</button>
          <button type="button" data-k="dera" style="width:66px;height:66px;border-radius:50%;border:3px solid #7ad0ff;background:rgba(20,60,110,.6);color:#bfe8ff;font:700 11px Arial">DÉRAPER</button>
          <button type="button" data-k="frein" style="width:66px;height:66px;border-radius:50%;border:3px solid rgba(255,255,255,.7);background:rgba(160,30,30,.6);color:#fff;font:700 13px Arial">FREIN</button></div>
        <button type="button" data-k="gaz" style="width:104px;height:104px;border-radius:50%;border:4px solid #9dff7a;background:radial-gradient(circle at 40% 35%,rgba(80,200,60,.85),rgba(20,110,20,.85));color:#fff;font:900 14px Arial;text-shadow:0 1px 3px #000">ACCÉLÉRER</button></div>` : `<div style="position:absolute;left:12px;bottom:12px;font:700 13px Arial;opacity:.85">⬆ accélérer · ⬇ freiner · ⬅ ➡ tourner · Maj (tenu dans le virage) déraper : les étincelles bleues puis orange donnent un turbo · Espace objet</div>`}`;
  for (const b of d.querySelectorAll("[data-k]")) { const k = b.dataset.k, on = v => e => { e.preventDefault(); e.stopPropagation(); KT[k] = v; };
    b.addEventListener("pointerdown", on(1)); b.addEventListener("pointerup", on(0)); b.addEventListener("pointercancel", on(0)); b.addEventListener("pointerleave", on(0)); }
  d.querySelector("#kQuitter").onclick = e => { e.stopPropagation(); quitterCourse(); };
  { const pal = d.querySelector("#kPalette"), bou = d.querySelector("#kManette"); if (pal) { let id = null;
    const viser = e => { const r = pal.getBoundingClientRect(), demi = r.width / 2 - 36, v = Math.max(-1, Math.min(1, (e.clientX - r.left - r.width / 2) / demi)); KT.vol = v; bou.style.transform = `translateX(${v * demi}px)`; };
    const lacher = e => { if (e.pointerId !== id) return; id = null; KT.vol = 0; bou.style.transition = "transform .12s"; bou.style.transform = ""; };
    pal.addEventListener("pointerdown", e => { e.preventDefault(); e.stopPropagation(); id = e.pointerId; try { pal.setPointerCapture(id); } catch (er) {} bou.style.transition = ""; viser(e); });
    pal.addEventListener("pointermove", e => { if (e.pointerId === id) { e.preventDefault(); viser(e); } });
    for (const ev of ["pointerup", "pointercancel", "lostpointercapture"]) pal.addEventListener(ev, lacher); } }
  d.addEventListener("pointerdown", e => { if (KR.cer && !KR.podium && e.target === d) { podiumK(); return; } if (KR.intro && e.target === d || e.target.id === "kIntro" || (e.target.closest && e.target.closest("#kIntro"))) KR.passer = true; });
  for (const ev of ["pointerdown", "pointerup", "click", "touchstart", "wheel"]) d.addEventListener(ev, e => e.stopPropagation());
  M.ctx.conteneur.appendChild(d); majHUD(0);
  if (!document.getElementById("kStyle")) { const st = document.createElement("style"); st.id = "kStyle"; st.textContent = "body.en-course .mx-bas-btns, body.en-course .mx-danses, body.en-course .mx-parler, body.en-course #mxBtnDanses, body.en-course #mxBtnParler { display: none !important; }"; document.head.appendChild(st); }
  document.body.classList.add("en-course"); }
function fermerHUD() { if (KR.hud) { KR.hud.remove(); KR.hud = null; } document.body.classList.remove("en-course"); if (M && M.manMenu && M.manMenu.d && M.manMenu.d.id === "kFin") M.manMenu = null; for (const k in KT) KT[k] = 0; const f = document.getElementById("kFin"); if (f) f.remove(); KR.podium = false; }
function majHUD(t) { const d = KR.hud, p = KR.moi; if (!d || !p) return; const now = Date.now(), q = d.querySelector.bind(d);
  const rang = classement().indexOf(p) + 1; q("#kPos").textContent = rang + (rang === 1 ? "er" : "e") + " / " + KR.pil.length;
  q("#kTour").textContent = "Tour " + Math.max(1, Math.min(KC.tours, p.tour + 1)) + " / " + KC.tours; q("#kObj").textContent = p.objet ? OBJETS_K[p.objet] : "";
  const ms = p.fini || Math.max(0, now - KR.t0); q("#kChrono").textContent = chronoK(ms);
  const r = Math.ceil((KR.t0 - now) / 1000); q("#kDecompte").textContent = r > 0 ? (r > 5 ? "" : r) : now - KR.t0 < 900 ? "GO !" : "";
  if (r > 5) q("#kDecompte").innerHTML = `<div style="font:700 22px Arial;text-align:center">Départ dans ${r} s<br><small style="font-size:15px">les autres peuvent encore rejoindre la grille</small></div>`;
  if (r > 0 && r <= 3 && KR.bipR !== r) { KR.bipR = r; sonK("bip"); } if (r <= 0 && KR.bipR !== 0) { KR.bipR = 0; sonK("go"); }
  q("#kFumee").style.opacity = p.fumee > 0 ? 1 : 0; q("#kIntro").style.display = KR.intro ? "" : "none";
  if (KR.intro) q("#kDecompte").innerHTML = ""; }
const chronoK = ms => { const s = ms / 1000; return Math.floor(s / 60) + ":" + (s % 60).toFixed(2).padStart(5, "0"); };
function voileFumee() { sonK("fumi"); }
function arriveeK() { const p = KR.moi, rang = classement().indexOf(p) + 1; bulle(`🏁 Arrivée ! ${rang}${rang === 1 ? "er" : "e"} en ${chronoK(p.fini)}`, 4000);
  try { const r = JSON.parse(localStorage.getItem("karts-record") || "null"); if (!r || p.fini < r) { localStorage.setItem("karts-record", JSON.stringify(p.fini)); KR.record = true; } } catch (e) {} }
/* ---------- la cérémonie : le podium dans la cour d'honneur, le gagnant qui saute les bras en l'air avec la coupe, des confettis, la caméra qui tourne autour ---------- */
const POD = { x: 0, z: -5 };
function figurePilote(p, haut) { const g = new THREE.Group(), combi = new THREE.MeshStandardMaterial({ color: p.K.corps.material.color.clone(), roughness: .6 }), noir = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: .8 });
  for (const sx of [-.11, .11]) { const j = new THREE.Mesh(new THREE.CapsuleGeometry(.08, .5, 4, 8), combi); j.position.set(sx, .37, 0); g.add(j); const c2 = new THREE.Mesh(new THREE.BoxGeometry(.13, .08, .24), noir); c2.position.set(sx, .04, .04); g.add(c2); }
  const torse = new THREE.Mesh(new THREE.CapsuleGeometry(.2, .36, 4, 12), combi); torse.position.y = .98; g.add(torse);
  const bras = [-1, 1].map(sx => { const pv = new THREE.Group(); pv.position.set(sx * .27, 1.2, 0); const b = new THREE.Mesh(new THREE.CapsuleGeometry(.065, .46, 4, 8), combi); b.position.y = -.28; pv.add(b); const m = new THREE.Mesh(new THREE.SphereGeometry(.075, 8, 6), noir); m.position.y = -.56; pv.add(m); g.add(pv); return pv; });
  let tete; if (p.K.tete) { tete = p.K.tete.clone(true); tete.scale.multiplyScalar(.6); tete.position.set(0, 1.58, 0); } else { tete = new THREE.Mesh(new THREE.SphereGeometry(.22, 16, 12), new THREE.MeshStandardMaterial({ color: p.K.coul, roughness: .15, metalness: .3 })); tete.position.y = 1.5; } g.add(tete);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); return { g, bras, base: haut }; }
function coupeK() { const g = new THREE.Group(), or = new THREE.MeshStandardMaterial({ color: 0xffc83a, metalness: 1, roughness: .18, emissive: 0x3a2600, emissiveIntensity: .4 });
  const prof = [[0, 0], [.13, 0], [.13, .05], [.05, .08], [.04, .2], [.05, .24], [.17, .32], [.2, .48], [.19, .5], [0, .5]].map(([x, y]) => new THREE.Vector2(x, y));
  g.add(new THREE.Mesh(new THREE.LatheGeometry(prof, 28), or)); for (const sx of [-1, 1]) { const a = new THREE.Mesh(new THREE.TorusGeometry(.08, .018, 8, 16, Math.PI * 1.2), or); a.position.set(sx * .2, .38, 0); a.rotation.z = sx > 0 ? -Math.PI * .6 : Math.PI * 1.4; g.add(a); }
  const socle = new THREE.Mesh(new THREE.BoxGeometry(.24, .08, .24), new THREE.MeshStandardMaterial({ color: 0x2a1a10, roughness: .5 })); socle.position.y = -.04; g.add(socle); return g; }
function ceremonieK() { const L2 = classement().filter(p => p.fini).slice(0, 3); if (!L2.length) { podiumK(); return; }
  const G = new THREE.Group(); G.position.set(POD.x, 0, POD.z); KC.scene.add(G); const blanc = new THREE.MeshStandardMaterial({ color: 0xf4f4f4, roughness: .5 });
  // le tapis rouge, les trois marches (numérotées), la lumière
  const tapis = new THREE.Mesh(new THREE.PlaneGeometry(6, 5), new THREE.MeshStandardMaterial({ color: 0xa8141c, roughness: .9 })); tapis.rotation.x = -Math.PI / 2; tapis.position.set(0, .02, .8); G.add(tapis);
  const marches = [[0, 1.0, "1"], [-1.45, .65, "2"], [1.45, .42, "3"]]; for (const [x, h, n] of marches) { const t = tex(toile(128, 128, c => { c.fillStyle = "#f4f4f4"; c.fillRect(0, 0, 128, 128); c.fillStyle = n === "1" ? "#d4a017" : n === "2" ? "#9aa3ad" : "#b0703a"; c.font = "900 90px Arial Black,Arial"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(n, 64, 70); }));
    const b = new THREE.Mesh(new THREE.BoxGeometry(1.4, h, 1.2), [blanc, blanc, blanc, blanc, new THREE.MeshStandardMaterial({ map: t, roughness: .5 }), blanc]); b.position.set(x, h / 2, 0); b.castShadow = b.receiveShadow = true; G.add(b); }
  const spot = new THREE.SpotLight(0xfff4e0, 120, 30, .6, .5, 1.2); spot.position.set(0, 9, 6); spot.target = G; G.add(spot); const pl = new THREE.PointLight(0xffd080, 8, 12, 1.5); pl.position.set(0, 3, 3); G.add(pl);
  const figs = L2.map((p, i) => { const f = figurePilote(p, marches[i][1]); f.g.position.set(marches[i][0], marches[i][1], 0); G.add(f.g); return f; });
  const coupe = coupeK(); figs[0].g.add(coupe); coupe.position.set(0, 2.2, .05); coupe.scale.setScalar(1.3);
  // les confettis
  const conf = [], geo = new THREE.PlaneGeometry(.08, .05), C = [0xff3a5a, 0xffd23a, 0x3ad0ff, 0x6aff6a, 0xffffff, 0xff8a1a]; for (let i = 0; i < 160; i++) { const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: C[i % C.length], side: THREE.DoubleSide })); m.position.set((Math.random() - .5) * 6, 3 + Math.random() * 5, (Math.random() - .5) * 4); m.userData.v = .6 + Math.random() * .8; m.userData.r = Math.random() * 6; G.add(m); conf.push(m); }
  KR.cer = { G, figs, coupe, conf, t: 0, gagnant: L2[0] }; sonK("arrivee"); setTimeout(() => sonK("arrivee"), 700);
  // la bannière
  const d = KR.hud; if (d) { const b2 = document.createElement("div"); b2.id = "kCer"; b2.style.cssText = "position:absolute;left:0;right:0;top:16%;text-align:center;pointer-events:none"; b2.innerHTML = `<div style="display:inline-block;padding:10px 24px;border-radius:14px;background:rgba(20,35,74,.85);font:900 28px 'Arial Black',Arial;color:#ffd23a">🏆 ${L2[0].nom.toUpperCase()} GAGNE !</div><div style="font:700 13px Arial;opacity:.85;margin-top:6px">Toucher l'écran pour voir le classement</div>`; d.appendChild(b2);
    for (const id of ["kPos", "kTour", "kObj", "kChrono", "kDecompte", "kPalette"]) { const e = d.querySelector("#" + id); if (e) e.style.visibility = "hidden"; } for (const e of d.querySelectorAll("[data-k]")) e.style.visibility = "hidden"; }
  KR.cerFin = setTimeout(() => { if (KR.cer && !KR.podium) podiumK(); }, 9000); }
function majCeremonie(dt) { const C = KR.cer; C.t += dt; const t = C.t;
  C.figs.forEach((f, i) => { if (i === 0) { const saut = Math.abs(Math.sin(t * 4.2)) * .45; f.g.position.y = f.base + saut; f.bras[0].rotation.z = -2.7 + Math.sin(t * 8.4) * .15; f.bras[1].rotation.z = 2.7 - Math.sin(t * 8.4) * .15; }
    else { f.bras[1].rotation.z = 1.4 + Math.sin(t * 5 + i) * .6; f.bras[0].rotation.z = -.2; } f.g.rotation.y = Math.sin(t * .8 + i) * .15; });
  C.coupe.rotation.y += dt * 1.5;
  for (const m of C.conf) { m.position.y -= m.userData.v * dt; m.rotation.x += dt * 3 + m.userData.r * .01; m.rotation.y += dt * 2; m.position.x += Math.sin(t * 2 + m.userData.r) * dt * .3; if (m.position.y < 0) m.position.y = 6 + Math.random() * 2; } }
function cameraCeremonie(cam, dt) { const t = KR.cer.t, a = .55 + Math.sin(t * .25) * .6, r = 7.2 - Math.min(2.4, t * .5), h = 2.6 + Math.max(0, 4 - t * 1.2);
  const voulu = cv4.set(POD.x + Math.sin(a) * r, h, POD.z + Math.cos(a) * r); cam.position.lerp(voulu, KR.cerCam ? 1 - Math.exp(-dt * 3) : 1); KR.cerCam = true;
  cam.lookAt(POD.x, 1.5, POD.z); cam.fov += (50 - cam.fov) * Math.min(1, dt * 2); cam.updateProjectionMatrix(); }
function finCeremonie() { clearTimeout(KR.cerFin); if (KR.cer) { KR.cer.G.parent && KR.cer.G.parent.remove(KR.cer.G); KR.cer = null; } KR.cerCam = false; const b = document.getElementById("kCer"); if (b) b.remove(); }
function podiumK() { KR.podium = true; const d = document.createElement("div"); d.id = "kFin";
  d.style.cssText = "position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:21;background:rgba(10,14,34,.94);border:3px solid #ffd23a;border-radius:16px;padding:16px 20px;color:#fff;font:16px Arial;min-width:260px;max-width:88%";
  const L2 = classement(); let rec = null; try { rec = JSON.parse(localStorage.getItem("karts-record") || "null"); } catch (e) {}
  d.innerHTML = `<div style="font:900 24px 'Arial Black',Arial;color:#ffd23a;text-align:center;margin-bottom:8px">🏆 CLASSEMENT</div>` +
    L2.map((p, i) => `<div style="display:flex;justify-content:space-between;gap:16px;padding:3px 0;${p.moi ? "color:#7ef0ff;font-weight:700" : ""}"><span>${["🥇", "🥈", "🥉"][i] || (i + 1) + "."} ${p.nom}</span><span style="font-family:'Courier New',monospace">${p.fini ? chronoK(p.fini) : "—"}</span></div>`).join("") +
    (rec ? `<div style="margin-top:8px;text-align:center;opacity:.85">Ton record : ${chronoK(rec)}${KR.record ? " — nouveau record !" : ""}</div>` : "") +
    `<div style="display:flex;gap:10px;justify-content:center;margin-top:12px"><button type="button" id="kRejouer" style="border:0;border-radius:99px;padding:9px 16px;background:#ffd23a;color:#14215a;font:900 15px Arial">Rejouer</button><button type="button" id="kSortir" style="border:0;border-radius:99px;padding:9px 16px;background:#3a3f55;color:#fff;font:700 15px Arial">Quitter</button></div>`;
  for (const ev of ["pointerdown", "click"]) d.addEventListener(ev, e => e.stopPropagation());
  M.ctx.conteneur.appendChild(d); M.manMenu = { d };
  d.querySelector("#kRejouer").onclick = () => { d.remove(); quitterCourse(); KR.attente = null; setTimeout(lancerCourse, 50); };
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
  else if (q === "saut") { const o = bip(300, .12, "triangle", .07); o.frequency.exponentialRampToValueAtTime(600, t0 + .12); }
  else if (q === "frotte") { const b = a.createBuffer(1, a.sampleRate * .18, a.sampleRate), c = b.getChannelData(0); for (let i = 0; i < c.length; i++) c[i] = (Math.random() * 2 - 1) * (1 - i / c.length); const s2 = a.createBufferSource(), g = a.createGain(), f = a.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 2500; g.gain.value = .06; s2.buffer = b; s2.connect(f); f.connect(g); g.connect(a.destination); s2.start(); }
  else if (q === "choc") { const o = bip(140, .15, "square", .1); o.frequency.exponentialRampToValueAtTime(60, t0 + .15); }
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
