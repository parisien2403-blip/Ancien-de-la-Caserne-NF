/* Silent Hill : la caserne dans la brume, les monstres, l'histoire (la radio, le réveil, le mess, la fin).
   Chargé par la matrice (matrice.js) la première fois qu'on va dans un lieu de Silent Hill, et exécuté chez elle (eval direct) :
   il se sert tel quel de tout ce qu'elle a. Ce qu'il rend (la dernière expression) : ses points d'entrée. */
/* ===================== Silent Hill =====================
   Une radio rouge traîne au sol, quelque part dans la caserne (jamais au même endroit). On la ramasse : elle grésille… une sirène… le noir.
   On se réveille allongé dans le bar du sous-sol : la même caserne, mais déserte, noyée dans un brouillard blanc, des cendres qui tombent,
   les lampes mortes ; on n'y voit qu'à la lampe torche, et la radio grésille dans la poche. Les lieux s'appellent « sh-grande », « sh-fetes »… */
const LIEUX_SH = ["rue", "grande", "fetes", "etage", "mess"];
// la radio de poche (d'après la planche : boîtier rouge, haut-parleur noir à grille chromée, cadran, voyant vert, antenne, dragonne)
// le grésillement de la radio de poche, fabriqué (un souffle filtré, des craquements)
// le grain de l'image (comme un vieux film), par-dessus la scène
// un flocon de cendre : rond et flou (et non un carré)
const CARTE_MUR = { de: [0, 26.5], dir: [0, 1] };
// la carte de la caserne : en grand, comme l'affiche ramassée ; un rond rouge là où l'on a rencontré quelqu'un
/* les noms des lieux sur la carte : chacun n'apparaît qu'une fois qu'on y est allé — [clé, texte, x, z (où l'écrire), taille, vu si… (lieu, x, z, y) ] */
function lieuxVusSH() { const moi = M && M.gens.get(M.moiNum); if (!moi || !M.L || !M.L.sh) return; M.shVus = M.shVus || new Set(); const p = moi.g.position;
  for (const [k, , , , , vu] of CARTE_NOMS) if (!M.shVus.has(k) && vu(M.lieu, p.x, p.z, p.y)) M.shVus.add(k); }
// l'onglet « Carte » : une fois la carte ramassée, à Silent Hill
/* (les boutons Carte, Lampe, Clé : empilés juste sous l'arme et les vies — sur un téléphone, à position fixe, « Carte » tombait sur les vies) */
/* les personnages de l'étape en cours, et de la suivante, chargés en avance, un à un, quand le téléphone a un moment : avant, chacun se chargeait en apparaissant (James : 2,3 Mo), et le jeu saccadait */
const SH_A_VENIR = { 0: [72, 73, 71], 1: [71, 110], 2: [110, 69], 3: [69, 73], 4: [73, 72], 5: [72, 69], 6: [72, 110], 7: [110, 111], 8: [111, 73], 9: [73, 71], 10: [73, 71], 11: [71, 69], 12: [72, 73, 110], 13: [72, 73, 69, 110] };   /* (à la fin, ils sont tous là, autour de lui) */
function prechargerPersosSH() { if (M.shPreEnCours) return; const f = (SH_A_VENIR[M.shEtape] || []).map(id => HEROS_3D[id]).find(x => x && !av3Cache[x]); if (!f) return;
  M.shPreEnCours = true; const go = () => chargerAvatar3D(f).finally(() => { if (M) M.shPreEnCours = false; }); if (window.requestIdleCallback) requestIdleCallback(go, { timeout: 3000 }); else setTimeout(go, 200); }
function placerBoutonsSH() { const c = M.ctx && M.ctx.conteneur, a = document.getElementById("mxApo"); if (!c) return; const rc = c.getBoundingClientRect();
  let y = 52; if (a && !a.hidden) { const ra = a.getBoundingClientRect(); if (ra.height) y = ra.bottom - rc.top + 8; }
  for (const el of [M.carteBtn, M.lampeBtn, M.radioBtn, M.cleEl]) { if (!el || !el.isConnected) continue; const t = Math.round(y) + "px"; if (el.style.top !== t) el.style.top = t; y += el.offsetHeight + 7; } }
// une traînée de sang (dessinée) : une longue trace tirée au sol, épaisse d'un côté, qui s'effiloche ; des gouttes, des marques de doigts
let texTraineesC = null;
function texTrainees() { return texTraineesC || (texTraineesC = tex(toile(1024, 300, (x, w, h) => {
  const coul = a => `rgba(${70 + Math.random() * 30 | 0},${4 + Math.random() * 8 | 0},${4 + Math.random() * 6 | 0},${a})`;
  for (let p = 0; p < 26; p++) { const y0 = 150 + (Math.random() - .5) * 90; x.strokeStyle = coul(.06 + Math.random() * .1); x.lineCap = "round"; x.lineWidth = 6 + Math.random() * 30;
    x.beginPath(); x.moveTo(40 + Math.random() * 60, y0); let yy = y0; for (let i = 1; i <= 12; i++) { yy += (Math.random() - .5) * 10; x.lineTo(40 + i * (w - 140) / 12 * (.75 + Math.random() * .3), yy); } x.stroke(); }
  x.globalCompositeOperation = "destination-out"; for (let k = 0; k < 180; k++) { const px = 300 + Math.random() * (w - 300), g = x.createRadialGradient(px, 150 + (Math.random() - .5) * 120, 0, px, 150, 30); g.addColorStop(0, `rgba(0,0,0,${Math.min(1, (px - 300) / (w - 300)) * .5})`); g.addColorStop(1, "rgba(0,0,0,0)"); x.fillStyle = g; x.fillRect(px - 30, 0, 60, h); }   // (elle s'efface vers la fin)
  x.globalCompositeOperation = "source-over";
  x.fillStyle = coul(.75); x.beginPath(); x.ellipse(70, 150, 60, 48, 0, 0, 7); x.fill();   // la flaque, au départ
  for (let k = 0; k < 40; k++) { x.fillStyle = coul(.5 + Math.random() * .4); x.beginPath(); x.arc(Math.random() * w, 150 + (Math.random() - .5) * 220, 1 + Math.random() * 5, 0, 7); x.fill(); }   // les gouttes
  for (const [fx, fy] of [[160, 108], [300, 190]]) for (let d = 0; d < 4; d++) { x.strokeStyle = coul(.55); x.lineWidth = 7; x.beginPath(); x.moveTo(fx, fy + d * 11); x.lineTo(fx + 70 + d * 6, fy + d * 13); x.stroke(); } }))); }   // des doigts qui ont glissé
// la lampe « Silent Light », vue de face (d'après la photo) : le boîtier vert arrondi, la grosse lentille en haut, l'inscription, l'interrupteur
const texLampeC = {};
function texLampe(on) { return texLampeC[on] || (texLampeC[on] = tex(toile(150, 360, (x, w, h) => {
  const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, "#2c4222"); g.addColorStop(.3, "#4d6e3c"); g.addColorStop(.7, "#45663a"); g.addColorStop(1, "#263a1e");
  x.fillStyle = g; x.beginPath(); x.roundRect(4, 4, w - 8, h - 8, 40); x.fill(); x.strokeStyle = "rgba(0,0,0,.4)"; x.lineWidth = 4; x.stroke();
  for (let k = 0; k < 160; k++) { x.fillStyle = `rgba(${Math.random() < .5 ? "0,0,0" : "255,255,255"},.05)`; x.fillRect(Math.random() * w, Math.random() * h, 3, 3); }   // (la peinture usée)
  x.fillStyle = "#33502a"; x.beginPath(); x.arc(75, 78, 62, 0, 7); x.fill(); x.strokeStyle = "rgba(0,0,0,.45)"; x.lineWidth = 5; x.stroke();   // la collerette
  const v = x.createRadialGradient(65, 66, 4, 75, 78, 50); if (on) { v.addColorStop(0, "#ffffff"); v.addColorStop(.6, "#fffbe6"); v.addColorStop(1, "#f2e6b8"); } else { v.addColorStop(0, "#c9c9c2"); v.addColorStop(.7, "#8e8e88"); v.addColorStop(1, "#5e5e58"); }
  x.fillStyle = v; x.beginPath(); x.arc(75, 78, 48, 0, 7); x.fill();
  x.fillStyle = "#e8e8e0"; x.font = "bold 21px Arial"; x.textAlign = "center"; x.fillText("SILENT LIGHT", 75, 222);
  x.fillStyle = "#cfcfca"; x.beginPath(); x.roundRect(64, 262, 22, 46, 10); x.fill(); x.fillStyle = "#7a7a76"; x.beginPath(); x.roundRect(68, on ? 266 : 286, 14, 18, 6); x.fill(); }))); }
// la lampe accrochée à la poitrine : on la voit de face, éteinte ou allumée
let lampe3D = null;
function chargerLampe3D() { return lampe3D = lampe3D || (async () => { gltfMod = gltfMod || await import("./vendor/GLTFLoader.js?v=1"); return (await new gltfMod.GLTFLoader().loadAsync("avatars/sh-lampe.glb?v=1")).scene; })().catch(() => null); }
/* la lampe de poche, accrochée au blouson, côté gauche de la poitrine (comme Harry dans Silent Hill) : elle suit le buste ; allumée, sa lentille brille */
function lampePoitrine3D(moi, voir) { const A = moi.av3, P = M.lampeP;
  if (!voir || !A || !A.sc.visible) { if (P && P.g.parent) P.g.parent.remove(P.g); return false; }
  if (!P) { M.lampeP = { g: new THREE.Group() }; chargerLampe3D().then(m => { if (!m || !M || !M.lampeP) return; const c = m.clone(); c.position.y = -.1; M.lampeP.g.add(c);
      const lent = new THREE.Mesh(new THREE.CircleGeometry(.034, 16), new THREE.MeshBasicMaterial({ color: 0xfff6d8, transparent: true, opacity: .95 })); lent.position.set(0, .07, .062); M.lampeP.g.add(lent); M.lampeP.lent = lent; }); return true; }   // (la lentille, quand elle éclaire)
  if (P.g.parent !== M.scene) M.scene.add(P.g); const b = os3D(A, "Spine2") || os3D(A, "Spine1"); if (!b) return true;
  A.sc.updateMatrixWorld(true); b.getWorldPosition(P.g.position); const q = A.sc.getWorldQuaternion(new THREE.Quaternion()), av = new THREE.Vector3(0, 0, 1).applyQuaternion(q), dr = new THREE.Vector3(1, 0, 0).applyQuaternion(q);
  P.g.position.addScaledVector(av, .2).addScaledVector(dr, .085); P.g.position.y += .02; P.g.quaternion.copy(q);
  if (P.lent) P.lent.visible = !!M.shLampeOn; M.lampePos = P.g.position; return true; }
function majLampePoitrine() { const moi = M && M.gens.get(M.moiNum); if (!moi) return; const voir = !!(M.shLampe && M.L && M.L.sh);
  if (lampePoitrine3D(moi, voir)) { if (M.lampeSp && M.lampeSp.parent) M.lampeSp.parent.remove(M.lampeSp); return; }   // (Harry en 3D : la vraie lampe ; sinon, l'image)
  if (!voir) { if (M.lampeSp && M.lampeSp.parent) M.lampeSp.parent.remove(M.lampeSp); return; }
  if (!M.lampeSp) { M.lampeSp = new THREE.Sprite(new THREE.SpriteMaterial({ map: texLampe(false), transparent: true, depthWrite: false })); M.lampeSp.renderOrder = 3; }
  const sp = M.lampeSp; if (sp.parent !== moi.g) moi.g.add(sp); sp.material.map = texLampe(!!M.shLampeOn);
  const H = tailleBonhomme() * hauteurDe(moi), c = M.camera.position, gp = moi.g.position, dx = c.x - gp.x, dz = c.z - gp.z, d = Math.hypot(dx, dz) || 1, dr = new THREE.Vector3().setFromMatrixColumn(M.camera.matrixWorld, 0);
  sp.scale.set(H * .04, H * .096, 1); sp.position.set(dx / d * .07 - dr.x * H * .055, H * .6, dz / d * .07 - dr.z * H * .055); }   /* (à la taille du bonhomme : accrochée à la poche de poitrine) */
// le bouton de la lampe : allumer, éteindre
// l'onglet de rappel, dans le bar de Silent Hill : prendre la lampe et la carte avant d'en sortir
// la caserne de Silent Hill : à partir du vrai lieu, déserté, éteint, dans le brouillard
/* à Silent Hill : la vieille télé ne capte plus rien — de la neige, qui grésille ; une lueur blafarde qui tremble */
function neigeTV(L) { const E = L.ecranConsole; if (!E) return; const W = PETIT ? 80 : 128, H = PETIT ? 60 : 96, c = document.createElement("canvas"); c.width = W; c.height = H; const x = c.getContext("2d"), im = x.createImageData(W, H);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter; E.ecr.material.map = t; E.ecr.material.emissiveMap = t; E.ecr.material.emissiveIntensity = .9; E.ecr.material.needsUpdate = true;
  if (E.lueur) { E.lueur.color.setHex(0xc8d0d8); E.lueur.intensity = .9; }
  let prec = 0; L.neigeTV = now => { if (now - prec < (PETIT ? 110 : 60)) return; prec = now; const d = im.data; let bande = (now / 7) % H;
    for (let y = 0; y < H; y++) { const b = Math.abs(y - bande) < 4 ? 40 : 0; for (let i = 0; i < W; i++) { const v = (Math.random() * 215 + b) | 0, k = (y * W + i) * 4; d[k] = d[k + 1] = d[k + 2] = v; d[k + 3] = 255; } }
    x.putImageData(im, 0, 0); t.needsUpdate = true; if (E.lueur) E.lueur.intensity = .6 + Math.random() * .5; }; }
function silentHill(scene, L, base) { neigeTV(L); caissesSH(scene, L, base); brancardsSH(scene, L, base); chargerBete3D("avatars/sh-lying.glb?v=1"); chargerBete3D("avatars/sh-siam.glb?v=1"); if (base === "etage") chargerBete3D("avatars/sh-infirmiere.glb?v=1"); if (base === "grande") pontiacSH(scene, L); for (const h of PETIT ? [100] : [100, 72, 71, 69, 73, 110, 111]) chargerAvatar3D(HEROS_3D[h]);   // (Harry, Maria, Angela, James, Lisa, Heather, Alessa en 3D : chargés d'avance — sur un petit téléphone, Harry seulement : la mémoire)
  L.apo = true; L.sh = true; L.sansMusique = true; L.porteFete = null; L.posDJ = null; L.posBar = null; L.zoneDJ = null;   // (L.apo : personne de la caserne n'y est — ni gardes, ni DJ, ni voitures qui roulent)
  if (L.boutonDJ) { L.boutonDJ.visible = false; L.boutonDJ = null; } for (const b of L.boutonsPiste || []) b.visible = false; L.boutonsPiste = null;
  L.portails = (L.portails || []).filter(q => !q.pasApo && !q.entreeApo && LIEUX_SH.includes(baseLieu(q.vers))); for (const q of L.portails) q.vers = "sh-" + baseLieu(q.vers);
  L.raccourcis = (L.raccourcis || []).filter(q => !q.vers || (!q.entreeApo && LIEUX_SH.includes(baseLieu(q.vers)))); for (const q of L.raccourcis) if (q.vers) q.vers = "sh-" + baseLieu(q.vers);
  L.messVitres = null; if (L.afficheApo) L.afficheApo.visible = false;
  const ext = !L.interieur, gris = ext ? 0xa9a8a3 : 0x2c2a27;
  // la lumière : grise, sans soleil ; les lampes sont mortes
  const appliquer = () => { scene.background = new THREE.Color(gris); scene.fog = new THREE.Fog(gris, ext ? 1.5 : 1, ext ? 24 : 15);
    scene.traverse(o => { if (!o.isLight || o.userData.sh) return;
      if (o.isHemisphereLight) { o.color.setHex(0xc4c3be); o.groundColor.setHex(0x4a4743); o.intensity = ext ? .95 : base === "etage" ? .12 : .4; }
      else if (o.isDirectionalLight) { o.intensity = ext ? .35 : 0; o.color.setHex(0xd8d8d4); o.castShadow = false; }
      else if (o.isAmbientLight) o.intensity = ext ? .15 : .08;
      else if (o.isPointLight || o.isSpotLight) o.intensity = 0; });
    (L.nuitObjets || []).forEach(o => { if (!o.isLight) o.visible = false; }); };
  const setN = L.setNuit; L.setNuit = () => { if (setN) setN(false); L.nuit = false; appliquer(); }; appliquer();
  if (L.fete) { for (const p of L.fete.projos) { p.spot.visible = p.cone.visible = false; } for (const [sp] of L.fete.fumees) sp.visible = false; L.fete.reflets.visible = false; L.fete.boule.visible = false; }
  if (L.club3d) { for (const ly of L.club3d.lyres) ly.faisceau.visible = ly.sol.visible = ly.lentille.visible = false; for (const l of L.club3d.tournantes) l.visible = false; }
  // les faisceaux lumineux (projecteurs de la scène, lyres…) : éteints, et tenus éteints
  const faisceaux = []; scene.traverse(o => { if (o.isMesh && o.material && !Array.isArray(o.material) && o.material.blending === THREE.AdditiveBlending) { faisceaux.push(o); o.visible = false; } });
  // les détritus (journaux, feuilles, canettes, cartons)
  texturesApo(); detritusApo(scene, L, base, (x, z) => base === "etage" ? 0 : (L.hauteur ? L.hauteur(x, z, { g: { position: { y: 0 } } }) : 0), 2);   /* (Silent Hill : deux fois plus de détritus) */
  // la lampe torche : elle éclaire là où l'on regarde
  /* la lampe de poche « Silent Light » : seulement une fois ramassée (sur le comptoir du bar), et allumée ; un vrai faisceau, avec ses ombres */
  const lampe = new THREE.SpotLight(0xfff2dc, ext ? 22 : 34, 20, .42, .6, 1.4); lampe.userData.sh = true; lampe.visible = false; scene.add(lampe, lampe.target);
  if (!GPU_MODESTE) { lampe.castShadow = true; lampe.shadow.mapSize.set(512, 512); lampe.shadow.bias = -.002; lampe.shadow.camera.near = .2; }
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: texFlocon(), color: 0xfff4dc, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .9 })); halo.scale.set(.3, .3, 1); halo.renderOrder = 4; halo.visible = false; scene.add(halo);
  // les cendres qui tombent, autour de nous
  const N = 2000, pos = new Float32Array(N * 3), V = 34, H = 16; for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - .5) * V; pos[i * 3 + 1] = Math.random() * H; pos[i * 3 + 2] = (Math.random() - .5) * V; }
  const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const cendres = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xeeebe4, size: .07, map: texFlocon(), alphaTest: .02, transparent: true, opacity: .8, depthWrite: false, fog: false })); cendres.frustumCulled = false; if (ext) scene.add(cendres);
  // en bas du bar (sh-fetes), la radio posée sur le comptoir : on l'éteint pour rentrer
  if (base === "fetes" && L.comptoirSousSol && L.comptoirSousSol.length) { const [x, z] = L.comptoirSousSol[1], r = creerRadio(); r.scale.setScalar(.62); r.position.set(x, L.yComptoirSousSol + .005, z); r.rotation.y = .6; r.visible = !M.shRadio; scene.add(r); L.radioSortie = [x, z]; L.radioSHObj = r; }   /* (une petite radio de poche : on la ramasse, avec la lampe et la carte) */
  // la ruelle des douches, juste après la petite fenêtre : la route s'est effondrée — un trou noir, sans fond, des plaques de bitume brisées. Un cul-de-sac
  if (base === "grande") { const [xa, xb, za, zb] = ROUTE_DETRUITE, lim0 = L.limites, cx = (xa + xb) / 2, cz = (za + zb) / 2, hx = (zb - za + 1.6) / 2, hz = (xb - xa + 1.2) / 2;   // (le trou tel qu'on le voit : la plaque est tournée d'un quart de tour)
    L.dansTrou = (x, z, m = 0) => (x > xa - .3 - m && x < xb + .3 + m && z > za - .3 - m && z < zb + .3 + m) || (Math.abs(x - cx) < hx + .25 + m && Math.abs(z - cz) < hz + .25 + m);
    L.limites = (x, z) => lim0(x, z) && !L.dansTrou(x, z);
    const trou = toile(256, 128, x => { x.fillStyle = "#000"; x.beginPath(); x.moveTo(0, 22); for (let i = 0; i <= 16; i++) x.lineTo(i * 16, 10 + Math.random() * 22); for (let i = 16; i >= 0; i--) x.lineTo(i * 16, 96 + Math.random() * 22); x.closePath(); x.fill(); });
    const pit = new THREE.Mesh(new THREE.PlaneGeometry(xb - xa + 1.2, zb - za + 1.6), new THREE.MeshBasicMaterial({ map: tex(trou), transparent: true, depthWrite: false, fog: false })); pit.rotation.x = -Math.PI / 2; pit.rotation.z = Math.PI / 2; pit.position.set((xa + xb) / 2, .03, (za + zb) / 2); pit.renderOrder = 1; scene.add(pit);
    const bit = new THREE.MeshStandardMaterial({ color: 0x3c3b3a, roughness: 1 }), terre = new THREE.MeshStandardMaterial({ color: 0x4a3c30, roughness: 1 });
    for (let k = 0; k < 12; k++) { const bord = k % 2 ? za - .1 : zb + .1, x = xa + .3 + Math.random() * (xb - xa - .6), sl = new THREE.Mesh(new THREE.BoxGeometry(.9 + Math.random() * .9, .14, .6 + Math.random() * .6), k % 3 ? bit : terre);
      sl.position.set(x, -.12 - Math.random() * .25, bord + (k % 2 ? .45 : -.45)); sl.rotation.set((k % 2 ? 1 : -1) * (.35 + Math.random() * .5), Math.random() * .6 - .3, Math.random() * .3 - .15); scene.add(sl); }
    for (let k = 0; k < 30; k++) { const r = new THREE.Mesh(new THREE.BoxGeometry(.1 + Math.random() * .25, .08 + Math.random() * .15, .1 + Math.random() * .25), k % 3 ? bit : terre); const cote = k % 2 ? za - .5 - Math.random() * 1.2 : zb + .5 + Math.random() * 1.2;
      r.position.set(xa + Math.random() * (xb - xa), .05, cote); r.rotation.set(Math.random(), Math.random() * 3, Math.random()); scene.add(r); }
    // une barrière de chantier renversée, au bord
    const bar = new THREE.Mesh(new THREE.BoxGeometry(2.2, .18, .05), new THREE.MeshStandardMaterial({ color: 0xc8c2b4, roughness: .8 })); bar.position.set((xa + xb) / 2 - .4, .2, zb + .7); bar.rotation.set(0, .25, 1.2); scene.add(bar); }
  // sur le comptoir du bar : la lampe de poche verte « Silent Light »
  if (base === "fetes" && L.comptoirSousSol && L.comptoirSousSol.length > 3) { const [x, z] = L.comptoirSousSol[3], vert = new THREE.MeshStandardMaterial({ color: 0x3e5a30, roughness: .75 }), face = new THREE.MeshStandardMaterial({ map: texLampe(false), roughness: .6 });
    const g = new THREE.Group(); void vert; void face;   // (la lampe de poche de Silent Hill 1 : couchée sur le comptoir, la lentille vers le haut)
    chargerLampe3D().then(m => { if (!m) return; const c = m.clone(); c.rotation.x = -Math.PI / 2; c.position.set(0, .04, .1); c.traverse(o => { if (o.isMesh) o.castShadow = true; }); g.add(c); });
    g.position.set(x, L.yComptoirSousSol + .002, z + .05); g.rotation.y = -.25; scene.add(g); L.lampeObj = g; L.lampeComptoir = [x, z]; }
  // des traînées de sang, comme si l'on avait traîné quelqu'un : dans les couloirs des étages, sur les paliers ; dehors, quelques-unes
  { const tr = texTrainees(), mat = new THREE.MeshStandardMaterial({ map: tr, transparent: true, depthWrite: false, roughness: .35, polygonOffset: true, polygonOffsetFactor: -3 });
    const poser = (x, y, z, rot, l) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(l, l * .3), mat); m.rotation.set(-Math.PI / 2, 0, rot); m.position.set(x, y + .014, z); m.renderOrder = 1; scene.add(m); };
    if (base === "etage") { for (let n = 0; n <= ET.N; n++) for (let k = 0; k < 2; k++) poser((Math.random() * 2 - 1) * (ET.CX0 - 2.5), n * ET.H, -1.9 + (Math.random() - .5) * .5, (Math.random() - .5) * .3 + (k ? Math.PI : 0), 2.4 + Math.random() * 1.6);
      for (let n = 1; n <= ET.N; n += 2) poser((n % 4 === 1 ? 1 : -1) * 12.4, n * ET.H, -2.2, Math.PI / 2 + (Math.random() - .5) * .5, 1.6); }
    else if (ext) for (let k = 0; k < 7; k++) { const q = (L.zone || [-20, 20, -100, 20]), x = q[0] + Math.random() * (q[1] - q[0]), z = q[2] + Math.random() * (q[3] - q[2]); if (!L.limites(x, z)) { k--; continue; } const y = L.hauteur ? L.hauteur(x, z, { g: { position: { y: 0 } } }) : 0; if (Math.abs(y) > .5) continue; poser(x, y, z, Math.random() * 7, 2 + Math.random() * 2); } }
  // les couloirs R et S : un escalier sur deux s'est effondré — pour monter, il faut traverser le couloir jusqu'à l'autre cage
  if (base === "etage") { const { H, CX0, CXM, CX1, N } = ET, ouvert = (sg, n) => sg > 0 ? n % 2 === 0 : n % 2 === 1, lim0 = L.limites;
    const etg = () => { const q = M && M.gens.get(M.moiNum); return q && q.etg; };
    L.limites = (x, z) => { if (!lim0(x, z)) return false; const e = etg(); if (!e || e.zone !== "P") return true; const ax = Math.abs(x), sg = Math.sign(x) || 1, zl = .5 - z;
      if (zl < 1.85 && ax > CX0 - .1) { if (ax > CXM - .15 && e.n < N && !ouvert(sg, e.n)) return false; if (ax < CXM + .15 && e.n > 0 && !ouvert(sg, e.n - 1)) return false; }
      return true; };
    const ae = L.allerEtage; L.allerEtage = (moi, x, z, y) => { const e = moi.etg || { n: 0 }, f = Math.max(0, Math.min(N, Math.round(y / H))); if (f === e.n) return ae(moi, x, z, y);
      const sg = Math.sign(moi.g.position.x) || 1, pas = f > e.n ? 1 : -1; let g = e.n; while (g !== f && ouvert(sg, pas > 0 ? g : g - 1)) g += pas;
      if (g === e.n) { M.ctx.surInfo && M.ctx.surInfo("🚧 L'escalier s'est effondré…"); return true; }
      return ae(moi, g === f ? x : sg * 9.5, g === f ? z : -1.9, g * H); };
    // les volées effondrées : des planches clouées en travers, des gravats
    const bois = new THREE.MeshStandardMaterial({ color: 0xa88458, roughness: 1 }), grav = new THREE.MeshStandardMaterial({ color: 0x9a9286, roughness: 1 }); bois.clippingPlanes = grav.clippingPlanes = [coupeCage()];   // (dans la vue en coupe de la cage, coupées comme les marches)
    for (let n = 0; n < N; n++) for (const sg of [-1, 1]) { if (ouvert(sg, n)) continue;
      for (const [xc, y0] of [[sg * (CXM + CX1 - .25) / 2, n * H], [sg * (CX0 + CXM) / 2, (n + 1) * H]]) { if (y0 > N * H + .1) continue;
        for (const [hy, rz] of [[.55, .35], [1.05, -.3], [1.45, .12]]) { const pl = new THREE.Mesh(new THREE.BoxGeometry(1.75, .18, .05), bois); pl.castShadow = true; pl.position.set(xc, y0 + hy, .5 - 1.75); pl.rotation.z = rz; scene.add(pl); (L.masquesCam = L.masquesCam || []).push(pl); }
        for (let k = 0; k < 8; k++) { const r = new THREE.Mesh(new THREE.BoxGeometry(.12 + Math.random() * .2, .08 + Math.random() * .14, .12 + Math.random() * .2), grav); r.position.set(xc + (Math.random() - .5) * 1.2, y0 + .05, .5 - 1.75 + (Math.random() - .5) * .5); r.rotation.set(Math.random(), Math.random() * 3, Math.random()); scene.add(r); } } } }
  // dans la fosse, l'entrée du sous-sol (le stand de tir, le ping-pong) : condamnée, des planches clouées en travers
  if (base === "grande" && C3.sousSol) { const zP = C3.sousSol.zT - .08, yP = C3.sousSol.Y0, bois = new THREE.MeshStandardMaterial({ color: 0x8a6a46, roughness: 1 }), clou = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, metalness: .6 });
    for (const [hy, rz] of [[.35, .05], [.8, -.18], [1.25, .12], [1.7, -.06], [2.05, .2]]) { const pl = new THREE.Mesh(new THREE.BoxGeometry(1.7, .2, .05), bois); pl.position.set(2.5, yP + hy, zP); pl.rotation.z = rz; pl.castShadow = true; scene.add(pl);
      for (const dx of [-.72, .72]) { const c2 = new THREE.Mesh(new THREE.CylinderGeometry(.015, .015, .02, 6), clou); c2.rotation.x = Math.PI / 2; c2.position.set(2.5 + dx * Math.cos(rz), yP + hy + dx * Math.sin(rz), zP - .035); scene.add(c2); } }
    const lim1 = L.limites, enBas = () => { const q = M && M.gens.get(M.moiNum); return q && q.g.position.y < -3; };
    L.limites = (x, z) => lim1(x, z) && !(x > 1.5 && x < 3.5 && z > C3.sousSol.zT - .45 && z < C3.sousSol.zT + 1.6 && enBas()); }
  // au mur du bar (sh-fetes) : la carte de la caserne, punaisée ; on la prend
  if (base === "fetes" && L.comptoirSousSol) { const yb = L.hauteur ? L.hauteur(0, 26.5, { g: { position: { y: -1.5 } } }) : -1.5; scene.updateMatrixWorld(true);
    const rc = new THREE.Raycaster(new THREE.Vector3(CARTE_MUR.de[0], yb + 1.5, CARTE_MUR.de[1]), new THREE.Vector3(CARTE_MUR.dir[0], 0, CARTE_MUR.dir[1]), 0, 8);
    const murs = []; scene.traverse(o => { if (o.isMesh && !o.isSprite && o.visible && !(o.material && (Array.isArray(o.material) || o.material.transparent))) murs.push(o); });
    const h = rc.intersectObjects(murs, false).find(q => q.face);
    if (h) { const n = h.face.normal.clone().transformDirection(h.object.matrixWorld); n.y = 0; n.normalize();
      const tc = new THREE.TextureLoader().load("images/sh/carte-caserne.webp"); tc.colorSpace = THREE.SRGBColorSpace;
      const c = new THREE.Mesh(new THREE.PlaneGeometry(.6, .6 * 3640 / 1290), new THREE.MeshStandardMaterial({ map: tc, roughness: .9, polygonOffset: true, polygonOffsetFactor: -2 }));
      c.position.copy(h.point).addScaledVector(n, .02); c.position.y = yb + 1.4; c.lookAt(c.position.clone().add(n)); scene.add(c);
      const pun = new THREE.Mesh(new THREE.SphereGeometry(.018, 8, 6), new THREE.MeshStandardMaterial({ color: 0xb01818 })); pun.position.set(0, .6 * 3640 / 1290 / 2 - .04, .01); c.add(pun);
      L.carteObj = c; L.carteMur = [h.point.x + n.x * .9, h.point.z + n.z * .9]; } }
  /* dehors : des journaux qu'un coup de vent soulève de temps en temps, fait voler un peu, puis retombent plus loin */
  const vols = []; if (ext) { const mj = new THREE.MeshStandardMaterial({ map: texJournal, roughness: 1, side: THREE.DoubleSide });
    for (let k = 0; k < 14; k++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.46, .32), mj); m.rotation.order = "YXZ"; m.visible = false; scene.add(m); vols.push({ m, x: 0, z: 0, y: 0, vx: 0, vz: 0, ph: Math.random() * 7, pose: false }); } }
  let ventT = performance.now() + 4000, ventFin = 0, ventDir = Math.random() * 6.283;
  const vent = (now, dt, moi) => { if (!vols.length || !moi) return; const p = moi.g.position;
    if (now > ventT) { ventFin = now + 2200 + Math.random() * 1600; ventT = ventFin + 5000 + Math.random() * 8000; ventDir += (Math.random() - .5) * 1.4; if (Math.random() < .6) sonBruit(1.6, 500, .05); }   /* (le souffle du vent) */
    const souffle = now < ventFin ? Math.sin(Math.PI * (1 - (ventFin - now) / 2600)) : 0, wx = Math.cos(ventDir), wz = Math.sin(ventDir);
    for (const j of vols) { if (!j.pose || Math.hypot(j.x - p.x, j.z - p.z) > 20) { let ok = false; for (let k = 0; k < 20 && !ok; k++) { const a = Math.random() * 6.283, r = 4 + Math.random() * 12, x = p.x + Math.cos(a) * r, z = p.z + Math.sin(a) * r;
          if (L.limites(x, z)) { const y = L.hauteur ? L.hauteur(x, z, { g: { position: { y: p.y } } }) : 0; if (Math.abs(y - p.y) < .6) { Object.assign(j, { x, z, y, pose: true, h: 0, vx: 0, vz: 0 }); j.m.rotation.set(-Math.PI / 2, Math.random() * 6, 0); ok = true; } } } if (!ok) { j.m.visible = false; continue; } }
      const s0 = souffle * (.6 + .4 * Math.sin(now / 300 + j.ph)); j.vx += (wx * 3.2 * s0 - j.vx) * Math.min(1, dt * 2); j.vz += (wz * 3.2 * s0 - j.vz) * Math.min(1, dt * 2);
      const nx = j.x + j.vx * dt, nz = j.z + j.vz * dt; if (L.limites(nx, nz)) { j.x = nx; j.z = nz; } else { j.vx *= -.3; j.vz *= -.3; }
      j.h += ((s0 > .15 ? .25 + .5 * s0 * (1 + Math.sin(now / 180 + j.ph)) : 0) - j.h) * Math.min(1, dt * 3);
      const vol = j.h > .03; j.m.visible = true; j.m.position.set(j.x, j.y + .016 + j.h, j.z);
      if (vol) { j.m.rotation.x = -Math.PI / 2 + Math.sin(now / 140 + j.ph) * .9; j.m.rotation.z = Math.sin(now / 210 + j.ph) * .7; j.m.rotation.y += dt * 3 * s0; } else { j.m.rotation.x = -Math.PI / 2; j.m.rotation.z = 0; } } };
  const v = new THREE.Vector3(), animAvant = L.anim; let prec = performance.now();
  L.anim = (t) => { animAvant && animAvant(t); if (L.neigeTV) L.neigeTV(performance.now()); if (L.lampeObj) L.lampeObj.visible = !(M && M.shLampe); if (L.carteObj) L.carteObj.visible = !(M && M.shCarteOK); const now = performance.now(), dt = Math.min(.05, (now - prec) / 1000); prec = now; if (!M || !M.camera) return;
    const cam = M.camera, moi = M.gens.get(M.moiNum);
    const allumee = !!(M.shLampe && M.shLampeOn); lampe.visible = halo.visible = allumee && !!moi; majLampePoitrine();
    if (moi && allumee) { const p = moi.g.position; cam.getWorldDirection(v); const dx = v.x, dz = v.z, dl = Math.hypot(dx, dz) || 1; const Hc = tailleBonhomme() * hauteurDe(moi) * .6; lampe.position.set(p.x + dx / dl * .3, p.y + Hc, p.z + dz / dl * .3); lampe.target.position.set(p.x + v.x * 7, p.y + .5 + v.y * 7, p.z + v.z * 7);
      if (M.lampeP && M.lampeP.g.parent) { halo.position.copy(M.lampeP.g.position); halo.position.y += .07; } else if (M.lampeSp) { halo.position.copy(M.lampeSp.position).add(moi.g.position); halo.position.y += tailleBonhomme() * hauteurDe(moi) * .051; } halo.material.opacity = .75 + Math.random() * .05; }
    const abrite = !!(moi && L.c3 && C3.dedans(moi)); cendres.visible = ext && !abrite;   // (sous un toit — le judo, le sous-sol… — pas de cendres)
    if (ext && !abrite) { const a = geo.attributes.position.array; for (let i = 0; i < N; i++) { const k = i * 3; a[k + 1] -= dt * (.35 + (i % 7) * .04); a[k] += Math.sin(now / 1800 + i) * dt * .15;
        if (a[k + 1] < cam.position.y - 4) a[k + 1] += H; let dx = a[k] - cam.position.x, dz = a[k + 2] - cam.position.z; if (dx > V / 2) a[k] -= V; else if (dx < -V / 2) a[k] += V; if (dz > V / 2) a[k + 2] -= V; else if (dz < -V / 2) a[k + 2] += V; }
      geo.attributes.position.needsUpdate = true; }
    // la radio de poche grésille, avec des craquements
    peuplerSH(now); for (const o of faisceaux) o.visible = false; vent(now, dt, moi);
    /* quelqu'un arrive ou s'en va : le brouillard se referme un instant sur toute la scène */
    if (scene.fog) { const reste = (M.shBrumeT || 0) - now, D = M.shBrumeD || 4000; let b = 0; if (reste > 0) b = Math.min(1, (D - reste) / 700) * Math.min(1, reste / 1800);
      if (b > 0 || L.brumeB) { scene.fog.near = (ext ? 1.5 : 1) * (1 - b * .85); scene.fog.far = (ext ? 24 : 15) * (1 - b * .6); L.brumeB = b > 0; } }
    musiqueSH(dt);
    if (L.fete) { for (const q of L.fete.projos) q.spot.visible = q.cone.visible = false; for (const [sp] of L.fete.fumees) sp.visible = false; L.fete.reflets.visible = L.fete.boule.visible = false; }   // (pas de fête à Silent Hill)
    if (L.club3d) { for (const ly of L.club3d.lyres) ly.faisceau.visible = ly.sol.visible = ly.lentille.visible = false; for (const l of L.club3d.tournantes) l.visible = false; }
    if (M.gresil) { const pr = Math.max(0, 1 - (M.shProche ?? 99) / 14), k = .006 + pr * pr * .3 + (pr > 0 && Math.random() < .03 ? .1 * pr : 0); M.gresil.g.gain.setTargetAtTime(k, actx.currentTime, .05); } };   // (au calme : un souffle à peine audible ; un monstre approche : la radio s'affole, de plus en plus fort)
}
function placeLibre(x, z) { if (M.L.limites(x, z)) return [x, z]; for (let r = .5; r < 8; r += .5) for (let a = 0; a < 12; a++) { const xx = x + Math.cos(a / 12 * 6.283) * r, zz = z + Math.sin(a / 12 * 6.283) * r; if (M.L.limites(xx, zz)) return [xx, zz]; } return null; }
const solSH = (x, z) => M.L.hauteur ? M.L.hauteur(x, z, { g: { position: { y: 0 } } }) : 0;
/* Silent Hill : le scénario. Chacun vit le sien (les personnages et les monstres ne sont que chez soi).
   0 réveil au bar (Maria) → 1 Angela, à la petite fenêtre des douches → 2 Heather, dans la fosse → 3 James, sous l'horloge jaune (l'arme)
   → 4 Lisa, dans la cour d'honneur → 5 Maria, sur la terrasse → 6 Maria, à la porte du mess → 7 le mess (Pyramid Head) → 8 l'escalier R, les étages, Alessa au bout du couloir du 6e
   → 9 la clé → 10 le cadenas des encombrants : on sort vivant. Cinq vies ; à la dernière, le sang, l'écran rouge, et retour en 1990 */
/* Silent Hill, la cour d'honneur : une Pontiac Ventura garée à l'arrache devant la salle des fêtes — de biais, le nez vers la porte (on passe encore à gauche) ;
   on ne la traverse pas */
function pontiacSH(scene, L) {
  const X = 7.4, Z = 8.9, TH = .35, LG = 5.0, c = Math.cos(TH), s = Math.sin(TH);
  const lim0 = L.limites; L.limites = (x, z) => { if (lim0 && !lim0(x, z)) return false; const dx = x - X, dz = z - Z, u = dx * c - dz * s, v = dx * s + dz * c; return !(Math.abs(u) < LG / 2 + .25 && Math.abs(v) < 1.0 + .25); };
  (async () => { gltfMod = gltfMod || await import("./vendor/GLTFLoader.js?v=1"); const g = await new gltfMod.GLTFLoader().loadAsync("avatars/sh-pontiac.glb?v=1"); if (!M) return; const sc = g.scene;
    sc.updateMatrixWorld(true); let corps = null; sc.traverse(o => { if (o.isMesh && /ventura/i.test(o.name)) corps = o; if (o.isMesh) { o.castShadow = o.receiveShadow = true; } });
    const b = new THREE.Box3().setFromObject(corps || sc), k = LG / (b.max.x - b.min.x), w = new THREE.Group(); w.add(sc); sc.scale.multiplyScalar(k);
    sc.position.set(-(b.min.x + b.max.x) / 2 * k, -b.min.y * k, -(b.min.z + b.max.z) / 2 * k);   // (centrée, les roues au sol)
    w.position.set(X, L.hauteur ? L.hauteur(X, Z) : 0, Z); w.rotation.set(0, TH, .025); scene.add(w); L.pontiac = w; })().catch(() => {});
  /* par terre, près de la portière : une photo d'un couple (James et Mary — Harry ne les connaît pas), tachée de sang séché, tombée là (un tirage de 13 × 13,5 cm, un peu gondolé, de travers) */
  { const im = new Image(), t = new THREE.Texture(im); t.colorSpace = THREE.SRGBColorSpace; im.onload = () => { t.needsUpdate = true; }; im.src = "images/sh/photo-james-mary.webp";
    const ph = new THREE.Mesh(new THREE.PlaneGeometry(.2, .21), new THREE.MeshStandardMaterial({ map: t, roughness: .45, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: .35, polygonOffset: true, polygonOffsetFactor: -2 }));   // (un peu de sa propre lumière : on la voit au sol, dans le brouillard)
    const px = X - .6 * Math.cos(TH) - 2.0 * Math.sin(TH), pz = Z + .6 * Math.sin(TH) - 2.0 * Math.cos(TH);   // (à côté de la portière, sur le pavé — pas sous la voiture)
    ph.rotation.set(-Math.PI / 2 + .03, 0, .7); ph.position.set(px, (L.hauteur ? L.hauteur(px, pz) : 0) + .016, pz); ph.receiveShadow = true; scene.add(ph); L.photoSH = ph; L.photoPos = [px, pz]; if (M && M.shPhoto) ph.visible = false; } }
// les monstres : [image, hauteur, vitesse, points de vie]
const SH_BETES = { capuche: ["capuche", 1.85, 1.15, 3], mannequin: ["mannequin", 1.8, 1.55, 3], bras: ["bras", 2.1, 1.0, 4], infirmiere: ["infirmiere", 1.78, 1.3, 2], tuyau: ["tuyau", 1.72, 1.35, 3], pyramid: ["pyramid-corps", 3.2, 1.35, 999] };
const SH_ID_BETE = { pyramid: 74, infirmiere: 75, tuyau: 76, bras: 77, mannequin: 78, capuche: 79 };   /* (leurs réglages, dans l'inventaire de l'administrateur) */
const regBete = cle => ((M.ctx.pnjTrio && M.ctx.pnjTrio(SH_ID_BETE[cle])) || {}).reglage || {};
function resetSH() { if (!M) return; M.shEtape = 0; M.shScenes = new Set(); M.shLauraBas = false; M.shVies = SH_VIES; M.shArme = false; M.shCle = false; M.shPhoto = false; M.shInfVu = false; M.shInf = null; M.shDansFosse = false; M.shAppelHeather = false; M.shMort = false; M.shPopL = null; M.shEddieVu = false; M.shDegT = 0; M.shCarte = []; M.shCarteOK = false; M.shCroix = false; M.shVus = new Set(); M.shEscorte = null; M.shFlacons = []; M.shPerte = 0; M.shChoix = null; M.shCleMess = false; M.shMariaMess = false; M.shTerrasse = false; M.shMessOuvert = false; M.shLampe = false; M.shLampeOn = false; M.shRadio = false; majBoutonCarte(); }
function persoSH(num, x, z, y = null) {
  const id = SH_IDN[num], ci = infoGendarme(id, `images/sh/${SH_NOMS[id].toLowerCase()}-tete.webp`, SH_NOMS[id]); let p = M.gens.get(num); if (p) return p;
  const pl = placeLibre(x, z) || [x, z]; p = ajouterAncien({ ...ci.info, ...([69, 71, 72, 73, 110, 111].includes(id) ? { heros: id } : {}), numero: num, pnj: true, x: pl[0], z: pl[1] }); if (!p) return null;   // (James, Angela, Maria, Lisa, Heather, Alessa : en 3D)
  p.cleInfo = ci.cle; p.info.allure = .5; if (y != null) p.g.position.y = y; return p; }
/* un brouillard épais qui monte d'un coup, là où quelqu'un arrive ou s'en va : de gros nuages autour de lui, et toute la scène qui se bouche un instant */
// la silhouette d'un personnage : de rien à tout (ou l'inverse), image par image (son corps, dessiné un peu plus tard, suit)
function fonduSH(p, de, a, ms, fin) { const t0 = performance.now(), pas = () => { if (!M || !M.gens.has(p.info.numero) || M.gens.get(p.info.numero) !== p) return; const k = Math.min(1, (performance.now() - t0) / ms), op = de + (a - de) * k; p.opa = op;
    p.g.traverse(o => { if (o.material && !Array.isArray(o.material)) { o.material.transparent = true; o.material.opacity = op; } }); if (k < 1) requestAnimationFrame(pas); else fin && fin(); }; pas(); }
// un personnage repart : il s'éloigne, le brouillard l'enveloppe, il s'efface
function evanouirSH(num, vers, apres = 1800, allure = 1.1) { const p = M && M.gens.get(num); if (!p || p.part) return; p.part = true; p.info.allure = allure;
  if (vers) { const v = placeLibre(vers[0], vers[1]); if (v) p.cible = new THREE.Vector3(v[0], p.g.position.y, v[1]); }
  setTimeout(() => { if (!M || M.gens.get(num) !== p) return; brumeSH(p.g.position.clone(), 4200); setTimeout(() => fonduSH(p, 1, 0, 1300, () => retirerAncien(num)), 700); }, apres); }
// un personnage arrive : le brouillard s'épaissit là où il est, il en sort
function apparaitreSH(p) { if (!p) return p; brumeSH(p.g.position.clone(), 4600); fonduSH(p, 0, 0, 10); setTimeout(() => M && fonduSH(p, 0, 1, 1400), 650); return p; }
/* une conversation : des répliques [qui, texte] (qui : "moi" ou le numéro du personnage), [null, null, ms] pour une pause, ou une fonction (un geste) ;
   la caméra cadre les deux, de côté ; « Passer » saute à la fin (fin() fait toujours ce qui compte) */
function dialogueSH(num, lignes, fin, opt = {}) {
  const moi = moiApo(); if (!moi || M.cine) return; moi.cible = null; moi.chemin = []; envoyerWS({ t: "aller", x: moi.g.position.x, z: moi.g.position.z });
  const p0 = M.gens.get(num);
  /* (trop loin, ou de biais : il s'approche de nous, à pas lents, pour parler face à face) */
  if (p0 && !p0.part && !p0.regardeA && herosSH(p0.info.heros) && p0.info.heros !== 111) { const a = moi.g.position, b = p0.g.position, d = Math.hypot(a.x - b.x, a.z - b.z);
    if (d > 2.6 && Math.abs(a.y - b.y) < 1) { const a0 = Math.atan2(b.x - a.x, b.z - a.z), autres = [...M.gens.values()].filter(q => q !== p0 && q !== moi && herosSH(q.info.heros) && !q.part).map(q => q.g.position);
      let t = null; for (const k of [0, 1, -1, 2, -2, 3, -3]) { const an = a0 + k * .38, x = a.x + Math.sin(an) * 2.1, z = a.z + Math.cos(an) * 2.1;   /* (à côté d'un autre, pas collé à lui : James arrivait contre Maria) */
        if (M.L.limites(x, z) && !autres.some(o => Math.hypot(o.x - x, o.z - z) < 1.6)) { t = [x, z]; break; } }
      t = t || placeLibre(b.x + (a.x - b.x) * (d - 1.9) / d, b.z + (a.z - b.z) * (d - 1.9) / d); if (t) { p0.info.allure = .5; p0.cible = new THREE.Vector3(t[0], b.y, t[1]); p0.chemin = []; } } }
  let i = -1, tProchain = 500, fini = false, cote = 0, clk = 0, prec = performance.now();   /* (clk : le temps de la scène, image par image — un téléphone qui rame ne saute pas de réplique) */
  if (opt.musique !== false) musiqueRencontre(true); else for (const a of [M.musExplo, M.musReveil]) if (a) { try { a.pause(); } catch (e) {} a.volume = 0; }
  const finir = () => { if (fini) return; M.shRegard = null; M.shParle = false; for (const q of M.gens.values()) q.teteVers = null; if (regMoi && moi.regardeA === regMoi) moi.regardeA = null; fini = true; if (opt.musique !== false) musiqueRencontre(false); for (const l of lignes.slice(i + 1)) if (typeof l === "function" && l.toujours) l(); if (M.passerBtn) { M.passerBtn.remove(); M.passerBtn = null; } finCine(); placerCamera(true); fin && fin(); };
  M.passerBtn = boutonPasser(finir); M.shParle = true; const regMoi = p0 && !moi.regardeA ? p0.g.position : null; if (regMoi) moi.regardeA = regMoi;   /* (et nous, face à lui) */
  M.shRegard = null;
  let parle = num;   /* (la caméra se tourne vers celui qui parle) */
  /* (personne d'autre que nous : la caméra regarde devant nous, dans le sens où l'on regardait) */
  const devant = (() => { const v = new THREE.Vector3(); M.camera.getWorldDirection(v); v.y = 0; if (v.lengthSq() < 1e-4) v.set(0, 0, -1); v.normalize(); const m = moi.g.position; return new THREE.Vector3(m.x + v.x * 4, m.y, m.z + v.z * 4); })();
  M.cine = { maj: t => { if (fini) return; clk += Math.min(50, Math.max(0, t - prec)); prec = t; const now = clk; const pp = M.gens.get(parle), p = pp && !pp.part ? pp : M.gens.get(num) || p0, a = moi.g.position, b = M.shRegard || (p ? p.g.position : devant);   /* (M.shRegard : la caméra se tourne vers ce qui surgit) */
    let dx = b.x - a.x, dz = b.z - a.z; const d = Math.hypot(dx, dz) || 1; dx /= d; dz /= d;
    /* (par-dessus notre épaule, tournée vers lui : de côté, un mur ou un muret se mettait souvent entre la caméra et nous) */
    if (!cote) { const c = M.camera.position; cote = ((c.x - a.x) * -dz + (c.z - a.z) * dx) >= 0 ? 1 : -1; }
    if (M.shRegard) { const ex = b.x - a.x, ez = b.z - a.z, el = Math.hypot(ex, ez) || 1, cx = a.x + ex * .35 - ez / el * 1.6 * cote, cz = a.z + ez * .35 + ex / el * 1.6 * cote;   /* (ce qui surgit : la caméra s'en approche, de côté) */
      M.camera.position.set(cx, a.y + 1.6, cz); M.camera.lookAt(b.x, a.y + 1.3, b.z); }
    else { const rr = M.L.interieur ? 1.5 : 2.1, lat = baseLieu(M.lieu) === "etage" ? .3 : M.L.interieur ? .95 : 1.25; M.camera.position.set(a.x - dx * rr - dz * lat * cote, a.y + 1.75, a.z - dz * rr + dx * lat * cote); M.camera.lookAt(b.x * .75 + a.x * .25 + dz * .35 * cote, a.y + 1.05, b.z * .75 + a.z * .25 - dx * .35 * cote); }
    if (now < tProchain) return; i++; if (i >= lignes.length) { finir(); return; }
    const l = lignes[i]; if (typeof l === "function") { l(); tProchain = now; return; }
    const [qui, texte, ms] = l; if (qui != null && qui !== "moi" && M.gens.has(qui)) parle = qui; if (texte) dire(qui === "moi" ? M.moiNum : qui, texte); tProchain = now + (ms || Math.min(5600, 1900 + texte.length * 52)); } };
}
// la musique des rencontres (« The Day Of Night ») : elle remplace celle de l'exploration le temps de la conversation
function musiqueRencontre(on) { if (!M) return;
  if (on) { for (const a of [M.musExplo, M.musReveil]) if (a) { try { a.pause(); } catch (e) {} a.volume = 0; }
    let a = M.musRencontre; if (!a) { a = M.musRencontre = new Audio("sons/sh-rencontre.mp3"); a.loop = true; } clearInterval(a.fondu); if (a.paused) a.currentTime = 0; a.volume = .85; a.play().catch(() => {}); return; }
  const a = M.musRencontre; if (!a || a.paused) return; if (VOLUME_FIGE) { a.pause(); return; }
  clearInterval(a.fondu); a.fondu = setInterval(() => { a.volume = Math.max(0, a.volume - .04); if (a.volume <= 0) { clearInterval(a.fondu); a.pause(); } }, 100); }
// la sirène, qui prévient : il arrive
function sirenePH(ms = 9000) { try { const a = new Audio("sons/sh-sirene.mp3"); a.volume = 1; a.play().catch(() => {}); sonsCourts.add(a); if (M) M.sirenePH = a; setTimeout(() => { if (VOLUME_FIGE) { a.pause(); return; } const t1 = performance.now(), b = () => { const k = (performance.now() - t1) / 2000; if (k >= 1) { a.pause(); return; } a.volume = 1 - k; requestAnimationFrame(b); }; b(); }, ms); return a; } catch (e) { return null; } }
// le thème de Pyramid Head : dès qu'il apparaît, et tant qu'on est dans le mess avec lui
function musiquePyramid(on) { if (!M) return; let a = M.musPyr;
  if (on) { if (!a) { a = M.musPyr = new Audio("sons/sh-pyramid.mp3"); a.loop = true; } clearInterval(a.fondu); a.volume = .9; if (a.paused) a.play().catch(() => {}); return; }
  if (!a || a.paused) return; if (VOLUME_FIGE) { a.pause(); return; } clearInterval(a.fondu); a.fondu = setInterval(() => { a.volume = Math.max(0, a.volume - .05); if (a.volume <= 0) { clearInterval(a.fondu); a.pause(); } }, 100); }
/* --- les monstres --- */
function creerBeteSH(cle, x, z, y, n = 0) {
  const R = regBete(cle), [img, h0, v0, pv] = SH_BETES[cle], h = h0 * (R.h || 1), v = v0 * (R.k || 1), lg = R.l || 1, geo = new THREE.PlaneGeometry(1, 1); geo.translate(0, .5, 0);
  const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xd8d4cc, transparent: true, alphaTest: .45, side: THREE.DoubleSide })); mesh.scale.set(h * .45 * lg, h, 1);
  const t = new THREE.TextureLoader().load(`images/sh/m-${img}.webp`, tt => { mesh.scale.set(h * lg * tt.image.width / tt.image.height, h, 1); m.W = mesh.scale.x; if (m.placerBras) m.placerBras(m.W); }); t.colorSpace = THREE.SRGBColorSpace; mesh.material.map = t;
  const g = new THREE.Group(); g.add(mesh); M.scene.add(g);
  const m = { cle, g, mesh, x, z, y, n, v, hp: pv, ph: Math.random() * 7, W: h * .45, H: h, mortT: 0, coupT: 0, lentT: 0, flashT: 0, imbattable: cle === "pyramid" };
  if (cle === "pyramid") {   /* son grand couteau, traîné au sol ; il le lève, et l'abat */
    const c = toile(96, 512, x => { const gr = x.createLinearGradient(0, 0, 96, 0); gr.addColorStop(0, "#262422"); gr.addColorStop(.5, "#5a5550"); gr.addColorStop(1, "#1e1c1a"); x.fillStyle = gr;
      x.beginPath(); x.moveTo(14, 70); x.lineTo(82, 70); x.lineTo(86, 470); x.lineTo(48, 508); x.lineTo(10, 470); x.closePath(); x.fill();
      x.fillStyle = "rgba(70,18,8,.6)"; for (let k = 0; k < 40; k++) { x.beginPath(); x.arc(14 + Math.random() * 68, 90 + Math.random() * 380, 3 + Math.random() * 9, 0, 7); x.fill(); }
      x.fillStyle = "#2a1c14"; x.fillRect(34, 0, 28, 74); x.fillStyle = "#1a1210"; x.fillRect(18, 62, 60, 12); });
    /* son bras droit, découpé de l'image : il tourne à l'épaule ; l'épée est dans sa main (et non plus collée au ventre) */
    const piv = new THREE.Group(); g.add(piv); m.lame = piv;
    const tB = new THREE.TextureLoader().load("images/sh/m-pyramid-bras.webp"); tB.colorSpace = THREE.SRGBColorSpace;
    const bras = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: tB, color: 0xd8d4cc, transparent: true, alphaTest: .45, side: THREE.DoubleSide })); piv.add(bras); m.bras = bras;
    const main = new THREE.Group(); piv.add(main); main.rotation.z = .45;   /* (la lame part vers l'arrière, la pointe vers le sol) */
    const bl = new THREE.Mesh(new THREE.PlaneGeometry(h * .15, h * .52), new THREE.MeshBasicMaterial({ map: tex(c), transparent: true, alphaTest: .3, side: THREE.DoubleSide, color: 0x6e6a64 })); bl.position.set(0, -h * .24, -.01); main.add(bl);
    /* (repères pris sur l'image de 216 × 512 : l'épaule en (163, 140), le bras découpé en (148, 120)–(216, 340), la main en (205, 305)) */
    m.placerBras = W => { const X = px => px / 216 * W, Y = py => py / 512 * h;
      piv.position.set(X(163) - W / 2, h - Y(140), .05); bras.scale.set(X(68), Y(220), 1); bras.position.set(X(182 - 163), -Y(230 - 140), 0); main.position.set(X(205 - 163), -Y(305 - 140), .01); };
    m.placerBras(h * lg * 216 / 512); pyramide3D(m); }
  if (cle === "capuche") lying3D(m, "avatars/sh-lying.glb?v=1", 1.85); else if (cle === "bras") lying3D(m, "avatars/sh-siam.glb?v=1", 2.2); else if (cle === "infirmiere" || cle === "tuyau") lying3D(m, "avatars/sh-infirmiere.glb?v=1", 1.72);   // (le Lying Figure ; Siam, le gros ; les infirmières des étages)
  M.shMonstres.push(m); return m; }
function pointSH(loin, essais = 400) {
  const L = M.L, Z = L.zone || [-20, 20, -130, 20], [ex, ez] = M.posEntree || [0, 0];
  for (let k = 0; k < essais; k++) { const x = Z[0] + Math.random() * (Z[1] - Z[0]), z = Z[2] + Math.random() * (Z[3] - Z[2]);
    if (!L.limites(x, z) || Math.hypot(x - ex, z - ez) < loin) continue; if (M.lieu === "sh-fetes" && z > 15) continue;
    const y = solSH(x, z); if (Math.abs(y) > 1.2) continue; return [x, z, y]; }
  return null; }
function lacherBetesSH() {
  const base = baseLieu(M.lieu), e = M.shEtape;
  if (base === "etage" && e >= 4) { for (let n = 1; n < ET.N; n++) for (let k = 0; k < 2; k++) {   /* (pas au rez-de-chaussée ; au milieu du couloir, jamais tout près de l'escalier où l'on arrive) */ const x = (k ? 1 : -1) * (.6 + Math.random() * 3.4); creerBeteSH(k % 2 ? "tuyau" : "infirmiere", x, -1.9, n * ET.H, n).portee = 7; }   /* (elles ne viennent qu'une fois qu'on s'est avancé dans le couloir) */ return; }   // (les infirmières : seulement dans les couloirs des étages)
  if (e < 4) return;
  if (base === "mess" && e >= 9) return;   /* (le mess, après le réveil au sous-sol : vide) */
  if (base === "mess") { for (let k = 0; k < 2; k++) { const q = pointSH(10); if (q) creerBeteSH("bras", q[0], q[1], q[2]); } { const q = pointSH(9); if (q) creerBeteSH("capuche", q[0], q[1], q[2]); } if (e >= 7 && e < 9) { const q = pointSH(11); if (q) { const ph = creerBeteSH("pyramid", q[0], q[1], q[2]); ph.portee = 60; ph.lentT = performance.now() + 4000; sirenePH(8000); } } return; }   /* (il est toujours là : la sirène prévient, et il met un moment à venir) */
  if (base === "fetes") { for (let k = 0; k < 2; k++) { const q = pointSH(8); if (q) creerBeteSH("bras", q[0], q[1], q[2]); } { const q = pointSH(8); if (q) creerBeteSH("capuche", q[0], q[1], q[2]); } return; }   /* (dans la salle, pas au bar) */
  const nb = Math.round(({ grande: 12, rue: e >= 10 ? 0 : 5 }[base] || 0) * (PETIT ? .6 : 1));   /* (les Lying Figures, un peu partout dehors ; moins sur un petit téléphone) */
  for (let k = 0; k < nb; k++) { const q = pointSH(12); if (q) creerBeteSH("capuche", q[0], q[1], q[2]); }   /* (dehors : seulement les monstres sans bras) */
  if (base === "grande" && C3.dojo) for (let k = 0; k < 2; k++) { const d = C3.dojo, x = d.X0 + 1.5 + Math.random() * (d.X1 - d.X0 - 3), z = d.Z0 + 1.5 + Math.random() * (d.Z1 - d.Z0 - 3); creerBeteSH("bras", x, z, C3.FL); } }   /* (et le gros, dans la salle de judo) */
function vivantSH(m) { return !m.mortT && m.g.visible; }
function monstresSHVises(ray) { const vv = (M.shMonstres || []).filter(m => !m.mortT && !m.cine && m.g.visible && (m.p ? m.p.corps : m.mesh));
  const h = ray.intersectObjects(vv.map(m => m.p ? m.p.corps : m.mesh))[0]; return h ? vv.find(m => (m.p ? m.p.corps : m.mesh) === h.object) : null; }
/* (au doigt, on visait mal : on tirait à côté, et le bonhomme marchait droit sur le monstre — maintenant, toucher près de lui suffit) */
function monstreSHPres(px, py, w, h) { const a = new THREE.Vector3(), b = new THREE.Vector3(); let best = null, bd = 1e9;
  for (const m of M.shMonstres || []) { if (m.mortT || m.cine || !m.g || !m.g.visible) continue;
    a.set(m.x, (m.y || 0) + .15, m.z).project(M.camera); b.set(m.x, (m.y || 0) + (m.H || 1.8), m.z).project(M.camera); if (a.z > 1 || b.z > 1) continue;
    const ax = (a.x + 1) / 2 * w, ay = (1 - a.y) / 2 * h, bx = (b.x + 1) / 2 * w, by = (1 - b.y) / 2 * h, vx = bx - ax, vy = by - ay, l2 = vx * vx + vy * vy || 1;
    const t = Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / l2)), d = Math.hypot(px - ax - vx * t, py - ay - vy * t), seuil = Math.max(46, Math.sqrt(l2) * .4);
    if (d < seuil && d < bd) { bd = d; best = m; } }
  return best; }
function tirerSH(m) { if (M && M.armeFP && M.premiere) M.armeFP.kick = 1;
  const moi = moiApo(); if (!moi || M.cine || M.shMort || m.mortT) return;
  if (!M.shArme) return;
  const dx0 = m.x - moi.g.position.x, dz0 = m.z - moi.g.position.z, d = Math.hypot(dx0, dz0) || 1; if (d > 22) { M.ctx.surInfo && M.ctx.surInfo("Trop loin… approche-toi."); return; }
  const dx = dx0 / d, dz = dz0 / d; moi.cible = null; moi.chemin = []; moi.tirT = performance.now(); if (M.L.interieur || M.L.suivi) M.yaw = Math.atan2(-dx, -dz);
  eclairDuCanon(moi, dx, dz); sonTir(); m.flashT = performance.now() + 160; sangAuSol(m.x, m.z, m.y, .9); if (m.lf) jetSang(m.x, m.y + 1.25, m.z);   /* (le Lying Figure : le sang gicle à l'impact) */
  if (m.imbattable) { m.lentT = performance.now() + 1800; return; }   // (Pyramid Head : on ne le tue pas, on le ralentit)
  if (m.boss) { m.hp--; m.lentT = performance.now() + 450; if (m.hp <= 0) { m.fige = true; m.cine = true; m.frappeT = 0; m.surMort && m.surMort(m); } return; }
  m.hp--; const nx = m.x + dx * .35, nz = m.z + dz * .35; if (limBeteSH(m, nx, nz)) { m.x = nx; m.z = nz; }
  if (m.hp <= 0) { m.mortT = performance.now(); sangAuSol(m.x, m.z, m.y, 1.6); if (m.p) { m.p.info.mortT = performance.now(); flaqueMort(m.p); } if (m.surMort) m.surMort(m); } }
/* Pyramid Head frappe : nous, si l'on est à portée ; ou un monstre qui passe trop près — d'un coup, il le coupe en deux */
/* le Lying Figure (le monstre sans bras de Silent Hill 2), en 3D : chaque monstre a sa copie du modèle, animée (repos, marche) ;
   en marchant, il laisse derrière lui une traînée noire, luisante, comme du goudron chaud ; touché, il saigne ; abattu, il tombe à genoux, puis face contre terre */
/* les brancards (un vieux brancard d'hôpital rouillé, un corps sous un drap) : une dizaine dans la salle des fêtes, et trois devant, dans la cour d'honneur — deux renversés ;
   du sang sur les draps (peint dans leur texture : il suit les plis), des flaques au sol, et les traces des roulettes qui sont passées dedans */
/* du sang réaliste : pas du rouge vif — un cœur presque noir, épais, des bords brun-rouge sombre qui ont séché plus foncés que le reste, des gouttes, et un reflet mouillé (matière brillante) */
/* deux caisses, l'une sur l'autre, contre la porte « BAR » du vestibule : on ne sort pas du bar par là — il faut monter l'escalier, à la salle des fêtes (les brancards) */
function lying3D(m, f, haut) { chargerBete3D(f).then(G => { if (!G || !M || !M.shMonstres.includes(m) || m.mortT || m.lf) return;
    const sc = skelMod.clone(G.scene); sc.traverse(o => { if (o.isMesh) { o.castShadow = true; o.frustumCulled = false; o.material = o.material.clone(); const mt = o.material; if (mt.map && mt.emissive) { mt.emissive.set(0xffffff); mt.emissiveMap = mt.map; mt.emissiveIntensity = .28; } } });
    const g = new THREE.Group(); g.add(sc); M.scene.add(g); sc.scale.setScalar(haut / (hauteurOs(sc) || 1.8)); g.userData.perso = true;
    const mix = new THREE.AnimationMixer(sc), act = {}; for (const c of G.animations) act[c.name] = mix.clipAction(c);
    m.lf = { sc, g, mix, act, cur: null, ry: Math.random() * 6.28, pas: 0, pied: 1 }; m.mesh.material.colorWrite = false; m.mesh.material.depthWrite = false; }); }
let texGoudron = null;
function goudron(x, y, z, ry) { M.goudron = M.goudronL === M.L ? M.goudron || [] : []; M.goudronL = M.L;
  if (!texGoudron) texGoudron = new THREE.CanvasTexture(toile(128, 128, (c, w, h) => { c.fillStyle = "#000"; for (let k = 0; k < 9; k++) { const a = Math.random() * 6.28, r = 12 + Math.random() * 30; c.beginPath(); c.ellipse(64 + Math.cos(a) * 22, 64 + Math.sin(a) * 30, r * .7, r, a, 0, 7); c.fill(); }
    c.fillStyle = "rgba(255,255,255,.18)"; for (let k = 0; k < 4; k++) { c.beginPath(); c.ellipse(50 + Math.random() * 28, 44 + Math.random() * 40, 5, 2.5, Math.random(), 0, 7); c.fill(); } }));   // (des flaques noires, et quelques reflets)
  M.matGoudron = M.matGoudron || new THREE.MeshStandardMaterial({ map: texGoudron, color: 0x0b0806, roughness: .1, metalness: .25, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3 });
  const o = new THREE.Mesh(M.geoGoudron = M.geoGoudron || new THREE.PlaneGeometry(.42, .62), M.matGoudron); o.rotation.set(-Math.PI / 2, 0, ry + (Math.random() - .5) * .5); o.position.set(x, y + .014 + M.goudron.length * .00002, z); M.scene.add(o); M.goudron.push(o);
  while (M.goudron.length > (PETIT ? 50 : 150)) M.scene.remove(M.goudron.shift()); }
function lyingAnim(m, now, dt) { const P = m.lf;
  if (P.g.parent !== M.scene) { m.lf = null; m.mesh.material.colorWrite = true; m.mesh.material.depthWrite = true; return; }
  P.g.visible = m.g.visible && !m.coupe; P.g.position.set(m.x, m.y, m.z); if (m.coupe) return;   // (coupé en deux par Pyramid Head : ce sont ses moitiés qu'on voit)
  if (m.mortT) {   // (à genoux, puis face contre terre ; il s'efface au bout de quelques secondes)
    mort3D({ info: { mortT: m.mortT }, g: P.g, corps: null }, P); const t = performance.now() - m.mortT;   // (l'horloge de la mort : performance.now, comme m.mortT)
    if (t > 6000) { const f = Math.max(0, 1 - (t - 6000) / 1500); P.sc.traverse(o => { if (o.isMesh) { o.material.transparent = true; o.material.opacity = f; } }); if (!f) { M.scene.remove(P.g); } } return; }
  const vx = m.x - (P.px ?? m.x), vz = m.z - (P.pz ?? m.z); P.px = m.x; P.pz = m.z; const dd = Math.hypot(vx, vz), v = dd / Math.max(.005, dt);
  if (v > .15) { let d = Math.atan2(vx, vz) - P.ry; d = Math.atan2(Math.sin(d), Math.cos(d)); P.ry += d * Math.min(1, dt * 5); } P.sc.rotation.y = P.ry;
  const n = v > .2 ? "walk" : "idle"; if (P.cur !== n && P.act[n]) { const a = P.act[n]; a.reset().play(); if (P.curA && P.curA !== a) a.crossFadeFrom(P.curA, .3, false); P.cur = n; P.curA = a; }
  if (P.curA && n === "walk") P.curA.timeScale = Math.max(.5, Math.min(1.3, v / 1.15)); P.mix.update(dt);
  // la traînée : un pas sur deux, du côté du pied qui se pose
  P.pas += dd; if (P.pas > .38 && m.g.visible && m.cle === "capuche") { P.pas = 0; P.pied = -P.pied; const c = Math.cos(P.ry), s2 = Math.sin(P.ry); goudron(m.x + c * .12 * P.pied, m.y, m.z - s2 * .12 * P.pied, P.ry); }
  const rouge = false;   /* (plus de clignotement rouge quand on le touche) */ if (P.rouge !== rouge) { P.rouge = rouge; P.sc.traverse(o => { if (o.isMesh && o.material.emissive) o.material.emissive.setHex(rouge ? 0xff3020 : 0xffffff); }); } }
/* Pyramid Head en 3D (le modèle de Silent Hill 2, animé comme les autres : repos, marche) : son grand couteau dans la main droite, traîné derrière lui ;
   il le lève par-dessus sa tête et l'abat, au rythme de frappePyr. Tant que le modèle n'est pas chargé, l'image plate reste */
let lamePyr3D = null, pyrA = null;
function pyramide3D(m) { const f = "avatars/sh-pyramid.glb?v=1";
  lamePyr3D = lamePyr3D || (async () => { gltfMod = gltfMod || await import("./vendor/GLTFLoader.js?v=1"); const g = await new gltfMod.GLTFLoader().loadAsync("avatars/sh-pyramid-lame.glb?v=1"); return g.scene; })().catch(() => null);
  Promise.all([chargerAvatar3D(f), lamePyr3D, chargerAnimsMX("anims/re-nemesis.json?v=3")]).then(([A, L3, AN]) => { if (!A || !M || !M.shMonstres.includes(m) || m.mortT) return;
    if (AN && !A.pyrMX) { A.pyrMX = true; for (const [n, c] of [["walk", "n-marche"], ["idle", "n-idle"], ["coup", "n-coup"]]) { const k = clipMXcible(AN, c, A.sc); if (k) { k.name = n; if (A.act[n]) A.act[n].stop(); A.act[n] = A.mix.clipAction(k); } }   /* (Pyramid Head : la marche, le repos et le coup de Nemesis) */
      if (A.act.coup) { A.act.coup.setLoop(THREE.LoopOnce); A.act.coup.clampWhenFinished = true; A.act.coup.timeScale = 1.5; } }
    if (!A.eclaire) { A.eclaire = true; A.sc.traverse(o => { if (o.isMesh) { o.castShadow = true; for (const mt of [].concat(o.material)) if (mt.map && mt.emissive) { mt.emissive.set(0xffffff); mt.emissiveMap = mt.map; mt.emissiveIntensity = .3; mt.needsUpdate = true; } } }); }
    for (const q of M.shMonstres) if (q !== m && q.ph3 && q.ph3.A === A) q.ph3 = null;   // (un seul modèle : au dernier venu)
    pyrA = A; A.sc.parent && A.sc.parent.remove(A.sc); M.scene.add(A.sc); A.sc.scale.setScalar(2.45 / A.h); A.sc.rotation.set(0, 0, 0); A.sc.visible = true;
    if (!A.lamePyr && L3) { A.lamePyr = new THREE.Group(); const l = L3.clone(); l.traverse(o => { if (o.isMesh) o.castShadow = true; }); A.lamePyr.add(l); A.sc.add(A.lamePyr); }
    A.sc.traverse(o => { if (o.isMesh) for (const mt of [].concat(o.material)) { mt.transparent = false; mt.opacity = 1; } });
    m.ph3 = { A, ry: Math.atan2((M.camera.position.x - m.x), (M.camera.position.z - m.z)), cur: null };
    m.mesh.material.colorWrite = false; m.mesh.material.depthWrite = false; if (m.lame) m.lame.visible = false; }); }
function pyr3D(m, now, dt, moi) { const P = m.ph3, A = P.A; if (!_v1) { _v1 = new THREE.Vector3(); _v2 = new THREE.Vector3(); _v3 = new THREE.Vector3(); _qa = new THREE.Quaternion(); _qb = new THREE.Quaternion(); }
  if (A.sc.parent !== M.scene) { m.ph3 = null; m.mesh.material.colorWrite = true; m.mesh.material.depthWrite = true; if (m.lame) m.lame.visible = true; return; }
  A.sc.visible = m.g.visible; A.sc.position.set(m.x, m.y, m.z);
  const vx = m.x - (P.px ?? m.x), vz = m.z - (P.pz ?? m.z); P.px = m.x; P.pz = m.z; const v = Math.hypot(vx, vz) / Math.max(.005, dt);
  // (tourné vers où il va ; s'il frappe, vers sa cible)
  const t = m.frappeT && (m.cineCible || moi) ? (m.cineCible ? { x: m.cineCible.x, z: m.cineCible.z } : { x: moi.g.position.x, z: moi.g.position.z }) : null;
  const vis = t ? Math.atan2(t.x - m.x, t.z - m.z) : v > .15 ? Math.atan2(vx, vz) : P.ry; let d = vis - P.ry; d = Math.atan2(Math.sin(d), Math.cos(d)); P.ry += d * Math.min(1, dt * 6); A.sc.rotation.y = P.ry;
  const kF = m.frappeT ? now - m.frappeT : -1, n = m.fige ? null : kF >= 0 && kF < 1600 && A.act.coup ? "coup" : v > .25 ? "walk" : "idle";
  if (n && P.cur !== n && A.act[n]) { const a = A.act[n]; a.reset().play(); if (P.curA && P.curA !== a) a.crossFadeFrom(P.curA, .3, false); P.cur = n; P.curA = a; }
  if (P.curA && n === "walk") P.curA.timeScale = Math.max(.5, Math.min(1.4, v / 1.1));   // (son pas lourd, lent)
  if (!m.fige) A.mix.update(dt); A.sc.updateMatrixWorld(true);
  // la frappe : le bras droit se lève par-dessus la tête, puis s'abat devant lui
  const fw = new THREE.Vector3(Math.sin(P.ry), 0, Math.cos(P.ry)), k = m.frappeT ? now - m.frappeT : -1, e = x => x * x * (3 - 2 * x);
  if (k >= 0 && k < 1500 && !A.act.coup) { let dir;
    if (k < 380) dir = new THREE.Vector3(0, -1, 0).lerp(new THREE.Vector3(0, 1, 0).addScaledVector(fw, -.35), e(k / 380));
    else if (k < 820) { const a = Math.PI * .5 + Math.PI * .72 * e((k - 380) / 440); dir = new THREE.Vector3(0, Math.sin(a), 0).addScaledVector(fw, -Math.cos(a)); }
    else dir = new THREE.Vector3(0, -.45, 0).addScaledVector(fw, .9).lerp(new THREE.Vector3(0, -1, 0), e(Math.min(1, (k - 820) / 680)));
    viser3D(A, "RightArm", "RightForeArm", dir); viser3D(A, "RightForeArm", "RightHand", dir); A.sc.updateMatrixWorld(true); }
  // le couteau : dans la main droite ; traîné, la pointe vers le sol derrière lui ; en frappant, dans le prolongement du bras
  const L = A.lamePyr, h = os3D(A, "RightHand"), fa = os3D(A, "RightForeArm"); if (L && h && fa) { h.getWorldPosition(_v1); fa.getWorldPosition(_v2); const bras = _v1.clone().sub(_v2).normalize();
    const dir = k >= 0 && k < 1500 ? bras : fw.clone().multiplyScalar(-.55).add(new THREE.Vector3(0, -.8, 0)).normalize();
    A.sc.worldToLocal(_v3.copy(_v1)); L.position.copy(_v3); L.scale.setScalar(1.05 / A.sc.scale.x);
    const xa = new THREE.Vector3(0, 1, 0).cross(dir); if (xa.lengthSq() < 1e-4) xa.set(1, 0, 0); xa.normalize(); const ya = dir.clone().cross(xa);
    A.sc.getWorldQuaternion(_qb); L.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(xa, ya, dir)).premultiply(_qb.invert()); }
  // arrêté net, puis effacé
  if (m.fige && m.fondu) { const f = Math.max(0, 1 - (now - m.fondu) / 1500); A.sc.traverse(o => { if (o.isMesh) for (const mt of [].concat(o.material)) { mt.transparent = true; mt.opacity = f; } }); if (!f) A.sc.visible = false; }
  // (touché : un éclair rouge)
  const rouge = false;   /* (plus de clignotement rouge quand on le touche) */ if (P.rouge !== rouge) { P.rouge = rouge; A.sc.traverse(o => { if (o.isMesh) for (const mt of [].concat(o.material)) if (mt.emissive) mt.emissive.setHex(rouge ? 0xff4030 : 0xffffff); }); } }
function frappePyr(m, now, dJ, moi) { const voisin = M.shMonstres.find(o => o !== m && !o.mortT && !o.p && Math.hypot(o.x - m.x, o.z - m.z) < 2.2);
  if (!m.frappeT && (dJ < 2.4 || voisin) && now > m.coupT) { m.frappeT = now; const dr = new THREE.Vector3().setFromMatrixColumn(M.camera.matrixWorld, 0), c = dJ < 2.4 && moi ? moi.g.position : voisin; m.cibleCote = ((c.x - m.x) * dr.x + (c.z - m.z) * dr.z) >= 0 ? 1 : -1; }
  if (!m.frappeT) return; const k = now - m.frappeT;
  if (k > 780 && !m.frappe) { m.frappe = true; if (dJ < 2.9) { subirSH(m.x, m.z, 2); sonBruit(.2, 600, .7); }
    for (const o of M.shMonstres) if (o !== m && !o.mortT && !o.p && Math.hypot(o.x - m.x, o.z - m.z) < 2.8) couperEnDeux(o, now, m); }
  if (k > 1600) { m.frappeT = 0; m.frappe = false; m.coupT = now + 600; m.cibleCote = 0; } }
// un monstre coupé en deux : le bas s'effondre, le haut est projeté et retombe ; du sang partout
function couperEnDeux(o, now, par) { o.mortT = now; o.flashT = now + 300; o.coupe = true; o.mesh.visible = false;
  const dr = new THREE.Vector3().setFromMatrixColumn(M.camera.matrixWorld, 0); o.coupeSens = ((o.x - par.x) * dr.x + (o.z - par.z) * dr.z) >= 0 ? 1 : -1;
  const P3 = o.p3, A3 = P3 ? P3.av3 : o.lf;   // (Angela, ou un Lying Figure)
  if (A3 && A3.sc.visible) {   // (en 3D — Angela : son corps, tel qu'il est à cet instant, coupé en deux à la taille)
    if (P3) P3.coupe3D = true; A3.sc.updateMatrixWorld(true); o.g.updateMatrixWorld(true); const inv = o.g.matrixWorld.clone().invert(), cut = o.mesh.scale.y * .5, v = new THREE.Vector3(), moities = [new THREE.Group(), new THREE.Group()];
    A3.sc.traverse(me => { if (!me.isMesh) return; const g = me.geometry, pos = g.attributes.position, n = pos.count, P2 = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) { if (me.isSkinnedMesh) me.getVertexPosition(i, v); else v.fromBufferAttribute(pos, i); v.applyMatrix4(me.matrixWorld).applyMatrix4(inv); P2[i * 3] = v.x; P2[i * 3 + 1] = v.y; P2[i * 3 + 2] = v.z; }
      const idx = g.index ? g.index.array : Array.from({ length: n }, (_, i) => i);
      for (const h of [0, 1]) { const I = []; for (let t = 0; t < idx.length; t += 3) { const yc = (P2[idx[t] * 3 + 1] + P2[idx[t + 1] * 3 + 1] + P2[idx[t + 2] * 3 + 1]) / 3; if ((yc >= cut) === (h === 1)) I.push(idx[t], idx[t + 1], idx[t + 2]); } if (!I.length) continue;
        const ng = new THREE.BufferGeometry(); ng.setAttribute("position", new THREE.BufferAttribute(h ? P2.map((x, k) => k % 3 === 1 ? x - cut : x) : P2.slice(), 3)); if (g.attributes.uv) ng.setAttribute("uv", g.attributes.uv); ng.setIndex(I); ng.computeVertexNormals();
        const mt = me.material.clone(); mt.transparent = true; mt.side = THREE.DoubleSide; moities[h].add(new THREE.Mesh(ng, mt)); } });
    moities[1].position.y = cut; moities.forEach(m => o.g.add(m)); o.moities = moities; A3.sc.visible = false; }
  else o.moities = [0, 1].map(h => { const g = new THREE.PlaneGeometry(1, .5); g.translate(0, .25, 0); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setY(i, uv.getY(i) * .5 + h * .5);
    const mt = o.mesh.material.clone(); const me = new THREE.Mesh(g, mt); me.scale.copy(o.mesh.scale); me.position.y = h * o.mesh.scale.y * .5; o.g.add(me); return me; });
  sangAuSol(o.x, o.z, o.y, 2.2); sangAuSol(o.x + o.coupeSens * .8, o.z, o.y, 1.4); for (let k = 0; k < 3; k++) setTimeout(() => M && jetSang(o.x, o.y + o.H * .5, o.z), k * 120); sonBruit(.3, 450, .7); }
/* un pas de monstre : tout droit si c'est libre (le pas, et un peu plus loin devant) ; sinon il contourne, toujours du même côté tant qu'il est gêné ; jamais à travers un meuble ou un mur */
function avancerBete(m, ux, uz, pas) {
  if (!limBeteSH(m, m.x, m.z)) { if (baseLieu(M.lieu) !== "etage") { const pl = placeLibre(m.x, m.z); if (pl) { m.x = pl[0]; m.z = pl[1]; } } return; }   /* (pris dans un obstacle : on le remet à côté) */
  const essai = a => { const c = Math.cos(a), s2 = Math.sin(a), vx = ux * c - uz * s2, vz = ux * s2 + uz * c, nx = m.x + vx * pas, nz = m.z + vz * pas;
    return limBeteSH(m, nx, nz) && limBeteSH(m, m.x + vx * .45, m.z + vz * .45) ? [nx, nz] : null; };
  const sens = m.contour || (Math.random() < .5 ? 1 : -1);
  for (const a of [0, .5, -.5, 1, -1, 1.5, -1.5, 2.1, -2.1]) { const r = essai(a * sens); if (r) { m.x = r[0]; m.z = r[1]; m.contour = a ? sens : 0; return; } }
  m.contour = -sens; }
const limBeteSH = (m, x, z) => baseLieu(M.lieu) === "etage" ? Math.abs(x) < ET.CX0 + .5 && z > -2.75 && z < -1.05 : M.L.limites(x, z) && (m.y == null || m.p || !M.L.hauteur || Math.abs(hNiv(M.L, x, z, m.y) - m.y) < .5);   // (comme les zombies : à son niveau, sans traverser murs ni plafonds)
function subirSH(x, z, deg = 1) {
  const moi = moiApo(); if (!moi || M.cine || M.shMort || performance.now() < (M.shDegT || 0)) return; M.shDegT = performance.now() + 1100;
  M.shVies = Math.max(0, M.shVies - deg); M.shPerte = (M.shPerte || 0) + deg; if (M.shPerte >= 2 && M.shVies > 0) { M.shPerte = 0; poserFlaconSH(); }   /* (deux cœurs perdus : un flacon, pas loin) */ M.ctx.surApoFlash && M.ctx.surApoFlash(); sonBruit(.12, 900, .4);
  const dx = moi.g.position.x - x, dz = moi.g.position.z - z, d = Math.hypot(dx, dz) || 1;
  for (let k = .9; k > .1; k -= .2) { const nx = moi.g.position.x + dx / d * k, nz = moi.g.position.z + dz / d * k; if (M.L.limites(nx, nz)) { moi.g.position.x = nx; moi.g.position.z = nz; break; } }
  moi.cible = null; moi.chemin = []; envoyerWS({ t: "aller", x: moi.g.position.x, z: moi.g.position.z });
  if (M.shVies <= 0) mortSH(); majHudApo(); }
// la mort : on tombe, le sang, l'écran rouge… et l'on se réveille dans la vraie caserne, en 1990
function mortSH(titre = "TU ES MORT") { const moi = moiApo(); if (!moi || M.shMort) return; M.shMort = true; M.shVies = 0; moi.info.mortT = performance.now(); moi.cible = null; moi.chemin = [];
  if (titre === "TU ES MORT") flaqueMort(moi); for (let k = 0; k < 4; k++) setTimeout(() => M && jetSang(moi.g.position.x, moi.g.position.y + .7, moi.g.position.z), k * 220);
  const r = voile("background:radial-gradient(circle,rgba(120,0,0,.55) 0%,rgba(150,0,0,.95) 100%);opacity:0;transition:opacity 1.6s;display:grid;place-items:center;font:900 clamp(30px,8vw,64px)/1 'Marcellus',serif;color:#ffd9d0;letter-spacing:.12em;text-shadow:0 0 20px #000");
  r.textContent = titre; setTimeout(() => { r.style.opacity = "1"; }, 1500);   /* (d'abord, on le voit tomber : à genoux, puis face contre terre ; ensuite, le rouge) */
  { const mp = moi.g.position, a = (M.yaw || 0) + .9; if (M.passerBtn) { M.passerBtn.remove(); M.passerBtn = null; } M.cine = { maj: now => { const k = Math.min(1, (now - moi.info.mortT) / 2500); M.camera.position.set(mp.x + Math.sin(a) * (2.6 - k * .5), mp.y + 1.5 - k * .3, mp.z + Math.cos(a) * (2.6 - k * .5)); M.camera.lookAt(mp.x, mp.y + .5 - k * .3, mp.z); } }; }
  setTimeout(() => { if (!M) return; finCine(); const G = M.gresil; M.gresil = null; couperGresil(G); r.style.transition = "opacity 2s"; resetSH(); M.flaques = []; changerLieu("fetes", [0, 26.5], 0);   /* (on se réveille au bar, comme à la fin du film) */
    setTimeout(() => { r.style.opacity = "0"; setTimeout(() => r.remove(), 2100); }, 500); M.ctx.surInfo && M.ctx.surInfo("💀 Silent Hill t'a eu… Te revoilà dans la caserne, en 1990."); }, 4200); }
// les monstres, à chaque image : ils rôdent ; de près, ils nous poursuivent et frappent
function animerBetesSH(now, dt) {
  const moi = moiApo(), cam = M.camera.position, etg = baseLieu(M.lieu) === "etage"; let proche = 99;
  if (pyrA && pyrA.sc.visible && !M.shMonstres.some(q => q.ph3)) pyrA.sc.visible = false;   // (Pyramid Head parti : son modèle ne reste pas planté là)
  const mar = M.shEscorte && M.gens.get(SHN.maria), mar2 = mar && !mar.info.mortT && !mar.part ? mar : null;
  for (const m of M.shMonstres) { const mar = mar2; const memeEtage = !etg || !moi || etageDe(moi) === m.n;
    if (m.p) { if (!M.gens.has(m.p.info.numero)) continue; m.g = m.p.g; }
    else m.g.visible = memeEtage;
    /* (pendant une cinématique ou une conversation : les monstres qui n'en font pas partie s'effacent, et attendent — on ne voyait qu'eux, derrière Lisa) */
    const horsScene = M.cine && !m.cine && !m.mortT && !m.p && !m.statique; if (horsScene) m.g.visible = false;
    if (m.ph3) pyr3D(m, now, horsScene ? 0 : dt, moi);   /* (Pyramid Head en 3D : d'après sa position à l'image d'avant) */
    if (m.lf) lyingAnim(m, now, dt);   /* (le Lying Figure en 3D) */
    if (horsScene) continue;
    if (m.statique && !m.mortT) continue;   /* (une personne, que Pyramid Head vise : elle reste un bonhomme) */
    if (m.fige && m.fondu) { const f = Math.max(0, 1 - (now - m.fondu) / 1500); m.mesh.material.transparent = true; m.mesh.material.opacity = f; m.lame.traverse(o => { if (o.material) { o.material.transparent = true; o.material.opacity = f; } }); if (!f) m.g.visible = false; }
    if (m.fige) { if (m.lame) { m.lame.rotation.z = .3; m.g.scale.x = -(m.sens || 1); } continue; }   /* (Pyramid Head, arrêté net) */
    if (m.mortT && m.coupe) { const u = (now - m.mortT) / 1000, [bas, haut] = m.moities, H = m.mesh.scale.y, fd = now - m.mortT > 6000 ? Math.max(0, 1 - (now - m.mortT - 6000) / 1500) : 1;
      /* (le bas reste debout un instant, puis s'écroule sur le côté ; le haut est projeté, tourne, et retombe couché) */
      const e2 = t => t * t * (3 - 2 * t); bas.rotation.z = -m.coupeSens * Math.PI / 2 * .95 * e2(Math.max(0, Math.min(1, (u - .45) / .5)));
      const tv = Math.min(u, .62), yv = Math.max(m.W * .12, H * .5 + 1.5 * tv - 4.9 * tv * tv);
      haut.position.set(m.coupeSens * tv * 2.4, yv, 0); haut.rotation.z = m.coupeSens * Math.min(1, u / .62) * Math.PI / 2 * 1.02;
      for (const h of [bas, haut]) h.traverse(q => { if (q.material) q.material.opacity = fd; }); m.g.position.set(m.x, m.y, m.z); m.g.rotation.y = Math.atan2(cam.x - m.x, cam.z - m.z); continue; }
    if (m.mortT) { if (!m.p) { const f = Math.min(1, (now - m.mortT) / 550); m.mesh.rotation.x = -f * Math.PI / 2 * .97; m.mesh.material.opacity = now - m.mortT > 6000 ? Math.max(0, 1 - (now - m.mortT - 6000) / 1500) : 1; } continue; }
    const u = now / 1000 + m.ph; let dx = 0, dz = 0, d = 99;
    if (moi && memeEtage) { dx = moi.g.position.x - m.x; dz = moi.g.position.z - m.z; d = Math.hypot(dx, dz) || 1; if (Math.abs(moi.g.position.y - m.y) > 2.2 && !etg) d = 99; }
    let surMaria = false; if (mar && !m.p && !m.imbattable && Math.abs(mar.g.position.y - m.y) < 2.2) { const ex = mar.g.position.x - m.x, ez = mar.g.position.z - m.z, de = Math.hypot(ex, ez) || 1; if (de < d) { dx = ex; dz = ez; d = de; surMaria = true; } }   /* (Maria, qu'on escorte : elle est une proie aussi) */
    if (m.cineCible) { const t = m.cineCible, ex = t.x - m.x, ez = t.z - m.z, de = Math.hypot(ex, ez) || 1; if (!t.mortT && de > 1.8 && !m.frappeT) avancerBete(m, ex / de, ez / de, 1.6 * dt); else if (!t.mortT || m.frappeT) frappePyr(m, now, 99, moi); }
    else if (!M.cine && !m.cine && !M.shMort && d < (m.portee || 14)) {
      const v = m.v * (now < m.lentT ? .2 : 1) * (m.cle === "infirmiere" || m.cle === "tuyau" ? (Math.sin(u * 5) > .2 ? 1.25 : .25) : 1);
      if (m.lame) frappePyr(m, now, d, moi);
      if (m.lame && m.frappeT) {}
      else if (d > (m.lame ? 1.4 : .8)) { avancerBete(m, dx / d, dz / d, v * dt); }
      else if (!m.lame && now > m.coupT) { m.coupT = now + 1300; if (surMaria) blesserMaria(m.x, m.z); else subirSH(m.x, m.z); } }
    else if (!m.p && !m.cine) { const ox = Math.sin(u * .4) * .25 * dt, oz = Math.cos(u * .33) * .25 * dt; if (limBeteSH(m, m.x + ox, m.z + oz)) { m.x += ox; m.z += oz; } }
    if (m.cle === "eddie" && m.p && m.p.poses && !m.mortT) { const pr = m.p, k = (now - (m.ph || 0)) % 760, frappe = !M.cine && !m.cine && d < 3;
      const map = frappe ? (k < 380 ? pr.poses.haut : pr.poses.tir) : null; if (map && pr.corps && pr.corps.material.map !== map) { pr.corps.material.map = map; pr.corps.material.needsUpdate = true; } }   /* (le couteau levé, puis planté devant lui) */
    if (m.couteau) { const dr = new THREE.Vector3().setFromMatrixColumn(M.camera.matrixWorld, 0); m.couteau.position.set(dr.x * .34, .95 + Math.sin(now / 160) * .04, dr.z * .34); m.couteau.material.rotation = -.5 + (now < m.coupT - 1000 ? 1.2 : 0); }
    if (m.p) { m.p.g.position.x = m.x; m.p.g.position.z = m.z; m.y = m.p.g.position.y; if (m.p.corps && m.p.corps.material) m.p.corps.material.color.setRGB(1, 1, 1); }
    else { if (!etg) { const y = M.L.hauteur ? M.L.hauteur(m.x, m.z, { g: { position: { y: m.y } } }) : 0; m.y = y; }
      m.g.position.set(m.x, m.y, m.z); m.g.rotation.y = Math.atan2(cam.x - m.x, cam.z - m.z);
      m.mesh.rotation.z = m.cle === "infirmiere" || m.cle === "tuyau" ? (Math.sin(u * 13) > .85 ? Math.sin(u * 40) * .12 : 0) : Math.sin(u * 1.1) * .06;
      m.mesh.material.color.setHex(0xd8d4cc); if (m.bras) m.bras.material.color.copy(m.mesh.material.color);
      if (m.lame) {   /* le sens de sa marche, vu de la caméra : l'épée traîne derrière lui, bras en arrière ; il frappe en la ramenant par-dessus, de l'arrière vers l'avant */
        const dr = new THREE.Vector3().setFromMatrixColumn(M.camera.matrixWorld, 0), vx = m.x - (m.lx ?? m.x), vz = m.z - (m.lz ?? m.z); m.lx = m.x; m.lz = m.z;
        const vs = vx * dr.x + vz * dr.z; if (Math.abs(vs) > .002) m.sens = vs > 0 ? 1 : -1; if (m.frappeT && m.cibleCote) m.sens = m.cibleCote; const sg = m.sens || 1;
        const TR = .12, AV = .95, k = m.frappeT ? now - m.frappeT : -1, e = t => t * t * (3 - 2 * t);
        const th = k < 0 ? TR + Math.sin(now / 520) * .03   /* (traînée, la pointe au sol, derrière lui) */
          : k < 380 ? TR + .35 * e(k / 380)   /* (il arme : le bras part encore en arrière) */
          : k < 820 ? TR + .35 + (2 * Math.PI - AV - TR - .35) * e((k - 380) / 440)   /* (le grand demi-cercle, de l'arrière, par-dessus la tête, jusque devant) */
          : k < 1500 ? -AV + (TR + AV) * e((k - 820) / 680) : TR;   /* (et l'épée repasse dessous, derrière lui) */
        m.lame.rotation.z = th; m.g.scale.x = -sg; } }   /* (l'image est retournée pour que son bras soit toujours du côté d'où il vient : le bras tourne à l'épaule, l'épée suit la main) */
    if (memeEtage) proche = Math.min(proche, d); }
  M.shProche = proche; }
// les cartons au sol : poussés par qui passe dessus (nous, les autres, les monstres) ; jamais dans un mur
/* les personnages qui marchent ne nous traversent pas : si notre bonhomme est sur leur chemin, ils font un détour par le côté libre */
function contournerSH() { const moi = M.gens.get(M.moiNum); if (!moi) return; const m = moi.g.position;
  for (const num of Object.values(SHN)) { const p = M.gens.get(num); if (!p || !p.cible || p.detour === p.cible) continue; const a = p.g.position, c = p.cible;
    if (Math.abs(a.y - m.y) > 1.5) continue; const vx = c.x - a.x, vz = c.z - a.z, L2 = vx * vx + vz * vz; if (L2 < .01) continue;
    const k = Math.max(0, Math.min(1, ((m.x - a.x) * vx + (m.z - a.z) * vz) / L2)), qx = a.x + vx * k, qz = a.z + vz * k, dq = Math.hypot(m.x - qx, m.z - qz);
    if (dq > .85 || k <= 0 || k >= 1) continue;   /* (le chemin ne passe pas sur nous) */
    const L = Math.sqrt(L2), nx = -vz / L, nz = vx / L, cote = (m.x - a.x) * nx + (m.z - a.z) * nz > 0 ? -1 : 1;   /* (on passe du côté opposé) */
    let wp = null; for (const sg of [cote, -cote]) for (const r of [1.1, .9, 1.4]) { const x = m.x + nx * sg * r, z = m.z + nz * sg * r; if (!wp && M.L.limites(x, z)) wp = [x, z]; }
    if (!wp) continue; const v = new THREE.Vector3(wp[0], a.y, wp[1]); p.chemin = [c, ...(p.chemin || [])]; p.cible = v; p.detour = v; } }
/* Alessa tombe : la sirène retentit, le brouillard nous enveloppe… et l'on se réveille au sous-sol du mess */
function cineSireneBas() { if (!M || !M.L.sh) return; const moi = moiApo(); if (!moi) return; moi.cible = null; moi.chemin = []; const sir = new Audio("sons/sh-sirene.mp3"); sir.volume = 1; sir.play().catch(() => {});
  const t0 = performance.now(), sc = M.scene, f0 = sc.fog ? [sc.fog.near, sc.fog.far] : null; let blanc = null, fini = false, u = 0, prec = t0;
  const fin = () => { if (fini || !M) return; fini = true; finCine(); if (!blanc) blanc = voile("background:#d9d8d4;opacity:1"); M.shReveilBas = true; M.sireneA = sir; changerLieu("sh-mess", M.L.pieceBas || [-8, 18], 0); setTimeout(() => blanc && blanc.remove(), 500); };
  M.passerBtn = boutonPasser(fin); bulle("<i>…la sirène…</i>", 2400);
  M.cine = { maj: now => { u += Math.min(.05, Math.max(0, now - prec) / 1000); prec = now; const p = moi.g.position; M.camera.position.set(p.x + 1.4, p.y + 1.7, p.z + 2.2); M.camera.lookAt(p.x, p.y + 1.1, p.z);
    if (sc.fog) { const k = Math.min(1, u / 5); sc.fog.color.setHex(0xd9d8d4); sc.fog.near = (1 - k) * (f0 ? f0[0] : 2); sc.fog.far = 1.5 + (1 - k) * 20; sc.background = sc.fog.color; }
    if (u > 4.5 && !blanc) { blanc = voile("background:#d9d8d4;opacity:0;transition:opacity 2s"); requestAnimationFrame(() => blanc.style.opacity = "1"); }
    if (u > 7) fin(); } }; }
function cineReveilBas(essai = 0, noir = null) { if (!M) return; noir = noir || voile("background:#d9d8d4;opacity:1;transition:opacity 4s");
  if (!estSH(M.lieu)) { noir.remove(); return; }
  const moi = M.gens.get(M.moiNum); if (!moi) { if (essai < 60) setTimeout(() => cineReveilBas(essai + 1, noir), 100); else noir.remove(); return; }
  moi.nivMess = 1; moi.info.mortT = performance.now() - 2000; const p = moi.g.position;
  /* (au milieu de la pièce du bas : la place était demandée à l'étage qu'on quittait, qui ne la connaît pas — on se réveillait dans le mur de la cuisine) */
  if (M.L.pieceBas) { const [bx, bz] = placeLibre(...M.L.pieceBas) || M.L.pieceBas; p.x = bx; p.z = bz; if (M.L.yNiv) p.y = M.L.yNiv(1); moi.cible = null; moi.chemin = []; envoyerWS({ t: "aller", x: bx, z: bz }); } requestAnimationFrame(() => { noir.style.opacity = "0"; }); setTimeout(() => noir.remove(), 4200);
  { const s2 = M.sireneA; if (s2) { const t1 = performance.now(), baisse = () => { if (!M || M.sireneA !== s2) return; const k = (performance.now() - t1) / 5000; if (k >= 1) { s2.pause(); M.sireneA = null; return; } s2.volume = 1 - k; requestAnimationFrame(baisse); }; baisse(); } }
  let leve = false, fini = false, u = 0, prec = performance.now();
  const fin = () => { if (fini || !M) return; fini = true; moi.info.mortT = 0; finCine(); placerCamera(true); M.shEtape = 10; setTimeout(() => M && lauraBas(), 600); };
  M.passerBtn = boutonPasser(fin);
  M.cine = { maj: now => { u += Math.min(.05, Math.max(0, now - prec) / 1000); prec = now; const h = u < 3 ? .35 : .35 + Math.min(1, (u - 3) / 1.5) * 1.25; M.camera.position.set(p.x + .9, p.y + h, p.z + 1.4); M.camera.lookAt(p.x, p.y + (u < 3 ? .2 : .9), p.z - .5);
    if (u > 3 && !leve) { leve = true; moi.info.mortT = 0; bulle("<i>… Encore ce brouillard… Où suis-je, cette fois ?</i>", 2600); } if (u > 6) fin(); } }; }
/* la rue du Faubourg-Poissonnière : Angela, à la ramasse ; Pyramid Head la coupe en deux, puis vient pour nous (24 balles) ;
   il s'arrête net, James sort du brouillard ; plus haut dans la rue, un passage de lumière blanche… et Maria */
const RUE_PASSAGE = [40, 0];
/* une place à quelques pas, d'où l'on se voit : sans grille ni mur entre nous (on essaie d'abord du côté voulu) */
function placeEnVue(mp, d, ax, az) { const a0 = Math.atan2(ax, az), vu = (x, z) => { const n = Math.ceil(Math.hypot(x - mp.x, z - mp.z) / .25); for (let i = 1; i <= n; i++) if (!M.L.limites(mp.x + (x - mp.x) * i / n, mp.z + (z - mp.z) * i / n)) return false; return true; };
  for (const dd of [d, d * .75, d * .5]) for (let k = 0; k < 24; k++) { const a = a0 + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * Math.PI / 12, x = mp.x + Math.sin(a) * dd, z = mp.z + Math.cos(a) * dd; if (vu(x, z)) return [x, z]; }
  return [mp.x + ax * d, mp.z + az * d]; }
function rueFinale(now, moi) { const e = M.shEtape, mp = moi.g.position, nom = prenomSH();
  if (e === 10) {
    /* (on est sorti par la petite porte de la grille : sur le trottoir, devant — de derrière la grille, on ne voyait rien de la scène) */
    { const t = placeLibre(mp.x, mp.z + 6); if (t) { mp.x = t[0]; mp.z = t[1]; } moi.cible = null; moi.chemin = []; envoyerWS({ t: "aller", x: mp.x, z: mp.z }); }
    const pa = apparaitreSH(poserPerso(SHN.angela, ...placeEnVue(mp, 5.5, .6, .8), 0));   /* (dans la rue, en vue : elle était souvent cachée derrière la grille) */ if (!pa) return; M.shEtape = 11; noterCarteSH(SHN.angela, 0, 29);
    let pyr = null, vic = null; const sortir = () => { if (pyr) return; const ax = pa.g.position.x - mp.x, az = pa.g.position.z - mp.z, al = Math.hypot(ax, az) || 1, q = placeLibre(pa.g.position.x + ax / al * 1.6, pa.g.position.z + az / al * 1.6) || viserLibre(pa.g.position.x + 1.6, pa.g.position.z);   /* (il sort du brouillard juste derrière elle : pas trois secondes de marche — il frappe tout de suite) */ pyr = creerBeteSH("pyramid", q[0], q[1], 0); pyr.cine = true; pyr.portee = 60; pyr.boss = true; pyr.imbattable = false; pyr.hp = 24; brumeSH({ x: q[0], y: 0, z: q[1] }, 4500); musiquePyramid(true);
      vic = { cle: "angela", p: null, p3: pa, g: pa.g, mesh: pa.corps, x: pa.g.position.x, z: pa.g.position.z, y: 0, n: 0, v: 0, hp: 1, ph: 0, W: pa.corps.scale.x, H: pa.corps.scale.y, mortT: 0, coupT: 0, lentT: 0, flashT: 0, cine: true, statique: true }; M.shMonstres.push(vic); pyr.cineCible = vic; M.shRegard = pa.g.position;
      pyr.surMort = () => setTimeout(() => M && jamesFin(pyr), 1800); };
    dialogueSH(SHN.angela, [[null, null, 1600], [SHN.angela, "TOI ! Je te reconnais… c'est toi !"], ["moi", "Angela ? Calme-toi… Qu'est-ce qui se passe ?"], [SHN.angela, "Tu sais où elle est ! Tu sais où est ma maman ! Tu l'as toujours su !"],
      ["moi", "Mais non… je ne comprends rien, je te jure."], [SHN.angela, "Menteur ! Ils mentent tous ! Le couteau… le feu… tout brûle, ici, tout le temps…"], [SHN.angela, "Pourquoi tu me regardes comme ça ?! ARRÊTE DE ME REGARDER !"],
      geste(() => { musiqueRencontre(false); sirenePH(10000); }), ["moi", "Cette sirène… Non…", 3600], geste(sortir), [null, null, 5200], geste(() => { M.shRegard = null; }), ["moi", "Non… pas lui… pas maintenant."], [null, null, 600]],   /* (la musique de la rencontre s'efface quand la sirène retentit, avant le thème de Pyramid Head) */
      () => { sortir(); pyr.cine = false; pyr.cineCible = null; pyr.lentT = performance.now() + 2500;   /* (il est tout près, maintenant : un instant de répit, le temps de lever l'arme) */ if (vic && !vic.mortT) couperEnDeux(vic, performance.now(), pyr); }, {}); return; }
  // le passage de lumière, plus haut dans la rue
  if (e >= 12 && !M.L.passage) { const g = new THREE.Group(), [x, z] = RUE_PASSAGE; g.position.set(x, 0, z); M.scene.add(g);
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 4.2), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .95, fog: false, side: THREE.DoubleSide })); pl.position.y = 2.1; pl.rotation.y = Math.PI / 2; g.add(pl);
    const hal = new THREE.Sprite(new THREE.SpriteMaterial({ map: texFlocon(), color: 0xffffff, transparent: true, depthWrite: false, depthTest: false, fog: false, blending: THREE.AdditiveBlending, opacity: .9 })); hal.renderOrder = 3; hal.scale.set(9, 9, 1);   /* (sans test de profondeur : le halo coupait la porte en travers, un triangle de lumière et un triangle sombre) */ hal.position.y = 2.1; g.add(hal);
    const lu = new THREE.PointLight(0xffffff, 18, 18, 1.4); lu.userData.sh = true; lu.position.set(-1, 2, 0); g.add(lu); M.L.passage = g; }
  if (M.L.passage) M.L.passage.children[1].material.opacity = .75 + Math.sin(now / 500) * .15;
  if (e === 12 && Math.hypot(mp.x - RUE_PASSAGE[0], mp.z - RUE_PASSAGE[1]) < 10) { M.shEtape = 13;
    const pm = apparaitreSH(poserPerso(SHN.maria, RUE_PASSAGE[0] - 3, RUE_PASSAGE[1] + 1.5, 0)); noterCarteSH(SHN.maria, 0, 29);
    dialogueSH(SHN.maria, [[null, null, 1600], [SHN.maria, `${nom}… Tu t'en vas ?`], ["moi", "Heather m'attend, de l'autre côté. Je vais la rejoindre."], [SHN.maria, "Non. Tu dois rester ici. Ta place est ici, avec moi… pas là-bas."],
      ["moi", "Ce n'est pas ma place, Maria. Ma place est auprès de ma fille."], [SHN.maria, "Tu peux bien traverser cette lumière… le brouillard finira par te ramener. Il ramène toujours ceux qui lui appartiennent."],
      ["moi", "Tu n'es pas réelle. James avait raison."], [SHN.maria, `Réelle… Qu'est-ce que ça change ? Je suis là. Ta place est ici, ${nom}. Tu le sais.`], ["moi", "Adieu, Maria."],
      [SHN.maria, "…Tu reviendras. Le brouillard te ramènera. Il ramène toujours."], [null, null, 800]],
      () => { evanouirSH(SHN.maria, null, 400); passageFin(); }); } }
function jamesFin(pyr) { const moi = moiApo(); if (!moi || !M.L.sh) return; if (M.cine) { setTimeout(() => M && jamesFin(pyr), 800); return; } musiquePyramid(false); moi.cible = null; moi.chemin = [];
  /* (vaincu, il se dissout dans le brouillard, sous nos yeux ; alors seulement James arrive) */
  pyr.fondu = pyr.fondu || performance.now(); brumeSH({ x: pyr.x, y: 0, z: pyr.z }, 3500);
  const mp = moi.g.position, c0 = new THREE.Vector3(mp.x + (mp.x - pyr.x) * .35 + 1.2, mp.y + 1.9, mp.z + (mp.z - pyr.z) * .35 + 1.2); let u = 0, prec = performance.now(), fini = false;
  const suite = () => { if (fini) return; fini = true; finCine(); jamesArrive(pyr); }; M.passerBtn = boutonPasser(suite);
  M.cine = { maj: now => { u += Math.min(.05, Math.max(0, now - prec) / 1000); prec = now; M.camera.position.copy(c0); M.camera.lookAt(pyr.x, 1.5, pyr.z); if (u > 3) suite(); } }; }
function jamesArrive(pyr) { const moi = moiApo(); if (!moi || !M.L.sh) return; const mp = moi.g.position, nom = prenomSH();
  const pj = apparaitreSH(poserPerso(SHN.james, ...placeEnVue(mp, 3.6, -.9, .4), 0)); noterCarteSH(SHN.james, 0, 29);
  const derriere = () => { const j = M.gens.get(SHN.james); if (j) j.regardeA = new THREE.Vector3(j.g.position.x * 2 - mp.x, 0, j.g.position.z * 2 - mp.z); };   /* (il regarde derrière lui, d'où vient la sirène) */
  const partir = d => { const j = M.gens.get(SHN.james); if (j) j.regardeA = null; evanouirSH(SHN.james, j ? [j.g.position.x * 2 - mp.x, j.g.position.z * 2 - mp.z] : [mp.x - 8, mp.z], d, 1.4); };
  dialogueSH(SHN.james, [[null, null, 1800], [SHN.james, `${nom} ! Tu es vivant…`], [SHN.james, "Je l'ai retrouvée. Mary. Elle m'attendait, là où on allait autrefois."],
    [SHN.james, "Elle m'a dit que tu étais la clé. Que grâce à toi, je pourrais enfin vivre… libéré du passé. Et de ce que j'ai fait."], ["moi", "Qu'est-ce que tu as fait, James ?"],
    [SHN.james, "Ça n'a plus d'importance. Toi, tu dois partir. Maintenant. Plus haut dans la rue, il y a une lumière… un passage."], [SHN.james, "Prends cette sortie, et tu rejoindras Heather. Elle t'attend, de l'autre côté."],
    ["moi", "Heather… Elle est là-bas ? Elle est vivante ?"], [SHN.james, "Elle t'attend. Remonte la rue, et ne te retourne pas."], ["moi", "Merci, James. Pour tout."],
    geste(() => sirenePH(11000)), [null, null, 2600], geste(derriere), [SHN.james, "…Cette sirène. Il revient déjà.", 2800],
    geste(() => { const j = M.gens.get(SHN.james); if (j) j.regardeA = null; }), [SHN.james, `Dépêche-toi, ${nom} ! Cours vers la lumière. Je vais le retarder, le temps qu'il faudra.`],
    ["moi", "James, viens avec moi !"], [SHN.james, "Non. Ma place est ici, avec elle. VA !"], geste(() => partir(500), true), [null, null, 2000]],
    () => { pyr.fondu = pyr.fondu || performance.now(); partir(0); M.shEtape = 12; }); }
// le passage : on y marche, la lumière nous prend… et l'on se réveille en 1990, dans le bar. Fin
function passageFin() { const moi = moiApo(); if (!moi) return; const [x, z] = RUE_PASSAGE; moi.cible = new THREE.Vector3(x, 0, z); moi.chemin = []; moi.info.allure = .5; moi.regardeA = null;
  let u = 0, prec = performance.now(), blanc = null, fini = false; const mp = moi.g.position, dits = new Set(), D = (k, f) => { if (!dits.has(k)) { dits.add(k); f(); } };
  /* (derrière lui, à hauteur d'épaule : il marche vers la lumière ; il entend la voix de sa fille, qui l'appelle) */
  M.cine = { maj: now => { u += Math.min(.05, Math.max(0, now - prec) / 1000); prec = now; const vx = x - mp.x, vz = z - mp.z, vl = Math.hypot(vx, vz) || 1;
    M.camera.position.set(mp.x - vx / vl * 2.6 + vz / vl * .7, mp.y + 1.75, mp.z - vz / vl * 2.6 - vx / vl * .7); M.camera.lookAt(x, 1.7, z);
    if (u > 1.2) D("a", () => bulle("<i>« Papa… ? Papa, c'est toi… ? »</i>", 3000));
    if (u > 4.4) D("b", () => dire(M.moiNum, "Heather… ? HEATHER ! J'arrive !"));
    if (u > 7.4) D("c", () => bulle("<i>« Papa ! Je suis là… viens… »</i>", 3000));
    if (u > 8.4 && !blanc) { blanc = voile("background:#fff;opacity:0;transition:opacity 2.8s"); requestAnimationFrame(() => blanc.style.opacity = "1"); }   /* (la lumière l'avale) */
    if (u > 11.6 && !fini) { fini = true; moi.info.allure = 1; finCine(); bulle(null); M.shFinale = blanc; changerLieu("sh-fetes", [0, 26.5], 0); } } }; }
/* le réveil, une dernière fois : allongé par terre, dans le bar de Silent Hill ; Maria, debout, le regarde… « Ils reviennent tous. » Le noir, le titre, FIN ; et le bar de 1990 */
function cineFinale(blanc) { if (!M) return; const moi = M.gens.get(M.moiNum); if (!moi) { setTimeout(() => cineFinale(blanc), 150); return; } const nom = prenomSH();
  blanc = blanc || voile("background:#fff;opacity:1"); blanc.style.transition = "opacity 3.5s"; requestAnimationFrame(() => requestAnimationFrame(() => { blanc.style.opacity = "0"; })); setTimeout(() => blanc.remove(), 3700);
  moi.cible = null; moi.chemin = []; moi.info.mortT = performance.now() - 2000;   // (couché, tout de suite)
  const p = moi.g.position; let places = false, u = 0, prec = performance.now(), noir = null, titre = null, fini = false; const dits = new Set(), D = (k, f) => { if (!dits.has(k)) { dits.add(k); f(); } };
  /* (debout autour de lui, qui le regardent : Maria, Lisa, James, Heather) */
  const AUTOUR = [[SHN.maria, .8, -1.35], [SHN.laura, -.85, -1.3], [SHN.james, 1.45, .15], [SHN.heather, -1.4, .35]];
  const fin = () => { if (fini || !M) return; fini = true; moi.info.mortT = 0; finCine(); for (const [n] of AUTOUR) if (M.gens.get(n)) retirerAncien(n); const G = M.gresil; M.gresil = null; couperGresil(G); grainSH(false); resetSH(); envoyerWS({ t: "radio_fin" });   /* (l'histoire est finie : la radio disparaît du sol) */
    const n = noir || voile("background:#000;opacity:1"); n.style.opacity = "1"; if (titre) titre.remove(); changerLieu("fetes", [0, 26.5], 0); setTimeout(() => { n.style.transition = "opacity 2.5s"; n.style.opacity = "0"; setTimeout(() => n.remove(), 2600); }, 700); };
  M.passerBtn = boutonPasser(fin);
  M.cine = { maj: now => { u += Math.min(.05, Math.max(0, now - prec) / 1000); prec = now;
    if (!places) { places = true; for (const [n, dx, dz] of AUTOUR) { if (M.gens.get(n)) retirerAncien(n); const q = poserPerso(n, p.x + dx, p.z + dz, p.y); if (q) fonduSH(q, 1, 1, 10); if (q) { q.cible = null; q.chemin = []; q.regardeA = p; q.regardeVite = true; } } }
    const he = M.gens.get(SHN.heather);
    if (u < 23 || !he) { M.camera.position.set(p.x - .4, p.y + 2.5, p.z + 2.9); M.camera.lookAt(p.x, p.y + .7, p.z - .3); }   /* (de haut : lui, par terre, et eux, debout autour) */
    else { const h = he.g.position, ex = h.x - p.x, ez = h.z - p.z, el = Math.hypot(ex, ez) || 1; M.camera.position.set(p.x - ex / el * 1.05 + ez / el * .55, p.y + .6, p.z - ez / el * 1.05 - ex / el * .55); M.camera.lookAt(h.x, p.y + 1.25, h.z); }   /* (au ras du sol, de là où il est couché : elle, penchée sur lui) */
    if (u > 3.4) D("a", () => dire(SHN.maria, `Je te l'avais dit, ${nom}… que tu reviendrais.`));
    if (u > 7.8) D("b", () => dire(SHN.laura, "Le pauvre… Il ne sait toujours pas. Il va revivre cette nuit encore, et encore… éternellement."));
    if (u > 13.2) D("c", () => dire(SHN.james, "Laissez-le. Je suis persuadé qu'un jour, il finira par faire le bon choix."));
    if (u > 17.8) D("d", () => dire(SHN.maria, "Ils reviennent tous."));
    if (u > 20.6) D("e", () => { for (const [n, dx, dz] of AUTOUR.slice(0, 3)) { const q = M.gens.get(n); if (q) q.regardeA = null; evanouirSH(n, [p.x + dx * 4, p.z + dz * 4], 500, .7); } });   /* (ils s'en vont dans le brouillard ; elle, non) */
    if (u > 23) D("g", () => { if (he) { he.regardeA = p; he.teteVers = p; } });   /* (elle reste là où elle est, et regarde son père, à terre) */
    if (u > 25.2) D("h", () => dire(SHN.heather, "Chut, papa… Ne te relève pas. Tu me cherches depuis si longtemps…"));
    if (u > 30.4) D("i", () => dire(SHN.heather, "Mais tu ne m'as jamais perdue. C'est moi qui t'ai fait venir ici. Moi qui fais hurler la sirène."));
    if (u > 36.4) D("j", () => dire(SHN.heather, "Tu ne te souviens pas ? Il y a sept ans… c'est toi qui m'as laissée brûler. Alors maintenant, tu brûles avec moi."));
    if (u > 43) D("k", () => dire(SHN.heather, "Dors, papa. On recommence. Et la prochaine fois encore… tu ne me reconnaîtras pas."));
    if (u > 48.6) D("l", () => { if (he) { he.regardeA = null; he.teteVers = null; } evanouirSH(SHN.heather, [p.x - 5, p.z + 2], 300, .55); });   /* (puis elle s'en va, elle aussi, dans le brouillard) */
    if (u > 53.5 && !noir) { noir = voile("background:#000;opacity:0;transition:opacity 1.2s"); requestAnimationFrame(() => noir.style.opacity = "1"); }
    if (u > 55.5 && !titre) { bulle(null); titre = voile("opacity:0;transition:opacity 2.5s;display:grid;place-items:center;align-content:center;gap:clamp(18px,5vh,46px)");   /* (sur le noir : le titre, et FIN, dans la même écriture) */
      titre.innerHTML = '<img src="images/sh/titre.webp" alt="Silent Hill" style="width:min(80%,760px);height:auto"><img src="images/sh/fin.webp" alt="Fin" style="width:min(21%,200px);height:auto">';
      requestAnimationFrame(() => requestAnimationFrame(() => { titre.style.opacity = "1"; })); }
    if (u > 63.5) fin(); } }; }
// au sous-sol du mess : Lisa ; elle pense pouvoir nous aider à partir — par le porche : « si c'est une entrée, c'est aussi une sortie, non ? »
function lauraBas() { const moi = moiApo(); if (!moi || M.lieu !== "sh-mess" || M.shLauraBas) return; const mp = moi.g.position, nom = prenomSH();
  if (M.cine) { setTimeout(() => M && M.shEtape === 10 && !M.shLauraBas && lauraBas(), 800); return; }   /* (une autre scène est en cours : Lisa attend qu'elle finisse, au lieu d'être sautée) */
  const pl = apparaitreSH(poserPerso(SHN.laura, mp.x + 2.2, mp.z - 1.8, mp.y)); if (!pl) return; pl.nivMess = 1; noterCarteSH(SHN.laura, -14.25, 10.45); M.shLauraBas = true;
  dialogueSH(SHN.laura, [[null, null, 1600], [SHN.laura, `${nom} ! Vous êtes encore en vie… Dieu merci.`], ["moi", "Lisa… Qu'est-ce que vous faites ici ?"], [SHN.laura, "Je me cache. Ici, il ne vient jamais. Alors… vous avez vu Maria ?"],
    ["moi", "Oui. Elle est bizarre… Elle dit des choses qui n'ont aucun sens. On dirait qu'elle me connaît."], [SHN.laura, "Elle dit ça à tout le monde. À James aussi. Surtout à James."],
    [SHN.laura, "Je crois que je peux vous aider à partir d'ici."], ["moi", "Comment ?"], [SHN.laura, "Le grand portail, là-bas, celui qui donne sur la rue. Vous êtes entré par là, non ?"],
    [SHN.laura, "Si c'est une entrée, c'est aussi une sortie. Pour vous, en tout cas."], ["moi", "Venez avec moi, Lisa. Vous ne pouvez pas rester ici toute seule."],
    [SHN.laura, `Je ne peux pas, ${nom}. Regardez mes mains… ce sang, il ne part jamais.`], [SHN.laura, "Et puis James a besoin de quelqu'un pour retrouver sa femme. Allez. Et ne vous retournez pas."],
    geste(() => evanouirSH(SHN.laura, [mp.x - 4, mp.z + 3], 600, 1.4)), [null, null, 2600]],
    () => { evanouirSH(SHN.laura, [mp.x - 4, mp.z + 3], 0, 1.4); M.shEtape = 10; }); }
/* sur la terrasse, James surgit du brouillard : « ne la suis pas, ce n'est qu'une illusion ». Maria insiste. Il faut choisir */
function jamesTerrasse(H) { const moi = moiApo(); if (!moi || !M.L.sh) return; if (M.cine) { setTimeout(() => M && jamesTerrasse(H), 800); return; } const mp = moi.g.position, nom = prenomSH();
  /* (il arrive par la terrasse : un point de la terrasse, à 3 m de nous, loin de l'escalier) */
  let q = null, bz = 1e9; for (let k = 0; k < 48; k++) { const a = k / 48 * 6.283, r = 2.6 + (k % 3) * .6, x = mp.x + Math.cos(a) * r, z = mp.z + Math.sin(a) * r;
    const ma = M.gens.get(SHN.maria); if (ma && Math.hypot(ma.g.position.x - x, ma.g.position.z - z) < 2) continue;   /* (pas contre Maria : un peu à l'écart) */
    if (!M.L.limites(x, z) || Math.abs(M.L.hauteur(x, z, { g: { position: { y: H.y } } }) - H.y) > .1) continue; if (z < bz) { bz = z; q = [x, z]; } }
  q = q || [mp.x - 2.6, mp.z - 1]; const pj = apparaitreSH(poserPerso(SHN.james, q[0], q[1], H.y)); if (pj) noterCarteSH(SHN.james, H.x, H.z);
  dialogueSH(SHN.james, [[null, null, 1600], [SHN.james, `${nom} ! Ne la crois pas !`], geste(() => { const j = M.gens.get(SHN.james), m = M.gens.get(SHN.maria); if (j && m) j.teteVers = m.g.position; }), [SHN.james, "Maria n'existe pas. C'est ce lieu qui l'a inventée, de toutes pièces… Elle n'est que ça : une pure invention de cet endroit."],
    [SHN.james, "Elle te dira tout ce que tu veux entendre. Elle te mènera droit à lui."], geste(() => { const j = M.gens.get(SHN.james), m = M.gens.get(SHN.maria); if (j && m) { m.teteVers = j.g.position; j.teteVers = m.g.position; } }), [SHN.maria, "James… tu es jaloux ? Tu as toujours été jaloux."],
    geste(() => { const j = M.gens.get(SHN.james), m = M.gens.get(SHN.maria); if (m) m.teteVers = null; if (j) j.teteVers = null; }), [SHN.maria, `Tu veux revoir ta fille, ${nom}, oui ou non ? Lui, il ne sait que fuir. Moi, je sais où elle est.`], [SHN.james, "Réfléchis bien. Après, il sera trop tard."], [null, null, 500]],
    () => choixSH("Que fais-tu ?", [["Suivre Maria", () => suivreMaria(H)], ["Rester avec James", () => resterJames(H)]])); }
// un choix, à l'écran : deux grands boutons ; la caméra reste sur la scène
function suivreMaria(H) { M.shChoix = "maria";
  dialogueSH(SHN.james, [[SHN.james, "Comme tu voudras… Reste sur tes gardes."], geste(() => evanouirSH(SHN.james, [H.x - 6, H.z + 4], 500, .9)), [SHN.maria, "Viens. Reste près de moi… je t'amène à Heather."], [null, null, 1600]],
    () => { evanouirSH(SHN.james, [H.x - 6, H.z + 4], 0, .9); M.shEtape = 6; M.shEscorte = { pv: 5, ditT: 0, etape: 0 }; }); }
function resterJames(H) { M.shChoix = "james";
  dialogueSH(SHN.maria, [[SHN.maria, "…Alors c'est lui que tu choisis."], [SHN.maria, "Tu me fais de la peine. Encore une fois."], geste(() => evanouirSH(SHN.maria, [H.x + 6, H.z + 4], 400, .55)), [null, null, 2600],
    [SHN.james, "Tu as fait le bon choix."], [SHN.james, "Tiens. J'ai trouvé ça sur le corps d'un garde. Elle ouvre le mess. Il y a peut-être une issue, par là-bas."], geste(() => { M.shCleMess = true; montrerCleMess(); majBoutonCarte(); }, true),
    ["moi", "Merci, James. Et toi ?"], [SHN.james, `Moi… je dois retrouver ma femme. Bon courage, ${prenomSH()}.`], geste(() => evanouirSH(SHN.james, [H.x - 6, H.z + 4], 600, .9)), [null, null, 2400]],
    () => { M.shCleMess = true; evanouirSH(SHN.maria, [H.x + 6, H.z + 4], 0, .55); evanouirSH(SHN.james, [H.x - 6, H.z + 4], 0, .9); M.shEtape = 6; M.shMariaMess = true; }); }
// la clé du mess (celle de Silent Hill 1), montrée en grand à l'écran
/* la photo ramassée, près de la Pontiac : montrée en grand, et Harry pense tout haut */
function montrerPhotoSH() { const d = voile("display:grid;place-items:center;background:rgba(0,0,0,.72);opacity:0;transition:opacity .6s", 6600);
  d.innerHTML = `<div style="text-align:center;max-width:86%"><img src="images/sh/photo-james-mary.webp" alt="" style="width:min(62vw,300px);transform:rotate(-3deg);box-shadow:0 10px 28px rgba(0,0,0,.85)"><div style="font:900 18px 'Marcellus',serif;color:#efe6d4;letter-spacing:.12em;margin-top:12px;text-shadow:0 2px 6px #000">UNE PHOTO</div><div style="font:italic 15px/1.4 sans-serif;color:#d8cfc0;margin-top:8px;text-shadow:0 2px 5px #000">Un homme et une femme… Je ne les connais pas.<br>Ils avaient l'air heureux. Il y a du sang dessus… séché depuis longtemps.</div></div>`;
  requestAnimationFrame(() => d.style.opacity = "1"); setTimeout(() => { d.style.opacity = "0"; }, 5900); sonBruit(.15, 2400, .2);
}
function montrerCleMess() { const d = voile("display:grid;place-items:center;background:rgba(0,0,0,.6);opacity:0;transition:opacity .5s", 3600);
  d.innerHTML = `<div style="text-align:center"><img src="images/sh/cle-mess.webp" alt="" style="width:min(40vw,170px);filter:drop-shadow(0 6px 14px rgba(0,0,0,.8))"><div style="font:900 22px 'Marcellus',serif;color:#efe6d4;letter-spacing:.1em;margin-top:6px;text-shadow:0 2px 6px #000">CLÉ DU MESS</div></div>`;
  requestAnimationFrame(() => d.style.opacity = "1"); setTimeout(() => { d.style.opacity = "0"; }, 3000); sonBruit(.25, 3000, .3); }
/* l'escorte de Maria, de la terrasse au mess : elle marche devant (elle nous attend si l'on traîne) ; un monstre approche, elle court se mettre derrière nous.
   Les monstres s'en prennent à elle aussi : cinq coups, et elle meurt — et pour nous, c'est la fin (retour en 1990) */
function escorteMaria(now, moi) { const E = M.shEscorte = M.shEscorte || { pv: 5, ditT: 0 }, q = (M.L.portails || []).find(pt => pt.vers === "sh-mess"), porte = q && (q.seuil || centrePortail(q)); if (!porte) return;
  let p = M.gens.get(SHN.maria);
  if (!p) { const o = E.pos || [moi.g.position.x + 1.2, moi.g.position.z + 1.2]; p = apparaitreSH(poserPerso(SHN.maria, o[0], o[1], E.pos ? E.pos[2] : moi.g.position.y)); if (!p) return; }
  if (p.part || p.info.mortT) return; const mp = moi.g.position, pp = p.g.position; E.pos = [pp.x, pp.z, pp.y];
  const dire2 = (t, ms = 6000) => { if (now > E.ditT) { E.ditT = now + ms; dire(SHN.maria, t); } };
  // le danger : le monstre vivant le plus proche d'elle
  let danger = null, dd = 8; for (const m of M.shMonstres || []) { if (m.mortT || m.p || Math.abs(m.y - pp.y) > 2) continue; const d = Math.hypot(m.x - pp.x, m.z - pp.z); if (d < dd) { dd = d; danger = m; } }
  if (danger) { const ux = mp.x - danger.x, uz = mp.z - danger.z, l = Math.hypot(ux, uz) || 1, cx = mp.x + ux / l * 1.1, cz = mp.z + uz / l * 1.1;
    if (Math.abs(pp.y - mp.y) < 1.5 && M.L.limites(cx, cz) && (!p.cible || Math.hypot(p.cible.x - cx, p.cible.z - cz) > .6)) { p.info.allure = 1.25; p.cible = new THREE.Vector3(cx, pp.y, cz); p.chemin = []; p.suite = null; }
    dire2(`${prenomSH()} ! Derrière toi… protège-moi !`, 7000); E.cache = true; return; }
  if (E.cache) { E.cache = false; p.cible = null; p.chemin = []; }
  if (Math.hypot(porte[0] - pp.x, porte[1] - pp.z) < 1.6) { M.shMariaMess = true; M.shEscorte = null; M.shMessOuvert = true; sonBruit(.4, 900, .3); dire(SHN.maria, "C'est ici… Entre. N'aie pas peur."); evanouirSH(SHN.maria, [porte[0], porte[1]], 1200, .6); return; }
  if (Math.hypot(mp.x - pp.x, mp.z - pp.z) > 7 || Math.abs(mp.y - pp.y) > 2.5) { if (p.cible && !p.suite && Math.abs(pp.y) < 1) { p.cible = null; p.chemin = []; } dire2("Ne me laisse pas seule… viens.", 8000); return; }   /* (elle nous attend) */
  if (!p.cible) { p.info.allure = .55;
    if (pp.y > 1.5) { const g = viserLibre(0, C3.z1 - C3.PP + 2.2); if (!C3.etage(p, g[0], 0, g[1])) viser(p, porte[0], porte[1]); }   /* (de la terrasse : par l'escalier) */
    else { const R = [[6, -66], [-8, -48], [8, -30], [-6, -14], [7, 2], porte]; E.etape = E.etape || 0;   /* (elle prend le chemin le plus long : en zigzag, de cour en cour) */
      while (E.etape < R.length - 1 && Math.hypot(R[E.etape][0] - pp.x, R[E.etape][1] - pp.z) < 2.2) E.etape++;
      const c = R[E.etape] === porte ? porte : viserLibre(R[E.etape][0], R[E.etape][1]); viser(p, c[0], c[1]);
      if (!p.cible) { if (E.etape < R.length - 1) E.etape++; else { p.cible = new THREE.Vector3(c[0], pp.y, c[1]); p.chemin = []; } } } }   /* (point inaccessible : le suivant ; la porte : tout droit) */
  // bloquée (rien ne bouge depuis 4 s alors qu'elle devrait marcher) : on passe au point suivant
  if (!E.cache && Math.hypot(mp.x - pp.x, mp.z - pp.z) <= 7) { if (!E.ref || Math.hypot(pp.x - E.ref[0], pp.z - E.ref[1]) > .4) E.ref = [pp.x, pp.z, now];
    else if (now - E.ref[2] > 4000) { E.ref = [pp.x, pp.z, now]; E.etape = Math.min((E.etape || 0) + 1, 5); p.cible = null; p.chemin = []; p.suite = null;
      if (E.etape >= 5 && (E.bloque = (E.bloque || 0) + 1) > 2) { const v = viserLibre(porte[0], porte[1] + 1.2); p.g.position.x = v[0]; p.g.position.z = v[1]; brumeSH(p.g.position.clone(), 3000); } } } }   /* (vraiment coincée : elle réapparaît dans le brouillard, devant le mess) */
function blesserMaria(x, z) { const E = M.shEscorte, p = M.gens.get(SHN.maria); if (!E || !p || p.info.mortT || M.shMort) return; E.pv--; p.flashT = performance.now() + 200; sangAuSol(p.g.position.x, p.g.position.z, p.g.position.y, .8); sonBruit(.12, 900, .35);
  if (E.pv > 0) { dire(SHN.maria, E.pv > 2 ? "Aaah ! Aide-moi !" : "Je… je n'en peux plus…"); return; }
  // Maria est morte : elle tombe ; pour nous, c'est la fin
  p.info.mortT = performance.now(); p.cible = null; p.chemin = []; flaqueMort(p); jetSang(p.g.position.x, p.g.position.y + .8, p.g.position.z); M.shEscorte = null;
  bulle("<i>Maria… non…</i>", 2600); setTimeout(() => M && mortSH("MARIA EST MORTE"), 2400); }
/* le flacon « Nutrition Supplement » (d'après la photo) : verre ambré, bouchon crème, étiquette orange ; il rend toute la vie */
let texFlaconC = null;
function texFlacon() { return texFlaconC || (texFlaconC = tex(toile(128, 256, (x, w, h) => {
  const v = x.createLinearGradient(14, 0, 114, 0); v.addColorStop(0, "#2a1608"); v.addColorStop(.25, "#6a3a14"); v.addColorStop(.45, "#8a5420"); v.addColorStop(.7, "#4a2810"); v.addColorStop(1, "#1e1006");
  x.fillStyle = v; x.beginPath(); x.moveTo(40, 66); x.lineTo(88, 66); x.quadraticCurveTo(114, 74, 114, 102); x.lineTo(114, 236); x.quadraticCurveTo(114, 250, 100, 250); x.lineTo(28, 250); x.quadraticCurveTo(14, 250, 14, 236); x.lineTo(14, 102); x.quadraticCurveTo(14, 74, 40, 66); x.fill();
  x.fillStyle = "#5a3412"; x.fillRect(42, 44, 44, 24);   // le goulot
  const b = x.createLinearGradient(34, 0, 94, 0); b.addColorStop(0, "#b8b29c"); b.addColorStop(.4, "#ece6d0"); b.addColorStop(1, "#a29c86"); x.fillStyle = b; x.beginPath(); x.roundRect(34, 8, 60, 40, 7); x.fill();   // le bouchon
  x.strokeStyle = "rgba(0,0,0,.18)"; x.lineWidth = 2; for (let k = 40; k < 92; k += 6) { x.beginPath(); x.moveTo(k, 12); x.lineTo(k, 44); x.stroke(); }
  x.fillStyle = "#d8761e"; x.fillRect(14, 120, 100, 98); x.fillStyle = "#e9e2cc"; x.fillRect(14, 138, 100, 44);   // l'étiquette
  x.fillStyle = "#1a1a1a"; x.font = "bold 15px Arial"; x.textAlign = "center"; x.fillText("NUTRITION", 64, 157); x.fillText("SUPPLEMENT", 64, 175);
  x.fillStyle = "rgba(60,30,10,.6)"; for (let k = 0; k < 3; k++) x.fillRect(26, 192 + k * 7, 76, 2);
  x.fillStyle = "rgba(255,240,210,.35)"; x.fillRect(30, 80, 8, 150);   // le reflet du verre
  x.fillStyle = "rgba(0,0,0,.25)"; for (let k = 0; k < 30; k++) x.fillRect(14 + Math.random() * 100, 120 + Math.random() * 98, 3, 3); }))); }   // (l'étiquette usée)
function poserFlaconSH() { const moi = moiApo(); if (!moi || !M.L) return; const mp = moi.g.position; let q = null;
  for (let k = 0; k < 40 && !q; k++) { const a = Math.random() * 6.283, r = 2 + Math.random() * 2, x = mp.x + Math.cos(a) * r, z = mp.z + Math.sin(a) * r;
    if (baseLieu(M.lieu) === "etage" ? Math.abs(x) < ET.CX0 - .5 && z > -2.6 && z < -1.2 : M.L.limites(x, z) && Math.abs((M.L.hauteur ? M.L.hauteur(x, z, moi) : 0) - mp.y) < .3) q = [x, z]; }
  if (!q) q = [mp.x + .8, mp.z];
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: texFlacon(), transparent: true, alphaTest: .1 })); sp.center.set(.5, 0); sp.scale.set(.2, .4, 1); sp.position.set(q[0], mp.y + .01, q[1]); M.scene.add(sp);
  const lu = new THREE.PointLight(0xffb060, 1.2, 2.2, 2); lu.userData.sh = true; lu.position.set(q[0], mp.y + .35, q[1]); M.scene.add(lu);
  (M.shFlacons = M.shFlacons || []).push({ sp, lu, x: q[0], y: mp.y, z: q[1], lieu: M.lieu }); }
function flaconsSH() { const moi = moiApo(); if (!moi || !M.shFlacons) return; const now = performance.now();
  M.shFlacons = M.shFlacons.filter(f => { if (f.lieu !== M.lieu) return true; if (f.sp.parent !== M.scene) { M.scene.add(f.sp, f.lu); }
    f.sp.position.y = f.y + .01 + Math.abs(Math.sin(now / 400)) * .04; f.lu.intensity = .9 + Math.sin(now / 300) * .3;
    if (Math.hypot(moi.g.position.x - f.x, moi.g.position.z - f.z) < .85 && Math.abs(moi.g.position.y - f.y) < 1.2) { M.scene.remove(f.sp, f.lu); M.shVies = SH_VIES; M.shPerte = 0; sonBruit(.15, 2600, .3); majHudApo();
      M.ctx.surInfo && M.ctx.surInfo("🧴 Nutrition Supplement : toute ta vie est revenue !"); return false; }
    return true; }); }
// l'arme de James, dans notre main (le bras se lève quand on tire)
function armerSH() { M.shArme = true; const moi = M.gens.get(M.moiNum); if (moi && !moi.info.arme) { moi.info.arme = true; dessinerCorps(moi); } }
/* --- l'histoire --- */
// on approche d'un endroit : le brouillard s'épaissit, le personnage en sort, vient vers nous, et la conversation commence ; il est noté sur la carte
function noterCarteSH(num, x, z) { const c = LIEU_CARTE[M.lieu] || [x, z]; M.shCarte = (M.shCarte || []).filter(q => q.num !== num || Math.hypot(q.x - c[0], q.z - c[1]) > 3); M.shCarte.push({ num, nom: SH_NOMS[SH_IDN[num]], x: c[0], z: c[1] }); }
function rencontreSH(num, centre, rayon, loin, lignes, fin, y = null, cond = null) {
  const moi = moiApo(); if (!moi || M.cine) return false; const mp = moi.g.position;
  /* (une rencontre ne se joue qu'une fois : si elle a été coupée avant la fin, on passe simplement à la suite, sans la rejouer) */
  M.shScenes = M.shScenes || new Set(); const cle = num + ":" + M.shEtape; if (M.shScenes.has(cle)) { fin && fin(); return false; }
  if (Math.hypot(mp.x - centre[0], mp.z - centre[1]) > rayon || (y != null && Math.abs(mp.y - y) > 1.6) || (cond && !cond(mp))) return false;
  // il sort du brouillard, de l'autre côté de l'endroit (pas dans notre dos)
  let dx = centre[0] - mp.x, dz = centre[1] - mp.z; const d = Math.hypot(dx, dz) || 1; dx /= d; dz /= d;
  const dep = Array.isArray(loin) ? loin : [centre[0] + dx * loin, centre[1] + dz * loin];
  const p = apparaitreSH(poserPerso(num, dep[0], dep[1], y)); if (!p) return false;
  const ex = p.g.position.x - mp.x, ez = p.g.position.z - mp.z, de = Math.hypot(ex, ez) || 1, arr = placeLibre(mp.x + ex / de * 2.2, mp.z + ez / de * 2.2);
  if (arr && de > 2.4) { p.info.allure = .5; p.cible = new THREE.Vector3(arr[0], p.g.position.y, arr[1]); }
  noterCarteSH(num, centre[0], centre[1]); M.shScenes.add(cle);
  dialogueSH(num, [[null, null, de > 2.4 ? Math.min(5200, 1400 + (de - 2.2) / (3.3 * .5) * 1000) : 1800], ...lignes], fin); return true; }
/* en montant du bar dans la salle des fêtes : une infirmière, de dos, penchée sur un brancard ; on lui parle, elle se retourne… elle sait qui l'on est.
   « Un peu la gardienne de ces lieux » : quand la sirène retentit, ne pas sortir. Puis elle s'efface dans le brouillard */
function infirmiereFetes(moi, nom) { const L = M.L, mp = moi.g.position; if (mp.y < -.6 || mp.z > 15) return;   // (dans la salle, pas au sous-sol)
  let I = M.shInf; if (!I || I.L !== L) { const bs = (L.brancards || []).filter(b => !b.pose && Math.hypot(b.x, b.z - 10.6) > 4.5 && Math.hypot(b.x, b.z - 10.6) < 9).sort((a, b) => Math.abs(a.x) - Math.abs(b.x));   /* (au fond de la salle, en face de l'escalier : on la voit en arrivant, de loin) */ const b = bs[0]; if (!b) { M.shInfVu = true; return; }
    let ux = 0 - b.x, uz = 11 - b.z; const ul = Math.hypot(ux, uz) || 1; ux /= ul; uz /= ul;   // (entre l'escalier et le brancard : on la voit de dos)
    let pos = null; for (const d of [.85, 1, 1.15, .75]) if (L.limites(b.x + ux * d, b.z + uz * d)) { pos = [b.x + ux * d, b.z + uz * d]; break; } if (!pos) pos = [b.x + ux, b.z + uz];
    const p = poserPerso(SHN.laura, pos[0], pos[1], 0); if (!p) return; p.g.position.set(pos[0], 0, pos[1]); p.cible = null; p.chemin = []; p.regardeA = new THREE.Vector3(b.x, 0, b.z); p.regardeVite = true;
    I = M.shInf = { L, p, b }; noterCarteSH(SHN.laura, pos[0], pos[1]); return; }
  const p = I.p; if (!M.gens.has(SHN.laura)) return; if (Math.hypot(mp.x - p.g.position.x, mp.z - p.g.position.z) > 3.5) { p.regardeA = new THREE.Vector3(I.b.x, 0, I.b.z); return; }
  M.shInfVu = true; moi.regardeA = p.g.position;
  dialogueSH(SHN.laura, [[null, null, 900], ["moi", "Bonjour ?… Excusez-moi… Vous m'entendez ?"], [null, null, 1300],
    geste(() => { p.regardeA = moi.g.position; }), [null, null, 2200],   /* (elle se retourne, lentement) */
    [SHN.laura, `Bonjour, ${nom}.`], ["moi", "Comment… comment vous connaissez mon prénom ?"],
    [SHN.laura, "Beaucoup de gens se réveillent ici. Tous perdus… et tous avec un nom qu'ils ont peur d'oublier."], ["moi", "Mais… qui êtes-vous ?"],
    [SHN.laura, "Disons que je suis… un peu la gardienne de ces lieux. Je veille sur ceux qui dorment ici."], [SHN.laura, "Écoutez-moi bien. Quand la sirène retentit… ne vous aventurez pas dehors. Surtout pas."],
    ["moi", "La sirène ? Attendez, je ne comprends pas…"], geste(() => { p.regardeA = null; evanouirSH(SHN.laura, [I.b.x - 3, I.b.z - 3], 500, .8); }), [null, null, 2800]],
    () => { moi.regardeA = null; setTimeout(() => M && M.lieu === "sh-fetes" && !M.cine && preparerLieu("sh-grande"), 2600);   /* (la cour se prépare tout de suite, pendant qu'on est immobile : pas en marchant vers la porte) */ if (M.gens.has(SHN.laura) && !p.part) { p.regardeA = null; evanouirSH(SHN.laura, [I.b.x - 3, I.b.z - 3], 0, .8); } }); }
function sortieMessSH(moi, c) { const mp = moi.g.position, mil = placeLibre(0, -2) || [mp.x, mp.z], t0 = mp.clone();
  moi.rapide = true; moi.info.allure = 1; viser(moi, mil[0], mil[1]); if (!moi.cible) moi.cible = new THREE.Vector3(mil[0], mp.y, mil[1]);
  let u = 0, prec = performance.now(), ph = 0, tPh = 0, he = null, cap = 0, fini = false, cam2 = null; const dits = new Set(), D = (k, t) => { if (!dits.has(k)) { dits.add(k); dire(M.moiNum, t); } };
  const finir = () => { if (fini) return; fini = true; moi.regardeA = null; moi.rapide = false; if (M.gens.has(SHN.heather)) retirerAncien(SHN.heather); finCine(); placerCamera(true); M.shEtape = 8; noterCarteSH(SHN.heather, c[0], c[1]); };
  M.passerBtn = boutonPasser(finir);
  M.cine = { maj: now => { if (fini) return; const dt = Math.min(.05, Math.max(0, now - prec) / 1000); u += dt; prec = now; const t = u - tPh;
    if (ph === 0) {   /* (il sort en courant ; la caméra, derrière, le suit) */
      const vx = mp.x - t0.x, vz = mp.z - t0.z, vl = Math.hypot(vx, vz) || 1; M.camera.position.set(mp.x - vx / vl * 3.4, mp.y + 2.2, mp.z - vz / vl * 3.4); M.camera.lookAt(mp.x + vx / vl * 3, mp.y + 1.1, mp.z + vz / vl * 3);
      if (t > 1.2) D("a", "Heather ?!");
      if ((!moi.cible && !(moi.chemin && moi.chemin.length)) || Math.hypot(mp.x - mil[0], mp.z - mil[1]) < .5 || t > 7) { moi.cible = null; moi.chemin = []; moi.rapide = false; ph = 1; tPh = u; cap = Math.atan2(c[0] - mp.x, c[1] - mp.z) + Math.PI; } }
    else if (ph === 1) {   /* (au milieu de la cour : il tourne sur lui-même, affolé ; la caméra, de haut, tourne lentement autour) */
      const a = cap + t * 2.6; moi.regardeA = new THREE.Vector3(mp.x + Math.sin(a) * 3, mp.y, mp.z + Math.cos(a) * 3); moi.regardeVite = true;
      const ca = cap + .9 + t * .25; M.camera.position.set(mp.x + Math.sin(ca) * 4.2, mp.y + 2.6, mp.z + Math.cos(ca) * 4.2); M.camera.lookAt(mp.x, mp.y + 1, mp.z);
      if (t > .2) D("b", "HEATHER ! Où es-tu ?!"); if (t > 2.4) D("c", "Heather, réponds-moi !");
      if (t > 4.2) { ph = 2; tPh = u; const dl = Math.hypot(c[0] - mp.x, c[1] - mp.z) || 1, k = Math.min(.4, 3.5 / dl), q = placeLibre(mp.x + (c[0] - mp.x) * k + (c[1] - mp.z) / dl * 1.5, mp.z + (c[1] - mp.z) * k - (c[0] - mp.x) / dl * 1.5) || [c[0], c[1]];   /* (à quelques pas devant nous, de biais : on la voit bien filer) */
        he = apparaitreSH(poserPerso(SHN.heather, q[0], q[1], 0)); if (he) { he.cible = null; he.chemin = []; setTimeout(() => { if (!M || !he || fini) return; he.rapide = true; he.info.allure = 1.15; viser(he, c[0], c[1]); if (!he.cible) he.cible = new THREE.Vector3(c[0], 0, c[1]); }, 700); } } }
    else if (ph === 2) {   /* (là ! Heather : la caméra la suit de côté, un peu derrière, pendant qu'elle court vers la porte R — on la voit, et la porte, devant elle) */
      const hp = he && M.gens.get(SHN.heather) === he ? he.g.position : new THREE.Vector3(c[0], 0, c[1]); moi.regardeA = hp;
      const ux = c[0] - hp.x, uz = c[1] - hp.z, ul = Math.hypot(ux, uz) || 1, fx = ux / ul, fz = uz / ul;
      if (!cam2) cam2 = new THREE.Vector3(hp.x - fx * 3.4 + fz * 1.8, 1.75, hp.z - fz * 3.4 - fx * 1.8);
      cam2.lerp(new THREE.Vector3(hp.x - fx * 3.4 + fz * 1.8, 1.75, hp.z - fz * 3.4 - fx * 1.8), Math.min(1, dt * 3)); M.camera.position.copy(cam2); M.camera.lookAt(hp.x + fx * 1.5, 1.05, hp.z + fz * 1.5);
      if (t > .9) D("d", "Heather ! Attends !");
      if (he && !he.part && (ul < 1.2 || t > 9)) { he.part = true; brumeSH(hp.clone(), 3000); fonduSH(he, 1, 0, 900, () => retirerAncien(SHN.heather)); ph = 3; tPh = u; } }
    else if (ph === 3) {   /* (elle s'engouffre dans l'escalier : on reste un instant sur la porte) */
      if (cam2) { M.camera.position.copy(cam2); M.camera.lookAt(c[0], 1.1, c[1]); } if (t > 1.6) { ph = 4; tPh = u; } }
    else { const hp = new THREE.Vector3(c[0], 0, c[1]); moi.regardeA = hp; const vx = hp.x - mp.x, vz = hp.z - mp.z, vl = Math.hypot(vx, vz) || 1;   /* (puis lui, de face, qui crie son nom) */
      M.camera.position.set(mp.x + vx / vl * 2.2 + vz / vl * .8, mp.y + 1.65, mp.z + vz / vl * 2.2 - vx / vl * .8); M.camera.lookAt(mp.x, mp.y + 1.45, mp.z);
      if (t > .5) D("e", "HEATHER !!!"); if (t > 3.4) finir(); } } }; }
function poserPerso(num, x, z, y) { const p = persoSH(num, x, z, y); if (p && y != null && M.L.yNiv && y < -.5) p.nivMess = 1; if (p && y != null && Math.abs(p.g.position.y - y) > .5) p.g.position.y = y; return p; }
function presSH(num, r, dyMax = 1.6) { const moi = moiApo(), p = M.gens.get(num); if (!moi || !p || M.cine || M.shMort) return false;
  return Math.hypot(moi.g.position.x - p.g.position.x, moi.g.position.z - p.g.position.z) < r && Math.abs(moi.g.position.y - p.g.position.y) < dyMax; }
function histoireSH(now) {
  const e = M.shEtape, lieu = M.lieu, moi = moiApo(); if (!moi || M.shMort || M.cine) return; const nom = prenomSH();
  /* (Heather a filé quand le monstre est sorti du fond de la fosse : en remontant, Harry l'appelle) */
  if (lieu === "sh-grande" && e >= 3 && !M.shAppelHeather) { const y = moi.g.position.y; if (y < -1) M.shDansFosse = true; else if (M.shDansFosse && y > -.25) { M.shAppelHeather = true;
      dialogueSH(SHN.heather, [[null, null, 500], ["moi", "Heather !"], [null, null, 900], ["moi", "HEATHER ! Où es-tu ?!"], [null, null, 1600], ["moi", "…Rien. Elle a filé, comme toujours. Il faut que je la retrouve."]], null, { musique: false }); return; } }
  /* (au bord du trou de la ruelle : on s'arrête net, et Harry se dit qu'il faut passer ailleurs) */
  if (lieu === "sh-grande" && M.L.dansTrou && M.L.dansTrou(moi.g.position.x, moi.g.position.z, .7)) { const c = moi.cible, fin = c && (moi.chemin && moi.chemin.length ? moi.chemin[moi.chemin.length - 1] : c);
    const versTrou = fin && (M.L.dansTrou(fin.x, fin.z, .3) || Math.hypot(fin.x - moi.g.position.x, fin.z - moi.g.position.z) < .2);   // (on va dans le trou, ou l'on est bloqué contre son bord)
    if (versTrou) { moi.cible = null; moi.chemin = []; envoyerWS({ t: "aller", x: moi.g.position.x, z: moi.g.position.z }); }
    if (versTrou && now > (M.shTrouT || 0)) { M.shTrouT = now + 9000; sonBruit(.12, 220, .3); bulle("<i>La route s'est effondrée… C'est un trou sans fond. Impossible de passer par là — il faut trouver un autre chemin.</i>", 4200); } }
  if (lieu === "sh-fetes" && !M.shInfVu && e <= 1) infirmiereFetes(moi, nom);
  if (lieu === "sh-grande") {
    // 1. Angela, devant la petite fenêtre (fermée) de la salle de bain
    if (e === 1) rencontreSH(SHN.angela, [-15.7, -77.4], 7, [-17.6, -79.6], [[SHN.angela, "Qui… qui êtes-vous ?"], ["moi", `Je m'appelle ${nom}. Où est-ce qu'on est, ici ? Tout est… gris.`], [SHN.angela, "Vous n'êtes pas d'ici, vous. Personne n'est d'ici."], [SHN.angela, "Vous n'avez pas vu ma maman ?"], ["moi", "Pardon ? Je… je ne comprends pas."],
        [SHN.angela, "Elle était là, avant. Avec papa et mon frère. Et puis il y a eu le brouillard…"], ["moi", "Il n'y a personne d'autre ? Reste avec moi, c'est dangereux."], [SHN.angela, "Non. Je ne dois pas vous suivre. Vous n'êtes pas… comme eux."], [SHN.angela, "J'ai perdu ma maman. Il faut que je la retrouve…"],
        geste(() => evanouirSH(SHN.angela, [-17.6, -80.2], 600, 1.5)), [null, null, 3200]], () => { M.shEtape = 2; evanouirSH(SHN.angela, [-17.6, -80.2], 0, 1.5); });
    // 2. Heather, au fond du lavoir (la fosse) : la fille de Harry, qu'il retrouve en bas, passé la porte du sous-sol ; un monstre sort du brouillard, du fond — elle file
    if (e === 2) { const FOND = [-11.5, -86.3];
      let bete = null; const sortir = () => { if (bete) return; bete = creerBeteSH("capuche", FOND[0], FOND[1], -C3.PF); bete.cine = true; bete.v = 1.05; brumeSH({ x: FOND[0], y: -C3.PF, z: FOND[1] }, 4600); sonBruit(.5, 300, .5); M.shRegard = bete.g.position; };
      rencontreSH(SHN.heather, [1.5, -86.3], 9, FOND, [[SHN.heather, "Papa ?! … Papa, c'est toi ?"], ["moi", "Heather ?! Qu'est-ce que tu fais ici ?"],
          [SHN.heather, "Je suis venue la chercher."], ["moi", "La chercher ? Qui ça ?"], [SHN.heather, "…Tu le sais très bien. Elle est quelque part, dans cette ville. La nuit, je l'entends m'appeler."],
          ["moi", "Heather, de qui tu parles ? Il n'y a personne, ici. Rentre avec moi, tout de suite."], [SHN.heather, "Pas sans elle. Je ne repartirai pas sans elle."],
          [SHN.heather, "Papa… il y a quelque chose, là-dedans. Au fond. Je l'entends respirer depuis tout à l'heure."], ["moi", "Reste derrière moi, Heather."], [SHN.heather, "Trop tard. Le voilà.", 2200],
          geste(sortir), [null, null, 3200], geste(() => { M.shRegard = null; }), [SHN.heather, "Papa, fuis ! Cours ! Ne t'occupe pas de moi !", 2200], geste(() => evanouirSH(SHN.heather, [12.5, -86.3], 900, 1.6)), [null, null, 2600]],
        () => { sortir(); bete.cine = false; M.shEtape = 3; evanouirSH(SHN.heather, [12.5, -86.3], 0, 1.6); }, -C3.PF, mp => mp.x < 4.5 && mp.z < -84.2); }
    // 3. James sort de sous le préau de l'horloge jaune : il cherche sa femme ; il nous donne son arme
    if (e === 3 && typeof RU !== "undefined" && RU.xB != null) { const T = [RU.xB - RU.pc / 2, RU.zA + RU.pc / 2];
      rencontreSH(SHN.james, T, 9, 3.5, [[SHN.james, "Toi aussi, tu es perdu ici ? Je m'appelle James. James Sunderland."], ["moi", `Moi, c'est ${nom}. Je me suis réveillé dans le bar… je ne sais même pas comment.`],
        [SHN.james, "Je cherche ma femme, Mary. Elle m'a écrit une lettre… Elle dit qu'elle m'attend, dans notre « endroit spécial »."], [SHN.james, "Le problème… c'est que Mary est morte. Il y a trois ans. Et pourtant, c'est bien son écriture."],
        ["moi", "Comment on sort d'ici ? Et ces monstres… c'est quoi ?"], [SHN.james, "Je n'en sais pas plus que toi. Les routes s'arrêtent net, comme si la ville avait été coupée du monde."],
        [SHN.james, "Mais tiens, prends ça. Il ne s'enraye jamais, il ne se vide jamais. Ne me demande pas pourquoi."], geste(() => { armerSH(); sonBruit(.3, 2400, .4); majHudApo(); }, true),
        ["moi", "Et toi ? Tu vas t'en sortir, sans arme ?"], [SHN.james, `Je n'ai plus grand-chose à perdre. Fais attention à toi, ${nom}.`], [SHN.james, "Et si tu croises Heather… ce n'est pas elle. Ne la crois pas."],
        ["moi", "Heather ?! D'où est-ce que vous connaissez ma fille ?"], [null, null, 700], geste(() => evanouirSH(SHN.james, [T[0] + 3, T[1] - 3], 300, .9)), ["moi", "James ! Attendez ! JAMES !", 2600], [null, null, 900]],
        () => { armerSH(); M.shEtape = 4; M.shPopL = null; evanouirSH(SHN.james, [T[0] + 3, T[1] - 3], 0, .9); majHudApo(); M.ctx.surInfo && M.ctx.surInfo("🔫 L'arme de James : munitions illimitées. Touche un monstre pour tirer."); }); }
    // 4. Lisa, dans la cour d'honneur : elle reconnaît Harry, et l'envoie vers Maria
    if (e === 4) rencontreSH(SHN.laura, [0, -2], 8, 5, [[SHN.laura, `On se retrouve, ${nom}.`], ["moi", "Vous ! La gardienne… Vous ne m'avez même pas dit votre nom."],
        [SHN.laura, "Lisa. Lisa Garland. J'étais infirmière, avant… à l'hôpital Alchemilla. Il y a longtemps."], ["moi", "Il y a des monstres, partout. Venez avec moi, je vais vous sortir de là."],
        [SHN.laura, "Me sortir ? … Je ne crois pas que je puisse partir. Je ne crois pas que j'en aie le droit."], [SHN.laura, "Mais vous, vous pouvez. Montez sur la terrasse, tout en haut. Quelqu'un vous y attend."],
        ["moi", "Quelqu'un ? … Heather ! C'est Heather, n'est-ce pas ? Ma fille est là-haut ?"], [SHN.laura, "Je… je ne peux pas vous en dire plus."], ["moi", "Lisa, attendez…"], [SHN.laura, `Faites attention à vous, ${nom}. Ne me laissez pas… Non. Pardon. Allez-vous-en.`], geste(() => evanouirSH(SHN.laura, [8, 6], 600, 1.7)), [null, null, 2800]],
        () => { M.shEtape = 5; evanouirSH(SHN.laura, [8, 6], 0, 1.7); });
    // 5. Maria, sur la terrasse : elle savait qu'on reviendrait pour elle ; elle veut qu'on la suive
    if (e === 5 && !M.shTerrasse) { const H = helipad();
      rencontreSH(SHN.maria, [H.x, H.z], 7, 4, [["moi", "Heather ? … Non. Vous n'êtes pas Heather."], [SHN.maria, `Désolée de te décevoir, ${nom}. Moi, c'est Maria.`], ["moi", "Comment vous connaissez mon nom ?"],
        [SHN.maria, "Ici, tout le monde finit par se connaître. L'infirmière t'a envoyé, pas vrai ? Lisa ne ment jamais. Elle ne dit juste pas tout."],
        ["moi", "Je cherche ma fille. Une adolescente, blonde, une veste blanche… Vous ne l'auriez pas vue ?"], [SHN.maria, "Heather ? … Oui. Je l'ai vue."], ["moi", "Où ça ?! Elle va bien ?"],
        [SHN.maria, "Elle a peur. Elle se cache. Mais je sais où elle est… Viens avec moi, je vais t'amener jusqu'à elle."], [null, null, 600]],
        () => { M.shTerrasse = true; setTimeout(() => M && jamesTerrasse(H), 300); }, H.y); }
    // le mess : la porte fermée à clé ; on l'ouvre avec la clé de James (ou Maria l'ouvre, si on la suit)
    { const q = (M.L.portails || []).find(pt => pt.vers === "sh-mess"); if (q && !q.verrou) { const d0 = q.dans; q.verrou = true; q.dans = (x, z) => !!M.shMessOuvert && d0(x, z); }
      for (const b of M.L.messBattants || []) { const cible = M.shMessOuvert ? b.userData.ouvert : 0; if (!b.userData.vu) { b.userData.vu = true; b.rotation.y = cible; } b.rotation.y += (cible - b.rotation.y) * Math.min(1, .04); }   /* (à l'arrivée : déjà fermée ; avec la clé, elle s'ouvre doucement) */
      const c = q && (q.seuil || centrePortail(q)); if (c && !M.shMessOuvert && !M.shCleMess && Math.hypot(moi.g.position.x - c[0], moi.g.position.z - c[1]) < 1.2 && now > (M.shVerrouT || 0)) { M.shVerrouT = now + 6000;
        /* (comme dans Silent Hill : la poignée qu'on secoue, et Harry qui pense tout haut — ce qu'il dit dépend de là où il en est) */
        sonBruit(.22, 160, .25); setTimeout(() => M && sonBruit(.2, 140, .22), 260);
        const pense = M.shChoix === "maria" ? "C'est fermé à clé… Maria a dit qu'elle savait comment entrer. Je ferais mieux de rester avec elle."
          : M.shEtape >= 5 ? "Verrouillée. Il me faut la clé… Quelqu'un dans cette caserne doit bien l'avoir."
          : "Fermée à clé. La poignée ne bouge pas d'un millimètre… Il doit y avoir un autre chemin. Ou une clé, quelque part.";
        bulle(`<i>${pense}</i>`, 3800); M.ctx.surInfo && M.ctx.surInfo("🔒 La porte du mess est fermée à clé."); } }
    // 6. elle nous mène jusqu'au mess, à pied ; un monstre approche : elle se cache derrière nous — il faut la défendre
    if (e === 6 && !M.shMariaMess && M.shChoix === "maria") escorteMaria(now, moi);
    // 10. on repasse le porche : direction la rue
    /* 8. en sortant du mess : on court jusqu'au milieu de la cour, on tourne sur soi-même, affolé, en appelant Heather ; elle surgit du brouillard,
       court vers l'escalier R et s'y engouffre ; on crie son nom — et l'on reprend la main */
    if (e === 7 && M.shDuMess && now > (M.shEntreeT || 0) + 900) { M.shDuMess = false; const R = (M.L.portails || []).filter(pt => pt.vers === "sh-etage").map(pt => [pt, pt.seuil || centrePortail(pt)]).filter(([, c]) => c).sort((a, b) => b[1][0] - a[1][0])[0];   /* (la porte R : celle de droite, x > 0 ; la S est en face) */
      if (R) sortieMessSH(moi, R[1]); else M.shEtape = 8; }
    // 10. la clé ouvre le cadenas des encombrants
  }
  if (lieu === "sh-rue" && e >= 10 && now > (M.shEntreeT || 0) + 1200) rueFinale(now, moi);
  // (filet de sécurité) réveillé au sous-sol du mess, mais Lisa n'est pas venue : elle vient
  if (lieu === "sh-mess" && e === 10 && !M.shLauraBas && now > (M.shEntreeT || 0) + 2500) lauraBas();
  if (lieu === "sh-mess" && e === 6 && now > (M.shEntreeT || 0) + 1200) { M.shEtape = 7; M.shPopL = M.L; const mp = moi.g.position, avecMaria = M.shChoix !== "james";
    /* on entre dans la salle : quelques pas, vers là où elle est la plus dégagée (sur le seuil, la caméra était dans le mur, et Maria, en fuyant par la porte, nous passait dedans) */
    const libre = (x0, z0, dx, dz, max) => { let r = 0; while (r < max && M.L.limites(x0 + dx * (r + .3), z0 + dz * (r + .3))) r += .3; return r; };
    let dS = [0, -1], lgS = 0; for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2, dx = Math.sin(a), dz = Math.cos(a), r = libre(mp.x, mp.z, dx, dz, 16); if (r > lgS + .3) { lgS = r; dS = [dx, dz]; } }
    const pas = Math.min(2.8, Math.max(0, lgS - 1)), but = [mp.x + dS[0] * pas, mp.z + dS[1] * pas], d0 = mp.clone();
    const suite = () => {
    const mx = mp.x + dS[0] * 1.3 - dS[1] * .9, mz = mp.z + dS[1] * 1.3 + dS[0] * .9, mar = avecMaria ? apparaitreSH(poserPerso(SHN.maria, ...(placeLibre(mx, mz) || [mp.x + .8, mp.z]))) : null; if (mar) noterCarteSH(SHN.maria, 0, 0);
    /* Pyramid Head arrive du fond de la salle ; sur son chemin, un monstre : il le coupe en deux. Puis il vient pour nous */
    let pyr = null, vic = null; const sortir = () => { if (pyr) return;
      /* (au fond de la salle, devant nous, sans mur entre lui et nous : avant, il pouvait apparaître dans une autre pièce, invisible) */
      let q = null; const lg = libre(mp.x, mp.z, dS[0], dS[1], 14);
      for (const lat of [0, .8, -.8, 1.6, -1.6]) { for (let d = Math.min(10, lg - .5); d >= 4; d -= .5) { const x = mp.x + dS[0] * d - dS[1] * lat, z = mp.z + dS[1] * d + dS[0] * lat, ux = (x - mp.x) / Math.hypot(x - mp.x, z - mp.z), uz = (z - mp.z) / Math.hypot(x - mp.x, z - mp.z);
          if (M.L.limites(x, z) && libre(mp.x, mp.z, ux, uz, d) >= d - .35) { q = [x, z, mp.y]; break; } } if (q) break; }
      q = q || pointSH(0, 400) || [mp.x + dS[0] * 6, mp.z + dS[1] * 6, mp.y]; pyr = creerBeteSH("pyramid", q[0], q[1], q[2]); pyr.cine = true; pyr.portee = 60; brumeSH({ x: q[0], y: q[2], z: q[1] }, 4000);
      const v = placeLibre(q[0] + (mp.x - q[0]) * .3, q[1] + (mp.z - q[1]) * .3) || [mp.x, mp.z - 3]; vic = creerBeteSH("bras", v[0], v[1], mp.y); vic.cine = true; pyr.cineCible = vic;
      M.shRegard = vic.g.position; };
    const debut = avecMaria ? [[null, null, 1600], [SHN.maria, "C'est ici que tout recommence…"], ["moi", "Où est Heather ? Vous m'aviez dit que vous m'ameniez jusqu'à elle !"], [SHN.maria, "Écoute… Tu l'entends ?"]]
      : [[null, null, 1600], ["moi", "Il y a quelqu'un… ?"], ["moi", "La clé de James… Une issue, il disait. Tu parles."], ["moi", "Ce bruit… On dirait…"]];
    const finale = avecMaria ? [geste(() => { M.shRegard = null; }), [SHN.maria, `Il est là… Pardonne-moi, ${nom} !`, 2600], geste(() => evanouirSH(SHN.maria, [M.posEntree[0], M.posEntree[1]], 600, 1.7)), [null, null, 1500]]
      : [geste(() => { M.shRegard = null; }), ["moi", "Qu'est-ce que c'est que… ÇA ?!", 2400], [null, null, 600]];
    dialogueSH(SHN.maria, [...debut, geste(() => { musiqueRencontre(false); sirenePH(10000); }), [null, null, 4200], geste(() => { musiquePyramid(true); sortir(); }), [null, null, 8200], ...finale],   /* (la sirène d'abord, seule, pour prévenir ; puis il apparaît) */
      () => { sortir(); musiquePyramid(true); pyr.cine = false; pyr.cineCible = null; if (vic && !vic.mortT) couperEnDeux(vic, performance.now(), pyr); if (avecMaria) evanouirSH(SHN.maria, [M.posEntree[0], M.posEntree[1]], 0, 1.7); }, {}); };
    /* (il avance dans la salle, à pas lents ; la caméra derrière lui — puis on parle) */
    moi.info.allure = .55; moi.cible = new THREE.Vector3(but[0], mp.y, but[1]); moi.chemin = []; envoyerWS({ t: "aller", x: but[0], z: but[1] }); let u = 0, prec = performance.now(), parti = false;
    const go = () => { if (parti) return; parti = true; moi.info.allure = 1; moi.cible = null; moi.chemin = []; finCine(); suite(); };
    M.passerBtn = boutonPasser(() => { mp.x = but[0]; mp.z = but[1]; go(); });
    M.cine = { maj: now => { u += Math.min(.05, Math.max(0, now - prec) / 1000); prec = now; M.camera.position.set(d0.x - dS[0] * 2.6 + dS[1] * .7, mp.y + 1.9, d0.z - dS[1] * 2.6 - dS[0] * .7); M.camera.lookAt(mp.x + dS[0] * 2.5, mp.y + 1.2, mp.z + dS[1] * 2.5);
      if (u > .4 && (!moi.cible || Math.hypot(mp.x - but[0], mp.z - but[1]) < .25 || u > 5)) go(); } }; }
  /* 8. au 6e étage : Alessa — la part sombre de Heather, ce qu'elle a oublié — attend, immobile, au bout du couloir ; on marche jusqu'à elle ;
     tout près, elle parle… puis attaque, son couteau à la main */
  if (lieu === "sh-etage" && e === 8 && etageDe(moi) === ET.N) {
    if (!M.shEddieVu) { M.shEddieVu = true;
      const sg = Math.sign(moi.g.position.x) || 1, p = poserPerso(SHN.alessa, -sg * 9.5, -1.9, ET.N * ET.H); if (!p) return; p.etg = { n: ET.N, m: ET.N, zone: "P" }; p.cible = null; p.chemin = []; apparaitreSH(p); noterCarteSH(SHN.alessa, 0, 0);
      const m = { cle: "alessa", p, g: p.g, mesh: null, x: p.g.position.x, z: p.g.position.z, y: p.g.position.y, n: ET.N, v: 1.9, hp: SH_EDDIE_PV, ph: 0, mortT: 0, coupT: 0, lentT: 0, flashT: 0, cine: true, portee: 40, attend: true };
      m.surMort = () => { dire(SHN.alessa, "Papa… pourquoi… tu ne m'as pas… choisie…"); M.shEtape = 9;
        setTimeout(() => M && M.shEtape === 9 && dire(M.moiNum, "Non… non, non… Qu'est-ce que j'ai fait ?"), 2600); setTimeout(() => M && M.shEtape === 9 && dire(M.moiNum, "Alessa… Heather… Qu'est-ce que j'ai fait…"), 5200);   /* (il réalise, à genoux devant elle ; puis la sirène) */
        setTimeout(() => M && cineSireneBas(), 8000); }; M.shMonstres.push(m); M.shAlessa = m; }
    const m = M.shAlessa;
    if (m && m.attend && m.p && M.gens.get(SHN.alessa) === m.p && Math.hypot(moi.g.position.x - m.p.g.position.x, moi.g.position.z - m.p.g.position.z) < 4.2) { m.attend = false;
      dialogueSH(SHN.alessa, [[null, null, 900], [SHN.alessa, "Tu es venu jusqu'ici… papa."], ["moi", "Heather ? … Non. Tu n'es pas Heather."], [SHN.alessa, "Je suis ce qu'elle a oublié. Le feu. La douleur. Sept ans dans le noir."],
        [SHN.alessa, "Et maman ? Elle est perdue, quelque part dans le brouillard. Elle me cherche, elle crie mon nom… et personne ne lui répond."], [SHN.alessa, "Ne mens pas, papa. Je l'ai vu dans tes yeux. Tu es content qu'elle soit perdue à Silent Hill."],
        ["moi", "C'est faux ! J'ai tout fait pour la retrouver. J'ai fouillé chaque rue, chaque maison… J'ai crié son nom jusqu'à ne plus avoir de voix."], [SHN.alessa, "Menteur. Tu voulais Heather pour toi tout seul. Et moi… tu m'as laissée brûler."],
        ["moi", "Alessa… Pose ce couteau."], [SHN.alessa, "Alessa… Alessa… Tu ne sais toujours pas qui je suis, papa ?", 3800],
        [SHN.alessa, "Alors maintenant… c'est toi qui vas avoir mal."], [null, null, 600]],
        () => { m.cine = false; }); } }
  if (M.shCleObj && M.shCleObj.lieu === lieu && M.shEtape === 9) { const c = M.shCleObj; c.o.rotation.y += .04; c.o.position.y = c.y + .35 + Math.sin(now / 300) * .06;
    if (Math.hypot(moi.g.position.x - c.x, moi.g.position.z - c.z) < 1 && Math.abs(moi.g.position.y - c.y) < 1.5) { M.scene.remove(c.o); M.shCleObj = null; M.shCle = true; M.shEtape = 10; sonBruit(.25, 3000, .35); M.ctx.surInfo && M.ctx.surInfo("🔑 Tu as ramassé une petite clé."); } }
  if (M.shCleObj && M.shCleObj.lieu === lieu && !M.shCleObj.o.parent) M.scene.add(M.shCleObj.o);
}
function poserCleSH(x, y, z) { const g = new THREE.Group(), or = new THREE.MeshStandardMaterial({ color: 0xd4a22a, metalness: .85, roughness: .3, emissive: 0x3a2800 });
  const anneau = new THREE.Mesh(new THREE.TorusGeometry(.06, .016, 8, 18), or); anneau.position.y = .12; g.add(anneau);
  const tige = new THREE.Mesh(new THREE.BoxGeometry(.022, .18, .022), or); g.add(tige); for (const k of [0, 1]) { const d = new THREE.Mesh(new THREE.BoxGeometry(.05, .02, .02), or); d.position.set(.03, -.06 + k * .045, 0); g.add(d); }
  const lueur = new THREE.PointLight(0xffd070, 3, 2.5); lueur.position.y = .1; g.add(lueur); g.scale.setScalar(1.6); g.position.set(x, y + .35, z); M.scene.add(g);
  M.shCleObj = { o: g, x, y, z, lieu: M.lieu }; }
// la sortie : la clé dans le cadenas, la porte s'ouvre sur une lumière blanche… et l'on est revenu en 1990
function sortieCleSH() { if (!M || M.cine) return; const moi = moiApo(); if (!moi) return; moi.cible = null; moi.chemin = [];
  if (M.L.porteEnc) M.L.porteEnc.rotation.y = -1.25; sonBruit(.4, 1200, .5);
  const b = voile("background:#fff;opacity:0;transition:opacity 3s"); requestAnimationFrame(() => b.style.opacity = "1"); bulle("<i>La porte s'ouvre… une lumière blanche…</i>", 3000);
  const [cx, cz] = M.L.cadenasEnc, t0 = performance.now(); M.cine = { maj: now => { const u = (now - t0) / 1000; M.camera.position.set(cx + 2.2, moi.g.position.y + 1.7, cz + 1.6); M.camera.lookAt(cx - .9, moi.g.position.y + 1.1, cz); } };
  setTimeout(() => { if (!M) return; finCine(); const G = M.gresil; M.gresil = null; couperGresil(G); resetSH(); changerLieu("grande", [cx + .6, cz], -Math.PI / 2);
    setTimeout(() => { b.style.transition = "opacity 2.5s"; b.style.opacity = "0"; setTimeout(() => b.remove(), 2600); }, 400); M.ctx.surInfo && M.ctx.surInfo("🏆 Tu es sorti vivant de Silent Hill ! Te revoilà en 1990."); }, 3300); }
function peuplerSH(now) {
  if (!M || !M.L || !M.L.sh) return; if (M.shEtape == null) resetSH();
  const dt = Math.min(.05, (now - (M.shT || now)) / 1000); M.shT = now;
  if (M.shPopL !== M.L) { for (const m of M.shMonstres || []) { if (!m.p) M.scene.remove(m.g); if (m.lf) M.scene.remove(m.lf.g); } M.shPopL = M.L; M.shMonstres = [];
    if (M.shEtape === 8) { M.shEddieVu = false; M.shAlessa = null; }   /* (on a fui Alessa : elle reviendra, là-haut, au bout du couloir) */ if (M.shEtape === 11 && M.lieu === "sh-rue") M.shEtape = 10;   /* (on a fui Pyramid Head dans la rue : la scène se rejoue, on n'est pas bloqué) */ if (moiApo()) lacherBetesSH(); else M.shPopL = null; }
  if (!M.shPlaceT || now - M.shPlaceT > 400) { M.shPlaceT = now; placerBoutonsSH(); }
  if (!M.shPreT || now - M.shPreT > 2500) { M.shPreT = now; prechargerPersosSH(); }
  histoireSH(now); animerBetesSH(now, dt); pousserCartons(); lieuxVusSH(); contournerSH(); flaconsSH();
  if (M.lieu === "sh-grande" && !M.shCroix) { const q = moiApo(); if (q && Math.hypot(q.g.position.x - (ROUTE_DETRUITE[0] + ROUTE_DETRUITE[1]) / 2, q.g.position.z - (ROUTE_DETRUITE[2] + ROUTE_DETRUITE[3]) / 2) < 7 && Math.abs(q.g.position.y) < 1) M.shCroix = true; }   /* (la route effondrée, vue : une croix rouge sur la carte) */
}
// la musique de Silent Hill : au bar, « White Noiz » ; ailleurs, quand on explore, « Promise (Reprise) » — l'une s'efface quand l'autre monte
const VOLUME_FIGE = (() => { try { const t = new Audio(); t.volume = .5; return t.volume !== .5; } catch (e) { return false; } })();   // (sur iPhone, le volume d'une page ne se règle pas)
function musiqueSH(dt) {
  if (!M || M.cine) return;   // (pendant le réveil, c'est lui qui mène)
  if ((M.lieu === "sh-mess" && M.shEtape >= 7 && (M.shMonstres || []).some(m => m.imbattable)) || (M.lieu === "sh-rue" && M.shEtape === 11 && (M.shMonstres || []).some(m => m.boss && !m.fige))) { for (const a of [M.musExplo, M.musReveil]) if (a && !a.paused) a.pause(); musiquePyramid(true); return; }   /* (avec lui, son thème) */
  musiquePyramid(false);
  if (!M.musReveil) { M.musReveil = new Audio("sons/sh-reveil.mp3"); M.musReveil.volume = 0; }
  const moi = M.gens.get(M.moiNum), auBar = M.lieu === "sh-fetes" && moi && moi.g.position.z > 17.6;
  rappelBarSH(auBar);
  if (!M.musExplo) { M.musExplo = new Audio("sons/sh-explo.mp3"); M.musExplo.loop = true; M.musExplo.volume = 0; }
  if (VOLUME_FIGE) { for (const [a, on] of [[M.musReveil, auBar], [M.musExplo, !auBar]]) { a.loop = true; if (on && a.paused && performance.now() > (a.essai || 0)) { a.essai = performance.now() + 2000; a.play().catch(() => {}); } else if (!on && !a.paused) a.pause(); } return; }   // (iPhone : pas de fondu possible, on bascule)
  for (const [a, cible] of [[M.musReveil, auBar ? .85 : 0], [M.musExplo, auBar ? 0 : .8]]) {
    a.loop = true; const v = a.volume + Math.max(-dt / 2.5, Math.min(dt / 2.5, cible - a.volume)); a.volume = Math.max(0, Math.min(1, v));
    if (a.volume > .01 && a.paused && performance.now() > (a.essai || 0)) { a.essai = performance.now() + 2000; a.play().catch(() => {}); } else if (a.volume <= .01 && !a.paused) a.pause(); } }
// on ramasse la radio : elle grésille de plus en plus fort, la sirène hurle, le noir… et l'on se réveille dans le bar
function cineRadio() {
  if (!M) return; const moi = M.gens.get(M.moiNum); if (!moi) return; moi.cible = null; moi.chemin = [];
  if (M.radioObj) { M.scene.remove(M.radioObj); M.radioObj = null; }
  const t0 = performance.now(); let sirene = false, fini = false, blanc = null, titre = null;
  // les sons (fournis) : le grésillement de la radio, puis la sirène ; la musique du réveil, prête à partir
  resetSH(); const radioA = new Audio("sons/sh-radio.mp3"); radioA.volume = 1; radioA.play().catch(() => {});
  M.sireneA = new Audio("sons/sh-sirene.mp3"); M.sireneA.preload = "auto"; M.sireneA.load();
  M.musReveil = new Audio("sons/sh-reveil.mp3"); M.musReveil.preload = "auto"; M.musReveil.load();
  grainSH(true);
  const sc = M.scene; if (!sc.fog) sc.fog = new THREE.Fog(0xd9d8d4, 30, 200);
  const fin = () => { if (fini || !M) return; fini = true; finCine(); if (titre) { const t2 = titre; setTimeout(() => t2.remove(), 350); } try { radioA.pause(); } catch (e) {} if (M.sireneA && M.sireneA.paused) M.sireneA.play().catch(() => {});
    if (!blanc) blanc = voile("background:#d9d8d4;opacity:1");
    if (universOccupe("sh-fetes")) { try { M.sireneA && M.sireneA.pause(); } catch (e) {} grainSH(false); M.cineSeul = null; M.muetFete = 1; const q = moi.g.position; changerLieu(M.lieu, [q.x, q.z]); setTimeout(() => blanc && blanc.remove(), 400); refusUnivers("sh-fetes"); return; }   /* (quelqu'un est entré entre-temps : on reste ici, le brouillard se lève) */
    M.shReveil = true; changerLieu("sh-fetes", [0, 26.5], 0); setTimeout(() => blanc && blanc.remove(), 400); };
  M.passerBtn = boutonPasser(fin);
  bulle("<i>…kkssshhhh… kssshh…</i>", 2600);
  const c0 = M.camera.position.clone(), p = moi.g.position;
  M.cineSeul = -999999;   // (pendant la radio et le titre, personne d’autre ne parle : les gendarmes se taisent)
  M.cine = { t0, maj: (now) => { if (fini) return; const u = (now - t0) / 1000;
    M.camera.position.copy(c0).add(new THREE.Vector3((Math.random() - .5), (Math.random() - .5), 0).multiplyScalar(Math.min(.12, u * .02))); M.camera.lookAt(p.x, p.y + 1.2, p.z);
    if (M.grainEl) M.grainEl.style.opacity = String(Math.min(.35, .025 + u * .04));
    M.muetFete = Math.max(0, 1 - Math.max(0, u - .8) / 2.2);   /* (la musique de la fête et le brouhaha baissent vite, jusqu'au silence) */
    if (u > 4 && !sirene) { sirene = true; M.sireneA.currentTime = 0; M.sireneA.volume = 0; M.sireneA.play().catch(() => {}); }
    if (sirene && !VOLUME_FIGE) M.sireneA.volume = Math.min(1, Math.max(0, (u - 4) / 4.5));   /* (la sirène monte) */
    // le brouillard nous enveloppe : il se referme sur nous, de plus en plus épais, jusqu'au blanc
    if (u > 5) { const k = Math.min(1, (u - 5) / 6); sc.fog.color.setHex(0xd9d8d4); sc.fog.near = (1 - k) * 8; sc.fog.far = 2 + (1 - k) * 40; sc.background = sc.fog.color; radioA.volume = Math.max(.25, 1 - Math.max(0, u - 7) * .15); }
    // le titre « SILENT HILL » monte doucement dans le brouillard, reste un instant, puis le blanc l'efface
    if (u > 7.5 && !titre) { titre = voile("opacity:0;transition:opacity 2.8s;display:grid;place-items:center");   /* (les lettres seules, dans le brouillard) */
      titre.innerHTML = '<img src="images/sh/titre.webp" alt="Silent Hill" style="width:min(82%,820px);height:auto;filter:drop-shadow(0 0 6px rgba(0,0,0,.55)) drop-shadow(0 0 22px rgba(0,0,0,.35));transform:scale(1);transition:transform 7s ease-out">'; requestAnimationFrame(() => requestAnimationFrame(() => { titre.style.opacity = "1"; titre.firstChild.style.transform = "scale(1.05)"; })); }
    if (u > 11.6 && !blanc) { blanc = voile("background:#d9d8d4;opacity:0;transition:opacity 2.4s"); requestAnimationFrame(() => blanc.style.opacity = "1"); }
    if (u > 14.4) fin(); } };
}
// le réveil : allongé par terre, dans le bar, le brouillard se dissipe ; la sirène s'éteint, la musique tourne en boucle ; on se relève
function cineReveil(essai = 0, noir = null) {
  if (!M) return; noir = noir || voile("background:#d9d8d4;opacity:1;transition:opacity 4s");
  if (!estSH(M.lieu)) { noir.remove(); return; }   /* (refusé à l'entrée : on n'est pas à Silent Hill) */
  const moi = M.gens.get(M.moiNum); if (!moi) { if (essai < 60) setTimeout(() => cineReveil(essai + 1, noir), 100); else noir.remove(); return; }   // (notre bonhomme arrive avec la réponse du serveur)
  M.gresil = M.gresil || sonGresil(.006); grainSH(true);
  { const a = M.musReveil || new Audio("sons/sh-reveil.mp3"); M.musReveil = a; a.loop = true; a.currentTime = 0; a.volume = .85; a.play().catch(() => {}); }   // (« White Noiz », en continu)
  { const s = M.sireneA; if (s) { const v0 = s.volume || 1, t1 = performance.now(), baisse = () => { if (!M || M.sireneA !== s) return; const k = (performance.now() - t1) / 6000; if (k >= 1) { s.pause(); M.sireneA = null; return; } s.volume = v0 * (1 - k); requestAnimationFrame(baisse); }; baisse(); } }
  moi.info.mortT = performance.now() - 2000;   // (couché, tout de suite)
  const p = moi.g.position, t0 = performance.now(); requestAnimationFrame(() => { noir.style.opacity = "0"; }); setTimeout(() => noir.remove(), 4200);
  /* Maria, debout près de nous, nous regarde ; elle parle ; elle sort par la porte du bar, et le brouillard l'avale. Alors seulement, on se relève */
  const PORTE = [0, 23.1]; let maria = null, dit = false, part = false, leve = false, ou = false, fini = false, u = 0, prec = t0;
  const fin = () => { if (fini || !M) return; fini = true; moi.info.mortT = 0; if (M.gens.get(SHN.maria)) retirerAncien(SHN.maria); if (!M.shEtape) M.shEtape = 1; finCine(); placerCamera(true);
    M.ctx.surInfo && M.ctx.surInfo("📻 La radio grésille, sur le comptoir. Prends-la : elle grésillera plus fort quand un monstre approche. Pour rentrer, il suffira de l'éteindre."); };
  M.passerBtn = boutonPasser(fin);
  M.cine = { t0, maj: (now) => { u += Math.min(.05, Math.max(0, now - prec) / 1000); prec = now;
    if (!maria) { maria = poserPerso(SHN.maria, p.x + .75, p.z - 1.35, p.y); if (maria) { maria.cible = null; noterCarteSH(SHN.maria, 0, 0); } }
    const q = M.gens.get(SHN.maria), cible = u < 10 && q ? q.g.position : p;
    /* (allongé : la caméra en hauteur, de côté — on voit notre bonhomme par terre et Maria debout ; puis on suit Maria vers la porte ; puis on se relève) */
    if (u < 10.5) { M.camera.position.set(p.x - .6, p.y + 1.9, p.z + 1.8); if (u < 6.6 || !q) M.camera.lookAt(q ? (p.x + q.g.position.x) / 2 : p.x, p.y + .55, q ? (p.z + q.g.position.z) / 2 : p.z); else M.camera.lookAt(q.g.position.x, p.y + .9, q.g.position.z); }
    else { const h = .35 + Math.min(1, (u - 10.5) / 1.5) * 1.25; M.camera.position.set(p.x + .9, p.y + h, p.z + 1.4); M.camera.lookAt(p.x, p.y + .9, p.z - .5); }
    if (u > 3 && !dit && q) { dit = true; dire(SHN.maria, `Nous nous reverrons très vite, ${prenomSH()}…`); }
    if (u > 6.6 && !part && q) { part = true; q.info.allure = .45; q.cible = new THREE.Vector3(PORTE[0], q.g.position.y, PORTE[1]); q.chemin = [new THREE.Vector3(PORTE[0], q.g.position.y, PORTE[1] - 1.2)]; evanouirSH(SHN.maria, null, 1500); }
    if (u > 10.5 && !leve) { leve = true; moi.info.mortT = 0; }
    if (u > 12.2 && !ou) { ou = true; bulle("<i>… Où… où suis-je ?</i>", 2500); }
    if (u > 14.8) fin(); } };
}
// on éteint la radio, au comptoir : retour dans la vraie caserne, au même bar

({ silentHill, cineRadio, tirerSH, monstresSHVises, monstreSHPres, sortieCleSH, montrerPhotoSH, cineReveil, cineFinale, cineReveilBas, apparaitreSH, couperEnDeux, evanouirSH, infirmiereFetes, jamesFin, creerBeteSH, poserPerso, passageFin, montrerCleMess });
