/* La Matrice : les anciens se retrouvent dans les cours de la caserne, en 3D, et discutent.
   - deux lieux : la cour d'honneur et la salle des fêtes (par les portes vitrées du bâtiment de droite)
   - le chef de poste (le père de l'administrateur) s'y promène tout seul
   - chaque ancien a son bonhomme : tenue, couleur et sa tête détourée (faite dans le téléphone)
   - présence et discussion en direct avec le serveur de la caserne (WebSocket)
   Le moteur 3D (three.js) et le détourage (MediaPipe) sont chargés seulement à l'ouverture. */

const THREE_URL = "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
const MP_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs";
const MP_WASM = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";
const MP_MODELE = "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite";

export const LIEUX = {
  grande: { nom: "La cour d'honneur", icone: "🏛️" },
  fetes: { nom: "La salle des fêtes", icone: "🎉" },
};
export const TENUES = {
  garde: { nom: "Gendarme" }, civil: { nom: "Jean et blouson" }, survet: { nom: "Survêtement 80" },
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
    const bas = t === "garde" ? "#26324e" : t === "survet" ? c : t === "costume" ? assombrir(c, .75) : t === "robe" ? null : "#3d5a80";
    if (bas) { x.fillStyle = bas; x.beginPath(); x.roundRect(72, 250, 24, 150, 10); x.roundRect(104, 250, 24, 150, 10); x.fill();
      if (t === "survet") { x.fillStyle = "#fff"; x.fillRect(78, 252, 4, 144); x.fillRect(118, 252, 4, 144); } }
    else { x.fillStyle = peau; x.beginPath(); x.roundRect(80, 330, 16, 70, 7); x.roundRect(104, 330, 16, 70, 7); x.fill(); }
    x.fillStyle = "#2a2522"; x.beginPath(); x.ellipse(82, 404, 20, 10, 0, 0, 7); x.ellipse(118, 404, 20, 10, 0, 0, 7); x.fill();
    const haut = t === "garde" ? "#1c2541" : c;
    x.fillStyle = haut; x.beginPath();
    if (t === "robe") { x.moveTo(62, 150); x.lineTo(138, 150); x.lineTo(160, 335); x.lineTo(40, 335); } else x.roundRect(58, 145, 84, 120, 22);
    x.fill(); x.beginPath(); x.roundRect(36, 150, 24, 100, 12); x.roundRect(140, 150, 24, 100, 12); x.fill();
    if (t === "survet") { x.fillStyle = "#fff"; x.fillRect(42, 152, 4, 92); x.fillRect(154, 152, 4, 92); }
    if (t === "costume") { x.fillStyle = "#f4f1ea"; x.beginPath(); x.moveTo(86, 146); x.lineTo(100, 190); x.lineTo(114, 146); x.fill(); x.fillStyle = "#8a1f2b"; x.fillRect(97, 152, 6, 40); }
    if (t === "civil") { x.fillStyle = "#e9e2d0"; x.beginPath(); x.moveTo(88, 146); x.lineTo(100, 168); x.lineTo(112, 146); x.fill(); x.fillStyle = assombrir(c, .8); x.fillRect(98, 168, 4, 92); }
    if (t === "garde") {
      // col de chemise bleu clair
      x.fillStyle = "#a9c4e0"; x.beginPath(); x.moveTo(84, 145); x.lineTo(100, 166); x.lineTo(116, 145); x.lineTo(108, 141); x.lineTo(100, 152); x.lineTo(92, 141); x.fill();
      // la bande blanche du pull, sur la poitrine et le haut des bras
      x.fillStyle = "#f2f2f0"; x.fillRect(58, 178, 84, 9); x.fillRect(36, 178, 24, 9); x.fillRect(140, 178, 24, 9);
      // les pattes d'épaule et leurs galons dorés
      for (const ex of [62, 116]) { x.fillStyle = "#141b30"; x.beginPath(); x.roundRect(ex, 146, 22, 12, 3); x.fill();
        x.strokeStyle = "#d4b24a"; x.lineWidth = 3; x.beginPath(); x.moveTo(ex + 5, 149); x.lineTo(ex + 11, 155); x.lineTo(ex + 17, 149); x.stroke(); }
      // le ceinturon noir, sa boucle et l'étui
      x.fillStyle = "#121212"; x.fillRect(58, 252, 84, 11); x.fillStyle = "#b9b9b9"; x.fillRect(95, 253, 10, 9);
      x.fillStyle = "#1a1a1a"; x.beginPath(); x.roundRect(134, 258, 16, 34, 4); x.fill();
    }
    x.fillStyle = peau; x.beginPath(); x.arc(48, 254, 11, 0, 7); x.arc(152, 254, 11, 0, 7); x.fill(); x.fillRect(88, 118, 24, 32);
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
  // un immeuble haussmannien posé au fond du décor, façade tournée vers la cour (orientation : rotation autour de y)
  const haussmann = ({ x, z, largeur, etages, rot, teinte = "#e6dcc6", graine: g = 11 }) => {
    const H = 4.2 + etages * 3.1, prof = 12, grp = new THREE.Group(); grp.position.set(x, 0, z); grp.rotation.y = rot; scene.add(grp);
    const fa = mat({ map: tex(toileHaussmann(largeur, etages, teinte, g)) }), pl = mat({ color: 0xd8cdb6 });
    const corps = new THREE.Mesh(new THREE.BoxGeometry(largeur, H, prof), [pl, pl, pl, pl, fa, pl]); corps.position.set(0, H / 2, -prof / 2);
    corps.castShadow = corps.receiveShadow = true; grp.add(corps);
    // le toit en zinc à la Mansart (profil dans la profondeur)
    const t = new THREE.Shape(); t.moveTo(0, 0); t.lineTo(prof, 0); t.lineTo(prof - 1.6, 3.6); t.lineTo(1.6, 3.6); t.closePath();
    const zinc = mat({ color: 0x7c8590, roughness: .55, metalness: .25 });
    const toit = new THREE.Mesh(new THREE.ExtrudeGeometry(t, { depth: largeur, bevelEnabled: false }), zinc);
    toit.rotation.y = Math.PI / 2; toit.position.set(-largeur / 2, H, 0); toit.castShadow = true; grp.add(toit);
    const corniche = new THREE.Mesh(new THREE.BoxGeometry(largeur + .4, .35, .7), mat({ color: 0xefe8d8 })); corniche.position.set(0, H + .1, .1); grp.add(corniche);
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
// façade haussmannienne : pierre de taille, balcons filants au 2e et au 5e, boutiques en bas (40 px/m)
function toileHaussmann(largeur, etages, teinte, graineF) {
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
    const yr = h - hRdc; x.fillStyle = "#e3dccb"; x.fillRect(0, yr, w, hRdc); x.fillStyle = "rgba(0,0,0,.08)"; for (let X = 0; X < w; X += 60) x.fillRect(X, yr, 2, hRdc);
    const couleurs = ["#1f4d3a", "#7a1f2b", "#1f3a5f", "#3b2f2a"];
    for (let c = 0; c < n; c += 2) { const X = c * pas + 10, L = Math.min(pas * 1.6, w - X - 10);
      x.fillStyle = couleurs[Math.floor(alea() * 4)]; x.fillRect(X, yr + 26, L, hRdc - 26);
      x.fillStyle = "#c9d8e0"; x.fillRect(X + 10, yr + 60, L - 20, hRdc - 70); x.fillStyle = "rgba(255,255,255,.25)"; x.fillRect(X + 12, yr + 62, (L - 20) / 3, hRdc - 74); }
    x.fillStyle = "#cfc6b4"; x.fillRect(0, yr - 10, w, 12);                                                 // corniche du rez-de-chaussée
  });
}
function construireLieu(id, scene) {
  const A = atelier(scene), T = textures();
  const sol = (map, rx, ry) => { const o = A.ajoute(new THREE.PlaneGeometry(90, 90), A.mat({ map: tex(map, rx, ry) }), 0, 0, 0, false); o.rotation.x = -Math.PI / 2; return o; };
  const L = { portails: [], cam: { pos: [-9, 9, 27], vise: [0, 5, -8] }, sol: null };

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
      const f = new THREE.Shape(); f.moveTo(-LONG / 2, 0); f.lineTo(LONG / 2, 0); f.lineTo(LONG / 2, HPP); f.lineTo(-LONG / 2, HPP); f.closePath();
      for (const u of us) { const v = new THREE.Path(); v.moveTo(u - 1.9, 0); v.lineTo(u - 1.9, 2.9); v.absellipse(u, 2.9, 1.9, 1.9, Math.PI, 0, true); v.lineTo(u + 1.9, 0); v.closePath(); f.holes.push(v); }
      const t = tex(piedToile(us.map(u => (u / LONG + .5) * 1600))); t.repeat.set(1 / LONG, 1 / HPP); t.offset.set(.5, 0);
      const bat = A.ajoute(new THREE.ExtrudeGeometry(f, { depth: PROF, bevelEnabled: false, curveSegments: 20 }), [A.mat({ map: t }), A.mat({ color: 0xd9d0bd })], cote < 0 ? fx - PROF : fx + PROF, 0, -2);
      bat.rotation.y = cote < 0 ? Math.PI / 2 : -Math.PI / 2;
      A.ajoute(new THREE.BoxGeometry(PROF + .6, .45, LONG + .6), A.mat({ color: 0xd3c9b3 }), fx + cote * PROF / 2, HPP + .2, -2);   // corniche du toit
      for (const VZ of VOUTES) A.ajoute(new THREE.BoxGeometry(.3, 4.8, 3.8), A.mat({ color: 0x3a3631 }), fx + cote * (PROF - .4), 2.4, VZ);   // fond des garages
      // les marches le long du bâtiment, arrêtées avant la voûte
      for (let k = 0; k < 4; k++) { const larg = 2 - k * .45; A.ajoute(new THREE.BoxGeometry(larg, .17, 16.4), A.mat({ color: k % 2 ? 0xbdb7aa : 0xc9c3b6 }), fx - cote * larg / 2, .085 + k * .17, 5.7); }
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
    const teintes = ["#e6dcc6", "#ece3cf", "#dfd3bb", "#e9e0cc"];
    [[-32, 9, 4], [-21, 11, 5], [-9, 12, 5], [4.5, 13, 6], [17, 10, 5]].forEach(([z, l, e], i) => {
      A.haussmann({ x: -27, z, largeur: l, etages: e, rot: Math.PI / 2, teinte: teintes[i % 4], graine: 11 + i });
      A.haussmann({ x: 27, z: z + 2, largeur: l, etages: e + (i % 2 ? -1 : 0), rot: -Math.PI / 2, teinte: teintes[(i + 2) % 4], graine: 31 + i }); });
    [[-33, 14, 6], [33, 14, 6]].forEach(([x, l, e], i) => A.haussmann({ x, z: -34, largeur: l, etages: e, rot: 0, teinte: teintes[i + 1], graine: 51 + i }));
    L.limites = (x, z) => Math.abs(x) < 10.2 && z > -17.4 && z < 15;
    L.portails.push({ dans: (x, z) => x > 10 && z > -1 && z < 14, vers: "fetes", arrivee: [-4.4, 6] });
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
    mur("z", X0 - .15, Z0, Z1, 1, true); mur("z", X1 + .15, Z0, Z1, -1); mur("x", Z0 - .15, X0, X1, 1); mur("x", Z1 + .15, X0, X1, -1);
    A.ajoute(new THREE.BoxGeometry(larg + .6, .3, long + .6), A.mat({ color: 0xece4d2, roughness: 1 }), 0, HT + .15, cz, false);   // plafond
    // poutres du plafond
    for (let z = Z0 + 3; z < Z1; z += 3) A.ajoute(new THREE.BoxGeometry(larg, .35, .3), A.mat({ color: 0xe3d9c3 }), 0, HT - .17, z, false);
    // côté cour (x = X0) : grandes fenêtres à petits carreaux, verre dépoli, au-dessus du lambris, entre des piliers
    const depoli = toile(256, 256, (x, w, h) => { x.fillStyle = "#cfd6d4"; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 1400; i++) { const v = alea(); x.fillStyle = `rgba(${v > .5 ? "255,255,255" : "120,135,140"},${.18 + alea() * .25})`; x.beginPath(); x.arc(alea() * w, alea() * h, 1.5 + alea() * 3, 0, 7); x.fill(); } });
    const vitre = new THREE.MeshStandardMaterial({ map: tex(depoli, 1, 1), emissive: 0xdfe8e6, emissiveIntensity: .55, roughness: .3 });
    const cadre = A.mat({ color: 0xece3cf, roughness: .6 });
    // côté cour : grandes portes vitrées à deux battants jusqu'au sol, avec une imposte vitrée au-dessus (celles des marches de la cour)
    const nF = 5, pasF = long / nF, bati = A.mat({ color: 0x7a4a2a, roughness: .5 });
    for (let i = 0; i < nF; i++) {
      const z = Z0 + (i + .5) * pasF, W = pasF - 1.1, hp = 2.9, yh = HT - .45;
      // les deux battants (cadre bois, vitrage à petits bois, soubassement plein)
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
    const applique = new THREE.MeshStandardMaterial({ color: 0xfff6e0, emissive: 0xfff0d0, emissiveIntensity: .9, roughness: .3 });
    for (let i = 0; i <= nF; i++) { const z = Z0 + i * pasF;
      for (const [x, s] of [[X0 + .25, 1], [X1 - .25, -1]]) {
        A.ajoute(new THREE.BoxGeometry(.5, HT, .55), A.mat({ color: 0xe9ddc3 }), x, HT / 2, z, false);
        const lm = new THREE.Mesh(new THREE.BoxGeometry(.04, LAMB, .55), A.mat({ map: tex(lambris, .3, 1), roughness: .45 })); lm.position.set(x + s * .27, LAMB / 2, z); scene.add(lm);
        if (i > 0 && i < nF) { const b = new THREE.Mesh(new THREE.SphereGeometry(.24, 20, 12, 0, Math.PI), applique); b.rotation.y = s > 0 ? Math.PI / 2 : -Math.PI / 2; b.position.set(x + s * .27, 3.6, z); scene.add(b);
          const lum = new THREE.PointLight(0xffe6c0, 4, 9, 1.6); lum.position.set(x + s * .7, 3.6, z); scene.add(lum); } } }
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

    // lumière de la salle
    scene.add(new THREE.AmbientLight(0xfff1dc, .55));
    for (const z of [Z0 + 4, cz, Z1 - 4]) { const l = new THREE.PointLight(0xfff0d8, 6, 14, 1.4); l.position.set(0, HT - .6, z); scene.add(l); }
    L.interieur = true; L.boite = [X0, X1, Z0, Z1];
    L.limites = (x, z) => x > X0 + .4 && x < bx - .75 && z > Z0 + .6 && z < Z1 - .6 && !(Math.abs(x) < EL + .2 && z > EZ - 1) && !tables.some(([a, b, c, d]) => x > a && x < b && z > c && z < d);
    L.portails.push({ dans: (x, z) => x < X0 + .7, vers: "grande", arrivee: [8.8, 6] });
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
  rendu.domElement.addEventListener("pointerdown", e => { glisse = { x: e.clientX, y: e.clientY, id: e.pointerId, bouge: false, yaw: M ? M.yaw || 0 : 0 }; });
  rendu.domElement.addEventListener("pointermove", e => {
    if (!glisse || glisse.id !== e.pointerId || !M) return;
    const dx = e.clientX - glisse.x;
    if (Math.abs(dx) > 10) glisse.bouge = true;
    if (glisse.bouge && M.L && M.L.interieur) M.yaw = glisse.yaw - dx * .006;
  });
  rendu.domElement.addEventListener("pointerup", e => {
    const g = glisse; glisse = null;
    if (!g || g.bouge || !M || !M.L) return;
    const r = rendu.domElement.getBoundingClientRect(); v2.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
    ray.setFromCamera(v2, M.camera);
    // toucher un ancien : son nom, écrire, (administrateur) faire taire / exclure
    const corps = [...M.gens.values()].filter(p => !p.moi && p.corps).map(p => p.corps);
    const h = ray.intersectObjects(corps)[0];
    if (h) { const p = [...M.gens.values()].find(q => q.corps === h.object); if (p && p.info.pnj) { dire(PNJ, PHRASES[Math.floor(Math.random() * PHRASES.length)]); return; } if (p) { ctx.surToucherAncien && ctx.surToucherAncien(p.info); return; } }
    if (M.L.zoneDJ) { const t = ray.intersectObjects(M.L.zoneDJ, true)[0]; if (t) { ctx.surToucherDJ && ctx.surToucherDJ(); return; } }
    const s = ray.intersectObject(M.L.sol)[0]; if (!s) return;
    allerVers(s.point.x, s.point.z, true);
  });
  rendu.domElement.addEventListener("pointercancel", () => { glisse = null; });
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
        if (L < .05) { p.cible = null; if (p.corps) p.corps.position.y = 0; if (p.moi) M.repere.material.opacity = 0; }
        else { p.g.position.addScaledVector(d.normalize(), Math.min(L, 3.4 * dt)); if (p.corps) p.corps.position.y = Math.abs(Math.sin(t / 90)) * .06;
          if (p.moi) { const pt = M.L.portails.find(q => q.dans(p.g.position.x, p.g.position.z)); if (pt && !M.passage) { M.passage = true; changerLieu(pt.vers, pt.arrivee); } } } }
      if (p.bulle && p.bulleFin && t > p.bulleFin) { p.g.remove(p.bulle); p.bulle = null; }
    }
    if (M.L.anim) M.L.anim(t);
    animerPNJ();
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
  if (L.interieur) { soleil.intensity = 0; soleil.castShadow = false; scene.children.filter(o => o.isHemisphereLight).forEach(h => h.intensity = .35); scene.fog = null; scene.background = new THREE.Color(0x2a2420); }
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
  if (M.L.interieur && moi) {
    const yw = M.yaw || 0, fx = -Math.sin(yw), fz = -Math.cos(yw), mx = moi.g.position.x, mz = moi.g.position.z;
    pos.set(mx - fx * 4.6, 2.5, mz - fz * 4.6); vise.set(mx + fx * 3, 1.2, mz + fz * 3);
  }
  // dehors : tourner la vue (glisser le doigt, ou ↻) fait tourner la caméra autour de son bonhomme
  const yaw = 0;
  if (yaw) { const px = moi ? moi.g.position.x : vise.x, pz = moi ? moi.g.position.z : vise.z, cs = Math.cos(yaw), sn = Math.sin(yaw);
    for (const v of [pos, vise]) { const dx = v.x - px, dz = v.z - pz; v.x = px + dx * cs - dz * sn; v.z = pz + dx * sn + dz * cs; } }
  if (M.L.boite) { const [a, b, c2, d] = M.L.boite; pos.x = Math.max(a + .3, Math.min(b - .3, pos.x)); pos.z = Math.max(c2 + .3, Math.min(d - .3, pos.z)); }
  if (net || !M.camVise) { M.camera.position.copy(pos); M.camVise = vise.clone(); }
  else { M.camera.position.lerp(pos, .06); M.camVise.lerp(vise, .06); }
  M.camera.fov = portrait ? (M.L.interieur ? 74 : 66) : (M.L.interieur ? 62 : 50); M.camera.updateProjectionMatrix(); M.camera.lookAt(M.camVise);
}

/* --- les bonshommes dans la scène --- */
const tailleBonhomme = () => M && M.L && M.L.interieur ? 1.8 : 2.4;
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
  const c = dessinerBonhomme({ ...p.info, moi: p.moi }, tete);
  if (p.corps) { p.corps.material.map.dispose(); p.corps.material.map = tex(c); p.corps.material.needsUpdate = true; }
  else { const H = tailleBonhomme(); p.corps = sprite(c, H * .476, H); p.corps.center.set(.5, 0); p.g.add(p.corps); }
}
function ajouterAncien(info) {
  if (!M || !M.scene) return;
  if (M.gens.has(info.numero)) retirerAncien(info.numero);
  const g = new THREE.Group(); g.position.set(info.x || 0, 0, info.z || 0); M.scene.add(g);
  const p = { info, g, moi: info.numero === M.moiNum, cible: null };
  const H = tailleBonhomme();
  const om = new THREE.Mesh(new THREE.PlaneGeometry(H * .5, H * .5), new THREE.MeshBasicMaterial({ map: tex(textures().ombre), transparent: true, depthWrite: false })); om.rotation.x = -Math.PI / 2; om.position.y = .02; g.add(om);
  const nom = sprite(etiquette(info.nom, p.moi, info.admin), H * .8, H * .15); nom.position.y = H + .25; g.add(nom);
  M.gens.set(info.numero, p);
  dessinerCorps(p);
  return p;
}
function retirerAncien(numero) { const p = M && M.gens.get(numero); if (!p) return; M.scene.remove(p.g); M.gens.delete(numero); }
function dire(numero, texte) {
  const p = M && M.gens.get(numero); if (!p) return;
  if (p.bulle) p.g.remove(p.bulle);
  const c = toileBulle(texte); const H = tailleBonhomme(); p.bulle = sprite(c, H * 1.25, H * 1.25 * c.height / c.width); p.bulle.center.set(.5, 0); p.bulle.position.y = H + .5; p.g.add(p.bulle);
  p.bulleFin = performance.now() + 7000 + texte.length * 60;
}

/* --- le chef de poste se promène tout seul (même trajet pour tout le monde : il dépend de l'heure) --- */
const PNJ = -1, PHRASES = ["Halte mon gars !", "Vos papiers !", "Pas de courses dans la cour !", "Salut fiston !", "On ne traîne pas ici…", "Tout va bien, les anciens ?", "Ça me rappelle des souvenirs…"];
const hasard = n => { let x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
function ajouterPNJ() {
  if (!M || !M.L || M.gens.has(PNJ)) return;
  const [x, z] = pointPNJ(Math.floor(Date.now() / 9000) - 1);
  const P = (M.ctx.pnj && M.ctx.pnj()) || {};
  ajouterAncien({ numero: PNJ, nom: P.nom || "Le chef de poste", tenue: P.tenue || "garde", couleur: P.couleur || "#1c2541", reglage: P.reglage || null,
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
  if (p.etape !== n) { p.etape = n; const [x, z] = pointPNJ(n); p.cible = new THREE.Vector3(x, 0, z); }
  const b = Math.floor(Date.now() / 17000);
  if (p.parole !== b) { p.parole = b; if (p.parole !== undefined && hasard(b * 9.7 + (M.lieu === "fetes" ? 5 : 0)) < .45) dire(PNJ, PHRASES[Math.floor(hasard(b * 3.3) * PHRASES.length)]); }
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
  M.scene = scene; M.L = L; M.repere = repere; M.lieu = id; M.camVise = null; M.passage = false; M.yaw = 0;
  const [x, z] = arrivee || L.depart;
  M.posEntree = [x, z];
  envoyerWS({ t: "entrer", lieu: id, x, z });
  M.ctx.surLieu && M.ctx.surLieu(id);
}
export function tourner(a = Math.PI) { if (M && M.L && M.L.interieur) M.yaw = (M.yaw || 0) + a; }
export function allerAuLieu(id) { if (M && M.lieu !== id) changerLieu(id); }

/* --- la connexion en direct --- */
function envoyerWS(m) { if (M && M.ws && M.ws.readyState === 1) M.ws.send(JSON.stringify(m)); }
export function direDansLaCour(texte) { envoyerWS({ t: "dire", texte }); }
export function dj(action, donnees = {}) { envoyerWS({ t: "dj_" + action, ...donnees }); }
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
      ajouterPNJ();
      M.fil = m.dits || []; ctx.surFil && ctx.surFil(M.fil);
      ctx.surPresents && ctx.surPresents([...M.gens.values()].map(p => p.info));
    } else if (m.t === "arrive") { ajouterAncien(m.p); ctx.surPresents && ctx.surPresents([...M.gens.values()].map(p => p.info)); }
    else if (m.t === "part") { retirerAncien(m.numero); ctx.surPresents && ctx.surPresents([...M.gens.values()].map(p => p.info)); }
    else if (m.t === "aller") { const p = M.gens.get(m.numero); if (p) p.cible = new THREE.Vector3(m.x, 0, m.z); }
    else if (m.t === "dit") { dire(m.numero, m.texte); M.fil.push(m); if (M.fil.length > 30) M.fil.shift(); ctx.surFil && ctx.surFil(M.fil); }
    else if (m.t === "avatar") { const p = M.gens.get(m.p.numero); if (p) { Object.assign(p.info, m.p); dessinerCorps(p); } }
    else if (m.t === "comptes") ctx.surComptes && ctx.surComptes(m.lieux);
    else if (m.t === "dj") ctx.surDJ && ctx.surDJ(m.dj);
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
