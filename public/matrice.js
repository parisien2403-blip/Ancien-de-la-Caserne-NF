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
};
export const TENUES = {
  garde: { nom: "Gendarme" }, civil: { nom: "Jean et blouson" }, tshirt: { nom: "T-shirt et jean" }, polo: { nom: "Polo et jean" }, survet: { nom: "Survêtement 80" },
  robe: { nom: "Robe" }, costume: { nom: "Costume" },
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
    const c = o.couleur || "#22324f", peau = "#e9c4a0", t = o.tenue || "civil";
    const basDefaut = t === "garde" ? "#26324e" : t === "survet" ? c : t === "costume" ? assombrir(c, .75) : "#3d5a80";
    const bas = t === "robe" ? null : (o.bas || basDefaut), pieds = o.pieds || "#2a2522";
    if (bas) { x.fillStyle = bas; x.beginPath(); x.roundRect(72, 250, 24, 150, 10); x.roundRect(104, 250, 24, 150, 10); x.fill();
      if (t === "survet") { x.fillStyle = "#fff"; x.fillRect(78, 252, 4, 144); x.fillRect(118, 252, 4, 144); } }
    else { x.fillStyle = peau; x.beginPath(); x.roundRect(80, 330, 16, 70, 7); x.roundRect(104, 330, 16, 70, 7); x.fill(); }
    if (bas && t !== "survet" && t !== "garde" && t !== "costume") { x.fillStyle = "rgba(255,255,255,.18)"; x.fillRect(77, 262, 2, 130); x.fillRect(121, 262, 2, 130); }   // couture du jean
    x.fillStyle = pieds; x.beginPath(); x.ellipse(82, 404, 20, 10, 0, 0, 7); x.ellipse(118, 404, 20, 10, 0, 0, 7); x.fill();
    if (pieds === "#f2f2f2") { x.fillStyle = "#cfcfcf"; x.fillRect(62, 408, 40, 3); x.fillRect(98, 408, 40, 3); }   // semelle des baskets
    const haut = t === "garde" ? "#1c2541" : c;
    x.fillStyle = haut; x.beginPath();
    if (t === "robe") { x.moveTo(62, 150); x.lineTo(138, 150); x.lineTo(160, 335); x.lineTo(40, 335); } else x.roundRect(58, 145, 84, 120, 22);
    x.fill();
    // les bras : pendants, ou levés pour danser (o.pose = "haut") ; en disco, le bras droit pointe le doigt en l'air puis vers le sol
    const DISCO = { disco1: [.42, -2.8], disco2: [.75, -.36] };
    const bras = (cx, sens) => {
      const disco = DISCO[o.pose], doigt = disco && sens < 0;
      const a = disco ? disco[sens > 0 ? 0 : 1] : o.pose === "haut" ? sens * 2.55 : o.pose === "mi" ? sens * 1.1 : 0;
      x.save(); x.translate(cx, 158); x.rotate(a);
      const court = t === "tshirt" || t === "polo";
      if (court) { x.fillStyle = peau; x.beginPath(); x.roundRect(-10, 24, 20, 72, 10); x.fill(); x.fillStyle = haut; x.beginPath(); x.roundRect(-14, -10, 28, 44, 12); x.fill(); }
      else { x.fillStyle = haut; x.beginPath(); x.roundRect(-12, -8, 24, 104, 12); x.fill(); }
      if (t === "survet") { x.fillStyle = "#fff"; x.fillRect(sens < 0 ? -6 : 2, -6, 4, 92); }
      if (t === "garde") { x.fillStyle = "#f2f2f0"; x.fillRect(-12, 20, 24, 9); }
      if (doigt) {
        // le poing fermé, le pouce sur le côté et l'index tendu, façon Travolta
        x.fillStyle = peau; x.beginPath(); x.roundRect(-11, 86, 22, 20, 7); x.fill();
        x.beginPath(); x.roundRect(4, 98, 6, 30, 3); x.fill();
        x.beginPath(); x.ellipse(-12, 96, 4, 8, -.5, 0, 7); x.fill();
        x.strokeStyle = "rgba(120,70,40,.45)"; x.lineWidth = 1.5; x.beginPath(); x.moveTo(-8, 99); x.lineTo(3, 99); x.moveTo(-8, 103); x.lineTo(3, 103); x.stroke();
      } else { x.fillStyle = peau; x.beginPath(); x.arc(0, 96, 11, 0, 7); x.fill(); }
      x.restore();
    };
    bras(48, 1); bras(152, -1);
    if (t === "tshirt") { x.fillStyle = peau; x.beginPath(); x.ellipse(100, 146, 14, 8, 0, 0, Math.PI); x.fill(); x.strokeStyle = assombrir(c, .8); x.lineWidth = 3; x.beginPath(); x.ellipse(100, 146, 15, 9, 0, 0, Math.PI); x.stroke(); }
    if (t === "polo") { x.fillStyle = assombrir(c, .82); x.beginPath(); x.moveTo(82, 142); x.lineTo(100, 150); x.lineTo(90, 162); x.fill(); x.beginPath(); x.moveTo(118, 142); x.lineTo(100, 150); x.lineTo(110, 162); x.fill();
      x.fillStyle = assombrir(c, .9); x.fillRect(97, 150, 6, 26); x.fillStyle = "#f4f1ea"; for (const yb of [156, 166]) { x.beginPath(); x.arc(100, yb, 2, 0, 7); x.fill(); } }
    if (t === "costume") { x.fillStyle = "#f4f1ea"; x.beginPath(); x.moveTo(86, 146); x.lineTo(100, 190); x.lineTo(114, 146); x.fill(); x.fillStyle = "#8a1f2b"; x.fillRect(97, 152, 6, 40); }
    if (t === "civil") { x.fillStyle = "#e9e2d0"; x.beginPath(); x.moveTo(88, 146); x.lineTo(100, 168); x.lineTo(112, 146); x.fill(); x.fillStyle = assombrir(c, .8); x.fillRect(98, 168, 4, 92); }
    if (t === "garde") {
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
    x.fillStyle = peau; x.fillRect(88, 118, 24, 32);
    if (tete) {
      // la tête détourée, posée sur le cou (cadrée sur 112 px de large au plus, 124 de haut)
      const R = o.reglage || {}, z = R.k || 1;
      const k = Math.min(112 / tete.width, 124 / tete.height) * z, w = tete.width * k, h = tete.height * k;
      if (o.moi) { x.shadowColor = "#f6d465"; x.shadowBlur = 14; }
      x.save(); x.translate(100 + (R.dx || 0), 132 + (R.dy || 0)); x.rotate((R.r || 0) * Math.PI / 180);
      x.drawImage(tete, -w / 2, -h, w, h); x.restore(); x.shadowBlur = 0;
    } else {
      x.fillStyle = peau; x.beginPath(); x.ellipse(100, 72, 44, 54, 0, 0, 7); x.fill();
      x.fillStyle = "#5a3d2b"; x.beginPath(); x.ellipse(100, 40, 46, 30, 0, Math.PI, 0); x.fill();
      x.fillStyle = "#8a3b22"; x.font = "bold 34px Arial"; x.textAlign = "center"; x.fillText(o.initiales || "?", 100, 92);
    }
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
  // au fond du porche, la lumière de la cour d'honneur ; un battant de la porte en bois, ouvert contre le mur
  const bout = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 4.4), new THREE.MeshBasicMaterial({ map: tex(toile(64, 64, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#f3f1ea"); g.addColorStop(.7, "#d9d2c4"); g.addColorStop(1, "#9c968c"); x.fillStyle = g; x.fillRect(0, 0, w, h); })) }));
  bout.position.set(0, 2.2, FZ - 13.9); scene.add(bout);
  A.ajoute(new THREE.BoxGeometry(.08, 3.9, 2.1), A.mat({ color: 0x6b4226, roughness: .7 }), 2.3, 1.95, FZ - 1.5);
  for (let k = 0; k < 4; k++) A.ajoute(new THREE.BoxGeometry(.02, .7, 1.7), A.mat({ color: 0x5a361e }), 2.25, .6 + k * .95, FZ - 1.5, false);
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
  for (let f = 0; f < 5; f++) for (const cx of COLS) { if (Math.abs(cx) < 4.2 && f < 2) continue; if (alea() > .24) continue;
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
  const fondNuit = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 4.4), new THREE.MeshBasicMaterial({ color: 0x232838 })); fondNuit.position.set(0, 2.2, FZ - 13.85); fondNuit.visible = false; scene.add(fondNuit); L.nuitObjets.push(fondNuit);
  const lanterne = new THREE.PointLight(0xffd59a, 30, 12, 1.5); lanterne.position.set(0, 4.1, FZ + .6); lanterne.visible = false; scene.add(lanterne); L.nuitObjets.push(lanterne);
  // la petite plaque « République française » à gauche du porche
  emaille(.5, .34, (c, w, h) => { c.fillStyle = "#f7f5ef"; c.fillRect(0, 0, w, h); c.fillStyle = "#1d3f73"; c.fillRect(8, 8, 18, h - 16); c.fillStyle = "#c8102e"; c.fillRect(44, 8, 18, h - 16); c.fillStyle = "#1d3f73"; c.font = "bold 13px Georgia"; c.textAlign = "left"; c.fillText("RÉPUBLIQUE", 68, 30); c.fillText("FRANÇAISE", 68, 48); }, -4.75, 3.0, FZ + .04);

  /* --- où l'on peut marcher, la caméra, les passages --- */
  L.limites = (x, z) => (x > -62 && x < 62 && z > -7.2 && z < 6.4) || (x > -35.5 && x < -28.5 && z > -24 && z < 24) || (Math.abs(x) < 2.3 && z > -12.9 && z <= -7.2);
  L.portails.push({ dans: (x, z) => Math.abs(x) < 2.3 && z < -12.5, vers: "grande", arrivee: [0, 11] });
  // la grille noire ne se traverse pas : entre le trottoir et la cage d'entrée, on passe par le portillon
  L.trajet = (x0, z0, x1, z1) => { const dedans = z => z < -7.3;
    if (dedans(z0) === dedans(z1)) return [[x1, z1]];
    return dedans(z0) ? [[.8, -8.3], [.8, -6.7], [x1, z1]] : [[.8, -6.7], [.8, -8.3], [x1, z1]]; };
  raccourci(L, scene, [5.4, 4.6, 2.4], [0, 2.3, -12.6], { vers: "grande", arrivee: [0, 11] });
  L.anim = (temps) => {
    // le drapeau ondule
    const p = geoD.attributes.position; for (let i = 0; i < p.count; i++) { const u = (baseD[i * 3] + 1.1) / 2.2; p.array[i * 3 + 2] = Math.sin(temps / 380 - u * 5 + baseD[i * 3 + 1] * .8) * .16 * u; }
    p.needsUpdate = true; geoD.computeVertexNormals();
    if (L.nuit) for (const s of L.silhouettes) animerSilhouette(s, temps);
  };
  L.depart = [.8, -5.2]; L.taille = 1.85; L.suivi = { d: 7.5, h: 8.5, av: 3, vy: 2 }; L.fov = [60, 72];
  L.boite = [-63, 63, -11.8, 6.3];
  L.cam = { pos: [.8, 8.5, 2.3], vise: [.8, 2, -8] };
}

// un porche ou une porte qu'on touche une fois pour passer directement de l'autre côté (zone invisible)
function raccourci(L, scene, [w, h, d], [x, y, z], cible) {
  const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshBasicMaterial({ visible: false })); o.position.set(x, y, z); scene.add(o);
  (L.raccourcis = L.raccourcis || []).push({ obj: o, ...cible });
}
function construireLieu(id, scene) {
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
    const fond = toile(1760, 1080, (x, w, h) => {      // 40 px par mètre
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
    // le bâtiment du fond, percé du passage carré (4,8 m × 4,4 m) qu'on traverse
    A.facadePercee({ largeur: fondW, hauteur: fondH, profondeur: 12, toileFacade: fond, passage: { largeur: 4.8, hauteur: 4.4 }, x: 0, z: -18, couleurPassage: 0xcfc4b0 });
    // les balcons en relief
    for (let r = 0; r < 7; r++) for (let c = 1; c < 14; c += 2) A.ajoute(new THREE.BoxGeometry(2.3, .16, .9), A.mat({ color: 0xfbfaf6 }), -fondW / 2 + (c + .5) * fondW / 14, fondH - (34 + r * 112 + 80) / 40, -17.55);
    // la nuit : des fenêtres allumées çà et là
    L.nuitObjets = []; L.silhouettes = [];
    graine = 77;
    const chaud = new THREE.MeshBasicMaterial({ color: 0xffd58a, transparent: true, opacity: .85 });
    for (let r = 0; r < 7; r++) for (let c = 0; c < 14; c++) if (alea() < .32) {
      const f = new THREE.Mesh(new THREE.PlaneGeometry(1.45, 1.8), chaud); f.position.set(-fondW / 2 + (c + .5) * fondW / 14, fondH - (34 + r * 112 + 37) / 40, -17.97); f.visible = false; scene.add(f); L.nuitObjets.push(f);
      if (alea() < .45) { const s = silhouette(1.45, 1.8); s.position.set(f.position.x, f.position.y, -17.96); scene.add(s); L.nuitObjets.push(s); L.silhouettes.push(s); } }
    // dans le passage : quelques marches et la lumière au bout
    for (let k = 0; k < 3; k++) A.ajoute(new THREE.BoxGeometry(4.8, .17, .5), A.mat({ color: 0xbdb5a6 }), 0, .085 + k * .17, -26 - k * .5);
    A.ajoute(new THREE.BoxGeometry(4.8, .51, 3.5), A.mat({ color: 0xc9c1b2 }), 0, .255, -28.5);
    A.ajoute(new THREE.BoxGeometry(40, 18, 2), A.mat({ color: 0xd8cdb8 }), 0, 9, -42);

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
      const fx = cote * 12.5;
      // façade extrudée (profil dans la longueur), percée de la voûte au bout du fond
      const us = VOUTES.map(VZ => cote < 0 ? -(VZ + 2) : VZ + 2);   // positions des voûtes dans le profil
      // à droite, la salle des fêtes s'arrête 6 m avant le bout : là, en retrait, l'ancien bar
      const FIN = cote > 0 ? LONG / 2 - 6 : LONG / 2;
      const f = new THREE.Shape(); f.moveTo(-LONG / 2, 0); f.lineTo(FIN, 0); f.lineTo(FIN, HPP); f.lineTo(-LONG / 2, HPP); f.closePath();
      for (const u of us) { const v = new THREE.Path(); v.moveTo(u - 1.9, 0); v.lineTo(u - 1.9, 2.9); v.absellipse(u, 2.9, 1.9, 1.9, Math.PI, 0, true); v.lineTo(u + 1.9, 0); v.closePath(); f.holes.push(v); }
      const t = tex(piedToile(us.map(u => (u / LONG + .5) * 1600))); t.repeat.set(1 / LONG, 1 / HPP); t.offset.set(.5, 0);
      if (cote > 0) {   // la nuit, on voit bouger les jeux de lumière de la fête à travers les baies vitrées
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
      const bat = A.ajoute(new THREE.ExtrudeGeometry(f, { depth: PROF, bevelEnabled: false, curveSegments: 20 }), [A.mat({ map: t }), A.mat({ color: 0xd9d0bd })], cote < 0 ? fx - PROF : fx + PROF, 0, -2);
      bat.rotation.y = cote < 0 ? Math.PI / 2 : -Math.PI / 2;
      A.ajoute(new THREE.BoxGeometry(PROF + .6, .45, (cote > 0 ? LONG - 6 : LONG) + .6), A.mat({ color: 0xd3c9b3 }), fx + cote * PROF / 2, HPP + .2, cote > 0 ? -5 : -2);   // corniche du toit
      for (const VZ of VOUTES) A.ajoute(new THREE.BoxGeometry(.3, 4.8, 3.8), A.mat({ color: 0x3a3631 }), fx + cote * (PROF - .4), 2.4, VZ);   // fond des garages
      // les marches le long du bâtiment, arrêtées avant la voûte
      for (let k = 0; k < 4; k++) { const larg = 2 - k * .45, lgM = cote > 0 ? 10.4 : 16.4; A.ajoute(new THREE.BoxGeometry(larg, .17, lgM), A.mat({ color: k % 2 ? 0xbdb7aa : 0xc9c3b6 }), fx - cote * larg / 2, .085 + k * .17, cote > 0 ? 2.7 : 5.7); }
      if (cote > 0) {
        /* l'ancien bar, bien en retrait au bout du bâtiment (entre la salle des fêtes et la grande aile en brique) :
           la double porte à gauche, ses deux fenêtres à droite */
        const RX = fx + 3.5, RL = 4, RH = 6.2, RZ = 10;
        const bar = toile(200, 310, (x, w, h) => {
          pierre(x, 0, 0, w, h, "#e2dac8"); x.fillStyle = "#d3c9b3"; x.fillRect(0, 0, w, 16); x.fillStyle = "rgba(60,45,30,.25)"; x.fillRect(0, 16, w, 3);
          const PX = 14, PY = h - 150, PW = 84, PH = 150;
          x.fillStyle = "#cfc6b3"; x.fillRect(PX - 8, PY - 40, PW + 16, PH + 40);
          x.fillStyle = "#5e3820"; x.fillRect(PX, PY - 32, PW, 28); x.fillStyle = "#9fb3bf"; x.fillRect(PX + 5, PY - 28, PW - 10, 20);
          for (const s of [0, 1]) { const X = PX + s * PW / 2; x.fillStyle = "#6b4226"; x.fillRect(X + 1, PY, PW / 2 - 2, PH);
            x.fillStyle = "#8ea4b2"; x.fillRect(X + 6, PY + 8, PW / 2 - 12, PH * .52); x.fillStyle = "#6b4226"; x.fillRect(X + PW / 4 - 1, PY + 8, 3, PH * .52); x.fillRect(X + 6, PY + 8 + PH * .26, PW / 2 - 12, 3);
            x.strokeStyle = "#4c2c17"; x.lineWidth = 2; x.strokeRect(X + 7, PY + PH * .64, PW / 2 - 14, PH * .28); x.fillStyle = "#c9a227"; x.fillRect(X + (s ? 5 : PW / 2 - 9), PY + PH * .55, 4, 12); }
          x.fillStyle = "rgba(120,70,40,.45)"; x.font = "bold 26px Georgia"; x.textAlign = "center"; x.fillText("B A R", PX + PW / 2, PY - 52);
          x.fillStyle = "#2a2a2a"; x.fillRect(PX + PW / 2 - 6, PY - 96, 12, 8);
          // les deux fenêtres, à droite de la porte
          for (const cx of [128, 176]) { const FX = cx - 20, FY = h - 168, FW = 40, FH = 92;
            x.fillStyle = "#efe9dc"; x.fillRect(FX - 6, FY - 6, FW + 12, FH + 12); x.fillStyle = "#d6cdbb"; x.fillRect(FX - 8, FY + FH + 4, FW + 16, 6);
            const g = x.createLinearGradient(FX, FY, FX, FY + FH); g.addColorStop(0, "#9db1bf"); g.addColorStop(1, "#56697a"); x.fillStyle = g; x.fillRect(FX, FY, FW, FH);
            x.fillStyle = "#f4f1ea"; x.fillRect(FX + FW / 2 - 2, FY, 4, FH); for (const f2 of [1 / 3, 2 / 3]) x.fillRect(FX, FY + FH * f2, FW, 2.5); }
        });
        const mb = A.mat({ map: tex(bar) }), mc = A.mat({ color: 0xddd4c2 }), mt = A.mat({ color: 0x8a8378 });
        A.ajoute(new THREE.BoxGeometry(PROF - 3.5, RH, RL), [mc, mb, mt, mc, mc, mc], RX + (PROF - 3.5) / 2, RH / 2, RZ);
        A.ajoute(new THREE.BoxGeometry(.4, .35, RL), A.mat({ color: 0xd3c9b3 }), RX - .1, RH + .1, RZ);                     // sa corniche
        A.ajoute(new THREE.BoxGeometry(.9, .17, 2.3), A.mat({ color: 0xc9c3b6 }), RX - .45, .085, RZ - 1.05);              // la marche devant la porte
        const sl = A.ajoute(new THREE.PlaneGeometry(3.5, RL), A.mat({ map: tex(T.dalles, 2, 2) }), fx + 1.75, .014, RZ, false); sl.rotation.x = -Math.PI / 2;
        const lt = new THREE.PointLight(0xffd59a, 12, 8, 1.6); lt.position.set(RX - .5, 3.6, RZ - 1.1); lt.visible = false; scene.add(lt); L.nuitObjets.push(lt);
      }
      const al = A.ajoute(new THREE.PlaneGeometry(3, 34), A.mat({ map: tex(T.dalles, 1.5, 17) }), fx - cote * 3.5, .012, -2, false); al.rotation.x = -Math.PI / 2;
      const cn = A.ajoute(new THREE.PlaneGeometry(.22, 34), A.mat({ color: 0x4a4744 }), fx - cote * 5.1, .016, -2, false); cn.rotation.x = -Math.PI / 2;
      // un autocar bleu gendarmerie dans chaque voûte, l'avant vers la cour
      const caisseMat = A.mat({ color: 0x2c5bb0, roughness: .4, metalness: .2 }), fa = A.mat({ map: tex(avantBus), roughness: .4 }), fl = A.mat({ map: tex(flancBus), roughness: .4 });
      for (const VZ of VOUTES) {
        const car = new THREE.Group(); car.position.set(fx + cote * 6.2, 0, VZ); car.rotation.y = cote < 0 ? Math.PI / 2 : -Math.PI / 2; scene.add(car);
        const caisse = new THREE.Mesh(new THREE.BoxGeometry(2.5, 3.3, 11), [fl, fl, caisseMat, caisseMat, fa, caisseMat]); caisse.position.y = 1.95; caisse.castShadow = true; car.add(caisse);
        for (const [rx, rz] of [[-1.15, 3.6], [1.15, 3.6], [-1.15, -3], [1.15, -3], [-1.15, -4.3], [1.15, -4.3]]) { const roue = new THREE.Mesh(new THREE.CylinderGeometry(.5, .5, .35, 18), A.mat({ color: 0x151515 })); roue.rotation.z = Math.PI / 2; roue.position.set(rx, .5, rz); car.add(roue); }
      }
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
    const ZF = 15.5, LF = 25, HSOC = 4.6, HB = 20.2, PF2 = 10, CF = []; for (let k = 0; k < 8; k++) CF.push(-LF / 2 + (k + .5) * LF / 8);
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
    const f2 = A.facadePercee({ largeur: LF, hauteur: HB, profondeur: PF2, toileFacade: face2, passage: { largeur: 3.6, hauteur: 4.0 }, x: 0, z: ZF, couleurPassage: 0xd9cfbd });
    f2.rotation.y = Math.PI; f2.position.z = ZF + PF2; f2.castShadow = false;
    if (f2.userData.toit) f2.userData.toit.position.z = ZF + PF2 / 2;
    A.ajoute(new THREE.BoxGeometry(LF + .3, .45, .5), A.mat({ color: 0xf0ebe0 }), 0, HB - .3, ZF - .2);                  // corniche en relief
    A.ajoute(new THREE.BoxGeometry(LF, .25, .25), A.mat({ color: 0xd8cebc }), 0, HSOC + .05, ZF - .12, false);           // bandeau du socle
    // au bout du porche : la rue, à travers la grille (la Presse des Clubs, l'Artisan Boulanger)
    const vueRue = A.ajoute(new THREE.PlaneGeometry(3.6, 4.0), new THREE.MeshBasicMaterial({ map: tex(toile(256, 284, (x, w, h) => {
      x.fillStyle = "#e7dfcf"; x.fillRect(0, 0, w, h); x.fillStyle = "#cfc6b4"; x.fillRect(0, 0, w, 60);
      x.fillStyle = "#121212"; x.fillRect(0, 70, 130, 26); x.fillStyle = "#fff"; x.font = "bold 17px Impact, Arial"; x.textAlign = "center"; x.fillText("PRESSE DES CLUBS", 62, 90);
      x.fillStyle = "#1b2537"; x.fillRect(134, 66, 122, 32); x.fillStyle = "#f0e2bf"; x.font = "italic bold 18px Georgia"; x.fillText("Artisan", 190, 88);
      for (let i = 0; i < 30; i++) { x.fillStyle = `hsl(${alea() * 360}, 60%, 55%)`; x.fillRect(8 + (i % 6) * 20, 104 + Math.floor(i / 6) * 22, 17, 19); }
      x.fillStyle = "#f0d9a6"; x.fillRect(140, 104, 110, 110); x.fillStyle = "#7d7a74"; x.fillRect(0, 222, w, h - 222);
      x.fillStyle = "#151515"; for (let X = 4; X < w; X += 13) x.fillRect(X, 96, 3, 188); x.fillRect(0, 120, w, 4); x.fillRect(0, 260, w, 4); })) }), 0, 2.0, ZF + PF2 - .05, false);
    vueRue.rotation.y = Math.PI;
    const vueNuit = A.ajoute(new THREE.PlaneGeometry(3.6, 4.0), new THREE.MeshBasicMaterial({ color: 0x1a2030, transparent: true, opacity: .7 }), 0, 2.0, ZF + PF2 - .1, false);
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
      x.fillStyle = "#f1ece2"; x.fillRect(sx, 60, 44, h - 260); for (let y = 66; y < h - 206; y += 22) { x.fillStyle = "#8ea2b2"; x.fillRect(sx + 6, y, 32, 17); }
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
      x.fillStyle = "#efe9dd"; x.fillRect(px - 7, h - 122, 70, 122); x.fillStyle = "#b8452f"; x.fillRect(px, h - 115, 56, 115);
      x.fillStyle = "#e9d7c8"; x.fillRect(px + 8, h - 107, 40, 60); x.fillStyle = "#b8452f"; x.fillRect(px + 26, h - 107, 4, 60); x.fillStyle = "#2a2a2a"; x.fillRect(px + 22, h - 140, 12, 7); });
    const briqueSeule = A.mat({ map: tex(toileCote(true, false)) });
    for (const s of [-1, 1]) { const face = A.mat({ map: tex(toileAile(s < 0)) }), interieur = A.mat({ map: tex(toileCote(s > 0, true)) }), toitA = A.mat({ color: 0x6b6b6b });
      const mats = s > 0 ? [briqueSeule, interieur, toitA, toitA, briqueSeule, face] : [interieur, briqueSeule, toitA, toitA, briqueSeule, face];
      A.ajoute(new THREE.BoxGeometry(AW, AH, AZ1 - AZ0), mats, s * (AX0 + AW / 2), AH / 2, (AZ0 + AZ1) / 2); }
    // la nuit : fenêtres allumées sur cette façade aussi
    for (let f = 0; f < 5; f++) for (const cx of CF) { if (alea() > .26) continue;
      const y = HSOC + .55 + f * 3 + .875, fe = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.65), lumiere()); fe.rotation.y = Math.PI; fe.position.set(cx, y, ZF - .02); fe.visible = false; scene.add(fe); L.nuitObjets.push(fe);
      if (alea() < .4) { const s = silhouette(1.4, 1.65); s.rotation.y = Math.PI; s.position.set(cx, y, ZF - .03); scene.add(s); L.nuitObjets.push(s); L.silhouettes.push(s); } }

    L.limites = (x, z) => (Math.abs(x) < 10.2 && z > -17.4 && z < 14.8 && !(Math.abs(x) > 8.2 && z > 11.6)) || (Math.abs(x) < 1.5 && z >= 14.8 && z < 24);
    // le porche de cette façade mène à la rue du Faubourg-Poissonnière (on arrive sur le trottoir, face à la caserne)
    L.portails.push({ dans: (x, z) => Math.abs(x) < 1.8 && z > 18.5, vers: "rue", arrivee: [.8, -5.2] });
    raccourci(L, scene, [4.2, 4.4, 2.4], [0, 2.2, 16.4], { vers: "rue", arrivee: [.8, -5.2] });
    // on se promène avec la caméra derrière soi, et on peut faire demi-tour (glisser le doigt, ou ↻)
    L.taille = 1.85; L.suivi = { d: 8.5, h: 3.9, av: 6, vy: 3.3 }; L.fov = [60, 72]; L.boite = [-11.6, 11.6, -17.4, 15.1];
    const cols5 = [0xff2d55, 0x2d7bff, 0x2dff8a, 0xffd22d, 0xc04dff];
    L.anim = (temps) => {
      const P = L.porteFete; if (P) P.spot.intensity = L.nuit ? 70 + 50 * Math.max(0, Math.sin(temps / 300)) : 0;
      if (!L.nuit || !L.baiesFete) return;
      for (const b of L.baiesFete) { const ph = temps / 420 + b.i * 1.3;
        b.pl.material.opacity = b.i === 8 ? .55 + .45 * Math.max(0, Math.sin(ph)) : .4 + .6 * Math.max(0, Math.sin(ph)) * (.6 + .4 * Math.sin(ph * 2.7));
        if (Math.floor(ph / Math.PI) % 3 === 0) b.pl.material.color.setHex(cols5[(b.i + Math.floor(temps / 1700)) % 5]); }
      if (P) { const c = cols5[Math.floor(temps / 1700) % 5]; P.spot.color.setHex(c); P.vide.material.color.setHex(c).lerp(new THREE.Color(0xffe0b0), .55); }
      for (const s of L.silhouettes) animerSilhouette(s, temps); };
    // on n'entre dans la salle des fêtes que par sa porte ouverte
    L.portails.push({ dans: (x, z) => x > 10 && z > 5.4 && z < 7.6, vers: "fetes", arrivee: [-4.4, 6], yaw: -Math.PI / 2 });
    raccourci(L, scene, [.8, 4.8, 2.2], [12.4, 2.4, 6.5], { vers: "fetes", arrivee: [-4.4, 6], yaw: -Math.PI / 2 });
    L.depart = [0, 6]; L.cam = { pos: [0, 8, 30], vise: [0, 7.5, -10] };
  }

  if (id === "fetes") {
    /* La salle des fêtes : l'intérieur du bâtiment de plain-pied de droite de la cour d'honneur (vide : ni meuble ni personnage).
       Sol en petits carreaux beiges (quelques carreaux bleus et bordeaux), murs crème, lambris en bois verni et plinthe,
       grandes fenêtres à petits carreaux en verre dépoli côté cour, piliers et appliques en demi-boule. */
    const X0 = -5.8, X1 = 5.8, Z0 = -3, Z1 = 15, HT = 5.4, LAMB = 1.15;
    const larg = X1 - X0, long = Z1 - Z0, cz = (Z0 + Z1) / 2;
    graine = 23;
    const carreaux = toile(640, 640, (x, w, h) => {     // 16 × 16 carreaux de 10 cm
      x.fillStyle = "#4b4033"; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) { const v = alea(), r = alea();
        x.fillStyle = r < .004 ? "#2e4f74" : r < .007 ? "#6e2a2a" : `hsl(${40 + v * 6}, ${34 + v * 10}%, ${60 + v * 9}%)`;
        x.fillRect(i * 40 + 2, j * 40 + 2, 36, 36);
        x.fillStyle = "rgba(255,255,255,.06)"; x.fillRect(i * 40 + 3, j * 40 + 3, 34, 10); }
    });
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
    A.ajoute(new THREE.BoxGeometry(EL * 2, .86, .3), A.mat({ color: 0xe6d9bd }), 0, -.43, Z1 + .15, false);
    L.sol = solS;
    graine = 41;
    const peinture = A.mat({ color: 0xe6d9bd, roughness: .95 });
    const lambris = toile(512, 256, (x, w, h) => {      // planches verticales vernies
      for (let X = 0; X < w; X += 32) { const v = alea(); const g = x.createLinearGradient(X, 0, X + 32, 0);
        g.addColorStop(0, `hsl(24, 58%, ${30 + v * 6}%)`); g.addColorStop(.5, `hsl(26, 62%, ${40 + v * 6}%)`); g.addColorStop(1, `hsl(24, 58%, ${32 + v * 6}%)`);
        x.fillStyle = g; x.fillRect(X, 0, 32, h); x.fillStyle = "rgba(40,20,10,.55)"; x.fillRect(X, 0, 2, h);
        x.strokeStyle = "rgba(60,30,10,.25)"; x.lineWidth = 1; for (let k = 0; k < 4; k++) { x.beginPath(); x.moveTo(X + 6 + k * 6, 0); x.bezierCurveTo(X + 10 + k * 6, h / 3, X + 2 + k * 6, h * .66, X + 7 + k * 6, h); x.stroke(); } }
    });
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
    mur("z", X1 + .15, Z0, Z1, -1); mur("x", Z0 - .15, X0, X1, 1); mur("x", Z1 + .15, X0, X1, -1);
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
        const pv = A.ajoute(new THREE.PlaneGeometry(10, 9), A.mat({ map: tex(textures().paves, 3, 3) }), X0 - 5, -.01, z, false); pv.rotation.x = -Math.PI / 2;
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
        L.setNuit = (n) => { fond.material.map = n ? texN : texJ; fond.material.needsUpdate = true; };
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
    for (const sg of [-1, 1]) { const xc = sg * lp / 4;
      A.ajoute(new THREE.BoxGeometry(lp / 2 - .02, hp, .07), brun, xc, yb + hp / 2, Z1 - .05, false);
      for (const [yy, hh] of [[.55, .7], [1.55, 1.0]]) A.ajoute(new THREE.BoxGeometry(lp / 2 - .28, hh, .03), brunC, xc, yb + yy + (hh > .8 ? .2 : 0), Z1 - .1, false);
      A.ajoute(new THREE.BoxGeometry(.05, .18, .05), A.mat({ color: 0xc9a227, metalness: .7, roughness: .25 }), sg * .1, yb + 1.05, Z1 - .13, false); }
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

    // au fond de la salle : des tables rectangulaires avec nappes blanches, et des chaises d'école
    const nappe = A.mat({ color: 0xf7f5ef, roughness: .9 }), tube = A.mat({ color: 0x3c3f44, metalness: .6, roughness: .4 });
    const contreplaque = A.mat({ color: 0xb9814a, roughness: .55 });
    const chaise = (x, z, rot) => {
      const c = new THREE.Group(); c.position.set(x, 0, z); c.rotation.y = rot; scene.add(c);
      for (const [px, pz] of [[-.19, -.17], [.19, -.17], [-.19, .17], [.19, .17]]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(.013, .013, .45, 6), tube); p.position.set(px, .225, pz); c.add(p); }
      for (const px of [-.19, .19]) { const m = new THREE.Mesh(new THREE.CylinderGeometry(.013, .013, .42, 6), tube); m.position.set(px, .66, .19); c.add(m); }
      const as = new THREE.Mesh(new THREE.BoxGeometry(.42, .025, .4), contreplaque); as.position.y = .46; as.castShadow = true; c.add(as);
      const dos = new THREE.Mesh(new THREE.BoxGeometry(.42, .2, .02), contreplaque); dos.position.set(0, .76, .2); dos.rotation.x = -.12; dos.castShadow = true; c.add(dos);
    };
    const tables = [];
    for (const zt of [Z0 + 1.35, Z0 + 3.35]) for (const xt of [-2.7, 1.9]) {
      const L3 = 3.6, P = .9;
      A.ajoute(new THREE.BoxGeometry(L3, .04, P), nappe, xt, .76, zt);                                            // le plateau et la nappe
      for (const sgn of [-1, 1]) A.ajoute(new THREE.BoxGeometry(L3 + .04, .32, .015), nappe, xt, .61, zt + sgn * (P / 2 + .008), false);   // la nappe qui retombe
      for (const sgn of [-1, 1]) A.ajoute(new THREE.BoxGeometry(.015, .32, P + .03), nappe, xt + sgn * (L3 / 2 + .008), .61, zt, false);
      for (const [dx, dz] of [[-1.65, -.36], [1.65, -.36], [-1.65, .36], [1.65, .36]]) A.ajoute(new THREE.CylinderGeometry(.02, .02, .45, 6), tube, xt + dx, .225, zt + dz, false);
      for (let k = 0; k < 4; k++) { const cx = xt - 1.35 + k * .9; chaise(cx, zt - .47, Math.PI); chaise(cx, zt + .47, 0); /* rangées sous la table, dossier vers l'extérieur */ }
      tables.push([xt - L3 / 2 - .2, xt + L3 / 2 + .2, zt - 1, zt + 1]);
    }

    // la boule à facettes, au centre du plafond
    const facettes = toile(512, 256, (x, w, h) => { for (let i = 0; i < w; i += 16) for (let j = 0; j < h; j += 16) { const v = alea();
      x.fillStyle = v > .93 ? "#ffffff" : `hsl(${200 + v * 40}, ${6 + v * 14}%, ${70 + v * 28}%)`; x.fillRect(i + 1, j + 1, 14, 14); } x.fillStyle = "rgba(0,0,0,.5)"; });
    const boule = new THREE.Mesh(new THREE.SphereGeometry(.5, 24, 16), new THREE.MeshStandardMaterial({ map: tex(facettes), metalness: .25, roughness: .2, flatShading: true, emissive: 0xb8c4d0, emissiveIntensity: .35, emissiveMap: tex(facettes) }));
    boule.position.set(0, HT - 1.45, cz); boule.castShadow = true; scene.add(boule);
    A.ajoute(new THREE.CylinderGeometry(.015, .015, .9, 6), A.mat({ color: 0x8a8a8a, metalness: .6 }), 0, HT - .5, cz, false);   // la chaînette
    // petits reflets colorés au sol et aux murs
    const reflets = [];
    for (let i = 0; i < 26; i++) { const a = alea() * Math.PI * 2, d = 1.5 + alea() * 4.5;
      const t = new THREE.Mesh(new THREE.CircleGeometry(.07 + alea() * .05, 10), new THREE.MeshBasicMaterial({ color: [0xffffff, 0xfff1a8, 0xa8d8ff, 0xffb8e0][i % 4], transparent: true, opacity: .55, depthWrite: false }));
      t.rotation.x = -Math.PI / 2; t.position.set(Math.cos(a) * d * .55, .02, cz + Math.sin(a) * d); scene.add(t); reflets.push([t, a, d]); }
    L.anim = (temps) => { boule.rotation.y = temps / 3000; for (const [t, a, d] of reflets) { const b = a + temps / 3000; t.position.x = Math.max(X0 + .3, Math.min(X1 - .3, Math.cos(b) * d * .55)); t.position.z = cz + Math.sin(b) * d; } };
    // à droite de l'escalier : le coin du DJ (deux tables à nappes blanches, platines, table de mixage, micro, casque, enceintes, lumières, fumée)
    const dz = Z1 - .75, noir = A.mat({ color: 0x1a1a1c, roughness: .5 }), alu = A.mat({ color: 0xb8bcc2, metalness: .7, roughness: .3 });
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
      return { spot, cone, x, k };
    });
    // la machine à fumée, sous la table, et les nappes de fumée au ras du sol
    A.ajoute(new THREE.BoxGeometry(.4, .22, .3), noir, -3.2, .11, dz + .05);
    const fumeeTex = tex(toile(128, 128, (x) => { const g = x.createRadialGradient(64, 64, 4, 64, 64, 62); g.addColorStop(0, "rgba(240,240,250,.85)"); g.addColorStop(1, "rgba(235,235,245,0)"); x.fillStyle = g; x.fillRect(0, 0, 128, 128); }));
    const fumees = [];
    for (let i = 0; i < 22; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: fumeeTex, transparent: true, depthWrite: false, opacity: .5 })); scene.add(sp); fumees.push([sp, alea() * 1000, .6 + alea() * .8]); }
    const animBoule = L.anim;
    L.anim = (temps) => {
      animBoule && animBoule(temps);
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
    // toucher le coin du DJ ouvre la musique
    const zone = new THREE.Mesh(new THREE.BoxGeometry(4.6, 3.2, 1.6), new THREE.MeshBasicMaterial({ visible: false })); zone.position.set(-3.3, 1.6, dz); scene.add(zone); L.zoneDJ = [zone];
    // le gros bouton ▶ / ⏹ au-dessus des platines : on lance ou on arrête la musique pour toute la salle
    const bouton = (fond, signe) => tex(toile(128, 128, (x) => { x.fillStyle = "rgba(0,0,0,.35)"; x.beginPath(); x.arc(64, 68, 58, 0, 7); x.fill();
      x.fillStyle = fond; x.beginPath(); x.arc(64, 62, 56, 0, 7); x.fill(); x.lineWidth = 6; x.strokeStyle = "#fff"; x.stroke(); x.fillStyle = "#fff"; x.beginPath();
      if (signe === "play") { x.moveTo(48, 34); x.lineTo(96, 62); x.lineTo(48, 90); } else x.rect(40, 38, 48, 48); x.fill(); }));
    const texPlay = bouton("#2f9e5b", "play"), texStop = bouton("#c4394a", "stop");
    const btn = new THREE.Sprite(new THREE.SpriteMaterial({ map: texPlay, depthTest: false, transparent: true })); btn.renderOrder = 10;
    btn.position.set(-2.75, 1.5, dz - .2); btn.scale.set(.62, .62, 1); scene.add(btn); L.boutonDJ = btn;
    L.majBoutonDJ = (joue) => { btn.material.map = joue ? texStop : texPlay; btn.material.needsUpdate = true; };

    // lumière de la salle
    const ambiant = new THREE.AmbientLight(0xfff1dc, .55); scene.add(ambiant);
    for (const z of [Z0 + 4, cz, Z1 - 4]) { const l = new THREE.PointLight(0xfff0d8, 6, 14, 1.4); l.position.set(0, HT - .6, z); scene.add(l); lumSalle.push(l); }
    // la lumière de la salle se baisse (l'administrateur règle de 100 % à 15 %) ; les jeux de lumière du DJ ne changent pas,
    // la boule à facettes et ses reflets ressortent d'autant plus
    for (const l of lumSalle) l.userData.base = l.intensity;
    L.setLumiere = (niveau) => { const k = Math.max(.15, Math.min(1, +niveau || 1)), s = (1 - k) / .85; L.lumiere = k;
      for (const l of lumSalle) l.intensity = l.userData.base * k; ambiant.intensity = .55 * Math.max(.3, k);
      applique.emissiveIntensity = .9 * k; vitre.emissiveIntensity = vitreB.emissiveIntensity = .55 * Math.max(.4, k);
      scene.children.filter(o => o.isHemisphereLight).forEach(h => h.intensity = .35 * Math.max(.3, k));
      boule.material.emissiveIntensity = .35 + .4 * s;
      for (const [t] of reflets) { t.material.opacity = .55 + .45 * s; t.scale.setScalar(1 + .8 * s); } };
    L.interieur = true; L.boite = [X0, X1, Z0, Z1];
    L.limites = (x, z) => x > X0 + .4 && x < bx - .75 && z > Z0 + .6 && z < Z1 - .6 && !(Math.abs(x) < EL + .2 && z > EZ - 1) && !tables.some(([a, b, c, d]) => x > a && x < b && z > c && z < d);
    L.portails.push({ dans: (x, z) => x < X0 + .7 && Math.abs(z - (Z0 + 2.5 * long / 5)) < 1.1, vers: "grande", arrivee: [8.8, 6.5], yaw: Math.PI / 2 });
    raccourci(L, scene, [1, 3, 2.6], [X0 - .3, 1.5, Z0 + 2.5 * long / 5], { vers: "grande", arrivee: [8.8, 6.5], yaw: Math.PI / 2 });
    L.plafond = HT - .35;
    L.depart = [0, Z1 - 6]; L.cam = { pos: [-3.6, 2.4, Z1 - .8], vise: [1.2, 1.6, Z0 + 1] };
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
  const rendu = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  rendu.setPixelRatio(Math.min(devicePixelRatio, matchMedia("(pointer: coarse)").matches ? 1.5 : 2));
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
    // toucher un ancien : son nom, écrire, (administrateur) faire taire / exclure
    const toi = M.moiNum && M.gens.get(M.moiNum);
    if (toi && toi.corps && ray.intersectObject(toi.corps)[0]) { danser(toi.info.danse ? false : M.styleDanse || "balance"); return; }
    const corps = [...M.gens.values()].filter(p => !p.moi && p.corps).map(p => p.corps);
    const h = ray.intersectObjects(corps)[0];
    if (h) { const p = [...M.gens.values()].find(q => q.corps === h.object); if (p && p.info.pnj) { dire(PNJ, phrasePNJ(Math.random() * 1000)); return; } if (p) { ctx.surToucherAncien && ctx.surToucherAncien(p.info); return; } }
    // le bouton ▶ / ⏹ des platines : touché si le doigt tombe tout près de lui à l'écran (plus facile qu'au pixel près)
    if (M.L.boutonDJ) { const q = M.L.boutonDJ.position.clone().project(M.camera);
      if (q.z < 1 && Math.hypot((q.x + 1) / 2 * r.width - (e.clientX - r.left), (1 - q.y) / 2 * r.height - (e.clientY - r.top)) < Math.max(36, r.width * .045)) { ctx.surBoutonDJ && ctx.surBoutonDJ(); return; } }
    if (M.L.zoneDJ) { const t = ray.intersectObjects(M.L.zoneDJ, true)[0]; if (t) { ctx.surToucherDJ && ctx.surToucherDJ(); return; } }
    const rc = (M.L.raccourcis || []).find(q => ray.intersectObject(q.obj)[0]);
    if (rc) { if (!M.passage) { M.passage = true; changerLieu(rc.vers, rc.arrivee, rc.yaw); } return; }
    const s = ray.intersectObject(M.L.sol)[0];
    if (s) allerVers(s.point.x, s.point.z, true);
    else { const d = ray.ray.direction, o = ray.ray.origin; allerVers(o.x + d.x * 40, o.z + d.z * 40, true); }   // vers le haut d'un mur : dans sa direction
  });
  rendu.domElement.addEventListener("pointercancel", () => { glisse = null; });
  M.redim = () => { if (!M) return; const w = ctx.conteneur.clientWidth, h = ctx.conteneur.clientHeight; if (!w || !h) return; rendu.setSize(w, h); M.camera.aspect = w / h; placerCamera(true); };
  addEventListener("resize", M.redim);
  M.ro = new ResizeObserver(M.redim); M.ro.observe(ctx.conteneur);
  connecter();
  M.minuteur = setInterval(majAmbiance, 60000);
  let avant = performance.now();
  rendu.setAnimationLoop(t => {
    if (!M || !M.scene) return;
    const dt = Math.min(.05, (t - avant) / 1000); avant = t;
    for (const p of M.gens.values()) {
      if (p.cible) { const d = p.cible.clone().sub(p.g.position); d.y = 0; const L = d.length();
        if (L < .05) { if (p.chemin && p.chemin.length) p.cible = p.chemin.shift(); else { p.cible = null; if (p.corps) p.corps.position.y = 0; if (p.moi) M.repere.material.opacity = 0; } }
        else { p.g.position.addScaledVector(d.normalize(), Math.min(L, 3.4 * dt)); if (p.corps) p.corps.position.y = Math.abs(Math.sin(t / 90)) * .06;
          if (p.moi) { const pt = M.L.portails.find(q => q.dans(p.g.position.x, p.g.position.z)); if (pt && !M.passage) { M.passage = true; changerLieu(pt.vers, pt.arrivee, pt.yaw); } } } }
      if (p.bulle && p.bulleFin && t > p.bulleFin) { p.g.remove(p.bulle); p.bulle = null; }
      // la danse : il se balance d'un côté à l'autre en levant les bras
      if (p.corps && p.poses) {
        if (p.info.danse === "disco") {
          // façon Saturday Night Fever : le doigt en l'air, puis vers le sol, en roulant des hanches
          const ph = t / 460 + p.info.numero * .7, pose = Math.floor(ph) % 2 ? "disco2" : "disco1";
          if (p.corps.material.map !== p.poses[pose]) { p.corps.material.map = p.poses[pose]; p.corps.material.needsUpdate = true; }
          const v = ph % 1, coup = Math.sin(Math.min(1, v * 3) * Math.PI / 2);
          p.corps.material.rotation = (pose === "disco1" ? -.1 : .12) * coup; p.corps.position.x = (pose === "disco1" ? -.08 : .1) * coup; if (!p.cible) p.corps.position.y = Math.abs(Math.sin(ph * Math.PI * 2)) * .05; p.dansait = true; }
        else if (p.info.danse) { const ph = t / 320 + p.info.numero * .7, pose = ["repos", "mi", "haut", "mi"][Math.floor(ph * 2) % 4];
          if (p.corps.material.map !== p.poses[pose]) { p.corps.material.map = p.poses[pose]; p.corps.material.needsUpdate = true; }
          p.corps.material.rotation = Math.sin(ph * Math.PI) * .13; p.corps.position.x = Math.sin(ph * Math.PI) * .14; if (!p.cible) p.corps.position.y = Math.abs(Math.sin(ph * Math.PI * 2)) * .07; p.dansait = true; }
        else if (p.dansait) { p.dansait = false; p.corps.material.map = p.poses.repos; p.corps.material.needsUpdate = true; p.corps.material.rotation = 0; p.corps.position.x = 0; p.corps.position.y = 0; }
      }
    }
    if (M.L.anim) M.L.anim(t);
    animerPNJ();
    // la musique de la fête : à fond dans la salle ; dehors, la nuit, par la porte ouverte (plus fort en s'approchant)
    const moiP = M.moiNum && M.gens.get(M.moiNum), P = M.L.porteFete;
    let vol = M.L.interieur ? 1 : 0;
    if (P && M.L.nuit && moiP) { const d = Math.hypot(moiP.g.position.x - P.x, moiP.g.position.z - P.z); vol = .07 + .38 * Math.max(0, 1 - d / 22); }
    if (Math.abs(vol - (M.volume ?? -1)) > .015) { M.volume = vol; M.ctx.surVolume && M.ctx.surVolume(vol); }
    placerCamera(false);
    rendu.render(M.scene, M.camera);
  });
  M.redim();
  return M;
}

export function fermer() {
  if (!M) return;
  M.ouvert = false;
  try { M.ws && M.ws.close(1000, "Fermé"); } catch (e) {}
  clearTimeout(M.reco); clearInterval(M.minuteur);
  removeEventListener("resize", M.redim); M.ro && M.ro.disconnect();
  M.rendu.setAnimationLoop(null); M.rendu.dispose(); M.rendu.domElement.remove();
  M = null;
}

function construireScene(id) {
  const scene = new THREE.Scene(), T = textures();
  scene.background = tex(T.ciel); scene.fog = new THREE.Fog(0xcfe6f7, 70, 160);
  scene.add(new THREE.HemisphereLight(0xdcefff, 0x8a7a66, 1.1));
  const soleil = new THREE.DirectionalLight(0xfff2dd, 2.3); soleil.position.set(-18, 30, 14); soleil.castShadow = true;
  Object.assign(soleil.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, far: 120 }); soleil.shadow.mapSize.set(2048, 2048); soleil.shadow.bias = -.0005;
  scene.add(soleil);
  const L = construireLieu(id, scene);
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
      if (L.lumiereJour) L.lumiereJour.visible = !n;
    };
  }
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
    if (M.L.plafond) pos.y = Math.min(pos.y, M.L.plafond);
  }
  // dehors : tourner la vue (glisser le doigt, ou ↻) fait tourner la caméra autour de son bonhomme
  const yaw = 0;
  if (yaw) { const px = moi ? moi.g.position.x : vise.x, pz = moi ? moi.g.position.z : vise.z, cs = Math.cos(yaw), sn = Math.sin(yaw);
    for (const v of [pos, vise]) { const dx = v.x - px, dz = v.z - pz; v.x = px + dx * cs - dz * sn; v.z = pz + dx * sn + dz * cs; } }
  if (M.L.boite) { const [a, b, c2, d] = M.L.boite; pos.x = Math.max(a + .3, Math.min(b - .3, pos.x)); pos.z = Math.max(c2 + .3, Math.min(d - .3, pos.z)); }
  if (net || !M.camVise) { M.camera.position.copy(pos); M.camVise = vise.clone(); }
  else { M.camera.position.lerp(pos, .06); M.camVise.lerp(vise, .06); }
  M.camera.fov = M.L.fov ? M.L.fov[portrait ? 1 : 0] : portrait ? (M.L.interieur ? 74 : 66) : (M.L.interieur ? 62 : 50); M.camera.updateProjectionMatrix(); M.camera.lookAt(M.camVise);
}

/* --- jour ou nuit : d'après l'heure réelle à Paris, sauf si l'administrateur l'a imposé --- */
const SOLEIL_PARIS = [[8.7, 17.3], [8.1, 18.1], [7.3, 18.8], [7.2, 20.5], [6.4, 21.2], [5.8, 21.9], [6.1, 21.8], [6.8, 21.1], [7.6, 20.1], [8.3, 19.0], [8.2, 17.3], [8.7, 16.9]];
function estNuit() {
  const mode = M && M.ambiance || "auto";
  if (mode === "jour") return false; if (mode === "nuit") return true;
  const f = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", month: "numeric", hour: "numeric", minute: "numeric", hourCycle: "h23" }).formatToParts(new Date());
  const v = k => +f.find(p => p.type === k).value, h = v("hour") + v("minute") / 60, [lever, coucher] = SOLEIL_PARIS[v("month") - 1];
  return h < lever || h >= coucher;
}
function majAmbiance() { if (M && M.L && M.L.setNuit) M.L.setNuit(estNuit()); }
export function ambiance(mode) { envoyerWS({ t: "ambiance", mode }); }

/* --- les bonshommes dans la scène --- */
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
async function dessinerCorps(p) {
  const tete = await chargerTete(p.info.numero, p.info.tete_v, p.info.teteUrl);
  if (!M) return;
  const c = dessinerBonhomme({ ...p.info, moi: p.moi, large: true }, tete);
  // les poses de la danse : bras en bas, à mi-hauteur, levés ; et le disco (le doigt en l'air, puis vers le sol)
  if (p.poses) Object.values(p.poses).forEach(t => t.dispose());
  const pose = n => tex(dessinerBonhomme({ ...p.info, moi: p.moi, large: true, pose: n }, tete));
  p.poses = { repos: tex(c), mi: pose("mi"), haut: pose("haut"), disco1: pose("disco1"), disco2: pose("disco2") };
  if (p.corps) { p.corps.material.map = p.poses.repos; p.corps.material.needsUpdate = true; }
  else { const H = tailleBonhomme(); p.corps = new THREE.Sprite(new THREE.SpriteMaterial({ map: p.poses.repos, transparent: true, depthWrite: false })); p.corps.scale.set(H * .476 * 1.6, H, 1); p.corps.center.set(.5, 0); p.g.add(p.corps); }
}
function ajouterAncien(info) {
  if (!M || !M.scene) return;
  if (M.gens.has(info.numero)) retirerAncien(info.numero);
  const g = new THREE.Group(); g.position.set(info.x || 0, 0, info.z || 0); M.scene.add(g);
  const p = { info, g, moi: info.numero === M.moiNum, cible: null };
  const H = tailleBonhomme();
  const om = new THREE.Mesh(new THREE.PlaneGeometry(H * .5, H * .5), new THREE.MeshBasicMaterial({ map: tex(textures().ombre), transparent: true, depthWrite: false })); om.rotation.x = -Math.PI / 2; om.position.y = .02; g.add(om);
  const nom = sprite(etiquette(info.nom, p.moi, info.admin), H * .42, H * .08); nom.position.y = H + .14; g.add(nom);
  M.gens.set(info.numero, p);
  dessinerCorps(p);
  return p;
}
function retirerAncien(numero) { const p = M && M.gens.get(numero); if (!p) return; M.scene.remove(p.g); M.gens.delete(numero); }
function dire(numero, texte) {
  const p = M && M.gens.get(numero); if (!p) return;
  if (p.bulle) p.g.remove(p.bulle);
  const c = toileBulle(texte); const H = tailleBonhomme(); p.bulle = sprite(c, H * 1.25, H * 1.25 * c.height / c.width); p.bulle.center.set(.5, 0); p.bulle.position.y = H + .5; p.g.add(p.bulle);
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
function ajouterPNJ() {
  if (!M || !M.L || M.gens.has(PNJ)) return;
  const [x, z] = pointPNJ(Math.floor(Date.now() / 9000) - 1);
  const P = (M.ctx.pnj && M.ctx.pnj()) || {};
  ajouterAncien({ numero: PNJ, nom: P.nom || "Le chef de poste", tenue: P.tenue || "garde", couleur: P.couleur || "#1c2541", bas: P.bas, pieds: P.pieds, reglage: P.reglage || null,
    teteUrl: P.tete_v ? M.ctx.urlTetePNJ(P.tete_v) : "images/pere-tete.png", pnj: true, x, z });
}
function pointPNJ(n) {
  const g = M.lieu === "fetes" ? 1000 : 0;
  for (let k = 0; k < 40; k++) { const x = -12 + hasard(g + n * 3.1 + k) * 24, z = -16 + hasard(g + n * 7.3 + k * 1.7) * 30; if (M.L.limites(x, z)) return [x, z]; }
  return M.L.depart;
}
function animerPNJ() {
  const p = M && M.gens.get(PNJ); if (!p) return;
  const n = Math.floor(Date.now() / 9000);
  if (p.etape !== n) { p.etape = n; const [x, z] = pointPNJ(n); viser(p, x, z); }
  const h = hasard(Math.floor(Date.now() / 20000) * 1.9);
  p.info.danse = M.lieu === "fetes" && h < .4 && (h < .2 ? "disco" : "balance");
  const b = Math.floor(Date.now() / 17000);
  if (p.parole !== b) { p.parole = b; if (p.parole !== undefined && hasard(b * 9.7 + (M.lieu === "fetes" ? 5 : 0)) < .45) dire(PNJ, phrasePNJ(b * 3.3)); }
  // il salue celui qui s'approche de lui (pas plus d'une fois par minute et demie)
  const moi = M.moiNum && M.gens.get(M.moiNum);
  if (moi && moi.g.position.distanceTo(p.g.position) < 2.6 && (!p.salue || Date.now() - p.salue > 90000)) {
    p.salue = Date.now(); const nom = (M.ctx.moiInfo && M.ctx.moiInfo().nom) || "mon gars";
    dire(PNJ, PHRASES.salut[Math.floor(Math.random() * PHRASES.salut.length)].replace("%s", nom)); }
}

/* --- déplacements --- */
// aller vers (x, z) : si le lieu impose un passage (le portillon de la grille, dans la rue), on fait le détour
function viser(p, x, z) {
  const pts = M.L.trajet ? M.L.trajet(p.g.position.x, p.g.position.z, x, z) : [[x, z]];
  const v = pts.map(([a, b]) => new THREE.Vector3(a, 0, b)); p.cible = v.shift(); p.chemin = v;
}
function allerVers(x, z, envoyer) {
  const moi = M.moiNum && M.gens.get(M.moiNum); if (!moi) return;
  // on reste dans la cour : si le point est hors limites, on va au bord le plus proche
  let px = x, pz = z;
  if (!M.L.limites(px, pz)) { let best = null; for (let k = 1; k <= 30 && !best; k++) for (let a = 0; a < 16; a++) { const tx = x + Math.cos(a / 16 * Math.PI * 2) * k * .4, tz = z + Math.sin(a / 16 * Math.PI * 2) * k * .4; if (M.L.limites(tx, tz)) { best = [tx, tz]; break; } }
    // sinon (on a touché un mur, le porche…) : on marche dans cette direction aussi loin que possible
    if (!best) { const ox = moi.g.position.x, oz = moi.g.position.z, d = Math.hypot(x - ox, z - oz);
      for (let t = .25; t <= d; t += .25) { const tx = ox + (x - ox) * t / d, tz = oz + (z - oz) * t / d; if (!M.L.limites(tx, tz)) break; best = [tx, tz]; } }
    if (!best) return; [px, pz] = best; }
  viser(moi, px, pz); M.repere.position.set(px, .04, pz); M.repere.material.opacity = 1;
  if (envoyer) envoyerWS({ t: "aller", x: px, z: pz });
  if (envoyer && moi.info.danse) danser(false);
}
function changerLieu(id, arrivee, yaw = 0) {
  if (!M) return;
  for (const n of [...M.gens.keys()]) retirerAncien(n);
  const { scene, L, repere } = construireScene(id);
  M.scene && M.scene.traverse(o => { o.geometry && o.geometry.dispose(); });
  M.scene = scene; M.L = L; M.repere = repere; M.lieu = id; M.camVise = null; M.passage = false; M.yaw = yaw; M.camE = M.camD = null;
  const [x, z] = arrivee || L.depart;
  M.posEntree = [x, z]; majAmbiance();
  envoyerWS({ t: "entrer", lieu: id, x, z });
  M.ctx.surLieu && M.ctx.surLieu(id);
}
// on : false pour s'arrêter, "balance" (balancé, bras levés) ou "disco" (façon Travolta)
export function danser(on) {
  const p = M && M.moiNum && M.gens.get(M.moiNum); if (!p) return;
  const style = on === "disco" ? "disco" : on ? "balance" : false; if (style) M.styleDanse = style;
  p.info.danse = style; envoyerWS({ t: "danse", on: style }); M.ctx.surDanse && M.ctx.surDanse(style);
}
export function tourner(a = Math.PI) { if (M && M.L && (M.L.interieur || M.L.suivi)) M.yaw = (M.yaw || 0) + a; }
export function allerAuLieu(id) { if (M && M.lieu !== id) changerLieu(id); }

/* --- la connexion en direct --- */
function envoyerWS(m) { if (M && M.ws && M.ws.readyState === 1) M.ws.send(JSON.stringify(m)); }
export function direDansLaCour(texte) { envoyerWS({ t: "dire", texte }); }
export function dj(action, donnees = {}) { envoyerWS({ t: "dj_" + action, ...donnees }); }
// (administrateur) la luminosité de la salle des fêtes, de 0,15 à 1, pour tous ceux qui y sont
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
      ajouterAncien({ ...ctx.moiInfo(), numero: m.moi, x: M.posEntree[0], z: M.posEntree[1] });
      m.gens.forEach(ajouterAncien);
      ajouterPNJ();
      M.fil = m.dits || []; ctx.surFil && ctx.surFil(M.fil);
      ctx.surPresents && ctx.surPresents([...M.gens.values()].map(p => p.info));
    } else if (m.t === "arrive") { ajouterAncien(m.p); ctx.surPresents && ctx.surPresents([...M.gens.values()].map(p => p.info)); }
    else if (m.t === "part") { retirerAncien(m.numero); ctx.surPresents && ctx.surPresents([...M.gens.values()].map(p => p.info)); }
    else if (m.t === "aller") { const p = M.gens.get(m.numero); if (p) viser(p, m.x, m.z); }
    else if (m.t === "dit") { dire(m.numero, m.texte); M.fil.push(m); if (M.fil.length > 20) M.fil.shift(); ctx.surFil && ctx.surFil(M.fil); }
    else if (m.t === "efface") { M.fil = m.tout ? [] : M.fil.filter(d => d.id !== m.id); ctx.surFil && ctx.surFil(M.fil); }
    else if (m.t === "avatar") { const p = M.gens.get(m.p.numero); if (p) { Object.assign(p.info, m.p); dessinerCorps(p); } }
    else if (m.t === "comptes") ctx.surComptes && ctx.surComptes(m.lieux);
    else if (m.t === "lumiere") { M.lumiere = +m.niveau || 1; M.L && M.L.setLumiere && M.L.setLumiere(M.lumiere); ctx.surLumiere && ctx.surLumiere(M.lumiere); }
    else if (m.t === "dj") { M.djJoue = !!(m.dj && m.dj.courant); M.L && M.L.majBoutonDJ && M.L.majBoutonDJ(!!(m.dj && m.dj.courant)); ctx.surDJ && ctx.surDJ(m.dj); }
    else if (m.t === "ambiance") { M.ambiance = m.mode; majAmbiance(); ctx.surAmbiance && ctx.surAmbiance(m.mode); }
    else if (m.t === "danse") { const p = M.gens.get(m.numero); if (p) p.info.danse = m.on === "disco" ? "disco" : !!m.on && "balance"; }
    else if (m.t === "pnj") { ctx.surPNJ && ctx.surPNJ(m.p); const p = M.gens.get(PNJ); if (p) { const pos = p.g.position.clone(); retirerAncien(PNJ); ajouterPNJ(); const q = M.gens.get(PNJ); if (q) q.g.position.copy(pos); } }
    else if (m.t === "info") ctx.surInfo && ctx.surInfo(m.texte);
  };
  ws.onclose = ev => {
    if (!M || ws !== M.ws) return;
    if (ev.code === 4003 || ev.code === 4000) { ctx.surErreur && ctx.surErreur(ev.reason || "Déconnecté de la Matrice"); return; }
    if (!ouverte && (M.echecs = (M.echecs || 0) + 1) >= 2) { ctx.surErreur && ctx.surErreur("Impossible d'entrer dans la Matrice pour l'instant (connexion, ou exclusion par l'administrateur)."); return; }
    if (M.ouvert) { ctx.surInfo && ctx.surInfo("Connexion perdue… on se reconnecte."); M.reco = setTimeout(() => M && connecter(), 3000); }
  };
}
