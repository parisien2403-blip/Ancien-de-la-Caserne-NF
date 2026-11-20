/* (10.145) Notre-Dame de Paris et les quais de Seine, à l'ancienne :
   rive gauche, le quai de Montebello — le trottoir sous les platanes, le parapet de pierre et les boîtes vertes des bouquinistes, les immeubles anciens, la bouche de métro Saint-Michel ;
   en bas, le bas-port pavé au bord de l'eau, la péniche amarrée ; la Seine, le bateau-mouche qui passe ; le Petit-Pont de pierre ;
   en face, l'île de la Cité : son quai, le parvis pavé, la cathédrale — la façade aux deux tours, les portails, la rose, la galerie des rois ; la nef, les arcs-boutants, la flèche, le chevet.
   Chargé par la matrice (eval direct) la première fois qu'on y va. */
function construireNotreDame(A, L, scene) {
  const ECH = PETIT ? .5 : (MOBILE || GPU_MODESTE) ? .7 : 1, PEU = PETIT || MOBILE || GPU_MODESTE;
  let graine = 77; const al = () => (graine = (graine * 16807) % 2147483647) / 2147483647;
  const tT = (w, h, f, rx, ry) => { const c = document.createElement("canvas"); c.width = Math.max(8, Math.round(w * ECH)); c.height = Math.max(8, Math.round(h * ECH)); const x = c.getContext("2d"); x.scale(c.width / w, c.height / h); f(x, w, h);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; if (rx) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry || 1); } return t; };
  const mat = (o) => new THREE.MeshStandardMaterial({ roughness: .85, ...o });
  const add = (geo, m, x, y, z, ry = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.y = ry; o.receiveShadow = true; scene.add(o); return o; };
  const box = (w, h, d, m, x, y, z, ry = 0) => add(new THREE.BoxGeometry(w, h, d), m, x, y, z, ry);
  const cyl = (rt, rb, h, m, x, y, z, seg = 10) => add(new THREE.CylinderGeometry(rt, rb, h, seg), m, x, y, z);
  const sol = (x0, x1, z0, z1, m, y) => { const s = add(new THREE.PlaneGeometry(x1 - x0, z1 - z0), m, (x0 + x1) / 2, y, (z0 + z1) / 2); s.rotation.x = -Math.PI / 2; return s; };
  L.nuitObjets = L.nuitObjets || []; L.silhouettes = L.silhouettes || []; const NUIT = [];
  const serif = "Georgia, 'Times New Roman', serif";
  // les repères : la Seine (z de -18 à 18, à -5 m), le bas-port (à -4,3 m), le quai haut (à 0)
  const YE = -5.2, YB = -4.3, XS = 150;

  /* ---------- les matières ---------- */
  const pierreT = (base, joint, rx, ry, bloc = [64, 32]) => tT(256, 256, (c, w, h) => { c.fillStyle = base; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += bloc[1]) for (let x = (y / bloc[1] % 2) * bloc[0] / 2 - bloc[0]; x < w; x += bloc[0]) { c.fillStyle = `rgba(${al() < .5 ? "90,80,60" : "255,250,235"},${al() * .1})`; c.fillRect(x + 1, y + 1, bloc[0] - 2, bloc[1] - 2); c.fillStyle = joint; c.fillRect(x, y, bloc[0], 1.5); c.fillRect(x, y, 1.5, bloc[1]); }
    for (let i = 0; i < 300; i++) { c.fillStyle = `rgba(60,50,40,${al() * .08})`; c.fillRect(al() * w, al() * h, 2 + al() * 8, 2 + al() * 8); } }, rx, ry);
  const paveT = (base, rx, ry) => tT(256, 256, (c, w, h) => { c.fillStyle = "#4a4640"; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 16) for (let x = (y / 16 % 2) * 10; x < w; x += 20) { const k = al(); c.fillStyle = `rgb(${base[0] + k * 30 - 15},${base[1] + k * 30 - 15},${base[2] + k * 26 - 13})`; c.beginPath(); c.roundRect(x + 1.5, y + 1.5, 17, 13, 3); c.fill(); } }, rx, ry);
  const quaiM = mat({ map: pierreT("#c8bca2", "rgba(90,80,60,.5)", 30, 2, [48, 24]) });
  const murM = mat({ map: pierreT("#b8ac92", "rgba(80,70,50,.55)", 40, 1, [64, 32]) });
  const paveM = mat({ map: paveT([120, 116, 108], 40, 3), roughness: .95 });
  const paveB = mat({ map: paveT([108, 104, 96], 60, 2), roughness: .95 });
  const trottM = mat({ map: tT(128, 128, (c, w, h) => { c.fillStyle = "#a8a296"; c.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { c.fillStyle = ["#9a948a", "#b6b0a4", "#8e887e"][i % 3]; c.fillRect(al() * w, al() * h, 2, 2); } }, 60, 3), roughness: .95 });
  const routeM = mat({ map: tT(128, 128, (c, w, h) => { c.fillStyle = "#4a4a4c"; c.fillRect(0, 0, w, h); for (let i = 0; i < 1200; i++) { c.fillStyle = ["#3e3e40", "#58585a", "#444446"][i % 3]; c.fillRect(al() * w, al() * h, 2, 2); } }, 80, 4), roughness: .95 });
  const parvisM = mat({ map: tT(256, 256, (c, w, h) => { c.fillStyle = "#cfc6b2"; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 32) for (let x = 0; x < w; x += 64) { c.fillStyle = `rgba(${al() < .5 ? "120,110,90" : "255,250,240"},${al() * .12})`; c.fillRect(x + 1, y + 1, 62, 30); c.fillStyle = "rgba(100,90,70,.35)"; c.fillRect(x, y, 64, 1); c.fillRect(x, y, 1, 32); } }, 30, 30), roughness: .9 });

  /* ---------- la Seine : l'eau verte et mouvante, les reflets ---------- */
  const eauT = tT(256, 256, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#3e5a52"); g.addColorStop(1, "#2e4a46"); c.fillStyle = g; c.fillRect(0, 0, w, h); for (let i = 0; i < 260; i++) { c.strokeStyle = `rgba(${al() < .5 ? "190,215,205" : "20,40,36"},${.08 + al() * .14})`; c.lineWidth = 1 + al() * 1.5; c.beginPath(); const x = al() * w, y = al() * h; c.moveTo(x, y); c.quadraticCurveTo(x + 12, y - 3, x + 26 + al() * 20, y); c.stroke(); } }, 30, 8);
  const eau = sol(-XS, XS, -18, 18, mat({ map: eauT, roughness: .15, metalness: .3, color: 0xb8d0c8 }), YE); eau.userData.anime = true; L.sol = eau;

  /* ---------- les deux rives : le bas-port, le mur de quai, le quai haut ---------- */
  // rive gauche (au sud, z > 0) : bas-port de 18 à 22,5 ; le mur jusqu'à 25,3 ; le trottoir sous les platanes jusqu'à 31 ; la chaussée ; le trottoir des immeubles
  // l'île de la Cité (au nord, z < 0) : bas-port de -22,5 à -18 ; le mur ; le quai haut, puis le parvis et la cathédrale
  const PP = [-118, -106], PD = [-34, -26], horsPont = (x, m = 2) => !(x > PP[0] - m && x < PP[1] + m) && !(x > PD[0] - m && x < PD[1] + m);   /* (d'après la vue du ciel : le Petit-Pont au bout du parvis, le pont au Double au pied de la façade) */
  const RAMPE_G = [10, 26], RAMPE_C = [30, 46];   // (les rampes qui descendent au bord de l'eau)
  for (const s of [1, -1]) { const [r0, r1] = s > 0 ? RAMPE_G : RAMPE_C;
    sol(-XS, XS, s > 0 ? 18 : -22.5, s > 0 ? 22.5 : -18, paveB, YB);
    box(XS * 2, YB - YE + .2, .6, murM, 0, (YB + YE) / 2, s * 18);   // (le bord du bas-port, dans l'eau)
    for (const [a, b] of [[-XS, r0], [r1, XS]]) box(b - a, -YB, 2.8, murM, (a + b) / 2, YB / 2, s * 23.9);   // le mur de quai, épais
    box(r1 - r0, -YB, .4, murM, (r0 + r1) / 2, YB / 2, s * 25.1);   // (le mur, derrière la rampe)
    { const g = new THREE.PlaneGeometry(r1 - r0, 2.4); g.rotateX(-Math.PI / 2); const P = g.attributes.position; for (let i = 0; i < P.count; i++) { const x = P.getX(i) + (r0 + r1) / 2, u = s > 0 ? (x - r0) / (r1 - r0) : (r1 - x) / (r1 - r0); P.setY(i, u < .25 ? 0 : YB * (u - .25) / .75); } g.computeVertexNormals();
      const rp = add(g, paveB, 0, .01, s * 23.8); void rp; }   // la rampe pavée
    // le parapet de pierre, ouvert en haut de la rampe
    const pa = s > 0 ? [r0, r0 + 4] : [r1 - 4, r1];
    { let seg = [[-XS, XS]]; for (const [o0, o1] of [pa, PP, PD]) seg = seg.flatMap(([a, b]) => o1 <= a || o0 >= b ? [[a, b]] : [[a, o0], [o1, b]].filter(([u, v]) => v - u > .1));
      for (const [a, b] of seg) box(b - a, 1, .55, quaiM, (a + b) / 2, .5, s * 25.3); }
  }
  sol(-XS, XS, 25.6, 31, trottM, .02); sol(-XS, XS, 31, 41, routeM, .01); sol(-XS, XS, 41, 46, trottM, .03);
  for (const z of [31, 41]) box(XS * 2, .14, .25, quaiM, 0, .07, z);   // les bordures
  { const lig = mat({ color: 0xe8e4d8 }); for (let x = -XS; x < XS; x += 6) box(3, .01, .14, lig, x, .02, 36); }
  sol(-XS, XS, -31, -25.6, trottM, .02); sol(-120, -27, -100, -31, parvisM, .015); sol(-27, XS, -38, -31, trottM, .02);

  /* ---------- le Petit-Pont : l'arche de pierre, la chaussée, ses parapets ---------- */
  { const [x0, x1] = PP, cx = (x0 + x1) / 2;
    sol(x0, x1, -25.6, 25.6, routeM, .03); for (const sx of [x0 + .3, x1 - .3]) box(.55, 1, 51.2, quaiM, sx, .5, 0);
    const arc = new THREE.Shape(); arc.moveTo(-25.6, 0); arc.lineTo(25.6, 0); arc.lineTo(25.6, YE - .2); arc.lineTo(17, YE - .2); arc.absellipse(0, YE - .2, 17, 4.3, 0, Math.PI, false); arc.lineTo(-25.6, YE - .2); arc.closePath();
    const ag = new THREE.ExtrudeGeometry(arc, { depth: x1 - x0, bevelEnabled: false }); ag.rotateY(Math.PI / 2); const ar = add(ag, murM, x0, 0, 0); ar.position.x = x0; void ar; }
  // le pont au Double, en fonte, plus loin
  { const [x0, x1] = PD; sol(x0, x1, -25.6, 25.6, trottM, .03); const fonte = mat({ color: 0x2c3a33, metalness: .5, roughness: .5 });
    for (const sx of [x0 + .15, x1 - .15]) { box(.08, .9, 51.2, fonte, sx, .55, 0); box(.12, .08, 51.2, fonte, sx, 1.02, 0); }
    const ar = new THREE.Mesh(new THREE.TorusGeometry(22, .8, 6, 30, Math.PI), fonte); ar.rotation.set(Math.PI, Math.PI / 2, 0); ar.scale.set(1, .2, 1); ar.position.set((x0 + x1) / 2, -.4, 0);   /* (l'arche de fonte sous le tablier) */ scene.add(ar); box(x1 - x0, .5, 51.2, fonte, (x0 + x1) / 2, -.2, 0); }

  /* ---------- les bouquinistes : les boîtes vertes sur le parapet, ouvertes, les livres, les gravures, les affiches ---------- */
  { const vert = mat({ color: 0x1f4a32, roughness: .6 }), vertC = mat({ color: 0x2a5a3e, roughness: .6 }), fer = mat({ color: 0x1a1a1a, metalness: .5 });
    const affT = [0, 1, 2, 3].map(k => tT(128, 96, (c, w, h) => { c.fillStyle = ["#f2ead2", "#e8dcc0", "#efe6d0", "#e4d8bc"][k]; c.fillRect(0, 0, w, h); for (let i = 0; i < 6; i++) { const x = 6 + (i % 3) * 40, y = 6 + Math.floor(i / 3) * 44; c.fillStyle = ["#c83a2a", "#2a5a9a", "#d8a020", "#3a3a3a", "#6a8a4a", "#8a3a6a"][(i + k) % 6]; c.fillRect(x, y, 34, 38); c.fillStyle = "rgba(255,255,255,.6)"; c.fillRect(x + 4, y + 4, 26, 10); c.fillStyle = "#1a1a1a"; c.font = "bold 7px Georgia"; c.fillText(["PARIS", "1900", "SEINE", "MOULIN", "ROMAN", "AFFICHE"][(i + k * 2) % 6], x + 5, y + 12); } }));
    const LIV = [], cols = [0xc83a2a, 0x2a5aa8, 0xe8d8b0, 0x2a7a4a, 0xd8a020, 0x7a2a6a, 0xf2f0ea, 0x3a2a1a, 0xc86a2a];
    for (let x = -XS + 4; x < XS - 4; x += 2.4) { if (!horsPont(x) || (x > RAMPE_G[0] - 1 && x < RAMPE_G[0] + 5)) continue; if (al() < .12) continue;
      const z = 25.3, y = 1.0, ouv = al() < .78; box(2.1, .55, .72, vert, x, y + .275, z);
      if (ouv) { const lid = new THREE.Group(); lid.position.set(x, y + .55, z - .36); lid.rotation.x = -.25; scene.add(lid); const l = new THREE.Mesh(new THREE.BoxGeometry(2.1, .72, .04), vertC); l.position.y = .36; lid.add(l);
          const af = new THREE.Mesh(new THREE.PlaneGeometry(1.9, .62), mat({ map: affT[(x * 7 | 0) & 3], roughness: .9 })); af.position.set(0, .36, .025); lid.add(af);
          for (let k = 0; k < 14; k++) LIV.push([x - .95 + k * .135, y + .6, z - .1 + (k % 3) * .14, cols[(k + (x | 0)) % 9]]); }
      else box(2.12, .05, .74, vertC, x, y + .58, z);
      for (const sx of [-.9, .9]) cyl(.03, .03, 1, fer, x + sx, .5, z + .2, 5); }
    if (LIV.length) { const im = new THREE.InstancedMesh(new THREE.BoxGeometry(.12, .2, .025), mat({ roughness: .7 }), LIV.length), m4 = new THREE.Matrix4(), co = new THREE.Color();
      LIV.forEach(([x, y, z, c], i) => { m4.makeRotationX(-.5); m4.setPosition(x, y + .08, z); im.setMatrixAt(i, m4); im.setColorAt(i, co.setHex(c)); }); im.instanceMatrix.needsUpdate = true; scene.add(im); } }

  /* ---------- les platanes, les réverbères, les bancs ---------- */
  { const tronc = mat({ color: 0x8a8070, roughness: .9 }), feuil = [mat({ color: 0x4a6a2a, roughness: 1, flatShading: true }), mat({ color: 0x5a7a34, roughness: 1, flatShading: true }), mat({ color: 0x3e5a24, roughness: 1, flatShading: true })];
    const platane = (x, z) => { cyl(.22, .32, 7, tronc, x, 3.5, z, 8); for (let k = 0; k < 4; k++) add(new THREE.IcosahedronGeometry(2 + al() * 1.3, 1), feuil[k % 3], x + (al() - .5) * 2.6, 7.8 + al() * 2.2, z + (al() - .5) * 2.6); };
    for (let x = -XS + 6; x < XS; x += 10) { if (!horsPont(x, 4)) continue; platane(x, 29.6); }
    for (let x = -20; x < XS; x += 11) platane(x, -28);
    const fonte = mat({ color: 0x23302a, metalness: .5, roughness: .5 });
    const reverbere = (x, z) => { cyl(.06, .11, 4.2, fonte, x, 2.1, z, 8); cyl(.13, .13, .5, fonte, x, .25, z, 8); const lan = new THREE.Mesh(new THREE.CylinderGeometry(.2, .12, .5, 6), new THREE.MeshStandardMaterial({ color: 0xf2e6c4, emissive: 0xffd590, emissiveIntensity: .05 })); lan.position.set(x, 4.5, z); scene.add(lan); NUIT.push([lan.material, .05, 1.2]);
      cyl(.22, .05, .18, fonte, x, 4.82, z, 6); const l = new THREE.PointLight(0xffd08a, 14, 14, 1.5); l.position.set(x, 4.3, z); l.visible = false; scene.add(l); L.nuitObjets.push(l); };
    for (let x = -XS + 11; x < XS; x += 20) { if (horsPont(x, 3)) reverbere(x, 26.4); if (horsPont(x + 10, 3)) reverbere(x + 10, -26.4); }
    for (const [x, z] of [[-95, -42], [-60, -42], [-100, -70], [-100, -92], [-40, -95], [-70, -95]]) reverbere(x, z);
    const banc = (x, z, ry) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g); const v = mat({ color: 0x2e5a3a }); for (let l = 0; l < 3; l++) { const b = new THREE.Mesh(new THREE.BoxGeometry(1.8, .04, .1), v); b.position.set(0, .45, -.12 + l * .13); g.add(b); } const d = new THREE.Mesh(new THREE.BoxGeometry(1.8, .3, .04), v); d.position.set(0, .7, -.22); g.add(d); for (const sx of [-.75, .75]) { const p = new THREE.Mesh(new THREE.BoxGeometry(.06, .45, .45), fonte); p.position.set(sx, .22, -.03); g.add(p); }
      (L.tabourets = L.tabourets || []).push([x + Math.cos(ry) * -.45, z - Math.sin(ry) * -.45, ry, .46], [x + Math.cos(ry) * .45, z - Math.sin(ry) * .45, ry, .46]); };
    for (let x = -XS + 16; x < XS; x += 20) { if (!horsPont(x, 3)) continue; banc(x, 30.4, Math.PI); }
    for (const [x, z, r] of [[-85, -40, Math.PI], [-65, -40, Math.PI], [-45, -40, Math.PI], [-35, -96, 0], [-80, -96, 0]]) banc(x, z, r); L.nbTabouretsSalle = 0; }

  /* ---------- les immeubles anciens de la rive gauche, face à la Seine (et la rue qui file) ---------- */
  { const teintes = ["#e8dcc4", "#e2d6bc", "#ece2cc", "#ddd0b4", "#e6d8be"], RDC = [["CAFÉ DE LA SEINE", "#7a1a1a"], ["LIBRAIRIE ANCIENNE", "#1e4a3a"], ["BRASSERIE NOTRE-DAME", "#5a2a14"], ["CRÊPERIE", "#1a3a6a"], ["TABAC · PRESSE", "#2a2a2a"], ["GALERIE D'ESTAMPES", "#3a2a4a"], ["BOULANGERIE", "#6a3a18"], ["SOUVENIRS DE PARIS", "#1a4a6a"]];
    let k = 0; for (let x = -XS + 9; x < XS; x += 17) { if (!horsPont(x, 9) || (x > -52 && x < -2)) { k++; continue; } let [nom, coul] = RDC[k % RDC.length]; if (Math.abs(x + 90) < 6) [nom, coul] = ["CAFÉ LE PETIT PONT", "#9a1a1a"]; if (Math.abs(x + 56) < 6) [nom, coul] = ["SHAKESPEARE AND COMPANY", "#1e4a2a"];
      const rdc = (c, w, yr, h) => { c.fillStyle = "#3a2a20"; c.fillRect(0, yr, w, h); c.fillStyle = coul; c.fillRect(10, yr + 6, w - 20, 34); c.fillStyle = "#f2e6c8"; c.font = "bold 22px Georgia, serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(nom, w / 2, yr + 24);
        for (let i = 0; i < 4; i++) { const X = 20 + i * (w - 40) / 4; const g = c.createLinearGradient(0, yr + 48, 0, yr + h); g.addColorStop(0, "#f2d8a6"); g.addColorStop(1, "#8a6440"); c.fillStyle = g; c.fillRect(X + 4, yr + 50, (w - 40) / 4 - 8, h - 54); c.fillStyle = "rgba(255,255,255,.14)"; c.fillRect(X + 4, yr + 50, 10, h - 54); } };
      const o = A.haussmann({ x, z: 46, largeur: 16.4, etages: 5 + (k % 2), rot: Math.PI, teinte: teintes[k % 5], graine: 200 + k, rdc }); L.nuitObjets.push(...o.userData.nuit); L.silhouettes.push(...o.userData.silhouettes); k++; }
    // la bouche de métro Saint-Michel – Notre-Dame : la balustrade de fonte, l'enseigne, la lanterne
    { const mx = -128, mz = 42.6, fonte = mat({ color: 0x2c3a33, metalness: .5, roughness: .5 }); for (const [w, d, x, z] of [[4.2, .06, mx, mz - 1.4], [.06, 2.8, mx - 2.1, mz], [.06, 2.8, mx + 2.1, mz]]) box(w, .9, d, fonte, x, .45, z);
      const enT = tT(256, 48, (c, w, h) => { c.fillStyle = "#1a3a2a"; c.fillRect(0, 0, w, h); c.fillStyle = "#e8d890"; c.font = "bold 26px Georgia"; c.textAlign = "center"; c.fillText("MÉTROPOLITAIN", w / 2, 34); });
      for (const sx of [-2.1, 2.1]) cyl(.06, .08, 2.8, fonte, mx + sx, 1.4, mz - 1.4, 8); const pn = box(4.2, .4, .06, mat({ map: enT }), mx, 2.8, mz - 1.4); void pn; L.metroND = { x: mx, z: mz }; } }

  /* ---------- (d'après la vue du ciel) la rue de la Cité qui file depuis le Petit-Pont ; le jardin au bord de l'eau, le long du parvis ; l'Hôtel-Dieu au nord ;
     en face, rive gauche, le square René-Viviani et sa petite église ; les bateaux amarrés au bas-port ---------- */
  sol(PP[0], PP[1], -120, -25.6, routeM, .025);
  { const haie = mat({ color: 0x3e5a2a, roughness: 1 }), feu = [mat({ color: 0x4a6a2a, roughness: 1, flatShading: true }), mat({ color: 0x5a7a34, roughness: 1, flatShading: true })], tr = mat({ color: 0x7a6a58 });
    sol(-102, -36, -37.5, -31, mat({ color: 0x5a7a3a, roughness: 1 }), .03);
    for (let x = -98; x < -38; x += 7) { box(5.2, .7, .8, haie, x, .35, -34.2); if ((x / 7 | 0) % 2) { cyl(.2, .3, 5, tr, x + 3.4, 2.5, -33, 7); for (let k = 0; k < 3; k++) add(new THREE.IcosahedronGeometry(1.8 + al(), 1), feu[k % 2], x + 3.4 + (al() - .5) * 2, 5.8 + al() * 1.5, -33 + (al() - .5) * 2); } } }
  for (const [x, l] of [[-96, 20], [-76, 20], [-56, 20], [-37, 18]]) { const o = A.haussmann({ x, z: -102, largeur: l, etages: 4, rot: 0, teinte: "#d6d0c2", graine: 300 + x }); L.nuitObjets.push(...o.userData.nuit); L.silhouettes.push(...o.userData.silhouettes); }
  { const herbe = mat({ color: 0x5a7a3a, roughness: 1 }), allee = mat({ color: 0xc8b898, roughness: 1 }), feu = [mat({ color: 0x4a6a2a, roughness: 1, flatShading: true }), mat({ color: 0x5a7a34, roughness: 1, flatShading: true }), mat({ color: 0x6a5a2a, roughness: 1, flatShading: true })], tr = mat({ color: 0x7a6a58 });
    sol(-52, -2, 46, 72, herbe, .02); sol(-30, -24, 46, 72, allee, .03); sol(-52, -2, 56, 60, allee, .03);
    for (let k = 0; k < 14; k++) { const x = -48 + al() * 42, z = 48 + al() * 22; if (Math.abs(x + 27) < 4 || Math.abs(z - 58) < 3) continue; cyl(.25, .35, 6, tr, x, 3, z, 7); for (let j = 0; j < 3; j++) add(new THREE.IcosahedronGeometry(2 + al(), 1), feu[j % 3], x + (al() - .5) * 2.4, 6.6 + al() * 1.6, z + (al() - .5) * 2.4); }
    const fonte = mat({ color: 0x23302a, metalness: .5 }); for (let x = -52; x < -2; x += .5) if (Math.abs(x + 27) > 3) box(.04, 1, .04, fonte, x, .5, 46.2); box(50, .05, .06, fonte, -27, .98, 46.2);
    // Saint-Julien-le-Pauvre : la petite église romane au fond du square
    const pierre2 = mat({ color: 0xc8bca0, roughness: .9 }); box(10, 9, 22, pierre2, -27, 4.5, 82); const pr = new THREE.Shape(); pr.moveTo(-5.4, 0); pr.lineTo(0, 4); pr.lineTo(5.4, 0); pr.closePath(); const tg = add(new THREE.ExtrudeGeometry(pr, { depth: 22, bevelEnabled: false }), mat({ color: 0x7a4a3a, roughness: .8 }), -27, 9, 71); void tg; }
  // les bateaux amarrés au bas-port de la rive gauche (Bateaux Parisiens)
  for (const [x, c] of [[-80, 0x1a3a7a], [-55, 0x2a2a2a]]) { const g = new THREE.Group(); g.position.set(x, YE + .6, 15.2); scene.add(g); const blanc = mat({ color: 0xf2f2ee, roughness: .4 }), vitre = mat({ color: 0x6a8aa0, roughness: .1, metalness: .4, transparent: true, opacity: .7 });
    for (const [w, h, d, m, y] of [[22, 1.4, 5, blanc, 0], [22.2, .3, 5.2, mat({ color: c }), -.6], [18, 1.6, 4.4, vitre, 1.5], [18.4, .1, 4.8, blanc, 2.35]]) { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.y = y; g.add(o); } }
  /* ---------- Notre-Dame ---------- */
  const PIERRE = "#d6cbb0";
  const ND = { x0: -26, x1: 92, z0: -78, z1: -40 }, CZ = (ND.z0 + ND.z1) / 2;   // la nef, de la façade (à l'ouest, vers le parvis) au chevet
  { const pierre = mat({ color: 0xd6cbb0, roughness: .85 }), pierreS = mat({ color: 0xbfb398, roughness: .9 }), plomb = mat({ color: 0x8a98a6, roughness: .4, metalness: .45 }), vitrail = mat({ color: 0x1a2440, roughness: .2, metalness: .3, emissive: 0x2a3a8a, emissiveIntensity: .05 });
    NUIT.push([vitrail, .05, .5]);
    // la façade : les trois portails, la galerie des rois, la rose et ses baies, la galerie à claire-voie, les deux tours et leurs grandes baies
    const facT = tT(1024, 1600, (c, w, h) => { c.fillStyle = PIERRE; c.fillRect(0, 0, w, h); const sx = w / 40, sy = h / 63;
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
    });
    const FX = ND.x0, FH = 63; facT.anisotropy = 8;
    { const fm = new THREE.MeshStandardMaterial({ map: facT, transparent: true, alphaTest: .5, roughness: .85, emissive: 0xffe8c0, emissiveMap: facT, emissiveIntensity: 0 }); NUIT.push([fm, 0, .55]);   /* (le soir, la façade illuminée) */
      const fp = add(new THREE.PlaneGeometry(40, FH), fm, FX - .55, FH / 2, CZ, -Math.PI / 2); void fp; }
    // les volumes derrière la façade : les tours, le corps central, les contreforts en saillie
    for (const sz of [-1, 1]) { box(12, FH - .2, 13, pierre, FX + 6.6, (FH - .2) / 2, CZ + sz * 13.4); box(13.4, 1, 13.4, pierreS, FX + 6.6, FH - .1, CZ + sz * 13.4);
      for (const [dx, dz] of [[-6, -6], [6, -6], [-6, 6], [6, 6]]) { cyl(.5, .7, 2.2, pierreS, FX + 6.6 + dx, FH + 1.5, CZ + sz * 13.4 + dz, 8); cyl(.02, .5, 3.4, pierreS, FX + 6.6 + dx, FH + 4.2, CZ + sz * 13.4 + dz, 8); }   // les pinacles aux angles des tours
      cyl(.02, 1.2, 5, plomb, FX + 6.6, FH + 2.5, CZ + sz * 13.4, 4); }
    box(12.6, 41.5, 12, pierre, FX + 6.9, 20.75, CZ);
    for (const z of [-20, -13.3, -6.8, 6.8, 13.3, 20]) box(.5, 42, 1.4, pierreS, FX - .85, 21, CZ + z);
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
    { const herbe = mat({ color: 0x5a7a3a, roughness: 1 }); sol(NX0, ND.x1 + 25, -38, -31, herbe, .03); } }
  // le parvis : la statue de Charlemagne à cheval, le point zéro
  { const bronze = mat({ color: 0x4a5a48, metalness: .6, roughness: .45 }); box(4, 2.2, 6, mat({ color: 0xb0a690 }), -96, 1.1, -82); const ch = new THREE.Group(); ch.position.set(-96, 2.2, -82); scene.add(ch);
    const c1 = new THREE.Mesh(new THREE.CapsuleGeometry(.7, 1.8, 4, 8), bronze); c1.rotation.x = Math.PI / 2; c1.position.y = 1.6; ch.add(c1); for (const [x, z] of [[-.4, -.8], [.4, -.8], [-.4, .8], [.4, .8]]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(.12, .1, 1.3, 6), bronze); p.position.set(x, .65, z); ch.add(p); }
    const tete = new THREE.Mesh(new THREE.CapsuleGeometry(.25, .8, 4, 8), bronze); tete.position.set(0, 2.5, 1.4); tete.rotation.x = .6; ch.add(tete); const cav = new THREE.Mesh(new THREE.CapsuleGeometry(.35, .9, 4, 8), bronze); cav.position.set(0, 3, 0); ch.add(cav);
    const pz = new THREE.Mesh(new THREE.CircleGeometry(.4, 24), mat({ color: 0xc8a040, metalness: .7, roughness: .3 })); pz.rotation.x = -Math.PI / 2; pz.position.set(-40, .03, -50); scene.add(pz); }

  /* ---------- sur la Seine : le bateau-mouche qui passe, la péniche amarrée ---------- */
  const BM = new THREE.Group(); BM.userData.anime = true; scene.add(BM);
  { const blanc = mat({ color: 0xf2f2ee, roughness: .4 }), vitre = mat({ color: 0x6a8aa0, roughness: .1, metalness: .4, transparent: true, opacity: .7 }), bleu = mat({ color: 0x1a3a6a }), rouge = mat({ color: 0xa82a2a });
    const b = (w, h, d, m, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); BM.add(o); return o; };
    b(28, 1.6, 6, blanc, 0, .4, 0); b(28.2, .3, 6.2, bleu, 0, -.3, 0); b(22, 1.8, 5.2, vitre, -1, 2.1, 0); b(22.4, .12, 5.6, blanc, -1, 3.05, 0);
    for (let k = 0; k < 10; k++) for (const sz of [-1, 1]) b(.4, .7, .4, rouge, -10 + k * 2.2, 1.6, sz * 1.4);
    const pr = new THREE.Mesh(new THREE.ConeGeometry(3, 5, 4), blanc); pr.rotation.z = -Math.PI / 2; pr.rotation.x = Math.PI / 4; pr.scale.set(1, 1, .6); pr.position.set(16, .4, 0); BM.add(pr);
    const pe = new THREE.Group(); pe.position.set(40, YE + .5, 15.5); scene.add(pe); const coque = mat({ color: 0x2a2a2e, roughness: .6 }), boisP = mat({ color: 0x8a5a32 });
    for (const [w, h, d, m, x, y, z] of [[34, 1.6, 5, coque, 0, 0, 0], [12, 2.2, 4, boisP, 8, 1.8, 0], [3, 1.2, 3, mat({ color: 0xf2f0ea }), -12, 1.4, 0]]) { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); pe.add(o); }
    for (let k = 0; k < 6; k++) { const f = new THREE.Mesh(new THREE.BoxGeometry(.4, .4, .4), mat({ color: [0xd84a2a, 0x3a8a3a, 0xe8c040][k % 3] })); f.position.set(-6 + k * 2.2, 1.0, 2); pe.add(f); } }

  /* ---------- du monde : les promeneurs sur le quai, au bord de l'eau, sur le parvis ; des touristes qui photographient la cathédrale ---------- */
  const MARCH = [], PE = ["#f0c9a6", "#c78f62", "#e8bd95", "#8d5a3b", "#f6d6bc", "#6a4028"], HA = ["#2a3a5a", "#7a2a3a", "#3a3a40", "#e8e2d6", "#5a4636", "#2f5a4a", "#c8a040", "#1a1a1c", "#8a2a2a", "#4a5a7a"];
  const gens = (k) => { const f = k % 2 === 1; return personne3D({ taille: f ? 1.64 : 1.76, peau: PE[k % 6], ch: ["#2a1a12", "#5a3a22", "#141010", "#8a8a8a", "#e2c27a"][k % 5], haut: HA[k % 10], bas: ["#26324e", "#2a2a30", "#3a3028", "#5a6a7a"][k % 4], chaussures: ["#1a1a1a", "#e8e8e8"][k % 2], coif: f ? (k % 3 ? "long" : "carre") : k % 4 ? "court" : "chauve", pantalon: !f || k % 3 === 0, robe: f && k % 3 !== 0 }); };
  { const R = [[[-140, 28], [140, 28]], [[140, 27], [-140, 27]], [[-140, 43.5], [140, 43.5]], [[-140, 20.5], [140, 20.5]], [[-112, 24], [-112, -28], [-90, -60], [-60, -90], [-36, -60], [-30, -28], [-30, 24], [-30, -28], [-60, -45], [-112, -28]], [[-110, -45], [-35, -45]], [[-20, -28], [140, -28]], [[-60, 26], [-60, -26]]];
    for (let k = 0, n = PEU ? 16 : 34; k < n; k++) { const Rr = R[k % R.length], m = gens(k), i0 = (k * 3) % Rr.length, a = Rr[i0], b = Rr[(i0 + 1) % Rr.length], u = ((k * 37) % 100) / 100; m.position.set(a[0] + (b[0] - a[0]) * u, 0, a[1] + (b[1] - a[1]) * u); m.userData.poser("marche", 0); m.userData.anime = true; scene.add(m);
      MARCH.push({ m, R: Rr, i: (i0 + 1) % Rr.length, v: .9 + (k % 5) * .12 }); }
    for (let k = 0; k < (PEU ? 4 : 9); k++) { const m = gens(k + 40), x = -66 + (k % 3) * 6 + al() * 3, z = -52 - Math.floor(k / 3) * 7; m.position.set(x, 0, z); m.rotation.y = Math.PI / 2 + (al() - .5) * .6; m.userData.anime = true; scene.add(m); m.userData.poser("debout", 0);
      const P = m.userData.parts; P.bras[1].e.rotation.x = -1.6; P.bras[1].c.rotation.x = -1.1; P.bras[0].e.rotation.x = -1.4; P.bras[0].c.rotation.x = -1.2; P.tete.rotation.x = -.2;   // (ils photographient la cathédrale)
      const ap = new THREE.Mesh(new THREE.BoxGeometry(.14, .09, .05), mat({ color: 0x1a1a1a })); ap.position.y = -m.userData.hipY * .36; P.bras[1].c.add(ap); } }

  /* ---------- là où l'on marche, la hauteur du sol ---------- */
  const enRampe = (x, z, [r0, r1], s) => x > r0 && x < r1 && (s > 0 ? z > 22.5 && z < 25.1 : z < -22.5 && z > -25.1);
  const libreObs = (x, z) => !(x > ND.x0 - 1.5 && x < ND.x1 + 12 && z > ND.z0 - 12 && z < -38.4) && !(Math.abs(x + 96) < 2.6 && Math.abs(z + 82) < 3.6);
  L.hauteur = (x, z, p) => { for (const [s, R] of [[1, RAMPE_G], [-1, RAMPE_C]]) if (enRampe(x, z, R, s)) { const u = s > 0 ? (x - R[0]) / (R[1] - R[0]) : (R[1] - x) / (R[1] - R[0]); return u < .25 ? 0 : YB * (u - .25) / .75; }
    const pont = (x > PP[0] && x < PP[1]) || (x > PD[0] && x < PD[1]); if (Math.abs(z) < 22.5 && Math.abs(z) > 18) return pont && !(p && p.g && p.g.position.y < -2) ? 0 : YB; return 0; };   /* (sous un pont, au bord de l'eau, on reste en bas) */
  L.limites = (x, z) => { if (x < -XS + 2 || x > XS - 2) return false;
    if (x > PP[0] + .4 && x < PP[1] - .4 && z > -25.8 && z < 25.8) return true;   // le Petit-Pont
    if (x > PD[0] + .3 && x < PD[1] - .3 && z > -25.8 && z < 25.8) return true;   // le pont au Double
    if (z > 18.4 && z < 22.4) return true; if (z < -18.4 && z > -22.4) return true;   // les bas-ports
    for (const [s, R] of [[1, RAMPE_G], [-1, RAMPE_C]]) if (enRampe(x, z, R, s)) return true;
    if (z > 25.7 && z < 44.4) return true;   // le quai haut, la chaussée, le trottoir des immeubles
    if (x > -51.6 && x < -2.4 && z >= 44.4 && z < 70) return !(z > 45.9 && z < 46.5 && Math.abs(x + 27) > 2.8);   // le square René-Viviani
    if (z < -25.7 && z > -100 && x > -118) return x > -27 ? z > -38.4 && libreObs(x, z) : libreObs(x, z);   // l'île : le quai, le parvis, le jardin
    return false; };
  L.depart = [-128, 38.5]; L.taille = 1.8; L.suivi = { d: 6.5, h: 3.6, av: 3, vy: 2 }; L.fov = [60, 74];
  L.zone = [-XS, XS, -100, 46]; L.cam = { pos: [-40, 6, 36], vise: [-20, 18, -40] }; L.sansMusique = true;

  /* ---------- l'animation : l'eau, le bateau-mouche, les promeneurs, la nuit ---------- */
  let nV = null, tp = 0;
  const a0 = L.anim; L.anim = (tm) => { try { a0 && a0(tm); } catch (e) {} const n = !!L.nuit; if (n !== nV) { nV = n; for (const [m, j, nn] of NUIT) m.emissiveIntensity = n ? nn : j; }
    const dt = tp ? Math.min(.1, (tm - tp) / 1000) : 0; tp = tm; const t = tm / 1000;
    eauT.offset.x = (t * .012) % 1; eauT.offset.y = Math.sin(t * .2) * .02;
    { const L2 = XS * 2 + 60, d = (t * 4.2) % (2 * L2), aller = d < L2, x = aller ? -XS - 30 + d : XS + 30 - (d - L2); BM.position.set(x, YE + .9 + Math.sin(t * 1.3) * .05, aller ? -6 : 6); BM.rotation.y = aller ? 0 : Math.PI; }
    const c = M && M.camera && M.camera.position, R2 = ((MOBILE || GPU_MODESTE) ? 40 : 70) ** 2;
    for (const W of MARCH) try { const m = W.m, [tx, tz] = W.R[W.i], dx = tx - m.position.x, dz = tz - m.position.z, d = Math.hypot(dx, dz);
      if (d < .3) { W.i = (W.i + 1) % W.R.length; continue; } const v = Math.min(d, W.v * dt); m.position.x += dx / d * v; m.position.z += dz / d * v; m.position.y = L.hauteur(m.position.x, m.position.z); m.rotation.y = Math.atan2(dx, dz);
      if (!c || (m.position.x - c.x) ** 2 + (m.position.z - c.z) ** 2 < R2) m.userData.poser("marche", tm * W.v / 1.2); } catch (e) {} };
  // le soir : la cathédrale illuminée par des projecteurs, les quais à la lueur des réverbères
  { const proj = new THREE.SpotLight(0xffe2b0, 0, 140, .5, .6, 1); proj.position.set(-75, 4, -40); proj.target.position.set(ND.x0, 30, CZ); scene.add(proj); scene.add(proj.target); NUIT.push([{ set emissiveIntensity(v) { proj.intensity = v * 1800; } }, 0, 1]); }

  fusionStatique(scene, L, 0);
}
({ construireNotreDame })
