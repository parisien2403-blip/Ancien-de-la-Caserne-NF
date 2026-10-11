/* La Matrice : les anciens se retrouvent dans les cours de la caserne, en 3D, et discutent.
   - trois lieux reliés par leurs passages : la grande cour ⇄ la cour de l'horloge ⇄ l'allée
   - chaque ancien a son bonhomme : tenue, couleur et sa tête détourée (faite dans le téléphone)
   - présence et discussion en direct avec le serveur de la caserne (WebSocket)
   Le moteur 3D (three.js) et le détourage (MediaPipe) sont chargés seulement à l'ouverture. */

const THREE_URL = "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
const MP_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs";
const MP_WASM = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";
const MP_MODELE = "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite";

export const LIEUX = {
  grande: { nom: "La grande cour", icone: "🏛️" },
  horloge: { nom: "La cour de l'horloge", icone: "🕰️" },
  allee: { nom: "L'allée", icone: "🧱" },
};
export const TENUES = {
  garde: { nom: "Uniforme de Garde" }, civil: { nom: "Jean et blouson" }, survet: { nom: "Survêtement 80" },
  robe: { nom: "Robe" }, costume: { nom: "Costume" },
};
export const COULEURS = ["#22324f", "#8a3b22", "#2f6b3a", "#c9a227", "#6b3d7a", "#e8e2d6", "#2a2a2a", "#b2364a"];

/* ---------- outils de dessin ---------- */
const toile = (w, h, dessin) => { const c = document.createElement("canvas"); c.width = w; c.height = h; dessin(c.getContext("2d"), w, h); return c; };
let graine = 7; const alea = () => (graine = (graine * 16807) % 2147483647) / 2147483647;
const assombrir = (hex, k) => { const n = parseInt(hex.slice(1), 16); const f = v => Math.max(0, Math.min(255, Math.round(v * k))); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; };

/* ---------- le bonhomme (dessiné en 2D, posé dans la 3D comme un panneau toujours tourné vers nous) ---------- */
export function dessinerBonhomme(o, tete) {
  return toile(200, 420, (x) => {
    const c = o.couleur || "#22324f", peau = "#e9c4a0", t = o.tenue || "civil";
    const bas = t === "garde" ? "#1b2638" : t === "survet" ? c : t === "costume" ? assombrir(c, .75) : t === "robe" ? null : "#3d5a80";
    if (bas) { x.fillStyle = bas; x.beginPath(); x.roundRect(72, 250, 24, 150, 10); x.roundRect(104, 250, 24, 150, 10); x.fill();
      if (t === "garde") { x.fillStyle = "#c0392b"; x.fillRect(80, 252, 5, 144); x.fillRect(116, 252, 5, 144); }
      if (t === "survet") { x.fillStyle = "#fff"; x.fillRect(78, 252, 4, 144); x.fillRect(118, 252, 4, 144); } }
    else { x.fillStyle = peau; x.beginPath(); x.roundRect(80, 330, 16, 70, 7); x.roundRect(104, 330, 16, 70, 7); x.fill(); }
    x.fillStyle = "#2a2522"; x.beginPath(); x.ellipse(82, 404, 20, 10, 0, 0, 7); x.ellipse(118, 404, 20, 10, 0, 0, 7); x.fill();
    const haut = t === "garde" ? "#22324f" : c;
    x.fillStyle = haut; x.beginPath();
    if (t === "robe") { x.moveTo(62, 150); x.lineTo(138, 150); x.lineTo(160, 335); x.lineTo(40, 335); } else x.roundRect(58, 145, 84, 120, 22);
    x.fill(); x.beginPath(); x.roundRect(36, 150, 24, 100, 12); x.roundRect(140, 150, 24, 100, 12); x.fill();
    if (t === "survet") { x.fillStyle = "#fff"; x.fillRect(42, 152, 4, 92); x.fillRect(154, 152, 4, 92); }
    if (t === "costume") { x.fillStyle = "#f4f1ea"; x.beginPath(); x.moveTo(86, 146); x.lineTo(100, 190); x.lineTo(114, 146); x.fill(); x.fillStyle = "#8a1f2b"; x.fillRect(97, 152, 6, 40); }
    if (t === "civil") { x.fillStyle = "#e9e2d0"; x.beginPath(); x.moveTo(88, 146); x.lineTo(100, 168); x.lineTo(112, 146); x.fill(); x.fillStyle = assombrir(c, .8); x.fillRect(98, 168, 4, 92); }
    if (t === "garde") { x.fillStyle = "#c9a227"; x.fillRect(58, 145, 84, 9); x.beginPath(); x.arc(100, 190, 4, 0, 7); x.arc(100, 218, 4, 0, 7); x.fill(); }
    x.fillStyle = peau; x.beginPath(); x.arc(48, 254, 11, 0, 7); x.arc(152, 254, 11, 0, 7); x.fill(); x.fillRect(88, 118, 24, 32);
    if (tete) {
      // la tête détourée, posée sur le cou (cadrée sur 112 px de large au plus, 124 de haut)
      const k = Math.min(112 / tete.width, 124 / tete.height), w = tete.width * k, h = tete.height * k;
      if (o.moi) { x.shadowColor = "#f6d465"; x.shadowBlur = 14; }
      x.drawImage(tete, 100 - w / 2, 132 - h, w, h); x.shadowBlur = 0;
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
    const pad = Math.round((x1 - x0) * .06), bx = Math.max(0, x0 - pad), by = Math.max(0, y0 - pad), bw = Math.min(w, x1 + pad) - bx, bh = Math.min(h, cou + 2) - by;
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
const zoneBriques = (x, X, Y, W, H) => { x.save(); x.beginPath(); x.rect(X, Y, W, H); x.clip(); briques(x, X + W, Y + H); x.restore(); };
const pierre = (x, X, Y, W, H, c = "#e9e1d3") => { x.fillStyle = c; x.fillRect(X, Y, W, H); x.fillStyle = "rgba(120,100,70,.14)"; for (let i = X; i < X + W; i += 60) x.fillRect(i, Y, 2, H); for (let j = Y + 40; j < Y + H; j += 40) x.fillRect(X, j, W, 2); };

/* --- briques de construction --- */
function atelier(scene) {
  const mat = (o) => new THREE.MeshStandardMaterial({ roughness: .9, metalness: 0, ...o });
  const ajoute = (geo, m, x, y, z, ombre = true) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = ombre; o.receiveShadow = true; scene.add(o); return o; };
  // une façade percée d'un passage (carré ou voûté) qu'on traverse : volume extrudé, texture plaquée sur la façade
  const facadePercee = ({ largeur, hauteur, profondeur, toileFacade, passage, x, z, couleurCote = 0x9a4b38, couleurPassage = 0xd9cfbd }) => {
    const f = new THREE.Shape(); f.moveTo(-largeur / 2, 0); f.lineTo(largeur / 2, 0); f.lineTo(largeur / 2, hauteur); f.lineTo(-largeur / 2, hauteur); f.closePath();
    const p = new THREE.Path(), L = passage.largeur / 2;
    if (passage.voute) { p.moveTo(-L, 0); p.lineTo(-L, passage.hauteur - L); p.absarc(0, passage.hauteur - L, L, Math.PI, 0, true); p.lineTo(L, 0); }
    else { p.moveTo(-L, 0); p.lineTo(-L, passage.hauteur); p.lineTo(L, passage.hauteur); p.lineTo(L, 0); }
    p.closePath(); f.holes.push(p);
    const t = tex(toileFacade); t.repeat.set(1 / largeur, 1 / hauteur); t.offset.set(.5, 0);
    const o = ajoute(new THREE.ExtrudeGeometry(f, { depth: profondeur, bevelEnabled: false, curveSegments: 20 }), [mat({ map: t }), mat({ color: couleurPassage })], x, 0, z - profondeur);
    ajoute(new THREE.BoxGeometry(largeur, .3, profondeur), mat({ color: 0x6b6b6b }), x, hauteur + .15, z - profondeur / 2);
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
  return { mat, ajoute, facadePercee, immeuble, plaque, flecheSol };
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
// façade avec la voûte sous l'horloge (vue de la cour ou de l'allée) : 34 m × 18 m, 40 px/m
function toileVouteHorloge() {
  return toile(1360, 720, (x, w, h) => {
    briques(x, w, h);
    const cx = w / 2;
    // la tour claire au centre, avec ses fenêtres, au-dessus de la voûte
    x.fillStyle = "#f1ece2"; x.fillRect(cx - 130, 0, 260, h - 250);
    zoneBriques(x, cx - 90, 0, 60, h - 250); zoneBriques(x, cx + 30, 0, 60, h - 250);
    [[cx - 25, 40], [cx - 25, 170], [cx - 120, 80], [cx + 95, 80], [cx - 120, 200], [cx + 95, 200]].forEach(([X, Y]) => fenetre(x, X, Y, X === cx - 25 ? 50 : 26, X === cx - 25 ? 70 : 50));
    // la loge à balustres et l'horloge
    x.fillStyle = "#f4efe5"; x.fillRect(cx - 160, h - 330, 320, 90); x.beginPath(); x.moveTo(cx - 60, h - 330); x.lineTo(cx, h - 362); x.lineTo(cx + 60, h - 330); x.fill();
    x.fillStyle = "#ddd5c4"; for (let i = 0; i < 5; i++) { x.fillRect(cx - 150 + i * 16, h - 300, 8, 52); x.fillRect(cx + 78 + i * 16, h - 300, 8, 52); }
    horlogeOcto(x, cx, h - 288, 48);
    x.fillStyle = "#efe9dc"; x.fillRect(cx - 175, h - 242, 350, 14);
    // l'arc de brique autour de la voûte (centre, rayon 2,2 m = 88 px, naissance à 2,8 m = 112 px)
    x.strokeStyle = "#8d3725"; x.lineWidth = 18; x.beginPath(); x.arc(cx, h - 112, 97, Math.PI, 0); x.stroke();
    // bandeaux blancs et fenêtres des immeubles de part et d'autre
    [[0, 150], [0, 300]].forEach(([, Y]) => { x.fillStyle = "#efe9dc"; x.fillRect(0, Y, cx - 175, 14); x.fillRect(cx + 175, Y, w - cx - 175, 14); });
    for (let c = 0; c < 4; c++) for (let r = 0; r < 3; r++) { fenetre(x, 60 + c * 125, 30 + r * 150, 56, 80, "#efe9dc", c % 2 === 0 && r < 2); fenetre(x, w - 116 - c * 125, 30 + r * 150, 56, 80, "#efe9dc", c % 2 === 1 && r < 2); }
  });
}
function construireLieu(id, scene) {
  const A = atelier(scene), T = textures();
  const sol = (map, rx, ry) => { const o = A.ajoute(new THREE.PlaneGeometry(90, 90), A.mat({ map: tex(map, rx, ry) }), 0, 0, 0, false); o.rotation.x = -Math.PI / 2; return o; };
  const L = { portails: [], cam: { pos: [-9, 9, 27], vise: [0, 5, -8] }, sol: null };

  if (id === "grande") {
    // au fond : le grand immeuble au toit d'ardoise, son entrée carrée au centre (on passe dessous) ; à gauche et à droite : deux grands immeubles identiques
    L.sol = sol(T.paves, 30, 30);
    const fond = toile(1500, 950, (x, w, h) => {
      briques(x, w, h, 0, h - 200);
      pierre(x, 0, h - 200, w, 200); x.fillStyle = "#efe9dc"; x.fillRect(0, h - 206, w, 10); x.fillRect(0, 0, w, 16);
      for (let r = 0; r < 5; r++) for (let c = 0; c < 8; c++) fenetre(x, 70 + c * 182, 50 + r * 135, 82, 96, "#f4efe6", r > 0);
      // l'encadrement de pierre de l'entrée carrée (centre : 4 m de large, 4 m de haut) et le motif au-dessus
      x.fillStyle = "#e2d8c4"; x.fillRect(w / 2 - 125, h - 222, 250, 22); x.fillStyle = "#d4c8b0"; x.fillRect(w / 2 - 18, h - 250, 36, 40);
      [[120], [320], [480], [960], [1150], [1330]].forEach(([X]) => fenetre(x, X, h - 160, 80, 110, "#d8cfbf"));
    });
    A.facadePercee({ largeur: 30, hauteur: 19, profondeur: 10, toileFacade: fond, passage: { largeur: 4, hauteur: 4 }, x: 0, z: -16 });
    // le toit mansardé et ses lucarnes
    const toit = new THREE.Shape(); toit.moveTo(0, 0); toit.lineTo(10, 0); toit.lineTo(8.6, 4.2); toit.lineTo(1.4, 4.2); toit.closePath();
    const ardoise = tex(toile(512, 256, (x, w, h) => { x.fillStyle = "#3a4250"; x.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 12) for (let X = (y / 12 % 2) * 14; X < w; X += 28) { x.fillStyle = `rgba(255,255,255,${.03 + alea() * .05})`; x.fillRect(X, y, 26, 10); } }), 3, 1);
    const tt = A.ajoute(new THREE.ExtrudeGeometry(toit, { depth: 30, bevelEnabled: false }), A.mat({ map: ardoise }), -15, 19, -16); tt.rotation.y = Math.PI / 2;
    for (let i = 0; i < 8; i++) { const X = -12.3 + i * 3.5;
      A.ajoute(new THREE.BoxGeometry(1.3, 1.7, 1.4), A.mat({ color: 0xf2eee6 }), X, 20.7, -16.95);
      A.ajoute(new THREE.BoxGeometry(.8, 1.05, .05), A.mat({ color: 0x7f97a8 }), X, 20.6, -16.23, false);
      const ch = A.ajoute(new THREE.ConeGeometry(1.05, .7, 4), A.mat({ color: 0x4a5260 }), X, 21.9, -16.95); ch.rotation.y = Math.PI / 4; }
    // les deux grands immeubles des côtés (identiques)
    const cote = toile(1500, 1100, (x, w, h) => {
      briques(x, w, h, 0, h - 200, 8); pierre(x, 0, h - 200, w, 200); x.fillStyle = "#efe9dc"; x.fillRect(0, h - 206, w, 10);
      for (let r = 0; r < 6; r++) for (let c = 0; c < 9; c++) fenetre(x, 60 + c * 162, 40 + r * 140, 78, 96, "#f4efe6", r > 0);
      // les longues colonnes de fenêtres blanches aux angles
      [[16], [w - 46]].forEach(([X]) => { x.fillStyle = "#f1ece2"; x.fillRect(X, 20, 30, h - 240); });
      [[200], [700], [1200]].forEach(([X]) => { x.fillStyle = "#c33f2c"; x.fillRect(X, h - 160, 70, 160); x.fillStyle = "#efe9dc"; x.fillRect(X - 6, h - 166, 82, 6); });
    });
    A.immeuble({ longueur: 32, hauteur: 22, toileFacade: cote, cote: "gauche", x: -15, z: -1 });
    A.immeuble({ longueur: 32, hauteur: 22, toileFacade: cote, cote: "droite", x: 15, z: -1 });
    // de l'autre côté de l'entrée : le jour
    A.ajoute(new THREE.BoxGeometry(40, 16, 2), A.mat({ color: 0xb35a40 }), 0, 8, -40);
    A.plaque("→ Cour de l'horloge", 0, 4.7, -15.97);
    L.limites = (x, z) => (Math.abs(x) < 13.3 && z > -15.4 && z < 15) || (Math.abs(x) < 1.6 && z <= -15.4 && z > -27);
    L.portails.push({ dans: (x, z) => z < -23.5 && Math.abs(x) < 2, vers: "horloge", arrivee: [0, 12.5] });
    L.depart = [0, 6]; L.cam = { pos: [-7, 8.5, 28], vise: [0, 6, -8] };
  }

  if (id === "horloge") {
    L.sol = sol(T.paves, 30, 30);
    // au fond : la voûte sous l'horloge (vers l'allée) ; de chaque côté : brique à bandeaux blancs
    A.facadePercee({ largeur: 34, hauteur: 18, profondeur: 8, toileFacade: toileVouteHorloge(), passage: { largeur: 4.4, hauteur: 5, voute: true }, x: 0, z: -14, couleurPassage: 0xb8a690 });
    const cote = toile(1400, 900, (x, w, h) => { briques(x, w, h);
      [[230], [470], [710]].forEach(([Y]) => { x.fillStyle = "#efe9dc"; x.fillRect(0, Y, w, 18); });
      for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) fenetre(x, 60 + c * 170, 60 + r * 220, 70, 110, "#efe9dc", c % 3 === 0);
      x.fillStyle = "#e9edf0"; x.fillRect(560, h - 150, 120, 150); x.strokeStyle = "#efe9dc"; x.lineWidth = 10; x.strokeRect(560, h - 150, 120, 150); });
    A.immeuble({ longueur: 28, hauteur: 18, toileFacade: cote, cote: "gauche", x: -12, z: 0 });
    A.immeuble({ longueur: 28, hauteur: 18, toileFacade: cote, cote: "droite", x: 12, z: 0 });
    A.ajoute(new THREE.BoxGeometry(40, 16, 2), A.mat({ color: 0xa04c36 }), 0, 8, -36);
    A.plaque("→ L'allée", 0, 6.4, -13.97);
    A.flecheSol("Vers la grande cour", 0, 13.2);
    L.limites = (x, z) => (Math.abs(x) < 11.3 && z > -13.4 && z < 15.5) || (Math.abs(x) < 1.8 && z <= -13.4 && z > -23);
    L.portails.push({ dans: (x, z) => z < -20 && Math.abs(x) < 2, vers: "allee", arrivee: [0, -11] });
    L.portails.push({ dans: (x, z) => z > 14.2, vers: "grande", arrivee: [0, -13.5] });
    L.depart = [0, 4]; L.cam = { pos: [-6, 7.5, 25], vise: [0, 5.5, -8] };
  }

  if (id === "allee") {
    L.sol = sol(T.bitume, 24, 24);
    // au fond : la même voûte sous l'horloge, vue de l'allée ; à gauche la façade aux fenêtres, à droite les portes en arc et la lanterne
    A.facadePercee({ largeur: 34, hauteur: 18, profondeur: 8, toileFacade: toileVouteHorloge(), passage: { largeur: 4.4, hauteur: 5, voute: true }, x: 0, z: -18, couleurPassage: 0xb8a690 });
    const gauche = toile(1500, 900, (x, w, h) => { briques(x, w, h, 0, h, 14);
      [[290], [600]].forEach(([Y]) => { x.fillStyle = "#efe9dc"; x.fillRect(0, Y, w, 16); });
      for (let r = 0; r < 4; r++) for (let c = 0; c < 9; c++) fenetre(x, 50 + c * 165, 50 + r * 200, 72, 100, "#efe9dc", false);
      x.fillStyle = "#7a4a32"; x.fillRect(700, h - 170, 100, 170); x.strokeStyle = "#efe9dc"; x.lineWidth = 8; x.strokeRect(700, h - 170, 100, 170); });
    const droite = toile(1500, 900, (x, w, h) => { briques(x, w, h, 0, h, 12);
      [[330], [610]].forEach(([Y]) => { x.fillStyle = "#efe9dc"; x.fillRect(0, Y, w, 18); });
      for (let r = 0; r < 3; r++) for (let c = 0; c < 9; c++) fenetre(x, 50 + c * 165, 60 + r * 200, 64, 110, "#efe9dc", c % 2 === 0);
      for (let c = 0; c < 9; c++) { const X = 70 + c * 165; x.fillStyle = "#efe9dc"; x.beginPath(); x.moveTo(X - 6, h); x.lineTo(X - 6, h - 150); x.arc(X + 36, h - 150, 42, Math.PI, 0); x.lineTo(X + 78, h); x.fill();
        x.fillStyle = "#3a2c27"; x.beginPath(); x.moveTo(X, h); x.lineTo(X, h - 150); x.arc(X + 36, h - 150, 36, Math.PI, 0); x.lineTo(X + 72, h); x.fill(); } });
    A.immeuble({ longueur: 34, hauteur: 18, toileFacade: gauche, cote: "gauche", x: -7, z: -1 });
    A.immeuble({ longueur: 34, hauteur: 18, toileFacade: droite, cote: "droite", x: 9.5, z: -1 });
    // le trottoir surélevé, son muret et la grille (sans voitures)
    A.ajoute(new THREE.BoxGeometry(5, .3, 32), A.mat({ map: tex(T.dalles, 2, 12) }), 7, .15, -1);
    A.ajoute(new THREE.BoxGeometry(.25, .45, 32), A.mat({ color: 0xcfc8bb }), 4.5, .22, -1);
    const fer = A.mat({ color: 0x1e1e1e, roughness: .6 });
    const barreaux = new THREE.InstancedMesh(new THREE.BoxGeometry(.035, 1, .035), fer, 160);
    for (let i = 0; i < 160; i++) { const m = new THREE.Matrix4(); m.setPosition(4.5, .95, -16.5 + i * .2); barreaux.setMatrixAt(i, m); }
    barreaux.castShadow = true; scene.add(barreaux);
    [1.42, 1.0].forEach(y => A.ajoute(new THREE.BoxGeometry(.06, .06, 32), fer, 4.5, y, -1));
    // la lanterne
    A.ajoute(new THREE.BoxGeometry(.9, .06, .06), fer, 9.1, 6.3, 2); A.ajoute(new THREE.BoxGeometry(.32, .45, .32), A.mat({ color: 0xf6e7b5, emissive: 0x6b5a20 }), 8.7, 6.0, 2);
    A.ajoute(new THREE.BoxGeometry(40, 16, 2), A.mat({ color: 0xa04c36 }), 0, 8, -40);
    A.plaque("→ Cour de l'horloge", 0, 6.4, -17.97);
    L.limites = (x, z) => (x > -6.3 && x < 4.2 && z > -17.4 && z < 15.5) || (Math.abs(x) < 1.8 && z <= -17.4 && z > -27);
    L.portails.push({ dans: (x, z) => z < -24 && Math.abs(x) < 2, vers: "horloge", arrivee: [0, -11] });
    L.depart = [-1, 6]; L.cam = { pos: [-3, 6.5, 24], vise: [0, 5, -10] };
  }

  // nuages
  const nt = tex(T.nuage);
  [[-10, 38, -80, 26], [25, 44, -90, 20], [5, 30, -70, 12]].forEach(([x, y, z, s]) => { const n = new THREE.Sprite(new THREE.SpriteMaterial({ map: nt, fog: false })); n.position.set(x, y, z); n.scale.set(s, s / 2, 1); scene.add(n); });
  return L;
}

/* =====================================================================================
   La Matrice ouverte
   ===================================================================================== */
let M = null;   // l'état de la Matrice ouverte

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
  rendu.domElement.addEventListener("pointerdown", e => {
    if (!M || !M.L) return;
    const r = rendu.domElement.getBoundingClientRect(); v2.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
    ray.setFromCamera(v2, M.camera);
    // toucher un ancien : son nom, écrire, (administrateur) faire taire / exclure
    const corps = [...M.gens.values()].filter(p => !p.moi).map(p => p.corps);
    const h = ray.intersectObjects(corps)[0];
    if (h) { const p = [...M.gens.values()].find(q => q.corps === h.object); if (p) { ctx.surToucherAncien && ctx.surToucherAncien(p.info); return; } }
    const s = ray.intersectObject(M.L.sol)[0]; if (!s) return;
    allerVers(s.point.x, s.point.z, true);
  });
  M.redim = () => { if (!M) return; const w = ctx.conteneur.clientWidth, h = ctx.conteneur.clientHeight; if (!w || !h) return; rendu.setSize(w, h); M.camera.aspect = w / h; placerCamera(true); };
  addEventListener("resize", M.redim);
  M.ro = new ResizeObserver(M.redim); M.ro.observe(ctx.conteneur);
  connecter();
  let avant = performance.now();
  rendu.setAnimationLoop(t => {
    if (!M || !M.scene) return;
    const dt = Math.min(.05, (t - avant) / 1000); avant = t;
    for (const p of M.gens.values()) {
      if (p.cible) { const d = p.cible.clone().sub(p.g.position); d.y = 0; const L = d.length();
        if (L < .05) { p.cible = null; p.corps.position.y = 0; if (p.moi) M.repere.material.opacity = 0; }
        else { p.g.position.addScaledVector(d.normalize(), Math.min(L, 3.4 * dt)); p.corps.position.y = Math.abs(Math.sin(t / 90)) * .06;
          if (p.moi) { const pt = M.L.portails.find(q => q.dans(p.g.position.x, p.g.position.z)); if (pt && !M.passage) { M.passage = true; changerLieu(pt.vers, pt.arrivee); } } } }
      if (p.bulle && p.bulleFin && t > p.bulleFin) { p.g.remove(p.bulle); p.bulle = null; }
    }
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
  clearTimeout(M.reco);
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
  const repere = new THREE.Mesh(new THREE.RingGeometry(.35, .5, 32), new THREE.MeshBasicMaterial({ color: 0xf6d465, transparent: true, opacity: 0 }));
  repere.rotation.x = -Math.PI / 2; repere.position.y = .04; scene.add(repere);
  return { scene, L, repere };
}

function placerCamera(net) {
  if (!M || !M.L) return;
  const portrait = M.camera.aspect < 1, c = M.L.cam, moi = M.moiNum && M.gens.get(M.moiNum);
  // la caméra suit doucement son bonhomme
  const sx = moi ? moi.g.position.x * .55 : 0, sz = moi ? Math.min(0, moi.g.position.z - (M.L.depart[1])) * .55 : 0;
  const pos = new THREE.Vector3(c.pos[0] * (portrait ? .7 : 1) + sx, c.pos[1] + (portrait ? 2.5 : 0), c.pos[2] + (portrait ? 4 : 0) + sz);
  const vise = new THREE.Vector3(c.vise[0] + sx, c.vise[1] - (portrait ? .5 : 0), c.vise[2] + sz);
  if (net || !M.camVise) { M.camera.position.copy(pos); M.camVise = vise.clone(); }
  else { M.camera.position.lerp(pos, .06); M.camVise.lerp(vise, .06); }
  M.camera.fov = portrait ? 66 : 50; M.camera.updateProjectionMatrix(); M.camera.lookAt(M.camVise);
}

/* --- les bonshommes dans la scène --- */
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
async function chargerTete(numero, v) {
  if (!v) return null;
  const cle = numero + ":" + v; if (M.teteCache.has(cle)) return M.teteCache.get(cle);
  const p = (async () => { try { const i = new Image(); i.crossOrigin = "anonymous"; i.src = M.ctx.urlTete(numero, v); await i.decode(); return i; } catch (e) { return null; } })();
  M.teteCache.set(cle, p); return p;
}
async function dessinerCorps(p) {
  const tete = await chargerTete(p.info.numero, p.info.tete_v);
  if (!M) return;
  const c = dessinerBonhomme({ ...p.info, moi: p.moi }, tete);
  if (p.corps) { p.corps.material.map.dispose(); p.corps.material.map = tex(c); p.corps.material.needsUpdate = true; }
  else { p.corps = sprite(c, 1.55, 3.25); p.corps.center.set(.5, 0); p.g.add(p.corps); }
}
function ajouterAncien(info) {
  if (!M || !M.scene) return;
  if (M.gens.has(info.numero)) retirerAncien(info.numero);
  const g = new THREE.Group(); g.position.set(info.x || 0, 0, info.z || 0); M.scene.add(g);
  const p = { info, g, moi: info.numero === M.moiNum, cible: null };
  const om = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6), new THREE.MeshBasicMaterial({ map: tex(textures().ombre), transparent: true, depthWrite: false })); om.rotation.x = -Math.PI / 2; om.position.y = .02; g.add(om);
  const nom = sprite(etiquette(info.nom, p.moi, info.admin), 2.6, .49); nom.position.y = 3.55; g.add(nom);
  M.gens.set(info.numero, p);
  dessinerCorps(p);
  return p;
}
function retirerAncien(numero) { const p = M && M.gens.get(numero); if (!p) return; M.scene.remove(p.g); M.gens.delete(numero); }
function dire(numero, texte) {
  const p = M && M.gens.get(numero); if (!p) return;
  if (p.bulle) p.g.remove(p.bulle);
  const c = toileBulle(texte); p.bulle = sprite(c, 4, 4 * c.height / c.width); p.bulle.center.set(.5, 0); p.bulle.position.y = 3.9; p.g.add(p.bulle);
  p.bulleFin = performance.now() + 7000 + texte.length * 60;
}

/* --- déplacements --- */
function allerVers(x, z, envoyer) {
  const moi = M.moiNum && M.gens.get(M.moiNum); if (!moi) return;
  // on reste dans la cour : si le point est hors limites, on va au bord le plus proche
  let px = x, pz = z;
  if (!M.L.limites(px, pz)) { let best = null; for (let k = 1; k <= 30 && !best; k++) for (let a = 0; a < 16; a++) { const tx = x + Math.cos(a / 16 * Math.PI * 2) * k * .4, tz = z + Math.sin(a / 16 * Math.PI * 2) * k * .4; if (M.L.limites(tx, tz)) { best = [tx, tz]; break; } } if (!best) return; [px, pz] = best; }
  moi.cible = new THREE.Vector3(px, 0, pz); M.repere.position.set(px, .04, pz); M.repere.material.opacity = 1;
  if (envoyer) envoyerWS({ t: "aller", x: px, z: pz });
}
function changerLieu(id, arrivee) {
  if (!M) return;
  for (const n of [...M.gens.keys()]) retirerAncien(n);
  const { scene, L, repere } = construireScene(id);
  M.scene && M.scene.traverse(o => { o.geometry && o.geometry.dispose(); });
  M.scene = scene; M.L = L; M.repere = repere; M.lieu = id; M.camVise = null; M.passage = false;
  const [x, z] = arrivee || L.depart;
  M.posEntree = [x, z];
  envoyerWS({ t: "entrer", lieu: id, x, z });
  M.ctx.surLieu && M.ctx.surLieu(id);
}
export function allerAuLieu(id) { if (M && M.lieu !== id) changerLieu(id); }

/* --- la connexion en direct --- */
function envoyerWS(m) { if (M && M.ws && M.ws.readyState === 1) M.ws.send(JSON.stringify(m)); }
export function direDansLaCour(texte) { envoyerWS({ t: "dire", texte }); }
export function sanction(type, numero) { envoyerWS({ t: type, numero }); }
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
      M.fil = m.dits || []; ctx.surFil && ctx.surFil(M.fil);
      ctx.surPresents && ctx.surPresents([...M.gens.values()].map(p => p.info));
    } else if (m.t === "arrive") { ajouterAncien(m.p); ctx.surPresents && ctx.surPresents([...M.gens.values()].map(p => p.info)); }
    else if (m.t === "part") { retirerAncien(m.numero); ctx.surPresents && ctx.surPresents([...M.gens.values()].map(p => p.info)); }
    else if (m.t === "aller") { const p = M.gens.get(m.numero); if (p) p.cible = new THREE.Vector3(m.x, 0, m.z); }
    else if (m.t === "dit") { dire(m.numero, m.texte); M.fil.push(m); if (M.fil.length > 30) M.fil.shift(); ctx.surFil && ctx.surFil(M.fil); }
    else if (m.t === "avatar") { const p = M.gens.get(m.p.numero); if (p) { Object.assign(p.info, m.p); dessinerCorps(p); } }
    else if (m.t === "comptes") ctx.surComptes && ctx.surComptes(m.lieux);
    else if (m.t === "info") ctx.surInfo && ctx.surInfo(m.texte);
  };
  ws.onclose = ev => {
    if (!M || ws !== M.ws) return;
    if (ev.code === 4003 || ev.code === 4000) { ctx.surErreur && ctx.surErreur(ev.reason || "Déconnecté de la Matrice"); return; }
    if (!ouverte && (M.echecs = (M.echecs || 0) + 1) >= 2) { ctx.surErreur && ctx.surErreur("Impossible d'entrer dans la Matrice pour l'instant (connexion, ou exclusion par l'administrateur)."); return; }
    if (M.ouvert) { ctx.surInfo && ctx.surInfo("Connexion perdue… on se reconnecte."); M.reco = setTimeout(() => M && connecter(), 3000); }
  };
}
