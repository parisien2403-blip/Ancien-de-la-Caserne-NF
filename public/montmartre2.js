/* Montmartre, le nouveau (10.241) : tout le Montmartre de l'ancien plan, raccourci, bâti avec des dessins peints à la main (style animation japonaise) mis en relief :
   le métro Abbesses, la rue Norvins, la place du Tertre et le carré des peintres, la rue Saint-Éleuthère, la place du bas, les grands escaliers, la pelouse fleurie et le funiculaire,
   la terrasse et sa balustrade face à tout Paris, le Sacré-Cœur, la rue qui en fait le tour et la place de derrière. Sans passants. Les façades ont leur trottoir.
   Réservé à l'administrateur pendant sa construction ; on y va par le cercle violet de la cour d'honneur. L'ancien Montmartre (montmartre.js) n'est pas touché.
   Ce fichier est chargé par la matrice la première fois qu'on y va, et exécuté chez elle (eval direct) : il se sert de THREE, M, MOBILE… */
function construireMontmartre2(A, L, scene) {
  const PEU = MOBILE || GPU_MODESTE, DIR = "images/montmartre2/";
  const Ld = new THREE.TextureLoader(), tx = (n, srgb = true) => { const t = Ld.load(DIR + n + ".webp"); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = PEU ? 2 : 8; return t; };
  const mat = (o) => new THREE.MeshStandardMaterial({ roughness: .85, metalness: 0, ...o });
  const box = (w, h, d, m, x, y, z, par = scene) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = !PEU; o.receiveShadow = true; par.add(o); return o; };
  const NUIT = [], JOUR_NUIT = [];   // (NUIT : ce qui s'allume le soir — [matière, jour, nuit] ; JOUR_NUIT : des fonctions appelées au changement)
  const s = 6.4 / 535;      // (l'échelle des dessins : 535 pixels = 6,4 m)
  const n0 = scene.children.length;
  // ---------- les façades ----------
  /* (10.240) le trait d'encre : un liseré sombre autour des volumes (arbres, bancs, réverbères, chaises…), comme dans le dessin */
  const encreM = new THREE.ShaderMaterial({ side: THREE.BackSide, uniforms: { e: { value: .022 } }, vertexShader: "uniform float e; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.); vec3 n=normalize(normalMatrix*normal); mv.xyz+=n*(e*(1.+(-mv.z)/18.)); gl_Position=projectionMatrix*mv; }", fragmentShader: "void main(){ gl_FragColor=vec4(.2,.14,.11,1.); }" });
  const encre = (o) => { if (!PEU) o.add(new THREE.Mesh(o.geometry, encreM)); return o; };
  /* (10.240) chaque façade en relief, comme le café : le dessin percé, ses fenêtres creusées (embrasure, appui), ses portes en retrait, ses vitrines creuses et leur boutique derrière,
     les jardinières, balcons et lanternes détachés du mur, les petits auvents, les corniches en saillie, le toit et ses lucarnes en volume */
  const DEF = {"fac1": {"IW": 628, "IH": 1188, "mur": 16376767, "holes": [[130, 375, 200, 455, "fen"], [278, 375, 348, 460, "fen"], [428, 375, 498, 455, "fen"], [130, 615, 200, 700, "fen"], [278, 615, 348, 700, "fen"], [428, 615, 498, 700, "fen"], [140, 872, 248, 1052, "vit"], [380, 872, 492, 1052, "vit"], [270, 880, 355, 1115, "porte"]], "det": [[100, 448, 232, 512], [255, 438, 372, 516], [405, 448, 528, 512], [92, 688, 242, 762], [252, 678, 378, 752], [402, 688, 538, 762], [296, 552, 334, 622]], "awn": [[130, 908, 250, 946], [378, 908, 498, 946]], "corn": [[60, 568, 780, 12368815], [60, 568, 286, 9410712], [62, 566, 542, 14206121]], "luc": [200, 430], "lucY": 210, "toitY": 285, "chem": [500, 110]}, "fac3": {"IW": 536, "IH": 1078, "mur": 15717823, "holes": [[75, 292, 142, 405, "fen"], [235, 292, 302, 405, "fen"], [398, 292, 465, 405, "fen"], [75, 457, 142, 580, "fen"], [235, 457, 302, 580, "fen"], [398, 457, 465, 580, "fen"], [75, 632, 142, 760, "fen"], [235, 632, 302, 760, "fen"], [398, 632, 465, 760, "fen"], [78, 805, 140, 905, "fen"], [402, 805, 464, 905, "fen"], [198, 822, 338, 1062, "porte"]], "det": [[68, 358, 148, 410], [230, 358, 306, 410], [393, 358, 470, 410], [68, 532, 148, 585], [230, 532, 306, 585], [393, 532, 470, 585], [30, 712, 506, 772], [64, 868, 144, 906], [394, 868, 472, 906]], "awn": [], "corn": [[0, 536, 245, 10788242], [4, 532, 417, 15124914], [4, 532, 597, 12427403], [20, 516, 780, 13151640]], "luc": [105, 268, 428], "lucY": 190, "toitY": 245, "chem": [192, 110]}, "fac4": {"IW": 606, "IH": 672, "mur": 16049350, "holes": [[112, 215, 193, 292, "fen"], [272, 215, 338, 292, "fen"], [428, 215, 492, 292, "fen"], [82, 457, 228, 608, "vit"], [377, 457, 525, 608, "vit"], [272, 480, 335, 660, "porte"]], "det": [[75, 262, 215, 346], [250, 262, 375, 346], [395, 262, 530, 346]], "awn": [[5, 410, 600, 455]], "corn": [[20, 590, 165, 9277321], [30, 580, 353, 7032632]], "luc": [168, 438], "lucY": 120, "toitY": 165, "chem": [490, 40]}};
  /* (10.241) les matières qui s'allument le soir, partagées (une allumée, une éteinte, par dessin) : tout Montmartre se regroupe en peu d'appels de dessin */
  const MN = {}, matN = (cle, o, j, n) => { if (!MN[cle]) { MN[cle] = mat(o); NUIT.push([MN[cle], j, n]); } return MN[cle]; };
  const MITOYEN = mat({ color: 0xe4d8c4, roughness: 1 }), MITOYEN2 = mat({ color: 0xe4d8c4, roughness: 1, side: THREE.DoubleSide });
  /* (10.242) les toits en volume, peints : le brisis (zinc, zinc patiné, cuivre vert-de-gris ou tuiles) incliné en vrai, ses lucarnes en saillie avec leur fenêtre et leur petit toit,
     la cheminée de pierre et ses mitrons, le dessus du toit ; çà et là, un garde-corps de fer forgé ou un jardin sur le toit. Le toit peint du dessin est effacé : celui-ci le remplace */
  const TOITS = [["toit_zinc", 1.6, 0x8a9aa8], ["toit_zinc2", 3.4, 0x9aa4ac], ["toit_cuivre", 4.6, 0x5a8a74], ["toit_zinc", 1.6, 0x8a9aa8], ["toit_tuiles", 3.2, 0xb8644a], ["toit_zinc2", 3.4, 0x9aa4ac]];
  let nToit = 0;
  const toit = (g, FW, Yt, lucs, chemX) => { const st = TOITS[nToit % TOITS.length], k = nToit++, HT = 2.8, PR = 2.4, lg = Math.hypot(HT, PR), a = Math.atan2(PR, HT);
    const tex = txF(st[0]); tex.wrapS = THREE.MirroredRepeatWrapping; const tM = matN("toit" + st[0], { map: tex, roughness: .55, side: THREE.DoubleSide }, 0, 0), dessus = matN("dessus" + st[2], { color: st[2], roughness: .7 }, 0, 0);
    const geo = new THREE.PlaneGeometry(FW + .1, lg), uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * Math.max(1, Math.round(FW / st[1])));
    const sl = new THREE.Mesh(geo, tM); sl.rotation.x = -a; sl.position.set(0, Yt + HT / 2, .12 - PR / 2); sl.castShadow = !PEU; g.add(sl);
    box(FW + .1, .25, 3.6, dessus, 0, Yt + HT - .1, -PR - 1.6, g); box(FW + .2, .14, .32, matN("bord", { color: 0xe8dcc6 }, 0, 0), 0, Yt + .02, .1, g);
    { const sh = new THREE.Shape([new THREE.Vector2(.12, 0), new THREE.Vector2(.12 - PR, HT), new THREE.Vector2(-5.8, HT), new THREE.Vector2(-5.8, 0)]), sg = new THREE.ShapeGeometry(sh);
      for (const sx of [-1, 1]) { const m = new THREE.Mesh(sg, MITOYEN2); m.rotation.y = -Math.PI / 2; m.position.set(sx * (FW / 2 + .04), Yt, 0); g.add(m); } }
    const zf = (y) => .12 - (y - Yt) / HT * PR;   // (le brisis, à la hauteur y)
    lucs.forEach((lx, i) => { const yb = Yt + .5, w = .95, hh = 1.25, zf0 = zf(yb) + .25, allu = (k + i) % 3 ? 1 : 0;
      box(w + .16, hh, 1.6, matN("lucM", { color: 0xece2cc }, 0, 0), lx, yb + hh / 2, zf0 - .8, g);
      const f = new THREE.Mesh(new THREE.PlaneGeometry(w * .8, hh * .82), matN("lucF" + allu, { map: txF("luc_zinc"), emissive: 0xffc070, emissiveMap: txF("luc_zinc"), emissiveIntensity: 0 }, 0, allu * .7)); f.position.set(lx, yb + hh * .48, zf0 + .01); g.add(f);
      for (const sx of [-1, 1]) { const r = box(.75, .06, 1.8, tM, lx + sx * .3, yb + hh + .2, zf0 - .8, g); r.rotation.z = -sx * .6; }
      box(w + .2, .07, .2, matN("bord", { color: 0xe8dcc6 }, 0, 0), lx, yb - .03, zf0 + .05, g); });
    if (chemX != null) { const cz = -PR - 1, cy = Yt + HT; box(.9, 1.3, .55, matN("chem", { map: txF("chem_pierre") }, 0, 0), chemX, cy + .55, cz, g); box(1, .1, .65, matN("chemB", { color: 0xd8ccb8 }, 0, 0), chemX, cy + 1.25, cz, g);
      for (let i = 0; i < 3; i++) { const p = new THREE.Mesh(new THREE.CylinderGeometry(.07, .09, .35 + (i % 2) * .15, 8), matN("mitron" + (i % 2), { color: i % 2 ? 0x8a8f96 : 0xb06a48 }, 0, 0)); p.position.set(chemX - .28 + i * .28, cy + 1.45 + (i % 2) * .07, cz); g.add(p); } }
    if (k % 4 === 2) { const t2 = txF("garde_corps"); const m = new THREE.Mesh(new THREE.PlaneGeometry(FW * .9, .75), matN("gc", { map: t2, transparent: true, alphaTest: .4, side: THREE.DoubleSide }, 0, 0)); m.position.set(0, Yt + HT + .45, -PR + .05); g.add(m); }
    if (k % 5 === 3) for (const r of [0, Math.PI / 2]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.2), matN("jt", { map: txF("jardin_toit"), transparent: true, alphaTest: .4, side: THREE.DoubleSide }, 0, 0)); m.position.set(FW * .25, Yt + HT + .6, -PR - 1.2); m.rotation.y = r + .4; g.add(m); } };
  const TXR = {}; const txF = (n, srgb = true) => TXR[n] || (TXR[n] = tx(n, srgb));
  const salle = (g, cx, by, w, h, P, genre) => { const D = 3.4, S = new THREE.Group(); S.position.set(cx, by, -P); g.add(S); const parquet = mat({ color: 0x8a5a34 }), mur2 = matN("salle" + genre, { color: genre === "cafe" ? 0xe8b878 : 0xf0dcc0, emissive: 0x4a2a10, emissiveIntensity: .2 }, .2, .9), bois = mat({ color: 0x6a3a20 });
    box(w, .02, D, parquet, 0, 0, -D / 2, S); box(w, h + .5, .05, mur2, 0, h / 2, -D, S); box(.05, h + .5, D, mur2, -w / 2, h / 2, -D / 2, S); box(.05, h + .5, D, mur2, w / 2, h / 2, -D / 2, S); box(w, .05, D, mur2, 0, h + .25, -D / 2, S);
    if (genre === "cafe") { const zinc = matN("zinc", { color: 0xa8a8a8, metalness: .6, roughness: .3 }, 0, 0), lampM = matN("lampe", { color: 0xffe0a0, emissive: 0xffd080, emissiveIntensity: .5 }, .5, 1.2);
      box(w * .7, 1.05, .55, bois, w * .1, .52, -D + .6, S); box(w * .72, .06, .65, zinc, w * .1, 1.07, -D + .6, S); for (let k = 0; k < 5; k++) box(.09, .3, .09, mat({ color: [0x2a6a3a, 0x8a1a1a, 0xc8a040][k % 3] }), -w * .2 + k * w * .12, 1.25, -D + .15, S);
      for (const [a, b] of [[-w * .25, -1.1], [w * .25, -1.6]]) { const t = new THREE.Mesh(new THREE.CylinderGeometry(.28, .28, .03, 14), matN("nappe", { color: 0xe8e0d0 }, 0, 0)); t.position.set(a, .74, b); S.add(t); box(.04, .72, .04, bois, a, .36, b, S); for (const sg of [-1, 1]) box(.32, .04, .32, bois, a + sg * .42, .45, b, S); }
      for (const a of [-w * .25, w * .25]) { const l = new THREE.Mesh(new THREE.SphereGeometry(.13, 10, 8), lampM); l.position.set(a, h - .15, -1.4); S.add(l); } return; }
    for (let r = 0; r < 3; r++) { box(w * .9, .04, .3, bois, 0, .5 + r * .5, -D + .2, S); for (let k = 0; k < 5; k++) box(.14, .22, .14, mat({ color: [0xc84a3a, 0x3a6a8a, 0xe8b840, 0x6a8a3a, 0xb05a8a][(k + r) % 5] }), -w * .35 + k * w * .18, .63 + r * .5, -D + .2, S); }   // (les étagères, leurs boîtes de couleur)
    box(w * .6, .75, .5, bois, 0, .38, -1.4, S); for (let k = 0; k < 3; k++) box(.25, .18, .25, mat({ color: [0xe8d0a0, 0xd88a5a, 0xa8c8e0][k] }), -.3 + k * .3, .85, -1.4, S);   // (la table de présentation)
  };   /* (10.241 : plus de lampe par boutique — trop de lumières pour tout Montmartre ; le soir, la salle luit) */
  let nRel = 0;
  /* (10.241) des variantes de couleur pour ne pas voir deux fois la même maison : le mur (et la devanture) repeints, le reste du dessin intact */
  const VAR = { fac1: [null, 0xf4ccc4, 0xd6e4bc, 0xc8daec], fac3: [null, 0xf0e0b0, 0xd0d6e0, 0xcee6d4], fac2: [[null, 0x7a2a30], [0xeee2c8, 0x2a5c3e], [0xecc8c4, 0x283862], [0xd6d6d2, 0x262428]] };
  const BASE = { fac1: 1118 };   /* (la boutique : Gemini avait peint un bout de trottoir sous la façade — coupé, et la façade descendue jusqu'au sol) */
  const relief = (F, g0, v = 0) => { const g = new THREE.Group(); g0.add(g); if (BASE[F]) g.position.y = -(DEF[F].IH - BASE[F]) * s; const d = DEF[F], IW = d.IW, IH = d.IH, FW = IW * s, FH = IH * s, X = (px) => (px - IW / 2) * s, Y = (py) => (IH - py) * s, murC = mat({ color: v ? VAR[F][v] : d.mur, roughness: .9 }), embM = mat({ color: new THREE.Color(d.mur).multiplyScalar(.82), roughness: .95 }), appM = mat({ color: 0xe8dcc0 });
    const plan = (t, x0, y0, x1, y1, z, o = {}) => { const m = new THREE.Mesh(new THREE.PlaneGeometry((x1 - x0) * s, (y1 - y0) * s), mat({ map: t, transparent: true, alphaTest: .4, side: THREE.DoubleSide, ...o })); m.position.set(X((x0 + x1) / 2), Y((y0 + y1) / 2), z); m.receiveShadow = true; g.add(m); return m; };
    plan(txF(F + "_perce" + (v ? "_v" + v : "")), 0, 0, IW, IH, 0, { bumpMap: txF(F + "_relief", false), bumpScale: 2.2 });
    box(FW * .98, FH * .74, 3, murC, 0, FH * .37, -5.7, g); for (const sg of [-1, 1]) box(.05, Y(d.toitY), 4.2, MITOYEN, sg * FW * .49, Y(d.toitY) / 2, -2.1, g);   /* (10.242 : les volumes moins profonds — ils ne traversent plus la boutique du coin ; les murs mitoyens couleur d'enduit) */
    d.holes.forEach(([x0, y0, x1, y1, k], i) => { const w = (x1 - x0) * s, h = (y1 - y0) * s, cx = X((x0 + x1) / 2), cy = Y((y0 + y1) / 2), P = k === "vit" ? .5 : k === "porte" ? .35 : .3, t = txF(F + "_h" + i);
      box(w, .03, P, embM, cx, cy + h / 2, -P / 2, g); box(w, .03, P, embM, cx, cy - h / 2, -P / 2, g); box(.03, h, P, embM, cx - w / 2, cy, -P / 2, g); box(.03, h, P, embM, cx + w / 2, cy, -P / 2, g);
      if (k === "vit") { salle(g, cx, cy - h / 2, w, h, P, F === "fac4" ? "cafe" : "boutique"); const v = plan(t, x0, y0, x1, y1, -P + .01, { opacity: .35, transparent: true, alphaTest: 0, depthWrite: false, emissive: 0xffb060, emissiveMap: t, emissiveIntensity: .15 }); void v; box(w + .15, .2, .3, appM, cx, cy - h / 2 + .1, .08, g); }
      else if (k !== "fen") plan(t, x0, y0, x1, y1, -P); else { const allu = (i + nRel) % 3 ? 1 : 0, f = plan(t, x0, y0, x1, y1, -P); f.material.dispose(); f.material = matN(F + i + "_" + allu, { map: t, transparent: true, alphaTest: .4, side: THREE.DoubleSide, emissive: 0xffc070, emissiveMap: t, emissiveIntensity: 0 }, 0, allu * .55); { box(w + .26, .07, .3, appM, cx, cy - h / 2 - .04, .1, g); } } });
    d.det.forEach(([x0, y0, x1, y1], i) => { const m = plan(txF(F + "_d" + i), x0, y0, x1, y1, .13); m.material.alphaTest = .3; m.castShadow = !PEU; });
    d.awn.forEach(([x0, y0, x1, y1], i) => { const t = txF(F + "_d" + (d.det.length + i)), w = (x1 - x0) * s, Lg = (y1 - y0) * s * 1.6, a = .55, m = new THREE.Mesh(new THREE.PlaneGeometry(w, Lg), mat({ map: t, transparent: true, alphaTest: .3, side: THREE.DoubleSide }));
      m.rotation.x = -Math.PI / 2 + a; m.position.set(X((x0 + x1) / 2), Y(y0) - Lg * Math.sin(a) / 2, Lg * Math.cos(a) / 2); m.castShadow = !PEU; g.add(m); });
    for (const [x0, x1, y, c] of d.corn) box((x1 - x0) * s + .1, .13, .26, mat({ color: c }), X((x0 + x1) / 2), Y(y), .13, g);
    toit(g, FW, Y(d.toitY), d.luc.map(X), X(d.chem[0]));
    nRel++; return FW; };
  const facade = (type, g, v) => relief(type === "boutique" ? "fac1" : "fac3", g, v);
  // le café, en relief : la façade percée, les fenêtres creusées (embrasure, appui, garde-corps détaché), la vitrine creuse et sa salle, l'auvent, les corniches, l'enseigne
  const CAF = { perce: tx("fac2_perce"), vit: tx("fac2_vitrine"), auv: tx("fac2_auvent"), rel: tx("fac2_relief", false), fen: [0, 1, 2, 3, 4, 5].map(i => tx("fac2_fen" + i)), bal: [0, 1, 2, 3, 4, 5].map(i => tx("fac2_bal" + i)) };
  const IW = 535, IH = 1089, FW = IW * s, FH = IH * s, X = (px) => (px - IW / 2) * s, Y = (py) => (IH - py) * s;
  let nCafe = 0;
  const cafe = (g, nom, v = 0) => { const plan = (t, x0, y0, x1, y1, z, o = {}) => { const m = new THREE.Mesh(new THREE.PlaneGeometry((x1 - x0) * s, (y1 - y0) * s), mat({ map: t, transparent: true, alphaTest: .4, side: THREE.DoubleSide, ...o })); m.position.set(X((x0 + x1) / 2), Y((y0 + y1) / 2), z); m.receiveShadow = true; g.add(m); return m; };
    plan(v ? txF("fac2_perce_v" + v) : CAF.perce, 0, 0, IW, IH, 0, { bumpMap: CAF.rel, bumpScale: 2.2 });
    const murM = mat({ color: VAR.fac2[v][0] || 0xd8b880 }), rougeM = mat({ color: VAR.fac2[v][1], roughness: .8 }), embM = mat({ color: 0xc9a870, roughness: .95 }), appM = mat({ color: 0xe4d2a8 });
    box(FW * .98, FH * .74, 3, murM, 0, FH * .37, -5.7, g); for (const sg of [-1, 1]) box(.05, Y(250), 4.2, MITOYEN, sg * FW * .49, Y(250) / 2, -2.1, g); box(FW, Y(250) - Y(700), .05, murM, 0, (Y(250) + Y(700)) / 2, -.5, g); box(FW * .98, FH * .14, 3, mat({ color: 0x7088a8, roughness: .6 }), 0, FH * .8, -5.7, g);
    [[85, 318, 150, 452], [238, 318, 302, 452], [390, 318, 455, 452], [85, 528, 150, 662], [238, 528, 302, 662], [390, 528, 455, 662]].forEach(([x0, y0, x1, y1], i) => { const w = (x1 - x0) * s, h = (y1 - y0) * s, cx = X((x0 + x1) / 2), cy = Y((y0 + y1) / 2), P = .32;
      box(w, .03, P, embM, cx, cy + h / 2, -P / 2, g); box(w, .03, P, embM, cx, cy - h / 2, -P / 2, g); box(.03, h, P, embM, cx - w / 2, cy, -P / 2, g); box(.03, h, P, embM, cx + w / 2, cy, -P / 2, g);
      const allu = (i + nCafe) % 3 ? 1 : 0, f = plan(CAF.fen[i], x0, y0, x1, y1, -P); f.material.dispose(); f.material = matN("caf" + i + "_" + allu, { map: CAF.fen[i], transparent: true, alphaTest: .4, side: THREE.DoubleSide, emissive: 0xffc070, emissiveMap: CAF.fen[i], emissiveIntensity: 0 }, 0, allu * .5);   /* (le soir, certaines fenêtres s'allument) */
      box(w + .3, .07, .32, appM, cx, cy - h / 2 - .04, .1, g); const b = plan(CAF.bal[i], x0 - 7, y0 + 87, x1 + 3, y1, .14); b.material.alphaTest = .25; });
    // la vitrine creuse : la vitre en retrait, la salle derrière (parquet, murs chauds, comptoir, bouteilles, tables, lampes)
    { const x0 = 75, y0 = 812, x1 = 462, y1 = 1048, w = (x1 - x0) * s, h = (y1 - y0) * s, cx = X((x0 + x1) / 2), cy = Y((y0 + y1) / 2), P = .55, D = 4.2;
      box(w, .05, P, rougeM, cx, cy + h / 2, -P / 2, g); box(.05, h, P, rougeM, cx - w / 2, cy, -P / 2, g); box(.05, h, P, rougeM, cx + w / 2, cy, -P / 2, g);
      const S = new THREE.Group(); S.position.set(cx, cy - h / 2, -P); g.add(S);
      const parquet = mat({ color: 0x8a5a34 }), mur2 = matN("salleCafe", { color: 0xe8b878, emissive: 0x4a2a10, emissiveIntensity: .2 }, .2, 1), zinc = mat({ color: 0xa8a8a8, metalness: .6, roughness: .3 }), bois = mat({ color: 0x6a3a20 });
      box(w, .02, D, parquet, 0, 0, -D / 2, S); box(w, h + .6, .05, mur2, 0, h / 2, -D, S); box(.05, h + .6, D, mur2, -w / 2, h / 2, -D / 2, S); box(.05, h + .6, D, mur2, w / 2, h / 2, -D / 2, S); box(w, .05, D, mur2, 0, h + .3, -D / 2, S);
      box(2.2, 1.05, .6, bois, .8, .52, -3, S); box(2.3, .06, .7, zinc, .8, 1.07, -3, S); box(2, .04, .25, bois, .8, 1.45, -3.85, S);
      for (let k = 0; k < 6; k++) box(.1, .3, .1, mat({ color: [0x2a6a3a, 0x8a1a1a, 0xc8a040][k % 3], emissive: 0x332200, emissiveIntensity: .3 }), .2 + k * .25, 1.6, -3.8, S);
      for (const [tx2, tz] of [[-1.4, -1.2], [-.4, -2.2], [-1.6, -2.8]]) { const t = new THREE.Mesh(new THREE.CylinderGeometry(.3, .3, .03, 16), mat({ color: 0xe8e0d0 })); t.position.set(tx2, .74, tz); S.add(t); const p = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, .72, 6), bois); p.position.set(tx2, .37, tz); S.add(p); for (const sg of [-1, 1]) box(.34, .04, .34, bois, tx2 + sg * .45, .45, tz, S); }
      const lampM = new THREE.MeshBasicMaterial({ color: 0xffe0a0 }); for (const [lx, lz] of [[-1, -1.5], [.8, -2.6]]) { const l = new THREE.Mesh(new THREE.SphereGeometry(.12, 12, 8), lampM); l.position.set(lx, h - .1, lz); S.add(l); }
      const v = plan(CAF.vit, x0, y0, x1, y1, -P + .01, { opacity: .3, transparent: true, alphaTest: 0, depthWrite: false }); v.material.emissive = new THREE.Color(0xffa850); v.material.emissiveMap = CAF.vit; v.material.emissiveIntensity = .2;
      box(w + .2, .25, .35, rougeM, cx, cy - h / 2 + .12, .1, g); }
    // l'auvent rayé : la toile inclinée au-dessus du trottoir, son lambrequin, ses bras de fer
    { const x0 = 55, x1 = 480, ww = (x1 - x0) * s, cx = X((x0 + x1) / 2), y = Y(768), Lg = 1.6, a = .5, toileM = mat({ map: v ? txF(["store_creme", "store_bleu", "store_raye"][v - 1]) : CAF.auv, side: THREE.DoubleSide });
      const t = new THREE.Mesh(new THREE.PlaneGeometry(ww, Lg), toileM); t.rotation.x = -Math.PI / 2 + a; t.position.set(cx, y - Lg * Math.sin(a) / 2 + .05, Lg * Math.cos(a) / 2); t.castShadow = !PEU; g.add(t);
      const lb = new THREE.Mesh(new THREE.PlaneGeometry(ww, .22), toileM); lb.position.set(cx, y - Lg * Math.sin(a) - .06, Lg * Math.cos(a) + .01); g.add(lb);
      for (const sg of [-1, 1]) box(.03, .03, Lg * Math.cos(a), mat({ color: 0x2a2a2a }), cx + sg * ww / 2, y - Lg * Math.sin(a) / 2, Lg * Math.cos(a) / 2, g).rotation.x = a; }
    // les corniches en saillie, l'enseigne peinte au nom du café, le toit et ses lucarnes en volume
    box(FW + .1, .14, .28, mat({ color: new THREE.Color(VAR.fac2[v][1]).multiplyScalar(1.15) }), 0, Y(684), .14, g); box(FW + .15, .12, .3, mat({ color: 0xe8d4a8 }), 0, Y(255), .15, g); box(FW * .98, .08, .2, mat({ color: 0xe8d4a8 }), 0, Y(468), .1, g);
    { const c = document.createElement("canvas"); c.width = 512; c.height = 64; const x = c.getContext("2d"); x.fillStyle = "#f4ead6"; x.fillRect(0, 0, 512, 64); x.fillStyle = "#" + new THREE.Color(VAR.fac2[v][1]).getHexString(); x.font = "italic bold 38px Georgia"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(nom, 256, 34); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
      const ens = mat({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0 }), bord = mat({ color: 0xe8dcc0 }); const e = new THREE.Mesh(new THREE.BoxGeometry((452 - 80) * s, (748 - 706) * s, .06), [bord, bord, bord, bord, ens, bord]); e.position.set(X(266), Y(727), .06); g.add(e); NUIT.push([ens, 0, .35]); }
    toit(g, FW, Y(250), [X(150), X(370)], X(105));
    nCafe++; return FW; };
  // =====================================================================================================================================================
  // ---------- le plan (x vers l'est) : métro → rue Norvins → place du Tertre → rue Saint-Éleuthère → place du bas → escaliers → terrasse → Sacré-Cœur ----------
  const HAUT = 18, RZ = 3.6;                       // (la butte : 18 m ; les rues : 7,2 m de façade à façade, trottoirs compris)
  const X_MET = -62, X_NOR = -44, PX = 17.3, PZ = 17, X_ELE = 38, X_PEN = 58, BZ = 16, X_PAL0 = 75, X_PAL1 = 79, X_TER = 96, X_SC = 110, X_CHE = 145.8, X_DER = 162, TZ = 22;
  const ZE0 = 8, ZE1 = 11.5, FZ = -13.5;            // (les escaliers entre |z| 8 et 11,5 ; la pelouse au milieu ; le funiculaire à z = -13,5)
  const PENTE = Math.atan2(HAUT, X_TER - X_PEN);
  const hPente = (x) => Math.max(0, Math.min(HAUT, (x - X_PEN) / (X_TER - X_PEN) * HAUT));
  const hEsc = (x) => x < X_PAL0 ? (x - X_PEN) / (X_PAL0 - X_PEN) * 9 : x < X_PAL1 ? 9 : 9 + (x - X_PAL1) / (X_TER - X_PAL1) * 9;
  const hauteur = (x, z) => x <= X_PEN ? 0 : x >= X_TER ? HAUT : Math.abs(z) > ZE1 ? hPente(x) : hEsc(x);
  const SOLS = [], OBS = [];
  let seed = 7; const al = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const halo = (() => { const c = document.createElement("canvas"); c.width = c.height = 64; const x = c.getContext("2d"), g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, "rgba(255,240,190,1)"); g.addColorStop(.3, "rgba(255,210,120,.45)"); g.addColorStop(1, "rgba(255,180,90,0)"); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
  function haloEn(x, y, z, sc) { const NO = L.nuitObjets = L.nuitObjets || []; const h = new THREE.Sprite(new THREE.SpriteMaterial({ map: halo, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); h.position.set(x, y, z); h.scale.setScalar(sc); h.visible = false; scene.add(h); NO.push(h); }
  const planUV = (w, h, ru, rv) => { const g = new THREE.PlaneGeometry(w, h), uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * ru, uv.getY(i) * rv); return g; };
  const quad = (a, b, c, d, m, ru = 1, rv = 1) => { const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute([...a, ...b, ...c, ...d], 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, 0, rv, ru, 0, ru, rv], 2)); g.setIndex([0, 1, 2, 1, 3, 2]); g.computeVertexNormals();
    const o = new THREE.Mesh(g, m); o.receiveShadow = true; scene.add(o); return o; };
  // ---------- les sols : les pavés peints partout (en miroir, pas de couture), en bas et sur la butte ----------
  const PAV = tx("paves"); PAV.wrapS = PAV.wrapT = THREE.MirroredRepeatWrapping; const pavM = mat({ map: PAV });
  const MX0 = X_MET + 2, MX1 = X_MET + 5.2, MZ = 1.25;   // (la trémie du métro : on descend vers l'ouest, sous la marquise)
  const solP = (x0, x1, z0, z1, y, m = pavM) => { const o = quad([x0, y, z0], [x0, y, z1], [x1, y, z0], [x1, y, z1], m); const uv = o.geometry.attributes.uv; [[x0, z0], [x0, z1], [x1, z0], [x1, z1]].forEach(([x, z], i) => uv.setXY(i, x / 3.2, -z / 3.2)); return o; };
  L.sol = solP(MX1, X_PEN + 1, -18, 18, 0); for (const [x0, x1, z0, z1] of [[X_MET - 1, MX0, -18, 18], [MX0, MX1, -18, -MZ], [MX0, MX1, MZ, 18]]) SOLS.push(solP(x0, x1, z0, z1, 0));
  { const w = X_DER - X_TER + 2, d = 2 * TZ + 4, o = new THREE.Mesh(planUV(w, d, w / 3.2, d / 3.2), pavM); o.rotation.x = -Math.PI / 2; o.position.set((X_TER + X_DER) / 2, HAUT, 0); o.receiveShadow = true; scene.add(o); SOLS.push(o); }
  // ---------- les maisons : une suite de façades peintes en relief, chacune avec son trottoir et sa bordure de pierre ----------
  const TRO = tx("trottoir"); TRO.wrapS = THREE.MirroredRepeatWrapping; TRO.wrapT = THREE.MirroredRepeatWrapping; const troM = mat({ map: TRO });
  const BOR = tx("bordure"); BOR.wrapS = THREE.MirroredRepeatWrapping; const borM = mat({ map: BOR });
  const LARG = { boutique: DEF.fac1.IW * s, immeuble: DEF.fac3.IW * s, cafe: 535 * s, cafe2: DEF.fac4.IW * s * 1.3 };   /* (le nouveau café, agrandi : à la hauteur de ses voisins) */
  const SUITE = ["boutique", "immeuble:1", "cafe:Le Consulat", "boutique:2", "cafe2", "immeuble:2", "boutique:1", "immeuble", "cafe:La Bonne Franquette:1", "boutique:3", "immeuble:3", "cafe2",
    "boutique", "cafe:Chez Eugène:2", "immeuble:1", "boutique:2", "cafe:Au Lapin Agile:3", "immeuble", "cafe2", "boutique:1", "immeuble:2", "cafe:La Mère Catherine:2", "boutique:3", "immeuble:3", "cafe:Le Tire-Bouchon:1"];
  let iS = 0, nTr = 0; const CAFES = [];
  const poser = (t, g) => { const pp = t.split(":"); if (pp[0] === "cafe") return cafe(g, pp[1], Number(pp[2] || 0)); if (pp[0] === "cafe2") { const g2 = new THREE.Group(); g2.scale.setScalar(1.3); g.add(g2); return relief("fac4", g2, 0); } return relief(pp[0] === "boutique" ? "fac1" : "fac3", g, Number(pp[1] || 0)); };
  /* une rangée : partant de (ax, az), tournée selon ry (la façade regarde (sin ry, cos ry)), longue de « long » ; les façades, un peu étirées ou serrées pour tomber juste */
  const rang = (ax, az, ry, long, y = 0, terr = false) => { const dx = Math.cos(ry), dz = -Math.sin(ry), nx = Math.sin(ry), nz = Math.cos(ry), types = []; let tot = 0;
    for (;;) { const t = SUITE[iS % SUITE.length], w = LARG[t.split(":")[0]]; if (types.length && tot + w / 2 > long) break; types.push(t); tot += w; iS++; }
    const k = long / tot; let u = 0;
    for (const t of types) { const w = LARG[t.split(":")[0]] * k, g = new THREE.Group(); g.rotation.y = ry; g.scale.x = k; g.position.set(ax + dx * (u + w / 2), y, az + dz * (u + w / 2)); scene.add(g); poser(t, g);
      if (terr && t.startsWith("cafe")) CAFES.push({ x: g.position.x, z: g.position.z, ry, y }); u += w; }
    const T = new THREE.Group(); T.position.set(ax + dx * long / 2 + nx * .75, y + .06 + (nTr++ % 4) * .004, az + dz * long / 2 + nz * .75); T.rotation.y = ry; scene.add(T);
    const p = new THREE.Mesh(planUV(long, 1.5, long / 3, 1.5), troM); p.rotation.x = -Math.PI / 2; p.receiveShadow = true; T.add(p); box(long, .08, .26, borM, 0, -.02, .72, T); };
  // le bas : la place du métro, la rue Norvins, la place du Tertre, la rue Saint-Éleuthère, la place du bas
  /* (10.242) les angles où une rue débouche sur une place : un pan coupé, comme à Paris — une façade en biais ; les deux rangées s'arrêtent avant, et rien ne se traverse plus */
  const PC = 5, DIAG = [];
  const pan = (cx, cz, ux, uz, vx, vz) => { const nx = -(ux + vx) / Math.SQRT2, nz = -(uz + vz) / Math.SQRT2, ry = Math.atan2(nx, nz), dx = Math.cos(ry), dz = -Math.sin(ry), p1 = [cx + ux * PC, cz + uz * PC], p2 = [cx + vx * PC, cz + vz * PC];
    const st = (p2[0] - p1[0]) * dx + (p2[1] - p1[1]) * dz > 0 ? p1 : p2; rang(st[0], st[1], ry, PC * Math.SQRT2); DIAG.push([p1[0], p1[1], nx, nz, cx, cz, ux, uz, vx, vz]); };
  rang(X_MET, -10, 0, X_NOR - X_MET); rang(X_NOR, 10, Math.PI, X_NOR - X_MET);
  rang(X_NOR + PC, -RZ, 0, -PX - X_NOR - 2 * PC); rang(-PX - PC, RZ, Math.PI, -PX - X_NOR - 2 * PC);
  rang(-PX, -PZ, 0, 2 * PX, 0, true); rang(PX, PZ, Math.PI, 2 * PX, 0, true); rang(-PX, PZ, Math.PI / 2, PZ - RZ - PC, 0, true); rang(-PX, -RZ - PC, Math.PI / 2, PZ - RZ - PC, 0, true); rang(PX, -PZ, -Math.PI / 2, PZ - RZ - PC, 0, true); rang(PX, RZ + PC, -Math.PI / 2, PZ - RZ - PC, 0, true);
  rang(PX + PC, -RZ, 0, X_ELE - PX - 2 * PC); rang(X_ELE - PC, RZ, Math.PI, X_ELE - PX - 2 * PC);
  rang(X_ELE, BZ, Math.PI / 2, BZ - RZ - PC, 0, true); rang(X_ELE, -RZ - PC, Math.PI / 2, BZ - RZ - PC, 0, true); rang(X_ELE, -BZ, 0, 14, 0, true); rang(X_ELE + 14, BZ, Math.PI, 14, 0, true);
  for (const sz of [-1, 1]) { pan(X_NOR, sz * RZ, 0, sz, 1, 0); pan(-PX, sz * RZ, -1, 0, 0, sz); pan(PX, sz * RZ, 1, 0, 0, sz); pan(X_ELE, sz * RZ, -1, 0, 0, sz); box(.6, 13, 10 - RZ - PC + .3, MITOYEN, X_NOR - .3, 6.5, sz * (10 - (10 - RZ - PC) / 2)); }
  // le haut : la rue qui fait le tour du Sacré-Cœur, la place de derrière
  rang(100, -TZ, 0, X_DER - 100, HAUT); rang(X_DER, TZ, Math.PI, X_DER - 100, HAUT); rang(X_DER, -TZ, -Math.PI / 2, 2 * TZ, HAUT);
  // ---------- le métro Abbesses : l'édicule de verre et de fonte verte, devant son immeuble, au bout de la place ----------
  const PIERRE = mat({ color: 0xf2e6cc, roughness: .95 });
  rang(X_MET, 10, Math.PI / 2, 20);   // (l'immeuble du fond, derrière l'édicule)
  { const vertM = mat({ color: 0x2e5a44, metalness: .35, roughness: .45 }), verreM = mat({ color: 0xcfe6dc, transparent: true, opacity: .45, roughness: .15, metalness: .1, side: THREE.DoubleSide, depthWrite: false }), murT = mat({ color: 0xbcae96, roughness: 1 }), noirM = mat({ color: 0x14110e });
    const tube = (pts, r = .055) => { const o = encre(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(([x, y, z]) => new THREE.Vector3(x, y, z))), 24, r, 8), vertM)); o.castShadow = !PEU; scene.add(o); return o; };
    const XF = MX1 + .35, XB = MX0 - .35;   // (l'avant, côté place ; l'arrière, côté immeuble)
    // la trémie : les murs, les marches qui descendent, le fond du couloir qui luit
    for (const sz of [-1, 1]) box(MX1 - MX0, 3.4, .2, murT, (MX0 + MX1) / 2, -1.7, sz * (MZ + .1)); box(.2, 3.4, 2 * MZ, murT, MX0 - .1, -1.7, 0);
    for (let i = 0; i < 11; i++) { const top = -(i + 1) * .28, hh = 3.35 + top; box(.3, hh, 2 * MZ, mat({ color: i % 2 ? 0xc8bca6 : 0xd4c8b2 }), MX1 - .15 - i * .29, top - hh / 2, 0); }
    const fond = mat({ color: 0x2a2018, emissive: 0xffb050, emissiveIntensity: .25 }); box(.05, 2, 2 * MZ - .3, fond, MX0 + .02, -2.2, 0); NUIT.push([fond, .25, .7]); box(MX1 - MX0, .05, 2 * MZ, noirM, (MX0 + MX1) / 2, -3.35, 0);
    // les grilles de fonte : main courante, barreaux, volutes, sur les deux côtés et au fond
    for (const sz of [-1, 1]) { const z = sz * (MZ + .25); tube([[XB, .95, z], [XF - .3, .95, z], [XF, .7, z]], .035); for (let x = XB + .2; x < XF - .2; x += .22) box(.025, .9, .025, vertM, x, .45, z);
      for (let k = 0; k < 4; k++) { const cx = XB + .5 + k * .78, o = encre(new THREE.Mesh(new THREE.TorusGeometry(.16, .02, 6, 16, Math.PI * 1.6), vertM)); o.position.set(cx, .55, z); o.rotation.z = k; scene.add(o); } }
    tube([[XB, .95, -MZ - .25], [XB, .95, MZ + .25]], .035); for (let z = -MZ; z < MZ; z += .22) box(.025, .9, .025, vertM, XB, .45, z);
    // les quatre fûts de fonte, qui s'élancent et se recourbent vers la marquise ; les deux globes orangés en haut de l'avant
    for (const sz of [-1, 1]) { tube([[XF, 0, sz * 1.75], [XF, 1.6, sz * 1.7], [XF - .05, 2.9, sz * 1.55], [XF + .15, 3.5, sz * 1.75], [XF + .3, 3.75, sz * 1.95]], .075);
      tube([[XF, 2.4, sz * 1.62], [XF - .1, 2.85, sz * 1.1], [XF - .05, 3.05, sz * .3]], .045); tube([[XB, 0, sz * 1.75], [XB, 2.8, sz * 1.7], [XB - .1, 3.6, sz * 1.9]], .07);
      const gl = mat({ color: 0xf0a040, emissive: 0xff9020, emissiveIntensity: .25, roughness: .3 }); NUIT.push([gl, .25, 1.4]); const s2 = encre(new THREE.Mesh(new THREE.SphereGeometry(.2, 16, 12), gl)); s2.position.set(XF + .32, 3.95, sz * 1.97); scene.add(s2); haloEn(XF + .32, 3.95, sz * 1.97, 1.6);
      box(.03, 1.2, .03, vertM, XF, 3.2, sz * .85).rotation.x = sz * .3; }
    // la marquise de verre, en éventail, qui remonte vers l'arrière ; ses nervures vertes
    const yF = 3.2, yB = 3.95, lg = Math.hypot(XF - XB, yB - yF), ang = Math.atan2(yB - yF, XF - XB);
    const vt = new THREE.Mesh(new THREE.PlaneGeometry(lg + .4, 4.2), verreM); vt.rotation.set(-Math.PI / 2, 0, 0); const vg = new THREE.Group(); vg.position.set((XF + XB) / 2, (yF + yB) / 2, 0); vg.rotation.z = -ang; vg.add(vt); scene.add(vg);
    for (let k = -4; k <= 4; k++) { const n2 = box(lg + .4, .05, .05, vertM, (XF + XB) / 2, (yF + yB) / 2 + .03, k * .5); n2.rotation.set(0, Math.atan2(k * .12, lg), -ang); }
    tube([[XF + .2, yF - .02, -2.1], [XF + .32, yF + .12, 0], [XF + .2, yF - .02, 2.1]], .05); tube([[XB - .2, yB, -2.1], [XB - .2, yB + .1, 0], [XB - .2, yB, 2.1]], .05);
    // la plaque « Métropolitain » entre les fûts de l'avant
    const pq = new THREE.Mesh(new THREE.BoxGeometry(.06, .5, 1.95), [vertM, vertM, vertM, vertM, vertM, vertM]); pq.position.set(XF + .02, 2.75, 0); scene.add(pq);
    const pt = new THREE.Mesh(new THREE.PlaneGeometry(1.9, .48), mat({ map: tx("metro_plaque"), emissive: 0xfff0c0, emissiveMap: tx("metro_plaque"), emissiveIntensity: 0 })); NUIT.push([pt.material, 0, .5]); pt.rotation.y = Math.PI / 2; pt.position.set(XF + .06, 2.75, 0); scene.add(pt);
    // deux jardinières de géraniums aux coins de l'avant
    for (const sz of [-1, 1]) { const pot = encre(new THREE.Mesh(new THREE.CylinderGeometry(.28, .2, .4, 12), mat({ color: 0xb8704a }))); pot.position.set(XF + .5, .2, sz * 2.25); scene.add(pot); OBS.push([XF + .5, sz * 2.25, .4]);
      const fm = mat({ map: tx("fleur" + (sz > 0 ? 6 : 5)), transparent: true, alphaTest: .45, side: THREE.DoubleSide }); for (const r of [0, Math.PI / 2, Math.PI / 4]) { const f = new THREE.Mesh(new THREE.PlaneGeometry(.75, .8), fm); f.position.set(XF + .5, .78, sz * 2.25); f.rotation.y = r; scene.add(f); } } }
  // ---------- la place du Tertre : le carré des peintres au milieu (barrière de bois, chevalets, tabourets, grands parasols), les platanes, la fontaine ----------
  const FEU = tx("feuillage"); FEU.wrapS = FEU.wrapT = THREE.MirroredRepeatWrapping; const feuM = mat({ map: FEU }), feuF = mat({ map: FEU, color: 0x9ab890 }), tronc = mat({ color: 0xb8ad94 });
  const touffe = (r) => { const g2 = new THREE.IcosahedronGeometry(r, 2), p = g2.attributes.position; for (let i = 0; i < p.count; i++) { const v = new THREE.Vector3().fromBufferAttribute(p, i), k = 1 + (Math.sin(v.x * 3.1 + v.y * 2.3) * .5 + Math.sin(v.z * 2.7 - v.y * 1.9) * .5) * .16 + (al() - .5) * .06; p.setXYZ(i, v.x * k, v.y * k * .82, v.z * k); } g2.computeVertexNormals(); return g2; };
  const TOUF = [0, 1, 2, 3, 4, 5].map(() => touffe(1));   // (six formes de feuillage, réutilisées : moins de géométries)
  const GRA = tx("grille_arbre"), graM = mat({ map: GRA, transparent: true, alphaTest: .1 });
  const platane = (x, z, y = 0, k = 1) => { const tg = new THREE.CylinderGeometry(.17 * k, .34 * k, 7.2 * k, 12); tg.translate(0, 3.6 * k, 0); const t = encre(new THREE.Mesh(tg, tronc)); t.position.set(x, y, z); t.castShadow = !PEU; scene.add(t);
    for (let b = 0; b < 3; b++) { const a = b * 2.1 + al(), bg = new THREE.CylinderGeometry(.07, .12, 2.6 * k, 8); bg.translate(0, 1.3 * k, 0); const br = encre(new THREE.Mesh(bg, tronc)); br.position.set(x, y + 5.6 * k, z); br.rotation.set(Math.sin(a) * .7, 0, -Math.cos(a) * .7); scene.add(br); }
    for (let i = 0; i < (PEU ? 6 : 10); i++) { const a = al() * 6.28, r = (.4 + al() * 1.8) * k, b = encre(new THREE.Mesh(TOUF[i % 6], feuM)); b.scale.setScalar((1 + al() * .8) * k); b.position.set(x + Math.cos(a) * r, y + (7.4 + al() * 2.6) * k, z + Math.sin(a) * r); b.rotation.y = al() * 6; b.castShadow = !PEU; scene.add(b); }
    const gr = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.8), graM); gr.rotation.x = -Math.PI / 2; gr.position.set(x, y + .03, z); scene.add(gr); OBS.push([x, z, .55]); };
  for (const [x, z] of [[-10.5, -9.5], [10.5, -9.5], [-10.5, 9.5], [10.5, 9.5]]) platane(x, z);
  for (const [x, z] of [[44, -9], [44, 9], [150, -12], [150, 12], [156, 0]]) platane(x, z, hauteur(x, z));
  // la barrière de bois du carré des peintres (ouverte au milieu de chaque côté)
  const boisM = mat({ color: 0x7a5434 }), boisC = mat({ color: 0xa87a4a }), CR = 6;
  for (let c = 0; c < 4; c++) { const ry = c * Math.PI / 2; for (const sg of [-1, 1]) { const g = new THREE.Group(); g.rotation.y = ry; scene.add(g);
      const u0 = sg * 1.2, u1 = sg * CR, cx = (u0 + u1) / 2, L2 = Math.abs(u1 - u0); box(L2, .08, .08, boisC, cx, .75, CR, g); box(L2, .06, .06, boisC, cx, .4, CR, g);
      for (let u = u0; sg > 0 ? u <= u1 + .01 : u >= u1 - .01; u += sg * 1.2) box(.1, .85, .1, boisM, u, .42, CR, g);
      for (let u = u0; sg > 0 ? u <= u1 : u >= u1; u += sg * .5) { const v = new THREE.Vector3(u, 0, CR).applyAxisAngle(new THREE.Vector3(0, 1, 0), ry); OBS.push([v.x, v.z, .3]); } } }
  // les toiles des peintres : des tableaux peints au hasard (paysages de Montmartre en couleurs vives)
  const TOILES = [0, 1, 2, 3, 4, 5].map(k => { const c = document.createElement("canvas"); c.width = 96; c.height = 128; const x = c.getContext("2d"); seed = 31 + k * 17;
    const pal = [["#f4c07a", "#e07a5a", "#6a9ac8", "#3a5a8a"], ["#a8d0e8", "#f0e0b0", "#7ab86a", "#c85a4a"], ["#f8d8a8", "#c89ad0", "#5a8ac0", "#2a3a6a"], ["#e8f0f8", "#9ac0d8", "#e8a8a8", "#5a7a5a"], ["#f0a860", "#f8e080", "#4a6a9a", "#2a2a4a"], ["#d8e8c8", "#88b878", "#e8c860", "#8a5a3a"]][k];
    x.fillStyle = pal[0]; x.fillRect(0, 0, 96, 64); x.fillStyle = pal[1]; x.fillRect(0, 50, 96, 30); for (let i = 0; i < 6; i++) { x.fillStyle = pal[2 + (i % 2)]; const bx2 = al() * 80, bw = 10 + al() * 20, bh = 20 + al() * 40; x.fillRect(bx2, 110 - bh, bw, bh); }
    x.fillStyle = "#f4ecdc"; x.beginPath(); x.arc(48, 34, 10 + k, Math.PI, 0); x.fill(); x.fillStyle = pal[3]; x.fillRect(0, 108, 96, 20); x.strokeStyle = "#5a3a20"; x.lineWidth = 6; x.strokeRect(0, 0, 96, 128);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return mat({ map: t }); });
  const chevalet = (x, z, ry, k) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g);
    for (const sx of [-.28, .28]) { const p = box(.05, 1.75, .05, boisC, sx, .86, .1, g); p.rotation.z = -sx * .25; p.rotation.x = -.12; } const pa = box(.05, 1.7, .05, boisC, 0, .82, -.35, g); pa.rotation.x = .28;
    box(.7, .05, .1, boisM, 0, .78, .2, g); const tl = new THREE.Mesh(new THREE.BoxGeometry(.62, .82, .03), [boisM, boisM, boisM, boisM, TOILES[k % 6], boisM]); tl.position.set(0, 1.22, .19); tl.rotation.x = -.12; g.add(tl);
    const tb = new THREE.Mesh(new THREE.CylinderGeometry(.18, .16, .04, 12), boisM); tb.position.set(0, .5, -1.0); g.add(tb); for (let i = 0; i < 3; i++) { const a = i * 2.1, pp = box(.03, .5, .03, boisM, Math.cos(a) * .12, .25, -1.0 + Math.sin(a) * .12, g); void pp; }
    OBS.push([x, z, .55]); };
  // le grand parasol : la toile rayée bordeaux et crème, ses baleines, son mât
  const RAY = (() => { const c = document.createElement("canvas"); c.width = 256; c.height = 32; const x = c.getContext("2d"); for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? "#f2e8d4" : "#8a2a32"; x.fillRect(i * 32, 0, 32, 32); } const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const toileP = mat({ map: RAY, side: THREE.DoubleSide, roughness: .9 });
  const parasol = (x, z, y = 0, r = 1.6) => { const m2 = box(.05, 2.5, .05, fer, x, y + 1.25, z); void m2; const c = encre(new THREE.Mesh(new THREE.ConeGeometry(r, .55, 8, 1, true), toileP)); c.position.set(x, y + 2.55, z); c.castShadow = !PEU; scene.add(c);
    const v = new THREE.Mesh(new THREE.CylinderGeometry(r, r, .16, 8, 1, true), toileP); v.position.set(x, y + 2.2, z); scene.add(v); OBS.push([x, z, .25]); };
  const fer = mat({ color: 0x24262a }), verre = mat({ color: 0xfff0c0, emissive: 0xffe0a0, emissiveIntensity: .1 }); NUIT.push([verre, .1, 1.6]);
  [[-3.4, -3.4, .7], [3.4, -3.4, -.7], [-3.4, 3.4, 2.4], [3.4, 3.4, -2.4], [-4.6, 0, 1.57], [4.6, 0, -1.57], [0, -4.6, 0], [0, 4.6, Math.PI]].forEach(([x, z, ry], k) => chevalet(x, z, ry, k));
  for (const [x, z] of [[-3.8, -1.6], [3.8, 1.6], [-1.6, 3.8], [1.6, -3.8]]) parasol(x, z);
  // la fontaine de fonte verte (comme celle du trottoir peint)
  const vertF = mat({ color: 0x2a4a3a, metalness: .3, roughness: .5 });
  const fontaine = (x, z, y = 0) => { const ad = (geo, py) => { const o = encre(new THREE.Mesh(geo, vertF)); o.position.set(x, y + py, z); o.castShadow = !PEU; scene.add(o); return o; };
    ad(new THREE.CylinderGeometry(.32, .38, .12, 12), .06); ad(new THREE.CylinderGeometry(.2, .26, .5, 12), .36); ad(new THREE.CylinderGeometry(.13, .18, .4, 12), .8); ad(new THREE.SphereGeometry(.16, 12, 8), 1.06); ad(new THREE.CylinderGeometry(.06, .11, .6, 10), 1.42); ad(new THREE.ConeGeometry(.08, .2, 10), 1.8);
    const b = ad(new THREE.CylinderGeometry(.025, .025, .18, 6), .88); b.rotation.z = Math.PI / 2; b.position.x += .2; OBS.push([x, z, .45]); };
  fontaine(-14.5, -12.5); fontaine(54, 6);
  // ---------- les réverbères (seuls ceux de la place du Tertre éclairent vraiment — les autres luisent) ----------
  const LUM = [];
  const reverbere = (x, z, lumiere = false) => { const y0 = hauteur(x, z), add2 = (geo, m, y) => { const o = encre(new THREE.Mesh(geo, m)); o.position.set(x, y0 + y, z); o.castShadow = !PEU; scene.add(o); return o; };
    add2(new THREE.CylinderGeometry(.22, .3, .5, 12), fer, .25); add2(new THREE.CylinderGeometry(.16, .2, .25, 12), fer, .62); add2(new THREE.CylinderGeometry(.06, .1, 3.4, 12), fer, 2.4); add2(new THREE.TorusGeometry(.1, .03, 6, 16), fer, 4.05).rotation.x = Math.PI / 2;
    add2(new THREE.CylinderGeometry(.1, .14, .12, 6), fer, 4.2); add2(new THREE.CylinderGeometry(.24, .15, .55, 6), verre, 4.55); for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2, m = new THREE.Mesh(new THREE.BoxGeometry(.025, .58, .025), fer); m.position.set(x + Math.cos(a) * .2, y0 + 4.55, z + Math.sin(a) * .2); scene.add(m); }
    add2(new THREE.ConeGeometry(.34, .32, 6), fer, 4.98); add2(new THREE.SphereGeometry(.07, 8, 6), fer, 5.2);
    haloEn(x, y0 + 4.55, z, 2.6); OBS.push([x, z, .3]); if (lumiere) { const l = new THREE.PointLight(0xffc880, 0, 16, 1.5); l.position.set(x, y0 + 4.2, z); scene.add(l); LUM.push(l); } };
  for (const [x, z] of [[-12.5, -5], [12.5, -5], [-12.5, 5], [12.5, 5]]) reverbere(x, z, true);
  for (const [x, z] of [[-50, -7.5], [-50, 7.5], [-31, -2.3], [27.5, 2.3], [48, -12.5], [48, 12.5], [X_PAL0 + .6, ZE0 + .5], [X_PAL0 + .6, -ZE0 - .5], [X_PAL1 - .6, ZE0 + .5], [X_PAL1 - .6, -ZE0 - .5],
    [99, -6], [99, 6], [106, -16.6], [106, 16.6], [128, -20.4], [128, 20.4], [152, -20.4], [152, 20.4]]) reverbere(x, z, false);
  JOUR_NUIT.push((n) => { for (const l of LUM) l.intensity = n ? (PEU ? 22 : 30) : 0; });
  // les guirlandes d'ampoules au-dessus du carré des peintres
  { const ampM = new THREE.MeshBasicMaterial({ color: 0xfff2c8 }), filM = new THREE.LineBasicMaterial({ color: 0x2a2420 });
    const guirlande = (a, b) => { const pts = [], n = 18; for (let i = 0; i <= n; i++) { const u = i / n, p = new THREE.Vector3().lerpVectors(a, b, u); p.y -= Math.sin(u * Math.PI) * 1.2; pts.push(p); if (i % 2 && i < n) { const m = new THREE.Mesh(new THREE.SphereGeometry(.07, 8, 6), ampM); m.position.copy(p); m.position.y -= .1; scene.add(m); haloEn(p.x, p.y - .1, p.z, .9); } } scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), filM)); };
    const V = (x, y, z) => new THREE.Vector3(x, y, z); for (let x = -12; x <= 12; x += 6) guirlande(V(x, 6.6, -PZ + .3), V(x + 2, 6.6, PZ - .3)); guirlande(V(-PX + .3, 6.8, -9), V(PX - .3, 6.8, 9)); guirlande(V(-PX + .3, 6.8, 9), V(PX - .3, 6.8, -9)); }
  // ---------- les terrasses devant les cafés : tables de marbre, chaises cannées, un parasol rayé ----------
  const CAN = tx("cannage"); CAN.wrapS = CAN.wrapT = THREE.RepeatWrapping; const canM = mat({ map: CAN }), bambou = mat({ color: 0xb08a50 }), marbre = mat({ color: 0xf2ece2, roughness: .4 });
  for (const C of CAFES) { const nx = Math.sin(C.ry), nz = Math.cos(C.ry), tx2 = Math.cos(C.ry), tz2 = -Math.sin(C.ry);
    for (const k of [-1.7, 0, 1.7]) { const x = C.x + nx * 2.7 + tx2 * k, z = C.z + nz * 2.7 + tz2 * k, y = C.y; const t = encre(new THREE.Mesh(new THREE.CylinderGeometry(.36, .36, .04, 16), marbre)); t.position.set(x, y + .74, z); t.castShadow = !PEU; scene.add(t); const p = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, .72, 6), fer); p.position.set(x, y + .37, z); scene.add(p);
      for (const sg of [-1, 1]) { const cg = new THREE.Group(); cg.position.set(x + tx2 * sg * .58, y, z + tz2 * sg * .58); cg.rotation.y = C.ry + (sg > 0 ? -Math.PI / 2 : Math.PI / 2); scene.add(cg);
        const ad = (geo, m, px, py, pz) => { const o = encre(new THREE.Mesh(geo, m)); o.position.set(px, py, pz); cg.add(o); return o; }; ad(new THREE.BoxGeometry(.4, .05, .4), canM, 0, .46, 0); ad(new THREE.BoxGeometry(.4, .32, .04), canM, 0, .72, -.19).rotation.x = -.12;
        const cad = ad(new THREE.TorusGeometry(.2, .018, 6, 16, Math.PI), bambou, 0, .88, -.2); cad.rotation.x = -.12;
        for (const [a2, b2] of [[-.17, -.17], [.17, -.17], [-.17, .17], [.17, .17]]) ad(new THREE.CylinderGeometry(.018, .018, .46, 6), bambou, a2, .23, b2); } OBS.push([x, z, .75]);
      if (k === 0) parasol(x, z, y, 1.5); } }
  // ---------- les bancs de Paris : flancs de fonte courbés, lattes de bois peintes ----------
  const BB = tx("banc_bois"); const bancM = mat({ map: BB });
  const flanc = (() => { const c = new THREE.CatmullRomCurve3([[.28, 0, 0], [.22, .44, 0], [.05, .46, 0], [-.22, .46, 0], [-.3, .8, 0], [-.34, .95, 0]].map(([a, b2, c2]) => new THREE.Vector3(c2, b2, a))); return new THREE.TubeGeometry(c, 20, .035, 6); })();
  const flanc2 = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, -.25), new THREE.Vector3(0, .3, -.2), new THREE.Vector3(0, .46, -.05)]), 10, .03, 6), acc = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, .62, .22), new THREE.Vector3(0, .7, .05), new THREE.Vector3(0, .62, -.2)]), 10, .025, 6);
  const banc = (x, z, ry) => { const g = new THREE.Group(); g.position.set(x, hauteur(x, z), z); g.rotation.y = ry; scene.add(g); const ad = (geo, m, px, py, pz, rx = 0) => { const o = encre(new THREE.Mesh(geo, m)); o.position.set(px, py, pz); o.rotation.x = rx; o.castShadow = !PEU; g.add(o); return o; };
    for (const sx of [-.85, .85]) { ad(flanc, fer, sx, 0, 0); ad(flanc2, fer, sx, 0, 0); ad(acc, fer, sx, 0, 0); }
    for (let l = 0; l < 4; l++) ad(new THREE.BoxGeometry(1.9, .045, .1), bancM, 0, .47 - l * .004, .2 - l * .12); for (let l = 0; l < 3; l++) ad(new THREE.BoxGeometry(1.9, .09, .035), bancM, 0, .6 + l * .13, -.27 - l * .025, -.25);
    OBS.push([x, z, 1.1]); };
  banc(-5, -10.6, 0); banc(5, 10.6, Math.PI); banc(50, -6, -Math.PI / 2); banc(50, 0, -Math.PI / 2);
  for (const z of [-4, 4, 14.5]) banc(98.2, z, -Math.PI / 2); banc(150, -6, Math.PI / 2); banc(150, 6, Math.PI / 2);
  // ---------- la butte : les grands escaliers (deux volées, un palier), la pelouse fleurie, les talus d'arbustes ----------
  const esc = (() => { const sh = new THREE.Shape(), n = 50, tr = 17 / n, ri = 9 / n; sh.moveTo(0, 0); for (let i = 0; i < n; i++) { sh.lineTo(i * tr, (i + 1) * ri); sh.lineTo((i + 1) * tr, (i + 1) * ri); } sh.lineTo(17, 0); sh.lineTo(0, 0);
    return new THREE.ExtrudeGeometry(sh, { depth: ZE1 - ZE0, bevelEnabled: false }); })();
  const marcheM = mat({ color: 0xdcd2c0, roughness: .95 });
  for (const [x0, y0] of [[X_PEN, 0], [X_PAL1, 9]]) for (const sz of [-1, 1]) { const o = new THREE.Mesh(esc, marcheM); o.position.set(x0, y0, sz > 0 ? ZE0 : -ZE1); o.castShadow = !PEU; o.receiveShadow = true; scene.add(o); SOLS.push(o); }
  { const p = new THREE.Mesh(planUV(X_PAL1 - X_PAL0, 2 * ZE1, 2, 3), pavM); p.rotation.x = -Math.PI / 2; p.position.set((X_PAL0 + X_PAL1) / 2, 9, 0); scene.add(p); SOLS.push(p); box(X_PAL1 - X_PAL0, 9, 2 * ZE1, PIERRE, (X_PAL0 + X_PAL1) / 2, 4.5 - .02, 0); }
  // les murets de pierre le long des escaliers (et la rampe de fer dessus)
  for (const zz of [-ZE1, -ZE0, ZE0, ZE1]) for (const [xa, xb, ya, yb] of [[X_PEN, X_PAL0, 0, 9], [X_PAL1, X_TER, 9, 18]]) { const Lg = Math.hypot(xb - xa, yb - ya), a = Math.atan2(yb - ya, xb - xa);
    const m = box(Lg, .7, .35, PIERRE, (xa + xb) / 2, (ya + yb) / 2 + .2, zz + Math.sign(zz) * (Math.abs(zz) === ZE0 ? -.17 : .17)); m.rotation.z = a; const r = box(Lg, .05, .05, fer, (xa + xb) / 2, (ya + yb) / 2 + 1.0, zz + Math.sign(zz) * (Math.abs(zz) === ZE0 ? -.17 : .17)); r.rotation.z = a; }
  const herbe = mat({ map: FEU, color: 0xe0f4b8, roughness: 1 }), talusM = mat({ map: FEU, color: 0xb8d0a0, roughness: 1 });
  for (const [xa, xb, ya, yb] of [[X_PEN, X_PAL0, 0, 9], [X_PAL1, X_TER, 9, 18]]) quad([xa, ya + .02, -ZE0], [xa, ya + .02, ZE0], [xb, yb + .02, -ZE0], [xb, yb + .02, ZE0], herbe, 3, 6);
  for (const sz of [-1, 1]) { const z0 = sz * ZE1, z1 = sz * 26; quad([X_PEN, 0, Math.min(z0, z1)], [X_PEN, 0, Math.max(z0, z1)], [X_TER, HAUT, Math.min(z0, z1)], [X_TER, HAUT, Math.max(z0, z1)], talusM, 8, 3); }
  // les arbustes des talus
  for (const sz of [-1, 1]) for (let i = 0; i < (PEU ? 16 : 30); i++) { const x = X_PEN + 1 + al() * (X_TER - X_PEN - 2), z = sz * (ZE1 + 1.2 + al() * 12); if (Math.abs(z - FZ) < 2.2) continue; const b = encre(new THREE.Mesh(TOUF[i % 6], i % 3 ? feuM : feuF)); b.scale.set(1.2 + al(), .9 + al() * .6, 1.2 + al()); b.position.set(x, hPente(x) + .5, z); scene.add(b); }
  for (const [x, z] of [[70, 16], [86, 19], [66, -20], [90, -18]]) platane(x, z, hPente(x), .8);
  // les fleurs peintes, en massifs sur la pelouse
  { const FL = []; for (let i = 0; i < 22; i++) FL.push(mat({ map: tx("fleur" + i), transparent: true, alphaTest: .45, side: THREE.DoubleSide }));
    const pg = new THREE.PlaneGeometry(1, 1); pg.translate(0, .5, 0);
    for (let m = 0; m < (PEU ? 12 : 22); m++) { const k = m % 22, fx = X_PEN + 1.5 + al() * (X_TER - X_PEN - 3), fz = (al() * 2 - 1) * (ZE0 - 1.2); if (fx > X_PAL0 - .5 && fx < X_PAL1 + .5) continue;
      for (let j = 0; j < (PEU ? 4 : 7); j++) { const x = fx + (al() - .5) * 2.4, z = fz + (al() - .5) * 2.4, hh = .7 + al() * .5, y = hEsc(x); for (const r of [0, Math.PI / 2]) { const o = new THREE.Mesh(pg, FL[k]); o.scale.set(hh * .8, hh, 1); o.position.set(x, y, z); o.rotation.y = r + al(); scene.add(o); } } } }
  // ---------- le funiculaire : ses rails sur le talus, la gare d'en bas, la gare d'en haut, la cabine qui monte et descend ----------
  { const lg = Math.hypot(X_TER - X_PEN, HAUT), rM = mat({ color: 0x8a8a90, metalness: .6, roughness: .4 }), balM = mat({ color: 0xa89a88, roughness: 1 });
    const lit = box(lg, .2, 2.6, balM, (X_PEN + X_TER) / 2, HAUT / 2 + .05, FZ); lit.rotation.z = PENTE;
    for (const dz of [-.6, .6]) { const r = box(lg, .1, .08, rM, (X_PEN + X_TER) / 2, HAUT / 2 + .22, FZ + dz); r.rotation.z = PENTE; }
    const gare = tx("funi_gare"), gm = mat({ map: gare, transparent: true, alphaTest: .4, side: THREE.DoubleSide });
    const ardM = mat({ color: 0x5a6a7a, roughness: .7 }), pierreG = mat({ color: 0xc8b8a0, roughness: 1 });
    for (const [x, y, ry, sx] of [[X_PEN + .3, 0, -Math.PI / 2, 1], [X_TER + .4, HAUT, Math.PI / 2, -1]]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 3.45), gm); p.position.set(x, y + 1.7, FZ); p.rotation.y = ry; scene.add(p);
      const y0 = sx > 0 ? 0 : HAUT - 1.6; for (const dz of [-2.1, 2.1]) box(3.2, 3.6 + (sx > 0 ? 0 : 1.6), .3, pierreG, x + sx * 1.6, y0 + (3.6 + (sx > 0 ? 0 : 1.6)) / 2, FZ + dz);
      const t = box(3.6, .25, 4.9, ardM, x + sx * 1.6, y + 3.55, FZ); t.rotation.z = sx * .08; }
    const cote = tx("funi_cote"), face = tx("funi_face"), bleuM = mat({ color: 0x6a8aa8 }), toitC = mat({ color: 0x7a9ab0 });
    const cab = new THREE.Group(); cab.userData.anime = true; scene.add(cab); L.__funi = cab;
    const corps = new THREE.Mesh(new THREE.BoxGeometry(4.6, 2.2, 2.2), [mat({ map: face }), mat({ map: face }), toitC, bleuM, mat({ map: cote }), mat({ map: cote })]); corps.position.y = 1.35; cab.add(corps);
    const toit = new THREE.Mesh(new THREE.BoxGeometry(4.8, .14, 2.4), toitC); toit.position.y = 2.52; cab.add(toit); cab.rotation.z = PENTE;
    const u0 = X_PEN + 2.6, u1 = X_TER - 2.4; const a0 = L.anim;
    L.anim = (t) => { a0 && a0(t); const ph = (t / 1000 % 44) / 44; let u = ph < .1 ? 0 : ph < .5 ? (ph - .1) / .4 : ph < .6 ? 1 : 1 - (ph - .6) / .4; u = u * u * (3 - 2 * u); const x = u0 + (u1 - u0) * u; cab.position.set(x, hPente(x) + .25, FZ);
      if (M && M.camera) { const c = M.camera.position; CIEL.position.set(c.x, CIEL.position.y, c.z); PANO.position.set(c.x, PANO.position.y, c.z); } };
    // monter et descendre d'un coup : un cercle violet devant chaque gare
    L.portails.push({ dans: (x, z) => Math.hypot(x - (X_PEN - 1.4), z - FZ) < .6, seuil: [X_PEN - 1.4, FZ], vers: "tertre2", teleport: true, arrivee: [X_TER + 3.6, FZ], yaw: Math.PI / 2, violet: true });
    L.portails.push({ dans: (x, z) => Math.hypot(x - (X_TER + 2.2), z - FZ) < .6, seuil: [X_TER + 2.2, FZ], vers: "tertre2", teleport: true, arrivee: [X_PEN - 3, FZ], yaw: -Math.PI / 2, violet: true }); }
  // les coins de la place du bas, fermés de murs de soutènement et d'arbustes ; le mur en haut des talus
  for (const sz of [-1, 1]) { box(6, 1, 9, PIERRE, X_PEN - 3, .5, sz * (BZ + 4.5)); for (let i = 0; i < 6; i++) { const b = encre(new THREE.Mesh(TOUF[i], feuM)); b.scale.set(1.5, 1.2, 1.5); b.position.set(X_PEN - 5.4 + i * 1.1, 1.6 + al() * .5, sz * (BZ + 1.4 + al() * 4)); scene.add(b); }
    box(4, 2.4, TZ - 17.6 + 4, PIERRE, X_TER + 2, HAUT + 1.2, sz * (17.6 + (TZ - 17.6 + 4) / 2)); }
  // ---------- la terrasse : la balustrade de pierre face à Paris (ouverte en haut des escaliers et devant la gare) ----------
  { const bal = new THREE.LatheGeometry([[.07, 0], [.1, .08], [.06, .25], [.11, .5], [.06, .7], [.08, .78]].map(([r, y]) => new THREE.Vector2(r, y)), 8);
    for (const [za, zb] of [[-18, -15.8], [-ZE0, ZE0], [ZE1, 18]]) { const lg = zb - za; box(.5, .14, lg, PIERRE, X_TER, HAUT + .07, (za + zb) / 2); box(.55, .12, lg, PIERRE, X_TER, HAUT + .92, (za + zb) / 2);
      for (let z = za + .15; z < zb; z += .32) { const o = new THREE.Mesh(bal, PIERRE); o.position.set(X_TER, HAUT + .12, z); scene.add(o); } for (const z of [za, zb]) box(.6, 1.1, .6, PIERRE, X_TER, HAUT + .55, z); } }
  // ---------- Paris, tout en bas, vu de la balustrade (le panorama peint, sur un grand arc à l'ouest) ----------
  const PANO = new THREE.Group(); scene.add(PANO); L.__pano = PANO;
  { const t = tx("panorama"); t.wrapS = THREE.RepeatWrapping; t.repeat.x = -1; const r = 125, la = 2.2, hh = r * la * 470 / 1408;
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, hh, 48, 1, true, Math.PI * 1.5 - la / 2, la), new THREE.MeshBasicMaterial({ map: t, side: THREE.BackSide, fog: false })); PANO.add(m); PANO.position.y = HAUT + 1.7 + hh * .35 - hh / 2; L.__panoM = m.material; }
  // ---------- le Sacré-Cœur : la façade peinte (porches creusés, statues détachées), ses deux flancs, son chevet, son volume et son grand dôme ----------
  { const SW = 32, SS = SW / 848, SH = 1076 * SS, G = new THREE.Group(); G.position.set(X_SC, HAUT, 0); G.rotation.y = -Math.PI / 2; scene.add(G);
    const X = (px) => (px - 424) * SS, Y = (py) => (1076 - py) * SS, blanc = mat({ color: 0xf0eadc, roughness: .9 }), ombre = mat({ color: 0xc8bea8, roughness: 1 });
    const pl = (t, x0, y0, x1, y1, z, o = {}) => { const m = new THREE.Mesh(new THREE.PlaneGeometry((x1 - x0) * SS, (y1 - y0) * SS), mat({ map: t, transparent: true, alphaTest: .4, ...o })); m.position.set(X((x0 + x1) / 2), Y((y0 + y1) / 2), z); G.add(m); return m; };
    /* (en relief : le porche avancé, la façade, les petits dômes en retrait, le grand dôme tout au fond sur son tambour ; le relief peint en bosses) */
    const FT = tx("sc_face"), FR = tx("sc_face_relief", false), plR = (x0, y0, x1, y1, z) => { const g2 = new THREE.PlaneGeometry((x1 - x0) * SS, (y1 - y0) * SS), uv = g2.attributes.uv;
      for (let i = 0; i < uv.count; i++) uv.setXY(i, (x0 + uv.getX(i) * (x1 - x0)) / 848, 1 - (y1 - uv.getY(i) * (y1 - y0)) / 1076); const m = new THREE.Mesh(g2, matN("scf", { map: FT, transparent: true, alphaTest: .4, bumpMap: FR, bumpScale: 2 }, 0, 0)); m.position.set(X((x0 + x1) / 2), Y((y0 + y1) / 2), z); G.add(m); return m; };
    pl(tx("sc_face_base"), 0, 0, 848, 1076, 0, { bumpMap: FR, bumpScale: 2 });
    const PA = 2.6; plR(228, 848, 620, 1076, PA); box((620 - 228) * SS + .3, .35, PA + .4, blanc, X(424), Y(848) + .17, PA / 2, G); for (const xx of [228, 620]) box(.25, Y(848), PA, blanc, X(xx), Y(848) / 2, PA / 2, G);
    for (let k = 0; k < 4; k++) box((620 - 228) * SS + 2 - k * .3, .18, .5, PIERRE, X(424), .09 + k * .18, PA + 1.6 - k * .45, G);   // (les marches devant le porche)
    plR(100, 355, 262, 700, -2.2); plR(588, 355, 750, 700, -2.2);
    const ZD = -(X_CHE - X_SC) / 2 + 5.8; plR(255, 0, 595, 505, ZD);
    [[297, 920, 355, 1070], [395, 920, 458, 1070], [492, 920, 555, 1070]].forEach(([x0, y0, x1, y1], i) => { const P = -PA + 1.2, w = (x1 - x0) * SS, h = (y1 - y0) * SS, cx = X((x0 + x1) / 2), cy = Y((y0 + y1) / 2);
      box(.06, h, 1.2, ombre, cx - w / 2, cy, PA - .6, G); box(.06, h, 1.2, ombre, cx + w / 2, cy, PA - .6, G); box(w, .06, 1.2, ombre, cx, cy + h / 2, PA - .6, G); pl(tx("sc_porte" + i), x0, y0, x1, y1, PA - 1.2, { transparent: false }); void P; });
    [[240, 745, 282, 845], [568, 745, 612, 845]].forEach(([x0, y0, x1, y1], i) => { const m = pl(tx("sc_statue" + i), x0, y0, x1, y1, .35); m.material.alphaTest = .3; box((x1 - x0) * SS, .12, .5, blanc, X((x0 + x1) / 2), Y(y1) - .06, .2, G); });
    const P = X_CHE - X_SC; box(SW - 1.2, Y(700) - .4, P - 2, blanc, 0, (Y(700) - .4) / 2, -1.4 - (P - 2) / 2, G); box(X(588) - X(262), Y(505) - .3, P - 4, blanc, 0, (Y(505) - .3) / 2, -1.4 - (P - 4) / 2, G);
    { const dr = new THREE.Mesh(new THREE.CylinderGeometry(5.4, 5.6, 6, 24), blanc); dr.position.set(0, 22.5, -P / 2); G.add(dr); const dm = new THREE.Mesh(new THREE.SphereGeometry(5.1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), blanc); dm.scale.y = 1.45; dm.position.set(0, 25.5, -P / 2); G.add(dm);
      const ln = new THREE.Mesh(new THREE.CylinderGeometry(.9, 1.1, 4, 12), blanc); ln.position.set(0, 34.5, -P / 2); G.add(ln);
      for (const sx of [-1, 1]) { const d2 = new THREE.Mesh(new THREE.SphereGeometry(2.5, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), blanc); d2.scale.y = 1.4; d2.position.set(sx * 8.8, Y(600), -4.5); G.add(d2); const t2 = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.7, 7, 16), blanc); t2.position.set(sx * 8.8, Y(600) - 3.5, -4.5); G.add(t2); } }
    const SD = SH / 476, wd = 420 * SD;
    for (const [n, sz] of [["sc_cote_g", 1], ["sc_cote_d", -1]]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(wd, SH), mat({ map: tx(n), transparent: true, alphaTest: .4, bumpMap: tx(n + "_relief", false), bumpScale: 2 })); m.position.set(X_SC + wd / 2, HAUT + SH / 2, sz * SW / 2); if (sz < 0) m.rotation.y = Math.PI; scene.add(m); }
    { const hc = SH, wc = 390 * hc / 520, m = new THREE.Mesh(new THREE.PlaneGeometry(wc, hc), mat({ map: tx("sc_chevet"), transparent: true, alphaTest: .4, bumpMap: tx("sc_chevet_relief", false), bumpScale: 2 })); m.rotation.y = Math.PI / 2; m.position.set(X_CHE, HAUT + hc / 2 - .3, 0); scene.add(m); }
    box(P + 6, 1.2, SW + 2, PIERRE, X_SC + P / 2, HAUT - .55, 0); }
  // ---------- les ciels peints : jour et nuit, sur un grand cylindre qui suit la caméra ----------
  const CIEL = new THREE.Group(); scene.add(CIEL); L.__ciel = CIEL;
  const ciel = (n, rep, haut) => { const t = tx(n); t.wrapS = THREE.MirroredRepeatWrapping; t.repeat.set(rep, 1); const g = new THREE.Group(); const m = new THREE.Mesh(new THREE.CylinderGeometry(130, 130, 120, 48, 1, true), new THREE.MeshBasicMaterial({ map: t, side: THREE.BackSide, fog: false })); g.add(m);
    const c = new THREE.Mesh(new THREE.CircleGeometry(130, 48), new THREE.MeshBasicMaterial({ color: haut, side: THREE.DoubleSide, fog: false })); c.rotation.x = Math.PI / 2; c.position.y = 59.9; g.add(c); CIEL.add(g); return g; };
  const CJ = ciel("ciel_jour", 3, 0x4f7fc6), CN = ciel("ciel_nuit", 5, 0x0e3a56); CN.visible = false; CIEL.position.y = 42;
  L.sansLune = true;
  L.vueCour = (n) => { CJ.visible = !n; CN.visible = n; L.__panoM.color.setHex(n ? 0x3a4a78 : 0xffffff); scene.background = new THREE.Color(n ? 0x0e3a56 : 0x9cc0e6); if (scene.fog) { scene.fog.color.setHex(n ? 0x1c3a56 : 0xe8e4dc); scene.fog.near = 70; scene.fog.far = 230; }
    for (const o of scene.children) if (o.isMesh && o.renderOrder === -1 && o.geometry && o.geometry.type === "SphereGeometry") o.visible = false;   /* (le dôme de nuages de la matrice : nos ciels peints le remplacent) */
    for (const [m, j, nn] of NUIT) m.emissiveIntensity = n ? nn : j; for (const f of JOUR_NUIT) f(n); };
  // ---------- le retour : un cercle violet devant le métro, vers la cour d'honneur ----------
  L.portails.push({ dans: (x, z) => Math.hypot(x - (MX1 + 1.4), z) < .6, seuil: [MX1 + 1.4, 0], vers: "grande", arrivee: [6, 6.6], yaw: Math.PI, violet: true, pasApo: true });
  // ---------- là où l'on marche : les places, les rues, les escaliers et le palier, la terrasse, la rue autour, la place de derrière (sans les arbres, les tables, les bancs…) ----------
  const M5 = .5;   /* (10.242 : on marche aussi sur les trottoirs, jusqu'à 50 cm des façades ; les rues entrent dans les places — avant, une bande infranchissable entre elles) */
  const ZONES = [[X_MET + 2, X_NOR + 1, -10 + M5, 10 - M5], [X_NOR - 1, -PX + 2, -RZ + M5, RZ - M5], [-PX + M5, PX - M5, -PZ + M5, PZ - M5], [PX - 2, X_ELE + 2, -RZ + M5, RZ - M5], [X_ELE + M5, X_PEN + .3, -BZ + M5, BZ - M5],
    [X_PEN - .5, X_TER + .5, ZE0 + .2, ZE1 - .3], [X_PEN - .5, X_TER + .5, -ZE1 + .3, -ZE0 - .2], [X_PAL0, X_PAL1, -ZE1 + .3, ZE1 - .3], [X_TER + .4, X_SC - .5, -17.6, 17.6], [X_TER + .5, X_DER - M5, 16.4, TZ - M5], [X_TER + .5, X_DER - M5, -TZ + M5, -16.4], [X_CHE + .5, X_DER - M5, -TZ + M5, TZ - M5]];
  const dansZ = (x, z) => ZONES.some(([a, b, c, d]) => x >= a && x <= b && z >= c && z <= d) && DIAG.every(([px, pz, nx, nz, cx, cz, ux, uz, vx, vz]) => (x - px) * nx + (z - pz) * nz > .5 || (x - cx) * ux + (z - cz) * uz < -.6 || (x - cx) * vx + (z - cz) * vz < -.6 || (x - cx) * ux + (z - cz) * uz > PC + 7 || (x - cx) * vx + (z - cz) * vz > PC + 7) && !(x < MX1 + .6 && Math.abs(z) < 2.3) && !(x > X_SC - 2.9 && x < X_SC + 1 && Math.abs(z) < 7.8);
  L.limites = (x, z) => { if (!dansZ(x, z)) return false; for (const [ox, oz, r] of OBS) if ((x - ox) ** 2 + (z - oz) ** 2 < r * r) return false; return true; };
  L.hauteur = (x, z) => hauteur(x, z); L.solsPlus = SOLS; L.sansPNJ = true;
  L.depart = [X_MET + 8, 0]; L.taille = 1.8; L.suivi = { d: 6.5, h: 3.6, av: 3, vy: 2 }; L.fov = [58, 72];
  L.zone = [X_MET, X_DER, -TZ - 4, TZ + 4]; L.cam = { pos: [X_MET + 2, 6, 0], vise: [X_MET + 20, 3, 0] }; L.sansMusique = true; L.__nuitM = NUIT;
  // ---------- tout ce qui ne bouge pas : sorti des groupes, puis regroupé par matière (bien moins d'appels de dessin, fluide sur téléphone) ----------
  scene.updateMatrixWorld(true);
  const aplat = []; for (const o of scene.children.slice(n0)) if (o.isGroup && !o.userData.anime && o !== CIEL && o !== PANO) o.traverse(c => { if (c.isMesh) aplat.push(c); });
  for (const o of scene.children.slice(n0)) if (o.isMesh && o.children.length) o.traverse(c => { if (c !== o && c.isMesh) aplat.push(c); });
  for (const c of aplat) { c.matrixWorld.decompose(c.position, c.quaternion, c.scale); c.removeFromParent(); scene.add(c); }
  for (const o of scene.children.slice(n0)) if (o.isGroup && !o.userData.anime && o !== CIEL && o !== PANO && !o.children.length) o.removeFromParent();
  try { fusionStatique(scene, L, n0); } catch (e) { console.warn("fusion montmartre2", e); }
}
({ construireMontmartre2 })
