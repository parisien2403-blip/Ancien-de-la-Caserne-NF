/* La Matrice : les anciens se retrouvent dans les cours de la caserne, en 3D, et discutent.
   - trois lieux : l'entrée sur la rue du Faubourg-Poissonnière, la cour d'honneur (par le porche carré)
     et la salle des fêtes (par les portes vitrées du bâtiment de droite)
   - le chef de poste (le père de l'administrateur) s'y promène tout seul
   - chaque ancien a son bonhomme : tenue, couleur et sa tête détourée (faite dans le téléphone)
   - présence et discussion en direct avec le serveur de la caserne (WebSocket)
   Le moteur 3D (three.js) et le détourage (MediaPipe) sont chargés seulement à l'ouverture. */

const THREE_URL = "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
const MP_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs";
const MP_WASM = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";
const MP_MODELE = "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite";

export const LIEUX = {
  rue: { nom: "L'entrée, rue du Faubourg", icone: "🚪" },
  grande: { nom: "La cour d'honneur", icone: "🏛️" },
  fetes: { nom: "La salle des fêtes", icone: "🎉" },
  etage: { nom: "Les étages", icone: "🚪" },
};
export const TENUES = {
  garde: { nom: "Gendarme" }, civil: { nom: "Jean et blouson" }, tshirt: { nom: "T-shirt et jean" }, polo: { nom: "Polo et jean" }, survet: { nom: "Survêtement 80" },
  robe: { nom: "Robe" }, costume: { nom: "Costume" }, barman: { nom: "Chemise et tablier" }, thriller: { nom: "Blouson Thriller" }, zombie: { nom: "Costume déchiré" }, mariee: { nom: "Robe de mariée" }, hernandez: { nom: "Gilet blanc et canne" }, beegees: { nom: "Satin doré (Bee Gees)" }, travolta: { nom: "Costume blanc (Travolta)" }, nemesis: { nom: "Manteau de Nemesis" }, smith: { nom: "Chemise noire (Robert Smith)" },
  batteuse: { nom: "Perfecto noir (la batteuse)" },
  doc: { nom: "Combinaison blanche (Doc)" }, gore: { nom: "Gilet de satin noir (Martin Gore)" }, gahan: { nom: "Gilet pailleté noir (Dave Gahan)" }, fletcher: { nom: "Veste de survêtement noire (Andy Fletcher)" },
  rebecca: { nom: "Gilet blanc (Rebecca, RE)" }, leon: { nom: "Uniforme du R.P.D. (Leon, RE2)" }, barry: { nom: "Gilet rouge (Barry, RE)" }, jill: { nom: "Bustier bleu (Jill, RE3)" }, wesker: { nom: "Tenue S.T.A.R.S. noire (Wesker)" }, chris: { nom: "Gilet vert S.T.A.R.S. (Chris, RE)" }, bassiste: { nom: "Chemise de jean noire (le bassiste)" }, guitariste: { nom: "Costume noir et nœud papillon (le guitariste)" },
};
export const PANTALONS = ["#3d5a80", "#6f8fb5", "#26324e", "#1d1d1f", "#6b6b6b", "#c8b48a", "#5b5f3a", "#e8e4da"];
export const CHAUSSURES = ["#2a2522", "#5a3a22", "#8a5a34", "#f2f2f2", "#6b6b6b", "#6b1e2b", "#1f3a5f"];
export const COULEURS = ["#22324f", "#8a3b22", "#2f6b3a", "#c9a227", "#6b3d7a", "#e8e2d6", "#2a2a2a", "#b2364a"];

/* ---------- outils de dessin ---------- */
const toile = (w, h, dessin) => { const c = document.createElement("canvas"); c.width = w; c.height = h; dessin(c.getContext("2d"), w, h); return c; };
let graine = 7; const alea = () => (graine = (graine * 16807) % 2147483647) / 2147483647;
const assombrir = (hex, k) => { const n = parseInt(hex.slice(1), 16); const f = v => Math.max(0, Math.min(255, Math.round(v * k))); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; };

/* ---------- le bonhomme (dessiné en 2D, posé dans la 3D comme un panneau toujours tourné vers nous) ---------- */
// o.large : marge de 60 px de chaque côté, pour que les bras levés de la danse ne soient pas coupés
export function dessinerBonhomme(o, tete) {
  return toile(o.large ? 320 : 200, 420, (x) => {
    if (o.large) x.translate(60, 0);
    // la corpulence (réglage « l ») : le corps s'élargit autour de son axe ; la tête, elle, garde ses proportions
    const LG = Math.max(.7, Math.min(1.6, (o.reglage && o.reglage.l) || 1));
    x.translate(100, 0); x.scale(LG, 1); x.translate(-100, 0);
    const c = o.couleur || "#22324f", t = o.tenue || "civil", peau = t === "nemesis" ? "#8f7f93" : "#e9c4a0";   // (Nemesis : la peau grise violacée)
    const basDefaut = t === "garde" ? "#26324e" : t === "survet" ? c : t === "costume" ? assombrir(c, .75) : "#3d5a80";
    const bas = t === "robe" || t === "mariee" || t === "nemesis" || t === "jill" ? null : (o.bas || basDefaut), pieds = o.pieds || "#2a2522";
    // le Charleston : accroupi, les mains sur les genoux, qui s'ouvrent (genoux1) puis se croisent (genoux2)
    const accroupi = o.pose === "genoux1" || o.pose === "genoux2", DY = 45;
    const GEN = o.pose === "genoux1" ? [[38, 328], [162, 328]] : [[114, 336], [86, 336]];   // genoux : écartés, puis croisés
    if (accroupi) {
      for (const [hx, [kx, ky], fx] of [[84, GEN[0], 80], [116, GEN[1], 120]]) { x.strokeStyle = bas || peau; x.lineWidth = bas ? 25 : 17; x.lineCap = "round"; x.lineJoin = "round";
        x.beginPath(); x.moveTo(hx, 296); x.lineTo(kx, ky); x.lineTo(fx, 396); x.stroke(); }
    } else if (o.pose === "madison1" || o.pose === "madison3") {
      // le Madison : une jambe tendue sur le côté, la pointe du pied qui tape
      const g = o.pose === "madison1";
      x.strokeStyle = bas || peau; x.lineWidth = bas ? 24 : 16; x.lineCap = "round";
      x.beginPath(); x.moveTo(g ? 84 : 116, bas ? 262 : 336); x.lineTo(g ? 44 : 156, 396); x.stroke();
      x.fillStyle = bas || peau; x.beginPath(); if (bas) x.roundRect(g ? 104 : 72, 250, 24, 150, 10); else x.roundRect(g ? 104 : 80, 330, 16, 70, 7); x.fill();
    } else if (o.pose === "profil" || o.pose === "slow") {
      x.strokeStyle = bas || peau; x.lineWidth = bas ? 26 : 17; x.lineCap = "round"; x.lineJoin = "round";
      x.beginPath(); x.moveTo(108, bas ? 262 : 330); x.lineTo(110, 398); x.stroke();                                 // la jambe d'appui
      x.beginPath(); x.moveTo(94, bas ? 262 : 330);
      if (o.pose === "slow") x.lineTo(92, 398); else { x.lineTo(62, 300); x.lineTo(70, 350); } x.stroke();            // le genou levé devant (Thriller)
    } else if (o.pose === "assis" || o.pose === "boire" || /^batterie/.test(o.pose || "")) {
      // assis sur un tabouret : les cuisses vers l'avant (raccourcies), les jambes qui pendent, les pieds sur le repose-pieds
      x.strokeStyle = bas || peau; x.lineWidth = bas ? 27 : 17; x.lineCap = "round"; x.lineJoin = "round";
      for (const [hx, kx, fx] of [[84, 66, 76], [116, 134, 124]]) { x.beginPath(); x.moveTo(hx, 262); x.lineTo(kx, 284); x.lineTo(fx, 348); x.stroke();
        x.fillStyle = "rgba(255,255,255,.14)"; x.beginPath(); x.ellipse(kx, 284, 13, 10, 0, 0, 7); x.fill(); }   // les genoux, vers nous
    } else if (o.pose === "madison4" || o.pose === "madison5") {
      // genou levé : la cuisse remonte, le pied décolle du sol
      const g = o.pose === "madison4", hx = g ? 84 : 116;
      x.strokeStyle = bas || peau; x.lineWidth = bas ? 24 : 16; x.lineCap = "round"; x.lineJoin = "round";
      x.beginPath(); x.moveTo(hx, bas ? 262 : 330); x.lineTo(g ? 54 : 146, 292); x.lineTo(g ? 70 : 130, 348); x.stroke();
      x.fillStyle = bas || peau; x.beginPath(); if (bas) x.roundRect(g ? 104 : 72, 250, 24, 150, 10); else x.roundRect(g ? 104 : 80, 330, 16, 70, 7); x.fill();
    } else if (bas) { x.fillStyle = bas; x.beginPath(); x.roundRect(72, 250, 24, 150, 10); x.roundRect(104, 250, 24, 150, 10); x.fill();
      if (t === "survet") { x.fillStyle = "#fff"; x.fillRect(78, 252, 4, 144); x.fillRect(118, 252, 4, 144); } }
    else { x.fillStyle = peau; x.beginPath(); x.roundRect(80, 330, 16, 70, 7); x.roundRect(104, 330, 16, 70, 7); x.fill(); }
    const profil = o.pose === "profil" || o.pose === "slow", assis = o.pose === "assis" || o.pose === "boire" || /^batterie/.test(o.pose || "");
    const jambesDroites = !accroupi && !profil && !assis && !/^madison[1345]$/.test(o.pose || "");
    if (jambesDroites && bas && t !== "survet" && t !== "garde" && t !== "costume") { x.fillStyle = "rgba(255,255,255,.18)"; x.fillRect(77, 262, 2, 130); x.fillRect(121, 262, 2, 130); }   // couture du jean
    const PD = o.pose === "slow" ? [86, 104] : profil ? [60, 102] : assis ? [74, 126] : [o.pose === "madison1" ? 46 : o.pose === "madison4" ? 66 : 82, o.pose === "madison3" ? 154 : o.pose === "madison5" ? 134 : 118];
    const PY = o.pose === "slow" ? [404, 404] : profil ? [352, 404] : assis ? [352, 352] : [o.pose === "madison4" ? 352 : 404, o.pose === "madison5" ? 352 : 404];
    if (t === "thriller") { x.fillStyle = "#f4f4f2"; x.fillRect(PD[0] - 9, PY[0] - 14, 18, 9); x.fillRect(PD[1] - 9, PY[1] - 14, 18, 9); }   // les chaussettes blanches
    x.fillStyle = pieds; x.beginPath(); x.ellipse(PD[0], PY[0], 20, 10, o.pose === "madison1" ? -.25 : 0, 0, 7); x.ellipse(PD[1], PY[1], 20, 10, o.pose === "madison3" ? .25 : 0, 0, 7); x.fill();
    if (pieds === "#f2f2f2") { x.fillStyle = "#cfcfcf"; x.fillRect(PD[0] - 20, PY[0] + 4, 40, 3); x.fillRect(PD[1] - 20, PY[1] + 4, 40, 3); }   // semelle des baskets
    const haut = t === "garde" ? "#1c2541" : c;
    if (accroupi) { x.save(); x.translate(0, DY); }
    x.fillStyle = haut; x.beginPath();
    if (t === "nemesis") { x.moveTo(50, 146); x.lineTo(150, 146); x.lineTo(152, 250); x.lineTo(160, 392); x.lineTo(40, 392); x.lineTo(48, 250); }   // le long manteau noir, jusqu'aux bottes
    else if (t === "mariee") { x.moveTo(66, 150); x.lineTo(134, 150); x.lineTo(140, 230); x.lineTo(176, 345); x.lineTo(24, 345); x.lineTo(60, 230); }   // la robe de mariée, longue et évasée
    else if (t === "robe") { x.moveTo(62, 150); x.lineTo(138, 150); x.lineTo(160, 335); x.lineTo(40, 335); } else if (profil) x.roundRect(74, 145, 54, 120, 20); else x.roundRect(58, 145, 84, 120, 22);
    x.fill();
    // le blouson rouge façon Thriller : les bandes noires en V, la ceinture noire
    if (t === "thriller" && !profil && o.pose !== "dos") { x.strokeStyle = "#141414"; x.lineWidth = 7; x.lineCap = "butt";
      x.beginPath(); x.moveTo(64, 150); x.lineTo(98, 238); x.moveTo(136, 150); x.lineTo(102, 238); x.stroke();
      x.lineWidth = 3.5; x.beginPath(); x.moveTo(76, 150); x.lineTo(100, 214); x.lineTo(124, 150); x.stroke();
      x.fillStyle = "#141414"; x.fillRect(58, 248, 84, 10); x.fillStyle = "#9a0c22"; x.fillRect(84, 140, 32, 10); }
    // le zombie : costume gris déchiré, chemise sale, taches rouges, lambeaux
    if (t === "zombie" && !profil) { x.fillStyle = "#c9c4b4"; x.beginPath(); x.moveTo(86, 146); x.lineTo(100, 200); x.lineTo(114, 146); x.fill();
      x.fillStyle = "#6b1e1e"; x.fillRect(96, 152, 8, 44);
      x.fillStyle = "rgba(120,10,10,.75)"; for (const [a, b2, r] of [[80, 200, 9], [118, 176, 7], [94, 236, 11], [126, 228, 6]]) { x.beginPath(); x.arc(a, b2, r, 0, 7); x.fill(); }
      x.fillStyle = "#2a2a2c"; for (const [a, b2] of [[58, 250], [130, 240], [70, 205]]) { x.beginPath(); x.moveTo(a, b2); x.lineTo(a + 10, b2 + 14); x.lineTo(a + 4, b2 + 20); x.lineTo(a - 4, b2 + 8); x.closePath(); x.fill(); }
      x.strokeStyle = "rgba(255,255,255,.18)"; x.lineWidth = 2; for (let k = 0; k < 6; k++) { x.beginPath(); x.moveTo(60 + k * 14, 262); x.lineTo(64 + k * 14, 272); x.stroke(); } }
    // la mariée : dentelle, ceinture satin, bouquet ; la robe un peu salie (c'est une mariée zombie)
    if (t === "mariee" && !profil) { x.strokeStyle = "rgba(200,190,170,.7)"; x.lineWidth = 1.5; for (let y = 160; y < 225; y += 9) { x.beginPath(); x.moveTo(70, y); for (let X = 70; X < 132; X += 6) x.lineTo(X + 3, y + (X % 12 ? 3 : -3)); x.stroke(); }
      x.fillStyle = "#e9dfcf"; x.fillRect(62, 226, 76, 8);
      x.strokeStyle = "rgba(160,150,130,.6)"; for (let k = 0; k < 7; k++) { x.beginPath(); x.moveTo(60 + k * 14, 250); x.lineTo(40 + k * 20, 340); x.stroke(); }
      x.fillStyle = "rgba(110,20,20,.55)"; for (const [a, b2, r] of [[84, 290, 8], [128, 310, 6], [70, 330, 5]]) { x.beginPath(); x.arc(a, b2, r, 0, 7); x.fill(); } }
    // Nemesis : le manteau enroulé de sangles noires, les rubans jaunes « CAUTION », le gros tube sur la poitrine, la ceinture nouée
    if (t === "nemesis" && o.pose !== "dos") {
      x.strokeStyle = "rgba(255,255,255,.07)"; x.lineWidth = 3; for (let y = 150; y < 250; y += 9) { x.beginPath(); x.moveTo(52, y); x.quadraticCurveTo(100, y + 6, 148, y - 2); x.stroke(); }
      x.strokeStyle = "rgba(0,0,0,.35)"; x.lineWidth = 2; for (let k = 0; k < 7; k++) { x.beginPath(); x.moveTo(56 + k * 15, 262); x.lineTo(50 + k * 17, 378); x.stroke(); }
      x.fillStyle = "#0e0e10"; x.fillRect(48, 238, 104, 18);
      if (!profil) { x.fillStyle = "#4a5050"; x.beginPath(); x.roundRect(100, 160, 32, 34, 6); x.fill(); x.strokeStyle = "#a01818"; x.lineWidth = 2.5; x.beginPath(); x.moveTo(126, 162); x.quadraticCurveTo(142, 150, 128, 140); x.stroke(); }
      x.fillStyle = "#d8c23a"; for (const [a, b2, r] of [[66, 172, -.3], [128, 150, .4], [80, 214, .2], [140, 204, -.5], [60, 300, .1]]) { x.save(); x.translate(a, b2); x.rotate(r); x.fillRect(-11, -3, 22, 6); x.restore(); } }
    // le groupe de la scène : la batteuse (perfecto noir ouvert sur un t-shirt noir, fermetures éclair argentées),
    // le bassiste (chemise noire délavée ouverte, boutons-pression, t-shirt noir), le guitariste (costume noir, chemise blanche, nœud papillon)
    if (t === "batteuse" && o.pose !== "dos" && !profil) {
      x.fillStyle = "#0a0a0b"; x.beginPath(); x.moveTo(86, 146); x.lineTo(114, 146); x.lineTo(116, 256); x.lineTo(84, 256); x.closePath(); x.fill();   // le t-shirt
      x.fillStyle = "#1c1c20"; x.beginPath(); x.moveTo(84, 144); x.lineTo(62, 158); x.lineTo(80, 200); x.lineTo(90, 160); x.closePath(); x.moveTo(116, 144); x.lineTo(138, 158); x.lineTo(120, 200); x.lineTo(110, 160); x.closePath(); x.fill();   // les revers
      x.strokeStyle = "#b9bcc2"; x.lineWidth = 1.6; x.beginPath(); x.moveTo(82, 170); x.lineTo(80, 256); x.moveTo(118, 170); x.lineTo(120, 256); x.moveTo(60, 200); x.lineTo(76, 226); x.stroke();   // les fermetures éclair
      x.strokeStyle = "rgba(255,255,255,.16)"; x.lineWidth = 3; x.beginPath(); x.moveTo(66, 176); x.lineTo(70, 240); x.moveTo(132, 176); x.lineTo(128, 240); x.stroke(); }   // le reflet du cuir
    if (t === "bassiste" && o.pose !== "dos" && !profil) {
      x.fillStyle = "#0b0b0c"; x.beginPath(); x.moveTo(88, 146); x.lineTo(112, 146); x.lineTo(114, 260); x.lineTo(86, 260); x.closePath(); x.fill();   // le t-shirt
      x.fillStyle = "rgba(255,255,255,.07)"; for (const [a, b2] of [[60, 180], [114, 182], [64, 230], [120, 226]]) x.fillRect(a, b2, 22, 30);   // le tissu délavé
      x.fillStyle = "#26282b"; x.fillRect(62, 176, 22, 8); x.fillRect(116, 176, 22, 8);   // les rabats des poches
      x.fillStyle = "#c9ccd0"; for (let k = 0; k < 5; k++) { x.beginPath(); x.arc(84, 170 + k * 20, 2.2, 0, 7); x.fill(); } for (const px of [73, 127]) { x.beginPath(); x.arc(px, 180, 2, 0, 7); x.fill(); } }
    if (t === "guitariste" && o.pose !== "dos" && !profil) {
      x.fillStyle = "#f4f4f2"; x.beginPath(); x.moveTo(86, 146); x.lineTo(114, 146); x.lineTo(104, 236); x.lineTo(96, 236); x.closePath(); x.fill();   // la chemise blanche
      x.fillStyle = "#0b0b0c"; x.beginPath(); x.moveTo(100, 152); x.lineTo(86, 145); x.lineTo(86, 161); x.closePath(); x.moveTo(100, 152); x.lineTo(114, 145); x.lineTo(114, 161); x.closePath(); x.fill();   // le nœud papillon
      x.beginPath(); x.arc(100, 153, 3.5, 0, 7); x.fill();
      x.strokeStyle = "rgba(255,255,255,.1)"; x.lineWidth = 2; x.beginPath(); x.moveTo(84, 150); x.lineTo(74, 196); x.lineTo(96, 236); x.moveTo(116, 150); x.lineTo(126, 196); x.lineTo(104, 236); x.stroke();   // les revers
      x.fillStyle = "#2a2a2e"; for (let k = 0; k < 2; k++) { x.beginPath(); x.arc(100, 244 + k * 12, 2.6, 0, 7); x.fill(); }
      x.fillStyle = "#7a3a2a"; x.fillRect(122, 214, 18, 3); x.fillRect(122, 222, 18, 3); }   // les liserés des poches
    // Doc : la combinaison blanche antiradiation, fermeture éclair, le dosimètre, la ceinture à outils, les bandes rouges aux chevilles
    if (t === "doc" && o.pose !== "dos" && !profil) {
      x.fillStyle = "#e9d27a"; x.beginPath(); x.moveTo(88, 146); x.lineTo(112, 146); x.lineTo(100, 168); x.closePath(); x.fill();
      x.strokeStyle = "rgba(0,0,0,.18)"; x.lineWidth = 2; x.beginPath(); x.moveTo(100, 160); x.lineTo(100, 262); x.stroke();
      for (const [a, b2, c2, d2] of [[70, 170, 82, 220], [128, 172, 120, 226], [66, 300, 76, 330], [130, 300, 122, 336]]) { x.beginPath(); x.moveTo(a, b2); x.lineTo(c2, d2); x.stroke(); }   // les plis
      x.fillStyle = "#222"; x.fillRect(114, 168, 14, 20); x.fillStyle = "#e9c84a"; x.fillRect(116, 171, 10, 6); x.fillStyle = "#c81818"; x.fillRect(116, 179, 10, 4);   // le dosimètre
      x.strokeStyle = "#111"; x.lineWidth = 2; x.beginPath(); x.moveTo(84, 148); x.lineTo(78, 214); x.stroke();
      x.fillStyle = "#4a2e18"; x.fillRect(58, 244, 84, 11); x.fillStyle = "#6e4424"; for (const [a, w] of [[58, 18], [80, 14], [122, 20]]) x.fillRect(a, 252, w, 26); x.fillStyle = "#c9c9c9"; x.fillRect(84, 256, 3, 14); x.fillRect(128, 256, 3, 16);
      if (jambesDroites) { x.fillStyle = "#d8401c"; x.fillRect(72, 372, 24, 12); x.fillRect(104, 372, 24, 12); } }
    // Depeche Mode : Martin Gore (gilet de satin noir surpiqué, colliers, pantalon rayé), Dave Gahan (gilet pailleté au col profond, croix au cou),
    // Andy Fletcher (veste de survêtement noire à bandes blanches, zippée sur un t-shirt noir)
    if (t === "gore" && o.pose !== "dos" && !profil) {
      x.fillStyle = peau; x.beginPath(); x.moveTo(84, 146); x.lineTo(116, 146); x.lineTo(100, 186); x.closePath(); x.fill();
      x.strokeStyle = "rgba(255,255,255,.22)"; x.lineWidth = 1.5; for (const a of [70, 80, 120, 130]) { x.beginPath(); x.moveTo(a, 152); x.quadraticCurveTo(a + (a < 100 ? 10 : -10), 200, a, 258); x.stroke(); }
      x.fillStyle = "#3a3a3e"; for (let k = 0; k < 4; k++) { x.beginPath(); x.arc(100, 196 + k * 16, 2.4, 0, 7); x.fill(); }
      x.strokeStyle = "#d6d8dc"; x.lineWidth = 2.2; for (const r of [10, 14]) { x.beginPath(); x.arc(100, 140, r, .35, Math.PI - .35); x.stroke(); }
      if (jambesDroites) { x.strokeStyle = "rgba(220,220,220,.35)"; x.lineWidth = 1.2; for (let k = 0; k < 6; k++) { x.beginPath(); x.moveTo(75 + k * 4, 262); x.lineTo(75 + k * 4, 396); x.moveTo(107 + k * 4, 262); x.lineTo(107 + k * 4, 396); x.stroke(); } } }
    if (t === "gahan" && o.pose !== "dos" && !profil) {
      x.fillStyle = peau; x.beginPath(); x.moveTo(82, 146); x.lineTo(118, 146); x.lineTo(100, 222); x.closePath(); x.fill();
      x.fillStyle = "rgba(255,255,255,.55)"; for (let k = 0; k < 70; k++) { const a = 60 + (k * 37 % 80), b2 = 150 + (k * 53 % 110); if (Math.abs(a - 100) < (222 - b2) * .24 && b2 < 222) continue; x.fillRect(a, b2, 1.6, 1.6); }
      x.strokeStyle = "#bfc3c8"; x.lineWidth = 1.4; x.beginPath(); x.moveTo(90, 148); x.lineTo(100, 196); x.lineTo(110, 148); x.stroke(); x.fillStyle = "#bfc3c8"; x.fillRect(98.5, 194, 3, 14); x.fillRect(95, 198, 10, 3);   // la croix
      x.fillStyle = "#2a2a2e"; for (let k = 0; k < 3; k++) { x.beginPath(); x.arc(100, 230 + k * 10, 2.3, 0, 7); x.fill(); } }
    if (t === "fletcher" && o.pose !== "dos" && !profil) {
      x.fillStyle = "#0a0a0b"; x.beginPath(); x.moveTo(88, 150); x.lineTo(112, 150); x.lineTo(110, 262); x.lineTo(90, 262); x.closePath(); x.fill();
      x.strokeStyle = "#8a8d92"; x.lineWidth = 1.5; x.beginPath(); x.moveTo(88, 152); x.lineTo(90, 262); x.moveTo(112, 152); x.lineTo(110, 262); x.stroke();
      x.fillStyle = "#1c1c1f"; x.fillRect(80, 142, 40, 9); x.fillStyle = "#e9e9e9"; x.fillRect(58, 150, 4, 100); x.fillRect(138, 150, 4, 100); }
    // les héros de Resident Evil
    if (o.pose !== "dos" && !profil && /^(rebecca|leon|barry|jill|wesker|chris)$/.test(t)) {
      const ceinture = (col, y = 246) => { x.fillStyle = col; x.fillRect(58, y, 84, 11); x.fillStyle = "#9a9ea4"; x.fillRect(95, y + 2, 10, 7); };
      const poche = (a, b2, w, h, col) => { x.fillStyle = col; x.fillRect(a, b2, w, h); x.fillStyle = "rgba(0,0,0,.25)"; x.fillRect(a, b2, w, 3); };
      if (t === "rebecca") {   // le gilet tactique blanc sur un haut gris à manches longues, le t-shirt bordeaux qui dépasse ; pantalon cargo kaki retroussé
        x.fillStyle = "#7a2a2a"; x.beginPath(); x.ellipse(100, 150, 18, 7, 0, 0, 7); x.fill();
        x.fillStyle = "#e9e6dd"; x.beginPath(); x.moveTo(64, 150); x.lineTo(84, 150); x.quadraticCurveTo(100, 170, 116, 150); x.lineTo(136, 150); x.lineTo(140, 258); x.lineTo(60, 258); x.closePath(); x.fill();
        x.fillStyle = "#1c1c1c"; x.fillRect(66, 146, 9, 36); x.fillRect(125, 146, 9, 36); for (const [a, b2] of [[60, 206], [130, 206], [70, 240], [94, 240], [118, 240]]) x.fillRect(a, b2, 12, 14);
        x.strokeStyle = "rgba(0,0,0,.18)"; x.lineWidth = 2; x.beginPath(); x.moveTo(100, 172); x.lineTo(100, 256); x.stroke(); poche(126, 252, 18, 22, "#e9e6dd");
        x.fillStyle = "#2a2c26"; x.fillRect(68, 300, 26, 22); x.fillRect(106, 300, 26, 22); }   // les poches cargo
      if (t === "leon") {   // l'uniforme bleu du R.P.D., le gilet pare-balles noir à rivets, la bandoulière en cuir, le ceinturon et l'étui de cuisse
        x.fillStyle = "#151517"; x.beginPath(); x.roundRect(62, 152, 76, 92, 10); x.fill();
        x.fillStyle = "#c9ccd0"; for (const [a, b2] of [[70, 160], [130, 160], [70, 236], [130, 236], [100, 236]]) { x.beginPath(); x.arc(a, b2, 2.4, 0, 7); x.fill(); }
        x.fillStyle = "#2e3b57"; x.fillRect(92, 146, 16, 12);
        x.strokeStyle = "#6e4a2a"; x.lineWidth = 9; x.beginPath(); x.moveTo(126, 148); x.lineTo(84, 250); x.stroke();
        ceinture("#1a1a1c"); x.fillStyle = "#101012"; x.fillRect(60, 256, 14, 18); x.fillRect(126, 256, 14, 18); x.fillRect(66, 286, 22, 40); x.fillStyle = "#2a2a2c"; x.fillRect(62, 296, 30, 6); x.fillRect(62, 314, 30, 6); }
      if (t === "barry") {   // le gilet rouge à poches, la bandoulière et l'étui en cuir, le ceinturon brun ; t-shirt gris-vert, pantalon cargo gris
        x.fillStyle = "#8e2a24"; x.beginPath(); x.roundRect(60, 148, 80, 104, 14); x.fill();
        x.strokeStyle = "rgba(0,0,0,.25)"; x.lineWidth = 2; x.beginPath(); x.moveTo(100, 150); x.lineTo(100, 250); x.stroke();
        for (const [a, b2] of [[66, 176], [112, 176], [66, 214], [112, 214]]) poche(a, b2, 22, 22, "#7a221d");
        x.strokeStyle = "#5a3a1e"; x.lineWidth = 8; x.beginPath(); x.moveTo(72, 148); x.lineTo(132, 224); x.stroke(); x.fillStyle = "#5a3a1e"; x.fillRect(122, 196, 18, 30);
        ceinture("#5a3a1e"); x.fillStyle = "#4a4a44"; x.fillRect(68, 300, 26, 24); x.fillRect(106, 300, 26, 24); }
      if (t === "jill") {   // le bustier bleu, les bretelles du sac, le ceinturon et sa pochette, le pull blanc noué à la taille, la mini-jupe noire, les bottes
        x.fillStyle = peau; x.beginPath(); x.moveTo(60, 146); x.lineTo(140, 146); x.lineTo(138, 172); x.lineTo(62, 172); x.closePath(); x.fill();
        x.fillStyle = "#5a3a22"; x.fillRect(66, 146, 8, 30); x.fillRect(126, 146, 8, 30);
        ceinture("#5a3a22", 238); x.fillStyle = "#1e1e20"; x.fillRect(118, 240, 14, 22);
        x.fillStyle = "#1b1d22"; x.beginPath(); x.moveTo(62, 250); x.lineTo(138, 250); x.lineTo(146, 312); x.lineTo(54, 312); x.closePath(); x.fill();
        x.fillStyle = "#f2f0ea"; x.beginPath(); x.moveTo(56, 246); x.quadraticCurveTo(100, 262, 144, 246); x.lineTo(146, 266); x.quadraticCurveTo(100, 280, 54, 266); x.closePath(); x.fill();
        x.beginPath(); x.ellipse(100, 268, 12, 10, 0, 0, 7); x.fill(); x.beginPath(); x.moveTo(92, 272); x.lineTo(84, 316); x.lineTo(98, 316); x.lineTo(102, 274); x.moveTo(106, 272); x.lineTo(116, 312); x.lineTo(104, 314); x.closePath(); x.fill();
        x.strokeStyle = "rgba(0,0,0,.12)"; x.lineWidth = 1.5; x.beginPath(); x.moveTo(84, 306); x.lineTo(98, 306); x.stroke();
        if (!assis && !accroupi) { x.fillStyle = "#151515"; x.fillRect(79, 342, 18, 56); x.fillRect(103, 342, 18, 56); } }   // les bottes
      if (t === "wesker") {   // chemise bleu nuit à manches courtes, gilet tactique noir à poches, radio, ceinturon, étui de cuisse ; tout en noir dessous
        x.fillStyle = "#121315"; x.beginPath(); x.roundRect(60, 150, 80, 96, 10); x.fill();
        for (const [a, b2] of [[66, 196], [86, 196], [104, 196], [122, 196]]) poche(a, b2, 14, 30, "#1c1d20");
        x.fillStyle = "#2a2b2e"; x.fillRect(70, 158, 12, 22); x.fillStyle = "#555"; x.fillRect(74, 150, 3, 10);   // la radio
        ceinture("#0d0d0f"); x.fillStyle = "#0a0a0b"; x.fillRect(122, 262, 16, 46); }
      if (t === "chris") {   // le gilet vert S.T.A.R.S. à poches sur un t-shirt gris, ceinturon noir, genouillères, pantalon cargo
        x.fillStyle = "#4f5e3c"; x.beginPath(); x.roundRect(60, 148, 80, 104, 12); x.fill();
        x.strokeStyle = "rgba(0,0,0,.3)"; x.lineWidth = 2; x.beginPath(); x.moveTo(100, 150); x.lineTo(100, 250); x.stroke();
        for (const [a, b2] of [[66, 180], [112, 180], [66, 218], [112, 218]]) poche(a, b2, 22, 22, "#435032");
        x.fillStyle = "#c4c4ba"; x.fillRect(90, 146, 20, 10);
        ceinture("#151517");
        if (!assis && !accroupi) { x.fillStyle = "#141414"; x.beginPath(); x.ellipse(84, 318, 13, 11, 0, 0, 7); x.ellipse(116, 318, 13, 11, 0, 0, 7); x.fill(); x.fillStyle = "#3e3d36"; x.fillRect(68, 290, 24, 20); } }
    }
    // Robert Smith : une grande chemise noire froissée, ouverte, qui tombe sur les hanches ; un t-shirt noir dessous ; les colliers
    if (t === "smith" && o.pose !== "dos" && !profil) {
      x.fillStyle = "#101010"; x.beginPath(); x.moveTo(56, 236); x.lineTo(144, 236); x.lineTo(150, 296); x.lineTo(50, 296); x.closePath(); x.fill();   // le bas de la chemise, sur les hanches
      x.fillStyle = "#1e1e1e"; x.beginPath(); x.moveTo(90, 146); x.lineTo(110, 146); x.lineTo(108, 296); x.lineTo(92, 296); x.closePath(); x.fill();
      x.strokeStyle = "rgba(255,255,255,.08)"; x.lineWidth = 2; for (const [a, b2, c2, d2] of [[66, 170, 80, 230], [124, 168, 132, 240], [70, 250, 60, 290], [130, 252, 140, 288]]) { x.beginPath(); x.moveTo(a, b2); x.lineTo(c2, d2); x.stroke(); }   // les plis
      x.fillStyle = "#5a5a5a"; for (let k = 0; k < 6; k++) { x.beginPath(); x.arc(86, 166 + k * 22, 1.8, 0, 7); x.fill(); }
      x.fillStyle = "#0c0c0c"; x.beginPath(); x.moveTo(84, 144); x.lineTo(70, 152); x.lineTo(84, 176); x.closePath(); x.moveTo(116, 144); x.lineTo(130, 152); x.lineTo(116, 176); x.closePath(); x.fill();
      x.strokeStyle = "#7a5a3a"; x.lineWidth = 2; x.beginPath(); x.moveTo(90, 148); x.quadraticCurveTo(100, 172, 110, 148); x.stroke();
      x.strokeStyle = "#b8a890"; x.beginPath(); x.moveTo(88, 148); x.quadraticCurveTo(100, 182, 112, 148); x.stroke(); }
    // John Travolta (Saturday Night Fever) : costume trois pièces blanc, la veste ouverte, le gilet boutonné,
    // la chemise noire au grand col posé sur les revers, ouverte sur la poitrine, la chaîne en or ; le pantalon blanc à pattes d'éléphant
    if (t === "travolta" && o.pose !== "dos") {
      if (!profil && !accroupi && !assis && !/^madison[1345]$/.test(o.pose || "")) { x.fillStyle = c;
        for (const [a, b2] of [[72, 96], [104, 128]]) { x.beginPath(); x.moveTo(a, 340); x.lineTo(b2, 340); x.lineTo(b2 + 6, 396); x.lineTo(a - 6, 396); x.closePath(); x.fill(); }   // les pattes d'éléphant
        x.strokeStyle = "rgba(0,0,0,.1)"; x.lineWidth = 2; x.beginPath(); x.moveTo(84, 262); x.lineTo(82, 396); x.moveTo(116, 262); x.lineTo(118, 396); x.stroke(); }   // le pli du pantalon
      if (!profil) {
        x.fillStyle = "#1c1616"; x.beginPath(); x.moveTo(84, 146); x.lineTo(116, 146); x.lineTo(104, 214); x.lineTo(96, 214); x.closePath(); x.fill();   // la chemise noire
        x.fillStyle = peau; x.beginPath(); x.moveTo(91, 146); x.lineTo(109, 146); x.lineTo(100, 176); x.closePath(); x.fill();   // ouverte sur la poitrine
        x.strokeStyle = "#e3c04a"; x.lineWidth = 2; x.beginPath(); x.moveTo(92, 148); x.quadraticCurveTo(100, 168, 108, 148); x.stroke();
        x.fillStyle = "#e3c04a"; x.beginPath(); x.arc(100, 163, 2.6, 0, 7); x.fill();   // la chaîne
        x.fillStyle = "#1c1616"; x.beginPath(); x.moveTo(86, 144); x.lineTo(60, 156); x.lineTo(76, 180); x.lineTo(92, 154); x.closePath(); x.moveTo(114, 144); x.lineTo(140, 156); x.lineTo(124, 180); x.lineTo(108, 154); x.closePath(); x.fill();   // le grand col sur les revers
        x.strokeStyle = "rgba(0,0,0,.16)"; x.lineWidth = 2.5; x.beginPath(); x.moveTo(76, 180); x.lineTo(86, 262); x.moveTo(124, 180); x.lineTo(114, 262); x.stroke();   // la veste ouverte
        x.beginPath(); x.moveTo(88, 182); x.lineTo(100, 220); x.lineTo(112, 182); x.stroke();   // le gilet
        x.fillStyle = "#e2ddd0"; for (let k = 0; k < 3; k++) { x.beginPath(); x.arc(100, 228 + k * 11, 2.6, 0, 7); x.fill(); }
        x.strokeStyle = "rgba(0,0,0,.12)"; x.lineWidth = 2; x.beginPath(); x.moveTo(64, 236); x.lineTo(80, 238); x.moveTo(120, 238); x.lineTo(136, 236); x.stroke(); }   // les poches
      else { x.fillStyle = "#1c1616"; x.beginPath(); x.moveTo(110, 146); x.lineTo(128, 150); x.lineTo(116, 176); x.closePath(); x.fill(); } }
    // les Bee Gees : blouson en satin doré, ouvert sur la poitrine velue, col, poignets et ceinture en côtes kaki, pressions dorées ; pantalon de satin doré
    if (t === "beegees" && o.pose !== "dos") {
      x.fillStyle = "rgba(255,255,255,.22)"; for (const [a, l] of profil ? [[86, 8], [104, 5]] : [[66, 8], [80, 4], [122, 7], [134, 4]]) x.fillRect(a, 152, l, 96);   // les reflets du satin
      if (!profil) { x.fillStyle = peau; x.beginPath(); x.moveTo(86, 146); x.lineTo(114, 146); x.lineTo(110, 250); x.lineTo(90, 250); x.closePath(); x.fill();   // la poitrine, le blouson ouvert
        const ha = k => { const v = Math.sin(k * 12.9898) * 43758.5453; return v - Math.floor(v); };
        x.strokeStyle = "rgba(60,36,20,.5)"; x.lineWidth = 1.3; for (let k = 0; k < 70; k++) { const hy = 154 + ha(k) * 92, hx = 100 + (ha(k + 99) - .5) * (24 - (hy - 150) * .08); x.beginPath(); x.moveTo(hx, hy); x.lineTo(hx + (ha(k + 7) - .5) * 5, hy + 3 + ha(k + 3) * 3); x.stroke(); }   // les poils
        x.strokeStyle = "#e8d48a"; x.lineWidth = 2; x.beginPath(); x.moveTo(90, 148); x.quadraticCurveTo(100, 166, 110, 148); x.stroke();   // la chaîne
        x.fillStyle = "#7d6d34"; x.beginPath(); x.moveTo(80, 142); x.lineTo(90, 146); x.lineTo(88, 170); x.lineTo(78, 160); x.closePath(); x.moveTo(120, 142); x.lineTo(110, 146); x.lineTo(112, 170); x.lineTo(122, 160); x.closePath(); x.fill();   // le col en côtes
        x.fillStyle = "#f3e2a0"; for (let k = 0; k < 6; k++) { x.beginPath(); x.arc(84, 172 + k * 14, 2.2, 0, 7); x.arc(116, 172 + k * 14, 2.2, 0, 7); x.fill(); }   // les pressions
        x.strokeStyle = "rgba(0,0,0,.12)"; x.lineWidth = 2; x.beginPath(); x.moveTo(86, 146); x.lineTo(90, 250); x.moveTo(114, 146); x.lineTo(110, 250); x.stroke(); }
      if (!accroupi && !assis && !/^madison[1345]$/.test(o.pose || "") && !profil) { x.fillStyle = "rgba(255,255,255,.2)"; x.fillRect(76, 264, 5, 128); x.fillRect(108, 264, 5, 128); }   // le satin du pantalon
      x.fillStyle = "#7d6d34"; if (profil) x.fillRect(74, 250, 54, 12); else { x.fillRect(58, 250, 32, 12); x.fillRect(110, 250, 32, 12); }   // la ceinture en côtes
      x.fillStyle = "rgba(0,0,0,.15)"; for (let a = profil ? 76 : 60; a < (profil ? 128 : 142); a += 5) x.fillRect(a, 250, 1.5, 12); }
    // Mr Hernandez : chemise noire au col ouvert sur la poitrine, chaîne en or, gilet blanc boutonné à pointes
    if (t === "hernandez" && o.pose !== "dos") {
      if (profil) { x.fillStyle = "#f3f1ea"; x.beginPath(); x.roundRect(80, 150, 40, 108, 8); x.fill(); }
      else { x.fillStyle = "#f3f1ea"; x.beginPath(); x.moveTo(66, 150); x.lineTo(84, 147); x.lineTo(100, 206); x.lineTo(116, 147); x.lineTo(134, 150); x.lineTo(140, 262); x.lineTo(119, 278); x.lineTo(100, 264); x.lineTo(81, 278); x.lineTo(60, 262); x.closePath(); x.fill();
        x.fillStyle = peau; x.beginPath(); x.moveTo(90, 146); x.lineTo(100, 178); x.lineTo(110, 146); x.fill();   // la poitrine, chemise ouverte
        x.fillStyle = c; x.beginPath(); x.moveTo(84, 146); x.lineTo(74, 168); x.lineTo(92, 158); x.closePath(); x.moveTo(116, 146); x.lineTo(126, 168); x.lineTo(108, 158); x.closePath(); x.fill();   // le grand col
        x.strokeStyle = "#d9b13b"; x.lineWidth = 2; x.beginPath(); x.moveTo(91, 148); x.quadraticCurveTo(100, 172, 109, 148); x.stroke();
        x.fillStyle = "#e3c04a"; x.beginPath(); x.ellipse(100, 166, 3.5, 5, 0, 0, 7); x.fill();   // la chaîne et le pendentif
        x.strokeStyle = "rgba(0,0,0,.18)"; x.lineWidth = 2; x.beginPath(); x.moveTo(72, 236); x.lineTo(90, 234); x.moveTo(110, 234); x.lineTo(128, 236); x.stroke();   // les poches
        x.fillStyle = "#dcd6c4"; for (let k = 0; k < 5; k++) { x.beginPath(); x.arc(102, 214 + k * 11, 2.8, 0, 7); x.fill(); } } }
    // le barman : le grand tablier bleu, noué à la taille, qui descend sous les genoux (et ses bretelles)
    if (t === "barman" && !profil && o.pose !== "dos") { x.fillStyle = "#2f5276"; x.beginPath(); x.roundRect(72, 158, 56, 60, 6); x.fill();
      x.beginPath(); x.moveTo(60, 214); x.lineTo(140, 214); x.lineTo(146, 318); x.lineTo(54, 318); x.closePath(); x.fill();
      x.strokeStyle = "#2f5276"; x.lineWidth = 5; x.beginPath(); x.moveTo(76, 160); x.lineTo(84, 142); x.moveTo(124, 160); x.lineTo(116, 142); x.stroke();
      x.fillStyle = "rgba(0,0,0,.15)"; x.fillRect(60, 212, 80, 4); x.fillStyle = "rgba(255,255,255,.06)"; for (let k = 0; k < 4; k++) x.fillRect(70 + k * 18, 222, 3, 90); }
    // les bras : pendants, ou levés pour danser (o.pose = "haut") ; en disco, le bras droit pointe le doigt en l'air puis vers le sol
    const DISCO = { disco1: [.42, -2.8], disco2: [.75, -.36] };
    const mains = [];
    const bras = (cx, sens) => {
      // la main sur la hanche, le coude sorti (Mr Hernandez, comme sur la photo)
      if (sens < 0 && !profil && (o.pose === "canne1" || o.pose === "canne3")) { x.strokeStyle = t === "tshirt" || t === "polo" ? peau : (t === "garde" ? "#1c2541" : c); x.lineWidth = 24; x.lineCap = "round"; x.lineJoin = "round";
        x.beginPath(); x.moveTo(cx, 160); x.lineTo(cx + 36, 208); x.lineTo(cx - 8, 246); x.stroke(); x.fillStyle = peau; x.beginPath(); x.arc(cx - 10, 248, 11, 0, 7); x.fill(); mains[1] = [cx - 10, 248]; return; }
      const disco = DISCO[o.pose], doigt = disco && sens < 0;
      // accroupi : chaque main va sur un genou (sur le genou opposé quand ils se croisent)
      // au Madison : on frappe dans les mains (madison2), ou les bras se balancent
      const cible = accroupi ? [(sens > 0 ? GEN[0] : GEN[1])[0], (sens > 0 ? GEN[0] : GEN[1])[1] - DY - 4] : o.pose === "madison2" ? [sens > 0 ? 95 : 105, 228]
        : o.pose === "madison4" ? [sens > 0 ? 46 : 62, 312] : o.pose === "madison5" ? [sens > 0 ? 138 : 154, 312]
        // le DJ : les deux mains sur les platines (mix1), une main au casque (mix2), le poing levé (mix3)
        // Thriller : les deux bras pliés en griffes de zombie, d'un côté puis de l'autre
        : o.pose === "thriller1" ? (sens > 0 ? [12, 176] : [70, 150]) : o.pose === "thriller2" ? (sens > 0 ? [130, 150] : [188, 176])
        : o.pose === "thriller3" ? (sens > 0 ? [22, 96] : [178, 96])
        // Mr Hernandez et sa canne : levée derrière la tête (canne1), tenue à deux mains au-dessus de la tête (canne2), pointée au loin (canne3), plantée au sol (canne4)
        : o.pose === "canne1" ? (sens > 0 ? [62, 36] : null) : o.pose === "canne2" ? (sens > 0 ? [36, 64] : [164, 64]) : o.pose === "canne3" ? (sens > 0 ? [-34, 112] : null)
        : o.pose === "canne4" ? (sens > 0 ? [24, 232] : [170, 46])
        : o.pose === "guitare1" || o.pose === "guitare2" ? (sens > 0 ? [36, 192] : (o.pose === "guitare1" ? [118, 232] : [124, 250]))   // la main gauche sur le manche, la droite qui gratte
        // la batteuse : une baguette qui frappe la caisse claire pendant que l'autre remonte (batterie1, batterie2), les deux sur les cymbales (batterie3), au repos sur la caisse (batterie0)
        // Dave Gahan chante : le micro à la bouche (chant1), l'autre bras levé (chant2) ; Andy Fletcher aux claviers : les deux mains sur les touches
        : o.pose === "chant1" ? (sens > 0 ? [36, 238] : [134, 174]) : o.pose === "chant2" ? (sens > 0 ? [-14, 64] : [134, 174])
        : o.pose === "clavier1" ? (sens > 0 ? [66, 228] : [130, 234]) : o.pose === "clavier2" ? (sens > 0 ? [74, 234] : [138, 226])
        : o.pose === "batterie1" ? (sens > 0 ? [72, 232] : [170, 112]) : o.pose === "batterie2" ? (sens > 0 ? [30, 112] : [128, 232])
        : o.pose === "batterie3" ? (sens > 0 ? [4, 150] : [196, 150]) : o.pose === "batterie0" ? (sens > 0 ? [80, 238] : [120, 238])
        : o.pose === "tir" && sens < 0 ? [214, 152]   // il tire : le bras droit tendu devant lui, à l'horizontale
        : o.pose === "slow" ? (sens > 0 ? [36, 168] : [44, 158])   // le slow : les bras sur les épaules de l'autre
        : profil ? (sens > 0 ? [26, 190] : [34, 172])   // de profil : les deux bras tendus devant, griffes en avant
        : assis ? (sens > 0 ? [74, 268] : o.pose === "boire" ? [104, 152] : [130, 214])   // une main sur la cuisse, l'autre tient le verre (ou le porte à la bouche)
        // le barman : il pose un verre (servir), il range un verre sur l'étagère (ranger), il essuie un verre avec son torchon (essuyer)
        : o.pose === "servir" ? (sens > 0 ? [46, 252] : [182, 214]) : o.pose === "ranger" ? (sens > 0 ? [46, 252] : [168, 70]) : o.pose === "essuyer" ? (sens > 0 ? [92, 226] : [110, 222])
        : o.pose === "mix1" ? [sens > 0 ? 66 : 134, 246] : o.pose === "mix2" ? (sens > 0 ? [74, 116] : [134, 246]) : o.pose === "mix3" && sens > 0 ? [62, 248] : null;
      const a = cible ? Math.atan2(-(cible[0] - cx), cible[1] - 158) : disco ? disco[sens > 0 ? 0 : 1] : o.pose === "haut" ? sens * 2.55 : o.pose === "mi" ? sens * 1.1
        : o.pose === "mix3" ? -2.85 : o.pose === "madison1" ? (sens > 0 ? .55 : -.25) : o.pose === "madison3" ? (sens > 0 ? .25 : -.55) : 0;
      mains[sens > 0 ? 0 : 1] = cible || [cx - 96 * Math.sin(a), 158 + 96 * Math.cos(a)];
      x.save(); x.translate(cx, 158); x.rotate(a);
      if (cible) x.scale(1, Math.hypot(cible[0] - cx, cible[1] - 158) / 96);   // le bras s'allonge ou se raccourcit juste assez pour que la main arrive au bon endroit
      const court = t === "tshirt" || t === "polo" || t === "barry" || t === "chris" || t === "wesker";
      if (t === "jill" || t === "gore" || t === "gahan") { x.fillStyle = peau; x.beginPath(); x.roundRect(-11, -8, 22, 104, 11); x.fill(); if (t === "jill") { x.fillStyle = "#1a1a1c"; x.fillRect(-11, 78, 22, 12); }   // Jill : les bras nus, la mitaine noire (Martin Gore, Dave Gahan : bras nus aussi)
        if (t === "gahan" && sens < 0) { x.strokeStyle = "rgba(40,60,70,.75)"; x.lineWidth = 2.2; x.beginPath(); x.moveTo(-6, 10); x.lineTo(6, 10); x.moveTo(0, 2); x.lineTo(0, 24); x.moveTo(-5, 40); x.quadraticCurveTo(0, 30, 5, 40); x.quadraticCurveTo(0, 52, -5, 40); x.moveTo(-4, 48); x.lineTo(4, 56); x.stroke(); }   // ses tatouages
        if (t === "gore") { x.strokeStyle = "#cfd2d6"; x.lineWidth = 2; x.beginPath(); x.arc(0, 86, 9, 0, Math.PI); x.stroke(); } }
      else if (court) { x.fillStyle = peau; x.beginPath(); x.roundRect(-10, 24, 20, 72, 10); x.fill(); x.fillStyle = haut; x.beginPath(); x.roundRect(-14, -10, 28, 44, 12); x.fill(); }
      else { x.fillStyle = haut; x.beginPath(); x.roundRect(-12, -8, 24, 104, 12); x.fill(); }
      if (t === "survet" || t === "fletcher") { x.fillStyle = "#fff"; x.fillRect(sens < 0 ? -6 : 2, -6, 4, 92); }
      if (t === "leon") { x.fillStyle = "#9aa2aa"; x.fillRect(-12, 52, 24, 34); x.fillStyle = "#1a1a1c"; x.fillRect(-12, 34, 24, 16); if (sens < 0) { x.fillStyle = "#c9a227"; x.beginPath(); x.arc(0, 14, 7, 0, 7); x.fill(); x.fillStyle = "#1d3a6a"; x.beginPath(); x.arc(0, 14, 4, 0, 7); x.fill(); } }   // coudières grises, l'écusson du R.P.D.
      if (t === "chris" && sens < 0) { x.fillStyle = "#3a3a2e"; x.beginPath(); x.arc(0, 12, 7, 0, 7); x.fill(); x.fillStyle = "#d8c23a"; x.beginPath(); x.arc(0, 12, 4, 0, 7); x.fill(); }   // l'écusson S.T.A.R.S.
      if ((t === "barry" || t === "chris" || t === "wesker") && !profil) { x.fillStyle = "#1c1c1e"; x.beginPath(); x.arc(0, 96, 11.5, 0, 7); x.fill(); }   // les mitaines
      if (t === "rebecca") { x.fillStyle = "rgba(255,255,255,.08)"; x.fillRect(-12, 20, 24, 3); x.fillRect(-12, 60, 24, 3); }
      if (t === "garde") { x.fillStyle = "#f2f2f0"; x.fillRect(-12, 20, 24, 9); }
      if (t === "beegees") { x.fillStyle = "rgba(255,255,255,.25)"; x.fillRect(-7, -4, 5, 76); x.fillStyle = "#7d6d34"; x.fillRect(-12, 74, 24, 14); }
      if (t === "thriller") { x.fillStyle = "#141414"; x.fillRect(-12, 2, 24, 6); x.fillRect(-12, 80, 24, 6); }
      if (t === "nemesis") { x.fillStyle = "rgba(255,255,255,.08)"; for (let k = 6; k < 90; k += 12) x.fillRect(-12, k, 24, 4); x.fillStyle = "#d8c23a"; x.fillRect(-12, 60, 24, 7); }
      if (t === "zombie") { x.fillStyle = "#2a2a2c"; x.beginPath(); x.moveTo(-12, 70); x.lineTo(-4, 84); x.lineTo(4, 74); x.lineTo(12, 88); x.lineTo(12, 96); x.lineTo(-12, 96); x.fill(); x.fillStyle = "rgba(120,10,10,.7)"; x.beginPath(); x.arc(3, 40, 6, 0, 7); x.fill(); }
      if (t === "mariee") { x.fillStyle = "rgba(255,255,255,.55)"; x.fillRect(-13, -8, 26, 30); }
      if (doigt) {
        // le poing fermé, le pouce sur le côté et l'index tendu, façon Travolta
        x.fillStyle = peau; x.beginPath(); x.roundRect(-11, 86, 22, 20, 7); x.fill();
        x.beginPath(); x.roundRect(4, 98, 6, 30, 3); x.fill();
        x.beginPath(); x.ellipse(-12, 96, 4, 8, -.5, 0, 7); x.fill();
        x.strokeStyle = "rgba(120,70,40,.45)"; x.lineWidth = 1.5; x.beginPath(); x.moveTo(-8, 99); x.lineTo(3, 99); x.moveTo(-8, 103); x.lineTo(3, 103); x.stroke();
      } else { x.fillStyle = peau; x.beginPath(); x.arc(0, 96, 11, 0, 7); x.fill();
        // les griffes du zombie : quatre doigts crochus
        if (/^thriller|^profil$/.test(o.pose || "")) { x.strokeStyle = peau; x.lineWidth = 4.5; x.lineCap = "round";
          for (let f = -1.5; f <= 1.5; f++) { x.beginPath(); x.moveTo(f * 5.5, 102); x.quadraticCurveTo(f * 7.5, 116, f * 4 + 3, 120); x.stroke(); } } }
      x.restore();
    };
    if (profil) { bras(104, -1); bras(96, 1); } else { bras(48, 1); bras(152, -1); }
    // la guitare de Robert Smith : le corps rouge sombre à la hanche, le manche vers le haut à gauche ; les mains par-dessus
    // le micro de Dave Gahan, dans sa main, contre sa bouche
    if ((o.pose === "chant1" || o.pose === "chant2") && mains[1]) { const [hx, hy] = mains[1]; x.save(); x.translate(hx, hy); x.rotate(Math.atan2(142 - hy, 104 - hx));
      x.fillStyle = "#151515"; x.beginPath(); x.roundRect(-6, -5, 30, 11, 4); x.fill(); x.fillStyle = "#9ea3a8"; x.beginPath(); x.arc(30, 0, 11, 0, 7); x.fill();
      x.strokeStyle = "rgba(0,0,0,.4)"; x.lineWidth = 1; for (let k = -6; k <= 6; k += 3) { x.beginPath(); x.moveTo(30 + k, -9); x.lineTo(30 + k, 9); x.stroke(); } x.restore();
      x.fillStyle = peau; x.beginPath(); x.arc(hx, hy, 10, 0, 7); x.fill(); }
    // les baguettes de la batteuse, dans le prolongement des avant-bras
    if (/^batterie/.test(o.pose || "")) { x.strokeStyle = "#d8b47c"; x.lineWidth = 5; x.lineCap = "round";
      for (const [i, cx0] of [[0, 48], [1, 152]]) { const h = mains[i]; if (!h) continue; const dx = h[0] - cx0, dy = h[1] - 158, n = Math.hypot(dx, dy) || 1, bas = o.pose !== "batterie3" && h[1] > 200;
        const ux = bas ? (i ? -.7 : .7) : dx / n, uy = bas ? .25 : dy / n; x.beginPath(); x.moveTo(h[0] - ux * 6, h[1] - uy * 6); x.lineTo(h[0] + ux * 62, h[1] + uy * 62); x.stroke(); }
      x.fillStyle = peau; for (const h of mains) if (h) { x.beginPath(); x.arc(h[0], h[1], 10, 0, 7); x.fill(); } }
    // la guitare électrique du guitariste (Stratocaster sunburst, plaque blanche) et la basse noire du bassiste (manche plus long)
    if ((o.pose === "guitare1" || o.pose === "guitare2") && (t === "guitariste" || t === "bassiste" || t === "gore")) { const basse = t === "bassiste", gore = t === "gore";
      x.save(); x.translate(112, 238); x.rotate(.55);
      const LM = basse ? 150 : 112;
      x.fillStyle = "#c99a5a"; x.fillRect(-LM, -6, LM - 8, 12);                                   // le manche (érable)
      if (basse) { x.fillStyle = "#3a2216"; x.fillRect(-LM, -5, LM - 8, 10); }                   // (la touche en palissandre)
      x.fillStyle = "#c99a5a"; x.beginPath(); x.roundRect(-LM - 24, -11, 28, 22, 5); x.fill();    // la tête
      x.fillStyle = "#e8e8e8"; for (let k = 0; k < (basse ? 4 : 6); k++) { x.beginPath(); x.arc(-LM - 20 + k * (basse ? 6 : 4), -12, 2.2, 0, 7); x.fill(); }   // les mécaniques
      x.strokeStyle = "rgba(0,0,0,.35)"; x.lineWidth = 1; for (let k = 1; k < 12; k++) { x.beginPath(); x.moveTo(-LM + k * (LM - 8) / 12, -6); x.lineTo(-LM + k * (LM - 8) / 12, 6); x.stroke(); }   // les frettes
      if (gore) { x.fillStyle = "#0b0b0d"; x.beginPath(); x.ellipse(8, 0, 34, 28, 0, 0, 7); x.ellipse(-16, 0, 24, 21, 0, 0, 7); x.fill();   // la guitare noire de Martin Gore, filet blanc, plaque et micros chromés
        x.strokeStyle = "#e8e8e8"; x.lineWidth = 1.5; x.beginPath(); x.ellipse(8, 0, 34, 28, 0, 0, 7); x.stroke();
        x.fillStyle = "#cfd2d6"; for (const px of [-6, 10]) x.fillRect(px, -8, 7, 16); x.beginPath(); x.ellipse(26, 6, 6, 4, 0, 0, 7); x.fill(); }
      else if (basse) { x.fillStyle = "#0d0d0f"; x.beginPath(); x.ellipse(10, 0, 40, 31, 0, 0, 7); x.ellipse(-18, 0, 27, 23, 0, 0, 7); x.fill();
        x.strokeStyle = "#5a5a5e"; x.lineWidth = 2; x.beginPath(); x.ellipse(10, 0, 40, 31, 0, 0, 7); x.stroke();
        x.fillStyle = "#1c1c20"; x.beginPath(); x.ellipse(4, 6, 24, 16, .3, 0, 7); x.fill(); x.fillStyle = "#cfd2d6"; x.beginPath(); x.ellipse(30, 4, 9, 7, 0, 0, 7); x.fill(); }   // plaque noire, cache chromé
      else { const g = x.createRadialGradient(8, 0, 4, 8, 0, 36); g.addColorStop(0, "#f0a83a"); g.addColorStop(.55, "#b5481a"); g.addColorStop(1, "#2a0e06");
        x.fillStyle = g; x.beginPath(); x.ellipse(8, 0, 34, 28, 0, 0, 7); x.ellipse(-16, 0, 24, 21, 0, 0, 7); x.fill();
        x.fillStyle = "#f4f2ec"; x.beginPath(); x.ellipse(6, 7, 20, 14, .25, 0, 7); x.fill();       // la plaque blanche
        x.fillStyle = "#ffffff"; for (const px of [-8, 4, 16]) x.fillRect(px, -7, 5, 14);             // les trois micros
        x.fillStyle = "#c8c8c8"; for (const [px, py] of [[24, 12], [30, 4], [20, 18]]) { x.beginPath(); x.arc(px, py, 2.6, 0, 7); x.fill(); } }   // les boutons
      x.strokeStyle = "#e6e6e6"; x.lineWidth = .8; for (let k = -(basse ? 1.5 : 2); k <= (basse ? 1.5 : 2); k++) { x.beginPath(); x.moveTo(-LM, k * 2); x.lineTo(28, k * 2); x.stroke(); }   // les cordes
      x.restore();
      x.fillStyle = peau; for (const h of mains) if (h) { x.beginPath(); x.arc(h[0], h[1], 10, 0, 7); x.fill(); } }
    else if (o.pose === "guitare1" || o.pose === "guitare2") {
      x.save(); x.translate(112, 238); x.rotate(.55);
      x.fillStyle = "#3a2414"; x.fillRect(-112, -6, 104, 12);                                  // le manche
      x.fillStyle = "#1a1a1a"; x.beginPath(); x.roundRect(-132, -10, 24, 20, 4); x.fill();      // la tête du manche
      x.strokeStyle = "#cfcfcf"; x.lineWidth = .8; for (let k = -2; k <= 2; k++) { x.beginPath(); x.moveTo(-112, k * 2); x.lineTo(30, k * 2); x.stroke(); }
      x.fillStyle = "#6e1018"; x.beginPath(); x.ellipse(8, 0, 34, 28, 0, 0, 7); x.ellipse(-16, 0, 24, 21, 0, 0, 7); x.fill();
      x.fillStyle = "#f2efe8"; x.beginPath(); x.ellipse(10, 8, 16, 11, .3, 0, 7); x.fill();      // la plaque blanche
      x.fillStyle = "#c8c8c8"; x.fillRect(-4, -9, 4, 18); x.fillRect(10, -9, 4, 18);           // les micros
      for (let k = -2; k <= 2; k++) { x.strokeStyle = "#e6e6e6"; x.lineWidth = .8; x.beginPath(); x.moveTo(-12, k * 2); x.lineTo(26, k * 2); x.stroke(); }
      x.restore();
      x.fillStyle = peau; for (const h of mains) if (h) { x.beginPath(); x.arc(h[0], h[1], 10, 0, 7); x.fill(); } }
    // à l'apocalypse : le pistolet, dans la main droite (pointé vers le sol, ou devant soi quand on tire)
    if (o.arme && mains[1] && !assis) { const [hx, hy] = mains[1], a = Math.atan2(hy - 158, hx - (profil ? 104 : 152));
      x.save(); x.translate(hx, hy); x.rotate(a); x.fillStyle = "#1b1b1d";
      x.beginPath(); x.roundRect(-4, -6, 34, 11, 2); x.fill();                                // la culasse et le canon
      x.fillStyle = "#3a3a3e"; x.fillRect(2, -5, 26, 3);
      x.fillStyle = "#1b1b1d"; x.beginPath(); x.roundRect(-6, 2, 11, 18, 3); x.fill();          // la crosse
      x.restore(); x.fillStyle = peau; x.beginPath(); x.arc(hx, hy, 10, 0, 7); x.fill(); }
    // la canne de Mr Hernandez (bois sombre, pommeau doré), dans sa main ; dessinée avant la tête, qui passe devant
    if (t === "hernandez" && mains[0]) { const [hx, hy] = mains[0];
      let a, b;
      if (o.pose === "canne1") { a = [hx - 4, hy - 16]; b = [hx + 112, hy + 150]; }
      else if (o.pose === "canne2") { a = [hx - 30, hy - 2]; b = [hx + 160, hy - 2]; }
      else if (o.pose === "canne4") { a = [hx, hy - 12]; b = [hx + 4, 404]; }
      else if (o.pose === "canne3") { a = [hx + 4, hy + 12]; b = [hx - 14, hy - 132]; }
      else { const sx0 = profil ? 96 : 48, dx = hx - sx0, dy = hy - 158, L = Math.hypot(dx, dy) || 1; a = [hx - dx / L * 12, hy - dy / L * 12]; let lg = 150; while (lg > 50 && (hx + dx / L * lg < -55 || hx + dx / L * lg > 255 || hy + dy / L * lg < 6)) lg -= 10;   // (sans sortir de l'image)
        b = [hx + dx / L * lg, Math.min(404, hy + dy / L * lg)]; }
      x.strokeStyle = "#4a2a14"; x.lineWidth = 7; x.lineCap = "round"; x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.stroke();
      x.strokeStyle = "rgba(255,255,255,.18)"; x.lineWidth = 2; x.beginPath(); x.moveTo(a[0] + 1, a[1]); x.lineTo(b[0] + 1, b[1]); x.stroke();
      x.fillStyle = "#c9a227"; x.beginPath(); x.arc(b[0], b[1], 4, 0, 7); x.fill();   // l'embout
      const ang = Math.atan2(b[1] - a[1], b[0] - a[0]); x.save(); x.translate(a[0], a[1]); x.rotate(ang);
      x.strokeStyle = "#d4af37"; x.lineWidth = 8; x.beginPath(); x.moveTo(14, 0); x.lineTo(-6, 0); x.quadraticCurveTo(-20, 0, -20, -12); x.stroke(); x.restore();   // le pommeau doré, recourbé
      x.fillStyle = peau; x.beginPath(); x.arc(hx, hy, 11, 0, 7); x.fill(); }   // la main par-dessus la canne
    const dos = o.pose === "dos" || profil;
    if (!dos && t === "tshirt") { x.fillStyle = peau; x.beginPath(); x.ellipse(100, 146, 14, 8, 0, 0, Math.PI); x.fill(); x.strokeStyle = assombrir(c, .8); x.lineWidth = 3; x.beginPath(); x.ellipse(100, 146, 15, 9, 0, 0, Math.PI); x.stroke(); }
    if (!dos && t === "polo") { x.fillStyle = assombrir(c, .82); x.beginPath(); x.moveTo(82, 142); x.lineTo(100, 150); x.lineTo(90, 162); x.fill(); x.beginPath(); x.moveTo(118, 142); x.lineTo(100, 150); x.lineTo(110, 162); x.fill();
      x.fillStyle = assombrir(c, .9); x.fillRect(97, 150, 6, 26); x.fillStyle = "#f4f1ea"; for (const yb of [156, 166]) { x.beginPath(); x.arc(100, yb, 2, 0, 7); x.fill(); } }
    if (!dos && t === "costume") { x.fillStyle = "#f4f1ea"; x.beginPath(); x.moveTo(86, 146); x.lineTo(100, 190); x.lineTo(114, 146); x.fill(); x.fillStyle = "#8a1f2b"; x.fillRect(97, 152, 6, 40); }
    if (!dos && t === "civil") { x.fillStyle = "#e9e2d0"; x.beginPath(); x.moveTo(88, 146); x.lineTo(100, 168); x.lineTo(112, 146); x.fill(); x.fillStyle = assombrir(c, .8); x.fillRect(98, 168, 4, 92); }
    if (!dos && t === "garde") {
      // col de chemise bleu clair
      x.fillStyle = "#a9c4e0"; x.beginPath(); x.moveTo(84, 145); x.lineTo(100, 166); x.lineTo(116, 145); x.lineTo(108, 141); x.lineTo(100, 152); x.lineTo(92, 141); x.fill();
      // la bande blanche du pull, sur la poitrine et le haut des bras
      x.fillStyle = "#f2f2f0"; x.fillRect(58, 178, 84, 9);
      // les pattes d'épaule et leurs galons dorés
      for (const ex of [62, 116]) { x.fillStyle = "#141b30"; x.beginPath(); x.roundRect(ex, 146, 22, 12, 3); x.fill();
        x.strokeStyle = "#d4b24a"; x.lineWidth = 3; x.beginPath(); x.moveTo(ex + 5, 149); x.lineTo(ex + 11, 155); x.lineTo(ex + 17, 149); x.stroke(); }
      // le ceinturon noir, sa boucle et l'étui
      x.fillStyle = "#121212"; x.fillRect(58, 252, 84, 11); x.fillStyle = "#b9b9b9"; x.fillRect(95, 253, 10, 9);
      x.fillStyle = "#1a1a1a"; x.beginPath(); x.roundRect(134, 258, 16, 34, 4); x.fill();
    }
    x.translate(100, 0); x.scale(1 / LG, 1); x.translate(-100, 0);    // le cou et la tête : sans élargissement
    x.fillStyle = peau; x.fillRect(88, 118, 24, 32);
    if (tete) {
      // la tête détourée, posée sur le cou (cadrée sur 112 px de large au plus, 124 de haut)
      const R = o.reglage || {}, z = R.k || 1;
      const k = Math.min(112 / tete.width, 124 / tete.height) * z, w = tete.width * k, h = tete.height * k;
      if (o.moi) { x.shadowColor = "#f6d465"; x.shadowBlur = 14; }
      x.save(); x.translate(100 + (R.dx || 0), 132 + (R.dy || 0)); x.rotate(((R.r || 0) + (o.pose === "slow" ? 6 : profil ? 24 : o.pose === "boire" ? 14 : 0)) * Math.PI / 180);   // de profil, la tête rejetée en arrière
      if (o.pose === "dos") {
        // de dos : la même silhouette de tête, en arrière du crâne (couleur peau, un peu d'ombre en bas)
        const c2 = document.createElement("canvas"); c2.width = Math.ceil(w); c2.height = Math.ceil(h); const y2 = c2.getContext("2d");
        y2.drawImage(tete, 0, 0, w, h); y2.globalCompositeOperation = "source-in";
        const g = y2.createLinearGradient(0, 0, 0, h);
        if (t === "nemesis") { g.addColorStop(0, "#9a8ca0"); g.addColorStop(1, "#5e5064"); y2.fillStyle = g; y2.fillRect(0, 0, w, h); }
        else if (t === "batteuse" || t === "bassiste") {   // de dos : les boucles brunes de la batteuse, les cheveux longs et blonds du bassiste
          if (t === "batteuse") { g.addColorStop(0, "#7a3e1c"); g.addColorStop(1, "#3e1c0c"); } else { g.addColorStop(0, "#d9c08e"); g.addColorStop(1, "#9c8256"); }
          y2.fillStyle = g; y2.fillRect(0, 0, w, h); y2.globalCompositeOperation = "source-atop";
          if (t === "batteuse") { y2.strokeStyle = "rgba(190,110,50,.5)"; y2.lineWidth = Math.max(1, w * .012); for (let k = 0; k < 70; k++) { y2.beginPath(); y2.arc((k * 37 % 100) / 100 * w, (k * 53 % 100) / 100 * h, w * .035, k, k + 3.5); y2.stroke(); } }
          else { y2.strokeStyle = "rgba(120,96,60,.45)"; y2.lineWidth = Math.max(1, w * .01); for (let k = 0; k < 34; k++) { const sx = (k + .5) / 34 * w; y2.beginPath(); y2.moveTo(sx, h * .03); y2.quadraticCurveTo(sx + (k % 3 - 1) * w * .03, h * .5, sx + (k % 2 ? 1 : -1) * w * .02, h); y2.stroke(); } } }
        else if (/^(rebecca|leon|barry|jill|wesker|chris|gore|gahan|fletcher|doc)$/.test(t)) {   // de dos, les cheveux des héros de Resident Evil (et de Depeche Mode)
          const C = { doc: ["#f4f4f0", "#c9c9c2"], gore: ["#e2d4a8", "#a8946a"], gahan: ["#241c16", "#0e0a08"], fletcher: ["#9a6a48", "#5e3e28"], rebecca: ["#4a3426", "#2a1c12"], leon: ["#4a3a2e", "#2a1e16"], barry: ["#4a3424", "#2a1c12"], jill: ["#5e3e26", "#38220f"], wesker: ["#d2b97c", "#9c8250"], chris: ["#6a4e34", "#3e2c1c"] }[t];
          g.addColorStop(0, C[0]); g.addColorStop(1, C[1]); y2.fillStyle = g; y2.fillRect(0, 0, w, h); y2.globalCompositeOperation = "source-atop";
          y2.strokeStyle = "rgba(255,255,255,.12)"; y2.lineWidth = Math.max(1, w * .01); for (let k = 0; k < 26; k++) { const sx = (k + .5) / 26 * w; y2.beginPath(); y2.moveTo(sx, h * .04); y2.quadraticCurveTo(sx + (k % 3 - 1) * w * .03, h * .45, sx + (k % 2 ? 1 : -1) * w * .02, h * .9); y2.stroke(); } }
        else if (t === "guitariste") {   // de dos : le chapeau noir sur des cheveux bruns
          g.addColorStop(0, "#141416"); g.addColorStop(.48, "#141416"); g.addColorStop(.5, "#2b1d14"); g.addColorStop(1, "#1a110b"); y2.fillStyle = g; y2.fillRect(0, 0, w, h); }
        else if (t === "hernandez" || t === "beegees" || t === "travolta" || t === "smith") {   // de dos, les cheveux : noirs et bouclés pour Mr Hernandez, châtain foncé pour les Bee Gees, brun foncé gominé pour Travolta
          if (t === "beegees") { g.addColorStop(0, "#4a3020"); g.addColorStop(1, "#2a1a10"); }
          else if (t === "travolta") { g.addColorStop(0, "#2e1d12"); g.addColorStop(1, "#160d07"); }
          else if (t === "smith") { g.addColorStop(0, "#151414"); g.addColorStop(1, "#050505"); } else { g.addColorStop(0, "#2a1c14"); g.addColorStop(1, "#120c08"); } y2.fillStyle = g; y2.fillRect(0, 0, w, h);
          y2.globalCompositeOperation = "source-atop";
          if (t === "beegees" || t === "travolta") { y2.strokeStyle = "rgba(110,76,50,.45)"; y2.lineWidth = Math.max(1, w * .012); for (let k = 0; k < 28; k++) { const sx = (k + .5) / 28 * w; y2.beginPath(); y2.moveTo(sx, h * .05); y2.quadraticCurveTo(sx + (k % 3 - 1) * w * .03, h * .5, sx + (k % 2 ? 1 : -1) * w * .02, h); y2.stroke(); } }   // les cheveux longs et raides
          else if (t === "smith") { y2.strokeStyle = "rgba(70,66,62,.55)"; y2.lineWidth = Math.max(1, w * .01); for (let k = 0; k < 60; k++) { const a = k * 2.399, r0 = .15 + (k % 7) / 18; y2.beginPath(); y2.moveTo(w / 2 + Math.cos(a) * w * r0 * .5, h * .45 + Math.sin(a) * h * r0 * .5); y2.lineTo(w / 2 + Math.cos(a) * w * .55, h * .45 + Math.sin(a) * h * .55); y2.stroke(); } }   // ébouriffés
          else { y2.fillStyle = "rgba(90,62,44,.45)"; for (let k = 0; k < 40; k++) { y2.beginPath(); y2.arc((k * 37 % 100) / 100 * w, (k * 53 % 100) / 100 * h, w * .06, 0, 7); y2.fill(); } }
        } else { g.addColorStop(0, "#d9b394"); g.addColorStop(.75, "#c99e7e"); g.addColorStop(1, "#a97d5f"); y2.fillStyle = g; y2.fillRect(0, 0, w, h); }
        x.drawImage(c2, -w / 2, -h);
      } else x.drawImage(tete, -w / 2, -h, w, h);
      x.restore(); x.shadowBlur = 0;
    } else {
      x.fillStyle = peau; x.beginPath(); x.ellipse(100, 72, 44, 54, 0, 0, 7); x.fill();
      if (t === "thriller") {   // le danseur : une tête dessinée, cheveux noirs bouclés, les yeux, un sourire
        x.fillStyle = "#1a1210"; for (let k = 0; k < 16; k++) { const a = Math.PI + k / 15 * Math.PI; x.beginPath(); x.arc(100 + Math.cos(a) * 42, 58 + Math.sin(a) * 40, 11, 0, 7); x.fill(); }
        x.beginPath(); x.ellipse(100, 40, 44, 26, 0, Math.PI, 0); x.fill();
        x.fillStyle = "#2a1a12"; for (const ex of [84, 116]) { x.beginPath(); x.ellipse(ex, 76, 4.5, 5.5, 0, 0, 7); x.fill(); }
        x.strokeStyle = "#7a2a22"; x.lineWidth = 3; x.beginPath(); x.arc(100, 92, 12, .2, Math.PI - .2); x.stroke();
      } else {
      x.fillStyle = "#5a3d2b"; x.beginPath(); x.ellipse(100, 40, 46, 30, 0, Math.PI, 0); x.fill();
      x.fillStyle = "#8a3b22"; x.font = "bold 34px Arial"; x.textAlign = "center"; x.fillText(o.initiales || "?", 100, 92); }
    }
    x.translate(100, 0); x.scale(LG, 1); x.translate(-100, 0);    // (les verres, le torchon : dans les mains, qui ont suivi la corpulence)
    if (assis && !/^batterie/.test(o.pose || "")) {
      // le verre (une bière, avec sa mousse), dans la main ; incliné quand on boit
      const [gx, gy, a] = o.pose === "boire" ? [100, 146, -.9] : [130, 206, 0];
      x.save(); x.translate(gx, gy); x.rotate(a);
      x.fillStyle = "rgba(230,240,245,.55)"; x.beginPath(); x.roundRect(-9, -26, 18, 30, 3); x.fill();
      x.fillStyle = "#e3a92c"; x.fillRect(-7.5, -18, 15, 20); x.fillStyle = "#fbf6e8"; x.fillRect(-8, -24, 16, 7);
      x.strokeStyle = "rgba(255,255,255,.8)"; x.lineWidth = 1.5; x.strokeRect(-9, -26, 18, 30); x.restore();
    }
    // le verre du barman (servir, ranger) ; le torchon à rayures rouges (essuyer)
    if (o.pose === "servir" || o.pose === "ranger" || o.pose === "essuyer") {
      const [gx, gy] = o.pose === "servir" ? [184, 206] : o.pose === "ranger" ? [170, 58] : [104, 212];
      x.fillStyle = "rgba(230,240,245,.6)"; x.beginPath(); x.roundRect(gx - 8, gy - 24, 16, 26, 3); x.fill(); x.strokeStyle = "rgba(255,255,255,.85)"; x.lineWidth = 1.5; x.strokeRect(gx - 8, gy - 24, 16, 26);
      if (o.pose === "servir") { x.fillStyle = "#e3a92c"; x.fillRect(gx - 6.5, gy - 16, 13, 17); x.fillStyle = "#fbf6e8"; x.fillRect(gx - 7, gy - 21, 14, 6); }
      if (o.pose === "essuyer") { x.fillStyle = "#f7f4ec"; x.beginPath(); x.moveTo(84, 214); x.lineTo(124, 208); x.lineTo(118, 262); x.lineTo(92, 258); x.closePath(); x.fill();
        x.fillStyle = "#c8343a"; for (const yy of [226, 236]) x.fillRect(88, yy, 32, 3); }
    }
    if (accroupi) x.restore();
    // un joueur devenu zombie : la peau verdâtre, les vêtements salis de sang
    if (o.zombieJoueur) { x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = "source-atop";
      x.fillStyle = "rgba(70,120,40,.42)"; x.fillRect(0, 0, x.canvas.width, x.canvas.height);
      x.fillStyle = "rgba(110,8,8,.7)"; for (const [a, b, r] of [[150, 200, 14], [190, 260, 10], [130, 300, 12], [175, 140, 9]]) { x.beginPath(); x.arc(a, b, r, 0, 7); x.fill(); }
      x.restore(); }
  });
}

/* ---------- la tête détourée automatiquement, dans le téléphone (la photo ne part nulle part) ---------- */
let segmenteur = null;
async function chargerSegmenteur() {
  if (segmenteur) return segmenteur;
  const { FilesetResolver, ImageSegmenter } = await import(MP_URL);
  const fs = await FilesetResolver.forVisionTasks(MP_WASM);
  segmenteur = await ImageSegmenter.createFromOptions(fs, { baseOptions: { modelAssetPath: MP_MODELE, delegate: "CPU" },
    outputCategoryMask: true, outputConfidenceMasks: false, runningMode: "IMAGE" });
  return segmenteur;
}
// renvoie { png (data URL), auto: true } ; si le détourage échoue : un ovale autour du visage (auto: false)
export async function detourerTete(img) {
  try {
    const seg = await chargerSegmenteur();
    const r = seg.segment(img), m = r.categoryMask, w = m.width, h = m.height, cat = m.getAsUint8Array();
    // catégories : 1 cheveux, 2 peau du corps, 3 peau du visage, 5 accessoires (lunettes…)
    let x0 = w, y0 = h, x1 = 0, y1 = 0, n = 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const c = cat[y * w + x]; if (c === 1 || c === 3) { n++; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } }
    if (n < w * h * .004) throw new Error("pas de visage");
    const cou = y1 + Math.round((y1 - y0) * .12), masque = new Uint8ClampedArray(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const c = cat[y * w + x];
      if (c === 1 || c === 3 || (c === 5 && y <= y1) || (c === 2 && y <= cou && x > x0 && x < x1)) masque[y * w + x] = 255; }
    m.close && m.close();
    // cadre centré sur le milieu du visage (et non sur la boîte, qui peut déborder d'un côté)
    let sx = 0, nf = 0; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (cat[y * w + x] === 3) { sx += x; nf++; }
    const cxv = nf ? Math.round(sx / nf) : Math.round((x0 + x1) / 2), demi = Math.round(Math.max(cxv - x0, x1 - cxv) * 1.06);
    const pad = Math.round((x1 - x0) * .06), bx = Math.max(0, cxv - demi), by = Math.max(0, y0 - pad), bw = Math.min(w, cxv + demi) - bx, bh = Math.min(h, cou + 2) - by;
    return { png: decouper(img, bx, by, bw, bh, (xx, yy) => masque[(yy + by) * w + xx + bx]), auto: true };
  } catch (e) {
    // pas de détourage possible : on garde un ovale centré sur le haut de la photo
    const w = img.naturalWidth || img.width, h = img.naturalHeight || img.height, bw = Math.round(w * .62), bh = Math.round(bw * 1.2), bx = Math.round((w - bw) / 2), by = Math.round(h * .08);
    return { png: decouper(img, bx, by, bw, bh, (xx, yy) => ((xx - bw / 2) / (bw / 2)) ** 2 + ((yy - bh / 2) / (bh / 2)) ** 2 <= 1 ? 255 : 0), auto: false };
  }
}
function decouper(img, bx, by, bw, bh, alpha) {
  const c = document.createElement("canvas"); c.width = bw; c.height = bh; const x = c.getContext("2d");
  x.drawImage(img, bx, by, bw, bh, 0, 0, bw, bh);
  const id = x.getImageData(0, 0, bw, bh);
  for (let yy = 0; yy < bh; yy++) for (let xx = 0; xx < bw; xx++) id.data[(yy * bw + xx) * 4 + 3] = alpha(xx, yy);
  x.putImageData(id, 0, 0);
  // au plus 200 px de haut, pour un fichier léger
  const k = Math.min(1, 200 / bh), f = document.createElement("canvas"); f.width = Math.round(bw * k); f.height = Math.round(bh * k);
  const fx = f.getContext("2d"); fx.imageSmoothingQuality = "high"; fx.drawImage(c, 0, 0, f.width, f.height);
  return f.toDataURL("image/png");
}

/* =====================================================================================
   La 3D
   ===================================================================================== */
let THREE = null;
const tex = (c, rx = 1, ry = 1) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 4; return t; };

/* --- textures des façades --- */
function briques(x, w, h, y0 = 0, ht = h, teinte = 12) {
  x.fillStyle = "#cfd2cc"; x.fillRect(0, y0, w, ht);
  for (let y = y0; y < y0 + ht; y += 9) for (let i = -1; i * 26 < w; i++) {
    const dx = (Math.floor((y - y0) / 9) % 2) * 13, v = alea();
    x.fillStyle = `hsl(${teinte - 2 + v * 6}, ${46 + v * 10}%, ${36 + v * 8}%)`; x.fillRect(i * 26 + dx + 1, y + 1, 24, 7);
  }
}
function fenetre(x, X, Y, W, H, cadre = "#f1ece2", garde = false) {
  x.fillStyle = cadre; x.fillRect(X - 6, Y - 6, W + 12, H + 12);
  const g = x.createLinearGradient(X, Y, X + W, Y + H); g.addColorStop(0, "#c8d8e2"); g.addColorStop(.5, "#8ea6b6"); g.addColorStop(1, "#6f889a");
  x.fillStyle = g; x.fillRect(X, Y, W, H); x.fillStyle = cadre; x.fillRect(X + W / 2 - 2, Y, 4, H); x.fillRect(X, Y + H * .38, W, 3);
  if (garde) { x.strokeStyle = "#222"; x.lineWidth = 3; for (let i = 0; i < 3; i++) { x.beginPath(); x.moveTo(X, Y + H - 4 - i * 9); x.lineTo(X + W, Y + H - 4 - i * 9); x.stroke(); } }
}
// briques fines et longues, rouge un peu mauve (celles de l'autre façade de la cour d'honneur) : 22 cm × 6,5 cm à 40 px/m
function briquesFines(x, w, h) {
  x.fillStyle = "#b9aaa6"; x.fillRect(0, 0, w, h);
  for (let y = 0, r = 0; y < h; y += 3.2, r++) for (let X = -(r % 2) * 4.5; X < w; X += 9) { const v = alea();
    x.fillStyle = `hsl(${2 + v * 8}, ${30 + v * 12}%, ${42 + v * 9}%)`; x.fillRect(X + .5, y + .5, 8.2, 2.4); }
  x.fillStyle = "rgba(150,95,115,.07)"; x.fillRect(0, 0, w, h);
}
const zoneBriques = (x, X, Y, W, H) => { x.save(); x.beginPath(); x.rect(X, Y, W, H); x.clip(); briques(x, X + W, Y + H); x.restore(); };
const pierre = (x, X, Y, W, H, c = "#e9e1d3") => { x.fillStyle = c; x.fillRect(X, Y, W, H); x.fillStyle = "rgba(120,100,70,.14)"; for (let i = X; i < X + W; i += 60) x.fillRect(i, Y, 2, H); for (let j = Y + 40; j < Y + H; j += 40) x.fillRect(X, j, W, 2); };

/* --- briques de construction --- */
function atelier(scene) {
  const mat = (o) => new THREE.MeshStandardMaterial({ roughness: .9, metalness: 0, ...o });
  const ajoute = (geo, m, x, y, z, ombre = true) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = ombre; o.receiveShadow = true; scene.add(o); return o; };
  // une façade percée d'un passage (carré ou voûté) qu'on traverse : volume extrudé, texture plaquée sur la façade
  const facadePercee = ({ largeur, hauteur, profondeur, toileFacade, passage, autres = [], x, z, couleurCote = 0x9a4b38, couleurPassage = 0xd9cfbd }) => {
    const f = new THREE.Shape(); f.moveTo(-largeur / 2, 0); f.lineTo(largeur / 2, 0); f.lineTo(largeur / 2, hauteur); f.lineTo(-largeur / 2, hauteur); f.closePath();
    const p = new THREE.Path(), L = passage.largeur / 2;
    if (passage.voute) { p.moveTo(-L, 0); p.lineTo(-L, passage.hauteur - L); p.absarc(0, passage.hauteur - L, L, Math.PI, 0, true); p.lineTo(L, 0); }
    else { p.moveTo(-L, 0); p.lineTo(-L, passage.hauteur); p.lineTo(L, passage.hauteur); p.lineTo(L, 0); }
    p.closePath(); f.holes.push(p);
    for (const v of autres) { const q = new THREE.Path(), l = v.largeur / 2;
      q.moveTo(v.x - l, 0); q.lineTo(v.x - l, v.hauteur - l); q.absarc(v.x, v.hauteur - l, l, Math.PI, 0, true); q.lineTo(v.x + l, 0); q.closePath(); f.holes.push(q); }
    const t = tex(toileFacade); t.repeat.set(1 / largeur, 1 / hauteur); t.offset.set(.5, 0);
    const o = ajoute(new THREE.ExtrudeGeometry(f, { depth: profondeur, bevelEnabled: false, curveSegments: 20 }), [mat({ map: t }), mat({ color: couleurPassage })], x, 0, z - profondeur);
    o.userData.toit = ajoute(new THREE.BoxGeometry(largeur, .3, profondeur), mat({ color: 0x6b6b6b }), x, hauteur + .15, z - profondeur / 2);
    return o;
  };
  // un immeuble plein, façade texturée tournée vers la cour (côté : "gauche" = façade vers +x, "droite" = vers -x)
  const immeuble = ({ longueur, hauteur, profondeur = 10, toileFacade, cote, x, z, couleur = 0x9a4b38 }) => {
    const m = mat({ color: couleur }), fa = mat({ map: tex(toileFacade) });
    const geo = new THREE.BoxGeometry(profondeur, hauteur, longueur);
    const mats = cote === "gauche" ? [fa, m, mat({ color: 0x6b6b6b }), m, m, m] : [m, fa, mat({ color: 0x6b6b6b }), m, m, m];
    return ajoute(geo, mats, x + (cote === "gauche" ? -profondeur / 2 : profondeur / 2), hauteur / 2, z);
  };
  const plaque = (texte, x, y, z, rotY = 0) => {
    const t = tex(toile(512, 128, (c, w, h) => { c.fillStyle = "#1f3a5f"; c.fillRect(0, 0, w, h); c.strokeStyle = "#f6eedf"; c.lineWidth = 6; c.strokeRect(8, 8, w - 16, h - 16); c.fillStyle = "#f6eedf"; c.font = "bold 46px Arial"; c.textAlign = "center"; c.fillText(texte, w / 2, 82); }));
    const o = ajoute(new THREE.PlaneGeometry(2.6, .65), new THREE.MeshStandardMaterial({ map: t }), x, y, z, false); o.rotation.y = rotY; return o;
  };
  // flèche peinte au sol, pour un passage hors de l'écran (derrière nous)
  const flecheSol = (texte, x, z) => {
    const t = tex(toile(512, 256, (c, w, h) => { c.fillStyle = "rgba(246,212,101,.92)"; c.beginPath(); c.moveTo(w / 2, h - 20); c.lineTo(w / 2 - 70, h - 110); c.lineTo(w / 2 + 70, h - 110); c.fill();
      c.font = "bold 50px Arial"; c.textAlign = "center"; c.fillStyle = "#1f2a37"; c.strokeStyle = "rgba(255,255,255,.9)"; c.lineWidth = 8; c.strokeText(texte, w / 2, 80); c.fillText(texte, w / 2, 80); }));
    const o = ajoute(new THREE.PlaneGeometry(4, 2), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false }), x, .03, z, false); o.rotation.x = -Math.PI / 2; return o;
  };
  // un immeuble haussmannien posé au fond du décor, façade tournée vers la cour (orientation : rotation autour de y)
  const haussmann = ({ x, z, largeur, etages, rot, teinte = "#e6dcc6", graine: g = 11, rdc = null }) => {
    const H = 4.2 + etages * 3.1, prof = 12, grp = new THREE.Group(); grp.position.set(x, 0, z); grp.rotation.y = rot; scene.add(grp);
    const fa = mat({ map: tex(toileHaussmann(largeur, etages, teinte, g, rdc)) }), pl = mat({ color: 0xd8cdb6 });
    const corps = new THREE.Mesh(new THREE.BoxGeometry(largeur, H, prof), [pl, pl, pl, pl, fa, pl]); corps.position.set(0, H / 2, -prof / 2);
    corps.castShadow = corps.receiveShadow = true; grp.add(corps);
    // le toit en zinc à la Mansart (profil dans la profondeur)
    const t = new THREE.Shape(); t.moveTo(0, 0); t.lineTo(prof, 0); t.lineTo(prof - 1.6, 3.6); t.lineTo(1.6, 3.6); t.closePath();
    const zinc = mat({ color: 0x7c8590, roughness: .55, metalness: .25 });
    const toit = new THREE.Mesh(new THREE.ExtrudeGeometry(t, { depth: largeur, bevelEnabled: false }), zinc);
    toit.rotation.y = Math.PI / 2; toit.position.set(-largeur / 2, H, 0); toit.castShadow = true; grp.add(toit);
    const corniche = new THREE.Mesh(new THREE.BoxGeometry(largeur + .4, .35, .7), mat({ color: 0xefe8d8 })); corniche.position.set(0, H + .1, .1); grp.add(corniche);
    // la nuit : des fenêtres allumées (et parfois quelqu'un qui passe derrière)
    grp.userData.nuit = []; grp.userData.silhouettes = [];
    const n = Math.max(3, Math.round(largeur / 3.4)), pas = largeur / n;
    for (let e = 0; e < etages; e++) for (let c = 0; c < n; c++) if (alea() < .3) {
      const fx = -largeur / 2 + c * pas + pas / 2, fy = H - (e * 3.1 + .55 + .78);
      const f = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.55), lumiere()); f.position.set(fx, fy, .02); f.visible = false; grp.add(f); grp.userData.nuit.push(f);
      if (alea() < .45) { const s = silhouette(1.1, 1.55); s.position.set(fx, fy, .03); grp.add(s); grp.userData.nuit.push(s); grp.userData.silhouettes.push(s); }
    }
    // lucarnes
    const nl = Math.max(2, Math.round(largeur / 3.4));
    for (let i = 0; i < nl; i++) { const lx = -largeur / 2 + (i + .5) * largeur / nl;
      const l = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.5, 1), mat({ color: 0xf2eee4 })); l.position.set(lx, H + 1.6, -1.1); l.castShadow = true; grp.add(l);
      const v = new THREE.Mesh(new THREE.PlaneGeometry(.6, .9), mat({ color: 0x3d4a57 })); v.position.set(lx, H + 1.55, -.59); grp.add(v);
      const c = new THREE.Mesh(new THREE.ConeGeometry(.85, .6, 4), zinc); c.rotation.y = Math.PI / 4; c.position.set(lx, H + 2.65, -1.1); grp.add(c); }
    // cheminées en brique et leurs pots en terre cuite
    for (const cx of [-largeur / 2 + 1.2, largeur / 2 - 1.2]) {
      const ch = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.2, .7), mat({ color: 0xb06a4a })); ch.position.set(cx, H + 3.4, -prof / 2); ch.castShadow = true; grp.add(ch);
      for (let k = 0; k < 3; k++) { const pt = new THREE.Mesh(new THREE.CylinderGeometry(.11, .13, .45, 8), mat({ color: 0xc0623e })); pt.position.set(cx - .4 + k * .4, H + 4.7, -prof / 2); grp.add(pt); }
    }
    return grp;
  };
  return { mat, ajoute, facadePercee, immeuble, plaque, flecheSol, haussmann };
}

/* --- sols et ciel --- */
let TEXTURES = null;
function textures() {
  if (TEXTURES) return TEXTURES;
  graine = 7;
  TEXTURES = {
    paves: toile(512, 512, (x, w, h) => { x.fillStyle = "#857f76"; x.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 16) for (let X = ((y / 16) % 2) * 9; X < w; X += 18) { const v = alea(); x.fillStyle = `hsl(35, 5%, ${52 + v * 14}%)`; x.beginPath(); x.roundRect(X + 1, y + 1, 16, 14, 4); x.fill(); } }),
    bitume: toile(256, 256, (x, w, h) => { x.fillStyle = "#8f8a84"; x.fillRect(0, 0, w, h); for (let i = 0; i < 2500; i++) { x.fillStyle = `rgba(${alea() > .5 ? "255,255,255" : "0,0,0"},${alea() * .08})`; x.fillRect(alea() * w, alea() * h, 2, 2); } }),
    dalles: toile(256, 256, (x, w, h) => { x.fillStyle = "#c9c6bf"; x.fillRect(0, 0, w, h); x.strokeStyle = "#b3afa7"; x.lineWidth = 3; for (let i = 0; i <= w; i += 64) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.moveTo(0, i); x.lineTo(w, i); x.stroke(); } }),
    ciel: toile(16, 512, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#3f8fd8"); g.addColorStop(.6, "#8cc4ef"); g.addColorStop(1, "#d6ecfa"); x.fillStyle = g; x.fillRect(0, 0, w, h); }),
    nuage: toile(256, 128, (x) => { x.fillStyle = "#fff"; [[70, 80, 46], [120, 60, 56], [175, 82, 42], [120, 92, 48]].forEach(([a, b, r]) => { x.beginPath(); x.arc(a, b, r, 0, 7); x.fill(); }); }),
    ombre: toile(128, 128, (x) => { const g = x.createRadialGradient(64, 64, 4, 64, 64, 62); g.addColorStop(0, "rgba(0,0,0,.45)"); g.addColorStop(1, "rgba(0,0,0,0)"); x.fillStyle = g; x.fillRect(0, 0, 128, 128); }),
  };
  return TEXTURES;
}

/* --- les trois lieux --- */
function horlogeOcto(x, cx, cy, r) {
  const oct = R => { x.beginPath(); for (let i = 0; i < 8; i++) { const a = Math.PI / 8 + i * Math.PI / 4; x[i ? "lineTo" : "moveTo"](cx + R * Math.cos(a), cy + R * Math.sin(a)); } x.closePath(); };
  x.fillStyle = "#fff"; oct(r); x.fill(); x.lineWidth = r * .1; x.strokeStyle = "#c0392b"; x.stroke();
  x.fillStyle = "#d9b443"; oct(r * .82); x.fill(); x.fillStyle = "#fbf6ea"; oct(r * .55); x.fill(); x.lineWidth = r * .04; x.stroke();
  x.fillStyle = "#222"; x.font = `bold ${Math.round(r * .16)}px Georgia`; x.textAlign = "center"; x.textBaseline = "middle";
  ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"].forEach((t, i) => { const a = -Math.PI / 2 + i * Math.PI / 6; x.fillText(t, cx + r * .69 * Math.cos(a), cy + r * .69 * Math.sin(a)); });
  x.strokeStyle = "#111"; x.lineCap = "round"; x.lineWidth = r * .07; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + r * .08, cy - r * .45); x.moveTo(cx, cy); x.lineTo(cx + r * .32, cy + r * .2); x.stroke();
  x.fillStyle = "#c0392b"; x.beginPath(); x.arc(cx, cy, r * .07, 0, 7); x.fill();
}
/* --- la nuit : la lumière des fenêtres, et des silhouettes qui vont et viennent derrière --- */
let lumieres = null;
const lumiere = () => (lumieres || (lumieres = [0xffd58a, 0xffe2b0, 0xffc870, 0xf6e6c8].map(c => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: .88 }))))[Math.floor(alea() * 4)];
let texSilhouette = null;
// une ombre (tête et épaules) dans une fenêtre de largeur w et hauteur h ; elle traverse la fenêtre de temps en temps
function silhouette(w, h) {
  if (!texSilhouette) texSilhouette = tex(toile(64, 128, (x) => { x.fillStyle = "rgba(48,30,18,.9)"; x.beginPath(); x.arc(32, 34, 15, 0, 7); x.fill();
    x.beginPath(); x.moveTo(4, 128); x.quadraticCurveTo(4, 62, 32, 58); x.quadraticCurveTo(60, 62, 60, 128); x.fill(); }));
  const sh = h * .82, sw = sh / 2;
  const s = new THREE.Mesh(new THREE.PlaneGeometry(sw, sh), new THREE.MeshBasicMaterial({ map: texSilhouette, transparent: true, depthWrite: false, opacity: 0 }));
  s.userData = { course: (w - sw) / 2, base: -(h - sh) / 2, periode: 9000 + alea() * 14000, phase: alea(), sens: alea() < .5 ? 1 : -1 };
  s.visible = false; return s;
}
function animerSilhouette(s, t) {
  const u = s.userData, p = ((t / u.periode) + u.phase) % 1, dep = s.userData.x0 ?? (s.userData.x0 = s.position.x);
  if (u.y0 === undefined) u.y0 = s.position.y + u.base;
  // traverse la fenêtre pendant le premier quart du temps, puis personne ; un aller, puis un retour au tour suivant
  const tour = Math.floor((t / u.periode) + u.phase), sens = tour % 2 ? -u.sens : u.sens;
  if (p > .28) { s.material.opacity = 0; return; }
  const k = p / .28;
  s.position.x = dep + sens * (k * 2 - 1) * u.course; s.position.y = u.y0 + Math.abs(Math.sin(k * 14)) * .03;
  s.material.opacity = Math.min(1, Math.min(k, 1 - k) * 8) * .9;
}

// façade haussmannienne : pierre de taille, balcons filants au 2e et au 5e, boutiques en bas (40 px/m)
// rdc(x, w, yr, hRdc) : dessine un rez-de-chaussée sur mesure (boutiques d'après les photos)
function toileHaussmann(largeur, etages, teinte, graineF, rdc = null) {
  graine = graineF;
  const W = Math.round(largeur * 40), hEt = 3.1 * 40, hRdc = 4.2 * 40, H = hRdc + etages * hEt;
  return toile(W, H, (x, w, h) => {
    x.fillStyle = teinte; x.fillRect(0, 0, w, h);
    // joints de la pierre de taille
    x.fillStyle = "rgba(120,100,70,.12)"; for (let y = 0; y < h - hRdc; y += 20) x.fillRect(0, y, w, 1.5);
    for (let y = 0; y < h - hRdc; y += 40) for (let X = (y / 40 % 2) * 30; X < w; X += 60) x.fillRect(X, y, 1.5, 20);
    const n = Math.max(3, Math.round(largeur / 3.4)), pas = w / n;
    for (let e = 0; e < etages; e++) {
      const y = e * hEt, balconFilant = e === etages - 2 || e === 0;   // 2e (sous la corniche) et 5e
      x.fillStyle = "rgba(255,255,255,.18)"; x.fillRect(0, y + hEt - 8, w, 6);                        // bandeau
      for (let c = 0; c < n; c++) {
        const X = c * pas + pas / 2 - 22, Y = y + 22;
        x.fillStyle = "#f3eee3"; x.fillRect(X - 6, Y - 8, 56, 8);                                       // linteau sculpté
        const g = x.createLinearGradient(X, Y, X, Y + 88); g.addColorStop(0, "#4d5d6c"); g.addColorStop(1, "#2c3640");
        x.fillStyle = g; x.fillRect(X, Y, 44, 88);
        x.fillStyle = "#e9e4d8"; x.fillRect(X + 20, Y, 4, 88); x.fillRect(X, Y + 30, 44, 3);
        if (!balconFilant && alea() > .35) { x.strokeStyle = "#1d1d1d"; x.lineWidth = 2; x.strokeRect(X - 2, Y + 62, 48, 26); for (let k = 0; k < 8; k++) { x.beginPath(); x.moveTo(X + k * 6.5, Y + 62); x.lineTo(X + k * 6.5, Y + 88); x.stroke(); } }
      }
      if (balconFilant) { x.fillStyle = "#cfc8b8"; x.fillRect(0, y + hEt - 22, w, 8);
        x.strokeStyle = "#1d1d1d"; x.lineWidth = 2; x.strokeRect(0, y + hEt - 50, w, 28);
        for (let X = 0; X < w; X += 9) { x.beginPath(); x.moveTo(X, y + hEt - 50); x.lineTo(X, y + hEt - 22); x.stroke(); }
        for (let X = 0; X < w; X += 36) { x.beginPath(); x.arc(X + 18, y + hEt - 36, 8, 0, 7); x.stroke(); } }
    }
    // rez-de-chaussée : grandes boutiques, porte cochère
    const yr = h - hRdc;
    if (rdc) { rdc(x, w, yr, hRdc); x.textAlign = "start"; x.fillStyle = "#cfc6b4"; x.fillRect(0, yr - 10, w, 12); return; } x.fillStyle = "#e3dccb"; x.fillRect(0, yr, w, hRdc); x.fillStyle = "rgba(0,0,0,.08)"; for (let X = 0; X < w; X += 60) x.fillRect(X, yr, 2, hRdc);
    const couleurs = ["#1f4d3a", "#7a1f2b", "#1f3a5f", "#3b2f2a"];
    for (let c = 0; c < n; c += 2) { const X = c * pas + 10, L = Math.min(pas * 1.6, w - X - 10);
      x.fillStyle = couleurs[Math.floor(alea() * 4)]; x.fillRect(X, yr + 26, L, hRdc - 26);
      x.fillStyle = "#c9d8e0"; x.fillRect(X + 10, yr + 60, L - 20, hRdc - 70); x.fillStyle = "rgba(255,255,255,.25)"; x.fillRect(X + 12, yr + 62, (L - 20) / 3, hRdc - 74); }
    x.fillStyle = "#cfc6b4"; x.fillRect(0, yr - 10, w, 12);                                                 // corniche du rez-de-chaussée
  });
}
/* ---------- L'entrée de la caserne, 82 rue du Faubourg-Poissonnière (d'après les vues de la rue) ----------
   - la façade sur rue : soubassement en bossage rustique, étages en pierre lisse, toit mansardé à lucarnes ;
     au centre, le porche carré (on le traverse pour aller dans la cour d'honneur), surmonté de l'arc
     à la grille et au navire de Paris, et de la plaque « Caserne de la Nouvelle France » (la vraie photo) ;
   - devant : une petite cour plantée, un muret et la grille noire à pointes de lance, la cage d'entrée
     avec son tourniquet et son interphone, le portail des véhicules aux deux anneaux, le drapeau ;
   - le trottoir et ses potelets, les candélabres, la chaussée à sens unique ;
   - en face : la Presse des Clubs, l'Artisan Boulanger Pâtissier « Le Fournil du Faubourg » et sa terrasse, L'Anjou ;
   - à gauche, le carrefour avec la rue La Fayette (immeuble en échafaudage, traiteur Yoji, le métro) ;
   - à droite, le voisin et son grand mur pignon décoré. Ni poubelles ni voitures. */
function construireRue(A, T, L, scene) {
  const PX = 40, FZ = -12, LARG = 56, HF = 22;
  graine = 82;
  L.nuitObjets = []; L.silhouettes = [];
  const plan = (w, d, x, z, m, y = .01) => { const o = A.ajoute(new THREE.PlaneGeometry(w, d), m, x, y, z, false); o.rotation.x = -Math.PI / 2; return o; };
  const fer = A.mat({ color: 0x151515, roughness: .45, metalness: .55 }), granit = A.mat({ color: 0xa9a59d }), pierreM = A.mat({ color: 0xd2cbbd });

  /* --- le sol : chaussée, trottoirs, bordures en granit, marquages --- */
  L.sol = plan(170, 170, 0, 0, A.mat({ map: tex(T.bitume, 26, 26), color: 0x75757a }), 0);
  const trottoir = A.mat({ map: tex(T.bitume, 8, 2), color: 0xa7a39c });
  for (const [x0, x1] of [[-90, -36], [-28, 90]]) { plan(x1 - x0, 4.3, (x0 + x1) / 2, -5.35, trottoir); plan(x1 - x0, 3.6, (x0 + x1) / 2, 5.0, trottoir);
    for (const zb of [-3.2, 3.2]) A.ajoute(new THREE.BoxGeometry(x1 - x0, .12, .24), granit, (x0 + x1) / 2, .06, zb, false); }
  for (const xb of [-36, -28]) for (const [z0, z1] of [[-90, -3.2], [3.2, 90]]) { const zc = (z0 + z1) / 2, lg = z1 - z0;
    plan(4, lg, xb + (xb < -30 ? -2 : 2), zc, trottoir, .011); A.ajoute(new THREE.BoxGeometry(.24, .12, lg), granit, xb, .06, zc, false); }
  const jaune = new THREE.MeshBasicMaterial({ color: 0xe8c23a }), blanc = new THREE.MeshBasicMaterial({ color: 0xf2f2ee });
  for (const zl of [2.78, 2.95]) plan(118, .09, 31, zl, jaune, .013);                                  // ligne jaune de livraison
  for (let k = 0; k < 6; k++) plan(3.6, .5, -24.6, -2.6 + k * 1.05, blanc, .014);                     // passage piéton
  for (let k = 0; k < 7; k++) plan(.5, 3.6, -34.6 + k * 1.1, -5.6, blanc, .014);                      // passage piéton de la rue La Fayette
  // la petite cour devant la façade : dallage gris, pavés devant le portail des véhicules
  plan(44, 4.5, -6, -9.75, A.mat({ map: tex(T.dalles, 22, 2.2), color: 0xb9b6b0 }), .012);
  plan(4, 4.5, 11.5, -9.75, A.mat({ map: tex(T.paves, 2, 2.2) }), .015);

  /* --- la façade sur rue --- */
  const W = LARG * PX, H = HF * PX, gx = X => (X + LARG / 2) * PX, gy = Y => (HF - Y) * PX;
  const COLS = []; for (let k = -7; k <= 7; k++) COLS.push(k * 3.4);
  const fac = toile(W, H, (x) => {
    x.fillStyle = "#ddd5c6"; x.fillRect(0, 0, W, H);
    x.fillStyle = "rgba(110,95,70,.12)"; for (let y = 0; y < H; y += 20) { x.fillRect(0, y, W, 1.5); for (let X = ((y / 20) % 2) * 30; X < W; X += 60) x.fillRect(X, y, 1.5, 20); }
    for (let i = 0; i < 500; i++) { x.fillStyle = `rgba(90,78,58,${alea() * .05})`; x.fillRect(alea() * W, alea() * H, 4 + alea() * 34, 4 + alea() * 40); }   // patine
    // le bossage rustique : blocs piquetés, joints creux
    const rustique = (X0, Y0, X1, Y1) => { x.save(); x.beginPath(); x.rect(X0, Y0, X1 - X0, Y1 - Y0); x.clip();
      x.fillStyle = "#958d80"; x.fillRect(X0, Y0, X1 - X0, Y1 - Y0);
      for (let y = Y1, r = 0; y > Y0 - 22; y -= 22, r++) for (let X = X0 - (r % 2) * 26 - 4; X < X1; X += 52) {
        x.fillStyle = `hsl(38, ${7 + alea() * 5}%, ${75 + alea() * 6}%)`; x.fillRect(X + 2, y - 20, 48, 18);
        for (let k = 0; k < 30; k++) { x.fillStyle = `rgba(${alea() > .45 ? "70,60,45" : "255,252,240"},${.12 + alea() * .28})`; x.fillRect(X + 3 + alea() * 44, y - 19 + alea() * 15, 1.4 + alea() * 2.2, 1.4 + alea() * 2.2); }
        x.fillStyle = "rgba(255,255,255,.35)"; x.fillRect(X + 2, y - 20, 48, 1.5); x.fillStyle = "rgba(50,40,28,.4)"; x.fillRect(X + 2, y - 3.5, 48, 1.5); }
      x.restore(); };
    rustique(0, gy(6.0), W, H);
    x.fillStyle = "#e6dfd1"; x.fillRect(0, gy(6.35), W, 14); x.fillStyle = "rgba(60,50,35,.3)"; x.fillRect(0, gy(6.0), W, 3);    // bandeau
    rustique(gx(-3.9), gy(10.4), gx(3.9), gy(6.0));                                                        // le frontispice du porche
    x.fillStyle = "#e6dfd1"; x.fillRect(gx(-4.15), gy(10.75), gx(4.15) - gx(-4.15), 14); x.fillStyle = "rgba(60,50,35,.3)"; x.fillRect(gx(-4.15), gy(10.4), gx(4.15) - gx(-4.15), 3);
    // le linteau du porche
    x.fillStyle = "#d9d1c2"; x.fillRect(gx(-2.7), gy(4.65), gx(2.7) - gx(-2.7), 10);
    // rez-de-chaussée : hautes fenêtres à barreaux, verre sombre
    for (const cx of COLS) { if (Math.abs(cx) < 6) continue;
      const X = gx(cx - .75), Y = gy(4.7), w = 60, h = gy(1.1) - gy(4.7);
      x.fillStyle = "#e3dccd"; x.fillRect(X - 9, Y - 9, w + 18, h + 14); x.fillStyle = "#cfc7b8"; x.fillRect(X - 13, Y + h + 2, w + 26, 7);
      x.fillStyle = "#e3dccd"; x.beginPath(); x.moveTo(X + w / 2 - 9, Y - 9); x.lineTo(X + w / 2 + 9, Y - 9); x.lineTo(X + w / 2 + 7, Y - 22); x.lineTo(X + w / 2 - 7, Y - 22); x.fill();   // clé de linteau
      const g = x.createLinearGradient(X, Y, X + w, Y + h); g.addColorStop(0, "#41544a"); g.addColorStop(.6, "#26322c"); g.addColorStop(1, "#1a221e"); x.fillStyle = g; x.fillRect(X, Y, w, h);
      x.fillStyle = "rgba(200,230,215,.12)"; x.fillRect(X + 4, Y + 4, 14, h - 8);
      x.fillStyle = "#4f6b57"; x.fillRect(X + w / 2 - 2, Y, 4, h); x.fillRect(X, Y + h * .3, w, 3);
      x.fillStyle = "#121212"; for (let b = X + 4; b < X + w; b += 7) x.fillRect(b, Y, 2.2, h); for (const f of [.12, .5, .88]) x.fillRect(X, Y + h * f, w, 3); }
    // les cinq étages : fenêtres à encadrement de pierre, barre d'appui en fer, quelques persiennes
    for (let f = 0; f < 5; f++) for (const cx of COLS) {
      const y0 = 6.35 + f * 3; let b = y0 + .65, t = y0 + 2.55;
      if (Math.abs(cx) < 4.2) { if (f === 0) continue; if (f === 1) { b = 10.95; t = 12.3; } }
      const X = gx(cx - .65), Y = gy(t), w = 52, h = gy(b) - gy(t);
      x.fillStyle = "rgba(60,50,35,.25)"; x.fillRect(X - 6, Y - 4, w + 14, h + 12);
      x.fillStyle = "#ebe5d9"; x.fillRect(X - 8, Y - 8, w + 16, h + 14); x.fillStyle = "#e2dacb"; x.fillRect(X - 12, Y + h + 4, w + 24, 6);
      const g = x.createLinearGradient(X, Y, X + w, Y + h); g.addColorStop(0, "#a9bccb"); g.addColorStop(.55, "#71889a"); g.addColorStop(1, "#56697a"); x.fillStyle = g; x.fillRect(X, Y, w, h);
      if (alea() < .3) { const hp = h * (.3 + alea() * .45); x.fillStyle = "#f2efe8"; x.fillRect(X, Y, w, hp); x.fillStyle = "rgba(0,0,0,.12)"; for (let l = Y + 4; l < Y + hp; l += 4) x.fillRect(X, l, w, 1); }
      x.fillStyle = "#f4f1ea"; x.fillRect(X + w / 2 - 2, Y, 4, h); x.fillRect(X, Y + h * .3, w, 3); x.fillRect(X, Y, w, 3);
      x.strokeStyle = "#141414"; x.lineWidth = 2; x.strokeRect(X - 2, Y + h - 16, w + 4, 14); for (let l = X; l < X + w; l += 5) { x.beginPath(); x.moveTo(l, Y + h - 16); x.lineTo(l, Y + h - 2); x.stroke(); }
      if (alea() < .08) { x.fillStyle = "#c0392b"; for (let k = 0; k < 5; k++) { x.beginPath(); x.arc(X + 8 + k * 9, Y + h - 18, 3.5, 0, 7); x.fill(); } x.fillStyle = "#3d6b35"; x.fillRect(X + 4, Y + h - 16, w - 8, 3); }
    }
    // la corniche
    x.fillStyle = "#ebe4d6"; x.fillRect(0, 0, W, gy(21.35)); x.fillStyle = "rgba(60,50,35,.35)"; x.fillRect(0, gy(21.35), W, 3);
    x.fillStyle = "#d8d0c1"; for (let X = 4; X < W; X += 14) x.fillRect(X, gy(21.7), 7, 7);
  });
  const facade = A.facadePercee({ largeur: LARG, hauteur: HF, profondeur: 14, toileFacade: fac, passage: { largeur: 4.8, hauteur: 4.4 }, x: 0, z: FZ, couleurPassage: 0xd3cbbb });
  facade.castShadow = false;
  /* --- le passage sous le porche (d'après les photos) : on y marche jusqu'à la cour d'honneur.
     Les deux grands battants noirs ouverts contre les murs, les arceaux, le pavé, les trottoirs le long des murs,
     les murs crème, à gauche la porte du poste de police, la barrière, le « 10 », les plantes, les lampes ;
     au bout, la cour d'honneur (le bâtiment de brique aux balcons blancs et son horloge). */
  const jourP = decorPassage(A, T, L, scene, FZ);
  // au bout du passage : la cour d'honneur elle-même, comme quand on y est (pavés, bâtiments de plain-pied, bâtiment du fond et son horloge)
  const cZ0 = FZ - 14, cZ1 = cZ0 - 33.5;
  const pc = A.ajoute(new THREE.PlaneGeometry(22, 34), A.mat({ map: tex(T.paves, 11, 17) }), 0, .01, (cZ0 + cZ1) / 2, false); pc.rotation.x = -Math.PI / 2;
  for (const sg of [-1, 1]) A.ajoute(new THREE.BoxGeometry(12, 7, 34), A.mat({ color: 0xe4dccb }), sg * 18.5, 3.5, (cZ0 + cZ1) / 2);
  const tF = tex(toileFondCour()); const fc = A.ajoute(new THREE.PlaneGeometry(44, 27), A.mat({ map: tF }), 0, 13.5, cZ1, false);
  A.ajoute(new THREE.BoxGeometry(46, 30, 1), A.mat({ color: 0x9a4b38 }), 0, 15, cZ1 - .6, false);
  L.vueCour = (n) => { jourP.intensity = n ? 9 : 14; };
  // l'arc, la grille, le navire de Paris et la plaque : la vraie photo du porche
  const imgP = new Image(), tP = new THREE.Texture(imgP); tP.colorSpace = THREE.SRGBColorSpace; tP.repeat.set(1, 752 / 812); tP.anisotropy = 4;
  imgP.onload = () => { tP.needsUpdate = true; }; imgP.src = "images/porche.jpg";
  const porche = new THREE.Mesh(new THREE.PlaneGeometry(6.8, 6.8 * 752 / 900), new THREE.MeshStandardMaterial({ map: tP, roughness: .95 }));
  porche.position.set(0, 4.4 + 6.8 * 752 / 900 / 2, FZ + .03); porche.receiveShadow = true; scene.add(porche);
  // reliefs : bandeau, corniches, toit mansardé et ses lucarnes
  for (const [x0, x1] of [[-28, -3.9], [3.9, 28]]) A.ajoute(new THREE.BoxGeometry(x1 - x0, .32, .28), pierreM, (x0 + x1) / 2, 6.18, FZ + .14);
  A.ajoute(new THREE.BoxGeometry(8.3, .34, .34), pierreM, 0, 10.58, FZ + .17);
  A.ajoute(new THREE.BoxGeometry(LARG + .4, .6, .75), A.mat({ color: 0xe9e2d4 }), 0, 21.7, FZ + .3);
  const zinc = A.mat({ color: 0x7a8592, roughness: .5, metalness: .3 });
  const pr = new THREE.Shape(); pr.moveTo(0, 0); pr.lineTo(14, 0); pr.lineTo(12.2, 3.8); pr.lineTo(1.8, 3.8); pr.closePath();
  const toit = new THREE.Mesh(new THREE.ExtrudeGeometry(pr, { depth: LARG, bevelEnabled: false }), zinc); toit.rotation.y = Math.PI / 2; toit.position.set(-LARG / 2, HF, FZ); toit.castShadow = true; scene.add(toit);
  for (const cx of COLS) {
    A.ajoute(new THREE.BoxGeometry(1.2, 1.6, 1.2), A.mat({ color: 0xefe9dd }), cx, HF + 1.5, FZ - 1.2);
    A.ajoute(new THREE.PlaneGeometry(.7, 1), A.mat({ color: 0x3b4a58 }), cx, HF + 1.45, FZ - .58, false);
    const c = A.ajoute(new THREE.ConeGeometry(.92, .62, 4), zinc, cx, HF + 2.6, FZ - 1.2); c.rotation.y = Math.PI / 4;
    if (alea() < .25) { const f = new THREE.Mesh(new THREE.PlaneGeometry(.66, .95), lumiere()); f.position.set(cx, HF + 1.45, FZ - .57); f.visible = false; scene.add(f); L.nuitObjets.push(f); }
  }
  for (const cx of [-24, -10, 6, 20]) { A.ajoute(new THREE.BoxGeometry(1.6, 2.4, .8), A.mat({ color: 0xa8664a }), cx, HF + 4.6, FZ - 7); for (let k = 0; k < 3; k++) A.ajoute(new THREE.CylinderGeometry(.12, .14, .5, 8), A.mat({ color: 0xbf603c }), cx - .45 + k * .45, HF + 6, FZ - 7); }
  // la nuit : des fenêtres allumées aux étages, et parfois quelqu'un derrière
  for (let f = 0; f < 5; f++) for (const cx of COLS) { if (Math.abs(cx) < 4.2 && f < 2) continue;
    (L.fenetres = L.fenetres || []).push([cx, 6.35 + f * 3 + 1.75, FZ + .02, 1.25, 1.45, 0]);   // (toutes les fenêtres de la façade : on en barricade à l'apocalypse)
    if (alea() > .24) continue;
    const y = 6.35 + f * 3 + .65 + 1.0, fe = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 1.45), lumiere()); fe.position.set(cx, y + .1, FZ + .02); fe.visible = false; scene.add(fe); L.nuitObjets.push(fe);
    if (alea() < .4) { const s = silhouette(1.25, 1.45); s.position.set(cx, y + .1, FZ + .03); scene.add(s); L.nuitObjets.push(s); L.silhouettes.push(s); } }
  // plaques : le numéro 82 et le nom de la rue (émail bleu de Paris)
  const emaille = (w, h, dessin, x, y, z, ry = 0) => { const o = A.ajoute(new THREE.PlaneGeometry(w, h), A.mat({ map: tex(toile(Math.round(w * 200), Math.round(h * 200), dessin)), roughness: .4 }), x, y, z, false); o.rotation.y = ry; return o; };
  emaille(.34, .26, (x, w, h) => { x.fillStyle = "#1d3f73"; x.fillRect(0, 0, w, h); x.strokeStyle = "#f4f1e6"; x.lineWidth = 3; x.strokeRect(5, 5, w - 10, h - 10); x.fillStyle = "#f4f1e6"; x.font = "bold 34px Arial"; x.textAlign = "center"; x.fillText("82", w / 2, h / 2 + 12); }, 4.35, 3.1, FZ + .04);
  const plaqueRue = (texte, x, y, z, ry) => emaille(1.5, .5, (c, w, h) => { c.fillStyle = "#2b6e4f"; c.fillRect(0, 0, w, h); c.fillStyle = "#1d3f73"; c.fillRect(6, 6, w - 12, h - 12); c.strokeStyle = "#f4f1e6"; c.lineWidth = 2; c.strokeRect(10, 10, w - 20, h - 20);
    c.fillStyle = "#f4f1e6"; c.textAlign = "center"; c.font = "bold 13px Arial"; c.fillText("10e Arrt", w / 2, 30); c.font = "bold 22px Arial"; const l = texte.split("|"); l.forEach((t, i) => c.fillText(t, w / 2, 56 + i * 24)); }, x, y, z, ry);
  plaqueRue("RUE DU FAUBOURG|POISSONNIÈRE", -25.5, 4.6, FZ + .04, 0);

  /* --- la grille noire à pointes de lance, sur son muret --- */
  const barres = [];
  const grille = (x1, z1, x2, z2, h = 2.3, base = .45, pas = .13, muret = true) => {
    const lg = Math.hypot(x2 - x1, z2 - z1), n = Math.max(1, Math.round(lg / pas)), ang = Math.atan2(z2 - z1, x2 - x1);
    for (let i = 0; i <= n; i++) { const t = i / n; barres.push([x1 + (x2 - x1) * t, z1 + (z2 - z1) * t, base, h]); }
    for (const y of [base + .14, base + h - .3]) { const r = A.ajoute(new THREE.BoxGeometry(lg, .05, .04), fer, (x1 + x2) / 2, y, (z1 + z2) / 2); r.rotation.y = -ang; }
    for (let i = 0; i <= Math.floor(lg / 2.6); i++) { const t = Math.min(1, i * 2.6 / lg); A.ajoute(new THREE.BoxGeometry(.08, h + .1, .08), fer, x1 + (x2 - x1) * t, base + (h + .1) / 2, z1 + (z2 - z1) * t); }
    if (muret && base > .1) { const m = A.ajoute(new THREE.BoxGeometry(lg + .5, base, .5), pierreM, (x1 + x2) / 2, base / 2, (z1 + z2) / 2); m.rotation.y = -ang; }
  };
  grille(-28, -7.5, -2.6, -7.5); grille(2.6, -7.5, 9.5, -7.5); grille(13.5, -7.5, 16, -7.5); grille(-28, -7.5, -28, -26);
  // la cage d'entrée : grille plus haute, portillon ouvert, interphone
  grille(-2.6, -7.5, -2.6, -12, 2.7, .12); grille(2.6, -7.5, 2.6, -12, 2.7, .12); grille(-2.6, -7.5, .1, -7.5, 2.7, .12); grille(1.5, -7.5, 2.6, -7.5, 2.7, .12);
  grille(1.5, -7.6, 1.02, -8.82, 2.5, .05, .13, false);
  A.ajoute(new THREE.BoxGeometry(.14, 1.5, .1), A.mat({ color: 0x9c9d9b, metalness: .4 }), .3, .75, -7.65);
  A.ajoute(new THREE.BoxGeometry(.2, .34, .08), A.mat({ color: 0xb9bab8, metalness: .4 }), .3, 1.35, -7.58);
  A.ajoute(new THREE.PlaneGeometry(.1, .08), new THREE.MeshBasicMaterial({ color: 0x0d1b2a }), .3, 1.43, -7.53, false);
  // le portail des véhicules : deux piliers coiffés d'anneaux, deux vantaux fermés
  for (const px of [9.5, 13.5]) { A.ajoute(new THREE.BoxGeometry(.22, 2.9, .22), fer, px, 1.45, -7.5);
    const anneau = A.ajoute(new THREE.TorusGeometry(.34, .055, 10, 28), fer, px, 3.28, -7.5); anneau.rotation.y = 0;
    A.ajoute(new THREE.TorusGeometry(.2, .025, 8, 20), fer, px, 3.28, -7.5); A.ajoute(new THREE.SphereGeometry(.08, 10, 8), fer, px, 2.95, -7.5); }
  grille(9.6, -7.5, 13.4, -7.5, 2.45, .06, .13, false);
  // toutes les barreaux et leurs pointes, en deux paquets (rapide à dessiner)
  const geoB = new THREE.CylinderGeometry(.017, .017, 1, 6), geoP = new THREE.ConeGeometry(.036, .17, 6);
  const ib = new THREE.InstancedMesh(geoB, fer, barres.length), ip = new THREE.InstancedMesh(geoP, fer, barres.length), mm = new THREE.Matrix4(), q = new THREE.Quaternion();
  barres.forEach(([bx, bz, base, h], i) => { ib.setMatrixAt(i, mm.compose(new THREE.Vector3(bx, base + h / 2, bz), q, new THREE.Vector3(1, h, 1))); ip.setMatrixAt(i, mm.compose(new THREE.Vector3(bx, base + h + .08, bz), q, new THREE.Vector3(1, 1, 1))); });
  ib.castShadow = ip.castShadow = true; scene.add(ib, ip);
  // panneaux « site sous vidéoprotection »
  const video = (x, y, z) => emaille(.62, .42, (c, w, h) => { c.fillStyle = "#f6f6f2"; c.fillRect(0, 0, w, h); c.fillStyle = "#1d3f73"; c.fillRect(0, 0, w / 3, 7); c.fillStyle = "#c8102e"; c.fillRect(w * 2 / 3, 0, w / 3, 7);
    c.fillStyle = "#222"; c.textAlign = "center"; c.font = "bold 12px Georgia"; c.fillText("SITE SOUS VIDÉOPROTECTION", w / 2, 26); c.font = "8px Arial"; for (let l = 0; l < 6; l++) c.fillRect(14, 36 + l * 7, w - 60, 2);
    c.fillStyle = "#333"; c.fillRect(w - 40, 40, 26, 14); c.fillRect(w - 24, 54, 4, 10); }, x, y, z);
  video(-4.2, 1.7, -7.42); video(14.7, 1.6, -7.42);
  // les massifs derrière la grille et deux arbres en hiver
  const verts = [0x2e4a2b, 0x37552f, 0x2a4126, 0x3f5e33];
  const massif = (x, z, s) => { const b = A.ajoute(new THREE.IcosahedronGeometry(s, 1), A.mat({ color: verts[Math.floor(alea() * 4)], roughness: 1, flatShading: true }), x, s * .75, z); b.scale.set(1.2, .9 + alea() * .4, 1); };
  for (let x = -27.3; x < 9; x += .9 + alea() * .5) { if (Math.abs(x) < 3.2) continue; massif(x, -8.3 - alea() * .5, .55 + alea() * .45); if (alea() < .6) massif(x + .3, -11.2 + alea() * .6, .7 + alea() * .5); }
  for (let z = -25; z < -8.5; z += 1.1) massif(-27 + alea() * .4, z, .6 + alea() * .4);
  const bois = A.mat({ color: 0x4d4239, roughness: 1 });
  const arbre = (x, z, h) => { const tronc = A.ajoute(new THREE.CylinderGeometry(.16, .26, h * .45, 8), bois, x, h * .225, z);
    const branche = (o, d, lg, r, n) => { if (n === 0 || lg < .4) return; const fin = o.clone().addScaledVector(d, lg);
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r * .65, r, lg, 5), bois); m.position.copy(o).addScaledVector(d, lg / 2); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d); m.castShadow = true; scene.add(m);
      for (let k = 0; k < 3; k++) { const nd = d.clone().add(new THREE.Vector3(alea() - .5, alea() * .5, alea() - .5).multiplyScalar(1.3)).normalize(); branche(fin, nd, lg * (.62 + alea() * .2), r * .62, n - 1); } };
    branche(new THREE.Vector3(x, h * .45, z), new THREE.Vector3(0, 1, 0), h * .22, .17, 5); return tronc; };
  arbre(-15.5, -10.2, 10); arbre(-23.5, -9.6, 8.5);

  /* --- le drapeau tricolore, qui flotte --- */
  A.ajoute(new THREE.CylinderGeometry(.05, .07, 10.5, 10), A.mat({ color: 0xdcdcdc, metalness: .4, roughness: .4 }), 7.6, 5.25, -8.7);
  A.ajoute(new THREE.SphereGeometry(.11, 12, 10), A.mat({ color: 0xd4af37, metalness: .7, roughness: .3 }), 7.6, 10.55, -8.7);
  const geoD = new THREE.PlaneGeometry(2.2, 1.45, 18, 8);
  const drapeau = new THREE.Mesh(geoD, new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: .8, map: tex(toile(96, 64, (x, w, h) => { x.fillStyle = "#0b3d91"; x.fillRect(0, 0, w / 3, h); x.fillStyle = "#f4f4f4"; x.fillRect(w / 3, 0, w / 3, h); x.fillStyle = "#e1262d"; x.fillRect(w * 2 / 3, 0, w / 3, h); })) }));
  drapeau.position.set(7.6 + 1.1, 9.55, -8.7); drapeau.castShadow = true; scene.add(drapeau);
  const baseD = Float32Array.from(geoD.attributes.position.array);

  /* --- le trottoir : potelets, candélabres --- */
  const pot = [];
  for (let x = -26.6; x < 15.5; x += 1.6) if (Math.abs(x - 7.6) > .5) pot.push([x, -3.48]);
  for (let x = -26.6; x < 60; x += 1.6) if (x < -4.5 || x > 10.5) pot.push([x, 3.48]);
  for (const z of [-6.6, -4.6, 4.4, 6.2]) pot.push([-28.4, z], [-35.6, z]);
  const potMat = A.mat({ color: 0x1b1b1b, roughness: .5, metalness: .3 });
  const ipo = new THREE.InstancedMesh(new THREE.CylinderGeometry(.05, .065, .9, 10), potMat, pot.length), ibo = new THREE.InstancedMesh(new THREE.SphereGeometry(.075, 10, 8), potMat, pot.length);
  pot.forEach(([x, z], i) => { ipo.setMatrixAt(i, mm.makeTranslation(x, .45, z)); ibo.setMatrixAt(i, mm.makeTranslation(x, .93, z)); }); ipo.castShadow = true; scene.add(ipo, ibo);
  const fonte = A.mat({ color: 0x2c3a33, roughness: .5, metalness: .4 });
  const candelabre = (x, z, sens) => {
    A.ajoute(new THREE.CylinderGeometry(.06, .12, 6.6, 10), fonte, x, 3.3, z); A.ajoute(new THREE.CylinderGeometry(.16, .2, .6, 10), fonte, x, .3, z);
    const crosse = A.ajoute(new THREE.TorusGeometry(.55, .045, 8, 16, Math.PI / 2), fonte, x, 6.6, z + sens * .55); crosse.rotation.y = sens > 0 ? -Math.PI / 2 : Math.PI / 2;
    const lz = z + sens * 1.1; A.ajoute(new THREE.CylinderGeometry(.1, .28, .45, 8), fonte, x, 6.9, lz);
    const verre = new THREE.Mesh(new THREE.CylinderGeometry(.24, .18, .35, 8), new THREE.MeshStandardMaterial({ color: 0xf3ead2, emissive: 0x000000, roughness: .3 })); verre.position.set(x, 6.55, lz); scene.add(verre);
    const halo = new THREE.Mesh(new THREE.CylinderGeometry(.24, .18, .35, 8), new THREE.MeshBasicMaterial({ color: 0xffd99a })); halo.position.copy(verre.position); halo.visible = false; scene.add(halo); L.nuitObjets.push(halo);
    const l = new THREE.PointLight(0xffcf8a, 60, 22, 1.4); l.position.set(x, 6.2, lz); l.visible = false; scene.add(l); L.nuitObjets.push(l); };
  candelabre(-10, -3.7, 1); candelabre(17, -3.7, 1); candelabre(-19, 3.7, -1); candelabre(28, 3.7, -1);

  /* --- les immeubles alentour --- */
  // une enseigne : le texte est réduit s'il ne tient pas dans le bandeau
  const bandeau = (x, X, Y, w, h, fond, texte, police, coul) => { x.fillStyle = fond; x.fillRect(X, Y, w, h); x.fillStyle = coul; x.font = police; x.textAlign = "center"; x.textBaseline = "middle";
    const lg = x.measureText(texte).width, k = Math.min(1, (w - 14) / lg); x.save(); x.translate(X + w / 2, Y + h / 2 + 1); x.scale(k, 1); x.fillText(texte, 0, 0); x.restore(); x.textBaseline = "alphabetic"; };
  const vitrine = (x, X, Y, w, h, interieur) => { x.fillStyle = "#1a1a1a"; x.fillRect(X - 3, Y - 3, w + 6, h + 6); const g = x.createLinearGradient(X, Y, X, Y + h); g.addColorStop(0, interieur[0]); g.addColorStop(1, interieur[1]); x.fillStyle = g; x.fillRect(X, Y, w, h);
    x.fillStyle = "rgba(255,255,255,.16)"; x.beginPath(); x.moveTo(X, Y); x.lineTo(X + w * .3, Y); x.lineTo(X + w * .12, Y + h); x.lineTo(X, Y + h); x.fill(); };
  const RDC = {
    // en face de la caserne : la Presse des Clubs et l'Artisan Boulanger Pâtissier « Le Fournil du Faubourg »
    boulangerie: (x, w, yr, h) => { x.fillStyle = "#e7dfcf"; x.fillRect(0, yr, w, h); const P = 210;
      bandeau(x, 0, yr + 8, P, 34, "#121212", "PRESSE DES CLUBS", "bold 25px Impact, 'Arial Black', sans-serif", "#ffffff");
      vitrine(x, 10, yr + 50, P - 20, h - 52, ["#3a3a3a", "#202020"]);
      for (let i = 0; i < 60; i++) { x.fillStyle = `hsl(${alea() * 360}, ${50 + alea() * 30}%, ${42 + alea() * 28}%)`; x.fillRect(16 + (i % 12) * 15, yr + 96 + Math.floor(i / 12) * 14, 13, 12); }
      x.fillStyle = "#3b7bd4"; x.fillRect(18, yr + 54, 44, 38); x.fillStyle = "#c43a85"; x.fillRect(68, yr + 54, 40, 38); x.fillStyle = "#e9e6dc"; x.fillRect(114, yr + 54, 40, 38);
      x.fillStyle = "#fff"; x.font = "bold 10px Arial"; x.textAlign = "center"; x.fillText("WEEK-END", 88, yr + 74); x.fillText("500", 40, yr + 66);
      bandeau(x, P, yr + 2, w - P, 42, "#1b2537", "Artisan Boulanger Pâtissier", "bold italic 24px Georgia, serif", "#f0e2bf");
      bandeau(x, P, yr + 46, w - P, 15, "#2c3038", "— Le Fournil du Faubourg —", "italic 11px Georgia, serif", "#dcd0b6");
      const Q = (w - P - 24) / 3;
      for (let k = 0; k < 3; k++) { const X = P + 8 + k * (Q + 4);
        if (k === 1) { vitrine(x, X, yr + 70, Q, h - 70, ["#2a2a2a", "#111"]); x.fillStyle = "#b9a37a"; x.fillRect(X + Q / 2 - 1, yr + 70, 2, h - 70); continue; }
        vitrine(x, X, yr + 70, Q, h - 72, ["#f0d9a6", "#b98a52"]);
        for (let r = 0; r < 3; r++) for (let c = 0; c < 7; c++) { x.fillStyle = ["#c98a3e", "#a8652a", "#e0b06a", "#8a4e22"][Math.floor(alea() * 4)]; x.beginPath(); x.ellipse(X + 10 + c * (Q - 16) / 6, yr + 92 + r * 22, 6, 4, 0, 0, 7); x.fill(); } } },
    anjou: (x, w, yr, h) => { x.fillStyle = "#e3dccb"; x.fillRect(0, yr, w, h);
      bandeau(x, 20, yr + 10, w * .55, 34, "#3a2a24", "L'ANJOU", "bold 24px Georgia, serif", "#e8c870");
      vitrine(x, 24, yr + 52, w * .55 - 8, h - 54, ["#d9b17a", "#6b4a2c"]);
      vitrine(x, w * .65, yr + 30, w * .3, h - 32, ["#9db0bd", "#4f5f6b"]); },
    yoji: (x, w, yr, h) => { x.fillStyle = "#e2dbcc"; x.fillRect(0, yr, w, h);
      bandeau(x, 10, yr + 10, w - 20, 34, "#d9b65a", "TRAITEUR ASIATIQUE   YOJI", "bold 22px 'Arial Black', Arial", "#3a2a10");
      x.fillStyle = "#151515"; x.fillRect(10, yr + 46, w - 20, h - 46); vitrine(x, 22, yr + 56, w - 44, h - 60, ["#f3dcb4", "#8a6440"]);
      for (let k = 0; k < 8; k++) { x.fillStyle = ["#e86a3a", "#f2d27a", "#8bbf5a", "#fff"][k % 4]; x.fillRect(40 + k * (w - 90) / 8, yr + 100, 18, 12); } },
    metro: (x, w, yr, h) => { x.fillStyle = "#d9cdb3"; x.fillRect(0, yr, w, h);
      for (let X = 20; X < w - 60; X += 90) { x.fillStyle = "#2b2b2b"; x.beginPath(); x.moveTo(X, yr + h); x.lineTo(X, yr + 70); x.arc(X + 35, yr + 70, 35, Math.PI, 0); x.lineTo(X + 70, yr + h); x.fill(); x.fillStyle = "#3d5466"; x.fillRect(X + 6, yr + 76, 58, h - 76); }
      x.fillStyle = "#f2c230"; x.beginPath(); x.arc(w - 40, yr + 50, 22, 0, 7); x.fill(); x.fillStyle = "#1a1a1a"; x.font = "bold 30px Arial"; x.textAlign = "center"; x.fillText("M", w - 40, yr + 61); },
  };
  const im = (o) => { const g = A.haussmann(o); L.nuitObjets.push(...g.userData.nuit); L.silhouettes.push(...g.userData.silhouettes); return g; };
  const teintes = ["#e8e0cd", "#ece4d2", "#e2d7c0", "#e9e1cf", "#efe9dc"];
  // en face (côté sud, façades tournées vers la caserne)
  im({ x: -23, z: 6.8, largeur: 10, etages: 6, rot: Math.PI, teinte: teintes[2], graine: 61 });
  im({ x: -11, z: 6.8, largeur: 14, etages: 6, rot: Math.PI, teinte: teintes[0], graine: 62 });
  im({ x: 3, z: 6.8, largeur: 14, etages: 6, rot: Math.PI, teinte: teintes[4], graine: 63, rdc: RDC.boulangerie });
  im({ x: 17, z: 6.8, largeur: 14, etages: 6, rot: Math.PI, teinte: teintes[1], graine: 64, rdc: RDC.anjou });
  im({ x: 32, z: 6.8, largeur: 16, etages: 5, rot: Math.PI, teinte: teintes[3], graine: 65 });
  im({ x: 48, z: 6.8, largeur: 16, etages: 6, rot: Math.PI, teinte: teintes[2], graine: 66 });
  im({ x: -46, z: 6.8, largeur: 18, etages: 6, rot: Math.PI, teinte: teintes[1], graine: 67, rdc: RDC.yoji });
  // côté caserne : le voisin de droite, la suite de la rue, et l'autre coin de la rue La Fayette
  im({ x: 25, z: -7.5, largeur: 18, etages: 6, rot: 0, teinte: teintes[4], graine: 68 });
  im({ x: 43, z: -7.5, largeur: 18, etages: 6, rot: 0, teinte: teintes[0], graine: 69 });
  im({ x: -46, z: -7.5, largeur: 18, etages: 6, rot: 0, teinte: teintes[3], graine: 70, rdc: RDC.metro });
  // au bout de la rue, et le long de la rue La Fayette
  im({ x: 66, z: 0, largeur: 24, etages: 6, rot: -Math.PI / 2, teinte: teintes[1], graine: 71 });
  im({ x: -66, z: 0, largeur: 24, etages: 6, rot: Math.PI / 2, teinte: teintes[0], graine: 72 });
  for (const [z, l, g] of [[-22, 16, 73], [-40, 18, 74], [22, 16, 75], [40, 18, 76]]) { im({ x: -36, z, largeur: l, etages: 6, rot: Math.PI / 2, teinte: teintes[g % 5], graine: g }); }
  for (const [z, l, g] of [[26, 16, 77], [44, 18, 78], [-40, 18, 79]]) im({ x: -28, z, largeur: l, etages: 6, rot: -Math.PI / 2, teinte: teintes[g % 5], graine: g });
  // le grand mur pignon du voisin, et son décor (un panneau miroir entre deux colonnes de demi-lunes)
  const pignon = new THREE.Mesh(new THREE.PlaneGeometry(12, 24), A.mat({ map: tex(toile(240, 480, (x, w, h) => { x.fillStyle = "#e5e3dd"; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) { x.fillStyle = `rgba(110,105,95,${alea() * .07})`; x.fillRect(alea() * w, alea() * h, 3 + alea() * 30, 10 + alea() * 80); } })) }));
  pignon.rotation.y = -Math.PI / 2; pignon.position.set(15.97, 12, -13.5); scene.add(pignon);
  const decor = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 13), A.mat({ roughness: .25, metalness: .2, map: tex(toile(136, 520, (x, w, h) => {
    x.fillStyle = "#d9d6cf"; x.fillRect(0, 0, w, h);
    const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, "#c9d3da"); g.addColorStop(.4, "#9eabb4"); g.addColorStop(.7, "#d6dde2"); g.addColorStop(1, "#8b98a2"); x.fillStyle = g; x.fillRect(34, 40, 68, h - 90);
    x.fillStyle = "rgba(90,80,70,.25)"; for (let k = 0; k < 14; k++) x.fillRect(40 + alea() * 50, 60 + k * 28, 10 + alea() * 30, 12);   // reflets d'immeubles
    x.strokeStyle = "#8d8a83"; x.lineWidth = 3; x.strokeRect(34, 40, 68, h - 90);
    for (const cx of [14, w - 14]) for (let y = 30; y < h - 30; y += 22) { x.fillStyle = "#f3f1ec"; x.beginPath(); x.arc(cx, y, 9, Math.PI / 2, Math.PI * 1.5, cx > w / 2); x.fill(); x.strokeStyle = "#9a978f"; x.lineWidth = 1.5; x.stroke(); } })) }));
  decor.rotation.y = -Math.PI / 2; decor.position.set(15.95, 11.5, -9.8); scene.add(decor);
  // l'immeuble du coin, en face, sous échafaudage
  const tube = A.mat({ color: 0xb9bcbf, metalness: .6, roughness: .4 }), planche = A.mat({ color: 0x9a8a6a });
  for (let x = -27.6; x <= -18.4; x += 2.3) for (const dz of [.35, 1.35]) A.ajoute(new THREE.CylinderGeometry(.03, .03, 26, 5), tube, x, 13, 6.8 - dz, false);
  for (let y = 2; y < 26; y += 2) { for (const dz of [.35, 1.35]) A.ajoute(new THREE.BoxGeometry(9.4, .05, .05), tube, -23, y, 6.8 - dz, false); A.ajoute(new THREE.BoxGeometry(9.4, .04, .9), planche, -23, y - .04, 6.8 - .85, false);
    const d = A.ajoute(new THREE.BoxGeometry(2.9, .04, .04), tube, -23 + ((y / 2) % 4 - 1.5) * 2.3, y + 1, 6.8 - 1.38, false); d.rotation.z = .7; }
  const bache = A.ajoute(new THREE.PlaneGeometry(4.2, 1.6), A.mat({ map: tex(toile(210, 80, (x, w, h) => { x.fillStyle = "#e9eef3"; x.fillRect(0, 0, w, h); x.fillStyle = "#1d3f73"; x.fillRect(0, 0, w, 16); x.fillStyle = "#c8102e"; x.fillRect(0, h - 10, w, 10); x.fillStyle = "#1d3f73"; x.font = "bold 16px Arial"; x.textAlign = "center"; x.fillText("RAVALEMENT", w / 2, 44); x.font = "11px Arial"; x.fillText("de façade", w / 2, 60); })), side: THREE.DoubleSide }), -23, 9.6, 5.4, false);
  bache.rotation.y = Math.PI;
  // le totem du métro au coin
  A.ajoute(new THREE.CylinderGeometry(.07, .09, 3.6, 10), fonte, -37.6, 1.8, -4.2);
  const mtr = A.ajoute(new THREE.CylinderGeometry(.42, .42, .08, 24), A.mat({ map: tex(toile(128, 128, (x) => { x.fillStyle = "#f2c230"; x.beginPath(); x.arc(64, 64, 62, 0, 7); x.fill(); x.fillStyle = "#1a1a1a"; x.font = "bold 84px Arial"; x.textAlign = "center"; x.fillText("M", 64, 94); })) }), -37.6, 3.9, -4.2);
  mtr.rotation.x = Math.PI / 2;
  // devant la presse : présentoirs à journaux et l'enseigne « PRESSE » en carotte ; devant la boulangerie : la terrasse
  const alu = A.mat({ color: 0xa9adb0, metalness: .6, roughness: .35 });
  // la « carotte » du tabac-presse, accrochée au mur par sa potence
  A.ajoute(new THREE.BoxGeometry(.05, .05, .75), fer, 9.7, 4.75, 6.4);
  const carotte = A.ajoute(new THREE.CylinderGeometry(.2, .2, .8, 16), A.mat({ map: tex(toile(256, 64, (x, w, h) => { x.fillStyle = "#e9a43a"; x.fillRect(0, 0, w, h); x.fillStyle = "#c0392b"; x.fillRect(0, h / 2 - 9, w, 18); x.fillStyle = "#fff"; x.font = "bold 13px Arial"; x.textAlign = "center"; x.fillText("PRESSE    PRESSE", w / 2, h / 2 + 5); })) }), 9.7, 4.3, 6.05);
  carotte.rotation.z = .45;
  // les présentoirs à journaux : un pied en métal, des magazines rangés en gradins
  for (let k = 0; k < 3; k++) { const px = 8.7 - k * 1.1;
    const p = A.ajoute(new THREE.BoxGeometry(.9, 1.05, .06), A.mat({ map: tex(toile(90, 105, (x, w, h) => { x.fillStyle = "#2b2b2b"; x.fillRect(0, 0, w, h); for (let i = 0; i < 12; i++) { x.fillStyle = `hsl(${alea() * 360}, 60%, ${45 + alea() * 25}%)`; x.fillRect(4 + (i % 3) * 29, 4 + Math.floor(i / 3) * 25, 26, 22); x.fillStyle = "rgba(255,255,255,.7)"; x.fillRect(7 + (i % 3) * 29, 8 + Math.floor(i / 3) * 25, 16, 3); } })) }), px, .75, 6.3);
    p.rotation.x = .18; p.rotation.y = Math.PI;
    for (const s of [-.4, .4]) A.ajoute(new THREE.CylinderGeometry(.015, .015, .9, 6), alu, px + s, .45, 6.42, false); }
  for (const tx of [-.6, 1.3, 3.2]) {
    A.ajoute(new THREE.BoxGeometry(.7, .03, .7), A.mat({ color: 0xd5d6d2 }), tx, .74, 5.75); A.ajoute(new THREE.CylinderGeometry(.03, .03, .74, 8), alu, tx, .37, 5.75);
    for (const s of [-1, 1]) { const c = new THREE.Group(); c.position.set(tx + s * .55, 0, 5.75); c.rotation.y = s * Math.PI / 2; scene.add(c);
      const assise = new THREE.Mesh(new THREE.BoxGeometry(.42, .04, .42), alu); assise.position.y = .46; c.add(assise);
      const dos = new THREE.Mesh(new THREE.BoxGeometry(.42, .42, .03), alu); dos.position.set(0, .68, -.2); c.add(dos);
      for (const [a, b] of [[-.18, -.18], [.18, -.18], [-.18, .18], [.18, .18]]) { const pi = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, .46, 5), alu); pi.position.set(a, .23, b); c.add(pi); } } }
  // les vitrines s'allument la nuit
  for (const [x, w] of [[7.4, 5], [.4, 8.4], [19.6, 7.6], [-46, 16]]) { const v = new THREE.Mesh(new THREE.PlaneGeometry(w, 2.3), new THREE.MeshBasicMaterial({ color: 0xffb860, transparent: true, opacity: .3, blending: THREE.AdditiveBlending, depthWrite: false })); v.rotation.y = Math.PI; v.position.set(x, 1.75, 6.77); v.visible = false; scene.add(v); L.nuitObjets.push(v); }

  // le jour, une lumière douce éclaire aussi les façades d'en face (tournées au nord)
  const appoint = new THREE.DirectionalLight(0xfff4e2, 1.25); appoint.position.set(12, 26, -40); appoint.target.position.set(0, 0, 0); scene.add(appoint, appoint.target); L.lumiereJour = appoint;
  // la nuit : le fond du porche s'assombrit, une lanterne éclaire l'entrée
  const fondNuit = new THREE.Mesh(new THREE.PlaneGeometry(.01, .01), new THREE.MeshBasicMaterial({ color: 0x232838 })); fondNuit.position.set(0, -5, FZ - 13.85); fondNuit.visible = false; scene.add(fondNuit); L.nuitObjets.push(fondNuit);
  const lanterne = new THREE.PointLight(0xffd59a, 30, 12, 1.5); lanterne.position.set(0, 4.1, FZ + .6); lanterne.visible = false; scene.add(lanterne); L.nuitObjets.push(lanterne);
  // la petite plaque « République française » à gauche du porche
  emaille(.5, .34, (c, w, h) => { c.fillStyle = "#f7f5ef"; c.fillRect(0, 0, w, h); c.fillStyle = "#1d3f73"; c.fillRect(8, 8, 18, h - 16); c.fillStyle = "#c8102e"; c.fillRect(44, 8, 18, h - 16); c.fillStyle = "#1d3f73"; c.font = "bold 13px Georgia"; c.textAlign = "left"; c.fillText("RÉPUBLIQUE", 68, 30); c.fillText("FRANÇAISE", 68, 48); }, -4.75, 3.0, FZ + .04);

  /* --- où l'on peut marcher, la caméra, les passages --- */
  // la grille noire (z = -7,5) ne s'ouvre qu'au portillon (x de 0,2 à 1,4)
  L.limites = (x, z) => (x > -62 && x < 62 && z > -7.2 && z < 6.4) || (x > -35.5 && x < -28.5 && z > -24 && z < 24)
    || (Math.abs(x) < 2.3 && z > -12.9 && z <= -7.9) || (x > .25 && x < 1.35 && z > -7.95 && z <= -7.15)
    // le passage sous le porche (sans traverser les plantes, l'armoire rouge ni la borne de la barrière)
    || (Math.abs(x) < 2.0 && z <= -12 && z > -25.7 && !(Math.abs(x) > 1.45 && z < -24.6) && !(x > 1.6 && z < -23.2 && z > -24.6) && !(x > 1.3 && Math.abs(z + 15.2) < .3));

  // au bout du passage : la cour d'honneur (toucher le fond du passage y mène tout de suite)
  L.portails.push({ dans: (x, z) => Math.abs(x) < 2.3 && z < -25.4, vers: "grande", arrivee: [0, 13.6] });
  raccourci(L, scene, [4.6, 4.3, .6], [0, 2.2, -25.75], { vers: "grande", arrivee: [0, 13.6] });
  // la caméra reste sous la voûte quand on est dans le passage
  L.contraindreCam = (pos, moi) => { if (moi.g.position.z < -11.6) { pos.x = Math.max(-2.1, Math.min(2.1, pos.x)); pos.y = Math.min(pos.y, 3.7); pos.z = Math.max(-25.6, Math.min(-3, pos.z)); return true; } };
  L.anim = (temps) => {
    // le drapeau ondule
    const p = geoD.attributes.position; for (let i = 0; i < p.count; i++) { const u = (baseD[i * 3] + 1.1) / 2.2; p.array[i * 3 + 2] = Math.sin(temps / 380 - u * 5 + baseD[i * 3 + 1] * .8) * .16 * u; }
    p.needsUpdate = true; geoD.computeVertexNormals();
    if (L.nuit) for (const s of L.silhouettes) animerSilhouette(s, temps);
  };
  // le chef de poste reste de ce côté-ci de la grille noire : il ne sort pas dans la rue
  L.horsPNJ = (x, z) => z > -8.2; L.departPNJ = [0, -10.5];
  // la circulation : de temps en temps une voiture des années 80-90, ou un bus parisien, descend la rue
  circulation(L, scene);
  L.depart = [.8, -5.2]; L.taille = 1.85; L.suivi = { d: 7.5, h: 8.5, av: 3, vy: 2 }; L.fov = [60, 72];
  L.boite = [-63, 63, -11.8, 6.3]; L.zone = [-62, 62, -26, 24];
  L.cam = { pos: [.8, 8.5, 2.3], vise: [.8, 2, -8] };
}

// un porche ou une porte qu'on touche une fois pour passer directement de l'autre côté (zone invisible)
function raccourci(L, scene, [w, h, d], [x, y, z], cible) {
  const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshBasicMaterial({ visible: false })); o.position.set(x, y, z); scene.add(o);
  (L.raccourcis = L.raccourcis || []).push({ obj: o, ...cible });
}
// la façade du bâtiment du fond de la cour d'honneur (brique, balcons, socle, porche, horloge) — vue aussi depuis le passage de la rue
function toileFondCour() {
  const socle = 6.4;
  return toile(1760, 1080, (x, w, h) => {      // 40 px par mètre
      const ps = socle * 40;
      briques(x, w, h, 0, h - ps, 10);
      pierre(x, 0, h - ps, w, ps, "#e8e0cf");
      x.fillStyle = "#d8cfbc"; x.fillRect(0, h - ps - 8, w, 12); x.fillRect(0, h - 160, w, 6);   // corniche du socle, bandeau
      x.fillStyle = "#efe9dc"; x.fillRect(0, 0, w, 14);                                            // acrotère
      // 7 étages : fenêtres, et une colonne sur deux avec balcons blancs
      const cols = 14, pas = w / cols;
      for (let r = 0; r < 7; r++) for (let c = 0; c < cols; c++) {
        const X = c * pas + pas / 2 - 30, Y = 34 + r * 112;
        fenetre(x, X, Y, 60, 74, "#f1ece2", false);
        if (c % 2 === 1) { x.fillStyle = "#fbfaf6"; x.fillRect(X - 16, Y + 70, 92, 20); x.fillStyle = "#cfc9bd"; x.fillRect(X - 16, Y + 90, 92, 5);
          x.strokeStyle = "rgba(60,60,60,.55)"; x.lineWidth = 2; for (let k = 0; k < 9; k++) { x.beginPath(); x.moveTo(X - 12 + k * 11, Y + 70); x.lineTo(X - 12 + k * 11, Y + 50); x.stroke(); }
          x.fillStyle = "rgba(60,60,60,.6)"; x.fillRect(X - 16, Y + 48, 92, 3); }
      }
      // socle : portes et grandes baies de part et d'autre du passage, l'encadrement du passage
      const cx = w / 2;
      // une porte vitrée de chaque côté du porche, et au-delà des voûtes de garage
      for (const s of [-1, 1]) for (const [d, L] of [[124, 66], [220, 110], [400, 110], [580, 110], [760, 110]]) { const X = cx + s * d - (s < 0 ? L : 0);
        x.fillStyle = "#f4f0e8"; x.fillRect(X, h - 180, L, 140); x.strokeStyle = "#cbbfa8"; x.lineWidth = 5; x.strokeRect(X, h - 180, L, 140);
        x.strokeStyle = "#d9d0bf"; x.lineWidth = 3; x.beginPath(); x.moveTo(X + L / 2, h - 180); x.lineTo(X + L / 2, h - 40); x.stroke(); }
      x.fillStyle = "#ded4c0"; x.fillRect(cx - 112, h - 196, 224, 16);          // linteau du passage carré
      // l'horloge ronde, centrée au-dessus du porche carré
      const hx = cx, hy = h - 226;
      x.fillStyle = "#fff"; x.beginPath(); x.arc(hx, hy, 25, 0, 7); x.fill(); x.lineWidth = 5; x.strokeStyle = "#222"; x.stroke();
      x.fillStyle = "#222"; for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; x.fillRect(hx + Math.cos(a) * 19 - 1.5, hy + Math.sin(a) * 19 - 1.5, 3, 3); }
      x.lineWidth = 4; x.lineCap = "round"; x.beginPath(); x.moveTo(hx, hy); x.lineTo(hx, hy - 16); x.moveTo(hx, hy); x.lineTo(hx + 12, hy + 4); x.stroke();
  });
}
// le décor du passage sous le porche (côté rue en FZ, côté cour en FZ - 14) ; servi dans la rue, et aussi dans la cour d'honneur pour qu'il se prolonge
function decorPassage(A, T, L, scene, FZ) {
  const PZ0 = FZ, PZ1 = FZ - 14, PL = 2.4, fer2 = A.mat({ color: 0x141414, roughness: .45, metalness: .5 });
  const pav = A.ajoute(new THREE.PlaneGeometry(PL * 2, 14), A.mat({ map: tex(T.paves, 2.5, 7), color: 0x9a948a }), 0, .012, FZ - 7, false); pav.rotation.x = -Math.PI / 2;
  for (const sg of [-1, 1]) {
    A.ajoute(new THREE.BoxGeometry(.75, .14, 11.2), A.mat({ color: 0xbdb6a8 }), sg * (PL - .375), .07, FZ - 8.2);                 // le trottoir le long du mur
    A.ajoute(new THREE.BoxGeometry(.06, .15, 11.2), A.mat({ color: 0x9c968b }), sg * (PL - .75), .075, FZ - 8.2, false);         // sa bordure
    // le grand battant noir, ouvert contre le mur : panneaux, médaillons en fer, clous
    const bat = new THREE.Group(); bat.position.set(sg * (PL - .06), 0, FZ - 1.45); scene.add(bat);
    const pan = new THREE.Mesh(new THREE.BoxGeometry(.1, 4.2, 2.6), A.mat({ color: 0x1b1d1f, roughness: .55 })); pan.position.y = 2.1; pan.castShadow = true; bat.add(pan);
    for (const [yy, hh] of [[1.0, 1.3], [2.75, 1.9]]) for (const zz of [-.62, .62]) { const m = new THREE.Mesh(new THREE.BoxGeometry(.04, hh, 1.0), A.mat({ color: 0x24272a, roughness: .5 })); m.position.set(-sg * .07, yy, zz); bat.add(m); }
    for (const [yy, zz] of [[1.6, -.62], [1.6, .62], [3.0, -.62], [3.0, .62]]) { const o = new THREE.Mesh(new THREE.TorusGeometry(.16, .035, 8, 20), fer2); o.rotation.y = Math.PI / 2; o.position.set(-sg * .1, yy, zz); bat.add(o);
      const c = new THREE.Mesh(new THREE.SphereGeometry(.06, 10, 8), fer2); c.position.set(-sg * .1, yy, zz); bat.add(c); }
    const poignee = new THREE.Mesh(new THREE.BoxGeometry(.05, .05, .4), A.mat({ color: 0x9a9da1, metalness: .7 })); poignee.position.set(-sg * .1, 2.05, -1.0); bat.add(poignee);
    // les arceaux noirs au pied des battants
    const arc = A.ajoute(new THREE.TorusGeometry(.32, .04, 8, 16, Math.PI), fer2, sg * (PL - .35), 0, FZ - .5); arc.rotation.y = Math.PI / 2;
    // les lampes noires, en haut des murs, vers le fond
    A.ajoute(new THREE.BoxGeometry(.18, .12, .4), fer2, sg * (PL - .09), 3.75, FZ - 10.8, false);
    // les plantes en pot, au bout du passage
    A.ajoute(new THREE.CylinderGeometry(.28, .22, .5, 14), A.mat({ color: 0xd8d2c6 }), sg * (PL - .45), .39, FZ - 13.2);
    for (let k = 0; k < 9; k++) { const f = A.ajoute(new THREE.ConeGeometry(.14, .9, 5), A.mat({ color: k % 2 ? 0x3c6b32 : 0x4f8a3e, roughness: 1 }), sg * (PL - .45) + Math.cos(k * .7) * .2, 1.0, FZ - 13.2 + Math.sin(k * .7) * .2);
      f.rotation.set(Math.sin(k * 1.3) * .7, 0, Math.cos(k * 1.3) * .7); }
  }
  // à gauche : la porte du poste de police
  const porteMur = (sg, z, titre) => {
    const g = new THREE.Group(); g.position.set(sg * (PL - .02), 0, z); g.rotation.y = sg > 0 ? -Math.PI / 2 : Math.PI / 2; scene.add(g);
    const cadre = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.65, .06), A.mat({ color: 0xcfc5ae })); cadre.position.y = 1.47; g.add(cadre);
    const p = new THREE.Mesh(new THREE.BoxGeometry(1.15, 2.4, .08), A.mat({ color: 0x8a6a45, roughness: .55 })); p.position.y = 1.34; g.add(p);
    const v = new THREE.Mesh(new THREE.PlaneGeometry(.75, .9), A.mat({ color: 0x9fb3c0, roughness: .2 })); v.position.set(0, 1.85, .05); g.add(v);
    const pg = new THREE.Mesh(new THREE.BoxGeometry(.05, .2, .06), A.mat({ color: 0xc9a227, metalness: .7 })); pg.position.set(.42, 1.2, .07); g.add(pg);
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(.9, .26), new THREE.MeshStandardMaterial({ map: tex(toile(270, 78, (x, w, h) => { x.fillStyle = "#1d3f73"; x.fillRect(0, 0, w, h); x.strokeStyle = "#f4f1e6"; x.lineWidth = 3; x.strokeRect(4, 4, w - 8, h - 8);
      x.fillStyle = "#f4f1e6"; x.font = "bold 26px Arial"; x.textAlign = "center"; x.fillText(titre, w / 2, 50); })) })); pl.position.set(0, 2.95, .05); g.add(pl);
    return g; };
  porteMur(-1, FZ - 6.2, "POSTE DE POLICE");
  raccourci(L, scene, [.6, 2.5, 1.4], [-(PL - .2), 1.3, FZ - 6.2], { info: "🚓 Le poste de police : la porte est fermée pour l'instant… Envoie des photos de l'intérieur et je te l'ouvre !" });
  // sur le mur de droite (face à la cour), sous vitrine : l'affiche du garde républicain de 1887 (Jeanniot), grandeur nature, de la largeur d'une porte
  const imgA = new Image(), tA = new THREE.Texture(imgA); tA.colorSpace = THREE.SRGBColorSpace; imgA.onload = () => { tA.needsUpdate = true; }; imgA.src = "images/affiche-1887.jpg";
  const vit = new THREE.Group(); vit.position.set(PL - .02, 1.38, FZ - 10.2); vit.rotation.y = -Math.PI / 2; scene.add(vit);
  raccourci(L, scene, [.25, 2.4, 1.2], [PL - .1, 1.38, FZ - 10.2], { affiche: "images/affiche-1887.jpg" });   // on la touche : elle s'affiche en grand
  const cadreV = new THREE.Mesh(new THREE.BoxGeometry(1.14, 2.36, .08), A.mat({ color: 0x3a2a1c, roughness: .4 })); cadreV.position.z = .04; vit.add(cadreV);
  const aff = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 2.2), new THREE.MeshStandardMaterial({ map: tA, roughness: .9 })); aff.position.z = .085; vit.add(aff);
  const verreV = new THREE.Mesh(new THREE.PlaneGeometry(1.04, 2.24), new THREE.MeshStandardMaterial({ color: 0xdfeaf0, transparent: true, opacity: .12, roughness: .05, metalness: .3 })); verreV.position.z = .1; vit.add(verreV);
  // à droite, vers le fond : l'armoire rouge, la borne de la barrière et sa lisse blanche, posée en travers
  A.ajoute(new THREE.BoxGeometry(.3, 1.3, .5), A.mat({ color: 0xc8202a, roughness: .5 }), PL - .2, .79, FZ - 11.6);
  // la barrière, côté rue, levée (on passe librement)
  A.ajoute(new THREE.BoxGeometry(.32, 1.0, .32), A.mat({ color: 0xd8262e, roughness: .45 }), 1.55, .5, FZ - 3.2);
  A.ajoute(new THREE.BoxGeometry(.1, 2.95, .08), A.mat({ color: 0xf2f2ee, roughness: .5 }), 1.55, 2.5, FZ - 3.2);
  for (let k = 0; k < 5; k++) A.ajoute(new THREE.BoxGeometry(.105, .25, .085), A.mat({ color: 0xc8202a }), 1.55, 1.3 + k * .55, FZ - 3.2, false);
  // le panneau « 10 » sur le pilier de gauche, la caméra de surveillance, le plafonnier
  const dix = A.ajoute(new THREE.CircleGeometry(.24, 24), new THREE.MeshStandardMaterial({ map: tex(toile(96, 96, (x) => { x.fillStyle = "#fff"; x.beginPath(); x.arc(48, 48, 46, 0, 7); x.fill(); x.strokeStyle = "#c8102e"; x.lineWidth = 10; x.beginPath(); x.arc(48, 48, 40, 0, 7); x.stroke();
    x.fillStyle = "#111"; x.font = "bold 40px Arial"; x.textAlign = "center"; x.fillText("10", 48, 62); })) }), -(PL - .03), 2.3, FZ - 12.9, false); dix.rotation.y = Math.PI / 2;
  A.ajoute(new THREE.BoxGeometry(.12, .1, .3), A.mat({ color: 0xe6e6e6 }), -(PL - .12), 3.9, FZ - 13.4, false);
  const plaf = A.ajoute(new THREE.PlaneGeometry(PL * 2, 14), A.mat({ color: 0xece5d6, roughness: 1, emissive: 0x6a6458 }), 0, 4.38, FZ - 7, false); plaf.rotation.x = Math.PI / 2;
  A.ajoute(new THREE.BoxGeometry(1.2, .04, .5), new THREE.MeshBasicMaterial({ color: 0xfff6e0 }), 0, 4.35, FZ - 7, false);
  const jourP = new THREE.PointLight(0xfff2dc, 14, 12, 1.4); jourP.position.set(0, 3.9, FZ - 7); scene.add(jourP);
  return jourP;
}
/* la deuxième cour, derrière le bâtiment à l'horloge (passage de z = -18 à -30), de z = -30 à -44, entre x = -11 et 11 :
   pavés, le verso du bâtiment à l'horloge (rez-de-chaussée blanc, étages en brique à bandeaux, balconnets noirs), l'autre bâtiment en face, pareil,
   et son passage carré qui laisse voir encore une cour plus loin ; de chaque côté, des murs bas blancs et des étages de brique */
const C2 = { z0: -30, z1: -44, x: 11 };
function toileVerso(largeur, hauteur, avecPassage) {
  return toile(Math.round(largeur * 40), Math.round(hauteur * 40), (x, w, h) => {
    const rdc = 5.4 * 40, cx = w / 2;
    // les étages : la brique rouge, en bandeaux horizontaux
    x.fillStyle = "#9a4a38"; x.fillRect(0, 0, w, h - rdc);
    for (let y = 0; y < h - rdc; y += 12) { x.fillStyle = y % 24 ? "rgba(0,0,0,.18)" : "rgba(255,220,200,.08)"; x.fillRect(0, y, w, 3); }
    for (let i = 0; i < 60; i++) { x.fillStyle = `rgba(${alea() < .5 ? "60,20,10" : "200,120,90"},.08)`; x.fillRect(alea() * w, alea() * (h - rdc), 30 + alea() * 120, 8); }
    // les fenêtres des étages : encadrement blanc, volets roulants ou rideaux, balconnet noir
    const pas = 3.6 * 40, n = Math.floor(w / pas);
    for (let et = 0; et < 6; et++) for (let c = 0; c < n; c++) { const X = (c + .5) * pas - 34 + (w - n * pas) / 2, Y = h - rdc - 34 - 110 - et * 3 * 40;
      if (Y < 10) continue;
      x.fillStyle = "#f2efe8"; x.fillRect(X - 6, Y - 6, 80, 112);
      const g = x.createLinearGradient(0, Y, 0, Y + 100); g.addColorStop(0, "#5d6f80"); g.addColorStop(1, "#2f3b47"); x.fillStyle = g; x.fillRect(X, Y, 68, 100);
      if (alea() < .35) { x.fillStyle = "#ecebe6"; x.fillRect(X, Y, 68, 40 + alea() * 50); x.fillStyle = "rgba(0,0,0,.08)"; for (let l = Y; l < Y + 90; l += 5) x.fillRect(X, l, 68, 1); }
      x.fillStyle = "#f2efe8"; x.fillRect(X + 32, Y, 4, 100);
      x.strokeStyle = "#141414"; x.lineWidth = 2.5; x.strokeRect(X - 4, Y + 70, 76, 28); for (let k = X; k < X + 72; k += 6) { x.beginPath(); x.moveTo(k, Y + 70); x.lineTo(k, Y + 98); x.stroke(); } }
    // le rez-de-chaussée blanc, sa corniche
    x.fillStyle = "#e9e6df"; x.fillRect(0, h - rdc, w, rdc); x.fillStyle = "#d9d5cc"; x.fillRect(0, h - rdc, w, 14); x.fillStyle = "rgba(0,0,0,.12)"; x.fillRect(0, h - rdc + 14, w, 3);
    x.fillStyle = "#cfcac0"; x.fillRect(0, h - 24, w, 24);
    // quelques portes vitrées, les petites appliques noires, les boîtiers rouges
    for (const d of [-7.5, 7.5, -15, 15]) { const X = cx + d * 40 - 36; if (X < 0 || X > w - 72) continue;
      x.fillStyle = "#cfcac0"; x.fillRect(X - 6, h - 150, 84, 150); x.fillStyle = "#2b3138"; x.fillRect(X, h - 144, 72, 144); x.fillStyle = "#5c6670"; x.fillRect(X + 34, h - 144, 4, 144); }
    for (const d of [-4, 4]) { x.fillStyle = "#222"; x.fillRect(cx + d * 40 - 10, h - rdc + 40, 20, 8); x.fillStyle = "#c8202a"; x.fillRect(cx + d * 40 - 6, h - 120, 12, 16); }
    // le passage carré, au centre (4,8 m × 4,4 m), sous son linteau
    x.fillStyle = "#dedad2"; x.fillRect(cx - 2.6 * 40, h - 4.6 * 40, 5.2 * 40, 8);
    if (avecPassage) x.clearRect(cx - 2.4 * 40, h - 4.4 * 40, 4.8 * 40, 4.4 * 40);
  });
}
function deuxiemeCour(A, L, scene) {
  const { z0, z1, x: X } = C2, prof = z0 - z1, zc = (z0 + z1) / 2;
  const pav = A.ajoute(new THREE.PlaneGeometry(X * 2, prof), A.mat({ map: tex(textures().paves, X, prof / 2) }), 0, .012, zc, false); pav.rotation.x = -Math.PI / 2;
  const pasS = A.ajoute(new THREE.PlaneGeometry(4.8, 12), A.mat({ map: tex(textures().paves, 2.4, 6) }), 0, .012, -24, false); pasS.rotation.x = -Math.PI / 2;   // le sol du passage
  // le verso du bâtiment à l'horloge (face à la deuxième cour), percé du passage
  const verso = A.ajoute(new THREE.PlaneGeometry(44, 27), A.mat({ map: tex(toileVerso(44, 27, true)), alphaTest: .5 }), 0, 13.5, z0 - .03, false); verso.rotation.y = Math.PI;
  // le bâtiment d'en face, pareil, et son passage
  const face = new THREE.Shape(); face.moveTo(-22, 0); face.lineTo(22, 0); face.lineTo(22, 24); face.lineTo(-22, 24); face.closePath();
  const tr = new THREE.Path(); tr.moveTo(-2.4, 0); tr.lineTo(-2.4, 4.4); tr.lineTo(2.4, 4.4); tr.lineTo(2.4, 0); tr.closePath(); face.holes.push(tr);
  const tF = tex(toileVerso(44, 24, false)); tF.repeat.set(1 / 44, 1 / 24); tF.offset.set(.5, 0);
  A.ajoute(new THREE.ExtrudeGeometry(face, { depth: 12, bevelEnabled: false }), [A.mat({ map: tF }), A.mat({ color: 0xd9d4ca })], 0, 0, z1 - 12);
  // au bout de ce passage-là : encore une cour, au loin
  const loin = tex(toile(512, 400, (x, w, h) => { x.fillStyle = "#e8dfcf"; x.fillRect(0, 0, w, h); x.fillStyle = "#d9b8a8"; x.fillRect(0, 0, w, 110);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) { x.fillStyle = "#f4f1ea"; x.fillRect(16 + c * 70, 30 + r * 80, 46, 56); x.fillStyle = "#6c7d8c"; x.fillRect(20 + c * 70, 34 + r * 80, 38, 48); }
    x.fillStyle = "#8b8780"; x.fillRect(0, h - 50, w, 50); }));
  A.ajoute(new THREE.PlaneGeometry(14, 11), new THREE.MeshBasicMaterial({ map: loin }), 0, 5.5, z1 - 22, false);
  const solL = A.ajoute(new THREE.PlaneGeometry(14, 10), A.mat({ map: tex(textures().paves, 6, 4) }), 0, .01, z1 - 17, false); solL.rotation.x = -Math.PI / 2;
  // les deux côtés de la cour : rez-de-chaussée blanc, étages de brique
  // de chaque côté : un haut mur de pierre grise et noire, sans fenêtres
  for (const sg of [-1, 1]) { graine = sg > 0 ? 91 : 93;
    const pierreG = tex(toile(560, 800, (x, w, h) => { x.fillStyle = "#2a2a2c"; x.fillRect(0, 0, w, h);
      for (let y = 0, r = 0; y < h; y += 34, r++) for (let X0 = -(r % 2) * 40; X0 < w; X0 += 80) { const v = alea();
        x.fillStyle = v < .3 ? `hsl(220, 4%, ${14 + alea() * 8}%)` : `hsl(30, 3%, ${38 + alea() * 22}%)`; x.fillRect(X0 + 2, y + 2, 76, 30);
        for (let k = 0; k < 14; k++) { x.fillStyle = `rgba(${alea() < .5 ? "0,0,0" : "255,255,255"},${.05 + alea() * .1})`; x.fillRect(X0 + 3 + alea() * 70, y + 3 + alea() * 26, 3, 3); } } }));
    pierreG.repeat.set(2.5, 3); const m = A.mat({ map: pierreG, roughness: .95 }); A.ajoute(new THREE.BoxGeometry(6, 20, prof), [m, m, A.mat({ color: 0x4a4a4c }), m, m, m], sg * (X + 3), 10, zc); }
  /* en face du local électrique, sur toute la longueur du mur : l'ancienne déchetterie de la caserne, quatre portes marron ;
     l'une est restée ouverte : on y voit des meubles et des matelas entassés */
  { const xm = -X, P = 2.4, xf = xm + P, LG = 12, HT2 = 2.8, cr = A.mat({ color: 0xe6dfcf, roughness: .9 });
    const portes = [-4.5, -1.5, 1.5, 4.5], ouverte = 2;   // (position le long du mur, depuis la gauche du dessin)
    const fac = tex(toile(LG * 50, HT2 * 50, (x, w, h) => { x.fillStyle = "#e6dfcf"; x.fillRect(0, 0, w, h); x.fillStyle = "#d4ccba"; x.fillRect(0, 0, w, 12); x.fillRect(0, h - 14, w, 14);
      portes.forEach((u, i) => { const X0 = (u + LG / 2 - .8) * 50, Y0 = h - 2.15 * 50, PW = 1.6 * 50, PH = 2.15 * 50;
        x.fillStyle = "#cfc6b2"; x.fillRect(X0 - 6, Y0 - 6, PW + 12, PH + 6);
        if (i === ouverte) { x.clearRect(X0, Y0, PW, PH); return; }
        x.fillStyle = "#6b4226"; x.fillRect(X0, Y0, PW, PH); x.fillStyle = "#5a361e"; x.fillRect(X0 + PW / 2 - 1, Y0, 2, PH);
        for (let k = 0; k < 2; k++) for (let j = 0; j < 2; j++) { x.strokeStyle = "#4c2c17"; x.lineWidth = 2; x.strokeRect(X0 + 6 + k * PW / 2, Y0 + 8 + j * PH / 2, PW / 2 - 12, PH / 2 - 16); }
        x.fillStyle = "#b9bcc2"; x.fillRect(X0 + PW / 2 - 8, Y0 + PH / 2, 4, 10); }); }));
    const front = A.ajoute(new THREE.PlaneGeometry(LG, HT2), A.mat({ map: fac, alphaTest: .5, side: THREE.DoubleSide }), xf, HT2 / 2, zc, false); front.rotation.y = Math.PI / 2;
    A.ajoute(new THREE.BoxGeometry(P + .25, .2, LG + .25), A.mat({ color: 0xd4ccba }), xm + P / 2, HT2 + .1, zc);       // le toit-terrasse et sa corniche
    for (const s2 of [-1, 1]) A.ajoute(new THREE.BoxGeometry(P, HT2, .2), cr, xm + P / 2, HT2 / 2, zc + s2 * (LG / 2 - .1));
    // l'intérieur de la case ouverte (la porte de gauche du dessin → côté z), sa porte rabattue, les meubles et les matelas
    const zo = zc - portes[ouverte];
    for (const s2 of [-1, 1]) A.ajoute(new THREE.BoxGeometry(P - .1, HT2 - .05, .12), A.mat({ color: 0xb8b0a0 }), xm + P / 2, HT2 / 2, zo + s2 * 1.4);
    A.ajoute(new THREE.BoxGeometry(.1, HT2, 2.8), A.mat({ color: 0x9a9284 }), xm + .05, HT2 / 2, zo);
    const solI = A.ajoute(new THREE.PlaneGeometry(P, 2.8), A.mat({ color: 0x6f6a62 }), xm + P / 2, .015, zo, false); solI.rotation.x = -Math.PI / 2;
    A.ajoute(new THREE.BoxGeometry(P, .05, 2.8), A.mat({ color: 0x8a847a }), xm + P / 2, HT2 - .05, zo, false);
    const bat = A.ajoute(new THREE.BoxGeometry(.05, 2.1, .8), A.mat({ color: 0x6b4226, roughness: .6 }), xf + .55, 1.07, zo + .8 + .55); bat.rotation.y = -1.2;   // le battant ouvert
    const bois = A.mat({ color: 0x7a4a26, roughness: .7 }), boisC = A.mat({ color: 0xa8743f, roughness: .7 });
    A.ajoute(new THREE.BoxGeometry(.6, 1.9, 1.0), bois, xm + .4, .95, zo + .7);                               // une vieille armoire
    A.ajoute(new THREE.BoxGeometry(.02, 1.7, .45), A.mat({ color: 0x5a361e }), xm + .71, .95, zo + .45, false);
    for (const [dx, dz, a, c] of [[.9, -.5, .25, 0xd8d0e8], [1.05, -.75, .3, 0xe8dcc8], [1.2, -1.0, .35, 0xc8d8e0]]) {   // des matelas debout, appuyés
      const mt = A.ajoute(new THREE.BoxGeometry(.18, 1.9, 1.3), A.mat({ color: c, roughness: 1 }), xm + dx, .95, zo + dz); mt.rotation.z = a; }
    A.ajoute(new THREE.BoxGeometry(.9, .45, .55), boisC, xm + 1.5, .23, zo + .6);                            // une table de nuit, une chaise renversée, des cartons
    A.ajoute(new THREE.BoxGeometry(.45, .04, .45), boisC, xm + 1.6, .73, zo + .2).rotation.z = 1.2;
    for (const [dx, dz, hh] of [[.45, -.2, .45], [.5, .25, .35], [.48, .02, .3]]) A.ajoute(new THREE.BoxGeometry(.5, hh, .45), A.mat({ color: 0xb08d5a, roughness: 1 }), xm + dx, hh / 2 + (dz === .02 ? .45 : 0), zo + dz + 1.05);
    const li = new THREE.PointLight(0xffe2b0, 1.5, 4, 1.6); li.position.set(xm + 1.2, 2.3, zo); scene.add(li);
    // la case ouverte est un passage : de l'autre côté, la même caserne… à l'apocalypse (et l'on en ressort par là)
    L.portails.push({ dans: (x, z) => x < xf + 1.4 && Math.abs(z - zo) < .9, vers: "z-grande", arrivee: [xf + 2.2, zo], yaw: -Math.PI / 2, indice: [xf + 1, zo], entreeApo: true });
    raccourci(L, scene, [.4, 2.2, 1.6], [xf, 1.1, zo], { vers: "z-grande", entreeApo: true }); }
  /* entre les deux bâtiments, contre ce mur : l'ancien local électrique, une petite construction blanc crème à l'ancienne */
  { const cr = A.mat({ color: 0xece3cc, roughness: .9 }), crF = A.mat({ color: 0xd9ceb4 }), lx = X - 1.3, lw = 2.6, ll = 4, lh = 3;
    A.ajoute(new THREE.BoxGeometry(lw, lh, ll), cr, lx, lh / 2, zc);
    A.ajoute(new THREE.BoxGeometry(lw + .3, .22, ll + .3), crF, lx, lh + .11, zc);                        // la corniche
    A.ajoute(new THREE.BoxGeometry(lw + .1, .3, ll + .1), crF, lx, .15, zc);                                // le soubassement
    A.ajoute(new THREE.BoxGeometry(lw - .4, .5, ll - .4), A.mat({ color: 0x8a5a3c, roughness: .8 }), lx, lh + .45, zc);   // le petit toit de tuiles
    const face = lx - lw / 2 - .01;
    // la porte de fer peinte en vert sombre, ses grilles d'aération, le panneau « danger de mort »
    const porte = A.ajoute(new THREE.PlaneGeometry(1.1, 2.1), A.mat({ map: tex(toile(110, 210, (x, w, h) => { x.fillStyle = "#33463a"; x.fillRect(0, 0, w, h);
      x.strokeStyle = "#22302a"; x.lineWidth = 3; x.strokeRect(6, 6, w - 12, h - 12); x.fillStyle = "#1c2420"; for (const y0 of [24, 160]) for (let y = y0; y < y0 + 30; y += 6) x.fillRect(16, y, w - 32, 3);
      x.fillStyle = "#b9bcc2"; x.fillRect(w - 22, 100, 8, 16); })), roughness: .6 }), face, 1.05, zc, false); porte.rotation.y = -Math.PI / 2;
    const dg = A.ajoute(new THREE.PlaneGeometry(.36, .28), new THREE.MeshBasicMaterial({ map: tex(toile(144, 112, (x, w, h) => { x.fillStyle = "#f2c230"; x.fillRect(0, 0, w, h);
      x.fillStyle = "#111"; x.beginPath(); x.moveTo(w / 2, 10); x.lineTo(w / 2 + 26, 56); x.lineTo(w / 2 - 26, 56); x.closePath(); x.fill();
      x.fillStyle = "#f2c230"; x.font = "bold 26px Arial"; x.textAlign = "center"; x.fillText("⚡", w / 2, 50); x.fillStyle = "#111"; x.font = "bold 15px Arial"; x.fillText("DANGER DE MORT", w / 2, 82); x.font = "11px Arial"; x.fillText("Local électrique", w / 2, 100); })) }), face - .005, 2.35, zc, false);
    dg.rotation.y = -Math.PI / 2;
    for (const dz of [-1.35, 1.35]) { const gr = A.ajoute(new THREE.PlaneGeometry(.5, .35), A.mat({ map: tex(toile(100, 70, (x, w, h) => { x.fillStyle = "#cfc6b0"; x.fillRect(0, 0, w, h); x.fillStyle = "#3a3a3a"; for (let y = 8; y < h - 6; y += 8) x.fillRect(8, y, w - 16, 4); })) }), face, 2.2, zc + dz, false); gr.rotation.y = -Math.PI / 2; }
    const lampe = A.ajoute(new THREE.BoxGeometry(.14, .12, .22), A.mat({ color: 0x1a1a1a }), face - .07, 2.6, zc + .8, false); }
  /* dans le passage sous l'horloge, de part et d'autre : deux grands panneaux de liège, avec les informations punaisées (notes de service, fêtes, petites annonces) */
  const AFF = [
    [["NOTE DE SERVICE", "Le stationnement dans la", "cour d'honneur est réservé", "aux véhicules de service.", "", "Le Chef de corps"], "#fbf8ee", "#1d3f73"],
    [["BAL DU 14 JUILLET", "Salle des fêtes", "à partir de 21 h", "Orchestre et buvette", "Venez nombreux !"], "#fff3c4", "#b31b1b"],
    [["LOTO DE LA CASERNE", "Samedi 20 h 30", "Salle des fêtes", "Nombreux lots à gagner"], "#e3f1ff", "#1d3f73"],
    [["PLANNING DES GARDES", "Lun.  — 1re compagnie", "Mar.  — 2e compagnie", "Mer.  — 3e compagnie", "Jeu.  — 4e compagnie", "Ven.  — Escadron"], "#ffffff", "#222"],
    [["OBJETS TROUVÉS", "Un trousseau de clés,", "un képi, une écharpe.", "S'adresser au poste", "de police."], "#f4ffe6", "#2e6b3a"],
    [["À VENDRE", "Vélo de course", "bon état — 300 F", "Esc. B, 3e étage"], "#ffe6ea", "#8a1f2b"],
    [["ARBRE DE NOËL", "des enfants de la caserne", "Mercredi 14 h", "Inscriptions au", "vaguemestre"], "#fff7e0", "#2e6b3a"],
    [["RAPPEL", "Les poubelles sont", "sorties le mardi soir.", "Merci !"], "#fbf8ee", "#444"],
    [["TOURNOI DE PÉTANQUE", "Dimanche 10 h", "Cour d'honneur", "Équipes de 3"], "#e9f6ff", "#1d3f73"],
    [["COURS DE JUDO", "pour les enfants", "le jeudi à 17 h", "gymnase"], "#fff", "#b31b1b"],
  ];
  const panneau = (graineP) => toile(880, 300, (x, w, h) => { graine = graineP;
    x.fillStyle = "#5a3a1e"; x.fillRect(0, 0, w, h); x.fillStyle = "#b9875a"; x.fillRect(14, 14, w - 28, h - 28);   // le cadre de bois, le liège
    for (let i = 0; i < 4000; i++) { x.fillStyle = `rgba(${alea() < .5 ? "90,55,25" : "220,180,130"},${.25 + alea() * .3})`; x.fillRect(14 + alea() * (w - 28), 14 + alea() * (h - 28), 2, 2); }
    const ordre = AFF.slice().sort(() => alea() - .5);
    let X = 34;
    for (const [lignes, fond, encre] of ordre) { if (X > w - (graineP === 733 ? 290 : 150)) break;   // (sur le panneau de gauche, la place de l'affiche de DJ Manu)
      const pw = 120 + alea() * 50, ph = 150 + alea() * 80, Y = 30 + alea() * (h - ph - 50), a = (alea() - .5) * .12;
      x.save(); x.translate(X + pw / 2, Y + ph / 2); x.rotate(a);
      x.fillStyle = "rgba(0,0,0,.25)"; x.fillRect(-pw / 2 + 4, -ph / 2 + 5, pw, ph); x.fillStyle = fond; x.fillRect(-pw / 2, -ph / 2, pw, ph);
      x.fillStyle = encre; x.textAlign = "center"; x.font = "bold 14px Arial"; x.fillText(lignes[0], 0, -ph / 2 + 26, pw - 10);
      x.fillRect(-pw / 2 + 12, -ph / 2 + 34, pw - 24, 2); x.font = "12px Georgia";
      lignes.slice(1).forEach((l, i) => x.fillText(l, 0, -ph / 2 + 56 + i * 17, pw - 12));
      x.fillStyle = ["#c8102e", "#1f4e8c", "#e2b11f", "#2e8a4a"][Math.floor(alea() * 4)]; x.beginPath(); x.arc(0, -ph / 2 + 8, 5, 0, 7); x.fill();   // la punaise
      x.restore(); X += pw + 14 + alea() * 18; }
  });
  const panneauxLiege = []; let panneauGrand = null;
  for (const sg of [-1, 1]) { const g = new THREE.Group(); g.position.set(sg * (2.4 - .03), 1.75, -24); g.rotation.y = sg > 0 ? -Math.PI / 2 : Math.PI / 2; scene.add(g);
    const t = tex(panneau(sg > 0 ? 311 : 733)); panneauxLiege.push([sg, t.image]);
    const pl = new THREE.Mesh(new THREE.BoxGeometry(4.4, 1.5, .04), [A.mat({ color: 0x5a3a1e }), A.mat({ color: 0x5a3a1e }), A.mat({ color: 0x5a3a1e }), A.mat({ color: 0x5a3a1e }), A.mat({ map: t, roughness: .9 }), A.mat({ color: 0x5a3a1e })]);
    pl.position.z = .02; g.add(pl);
    if (sg < 0) {   // sur ce panneau-là : l'affiche de la soirée de DJ Manu (format A4), punaisée
      const im = new Image(), ta = new THREE.Texture(im); ta.colorSpace = THREE.SRGBColorSpace; im.onload = () => { ta.needsUpdate = true; }; im.src = "images/affiche-dj-manu.jpg";
      const af = new THREE.Mesh(new THREE.PlaneGeometry(.38, .68), new THREE.MeshStandardMaterial({ map: ta, roughness: .85 })); af.position.set(1.7, 0, .046); af.rotation.z = .03; g.add(af);
      // le panneau vu en grand : avec l'affiche de DJ Manu dessus, à sa place
      im.addEventListener("load", () => { const c0 = t.image, c = document.createElement("canvas"); c.width = c0.width * 2; c.height = c0.height * 2; const x = c.getContext("2d");
        x.drawImage(c0, 0, 0, c.width, c.height); x.save(); x.translate((1.7 + 2.2) / 4.4 * c.width, c.height / 2); x.rotate(-.03);
        const pw = .38 / 4.4 * c.width, ph = .68 / 1.5 * c.height; x.fillStyle = "rgba(0,0,0,.3)"; x.fillRect(-pw / 2 + 5, -ph / 2 + 6, pw, ph); x.drawImage(im, -pw / 2, -ph / 2, pw, ph);
        x.fillStyle = "#c8102e"; x.beginPath(); x.arc(0, -ph / 2 + 8, 7, 0, 7); x.fill(); x.restore();
        const r = (L.raccourcis || []).find(q => q.panneau === -1); if (r) r.affiche = c.toDataURL("image/jpeg", .9); else panneauGrand = c.toDataURL("image/jpeg", .9); });
      const pu = new THREE.Mesh(new THREE.SphereGeometry(.014, 8, 6), A.mat({ color: 0xc8102e })); pu.position.set(1.7, .32, .05); g.add(pu); } }
  // on touche une affiche ou un panneau : il s'affiche en grand (l'affiche de DJ Manu d'abord, elle est posée sur le panneau)
  raccourci(L, scene, [.3, .8, .5], [-2.3, 1.75, -25.7], { affiche: "images/affiche-dj-manu.jpg", affichePrio: true });
  for (const [sg, c] of panneauxLiege) raccourci(L, scene, [.4, 1.7, 4.6], [sg * 2.28, 1.75, -24], { affiche: (sg < 0 && panneauGrand) || c.toDataURL("image/jpeg", .9), panneau: sg });
  const lp = new THREE.PointLight(0xfff2dc, 5, 8, 1.4); lp.position.set(0, 3.9, -24); scene.add(lp);
  // une petite lumière le soir, au-dessus de chaque passage
  for (const z of [z0 - .3, z1 + .3]) { const l = new THREE.PointLight(0xffd59a, 10, 9, 1.6); l.position.set(0, 4.8, z); l.visible = false; scene.add(l); L.nuitObjets.push(l); }
}
/* la circulation de la rue du Faubourg-Poissonnière (sens unique) : des voitures des années 80-90 (couleurs au hasard)
   et, plus rarement, le bus parisien de l'époque (vert jade et blanc) ; jamais en continu, de temps en temps */
function circulation(L, scene) {
  const roues = new THREE.CylinderGeometry(.31, .31, .2, 14), noir = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: .8 });
  const jante = new THREE.MeshStandardMaterial({ color: 0xb8bcc2, metalness: .6, roughness: .4 }), vitre = new THREE.MeshStandardMaterial({ color: 0x2c3a46, roughness: .1, metalness: .3 });
  const phare = new THREE.MeshBasicMaterial({ color: 0xfff6d8 }), feu = new THREE.MeshBasicMaterial({ color: 0xc8102e }), chrome = new THREE.MeshStandardMaterial({ color: 0xd8dadd, metalness: .8, roughness: .25 });
  const COULEURS_80 = [0xc8102e, 0xf2f0ea, 0xd8c9a3, 0x1f4e8c, 0x2e6b3a, 0x8a8f96, 0xe2b11f, 0x6b1e2b, 0x3a3a3a, 0x9fc2d8, 0xd95f1e, 0x4b3a6b];
  const box = (g, w, h, d, m, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = true; g.add(o); return o; };
  const ajouterRoues = (g, xs, demiLarg) => { const r = []; for (const x of xs) for (const s of [-1, 1]) { const w = new THREE.Mesh(roues, noir); w.rotation.x = Math.PI / 2; w.position.set(x, .31, s * demiLarg); g.add(w);
    const j = new THREE.Mesh(new THREE.CylinderGeometry(.16, .16, .21, 10), jante); j.rotation.x = Math.PI / 2; j.position.copy(w.position); g.add(j); r.push(w, j); } return r; };
  // une voiture : carrosserie anguleuse, habitacle, pare-chocs noirs (façon R5, 205, R21, BX, Golf…) ; l'avant vers +x
  const voiture = () => { const g = new THREE.Group(), c = new THREE.MeshStandardMaterial({ color: COULEURS_80[Math.floor(Math.random() * COULEURS_80.length)], roughness: .45, metalness: .15 });
    const L2 = 3.6 + Math.random() * .9, H1 = .62, H2 = .52 + Math.random() * .1, l2 = 1.62, bicorps = Math.random() < .55;
    box(g, L2, H1, l2, c, 0, .32 + H1 / 2, 0);
    const lc = bicorps ? L2 * .55 : L2 * .45, xc = bicorps ? -L2 * .12 : -L2 * .02;
    box(g, lc, H2, l2 - .12, c, xc, .32 + H1 + H2 / 2, 0);
    for (const s of [-1, 1]) box(g, lc - .2, H2 - .14, .01, vitre, xc, .32 + H1 + H2 / 2, s * (l2 / 2 - .055));
    box(g, .02, H2 - .12, l2 - .3, vitre, xc + lc / 2 + .005, .32 + H1 + H2 / 2, 0); box(g, .02, H2 - .12, l2 - .3, vitre, xc - lc / 2 - .005, .32 + H1 + H2 / 2, 0);
    for (const sx of [-1, 1]) box(g, .12, .16, l2 + .04, noir, sx * (L2 / 2 + .02), .42, 0);            // pare-chocs noirs
    for (const s of [-1, 1]) { box(g, .03, .14, .3, phare, L2 / 2 + .01, .7, s * .52); box(g, .03, .12, .28, feu, -L2 / 2 - .01, .7, s * .55); }
    box(g, .02, .08, .6, chrome, L2 / 2 + .015, .58, 0);
    return { g, r: ajouterRoues(g, [L2 / 2 - .7, -L2 / 2 + .7], l2 / 2 - .05), v: 8.5 + Math.random() * 3, L: L2 }; };
  // le bus parisien des années 80-90 : long, carré, vert jade en bas, blanc en haut, bandeau vitré sombre, girouette avec le numéro
  const bus = () => { const g = new THREE.Group(), vert = new THREE.MeshStandardMaterial({ color: 0x2f8a6a, roughness: .5 }), blanc = new THREE.MeshStandardMaterial({ color: 0xf1efe8, roughness: .5 });
    const L2 = 11, l2 = 2.5;
    box(g, L2, 1.1, l2, vert, 0, .35 + .55, 0); box(g, L2, 1.75, l2, blanc, 0, 1.45 + .875, 0); box(g, L2, .14, l2, blanc, 0, 3.27, 0);
    for (const s of [-1, 1]) box(g, L2 - .6, 1.15, .01, vitre, -.1, 2.25, s * (l2 / 2 + .005));
    box(g, .02, 1.3, l2 - .2, vitre, L2 / 2 + .01, 2.15, 0);
    const n = String([20, 26, 30, 31, 32, 39, 42, 43, 48, 85][Math.floor(Math.random() * 10)]);
    const gir = new THREE.Mesh(new THREE.PlaneGeometry(1.6, .3), new THREE.MeshBasicMaterial({ map: tex(toile(256, 48, (x, w, h) => { x.fillStyle = "#111"; x.fillRect(0, 0, w, h); x.fillStyle = "#ffcf3a"; x.font = "bold 34px Arial"; x.textAlign = "center"; x.fillText(n + "  GARE DE L'EST", w / 2, 36); })) }));
    gir.rotation.y = Math.PI / 2; gir.position.set(L2 / 2 + .03, 3.0, 0); g.add(gir);
    for (const s of [-1, 1]) { box(g, .03, .18, .3, phare, L2 / 2 + .01, .75, s * .9); box(g, .03, .2, .25, feu, -L2 / 2 - .01, .9, s * 1); }
    box(g, .14, .2, l2 + .04, noir, L2 / 2 + .05, .45, 0); box(g, .14, .2, l2 + .04, noir, -L2 / 2 - .05, .45, 0);
    return { g, r: ajouterRoues(g, [L2 / 2 - 2.2, -L2 / 2 + 2.6], l2 / 2 - .1), v: 6.5, L: L2, bus: true }; };
  const enRoute = []; let prochain = performance.now() + 2500 + Math.random() * 5000, avant = 0;
  const animAvant = L.anim;
  L.anim = (t) => { animAvant && animAvant(t);
    const dt = avant ? Math.min(.1, (t - avant) / 1000) : 0; avant = t;
    if (t > prochain && !L.apo) { const dernier = enRoute[enRoute.length - 1];
      if (!dernier || dernier.g.position.x > -60 + dernier.L + 6) { const v = Math.random() < .17 ? bus() : voiture(); v.g.position.set(-72, 0, .55); scene.add(v.g); enRoute.push(v);
        prochain = t + (Math.random() < .3 ? 1500 + Math.random() * 2500 : 7000 + Math.random() * 16000); }   // parfois deux ou trois à la suite, souvent rien pendant un moment
      else prochain = t + 800; }
    for (let i = enRoute.length - 1; i >= 0; i--) { const v = enRoute[i], dev = enRoute[i - 1];
      let vit = v.v; if (dev && dev.g.position.x - v.g.position.x < dev.L / 2 + v.L / 2 + 4) vit = Math.min(vit, dev.v);   // pas de dépassement
      v.g.position.x += vit * dt; for (const r of v.r) r.rotation.y -= vit * dt / .31;
      if (v.g.position.x > 75) { scene.remove(v.g); v.g.traverse(o => { if (o.geometry && o.geometry !== roues) o.geometry.dispose(); }); enRoute.splice(i, 1); } }
  };
}
/* Les étages du bâtiment côté rue : on entre par une des deux portes marron des ailes (cour d'honneur) ; dans chaque cage,
   escalier, palier, escalier, et ainsi de suite sur 6 étages ; à chaque étage, un long couloir traverse tout le bâtiment,
   6 portes de chaque côté. Sol et marches en carrelage, murs beiges, ampoules nues : plus on monte, moins elles marchent.
   Plan (|x| : 11.2 → 12.8 moitié intérieure, 12.8 → 14.4 moitié extérieure ; la porte est dans le mur extérieur, au rez-de-chaussée) :
   - palier de l'étage n (z de 1.6 à 3.5), à y = n × 3.4 ; volée 1 (moitié extérieure) de z = 1.6 à -1.4, monte de 1.7 ;
   - palier intermédiaire (z < -1.4) ; volée 2 (moitié intérieure) de z = -1.4 à 1.6, monte au palier de l'étage n + 1 ;
   - le couloir de l'étage n (1 à 6) : |x| < 11.2, z de 1.3 à 3.5, à y = n × 3.4 */
const ET = { H: 3.4, HP: 2.7, CX0: 11.2, CXM: 12.8, CX1: 14.4, Z0: -3, Z1: 3.5, ZC0: 1.3, N: 6 };
function construireEtage(A, L, scene) {
  const { H, HP, CX0, CXM, CX1, Z0, Z1, ZC0, N } = ET, HTOT = N * H + HP, MH = .17, MP = .3;
  const carreaux = toileCarreaux(), beige = A.mat({ color: 0xd8cbad, roughness: .95 }), plinthe = A.mat({ color: 0x6b4a2c }), gris = A.mat({ color: 0x8a8174 });
  const matSol = (w, d) => A.mat({ map: tex(carreaux, w / 1.6, d / 1.6), roughness: .5 });
  const sols = [];
  const sol = (w, d, x, y, z, ep = .25) => { if (y > 0) A.ajoute(new THREE.BoxGeometry(w, ep, d), gris, x, y - ep / 2 - .003, z, false);
    const o = A.ajoute(new THREE.PlaneGeometry(w, d), matSol(w, d), x, y + .002, z, false); o.rotation.x = -Math.PI / 2; sols.push(o); return o; };
  // les ampoules : leur état dépend de l'étage (de plus en plus de grillées, quelques-unes qui clignotent)
  const etatAmpoule = (k, j) => { const r = hasard(k * 13.7 + j * 3.1), mort = Math.max(0, (k - 1) * .15), cli = mort + .08 + (k - 1) * .03;
    return r < mort ? "mort" : r < cli ? "clignote" : "ok"; };
  const ampOK = new THREE.MeshBasicMaterial({ color: 0xfff1c8 }), ampMort = new THREE.MeshStandardMaterial({ color: 0x5a5650, roughness: .4 });
  const bulbes = [];   // [étage, x, z, état, mesh]
  const ampoule = (k, x, y, z, etat) => { A.ajoute(new THREE.CylinderGeometry(.008, .008, .3, 6), A.mat({ color: 0x222 }), x, y - .15, z, false);
    const b = A.ajoute(new THREE.SphereGeometry(.06, 10, 8), etat === "mort" ? ampMort : ampOK.clone(), x, y - .34, z, false); bulbes.push({ k, x, z, y: y - .4, etat, b }); return b; };
  const porteT = tex(toile(120, 230, (x, w, h) => { x.fillStyle = "#e8dcc0"; x.fillRect(0, 0, w, h); x.fillStyle = "#6b4226"; x.fillRect(10, 14, w - 20, h - 14);
    x.strokeStyle = "#4c2c17"; x.lineWidth = 3; x.strokeRect(20, 26, w - 40, 80); x.strokeRect(20, 120, w - 40, 96);
    x.fillStyle = "#c9a227"; x.beginPath(); x.arc(w - 26, 128, 5, 0, 7); x.fill(); x.fillRect(w - 30, 140, 8, 3); }));
  const matPorte = A.mat({ map: porteT, roughness: .6 });
  // les 6 couloirs
  const nAvantCouloirs = scene.children.length;
  for (let k = 1; k <= N; k++) { const y = k * H;
    sol(CX0 * 2, Z1 - ZC0, 0, y, (ZC0 + Z1) / 2);
    for (const [zMur, sens] of [[ZC0, 1], [Z1, -1]]) {
      A.ajoute(new THREE.BoxGeometry(CX0 * 2, H, .2), beige, 0, y + H / 2 - .25, zMur - sens * .1, false);
      A.ajoute(new THREE.BoxGeometry(CX0 * 2, .12, .03), plinthe, 0, y + .06, zMur + sens * .015, false);
      for (let i = 0; i < 6; i++) { const p = A.ajoute(new THREE.PlaneGeometry(1.0, 2.15), matPorte, -CX0 + (i + .5) * CX0 * 2 / 6, y + 1.075, zMur + sens * .012, false); p.rotation.y = sens > 0 ? 0 : Math.PI; } }
    A.ajoute(new THREE.BoxGeometry(CX0 * 2, .12, Z1 - ZC0 + .4), A.mat({ color: 0xece4d2 }), 0, y + HP + .06, (ZC0 + Z1) / 2, false);   // plafond
    for (let j = 0; j < 6; j++) ampoule(k, -CX0 + (j + .5) * CX0 * 2 / 6, y + HP, (ZC0 + Z1) / 2, etatAmpoule(k, j)); }
  L.couloirs = scene.children.slice(nAvantCouloirs);
  // les deux cages d'escalier, sur toute la hauteur
  const mm = A.mat({ map: tex(carreaux, 1, .2), roughness: .5 }), cote = A.mat({ color: 0xc9bb9c, roughness: .9 }), matMarche = [cote, cote, mm, cote, mm, mm];
  const fer = A.mat({ color: 0x1a1a1a, metalness: .4, roughness: .5 });
  for (const sg of [-1, 1]) { const X = v => sg * v, xb = (a, b) => (X(a) + X(b)) / 2, cageW = CX1 - CX0, cz = (Z0 + Z1) / 2;
    A.ajoute(new THREE.BoxGeometry(cageW + .4, HTOT, .2), beige, xb(CX0, CX1), HTOT / 2, Z0 - .1, false);
    A.ajoute(new THREE.BoxGeometry(cageW + .4, HTOT, .2), beige, xb(CX0, CX1), HTOT / 2, Z1 + .1, false);
    A.ajoute(new THREE.BoxGeometry(.2, HTOT, Z1 - Z0), beige, X(CX1 + .1), HTOT / 2, cz, false);   // le mur extérieur, plein
    // le mur côté couloir : plein, sauf l'ouverture sur le couloir à chaque étage
    A.ajoute(new THREE.BoxGeometry(.2, HTOT, ZC0 - Z0), beige, X(CX0 - .1), HTOT / 2, (Z0 + ZC0) / 2, false);
    // au rez-de-chaussée, sous le couloir : la porte par où l'on entre (on vient de la cour), et par l'embrasure, la cour d'honneur
    const zp = 2.5, lp = 1.2;
    A.ajoute(new THREE.BoxGeometry(.2, H, zp - lp / 2 - ZC0), beige, X(CX0 - .1), H / 2, (ZC0 + zp - lp / 2) / 2, false);
    A.ajoute(new THREE.BoxGeometry(.2, H, Z1 - zp - lp / 2), beige, X(CX0 - .1), H / 2, (Z1 + zp + lp / 2) / 2, false);
    A.ajoute(new THREE.BoxGeometry(.2, H - 2.3, lp), beige, X(CX0 - .1), 2.3 + (H - 2.3) / 2, zp, false);
    // (par la porte : la vraie cour d'honneur, construite à part dans la scène de l'étage)
    const lumJour = new THREE.PointLight(0xf4f0e8, 1.6, 4, 1.6); lumJour.position.set(X(CX0 + .4), 1.6, zp); scene.add(lumJour);
    for (let k = 1; k <= N; k++) A.ajoute(new THREE.BoxGeometry(.2, H - HP, Z1 - ZC0), beige, X(CX0 - .1), k * H + HP + (H - HP) / 2, (ZC0 + Z1) / 2, false);
    for (let k = 0; k <= N; k++) { const y = k * H;
      sol(cageW, Z1 - 1.6, xb(CX0, CX1), y, (1.6 + Z1) / 2);                                        // le palier de l'étage
      if (k === N) continue;
      for (let i = 0; i < 10; i++) { const t = (i + 1) * MH; A.ajoute(new THREE.BoxGeometry(CX1 - CXM, t + .25, MP), matMarche, xb(CXM, CX1), y + t / 2 - .125, 1.6 - (i + .5) * MP, false); }
      A.ajoute(new THREE.BoxGeometry(cageW, .25, -1.4 - Z0), gris, xb(CX0, CX1), y + 1.7 - .125, (Z0 - 1.4) / 2, false);
      sol(cageW, -1.4 - Z0, xb(CX0, CX1), y + 1.7, (Z0 - 1.4) / 2, .02);                          // le palier intermédiaire
      for (let i = 0; i < 10; i++) { const t = 1.7 + (i + 1) * MH; A.ajoute(new THREE.BoxGeometry(CXM - CX0, (i + 1) * MH + .25, MP), matMarche, xb(CX0, CXM), y + t - ((i + 1) * MH + .25) / 2, -1.4 + (i + .5) * MP, false); }
      // les rampes en fer, des deux volées, au milieu
      for (const [z0, y0, sens] of [[1.6, 0, -1], [-1.4, 1.7, 1]]) {
        const r = A.ajoute(new THREE.BoxGeometry(.05, .05, 3.45), fer, X(CXM), y + y0 + .85 + .95, z0 + sens * 1.5, false); r.rotation.x = sens * -Math.atan2(1.7, 3);
        for (let j = 0; j <= 5; j++) A.ajoute(new THREE.BoxGeometry(.03, .95, .03), fer, X(CXM), y + y0 + (j + .5) * .3 + .47, z0 + sens * (j * .6 + .15), false); }
      ampoule(Math.max(1, k), xb(CXM, CX1), y + HP, 2.5, etatAmpoule(Math.max(1, k), 10 + (sg > 0 ? 1 : 0)));
      ampoule(Math.max(1, k + 1), xb(CX0, CX1), y + 1.7 + HP - .3, -2.2, etatAmpoule(Math.max(1, k + 1), 12 + (sg > 0 ? 1 : 0))); }
    A.ajoute(new THREE.BoxGeometry(cageW + .4, .2, Z1 - Z0 + .4), A.mat({ color: 0xece4d2 }), xb(CX0, CX1), HTOT + .1, cz, false);
    // au dernier étage : la barrière en fer qui ferme la trémie (le long du palier, et le long de la cage)
    { const yN = N * H;
      const lisse = A.ajoute(new THREE.BoxGeometry(CX1 - CXM + .05, .05, .05), fer, xb(CXM - .02, CX1), yN + .95, 1.6, false);
      for (let j = 0; j <= 6; j++) A.ajoute(new THREE.BoxGeometry(.03, .95, .03), fer, X(CXM + j * (CX1 - CXM) / 6), yN + .47, 1.6, false);
      A.ajoute(new THREE.BoxGeometry(.05, .05, 3.05), fer, X(CXM), yN + .95, .1, false);
      for (let j = 0; j <= 6; j++) A.ajoute(new THREE.BoxGeometry(.03, .95, .03), fer, X(CXM), yN + .47, 1.6 - j * .5, false); }
  }
  L.sol = sols[0]; L.solsPlus = sols.slice(1);
  /* la lumière : un jeu de lampes qui suit l'étage où l'on est (les ampoules de cet étage et de la cage) ; plus on monte, moins ça éclaire */
  const ambiant = new THREE.AmbientLight(0xfff0d8, .28); scene.add(ambiant);
  const pool = []; for (let i = 0; i < 12; i++) { const l = new THREE.PointLight(0xffd9a0, 0, 7, 1.6); scene.add(l); pool.push(l); }
  let etageVu = -1, actives = [];
  const eclairer = (n) => { etageVu = n; const f = Math.max(1, n), apo = M && estApo(M.lieu), kA = apo ? .35 : 1;
    ambiant.intensity = Math.max(.05, .3 - (f - 1) * .045) * kA;
    const proches = bulbes.filter(b => b.k === f || (n === 0 && b.k === 1 && b.y < H + 1)).sort((a, b) => Math.abs(a.y - n * H - 2) - Math.abs(b.y - n * H - 2)).slice(0, pool.length);
    actives = [];
    pool.forEach((l, i) => { const b = proches[i]; if (!b || b.etat === "mort" || (apo && hasard(b.x * 3 + b.k) < .45)) { l.intensity = 0; return; }
      l.position.set(b.x, b.y, b.z); l.userData.base = 2.2 * (1 - (b.k - 1) * .12) * kA; l.intensity = l.userData.base; actives.push([l, apo && b.etat !== "clignote" ? { ...b, etat: "clignote" } : b]); }); };
  L.eclairer = eclairer;
  L.anim = (t) => { const moi = M && M.moiNum && M.gens.get(M.moiNum), n = moi && moi.etg ? moi.etg.n : 0;
    if (n !== etageVu) eclairer(n);
    for (const [l, b] of actives) if (b.etat === "clignote") { const on = Math.sin(t / 97 + b.x) + Math.sin(t / 41 + b.z * 3) > -.4 && hasard(Math.floor(t / 120) + b.x) > .25;
      l.intensity = on ? l.userData.base : 0; b.b.material.color.setHex(on ? 0xfff1c8 : 0x4a4640); } };
  /* la hauteur du sol, et l'étage où se trouve chacun (on le suit en passant d'un palier à une volée) */
  const zoneDe = (x, z) => { const ax = Math.abs(x); return ax < CX0 || z >= 1.6 ? "P" : z <= -1.4 ? "M" : ax >= CXM ? "V1" : "V2"; };
  L.hauteur = (x, z, p) => { const e = p ? (p.etg = p.etg || { n: 0, m: 0, zone: "P" }) : (M && M.moiNum && M.gens.get(M.moiNum) && M.gens.get(M.moiNum).etg) || { n: 0, m: 0, zone: "P" };
    const zo = zoneDe(x, z);
    if (p && zo !== e.zone) {
      if (e.zone === "P" && zo === "V1") e.m = e.n; else if (e.zone === "P" && zo === "V2") e.m = Math.max(0, e.n - 1);
      else if (e.zone === "V1" && zo === "P") e.n = e.m; else if (e.zone === "V2" && zo === "P") e.n = Math.min(N, e.m + 1);
      e.zone = zo; }
    if (zo === "P") return e.n * H;
    if (zo === "M") return e.m * H + 1.7;
    if (zo === "V1") return e.m * H + Math.max(0, Math.min(1.7, (1.6 - z) / 3 * 1.7));
    return e.m * H + 1.7 + Math.max(0, Math.min(1.7, (z + 1.4) / 3 * 1.7)); };
  // au dernier étage, il n'y a plus d'escalier qui monte : la moitié extérieure du palier est fermée par une barrière
  const auRdcP = () => { const moi = M && M.moiNum && M.gens.get(M.moiNum); return !moi || !moi.etg || (moi.etg.n === 0 && moi.etg.zone === "P"); };
  const auDernier = () => { const moi = M && M.moiNum && M.gens.get(M.moiNum); return moi && moi.etg && moi.etg.n === N && moi.etg.zone === "P"; };
  L.limites = (x, z) => { const ax = Math.abs(x);
    if (ax > CXM - .15 && z < 1.6 + .25 && auDernier()) return false;
    // au rez-de-chaussée, la moitié intérieure de la cage est sous la seconde volée : on n'y passe pas (on monte par la première)
    if (ax < CXM + .15 && ax > CX0 - .1 && z < 1.6 + .25 && auRdcP()) return false;
    return (ax < CX0 + .1 && z > ZC0 + .3 && z < Z1 - .3)
      || (ax > CXM + .15 && ax < CX1 - .25 && z > Z0 + .25 && z < Z1 - .25)
      || (ax > CX0 - .05 && ax < CX1 - .25 && z > Z0 + .25 && z < -1.45)
      || (ax > CX0 - .05 && ax < CXM - .15 && z > Z0 + .25 && z < Z1 - .3)
      || (ax > CX0 - .05 && ax < CX1 - .25 && z > 1.65 && z < Z1 - .3); };
  /* toucher un endroit d'un autre étage : on y monte (ou descend) par l'escalier de la cage la plus proche */
  L.allerEtage = (moi, x, z, y) => { const e = moi.etg || { n: 0 }, ax = Math.abs(x), surPalier = ax < CX0 || z >= 1.6;
    const f = Math.max(0, Math.min(N, Math.round((y - (surPalier ? 0 : .85)) / H)));
    if (f === e.n) return false;
    const sg = Math.sign(ax >= CX0 ? x : moi.g.position.x) || 1, pts = [], monte = f > e.n;
    const debut = [sg * (monte ? 13.6 : 12), 2.5];
    pts.push(...itineraire(L, moi.g.position.x, moi.g.position.z, debut[0], debut[1]));
    for (let k = 0; k < Math.abs(f - e.n); k++) { const seq = [[13.6, 1.4], [13.6, -2.2], [12, -2.2], [12, 1.4], [12, 2.5]]; if (!monte) seq.reverse().push([13.6, 2.5]);
      if (!monte) seq.shift(); pts.push(...seq.map(([a, b]) => [sg * a, b])); if (monte && k < Math.abs(f - e.n) - 1) pts.push([sg * 13.6, 2.5]); }
    if (surPalier) pts.push(...itineraire(L, pts[pts.length - 1][0], pts[pts.length - 1][1], x, z));
    const v = pts.map(([a, b]) => new THREE.Vector3(a, 0, b)); moi.cible = v.shift(); moi.chemin = v;
    M.repere.position.set(x, f * H + .04, z); M.repere.material.opacity = 1;
    return true; };
  // on sort par la porte (au rez-de-chaussée seulement) : dans la cour d'honneur, devant la porte de l'aile
  const auRdc = () => { const moi = M && M.moiNum && M.gens.get(M.moiNum); return !moi || !moi.etg || moi.etg.n === 0; };
  for (const sg of [-1, 1]) L.portails.push({ dans: (x, z) => auRdc() && sg * x > 0 && Math.abs(x) < CX0 - .25 && Math.abs(z - 2.5) < .7, vers: "grande", arrivee: [sg * 6.8, 13.75], yaw: sg < 0 ? -Math.PI / 2 : Math.PI / 2, indice: [sg * (CX0 - 1), 2.5] });
  L.sansMusique = true;   // (on n'entend pas la fête d'ici)
  // la caméra reste dans la cage ou dans le couloir, à hauteur du bonhomme
  L.contraindreCam = (pos, moi) => { const mx = moi.g.position.x, ax = Math.abs(mx), s = Math.sign(mx) || 1, py = moi.g.position.y;
    pos.y = Math.min(pos.y, py + 2.3);
    if (ax < CX0) { pos.z = Math.max(ZC0 + .12, Math.min(Z1 - .12, pos.z)); pos.x = Math.max(-CX1 + .15, Math.min(CX1 - .15, pos.x)); pos.y = Math.max(pos.y, py + .4); }
    else { pos.x = s * Math.max(Math.min(Math.abs(pos.x), CX1 - .15), ax < CXM && moi.g.position.z > 1.4 ? 0 : CX0 + .15); pos.z = Math.max(Z0 + .15, Math.min(Z1 - .15, pos.z)); }
    return true; };
  L.interieur = true; L.sansPNJ = true; L.zone = [-CX1 - .5, CX1 + .5, Z0, Z1];
  L.boite = [-CX1, CX1, Z0, Z1];
  L.depart = [-12, 2.5]; L.cam = { pos: [-10.5, 2, 2.5], vise: [-14, 1, 0] };
}
// un tableau des 3 meilleurs scores, accroché au mur du fond (face vers la salle) ; rend la fonction qui le met à jour
function tableauScores(A, sousTitre, x0, y0, z0) {
  const c = document.createElement("canvas"); c.width = 512; c.height = 360; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const maj = (top = []) => { const x = c.getContext("2d"), w = 512, h = 360;
    x.fillStyle = "#3a1d0e"; x.fillRect(0, 0, w, h); x.fillStyle = "#14100c"; x.fillRect(18, 18, w - 36, h - 36);
    x.strokeStyle = "#c9a227"; x.lineWidth = 6; x.strokeRect(10, 10, w - 20, h - 20);
    x.fillStyle = "#ffcf3a"; x.font = "bold 38px Impact, Arial Black, sans-serif"; x.textAlign = "center"; x.fillText("🏆 MEILLEURS SCORES", w / 2, 72);
    x.fillStyle = "#e33"; x.font = "bold 20px Arial"; x.fillText(sousTitre, w / 2, 102);
    const med = ["#ffd700", "#d9d9d9", "#cd7f32"];
    for (let i = 0; i < 3; i++) { const e = top[i], y = 160 + i * 66;
      x.fillStyle = med[i]; x.beginPath(); x.arc(64, y - 12, 22, 0, 7); x.fill(); x.fillStyle = "#14100c"; x.font = "bold 26px Arial"; x.textAlign = "center"; x.fillText(String(i + 1), 64, y - 3);
      x.textAlign = "left"; x.fillStyle = "#f4ecd8"; x.font = "bold 30px Arial"; x.fillText(e ? e.nom.slice(0, 14) : "—", 104, y);
      x.textAlign = "right"; x.fillStyle = "#7ef0ff"; x.font = "bold 30px 'Courier New', monospace"; x.fillText(e ? e.score.toLocaleString("fr-FR") : "", w - 40, y); }
    t.needsUpdate = true; };
  maj([]);
  const m = A.ajoute(new THREE.PlaneGeometry(1.4, .98), new THREE.MeshBasicMaterial({ map: t }), x0, y0, z0, false); m.rotation.y = Math.PI;
  return maj;
}
// la cible de fléchettes (dessinée dans un canevas, centre cx cy, rayon r) : 20 secteurs noirs et crème, doubles et triples rouges et verts, le bull
export const SECTEURS_FLECHETTES = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
export function dessinerCibleFlechettes(x, cx, cy, r) {
  const k = r / 225;   // (le plateau fait 451 mm de diamètre ; la zone de jeu, 170 mm de rayon)
  x.fillStyle = "#141414"; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill();
  const anneau = (r0, r1, coul) => { for (let i = 0; i < 20; i++) { const a0 = -Math.PI / 2 + (i - .5) * Math.PI / 10, a1 = a0 + Math.PI / 10;
    x.fillStyle = coul(i); x.beginPath(); x.arc(cx, cy, r1 * k, a0, a1); x.arc(cx, cy, r0 * k, a1, a0, true); x.closePath(); x.fill(); } };
  anneau(0, 170, i => i % 2 ? "#efe3c4" : "#1c1c1c");
  anneau(162, 170, i => i % 2 ? "#1e8a3c" : "#c8202a"); anneau(99, 107, i => i % 2 ? "#1e8a3c" : "#c8202a");
  x.fillStyle = "#1e8a3c"; x.beginPath(); x.arc(cx, cy, 15.9 * k, 0, 7); x.fill(); x.fillStyle = "#c8202a"; x.beginPath(); x.arc(cx, cy, 6.35 * k, 0, 7); x.fill();
  x.strokeStyle = "#c9c9c9"; x.lineWidth = Math.max(1, k * 1.2); for (const rr of [170, 162, 107, 99, 15.9]) { x.beginPath(); x.arc(cx, cy, rr * k, 0, 7); x.stroke(); }
  for (let i = 0; i < 20; i++) { const a = -Math.PI / 2 + (i - .5) * Math.PI / 10; x.beginPath(); x.moveTo(cx + Math.cos(a) * 15.9 * k, cy + Math.sin(a) * 15.9 * k); x.lineTo(cx + Math.cos(a) * 170 * k, cy + Math.sin(a) * 170 * k); x.stroke();
    const am = a + Math.PI / 20; x.fillStyle = "#f4f1ea"; x.font = `bold ${Math.round(22 * k)}px Arial`; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(String(SECTEURS_FLECHETTES[i]), cx + Math.cos(am) * 196 * k, cy + Math.sin(am) * 196 * k); }
  x.textBaseline = "alphabetic";
}
// le baby-foot (salle des fêtes, sous-sol) ; rend la place qu'il occupe, poignées comprises : [x0, x1, z0, z1]
function babyFoot(A, cx, cz) {
  // le baby-foot : caisse en bois blond, bouts arrondis rouges, terrain vert, 8 barres et leurs joueurs rouges et bleus, poignées noires
  const BL = 1.45, BW = .76;
  const blond = A.mat({ color: 0xd4a464, roughness: .45 }), rougeB = A.mat({ color: 0xc0262c, roughness: .4 }), noirB = A.mat({ color: 0x151515, roughness: .5 }), inox = A.mat({ color: 0xd5d8db, metalness: .85, roughness: .2 });
  A.ajoute(new THREE.BoxGeometry(BL - .3, .36, BW), blond, cx, .72, cz);
  for (const sg of [-1, 1]) { const bout = A.ajoute(new THREE.CylinderGeometry(.18, .18, BW, 20, 1, false, sg > 0 ? 0 : Math.PI, Math.PI), blond, cx + sg * (BL / 2 - .15), .72, cz); bout.rotation.x = Math.PI / 2;
    const cap = A.ajoute(new THREE.BoxGeometry(.05, .1, BW + .02), rougeB, cx + sg * (BL / 2 - .02), .93, cz, false);
    for (const s2 of [-1, 1]) A.ajoute(new THREE.BoxGeometry(.3, .06, .05), rougeB, cx + sg * (BL / 2 - .17), .92, cz + s2 * (BW / 2 + .005), false); }
  for (const s2 of [-1, 1]) A.ajoute(new THREE.BoxGeometry(BL - .3, .05, .05), A.mat({ color: 0xc0262c }), cx, .92, cz + s2 * (BW / 2 + .005), false);
  const terrain = A.ajoute(new THREE.PlaneGeometry(BL - .34, BW - .08), A.mat({ map: tex(toile(256, 140, (x, w, h) => { x.fillStyle = "#2f7a3a"; x.fillRect(0, 0, w, h); x.strokeStyle = "#e9f2e6"; x.lineWidth = 2;
    x.strokeRect(6, 6, w - 12, h - 12); x.beginPath(); x.moveTo(w / 2, 6); x.lineTo(w / 2, h - 6); x.stroke(); x.beginPath(); x.arc(w / 2, h / 2, 18, 0, 7); x.stroke(); x.strokeRect(6, h / 2 - 28, 26, 56); x.strokeRect(w - 32, h / 2 - 28, 26, 56); })) }), cx, .905, cz, false);
  terrain.rotation.x = -Math.PI / 2;
  for (const sg of [-1, 1]) for (const s2 of [-1, 1]) A.ajoute(new THREE.BoxGeometry(.08, .54, .08), noirB, cx + sg * (BL / 2 - .32), .27, cz + s2 * (BW / 2 - .12));
  const NB = [1, 2, 5, 3, 3, 5, 2, 1], dEq = [0, 0, 1, 0, 1, 0, 1, 1];   // les huit barres, en partant d'un but
  NB.forEach((n, k) => { const bxk = cx - (BL - .4) / 2 + (k + .5) * (BL - .4) / 8, joue = dEq[k] ? 0x2d5fb3 : 0xc0262c;
    const barre = A.ajoute(new THREE.CylinderGeometry(.008, .008, BW + .5, 8), inox, bxk, 1.0, cz + (dEq[k] ? .22 : -.22), false); barre.rotation.x = Math.PI / 2;
    const poi = A.ajoute(new THREE.CylinderGeometry(.022, .022, .13, 10), noirB, bxk, 1.0, cz + (dEq[k] ? 1 : -1) * (BW / 2 + .42), false); poi.rotation.x = Math.PI / 2;
    for (let j = 0; j < n; j++) { const jz = cz - (BW - .16) / 2 + (j + .5) * (BW - .16) / n;
      A.ajoute(new THREE.BoxGeometry(.035, .1, .045), A.mat({ color: joue }), bxk, .955, jz, false);
      A.ajoute(new THREE.SphereGeometry(.022, 8, 6), A.mat({ color: 0xe9c4a0 }), bxk, 1.03, jz, false);
      A.ajoute(new THREE.BoxGeometry(.03, .06, .03), A.mat({ color: 0x111111 }), bxk, .89, jz, false); } });
  A.ajoute(new THREE.SphereGeometry(.018, 10, 8), A.mat({ color: 0xf2f2f2 }), cx + .08, .875, cz + .05, false);   // la balle
  return [cx - BL / 2 - .2, cx + BL / 2 + .2, cz - BW / 2 - .25, cz + BW / 2 + .25];
}
function toileParquet() {
  graine = 57;
  return toile(512, 512, (x, w, h) => {      // lames de chêne foncé vernies, posées à l'anglaise
    for (let r = 0; r < 8; r++) { let X = -alea() * 200;
      while (X < w) { const lg = 140 + alea() * 160, v = alea(), g = x.createLinearGradient(0, r * 64, 0, r * 64 + 64);
        g.addColorStop(0, `hsl(22, 52%, ${17 + v * 7}%)`); g.addColorStop(.5, `hsl(24, 56%, ${22 + v * 7}%)`); g.addColorStop(1, `hsl(22, 52%, ${16 + v * 7}%)`);
        x.fillStyle = g; x.fillRect(X, r * 64, lg, 64);
        x.strokeStyle = "rgba(10,4,0,.3)"; x.lineWidth = 1; for (let k = 0; k < 5; k++) { const y = r * 64 + 8 + alea() * 48; x.beginPath(); x.moveTo(X, y); x.bezierCurveTo(X + lg / 3, y + alea() * 8 - 4, X + lg * .66, y + alea() * 8 - 4, X + lg, y); x.stroke(); }
        x.fillStyle = "rgba(8,3,0,.75)"; x.fillRect(X, r * 64, 2, 64); X += lg; }
      x.fillStyle = "rgba(8,3,0,.75)"; x.fillRect(0, r * 64, w, 2); }
    x.fillStyle = "rgba(255,230,190,.05)"; x.fillRect(0, 0, w, h); });
}
// le vestibule du sous-sol, en coordonnées propres (centre 0, 0) : porte « BAR » en +x, escalier de la salle des fêtes en +z, grande pièce en -z.
// Construit dans le sous-sol, et aussi dans la cour d'honneur (tourné) pour qu'on y entre sans coupure par la porte « BAR »
// le vestibule : demi-largeur VX (vers la porte « BAR »), demi-longueur VZ ; dans la cour, son centre est en (VEST_X, VEST_Z), tourné d'un demi-tour
const VEST_VX = 2.6, VEST_VZ = 2.4, VEST_LB = 1.6, VEST_X = 16 + VEST_VX + .15, VEST_Z = 9.12;
const FETE_SZ = 15 + .3 + 2.6 + .15 + VEST_VZ, FETE_HSS = -1.53;   // (le niveau du sous-sol : 5 + 4 marches de 17 cm)     // dans la salle des fêtes : le centre du vestibule (au bout du couloir de l'escalier)
function vestibuleSousSol(A, scene, o = {}) {
  const HT = 3.1, LAMB = 1.15, VX = VEST_VX, VZ0 = -VEST_VZ, VZ1 = VEST_VZ;
  const peinture = A.mat({ color: 0xe6d9bd, roughness: .95 }), bois = A.mat({ color: 0x5a3018, roughness: .5 });
  const carreaux = toileCarreaux(), lambris = toileLambris();
  const solV = A.ajoute(new THREE.PlaneGeometry(VX * 2, VZ1 - VZ0), A.mat({ map: tex(carreaux, VX * 2 / 1.6, (VZ1 - VZ0) / 1.6), roughness: .5 }), 0, .012, 0, false); solV.rotation.x = -Math.PI / 2;
  const mur = (axe, pos, de, a, interieur) => {
    const L2 = a - de, mid = (de + a) / 2, ep = .3;
    const m = A.ajoute(new THREE.BoxGeometry(...(axe === "z" ? [ep, HT, L2] : [L2, HT, ep])), peinture, ...(axe === "z" ? [pos, 0, mid] : [mid, 0, pos]), false); m.position.y = HT / 2;
    const off = interieur * (ep / 2 + .02), place = (q, y) => { if (axe === "z") q.position.set(pos + off, y, mid); else q.position.set(mid, y, pos + off); };
    const lm = new THREE.Mesh(new THREE.BoxGeometry(...(axe === "z" ? [.04, LAMB, L2] : [L2, LAMB, .04])), A.mat({ map: tex(lambris, L2 / 2.6, 1), roughness: .45 })); place(lm, LAMB / 2); scene.add(lm);
    const bg = new THREE.Mesh(new THREE.BoxGeometry(...(axe === "z" ? [.09, .07, L2] : [L2, .07, .09])), bois); place(bg, LAMB + .03); scene.add(bg);
    const pl = new THREE.Mesh(new THREE.BoxGeometry(...(axe === "z" ? [.07, .14, L2] : [L2, .14, .07])), bois); place(pl, .07); scene.add(pl);
  };
  const cadre = A.mat({ color: 0xece3cf, roughness: .6 });
  const encadrement = (z, lp, hp, s) => { A.ajoute(new THREE.BoxGeometry(lp + .3, .14, .1), cadre, 0, hp + .07, z + s * .2, false);
    for (const sg of [-1, 1]) A.ajoute(new THREE.BoxGeometry(.14, hp, .1), cadre, sg * (lp / 2 + .08), hp / 2, z + s * .2, false); };
  if (o.plafond) { A.ajoute(new THREE.BoxGeometry(VX * 2 + .6, .3, VZ1 - VZ0 + .6), A.mat({ color: 0xece4d2, roughness: 1 }), 0, HT + .15, 0, false); }
  // le sol des embrasures (épaisseur des murs) : carrelage vers l'escalier et la grande pièce, pierre vers la cour
  for (const [w, d, x, z, m] of [[1.4, .32, 0, VZ1 + .15, null], [1.3, .34, 0, VZ0 - .15, null], [.34, 1.0, VX + .16, 0, 0xb9b4aa]]) {
    const q = A.ajoute(new THREE.PlaneGeometry(w, d), m ? A.mat({ color: m, roughness: .8 }) : A.mat({ map: tex(carreaux, w / 1.6, d / 1.6), roughness: .5 }), x, .011, z, false); q.rotation.x = -Math.PI / 2; }
  const lpE = 1.4, hp = 2.3;
  mur("z", -VX - .15, VZ0, VZ1, 1);
  /* le mur de droite du vestibule : une porte ouverte, de plain-pied, qui donne directement dehors, sur le renfoncement de l'ancien bar (la porte « BAR » de la cour d'honneur) */
  const lpB = VEST_LB;
  mur("z", VX + .15, VZ0, -lpB / 2, -1); mur("z", VX + .15, lpB / 2, VZ1, -1);
  A.ajoute(new THREE.BoxGeometry(.3, HT - hp, lpB), peinture, VX + .15, hp + (HT - hp) / 2, 0, false);
  A.ajoute(new THREE.BoxGeometry(.1, .14, lpB + .3), cadre, VX - .04, hp + .07, 0, false);
  for (const sg of [-1, 1]) A.ajoute(new THREE.BoxGeometry(.1, hp, .14), cadre, VX - .04, hp / 2, sg * (lpB / 2 + .08), false);   // une simple embrasure, sans porte
  if (o.dehors) { // dehors, par la porte : les dalles du renfoncement, la façade de la salle des fêtes en face, un peu de ciel
    const dehors = tex(toile(256, 600, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h * .3); g.addColorStop(0, "#8fb4d6"); g.addColorStop(1, "#c9dbe8"); x.fillStyle = g; x.fillRect(0, 0, w, h * .3);
      x.fillStyle = "#cfc8ba"; x.fillRect(0, h * .3, w, h * .42); x.fillStyle = "rgba(90,80,60,.18)"; for (let y = h * .3; y < h * .72; y += 22) x.fillRect(0, y, w, 2);
      x.fillStyle = "#3c4a5a"; x.fillRect(40, h * .4, 70, h * .3); x.fillRect(150, h * .4, 70, h * .3); x.fillStyle = "#e9e3d6"; x.fillRect(73, h * .4, 4, h * .3); x.fillRect(183, h * .4, 4, h * .3);
      x.fillStyle = "#b9b4aa"; x.fillRect(0, h * .72, w, h * .28); x.strokeStyle = "rgba(70,65,55,.35)"; x.lineWidth = 2;
      for (let y = h * .72; y < h; y += 26) { x.beginPath(); x.moveTo(0, y); x.lineTo(w, y); x.stroke(); } for (let X = 0; X < w; X += 52) { x.beginPath(); x.moveTo(X, h * .72); x.lineTo(X, h); x.stroke(); } }));
    const vue = A.ajoute(new THREE.PlaneGeometry(lpB, hp + .2), new THREE.MeshBasicMaterial({ map: dehors }), VX + .32, (hp + .2) / 2, 0, false); vue.rotation.y = -Math.PI / 2;
    const jour = new THREE.PointLight(0xfff4e0, 2.5, 4, 1.4); jour.position.set(VX - .3, 2, 0); scene.add(jour);
    const seuil = A.ajoute(new THREE.PlaneGeometry(.34, lpB), A.mat({ color: 0xb9b4aa, roughness: .8 }), VX + .16, .004, 0, false); seuil.rotation.x = -Math.PI / 2; }
  // la porte d'où l'on vient (+z) : derrière, les marches qui remontent vers la salle des fêtes
  mur("x", VZ1 + .15, -VX - .3, -lpE / 2, -1); mur("x", VZ1 + .15, lpE / 2, VX + .3, -1);
  A.ajoute(new THREE.BoxGeometry(lpE, HT - hp, .3), peinture, 0, hp + (HT - hp) / 2, VZ1 + .15, false);
  encadrement(VZ1 + .15, lpE, hp, -1);
  const matMarche = A.mat({ map: tex(carreaux, 1.2, .4), roughness: .5 });
  if (o.escalierFete) {
    /* vu de la cour : le même couloir et le même escalier que dans la salle des fêtes (couloir de plain-pied, 4 marches, le palier et la porte,
       puis les 5 marches qui montent dans la salle), pour qu'il n'y ait pas de différence en passant de l'un à l'autre */
    const W = 1.94, Z0c = VZ1 + .15, sol = (w, d, x, y, z, m) => { const q = A.ajoute(new THREE.PlaneGeometry(w, d), m, x, y, z, false); q.rotation.x = -Math.PI / 2; };
    sol(W, 1.7, 0, .011, Z0c + .85, A.mat({ map: tex(carreaux, 1.2, .9), roughness: .5 }));
    for (let i = 0; i < 4; i++) { const h = .17 * (3 - i); if (h > 0) A.ajoute(new THREE.BoxGeometry(W, h, .3), matMarche, 0, h / 2, FETE_SZ - 15.45 - i * .3, false); }
    sol(W, 1.2, 0, .68, FETE_SZ - 14.7, A.mat({ map: tex(carreaux, 1.2, .8), roughness: .5 }));
    for (let i = 0; i < 5; i++) { const h = .68 + .17 * (5 - i); A.ajoute(new THREE.BoxGeometry(2, h, .3), matMarche, 0, h / 2, FETE_SZ - 12.6 - (i + .5) * .3, false); }
    for (const sg of [-1, 1]) A.ajoute(new THREE.BoxGeometry(.3, 7, 5.6), peinture, sg * (W / 2 + .15), 3.5, Z0c + 2.8, false);
    A.ajoute(new THREE.BoxGeometry(W, .3, 2.9), peinture, 0, 3.33, Z0c + 1.45, false);
    // la porte du haut (ouverte), et au-delà la salle des fêtes
    for (const sg of [-1, 1]) A.ajoute(new THREE.BoxGeometry(.14, 2.5, .1), cadre, sg * 1.03, .68 + 1.25, FETE_SZ - 15, false);
    A.ajoute(new THREE.BoxGeometry(2.2, .5, .1), cadre, 0, .68 + 2.75, FETE_SZ - 15, false);
    const salle = tex(toile(256, 420, (c, w, h) => { c.fillStyle = "#e6d9bd"; c.fillRect(0, 0, w, h); c.fillStyle = "#8a4a22"; c.fillRect(0, h * .72, w, h * .2);
      c.fillStyle = "#cfd6d4"; c.fillRect(30, h * .2, 70, h * .45); c.fillRect(156, h * .2, 70, h * .45); c.fillStyle = "#c9b48a"; c.fillRect(0, h * .92, w, h * .08); }));
    A.ajoute(new THREE.PlaneGeometry(2.2, 5), new THREE.MeshBasicMaterial({ map: salle }), 0, 1.53 + 2.5, FETE_SZ - 12.4, false).rotation.y = Math.PI;
    const haut = new THREE.PointLight(0xfff0d8, 3, 6, 1.4); haut.position.set(0, 2.6, FETE_SZ - 15.65); scene.add(haut);
  } else if (!o.sansEscalier) {
  for (let i = 0; i < 9; i++) A.ajoute(new THREE.BoxGeometry(lpE, .17 * (i + 1), .3), matMarche, 0, .17 * (i + 1) / 2, VZ1 + .45 + i * .3, false);
  for (const sg of [-1, 1]) A.ajoute(new THREE.BoxGeometry(.3, 4.5, 3.2), peinture, sg * (lpE / 2 + .15), 2.25, VZ1 + 1.9, false);
  A.ajoute(new THREE.BoxGeometry(lpE, .3, 3.2), peinture, 0, 3.6, VZ1 + 1.9, false);
  const haut = new THREE.PointLight(0xfff0d8, 3, 5, 1.4); haut.position.set(0, 2.6, VZ1 + 2.6); scene.add(haut);
  }
  // en face, l'autre porte, ouverte sur la grande pièce
  const lpF = 1.3;
  mur("x", VZ0 - .15, -VX, -lpF / 2, 1); mur("x", VZ0 - .15, lpF / 2, VX, 1);                          // côté vestibule
  A.ajoute(new THREE.BoxGeometry(lpF, HT - hp, .3), peinture, 0, hp + (HT - hp) / 2, VZ0 - .15, false);
  encadrement(VZ0 - .15, lpF, hp, -1);
  // la lumière du vestibule : un plafonnier en demi-boule
  const globe = new THREE.MeshStandardMaterial({ color: 0xfff6e0, emissive: 0xfff0d0, emissiveIntensity: .9, roughness: .3 });
  const pf = new THREE.Mesh(new THREE.SphereGeometry(.2, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), globe); pf.rotation.x = Math.PI; pf.position.set(0, HT - .01, 0); scene.add(pf);
  const lv = new THREE.PointLight(0xffe9c8, 4, 6, 1.5); lv.position.set(0, HT - .4, 0); scene.add(lv);

  return solV;
}
// le carrelage et le lambris de la salle des fêtes (repris dans la petite salle du sous-sol)
function toileCarreaux() {
  graine = 23;
  return toile(640, 640, (x, w, h) => {     // 16 × 16 carreaux de 10 cm
    x.fillStyle = "#4b4033"; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) { const v = alea(), r = alea();
      x.fillStyle = r < .004 ? "#2e4f74" : r < .007 ? "#6e2a2a" : `hsl(${40 + v * 6}, ${34 + v * 10}%, ${60 + v * 9}%)`;
      x.fillRect(i * 40 + 2, j * 40 + 2, 36, 36);
      x.fillStyle = "rgba(255,255,255,.06)"; x.fillRect(i * 40 + 3, j * 40 + 3, 34, 10); }
  });
}
function toileLambris() {
  graine = 41;
  return toile(512, 256, (x, w, h) => {      // planches verticales vernies
    for (let X = 0; X < w; X += 32) { const v = alea(); const g = x.createLinearGradient(X, 0, X + 32, 0);
      g.addColorStop(0, `hsl(24, 58%, ${30 + v * 6}%)`); g.addColorStop(.5, `hsl(26, 62%, ${40 + v * 6}%)`); g.addColorStop(1, `hsl(24, 58%, ${32 + v * 6}%)`);
      x.fillStyle = g; x.fillRect(X, 0, 32, h); x.fillStyle = "rgba(40,20,10,.55)"; x.fillRect(X, 0, 2, h);
      x.strokeStyle = "rgba(60,30,10,.25)"; x.lineWidth = 1; for (let k = 0; k < 4; k++) { x.beginPath(); x.moveTo(X + 6 + k * 6, 0); x.bezierCurveTo(X + 10 + k * 6, h / 3, X + 2 + k * 6, h * .66, X + 7 + k * 6, h); x.stroke(); } }
  });
}
/* Le sous-sol (vestibule, grande pièce au bar, console) en coordonnées propres ; L reçoit ses limites, tabourets, console…
   o.fusion : construit dans la salle des fêtes (l'escalier de la salle y descend), sans l'escalier propre du vestibule */
function construireSousSol(A, L, scene, o = {}) {
    /* Le sous-sol, sous la salle des fêtes : on y descend par l'escalier et la porte ouverte.
       D'abord un tout petit vestibule, vide (le même carrelage beige, les mêmes murs crème à lambris verni) ;
       en face, une autre porte ouverte donne sur une pièce un peu plus grande : mêmes murs, parquet vernis foncé. */
    const HT = 3.1, LAMB = 1.15, VX = VEST_VX, VZ0 = -VEST_VZ, VZ1 = VEST_VZ, GX = 3.8, GZ0 = VZ0 - 7, GZ1 = VZ0;
    const peinture = A.mat({ color: 0xe6d9bd, roughness: .95 }), bois = A.mat({ color: 0x5a3018, roughness: .5 });
    const carreaux = toileCarreaux(), lambris = toileLambris();
    const plan = (w, d, x, z, m) => { const o = A.ajoute(new THREE.PlaneGeometry(w, d), m, x, 0, z, false); o.rotation.x = -Math.PI / 2; return o; };
    const parquet = toileParquet();
    const solG = plan(GX * 2, GZ1 - GZ0, 0, (GZ0 + GZ1) / 2, A.mat({ map: tex(parquet, GX * 2 / 2.4, (GZ1 - GZ0) / 2.4), roughness: .28, metalness: .05 }));
    L.solsPlus = [solG];
    const mur = (axe, pos, de, a, interieur, sansLambris) => {
      const L2 = a - de, mid = (de + a) / 2, ep = .3;
      const m = A.ajoute(new THREE.BoxGeometry(...(axe === "z" ? [ep, HT, L2] : [L2, HT, ep])), peinture, ...(axe === "z" ? [pos, 0, mid] : [mid, 0, pos]), false); m.position.y = HT / 2;
      if (sansLambris) return;
      const off = interieur * (ep / 2 + .02), place = (o, y) => { if (axe === "z") o.position.set(pos + off, y, mid); else o.position.set(mid, y, pos + off); };
      const lm = new THREE.Mesh(new THREE.BoxGeometry(...(axe === "z" ? [.04, LAMB, L2] : [L2, LAMB, .04])), A.mat({ map: tex(lambris, L2 / 2.6, 1), roughness: .45 })); place(lm, LAMB / 2); scene.add(lm);
      const bg = new THREE.Mesh(new THREE.BoxGeometry(...(axe === "z" ? [.09, .07, L2] : [L2, .07, .09])), bois); place(bg, LAMB + .03); scene.add(bg);
      const pl = new THREE.Mesh(new THREE.BoxGeometry(...(axe === "z" ? [.07, .14, L2] : [L2, .14, .07])), bois); place(pl, .07); scene.add(pl);
    };
    const cadre = A.mat({ color: 0xece3cf, roughness: .6 }), brun = A.mat({ color: 0x6a3a1c, roughness: .5 }), brunC = A.mat({ color: 0x7d4823, roughness: .45 }), laiton = A.mat({ color: 0xc9a227, metalness: .7, roughness: .25 });
    // un encadrement de porte crème, côté s (+1 : face vers +z, -1 : face vers -z)
    const encadrement = (z, lp, hp, s) => { A.ajoute(new THREE.BoxGeometry(lp + .3, .14, .1), cadre, 0, hp + .07, z + s * .2, false);
      for (const sg of [-1, 1]) A.ajoute(new THREE.BoxGeometry(.14, hp, .1), cadre, sg * (lp / 2 + .08), hp / 2, z + s * .2, false); };
    // un battant ouvert, rabattu à plat contre le mur (charnière en x = xc, il s'étend vers xc + sens × largeur)
    const battant = (xc, z, larg, hp, sens) => { A.ajoute(new THREE.BoxGeometry(larg - .02, hp - .04, .06), brun, xc + sens * larg / 2, hp / 2, z, false);
      for (const [yy, hh] of [[.55, .7], [1.5, .95]]) A.ajoute(new THREE.BoxGeometry(larg - .26, hh, .03), brunC, xc + sens * larg / 2, yy + (hh > .8 ? .1 : 0), z - .04, false); };

    /* --- le vestibule (le même, construit aussi dans la cour d'honneur, derrière la porte « BAR ») --- */
    const lpE = 1.4, hp = 2.3, lpB = VEST_LB, lpF = 1.3;
    const solV = vestibuleSousSol(A, scene, { dehors: !o.fusion, sansEscalier: o.fusion }); L.sol = solV;
    // l'autre porte du vestibule, côté grande pièce
    mur("x", VZ0 - .15, -GX, -lpF / 2, -1); mur("x", VZ0 - .15, lpF / 2, GX, -1);                         // côté grande pièce
    A.ajoute(new THREE.BoxGeometry(lpF, HT - hp, .3), peinture, 0, hp + (HT - hp) / 2, VZ0 - .15, false);
    encadrement(VZ0 - .15, lpF, hp, 1); encadrement(VZ0 - .15, lpF, hp, -1);
    for (const sg of [-1, 1]) battant(sg * lpF / 2, VZ0 - .36, lpF / 2, hp, sg);                          // ses battants, rabattus contre le mur de la grande pièce
    for (const sg of [-1, 1]) A.ajoute(new THREE.BoxGeometry(.05, .18, .05), laiton, sg * (lpF - .12), 1.05, VZ0 - .42, false);
    const globe = new THREE.MeshStandardMaterial({ color: 0xfff6e0, emissive: 0xfff0d0, emissiveIntensity: .9, roughness: .3 });

    /* --- la grande pièce --- */
    mur("z", -GX - .15, GZ0, GZ1, 1); mur("z", GX + .15, GZ0, GZ1, -1); mur("x", GZ0 - .15, -GX, GX, 1);
    for (const sg of [-1, 1]) for (const z of [GZ0 + 1.9, (GZ0 + GZ1) / 2, GZ1 - 1.9]) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(.2, 20, 12, 0, Math.PI), globe); b.rotation.y = sg < 0 ? Math.PI / 2 : -Math.PI / 2; b.position.set(sg * (GX - .02), 2.3, z); scene.add(b);
      const l = new THREE.PointLight(0xffe6c0, 3, 7, 1.6); l.position.set(sg * (GX - .5), 2.3, z); scene.add(l); }
    const lg = new THREE.PointLight(0xffe9c8, 4, 9, 1.5); lg.position.set(0, HT - .5, (GZ0 + GZ1) / 2); scene.add(lg);
    // le plafond et ses poutres
    A.ajoute(new THREE.BoxGeometry(GX * 2 + .6, .3, VZ1 - GZ0 + .6), A.mat({ color: 0xece4d2, roughness: 1 }), 0, HT + .15, (GZ0 + VZ1) / 2, false);
    for (const z of [GZ0 + 2.3, GZ0 + 4.6]) A.ajoute(new THREE.BoxGeometry(GX * 2, .28, .28), A.mat({ color: 0xe3d9c3 }), 0, HT - .14, z, false);
    const ambSS = new THREE.AmbientLight(0xfff1dc, .45); scene.add(ambSS); L.ambiant = ambSS;   // (dans la salle des fêtes, elle se baisse avec la lumière de la salle)

    /* --- l'ameublement de la grande pièce ---
       à droite de la porte (vu de la pièce) : le comptoir de bar verni, on passe derrière ; contre le mur, les étagères, bouteilles et verres ;
       le long des murs, des tables rectangulaires et des fauteuils de bar devant ; vers le fond à gauche, le baby-foot */
    const obstacles = [];
    const acajou = A.mat({ color: 0x4a2010, roughness: .22, metalness: .05 }), acajouC = A.mat({ color: 0x6b3218, roughness: .25 }), vernis = A.mat({ color: 0x2e1408, roughness: .12, metalness: .08 });
    const FM = GZ1 - .3;                                    // la face du mur de la porte, côté pièce
    // les étagères contre le mur : un meuble bas, trois planches, un miroir derrière
    const E0 = -lpF / 2 - .75, E1 = -GX + .1, EC = (E0 + E1) / 2, EL2 = E0 - E1, EZc = FM - .2;
    A.ajoute(new THREE.BoxGeometry(EL2, 1.0, .4), acajou, EC, .5, EZc, false);
    A.ajoute(new THREE.BoxGeometry(EL2 + .04, .04, .44), vernis, EC, 1.02, EZc, false);
    for (let k = 0; k <= 4; k++) A.ajoute(new THREE.BoxGeometry(.03, .9, .02), acajouC, E1 + k * EL2 / 4, .5, EZc - .21, false);
    A.ajoute(new THREE.BoxGeometry(EL2 - .1, .85, .02), new THREE.MeshStandardMaterial({ color: 0xd9e2e6, metalness: .55, roughness: .08, emissive: 0x3a4246 }), EC, 1.75, FM - .015, false);
    for (const y of [1.45, 1.85, 2.25]) A.ajoute(new THREE.BoxGeometry(EL2, .04, .26), acajou, EC, y, FM - .13, false);
    for (const x of [E0, E1]) A.ajoute(new THREE.BoxGeometry(.05, 1.3, .28), acajou, x, 1.75, FM - .14, false);
    // le comptoir verni, parallèle au mur, du mur de côté jusqu'à 1,6 m de la porte : on entre derrière par son bout
    const C0 = -lpF / 2 - 1.0, C1 = -GX, CC = (C0 + C1) / 2, CLg = C0 - C1, CZ = FM - 1.45;
    A.ajoute(new THREE.BoxGeometry(CLg, 1.05, .5), acajou, CC, .525, CZ);
    A.ajoute(new THREE.BoxGeometry(CLg + .06, .06, .66), vernis, CC, 1.08, CZ + .03, false);                  // le plateau
    for (let k = 0; k < 6; k++) A.ajoute(new THREE.BoxGeometry(CLg / 6 - .12, .7, .03), acajouC, C1 + (k + .5) * CLg / 6, .55, CZ - .26, false);   // panneaux
    const laitonB = A.mat({ color: 0xc9a227, metalness: .75, roughness: .25 });
    const repose = A.ajoute(new THREE.CylinderGeometry(.025, .025, CLg, 10), laitonB, CC, .2, CZ - .38, false); repose.rotation.z = Math.PI / 2;
    obstacles.push([C1, C0 + .15, CZ - .5, CZ + .4]);
    L.surComptoir = [C1 + .35, C1 + .85, C1 + 1.4, C1 + 1.9].map(x => [x, CZ - .12]); L.yComptoir = 1.11;   // (le monde apocalyptique y pose munitions et plantes)
    // deux tabourets devant le comptoir : on s'y assoit et on boit un verre (comme au bar de la salle des fêtes)
    L.tabourets = [];
    for (const tx of [C1 + .85, C1 + 1.65]) { const tz = CZ - .72; L.tabourets.push([tx, tz]);
      A.ajoute(new THREE.CylinderGeometry(.2, .22, .04, 18), A.mat({ color: 0x9a9da1, metalness: .7, roughness: .3 }), tx, .02, tz, false);
      A.ajoute(new THREE.CylinderGeometry(.03, .03, .58, 10), A.mat({ color: 0xc9cdd2, metalness: .8, roughness: .2 }), tx, .31, tz);
      const rp = A.ajoute(new THREE.TorusGeometry(.16, .015, 8, 20), A.mat({ color: 0xc9cdd2, metalness: .8, roughness: .2 }), tx, .26, tz, false); rp.rotation.x = Math.PI / 2;
      A.ajoute(new THREE.CylinderGeometry(.21, .19, .08, 20), A.mat({ color: 0x8e1c22, roughness: .45 }), tx, .62, tz);
      obstacles.push([tx - .12, tx + .12, tz - .12, tz + .12]); }
    // bouteilles et verres : sur les étagères, sur le meuble bas, sur le comptoir
    graine = 61;
    const BOUT = [0x1f5e2e, 0x7a3e10, 0xd8e6e8, 0x2b1a12, 0x9b1c2a, 0xc79a2c].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: .08, metalness: .1, transparent: true, opacity: .88 }));
    const places = [];
    for (const y of [1.04, 1.47, 1.87, 2.27]) for (let x = E1 + .12; x < E0 - .1; x += .11 + alea() * .1) { if (alea() < .12) { x += .25; continue; } places.push([x, y, FM - (y < 1.2 ? .28 : .13), Math.floor(alea() * BOUT.length), .8 + alea() * .5]); }
    for (const x of [C1 + .5, C1 + .62, C0 - .4]) places.push([x, 1.11, CZ + .12, Math.floor(alea() * BOUT.length), 1]);
    const corps = new THREE.CylinderGeometry(.036, .038, .24, 10), col = new THREE.CylinderGeometry(.012, .02, .1, 8), mtx = new THREE.Matrix4(), qq = new THREE.Quaternion();
    BOUT.forEach((m, ci) => { const l = places.filter(p => p[3] === ci); if (!l.length) return;
      const ic = new THREE.InstancedMesh(corps, m, l.length), ik = new THREE.InstancedMesh(col, m, l.length);
      l.forEach(([x, y, z, , k], i) => { ic.setMatrixAt(i, mtx.compose(new THREE.Vector3(x, y + .12 * k, z), qq, new THREE.Vector3(1, k, 1))); ik.setMatrixAt(i, mtx.makeTranslation(x, y + .24 * k + .05, z)); });
      scene.add(ic, ik); });
    const verres = [], verreMat = new THREE.MeshStandardMaterial({ color: 0xe8f2f5, roughness: .05, metalness: .2, transparent: true, opacity: .45 });
    for (let x = C1 + 1.0; x < C1 + 2.0; x += .1) verres.push([x, 1.11, CZ + .2]);
    for (let x = E0 - .9; x < E0 - .1; x += .1) for (const dz of [-.13, -.03]) verres.push([x, 1.04, FM - .2 + dz]);
    const iv = new THREE.InstancedMesh(new THREE.CylinderGeometry(.03, .024, .1, 10), verreMat, verres.length);
    verres.forEach(([x, y, z], i) => iv.setMatrixAt(i, mtx.makeTranslation(x, y + .05, z))); scene.add(iv);
    // les tables rectangulaires contre les murs, et deux fauteuils de bar devant chacune (cuir, dossier arrondi)
    const cuir = A.mat({ color: 0x6e1f1a, roughness: .45 }), pied = A.mat({ color: 0x1a1a1a, metalness: .4, roughness: .4 });
    const dossier = new THREE.MeshStandardMaterial({ color: 0x6e1f1a, roughness: .45, side: THREE.DoubleSide });
    const fauteuil = (x, z, dx, dz) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = Math.atan2(dx, dz); scene.add(g);
      const as = new THREE.Mesh(new THREE.CylinderGeometry(.29, .27, .14, 22), cuir); as.position.y = .44; g.add(as);
      const d = new THREE.Mesh(new THREE.CylinderGeometry(.3, .3, .38, 22, 1, true, Math.PI / 2, Math.PI), dossier); d.position.y = .66; g.add(d);
      const rb = new THREE.Mesh(new THREE.TorusGeometry(.3, .035, 8, 22, Math.PI), cuir); rb.rotation.x = Math.PI / 2; rb.rotation.z = Math.PI; rb.position.y = .85; g.add(rb);
      const pd = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, .37, 8), pied); pd.position.y = .19; g.add(pd);
      const ba = new THREE.Mesh(new THREE.CylinderGeometry(.2, .22, .03, 18), pied); ba.position.y = .015; g.add(ba);
      obstacles.push([x - .32, x + .32, z - .32, z + .32]); };
    const table = (x0, x1, z0, z1) => { const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
      A.ajoute(new THREE.BoxGeometry(x1 - x0, .05, z1 - z0), vernis, cx, .75, cz);
      for (const [a, b] of [[x0 + .06, z0 + .06], [x1 - .06, z0 + .06], [x0 + .06, z1 - .06], [x1 - .06, z1 - .06]]) A.ajoute(new THREE.BoxGeometry(.05, .73, .05), acajou, a, .365, b);
      obstacles.push([x0 - .05, x1 + .05, z0 - .05, z1 + .05]); };
    for (const sg of [-1, 1]) for (const z of [-5.7, -7.6]) { if (sg < 0 && z === -5.7) continue;   // (pas de table à côté des tabourets du bar : on y circule)          // le long des murs de côté
      const xw = sg * GX, x0 = sg > 0 ? xw - .75 : xw, x1 = sg > 0 ? xw : xw + .75; table(x0, x1, z - .6, z + .6);
      for (const dz of [-.33, .33]) fauteuil(xw - sg * 1.12, z + dz, sg, 0); }
    for (const x of [-1.1, 1.1]) { table(x - .6, x + .6, GZ0, GZ0 + .75); for (const dx of [-.33, .33]) fauteuil(x + dx, GZ0 + 1.12, 0, -1); }   // contre le mur du fond
    /* sur la table du fond, côté baby-foot : la vieille télé et la Super Nintendo (cartouches, manette, canette) ;
       on s'en approche, « Jouer à la console », et l'on se retrouve devant la télé avec les jeux de la borne */
    { const tz = -7.6, gris = A.mat({ color: 0xb9b8bd, roughness: .55 }), grisF = A.mat({ color: 0x6f6e75, roughness: .5 }), noirT = A.mat({ color: 0x1d1d20, roughness: .45 });
      const tv = new THREE.Group(); tv.position.set(3.42, .775, tz); scene.add(tv);
      const caisse = new THREE.Mesh(new THREE.BoxGeometry(.46, .5, .62), noirT); caisse.position.y = .27; caisse.castShadow = true; tv.add(caisse);
      const arriere = new THREE.Mesh(new THREE.BoxGeometry(.3, .38, .46), noirT); arriere.position.set(.22, .25, 0); tv.add(arriere);
      const ecranT = tex(toile(320, 240, (x, w, h) => { const g = x.createRadialGradient(w * .55, h * .5, 10, w / 2, h / 2, w * .7); g.addColorStop(0, "#6b4fb8"); g.addColorStop(.5, "#2b2a6e"); g.addColorStop(1, "#0b0c1c");
        x.fillStyle = g; x.fillRect(0, 0, w, h); x.fillStyle = "rgba(255,255,255,.05)"; for (let y = 0; y < h; y += 3) x.fillRect(0, y, w, 1);
        x.fillStyle = "#f4f1ea"; x.font = "bold 26px 'Arial Black', Arial"; x.textAlign = "center"; x.fillText("SUPER NINTENDO", w / 2, h / 2 - 8);
        x.font = "bold 18px 'Courier New', monospace"; x.fillStyle = "#ffd75e"; x.fillText("▶ CHOISIS TON JEU", w / 2, h / 2 + 30); }));
      const ecr = new THREE.Mesh(new THREE.PlaneGeometry(.5, .37), new THREE.MeshStandardMaterial({ map: ecranT, emissive: 0xffffff, emissiveMap: ecranT, emissiveIntensity: .75, roughness: .15 }));
      ecr.rotation.y = -Math.PI / 2; ecr.position.set(-.235, .3, -.02); tv.add(ecr);
      for (let k = 0; k < 5; k++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, .01, 10), grisF); b.rotation.z = Math.PI / 2; b.position.set(-.235, .07, -.12 + k * .035); tv.add(b); }
      const lueur = new THREE.PointLight(0x7c6cff, 1.2, 2.5, 2); lueur.position.set(2.9, 1.1, tz); scene.add(lueur);
      // la Super Nintendo, devant la télé
      const sn = new THREE.Group(); sn.position.set(3.08, .775, tz + .02); scene.add(sn);
      const base = new THREE.Mesh(new THREE.BoxGeometry(.2, .06, .24), gris); base.position.y = .03; sn.add(base);
      const dessus = new THREE.Mesh(new THREE.BoxGeometry(.13, .012, .2), grisF); dessus.position.set(.02, .066, 0); sn.add(dessus);
      const fente = new THREE.Mesh(new THREE.BoxGeometry(.03, .004, .13), noirT); fente.position.set(.03, .074, 0); sn.add(fente);
      for (const [dz, c] of [[-.07, 0x6d6c74], [.07, 0x6d6c74], [0, 0x8b8a92]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(.03, .012, dz ? .03 : .05), A.mat({ color: c })); b.position.set(-.06, .066, dz); sn.add(b); }
      const voy = new THREE.Mesh(new THREE.BoxGeometry(.004, .006, .006), new THREE.MeshBasicMaterial({ color: 0xff5a2a })); voy.position.set(-.1, .045, .09); sn.add(voy);
      // la manette (grise, boutons de couleur) et son fil
      const man = new THREE.Group(); man.position.set(3.0, .78, tz - .3); man.rotation.y = -.4; scene.add(man);
      const corpsM = new THREE.Mesh(new THREE.BoxGeometry(.06, .02, .13), gris); corpsM.position.y = .01; man.add(corpsM);
      for (const sg of [-1, 1]) { const bout = new THREE.Mesh(new THREE.CylinderGeometry(.032, .032, .02, 16), gris); bout.position.set(0, .01, sg * .065); man.add(bout); }
      [[0x2d5fb3, -.012, .07], [0x2e9a4a, 0, .058], [0xd8312a, 0, .082], [0xe9c22c, .012, .07]].forEach(([c, dx, dz]) => { const b = new THREE.Mesh(new THREE.CylinderGeometry(.006, .006, .006, 8), A.mat({ color: c })); b.position.set(dx, .023, dz); man.add(b); });
      const croix = new THREE.Mesh(new THREE.BoxGeometry(.012, .005, .03), noirT); croix.position.set(0, .022, -.065); man.add(croix);
      const croix2 = croix.clone(); croix2.scale.set(2.5, 1, .4); man.add(croix2);
      const fil = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(3.03, .785, tz - .24), new THREE.Vector3(3.1, .78, tz - .15), new THREE.Vector3(3.0, .78, tz - .05)]), 12, .004, 5), noirT); scene.add(fil);
      // comme sur la photo : les cartouches empilées à gauche, la canette rouge à droite de la console
      [[0x2e5fb0, 0], [0x1a1a1a, .025], [0x1a1a1a, .05]].forEach(([c, y]) => A.ajoute(new THREE.BoxGeometry(.13, .024, .19), A.mat({ color: c, roughness: .4 }), 3.2, .79 + y, tz - .45, false));
      const canette = tex(toile(128, 96, (x, w, h) => { x.fillStyle = "#c8102e"; x.fillRect(0, 0, w, h); x.strokeStyle = "#fff"; x.lineWidth = 5;
        x.beginPath(); x.moveTo(0, h * .62); x.bezierCurveTo(w * .3, h * .35, w * .6, h * .9, w, h * .5); x.stroke(); x.fillStyle = "#f4f4f4"; x.font = "italic bold 22px Georgia"; x.fillText("Cola", 30, h * .42); }));
      A.ajoute(new THREE.CylinderGeometry(.034, .034, .12, 18), [A.mat({ map: canette, roughness: .3, metalness: .2 }), A.mat({ color: 0xc9cdd2, metalness: .8, roughness: .3 }), A.mat({ color: 0xc9cdd2, metalness: .8, roughness: .3 })], 3.1, .835, tz + .26, false);
      // sur le mur derrière la télé : les mêmes affiches (Super Mario World, le poster du milieu, Street Fighter II)
      for (const [src, w, h, dz] of [["mario", .55, .62, -.75], ["milieu", .8, .36, 0], ["sf2", .6, .57, .75]]) {
        const im = new Image(), t = new THREE.Texture(im); t.colorSpace = THREE.SRGBColorSpace; im.onload = () => { t.needsUpdate = true; }; im.src = `images/console/${src}.jpg`;
        const af = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t, roughness: .7 })); af.rotation.y = -Math.PI / 2; af.position.set(GX - .012, 1.3 + h / 2, tz + dz); scene.add(af); }
      L.console = [2.15, tz];
      raccourci(L, scene, [.6, .6, .7], [3.35, 1.05, tz], { marche: [2.12, tz] });
    }
    /* une fenêtre sur le mur côté cour (au-dessus du lambris, entre la table et la porte) : par elle, la cour d'honneur, de jour comme de nuit */
    { const zf = (GZ1 - 1.9 + (GZ0 + GZ1) / 2) / 2, yf = 1.95, wf = 1.05, hf = 1.15, cadreF = A.mat({ color: 0xece3cf, roughness: .6 });
      const vue = nuit => tex(toile(384, 300, (x, w, h) => {
        const g = x.createLinearGradient(0, 0, 0, h * .35); g.addColorStop(0, nuit ? "#081128" : "#8fb4d6"); g.addColorStop(1, nuit ? "#1b2a55" : "#cfe0ec"); x.fillStyle = g; x.fillRect(0, 0, w, h * .35);
        if (nuit) { x.fillStyle = "#fff"; for (let k = 0; k < 30; k++) x.fillRect((k * 97) % w, (k * 37) % (h * .3), 1.5, 1.5); }
        x.fillStyle = nuit ? "#2a2d38" : "#9a4a38"; x.fillRect(w * .55, h * .05, w * .45, h * .55);        // l'aile en brique
        x.fillStyle = nuit ? "#3a3a44" : "#e6decb"; x.fillRect(0, h * .3, w * .55, h * .38);              // le bâtiment de plain-pied, ses baies
        for (let X = 10; X < w * .55 - 30; X += 54) { x.fillStyle = nuit ? (X % 108 ? "#ffd58a" : "#1c2232") : "#5d7180"; x.fillRect(X, h * .36, 30, h * .26); }
        for (let r = 0; r < 4; r++) { x.fillStyle = nuit ? (r % 2 ? "#ffd58a" : "#202634") : "#f2eee4"; x.fillRect(w * .7, h * .1 + r * 30, 22, 20); }
        x.fillStyle = nuit ? "#24262e" : "#8d8f94"; x.fillRect(0, h * .68, w, h * .32);                     // les pavés
        for (let y = h * .68; y < h; y += 9) for (let X = (y / 9 % 2) * 7; X < w; X += 14) { x.fillStyle = `rgba(255,255,255,${nuit ? .02 : .06})`; x.fillRect(X, y, 12, 7); } }));
      const tJ = vue(false), tN = vue(true);
      const verre = A.ajoute(new THREE.PlaneGeometry(wf, hf), new THREE.MeshBasicMaterial({ map: tJ }), GX - .02, yf, zf, false); verre.rotation.y = -Math.PI / 2;
      A.ajoute(new THREE.BoxGeometry(.08, .1, wf + .2), cadreF, GX - .04, yf + hf / 2 + .05, zf, false); A.ajoute(new THREE.BoxGeometry(.14, .08, wf + .3), cadreF, GX - .07, yf - hf / 2 - .04, zf, false);   // linteau, appui
      for (const dz of [-1, 1]) A.ajoute(new THREE.BoxGeometry(.08, hf + .2, .1), cadreF, GX - .04, yf, zf + dz * (wf / 2 + .05), false);
      A.ajoute(new THREE.BoxGeometry(.05, hf, .05), cadreF, GX - .03, yf, zf, false); A.ajoute(new THREE.BoxGeometry(.05, .04, wf), cadreF, GX - .03, yf + hf * .18, zf, false);   // les petits bois
      const jour = new THREE.PointLight(0xe8f0ff, 1.4, 4, 1.6); jour.position.set(GX - .6, yf, zf); scene.add(jour);
      L.nuitFenetre = n => { verre.material.map = n ? tN : tJ; verre.material.needsUpdate = true; jour.intensity = n ? .2 : 1.4; }; }
    // le baby-foot, vers le fond à gauche (vu de la porte d'en face, de l'autre côté du bar)
    obstacles.push(babyFoot(A, 2.25, FM - 1.6));
    L.limites = (x, z) => (Math.abs(x) < VX - .35 && z > VZ0 + .3 && z < VZ1 - .3)
      || (Math.abs(x) < .4 && z >= VZ1 - .3 && z < VZ1 + .5)                                               // la porte de l'escalier
      || (Math.abs(z) < VEST_LB / 2 - .25 && x >= VX - .35 && x < VX + .75)                                               // la porte de la cour (BAR), de plain-pied
      || (Math.abs(x) < lpF / 2 - .25 && z > VZ0 - .7 && z <= VZ0 + .3)                                  // la porte d'en face
      || (Math.abs(x) < GX - .4 && z > GZ0 + .4 && z < GZ1 - .65 && !obstacles.some(([a, b, c, d]) => x > a - .15 && x < b + .15 && z > c - .15 && z < d + .15));
    L.portails.push({ dans: (x, z) => Math.abs(x) < .8 && z > VZ1 + .3, vers: "fetes", arrivee: [0, 14.55], yaw: 0 });
    // le vestibule est aussi construit dans la cour d'honneur : y entrer depuis la grande pièce, c'est passer dans la cour (on voit dehors par la porte « BAR »)
    L.portails.push({ dans: (x, z) => z > VZ0 + .25, vers: "grande", arrivee: [VEST_X, VEST_Z + VEST_VZ - .6], yaw: 0 });
    L.sansPNJ = true;
    raccourci(L, scene, [lpE, hp, .4], [0, hp / 2, VZ1 + .5], { vers: "fetes", arrivee: [0, 14.55], yaw: 0 });
    // la caméra reste dans la pièce où elle se trouve (le vestibule est étroit)
    L.contraindreCam = (pos) => { pos.y = Math.min(pos.y, HT - .25);
      if (pos.z > VZ0 - .15) { pos.x = Math.max(-VX + .15, Math.min(VX - .15, pos.x)); pos.z = Math.max(VZ0 + .1, Math.min(pos.z, VZ1 - .1)); }
      else { pos.x = Math.max(-GX + .2, Math.min(GX - .2, pos.x)); pos.z = Math.max(GZ0 + .2, pos.z); } return true; };
    L.interieur = true; L.boite = [-GX, GX, GZ0, VZ1]; L.zone = [-GX, GX, GZ0, VZ1 + .6]; L.plafond = HT - .25;
    L.depart = [0, -3.2]; L.cam = { pos: [0, 2.2, VZ1 - .2], vise: [0, 1.2, GZ0] };
  }
function construireLieu(id, scene, copie = false) {   // copie : la cour vue depuis le sous-sol de la salle des fêtes (sans le bâtiment de droite)
  const A = atelier(scene), T = textures();
  const sol = (map, rx, ry) => { const o = A.ajoute(new THREE.PlaneGeometry(90, 90), A.mat({ map: tex(map, rx, ry) }), 0, 0, 0, false); o.rotation.x = -Math.PI / 2; return o; };
  const L = { portails: [], cam: { pos: [-9, 9, 27], vise: [0, 5, -8] }, sol: null };
  if (id === "rue") construireRue(A, T, L, scene);

  if (id === "grande") {
    /* La cour d'honneur (d'après les photos) :
       - au fond, seul bâtiment à étages : brique rouge, balcons blancs, socle en pierre, passage carré au centre ;
       - à gauche et à droite, deux bâtiments identiques de plain-pied en pierre, grandes baies vitrées, avec leurs marches ;
       - pavés au centre, allées dallées et caniveaux le long des marches. */
    L.sol = sol(T.paves, 30, 30);
    const fondW = 44, fondH = 27, socle = 6.4;
    const fond = toileFondCour();
    // le bâtiment du fond, percé du passage carré (4,8 m × 4,4 m) qu'on traverse
    A.facadePercee({ largeur: fondW, hauteur: fondH, profondeur: 12, toileFacade: fond, passage: { largeur: 4.8, hauteur: 4.4 }, x: 0, z: -18, couleurPassage: 0xcfc4b0 });
    // les balcons en relief
    for (let r = 0; r < 7; r++) for (let c = 1; c < 14; c += 2) A.ajoute(new THREE.BoxGeometry(2.3, .16, .9), A.mat({ color: 0xfbfaf6 }), -fondW / 2 + (c + .5) * fondW / 14, fondH - (34 + r * 112 + 80) / 40, -17.55);
    for (let r = 0; r < 7; r++) for (let c = 0; c < 14; c++) (L.fenetres = L.fenetres || []).push([-fondW / 2 + (c + .5) * fondW / 14, fondH - (34 + r * 112 + 37) / 40, -17.97, 1.5, 1.85, 0]);   // (à barricader, à l'apocalypse)
    // la nuit : des fenêtres allumées çà et là
    L.nuitObjets = []; L.silhouettes = [];
    graine = 77;
    const chaud = new THREE.MeshBasicMaterial({ color: 0xffd58a, transparent: true, opacity: .85 });
    for (let r = 0; r < 7; r++) for (let c = 0; c < 14; c++) if (alea() < .32) {
      const f = new THREE.Mesh(new THREE.PlaneGeometry(1.45, 1.8), chaud); f.position.set(-fondW / 2 + (c + .5) * fondW / 14, fondH - (34 + r * 112 + 37) / 40, -17.97); f.visible = false; scene.add(f); L.nuitObjets.push(f);
      if (alea() < .45) { const s = silhouette(1.45, 1.8); s.position.set(f.position.x, f.position.y, -17.96); scene.add(s); L.nuitObjets.push(s); L.silhouettes.push(s); } }
    /* sous l'horloge, le passage carré mène à la deuxième cour, plus petite (d'après la photo) :
       face à nous, le verso du bâtiment à l'horloge ; en face, un autre bâtiment pareil, percé lui aussi d'un passage carré en son centre */
    if (!copie) deuxiemeCour(A, L, scene);

    // les deux bâtiments de plain-pied, identiques, en pierre, grandes baies vitrées ; au bout du fond, une voûte de garage avec un bus de la gendarmerie
    const LONG = 32, HPP = 7, PROF = 12, VOUTES = [-14.4, -9.8, -5.2];   // trois voûtes au bout du fond
    const piedToile = (voutesPx) => toile(1600, 280, (x, w, h) => {      // 50 px/m en longueur, 40 px/m en hauteur
      pierre(x, 0, 0, w, h, "#e4dccb");
      x.fillStyle = "#d3c9b3"; x.fillRect(0, 0, w, 30); x.fillStyle = "#c9bea7"; x.fillRect(0, 30, w, 5);
      for (let i = 0; i < 11; i++) { const X = 40 + i * 142; if (voutesPx.some(v => Math.abs(X + 50 - v) < 150)) continue;
        x.fillStyle = "#555"; x.fillRect(X - 26, 44, 20, 7);
        fenetre(x, X, 60, 100, 196, "#f2eee4"); x.fillStyle = "#f2eee4"; x.fillRect(X + 32, 60, 3, 196); x.fillRect(X + 65, 60, 3, 196); }
      // encadrement de pierre de la voûte (3,8 m de large = 190 px, 4,8 m de haut)
      const R = 95, ny = h - (4.8 * 40 - 1.9 * 40);
      for (const vp of voutesPx) { x.strokeStyle = "#d6ccb6"; x.lineWidth = 16; x.beginPath(); x.moveTo(vp - R - 8, h); x.lineTo(vp - R - 8, ny); x.ellipse(vp, ny, R + 8, 1.9 * 40 + 8, 0, Math.PI, 0); x.lineTo(vp + R + 8, h); x.stroke(); }
    });
    const bleu = "#2c5bb0", bleuF = "#24498f";
    // autocar standard bleu gendarmerie (sans gyrophare)
    const avantBus = toile(512, 640, (x, w, h) => {
      x.fillStyle = bleu; x.fillRect(0, 0, w, h);
      x.fillStyle = "#1d2a3a"; x.fillRect(40, 22, w - 80, 52);                                     // girouette
      x.fillStyle = "#f6c84a"; x.font = "bold 34px Arial"; x.textAlign = "center"; x.fillText("GENDARMERIE", w / 2, 60);
      const g = x.createLinearGradient(0, 90, 0, 400); g.addColorStop(0, "#7c90a3"); g.addColorStop(1, "#1d2733");
      x.fillStyle = g; x.beginPath(); x.roundRect(22, 90, w - 44, 310, 22); x.fill();                // grand pare-brise
      x.fillStyle = "rgba(255,255,255,.16)"; x.beginPath(); x.moveTo(40, 100); x.lineTo(220, 100); x.lineTo(110, 390); x.lineTo(40, 390); x.fill();
      x.fillStyle = "#fff"; x.fillRect(0, 430, w, 40); x.fillStyle = bleuF; x.font = "bold 30px Arial"; x.fillText("GENDARMERIE", w / 2, 462);
      x.fillStyle = "#f4f1e6"; x.beginPath(); x.roundRect(30, 500, 110, 40, 10); x.roundRect(w - 140, 500, 110, 40, 10); x.fill();   // phares
      x.fillStyle = "#1a1d22"; x.fillRect(0, 570, w, 70);
      x.fillStyle = "#eee"; x.fillRect(w / 2 - 70, 584, 140, 36); x.fillStyle = "#1f3a8a"; x.fillRect(w / 2 - 70, 584, 16, 36);
    });
    const flancBus = toile(1280, 256, (x, w, h) => {
      x.fillStyle = bleu; x.fillRect(0, 0, w, h);
      x.fillStyle = "#2f3d4c"; x.fillRect(30, 26, w - 60, 100);                                       // vitrage continu
      x.fillStyle = bleu; for (let i = 1; i < 9; i++) x.fillRect(30 + i * (w - 60) / 9 - 4, 26, 8, 100);
      x.fillStyle = "#fff"; x.fillRect(0, 140, w, 40); x.fillStyle = bleuF; x.font = "bold 34px Arial"; x.fillText("GENDARMERIE", 420, 172);
      x.fillStyle = "#24498f"; x.fillRect(260, 196, 760, 44);                                         // soutes à bagages
      x.strokeStyle = "#1c3b78"; x.lineWidth = 3; for (let i = 0; i < 4; i++) x.strokeRect(264 + i * 190, 198, 184, 40);
    });
    for (const cote of [-1, 1]) {
      const fx = cote * 12.5, debutCote = scene.children.length;   // (côté droit : marqué, pour la copie vue de la salle des fêtes)
      // façade extrudée (profil dans la longueur), percée de la voûte au bout du fond
      const us = VOUTES.map(VZ => cote < 0 ? -(VZ + 2) : VZ + 2);   // positions des voûtes dans le profil
      // à droite, la salle des fêtes s'arrête 6 m avant le bout : là, en retrait, l'ancien bar
      const FIN = cote > 0 ? LONG / 2 - 6 : LONG / 2;
      const f = new THREE.Shape(); f.moveTo(-LONG / 2, 0); f.lineTo(FIN, 0); f.lineTo(FIN, HPP); f.lineTo(-LONG / 2, HPP); f.closePath();
      for (const u of us) { const v = new THREE.Path(); v.moveTo(u - 1.9, 0); v.lineTo(u - 1.9, 2.9); v.absellipse(u, 2.9, 1.9, 1.9, Math.PI, 0, true); v.lineTo(u + 1.9, 0); v.closePath(); f.holes.push(v); }
      const t = tex(piedToile(us.map(u => (u / LONG + .5) * 1600))); t.repeat.set(1 / LONG, 1 / HPP); t.offset.set(.5, 0);
      if (cote > 0 && !copie) {   // la nuit, on voit bouger les jeux de lumière de la fête à travers les baies vitrées
        const vpx = us.map(u => (u / LONG + .5) * 1600), cols = [0xff2d55, 0x2d7bff, 0x2dff8a, 0xffd22d, 0xc04dff];
        L.baiesFete = [];
        for (let i = 0; i < 11; i++) { const X = 40 + i * 142; if (vpx.some(v => Math.abs(X + 50 - v) < 150)) continue;
          const z = (X + 50) / 50 - 16 - 2; if (z > 7.6) continue;
          const m = new THREE.MeshBasicMaterial({ color: cols[i % cols.length], transparent: true, opacity: .0, blending: THREE.AdditiveBlending, depthWrite: false });
          const pl = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 4.8), m); pl.rotation.y = -Math.PI / 2; pl.position.set(fx - .04, 3.05, z); pl.visible = false; scene.add(pl);
          const fond = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 4.8), new THREE.MeshBasicMaterial({ color: 0x120c22, transparent: true, opacity: .75 })); fond.rotation.y = -Math.PI / 2; fond.position.set(fx - .03, 3.05, z); fond.visible = false; scene.add(fond);
          L.baiesFete.push({ pl, fond, i }); L.nuitObjets.push(pl, fond);
          if (i === 8) {
            // la nuit, une des portes vitrées de la salle des fêtes reste ouverte : la lumière et la musique sortent dans la cour
            fond.material = new THREE.MeshBasicMaterial({ color: 0x5a3a2a }); pl.material.opacity = 1;
            const battant = new THREE.Group(); battant.position.set(fx - .06, .65, z + .95); battant.rotation.y = 1.25; battant.visible = false; scene.add(battant);
            const cadre = A.mat({ color: 0xf2eee4 });
            // le cadre du battant : deux montants et trois traverses
            for (const [h, l, y, zz] of [[4.8, .1, 2.4, -.05], [4.8, .1, 2.4, -.9], [.1, .95, 4.75, -.475], [.1, .95, .05, -.475], [.08, .95, 1.6, -.475]]) {
              const b = new THREE.Mesh(new THREE.BoxGeometry(.06, h, l), cadre); b.position.set(0, y, zz); battant.add(b); }
            const verre = new THREE.Mesh(new THREE.BoxGeometry(.02, 4.7, .8), new THREE.MeshStandardMaterial({ color: 0xcfe0ea, transparent: true, opacity: .35, roughness: .1 })); verre.position.set(0, 2.4, -.475); battant.add(verre);
            L.nuitObjets.push(battant);
            const vide = new THREE.Mesh(new THREE.PlaneGeometry(.95, 4.8), new THREE.MeshBasicMaterial({ color: 0xffe0b0 })); vide.rotation.y = -Math.PI / 2; vide.position.set(fx - .05, 3.05, z + .475); vide.visible = false; scene.add(vide); L.nuitObjets.push(vide);
            // la lumière de la fête qui se répand sur les marches et les pavés
            const spot = new THREE.SpotLight(0xff3d7a, 0, 16, .75, .7, 1.2); spot.position.set(fx + .8, 3.6, z); spot.target.position.set(fx - 6, 0, z - .5); scene.add(spot); scene.add(spot.target);
            L.porteFete = { vide, spot, x: fx - .5, z }; }
        }
      }
      if (cote > 0 && copie === "fetes") {   // copie : seulement le bout de la façade, côté renfoncement (le reste est la salle des fêtes elle-même)
        const fb = new THREE.Shape(); fb.moveTo(6.6, 0); fb.lineTo(FIN, 0); fb.lineTo(FIN, HPP); fb.lineTo(6.6, HPP); fb.closePath();
        const b2 = A.ajoute(new THREE.ExtrudeGeometry(fb, { depth: 3.5, bevelEnabled: false }), [A.mat({ map: t }), A.mat({ color: 0xd9d0bd })], fx + 3.5, 0, -2); b2.rotation.y = -Math.PI / 2;
      }
      else if (cote < 0) { const bat = A.ajoute(new THREE.ExtrudeGeometry(f, { depth: PROF, bevelEnabled: false, curveSegments: 20 }), [A.mat({ map: t }), A.mat({ color: 0xd9d0bd })], fx - PROF, 0, -2); bat.rotation.y = Math.PI / 2; }
      else {
        /* à droite : derrière le bout de la façade, il faut la place du vestibule du sous-sol et de son escalier (porte « BAR ») ;
           le bâtiment s'arrête donc plus tôt (z = 1,3 dans la cour), et seule une tranche de 3,5 m de façade continue jusqu'au renfoncement */
        const ZC = 2.4, mF = [A.mat({ map: t }), A.mat({ color: 0xd9d0bd })];
        const fa = new THREE.Shape(); fa.moveTo(-LONG / 2, 0); fa.lineTo(ZC, 0); fa.lineTo(ZC, HPP); fa.lineTo(-LONG / 2, HPP); fa.closePath(); fa.holes = f.holes;
        const fb = new THREE.Shape(); fb.moveTo(ZC, 0); fb.lineTo(FIN, 0); fb.lineTo(FIN, HPP); fb.lineTo(ZC, HPP); fb.closePath();
        const b1 = A.ajoute(new THREE.ExtrudeGeometry(fa, { depth: PROF, bevelEnabled: false, curveSegments: 20 }), mF, fx + PROF, 0, -2); b1.rotation.y = -Math.PI / 2;
        const b2 = A.ajoute(new THREE.ExtrudeGeometry(fb, { depth: 3.5, bevelEnabled: false }), mF, fx + 3.5, 0, -2); b2.rotation.y = -Math.PI / 2;
        const xv = VEST_X + VEST_VX + .35;   // au-delà du vestibule : le reste du bâtiment, et un toit au-dessus du vestibule et de l'escalier
        A.ajoute(new THREE.BoxGeometry(fx + PROF - xv, HPP, FIN - ZC), A.mat({ color: 0xd9d0bd }), (xv + fx + PROF) / 2, HPP / 2, (ZC + FIN) / 2 - 2);
        A.ajoute(new THREE.BoxGeometry(xv - fx - 3.5, .3, FIN - ZC), A.mat({ color: 0xd9d0bd }), (xv + fx + 3.5) / 2, HPP - .15, (ZC + FIN) / 2 - 2, false);
      }
      if (!(copie === "fetes" && cote > 0)) {
      A.ajoute(new THREE.BoxGeometry(PROF + .6, .45, (cote > 0 ? LONG - 6 : LONG) + .6), A.mat({ color: 0xd3c9b3 }), fx + cote * PROF / 2, HPP + .2, cote > 0 ? -5 : -2);   // corniche du toit
      for (const VZ of VOUTES) A.ajoute(new THREE.BoxGeometry(.3, 4.8, 3.8), A.mat({ color: 0x3a3631 }), fx + cote * (PROF - .4), 2.4, VZ);   // fond des garages
      // les marches le long du bâtiment, arrêtées avant la voûte
      for (let k = 0; k < 4; k++) { const larg = 2 - k * .45, lgM = cote > 0 ? 10.4 : 16.4; A.ajoute(new THREE.BoxGeometry(larg, .17, lgM), A.mat({ color: k % 2 ? 0xbdb7aa : 0xc9c3b6 }), fx - cote * larg / 2, .085 + k * .17, cote > 0 ? 2.7 : 5.7); }
      }
      if (cote > 0) {
        /* l'ancien bar, bien en retrait au bout du bâtiment (entre la salle des fêtes et la grande aile en brique) :
           la double porte à gauche, ses deux fenêtres à droite */
        const RX = fx + 3.5, RL = 4, RH = 6.2, RZ = 10;
        const bar = toile(200, 310, (x, w, h) => {
          pierre(x, 0, 0, w, h, "#e2dac8"); x.fillStyle = "#d3c9b3"; x.fillRect(0, 0, w, 16); x.fillStyle = "rgba(60,45,30,.25)"; x.fillRect(0, 16, w, 3);
          const PX = 14, PY = h - 150, PW = 84, PH = 150;
          // l'embrasure, sans porte : un vrai trou dans la façade (le vestibule est construit derrière, on y entre sans coupure)
          { const TX = 16, TW = 80, TH = 115; x.fillStyle = "#efe9dc"; x.fillRect(TX - 7, h - TH - 7, TW + 14, TH + 7); x.clearRect(TX, h - TH, TW, TH); }
          x.fillStyle = "rgba(120,70,40,.45)"; x.font = "bold 26px Georgia"; x.textAlign = "center"; x.fillText("B A R", PX + PW / 2, PY - 52);
          x.fillStyle = "#2a2a2a"; x.fillRect(PX + PW / 2 - 6, PY - 96, 12, 8);
          // les deux fenêtres, à droite de la porte
          for (const cx of [128, 176]) { const FX = cx - 20, FY = h - 168, FW = 40, FH = 92;
            x.fillStyle = "#efe9dc"; x.fillRect(FX - 6, FY - 6, FW + 12, FH + 12); x.fillStyle = "#d6cdbb"; x.fillRect(FX - 8, FY + FH + 4, FW + 16, 6);
            const g = x.createLinearGradient(FX, FY, FX, FY + FH); g.addColorStop(0, "#9db1bf"); g.addColorStop(1, "#56697a"); x.fillStyle = g; x.fillRect(FX, FY, FW, FH);
            x.fillStyle = "#f4f1ea"; x.fillRect(FX + FW / 2 - 2, FY, 4, FH); for (const f2 of [1 / 3, 2 / 3]) x.fillRect(FX, FY + FH * f2, FW, 2.5); }
        });
        const mb = A.mat({ map: tex(bar), alphaTest: .5 }), mc = A.mat({ color: 0xddd4c2 }), mt = A.mat({ color: 0x8a8378 });
        // la façade (avec son embrasure), le bâtiment derrière le vestibule, le plein au-dessus du vestibule
        const fa = A.ajoute(new THREE.PlaneGeometry(RL, RH), mb, RX - .17, RH / 2, RZ, false); fa.rotation.y = -Math.PI / 2;
        if (!copie) { const xv = VEST_X + VEST_VX + .35;
          A.ajoute(new THREE.BoxGeometry(fx + PROF - xv, RH, RL), [mc, mc, mt, mc, mc, mc], (xv + fx + PROF) / 2, RH / 2, RZ);
          A.ajoute(new THREE.BoxGeometry(xv - RX, RH - 3.4, RL), [mc, mc, mt, mc, mc, mc], (RX + xv) / 2, 3.4 + (RH - 3.4) / 2, RZ, false); }
        // le vestibule du sous-sol, juste derrière (le même que dans le sous-sol : carrelage, lambris, l'escalier de la salle des fêtes, la porte de la grande pièce)
        if (!copie) { const grp = new THREE.Group(); grp.position.set(VEST_X, 0, VEST_Z); grp.rotation.y = Math.PI; scene.add(grp); const AV = atelier(grp);
          vestibuleSousSol(AV, grp, { plafond: true, escalierFete: true });
          // par la porte d'en face : un aperçu de la grande pièce (parquet foncé, lambris, le bar et ses bouteilles au fond)
          const parquetA = AV.mat({ map: tex(toileParquet(), .55, 1.1), roughness: .3 });
          const AZ = -VEST_VZ - 1.6;      // le milieu de l'aperçu
          const pq = AV.ajoute(new THREE.PlaneGeometry(1.3, 2.6), parquetA, 0, .01, AZ, false); pq.rotation.x = -Math.PI / 2;
          const peintA = AV.mat({ color: 0xe6d9bd, roughness: .95 }), lambA = AV.mat({ map: tex(toileLambris(), .5, 1), roughness: .45 });
          for (const sg of [-1, 1]) { AV.ajoute(new THREE.BoxGeometry(.3, 3.1, 2.6), peintA, sg * .8, 1.55, AZ, false); AV.ajoute(new THREE.BoxGeometry(.04, 1.15, 2.6), lambA, sg * .63, .575, AZ, false); }
          AV.ajoute(new THREE.BoxGeometry(1.9, .3, 2.6), AV.mat({ color: 0xece4d2 }), 0, 3.25, AZ, false);
          const fondBar = tex(toile(256, 400, (c, w, hh) => { c.fillStyle = "#e6d9bd"; c.fillRect(0, 0, w, hh); c.fillStyle = "#8a4a22"; c.fillRect(0, hh * .63, w, hh * .37);
            c.fillStyle = "#4a2010"; c.fillRect(20, hh * .2, w - 40, 8); c.fillRect(20, hh * .34, w - 40, 8); c.fillRect(20, hh * .48, w - 40, 8); c.fillStyle = "#cfd8dc"; c.fillRect(24, hh * .1, w - 48, hh * .38);
            graine = 77; for (const y of [.2, .34, .48]) for (let X = 30; X < w - 34; X += 14) { c.fillStyle = ["#1f5e2e", "#7a3e10", "#9b1c2a", "#c79a2c", "#e8e8e8"][Math.floor(alea() * 5)]; c.fillRect(X, hh * y - 30, 8, 30); c.fillRect(X + 2, hh * y - 40, 4, 10); }
            c.fillStyle = "#3e1c0c"; c.fillRect(0, hh * .6, w, 14); }));
          const fb = AV.ajoute(new THREE.PlaneGeometry(1.3, 3.1), new THREE.MeshBasicMaterial({ map: fondBar }), 0, 1.55, AZ - 1.25, false);
          const la = new THREE.PointLight(0xffe2b8, 2, 4, 1.5); la.position.set(0, 2.5, AZ); grp.add(la); }
        A.ajoute(new THREE.BoxGeometry(.4, .35, RL), A.mat({ color: 0xd3c9b3 }), RX - .1, RH + .1, RZ);                     // sa corniche
        A.ajoute(new THREE.BoxGeometry(.9, .17, 2.3), A.mat({ color: 0xc9c3b6 }), RX - .45, .085, RZ - 1.05);              // la marche devant la porte
        const sl = A.ajoute(new THREE.PlaneGeometry(3.5, RL), A.mat({ map: tex(T.dalles, 2, 2) }), fx + 1.75, .014, RZ, false); sl.rotation.x = -Math.PI / 2;
        const lt = new THREE.PointLight(0xffd59a, 12, 8, 1.6); lt.position.set(RX - .5, 3.6, RZ - 1.1); lt.visible = false; scene.add(lt); L.nuitObjets.push(lt);
        // l'embrasure, sans porte : on entre de plain-pied dans le vestibule (le bar, la console)
        const PZ0 = RZ - 2 + 14 / 200 * RL, PWm = 84 / 200 * RL;
        const lueurBar = new THREE.PointLight(0xffc98a, 3, 4, 1.5); lueurBar.position.set(RX - .6, 1.6, PZ0 + PWm / 2); scene.add(lueurBar);
        L.porteBar = [RX, PZ0 + PWm / 2];
      }
      const al = A.ajoute(new THREE.PlaneGeometry(3, 34), A.mat({ map: tex(T.dalles, 1.5, 17) }), fx - cote * 3.5, .012, -2, false); al.rotation.x = -Math.PI / 2;
      const cn = A.ajoute(new THREE.PlaneGeometry(.22, 34), A.mat({ color: 0x4a4744 }), fx - cote * 5.1, .016, -2, false); cn.rotation.x = -Math.PI / 2;
      // un autocar bleu gendarmerie dans chaque voûte, l'avant vers la cour
      const caisseMat = A.mat({ color: 0x2c5bb0, roughness: .4, metalness: .2 }), fa = A.mat({ map: tex(avantBus), roughness: .4 }), fl = A.mat({ map: tex(flancBus), roughness: .4 });
      for (const VZ of (copie === "fetes" && cote > 0 ? [] : VOUTES)) {
        const car = new THREE.Group(); car.position.set(fx + cote * 6.2, 0, VZ); car.rotation.y = cote < 0 ? Math.PI / 2 : -Math.PI / 2; scene.add(car);
        const caisse = new THREE.Mesh(new THREE.BoxGeometry(2.5, 3.3, 11), [fl, fl, caisseMat, caisseMat, fa, caisseMat]); caisse.position.y = 1.95; caisse.castShadow = true; car.add(caisse);
        for (const [rx, rz] of [[-1.15, 3.6], [1.15, 3.6], [-1.15, -3], [1.15, -3], [-1.15, -4.3], [1.15, -4.3]]) { const roue = new THREE.Mesh(new THREE.CylinderGeometry(.5, .5, .35, 18), A.mat({ color: 0x151515 })); roue.rotation.z = Math.PI / 2; roue.position.set(rx, .5, rz); car.add(roue); }
      }
      if (cote > 0) for (const o of scene.children.slice(debutCote)) o.userData.droite = true;
    }
    // derrière : les vieux immeubles parisiens (la caserne est en plein Paris)
    const teintes = ["#e6dcc6", "#ece3cf", "#dfd3bb", "#e9e0cc"], immeubles = [];
    [[-32, 9, 4], [-21, 11, 5], [-9, 12, 5], [4.5, 13, 6], [17, 10, 5]].forEach(([z, l, e], i) => {
      immeubles.push(A.haussmann({ x: -27, z, largeur: l, etages: e, rot: Math.PI / 2, teinte: teintes[i % 4], graine: 11 + i }));
      immeubles.push(A.haussmann({ x: 27, z: z + 2, largeur: l, etages: e + (i % 2 ? -1 : 0), rot: -Math.PI / 2, teinte: teintes[(i + 2) % 4], graine: 31 + i })); });
    [[-33, 14, 6], [33, 14, 6]].forEach(([x, l, e], i) => immeubles.push(A.haussmann({ x, z: -34, largeur: l, etages: e, rot: 0, teinte: teintes[i + 1], graine: 51 + i })));
    for (const im of immeubles) { L.nuitObjets.push(...im.userData.nuit); L.silhouettes.push(...im.userData.silhouettes); }
    const fer2 = A.mat({ color: 0x1b1b1b, metalness: .5, roughness: .5 });
    /* --- l'autre façade de la cour (derrière nous en arrivant) : c'est son porche carré qui mène à la rue.
       Socle en pierre claire (portes rouges aux deux bouts, emblème sculpté au-dessus du porche), cinq étages de brique
       aux fenêtres cerclées de pierre blanche, corniche blanche, grand toit mansardé d'ardoise à deux rangs de lucarnes ;
       de part et d'autre, deux hautes ailes en brique avec leur bande vitrée. */
    const ZF = 15.5, LF = 25, HSOC = 4.6, HB = 20.2, PF2 = 14, CF = []; for (let k = 0; k < 8; k++) CF.push(-LF / 2 + (k + .5) * LF / 8);
    graine = 15;
    const gX = X => (X + LF / 2) * 40, gY = Y => (HB - Y) * 40;
    const face2 = toile(LF * 40, HB * 40, (x, w, h) => {
      briquesFines(x, w, gY(HSOC));
      // le socle en pierre : assises régulières, joints rayonnants au-dessus des baies
      x.fillStyle = "#e4dbcb"; x.fillRect(0, gY(HSOC), w, h - gY(HSOC));
      x.fillStyle = "rgba(120,100,70,.2)"; for (let y = gY(HSOC) + 22; y < h; y += 24) { x.fillRect(0, y, w, 1.5); for (let X = (Math.round(y / 24) % 2) * 40; X < w; X += 80) x.fillRect(X, y - 24, 1.5, 24); }
      x.fillStyle = "#d8cebc"; x.fillRect(0, gY(HSOC) - 4, w, 12); x.fillStyle = "rgba(60,45,30,.3)"; x.fillRect(0, gY(HSOC) + 8, w, 3);
      const baie = (cx, l, b, t, porte) => { const X = gX(cx - l / 2), Y = gY(t), W2 = l * 40, H2 = gY(b) - gY(t);
        x.strokeStyle = "rgba(110,90,60,.35)"; x.lineWidth = 1.5; for (let k = -3; k <= 3; k++) { x.beginPath(); x.moveTo(X + W2 / 2 + k * W2 / 7, Y); x.lineTo(X + W2 / 2 + k * W2 / 4.2, Y - 30); x.stroke(); }
        x.fillStyle = "#efe9dd"; x.fillRect(X - 7, Y - 7, W2 + 14, H2 + 7);
        if (porte) { x.fillStyle = "#b8452f"; x.fillRect(X, Y, W2, H2); x.fillStyle = "#e9d7c8"; x.fillRect(X + 8, Y + 8, W2 - 16, H2 * .55); x.fillStyle = "#b8452f"; x.fillRect(X + W2 / 2 - 2, Y + 8, 4, H2 * .55); }
        else { const g = x.createLinearGradient(X, Y, X, Y + H2); g.addColorStop(0, "#56677a"); g.addColorStop(1, "#2c3642"); x.fillStyle = g; x.fillRect(X, Y, W2, H2);
          x.fillStyle = "#f4f1ea"; x.fillRect(X + W2 / 2 - 2, Y, 4, H2); x.fillRect(X, Y + H2 * .62, W2, 3); for (const f of [.33, .66]) x.fillRect(X + W2 * f - 1, Y, 2, H2 * .62); }
        x.fillStyle = "#2a2a2a"; x.fillRect(X + W2 / 2 - 6, Y - 22, 12, 7); };   // la petite applique au-dessus
      for (const k of [2, 5]) baie(CF[k], 1.7, .9, 3.15, false);
      // au-dessus du porche : l'emblème sculpté (une flamme dans un médaillon)
      const ex = gX(-1.9), ey = gY(4.55); x.fillStyle = "#d9cfbd"; x.beginPath(); x.ellipse(ex, ey + 18, 16, 22, 0, 0, 7); x.fill();
      x.strokeStyle = "#b8ad99"; x.lineWidth = 2; x.stroke(); x.fillStyle = "#c7bca8"; x.beginPath(); x.moveTo(ex, ey + 2); x.quadraticCurveTo(ex + 12, ey + 18, ex, ey + 36); x.quadraticCurveTo(ex - 12, ey + 18, ex, ey + 2); x.fill();
      x.fillStyle = "#d8cebc"; x.fillRect(gX(-2.1), gY(4.15), gX(2.1) - gX(-2.1), 10);   // le linteau du porche
      // le panneau d'affichage et le sens interdit, à droite du porche
      x.fillStyle = "#f4f4f2"; x.fillRect(gX(2.6), gY(2.6), 40, 30); x.strokeStyle = "#999"; x.lineWidth = 1; x.strokeRect(gX(2.6), gY(2.6), 40, 30);
      x.fillStyle = "#c8102e"; x.beginPath(); x.arc(gX(2.25), gY(2.75), 9, 0, 7); x.fill(); x.fillStyle = "#fff"; x.fillRect(gX(2.25) - 6, gY(2.75) - 2, 12, 4);
      // les cinq étages de brique : fenêtres cerclées de pierre blanche, barre d'appui, quelques voilages
      for (let f = 0; f < 5; f++) for (const cx of CF) {
        const b = HSOC + .55 + f * 3, X = gX(cx - .72), Y = gY(b + 1.75), W2 = 58, H2 = 70;
        x.fillStyle = "rgba(40,20,20,.3)"; x.fillRect(X - 7, Y - 4, W2 + 16, H2 + 14);
        x.fillStyle = "#f1ece2"; x.fillRect(X - 10, Y - 10, W2 + 20, H2 + 16); x.fillStyle = "#e6e0d4"; x.fillRect(X - 14, Y + H2 + 4, W2 + 28, 6);
        const g = x.createLinearGradient(X, Y, X + W2, Y + H2); g.addColorStop(0, "#9fb6c6"); g.addColorStop(.6, "#62798b"); g.addColorStop(1, "#4b5d6d"); x.fillStyle = g; x.fillRect(X, Y, W2, H2);
        if (alea() < .3) { x.fillStyle = "rgba(250,248,242,.85)"; x.fillRect(X + 2, Y + 2, W2 - 4, H2 - 4); x.fillStyle = "rgba(0,0,0,.08)"; for (let l = X + 6; l < X + W2; l += 6) x.fillRect(l, Y + 2, 1, H2 - 4); }
        x.fillStyle = "#fbfaf6"; x.fillRect(X + W2 / 2 - 2, Y, 4, H2); x.fillRect(X, Y + H2 * .38, W2, 3); x.fillRect(X, Y, W2, 3); x.fillRect(X, Y + H2 - 3, W2, 3);
        x.strokeStyle = "#1b1b1b"; x.lineWidth = 2; x.beginPath(); x.moveTo(X, Y + H2 - 14); x.lineTo(X + W2, Y + H2 - 14); x.stroke(); for (let l = X; l <= X + W2; l += 7) { x.beginPath(); x.moveTo(l, Y + H2 - 14); x.lineTo(l, Y + H2 - 3); x.stroke(); }
        if (alea() < .12) { x.fillStyle = "#4f7a3c"; for (let k = 0; k < 4; k++) { x.beginPath(); x.arc(X + 10 + k * 13, Y + H2 - 18, 5, 0, 7); x.fill(); } }
      }
      // la corniche blanche
      x.fillStyle = "#f0ebe0"; x.fillRect(0, 0, w, 22); x.fillStyle = "rgba(60,40,30,.35)"; x.fillRect(0, 22, w, 4);
    });
    const f2 = A.facadePercee({ largeur: LF, hauteur: HB, profondeur: PF2, toileFacade: face2, passage: { largeur: 4.8, hauteur: 4.4 }, x: 0, z: ZF, couleurPassage: 0xd9cfbd });
    f2.rotation.y = Math.PI; f2.position.z = ZF + PF2; f2.castShadow = false;
    if (f2.userData.toit) f2.userData.toit.position.z = ZF + PF2 / 2;
    A.ajoute(new THREE.BoxGeometry(LF + .3, .45, .5), A.mat({ color: 0xf0ebe0 }), 0, HB - .3, ZF - .2);                  // corniche en relief
    A.ajoute(new THREE.BoxGeometry(LF, .25, .25), A.mat({ color: 0xd8cebc }), 0, HSOC + .05, ZF - .12, false);           // bandeau du socle
    // au bout du porche : la rue, à travers la grille (la Presse des Clubs, l'Artisan Boulanger)
    // le passage, vu de la cour : le même que celui qu'on traverse depuis la rue (prolongement de la cour)
    { const grp = new THREE.Group(); grp.position.z = ZF + 26; scene.add(grp); decorPassage(atelier(grp), T, L, grp, -12); }
    const vueRue = A.ajoute(new THREE.PlaneGeometry(4.8, 4.4), new THREE.MeshBasicMaterial({ map: tex(toile(256, 284, (x, w, h) => {
      x.fillStyle = "#e7dfcf"; x.fillRect(0, 0, w, h); x.fillStyle = "#cfc6b4"; x.fillRect(0, 0, w, 60);
      x.fillStyle = "#121212"; x.fillRect(0, 70, 130, 26); x.fillStyle = "#fff"; x.font = "bold 17px Impact, Arial"; x.textAlign = "center"; x.fillText("PRESSE DES CLUBS", 62, 90);
      x.fillStyle = "#1b2537"; x.fillRect(134, 66, 122, 32); x.fillStyle = "#f0e2bf"; x.font = "italic bold 18px Georgia"; x.fillText("Artisan", 190, 88);
      for (let i = 0; i < 30; i++) { x.fillStyle = `hsl(${alea() * 360}, 60%, 55%)`; x.fillRect(8 + (i % 6) * 20, 104 + Math.floor(i / 6) * 22, 17, 19); }
      x.fillStyle = "#f0d9a6"; x.fillRect(140, 104, 110, 110); x.fillStyle = "#7d7a74"; x.fillRect(0, 222, w, h - 222);
      x.fillStyle = "#151515"; for (let X = 4; X < w; X += 13) x.fillRect(X, 96, 3, 188); x.fillRect(0, 120, w, 4); x.fillRect(0, 260, w, 4); })) }), 0, 2.2, ZF + PF2 - .05, false);
    vueRue.rotation.y = Math.PI;
    const vueNuit = A.ajoute(new THREE.PlaneGeometry(4.8, 4.4), new THREE.MeshBasicMaterial({ color: 0x1a2030, transparent: true, opacity: .7 }), 0, 2.2, ZF + PF2 - .1, false);
    vueNuit.rotation.y = Math.PI; vueNuit.visible = false; L.nuitObjets.push(vueNuit);
    // le toit mansardé d'ardoise : brisis presque vertical, terrasson, garde-corps au sommet
    const ardoise = A.mat({ color: 0x3d4452, roughness: .6, metalness: .15 });
    const prf = new THREE.Shape(); prf.moveTo(0, 0); prf.lineTo(PF2, 0); prf.lineTo(PF2 - .9, 4.4); prf.lineTo(PF2 - 2.6, 6); prf.lineTo(2.6, 6); prf.lineTo(.9, 4.4); prf.closePath();
    const toit2 = new THREE.Mesh(new THREE.ExtrudeGeometry(prf, { depth: LF, bevelEnabled: false }), ardoise); toit2.rotation.y = -Math.PI / 2; toit2.position.set(LF / 2, HB, ZF); toit2.castShadow = true; scene.add(toit2);
    const blancL = A.mat({ color: 0xf2efe8 }), vitreL = A.mat({ color: 0x46566a, roughness: .2 });
    const fronton = new THREE.Shape(); fronton.moveTo(-.85, 0); fronton.lineTo(.85, 0); fronton.lineTo(0, .55); fronton.closePath();
    for (const cx of CF) {
      // rang du bas : grandes lucarnes à fronton triangulaire
      A.ajoute(new THREE.BoxGeometry(1.45, 2.1, 1.3), blancL, cx, HB + 1.35, ZF + .5);
      const v = A.ajoute(new THREE.PlaneGeometry(.95, 1.5), vitreL, cx, HB + 1.25, ZF - .16, false); v.rotation.y = Math.PI;
      const fr = new THREE.Mesh(new THREE.ExtrudeGeometry(fronton, { depth: 1.3, bevelEnabled: false }), blancL); fr.position.set(cx, HB + 2.4, ZF - .15); scene.add(fr);
      // rang du haut : petites lucarnes
      A.ajoute(new THREE.BoxGeometry(1.05, 1.5, 1), blancL, cx, HB + 4.75, ZF + 1.6);
      const v2 = A.ajoute(new THREE.PlaneGeometry(.65, 1), vitreL, cx, HB + 4.7, ZF + 1.09, false); v2.rotation.y = Math.PI;
      const c2 = A.ajoute(new THREE.ConeGeometry(.78, .5, 4), ardoise, cx, HB + 5.75, ZF + 1.6); c2.rotation.y = Math.PI / 4;
      if (alea() < .3) { const lu = new THREE.Mesh(new THREE.PlaneGeometry(.9, 1.45), lumiere()); lu.rotation.y = Math.PI; lu.position.set(cx, HB + 1.25, ZF - .17); lu.visible = false; scene.add(lu); L.nuitObjets.push(lu); }
    }
    for (let k = 0; k <= 16; k++) A.ajoute(new THREE.BoxGeometry(.04, .9, .04), fer2, -LF / 2 + k * LF / 16, HB + 6.45, ZF + 2.7, false);
    A.ajoute(new THREE.BoxGeometry(LF, .05, .05), fer2, 0, HB + 6.9, ZF + 2.7, false);
    // les deux hautes ailes en brique (comme deux grandes colonnes), qui avancent dans la cour : leur bande vitrée blanche,
    // et au pied, sur le mur tourné vers la cour, la porte rouge et sa fenêtre
    const AX0 = 8.6, AX1 = 16.5, AW = AX1 - AX0, AZ0 = 12, AZ1 = 26, AH = 26;
    const toileAile = (visibleAGauche) => toile(Math.round(AW * 40), AH * 40, (x, w, h) => { briquesFines(x, w, h);
      const v0 = visibleAGauche ? 0 : w - (12.5 - AX0) * 40, vw = (12.5 - AX0) * 40, sx = v0 + vw / 2 - 22;   // la partie qui donne sur la cour
      x.fillStyle = "#f0ebe0"; x.fillRect(0, 0, w, 14);
      x.fillStyle = "#e4dbcb"; x.fillRect(0, h - 184, w, 184); x.fillStyle = "rgba(120,100,70,.2)"; for (let y = h - 162; y < h; y += 24) x.fillRect(0, y, w, 1.5);
      x.fillStyle = "#d8cebc"; x.fillRect(0, h - 190, w, 10);
      // sur la face tournée vers la cour : une seule fenêtre, centrée
      const fenX = v0 + vw / 2 - 34;
      x.fillStyle = "#efe9dd"; x.fillRect(fenX - 7, h - 133, 82, 101); const g = x.createLinearGradient(0, h - 126, 0, h - 38); g.addColorStop(0, "#56677a"); g.addColorStop(1, "#2c3642"); x.fillStyle = g; x.fillRect(fenX, h - 126, 68, 88);
      x.fillStyle = "#f4f1ea"; x.fillRect(fenX + 32, h - 126, 4, 88); x.fillRect(fenX, h - 72, 68, 3); x.fillStyle = "#2a2a2a"; x.fillRect(fenX + 28, h - 152, 12, 7); });
    // l'autre face de l'aile, tournée vers le porche : la porte rouge (seule la partie devant la façade se voit)
    const toileCote = (visibleAGauche, avecPorte) => toile((AZ1 - AZ0) * 40, AH * 40, (x, w, h) => { briquesFines(x, w, h);
      x.fillStyle = "#f0ebe0"; x.fillRect(0, 0, w, 14);
      x.fillStyle = "#e4dbcb"; x.fillRect(0, h - 184, w, 184); x.fillStyle = "rgba(120,100,70,.2)"; for (let y = h - 162; y < h; y += 24) x.fillRect(0, y, w, 1.5);
      x.fillStyle = "#d8cebc"; x.fillRect(0, h - 190, w, 10);
      if (!avecPorte) return;
      const vw = (ZF - AZ0) * 40, v0 = visibleAGauche ? 0 : w - vw, px = v0 + vw / 2 - 28;
      // la colonne de fenêtres, au-dessus de la porte
      x.fillStyle = "#f1ece2"; x.fillRect(px + 6, 60, 44, h - 260); for (let y = 66; y < h - 206; y += 22) { x.fillStyle = "#8ea2b2"; x.fillRect(px + 12, y, 32, 17); }
      // la porte, en bois marron
      // la porte a sauté : par l'embrasure, la cage d'escalier (murs beiges, les premières marches carrelées, une ampoule)
      x.fillStyle = "#efe9dd"; x.fillRect(px - 7, h - 122, 70, 122);
      { const g = x.createLinearGradient(0, h - 115, 0, h); g.addColorStop(0, "#5a5244"); g.addColorStop(1, "#9a8e76"); x.fillStyle = g; x.fillRect(px, h - 115, 56, 115);
        for (let k = 0; k < 6; k++) { x.fillStyle = `rgb(${200 - k * 14},${178 - k * 13},${130 - k * 10})`; x.fillRect(px + 4, h - 10 - k * 13, 48, 6); }
        x.fillStyle = "#fff1c8"; x.beginPath(); x.arc(px + 28, h - 104, 3, 0, 7); x.fill(); x.fillStyle = "rgba(255,230,170,.2)"; x.fillRect(px, h - 115, 56, 50); } x.fillStyle = "#2a2a2a"; x.fillRect(px + 22, h - 140, 12, 7); });
    const briqueSeule = A.mat({ map: tex(toileCote(true, false)) });
    for (const s of (copie === "fetes" ? [-1] : [-1, 1])) { const face = A.mat({ map: tex(toileAile(s < 0)) }), interieur = A.mat({ map: tex(toileCote(s > 0, true)) }), toitA = A.mat({ color: 0x6b6b6b });
      const mats = s > 0 ? [briqueSeule, interieur, toitA, toitA, briqueSeule, face] : [interieur, briqueSeule, toitA, toitA, briqueSeule, face];
      A.ajoute(new THREE.BoxGeometry(AW, AH, AZ1 - AZ0), mats, s * (AX0 + AW / 2), AH / 2, (AZ0 + AZ1) / 2); }
    // la nuit : fenêtres allumées sur cette façade aussi
    for (let f = 0; f < 5; f++) for (const cx of CF) { (L.fenetres = L.fenetres || []).push([cx, HSOC + .55 + f * 3 + .875, ZF - .02, 1.4, 1.65, Math.PI]);
      if (alea() > .26) continue;
      const y = HSOC + .55 + f * 3 + .875, fe = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.65), lumiere()); fe.rotation.y = Math.PI; fe.position.set(cx, y, ZF - .02); fe.visible = false; scene.add(fe); L.nuitObjets.push(fe);
      if (alea() < .4) { const s = silhouette(1.4, 1.65); s.rotation.y = Math.PI; s.position.set(cx, y, ZF - .03); scene.add(s); L.nuitObjets.push(s); L.silhouettes.push(s); } }

    const PB = L.porteBar || [16, 9.12];
    L.limites = (x, z) => (Math.abs(x) < 10.2 && z > -17.4 && z < 14.8 && !(Math.abs(x) > 8.2 && z > 11.6))
      || (Math.abs(x) >= 8.15 && Math.abs(x) < 8.8 && Math.abs(z - 13.75) < .45)                                 // les portes des ailes (les étages)
      || (Math.abs(x) < 2.0 && z <= -17.4 && z > C2.z0 - .4)                                                     // le passage sous l'horloge
      || (Math.abs(x) < C2.x - .5 && z <= C2.z0 - .4 && z > C2.z1 + .5 && !(x > C2.x - 3 && Math.abs(z - (C2.z0 + C2.z1) / 2) < 2.4) && !(x < -C2.x + 2.8 && Math.abs(z - (C2.z0 + C2.z1) / 2) < 6.3))   // (le local électrique, la déchetterie)                                           // la deuxième cour
      || (x >= 10.2 && x < PB[0] - .35 && z > 8.3 && z < 11.4)                                                  // le renfoncement de l'ancien bar
      || (x >= PB[0] - .35 && x < PB[0] + .55 && Math.abs(z - PB[1]) < VEST_LB / 2 - .25)                         // son embrasure, de plain-pied
      || (x > 16.5 && x < VEST_X + VEST_VX - .35 && Math.abs(z - VEST_Z) < VEST_VZ - .3)                        // le vestibule
      || (Math.abs(x - VEST_X) < .4 && Math.abs(z - VEST_Z) < VEST_VZ + .7)                                    // ses deux autres portes
      || (Math.abs(x) < 2.0 && z >= 14.8 && z < 29.4 && !(Math.abs(x) > 1.45 && z < 16.9) && !(x > 1.6 && z >= 16.9 && z < 18.3) && !(x > 1.3 && Math.abs(z - 26.3) < .3));
    L.zone = [-10.6, 19.2, C2.z1, 29.8];
    /* le porche de cette façade : on marche sous la voûte, tout le passage, comme depuis la rue ;
       au bout, on sort sur le trottoir de la rue du Faubourg-Poissonnière, juste devant le porche, face à la rue */
    for (const sg of [-1, 1]) { L.portails.push({ dans: (x, z) => sg * x > 8.6 && Math.abs(z - 13.75) < .6, vers: "etage", arrivee: [sg * 11.9, -2], yaw: sg < 0 ? Math.PI / 2 : -Math.PI / 2 });
      raccourci(L, scene, [.5, 2.4, 1.5], [sg * 8.62, 1.2, 13.75], { marche: [sg * 8.72, 13.75] }); }
    L.portails.push({ dans: (x, z) => Math.abs(x) < 2.3 && z > 29.1, vers: "rue", arrivee: [0, -11], yaw: Math.PI });
    raccourci(L, scene, [4.2, 4.4, 2.4], [0, 2.2, 16.4], { marche: [0, 29.35] });
    // la porte « BAR » : on entre de plain-pied dans le vestibule ; de là, la grande pièce du sous-sol (en face) ou l'escalier de la salle des fêtes (à gauche)
    // du vestibule, vers la grande pièce au bar ou l'escalier : on continue dans la salle des fêtes (même géométrie, simple décalage — pas de coupure)
    L.portails.push({ dans: (x, z) => x > PB[0] + .55 && Math.abs(z - VEST_Z) < VEST_VZ + 1, vers: "fetes", continu: [-VEST_X, FETE_SZ - VEST_Z, FETE_HSS], seuil: [PB[0] - .7, PB[1]], traverse: [PB[0] + 1.3, PB[1]] });
    raccourci(L, scene, [.6, 2.3, VEST_LB], [PB[0], 1.15, PB[1]], { marche: [VEST_X, VEST_Z] });
    L.horsPNJ = (x, z) => x > 15.2 && z > 6.3 && z < 12.5;       // le chef de poste n'entre pas au bar
    // la caméra reste sous la voûte quand on est dans le passage
    L.contraindreCam = (pos, moi) => { const mp = moi.g.position;
      if (mp.z < -17.5) {      // sous l'horloge, ou dans la deuxième cour
        if (mp.z > C2.z0 - .2) { pos.x = Math.max(-2.1, Math.min(2.1, pos.x)); pos.y = Math.min(pos.y, 4.1); pos.z = Math.min(pos.z, -15); }
        else { pos.x = Math.max(-C2.x + .3, Math.min(C2.x - .3, pos.x)); pos.z = Math.max(C2.z1 + .3, Math.min(pos.z, C2.z0 + 4)); if (pos.z > C2.z0 - .2) { pos.x = Math.max(-2.1, Math.min(2.1, pos.x)); pos.y = Math.min(pos.y, 4.1); } }
        return true; }
      if (mp.x > 16.3 && Math.abs(mp.z - VEST_Z) < VEST_VZ + .8) {      // dans le vestibule : la caméra reste dedans (ou dans l'embrasure)
        const xm = VEST_X + VEST_VX - .15; pos.y = Math.min(pos.y, 2.9); pos.z = Math.max(VEST_Z - VEST_VZ + .15, Math.min(VEST_Z + VEST_VZ - .15, pos.z));
        pos.x = Math.abs(pos.z - VEST_Z) < VEST_LB / 2 - .2 ? Math.max(14.6, Math.min(xm, pos.x)) : Math.max(16.25, Math.min(xm, pos.x)); return true; }
      if (moi.g.position.z > 15.6) { pos.y = Math.min(pos.y, 3.7); pos.z = Math.min(pos.z, 29.3); if (pos.z > 15.2) pos.x = Math.max(-2.1, Math.min(2.1, pos.x)); else { pos.x = Math.max(-11.3, Math.min(11.3, pos.x)); pos.z = Math.max(-17.1, pos.z); } return true; } };
    // on se promène avec la caméra derrière soi, et on peut faire demi-tour (glisser le doigt, ou ↻)
    L.taille = 1.85; L.suivi = { d: 8.5, h: 3.9, av: 6, vy: 3.3 }; L.fov = [60, 72]; L.boite = [-11.6, 11.6, -17.4, 15.1];
    const cols5 = [0xff2d55, 0x2d7bff, 0x2dff8a, 0xffd22d, 0xc04dff];
    /* ce qui passe par les portes-fenêtres et la porte ouverte de la salle des fêtes, la nuit :
       quelques petits reflets de la boule à facettes sur les marches et les pavés (légers),
       et les lasers bleus — seulement s'ils sont allumés dans la salle */
    const baies = (L.baiesFete || []).map(b => b.pl.position.z), xF = 12.46;
    const NB = 90, refMatC = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .45, depthWrite: false, blending: THREE.AdditiveBlending });
    const refC = new THREE.InstancedMesh(new THREE.CircleGeometry(1, 8), refMatC, NB); refC.frustumCulled = false; refC.visible = false; scene.add(refC);
    const graines = []; graine = 99; for (let i = 0; i < NB; i++) graines.push([alea(), alea(), alea(), .025 + alea() * .03]);
    const tc = [0xffffff, 0xfff1a8, 0xa8d8ff, 0xffc4e6].map(c => new THREE.Color(c)); for (let i = 0; i < NB; i++) refC.setColorAt(i, tc[i % 4]);
    const mC = new THREE.Matrix4(), qC = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2), vC = new THREE.Vector3(), sC = new THREE.Vector3();
    const laserC = new THREE.MeshBasicMaterial({ color: 0x3a7dff, transparent: true, opacity: .55, blending: THREE.AdditiveBlending, depthWrite: false });
    const rayonsC = []; for (let i = 0; i < 8; i++) { const r = new THREE.Mesh(new THREE.CylinderGeometry(.014, .014, 1, 5), laserC); r.visible = false; scene.add(r);
      const pt = new THREE.Mesh(new THREE.CircleGeometry(.08, 10), new THREE.MeshBasicMaterial({ color: 0x7fc4ff, transparent: true, opacity: .8, blending: THREE.AdditiveBlending, depthWrite: false })); pt.rotation.x = -Math.PI / 2; pt.visible = false; scene.add(pt); rayonsC.push([r, pt, i]); }
    L.setLasers = (on) => { L.lasers = on; };
    const animDehors = (temps) => {
      const nuit = !!L.nuit && baies.length; refC.visible = nuit;
      if (nuit) { graines.forEach(([u, v, w, r], i) => {
          // un reflet glisse devant une baie (ou la porte), sur les marches puis les pavés, et s'efface en s'éloignant
          const zb = baies[Math.floor(u * baies.length)] + (v - .5) * 1.6 + Math.sin(temps / 2600 + u * 9) * .7;
          const d = (temps / 5200 + w) % 1, x = xF - .3 - d * 5.5, y = x > xF - 2 ? .7 * (1 - (xF - x) / 2) + .02 : .02;
          vC.set(x, y, zb); const k = r * (1 + d) * (d < .85 ? 1 : (1 - d) / .15); sC.set(k, k, 1); refC.setMatrixAt(i, mC.compose(vC, qC, sC)); });
        refC.instanceMatrix.needsUpdate = true; }
      const las = !!L.lasers && !!L.nuit;
      for (const [r, pt, i] of rayonsC) { r.visible = pt.visible = las; if (!las) continue;
        const z0 = baies.length ? baies[(i * 3) % baies.length] : 0, src = new THREE.Vector3(xF, 3.2, z0);
        const a = Math.sin(temps / 900 + i) * .6, b = .28 + .18 * Math.sin(temps / 1300 + i * .7);
        const dir = new THREE.Vector3(-Math.cos(b) * Math.cos(a), -Math.sin(b), Math.cos(b) * Math.sin(a)).normalize(), lg = -src.y / dir.y;
        r.position.copy(src).addScaledVector(dir, lg / 2); r.scale.set(1, lg, 1); r.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
        pt.position.set(src.x + dir.x * lg, .03, src.z + dir.z * lg); }
    };
    L.anim = (temps) => {
      const P = L.porteFete; if (P) P.spot.intensity = L.nuit ? 70 + 50 * Math.max(0, Math.sin(temps / 300)) : 0;
      animDehors(temps);
      if (!L.nuit || !L.baiesFete) return;
      for (const b of L.baiesFete) { const ph = temps / 420 + b.i * 1.3;
        b.pl.material.opacity = b.i === 8 ? .55 + .45 * Math.max(0, Math.sin(ph)) : .4 + .6 * Math.max(0, Math.sin(ph)) * (.6 + .4 * Math.sin(ph * 2.7));
        if (Math.floor(ph / Math.PI) % 3 === 0) b.pl.material.color.setHex(cols5[(b.i + Math.floor(temps / 1700)) % 5]); }
      if (P) { const c = cols5[Math.floor(temps / 1700) % 5]; P.spot.color.setHex(c); P.vide.material.color.setHex(c).lerp(new THREE.Color(0xffe0b0), .55); }
      for (const s of L.silhouettes) animerSilhouette(s, temps); };
    // on n'entre dans la salle des fêtes que par sa porte ouverte
    L.portails.push({ dans: (x, z) => x > 10 && z > 5.4 && z < 7.6, vers: "fetes", arrivee: [-3.4, 6], yaw: -Math.PI / 2 });
    raccourci(L, scene, [.8, 4.8, 2.2], [12.4, 2.4, 6.5], { vers: "fetes", arrivee: [-3.4, 6], yaw: -Math.PI / 2 });
    L.depart = [0, 6]; L.cam = { pos: [0, 8, 30], vise: [0, 7.5, -10] };
  }

  if (id === "fetes") {
    /* La salle des fêtes : l'intérieur du bâtiment de plain-pied de droite de la cour d'honneur (vide : ni meuble ni personnage).
       Sol en petits carreaux beiges (quelques carreaux bleus et bordeaux), murs crème, lambris en bois verni et plinthe,
       grandes fenêtres à petits carreaux en verre dépoli côté cour, piliers et appliques en demi-boule. */
    const X0 = -5.8, X1 = 5.8, Z0 = -3, Z1 = 15, HT = 5.4, LAMB = 1.15;
    const larg = X1 - X0, long = Z1 - Z0, cz = (Z0 + Z1) / 2;
    const carreaux = toileCarreaux();
    const EL = 1.0, EZ = Z1 - 2.4, NM = 5, HM = .17, PM = .3;      // l'escalier : 2,5 m de large, 5 marches qui descendent vers la porte
    const fs = new THREE.Shape(); fs.moveTo(X0, -Z0); fs.lineTo(X1, -Z0); fs.lineTo(X1, -Z1); fs.lineTo(X0, -Z1); fs.closePath();
    const tr = new THREE.Path(); tr.moveTo(-EL, -EZ); tr.lineTo(-EL, -Z1); tr.lineTo(EL, -Z1); tr.lineTo(EL, -EZ); tr.closePath(); fs.holes.push(tr);
    const texSol = tex(carreaux, 1 / 1.6, 1 / 1.6);
    const solS = A.ajoute(new THREE.ShapeGeometry(fs), A.mat({ map: texSol, roughness: .5 }), 0, 0, 0, false); solS.rotation.x = -Math.PI / 2;
    // les marches, carrelées elles aussi, puis le palier devant la porte
    const matMarche = A.mat({ map: tex(carreaux, 1.6, .4), roughness: .5 });
    for (let i = 0; i < NM; i++) { const y = -(i + 1) * HM;
      A.ajoute(new THREE.BoxGeometry(EL * 2, .85 + y, PM), matMarche, 0, (y - .85) / 2, EZ + (i + .5) * PM, false);
      A.ajoute(new THREE.BoxGeometry(EL * 2, .03, .03), A.mat({ color: 0x8a7a5e }), 0, y - .015, EZ + i * PM + .015, false); }   // nez de marche
    const pal = A.ajoute(new THREE.PlaneGeometry(EL * 2, Z1 - (EZ + NM * PM)), A.mat({ map: tex(carreaux, 1.6, .6), roughness: .5 }), 0, -NM * HM + .001, (EZ + NM * PM + Z1) / 2, false); pal.rotation.x = -Math.PI / 2;
    // les murets de la trémie (carrelés) et le mur sous le niveau de la salle, derrière la porte
    for (const s of [-1, 1]) A.ajoute(new THREE.BoxGeometry(.06, .86, Z1 - EZ), A.mat({ map: tex(carreaux, 1.5, .5), roughness: .6 }), s * (EL + .03), -.43, (EZ + Z1) / 2, false);
    L.sol = solS;
    const peinture = A.mat({ color: 0xe6d9bd, roughness: .95 });
    const lambris = toileLambris();
    const bois = A.mat({ color: 0x5a3018, roughness: .5 });
    // un mur avec son lambris, sa baguette et sa plinthe ; (axe "x" : mur le long de x, à z donné ; axe "z" : le long de z, à x donné)
    const mur = (axe, pos, de, a, interieur, sansLambris) => {
      const L2 = a - de, mid = (de + a) / 2, ep = .3;
      const geo = axe === "z" ? [ep, HT, L2] : [L2, HT, ep], at = (o) => axe === "z" ? [pos, 0, mid] : [mid, 0, pos];
      const m = A.ajoute(new THREE.BoxGeometry(...geo), peinture, ...at(), false); m.position.y = HT / 2;
      const off = interieur * (ep / 2 + .02), place = (o, y) => { if (axe === "z") o.position.set(pos + off, y, mid); else o.position.set(mid, y, pos + off); };
      if (sansLambris) return;
      const lm = new THREE.Mesh(new THREE.BoxGeometry(...(axe === "z" ? [.04, LAMB, L2] : [L2, LAMB, .04])), A.mat({ map: tex(lambris, L2 / 2.6, 1), roughness: .45 })); place(lm, LAMB / 2); lm.receiveShadow = true; scene.add(lm);
      const bg = new THREE.Mesh(new THREE.BoxGeometry(...(axe === "z" ? [.09, .07, L2] : [L2, .07, .09])), bois); place(bg, LAMB + .03); scene.add(bg);
      const pl = new THREE.Mesh(new THREE.BoxGeometry(...(axe === "z" ? [.07, .14, L2] : [L2, .14, .07])), bois); place(pl, .07); scene.add(pl);
    };
    // côté cour, le mur est ouvert à la troisième porte (celle qui donne sur la cour, là où l'on entre et sort)
    const zSortie = Z0 + 2.5 * long / 5, wSortie = long / 5 - 1.1;
    mur("z", X0 - .15, Z0, zSortie - wSortie / 2, 1, true); mur("z", X0 - .15, zSortie + wSortie / 2, Z1, 1, true);
    A.ajoute(new THREE.BoxGeometry(.3, HT - 2.9, wSortie), peinture, X0 - .15, 2.9 + (HT - 2.9) / 2, zSortie, false);
    mur("z", X1 + .15, Z0, Z1, -1); mur("x", Z0 - .15, X0, X1, 1);
    // le mur du fond est percé en bas des marches : la porte ouverte vers le sous-sol
    mur("x", Z1 + .15, X0, -1.03, -1); mur("x", Z1 + .15, 1.03, X1, -1);
    A.ajoute(new THREE.BoxGeometry(2.06, HT - 1.65, .3), peinture, 0, 1.65 + (HT - 1.65) / 2, Z1 + .15, false);
    A.ajoute(new THREE.BoxGeometry(larg + .6, .3, long + .6), A.mat({ color: 0xece4d2, roughness: 1 }), 0, HT + .15, cz, false);   // plafond
    // poutres du plafond
    for (let z = Z0 + 3; z < Z1; z += 3) A.ajoute(new THREE.BoxGeometry(larg, .35, .3), A.mat({ color: 0xe3d9c3 }), 0, HT - .17, z, false);
    // côté cour (x = X0) : grandes fenêtres à petits carreaux, verre dépoli, au-dessus du lambris, entre des piliers
    const depoli = toile(256, 256, (x, w, h) => { x.fillStyle = "#cfd6d4"; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 1400; i++) { const v = alea(); x.fillStyle = `rgba(${v > .5 ? "255,255,255" : "120,135,140"},${.18 + alea() * .25})`; x.beginPath(); x.arc(alea() * w, alea() * h, 1.5 + alea() * 3, 0, 7); x.fill(); } });
    const vitre = new THREE.MeshStandardMaterial({ map: tex(depoli, 1, 1), emissive: 0xdfe8e6, emissiveIntensity: .55, roughness: .3 }), vitreB = vitre.clone(); vitreB.side = THREE.DoubleSide;
    const cadre = A.mat({ color: 0xece3cf, roughness: .6 });
    // côté cour : grandes portes vitrées à deux battants jusqu'au sol, avec une imposte vitrée au-dessus (celles des marches de la cour)
    const nF = 5, pasF = long / nF, bati = A.mat({ color: 0x7a4a2a, roughness: .5 });
    for (let i = 0; i < nF; i++) {
      const z = Z0 + (i + .5) * pasF, W = pasF - 1.1, hp = 2.9, yh = HT - .45;
      // les deux battants (cadre bois, vitrage à petits bois, soubassement plein)
      if (i === 2) {
        // la porte de sortie : ses deux battants sont ouverts vers l'extérieur, on voit la cour d'honneur
        for (const sgn of [-1, 1]) { const wb = W / 2 - .06, g = new THREE.Group(); g.position.set(X0, 0, z + sgn * W / 2); g.rotation.y = sgn * 1.15; scene.add(g);
          const zc = -sgn * wb / 2, piece = (geo, m, y) => { const o = new THREE.Mesh(geo, m); o.position.set(0, y, zc); g.add(o); return o; };
          piece(new THREE.BoxGeometry(.08, .6, wb), bati, .3);
          const v = piece(new THREE.PlaneGeometry(wb - .12, hp - .75), vitre, .6 + (hp - .75) / 2 + .06); v.rotation.y = Math.PI / 2; v.material = vitreB;
          for (let c = 0; c <= 2; c++) { const o = piece(new THREE.BoxGeometry(.07, hp - .6, c % 2 ? .04 : .09), bati, .6 + (hp - .6) / 2); o.position.z = zc - wb / 2 + c * wb / 2; }
          for (let r = 0; r <= 4; r++) piece(new THREE.BoxGeometry(.07, r % 4 ? .04 : .09, wb), bati, .6 + r * (hp - .6) / 4); }
        // dehors : les pavés de la cour, et la vue sur l'autre bâtiment (le jour ou la nuit)
        const pv = A.ajoute(new THREE.PlaneGeometry(26, 34), new THREE.MeshBasicMaterial({ map: tex(textures().paves, 8, 10), color: 0xb8b2a8 }), X0 - 13, -.01, z, false); L.pavesPorte = pv; pv.rotation.x = -Math.PI / 2;
        const vue = (nuit) => tex(toile(512, 320, (x, w, h) => {
          const g = x.createLinearGradient(0, 0, 0, h * .5); g.addColorStop(0, nuit ? "#070d22" : "#4f9be0"); g.addColorStop(1, nuit ? "#1b2a55" : "#bfe0f7"); x.fillStyle = g; x.fillRect(0, 0, w, h);
          if (nuit) { x.fillStyle = "#fff"; for (let k = 0; k < 40; k++) x.fillRect(alea() * w, alea() * h * .3, 1.5, 1.5); }
          for (let b = 0; b < 4; b++) { const X = b * 130 - 10; x.fillStyle = nuit ? "#3a3a4a" : ["#e6dcc6", "#ece3cf", "#dfd3bb", "#e9e0cc"][b]; x.fillRect(X, 40 + (b % 2) * 14, 128, 130);
            x.fillStyle = nuit ? "#2a3140" : "#7c8590"; x.fillRect(X, 30 + (b % 2) * 14, 128, 12);
            for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) { x.fillStyle = nuit ? (alea() < .3 ? "#ffd58a" : "#1c2232") : "#4d5d6c"; x.fillRect(X + 10 + c * 24, 58 + (b % 2) * 14 + r * 28, 12, 18); } }
          x.fillStyle = nuit ? "#4a4b56" : "#e4dccb"; x.fillRect(0, 160, w, 90); x.fillStyle = nuit ? "#3b3c46" : "#d3c9b3"; x.fillRect(0, 160, w, 10);
          for (let X = 20; X < w; X += 70) { x.fillStyle = nuit ? "#20283a" : "#8ea6b6"; x.fillRect(X, 182, 36, 60); x.fillStyle = nuit ? "#3b3c46" : "#f2eee4"; x.fillRect(X + 17, 182, 2, 60); }
          x.fillStyle = nuit ? "#2f3038" : "#9c968c"; x.fillRect(0, 250, w, 70); }));
        const texJ = vue(false), texN = vue(true);
        const fond = A.ajoute(new THREE.PlaneGeometry(18, 11.25), new THREE.MeshBasicMaterial({ map: texJ }), X0 - 9.5, 4.4, z, false); fond.rotation.y = Math.PI / 2;
        L.fondPorte = fond; L.nuitPorte = (n) => { fond.material.map = n ? texN : texJ; fond.material.needsUpdate = true; pv.material.color.setHex(n ? 0x2a2d3a : 0xb8b2a8); };
        A.ajoute(new THREE.BoxGeometry(.3, .03, W), A.mat({ color: 0x9e958a }), X0 + .15, .015, z, false);
        continue;
      }
      for (const sgn of [-1, 1]) { const zc = z + sgn * W / 4, wb = W / 2 - .06;
        A.ajoute(new THREE.BoxGeometry(.08, .6, wb), bati, X0 + .04, .3, zc, false);
        const v = A.ajoute(new THREE.PlaneGeometry(wb - .12, hp - .75), vitre, X0 + .03, .6 + (hp - .75) / 2 + .06, zc, false); v.rotation.y = Math.PI / 2;
        for (let c = 0; c <= 2; c++) A.ajoute(new THREE.BoxGeometry(.07, hp - .6, c % 2 ? .04 : .09), bati, X0 + .06, .6 + (hp - .6) / 2, zc - wb / 2 + c * wb / 2, false);
        for (let r = 0; r <= 4; r++) A.ajoute(new THREE.BoxGeometry(.07, r % 4 ? .04 : .09, wb), bati, X0 + .06, .6 + r * (hp - .6) / 4, zc, false);
        A.ajoute(new THREE.BoxGeometry(.1, .05, .2), A.mat({ color: 0xc9a227, metalness: .6, roughness: .3 }), X0 + .12, 1.15, z + sgn * .09, false); }   // poignées
      A.ajoute(new THREE.BoxGeometry(.1, .12, W + .12), bati, X0 + .06, hp, z, false);                         // traverse
      const imp = A.ajoute(new THREE.PlaneGeometry(W, yh - hp - .06), vitre, X0 + .02, (hp + yh) / 2, z, false); imp.rotation.y = Math.PI / 2;
      for (let c = 0; c <= 4; c++) A.ajoute(new THREE.BoxGeometry(.06, yh - hp, .05), cadre, X0 + .05, (hp + yh) / 2, z - W / 2 + c * W / 4, false);
      A.ajoute(new THREE.BoxGeometry(.06, .08, W), cadre, X0 + .05, yh, z, false);
      A.ajoute(new THREE.BoxGeometry(.3, .03, W), A.mat({ color: 0x9e958a }), X0 + .15, .015, z, false);        // seuil
    }
    // piliers (entre les fenêtres, et en face) avec leurs appliques en demi-boule
    const applique = new THREE.MeshStandardMaterial({ color: 0xfff6e0, emissive: 0xfff0d0, emissiveIntensity: .9, roughness: .3 }), lumSalle = [];
    for (let i = 0; i <= nF; i++) { const z = Z0 + i * pasF;
      for (const [x, s] of [[X0 + .25, 1], [X1 - .25, -1]]) {
        A.ajoute(new THREE.BoxGeometry(.5, HT, .55), A.mat({ color: 0xe9ddc3 }), x, HT / 2, z, false);
        const lm = new THREE.Mesh(new THREE.BoxGeometry(.04, LAMB, .55), A.mat({ map: tex(lambris, .3, 1), roughness: .45 })); lm.position.set(x + s * .27, LAMB / 2, z); scene.add(lm);
        if (i > 0 && i < nF) { const b = new THREE.Mesh(new THREE.SphereGeometry(.24, 20, 12, 0, Math.PI), applique); b.rotation.y = s > 0 ? Math.PI / 2 : -Math.PI / 2; b.position.set(x + s * .27, 3.6, z); scene.add(b);
          const lum = new THREE.PointLight(0xffe6c0, 4, 9, 1.6); lum.position.set(x + s * .7, 3.6, z); scene.add(lum); lumSalle.push(lum); } } }
    // côté intérieur (x = X1) : un long bar en bois à l'ancienne, sur presque toute la longueur
    const bzA = Z0 + long * .25, bzB = Z1 - 3.6, bl = bzB - bzA, bc = (bzA + bzB) / 2, bx = X1 - 1.6;
    const acajou = A.mat({ color: 0x5b2c16, roughness: .35 }), acajouC = A.mat({ color: 0x7a3d1f, roughness: .4 }), laiton = A.mat({ color: 0xc9a227, metalness: .7, roughness: .25 });
    A.ajoute(new THREE.BoxGeometry(.7, 1.05, bl), acajou, bx, .525, bc);                                         // le comptoir
    A.ajoute(new THREE.BoxGeometry(.95, .08, bl + .15), A.mat({ color: 0x3e1c0c, roughness: .2 }), bx - .08, 1.09, bc);   // le dessus verni
    L.pisteCentre = [0, 6.5];   // le milieu de la piste (le danseur Thriller)
    L.posBar = { x: bx + .62, z0: bzA + .35, z1: bzB - .35, xVerre: bx - .22, yVerre: 1.13 };   // le barman va et vient derrière le comptoir
    A.ajoute(new THREE.BoxGeometry(.08, .12, bl), acajouC, bx - .4, .98, bc, false);                             // moulure sous le dessus
    A.ajoute(new THREE.BoxGeometry(.06, .16, bl), A.mat({ color: 0x2a1408 }), bx - .36, .08, bc, false);          // socle
    const np = Math.round(bl / 1.1);
    for (let k = 0; k < np; k++) { const z = bzA + (k + .5) * bl / np;                                            // panneaux moulurés
      A.ajoute(new THREE.BoxGeometry(.04, .62, bl / np - .22), acajouC, bx - .37, .58, z, false);
      A.ajoute(new THREE.BoxGeometry(.03, .5, bl / np - .36), acajou, bx - .39, .58, z, false); }
    const repose = A.ajoute(new THREE.CylinderGeometry(.03, .03, bl, 12), laiton, bx - .55, .2, bc, false); repose.rotation.x = Math.PI / 2;   // repose-pieds en laiton
    for (let k = 0; k <= np; k += 2) A.ajoute(new THREE.BoxGeometry(.2, .04, .04), laiton, bx - .46, .2, bzA + k * bl / np, false);
    // derrière le bar : l'étagère murale en bois et son miroir
    A.ajoute(new THREE.BoxGeometry(.35, .06, bl), acajou, X1 - .2, 1.7, bc, false);
    A.ajoute(new THREE.BoxGeometry(.35, .06, bl), acajou, X1 - .2, 2.25, bc, false);
    A.ajoute(new THREE.BoxGeometry(.04, .9, bl - .4), new THREE.MeshStandardMaterial({ color: 0xd9e2e6, metalness: .55, roughness: .08, emissive: 0x3a4246 }), X1 - .03, 2.0, bc, false);
    // la commode basse sous l'étagère (tiroirs et portes), et en déco : bouteilles et verres
    A.ajoute(new THREE.BoxGeometry(.45, 1.0, bl), acajou, X1 - .25, .5, bc, false);
    A.ajoute(new THREE.BoxGeometry(.5, .04, bl + .06), A.mat({ color: 0x3e1c0c, roughness: .25 }), X1 - .26, 1.02, bc, false);
    A.ajoute(new THREE.BoxGeometry(.02, .03, bl - .1), acajouC, X1 - .48, .72, bc, false);
    for (let k = 0; k <= np; k++) A.ajoute(new THREE.BoxGeometry(.02, .95, .03), acajouC, X1 - .48, .5, bzA + k * bl / np, false);
    for (let k = 0; k < np; k++) A.ajoute(new THREE.SphereGeometry(.025, 8, 6), laiton, X1 - .5, .55, bzA + (k + .5) * bl / np, false);
    const BOUT = [0x1f5e2e, 0x7a3e10, 0xd8e6e8, 0x2b1a12, 0x9b1c2a, 0xc79a2c].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: .08, metalness: .1, transparent: true, opacity: .88 }));
    const places = [];
    for (const [y, xb2] of [[1.04, X1 - .3], [1.74, X1 - .22], [2.29, X1 - .22]]) for (let z = bzA + .2; z < bzB - .2; z += .12 + alea() * .1) { if (alea() < .12) { z += .3; continue; } places.push([xb2 + (alea() - .5) * .08, y, z, Math.floor(alea() * BOUT.length), .8 + alea() * .5]); }
    const corps = new THREE.CylinderGeometry(.036, .038, .24, 10), col = new THREE.CylinderGeometry(.012, .02, .1, 8), mtx = new THREE.Matrix4(), qq = new THREE.Quaternion();
    BOUT.forEach((m, ci) => { const l = places.filter(p => p[3] === ci); if (!l.length) return;
      const ic = new THREE.InstancedMesh(corps, m, l.length), ik = new THREE.InstancedMesh(col, m, l.length);
      l.forEach(([x, y, z, , k], i) => { ic.setMatrixAt(i, mtx.compose(new THREE.Vector3(x, y + .12 * k, z), qq, new THREE.Vector3(1, k, 1))); ik.setMatrixAt(i, mtx.makeTranslation(x, y + .24 * k + .05, z)); });
      scene.add(ic, ik); });
    // les verres retournés, en rangées sur la commode et au bout du comptoir
    const verres = [], verreMat = new THREE.MeshStandardMaterial({ color: 0xe8f2f5, roughness: .05, metalness: .2, transparent: true, opacity: .45 });
    for (let z = bzA + .3; z < bzA + 2.2; z += .1) for (const dx of [-.15, -.05]) verres.push([X1 - .3 + dx, 1.04, z]);
    for (let z = bzB - 1.2; z < bzB - .3; z += .11) verres.push([bx - .1, 1.13, z]);
    const iv = new THREE.InstancedMesh(new THREE.CylinderGeometry(.03, .024, .1, 10), verreMat, verres.length);
    verres.forEach(([x, y, z], i) => iv.setMatrixAt(i, mtx.makeTranslation(x, y + .05, z))); scene.add(iv);
    // en bas des marches : la double porte marron (panneaux moulurés, poignées), dans son encadrement crème
    const brun = A.mat({ color: 0x6a3a1c, roughness: .5 }), brunC = A.mat({ color: 0x7d4823, roughness: .45 });
    const yb = -NM * HM, hp = 2.5, lp = 1.9;
    // ses deux battants sont ouverts, rabattus contre les murs du petit couloir qui continue de descendre vers le sous-sol
    for (const sg of [-1, 1]) { const bat = new THREE.Group(); bat.position.set(sg * (lp / 2 - .04), yb, Z1 + .32); scene.add(bat);
      const pan = new THREE.Mesh(new THREE.BoxGeometry(.07, hp, lp / 2 - .02), brun); pan.position.set(0, hp / 2, (lp / 2) / 2); bat.add(pan);
      for (const [yy, hh] of [[.55, .7], [1.55, 1.0]]) { const m = new THREE.Mesh(new THREE.BoxGeometry(.03, hh, lp / 2 - .28), brunC); m.position.set(-sg * .045, yy + (hh > .8 ? .2 : 0), lp / 4); bat.add(m); }
      const pg = new THREE.Mesh(new THREE.BoxGeometry(.05, .18, .05), A.mat({ color: 0xc9a227, metalness: .7, roughness: .25 })); pg.position.set(-sg * .07, 1.05, lp / 2 - .12); bat.add(pg); }
    // le couloir : murs crème, plafond, quatre marches de plus, une applique ; au fond, la lumière de la petite salle
    { const CZ0 = Z1 + .3, CL = 2.6, CW = lp / 2 + .02;
      for (const sg of [-1, 1]) A.ajoute(new THREE.BoxGeometry(.3, 5.6, CL), peinture, sg * (CW + .15), .2, CZ0 + CL / 2, false);
      A.ajoute(new THREE.BoxGeometry(CW * 2 + .6, .3, CL), peinture, 0, yb + hp + .15, CZ0 + CL / 2, false);
      for (let i = 0; i < 4; i++) { const y = yb - (i + 1) * HM;
        A.ajoute(new THREE.BoxGeometry(CW * 2, .6, PM), matMarche, 0, y - .3, CZ0 + (i + .5) * PM, false);
        A.ajoute(new THREE.BoxGeometry(CW * 2, .03, .03), A.mat({ color: 0x8a7a5e }), 0, y - .015, CZ0 + i * PM + .015, false); }
      const bas = A.ajoute(new THREE.PlaneGeometry(CW * 2, CL - 4 * PM), A.mat({ map: tex(carreaux, 1.6, .8), roughness: .5 }), 0, yb - 4 * HM + .001, CZ0 + 4 * PM + (CL - 4 * PM) / 2, false); bas.rotation.x = -Math.PI / 2;
      const lc = new THREE.PointLight(0xffd9a0, 2.2, 5, 1.6); lc.position.set(0, yb + hp - .3, CZ0 + 1.2); scene.add(lc);
      const ap = new THREE.Mesh(new THREE.SphereGeometry(.12, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xfff3dc, emissive: 0xffe2b0, emissiveIntensity: .9 })); ap.rotation.x = Math.PI; ap.position.set(0, yb + hp - .02, CZ0 + 1.2); scene.add(ap);
      // on marche dans l'escalier : une zone de sol invisible pour viser du doigt, la hauteur suit les marches
      const solE = new THREE.Mesh(new THREE.PlaneGeometry(EL * 2, CZ0 + CL - EZ + .3), new THREE.MeshBasicMaterial({ visible: false })); solE.rotation.x = -Math.PI / 2; solE.position.set(0, -.5, (EZ - .3 + CZ0 + CL) / 2); scene.add(solE);
      L.solsPlus = [solE];
      L.hauteur = (x, z) => z > CZ0 + 4 * PM ? yb - 4 * HM : Math.abs(x) > EL + .1 || z <= EZ ? 0 : z < EZ + NM * PM ? -(z - EZ) / PM * HM : z < CZ0 ? yb : Math.max(yb - 4 * HM, yb - (z - CZ0) / PM * HM);
      /* en bas du couloir, de plain-pied : le vestibule, puis la grande pièce au bar (le sous-sol), dans la même salle — aucune coupure.
         Construits tournés d'un demi-tour (la porte « BAR » du vestibule regarde la cour, côté x < 0) */
      const SS = new THREE.Group(); SS.position.set(0, yb - 4 * HM, FETE_SZ); SS.rotation.y = Math.PI; scene.add(SS);
      const SL = { portails: [], raccourcis: [] }; construireSousSol(atelier(SS), SL, SS, { fusion: true });
      L.sousSol = SL; L.nuitSousSol = SL.nuitFenetre;
      const loc = (x, z) => [-x, FETE_SZ - z];
      L.solsPlus.push(SL.sol, ...(SL.solsPlus || []));
      L.console = loc(...SL.console);
      for (const r of SL.raccourcis) if (!r.vers) L.raccourcis = [...(L.raccourcis || []), r.marche ? { ...r, marche: loc(...r.marche) } : r];
      L.tabouretsSousSol = SL.tabourets.map(t => loc(...t));
      L.comptoirSousSol = (SL.surComptoir || []).map(t => loc(...t)); L.yComptoirSousSol = yb - 4 * HM + SL.yComptoir;
      const HSS = yb - 4 * HM;
      // la caméra : dans le couloir, le vestibule ou la grande pièce, elle reste dedans
      L.contraindreCam = (pos, moi) => { const mp = moi.g.position; if (mp.z < CZ0 - .1) return false;
        const [lx, lz] = loc(pos.x, pos.z), q = { x: lx, y: pos.y - HSS, z: lz };
        if (Math.abs(lz) < VEST_LB / 2 - .2 && lx > VEST_VX - .3) { q.x = Math.min(q.x, VEST_VX + 1.55); q.y = Math.min(q.y, 2.9); }   // dans l'axe de la porte « BAR », comme dans la cour
        else if (lz > VEST_VZ - .1) { q.x = Math.max(-.8, Math.min(.8, q.x)); q.z = Math.min(q.z, VEST_VZ + 2.9); q.y = Math.min(q.y, 3.2); }
        else { SL.contraindreCam(q); }
        const [wx, wz] = loc(q.x, q.z); pos.set(wx, q.y + HSS, wz); return true; };
    }
    A.ajoute(new THREE.BoxGeometry(lp + .3, .14, .1), cadre, 0, yb + hp + .07, Z1 - .06, false);
    for (const sg of [-1, 1]) A.ajoute(new THREE.BoxGeometry(.14, hp, .1), cadre, sg * (lp / 2 + .08), yb + hp / 2, Z1 - .06, false);
    // les deux rampes en fer forgé noir, à volutes, qui descendent le long de l'escalier
    const volutes = toile(256, 256, (x, w, h) => {      // un module : cadre, barreau central et quatre volutes en C, à la manière de la grille de la photo
      x.strokeStyle = "#151515"; x.lineCap = "round"; x.lineWidth = 12;
      x.beginPath(); x.moveTo(0, 8); x.lineTo(w, 8); x.moveTo(0, h - 8); x.lineTo(w, h - 8); x.moveTo(8, 0); x.lineTo(8, h); x.stroke();
      x.lineWidth = 10; x.beginPath(); x.moveTo(w / 2, 8); x.lineTo(w / 2, h - 8); x.stroke();
      const spirale = (cx, cy, r, sens) => { x.beginPath(); for (let a = 0; a <= Math.PI * 2.4; a += .08) { const rr = r * (1 - a / (Math.PI * 3)); const px = cx + sens * Math.cos(a) * rr, py = cy - Math.sin(a) * rr; a ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke(); };
      x.lineWidth = 9;
      spirale(w / 2 - 50, 72, 44, -1); spirale(w / 2 + 50, 72, 44, 1);
      x.save(); x.translate(0, h); x.scale(1, -1); spirale(w / 2 - 50, 72, 44, -1); spirale(w / 2 + 50, 72, 44, 1); x.restore();
      x.lineWidth = 7; x.beginPath(); x.arc(w / 2, h / 2, 16, 0, 7); x.stroke(); });
    const fer = new THREE.MeshStandardMaterial({ map: tex(volutes), transparent: true, alphaTest: .3, side: THREE.DoubleSide, roughness: .5, metalness: .3, color: 0xffffff });
    const panneau = (x, zA, yA, zB, yB, haut, rep) => {      // un panneau ajouré entre deux points du limon (sol des marches)
      const g = new THREE.BufferGeometry(), b = .08;
      g.setAttribute("position", new THREE.Float32BufferAttribute([x, yA + b, zA, x, yB + b, zB, x, yB + haut, zB, x, yA + haut, zA], 3));
      g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, rep, 0, rep, 1, 0, 1], 2)); g.setIndex([0, 1, 2, 0, 2, 3]); g.computeVertexNormals();
      const t = tex(volutes, rep, 1), m = fer.clone(); m.map = t; const o = new THREE.Mesh(g, m); scene.add(o);
      // la main courante
      const dz = zB - zA, dy = yB - yA, Lm = Math.hypot(dz, dy), mc = new THREE.Mesh(new THREE.CylinderGeometry(.035, .035, Lm, 10), A.mat({ color: 0x141414, roughness: .4 }));
      mc.position.set(x, (yA + yB) / 2 + haut + .02, (zA + zB) / 2); mc.rotation.x = Math.PI / 2 - Math.atan2(dy, dz); scene.add(mc);
    };
    for (const sg of [-1, 1]) { const x = sg * (EL - .04), zM = EZ + NM * PM;
      panneau(x, EZ - .9, 0, EZ, 0, .95, 1);                 // le départ à plat, au bord de la trémie
      panneau(x, EZ, 0, zM, -NM * HM, .95, 2);               // la descente
      panneau(x, zM, -NM * HM, Z1 - .15, -NM * HM, .95, 1);  // le long du palier
      for (const [zz, yy] of [[EZ - .9, 0], [EZ, 0]]) A.ajoute(new THREE.BoxGeometry(.09, 1.05, .09), A.mat({ color: 0x141414 }), x, yy + .52, zz, false);   // poteaux
      const pomme = new THREE.Mesh(new THREE.SphereGeometry(.07, 12, 8), A.mat({ color: 0x141414, metalness: .4 })); pomme.position.set(x, 1.1, EZ - .9); scene.add(pomme); }

    // au fond de la salle, à la place des tables et des chaises : une scène de concert, toute noire (même longueur, même largeur, à hauteur de table)
    const nappe = A.mat({ color: 0xf7f5ef, roughness: .9 }), tube = A.mat({ color: 0x3c3f44, metalness: .6, roughness: .4 });   // (les nappes et les pieds : pour les tables du DJ)
    const tables = [];
    { const SX0 = -4.5, SX1 = 3.7, SZ0 = Z0 + .2, SZ1 = Z0 + 4.25, SH = .78, sx = (SX0 + SX1) / 2, sz = (SZ0 + SZ1) / 2;
      const noirMat = A.mat({ color: 0x0b0b0c, roughness: .85 }), plancher = A.mat({ color: 0x141416, roughness: .55, metalness: .05 }), bord = A.mat({ color: 0x1e1e22, roughness: .4, metalness: .3 });
      A.ajoute(new THREE.BoxGeometry(SX1 - SX0, SH - .03, SZ1 - SZ0), noirMat, sx, (SH - .03) / 2, sz);                       // le caisson
      A.ajoute(new THREE.BoxGeometry(SX1 - SX0, .03, SZ1 - SZ0), plancher, sx, SH - .015, sz, false);                          // le plancher de scène
      A.ajoute(new THREE.BoxGeometry(SX1 - SX0 + .02, .04, .05), bord, sx, SH - .02, SZ1 + .005, false);                     // le nez de scène
      for (let k = 0; k <= 8; k++) A.ajoute(new THREE.BoxGeometry(.012, SH - .1, .012), bord, SX0 + k * (SX1 - SX0) / 8, (SH - .1) / 2, SZ1 + .006, false);   // les joints des praticables
      tables.push([SX0 - .1, SX1 + .1, SZ0 - .3, SZ1 + .15]);
      // sur scène, on est à hauteur du plancher ; les places du groupe et des chanteurs
      const hS = L.hauteur; L.hauteur = (x, z, p) => x > SX0 && x < SX1 && z > SZ0 && z < SZ1 ? SH : hS ? hS(x, z, p) : 0;
      L.scene = { x0: SX0, x1: SX1, z0: SZ0, z1: SZ1, h: SH, centre: [sx, Z0 + 3.1], batterie: [sx, Z0 + .72], basse: [SX0 + 1.45, Z0 + 2.05], guitare: [SX1 - 1.4, Z0 + 2.05] };
      // la batterie : grosse caisse, deux toms, caisse claire, tom basse, charleston, deux crashs et une ride, le tabouret
      const kit = new THREE.Group(); kit.position.set(sx, SH, Z0 + 1.38); scene.add(kit); L.kit = kit;
      const coque = A.mat({ color: 0x7a0d16, metalness: .35, roughness: .28 }), chrome = A.mat({ color: 0xd4d8dc, metalness: .9, roughness: .18 }), peauF = A.mat({ color: 0xf1ece0, roughness: .6 }), cuivre = A.mat({ color: 0xc9a440, metalness: .85, roughness: .3 });
      const m3 = (geo, mat, x, y, z, rx = 0, rz = 0) => { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); o.rotation.set(rx, 0, rz); o.castShadow = true; kit.add(o); return o; };
      const pied = (x, z, h) => m3(new THREE.CylinderGeometry(.012, .012, h, 6), chrome, x, h / 2, z);
      const futs = (r, h, x, y, z, rx = 0) => { m3(new THREE.CylinderGeometry(r, r, h, 24), coque, x, y, z, rx); m3(new THREE.CylinderGeometry(r * .97, r * .97, h + .006, 24), peauF, x, y, z, rx).scale.set(1, 1, 1);
        for (const sg of [-1, 1]) { const c = m3(new THREE.TorusGeometry(r, .012, 6, 24), chrome, x, y, z, Math.PI / 2 + rx); c.translateZ(sg * h / 2); } };
      m3(new THREE.CylinderGeometry(.3, .3, .42, 28), coque, 0, .31, 0, Math.PI / 2);                                       // la grosse caisse
      m3(new THREE.CircleGeometry(.285, 28), A.mat({ color: 0x0d0d0f, roughness: .5 }), 0, .31, .212);                      // sa peau de devant, noire
      m3(new THREE.RingGeometry(.2, .23, 28), A.mat({ color: 0xa8121e, roughness: .5 }), 0, .31, .214);
      for (const sg of [-1, 1]) m3(new THREE.TorusGeometry(.3, .014, 6, 28), chrome, 0, .31, sg * .21);
      futs(.13, .16, -.17, .72, -.04, -.35); futs(.14, .17, .17, .73, -.04, -.35);                                       // les deux toms
      futs(.17, .1, -.43, .6, -.3); pied(-.43, -.3, .55);                                                                // la caisse claire
      futs(.2, .3, .46, .38, -.28); for (const [a, b] of [[.6, -.2], [.34, -.18], [.47, -.42]]) pied(a, b, .38);         // le tom basse
      const cymbale = (r, x, y, z, rz) => { m3(new THREE.CylinderGeometry(r * .15, r, .014, 28), cuivre, x, y, z, 0, rz); pied(x, z, y); };
      cymbale(.16, -.66, .86, -.32, 0); m3(new THREE.CylinderGeometry(.16, .025, .012, 28), cuivre, -.66, .83, -.32);   // le charleston
      cymbale(.23, -.56, 1.22, .06, .25); cymbale(.24, .58, 1.27, .02, -.25); cymbale(.26, .78, 1.0, -.12, -.15);      // les crashs, la ride
      m3(new THREE.CylinderGeometry(.17, .17, .07, 18), A.mat({ color: 0x141416, roughness: .7 }), 0, .55, -.64); pied(0, -.64, .52);   // le tabouret
      // au sol, le long du bord de la scène : six projecteurs de couleur, braqués vers le haut sur le groupe et les chanteurs
      L.feuxScene = []; { const boite = A.mat({ color: 0x0c0c0e, metalness: .5, roughness: .4 }), geoC = new THREE.ConeGeometry(1, 1, 18, 1, true); geoC.translate(0, -.5, 0);
        for (let k = 0; k < 6; k++) { const fx = SX0 + .55 + k * (SX1 - SX0 - 1.1) / 5, fz = SZ1 - .18, pos = new THREE.Vector3(fx, SH + .12, fz);
          const vise = new THREE.Vector3(sx + (fx - sx) * .55, SH + 1.7, Z0 + 1.3), dir = vise.clone().sub(pos), lg = dir.length(), q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir.clone().normalize());
          const can = new THREE.Mesh(new THREE.CylinderGeometry(.08, .1, .18, 12), boite); can.position.copy(pos); can.quaternion.copy(q); scene.add(can);
          A.ajoute(new THREE.BoxGeometry(.2, .03, .12), boite, fx, SH + .015, fz, false);   // le pied
          const verre = new THREE.Mesh(new THREE.CircleGeometry(.075, 14), new THREE.MeshBasicMaterial({ color: 0xffffff })); verre.position.copy(pos).addScaledVector(dir.clone().normalize(), .1); verre.lookAt(vise); scene.add(verre);
          const cone = new THREE.Mesh(geoC, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .17, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, fog: false }));
          cone.position.copy(pos); cone.quaternion.copy(q); cone.scale.set(lg * .24, lg, lg * .24); scene.add(cone);
          L.feuxScene.push({ verre, cone, x: fx, k }); } }
      // Depeche Mode : les deux claviers d'Andy Fletcher sur leur pied, et le micro sur pied de Dave Gahan (sortis seulement pour leurs chansons)
      { const g = new THREE.Group(); g.position.set(sx + 1.8, SH, Z0 + 1.95); g.visible = false; scene.add(g); L.claviers = g;
        const noirK = A.mat({ color: 0x111113, roughness: .5, metalness: .3 }), grisK = A.mat({ color: 0x3a3c40, roughness: .45, metalness: .4 }), blanc = A.mat({ color: 0xe8e8e4, roughness: .5 }), etiq = A.mat({ color: 0xd9b46a, roughness: .6 });
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, 1.15, 14), noirK); pole.position.y = .575; g.add(pole);
        for (const [y, inc] of [[.82, .12], [1.1, .3]]) { const k = new THREE.Group(); k.position.set(0, y, 0); k.rotation.x = inc; g.add(k);
          const corps = new THREE.Mesh(new THREE.BoxGeometry(1.25, .08, .36), grisK); k.add(corps);
          const touches = new THREE.Mesh(new THREE.BoxGeometry(1.05, .02, .14), blanc); touches.position.set(-.05, .045, -.08); k.add(touches);
          for (let i = 0; i < 18; i++) { const n = new THREE.Mesh(new THREE.BoxGeometry(.022, .022, .08), noirK); n.position.set(-.55 + i * .06 + (i % 7 === 2 || i % 7 === 6 ? 99 : 0), .06, -.11); if (n.position.x < 1) k.add(n); }
          for (const ex of [-.55, .5]) { const e = new THREE.Mesh(new THREE.BoxGeometry(.12, .005, .03), etiq); e.position.set(ex, .045, .11); k.add(e); } }
        const m = new THREE.Group(); m.position.set(sx, SH, Z0 + 3.62); m.visible = false; scene.add(m); L.micDM = m;
        const piedM = new THREE.Mesh(new THREE.CylinderGeometry(.016, .016, 1.42, 8), noirK); piedM.position.y = .71; m.add(piedM);
        for (let i = 0; i < 3; i++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(.011, .011, .38, 6), noirK); b.rotation.z = Math.PI / 2 - .5; b.rotation.y = i * 2.09; b.position.set(Math.cos(i * 2.09) * .15, .09, -Math.sin(i * 2.09) * .15); m.add(b); }
        const pince = new THREE.Mesh(new THREE.CylinderGeometry(.02, .02, .06, 8), noirK); pince.position.y = 1.44; m.add(pince); }
      // les amplis du bassiste et du guitariste, contre le mur du fond
      const tolex = A.mat({ color: 0x121214, roughness: .85 }), grille = A.mat({ color: 0x2a2a2e, roughness: .95 }), liseré = A.mat({ color: 0xc9b37a, metalness: .6, roughness: .35 });
      for (const ax of [SX0 + .75, SX1 - .75]) { A.ajoute(new THREE.BoxGeometry(.72, .78, .38), tolex, ax, SH + .39, Z0 + .52);
        A.ajoute(new THREE.BoxGeometry(.64, .56, .01), grille, ax, SH + .33, Z0 + .715, false); A.ajoute(new THREE.BoxGeometry(.66, .015, .012), liseré, ax, SH + .64, Z0 + .716, false);
        A.ajoute(new THREE.BoxGeometry(.72, .18, .34), tolex, ax, SH + .87, Z0 + .52); for (let k = 0; k < 6; k++) A.ajoute(new THREE.CylinderGeometry(.012, .012, .02, 8), liseré, ax - .22 + k * .09, SH + .87, Z0 + .7, false).rotation.x = Math.PI / 2; } }
    // deux projecteurs au plafond, braqués sur la scène (lumière blanche chaude, faisceau visible)
    { const carter = A.mat({ color: 0x111113, roughness: .5, metalness: .4 }), geoF = new THREE.ConeGeometry(1, 1, 24, 1, true); geoF.translate(0, -.5, 0);
      for (const [px, cx] of [[-3.2, -1.9], [2.4, 1.1]]) {
        const pos = new THREE.Vector3(px, HT - .35, Z0 + 7.2), vise = new THREE.Vector3(cx, .8, Z0 + 2.2), dir = vise.clone().sub(pos), lg = dir.length();
        A.ajoute(new THREE.CylinderGeometry(.02, .02, .3, 6), carter, px, HT - .15, Z0 + 7.2, false);                                     // la tige
        const corps = new THREE.Mesh(new THREE.CylinderGeometry(.13, .17, .38, 16), carter); corps.position.copy(pos);
        corps.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir.clone().normalize()); scene.add(corps);
        const lentille = new THREE.Mesh(new THREE.CircleGeometry(.15, 18), new THREE.MeshBasicMaterial({ color: 0xfff4dc })); lentille.position.copy(pos).addScaledVector(dir.clone().normalize(), .2);
        lentille.lookAt(vise); scene.add(lentille);
        const spot = new THREE.SpotLight(0xfff1d6, 26, 16, .3, .45, 1.2); spot.position.copy(pos); spot.target.position.copy(vise); scene.add(spot, spot.target);
        const faisceau = new THREE.Mesh(geoF, new THREE.MeshBasicMaterial({ color: 0xfff1d6, transparent: true, opacity: .07, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
        faisceau.position.copy(pos); faisceau.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir.clone().normalize()); faisceau.scale.set(lg * .3, lg, lg * .3); scene.add(faisceau); } }

    // la boule à facettes, au centre du plafond
    const facettes = toile(512, 256, (x, w, h) => { for (let i = 0; i < w; i += 16) for (let j = 0; j < h; j += 16) { const v = alea();
      x.fillStyle = v > .93 ? "#ffffff" : `hsl(${200 + v * 40}, ${6 + v * 14}%, ${70 + v * 28}%)`; x.fillRect(i + 1, j + 1, 14, 14); } x.fillStyle = "rgba(0,0,0,.5)"; });
    const boule = new THREE.Mesh(new THREE.SphereGeometry(.5, 24, 16), new THREE.MeshStandardMaterial({ map: tex(facettes), metalness: .25, roughness: .2, flatShading: true, emissive: 0xb8c4d0, emissiveIntensity: .35, emissiveMap: tex(facettes) }));
    boule.position.set(0, HT - 1.45, cz); boule.castShadow = true; scene.add(boule);
    A.ajoute(new THREE.CylinderGeometry(.015, .015, .9, 6), A.mat({ color: 0x8a8a8a, metalness: .6 }), 0, HT - .5, cz, false);   // la chaînette
    // les reflets de la boule : de petits points lumineux, projetés depuis la boule sur le sol, les murs et le plafond, qui tournent avec elle
    const NR = 260, centre = new THREE.Vector3(0, HT - 1.45, cz), dirs = [];
    for (let i = 0; i < NR; i++) { const y = -.95 + alea() * 1.75, r = Math.sqrt(1 - y * y), a = alea() * Math.PI * 2; dirs.push([Math.cos(a) * r, y, Math.sin(a) * r, .022 + alea() * .02]); }
    const refMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: .8, depthWrite: false, side: THREE.DoubleSide });
    const reflets = new THREE.InstancedMesh(new THREE.CircleGeometry(1, 10), refMat, NR); reflets.frustumCulled = false; scene.add(reflets);
    const teintes = [0xffffff, 0xfff1a8, 0xa8d8ff, 0xffc4e6].map(c => new THREE.Color(c));
    for (let i = 0; i < NR; i++) reflets.setColorAt(i, teintes[i % 4]);
    const mR = new THREE.Matrix4(), qR = new THREE.Quaternion(), vR = new THREE.Vector3(), sR = new THREE.Vector3(), nz = new THREE.Vector3(0, 0, 1);
    const NORM = { x0: new THREE.Vector3(1, 0, 0), x1: new THREE.Vector3(-1, 0, 0), y0: new THREE.Vector3(0, 1, 0), y1: new THREE.Vector3(0, -1, 0), z0: new THREE.Vector3(0, 0, 1), z1: new THREE.Vector3(0, 0, -1) };
    let refK = 1; L.refletsTaille = k => { refK = k; };
    L.anim = (temps) => { const b = temps / 3000; boule.rotation.y = b; const cb = Math.cos(b), sb = Math.sin(b);
      dirs.forEach(([dx, dy, dz2, r], i) => { const x = dx * cb - dz2 * sb, z = dx * sb + dz2 * cb, y = dy;
        let t = 1e9, f = null; const essai = (v, c, o, nom) => { if (Math.abs(v) < 1e-4) return; const tt = (c - o) / v; if (tt > 0 && tt < t) { t = tt; f = nom; } };
        essai(x, X0 + .17, centre.x, "x0"); essai(x, X1 - .17, centre.x, "x1"); essai(y, .015, centre.y, "y0"); essai(y, HT - .02, centre.y, "y1"); essai(z, Z0 + .17, centre.z, "z0"); essai(z, Z1 - .17, centre.z, "z1");
        vR.set(centre.x + x * t, centre.y + y * t, centre.z + z * t); qR.setFromUnitVectors(nz, NORM[f]); const rr = r * refK * (1 + t * .04); sR.set(rr, rr, 1);
        reflets.setMatrixAt(i, mR.compose(vR, qR, sR)); });
      reflets.instanceMatrix.needsUpdate = true; };
    // à droite de l'escalier : le coin du DJ (deux tables à nappes blanches, platines, table de mixage, micro, casque, enceintes, lumières, fumée)
    const dz = Z1 - 1.45, noir = A.mat({ color: 0x1a1a1c, roughness: .5 }), alu = A.mat({ color: 0xb8bcc2, metalness: .7, roughness: .3 });
    for (const xt of [-2.6, -4.2]) {
      A.ajoute(new THREE.BoxGeometry(1.55, .04, .8), nappe, xt, .76, dz);
      for (const sg of [-1, 1]) A.ajoute(new THREE.BoxGeometry(1.59, .5, .015), nappe, xt, .52, dz + sg * .408, false);
      for (const sg of [-1, 1]) A.ajoute(new THREE.BoxGeometry(.015, .5, .83), nappe, xt + sg * .788, .52, dz, false);
    }
    const platine = (x) => {
      A.ajoute(new THREE.BoxGeometry(.45, .1, .36), alu, x, .83, dz);
      const pl = new THREE.Mesh(new THREE.CylinderGeometry(.15, .15, .02, 32), noir); pl.position.set(x - .04, .89, dz); scene.add(pl);
      const vinyle = new THREE.Mesh(new THREE.CylinderGeometry(.148, .148, .006, 32), A.mat({ color: 0x0c0c0c, roughness: .2 })); vinyle.position.set(x - .04, .903, dz); scene.add(vinyle);
      const etiq = new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, .008, 20), A.mat({ color: 0xc0392b })); etiq.position.set(x - .04, .907, dz); scene.add(etiq);
      const bras = A.ajoute(new THREE.BoxGeometry(.02, .02, .26), alu, x + .16, .92, dz - .02, false); bras.rotation.y = .35;
      return vinyle;
    };
    const vinyles = [platine(-2.25), platine(-3.25)];
    A.ajoute(new THREE.BoxGeometry(.32, .09, .34), noir, -2.75, .83, dz);                     // la table de mixage
    for (let k = 0; k < 4; k++) A.ajoute(new THREE.BoxGeometry(.02, .015, .1), A.mat({ color: 0xdddddd }), -2.6 + k * .065, .882, dz + .05, false);
    for (let k = 0; k < 6; k++) A.ajoute(new THREE.CylinderGeometry(.012, .012, .02, 8), A.mat({ color: [0xe53935, 0x43a047, 0x1e88e5][k % 3] }), -2.6 + (k % 3) * .1, .885, dz - .08 - Math.floor(k / 3) * .05, false);
    // le casque posé sur la table
    const casque = new THREE.Mesh(new THREE.TorusGeometry(.09, .012, 8, 20, Math.PI), noir); casque.position.set(-3.7, .83, dz + .1); casque.rotation.set(-Math.PI / 2, 0, .4); scene.add(casque);
    for (const sg of [-1, 1]) A.ajoute(new THREE.CylinderGeometry(.045, .045, .03, 16), noir, -3.7 + sg * .08, .79, dz + .1 + sg * .03, false);
    // le micro sur son pied, et son col de cygne
    A.ajoute(new THREE.CylinderGeometry(.06, .07, .03, 16), noir, -4.35, .795, dz - .15, false);
    const tige = A.ajoute(new THREE.CylinderGeometry(.01, .01, .55, 8), noir, -4.35, 1.07, dz - .15, false); tige.rotation.z = .25;
    const micro = A.ajoute(new THREE.SphereGeometry(.04, 12, 10), A.mat({ color: 0x8a8a8a, metalness: .6 }), -4.42, 1.35, dz - .15, false);
    // les enceintes, au sol de part et d'autre, et un retour sur la table
    const enceinte = (x, h) => { A.ajoute(new THREE.BoxGeometry(.55, h, .45), noir, x, h / 2, dz - .1);
      for (const [yy, rr] of [[h * .3, .17], [h * .72, .08]]) { const hp = new THREE.Mesh(new THREE.CylinderGeometry(rr, rr, .02, 24), A.mat({ color: 0x2c2c2e, roughness: .8 })); hp.rotation.x = Math.PI / 2; hp.position.set(x, yy, dz - .33); scene.add(hp);
        const c = new THREE.Mesh(new THREE.CylinderGeometry(rr * .3, rr * .3, .03, 16), A.mat({ color: 0x555 })); c.rotation.x = Math.PI / 2; c.position.set(x, yy, dz - .34); scene.add(c); } };
    enceinte(-1.5, 1.0); enceinte(-5.2, 1.15);
    // le portique de lumières, ses projecteurs colorés et leurs faisceaux
    for (const x of [-1.75, -5.05]) A.ajoute(new THREE.CylinderGeometry(.025, .025, 2.4, 8), noir, x, 1.2 + .76, dz + .25, false);
    A.ajoute(new THREE.BoxGeometry(3.4, .05, .05), noir, -3.4, 3.15, dz + .25, false);
    const couleurs = [0xff2d55, 0x2d7bff, 0x2dff8a, 0xffd22d];
    const projos = couleurs.map((c, k) => {
      const x = -2.2 - k * .8;
      const p = A.ajoute(new THREE.CylinderGeometry(.08, .1, .18, 12), noir, x, 3.02, dz + .25, false); p.rotation.x = .9;
      const verre = new THREE.Mesh(new THREE.CircleGeometry(.075, 16), new THREE.MeshBasicMaterial({ color: c })); verre.position.set(x, 2.95, dz + .17); verre.rotation.x = -.6; scene.add(verre);
      const spot = new THREE.SpotLight(c, 14, 14, .32, .5, 1.3); spot.position.set(x, 2.95, dz + .2); spot.target.position.set(x + (k - 1.5) * .8, 0, dz - 5); scene.add(spot); scene.add(spot.target);
      const cone = new THREE.Mesh(new THREE.ConeGeometry(1.1, 5.2, 24, 1, true), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: .09, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
      scene.add(cone);
      return { spot, cone, verre, x, k };
    });
    // la machine à fumée, sous la table, et les nappes de fumée au ras du sol
    A.ajoute(new THREE.BoxGeometry(.4, .22, .3), noir, -3.2, .11, dz + .05);
    const fumeeTex = tex(toile(128, 128, (x) => { const g = x.createRadialGradient(64, 64, 4, 64, 64, 62); g.addColorStop(0, "rgba(240,240,250,.85)"); g.addColorStop(1, "rgba(235,235,245,0)"); x.fillStyle = g; x.fillRect(0, 0, 128, 128); }));
    const fumees = [];
    for (let i = 0; i < 22; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: fumeeTex, transparent: true, depthWrite: false, opacity: .5 })); scene.add(sp); fumees.push([sp, alea() * 1000, .6 + alea() * .8]); }
    // le gros nuage de fumée (bouton 💨) : il sort du poste du DJ et envahit la piste pendant une dizaine de secondes
    const nuage = [];
    for (let i = 0; i < 46; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: fumeeTex, transparent: true, depthWrite: false, opacity: 0 })); sp.visible = false; scene.add(sp); nuage.push([sp, alea(), alea(), alea()]); }
    L.fumee = () => { if (L.nuit !== false) L.fumeeDebut = performance.now(); };
    // les lasers bleus (bouton 🔷) : une tête laser sur le portique du DJ, un éventail de rayons qui balaient la salle
    const tete = A.ajoute(new THREE.BoxGeometry(.3, .18, .25), noir, -3.2, 3.05, dz + .1, false);
    const laserMat = new THREE.MeshBasicMaterial({ color: 0x3a7dff, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false });
    const halo = new THREE.MeshBasicMaterial({ color: 0x1144ff, transparent: true, opacity: .22, blending: THREE.AdditiveBlending, depthWrite: false });
    const pointMat = new THREE.MeshBasicMaterial({ color: 0x7fc4ff, transparent: true, opacity: .95, blending: THREE.AdditiveBlending, depthWrite: false });
    const rayons = [], geoR = new THREE.CylinderGeometry(.016, .016, 1, 6), geoH = new THREE.CylinderGeometry(.07, .07, 1, 8), geoP = new THREE.CircleGeometry(.09, 12);
    for (let i = 0; i < 14; i++) { const r = new THREE.Mesh(geoR, laserMat); r.add(new THREE.Mesh(geoH, halo)); r.visible = false; scene.add(r); const pt = new THREE.Mesh(geoP, pointMat); pt.rotation.x = -Math.PI / 2; pt.visible = false; scene.add(pt); rayons.push([r, pt, i]); }
    // et, en face, une seconde tête : les lasers verts, qui balaient la salle à contretemps des bleus
    A.ajoute(new THREE.BoxGeometry(.3, .18, .25), noir, 3.2, 3.05, dz + .1, false);
    const laserV = new THREE.MeshBasicMaterial({ color: 0x22ff44, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false });
    const haloV = new THREE.MeshBasicMaterial({ color: 0x11cc33, transparent: true, opacity: .22, blending: THREE.AdditiveBlending, depthWrite: false });
    const pointV = new THREE.MeshBasicMaterial({ color: 0x9dff9d, transparent: true, opacity: .95, blending: THREE.AdditiveBlending, depthWrite: false });
    const rayonsV = []; for (let i = 0; i < 12; i++) { const r = new THREE.Mesh(geoR, laserV); r.add(new THREE.Mesh(geoH, haloV)); r.visible = false; scene.add(r); const pt = new THREE.Mesh(geoP, pointV); pt.rotation.x = -Math.PI / 2; pt.visible = false; scene.add(pt); rayonsV.push([r, pt, i]); }
    L.setLasers = (on) => { L.lasersDemande = on; L.lasers = on && L.nuit !== false; for (const [r, pt] of [...rayons, ...rayonsV]) r.visible = pt.visible = L.lasers; };
    // le jour, la fête n'a pas commencé : pas de projecteurs ni de reflets de la boule, pas de fumée, pas de lasers (et Manu n'est pas encore là)
    L.setNuit = (n) => { L.nuit = n; L.nuitPorte && L.nuitPorte(n); L.nuitSousSol && L.nuitSousSol(n); L.setLumiere && L.setLumiere(L.lumiere ?? 1);
      for (const p of projos) p.spot.visible = p.cone.visible = n, p.verre.material.color.setHex(n ? p.spot.color.getHex() : 0x222222);
      for (const [sp] of fumees) sp.visible = n; reflets.visible = n;
      if (!n) { L.fumeeDebut = 0; for (const [sp] of nuage) sp.visible = false; }
      L.setLasers(!!L.lasersDemande); };
    L.fete = { projos, fumees, reflets, boule };   // (pour la salle de l'apocalypse, qui les éteint)
    const animBoule = L.anim;
    L.anim = (temps) => {
      animBoule && animBoule(temps);
      if (L.lasers) for (const [src, liste, n, ph] of [[new THREE.Vector3(-3.2, 3, dz - .05), rayons, 6.5, 0], [new THREE.Vector3(3.2, 3, dz - .05), rayonsV, 5.5, Math.PI]]) {
        for (const [r, pt, i] of liste) {
          const a = (i - n) * .2 + Math.sin(temps / 900 + ph) * .6, b = .35 + .25 * Math.sin(temps / 1300 + i * .4 + ph);
          const dir = new THREE.Vector3(Math.sin(a) * Math.cos(b), -Math.sin(b), -Math.cos(a) * Math.cos(b)).normalize();
          let lg = 18; if (dir.y < 0) lg = Math.min(lg, -src.y / dir.y);   // le rayon s'arrête au sol (ou plus loin, sur un mur)
          const fin = src.clone().addScaledVector(dir, lg);
          if (fin.x < X0 || fin.x > X1 || fin.z < Z0 || fin.z > Z1) { const k = Math.min(...[[X0, "x"], [X1, "x"], [Z0, "z"], [Z1, "z"]].map(([v, ax]) => { const t = (v - src[ax]) / dir[ax]; return t > 0 ? t : 99; })); lg = Math.min(lg, k); fin.copy(src).addScaledVector(dir, lg); }
          r.position.copy(src).addScaledVector(dir, lg / 2); r.scale.set(1, lg, 1); r.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
          pt.position.set(fin.x, Math.max(.02, fin.y), fin.z); pt.visible = fin.y < .1;
          } laserMat.opacity = .75 + .25 * Math.sin(temps / 90); laserV.opacity = .75 + .25 * Math.cos(temps / 110); }
      if (L.fumeeDebut) { const e = (performance.now() - L.fumeeDebut) / 1000;
        if (e > 14) { L.fumeeDebut = 0; for (const [sp] of nuage) sp.visible = false; }
        else for (const [sp, u, v, w] of nuage) { const t = Math.min(1, e / (3 + u * 4)), fade = e < 10 ? 1 : 1 - (e - 10) / 4;
          sp.visible = true; sp.position.set(-3.2 + (u - .5) * 10 * t + Math.sin(temps / 1500 + v * 6) * .4, .3 + w * 1.6 * t, dz - .3 - v * 13 * t);
          const sc = 1 + t * (2.2 + w * 1.6); sp.scale.set(sc, sc * .6, 1); sp.material.opacity = .55 * Math.min(1, e * 2) * fade * (.6 + .4 * w); } }
      for (const v of vinyles) v.rotation.y = -temps / 300;
      for (const p of projos) {     // les faisceaux balaient la piste
        const a = temps / 1400 + p.k * 1.7, tx = p.x + Math.sin(a) * 2.2, tz = dz - 4.5 + Math.cos(a * .8) * 2.5;
        p.spot.target.position.set(tx, 0, tz);
        const from = new THREE.Vector3(p.x, 2.95, dz + .2), to = new THREE.Vector3(tx, 0, tz), mid = from.clone().add(to).multiplyScalar(.5), dir = to.clone().sub(from), L2 = dir.length();
        p.cone.position.copy(mid); p.cone.scale.set(1, L2 / 5.2, 1); p.cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir.normalize());
      }
      for (const [sp, d, k] of fumees) {   // la fumée sort de la machine et s'étale
        const t = ((temps / 1000 + d) % 9) / 9;
        sp.position.set(-3.2 + Math.sin(d + t * 3) * (.4 + t * 2.4), .15 + t * .5, dz - .2 - t * 3.6 * k);
        const sc = .7 + t * 3.2; sp.scale.set(sc, sc * .55, 1); sp.material.opacity = .75 * Math.sin(t * Math.PI);
      }
    };
    tables.push([-5.6, -1.3, dz - .8, Z1]);
    L.posDJ = [-3.4, dz + .75];   // Manu, derrière ses platines
    // toucher le coin du DJ ouvre la musique
    const zone = new THREE.Mesh(new THREE.BoxGeometry(4.6, 3.2, 1.6), new THREE.MeshBasicMaterial({ visible: false })); zone.position.set(-3.3, 1.6, dz); scene.add(zone); L.zoneDJ = [zone];
    // le gros bouton ▶ / ⏹ au-dessus des platines : on lance ou on arrête la musique pour toute la salle
    const bouton = (fond, signe) => tex(toile(128, 128, (x) => { x.fillStyle = "rgba(0,0,0,.35)"; x.beginPath(); x.arc(64, 68, 58, 0, 7); x.fill();
      x.fillStyle = fond; x.beginPath(); x.arc(64, 62, 56, 0, 7); x.fill(); x.lineWidth = 6; x.strokeStyle = "#fff"; x.stroke(); x.fillStyle = "#fff"; x.beginPath();
      if (signe === "play") { x.moveTo(48, 34); x.lineTo(96, 62); x.lineTo(48, 90); } else x.rect(40, 38, 48, 48); x.fill(); }));
    const texPlay = bouton("#2f9e5b", "play"), texStop = bouton("#c4394a", "stop");
    const btn = new THREE.Sprite(new THREE.SpriteMaterial({ map: texPlay, depthTest: false, transparent: true })); btn.renderOrder = 10;
    btn.position.set(-3.4, .5, dz - .46); btn.scale.set(.3, .3, 1); scene.add(btn); L.boutonDJ = btn;   // sur le devant de la nappe blanche, entre les deux tables
    L.majBoutonDJ = (joue) => { btn.material.map = joue ? texStop : texPlay; btn.material.needsUpdate = true; };

    // lumière de la salle
    const ambiant = new THREE.AmbientLight(0xfff1dc, .55); scene.add(ambiant);
    for (const z of [Z0 + 4, cz, Z1 - 4]) { const l = new THREE.PointLight(0xfff0d8, 6, 14, 1.4); l.position.set(0, HT - .6, z); scene.add(l); lumSalle.push(l); }
    // la lumière de la salle se baisse (l'administrateur règle de 100 % à 15 %) ; les jeux de lumière du DJ ne changent pas,
    // la boule à facettes et ses reflets ressortent d'autant plus
    for (const l of lumSalle) l.userData.base = l.intensity;
    L.setLumiere = (niveau) => { const v = +niveau, k = Math.max(0, Math.min(1, Number.isFinite(v) ? v : 1)), s = Math.min(1, (1 - k) / .85); L.lumiere = k;
      const noir = k < .05;   // 0 % : la salle est éteinte, il ne reste que les jeux de lumière du DJ (et un soupçon de pénombre)
      // à 15 %, presque le noir, comme en boîte : seuls les jeux de lumière éclairent la piste
      const bas = k < .2 ? .35 : 1;
      for (const l of lumSalle) l.intensity = l.userData.base * k * bas; ambiant.intensity = noir ? .012 : .55 * (k < .2 ? .1 : Math.max(.3, k));
      applique.emissiveIntensity = .9 * k * bas; L.club = s;
      if (L.sousSol && L.sousSol.ambiant) L.sousSol.ambiant.intensity = .45 * (noir ? .04 : k < .2 ? .12 : Math.max(.4, k)); vitre.emissiveIntensity = vitreB.emissiveIntensity = .55 * Math.max(.4, k) * (L.nuit ? .12 : 1);   // la nuit, les vitres dépolies sont sombres
      vitre.color.setHex(L.nuit ? 0x3a4466 : 0xffffff); vitreB.color.copy(vitre.color);
      scene.children.filter(o => o.isHemisphereLight).forEach(h => h.intensity = .35 * (noir ? .03 : k < .2 ? .12 : Math.max(.3, k)));
      boule.material.emissiveIntensity = .35 + .4 * s;
      refMat.opacity = .7 + .3 * s; L.refletsTaille(1 + .4 * s); };
    /* les lumières de boîte de nuit : quatre lyres au plafond qui balaient la piste de faisceaux rouge, vert, bleu (et leurs taches de couleur au sol),
       et trois lumières colorées qui tournent au-dessus de la piste ; d'autant plus fortes que la salle est sombre, et qui battent quand la musique joue */
    {
      const COUL = [0xff2244, 0x22ff66, 0x2266ff, 0xff22cc], noirL = A.mat({ color: 0x1a1a1a, roughness: .5, metalness: .4 });
      const tache = tex(toile(128, 128, (x) => { const g = x.createRadialGradient(64, 64, 4, 64, 64, 62); g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(.55, "rgba(255,255,255,.55)"); g.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = g; x.fillRect(0, 0, 128, 128); }));
      const lyres = [[-3.2, 2.5], [3.2, 2.5], [-3.2, 10.5], [3.2, 10.5]].map(([lx, lz], i) => {
        const pied = new THREE.Mesh(new THREE.BoxGeometry(.34, .14, .24), noirL); pied.position.set(lx, HT - .07, lz); scene.add(pied);
        const tetL = new THREE.Mesh(new THREE.CylinderGeometry(.13, .16, .3, 14), noirL); tetL.position.set(lx, HT - .32, lz); scene.add(tetL);
        const lentille = new THREE.Mesh(new THREE.CircleGeometry(.12, 16), new THREE.MeshBasicMaterial({ color: COUL[i] })); lentille.rotation.x = Math.PI / 2; lentille.position.set(lx, HT - .48, lz); scene.add(lentille);
        const geo = new THREE.ConeGeometry(.9, 1, 20, 1, true); geo.translate(0, -.5, 0);   // la pointe en haut, à la lyre
        const faisceau = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: COUL[i], transparent: true, opacity: .15, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
        faisceau.position.set(lx, HT - .48, lz); scene.add(faisceau);
        const sol = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.2), new THREE.MeshBasicMaterial({ map: tache, color: COUL[i], transparent: true, opacity: .6, blending: THREE.AdditiveBlending, depthWrite: false }));
        sol.rotation.x = -Math.PI / 2; scene.add(sol);
        return { lx, lz, i, lentille, faisceau, sol };
      });
      const tournantes = [0xff1133, 0x11ff55, 0x1144ff].map(c => { const l = new THREE.PointLight(c, 0, 13, 1.3); scene.add(l); return l; });
      L.club3d = { lyres, tournantes };
      const haut = new THREE.Vector3(0, 1, 0), dirL = new THREE.Vector3();
      L.club = 0;
      const animAvantClub = L.anim;
      L.anim = (temps) => {
        animAvantClub && animAvantClub(temps);
        const s2 = L.club || 0, joue = !!(M && M.djJoue), bat = joue ? .7 + .3 * Math.abs(Math.sin(temps / 240)) : .85, force = (.3 + .7 * s2) * bat;
        for (const ly of lyres) {
          // la lyre balaie la piste : un point au sol qui tourne autour du centre de la piste ; toutes les 6 s, elle change de couleur
          const a = temps / 1400 + ly.i * 1.6, cx = Math.sin(a * 1.3) * 3.2, cz = 6.5 + Math.cos(a) * 4.5, c = COUL[(ly.i + Math.floor(temps / 6000)) % COUL.length];
          dirL.set(cx - ly.lx, .02 - (HT - .48), cz - ly.lz); const lg = dirL.length(); dirL.normalize();
          ly.faisceau.quaternion.setFromUnitVectors(haut, dirL.clone().negate()); ly.faisceau.scale.set(1, lg, 1);
          for (const m of [ly.faisceau.material, ly.sol.material, ly.lentille.material]) m.color.setHex(c);
          ly.faisceau.material.opacity = .04 + .12 * force; ly.sol.material.opacity = .25 + .6 * force;
          ly.sol.position.set(cx, .025 + ly.i * .002, cz); }
        tournantes.forEach((l, i) => { const a = temps / 1700 + i * 2.1; l.position.set(Math.cos(a) * 3.4, 3.2, 6.5 + Math.sin(a) * 4.2); l.intensity = 9 * force; });
      };
    }
    L.interieur = true; L.boite = [X0, X1, Z0, Z1];
    L.zone = [X0, X1, Z0, FETE_SZ + VEST_VZ + 7.2];      // jusqu’au fond du sous-sol
    /* dans le coin, entre le bout du bar et le mur du fond : le flipper Bally « Viking » et le baby-foot (d'après les photos) */
    const photo = (src, rx = 1, ry = 1) => { const im = new Image(), t = new THREE.Texture(im); t.colorSpace = THREE.SRGBColorSpace; im.onload = () => { t.needsUpdate = true; }; im.src = src; return t; };
    {
      const fx = 4.85, fz0 = 12.95, fz1 = 14.45, FL = fz1 - fz0, FW = .72, fzc = (fz0 + fz1) / 2;
      const rouge = A.mat({ color: 0xb31b1b, roughness: .45 }), noirF = A.mat({ color: 0x141414, roughness: .5, metalness: .3 }), chrome = A.mat({ color: 0xc7cacd, metalness: .85, roughness: .25 });
      const flanc = tex(toile(300, 120, (x, w, h) => { x.fillStyle = "#b31b1b"; x.fillRect(0, 0, w, h);
        x.strokeStyle = "#f0c419"; x.lineWidth = 6; x.lineCap = "round";
        for (const [cx, sg] of [[60, 1], [240, -1]]) { x.beginPath(); x.moveTo(cx - sg * 20, 100); x.quadraticCurveTo(cx + sg * 30, 70, cx, 40); x.quadraticCurveTo(cx - sg * 10, 20, cx + sg * 22, 18); x.stroke();
          x.beginPath(); x.moveTo(cx + sg * 22, 18); x.lineTo(cx + sg * 34, 26); x.stroke(); }
        x.strokeStyle = "#7a3a8a"; x.lineWidth = 5; x.beginPath(); for (let X = 0; X <= w; X += 20) x.lineTo(X, 104 + Math.sin(X / 18) * 6); x.stroke(); }));
      const mf = A.mat({ map: flanc });
      // la caisse (rouge, dragons jaunes), ses pieds noirs, la façade en inox avec la porte des pièces
      const caisse = A.ajoute(new THREE.BoxGeometry(FW, .42, FL), [mf, mf, rouge, rouge, rouge, rouge], fx, .88, fzc);
      for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const pied = A.ajoute(new THREE.BoxGeometry(.07, .7, .07), noirF, fx + dx * (FW / 2 - .05), .35, fzc + dz * (FL / 2 - .06)); pied.rotation.x = dz * -.06; }
      const porte = A.ajoute(new THREE.PlaneGeometry(.42, .3), A.mat({ map: tex(toile(168, 120, (x, w, h) => { x.fillStyle = "#b8bcc0"; x.fillRect(0, 0, w, h); x.strokeStyle = "#8a8d90"; x.lineWidth = 3; x.strokeRect(2, 2, w - 4, h - 4);
        for (let k = 0; k < 3; k++) { x.fillStyle = "#222"; x.fillRect(22 + k * 46, 14, 30, 22); x.fillStyle = "#f2d33a"; x.fillRect(27 + k * 46, 20, 20, 10); }
        x.fillStyle = "#a3a6a9"; x.beginPath(); x.moveTo(84, 54); x.lineTo(124, 76); x.lineTo(84, 98); x.lineTo(44, 76); x.fill(); })), metalness: .5, roughness: .35 }), fx, .86, fz0 - .003, false);
      porte.rotation.y = Math.PI;
      // le plateau (la photo), légèrement incliné, sous sa vitre, avec son cadre en inox
      const pl = A.ajoute(new THREE.PlaneGeometry(FW - .08, FL - .06), new THREE.MeshStandardMaterial({ map: photo("images/flipper-plateau.jpg"), roughness: .6, emissive: 0x3a1a08 }), fx, 1.115, fzc, false);
      pl.rotation.x = -Math.PI / 2 - .06; pl.rotation.z = Math.PI;
      const vitreF = A.ajoute(new THREE.PlaneGeometry(FW - .06, FL - .04), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: .1, roughness: .05, metalness: .4 }), fx, 1.14, fzc, false);
      vitreF.rotation.x = -Math.PI / 2 - .06;
      for (const sg of [-1, 1]) A.ajoute(new THREE.BoxGeometry(.03, .04, FL), chrome, fx + sg * (FW / 2 - .015), 1.12, fzc, false);
      A.ajoute(new THREE.BoxGeometry(FW, .04, .05), chrome, fx, 1.1, fz0 + .02, false);
      // la tirette du lanceur et les deux boutons des batteurs
      const tir = A.ajoute(new THREE.CylinderGeometry(.018, .018, .14, 8), chrome, fx - FW / 2 + .1, .98, fz0 - .07, false); tir.rotation.x = Math.PI / 2;
      for (const sg of [-1, 1]) { const b = A.ajoute(new THREE.CylinderGeometry(.025, .025, .03, 10), A.mat({ color: 0xf2f2f2 }), fx + sg * (FW / 2 + .012), .98, fz0 + .12, false); b.rotation.z = Math.PI / 2; }
      // le fronton : la vraie peinture du « Viking », éclairée, dans sa caisse rouge, sur son cou noir
      A.ajoute(new THREE.BoxGeometry(.5, .14, .14), noirF, fx, 1.2, fz1 - .1);
      A.ajoute(new THREE.BoxGeometry(FW + .02, .66, .2), rouge, fx, 1.6, fz1 - .1);
      const fr = A.ajoute(new THREE.PlaneGeometry(FW - .06, .6), new THREE.MeshStandardMaterial({ map: photo("images/flipper-fronton.jpg"), emissive: 0xffffff, emissiveMap: photo("images/flipper-fronton.jpg"), emissiveIntensity: .55, roughness: .4 }), fx, 1.6, fz1 - .205, false);
      fr.rotation.y = Math.PI;
      const lumF = new THREE.PointLight(0xffa04a, 2.2, 3, 2); lumF.position.set(fx, 1.35, fzc - .2); scene.add(lumF);
      // au mur, au-dessus du flipper : le tableau des meilleurs scores (les 3 premiers)
      const tabF = tableauScores(A, "FLIPPER  VIKING", fx - .4, 2.75, Z1 - .17); L.majClassement = tabF;
      tabF((M && M.classementFlipper) || []);
      /* à côté, sur le même mur : la cible de fléchettes (à 1,73 m du sol, comme il se doit), et son propre tableau */
      { const cxD = 2.4, cyD = 1.73, zD = Z1 - .17;
        const cible = tex(toile(512, 512, (x, w) => { dessinerCibleFlechettes(x, w / 2, w / 2, w / 2 - 6); }));
        const meuble = A.ajoute(new THREE.CylinderGeometry(.34, .34, .06, 40), A.mat({ color: 0x1a1210, roughness: .6 }), cxD, cyD, zD - .02, false); meuble.rotation.x = Math.PI / 2;
        const d = A.ajoute(new THREE.CircleGeometry(.3, 48), new THREE.MeshStandardMaterial({ map: cible, roughness: .8 }), cxD, cyD, zD - .055, false); d.rotation.y = Math.PI;
        for (const [dx, dy, a] of [[.05, .03, .3], [-.07, -.02, -.2], [.02, -.1, .1]]) {   // trois fléchettes plantées
          const f = new THREE.Group(); f.position.set(cxD + dx, cyD + dy, zD - .06); f.rotation.set(a * .3, a, 0); scene.add(f);
          const corps = new THREE.Mesh(new THREE.CylinderGeometry(.006, .004, .13, 8), A.mat({ color: 0xb9bcc2, metalness: .7 })); corps.rotation.x = Math.PI / 2; corps.position.z = -.065; f.add(corps);
          const plume = new THREE.Mesh(new THREE.BoxGeometry(.05, .002, .04), A.mat({ color: 0xc8102e })); plume.position.z = -.13; f.add(plume);
          const plume2 = plume.clone(); plume2.rotation.z = Math.PI / 2; f.add(plume2); }
        const spot = new THREE.SpotLight(0xfff0d0, 6, 4, .45, .5, 1.2); spot.position.set(cxD, 2.6, zD - 1.2); spot.target.position.set(cxD, cyD, zD); scene.add(spot, spot.target);
        const tabD = tableauScores(A, "FLÉCHETTES", cxD, 2.75, Z1 - .17); L.majClassementFlechettes = tabD; tabD((M && M.classementFlechettes) || []);
        L.flechettes = [cxD, Z1 - .9]; }
      L.flipper = [fx, fz0];
      tables.push([fx - FW / 2 - .25, fx + FW / 2 + .25, fz0 - .2, Z1]);
    }
    {
      // (plus de baby-foot dans la salle des fêtes : il est au bar du sous-sol)
    }
    // les tabourets du bar : pied chromé, assise en cuir rouge, repose-pieds ; on s'y assoit en s'approchant
    L.tabourets = [];
    for (let z = bzA + .55; z < bzB - .3; z += 1.1) {
      const tx = bx - 1.0; L.tabourets.push([tx, z]);
      A.ajoute(new THREE.CylinderGeometry(.2, .22, .04, 18), A.mat({ color: 0x9a9da1, metalness: .7, roughness: .3 }), tx, .02, z, false);
      A.ajoute(new THREE.CylinderGeometry(.03, .03, .58, 10), A.mat({ color: 0xc9cdd2, metalness: .8, roughness: .2 }), tx, .31, z);
      const rp = A.ajoute(new THREE.TorusGeometry(.16, .015, 8, 20), A.mat({ color: 0xc9cdd2, metalness: .8, roughness: .2 }), tx, .26, z, false); rp.rotation.x = Math.PI / 2;
      A.ajoute(new THREE.CylinderGeometry(.21, .19, .08, 20), A.mat({ color: 0x8e1c22, roughness: .45 }), tx, .62, z);
    }
    const limSalle = (x, z) => !L.tabourets.some(([a, b]) => Math.hypot(x - a, z - b) < .3) && x > X0 + .4 && x < bx - .75 && z > Z0 + .6 && (z < Z1 - .6 || (Math.abs(x) < .55 && z < Z1 + 3.2)) && !(Math.abs(x) < EL + .2 && Math.abs(x) > .55 && z > EZ - 1) && !tables.some(([a, b, c, d]) => x > a && x < b && z > c && z < d);
    L.limites = (x, z) => z > Z1 + 2.6 ? L.sousSol.limites(-x, FETE_SZ - z) : limSalle(x, z);
    L.nbTabouretsSalle = L.tabourets.length; L.tabourets.push(...L.tabouretsSousSol);
    L.portails.push({ dans: (x, z) => x < X0 + .7 && Math.abs(z - (Z0 + 2.5 * long / 5)) < 1.1, vers: "grande", arrivee: [8.8, 6.5], yaw: Math.PI / 2 });
    raccourci(L, scene, [1, 3, 2.6], [X0 - .3, 1.5, Z0 + 2.5 * long / 5], { vers: "grande", arrivee: [8.8, 6.5], yaw: Math.PI / 2 });
    // en bas des marches, la porte ouverte : on descend dans la petite salle du sous-sol
    // par la porte « BAR » du vestibule, on sort dans la cour d'honneur, en marchant (même géométrie de part et d'autre : pas de coupure)
    L.portails.push({ dans: (x, z) => x < -VEST_VX - .3 && Math.abs(z - FETE_SZ) < VEST_LB / 2, vers: "grande", continu: [VEST_X, VEST_Z - FETE_SZ, -FETE_HSS], seuil: [-VEST_VX + .5, FETE_SZ], traverse: [-VEST_VX - .8, FETE_SZ] });
    // l'escalier entre la salle et le vestibule : un cercle en haut, un en bas ; on s'y arrête, et l'on descend (ou remonte) tout seul
    L.portails.push({ dans: () => false, vers: "fetes", continu: true, seuil: [0, 11.0], traverse: [0, 19.8], escalier: true },
      { dans: () => false, vers: "fetes", continu: true, seuil: [0, 18.9], traverse: [0, 10.2], escalier: true });
    L.horsPNJ = (x, z) => Math.abs(x) < EL + .5 && z > EZ - 1.5;          // le chef de poste ne descend pas l'escalier
    raccourci(L, scene, [1.9, 2.4, .4], [0, -.2, Z1 + .9], { marche: [0, Z1 + 2.4] });
    L.plafond = HT - .35;
    /* la cour d'honneur, vue par la porte « BAR » du vestibule : la vraie cour (sans le bâtiment de la salle, qui est ici même),
       à sa place exacte, éclairée par son propre jour (matières non éclairées, pour ne pas alourdir la salle) */
    { const cour = new THREE.Group(); cour.position.set(-VEST_X, FETE_HSS - .03, FETE_SZ - VEST_Z); scene.add(cour);
      const LC = construireLieu("grande", cour, "fetes");
      const lum = [], basic = new Map(), teints = [], nuages = [];
      cour.traverse(o => { if (o.isLight) lum.push(o); if (o.isSprite) nuages.push(o);
        if (!o.isMesh) return;
        const nuitMats = new Set(); for (const o of LC.nuitObjets || []) if (o.material) nuitMats.add(o.material);
        const conv = m => { if (m && m.isMeshBasicMaterial && m.blending !== THREE.AdditiveBlending && !nuitMats.has(m) && !basic.has(m)) { basic.set(m, m); teints.push([m, m.color.clone()]); }
          if (!m || !(m.isMeshStandardMaterial || m.isMeshLambertMaterial || m.isMeshPhongMaterial)) return m; if (basic.has(m)) return basic.get(m);
          const b = new THREE.MeshBasicMaterial({ map: m.map, color: m.color.clone(), transparent: m.transparent, opacity: m.opacity, alphaTest: m.alphaTest, side: m.side });
          if (!m.map) b.color.multiplyScalar(.92); teints.push([b, b.color.clone()]); basic.set(m, b); return b; };
        o.material = Array.isArray(o.material) ? o.material.map(conv) : conv(o.material); o.castShadow = o.receiveShadow = false; });
      for (const l of lum) l.parent && l.parent.remove(l);
      const T2 = textures(), ciel = new THREE.Mesh(new THREE.SphereGeometry(150, 24, 12), new THREE.MeshBasicMaterial({ map: tex(T2.ciel), side: THREE.BackSide, depthWrite: false }));
      cour.add(ciel);
      /* une seule copie de la cour, placée selon l'endroit d'où on la regarde :
         - depuis la salle, par la porte ouverte (sans le bâtiment de droite, qui est la salle elle-même) ;
         - depuis le sous-sol, par la porte « BAR » du vestibule */
      const droite = []; cour.traverse(o => { if (o.userData.droite) droite.push(o); });
      let modeCour = null;
      L.placerCour = (camZ) => { const m = camZ > 15.3 ? "bar" : "porte"; if (m === modeCour) return; modeCour = m;
        if (m === "bar") cour.position.set(-VEST_X, FETE_HSS - .03, FETE_SZ - VEST_Z); else cour.position.set(-12.5 + X0 - .02, -.03, zSortie - 6.5);
        for (const o of droite) o.visible = m === "bar"; if (L.fondPorte) L.fondPorte.visible = m === "bar";
        if (LC.sol) LC.sol.visible = m === "bar"; };   // (vue de la salle : les pavés de la salle, pour ne pas couvrir la cage d'escalier)
      L.placerCour(0);
      const nuitAvant = L.setNuit;
      L.setNuit = (n) => { nuitAvant(n);
        for (const [b, c] of teints) b.color.copy(c).multiplyScalar(n ? .07 : 1).lerp(new THREE.Color(0x0e1630), n ? .3 : 0);
        ciel.material.map = n ? null : tex(T2.ciel); ciel.material.color.setHex(n ? 0x0c1530 : 0xffffff); ciel.material.needsUpdate = true;
        for (const o of LC.nuitObjets || []) if (!o.isLight) o.visible = n; for (const o of nuages) o.visible = !n; };
    }
    L.depart = [0, Z1 - 6]; L.cam = { pos: [-3.6, 2.4, Z1 - .8], vise: [1.2, 1.6, Z0 + 1] };
  }

  if (id === "cave") construireSousSol(A, L, scene);
  if (id === "hv1955") construireHillValley(A, T, L, scene);
  if (id === "etage") {
    /* l'étage est construit dans un repère retourné (miroir avant-arrière) : en montant, le couloir à traverser est à gauche, comme dans le vrai bâtiment.
       Tout ce qui parle de positions passe par ce miroir (z du monde = 0,5 − z du plan) */
    const grp = new THREE.Group(); grp.scale.z = -1; grp.position.z = .5; scene.add(grp);
    const E = { portails: [] }; construireEtage(atelier(grp), E, grp);
    const mz = z => .5 - z;
    Object.assign(L, { sol: E.sol, solsPlus: E.solsPlus, interieur: true, sansPNJ: true, sansMusique: true, anim: E.anim, eclairer: E.eclairer, boite: [E.boite[0], E.boite[1], mz(E.boite[3]), mz(E.boite[2])],
      zone: [E.zone[0], E.zone[1], mz(E.zone[3]), mz(E.zone[2])], depart: [E.depart[0], mz(E.depart[1])], cam: { pos: [E.cam.pos[0], E.cam.pos[1], mz(E.cam.pos[2])], vise: [E.cam.vise[0], E.cam.vise[1], mz(E.cam.vise[2])] } });
    L.limites = (x, z) => E.limites(x, mz(z));
    L.hauteur = (x, z, p) => E.hauteur(x, mz(z), p);
    L.portails = E.portails.map(q => ({ ...q, dans: (x, z) => q.dans(x, mz(z)), indice: q.indice && [q.indice[0], mz(q.indice[1])] }));
    // les boutons « Monter au 1er », … « Redescendre au RDC » : on va jusqu'au couloir de l'étage voulu, par l'escalier de sa cage
    L.monterA = (moi, f) => L.allerEtage(moi, (Math.sign(moi.g.position.x) || -1) * 12.2, mz(2.5), f * ET.H);   // (on s'arrête sur le palier de l'étage)
    L.allerEtage = (moi, x, z, y) => { const pos = moi.g.position, z0 = pos.z; pos.z = mz(z0);
      const ok = E.allerEtage(moi, x, mz(z), y); pos.z = z0;
      if (ok) { if (moi.cible) moi.cible.z = mz(moi.cible.z); for (const v of moi.chemin || []) v.z = mz(v.z); M.repere.position.z = z; }
      return ok; };
    /* par la porte du rez-de-chaussée : la vraie cour d'honneur, d'un seul bloc (non éclairée par l'étage), placée pour que la porte de l'aile
       tombe pile sur la porte de la cage ; toucher la cour, ou marcher dedans, fait sortir */
    { const cour = new THREE.Group(); scene.add(cour); const LC = construireLieu("grande", cour, "etage");
      const lum = [], basic = new Map(), teints = [], nuitMats = new Set(); for (const o of LC.nuitObjets || []) if (o.material) nuitMats.add(o.material);
      cour.traverse(o => { if (o.isLight) lum.push(o); if (!o.isMesh) return;
        const conv = m => { if (!m || !(m.isMeshStandardMaterial || m.isMeshLambertMaterial || m.isMeshPhongMaterial)) { if (m && m.isMeshBasicMaterial && !nuitMats.has(m) && m.blending !== THREE.AdditiveBlending && !basic.has(m)) { basic.set(m, m); teints.push([m, m.color.clone()]); } return m; }
          if (basic.has(m)) return basic.get(m); const b = new THREE.MeshBasicMaterial({ map: m.map, color: m.color.clone(), transparent: m.transparent, opacity: m.opacity, alphaTest: m.alphaTest, side: m.side });
          if (!m.map) b.color.multiplyScalar(.92); teints.push([b, b.color.clone()]); basic.set(m, b); return b; };
        o.material = Array.isArray(o.material) ? o.material.map(conv) : conv(o.material); o.castShadow = o.receiveShadow = false; });
      for (const l of lum) l.parent && l.parent.remove(l);
      // la cour n'existe que de l'autre côté de la porte : coupée au nu du mur (sinon son sol et ses murs débordent dans la cage d'escalier)
      const coupe = new THREE.Plane(new THREE.Vector3(1, 0, 0), 11.15);
      cour.traverse(o => { if (!o.isMesh) return; for (const m of Array.isArray(o.material) ? o.material : [o.material]) if (m) m.clippingPlanes = [coupe]; });
      L.dansCour = (pt) => coupe.distanceToPoint(pt) > .05;
      const T2 = textures(), ciel = new THREE.Mesh(new THREE.SphereGeometry(150, 24, 12), new THREE.MeshBasicMaterial({ map: tex(T2.ciel), side: THREE.BackSide, depthWrite: false })); cour.add(ciel);
      L.setNuit = (n) => { for (const [b, c] of teints) b.color.copy(c).multiplyScalar(n ? .07 : 1).lerp(new THREE.Color(0x0e1630), n ? .3 : 0);
        ciel.material.map = n ? null : tex(T2.ciel); ciel.material.color.setHex(n ? 0x0c1530 : 0xffffff); ciel.material.needsUpdate = true;
        for (const o of LC.nuitObjets || []) if (!o.isLight) o.visible = n; };
      // la porte de l'aile (cour : x = ±8.6, z = 13.75) sur la porte de la cage (étage : x = ±11.2, z = −2) ; une seule copie, du côté où l'on est
      let cote = 0;
      const placer = () => { const moi = M && M.moiNum && M.gens.get(M.moiNum), sg = moi ? (Math.sign(moi.g.position.x) || -1) : -1, n = moi && moi.etg ? moi.etg.n : 0;
        cour.visible = n === 0; for (const o of E.couloirs || []) o.visible = n > 0;   // au rez-de-chaussée, on ne voit pas les couloirs du dessus par la porte
        if (sg !== cote) { cote = sg; cour.position.set(sg * (11.2 - 8.6), 0, -2 - 13.75); coupe.normal.set(-sg, 0, 0); coupe.constant = 11.15; } };
      placer();
      let nVu = -1; const animE = L.anim;
      L.anim = (t) => { placer(); const moi = M && M.moiNum && M.gens.get(M.moiNum), n = moi && moi.etg ? moi.etg.n * 10 + (moi.etg.zone === "P" ? 1 : 0) : 0;
        if (n !== nVu) { nVu = n; L.grille = null; E.grille = null; } animE && animE(t); };   // (les passages possibles changent selon l'étage)
      L.copieCour = cour; L.sortieCour = () => [cote * 7.9, 13.75]; }
    L.contraindreCam = (pos, moi) => { const p0 = moi.g.position.z; pos.z = mz(pos.z); moi.g.position.z = mz(p0); const r = E.contraindreCam(pos, moi); moi.g.position.z = p0; pos.z = mz(pos.z); return r; };
  }

  // nuages
  if (L.interieur) return L;
  const nt = tex(T.nuage);
  [[-10, 38, -80, 26], [25, 44, -90, 20], [5, 30, -70, 12]].forEach(([x, y, z, s]) => { const n = new THREE.Sprite(new THREE.SpriteMaterial({ map: nt, fog: false })); n.position.set(x, y, z); n.scale.set(s, s / 2, 1); scene.add(n); });
  return L;
}

/* =====================================================================================
   La Matrice ouverte
   ===================================================================================== */
let M = null;   // l'état de la Matrice ouverte

export async function apercuLieu(conteneur, id) {
  THREE = THREE || await import(window.CASERNE_THREE || THREE_URL);
  const rendu = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  rendu.setPixelRatio(Math.min(devicePixelRatio, 2)); rendu.shadowMap.enabled = true; rendu.shadowMap.type = THREE.PCFSoftShadowMap;
  rendu.outputColorSpace = THREE.SRGBColorSpace; rendu.toneMapping = THREE.ACESFilmicToneMapping; rendu.toneMappingExposure = 1.05;
  conteneur.prepend(rendu.domElement);
  const { scene, L } = construireScene(id), camera = new THREE.PerspectiveCamera(50, 1, .1, 300);
  const w = conteneur.clientWidth, h = conteneur.clientHeight; rendu.setSize(w, h); camera.aspect = w / h;
  const portrait = h > w, c = L.cam;
  const k = portrait && !L.interieur ? 1 : 0;
  camera.position.set(c.pos[0] * (k ? .7 : 1), c.pos[1] + k * 2.5, c.pos[2] + k * 4); camera.fov = portrait ? (L.interieur ? 74 : 66) : (L.interieur ? 62 : 50);
  camera.updateProjectionMatrix(); camera.lookAt(c.vise[0], c.vise[1] - (portrait ? .5 : 0), c.vise[2]);
  if (L.anim) L.anim(4200);
  rendu.render(scene, camera);
  return { rendu, scene, camera };
}

export async function ouvrir(ctx) {
  // ctx : { conteneur, moi, token, admin, urlTete(numero, v), surFil(liste), surPresents(liste), surComptes(c), surInfo(t), surErreur(t), surLieu(id), surToucherAncien(p) }
  if (M) fermer();
  THREE = THREE || await import(window.CASERNE_THREE || THREE_URL);
  const T = textures();
  const rendu = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" }); rendu.localClippingEnabled = true;
  const resMax = Math.min(devicePixelRatio, 1.5); let res = resMax, perf = { n: 0, s: 0 };   // la finesse de l'image : elle baisse toute seule si l'ordinateur peine
  // sur ordinateur, la scène est bien plus grande que sur un téléphone : on calcule au plus ~1,1 million de points par image (comme un grand téléphone),
  // l'image est simplement agrandie à l'écran ; sans carte graphique (rendu logiciel), encore moins
  let logiciel = false; try { const gl = rendu.getContext(), dbg = gl.getExtension("WEBGL_debug_renderer_info"), nom = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : "";
    logiciel = /swiftshader|llvmpipe|software|basic render/i.test(nom); } catch (e) {}
  const budget = logiciel ? 4e5 : 2.4e6, resMin = logiciel ? .5 : Math.min(1, resMax);   // (en plein écran sur PC : environ la pleine définition de l'écran)
  const appliquerRes = () => { const w = ctx.conteneur.clientWidth || 400, h = ctx.conteneur.clientHeight || 400;
    rendu.setPixelRatio(Math.max(resMin, Math.min(res, Math.sqrt(budget / (w * h))))); };
  if (logiciel) { res = Math.min(res, 1); rendu.shadowMap.enabled = false; }   // (sans carte graphique, pas d'ombres portées)
  appliquerRes();
  rendu.shadowMap.enabled = true; rendu.shadowMap.type = THREE.PCFSoftShadowMap;
  rendu.outputColorSpace = THREE.SRGBColorSpace; rendu.toneMapping = THREE.ACESFilmicToneMapping; rendu.toneMappingExposure = 1.05;
  ctx.conteneur.prepend(rendu.domElement);
  M = { ctx, rendu, gens: new Map(), lieu: null, scene: null, camera: new THREE.PerspectiveCamera(50, 1, .1, 300), ws: null, ouvert: true, teteCache: new Map(), moiNum: null };
  const ray = new THREE.Raycaster(), v2 = new THREE.Vector2();
  // glisser le doigt à gauche ou à droite : tourner la vue ; toucher sans glisser : marcher (ou toucher un ancien)
  let glisse = null;
  // deux doigts : pincer pour rapprocher ou éloigner la caméra
  const doigts = new Map(); let pince = null;
  const bornerCam = () => { if (!M || M.camE == null) return; M.camE = Math.max(.04, Math.min(1.35, M.camE)); M.camD = Math.max(2.5, Math.min(M.L && M.L.interieur ? 8 : 24, M.camD)); };
  rendu.domElement.addEventListener("pointerdown", e => { doigts.set(e.pointerId, [e.clientX, e.clientY]);
    if (doigts.size === 2) { const [a, b] = [...doigts.values()]; pince = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), D: M && M.camD }; if (glisse) glisse.bouge = true; return; }
    glisse = { x: e.clientX, y: e.clientY, id: e.pointerId, bouge: false, yaw: M ? M.yaw || 0 : 0, E: M ? M.camE : null }; });
  rendu.domElement.addEventListener("pointermove", e => {
    if (doigts.has(e.pointerId)) doigts.set(e.pointerId, [e.clientX, e.clientY]);
    if (pince && doigts.size === 2 && M && pince.D) { const [a, b] = [...doigts.values()]; M.camD = pince.D * pince.d / Math.max(20, Math.hypot(a[0] - b[0], a[1] - b[1])); bornerCam(); return; }
    if (!glisse || glisse.id !== e.pointerId || !M) return;
    const dx = e.clientX - glisse.x, dy = e.clientY - glisse.y;
    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) glisse.bouge = true;
    if (glisse.bouge && M.L && (M.L.interieur || M.L.suivi)) { M.yaw = glisse.yaw - dx * .006; if (glisse.E != null) { M.camE = glisse.E + dy * .005; bornerCam(); } }
  });
  const leve = e => { doigts.delete(e.pointerId); if (doigts.size < 2) pince = null; };
  rendu.domElement.addEventListener("pointercancel", leve);
  rendu.domElement.addEventListener("wheel", e => { if (!M || M.camD == null) return; e.preventDefault(); M.camD *= 1 + Math.sign(e.deltaY) * .12; bornerCam(); }, { passive: false });
  rendu.domElement.addEventListener("pointerup", e => {
    const multi = doigts.size > 1 || pince; leve(e); if (multi) { glisse = null; return; }
    const g = glisse; glisse = null;
    if (!g || g.bouge || !M || !M.L) return;
    const r = rendu.domElement.getBoundingClientRect(); v2.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
    ray.setFromCamera(v2, M.camera);
    // à l'apocalypse : toucher un zombie (ou un chien), c'est lui tirer dessus
    if (M.L.apo && M.zomb && M.zomb.size) { const vv = [...M.zomb.values()].filter(z => !z.mortT && z.g.visible); const hz = ray.intersectObjects(vv.map(z => z.mesh))[0];
      if (hz) { tirer(vv.find(z => z.mesh === hz.object)); return; } }
    // toucher un ancien : son nom, écrire, (administrateur) faire taire / exclure
    const toi = M.moiNum && M.gens.get(M.moiNum);
    // (toucher son propre bonhomme ne fait plus rien : on vise le sol où l'on veut aller ; les danses sont dans les boutons)
    const corps = [...M.gens.values()].filter(p => !p.moi && p.corps).map(p => p.corps);
    const h = ray.intersectObjects(corps).find(q => !q.uv || (Math.abs(q.uv.x - .5) < .16 && q.uv.y > .08 && q.uv.y < .78));   // le corps seul, pas les marges
    if (h) { const p = [...M.gens.values()].find(q => q.corps === h.object); if (p && p.info.barman) { dire(BARMAN, PHRASES_BAR[Math.floor(Math.random() * PHRASES_BAR.length)]); return; } if (p && p.info.dj) { dire(DJ, PHRASES_DJ[Math.floor(Math.random() * PHRASES_DJ.length)]); return; } if (p && p.info.pnj) { dire(PNJ, phrasePNJ(Math.random() * 1000)); return; } if (p) { ctx.surToucherAncien && ctx.surToucherAncien(p.info); return; } }
    // le bouton ▶ / ⏹ des platines : touché si le doigt tombe tout près de lui à l'écran (plus facile qu'au pixel près)
    if (M.L.boutonDJ && M.L.boutonDJ.visible) { const q = M.L.boutonDJ.position.clone().project(M.camera);
      if (q.z < 1 && Math.hypot((q.x + 1) / 2 * r.width - (e.clientX - r.left), (1 - q.y) / 2 * r.height - (e.clientY - r.top)) < Math.max(30, r.width * .03)) { ctx.surBoutonDJ && ctx.surBoutonDJ(); return; } }
    if (M.L.zoneDJ) { const t = ray.intersectObjects(M.L.zoneDJ, true)[0]; if (t) { ctx.surToucherDJ && ctx.surToucherDJ(); return; } }
    // un cercle lumineux touché : on y va (il passe avant l'escalier, les meubles, la cour vue par la porte)
    if (M.cercles) { const vus = M.cercles.filter(c => c.g && c.g.visible); const h = ray.intersectObjects(vus.flatMap(c => [c.disque, c.anneau, c.halo]))[0];
      if (h) { const c = vus.find(c => [c.disque, c.anneau, c.halo].includes(h.object)), q = c.pt.traverse || c.pt.centre; allerVers(q[0], q[1], true); return; } }
    // le raccourci touché le plus près (une affiche posée sur un panneau passe avant le panneau)
    let rc = null, rd = Infinity; for (const q of M.L.raccourcis || []) { const h = ray.intersectObject(q.obj)[0]; if (h && h.distance - (q.affichePrio ? .3 : 0) < rd) { rd = h.distance - (q.affichePrio ? .3 : 0); rc = q; } }
    if (rc && rc.info) { ctx.surInfo && ctx.surInfo(rc.info); return; }
    if (rc && rc.affiche) {   // une affiche : de près, elle s'ouvre en grand ; de loin, on y va
      const moi = M.moiNum && M.gens.get(M.moiNum), w = rc.obj.getWorldPosition(new THREE.Vector3());
      if (moi && Math.hypot(moi.g.position.x - w.x, moi.g.position.z - w.z) > 6) { const dx = moi.g.position.x - w.x, dz = moi.g.position.z - w.z, l = Math.hypot(dx, dz) || 1; allerVers(w.x + dx / l * 1.3, w.z + dz / l * 1.3, true); }
      else ctx.surAffiche && ctx.surAffiche(rc.affiche);
      return; }
    if (rc && rc.marche) { allerVers(rc.marche[0], rc.marche[1], true); return; }
    if (rc) {
      // la porte touchée : on marche jusqu'à son cercle lumineux ; on n'entre qu'une fois dessus
      const w = rc.obj.getWorldPosition(new THREE.Vector3());
      const pts = M.L.portails.filter(q => q.vers === rc.vers && !q.continu).map(q => [q, centrePortail(q)]).filter(([, c]) => c)
        .sort((a, b) => Math.hypot(a[1][0] - w.x, a[1][1] - w.z) - Math.hypot(b[1][0] - w.x, b[1][1] - w.z));
      if (pts.length) allerVers(pts[0][1][0], pts[0][1][1], true);
      else if (!M.passage) { M.passage = true; changerLieu(rc.vers, rc.arrivee, rc.yaw); }
      return; }
    // à l'intérieur (pièces étroites) : on vise ce que le doigt touche vraiment — le sol, ou un mur, un meuble : on va juste devant
    if (M.L.interieur) {
      const sols = [M.L.sol, ...(M.L.solsPlus || [])];
      const h = ray.intersectObjects(M.scene.children, true).find(q => { const o = q.object; if (!o.isMesh || o === M.repere || o.userData.perso || (o.parent && o.parent.userData.perso)) return false; for (let a = o; a; a = a.parent) if (!a.visible || a.userData.perso) return false;   // (les bonshommes ne bloquent pas le doigt)
        if (M.L.dansCour && !M.L.dansCour(q.point)) { let a = o; while (a && a !== M.L.copieCour) a = a.parent; if (a) return false; }   // (la cour, coupée au mur : invisible de ce côté-ci) if (sols.includes(o)) return true;
        const m = Array.isArray(o.material) ? o.material[0] : o.material; return m && m.visible !== false && !(m.transparent && (m.opacity ?? 1) < .6) && m.blending !== THREE.AdditiveBlending; });
      if (h && M.L.copieCour && M.L.copieCour.visible) { let o = h.object; while (o && o !== M.L.copieCour) o = o.parent;
        if (o && M.L.dansCour && !M.L.dansCour(h.point)) o = null;
        if (o) { if (!M.passage) { M.passage = true; changerLieu("grande", M.L.sortieCour(), M.L.sortieCour()[0] < 0 ? Math.PI / 2 : -Math.PI / 2); } return; } }   // on touche la cour : on sort
      if (h) { const n = h.face ? h.face.normal.clone().transformDirection(h.object.matrixWorld) : null;
        if ((sols.includes(h.object) || (n && n.y > .7)) && M.L.allerEtage) { const moi = M.gens.get(M.moiNum); if (moi && M.L.allerEtage(moi, h.point.x, h.point.z, h.point.y)) { envoyerWS({ t: "aller", x: h.point.x, z: h.point.z }); return; } }
        if (sols.includes(h.object) || (n && n.y > .7)) allerVers(h.point.x, h.point.z, true);
        else { const c = M.camera.position, dx = c.x - h.point.x, dz = c.z - h.point.z, l = Math.hypot(dx, dz) || 1; allerVers(h.point.x + dx / l * .5, h.point.z + dz / l * .5, true); }
        return; }
    }
    const s = ray.intersectObjects([M.L.sol, ...(M.L.solsPlus || [])])[0];   // (dehors)
    if (s) allerVers(s.point.x, s.point.z, true);
    else { const d = ray.ray.direction, o = ray.ray.origin; allerVers(o.x + d.x * 40, o.z + d.z * 40, true); }   // vers le haut d'un mur : dans sa direction
  });
  rendu.domElement.addEventListener("pointercancel", () => { glisse = null; });
  M.redim = () => { if (!M) return; const w = ctx.conteneur.clientWidth, h = ctx.conteneur.clientHeight; if (!w || !h) return; appliquerRes(); rendu.setSize(w, h); M.camera.aspect = w / h; placerCamera(true); };
  addEventListener("resize", M.redim);
  M.ro = new ResizeObserver(M.redim); M.ro.observe(ctx.conteneur);
  connecter();
  M.minuteur = setInterval(majAmbiance, 60000);
  let avant = performance.now();
  rendu.setAnimationLoop(t => {
    if (!M || !M.scene) return;
    const brut = t - avant, dt = Math.min(.05, brut / 1000); avant = t; M.dtCam = dt;
    // trop lent (moins de 35 images par seconde) : on affine moins l'image ; très à l'aise : on la rend plus fine
    if (brut > 0 && brut < 250) { perf.n++; perf.s += brut; if (perf.n >= 60) { const moy = perf.s / perf.n; perf = { n: 0, s: 0 };
      const r = moy > 34 ? Math.max(resMin, res - .25) : moy < 13 && t > (M.resBaisseT || 0) + 30000 ? Math.min(resMax, res + .25) : res;   // (on ne remonte pas tout de suite : pas de va-et-vient)
      if (r < res) M.resBaisseT = t;
      if (r !== res) { res = r; M.redim && M.redim(); } } }
    preparerVoisin();
    for (const p of M.gens.values()) {
      p.g.position.y = M.L.hauteur ? M.L.hauteur(p.g.position.x, p.g.position.z, p) : 0;
      if (M.L.limites && M.L.limites(p.g.position.x, p.g.position.z)) p.dernierOk = [p.g.position.x, p.g.position.z];
      if (p.cible) { const d = p.cible.clone().sub(p.g.position); d.y = 0; const L = d.length();
        if (L < .05) { if (p.chemin && p.chemin.length) p.cible = p.chemin.shift(); else { p.cible = null; p.vit = 0; p.dir = null; p.rapide = false; if (p.corps) p.corps.position.y = 0; if (p.moi) M.repere.material.opacity = 0; } }
        else if (!M.L.limites(p.g.position.x + d.x / L * .15, p.g.position.z + d.z / L * .15) && (!p.info.pnj || M.L.limites(p.g.position.x, p.g.position.z))) {   // (le barman et le DJ vivent derrière leur comptoir)
          // jamais dans un mur, une barrière ou le vide : on s'arrête net ; si l'on s'y trouvait déjà, on revient au dernier endroit permis
          if (!M.L.limites(p.g.position.x, p.g.position.z) && p.dernierOk) { p.g.position.x = p.dernierOk[0]; p.g.position.z = p.dernierOk[1]; }
          // garde-fou : jamais dans un mur (on s'arrête net plutôt que de traverser)
          p.cible = null; p.chemin = []; p.vit = 0; p.dir = null; if (p.corps) p.corps.position.y = 0; if (p.moi) M.repere.material.opacity = 0; }
        else {
          /* une marche fluide : on accélère au départ, on ralentit en arrivant, et l'on tourne en douceur dans les virages au lieu de s'arrêter à chaque coin */
          const dn = d.clone().normalize(), fin = !(p.chemin && p.chemin.length);
          if (!p.dir) p.dir = dn.clone(); else { p.dir.lerp(dn, Math.min(1, dt * 9)); if (p.dir.lengthSq() < 1e-4) p.dir.copy(dn); p.dir.normalize(); }
          const vmax = (fin ? 3.3 * Math.max(.35, Math.min(1, L / .9)) : 3.3) * (p.rapide ? 1.55 : 1);   // (avec les boutons d'étage, on grimpe d'un bon pas)
          p.vit = (p.vit || 0) + (vmax - (p.vit || 0)) * Math.min(1, dt * 6);
          const pas = Math.min(L, p.vit * dt);
          let sens = L < .25 || p.dir.dot(dn) < .5 ? dn : p.dir;
          if (sens !== dn && !M.L.limites(p.g.position.x + sens.x * (pas + .1), p.g.position.z + sens.z * (pas + .1))) sens = dn;   // (dans un passage étroit : tout droit vers le point)
          p.g.position.addScaledVector(sens, pas);
          if (!fin && L < .28) p.cible = p.chemin.shift();      // le coin : on enchaîne sur le bout de chemin suivant
          // le pas : un léger balancement du corps (pas pendant une danse)
          p.pasT = (p.pasT || 0) + pas;
          if (p.corps && !p.info.danse && !Number.isInteger(p.info.assis)) p.corps.position.y = Math.abs(Math.sin(p.pasT * 3.4)) * .045 * Math.min(1, p.vit / 1.5);
          if (p.moi && (M.L.interieur || M.L.suivi) && !glisse) { let da = Math.atan2(-d.x, -d.z) - (M.yaw || 0); da = Math.atan2(Math.sin(da), Math.cos(da)); if (Math.abs(da) < 2.6) M.yaw = (M.yaw || 0) + da * Math.min(1, dt * 2.2); }   // la caméra se tourne d'elle-même dans le sens de la marche if (p.corps) p.corps.position.y = Math.abs(Math.sin(t / 90)) * .06;
          if (p.moi) { const px = p.g.position.x, pz = p.g.position.z;
            const pt = M.L.portails.find(q => q.continu || !q.centre ? q.dans(px, pz) : M.cerclePret && q.dans(q.zc[0], q.zc[1]) && Math.hypot(px - q.centre[0], pz - q.centre[1]) < RAYON_CERCLE * .85); if (pt && !M.passage) { M.passage = true;
              if (pt.entreeApo && !estApo(M.lieu) && M.ctx.surAvantApo) { p.cible = null; p.chemin = [];
                M.ctx.surAvantApo(ok => { if (!M) return; if (ok) changerLieu(pt.vers, pt.arrivee, pt.yaw);
                  else { const moi2 = M.gens.get(M.moiNum); if (moi2) { moi2.g.position.x += 2.2; moi2.cible = null; envoyerWS({ t: "aller", x: moi2.g.position.x, z: moi2.g.position.z }); } M.cerclePret = false; M.passage = false; } }); }
              else if (pt.continu) changerLieuContinu(pt.vers, pt.continu); else changerLieu(pt.vers, pt.arrivee, pt.yaw); } } } }
      if (p.bulle && p.bulleFin && t > p.bulleFin) { p.g.remove(p.bulle); p.bulle = null; }
      // il joue : 🎮 la console, 🕹️ le flipper, 🎯 les fléchettes, au-dessus de sa tête (elle flotte doucement)
      if ((p.info.joue || null) !== (p.iconeJeu || null)) { if (p.icone) { p.g.remove(p.icone); p.icone.material.map.dispose(); p.icone.material.dispose(); p.icone = null; }
        p.iconeJeu = p.info.joue || null;
        if (p.iconeJeu) { const H = tailleBonhomme(); p.icone = sprite(toile(128, 128, x => { x.fillStyle = "rgba(255,250,240,.95)"; x.beginPath(); x.arc(64, 64, 58, 0, 7); x.fill(); x.lineWidth = 6; x.strokeStyle = "#b5573c"; x.stroke();
            x.font = "64px sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText({ console: "🎮", flipper: "🕹️", flechettes: "🎯" }[p.iconeJeu] || "🎮", 64, 70); }), H * .32, H * .32);
          p.icone.position.y = H * hauteurDe(p) + .32; p.g.add(p.icone); } }
      if (p.icone) p.icone.position.y = tailleBonhomme() * hauteurDe(p) + .32 + Math.sin(t / 400) * .05;
      // la danse : il se balance d'un côté à l'autre en levant les bras
      if (p.corps && p.poses && !p.differe) {
        const sx = tailleBonhomme() * .476 * 1.6 * hauteurDe(p);
        if (p.info.danse !== "madison") p.corps.scale.x = sx;
        const partenaire = p.info.slow && M.gens.get(p.info.slow);
        if (p.tirT && performance.now() - p.tirT < 380 && p.poses.tir) {
          if (p.corps.material.map !== p.poses.tir) { p.corps.material.map = p.poses.tir; p.corps.material.needsUpdate = true; }
          p.corps.material.rotation = 0; p.corps.position.x = 0; p.dansait = true; }
        else if (p.info.joue && !p.moi) {
          // il joue : de dos, tourné vers la machine, il remue un peu (les mains sur les commandes)
          if (p.corps.material.map !== p.poses.dos) { p.corps.material.map = p.poses.dos; p.corps.material.needsUpdate = true; }
          p.corps.material.rotation = Math.sin(t / 260) * .03; p.corps.position.x = 0; if (!p.cible) p.corps.position.y = 0; p.dansait = true; }
        else if (Number.isInteger(p.info.assis)) {
          // assis au bar : il boit une gorgée de temps en temps
          const ph = (t + p.info.numero * 1300) % 6000, pose = ph < 1300 ? "boire" : "assis";
          if (p.corps.material.map !== p.poses[pose]) { p.corps.material.map = p.poses[pose]; p.corps.material.needsUpdate = true; }
          p.corps.material.rotation = 0; p.corps.position.x = 0; p.corps.position.y = 0; p.dansait = true; }
        else if (partenaire) {
          // le slow : chacun tourné vers l'autre, on se balance doucement ensemble
          const pose = p.g.position.x <= partenaire.g.position.x ? "slowD" : "slow";
          if (p.corps.material.map !== p.poses[pose]) { p.corps.material.map = p.poses[pose]; p.corps.material.needsUpdate = true; }
          const ph = t / 900; p.corps.material.rotation = Math.sin(ph) * .05; p.corps.position.x = Math.sin(ph) * .05; if (!p.cible) p.corps.position.y = 0; p.dansait = true; }
        else if (p.info.danse === "travolta") {
          // John Travolta, seul devant les Bee Gees (voir choreTravolta)
          const c = choreTravolta();
          if (p.corps.material.map !== p.poses[c.pose]) { p.corps.material.map = p.poses[c.pose]; p.corps.material.needsUpdate = true; }
          p.corps.scale.x = sx * c.tour; p.corps.material.rotation = c.rot; p.corps.position.x += (c.sx - p.corps.position.x) * .3; if (!p.cible) p.corps.position.y = c.saut; p.dansait = true; }
        else if (p.info.danse === "beegees") {
          // les Bee Gees : la chorégraphie disco, tous les trois au même temps (voir choreBeeGees)
          const c = choreBeeGees();
          if (p.corps.material.map !== p.poses[c.pose]) { p.corps.material.map = p.poses[c.pose]; p.corps.material.needsUpdate = true; }
          p.corps.scale.x = sx * c.tour; p.corps.material.rotation = c.rot; p.corps.position.x += (c.sx - p.corps.position.x) * .3; if (!p.cible) p.corps.position.y = c.saut; p.dansait = true; }
        else if (p.info.danse === "chant" && p.poses.chant1) {
          // Dave Gahan : il chante, le micro à la bouche ; de temps en temps il lève le bras vers la salle, se balance, tourne un peu sur lui-même
          const ph = t / 520, k = Math.floor(ph) % 12, pose = k >= 8 && k <= 10 ? "chant2" : "chant1";
          if (p.corps.material.map !== p.poses[pose]) { p.corps.material.map = p.poses[pose]; p.corps.material.needsUpdate = true; }
          p.corps.material.rotation = Math.sin(t / 700) * .08; p.corps.position.x = Math.sin(t / 1100) * .08; if (!p.cible) p.corps.position.y = Math.abs(Math.sin(t / 520 * Math.PI)) * .02; p.dansait = true; }
        else if (p.info.danse === "clavier" && p.poses.clavier1) {
          // Andy Fletcher aux claviers : les mains qui jouent, la tête qui hoche
          const pose = Math.floor(t / 260) % 2 ? "clavier2" : "clavier1";
          if (p.corps.material.map !== p.poses[pose]) { p.corps.material.map = p.poses[pose]; p.corps.material.needsUpdate = true; }
          p.corps.material.rotation = Math.sin(t / 520 * Math.PI) * .025; p.corps.position.x = 0; if (!p.cible) p.corps.position.y = 0; p.dansait = true; }
        else if (p.info.danse === "batterie" && p.poses.batterie1) {
          // la batteuse : caisse claire main gauche, main droite, et un coup de cymbales toutes les quatre mesures ; au repos, les baguettes sur la caisse
          const ph = t / 230, k = Math.floor(ph) % 16, pose = !p.info.enMusique ? "batterie0" : k === 15 || k === 7 ? "batterie3" : k % 2 ? "batterie2" : "batterie1";
          if (p.corps.material.map !== p.poses[pose]) { p.corps.material.map = p.poses[pose]; p.corps.material.needsUpdate = true; }
          p.corps.material.rotation = p.info.enMusique ? Math.sin(t / 460) * .04 : 0; p.corps.position.x = 0; p.corps.position.y = p.info.enMusique ? Math.abs(Math.sin(t / 230 * Math.PI)) * .02 : 0; p.dansait = true; }
        else if (p.info.danse === "guitare" && p.poses.guitare1) {
          // Robert Smith (et le bassiste, le guitariste du groupe) joue : il gratte en rythme, se balance doucement ; sans musique, il attend, l'instrument à la main
          const ph = t / (p.info.musicien === "basse" ? 460 : 300), pose = p.info.musicien && !p.info.enMusique ? "guitare1" : Math.floor(ph) % 2 ? "guitare2" : "guitare1";
          if (p.corps.material.map !== p.poses[pose]) { p.corps.material.map = p.poses[pose]; p.corps.material.needsUpdate = true; }
          p.corps.material.rotation = Math.sin(t / 900) * .06; p.corps.position.x = Math.sin(t / 900) * .05; if (!p.cible) p.corps.position.y = p.info.musicien && p.info.enMusique ? Math.abs(Math.sin(t / (p.info.musicien === "basse" ? 460 : 300) * Math.PI)) * .025 : 0; p.dansait = true; }
        else if (p.info.danse === "alive" && p.poses.canne1) {
          // Mr Hernandez : la danse de Born to Be Alive (voir choreAlive)
          const c = choreAlive();
          if (p.corps.material.map !== p.poses[c.pose]) { p.corps.material.map = p.poses[c.pose]; p.corps.material.needsUpdate = true; }
          p.corps.scale.x = sx * c.tour; p.corps.material.rotation = c.rot; p.corps.position.x += (c.sx - p.corps.position.x) * .3; if (!p.cible) p.corps.position.y = c.saut; p.dansait = true; }
        else if (p.info.danse === "thriller" && p.info.danseur && M.trioPret) {
          // les trois danseurs du clip : la même chorégraphie, au même temps (voir choreThriller)
          const c = choreThriller();
          if (p.corps.material.map !== p.poses[c.pose]) { p.corps.material.map = p.poses[c.pose]; p.corps.material.needsUpdate = true; }
          p.corps.material.rotation = c.rot; p.corps.position.x += (c.sx - p.corps.position.x) * .3; p.corps.position.y = c.saut; p.dansait = true; }
        else if (p.info.danse === "thriller") {
          /* Thriller : griffes à gauche (2 temps, la tête et les épaules penchées), griffes à droite (2 temps)… et tous les 8 temps, les bras levés devant, en avançant */
          const ph = t / 380 + p.info.numero * .7, k = Math.floor(ph) % 8, v = ph % 1;
          // tourné vers la gauche (profil), puis vers la droite (profilD : l'image retournée, c'est l'autre pied qui se lève)
          const sens = k >= 6 ? 0 : Math.floor(k / 2) % 2 ? 1 : -1, pose = sens === 0 ? "thriller3" : sens > 0 ? "profilD" : "profil";
          if (p.corps.material.map !== p.poses[pose]) { p.corps.material.map = p.poses[pose]; p.corps.material.needsUpdate = true; }
          const coup = Math.sin(Math.min(1, v * 2.5) * Math.PI / 2);
          p.corps.material.rotation = -sens * .1 * coup; p.corps.position.x += (sens * .14 * coup - p.corps.position.x) * .3;
          if (!p.cible) p.corps.position.y = pose === "thriller3" ? Math.abs(Math.sin(ph * Math.PI)) * .06 : (v < .2 ? .04 * (1 - v / .2) : 0); p.dansait = true; }
        else if (p.info.danse === "madison") {
          /* le Madison, en boucle sur 16 temps :
             1-4 pointe du pied gauche sur le côté, clap, pointe du pied droit, clap ;
             5-8 genou gauche levé et clap sous le genou, clap, genou droit levé et clap, clap ;
             9-12 on recommence les pointes de pied ;
             13-16 un tour complet sur soi-même, en frappant dans les mains */
          const ph = t / 340 + p.info.numero * .7, k = Math.floor(ph) % 16, v = ph % 1;
          const SUITE = ["madison1", "madison2", "madison3", "madison2", "madison4", "madison2", "madison5", "madison2", "madison1", "madison2", "madison3", "madison2"];
          let pose = SUITE[k] || "madison2", lx = sx;
          if (k >= 12) { const a = ((k - 12) + v) / 4 * Math.PI * 2, cs = Math.cos(a); lx = sx * Math.max(.08, Math.abs(cs)); if (cs < 0) pose = "dos"; }
          if (p.corps.material.map !== p.poses[pose]) { p.corps.material.map = p.poses[pose]; p.corps.material.needsUpdate = true; }
          p.corps.scale.x = lx; p.corps.material.rotation = 0;
          const dx = pose === "madison1" ? -.16 : pose === "madison3" ? .16 : 0;
          p.corps.position.x += (dx - p.corps.position.x) * .25;
          if (!p.cible) p.corps.position.y = pose === "madison2" || pose === "dos" ? Math.abs(Math.sin(ph * Math.PI)) * .05 : 0; p.dansait = true; }
        else if (p.info.danse === "saut") {
          // le saut, les mains en l'air : on saute en rythme, bras tendus vers le ciel ; à la réception, on plie un peu (bras à mi-hauteur)
          const ph = t / 520 + p.info.numero * .37, v = ph % 1, enl = v < .78, pose = enl ? "haut" : "mi";
          if (p.corps.material.map !== p.poses[pose]) { p.corps.material.map = p.poses[pose]; p.corps.material.needsUpdate = true; }
          p.corps.material.rotation = enl ? Math.sin(ph * Math.PI) * .05 : 0; p.corps.position.x = 0;
          if (!p.cible) p.corps.position.y = enl ? Math.sin(v / .78 * Math.PI) * .38 : 0; p.dansait = true; }
        else if (p.info.danse === "charleston") {
          // le Charleston : les genoux s'ouvrent et se croisent, les mains passent d'un genou à l'autre
          const ph = t / 280 + p.info.numero * .7, pose = Math.floor(ph) % 2 ? "genoux2" : "genoux1";
          if (p.corps.material.map !== p.poses[pose]) { p.corps.material.map = p.poses[pose]; p.corps.material.needsUpdate = true; }
          p.corps.material.rotation = 0; p.corps.position.x = 0; if (!p.cible) p.corps.position.y = Math.abs(Math.sin(ph * Math.PI)) * .05; p.dansait = true; }
        else if (p.info.danse === "disco") {
          // façon Saturday Night Fever : le doigt en l'air, puis vers le sol, en roulant des hanches
          const ph = t / 460 + p.info.numero * .7, pose = Math.floor(ph) % 2 ? "disco2" : "disco1";
          if (p.corps.material.map !== p.poses[pose]) { p.corps.material.map = p.poses[pose]; p.corps.material.needsUpdate = true; }
          const v = ph % 1, coup = Math.sin(Math.min(1, v * 3) * Math.PI / 2);
          p.corps.material.rotation = (pose === "disco1" ? -.1 : .12) * coup; p.corps.position.x = (pose === "disco1" ? -.08 : .1) * coup; if (!p.cible) p.corps.position.y = Math.abs(Math.sin(ph * Math.PI * 2)) * .05; p.dansait = true; }
        else if (p.info.danse) { const ph = t / 320 + p.info.numero * .7, pose = ["repos", "mi", "haut", "mi"][Math.floor(ph * 2) % 4];
          if (p.corps.material.map !== p.poses[pose]) { p.corps.material.map = p.poses[pose]; p.corps.material.needsUpdate = true; }
          p.corps.material.rotation = Math.sin(ph * Math.PI) * .13; p.corps.position.x = Math.sin(ph * Math.PI) * .14; if (!p.cible) p.corps.position.y = Math.abs(Math.sin(ph * Math.PI * 2)) * .07; p.dansait = true; }
        else if (p.dansait) { p.dansait = false; p.corps.scale.x = tailleBonhomme() * .476 * 1.6 * hauteurDe(p); p.corps.material.map = p.poses.repos; p.corps.material.needsUpdate = true; p.corps.material.rotation = 0; p.corps.position.x = 0; p.corps.position.y = 0; }
      }
    }
    if (M.L.anim) M.L.anim(t);
    if (!M.triVus || t - M.triVus > 1000) { M.triVus = t; trierVisibles(); }
    animerCercles(t); ambianceApo(); animerApo(performance.now(), dt);
    { const moi = M.moiNum && M.gens.get(M.moiNum), n = baseLieu(M.lieu) === "etage" ? (moi && moi.etg ? moi.etg.n : 0) : null;   // l'étage où l'on est : pour les boutons Monter / Redescendre
      if (n !== M.etageVu) { M.etageVu = n; ctx.surEtage && ctx.surEtage(n, ET.N); } }
    animerPNJ(); animerDJ(t); animerBarman(t); animerDanseur(); animerHernandez(); animerBeeGees(); animerSmith(); animerGroupe();
    for (const p of M.gens.values()) if (p.corps && p.corps.droit) { const c = M.camera.position, gp = p.g.position, dx = c.x - gp.x, dz = c.z - gp.z;
      p.corps.rotation.y = Math.atan2(dx, dz); p.corps.rotation.x = -Math.min(p.info.dj || p.info.barman ? 0 : .3, Math.max(0, Math.atan2(c.y - gp.y - 1, Math.hypot(dx, dz))));
      // assis sur un tabouret : le bonhomme est avancé vers nous, devant l'assise (sinon le pouf rond passe devant ses cuisses, comme s'il était entre ses jambes)
      const avance = Number.isInteger(p.info.assis) ? .3 - Math.sin(p.corps.rotation.x) * .7 : 0;   // (+ ce que le panneau penché recule à hauteur des hanches)
      if (avance || p.avance) { const d = Math.hypot(dx, dz) || 1; p.corps.position.x = dx / d * avance; p.corps.position.z = dz / d * avance; p.avance = avance > 0; }
      if (p.flashT) { const on = performance.now() < p.flashT; p.corps.material.color.setRGB(1, on ? .35 : 1, on ? .35 : 1); if (!on) p.flashT = 0; }   // (un équipier touché rougit)
      if (p.info.mortT) { const f = Math.min(1, (performance.now() - p.info.mortT) / 650); p.corps.rotation.x = -f * Math.PI / 2 * .96; p.corps.rotation.z = 0; } }
    // la musique de la fête : à fond dans la salle ; dehors, la nuit, par la porte ouverte (plus fort en s'approchant)
    const moiP = M.moiNum && M.gens.get(M.moiNum), P = M.L.porteFete;
    let vol = M.L.interieur && !M.L.sansMusique ? 1 : 0;
    if (P && M.L.nuit && moiP) { const d = Math.hypot(moiP.g.position.x - P.x, moiP.g.position.z - P.z); vol = .07 + .38 * Math.max(0, 1 - d / 22); }
    if (Math.abs(vol - (M.volume ?? -1)) > .015) { M.volume = vol; M.ctx.surVolume && M.ctx.surVolume(vol); }
    // le bouton ▶ / ⏹ des platines (toujours au premier plan) : seulement quand on est dans la salle, pas dans l'escalier ni au sous-sol
    if (M.L.boutonDJ && moiP) M.L.boutonDJ.visible = moiP.g.position.z < 15.2 && !!(M.ctx.moiInfo && M.ctx.moiInfo().admin);   // (l'administrateur seul)
    chercherAction(t);
    if (M.cine) { M.cine.maj(performance.now()); M.camera.fov = M.camera.aspect < 1 ? 70 : 55; M.camera.updateProjectionMatrix(); } else placerCamera(false);
    if (M.lieu === "hv1955" && !M.cine && M.L.delorean && M.L.delorean.visible && !M.gens.has(DOC)) ajouterDoc(-7.2, 13.9);   // (Doc attend près de la DeLorean)
    if (M.L.placerCour) M.L.placerCour(M.camera.position.z);
    rendu.render(M.scene, M.camera);
  });
  M.redim();
  return M;
}

export function fermer() {
  if (!M) return;
  couperSonsApo();
  M.ouvert = false;
  try { M.ws && M.ws.close(1000, "Fermé"); } catch (e) {}
  clearTimeout(M.reco); clearInterval(M.minuteur);
  removeEventListener("resize", M.redim); M.ro && M.ro.disconnect();
  M.rendu.setAnimationLoop(null); M.rendu.dispose(); M.rendu.domElement.remove();
  M = null;
}

/* ===================== la caserne de l'apocalypse =====================
   Par la case ouverte de la déchetterie, on passe dans la même caserne… la nuit de la fin du monde : brouillard rougeâtre, voitures calcinées
   qui brûlent dans la rue, débris, sang séché, lumières qui grésillent. Les lieux s'appellent « z-rue », « z-grande », « z-fetes », « z-etage » :
   même géométrie que les vrais, mais on n'y croise que ceux qui sont passés de l'autre côté. */
/* l'ambiance sonore dehors, à l'apocalypse (sirènes lointaines, vent, cris) : en boucle, tant qu'on est à l'extérieur */
let sonApo = null, sonFeu = null, sonRepos = null;
function ambianceApo() {
  const moiR = M && M.moiNum && M.gens.get(M.moiNum), auRepos = !!(moiR && M.L && estApo(M.lieu) && M.L.repos && M.L.repos(moiR.g.position.x, moiR.g.position.z));
  if (auRepos && !sonRepos) { sonRepos = new Audio("sons/apo-repos.mp3"); sonRepos.loop = true; sonRepos.volume = .8; }
  if (sonRepos) { if (auRepos && sonRepos.paused) { if (performance.now() - (sonRepos.essai || 0) > 2000) { sonRepos.essai = performance.now(); sonRepos.play().catch(() => {}); } } else if (!auRepos && !sonRepos.paused) sonRepos.pause(); }
  // le crépitement de l'essence qui brûle : plus fort en s'approchant d'une voiture en feu ou d'un brasier
  const moi = M && M.moiNum && M.gens.get(M.moiNum), F = M && M.L && estApo(M.lieu) && M.L.feuxSon || [];
  let vf = 0; if (moi && F.length && !auRepos) { const d = Math.min(...F.map(([x, z]) => Math.hypot(moi.g.position.x - x, moi.g.position.z - z))); vf = Math.max(0, 1 - d / 16) ** 1.5; }
  if (vf > 0 && !sonFeu) { sonFeu = new Audio("sons/apo-feu.mp3"); sonFeu.loop = true; }
  if (sonFeu) { sonFeu.volume = Math.min(1, vf);
    if (vf > .01 && sonFeu.paused) { if (performance.now() - (sonFeu.essai || 0) > 2000) { sonFeu.essai = performance.now(); sonFeu.play().catch(() => {}); } } else if (vf <= .01 && !sonFeu.paused) sonFeu.pause(); }
  const dehors = M && M.L && estApo(M.lieu) && !M.L.interieur;
  if (dehors && !sonApo) { sonApo = new Audio("sons/apo-ville.mp3"); sonApo.loop = true; sonApo.volume = .7; }
  if (!sonApo) return;
  if (dehors && sonApo.paused) { if (performance.now() - (sonApo.essai || 0) > 2000) { sonApo.essai = performance.now(); sonApo.play().catch(() => {}); } } else if (!dehors && !sonApo.paused) sonApo.pause();
}
const baseLieu = id => id === "bttf-cour" ? "grande" : String(id || "").replace(/^z-/, ""), estApo = id => /^z-/.test(id || "");
// une flamme (dégradé jaune → orange → rouge, en goutte), partagée par tous les feux
let texFlamme = null, texFumee = null, texSang = [];
let texFlammes = null;
function flammesPixel() {
  const N = 8, W = 40, H = 64, out = [];
  let s = 7; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const blobs = Array.from({ length: 70 }, () => ({ x: .5 + (r() - .5) * .7, v: .5 + r(), r: .08 + r() * .14, p: r(), w: r() * 6 }));
  for (let f = 0; f < N; f++) {
    const c = document.createElement("canvas"); c.width = W; c.height = H; const x = c.getContext("2d");
    const g = x.createImageData(W, H), d = g.data, champ = new Float32Array(W * H);
    for (const b of blobs) { const u = (b.p + f / N * b.v) % 1, cy = (1 - u) * H, cx = (b.x + Math.sin(u * 7 + b.w) * .08 * (1 + u)) * W, rr = b.r * W * (1.25 - u * .8);
      for (let j = Math.max(0, cy - rr | 0); j < Math.min(H, cy + rr + 1); j++) for (let i = Math.max(0, cx - rr | 0); i < Math.min(W, cx + rr + 1); i++) { const q = 1 - Math.hypot(i - cx, (j - cy) * .8) / rr; if (q > 0) champ[j * W + i] += q * (1.3 - u * .9); } }
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) { const k = j * W + i, bas = j / H, v = champ[k] * (.35 + bas * .9) - Math.abs(i / W - .5) * .5;
      let R = 0, G = 0, B = 0, A = 0;
      if (v > 1.7) { R = 255; G = 236; B = 140; A = 255; } else if (v > 1.15) { R = 255; G = 190; B = 40; A = 255; } else if (v > .75) { R = 250; G = 120; B = 18; A = 250; }
      else if (v > .45) { R = 215; G = 60; B = 10; A = 235; } else if (v > .28) { R = 140; G = 26; B = 8; A = 200; } else if (v > .18 && bas < .7) { R = 40; G = 18; B = 12; A = 150; }   // (en haut, la fumée noire)
      d[k * 4] = R; d[k * 4 + 1] = G; d[k * 4 + 2] = B; d[k * 4 + 3] = A; }
    x.putImageData(g, 0, 0);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; out.push(t); }
  return out;
}
function texturesApo() {
  if (texFlamme) return;
  texFlammes = flammesPixel();
  texFlamme = tex(toile(128, 192, (x, w, h) => { const g = x.createRadialGradient(64, 130, 6, 64, 120, 70); g.addColorStop(0, "rgba(255,250,210,1)"); g.addColorStop(.25, "rgba(255,200,80,.95)"); g.addColorStop(.55, "rgba(255,110,30,.75)"); g.addColorStop(1, "rgba(160,30,10,0)");
    x.fillStyle = g; x.beginPath(); x.moveTo(64, 4); x.bezierCurveTo(104, 70, 124, 120, 104, 160); x.quadraticCurveTo(64, 196, 24, 160); x.bezierCurveTo(4, 120, 24, 70, 64, 4); x.fill(); }));
  texFumee = tex(toile(128, 128, (x) => { const g = x.createRadialGradient(64, 64, 4, 64, 64, 62); g.addColorStop(0, "rgba(40,34,32,.75)"); g.addColorStop(1, "rgba(40,34,32,0)"); x.fillStyle = g; x.fillRect(0, 0, 128, 128); }));
  for (let k = 0; k < 4; k++) texSang.push(tex(toile(256, 256, (x) => {   // une flaque de sang séché, irrégulière, avec des gouttes autour
    let s = 17 + k * 31; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    x.fillStyle = "rgba(92,8,8,.88)"; x.beginPath(); const n = 14; for (let i = 0; i <= n; i++) { const a = i / n * Math.PI * 2, rr = 52 + r() * 40; x.lineTo(128 + Math.cos(a) * rr, 128 + Math.sin(a) * rr * .8); } x.fill();
    x.fillStyle = "rgba(60,4,4,.6)"; x.beginPath(); x.ellipse(118, 124, 40, 26, .4, 0, 7); x.fill();
    for (let i = 0; i < 14; i++) { x.fillStyle = `rgba(${80 + r() * 30},6,6,${.5 + r() * .4})`; x.beginPath(); x.arc(30 + r() * 196, 30 + r() * 196, 3 + r() * 9, 0, 7); x.fill(); }
    x.strokeStyle = "rgba(70,6,6,.7)"; x.lineWidth = 6; x.lineCap = "round"; for (let i = 0; i < 3; i++) { const a = r() * 7; x.beginPath(); x.moveTo(128 + Math.cos(a) * 60, 128 + Math.sin(a) * 50); x.lineTo(128 + Math.cos(a) * (100 + r() * 24), 128 + Math.sin(a) * (90 + r() * 20)); x.stroke(); } })));
}
function apocalypse(scene, L, base) {
  texturesApo();
  L.apo = true; L.sansMusique = true; L.porteFete = null; L.posDJ = null; L.posBar = null; L.zoneDJ = null;
  if (L.boutonDJ) { L.boutonDJ.visible = false; L.boutonDJ = null; }
  // les passages mènent à la caserne de l'apocalypse ; seule la case de la déchetterie ramène à la vraie
  for (const q of L.portails || []) q.vers = q.entreeApo ? "grande" : "z-" + q.vers;
  for (const q of L.raccourcis || []) if (q.vers) q.vers = q.entreeApo ? "grande" : "z-" + q.vers;
  const ext = !L.interieur, feux = [], clignos = []; L.feuxSon = []; L.feuxZ = [];   // (feuxZ : là où l'on brûle, [x, z, rayon])
  // le ciel bas, rouge de fumée ; le brouillard
  const ciel = tex(toile(512, 512, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#070302"); g.addColorStop(.55, "#2a0e08"); g.addColorStop(.85, "#5a2010"); g.addColorStop(1, "#7a3014"); x.fillStyle = g; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 60; i++) { const rr = 20 + Math.random() * 70, gx = Math.random() * w, gy = h * .3 + Math.random() * h * .6, f = x.createRadialGradient(gx, gy, 2, gx, gy, rr); f.addColorStop(0, "rgba(20,10,8,.55)"); f.addColorStop(1, "rgba(20,10,8,0)"); x.fillStyle = f; x.fillRect(gx - rr, gy - rr, rr * 2, rr * 2); } }));
  const brume = ext ? 0x2a120c : 0x140a08;
  // les lumières : plus faibles, plus rouges ; certaines grésillent
  const orange = new THREE.Color(0xff7a40);
  // (chaque lumière garde sa valeur de nuit d'origine : on peut repasser ici autant de fois qu'on veut, sans qu'elles s'éteignent peu à peu)
  const teinter = () => { scene.traverse(o => { if (!o.isLight || o.userData.apo) return;
      if (o.userData.i0 === undefined) { o.userData.i0 = o.intensity; if (o.isHemisphereLight) { o.color.setHex(0x7a3424); o.groundColor.setHex(0x1a0a06); } else o.color.lerp(orange, o.isPointLight || o.isSpotLight ? .35 : .5);
        if ((o.isPointLight || o.isSpotLight) && Math.random() < .3) clignos.push(o); }
      if (o.isHemisphereLight) { o.color.setHex(0x7a3424); o.groundColor.setHex(0x1a0a06); }
      o.intensity = o.userData.i0 * (o.isHemisphereLight ? .85 : .6); });
    scene.background = ext ? ciel : new THREE.Color(0x0a0605); scene.fog = new THREE.Fog(brume, ext ? 7 : 4, ext ? 46 : 28); };
  const setN = L.setNuit;
  // plus de fête ni de fenêtres allumées : la boule, les projecteurs, les lyres sont éteints ; les fenêtres sont noires
  const eteindre = () => { (L.nuitObjets || []).forEach(o => { if (!o.isLight) o.visible = false; });
    if (L.fete) { for (const p of L.fete.projos) { p.spot.visible = p.cone.visible = false; p.verre.material.color.setHex(0x222222); } for (const [sp] of L.fete.fumees) sp.visible = false; L.fete.reflets.visible = false; L.fete.boule.visible = false; }
    if (L.club3d) { for (const ly of L.club3d.lyres) ly.faisceau.visible = ly.sol.visible = ly.lentille.visible = false; for (const l of L.club3d.tournantes) l.visible = false; } };
  /* trop de lumières rendent tout lent (la salle des fêtes en a plus de trente) : les lampes de la pièce sont « éteintes »,
     et six lumières seulement, toujours là, prennent la place des lampes allumées les plus proches de nous */
  const sources = [], pool = [0, 1, 2, 3, 4, 5].map(() => { const l = new THREE.PointLight(0xffffff, 0, 8, 1.5); l.userData.apo = true; scene.add(l); return l; });
  const regrouper = () => { if (base === "etage") return;   // (les étages ont déjà leur propre jeu de douze lampes)
    scene.updateMatrixWorld(true); scene.traverse(o => { if (!o.isPointLight || o.userData.apo) return;
      if (!o.userData.pos) { o.userData.pos = o.parent === scene ? o.position : o.getWorldPosition(new THREE.Vector3()); sources.push(o); }
      o.userData.allumee = o.visible && o.parent && o.parent.visible !== false; o.visible = false; });
    for (const o of scene.children.slice()) if (o.isSpotLight && !o.userData.apo && !o.intensity) o.visible = false; };
  L.setNuit = (n) => { if (setN) setN(true); L.nuit = true; teinter(); eteindre(); regrouper(); };
  if (!setN) { teinter(); eteindre(); regrouper(); }
  L.lampesApo = (t) => { if (base === "etage") return; const c = M && M.camera ? M.camera.position : null; if (!c) return;
    if (!L.lampesT || t > L.lampesT) { L.lampesT = t + 500; L.lampesProches = sources.filter(o => o.userData.allumee && o.userData.i0 > 0).sort((a, b) => a.userData.pos.distanceToSquared(c) - b.userData.pos.distanceToSquared(c)).slice(0, pool.length); }
    pool.forEach((l, i) => { const o = L.lampesProches[i]; if (!o) { l.intensity = 0; return; } l.position.copy(o.userData.pos); l.color.copy(o.color); l.distance = o.distance; l.decay = o.decay; l.intensity = o.intensity; }); };
  const A = atelier(scene);
  const charbon = A.mat({ color: 0x1e1b19, roughness: 1 }), rouille = A.mat({ color: 0x5a2e1a, roughness: 1 }), cendre = A.mat({ color: 0x3a3634, roughness: 1 }), vitreN = A.mat({ color: 0x050505, roughness: .3 });
  const obstacles = [];
  // un feu : des flammes qui dansent, une lueur orange qui vacille, de la fumée qui monte
  const feu = (x, y, z, k = 1) => { const g = new THREE.Group(); g.position.set(x, y, z); scene.add(g); L.feuxZ.push([x, z, k === 1 ? .75 : .72 * k]);
    // un brasier : plusieurs nappes de flammes pixelisées, côte à côte, chacune avec son temps de retard
    const fl = []; for (let i = 0; i < 3 + Math.round(k * 1.5); i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: texFlammes[0], transparent: true, alphaTest: .05, depthWrite: false, fog: false }));
      sp.center.set(.5, .05); sp.position.set((Math.random() - .5) * 1.1 * k, 0, (Math.random() - .5) * .8 * k); g.add(sp); fl.push([sp, Math.floor(Math.random() * 8), .8 + Math.random() * .6]); }
    const fu = []; for (let i = 0; i < 5; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: texFumee, transparent: true, depthWrite: false })); g.add(sp); fu.push([sp, i / 5]); }
    feux.push({ fl, fu, k, x, y: y + 1.2 * k, z }); return g; };
  // les lueurs des feux : quatre lumières seulement, prêtées aux feux les plus proches (moins de lumières = bien plus fluide)
  const lumsFeu = [0, 1, 2, 3].map(() => { const l = new THREE.PointLight(0xff6a24, 0, 12, 1.5); l.userData.apo = true; scene.add(l); return l; });
  // l'éclair du canon : une lumière toujours là, allumée le temps d'un tir (en ajouter une à chaque tir faisait tout recalculer)
  L.eclair = new THREE.PointLight(0xffc060, 0, 7, 1.5); L.eclair.userData.apo = true; scene.add(L.eclair);
  // une voiture calcinée, à l'arrêt, de travers (elle bloque le passage) ; souvent, elle brûle encore
  const epave = (x, z, a, brule = true) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = a; scene.add(g);
    const b = (w, h, d, m, px, py, pz) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(px, py, pz); o.castShadow = true; g.add(o); return o; };
    b(4.2, .75, 1.8, charbon, 0, .62, 0); b(2.2, .62, 1.62, rouille, -.2, 1.3, 0);
    b(.02, .5, 1.5, vitreN, .92, 1.3, 0); b(.02, .5, 1.5, vitreN, -1.32, 1.3, 0); b(2, .45, .02, vitreN, -.2, 1.32, .82); b(2, .45, .02, vitreN, -.2, 1.32, -.82);
    for (const [wx, wz] of [[1.35, .9], [-1.35, .9], [1.35, -.9], [-1.35, -.9]]) { const r = new THREE.Mesh(new THREE.CylinderGeometry(.34, .34, .22, 14), cendre); r.rotation.x = Math.PI / 2; r.position.set(wx, .3, wz); g.add(r); }
    b(.5, .25, .9, rouille, 1.6, 1.0, .1).rotation.z = -.5;   // le capot arraché
    if (brule) { feu(x + Math.cos(a) * .9, .6, z - Math.sin(a) * .9, 2); L.feuxSon.push([x, z]); }
    obstacles.push([x, z, 2.3]); };
  // un fût qui brûle
  const fut = (x, z) => { const o = new THREE.Mesh(new THREE.CylinderGeometry(.32, .3, .9, 14), rouille); o.position.set(x, .45, z); scene.add(o); feu(x, .85, z, 1); obstacles.push([x, z, .45]); };
  // un grand brasier (des meubles, des gravats qui brûlent), plus haut qu'un homme
  const brasier = (x, z, k = 2.6) => { feu(x, 0, z, k); L.feuxSon.push([x, z]); for (let i = 0; i < 5; i++) { const o = new THREE.Mesh(new THREE.BoxGeometry(1.2, .12, .2), charbon); o.position.set(x + (Math.random() - .5) * 1.4, .1 + i * .05, z + (Math.random() - .5) * 1.2); o.rotation.set(Math.random() * .4, Math.random() * 7, Math.random() * .4); scene.add(o); } obstacles.push([x, z, 1.1]); };
  // des débris (planches, gravats) et du sang séché, là où l'on marche
  const zone = L.zone || [-30, 30, -30, 30], libre = [];
  for (let i = 0; i < 4000 && libre.length < 160; i++) { const x = zone[0] + Math.random() * (zone[1] - zone[0]), z = zone[2] + Math.random() * (zone[3] - zone[2]); if (L.limites(x, z)) libre.push([x, z]); }
  const hauteurSol = (x, z) => base === "etage" ? 0 : (L.hauteur ? L.hauteur(x, z, {}) : 0);
  const repos = (x, z) => base === "fetes" && z > 17.6;   // le vestibule et le bar du sous-sol : la salle de repos, intacte
  L.repos = repos;
  for (let i = libre.length - 1; i >= 0; i--) if (repos(libre[i][0], libre[i][1])) libre.splice(i, 1);
  if (base === "etage") { libre.length = 0;   // les couloirs : sur chaque étage
    for (let n = 0; n <= ET.N; n++) for (let i = 0; i < 9; i++) { const x = (hasard(n * 17 + i) - .5) * 21, z = -1.15 - hasard(n * 5 + i * 3) * 1.5; libre.push([x, z, n * ET.H]); } }
  const hauteurSol0 = hauteurSol;
  libre.slice(0, base === "etage" ? 70 : 40).forEach(([x, z], i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.2 + Math.random() * 1.4, 1.2 + Math.random() * 1.4), new THREE.MeshBasicMaterial({ map: texSang[i % 4], transparent: true, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.rotation.z = Math.random() * 7; m.position.set(x, (libre[i][2] ?? hauteurSol0(x, z)) + .02 + i * .0004, z); m.renderOrder = 1; scene.add(m); });
  (base === "etage" ? libre.filter((q, i) => i % 2) : libre.slice(60, 120)).forEach(([x, z, y0]) => { const planche = Math.random() < .5;
    const o = new THREE.Mesh(planche ? new THREE.BoxGeometry(1 + Math.random(), .05, .18) : new THREE.DodecahedronGeometry(.12 + Math.random() * .16), planche ? rouille : cendre);
    o.position.set(x, (y0 ?? hauteurSol(x, z)) + .06, z); o.rotation.set(planche ? 0 : Math.random() * 3, Math.random() * 7, planche ? (Math.random() - .5) * .3 : Math.random() * 3); scene.add(o); });
  // le décor de chaque lieu
  if (base === "rue") { epave(-26, -1.2, .25); epave(-9, .8, -.5); epave(9, -.6, .35, false); epave(24, 1.2, -.2); epave(40, -1.5, .6); fut(-16, 4.2); fut(16, -5.2); fut(32, 4.6); fut(-36, 4.4); brasier(-20, 5.3); brasier(30, -5.6); }
  if (base === "grande") { epave(-4.5, 3, .7); epave(5.5, -9, -.4); fut(-8.5, -4); fut(8.6, 4); fut(0, -14); fut(-5, -24); fut(6, -40); fut(-8, 10); fut(3, 11); brasier(-1.5, -6); brasier(9.2, -2.5, 2.2); brasier(-9.3, 4, 2.2); }
  if (base === "fetes") { fut(3.2, 1.5); brasier(4.4, 9, 2); for (let i = 0; i < 6; i++) { const t = new THREE.Mesh(new THREE.BoxGeometry(1.6, .06, .8), rouille); t.position.set(-3 + Math.random() * 6, .05, 2 + Math.random() * 10); t.rotation.y = Math.random() * 3; scene.add(t); } }
  if (lumieres) { const bois = [0xa8845a, 0x93704a, 0xb8946a].map(c => A.mat({ color: c, roughness: 1, emissive: 0x3a2412, emissiveIntensity: .9 })), clou = A.mat({ color: 0x222222 }), noir = new THREE.MeshBasicMaterial({ color: 0x050403 });
    const fen = (L.fenetres || []).map(([x, y, z, w, h, ry]) => ({ x, y, z, w, h, ry }));
    scene.traverse(o => { if (o.isMesh && lumieres.includes(o.material) && o.geometry.parameters && o.geometry.parameters.width) fen.push({ o, w: o.geometry.parameters.width, h: o.geometry.parameters.height }); });
    scene.updateMatrixWorld(true);
    let k = 0; for (const F of fen) { if (hasard(++k * 3.7) > (F.o ? .3 : .35)) continue;
      const g = new THREE.Group(); scene.add(g); const w = F.w, h = F.h;
      if (F.o) F.o.matrixWorld.decompose(g.position, g.quaternion, g.scale); else { g.position.set(F.x, F.y, F.z); g.rotation.y = F.ry; }
      const fond = new THREE.Mesh(new THREE.PlaneGeometry(w, h), noir); fond.position.z = .01; g.add(fond);
      const n = Math.max(3, Math.round(h / .32));
      for (let i = 0; i < n; i++) { const pl = new THREE.Mesh(new THREE.BoxGeometry(w * 1.25, Math.min(.22, h / n * .75), .05), bois[i % 3]);
        pl.position.set((hasard(k + i) - .5) * .08, -h / 2 + (i + .5) * h / n, .05); pl.rotation.z = (hasard(k * 2 + i) - .5) * .35; g.add(pl);
        for (const sx of [-1, 1]) { const c2 = new THREE.Mesh(new THREE.BoxGeometry(.03, .03, .02), clou); c2.position.set(sx * w * .52, pl.position.y, .08); g.add(c2); } }
      if (hasard(k * 9.1) < .5) { const cr = new THREE.Mesh(new THREE.BoxGeometry(Math.hypot(w, h), .16, .05), bois[k % 3]); cr.position.z = .09; cr.rotation.z = Math.atan2(h, w) * (k % 2 ? 1 : -1); g.add(cr); } } }   // fenêtres barricadées, parfois une planche en diagonale
  // dehors : de temps en temps, un hélicoptère passe très haut, son projecteur balaie le sol à la recherche de survivants
  if (ext) {
    const Zh = L.zone || [-30, 30, -30, 30], cx = (Zh[0] + Zh[1]) / 2, cz = (Zh[2] + Zh[3]) / 2, R = Math.max(Zh[1] - Zh[0], Zh[3] - Zh[2]) * .5;
    const spot = new THREE.SpotLight(0xe8f0ff, 0, 90, .16, .35, .4); spot.userData.apo = true; scene.add(spot, spot.target);
    const geoC = new THREE.ConeGeometry(1, 1, 24, 1, true); geoC.translate(0, -.5, 0);
    const cone = new THREE.Mesh(geoC, new THREE.MeshBasicMaterial({ color: 0xdfe8ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false })); cone.userData.helico = true; scene.add(cone);
    const tache = new THREE.Mesh(new THREE.CircleGeometry(2.6, 32), new THREE.MeshBasicMaterial({ color: 0xeef3ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); tache.rotation.x = -Math.PI / 2; scene.add(tache);
    const feuxH = [0xff2020, 0xffffff].map(c => { const m = new THREE.Mesh(new THREE.SphereGeometry(.18, 8, 6), new THREE.MeshBasicMaterial({ color: c, fog: false })); scene.add(m); return m; });
    let debut = performance.now() + 6000 + Math.random() * 8000, a0 = 0;
    const animH = L.anim;
    L.anim = (t) => { animH && animH(t); const now = performance.now(), D = 20500, u = (now - debut) / D;   // (la durée du bruit des pales)
      if (u > 1) { debut = now + 25000 + Math.random() * 30000; a0 = Math.random() * 7; }
      const actif = u >= 0 && u <= 1, f = actif ? Math.sin(u * Math.PI) : 0;
      // l'hélico passe en ligne droite, haut dans le ciel ; le projecteur balaie autour de sa trajectoire
      const hx = cx + Math.cos(a0) * R * 1.4 * (u * 2 - 1), hz = cz + Math.sin(a0) * R * 1.4 * (u * 2 - 1), hy = 34;
      const sx = hx + Math.sin(now / 1300) * 6 - Math.cos(a0) * 4, sz = hz + Math.cos(now / 1700) * 6 - Math.sin(a0) * 4;
      spot.position.set(hx, hy, hz); spot.target.position.set(sx, 0, sz); spot.intensity = 2600 * f;   // (toujours « visible » : l'allumer ou l'éteindre ferait tout recalculer)
      const dir = new THREE.Vector3(sx - hx, -hy, sz - hz), lg = dir.length(); cone.position.set(hx, hy, hz); cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize().negate());
      cone.scale.set(lg * .16, lg, lg * .16); cone.material.opacity = .09 * f; cone.visible = actif;
      tache.position.set(sx, .06, sz); tache.material.opacity = .32 * f; tache.visible = actif;
      feuxH.forEach((m, i) => { m.visible = actif; m.position.set(hx + (i ? .6 : -.6), hy + .3, hz); m.material.color.setHex(i ? 0xffffff : (Math.floor(now / 500) % 2 ? 0xff2020 : 0x300000)); });
      if (actif && !L.helicoSon) { L.helicoSon = true; M && M.ctx && M.ctx.surInfo && M.ctx.surInfo("🚁 Un hélicoptère passe… il cherche des survivants."); try { const a = new Audio("sons/apo-helico.mp3"); a.volume = 0; sonsCourts.add(a); a.onended = () => sonsCourts.delete(a); a.play().catch(() => {}); L.helicoA = a; } catch (e) {} }
      if (!actif) { L.helicoSon = false; if (L.helicoA) { try { L.helicoA.pause(); } catch (e) {} sonsCourts.delete(L.helicoA); L.helicoA = null; } }
      // le bruit suit l'hélico : faible au loin, fort quand il passe au-dessus de nous, puis il s'éloigne
      else if (L.helicoA && M && M.gens) { const moi = M.gens.get(M.moiNum), p = moi ? moi.g.position : { x: cx, z: cz };
        const d = Math.hypot(hx - p.x, hz - p.z), proche = 1 / (1 + (d / 16) ** 2), entree = Math.min(1, u * 8, (1 - u) * 8);
        L.helicoA.volume = Math.max(0, Math.min(1, (.18 + .82 * proche) * entree)); } };
  }
  // on ne traverse pas les épaves ni les fûts
  if (obstacles.length) { const lim = L.limites; L.limites = (x, z) => lim(x, z) && !obstacles.some(([ox, oz, r]) => (x - ox) * (x - ox) + (z - oz) * (z - oz) < r * r); }
  // tout bouge : les flammes dansent, la fumée monte, les lumières vacillent ou grésillent
  const animAvant = L.anim;
  L.anim = (t) => { animAvant && animAvant(t);
    for (const f of feux) { for (const [sp, ph, h] of f.fl) { sp.material.map = texFlammes[(Math.floor(t / 75) + ph) % 8]; const v = .9 + .1 * Math.sin(t / 130 + ph); sp.scale.set(1.25 * f.k * v, 2 * f.k * h * v, 1); }
      for (const [sp, d] of f.fu) { const u = ((t / 3200) + d) % 1; sp.position.set(Math.sin(u * 6 + d * 9) * .3 * f.k, .8 * f.k + u * 4.5 * f.k, 0); sp.scale.setScalar((.8 + u * 2.4) * f.k); sp.material.opacity = .55 * (1 - u); }
    }
    if (!L.lumsT || t > L.lumsT) { L.lumsT = t + 400; const c = M && M.camera ? M.camera.position : { x: 0, z: 0 };
      L.feuxProches = feux.slice().sort((a, b) => Math.hypot(a.x - c.x, a.z - c.z) - Math.hypot(b.x - c.x, b.z - c.z)).slice(0, lumsFeu.length); }
    lumsFeu.forEach((l, i) => { const f = L.feuxProches[i]; if (!f) { l.intensity = 0; return; }
      l.position.set(f.x, f.y, f.z); l.distance = 12 * f.k; l.intensity = 9 * f.k * (.75 + .25 * Math.sin(t / 80 + i) * Math.sin(t / 53)); });
    for (const l of clignos) l.intensity = (l.userData.i0 || 1) * .5 * (Math.sin(t / 37 + l.id) > .6 || Math.random() < .04 ? .05 : 1);
    L.lampesApo(t); };
}
/* ===================== la partie de zombies (caserne de l'apocalypse) =====================
   L'un des joueurs présents (le « chef », désigné par le serveur) fait vivre les zombies et les chiens et envoie leur état aux autres
   cinq fois par seconde ; chacun tire de son côté (touche un zombie), le chef compte les balles reçues : deux balles, il tombe.
   Trois morsures : on devient zombie, et quinze secondes plus tard on est ramené dans la vraie caserne, devant la déchetterie. */
const APO = { balles: 9, vies: 4, zombieFin: 0 };   // (9 balles dans le chargeur, 4 vies)
const ZTYPES = [
  // les trois zombies : des bonshommes (une tête découpée, un corps dessiné), réglables par l'administrateur comme les autres personnages
  { tete: "images/apo/zombie1-tete.png", id: 12, son: "sons/zombie1.mp3", v: .8, def: { tenue: "zombie", couleur: "#3b3f52", bas: "#3d3326", pieds: "#2a2522" } },
  { tete: "images/apo/zombie2-tete.png", id: 13, son: "sons/zombie2.mp3", v: .9, def: { tenue: "zombie", couleur: "#d9cfbd", bas: "#8ea6be", pieds: "#5a5650" } },
  { tete: "images/apo/zombie3-tete.png", id: 14, son: "sons/zombie3.mp3", v: .85, def: { tenue: "zombie", couleur: "#a9bfdc", bas: "#3e3a33", pieds: "#1e1e1e" } },
  { boss: true, tete: "images/apo/nemesis-tete.png", id: 17, son: "sons/zombie3.mp3", v: 1.75, hp: 5, taille: 1.45, def: { tenue: "nemesis", couleur: "#1a1a1c", bas: null, pieds: "#111111" } },
  { img: "images/apo/chien.png", id: 15, son: "sons/apo-chien.mp3", ratio: 408 / 500, h: .44, v: 3.1, chien: true } ];
const ZNOMBRE = { grande: [5, 2], rue: [4, 1], fetes: [3, 0], etage: [7, 0] };   // [zombies, chiens]
let zTex = null, texEclair = null, actx = null;
const texZ = i => (zTex = zTex || ZTYPES.map(t => { if (!t.img) return null; const x = new THREE.TextureLoader().load(t.img); x.colorSpace = THREE.SRGBColorSpace; return x; }))[i];
// l'image du chien : celle d'origine, ou celle que l'administrateur a choisie (rechargée quand il la change)
let texChienCle = null, texChienT = null;
function texChien() { const P = (M.ctx.pnjTrio && M.ctx.pnjTrio(15)) || {}, cle = P.tete_v || 0;
  if (cle !== texChienCle || !texChienT) { texChienCle = cle;
    texChienT = new THREE.TextureLoader().load(cle ? M.ctx.urlTetePNJ(cle, 15) : ZTYPES[4].img, () => { for (const z of M.zomb ? M.zomb.values() : []) if (z.chien) tailleZ(z); });
    texChienT.colorSpace = THREE.SRGBColorSpace; }
  return texChienT; }
// les poses d'un zombie : debout, puis les bras en avant, griffes d'un côté puis de l'autre (sa démarche)
function posesZ(ty) {
  M.zTexB = M.zTexB || {}; if (M.zTexB[ty]) return M.zTexB[ty];
  const T = ZTYPES[ty], P = (M.ctx.pnjTrio && M.ctx.pnjTrio(T.id)) || {};
  const info = { tenue: P.tenue || T.def.tenue, couleur: P.couleur || T.def.couleur, bas: P.bas || T.def.bas, pieds: P.pieds || T.def.pieds, reglage: P.reglage || null, initiales: "" };
  const url = P.tete_v ? M.ctx.urlTetePNJ(P.tete_v, T.id) : T.tete;
  return (M.zTexB[ty] = chargerTete(0, 0, url).then(tete => { const f = pose => tex(dessinerBonhomme({ ...info, large: true, pose }, tete));
    return { repos: f(undefined), a: f("thriller1"), b: f("thriller2"), c: f("thriller3"), poing: f("tir") }; }));
}
const regZ = i => ((M.ctx.pnjTrio && M.ctx.pnjTrio(ZTYPES[i].id)) || {}).reglage || {};
const sonsCourts = new Set();
function sonPos(src, vol) { try { const a = new Audio(src); a.volume = Math.max(0, Math.min(1, vol)); sonsCourts.add(a); a.onended = () => sonsCourts.delete(a); a.play().catch(() => {}); } catch (e) {} }
function couperSonsApo() {
  for (const a of [sonApo, sonFeu, sonRepos, ...sonsCourts]) if (a) { try { a.pause(); a.currentTime = 0; a.volume = 0; } catch (e) {} }
  sonsCourts.clear(); sonApo = sonFeu = sonRepos = null;   // (recréés à la prochaine visite)
}
function sonBruit(duree, coupure, vol) {   // le coup de feu (et le « clic » à vide), fabriqué à la volée
  try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); const n = Math.floor(actx.sampleRate * duree), b = actx.createBuffer(1, n, actx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 4);
    const src = actx.createBufferSource(); src.buffer = b; const f = actx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = coupure; const g = actx.createGain(); g.gain.value = vol;
    src.connect(f).connect(g).connect(actx.destination); src.start(); } catch (e) {} }
const sonTir = (v = 1) => sonBruit(.28, 1600, .95 * v), sonVide = () => sonBruit(.04, 6000, .4);
const moiApo = () => M && M.moiNum && M.gens.get(M.moiNum);
const etageDe = p => p && p.etg ? p.etg.n : 0;
// où les zombies peuvent marcher : le lieu, sans la salle de repos ; dans les bâtiments, le couloir de leur étage
function limZ() {
  if (M.limZ && M.limZ.L === M.L) return M.limZ;
  const L = M.L, base = baseLieu(M.lieu);
  const f = base === "etage" ? (x, z) => Math.abs(x) < ET.CX0 + .5 && z > -2.75 && z < -1.05 : (x, z) => L.limites(x, z) && !(L.repos && L.repos(x, z)) && !(L.feuxZ || []).some(([fx, fz, r]) => (x - fx) ** 2 + (z - fz) ** 2 < (r + .3) ** 2);   // (ni dans le feu)
  return (M.limZ = { L, limites: f, zone: base === "etage" ? [-ET.CX0 - 1, ET.CX0 + 1, -3, -.5] : L.zone });
}
const yZ = z => baseLieu(M.lieu) === "etage" ? z.n * ET.H : (M.L.hauteur ? M.L.hauteur(z.x, z.z, {}) : 0);
function creerZ(d) {
  const T = ZTYPES[d.ty], g = new THREE.Group(), geo = new THREE.PlaneGeometry(1, 1); geo.translate(0, .5, 0);
  const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: T.chien ? texChien() : null, transparent: true, alphaTest: .35, side: THREE.DoubleSide })); mesh.rotation.order = "YXZ"; mesh.renderOrder = 2; g.add(mesh);
  if (!T.chien) { mesh.visible = false; posesZ(d.ty).then(P => { if (!M || !M.zomb || M.zomb.get(d.id)?.mesh !== mesh) return; mesh.userData.poses = P; mesh.material.map = P.c; mesh.material.needsUpdate = true; mesh.visible = true; }); }
  const om = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: tex(textures().ombre), transparent: true, depthWrite: false })); om.rotation.x = -Math.PI / 2; om.position.y = .02; g.add(om);
  M.scene.add(g);
  const z = { id: d.id, ty: d.ty, x: d.x, z: d.z, n: d.n || 0, tx: d.x, tz: d.z, hp: d.hp ?? (T.hp || 2), mortT: 0, boss: !!T.boss, g, mesh, om, chien: !!T.chien, sonT: performance.now() + 2000 + Math.random() * 6000, ph: Math.random() * 9 };
  tailleZ(z); M.zomb.set(z.id, z);
  if (T.boss) { M.ctx.surInfo && M.ctx.surInfo("☠️ NEMESIS arrive…"); sonPos(T.son, 1); }
  return z;
}
function tailleZ(z) { const T = ZTYPES[z.ty], R = regZ(z.ty);
  if (T.chien) { const im = z.mesh.material.map && z.mesh.material.map.image; z.H = tailleBonhomme() * T.h * (R.h || 1); z.W = z.H * (im && im.width ? im.width / im.height : T.ratio) * (R.l || 1); z.om.scale.set(z.W * 1.1, z.W * .45, 1); }
  else { z.H = tailleBonhomme() * (R.h || 1) * (T.taille || 1); z.W = z.H * .476 * 1.6; z.om.scale.set(z.H * .5, z.H * .5, 1); } }   // (comme un bonhomme : la corpulence est dans le dessin)
function retirerZ(z) { M.scene.remove(z.g); z.mesh.geometry.dispose(); z.mesh.material.dispose(); z.om.geometry.dispose(); M.zomb.delete(z.id); }
// une tache de sang au sol, là où le zombie a été touché
function sangAuSol(x, z, y, k = 1) { M.sangs = M.sangs || [];
  const m = new THREE.Mesh(new THREE.PlaneGeometry(.8 * k, .8 * k), new THREE.MeshBasicMaterial({ map: texSang[Math.floor(Math.random() * 4)], transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.rotation.z = Math.random() * 7; m.position.set(x + (Math.random() - .5) * .4, y + .025 + M.sangs.length * .0003, z + (Math.random() - .5) * .4); m.renderOrder = 1; M.scene.add(m); M.sangs.push(m);
  if (M.sangs.length > 40) { const o = M.sangs.shift(); M.scene.remove(o); o.geometry.dispose(); o.material.dispose(); } }
// le zombie touché : il recule un peu, rougit, saigne
function impactZ(z, dx, dz) { z.flashT = performance.now() + 160; z.recul = [dx, dz, performance.now()]; sangAuSol(z.x, z.z, yZ(z), z.chien ? .8 : 1); }
function blesserZ(z, dx, dz) {   // (le chef) la balle compte
  if (z.mortT) return; z.hp--;
  const nx = z.x + dx * .4, nz = z.z + dz * .4; if (limZ().limites(nx, nz)) { z.x = nx; z.z = nz; }
  z.bloque = performance.now() + 350;
  if (z.hp <= 0) { z.hp = 0; z.mortT = performance.now(); sangAuSol(z.x, z.z, yZ(z), z.boss ? 2.4 : 1.6);
    if (z.boss) M.zKills = 0;
    else { M.zKills = (M.zKills || 0) + 1; if (M.zKills >= 6 && ![...M.zomb.values()].some(q => q.boss && !q.mortT)) { M.zKills = 0; apparaitreZ(3); } } }   // (six zombies ou chiens abattus : Nemesis)
}
function tirer(z) {
  const moi = moiApo(); if (!moi || APO.zombieFin || z.mortT) return;
  if (APO.balles <= 0) { sonVide(); M.ctx.surInfo && M.ctx.surInfo("🔫 Plus de munitions ! Trouve une boîte de balles."); return; }
  const dx0 = z.x - moi.g.position.x, dz0 = z.z - moi.g.position.z, d = Math.hypot(dx0, dz0) || 1;
  if (d > 24) { M.ctx.surInfo && M.ctx.surInfo("Trop loin… approche-toi."); return; }
  const dx = dx0 / d, dz = dz0 / d;
  APO.balles--; majHudApo();
  moi.cible = null; moi.chemin = []; moi.tirT = performance.now();
  if (M.L.interieur || M.L.suivi) M.yaw = Math.atan2(-dx, -dz);
  eclairDuCanon(moi, dx, dz); sonTir();
  impactZ(z, dx, dz); envoyerWS({ t: "z_tir", id: z.id, dx, dz });
  if (estChefZ()) blesserZ(z, dx, dz);
}
function eclairDuCanon(p, dx, dz) {
  texEclair = texEclair || tex(toile(64, 64, x => { const g = x.createRadialGradient(32, 32, 2, 32, 32, 30); g.addColorStop(0, "rgba(255,255,220,1)"); g.addColorStop(.4, "rgba(255,200,60,.9)"); g.addColorStop(1, "rgba(255,120,0,0)"); x.fillStyle = g; x.fillRect(0, 0, 64, 64); }));
  const H = tailleBonhomme() * hauteurDe(p), sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: texEclair, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  sp.scale.set(.7, .7, 1); sp.position.set(p.g.position.x + dx * .55, p.g.position.y + H * .6, p.g.position.z + dz * .55); M.scene.add(sp);
  const l = M.L && M.L.eclair; if (l) { l.position.copy(sp.position); l.intensity = 8; }
  setTimeout(() => { if (l) l.intensity = 0; if (!M || !M.scene) return; M.scene.remove(sp); sp.material.dispose(); }, 70);
}
// une morsure (ou un coup de griffe) : on recule, l'écran rougit ; à la troisième, on devient zombie
function subirMorsure(zx, zz, deg = 1) {
  const moi = moiApo(); if (!moi || APO.zombieFin) return;
  APO.vies -= deg; M.ctx.surApoFlash && M.ctx.surApoFlash();
  const dx = moi.g.position.x - zx, dz = moi.g.position.z - zz, d = Math.hypot(dx, dz) || 1;
  for (let k = .8 * deg; k > .1; k -= .2) { const nx = moi.g.position.x + dx / d * k, nz = moi.g.position.z + dz / d * k; if (M.L.limites(nx, nz)) { moi.g.position.x = nx; moi.g.position.z = nz; break; } }
  moi.cible = null; moi.chemin = []; envoyerWS({ t: "aller", x: moi.g.position.x, z: moi.g.position.z });
  // la troisième : on tombe au sol, une flaque de sang s'étend, « YOU DIED » apparaît doucement ; quinze secondes plus tard, retour à la caserne
  if (APO.vies <= 0) { APO.vies = 0; APO.zombieFin = performance.now() + 15000; moi.info.mortT = performance.now(); moi.info.danse = false;
    flaqueMort(moi); envoyerWS({ t: "z_zombi", on: true }); M.ctx.surApoMort && M.ctx.surApoMort(true); }
  majHudApo();
}
const estChefZ = () => M.chefZ === M.moiNum || (M.chefZ == null && ![...M.gens.values()].some(p => !p.moi && p.info.numero > 0));
// la flaque de sang qui s'étend sous un joueur tombé
function flaqueMort(p) { const x = p.g.position.x, z = p.g.position.z, y = p.g.position.y;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.2), new THREE.MeshBasicMaterial({ map: texSang[1], transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.set(x, y + .03, z); m.scale.setScalar(.05); m.renderOrder = 1; M.scene.add(m); (M.flaques = M.flaques || []).push([m, performance.now()]); }
/* --- les héros de Resident Evil (réglés par l'administrateur) : on peut jouer l'un d'eux, ou en emmener deux comme équipiers --- */
export const HEROS = { 21: { nom: "Rebecca Chambers", tenue: "rebecca", couleur: "#55534f", bas: "#3d3f37", pieds: "#141414", cle: "rebecca", court: "Rebecca" }, 22: { nom: "Leon S. Kennedy", tenue: "leon", couleur: "#2e3b57", bas: "#2b3650", pieds: "#111111", cle: "leon", court: "Leon" },
  23: { nom: "Barry Burton", tenue: "barry", couleur: "#9a9c8c", bas: "#66665f", pieds: "#5a3a22", cle: "barry", court: "Barry" }, 24: { nom: "Jill Valentine", tenue: "jill", couleur: "#4f7fa6", bas: null, pieds: "#151515", cle: "jill", court: "Jill" },
  25: { nom: "Albert Wesker", tenue: "wesker", couleur: "#2a3650", bas: "#141518", pieds: "#0f0f0f", cle: "wesker", court: "Wesker" }, 26: { nom: "Chris Redfield", tenue: "chris", couleur: "#c4c4ba", bas: "#56544a", pieds: "#161616", cle: "chris", court: "Chris" } };
function habillerHeros(info, id) { const D = HEROS[id], P = (M.ctx.pnjTrio && M.ctx.pnjTrio(id)) || {};
  return { ...info, tenue: P.tenue || D.tenue, couleur: P.couleur || D.couleur, bas: P.tenue ? P.bas : D.bas, pieds: P.pieds || D.pieds, reglage: P.reglage || null, tete_v: null,
    teteUrl: P.tete_v ? M.ctx.urlTetePNJ(P.tete_v, id) : `images/re/${D.cle}-tete.png`, heros: id }; }
// (à l'entrée de l'apocalypse) qui l'on joue, et les équipiers qu'on emmène
export function choisirApo(perso, equipe) {
  if (!M) return; M.perso = HEROS[perso] ? +perso : null; envoyerWS({ t: "perso", id: M.perso });
  M.equipe = (equipe || []).filter(id => HEROS[id] && +id !== M.perso).slice(0, 2).map(id => ({ id: +id, vies: 4, mort: false, tirT: 0, suiviT: 0 }));
}
const EQUIPIER = k => -(300 + k), FANTOME = (de, k) => -(5000 + de * 4 + k);
function infoEquipier(id, numero, x, z, proprio, k) { const D = HEROS[id], P = (M.ctx.pnjTrio && M.ctx.pnjTrio(id)) || {};
  return { ...habillerHeros({ numero, nom: P.nom || D.nom, initiales: "" }, id), pnj: true, arme: true, equipier: true, proprio, slot: k, x, z }; }
function placeAPortee(moi, k) { const mp = moi.g.position, a = (M.yaw || 0) + (k ? .9 : -.9);
  for (let r = 1.1; r < 3; r += .3) { const x = mp.x + Math.sin(a) * r, z = mp.z + Math.cos(a) * r; if (M.L.limites(x, z) && !(M.L.feuxZ || []).some(([fx, fz, rr]) => Math.hypot(x - fx, z - fz) < rr)) return [x, z]; }
  return [mp.x, mp.z]; }
// les équipiers : ils nous suivent, tirent tout seuls sur le zombie le plus proche, et peuvent tomber eux aussi
function animerEquipe(now) {
  const moi = moiApo(); if (!moi || !M.equipe || !M.equipe.length) return;
  const etage = baseLieu(M.lieu) === "etage", mp = moi.g.position;
  M.equipe.forEach((e, k) => { const num = EQUIPIER(k); let p = M.gens.get(num);
    if (!p) { if (e.mort) return; const [x, z] = placeAPortee(moi, k); p = ajouterAncien(infoEquipier(e.id, num, x, z, M.moiNum, k)); if (!p) return; if (etage) p.etg = { ...(moi.etg || { n: 0, m: 0, zone: "P" }) }; }
    if (e.mort || APO.zombieFin) return;
    const d = Math.hypot(p.g.position.x - mp.x, p.g.position.z - mp.z);
    // perdu (un autre étage, trop loin) : il nous rejoint aussitôt
    if ((etage && (etageDe(p) !== etageDe(moi) || (p.etg && moi.etg && p.etg.zone !== "P" && moi.etg.zone === "P" && d > 3))) || d > 13) { const [x, z] = placeAPortee(moi, k); p.g.position.x = x; p.g.position.z = z; if (etage) p.etg = { ...(moi.etg || { n: 0, m: 0, zone: "P" }) }; p.cible = null; p.chemin = []; }
    else if (d > 2.4 && now > e.suiviT) { e.suiviT = now + 550; const [x, z] = placeAPortee(moi, k); viser(p, x, z); p.rapide = d > 5; }
    else if (d < 1.5 && p.cible) { p.cible = null; p.chemin = []; }
    // il tire sur le zombie le plus proche (à moins de 10 m, au même étage), environ une balle par seconde
    if (now > e.tirT && !(M.L.repos && M.L.repos(p.g.position.x, p.g.position.z))) { let best = null, bd = 10;
      for (const z of M.zomb.values()) { if (z.mortT || (etage && z.n !== etageDe(p))) continue; const dz = Math.hypot(z.x - p.g.position.x, z.z - p.g.position.z); if (dz < bd) { bd = dz; best = z; } }
      if (best) { e.tirT = now + 850 + Math.random() * 600; const dx = (best.x - p.g.position.x) / (bd || 1), dz = (best.z - p.g.position.z) / (bd || 1);
        p.tirT = now; if (p.cible && d < 4) { p.cible = null; p.chemin = []; } eclairDuCanon(p, dx, dz); sonTir(.7); impactZ(best, dx, dz);
        envoyerWS({ t: "z_tir", id: best.id, dx, dz, eq: k }); if (estChefZ()) blesserZ(best, dx, dz); } } });
  // ce que font nos équipiers, pour les autres joueurs (cinq fois par seconde)
  if (now > (M.eqEnvoiT || 0) && [...M.gens.values()].some(q => !q.moi && q.info.numero > 0)) { M.eqEnvoiT = now + 200;
    envoyerWS({ t: "z_equipe", l: M.equipe.map((e, k) => { const q = M.gens.get(EQUIPIER(k)); return [k, e.id, q ? +q.g.position.x.toFixed(2) : 0, q ? +q.g.position.z.toFixed(2) : 0, e.mort ? 1 : 0, q && q.tirT && now - q.tirT < 300 ? 1 : 0, q ? etageDe(q) : 0]; }) }); }
}
// un équipier mordu (ou frappé par Nemesis) : il recule, rougit ; à zéro, il tombe
function blesserEquipier(k, deg, zx, zz) {
  const e = M.equipe && M.equipe[k], p = M.gens.get(EQUIPIER(k)); if (!e || e.mort || !p) return;
  e.vies -= deg; p.flashT = performance.now() + 200;
  const dx = p.g.position.x - zx, dz = p.g.position.z - zz, d = Math.hypot(dx, dz) || 1; const nx = p.g.position.x + dx / d * .6, nz = p.g.position.z + dz / d * .6; if (M.L.limites(nx, nz)) { p.g.position.x = nx; p.g.position.z = nz; }
  if (e.vies <= 0) { e.vies = 0; e.mort = true; p.info.mortT = performance.now(); p.cible = null; p.chemin = []; flaqueMort(p); M.ctx.surInfo && M.ctx.surInfo(`💀 ${p.info.nom} est tombé…`); }
  majHudApo();
}
// les équipiers des autres joueurs (on les voit bouger, tirer, tomber)
function recevoirEquipe(de, l) {
  if (!M.L || !M.L.apo) return; M.fantomesT = M.fantomesT || {}; M.fantomesT[de] = performance.now();
  for (const [k, id, x, z, mort, tir, n] of l) { const num = FANTOME(de, k); let p = M.gens.get(num);
    if (!p) { if (mort) continue; p = ajouterAncien(infoEquipier(id, num, x, z, de, k)); if (!p) continue; if (baseLieu(M.lieu) === "etage") p.etg = { n, m: n, zone: "P" }; }
    if (mort) { if (!p.info.mortT) { p.info.mortT = performance.now(); p.cible = null; flaqueMort(p); } continue; }
    if (p.etg && p.etg.n !== n) { p.etg = { n, m: n, zone: "P" }; p.g.position.x = x; p.g.position.z = z; }
    else if (Math.hypot(p.g.position.x - x, p.g.position.z - z) > .25) { p.cible = new THREE.Vector3(x, 0, z); p.chemin = []; }
    if (tir) p.tirT = performance.now(); }
}
// les joueurs que les zombies peuvent poursuivre (pas ceux de la salle de repos, ni ceux devenus zombies)
function proies() {
  const out = [];
  for (const p of M.gens.values()) { if (p.info.numero <= 0 && !p.info.equipier) continue;
    if (p.moi ? APO.zombieFin : p.info.mortT) continue;
    const x = p.g.position.x, z = p.g.position.z; if (M.L.repos && M.L.repos(x, z)) continue;
    if (baseLieu(M.lieu) === "etage" && !(p.etg && p.etg.zone === "P")) continue;
    out.push({ p, x, z, n: etageDe(p) }); }
  return out;
}
function pointLibreZ(seed, loin) {
  const Lz = limZ(), [a, b, c, d] = Lz.zone, ps = proies(), etage = baseLieu(M.lieu) === "etage";
  for (let k = 0; k < 400; k++) { const x = a + Math.random() * (b - a), z = c + Math.random() * (d - c), n = etage ? Math.floor(Math.random() * (ET.N + 1)) : 0;
    if (!Lz.limites(x, z)) continue;
    // loin des joueurs, et éparpillés : pas à moins de 5 m d'un autre zombie
    if (k < 300 && M.zomb && [...M.zomb.values()].some(o => o.n === n && Math.hypot(o.x - x, o.z - z) < 5)) continue;
    if (ps.every(q => (etage && q.n !== n) || Math.hypot(q.x - x, q.z - z) > (k < 300 ? loin : 6))) return [x, z, n]; }
  return null;
}
function apparaitreZ(chien) {   // (true : un chien ; false : un zombie ; un nombre : ce type-là)
  const pt = pointLibreZ(0, 16); if (!pt) return;
  M.zSeq = (M.zSeq || 0) + 1;
  creerZ({ id: Math.floor(Math.random() * 1e9), ty: typeof chien === "number" ? chien : chien ? 4 : Math.floor(Math.random() * 3), x: pt[0], z: pt[1], n: pt[2] });
}
// (le chef) chaque zombie poursuit le joueur le plus proche ; sinon il erre
function simulerZ(t, dt) {
  const base = baseLieu(M.lieu), [nz, nc] = ZNOMBRE[base] || [0, 0], Lz = limZ();
  const vivants = [...M.zomb.values()];
  if (!M.zInit) { M.zInit = true; for (let i = 0; i < nz; i++) apparaitreZ(false); for (let i = 0; i < nc; i++) apparaitreZ(true); }
  for (const z of vivants) if (z.mortT && t - z.mortT > 8000) retirerZ(z);
  if (t > (M.zSpawnT || 0)) { M.zSpawnT = t + 12000; const zs = [...M.zomb.values()];
    if (zs.filter(z => !z.chien && !z.boss).length < nz) apparaitreZ(false); else if (zs.filter(z => z.chien).length < nc) apparaitreZ(true); }
  const ps = proies();
  for (const z of M.zomb.values()) { if (z.mortT) continue;
    let cible = null, bd = z.boss ? 30 : z.chien ? 15 : 11;   // (ils ne repèrent les joueurs que d'assez près)
    for (const q of ps) { if (base === "etage" && q.n !== z.n) continue; const d = Math.hypot(q.x - z.x, q.z - z.z); if (d < bd) { bd = d; cible = q; } }
    if (cible) {
      if (bd < (z.boss ? 1.25 : z.chien ? .95 : .85)) { z.chemin = []; if (t > (z.mordT || 0)) { z.mordT = t + (z.chien ? 1300 : z.boss ? 1500 : 1700); z.coupT = performance.now();
          const deg = z.boss ? 2 : 1;   // (le poing de Nemesis : deux vies)
          if (cible.p.info.equipier) { if (cible.p.info.proprio === M.moiNum) blesserEquipier(cible.p.info.slot, deg, z.x, z.z); else envoyerWS({ t: "z_mord", numero: cible.p.info.proprio, eq: cible.p.info.slot, x: z.x, z: z.z, d: deg }); }
          else if (cible.p.moi) subirMorsure(z.x, z.z, deg); else envoyerWS({ t: "z_mord", numero: cible.p.info.numero, x: z.x, z: z.z, d: deg }); } }
      else if (!z.chemin || !z.chemin.length || t > (z.recalc || 0)) { z.chemin = itineraire(Lz, z.x, z.z, cible.x, cible.z); z.recalc = t + 900 + Math.random() * 700; }
    } else if ((!z.chemin || !z.chemin.length) && t > (z.recalc || 0)) {
      const a = Math.random() * 7, r = 2 + Math.random() * 5, tx = z.x + Math.cos(a) * r, tz = z.z + Math.sin(a) * r;
      if (Lz.limites(tx, tz)) z.chemin = itineraire(Lz, z.x, z.z, tx, tz); z.recalc = t + 4000 + Math.random() * 4000; }
    if (z.bloque && t < z.bloque) continue;
    if (z.chemin && z.chemin.length) { const [px, pz] = z.chemin[0], ddx = px - z.x, ddz = pz - z.z, d = Math.hypot(ddx, ddz);
      if (d < .12) z.chemin.shift();
      else { const v = ZTYPES[z.ty].v * (z.chien ? Math.max(.5, Math.min(2, regZ(4).k || 1)) : 1) * (cible ? 1 : .55), pas = Math.min(d, v * dt), nx = z.x + ddx / d * pas, nzz = z.z + ddz / d * pas;   // (la vitesse du chien : réglée par l'administrateur)
        if (Lz.limites(nx, nzz)) { z.x = nx; z.z = nzz; } else z.chemin = []; } } }
  // ils ne se marchent pas dessus
  const zs = [...M.zomb.values()].filter(z => !z.mortT);
  for (let i = 0; i < zs.length; i++) for (let j = i + 1; j < zs.length; j++) { const a = zs[i], b = zs[j]; if (a.n !== b.n) continue;
    const dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz); if (d > .55 || d < 1e-3) continue; const k = (.55 - d) / 2 / d;
    if (Lz.limites(a.x - dx * k, a.z - dz * k)) { a.x -= dx * k; a.z -= dz * k; } if (Lz.limites(b.x + dx * k, b.z + dz * k)) { b.x += dx * k; b.z += dz * k; } }
  // l'état, pour les autres joueurs (cinq fois par seconde)
  if (t > (M.zEnvoiT || 0) && [...M.gens.values()].some(p => !p.moi && p.info.numero > 0)) { M.zEnvoiT = t + 200;
    envoyerWS({ t: "z_etat", l: [...M.zomb.values()].map(z => [z.id, z.ty, +z.x.toFixed(2), +z.z.toFixed(2), z.n, z.hp]) }); }
}
function recevoirEtatZ(l) {
  if (!M.L || !M.L.apo || estChefZ()) return;
  const vus = new Set();
  for (const [id, ty, x, z, n, hp] of l) { vus.add(id); let q = M.zomb.get(id);
    if (!q) { if (hp <= 0) continue; q = creerZ({ id, ty, x, z, n, hp }); }
    q.tx = x; q.tz = z; q.n = n; q.hp = hp; if (hp <= 0 && !q.mortT) q.mortT = performance.now(); }
  for (const q of [...M.zomb.values()]) if (!vus.has(q.id)) retirerZ(q);
}
// les munitions et les plantes : posées aux mêmes endroits pour tout le monde
function objetsApo() {
  if (M.objetsL === M.L) return; M.objetsL = M.L; for (const o of M.objets || []) M.scene.remove(o.sp); M.objets = [];
  const L = M.L, base = baseLieu(M.lieu), Z = L.zone || [-20, 20, -20, 20], graine = { grande: 11, rue: 23, fetes: 37, etage: 51 }[base] || 1;
  const pres = (x, z) => { for (let a = 0; a < 8; a++) { const t = a / 8 * Math.PI * 2; if (!L.limites(x + Math.cos(t) * .7, z + Math.sin(t) * .7)) return true; } return false; };   // contre un mur
  const poser = (type, n, filtre) => { let k = 0, mis = 0;
    while (mis < n && k < 4000) { k++; const x = Z[0] + hasard(graine * 97 + k * 3.1 + (type === "plante" ? 500 : 0)) * (Z[1] - Z[0]), z = Z[2] + hasard(graine * 53 + k * 7.7 + (type === "plante" ? 900 : 0)) * (Z[3] - Z[2]);
      if (!L.limites(x, z) || !filtre(x, z) || (type === "plante" && !pres(x, z)) || (L.feuxZ || []).some(([fx, fz, r]) => Math.hypot(x - fx, z - fz) < r + .6)) continue; if (M.objets.some(o => Math.hypot(o.x - x, o.z - z) < 3)) continue;
      const etg = base === "etage" ? Math.floor(hasard(graine + k) * (ET.N + 1)) : 0;
      if (base === "etage" && !(Math.abs(x) < ET.CX0 && z > -2.7 && z < -1.1)) continue;
      const y = base === "etage" ? etg * ET.H : (L.hauteur ? L.hauteur(x, z, {}) : 0);
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: texObj(type), transparent: true, alphaTest: .3 }));
      if (type === "plante") { sp.scale.set(.5, .65, 1); sp.position.set(x, y + .33, z); } else { sp.scale.set(.55, .37, 1); sp.position.set(x, y + .2, z); }
      M.scene.add(sp); M.objets.push({ id: type + M.objets.length, type, x, z, y, n: etg, sp, cache: 0 }); mis++; } };
  const nb = { grande: [5, 2], rue: [3, 1], fetes: [2, 1], etage: [5, 3] }[base] || [0, 0];
  const horsRepos = (x, z) => !(L.repos && L.repos(x, z));
  poser("balles", nb[0], horsRepos); poser("plante", nb[1], horsRepos);
  // la salle de repos : de quoi se refaire, posé sur le comptoir du bar (on le prend avec le bouton)
  if (L.repos && L.comptoirSousSol) L.comptoirSousSol.forEach(([x, z], i) => { const type = i % 2 ? "plante" : "balles", y = L.yComptoirSousSol;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: texObj(type), transparent: true, alphaTest: .3 }));
    if (type === "plante") { sp.scale.set(.42, .55, 1); sp.position.set(x, y + .27, z); } else { sp.scale.set(.46, .31, 1); sp.position.set(x, y + .16, z); }
    M.scene.add(sp); M.objets.push({ id: type + M.objets.length, type, x, z, y, n: 0, sp, cache: 0, table: true }); });
}
let texObjets = null;
function texObj(type) { texObjets = texObjets || { balles: new THREE.TextureLoader().load("images/apo/munitions.png"), plante: new THREE.TextureLoader().load("images/apo/plante.png") };
  for (const t of Object.values(texObjets)) t.colorSpace = THREE.SRGBColorSpace; return texObjets[type]; }
function prendreObjet(o) {
  if (o.type === "balles") { APO.balles = 9; ramasser(o); M.ctx.surInfo && M.ctx.surInfo("🔫 Munitions ! 9 balles."); }
  else { const g = Math.min(2, 4 - APO.vies); APO.vies += g; ramasser(o); M.ctx.surInfo && M.ctx.surInfo(g > 1 ? "🌿 Deux vies de plus !" : "🌿 Une vie de plus !"); }
  majHudApo();
}
function ramasser(o) { o.cache = performance.now() + 45000; o.sp.visible = false; envoyerWS({ t: "z_ramasse", id: o.id }); }
// le compteur de balles et les vies, à l'écran
function majHudApo() {
  const e = M && M.L && M.L.apo ? { balles: APO.balles, vies: APO.vies, zombie: APO.zombieFin ? Math.max(0, Math.ceil((APO.zombieFin - performance.now()) / 1000)) : 0,
    equipe: (M.equipe || []).map(q => ({ nom: HEROS[q.id].court, vies: q.vies, mort: q.mort })) } : null;
  const cle = JSON.stringify(e); if (cle === M.hudCle) return; M.hudCle = cle; M.ctx.surApo && M.ctx.surApo(e);
}
// à chaque image : les zombies bougent, tombent, grognent ; on ramasse ; le compte à rebours du zombie
function animerApo(t, dt) {
  if (!M.L || !M.L.apo) { if (M.zomb && M.zomb.size) M.zomb.clear(); majHudApo(); return; }
  if (!M.zomb || M.zombL !== M.L) { M.zomb = new Map(); M.zombL = M.L; M.zInit = false; M.sangs = []; }
  const moi = moiApo(); if (!moi) return;
  objetsApo();
  if (estChefZ()) simulerZ(t, dt);
  animerEquipe(performance.now());
  // les équipiers des joueurs partis (ou qui ne donnent plus de nouvelles) disparaissent
  for (const [de, tt] of Object.entries(M.fantomesT || {})) if (performance.now() - tt > 4000) { for (const k of [0, 1]) retirerAncien(FANTOME(+de, k)); delete M.fantomesT[de]; }
  const cam = M.camera.position, now = performance.now();
  for (const z of M.zomb.values()) {
    if (!estChefZ()) { const k = Math.min(1, dt * 8); z.x += (z.tx - z.x) * k; z.z += (z.tz - z.z) * k; }
    const vx = z.x - (z.px ?? z.x), vz = z.z - (z.pz ?? z.z); z.px = z.x; z.pz = z.z;
    let rx = 0, rz = 0; if (z.recul && now - z.recul[2] < 250) { const f = 1 - (now - z.recul[2]) / 250; rx = z.recul[0] * .35 * f; rz = z.recul[1] * .35 * f; }
    z.g.position.set(z.x + rx, yZ(z), z.z + rz);
    z.mesh.rotation.y = Math.atan2(cam.x - z.x, cam.z - z.z);
    // le chien regarde là où il court
    if (z.chien && Math.hypot(vx, vz) > 1e-4) { const droite = new THREE.Vector3().setFromMatrixColumn(M.camera.matrixWorld, 0); z.flip = (vx * droite.x + vz * droite.z) > 0 ? -1 : 1; }
    z.mesh.scale.set(z.W * (z.flip || 1), z.H, 1);
    z.mesh.material.color.setRGB(1, now < (z.flashT || 0) ? .35 : 1, now < (z.flashT || 0) ? .35 : 1);
    if (z.mortT) { const f = Math.min(1, (now - z.mortT) / 550); z.mesh.rotation.x = -f * Math.PI / 2 * .97; z.mesh.rotation.z = 0; z.mesh.position.y = z.chien ? 0 : .05 * f;
      z.mesh.material.opacity = now - z.mortT > 6500 ? Math.max(0, 1 - (now - z.mortT - 6500) / 1500) : 1; continue; }
    const marche = Math.hypot(vx, vz) > 1e-4;
    const PZ = z.mesh.userData.poses; if (PZ && z.coupT && now - z.coupT < 350) { if (z.mesh.material.map !== PZ.poing) { z.mesh.material.map = PZ.poing; z.mesh.material.needsUpdate = true; } }
    else if (PZ) { const m = marche ? (Math.floor((now + z.ph * 100) / 420) % 2 ? PZ.a : PZ.b) : PZ.c; if (z.mesh.material.map !== m) { z.mesh.material.map = m; z.mesh.material.needsUpdate = true; } }
    z.mesh.rotation.z = Math.sin(now / (z.chien ? 90 : 420) + z.ph) * (z.chien ? .05 : .09);
    z.mesh.position.y = marche ? Math.abs(Math.sin(now / (z.chien ? 70 : 260) + z.ph)) * (z.chien ? .08 : .05) : 0;
    // il grogne (le chien aboie) quand on est près
    const d = Math.hypot(moi.g.position.x - z.x, moi.g.position.z - z.z);
    if (now > z.sonT && d < 15 && (baseLieu(M.lieu) !== "etage" || z.n === etageDe(moi))) { z.sonT = now + (z.chien ? 5000 : 6500) + Math.random() * 5000; sonPos(ZTYPES[z.ty].son, (1 - d / 15) * .9); }
  }
  // les objets : ils réapparaissent ; au sol, on les ramasse en passant dessus (sur le comptoir, il faut les prendre)
  for (const o of M.objets || []) { if (o.cache && now > o.cache) { o.cache = 0; o.sp.visible = true; }
    if (o.cache || APO.zombieFin || o.table || (o.type === "balles" ? APO.balles >= 9 : APO.vies >= 4)) continue;
    if (baseLieu(M.lieu) === "etage" && o.n !== etageDe(moi)) continue;
    if (Math.hypot(moi.g.position.x - o.x, moi.g.position.z - o.z) < .75) prendreObjet(o); }
  // le feu brûle : une vie en moins, et l'on recule hors des flammes
  if (!APO.zombieFin && now > (M.feuT || 0)) { const mp = moi.g.position, f = (M.L.feuxZ || []).find(([fx, fz, r]) => Math.hypot(mp.x - fx, mp.z - fz) < r);
    if (f) { M.feuT = now + 1500; M.ctx.surInfo && M.ctx.surInfo("🔥 Tu brûles ! Une vie en moins."); const dx = mp.x - f[0], dz = mp.z - f[1], d = Math.hypot(dx, dz) || 1, nx = f[0] + dx / d * (f[2] + .3), nz = f[1] + dz / d * (f[2] + .3);
      if (M.L.limites(nx, nz)) { mp.x = nx; mp.z = nz; } subirMorsure(f[0], f[1], 1); if (APO.zombieFin) return; } }
  // devenu zombie : quinze secondes, puis retour dans la vraie caserne, devant la déchetterie
  for (const [m, t0] of M.flaques || []) m.scale.setScalar(Math.min(1, .05 + (now - t0) / 2500));   // (la flaque s'étend doucement)
  if (APO.zombieFin && now > APO.zombieFin) { APO.zombieFin = 0; APO.vies = 4; APO.balles = 9; moi.info.mortT = 0; M.flaques = []; M.ctx.surApoMort && M.ctx.surApoMort(false); changerLieu("grande", [-6.4, -38.5], Math.PI / 2); return; }
  majHudApo();
}
function construireScene(id) {
  const scene = new THREE.Scene(), T = textures();
  scene.background = tex(T.ciel); scene.fog = new THREE.Fog(0xcfe6f7, 70, 160);
  scene.add(new THREE.HemisphereLight(0xdcefff, 0x8a7a66, 1.1));
  const soleil = new THREE.DirectionalLight(0xfff2dd, 2.3); soleil.position.set(-18, 30, 14); soleil.castShadow = true;
  Object.assign(soleil.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, far: 120 }); soleil.shadow.mapSize.set(2048, 2048); soleil.shadow.bias = -.0005;
  scene.add(soleil);
  const L = construireLieu(baseLieu(id), scene);
  if (id === "bttf-cour") Object.assign(L, { portails: [], raccourcis: [], porteFete: null, posDJ: null, posBar: null, sansPNJ: true, bttf: true });   // (la cour d'honneur rien qu'à soi, pour la DeLorean)
  if (L.interieur) { soleil.intensity = 0; soleil.castShadow = false; scene.children.filter(o => o.isHemisphereLight).forEach(h => h.intensity = .35); scene.fog = null; scene.background = new THREE.Color(0x2a2420); }
  else {
    const hemi = scene.children.find(o => o.isHemisphereLight), cielJour = scene.background, nuages = scene.children.filter(o => o.isSprite);
    graine = 5;
    const cielNuit = tex(toile(512, 512, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#050b1c"); g.addColorStop(.7, "#14224a"); g.addColorStop(1, "#2a3a64"); x.fillStyle = g; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 260; i++) { const a = alea(); x.fillStyle = `rgba(255,255,255,${.3 + a * .7})`; x.fillRect(alea() * w, alea() * h * .75, a > .92 ? 2 : 1, a > .92 ? 2 : 1); } }));
    const lune = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex(toile(256, 256, (x) => { const g = x.createRadialGradient(128, 128, 40, 128, 128, 126); g.addColorStop(0, "rgba(255,250,225,.55)"); g.addColorStop(1, "rgba(255,250,225,0)");
      x.fillStyle = g; x.fillRect(0, 0, 256, 256); x.fillStyle = "#f6f1dc"; x.beginPath(); x.arc(128, 128, 46, 0, 7); x.fill();
      x.fillStyle = "rgba(170,165,140,.45)"; [[112, 112, 9], [140, 138, 12], [124, 150, 6], [146, 110, 5]].forEach(([a, b, rr]) => { x.beginPath(); x.arc(a, b, rr, 0, 7); x.fill(); }); })), fog: false, depthWrite: false }));
    lune.position.set(23.5, 29, -22); lune.scale.set(8, 8, 1); lune.visible = false; scene.add(lune);
    const clair = new THREE.AmbientLight(0x9fb4ff, 0); scene.add(clair);
    L.setNuit = (n) => {
      L.nuit = n;
      scene.background = n ? cielNuit : cielJour; scene.fog.color.setHex(n ? 0x0c1530 : 0xcfe6f7);
      hemi.intensity = n ? .32 : 1.1; hemi.color.setHex(n ? 0x6f86c8 : 0xdcefff);
      soleil.intensity = n ? .55 : 2.3; soleil.color.setHex(n ? 0xaec2ff : 0xfff2dd); soleil.position.set(n ? 30 : -18, n ? 40 : 30, n ? -30 : 14);
      clair.intensity = n ? .25 : 0; lune.visible = n; nuages.forEach(o => o.visible = !n);
      (L.nuitObjets || []).forEach(o => o.visible = n);
      if (L.lumiereJour) L.lumiereJour.visible = !n; if (L.vueCour) L.vueCour(n);
    };
  }
  if (estApo(id)) apocalypse(scene, L, baseLieu(id));
  const repere = new THREE.Mesh(new THREE.RingGeometry(.35, .5, 32), new THREE.MeshBasicMaterial({ color: 0xf6d465, transparent: true, opacity: 0 }));
  repere.rotation.x = -Math.PI / 2; repere.position.y = .04; scene.add(repere);
  return { scene, L, repere };
}

function placerCamera(net) {
  if (!M || !M.L) return;
  const portrait = M.camera.aspect < 1, c = M.L.cam, moi = M.moiNum && M.gens.get(M.moiNum);
  // la caméra suit doucement son bonhomme
  const sx = moi ? moi.g.position.x * .55 : 0, sz = moi ? Math.min(0, moi.g.position.z - (M.L.depart[1])) * .55 : 0;
  const k = portrait && !M.L.interieur ? 1 : 0;
  const pos = new THREE.Vector3(c.pos[0] * (k ? .7 : 1) + sx, c.pos[1] + k * 2.5, c.pos[2] + k * 4 + sz);
  const vise = new THREE.Vector3(c.vise[0] + sx, c.vise[1] - (portrait ? .5 : 0), c.vise[2] + sz);
  // à l'intérieur : la caméra suit derrière son bonhomme, à 4,5 m, et tourne avec la vue
  // dans la rue aussi (L.suivi : distance, hauteur, regard)
  // glisser vers le haut ou le bas : la caméra monte (jusqu'à voir du ciel) ou descend ; pincer ou la molette : plus près, plus loin
  if ((M.L.interieur || M.L.suivi) && moi) {
    const S = M.L.suivi || { d: 4.6, h: 2.5, av: 3, vy: 1.2 }, E0 = Math.atan2(S.h - 1.2, S.d);
    if (M.camE == null) { M.camE = E0; M.camD = Math.hypot(S.h - 1.2, S.d); }
    const E = M.camE, D = M.camD, t = Math.max(0, (E - E0) / Math.max(.01, 1.35 - E0));
    const yw = M.yaw || 0, fx = -Math.sin(yw), fz = -Math.cos(yw), mx = moi.g.position.x, mz = moi.g.position.z;
    pos.set(mx - fx * D * Math.cos(E), 1.2 + D * Math.sin(E), mz - fz * D * Math.cos(E));
    const av = S.av * (1 - .85 * t); vise.set(mx + fx * av, S.vy + (1 - S.vy) * t, mz + fz * av);
    pos.y += moi.g.position.y; vise.y += moi.g.position.y;      // dans l'escalier, la caméra descend avec soi
    if (M.L.plafond) pos.y = Math.min(pos.y, M.L.plafond);
  }
  // dehors : tourner la vue (glisser le doigt, ou ↻) fait tourner la caméra autour de son bonhomme
  const yaw = 0;
  if (yaw) { const px = moi ? moi.g.position.x : vise.x, pz = moi ? moi.g.position.z : vise.z, cs = Math.cos(yaw), sn = Math.sin(yaw);
    for (const v of [pos, vise]) { const dx = v.x - px, dz = v.z - pz; v.x = px + dx * cs - dz * sn; v.z = pz + dx * sn + dz * cs; } }
  if (M.L.contraindreCam && moi && M.L.contraindreCam(pos, moi)) {}
  else if (M.L.boite) { const [a, b, c2, d] = M.L.boite; pos.x = Math.max(a + .3, Math.min(b - .3, pos.x)); pos.z = Math.max(c2 + .3, Math.min(d - .3, pos.z)); }
  if (net || !M.camVise) { M.camera.position.copy(pos); M.camVise = vise.clone(); }
  else { const k = 1 - Math.pow(.94, (M.dtCam || .016) * 60); M.camera.position.lerp(pos, k); M.camVise.lerp(vise, k); }   // (le même suivi, quelle que soit la vitesse du téléphone)
  M.camera.fov = M.L.fov ? M.L.fov[portrait ? 1 : 0] : portrait ? (M.L.interieur ? 74 : 66) : (M.L.interieur ? 62 : 50); M.camera.updateProjectionMatrix(); M.camera.lookAt(M.camVise);
}

/* --- jour ou nuit : d'après l'heure réelle à Paris, sauf si l'administrateur l'a imposé --- */
const SOLEIL_PARIS = [[8.7, 17.3], [8.1, 18.1], [7.3, 18.8], [7.2, 20.5], [6.4, 21.2], [5.8, 21.9], [6.1, 21.8], [6.8, 21.1], [7.6, 20.1], [8.3, 19.0], [8.2, 17.3], [8.7, 16.9]];
function estNuit() {
  if (M && estApo(M.lieu)) return true;   // (l'apocalypse : toujours la nuit)
  const mode = M && M.ambiance || "auto";
  if (M && M.lieu === "hv1955") return false;   // (Hill Valley, 1955 : un bel après-midi)
  if (mode === "jour") return false; if (mode === "nuit") return true;
  const f = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", month: "numeric", hour: "numeric", minute: "numeric", hourCycle: "h23" }).formatToParts(new Date());
  const v = k => +f.find(p => p.type === k).value, h = v("hour") + v("minute") / 60, [lever, coucher] = SOLEIL_PARIS[v("month") - 1];
  return h < lever || h >= coucher;
}
function majAmbiance() {
  if (!M || !M.L || !M.L.setNuit) return; const n = estNuit(); M.L.setNuit(n);
  if (M.L.posDJ && M.gens) { if (n) ajouterDJ(); else if (M.gens.has(DJ)) retirerAncien(DJ); }
  M.ctx && M.ctx.surNuit && M.ctx.surNuit(n, M.lieu);
}
export function ambiance(mode) { envoyerWS({ t: "ambiance", mode }); }

/* --- les bonshommes dans la scène --- */
const hauteurDe = p => Math.max(.75, Math.min(1.3, (p.info.reglage && p.info.reglage.h) || 1));   // le réglage « h » : plus grand, plus petit
const tailleBonhomme = () => M && M.L ? M.L.taille || (M.L.interieur ? 1.8 : 2.4) : 2.4;
const sprite = (c, l, h) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex(c), transparent: true, depthWrite: false })); s.scale.set(l, h, 1); return s; };
const etiquette = (texte, moi, admin) => toile(512, 96, (x) => { x.font = "bold 44px Arial"; const t = (admin ? "★ " : "") + texte, w = x.measureText(t).width + 50;
  x.fillStyle = moi ? "#c4694a" : admin ? "#8a6d12" : "rgba(31,42,55,.85)"; x.beginPath(); x.roundRect(256 - w / 2, 14, w, 66, 33); x.fill(); x.fillStyle = "#fff"; x.textAlign = "center"; x.fillText(t, 256, 64); });
function toileBulle(texte) {
  const mots = texte.split(" "), lignes = []; let l = "";
  const mes = toile(1, 1, () => {}).getContext("2d"); mes.font = "bold 40px Arial";
  for (const m of mots) { const e = l ? l + " " + m : m; if (mes.measureText(e).width > 560 && l) { lignes.push(l); l = m; } else l = e; } if (l) lignes.push(l);
  return toile(640, 70 + lignes.length * 50, (x, w, h) => { x.fillStyle = "#fff"; x.strokeStyle = "#1f2a37"; x.lineWidth = 5;
    x.beginPath(); x.roundRect(6, 6, w - 12, h - 40, 22); x.moveTo(w / 2 - 18, h - 35); x.lineTo(w / 2, h - 4); x.lineTo(w / 2 + 18, h - 35); x.fill(); x.stroke();
    x.fillStyle = "#fff"; x.fillRect(w / 2 - 15, h - 40, 30, 8); x.fillStyle = "#1f2a37"; x.font = "bold 40px Arial"; x.textAlign = "center"; lignes.forEach((t, i) => x.fillText(t, w / 2, 58 + i * 48)); });
}
async function chargerTete(numero, v, url) {
  if (!v && !url) return null;
  const cle = url || numero + ":" + v; if (M.teteCache.has(cle)) return M.teteCache.get(cle);
  const p = (async () => { try { const i = new Image(); i.crossOrigin = "anonymous"; i.src = url || M.ctx.urlTete(numero, v); await i.decode(); return i; } catch (e) { return null; } })();
  M.teteCache.set(cle, p); return p;
}
// la même image, retournée gauche-droite (pour regarder de l'autre côté)
const miroir = (c) => tex(toile(c.width, c.height, (x, w) => { x.translate(w, 0); x.scale(-1, 1); x.drawImage(c, 0, 0); }));
async function dessinerCorps(p) {
  const tete = await chargerTete(p.info.numero, p.info.tete_v, p.info.teteUrl);
  if (!M) return;
  const c = dessinerBonhomme({ ...p.info, moi: p.moi, large: true }, tete);
  // les poses de la danse : bras en bas, à mi-hauteur, levés ; et le disco (le doigt en l'air, puis vers le sol)
  libererPoses(p);
  /* chaque pose n'est dessinée que la première fois qu'elle sert (avec beaucoup de monde, le téléphone ne garde en mémoire que les poses vraiment utilisées) */
  const pose = n => () => tex(dessinerBonhomme({ ...p.info, moi: p.moi, large: true, pose: n }, tete));
  const fab = { repos: () => tex(c), mi: pose("mi"), haut: pose("haut"), disco1: pose("disco1"), disco2: pose("disco2"), genoux1: pose("genoux1"), genoux2: pose("genoux2"), madison1: pose("madison1"), madison2: pose("madison2"), madison3: pose("madison3"), madison4: pose("madison4"), madison5: pose("madison5"), dos: pose("dos"), thriller1: pose("thriller1"), thriller2: pose("thriller2"), thriller3: pose("thriller3"), profil: pose("profil"), profilD: () => miroir(dessinerBonhomme({ ...p.info, moi: p.moi, large: true, pose: "profil" }, tete)),
    assis: pose("assis"), boire: pose("boire"), slow: pose("slow"), slowD: () => miroir(dessinerBonhomme({ ...p.info, moi: p.moi, large: true, pose: "slow" }, tete)), ...(p.info.arme ? { tir: pose("tir") } : {}), ...(p.info.smith || p.info.musicien === "basse" || p.info.musicien === "guitare" || p.info.musicien === "dmguitare" ? { guitare1: pose("guitare1"), guitare2: pose("guitare2") } : {}),
    ...(p.info.musicien === "chant" ? { chant1: pose("chant1"), chant2: pose("chant2") } : {}), ...(p.info.musicien === "clavier" ? { clavier1: pose("clavier1"), clavier2: pose("clavier2") } : {}), ...(p.info.musicien === "batterie" ? { batterie0: pose("batterie0"), batterie1: pose("batterie1"), batterie2: pose("batterie2"), batterie3: pose("batterie3") } : {}), ...(p.info.hernandez ? { canne1: pose("canne1"), canne2: pose("canne2"), canne3: pose("canne3"), canne3D: () => miroir(dessinerBonhomme({ ...p.info, moi: p.moi, large: true, pose: "canne3" }, tete)), canne4: pose("canne4") } : {}), ...(p.info.dj ? { mix1: pose("mix1"), mix2: pose("mix2"), mix3: pose("mix3") } : {}), ...(p.info.barman ? { servir: pose("servir"), ranger: pose("ranger"), essuyer: pose("essuyer") } : {}) };
  const cache = {}; p.posesCache = cache; p.poses = {};
  for (const [k, f] of Object.entries(fab)) Object.defineProperty(p.poses, k, { enumerable: true, get: () => cache[k] || (cache[k] = f()) });
  if (p.corps) { p.corps.material.map = p.poses.repos; p.corps.material.needsUpdate = true; }
  else { const H = tailleBonhomme(); // les bonshommes passent après le décor transparent (bouteilles, verres) : jamais un objet de derrière dessiné par-dessus eux
    /* chaque bonhomme est un panneau qui reste (presque) droit : il se tourne vers la caméra, mais ne se penche en arrière que de 17° au plus,
       pour que, vu d'en haut, il ne bascule pas dans le comptoir, l'étagère ou un mur derrière lui */
    const geo = new THREE.PlaneGeometry(1, 1); geo.translate(0, .5, 0);
    const mat = new THREE.MeshBasicMaterial({ map: p.poses.repos, transparent: true, alphaTest: .4, side: THREE.DoubleSide });
    p.corps = new THREE.Mesh(geo, mat); p.corps.droit = true; p.corps.userData.perso = true; p.corps.rotation.order = "YXZ";
    Object.defineProperty(mat, "rotation", { get: () => p.corps.rotation.z, set: v => { p.corps.rotation.z = v; } });   // (le balancement de la danse)
    p.corps.renderOrder = 2; p.corps.scale.set(H * .476 * 1.6 * hauteurDe(p), H * hauteurDe(p), 1); p.g.add(p.corps); }
}
function ajouterAncien(info) {
  if (!M || !M.scene) return;
  if (M.L && M.L.apo && info.numero > 0) info.arme = true;   // (à l'apocalypse, chacun a son pistolet)
  // à l'apocalypse, on peut jouer l'un des héros de Resident Evil : sa tête, sa tenue (hors de l'apocalypse, on redevient soi-même)
  if (info.vrai && !(M.L && M.L.apo)) info = info.vrai;
  { const hid = info.numero > 0 ? (info.numero === M.moiNum ? M.perso : info.perso) : null;
    if (M.L && M.L.apo && hid && HEROS[hid] && !info.vrai) info = { ...habillerHeros(info, hid), vrai: info }; }
  if (M.gens.has(info.numero)) retirerAncien(info.numero);
  const g = new THREE.Group(); g.position.set(info.x || 0, 0, info.z || 0); g.userData.perso = true; M.scene.add(g);
  const p = { info, g, moi: info.numero === M.moiNum, cible: null };
  const H = tailleBonhomme();
  const om = new THREE.Mesh(new THREE.PlaneGeometry(H * .5, H * .5), new THREE.MeshBasicMaterial({ map: tex(textures().ombre), transparent: true, depthWrite: false })); om.rotation.x = -Math.PI / 2; om.position.y = .02; g.add(om);
  // (plus de nom au-dessus des personnages : ça prenait trop de place)
  M.gens.set(info.numero, p);
  if (Number.isInteger(info.assis)) asseoir(p, info.assis);
  // beaucoup de monde au même endroit : on ne dessine que les plus proches (voir trierVisibles)
  if (info.numero > 0 && !p.moi && [...M.gens.values()].filter(q => q.info.numero > 0 && !q.moi && !q.differe).length > MAX_VUS) { p.differe = true; g.visible = false; }
  else dessinerCorps(p);
  return p;
}
/* --- les cercles lumineux au sol, devant chaque porte : on entre (ou l'on sort) en marchant dessus --- */
const RAYON_CERCLE = .62;
// le centre du cercle d'une porte (calculé une fois) : la partie de sa zone d'entrée la plus proche de la porte elle-même,
// puis poussé vers l'intérieur pour que tout le cercle soit sur le sol où l'on marche
function centrePortail(pt) {
  if (pt.centre) return pt.centre;
  if (pt.seuil) { pt.zc = pt.seuil; return (pt.centre = pt.seuil); }   // (un passage ouvert : le cercle marque son seuil)
  if (pt.essai && performance.now() - pt.essai < 3000) return null; pt.essai = performance.now();
  const Z = M.L.zone || [-45, 45, -45, 45]; let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
  for (let x = Z[0]; x <= Z[1]; x += .3) for (let z = Z[2]; z <= Z[3]; z += .3) if (pt.dans(x, z)) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, z); z1 = Math.max(z1, z); }
  if (x0 === Infinity) return null;
  // les points de la zone où l'on peut marcher, regroupés en morceaux d'un seul tenant
  const P = .08, ox = x0 - .35, oz = z0 - .35, nx = Math.ceil((x1 - x0 + .7) / P) + 1, nz = Math.ceil((z1 - z0 + .7) / P) + 1, ok = new Uint8Array(nx * nz);
  for (let i = 0; i < nx; i++) for (let k = 0; k < nz; k++) { const x = ox + i * P, z = oz + k * P; if (pt.dans(x, z) && M.L.limites(x, z)) ok[i * nz + k] = 1; }
  const vu = new Uint8Array(nx * nz), morceaux = [];
  for (let d = 0; d < ok.length; d++) if (ok[d] && !vu[d]) { const pile = [d], m = []; vu[d] = 1;
    while (pile.length) { const e = pile.pop(), i = Math.floor(e / nz), k = e % nz; m.push([ox + i * P, oz + k * P]);
      for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const ii = i + a, kk = k + b, f = ii * nz + kk; if (ii >= 0 && ii < nx && kk >= 0 && kk < nz && ok[f] && !vu[f]) { vu[f] = 1; pile.push(f); } } }
    morceaux.push(m); }
  if (!morceaux.length) return null;
  const moy = m => [m.reduce((a, q) => a + q[0], 0) / m.length, m.reduce((a, q) => a + q[1], 0) / m.length];
  const porte = (M.L.raccourcis || []).filter(r => r.vers === pt.vers).map(r => r.obj.getWorldPosition(new THREE.Vector3()));
  const dist = c => porte.length ? Math.min(...porte.map(w => Math.hypot(w.x - c[0], w.z - c[1]))) : -morceaux.find(m => moy(m) === c)?.length || 0;
  let best = null, bd = Infinity; for (const m of morceaux) { const c = moy(m), d = porte.length ? dist(c) : -m.length; if (d < bd) { bd = d; best = m; } }
  let zc = moy(best);
  if (pt.indice) zc = best.reduce((b, q) => Math.hypot(q[0] - pt.indice[0], q[1] - pt.indice[1]) < Math.hypot(b[0] - pt.indice[0], b[1] - pt.indice[1]) ? q : b);   // (au plus près de la porte)
  if (!M.L.limites(zc[0], zc[1])) zc = best.reduce((b, q) => Math.hypot(q[0] - zc[0], q[1] - zc[1]) < Math.hypot(b[0] - zc[0], b[1] - zc[1]) ? q : b);
  // poussé vers l'intérieur, jusqu'à ce que tout le cercle tienne sur le sol
  const tient = (cx, cz) => { for (let a = 0; a < 12; a++) { const t = a / 12 * Math.PI * 2; if (!M.L.limites(cx + Math.cos(t) * (RAYON_CERCLE - .05), cz + Math.sin(t) * (RAYON_CERCLE - .05))) return false; } return M.L.limites(cx, cz); };
  let centre = tient(zc[0], zc[1]) ? zc : null;
  for (let k = .1; !centre && k <= 1.6; k += .1) for (let a = 0; a < 16 && !centre; a++) { const t = a / 16 * Math.PI * 2, cx = zc[0] + Math.cos(t) * k, cz = zc[1] + Math.sin(t) * k; if (tient(cx, cz)) centre = [cx, cz]; }
  pt.zc = zc; return (pt.centre = centre || zc);
}
function animerCercles(t) {
  if (M.cerclesL !== M.L) {   // nouveau lieu : on (re)pose les cercles
    for (const c of M.cercles || []) { M.scene.remove(c.g); }
    M.cercles = []; M.cerclesL = M.L; M.cerclePret = false;
    for (const pt of M.L.portails || []) if (!pt.continu || pt.seuil) M.cercles.push({ pt, g: null });
  }
  const moi = M.moiNum && M.gens.get(M.moiNum);
  // arrivé dans un cercle (en entrant dans le lieu) : il faut d'abord en sortir, pour ne pas repartir aussitôt
  if (moi && !M.cerclePret && !M.cercles.some(c => !centrePortail(c.pt) || Math.hypot(moi.g.position.x - c.pt.centre[0], moi.g.position.z - c.pt.centre[1]) < RAYON_CERCLE + .1)) M.cerclePret = true;
  // arrêté sur le cercle d'un passage ouvert (le vestibule) : on franchit la porte tout seul
  if (moi && M.cerclePret && !moi.cible && !M.passage) for (const c of M.cercles) { const q = c.pt;
    if (q.traverse && q.centre && Math.hypot(moi.g.position.x - q.centre[0], moi.g.position.z - q.centre[1]) < RAYON_CERCLE * .85) { allerVers(q.traverse[0], q.traverse[1], true); break; } }
  for (const c of M.cercles) {
    if (!c.g) { const ce = centrePortail(c.pt); if (!ce) continue;
      const rouge = estApo(c.pt.vers) !== estApo(M.lieu);   // (le passage vers l'apocalypse, ou celui qui en ramène : en rouge)
      const g = new THREE.Group(), or = new THREE.MeshBasicMaterial({ color: rouge ? 0xd8281c : 0xf5b82e, transparent: true, opacity: .95, depthWrite: false, side: THREE.DoubleSide });
      const anneau = new THREE.Mesh(new THREE.RingGeometry(RAYON_CERCLE - .1, RAYON_CERCLE, 48), or); anneau.rotation.x = -Math.PI / 2; g.add(anneau);
      const disque = new THREE.Mesh(new THREE.CircleGeometry(RAYON_CERCLE - .1, 48), new THREE.MeshBasicMaterial({ color: rouge ? 0xff5040 : 0xffe28a, transparent: true, opacity: .35, depthWrite: false, side: THREE.DoubleSide }));
      disque.rotation.x = -Math.PI / 2; disque.position.y = -.002; g.add(disque);
      const halo = new THREE.Mesh(new THREE.RingGeometry(RAYON_CERCLE, RAYON_CERCLE + .22, 48), new THREE.MeshBasicMaterial({ color: rouge ? 0xff2a1a : 0xffd25a, transparent: true, opacity: .45, depthWrite: false, side: THREE.DoubleSide }));
      halo.rotation.x = -Math.PI / 2; g.add(halo); g.renderOrder = 3;
      g.position.set(ce[0], (M.L.hauteur ? M.L.hauteur(ce[0], ce[1], moi || {}) : 0) + .04, ce[1]); M.scene.add(g); c.g = g; c.anneau = anneau; c.halo = halo; c.disque = disque; }
    // il bat doucement, comme une lumière qui respire ; caché quand la porte n'est pas utilisable d'ici (les étages)
    c.g.visible = c.pt.continu ? true : c.pt.dans(c.pt.zc[0], c.pt.zc[1]);
    const b = .5 + .5 * Math.sin(t / 420);
    c.anneau.material.opacity = .75 + .25 * b; c.halo.material.opacity = .25 + .3 * b; c.disque.material.opacity = .25 + .2 * b;
    c.halo.scale.setScalar(1 + .08 * b);
  }
}
/* avec beaucoup de monde dans le même lieu : seuls les MAX_VUS anciens les plus proches de soi sont dessinés (les autres sont bien là, mais pas affichés),
   pour que le téléphone reste fluide ; on refait le tri toutes les secondes */
const MAX_VUS = 50;
function trierVisibles() {
  const moi = M.moiNum && M.gens.get(M.moiNum); if (!moi) return;
  const autres = [...M.gens.values()].filter(q => q.info.numero > 0 && !q.moi);
  if (autres.length <= MAX_VUS && !autres.some(q => q.differe)) return;
  autres.sort((a, b) => a.g.position.distanceToSquared(moi.g.position) - b.g.position.distanceToSquared(moi.g.position));
  autres.forEach((q, i) => {
    if (i < MAX_VUS) { if (q.differe) { q.differe = false; q.g.visible = true; dessinerCorps(q); } }
    else if (i >= MAX_VUS + 8 && !q.differe) { q.differe = true; q.g.visible = false; libererPoses(q); }   // (un peu de marge, pour ne pas clignoter)
  });
}
function libererPoses(p) { const c = p.posesCache; if (c) for (const k of Object.keys(c)) { c[k].dispose(); delete c[k]; } }
function retirerAncien(numero) { const p = M && M.gens.get(numero); if (!p) return; M.scene.remove(p.g); M.gens.delete(numero); libererPoses(p);
  if (p.corps) { p.corps.geometry.dispose(); p.corps.material.dispose(); } }   // (la mémoire est rendue quand quelqu'un s'en va)
function dire(numero, texte) {
  const p = M && M.gens.get(numero); if (!p) return;
  if (p.bulle) p.g.remove(p.bulle);
  const c = toileBulle(texte); const H = tailleBonhomme(); p.bulle = sprite(c, H * 1.25, H * 1.25 * c.height / c.width); p.bulle.center.set(.5, 0); p.bulle.position.y = H * hauteurDe(p) + .5; p.g.add(p.bulle);
  p.bulleFin = performance.now() + Math.min(6000, 2500 + texte.length * 40);
}

/* --- le chef de poste se promène tout seul (même trajet pour tout le monde : il dépend de l'heure) --- */
const PNJ = -1, PHRASES = {
  // partout
  tous: ["Comment ça va, les anciens ?", "Alors, on se promène ?", "Pas de bêtises, hein !", "De mon temps, on saluait !", "Rentrez-moi cette chemise !", "Encore vous ?",
    "C'est pas un moulin, ici !", "Je vous ai à l'œil…", "Ça me rappelle des souvenirs…", "Bonjour quand même !", "On ne traîne pas !", "Je fais ma ronde, moi.",
    "Vous croyez que la caserne se garde toute seule ?", "Ah, la jeunesse…", "Pas un pli, je veux !"],
  grande: ["Pas de courses dans la cour !", "Halte mon gars !", "Vos papiers !", "On ne marche pas sur les marches en courant !", "Qui a laissé traîner ça ?", "Le car part à quelle heure ?"],
  rue: ["Circulez, y a rien à voir !", "On ne stationne pas devant la grille !", "Vous avez votre badge ?", "Fermez bien le portillon !", "Les croissants d'en face, une merveille.", "Encore un qui a oublié son code…"],
  fetes: ["Va falloir baisser la musique !", "C'est quoi ce boucan ?", "À mon époque, on dansait le musette !", "Un petit verre… mais un seul !", "Je danse pas, je surveille.",
    "Ce DJ, je vais lui confisquer ses disques !", "Allez, tout le monde sur la piste !", "Qui a éteint la lumière ?"],
  musique: ["Va falloir baisser la musique !", "Moins fort, on n'entend plus le clairon !", "C'est de la musique, ça ?", "Bon… elle est pas mal, celle-là.", "Mes oreilles !"],
  salut: ["Comment ça va, %s ?", "Tiens, %s ! Toujours vivant ?", "Salut %s, ça fait longtemps !", "%s ! Tu as pris un coup de vieux, dis donc.", "Repos, %s."],
};
const phrasePNJ = (n) => { const l = [...PHRASES.tous, ...(PHRASES[M.lieu] || []), ...(M.lieu === "fetes" && M.djJoue ? PHRASES.musique : [])]; return l[Math.floor(hasard(n) * l.length)]; };
const hasard = n => { let x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
/* le chef de poste n'est qu'à un seul endroit à la fois, le même pour tout le monde (il dépend de l'heure) :
   le plus souvent dans la cour d'honneur, de temps en temps dans la salle des fêtes ; il change de lieu toutes les 5 minutes */
const LIEUX_PNJ = ["grande", "grande", "fetes", "grande", "grande", "fetes"];
const lieuPNJ = () => LIEUX_PNJ[Math.floor(Date.now() / 300000) % LIEUX_PNJ.length];
function ajouterPNJ() {
  if (!M || !M.L || M.gens.has(PNJ) || M.L.sansPNJ || lieuPNJ() !== M.lieu) return;      // (jamais au sous-sol, ni dans la rue ou les étages)
  const [x, z] = pointPNJ(Math.floor(Date.now() / 9000) - 1);
  const P = (M.ctx.pnj && M.ctx.pnj()) || {};
  ajouterAncien({ numero: PNJ, nom: P.nom || "Le chef de poste", tenue: P.tenue || "garde", couleur: P.couleur || "#1c2541", bas: P.bas, pieds: P.pieds, reglage: P.reglage || null,
    teteUrl: P.tete_v ? M.ctx.urlTetePNJ(P.tete_v) : "images/pere-tete.png", pnj: true, x, z });
}
function pointPNJ(n) {
  const g = M.lieu === "fetes" ? 1000 : 0;
  for (let k = 0; k < 40; k++) { const x = -12 + hasard(g + n * 3.1 + k) * 24, z = -16 + hasard(g + n * 7.3 + k * 1.7) * 30; if (M.L.limites(x, z) && !(M.L.horsPNJ && M.L.horsPNJ(x, z))) return [x, z]; }
  return M.L.departPNJ || M.L.depart;
}
/* --- Manu, le DJ : il ne quitte pas ses platines (salle des fêtes seulement) --- */
const DJ = -2, PHRASES_DJ = ["Ça va, la piste ?", "Je vous en mets une bonne ?", "Allez, on lève les mains !", "Une petite dédicace ?", "Celle-là, c'est pour les anciens !", "On monte le son ?",
  "Qui veut un Madison ?", "Pas touche aux platines !", "Ambiance, ambiance !", "Je passe ce que vous voulez… presque."];
function ajouterDJ() {
  if (!M || !M.L || !M.L.posDJ || M.gens.has(DJ) || M.L.nuit === false || M.L.apo) return;   // Manu n'arrive qu'à la nuit tombée
  const P = (M.ctx.pnjDJ && M.ctx.pnjDJ()) || {}, [x, z] = M.L.posDJ;
  ajouterAncien({ numero: DJ, nom: P.nom || "Manu", tenue: P.tenue || "polo", couleur: P.couleur || "#e8e2d6", bas: P.bas || "#c8b48a", pieds: P.pieds, reglage: P.reglage || null,
    teteUrl: P.tete_v ? M.ctx.urlTetePNJ(P.tete_v, 2) : "images/manu-tete.png", pnj: true, dj: true, x, z });
}
function animerDJ(t) {
  const p = M && M.gens.get(DJ); if (!p || !p.corps || !p.poses || !p.poses.mix1) return;
  // il mixe : les mains sur les platines, de temps en temps une main au casque ou le poing levé ; il hoche la tête en rythme (plus vite quand la musique passe)
  const tempo = M.djJoue ? 260 : 520, ph = t / tempo, mesure = Math.floor(ph / 8);
  const k = Math.floor(ph) % 8, special = hasard(mesure * 3.7) < .5 ? "mix2" : "mix3";
  const pose = k < 5 ? "mix1" : k < 7 ? special : "mix1";
  if (p.corps.material.map !== p.poses[pose]) { p.corps.material.map = p.poses[pose]; p.corps.material.needsUpdate = true; }
  p.corps.position.y = Math.abs(Math.sin(ph * Math.PI)) * (M.djJoue ? .06 : .025);
  p.corps.material.rotation = Math.sin(ph * Math.PI) * (M.djJoue ? .05 : .02);
  const b = Math.floor(t / 19000);
  if (p.parole !== b) { p.parole = b; if (hasard(b * 5.1) < .35) dire(DJ, PHRASES_DJ[Math.floor(hasard(b * 2.9) * PHRASES_DJ.length)]); }
}
/* --- Mr Miner, le barman : derrière le grand comptoir de la salle des fêtes, il va et vient, essuie et range les verres ;
   dès que quelqu'un s'assoit au bar, il vient le voir et lui pose un verre --- */
const BARMAN = -3, PHRASES_BAR = ["Et voilà, un petit verre !", "Qu'est-ce que je te sers ?", "Santé !", "C'est ma tournée… enfin presque.", "Attention, c'est bien frais !",
  "Un demi, comme d'habitude ?", "Le bar est ouvert, les anciens !", "On ne s'accoude pas sur mes verres propres !"];
function ajouterBarman() {
  if (!M || !M.L || !M.L.posBar || M.gens.has(BARMAN) || M.L.apo) return;
  const P = (M.ctx.pnjBar && M.ctx.pnjBar()) || {}, B = M.L.posBar;
  ajouterAncien({ numero: BARMAN, nom: P.nom || "Mr Miner", tenue: P.tenue || "barman", couleur: P.couleur || "#efe8d2", bas: P.bas || "#4a4636", pieds: P.pieds, reglage: P.reglage || null,
    teteUrl: P.tete_v ? M.ctx.urlTetePNJ(P.tete_v, 3) : "images/miner-tete.png", pnj: true, barman: true, x: B.x, z: (B.z0 + B.z1) / 2 });
  M.verresBar = M.verresBar || new Map();
}
function animerBarman(t) {
  const p = M && M.gens.get(BARMAN), B = M && M.L && M.L.posBar; if (!p || !p.corps || !p.poses || !p.poses.servir || !B) return;
  const aller = z => { p.cible = new THREE.Vector3(B.x, 0, Math.max(B.z0, Math.min(B.z1, z))); p.chemin = []; };   // tout droit, derrière le comptoir
  const pose = n => { const m = p.poses[n] || p.poses.repos; if (p.corps.material.map !== m) { p.corps.material.map = m; p.corps.material.needsUpdate = true; } };
  const verres = M.verresBar || (M.verresBar = new Map());
  // les verres posés : on les retire quand le client se lève
  for (const [cle, v] of verres) { const [num, i] = cle.split(":"), c = M.gens.get(isNaN(+num) ? num : +num) || [...M.gens.values()].find(q => String(q.info.numero) === num);
    if (!c || c.info.assis !== +i) { M.scene.remove(v); verres.delete(cle); } }
  // quelqu'un vient de s'asseoir au bar (de la salle) et n'est pas encore servi ?
  const n = M.L.nbTabouretsSalle || 0;
  const client = [...M.gens.values()].find(q => !q.info.pnj && Number.isInteger(q.info.assis) && q.info.assis < n && !verres.has(q.info.numero + ":" + q.info.assis));
  if (p.service) {
    const s = p.service;
    if (!client || client.info.numero !== s.numero) { p.service = null; return; }
    if (p.cible) { pose("repos"); return; }
    if (!s.debut) { s.debut = t; dire(BARMAN, PHRASES_BAR[Math.floor(hasard(t) * 4)]); }
    pose("servir");
    if (t - s.debut > 1600) {   // le verre est posé sur le comptoir, devant lui
      const z = M.L.tabourets[s.i][1], v = new THREE.Group();
      const verre = new THREE.Mesh(new THREE.CylinderGeometry(.045, .038, .16, 14), new THREE.MeshStandardMaterial({ color: 0xe8f2f5, transparent: true, opacity: .45, roughness: .05 }));
      const biere = new THREE.Mesh(new THREE.CylinderGeometry(.04, .034, .11, 14), new THREE.MeshStandardMaterial({ color: 0xe3a92c, roughness: .3 }));
      const mousse = new THREE.Mesh(new THREE.CylinderGeometry(.042, .04, .03, 14), new THREE.MeshStandardMaterial({ color: 0xfbf6e8, roughness: .8 }));
      verre.position.y = .08; biere.position.y = .06; mousse.position.y = .13; v.add(verre, biere, mousse); v.position.set(B.xVerre, B.yVerre, z); M.scene.add(v);
      verres.set(s.numero + ":" + s.i, v); p.service = null; p.repos = t + 2500;
    }
    return;
  }
  if (client) { p.service = { numero: client.info.numero, i: client.info.assis }; aller(M.L.tabourets[client.info.assis][1]); return; }
  // sinon : il va et vient, essuie un verre, en range un sur l'étagère
  if (p.cible) { pose("repos"); return; }
  const k = Math.floor(t / 4200);
  if (p.etapeBar !== k && !(p.repos > t)) { p.etapeBar = k; const h = hasard(k * 1.37);
    if (h < .4) aller(B.z0 + hasard(k * 2.11) * (B.z1 - B.z0)); else p.geste = h < .72 ? "essuyer" : "ranger"; }
  pose(p.geste || "essuyer");
  const b = Math.floor(t / 23000);
  if (p.parole !== b) { p.parole = b; if (hasard(b * 7.7) < .25) dire(BARMAN, PHRASES_BAR[4 + Math.floor(hasard(b * 3.1) * (PHRASES_BAR.length - 4))]); }
}
/* --- le danseur Thriller (réglé par l'administrateur) : dès que passe un Thriller, il arrive au milieu de la piste et le danse ; il repart ensuite --- */
const DANSEUR = -4, ZOMBIE = -5, MARIEE = -6;
function animerDanseur() {
  if (!M || !M.L || M.lieu !== "fetes" || !M.L.pisteCentre) return;
  const air = M.djJoue && /thriller/.test(M.djTitre || ""), p = M.gens.get(DANSEUR);
  if (air && !p) { const [x, z] = placeScene(0, -.7); M.trioPret = false;
    // le danseur au milieu, le zombie à sa gauche, la mariée à sa droite (vus depuis la salle)
    for (const [num, id, dx, def, tete] of [[DANSEUR, 4, 0, { nom: "Le danseur Thriller", tenue: "thriller", couleur: "#c8102e", bas: "#c8102e", pieds: "#111111" }, "images/danseur-tete.png"],
        [ZOMBIE, 5, -1.7, { nom: "Le zombie", tenue: "zombie", couleur: "#5d6168", bas: "#4a4d52", pieds: "#2a2522" }, "images/zombie-tete.png"],
        [MARIEE, 6, 1.7, { nom: "La mariée", tenue: "mariee", couleur: "#f4f1ea", bas: null, pieds: "#e8e4da" }, "images/mariee-tete.png"]]) {
      const P = (M.ctx.pnjTrio && M.ctx.pnjTrio(id)) || {};
      const q = ajouterAncien({ numero: num, nom: P.nom || def.nom, tenue: P.tenue || def.tenue, couleur: P.couleur || def.couleur, bas: P.bas || def.bas, pieds: P.pieds || def.pieds,
        reglage: P.reglage || null, initiales: "♪", teteUrl: P.tete_v ? M.ctx.urlTetePNJ(P.tete_v, id) : tete, pnj: true, danseur: true, x: x + dx, z: z - Math.abs(dx) * .3 });
      if (q) q.info.danse = "thriller"; }
  }
  else if (!air && p) { for (const n of [DANSEUR, ZOMBIE, MARIEE]) retirerAncien(n); M.trioPret = false; }
  else if (p) { const trio = [DANSEUR, ZOMBIE, MARIEE].map(n => M.gens.get(n)).filter(Boolean);
    for (const q of trio) { q.info.danse = "thriller"; if (!q.cible && !q.base) q.base = [q.g.position.x, q.g.position.z]; }
    // on attend que les trois soient arrivés à leur place, puis on part ensemble sur le premier temps de la chorégraphie
    if (!M.trioPret && trio.every(q => q.base) && choreThriller().k === 0) M.trioPret = true;
    if (M.trioPret) { const c = choreThriller();
      for (const q of trio) if (q.base) { const nx = q.base[0] + c.ox, nz = q.base[1] + c.oz; if (okScene(nx, nz)) { q.g.position.x = nx; q.g.position.z = nz; } }
    } }
}
/* la chorégraphie du clip Thriller, sur 32 temps, pour les trois danseurs ensemble ;
   réglée sur l'horloge (Date.now) : tout le monde voit les mêmes pas au même moment
   1-8   la marche des zombies : on avance vers la salle en traînant les pieds, les griffes d'un côté puis de l'autre
   9-16  les griffes : tournés à gauche (2 temps), à droite (2 temps), deux fois, la tête et les épaules qui cognent
   17-24 le pas chassé : quatre pas sautés vers la gauche, puis quatre pour revenir
   25-28 les bras au ciel, qui tremblent, en sautillant
   29-32 on recule à sa place, en griffes */
const TEMPS_THRILLER = 400;
function choreThriller() {
  const ph = Date.now() / TEMPS_THRILLER, k = Math.floor(ph) % 32, v = ph % 1, coup = Math.sin(Math.min(1, v * 2.5) * Math.PI / 2), AV = 1.6;
  let pose, ox = 0, oz = AV, rot = 0, sx = 0, saut = 0;
  if (k < 8) { pose = k % 2 ? "thriller2" : "thriller1"; oz = (k + Math.min(1, v * 1.6)) / 8 * AV; rot = (k % 2 ? .08 : -.08) * coup; saut = v < .25 ? .05 * (1 - v / .25) : 0; }
  else if (k < 16) { const sg = Math.floor((k - 8) / 2) % 2 ? 1 : -1; pose = sg > 0 ? "profilD" : "profil"; rot = -sg * .1 * coup; sx = sg * .14 * coup; saut = v < .2 ? .04 * (1 - v / .2) : 0; }
  else if (k < 24) { const g = k < 20, f = ((k - 16) % 4 + Math.min(1, v * 1.5)) / 4; pose = g ? "profil" : "profilD"; ox = g ? -.8 * f : -.8 * (1 - f); rot = g ? .06 : -.06; saut = Math.sin(Math.min(1, v * 1.5) * Math.PI) * .08; }
  else if (k < 28) { pose = "thriller3"; rot = Math.sin(ph * Math.PI * 2) * .08; saut = Math.abs(Math.sin(ph * Math.PI)) * .08; }
  else { pose = k % 2 ? "thriller2" : "thriller1"; oz = AV * (1 - (k - 28 + Math.min(1, v * 1.6)) / 4); rot = (k % 2 ? .05 : -.05) * coup; }
  return { k, pose, ox, oz, rot, sx, saut };
}
/* les chanteurs et les danseurs se produisent sur la scène, au fond de la salle (devant le groupe) */
function placeScene(dx, dz) { const S = M.L.scene; if (S) return [S.centre[0] + dx, S.centre[1] + dz]; const [x, z] = M.L.pisteCentre; return [x + dx, z + dz + 3]; }
function okScene(x, z) { const S = M.L.scene; return S ? x > S.x0 + .3 && x < S.x1 - .3 && z > S.z0 + .3 && z < S.z1 - .12 : M.L.limites(x, z); }
/* --- le groupe de la scène (réglé par l'administrateur) : la batteuse au fond, au centre, derrière sa batterie ;
   le bassiste à gauche, le guitariste à droite. Ils sont toujours là ; quand la musique passe, ils jouent --- */
const GROUPE = [[-18, 18, "batterie", "La batteuse", "batteuse", "#121214", "#141416", "#1a1a1a"], [-19, 19, "basse", "Le bassiste", "bassiste", "#2c2e31", "#151517", "#1a1a1a"], [-20, 20, "guitare", "Le guitariste", "guitariste", "#151517", "#151517", "#0e0e0e"]];
// Depeche Mode : dès qu'une de leurs chansons passe, ils prennent la scène (le groupe habituel s'efface) : Dave Gahan au micro, devant ;
// Martin Gore à la guitare, à gauche ; Andy Fletcher aux claviers, au fond
const AIR_DM = /depeche|enjoy the silence|personal jesus|just cant get enough|people are people|never let me down|policy of truth|strangelove|walking in my shoes|i feel you|world in my eyes|everything counts|master and servant|behind the wheel|its no good|barrel of a gun|shake the disease|question of time|question of lust|black celebration|ghosts again/;
const DM = [[-27, 27, "dmguitare", "Martin Gore", "gore", "#111113", "#141416", "#0e0e0e", -2.2, 2.2], [-28, 28, "chant", "Dave Gahan", "gahan", "#1a1a1d", "#121214", "#0e0e0e", 0, 3.18], [-29, 29, "clavier", "Andy Fletcher", "fletcher", "#141416", "#141416", "#0e0e0e", 1.8, 1.5]];
function animerGroupe() {
  if (!M || !M.L || M.lieu !== "fetes" || !M.L.scene) return;
  const dm = !!(M.djJoue && AIR_DM.test(M.djTitre || ""));
  if (M.L.kit) M.L.kit.visible = !dm; if (M.L.claviers) M.L.claviers.visible = dm; if (M.L.micDM) M.L.micDM.visible = dm;
  for (const [num, id, place, nom, tenue, couleur, bas, pieds, dx, dz] of DM) { let p = M.gens.get(num);
    if (!dm) { if (p) retirerAncien(num); continue; }
    if (!p) { const P = (M.ctx.pnjTrio && M.ctx.pnjTrio(id)) || {}, S = M.L.scene, x = S.centre[0] + dx, z = S.z0 + dz;
      p = ajouterAncien({ numero: num, nom: P.nom || nom, tenue: P.tenue || tenue, couleur: P.couleur || couleur, bas: P.bas || bas, pieds: P.pieds || pieds, reglage: P.reglage || null, initiales: "♪",
        teteUrl: P.tete_v ? M.ctx.urlTetePNJ(P.tete_v, id) : `images/dm/${tenue}-tete.png`, pnj: true, danseur: true, musicien: place, x, z }); if (!p) continue; p.base = [x, z]; }
    p.info.danse = place === "dmguitare" ? "guitare" : place; p.info.enMusique = true;
    if (place === "dmguitare") { const t2 = performance.now() / 1000, nx = p.base[0] + Math.sin(t2 * .5) * .4, nz = p.base[1] + Math.sin(t2 * .37 + 1) * .25; if (okScene(nx, nz)) { p.g.position.x = nx; p.g.position.z = nz; } }
    if (place === "chant") { const t2 = performance.now() / 1000, nx = p.base[0] + Math.sin(t2 * .3) * .35; if (okScene(nx, p.base[1])) p.g.position.x = nx; if (M.L.micDM) M.L.micDM.position.x = p.g.position.x; } }
  if (dm) { for (const [num] of GROUPE) if (M.gens.has(num)) retirerAncien(num); }
  else for (const [num, id, place, nom, tenue, couleur, bas, pieds] of GROUPE) { let p = M.gens.get(num);
    if (!p) { const P = (M.ctx.pnjTrio && M.ctx.pnjTrio(id)) || {}, [x, z] = M.L.scene[place];
      p = ajouterAncien({ numero: num, nom: P.nom || nom, tenue: P.tenue || tenue, couleur: P.couleur || couleur, bas: P.bas || bas, pieds: P.pieds || pieds, reglage: P.reglage || null, initiales: "♪",
        teteUrl: P.tete_v ? M.ctx.urlTetePNJ(P.tete_v, id) : `images/${tenue}-tete.png`, pnj: true, danseur: true, musicien: place, x, z }); if (!p) continue; }
    p.info.danse = place === "batterie" ? "batterie" : "guitare"; p.info.enMusique = !!M.djJoue;
    // le bassiste et le guitariste bougent un peu en jouant : quelques pas de côté, en avant, en arrière, autour de leur place (puis ils y reviennent quand la musique s'arrête)
    if (place !== "batterie") { const [bx, bz] = M.L.scene[place], t2 = performance.now() / 1000, ph = place === "basse" ? 0 : 2.1, k = p.bouge = Math.max(0, Math.min(1, (p.bouge || 0) + (p.info.enMusique ? .01 : -.01)));
      const nx = bx + k * (Math.sin(t2 * .55 + ph) * .38 + Math.sin(t2 * 1.3 + ph) * .1), nz = bz + k * Math.sin(t2 * .4 + ph * 1.7) * .28;
      if (okScene(nx, nz)) { p.g.position.x = nx; p.g.position.z = nz; } } }
  // les projecteurs du bord de scène changent de couleur en rythme ; ceux qui sont sur scène prennent la teinte du projecteur le plus proche
  const S = M.L.scene, t = performance.now(), col = new THREE.Color(), blanc = new THREE.Color(0xffffff), PAL = [0xff2a3c, 0x2a6bff, 0x22e06a, 0xff2ad4, 0xffb020, 0x22d8ff];
  for (const f of M.L.feuxScene || []) { const i = (f.k + Math.floor(t / 1900)) % PAL.length, j = (i + 1) % PAL.length, u = Math.min(1, (t % 1900) / 500);
    f.col = (f.col || new THREE.Color()).setHex(PAL[i]).lerp(col.setHex(PAL[j]), u); f.verre.material.color.copy(f.col); f.cone.material.color.copy(f.col); }
  for (const p of M.gens.values()) { if (!p.corps || !p.info.pnj) continue; const x = p.g.position.x, z = p.g.position.z, dessus = x > S.x0 && x < S.x1 && z > S.z0 && z < S.z1;
    if (!dessus) { if (p.teinte) { p.corps.material.color.copy(blanc); p.teinte = false; } continue; }
    let best = null, bd = 1e9; for (const f of M.L.feuxScene || []) { const d = Math.abs(f.x - x); if (d < bd) { bd = d; best = f; } }
    if (best && best.col) { p.corps.material.color.copy(blanc).lerp(best.col, .3); p.teinte = true; } }
}
/* --- Robert Smith (réglé par l'administrateur) : dès que passe Just Like Heaven, il arrive au milieu de la piste avec sa guitare, devant son micro sur pied --- */
const SMITH = -16;
function animerSmith() {
  if (!M || !M.L || M.lieu !== "fetes" || !M.L.pisteCentre) return;
  const air = M.djJoue && /just like heaven|the cure|robert smith/.test(M.djTitre || ""), p = M.gens.get(SMITH), [x, z] = placeScene(0, -.15);
  if (air && !p) { const P = (M.ctx.pnjTrio && M.ctx.pnjTrio(16)) || {};
    const q = ajouterAncien({ numero: SMITH, nom: P.nom || "Robert Smith", tenue: P.tenue || "smith", couleur: P.couleur || "#141414", bas: P.bas || "#141414", pieds: P.pieds || "#1a1a1a",
      reglage: P.reglage || null, initiales: "♪", teteUrl: P.tete_v ? M.ctx.urlTetePNJ(P.tete_v, 16) : "images/smith-tete.png", pnj: true, danseur: true, smith: true, x, z });
    if (q) q.info.danse = "guitare";
    // le micro sur pied, devant lui (côté salle)
    if (!M.micro) { const g = new THREE.Group(), noir = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: .6, roughness: .4 }), H = tailleBonhomme();
      const pied = new THREE.Mesh(new THREE.CylinderGeometry(.018, .018, H * .66, 8), noir); pied.position.y = H * .33; g.add(pied);
      for (let k = 0; k < 3; k++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, .42, 6), noir); b.rotation.z = Math.PI / 2 - .5; b.rotation.y = k * 2.09; b.position.y = .1; b.position.x = Math.cos(k * 2.09) * .16; b.position.z = -Math.sin(k * 2.09) * .16; g.add(b); }
      const perche = new THREE.Mesh(new THREE.CylinderGeometry(.013, .013, .4, 6), noir); perche.rotation.x = -1.1; perche.position.set(0, H * .66 + .08, -.17); g.add(perche);
      const tete = new THREE.Mesh(new THREE.SphereGeometry(.045, 10, 8), new THREE.MeshStandardMaterial({ color: 0x8a8a8a, metalness: .8, roughness: .3 })); tete.position.set(0, H * .66 + .16, -.34); g.add(tete);
      g.position.set(x, M.L.hauteur ? M.L.hauteur(x, z + .75) : 0, z + .75); M.scene.add(g); M.micro = g; } }
  else if (!air && p) { retirerAncien(SMITH); if (M.micro) { M.scene.remove(M.micro); M.micro = null; } }
  else if (p) { p.info.danse = "guitare"; if (M.micro && !p.cible) M.micro.position.set(p.g.position.x, p.g.position.y, p.g.position.z + .75); }
}
/* --- Mr Hernandez (réglé par l'administrateur) : dès que passe Born to Be Alive, il arrive au milieu de la piste avec sa canne et danse comme dans le clip --- */
const HERNANDEZ = -7, TEMPS_ALIVE = 460;
/* --- les Bee Gees (réglés par l'administrateur) : dès que passe une de leurs chansons, Robin, Barry et Maurice arrivent au milieu de la piste, côte à côte, et dansent ensemble --- */
const TRAVOLTA = -11;
const BEEGEES = [[-8, 8, -1.6, "Robin Gibb", "robin"], [-9, 9, 0, "Barry Gibb", "barry"], [-10, 10, 1.6, "Maurice Gibb", "maurice"]], TEMPS_DISCO = 560;
const AIR_BEEGEES = /bee ?gees?|gibb|stayin|night fever|tragedy|jive talkin|how deep is your love|more than a woman|you should be dancing|too much heaven|massachusetts|nights on broadway|you win again|to love somebody|i started a joke|how can you mend|lonely days|spicks and specks|love you inside out|fanny be tender|boogie child|still waters/;
/* le titre d'une musique, rendu facile à reconnaître : minuscules, sans accents, tirets, soulignés ni apostrophes (« Bee_Gees - Stayin'_Alive.mp3 » → « bee gees stayin alive mp3 ») */
function normTitre(t) { return String(t).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/['’`]/g, "").replace(/[^a-z0-9]+/g, " ").trim(); }
function animerBeeGees() {
  if (!M || !M.L || M.lieu !== "fetes" || !M.L.pisteCentre) return;
  const air = M.djJoue && AIR_BEEGEES.test(M.djTitre || ""), present = M.gens.get(-9);
  if (air && !present) { const [x, z] = placeScene(0, -.45); M.beeGeesPrets = false;
    for (const [num, id, dx, nom, cle] of BEEGEES) { const P = (M.ctx.pnjTrio && M.ctx.pnjTrio(id)) || {};
      const q = ajouterAncien({ numero: num, nom: P.nom || nom, tenue: P.tenue || "beegees", couleur: P.couleur || "#c9b27c", bas: P.bas || "#c9b27c", pieds: P.pieds || "#b89a5a",
        reglage: P.reglage || null, initiales: "♪", teteUrl: P.tete_v ? M.ctx.urlTetePNJ(P.tete_v, id) : `images/beegees-${cle}-tete.png`, pnj: true, danseur: true, x: x + dx, z: z + (dx ? 0 : .3) });
      if (q) q.info.danse = "beegees"; }
    // et, un peu devant eux, tout seul : John Travolta
    { const P = (M.ctx.pnjTrio && M.ctx.pnjTrio(11)) || {};
      const q = ajouterAncien({ numero: TRAVOLTA, nom: P.nom || "John Travolta", tenue: P.tenue || "travolta", couleur: P.couleur || "#f4f1ea", bas: P.bas || "#f4f1ea", pieds: P.pieds || "#1a1a1a",
        reglage: P.reglage || null, initiales: "♪", teteUrl: P.tete_v ? M.ctx.urlTetePNJ(P.tete_v, 11) : "images/travolta-tete.png", pnj: true, danseur: true, x, z: z + 1.25 });
      if (q) q.info.danse = "travolta"; }
  }
  else if (!air && present) { for (const [num] of BEEGEES) retirerAncien(num); retirerAncien(TRAVOLTA); M.beeGeesPrets = false; }
  else if (present) { const freres = BEEGEES.map(([num]) => M.gens.get(num)).filter(Boolean);
    for (const q of freres) { q.info.danse = "beegees"; if (!q.cible && !q.base) q.base = [q.g.position.x, q.g.position.z]; }
    // on part tous les trois ensemble, sur le premier temps
    if (!M.beeGeesPrets && freres.every(q => q.base) && choreBeeGees().k === 0) M.beeGeesPrets = true;
    if (M.beeGeesPrets) { const c = choreBeeGees();
      for (const q of freres) { const nx = q.base[0] + c.ox; if (okScene(nx, q.base[1])) q.g.position.x = nx; }
      const tv = M.gens.get(TRAVOLTA);
      if (tv) { tv.info.danse = "travolta"; if (!tv.cible && !tv.base) tv.base = [tv.g.position.x, tv.g.position.z];
        if (tv.base) { const ct = choreTravolta(), nx = tv.base[0] + ct.ox; if (okScene(nx, tv.base[1])) tv.g.position.x = nx; } }
    } }
}
/* la chorégraphie disco des Bee Gees, sur 16 temps (réglée sur l'horloge : tout le monde la voit au même moment)
   1-4   le doigt pointé vers le ciel puis vers le sol, façon Saturday Night Fever, en roulant des hanches
   5-8   quatre pas chassés vers la droite, en frappant dans les mains
   9-12  quatre pas pour revenir, bras à mi-hauteur
   13-14 les bras en l'air, on se déhanche
   15-16 un tour complet sur soi-même */
function choreBeeGees() {
  const ph = Date.now() / TEMPS_DISCO, k = Math.floor(ph) % 16, v = ph % 1, f = Math.min(1, v * 1.6);
  let pose, ox = 0, rot = 0, sx = 0, saut = 0, tour = 1;
  if (k < 4) { const haut = k % 2 === 0, coup = Math.sin(Math.min(1, v * 3) * Math.PI / 2); pose = haut ? "disco1" : "disco2"; rot = (haut ? -.1 : .12) * coup; sx = (haut ? -.08 : .1) * coup; saut = Math.abs(Math.sin(v * Math.PI)) * .04; }
  else if (k < 8) { pose = k % 2 ? "madison2" : "mi"; ox = .6 * (k - 4 + f) / 4; saut = Math.sin(f * Math.PI) * .06; rot = .05; }
  else if (k < 12) { pose = k % 2 ? "repos" : "mi"; ox = .6 * (1 - (k - 8 + f) / 4); saut = Math.sin(f * Math.PI) * .06; rot = -.05; }
  else if (k < 14) { const m = Math.sin(ph * Math.PI); pose = "haut"; rot = m * .1; sx = m * .12; saut = Math.abs(m) * .03; }
  else { const cs = Math.cos(((k - 14) + v) / 2 * Math.PI * 2); pose = cs < 0 ? "dos" : "disco1"; tour = Math.max(.08, Math.abs(cs)); }
  return { k, pose, ox, rot, sx, saut, tour };
}
/* la danse de John Travolta dans Saturday Night Fever, sur 16 temps, au même tempo que les Bee Gees (mais ses propres pas)
   1-4   le célèbre doigt pointé : vers le ciel en diagonale, puis vers le sol, en roulant fort des hanches
   5-8   la marche chaloupée : jambe tendue sur le côté, deux pas vers la gauche, puis deux pour revenir
   9-10  les coups de genou, d'un côté puis de l'autre
   11-12 les bras levés, les hanches qui tournent
   13-14 la pose du film : un bras pointé vers le ciel, les jambes écartées, penché
   15-16 un tour complet sur lui-même, avec ses frères */
function choreTravolta() {
  const ph = Date.now() / TEMPS_DISCO, k = Math.floor(ph) % 16, v = ph % 1, f = Math.min(1, v * 1.6), coup = Math.sin(Math.min(1, v * 3) * Math.PI / 2);
  let pose, ox = 0, rot = 0, sx = 0, saut = 0, tour = 1;
  if (k < 4) { const ht = k % 2 === 0; pose = ht ? "disco1" : "disco2"; rot = (ht ? -.16 : .16) * coup; sx = (ht ? -.12 : .12) * coup; saut = Math.abs(Math.sin(v * Math.PI)) * .05; }
  else if (k < 8) { const aller = k < 6; pose = aller ? "madison1" : "madison3"; ox = aller ? -.6 * (k - 4 + f) / 2 : -.6 * (1 - (k - 6 + f) / 2); rot = (aller ? .08 : -.08) * Math.sin(v * Math.PI); saut = Math.sin(f * Math.PI) * .05; }
  else if (k < 10) { pose = k === 8 ? "profil" : "profilD"; saut = v < .3 ? .08 * Math.sin(v / .3 * Math.PI) : 0; rot = k === 8 ? .08 : -.08; }
  else if (k < 12) { const m = Math.sin(ph * Math.PI * 2); pose = "haut"; rot = m * .12; sx = m * .14; }
  else if (k < 14) { pose = "disco1"; rot = -.2 + Math.sin(v * Math.PI) * .03; sx = -.1; saut = Math.abs(Math.sin(v * Math.PI)) * .02; }
  else { const cs = Math.cos(((k - 14) + v) / 2 * Math.PI * 2); pose = cs < 0 ? "dos" : "disco1"; tour = Math.max(.08, Math.abs(cs)); }
  return { k, pose, ox, rot, sx, saut, tour };
}
function animerHernandez() {
  if (!M || !M.L || M.lieu !== "fetes" || !M.L.pisteCentre) return;
  const air = M.djJoue && /born to be alive|hernandez/.test(M.djTitre || ""), p = M.gens.get(HERNANDEZ);
  if (air && !p) { const [x, z] = placeScene(0, .25), P = (M.ctx.pnjTrio && M.ctx.pnjTrio(7)) || {};
    const q = ajouterAncien({ numero: HERNANDEZ, nom: P.nom || "Mr Hernandez", tenue: P.tenue || "hernandez", couleur: P.couleur || "#161616", bas: P.bas || "#161616", pieds: P.pieds || "#f2f2f2",
      reglage: P.reglage || null, initiales: "♪", teteUrl: P.tete_v ? M.ctx.urlTetePNJ(P.tete_v, 7) : "images/hernandez-tete.png", pnj: true, danseur: true, hernandez: true, x, z });
    if (q) q.info.danse = "alive";
  }
  else if (!air && p) retirerAncien(HERNANDEZ);
  else if (p) { p.info.danse = "alive";
    if (!p.cible && !p.base) p.base = [p.g.position.x, p.g.position.z];
    if (p.base) { const c = choreAlive(), nx = p.base[0] + c.ox; if (okScene(nx, p.base[1])) p.g.position.x = nx;
    } }
}
/* la danse du clip Born to Be Alive, sur 16 temps (réglée sur l'horloge : tout le monde la voit au même moment)
   1-4   la canne levée derrière la tête, l'autre main sur la hanche, on roule des hanches
   5-8   la canne pointée au loin : deux pas à gauche, puis on revient en la pointant de l'autre côté
   9-12  la canne plantée au sol, le bras en l'air, on rebondit sur les genoux
   13-14 la canne tenue à deux mains au-dessus de la tête, en se déhanchant
   15-16 un tour complet sur soi-même */
function choreAlive() {
  const ph = Date.now() / TEMPS_ALIVE, k = Math.floor(ph) % 16, v = ph % 1, f = Math.min(1, v * 1.6);
  let pose, ox = 0, rot = 0, sx = 0, saut = 0, tour = 1;
  if (k < 4) { const sg = k % 2 ? 1 : -1, m = Math.sin(v * Math.PI); pose = "canne1"; rot = sg * .08 * m; sx = sg * .1 * m; saut = m * .03; }
  else if (k < 6) { pose = "canne3"; ox = -.5 * (k - 4 + f) / 2; saut = Math.sin(f * Math.PI) * .06; rot = .06; }
  else if (k < 8) { pose = "canne3D"; ox = -.5 * (1 - (k - 6 + f) / 2); saut = Math.sin(f * Math.PI) * .06; rot = -.06; }
  else if (k < 12) { pose = "canne4"; saut = Math.abs(Math.sin(ph * Math.PI)) * .07; rot = k % 2 ? -.05 : .05; }
  else if (k < 14) { const m = Math.sin(ph * Math.PI); pose = "canne2"; rot = m * .1; sx = m * .12; }
  else { const cs = Math.cos(((k - 14) + v) / 2 * Math.PI * 2); pose = cs < 0 ? "dos" : "canne1"; tour = Math.max(.08, Math.abs(cs)); }
  return { k, pose, ox, rot, sx, saut, tour };
}
function animerPNJ() {
  if (!M || !M.L) return;
  const ici = lieuPNJ() === M.lieu && !M.L.sansPNJ, p0 = M.gens.get(PNJ);
  if (!ici && p0) { retirerAncien(PNJ); return; }        // il est parti ailleurs
  if (ici && !p0) { ajouterPNJ(); return; }              // il arrive
  const p = p0; if (!p) return;
  const n = Math.floor(Date.now() / 9000);
  if (p.etape !== n) { p.etape = n; const [x, z] = pointPNJ(n); viser(p, x, z); }
  const h = hasard(Math.floor(Date.now() / 20000) * 1.9);
  // si la musique qui passe est un Madison (ou un Charleston, ou du disco), il la danse tout du long
  const air = M.lieu === "fetes" && M.djJoue ? (/madison/.test(M.djTitre) ? "madison" : /thriller|jackson/.test(M.djTitre) ? "thriller" : /charleston/.test(M.djTitre) ? "charleston" : /disco|bee ?gees|travolta|stayin|night fever/.test(M.djTitre) ? "disco" : null) : null;
  p.info.danse = air || (M.lieu === "fetes" && h < .55 && (h < .12 ? "disco" : h < .24 ? "charleston" : h < .36 ? "madison" : h < .44 ? "thriller" : "balance"));
  const b = Math.floor(Date.now() / 17000);
  if (p.parole !== b) { p.parole = b; if (p.parole !== undefined && hasard(b * 9.7 + (M.lieu === "fetes" ? 5 : 0)) < .45) dire(PNJ, phrasePNJ(b * 3.3)); }
  // il salue celui qui s'approche de lui (pas plus d'une fois par minute et demie)
  const moi = M.moiNum && M.gens.get(M.moiNum);
  if (moi && moi.g.position.distanceTo(p.g.position) < 2.6 && (!p.salue || Date.now() - p.salue > 90000)) {
    p.salue = Date.now(); const nom = (M.ctx.moiInfo && M.ctx.moiInfo().nom) || "mon gars";
    dire(PNJ, PHRASES.salut[Math.floor(Math.random() * PHRASES.salut.length)].replace("%s", nom)); }
}

/* --- ce qu'on peut faire là où l'on est : s'asseoir au bar, se relever, inviter quelqu'un à danser un slow, l'arrêter --- */
function chercherAction(t) {
  if (!M || (M.actionT && t - M.actionT < 300)) return; M.actionT = t;
  const moi = M.moiNum && M.gens.get(M.moiNum); let a = null;
  if (moi) {
    const x = moi.g.position.x, z = moi.g.position.z;
    if (Number.isInteger(moi.info.assis)) a = { type: "lever", label: "🧍 Se relever" };
    else if (moi.info.slow) a = { type: "finslow", label: "💔 Arrêter le slow" };
    else if (M.cine) a = null;
    else if (M.L.hv && M.L.delorean && M.L.delorean.visible && Math.hypot(x - M.L.posDelorean[0], z - M.L.posDelorean[1]) < 3) a = { type: "rentrer2026", label: "⚡ Rentrer en 2026 avec Doc" };
    else if (M.almMesh && M.almMesh.visible && Math.hypot(x - M.alm.x, z - M.alm.z) < Math.max(.55, (M.alm.taille || .3) * .9)) a = { type: "almanach", label: "📕 Ramasser" };
    else if (!moi.cible) {
      const pris = new Set([...M.gens.values()].filter(p => Number.isInteger(p.info.assis)).map(p => p.info.assis));
      const i = (M.L.tabourets || []).findIndex(([a2, b], k) => !pris.has(k) && Math.hypot(x - a2, z - b) < 1.1);
      const ot = M.L.apo && !APO.zombieFin && (M.objets || []).filter(q => q.table && !q.cache && Math.hypot(q.x - x, q.z - z) < 1.3).sort((p, q) => Math.hypot(p.x - x, p.z - z) - Math.hypot(q.x - x, q.z - z))[0];   // (sur le comptoir du bar, monde apocalyptique)
      if (ot) a = { type: "prendre", id: ot.id, label: ot.type === "plante" ? "🌿 Prendre la plante" : "🔫 Prendre les munitions" };
      else if (M.L.console && Math.hypot(x - M.L.console[0], z - M.L.console[1]) < 1.2) a = { type: "console", label: "🎮 Jouer à la console" };
      else if (M.L.flechettes && Math.hypot(x - M.L.flechettes[0], z - M.L.flechettes[1]) < 1.1) a = { type: "flechettes", label: "🎯 Jouer aux fléchettes" };
      else if (M.L.flipper && Math.hypot(x - M.L.flipper[0], z - M.L.flipper[1]) < 2) a = { type: "flipper", label: "🎰 Jouer au flipper" };
      else if (i >= 0) a = { type: "asseoir", i, label: "🪑 S'asseoir au bar" };
      else if (M.L.apo) {}
      else { let best = null, bd = 1.9;
        for (const p of M.gens.values()) { if (p.moi || p.info.pnj || p.info.numero < 0 || p.info.slow || Number.isInteger(p.info.assis)) continue;
          const d = Math.hypot(p.g.position.x - x, p.g.position.z - z); if (d < bd) { bd = d; best = p; } }
        if (best) a = { type: "slow", numero: best.info.numero, label: `💞 Danser un slow avec ${best.info.nom}` }; }
    }
  }
  const cle = a ? a.type + (a.i ?? "") + (a.numero ?? "") + (a.id ?? "") : "";
  if (cle !== M.actionCle) { M.actionCle = cle; M.action = a; M.ctx.surAction && M.ctx.surAction(a); }
}
function asseoir(p, i) {
  const tb = M.L.tabourets && M.L.tabourets[i]; if (!tb) return;
  p.info.assis = i; p.cible = null; p.chemin = []; p.info.danse = false; p.g.position.set(tb[0], 0, tb[1]);
}
export function agir() {
  const a = M && M.action, moi = M && M.moiNum && M.gens.get(M.moiNum); if (!a || !moi) return;
  if (a.type === "asseoir") { if (moi.info.danse) danser(false); const [x, z] = M.L.tabourets[a.i]; envoyerWS({ t: "aller", x, z }); asseoir(moi, a.i); envoyerWS({ t: "assis", i: a.i }); }
  else if (a.type === "lever") { moi.info.assis = null; envoyerWS({ t: "assis", i: null });
    // on se lève à côté du tabouret, là où l'on peut marcher (jamais coincé contre le comptoir ou les tabourets)
    const [fx, fz] = viserLibre(moi.g.position.x, moi.g.position.z); moi.g.position.x = fx; moi.g.position.z = fz; moi.cible = null; moi.chemin = []; envoyerWS({ t: "aller", x: fx, z: fz }); }
  else if (a.type === "slow") { envoyerWS({ t: "slow_demande", a: a.numero }); M.ctx.surInfo && M.ctx.surInfo("💞 Invitation envoyée… on attend sa réponse."); }
  else if (a.type === "finslow") envoyerWS({ t: "slow_fin" });
  else if (a.type === "almanach") envoyerWS({ t: "almanach_prendre" });
  else if (a.type === "rentrer2026") cineRetour();
  else if (a.type === "console") M.ctx.surConsole && M.ctx.surConsole();
  else if (a.type === "flipper") M.ctx.surFlipper && M.ctx.surFlipper();
  else if (a.type === "flechettes") M.ctx.surFlechettes && M.ctx.surFlechettes();
  else if (a.type === "prendre") { const o = (M.objets || []).find(q => q.id === a.id && !q.cache); if (o) {
      if (o.type === "plante" && APO.vies >= 4) M.ctx.surInfo && M.ctx.surInfo("🌿 Tu as déjà toutes tes vies : garde-la pour plus tard.");
      else if (o.type === "balles" && APO.balles >= 9) M.ctx.surInfo && M.ctx.surInfo("🔫 Ton chargeur est déjà plein.");
      else prendreObjet(o); } }
  M.actionT = 0;
}
export function repondreSlow(de, oui) { envoyerWS({ t: "slow_reponse", de, oui: !!oui }); }

/* --- déplacements --- */
// aller vers (x, z) : si le lieu impose un passage (le portillon de la grille, dans la rue), on fait le détour
function ligneLibre(L, x0, z0, x1, z1) {
  const d = Math.hypot(x1 - x0, z1 - z0), n = Math.ceil(d / .06);
  for (let i = 1; i <= n; i++) if (!L.limites(x0 + (x1 - x0) * i / n, z0 + (z1 - z0) * i / n)) return false;
  return true;
}
function itineraire(L, x0, z0, x1, z1) {
  if (ligneLibre(L, x0, z0, x1, z1) || !L.zone) return [[x1, z1]];
  const P = .35, [ax, bx, az, bz] = L.zone, nx = Math.ceil((bx - ax) / P) + 1, nz = Math.ceil((bz - az) / P) + 1;
  if (!L.grille) { L.grille = new Uint8Array(nx * nz); for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) L.grille[j * nx + i] = L.limites(ax + i * P, az + j * P) ? 1 : 0; }
  const G = L.grille, cx = i => ax + i * P, cz = j => az + j * P;
  const proche = (x, z) => { let best = -1, bd = 1e9; const i0 = Math.round((x - ax) / P), j0 = Math.round((z - az) / P);
    for (let r = 0; r < 12 && best < 0; r++) for (let i = i0 - r; i <= i0 + r; i++) for (let j = j0 - r; j <= j0 + r; j++) {
      if (i < 0 || j < 0 || i >= nx || j >= nz || !G[j * nx + i]) continue; const dd = Math.hypot(cx(i) - x, cz(j) - z); if (dd < bd) { bd = dd; best = j * nx + i; } }
    return best; };
  const s = proche(x0, z0), g = proche(x1, z1); if (s < 0 || g < 0) return [[x1, z1]];
  // A* (tas binaire)
  const cout = new Float32Array(nx * nz).fill(Infinity), de = new Int32Array(nx * nz).fill(-1), tas = [], h = k => Math.hypot(k % nx - g % nx, ((k / nx) | 0) - ((g / nx) | 0));
  const pousser = (k, f) => { tas.push([f, k]); let i = tas.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (tas[p][0] <= tas[i][0]) break; [tas[p], tas[i]] = [tas[i], tas[p]]; i = p; } };
  const tirer = () => { const r = tas[0], d = tas.pop(); if (tas.length) { tas[0] = d; let i = 0; for (;;) { const a = 2 * i + 1, b = a + 1; let m = i;
    if (a < tas.length && tas[a][0] < tas[m][0]) m = a; if (b < tas.length && tas[b][0] < tas[m][0]) m = b; if (m === i) break; [tas[m], tas[i]] = [tas[i], tas[m]]; i = m; } } return r; };
  cout[s] = 0; pousser(s, h(s));
  while (tas.length) { const [, k] = tirer(); if (k === g) break; const i = k % nx, j = (k / nx) | 0;
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) { const a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= nx || b >= nz) continue;
      const n = b * nx + a; if (!G[n]) continue; if (di && dj && (!G[j * nx + a] || !G[b * nx + i])) continue;
      const c = cout[k] + (di && dj ? 1.414 : 1); if (c < cout[n]) { cout[n] = c; de[n] = k; pousser(n, c + h(n)); } } }
  if (de[g] < 0 && g !== s) return [];   // pas de chemin : on ne bouge pas
  const pts = []; for (let k = g; k !== s && k >= 0; k = de[k]) pts.unshift([cx(k % nx), cz((k / nx) | 0)]);
  pts.push([x1, z1]);
  // on lisse : on file tout droit vers le point le plus loin qu'on voit
  const out = []; let px = x0, pz = z0, i = 0;
  while (i < pts.length) { let j = pts.length - 1; while (j > i && !ligneLibre(L, px, pz, pts[j][0], pts[j][1])) j--; out.push(pts[j]); [px, pz] = pts[j]; i = j + 1; }
  return out;
}
// le point libre le plus proche (pour ne pas se placer dans une table)
function viserLibre(x, z) { if (M.L.limites(x, z)) return [x, z]; for (let k = 1; k <= 20; k++) for (let a = 0; a < 12; a++) { const tx = x + Math.cos(a / 12 * Math.PI * 2) * k * .15, tz = z + Math.sin(a / 12 * Math.PI * 2) * k * .15; if (M.L.limites(tx, tz)) return [tx, tz]; } return [x, z]; }
function viser(p, x, z) {
  const pts = itineraire(M.L, p.g.position.x, p.g.position.z, x, z);
  if (!pts.length) { p.cible = null; p.chemin = []; return; }
  const v = pts.map(([a, b]) => new THREE.Vector3(a, 0, b)); p.cible = v.shift(); p.chemin = v;
}
function allerVers(x, z, envoyer) {
  if (M && M.cine) return;
  const moi = M.moiNum && M.gens.get(M.moiNum); if (!moi || (M.L && M.L.apo && APO.zombieFin)) return; moi.rapide = false;
  // on reste dans la cour : si le point est hors limites, on va au bord le plus proche
  let px = x, pz = z;
  if (!M.L.limites(px, pz)) { let best = null; for (let k = 1; k <= 30 && !best; k++) for (let a = 0; a < 16; a++) { const tx = x + Math.cos(a / 16 * Math.PI * 2) * k * .4, tz = z + Math.sin(a / 16 * Math.PI * 2) * k * .4; if (M.L.limites(tx, tz)) { best = [tx, tz]; break; } }
    // sinon (on a touché un mur, le porche…) : on marche dans cette direction aussi loin que possible
    if (!best) { const ox = moi.g.position.x, oz = moi.g.position.z, d = Math.hypot(x - ox, z - oz);
      for (let t = .25; t <= d; t += .25) { const tx = ox + (x - ox) * t / d, tz = oz + (z - oz) * t / d; if (!M.L.limites(tx, tz)) break; best = [tx, tz]; } }
    if (!best) return; [px, pz] = best; }
  viser(moi, px, pz); M.repere.position.set(px, .04 + (M.L.hauteur ? M.L.hauteur(px, pz) : 0), pz); M.repere.material.opacity = 1;
  if (envoyer) envoyerWS({ t: "aller", x: px, z: pz });
  if (envoyer && moi.info.danse) danser(false);
  if (envoyer && Number.isInteger(moi.info.assis)) { moi.info.assis = null; envoyerWS({ t: "assis", i: null }); }
  if (envoyer && moi.info.slow) envoyerWS({ t: "slow_fin" });
}
function changerLieu(id, arrivee, yaw = 0) {
  if (!M) return;
  if (estApo(M.lieu) && !estApo(id)) couperSonsApo();
  for (const n of [...M.gens.keys()]) retirerAncien(n);
  // le lieu a peut-être été préparé à l'avance (on s'approchait de sa porte) : le passage est alors immédiat
  const pret = M.prets && M.prets[id]; if (M.prets) for (const [k, q] of Object.entries(M.prets)) if (k !== id && q) q.scene.traverse(o => { o.geometry && o.geometry.dispose(); });
  M.prets = {}; M.prepT = performance.now() + 1500;
  if (M.cine) finCine();
  const { scene, L, repere } = pret || construireScene(id);
  M.scene && M.scene.traverse(o => { o.geometry && o.geometry.dispose(); });
  if (estApo(id) && !estApo(M.lieu)) { APO.balles = 9; APO.vies = 4; APO.zombieFin = 0; M.zKills = 0; for (const e of M.equipe || []) { e.vies = 4; e.mort = false; } }
  M.chefZ = null;
  M.micro = null;
  M.verresBar = new Map(); M.scene = scene; M.L = L; M.repere = repere; M.lieu = id; M.camVise = null; M.passage = false; M.yaw = yaw; M.camE = M.camD = null;
  const [x, z] = arrivee || L.depart;
  M.posEntree = [x, z];
  envoyerWS({ t: "entrer", lieu: id, x, z });
  M.ctx.surLieu && M.ctx.surLieu(id);
  majAmbiance();
  M.almMesh = null; majAlmanach();
  if (id === "bttf-cour") cineCour();
  if (id === "hv1955" && M.arriveeHV) { M.arriveeHV = false; cineHV(); }
}
// on : false pour s'arrêter, "balance" (balancé, bras levés), "disco" (façon Travolta), "charleston" (mains sur les genoux) ou "madison"
const styleDanse = v => ["disco", "charleston", "madison", "thriller", "saut"].includes(v) ? v : v ? "balance" : false;
export function danser(on) {
  const p = M && M.moiNum && M.gens.get(M.moiNum); if (!p) return;
  const style = styleDanse(on); if (style) M.styleDanse = style;
  p.info.danse = style; envoyerWS({ t: "danse", on: style }); M.ctx.surDanse && M.ctx.surDanse(style);
}
export function tourner(a = Math.PI) { if (M && M.L && (M.L.interieur || M.L.suivi)) M.yaw = (M.yaw || 0) + a; }
/* passer d'un lieu à l'autre sans coupure : les deux lieux ont la même géométrie à cet endroit (décalée de d) ;
   on garde sa position, son regard, la caméra, et l'on continue de marcher vers le même point */
function changerLieuContinu(id, [dx, dz, dy = 0]) {
  const moi = M.moiNum && M.gens.get(M.moiNum); if (!moi) { changerLieu(id); return; }
  const info = moi.info, x = moi.g.position.x + dx, z = moi.g.position.z + dz;
  const but = moi.chemin && moi.chemin.length ? moi.chemin[moi.chemin.length - 1] : moi.cible, fin = but ? [but.x + dx, but.z + dz] : null;
  const yaw = M.yaw, E = M.camE, D = M.camD, num = M.moiNum, d3 = new THREE.Vector3(dx, dy, dz), vise = M.camVise && M.camVise.clone().add(d3);
  changerLieu(id, [x, z], yaw);
  M.camE = E; M.camD = D; M.moiNum = num;
  ajouterAncien({ ...info, numero: num, x, z }); M.gens.get(num).moi = true;
  M.gens.get(num).g.position.y = M.L.hauteur ? M.L.hauteur(x, z) : 0;
  M.camera.position.add(d3); if (vise) M.camVise = vise; else placerCamera(true);
  if (fin) allerVers(fin[0], fin[1], true);
}

/* ===================== Retour vers le futur =====================
   L'Almanach des sports traîne quelque part dans la caserne (un seul, placé par le serveur, jamais deux fois au même endroit).
   Qui marche dessus peut le ramasser : il quitte la Matrice des autres, la DeLorean de Doc vient le chercher dans une cour d'honneur
   rien qu'à lui, fonce en laissant deux traînées de feu… et le dépose à Hill Valley, le 5 novembre 1955. */
const DOC = -30, ID_DOC = 30;
let texAlm = null;
const estBttf = id => id === "bttf-cour" || id === "hv1955";
export function almanachTaille(v) { envoyerWS({ t: "almanach_taille", v: +v }); }
// l'Almanach posé au sol, l'air de rien
function majAlmanach() {
  if (!M || !M.scene) return; const a = M.alm, ici = a && !a.pris && a.lieu === M.lieu && M.L && !M.L.apo;
  if (M.almMesh && M.almMesh.parent !== M.scene) M.almMesh = null;
  if (!ici) { if (M.almMesh) M.almMesh.visible = false; return; }
  if (!M.almMesh) { texAlm = texAlm || (() => { const t = new THREE.TextureLoader().load("images/bttf/almanach.jpg"); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; })();
    const g = new THREE.Group(), m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1.457), new THREE.MeshStandardMaterial({ map: texAlm, emissiveMap: texAlm, emissive: 0xffffff, emissiveIntensity: .22, roughness: .55, polygonOffset: true, polygonOffsetFactor: -2 }));
    m.rotation.x = -Math.PI / 2; m.receiveShadow = true; g.add(m);
    const dos = new THREE.Mesh(new THREE.BoxGeometry(1, .012, 1.457), new THREE.MeshStandardMaterial({ color: 0xe8e2d0 })); dos.position.y = -.007; g.add(dos);   // l'épaisseur des pages
    M.scene.add(g); M.almMesh = g; }
  const g = M.almMesh, s = a.taille || .3; g.visible = true; g.scale.set(s, s, s);
  g.position.set(a.x, (M.L.hauteur ? M.L.hauteur(a.x, a.z, {}) : 0) + .012 * s + .004, a.z); g.rotation.y = a.r || 0;
}
// ---- les bulles de Doc, l'éclair blanc, le fondu : par-dessus la scène ----
function voile(css, duree) { if (!M) return; const d = document.createElement("div"); d.style.cssText = "position:absolute;inset:0;z-index:8;pointer-events:none;" + css; M.ctx.conteneur.appendChild(d);
  if (duree) setTimeout(() => d.remove(), duree); return d; }
function eclairBlanc(ms = 1400) { const d = voile("background:radial-gradient(circle,#fff 0%,#dff4ff 45%,rgba(120,200,255,.85) 100%);opacity:1;transition:opacity " + ms + "ms ease-out", ms + 200); requestAnimationFrame(() => requestAnimationFrame(() => { d.style.opacity = 0; })); }
function bulle(texte, ms) { if (!M) return; if (M.bulleEl) M.bulleEl.remove(); if (!texte) { M.bulleEl = null; return; }
  const d = document.createElement("div"); d.style.cssText = "position:absolute;left:50%;top:14%;transform:translateX(-50%);z-index:9;max-width:84%;padding:12px 16px;border-radius:16px;background:#fffef6;color:#1a1a1a;border:3px solid #111;font:800 17px/1.3 'Lato',sans-serif;text-align:center;box-shadow:4px 5px 0 rgba(0,0,0,.45);pointer-events:none";
  d.innerHTML = texte; M.ctx.conteneur.appendChild(d); M.bulleEl = d; if (ms) setTimeout(() => { if (M && M.bulleEl === d) { d.remove(); M.bulleEl = null; } }, ms); }
function titreCine(texte, ms) { const d = voile("display:grid;place-items:center;font:900 clamp(26px,7vw,54px)/1 'Marcellus',serif;color:#ffcf3a;text-shadow:0 0 18px #ff6a00,3px 3px 0 #7a1a00;letter-spacing:.04em;opacity:0;transition:opacity .4s", ms);
  d.textContent = texte; requestAnimationFrame(() => requestAnimationFrame(() => { d.style.opacity = 1; })); setTimeout(() => { d.style.opacity = 0; }, ms - 450); }
function boutonPasser(fn) { if (!M) return; const b = document.createElement("button"); b.type = "button"; b.textContent = "Passer ⏭";
  b.style.cssText = "position:absolute;right:12px;bottom:14px;z-index:10;border:0;border-radius:99px;padding:8px 14px;background:rgba(20,20,24,.75);color:#fff;font:700 13px 'Lato',sans-serif;cursor:pointer";
  b.onclick = () => { b.remove(); fn(); }; M.ctx.conteneur.appendChild(b); return b; }
function finCine() { if (!M) return; M.cine = null; bulle(null); if (M.passerBtn) { M.passerBtn.remove(); M.passerBtn = null; } }

// ---- la DeLorean (la machine à voyager dans le temps du premier film) : avant vers -z ----
// un petit décor de reflets (ciel, horizon, sol) pour que l'inox de la DeLorean brille comme du métal
let envReflets = null;
function reflets() { if (envReflets) return envReflets;
  const face = (haut, bas) => toile(128, 128, (x) => { const g = x.createLinearGradient(0, 0, 0, 128); g.addColorStop(0, haut); g.addColorStop(.48, "#dfe9f2"); g.addColorStop(.52, "#7a7a78"); g.addColorStop(1, bas); x.fillStyle = g; x.fillRect(0, 0, 128, 128); });
  const c = toile(128, 128, x => { x.fillStyle = "#8fb8e0"; x.fillRect(0, 0, 128, 128); }), sol = toile(128, 128, x => { x.fillStyle = "#3a3a3a"; x.fillRect(0, 0, 128, 128); });
  const f = face("#6f9fd0", "#2e2e2e"); envReflets = new THREE.CubeTexture([f, f, c, sol, f, f]); envReflets.needsUpdate = true; return envReflets; }
// l'inox brossé : de fines rayures horizontales
let texBrosse = null;
function brosse() { return texBrosse || (texBrosse = tex(toile(256, 256, (x) => { x.fillStyle = "#c9cdd2"; x.fillRect(0, 0, 256, 256); for (let i = 0; i < 900; i++) { const v = 185 + Math.random() * 60; x.fillStyle = `rgba(${v},${v},${v + 4},.45)`; x.fillRect(Math.random() * 256, Math.random() * 256, 30 + Math.random() * 90, 1); } }), 3, 3)); }
function creerDelorean() {
  const g = new THREE.Group(), inox = new THREE.MeshStandardMaterial({ map: brosse(), color: 0xbfc3c8, metalness: .9, roughness: .3, envMap: reflets(), envMapIntensity: .85 }), noir = new THREE.MeshStandardMaterial({ color: 0x141416, roughness: .6 });
  const vitre = new THREE.MeshStandardMaterial({ color: 0x11161c, metalness: .6, roughness: .12 }), neon = new THREE.MeshBasicMaterial({ color: 0x3fc8ff }), blanc = new THREE.MeshBasicMaterial({ color: 0xfff6dc });
  const add = (geo, m, x, y, z, p = g) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; p.add(o); return o; };
  // la caisse : le profil en coin, extrudé sur la largeur
  const s = new THREE.Shape(); [[2.12, .26], [2.18, .52], [2.1, .7], [.78, .92], [-.02, 1.16], [-.78, 1.16], [-1.95, .94], [-2.16, .88], [-2.18, .52], [-2.12, .26]].forEach(([a, b], i) => i ? s.lineTo(a, b) : s.moveTo(a, b));
  const geo = new THREE.ExtrudeGeometry(s, { depth: 1.84, bevelEnabled: true, bevelThickness: .05, bevelSize: .05, bevelSegments: 3, curveSegments: 4 }); geo.translate(0, 0, -.92); geo.rotateY(Math.PI / 2);
  { const P = geo.attributes.position; for (let i = 0; i < P.count; i++) { const y = P.getY(i); if (y > .7) P.setX(i, P.getX(i) * (1 - (y - .7) * .42)); } geo.computeVertexNormals(); }   // (le haut de la caisse s'effile, comme la vraie)
  add(geo, inox, 0, 0, 0);
  // le bandeau de caoutchouc noir tout autour, les passages de roues, le bas de caisse
  const caout = new THREE.MeshStandardMaterial({ color: 0x1b1b1d, roughness: .75 });
  for (const sg of [-1, 1]) { add(new THREE.BoxGeometry(.05, .07, 4.1), caout, sg * .965, .6, 0); add(new THREE.BoxGeometry(.05, .16, 2.4), caout, sg * .955, .31, 0); }
  add(new THREE.BoxGeometry(1.96, .16, .1), caout, 0, .42, -2.22); add(new THREE.BoxGeometry(1.96, .2, .1), caout, 0, .42, 2.22);
  for (const [x, z] of [[-1, -1.35], [1, -1.35], [-1, 1.35], [1, 1.35]]) { const a = new THREE.Mesh(new THREE.CylinderGeometry(.42, .42, .06, 24, 1, true, 0, Math.PI), caout); a.rotation.set(0, 0, Math.PI / 2); a.rotation.order = "ZYX"; a.position.set(x * .96, .33, z); g.add(a);
    const fond = new THREE.Mesh(new THREE.CircleGeometry(.41, 24, 0, Math.PI), new THREE.MeshBasicMaterial({ color: 0x050505, side: THREE.DoubleSide })); fond.rotation.y = Math.sign(x) * Math.PI / 2; fond.position.set(x * .93, .33, z); g.add(fond); }
  // les vitres latérales fixes (derrière les portes)
  for (const sg of [-1, 1]) { const vg = new THREE.Mesh(new THREE.PlaneGeometry(.42, .2), vitre); vg.position.set(sg * .78, 1.03, .78); vg.rotation.set(0, sg * Math.PI / 2, 0); g.add(vg); }
  // la plaque arrière : OUTATIME
  const plaqueT = toile(256, 128, (x) => { x.fillStyle = "#f4f2ea"; x.fillRect(0, 0, 256, 128); x.strokeStyle = "#1a2a6a"; x.lineWidth = 6; x.strokeRect(4, 4, 248, 120); x.fillStyle = "#b81d24"; x.font = "bold italic 22px Georgia"; x.textAlign = "center"; x.fillText("California", 128, 34); x.fillStyle = "#1a2a6a"; x.font = "bold 50px Arial"; x.fillText("OUTATIME", 128, 96); });
  add(new THREE.PlaneGeometry(.5, .25), new THREE.MeshBasicMaterial({ map: tex(plaqueT) }), 0, .52, 2.28);
  const quad = (pts, m) => { const b = new THREE.BufferGeometry(); b.setAttribute("position", new THREE.Float32BufferAttribute([...pts[0], ...pts[1], ...pts[2], ...pts[0], ...pts[2], ...pts[3]], 3)); b.computeVertexNormals();
    const o = new THREE.Mesh(b, m); m.side = THREE.DoubleSide; g.add(o); return o; };
  // le pare-brise : un joint noir, et la vitre teintée qui reflète le ciel (posés juste au-dessus de la tôle, qui s'effile vers le toit)
  const quadUV = (pts, m) => { const b = new THREE.BufferGeometry(); b.setAttribute("position", new THREE.Float32BufferAttribute([...pts[0], ...pts[1], ...pts[2], ...pts[0], ...pts[2], ...pts[3]], 3));
    b.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1], 2)); b.computeVertexNormals(); const o = new THREE.Mesh(b, m); g.add(o); return o; };
  const nY = .958, nZ = -.287, off = (p, d) => [p[0], p[1] + nY * d, p[2] + nZ * d];
  const pb = (w0, w1, d) => [[-w0, .935, -.74], [w0, .935, -.74], [w1, 1.17, .02], [-w1, 1.17, .02]].map(p => off(p, d));
  quadUV(pb(.84, .75, .072), new THREE.MeshBasicMaterial({ color: 0x0c0c0e, side: THREE.DoubleSide }));
  const verre = toile(256, 128, (x) => { const gr = x.createLinearGradient(0, 128, 0, 0); gr.addColorStop(0, "#2a3644"); gr.addColorStop(.55, "#5d7488"); gr.addColorStop(1, "#a9bccb"); x.fillStyle = gr; x.fillRect(0, 0, 256, 128);
    x.fillStyle = "rgba(255,255,255,.35)"; x.beginPath(); x.moveTo(40, 128); x.lineTo(90, 128); x.lineTo(150, 0); x.lineTo(110, 0); x.fill(); x.fillStyle = "rgba(255,255,255,.18)"; x.beginPath(); x.moveTo(110, 128); x.lineTo(125, 128); x.lineTo(185, 0); x.lineTo(170, 0); x.fill();
    x.fillStyle = "rgba(20,20,24,.55)"; x.fillRect(20, 90, 216, 38); });   // (le tableau de bord, en bas)
  quadUV(pb(.77, .69, .082), new THREE.MeshStandardMaterial({ map: tex(verre), metalness: .3, roughness: .08, envMap: reflets(), side: THREE.DoubleSide }));
  for (let k = 0; k < 6; k++) add(new THREE.BoxGeometry(1.6, .02, .1), noir, 0, 1.13 - k * .036, .95 + k * .18).rotation.x = -.19;   // les persiennes de la lunette arrière
  // l'avant : la calandre noire « DMC », les doubles phares, le néon bleu dessous
  add(new THREE.BoxGeometry(.7, .14, .04), noir, 0, .55, -2.19);
  const dmc = toile(128, 32, (x) => { x.fillStyle = "#151515"; x.fillRect(0, 0, 128, 32); x.fillStyle = "#c9c9c9"; x.font = "bold 22px Arial"; x.textAlign = "center"; x.fillText("DMC", 64, 24); });
  add(new THREE.PlaneGeometry(.24, .06), new THREE.MeshBasicMaterial({ map: tex(dmc) }), 0, .55, -2.215).rotation.y = Math.PI;
  for (const sg of [-1, 1]) { add(new THREE.BoxGeometry(.4, .16, .03), new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: .6, roughness: .3 }), sg * .59, .56, -2.19);
    for (const k of [0, 1]) add(new THREE.BoxGeometry(.15, .11, .03), blanc, sg * (.5 + k * .18), .56, -2.205); add(new THREE.BoxGeometry(.2, .05, .03), new THREE.MeshBasicMaterial({ color: 0xffa020 }), sg * .59, .42, -2.24); }
  const feuxAR = toile(128, 64, (x) => { x.fillStyle = "#b01515"; x.fillRect(0, 0, 128, 64); x.fillStyle = "#e8a020"; x.fillRect(0, 0, 30, 64); x.fillStyle = "#111"; for (let i = 0; i < 64; i += 9) x.fillRect(0, i, 128, 3); });
  for (const sg of [-1, 1]) add(new THREE.PlaneGeometry(.62, .2), new THREE.MeshBasicMaterial({ map: tex(feuxAR) }), sg * .55, .72, 2.235);
  add(new THREE.BoxGeometry(1.9, .04, .05), neon, 0, .28, -2.12); for (const sg of [-1, 1]) add(new THREE.BoxGeometry(.04, .04, 3.6), neon, sg * .96, .27, 0);
  // l'arrière : Mr. Fusion, les bobines, les évents, les câbles
  add(new THREE.CylinderGeometry(.16, .18, .3, 16), new THREE.MeshStandardMaterial({ color: 0xf2f2ee, roughness: .4 }), 0, 1.06, 1.9);
  add(new THREE.CylinderGeometry(.09, .09, .1, 12), noir, 0, 1.25, 1.9);
  for (const sg of [-1, 1]) { for (let k = 0; k < 3; k++) add(new THREE.CylinderGeometry(.05, .05, .5, 8), noir, sg * .55, .98 + k * .07, 1.7).rotation.x = Math.PI / 2;
    add(new THREE.BoxGeometry(.22, .18, .4), noir, sg * .62, .98, 2.05);
    const bob = add(new THREE.TorusGeometry(.2, .04, 8, 16), new THREE.MeshStandardMaterial({ color: 0x8a5a2a, metalness: .6, roughness: .4 }), sg * .97, .62, 1.55); bob.rotation.y = Math.PI / 2;
    add(new THREE.CylinderGeometry(.02, .02, 3.2, 6), new THREE.MeshStandardMaterial({ color: 0x2a2a2a }), sg * .96, .74, -.2).rotation.x = Math.PI / 2; }
  // les roues, enjoliveurs à rayons
  const jante = toile(64, 64, (x) => { x.fillStyle = "#9da2a8"; x.beginPath(); x.arc(32, 32, 30, 0, 7); x.fill(); x.strokeStyle = "#5a5e64"; x.lineWidth = 2; for (let a = 0; a < 20; a++) { x.beginPath(); x.moveTo(32, 32); x.lineTo(32 + Math.cos(a / 20 * 6.28) * 29, 32 + Math.sin(a / 20 * 6.28) * 29); x.stroke(); } x.fillStyle = "#3a3e44"; x.beginPath(); x.arc(32, 32, 7, 0, 7); x.fill(); });
  const roues = [], mJ = new THREE.MeshStandardMaterial({ map: tex(jante), metalness: .7, roughness: .3 });
  for (const [x, z] of [[-.9, -1.35], [.9, -1.35], [-.9, 1.35], [.9, 1.35]]) { const r = new THREE.Group(); r.position.set(x, .33, z); g.add(r);
    const pn = new THREE.Mesh(new THREE.CylinderGeometry(.33, .33, .24, 20), noir); pn.rotation.z = Math.PI / 2; r.add(pn);
    const j = new THREE.Mesh(new THREE.CircleGeometry(.22, 20), mJ); j.position.x = Math.sign(x) * .125; j.rotation.y = Math.sign(x) * Math.PI / 2; r.add(j); roues.push(r); }
  // les portes papillon : charnière en haut, elles s'ouvrent vers le ciel
  const vitreP = toile(256, 160, (x) => { x.fillStyle = x.createPattern(brosse().image, "repeat"); x.fillRect(0, 0, 256, 160); x.fillStyle = "rgba(190,195,200,.35)"; x.fillRect(0, 0, 256, 160);
    const gr = x.createLinearGradient(0, 0, 0, 66); gr.addColorStop(0, "#5d7488"); gr.addColorStop(1, "#141a22"); x.fillStyle = gr; x.beginPath(); x.moveTo(30, 6); x.lineTo(236, 6); x.lineTo(250, 66); x.lineTo(14, 66); x.fill();   // la vitre
    x.fillStyle = "rgba(255,255,255,.25)"; x.beginPath(); x.moveTo(70, 66); x.lineTo(90, 66); x.lineTo(120, 6); x.lineTo(100, 6); x.fill();
    x.fillStyle = "#151517"; x.fillRect(0, 108, 256, 9); x.fillStyle = "rgba(0,0,0,.3)"; x.fillRect(196, 84, 30, 4); x.strokeStyle = "rgba(0,0,0,.35)"; x.lineWidth = 3; x.strokeRect(1, 1, 254, 158); });
  const mP = new THREE.MeshStandardMaterial({ map: tex(vitreP), metalness: .6, roughness: .32, envMap: reflets(), envMapIntensity: .6, side: THREE.DoubleSide });
  const portes = [-1, 1].map(sg => { const pv = new THREE.Group(); pv.position.set(sg * .83, 1.12, -.12); g.add(pv);
    const inc = new THREE.Group(); inc.rotation.z = sg * .2; pv.add(inc);
    const p = new THREE.Mesh(new THREE.PlaneGeometry(1.3, .76), mP); p.position.set(sg * .02, -.37, 0); p.rotation.y = sg * Math.PI / 2; p.castShadow = true; inc.add(p);
    return { pv, sg }; });
  g.userData = { roues, portes };
  return g;
}
function ouvrirPortes(car, f) { for (const { pv, sg } of car.userData.portes) pv.rotation.z = sg * f * 1.55; }
// ---- les traînées de feu, derrière les roues ----
function traineeFeu(lst, x, z, y = 0) {
  if (!texFlammes) texFlammes = flammesPixel();
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: texFlammes[0], transparent: true, depthWrite: false, alphaTest: .05, fog: false }));
  sp.center.set(.5, .05); sp.position.set(x, y + .01, z); sp.scale.set(.55, .9, 1); M.scene.add(sp);
  const brule = new THREE.Mesh(new THREE.PlaneGeometry(.34, .34), new THREE.MeshBasicMaterial({ color: 0x140a04, transparent: true, opacity: .75, depthWrite: false }));
  brule.rotation.x = -Math.PI / 2; brule.position.set(x, y + .015, z); M.scene.add(brule);
  lst.push({ sp, brule, ph: Math.floor(Math.random() * 8), h: .7 + Math.random() * .6, t0: performance.now() });
}
function animerFeu(lst, now, vie = 9000) {
  for (let i = lst.length - 1; i >= 0; i--) { const f = lst[i], age = now - f.t0, k = Math.max(0, 1 - age / vie);
    if (k <= 0) { M.scene.remove(f.sp); M.scene.remove(f.brule); f.sp.material.dispose(); lst.splice(i, 1); continue; }
    f.sp.material.map = texFlammes[(Math.floor(now / 70) + f.ph) % 8]; const v = .85 + .15 * Math.sin(now / 90 + f.ph); f.sp.scale.set(.55 * v, (.5 + .9 * f.h) * v * Math.min(1, k * 1.6), 1); }
}
// les éclairs bleus autour de la voiture, juste avant le saut dans le temps
function arcs(car, on) { if (!car.userData.arcs) { const m = new THREE.LineBasicMaterial({ color: 0x9fe6ff }), L = [];
    for (let i = 0; i < 7; i++) { const b = new THREE.BufferGeometry(); b.setAttribute("position", new THREE.Float32BufferAttribute(new Array(18).fill(0), 3)); const l = new THREE.Line(b, m); l.frustumCulled = false; car.add(l); L.push(l); }
    car.userData.arcs = L; }
  for (const l of car.userData.arcs) { l.visible = on && Math.random() < .8; if (!l.visible) continue; const p = l.geometry.attributes.position, a = Math.random() * 6.28, z0 = (Math.random() - .5) * 4;
    let x = Math.cos(a) * 1.1, y = .7 + Math.sin(a) * .8, z = z0; for (let k = 0; k < 6; k++) { p.setXYZ(k, x, y, z); x += (Math.random() - .5) * .6; y += (Math.random() - .5) * .5; z += (Math.random() - .5) * .7; } p.needsUpdate = true; } }

// ---- les cinématiques : M.cine = { t0, maj(t) } ; la caméra est tenue par la cinématique ----
function poser(car, x, z, yaw) { car.position.set(x, car.position.y, z); car.rotation.y = yaw; }
function rouler(car, d) { for (const r of car.userData.roues) r.rotation.x -= d / .33; }
const lisse = u => u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u);
function ajouterDoc(x, z) { const P = (M.ctx.pnjTrio && M.ctx.pnjTrio(ID_DOC)) || {};
  return ajouterAncien({ numero: DOC, nom: P.nom || "Doc", tenue: P.tenue || "doc", couleur: P.couleur || "#f1efe6", bas: P.bas || "#f1efe6", pieds: P.pieds || "#8a5a34", reglage: P.reglage || null, initiales: "",
    teteUrl: P.tete_v ? M.ctx.urlTetePNJ(P.tete_v, ID_DOC) : "images/bttf/doc-tete.webp", pnj: true, x, z }); }
const prenomMoi = () => esc((M.ctx.moiInfo && M.ctx.moiInfo().nom) || "Marty");
const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
// 1. dans la cour d'honneur (rien qu'à soi) : la DeLorean arrive, Doc appelle, on monte, elle fonce, 88 miles à l'heure… disparue
function cineCour() {
  M.bulleDit = M.monte = M.vroum = M.vroum2 = 0; M.dz = M.dx = 0;
  const car = creerDelorean(); car.position.y = 0; M.scene.add(car); poser(car, 0, 30, 0); const feu = [];
  let fini = false; const fin = () => { if (fini || !M) return; fini = true; finCine(); voile("background:#fff;opacity:1", 1600); M.arriveeHV = true; changerLieu("hv1955", [-22, 16], -Math.PI / 2); };
  M.passerBtn = boutonPasser(fin);
  sonBruit(2.5, 220, .5);
  M.cine = { t0: performance.now(), feu, maj: (now) => { const t = (now - M.cine.t0) / 1000, moi = M.gens.get(M.moiNum), cam = M.camera;
    let cx = 0, cz = 0;
    if (t < 5) { const u = lisse((t - .6) / 4.4), z = 30 - 25.5 * (1 - Math.pow(1 - Math.min(1, Math.max(0, (t - .6) / 4.4)), 2)), x = 2.8 * lisse((t - 2) / 2.6);
      rouler(car, Math.abs(z - car.position.z)); poser(car, x, z, 0); cx = x; cz = z;
      cam.position.lerp(new THREE.Vector3(-5.5, 3.2, 13.5), .08); cam.lookAt(x, .9, z); }
    else if (t < 12.5) { if (car.rotation.y) car.rotation.y *= .9;
      ouvrirPortes(car, t < 11.5 ? lisse((t - 5) / 1.2) : 1 - lisse((t - 11.5) / 1)); car.userData.portes.forEach(() => {});
      if (t > 6 && !M.gens.has(DOC)) ajouterDoc(1.0, 3.4);
      if (t > 6.3 && !M.bulleDit) { M.bulleDit = 1; bulle(`🧪 <b>Doc :</b> ${prenomMoi()} ! Vite, monte dans la DeLorean !<br>Il faut partir en <b>1955</b> !`, 4300); }
      if (t > 9 && moi && !M.monte) { M.monte = 1; moi.cible = new THREE.Vector3(1.75, 0, 4.9); moi.chemin = []; moi.rapide = true; }
      if (t > 10.3 && M.gens.has(DOC)) retirerAncien(DOC);
      if (t > 11 && moi) moi.g.visible = false;
      cam.position.lerp(new THREE.Vector3(-1.6, 2.4, 11), .05); cam.lookAt(1.6, 1.3, 5); }
    else if (t < 14.8) { const u = t - 12.5, z = 4.5 - .5 * 7.2 * u * u, x = 2.8 - 2.2 * lisse(u / 2); if (!M.vroum) { M.vroum = 1; sonBruit(2.3, 500, .9); }
      const dz = car.position.z - z; rouler(car, dz); poser(car, x, z, 0);
      if (u > .25) { M.dz = (M.dz || 0) + dz; while (M.dz > .22) { M.dz -= .22; for (const sg of [-1, 1]) traineeFeu(feu, x + sg * .9, z + 1.35 + M.dz); } }
      arcs(car, u > 1.1); car.position.y = 0;
      cam.position.lerp(new THREE.Vector3(-4, 1.5, 9.5), .06); cam.lookAt(x, .7, z - 2); }
    else { if (car.visible) { car.visible = false; eclairBlanc(1500); sonBruit(1.6, 260, 1); sonBruit(.25, 5000, .7); setTimeout(() => M && M.cine && titreCine("88 miles à l'heure !", 2600), 500); }
      cam.position.lerp(new THREE.Vector3(-1.2, 1.4, 9.5), .04); cam.lookAt(.7, .3, -8);
      if (t > 18.2) { voile("background:#fff;opacity:0;transition:opacity .7s", 1500).getBoundingClientRect(); setTimeout(fin, 700); M.cine.maj = () => {}; } }
    animerFeu(feu, now, 60000); } };
}
// 2. à Hill Valley : l'éclair, la DeLorean qui surgit et glisse jusqu'au trottoir, Doc et nous qui descendons
function cineHV() {
  M.bulleDit = M.monte = M.vroum = M.vroum2 = 0; M.dz = M.dx = 0;
  const car = M.L.delorean; poser(car, -24, 16, -Math.PI / 2); ouvrirPortes(car, 0); const feu = [];
  const moi0 = () => M.gens.get(M.moiNum);
  let fini = false; const fin = () => { if (fini || !M) return; fini = true; poser(car, -6, 16, -Math.PI / 2); ouvrirPortes(car, 0); const moi = moi0(); if (moi) { moi.g.visible = true; moi.g.position.set(-5.2, .12, 13.9); }
    if (!M.gens.has(DOC)) ajouterDoc(-7.2, 13.9); finCine(); };
  M.passerBtn = boutonPasser(fin);
  eclairBlanc(1300); sonBruit(1.4, 300, .9);
  M.cine = { t0: performance.now(), feu, maj: (now) => { const t = (now - M.cine.t0) / 1000, moi = moi0(), cam = M.camera;
    if (moi && t < 4) moi.g.visible = false;
    if (t < 2.6) { const u = Math.min(1, t / 2.4), x = -24 + 18 * (1 - Math.pow(1 - u, 2.2)), dx = x - car.position.x; rouler(car, dx); poser(car, x, 16, -Math.PI / 2);
      if (dx > .01) { M.dx = (M.dx || 0) + dx; while (M.dx > .25) { M.dx -= .25; for (const sg of [-1, 1]) traineeFeu(feu, x - 1.35, 16 + sg * .9); } }
      arcs(car, t < .8); cam.position.lerp(new THREE.Vector3(-12, 2.2, 22), .1); cam.lookAt(x, .8, 16); }
    else if (t < 9) { arcs(car, false); ouvrirPortes(car, t < 7.5 ? lisse((t - 3) / 1.1) : 1 - lisse((t - 7.5) / 1));
      if (t > 4 && moi && !moi.g.visible) { moi.g.visible = true; moi.g.position.set(-5.2, .12, 13.9); }
      if (t > 4.2 && !M.gens.has(DOC)) ajouterDoc(-7.2, 13.9);
      if (t > 4.6 && !M.bulleDit) { M.bulleDit = 1; bulle(`🧪 <b>Doc :</b> Bienvenue à <b>Hill Valley</b>, ${prenomMoi()} ! Nous sommes le <b>5 novembre 1955</b>.<br>Balade-toi… et reviens à la DeLorean quand tu voudras rentrer !`, 5200); }
      cam.position.lerp(new THREE.Vector3(-8.5, 2.6, 7.5), .05); cam.lookAt(-5.5, 1.2, 15); }
    else fin();
    animerFeu(feu, now, 7000); } };
  M.feuHV = feu;
}
// 3. rentrer en 2026 : on remonte, la DeLorean file le long de la rue… et l'on se retrouve dans la vraie cour d'honneur
function cineRetour() {
  M.bulleDit = M.monte = M.vroum = M.vroum2 = 0; M.dz = M.dx = 0;
  const car = M.L.delorean, feu = M.feuHV || []; let fini = false;
  const fin = () => { if (fini || !M) return; fini = true; finCine(); voile("background:#fff;opacity:1", 1300); changerLieu("grande", [1.5, 6], 0); setTimeout(() => M && eclairBlanc(1400), 400); };
  M.passerBtn = boutonPasser(fin); bulle(`🧪 <b>Doc :</b> En route pour <b>2026</b> ! Accroche-toi, ${prenomMoi()} !`, 2600);
  M.cine = { t0: performance.now(), maj: (now) => { const t = (now - M.cine.t0) / 1000, moi = M.gens.get(M.moiNum), cam = M.camera;
    if (t < 3) { ouvrirPortes(car, t < 1.6 ? lisse(t / .8) : 1 - lisse((t - 1.6) / .9)); if (t > 1.2) { if (moi) moi.g.visible = false; if (M.gens.has(DOC)) retirerAncien(DOC); }
      cam.position.lerp(new THREE.Vector3(-9, 2.4, 8), .05); cam.lookAt(-6, 1, 16); }
    else if (t < 5.6) { const u = t - 3, x = -6 + .5 * 8 * u * u, dx = x - car.position.x; rouler(car, dx); poser(car, x, 16, -Math.PI / 2); if (!M.vroum2) { M.vroum2 = 1; sonBruit(2.2, 500, .9); }
      if (u > .2) { M.dx = (M.dx || 0) + dx; while (M.dx > .25) { M.dx -= .25; for (const sg of [-1, 1]) traineeFeu(feu, x - 1.35, 16 + sg * .9); } }
      arcs(car, u > 1.4); cam.position.lerp(new THREE.Vector3(-10, 1.8, 20.5), .06); cam.lookAt(x, .8, 16); }
    else { if (car.visible) { car.visible = false; eclairBlanc(1200); sonBruit(1.5, 260, 1); } if (t > 7) fin(); }
    animerFeu(feu, now, 60000); } };
}
// ---- Hill Valley, la place du palais de justice, 1955 ----
function toileBrique(base = "#8e4630", w = 256, h = 256) { return toile(w, h, (x) => { x.fillStyle = base; x.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 8) for (let i = -1; i < w / 24 + 1; i++) { const v = (Math.sin(i * 12.9 + y * 7.1) * .5 + .5) * 26 - 13; x.fillStyle = `rgba(${v > 0 ? "255,220,200" : "40,10,0"},${Math.abs(v) / 120})`; x.fillRect(i * 24 + (y / 8 % 2) * 12, y, 23, 7); }
  x.fillStyle = "rgba(225,215,200,.35)"; for (let y = 7; y < h; y += 8) x.fillRect(0, y, w, 1); for (let y = 0; y < h; y += 8) for (let i = 0; i < w / 24 + 1; i++) x.fillRect(i * 24 + (y / 8 % 2) * 12 - 1, y, 1, 8); }); }
// une façade dessinée (pour compléter la place) : enseigne, vitrines, auvent rayé, fenêtres à l'étage
function toileBoutique({ larg, haut, mur = "#8e4630", brique = true, enseigne, couleurEnseigne = "#b81d24", texteEnseigne = "#fff", auvent, etages = 2 }) {
  const W = Math.round(larg * 48), H = Math.round(haut * 48);
  return toile(W, H, (x) => { if (brique) { const b = toileBrique(mur); x.fillStyle = x.createPattern(b, "repeat"); } else x.fillStyle = mur; x.fillRect(0, 0, W, H);
    x.fillStyle = "#e9e1cf"; x.fillRect(0, 0, W, 22); x.fillRect(0, H * .44, W, 10);   // la corniche, le bandeau
    const nf = Math.max(2, Math.round(larg / 2.6)); for (let e = 0; e < etages - 1; e++) for (let i = 0; i < nf; i++) { const fx = (i + .5) * W / nf - 26, fy = 40 + e * 110;
      x.fillStyle = "#efe7d6"; x.fillRect(fx - 6, fy - 8, 64, 104); x.fillStyle = "#3a4a5a"; x.fillRect(fx, fy, 52, 88); x.fillStyle = "rgba(200,220,240,.35)"; x.fillRect(fx + 4, fy + 4, 20, 36); x.fillStyle = "#efe7d6"; x.fillRect(fx, fy + 42, 52, 4); x.fillRect(fx + 24, fy, 4, 88); }
    const yv = H * .44 + 10; x.fillStyle = "#2c3a3e"; x.fillRect(16, yv + 54, W - 32, H - yv - 54);   // le rez-de-chaussée : vitrines
    x.fillStyle = "rgba(170,200,215,.55)"; for (let i = 0; i < 3; i++) x.fillRect(28 + i * (W - 56) / 3, yv + 66, (W - 56) / 3 - 12, H - yv - 90);
    x.fillStyle = "#5a3820"; x.fillRect(W / 2 - 24, H - 110, 48, 110);
    if (enseigne) { x.fillStyle = couleurEnseigne; x.fillRect(20, yv + 2, W - 40, 46); x.fillStyle = texteEnseigne; x.font = `bold ${Math.min(36, (W - 60) / enseigne.length * 1.7)}px Georgia, serif`; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(enseigne, W / 2, yv + 26); }
    if (auvent) { for (let i = 0; i < W - 40; i += 24) { x.fillStyle = (i / 24) % 2 ? "#f4f0e6" : auvent; x.beginPath(); x.moveTo(20 + i, yv + 50); x.lineTo(44 + i, yv + 50); x.lineTo(48 + i, yv + 96); x.lineTo(16 + i, yv + 96); x.fill(); } } }); }
function toileHorloge() { return toile(512, 512, (x) => { x.fillStyle = "#2a2622"; x.beginPath(); x.arc(256, 256, 250, 0, 7); x.fill(); x.fillStyle = "#f6f2e6"; x.beginPath(); x.arc(256, 256, 222, 0, 7); x.fill();
  x.strokeStyle = "#2a2622"; x.lineWidth = 6; x.beginPath(); x.arc(256, 256, 160, 0, 7); x.stroke(); x.fillStyle = "#1a1a1a"; x.font = "bold 46px Georgia, serif"; x.textAlign = "center"; x.textBaseline = "middle";
  ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"].forEach((n, i) => { const a = i / 12 * Math.PI * 2 - Math.PI / 2; x.save(); x.translate(256 + Math.cos(a) * 192, 256 + Math.sin(a) * 192); x.rotate(a + Math.PI / 2); x.fillText(n, 0, 0); x.restore(); });
  const aig = (a, l, w) => { x.save(); x.translate(256, 256); x.rotate(a); x.fillStyle = "#111"; x.beginPath(); x.moveTo(-w, 20); x.lineTo(w, 20); x.lineTo(0, -l); x.fill(); x.restore(); };
  aig((10 + 4 / 60) / 12 * Math.PI * 2, 110, 12); aig(4 / 60 * Math.PI * 2, 170, 8); x.beginPath(); x.arc(256, 256, 14, 0, 7); x.fill(); }); }   // arrêtée à 22 h 04, le soir de la foudre
function toileDrapeau() { return toile(380, 200, (x) => { for (let i = 0; i < 13; i++) { x.fillStyle = i % 2 ? "#f6f6f6" : "#b22234"; x.fillRect(0, i * 200 / 13, 380, 200 / 13 + 1); }
  x.fillStyle = "#3c3b6e"; x.fillRect(0, 0, 152, 108); x.fillStyle = "#fff"; for (let r = 0; r < 6; r++) for (let c = 0; c < 8; c++) { x.beginPath(); x.arc(10 + c * 19, 9 + r * 18, 3.2, 0, 7); x.fill(); } }); }   // 48 étoiles : 1955
function toileBienvenue() { return toile(1024, 720, (x) => { x.clearRect(0, 0, 1024, 720);
  x.fillStyle = "#f4f2ea"; x.fillRect(150, 70, 724, 360); x.strokeStyle = "#cfc9b8"; x.lineWidth = 8; x.strokeRect(150, 70, 724, 360);
  x.fillStyle = "#222"; x.textAlign = "center"; x.font = "bold 46px Georgia, serif"; x.fillText("WELCOME", 512, 50); x.font = "bold 44px Georgia, serif"; x.fillText("TO", 512, 135);
  x.font = "bold 96px Georgia, serif"; x.fillText("HILL VALLEY", 512, 238); x.font = "italic 44px Georgia, serif"; x.fillText("“A Nice Place To Live”", 512, 305);
  x.fillStyle = "#2a2a2a"; x.fillRect(220, 340, 584, 64); x.fillStyle = "#f4f2ea"; x.font = "bold 40px Georgia, serif"; x.fillText("PLEASE DRIVE CAREFULLY!", 512, 386);
  const em = (cx, cy, r, f, s, t, tc = "#fff") => { x.fillStyle = s; x.beginPath(); x.arc(cx, cy, r + 6, 0, 7); x.fill(); x.fillStyle = f; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); x.fillStyle = tc; x.font = `bold ${r * .9}px Georgia`; x.textBaseline = "middle"; x.fillText(t, cx, cy + 2); x.textBaseline = "alphabetic"; };
  em(90, 150, 62, "#2a4a9a", "#c9a227", "K"); em(934, 150, 62, "#c8102e", "#c9a227", "▲"); em(934, 330, 56, "#1d3a6a", "#c9a227", "⚙", "#e9c84a"); em(110, 470, 54, "#2a4a9a", "#e9c84a", "★");
  em(330, 560, 52, "#1a1a1a", "#e9c84a", "R"); em(700, 520, 56, "#2a4a9a", "#e9c84a", "L"); em(880, 560, 46, "#e9e9e9", "#c8102e", "Y", "#c8102e");
  x.fillStyle = "#f4f2ea"; x.fillRect(450, 440, 140, 200); x.fillStyle = "#2a5a2a"; x.font = "bold 22px Georgia"; x.fillText("FUTURE", 520, 475); x.fillText("FARMERS", 520, 500); x.fillStyle = "#c9a227"; x.beginPath(); x.arc(520, 560, 40, 0, 7); x.fill(); x.fillStyle = "#2a5a2a"; x.fillText("HILL VALLEY", 520, 625);
  x.fillStyle = "#b81d24"; x.fillRect(160, 450, 110, 110); x.fillStyle = "#fff"; x.font = "italic bold 22px Georgia"; x.fillText("Jaycees", 215, 505); x.fillText("welcome", 215, 535);
  x.fillStyle = "#e8e2d0"; x.fillRect(780, 630, 150, 70); x.fillStyle = "#333"; x.font = "bold 18px Georgia"; x.fillText("CHAMBER OF", 855, 660); x.fillText("COMMERCE", 855, 685); }); }
function voiture50(couleur, toit = 0xf2efe6) {
  const g = new THREE.Group(), carr = new THREE.MeshStandardMaterial({ color: couleur, metalness: .45, roughness: .3 }), chrome = new THREE.MeshStandardMaterial({ color: 0xe6e9ec, metalness: .95, roughness: .15 });
  const vitre = new THREE.MeshStandardMaterial({ color: 0x1c2630, metalness: .5, roughness: .1 }), noir = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: .7 }), blanc = new THREE.MeshStandardMaterial({ color: 0xf5f5f0, roughness: .5 });
  const add = (geo, m, x, y, z) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; g.add(o); return o; };
  add(new THREE.BoxGeometry(1.9, .62, 5), carr, 0, .62, 0); add(new THREE.BoxGeometry(1.84, .12, 4.6), carr, 0, .98, .1);
  add(new THREE.BoxGeometry(1.62, .5, 2.3), vitre, 0, 1.28, .35); add(new THREE.BoxGeometry(1.66, .08, 2.15), new THREE.MeshStandardMaterial({ color: toit, metalness: .4, roughness: .3 }), 0, 1.56, .4);
  for (const z of [-2.53, 2.53]) add(new THREE.BoxGeometry(1.98, .16, .1), chrome, 0, .45, z);
  for (const sg of [-1, 1]) { add(new THREE.CylinderGeometry(.13, .13, .05, 14), new THREE.MeshBasicMaterial({ color: 0xfff6d8 }), sg * .68, .78, -2.52).rotation.x = Math.PI / 2;
    add(new THREE.BoxGeometry(.06, .3, .5), carr, sg * .9, 1.04, 2.2); add(new THREE.BoxGeometry(.03, .06, 4.6), chrome, sg * .96, .7, 0); }
  for (const [x, z] of [[-.88, -1.6], [.88, -1.6], [-.88, 1.6], [.88, 1.6]]) { const r = add(new THREE.CylinderGeometry(.36, .36, .26, 18), noir, x, .36, z); r.rotation.z = Math.PI / 2;
    const f = add(new THREE.TorusGeometry(.2, .06, 6, 18), blanc, x + Math.sign(x) * .135, .36, z); f.rotation.y = Math.PI / 2; }
  return g;
}
function construireHillValley(A, T, L, scene) {
  L.hv = true; L.sansPNJ = true; L.taille = 1.85;
  L.suivi = { d: 8.5, h: 4.4, av: 5, vy: 2.4 }; L.fov = [60, 72]; L.boite = [-26.5, 26.5, -14.6, 22.6]; L.zone = [-27.5, 27.5, -15.5, 23.5];
  L.depart = [-5.2, 13.9]; L.cam = { pos: [0, 6, 30], vise: [0, 3, 0] };
  const SQ = [15.5, 11.5], trottoirH = .12;
  // le sol : l'asphalte, les marquages
  const asph = toile(256, 256, (x) => { x.fillStyle = "#4a4a4c"; x.fillRect(0, 0, 256, 256); for (let i = 0; i < 2600; i++) { const v = 50 + Math.random() * 50; x.fillStyle = `rgba(${v},${v},${v + 4},.5)`; x.fillRect(Math.random() * 256, Math.random() * 256, 2, 2); } });
  const sol = A.ajoute(new THREE.PlaneGeometry(160, 160), A.mat({ map: tex(asph, 40, 40) }), 0, 0, 0, false); sol.rotation.x = -Math.PI / 2; L.sol = sol;
  const ligne = A.mat({ color: 0xf2efe2 }); for (let x = -26; x < 27; x += 4) { const l = A.ajoute(new THREE.PlaneGeometry(2, .14), ligne, x, .01, 16.3, false); l.rotation.x = -Math.PI / 2; }
  for (const sx of [-1, 1]) for (let z = -10; z < 12; z += 4) { const l = A.ajoute(new THREE.PlaneGeometry(.14, 2), ligne, sx * 20.3, .01, z, false); l.rotation.x = -Math.PI / 2; }
  for (let i = 0; i < 7; i++) { const l = A.ajoute(new THREE.PlaneGeometry(.6, 4), ligne, -13 + i * 1.1, .01, 16.3, false); l.rotation.x = -Math.PI / 2; }   // le passage piéton
  // la place : le trottoir de pierre, la pelouse, les allées en gravier
  const pierre = A.mat({ color: 0xc9c3b4, roughness: .95 }), gazon = toile(128, 128, (x) => { x.fillStyle = "#4f8a34"; x.fillRect(0, 0, 128, 128); for (let i = 0; i < 1400; i++) { x.fillStyle = Math.random() < .5 ? "rgba(40,90,20,.5)" : "rgba(120,170,70,.4)"; x.fillRect(Math.random() * 128, Math.random() * 128, 1, 3); } });
  const plaque = (w, d, x, z, m, y = trottoirH) => { const o = A.ajoute(new THREE.BoxGeometry(w, y, d), m, x, y / 2, z, false); o.receiveShadow = true; return o; };
  const solsPlus = [plaque(SQ[0] * 2, SQ[1] * 2, 0, 0, pierre), plaque(SQ[0] * 2, 4.4, 0, -13.7, pierre)];
  const pelouse = A.ajoute(new THREE.PlaneGeometry(SQ[0] * 2 - 3, SQ[1] * 2 - 3), A.mat({ map: tex(gazon, 8, 6) }), 0, trottoirH + .005, 0, false); pelouse.rotation.x = -Math.PI / 2; solsPlus.push(pelouse);
  const gravier = A.mat({ color: 0xd8ccb0, roughness: 1 });
  const allee = (x0, z0, x1, z1, w = 2.2) => { const l = Math.hypot(x1 - x0, z1 - z0), o = A.ajoute(new THREE.PlaneGeometry(w, l), gravier, (x0 + x1) / 2, trottoirH + .01, (z0 + z1) / 2, false); o.rotation.set(-Math.PI / 2, 0, Math.atan2(x1 - x0, z1 - z0)); };
  allee(0, -10, 0, -2); allee(0, -2, -12.5, 9.5); allee(0, -2, 12.5, 9.5);
  const rond = A.ajoute(new THREE.CircleGeometry(3, 32), gravier, 0, trottoirH + .012, -3.2, false); rond.rotation.x = -Math.PI / 2;
  // les trottoirs devant les boutiques
  solsPlus.push(plaque(56, 2.6, 0, 22.2, pierre), plaque(2.6, 40, -26.2, 4, pierre), plaque(2.6, 40, 26.2, 4, pierre)); L.solsPlus = solsPlus;
  L.hauteur = (x, z) => (Math.abs(x) < SQ[0] && z > -15.9 && z < SQ[1]) || z > 20.9 || Math.abs(x) > 24.9 ? trottoirH : 0;
  // le monument aux morts, son petit canon ; le mât et le drapeau ; le grand arbre
  const obst = [];
  A.ajoute(new THREE.BoxGeometry(2, .5, 1), pierre, 0, trottoirH + .25, -3.2); A.ajoute(new THREE.BoxGeometry(1.5, 2.1, .32), A.mat({ color: 0x8c8a84 }), 0, trottoirH + 1.5, -3.25);
  const bronze = A.mat({ color: 0x4a5a4a, metalness: .5, roughness: .5 }); const canon = A.ajoute(new THREE.CylinderGeometry(.1, .14, 1.4, 12), bronze, 0, trottoirH + .55, -1.9); canon.rotation.x = Math.PI / 2 - .2;
  for (const sg of [-1, 1]) { const r = A.ajoute(new THREE.TorusGeometry(.32, .05, 6, 16), bronze, sg * .28, trottoirH + .35, -2.1); r.rotation.y = Math.PI / 2; }
  obst.push([0, -3, 1.4]);
  A.ajoute(new THREE.CylinderGeometry(.06, .09, 10, 10), A.mat({ color: 0xf2f2f2, metalness: .3 }), 2.6, 5, -4.6); A.ajoute(new THREE.SphereGeometry(.13, 10, 8), A.mat({ color: 0xc9a227, metalness: .8 }), 2.6, 10.05, -4.6);
  const drap = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1, 12, 4), new THREE.MeshStandardMaterial({ map: tex(toileDrapeau()), side: THREE.DoubleSide, roughness: .8 })); drap.position.set(3.6, 9.3, -4.6); scene.add(drap); obst.push([2.6, -4.6, .35]);
  const drapP = drap.geometry.attributes.position, drap0 = drapP.array.slice();
  const feuillage = A.mat({ color: 0x3f6e2a, roughness: 1, flatShading: true }), feuillage2 = A.mat({ color: 0x557f33, roughness: 1, flatShading: true }), tronc = A.mat({ color: 0x5a4030, roughness: 1 });
  const ecorce = A.mat({ map: tex(toile(64, 256, (x) => { x.fillStyle = "#5a4a3c"; x.fillRect(0, 0, 64, 256); for (let i = 0; i < 260; i++) { const v = Math.random(); x.fillStyle = v < .5 ? "rgba(30,22,16,.55)" : "rgba(140,125,105,.35)"; x.fillRect(Math.random() * 64, Math.random() * 256, 2 + Math.random() * 3, 10 + Math.random() * 40); } }), 2, 1), roughness: 1 });
  // un bouquet de feuilles : des centaines de petites feuilles de plusieurs verts, sur fond transparent
  const bouquet = (teintes) => toile(256, 256, (x) => { for (let i = 0; i < 1300; i++) { const a = Math.random() * 6.28, r = Math.pow(Math.random(), .45) * 118, px = 128 + Math.cos(a) * r, py = 128 + Math.sin(a) * r;
      x.save(); x.translate(px, py); x.rotate(Math.random() * 6.28); x.fillStyle = teintes[Math.floor(Math.random() * teintes.length)]; x.globalAlpha = r > 95 ? .5 + Math.random() * .3 : .85 + Math.random() * .15;
      x.beginPath(); x.ellipse(0, 0, 3 + Math.random() * 3, 7 + Math.random() * 4, 0, 0, 7); x.fill(); x.restore(); } });
  const feuilles = [["#2f5a22", "#3e7029", "#4f8432", "#5f9640", "#2a4a1c", "#6fa84a"], ["#355e24", "#467a2c", "#5a8c38", "#7aa64e", "#2e4f1e"]].map(t => new THREE.MeshStandardMaterial({ map: tex(bouquet(t)), alphaTest: .45, side: THREE.DoubleSide, roughness: .9 }));
  const geoB = new THREE.PlaneGeometry(1, 1);
  const arbre = (x, z, k = 1) => { const y0 = trottoirH, h = 4.2 * k;
    A.ajoute(new THREE.CylinderGeometry(.2 * k, .34 * k, h, 10), ecorce, x, y0 + h / 2, z);
    const m = A.ajoute(new THREE.CylinderGeometry(.5 * k, .55 * k, .25, 10), ecorce, x, y0 + .12, z, false);   // (les racines)
    // les branches maîtresses, qui partent en éventail
    for (let i = 0; i < 6; i++) { const a = i * 1.05 + .3, l = (1.8 + (i % 2) * .6) * k, br = A.ajoute(new THREE.CylinderGeometry(.05 * k, .13 * k, l, 6), ecorce, x + Math.cos(a) * l * .35, y0 + h * .82 + l * .3, z + Math.sin(a) * l * .35);
      br.rotation.set(Math.sin(a) * .9, 0, -Math.cos(a) * .9); }
    // la couronne : des bouquets de feuilles orientés au hasard dans un ellipsoïde (plus denses au bord)
    const N = Math.round(150 * k), cy = y0 + h + 1.4 * k;
    for (let i = 0; i < N; i++) { const u = Math.random() * 2 - 1, a = Math.random() * 6.28, r = Math.pow(Math.random(), .35), q = Math.sqrt(1 - u * u) * r;
      const b = new THREE.Mesh(geoB, feuilles[i % 2]); b.position.set(x + Math.cos(a) * q * 2.9 * k, cy + u * r * 2.1 * k, z + Math.sin(a) * q * 2.9 * k);
      b.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3); b.scale.setScalar((.95 + Math.random() * .7) * k); const c = .82 + Math.random() * .3; b.material = feuilles[i % 2]; b.userData.c = c; b.castShadow = true; scene.add(b); }
    obst.push([x, z, .55 * k]); };
  arbre(-6.5, -4.5, 1.25); arbre(9, 5, .85); arbre(-10, 6.5, .8); arbre(10.5, -7.5, .9);
  // le panneau « Welcome to Hill Valley »
  { const g = new THREE.Group(); g.position.set(-8.5, trottoirH, 8.7); g.rotation.y = .35; scene.add(g);
    const p = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 2.4), new THREE.MeshStandardMaterial({ map: tex(toileBienvenue()), transparent: true, alphaTest: .4, side: THREE.DoubleSide })); p.position.y = 1.55; g.add(p);
    for (const sx of [-1.15, 1.15]) { const m = new THREE.Mesh(new THREE.BoxGeometry(.09, 2.7, .09), A.mat({ color: 0xf2f2f2 })); m.position.set(sx, 1.35, -.02); g.add(m); const b = new THREE.Mesh(new THREE.SphereGeometry(.09, 8, 6), A.mat({ color: 0xf2f2f2 })); b.position.set(sx, 2.75, -.02); g.add(b); }
    obst.push([-8.5, 8.7, 1.4]); }
  // les bancs verts, les réverbères à globes
  const vert = A.mat({ color: 0x2f5a3a, roughness: .6 }), fonte = A.mat({ color: 0x1f3a2a, metalness: .4, roughness: .5 }), globe = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff2d0, emissiveIntensity: .4, roughness: .3 });
  const banc = (x, z, r) => { const g = new THREE.Group(); g.position.set(x, trottoirH, z); g.rotation.y = r; scene.add(g);
    for (let i = 0; i < 3; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(1.7, .05, .12), vert); s.position.set(0, .45, -.12 + i * .13); g.add(s); }
    for (let i = 0; i < 2; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(1.7, .1, .04), vert); s.position.set(0, .66 + i * .14, .2); g.add(s); }
    for (const sx of [-.75, .75]) { const pd = new THREE.Mesh(new THREE.BoxGeometry(.06, .45, .45), fonte); pd.position.set(sx, .22, 0); g.add(pd); } obst.push([x, z, .8]); };
  banc(-5, 9.6, 0); banc(5, 9.6, 0); banc(-13.8, -2, Math.PI / 2); banc(13.8, -2, -Math.PI / 2); banc(-4, -9.8, Math.PI); banc(4, -9.8, Math.PI);
  const reverbere = (x, z) => { A.ajoute(new THREE.CylinderGeometry(.07, .12, 4.2, 10), fonte, x, trottoirH + 2.1, z); A.ajoute(new THREE.SphereGeometry(.26, 14, 10), globe, x, trottoirH + 4.45, z);
    for (const sg of [-1, 1]) { A.ajoute(new THREE.SphereGeometry(.18, 12, 8), globe, x + sg * .45, trottoirH + 4.05, z); A.ajoute(new THREE.BoxGeometry(.9, .05, .05), fonte, x, trottoirH + 3.9, z); } obst.push([x, z, .3]); };
  for (const [x, z] of [[-14.8, 10.8], [14.8, 10.8], [-14.8, -10.8], [14.8, -10.8], [-5.5, -15], [5.5, -15], [-25.3, 2], [25.3, 2], [-12, 21.6], [12, 21.6]]) reverbere(x, z);
  // les poteaux télégraphiques et leurs fils, le long des boutiques
  const bois = A.mat({ color: 0x6a5038, roughness: 1 }), poteaux = [];
  for (const x of [-24, -12, 0, 12, 24]) { A.ajoute(new THREE.CylinderGeometry(.12, .16, 9, 8), bois, x, 4.5, 21.3); A.ajoute(new THREE.BoxGeometry(1.8, .12, .12), bois, x, 8.4, 21.3); poteaux.push([x, 21.3]); obst.push([x, 21.3, .3]); }
  { const m = new THREE.LineBasicMaterial({ color: 0x1a1a1a }); for (const dx of [-.8, -.3, .3, .8]) { const pts = []; for (let i = 0; i < poteaux.length - 1; i++) for (let k = 0; k <= 10; k++) { const u = k / 10, x = poteaux[i][0] + 12 * u; pts.push(new THREE.Vector3(x + dx, 8.45 - Math.sin(u * Math.PI) * .45, 21.3)); }
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), m)); } }
  // ---- le palais de justice (Hill Valley Courthouse) : brique, portique à colonnes, fronton et son horloge arrêtée ----
  { const ZF = -19.6, W = 40, H = 12.5, D = 14, briqueM = tex(toileBrique("#9a4a34", 256, 256), 10, 4);
    const fac = toile(2048, 640, (x) => { x.fillStyle = x.createPattern(toileBrique("#9a4a34"), "repeat"); x.fillRect(0, 0, 2048, 640);
      x.fillStyle = "#d9d2c2"; x.fillRect(0, 0, 2048, 30); x.fillRect(0, 300, 2048, 16); x.fillRect(0, 560, 2048, 80);
      for (let i = 0; i < 16; i++) { if (i >= 6 && i <= 9) continue; const fx = 40 + i * 125;
        for (const [fy, h] of [[70, 190], [355, 175]]) { x.fillStyle = "#e3dccb"; x.fillRect(fx - 8, fy - 10, 86, h + 18); x.beginPath(); x.moveTo(fx - 14, fy - 8); x.lineTo(fx + 35, fy - 34); x.lineTo(fx + 84, fy - 8); x.fill();
          x.fillStyle = "#2d3a44"; x.fillRect(fx, fy, 70, h); x.fillStyle = "rgba(210,225,235,.3)"; x.fillRect(fx + 4, fy + 4, 28, h * .45); x.fillStyle = "#e3dccb"; x.fillRect(fx + 33, fy, 4, h); x.fillRect(fx, fy + h * .5, 70, 4); } } });
    const mFac = A.mat({ map: tex(fac) }), mBr = A.mat({ map: briqueM }), toitM = A.mat({ color: 0x6e6a64, roughness: .9 });
    A.ajoute(new THREE.BoxGeometry(W, H, D), [mBr, mBr, toitM, toitM, mFac, mBr], 0, H / 2, ZF - D / 2);
    A.ajoute(new THREE.BoxGeometry(W + .6, .6, D + .6), A.mat({ color: 0xe0d9c8 }), 0, H + .3, ZF - D / 2);
    const piern = A.mat({ color: 0xe8e2d4, roughness: .8 });
    // les marches, le portique, les colonnes cannelées, l'entablement, le fronton
    for (let i = 0; i < 9; i++) A.ajoute(new THREE.BoxGeometry(14 - i * .1, .18, 3.6 - i * .4), piern, 0, trottoirH + i * .18 + .09, ZF + 3.6 - (3.6 - i * .4) / 2 + .2);
    const yP = trottoirH + 1.65;
    A.ajoute(new THREE.BoxGeometry(13.4, .3, 3.2), piern, 0, yP, ZF + 1.4);
    for (const x of [-5.4, -1.8, 1.8, 5.4]) { A.ajoute(new THREE.CylinderGeometry(.42, .5, 8.2, 20), piern, x, yP + 4.25, ZF + 2.4); A.ajoute(new THREE.BoxGeometry(1.1, .3, 1.1), piern, x, yP + .3, ZF + 2.4); A.ajoute(new THREE.BoxGeometry(1.15, .35, 1.15), piern, x, yP + 8.5, ZF + 2.4); }
    const ent = toile(1024, 96, (x) => { x.fillStyle = "#e8e2d4"; x.fillRect(0, 0, 1024, 96); x.fillStyle = "#3a3630"; x.font = "bold 46px Georgia, serif"; x.textAlign = "center"; x.fillText("HILL  VALLEY  COURTHOUSE", 512, 64); });
    const yE = yP + 9.3; A.ajoute(new THREE.BoxGeometry(14, 1.3, 3.4), [piern, piern, piern, piern, A.mat({ map: tex(ent) }), piern], 0, yE, ZF + 1.6);
    const tri = new THREE.Shape(); tri.moveTo(-7.4, 0); tri.lineTo(7.4, 0); tri.lineTo(0, 3); tri.closePath();
    const fr = A.ajoute(new THREE.ExtrudeGeometry(tri, { depth: 3.3, bevelEnabled: false }), piern, 0, yE + .65, ZF - .05); fr.position.z = ZF - .1;
    const tym = new THREE.Shape(); tym.moveTo(-6.6, 0); tym.lineTo(6.6, 0); tym.lineTo(0, 2.55); tym.closePath();
    A.ajoute(new THREE.ShapeGeometry(tym), A.mat({ map: tex(toileBrique("#8e4230"), .2, .2) }), 0, yE + .8, ZF + 3.22, false);
    const horloge = A.ajoute(new THREE.CircleGeometry(1.05, 40), new THREE.MeshStandardMaterial({ map: tex(toileHorloge()), roughness: .6 }), 0, yE + 1.85, ZF + 3.28, false);
    A.ajoute(new THREE.TorusGeometry(1.08, .09, 8, 40), A.mat({ color: 0x3a3630, metalness: .5 }), 0, yE + 1.85, ZF + 3.27);
    A.ajoute(new THREE.ConeGeometry(.12, 1.4, 8), A.mat({ color: 0x2a2a2a, metalness: .6 }), 0, yE + 4.3, ZF + 1.6);   // le paratonnerre
    for (const sx of [-2.8, 2.8]) A.ajoute(new THREE.DodecahedronGeometry(.55, 0), A.mat({ color: 0x4a4440, roughness: .8 }), sx, yE + 1.25, ZF + 2.9);   // les griffons de pierre
    const porte = toile(256, 320, (x) => { x.fillStyle = "#4a2c18"; x.fillRect(0, 0, 256, 320); x.strokeStyle = "#2a180c"; x.lineWidth = 8; x.strokeRect(10, 10, 112, 300); x.strokeRect(134, 10, 112, 300); x.fillStyle = "#c9a227"; x.fillRect(116, 150, 8, 30); x.fillRect(132, 150, 8, 30); });
    A.ajoute(new THREE.PlaneGeometry(2.6, 3.4), A.mat({ map: tex(porte) }), 0, yP + 1.85, ZF + .02, false); }
  // ---- les boutiques autour de la place : les façades d'après les photos, et d'autres pour compléter ----
  const ld = new THREE.TextureLoader(), texF = n => { const t = ld.load(`images/bttf/${n}.webp`); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const corps = A.mat({ color: 0x8e4630, roughness: .95 }), toitB = A.mat({ color: 0x5a5650, roughness: 1 });
  // une maison : sa façade (plaquée, découpée en haut selon sa silhouette) et son volume derrière ; o : position du milieu de la façade, r : vers où elle regarde
  const maison = (fac, larg, haut, cx, cz, r, prof = 9, hCorps = .78) => { const g = new THREE.Group(); g.position.set(cx, 0, cz); g.rotation.y = r; scene.add(g);
    const m = fac instanceof THREE.Texture ? new THREE.MeshStandardMaterial({ map: fac, transparent: true, alphaTest: .5, roughness: .85 }) : new THREE.MeshStandardMaterial({ map: tex(fac), roughness: .85 });
    const f = new THREE.Mesh(new THREE.PlaneGeometry(larg, haut), m); f.position.set(0, haut / 2, 0); f.castShadow = true; f.receiveShadow = true; g.add(f);
    const c = new THREE.Mesh(new THREE.BoxGeometry(larg - .1, haut * hCorps, prof), [corps, corps, toitB, toitB, corps, corps]); c.position.set(0, haut * hCorps / 2, -prof / 2 - .03); c.castShadow = true; g.add(c); };
  // au sud de la place (face au palais) : façades vers -z ; r = Math.PI
  const S = 23.5, rS = Math.PI;
  const rangee = (lst, x0, z, r, sens) => { let x = x0; for (const [fac, l, h, hc] of lst) { maison(fac, l, h, sens === "x" ? x + l / 2 : z, sens === "x" ? z : x + l / 2, r, 9, hc); x += l; } };
  rangee([[texF("f-travel"), 8.1, 9], [texF("f-westernauto"), 8.8, 9.5], [texF("f-florist"), 9.4, 8.5], [texF("f-cinema"), 17.6, 11, .62], [texF("f-bluebird"), 7.7, 10], [texF("f-stationery"), 7.6, 6]], -32.05 + 0, S, rS, "x");
  // à l'ouest (façades vers +x) et à l'est (vers -x)
  const B = (enseigne, opts) => toileBoutique({ larg: 9, haut: 8, enseigne, ...opts });
  rangee([[B("LOU'S CAFE", { mur: "#d9cdb0", brique: false, couleurEnseigne: "#1d4f8a", auvent: "#1d4f8a" }), 9, 8], [B("HILL VALLEY BANK", { mur: "#c9c1ae", brique: false, couleurEnseigne: "#2a2a2a", etages: 3 }), 10, 10.5],
    [B("RUTH'S FROCK SHOP", { couleurEnseigne: "#f4f0e6", texteEnseigne: "#1a1a1a", auvent: "#b81d24" }), 9, 8], [B("HILL VALLEY REALTY", { mur: "#7a3a28", couleurEnseigne: "#e9c84a", texteEnseigne: "#2a1a0a" }), 9, 9], [B("BARBER", { mur: "#d8c8a8", brique: false, couleurEnseigne: "#f4f0e6", texteEnseigne: "#b81d24", auvent: "#2a5aa0" }), 7, 7]], -24, -27.5, Math.PI / 2, "z");
  rangee([[B("STATLER MOTORS · STUDEBAKER", { mur: "#9ec9c4", brique: false, couleurEnseigne: "#dfe7e6", texteEnseigne: "#2a2a2a" }), 14, 8], [B("WESTERN AUTO STORES", { couleurEnseigne: "#b81d24", auvent: "#2f7a6a" }), 9, 9.5],
    [B("TEXACO", { mur: "#f2f0ea", brique: false, couleurEnseigne: "#c8102e", etages: 1 }), 9, 6], [B("HILL VALLEY DRUGS", { mur: "#8a4a30", couleurEnseigne: "#2a2a2a", auvent: "#d9a32a" }), 9, 8.5], [B("HARDWARE", { mur: "#b9a07a", brique: false, couleurEnseigne: "#2a4a2a", auvent: "#c8102e" }), 7, 7]], -24, 27.5, -Math.PI / 2, "z");
  // au loin, derrière le palais : des collines et des arbres
  for (let i = 0; i < 9; i++) A.ajoute(new THREE.SphereGeometry(14 + (i % 3) * 5, 12, 8), A.mat({ color: i % 2 ? 0x5e7a48 : 0x6e8a52, roughness: 1, flatShading: true }), -60 + i * 15, -4, -62 - (i % 2) * 8, false);
  // ---- les voitures des années 50, garées le long des trottoirs ----
  const voitures = [[0x9fd8c8, -21, 19.6, Math.PI / 2], [0xe9a6b8, 8, 19.6, Math.PI / 2], [0x1a1f2e, 17, 19.6, -Math.PI / 2], [0xd9c49a, 23.6, -4, 0], [0x8ab4d8, 23.6, 6, Math.PI], [0xb22a2a, -23.6, -6, 0], [0xf2efe6, -23.6, 9, Math.PI], [0x2a4a3a, 1, 19.6, -Math.PI / 2]];
  for (const [c, x, z, r] of voitures) { const v = voiture50(c, c === 0xf2efe6 ? 0x2a2a2a : 0xf2efe6); v.position.set(x, 0, z); v.rotation.y = r; scene.add(v);
    for (const k of [-1.8, 0, 1.8]) obst.push([x - Math.sin(r) * k, z - Math.cos(r) * k, 1.05]); }
  // ---- la DeLorean de Doc, garée au bord du trottoir : on y remonte pour rentrer ----
  const dl = creerDelorean(); poser(dl, -6, 16, -Math.PI / 2); scene.add(dl); L.delorean = dl; L.posDelorean = [-6, 16];
  // les limites : la place, les rues, les trottoirs (pas dans les boutiques, ni sur les marches du palais) ; ni dans les arbres, les voitures…
  L.limites = (x, z) => Math.abs(x) < 27.2 && z > -15.4 && z < 23.2 && !obst.some(([ox, oz, r]) => (x - ox) ** 2 + (z - oz) ** 2 < r * r)
    && !(Math.abs(x - dl.position.x) < 2.3 && Math.abs(z - dl.position.z) < 1.1 && dl.visible);
  L.portails = [];
  L.anim = (t) => { for (let i = 0; i < drapP.count; i++) { const ox = drap0[i * 3], oy = drap0[i * 3 + 1], u = (ox + .95) / 1.9; drapP.setZ(i, Math.sin(t / 260 + u * 5) * .18 * u); drapP.setY(i, oy - u * u * .1); } drapP.needsUpdate = true; drap.geometry.computeVertexNormals(); };
}

export const _etatMatrice = () => M;   // (pour les essais)
/* préparer à l'avance le lieu derrière la porte la plus proche (construit, à la bonne heure, et ses rendus compilés en tâche de fond),
   pour qu'en la passant on y soit tout de suite, sans attendre */
function preparerVoisin() {
  const now = performance.now(); if (!M || !M.L || M.preparation || now < (M.prepT || 0)) return; M.prepT = now + 700;
  const moi = M.moiNum && M.gens.get(M.moiNum); if (!moi) return; M.prets = M.prets || {};
  let best = null, bd = 14;
  for (const q of [...(M.L.portails || []), ...(M.L.raccourcis || [])]) { if (!q.vers || q.vers === M.lieu || M.prets[q.vers] || !LIEUX[baseLieu(q.vers)]) continue;
    const c = q.seuil || q.centre || (q.dans ? centrePortail(q) : null) || q.marche; if (!c) continue;
    const d = Math.hypot(c[0] - moi.g.position.x, c[1] - moi.g.position.z); if (d < bd) { bd = d; best = q.vers; } }
  if (!best || Object.keys(M.prets).length >= 2) return;
  M.preparation = true; const lieu = M.lieu;
  setTimeout(() => { try { if (!M || M.lieu !== lieu) return;
      const q = construireScene(best); if (q.L.setNuit) q.L.setNuit(estNuit()); M.prets[best] = q;
      const fin = () => { if (M) M.preparation = false; };
      // les images (murs, sols, affiches…) sont envoyées à la carte graphique dès maintenant
      const vues = new Set(); q.scene.traverse(o => { for (const m of [].concat(o.material || [])) for (const k in m) { const t = m[k]; if (t && t.isTexture && !vues.has(t)) { vues.add(t); try { M.rendu.initTexture(t); } catch (e) {} } } });
      if (q.scene.background && q.scene.background.isTexture) try { M.rendu.initTexture(q.scene.background); } catch (e) {}
      if (M.rendu.compileAsync) M.rendu.compileAsync(q.scene, M.camera).then(fin, fin); else fin();
    } catch (e) { if (M) M.preparation = false; } finally { if (M && !M.prets[best]) M.preparation = false; } }, 30);
}
export function allerAuLieu(id) { if (M && M.lieu !== id) changerLieu(id); }

/* --- la connexion en direct --- */
function envoyerWS(m) { if (M && M.ws && M.ws.readyState === 1) M.ws.send(JSON.stringify(m)); }
export function direDansLaCour(texte) { envoyerWS({ t: "dire", texte }); }
export function dj(action, donnees = {}) { envoyerWS({ t: "dj_" + action, ...donnees }); }
// la fumée et les lasers du DJ (tous ceux qui sont dans la salle des fêtes les voient)
export function fumee() { envoyerWS({ t: "fumee" }); }
// dans les bâtiments : monter (ou redescendre) à l'étage f, tout seul, par l'escalier
export function monterEtage(f) { const moi = M && M.moiNum && M.gens.get(M.moiNum); if (moi && baseLieu(M.lieu) === "etage" && M.L.monterA) { moi.info.danse = false; if (M.L.monterA(moi, f)) moi.rapide = true; } }
// on joue (console, flipper, fléchettes) ou l'on a fini (null) : les autres voient une petite icône au-dessus de soi
export function jouer(jeu) { envoyerWS({ t: "joue", jeu: jeu || null }); const moi = M && M.moiNum && M.gens.get(M.moiNum); if (moi) moi.info.joue = jeu || null; }
export function lasers(on) { envoyerWS({ t: "lasers", on: !!on }); }
// (administrateur) la luminosité de la salle des fêtes, de 0 (éteinte) à 1, pour tous ceux qui y sont
export function lumiereSalle(niveau) { envoyerWS({ t: "lumiere", niveau }); }
export function sanction(type, numero) { envoyerWS({ t: type, numero }); }
// retirer un message (le sien, ou n'importe lequel pour l'administrateur) ; "tout" vide la discussion du lieu
export function effacerDit(id) { envoyerWS(id === "tout" ? { t: "effacer", tout: true } : { t: "effacer", id }); }
export function avatarChange() { /* le serveur prévient tout le monde lui-même */ }
function connecter() {
  const ctx = M.ctx, url = (location.protocol === "https:" ? "wss://" : "ws://") + location.host + "/api/matrice?t=" + encodeURIComponent(ctx.token);
  const ws = new WebSocket(url); M.ws = ws; let ouverte = false;
  ws.onopen = () => { ouverte = true; M.echecs = 0; changerLieu(M.lieu || ctx.lieuDepart || "grande", M.lieu ? M.posEntree : null); };
  ws.onmessage = ev => {
    if (!M) return; let m; try { m = JSON.parse(ev.data); } catch (e) { return; }
    if (m.t === "etat") {
      if (m.lieu !== M.lieu) return;
      M.moiNum = m.moi;
      if (!M.gens.has(m.moi)) ajouterAncien({ ...ctx.moiInfo(), numero: m.moi, x: M.posEntree[0], z: M.posEntree[1] });   // (déjà là après un passage sans coupure)
      m.gens.forEach(ajouterAncien);
      ajouterPNJ(); ajouterDJ(); ajouterBarman();
      M.fil = m.dits || []; ctx.surFil && ctx.surFil(M.fil);
      ctx.surPresents && ctx.surPresents([...M.gens.values()].map(p => p.info));
    } else if (m.t === "arrive") { ajouterAncien(m.p); ctx.surPresents && ctx.surPresents([...M.gens.values()].map(p => p.info)); }
    else if (m.t === "part") { retirerAncien(m.numero); for (const k of [0, 1]) retirerAncien(FANTOME(m.numero, k)); ctx.surPresents && ctx.surPresents([...M.gens.values()].map(p => p.info)); }
    else if (m.t === "aller") { const p = M.gens.get(m.numero); if (p) viser(p, m.x, m.z); }
    else if (m.t === "dit") { dire(m.numero, m.texte); M.fil.push(m); if (M.fil.length > 20) M.fil.shift(); ctx.surFil && ctx.surFil(M.fil); }
    else if (m.t === "efface") { M.fil = m.tout ? [] : M.fil.filter(d => d.id !== m.id); ctx.surFil && ctx.surFil(M.fil); }
    else if (m.t === "avatar") { const p = M.gens.get(m.p.numero); if (p) { const pos = p.g.position.clone(), q = ajouterAncien({ ...p.info, ...m.p }); if (q) q.g.position.copy(pos); } }
    else if (m.t === "comptes") ctx.surComptes && ctx.surComptes(m.lieux);
    else if (m.t === "fumee") { M.L && M.L.fumee && M.L.fumee(); }
    else if (m.t === "lasers") { M.lasers = !!m.on; M.L && M.L.setLasers && M.L.setLasers(M.lasers); ctx.surLasers && ctx.surLasers(M.lasers); }
    else if (m.t === "lumiere") { M.lumiere = Number.isFinite(+m.niveau) ? +m.niveau : 1; M.L && M.L.setLumiere && M.L.setLumiere(M.lumiere); ctx.surLumiere && ctx.surLumiere(M.lumiere); }
    else if (m.t === "dj") { M.djJoue = !!(m.dj && m.dj.courant); M.djTitre = M.djJoue ? normTitre(`${m.dj.courant.titre || ""} ${m.dj.courant.artiste || ""}`) : ""; M.L && M.L.majBoutonDJ && M.L.majBoutonDJ(!!(m.dj && m.dj.courant)); ctx.surDJ && ctx.surDJ(m.dj); }
    else if (m.t === "ambiance") { M.ambiance = m.mode; majAmbiance(); ctx.surAmbiance && ctx.surAmbiance(m.mode); }
    else if (m.t === "assis") { const p = M.gens.get(m.numero); if (p) { if (Number.isInteger(m.i)) asseoir(p, m.i); else p.info.assis = null; } }
    else if (m.t === "slow_demande") ctx.surInvitation && ctx.surInvitation({ de: m.de, nom: m.nom });
    else if (m.t === "slow_refus") ctx.surInfo && ctx.surInfo(`${m.nom} ne peut pas danser maintenant… une autre fois !`);
    else if (m.t === "slow") {
      const A2 = M.gens.get(m.a), B2 = M.gens.get(m.b);
      for (const [p, q] of [[A2, B2], [B2, A2]]) if (p && q) { p.info.slow = q.info.numero; p.info.danse = false; p.info.assis = null; }
      // chacun se place face à l'autre, à 60 cm
      const moi = M.gens.get(M.moiNum);
      if (moi && (m.a === M.moiNum || m.b === M.moiNum)) { if (moi.info.danse) { moi.info.danse = false; M.ctx.surDanse && M.ctx.surDanse(false); }
        const cx = m.x, cz = m.z, k = m.a === M.moiNum ? -.3 : .3; const v = viserLibre(cx + k, cz); viser(moi, v[0], v[1]); envoyerWS({ t: "aller", x: v[0], z: v[1] });
        ctx.surInfo && ctx.surInfo("💞 Un slow… profitez-en !"); }
    }
    else if (m.t === "slow_fin") { for (const n of [m.a, m.b]) { const p = M.gens.get(n); if (p) p.info.slow = null; } }
    else if (m.t === "z_chef") { const avant = estChefZ(); M.chefZ = m.numero; if (!avant && estChefZ()) { M.zInit = true; for (const z of M.zomb ? M.zomb.values() : []) { z.x = z.tx; z.z = z.tz; } } }
    else if (m.t === "z_etat") recevoirEtatZ(m.l || []);
    else if (m.t === "z_tir") { const z = M.zomb && M.zomb.get(m.id), p = M.gens.get(Number.isInteger(m.eq) ? FANTOME(m.de, m.eq) : m.de); if (p) { p.tirT = performance.now(); if (z && Number.isInteger(m.eq)) eclairDuCanon(p, +m.dx || 0, +m.dz || 0); } sonTir(.55);
      if (z) { impactZ(z, +m.dx || 0, +m.dz || 0); if (estChefZ()) blesserZ(z, +m.dx || 0, +m.dz || 0); } }
    else if (m.t === "z_mord") { if (m.numero === M.moiNum) { if (Number.isInteger(m.eq)) blesserEquipier(m.eq, m.d === 2 ? 2 : 1, +m.x || 0, +m.z || 0); else subirMorsure(+m.x || 0, +m.z || 0, m.d === 2 ? 2 : 1); } }
    else if (m.t === "z_equipe" && Array.isArray(m.l)) recevoirEquipe(m.de, m.l.slice(0, 2));
    else if (m.t === "z_zombi") { const p = M.gens.get(m.de); if (p) { p.info.mortT = m.on ? performance.now() : 0; if (m.on) flaqueMort(p); } }
    else if (m.t === "z_ramasse") { const o = (M.objets || []).find(q => q.id === m.id); if (o) { o.cache = performance.now() + 45000; o.sp.visible = false; } }
    else if (m.t === "joue") { const p = M.gens.get(m.numero); if (p) p.info.joue = m.jeu || null; }
    else if (m.t === "danse") { const p = M.gens.get(m.numero); if (p) p.info.danse = styleDanse(m.on); }
    else if (m.t === "pnj" && m.p && (m.p.id >= 12 && m.p.id <= 15 || m.p.id === 17)) { ctx.surPNJTrio && ctx.surPNJTrio(m.p); const ty = { 12: 0, 13: 1, 14: 2, 17: 3, 15: 4 }[m.p.id]; if (M.zTexB) delete M.zTexB[ty];
      for (const z of M.zomb ? [...M.zomb.values()] : []) if (z.ty === ty) { if (ty < 4) { const d = { id: z.id, ty, x: z.x, z: z.z, n: z.n, hp: z.hp }; const k = { tx: z.tx, tz: z.tz, mortT: z.mortT, chemin: z.chemin }; retirerZ(z); Object.assign(creerZ(d), k); } else { z.mesh.material.map = texChien(); z.mesh.material.needsUpdate = true; tailleZ(z); } } }
    else if (m.t === "pnj" && m.p && m.p.id === 16) { ctx.surPNJTrio && ctx.surPNJTrio(m.p); retirerAncien(SMITH); }
    else if (m.t === "pnj" && m.p && m.p.id >= 21 && m.p.id <= 26) { ctx.surPNJTrio && ctx.surPNJTrio(m.p);   // un héros de Resident Evil retouché : ceux qui le jouent, et les équipiers, sont redessinés
      for (const p of [...M.gens.values()]) if (p.info.heros === m.p.id) { const pos = p.g.position.clone(), base = p.info.vrai || p.info;
        const q = ajouterAncien(p.info.equipier ? infoEquipier(m.p.id, p.info.numero, pos.x, pos.z, p.info.proprio, p.info.slot) : { ...base }); if (q) { q.g.position.copy(pos); q.etg = p.etg; } } }
    else if (m.t === "almanach") { M.alm = m.a; majAlmanach(); ctx.surAlmanach && ctx.surAlmanach(m.a); }
    else if (m.t === "almanach_ok") { M.alm = { ...(M.alm || {}), pris: true }; majAlmanach(); changerLieu("bttf-cour", [.2, 8.5], 0); }
    else if (m.t === "pnj" && m.p && m.p.id === ID_DOC) { ctx.surPNJTrio && ctx.surPNJTrio(m.p); if (M.gens.has(DOC)) { const q = M.gens.get(DOC), pos = q.g.position.clone(); retirerAncien(DOC); const d = ajouterDoc(pos.x, pos.z); } }
    else if (m.t === "pnj" && m.p && m.p.id >= 27 && m.p.id <= 29) { ctx.surPNJTrio && ctx.surPNJTrio(m.p); retirerAncien(-m.p.id); }   // (Depeche Mode : redessinés aussitôt)
    else if (m.t === "pnj" && m.p && m.p.id >= 18 && m.p.id <= 20) { ctx.surPNJTrio && ctx.surPNJTrio(m.p); retirerAncien(-m.p.id); }   // (le groupe : redessiné aussitôt, à sa place)
    else if (m.t === "pnj" && m.p && m.p.id === 7) { ctx.surPNJTrio && ctx.surPNJTrio(m.p); retirerAncien(HERNANDEZ); }
    else if (m.t === "pnj" && m.p && m.p.id >= 8 && m.p.id <= 11) { ctx.surPNJTrio && ctx.surPNJTrio(m.p); for (const [num] of BEEGEES) retirerAncien(num); retirerAncien(TRAVOLTA); }
    else if (m.t === "pnj" && m.p && m.p.id >= 4 && m.p.id <= 6) { ctx.surPNJTrio && ctx.surPNJTrio(m.p); for (const n of [DANSEUR, ZOMBIE, MARIEE]) retirerAncien(n); }
    else if (m.t === "pnj" && m.p && m.p.id === 3) { ctx.surPNJBar && ctx.surPNJBar(m.p); if (M.gens.has(BARMAN)) { const pos = M.gens.get(BARMAN).g.position.clone(); retirerAncien(BARMAN); ajouterBarman(); const q = M.gens.get(BARMAN); if (q) q.g.position.copy(pos); } }
    else if (m.t === "pnj" && m.p && m.p.id === 2) { ctx.surPNJDJ && ctx.surPNJDJ(m.p); if (M.gens.has(DJ)) { retirerAncien(DJ); ajouterDJ(); } }
    else if (m.t === "pnj") { ctx.surPNJ && ctx.surPNJ(m.p); const p = M.gens.get(PNJ); if (p) { const pos = p.g.position.clone(); retirerAncien(PNJ); ajouterPNJ(); const q = M.gens.get(PNJ); if (q) q.g.position.copy(pos); } }
    else if (m.t === "flipper" && m.jeu === "flechettes") { M.classementFlechettes = m.top || []; M.L && M.L.majClassementFlechettes && M.L.majClassementFlechettes(M.classementFlechettes); }
    else if (m.t === "flipper") { M.classementFlipper = m.top || []; M.L && M.L.majClassement && M.L.majClassement(M.classementFlipper); }
    else if (m.t === "info") ctx.surInfo && ctx.surInfo(m.texte);
  };
  ws.onclose = ev => {
    if (!M || ws !== M.ws) return;
    if (ev.code === 4003 || ev.code === 4000) { ctx.surErreur && ctx.surErreur(ev.reason || "Déconnecté de la Matrice"); return; }
    if (!ouverte && (M.echecs = (M.echecs || 0) + 1) >= 2) { ctx.surErreur && ctx.surErreur("Impossible d'entrer dans la Matrice pour l'instant (connexion, ou exclusion par l'administrateur)."); return; }
    if (M.ouvert) { ctx.surInfo && ctx.surInfo("Connexion perdue… on se reconnecte."); M.reco = setTimeout(() => M && connecter(), 3000); }
  };
}
export const _sonsApo = () => [sonApo, sonFeu, sonRepos].map(a => a ? (a.paused ? "pause" : "joue") : "aucun").concat([...sonsCourts].map(a => a.src.split("/").pop() + ":" + a.volume.toFixed(2)));   // (pour les essais)
