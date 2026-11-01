/* Les 24 tours de la caserne : une course de karts à travers toute la caserne.
   Le départ est donné dans la grande cour du fond, sur l'allée de droite. On fait le tour des bâtiments du milieu (l'allée de droite, la cour du fond,
   l'allée de gauche), on revient dans la troisième cour, on passe sous le porche, on traverse la deuxième cour, on passe sous l'horloge,
   et dans la cour d'honneur on monte par une rampe sur le toit de gauche (la terrasse : parasols, tables, transats), on traverse la cour
   par un pont devant le bâtiment de l'horloge, on longe le toit de droite, on redescend par l'autre rampe et l'on repart sous les porches.
   Sous les porches, deux voies séparées : celle qui va vers le fond, celle qui revient.
   Deux tours ; des caisses de bonus : la peau de banane, la flaque d'huile, le fumigène, la boule de pétanque, le gyrophare, le turbo.
   Seul : contre quatre karts de la caserne. À plusieurs : ceux qui viennent à la grille de départ (dans la cour d'honneur) pendant le compte à rebours courent ensemble.
   Ce fichier n'est pas un module : la matrice le charge et l'exécute chez elle (eval direct) ; il se sert de M, THREE, tex, toile, envoyerWS… */

const KC = { L: 0, pts: null, N: 0, pas: .5, tours: 4, vmax: 15, grilleT: 12000, ech: .46 };   // (ech : les karts et leurs pilotes, en plus petit — la piste est étroite sous les porches et dans les allées)
const EK = KC.ech;
/* le tracé : des points de passage (x, hauteur, z, largeur de la piste), reliés par une courbe douce */
const VP = 2.35, VA = 4.2, VC = 6;   // (les largeurs : une voie sous les porches, les allées autour des bâtiments, la cour d'honneur et les toits)
const TRACE_K = [
  // l'allée de droite, dans la grande cour du fond (le départ), puis la cour du fond, l'allée de gauche
  [18.1, -.16, -90, VA], [18.1, -.42, -100, VA], [18.1, -.68, -110, VA], [18, -.98, -120, VA], [15.5, -1.1, -125.4, VA], [8, -1.13, -126.6, VA], [-3, -1.13, -126.6, VA],
  // (par-dessus le local poubelle, au coin de l'allée de gauche : une rampe monte sur son toit, et redescend dans l'allée)
  [-9, -.2, -126.6, VA], [-14.5, 1.75, -126, VA], [-17.8, 2.05, -121.5, VA], [-18, 2.05, -116, VA], [-18, 1.2, -110.5, VA], [-18, .1, -105, VA], [-18, 0, -96, VA], [-18, 0, -84, VA], [-17.5, 0, -72.5, VA],
  // la troisième cour, le porche (voie du retour), la deuxième cour, le porche de l'horloge
  [-14, 0, -66.6, VA], [-8, 0, -65.4, VA], [-3.4, 0, -62.4, VA], [-1.25, 0, -57, VP], [-1.25, 0, -50, VP], [-1.25, 0, -44, VP], [-1.25, 0, -38, VP], [-1.25, 0, -30, VP], [-1.25, 0, -24, VP],
  // la cour d'honneur : la rampe de gauche, la terrasse, le pont, le toit de droite, la rampe de droite
  [-1.4, 0, -19.6, VP], [-2.8, 0, -15.6, VC], [-6.5, 0, -12.8, VC], [-9.2, .3, -9, VC], [-9.4, 3, -3, VC], [-9.6, 6.3, 1.5, VC], [-11.5, 7.6, 4.6, VC], [-14.5, 7.6, 6.8, VC],
  [-18.5, 7.6, 6.5, VC], [-21, 7.6, 3, VC], [-21, 7.6, -4, VC], [-20.5, 7.6, -10, VC], [-17.5, 7.6, -13.4, VC], [-12, 7.8, -14.7, VC], [0, 8.1, -14.7, VC], [12, 7.8, -14.7, VC],
  [17.5, 7.6, -13.4, VC], [20.5, 7.6, -10, VC], [21, 7.6, -4, VC], [21, 7.6, 3, VC], [18.5, 7.6, 6.5, VC], [14.5, 7.6, 6.8, VC], [11.5, 7.6, 4.6, VC], [9.6, 6.3, 1.5, VC],
  [9.4, 3, -3, VC], [9.2, .3, -9, VC], [6.5, 0, -12.8, VC], [2.8, 0, -15.6, VC], [1.4, 0, -19.6, VP],
  // le retour vers le fond : le porche de l'horloge, la deuxième cour, le porche (voie de l'aller), la troisième cour, l'allée de droite
  [1.25, 0, -24, VP], [1.25, 0, -30, VP], [1.25, 0, -38, VP], [1.25, 0, -44, VP], [1.25, 0, -50, VP], [1.25, 0, -57, VP], [3.4, 0, -62, VA], [8, 0, -64.6, VA], [14, 0, -65.4, VA],
  [17.6, 0, -69, VA], [18.1, 0, -76, VA], [18.1, 0, -82, VA]];
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
const OBJETS_K = { banane: "🍌", huile: "🛢️", fumi: "💨", boule: "🎱", gyro: "🚨", turbo: "⚡", tarte: "🥧", petard: "🧨", klaxon: "📯", cafe: "☕" };

/* ---------- le circuit : la courbe, la piste en 3D, les barrières, les piliers, la ligne de départ, la terrasse ---------- */
/* la déviation du dernier tour : on quitte la terrasse (le toit de gauche) par une rampe qui monte au-dessus des toits ; une voie suspendue passe
   devant le bâtiment de l'horloge (le dragon, perché sur son toit, crache du feu dessus), longe le toit de droite et redescend rejoindre la piste */
const VB = 4.6;
const TRACE_B = [[-9.6, 6.3, 1.5, VC],
  // (la grande montée : elle part du haut de la rampe de gauche, tourne au-dessus de la cour, longe le côté droit et arrive sur le toit du bâtiment de l'horloge)
  [-8.8, 8.15, 5.4, VB], [-5.4, 10.7, 9.2, VB], [.6, 13.4, 10.6, VB], [6.6, 15.9, 8.6, VB], [9.6, 18.5, 3.2, VB], [10.2, 21.2, -2.8, VB], [8.8, 24, -8.4, VB], [5.4, 26.8, -12.4, VB], [1.4, 29.6, -15.8, VB], [-1.6, 31, -20.8, VB],
  // (le toit de l'horloge : vers l'ouest, demi-tour, puis droit sur le dragon)
  [-8, 31, -22, VB], [-15, 31, -22.2, VB], [-18.4, 31, -24.4, VB], [-15.4, 31, -26.8, VB], [-6, 31, -27, VB], [3, 31, -26.9, VB], [8.4, 31, -26.2, VB],
  // (juste sous le nez du dragon, on tourne, et l'on plonge dans la cascade)
  [11.2, 31, -23.4, VB], [12.4, 30.9, -20.6, VB], [13, 29.2, -17.4, VB], [13.8, 23.4, -13.4, VB], [14.6, 17, -9.6, VB], [15.1, 11.6, -5.6, VB], [15.3, 8.7, -1.8, VB],
  [15, 7.85, 1.8, VB], [13.4, 7.7, 4.4, VB], [11.5, 7.6, 4.6, VC]];
const HORLOGE = (x, z) => Math.abs(x) < 21.8 && z < -19.4 && z > -28.8;   // (le toit plat du bâtiment de l'horloge, à 30,7 m)
// (la piscine sur le toit de droite, au bas de la descente : on y plonge en gerbe d'eau)
const PISCINE = { x: 15.2, z: 1.6, lx: 4.6, lz: 4.4, y: 7.42 };
// (une bande de piste : ses points, ses directions, ses côtés, sa largeur ; fermée (le circuit) ou ouverte (la déviation))
function echantillonner(ctrl, ferme) { const V = ctrl.map(([x, y, z]) => new THREE.Vector3(x, y, z)), c = new THREE.CatmullRomCurve3(V, ferme, "centripetal", .5);
  const L = c.getLength(), N = Math.ceil(L / KC.pas), R = { pts: [], tan: [], nor: [], lar: [], N, ferme };
  for (let i = 0; i < N; i++) { const u = ferme ? i / N : i / (N - 1), p = c.getPointAt(u), t = c.getTangentAt(u); R.pts.push(p); R.tan.push(t); R.nor.push(new THREE.Vector3(-t.z, 0, t.x).normalize());
    let a = [1e9, 0], b = [1e9, 0]; for (const q of ctrl) { if (q[3] === undefined) continue; const d = Math.hypot(q[0] - p.x, q[2] - p.z, (q[1] - p.y) * 2); if (d < a[0]) { b = a; a = [d, q[3]]; } else if (d < b[0]) b = [d, q[3]]; }
    R.lar.push((a[1] * b[0] + b[1] * a[0]) / (a[0] + b[0] || 1)); }
  const idx = i => ferme ? (i + N) % N : Math.max(0, Math.min(N - 1, i));
  for (let r = 0; r < 6; r++) R.lar = R.lar.map((w, i) => (R.lar[idx(i - 1)] + 2 * w + R.lar[idx(i + 1)]) / 4);
  return R; }
const procheDe = (R, x, y, z) => { let bi = 0, bd = 1e9; R.pts.forEach((q, i) => { const d = Math.hypot(q.x - x, q.z - z, (q.y - y) * 2); if (d < bd) { bd = d; bi = i; } }); return bi; };
function preparerTraceK() { if (KC.pts) return;
  const A = echantillonner(TRACE_K, true), N = A.N;
  // (la route ne passe jamais sous les pavés ni sous un trottoir : on relève la piste au niveau du sol le plus haut, au centre et sur les bords)
  if (M && M.L && M.L.hauteur) { const sol = (x, z) => { try { const h = M.L.hauteur(x, z, { g: { position: { x, y: 0, z } }, info: {} }); return typeof h === "number" && isFinite(h) ? h : -99; } catch (e) { return -99; } };
    for (let i = 0; i < N; i++) { const p = A.pts[i]; if (p.y > 3) continue; const n = A.nor[i], w = A.lar[i] / 2 + .1; let g = -99;
      for (const f of [-1, -.5, 0, .5, 1]) { const h = sol(p.x + n.x * w * f, p.z + n.z * w * f); if (h < p.y + .8) g = Math.max(g, h); }
      if (g > -50 && p.y < g + .05) p.y = g + .05; }
    for (let r = 0; r < 3; r++) for (let i = 0; i < N; i++) { const a2 = A.pts[(i - 1 + N) % N], b2 = A.pts[(i + 1) % N], p = A.pts[i]; if (p.y > 3) continue; p.y = Math.max(p.y, (a2.y + b2.y) / 2 - .01); } }
  try { eviterMursK(A); } catch (e) { console.warn("murs", e); }
  // la déviation : tracée entre deux points du circuit, avec un point de plus de chaque côté pour que la courbe s'y raccorde en douceur
  const iB = procheDe(A, ...TRACE_B[0].slice(0, 3)), iM = procheDe(A, ...TRACE_B[TRACE_B.length - 1].slice(0, 3));
  const av = A.pts[(iB - 6 + N) % N], ap = A.pts[(iM + 6) % N], Bc = echantillonner([[av.x, av.y, av.z], ...TRACE_B, [ap.x, ap.y, ap.z]], false);
  const b0 = procheDe(Bc, A.pts[iB].x, A.pts[iB].y, A.pts[iB].z), b1 = procheDe(Bc, A.pts[iM].x, A.pts[iM].y, A.pts[iM].z);
  const B = { pts: Bc.pts.slice(b0, b1), tan: Bc.tan.slice(b0, b1), nor: Bc.nor.slice(b0, b1), lar: Bc.lar.slice(b0, b1), ferme: false }; B.N = B.pts.length;
  KC.A = A; KC.B = B; KC.iB = iB; KC.iM = iM; KC.LA = N * KC.pas;
  /* la course, mise bout à bout : un petit bout avant la ligne (la grille), 4 tours normaux, le dernier tour par la déviation, puis un tour de plus (on continue de rouler après l'arrivée) */
  const seq = [], pre = 40, ajoute = (R, i0, i1) => { for (let i = i0; i < i1; i++) seq.push([R, i]); };
  ajoute(A, N - pre, N); for (let k = 0; k < KC.tours - 1; k++) ajoute(A, 0, N); const d5 = seq.length; ajoute(A, 0, iB); ajoute(B, 0, B.N); ajoute(A, iM, N); const fin = seq.length; ajoute(A, 0, N);
  KC.pts = seq.map(([R, i]) => R.pts[i]); KC.tan = seq.map(([R, i]) => R.tan[i]); KC.nor = seq.map(([R, i]) => R.nor[i]); KC.lar = seq.map(([R, i]) => R.lar[i]);
  KC.N = seq.length; KC.L = KC.N * KC.pas; KC.lapS = Array.from({ length: KC.tours }, (_, k) => (pre + k * N) * KC.pas); KC.finS = fin * KC.pas; KC.dev = [(d5 + iB) * KC.pas, (d5 + iB + B.N) * KC.pas]; }
// (le tour où l'on est : -1 sur la grille, 0 à 4 en course, 5 = arrivé)
const tourDe = s => { if (s >= KC.finS) return KC.tours; let k = -1; for (const l of KC.lapS) if (s >= l) k++; return k; };
/* jamais à travers un coin d'immeuble : de chaque point de la piste au sol, un rayon part à gauche et à droite (à 2 m de haut : les murs, pas les voitures ni les murets) ;
   s'il touche un mur plus près que le bord de la piste, la piste s'écarte du mur et se rétrécit juste ce qu'il faut */
function eviterMursK(Rb) { if (!M || !M.scene) return; const N = Rb.N, T0 = performance.now();
  const avatars = new Set([...M.gens.values()].map(p => p.g)), cibles = M.scene.children.filter(o => (o.isMesh || o.isGroup) && o.visible && !avatars.has(o) && o.name !== "piste-karts" && o.name !== "spectateurs-karts");
  const R = [...(M.L && M.L.voitures || [])]; try { if (typeof C3 !== "undefined" && C3.camion) R.push(C3.camion); } catch (e) {}
  const dansVoiture = (x, z) => R.some(([a, b, c, d]) => x > a - .3 && x < b + .3 && z > c - .3 && z < d + .3);
  const ray = new THREE.Raycaster(); ray.camera = M.camera; const o = new THREE.Vector3(), dv = new THREE.Vector3(), PAS = 2, dec = new Float32Array(N), lar = Rb.lar.slice(), fait = new Uint8Array(N);
  const dist = (p, n, sd, loin) => { o.set(p.x, p.y + 2, p.z); dv.set(n.x * sd, 0, n.z * sd); ray.set(o, dv); ray.near = 0; ray.far = loin; const hits = [];
    for (const c of cibles) { try { ray.intersectObject(c, true, hits); } catch (e) {} }
    hits.sort((a, b) => a.distance - b.distance); for (const h of hits) { const m = h.object.material; if (!h.face || (m && (m.transparent || m.visible === false)) || h.object.isSprite || h.object.isPoints || h.object.isLine) continue; if (dansVoiture(h.point.x, h.point.z)) continue; return h.distance; } return 99; };
  for (let i = 0; i < N; i += PAS) { const p = Rb.pts[i]; if (p.y > 3.2) continue; const n = Rb.nor[i], w2 = lar[i] / 2, loin = w2 + 1.2;
    const dp = dist(p, n, 1, loin), dm = dist(p, n, -1, loin); fait[i] = 1; if (dp > w2 + .35 && dm > w2 + .35) continue;
    let hp = Math.min(w2, dp - .35), hm = Math.min(w2, dm - .35); if (hp + hm < 1.7) { const libre = dp + dm - .7; dec[i] = (dp - dm) / 2; lar[i] = Math.max(1.7, libre); continue; }
    dec[i] = (hp - hm) / 2; lar[i] = hp + hm; }
  for (let i = 0; i < N; i++) if (!fait[i] && Rb.pts[i].y <= 3.2) { const a = (i - 1 + N) % N, b = (i + 1) % N; dec[i] = (dec[a] + dec[b]) / 2; lar[i] = Math.min(lar[a], lar[b]); }
  let D = Array.from(dec), W = lar.slice(); for (let r = 0; r < 10; r++) { D = D.map((v, i) => { const a = D[(i - 1 + N) % N], b = D[(i + 1) % N]; return Math.abs(v) >= Math.max(Math.abs(a), Math.abs(b)) ? v : (a + 2 * v + b) / 4; }); W = W.map((v, i) => Math.min(v, (W[(i - 1 + N) % N] + W[(i + 1) % N]) / 2 + .12)); }
  for (let i = 0; i < N; i++) { if (D[i]) { const n = Rb.nor[i]; Rb.pts[i].x += n.x * D[i]; Rb.pts[i].z += n.z * D[i]; } Rb.lar[i] = Math.min(Rb.lar[i], W[i]); }
  KC.mursMs = Math.round(performance.now() - T0); }
// (un point de la piste : s le long du tracé, d sur le côté — à droite positif)
function surPiste(s, d, out) { const N = KC.N, k = ((s / KC.pas) % N + N) % N, i = Math.floor(k), f = k - i, j = (i + 1) % N;
  const p = out || new THREE.Vector3(); p.lerpVectors(KC.pts[i], KC.pts[j], f); const n = KC.nor[i]; p.x += n.x * d; p.z += n.z * d; return p; }
function largeur(s) { const N = KC.N, i = Math.floor((((s / KC.pas) % N) + N) % N); return KC.lar[i]; }
function tangente(s) { const N = KC.N, i = Math.floor((((s / KC.pas) % N) + N) % N); return KC.tan[i]; }
function capPiste(s) { const t = tangente(s); return Math.atan2(t.x, t.z); }
function pentePiste(s) { const t = tangente(s); return Math.asin(Math.max(-1, Math.min(1, t.y))); }
function courbure(s) { const a = capPiste(s), b = capPiste(s + 6); return Math.abs(Math.atan2(Math.sin(b - a), Math.cos(b - a))); }

function construirePisteK(scene) { preparerTraceK(); const G = new THREE.Group(); G.name = "piste-karts"; const A = KC.A, B = KC.B;
  const asph = toile(512, 1024, x => { x.fillStyle = "#34363b"; x.fillRect(0, 0, 512, 1024);
    for (let i = 0; i < 26000; i++) { const v = 30 + Math.random() * 55; x.fillStyle = `rgba(${v},${v},${v + 4},${.35 + Math.random() * .4})`; const r = Math.random() < .08 ? 2 : 1; x.fillRect(Math.random() * 512, Math.random() * 1024, r, r); }
    for (let i = 0; i < 14; i++) { x.fillStyle = `rgba(20,20,24,${.08 + Math.random() * .1})`; x.beginPath(); x.ellipse(40 + Math.random() * 430, Math.random() * 1024, 20 + Math.random() * 60, 30 + Math.random() * 90, Math.random() * 3, 0, 7); x.fill(); }   // (des taches, des raccords)
    x.fillStyle = "#ece8dc"; for (let y = 0; y < 1024; y += 256) x.fillRect(250, y, 12, 130);   // (la ligne blanche du milieu, en tirets)
    for (const xx of [34, 470]) { x.fillStyle = "rgba(236,232,220,.85)"; x.fillRect(xx, 0, 8, 1024); }   // (les lignes de bord)
    for (let y = 0; y < 1024; y += 64) { x.fillStyle = (y / 64) % 2 ? "#ececec" : "#d01e1a"; x.fillRect(0, y, 30, 64); x.fillRect(482, y, 30, 64); } });   // (les vibreurs rouges et blancs)
  const ta = tex(asph); ta.wrapS = ta.wrapT = THREE.RepeatWrapping; ta.anisotropy = 8;
  const routeM = new THREE.MeshStandardMaterial({ map: ta, roughness: .62, metalness: .12, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 }), routeM2 = routeM.clone(); routeM2.polygonOffsetFactor = -3;
  const dalleM = new THREE.MeshStandardMaterial({ color: 0x8c8a84, roughness: .95, side: THREE.DoubleSide });
  const muretM = new THREE.MeshStandardMaterial({ map: tex(toile(128, 32, x => { for (let i = 0; i < 4; i++) { x.fillStyle = i % 2 ? "#f2f2f2" : "#c8201c"; x.fillRect(i * 32, 0, 32, 32); } })), roughness: .7, side: THREE.DoubleSide }); muretM.map.wrapS = THREE.RepeatWrapping;
  KC.ledTex = tex(toile(512, 8, x => { const C = ["#ff2a6a", "#ff9a1a", "#ffe23a", "#3aff7a", "#2ad8ff", "#5a6aff", "#c03aff"]; x.fillStyle = "#101010"; x.fillRect(0, 0, 512, 8); for (let i = 0; i < 32; i++) { x.fillStyle = C[i % C.length]; x.fillRect(i * 16 + 5, 1, 6, 6); } })); KC.ledTex.wrapS = THREE.RepeatWrapping;
  const ledM = new THREE.MeshBasicMaterial({ map: KC.ledTex, side: THREE.DoubleSide, toneMapped: false }); ledM.color.setScalar(1.25);
  const haloT = tex(toile(8, 64, x => { const gr = x.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(.5, "rgba(255,255,255,.55)"); gr.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = gr; x.fillRect(0, 0, 8, 64); }));
  const haloM = new THREE.MeshBasicMaterial({ map: KC.ledTex, alphaMap: haloT, transparent: true, opacity: .42, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }); haloM.color.setScalar(1.4);
  const mk = (P, U, I, m) => { const g4 = new THREE.BufferGeometry(); g4.setAttribute("position", new THREE.Float32BufferAttribute(P, 3)); if (U) g4.setAttribute("uv", new THREE.Float32BufferAttribute(U, 2)); g4.setIndex(I); g4.computeVertexNormals(); const me = new THREE.Mesh(g4, m); me.frustumCulled = false; G.add(me); return me; };
  // (un point est « sur la route de l'autre bande » : là, pas de muret — c'est l'embranchement)
  const surAutre = (R2, x, y, z) => { for (let j = 0; j < R2.N; j++) { const q = R2.pts[j]; if (Math.abs(q.y - y) < 1.2 && Math.hypot(q.x - x, q.z - z) < R2.lar[j] / 2 + .15) return true; } return false; };
  for (const [R, autre, mRoute] of [[A, B, routeM], [B, A, routeM2]]) { const N = R.N, n1 = R.ferme ? N : N - 1, I = i => R.ferme ? i % N : i;
    // la route, la dalle dessous (quand elle est en l'air)
    { const P = [], U = [], X = [], P2 = [], X2 = []; for (let i = 0; i <= n1; i++) { const k = I(i), p = R.pts[k], n = R.nor[k], W = R.lar[k], h = p.y > .4 ? .45 : 0;
        for (const sd of [-1, 1]) { P.push(p.x + n.x * W / 2 * sd, p.y + (R === B ? .07 : .06), p.z + n.z * W / 2 * sd); P2.push(p.x + n.x * W / 2 * sd, p.y - h, p.z + n.z * W / 2 * sd); } U.push(0, i * KC.pas / 7.4, 1, i * KC.pas / 7.4);
        if (i < n1) { const a2 = i * 2; X.push(a2, a2 + 2, a2 + 1, a2 + 1, a2 + 2, a2 + 3); X2.push(a2, a2 + 1, a2 + 2, a2 + 1, a2 + 3, a2 + 2); } }
      mk(P, U, X, mRoute).receiveShadow = true; mk(P2, null, X2, dalleM); }
    // les murets, les LED (deux rangées) et leur halo — sauf là où l'autre bande s'embranche
    for (const sd of [-1, 1]) { const ok = [], P3 = [], U3 = [], PL = [], PB = [], PH = [], U4 = [], U5 = [], X3 = [];
      for (let i = 0; i <= n1; i++) { const k = I(i), p = R.pts[k], n = R.nor[k], W = R.lar[k], hm = p.y > .4 ? .9 : .55, e = W / 2 + .1, x = p.x + n.x * e * sd, z = p.z + n.z * e * sd, y = p.y + hm, u = i * KC.pas / 4;
        ok.push(!surAutre(autre, x, p.y, z)); P3.push(x, p.y, z, x, y, z); U3.push(i * KC.pas / 2, 0, i * KC.pas / 2, 1);
        PL.push(x, y - .04, z, x, y + .1, z); PB.push(x, p.y + .08, z, x, p.y + .16, z); PH.push(x, y - .2, z, x, y + .26, z); U4.push(u, 0, u, 1); U5.push(-u, 0, -u, 1); }
      for (let i = 0; i < n1; i++) if (ok[i] && ok[i + 1]) { const a2 = i * 2; X3.push(a2, a2 + 2, a2 + 1, a2 + 1, a2 + 2, a2 + 3); }
      if (!X3.length) continue; mk(P3, U3, X3, muretM); mk(PL, U4, X3, ledM); } }   /* (une seule rangée de LED, sans halo : plus doux pour les yeux, et plus léger) */
  // les piliers : sous la piste en l'air, jusqu'au sol ou jusqu'au toit, jamais au milieu d'une route plus bas
  const pilM = new THREE.MeshStandardMaterial({ color: 0x9a968c, roughness: .9 });
  const routeDessous = (x, z, haut, bas) => { for (const R of [A, B]) for (let j = 0; j < R.N; j += 2) { const q = R.pts[j]; if (q.y < haut - 1 && q.y > bas - .5 && Math.hypot(q.x - x, q.z - z) < R.lar[j] / 2 + .6) return true; } return false; };
  for (const R of [A, B]) for (let i = 0; i < R.N; i += 9) { const p = R.pts[i]; if (p.y < 1.2) continue; for (const sd of [-1, 1]) { const n = R.nor[i], W = R.lar[i], x = p.x + n.x * (W / 2 - .6) * sd, z = p.z + n.z * (W / 2 - .6) * sd, base = HORLOGE(x, z) && p.y > 29 ? 30.7 : TOIT_K(x, z) ? 7.42 : 0;
      if (p.y - base < 1.2 || routeDessous(x, z, p.y, base)) continue; const h = p.y - .45 - base, c = new THREE.Mesh(new THREE.CylinderGeometry(.22, .26, h, 10), pilM); c.position.set(x, base + h / 2, z); c.castShadow = true; G.add(c); } }
  // la ligne de départ en damier, et le portique « LES 24 TOURS DE LA CASERNE »
  { const p = A.pts[0], W = A.lar[0], t0 = A.tan[0], cap = Math.atan2(t0.x, t0.z), dam = tex(toile(256, 32, x => { for (let i = 0; i < 16; i++) for (let j = 0; j < 2; j++) { x.fillStyle = (i + j) % 2 ? "#111" : "#f4f4f4"; x.fillRect(i * 16, j * 16, 16, 16); } }));
    const l = new THREE.Mesh(new THREE.PlaneGeometry(W, .9), new THREE.MeshStandardMaterial({ map: dam, roughness: .8, polygonOffset: true, polygonOffsetFactor: -4 })); l.rotation.set(-Math.PI / 2, 0, cap); l.position.set(p.x, p.y + .075, p.z); G.add(l);
    const por = new THREE.Group(); por.position.set(p.x, p.y, p.z); por.rotation.y = cap + Math.PI / 2; G.add(por); const fer = new THREE.MeshStandardMaterial({ color: 0x24262c, metalness: .5, roughness: .4 });
    for (const sd of [-1, 1]) { const m = new THREE.Mesh(new THREE.BoxGeometry(.25, 5, .25), fer); m.position.set(0, 2.5, sd * (W / 2 + .5)); por.add(m); }
    const ban = toile(1024, 128, x => { x.fillStyle = "#14234a"; x.fillRect(0, 0, 1024, 128); x.fillStyle = "#ffd23a"; x.font = "900 66px Arial Black,Arial"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("🏁 LES 24 TOURS DE LA CASERNE 🏁", 512, 68); });
    const b = new THREE.Mesh(new THREE.BoxGeometry(.2, 1.1, W + 1.2), [fer, fer, fer, fer, new THREE.MeshBasicMaterial({ map: tex(ban) }), new THREE.MeshBasicMaterial({ map: tex(ban) })]); b.position.y = 5.2; por.add(b); }
  // à l'embranchement : un panneau « DERNIER TOUR → PAR LES TOITS »
  { const q = B.pts[Math.min(B.N - 1, 14)], t = B.tan[Math.min(B.N - 1, 14)], cap = Math.atan2(t.x, t.z), pan = toile(512, 160, x => { x.fillStyle = "#14234a"; x.fillRect(0, 0, 512, 160); x.strokeStyle = "#ffd23a"; x.lineWidth = 10; x.strokeRect(5, 5, 502, 150); x.fillStyle = "#ffd23a"; x.font = "900 46px Arial Black,Arial"; x.textAlign = "center"; x.fillText("DERNIER TOUR", 256, 66); x.fillStyle = "#fff"; x.font = "800 34px Arial"; x.fillText("PAR LES TOITS ⬆", 256, 122); });
    const g2 = new THREE.Group(); g2.position.set(q.x, q.y, q.z); g2.rotation.y = cap + Math.PI; G.add(g2); const fer = new THREE.MeshStandardMaterial({ color: 0x24262c, metalness: .5 });
    for (const sx of [-1.4, 1.4]) { const m = new THREE.Mesh(new THREE.BoxGeometry(.12, 3.4, .12), fer); m.position.set(sx, 1.7, 0); g2.add(m); }
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 1.44), new THREE.MeshBasicMaterial({ map: tex(pan), side: THREE.DoubleSide, toneMapped: false })); pl.material.color.setScalar(1.3); pl.position.y = 3.4; g2.add(pl);
    for (const sx of [-1.4, 1.4]) g2.children.filter(c => c.geometry && c.geometry.parameters && c.geometry.parameters.height === 3.4).forEach(c => { c.scale.y = 1.15; c.position.y = 1.95; }); }
  // la terrasse, sur le toit de gauche : parasols, tables, transats, bacs à fleurs (pas là où monte la déviation)
  { const coul = [0xd8261e, 0xf2c21a, 0x1e64d8, 0x2aa84a], toile2 = new THREE.MeshStandardMaterial({ color: 0xf0ece0, roughness: .8 }), libre = (x, z) => !B.pts.some((q, j) => q.y < 11.5 && Math.hypot(q.x - x, q.z - z) < B.lar[j] / 2 + 1.5);
    for (let k = 0; k < 5; k++) { const x = -14.8 + (k % 2) * .4, z = -10.4 + k * 3.1, y = 7.45; if (!libre(x, z)) continue; const g2 = new THREE.Group(); g2.position.set(x, y, z); G.add(g2);
      const mat = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, 2.2, 6), new THREE.MeshStandardMaterial({ color: 0xdddddd })); mat.position.y = 1.1; g2.add(mat);
      const par = new THREE.Mesh(new THREE.ConeGeometry(1.3, .5, 8, 1, true), new THREE.MeshStandardMaterial({ color: coul[k % 4], side: THREE.DoubleSide, roughness: .7 })); par.position.y = 2.2; g2.add(par);
      const tab = new THREE.Mesh(new THREE.CylinderGeometry(.45, .45, .05, 16), toile2); tab.position.y = .72; g2.add(tab); const pied = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, .72, 6), toile2); pied.position.y = .36; g2.add(pied);
      if (k % 2) { const tr = new THREE.Mesh(new THREE.BoxGeometry(.6, .12, 1.7), new THREE.MeshStandardMaterial({ color: coul[(k + 1) % 4] })); tr.position.set(-.9, .3, 0); tr.rotation.x = -.15; g2.add(tr); } }
    for (let k = 0; k < 4; k++) { const z = -10 + k * 3.6; if (!libre(-17.1, z)) continue; const b = new THREE.Mesh(new THREE.BoxGeometry(.6, .5, 2.4), new THREE.MeshStandardMaterial({ color: 0x8a5a3a })); b.position.set(-17.1, 7.7, z); G.add(b);
      const f = new THREE.Mesh(new THREE.SphereGeometry(.7, 8, 6), new THREE.MeshStandardMaterial({ color: 0x3f8a3a })); f.scale.set(.6, .6, 1.7); f.position.set(-17.1, 8.25, z); G.add(f); } }
  // les caisses de bonus (repérées par leur place dans la caserne : elles servent à chaque tour)
  KC.caisses = []; const cm = KC.cm = new THREE.MeshStandardMaterial({ map: tex(toile(64, 64, x => { const gr = x.createLinearGradient(0, 0, 64, 64); gr.addColorStop(0, "#ffe25a"); gr.addColorStop(1, "#ff8a1a"); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); x.strokeStyle = "#7a3a00"; x.lineWidth = 4; x.strokeRect(2, 2, 60, 60); x.fillStyle = "#fff"; x.font = "900 44px Arial"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("?", 32, 35); })), emissive: 0xffffff, emissiveIntensity: .75, transparent: true, opacity: .95 }); cm.emissiveMap = cm.map;
  const posSur = (R, i, d) => { const q = R.pts[i], n = R.nor[i]; return new THREE.Vector3(q.x + n.x * d, q.y, q.z + n.z * d); };
  for (const [R, x, y, z] of [[A, 18.3, -.6, -106], [A, -18, 0, -100], [A, -21, 7.6, -2], [A, 21, 7.6, -2], [A, 1.25, 0, -64], [B, -6, 31, -22]]) { const i = procheDe(R, x, y, z), W = R.lar[i];
    for (const f of [-.36, -.12, .12, .36]) { const pos = posSur(R, i, f * W * 1.1), m = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), cm); m.position.copy(pos); m.position.y += .8; G.add(m); KC.caisses.push({ pos, m, retour: 0, ph: KC.caisses.length * 1.3 }); } }
  // les plaques turbo : des flèches jaunes au sol, sur les lignes droites
  KC.boosts = []; const tb = tex(toile(128, 256, x => { x.fillStyle = "#1a1a1a"; x.fillRect(0, 0, 128, 256); for (let i = 0; i < 3; i++) { const y = 200 - i * 80; const gr = x.createLinearGradient(0, y, 0, y - 60); gr.addColorStop(0, "#ff8a00"); gr.addColorStop(1, "#ffe24a"); x.fillStyle = gr; x.beginPath(); x.moveTo(10, y); x.lineTo(64, y - 60); x.lineTo(118, y); x.lineTo(118, y + 22); x.lineTo(64, y - 36); x.lineTo(10, y + 22); x.closePath(); x.fill(); } }));
  for (const [R, x, y, z] of [[A, 18.3, -.3, -95], [A, 0, -1.13, -126.6], [A, 0, 8.1, -14.7], [A, -18, 0, -88], [B, -6, 31, -27]]) { const i = procheDe(R, x, y, z), W = R.lar[i], q = R.pts[i], t = R.tan[i], w = Math.min(2.2, W - .6), m = new THREE.Mesh(new THREE.PlaneGeometry(w, 2.4), new THREE.MeshBasicMaterial({ map: tb, transparent: true, opacity: .95, polygonOffset: true, polygonOffsetFactor: -6 }));
    m.rotation.order = "YXZ"; m.rotation.set(-Math.PI / 2 + Math.asin(Math.max(-1, Math.min(1, t.y))), Math.atan2(t.x, t.z) + Math.PI, 0); m.position.set(q.x, q.y + .09, q.z); G.add(m); KC.boosts.push({ pos: q.clone(), w, m }); }
  KC.pisteObjs = G.children.slice();   /* (tout ce qui est la piste elle-même : on le cache pendant la remise de la coupe) */
  try { cascadeK(G); } catch (e) { console.warn("cascade", e); } try { piscineK(G); } catch (e) { console.warn("piscine", e); } try { dragonK(G); } catch (e) { console.warn("dragon", e); } try { parisK(G); } catch (e) { console.warn("paris", e); }
  scene.add(G); KC.G = G; return G; }

/* ---------- le dragon, perché sur le toit du bâtiment de l'horloge, qui surveille la course et crache du feu sur la voie des toits ----------
   tout en volumes « dessin animé » (contour noir) : le corps, le ventre, les pattes griffues, le long cou, la tête avec ses cornes, ses yeux jaunes à pupille fendue,
   sa mâchoire qui s'ouvre (des crocs, une langue), les ailes de chauve-souris qui battent, la queue qui ondule, les piquants du dos */
/* un tube qui s'effile le long d'une courbe (la queue, les os des ailes) ; « geo » donné : on met à jour ses points (pour l'animer) */
function tubeEffile(courbe, r0, r1, n = 24, nr = 10, geo) { const fr = courbe.computeFrenetFrames(n, false), P = new Float32Array((n + 1) * (nr + 1) * 3), v = new THREE.Vector3();
  for (let i = 0; i <= n; i++) { const u = i / n, c = courbe.getPointAt(u), r = r0 + (r1 - r0) * Math.pow(u, .8), N = fr.normals[i], B = fr.binormals[i];
    for (let j = 0; j <= nr; j++) { const a = j / nr * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a); v.set(c.x + r * (ca * N.x + sa * B.x), c.y + r * (ca * N.y + sa * B.y), c.z + r * (ca * N.z + sa * B.z)); const k = (i * (nr + 1) + j) * 3; P[k] = v.x; P[k + 1] = v.y; P[k + 2] = v.z; } }
  if (geo) { geo.attributes.position.array.set(P); geo.attributes.position.needsUpdate = true; geo.computeVertexNormals(); geo.computeBoundingSphere(); return geo; }
  const g = new THREE.BufferGeometry(), I = []; for (let i = 0; i < n; i++) for (let j = 0; j < nr; j++) { const a = i * (nr + 1) + j, b = a + nr + 1; I.push(a, a + 1, b, b, a + 1, b + 1); }
  g.setAttribute("position", new THREE.BufferAttribute(P, 3)); g.setIndex(I); g.computeVertexNormals(); return g; }
const DRG = { x: 19.2, z: -24.2, y: 30.7, rot: -Math.PI / 2, cible: new THREE.Vector3(4, 31.6, -26.9) };
function dragonK(G) {
  const toit = DRG.y;
  const D = new THREE.Group(); D.position.set(DRG.x, toit, DRG.z); D.rotation.y = DRG.rot; D.scale.setScalar(1.3); G.add(D);
  const VERT = 0x3cc85a, VERT2 = 0x2a9a46, CREME = 0xffe7a0, ORANGE = 0xff9a2a, IVOIRE = 0xfff4d6, VIOLET = 0xb048e0, ROSE = 0xff6a8a;
  // (tout en « dessin animé » : des volumes ronds, une couleur franche, un contour noir épais)
  const T = (geo, c, x, y, z, sx = 1, sy = 1, sz = 1, par = D, ep = 1.08) => { const m = toonK(geo, c, ep); m.position.set(x, y, z); m.scale.set(sx, sy, sz); par.add(m); return m; };
  const boule = (r, seg = 20) => new THREE.SphereGeometry(r, seg, Math.round(seg * .75));
  // le corps, rond et dodu ; le ventre à rayures crème
  const corps = new THREE.Group(); corps.position.set(0, 3.2, 0); D.add(corps);
  T(boule(1, 24), VERT, 0, 0, 0, 2.6, 2.4, 3.3, corps);
  const rayures = tex(toile(64, 256, x => { x.fillStyle = "#ffe7a0"; x.fillRect(0, 0, 64, 256); x.fillStyle = "#e8bf6a"; for (let y = 0; y < 256; y += 32) x.fillRect(0, y, 64, 6); }));
  const ventre = new THREE.Mesh(boule(1, 24), new THREE.MeshToonMaterial({ map: rayures })); ventre.scale.set(1.95, 2, 2.7); ventre.position.set(0, -.45, .55); corps.add(ventre);
  for (let i = 0; i < 6; i++) { const pk = T(new THREE.ConeGeometry(.5 - i * .04, 1.1 - i * .07, 8), ORANGE, 0, 2.2 - Math.abs(i - 2.5) * .1, -2.4 + i * .95, 1, 1, .55, corps); pk.rotation.x = -.3; }
  // les pattes : courtes et rondes, trois grosses griffes
  for (const [sx, sz] of [[-1, 1.7], [1, 1.7], [-1, -1.9], [1, -1.9]]) { const pa = new THREE.Group(); pa.position.set(sx * 1.85, 1.2, sz); D.add(pa); T(boule(1), VERT2, 0, .2, 0, .85, 1.1, .85, pa); T(boule(1), VERT2, 0, -.75, .35, .7, .45, .95, pa);
    for (const gx of [-.32, 0, .32]) { const gr = T(new THREE.ConeGeometry(.15, .45, 8), IVOIRE, gx, -.85, 1.2, 1, 1, 1, pa); gr.rotation.x = Math.PI / 2; } }
  // le cou : gros et court, une crête de piquants
  const cou = new THREE.Group(); cou.position.set(0, 4.6, 2.5); D.add(cou);
  for (let i = 0; i < 4; i++) { T(boule(1.35 - i * .1), VERT, 0, i * .95, i * .55, 1, 1, 1, cou); const pk = T(new THREE.ConeGeometry(.35, .8, 8), ORANGE, 0, i * .95 + 1.2 - i * .1, i * .55 - .45, 1, 1, .55, cou); pk.rotation.x = -.7; }
  // la tête : grosse, ronde, un museau rond, des joues, de grands yeux, des sourcils froncés, deux cornes recourbées, des naseaux qui fument
  const tete = new THREE.Group(); tete.position.set(0, 4.2, 2.7); cou.add(tete);
  T(boule(1, 24), VERT, 0, .3, 0, 1.75, 1.55, 1.7, tete);
  T(boule(1, 24), VERT, 0, -.15, 1.65, 1.25, .85, 1.25, tete);   // (le museau)
  for (const sx of [-1, 1]) { T(boule(1), VERT, sx * 1.25, -.35, .7, .65, .6, .7, tete);   // (les joues)
    T(boule(.17, 10), 0x1a3a22, sx * .45, .2, 2.75, 1, .7, 1, tete, 1.0);   // (les naseaux)
    // les yeux : grands, blancs, la pupille noire, un reflet, la paupière qui leur donne l'air méchant
    const oe = new THREE.Group(); oe.position.set(sx * .78, .95, 1.1); tete.add(oe); T(boule(.62, 20), 0xffffff, 0, 0, 0, 1, 1.15, .8, oe, 1.1);
    const pu = T(boule(.32, 14), 0x111111, sx * -.05, -.05, .42, 1, 1.2, .6, oe, 1.0); const re = new THREE.Mesh(boule(.1, 8), new THREE.MeshBasicMaterial({ color: 0xffffff })); re.position.set(sx * -.12 + .05, .1, .62); oe.add(re);
    const pa = T(new THREE.SphereGeometry(.68, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2.2), VERT2, 0, .05, 0, 1, 1.1, .85, oe); pa.rotation.set(.35, 0, -sx * .45);   // (la paupière, de travers : l'air méchant)
    const cou2 = new THREE.CatmullRomCurve3([new THREE.Vector3(sx * .8, 1.3, -.3), new THREE.Vector3(sx * 1.4, 2.2, -.9), new THREE.Vector3(sx * 1.55, 2.9, -2), new THREE.Vector3(sx * 1.2, 3.1, -2.9)]);
    const corne = new THREE.Mesh(new THREE.TubeGeometry(cou2, 16, .3, 10), new THREE.MeshToonMaterial({ color: IVOIRE })); tete.add(corne); const cc = new THREE.Mesh(new THREE.TubeGeometry(cou2, 16, .3, 10), new THREE.MeshBasicMaterial({ color: 0x111111, side: THREE.BackSide })); cc.scale.setScalar(1.04); tete.add(cc);
    const or = T(new THREE.ConeGeometry(.4, 1.2, 8), VERT2, sx * 1.55, .9, -.5, 1, 1, .4, tete); or.rotation.set(-.3, 0, sx * 1.1); }   // (les oreilles en nageoire)
  // la mâchoire du bas : ronde, quatre gros crocs, la langue rose
  const mach = new THREE.Group(); mach.position.set(0, -.55, .6); tete.add(mach); T(boule(1, 20), VERT, 0, -.25, .95, 1.1, .5, 1.15, mach); T(boule(1, 16), ROSE, 0, 0, 1.1, .85, .2, .95, mach, 1.0);
  for (const sx of [-1, 1]) { const c1 = T(new THREE.ConeGeometry(.16, .5, 8), 0xffffff, sx * .62, .2, 1.75, 1, 1, 1, mach, 1.12); const c2 = T(new THREE.ConeGeometry(.16, .5, 8), 0xffffff, sx * .55, -.75, 2.3, 1, 1, 1, tete, 1.12); c2.rotation.x = Math.PI; }
  // les ailes : le bras osseux sur le bord d'attaque (épaule, coude, poignet et sa griffe), trois doigts en éventail ; la membrane tendue entre eux, au bord festonné, un peu creusée, nervurée, en dégradé
  const memTex = tex(toile(256, 256, x => { const g2 = x.createLinearGradient(0, 0, 256, 256); g2.addColorStop(0, "#ffb050"); g2.addColorStop(.45, "#e060c8"); g2.addColorStop(1, "#7a2ab8"); x.fillStyle = g2; x.fillRect(0, 0, 256, 256);
    x.strokeStyle = "rgba(90,20,110,.55)"; x.lineWidth = 5; x.lineCap = "round"; for (const [a2, b2] of [[250, 120], [230, 230], [150, 250], [60, 240]]) { x.beginPath(); x.moveTo(10, 20); x.quadraticCurveTo(a2 * .5, b2 * .3, a2, b2); x.stroke(); }
    x.strokeStyle = "rgba(255,255,255,.25)"; x.lineWidth = 3; for (let i = 0; i < 6; i++) { x.beginPath(); x.arc(40 + i * 30, 60 + i * 25, 30, 0, 1.2); x.stroke(); } }));
  const osM = new THREE.MeshToonMaterial({ color: VERT2 }), noirM = new THREE.MeshBasicMaterial({ color: 0x111111, side: THREE.BackSide });
  const os = (par, a2, b2, r0, r1) => { const c = new THREE.CatmullRomCurve3([a2, a2.clone().lerp(b2, .5).add(new THREE.Vector3(0, .15, 0)), b2]); for (const [m, k] of [[osM, 1], [noirM, 1]]) { const g2 = tubeEffile(c, r0 * (m === noirM ? 1.25 : 1) + (m === noirM ? .04 : 0), r1 * (m === noirM ? 1.3 : 1) + (m === noirM ? .03 : 0), 16, 10); par.add(new THREE.Mesh(g2, m)); } };
  const ailes = [-1, 1].map(sx => { const ai = new THREE.Group(); ai.position.set(sx * 1.7, 5.1, 1.1); D.add(ai);
    const V = (x2, z2) => new THREE.Vector3(sx * x2, 0, z2), epaule = V(0, 0), coude = V(2.4, .9), poignet = V(4.8, .3), bouts = [V(9, -.8), V(8.2, -3.6), V(5.8, -5.4)], racine = V(.6, -3.4);
    os(ai, epaule, coude, .34, .26); os(ai, coude, poignet, .26, .18); for (const b2 of bouts) os(ai, poignet, b2, .17, .05);
    const gr = T(new THREE.ConeGeometry(.16, .6, 8), IVOIRE, sx * 4.9, .2, 1, 1, 1, 1, ai); gr.rotation.z = -sx * .4;
    // (la membrane : bord festonné entre les doigts — chaque arc se creuse vers le poignet)
    const sh = new THREE.Shape(), P2 = v => [v.x, v.z]; sh.moveTo(...P2(epaule)); sh.lineTo(...P2(coude)); sh.lineTo(...P2(poignet)); sh.lineTo(...P2(bouts[0]));
    const seq2 = [bouts[0], bouts[1], bouts[2], racine]; for (let i = 0; i < 3; i++) { const a2 = seq2[i], b2 = seq2[i + 1], m = a2.clone().add(b2).multiplyScalar(.5).lerp(poignet, .32); sh.quadraticCurveTo(m.x, m.z, b2.x, b2.z); } sh.lineTo(...P2(epaule));
    const geo = new THREE.ShapeGeometry(sh, 16); geo.rotateX(Math.PI / 2); const pos = geo.attributes.position, uv = geo.attributes.uv;
    for (let i = 0; i < pos.count; i++) { const x2 = pos.getX(i), z2 = pos.getZ(i), d2 = Math.abs(x2); pos.setY(i, -.006 * d2 * d2 + .1 * Math.sin(d2 * .7) - .03 * Math.max(0, -z2)); uv.setXY(i, d2 / 9.2, 1 - (z2 + 5.6) / 6.8); }
    geo.computeVertexNormals(); const mem = new THREE.Mesh(geo, new THREE.MeshToonMaterial({ map: memTex, side: THREE.DoubleSide })); ai.add(mem);
    const bord = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x111111, side: THREE.BackSide })); bord.scale.set(1.025, 1, 1.025); bord.position.y = -.04; ai.add(bord); return ai; });
  // la queue : un seul tube lisse qui s'effile jusqu'à la pointe, des piquants sur le dessus, un fer de pique au bout ; elle ondule (on la recalcule à chaque image)
  const queueG = new THREE.Group(); queueG.position.set(0, 2.7, -2.9); D.add(queueG);
  const qPts = Array.from({ length: 7 }, (_, i) => new THREE.Vector3(0, -i * .28 + (i > 3 ? (i - 3) * .3 : 0), -i * 1.45)), qCourbe = new THREE.CatmullRomCurve3(qPts);
  const qMesh = new THREE.Mesh(tubeEffile(qCourbe, 1.15, .14, 40, 14), new THREE.MeshToonMaterial({ color: VERT })), qBord = new THREE.Mesh(tubeEffile(qCourbe, 1.24, .2, 40, 14), noirM); queueG.add(qMesh, qBord);
  const qPiq = Array.from({ length: 6 }, (_, i) => { const c = T(new THREE.ConeGeometry(.3 - i * .035, .75 - i * .07, 8), ORANGE, 0, 0, 0, 1, 1, .55, queueG); return c; });
  const pique = new THREE.Shape(); pique.moveTo(0, 1); pique.quadraticCurveTo(1, .45, .22, -.62); pique.lineTo(0, -.32); pique.lineTo(-.22, -.62); pique.quadraticCurveTo(-1, .45, 0, 1);
  const pq = T(new THREE.ExtrudeGeometry(pique, { depth: .22, bevelEnabled: true, bevelSize: .05, bevelThickness: .05 }), ORANGE, 0, 0, 0, 1.1, 1.1, 1.1, queueG);
  const majQueue = (T2, amp) => { for (let i = 1; i < qPts.length; i++) { const k = i / (qPts.length - 1); qPts[i].x = Math.sin(T2 * 1.7 - i * .7) * amp * k * k * 2.2; qPts[i].y = -i * .28 + (i > 3 ? (i - 3) * .3 : 0) + Math.sin(T2 * 1.2 - i * .5) * .25 * k; }
    tubeEffile(qCourbe, 1.15, .14, 40, 14, qMesh.geometry); tubeEffile(qCourbe, 1.24, .2, 40, 14, qBord.geometry);
    qPiq.forEach((c, i) => { const u2 = .12 + i * .13, p2 = qCourbe.getPointAt(u2), t2 = qCourbe.getTangentAt(u2), r2 = 1.15 + (.14 - 1.15) * Math.pow(u2, .8); c.position.set(p2.x, p2.y + r2 * .9, p2.z); c.rotation.set(-.4, Math.atan2(t2.x, t2.z) + Math.PI, 0); });
    const pf = qCourbe.getPointAt(1), tf = qCourbe.getTangentAt(1); pq.position.copy(pf).addScaledVector(tf, .55); pq.rotation.set(Math.PI / 2, 0, -Math.atan2(tf.x, -tf.z)); pq.rotation.order = "XZY"; };
  majQueue(0, .3);
  // le feu, façon dessin animé : un jet en trois couches (rouge, orange, jaune) aux bords nets qui ondulent, des flammèches dessinées, des nuages de fumée
  const bruit = tex(toile(64, 256, x => { const im = x.createImageData(64, 256); for (let j = 0; j < 256; j++) for (let i = 0; i < 64; i++) { const v = 165 + 55 * Math.sin(i / 64 * Math.PI * 4 + j * .045) + 35 * Math.sin(j * .07 + i / 64 * Math.PI * 2) - Math.max(0, j - 200) * 2.2;   /* (des vagues larges, pas des éclats ; le bout du jet s'effiloche) */ const k = (j * 64 + i) * 4; im.data[k] = im.data[k + 1] = im.data[k + 2] = Math.max(0, Math.min(255, v)); im.data[k + 3] = 255; } x.putImageData(im, 0, 0); }));
  bruit.wrapS = bruit.wrapT = THREE.RepeatWrapping;
  const jet = new THREE.Group(); G.add(jet); const couches = [[2.2, 0xe8361a, .3], [1.5, 0xff9a1a, .4], [.85, 0xffe94a, .5]].map(([r, c, seuil], i) => { const g2 = new THREE.CylinderGeometry(r * .18, r, 1, 24, 10, true); g2.translate(0, .5, 0); g2.rotateX(Math.PI / 2);
    const m = new THREE.MeshBasicMaterial({ color: c, alphaMap: bruit.clone(), alphaTest: seuil, side: THREE.DoubleSide, toneMapped: false, depthWrite: i === 0 }); m.color.multiplyScalar(1.25 + i * .15); m.alphaMap.wrapS = m.alphaMap.wrapT = THREE.RepeatWrapping; m.alphaMap.needsUpdate = true; const me = new THREE.Mesh(g2, m); me.renderOrder = 3 + i; jet.add(me); return me; });
  const contour = new THREE.Mesh(couches[0].geometry, new THREE.MeshBasicMaterial({ color: 0x3a0a00, side: THREE.BackSide, alphaMap: couches[0].material.alphaMap, alphaTest: .4 })); contour.scale.set(1.06, 1.06, 1); jet.add(contour); jet.visible = false;
  const flTex = tex(toile(128, 160, x => { const fl = (s2, c) => { x.save(); x.translate(64, 150); x.scale(s2, s2); x.beginPath(); x.moveTo(0, 0); x.bezierCurveTo(-55, -10, -40, -70, -10, -95); x.bezierCurveTo(-18, -60, 8, -70, 0, -140); x.bezierCurveTo(40, -90, 60, -40, 40, -15); x.bezierCurveTo(30, -2, 15, 2, 0, 0); x.closePath(); x.fillStyle = c; x.fill(); x.restore(); };
    x.lineWidth = 9; x.strokeStyle = "#3a0a00"; x.save(); x.translate(64, 150); x.beginPath(); x.moveTo(0, 0); x.bezierCurveTo(-55, -10, -40, -70, -10, -95); x.bezierCurveTo(-18, -60, 8, -70, 0, -140); x.bezierCurveTo(40, -90, 60, -40, 40, -15); x.bezierCurveTo(30, -2, 15, 2, 0, 0); x.closePath(); x.stroke(); x.restore();
    fl(1, "#e8361a"); fl(.72, "#ff9a1a"); fl(.42, "#ffe94a"); }));
  const fuTex = tex(toile(128, 128, x => { x.lineWidth = 6; x.strokeStyle = "#2a2a2a"; for (const [a, b2, r] of [[64, 70, 34], [38, 76, 24], [90, 76, 26], [64, 46, 26]]) { x.beginPath(); x.arc(a, b2, r, 0, 7); x.fillStyle = "#9a9aa4"; x.fill(); x.stroke(); } for (const [a, b2, r] of [[64, 70, 31], [38, 76, 21], [90, 76, 23], [64, 46, 23]]) { x.beginPath(); x.arc(a, b2, r, 0, 7); x.fillStyle = "#b8b8c2"; x.fill(); } x.fillStyle = "rgba(255,255,255,.5)"; x.beginPath(); x.arc(56, 40, 9, 0, 7); x.fill(); }));
  KC.flTex = flTex; const flam = Array.from({ length: 22 }, () => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: flTex, transparent: true, depthWrite: false, toneMapped: false })); sp.material.color.setScalar(1.3); sp.visible = false; G.add(sp); return { sp, vie: 0 }; });
  const fumees = Array.from({ length: 12 }, () => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: fuTex, transparent: true, depthWrite: false })); sp.visible = false; G.add(sp); return { sp, vie: 0 }; });
  const lum = new THREE.PointLight(0xff7a1a, 0, 40, 1.4); G.add(lum);
  KC.dragon = { D, corps, cou, tete, mach, ailes, majQueue, jet, couches, flam, fumees, lum, t: Math.random() * 3, touches: new Set(), bouche: new THREE.Vector3() }; }
/* pendant le final dans le ciel : le dragon quitte son balcon et traverse le ciel devant le nom du vainqueur, en grand, ailes déployées, en piqué puis en remontée */
function volDragon(Dg, dt) { const C = KR.ciel, D = Dg.D, t = C.t; if (!Dg.sauve) Dg.sauve = { p: D.position.clone(), r: D.rotation.clone(), s: D.scale.x };
  const u = Math.max(0, Math.min(1, (t - 2.2) / 8.5)), x = -95 + u * 190, y = C.chef ? 72 + Math.sin(u * Math.PI * 2) * 3 : 78 + Math.sin(u * Math.PI * 2) * 7 - Math.sin(u * Math.PI) * 4, z = CIEL.z + (C.chef ? 12 : 26) + Math.sin(u * Math.PI) * 10;   /* (avec le chef sur le dos : il passe plus bas, on voit son dos) */
  const pente = Math.cos(u * Math.PI * 2) * .28; D.position.set(x, y, z); D.scale.setScalar(C.chef ? 2 : 2.6); D.rotation.set(0, Math.PI / 2, 0); D.rotation.order = "YXZ"; D.rotation.x = -pente; D.rotation.z = .55 + Math.sin(t * 3.4) * .08;   /* (il s'incline vers nous : on voit son dos et ses ailes, pas son ventre) */
  D.visible = u > 0 && u < 1; Dg.cou.rotation.x = 1.0 + Math.sin(t * 3) * .06; Dg.cou.rotation.y = Math.sin(t * 1.3) * .2; Dg.tete.rotation.x = -.35; Dg.mach.rotation.x = .25 + Math.max(0, Math.sin(t * 2.2)) * .3;
  Dg.ailes.forEach((a, i) => { const sx = i ? 1 : -1; a.rotation.order = "YXZ"; a.rotation.x = .1; a.rotation.y = sx * .1; a.rotation.z = sx * (.15 + Math.sin(t * 6.5) * .65); });
  Dg.majQueue(t * 1.6, .55);
  Dg.jet.visible = false; for (const F of Dg.flam) { F.vie = 0; F.sp.visible = false; } Dg.lum.intensity = 0;
  // (le chef de poste, à cheval sur son dos, qui agite son arme)
  if (C.chef && !Dg.cavalier) { const c = figureChef(); c.g.scale.setScalar(1.9); c.g.position.set(0, 4.6, .2); c.jambes[0].rotation.set(-1.3, 0, -.5); c.jambes[1].rotation.set(-1.3, 0, .5); const a = armeK(); c.bras[0].add(a); a.position.set(0, -.62, 0); const cp = coupeK(); cp.scale.setScalar(2.6); cp.position.set(0, -.8, 0); cp.rotation.x = Math.PI; c.bras[1].add(cp); c.coupe = cp; D.add(c.g); Dg.cavalier = c; }
  if (Dg.cavalier) { const c = Dg.cavalier; c.bras[0].rotation.set(-2.6 + Math.sin(t * 7) * .35, 0, -.3); c.bras[1].rotation.set(-2.9 + Math.sin(t * 5) * .15, 0, .25); c.coupe.rotation.y = t * 2;   /* (la coupe brandie au-dessus de la tête) */ c.g.rotation.z = Math.sin(t * 3.4) * .06; } }
function retourDragon() { const Dg = KC.dragon; if (!Dg || !Dg.sauve) return; if (Dg.cavalier) { Dg.D.remove(Dg.cavalier.g); Dg.cavalier = null; } Dg.D.position.copy(Dg.sauve.p); Dg.D.rotation.copy(Dg.sauve.r); Dg.D.scale.setScalar(Dg.sauve.s); Dg.D.visible = true; Dg.sauve = null; }
function majDragon(dt, t) { const Dg = KC.dragon; if (!Dg) return; Dg.t += dt; if (KR.ciel) { volDragon(Dg, dt); return; } if (Dg.sauve) retourDragon(); const T = Dg.t, cyc = T % 7, D = Dg.D;
  // (de quoi il a l'air : il respire, la queue ondule, les ailes battent ; toutes les 7 s, il se cabre, rugit, et crache le feu sur la voie des toits)
  Dg.corps.scale.set(1, 1 + Math.sin(T * 2.2) * .025, 1);
  Dg.majQueue(T, .35);
  const cabre = cyc < 1.4 ? Math.sin(cyc / 1.4 * Math.PI / 2) : cyc < 4.2 ? 1 - (cyc - 1.4) / 2.8 * .7 : Math.max(0, .3 - (cyc - 4.2) * .2), crache = cyc > 1.7 && cyc < 4.1;
  const bat = crache ? .55 : .22; Dg.ailes.forEach((a, i) => { const sx = i ? 1 : -1; a.rotation.order = "YXZ"; a.rotation.x = .25; a.rotation.y = sx * .35; a.rotation.z = sx * (.55 + Math.sin(T * (crache ? 6 : 2.2)) * bat); });   /* (les ailes levées en V, un peu repliées vers l'arrière, qui battent) */
  // (la tête : elle suit le kart le plus proche quand il n'y a pas de feu, et vise la voie des toits quand il crache)
  let cible = DRG.cible; if (!crache) { let best = null, bd = 1e9; for (const p of KR.pil || []) { const d = p.K.g.position.distanceTo(D.position); if (d < bd) { bd = d; best = p; } } if (best && bd < 60) cible = best.K.g.position; }
  const cr = Math.cos(-DRG.rot), sr = Math.sin(-DRG.rot), wx = cible.x - D.position.x, wz = cible.z - D.position.z, dx = wx * cr + wz * sr, dz = -wx * sr + wz * cr - 6, dy = cible.y - (D.position.y + 7);
  const yaw = Math.max(-.9, Math.min(.9, Math.atan2(dx, dz))), pitch = Math.max(-.2, Math.min(1.1, -Math.atan2(dy, Math.hypot(dx, dz)) * .9));
  Dg.cou.rotation.y += (yaw * .6 - Dg.cou.rotation.y) * Math.min(1, dt * 3); Dg.cou.rotation.x += ((.45 + pitch * .35 - cabre * .45) - Dg.cou.rotation.x) * Math.min(1, dt * 3);
  Dg.tete.rotation.y += (yaw * .4 - Dg.tete.rotation.y) * Math.min(1, dt * 3); Dg.tete.rotation.x += ((pitch * .45 - cabre * .35) - Dg.tete.rotation.x) * Math.min(1, dt * 3);
  const ouvre = cyc > 1.2 && cyc < 4.3 ? (crache ? .62 + Math.sin(T * 30) * .04 : .5) : .05 + Math.max(0, Math.sin(T * .9)) * .06; Dg.mach.rotation.x += (ouvre - Dg.mach.rotation.x) * Math.min(1, dt * 10);
  // (le rugissement, si l'on est assez près pour l'entendre)
  const moi = KR.moi, pres = moi && moi.K.g.position.distanceTo(D.position) < 70; if (cyc > 1.2 && !Dg.rugi) { Dg.rugi = true; if (pres) sonK("rugit"); } if (cyc > 1.7 && !Dg.souf) { Dg.souf = true; if (pres) sonK("souffle"); Dg.touches.clear(); } if (cyc < 1) { Dg.rugi = Dg.souf = false; }
  // le feu
  Dg.tete.updateWorldMatrix(true, false); const bouche = Dg.bouche.set(0, -.1, 2.9).applyMatrix4(Dg.tete.matrixWorld);
  const dir = new THREE.Vector3().subVectors(DRG.cible, bouche), L = dir.length(); dir.normalize();
  // le jet : il sort de la gueule, s'allonge jusqu'à la voie des toits, ses bords ondulent (la texture de bruit défile), il vacille
  const pousse = crache ? Math.min(1, (cyc - 1.7) / .35) : 0, fin = cyc > 3.7 && crache ? 1 - (cyc - 3.7) / .4 : 1, l = L * pousse * Math.max(0, fin);
  Dg.jet.visible = crache && l > .3; if (Dg.jet.visible) { Dg.jet.position.copy(bouche); Dg.jet.lookAt(DRG.cible); Dg.jet.scale.set(1 + Math.sin(T * 25) * .06, 1 + Math.cos(T * 21) * .06, l);
    Dg.couches.forEach((c, i) => { c.material.alphaMap.offset.set(T * (.3 + i * .1), -T * (2.6 + i * .9)); c.material.alphaMap.repeat.set(1, .8 + i * .15); }); }
  if (crache) { Dg.lum.position.copy(bouche).lerp(DRG.cible, .5); Dg.lum.intensity = 70 + Math.random() * 50;
    // (les flammèches : elles jaillissent le long du jet et s'envolent)
    for (let k = 0; k < 1; k++) { const F = Dg.flam.find(q => q.vie <= 0); if (!F) break; F.vie = F.max = .5 + Math.random() * .35; F.u = Math.random() * .9; F.dx = (Math.random() - .5) * 2.5; F.dy = (Math.random() - .5) * 2.5; F.rot = (Math.random() - .5) * 1.2; F.sp.visible = true; }
    if (Math.random() < dt * 6 && l > L * .8) { const F = Dg.fumees.find(q => q.vie <= 0); if (F) { F.vie = F.max = 1.4; F.sp.visible = true; F.sp.position.copy(DRG.cible).add(new THREE.Vector3((Math.random() - .5) * 4, Math.random(), (Math.random() - .5) * 3)); } }
    // (le feu touche ceux qui passent dessous, sur la voie des toits)
    for (const p of KR.pil) { if (!(p.moi || p.bot) || p.fini || p.gyro > 0 || Dg.touches.has(p.id) || l < L * .7) continue; const P = p.K.g.position, ap = new THREE.Vector3().subVectors(P, bouche), u = Math.max(0, Math.min(1, ap.dot(dir) / L));
      if (u > .55 && ap.distanceTo(dir.clone().multiplyScalar(u * L)) < 2.8) { Dg.touches.add(p.id); p.spin = 1.1; p.etoiles = 2; p.v *= .45; p.brule = 2.6; p.enFeu = true; if (p.moi) { sonK("aie"); const f = KR.hud && KR.hud.querySelector("#kFeu"); if (f) { f.style.transition = "none"; f.style.opacity = 1; requestAnimationFrame(() => { f.style.transition = "opacity 1.4s"; f.style.opacity = 0; }); } } } } }
  else { Dg.lum.intensity = Math.max(0, Dg.lum.intensity - dt * 200); if (Math.random() < dt * 1.5) { const F = Dg.fumees.find(q => q.vie <= 0); if (F) { F.vie = F.max = 1.6; F.sp.visible = true; F.sp.position.set(0, .2, 2.9).applyMatrix4(Dg.tete.matrixWorld); } } }   /* (au repos, un peu de fumée qui sort des naseaux) */
  for (const F of Dg.flam) { if (F.vie <= 0) { F.sp.visible = false; continue; } F.vie -= dt; const a = 1 - F.vie / F.max, u = Math.min(1, F.u + a * .6);
    F.sp.position.copy(bouche).addScaledVector(dir, u * l); F.sp.position.x += F.dx * a * 1.5; F.sp.position.y += F.dy * a + a * 2; F.sp.position.z += F.dx * a * .5;
    const tl = (1 + u * 2.6) * (a < .2 ? a / .2 : 1 - (a - .2) * .6); F.sp.scale.set(tl * .8, tl, 1); F.sp.material.rotation = F.rot * a; F.sp.material.opacity = Math.min(1, F.vie * 4); }
  for (const F of Dg.fumees) { if (F.vie <= 0) { F.sp.visible = false; continue; } F.vie -= dt; const a = 1 - F.vie / F.max; F.sp.position.y += dt * 2.2; F.sp.scale.setScalar(1.5 + a * 3); F.sp.material.opacity = Math.min(1, F.vie * 1.5); } }

function pisteVisibleK(v) { for (const o of KC.pisteObjs || []) { if (!v) { if (o.userData.cache) continue; o.userData.cache = true; o.userData.vis = o.visible; o.visible = false; } else if (o.userData.cache) { o.userData.cache = false; o.visible = o.userData.vis; } } }
/* ---------- la cascade : la descente des toits, une grande glissade d'eau qui dévale du toit de l'horloge jusqu'à la piscine ---------- */
function cascadeK(G) { const B = KC.B; if (!B) return; let i0 = -1, i1 = -1;
  for (let i = 1; i < B.N; i++) { const p = B.pts[i]; if (i0 < 0 && p.z > -21 && p.x > 11 && p.y > 29) i0 = i; if (i0 >= 0 && p.y < 8.7) { i1 = i; break; } } if (i0 < 0 || i1 < 0) return; i0 = Math.max(0, i0 - 4);
  const P = [], U = [], I = []; let v = 0;
  for (let i = i0; i <= i1; i++) { const q = B.pts[i], n = B.nor[i], w = B.lar[i] / 2 - .15; if (i > i0) v += q.distanceTo(B.pts[i - 1]) / 4;
    for (const f of [-1, -.5, 0, .5, 1]) P.push(q.x + n.x * w * f, q.y + .07 + (1 - Math.abs(f)) * .05, q.z + n.z * w * f), U.push((f + 1) / 2, v); }
  for (let k = 0; k < i1 - i0; k++) for (let j = 0; j < 4; j++) { const a = k * 5 + j, b = a + 5; I.push(a, b, a + 1, a + 1, b, b + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(U, 2)); g.setIndex(I); g.computeVertexNormals();
  // l'eau qui dévale : des traînées blanches qui descendent, du turquoise, de l'écume sur les bords
  const t = tex(toile(128, 256, x => { const gr = x.createLinearGradient(0, 0, 128, 0); gr.addColorStop(0, "#e8fbff"); gr.addColorStop(.12, "#5ad8f4"); gr.addColorStop(.5, "#2ab4e4"); gr.addColorStop(.88, "#5ad8f4"); gr.addColorStop(1, "#e8fbff"); x.fillStyle = gr; x.fillRect(0, 0, 128, 256);
    x.strokeStyle = "rgba(255,255,255,.85)"; x.lineCap = "round"; for (let k = 0; k < 26; k++) { const cx = 8 + Math.random() * 112, cy = Math.random() * 256, l = 20 + Math.random() * 50; x.lineWidth = 2 + Math.random() * 4; x.beginPath(); x.moveTo(cx, cy); x.quadraticCurveTo(cx + (Math.random() - .5) * 10, cy + l / 2, cx, cy + l); x.stroke(); } }));
  t.wrapS = t.wrapT = THREE.RepeatWrapping; const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: .9, side: THREE.DoubleSide, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -6, depthWrite: false })); m.renderOrder = 2; G.add(m);
  // des rideaux d'eau qui débordent des deux côtés de la glissade, et une écume qui roule dedans
  const R = [], RU = [], RI = []; let rv = 0; for (const sd of [-1, 1]) { const b0 = R.length / 3; rv = 0;
    for (let i = i0; i <= i1; i++) { const q = B.pts[i], n = B.nor[i], w = B.lar[i] / 2 + .05; if (i > i0) rv += q.distanceTo(B.pts[i - 1]) / 4; R.push(q.x + n.x * w * sd, q.y + .25, q.z + n.z * w * sd, q.x + n.x * (w + .5) * sd, q.y - 2.2, q.z + n.z * (w + .5) * sd); RU.push(0, rv, 1, rv); }
    for (let k = 0; k < i1 - i0; k++) { const a = b0 + k * 2; RI.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); } }
  const rg = new THREE.BufferGeometry(); rg.setAttribute("position", new THREE.Float32BufferAttribute(R, 3)); rg.setAttribute("uv", new THREE.Float32BufferAttribute(RU, 2)); rg.setIndex(RI);
  const rt = t.clone(); rt.needsUpdate = true; rt.wrapS = rt.wrapT = THREE.RepeatWrapping; const rm = new THREE.Mesh(rg, new THREE.MeshBasicMaterial({ map: rt, transparent: true, opacity: .55, side: THREE.DoubleSide, toneMapped: false, depthWrite: false })); G.add(rm);
  const ecT = tex(toile(64, 64, x => { x.fillStyle = "#ffffff"; x.strokeStyle = "#7ac8e8"; x.lineWidth = 4; for (const [a, b, r] of [[32, 34, 16], [18, 40, 11], [46, 40, 12]]) { x.beginPath(); x.arc(a, b, r, 0, 7); x.fill(); x.stroke(); } x.fillStyle = "#fff"; for (const [a, b, r] of [[32, 34, 13], [18, 40, 8], [46, 40, 9]]) { x.beginPath(); x.arc(a, b, r, 0, 7); x.fill(); } }));
  const ecume = Array.from({ length: 22 }, (_, k) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: ecT, transparent: true, depthWrite: false })); G.add(sp); return { sp, u: k / 22, d: (Math.random() - .5) * 1.4, v: .25 + Math.random() * .15 }; });
  KC.cascade = { t, rt, ecume, i0, i1 }; }
function majCascade(dt, t) { const C = KC.cascade; if (!C) return; C.t.offset.y = -t / 380; C.rt.offset.y = -t / 300; const B = KC.B;
  for (const E of C.ecume) { E.u += dt * E.v; if (E.u > 1) { E.u -= 1; E.d = (Math.random() - .5) * 1.4; } const f = C.i0 + E.u * (C.i1 - C.i0), i = Math.floor(f), q = B.pts[Math.min(i, B.N - 1)], n = B.nor[Math.min(i, B.N - 1)];
    E.sp.position.set(q.x + n.x * E.d * B.lar[i] * .35, q.y + .35, q.z + n.z * E.d * B.lar[i] * .35); E.sp.scale.setScalar(.45 + Math.sin(E.u * 30 + E.d * 9) * .12); }
  if (Math.random() < dt * 5) gercheK(new THREE.Vector3(PISCINE.x + (Math.random() - .5) * 2, PISCINE.y + .3, PISCINE.z - 1.4), new THREE.Vector3(0, 0, 3), false); }
/* ---------- la piscine sur le toit : au bas de la descente des toits, on y plonge — une grande gerbe d'eau dessinée, des gouttes, de la mousse ---------- */
function piscineK(G) { const P = PISCINE, g = new THREE.Group(); g.position.set(P.x, P.y, P.z); G.add(g);
  const carreau = tex(toile(64, 64, x => { x.fillStyle = "#e8f4fa"; x.fillRect(0, 0, 64, 64); x.strokeStyle = "#7ab8d8"; x.lineWidth = 3; x.strokeRect(0, 0, 32, 32); x.strokeRect(32, 32, 32, 32); x.strokeRect(32, 0, 32, 32); x.strokeRect(0, 32, 32, 32); })); carreau.wrapS = carreau.wrapT = THREE.RepeatWrapping; carreau.repeat.set(4, 1);
  const bord = new THREE.MeshStandardMaterial({ map: carreau, roughness: .4 });
  for (const [x, z, lx, lz] of [[-P.lx / 2 - .25, 0, .5, P.lz], [P.lx / 2 + .25, 0, .5, P.lz]]) { const m = new THREE.Mesh(new THREE.BoxGeometry(lx, .55, lz), bord); m.position.set(x, .28, z); g.add(m); }
  // l'eau : un bleu turquoise de dessin animé, des vaguelettes blanches qui bougent, un peu transparente
  const eauT = tex(toile(128, 128, x => { x.fillStyle = "#3ac8e8"; x.fillRect(0, 0, 128, 128); x.strokeStyle = "rgba(255,255,255,.75)"; x.lineWidth = 4; x.lineCap = "round"; for (let i = 0; i < 9; i++) { const cx = Math.random() * 128, cy = Math.random() * 128; x.beginPath(); x.arc(cx, cy, 10 + Math.random() * 8, Math.PI * 1.15, Math.PI * 1.85); x.stroke(); } }));
  eauT.wrapS = eauT.wrapT = THREE.RepeatWrapping; eauT.repeat.set(2, 2); const eau = new THREE.Mesh(new THREE.PlaneGeometry(P.lx, P.lz), new THREE.MeshBasicMaterial({ map: eauT, transparent: true, opacity: .88, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -8 })); eau.rotation.x = -Math.PI / 2; eau.position.y = .5; g.add(eau);
  // une bouée, un plongeoir, un parasol : c'est une piscine !
  const bouee = new THREE.Mesh(new THREE.TorusGeometry(.42, .16, 10, 20), new THREE.MeshToonMaterial({ color: 0xff4a3a })); bouee.rotation.x = Math.PI / 2; bouee.position.set(1.4, .56, -1.2); g.add(bouee);
  const plong = new THREE.Mesh(new THREE.BoxGeometry(.6, .1, 1.6), new THREE.MeshStandardMaterial({ color: 0x2a6aa8 })); plong.position.set(-P.lx / 2 - .2, .75, -1.4); g.add(plong);
  const gouttes = tex(toile(64, 64, x => { x.fillStyle = "#e8faff"; x.strokeStyle = "#1a6a98"; x.lineWidth = 5; x.beginPath(); x.moveTo(32, 4); x.bezierCurveTo(52, 30, 54, 44, 32, 58); x.bezierCurveTo(10, 44, 12, 30, 32, 4); x.fill(); x.stroke(); x.fillStyle = "#ffffff"; x.beginPath(); x.ellipse(26, 38, 5, 8, -.4, 0, 7); x.fill(); }));
  const mousse = tex(toile(64, 64, x => { x.fillStyle = "#ffffff"; x.strokeStyle = "#7ac8e8"; x.lineWidth = 4; for (const [a, b, r] of [[32, 34, 18], [18, 40, 12], [46, 40, 13], [32, 22, 12]]) { x.beginPath(); x.arc(a, b, r, 0, 7); x.fill(); x.stroke(); } x.fillStyle = "#ffffff"; for (const [a, b, r] of [[32, 34, 15], [18, 40, 9], [46, 40, 10], [32, 22, 9]]) { x.beginPath(); x.arc(a, b, r, 0, 7); x.fill(); } }));
  KC.piscine = { eau: eauT, gouttes: Array.from({ length: 70 }, () => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: gouttes, transparent: true, depthWrite: false })); sp.visible = false; G.add(sp); return { sp, vie: 0 }; }),
    mousse: Array.from({ length: 16 }, () => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: mousse, transparent: true, depthWrite: false })); sp.visible = false; G.add(sp); return { sp, vie: 0 }; }) }; }
function dansCascadeK(p) { const C = KC.cascade; if (!C || !KC.dev || p.s < KC.dev[0] || p.s > KC.dev[1]) return false; const i = (p.s - KC.dev[0]) / KC.pas; return i >= C.i0 + 4 && i <= C.i1; }
function dansPiscine(P3) { const P = PISCINE; return Math.abs(P3.x - P.x) < P.lx / 2 && Math.abs(P3.z - P.z) < P.lz / 2 && P3.y < P.y + 1.2; }
function gercheK(pos, v, fort) { const Pi = KC.piscine; if (!Pi) return; const n = fort ? 34 : 3;
  for (let k = 0; k < n; k++) { const G2 = Pi.gouttes.find(q => q.vie <= 0); if (!G2) break; const a = Math.random() * Math.PI * 2, f = fort ? 2 + Math.random() * 3.5 : 1 + Math.random(); G2.vie = G2.max = .8 + Math.random() * .5; G2.sp.visible = true; G2.sp.position.copy(pos); G2.sp.position.y += .3; G2.vx = Math.cos(a) * f + v.x * .2; G2.vz = Math.sin(a) * f + v.z * .2; G2.vy = (fort ? 5 : 2.5) + Math.random() * 3; G2.t = .14 + Math.random() * .12; }
  if (fort) for (let k = 0; k < 8; k++) { const F = Pi.mousse.find(q => q.vie <= 0); if (!F) break; F.vie = F.max = 1.2; F.sp.visible = true; F.sp.position.copy(pos).add(new THREE.Vector3((Math.random() - .5) * 2, .5, (Math.random() - .5) * 2)); } }
function majPiscine(dt, t) { try { majCascade(dt, t); } catch (e) { } const Pi = KC.piscine; if (!Pi) return; Pi.eau.offset.set(Math.sin(t / 1400) * .1, t / 9000);
  for (const G2 of Pi.gouttes) { if (G2.vie <= 0) { G2.sp.visible = false; continue; } G2.vie -= dt; G2.vy -= 14 * dt; G2.sp.position.x += G2.vx * dt; G2.sp.position.y += G2.vy * dt; G2.sp.position.z += G2.vz * dt; G2.sp.scale.setScalar(G2.t * (1 + (1 - G2.vie / G2.max) * .5)); G2.sp.material.rotation = Math.atan2(G2.vx, G2.vy) * -1; }
  for (const F of Pi.mousse) { if (F.vie <= 0) { F.sp.visible = false; continue; } F.vie -= dt; const a = 1 - F.vie / F.max; F.sp.scale.setScalar(.35 + a * .75); F.sp.material.opacity = Math.min(1, F.vie * 2.5); }
  for (const p of KR.pil || []) { const P3 = p.K.g.position; if (dansPiscine(P3) && Math.abs(p.v) > 1.5) { if (!p.mouille) { p.mouille = true; gercheK(P3, new THREE.Vector3(Math.sin(p.h) * p.v, 0, Math.cos(p.h) * p.v), true);
        if (p.moi) { sonK("plouf"); const e = KR.hud && KR.hud.querySelector("#kEau"); if (e) { e.style.transition = "none"; e.style.opacity = 1; requestAnimationFrame(() => { e.style.transition = "opacity 2.2s"; e.style.opacity = 0; }); } } }
      else if (Math.random() < dt * 25) gercheK(P3, new THREE.Vector3(), false); }
    else if (p.mouille && !dansPiscine(P3)) p.mouille = false; } }

/* ---------- Paris, au loin : la tour Eiffel illuminée (qui scintille), le Sacré-Cœur sur sa butte, l'Arc de Triomphe, la tour Montparnasse, Notre-Dame, et des centaines de toits ---------- */
function parisK(G) { const P = new THREE.Group(); P.name = "paris"; G.add(P); const sombre = c => new THREE.MeshBasicMaterial({ color: c, fog: false });
  // les toits de Paris : des immeubles en masse, fenêtres allumées
  const fen = tex(toile(64, 64, x => { x.fillStyle = "#151b30"; x.fillRect(0, 0, 64, 64); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) if (Math.random() < .45) { x.fillStyle = Math.random() < .7 ? "#ffcf7a" : "#cfe3ff"; x.fillRect(4 + i * 15, 4 + j * 15, 7, 9); } })); fen.wrapS = fen.wrapT = THREE.RepeatWrapping; fen.repeat.set(3, 2);
  const n = 460, im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ map: fen, fog: false }), n), toits = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), sombre(0x2a3348), n), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, r = 190 + Math.random() * Math.random() * 520, x = Math.cos(a) * r, z = -50 + Math.sin(a) * r, h = 16 + Math.random() * 18, w = 14 + Math.random() * 20, d = 12 + Math.random() * 16;
    q.setFromEuler(e.set(0, Math.random() * Math.PI, 0)); m4.compose(new THREE.Vector3(x, h / 2, z), q, new THREE.Vector3(w, h, d)); im.setMatrixAt(i, m4); m4.compose(new THREE.Vector3(x, h + 2, z), q, new THREE.Vector3(w * .86, 4, d * .8)); toits.setMatrixAt(i, m4); }
  im.frustumCulled = toits.frustumCulled = false; P.add(im, toits);
  // la tour Eiffel, tout en or, à l'est (droit devant, sur la voie des toits)
  { const E = new THREE.Group(); E.position.set(560, 0, -40); E.scale.setScalar(.62); P.add(E);
    const latt = tex(toile(128, 128, x => { x.clearRect(0, 0, 128, 128); x.strokeStyle = "#fff"; x.lineWidth = 6; x.strokeRect(3, 3, 122, 122); x.lineWidth = 3; x.beginPath(); x.moveTo(0, 0); x.lineTo(128, 128); x.moveTo(128, 0); x.lineTo(0, 128); x.moveTo(64, 0); x.lineTo(64, 128); x.stroke(); }));
    latt.wrapS = latt.wrapT = THREE.RepeatWrapping; const or = new THREE.MeshBasicMaterial({ color: 0xffa83a, alphaMap: latt, transparent: true, alphaTest: .3, side: THREE.DoubleSide, fog: false, toneMapped: false }); or.color.multiplyScalar(1.7);
    const etage = (rb, rt, h, y, rep) => { const g = new THREE.CylinderGeometry(rt, rb, h, 4, 1, true); const m = new THREE.Mesh(g, or.clone()); m.material.alphaMap = latt.clone(); m.material.alphaMap.repeat.set(rep, Math.max(1, Math.round(h / 14))); m.material.alphaMap.needsUpdate = true; m.position.y = y + h / 2; m.rotation.y = Math.PI / 4; E.add(m); };
    etage(88, 50, 58, 0, 6); etage(50, 28, 58, 58, 4); etage(28, 7, 160, 116, 2); etage(7, 2.5, 30, 276, 1);
    for (const [y, r] of [[58, 54], [116, 31], [276, 8.5]]) { const pl = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 3, 4), or); pl.rotation.y = Math.PI / 4; pl.position.y = y; E.add(pl); }
    const ant = new THREE.Mesh(new THREE.CylinderGeometry(.6, 1.2, 30, 6), or); ant.position.y = 320; E.add(ant);
    // (les mille lumières qui scintillent, et le phare qui tourne au sommet)
    const ns = 700, ps = new Float32Array(ns * 3); for (let i = 0; i < ns; i++) { const y = Math.random() * 300, r = y < 58 ? 88 - y / 58 * 38 : y < 116 ? 50 - (y - 58) / 58 * 22 : y < 276 ? 28 - (y - 116) / 160 * 21 : 6, f = Math.floor(Math.random() * 4), u = Math.random() * 2 - 1;
      const cx = [[1, u], [-1, u], [u, 1], [u, -1]][f]; ps[i * 3] = cx[0] * r * .71; ps[i * 3 + 1] = y; ps[i * 3 + 2] = cx[1] * r * .71; }
    const gs = new THREE.BufferGeometry(); gs.setAttribute("position", new THREE.BufferAttribute(ps, 3)); const sc = new THREE.Points(gs, new THREE.PointsMaterial({ size: 5, map: texPoint(), color: 0xffffff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, toneMapped: false })); E.add(sc);
    const phare = new THREE.Group(); phare.position.y = 300; E.add(phare); for (const sd of [0, Math.PI]) { const f = new THREE.Mesh(new THREE.ConeGeometry(14, 420, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff2c0, transparent: true, opacity: .07, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); f.rotation.z = Math.PI / 2; f.position.x = 210; f.rotation.y = sd; const piv = new THREE.Group(); piv.rotation.y = sd; piv.add(f); phare.add(piv); }
    KC.eiffel = { sc, phare }; }
  // le Sacré-Cœur, tout blanc sur la butte Montmartre (au nord)
  { const S = new THREE.Group(); S.position.set(-160, 0, 520); P.add(S); const butte = new THREE.Mesh(new THREE.SphereGeometry(120, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), sombre(0x18203a)); butte.scale.y = .38; S.add(butte);
    const blanc = new THREE.MeshBasicMaterial({ color: 0xe8e4f4, fog: false, toneMapped: false }); blanc.color.multiplyScalar(1.15); const base = new THREE.Mesh(new THREE.BoxGeometry(46, 30, 40), blanc); base.position.y = 60; S.add(base);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(15, 20, 14, 0, Math.PI * 2, 0, Math.PI * .62), blanc); dome.scale.y = 1.45; dome.position.y = 82; S.add(dome); const lant = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 3.5, 10, 10), blanc); lant.position.y = 112; S.add(lant);
    for (const [x, z] of [[-17, 14], [17, 14], [-17, -14], [17, -14]]) { const d = new THREE.Mesh(new THREE.SphereGeometry(6, 12, 10, 0, Math.PI * 2, 0, Math.PI * .6), blanc); d.scale.y = 1.4; d.position.set(x, 76, z); S.add(d); }
    const camp = new THREE.Mesh(new THREE.BoxGeometry(9, 50, 9), blanc); camp.position.set(0, 70, -26); S.add(camp); }
  // l'Arc de Triomphe (au nord-est), la tour Montparnasse (au sud, son toit rouge), Notre-Dame (au sud-ouest)
  { const arc = new THREE.Group(); arc.position.set(430, 0, 330); arc.rotation.y = .6; P.add(arc); const pierre = new THREE.MeshBasicMaterial({ color: 0xd8b878, fog: false, toneMapped: false }); pierre.color.multiplyScalar(1.1);
    for (const sx of [-1, 1]) { const pi = new THREE.Mesh(new THREE.BoxGeometry(14, 32, 22), pierre); pi.position.set(sx * 15, 16, 0); arc.add(pi); } const haut = new THREE.Mesh(new THREE.BoxGeometry(44, 18, 22), pierre); haut.position.y = 41; arc.add(haut);
    const mo = new THREE.Mesh(new THREE.BoxGeometry(32, 210, 22), new THREE.MeshBasicMaterial({ map: (() => { const t2 = tex(toile(64, 256, x => { x.fillStyle = "#0e1220"; x.fillRect(0, 0, 64, 256); for (let j = 0; j < 64; j++) for (let i = 0; i < 8; i++) if (Math.random() < .5) { x.fillStyle = "#9ab8e8"; x.fillRect(i * 8 + 1, j * 4 + 1, 5, 2); } })); return t2; })(), fog: false })); mo.position.set(140, 105, -560); P.add(mo);
    const feuR = new THREE.Mesh(new THREE.SphereGeometry(2, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff2020, toneMapped: false, fog: false })); feuR.material.color.multiplyScalar(3); feuR.position.set(140, 212, -560); P.add(feuR); KC.feuMo = feuR;
    const nd = new THREE.Group(); nd.position.set(-470, 0, -300); nd.rotation.y = -.4; P.add(nd); const gris = new THREE.MeshBasicMaterial({ color: 0xc8c0b0, fog: false }); const nef = new THREE.Mesh(new THREE.BoxGeometry(28, 32, 110), gris); nef.position.y = 16; nd.add(nef);
    for (const sx of [-1, 1]) { const to = new THREE.Mesh(new THREE.BoxGeometry(14, 68, 14), gris); to.position.set(sx * 10, 34, 55); nd.add(to); } const fl = new THREE.Mesh(new THREE.ConeGeometry(3, 46, 8), gris); fl.position.set(0, 55, 0); nd.add(fl); }
  KC.paris = P; }
function majParis(t) { if (KC.eiffel) { KC.eiffel.phare.rotation.y = t / 2600; const sc = KC.eiffel.sc; sc.visible = Math.floor(t / 1000) % 20 < 10 ? Math.random() < .93 : false; sc.material.opacity = .6 + Math.random() * .4; } if (KC.feuMo) KC.feuMo.visible = Math.floor(t / 900) % 2 === 0; }

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
  const ombre = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 2.9), new THREE.MeshBasicMaterial({ map: texOmbre(), transparent: true, opacity: .75, depthWrite: false })); ombre.rotation.x = -Math.PI / 2; ombre.position.y = .02; ombre.renderOrder = -1; g.add(ombre);
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
  const corpsK = new THREE.Group(); for (const o of [...g.children]) if (!roues.includes(o) && !pivots.includes(o) && !etin.includes(o) && o !== sp && o.material !== undefined && !(o.material && (o.material.map === texNe || o.material.map === texOm))) corpsK.add(o); g.add(corpsK);
  return { g, roues, pivots, etin, flamme, corpsK, gy, casque, vis, corps, et: sp, coul: couleur }; }
let texOm = null; function texOmbre() { return texOm = texOm || tex(toile(64, 128, x => { const gr = x.createRadialGradient(32, 64, 6, 32, 64, 60); gr.addColorStop(0, "rgba(0,0,0,.85)"); gr.addColorStop(.6, "rgba(0,0,0,.4)"); gr.addColorStop(1, "rgba(0,0,0,0)"); x.fillStyle = gr; x.scale(1, 2); x.fillRect(0, 0, 64, 64); })); }
let texNe = null; function texNeon() { return texNe = texNe || tex(toile(64, 128, x => { const gr = x.createRadialGradient(32, 64, 4, 32, 64, 60); gr.addColorStop(0, "rgba(255,255,255,.9)"); gr.addColorStop(.5, "rgba(255,255,255,.35)"); gr.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = gr; x.scale(1, 2); x.fillRect(0, 0, 64, 64); })); }
let texEo = null; function texEtoile() { return texEo = texEo || tex(toile(64, 64, x => { x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 12 : 28; x.lineTo(32 + Math.cos(a) * r, 33 + Math.sin(a) * r); } x.closePath(); x.fillStyle = "#ffe23a"; x.fill(); x.lineWidth = 4; x.strokeStyle = "#111"; x.stroke(); })); }
let texEt = null; function texEtincelle() { return texEt = texEt || tex(toile(64, 64, x => { const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(.3, "rgba(255,255,255,.8)"); gr.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
  x.strokeStyle = "rgba(255,255,255,.9)"; x.lineWidth = 3; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; x.beginPath(); x.moveTo(32, 32); x.lineTo(32 + Math.cos(a) * 30, 32 + Math.sin(a) * 30); x.stroke(); } })); }
// (la tête du pilote : la photo du bonhomme, à la place du casque ; sans photo, on garde le casque)
/* la tête du pilote : la photo détourée, posée sur les épaules (elle fait face à la caméra), en grand comme dans les jeux de karts */
function mettreTete(K, P) { if (!P) return; if (P.couleur) K.corps.material.color.set(P.couleur);   // (la combinaison)
  chargerTete(P.numero, P.tete_v, P.teteUrl).then(img => { if (!img || !img.width || !K.g.parent) return;
  const c = toile(img.width, img.height, x => x.drawImage(img, 0, 0)), h = 1.05, sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex(c), transparent: true, alphaTest: .05 }));
  sp.scale.set(h * img.width / img.height, h, 1); sp.position.set(0, 1.0 + h / 2 - .1, -.34); sp.renderOrder = 2; K.corpsK.add(sp); K.tete = sp; K.casque.visible = K.vis.visible = false; }).catch(() => {}); }
function nouveauPilote(o) { const K = fabriquerKart(o.couleur, o.nom); K.g.scale.setScalar(EK); KC.scene.add(K.g); mettreTete(K, o.tete);
  return { teteInfo: o.tete, id: o.id, nom: o.nom, bot: !!o.bot, humain: !!o.humain, moi: !!o.moi, K, s: o.s, d: o.d, h: capPiste(o.s), v: 0, tour: -1, prog: o.s, fini: 0, spin: 0, glisse: 0, gyro: 0, turbo: 0, fumee: 0, objet: null, voie: o.d, bv: (() => { const D = DIFF_K.find(q => q.id === KR.diff) || DIFF_K[1]; return D.v[0] + Math.random() * (D.v[1] - D.v[0]); })() }; }

/* ---------- la course : l'état, la grille, le compte à rebours ---------- */
const KR = { on: false, pil: [], moi: null, t0: 0, objets: [], obs: [], fin: [], hud: null, dern: 0, envoiT: 0, solo: true, attente: null };
function grilleK(n) { const r = Math.floor(n / 2), c = n % 2, s = KC.lapS[0] - 2 - r * 1.8, e = Math.min(.7, largeur(s) / 2 - .5); return { s, d: c ? e : -e }; }
// (entrer sur la grille : on rejoint une course annoncée il y a peu ; sinon on en lance une)
/* l'affichage s'adapte à la taille de l'écran : petit téléphone couché, téléphone debout, tablette */
function styleEcransK() { if (document.getElementById("kResp")) return; const st = document.createElement("style"); st.id = "kResp"; st.textContent = `
@media (orientation: landscape) and (max-height: 430px) {
  #kPos { font-size: 30px !important; top: 30px !important } #kTour { top: 68px !important; font-size: 13px !important } #kQuitter { top: 92px !important; font-size: 12px !important; padding: 4px 10px !important }
  #kCarte { top: 64px !important; height: max(96px, calc(100vh - 230px)) !important; width: calc(max(96px, calc(100vh - 230px)) * .40625) !important }
  #kBoutons { bottom: 10px !important; right: 8px !important; gap: 8px !important } #kBoutons [data-k=gaz] { width: 86px !important; height: 86px !important; font-size: 12px !important } #kBoutons [data-k=obj] { width: 56px !important; height: 56px !important; font-size: 11px !important }
  #kPalette { height: 62px !important; bottom: 12px !important } #kManette { width: 54px !important; height: 54px !important; margin: -27px 0 0 -27px !important }
  #kObj { width: 50px !important; height: 50px !important; top: 32px !important; font-size: 28px !important } #kDecompte { font-size: 80px !important }
  }
@media (orientation: portrait) {
  #kChrono { left: 12px !important; transform: none !important; top: 148px !important; font-size: 16px !important }
  #kCarte { top: 178px !important; height: min(300px, max(110px, calc(100vh - 430px))) !important; width: calc(min(300px, max(110px, calc(100vh - 430px))) * .40625) !important }
  #kBoutons { grid-template-columns: auto auto !important; align-items: center !important } }
@media (orientation: portrait) and (max-width: 360px) { #kBoutons [data-k=gaz] { width: 90px !important; height: 90px !important } #kPalette { width: 50vw !important } }`; document.head.appendChild(st); }
/* un écran (choix, résultats) trop haut pour un petit téléphone : on le réduit pour que tout tienne, boutons compris ; recalculé si l'on tourne le téléphone */
function ajusterEcranK(d, boite) { const faire = () => { if (!d.isConnected) { removeEventListener("resize", faire); return; }
    const enfants = boite ? [boite] : [...d.children]; for (const e of enfants) e.style.zoom = ""; if (boite) boite.style.maxHeight = "none";
    const dispo = d.clientHeight - 8, besoin = boite ? boite.scrollHeight + 12 : d.scrollHeight, k = Math.max(.5, Math.min(1, dispo / besoin));
    for (const e of enfants) e.style.zoom = k < .99 ? k.toFixed(3) : ""; if (boite) boite.style.maxHeight = (dispo / k).toFixed(0) + "px"; };
  faire(); setTimeout(faire, 120); setTimeout(faire, 700); addEventListener("resize", faire); }
function entrerCourse() { styleEcransK(); if (KR.on || KR.choixEl || !M || M.lieu !== "grande" || !adminK()) return; try { chargerPost(); musiqueFichierK().load(); } catch (e) { }   /* (les effets de lumière : chargés pendant l'écran titre, prêts au départ) */ ecranTitre(() => choisirPilote(id => { KR.perso = id; choisirDifficulte(n => { KR.diff = n; lancerCourse(); }); })); }
/* l'écran titre « NF Kart » : l'affiche en plein écran, un gros bouton JOUER qui palpite (au doigt, Entrée, ou A à la manette) */
function ecranTitre(fin) { const d = document.createElement("div"); KR.choixEl = d; musiqueK("titre");
  d.style.cssText = "position:absolute;inset:0;z-index:22;background:#0a0e1e url(images/karts/titre.jpg) center/cover no-repeat;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding-bottom:7%;font-family:Arial,sans-serif;user-select:none;-webkit-user-select:none";
  d.innerHTML = `<style>@keyframes kPulse { 0%,100% { transform: scale(1); box-shadow: 0 8px 0 #8a3a00, 0 12px 30px rgba(255,170,0,.55) } 50% { transform: scale(1.07); box-shadow: 0 8px 0 #8a3a00, 0 12px 44px rgba(255,200,0,.9) } }</style>
    <button type="button" id="kJouer" style="border:4px solid #111;border-radius:22px;padding:14px 46px;background:linear-gradient(#ffe25a,#ff9a1a);color:#14234a;font:italic 900 34px 'Arial Black',Arial;letter-spacing:1px;cursor:pointer;animation:kPulse 1.3s ease-in-out infinite">▶ JOUER</button>
    <button type="button" id="kTitreFermer" style="position:absolute;top:12px;right:12px;border:0;border-radius:99px;padding:7px 14px;background:rgba(0,0,0,.6);color:#fff;font:700 14px Arial">✕ Fermer</button>`;
  d.querySelector("#kJouer").onclick = e => { e.stopPropagation(); sonK("go"); d.remove(); KR.choixEl = null; fin(); };
  d.querySelector("#kTitreFermer").onclick = e => { e.stopPropagation(); d.remove(); KR.choixEl = null; arreterMusique(); };
  for (const ev of ["pointerdown", "click", "touchstart", "wheel"]) d.addEventListener(ev, e => e.stopPropagation());
  M.ctx.conteneur.appendChild(d); M.manMenu = { d, fermer: () => d.querySelector("#kTitreFermer").click(), iSel: 0 }; }
/* le niveau de difficulté : il règle la vitesse des karts de la caserne et la fréquence à laquelle ils lancent leurs objets */
const DIFF_K = [{ id: "facile", nom: "Facile", txt: "Les adversaires roulent tranquille", coul: "#3ac85a", e: "🟢", v: [.9, .97], obj: .25, el: .5 }, { id: "normal", nom: "Normal", txt: "Une vraie course", coul: "#ffb21a", e: "🟠", v: [1.03, 1.1], obj: .5, el: 1 }, { id: "difficile", nom: "Difficile", txt: "Ils ne te feront aucun cadeau", coul: "#e8361a", e: "🔴", v: [1.13, 1.2], obj: .9, el: 1.4 }];
function choisirDifficulte(fin) { const d = document.createElement("div"); KR.choixEl = d; let pris = null; try { pris = localStorage.getItem("karts-diff"); } catch (e) {}
  d.style.cssText = "position:absolute;inset:0;z-index:22;background:linear-gradient(rgba(6,10,26,.82),rgba(6,10,26,.92)),url(images/karts/titre.jpg) center/cover;color:#fff;font-family:Arial,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:safe center;overflow:auto;gap:14px;padding:16px;box-sizing:border-box";
  d.innerHTML = `<style>.k-carte:hover, .k-carte:focus-visible, .k-carte:active { border-color: #ffd23a !important; transform: scale(1.03); } .k-carte { transition: transform .12s, border-color .12s }</style><div style="font:italic 900 30px 'Arial Black',Arial;color:#ffd23a;-webkit-text-stroke:1.5px #111;text-shadow:0 3px 0 #8a3a00">CHOISIS LA DIFFICULTÉ</div>` + DIFF_K.map(q => `<button type="button" data-n="${q.id}" class="k-carte" style="width:min(86vw,380px);border:4px solid rgba(255,255,255,.25);border-radius:18px;padding:12px 16px;background:linear-gradient(90deg,${q.coul}cc,${q.coul}55);color:#fff;text-align:left;cursor:pointer"><div style="font:italic 900 26px 'Arial Black',Arial;-webkit-text-stroke:1px #111">${q.e} ${q.nom}</div><div style="font:700 14px Arial;opacity:.9">${q.txt}</div></button>`).join("") + `<button type="button" id="kDiffRetour" style="border:0;border-radius:99px;padding:8px 18px;background:#3a3f55;color:#fff;font:700 14px Arial">Annuler</button>`;
  for (const b of d.querySelectorAll("[data-n]")) b.onclick = e => { e.stopPropagation(); try { localStorage.setItem("karts-diff", b.dataset.n); } catch (er) {} d.remove(); KR.choixEl = null; fin(b.dataset.n); };
  d.querySelector("#kDiffRetour").onclick = e => { e.stopPropagation(); d.remove(); KR.choixEl = null; arreterMusique(); };
  for (const ev of ["pointerdown", "click", "touchstart", "wheel"]) d.addEventListener(ev, e => e.stopPropagation());
  M.ctx.conteneur.appendChild(d); ajusterEcranK(d); M.manMenu = { d, fermer: () => d.querySelector("#kDiffRetour").click(), iSel: Math.max(0, DIFF_K.findIndex(q => q.id === (pris || "normal"))) }; }
/* l'écran du choix du pilote : son bonhomme, ou un personnage de la caserne */
function choisirPilote(fin) { const d = document.createElement("div"); KR.choixEl = d; let pris = null; try { pris = localStorage.getItem("karts-perso"); } catch (e) {}
  d.style.cssText = "position:absolute;inset:0;z-index:22;background:radial-gradient(circle at 50% 30%,rgba(30,50,110,.92),rgba(6,10,26,.97));color:#fff;font-family:Arial,sans-serif;overflow:auto;padding:16px 12px;box-sizing:border-box";
  d.innerHTML = `<div style="text-align:center;font:900 26px 'Arial Black',Arial;color:#ffd23a;margin:4px 0 2px">🏁 CHOISIS TON PILOTE</div><div style="text-align:center;font-size:13px;opacity:.8;margin-bottom:12px">Les autres seront tes adversaires</div>
    <style>.k-carte:hover, .k-carte:focus-visible, .k-carte:active { border-color: #ffd23a !important; transform: scale(1.04); } .k-carte { transition: transform .12s, border-color .12s }</style><div id="kGrille" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(104px,1fr));gap:10px;max-width:760px;margin:0 auto"></div>
    <div style="text-align:center;margin-top:14px"><button type="button" id="kChoixAnnuler" style="border:0;border-radius:99px;padding:8px 18px;background:#3a3f55;color:#fff;font:700 14px Arial">Annuler</button></div>`;
  const G = d.querySelector("#kGrille"), moi = M.gens.get(M.moiNum);
  for (const q of PERSOS_K) { const b = document.createElement("button"); b.type = "button"; b.dataset.id = q.id;
    b.className = "k-carte"; b.style.cssText = `border:3px solid rgba(255,255,255,.25);border-radius:14px;background:rgba(255,255,255,.08);color:#fff;padding:8px 4px 6px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px;font:700 12px Arial`;
    b.innerHTML = `<div style="height:84px;display:flex;align-items:flex-end"><img alt="" style="max-height:84px;max-width:92px;object-fit:contain"></div><span>${q.nom}</span>`;
    const im = b.querySelector("img"); if (q.url) im.src = q.url; else if (moi && moi.info) chargerTete(moi.info.numero, moi.info.tete_v, moi.info.teteUrl).then(i => { if (i) im.src = i.src; else im.replaceWith(Object.assign(document.createElement("div"), { textContent: "🧑", style: "font-size:56px" })); }).catch(() => {});
    b.onclick = e => { e.stopPropagation(); try { localStorage.setItem("karts-perso", q.id); } catch (er) {} d.remove(); KR.choixEl = null; fin(q.id); }; G.appendChild(b); }
  d.querySelector("#kChoixAnnuler").onclick = e => { e.stopPropagation(); d.remove(); KR.choixEl = null; arreterMusique(); };
  for (const ev of ["pointerdown", "click", "touchstart", "wheel"]) d.addEventListener(ev, e => e.stopPropagation());
  M.ctx.conteneur.appendChild(d); ajusterEcranK(d); M.manMenu = { d, fermer: () => d.querySelector("#kChoixAnnuler").click() };   // (à la manette : le joystick ou la croix pour choisir, A pour prendre, B pour annuler)
  const deja = d.querySelector(`[data-id="${pris || "moi"}"]`); if (deja) M.manMenu.iSel = [...d.querySelectorAll("button")].indexOf(deja); }
function lancerCourse() { if (KR.on || !M || M.lieu !== "grande") return; KC.scene = M.scene; if (!KC.G || KC.G.parent !== M.scene) construirePisteK(M.scene); cacherVoitures(true); pisteVisibleK(true);
  const moi = M.gens.get(M.moiNum); const ann = KR.attente && KR.attente.t0 > Date.now() + 1500 ? KR.attente : null;
  const t0 = ann ? ann.t0 : Date.now() + KC.grilleT; KR.t0 = t0; KR.on = true; KR.fin = []; KR.objets = []; KR.obs = [];
  KR.humains = ann ? [...ann.ids] : []; if (!KR.humains.includes(M.moiNum)) KR.humains.push(M.moiNum);
  KR.persos = Object.assign(ann && ann.persos ? { ...ann.persos } : {}, { [M.moiNum]: KR.perso || "moi" });
  if (!ann) envoyerWS({ t: "k_annonce", t0, ids: KR.humains, perso: KR.perso || "moi" }); else envoyerWS({ t: "k_rejoint", t0, perso: KR.perso || "moi" });
  KR.moiInfo = { id: M.moiNum, nom: (moi && moi.info && moi.info.nom ? moi.info.nom.split(" ")[0] : "Moi"), couleur: COULEURS_K[(Number(M.moiNum) || 0) % COULEURS_K.length] };
  if (moi) { KR.moiPos = moi.g.position.clone(); moi.cible = null; moi.chemin = []; moi.g.visible = false; }
  M.course = KR; KR.passer = false; KR.dernierVu = false; musiqueK("course"); if (M.camera.far < 1600) { KR.farAvant = M.camera.far; M.camera.far = 1600; M.camera.updateProjectionMatrix(); } ouvrirHUD(); placerGrille(); bulle(null); nuitK(true); try { spectateursK(); } catch (e) { console.warn("spectateurs", e); }
  // la cinématique d'ouverture : la caméra survole tout le circuit, de haut, et vient se poser derrière notre kart sur la grille
  const D = Math.min(9000, t0 - Date.now() - 2200); KR.intro = D > 3000 ? { u: 0, D, t0, pret: false } : null; prechauffeK().catch(e => console.warn("prechauffe", e)).finally(() => { const I = KR.intro; if (I) { I.pret = true; I.D = Math.max(2500, Math.min(I.D, I.t0 - Date.now() - 2200)); } }); KR.camPrete = false; KR.introVise = null; }
/* tout préparer AVANT que la caméra ne parte : les effets de lumière (chargés et montés), et chaque matière de la course compilée d'avance —
   les objets cachés (gouttes, flammes, fumées), les objets qu'on lance, et dans l'image des effets ; sinon le jeu se fige quand ils apparaissent */
async function prechauffeK() { const R = M.rendu; let rt = null; const J = KR.dbgPre = [], j = m => J.push(m + "@" + Math.round(performance.now()));
  try { if (typeof postActif === "function" && postActif()) { rendrePost(R, performance.now()); await chargerPost(); for (let k = 0; k < 60 && !POST.comp; k++) await new Promise(r => setTimeout(r, 30)); j("post:" + !!POST.comp); if (POST.comp) { rendrePost(R, performance.now()); rt = POST.comp.renderTarget1; } } else j("pas de post"); } catch (e) { j("err " + e.message); }
  if (!KR.on) return; const tmp = []; for (const type of ["banane", "boule", "tarte", "petard", "fumi", "klaxon"]) { try { const o = { type, s: 30, d: 0, v: 0, vie: 0, t: 0, de: -1 }; poserObjet(o); tmp.push(o); } catch (e) { } }
  const caches = []; KC.G.traverse(o => { if (!o.visible) { caches.push(o); o.visible = true; } });
  try { if (rt) { R.setRenderTarget(rt); R.compile(M.scene, M.camera); R.setRenderTarget(null); } else R.compile(M.scene, M.camera); } catch (e) { console.warn("compile", e); }
  for (const o of caches) o.visible = false; for (const o of tmp) { o.m && o.m.parent && o.m.parent.remove(o.m); } KR.objets = KR.objets.filter(o => !tmp.includes(o));
  j("compile"); try { if (rt) rendrePost(R, performance.now()); } catch (e) { } j("fin"); }
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
/* le jet de cotillons, à l'arrivée : deux gerbes de part et d'autre du kart, des confettis et des serpentins de toutes les couleurs */
function cotillonsK(p) { finCotillons(); const G = new THREE.Group(); KC.scene.add(G);
  KR.cot = { G, parts: [], t: 0, p, reste: 0, geo: new THREE.PlaneGeometry(.07, .045), geoS: new THREE.PlaneGeometry(.025, .3), mats: [0xff3a5a, 0xffd23a, 0x3ad0ff, 0x6aff6a, 0xffffff, 0xff8a1a, 0xc04aff].map(c => new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide })) }; sonK("fumi"); }
// (les deux canons, de part et d'autre du kart, tirent pendant 2,5 s ; les confettis retombent en tournoyant)
function majCotillons(dt) { const C = KR.cot; C.t += dt;
  if (C.t < 2.5 && C.parts.length < 320) { C.reste += dt * 120; const p = C.p, o = p.K.g.position, f = new THREE.Vector3(Math.sin(p.h), 0, Math.cos(p.h)), n = new THREE.Vector3(f.z, 0, -f.x);
    while (C.reste >= 1) { C.reste--; const i = C.parts.length, sd = i % 2 ? 1 : -1, m = new THREE.Mesh(i % 7 === 0 ? C.geoS : C.geo, C.mats[i % C.mats.length]);
      m.position.copy(o).addScaledVector(n, sd * .5).addScaledVector(f, .3); m.position.y += .4;
      const v = new THREE.Vector3().addScaledVector(n, sd * (.6 + Math.random() * 1.6)).addScaledVector(f, p.v * .9 + Math.random() * 2); v.y = 4 + Math.random() * 4;
      m.userData = { v, r: new THREE.Vector3(Math.random() * 9, Math.random() * 9, Math.random() * 9) }; C.G.add(m); C.parts.push(m); } }
  for (const m of C.parts) { const u = m.userData; u.v.y -= 9.8 * dt * .5; u.v.x *= Math.pow(.5, dt); u.v.z *= Math.pow(.5, dt); if (u.v.y < -1.2) u.v.y = -1.2; m.position.addScaledVector(u.v, dt); m.rotation.x += u.r.x * dt; m.rotation.y += u.r.y * dt; m.rotation.z += u.r.z * dt; }
  if (C.t > 7) finCotillons(); }
function finCotillons() { if (KR.cot) { KR.cot.G.parent && KR.cot.G.parent.remove(KR.cot.G); KR.cot = null; } }
/* les spectateurs aux fenêtres : le long du circuit, on cherche les façades (un rayon part de la piste, sur le côté) ; à chaque fois,
   une fenêtre ouverte, éclairée de l'intérieur, et un personnage qui se penche, agite les bras, un petit drapeau à damier à la main */
function spectateursK() { finSpectateurs(); if (!M || !M.scene) return; const G = new THREE.Group(); G.name = "spectateurs-karts"; KC.scene.add(G);
  const cibles = M.scene.children.filter(o => o !== KC.G && o !== G && o.visible && !(KR.pil || []).some(p => p.K.g === o) && (o.isMesh || o.isGroup));
  const ray = new THREE.Raycaster(); ray.camera = M.camera; const dirV = new THREE.Vector3(), orig = new THREE.Vector3(), nW = new THREE.Vector3(), places = [];
  const TETES = ["gendarme", "cantiniere", "pigeon", "gargouille", "chat", "mamie", "clairon", "pave"], loader = new THREE.TextureLoader();
  const texT = TETES.map(n => { const t = loader.load("images/karts/" + n + ".png"); t.colorSpace = THREE.SRGBColorSpace; return t; });
  const A = KC.A; for (let i = 0, k = 0; i < A.N; i += 30, k++) { const q = A.pts[i], n = A.nor[i];
    for (const sd of (k % 2 ? [1, -1] : [-1, 1])) { const y = q.y + (k % 3 === 0 ? 6.4 : 3.6); orig.set(q.x, y, q.z); dirV.set(n.x * sd, 0, n.z * sd); ray.set(orig, dirV); ray.far = 13; ray.near = A.lar[i] / 2 + .8;
      const tous = []; for (const o of cibles) { try { o.raycast && ray.intersectObject(o, true, tous); } catch (e) {} } tous.sort((u, v) => u.distance - v.distance);
      const grand = o => { const g2 = o.geometry; if (!g2) return false; if (!g2.boundingSphere) g2.computeBoundingSphere(); const sc = new THREE.Vector3(); o.getWorldScale(sc); return g2.boundingSphere.radius * Math.max(sc.x, sc.y, sc.z) > 4.5; };   // (une façade : un grand morceau de bâtiment, pas un camion ni un muret)
      const h = tous.find(r => r.face && r.object.material && !r.object.material.transparent && !r.object.isSkinnedMesh); if (!h || !grand(h.object)) continue;
      nW.copy(h.face.normal).transformDirection(h.object.matrixWorld); nW.y = 0; if (nW.lengthSq() < .5) continue; nW.normalize(); if (nW.dot(dirV) > -.5) continue;   // (une vraie façade, tournée vers la piste)
      if (places.some(p2 => p2.distanceTo(h.point) < 6)) continue; places.push(h.point.clone()); break; } }
  const cadreM = new THREE.MeshStandardMaterial({ color: 0xf0e8d8, roughness: .6 }), dedansM = new THREE.MeshBasicMaterial({ color: 0xffb860 }), vitreM = new THREE.MeshStandardMaterial({ color: 0x9ab8d0, roughness: .1, metalness: .3, transparent: true, opacity: .55 });
  const COMBIS = [0xc8102e, 0x1e64d8, 0x2aa84a, 0xf2c21a, 0x9b3ad6, 0xf07a1a, 0xe8e8e8, 0x20b8c8], damier = tex(toile(32, 24, x => { for (let a = 0; a < 4; a++) for (let b = 0; b < 3; b++) { x.fillStyle = (a + b) % 2 ? "#111" : "#fff"; x.fillRect(a * 8, b * 8, 8, 8); } }));
  KR.spect = []; places.forEach((P, j) => { const w = new THREE.Group(); w.position.copy(P); G.add(w); const ray2 = new THREE.Raycaster(new THREE.Vector3(P.x, P.y, P.z), new THREE.Vector3(0, 0, 0));
    // (on retrouve la normale de cette façade : on regarde vers la piste la plus proche)
    let bi = 0, bd = 1e9; for (let i = 0; i < KC.A.N; i += 4) { const d = KC.A.pts[i].distanceTo(P); if (d < bd) { bd = d; bi = i; } } const vers = KC.A.pts[bi].clone(); vers.y = P.y; w.lookAt(vers);
    // la fenêtre : l'encadrement, l'intérieur éclairé, le rebord, un volet ouvert
    const L = 1.3, Ht = 1.6; const fond = new THREE.Mesh(new THREE.PlaneGeometry(L, Ht), dedansM); fond.position.z = .04; w.add(fond);
    for (const [px, py, sx, sy] of [[0, Ht / 2 + .06, L + .24, .12], [0, -Ht / 2 - .06, L + .24, .12], [-L / 2 - .06, 0, .12, Ht], [L / 2 + .06, 0, .12, Ht]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, .12), cadreM); b.position.set(px, py, .08); w.add(b); }
    const rebord = new THREE.Mesh(new THREE.BoxGeometry(L + .4, .08, .34), cadreM); rebord.position.set(0, -Ht / 2 - .1, .2); w.add(rebord);
    const volet = new THREE.Mesh(new THREE.BoxGeometry(L / 2, Ht, .04), vitreM); volet.position.set(-L / 2 - L / 4 - .1, 0, .22); volet.rotation.y = -1.2; w.add(volet);
    // le personnage : le buste à la fenêtre, la tête dessinée, deux bras qui s'agitent ; un drapeau à damier dans une main
    const pers = new THREE.Group(); pers.position.set(0, -Ht / 2 + .1, .3); w.add(pers); const habit = new THREE.MeshStandardMaterial({ color: COMBIS[j % COMBIS.length], roughness: .7 });
    const buste = new THREE.Mesh(new THREE.CapsuleGeometry(.24, .3, 4, 10), habit); buste.position.y = .38; pers.add(buste);
    const tete = new THREE.Mesh(new THREE.PlaneGeometry(.78, .78), new THREE.MeshBasicMaterial({ map: texT[j % texT.length], transparent: true, alphaTest: .1 })); tete.position.set(0, 1.0, .06); pers.add(tete);
    const bras = [-1, 1].map(sx => { const pv = new THREE.Group(); pv.position.set(sx * .27, .6, .02); const b = new THREE.Mesh(new THREE.CapsuleGeometry(.06, .4, 4, 8), habit); b.position.y = .26; pv.add(b);
      const main = new THREE.Mesh(new THREE.SphereGeometry(.075, 8, 6), new THREE.MeshStandardMaterial({ color: 0xffd0a8 })); main.position.y = .52; pv.add(main); pers.add(pv); return pv; });
    if (j % 2) { const dr = new THREE.Mesh(new THREE.PlaneGeometry(.36, .26), new THREE.MeshBasicMaterial({ map: damier, side: THREE.DoubleSide })); dr.position.set(.18, .7, 0); bras[1].add(dr); const hampe = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, .5, 6), cadreM); hampe.position.set(0, .64, 0); bras[1].add(hampe); }
    KR.spect.push({ pers, bras, ph: Math.random() * 6, v: 5 + Math.random() * 4 }); });
  KR.spectG = G; }
function majSpectateurs(t) { for (const S of KR.spect || []) { const a = t / 1000 * S.v + S.ph; S.bras[0].rotation.z = .5 + Math.sin(a) * .6; S.bras[1].rotation.z = -.5 - Math.sin(a + 1.3) * .6; S.pers.position.y = -.7 + Math.abs(Math.sin(a * .5)) * .08; S.pers.rotation.z = Math.sin(a * .5) * .06; } }
function finSpectateurs() { if (KR.spectG) { KR.spectG.parent && KR.spectG.parent.remove(KR.spectG); KR.spectG = null; } KR.spect = []; }
function quitterCourse() { if (!KR.on) return; KR.on = false; for (const p of KR.pil) KC.scene && KC.scene.remove(p.K.g); for (const o of KR.objets) o.m && o.m.parent && o.m.parent.remove(o.m); KR.pil = []; KR.objets = [];
  pisteVisibleK(true); if (KC.G && KC.G.parent) KC.G.parent.remove(KC.G); cacherVoitures(false);
  for (const P of KR.caches || []) P.g.visible = true; KR.caches = null;
  const moi = M && M.gens.get(M.moiNum); if (moi) { moi.g.visible = true; if (KR.moiPos) moi.g.position.copy(KR.moiPos); }
  arreterMusique(); if (KC.pan) KC.pan.visible = true; if (KR.farAvant && M && M.camera) { M.camera.far = KR.farAvant; M.camera.updateProjectionMatrix(); KR.farAvant = 0; } finCiel(); finCeremonie(); finCotillons(); finSpectateurs(); finFx(); nuitK(false); envoyerWS({ t: "k_part" }); if (M) M.course = null; fermerHUD(); moteurK(0); }

/* ---------- les commandes : clavier, manette (et manettes du casque), boutons à l'écran ---------- */
const KT = { g: 0, d: 0, gaz: 0, frein: 0, obj: 0, dera: 0, vol: 0 };   // (les boutons de l'écran)
function commandesK() { const k = c => !!(typeof CLAV !== "undefined" && CLAV[c]), P = KR.pad || { axes: [0, 0, 0, 0], buttons: [] };
  const bt = i => { const b = P.buttons && P.buttons[i]; return !!(b && (b.pressed || b.value > .4)); };
  let dir = (k("ArrowRight") || k("KeyD") ? 1 : 0) - (k("ArrowLeft") || k("KeyA") || k("KeyQ") ? 1 : 0) + KT.d - KT.g + (KT.vol || 0) + (Math.abs(P.axes[0] || 0) > .15 ? P.axes[0] : 0);
  dir = Math.max(-1, Math.min(1, dir));
  const gaz = k("ArrowUp") || k("KeyW") || k("KeyZ") || bt(7) || bt(0) || KT.gaz || (P.vr && bt(7));
  const frein = k("ArrowDown") || k("KeyS") || bt(6) || bt(1) || KT.frein;
  const obj = k("Space") || k("KeyE") || bt(2) || bt(4) || KT.obj, dera = k("ShiftLeft") || k("ShiftRight") || k("KeyX") || bt(5) || !!KT.dera;
  return { dir, gaz: gaz ? 1 : 0, frein: frein ? 1 : 0, obj, dera, a: bt(0) || k("Enter") }; }

/* ---------- la conduite (la même pour nous, les karts de la caserne… et, de loin, pour les autres joueurs) ---------- */
/* la conduite, façon karts d'arcade : un volant doux, de l'élan, et le dérapage — on le tient dans le virage, les étincelles passent du bleu
   à l'orange, et quand on le lâche, un petit turbo (plus long si elles étaient orange). Un petit saut au début du dérapage, le kart qui penche. */
function conduire(p, c, dt) { const W2 = Math.max(.25, largeur(p.s) / 2 - (.6 * EK + .12));
  if (p.vol > 0) { p.vol -= dt; c = { dir: 0, gaz: 0, frein: 0 }; p.derive = 0; }   // (en plein salto : on ne conduit plus)
  if (p.creme > 0) { p.creme -= dt; c = { ...c, dir: Math.max(-1, Math.min(1, (c.dir || 0) + Math.sin(performance.now() / 160 + p.s) * .45)) }; if (p.creme <= 0 && p.K.creme) p.K.creme.visible = false; }   // (on n'y voit plus rien : le volant part de travers)
  p.etoiles = Math.max(0, (p.etoiles || 0) - dt); p.secoue = Math.max(0, (p.secoue || 0) - dt);
  if (p.spin > 0) { p.spin -= dt; p.v *= Math.pow(.18, dt); p.tourne = (p.tourne || 0) + dt * 14; c = { dir: 0, gaz: 0, frein: 0 }; p.derive = 0; p.charge = 0; } else p.tourne = 0;
  let vmax = KC.vmax * (p.bot ? p.bv * elastiqueK(p) : 1) * (p.gyro > 0 ? 1.2 : 1) * (p.turbo > 0 ? 1.38 : 1) * (p.fumee > 0 ? .78 : 1) * (p.creme > 0 ? .8 : 1);
  if (p.fini) { c = { ...c, gaz: 1, frein: 0, dera: false }; vmax *= .55; }   // (la course finie : le kart continue tout seul, en roue libre, vers l'avant)
  // le volant : on ne braque pas d'un coup
  p.dirS = (p.dirS || 0) + (c.dir - (p.dirS || 0)) * Math.min(1, dt * (Math.abs(c.dir) > Math.abs(p.dirS || 0) ? 7 : 10));
  // l'élan : une accélération forte au départ, plus douce en haut ; le frein, l'air, la pente
  const pente = pentePiste(p.s), av = p.v / vmax, pousse = c.gaz * (p.v < 0 ? 18 : 17 * (1 - .55 * Math.max(0, av)));
  p.v += (pousse - c.frein * (p.v > .5 ? 24 : 7) - p.v * .18 - Math.sign(p.v) * (c.gaz ? 0 : 2.2) - Math.sin(pente) * 9.8 * .55) * dt; if (p.turbo > 0 && p.v < vmax) p.v += 26 * dt;
  if (p.v > vmax) p.v += (vmax - p.v) * Math.min(1, dt * 3); p.v = Math.max(-5, Math.min(vmax * 1.08, p.v));
  const capT = capPiste(p.s), k = Math.min(1, Math.abs(p.v) / 6) * (1 - .3 * Math.max(0, Math.min(1, (p.v - 9) / 7)));
  // le dérapage : on appuie en tournant, à bonne vitesse
  if (!p.derive && c.dera && !p.deraPrec && Math.abs(p.dirS) > .2 && p.v > 7) { p.derive = Math.sign(p.dirS); p.charge = 0; p.saut = .22; if (p.moi) sonK("saut"); }
  if (p.derive && (!c.dera || p.v < 5)) { const n = p.charge > 1.7 ? 2 : p.charge > .85 ? 1 : 0; if (n && p.v > 6) { p.turbo = Math.max(p.turbo, n === 2 ? 1.25 : .7); if (p.moi) sonK("turbo"); } p.derive = 0; p.charge = 0; }
  p.deraPrec = c.dera; p.saut = Math.max(0, (p.saut || 0) - dt);
  let tour;
  if (p.glisse > 0) { p.glisse -= dt; tour = -(p.gl || 1) * 2.6; }
  else if (p.derive) { const appui = p.dirS * p.derive;   // (dans le sens du dérapage : on serre ; à contre : on élargit)
    tour = p.derive * (1.55 + .85 * appui) * k; p.charge += dt * (.7 + .6 * Math.max(0, appui)); p.v -= p.v * .08 * dt; }
  else tour = p.dirS * 2.0 * k;
  p.h -= tour * dt * Math.sign(p.v || 1);
  // (le kart, en dérapage, se met de travers ; on le dessine ainsi)
  p.travers = (p.travers || 0) + ((p.derive ? -p.derive * .42 : 0) - (p.travers || 0)) * Math.min(1, dt * 8);
  let rel = Math.atan2(Math.sin(p.h - capT), Math.cos(p.h - capT));
  // (une aide au pilotage : quand on ne tourne pas, le kart se remet doucement dans l'axe de la piste — sur une piste étroite, ça change tout)
  if (!p.derive && p.glisse <= 0 && p.spin <= 0 && p.v > 2) { const corr = rel * Math.min(1, dt * (Math.abs(p.dirS) < .15 ? 3.2 : .8)); p.h -= corr; rel -= corr; }
  // (en dérapage, l'élan glisse un peu vers l'extérieur du virage)
  const glisseLat = 0;
  p.s += p.v * Math.cos(rel) * dt; p.d -= (p.v * Math.sin(rel) - glisseLat) * dt;
  if (Math.abs(p.d) > W2) { p.d = Math.sign(p.d) * W2; p.v *= Math.pow(.72, dt * 3); rel *= .5; p.h = capT + rel; p.choc = (p.choc || 0) + dt; if (p.moi && p.v > 8 && (!p.chocT || performance.now() - p.chocT > 400)) { p.chocT = performance.now(); sonK("frotte"); } }   // (contre la barrière : on frotte, on ralentit, le kart se remet dans l'axe)
  p.gyro = Math.max(0, p.gyro - dt); p.turbo = Math.max(0, p.turbo - dt); p.fumee = Math.max(0, p.fumee - dt);
  p.acc = (p.acc || 0) + (((c.gaz && p.v < vmax * .9) ? 1 : c.frein ? -1 : 0) - (p.acc || 0)) * Math.min(1, dt * 5);
  if (p.s >= KC.L - 2) p.s -= KC.LA; if (p.s < 0) p.s = 0;   // (après l'arrivée, on tourne sur un tour de plus, sans fin)
  p.tour = tourDe(p.s); p.prog = p.s; }
// (les karts se cognent : on s'écarte l'un de l'autre ; celui qui a le gyrophare envoie l'autre en tête-à-queue)
function chocsKarts() { const P = KR.pil; for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) { const a = P[i], b = P[j];
  if (!(a.moi || a.bot) && !(b.moi || b.bot)) continue; const ds = ((b.s - a.s + KC.L * 1.5) % KC.L) - KC.L / 2, dd = b.d - a.d, Ls = 1.35 * EK * 1.6, Ld = 1.25 * EK;
  if (Math.abs(ds) > Ls || Math.abs(dd) > Ld) continue;
  if (a.gyro > 0 && b.gyro <= 0 && b.spin <= 0) { b.spin = 1; continue; } if (b.gyro > 0 && a.gyro <= 0 && a.spin <= 0) { a.spin = 1; continue; }
  const pen = Ld - Math.abs(dd), sg = Math.sign(dd) || 1; if (a.moi || a.bot) a.d -= sg * pen * .35; if (b.moi || b.bot) b.d += sg * pen * .35;
  const der = ds > 0 ? a : b; if (der.moi || der.bot) der.v *= .97; if ((a.moi || b.moi) && (!KR.chocT || performance.now() - KR.chocT > 350)) { KR.chocT = performance.now(); sonK("choc"); } } }
/* la fumée blanche des roues (dérapage, démarrage, turbo) et les traces noires des pneus sur l'asphalte, quand on dérape */
const FX = { fumee: [], traces: [], ti: 0 };
function fxK(p, dt) { if (!KC.scene || dt <= 0) return; const K = p.K, derape = p.derive && p.v > 5, demarre = p.acc > .6 && p.v < 4 && p.v > .5 && (p.demT = (p.demT || 0) + dt) < .8, turbo = p.turbo > 0; if (p.v < .3) p.demT = 0;
  if (derape || demarre || turbo) { p.fxT = (p.fxT || 0) - dt; if (p.fxT <= 0) { p.fxT = turbo ? .05 : .07;
    for (const sx of [-.66, .66]) { let f = FX.fumee.find(q => !q.vie); if (!f) { if (FX.fumee.length > 40) continue; const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: texFumee(), transparent: true, depthWrite: false })); KC.scene.add(m); f = { m, vie: 0 }; FX.fumee.push(f); }
      const v = new THREE.Vector3(sx, .15, -1.1).multiplyScalar(EK).applyQuaternion(K.g.quaternion).add(K.g.position); f.m.position.copy(v); f.m.visible = true; f.vie = f.max = .7 + Math.random() * .4; f.taille = (turbo ? .2 : .26) + Math.random() * .14; f.vy = .5 + Math.random() * .4;
      f.m.material.color.setHex(turbo && !derape ? 0x9ad0ff : 0xe8e8e8); } } }
  if (derape) { p.trT = (p.trT || 0) - dt; if (p.trT <= 0) { p.trT = .05;
    for (const sx of [-.66, .66]) { const v = new THREE.Vector3(sx, 0, -.7).multiplyScalar(EK).applyQuaternion(K.g.quaternion).add(K.g.position); const k = sx < 0 ? "g" : "d", der = p["tr" + k]; p["tr" + k] = v.clone();
      if (der && der.distanceTo(v) < 2) { let tr = FX.traces[FX.ti % 260]; if (!tr) { tr = new THREE.Mesh(new THREE.PlaneGeometry(.12, 1), new THREE.MeshBasicMaterial({ color: 0x0c0c0c, transparent: true, opacity: .55, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3 })); tr.rotation.order = "YXZ"; KC.scene.add(tr); FX.traces[FX.ti % 260] = tr; } FX.ti++;
        const mil = der.clone().add(v).multiplyScalar(.5), L2 = der.distanceTo(v); tr.position.set(mil.x, mil.y + .075, mil.z); tr.scale.set(1, L2, 1); tr.rotation.set(-Math.PI / 2, Math.atan2(v.x - der.x, v.z - der.z), 0); tr.material.opacity = .55; tr.visible = true; tr.userData.t = performance.now(); } } } } else { p.trg = p.trd = null; } }
function majFx(dt) { for (const f of FX.fumee) { if (!f.vie) continue; f.vie = Math.max(0, f.vie - dt); const u = 1 - f.vie / f.max; f.m.position.y += f.vy * dt; f.m.scale.setScalar(f.taille * (1 + u * 1.8)); f.m.material.opacity = .32 * (1 - u); if (!f.vie) f.m.visible = false; }
  const now = performance.now(); for (const tr of FX.traces) if (tr && tr.visible) { const a = (now - tr.userData.t) / 1000; tr.material.opacity = Math.max(0, .55 - a * .05); if (a > 11) tr.visible = false; } }
function finFx() { for (const f of FX.fumee) f.m.parent && f.m.parent.remove(f.m); for (const tr of FX.traces) tr && tr.parent && tr.parent.remove(tr); FX.fumee = []; FX.traces = []; FX.ti = 0; }
let texFu = null; function texFumee() { return texFu = texFu || tex(toile(64, 64, x => { const gr = x.createRadialGradient(32, 32, 2, 32, 32, 31); gr.addColorStop(0, "rgba(255,255,255,.9)"); gr.addColorStop(.5, "rgba(255,255,255,.45)"); gr.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); })); }
function majKart(p, dt) { const pos = surPiste(p.s, p.d, p.K.g.position), pente = pentePiste(p.s), K = p.K, t = performance.now();
  if (p.saut > 0) pos.y += Math.sin((1 - p.saut / .22) * Math.PI) * .22;   // (le petit saut du dérapage)
  const uv = p.vol > 0 ? 1 - p.vol / 1.1 : 0; if (p.vol > 0) pos.y += Math.sin(uv * Math.PI) * 1.8;   // (le salto du pétard)
  if (p.secoue > 0) { pos.x += Math.sin(t / 25) * .05 * p.secoue; pos.z += Math.cos(t / 31) * .05 * p.secoue; }
  K.g.rotation.set(0, 0, 0); K.g.rotation.order = "YXZ"; K.g.rotation.y = p.h + (p.tourne || 0) + (p.travers || 0); K.g.rotation.x = -pente + uv * Math.PI * 2;
  // la caisse penche vers l'extérieur du virage, se cabre à l'accélération, plonge au freinage
  const roulis = -(p.dirS || 0) * .1 * Math.min(1, p.v / 10) + (p.derive ? p.derive * .07 : 0), tangage = -(p.acc || 0) * .05;
  K.corpsK.rotation.z += (roulis - K.corpsK.rotation.z) * Math.min(1, dt * 8); K.corpsK.rotation.x += (tangage - K.corpsK.rotation.x) * Math.min(1, dt * 6);
  K.corpsK.position.y = Math.sin(t / 45 + p.s) * .012 * Math.min(1, p.v / 6);   // (le moteur qui vibre)
  for (const r of K.roues) r.rotation.x += p.v * dt * 3; for (const pv of K.pivots) pv.rotation.y = -(p.dirS || 0) * .45;
  // les étincelles : bleues, puis orange quand le turbo est chargé
  const n = p.derive ? (p.charge > 1.7 ? 2 : p.charge > .85 ? 1 : 0) : -1;
  for (const e of K.etin) { e.visible = n >= 0 && p.v > 5; if (e.visible) { e.material.color.setHex(n === 2 ? 0xff8a1a : n === 1 ? 0x4aa8ff : 0xfff2c0); e.scale.setScalar((n === 0 ? .25 : .5) * (.7 + Math.random() * .6)); e.material.rotation = Math.random() * 6; } }
  K.flamme.visible = p.turbo > 0; if (p.turbo > 0) { K.flamme.scale.set(1, .7 + Math.random() * .7, 1); K.flamme.material.color.setHex(Math.random() < .5 ? 0xffa020 : 0x5ab0ff); }
  // les étoiles qui tournent au-dessus de la tête, quand on a été touché
  if (p.etoiles > 0 && !K.etoiles) { K.etoiles = new THREE.Group(); for (let i = 0; i < 4; i++) { const e = new THREE.Sprite(new THREE.SpriteMaterial({ map: texEtoile(), depthWrite: false })); e.scale.setScalar(.36); K.etoiles.add(e); } K.etoiles.position.y = 2.25; K.g.add(K.etoiles); }
  if (K.etoiles) { K.etoiles.visible = p.etoiles > 0; if (p.etoiles > 0) K.etoiles.children.forEach((e, i) => { const a = t / 260 + i * Math.PI / 2; e.position.set(Math.cos(a) * .5, Math.sin(a * 2) * .06, Math.sin(a) * .5); }); }
  if (K.tete && K.tete.material) { p.brule = Math.max(0, (p.brule || 0) - dt); K.tete.material.color.setScalar(p.brule > 0 ? .35 + (1 - Math.min(1, p.brule / 2.6)) * .65 : p.enFeu ? .55 : 1); }
  // en feu (le dragon nous a eus) : des flammes sur le kart jusqu'à la cascade ou la piscine, qui les éteignent — pschhh, un nuage de vapeur blanche
  if (p.enFeu && !K.feu && KC.flTex) { K.feu = new THREE.Group(); for (let i = 0; i < 5; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: KC.flTex, transparent: true, depthWrite: false, toneMapped: false })); sp.material.color.setScalar(1.25); sp.userData.ph = i * 1.7; K.feu.add(sp); } K.g.add(K.feu); }
  if (K.feu) { K.feu.visible = !!p.enFeu; if (p.enFeu) K.feu.children.forEach((sp, i) => { const a = t / 90 + sp.userData.ph, h = 1 + Math.sin(a) * .22; sp.position.set((i - 2) * .5, .9 + h * .4, -.9 - (i % 2) * .4); sp.scale.set(h * .75, h, 1); sp.material.rotation = Math.sin(a * .7) * .2; }); }
  if (p.enFeu && (dansPiscine(pos) || dansCascadeK(p))) { p.enFeu = false; p.vapeur = 3; if (p.moi) sonK("fumi"); }
  if (p.vapeur > 0 || K.vap) { if (!K.vap) { K.vap = []; for (let i = 0; i < 8; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: texFumee(), color: 0xffffff, transparent: true, depthWrite: false })); sp.visible = false; KC.G.add(sp); K.vap.push({ sp, a: 0 }); } }
    p.vapeur = Math.max(0, (p.vapeur || 0) - dt); K.vap.forEach((V, i) => { if (p.vapeur <= 0) { V.sp.visible = false; return; } const a = ((t / 1000 * 1.3 + i / 8) % 1); V.sp.visible = true; V.sp.position.set(pos.x + Math.sin(i * 2.3) * .5 * (1 + a), pos.y + .5 + a * 2.6, pos.z + Math.cos(i * 2.3) * .5 * (1 + a)); V.sp.scale.setScalar(.9 + a * 2.2); V.sp.material.opacity = Math.min(1, (1 - a) * 1.4) * Math.min(1, p.vapeur); }); }
  K.et.visible = !p.moi && (!M.camera || M.camera.position.distanceTo(pos) > 4);
  K.gy.visible = p.gyro > 0; if (p.gyro > 0) K.gy.material.color.setHex(Math.floor(t / 120) % 2 ? 0x2a5cff : 0xff2a2a); }

/* ---------- les adversaires de la caserne (seul) ---------- */
/* (les adversaires ne lâchent rien : loin derrière nous, ils accélèrent ; loin devant, ils lèvent un peu le pied) */
function elastiqueK(p) { const moi = KR.moi; if (!moi || p.fini || moi.fini) return 1; const D = DIFF_K.find(q => q.id === KR.diff) || DIFF_K[1], ecart = moi.s - p.s;
  return 1 + Math.max(-.1, Math.min(.28, ecart / 70 * .2)) * D.el; }
function piloteBot(p, dt, auto) { const devant = p.s + 9, cap = capPiste(devant), cb = courbure(p.s + 4);
  p.voieT = (p.voieT || 0) - dt; if (p.voieT <= 0) { p.voieT = 2 + Math.random() * 3; p.voie = (Math.random() - .5) * Math.max(0, largeur(p.s + 12) - 1.4); } { const lim = Math.max(0, largeur(p.s + 9) / 2 - .5); p.voie = Math.max(-lim, Math.min(lim, p.voie)); }
  // (éviter une banane ou une flaque juste devant)
  for (const o of KR.objets) if ((o.type === "banane" || o.type === "huile") && o.s > p.s && o.s - p.s < 12 && Math.abs(o.d - p.voie) < 1) p.voie = o.d > 0 ? o.d - 1.4 : o.d + 1.4;
  const vise = Math.atan2(-(p.voie - p.d), 9), voulu = cap + vise; const e = Math.atan2(Math.sin(voulu - p.h), Math.cos(voulu - p.h));
  const ralentir = cb > .7 && p.v > KC.vmax * .8; if (p.objet && !auto && Math.random() < dt * ((DIFF_K.find(q => q.id === KR.diff) || DIFF_K[1]).obj)) utiliserObjet(p);
  return { dir: Math.max(-1, Math.min(1, -e * 2.2)), gaz: ralentir ? .6 : 1, frein: ralentir ? .15 : 0, dera: false }; }

/* ---------- les objets, façon dessin animé (contour noir, couleurs franches) ----------
   🍌 la peau de banane (posée derrière : tête-à-queue)      🛢️ la flaque d'huile (on glisse)       💨 le fumigène (on n'y voit plus rien)
   🎱 la boule de pétanque (lancée, rebondit sur les murets)   🥧 la tarte à la crème (lancée, elle file sur le kart visé : de la crème plein la figure)
   🧨 le pétard (posé derrière, la mèche grésille : BOUM, le kart fait un salto)   📯 le klaxon (une onde autour de soi : les voisins sont secoués)
   🚨 le gyrophare (invincible et plus rapide)   ⚡ le turbo   ☕ le café serré (trois turbos)
   Les objets lancés partent devant ; on les lance derrière si l'on est premier, ou en freinant au moment de lancer. */
function toonK(geo, couleur, epais = 1.12) { const g = new THREE.Group(); g.add(new THREE.Mesh(geo, new THREE.MeshToonMaterial({ color: couleur })));
  const c = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x111111, side: THREE.BackSide })); c.scale.setScalar(epais); g.add(c); return g; }
function tirerObjet(p) { const rang = classement().indexOf(p) + 1, n = KR.pil.length, r = Math.random(), dernier = rang > n / 2, premier = rang === 1;
  if (premier) return r < .35 ? "banane" : r < .6 ? "petard" : r < .8 ? "boule" : r < .9 ? "tarte" : "klaxon";
  if (dernier) return r < .25 ? "cafe" : r < .45 ? "tarte" : r < .6 ? "klaxon" : r < .75 ? "turbo" : r < .9 ? "boule" : "fumi";
  return r < .22 ? "tarte" : r < .4 ? "boule" : r < .55 ? "petard" : r < .7 ? "banane" : r < .82 ? "klaxon" : r < .93 ? "turbo" : "fumi"; }
// (la cible d'une tarte : le kart juste devant, ou juste derrière)
function voisinK(p, sens) { const L2 = classement(), i = L2.indexOf(p), q = L2[i + (sens > 0 ? -1 : 1)]; return q && !q.fini ? q : null; }
function utiliserObjet(p, freine) { const o = p.objet; if (!o) return;
  if (o === "cafe") { p.cafes = (p.cafes || 3) - 1; p.turbo = Math.max(p.turbo, 1.1); if (p.moi) sonK("turbo"); if (p.cafes <= 0) { p.objet = null; p.cafes = 0; } majHUD(); return; }
  p.objet = null; p.caisseBloc = Date.now() + 1200;   /* (pas d'objet « en réserve » : une caisse cassée en tenant déjà un objet, ou juste après l'avoir lancé, ne donne rien) */
  if (o === "gyro") { p.gyro = 6; if (p.moi) sireneK(); }
  else if (o === "turbo") { p.turbo = 1.8; if (p.moi) sonK("turbo"); }
  else { const arriere = ["boule", "tarte"].includes(o) ? (classement()[0] === p || !!freine) : true;   // (posés : toujours derrière ; lancés : derrière si l'on est premier, ou en freinant)
    const sens = arriere ? -1 : 1, cible = o === "tarte" ? voisinK(p, sens) : null;
    const lance = { type: o, s: (p.s + sens * (o === "klaxon" ? 0 : 2.2) + KC.L) % KC.L, d: p.d, v: o === "boule" ? (arriere ? -12 : Math.max(p.v, 6) + 15) : o === "tarte" ? (arriere ? -14 : Math.max(p.v, 6) + 12) : 0,
      de: p.id, cible: cible ? cible.id : null, vie: o === "boule" ? 5 : o === "tarte" ? 4 : o === "fumi" ? 6 : o === "petard" ? 5 : o === "klaxon" ? .6 : 60, t: performance.now() };
    poserObjet(lance); if (p.moi || p.bot && KR.solo) envoyerWS({ t: "k_obj", o: { type: lance.type, s: lance.s, d: lance.d, v: lance.v, vie: lance.vie, cible: lance.cible } }); if (p.moi) sonK(o === "klaxon" ? "klaxon" : o === "petard" ? "meche" : o); }
  majHUD(); }
function poserObjet(o) { let m;
  if (o.type === "banane") { m = new THREE.Group(); const ban = toonK(new THREE.TorusGeometry(.26, .09, 8, 16, Math.PI * 1.1), 0xffd83a); ban.rotation.set(-Math.PI / 2, 0, .6); m.add(ban);
    for (const a of [0, 1]) { const bout = toonK(new THREE.SphereGeometry(.06, 8, 6), 0x5a3a1a); bout.position.set(Math.cos(.6 + a * Math.PI * 1.1) * .26, 0, -Math.sin(.6 + a * Math.PI * 1.1) * .26); m.add(bout); } }
  else if (o.type === "huile") { m = new THREE.Group(); const f = toonK(new THREE.CircleGeometry(1, 24), 0x141420, 1.06); f.rotation.x = -Math.PI / 2; m.add(f); const reflet = new THREE.Mesh(new THREE.CircleGeometry(.3, 12), new THREE.MeshBasicMaterial({ color: 0x8a5aff, transparent: true, opacity: .6 })); reflet.rotation.x = -Math.PI / 2; reflet.position.set(.3, .01, -.2); m.add(reflet); }
  else if (o.type === "fumi") { m = new THREE.Group(); const mt = new THREE.MeshToonMaterial({ color: 0xe84a3a, transparent: true, opacity: .55, depthWrite: false }); for (let i = 0; i < 9; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(.9 + Math.random() * .7, 10, 8), mt); b.position.set((Math.random() - .5) * 3.4, .7 + Math.random() * 1.6, (Math.random() - .5) * 2.6); m.add(b); } }
  else if (o.type === "boule") { m = toonK(new THREE.SphereGeometry(.24, 16, 12), 0xb8c0cc); const raie = new THREE.Mesh(new THREE.TorusGeometry(.245, .015, 6, 24), new THREE.MeshBasicMaterial({ color: 0x333333 })); m.add(raie); }
  else if (o.type === "tarte") { m = new THREE.Group(); const moule = toonK(new THREE.CylinderGeometry(.3, .24, .1, 20), 0xd89a4a); m.add(moule); const creme = toonK(new THREE.SphereGeometry(.28, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), 0xfffbf0); creme.position.y = .05; creme.scale.y = .55; m.add(creme);
    const cerise = toonK(new THREE.SphereGeometry(.06, 8, 6), 0xd8102a); cerise.position.y = .22; m.add(cerise); }
  else if (o.type === "petard") { m = new THREE.Group(); const corps = toonK(new THREE.CylinderGeometry(.13, .13, .5, 14), 0xd8242a); corps.rotation.z = Math.PI / 2; m.add(corps);
    for (const sx of [-.2, .2]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(.135, .135, .05, 14), new THREE.MeshBasicMaterial({ color: 0xffd23a })); b.rotation.z = Math.PI / 2; b.position.x = sx; m.add(b); }
    const meche = new THREE.Mesh(new THREE.CylinderGeometry(.015, .015, .22, 6), new THREE.MeshBasicMaterial({ color: 0x3a2a1a })); meche.position.set(.3, .08, 0); meche.rotation.z = -1; m.add(meche);
    const etin = new THREE.Sprite(new THREE.SpriteMaterial({ map: texEtincelle(), color: 0xffb030, blending: THREE.AdditiveBlending, depthWrite: false })); etin.scale.setScalar(.35); etin.position.set(.4, .16, 0); m.add(etin); o.etin = etin; }
  else if (o.type === "klaxon") { m = new THREE.Mesh(new THREE.RingGeometry(.8, 1.1, 40), new THREE.MeshBasicMaterial({ color: 0xffe24a, transparent: true, opacity: .8, side: THREE.DoubleSide, depthWrite: false })); m.rotation.x = -Math.PI / 2; }
  o.m = m; KC.scene.add(m); surPiste(o.s, o.d, m.position); m.position.y += o.type === "boule" ? .25 : o.type === "huile" ? .07 : o.type === "fumi" ? 0 : o.type === "klaxon" ? .3 : o.type === "tarte" ? .6 : .14;
  if (o.type === "klaxon") { const src = KR.pil.find(q => q.id === o.de); if (src) { o.s = src.s; o.d = src.d; } } KR.objets.push(o); }
function touche(p, o) { if (p.gyro > 0 || p.spin > 0 || p.vol > 0 || !o.m) return false;
  const P = p.K.g.position, Q = o.m.position, dh = Math.hypot(P.x - Q.x, P.z - Q.z), dy = Math.abs(P.y - (o.type === "tarte" ? Q.y - .55 : Q.y)); if (dy > 1.8) return false;
  if (o.type === "klaxon") return o.de !== p.id && dh < 5.5;
  if (o.type === "tarte" && o.cible && o.cible !== p.id) return false;
  const r = o.type === "huile" ? 1.1 : o.type === "fumi" ? 2.3 : o.type === "tarte" ? .95 : .75; return dh < r + .3 * EK; }
// (le pétard explose : tout ce qui est autour fait un salto)
function boumK(o) { o.vie = 0; const boum = new THREE.Group(); boum.position.copy(o.m.position); KC.scene.add(boum);
  const boule = toonK(new THREE.SphereGeometry(.6, 16, 12), 0xffa020, 1.08); boum.add(boule); const c2 = toonK(new THREE.SphereGeometry(.45, 14, 10), 0xfff24a, 1.06); c2.position.set(.3, .2, .2); boum.add(c2);
  const txt = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex(toile(256, 128, x => { x.font = "900 86px Arial Black,Arial"; x.textAlign = "center"; x.textBaseline = "middle"; x.lineWidth = 12; x.strokeStyle = "#111"; x.strokeText("BOUM!", 128, 66); x.fillStyle = "#ffd23a"; x.fillText("BOUM!", 128, 66); })), depthTest: false })); txt.scale.set(2, 1, 1); txt.position.y = 1.4; boum.add(txt);
  (KR.effets = KR.effets || []).push({ g: boum, t: 0, dur: .7, maj: (e, u) => { boum.scale.setScalar(.4 + u * 2.2); boule.children[0].material.opacity = 1; boum.children.forEach(c => c.traverse(q => { if (q.material) { q.material.transparent = true; q.material.opacity = 1 - u; } })); } });
  sonK("boum"); for (const p of KR.pil) { if (!(p.moi || p.bot) || p.fini || p.gyro > 0 || (p.id === o.de && performance.now() - o.t < 1500)) continue; const P = p.K.g.position, Q = o.m.position; if (Math.hypot(P.x - Q.x, P.z - Q.z) < 2.6 && Math.abs(P.y - Q.y) < 2) { p.vol = 1.1; p.etoiles = 2.2; p.v *= .35; if (p.moi) sonK("aie"); } } }
function majObjets(dt) { const now = performance.now();
  for (const o of KR.objets) { o.vie -= dt; const age = (now - o.t) / 1000;
    if (o.type === "boule") { o.s = (o.s + o.v * dt + KC.L) % KC.L; const lim = largeur(o.s) / 2 - .3; o.d += (o.dv || 0) * dt; if (Math.abs(o.d) > lim) { o.d = Math.sign(o.d) * lim; o.dv = -(o.dv || Math.sign(o.d) * 2); } surPiste(o.s, o.d, o.m.position); o.m.position.y += .25 + Math.abs(Math.sin(age * 9)) * .15; o.m.rotation.x += dt * 14 * Math.sign(o.v); }
    if (o.type === "tarte") { const c = o.cible && KR.pil.find(q => q.id === o.cible); if (c) { const ds = ((c.s - o.s + KC.L * 1.5) % KC.L) - KC.L / 2; o.v = Math.sign(ds) * Math.max(Math.abs(o.v), Math.abs(c.v) + 9); o.d += (c.d - o.d) * Math.min(1, dt * 4); }
      o.s = (o.s + o.v * dt + KC.L) % KC.L; surPiste(o.s, o.d, o.m.position); o.m.position.y += .55 + Math.sin(age * 6) * .15; o.m.rotation.y += dt * 9; }
    if (o.type === "fumi") { o.m.children.forEach(b => { b.scale.setScalar(1 + (6 - o.vie) * .08); b.position.y += dt * .15; }); o.m.children[0].material.opacity = Math.max(0, Math.min(.55, o.vie * .14)); }
    if (o.type === "petard") { if (o.etin) { o.etin.scale.setScalar(.25 + Math.random() * .25); o.etin.visible = Math.random() > .2; } o.m.position.y = surPiste(o.s, o.d).y + .14 + (o.vie < 1.2 ? Math.abs(Math.sin(age * 30)) * .05 : 0); if (o.vie <= 0) { boumK(o); continue; } }
    if (o.type === "klaxon") { const u = 1 - o.vie / .6; o.m.scale.setScalar(1 + u * 5); o.m.material.opacity = Math.max(0, .8 * (1 - u)); const src = KR.pil.find(q => q.id === o.de); if (src) { surPiste(src.s, src.d, o.m.position); o.m.position.y += .3; } }
    if (o.type === "banane") o.m.rotation.y += dt * .5;
    for (const p of KR.pil) { if (o.vie <= 0 || p.fini || (o.de === p.id && now - o.t < 700) || !touche(p, o)) continue;
      // (chacun ne vérifie que son propre kart, et les karts de la caserne ; pour les autres joueurs, c'est leur téléphone qui le fait)
      if (!(p.moi || p.bot)) continue;
      if (o.type === "fumi") { p.fumee = 2; if (p.moi) voileFumee(); continue; }
      if (o.type === "huile") { p.glisse = 1.1; p.gl = Math.random() < .5 ? -1 : 1; p.v *= .8; p.etoiles = 1; if (p.moi) sonK("glisse"); continue; }
      if (o.type === "klaxon") { if (!(o.vus = o.vus || new Set()).has(p.id)) { o.vus.add(p.id); p.v *= .5; p.glisse = .6; p.gl = Math.random() < .5 ? -1 : 1; p.etoiles = 1.3; p.secoue = .6; if (p.moi) sonK("aie"); } continue; }
      if (o.type === "petard") { boumK(o); continue; }
      if (o.type === "tarte") { o.vie = 0; p.creme = 3.5; p.v *= .7; p.etoiles = 1.2; splatK(p); if (p.moi) sonK("splat"); continue; }
      p.spin = 1.2; p.etoiles = 1.8; o.vie = 0; if (p.moi) sonK("aie"); } }
  KR.objets = KR.objets.filter(o => { if (o.vie > 0) return true; KC.scene.remove(o.m); return false; });
  for (const e of KR.effets || []) { e.t += dt; e.maj(e, Math.min(1, e.t / e.dur)); } KR.effets = (KR.effets || []).filter(e => { if (e.t < e.dur) return true; KC.scene.remove(e.g); return false; }); }
// (de la crème plein la figure : sur la tête du pilote ; et, pour nous, sur l'écran)
/* la crème sur l'écran : de grosses giclées de chantilly (en relief, avec des reflets), des coulures qui descendent, des morceaux de pâte dorée, quelques fraises */
let imgCreme = null;
function imageCreme() { if (imgCreme) return imgCreme; const W = 720, H = 1080, c = document.createElement("canvas"); c.width = W; c.height = H; const x = c.getContext("2d"), R = Math.random;
  const blob = (cx, cy, r, n) => { x.beginPath(); for (let i = 0; i <= 40; i++) { const a = i / 40 * Math.PI * 2, rr = r * (1 + .07 * Math.sin(a * n + cx) + .045 * Math.sin(a * (n + 3) + cy) + (Math.sin(a * 2 + cy) > .92 ? .12 : 0)); x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * .92); } x.closePath(); };
  const creme = (cx, cy, r) => { x.save(); x.shadowColor = "rgba(90,60,20,.45)"; x.shadowBlur = r * .25; x.shadowOffsetY = r * .08; blob(cx, cy, r, 5 + Math.floor(R() * 4)); const g = x.createRadialGradient(cx - r * .3, cy - r * .35, r * .05, cx, cy, r * 1.05); g.addColorStop(0, "#ffffff"); g.addColorStop(.55, "#fffbf2"); g.addColorStop(.88, "#f6ead2"); g.addColorStop(1, "#e8d4ae"); x.fillStyle = g; x.fill(); x.restore();
    // (le relief : des tourbillons de crème, des reflets brillants)
    for (let k = 0; k < 5; k++) { const a = R() * 6.28, d = R() * r * .55; x.beginPath(); x.ellipse(cx + Math.cos(a) * d, cy + Math.sin(a) * d, r * (.18 + R() * .16), r * (.1 + R() * .1), R() * 3, 0, 7); x.fillStyle = "rgba(255,255,255,.7)"; x.fill(); x.strokeStyle = "rgba(210,185,140,.18)"; x.lineWidth = 3; x.stroke(); }
    x.beginPath(); x.ellipse(cx - r * .35, cy - r * .4, r * .2, r * .09, -.5, 0, 7); x.fillStyle = "rgba(255,255,255,.95)"; x.fill(); };
  const coulure = (cx, cy, w, L) => { const g = x.createLinearGradient(cx - w, 0, cx + w, 0); g.addColorStop(0, "#e9d6b0"); g.addColorStop(.35, "#fffaf0"); g.addColorStop(1, "#e2cca2"); x.fillStyle = g; x.beginPath(); x.moveTo(cx - w, cy); x.bezierCurveTo(cx - w * .8, cy + L * .6, cx - w * .5, cy + L * .9, cx - w * .45, cy + L); x.arc(cx, cy + L, w * .62, Math.PI, 0, true); x.bezierCurveTo(cx + w * .5, cy + L * .9, cx + w * .8, cy + L * .6, cx + w, cy); x.closePath(); x.fill();
    x.beginPath(); x.ellipse(cx - w * .2, cy + L * .95, w * .18, w * .28, 0, 0, 7); x.fillStyle = "rgba(255,255,255,.9)"; x.fill(); };
  const pate = (cx, cy, r) => { x.save(); x.translate(cx, cy); x.rotate(R() * 6); x.beginPath(); const n = 5 + Math.floor(R() * 3); for (let i = 0; i < n; i++) { const a = i / n * 6.28, rr = r * (.6 + R() * .5); x.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } x.closePath();
    const g = x.createLinearGradient(-r, -r, r, r); g.addColorStop(0, "#f2c070"); g.addColorStop(.6, "#c8822e"); g.addColorStop(1, "#8a4e18"); x.fillStyle = g; x.fill(); x.strokeStyle = "rgba(90,45,10,.6)"; x.lineWidth = 2; x.stroke(); for (let k = 0; k < 4; k++) { x.fillStyle = "rgba(255,230,170,.7)"; x.fillRect((R() - .5) * r, (R() - .5) * r, 2, 2); } x.restore(); };
  const fraise = (cx, cy, r) => { x.save(); x.translate(cx, cy); x.rotate((R() - .5) * 1.2); x.beginPath(); x.moveTo(0, r); x.bezierCurveTo(-r * 1.1, r * .2, -r * .9, -r * .9, 0, -r * .75); x.bezierCurveTo(r * .9, -r * .9, r * 1.1, r * .2, 0, r); const g = x.createRadialGradient(-r * .3, -r * .3, r * .1, 0, 0, r * 1.2); g.addColorStop(0, "#ff6a6a"); g.addColorStop(1, "#b80a1a"); x.fillStyle = g; x.fill();
    x.fillStyle = "#ffe08a"; for (let k = 0; k < 14; k++) { x.beginPath(); x.ellipse((R() - .5) * r * 1.1, (R() - .4) * r * 1.2, 2, 3, 0, 0, 7); x.fill(); } x.fillStyle = "#2a8a2a"; for (let k = 0; k < 5; k++) { x.beginPath(); x.ellipse(Math.cos(k * 1.26) * r * .3, -r * .8 + Math.sin(k * 1.26) * r * .12, r * .3, r * .1, k * 1.26, 0, 7); x.fill(); } x.restore(); };
  const G = [[200, 300, 150], [470, 230, 120], [560, 560, 170], [180, 690, 140], [360, 470, 110], [610, 860, 100], [110, 960, 80], [420, 900, 90]];
  for (const [cx, cy, r] of G) { if (R() < .9) coulure(cx + (R() - .5) * r * .6, cy + r * .5, r * (.12 + R() * .08), r * (.9 + R() * 1.3)); }
  for (const [cx, cy, r] of G) creme(cx, cy, r);
  for (const [cx, cy, r] of G) for (let k = 0; k < 3; k++) { const a = R() * 6.28; pate(cx + Math.cos(a) * r * (.9 + R() * .4), cy + Math.sin(a) * r * (.9 + R() * .4), 10 + R() * 16); }
  for (let k = 0; k < 40; k++) { x.beginPath(); x.arc(R() * W, R() * H, 3 + R() * 10, 0, 7); x.fillStyle = `rgba(255,250,236,${.6 + R() * .4})`; x.fill(); }   // (des éclaboussures)
  fraise(240, 250, 34); fraise(540, 600, 30); fraise(400, 470, 22);
  imgCreme = c.toDataURL("image/png"); return imgCreme; }
function splatK(p) { if (p.moi && KR.hud) { const cr = KR.hud.querySelector("#kCreme"); if (cr) { cr.style.backgroundImage = `url(${imageCreme()})`; imgCreme = null; } } const K = p.K; if (!K.creme) { K.creme = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex(toile(128, 128, x => { x.fillStyle = "#fffaf0"; x.strokeStyle = "#111"; x.lineWidth = 5; for (const [a, b, r] of [[64, 64, 40], [30, 50, 20], [98, 46, 22], [44, 96, 18], [92, 94, 20]]) { x.beginPath(); x.arc(a, b, r, 0, 7); x.fill(); x.stroke(); } x.fillStyle = "#fffaf0"; x.beginPath(); x.arc(64, 64, 38, 0, 7); x.fill(); })), depthTest: true }));
    K.creme.scale.set(.9, .9, 1); K.creme.position.set(0, 1.5, -.1); K.creme.renderOrder = 3; K.corpsK.add(K.creme); } K.creme.visible = true; }
/* ---------- le classement, la boucle ---------- */
const classement = () => [...KR.pil].sort((a, b) => (b.fini ? 1e9 - b.fini : b.prog) - (a.fini ? 1e9 - a.fini : a.prog));
function majCourse(t, dt) { if (!KR.on || !M || !KC.G) return; dt = Math.min(.05, dt);
  const now = Date.now(), avant = now < KR.t0, c = commandesK();
  if (KR.moi && !avant) { if (c.obj && !KR.objPrec) utiliserObjet(KR.moi, c.frein); }
  if (KR.intro && ((c.obj && !KR.objPrec) || (c.a && !KR.aPrec))) KR.passer = true;   // (passer la cinématique : A, l'objet, ou toucher l'écran)
  if (KR.cer && !KR.podium && ((c.a && !KR.aPrec) || (c.obj && !KR.objPrec))) podiumK();
  KR.aPrec = c.a;
  KR.objPrec = c.obj;
  for (const p of KR.pil) { if (avant) { majKart(p, 0); continue; }
    if (p.moi) conduire(p, p.fini ? piloteBot(p, dt, true) : c, dt); else if (p.bot) conduire(p, piloteBot(p, dt, !!p.fini), dt); else { /* un autre joueur : on avance sa dernière position */ p.s += p.v * dt; if (p.s >= KC.L - 2) p.s -= KC.LA; }
    // les caisses
    if (p.moi || p.bot) for (const cs of KC.caisses) if (cs.m.visible && Math.abs(p.K.g.position.y - cs.pos.y) < 1.5 && Math.hypot(p.K.g.position.x - cs.pos.x, p.K.g.position.z - cs.pos.z) < .85) { cs.m.visible = false; cs.retour = now + 12000;   /* (une caisse cassée ne revient qu'au bout de 12 s : ceux qui suivent de près n'en profitent pas) */ if (p.objet || now < (p.caisseBloc || 0)) p.caisseBloc = now + 1500; else { p.objet = tirerObjet(p); if (p.moi) { sonK("caisse"); majHUD(); } } }
    // l'arrivée
    if ((p.moi || p.bot) && !p.fini && p.tour >= KC.tours) { p.fini = now - KR.t0; if (p.moi) { envoyerWS({ t: "k_fin", temps: p.fini }); sonK("arrivee"); arriveeK(); cotillonsK(p); KR.arrT = 0; setTimeout(() => { if (KR.on) musiqueK("titre"); }, 1200); KR.cielT = now + 2600; } }
    majKart(p, dt); if (dt > 0 && (p.moi || p.bot || p.vu)) fxK(p, dt); }
  if (KC.cm) KC.cm.emissive.setHSL((t / 2400) % 1, .9, .3);
  for (const cs of KC.caisses) { if (!cs.m.visible && now > cs.retour) cs.m.visible = true; cs.m.rotation.y += dt * 1.5; cs.m.position.y = cs.pos.y + .8 + Math.sin(t / 300 + (cs.ph || 0)) * .1; }
  if (KC.ledTex) KC.ledTex.offset.x -= dt * .15; if (M.L && M.L.nuit === false && (!KR.nuitT || t - KR.nuitT > 2000)) { KR.nuitT = t; nuitK(true); }
  if (KR.cer) majCeremonie(dt); if (KR.cot) majCotillons(dt); majSpectateurs(t); majFx(dt); minicarteK(); majDragon(dt, t); majParis(t); majPiscine(dt, t);
  if (!avant) { majObjets(dt); chocsKarts();
    for (const p of KR.pil) if ((p.moi || p.bot) && !p.fini) for (const b of KC.boosts || []) if (Math.abs(p.K.g.position.y - b.pos.y) < 1.5 && Math.hypot(p.K.g.position.x - b.pos.x, p.K.g.position.z - b.pos.z) < Math.max(1.2, b.w / 2)) { if (p.turbo < .5 && p.moi) sonK("turbo"); p.turbo = Math.max(p.turbo, .9); } }
  // notre position, pour les autres (8 fois par seconde)
  if (KR.moi && t - KR.envoiT > 125 && !KR.solo) { KR.envoiT = t; const p = KR.moi; envoyerWS({ t: "k_pos", s: +p.s.toFixed(2), d: +p.d.toFixed(2), h: +p.h.toFixed(3), v: +p.v.toFixed(2), tour: p.tour, sp: p.spin > 0 ? 1 : 0, g: p.gyro > 0 ? 1 : 0, dr: p.derive || 0, ch: +(p.charge || 0).toFixed(1), st: +(p.dirS || 0).toFixed(2), tu: p.turbo > 0 ? 1 : 0 }); }
  // notre bonhomme (invisible) suit le kart : c'est lui que suivent la caméra du casque et la carte
  const moiG = M.gens.get(M.moiNum); if (moiG && KR.moi) { moiG.g.position.copy(KR.moi.K.g.position); moiG.g.visible = false; if (M.vr && M.rendu.xr.isPresenting) M.vr.cap = KR.moi.h + Math.PI; }
  cameraK(dt); majHUD(t); moteurK(KR.moi ? Math.abs(KR.moi.v) / KC.vmax : 0);
  if (KR.cielT && now > KR.cielT && !KR.ciel && !KR.cer && !KR.podium) { KR.cielT = 0; cielK(); }   // (la caméra monte au ciel : le nom du vainqueur en étoiles, le feu d'artifice)
  if (KR.ciel) majCiel(dt); }
const cv3 = new THREE.Vector3(), cv4 = new THREE.Vector3(), cv5 = new THREE.Vector3();
function survolK(p, cam, dt) { const I = KR.intro; if (I.n === undefined) I.n = 0; if (I.pret && ++I.n > 3) I.u += Math.min(dt, .034) * 1000 / I.D; const u = Math.min(1, Math.max(I.u, Date.now() > I.t0 - 1600 ? 1 : 0));   /* (les premières images, souvent lentes, ne font pas sauter la caméra) */
  if (u >= 1 || KR.passer) { KR.intro = null; KR.passer = false; KR.camH = p.h; return false; }   // (fini : la caméra de course reprend, en glissant depuis là où l'on est)
  /* la caméra remonte les 260 derniers mètres de la piste jusqu'à la grille : à vitesse régulière (un peu plus lente au début et à la fin),
     toujours au-dessus du milieu de la piste, le regard posé loin devant et lissé — plus d'à-coups */
  const e = u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2, fin = p.s - 6, L0 = Math.min(260, KC.LA * .6), sc = fin - L0 * (1 - e);
  const pos = surPiste(sc, 0, cv4); pos.y += 2.2 + (1 - e) * 1.2;
  const vise = surPiste(sc + 14, 0, cv5); vise.y += 1;
  if (!KR.introVise || !KR.camPrete) { KR.introVise = vise.clone(); cam.position.copy(pos); }
  KR.introVise.lerp(vise, 1 - Math.exp(-dt * 4)); cam.position.lerp(pos, 1 - Math.exp(-dt * 14)); KR.camPrete = true;
  if (u > .85) { const k = (u - .85) / .15, f = cv3.set(Math.sin(p.h), 0, Math.cos(p.h)), der = new THREE.Vector3().copy(p.K.g.position).addScaledVector(f, -3.3); der.y += 1.45; cam.position.lerp(der, k * k); }   // (sur la fin, elle se pose derrière notre kart)
  cam.lookAt(KR.introVise); cam.fov += (64 - cam.fov) * Math.min(1, dt * 3); cam.updateProjectionMatrix(); return true; }
function cameraK(dt) { const p = KR.moi; if (!p || KR.camLibre || (M.rendu && M.rendu.xr.isPresenting)) return; const cam = M.camera;
  if (KR.cer) { cameraCeremonie(cam, dt); return; }
  if (KR.ciel) { cameraCiel(cam, dt); return; }
  if (p.fini) { KR.arrT = (KR.arrT || 0) + dt; const u = Math.min(1, KR.arrT / 1.8), e = u * u * (3 - 2 * u), th = p.h + Math.PI * (1 - e), dist = 3.3 - .9 * e;
    const voulu = cv4.set(p.K.g.position.x + Math.sin(th) * dist, p.K.g.position.y + 1.35 - .5 * e, p.K.g.position.z + Math.cos(th) * dist); cam.position.lerp(voulu, 1 - Math.exp(-dt * 6));
    cam.lookAt(p.K.g.position.x, p.K.g.position.y + .55, p.K.g.position.z); cam.fov += (58 - cam.fov) * Math.min(1, dt * 3); cam.updateProjectionMatrix(); return; }
  if (KR.intro && survolK(p, cam, dt)) return;
  // (la caméra suit le cap du kart avec un peu de retard : dans un dérapage, on voit le kart de travers)
  const cT = capPiste(p.s), dH = Math.atan2(Math.sin(p.h - cT), Math.cos(p.h - cT)), voulu0 = cT + dH * .45 + (p.travers || 0) * .3; if (KR.camH === undefined || !KR.camPrete) KR.camH = voulu0; KR.camH += Math.atan2(Math.sin(voulu0 - KR.camH), Math.cos(voulu0 - KR.camH)) * Math.min(1, dt * 3.5);
  const f = cv3.set(Math.sin(KR.camH), 0, Math.cos(KR.camH)), recul = 3.3 + Math.min(1, Math.max(0, p.v - 10) * .1) + (p.turbo > 0 ? .4 : 0);
  const voulu = cv4.copy(p.K.g.position).addScaledVector(f, -recul); let hb = -99; for (const m of [.5, 1, 1.5, 2.1]) hb = Math.max(hb, surPiste(p.s - recul * m, p.d, cv5).y); voulu.y = Math.max(voulu.y + 1.45, hb + 1.5);   /* (dans la descente : la piste, derrière, est plus haute que le kart ; la caméra reste au-dessus) */
  const k = 1 - Math.exp(-dt * 8); cam.position.lerp(voulu, KR.camPrete ? k : 1); KR.camPrete = true;
  cam.lookAt(p.K.g.position.x + f.x * 3, p.K.g.position.y + .5, p.K.g.position.z + f.z * 3);
  const fov = 66 + Math.min(9, Math.max(0, p.v - 10) * .9) + (p.turbo > 0 ? 7 : 0); cam.fov += (fov - cam.fov) * Math.min(1, dt * 4); cam.updateProjectionMatrix(); }

/* ---------- les autres joueurs (par le serveur) ---------- */
function recuK(m) { if (!M) return; const de = m.de;
  if (m.t === "k_annonce") { if (!KR.on) { KR.attente = { t0: m.t0, ids: m.ids || [de], persos: { [de]: m.perso || "moi" } }; if (M.lieu === "grande" && adminK()) bulle("🏁 Une course de karts part dans " + Math.max(1, Math.round((m.t0 - Date.now()) / 1000)) + " s : approche-toi de l'affiche NF Kart, près des bus, pour la rejoindre !", 5000); } return; }
  if (m.t === "k_rejoint") { if (KR.attente && KR.attente.t0 === m.t0) { if (!KR.attente.ids.includes(de)) KR.attente.ids.push(de); (KR.attente.persos = KR.attente.persos || {})[de] = m.perso || "moi"; }
    if (KR.on && m.t0 === KR.t0) (KR.persos = KR.persos || {})[de] = m.perso || "moi";
    if (KR.on && m.t0 === KR.t0 && !KR.humains.includes(de)) { KR.humains.push(de); if (Date.now() < KR.t0) placerGrille(); } return; }
  if (!KR.on) return; const p = KR.pil.find(q => q.id === de);
  if (m.t === "k_pos" && p) { p.s = m.s; p.d = m.d; p.h = m.h; p.v = m.v; p.tour = m.tour; p.prog = m.s; p.tourne = m.sp ? performance.now() / 70 : 0; p.gyro = m.g ? 1 : 0; p.derive = m.dr || 0; p.charge = m.ch || 0; p.dirS = m.st || 0; p.turbo = m.tu ? .2 : 0; p.vu = Date.now(); }
  else if (m.t === "k_obj" && m.o) poserObjet({ ...m.o, de, t: performance.now() });
  else if (m.t === "k_fin" && p) { p.fini = m.temps; }
  else if (m.t === "k_part" && p) { KC.scene.remove(p.K.g); KR.pil = KR.pil.filter(q => q !== p); } }

/* ---------- l'écran : tour, position, objet, chrono, boutons du téléphone ---------- */
function ouvrirHUD() { fermerHUD(); const d = document.createElement("div"); KR.hud = d;
  d.style.cssText = "position:absolute;inset:0;z-index:20;pointer-events:auto;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent;font-family:'Arial Black',Arial,sans-serif;color:#fff;text-shadow:0 2px 4px #000";
  const tactile = matchMedia("(pointer: coarse)").matches;
  d.innerHTML = `<div style="position:absolute;left:10px;top:38px;font:italic 900 40px 'Arial Black',Arial;letter-spacing:-1px;color:#ffd23a;-webkit-text-stroke:2px #111;text-shadow:0 3px 0 #b8520a,0 5px 8px rgba(0,0,0,.6)" id="kPos"></div><div style="position:absolute;left:12px;top:86px;font:800 15px Arial;padding:2px 8px;border-radius:8px;background:rgba(0,0,0,.45)" id="kTour"></div><canvas id="kCarte" width="260" height="640" style="position:absolute;right:4px;top:226px;height:min(320px,46vh);width:calc(min(320px,46vh) * 0.40625);border-radius:18px;background:radial-gradient(circle,rgba(10,20,50,.55),rgba(10,20,50,.15) 70%,transparent);filter:drop-shadow(0 3px 6px rgba(0,0,0,.6))"></canvas>
    <div id="kVitesse" style="position:absolute;inset:0;opacity:0;pointer-events:none;transition:opacity .25s;background:repeating-conic-gradient(from 0deg at 50% 55%,rgba(255,255,255,.5) 0deg .6deg,transparent .6deg 7deg);-webkit-mask-image:radial-gradient(circle at 50% 55%,transparent 38%,#000 75%);mask-image:radial-gradient(circle at 50% 55%,transparent 38%,#000 75%)"></div>
    <div style="position:absolute;left:50%;top:38px;transform:translateX(-50%);width:60px;height:60px;border-radius:14px;background:rgba(0,0,0,.45);border:3px solid #ffd23a;display:grid;place-items:center;font-size:36px" id="kObj"></div>
    <div style="position:absolute;left:50%;top:10px;transform:translateX(-50%);font:700 18px 'Courier New',monospace" id="kChrono"></div>
    <div style="position:absolute;left:50%;top:36%;transform:translate(-50%,-50%);font:italic 900 110px 'Arial Black',Arial;color:#ffd23a;-webkit-text-stroke:4px #111;text-shadow:0 6px 0 #b8520a,0 10px 18px rgba(0,0,0,.6)" id="kDecompte"></div>
    <style>@keyframes kPop { 0% { transform: translate(-50%,-50%) scale(2.2); opacity: 0 } 25% { transform: translate(-50%,-50%) scale(.9); opacity: 1 } 40% { transform: translate(-50%,-50%) scale(1.05) } 100% { transform: translate(-50%,-50%) scale(1); opacity: 1 } } @keyframes kPop2 { 0% { transform: scale(2); opacity: 0 } 40% { transform: scale(.92); opacity: 1 } 100% { transform: scale(1); opacity: 1 } } @keyframes kBat { 0% { transform: translateX(-50%) scale(1) } 100% { transform: translateX(-50%) scale(1.1) } }</style>
    <div id="kIntro" style="position:absolute;left:0;right:0;bottom:18%;text-align:center;pointer-events:auto"><div style="display:inline-block;padding:10px 22px;border-radius:14px;background:linear-gradient(90deg,rgba(20,35,74,0),rgba(20,35,74,.85) 20%,rgba(20,35,74,.85) 80%,rgba(20,35,74,0));font:900 30px 'Arial Black',Arial;color:#ffd23a;letter-spacing:.04em">🏁 LES 24 TOURS DE LA CASERNE</div><div style="font:700 13px Arial;opacity:.8;margin-top:6px">Toucher l'écran pour passer</div></div>
    <div style="position:absolute;inset:0;background:radial-gradient(circle,rgba(200,40,30,.2),rgba(200,40,30,.75));opacity:0;transition:opacity .4s" id="kFumee"></div>
    <div id="kFleche" style="display:none;position:absolute;left:50%;top:22%;transform:translateX(-50%);text-align:center;pointer-events:none;font:italic 900 26px 'Arial Black',Arial;color:#ffd23a;-webkit-text-stroke:1.5px #111;text-shadow:0 3px 0 #8a3a00;will-change:transform;animation:kBat .5s ease-in-out infinite alternate">⬆ PAR LES TOITS ⬆<div style="font:800 14px Arial;color:#fff;-webkit-text-stroke:0">la voie monte sur la terrasse</div></div>
    <div id="kEau" style="position:absolute;inset:0;opacity:0;pointer-events:none;background:radial-gradient(ellipse 7% 9% at 22% 30%,rgba(200,240,255,.55) 70%,rgba(255,255,255,.9) 76%,transparent 82%),radial-gradient(ellipse 5% 7% at 70% 22%,rgba(200,240,255,.55) 70%,rgba(255,255,255,.9) 76%,transparent 82%),radial-gradient(ellipse 9% 11% at 62% 62%,rgba(200,240,255,.5) 70%,rgba(255,255,255,.9) 76%,transparent 82%),radial-gradient(ellipse 4% 6% at 35% 72%,rgba(200,240,255,.55) 70%,rgba(255,255,255,.9) 76%,transparent 82%),radial-gradient(ellipse 6% 8% at 84% 48%,rgba(200,240,255,.55) 70%,rgba(255,255,255,.9) 76%,transparent 82%),linear-gradient(rgba(80,180,230,.18),rgba(80,180,230,.18))"></div>
    <div id="kFeu" style="position:absolute;inset:0;opacity:0;pointer-events:none;background:radial-gradient(circle at 50% 40%,rgba(255,200,60,.25),rgba(255,90,10,.7) 70%,rgba(120,20,0,.85))"></div>
    <div id="kCreme" style="position:absolute;inset:0;opacity:0;transition:opacity .3s;pointer-events:none;background-size:cover;background-position:center"></div>
    <button type="button" id="kQuitter" style="pointer-events:auto;position:absolute;left:12px;top:114px;border:0;border-radius:99px;padding:6px 12px;background:rgba(0,0,0,.55);color:#fff;font:700 13px Arial">✕ Quitter la course</button>
    ${tactile ? `<div id="kPalette" style="position:absolute;left:12px;bottom:22px;width:min(46vw,260px);height:74px;border-radius:40px;border:3px solid rgba(255,255,255,.75);background:linear-gradient(90deg,rgba(0,0,0,.55),rgba(0,0,0,.3) 50%,rgba(0,0,0,.55));pointer-events:auto;touch-action:none">
        <div style="position:absolute;left:14px;top:50%;transform:translateY(-50%);font-size:22px;opacity:.6">◀</div><div style="position:absolute;right:14px;top:50%;transform:translateY(-50%);font-size:22px;opacity:.6">▶</div>
        <div id="kManette" style="position:absolute;left:50%;top:50%;width:66px;height:66px;margin:-33px 0 0 -33px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff,#c9ced6 55%,#8a919c);box-shadow:0 3px 10px rgba(0,0,0,.6)"></div></div>
      <div id="kBoutons" style="position:absolute;right:12px;bottom:18px;display:grid;grid-template-columns:auto auto;gap:10px;align-items:end;pointer-events:auto">
        <div style="display:flex;flex-direction:column;gap:10px;align-items:center">
          <button type="button" data-k="obj" style="width:66px;height:66px;border-radius:50%;border:3px solid #ffd23a;background:rgba(0,0,0,.5);color:#ffd23a;font:700 13px Arial">OBJET</button>
</div>
        <button type="button" data-k="gaz" style="width:104px;height:104px;border-radius:50%;border:4px solid #9dff7a;background:radial-gradient(circle at 40% 35%,rgba(80,200,60,.85),rgba(20,110,20,.85));color:#fff;font:900 14px Arial;text-shadow:0 1px 3px #000">ACCÉLÉRER</button></div>` : `<div style="position:absolute;left:12px;bottom:12px;font:700 13px Arial;opacity:.85">⬆ accélérer · ⬇ freiner · ⬅ ➡ tourner · Maj déraper (tenu dans le virage : turbo) · Espace objet (+ ⬇ : derrière) — Manette : RT/A accélérer · LT/B freiner · stick gauche · R1 déraper · X/L1 objet</div>`}`;
  /* les boutons de l'écran : un appui long ne doit jamais sélectionner le texte ni ouvrir le menu du téléphone (sinon l'appui s'interrompt et le kart s'arrête) ;
     le bouton garde le doigt même s'il glisse un peu (capture), et l'on relâche seulement en levant le doigt */
  for (const b of d.querySelectorAll("[data-k]")) { const k = b.dataset.k; let id = null; b.style.touchAction = "none"; b.style.userSelect = b.style.webkitUserSelect = "none"; b.style.webkitTouchCallout = "none";
    b.addEventListener("pointerdown", e => { e.preventDefault(); e.stopPropagation(); id = e.pointerId; try { b.setPointerCapture(id); } catch (er) {} KT[k] = 1; b.style.filter = "brightness(1.35)"; });
    const lacher = e => { if (id !== null && e.pointerId !== id) return; id = null; KT[k] = 0; b.style.filter = ""; };
    for (const ev of ["pointerup", "pointercancel", "lostpointercapture"]) b.addEventListener(ev, lacher);
    b.addEventListener("touchstart", e => e.preventDefault(), { passive: false }); }
  for (const ev of ["contextmenu", "selectstart", "dragstart"]) d.addEventListener(ev, e => e.preventDefault());
  d.querySelector("#kQuitter").onclick = e => { e.stopPropagation(); quitterCourse(); };
  { const pal = d.querySelector("#kPalette"), bou = d.querySelector("#kManette"); if (pal) { let id = null;
    const viser = e => { const r = pal.getBoundingClientRect(), demi = r.width / 2 - 36, v = Math.max(-1, Math.min(1, (e.clientX - r.left - r.width / 2) / demi)); KT.vol = v; bou.style.transform = `translateX(${v * demi}px)`; };
    const lacher = e => { if (e.pointerId !== id) return; id = null; KT.vol = 0; bou.style.transition = "transform .12s"; bou.style.transform = ""; };
    pal.addEventListener("pointerdown", e => { e.preventDefault(); e.stopPropagation(); id = e.pointerId; try { pal.setPointerCapture(id); } catch (er) {} bou.style.transition = ""; viser(e); });
    pal.addEventListener("pointermove", e => { if (e.pointerId === id) { e.preventDefault(); viser(e); } }); pal.addEventListener("touchstart", e => e.preventDefault(), { passive: false });
    for (const ev of ["pointerup", "pointercancel", "lostpointercapture"]) pal.addEventListener(ev, lacher); } }
  d.addEventListener("pointerdown", e => { if (KR.cer && !KR.podium && e.target === d) { podiumK(); return; } if (KR.intro && e.target === d || e.target.id === "kIntro" || (e.target.closest && e.target.closest("#kIntro"))) KR.passer = true; });
  for (const ev of ["pointerdown", "pointerup", "click", "touchstart", "wheel"]) d.addEventListener(ev, e => e.stopPropagation());
  M.ctx.conteneur.appendChild(d); majHUD(0);
  if (!document.getElementById("kStyle")) { const st = document.createElement("style"); st.id = "kStyle"; st.textContent = "body.en-course .mx-bas-btns, body.en-course .mx-danses, body.en-course .mx-parler, body.en-course #mxBtnDanses, body.en-course #mxBtnParler { display: none !important; }"; document.head.appendChild(st); }
  document.body.classList.add("en-course"); }
function fermerHUD() { if (KR.hud) { KR.hud.remove(); KR.hud = null; } document.body.classList.remove("en-course"); if (M && M.manMenu && M.manMenu.d && M.manMenu.d.id === "kFin") M.manMenu = null; for (const k in KT) KT[k] = 0; const f = document.getElementById("kFin"); if (f) f.remove(); KR.podium = false; }
function majHUD(t) { const d = KR.hud, p = KR.moi; if (!d || !p) return; const now = Date.now(), q = d.querySelector.bind(d);
  const rang = classement().indexOf(p) + 1; q("#kPos").textContent = rang + (rang === 1 ? "er" : "e") + " / " + KR.pil.length;
  q("#kTour").textContent = "Tour " + Math.max(1, Math.min(KC.tours, p.tour + 1)) + " / " + KC.tours; if (p.tour === KC.tours - 1 && !KR.dernierVu && !p.fini) { KR.dernierVu = true; banniereK("DERNIER TOUR !", "Par les toits… attention au dragon 🐉"); sonK("dernier"); MUS.tempo = 1.14; if (MUS.el && MUS.nom === "course") MUS.el.playbackRate = 1.07; } q("#kObj").textContent = p.objet ? OBJETS_K[p.objet] + (p.objet === "cafe" ? "×" + (p.cafes || 3) : "") : ""; { const cr = q("#kCreme"); if (cr) cr.style.opacity = p.creme > 0 ? Math.min(.82, p.creme / 1.4) : 0; }
  const ms = p.fini || Math.max(0, now - KR.t0); q("#kChrono").textContent = chronoK(ms);
  const r = Math.ceil((KR.t0 - now) / 1000), dc = q("#kDecompte"), txt = r > 0 ? (r > 3 ? "" : String(r)) : now - KR.t0 < 900 ? "GO !" : ""; if (dc.dataset.v !== txt) { dc.dataset.v = txt; dc.textContent = txt; dc.style.color = txt === "GO !" ? "#7dff5a" : "#ffd23a"; dc.style.animation = "none"; void dc.offsetWidth; if (txt) dc.style.animation = "kPop .6s ease-out"; }
  if (r > 3) dc.dataset.v = "x", q("#kDecompte").innerHTML = `<div style="font:700 22px Arial;text-align:center;-webkit-text-stroke:0;color:#fff;text-shadow:0 2px 4px #000">Départ dans ${r} s<br><small style="font-size:15px">les autres peuvent encore rejoindre la grille</small></div>`;
  if (r > 0 && r <= 3 && KR.bipR !== r) { KR.bipR = r; sonK("bip"); } if (r <= 0 && KR.bipR !== 0) { KR.bipR = 0; sonK("go"); }
  if (!KR.padT || now - KR.padT > 800) { KR.padT = now; let pad = false; try { pad = !!(navigator.getGamepads && [...navigator.getGamepads()].some(g => g && g.connected)); } catch (e) {}
    const pal = q("#kPalette"), gz = q("[data-k=gaz]"); if (pal) pal.style.display = pad ? "none" : ""; if (gz && gz.parentElement) gz.parentElement.style.display = pad ? "none" : ""; }   /* (une manette branchée : les boutons de l'écran disparaissent) */
  { const fl = q("#kFleche"); if (fl) { const ds = KC.dev ? KC.dev[0] - p.s : 1e9; fl.style.display = p.tour === KC.tours - 1 && ds > 0 && ds < 90 ? "" : "none"; } }
  q("#kFumee").style.opacity = p.fumee > 0 ? 1 : 0; q("#kVitesse").style.opacity = p.turbo > 0 ? .85 : p.v > KC.vmax * .95 ? .25 : 0; q("#kIntro").style.display = KR.intro ? "" : "none";
  if (KR.intro) q("#kDecompte").innerHTML = ""; }
/* la mini-carte : le circuit vu du dessus, les karts en points de couleur (le nôtre plus gros, cerclé de blanc) */
/* le plan du circuit : vu du dessus, avec la tête de chaque coureur à sa place (cerclée à la couleur de son kart, sa position à côté) ; la nôtre, plus grosse, toujours par-dessus */
function teteMini(p) { if (p.mini !== undefined) return p.mini; p.mini = null; const T = p.teteInfo, im = new Image(); im.crossOrigin = "anonymous";
  if (T && T.teteUrl && !T.tete_v) { im.onload = () => { p.mini = im; }; im.src = T.teteUrl; } else if (T) chargerTete(T.numero, T.tete_v, T.teteUrl).then(x => { if (x) p.mini = x; }).catch(() => {}); return null; }
function minicarteK() { const cv = KR.hud && KR.hud.querySelector("#kCarte"); if (!cv || !KC.A) return; const x = cv.getContext("2d"), A = KC.A, B = KC.B, SW = 260, SH = 640;
  if (!KC.bornes) { let a = 1e9, b = -1e9, c = 1e9, d = -1e9; for (const q of A.pts) { a = Math.min(a, q.x); b = Math.max(b, q.x); c = Math.min(c, q.z); d = Math.max(d, q.z); } KC.bornes = [a, b, c, d]; }
  const [a, b, c, d] = KC.bornes, k = Math.min((SW - 70) / (b - a), (SH - 70) / (d - c)), px = X => 35 + (X - a) * k + ((SW - 70) - (b - a) * k) / 2, pz = Z => 35 + (Z - c) * k + ((SH - 70) - (d - c) * k) / 2;
  const dernier = KR.moi && KR.moi.tour === KC.tours - 1; x.clearRect(0, 0, SW, SH);
  if (!KC.fondCarte || KC.fondCarte.d !== dernier) { const fc = document.createElement("canvas"); fc.width = SW; fc.height = SH; fc.d = dernier; KC.fondCarte = fc; dessinerFond(fc.getContext("2d")); }
  x.drawImage(KC.fondCarte, 0, 0); x.lineJoin = x.lineCap = "round";
  function dessinerFond(x) { { x.fillStyle = "rgba(8,14,36,.45)"; x.beginPath(); x.roundRect(2, 2, SW - 4, SH - 4, 26); x.fill(); } x.lineJoin = x.lineCap = "round";
  const trace = (R, ferme) => { x.beginPath(); R.pts.forEach((q, i) => { if (i % 3 && i !== R.N - 1) return; i ? x.lineTo(px(q.x), pz(q.z)) : x.moveTo(px(q.x), pz(q.z)); }); if (ferme) x.closePath(); };
  for (const [w, col] of [[26, "rgba(0,0,0,.6)"], [17, "#f2f2f2"], [11, "#4a4e58"]]) { trace(A, true); x.lineWidth = w; x.strokeStyle = col; x.stroke(); }
  for (const [w, col] of [[22, "rgba(0,0,0,.6)"], [13, dernier ? "#ffd23a" : "rgba(255,210,58,.5)"], [5, dernier ? "#c88a10" : "#4a4e58"]]) { trace(B, false); x.lineWidth = w; x.strokeStyle = col; x.stroke(); }
  // (la ligne d'arrivée en damier)
  { const q0 = A.pts[0], t0 = A.tan[0], ang = Math.atan2(t0.z, t0.x) + Math.PI / 2; x.save(); x.translate(px(q0.x), pz(q0.z)); x.rotate(ang); for (let i = -2; i < 2; i++) for (let j = 0; j < 2; j++) { x.fillStyle = (i + j) % 2 ? "#111" : "#fff"; x.fillRect(i * 4, j * 4 - 4, 4, 4); } x.restore(); }
  // (le dragon, sur le bâtiment de l'horloge)
  if (KC.dragon) { const g = KC.dragon.sauve ? KC.dragon.sauve.p : KC.dragon.D.position; x.font = "34px serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("🐉", px(g.x), pz(g.z)); } }
  const L2 = classement(), liste = [...KR.pil].sort((p, q) => (p.moi ? 1 : 0) - (q.moi ? 1 : 0));
  for (const p of liste) { const g = p.K.g.position, X = px(g.x), Z = pz(g.z), r = p.moi ? 30 : 22, col = "#" + p.K.coul.toString(16).padStart(6, "0"), im = teteMini(p) || p.mini, rang = L2.indexOf(p) + 1;
    x.beginPath(); x.arc(X, Z, r + 4, 0, 7); x.fillStyle = "#111"; x.fill(); x.beginPath(); x.arc(X, Z, r + 2.5, 0, 7); x.fillStyle = p.moi ? "#ffffff" : col; x.fill();
    x.save(); x.beginPath(); x.arc(X, Z, r, 0, 7); x.clip(); x.fillStyle = col; x.fillRect(X - r, Z - r, r * 2, r * 2);
    if (im && im.width) { const sc = Math.max(r * 2 / im.width, r * 2 / im.height) * 1.05; x.drawImage(im, X - im.width * sc / 2, Z - im.height * sc / 2 + r * .1, im.width * sc, im.height * sc); } else { x.fillStyle = "#fff"; x.font = `900 ${r}px Arial`; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText((p.nom || "?")[0], X, Z + 1); }
    x.restore();
    // (la position, dans une petite pastille)
    const bx = X + r * .85, by = Z + r * .85; x.beginPath(); x.arc(bx, by, 12, 0, 7); x.fillStyle = rang === 1 ? "#ffd23a" : rang === 2 ? "#d8dde6" : rang === 3 ? "#e09a5a" : "#2a3a6a"; x.fill(); x.lineWidth = 2.5; x.strokeStyle = "#111"; x.stroke();
    x.fillStyle = rang <= 3 ? "#111" : "#fff"; x.font = "900 16px Arial"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(rang, bx, by + .5); } }
function banniereK(titre, sous) { const d = KR.hud; if (!d) return; const b = document.createElement("div"); b.style.cssText = "position:absolute;left:0;right:0;top:28%;text-align:center;pointer-events:none;will-change:transform,opacity;animation:kPop2 .6s ease-out";
  b.innerHTML = `<div style="display:inline-block;font:italic 900 46px 'Arial Black',Arial;color:#ff4a3a;-webkit-text-stroke:3px #111;text-shadow:0 5px 0 #7a1010">${titre}</div><div style="font:800 17px Arial;color:#fff;text-shadow:0 2px 0 #000;margin-top:4px">${sous}</div>`;
  d.appendChild(b); setTimeout(() => b.remove(), 3200); }
const chronoK = ms => { const s = ms / 1000; return Math.floor(s / 60) + ":" + (s % 60).toFixed(2).padStart(5, "0"); };
function voileFumee() { sonK("fumi"); }
function arriveeK() { const p = KR.moi, rang = classement().indexOf(p) + 1; bulle(`🏁 Arrivée ! ${rang}${rang === 1 ? "er" : "e"} en ${chronoK(p.fini)}`, 4000);
  try { const r = JSON.parse(localStorage.getItem("karts-record") || "null"); if (!r || p.fini < r) { localStorage.setItem("karts-record", JSON.stringify(p.fini)); KR.record = true; } } catch (e) {} }
/* ---------- la victoire, dans le ciel de la caserne : la caméra monte, le nom du vainqueur s'écrit en étoiles, un feu d'artifice éclate de partout ---------- */
const CIEL = { x: 0, y: 92, z: -70, larg: 96 };
let texPt = null; function texPoint() { return texPt = texPt || tex(toile(64, 64, x => { const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(.25, "rgba(255,255,255,.85)"); gr.addColorStop(.6, "rgba(255,255,255,.22)"); gr.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
  x.strokeStyle = "rgba(255,255,255,.7)"; x.lineWidth = 1.5; x.beginPath(); x.moveTo(32, 2); x.lineTo(32, 62); x.moveTo(2, 32); x.lineTo(62, 32); x.stroke(); })); }
function nuageEtoiles(texte, taille, y0, n0) { const W = 1400, H = 220, c = document.createElement("canvas"); c.width = W; c.height = H; const x = c.getContext("2d"); let f = taille; x.font = `900 ${f}px Arial Black,Arial`; while (x.measureText(texte).width > W - 40 && f > 40) { f -= 6; x.font = `900 ${f}px Arial Black,Arial`; }
  x.fillStyle = "#fff"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(texte, W / 2, H / 2); const d = x.getImageData(0, 0, W, H).data, pts = [], pas = Math.max(5, Math.round(f / 16));
  for (let j = 0; j < H; j += pas) for (let i = 0; i < W; i += pas) if (d[(j * W + i) * 4 + 3] > 128) pts.push([i + (Math.random() - .5) * pas * .5, j + (Math.random() - .5) * pas * .5]);
  const k = CIEL.larg / W, pos = new Float32Array(pts.length * 3), col = new Float32Array(pts.length * 3), info = [];
  pts.forEach(([i, j], n) => { pos[n * 3] = (i - W / 2) * k; pos[n * 3 + 1] = y0 - (j - H / 2) * k; pos[n * 3 + 2] = 0; info.push({ app: .4 + (i / W) * 2.6 + Math.random() * .3, ph: Math.random() * 6, v: .8 + Math.random() * 2 }); });
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const m = new THREE.Points(g, new THREE.PointsMaterial({ size: n0, map: texPoint(), vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, sizeAttenuation: true })); m.frustumCulled = false; m.userData.info = info; return m; }
function cacherCommandes() { const d = KR.hud; if (!d) return; for (const id of ["kPos", "kTour", "kObj", "kChrono", "kDecompte", "kPalette", "kCarte", "kVitesse"]) { const e = d.querySelector("#" + id); if (e) e.style.visibility = "hidden"; } for (const e of d.querySelectorAll("[data-k]")) e.style.visibility = "hidden"; }
function cielK(opt) { opt = opt || {}; finCiel(); CIEL.larg = 96 * Math.max(.5, Math.min(1, M.camera.aspect * 1.05)); cacherCommandes(); const G = new THREE.Group(); G.position.set(CIEL.x, 0, CIEL.z); KC.scene.add(G); const gagnant = classement()[0], nom = opt.texte || (gagnant ? gagnant.nom : "").toUpperCase();
  const titre = nuageEtoiles(nom, 190, CIEL.y, 1.5), sous = nuageEtoiles("★ VAINQUEUR ★", 110, CIEL.y - 17, 1.1); sous.userData.dore = true; G.add(titre, sous); if (opt.chef) sous.visible = false;
  // le feu d'artifice : un seul nuage de points pour toutes les gerbes (léger)
  const N = 2600, pos = new Float32Array(N * 3), col = new Float32Array(N * 3), g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const fw = new THREE.Points(g, new THREE.PointsMaterial({ size: 1.3, map: texPoint(), vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); fw.frustumCulled = false; KC.scene.add(fw);
  const parts = Array.from({ length: N }, () => ({ vie: 0 })); KR.ciel = { G, titre, sous, fw, parts, fusees: [], t: 0, prochaine: .2, nom, cam0: M.camera.position.clone(), q0: M.camera.quaternion.clone(), i: 0, chef: !!opt.chef };
  sonK("arrivee"); }
const COUL_FW = [[1, .3, .35], [1, .85, .25], [.35, .8, 1], [.5, 1, .45], [1, .5, 1], [1, 1, 1], [1, .6, .2]];
function gerbeK(x0, y0, z0) { const C = KR.ciel, c = COUL_FW[Math.floor(Math.random() * COUL_FW.length)], c2 = Math.random() < .35 ? COUL_FW[Math.floor(Math.random() * COUL_FW.length)] : c, n = 150 + Math.floor(Math.random() * 90), vit = 11 + Math.random() * 9, anneau = Math.random() < .25;
  for (let k = 0; k < n; k++) { const P = C.parts[C.i++ % C.parts.length]; const th = Math.random() * Math.PI * 2, ph = anneau ? Math.PI / 2 + (Math.random() - .5) * .15 : Math.acos(2 * Math.random() - 1), v = vit * (anneau ? 1 : .75 + Math.random() * .25);
    P.x = x0; P.y = y0; P.z = z0; P.vx = Math.sin(ph) * Math.cos(th) * v; P.vy = Math.cos(ph) * v; P.vz = Math.sin(ph) * Math.sin(th) * v; P.vie = P.max = 1.6 + Math.random() * .9; P.c = k % 3 ? c : c2; P.scint = Math.random() < .3; }
  sonK(Math.random() < .5 ? "boum" : "pan"); }
function majCiel(dt) { const C = KR.ciel; C.t += dt; const t = C.t;
  // les étoiles du nom apparaissent de gauche à droite, puis scintillent
  for (const S of [C.titre, C.sous]) { const col = S.geometry.attributes.color, inf = S.userData.info, dore = S.userData.dore;
    for (let n = 0; n < inf.length; n++) { const I = inf[n], a = Math.max(0, Math.min(1, (t - I.app) * 2.5)), sc = .75 + .25 * Math.sin(t * I.v * 3 + I.ph), b = a * sc * (a < 1 ? 1.6 - .6 * a : 1);
      if (dore) col.setXYZ(n, b, b * .82, b * .35); else col.setXYZ(n, b, b * .96, b * .85); } col.needsUpdate = true; }
  // les fusées : elles montent en traînant des étincelles, puis éclatent
  C.prochaine -= dt; if (C.prochaine <= 0 && t < 11) { C.prochaine = .25 + Math.random() * .45; const x = (Math.random() - .5) * 90, z = CIEL.z + 10 + (Math.random() - .5) * 70; C.fusees.push({ x, y: 2, z, vy: 32 + Math.random() * 10, h: 38 + Math.random() * 42 }); sonK("fuse"); }
  for (const F of C.fusees) { F.y += F.vy * dt; const P = C.parts[C.i++ % C.parts.length]; P.x = F.x + (Math.random() - .5) * .3; P.y = F.y; P.z = F.z; P.vx = (Math.random() - .5); P.vy = -2; P.vz = (Math.random() - .5); P.vie = P.max = .5; P.c = [1, .8, .5]; P.scint = false; if (F.y >= F.h) { F.fini = true; gerbeK(F.x, F.y, F.z); } }
  C.fusees = C.fusees.filter(F => !F.fini);
  const pos = C.fw.geometry.attributes.position, col = C.fw.geometry.attributes.color;
  for (let n = 0; n < C.parts.length; n++) { const P = C.parts[n]; if (P.vie > 0) { P.vie -= dt; P.vy -= 7 * dt; const fr = Math.pow(.35, dt); P.vx *= fr; P.vy *= fr; P.vz *= fr; P.x += P.vx * dt; P.y += P.vy * dt; P.z += P.vz * dt;
      const u = Math.max(0, P.vie / P.max), b = (P.scint ? (Math.random() < .5 ? 1.4 : .3) : 1) * Math.min(1, u * 1.6); pos.setXYZ(n, P.x, P.y, P.z); col.setXYZ(n, P.c[0] * b, P.c[1] * b, P.c[2] * b); } else { col.setXYZ(n, 0, 0, 0); pos.setXYZ(n, 0, -999, 0); } }
  pos.needsUpdate = col.needsUpdate = true;
  if (t > 12.5 && !KR.cer && !KR.podium) { const chef = C.chef; finCiel(); if (chef) podiumK(); else ceremonieK(); } }
function cameraCiel(cam, dt) { const C = KR.ciel, t = C.t, u = Math.min(1, t / 3.2), e = u * u * (3 - 2 * u);
  // (elle monte tout droit au-dessus de la caserne, et se tourne vers le ciel, face au nom)
  const fin = cv4.set(CIEL.x, C.chef ? 88 + t * .3 : 48 + t * .6, CIEL.z + 72); cam.position.lerpVectors(C.cam0, fin, e);   /* (avec le chef sur le dragon : la caméra monte plus haut, pour voir le dragon de dessus) */
  const regard = cv5.set(CIEL.x, CIEL.y - (C.chef ? 10 : 6), CIEL.z); if (e < 1) { const q = new THREE.Quaternion(); const m = new THREE.Matrix4().lookAt(cam.position, regard, cam.up); q.setFromRotationMatrix(m); cam.quaternion.slerpQuaternions(C.q0, q, e); } else cam.lookAt(regard);
  cam.fov += (62 - cam.fov) * Math.min(1, dt * 2); if (cam.far < 600) { cam.far = 600; } cam.updateProjectionMatrix(); }
function finCiel() { const C = KR.ciel; if (!C) return; C.G.parent && C.G.parent.remove(C.G); C.fw.parent && C.fw.parent.remove(C.fw); KR.ciel = null; }
/* ---------- la cérémonie : le podium dans la cour d'honneur, le gagnant qui saute les bras en l'air avec la coupe, des confettis, la caméra qui tourne autour ---------- */
const POD = { x: 0, z: -5 };
/* la combinaison de pilote : à la couleur de l'équipe, bandes blanches sur les côtés, écussons, « CASERNE NF » sur la poitrine, le numéro, la fermeture éclair,
   le col montant, la ceinture ; les gants et les bottines noires à semelle blanche ; la tête du pilote au-dessus */
function texCombi(coul, num, dos) { const c = "#" + new THREE.Color(coul).getHexString(); return tex(toile(256, 256, x => { x.fillStyle = c; x.fillRect(0, 0, 256, 256);
  const gr = x.createLinearGradient(0, 0, 256, 0); gr.addColorStop(0, "rgba(0,0,0,.25)"); gr.addColorStop(.5, "rgba(255,255,255,.08)"); gr.addColorStop(1, "rgba(0,0,0,.25)"); x.fillStyle = gr; x.fillRect(0, 0, 256, 256);
  x.fillStyle = "#f4f4f4"; x.fillRect(0, 0, 20, 256); x.fillRect(236, 0, 20, 256); x.fillStyle = "#111"; x.fillRect(20, 0, 5, 256); x.fillRect(231, 0, 5, 256);   // (les bandes des côtés)
  x.fillStyle = "#111"; x.fillRect(0, 196, 256, 16);   // (la ceinture)
  if (!dos) { x.fillStyle = "#bbb"; x.fillRect(126, 0, 4, 196); x.fillStyle = "#14234a"; x.beginPath(); x.roundRect(64, 40, 128, 34, 8); x.fill(); x.fillStyle = "#ffd23a"; x.font = "900 22px Arial Black,Arial"; x.textAlign = "center"; x.fillText("CASERNE NF", 128, 64);
    x.fillStyle = "#fff"; x.beginPath(); x.arc(78, 110, 18, 0, 7); x.fill(); x.fillStyle = "#c8201c"; x.font = "900 22px Arial"; x.fillText(String(num), 78, 118);
    for (const [xx, yy, cc] of [[150, 96, "#ffd23a"], [178, 96, "#2ad8ff"], [150, 130, "#ff4a5a"]]) { x.fillStyle = cc; x.fillRect(xx, yy, 24, 20); x.strokeStyle = "#111"; x.lineWidth = 2; x.strokeRect(xx, yy, 24, 20); } }
  else { x.fillStyle = "#fff"; x.font = "900 90px Arial Black,Arial"; x.textAlign = "center"; x.strokeStyle = "#111"; x.lineWidth = 6; x.strokeText(String(num), 128, 150); x.fillText(String(num), 128, 150); } })); }
function figurePilote(p, haut) { const g = new THREE.Group(), coul = p.K.corps.material.color.getHex(), num = (KR.pil.indexOf(p) + 1), noir = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: .6 }), blanc = new THREE.MeshStandardMaterial({ color: 0xf4f4f4, roughness: .5 });
  const combi = new THREE.MeshStandardMaterial({ color: coul, roughness: .55 }), devant = new THREE.MeshStandardMaterial({ map: texCombi(coul, num, false), roughness: .55 }), dos = new THREE.MeshStandardMaterial({ map: texCombi(coul, num, true), roughness: .55 });
  // les jambes (avec la bande blanche), les bottines
  for (const sx of [-.12, .12]) { const j = new THREE.Mesh(new THREE.CapsuleGeometry(.085, .5, 4, 10), combi); j.position.set(sx, .38, 0); g.add(j); const bd = new THREE.Mesh(new THREE.CylinderGeometry(.087, .087, .46, 10, 1, true, sx > 0 ? -.3 : Math.PI - .3, .6), blanc); bd.position.set(sx, .4, 0); g.add(bd);
    const bo = new THREE.Mesh(new THREE.BoxGeometry(.15, .12, .28), noir); bo.position.set(sx, .06, .04); g.add(bo); const se = new THREE.Mesh(new THREE.BoxGeometry(.16, .03, .3), blanc); se.position.set(sx, .005, .04); g.add(se); }
  // le buste : devant (écussons, CASERNE NF, numéro), dos (le grand numéro), le col montant
  const buste = new THREE.Mesh(new THREE.BoxGeometry(.42, .58, .26), [combi, combi, combi, combi, devant, dos]); buste.position.y = .98; g.add(buste);
  const epaules = new THREE.Mesh(new THREE.CapsuleGeometry(.13, .3, 4, 10), combi); epaules.rotation.z = Math.PI / 2; epaules.position.y = 1.22; g.add(epaules);
  const col = new THREE.Mesh(new THREE.CylinderGeometry(.11, .13, .1, 12), combi); col.position.y = 1.31; g.add(col);
  // les bras (bande blanche, gants noirs)
  const bras = [-1, 1].map(sx => { const pv = new THREE.Group(); pv.position.set(sx * .29, 1.2, 0); const b2 = new THREE.Mesh(new THREE.CapsuleGeometry(.065, .44, 4, 8), combi); b2.position.y = -.27; pv.add(b2);
    const bd = new THREE.Mesh(new THREE.CylinderGeometry(.067, .067, .4, 8, 1, true, sx > 0 ? Math.PI / 2 - .3 : -Math.PI / 2 - .3, .6), blanc); bd.position.y = -.27; pv.add(bd); const m = new THREE.Mesh(new THREE.SphereGeometry(.08, 8, 6), noir); m.position.y = -.55; pv.add(m); g.add(pv); return pv; });
  let tete; if (p.K.tete) { tete = p.K.tete.clone(true); tete.material = p.K.tete.material.clone(); tete.material.color.setScalar(1); tete.scale.multiplyScalar(.6); tete.position.set(0, 1.62, 0); } else { tete = new THREE.Mesh(new THREE.SphereGeometry(.22, 16, 12), new THREE.MeshStandardMaterial({ color: p.K.coul, roughness: .15, metalness: .3 })); tete.position.y = 1.52; } g.add(tete);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); return { g, bras, base: haut }; }
// le chef de poste : en uniforme bleu nuit, galons, pantalon à bande rouge, gants blancs, sa tête
function figureChef() { const g = new THREE.Group(), bleu = new THREE.MeshStandardMaterial({ color: 0x1a2244, roughness: .6 }), blanc = new THREE.MeshStandardMaterial({ color: 0xf6f6f6, roughness: .5 }), noir = new THREE.MeshStandardMaterial({ color: 0x0c0c0c, roughness: .3, metalness: .3 }), or = new THREE.MeshStandardMaterial({ color: 0xe8b830, metalness: .7, roughness: .3 });
  const jambes = [-1, 1].map(sx => { const pv = new THREE.Group(); pv.position.set(sx * .12, .78, 0); const j = new THREE.Mesh(new THREE.CapsuleGeometry(.09, .55, 4, 10), bleu); j.position.y = -.38; pv.add(j); const bd = new THREE.Mesh(new THREE.BoxGeometry(.02, .6, .04), new THREE.MeshStandardMaterial({ color: 0xc8201c })); bd.position.set(sx * .09, -.38, 0); pv.add(bd); const ch = new THREE.Mesh(new THREE.BoxGeometry(.15, .1, .3), noir); ch.position.set(0, -.74, .05); pv.add(ch); g.add(pv); return pv; });
  const veste = new THREE.Mesh(new THREE.CapsuleGeometry(.24, .4, 4, 12), bleu); veste.position.y = 1.08; g.add(veste); for (let i = 0; i < 4; i++) { const bt = new THREE.Mesh(new THREE.SphereGeometry(.022, 6, 4), or); bt.position.set(0, .9 + i * .1, .24); g.add(bt); }
  for (const sx of [-1, 1]) { const ep = new THREE.Mesh(new THREE.BoxGeometry(.16, .04, .12), or); ep.position.set(sx * .24, 1.38, 0); g.add(ep); }
  const bras = [-1, 1].map(sx => { const pv = new THREE.Group(); pv.position.set(sx * .3, 1.3, 0); const b2 = new THREE.Mesh(new THREE.CapsuleGeometry(.07, .44, 4, 8), bleu); b2.position.y = -.27; pv.add(b2); const m = new THREE.Mesh(new THREE.SphereGeometry(.08, 8, 6), blanc); m.position.y = -.55; pv.add(m); g.add(pv); return pv; });
  const t = new THREE.TextureLoader().load("images/pere-tete.png"); t.colorSpace = THREE.SRGBColorSpace; const tete = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, alphaTest: .05 })); tete.scale.set(.5 * 124 / 156, .5, 1); tete.position.y = 1.66; g.add(tete);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); return { g, bras, jambes }; }
function coupeK() { const g = new THREE.Group(), or = new THREE.MeshStandardMaterial({ color: 0xffc83a, metalness: 1, roughness: .18, emissive: 0x3a2600, emissiveIntensity: .4 });
  const prof = [[0, 0], [.13, 0], [.13, .05], [.05, .08], [.04, .2], [.05, .24], [.17, .32], [.2, .48], [.19, .5], [0, .5]].map(([x, y]) => new THREE.Vector2(x, y));
  g.add(new THREE.Mesh(new THREE.LatheGeometry(prof, 28), or)); for (const sx of [-1, 1]) { const a = new THREE.Mesh(new THREE.TorusGeometry(.08, .018, 8, 16, Math.PI * 1.2), or); a.position.set(sx * .2, .38, 0); a.rotation.z = sx > 0 ? -Math.PI * .6 : Math.PI * 1.4; g.add(a); }
  const socle = new THREE.Mesh(new THREE.BoxGeometry(.24, .08, .24), new THREE.MeshStandardMaterial({ color: 0x2a1a10, roughness: .5 })); socle.position.y = -.04; g.add(socle); return g; }
function ceremonieK() { const L2 = classement().slice(0, 3); if (!L2.length) { podiumK(); return; } pisteVisibleK(false);
  const G = new THREE.Group(); G.position.set(POD.x, 0, POD.z); KC.scene.add(G); const blanc = new THREE.MeshStandardMaterial({ color: 0xf4f4f4, roughness: .5 });
  // le tapis rouge, les trois marches (numérotées), la lumière
  const tapis = new THREE.Mesh(new THREE.PlaneGeometry(6, 5), new THREE.MeshStandardMaterial({ color: 0xa8141c, roughness: .9 })); tapis.rotation.x = -Math.PI / 2; tapis.position.set(0, .02, .8); G.add(tapis);
  const marches = [[0, 1.0, "1"], [-1.45, .65, "2"], [1.45, .42, "3"]]; for (const [x, h, n] of marches) { const t = tex(toile(128, 128, c => { c.fillStyle = "#f4f4f4"; c.fillRect(0, 0, 128, 128); c.fillStyle = n === "1" ? "#d4a017" : n === "2" ? "#9aa3ad" : "#b0703a"; c.font = "900 90px Arial Black,Arial"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(n, 64, 70); }));
    const b = new THREE.Mesh(new THREE.BoxGeometry(1.4, h, 1.2), [blanc, blanc, blanc, blanc, new THREE.MeshStandardMaterial({ map: t, roughness: .5 }), blanc]); b.position.set(x, h / 2, 0); b.castShadow = b.receiveShadow = true; G.add(b); }
  const spot = new THREE.SpotLight(0xfff4e0, 120, 30, .6, .5, 1.2); spot.position.set(0, 9, 6); spot.target = G; G.add(spot); const pl = new THREE.PointLight(0xffd080, 8, 12, 1.5); pl.position.set(0, 3, 3); G.add(pl);
  const figs = L2.map((p, i) => { const f = figurePilote(p, marches[i][1]); f.g.position.set(marches[i][0], marches[i][1], 0); G.add(f.g); return f; });
  const coupe = coupeK(), chef = figureChef(); chef.g.position.set(4.6, 0, 3.2); G.add(chef.g); chef.g.add(coupe); coupe.position.set(0, 1.0, .42); coupe.scale.setScalar(1.1);
  // les confettis
  const conf = [], geo = new THREE.PlaneGeometry(.08, .05), C = [0xff3a5a, 0xffd23a, 0x3ad0ff, 0x6aff6a, 0xffffff, 0xff8a1a]; for (let i = 0; i < 160; i++) { const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: C[i % C.length], side: THREE.DoubleSide })); m.position.set((Math.random() - .5) * 6, 3 + Math.random() * 5, (Math.random() - .5) * 4); m.userData.v = .6 + Math.random() * .8; m.userData.r = Math.random() * 6; G.add(m); conf.push(m); }
  KR.cer = { G, figs, coupe, chef, conf, t: 0, gagnant: L2[0], remise: false, tir: KR.forceTir !== undefined ? !!KR.forceTir : Math.random() < 1 / 2, sang: [], tirs: 0 }; sonK("arrivee"); setTimeout(() => sonK("arrivee"), 700);
  // la bannière
  const d = KR.hud; if (d) { const b2 = document.createElement("div"); b2.id = "kCer"; b2.style.cssText = "position:absolute;left:0;right:0;top:16%;text-align:center;pointer-events:none"; b2.innerHTML = `<div style="display:inline-block;padding:10px 24px;border-radius:14px;background:rgba(20,35,74,.85);font:900 28px 'Arial Black',Arial;color:#ffd23a">🏆 ${L2[0].nom.toUpperCase()} GAGNE !</div><div style="font:700 13px Arial;opacity:.85;margin-top:6px">Toucher l'écran pour voir le classement</div>`; d.appendChild(b2);
    for (const id of ["kPos", "kTour", "kObj", "kChrono", "kDecompte", "kPalette"]) { const e = d.querySelector("#" + id); if (e) e.style.visibility = "hidden"; } for (const e of d.querySelectorAll("[data-k]")) e.style.visibility = "hidden"; }
  KR.cerFin = setTimeout(() => { if (KR.cer && !KR.podium && !KR.cer.tir) podiumK(); }, 40000); }
function majCeremonie(dt) { const C = KR.cer; C.t += dt; const t = C.t, H = C.chef, w = C.figs[0]; if (!C.tir && t > 12.5 && !KR.podium) podiumK();
  /* le chef de poste arrive par la droite, la coupe dans les mains, marche jusqu'au pied de la première marche, la tend au vainqueur ;
     le vainqueur la prend et la brandit en sautant ; le chef recule d'un pas et applaudit */
  const dep = new THREE.Vector3(4.6, 0, 3.2), arr = new THREE.Vector3(.75, 0, 1.15), u = Math.max(0, Math.min(1, (t - .4) / 3.2)), e = u * u * (3 - 2 * u);
  if (C.tir && t >= 3.6) majTir(C, dt, t, arr);
  else if (t < 3.6) { H.g.position.lerpVectors(dep, arr, e); H.g.rotation.y = Math.atan2(arr.x - dep.x, arr.z - dep.z); const pas = u < 1 ? Math.sin(t * 9) : 0; H.jambes[0].rotation.x = pas * .5; H.jambes[1].rotation.x = -pas * .5; H.g.position.y = Math.abs(pas) * .04;
    H.bras[0].rotation.set(-1.1, 0, -.25); H.bras[1].rotation.set(-1.1, 0, .25); }
  else if (t < 4.8) { H.g.rotation.y += (Math.atan2(-arr.x, -arr.z) - H.g.rotation.y) * Math.min(1, dt * 6); const k = Math.min(1, (t - 3.6) / .8); H.bras[0].rotation.set(-1.1 - k * 1.5, 0, -.25); H.bras[1].rotation.set(-1.1 - k * 1.5, 0, .25); C.coupe.position.set(0, 1.0 + k * 1.1, .42 + k * .3);
    H.jambes[0].rotation.x = H.jambes[1].rotation.x = 0; }
  else { if (!C.remise) { C.remise = true; w.g.add(C.coupe); C.coupe.position.set(0, 2.15, .05); C.coupe.scale.setScalar(1.3); sonK("arrivee"); }
    const k = Math.min(1, (t - 4.8) / .6); H.g.position.lerpVectors(arr, new THREE.Vector3(1.6, 0, 2.1), k); const cl = Math.abs(Math.sin(t * 9)); H.bras[0].rotation.set(-1.2, 0, -.2 - cl * .35); H.bras[1].rotation.set(-1.2, 0, .2 + cl * .35); C.coupe.rotation.y += dt * 1.5; }
  if (!(C.tir && t >= 3.6)) C.figs.forEach((f, i) => { if (i === 0) { if (C.remise) { const saut = Math.abs(Math.sin(t * 4.2)) * .45; f.g.position.y = f.base + saut; f.bras[0].rotation.z = -2.7 + Math.sin(t * 8.4) * .15; f.bras[1].rotation.z = 2.7 - Math.sin(t * 8.4) * .15; } else { f.bras[0].rotation.z = -.4 - Math.abs(Math.sin(t * 3)) * .5; f.bras[1].rotation.z = .4 + Math.abs(Math.sin(t * 3)) * .5; } }
    else { f.bras[1].rotation.z = 1.4 + Math.sin(t * 5 + i) * .6; f.bras[0].rotation.z = -.2; } f.g.rotation.y = Math.sin(t * .8 + i) * .15; });
  for (const m of C.conf) { m.position.y -= m.userData.v * dt; m.rotation.x += dt * 3 + m.userData.r * .01; m.rotation.y += dt * 2; m.position.x += Math.sin(t * 2 + m.userData.r) * dt * .3; if (m.position.y < 0) m.position.y = 6 + Math.random() * 2; } }
/* ---------- une fois sur trois : le chef de poste pose la coupe, sort son arme et tire sur les trois du podium ; ils tombent en arrière ;
   puis on le retrouve sur le dos du dragon, dans le ciel, avec « Ché ta mi » écrit en étoiles ---------- */
function armeK() { const g = new THREE.Group(), noir = new THREE.MeshStandardMaterial({ color: 0x18181a, roughness: .35, metalness: .7 });
  const canon = new THREE.Mesh(new THREE.BoxGeometry(.06, .26, .07), noir); canon.position.y = -.1; g.add(canon); const crosse = new THREE.Mesh(new THREE.BoxGeometry(.055, .07, .14), noir); crosse.position.set(0, .02, -.07); crosse.rotation.x = .25; g.add(crosse);
  const eclair = new THREE.Sprite(new THREE.SpriteMaterial({ map: texPoint(), color: 0xffd060, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); eclair.position.y = -.3; eclair.scale.setScalar(.5); eclair.visible = false; g.add(eclair); g.userData.eclair = eclair; return g; }
let texGS = null, texFS = null;
function texGoutteSang() { return texGS = texGS || tex(toile(64, 64, x => { x.fillStyle = "#c4000c"; x.strokeStyle = "#5a0004"; x.lineWidth = 3; x.beginPath(); x.arc(32, 34, 20, 0, 7); x.fill(); x.stroke(); x.fillStyle = "#ff5a5a"; x.beginPath(); x.ellipse(25, 27, 5, 7, -.5, 0, 7); x.fill(); })); }
function texFlaqueSang() { return texFS = texFS || tex(toile(128, 128, x => { x.fillStyle = "#9a0008"; x.beginPath(); for (let i = 0; i <= 24; i++) { const a = i / 24 * Math.PI * 2, r = 40 + Math.sin(i * 2.7) * 9 + (i % 3 ? 0 : 10); x.lineTo(64 + Math.cos(a) * r, 64 + Math.sin(a) * r); } x.fill();
  for (let k = 0; k < 9; k++) { const a = Math.random() * 7, r = 50 + Math.random() * 10; x.beginPath(); x.arc(64 + Math.cos(a) * r, 64 + Math.sin(a) * r, 3 + Math.random() * 5, 0, 7); x.fill(); } x.fillStyle = "rgba(255,90,90,.5)"; x.beginPath(); x.ellipse(52, 50, 12, 6, -.5, 0, 7); x.fill(); })); }
function sangK(C, pos, dir) { const G = C.G, mat = C.sangM || (C.sangM = new THREE.SpriteMaterial({ map: texGoutteSang(), color: 0xffffff, transparent: true, depthWrite: false }));
  for (let k = 0; k < 70; k++) { const sp = new THREE.Sprite(mat); sp.position.copy(pos); sp.scale.setScalar(.12 + Math.random() * .2); G.add(sp); C.sang.push({ sp, vx: dir.x * (1 + Math.random() * 3) + (Math.random() - .5) * 1.6, vy: 1 + Math.random() * 2.6, vz: dir.z * (1 + Math.random() * 3) + (Math.random() - .5) * 1.6, vie: 1.6 }); } }
function flaqueK(C, x, y, z, r) { const m = new THREE.Mesh(new THREE.CircleGeometry(r, 18), new THREE.MeshBasicMaterial({ map: texFlaqueSang(), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 })); m.rotation.x = -Math.PI / 2; m.position.set(x, y + .03, z); m.scale.setScalar(.1); C.G.add(m); C.flaques = (C.flaques || []).concat([m]); }
function majTir(C, dt, t, arr) { const H = C.chef, bd = H.bras[0];
  if (!C.arme) { C.arme = armeK(); bd.add(C.arme); C.arme.position.set(0, -.62, 0); C.arme.scale.setScalar(1.7); C.G.add(C.coupe); C.coupe.position.set(arr.x + .45, 0, arr.z + .25); C.coupe.rotation.set(0, 0, 0); C.coupe.scale.setScalar(1.1); clearTimeout(KR.cerFin); }
  H.jambes[0].rotation.x = H.jambes[1].rotation.x = 0; H.g.position.y = 0; H.bras[1].rotation.set(-.2, 0, .2);
  // (il vise chacun des trois, l'un après l'autre)
  const ordre = [0, 1, 2].filter(i => C.figs[i]), k = Math.min(ordre.length - 1, Math.max(0, Math.floor((t - 4.2) / .8))), f = C.figs[ordre[k]], vise = new THREE.Vector3();
  f.g.getWorldPosition(vise); C.G.worldToLocal(vise); const cap = Math.atan2(vise.x - H.g.position.x, vise.z - H.g.position.z); H.g.rotation.y += Math.atan2(Math.sin(cap - H.g.rotation.y), Math.cos(cap - H.g.rotation.y)) * Math.min(1, dt * 10);
  const leve = Math.min(1, (t - 3.6) / .5); bd.rotation.set(-1.45 * leve - (f.base - .9) * .3 * leve, 0, 0); C.arme.userData.eclair.visible = false;
  // les coups de feu
  const tirT = 4.6 + C.tirs * .8; if (C.tirs < ordre.length && t >= tirT) { const cible = C.figs[ordre[C.tirs]]; C.tirs++; sonK("pan"); sonK("boum"); C.arme.userData.eclair.visible = true; C.flash = .09; bd.rotation.x -= .5;
    cible.chute = t; const P = new THREE.Vector3(); cible.g.getWorldPosition(P); C.G.worldToLocal(P); P.y += 1.0; sangK(C, P, new THREE.Vector3(0, 0, -1)); flaqueK(C, cible.g.position.x, cible.base, cible.g.position.z + .1, .55); }
  if (C.flash > 0) { C.flash -= dt; C.arme.userData.eclair.visible = true; C.arme.userData.eclair.scale.setScalar(.35 + Math.random() * .3); }
  // ils tombent en arrière, du haut du podium jusqu'au sol (les bras en l'air)
  for (const fg of C.figs) { if (fg.chute === undefined) { fg.bras[0].rotation.z = -.2; fg.bras[1].rotation.z = .2; continue; } const u = Math.min(1, (t - fg.chute) / .9), e2 = u * u;
    fg.g.rotation.x = -e2 * 1.5; fg.g.position.z = -u * 1.05; fg.g.position.y = fg.base * (1 - e2) + .12 * e2 + Math.sin(u * Math.PI) * .25; fg.bras[0].rotation.z = -1.4 - Math.sin(t * 20) * .3 * (1 - u); fg.bras[1].rotation.z = 1.4 + Math.sin(t * 20) * .3 * (1 - u);
    if (u >= 1 && !fg.flaque) { fg.flaque = true; flaqueK(C, fg.g.position.x, 0, fg.g.position.z - .8, .9); } }
  for (const m of C.flaques || []) m.scale.setScalar(Math.min(1, m.scale.x + dt * 1.2));
  for (const S of C.sang) { if (S.vie <= 0) continue; S.vie -= dt; S.vy -= 9 * dt; S.sp.position.x += S.vx * dt; S.sp.position.y += S.vy * dt; S.sp.position.z += S.vz * dt; if (S.sp.position.y < .04) { S.sp.position.y = .04; S.vx = S.vz = S.vy = 0; } }
  // et pour finir : en route pour le ciel, sur le dos du dragon
  if (t > 4.6 + ordre.length * .8 + 1.6 && !KR.ciel) { finCeremonie(); cielK({ texte: "Ché ta mi", chef: true }); } }
function cameraCeremonie(cam, dt) { const t = KR.cer.t, a = .55 + Math.sin(t * .25) * .6, r = 7.2 - Math.min(2.4, t * .5), h = 2.6 + Math.max(0, 4 - t * 1.2);
  const voulu = cv4.set(POD.x + Math.sin(a) * r, h, POD.z + Math.cos(a) * r); cam.position.lerp(voulu, KR.cerCam ? 1 - Math.exp(-dt * 3) : 1); KR.cerCam = true;
  cam.lookAt(POD.x, 1.5, POD.z); cam.fov += (50 - cam.fov) * Math.min(1, dt * 2); cam.updateProjectionMatrix(); }
function finCeremonie() { clearTimeout(KR.cerFin); if (KR.cer) { KR.cer.G.parent && KR.cer.G.parent.remove(KR.cer.G); KR.cer = null; } KR.cerCam = false; const b = document.getElementById("kCer"); if (b) b.remove(); }
/* le tableau des résultats : les lignes arrivent une à une, avec la place (or, argent, bronze), la tête du coureur, son nom, son temps,
   l'écart avec le premier et les points gagnés ; notre ligne est mise en avant ; le record personnel ; Rejouer, Quitter */
const POINTS_K = [15, 12, 10, 8, 7, 6, 5, 4];
function podiumK() { KR.podium = true; const d = document.createElement("div"); d.id = "kFin"; const L2 = classement(), t1 = (L2[0] && L2[0].fini) || 0; let rec = null; try { rec = JSON.parse(localStorage.getItem("karts-record") || "null"); } catch (e) {}
  d.style.cssText = "position:absolute;inset:0;z-index:21;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 30%,rgba(30,60,140,.75),rgba(4,8,22,.92));font-family:Arial,sans-serif;color:#fff;user-select:none;-webkit-user-select:none";
  const coulRang = i => i === 0 ? ["#fff3a0", "#e8a810"] : i === 1 ? ["#f4f6fa", "#9aa6b8"] : i === 2 ? ["#ffd0a0", "#c0702a"] : ["#ffffff", "#5a6a8a"];
  d.innerHTML = `<style>@keyframes kLigne { from { transform: translateX(110%); opacity: 0 } to { transform: none; opacity: 1 } } @keyframes kMoi { 0%,100% { box-shadow: 0 0 0 3px #7ef0ff, 0 0 18px rgba(126,240,255,.6) } 50% { box-shadow: 0 0 0 3px #fff, 0 0 30px rgba(126,240,255,.95) } }</style>
    <div class="k-res" style="width:min(94vw,560px);max-height:96%;overflow:auto;padding:6px">
      <div style="text-align:center;font:italic 900 40px 'Arial Black',Arial;color:#ffd23a;-webkit-text-stroke:2px #111;text-shadow:0 4px 0 #8a3a00,0 8px 16px rgba(0,0,0,.6);margin-bottom:10px">RÉSULTATS</div>
      ${L2.map((p, i) => { const [c1, c2] = coulRang(i), ec = p.fini && t1 && i ? "+" + ((p.fini - t1) / 1000).toFixed(2) + " s" : "";
        return `<div style="display:flex;align-items:center;gap:10px;margin:7px 0;padding:6px 12px 6px 6px;border-radius:14px;background:linear-gradient(90deg,${p.moi ? "rgba(40,140,200,.95)" : "rgba(20,32,70,.92)"},${p.moi ? "rgba(20,80,140,.9)" : "rgba(12,20,48,.88)"});border:2px solid rgba(255,255,255,.18);animation:kLigne .45s ${.15 + i * .22}s both cubic-bezier(.2,1.3,.4,1)${p.moi ? `,kMoi 1.2s ${1 + i * .22}s infinite` : ""}">
          <div style="width:46px;text-align:center;font:italic 900 34px 'Arial Black',Arial;background:linear-gradient(${c1},${c2});-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-stroke:1.5px #111">${i + 1}</div>
          <div style="width:58px;height:58px;border-radius:12px;background:linear-gradient(#ffffff22,#00000033);border:2px solid ${c2};display:grid;place-items:center;overflow:hidden;flex:none"><img data-t="${i}" alt="" style="max-width:56px;max-height:56px;object-fit:contain"></div>
          <div style="flex:1;min-width:0"><div style="font:900 18px Arial;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.nom}${p.moi ? " <span style='font-size:12px;opacity:.85'>(toi)</span>" : ""}</div><div style="font:700 13px Arial;opacity:.75">${ec || (p.fini ? "Vainqueur" : "En course…")}</div></div>
          <div style="text-align:right"><div style="font:900 20px 'Courier New',monospace">${p.fini ? chronoK(p.fini) : "—"}</div><div style="font:900 13px Arial;color:#ffd23a">+${POINTS_K[i] || 0} pts</div></div></div>`; }).join("")}
      ${rec ? `<div style="margin-top:10px;text-align:center;font:700 15px Arial;opacity:.9">⏱️ Ton record : <b>${chronoK(rec)}</b>${KR.record ? ` <span style="color:#7dff5a">— nouveau record !</span>` : ""}</div>` : ""}
      <div style="display:flex;gap:12px;justify-content:center;margin-top:14px"><button type="button" id="kRejouer" style="border:3px solid #111;border-radius:16px;padding:10px 26px;background:linear-gradient(#ffe25a,#ff9a1a);color:#14234a;font:italic 900 20px 'Arial Black',Arial">↻ Rejouer</button><button type="button" id="kSortir" style="border:3px solid #111;border-radius:16px;padding:10px 22px;background:#3a3f55;color:#fff;font:900 18px Arial">Quitter</button></div></div>`;
  // les têtes : la photo du bonhomme, ou le personnage choisi
  L2.forEach((p, i) => { const im = d.querySelector(`img[data-t="${i}"]`), T = p.teteInfo; if (!im) return; if (T && T.teteUrl && !T.tete_v) im.src = T.teteUrl; else if (T) chargerTete(T.numero, T.tete_v, T.teteUrl).then(x => { if (x) im.src = x.src; else im.replaceWith(Object.assign(document.createElement("div"), { textContent: "🏎️", style: "font-size:30px" })); }).catch(() => {}); });
  for (const ev of ["pointerdown", "click", "touchstart"]) d.addEventListener(ev, e => e.stopPropagation());
  M.ctx.conteneur.appendChild(d); ajusterEcranK(d, d.querySelector(".k-res")); M.manMenu = { d };
  [523, 659, 784].forEach((f, i) => setTimeout(() => sonK("bip"), 200 + i * 220));
  d.querySelector("#kRejouer").onclick = () => { d.remove(); quitterCourse(); KR.attente = null; setTimeout(lancerCourse, 50); };
  d.querySelector("#kSortir").onclick = () => { d.remove(); quitterCourse(); }; }

/* ---------- les musiques de NF Kart : composées pour le jeu, jouées par le navigateur (sans fichier) ----------
   « titre » : joyeuse et sautillante (la page de garde, le choix du pilote, la fin de course) ; « course » : rapide et entraînante (elle accélère au dernier tour) */
const MUS_K = (() => { const n = s2 => { if (!s2 || s2 === "-") return null; const m = s2.match(/^([A-G])(#?)(\d)$/), b = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]] + (m[2] ? 1 : 0); return 440 * Math.pow(2, (b + (+m[3] + 1) * 12 - 69) / 12); };
  const seq = txt => { const out = []; for (const tok of txt.trim().split(/\s+/)) { const [no, l] = tok.split(":"); out.push(n(no)); for (let i = 1; i < +l; i++) out.push(undefined); } return out; };   // (une note, puis sa durée en doubles croches)
  return {
    titre: { bpm: 128, lead: seq("E5:2 G5:2 C6:2 G5:2 A5:4 G5:2 E5:2 F5:2 A5:2 D6:2 A5:2 G5:6 -:2 E5:2 G5:2 C6:2 E6:2 D6:2 C6:2 A5:2 G5:2 F5:2 E5:2 D5:2 G5:2 C5:6 -:2"),
      basse: seq("C3:4 G2:4 C3:4 G2:4 D3:4 A2:4 G2:4 D3:4 C3:4 G2:4 A2:4 E3:4 F2:4 C3:4 G2:4 G2:4"), arp: [[60, 64, 67], [62, 65, 69], [60, 64, 69], [65, 67, 71]], bat: "titre" },
    course: { bpm: 150, lead: seq("A4:1 C5:1 E5:2 A5:2 G5:2 E5:2 D5:2 C5:2 D5:2 E5:3 E5:1 G5:2 E5:2 D5:4 C5:2 B4:2 F5:1 A5:1 C6:2 A5:2 F5:2 G5:2 B5:2 D6:2 B5:2 C6:2 B5:2 A5:2 G5:2 E5:4 -:2 E5:1 G5:1"),
      basse: seq("A2:2 A3:2 A2:2 A3:2 A2:2 A3:2 G2:2 G3:2 E2:2 E3:2 E2:2 E3:2 G2:2 G3:2 B2:2 B3:2 F2:2 F3:2 F2:2 F3:2 G2:2 G3:2 G2:2 G3:2 A2:2 A3:2 G2:2 G3:2 E2:2 E3:2 E2:2 E3:2"), arp: [[57, 60, 64], [52, 55, 59], [53, 57, 60], [55, 59, 62]], bat: "course" } }; })();
const MUS = { nom: null, timer: 0, pas: 0, t: 0, gain: null, tempo: 1 };
/* la musique de la course : « Podium Pursuit », un vrai morceau (choisi par Germain-Pierre), joué en boucle ; il s'emballe un peu au dernier tour */
function musiqueFichierK() { if (!MUS.el) { MUS.el = new Audio("sons/karts/course.mp3"); MUS.el.loop = true; MUS.el.preload = "auto"; } return MUS.el; }
function musiqueK(nom) { const a = audioK(); if (!a) return; if (MUS.nom === nom) return; arreterMusique(true);
  if (nom === "course") { MUS.nom = nom; const el = musiqueFichierK(); clearInterval(MUS.fondu); el.currentTime = 0; el.playbackRate = 1; el.volume = 0; el.play().catch(() => {}); MUS.fondu = setInterval(() => { el.volume = Math.min(.6, el.volume + .05); if (el.volume >= .6) clearInterval(MUS.fondu); }, 50); setTimeout(() => { if (MUS.nom === "course" && !el.paused) { clearInterval(MUS.fondu); el.volume = .6; } }, 1500); return; }
  const T = MUS_K[nom]; if (!T) return; MUS.nom = nom; MUS.pas = 0; MUS.tempo = 1; MUS.gain = a.createGain(); MUS.gain.gain.value = 0; MUS.gain.connect(a.destination); MUS.gain.gain.linearRampToValueAtTime(nom === "course" ? .14 : .16, a.currentTime + .6); MUS.t = a.currentTime + .1;
  const note = (f, t0, d, type, v) => { if (!f) return; const o = a.createOscillator(), g = a.createGain(); o.type = type; o.frequency.value = f; g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(v, t0 + .01); g.gain.setTargetAtTime(v * .55, t0 + .03, .06); g.gain.setTargetAtTime(0, t0 + d * .92, .03); o.connect(g); g.connect(MUS.gain); o.start(t0); o.stop(t0 + d + .15); };
  const bruit = (t0, d, v, hp) => { const b = a.createBuffer(1, Math.max(1, a.sampleRate * d), a.sampleRate), c = b.getChannelData(0); for (let i = 0; i < c.length; i++) c[i] = (Math.random() * 2 - 1) * (1 - i / c.length); const s2 = a.createBufferSource(), g = a.createGain(), f = a.createBiquadFilter(); f.type = "highpass"; f.frequency.value = hp; g.gain.value = v; s2.buffer = b; s2.connect(f); f.connect(g); g.connect(MUS.gain); s2.start(t0); };
  const kick = t0 => { const o = a.createOscillator(), g = a.createGain(); o.frequency.setValueAtTime(150, t0); o.frequency.exponentialRampToValueAtTime(45, t0 + .12); g.gain.setValueAtTime(.9, t0); g.gain.exponentialRampToValueAtTime(.001, t0 + .16); o.connect(g); g.connect(MUS.gain); o.start(t0); o.stop(t0 + .2); };
  MUS.timer = setInterval(() => { if (!MUS.gain) return; const L = T.lead.length;
    while (MUS.t < a.currentTime + .2) { const p = MUS.pas % L, dt = 60 / (T.bpm * MUS.tempo) / 4, t0 = MUS.t, mesure = Math.floor(p / 16) % 4;
      // (la mélodie, la basse : chaque note dure jusqu'à la suivante)
      for (const [voix, type, v, oct] of [[T.lead, "square", .32, 1], [T.basse, "triangle", .55, 1]]) { const f = voix[p]; if (f) { let k = 1; while (voix[(p + k) % L] === undefined && k < 16) k++; note(f * oct, t0, dt * k, type, v); } }
      // (l'arpège, tout doux, en doubles croches)
      const acc = T.arp[mesure]; note(440 * Math.pow(2, (acc[p % 3] + 12 - 69) / 12), t0, dt * .9, "square", .07);
      // (la batterie)
      const q = p % 16; if (T.bat === "course") { if (q % 4 === 0 || q === 10) kick(t0); if (q === 4 || q === 12) bruit(t0, .12, .35, 1200); if (q % 2 === 0) bruit(t0, .03, .12, 7000); }
      else { if (q % 8 === 0) kick(t0); if (q === 4 || q === 12) bruit(t0, .09, .25, 1500); if (q % 4 === 2) bruit(t0, .025, .08, 8000); }
      MUS.pas++; MUS.t += dt; } }, 30); }
function arreterMusique(vite) { const a = kAudio; clearInterval(MUS.timer); MUS.timer = 0; if (MUS.el && !MUS.el.paused) { const el = MUS.el; clearInterval(MUS.fondu); MUS.fondu = setInterval(() => { el.volume = Math.max(0, el.volume - (vite ? .2 : .05)); if (el.volume <= 0) { clearInterval(MUS.fondu); el.pause(); } }, 50); } if (MUS.gain && a) { const g = MUS.gain; g.gain.cancelScheduledValues(a.currentTime); g.gain.setTargetAtTime(0, a.currentTime, vite ? .05 : .3); setTimeout(() => { try { g.disconnect(); } catch (e) {} }, 1500); } MUS.gain = null; MUS.nom = null; }

/* ---------- les sons (sans fichier : le moteur, les bips, la sirène) ---------- */
let kAudio = null, kMoteur = null;
function audioK() { try { kAudio = kAudio || new (window.AudioContext || window.webkitAudioContext)(); if (kAudio.state === "suspended") kAudio.resume(); } catch (e) {} return kAudio; }
function moteurK(n) { const a = audioK(); if (!a) return;
  if (!kMoteur && n > 0) { const o = a.createOscillator(), o2 = a.createOscillator(), g = a.createGain(), f = a.createBiquadFilter(); o.type = "sawtooth"; o2.type = "square"; f.type = "lowpass"; f.frequency.value = 600; g.gain.value = 0; o.connect(f); o2.connect(f); f.connect(g); g.connect(a.destination); o.start(); o2.start(); kMoteur = { o, o2, g }; }
  if (!kMoteur) return; const f = 55 + n * 120; kMoteur.o.frequency.setTargetAtTime(f, a.currentTime, .05); kMoteur.o2.frequency.setTargetAtTime(f * .5, a.currentTime, .05); kMoteur.g.gain.setTargetAtTime(KR.on ? .035 + n * .03 : 0, a.currentTime, .1);
  if (!KR.on && n === 0) { try { kMoteur.o.stop(); kMoteur.o2.stop(); } catch (e) {} kMoteur = null; } }
function sonK(q) { const a = audioK(); if (!a) return; const t0 = a.currentTime + .01;
  const bip = (f, d, type = "square", v = .1, dt = 0) => { const o = a.createOscillator(), g = a.createGain(); o.type = type; o.frequency.setValueAtTime(f, t0 + dt); g.gain.setValueAtTime(v, t0 + dt); g.gain.exponentialRampToValueAtTime(.001, t0 + dt + d); o.connect(g); g.connect(a.destination); o.start(t0 + dt); o.stop(t0 + dt + d + .02); return o; };
  if (q === "bip") { bip(523, .28, "square", .3); bip(1046, .28, "triangle", .12); } else if (q === "go") { bip(1046, .75, "square", .32); bip(1568, .75, "triangle", .14); }
  else if (q === "caisse") { bip(880, .08, "square", .08); bip(1175, .08, "square", .08, .08); bip(1568, .12, "square", .08, .16); }
  else if (q === "aie") { const o = bip(400, .6, "sawtooth", .12); o.frequency.exponentialRampToValueAtTime(80, t0 + .6); }
  else if (q === "saut") { const o = bip(300, .12, "triangle", .07); o.frequency.exponentialRampToValueAtTime(600, t0 + .12); }
  else if (q === "frotte") { const b = a.createBuffer(1, a.sampleRate * .18, a.sampleRate), c = b.getChannelData(0); for (let i = 0; i < c.length; i++) c[i] = (Math.random() * 2 - 1) * (1 - i / c.length); const s2 = a.createBufferSource(), g = a.createGain(), f = a.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 2500; g.gain.value = .06; s2.buffer = b; s2.connect(f); f.connect(g); g.connect(a.destination); s2.start(); }
  else if (q === "choc") { const o = bip(140, .15, "square", .1); o.frequency.exponentialRampToValueAtTime(60, t0 + .15); }
  else if (q === "klaxon") { bip(392, .25, "sawtooth", .09); bip(330, .35, "sawtooth", .09, .25); }
  else if (q === "meche") { const b = a.createBuffer(1, a.sampleRate * .5, a.sampleRate), c = b.getChannelData(0); for (let i = 0; i < c.length; i++) c[i] = (Math.random() * 2 - 1) * (Math.random() < .3 ? 1 : .2); const s2 = a.createBufferSource(), g = a.createGain(); g.gain.value = .05; s2.buffer = b; s2.connect(g); g.connect(a.destination); s2.start(); }
  else if (q === "boum") { const b = a.createBuffer(1, a.sampleRate * .9, a.sampleRate), c = b.getChannelData(0); for (let i = 0; i < c.length; i++) c[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / c.length, 2); const s2 = a.createBufferSource(), g = a.createGain(), f = a.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 900; g.gain.value = .35; s2.buffer = b; s2.connect(f); f.connect(g); g.connect(a.destination); s2.start(); }
  else if (q === "fuse") { const o = bip(500, .9, "sine", .025); o.frequency.exponentialRampToValueAtTime(2400, t0 + .9); }
  else if (q === "pan") { const b = a.createBuffer(1, a.sampleRate * .5, a.sampleRate), c = b.getChannelData(0); for (let i = 0; i < c.length; i++) c[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / c.length, 4); const s2 = a.createBufferSource(), g = a.createGain(), f = a.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 600; g.gain.value = .22; s2.buffer = b; s2.connect(f); f.connect(g); g.connect(a.destination); s2.start(); }
  else if (q === "dernier") { [784, 988, 1175, 1568].forEach((f, i) => bip(f, .16, "square", .08, i * .11)); }
  else if (q === "rugit") { const b = a.createBuffer(1, a.sampleRate * 1.6, a.sampleRate), c = b.getChannelData(0); for (let i = 0; i < c.length; i++) { const u = i / c.length; c[i] = (Math.random() * 2 - 1) * Math.sin(u * Math.PI) * (.6 + .4 * Math.sin(i / 90)); }
    const s2 = a.createBufferSource(), g = a.createGain(), f = a.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 420; g.gain.value = .5; s2.buffer = b; s2.connect(f); f.connect(g); g.connect(a.destination); s2.start(); const o = bip(70, 1.4, "sawtooth", .12); o.frequency.exponentialRampToValueAtTime(45, t0 + 1.4); }
  else if (q === "souffle") { const b = a.createBuffer(1, a.sampleRate * 2, a.sampleRate), c = b.getChannelData(0); for (let i = 0; i < c.length; i++) c[i] = (Math.random() * 2 - 1) * Math.min(1, i / 4000) * (1 - i / c.length); const s2 = a.createBufferSource(), g = a.createGain(), f = a.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 700; f.Q.value = .6; g.gain.value = .35; s2.buffer = b; s2.connect(f); f.connect(g); g.connect(a.destination); s2.start(); }
  else if (q === "plouf") { const b = a.createBuffer(1, a.sampleRate * 1.1, a.sampleRate), c = b.getChannelData(0); for (let i = 0; i < c.length; i++) c[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / c.length, 2.5); const s2 = a.createBufferSource(), g = a.createGain(), f = a.createBiquadFilter(); f.type = "lowpass"; f.frequency.setValueAtTime(2400, t0); f.frequency.exponentialRampToValueAtTime(300, t0 + 1); g.gain.value = .45; s2.buffer = b; s2.connect(f); f.connect(g); g.connect(a.destination); s2.start(); const o = bip(180, .3, "sine", .2); o.frequency.exponentialRampToValueAtTime(90, t0 + .3); }
  else if (q === "splat") { const o = bip(260, .25, "triangle", .12); o.frequency.exponentialRampToValueAtTime(70, t0 + .25); }
  else if (q === "glisse") { const o = bip(900, .5, "triangle", .08); o.frequency.exponentialRampToValueAtTime(300, t0 + .5); }
  else if (q === "turbo") { const o = bip(200, .7, "sawtooth", .1); o.frequency.exponentialRampToValueAtTime(900, t0 + .7); }
  else if (q === "fumi") { const b = a.createBuffer(1, a.sampleRate * .6, a.sampleRate), c = b.getChannelData(0); for (let i = 0; i < c.length; i++) c[i] = (Math.random() * 2 - 1) * (1 - i / c.length); const s = a.createBufferSource(), g = a.createGain(); g.gain.value = .15; s.buffer = b; s.connect(g); g.connect(a.destination); s.start(); }
  else if (q === "arrivee") [523, 659, 784, 1047].forEach((f, i) => bip(f, .25, "square", .08, i * .14));
  else bip(520, .1, "triangle", .06); }
function sireneK() { const a = audioK(); if (!a) return; const o = a.createOscillator(), g = a.createGain(), t0 = a.currentTime; o.type = "square"; g.gain.value = .05;
  for (let i = 0; i < 12; i++) o.frequency.setValueAtTime(i % 2 ? 640 : 960, t0 + i * .5); g.gain.setValueAtTime(.05, t0 + 5.6); g.gain.linearRampToValueAtTime(0, t0 + 6); o.connect(g); g.connect(a.destination); o.start(); o.stop(t0 + 6.1); }

/* la grille de départ : on vient la chercher dans la cour d'honneur, devant un garage (un panneau et un cercle l'indiquent) ; la course elle-même part du fond de la caserne */
const GRILLE_K = [-9.9, -9.8];   // (devant le garage du milieu, à gauche en regardant l'horloge : un cercle au sol devant le car de la Gendarmerie)
const FAMILLE_K = [2, 3, 4];   // (la course est ouverte à l'administrateur et à la famille : les mêmes badges que les invités de l'appartement)
const adminK = () => !!(M && M.ctx);   /* (la course est ouverte à tout le monde) */
const AFFICHE_K = { x: -9.5, z: -18, y: 2.7, l: 3.4 };   // (l'affiche NF Kart, sur le mur du bâtiment de l'horloge, juste à côté des garages des bus)
const presGrille = (x, z) => adminK() && Math.abs(x - AFFICHE_K.x) < AFFICHE_K.l / 2 + .6 && z > AFFICHE_K.z && z < AFFICHE_K.z + 3.2;
// (pendant la course, les voitures garées sur le circuit s'effacent ; elles reviennent après)
function cacherVoitures(on) {
  if (!on) { for (const [attr, copie] of KR.geoCachees || []) { attr.array.set(copie); attr.needsUpdate = true; } KR.geoCachees = null; return; }
  if (!M || !M.scene || !M.L) return; if (KR.geoCachees) cacherVoitures(false);
  /* les voitures garées (et le camion poubelle) sur le tracé disparaissent le temps de la course. Elles sont fondues avec le reste du décor
     dans de grands morceaux : on ne peut pas les cacher une à une ; on enfonce donc sous le sol les points qui sont à l'emplacement exact de ces voitures
     (au-dessus du sol, en dessous de 2,2 m) ; à la fin de la course, on remet tout comme avant */
  const R = [...(M.L.voitures || [])]; try { if (typeof C3 !== "undefined" && C3.camion) R.push(C3.camion); } catch (e) {}
  const surTrace = ([a, b, c, d]) => { const A = KC.A; for (let i = 0; i < A.N; i += 2) { const q = A.pts[i]; if (q.y > 3) continue; const m = A.lar[i] / 2 + .4; if (q.x > a - m && q.x < b + m && q.z > c - m && q.z < d + m) return true; } return false; };
  const Rs = R.filter(surTrace); if (!Rs.length) return; KR.geoCachees = [];
  const dedans = (x, z) => Rs.some(([a, b, c, d]) => x > a - .12 && x < b + .12 && z > c - .12 && z < d + .12);
  const avatars = new Set([...M.gens.values()].map(p => p.g)), v = new THREE.Vector3(), bb = new THREE.Box3();
  const exclus = o => { for (let q = o; q; q = q.parent) if (q === KC.G || q === KR.spectG || avatars.has(q)) return true; return false; };
  M.scene.traverse(o => { if (!o.isMesh || !o.geometry || !o.geometry.attributes.position || o.isSkinnedMesh || o.isInstancedMesh || exclus(o)) return; const g = o.geometry;
    if (!g.boundingBox) g.computeBoundingBox(); bb.copy(g.boundingBox).applyMatrix4(o.matrixWorld); if (bb.min.y > 2.4) return;
    if (!Rs.some(([a, b, c, d]) => bb.max.x > a && bb.min.x < b && bb.max.z > c && bb.min.z < d)) return;
    const pos = g.attributes.position, inv = new THREE.Matrix4().copy(o.matrixWorld).invert(); let copie = null;
    for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld); if (v.y < .08 || v.y > 2.2 || !dedans(v.x, v.z)) continue;
      if (!copie) copie = pos.array.slice(); v.y = -4; v.applyMatrix4(inv); pos.setXYZ(i, v.x, v.y, v.z); }
    if (copie) { pos.needsUpdate = true; KR.geoCachees.push([pos, copie]); } }); }
// (dans la cour d'honneur : le panneau de la grille de départ)
function decorCourse() { if (KR.on && M && M.lieu !== "grande") quitterCourse(); if (!M || M.lieu !== "grande" || (M.L && (M.L.apo || M.L.sh)) || !adminK()) return; if (KC.pan && KC.pan.parent === M.scene) return;
  // l'affiche NF Kart, encadrée, accrochée au mur ; un petit spot au-dessus ; une plaque dessous qui invite à s'approcher
  const A = AFFICHE_K, h = A.l * 768 / 1376, g = new THREE.Group(); g.position.set(A.x, A.y, A.z + .06);
  const t = new THREE.TextureLoader().load("images/karts/titre.jpg"); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  const img = new THREE.Mesh(new THREE.PlaneGeometry(A.l, h), new THREE.MeshBasicMaterial({ map: t, toneMapped: false })); img.position.z = .05; g.add(img);
  const cadreM = new THREE.MeshStandardMaterial({ color: 0x1a1a22, metalness: .4, roughness: .45 }), orM = new THREE.MeshStandardMaterial({ color: 0xe8b830, metalness: .8, roughness: .3 });
  for (const [x, y, w2, h2] of [[0, h / 2 + .06, A.l + .24, .12], [0, -h / 2 - .06, A.l + .24, .12], [-A.l / 2 - .06, 0, .12, h], [A.l / 2 + .06, 0, .12, h]]) { const c = new THREE.Mesh(new THREE.BoxGeometry(w2, h2, .1), cadreM); c.position.set(x, y, .03); g.add(c); const l = new THREE.Mesh(new THREE.BoxGeometry(w2 * (w2 > h2 ? 1 : .3), h2 * (h2 > w2 ? 1 : .3), .02), orM); l.position.set(x, y, .085); g.add(l); }
  const plq = toile(512, 96, x => { x.fillStyle = "#14234a"; x.fillRect(0, 0, 512, 96); x.strokeStyle = "#e8b830"; x.lineWidth = 6; x.strokeRect(3, 3, 506, 90); x.fillStyle = "#ffd23a"; x.font = "900 40px Arial Black,Arial"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("🏁 APPROCHE-TOI POUR JOUER", 256, 50); });
  const plaque = new THREE.Mesh(new THREE.PlaneGeometry(1.9, .36), new THREE.MeshBasicMaterial({ map: tex(plq), toneMapped: false })); plaque.position.set(0, -h / 2 - .45, .05); g.add(plaque);
  const lampe = new THREE.Mesh(new THREE.CylinderGeometry(.06, .14, .22, 12), cadreM); lampe.rotation.x = Math.PI / 2.6; lampe.position.set(0, h / 2 + .32, .35); g.add(lampe);
  const lueur = new THREE.Mesh(new THREE.PlaneGeometry(A.l + 1.2, h + 1.4), new THREE.MeshBasicMaterial({ map: texPoint(), color: 0xffe0a0, transparent: true, opacity: .22, depthWrite: false, blending: THREE.AdditiveBlending })); lueur.position.z = .02; g.add(lueur);
  M.scene.add(g); KC.pan = g; }

KR.KC = KC; KR.capPiste = capPiste; KR.splatK = splatK; KR.ceremonieK = ceremonieK; KR.podiumK = podiumK; KR.cielK = cielK; KR.RC = THREE.Raycaster; KR.majCer = majCeremonie; KR.MUS = MUS;   // (pour les essais)
({ entrerCourse, quitterCourse, majCourse, recuK, presGrille, decorCourse, KR });
