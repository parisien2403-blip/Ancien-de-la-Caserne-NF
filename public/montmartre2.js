/* Montmartre, le nouveau (10.239) : une place de Montmartre bâtie avec des façades peintes à la main (style animation japonaise), mises en relief :
   vitrines creuses avec leur salle derrière, fenêtres creusées, balcons détachés, auvents en vraie toile ; les pavés, les ciels de jour et de nuit, le feuillage peints aussi.
   Réservée à l'administrateur pendant sa construction ; on y va par le cercle violet de la cour d'honneur. L'ancien Montmartre (montmartre.js) n'est pas touché.
   Ce fichier est chargé par la matrice la première fois qu'on y va, et exécuté chez elle (eval direct) : il se sert de THREE, M, MOBILE… */
function construireMontmartre2(A, L, scene) {
  const PEU = MOBILE || GPU_MODESTE, DIR = "images/montmartre2/";
  const Ld = new THREE.TextureLoader(), tx = (n, srgb = true) => { const t = Ld.load(DIR + n + ".webp"); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = PEU ? 2 : 8; return t; };
  const mat = (o) => new THREE.MeshStandardMaterial({ roughness: .85, metalness: 0, ...o });
  const box = (w, h, d, m, x, y, z, par = scene) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = !PEU; o.receiveShadow = true; par.add(o); return o; };
  const NUIT = [], JOUR_NUIT = [];   // (NUIT : ce qui s'allume le soir — [matière, jour, nuit] ; JOUR_NUIT : des fonctions appelées au changement)
  // ---------- les dimensions : la place, fermée de maisons sur ses quatre côtés ----------
  const PX = 19, PZ = 14;   // (la place va de -PX à PX, de -PZ à PZ)
  const s = 6.4 / 535;      // (l'échelle des dessins : 535 pixels = 6,4 m)
  // ---------- le sol : les pavés peints, en miroir (pas de couture visible), et une bande de pierre claire au pied des maisons ----------
  const PAV = tx("paves"); PAV.wrapS = PAV.wrapT = THREE.MirroredRepeatWrapping; PAV.repeat.set(PX * 2 / 3.2, PZ * 2 / 3.2);
  { const sol = new THREE.Mesh(new THREE.PlaneGeometry(PX * 2 + 2, PZ * 2 + 2), mat({ map: PAV })); sol.rotation.x = -Math.PI / 2; sol.receiveShadow = true; scene.add(sol); L.sol = sol; }
  { const pierre = mat({ color: 0xd8ccb6, roughness: .95 }); for (const [w, d, x, z] of [[PX * 2, 1.4, 0, -PZ + .7], [PX * 2, 1.4, 0, PZ - .7], [1.4, PZ * 2, -PX + .7, 0], [1.4, PZ * 2, PX - .7, 0]]) box(w, .05, d, pierre, x, .025, z); }
  // ---------- les façades ----------
  /* (10.240) le trait d'encre : un liseré sombre autour des volumes (arbres, bancs, réverbères, chaises…), comme dans le dessin */
  const encreM = new THREE.ShaderMaterial({ side: THREE.BackSide, uniforms: { e: { value: .022 } }, vertexShader: "uniform float e; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.); vec3 n=normalize(normalMatrix*normal); mv.xyz+=n*(e*(1.+(-mv.z)/18.)); gl_Position=projectionMatrix*mv; }", fragmentShader: "void main(){ gl_FragColor=vec4(.2,.14,.11,1.); }" });
  const encre = (o) => { if (!PEU) o.add(new THREE.Mesh(o.geometry, encreM)); return o; };
  /* (10.240) chaque façade en relief, comme le café : le dessin percé, ses fenêtres creusées (embrasure, appui), ses portes en retrait, ses vitrines creuses et leur boutique derrière,
     les jardinières, balcons et lanternes détachés du mur, les petits auvents, les corniches en saillie, le toit et ses lucarnes en volume */
  const DEF = {"fac1": {"IW": 628, "IH": 1188, "mur": 16376767, "holes": [[130, 375, 200, 455, "fen"], [278, 375, 348, 460, "fen"], [428, 375, 498, 455, "fen"], [130, 615, 200, 700, "fen"], [278, 615, 348, 700, "fen"], [428, 615, 498, 700, "fen"], [140, 872, 248, 1052, "vit"], [380, 872, 492, 1052, "vit"], [270, 880, 355, 1115, "porte"]], "det": [[100, 448, 232, 512], [255, 438, 372, 516], [405, 448, 528, 512], [92, 688, 242, 762], [252, 678, 378, 752], [402, 688, 538, 762], [296, 552, 334, 622]], "awn": [[130, 908, 250, 946], [378, 908, 498, 946]], "corn": [[60, 568, 780, 12368815], [60, 568, 286, 9410712], [62, 566, 542, 14206121]], "luc": [200, 430], "lucY": 210, "toitY": 285, "chem": [500, 110]}, "fac3": {"IW": 536, "IH": 1078, "mur": 15717823, "holes": [[75, 292, 142, 405, "fen"], [235, 292, 302, 405, "fen"], [398, 292, 465, 405, "fen"], [75, 457, 142, 580, "fen"], [235, 457, 302, 580, "fen"], [398, 457, 465, 580, "fen"], [75, 632, 142, 760, "fen"], [235, 632, 302, 760, "fen"], [398, 632, 465, 760, "fen"], [78, 805, 140, 905, "fen"], [402, 805, 464, 905, "fen"], [198, 822, 338, 1062, "porte"]], "det": [[68, 358, 148, 410], [230, 358, 306, 410], [393, 358, 470, 410], [68, 532, 148, 585], [230, 532, 306, 585], [393, 532, 470, 585], [30, 712, 506, 772], [64, 868, 144, 906], [394, 868, 472, 906]], "awn": [], "corn": [[0, 536, 245, 10788242], [4, 532, 417, 15124914], [4, 532, 597, 12427403], [20, 516, 780, 13151640]], "luc": [105, 268, 428], "lucY": 190, "toitY": 245, "chem": [192, 110]}};
  const TXR = {}; const txF = (n, srgb = true) => TXR[n] || (TXR[n] = tx(n, srgb));
  const salle = (g, cx, by, w, h, P, genre) => { const D = 3.4, S = new THREE.Group(); S.position.set(cx, by, -P); g.add(S); const parquet = mat({ color: 0x8a5a34 }), mur2 = mat({ color: genre === "cafe" ? 0xe8b878 : 0xf0dcc0, emissive: 0x4a2a10, emissiveIntensity: .2 }), bois = mat({ color: 0x6a3a20 });
    box(w, .02, D, parquet, 0, 0, -D / 2, S); box(w, h + .5, .05, mur2, 0, h / 2, -D, S); box(.05, h + .5, D, mur2, -w / 2, h / 2, -D / 2, S); box(.05, h + .5, D, mur2, w / 2, h / 2, -D / 2, S); box(w, .05, D, mur2, 0, h + .25, -D / 2, S);
    for (let r = 0; r < 3; r++) { box(w * .9, .04, .3, bois, 0, .5 + r * .5, -D + .2, S); for (let k = 0; k < 5; k++) box(.14, .22, .14, mat({ color: [0xc84a3a, 0x3a6a8a, 0xe8b840, 0x6a8a3a, 0xb05a8a][(k + r) % 5] }), -w * .35 + k * w * .18, .63 + r * .5, -D + .2, S); }   // (les étagères, leurs boîtes de couleur)
    box(w * .6, .75, .5, bois, 0, .38, -1.4, S); for (let k = 0; k < 3; k++) box(.25, .18, .25, mat({ color: [0xe8d0a0, 0xd88a5a, 0xa8c8e0][k] }), -.3 + k * .3, .85, -1.4, S);   // (la table de présentation)
    const pl = new THREE.PointLight(0xffc080, 2, 5, 1.5); pl.position.set(0, h - .3, -1.5); S.add(pl); JOUR_NUIT.push((n) => { pl.intensity = n ? (PEU ? 5 : 8) : 2; }); };
  let nRel = 0;
  const relief = (F, g) => { const d = DEF[F], IW = d.IW, IH = d.IH, FW = IW * s, FH = IH * s, X = (px) => (px - IW / 2) * s, Y = (py) => (IH - py) * s, murC = mat({ color: d.mur, roughness: .9 }), embM = mat({ color: new THREE.Color(d.mur).multiplyScalar(.82), roughness: .95 }), appM = mat({ color: 0xe8dcc0 });
    const plan = (t, x0, y0, x1, y1, z, o = {}) => { const m = new THREE.Mesh(new THREE.PlaneGeometry((x1 - x0) * s, (y1 - y0) * s), mat({ map: t, transparent: true, alphaTest: .4, side: THREE.DoubleSide, ...o })); m.position.set(X((x0 + x1) / 2), Y((y0 + y1) / 2), z); m.receiveShadow = true; g.add(m); return m; };
    plan(txF(F + "_perce"), 0, 0, IW, IH, 0, { bumpMap: txF(F + "_relief", false), bumpScale: 2.2 });
    box(FW * .98, FH * .74, 6, murC, 0, FH * .37, -8.2, g); for (const sg of [-1, 1]) box(.05, Y(d.toitY), 5.2, murC, sg * FW * .49, Y(d.toitY) / 2, -2.6, g);
    d.holes.forEach(([x0, y0, x1, y1, k], i) => { const w = (x1 - x0) * s, h = (y1 - y0) * s, cx = X((x0 + x1) / 2), cy = Y((y0 + y1) / 2), P = k === "vit" ? .5 : k === "porte" ? .35 : .3, t = txF(F + "_h" + i);
      box(w, .03, P, embM, cx, cy + h / 2, -P / 2, g); box(w, .03, P, embM, cx, cy - h / 2, -P / 2, g); box(.03, h, P, embM, cx - w / 2, cy, -P / 2, g); box(.03, h, P, embM, cx + w / 2, cy, -P / 2, g);
      if (k === "vit") { salle(g, cx, cy - h / 2, w, h, P, "boutique"); const v = plan(t, x0, y0, x1, y1, -P + .01, { opacity: .35, transparent: true, alphaTest: 0, depthWrite: false, emissive: 0xffb060, emissiveMap: t, emissiveIntensity: .15 }); void v; box(w + .15, .2, .3, appM, cx, cy - h / 2 + .1, .08, g); }
      else { const f = plan(t, x0, y0, x1, y1, -P, k === "fen" ? { emissive: 0xffc070, emissiveMap: t, emissiveIntensity: 0 } : {}); if (k === "fen") { NUIT.push([f.material, 0, (i + nRel) % 3 ? .55 : 0]); box(w + .26, .07, .3, appM, cx, cy - h / 2 - .04, .1, g); } } });
    d.det.forEach(([x0, y0, x1, y1], i) => { const m = plan(txF(F + "_d" + i), x0, y0, x1, y1, .13); m.material.alphaTest = .3; m.castShadow = !PEU; });
    d.awn.forEach(([x0, y0, x1, y1], i) => { const t = txF(F + "_d" + (d.det.length + i)), w = (x1 - x0) * s, Lg = (y1 - y0) * s * 1.6, a = .55, m = new THREE.Mesh(new THREE.PlaneGeometry(w, Lg), mat({ map: t, transparent: true, alphaTest: .3, side: THREE.DoubleSide }));
      m.rotation.x = -Math.PI / 2 + a; m.position.set(X((x0 + x1) / 2), Y(y0) - Lg * Math.sin(a) / 2, Lg * Math.cos(a) / 2); m.castShadow = !PEU; g.add(m); });
    for (const [x0, x1, y, c] of d.corn) box((x1 - x0) * s + .1, .13, .26, mat({ color: c }), X((x0 + x1) / 2), Y(y), .13, g);
    { const toitM = mat({ color: 0x7088a8, roughness: .6 }), t = box(FW, 1.9, 2.4, toitM, 0, Y(d.toitY) + .7, -1.0, g); t.rotation.x = -.6;
      for (const lx of d.luc) { box(1.0, 1.3, 1.2, mat({ color: 0xe8dcc0 }), X(lx), Y(d.lucY), -.45, g); box(1.3, .2, 1.4, toitM, X(lx), Y(d.lucY) + .7, -.45, g); const vm = mat({ color: 0x3a4a6a, emissive: 0xffc070, emissiveIntensity: 0 }); box(.6, .75, .04, vm, X(lx), Y(d.lucY), .16, g); NUIT.push([vm, 0, (lx + nRel) % 2 ? .8 : 0]); }
      box(.6, 1.3, .5, mat({ color: 0xc09070 }), X(d.chem[0]), Y(d.chem[1]), -.8, g); }
    nRel++; return FW; };
  const facade = (type, g) => relief(type === "boutique" ? "fac1" : "fac3", g);
  // le café, en relief : la façade percée, les fenêtres creusées (embrasure, appui, garde-corps détaché), la vitrine creuse et sa salle, l'auvent, les corniches, l'enseigne
  const CAF = { perce: tx("fac2_perce"), vit: tx("fac2_vitrine"), auv: tx("fac2_auvent"), rel: tx("fac2_relief", false), fen: [0, 1, 2, 3, 4, 5].map(i => tx("fac2_fen" + i)), bal: [0, 1, 2, 3, 4, 5].map(i => tx("fac2_bal" + i)) };
  const IW = 535, IH = 1089, FW = IW * s, FH = IH * s, X = (px) => (px - IW / 2) * s, Y = (py) => (IH - py) * s;
  let nCafe = 0;
  const cafe = (g, nom) => { const plan = (t, x0, y0, x1, y1, z, o = {}) => { const m = new THREE.Mesh(new THREE.PlaneGeometry((x1 - x0) * s, (y1 - y0) * s), mat({ map: t, transparent: true, alphaTest: .4, side: THREE.DoubleSide, ...o })); m.position.set(X((x0 + x1) / 2), Y((y0 + y1) / 2), z); m.receiveShadow = true; g.add(m); return m; };
    plan(CAF.perce, 0, 0, IW, IH, 0, { bumpMap: CAF.rel, bumpScale: 2.2 });
    const murM = mat({ color: 0xd8b880 }), rougeM = mat({ color: 0x7a2a30, roughness: .8 }), embM = mat({ color: 0xc9a870, roughness: .95 }), appM = mat({ color: 0xe4d2a8 });
    box(FW * .98, FH * .74, 6, murM, 0, FH * .37, -8.2, g); box(FW, Y(250) - Y(700), .05, murM, 0, (Y(250) + Y(700)) / 2, -.5, g); box(FW * .98, FH * .14, 6, mat({ color: 0x7088a8, roughness: .6 }), 0, FH * .8, -8.4, g);
    [[85, 318, 150, 452], [238, 318, 302, 452], [390, 318, 455, 452], [85, 528, 150, 662], [238, 528, 302, 662], [390, 528, 455, 662]].forEach(([x0, y0, x1, y1], i) => { const w = (x1 - x0) * s, h = (y1 - y0) * s, cx = X((x0 + x1) / 2), cy = Y((y0 + y1) / 2), P = .32;
      box(w, .03, P, embM, cx, cy + h / 2, -P / 2, g); box(w, .03, P, embM, cx, cy - h / 2, -P / 2, g); box(.03, h, P, embM, cx - w / 2, cy, -P / 2, g); box(.03, h, P, embM, cx + w / 2, cy, -P / 2, g);
      const f = plan(CAF.fen[i], x0, y0, x1, y1, -P, { emissive: 0xffc070, emissiveMap: CAF.fen[i], emissiveIntensity: 0 }); NUIT.push([f.material, 0, (i + nCafe) % 3 ? .5 : 0]);   /* (le soir, certaines fenêtres s'allument) */
      box(w + .3, .07, .32, appM, cx, cy - h / 2 - .04, .1, g); const b = plan(CAF.bal[i], x0 - 7, y0 + 87, x1 + 3, y1, .14); b.material.alphaTest = .25; });
    // la vitrine creuse : la vitre en retrait, la salle derrière (parquet, murs chauds, comptoir, bouteilles, tables, lampes)
    { const x0 = 75, y0 = 812, x1 = 462, y1 = 1048, w = (x1 - x0) * s, h = (y1 - y0) * s, cx = X((x0 + x1) / 2), cy = Y((y0 + y1) / 2), P = .55, D = 4.2;
      box(w, .05, P, rougeM, cx, cy + h / 2, -P / 2, g); box(.05, h, P, rougeM, cx - w / 2, cy, -P / 2, g); box(.05, h, P, rougeM, cx + w / 2, cy, -P / 2, g);
      const S = new THREE.Group(); S.position.set(cx, cy - h / 2, -P); g.add(S);
      const parquet = mat({ color: 0x8a5a34 }), mur2 = mat({ color: 0xe8b878, emissive: 0x4a2a10, emissiveIntensity: .2 }), zinc = mat({ color: 0xa8a8a8, metalness: .6, roughness: .3 }), bois = mat({ color: 0x6a3a20 });
      box(w, .02, D, parquet, 0, 0, -D / 2, S); box(w, h + .6, .05, mur2, 0, h / 2, -D, S); box(.05, h + .6, D, mur2, -w / 2, h / 2, -D / 2, S); box(.05, h + .6, D, mur2, w / 2, h / 2, -D / 2, S); box(w, .05, D, mur2, 0, h + .3, -D / 2, S);
      box(2.2, 1.05, .6, bois, .8, .52, -3, S); box(2.3, .06, .7, zinc, .8, 1.07, -3, S); box(2, .04, .25, bois, .8, 1.45, -3.85, S);
      for (let k = 0; k < 6; k++) box(.1, .3, .1, mat({ color: [0x2a6a3a, 0x8a1a1a, 0xc8a040][k % 3], emissive: 0x332200, emissiveIntensity: .3 }), .2 + k * .25, 1.6, -3.8, S);
      for (const [tx2, tz] of [[-1.4, -1.2], [-.4, -2.2], [-1.6, -2.8]]) { const t = new THREE.Mesh(new THREE.CylinderGeometry(.3, .3, .03, 16), mat({ color: 0xe8e0d0 })); t.position.set(tx2, .74, tz); S.add(t); const p = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, .72, 6), bois); p.position.set(tx2, .37, tz); S.add(p); for (const sg of [-1, 1]) box(.34, .04, .34, bois, tx2 + sg * .45, .45, tz, S); }
      const lampM = new THREE.MeshBasicMaterial({ color: 0xffe0a0 }); for (const [lx, lz] of [[-1, -1.5], [.8, -2.6]]) { const l = new THREE.Mesh(new THREE.SphereGeometry(.12, 12, 8), lampM); l.position.set(lx, h - .1, lz); S.add(l); }
      const pl = new THREE.PointLight(0xffb860, 3, 6, 1.5); pl.position.set(-.3, h - .4, -2); S.add(pl); JOUR_NUIT.push((n) => { pl.intensity = n ? (PEU ? 7 : 10) : 3; });   /* (une seule lampe qui éclaire : léger pour les téléphones) */
      const v = plan(CAF.vit, x0, y0, x1, y1, -P + .01, { opacity: .3, transparent: true, alphaTest: 0, depthWrite: false }); v.material.emissive = new THREE.Color(0xffa850); v.material.emissiveMap = CAF.vit; v.material.emissiveIntensity = .2;
      box(w + .2, .25, .35, rougeM, cx, cy - h / 2 + .12, .1, g); }
    // l'auvent rayé : la toile inclinée au-dessus du trottoir, son lambrequin, ses bras de fer
    { const x0 = 55, x1 = 480, ww = (x1 - x0) * s, cx = X((x0 + x1) / 2), y = Y(768), Lg = 1.6, a = .5, toileM = mat({ map: CAF.auv, side: THREE.DoubleSide });
      const t = new THREE.Mesh(new THREE.PlaneGeometry(ww, Lg), toileM); t.rotation.x = -Math.PI / 2 + a; t.position.set(cx, y - Lg * Math.sin(a) / 2 + .05, Lg * Math.cos(a) / 2); t.castShadow = !PEU; g.add(t);
      const lb = new THREE.Mesh(new THREE.PlaneGeometry(ww, .22), toileM); lb.position.set(cx, y - Lg * Math.sin(a) - .06, Lg * Math.cos(a) + .01); g.add(lb);
      for (const sg of [-1, 1]) box(.03, .03, Lg * Math.cos(a), mat({ color: 0x2a2a2a }), cx + sg * ww / 2, y - Lg * Math.sin(a) / 2, Lg * Math.cos(a) / 2, g).rotation.x = a; }
    // les corniches en saillie, l'enseigne peinte au nom du café, le toit et ses lucarnes en volume
    box(FW + .1, .14, .28, mat({ color: 0x8a2a30 }), 0, Y(684), .14, g); box(FW + .15, .12, .3, mat({ color: 0xe8d4a8 }), 0, Y(255), .15, g); box(FW * .98, .08, .2, mat({ color: 0xe8d4a8 }), 0, Y(468), .1, g);
    { const c = document.createElement("canvas"); c.width = 512; c.height = 64; const x = c.getContext("2d"); x.fillStyle = "#f4ead6"; x.fillRect(0, 0, 512, 64); x.fillStyle = "#7a2a30"; x.font = "italic bold 38px Georgia"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(nom, 256, 34); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
      const ens = mat({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0 }), bord = mat({ color: 0xe8dcc0 }); const e = new THREE.Mesh(new THREE.BoxGeometry((452 - 80) * s, (748 - 706) * s, .06), [bord, bord, bord, bord, ens, bord]); e.position.set(X(266), Y(727), .06); g.add(e); NUIT.push([ens, 0, .35]); }
    { const toitM = mat({ color: 0x7088a8, roughness: .6 }); const t = box(FW, 1.9, 2.4, toitM, 0, Y(250) + .7, -1.0, g); t.rotation.x = -.6;
      for (const lx of [X(150), X(370)]) { box(1.0, 1.3, 1.2, mat({ color: 0xe8dcc0 }), lx, Y(190), -.45, g); box(1.3, .2, 1.4, toitM, lx, Y(140), -.45, g); const vm = mat({ color: 0x3a4a6a, emissive: 0xffc070, emissiveIntensity: 0 }); box(.6, .75, .04, vm, lx, Y(190), .16, g); NUIT.push([vm, 0, .8]); }
      box(.6, 1.2, .5, mat({ color: 0xc09070 }), X(105), Y(100), -.8, g); }
    nCafe++; return FW; };
  // ---------- les quatre côtés de la place : une suite de maisons, chacune tournée vers la place ----------
  const COTES = [{ ax: [-PX, -PZ], dir: [1, 0], ry: 0, long: PX * 2, suite: ["boutique", "cafe:Café du Tertre", "immeuble", "boutique", "immeuble", "cafe:La Bonne Franquette"] },
    { ax: [PX, PZ], dir: [-1, 0], ry: Math.PI, long: PX * 2, suite: ["immeuble", "boutique", "cafe:Le Consulat", "immeuble", "boutique", "immeuble"] },
    { ax: [-PX, PZ], dir: [0, -1], ry: Math.PI / 2, long: PZ * 2, suite: ["immeuble", "boutique", "cafe:Chez Eugène", "immeuble"] },
    { ax: [PX, -PZ], dir: [0, 1], ry: -Math.PI / 2, long: PZ * 2, suite: ["boutique", "immeuble", "cafe:Au Lapin Agile", "boutique"] }];
  const CAFES = [];
  for (const C of COTES) { let t = 0, i = 0; while (t < C.long - .2) { const type = C.suite[i % C.suite.length]; const g = new THREE.Group(); g.rotation.y = C.ry; scene.add(g);
      const w = type.startsWith("cafe") ? cafe(g, type.slice(5)) : facade(type, g); const u = Math.min(t + w / 2, C.long - w / 2 + .3);
      g.position.set(C.ax[0] + C.dir[0] * u, 0, C.ax[1] + C.dir[1] * u); if (type.startsWith("cafe")) CAFES.push({ x: g.position.x, z: g.position.z, ry: C.ry }); t += w; i++; } }
  // les angles de la place, fermés par un pan de mur
  for (const [x, z] of [[-PX, -PZ], [PX, -PZ], [-PX, PZ], [PX, PZ]]) box(3.5, 12.5, 3.5, mat({ color: 0xe8dcc0 }), x + Math.sign(x) * 1.4, 6.25, z + Math.sign(z) * 1.4);   /* (derrière l'angle des façades, sans déborder sur la place) */
  // ---------- les platanes, leur feuillage peint ----------
  const FEU = tx("feuillage"); FEU.wrapS = FEU.wrapT = THREE.MirroredRepeatWrapping; const feuM = mat({ map: FEU }), tronc = mat({ color: 0xb8ad94 }), OBS = [];
  let seed = 7; const al = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  /* (10.240) les platanes en volume : le tronc qui s'évase au pied, ses grosses branches, et des masses de feuillage bosselées (chacune sa forme), cernées d'encre */
  const touffe = (r) => { const g2 = new THREE.IcosahedronGeometry(r, 2), p = g2.attributes.position; for (let i = 0; i < p.count; i++) { const v = new THREE.Vector3().fromBufferAttribute(p, i), k = 1 + (Math.sin(v.x * 3.1 + v.y * 2.3) * .5 + Math.sin(v.z * 2.7 - v.y * 1.9) * .5) * .16 + (al() - .5) * .06; p.setXYZ(i, v.x * k, v.y * k * .82, v.z * k); } g2.computeVertexNormals(); return g2; };
  const grille = mat({ color: 0x2a2a2c, metalness: .4, roughness: .5 });
  for (const [x, z] of [[-9, -4.5], [9, -4.5], [-9, 4.5], [9, 4.5]]) { const tg = new THREE.CylinderGeometry(.17, .34, 7.2, 12); tg.translate(0, 3.6, 0); const t = encre(new THREE.Mesh(tg, tronc)); t.position.set(x, 0, z); t.castShadow = !PEU; scene.add(t);
    for (let b = 0; b < 3; b++) { const a = b * 2.1 + al(), bg = new THREE.CylinderGeometry(.07, .12, 2.6, 8); bg.translate(0, 1.3, 0); const br = encre(new THREE.Mesh(bg, tronc)); br.position.set(x, 5.6, z); br.rotation.set(Math.sin(a) * .7, 0, -Math.cos(a) * .7); scene.add(br); }
    for (let i = 0; i < (PEU ? 6 : 10); i++) { const a = al() * 6.28, r = .4 + al() * 1.8, b = encre(new THREE.Mesh(touffe(1.0 + al() * .8), feuM)); b.position.set(x + Math.cos(a) * r, 7.4 + al() * 2.6, z + Math.sin(a) * r); b.rotation.y = al() * 6; b.castShadow = !PEU; scene.add(b); }
    const gr = new THREE.Mesh(new THREE.RingGeometry(.4, .85, 24), grille); gr.rotation.x = -Math.PI / 2; gr.position.set(x, .03, z); scene.add(gr); OBS.push([x, z, .55]); }
  // ---------- les réverbères, les guirlandes d'ampoules d'un côté à l'autre, leurs halos le soir ----------
  const fer = mat({ color: 0x24262a }), verre = mat({ color: 0xfff0c0, emissive: 0xffe0a0, emissiveIntensity: .1 }); NUIT.push([verre, .1, 1.6]);
  const halo = (() => { const c = document.createElement("canvas"); c.width = c.height = 64; const x = c.getContext("2d"), g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, "rgba(255,240,190,1)"); g.addColorStop(.3, "rgba(255,210,120,.45)"); g.addColorStop(1, "rgba(255,180,90,0)"); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
  const NO = L.nuitObjets = L.nuitObjets || []; const haloEn = (x, y, z, sc) => { const h = new THREE.Sprite(new THREE.SpriteMaterial({ map: halo, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); h.position.set(x, y, z); h.scale.setScalar(sc); h.visible = false; scene.add(h); NO.push(h); };
  const LUM = []; for (const [x, z] of [[-14, -9], [14, -9], [-14, 9], [14, 9]]) { const add2 = (geo, m, y) => { const o = encre(new THREE.Mesh(geo, m)); o.position.set(x, y, z); o.castShadow = !PEU; scene.add(o); return o; };   /* (10.240 : le réverbère parisien en volume — socle mouluré, fût cannelé, bague, lanterne vitrée à six pans, chapeau, pomme) */
    add2(new THREE.CylinderGeometry(.22, .3, .5, 12), fer, .25); add2(new THREE.CylinderGeometry(.16, .2, .25, 12), fer, .62); add2(new THREE.CylinderGeometry(.06, .1, 3.4, 12), fer, 2.4); add2(new THREE.TorusGeometry(.1, .03, 6, 16), fer, 4.05).rotation.x = Math.PI / 2;
    add2(new THREE.CylinderGeometry(.1, .14, .12, 6), fer, 4.2); const v = add2(new THREE.CylinderGeometry(.24, .15, .55, 6), verre, 4.55); void v; for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2, m = new THREE.Mesh(new THREE.BoxGeometry(.025, .58, .025), fer); m.position.set(x + Math.cos(a) * .2, 4.55, z + Math.sin(a) * .2); scene.add(m); }
    add2(new THREE.ConeGeometry(.34, .32, 6), fer, 4.98); add2(new THREE.SphereGeometry(.07, 8, 6), fer, 5.2);
    haloEn(x, 4.55, z, 2.6); OBS.push([x, z, .3]); const l = new THREE.PointLight(0xffc880, 0, 16, 1.5); l.position.set(x, 4.2, z); scene.add(l); LUM.push(l); }
  JOUR_NUIT.push((n) => { for (const l of LUM) l.intensity = n ? (PEU ? 22 : 30) : 0; });
  { const ampM = new THREE.MeshBasicMaterial({ color: 0xfff2c8 }), filM = new THREE.LineBasicMaterial({ color: 0x2a2420 });
    const guirlande = (a, b) => { const pts = [], n = 18; for (let i = 0; i <= n; i++) { const u = i / n, p = new THREE.Vector3().lerpVectors(a, b, u); p.y -= Math.sin(u * Math.PI) * 1.2; pts.push(p); if (i % 2 && i < n) { const m = new THREE.Mesh(new THREE.SphereGeometry(.07, 8, 6), ampM); m.position.copy(p); m.position.y -= .1; scene.add(m); haloEn(p.x, p.y - .1, p.z, .9); } } scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), filM)); };
    const V = (x, y, z) => new THREE.Vector3(x, y, z); for (let x = -15; x <= 15; x += 6) guirlande(V(x, 6.4, -PZ + .2), V(x + 3, 6.4, PZ - .2)); guirlande(V(-PX + .2, 6.6, -7), V(PX - .2, 6.6, 7)); guirlande(V(-PX + .2, 6.6, 7), V(PX - .2, 6.6, -7)); }
  // ---------- les terrasses devant les cafés, les bancs de la place ----------
  const nappe = mat({ color: 0xe8e0d0 }), chaiseM = mat({ color: 0xb84030 }), vertB = mat({ color: 0x3a6a48 });
  for (const C of CAFES) { const nx = Math.sin(C.ry), nz = Math.cos(C.ry), tx2 = Math.cos(C.ry), tz2 = -Math.sin(C.ry);
    for (const k of [-1.6, 0, 1.6]) { const x = C.x + nx * 2.6 + tx2 * k, z = C.z + nz * 2.6 + tz2 * k; const t = new THREE.Mesh(new THREE.CylinderGeometry(.35, .35, .03, 16), nappe); t.position.set(x, .74, z); t.castShadow = !PEU; scene.add(t); const p = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, .72, 6), fer); p.position.set(x, .37, z); scene.add(p);
      for (const sg of [-1, 1]) { const cg = new THREE.Group(); cg.position.set(x + tx2 * sg * .55, 0, z + tz2 * sg * .55); cg.rotation.y = C.ry + (sg > 0 ? -Math.PI / 2 : Math.PI / 2); scene.add(cg);   /* (10.240 : la chaise de bistrot — siège tressé, dossier courbé, pieds de bambou) */
        const ad = (geo, m, px, py, pz) => { const o = encre(new THREE.Mesh(geo, m)); o.position.set(px, py, pz); cg.add(o); return o; }; ad(new THREE.BoxGeometry(.4, .05, .4), chaiseM, 0, .46, 0); ad(new THREE.BoxGeometry(.4, .3, .04), chaiseM, 0, .72, -.19).rotation.x = -.12;
        for (const [a2, b2] of [[-.17, -.17], [.17, -.17], [-.17, .17], [.17, .17]]) ad(new THREE.CylinderGeometry(.018, .018, .46, 6), mat({ color: 0xb08a50 }), a2, .23, b2); } encre(t); OBS.push([x, z, .75]); } }
  /* (10.240) le banc de Paris en volume : les flancs de fonte courbés (pied avant, pied arrière, accoudoir), les lattes de bois du siège et du dossier, en arc */
  const flanc = (() => { const c = new THREE.CatmullRomCurve3([[.28, 0, 0], [.22, .44, 0], [.05, .46, 0], [-.22, .46, 0], [-.3, .8, 0], [-.34, .95, 0]].map(([a, b2, c2]) => new THREE.Vector3(c2, b2, a))); return new THREE.TubeGeometry(c, 20, .035, 6); })();
  const flanc2 = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, -.25), new THREE.Vector3(0, .3, -.2), new THREE.Vector3(0, .46, -.05)]), 10, .03, 6), acc = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, .62, .22), new THREE.Vector3(0, .7, .05), new THREE.Vector3(0, .62, -.2)]), 10, .025, 6);
  for (const [x, z, ry] of [[0, -6, 0], [0, 6, Math.PI]]) { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g); const ad = (geo, m, px, py, pz, rx = 0) => { const o = encre(new THREE.Mesh(geo, m)); o.position.set(px, py, pz); o.rotation.x = rx; o.castShadow = !PEU; g.add(o); return o; };
    for (const sx of [-.85, .85]) { ad(flanc, fer, sx, 0, 0); ad(flanc2, fer, sx, 0, 0); ad(acc, fer, sx, 0, 0); }
    for (let l = 0; l < 4; l++) ad(new THREE.BoxGeometry(1.9, .045, .1), vertB, 0, .47 - l * .004, .2 - l * .12); for (let l = 0; l < 3; l++) ad(new THREE.BoxGeometry(1.9, .09, .035), vertB, 0, .6 + l * .13, -.27 - l * .025, -.25);
    OBS.push([x, z, 1.1]); }
  // ---------- les ciels peints : jour et nuit, sur un grand cylindre autour de la place ----------
  const ciel = (n, rep, haut) => { const t = tx(n); t.wrapS = THREE.MirroredRepeatWrapping; t.repeat.set(rep, 1); const g = new THREE.Group(); const m = new THREE.Mesh(new THREE.CylinderGeometry(160, 160, 120, 48, 1, true), new THREE.MeshBasicMaterial({ map: t, side: THREE.BackSide, fog: false })); g.add(m);
    const c = new THREE.Mesh(new THREE.CircleGeometry(160, 48), new THREE.MeshBasicMaterial({ color: haut, side: THREE.DoubleSide, fog: false })); c.rotation.x = Math.PI / 2; c.position.y = 59.9; g.add(c); g.position.y = 42; scene.add(g); return g; };
  const CJ = ciel("ciel_jour", 3, 0x4f7fc6), CN = ciel("ciel_nuit", 5, 0x0e3a56); CN.visible = false;
  L.sansLune = true;
  L.vueCour = (n) => { CJ.visible = !n; CN.visible = n; scene.background = new THREE.Color(n ? 0x0e3a56 : 0x9cc0e6); if (scene.fog) { scene.fog.color.setHex(n ? 0x1c3a56 : 0xe8e4dc); scene.fog.near = 60; scene.fog.far = 200; }
    for (const o of scene.children) if (o.isMesh && o.renderOrder === -1 && o.geometry && o.geometry.type === "SphereGeometry") o.visible = false;   /* (le dôme de nuages de la matrice : nos ciels peints le remplacent) */
    for (const [m, j, nn] of NUIT) m.emissiveIntensity = n ? nn : j; for (const f of JOUR_NUIT) f(n); };
  // ---------- le retour : un cercle violet vers la cour d'honneur ----------
  L.portails.push({ dans: (x, z) => Math.hypot(x - 0, z - 10.5) < .6, seuil: [0, 10.5], vers: "grande", arrivee: [6, 6.6], yaw: Math.PI, violet: true, pasApo: true });
  // ---------- les limites : la place, sans les arbres, les réverbères, les tables, les bancs ----------
  L.limites = (x, z) => { if (Math.abs(x) > PX - 1.6 || Math.abs(z) > PZ - 1.6) return false; for (const [ox, oz, r] of OBS) if ((x - ox) ** 2 + (z - oz) ** 2 < r * r) return false; return true; };
  L.hauteur = () => 0; L.depart = [0, 8]; L.taille = 1.8; L.suivi = { d: 6.5, h: 3.6, av: 3, vy: 2 }; L.fov = [58, 72];
  L.zone = [-PX, PX, -PZ, PZ]; L.cam = { pos: [0, 6, 12], vise: [0, 4, -10] }; L.sansMusique = true;
}
({ construireMontmartre2 })
