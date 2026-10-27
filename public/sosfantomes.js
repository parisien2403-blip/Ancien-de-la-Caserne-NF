/* S.O.S. Fantômes : l'Ecto-1 dans la cour, le combat contre Bouffe-tout au mess, le Marshmallow, la fin.
   Chargé par la matrice (matrice.js) la première fois qu'on va dans un lieu de S.O.S. Fantômes, et exécuté chez elle (eval direct) :
   il se sert tel quel de tout ce qu'elle a. Ce qu'il rend (la dernière expression) : ses points d'entrée. */
/* ===================== S.O.S. Fantômes =====================
   Sur un car de la Gendarmerie, dans une voûte de la cour d'honneur, la plaque ECTO-1. On la touche : l'Ecto-1 entre dans la cour, gyrophares allumés,
   et s'arrête à côté de nous ; les quatre Ghostbusters en descendent (Egon, Ray, Venkman, Winston), discutent ; le chef de poste arrive — une chose verte
   saccage le mess, et le Président de la République doit venir ; Ray nous demande si l'on a vu leurs films… fumée blanche, le grand titre.
   Puis le combat au mess contre Bouffe-tout, le piège, et retour dans la cour. Chacun est un panneau découpé, vu de face ou de dos selon où il regarde */
const GB = [["egon", "Egon"], ["ray", "Ray"], ["venkman", "Venkman"], ["winston", "Winston"]], CHEF_GB = -491;
const texGB = {};
function texGBi(n) { if (!texGB[n]) { const t = texGB[n] = new THREE.TextureLoader().load(`images/gb/${n}.webp`, () => { try { M && M.rendu && M.rendu.initTexture(t); } catch (e) {} }); t.colorSpace = THREE.SRGBColorSpace; } return texGB[n]; }   // (envoyée tout de suite à la carte graphique : pas d'à-coup quand elle sert la première fois)
function creerGB(cle, nom, x, z) { const H = tailleBonhomme() * 1.02, geo = new THREE.PlaneGeometry(1, 1); geo.translate(0, .5, 0);
  texGBi(cle + "-dos"); const tf = texGBi(cle + "-face");   // (bien éclairés, même la nuit)
  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: tf, emissive: 0xffffff, emissiveMap: tf, emissiveIntensity: .42, alphaTest: .5, side: THREE.DoubleSide, roughness: .8 }));   /* (opaques : une découpe nette, pas de demi-transparence) */ mesh.scale.set(H * .42, H, 1); mesh.castShadow = true;
  const g = new THREE.Group(); g.add(mesh);
  const om = new THREE.Mesh(new THREE.PlaneGeometry(H * .45, H * .3), new THREE.MeshBasicMaterial({ map: tex(textures().ombre), transparent: true, depthWrite: false })); om.rotation.x = -Math.PI / 2; om.position.y = .02; g.add(om);
  g.position.set(x, 0, z); M.scene.add(g);
  return { cle, nom, g, mesh, x, z, H, dir: [1, 0], cible: null, vit: 1.5, pas: 0 }; }
function animerGB(dt) { const S = M.gbScene; if (!S) return; if (S.L !== M.L) { M.gbScene = null; return; } const cam = M.camera.position, moi = M.gens.get(M.moiNum);
  for (const p of S.persos) {
    if (p.cible) { const dx = p.cible[0] - p.x, dz = p.cible[1] - p.z, d = Math.hypot(dx, dz); if (d < .05) p.cible = p.chemin && p.chemin.length ? p.chemin.shift() : null; else { const k = Math.min(d, p.vit * dt); p.x += dx / d * k; p.z += dz / d * k; p.dir = [dx / d, dz / d]; p.pas += k; } }
    else { const v = p.regard || (moi && [moi.g.position.x, moi.g.position.z]); if (v) { const dx = v[0] - p.x, dz = v[1] - p.z, d = Math.hypot(dx, dz); if (d > .01) p.dir = [dx / d, dz / d]; } }
    p.g.position.set(p.x, 0, p.z);
    const cx = cam.x - p.x, cz = cam.z - p.z; p.mesh.rotation.y = Math.atan2(cx, cz);
    let map = texGBi(p.cle + (p.dir[0] * cx + p.dir[1] * cz >= 0 ? "-face" : "-dos")); if (p.englue > 0) { p.englue -= dt; map = texEnglue(map); }   // (englué : couvert de slime)
    if (p.mesh.material.map !== map) { p.mesh.material.map = map; p.mesh.material.emissiveMap = map; }   /* (de face s'il regarde vers nous, de dos sinon) */
    const im = map.image; if (im && im.width) p.mesh.scale.set(p.H * im.width / im.height, p.H, 1);
    p.mesh.position.y = p.cible ? Math.abs(Math.sin(p.pas * 3.4)) * .05 : 0; p.mesh.rotation.z = p.choc > 0 ? Math.sin(p.choc * 18) * .25 * p.choc : p.cible ? Math.sin(p.pas * 3.4) * .035 : 0; if (p.choc > 0) p.choc -= dt;   // (un rocher l'a frôlé : il vacille)
    p.g.visible = p.visible !== false; } }
const dureeLigne = t => Math.min(6500, 2400 + t.length * 52);
// la fumée blanche, et le grand titre
function titreGB() { if (!M || M.gbTitre) return; M.gbTitre = true; setTimeout(() => { if (M) M.gbTitre = false; }, 7000);
  if (!document.getElementById("styleGB")) { const st = document.createElement("style"); st.id = "styleGB";   // (en animations CSS : le téléphone les joue lui-même, bien fluides, même quand la 3D peine)
    st.textContent = "@keyframes gbVoile{0%{opacity:0}16%{opacity:1}78%{opacity:1}100%{opacity:0}}@keyframes gbTitre{0%,12%{opacity:0;transform:scale(.35)}34%{opacity:1;transform:scale(1.05)}44%,100%{opacity:1;transform:scale(1)}}"; document.head.appendChild(st); }
  const d = voile("background:radial-gradient(circle,rgba(255,255,255,.97) 0%,rgba(242,242,242,.94) 60%,rgba(215,215,215,.9) 100%);opacity:0;animation:gbVoile 6.6s ease-in-out forwards;will-change:opacity;display:grid;place-items:center", 6700);
  d.innerHTML = '<img src="images/gb/titre.webp" alt="Ghostbusters" style="width:min(88%,780px);opacity:0;animation:gbTitre 6.6s cubic-bezier(.2,.8,.3,1) forwards;will-change:transform,opacity">';
  if (M.L && M.L.ecto1) brumeSH(M.L.ecto1.position.clone().setY(0), 5200); sonBruit(1.4, 600, .22); }
const MESS_GB = { X0: -10, X1: 6, Z0: -12, Z1: 12, BX0: -8.6, BX1: 4.6, BZ: -11.45, BD: .8, TOP: .9 };
function matsGB() { if (MESS_GB.m) return MESS_GB.m; const S = (o) => new THREE.MeshStandardMaterial(o);
  return (MESS_GB.m = { porcelaine: S({ color: 0xfbfaf6, roughness: .25 }), argent: S({ color: 0xd8dadd, metalness: .9, roughness: .22 }), verre: S({ color: 0xdff2ff, transparent: true, opacity: .45, roughness: .05, metalness: .1 }),
    vase: S({ color: 0x6a8fb8, roughness: .2 }), tige: S({ color: 0x3f7a2a, roughness: .7 }), fleur: S({ color: 0xffffff, roughness: .6 }), feuille: S({ color: 0x4f8c34, roughness: .6, side: THREE.DoubleSide }) }); }
// le décor des tables : chaque pièce est une instance (quelques maillages pour toute la salle) ; une pièce qui vole a sa propre matrice
function couvertsGB(scene, poses, TH) { const m = matsGB(), Y = TH + .025, items = [], kinds = [];
  const kind = (geo, mat, n) => { const im = new THREE.InstancedMesh(geo, mat, n); im.castShadow = true; im.receiveShadow = true; scene.add(im); const k = { im, n: 0 }; kinds.push(k); return k; };
  const nt = poses.length, KA = kind(new THREE.CylinderGeometry(.12, .1, .018, 22), m.porcelaine, nt * 4), KF = kind(new THREE.BoxGeometry(.018, .006, .19), m.argent, nt * 8),
    KV = kind(new THREE.CylinderGeometry(.035, .025, .13, 12, 1, true), m.verre, nt * 4), KS = kind(new THREE.BoxGeometry(.16, .008, .16), new THREE.MeshStandardMaterial({ color: 0xc23a3a, roughness: .8 }), nt * 4),
    KO = kind(new THREE.CylinderGeometry(.045, .035, .13, 14), m.vase, nt), KT = kind(new THREE.CylinderGeometry(.005, .005, .2, 4), m.tige, nt * 8), KL = kind(new THREE.SphereGeometry(.035, 10, 8), m.fleur, nt * 8),
    KE = kind(new THREE.PlaneGeometry(.06, .025), m.feuille, nt * 6);
  const coul = [0xd8243a, 0xf5c51b, 0xf28bb5, 0xffffff, 0xff7a1a, 0x9a4bd6], c = new THREE.Color();
  const pose = (k, x, y, z, ry = 0, rx = 0, rz = 0, table = -1, couleur) => { const it = { k, i: k.n++, p: new THREE.Vector3(x, y, z), q: new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, "YXZ")), table, v: null };
    if (couleur != null) k.im.setColorAt(it.i, c.setHex(couleur)); items.push(it); majPiece(it); return it; };
  poses.forEach(([x, z], t) => {
    for (const sx of [-.42, .42]) for (const sz of [-1, 1]) { const zc = z + sz * .28, r = sz > 0 ? 0 : Math.PI;
      pose(KA, x + sx, Y + .009, zc, 0, 0, 0, t); pose(KS, x + sx + sz * .02, Y + .02, zc + sz * .02, .5, 0, 0, t);
      pose(KF, x + sx - .16 * (sz > 0 ? 1 : -1), Y + .004, zc, r, 0, 0, t); pose(KF, x + sx + .16 * (sz > 0 ? 1 : -1), Y + .004, zc, r, 0, 0, t);
      pose(KV, x + sx + .13 * (sz > 0 ? 1 : -1), Y + .065, zc - sz * .14, 0, 0, 0, t); }
    pose(KO, x, Y + .065, z, 0, 0, 0, t);
    for (let f = 0; f < 8; f++) { const a = f / 8 * Math.PI * 2 + t, r = f ? .04 : 0, inc = f ? .28 : 0;
      pose(KT, x + Math.cos(a) * r * .6, Y + .2, z + Math.sin(a) * r * .6, -a, 0, inc, t);
      pose(KL, x + Math.cos(a) * r * 1.4, Y + .3 - (f ? .015 : -.01), z + Math.sin(a) * r * 1.4, 0, 0, 0, t, coul[(f + t) % coul.length]);
      if (f < 6) pose(KE, x + Math.cos(a) * .05, Y + .15, z + Math.sin(a) * .05, -a, -.6, 0, t); } });
  for (const k of kinds) { k.im.count = k.n; k.im.instanceMatrix.needsUpdate = true; if (k.im.instanceColor) k.im.instanceColor.needsUpdate = true; }
  return { items, kinds }; }
let _mGB = null, _uGB = null;
function majPiece(it) { if (!_mGB) { _mGB = new THREE.Matrix4(); _uGB = new THREE.Vector3(1, 1, 1); } if (it.k) { it.k.im.setMatrixAt(it.i, _mGB.compose(it.p, it.q, it.s || _uGB)); it.k.im.instanceMatrix.needsUpdate = true; } else { it.o.position.copy(it.p); it.o.quaternion.copy(it.q); if (it.s) it.o.scale.copy(it.s); } }
// le buffet : nappe blanche à jupe rouge plissée, et dessus de quoi nourrir un régiment
function buffetGB(scene) { const B = MESS_GB, m = matsGB(), L2 = B.BX1 - B.BX0, cxB = (B.BX0 + B.BX1) / 2, S = (o) => new THREE.MeshStandardMaterial(o), mets = [];
  const jupe = tex(toile(512, 128, (x, w, h) => { const g = x.createLinearGradient(0, 0, 32, 0); g.addColorStop(0, "#8e1620"); g.addColorStop(.5, "#c7303a"); g.addColorStop(1, "#8e1620"); x.fillStyle = g; for (let k = 0; k < w; k += 32) { x.save(); x.translate(k, 0); x.fillRect(0, 0, 32, h); x.restore(); }
    x.fillStyle = "#f4d77a"; x.fillRect(0, 0, w, 7); }), 6, 1);
  const g0 = new THREE.Group(); scene.add(g0);
  const box = (sx, sy, sz, mat, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mat); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; g0.add(o); return o; };
  box(L2, .04, B.BD, S({ color: 0xfdfcf8, roughness: .8 }), cxB, B.TOP - .02, B.BZ);
  box(L2, B.TOP - .04, .02, S({ map: jupe, roughness: .8 }), cxB, (B.TOP - .04) / 2, B.BZ + B.BD / 2);
  for (const s of [-1, 1]) box(.02, B.TOP - .04, B.BD, S({ map: jupe, roughness: .8 }), cxB + s * L2 / 2, (B.TOP - .04) / 2, B.BZ);
  const Y = B.TOP, mk = (x, z, f) => { const g = new THREE.Group(); f(g); g.position.set(x, Y, z); g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); scene.add(g);
    const it = { o: g, p: g.position.clone(), q: g.quaternion.clone(), v: null }; mets.push(it); return it; };
  const add = (g, geo, mat, x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); o.scale.set(sx, sy, sz); g.add(o); return o; };
  const plat = (g, r = .26) => add(g, new THREE.CylinderGeometry(r, r * .9, .02, 28), m.argent, 0, .01, 0);
  const roti = S({ color: 0x9a4a16, roughness: .32, metalness: .05 }), pain = S({ color: 0xd59a4a, roughness: .7 }), fromage = S({ color: 0xf2c94c, roughness: .55 }), brie = S({ color: 0xf6f0dc, roughness: .8 });
  const fruits = [0xff8c1a, 0xd8262e, 0x8cc63f, 0xf7d31c, 0xff8c1a, 0xd8262e], raisin = S({ color: 0x5b2a6e, roughness: .3 }), vin = S({ color: 0x163a1e, roughness: .15, metalness: .2 }), etiquette = S({ color: 0xf1e6c8, roughness: .8 });
  const creme = S({ color: 0xfff6ea, roughness: .5 }), rose = S({ color: 0xf6b8c8, roughness: .5 }), cerise = S({ color: 0xc8102e, roughness: .2 }), jambon = S({ color: 0xe8908a, roughness: .45 }), salade = S({ color: 0x5fae3a, roughness: .6 }), saladier = S({ color: 0xf7f7f2, roughness: .2 });
  const z = B.BZ, zf = B.BZ + .12, zb = B.BZ - .15;
  const dinde = (x) => mk(x, z, g => { plat(g, .3); add(g, new THREE.SphereGeometry(.18, 20, 14), roti, 0, .13, 0, 0, 0, 0, 1.25, .75, 1); for (const s of [-1, 1]) { add(g, new THREE.CapsuleGeometry(.05, .12, 6, 10), roti, .17, .1, s * .09, 0, 0, 1.2); add(g, new THREE.CylinderGeometry(.012, .012, .06, 6), brie, .27, .14, s * .09, 0, 0, 1.2); }
    for (let k = 0; k < 6; k++) add(g, new THREE.SphereGeometry(.035, 8, 6), fruits[k % 2 ? 0 : 1] === 0 ? roti : S({ color: k % 2 ? 0xff8c1a : 0x7aa83c }), Math.cos(k) * .24, .04, Math.sin(k) * .24); });
  const corbeille = (x, zz) => mk(x, zz, g => { add(g, new THREE.SphereGeometry(.17, 20, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), S({ color: 0xb7834a, roughness: .8, side: THREE.DoubleSide }), 0, .17, 0);
    for (let k = 0; k < 9; k++) { const a = k * 2.4, r = k < 6 ? .1 : .03; add(g, new THREE.SphereGeometry(.05, 12, 10), S({ color: fruits[k % fruits.length], roughness: .35 }), Math.cos(a) * r, .14 + (k < 6 ? 0 : .07), Math.sin(a) * r); }
    for (let k = 0; k < 10; k++) add(g, new THREE.SphereGeometry(.022, 8, 6), raisin, .12 + (k % 3) * .025, .13 - Math.floor(k / 3) * .03, .08 + (k % 2) * .02); });
  const baguettes = (x) => mk(x, zb, g => { for (let k = 0; k < 4; k++) add(g, new THREE.CapsuleGeometry(.035, .5, 6, 10), pain, (k - 1.5) * .07, .04 + (k % 2) * .05, 0, 0, 0, Math.PI / 2 + (k - 1.5) * .12); });
  const fromages = (x) => mk(x, zf, g => { add(g, new THREE.CylinderGeometry(.22, .22, .02, 6), S({ color: 0x8a5a2e, roughness: .6 }), 0, .01, 0); add(g, new THREE.CylinderGeometry(.11, .11, .07, 18, 1, false, 0, 1.4), fromage, -.06, .055, 0);
    add(g, new THREE.CylinderGeometry(.09, .09, .04, 20), brie, .09, .04, .05); add(g, new THREE.BoxGeometry(.09, .06, .06), S({ color: 0xe8d9a0, roughness: .7 }), .05, .05, -.1); for (let k = 0; k < 6; k++) add(g, new THREE.SphereGeometry(.018, 8, 6), raisin, -.12 + k * .02, .03, .14); });
  const gateau = (x) => mk(x, z, g => { plat(g, .28); [[.24, .14, creme], [.18, .12, rose], [.12, .11, creme]].reduce((y, [r, h, mt]) => { add(g, new THREE.CylinderGeometry(r, r, h, 28), mt, 0, y + h / 2, 0); for (let k = 0; k < 12; k++) add(g, new THREE.SphereGeometry(.018, 8, 6), creme, Math.cos(k / 12 * 6.28) * r, y + h, Math.sin(k / 12 * 6.28) * r); return y + h; }, .02);
    for (let k = 0; k < 5; k++) add(g, new THREE.SphereGeometry(.025, 10, 8), cerise, Math.cos(k * 1.26) * .07, .43, Math.sin(k * 1.26) * .07); });
  const bouteilles = (x) => mk(x, zb, g => { for (let k = 0; k < 3; k++) { const bx = (k - 1) * .1; add(g, new THREE.CylinderGeometry(.036, .036, .22, 14), vin, bx, .11, 0); add(g, new THREE.CylinderGeometry(.012, .03, .1, 12), vin, bx, .27, 0); add(g, new THREE.CylinderGeometry(.037, .037, .08, 14, 1, true), etiquette, bx, .1, 0); } });
  const canapes = (x) => mk(x, zf, g => { add(g, new THREE.BoxGeometry(.42, .02, .26), m.argent, 0, .01, 0); const cs = [0xf0c27a, 0xe25a5a, 0x7cb342, 0xffe08a, 0x6d4c41];
    for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) { add(g, new THREE.BoxGeometry(.05, .02, .05), pain, -.17 + i * .068, .03, -.08 + j * .08); add(g, new THREE.SphereGeometry(.02, 8, 6), S({ color: cs[(i + j) % cs.length], roughness: .4 }), -.17 + i * .068, .045, -.08 + j * .08, 0, 0, 0, 1, .5, 1); } });
  const jambonP = (x) => mk(x, z, g => { plat(g, .26); add(g, new THREE.SphereGeometry(.16, 18, 14), jambon, 0, .12, 0, 0, 0, .3, 1.3, .8, .9); add(g, new THREE.CylinderGeometry(.025, .03, .16, 8), brie, .24, .17, 0, 0, 0, 1.1);
    for (let k = 0; k < 5; k++) add(g, new THREE.CylinderGeometry(.08, .08, .01, 16), jambon, -.12 + k * .06, .03, .16, .3); });
  const saladeP = (x) => mk(x, zf, g => { add(g, new THREE.SphereGeometry(.16, 20, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), S({ color: 0xf7f7f2, roughness: .2, side: THREE.DoubleSide }), 0, .16, 0); void saladier;
    for (let k = 0; k < 12; k++) add(g, new THREE.SphereGeometry(.05, 8, 6), salade, Math.cos(k * 2.4) * .09, .13 + (k % 3) * .015, Math.sin(k * 2.4) * .09, 0, 0, 0, 1, .5, 1);
    for (let k = 0; k < 5; k++) add(g, new THREE.SphereGeometry(.025, 8, 6), cerise, Math.cos(k * 1.3) * .06, .16, Math.sin(k * 1.3) * .06); });
  const chauffe = (x) => mk(x, zb, g => { add(g, new THREE.BoxGeometry(.5, .1, .3), m.argent, 0, .12, 0); add(g, new THREE.CylinderGeometry(.15, .15, .5, 20, 1, false, 0, Math.PI), m.argent, 0, .17, 0, 0, 0, Math.PI / 2, 1, 1, .6);
    for (const s of [-1, 1]) add(g, new THREE.BoxGeometry(.02, .07, .26), m.argent, s * .23, .035, 0); });
  const pyramide = (x) => mk(x, zf, g => { for (let n = 3, y = 0; n > 0; n--, y += .11) for (let i = 0; i < n; i++) add(g, new THREE.CylinderGeometry(.03, .022, .1, 12, 1, true), m.verre, (i - (n - 1) / 2) * .075, y + .05, 0); });
  // de gauche à droite, en rangs serrés
  const menu = [chauffe, dinde, fromages, baguettes, corbeille, canapes, bouteilles, jambonP, saladeP, chauffe, gateau, canapes, bouteilles, dinde, corbeille, fromages, baguettes, pyramide, jambonP, saladeP, chauffe, corbeille, canapes, bouteilles];
  menu.forEach((f, k) => { const x = B.BX0 + .35 + k * (L2 - .7) / (menu.length - 1); if (f === corbeille) { corbeille(x, zf); corbeille(x + .18, zb); } else f(x); });
  return { g0, mets }; }
// une flaque de slime (au sol, sur une nappe, ou collée au mur)
let texSlime = null;
function slimeGB(S, x, y, z, nx = 0, ny = 1, nz = 0, taille = .9) { if (!texSlime) { texSlime = new THREE.TextureLoader().load("images/gb/slime.webp"); texSlime.colorSpace = THREE.SRGBColorSpace; }
  const t = taille * (.75 + Math.random() * .5), o = new THREE.Mesh(new THREE.PlaneGeometry(t, t * .72), new THREE.MeshStandardMaterial({ map: texSlime, transparent: true, depthWrite: false, roughness: .08, metalness: .1, emissive: 0x1a5a10, emissiveIntensity: .35, polygonOffset: true, polygonOffsetFactor: -2 }));
  o.position.set(x + nx * .012, y + ny * .012, z + nz * .012); o.lookAt(x + nx, y + ny, z + nz); o.rotateZ(Math.random() * 6.28); o.scale.setScalar(.2); o.renderOrder = 2; M.scene.add(o); S.slimes.push({ o, t0: performance.now() });
  if (S.slimes.length > 90) { const v = S.slimes.shift(); M.scene.remove(v.o); }
  sonBruit(.18, 380, .16); }
let texSlimer = {};
function texSlimerI(n) { if (!texSlimer[n]) { texSlimer[n] = new THREE.TextureLoader().load(`images/gb/slimer-${n}.webp`); texSlimer[n].colorSpace = THREE.SRGBColorSpace; } return texSlimer[n]; }
function messGB() { const L = M.L; if (!L || !L.tablesMess || L.gbMess) return; const B = MESS_GB, scene = M.scene;
  const dec = couvertsGB(scene, L.tablesMess, L.tableMess.TH), buf = buffetGB(scene);
  // le buffet barre le fond de la salle
  const o = L.limitesNiv; L.limitesNiv = (x, z, lv) => o(x, z, lv) && (lv || !(x > B.BX0 - .3 && x < B.BX1 + .3 && z < B.BZ + B.BD / 2 + .3));
  // Slimer : un panneau qui fait toujours face à la caméra ; on choisit l'image (de face, de profil) selon sa course
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: texSlimerI("face"), transparent: true, alphaTest: .3, depthWrite: true })); sp.scale.set(1.25, 1.4, 1); scene.add(sp);
  const lum = new THREE.PointLight(0x7dff4a, 3.2, 7, 1.6); scene.add(lum);
  const S = L.gbMess = { dec, buf, sp, lum, slimes: [], vol: [], pos: new THREE.Vector3(-1, 2.2, B.Z0 - 1.2), vit: new THREE.Vector3(), cible: null, attente: 0, tables: new Set(), dernierMur: new THREE.Vector3(99, 0, 99), murT: 0, mange: [], t: 0, vue: "face" };
  sp.position.copy(S.pos); return S; }
function voleGB(S, it, force = 1) { if (it.v || it.mange) return; const a = Math.random() * 6.28; it.v = new THREE.Vector3(Math.cos(a) * (1 + Math.random() * 2.2) * force, (2.4 + Math.random() * 2.2) * force, Math.sin(a) * (1 + Math.random() * 2.2) * force);
  it.w = new THREE.Vector3((Math.random() - .5) * 14, (Math.random() - .5) * 14, (Math.random() - .5) * 14); S.vol.push(it); }
// Slimer renverse une table : les couverts et le bouquet volent, les chaises valsent, et du slime sur la nappe (ou par terre)
function saccagerGB(S, t) { const L = M.L, T = L.tableMess; if (S.tables.has(t)) return; S.tables.add(t); const [x, z] = L.tablesMess[t];
  for (const it of S.dec.items) if (it.table === t) voleGB(S, it, .8);
  const renverse = Math.random() < .55;
  if (renverse) T.table(t, T.mk(x + (Math.random() - .5) * .5, T.TD / 2 + .06, z + (Math.random() - .5) * .5, (Math.random() - .5) * .9, Math.random() < .5 ? Math.PI / 2 : -Math.PI / 2));
  else T.table(t, T.mk(x + (Math.random() - .5) * .25, 0, z + (Math.random() - .5) * .25, (Math.random() - .5) * .5));
  for (let c = 0; c < 4; c++) { const a = Math.random() * 6.28, r = .8 + Math.random() * 1.1, couche = Math.random() < .6;
    T.chaise(t * 4 + c, couche ? T.mk(x + Math.cos(a) * r, .21, z + Math.sin(a) * r, Math.random() * 6.28, Math.random() < .5 ? Math.PI / 2 : 0, Math.random() < .5 ? 0 : Math.PI / 2) : T.mk(x + Math.cos(a) * r, 0, z + Math.sin(a) * r, Math.random() * 6.28)); }
  if (renverse) slimeGB(S, x + (Math.random() - .5), 0, z + (Math.random() - .5)); else slimeGB(S, x + (Math.random() - .5) * .6, T.TH + .03, z + (Math.random() - .5) * .3, 0, 1, 0, .75);
  sonBruit(.35, 900, .3); }
function animerSlimer(dt, now) { const L = M.L, S = L && L.gbMess; if (!S) return; const B = MESS_GB; S.t += dt;
  // les pièces qui volent : la pesanteur, un rebond, puis elles restent où elles tombent
  for (let k = S.vol.length - 1; k >= 0; k--) { const it = S.vol[k]; it.v.y -= 9.8 * dt; it.p.addScaledVector(it.v, dt);
    const e = new THREE.Euler(it.w.x * dt, it.w.y * dt, it.w.z * dt); it.q.multiply(new THREE.Quaternion().setFromEuler(e));
    if (it.p.x < B.X0 + .2 || it.p.x > B.X1 - .2) { it.v.x *= -.4; it.p.x = Math.max(B.X0 + .2, Math.min(B.X1 - .2, it.p.x)); } if (it.p.z < B.Z0 + .2) { it.v.z *= -.4; it.p.z = B.Z0 + .2; }
    if (it.p.y < .03) { it.p.y = .03; it.v.y = -it.v.y * .3; it.v.x *= .5; it.v.z *= .5; it.w.multiplyScalar(.4); if (it.v.length() < .35) { S.vol.splice(k, 1); it.v = null; } }
    majPiece(it); }
  // ce qu'il avale : aspiré vers sa bouche, et plus rien
  for (let k = S.mange.length - 1; k >= 0; k--) { const it = S.mange[k]; it.u += dt * 1.6; it.p.lerp(S.pos.clone().add(new THREE.Vector3(0, -.05, 0)), Math.min(1, dt * 6)); it.s = new THREE.Vector3(1, 1, 1).multiplyScalar(Math.max(.01, 1 - it.u));
    majPiece(it); if (it.u >= 1) { S.mange.splice(k, 1); if (it.o) M.scene.remove(it.o); } }
  for (const sl of S.slimes) if (sl.o.scale.x < 1) sl.o.scale.setScalar(Math.min(1, sl.o.scale.x + dt * 4));   // (la flaque s'étale)
  // sa course (à bout de forces : il ne bouge plus, retenu par les faisceaux)
  if (S.fige) { S.cible = null; S.vit.set(0, 0, 0); S.pos.lerp(S.fige, Math.min(1, dt * (S.capt ? 8 : 1.5))); }
  else { if (!S.cible || S.attente > 0) { S.attente -= dt;
    if (!S.cible || S.attente <= 0 && S.arrive) { S.arrive = false; const r = Math.random(), libres = L.tablesMess.map((_, i) => i).filter(i => !S.tables.has(i)), restes = S.buf.mets.filter(it => !it.mange && !it.v);
      if (S.script && S.script.length) { const c = S.script.shift(); S.cible = c; }
      else if (restes.length && r < .35) { const it = restes[Math.floor(Math.random() * restes.length)]; S.cible = { x: it.p.x, y: 1.5, z: B.BZ + .7, buffet: true }; }
      else if (libres.length && r < .8) { const i = libres[Math.floor(Math.random() * libres.length)]; S.cible = { x: L.tablesMess[i][0], y: 1.35, z: L.tablesMess[i][1], table: i }; }
      else { const murs = [[B.X0 + .7, 1.4 + Math.random() * 1.5, -9 + Math.random() * 15], [B.X1 - .7, 1.4 + Math.random() * 1.5, -9 + Math.random() * 15], [-8 + Math.random() * 12, 1.8 + Math.random(), B.Z0 + .7]]; const w = murs[Math.floor(Math.random() * 3)]; S.cible = { x: w[0], y: w[1], z: w[2] }; } } }
  if (S.cible && !(S.attente > 0)) { const c = S.cible, d = new THREE.Vector3(c.x - S.pos.x, c.y - S.pos.y, c.z - S.pos.z), l = d.length(), vmax = (S.rapide ? 4.2 : 3.0) * (S.combat ? 1.35 : 1);
    const v = l > .01 ? d.multiplyScalar(Math.min(vmax, l * 2.2) / l) : d; S.vit.lerp(v, Math.min(1, dt * 2.5));
    if (l < .3) { S.arrive = true; S.attente = (c.buffet ? 1.6 : c.table != null ? .5 : .4) * (S.combat ? 2 : 1);   // (au combat : il s'attarde un peu, c'est là qu'on peut le toucher)
      if (c.buffet) { const pres = S.buf.mets.filter(it => !it.mange && !it.v && Math.abs(it.p.x - S.pos.x) < 1.6).sort((a, b) => Math.abs(a.p.x - S.pos.x) - Math.abs(b.p.x - S.pos.x));
        pres.slice(0, 2).forEach(it => { it.mange = true; it.u = 0; S.mange.push(it); }); pres.slice(2, 4).forEach(it => voleGB(S, it, 1.1)); S.miam = 1.2; slimeGB(S, S.pos.x + (Math.random() - .5) * .6, B.TOP + .01, B.BZ + .1, 0, 1, 0, .7); sonBruit(.4, 300, .3); if (Math.random() < .6) criSlimer(.8); }
      if (c.table != null) saccagerGB(S, c.table);
      S.cible = c.apres ? (c.apres(), null) : null; } } }
  S.pos.addScaledVector(S.vit, dt); S.pos.x = Math.max(B.X0 + .5, Math.min(B.X1 - .5, S.pos.x)); S.pos.y = Math.max(.9, Math.min(4.2, S.pos.y));
  // en passant : il saccage les tables qu'il frôle, et colle du slime aux murs qu'il longe
  L.tablesMess.forEach(([x, z], i) => { if (!S.tables.has(i) && S.pos.y < 2.1 && Math.hypot(S.pos.x - x, S.pos.z - z) < .9) saccagerGB(S, i); });
  if (S.pos.z > B.Z0 + .1) { const mur = S.pos.x - B.X0 < 1.0 ? [B.X0 + .02, S.pos.y, S.pos.z, 1, 0, 0] : B.X1 - S.pos.x < 1.0 ? [B.X1 - .05, S.pos.y, S.pos.z, -1, 0, 0] : S.pos.z - B.Z0 < 1.0 ? [S.pos.x, S.pos.y, B.Z0 + .02, 0, 0, 1] : null;
    if (mur && S.t - S.murT > .35 && S.dernierMur.distanceTo(new THREE.Vector3(mur[0], mur[1], mur[2])) > 1.1) { S.murT = S.t; S.dernierMur.set(mur[0], mur[1], mur[2]); slimeGB(S, mur[0], Math.max(.5, mur[1] - .2 - Math.random() * .6), mur[2], mur[3], mur[4], mur[5], 1.1); } }
  // l'image : de face s'il vient vers nous, de profil sinon ; la bouche grande ouverte (vu d'en dessous) quand il avale
  const cam = M.camera.position, vx = cam.x - S.pos.x, vz = cam.z - S.pos.z, vl = Math.hypot(vx, vz) || 1, h = Math.hypot(S.vit.x, S.vit.z);
  S.miam = Math.max(0, (S.miam || 0) - dt); let vue = "face";
  if (S.miam > 0) vue = "dessous"; else if (h > .6) { const avance = (S.vit.x * vx + S.vit.z * vz) / (h * vl), cote = (S.vit.x * vz - S.vit.z * vx) / (h * vl); vue = avance > .55 ? "face" : cote > 0 ? "gauche" : "droit"; }
  if (vue !== S.vue) { S.vue = vue; S.sp.material.map = texSlimerI(vue); S.sp.material.needsUpdate = true; }
  const im = S.sp.material.map.image, H = 1.45; if (im && im.width) S.sp.scale.set(H * im.width / im.height, H, 1).multiplyScalar(1 - (S.capt || 0) * .96);
  S.criT = (S.criT == null ? 3 : S.criT) - dt; if (S.criT <= 0 && !S.capFin) { S.criT = 3.5 + Math.random() * 5; criSlimer(.7); }   // (il glousse, de temps en temps)
  S.sp.position.set(S.pos.x, S.pos.y + Math.sin(now / 260) * .08, S.pos.z); S.lum.position.copy(S.sp.position); S.lum.intensity = S.capFin ? 0 : 2.6 + Math.sin(now / 90) * .5; }
/* ----- l'arrivée de l'Ecto-1 : on touche la plaque du car, et la cinématique se joue dans la cour d'honneur « rien qu'à soi » (gb-cour) -----
   la voiture entre par le porche, gyrophares rouges et bleus, sirène, et s'arrête à côté de nous ; les quatre en descendent */
// la sirène de l'Ecto-1 (le vrai son) : elle hurle pendant que la voiture entre, puis s'éteint en fondu
function sireneGB(on) { if (!M) return; let a = M.sirGB;
  if (on) { if (!a) { a = M.sirGB = new Audio("sons/gb-sirene.mp3"); } clearInterval(a.fondu); a.currentTime = 0; a.volume = .85; a.play().catch(() => {}); return; }
  if (!a || a.paused) return; clearInterval(a.fondu); a.fondu = setInterval(() => { a.volume = Math.max(0, a.volume - .05); if (a.volume <= 0) { clearInterval(a.fondu); a.pause(); } }, 100); }
function obstacleEcto(L) { if (L.gbObstacle) return; L.gbObstacle = true; const lim = L.limites; L.limites = (x, z) => lim(x, z) && !(Math.abs(x - GARE_GB[0]) < 1.4 && Math.abs(z - GARE_GB[1]) < 3.5); }   // (on ne passe pas au travers de l'Ecto-1 garée)
function cineArriveeGB() { const moi = M.gens.get(M.moiNum), E = M.L.ecto1; if (!moi || !E || M.cine) return; M.L.gbIntro = true; M.gbSirCoupee = false; M.gbChef = true; M.cineSeul = CHEF_GB;
  moi.cible = null; moi.chemin = []; const mp = moi.g.position.clone(), nom = prenomSH();
  const [sx, sz] = GARE_GB, P0 = [0, 30], P1 = [0, sz + 10], P2 = [sx, sz], ROUTE = 8.5;   // (bien au milieu du porche, puis elle se range doucement)
  const bez = u => { const a = (1 - u) * (1 - u), b = 2 * u * (1 - u), c = u * u; return [a * P0[0] + b * P1[0] + c * P2[0], a * P0[1] + b * P1[1] + c * P2[1], 2 * (1 - u) * (P1[0] - P0[0]) + 2 * u * (P2[0] - P1[0]), 2 * (1 - u) * (P1[1] - P0[1]) + 2 * u * (P2[1] - P1[1])]; };
  E.visible = true; E.position.set(0, 0, 30); E.rotation.y = Math.PI / 2; sireneGB(true); sonBruit(2.2, 260, .35); musiqueGB(true, "gb-arrivee");   // (l'instrumental du film, jusqu'à l'entrée au mess)
  // ils se rangeront face à nous, entre la voiture et nous
  const ux = sx - 1.0 - mp.x, uz = sz - mp.z, ud = Math.hypot(ux, uz) || 1, dx = ux / ud, dz = uz / ud, px = -dz, pz = dx, rc = Math.min(2.3, ud * .6), cx = mp.x + dx * rc, cz = mp.z + dz * rc;
  if (M.gbScene) for (const p of M.gbScene.persos) M.scene.remove(p.g);
  const S = M.gbScene = { L: M.L, persos: GB.map(([c, n]) => { const p = creerGB(c, n, sx, sz); p.visible = false; p.place = viserLibre(0, 0); return p; }) };
  S.persos.forEach((p, k) => { p.place = viserLibre(cx + px * (k - 1.5) * .95, cz + pz * (k - 1.5) * .95); });
  const [EG, RA, VE, WI] = S.persos; let chef = null;
  const etapes = []; let t = ROUTE * 1000 + 900; const a = (f, apres = 0) => { etapes.push([t, f]); t += apres; };
  // les portières : les deux de devant, puis les deux de derrière (côté cour et côté voûte)
  const portes = [[1.0, -1.25], [1.0, 1.25], [-.3, -1.25], [-.3, 1.25]];
  S.persos.forEach((p, k) => a(() => { const w = posEcto(E, portes[k][0], portes[k][1]); p.x = w.x; p.z = w.z; p.visible = true; sonBruit(.1, 1600, .25);
    if (portes[k][1] > 0) { const c1 = posEcto(E, portes[k][0], 1.9), c2 = posEcto(E, 4.0, 1.9), c3 = posEcto(E, 4.0, -1.7); p.cible = [c1.x, c1.z]; p.chemin = [[c2.x, c2.z], [c3.x, c3.z], p.place]; }   // (côté droit : il fait le tour par l'avant, sans traverser la voiture)
    else p.cible = p.place; }, 650));
  t += 2400;
  const ligne = (p, txt) => a(() => { M.gbParle = p; bulle(`<b style="color:#b5573c">${esc(p.nom)}</b> : ${esc(txt)}`, dureeLigne(txt)); for (const q of S.persos) q.regard = null; }, dureeLigne(txt) + 300);   // (ils restent tous de face)
  ligne(VE, "Bon. D'après le standard, il y aurait un gros truc vert qui fait peur à tout le voisinage. Gluant, affamé, et très mal élevé. Mon genre de client, quoi.");
  ligne(RA, "Une apparition de classe 5, mobile, à forte manifestation ectoplasmique ! Ça, les gars, c'est du sérieux !");
  ligne(EG, "Les relevés du PKE sont hors norme. Et je rappelle une chose : il ne faut jamais croiser les effluves.");
  ligne(WI, "Du moment que c'est payé… Moi, je suis juste là pour le salaire.");
  // le chef de poste arrive, d'un bon pas
  a(() => { const P = (M.ctx.pnj && M.ctx.pnj()) || {}, d0 = viserLibre(mp.x - 7, mp.z + 7);
    chef = ajouterAncien({ numero: CHEF_GB, nom: P.nom || "Le chef de poste", tenue: P.tenue || "garde", couleur: P.couleur || "#1c2541", bas: P.bas, pieds: P.pieds, reglage: P.reglage || null, teteUrl: P.tete_v ? M.ctx.urlTetePNJ(P.tete_v) : "images/pere-tete.png", pnj: true, x: d0[0], z: d0[1] });
    if (chef) { chef.rapide = true; const v = viserLibre(mp.x - dx * 1.4 - px * 1.6, mp.z - dz * 1.4 - pz * 1.6); viser(chef, v[0], v[1]); } M.gbParle = chef; }, 3600);   // (à côté de nous, du côté opposé à la voiture)
  for (const txt of ["Ah ! Vous voilà enfin arrivés !", "Il faut attraper cette chose, et vite ! Elle est au mess : elle casse tout, et elle mange tout. Le buffet, les réserves… tout y passe !", "Et le Président de la République doit arriver d'une minute à l'autre… Alors faites vite, je vous en prie !"])
    a(() => { if (chef) { M.gbParle = chef; dire(CHEF_GB, txt); } }, dureeLigne(txt) + 300);
  ligne(VE, "Le Président ? Pas de panique. On lui gardera une part du buffet… s'il en reste.");
  ligne(RA, `Et toi, ${nom}… tu as déjà vu nos films ?`);
  a(() => { M.gbParle = null; if (M.L.ecto1) brumeSH(M.L.ecto1.position.clone().setY(0), 4000); }, 2600);   // (le titre a déjà été joué, devant l'affiche)
  let i = 0, fini = false, clk = 0, prec = performance.now(), vise = null;
  const finir = () => { if (fini) return; fini = true; M.gbParle = null; M.gbGare = true; M.cineSeul = null; sireneGB(false);
    voile("background:#fff;opacity:0;transition:opacity .8s", 2600).getBoundingClientRect(); setTimeout(() => { if (!M || M.L !== L0) return; finCine(); M.gbChef = false; M.gbActe = 1; changerLieu("gb-mess", [0, LIGNE_GB], 0); }, 900); };
  const L0 = M.L; M.passerBtn = boutonPasser(() => { M.cine.maj = () => {}; setTimeout(() => { if (M && M.L === L0) finir(); }, 1200); });   /* (le titre a déjà été joué au Video Futur) */
  M.cine = { maj: now => { if (fini) return; clk += Math.min(50, Math.max(0, now - prec)) * (M.vite || 1); prec = now; gyroEcto(E, true, now);
    while (i < etapes.length && clk >= etapes[i][0]) { etapes[i][1](); i++; } if (i >= etapes.length) { finir(); return; }
    const u = Math.min(1, clk / 1000 / ROUTE), s = 1 - Math.pow(1 - u, 2.2), [ex, ez, tx, tz] = bez(s);   // (elle freine en arrivant)
    if (u < 1) { E.position.set(ex, 0, ez); E.rotation.y = Math.atan2(-tz, tx); } else if (!M.gbSirCoupee) { M.gbSirCoupee = true; obstacleEcto(M.L); setTimeout(() => sireneGB(false), 2500); }
    // la caméra : d'abord vers le porche, la voiture qui entre ; puis près de nous, sur la voiture qui s'arrête ; ensuite sur celui qui parle
    const q = M.gbParle, f = q && q.g ? q.g.position : null, cible = f ? new THREE.Vector3(f.x, 1.25, f.z) : u < 1 ? new THREE.Vector3(ex, 1.1, ez) : new THREE.Vector3(cx, 1.2, cz);
    vise = vise || cible.clone(); vise.lerp(cible, 1 - Math.exp(-Math.min(50, now - (M.gbPrec || now)) / 1000 * 1.6)); M.gbPrec = now;   // (la caméra glisse doucement vers celui qui parle : plus de saut)
    const camLoin = new THREE.Vector3(-5, 2.3, -4.5), camPres = new THREE.Vector3(mp.x - dx * 1.9 + px * 1.3, mp.y + 1.85, mp.z - dz * 1.9 + pz * 1.3), k = lisse(Math.max(0, Math.min(1, (u - .45) / .5)));
    M.camera.position.copy(camLoin.lerp(camPres, k)); M.camera.position.y += Math.sin(Math.PI * k) * 3.2;   /* (elle passe par-dessus la voiture) */ M.camera.lookAt(vise); } }; }

/* ----- le combat, au mess (gb-mess) : les quatre et nous, en ligne, vus de dos ; on vise Bouffe-tout du doigt, la lance crache son faisceau -----
   immobile, il est facile à toucher ; touché, il repart aussitôt ; en mouvement, c'est bien plus dur. Un tir manqué brûle ce qu'il touche.
   Il peut foncer sur nous et nous couvrir de slime : quatre vies. Sa jauge vide : le piège à fantômes */
const LIGNE_GB = 6.4, PV_GB = 95;
const brulureTex = () => texBrulure || (texBrulure = tex(toile(256, 256, (x) => {   // (une tache de brûlé irrégulière : le centre charbonneux, l'auréole brune, la suie qui fuse en étoile)
  for (let k = 0; k < 9; k++) { const a = k / 9 * 6.28 + Math.random(), r = 18 + Math.random() * 30, cx = 128 + Math.cos(a) * r * .8, cy = 128 + Math.sin(a) * r * .8, R = 46 + Math.random() * 40, g = x.createRadialGradient(cx, cy, 2, cx, cy, R);
    g.addColorStop(0, "rgba(10,7,5,.85)"); g.addColorStop(.5, "rgba(42,24,12,.55)"); g.addColorStop(1, "rgba(70,42,20,0)"); x.fillStyle = g; x.fillRect(0, 0, 256, 256); }
  const g = x.createRadialGradient(128, 128, 4, 128, 128, 60); g.addColorStop(0, "rgba(4,3,2,.98)"); g.addColorStop(1, "rgba(12,8,6,0)"); x.fillStyle = g; x.fillRect(0, 0, 256, 256);
  x.strokeStyle = "rgba(14,10,8,.5)"; for (let k = 0; k < 26; k++) { const a = Math.random() * 6.28, l = 70 + Math.random() * 50; x.lineWidth = 1 + Math.random() * 3; x.beginPath(); x.moveTo(128, 128); x.lineTo(128 + Math.cos(a) * l, 128 + Math.sin(a) * l); x.stroke(); }
  x.fillStyle = "rgba(255,120,30,.55)"; for (let k = 0; k < 40; k++) { const a = Math.random() * 6.28, r = 40 + Math.random() * 28; x.beginPath(); x.arc(128 + Math.cos(a) * r, 128 + Math.sin(a) * r, 1 + Math.random() * 2, 0, 7); x.fill(); } })));   // (quelques braises)
// un faisceau : plusieurs rubans tordus (le cœur bleu-blanc, des éclairs bleus, orange, roses), toujours tournés vers la caméra
const BRINS_GB = [[.10, 0xd8ecff, .012, 0, .02], [.05, 0x3f7cff, .07, 3.1, .05], [.055, 0xff8a1a, .13, 2.2, .06], [.045, 0xff3fa0, .11, 2.7, .06], [.035, 0xff5a1e, .18, 1.6, .1], [.03, 0x9ad0ff, .09, 4.2, .08]];
function creerRayon() { const N = 30, g = new THREE.Group(), brins = BRINS_GB.map(([w, c, amp, fr, jit], k) => { const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 6), 3));
    const idx = []; for (let i = 0; i < N - 1; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } geo.setIndex(idx);
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: k ? .85 : 1, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); m.frustumCulled = false; m.renderOrder = 5; g.add(m);
    return { m, w, amp, fr, jit, ph: k * 1.7 }; });
  const sp = (s) => { const o = new THREE.Sprite(new THREE.SpriteMaterial({ map: lueurGB(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); o.scale.setScalar(s); o.renderOrder = 6; g.add(o); return o; };
  const r = { g, brins, N, bout: sp(.5), impact: sp(1.1) }; M.scene.add(g); return r; }
function majRayon(r, A, B, now) { r.g.visible = true; const cam = M.camera.position, d = new THREE.Vector3().subVectors(B, A), L2 = d.length(), dir = d.clone().normalize();
  const e1 = new THREE.Vector3().crossVectors(dir, Math.abs(dir.y) < .9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0)).normalize(), e2 = new THREE.Vector3().crossVectors(dir, e1);
  const p = new THREE.Vector3(), t = new THREE.Vector3(), v = new THREE.Vector3(), s = new THREE.Vector3(), pts = [];
  for (const b of r.brins) { pts.length = 0;
    for (let i = 0; i < r.N; i++) { const u = i / (r.N - 1), env = Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.15)), .6), ang = u * L2 * b.fr + now / 1000 * (8 + b.fr * 3) + b.ph;
      const jx = (Math.random() - .5) * b.jit * env, jy = (Math.random() - .5) * b.jit * env, amp = b.amp * env * (1 + .25 * Math.sin(now / 90 + b.ph));
      pts.push(new THREE.Vector3().copy(A).addScaledVector(d, u).addScaledVector(e1, Math.cos(ang) * amp + jx).addScaledVector(e2, Math.sin(ang) * amp + jy)); }
    const pos = b.m.geometry.attributes.position.array;
    for (let i = 0; i < r.N; i++) { p.copy(pts[i]); t.subVectors(pts[Math.min(r.N - 1, i + 1)], pts[Math.max(0, i - 1)]).normalize(); v.subVectors(cam, p); s.crossVectors(t, v).normalize().multiplyScalar(b.w / 2 * (i === 0 ? .4 : 1));
      pos[i * 6] = p.x + s.x; pos[i * 6 + 1] = p.y + s.y; pos[i * 6 + 2] = p.z + s.z; pos[i * 6 + 3] = p.x - s.x; pos[i * 6 + 4] = p.y - s.y; pos[i * 6 + 5] = p.z - s.z; }
    b.m.geometry.attributes.position.needsUpdate = true; }
  r.bout.position.copy(A); r.bout.scale.setScalar(.35 + Math.random() * .2); r.impact.position.copy(B); r.impact.scale.setScalar(.8 + Math.random() * .6); }
let texFlammeGB = null, imagesFeu = null;   // (texFumeeGB : dans matrice.js, avec fumeeTex)
const flammeTex = () => texFlammeGB || (texFlammeGB = tex(toile(64, 128, (x) => { const g = x.createRadialGradient(32, 112, 2, 32, 96, 70); g.addColorStop(0, "rgba(255,250,210,1)"); g.addColorStop(.25, "rgba(255,200,60,.95)"); g.addColorStop(.55, "rgba(255,110,20,.7)"); g.addColorStop(1, "rgba(200,30,0,0)");
  x.fillStyle = g; x.beginPath(); x.moveTo(32, 2); x.bezierCurveTo(52, 40, 62, 80, 58, 104); x.bezierCurveTo(54, 124, 10, 124, 6, 104); x.bezierCurveTo(2, 80, 12, 40, 32, 2); x.fill(); })));
// le vrai feu : huit images, faites de dizaines de langues lumineuses qui montent (blanc-jaune au pied, orange, puis rouge sombre au bout) ; elles défilent vite : ça danse
function feuImages() { if (imagesFeu) return imagesFeu; imagesFeu = [];
  for (let f = 0; f < 8; f++) imagesFeu.push(tex(toile(96, 192, (x) => { x.globalCompositeOperation = "lighter";
    for (let k = 0; k < 110; k++) { const t = Math.pow(Math.random(), 1.4), y = 184 - t * 170, larg = (1 - t) * 26 + 4, cx = 48 + (Math.random() - .5) * larg * 1.3 + Math.sin(t * 7 + f * .8) * 9 * t, r = (1 - t) * 20 + 4 + Math.random() * 6;
      const c = t < .2 ? "255,245,205" : t < .45 ? "255,185,60" : t < .75 ? "245,105,25" : "170,45,12", g = x.createRadialGradient(cx, y, 0, cx, y, r); g.addColorStop(0, `rgba(${c},${.32 * (1 - t * .5)})`); g.addColorStop(1, `rgba(${c},0)`);
      x.fillStyle = g; x.beginPath(); x.ellipse(cx, y, r * .75, r * 1.25, 0, 0, 7); x.fill(); } }))); return imagesFeu; }
// une flamme qui reste accrochée là où le faisceau a brûlé (un mur, une table) : elle danse, fume, puis s'éteint
function flammeGB(C, P, n) { C.flammes = C.flammes || []; if (C.flammes.length > 34) return; const im = feuImages();
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: im[0], blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); sp.center.set(.5, .04);
  sp.position.copy(P).addScaledVector(n, .08); sp.renderOrder = 6; M.scene.add(sp); C.flammes.push({ sp, t: 0, vie: 7 + Math.random() * 6, s: .55 + Math.random() * .45, ph: Math.random() * 8, fumT: Math.random() }); }
function animerFlammes(C, dt, now) { if (!C.flammes) return; const im = feuImages(); C.fumees = C.fumees || [];
  for (let k = C.flammes.length - 1; k >= 0; k--) { const f = C.flammes[k]; f.t += dt;
    const k2 = Math.max(0, Math.min(1, (f.vie - f.t) / 2)) * Math.min(1, f.t / .5); if (f.t >= f.vie) { M.scene.remove(f.sp); C.flammes.splice(k, 1); continue; }
    f.sp.material.map = im[Math.floor(now / 65 + f.ph) % im.length]; const fl = 1 + .12 * Math.sin(now / 90 + f.ph * 3);
    f.sp.scale.set(f.s * .8 * k2, f.s * 1.6 * fl * k2, 1); f.sp.material.opacity = k2;
    f.fumT -= dt; if (f.fumT <= 0 && C.fumees.length < 50) { f.fumT = .35 + Math.random() * .3;   // (la fumée qui s'en échappe, monte et se dissipe)
      const fs = new THREE.Sprite(new THREE.SpriteMaterial({ map: fumeeTex(), transparent: true, depthWrite: false })); fs.position.copy(f.sp.position).add(new THREE.Vector3(0, f.s * 1.3, 0)); M.scene.add(fs); C.fumees.push({ sp: fs, t: 0, s: f.s * (.6 + Math.random() * .4) }); } }
  for (let k = C.fumees.length - 1; k >= 0; k--) { const u = C.fumees[k]; u.t += dt; const a = u.t / 2.4; if (a >= 1) { M.scene.remove(u.sp); C.fumees.splice(k, 1); continue; }
    u.sp.position.y += dt * .7; u.sp.position.x += dt * .12; u.sp.scale.setScalar(u.s * (.6 + a * 2)); u.sp.material.opacity = (1 - a) * .8; } }
function brulerGB(C, h, dir, cle = "") { if (!h || !h.face) return; const n = h.face.normal.clone();
  if (h.instanceId != null && h.object.getMatrixAt) { const m4 = new THREE.Matrix4(); h.object.getMatrixAt(h.instanceId, m4); n.transformDirection(m4); }
  n.transformDirection(h.object.matrixWorld); if (n.dot(dir) > 0) n.negate();
  C.der = C.der || {}; if (C.der[cle] && C.der[cle].distanceTo(h.point) < .13) return; C.der[cle] = h.point.clone();   // (des traînées : les brûlures se suivent le long du faisceau qui balaie)
  if (Math.random() < .14) flammeGB(C, h.point, n);
  const t = .28 + Math.random() * .2, o = new THREE.Mesh(new THREE.PlaneGeometry(t * .5, t * .5 * (.7 + Math.random() * .5)), new THREE.MeshStandardMaterial({ map: brulureTex(), transparent: true, depthWrite: false, roughness: 1, polygonOffset: true, polygonOffsetFactor: -3 }));
  o.position.copy(h.point).addScaledVector(n, .01); o.lookAt(h.point.clone().add(n)); o.rotateZ(Math.random() * 6.28); o.renderOrder = 3; M.scene.add(o); C.brulures.push(o);
  if (C.brulures.length > 420) M.scene.remove(C.brulures.shift()); }
function hudGB(C) { if (!C.hud) { const d = document.createElement("div"); d.style.cssText = "position:absolute;left:50%;top:8px;transform:translateX(-50%);z-index:7;width:min(78%,560px);pointer-events:none;font:900 12px 'Lato',sans-serif;color:#eaffd8;text-shadow:0 1px 2px #000;text-align:center";
    d.innerHTML = '<div class="nom">BOUFFE-TOUT</div><div style="margin-top:3px;height:14px;border:2px solid #0d2a06;border-radius:8px;background:rgba(0,0,0,.55);overflow:hidden"><div class="pv" style="height:100%;width:100%;background:linear-gradient(#a6ff5a,#3fa61a);transition:width .2s"></div></div><div class="vies" style="margin-top:5px;font-size:18px;letter-spacing:3px"></div>';
    M.ctx.conteneur.appendChild(d); C.hud = d; }
  if (C.nom) C.hud.querySelector(".nom").textContent = C.nom; C.hud.querySelector(".pv").style.width = Math.max(0, C.pv / (C.pvMax || PV_GB) * 100) + "%"; C.hud.querySelector(".vies").textContent = "❤️".repeat(Math.max(0, C.vies)) + "🤍".repeat(Math.max(0, 4 - C.vies)); }
// le thème de S.O.S. Fantômes : dès qu'on entre au mess, pendant qu'on regarde Bouffe-tout tout démolir, et tout le combat
// les musiques : le thème du film (l'arrivée au mess), « Cleanin' Up the Town » (le combat, dès le « FEU ! ») ; l'une s'efface quand l'autre part
function musiqueGB(on, fichier = "gb-theme") { if (!M) return; M.musGBs = M.musGBs || {};
  const fondre = a => { if (!a || a.paused) return; clearInterval(a.fondu); a.fondu = setInterval(() => { a.volume = Math.max(0, a.volume - .04); if (a.volume <= 0) { clearInterval(a.fondu); a.pause(); } }, 100); };
  if (!on) { for (const a of Object.values(M.musGBs)) fondre(a); return; }
  for (const [k, a] of Object.entries(M.musGBs)) if (k !== fichier) fondre(a);
  let a = M.musGBs[fichier]; if (!a) { a = M.musGBs[fichier] = new Audio(`sons/${fichier}.mp3`); a.loop = true; } clearInterval(a.fondu); if (a.paused) a.currentTime = 0; a.volume = .8; a.play().catch(() => {}); }
// les cris des monstres, fabriqués à la volée : Bouffe-tout (un couinement gluant qui glousse, des gargouillis) ; le Bibendum (un rugissement grave et rocailleux)
function criSlimer(force = 1) { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; } const t = actx.currentTime, d = .7 + Math.random() * .6;
  const o = actx.createOscillator(), vib = actx.createOscillator(), vg = actx.createGain(), g = actx.createGain(), f = actx.createBiquadFilter(); o.type = "sawtooth"; vib.frequency.value = 22 + Math.random() * 10; vg.gain.value = 60;
  const f0 = 260 + Math.random() * 120; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f0 * (2.4 + Math.random()), t + d * .35); o.frequency.exponentialRampToValueAtTime(f0 * .8, t + d);
  vib.connect(vg); vg.connect(o.frequency); f.type = "bandpass"; f.frequency.value = 1100; f.Q.value = 1.6; o.connect(f); f.connect(g); g.connect(actx.destination);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.13 * force, t + .05); g.gain.setValueAtTime(.13 * force, t + d * .7); g.gain.linearRampToValueAtTime(0, t + d); o.start(t); vib.start(t); o.stop(t + d + .05); vib.stop(t + d + .05);
  // les gargouillis : du bruit grave, haché en bulles
  const n = Math.floor(actx.sampleRate * d), b = actx.createBuffer(1, n, actx.sampleRate), dd = b.getChannelData(0); for (let i = 0; i < n; i++) dd[i] = (Math.random() * 2 - 1) * (Math.sin(i / actx.sampleRate * 2 * Math.PI * 18) > .2 ? 1 : .1);
  const src = actx.createBufferSource(), lp = actx.createBiquadFilter(), g2 = actx.createGain(); src.buffer = b; lp.type = "lowpass"; lp.frequency.value = 420; g2.gain.value = .22 * force; src.connect(lp); lp.connect(g2); g2.connect(actx.destination); src.start(t); }
function rugirSP(force = 1) { if (!M) return; const a = new Audio("sons/gb-rugissement.mp3"); a.volume = Math.min(1, .75 * force); a.playbackRate = .92 + Math.random() * .16; a.play().catch(() => {});   // (le vrai rugissement, un peu plus grave ou plus aigu à chaque fois)
  sonBruit(1.4, 140, .35 * force); }   // (et le grondement, dessous)
// le bruit des faisceaux : un bourdonnement électrique qui vibre, et des crépitements ; plus fort à plusieurs, et quand ça touche le monstre
function sonEffluves(n, touche) { if (!M) return; if (!n && !M.sonEff) return; try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
  let S = M.sonEff;
  if (!S) { const o1 = actx.createOscillator(), o2 = actx.createOscillator(), lfo = actx.createOscillator(), lg = actx.createGain(); o1.type = "sawtooth"; o1.frequency.value = 92; o2.type = "square"; o2.frequency.value = 184.7; lfo.frequency.value = 13; lg.gain.value = 18; lfo.connect(lg); lg.connect(o1.frequency);
    const nb = actx.sampleRate * 2, b = actx.createBuffer(1, nb, actx.sampleRate), d = b.getChannelData(0); for (let i = 0; i < nb; i++) d[i] = (Math.random() * 2 - 1) * (Math.random() < .02 ? 1 : .22);   // (des étincelles : des pics de bruit)
    const src = actx.createBufferSource(); src.buffer = b; src.loop = true; const hp = actx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 1700;
    const bp = actx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 900; bp.Q.value = .8; const gB = actx.createGain(), gC = actx.createGain(), g = actx.createGain(); gB.gain.value = .5; gC.gain.value = .5; g.gain.value = 0;
    o1.connect(bp); o2.connect(bp); bp.connect(gB); src.connect(hp); hp.connect(gC); gB.connect(g); gC.connect(g); g.connect(actx.destination); o1.start(); o2.start(); lfo.start(); src.start();
    S = M.sonEff = { g, gC, hp, o1 }; }
  const t = actx.currentTime, vol = n > 0 ? Math.min(.24, .08 + n * .03) * (touche ? 1.25 : 1) : 0;
  S.g.gain.setTargetAtTime(vol, t, n > 0 ? .05 : .12);
  if (n > 0) { S.gC.gain.setTargetAtTime((touche ? .9 : .4) + Math.random() * .6, t, .015); S.hp.frequency.setTargetAtTime(1400 + Math.random() * 1600, t, .02); S.o1.frequency.setTargetAtTime(touche ? 78 : 92, t, .1); } }   // (le crépitement change sans arrêt)
function finCombatGB() { const C = M && M.gbCombat; musiqueGB(false); sonEffluves(0); if (!C) return; if (C.hud) C.hud.remove(); if (C.piegeBtn) C.piegeBtn.remove(); for (const r of C.rayons.values()) M.scene.remove(r.g); M.gbCombat = null; M.gbVisee = null; }
function combatGB() { const L = M.L, moi = M.gens.get(M.moiNum); if (!moi || L.gbMess || M.cine) return; const S = messGB(); if (!S) return; const B = MESS_GB;
  if (M.gbCombat) finCombatGB();
  const C = M.gbCombat = { L, vies: 4, pv: PV_GB, rayons: new Map(), brulures: [], t: 0, attaque: 10, contact: 0, cibles: [], fini: false };
  S.combat = true;
  // la ligne : Egon, Ray, nous au milieu, Venkman, Winston — tournés vers le fond du mess
  const xs = { egon: -2.4, ray: -1.2, venkman: 1.2, winston: 2.4 };
  if (M.gbScene) for (const p of M.gbScene.persos) M.scene.remove(p.g);
  M.gbScene = { L, persos: GB.map(([c, n]) => { const p = creerGB(c, n, xs[c], LIGNE_GB); p.regard = [xs[c], -20]; p.tirT = 1 + Math.random() * 3; return p; }) };
  moi.g.position.set(0, 0, LIGNE_GB); moi.cible = null; moi.chemin = []; envoyerWS({ t: "aller", x: 0, z: LIGNE_GB });
  Object.assign(moi.info, { tenue: "ghostbuster", couleur: "#c9b98f", bas: "#c9b98f", pieds: "#2a2522", gbDos: true }); dessinerCorps(moi);   // (nous aussi, en combinaison, le pack sur le dos)
  // ce que les tirs peuvent brûler : la salle, les tables, les chaises, le buffet (pas les gens, ni Bouffe-tout, ni le slime)
  const exclus = new Set(); for (const p of M.gens.values()) p.g.traverse(o => exclus.add(o)); for (const p of M.gbScene.persos) p.g.traverse(o => exclus.add(o));
  M.scene.traverse(o => { if ((o.isMesh || o.isInstancedMesh) && !exclus.has(o) && !(o.material && o.material.transparent && o.material.depthWrite === false) && o.visible) C.cibles.push(o); });
  // d'abord, on le regarde tout démolir (la musique part) : le buffet, puis les tables ; ensuite seulement, on tire
  const ti = (x, z) => { const i = L.tablesMess.findIndex(([a, b]) => Math.abs(a - x) < .05 && Math.abs(b - z) < .05); return { x, y: 1.3, z, table: i }; };
  S.pos.set(-1, 2.0, B.Z0 - .8); S.script = [{ x: -1, y: 1.7, z: B.BZ + .7, buffet: true }, ti(-2.6, -7.2), { x: -5, y: 1.6, z: B.BZ + .7, buffet: true }, ti(-7.2, -4.2), ti(3.0, -1.2), { x: B.X1 - .7, y: 2.3, z: -3 }, ti(-2.6, 1.8)];
  C.intro = 14; musiqueGB(true); bulle("<i>Le mess, dressé pour le Président… et Bouffe-tout qui s'en donne à cœur joie.</i>", 4500);
  const vise = new THREE.Vector3(0, 1.35, -4);
  M.cine = { gb: false, maj: () => { M.camera.position.set(0, 2.55, LIGNE_GB + 3.3); vise.lerp(C.intro > 0 && S ? S.pos : new THREE.Vector3(0, 1.35, -4), C.intro > 0 ? .04 : .03); M.camera.lookAt(vise); } }; }
// Bouffe-tout touché : il file aussitôt ailleurs, vite
function fuiteGB(S) { criSlimer(1.2); const B = MESS_GB, x = B.X0 + 1 + Math.random() * (B.X1 - B.X0 - 2), z = -10 + Math.random() * 12;
  S.cible = { x, y: 1.6 + Math.random() * 1.6, z }; S.attente = 0; S.arrive = false; S.rapide = true; S.fuiteT = 1.2; sonBruit(.25, 1200, .2); }
// il nous fonce dessus : du slime partout, une vie en moins
function salirGB() { const C = M.gbCombat, S = M.L.gbMess, moi = M.gens.get(M.moiNum); if (!C || C.fini || !S) return; C.vies--; S.rapide = true; S.attaqueEnCours = false;
  const d = voile("background:url(images/gb/slime.webp) center/120% no-repeat,radial-gradient(circle,rgba(70,170,40,.55),rgba(20,90,10,.75));opacity:1", 3200);   // (l'écran couvert de slime, qui s'égoutte peu à peu)
  let op = 1; const it = setInterval(() => { op -= .035; if (op <= 0 || !d.isConnected) { clearInterval(it); d.remove(); return; } d.style.opacity = String(Math.min(1, op * 1.4)); }, 80);
  if (moi) { slimeGB(S, moi.g.position.x, 0, moi.g.position.z - .2, 0, 1, 0, 1.3); moi.englue = 15; M.gbVisee = null; } sonBruit(.5, 300, .4);   // (englué de la tête aux pieds : 15 secondes sans pouvoir tirer)
  bulle(C.vies > 0 ? `<b style="color:#b5573c">Ray</b> : Beurk ! Il t'a englué, ${esc(prenomSH())} ! Tu ne peux plus bouger… tiens bon, ça va sécher !` : "<b>Bouffe-tout vous a eus…</b> On se relève, et on recommence !", 4200);
  if (C.vies <= 0) setTimeout(() => { if (M && M.gbCombat === C) { C.vies = 4; C.pv = PV_GB; hudGB(C); } }, 3500);
  hudGB(C); fuiteGB(S); }
// il a slimé l'un des quatre : couvert de vert, il s'en plaint
// il a englué l'un des quatre : couvert de slime de la tête aux pieds, il ne peut plus tirer pendant 15 secondes
function salirPersoGB(p) { const C = M.gbCombat, S = M.L.gbMess; if (!C || C.fini || !S) return; S.attaqueEnCours = false;
  p.englue = 15; p.rafale = 0; slimeGB(S, p.x, 0, p.z - .1, 0, 1, 0, 1.3); sonBruit(.5, 300, .4); p.choc = 1;
  const r = { venkman: "Il m'a slimé ! Je ne peux plus bouger…", ray: "Beurk ! J'en ai partout, je suis collé !", egon: "Fascinant… et répugnant. Je suis englué.", winston: "Hé ! Pas sur la combinaison ! Je ne peux plus lever la lance !" }[p.cle];
  bulle(`<b style="color:#b5573c">${esc(p.nom)}</b> : ${esc(r)}`, 3600); fuiteGB(S); }
function vaincuGB(C, S) { C.fini = true; S.fige = new THREE.Vector3(-.6, 1.9, -1.5); S.cible = null; M.gbVisee = null;
  bulle(`<b style="color:#b5573c">Ray</b> : Il est à bout ! On le tient ! ${esc(prenomSH())}, lance le piège, vite !`, 7000);
  const b = document.createElement("button"); b.type = "button"; b.textContent = "🪤 Piège à fantômes";
  b.style.cssText = "position:absolute;left:50%;bottom:64px;transform:translateX(-50%);z-index:9;border:2px solid #111;border-radius:14px;padding:12px 20px;background:#f4d03f;color:#111;font:900 17px 'Lato',sans-serif;box-shadow:3px 4px 0 rgba(0,0,0,.5);cursor:pointer";
  for (const ev of ["pointerdown", "pointerup", "touchstart", "mousedown"]) b.addEventListener(ev, e => e.stopPropagation());
  b.onclick = e => { e.stopPropagation(); b.remove(); C.piegeBtn = null; cinePiegeGB(); }; M.ctx.conteneur.appendChild(b); C.piegeBtn = b; }
function animerCombatGB(dt, now) { const C = M.gbCombat; if (!C) return; if (C.L !== M.L) { finCombatGB(); return; } const S = M.L.gbMess, moi = M.gens.get(M.moiNum); if (!S || !moi) return; C.t += dt;
  animerFlammes(C, dt, now);
  if (C.intro > 0 || C.ordre > 0) sonEffluves(0);
  if (C.intro > 0) { C.intro -= dt; if (C.intro <= 0 || (S.script && !S.script.length && C.intro < 8)) { C.intro = 0; S.script = null; C.ordre = 6.5; hudGB(C);
      bulle(`<b style="color:#b5573c">Venkman</b> : Bon, ça suffit. Tout le monde en position… Personne ne tire avant mon signal. Visez quand il s'arrête pour manger. Et on ne croise pas les effluves !`, 6200); } return; }
  if (C.ordre > 0) { C.ordre -= dt; if (C.ordre <= 0) { C.ordre = 0; if (M.cine) M.cine.gb = true; bulle(`<b style="color:#b5573c">Venkman</b> : Attention… FEU !`, 2600); sonBruit(.3, 900, .2); musiqueGB(true, "gb-combat"); } return; }   // (personne ne tire tant qu'il n'a pas donné l'ordre)
  const ray = M.gbRay || (M.gbRay = new THREE.Raycaster()); ray.camera = M.camera; const vus = new Set();
  const statique = (S.arrive && S.attente > 0) || S.vit.length() < .7, cible = S.sp.position; M.gbCibleVue = cible;
  const tir = (cle, A, dir, degats, fuit) => { // un faisceau de A dans la direction dir : il touche Bouffe-tout, ou il brûle ce qu'il rencontre
    ray.set(A, dir); ray.far = 40; const dS = ray.ray.distanceToPoint(cible), devant = cible.clone().sub(A).dot(dir) > 0, R = statique ? .6 : .28;
    let B2;
    if (devant && dS < R && !S.capFin) { B2 = cible.clone().add(new THREE.Vector3((Math.random() - .5) * .2, (Math.random() - .5) * .2, 0)); C.touche = true; if (!C.fini) C.pv -= degats * dt * (statique ? 1 : .7);
      if (fuit) { C.contact += dt; if (C.contact > .24 && !S.fuiteT) { C.contact = 0; fuiteGB(S); } } }
    else { const h = ray.intersectObjects(C.cibles, false)[0]; B2 = h ? h.point.clone() : A.clone().addScaledVector(dir, 25);
      if (h && (!C.brT || C.brT[cle] === undefined || now - C.brT[cle] > 28)) { C.brT = C.brT || {}; C.brT[cle] = now; brulerGB(C, h, dir, cle); } if (fuit) C.contact = 0; }
    let r = C.rayons.get(cle); if (!r) { r = creerRayon(); C.rayons.set(cle, r); } majRayon(r, A, B2, now); vus.add(cle); };
  // le nôtre : là où le doigt vise
  if (moi.englue > 0) { moi.englue -= dt; M.gbVisee = null; if (moi.englue <= 0) bulle("Le slime a séché : tu peux tirer de nouveau !", 2400); }
  if (M.gbVisee && !C.fini) { const H = tailleBonhomme(), A = boutCanonGB() || new THREE.Vector3(moi.g.position.x + .3, H * .48, moi.g.position.z - .15);
    ray.setFromCamera(new THREE.Vector2(M.gbVisee.x, M.gbVisee.y), M.camera); const P = ray.ray.at(30, new THREE.Vector3()), hS = ray.ray.distanceToPoint(cible) < (statique ? .6 : .28) ? cible.clone() : (ray.intersectObjects(C.cibles, false)[0] || { point: P }).point;
    tir("moi", A, hS.clone().sub(A).normalize(), 11, true); }
  // les quatre : des rafales sur lui quand il s'arrête (ils le tiennent tous quand il est à bout)
  for (const p of M.gbScene ? M.gbScene.persos : []) { p.tirT -= dt; const tient = C.fini && !S.capFin;
    const A = new THREE.Vector3(p.x + .22, p.H * .48, p.z - .15);
    if (tient) { tir(p.cle, A, cible.clone().sub(A).normalize(), 0, false); continue; }
    if (C.fini) continue;
    if (p.englue > 0) continue;   // (englué : il ne tire plus)
    if (!(p.rafale > 0) && p.tirT <= 0 && statique) { p.rafale = 1 + Math.random() * 1.2; p.ecart = new THREE.Vector3((Math.random() - .5) * 1.4, (Math.random() - .5) * .8, 0); }
    if (p.rafale > 0) { tir(p.cle, A, cible.clone().add(p.ecart).sub(A).normalize(), .5, false); p.rafale -= dt; if (p.rafale <= 0) p.tirT = 2 + Math.random() * 4; } }
  for (const [k, r] of C.rayons) if (!vus.has(k)) r.g.visible = false;
  sonEffluves(vus.size, C.touche); C.touche = false;   // (le bruit d'électricité des faisceaux)
  if (S.fuiteT) { S.fuiteT -= dt; if (S.fuiteT <= 0) { S.fuiteT = 0; S.rapide = false; } }
  hudGB(C);
  if (!C.fini && C.pv <= 0) { C.pv = 0; vaincuGB(C, S); return; }
  // de temps en temps, il fonce sur nous
  if (!C.fini && !S.attaqueEnCours) { C.attaque -= dt; if (C.attaque <= 0) { C.attaque = 5 + Math.random() * 5; S.attaqueEnCours = true; S.rapide = true;   // (il fonce sur qui il veut : nous, ou l'un des quatre)
    const vis = [null, ...(M.gbScene ? M.gbScene.persos : [])][Math.floor(Math.random() * 5)], px = vis ? vis.x : moi.g.position.x, pz = vis ? vis.z : moi.g.position.z;
    S.cible = { x: px + (Math.random() - .5) * .4, y: 1.35, z: pz - .5, apres: vis ? () => salirPersoGB(vis) : salirGB }; S.attente = 0; S.arrive = false; criSlimer(1.3); } }
  if (S.attaqueEnCours && S.cible && !S.cible.apres) S.attaqueEnCours = false;   // (touché en route : il a filé ailleurs)
}
// le piège : lancé sous lui, il s'ouvre, un cône de lumière l'aspire, il se referme dans un nuage blanc ; puis retour dans la cour, à côté de l'Ecto-1
function creerPiege() { const g = new THREE.Group(), noir = new THREE.MeshStandardMaterial({ color: 0x2a2a2c, roughness: .5, metalness: .4 }), alu = new THREE.MeshStandardMaterial({ color: 0xa8adb2, roughness: .3, metalness: .8 });
  const rayures = tex(toile(128, 32, (x, w, h) => { x.fillStyle = "#f2c81e"; x.fillRect(0, 0, w, h); x.fillStyle = "#111"; for (let k = -2; k < 12; k++) { x.beginPath(); x.moveTo(k * 16, h); x.lineTo(k * 16 + 8, h); x.lineTo(k * 16 + 24, 0); x.lineTo(k * 16 + 16, 0); x.fill(); } }));
  const corps = new THREE.Mesh(new THREE.BoxGeometry(.44, .12, .3), [new THREE.MeshStandardMaterial({ map: rayures }), new THREE.MeshStandardMaterial({ map: rayures }), noir, noir, new THREE.MeshStandardMaterial({ map: rayures }), new THREE.MeshStandardMaterial({ map: rayures })]);
  corps.position.y = .06; g.add(corps);
  for (const sx of [-1, 1]) { const r = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, .04, 10), alu); r.rotation.z = Math.PI / 2; r.position.set(sx * .2, .03, .12); g.add(r); }
  const voy = new THREE.Mesh(new THREE.SphereGeometry(.025, 10, 8), new THREE.MeshStandardMaterial({ color: 0xff2020, emissive: 0xff0000, emissiveIntensity: .3 })); voy.position.set(.15, .13, -.1); g.add(voy);
  const volets = [-1, 1].map(s => { const piv = new THREE.Group(); piv.position.set(0, .125, s * .15); g.add(piv); const v = new THREE.Mesh(new THREE.BoxGeometry(.42, .025, .15), alu); v.position.z = -s * .075; piv.add(v); return { piv, s }; });
  const cable = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-.22, .05, 0), new THREE.Vector3(-.6, .01, .2), new THREE.Vector3(-1.1, .01, .1)]), 16, .012, 6), noir); g.add(cable);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); return { g, volets, voy }; }
function cinePiegeGB() { const C = M.gbCombat, S = M.L.gbMess, moi = M.gens.get(M.moiNum); if (!C || !S || !moi) return;
  const P = creerPiege(), dep = new THREE.Vector3(moi.g.position.x + .3, .9, moi.g.position.z - .3), arr = new THREE.Vector3(S.fige.x, 0, S.fige.z); M.scene.add(P.g); P.g.position.copy(dep);
  const hC = S.fige.y + .4, cone = new THREE.Mesh(new THREE.CylinderGeometry(1.0, .2, hC, 40, 1, true), new THREE.MeshBasicMaterial({ map: tex(toile(8, 128, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(.5, "rgba(220,235,255,.45)"); g.addColorStop(1, "rgba(255,255,255,.95)"); x.fillStyle = g; x.fillRect(0, 0, w, h); })), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  cone.position.set(arr.x, hC / 2 + .12, arr.z); cone.visible = false; cone.renderOrder = 9; M.scene.add(cone);   // (dessiné après le slime et les brûlures : la lumière les voile)
  const filMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1c, roughness: .6 }); let fil = null;
  const majFil = () => { const a0 = P.g.localToWorld(new THREE.Vector3(-.22, .05, 0)), b = new THREE.Vector3(moi.g.position.x + .28, tailleBonhomme() * .44, moi.g.position.z - .12), pts = [a0];   // (le long fil, du piège jusqu'à notre pédale, qui traîne au sol)
    for (let k = 1; k < 8; k++) { const u = k / 8; pts.push(new THREE.Vector3(a0.x + (b.x - a0.x) * u + Math.sin(u * 9) * .12, Math.max(.015, a0.y * (1 - u) + b.y * u - Math.sin(Math.PI * u) * 1.6), a0.z + (b.z - a0.z) * u)); }
    pts.push(b); if (fil) { M.scene.remove(fil); fil.geometry.dispose(); } fil = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, .013, 6), filMat); M.scene.add(fil); }; const lum = new THREE.PointLight(0xdfeaff, 0, 9, 1.5); lum.position.set(arr.x, .5, arr.z); M.scene.add(lum);
  const f0 = S.fige.clone(); let clk = 0, prec = performance.now(), dits = 0, fini = false; sonBruit(.3, 900, .2);
  const fin = () => { if (fini) return; fini = true; voile("background:#fff;opacity:0;transition:opacity .9s", 2600).getBoundingClientRect();
    const L0 = M.L; setTimeout(() => { if (!M || M.L !== L0) return; finCine(); finCombatGB(); M.gbCapture = true; M.gbGare = true; M.gbActe = 2; changerLieu("gb-cour", [GARE_GB[0] - 3.4, GARE_GB[1] - .2], -Math.PI / 2); }, 1000); };   // (la suite : retour dans la cour, toujours sans voitures)
  M.passerBtn = boutonPasser(fin);
  M.cine = { maj: now => { if (fini) return; clk += Math.min(50, Math.max(0, now - prec)) / 1000 * (M.vite || 1); prec = now; const t = clk;
    // le lancer : une parabole, en tournoyant, puis il glisse et s'arrête sous lui
    if (t < 1.1) { const u = t / 1.1; P.g.position.lerpVectors(dep, arr, u); P.g.position.y = dep.y * (1 - u) + 1.6 * Math.sin(Math.PI * u); P.g.rotation.y = u * 9; P.g.rotation.x = u * 4; }
    else { P.g.position.copy(arr); P.g.rotation.set(0, P.g.rotation.y, 0); if (!dits) { dits = 1; sonBruit(.2, 600, .3); } }
    majFil();
    // il s'ouvre, le cône de lumière, l'aspiration
    const ouv = t < 1.4 ? 0 : t < 1.8 ? (t - 1.4) / .4 : t < 4.6 ? 1 : t < 5.0 ? 1 - (t - 4.6) / .4 : 0;
    for (const v of P.volets) v.piv.rotation.x = v.s * ouv * 1.9;
    cone.visible = t > 1.7 && t < 4.7; cone.material.opacity = .75 + Math.random() * .25; cone.scale.set(1 + Math.random() * .05, 1, 1 + Math.random() * .05); lum.intensity = cone.visible ? 14 + Math.random() * 6 : 0;
    if (t > 1.9 && dits === 1) { dits = 2; sonBruit(2.6, 3200, .18); bulle(`<b style="color:#b5573c">Egon</b> : N'y regardez pas ! Ne regardez pas la lumière !`, 2800); }
    if (t > 2.0 && t < 4.4) { const u = lisse((t - 2.0) / 2.4); S.capt = u; S.fige.set(arr.x + (f0.x - arr.x) * (1 - u), .15 + (f0.y - .15) * (1 - u), arr.z + (f0.z - arr.z) * (1 - u)); S.sp.material.rotation = u * 9; }
    if (t > 4.4) { S.capFin = true; S.sp.visible = false; S.lum.intensity = 0; }
    if (t > 5.0 && dits === 2) { dits = 3; sonBruit(.3, 500, .4); P.voy.material.emissiveIntensity = 3;
      bulle(`<b style="color:#b5573c">Venkman</b> : On l'a eu ! Le Président pourra passer à table… enfin, s'il reste quelque chose.`, 4600); }
    if (dits >= 3) P.voy.material.emissiveIntensity = Math.floor(now / 300) % 2 ? 3 : .2;   // (le voyant rouge clignote : il est dedans)
    /* un petit filet de fumée sort du piège refermé : il monte en ondulant et se dissipe */
    if (dits >= 3 && t > (P.filetT || 0)) { P.filetT = t + .1; const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: fumeeTex(), transparent: true, depthWrite: false, opacity: 0 })); sp.position.set(arr.x, .2, arr.z); M.scene.add(sp); (P.filet = P.filet || []).push({ sp, t0: t, ph: Math.random() * 6 }); }
    for (const f of P.filet || []) { const a = (t - f.t0) / 2.6; if (a >= 1) { f.sp.visible = false; continue; } f.sp.position.set(arr.x + Math.sin(a * 5 + f.ph * .3) * .06 * a * 3, .2 + a * 1.5, arr.z + Math.cos(a * 4) * .03);
      f.sp.scale.setScalar(.08 + a * .32); f.sp.material.opacity = Math.min(1, a * 6) * (1 - a) * .7; }
    if (t > 10) fin();
    // la caméra : de côté, sur le piège et lui
    const yv = t < 1.1 ? 1.2 : 1.0; M.camera.position.set(arr.x + 2.6, 2.1, arr.z + 3.6); M.camera.lookAt(arr.x, yv, arr.z); } }; }
// dans la cour, une fois Bouffe-tout capturé : les quatre restent là, près de l'Ecto-1
function garerGB() { const L = M.L, E = L.ecto1; if (!E) return; E.visible = !!M.gbGare; if (!M.gbGare || L.gbGareFait) return; L.gbGareFait = true;
  E.position.set(GARE_GB[0], 0, GARE_GB[1]); E.rotation.y = Math.PI / 2;
  obstacleEcto(L);
  if (M.gbCapture) { if (M.gbScene) for (const p of M.gbScene.persos) M.scene.remove(p.g);
    const pl = [[-.5, .6], [-.6, 1.8], [-.5, 4.2], [-.7, 5.4]]; M.gbScene = { L, persos: GB.map(([c, n], k) => creerGB(c, n, pl[k][0], pl[k][1])) }; } }

/* ----- la fin : retour dans la cour (sans les voitures garées) ; on se remercie, le chef de poste se lamente sur les dégâts… puis le ciel devient vert,
   des pas de géant font trembler la cour, la façade du bâtiment du fond éclate, et le Bibendum Chamallow surgit, haut comme l'immeuble.
   Tout le monde en ligne devant l'Ecto-1 : on tire à son signal ; lui nous lance des blocs de pierre. Sa jauge vide, il explose : de la guimauve partout. FIN ----- */
const SP_Z = -14, SP_H = 24, PV_SP = 290, LIGNE_SP = -1.9;
const texSP = {};
function texSPi(n) { if (!texSP[n]) { const t = texSP[n] = new THREE.TextureLoader().load(`images/gb/${n}.webp`, () => { try { M && M.rendu && M.rendu.initTexture(t); } catch (e) {} }); t.colorSpace = THREE.SRGBColorSpace; } return texSP[n]; }
// le ciel vert, en tourbillon, au-dessus de la cour (u : de 0 à 1, la bascule)
function cielVertGB(u, dt = 0) { const sc = M.scene; let G = M.L.gbCiel;
  if (!G) { const geo = new THREE.SphereGeometry(150, 72, 28, 0, Math.PI * 2, 0, Math.PI / 2), pos = geo.attributes.position, uv = geo.attributes.uv;
    for (let k = 0; k < pos.count; k++) { const x = pos.getX(k), y = pos.getY(k), z = pos.getZ(k), el = Math.asin(Math.max(-1, Math.min(1, y / 150))) / (Math.PI / 2);   // (u : le tour de l'horizon ; v : du bas du ciel au zénith)
      uv.setXY(k, (Math.atan2(z, x) / (Math.PI * 2) + 1) % 1, Math.min(1, el * 1.05)); }
    const t = texSPi("ciel-dome"); t.wrapS = THREE.RepeatWrapping; t.repeat.x = 2;
    const dome = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: t, side: THREE.BackSide, transparent: true, opacity: 0, fog: false, depthWrite: false })); dome.position.y = -6; dome.renderOrder = -1; sc.add(dome);
    const hemi = sc.children.find(o => o.isHemisphereLight), sol = sc.children.find(o => o.isDirectionalLight), vert = new THREE.AmbientLight(0x6dff7a, 0); sc.add(vert);
    G = M.L.gbCiel = { dome, vert, hemi, sol, hC: hemi && hemi.color.clone(), solI: sol ? sol.intensity : 0, fog0: sc.fog ? sc.fog.color.clone() : null, bg0: sc.background, fond: new THREE.Color(0x0e3315) }; }
  G.u = u; G.dome.material.opacity = Math.min(1, u * 1.2); G.dome.rotation.y += dt * .04; G.vert.intensity = .45 * u;   // (il tourne, lentement, comme un tourbillon)
  if (u > .3) { if (sc.background !== G.fond) sc.background = G.fond; } else if (G.bg0 && sc.background !== G.bg0) sc.background = G.bg0;
  if (sc.fog && G.fog0) sc.fog.color.copy(G.fog0).lerp(new THREE.Color(0x1d5a24), u);
  if (G.hemi) G.hemi.color.copy(G.hC).lerp(new THREE.Color(0xa8ffb0), u * .7);
  if (G.sol) G.sol.intensity = G.solI * (1 - .55 * u); }
// la façade éclatée : un grand trou aux bords déchiquetés, des blocs de brique qui volent, la poussière
function trouFacadeGB() { const c = toile(512, 512, (x) => { x.translate(256, 256); const pts = []; for (let k = 0; k < 26; k++) { const a = k / 26 * Math.PI * 2, r = 170 + Math.random() * 70; pts.push([Math.cos(a) * r, Math.sin(a) * r * .9]); }
    x.fillStyle = "#6e3022"; x.beginPath(); pts.forEach(([a, b], i) => x[i ? "lineTo" : "moveTo"](a * 1.08, b * 1.08)); x.closePath(); x.fill();   // (l'auréole de briques arrachées)
    const g = x.createRadialGradient(0, 0, 10, 0, 0, 230); g.addColorStop(0, "#020101"); g.addColorStop(.7, "#140b08"); g.addColorStop(1, "#2a1610"); x.fillStyle = g;
    x.beginPath(); pts.forEach(([a, b], i) => x[i ? "lineTo" : "moveTo"](a, b)); x.closePath(); x.fill();
    x.fillStyle = "#8e3b2a"; for (let k = 0; k < 60; k++) { const [a, b] = pts[k % pts.length], f = .95 + Math.random() * .18; x.fillRect(a * f - 8, b * f - 4, 16 + Math.random() * 10, 8); } });
  const o = new THREE.Mesh(new THREE.PlaneGeometry(17, 15), new THREE.MeshStandardMaterial({ map: tex(c), transparent: true, depthWrite: false, roughness: 1, polygonOffset: true, polygonOffsetFactor: -4 }));
  o.position.set(0, 15.5, -17.92); M.scene.add(o);
  const v = new THREE.Vector3(), dans = q => { q.getWorldPosition(v); if (!(Math.abs(v.x) < 8.4 && v.y > 8.6 && v.y < 22.6 && v.z > -18.4 && v.z < -16.8)) return false; const g = q.geometry; if (g && !g.boundingSphere) g.computeBoundingSphere(); return !g || g.boundingSphere.radius < 3; };
  const ote = []; M.scene.traverse(q => { if ((q.isMesh || q.isSprite) && q !== o && dans(q)) ote.push(q); }); for (const q of ote) { q.visible = false; if (q.parent) q.parent.remove(q); }   // (les fenêtres, balcons et silhouettes qui étaient là : partis avec le mur)
  return o; }
let matsGravat = null;
function matGravat() { if (matsGravat) return matsGravat;
  const brique = tex(toile(128, 128, (x) => { x.fillStyle = "#a89e8e"; x.fillRect(0, 0, 128, 128); for (let r = 0; r < 8; r++) for (let c = -1; c < 6; c++) { const o = (r % 2) * 13; x.fillStyle = `rgb(${120 + Math.random() * 45},${44 + Math.random() * 22},${30 + Math.random() * 14})`; x.fillRect(c * 26 + o + 1, r * 16 + 1, 24, 14); }
    x.fillStyle = "rgba(0,0,0,.18)"; for (let k = 0; k < 260; k++) x.fillRect(Math.random() * 128, Math.random() * 128, 2, 2); }));
  const pierre = tex(toile(128, 128, (x) => { x.fillStyle = "#cdc4b0"; x.fillRect(0, 0, 128, 128); for (let k = 0; k < 500; k++) { const v = Math.random() < .5 ? 90 : 245; x.fillStyle = `rgba(${v},${v - 4},${v - 10},.16)`; x.fillRect(Math.random() * 128, Math.random() * 128, 3, 3); }
    x.strokeStyle = "rgba(60,50,40,.35)"; x.lineWidth = 1.5; for (let k = 0; k < 6; k++) { x.beginPath(); x.moveTo(Math.random() * 128, Math.random() * 128); x.lineTo(Math.random() * 128, Math.random() * 128); x.stroke(); } }));
  return (matsGravat = [new THREE.MeshStandardMaterial({ map: brique, roughness: .95, flatShading: true }), new THREE.MeshStandardMaterial({ map: pierre, roughness: .95, flatShading: true })]); }
function gravatGeo(s) { const g = new THREE.IcosahedronGeometry(1, 1), p = g.attributes.position, sx = .7 + Math.random() * .8, sy = .45 + Math.random() * .5, sz = .6 + Math.random() * .7, memo = {};
  for (let i = 0; i < p.count; i++) { const cle = p.getX(i).toFixed(3) + "," + p.getY(i).toFixed(3) + "," + p.getZ(i).toFixed(3), f = memo[cle] || (memo[cle] = .62 + Math.random() * .6); p.setXYZ(i, p.getX(i) * f * sx * s, p.getY(i) * f * sy * s, p.getZ(i) * f * sz * s); }
  g.computeVertexNormals(); return g; }   // (un bloc cassé : des faces brisées, irrégulières)
function gravatGB(s) { const [brique, pierre] = matGravat(), r = Math.random(); let o;
  if (r < .3) { o = new THREE.Mesh(new THREE.BoxGeometry(s * 1.4, s * .55, s * .45), brique); o.geometry.attributes.position.array.forEach((v, i, a) => { a[i] = v * (.88 + Math.random() * .24); }); o.geometry.computeVertexNormals(); }   // (un pan de mur, encore maçonné)
  else o = new THREE.Mesh(gravatGeo(s * .55), r < .75 ? brique : pierre);
  o.castShadow = true; o.receiveShadow = true; return o; }
function eclatsGB(F) {
  for (let k = 0; k < 52; k++) { const s = .35 + Math.random() * 1.1, o = gravatGB(s);
    o.position.set((Math.random() - .5) * 13, 9 + Math.random() * 13, -17.6); M.scene.add(o);
    F.eclats.push({ o, v: new THREE.Vector3((Math.random() - .5) * 7, Math.random() * 4, 3 + Math.random() * 7), w: new THREE.Vector3(Math.random() * 6, Math.random() * 6, Math.random() * 6), s }); }
  for (let k = 0; k < 14; k++) poussiereGB(F, new THREE.Vector3((Math.random() - .5) * 14, 8 + Math.random() * 14, -16.5), 4 + Math.random() * 5);
  for (const x of [-6, 0, 6]) brumeSH(new THREE.Vector3(x, 0, -14), 6000); }
function poussiereGB(F, P, taille, couleur = 0x9a8f86) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: lueurGB(), color: couleur, transparent: true, depthWrite: false, opacity: .8 })); sp.position.copy(P); sp.scale.setScalar(taille * .4); M.scene.add(sp);
  F.puffs.push({ sp, t: 0, vie: 3 + Math.random() * 2, s: taille }); }
function animerEclatsGB(F, dt) {
  for (const e of F.eclats) { if (!e.v) continue; e.v.y -= 9.8 * dt; e.o.position.addScaledVector(e.v, dt); e.o.rotation.x += e.w.x * dt; e.o.rotation.y += e.w.y * dt;
    if (e.o.position.y < e.s * .25) { e.o.position.y = e.s * .25; if (e.v.y < -3) { e.v.y *= -.25; e.v.x *= .5; e.v.z *= .5; e.w.multiplyScalar(.5); } else e.v = null; } }
  for (let k = F.puffs.length - 1; k >= 0; k--) { const p = F.puffs[k]; p.t += dt; const u = p.t / p.vie; if (u >= 1) { M.scene.remove(p.sp); F.puffs.splice(k, 1); continue; }
    p.sp.scale.setScalar(p.s * (.4 + u * 1.2)); p.sp.material.opacity = .8 * (1 - u); p.sp.position.y += dt * .6; } }
// le Bibendum : un grand panneau découpé, de face, de dos ou de profil selon où il va
function creerSPGB() { const geo = new THREE.PlaneGeometry(1, 1); geo.translate(0, .5, 0);   // (toujours de face)
  const tf = texSPi("staypuft-face"), mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: tf, emissive: 0xffffff, emissiveMap: tf, emissiveIntensity: .5, transparent: true, alphaTest: .4, side: THREE.DoubleSide, roughness: .7 }));
  mesh.scale.set(SP_H * .76, SP_H, 1); M.scene.add(mesh); return { mesh, x: 0, z: -17.4, vx: 0, vue: "face" }; }
function majSPGB(B, now) { const cam = M.camera.position, m = B.mesh; m.position.set(B.x, Math.abs(Math.sin(now / 600)) * .25 * (B.marche ? 1 : 0), B.z); m.rotation.y = Math.atan2(cam.x - B.x, cam.z - B.z);
  const vue = "face"; if (vue !== B.vue) { B.vue = vue; const t = texSPi("staypuft-" + vue); m.material.map = t; m.material.emissiveMap = t; }
  const im = m.material.map.image; if (im && im.width) m.scale.set(SP_H * im.width / im.height, SP_H, 1); m.rotation.z = B.marche ? Math.sin(now / 600) * .02 : 0; }
function cineFinaleGB() { const moi = M.gens.get(M.moiNum), E = M.L.ecto1; if (!moi || !E || M.cine) return; M.L.gbIntro = true; M.gbChef = true; M.cineSeul = CHEF_GB;
  const F = M.gbFinale = { L: M.L, eclats: [], puffs: [], secousse: 0, ciel: 0 }; musiqueGB(true, "gb-midnight");   // (la musique de la discussion, avant le géant)
  E.visible = true; E.position.set(GARE_GB[0], 0, GARE_GB[1]); E.rotation.y = Math.PI / 2; obstacleEcto(M.L);
  moi.cible = null; moi.chemin = []; const mp = moi.g.position.clone(); moi.info.gbDos = false;
  if (M.gbScene) for (const p of M.gbScene.persos) M.scene.remove(p.g);
  const pl = [[mp.x - 1.6, mp.z - 2.0], [mp.x - .5, mp.z - 2.4], [mp.x + .6, mp.z - 2.3], [mp.x + 1.5, mp.z - 1.6]];
  const S = M.gbScene = { L: M.L, persos: GB.map(([c, n], k) => creerGB(c, n, pl[k][0], pl[k][1])) }, [EG, RA, VE, WI] = S.persos; let chef = null;
  const etapes = []; let t = 900; const a = (f, apres = 0) => { etapes.push([t, f]); t += apres; };
  const ligne = (p, txt) => a(() => { F.parle = p; bulle(`<b style="color:#b5573c">${esc(p.nom)}</b> : ${esc(txt)}`, dureeLigne(txt)); }, dureeLigne(txt) + 300);
  const chefDit = txt => a(() => { if (chef) { F.parle = chef; dire(CHEF_GB, txt); } }, dureeLigne(txt) + 300);
  // le chef de poste revient, et l'on se remercie
  a(() => { const P = (M.ctx.pnj && M.ctx.pnj()) || {}, d0 = viserLibre(mp.x - 6, mp.z + 6);
    chef = ajouterAncien({ numero: CHEF_GB, nom: P.nom || "Le chef de poste", tenue: P.tenue || "garde", couleur: P.couleur || "#1c2541", bas: P.bas, pieds: P.pieds, reglage: P.reglage || null, teteUrl: P.tete_v ? M.ctx.urlTetePNJ(P.tete_v) : "images/pere-tete.png", pnj: true, x: d0[0], z: d0[1] });
    if (chef) { chef.rapide = true; const v = viserLibre(mp.x - 2.4, mp.z - .4); viser(chef, v[0], v[1]); } });
  ligne(RA, "On l'a eu ! Il est bien au chaud dans le piège.");
  ligne(VE, "Une bonne chose de faite. On accepte les chèques, les espèces… et les remerciements, aussi.");
  chefDit("Merci… Mais vous avez vu l'état du mess ?! C'est une catastrophe ! Tout est brûlé, du slime jusqu'au plafond… et le Président qui arrive !");
  ligne(VE, "Disons que c'est… de la décoration contemporaine. Très tendance, à New York.");
  ligne(WI, "Hé… c'est moi, ou le ciel devient vert ?");
  // le ciel vire au vert ; des pas de géant ; tout le monde s'affole
  a(() => { F.parle = null; F.vise = "ciel"; F.cielT = 0; sonBruit(3, 180, .3); musiqueGB(false); }, 3600);
  for (let k = 0; k < 4; k++) a(() => { sonBruit(1.2, 85, 1); sonBruit(.5, 300, .5); F.secousse = 1; for (const p of S.persos) { p.vit = 3.4; p.cible = viserLibre(p.x + (Math.random() - .5) * 2.4, p.z + (Math.random() - .5) * 2.4); } if (chef && k % 2) { const v = viserLibre(chef.g.position.x + (Math.random() - .5) * 3, chef.g.position.z + (Math.random() - .5) * 3); viser(chef, v[0], v[1]); } }, 1300);
  a(() => bulle(`<b style="color:#b5573c">Egon</b> : Les relevés explosent ! Quelque chose d'énorme approche !`, 3000), 1300);
  a(() => { sonBruit(1.2, 85, 1); F.secousse = 1; if (chef) dire(CHEF_GB, "Qu'est-ce que c'est que ça ?!"); }, 1600);
  // la façade du fond éclate
  a(() => { F.vise = "facade"; F.trou = trouFacadeGB(); eclatsGB(F); sonBruit(2.4, 160, 1); sonBruit(1.2, 700, .7); F.secousse = 1.6; }, 2600);
  a(() => { F.sp = creerSPGB(); F.sp.marche = true; F.vise = "sp"; rugirSP(1.3); }, 0);
  for (let k = 0; k < 4; k++) a(() => { sonBruit(1.2, 80, 1); F.secousse = 1.2; }, 1100);
  a(() => { F.sp.marche = false; F.parle = RA; bulle(`<b style="color:#b5573c">Ray</b> : Oh non… J'ai essayé de penser à la chose la plus inoffensive qui soit… un souvenir d'enfance… le Bibendum Chamallow !`, 6200); }, 6400);
  a(() => { F.parle = VE; bulle(`<b style="color:#b5573c">Venkman</b> : Bravo, Ray. Bon : tout le monde devant la voiture, en ligne ! Personne ne tire avant mon signal !`, 5000);
    const xs = [GARE_GB[0] - 3.2, GARE_GB[0] - 1.6, GARE_GB[0] + 1.6, GARE_GB[0] + 3.2]; S.persos.forEach((p, k) => { p.vit = 2.6; p.cible = [xs[k], LIGNE_SP]; p.regard = [xs[k], -30]; }); }, 3800);
  let i = 0, fini = false, clk = 0, prec = performance.now(); const vise = new THREE.Vector3(mp.x - .5, 1.2, mp.z - 2.2), camP = new THREE.Vector3(mp.x - 2.6, 1.9, mp.z + 1.6);
  const finir = () => { if (fini) return; fini = true; M.cineSeul = null; combatSPGB(); };
  M.passerBtn = boutonPasser(() => { cielVertGB(1); F.cielT = 9; if (!F.trou) { F.trou = trouFacadeGB(); eclatsGB(F); } if (!F.sp) F.sp = creerSPGB(); F.sp.marche = false; finir(); });
  M.cine = { maj: now => { if (fini) return; const d = Math.min(50, Math.max(0, now - prec)); clk += d * (M.vite || 1); prec = now; const dt = d / 1000;
    while (i < etapes.length && clk >= etapes[i][0]) { etapes[i][1](); i++; } if (i >= etapes.length) { finir(); return; }
    gyroEcto(E, true, now); if (F.cielT != null) { F.cielT += dt; cielVertGB(Math.min(1, F.cielT / 3), dt); }
    if (F.sp) { if (F.sp.marche) F.sp.z = Math.min(SP_Z, F.sp.z + dt * .95); majSPGB(F.sp, now); }
    animerEclatsGB(F, dt); F.secousse = Math.max(0, F.secousse - dt * 1.6);
    // la caméra : sur le groupe ; puis le ciel ; puis la façade et le géant, en contre-plongée
    let cp, cv; const q = F.parle && F.parle.g ? F.parle.g.position : null;
    if (F.vise === "sp" || F.vise === "facade") { cp = new THREE.Vector3(mp.x + 1.2, 1.4, mp.z + 3.2); cv = new THREE.Vector3(0, F.vise === "sp" ? 13 : 15, -16); }
    else if (F.vise === "ciel") { cp = new THREE.Vector3(mp.x + .6, 1.6, mp.z + 2.6); cv = new THREE.Vector3(mp.x - 2, 22, mp.z - 12); }
    else { cp = new THREE.Vector3(mp.x - 2.6, 1.9, mp.z + 1.6); cv = q ? new THREE.Vector3(q.x, 1.3, q.z) : new THREE.Vector3(mp.x - .3, 1.2, mp.z - 1.6); }   // (de côté : notre bonhomme ne cache plus le groupe)
    const k = 1 - Math.exp(-dt * 1.4); camP.lerp(cp, k); vise.lerp(cv, k); M.camera.position.copy(camP);
    if (F.secousse > 0) M.camera.position.add(new THREE.Vector3((Math.random() - .5), (Math.random() - .5), (Math.random() - .5)).multiplyScalar(.35 * F.secousse));
    M.camera.lookAt(vise); } }; }
// le combat contre le Bibendum, devant l'Ecto-1
function combatSPGB() { const F = M.gbFinale, moi = M.gens.get(M.moiNum); if (!F || !moi) return; finCine();
  if (M.gbCombat) finCombatGB();
  const C = M.gbCombat = { L: M.L, sp: true, nom: "BIBENDUM CHAMALLOW", pvMax: PV_SP, vies: 4, pv: PV_SP, rayons: new Map(), brulures: [], cailloux: [], t: 0, jet: 4, ordre: 3.2, fini: false };
  const xs = [GARE_GB[0] - 3.2, GARE_GB[0] - 1.6, GARE_GB[0] + 1.6, GARE_GB[0] + 3.2];
  M.gbScene.persos.forEach((p, k) => { p.x = xs[k]; p.z = LIGNE_SP; p.cible = null; p.regard = [xs[k], -30]; p.tirT = Math.random(); });
  moi.g.position.set(GARE_GB[0], 0, LIGNE_SP); moi.cible = null; moi.chemin = []; envoyerWS({ t: "aller", x: GARE_GB[0], z: LIGNE_SP });
  Object.assign(moi.info, { tenue: "ghostbuster", couleur: "#c9b98f", bas: "#c9b98f", pieds: "#2a2522", gbDos: true }); dessinerCorps(moi);
  if (F.sp) { F.sp.z = SP_Z; F.sp.marche = false; }
  if (M.gbChef) { setTimeout(() => { if (M && M.gens.get(CHEF_GB)) retirerAncien(CHEF_GB); if (M) M.gbChef = false; }, 200); }
  hudGB(C); musiqueGB(true, "gb-geant");   // (la musique du combat contre le géant)
  const vise = new THREE.Vector3(GARE_GB[0], 9, SP_Z);
  M.cine = { gb: false, fov: [66, 84], maj: now => { if (C.camFin) { M.camera.position.copy(C.camFin.pos); M.camera.lookAt(C.camFin.vise); return; } const cp = new THREE.Vector3(GARE_GB[0], 2.8, LIGNE_SP + 7); if (F.secousse > 0) cp.add(new THREE.Vector3(Math.random() - .5, Math.random() - .5, 0).multiplyScalar(.3 * F.secousse));
    M.camera.position.copy(cp); vise.set(F.sp ? F.sp.x * .5 + GARE_GB[0] * .5 : GARE_GB[0], 7.4, SP_Z); M.camera.lookAt(vise); } }; }
// sur le Bibendum : là où les faisceaux le touchent, il brûle (des taches noires, des flammes) et sa guimauve fond, en coulures blanches qui descendent
let texGouttes = null;
const gouttesTex = () => texGouttes || (texGouttes = tex(toile(32, 96, (x) => { const g = x.createLinearGradient(0, 0, 32, 0); g.addColorStop(0, "#d8d3c6"); g.addColorStop(.45, "#ffffff"); g.addColorStop(1, "#cfc9bb"); x.fillStyle = g;
  x.beginPath(); x.moveTo(6, 0); x.lineTo(26, 0); x.quadraticCurveTo(22, 40, 23, 70); x.arc(16, 78, 10, 0, Math.PI); x.quadraticCurveTo(10, 40, 6, 0); x.fill(); })));
function brulerSP(C, B, P, cle, now) { C.spT = C.spT || {}; if (C.spT[cle] && now - C.spT[cle] < 80) return; C.spT[cle] = now;
  const m = B.mesh, sx = m.scale.x, sy = m.scale.y, lx = (P.x - B.x) / sx, ly = P.y / sy, ici = new THREE.Vector2(P.x - B.x, P.y); C.spBr = C.spBr || [];
  if (C.spBr.some(o => o.userData.l.distanceTo(ici) < .55)) return;
  const t = .9 + Math.random() * .9, o = new THREE.Mesh(new THREE.PlaneGeometry(t / sx, t * (.7 + Math.random() * .4) / sy), new THREE.MeshStandardMaterial({ map: brulureTex(), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, roughness: 1 }));
  o.position.set(lx, ly, .03); o.userData.l = ici; o.renderOrder = 3; m.add(o); C.spBr.push(o); if (C.spBr.length > 80) m.remove(C.spBr.shift());
  if (Math.random() < .35 && (C.spFeu = C.spFeu || []).length < 16) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: feuImages()[0], blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); sp.center.set(.5, .05); sp.position.set(lx, ly, .06); sp.renderOrder = 6; m.add(sp); C.spFeu.push({ sp, t: 0, vie: 6 + Math.random() * 5, s: 1.3 + Math.random() * 1.1, ph: Math.random() * 8 }); }
  if ((C.spFond = C.spFond || []).length < 44) for (let k = 0; k < 2; k++) { const d = new THREE.Mesh(new THREE.PlaneGeometry(.26 / sx, .8 / sy), new THREE.MeshStandardMaterial({ map: gouttesTex(), alphaTest: .4, emissive: 0xffffff, emissiveMap: gouttesTex(), emissiveIntensity: .3, roughness: .4 }));
    d.geometry.translate(0, -.4 / sy, 0); d.position.set(lx + (Math.random() - .5) * .5 / sx, ly - .15 / sy, .05); d.renderOrder = 4; m.add(d); C.spFond.push({ d, t: 0, v: (.18 + Math.random() * .3) / sy }); } }
function animerSPDeco(C, B, dt, now) { const m = B.mesh, sx = m.scale.x, sy = m.scale.y, im = feuImages();
  for (let k = (C.spFeu || []).length - 1; k >= 0; k--) { const f = C.spFeu[k]; f.t += dt; if (f.t >= f.vie) { m.remove(f.sp); C.spFeu.splice(k, 1); continue; } const k2 = Math.max(0, Math.min(1, (f.vie - f.t) / 2)) * Math.min(1, f.t / .4);
    f.sp.material.map = im[Math.floor(now / 65 + f.ph) % im.length]; f.sp.scale.set(f.s * .8 * k2 / sx, f.s * 1.6 * k2 * (1 + .1 * Math.sin(now / 90 + f.ph)) / sy, 1); f.sp.material.opacity = k2; }
  for (let k = (C.spFond || []).length - 1; k >= 0; k--) { const f = C.spFond[k]; f.t += dt; if (f.t > 6) { m.remove(f.d); C.spFond.splice(k, 1); continue; }   // (la guimauve qui fond : elle coule, s'allonge, puis tombe)
    f.d.position.y -= f.v * dt; f.d.scale.y = 1 + f.t * .35; if (f.t > 5) f.d.material.opacity = 6 - f.t, f.d.material.transparent = true; } }
function rocherGB(C, B, cibleP, verMoi, p) { const o = gravatGB(.75 + Math.random() * .45);   // (un bloc de maçonnerie arraché à la façade)
  const dep = new THREE.Vector3(B.x + (Math.random() < .5 ? -1 : 1) * 7.5, 13, B.z + 1.5); o.position.copy(dep); M.scene.add(o);
  C.cailloux.push({ o, dep, arr: cibleP.clone(), u: 0, dur: 1.6 + Math.random() * .4, moi: verMoi, p }); sonBruit(.3, 400, .3); if (Math.random() < .55) rugirSP(.9); }
function animerCombatSP(dt, now) { const C = M.gbCombat, F = M.gbFinale; if (!C || !C.sp || !F) return; if (C.L !== M.L) { finCombatGB(); return; } const moi = M.gens.get(M.moiNum), B = F.sp; if (!moi || !B) return; C.t += dt;
  gyroEcto(M.L.ecto1, true, now); cielVertGB(C.boum ? Math.max(0, 1 - C.boum.t / 4) : 1, dt); animerEclatsGB(F, dt);   /* (après l'explosion, le ciel redevient normal) */ animerFlammes(C, dt, now); F.secousse = Math.max(0, F.secousse - dt * 1.6);
  if (!C.fini) { B.vx = Math.cos(C.t * .35) * 1.4; B.x = Math.sin(C.t * .35) * 4; } else B.vx = 0; B.marche = !C.fini; majSPGB(B, now); animerSPDeco(C, B, dt, now);
  if (!C.boum) { C.rugT = (C.rugT == null ? 5 : C.rugT) - dt; if (C.rugT <= 0) { C.rugT = 6 + Math.random() * 6; rugirSP(); } }
  if (C.boum || C.ordre > 0) sonEffluves(0);
  if (C.boum) { animerBoumGB(C, dt, now); return; }
  if (C.ordre > 0) { C.ordre -= dt; if (C.ordre <= 0) { M.cine.gb = true; bulle(`<b style="color:#b5573c">Venkman</b> : FEU !`, 2200); sonBruit(.3, 900, .2); } return; }
  const ray = M.gbRay || (M.gbRay = new THREE.Raycaster()); const vus = new Set(); M.gbCibleVue = new THREE.Vector3(B.x, SP_H * .5, B.z);
  // touché ? (une ellipse grosso modo à sa silhouette, dans son plan)
  const touche = (A, dir) => { if (Math.abs(dir.z) < .05) return null; const k = (B.z - A.z) / dir.z; if (k <= 0) return null; const P = A.clone().addScaledVector(dir, k); return ((P.x - B.x) / (SP_H * .3)) ** 2 + ((P.y - SP_H * .5) / (SP_H * .5)) ** 2 < 1 ? P : null; };
  const tir = (cle, A, dir, degats) => { let B2 = touche(A, dir);
    if (B2) { C.pv -= degats * dt; C.touche = true; brulerSP(C, B, B2, cle, now); } else { const k = dir.y < -.01 ? -A.y / dir.y : 40; B2 = A.clone().addScaledVector(dir, Math.min(40, k));
      if (dir.y < -.01 && k < 40 && (!C.brT || !C.brT[cle] || now - C.brT[cle] > 30)) { C.brT = C.brT || {}; C.brT[cle] = now; brulerGB(C, { point: B2.clone(), face: { normal: new THREE.Vector3(0, 1, 0) }, object: { matrixWorld: new THREE.Matrix4() } }, dir, cle); } }   // (le pavé brûlé)
    let r = C.rayons.get(cle); if (!r) { r = creerRayon(); C.rayons.set(cle, r); } majRayon(r, A, B2, now); vus.add(cle); return B2; };
  if (M.gbVisee && !C.fini) { const H = tailleBonhomme(), A = boutCanonGB() || new THREE.Vector3(moi.g.position.x + .3, H * .48, moi.g.position.z - .15);
    ray.setFromCamera(new THREE.Vector2(M.gbVisee.x, M.gbVisee.y), M.camera); const P = touche(ray.ray.origin, ray.ray.direction) || ray.ray.at(30, new THREE.Vector3());
    const dir = P.clone().sub(A).normalize(); tir("moi", A, dir, 4);
    // le faisceau détruit les blocs qu'il croise
    for (const c of C.cailloux) if (!c.mort && ray.ray.distanceToPoint(c.o.position) < .6) { c.mort = true; poussiereGB(F, c.o.position.clone(), 2.5, 0xb8aea4); sonBruit(.25, 1400, .3); M.scene.remove(c.o); }
  }
  for (const p of M.gbScene ? M.gbScene.persos : []) { if (C.fini) break; p.tirT -= dt; if (!(p.rafale > 0) && p.tirT <= 0) { p.rafale = 1.5 + Math.random() * 2; p.ecart = new THREE.Vector3((Math.random() - .5) * 8, 4 + Math.random() * 14, 0); }
    if (p.rafale > 0) { const A = new THREE.Vector3(p.x + .22, p.H * .48, p.z - .15); tir(p.cle, A, new THREE.Vector3(B.x + p.ecart.x, p.ecart.y, B.z).sub(A).normalize(), .45); p.rafale -= dt; if (p.rafale <= 0) p.tirT = 1 + Math.random() * 2.5; } }
  for (const [k, r] of C.rayons) if (!vus.has(k)) r.g.visible = false;
  sonEffluves(vus.size, C.touche); C.touche = false;
  // il lance des blocs de pierre sur nous cinq
  if (!C.fini) { C.jet -= dt; if (C.jet <= 0) { C.jet = 1.6 + Math.random() * 1.4; const k = Math.floor(Math.random() * 5), p = k < 4 ? M.gbScene.persos[k] : null, cp = p ? new THREE.Vector3(p.x, 0, p.z) : moi.g.position.clone().setY(0);
    rocherGB(C, B, cp.add(new THREE.Vector3((Math.random() - .5) * .8, 0, (Math.random() - .5) * .8)), !p, p); } }
  for (let k = C.cailloux.length - 1; k >= 0; k--) { const c = C.cailloux[k]; if (c.mort) { C.cailloux.splice(k, 1); continue; } c.u += dt / c.dur; const u = Math.min(1, c.u);
    c.o.position.lerpVectors(c.dep, c.arr, u); c.o.position.y = c.dep.y * (1 - u) + c.arr.y * u + Math.sin(Math.PI * u) * 7 + .4; c.o.rotation.x += dt * 5; c.o.rotation.z += dt * 3;
    if (u >= 1) { C.cailloux.splice(k, 1); poussiereGB(F, c.arr.clone().setY(.4), 3); sonBruit(.5, 260, .6); F.secousse = .8;
      if (c.moi && !C.fini) { C.vies--; const d = voile("background:radial-gradient(circle,rgba(0,0,0,0) 30%,rgba(160,20,10,.6));opacity:1", 900); setTimeout(() => d.remove(), 600);
        bulle(C.vies > 0 ? `<b style="color:#b5573c">Winston</b> : Attention ! Ça va, ${esc(prenomSH())} ?` : "<b>Le Bibendum vous a écrasés…</b> On se relève, et on recommence !", 3000);
        if (C.vies <= 0) setTimeout(() => { if (M && M.gbCombat === C) { C.vies = 4; C.pv = PV_SP; hudGB(C); } }, 3200); }
      else if (c.p) { c.p.choc = 1; if (Math.random() < .5) bulle(`<b style="color:#b5573c">${esc(c.p.nom)}</b> : ${esc(["Ouh là !", "C'était moins une !", "Il vise bien, le bougre !"][Math.floor(Math.random() * 3)])}`, 2200); } } }
  hudGB(C);
  if (!C.fini && C.pv <= 0) { C.pv = 0; C.fini = true; M.gbVisee = null; for (const r of C.rayons.values()) r.g.visible = false; C.boum = { t: 0, boules: [], gouttes: [], taches: [] }; rugirSP(1.5); sonBruit(3, 140, 1); sonBruit(1.5, 900, .8); F.secousse = 2; } }
// une vraie explosion : des textures de feu et de fumée turbulentes (du bruit fractal), une boule de feu qui gonfle et monte en champignon,
// une lumière orange sur toute la cour, une onde de choc au sol, des braises qui jaillissent, puis une colonne de fumée noire
let texExplo = null;
function texturesExplosion() { if (texExplo) return texExplo;
  const N = 64, grille = () => { const g = new Float32Array(N * N); for (let i = 0; i < g.length; i++) g[i] = Math.random(); return g; };
  const bruit = (g, x, y) => { const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy), v = (a, b) => g[((b % N + N) % N) * N + ((a % N + N) % N)];
    return v(xi, yi) * (1 - sx) * (1 - sy) + v(xi + 1, yi) * sx * (1 - sy) + v(xi, yi + 1) * (1 - sx) * sy + v(xi + 1, yi + 1) * sx * sy; };
  const fbm = (g, x, y) => { let s = 0, a = .5, f = 1; for (let o = 0; o < 5; o++) { s += a * bruit(g, x * f, y * f); f *= 2.03; a *= .5; } return s; };
  const fabrique = (feu) => { const T = 128, c = document.createElement("canvas"); c.width = c.height = T; const x = c.getContext("2d"), im = x.createImageData(T, T), g = grille(), g2 = grille();
    for (let j = 0; j < T; j++) for (let i = 0; i < T; i++) { const u = i / T * 2 - 1, v = j / T * 2 - 1, r = Math.hypot(u, v), w = fbm(g2, i / 22, j / 22) * 1.4;
      const n = fbm(g, i / 14 + w, j / 14 - w), bord = Math.max(0, 1 - Math.pow(r / (.62 + n * .45), 2.2)), k = (j * T + i) * 4;
      if (feu) { const h = Math.min(1, bord * (.55 + n * 1.1)); im.data[k] = 255 * Math.min(1, h * 2.2); im.data[k + 1] = 255 * Math.min(1, Math.max(0, h * 1.9 - .35)); im.data[k + 2] = 255 * Math.max(0, h * 2.6 - 1.7); im.data[k + 3] = 255 * Math.min(1, bord * 1.6) * Math.min(1, .3 + n); }
      else { const l = 30 + n * 70; im.data[k] = l; im.data[k + 1] = l * .96; im.data[k + 2] = l * .92; im.data[k + 3] = 255 * Math.min(1, bord * (.5 + n * .9)) * .9; } }
    x.putImageData(im, 0, 0); return tex(c); };
  texExplo = { feu: [0, 1, 2, 3].map(() => fabrique(true)), fumee: [0, 1, 2, 3].map(() => fabrique(false)) }; return texExplo; }
function explosionGB(X, B, dt, t) { const T = texturesExplosion(), cx = B.x, cz = B.z + 1.2, cy = SP_H * .45;
  if (!X.ex) { X.ex = { feu: [], fumee: [], braises: [] };
    X.ex.lum = new THREE.PointLight(0xffa040, 0, 90, 1.2); X.ex.lum.position.set(cx, cy, cz + 3); M.scene.add(X.ex.lum);
    const anneau = new THREE.Mesh(new THREE.RingGeometry(.8, 1.6, 64), new THREE.MeshBasicMaterial({ color: 0xffd8a0, transparent: true, opacity: .8, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));   // (l'onde de choc, au sol)
    anneau.rotation.x = -Math.PI / 2; anneau.position.set(cx, .08, cz); M.scene.add(anneau); X.ex.anneau = anneau;
    for (let k = 0; k < 70; k++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: lueurGB(), color: 0xffc070, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })), a = Math.random() * 6.28, el = Math.random() * 1.3 - .2, v = 12 + Math.random() * 22;
      sp.position.set(cx, cy, cz); sp.scale.setScalar(.5 + Math.random() * .6); M.scene.add(sp); X.ex.braises.push({ sp, v: new THREE.Vector3(Math.cos(a) * Math.cos(el) * v, Math.sin(el) * v + 6, Math.sin(a) * Math.cos(el) * v), t: 0, vie: 1.5 + Math.random() * 2 }); } }
  const E = X.ex;
  // la boule de feu : des volutes qui naissent au cœur, gonflent, montent, et virent du blanc au rouge sombre
  if (t < 1.8 && E.feu.length < 70) for (let k = 0; k < 3; k++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: T.feu[Math.floor(Math.random() * 4)], blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
    const a = Math.random() * 6.28, r = Math.random() * 4 * Math.min(1, t * 2); sp.position.set(cx + Math.cos(a) * r, cy + (Math.random() - .3) * 6, cz + Math.sin(a) * r * .4); sp.material.rotation = Math.random() * 6.28; M.scene.add(sp);
    E.feu.push({ sp, t: 0, vie: 1.6 + Math.random() * 1.6, s0: 5 + Math.random() * 6, s1: 14 + Math.random() * 12, vy: 2 + Math.random() * 5, vr: (Math.random() - .5) * .8 }); }
  for (let k = E.feu.length - 1; k >= 0; k--) { const f = E.feu[k]; f.t += dt; const u = f.t / f.vie; if (u >= 1) { M.scene.remove(f.sp); E.feu.splice(k, 1); continue; }
    f.sp.scale.setScalar(f.s0 + (f.s1 - f.s0) * (1 - Math.pow(1 - u, 2))); f.sp.position.y += f.vy * dt; f.sp.material.rotation += f.vr * dt;
    f.sp.material.color.setRGB(1, Math.max(.22, .82 - u * 1.3), Math.max(.06, .45 - u * 1.6)); f.sp.material.opacity = .55 * Math.min(1, (1 - u) * 1.6) * (u < .08 ? u / .08 : 1); }   // (moins de blanc brûlé : on voit les volutes)
  // la fumée : épaisse, noire puis grise, en champignon qui monte longtemps
  if (t > .5 && t < 6 && E.fumee.length < 90 && Math.random() < .9) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: T.fumee[Math.floor(Math.random() * 4)], depthWrite: false, transparent: true, color: 0x2a2826 }));
    const a = Math.random() * 6.28, r = Math.random() * 6; sp.position.set(cx + Math.cos(a) * r, cy + Math.random() * 6 + (t > 1.5 ? 6 : 0), cz + Math.sin(a) * r * .5 - 1); sp.material.rotation = Math.random() * 6.28; M.scene.add(sp);
    E.fumee.push({ sp, t: 0, vie: 4 + Math.random() * 4, s0: 7 + Math.random() * 6, s1: 22 + Math.random() * 16, vy: 3 + Math.random() * 4, vr: (Math.random() - .5) * .3, vx: (Math.random() - .5) * 2 }); }
  for (let k = E.fumee.length - 1; k >= 0; k--) { const f = E.fumee[k]; f.t += dt; const u = f.t / f.vie; if (u >= 1) { M.scene.remove(f.sp); E.fumee.splice(k, 1); continue; }
    f.sp.scale.setScalar(f.s0 + (f.s1 - f.s0) * Math.sqrt(u)); f.sp.position.y += f.vy * dt * (1 - u * .6); f.sp.position.x += f.vx * dt; f.sp.material.rotation += f.vr * dt;
    f.sp.material.color.setRGB(.16 + u * .3, .15 + u * .29, .14 + u * .28); f.sp.material.opacity = (u < .12 ? u / .12 : 1) * (1 - u) * .95; }
  // les braises, qui retombent
  for (let k = E.braises.length - 1; k >= 0; k--) { const b = E.braises[k]; b.t += dt; if (b.t > b.vie || b.sp.position.y < .1) { M.scene.remove(b.sp); E.braises.splice(k, 1); continue; } b.v.y -= 9.8 * dt; b.sp.position.addScaledVector(b.v, dt); b.sp.material.opacity = 1 - b.t / b.vie; }
  // la lumière, et l'onde de choc ; la cour tremble
  E.lum.intensity = t < .15 ? 400 * t / .15 : Math.max(0, 400 * Math.pow(Math.max(0, 1 - (t - .15) / 3), 2)) + (E.feu.length ? 30 * Math.random() : 0);
  if (E.anneau) { const u = t / 1.4; if (u >= 1) { M.scene.remove(E.anneau); E.anneau = null; } else { E.anneau.scale.setScalar(1 + u * 24); E.anneau.material.opacity = .85 * (1 - u); } }
  if (t < 2.5) { const F = M.gbFinale; if (F) F.secousse = Math.max(F.secousse, 2.2 * (1 - t / 2.5)); }
  if (t > 9 && E.lum.parent) M.scene.remove(E.lum); }
// il explose : une boule de feu, un éclair blanc… et il pleut de la guimauve, blanche et épaisse, sur toute la cour, les murs, la voiture et sur nous ;
// puis on se retrouve tous, couverts de guimauve, devant l'Ecto-1 ; on se parle ; FIN
let texGooSol = null;
function gooSolTex() { if (texGooSol) return texGooSol;   // (une flaque de guimauve : blanche, opaque, des bourrelets et des reflets)
  const t = texGooSol = tex(toile(256, 256, (x) => { x.translate(128, 128); const pts = []; for (let k = 0; k < 22; k++) { const a = k / 22 * Math.PI * 2, r = 70 + Math.random() * 45 + (k % 5 === 0 ? 30 : 0); pts.push([Math.cos(a) * r, Math.sin(a) * r]); }
    x.fillStyle = "#d8d3c7"; x.beginPath(); pts.forEach(([a, b], i) => x[i ? "lineTo" : "moveTo"](a, b)); x.closePath(); x.fill();
    for (let k = 0; k < 18; k++) { const cx = (Math.random() - .5) * 140, cy = (Math.random() - .5) * 140, r = 22 + Math.random() * 30, g = x.createRadialGradient(cx - r * .3, cy - r * .35, r * .1, cx, cy, r); g.addColorStop(0, "#ffffff"); g.addColorStop(.75, "#f5f2ea"); g.addColorStop(1, "rgba(225,220,208,0)"); x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); }
    x.fillStyle = "rgba(255,255,255,.9)"; for (let k = 0; k < 10; k++) { x.beginPath(); x.ellipse((Math.random() - .5) * 120, (Math.random() - .5) * 120, 6 + Math.random() * 10, 3 + Math.random() * 5, Math.random() * 3, 0, 7); x.fill(); } }));
  return t; }
const gooMat = () => new THREE.MeshStandardMaterial({ map: gooSolTex(), alphaTest: .5, roughness: .4, emissive: 0xffffff, emissiveMap: gooSolTex(), emissiveIntensity: .35, polygonOffset: true, polygonOffsetFactor: -3, side: THREE.DoubleSide });
function tacheGoo(X, P, n, taille) { const o = new THREE.Mesh(new THREE.PlaneGeometry(taille, taille * (.7 + Math.random() * .4)), gooMat()); o.position.copy(P).addScaledVector(n, .02 + Math.random() * .01); o.lookAt(P.clone().add(n)); o.rotateZ(Math.random() * 6.28); o.renderOrder = 2; M.scene.add(o); X.taches.push(o); }
// la guimauve sur un personnage : des paquets blancs et des coulures, découpés exactement sur sa silhouette
function gooToile(img) { const w = img.width, h = img.height; return toile(w, h, (x) => {
  for (let k = 0; k < 46; k++) { const cx = Math.random() * w, cy = Math.random() * h * .9, r = w * (.05 + Math.random() * .11), g = x.createRadialGradient(cx - r * .3, cy - r * .3, r * .1, cx, cy, r);
    g.addColorStop(0, "#ffffff"); g.addColorStop(.7, "#f3f0e8"); g.addColorStop(1, "#d6d1c4"); x.fillStyle = g; x.beginPath(); x.ellipse(cx, cy, r, r * (.6 + Math.random() * .5), Math.random() * 3, 0, 7); x.fill(); }
  x.fillStyle = "#f6f3ec"; for (let k = 0; k < 14; k++) { const cx = Math.random() * w, cy = Math.random() * h * .7, l = h * (.05 + Math.random() * .16), lw = w * (.025 + Math.random() * .03); x.fillRect(cx - lw / 2, cy, lw, l); x.beginPath(); x.arc(cx, cy + l, lw * .8, 0, 7); x.fill(); }
  x.globalCompositeOperation = "destination-in"; x.drawImage(img, 0, 0, w, h); }); }
function couvrirGoo(cible) {   // (un Ghostbuster : un calque collé sur son panneau ; un bonhomme : un calque qui le suit)
  if (cible.mesh) { const im = cible.mesh.material.map && cible.mesh.material.map.image; if (!im || !im.width || cible.goo) return !!cible.goo; const t = new THREE.CanvasTexture(gooToile(im)); t.colorSpace = THREE.SRGBColorSpace;
    const o = new THREE.Mesh(cible.mesh.geometry, new THREE.MeshStandardMaterial({ map: t, alphaTest: .5, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: .35, roughness: .45, side: THREE.DoubleSide })); o.position.z = .02; cible.mesh.add(o); cible.goo = o; return true; }
  const p = cible, c = p.corps, im = c && c.material.map && c.material.map.image; if (!im || !im.width) return false;
  if (p.goo) return true;
  const t = new THREE.CanvasTexture(gooToile(im)); t.colorSpace = THREE.SRGBColorSpace;   // (collé sur le corps lui-même, dessiné par-dessus : il suit ses mouvements)
  const mat = { map: t, alphaTest: .5, transparent: true, depthWrite: false }, o = c.isSprite ? new THREE.Sprite(new THREE.SpriteMaterial(mat)) : new THREE.Mesh(c.geometry, new THREE.MeshBasicMaterial(mat));
  if (!c.isSprite) o.position.z = .012; o.renderOrder = 12; c.add(o); p.goo = o; return true; }
function suivreGoo() {}
function animerBoumGB(C, dt, now) { const F = M.gbFinale, X = C.boum, B = F.sp, E = M.L.ecto1; X.t += dt; const t = X.t, moi = M.gens.get(M.moiNum);
  explosionGB(X, B, dt, t);
  if (t > .08 && !X.eclair) { X.eclair = true; const d = voile("background:radial-gradient(circle,#fffbe8 0%,#ffd890 45%,rgba(255,150,60,.7) 100%);opacity:1", 1200); let o = 1; const it = setInterval(() => { o -= .1; if (o <= 0 || !d.isConnected) { clearInterval(it); d.remove(); return; } d.style.opacity = String(o); }, 60); B.mesh.visible = false; if (C.spDeco) for (const o2 of C.spDeco) o2.visible = false; }
  // la pluie de guimauve : de gros paquets blancs qui s'écrasent partout
  if (t > .7 && t < 4.5 && X.gouttes.length < 120) for (let k = 0; k < 5; k++) { const r = .2 + Math.random() * .45, o = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x9a9a96, roughness: .5 }));
    o.position.set((Math.random() - .5) * 24, 18 + Math.random() * 16, -16 + Math.random() * 30); M.scene.add(o); X.gouttes.push({ o, r, v: -2 - Math.random() * 4 }); }
  for (let k = X.gouttes.length - 1; k >= 0; k--) { const g = X.gouttes[k]; g.v -= 9.8 * dt; g.o.position.y += g.v * dt; const p = g.o.position;
    const surVoiture = E && Math.abs(p.x - E.position.x) < 1 && Math.abs(p.z - E.position.z) < 3.1, sol = surVoiture ? 1.66 : 0;
    if (p.y <= sol) { M.scene.remove(g.o); X.gouttes.splice(k, 1); tacheGoo(X, new THREE.Vector3(p.x, sol, p.z), new THREE.Vector3(0, 1, 0), (1.4 + Math.random() * 2.2) * (g.r / .35)); } }
  // et d'un coup, toute la cour : le sol, les façades, la voiture
  if (t > 1.6 && !X.partout) { X.partout = true;
    for (let k = 0; k < 150; k++) tacheGoo(X, new THREE.Vector3((Math.random() - .5) * 24, 0, -16.5 + Math.random() * 31), new THREE.Vector3(0, 1, 0), 1.2 + Math.random() * 2.6);
    for (let k = 0; k < 60; k++) { const c = Math.floor(Math.random() * 3), y = 1 + Math.random() * 13; if (c === 0) tacheGoo(X, new THREE.Vector3((Math.random() - .5) * 30, y, -17.85), new THREE.Vector3(0, 0, 1), 1 + Math.random() * 2);
      else tacheGoo(X, new THREE.Vector3(c === 1 ? -12.35 : 12.35, Math.min(y, 6), -14 + Math.random() * 27), new THREE.Vector3(c === 1 ? 1 : -1, 0, 0), .9 + Math.random() * 1.8); }
    if (E) { for (let k = 0; k < 7; k++) tacheGoo(X, new THREE.Vector3(E.position.x + (Math.random() - .5) * 1.4, 1.7, E.position.z + (Math.random() - .5) * 5), new THREE.Vector3(0, 1, 0), .7 + Math.random() * .8);
      for (const s of [-1, 1]) for (let k = 0; k < 3; k++) tacheGoo(X, new THREE.Vector3(E.position.x + s * 1.03, .5 + Math.random() * .8, E.position.z + (Math.random() - .5) * 5), new THREE.Vector3(s, 0, 0), .6 + Math.random() * .6); } }
  if (t > 2.2 && !X.ecran) { X.ecran = true; const d = voile("background:url(images/gb/guimauve.webp) center/130% no-repeat,rgba(255,255,255,.35);opacity:.95", 3000); let op = .95; const it = setInterval(() => { op -= .03; if (op <= 0 || !d.isConnected) { clearInterval(it); d.remove(); return; } d.style.opacity = String(op); }, 80); }
  // la dernière scène : tous les six réunis devant l'Ecto-1, couverts de guimauve
  if (t > 5 && !X.reunis) { X.reunis = true; const gx = GARE_GB[0] - 3.4, gz = GARE_GB[1] - 2.2;
    M.gbScene.persos.forEach((p, k) => { p.x = gx + [-1.7, -.8, 1.0, 1.9][k]; p.z = gz + [.3, -.2, -.2, .3][k]; p.cible = null; p.regard = [gx + .2, gz - 6]; p.choc = 0; });
    if (moi) { moi.info.gbDos = false; moi.g.position.set(gx + .1, 0, gz - .4); moi.cible = null; moi.chemin = []; }
    const P = (M.ctx.pnj && M.ctx.pnj()) || {}; if (!M.gens.has(CHEF_GB)) { M.gbChef = true; X.chef = ajouterAncien({ numero: CHEF_GB, nom: P.nom || "Le chef de poste", tenue: P.tenue || "garde", couleur: P.couleur || "#1c2541", bas: P.bas, pieds: P.pieds, reglage: P.reglage || null, teteUrl: P.tete_v ? M.ctx.urlTetePNJ(P.tete_v) : "images/pere-tete.png", pnj: true, x: gx - 2.8, z: gz + .6 }); }
    C.camFin = { pos: new THREE.Vector3(gx + .2, 1.75, gz - 5.2), vise: new THREE.Vector3(gx + .1, 1.15, gz) }; M.cine.fov = null; }
  if (X.reunis) { for (const p of M.gbScene.persos) couvrirGoo(p); for (const q of [moi, X.chef]) if (q && couvrirGoo(q)) suivreGoo(q); }
  if (t > 5.4 && !X.chanson) { X.chanson = true; musiqueGB(true, "gb-chanson"); }   // (la chanson du film, sur la dernière scène)
  const lignes = [[6.4, "Venkman", "…On l'a eu ?"], [9.6, "Ray", "On est couverts de guimauve ! De la tête aux pieds !"], [12.8, "Winston", "J'adore ce boulot. Mais là, je veux une prime."],
    [16, "chef", "Une PRIME ?! Le mess brûlé, du slime jusqu'au plafond, une façade éventrée… et maintenant de la GUIMAUVE partout !"], [21.6, "Venkman", "Voyez le bon côté : vous n'aurez plus jamais besoin d'acheter de sucre."],
    [25.2, "chef", "Le Président arrive dans CINQ MINUTES ! Vous allez me nettoyer tout ça ! TOUT DE SUITE !"], [30, "Egon", "Techniquement, la guimauve est biodégradable. Dans quatre cents ans, environ."],
    [33.6, "Ray", "Hé ! On a quand même sauvé la caserne !"], [36.8, "Venkman", "Exactement. On est venus, on a vu… et on vous envoie la facture."]];
  for (const [tt, qui, txt] of lignes) if (t > tt && !X["l" + tt]) { X["l" + tt] = true; if (qui === "chef") { if (M.gens.has(CHEF_GB)) dire(CHEF_GB, txt); } else bulle(`<b style="color:#b5573c">${qui}</b> : ${esc(txt)}`, 3400); }
  // le chef de poste, furieux, saute sur place en tapant des pieds
  const ch = M.gens.get(CHEF_GB); if (ch) { const rage = (t > 16 && t < 21.4) || (t > 25.2 && t < 29.8); ch.g.position.y = rage ? Math.abs(Math.sin(t * 9)) * .45 : 0; if (rage && Math.sin(t * 9) * Math.sin((t - dt) * 9) < 0) sonBruit(.12, 220, .25); }
  if (t > 40.5 && !X.fin) { X.fin = true; finGB(); } }
// FIN : le logo, et le mot FIN ; la plaque disparaît du sol ; retour dans la vraie cour, à côté de l'Ecto-1
function finGB() { const d = voile("background:rgba(8,8,10,.92);opacity:0;display:grid;place-items:center;align-content:center;gap:18px", 7400);
  d.innerHTML = '<img src="images/gb/titre.webp" alt="Ghostbusters" style="width:min(80%,640px);background:#fff;padding:14px 22px;border-radius:18px;box-shadow:0 6px 30px rgba(0,0,0,.6)"><div style="font:900 64px/1 Georgia,serif;color:#fff;letter-spacing:8px;text-align:center">FIN</div>';
  let u = 0; const it = setInterval(() => { u += .05; if (!d.isConnected) { clearInterval(it); return; } d.style.opacity = String(Math.min(1, u * 1.6, (7 - u * 1.4) / 1.4)); if (u * 1.4 > 7) clearInterval(it); }, 70);
  envoyerWS({ t: "plaque_fin" });
  const L0 = M.L; setTimeout(() => { if (!M || M.L !== L0) return; finCombatGB(); M.gbChef = false; M.gbFinale = null; M.gbActe = 0; M.gbCapture = false; M.gbGare = false; changerLieu("grande", [GARE_GB[0] - 3.4, GARE_GB[1] - .2], -Math.PI / 2); }, 6200); }

({ cineArriveeGB, cineFinaleGB, combatGB, garerGB, animerGB, animerSlimer, animerCombatGB, animerCombatSP, musiqueGB, titreGB, sireneGB, finCombatGB });
