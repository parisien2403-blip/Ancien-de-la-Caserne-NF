/* (10.145) Notre-Dame de Paris et les quais de Seine, à l'ancienne (d'après les images du quartier) :
   rive gauche, le grand quai pavé, les kiosques des bouquinistes, les cafés à stores rouges, l'escalier qui descend au bas-port, la bouche de métro ;
   la Seine, les bateaux-mouches, les vedettes, la péniche ; le pont de pierre à arches et demi-lunes, qui mène au parvis ;
   l'île de la Cité : la chaussée du quai et l'abribus, le parvis entouré d'immeubles, la cathédrale — la façade face au pont ; la nef, les arcs-boutants, la flèche, le chevet, le square derrière.
   Chargé par la matrice (eval direct) la première fois qu'on y va. */
function construireNotreDame(A, L, scene) {
  const ECH = PETIT ? .5 : (MOBILE || GPU_MODESTE) ? .7 : 1, PEU = PETIT || MOBILE || GPU_MODESTE;
  let graine = 77; const al = () => (graine = (graine * 16807) % 2147483647) / 2147483647;
  const tT = (w, h, f, rx, ry) => { const c = document.createElement("canvas"); c.width = Math.max(8, Math.round(w * ECH)); c.height = Math.max(8, Math.round(h * ECH)); const x = c.getContext("2d"); x.scale(c.width / w, c.height / h); f(x, w, h);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; if (rx) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry || 1); } return t; };
  const mat = (o) => new THREE.MeshStandardMaterial({ roughness: .85, ...o });
  const add = (geo, m, x, y, z, ry = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.y = ry; o.receiveShadow = true; scene.add(o); return o; };
  const box = (w, h, d, m, x, y, z, ry = 0) => { const g = new THREE.BoxGeometry(w, h, d); if (typeof PIERRES !== "undefined" && PIERRES.has(m)) uvMonde(g, w, h, d); return add(g, m, x, y, z, ry); };
  const cyl = (rt, rb, h, m, x, y, z, seg = 10) => add(new THREE.CylinderGeometry(rt, rb, h, seg), m, x, y, z);
  const sol = (x0, x1, z0, z1, m, y) => { const s = add(new THREE.PlaneGeometry(x1 - x0, z1 - z0), m, (x0 + x1) / 2, y, (z0 + z1) / 2); s.rotation.x = -Math.PI / 2; return s; };
  L.nuitObjets = L.nuitObjets || []; L.silhouettes = L.silhouettes || []; const NUIT = [];
  const serif = "Georgia, 'Times New Roman', serif";
  // les repères : la Seine (z de -18 à 18, à -6,4 m), le bas-port (à -5,4 m), le quai haut (à 0)
  const YE = -6.4, YB = -5.4, XS = 150;   /* (10.145 : les quais plus hauts au-dessus de l'eau, les bateaux-mouches passent sous le pont) */

  /* ---------- les matières ---------- */
  const pierreT = (base, joint, rx, ry, bloc = [64, 32]) => tT(256, 256, (c, w, h) => { c.fillStyle = base; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += bloc[1]) for (let x = (y / bloc[1] % 2) * bloc[0] / 2 - bloc[0]; x < w; x += bloc[0]) { c.fillStyle = `rgba(${al() < .5 ? "90,80,60" : "255,250,235"},${al() * .1})`; c.fillRect(x + 1, y + 1, bloc[0] - 2, bloc[1] - 2); c.fillStyle = joint; c.fillRect(x, y, bloc[0], 1.5); c.fillRect(x, y, 1.5, bloc[1]); }
    for (let i = 0; i < 300; i++) { c.fillStyle = `rgba(60,50,40,${al() * .08})`; c.fillRect(al() * w, al() * h, 2 + al() * 8, 2 + al() * 8); } }, rx, ry);
  const paveT = (base, rx, ry) => tT(256, 256, (c, w, h) => { c.fillStyle = "#4a4640"; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 16) for (let x = (y / 16 % 2) * 10; x < w; x += 20) { const k = al(); c.fillStyle = `rgb(${base[0] + k * 30 - 15},${base[1] + k * 30 - 15},${base[2] + k * 26 - 13})`; c.beginPath(); c.roundRect(x + 1.5, y + 1.5, 17, 13, 3); c.fill(); } }, rx, ry);
  const quaiM = mat({ map: pierreT("#c8bca2", "rgba(90,80,60,.5)", 1, 1, [64, 32]) });   /* (10.145 : la pierre à l'échelle — des blocs d'environ 1,2 m × 0,6 m, sur chaque face) */
  const murM = mat({ map: pierreT("#b8ac92", "rgba(80,70,50,.55)", 1, 1, [64, 32]) });
  const PIERRES = new Set([quaiM, murM]), TUILE = 4.8;
  const uvMonde = (g, w, h, d) => { const uv = g.attributes.uv, dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]]; for (let f = 0; f < 6; f++) for (let v = 0; v < 4; v++) { const i = f * 4 + v; uv.setXY(i, uv.getX(i) * dims[f][0] / TUILE, uv.getY(i) * dims[f][1] / TUILE); } uv.needsUpdate = true; return g; };
  const paveM = mat({ map: paveT([120, 116, 108], 40, 3), roughness: .95 });
  const paveB = mat({ map: paveT([108, 104, 96], 60, 2), roughness: .95 });
  const trottM = mat({ map: tT(128, 128, (c, w, h) => { c.fillStyle = "#a8a296"; c.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { c.fillStyle = ["#9a948a", "#b6b0a4", "#8e887e"][i % 3]; c.fillRect(al() * w, al() * h, 2, 2); } }, 60, 3), roughness: .95 });
  const routeM = mat({ map: tT(128, 128, (c, w, h) => { c.fillStyle = "#4a4a4c"; c.fillRect(0, 0, w, h); for (let i = 0; i < 1200; i++) { c.fillStyle = ["#3e3e40", "#58585a", "#444446"][i % 3]; c.fillRect(al() * w, al() * h, 2, 2); } }, 80, 4), roughness: .95 });
  const parvisM = mat({ map: tT(256, 256, (c, w, h) => { c.fillStyle = "#cfc6b2"; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 32) for (let x = 0; x < w; x += 64) { c.fillStyle = `rgba(${al() < .5 ? "120,110,90" : "255,250,240"},${al() * .12})`; c.fillRect(x + 1, y + 1, 62, 30); c.fillStyle = "rgba(100,90,70,.35)"; c.fillRect(x, y, 64, 1); c.fillRect(x, y, 1, 32); } }, 30, 30), roughness: .9 });

  /* ---------- la Seine : l'eau verte et mouvante, les reflets ---------- */
  const eauT = tT(256, 256, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#3e5a52"); g.addColorStop(1, "#2e4a46"); c.fillStyle = g; c.fillRect(0, 0, w, h); for (let i = 0; i < 260; i++) { c.strokeStyle = `rgba(${al() < .5 ? "190,215,205" : "20,40,36"},${.08 + al() * .14})`; c.lineWidth = 1 + al() * 1.5; c.beginPath(); const x = al() * w, y = al() * h; c.moveTo(x, y); c.quadraticCurveTo(x + 12, y - 3, x + 26 + al() * 20, y); c.stroke(); } }, 30, 8);
  const eau = sol(-XS, XS, -18, 18, mat({ map: eauT, roughness: .15, metalness: .3, color: 0xb8d0c8 }), YE); eau.userData.anime = true; L.sol = eau;

  /* ---------- (d'après les images : le quartier exact) rive gauche, le grand quai pavé, ses kiosques de bouquinistes, l'escalier qui descend au bas-port ;
     le pont de pierre à arches, ses demi-lunes et ses réverbères, qui mène tout droit au parvis ; la façade de Notre-Dame face au pont ---------- */
  const PP = [-10, 8], horsPont = (x, m = 2) => !(x > PP[0] - m && x < PP[1] + m);
  const ESC = [-52, -36], RAMPE_C = [30, 46];   // (le grand escalier de la rive gauche ; la rampe de l'île)
  const OBS = [];   // (ce qu'on ne traverse pas : les kiosques, les tables, les troncs…)
  const lig = mat({ color: 0xe2dccc, roughness: .9 });
  for (const s of [1, -1]) {
    sol(-XS, XS, s > 0 ? 18 : -22.5, s > 0 ? 22.5 : -18, paveB, YB);
    box(XS * 2, YB - YE + .2, .6, murM, 0, (YB + YE) / 2, s * 18);   // (le bord du bas-port, dans l'eau)
    const tr = s > 0 ? ESC : RAMPE_C;
    for (const [a, b] of [[-XS, tr[0]], [tr[1], XS]]) box(b - a, -YB, 2.8, murM, (a + b) / 2, YB / 2, s * 23.9);   // le mur de quai, épais
    const pa = s > 0 ? ESC : [RAMPE_C[1] - 4, RAMPE_C[1]];
    { let seg = [[-XS, XS]]; for (const [o0, o1] of [pa, PP]) seg = seg.flatMap(([a, b]) => o1 <= a || o0 >= b ? [[a, b]] : [[a, o0], [o1, b]].filter(([u, v]) => v - u > .1));
      for (const [a, b] of seg) { box(b - a, 1, .55, quaiM, (a + b) / 2, .5, s * 25.3); box(b - a, .12, .8, quaiM, (a + b) / 2, 1.06, s * 25.3); } }   // le parapet et sa tablette
  }
  // la rampe de l'île
  { const [r0, r1] = RAMPE_C; box(r1 - r0, -YB, .4, murM, (r0 + r1) / 2, YB / 2, -25.1);
    const g = new THREE.PlaneGeometry(r1 - r0, 2.4); g.rotateX(-Math.PI / 2); const P = g.attributes.position; for (let i = 0; i < P.count; i++) { const x = P.getX(i) + (r0 + r1) / 2, u = (r1 - x) / (r1 - r0); P.setY(i, u < .25 ? 0 : YB * (u - .25) / .75); } g.computeVertexNormals();
    add(g, paveB, (r0 + r1) / 2, .01, -23.8); }
  // le grand escalier de pierre de la rive gauche, large, qui descend vers l'eau
  { const [e0, e1] = ESC, N = 20, D = 8.5 / N;
    for (let i = 0; i < N; i++) { const top = YB * (N - 1 - i) / N, z = 22.5 + (i + .5) * D; box(e1 - e0, top - YB + .02, D + .02, quaiM, (e0 + e1) / 2, (top + YB) / 2, z); box(e1 - e0, .04, .06, lig, (e0 + e1) / 2, top + .01, 22.5 + i * D + .03); }
    for (const x of [e0 - .3, e1 + .3]) { box(.6, 1 - YB, 8.5, quaiM, x, (1 + YB) / 2, 26.75); box(.8, .12, 8.6, quaiM, x, 1.06, 26.75); }
    OBS.push([e0 - .7, e0 + .1, 22.3, 31.2], [e1 - .1, e1 + .7, 22.3, 31.2]); }
  // les sols : le grand quai pavé (rive gauche), la rue du Petit-Pont, le quai de l'île et sa chaussée, le parvis
  sol(-XS, ESC[0], 25.6, 31, paveM, .02); sol(ESC[1], XS, 25.6, 31, paveM, .02); sol(-XS, XS, 31, 46, paveM, .02); sol(-XS, XS, 46, 140, paveM, .01);
  sol(PP[0], PP[1], 25.6, 130, routeM, .03); for (const sx of [PP[0], PP[1]]) box(.25, .14, 104, quaiM, sx, .07, 78);
  sol(-XS, XS, -31, -25.6, trottM, .02); sol(-XS, XS, -30.5, -26, routeM, .03); for (const z of [-30.5, -26]) box(XS * 2, .14, .25, quaiM, 0, .07, z);
  { const pm = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), lig); void pm; for (let x = -XS; x < XS; x += 6) box(3, .01, .12, lig, x, .04, -28.25); }
  sol(-XS, XS, -232, -31, paveM, .01); sol(-62, 62, -215, -31, parvisM, .015);
  // sur le parvis, le tracé des anciennes rues, en pierre claire
  for (const [a, b, c, d] of [[-44, -22, -64, -40], [-14, 12, -60, -44], [22, 46, -64, -38], [-50, -30, -150, -100]]) { box(b - a, .015, .22, lig, (a + b) / 2, .03, c); box(b - a, .015, .22, lig, (a + b) / 2, .03, d); box(.22, .015, d - c, lig, a, .03, (c + d) / 2); box(.22, .015, d - c, lig, b, .03, (c + d) / 2); }

  /* ---------- les platanes, les réverbères, les bancs ---------- */
  const fonteR = mat({ color: 0x23302a, metalness: .5, roughness: .5 });
  const tronc = mat({ color: 0x8a8070, roughness: .9 }), feuil = [mat({ color: 0x4a6a2a, roughness: 1, flatShading: true }), mat({ color: 0x5a7a34, roughness: 1, flatShading: true }), mat({ color: 0x3e5a24, roughness: 1, flatShading: true })];
  const platane = (x, z, k = 1) => { cyl(.22 * k, .34 * k, 7 * k, tronc, x, 3.5 * k, z, 8); for (let i = 0; i < 5; i++) add(new THREE.IcosahedronGeometry((2.2 + al() * 1.4) * k, 1), feuil[i % 3], x + (al() - .5) * 3 * k, (7.6 + al() * 2.6) * k, z + (al() - .5) * 3 * k); OBS.push([x - .45, x + .45, z - .45, z + .45]); };
  const reverbere = (x, z, y = 0) => { cyl(.06, .11, 4.2, fonteR, x, y + 2.1, z, 8); cyl(.13, .13, .5, fonteR, x, y + .25, z, 8); const lan = new THREE.Mesh(new THREE.CylinderGeometry(.2, .12, .5, 6), new THREE.MeshStandardMaterial({ color: 0xf2e6c4, emissive: 0xffd590, emissiveIntensity: .05 })); lan.position.set(x, y + 4.5, z); scene.add(lan); NUIT.push([lan.material, .05, 1.2]);
    cyl(.22, .05, .18, fonteR, x, y + 4.82, z, 6); const l = new THREE.PointLight(0xffd08a, 14, 14, 1.5); l.position.set(x, y + 4.3, z); l.visible = false; scene.add(l); L.nuitObjets.push(l); OBS.push([x - .2, x + .2, z - .2, z + .2]); };
  const banc = (x, z, ry, y = 0, assis = true) => { const v = mat({ color: 0x2e5a3a }), T = new THREE.Matrix4().makeRotationY(ry).setPosition(x, y, z), P = (w, h, d, m, px, py, pz) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(px, py, pz); o.applyMatrix4(T); scene.add(o); };
    for (let l = 0; l < 3; l++) P(1.8, .04, .1, v, 0, .45, -.12 + l * .13); P(1.8, .3, .04, v, 0, .7, -.22); for (const sx of [-.75, .75]) P(.06, .45, .45, fonteR, sx, .22, -.03);
    if (assis) (L.tabourets = L.tabourets || []).push([x + Math.cos(ry) * -.45, z - Math.sin(ry) * -.45, ry, .46], [x + Math.cos(ry) * .45, z - Math.sin(ry) * .45, ry, .46]); };
  L.nbTabouretsSalle = 0;

  /* ---------- les kiosques des bouquinistes : la caisse verte, le toit d'ardoise, les rayons de livres, les gravures et les affiches ---------- */
  { const vert = mat({ color: 0x1f4a32, roughness: .6 }), vertC = mat({ color: 0x2a5a3e, roughness: .6 }), ardoise = mat({ color: 0x5a6068, roughness: .5, metalness: .2 }), bois = mat({ color: 0x6a4a2a, roughness: .8 });
    const affT = [0, 1, 2, 3].map(k => tT(128, 96, (c, w, h) => { c.fillStyle = ["#f2ead2", "#e8dcc0", "#efe6d0", "#e4d8bc"][k]; c.fillRect(0, 0, w, h); for (let i = 0; i < 6; i++) { const x = 6 + (i % 3) * 40, y = 6 + Math.floor(i / 3) * 44; c.fillStyle = ["#c83a2a", "#2a5a9a", "#d8a020", "#3a3a3a", "#6a8a4a", "#8a3a6a"][(i + k) % 6]; c.fillRect(x, y, 34, 38); c.fillStyle = "rgba(255,255,255,.6)"; c.fillRect(x + 4, y + 4, 26, 10); c.fillStyle = "#1a1a1a"; c.font = "bold 7px Georgia"; c.fillText(["PARIS", "1900", "SEINE", "MOULIN", "ROMAN", "AFFICHE"][(i + k * 2) % 6], x + 5, y + 12); } }));
    const affM = affT.map(t => mat({ map: t, roughness: .9 }));
    const gravT = tT(64, 80, (c, w, h) => { c.fillStyle = "#efe6cc"; c.fillRect(0, 0, w, h); c.strokeStyle = "#3a3024"; c.lineWidth = 3; c.strokeRect(4, 4, w - 8, h - 8); c.fillStyle = "#6a5a40"; c.beginPath(); c.moveTo(10, 60); c.lineTo(20, 30); c.lineTo(30, 44); c.lineTo(42, 22); c.lineTo(54, 60); c.fill(); }), gravM = mat({ map: gravT, roughness: .9 });
    const LIV = [], cols = [0xc83a2a, 0x2a5aa8, 0xe8d8b0, 0x2a7a4a, 0xd8a020, 0x7a2a6a, 0xf2f0ea, 0x3a2a1a, 0xc86a2a, 0x8a6a4a];
    const kiosque = (x, z, ry) => { const T = new THREE.Matrix4().makeRotationY(ry).setPosition(x, 0, z), k = (x * 7 | 0) & 3;
      const P = (w, h, d, m, px, py, pz, rx = 0) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(px, py, pz); o.rotation.x = rx; o.applyMatrix4(T); o.castShadow = true; scene.add(o); return o; };
      P(2.7, 2.2, .08, vert, 0, 1.1, -.76); for (const sx of [-1.33, 1.33]) P(.08, 2.2, 1.56, vert, sx, 1.1, 0);
      P(2.66, .85, 1.1, vertC, 0, .43, .2); P(2.5, .04, 1.0, affM[k], 0, .9, .22, -.18);   // (le comptoir, ses bacs de gravures)
      P(3.0, .07, 2.1, ardoise, 0, 2.32, .1, .14); P(3.0, .2, .06, vert, 0, 2.15, 1.12);   // (le toit d'ardoise, son lambrequin)
      for (let r = 0; r < 3; r++) { P(2.5, .04, .3, bois, 0, 1.12 + r * .36, -.58); for (let i = 0; i < 26; i++) if (al() < .9) LIV.push([new THREE.Vector3(-1.2 + i * .094, 1.25 + r * .36, -.55).applyMatrix4(T), ry, cols[(i * 3 + r + k) % 10]]); }
      for (const sx of [-1, 1]) { P(.62, .8, .02, al() < .5 ? gravM : affM[(k + 1) & 3], sx * 1.0, 1.72, .78); }   // (les gravures pendues devant)
      const c = new THREE.Vector3(0, 0, 0).applyMatrix4(T); OBS.push([c.x - 1.4, c.x + 1.4, c.z - .85, c.z + .85]); };
    // la rangée le long du parapet, ouverte vers les immeubles : des groupes de quatre, une allée entre
    const KX = []; for (let x = -XS + 8; x < XS - 6;) { for (let i = 0; i < 4; i++) KX.push(x + i * 2.85); x += 4 * 2.85 + 7; }
    for (const x of KX) { if (!horsPont(x, 5) || (x > ESC[0] - 3 && x < ESC[1] + 3)) continue; kiosque(x, 27.6, 0); }
    // et quelques-uns devant les immeubles, ouverts vers la Seine
    for (const x of [-118, -115.2, -84, -81.2, 52, 54.8, 86, 88.8]) kiosque(x, 42.6, Math.PI);
    if (LIV.length) { const im = new THREE.InstancedMesh(new THREE.BoxGeometry(.06, .26, .2), mat({ roughness: .7 }), LIV.length), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), co = new THREE.Color(), un = new THREE.Vector3(1, 1, 1);
      LIV.forEach(([p, ry, c], i) => { q.setFromEuler(e.set(0, ry, (i % 7 === 0) ? .2 : 0)); m4.compose(p, q, un); im.setMatrixAt(i, m4); im.setColorAt(i, co.setHex(c)); }); im.instanceMatrix.needsUpdate = true; scene.add(im); }
    // les bancs dans les allées, entre les kiosques ; d'autres au bas-port, face à l'eau
    for (let i = 3; i < KX.length - 1; i += 4) { const x = KX[i] + 3.5 + 1.42; if (!horsPont(x, 5) || (x > ESC[0] - 3 && x < ESC[1] + 3)) continue; banc(x, 27.4, 0); }
    for (const x of [-120, -95, -70, -25, 20, 95, 120]) banc(x, 21.9, Math.PI, YB, false);
    for (const x of [-120, -90, -60, -20, 20, 50, 80, 110, 140]) { if (horsPont(x, 3)) reverbere(x, 30.6); }
    for (const x of [-140, -100, -66, -24, 18, 40, 70, 100, 130]) platane(x, 30.2, x === -24 || x === 18 ? 1.25 : 1);
    for (let x = -XS + 12; x < XS; x += 24) if (horsPont(x, 5) && Math.abs(x - 38) > 6) reverbere(x, -25.9);
    for (const [x, z] of [[-50, -35], [50, -35], [-50, -68], [50, -68], [-30, -50], [28, -50]]) reverbere(x, z);
    for (const [x, z, r] of [[-56, -45, Math.PI / 2], [-56, -58, Math.PI / 2], [56, -45, -Math.PI / 2], [56, -58, -Math.PI / 2]]) banc(x, z, r);
    for (const [x, z, k] of [[-56, -34.5, 1.3], [56, -34.5, 1.3], [-57, -66, 1.1], [57, -66, 1.1]]) platane(x, z, k);
    for (let z = -80; z > -200; z -= 17) { platane(-41, z, .95); platane(40, z, .95); }
    { const herbe = mat({ color: 0x5a7a3a, roughness: 1 }); sol(-36, 36, -215, -205, herbe, .03); for (const x of [-30, -15, 0, 15, 30]) platane(x, -211, 1.1); } }

  /* ---------- les immeubles anciens : la façade de pierre, les balcons filants, les toits d'ardoise ; au rez-de-chaussée les cafés à stores rouges, les librairies à stores verts ---------- */
  const teintes = ["#dccaa6", "#d6c39e", "#e2d2b2", "#d2bf98", "#dac8a8"];   /* (la pierre de taille chaude des images) */
  const ENS = [["CAFÉ LE PETIT PONT", "#8a1a1a", 1], ["SHAKESPEARE AND COMPANY", "#1e4a2a", 0], ["BRASSERIE NOTRE-DAME", "#8a1a1a", 1], ["LIBRAIRIE ANCIENNE", "#1e4a3a", 0], ["CAFÉ DE LA SEINE", "#7a1a1a", 1], ["GALERIE D'ESTAMPES", "#2e4a3a", 0], ["LE BISTROT DU PARVIS", "#8a2a1a", 1], ["SOUVENIRS DE PARIS", "#1a4a3a", 0], ["AUX TOURS DE NOTRE-DAME", "#8a1a1a", 1], ["PAPETERIE", "#2a4a3a", 0]];
  const storeR = mat({ color: 0xa82424, roughness: .8 }), storeV = mat({ color: 0x2a4a3a, roughness: .8 }), tableM = mat({ color: 0x2a2a2a, metalness: .4, roughness: .5 }), chaiseM = mat({ color: 0xb8925a, roughness: .7 });
  let kI = 0;
  /* ---------- (d'après les images, construits en relief) les immeubles de pierre de taille : les bossages du rez-de-chaussée, les boutiques et leurs stores,
     la porte cochère ; les fenêtres et leurs encadrements, les frontons, les corniches, les balcons filants de fer forgé, les balconnets ; la corniche à denticules ;
     le toit de zinc à la Mansart, ses lucarnes, les souches de cheminée en brique et leurs pots ; le dôme d'angle ---------- */
  const uvBox = (g, w, h, d, tu) => { const uv = g.attributes.uv, dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]]; for (let f = 0; f < 6; f++) for (let v = 0; v < 4; v++) { const i = f * 4 + v; uv.setXY(i, uv.getX(i) * dims[f][0] / tu, uv.getY(i) * dims[f][1] / tu); } uv.needsUpdate = true; return g; };
  const mkInst = () => { const R = {}; return { def: (k, geo, m) => { R[k] = { geo, m, L: [] }; },
    P: (k, T, x, y, z, sx, sy, sz, rx = 0, col = null, ry = 0, rz = 0) => { const m4 = new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new THREE.Vector3(sx, sy, sz)); if (T) m4.premultiply(T); R[k].L.push([m4, col]); },
    fin: () => { const out = []; for (const k in R) { const r = R[k]; if (!r.L.length) continue; const im = new THREE.InstancedMesh(r.geo, r.m, r.L.length), co = new THREE.Color(), aC = r.L.some(q => q[1] != null);
      r.L.forEach(([m4, c], i) => { im.setMatrixAt(i, m4); if (aC) im.setColorAt(i, co.set(c == null ? 0xffffff : c)); }); im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; im.receiveShadow = true; im.frustumCulled = false; scene.add(im); out.push([k, im]); } return out; } }; };
  const pierreFinT = tT(128, 128, (c, w, h) => { c.fillStyle = "#f6f2ea"; c.fillRect(0, 0, w, h); for (let i = 0; i < 500; i++) { c.fillStyle = `rgba(${al() < .5 ? "120,105,80" : "255,255,250"},${al() * .09})`; c.fillRect(al() * w, al() * h, 1 + al() * 5, 1 + al() * 4); } });
  const murT = tT(256, 256, (c, w, h) => { c.fillStyle = "#ffffff"; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 32) for (let x = ((y / 32) % 2) * 32 - 64; x < w; x += 64) { c.fillStyle = `rgba(${al() < .5 ? "130,115,90" : "255,252,245"},${al() * .1})`; c.fillRect(x + 1, y + 1, 62, 30); c.fillStyle = "rgba(120,104,80,.32)"; c.fillRect(x, y, 64, 1.5); c.fillRect(x, y, 1.5, 32); } for (let i = 0; i < 400; i++) { c.fillStyle = `rgba(90,80,60,${al() * .06})`; c.fillRect(al() * w, al() * h, 2 + al() * 6, 1 + al() * 3); } }, 1, 1);
  const vitreT = tT(64, 112, (c, w, h) => { c.fillStyle = "#efe9dc"; c.fillRect(0, 0, w, h); const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#a8bccb"); g.addColorStop(.45, "#4a5a68"); g.addColorStop(1, "#2a333c"); c.fillStyle = g; c.fillRect(5, 5, w - 10, h - 10);
    c.fillStyle = "rgba(238,230,214,.75)"; c.fillRect(6, 6, 9, h * .8); c.fillRect(w - 15, 6, 9, h * .8); c.fillStyle = "#efe9dc"; c.fillRect(w / 2 - 1.5, 0, 3, h); c.fillRect(0, 40, w, 2.5); c.fillRect(0, 76, w, 2.5); c.fillStyle = "rgba(255,255,255,.14)"; c.beginPath(); c.moveTo(8, 60); c.lineTo(30, 8); c.lineTo(40, 8); c.lineTo(14, 70); c.fill(); });
  const ferT = tT(128, 96, (c, w, h) => { c.clearRect(0, 0, w, h); c.strokeStyle = "#000"; c.lineWidth = 5; for (const y of [4, 92]) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); } c.lineWidth = 3; c.beginPath(); c.moveTo(0, 72); c.lineTo(w, 72); c.stroke(); c.beginPath(); c.moveTo(0, 14); c.lineTo(w, 14); c.stroke();
    c.lineWidth = 2; for (let x = 4; x < w; x += 8) { c.beginPath(); c.moveTo(x, 72); c.lineTo(x, 92); c.stroke(); } for (let x = 0; x <= w; x += 32) { c.lineWidth = 3; c.beginPath(); c.moveTo(x, 4); c.lineTo(x, 92); c.stroke(); c.lineWidth = 2.4; for (const s of [-1, 1]) { c.beginPath(); c.arc(x + s * 9, 30, 8, 0, 7); c.stroke(); c.beginPath(); c.arc(x + s * 9, 55, 8, 0, 7); c.stroke(); } c.beginPath(); c.moveTo(x + 16, 14); c.lineTo(x + 16, 72); c.stroke(); } });
  const vitrineT = tT(128, 96, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#f4dcaa"); g.addColorStop(1, "#7a5838"); c.fillStyle = g; c.fillRect(0, 0, w, h); for (let r = 0; r < 4; r++) { const y = 14 + r * 21; c.fillStyle = "#5a3e26"; c.fillRect(0, y + 14, w, 3); for (let x = 2; x < w - 4; x += 4 + al() * 3) { c.fillStyle = ["#a82a22", "#2a4a8a", "#e8d8b0", "#2a6a3a", "#c8902a", "#6a2a5a", "#f2efe6"][(al() * 7) | 0]; c.fillRect(x, y + 2 + al() * 3, 3, 12); } }
    c.fillStyle = "rgba(255,255,255,.16)"; c.beginPath(); c.moveTo(10, h); c.lineTo(50, 0); c.lineTo(66, 0); c.lineTo(26, h); c.fill(); });
  const zincT = tT(64, 64, (c, w, h) => { c.fillStyle = "#8c96a2"; c.fillRect(0, 0, w, h); for (let i = 0; i < 200; i++) { c.fillStyle = `rgba(${al() < .5 ? "60,70,80" : "220,228,236"},${al() * .08})`; c.fillRect(al() * w, al() * h, 3, 3); } for (let x = 0; x < w; x += 16) { c.fillStyle = "#b2bcc6"; c.fillRect(x, 0, 2, h); c.fillStyle = "#5e6874"; c.fillRect(x + 2, 0, 1, h); } }, 1, 1);
  const zincM = mat({ map: zincT, roughness: .45, metalness: .35 }), MURM = {};
  const IM = mkInst(), ub = new THREE.BoxGeometry(1, 1, 1);
  const frS = new THREE.Shape(); frS.moveTo(-.5, 0); frS.lineTo(.5, 0); frS.lineTo(0, 1); frS.closePath(); const frontonG = new THREE.ExtrudeGeometry(frS, { depth: 1, bevelEnabled: false }); frontonG.translate(0, 0, -.5);
  IM.def("pierre", ub, mat({ map: pierreFinT, roughness: .85 })); IM.def("fronton", frontonG, mat({ map: pierreFinT, roughness: .85 }));
  IM.def("vitre", new THREE.PlaneGeometry(1, 1), mat({ map: vitreT, roughness: .25, metalness: .3 }));
  IM.def("fer", new THREE.PlaneGeometry(1, 1), new THREE.MeshStandardMaterial({ map: ferT, alphaTest: .5, side: THREE.DoubleSide, color: 0x1c1c1c, roughness: .6, metalness: .4 }));
  IM.def("zinc", ub, mat({ color: 0x8c96a2, roughness: .45, metalness: .35 })); IM.def("brique", ub, mat({ color: 0xa65a3e, roughness: .9 })); IM.def("pot", new THREE.CylinderGeometry(.5, .6, 1, 8), mat({ color: 0xc0623e, roughness: .8 }));
  IM.def("store", ub, mat({ roughness: .85 })); IM.def("peint", ub, mat({ roughness: .55 })); IM.def("bois", ub, mat({ color: 0x6a4426, roughness: .7 }));
  IM.def("vitrine", new THREE.PlaneGeometry(1, 1), mat({ map: vitrineT, emissive: 0xffe0b0, emissiveMap: vitrineT, emissiveIntensity: .22, roughness: .3 }));
  IM.def("lumiere", new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0xffd48a }));
  const LARG = { long: 30, angle: 18, std: 21 };
  const immeuble = (x, z, rot, W = 18, nE = 5, terrasse = true, type = null, coin = 0) => { const k = kI++, [nom, coul, cafe] = ENS[k % ENS.length], te = teintes[k % teintes.length];
    const T = new THREE.Matrix4().makeRotationY(rot).setPosition(x, 0, z), P = (kk, ...a) => IM.P(kk, T, ...a), HR = 4.4, HE = 3.15, H = HR + nE * HE, D = 12;
    const mesh = (g, m, px, py, pz) => { const o = new THREE.Mesh(g, m); o.position.set(px, py, pz); o.applyMatrix4(T); o.receiveShadow = true; scene.add(o); return o; };
    { const g = uvBox(new THREE.BoxGeometry(W, H, D), W, H, D, 4); mesh(g, MURM[te] || (MURM[te] = mat({ map: murT, color: te, roughness: .9 })), 0, H / 2, -D / 2); }
    const n = Math.max(3, Math.round(W / 2.75)), pas = W / n, xs = [...Array(n)].map((_, i) => -W / 2 + pas * (i + .5)), porte = type === "long" ? Math.floor(n / 2) : -1, sc = cafe ? 0x8a1c1c : 0x2a4a38, pc = cafe ? 0x5a1414 : 0x23382c;
    // le rez-de-chaussée : les bossages, les boutiques, leurs stores, la porte cochère
    for (let j = 0; j < 8; j++) P("pierre", 0, .3 + j * .52, .05, W, .44, .1, 0, te);
    xs.forEach((xc, i) => { const w = pas - .9;
      if (i === porte) { P("bois", xc, 1.9, .1, 2.3, 3.8, .1); for (const s of [-1, 1]) { P("pierre", xc + s * 1.35, 2.0, .16, .4, 4.0, .22, 0, te); for (let j = 0; j < 4; j++) P("bois", xc + s * .6, .7 + j * .9, .17, .8, .7, .04, 0, 0x5a3a20); } P("pierre", xc, 4.05, .17, 3.1, .35, .26, 0, te); P("pierre", xc, 4.0, .3, .45, .7, .2, 0, te); return; }
      P("vitrine", xc, 1.8, .13, w, 2.7, 1); for (const s of [-1, 1]) P("peint", xc + s * (w / 2 + .09), 1.8, .16, .18, 3.1, .12, 0, pc); P("peint", xc, .2, .16, w + .36, .4, .14, 0, pc); P("peint", xc, 3.5, .2, w + .45, .55, .16, 0, pc);
      for (let j = 1; j < 3; j++) P("peint", xc - w / 2 + j * w / 3, 1.8, .15, .06, 2.7, .05, 0, pc);
      P("store", xc, 3.15, .95, w + .2, .05, 1.8, .34, sc); P("store", xc, 2.68, 1.8, w + .2, .32, .03, 0, sc); });
    { const j = xs.findIndex((_, i) => i !== porte), xc = xs[j]; const st = tT(512, 64, (c, w, h) => { c.fillStyle = "#" + new THREE.Color(pc).getHexString(); c.fillRect(0, 0, w, h); c.strokeStyle = "#c8a85a"; c.lineWidth = 3; c.strokeRect(4, 4, w - 8, h - 8); c.fillStyle = "#f2e6c8"; c.font = `bold 34px ${serif}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(nom, w / 2, h / 2 + 2); });
      mesh(new THREE.PlaneGeometry(pas - .5, .48), mat({ map: st, roughness: .6 }), xc, 3.5, .29); }
    // les étages : bandeaux, fenêtres et leurs encadrements, frontons, balcons
    P("pierre", 0, HR - .1, .2, W + .3, .32, .42, 0, te);
    for (const s of [-1, 1]) P("pierre", s * (W / 2 - .3), HR + nE * HE / 2, .06, .6, nE * HE, .12, 0, te);
    for (let e = 0; e < nE; e++) { const y0 = HR + e * HE, yc = y0 + 1.55, filant = e === 1 || e === nE - 1;
      if (e > 0) P("pierre", 0, y0 + .05, .07, W, .16, .14, 0, te);
      if (filant) { P("pierre", 0, y0 + .1, .46, W - .3, .16, .92, 0, te); for (const xc of xs) for (const s of [-1, 1]) P("pierre", xc + s * .9, y0 - .14, .35, .2, .3, .6, 0, te);
        for (let xr = -W / 2 + .75; xr < W / 2 - .3; xr += 1.2) P("fer", xr, y0 + .66, .9, 1.2, .95, 1); for (const s of [-1, 1]) P("fer", s * (W / 2 - .17), y0 + .66, .46, .9, .95, 1, 0, null, Math.PI / 2); }
      xs.forEach((xc, i) => { P("vitre", xc, yc, .03, 1.15, 2.05, 1); if (al() < .28) P("lumiere", xc, yc, .036, 1.0, 1.9, 1);
        for (const s of [-1, 1]) P("pierre", xc + s * .69, yc, .06, .22, 2.25, .12, 0, te);
        P("pierre", xc, yc - 1.1, .1, 1.62, .1, .22, 0, te);
        if (e === 0 || e === 2) { P("pierre", xc, yc + 1.2, .1, 1.62, .16, .2, 0, te); if ((i + e) % 2 === 0 || e === 0) P("fronton", xc, yc + 1.28, .1, 1.75, .44, .22, 0, te); else P("pierre", xc, yc + 1.42, .12, 1.7, .14, .26, 0, te); }
        else if (e === 1) { P("pierre", xc, yc + 1.22, .14, 1.72, .14, .3, 0, te); for (const s of [-1, 1]) P("pierre", xc + s * .78, yc + 1.06, .14, .14, .32, .24, 0, te); }
        else P("pierre", xc, yc + 1.17, .08, 1.48, .2, .14, 0, te);
        if (!filant) { P("pierre", xc, yc - .98, .22, 1.36, .08, .34, 0, te); P("fer", xc, yc - .56, .38, 1.3, .84, 1); } }); }
    // la corniche à denticules
    P("pierre", 0, H - .15, .3, W + .5, .42, .7, 0, te); P("pierre", 0, H + .12, .46, W + .7, .14, .96, 0, te); for (let xd = -W / 2 + .1; xd < W / 2; xd += .5) P("pierre", xd, H - .48, .22, .2, .18, .26, 0, te);
    // le toit de zinc à la Mansart, ses lucarnes, les souches de cheminée
    { const t = new THREE.Shape(); t.moveTo(0, 0); t.lineTo(D, 0); t.lineTo(D - 1.1, 3.0); t.lineTo(D / 2, 4.3); t.lineTo(1.1, 3.0); t.closePath(); const g = new THREE.ExtrudeGeometry(t, { depth: W, bevelEnabled: false }); g.rotateY(Math.PI / 2); g.translate(-W / 2, H + .2, 0); mesh(g, zincM, 0, 0, 0); }
    xs.forEach((xc) => { P("pierre", xc, H + 1.5, -.55, 1.2, 1.8, 1.15, 0, te); P("vitre", xc, H + 1.45, .04, .74, 1.2, 1); P("fronton", xc, H + 2.4, -.5, 1.45, .55, 1.2, 0, te); P("zinc", xc, H + 2.62, -1.2, 1.3, .5, 1.3); });
    for (const [cx, cz] of [[-W / 2 + .7, -D / 2], [W / 2 - .7, -D / 2], [0, -D / 2 - .5]]) { P("brique", cx, H + 3.7, cz, 1.0, 2.6, 2.6); P("pierre", cx, H + 5.05, cz, 1.15, .14, 2.75, 0, te); for (let j = 0; j < 4; j++) P("pot", cx, H + 5.4, cz - .9 + j * .6, .14, .55, .14); }
    // le dôme d'angle
    if (coin) { const dx = coin * (W / 2 - 2.6); P("pierre", dx, H + 2.6, -2.6, 4.6, 1.4, 4.6, 0, te); const dm = mesh(new THREE.SphereGeometry(2.3, 18, 9, 0, Math.PI * 2, 0, Math.PI / 2), zincM, dx, H + 3.3, -2.6); dm.scale.y = 1.25;
      P("pierre", dx, H + 6.4, -2.6, .8, .9, .8, 0, te); P("zinc", dx, H + 7.0, -2.6, .3, .9, .3); for (const a of [0, 1, 2, 3]) P("vitre", dx + Math.sin(a * Math.PI / 2) * 2.31, H + 2.6, -2.6 + Math.cos(a * Math.PI / 2) * 2.31, .9, 1.0, 1, 0, null, a * Math.PI / 2); }
    if (cafe && terrasse) { for (const lx of [-5.2, -1.7, 1.8, 5.3]) { if (Math.abs(lx) > W / 2 - 1) continue; const p = new THREE.Vector3(lx, 0, 2.6).applyMatrix4(T); cyl(.38, .38, .04, tableM, p.x, .74, p.z, 14); cyl(.03, .03, .72, tableM, p.x, .37, p.z, 6); OBS.push([p.x - .4, p.x + .4, p.z - .4, p.z + .4]);
        for (const sx of [-.7, .7]) { const c = new THREE.Vector3(lx + sx, 0, 2.6).applyMatrix4(T), cap = Math.atan2(p.x - c.x, p.z - c.z), dx = Math.sin(cap), dz = Math.cos(cap);
          box(.42, .05, .42, chaiseM, c.x, .46, c.z, cap); box(.42, .45, .04, chaiseM, c.x - dx * .2, .7, c.z - dz * .2, cap); cyl(.02, .02, .46, tableM, c.x, .23, c.z, 5);
          (L.tabourets = L.tabourets || []).push([c.x, c.z, cap, .46]); } } } };
  // le quai, rive gauche : la rangée face à la Seine, coupée par la rue du Petit-Pont
  // une rangée de façades photographiées, en alternant l'immeuble d'angle et le long immeuble ; (x, z) avancent le long de la rangée
  const rangee = (x0, z0, dx, dz, lim, rot, types, terr = true) => { let s = 0, i = 0; const cs = Math.sign(-(dx * Math.cos(rot) - dz * Math.sin(rot))) || 1; while (s < lim) { const t = types[i % types.length], w = LARG[t], c = s + w / 2; immeuble(x0 + dx * c, z0 + dz * c, rot, w, 5, terr, t, i === 0 && t === "angle" ? cs : 0); s += w; i++; } };
  // le quai, rive gauche : la rangée face à la Seine, coupée par la rue du Petit-Pont
  rangee(PP[0] - 4, 46, -1, 0, XS - 10, Math.PI, ["angle", "long", "std", "angle", "long", "std"]);
  rangee(PP[1] + 4, 46, 1, 0, XS - 8, Math.PI, ["angle", "std", "long", "std", "angle"]);
  // la rue du Petit-Pont, qui file vers le sud
  rangee(PP[0] - 4, 58.2, 0, 1, 70, Math.PI / 2, ["std", "angle"], false); rangee(PP[1] + 4, 58.2, 0, 1, 70, -Math.PI / 2, ["angle", "std"], false);
  immeuble(-1, 134, Math.PI, 30, 5, false, "long");
  // l'île : les immeubles du quai, face à la Seine ; ceux qui bordent le parvis, à droite et à gauche
  rangee(-63, -32, -1, 0, XS - 60, 0, ["angle", "std", "long"], false); rangee(63, -32, 1, 0, XS - 60, 0, ["angle", "long", "std"], false);
  rangee(-62, -44.6, 0, -1, 85, Math.PI / 2, ["long", "std", "angle"]); rangee(62, -44.6, 0, -1, 85, -Math.PI / 2, ["std", "long", "angle"]);
  for (const [kk, im] of IM.fin()) if (kk === "lumiere") { im.visible = false; L.nuitObjets.push(im); }
  // la bouche de métro Saint-Michel – Notre-Dame : la balustrade de fonte, l'enseigne
  { const mx = -70, mz = 42.6; for (const [w, d, x, z] of [[4.2, .06, mx, mz - 1.4], [.06, 2.8, mx - 2.1, mz], [.06, 2.8, mx + 2.1, mz]]) box(w, .9, d, fonteR, x, .45, z);
    const enT = tT(256, 48, (c, w, h) => { c.fillStyle = "#1a3a2a"; c.fillRect(0, 0, w, h); c.fillStyle = "#e8d890"; c.font = "bold 26px Georgia"; c.textAlign = "center"; c.fillText("MÉTROPOLITAIN", w / 2, 34); });
    for (const sx of [-2.1, 2.1]) cyl(.06, .08, 2.8, fonteR, mx + sx, 1.4, mz - 1.4, 8); box(4.2, .4, .06, mat({ map: enT }), mx, 2.8, mz - 1.4); L.metroND = { x: mx, z: mz }; OBS.push([mx - 2.3, mx + 2.3, mz - 1.6, mz + 1.6]); }

  /* ---------- le pont de pierre : trois arches, les piles et leurs avant-becs, les demi-lunes et leurs réverbères, la balustrade, la corniche ; le bas-port passe dessous ---------- */
  { const [x0, x1] = PP, W = x1 - x0, cx = (x0 + x1) / 2;
    sol(x0 + 2.4, x1 - 2.4, -25.6, 25.6, routeM, .03); sol(x0, x0 + 2.4, -25.6, 25.6, trottM, .06); sol(x1 - 2.4, x1, -25.6, 25.6, trottM, .06); for (const sx of [x0 + 2.4, x1 - 2.4]) box(.2, .14, 51.2, quaiM, sx, .07, 0);
    const a = new THREE.Shape(); a.moveTo(-25.6, 0); a.lineTo(25.6, 0); a.lineTo(25.6, YE - .2); a.lineTo(22.5, YE - .2); a.lineTo(22.5, -1.5); a.lineTo(18, -1.5); a.lineTo(18, YE - .2);
    for (const [c, r, s0, rv] of [[12.7, 4.3, -5.0, 3.6], [0, 7, -5.2, 4.3], [-12.7, 4.3, -5.0, 3.6]]) { a.lineTo(c + r, YE - .2); a.lineTo(c + r, s0); a.absellipse(c, s0, r, rv, 0, Math.PI, false); a.lineTo(c - r, YE - .2); }   /* (l'arche du milieu, la plus haute : les bateaux-mouches passent dessous) */
    a.lineTo(-18, YE - .2); a.lineTo(-18, -1.5); a.lineTo(-22.5, -1.5); a.lineTo(-22.5, YE - .2); a.lineTo(-25.6, YE - .2); a.closePath();
    const ag = new THREE.ExtrudeGeometry(a, { depth: W, bevelEnabled: false, curveSegments: 18 }); { const uv = ag.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / TUILE, uv.getY(i) / TUILE); } ag.rotateY(Math.PI / 2); add(ag, murM, x0, 0, 0);
    // la corniche, ses consoles
    for (const [sx, d] of [[x0, -1], [x1, 1]]) { box(.5, .3, 51.4, quaiM, sx + d * .1, -.3, 0); for (let z = -24; z <= 24; z += 1.6) box(.25, .45, .3, quaiM, sx + d * .2, -.6, z);
      // les piles et leurs avant-becs arrondis, les demi-lunes au-dessus, avec leur réverbère
      for (const zc of [-7.7, 7.7]) { const ab = new THREE.Mesh(new THREE.CylinderGeometry(.85, .85, 5, 14, 1, false, d > 0 ? 0 : Math.PI, Math.PI), murM); ab.position.set(sx, -4.1, zc); scene.add(ab);
        const co = new THREE.Mesh(new THREE.CylinderGeometry(1.7, .85, 1.2, 14, 1, false, d > 0 ? 0 : Math.PI, Math.PI), quaiM); co.position.set(sx, -1.0, zc); scene.add(co);
        const dl = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, .4, 16, 1, false, d > 0 ? 0 : Math.PI, Math.PI), quaiM); dl.position.set(sx, -.2, zc); scene.add(dl);
        for (let k = 0; k <= 10; k++) { const t = (d > 0 ? 0 : Math.PI) + k / 10 * Math.PI, bx = sx + Math.sin(t) * 1.55, bz = zc + Math.cos(t) * 1.55; cyl(.06, .08, .8, quaiM, bx, .4, bz, 6); }
        const tor = new THREE.Mesh(new THREE.TorusGeometry(1.55, .09, 4, 16, Math.PI), quaiM); tor.rotation.set(-Math.PI / 2, 0, d > 0 ? -Math.PI / 2 : Math.PI / 2); tor.position.set(sx, .86, zc); scene.add(tor);
        reverbere(sx + d * 1.1, zc); }
      // la balustrade : la lisse basse, les balustres, la main courante, les dés
      box(.4, .12, 51.2, quaiM, sx - d * .2, .06, 0); box(.44, .14, 51.2, quaiM, sx - d * .2, .93, 0);
      for (let z = -25.2; z <= 25.2; z += 4.2) box(.5, 1.05, .5, quaiM, sx - d * .2, .52, z); }
    { const pos = []; for (const sx of [x0 + .2, x1 - .2]) for (let z = -25; z <= 25; z += .32) pos.push([sx, z]);
      const im = new THREE.InstancedMesh(new THREE.CylinderGeometry(.06, .09, .74, 6), quaiM, pos.length), m4 = new THREE.Matrix4(); pos.forEach(([x, z], i) => { m4.makeTranslation(x, .5, z); im.setMatrixAt(i, m4); }); scene.add(im); }
    void cx; }

  const i0ND = scene.children.length;
  /* ---------- Notre-Dame ---------- */
  const PIERRE = "#d6cbb0";
  const ND = { x0: -26, x1: 92, z0: -78, z1: -40 }, CZ = (ND.z0 + ND.z1) / 2;   // la nef, de la façade (à l'ouest, vers le parvis) au chevet
  { const pierre = mat({ color: 0xd6cbb0, roughness: .85 }), pierreS = mat({ color: 0xbfb398, roughness: .9 }), plomb = mat({ color: 0x8a98a6, roughness: .4, metalness: .45 }), vitrail = mat({ color: 0x1a2440, roughness: .2, metalness: .3, emissive: 0x2a3a8a, emissiveIntensity: .05 });
    NUIT.push([vitrail, .05, .5]);
    // la façade : les trois portails, la galerie des rois, la rose et ses baies, la galerie à claire-voie, les deux tours et leurs grandes baies
    const facT = 0 ? tT(1024, 1600, (c, w, h) => {   /* (l'ancienne façade dessinée, remplacée par l'image)*/ c.fillStyle = PIERRE; c.fillRect(0, 0, w, h); const sx = w / 40, sy = h / 63;
      for (let i = 0; i < 2600; i++) { c.fillStyle = `rgba(${al() < .5 ? "120,110,90" : "255,250,235"},${al() * .08})`; c.fillRect(al() * w, al() * h, 3 + al() * 20, 2 + al() * 8); }
      for (let y = 0; y < h; y += 14) { c.fillStyle = "rgba(110,95,70,.12)"; c.fillRect(0, y, w, 1); }
      const Y = (m) => h - m * sy, X = (m) => (m + 20) * sx;
      const ogive = (cx, b, lg, ht, fill, n = 0) => { c.fillStyle = fill; c.beginPath(); c.moveTo(X(cx - lg / 2), Y(b)); c.lineTo(X(cx - lg / 2), Y(b + ht - lg * .6)); c.quadraticCurveTo(X(cx - lg / 2), Y(b + ht), X(cx), Y(b + ht)); c.quadraticCurveTo(X(cx + lg / 2), Y(b + ht), X(cx + lg / 2), Y(b + ht - lg * .6)); c.lineTo(X(cx + lg / 2), Y(b)); c.closePath(); c.fill();
        for (let k = 1; k <= n; k++) { c.strokeStyle = `rgba(90,78,60,${.5 - k * .08})`; c.lineWidth = 3; c.beginPath(); const e = k * .35; c.moveTo(X(cx - lg / 2 - e), Y(b)); c.lineTo(X(cx - lg / 2 - e), Y(b + ht - lg * .6)); c.quadraticCurveTo(X(cx - lg / 2 - e), Y(b + ht + e), X(cx), Y(b + ht + e)); c.quadraticCurveTo(X(cx + lg / 2 + e), Y(b + ht + e), X(cx + lg / 2 + e), Y(b + ht - lg * .6)); c.lineTo(X(cx + lg / 2 + e), Y(b)); c.stroke(); } };
      // les contreforts verticaux
      for (const x of [-20, -13.3, -6.8, 6.8, 13.3, 20]) { c.fillStyle = "rgba(150,135,105,.35)"; c.fillRect(X(x) - 6, 0, 12, Y(0)); }
      // les trois portails (Sainte-Anne, le Jugement dernier, la Vierge), leurs tympans sculptés
      for (const [cx, lg] of [[-10, 5.4], [0, 6.2], [10, 5.4]]) { ogive(cx, 0, lg + 2.4, 11, "#a89a7c", 0); ogive(cx, 0, lg, 9.5, "#5a4e3c", 5);
        c.fillStyle = "#c8bc9e"; c.fillRect(X(cx - lg / 2), Y(5.2), lg * sx, 2.2 * sy); for (let k = 0; k < 9; k++) { c.fillStyle = "rgba(90,78,60,.6)"; c.fillRect(X(cx - lg / 2) + k * lg * sx / 9 + 2, Y(5.2), 3, 2.2 * sy); }
        c.fillStyle = "#3a2e22"; c.fillRect(X(cx - lg / 4), Y(3.6), lg / 2 * sx, 3.6 * sy); c.fillStyle = "#c8bc9e"; c.fillRect(X(cx) - 3, Y(3.6), 6, 3.6 * sy); }
      // la galerie des rois : vingt-huit statues sous leurs arcades
      c.fillStyle = "#c2b698"; c.fillRect(X(-19), Y(17), 38 * sx, 3.4 * sy); for (let k = 0; k < 28; k++) { const x = X(-18.5) + k * 37 * sx / 28; ogive(-18.5 + k * 37 / 28 + .66, 13.8, 1.1, 3.0, "#8a7c60"); c.fillStyle = "#e0d4b6"; c.fillRect(x + 6, Y(16.2), 10, 2.2 * sy); c.beginPath(); c.arc(x + 11, Y(16.5), 6, 0, 7); c.fill(); }
      c.fillStyle = "#b8ac8e"; c.fillRect(X(-20), Y(17.3), 40 * sx, 6);
      // la rose ouest, et de chaque côté les deux grandes baies géminées
      { const rx = X(0), ry = Y(25.5), R = 4.8 * sx; c.fillStyle = "#a89a7c"; c.beginPath(); c.arc(rx, ry, R * 1.18, 0, 7); c.fill(); const g = c.createRadialGradient(rx, ry, 4, rx, ry, R); g.addColorStop(0, "#d8a83a"); g.addColorStop(.35, "#2a3a8a"); g.addColorStop(.7, "#8a1a2a"); g.addColorStop(1, "#1a2a6a"); c.fillStyle = g; c.beginPath(); c.arc(rx, ry, R, 0, 7); c.fill();
        c.strokeStyle = "#c8bc9e"; c.lineWidth = 4; for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2; c.beginPath(); c.moveTo(rx + Math.cos(a) * R * .25, ry + Math.sin(a) * R * .25); c.lineTo(rx + Math.cos(a) * R, ry + Math.sin(a) * R); c.stroke(); } for (const r of [.25, .55, .8, 1]) { c.beginPath(); c.arc(rx, ry, R * r, 0, 7); c.stroke(); } }
      for (const cx of [-10, 10]) { ogive(cx, 20.5, 6, 9, "#a89a7c"); for (const dx of [-1.5, 1.5]) ogive(cx + dx, 21, 2.2, 7.5, "#2a2e3a"); }
      // la grande galerie à claire-voie, au-dessus de la rose
      c.fillStyle = "#c2b698"; c.fillRect(X(-20), Y(34), 40 * sx, 6); for (let k = 0; k < 18; k++) ogive(-18.4 + k * 2.15, 34.4, 1.3, 5.6, "#3a3428");
      // les deux tours : leurs baies immenses, à abat-son
      for (const cx of [-13.4, 13.4]) { for (const dx of [-3, 3]) { ogive(cx + dx, 42, 3.2, 15.5, "#8a7c60"); ogive(cx + dx, 42.5, 2.4, 14.5, "#2e2a24"); for (let k = 0; k < 10; k++) { c.fillStyle = "rgba(160,150,130,.55)"; c.fillRect(X(cx + dx - 1.2), Y(43 + k * 1.3), 2.4 * sx, 4); } } }
      c.fillStyle = "#c2b698"; c.fillRect(X(-20), Y(41.5), 40 * sx, 6); c.fillRect(0, Y(60), w, 10);
      for (let k = 0; k < 40; k++) { c.fillStyle = "#b0a486"; c.fillRect(X(-20) + k * sx, Y(62), sx * .6, Y(60) - Y(62)); }   // la balustrade du sommet
      // entre les tours, au-dessus de la galerie : le ciel (la façade s'arrête)
      c.clearRect(X(-7), 0, 14 * sx, Y(41.5));
    }) : null;
    const FX = ND.x0, FH = 63;
    /* ---------- (en relief, d'après les images) la façade occidentale : les contreforts et leurs retraites ; les trois portails et leurs voussures peuplées de statuettes,
       les statues des ébrasements, les tympans sculptés, les vantaux de bois ; la galerie des rois et ses vingt-huit statues ; la galerie de la Vierge ;
       la grande rose et ses rayons, les baies géminées et leurs oculus ; la grande galerie à colonnettes ; les tours et leurs immenses baies à abat-son ---------- */
    { const MF = new THREE.Matrix4().set(0, 0, -1, FX, 0, 1, 0, 0, 1, 0, 0, CZ, 0, 0, 0, 1);   // (u : le long de la façade ; v : la hauteur ; w : vers le parvis)
      const MSp = new THREE.Matrix4().set(1, 0, 0, FX + 6.6, 0, 1, 0, 0, 0, 0, 1, CZ + 19.9, 0, 0, 0, 1), MSm = new THREE.Matrix4().set(-1, 0, 0, FX + 6.6, 0, 1, 0, 0, 0, 0, -1, CZ - 19.9, 0, 0, 0, 1);   // (les faces de côté des tours)
      const NI = mkInst(), pierreF = mat({ map: pierreFinT, color: 0xe6dcc6, roughness: .85, emissive: 0xffe8c0, emissiveIntensity: 0 }), murF = mat({ map: murT, color: 0xe2d8c2, roughness: .9, emissive: 0xffe8c0, emissiveMap: murT, emissiveIntensity: 0 });
      NUIT.push([pierreF, 0, .24], [murF, 0, .24]);
      const ombreF = mat({ color: 0x9a8f7a, roughness: 1 }), voussF = mat({ map: pierreFinT, color: 0xcfc3a8, roughness: .9 }), noirF = mat({ color: 0x24211c, roughness: 1 }), boisF = mat({ color: 0x5a3a22, roughness: .7 });
      const vitrT = tT(256, 256, (c, w, h) => { c.fillStyle = "#1a2450"; c.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { c.fillStyle = ["#2a3c9a", "#9a1a2a", "#d8a83a", "#1a5a8a", "#6a1a6a", "#2a6a3a"][(al() * 6) | 0]; c.fillRect(al() * w, al() * h, 6, 6); } c.strokeStyle = "rgba(10,10,20,.8)"; c.lineWidth = 1.5; for (let x = 0; x < w; x += 6) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); c.beginPath(); c.moveTo(0, x); c.lineTo(w, x); c.stroke(); } });
      const vitrM = mat({ map: vitrT, roughness: .2, metalness: .3, emissive: 0xffffff, emissiveMap: vitrT, emissiveIntensity: .04 }); NUIT.push([vitrM, .04, .7]);
      const tympT = tT(256, 320, (c, w, h) => { c.fillStyle = "#d6caae"; c.fillRect(0, 0, w, h); const fig = (x, y, s, t) => { c.fillStyle = `rgba(${t},.55)`; c.beginPath(); c.ellipse(x, y, s * .45, s, 0, 0, 7); c.fill(); c.beginPath(); c.arc(x, y - s * 1.25, s * .32, 0, 7); c.fill(); };
        for (const [y0, n, s] of [[130, 14, 9], [92, 9, 12]]) { c.fillStyle = "rgba(120,105,80,.5)"; c.fillRect(0, y0 + s + 4, w, 4); for (let i = 0; i < n; i++) fig(18 + i * (w - 36) / (n - 1), y0, s, i % 2 ? "120,104,80" : "150,134,108"); }
        c.fillStyle = "rgba(120,104,80,.45)"; c.beginPath(); c.ellipse(w / 2, 48, 26, 34, 0, 0, 7); c.fill(); fig(w / 2, 52, 18, "110,96,72"); for (const s of [-1, 1]) fig(w / 2 + s * 62, 60, 13, "130,114,90"); });
      const tympM = mat({ map: tympT, roughness: .9 });
      const fm = (M, g, m) => { const o = new THREE.Mesh(g, m); o.applyMatrix4(M); o.receiveShadow = true; scene.add(o); return o; };
      const fbox = (u0, u1, v0, v1, w0, w1, m = murF, M = MF) => { const W = u1 - u0, Hh = v1 - v0, Dd = w1 - w0, g = uvBox(new THREE.BoxGeometry(W, Hh, Dd), W, Hh, Dd, 4); g.translate((u0 + u1) / 2, (v0 + v1) / 2, (w0 + w1) / 2); return fm(M, g, m); };
      const ogP = (hw, hs, n = 9) => { const R = 1.6 * hw, c = R - hw, a1 = Math.acos(-c / R), G = []; for (let i = 0; i <= n; i++) { const a = Math.PI - (Math.PI - a1) * i / n; G.push([c + R * Math.cos(a), hs + R * Math.sin(a)]); } const D2 = G.slice(0, n).reverse().map(([x, y]) => [-x, y]); return [[-hw, 0], ...G, ...D2, [hw, 0]]; };
      const apex = (hw, hs) => hs + hw * Math.sqrt(2.2);
      const shp = (pts) => { const s = new THREE.Shape(); s.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) s.lineTo(p[0], p[1]); return s; };
      const anneau = (hw, hs, t, dep, u, v, w, m = pierreF, M = MF) => { const g = new THREE.ExtrudeGeometry(shp([...ogP(hw + t, hs), ...ogP(hw, hs).reverse()]), { depth: dep, bevelEnabled: false }); g.translate(u, v, w - dep); return fm(M, g, m); };
      const plein = (hw, hs, m, u, v, w, M = MF) => { const g = new THREE.ShapeGeometry(shp(ogP(hw, hs))), uv = g.attributes.uv, P2 = g.attributes.position, ap = apex(hw, hs); for (let i = 0; i < uv.count; i++) uv.setXY(i, (P2.getX(i) + hw) / (2 * hw), P2.getY(i) / ap); g.translate(u, v, w); return fm(M, g, m); };
      const surArc = (hw, hs, pas, f) => { const pts = ogP(hw, hs, 16).slice(1, -1); for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], d = Math.hypot(x1 - x0, y1 - y0); for (let s = 0; s < d; s += pas) f(x0 + (x1 - x0) * s / d, y0 + (y1 - y0) * s / d); } };
      NI.def("p", ub, pierreF); NI.def("col", new THREE.CylinderGeometry(1, 1, 1, 8), pierreF); NI.def("stat", new THREE.CapsuleGeometry(1, 1, 3, 8), mat({ color: 0xd2c6aa, roughness: .9 })); NI.def("tete", new THREE.SphereGeometry(1, 8, 6), mat({ color: 0xd2c6aa, roughness: .9 }));
      NI.def("pin", new THREE.ConeGeometry(1, 1, 4), pierreF); NI.def("tore", new THREE.TorusGeometry(1, .12, 4, 14), pierreF);
      { const g = new THREE.ExtrudeGeometry(shp([...ogP(.5, 0), ...ogP(.38, 0).reverse()]), { depth: 1, bevelEnabled: false }); g.translate(0, 0, -.5); NI.def("arc", g, pierreF); }
      const F = (k, u, v, w, su, sv, sw, rz = 0, rx = 0, M = MF) => NI.P(k, M, u, v, w, su, sv, sw, rx, null, 0, rz);
      const statue = (u, v, w, s = 1, M = MF) => { F("stat", u, v, w, .2 * s, .42 * s, .2 * s, 0, 0, M); F("tete", u, v + .82 * s, w, .17 * s, .19 * s, .17 * s, 0, 0, M); };
      // le mur, le recul de la grande galerie, les tours
      fbox(-20, 20, 0, 33, -2, 0); fbox(-20, 20, 33, 42.6, -3, -1, ombreF); for (const s of [-1, 1]) fbox(s > 0 ? 6.8 : -20, s > 0 ? 20 : -6.8, 42.6, 63, -2, 0);
      // les contreforts, leurs retraites, leurs pinacles ; une statue dans la niche de chacun
      for (const u of [-19.2, -6.9, 6.9, 19.2]) { fbox(u - .9, u + .9, 0, 11, 0, 1.7); fbox(u - .85, u + .85, 11, 33, 0, 1.25); fbox(u - .8, u + .8, 33, 42.6, 0, .95); fbox(u - .7, u + .7, 42.6, 61, 0, .7);
        F("pin", u, 62.8, .35, .55, 3.6, .55); statue(u, 7.4, 1.95, 1.3); F("p", u, 6.4, 1.85, .7, .2, .5); }
      // les trois portails
      for (const [c, hw, hs] of [[-13.4, 2.5, 5.2], [0, 3.0, 5.8], [13.4, 2.5, 5.2]]) { const NR = 5, t = .34;
        for (let k = 1; k <= NR; k++) { anneau(hw + (k - 1) * t, hs, t, .3 + k * .24, c, 0, k * .24, k % 2 ? pierreF : voussF);
          if (k % 2 === 0) surArc(hw + (k - .5) * t, hs, .5, (x, y) => { if (y > hs - .2) F("stat", c + x, y, k * .24 + .08, .1, .14, .1); });
          if (k <= 4) for (const s of [-1, 1]) { statue(c + s * (hw + (k - .5) * t), 2.4, k * .24 + .12, 1); F("p", c + s * (hw + (k - .5) * t), 1.6, k * .24, .3, .25, .3); } }
        plein(hw, hs, tympM, c, 0, .025);
        for (const s of [-1, 1]) { fbox(s > 0 ? c + .25 : c - hw + .05, s > 0 ? c + hw - .05 : c - .25, 0, 4.6, -.2, .06, boisF); for (const v of [1, 2.4, 3.8]) F("p", c + s * hw / 2, v, .08, hw - .5, .06, .03); }
        F("p", c, 2.3, .15, .55, 4.6, .45); statue(c, 2.9, .45, 1.15);
        fbox(c - hw, c + hw, 4.6, 5.5, -.2, .14, pierreF); for (let x = c - hw + .3; x < c + hw - .2; x += .42) F("stat", x, 5.05, .18, .11, .16, .08); }
      // la frise au-dessus des portails, ses consoles
      fbox(-20.2, 20.2, 10.9, 11.5, 0, 1.0, pierreF); for (let u = -19.8; u < 20; u += .6) F("p", u, 10.72, .62, .22, .3, .7);
      // la galerie des rois : vingt-huit statues sous leurs arcatures
      fbox(-19, 19, 11.5, 16.2, -.04, .02, ombreF);
      for (let i = 0; i <= 28; i++) { const u = -18.9 + i * 37.8 / 28; F("col", u, 13.6, .42, .12, 3.6, .12); if (i < 28) { const um = u + 37.8 / 56; F("arc", um, 15.45, .42, 1.25, 1.1, .3); statue(um, 13.4, .3, 1.15); F("p", um, 14.62, .3, .28, .1, .28); } }
      fbox(-20.2, 20.2, 16.2, 16.7, 0, .95, pierreF);
      // la galerie de la Vierge : sa balustrade ; la Vierge et les anges devant la rose, Adam et Ève
      for (let u = -18.8; u <= 18.8; u += .3) F("col", u, 17.25, .7, .07, .9, .07); fbox(-19, 19, 17.7, 17.92, .5, .9, pierreF);
      statue(0, 18.9, .75, 1.8); for (const s of [-1, 1]) { statue(s * 3.4, 18.7, .75, 1.5); statue(s * 15.4, 18.7, .75, 1.5); }
      // la grande rose : le vitrail, les moulures, les rayons, les petits cercles
      { const rv = 25.6; fm(MF, new THREE.CircleGeometry(4.9, 48).translate(0, rv, .03), vitrM);
        for (const [R, tb] of [[5.35, .42], [4.95, .2], [3.2, .12], [1.6, .14]]) fm(MF, new THREE.TorusGeometry(R, tb, 6, 56).translate(0, rv, .22), pierreF);
        for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; F("p", Math.cos(a) * 3.25, rv + Math.sin(a) * 3.25, .12, .13, 3.3, .24, a - Math.PI / 2); F("tore", Math.cos(a + Math.PI / 24) * 4.1, rv + Math.sin(a + Math.PI / 24) * 4.1, .1, .42, .42, 1); }
        for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; F("p", Math.cos(a) * 1.05, rv + Math.sin(a) * 1.05, .12, .12, 1.1, .2, a - Math.PI / 2); }
        F("col", 0, rv, .1, .5, .3, .5, 0, Math.PI / 2);
        anneau(5.9, 5.0, .45, .7, 0, 19.2, .6, voussF); }
      // les baies géminées des côtés, leurs oculus
      for (const c of [-13.4, 13.4]) { anneau(2.4, 4.2, .4, .8, c, 19.2, .8, voussF);
        for (const s of [-1, 1]) { plein(.8, 3.5, vitrM, c + s * 1.15, 19.6, .03); anneau(.8, 3.5, .2, .45, c + s * 1.15, 19.6, .45); }
        F("col", c, 21.4, .35, .1, 3.6, .1); fm(MF, new THREE.CircleGeometry(.72, 24).translate(c, 25.6, .03), vitrM); F("tore", c, 25.6, .2, .8, .8, 1); }
      fbox(-20.2, 20.2, 32.4, 33.0, 0, .95, pierreF);
      // la grande galerie à colonnettes, sa balustrade
      for (let u = -18.7; u < 18.8; u += 1.0) { if ([-19.2, -6.9, 6.9, 19.2].some(b => Math.abs(u - b) < 1.05)) continue; F("col", u, 36.2, .3, .13, 6.4, .13); F("p", u, 39.45, .3, .36, .24, .36); F("arc", u + .5, 39.55, .3, .95, .95, .3); }
      fbox(-20, 20, 40.6, 41.4, 0, .5, pierreF); for (let u = -19.8; u <= 19.8; u += .32) F("col", u, 41.95, .3, .07, .9, .07); fbox(-20.2, 20.2, 42.4, 42.65, 0, .7, pierreF);
      // les tours : les deux immenses baies à abat-son de chaque face, la corniche, la balustrade du sommet
      const baies = (M, c) => { for (const s of [-1, 1]) { const u = c + s * 3.0; plein(1.3, 11.4, noirF, u, 44.2, .03, M); for (const [k, hw] of [[1, 1.3], [2, 1.62], [3, 1.94]]) anneau(hw, 11.4, .32, .3 * k, u, 44.2, .3 * k, k % 2 ? pierreF : voussF, M);
          for (let v = 45; v < 56.5; v += .62) F("p", u, v, .14, 2.5, .08, .45, 0, .6, M); F("col", u, 50.2, .32, .1, 12, .1, 0, 0, M); }
        F("p", c, 51, .3, .8, 17, .6, 0, 0, M); F("p", c, 60.1, .4, 13.4, .6, .8, 0, 0, M); for (let u = c - 6.4; u <= c + 6.4; u += .32) F("col", u, 60.9, .4, .07, 1.0, .07, 0, 0, M); F("p", c, 61.5, .4, 13.4, .22, .5, 0, 0, M); };
      baies(MF, -13.4); baies(MF, 13.4); baies(MSp, 0); baies(MSm, 0);
      for (const M of [MSp, MSm]) { plein(1.0, 6, vitrM, 0, 24, .03, M); anneau(1.0, 6, .3, .4, 0, 24, .4, pierreF, M); for (const s of [-1, 1]) { fbox(s * 6.3 - .5, s * 6.3 + .5, 0, 61, 0, .8, murF, M); } }
      NI.fin(); }
    // les volumes derrière la façade : les tours, le corps central, les contreforts en saillie
    for (const sz of [-1, 1]) { box(12, FH - .2, 13, pierre, FX + 6.6, (FH - .2) / 2, CZ + sz * 13.4); box(13.4, 1, 13.4, pierreS, FX + 6.6, FH - .1, CZ + sz * 13.4);
      for (const [dx, dz] of [[-6, -6], [6, -6], [-6, 6], [6, 6]]) { cyl(.5, .7, 2.2, pierreS, FX + 6.6 + dx, FH + 1.5, CZ + sz * 13.4 + dz, 8); cyl(.02, .5, 3.4, pierreS, FX + 6.6 + dx, FH + 4.2, CZ + sz * 13.4 + dz, 8); }   // les pinacles aux angles des tours
      cyl(.02, 1.2, 5, plomb, FX + 6.6, FH + 2.5, CZ + sz * 13.4, 4); }
    box(12.6, 41.5, 12, pierre, FX + 6.9, 20.75, CZ);
    /* (les contreforts sont dans l'image de la façade) */
    // la nef et le chœur, le toit de plomb, les bas-côtés, les fenêtres hautes
    const NX0 = FX + 12, NX1 = ND.x1, NL = NX1 - NX0, NH = 33, NW = 14;
    const nefT = tT(512, 256, (c, w, h) => { c.fillStyle = PIERRE; c.fillRect(0, 0, w, h); for (let i = 0; i < 300; i++) { c.fillStyle = `rgba(${al() < .5 ? "120,110,90" : "255,250,235"},${al() * .08})`; c.fillRect(al() * w, al() * h, 3 + al() * 14, 2 + al() * 6); }
      for (let k = 0; k < 8; k++) { const x = k * w / 8 + w / 32; c.fillStyle = "#8a7c60"; c.beginPath(); c.moveTo(x, h * .9); c.lineTo(x, h * .35); c.quadraticCurveTo(x, h * .15, x + w / 32, h * .12); c.quadraticCurveTo(x + w / 16, h * .15, x + w / 16, h * .35); c.lineTo(x + w / 16, h * .9); c.fill(); c.fillStyle = "#24304e"; c.fillRect(x + 4, h * .3, w / 16 - 8, h * .58); c.fillStyle = "rgba(200,160,80,.35)"; c.fillRect(x + 6, h * .35, 4, h * .5); } }, NL / 16, 1);
    box(NL, NH, NW, mat({ map: nefT, roughness: .85 }), NX0 + NL / 2, NH / 2, CZ);
    { const tg = new THREE.CylinderGeometry(.01, NW / 2 + .8, 11, 4, 1); tg.rotateY(Math.PI / 4); tg.scale(1, 1, 1); const t = new THREE.Mesh(new THREE.BoxGeometry(NL, .1, .1), plomb); void t;
      const pr = new THREE.Shape(); pr.moveTo(-NW / 2 - .6, 0); pr.lineTo(0, 11); pr.lineTo(NW / 2 + .6, 0); pr.closePath(); const pg = new THREE.ExtrudeGeometry(pr, { depth: NL, bevelEnabled: false }); pg.rotateY(Math.PI / 2); const toit = add(pg, plomb, NX0, NH, CZ); void toit; }
    for (const sz of [-1, 1]) { box(NL, 16, 9, mat({ map: nefT, roughness: .85 }), NX0 + NL / 2, 8, CZ + sz * 11.5);   // les bas-côtés
      const tp = new THREE.Mesh(new THREE.BoxGeometry(NL, .3, 10), plomb); tp.position.set(NX0 + NL / 2, 17.4, CZ + sz * 11.2); tp.rotation.x = sz * .35; scene.add(tp); }
    // les arcs-boutants : de grandes volées de pierre qui s'élancent des culées vers la nef
    for (let x = NX0 + 4; x < NX1 - 4; x += 8.5) for (const sz of [-1, 1]) { const zc = CZ + sz * 16.5; box(2, 26, 2.2, pierreS, x, 13, zc); cyl(.2, .55, 3.5, pierreS, x, 27.6, zc, 4);   // la culée, son pinacle
      const v = new THREE.Mesh(new THREE.BoxGeometry(.8, .9, 10.5), pierreS); v.position.set(x, 26.5, CZ + sz * 11.6); v.rotation.x = sz * .5; scene.add(v); }
    // le transept : ses deux bras et leurs roses
    { const TX = NX0 + NL * .42, TW = 13; box(TW, NH, NW + 22, mat({ map: nefT, roughness: .85 }), TX, NH / 2, CZ);
      const pr = new THREE.Shape(); pr.moveTo(-TW / 2 - .5, 0); pr.lineTo(0, 11); pr.lineTo(TW / 2 + .5, 0); pr.closePath(); const pg = new THREE.ExtrudeGeometry(pr, { depth: NW + 22, bevelEnabled: false }); const t2 = add(pg, plomb, TX, NH, CZ - (NW + 22) / 2); void t2;
      const roseT = tT(256, 256, (c, w, h) => { c.fillStyle = PIERRE; c.fillRect(0, 0, w, h); const g = c.createRadialGradient(128, 128, 4, 128, 128, 110); g.addColorStop(0, "#e0b040"); g.addColorStop(.4, "#2a3a9a"); g.addColorStop(.75, "#9a1a3a"); g.addColorStop(1, "#1a2a7a"); c.fillStyle = g; c.beginPath(); c.arc(128, 128, 110, 0, 7); c.fill(); c.strokeStyle = "#c8bc9e"; c.lineWidth = 3; for (let k = 0; k < 32; k++) { const a = k / 32 * Math.PI * 2; c.beginPath(); c.moveTo(128 + Math.cos(a) * 25, 128 + Math.sin(a) * 25); c.lineTo(128 + Math.cos(a) * 110, 128 + Math.sin(a) * 110); c.stroke(); } for (const r of [25, 60, 90, 110]) { c.beginPath(); c.arc(128, 128, r, 0, 7); c.stroke(); } });
      const rm = new THREE.MeshStandardMaterial({ map: roseT, roughness: .5, emissive: 0xffffff, emissiveMap: roseT, emissiveIntensity: .05 }); NUIT.push([rm, .05, .6]);
      for (const sz of [-1, 1]) { const r = add(new THREE.PlaneGeometry(11, 11), rm, TX, 22, CZ + sz * ((NW + 22) / 2 + .02), sz > 0 ? 0 : Math.PI); void r;
        const pg2 = new THREE.Shape(); pg2.moveTo(-TW / 2, 0); pg2.lineTo(0, 9); pg2.lineTo(TW / 2, 0); pg2.closePath(); const pi = add(new THREE.ShapeGeometry(pg2), pierre, TX, NH, CZ + sz * ((NW + 22) / 2 + .05), sz > 0 ? 0 : Math.PI); void pi; }
      // la flèche de Viollet-le-Duc, plomb et bois, au-dessus de la croisée
      cyl(2.2, 2.6, 8, plomb, TX, NH + 11 + 4, CZ, 8); cyl(.05, 2.2, 38, plomb, TX, NH + 11 + 8 + 19, CZ, 8); add(new THREE.SphereGeometry(.45, 8, 6), mat({ color: 0xc8a040, metalness: .8, roughness: .3 }), TX, NH + 11 + 46, CZ);
      for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; cyl(.08, .3, 3, plomb, TX + Math.cos(a) * 2.4, NH + 11 + 9.5, CZ + Math.sin(a) * 2.4, 4); } }
    // le chevet : l'abside arrondie, sa couronne d'arcs-boutants
    { const R = NW / 2 + 9; const ab = new THREE.Mesh(new THREE.CylinderGeometry(NW / 2, NW / 2, NH, 16, 1, false, 0, Math.PI), mat({ map: nefT, roughness: .85 })); ab.position.set(NX1, NH / 2, CZ); scene.add(ab);
      const ab2 = new THREE.Mesh(new THREE.CylinderGeometry(NW / 2 + 4.5, NW / 2 + 4.5, 16, 16, 1, false, 0, Math.PI), mat({ map: nefT, roughness: .85 })); ab2.position.set(NX1, 8, CZ); scene.add(ab2);
      const ct = new THREE.Mesh(new THREE.ConeGeometry(NW / 2 + .6, 11, 16, 1, false, 0, Math.PI), plomb); ct.position.set(NX1, NH + 5.5, CZ); scene.add(ct);
      for (let k = 0; k <= 6; k++) { const a = k / 6 * Math.PI, x = NX1 + Math.sin(a) * R, z = CZ + Math.cos(a) * R; box(2, 24, 2, pierreS, x, 12, z); const v = new THREE.Mesh(new THREE.BoxGeometry(.8, .9, 9), pierreS); v.position.set(NX1 + Math.sin(a) * (R - 4.5), 25, CZ + Math.cos(a) * (R - 4.5)); v.rotation.y = a; v.rotateX(-.5); scene.add(v); } }
    // le jardin au pied du chevet, sa grille
  }
  // (la cathédrale est construite en long sur x : on la tourne d'un quart de tour, la façade face au pont et à la Seine, au fond du parvis)
  { const T = new THREE.Matrix4().makeRotationY(Math.PI / 2).setPosition(58, 0, -96); for (const o of scene.children.slice(i0ND)) o.applyMatrix4(T); }
  const FAC = { x: -1, z: -69 };   // (le milieu de la façade, après le quart de tour)
  // le parvis : la statue de Charlemagne à cheval, le point zéro
  { const bronze = mat({ color: 0x4a5a48, metalness: .6, roughness: .45 }), sx = -40, sz = -52; box(4, 2.2, 6, mat({ color: 0xb0a690 }), sx, 1.1, sz); const ch = new THREE.Group(); ch.position.set(sx, 2.2, sz); scene.add(ch);
    const c1 = new THREE.Mesh(new THREE.CapsuleGeometry(.7, 1.8, 4, 8), bronze); c1.rotation.x = Math.PI / 2; c1.position.y = 1.6; ch.add(c1); for (const [x, z] of [[-.4, -.8], [.4, -.8], [-.4, .8], [.4, .8]]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(.12, .1, 1.3, 6), bronze); p.position.set(x, .65, z); ch.add(p); }
    const tete = new THREE.Mesh(new THREE.CapsuleGeometry(.25, .8, 4, 8), bronze); tete.position.set(0, 2.5, 1.4); tete.rotation.x = .6; ch.add(tete); const cav = new THREE.Mesh(new THREE.CapsuleGeometry(.35, .9, 4, 8), bronze); cav.position.set(0, 3, 0); ch.add(cav);
    OBS.push([sx - 2.2, sx + 2.2, sz - 3.2, sz + 3.2]);
    const pz = new THREE.Mesh(new THREE.CircleGeometry(.4, 24), mat({ color: 0xc8a040, metalness: .7, roughness: .3 })); pz.rotation.x = -Math.PI / 2; pz.position.set(FAC.x, .03, -58); scene.add(pz); }

  /* ---------- les bateaux (d'après les images) : le bateau-mouche classique et son enseigne, le bateau-mouche à pont ouvert, le bateau-taxi, la vedette en bois, la grande péniche de transport ---------- */
  const blancB = mat({ color: 0xf2f2ee, roughness: .4 }), vitreB = mat({ color: 0x9ab8c8, roughness: .08, metalness: .4, transparent: true, opacity: .42, side: THREE.DoubleSide, depthWrite: false }), boisB = mat({ color: 0x8a4a22, roughness: .5 }), noirB = mat({ color: 0x24282c, roughness: .6 }), orangeB = mat({ color: 0xe86a2a }), metB = mat({ color: 0x9a9ea2, metalness: .6, roughness: .4 });
  const enseigneT = tT(512, 96, (c, w, h) => { c.fillStyle = "#f4f2ea"; c.fillRect(0, 0, w, h); c.strokeStyle = "#2a2a2a"; c.lineWidth = 5; c.strokeRect(3, 3, w - 6, h - 6); c.fillStyle = "#1a2a4a"; c.font = `bold 60px ${serif}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("BATEAU-MOUCHE", w / 2, h / 2 + 3); }), enseigneM = mat({ map: enseigneT, roughness: .6 });
  const drapeau = (g, x, y) => { const b = (c, dz) => { const o = new THREE.Mesh(new THREE.BoxGeometry(.02, .5, .27), mat({ color: c })); o.position.set(x - .02, y + .3, dz); g.add(o); }; const m = new THREE.Mesh(new THREE.CylinderGeometry(.025, .025, 1.2, 5), metB); m.position.set(x, y, 0); g.add(m); b(0x1a3a8a, -.27); b(0xf4f4f4, 0); b(0xc81a2a, .27); };
  const coque = (g, L0, W, h, m, y) => { const b = new THREE.Mesh(new THREE.BoxGeometry(L0, h, W), m); b.position.y = y; g.add(b); for (const [sx, t0] of [[L0 / 2, 0], [-L0 / 2, Math.PI]]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(W / 2, W / 2, h, 16, 1, false, t0, Math.PI), m); p.position.set(sx, y, 0); if (sx > 0) p.scale.x = 1.5; g.add(p); } };
  const rambarde = (g, x0, x1, W, y) => { for (const sz of [-1, 1]) { const r = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, .04, .04), blancB); r.position.set((x0 + x1) / 2, y, sz * (W / 2 - .06)); g.add(r); for (let x = x0; x <= x1; x += 1.2) { const p = new THREE.Mesh(new THREE.BoxGeometry(.04, y - .9, .04), blancB); p.position.set(x, (y + .9) / 2, sz * (W / 2 - .06)); g.add(p); } } };
  const bateauMouche = (L0 = 28, W = 5, ouvert = false) => { const g = new THREE.Group(), b = (w, h, d, m, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); g.add(o); return o; };
    coque(g, L0, W, 1.3, blancB, .25); coque(g, L0 + .1, W + .1, .35, noirB, -.4); b(L0, .06, W - .1, mat({ color: 0x9a8a72 }), 0, .92, 0);
    const c0 = -L0 / 2 + 1.2, c1 = L0 / 2 - 5, cl = c1 - c0, cm = (c0 + c1) / 2, H = 1.9, yt = .95 + H;
    b(cl, .55, W - .5, blancB, cm, 1.22, 0);   // (l'allège)
    if (!ouvert) { for (const sz of [-1, 1]) b(cl, H - .55, .04, vitreB, cm, 1.5 + (H - .55) / 2, sz * (W / 2 - .25)); b(.04, H - .55, W - .5, vitreB, c1, 1.5 + (H - .55) / 2, 0); }
    for (let x = c0; x <= c1 + .01; x += 1.6) { for (const sz of [-1, 1]) b(.07, H, .07, blancB, x, .95 + H / 2, sz * (W / 2 - .25)); const rib = new THREE.Mesh(new THREE.TorusGeometry(W / 2 - .25, .05, 4, 14, Math.PI), blancB); rib.rotation.y = Math.PI / 2; rib.scale.set(1, .45, 1); rib.position.set(x, yt, 0); g.add(rib); }
    { const tg = new THREE.CylinderGeometry(W / 2 - .25, W / 2 - .25, cl, 16, 1, true, 0, Math.PI); tg.rotateZ(Math.PI / 2); tg.scale(1, .45, 1); const t = new THREE.Mesh(tg, ouvert ? mat({ color: 0xe8e8e2, transparent: true, opacity: .0, depthWrite: false }) : vitreB); t.position.set(cm, yt, 0); t.visible = !ouvert; g.add(t); }
    for (const sz of [-1, 1]) b(cl, .06, .08, blancB, cm, yt, sz * (W / 2 - .25));
    for (let x = c0 + 1; x < c1 - .5; x += 1.3) b(.45, .45, W - 1.5, boisB, x, 1.18, 0);   // (les banquettes)
    rambarde(g, c1, L0 / 2, W, 1.9); { const tor = new THREE.Mesh(new THREE.TorusGeometry(W / 2 - .06, .03, 4, 16, Math.PI), blancB); tor.rotation.set(-Math.PI / 2, 0, -Math.PI / 2); tor.scale.set(1.5, 1, 1); tor.position.set(L0 / 2, 1.9, 0); g.add(tor); }
    if (!ouvert) { for (const sx of [-1.8, 1.8]) b(.08, 1.0, .08, blancB, c1 - 2 + sx, yt + .9, 0); for (const r of [0, Math.PI]) { const e = new THREE.Mesh(new THREE.PlaneGeometry(4.4, .82), enseigneM); e.position.set(c1 - 2, yt + 1.55, r ? -.03 : .03); e.rotation.y = r; g.add(e); } }
    for (const sz of [-1, 1]) { const bo = new THREE.Mesh(new THREE.TorusGeometry(.28, .08, 6, 14), orangeB); bo.position.set(c1 + 1.2, 1.4, sz * (W / 2 + .02)); g.add(bo); }
    drapeau(g, -L0 / 2 - 1, 1.9); return g; };
  const taxi = (c = 0x1a2a4a) => { const g = new THREE.Group(), b = (w, h, d, m, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); g.add(o); return o; };
    coque(g, 6.5, 2.4, .95, mat({ color: c, roughness: .4 }), .1); b(7, .05, 2.3, boisB, .3, .6, 0); b(3, 1.0, 2.0, blancB, -.6, 1.1, 0); b(3.02, .38, 2.02, noirB, -.6, 1.3, 0); b(3.3, .08, 2.2, blancB, -.6, 1.64, 0); rambarde(g, -3.2, 2.8, 2.4, 1.15); drapeau(g, -3.6, 1.2); return g; };
  const vedette = () => { const g = new THREE.Group(), b = (w, h, d, m, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); g.add(o); return o; };
    coque(g, 3.6, 1.7, .6, boisB, .1); b(3.6, .06, 1.6, blancB, 0, .43, 0); const pb = new THREE.Mesh(new THREE.BoxGeometry(.05, .4, 1.4), vitreB); pb.position.set(.5, .65, 0); pb.rotation.z = -.4; g.add(pb); b(.6, .3, 1.3, blancB, -.5, .55, 0); return g; };
  const peniche = () => { const g = new THREE.Group(), b = (w, h, d, m, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); g.add(o); return o; }, brun = mat({ color: 0x3a3230, roughness: .7 }), gris = mat({ color: 0x6a6e70, roughness: .6, metalness: .2 });
    coque(g, 40, 5.6, 2.2, brun, 0); b(40, .2, 5.8, mat({ color: 0x5a2a22 }), 0, 1.1, 0);
    for (let i = 0; i < 7; i++) { b(4, .5, 4.6, gris, -11 + i * 4.3, 1.35, 0); b(4, .15, .3, gris, -11 + i * 4.3, 1.65, 0); }
    b(4, 1.8, 4.4, blancB, -17.5, 2.1, 0); b(4.02, .6, 4.42, noirB, -17.5, 2.5, 0); b(4.4, .12, 4.8, noirB, -17.5, 3.05, 0); b(1.6, 1.2, 1.6, mat({ color: 0x8a5a32 }), -15, 3.7, 0); b(1.62, .4, 1.62, noirB, -15, 3.9, 0);
    drapeau(g, -20.5, 2.3); return g; };
  const BAT = [];
  { const amarre = (g, x, z, y, ry = 0) => { g.position.set(x, y, z); g.rotation.y = ry; scene.add(g); };
    amarre(bateauMouche(28, 5, false), 36, 15.3, YE + .45); amarre(bateauMouche(26, 5, true), 72, 15.3, YE + .45, Math.PI); amarre(taxi(), -100, 16.6, YE + .35); amarre(peniche(), -72, -15.0, YE + .55);
    for (const x of [36, 72]) { box(1.2, .08, 1.4, metB, x - 4, YB + .3, 18.4); }   // (les passerelles)
    // ceux qui passent : un bateau-mouche dans chaque sens sous l'arche du milieu ; la vedette et le bateau-taxi, et leur sillage d'écume
    const sillT = tT(256, 64, (c, w, h) => { c.clearRect(0, 0, w, h); for (let i = 0; i < 1400; i++) { const u = al(), sp = (1 - u) * h * .48, y = h / 2 + (al() < .5 ? -1 : 1) * sp * (.75 + al() * .25); c.fillStyle = `rgba(255,255,255,${u * .7 * al()})`; c.fillRect(u * w, y - 1, 3, 2); } for (let i = 0; i < 300; i++) { const u = al(); c.fillStyle = `rgba(235,245,245,${u * .35})`; c.fillRect(u * w, h / 2 + (al() - .5) * (1 - u) * h * .5, 4, 2); } });
    const sillM = new THREE.MeshBasicMaterial({ map: sillT, transparent: true, depthWrite: false });
    const sillage = (g, lg, lar, dx) => { const s = new THREE.Mesh(new THREE.PlaneGeometry(lg, lar), sillM); s.rotation.x = -Math.PI / 2; s.position.set(dx - lg / 2, .02 - (g.userData.ye || 0), 0); g.add(s); };
    for (const [g, z, v, y, lg, ar] of [[bateauMouche(28, 5, false), -3.2, 3.6, YE + .45, 24, -14], [bateauMouche(26, 5, true), 3.2, -3.0, YE + .45, 22, -13], [vedette(), 11.5, 9, YE + .25, 14, -1.8], [taxi(0x2a2a30), -11.8, -7, YE + .35, 16, -3.3]]) {
      g.userData.ye = y - YE; sillage(g, lg, lg * .35, ar); g.userData.anime = true; scene.add(g); BAT.push({ g, z, v, y, x0: al() * 300 }); } }

  /* ---------- les voitures : par la rue du Petit-Pont et le pont, jusqu'au quai de l'île ---------- */
  const VOIT = [];
  { const coul = [0xc8c4bc, 0x8a1a1a, 0x1a3a6a, 0x2a2a2c, 0xe8e4da, 0x4a5a3a, 0xb8a040, 0x6a6e74];
    const voiture = (k) => { const g = new THREE.Group(), m = mat({ color: coul[k % coul.length], roughness: .35, metalness: .4 }), b = (w, h, d, mm, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mm); o.position.set(x, y, z); g.add(o); };
      b(1.75, .62, 4.1, m, 0, .55, 0); b(1.6, .55, 2.1, m, 0, 1.1, -.25); b(1.62, .4, 2.0, noirB, 0, 1.12, -.25); for (const [x, z] of [[-.8, 1.3], [.8, 1.3], [-.8, -1.3], [.8, -1.3]]) { const r = new THREE.Mesh(new THREE.CylinderGeometry(.32, .32, .22, 10), noirB); r.rotation.z = Math.PI / 2; r.position.set(x, .32, z); g.add(r); }
      b(1.5, .1, .05, mat({ color: 0xfff4d0, emissive: 0xfff0c0, emissiveIntensity: .4 }), 0, .62, 2.06); b(1.5, .1, .05, mat({ color: 0xa81a1a, emissive: 0x801010, emissiveIntensity: .4 }), 0, .62, -2.06); scene.add(g); return g; };
    const CH = [[[1.6, 138], [1.6, -27.1], [152, -27.1]], [[-152, -27.1], [-3.6, -27.1], [-3.6, 138]]];
    CH.forEach((P, j) => { let lg = 0; const seg = []; for (let i = 1; i < P.length; i++) { const d = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); seg.push([lg, d, P[i - 1], P[i]]); lg += d; }
      for (let k = 0; k < (PEU ? 2 : 4); k++) VOIT.push({ g: voiture(j * 4 + k), seg, lg, s: k * lg / 4 + j * 17, v: 8 + k % 2 * 1.5 }); }); }

  /* ---------- du monde : les promeneurs sur le quai, au bord de l'eau, sur le pont et le parvis ; des touristes qui photographient la cathédrale ---------- */
  const MARCH = [], PE = ["#f0c9a6", "#c78f62", "#e8bd95", "#8d5a3b", "#f6d6bc", "#6a4028"], HA = ["#2a3a5a", "#7a2a3a", "#3a3a40", "#e8e2d6", "#5a4636", "#2f5a4a", "#c8a040", "#1a1a1c", "#8a2a2a", "#4a5a7a"];
  const gens = (k) => { const f = k % 2 === 1; return personne3D({ taille: f ? 1.64 : 1.76, peau: PE[k % 6], ch: ["#2a1a12", "#5a3a22", "#141010", "#8a8a8a", "#e2c27a"][k % 5], haut: HA[k % 10], bas: ["#26324e", "#2a2a30", "#3a3028", "#5a6a7a"][k % 4], chaussures: ["#1a1a1a", "#e8e8e8"][k % 2], coif: f ? (k % 3 ? "long" : "carre") : k % 4 ? "court" : "chauve", pantalon: !f || k % 3 === 0, robe: f && k % 3 !== 0 }); };
  { const R = [[[-140, 31.6], [140, 31.6]], [[140, 35.5], [-140, 35.5]], [[-140, 39.8], [140, 39.8]], [[-140, 20.4], [140, 20.4]], [[140, 21.2], [-140, 21.2]],
      [[-44, 33], [-44, 21], [-120, 21], [-44, 21]], [[-12.2, 70], [-12.2, 28], [-8.6, 24], [-8.6, -33], [-30, -56], [28, -56], [6.6, -33], [6.6, 24], [10.4, 28], [10.4, 70]],
      [[-52, -40], [50, -40]], [[-140, -25.8], [140, -25.8]], [[-52, -75], [-52, -190], [-30, -190], [-30, -75]], [[50, -75], [50, -190], [28, -190], [28, -75]], [[-55, -62], [55, -62]]];
    for (let k = 0, n = PEU ? 18 : 40; k < n; k++) { const Rr = R[k % R.length], m = gens(k), i0 = (k * 3) % Rr.length, a = Rr[i0], b = Rr[(i0 + 1) % Rr.length], u = ((k * 37) % 100) / 100; m.position.set(a[0] + (b[0] - a[0]) * u, 0, a[1] + (b[1] - a[1]) * u); m.userData.poser("marche", 0); m.userData.anime = true; scene.add(m);
      MARCH.push({ m, R: Rr, i: (i0 + 1) % Rr.length, v: .9 + (k % 5) * .12 }); }
    for (let k = 0; k < (PEU ? 4 : 9); k++) { const m = gens(k + 40), x = -12 + (k % 3) * 9 + al() * 3, z = -40 - Math.floor(k / 3) * 5; m.position.set(x, 0, z); m.rotation.y = Math.PI + (al() - .5) * .6; m.userData.anime = true; scene.add(m); m.userData.poser("debout", 0);
      const P = m.userData.parts; P.bras[1].e.rotation.x = -1.6; P.bras[1].c.rotation.x = -1.1; P.bras[0].e.rotation.x = -1.4; P.bras[0].c.rotation.x = -1.2; P.tete.rotation.x = -.2;   // (ils photographient la cathédrale)
      const ap = new THREE.Mesh(new THREE.BoxGeometry(.14, .09, .05), mat({ color: 0x1a1a1a })); ap.position.y = -m.userData.hipY * .36; P.bras[1].c.add(ap); } }

  /* ---------- là où l'on marche, la hauteur du sol ---------- */
  const enRampe = (x, z) => x > RAMPE_C[0] && x < RAMPE_C[1] && z < -22.5 && z > -25.1;
  const enEsc = (x, z) => x > ESC[0] && x < ESC[1] && z > 22.4 && z < 31;
  const libreObs = (x, z) => !(x > -21 && x < 19 && z < -68.4 && z > -208);
  L.hauteur = (x, z, p) => { if (enEsc(x, z)) return YB * Math.min(1, (31 - z) / 8.5);
    if (enRampe(x, z)) { const u = (RAMPE_C[1] - x) / (RAMPE_C[1] - RAMPE_C[0]); return u < .25 ? 0 : YB * (u - .25) / .75; }
    const pont = x > PP[0] && x < PP[1]; if (Math.abs(z) < 22.5 && Math.abs(z) > 18) return pont && !(p && p.g && p.g.position.y < -2) ? 0 : YB; return 0; };   /* (sous le pont, au bord de l'eau, on reste en bas) */
  L.limites = (x, z) => { if (x < -XS + 2 || x > XS - 2) return false;
    for (const [a, b, c, d] of OBS) if (x > a && x < b && z > c && z < d) return false;
    if (x > PP[0] + .6 && x < PP[1] - .6 && z > -25.8 && z < 25.8) return true;   // le pont
    if (Math.abs(z) > 18.4 && Math.abs(z) < 22.4) return true;   // les bas-ports
    if (enEsc(x, z) || enRampe(x, z)) return true;
    if (z > 25.7 && z < 44.4) return true;   // le grand quai
    if (x > PP[0] - 3.5 && x < PP[1] + 3.5 && z >= 44.4 && z < 125) return true;   // la rue du Petit-Pont
    if (z < -25.7 && z >= -31) return true;   // le quai de l'île, sa chaussée
    if (z < -31 && z > -213 && x > -61 && x < 61) return libreObs(x, z);   // le parvis, les côtés de la cathédrale, le square
    return false; };
  L.depart = [-70, 38.5]; L.taille = 1.8; L.suivi = { d: 6.5, h: 3.6, av: 3, vy: 2 }; L.fov = [60, 74];
  L.zone = [-XS, XS, -232, 140]; L.cam = { pos: [-70, 7, 40], vise: [FAC.x, 25, FAC.z] }; L.sansMusique = true;
  // l'abribus du quai de l'île, devant le parvis : on y arrive en bus, on y repart
  try { busLigne(L, scene, { ax: 30, az: -31.8, affiche: "orangina", voie: -29.3, sens: -1, x0: 148, x1: -148, dest: [{ vers: "rue", nom: "Rue du Faubourg-Poissonnière (la caserne)", arrivee: [10, -4.7], yawA: 0 }, { vers: "grande", nom: "Rue d'Hauteville", arrivee: [-6, -154.6], yawA: Math.PI }, { vers: "rex", nom: "Bonne-Nouvelle (le Grand Rex)", arrivee: [-26, -10.2], yawA: 0 }] }); } catch (e) { console.warn(e); }

  /* ---------- l'animation : l'eau, les bateaux, les voitures, les promeneurs, la nuit ---------- */
  let nV = null, tp = 0;
  const a0 = L.anim; L.anim = (tm) => { try { a0 && a0(tm); } catch (e) {} const n = !!L.nuit; if (n !== nV) { nV = n; for (const [m, j, nn] of NUIT) m.emissiveIntensity = n ? nn : j; }
    const dt = tp ? Math.min(.1, (tm - tp) / 1000) : 0; tp = tm; const t = tm / 1000;
    eauT.offset.x = (t * .012) % 1; eauT.offset.y = Math.sin(t * .2) * .02;
    for (const B of BAT) { const Lg = XS * 2 + 80, d = ((B.x0 + t * Math.abs(B.v)) % Lg), x = B.v > 0 ? -XS - 40 + d : XS + 40 - d; B.g.position.set(x, B.y + Math.sin(t * 1.3 + B.x0) * .05, B.z); B.g.rotation.y = B.v > 0 ? 0 : Math.PI; B.g.rotation.x = Math.sin(t * .9 + B.x0) * .01; }
    for (const V of VOIT) { V.s = (V.s + V.v * dt) % V.lg; const [l0, d, a, b] = V.seg.find(([l0, d]) => V.s < l0 + d) || V.seg[V.seg.length - 1], u = Math.min(1, (V.s - l0) / d); V.g.position.set(a[0] + (b[0] - a[0]) * u, .03, a[1] + (b[1] - a[1]) * u); V.g.rotation.y = Math.atan2(b[0] - a[0], b[1] - a[1]); }
    const c = M && M.camera && M.camera.position, R2 = ((MOBILE || GPU_MODESTE) ? 40 : 70) ** 2;
    for (const W of MARCH) try { const m = W.m, [tx, tz] = W.R[W.i], dx = tx - m.position.x, dz = tz - m.position.z, d = Math.hypot(dx, dz);
      if (d < .3) { W.i = (W.i + 1) % W.R.length; continue; } const v = Math.min(d, W.v * dt); m.position.x += dx / d * v; m.position.z += dz / d * v; m.position.y = L.hauteur(m.position.x, m.position.z, { g: m }); m.rotation.y = Math.atan2(dx, dz);
      if (!c || (m.position.x - c.x) ** 2 + (m.position.z - c.z) ** 2 < R2) m.userData.poser("marche", tm * W.v / 1.2); } catch (e) {} };
  // le soir : la cathédrale illuminée par des projecteurs, les quais à la lueur des réverbères
  { const proj = new THREE.SpotLight(0xffe2b0, 0, 140, .5, .6, 1); proj.position.set(FAC.x, 4, -33); proj.target.position.set(FAC.x, 30, FAC.z); scene.add(proj); scene.add(proj.target); NUIT.push([{ set emissiveIntensity(v) { proj.intensity = v * 1800; } }, 0, 1]); }

  fusionStatique(scene, L, 0);
}
({ construireNotreDame })
