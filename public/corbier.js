/* Le Corbier (Villarembert, Savoie) : la promenade du Front de Neige, d'après les photos (de gauche à droite) —
   la piscine et la galerie Charvin, les grandes tours sombres derrière ; le bâtiment de l'École du Ski Français, la Fontaine de l'Ours, la fromagerie ;
   le chalet des crêpes ; la longue résidence en bois aux balcons en caissons (bar-pizzeria Les Roches Blanches, Skiset, Intersport, la pharmacie,
   la pâtisserie-salon de thé, le Jack Circus, la pizzeria sous sa pergola blanche), le Yéti et ses parasols Amstel ; les bouleaux, les mélèzes ;
   les lampadaires verts à deux lanternes, les bacs rouges, les jardinières, le platelage de bois, le parking de gravier ; et les montagnes de la Maurienne.
   Chargé par la matrice (eval direct) la première fois qu'on y va : il se sert de THREE, M, personne3D, fusionStatique… */
function construireCorbier(A, L, scene) {
  const ECH = PETIT ? .5 : (MOBILE || GPU_MODESTE) ? .7 : 1;
  let graine = 41; const al = () => (graine = (graine * 16807) % 2147483647) / 2147483647;
  const tT = (w, h, f, rx, ry) => { const c = document.createElement("canvas"); c.width = Math.max(8, Math.round(w * ECH)); c.height = Math.max(8, Math.round(h * ECH)); const x = c.getContext("2d"); x.scale(c.width / w, c.height / h); f(x, w, h);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; if (rx) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry || 1); } return t; };
  const mat = (o) => new THREE.MeshStandardMaterial({ roughness: .85, ...o });
  const add = (geo, m, x, y, z, ry = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.y = ry; o.receiveShadow = true; scene.add(o); return o; };
  const box = (w, h, d, m, x, y, z, ry = 0) => add(new THREE.BoxGeometry(w, h, d), m, x, y, z, ry);
  const cyl = (rt, rb, h, m, x, y, z, seg = 10) => add(new THREE.CylinderGeometry(rt, rb, h, seg), m, x, y, z);
  const NUIT = []; const lum = (m, j, n) => { NUIT.push([m, j, n]); return m; };
  const serif = "Georgia, 'Times New Roman', serif", sans = "Arial, Helvetica, sans-serif";
  const fit = (c, txt, maxW, px, font) => { let p = px; c.font = font.replace("@", p + "px"); while (c.measureText(txt).width > maxW && p > 8) { p -= 2; c.font = font.replace("@", p + "px"); } };
  const OB = [];   // (les obstacles ronds : [x, z, rayon])

  /* ---------- les matières : le bois des façades (planches verticales, brun-rouge ou gris délavé), le platelage, le gravier, l'herbe ---------- */
  const planches = (base, var2) => tT(128, 128, (c, w, h) => { c.fillStyle = base; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 8) { const k = (x * 13 % 7) / 7; c.fillStyle = `rgba(${var2},${.1 + k * .18})`; c.fillRect(x, 0, 7, h); c.fillStyle = "rgba(0,0,0,.28)"; c.fillRect(x + 7, 0, 1, h); }
    for (let i = 0; i < 60; i++) { c.fillStyle = "rgba(0,0,0,.08)"; c.fillRect((i * 37) % w, (i * 53) % h, 1, 6 + i % 9); } }, 1, 1);
  const boisRouge = planches("#8a4a2c", "255,190,150"), boisGris = planches("#7a6a58", "220,210,190"), boisSombre = planches("#4a2c1c", "200,140,100");
  const facR = mat({ map: boisRouge }), facG = mat({ map: boisGris }), facS = mat({ map: boisSombre }), boisC = mat({ color: 0x6a3e22, roughness: .7 }), blancB = mat({ color: 0xece8e0, roughness: .8 });
  const deckT = tT(256, 256, (c, w, h) => { c.fillStyle = "#a08670"; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 16) { const k = (y * 7) % 5; c.fillStyle = `rgba(${k % 2 ? "255,240,220" : "60,40,30"},${.06 + k * .02})`; c.fillRect(0, y, w, 15); c.fillStyle = "rgba(40,28,20,.45)"; c.fillRect(0, y + 15, w, 1); for (let x = (y * 3) % 90; x < w; x += 90 + (y % 40)) { c.fillStyle = "rgba(40,28,20,.35)"; c.fillRect(x, y, 1, 15); } } }, 6, 2);
  const gravT = tT(256, 256, (c, w, h) => { c.fillStyle = "#b8b2a6"; c.fillRect(0, 0, w, h); for (let i = 0; i < 2600; i++) { c.fillStyle = ["#9a948a", "#d0cabe", "#88827a", "#c4bcae"][i % 4]; c.fillRect(al() * w, al() * h, 2, 2); } }, 30, 6);
  const herbeT = tT(256, 256, (c, w, h) => { c.fillStyle = "#6a8a3a"; c.fillRect(0, 0, w, h); for (let i = 0; i < 2600; i++) { c.fillStyle = ["#5a7a2e", "#7a9a46", "#8aa04a", "#4a6a26"][i % 4]; c.fillRect(al() * w, al() * h, 2, 3); } }, 60, 30);
  const dalleT = tT(256, 256, (c, w, h) => { c.fillStyle = "#d8ccb4"; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 32) for (let x = (y / 32 % 2) * 24; x < w; x += 48) { c.fillStyle = ["#e0d4bc", "#cfc2a8", "#d8cab0"][(x + y) % 3]; c.fillRect(x + 1, y + 1, 46, 30); } }, 4, 2);

  /* ---------- le sol : le platelage de la promenade, le parking de gravier, l'herbe, et la vallée qui descend ---------- */
  const sol = (x0, x1, z0, z1, m, y = 0) => { const s = add(new THREE.PlaneGeometry(x1 - x0, z1 - z0), m, (x0 + x1) / 2, y, (z0 + z1) / 2); s.rotation.x = -Math.PI / 2; return s; };
  /* (10.104) la rue qui descend : depuis le petit restaurant jusqu'au bas de la piscine, au fond, la pente — trois mètres de moins au bout ; l'herbe à côté suit */
  const DESC = (x, z) => { const u = Math.min(1, Math.max(0, (-50 - x) / 33)), f = z < 21 ? 1 : z > 34 ? 0 : 1 - (z - 21) / 13; return z < 10.5 && x > -84.5 ? 0 : -3.45 * u * u * (3 - 2 * u) * f * f * (3 - 2 * f); };   /* (en bas, la rue arrive au niveau des plages de la piscine) */   // (au bout, derrière la piscine, le terrain est descendu lui aussi)
  { const hm = mat({ map: herbeT, roughness: 1 }); L.sol = sol(-400, 400, 34, 400, hm, -.02); L.solsPlus = [sol(-400, -90, 14, 34, hm, -.02), sol(-50, 400, 14, 34, hm, -.02), sol(-400, 400, -300, -22, hm, -.02), sol(-400, -90, -22, -10, hm, -.02), sol(-84.6, 400, -22, -10, hm, -.02), sol(-400, -84, -10, 14, hm, -.02), sol(-50, 400, -10, 14, hm, -.02), sol(-60.5, -50, -10, 10.4, hm, -.02)]; }   /* (le trou : la piscine en contrebas) */
  L.solsPlus.push(sol(-42, 66, 0, 7, mat({ map: deckT, roughness: .8 }), .03), sol(-50, 100, 7, 17, mat({ map: gravT, roughness: 1 }), .01), sol(66, 84, 0, 8, mat({ map: dalleT, roughness: .8 }), .03), sol(-40.5, -38.6, 0, 7, mat({ map: dalleT, roughness: .8 }), .03));
  for (const [x0, x1] of [[-42, 66]]) box(x1 - x0, .08, .2, boisC, (x0 + x1) / 2, .04, 7);   // (le rebord du platelage)

  /* ---------- les montagnes de la Maurienne tout autour : les crêtes, les pentes d'herbe, les rochers ; quelques sommets plus hauts ---------- */
  { const geo = new THREE.BufferGeometry(), P = [], C = [], N = 160;
    const crete = (R0, H0, k, teinte) => { for (let i = 0; i < N; i++) { const a0 = i / N * Math.PI * 2, a1 = (i + 1) / N * Math.PI * 2, h = (a) => H0 * (.55 + .45 * Math.abs(Math.sin(a * 3 + k)) + .25 * Math.sin(a * 11 + k * 2) + .12 * Math.sin(a * 29)), r = (a) => R0 * (1 + .08 * Math.sin(a * 5 + k));
        const p0 = [Math.cos(a0) * r(a0), h(a0), Math.sin(a0) * r(a0)], p1 = [Math.cos(a1) * r(a1), h(a1), Math.sin(a1) * r(a1)], b0 = [Math.cos(a0) * r(a0) * .62, -30, Math.sin(a0) * r(a0) * .62], b1 = [Math.cos(a1) * r(a1) * .62, -30, Math.sin(a1) * r(a1) * .62];
        for (const p of [b0, p0, p1, b0, p1, b1]) { P.push(...p); const top = p[1] > 0, roc = p[1] > H0 * .78; const col = roc ? [.4, .37, .34] : top ? teinte : [.2, .3, .14]; C.push(...col); } } };
    crete(270, 120, 1.2, [.34, .32, .24]); crete(200, 70, 3.7, [.26, .34, .16]);
    geo.setAttribute("position", new THREE.Float32BufferAttribute(P, 3)); geo.setAttribute("color", new THREE.Float32BufferAttribute(C, 3)); geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide, fog: false, flatShading: true })); m.position.set(0, -15, 40); m.frustumCulled = false; scene.add(m); }
  /* ---------- (en face des bâtiments) le domaine skiable, d'après les photos : la piste de gravier, le talus et son muret de rochers, puis les pentes d'herbe rousse
     qui montent vers les crêtes, les bosquets de sapins ; l'office « Corbier Tourisme » sous sa pyramide, le portique rouge, la gare du télésiège des Sybelles,
     le chalet des remontées, la cabane, la tête d'un autre télésiège ; les pylônes et les sièges qui montent jusqu'en haut ; l'aire de jeux des enfants ---------- */
  const HP = (x, z) => HP0(x, z) + DESC(x, z), HP0 = (x, z) => { if (z < 44) return z < 30 ? 0 : (z - 30) * .03; const t = Math.min(1, (z - 44) / 5), base = .42 + t * t * (3 - 2 * t) * 2.4; if (z < 49) return base;   /* (devant les immeubles : l'esplanade presque plate, puis le pré qui monte) */
    const d = z - 49; return base + d * .24 + Math.max(0, d - 120) * .18 + Math.sin(x * .013 + 1.2) * Math.min(1, d / 60) * 14 + Math.sin(x * .031 + z * .02) * Math.min(1, d / 40) * 5; };
  L.hautPiste = HP;
  { const g2 = new THREE.PlaneGeometry(700, 430, 90, 60); g2.rotateX(-Math.PI / 2); const p = g2.attributes.position, C = [];
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i) + 236; p.setZ(i, z - 236); p.setY(i, HP(-x, z)); const h = HP(-x, z), n = Math.sin(x * .07) * Math.sin(z * .05);
      const c2 = z < 25 ? [.42, .56, .24] : h > 40 ? [.62 + n * .05, .52, .3] : [.56 + n * .06, .54 + n * .04, .28]; C.push(...c2); }
    g2.setAttribute("color", new THREE.Float32BufferAttribute(C, 3)); g2.computeVertexNormals();
    const preT = tT(256, 256, (c, w, h) => { c.fillStyle = "#d8d0b0"; c.fillRect(0, 0, w, h); for (let i = 0; i < 3000; i++) { c.fillStyle = ["#c8c0a0", "#e8e0c0", "#b8b49a", "#d0d8b0"][i % 4]; c.fillRect(al() * w, al() * h, 2, 3); } }, 70, 40);
    const pente = new THREE.Mesh(g2, new THREE.MeshLambertMaterial({ vertexColors: true, map: preT }));   /* (l'herbe rase, roussie par l'automne) */ pente.position.set(0, .01, 236); pente.receiveShadow = true; scene.add(pente); }
  // la piste de gravier, au pied du talus ; le muret de rochers dans le talus
  L.solsPlus.push(sol(-50, 100, 18.6, 21.2, mat({ map: gravT, roughness: 1 }), .02), sol(-50, 60, 21.2, 30, mat({ map: gravT, roughness: 1 }), .02));   // (le chemin, l'esplanade de gravier)
  { const rocM = [mat({ color: 0xa8a49a, roughness: .9 }), mat({ color: 0x8a867e, roughness: .9 })]; for (let x = 68; x < 88; x += .9 + al() * .5) { const r = add(new THREE.DodecahedronGeometry(.45 + al() * .25, 0), rocM[(x * 3 | 0) % 2], x, HP(x, 45.6) + .1, 45.4); r.scale.set(1.3, .7, .8); r.rotation.y = al() * 3; } }
  if (false) { const mar = mat({ color: 0x8a7a64 }); for (let k = 0; k < 6; k++) box(1.6, .1, .25, mar, 30, HP(30, 21.3 + k * .6) + .05, 21.3 + k * .6); }   // (les marches de bois dans le talus)
  /* les chemins de gravier du pré (d'après la vue du ciel) : la grande boucle qui part des Sybelles et revient vers l'office ; les lacets du parcours, sous l'office ; les petites cabanes */
  { const ruban = (pts, w) => { const C2 = new THREE.CatmullRomCurve3(pts.map(([x, z]) => new THREE.Vector3(x, 0, z))), N = pts.length * 14, P = [], I = [], U = [];
      for (let k = 0; k <= N; k++) { const t = k / N, p = C2.getPoint(t), d = C2.getTangent(t), l = Math.hypot(d.x, d.z) || 1, nx = -d.z / l, nz = d.x / l; for (const s2 of [-1, 1]) { const x = p.x + nx * w / 2 * s2, z = p.z + nz * w / 2 * s2; P.push(-x, HP(x, z) + .06, z);   /* (déjà retourné : le passage du miroir ne touche pas aux sommets) */ } U.push(0, k * .4, 1, k * .4); if (k) { const a = (k - 1) * 2; I.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } }
      const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(U, 2)); g.setIndex(I); g.computeVertexNormals();
      const m = new THREE.Mesh(g, mat({ map: gravT, roughness: 1, side: THREE.DoubleSide })); m.receiveShadow = true; scene.add(m); };
    ruban([[70, 30], [56, 37], [38, 41], [18, 40], [2, 36], [-14, 32], [-30, 30]], 3.2);
    ruban([[-30, 46], [-52, 49], [-34, 53], [-55, 57], [-36, 61], [-58, 65]], 1.6);
    ruban([[10, 31], [6, 46], [-2, 62], [-6, 82]], 2.2);
    for (const [x, z] of [[40, 32], [-8, 44], [-62, 46], [52, 46]]) { const y = HP(x, z); box(2, 2, 2, facS, x, y + 1, z); const t = box(2.5, .1, 2.6, mat({ color: 0x4a5058, metalness: .4 }), x, y + 2.1, z); t.rotation.x = .2; OB.push([x, z, 1.6]); } }
  // les bosquets de sapins sur les pentes
  { const sapM = mat({ color: 0x24402a, roughness: .9 }); for (const [cx, cz, n] of [[-60, 150, 40], [-20, 170, 30], [70, 210, 30], [-140, 120, 26], [130, 130, 22], [20, 90, 8]]) for (let k = 0; k < (PETIT ? n / 3 : n); k++) { const x = cx + (al() - .5) * 50, z = cz + (al() - .5) * 40, h = 8 + al() * 7; add(new THREE.ConeGeometry(h * .27, h, 7), sapM, x, HP(x, z) + h / 2 - .5, z); } }
  // l'office du tourisme : la rotonde sous sa grande pyramide de poutres rouges et blanches, le chapeau blanc
  /* l'office du tourisme, d'après les vues du ciel : la grande rotonde à deux niveaux (le soubassement de béton clair, la galerie vitrée, le bandeau rouge « CORBIER TOURISME »),
     son toit conique en bardeaux gris, et les trois grandes poutres de bois lamellé, rouge-orangé côté dehors et blanches côté dedans, qui se rejoignent très haut sous le chapeau blanc */
  { const n0 = scene.children.length, ox = -32, oz = 46, R0 = 8.5, rouge = mat({ color: 0xb8502a, roughness: .55 }), blanc2 = mat({ color: 0xf2f0ea, roughness: .6 }), beton = mat({ color: 0xd8d2c4, roughness: .8 });
    cyl(R0 + .6, R0 + .9, 1.4, beton, ox, .7, oz, 40); cyl(R0, R0, 2.6, mat({ color: 0xe8e2d4 }), ox, 2.7, oz, 40);   // le soubassement, le rez-de-chaussée
    for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2; const w = box(1.9, 2.0, .06, mat({ color: 0x8aa4b0, roughness: .1, metalness: .2 }), ox + Math.sin(a) * (R0 + .02), 2.7, oz + Math.cos(a) * (R0 + .02)); w.rotation.y = a; }   // les baies vitrées tout autour
    const tT2 = tT(2048, 64, (c, w, h) => { c.fillStyle = "#9a2a1e"; c.fillRect(0, 0, w, h); c.fillStyle = "#fff"; c.font = `bold 40px ${sans}`; c.textAlign = "center"; for (const x of [w / 6, w / 2, w * 5 / 6]) c.fillText("CORBIER TOURISME", x, 46); });
    add(new THREE.CylinderGeometry(R0 + .25, R0 + .25, .9, 48, 1, true), mat({ map: tT2, side: THREE.DoubleSide }), ox, 4.45, oz);   // le bandeau rouge
    cyl(R0 + 1.4, R0 + 1.4, .25, blanc2, ox, 4.95, oz, 48); for (let k = 0; k < 48; k++) { const a = k / 48 * Math.PI * 2; cyl(.04, .04, .9, mat({ color: 0x3a3a3a }), ox + Math.sin(a) * (R0 + 1.3), 5.5, oz + Math.cos(a) * (R0 + 1.3), 4); } add(new THREE.TorusGeometry(R0 + 1.3, .05, 4, 64), mat({ color: 0x3a3a3a }), ox, 5.95, oz).rotation.x = Math.PI / 2;   // la galerie de l'étage, sa rambarde
    cyl(R0 - .4, R0 - .4, 1.6, mat({ color: 0xb8c8cc, roughness: .1, metalness: .2 }), ox, 5.9, oz, 40);   // l'étage vitré
    const toitT = tT(256, 256, (c, w, h) => { c.fillStyle = "#7a7268"; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 10) for (let x = (y / 10 % 2) * 8; x < w; x += 16) { c.fillStyle = ["#8a8278", "#6a645c", "#7e766c"][(x + y) % 3]; c.fillRect(x, y, 15, 9); } }, 6, 3);
    add(new THREE.ConeGeometry(R0 + 1.2, 4.2, 48, 1, true), mat({ map: toitT, roughness: .9, side: THREE.DoubleSide }), ox, 8.8, oz);   // le toit conique en bardeaux
    const top = [ox, 22, oz]; for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2 + .6, bx = ox + Math.sin(a) * (R0 + 4), bz = oz + Math.cos(a) * (R0 + 4), A = new THREE.Vector3(bx, 0, bz), B = new THREE.Vector3(...top), d = B.clone().sub(A);
      for (const [m, off] of [[rouge, 0], [blanc2, .55]]) { const o = add(new THREE.BoxGeometry(.6, d.length(), 1.1), m, 0, 0, 0); o.position.copy(A).addScaledVector(d, .5); o.position.x += Math.cos(a) * off; o.position.z -= Math.sin(a) * off; o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()); }
      box(2, .8, 2, beton, bx, .4, bz); OB.push([bx, bz, 1.4]); }
    add(new THREE.ConeGeometry(2.6, 4, 24), blanc2, ox, 22.6, oz); cyl(2.6, 2.6, .6, blanc2, ox, 20.3, oz, 24);   // le chapeau blanc, tout en haut
    for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2; const f = add(new THREE.CylinderGeometry(.02, .02, 11, 3), mat({ color: 0xd8d8d8, metalness: .6 }), ox + Math.sin(a) * 2.2, 15, oz + Math.cos(a) * 2.2); f.rotation.z = Math.sin(a) * .5; f.rotation.x = -Math.cos(a) * .5; }   // les haubans, du chapeau au toit
    for (let k = 0; k < 4; k++) box(4, .2, .5, beton, ox, .1 + k * .2, oz - R0 - 1.4 - k * .5);   // les marches, côté chemin
    OB.push([ox, oz, R0 + 1]); const yb = HP(ox, oz); for (const o of scene.children.slice(n0)) o.position.y += yb; }
  // (l'aire de jeux, les bacs de fleurs du pré : retirés)
  // le portique rouge des Sybelles et ses tourniquets blancs
  { const rg = mat({ color: 0x9a2030, roughness: .5 }); box(.35, 3.2, .35, rg, 70, HP(70, 32) + 1.6, 33); box(.35, 2.4, .35, rg, 65, HP(65, 32) + 1.2, 33); const pt = box(5.6, .5, .6, rg, 67.5, HP(67, 32) + 3.0, 33); pt.rotation.z = .14;
    for (let k = 0; k < 6; k++) box(.25, 1, .25, mat({ color: 0xf2f2f0 }), 65.6 + k * .7, HP(67, 32) + .5, 33); box(1.3, 1.6, .1, mat({ color: 0x1a1a1a }), 63.5, HP(63, 32) + 1.6, 33.2); }
  /* le télésiège des Sybelles : la gare (la grande coque crème au toit sombre), la poulie, les pylônes qui montent, le câble et les sièges qui tournent */
  const TS = []; const telesiege = (gx, gz, dir, long, gros) => { const y0 = HP(gx, gz), g = new THREE.Group(); g.position.set(gx, y0, gz); g.rotation.y = dir; scene.add(g); const cr = mat({ color: 0xe8e2cc, roughness: .5 }), sombre = mat({ color: 0x2a3036, roughness: .3, metalness: .4 }), gris = mat({ color: 0x9a9ea2, metalness: .6, roughness: .4 });
    if (gros) { const co = new THREE.Mesh(new THREE.CapsuleGeometry(2.6, 6, 6, 16), cr); co.rotation.z = Math.PI / 2; co.scale.set(1, 1, .55); co.position.set(0, 4.2, 0); g.add(co); const to = new THREE.Mesh(new THREE.SphereGeometry(3.6, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2), sombre); to.scale.set(1.5, .35, .72); to.position.set(0, 5.4, 0); g.add(to);
      const lg = tT(512, 128, (c, w, h) => { c.fillStyle = "#e8e2cc"; c.fillRect(0, 0, w, h); for (let k = 0; k < 3; k++) { c.fillStyle = ["#2a8a4a", "#2a5ac8", "#c83a2a"][k]; c.beginPath(); c.moveTo(40 + k * 50, 90); c.lineTo(65 + k * 50, 30); c.lineTo(90 + k * 50, 90); c.fill(); } c.fillStyle = "#5a5a5a"; c.font = `italic bold 28px ${sans}`; c.fillText("LES SYBELLES", 40, 118); c.fillStyle = "#e85a1a"; c.fillRect(300, 20, 180, 80); c.fillStyle = "#fff"; c.font = `italic bold 30px ${serif}`; c.fillText("Le Corbier", 312, 72); });
      for (const s of [-1, 1]) { const pa = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.05), mat({ map: lg })); pa.position.set(0, 4.1, s * 1.47); if (s < 0) pa.rotation.y = Math.PI; g.add(pa); }
      for (const [a, b] of [[-2, -1], [2, -1], [-2, 1], [2, 1]]) { const pl = new THREE.Mesh(new THREE.CylinderGeometry(.15, .15, 3, 8), gris); pl.position.set(a, 1.5, b); g.add(pl); } }
    else { const pl = new THREE.Mesh(new THREE.CylinderGeometry(.3, .4, 5, 10), gris); pl.position.y = 2.5; g.add(pl); const cb = new THREE.Mesh(new THREE.BoxGeometry(1, 1.4, 1), mat({ color: 0xd8d8d0 })); cb.position.set(.9, 2.6, 0); g.add(cb); }
    const roue = new THREE.Mesh(new THREE.TorusGeometry(2.2, .12, 6, 28), mat({ color: gros ? 0xe8c020 : 0x8a8e92, metalness: .5 })); roue.rotation.x = Math.PI / 2; roue.position.y = gros ? 2.7 : 4.9; g.add(roue);
    // la ligne : les pylônes, de loin en loin, jusqu'en haut
    const pts = [], n = Math.round(long / 28), cosd = Math.cos(dir), sind = Math.sin(dir);
    for (let k = 1; k <= n; k++) { const d = k * long / n, x = gx + sind * d, z = gz + cosd * d, y = HP(x, z), hp = 9 + (k % 3); const py = add(new THREE.CylinderGeometry(.22, .35, hp, 8), gris, x, y + hp / 2, z); void py; const tr = box(5.2, .25, .4, gris, x, y + hp, z, dir); void tr; pts.push([x, y + hp - .3, z]); }
    const ytop = gros ? 2.7 : 4.9, P0 = [gx, y0 + ytop, gz], line = [P0, ...pts];
    const cable = mat({ color: 0x3a3a3a }); for (const s of [-1, 1]) for (let k = 0; k < line.length - 1; k++) { const A = new THREE.Vector3(line[k][0] + cosd * s * 2.2, line[k][1], line[k][2] - sind * s * 2.2), B = new THREE.Vector3(line[k + 1][0] + cosd * s * 2.2, line[k + 1][1], line[k + 1][2] - sind * s * 2.2), d = B.clone().sub(A), o = add(new THREE.CylinderGeometry(.03, .03, d.length(), 4), cable, 0, 0, 0); o.position.copy(A).addScaledVector(d, .5); o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); }
    // les sièges (quatre places), qui montent d'un côté et redescendent de l'autre
    const L2 = []; let tot = 0; for (let k = 0; k < line.length - 1; k++) { const l = Math.hypot(line[k + 1][0] - line[k][0], line[k + 1][1] - line[k][1], line[k + 1][2] - line[k][2]); L2.push(l); tot += l; }
    const nS = PETIT ? 10 : (MOBILE || GPU_MODESTE) ? 18 : 30, siegeM = mat({ color: gros ? 0x2a3a5a : 0x5a5e62, roughness: .5 }), S = [];
    for (let i = 0; i < nS; i++) { const c = new THREE.Group(); const t = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, 2.2, 4), gris); t.position.y = -1.1; c.add(t); const as = new THREE.Mesh(new THREE.BoxGeometry(2.2, .1, .55), siegeM); as.position.y = -2.2; c.add(as); const ds = new THREE.Mesh(new THREE.BoxGeometry(2.2, .6, .08), siegeM); ds.position.set(0, -1.9, -.3); c.add(ds); const gc = new THREE.Mesh(new THREE.BoxGeometry(2.2, .04, .04), gris); gc.position.set(0, -1.6, .45); c.add(gc);
      c.userData.anime = true; scene.add(c); S.push(c); }
    const placer = (u, cote) => { let d = u * tot, k = 0; while (k < L2.length - 1 && d > L2[k]) { d -= L2[k]; k++; } const f = Math.min(1, d / L2[k]), A = line[k], B = line[k + 1]; return [A[0] + (B[0] - A[0]) * f + cosd * cote * 2.2, A[1] + (B[1] - A[1]) * f, A[2] + (B[2] - A[2]) * f - sind * cote * 2.2]; };
    TS.push({ S, placer, tot, dir, nS }); };
  telesiege(78, 36, .35, 320, true); telesiege(30, 48, .1, 240, false); telesiege(-15, 54, -.1, 200, false);
  // le chalet des remontées : le bardage de bois, le toit de tôle grise, les fenêtres, l'escalier
  { const cx = 90, cz = 40, y = HP(cx, cz); box(9, 3.4, 6, facR, cx, y + 1.7, cz); const r1 = box(5.4, .15, 7, mat({ color: 0x5a6068, metalness: .4, roughness: .5 }), cx - 2.3, y + 4.4, cz); r1.rotation.z = .55; const r2 = box(5.4, .15, 7, mat({ color: 0x5a6068, metalness: .4, roughness: .5 }), cx + 2.3, y + 4.4, cz); r2.rotation.z = -.55;
    for (let k = 0; k < 5; k++) box(1, 1.3, .06, mat({ color: 0x2a3a40, roughness: .2 }), cx - 3.4 + k * 1.7, y + 1.8, cz - 3.02); box(.9, .5, .06, mat({ color: 0x1a5aa8 }), cx + 1, y + 2.9, cz - 3.05); OB.push([cx, cz, 5]); }
  // la petite cabane du préposé, au pied du deuxième télésiège
  { const cx = 22, cz = 47, y = HP(cx, cz); box(3, 2.6, 2.6, facS, cx, y + 1.3, cz); const r = box(3.6, .12, 3.3, mat({ color: 0x4a5058, metalness: .4 }), cx, y + 2.85, cz); r.rotation.x = -.15; box(1.2, .8, .05, mat({ color: 0x9ab0b8, roughness: .1 }), cx + .4, y + 1.7, cz - 1.32); box(.9, 1.4, .9, mat({ color: 0xe8e8e2 }), cx - 2.2, y + .7, cz); }


  /* ---------- la résidence en bois : le rez-de-chaussée des boutiques, trois étages de balcons en caissons, le bandeau de planches qui avance en haut ---------- */
  const verreB = mat({ color: 0xc8d8dc, roughness: .1, metalness: .2, transparent: true, opacity: .35 }), vitreS = lum(mat({ color: 0x2a3a40, emissive: 0xffd8a0, emissiveIntensity: 0, roughness: .2 }), 0, .7);
  const rideauxT = [0, 1, 2, 3].map(k => tT(128, 96, (c, w, h) => { c.fillStyle = "#2c3236"; c.fillRect(0, 0, w, h); const col = ["#e8e4d8", "#d8c8b0", "#c8504a", "#e8e0c8"][k]; c.fillStyle = col; for (let x = 0; x < w; x += 64) { c.fillRect(x + 4, 4, 22, h - 8); c.fillRect(x + 38, 4, 22, h - 8); } c.fillStyle = "rgba(255,255,255,.12)"; c.fillRect(0, 0, w, 6); c.strokeStyle = "#5a3a22"; c.lineWidth = 4; c.strokeRect(2, 2, w - 4, h - 4); c.beginPath(); c.moveTo(w / 2, 0); c.lineTo(w / 2, h); c.stroke(); }));
  const fenM = rideauxT.map(t => lum(mat({ map: t, emissive: 0xffd8a0, emissiveMap: t, emissiveIntensity: 0, roughness: .3 }), 0, .55));
  const residence = (x0, x1, zf, niv, fac, o = {}) => { const W = x1 - x0, cx = (x0 + x1) / 2, HR = 3.4, HE = 2.8, H = HR + niv * HE, D = 12;
    box(W, H, D, facS, cx, H / 2, zf - D / 2 - .6);   // le corps du bâtiment
    box(W + .6, .25, D + 1.6, boisC, cx, H + 1.2, zf - D / 2);   // le toit
    { const f = box(W + .6, 2.2, .35, fac, cx, H + .3, zf + 1.3); f.material = mat({ map: fac.map.clone(), roughness: .85 }); f.material.map.repeat.set(W / 1.6, 1.4); f.material.map.needsUpdate = true; }   // le grand bandeau de planches qui avance
    box(W + .6, .2, 1.7, boisC, cx, H - .8, zf + .5);   // sa sous-face
    for (let x = x0 + 1.6; x < x1 - .5; x += 3.2) { const s = box(.18, 1.9, .18, boisC, x, H - .3, zf + .9); s.rotation.x = .55; }   // les jambes de force
    const bay = 2.7, nB = Math.floor(W / bay), b0 = cx - nB * bay / 2;
    for (let e = 0; e < niv; e++) { const y = HR + e * HE;
      for (let i = 0; i < nB; i++) { const bx = b0 + (i + .5) * bay, decal = (i + e) % 3 === 1 ? .35 : 0;   // (les caissons, un peu en quinconce)
        add(new THREE.PlaneGeometry(bay - .3, HE - .3), fenM[(i * 3 + e * 7) % 4], bx, y + HE / 2, zf - .02);   // la porte-fenêtre, ses rideaux
        const fm = (i + e) % 2 ? fac : facR, prof = 1.15 + decal;
        for (const s of [-1, 1]) box(.14, HE, prof, fm, bx + s * (bay / 2 - .07), y + HE / 2, zf + prof / 2);   // les joues du caisson
        box(bay, .16, prof, fm, bx, y + HE - .08, zf + prof / 2); box(bay, .14, prof, boisC, bx, y + .07, zf + prof / 2);   // le haut, le plancher
        box(bay - .3, .9, .05, verreB, bx, y + .6, zf + prof - .05); box(bay - .2, .07, .1, boisC, bx, y + 1.08, zf + prof - .05);   // le garde-corps vitré, sa main courante
        if ((i + e) % 2) box(.3, .4, .5, blancB, bx - bay / 2 + .25, y - .05, zf + .25);   // les consoles de béton blanc
        if (al() < .25) box(bay - .5, .08, .5, mat({ color: [0xd8c8a0, 0xc85040, 0x3a7a5a][i % 3] }), bx, y + HE - .35, zf + prof - .25);   // un store replié
      } }
    return { H, HR }; };

  /* le rez-de-chaussée : chaque boutique son enseigne, sa vitrine, ses montants de bois */
  const devantureT = (txt, fond, coul, o = {}) => tT(512, 256, (c, w, h) => { c.fillStyle = "#3a2216"; c.fillRect(0, 0, w, h);
    c.fillStyle = fond; c.fillRect(0, 0, w, 62); c.fillStyle = coul; c.textAlign = "center"; c.textBaseline = "middle"; fit(c, txt, w - 30, 40, `bold @ ${o.serif ? serif : sans}`); if (o.ital) c.font = "italic " + c.font; c.fillText(txt, w / 2, 33);
    if (o.sous) { c.fillStyle = "#2a1a10"; c.fillRect(0, 62, w, 26); c.fillStyle = "#f2e8d8"; fit(c, o.sous, w - 30, 18, `bold @ ${sans}`); c.fillText(o.sous, w / 2, 76); }
    const y0 = o.sous ? 92 : 70; for (let k = 0; k < 4; k++) { const x = 8 + k * 126; const g = c.createLinearGradient(0, y0, 0, h); g.addColorStop(0, o.vitre || "#e8d8b0"); g.addColorStop(1, "#6a5a48"); c.fillStyle = g; c.fillRect(x, y0, 118, h - y0 - 10);
      if (o.motif) o.motif(c, x, y0, 118, h - y0 - 10, k); c.fillStyle = "rgba(255,255,255,.18)"; c.beginPath(); c.moveTo(x, y0); c.lineTo(x + 50, y0); c.lineTo(x, y0 + 80); c.fill(); }
    c.fillStyle = "#5a3420"; for (let k = 0; k <= 4; k++) c.fillRect(k * 126 + 2, y0 - 4, 8, h - y0); c.fillRect(0, h - 12, w, 12); });
  const skis = (c, x, y, w, h) => { for (let i = 0; i < 9; i++) { c.fillStyle = ["#d83a2a", "#2a6ac8", "#f0c020", "#2a2a2a", "#e8e8e8"][i % 5]; c.fillRect(x + 6 + i * 12, y + 10, 6, h - 20); } };
  const vetements = (c, x, y, w, h, k) => { for (let i = 0; i < 6; i++) { c.fillStyle = ["#2a5ac8", "#d83a5a", "#f0a020", "#3a3a3a", "#5ab05a", "#e8e8e8"][(i + k) % 6]; c.beginPath(); c.moveTo(x + 10 + i * 18, y + 30); c.lineTo(x + 26 + i * 18, y + 30); c.lineTo(x + 28 + i * 18, y + 80); c.lineTo(x + 8 + i * 18, y + 80); c.fill(); } };
  const tables = (c, x, y, w, h) => { c.fillStyle = "rgba(60,30,15,.55)"; for (let i = 0; i < 3; i++) { c.fillRect(x + 10 + i * 36, y + h - 50, 26, 6); c.fillRect(x + 21 + i * 36, y + h - 44, 4, 30); } c.fillStyle = "rgba(255,230,180,.6)"; c.beginPath(); c.arc(x + w / 2, y + 22, 9, 0, 7); c.fill(); };
  const gateaux = (c, x, y, w, h) => { c.fillStyle = "#f2ece0"; c.fillRect(x + 6, y + h - 46, w - 12, 8); for (let i = 0; i < 5; i++) { c.fillStyle = ["#e8b8c8", "#6a3a1a", "#f0e0b0", "#c83a4a", "#8ac060"][i]; c.beginPath(); c.arc(x + 16 + i * 21, y + h - 52, 8, 0, 7); c.fill(); } };
  const pharma = (c, x, y, w, h) => { c.fillStyle = "#f2f2ee"; c.fillRect(x + 10, y + 10, w - 20, h - 30); c.fillStyle = "#2a9a4a"; c.fillRect(x + w / 2 - 6, y + 25, 12, 40); c.fillRect(x + w / 2 - 20, y + 39, 40, 12); };
  const affiches = (c, x, y, w, h, k) => { for (let i = 0; i < 6; i++) { c.fillStyle = ["#f2f2ee", "#e8d040", "#3a8ac8", "#c83a3a"][(i + k) % 4]; c.fillRect(x + 8 + (i % 3) * 36, y + 10 + (i / 3 | 0) * 50, 30, 42); } };
  const BOUT = [   // largeur, enseigne, fond, couleur, options
    [11, "BAR · RESTAURANT · PIZZERIA", "#3a2216", "#f2e8d8", { sous: "BAR  RESTAURANT  PIZZERIA  LES ROCHES BLANCHES", motif: tables, terr: true }],
    [5, "SPÉCIALITÉS SAVOYARDES", "#3a2216", "#f2e8d8", { sous: "LES ROCHES BLANCHES", motif: tables }],
    [4.5, "ÉCOLE DU SKI FRANÇAIS", "#c8202a", "#ffffff", { vitre: "#f0c8c0", motif: affiches }],
    [4.5, "GALERIE MARCHANDE", "#f2efe6", "#5a3a22", { serif: true, vitre: "#d8c8a8" }],
    [8, "SKISET · LOCATION DE SKI · SKI RENTAL", "#f2f2ee", "#c8202a", { motif: skis }],
    [5, "quasar · boutique", "#e85a3a", "#ffffff", { motif: vetements }],
    [5, "location de skis", "#e85a3a", "#ffffff", { motif: skis }],
    [5, "INTERSPORT · FRONT DE NEIGE", "#1a3a8a", "#ffffff", { motif: vetements, bleu: true }],
    [5, "INTERSPORT · LOCATION RENT", "#1a3a8a", "#ffffff", { motif: skis, bleu: true }],
    [4.5, "GALERIE MARCHANDE", "#f2efe6", "#5a3a22", { serif: true, vitre: "#d8c8a8" }],
    [6, "Pharmacie", "#e8e8e0", "#2a6a3a", { serif: true, motif: pharma, croix: true }],
    [6.5, "Pâtisserie « La Gourmande » Salon de Thé", "#3a3a3a", "#f2e8d8", { serif: true, ital: true, motif: gateaux }],
    [4.5, "JACK ★★ CIRCUS", "#e8c020", "#c8202a", { motif: affiches }],
    [9, "BAR · PIZZERIA · RESTAURANT", "#2a4aa8", "#ffffff", { motif: tables, pergola: true }]];
  const LIGNES = [];   // (pour placer les terrasses, les bancs, les lampadaires devant)
  { const kW = 76 / BOUT.reduce((a, b) => a + b[0], 0); let x = -10; for (const [w0, txt, fond, coul, o] of BOUT) { const w = w0 * kW; const t = devantureT(txt, fond, coul, o), m = lum(mat({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: .12, roughness: .4 }), .12, .75);
      add(new THREE.PlaneGeometry(w - .1, 3.3), m, x + w / 2, 1.65, .02); LIGNES.push({ x0: x, x1: x + w, txt, o });
      if (o.bleu) box(w - .4, .12, 1.1, mat({ color: 0x2a5ac8, roughness: .6 }), x + w / 2, 3.0, .55);   // le store bleu d'Intersport
      if (o.croix) { const cr = lum(mat({ color: 0x1a8a3a, emissive: 0x20c050, emissiveIntensity: .3 }), .3, 1.6); box(.18, .6, .08, cr, x + w - .6, 2.6, .35); box(.6, .18, .08, cr, x + w - .6, 2.6, .35); }
      x += w; } }
  const RA = residence(-10, 66, 0, 3, facR); void RA;
  // les stores rouges et bleus des terrasses, au pied de la résidence (d'après la vue du ciel)
  for (const [x0, x1, c2] of [[-9.5, -.5, 0xc8202a], [.5, 6, 0x2a5ac8], [30, 36, 0xd8602a]]) { const st = box(x1 - x0, .08, 2.6, mat({ color: c2, roughness: .8 }), (x0 + x1) / 2, 3.0, 1.4); st.rotation.x = .2; }   // (la longue résidence, jusqu'au Yéti)

  /* ---------- à gauche : la piscine, la galerie Charvin, les tours ---------- */
  /* (10.102, d'après les vues du ciel) au bout du Front de Neige : le bâtiment bas dont le toit, au niveau de la promenade, porte l'aire de jeux (trampolines, structure gonflable,
     tente verte, toboggan) ; sa façade de boutiques donne, plus bas, sur la piscine en contrebas et ses plages de dalles ; le chemin qui descend à côté, côté pistes */
  const YP = -3.6;
  { const eau = mat({ color: 0x3aa8e0, roughness: .05, metalness: .1, emissive: 0x0a3a5a, emissiveIntensity: .25 }), dalle2 = mat({ map: dalleT, roughness: .8 }), blancP = mat({ color: 0xe8ecee, roughness: .6 });
    const pl = add(new THREE.PlaneGeometry(23.5, 20.2), dalle2, -72.25, YP, .1); pl.rotation.x = -Math.PI / 2; L.solsPlus.push(pl);   // les plages, en bas
    box(16, .3, 9, blancP, -73, YP - .1, -1); const e = add(new THREE.PlaneGeometry(15.4, 8.4), eau, -73, YP + .06, -1); e.rotation.x = -Math.PI / 2;   // le bassin
    for (let k = 1; k < 5; k++) box(15.2, .01, .08, mat({ color: 0x1a5aa8 }), -73, YP + .045, -5.2 + k * 1.7);
    for (const x of [-79, -67]) box(.05, .8, .5, mat({ color: 0xc8ccd0, metalness: .9, roughness: .2 }), x, YP + .4, -5.5);
    OB.push(...Array.from({ length: 7 }, (_, i) => [-80 + i * 2.3, -1, 4.8]));
    // les murs de soutènement autour du contrebas ; la clôture de verre en haut
    const murP = mat({ color: 0xd8d2c4, roughness: .9 }); box(23.5, -YP, .5, murP, -72.25, YP / 2, -10.25); box(.5, .7, 21, murP, -84.25, YP + .35, 0);
    const verreP = mat({ color: 0xd8e8ec, roughness: .05, transparent: true, opacity: .22 }), poteauP = mat({ color: 0x8a8e92, metalness: .6, roughness: .4 });
    /* (10.103, d'après les photos de la rue) le muret blanc enduit, sa margelle de béton, et dessus les grands panneaux de verre sur leurs poteaux d'acier : tout le long du haut de la fosse,
       entre la rue (ou l'herbe) et la piscine en contrebas ; on regarde la piscine par-dessus, on ne tombe pas dedans */
    { const enduit = mat({ color: 0xece8e2, roughness: .95 }), marg = mat({ color: 0xa8a49c, roughness: .9 }), acier = mat({ color: 0x8a9096, metalness: .7, roughness: .35 }), verreG = mat({ color: 0xdcecf0, roughness: .05, metalness: .1, transparent: true, opacity: .2, depthWrite: false });
      const muret = (ax, az, bx, bz, dy = 0) => { const l = Math.hypot(bx - ax, bz - az), cx = (ax + bx) / 2, cz = (az + bz) / 2, ry = Math.atan2(bz - az, bx - ax);
        const m = box(l, .8, .32, enduit, cx, .4 + dy, cz); m.rotation.y = -ry; const c = box(l + .1, .09, .46, marg, cx, .84 + dy, cz); c.rotation.y = -ry;
        const n = Math.max(1, Math.round(l / 2.3)); for (let k = 0; k <= n; k++) { const t = k / n, x = ax + (bx - ax) * t, z = az + (bz - az) * t; box(.09, 2.1, .09, acier, x, 1.9 + dy, z); if (k < n) { const g = box(l / n - .12, 1.9, .025, verreG, x + (bx - ax) / n / 2, 1.85 + dy, z + (bz - az) / n / 2); g.rotation.y = -ry; } } };
      for (let x = -84.4; x < -60.35; x += 2.4) { const x2 = Math.min(-60.3, x + 2.4); muret(x, 10.4, x2, 10.4, HP((x + x2) / 2, 10.7)); } for (let z = -10.3; z < 10.35; z += 2.6) { const z2 = Math.min(10.4, z + 2.6); muret(-84.4, z, -84.4, z2, HP(-84.6, (z + z2) / 2)); }
      for (let x = -84.4; x < -60.35; x += 2.4) { const xm = x + 1.2, top = HP(xm, 10.7); box(2.45, top - YP, .4, murP, xm, (top + YP) / 2, 10.42); } }   // (la paroi de la fosse, sous le muret)
    // la petite pataugeoire, le kiosque au toit sombre dans le coin, côté rue
    { const pt2 = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, .3, 24), blancP); pt2.scale.z = .6; pt2.position.set(-64, YP + .05, 4); scene.add(pt2); const e2 = new THREE.Mesh(new THREE.CircleGeometry(2, 24), eau); e2.rotation.x = -Math.PI / 2; e2.scale.y = .6; e2.position.set(-64, YP + .22, 4); scene.add(e2);
      for (const [dx, dz] of [[-1.6, -1.2], [1.6, -1.2], [-1.6, 1.2], [1.6, 1.2]]) cyl(.06, .06, 2.3, mat({ color: 0x3a3028 }), -81.5 + dx, YP + 1.15, 7.5 + dz, 6); const kt = box(4, .12, 3.4, mat({ color: 0x2a2e34, roughness: .7 }), -81.5, YP + 2.4, 7.5); kt.rotation.x = .2; }
    // les mâts et leurs drapeaux (France, Italie, Europe), près des tours
    for (const [k, z] of [[0, 2], [1, 5], [2, 8]]) { cyl(.06, .08, 10, mat({ color: 0xd8d8d8, metalness: .6 }), -87, 5 + HP(-87, z), z, 8); const fT = tT(96, 64, (c, w, h) => { if (k === 2) { c.fillStyle = "#1a3aa8"; c.fillRect(0, 0, w, h); c.fillStyle = "#f0d020"; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; c.beginPath(); c.arc(w / 2 + Math.cos(a) * 20, h / 2 + Math.sin(a) * 20, 3, 0, 7); c.fill(); } } else { const cs = k ? ["#1a8a3a", "#f2f2f2", "#c8202a"] : ["#1a3aa8", "#f2f2f2", "#c8202a"]; cs.forEach((cc, i) => { c.fillStyle = cc; c.fillRect(i * w / 3, 0, w / 3 + 1, h); }); } });
      const fl = add(new THREE.PlaneGeometry(1.5, 1), mat({ map: fT, side: THREE.DoubleSide }), -87, 9.3 + HP(-87, z), z + .78); fl.rotation.y = Math.PI / 2; }
    for (let k = 0; k < 6; k++) { const t = box(.65, .12, 1.8, blancP, -82 + k * 2.2, YP + .3, 6.5); t.rotation.x = .06; }   // les transats
    // le bâtiment bas : de la piscine jusqu'à la promenade ; sa façade de boutiques sur la piscine ; son toit, l'aire de jeux
    const gT = tT(1024, 160, (c, w, h) => { c.fillStyle = "#9a2a1e"; c.fillRect(0, 0, w, 44); c.fillStyle = "#fff"; c.font = `bold 26px ${sans}`; c.textAlign = "center"; c.fillText("RESTAURANT  ·  BAR  ·  GALERIE CHARVIN  ·  CORBIER FROMAGERIE", w / 2, 32);
      for (let k = 0; k < 8; k++) { const x = 10 + k * 126; c.fillStyle = "#c8d8dc"; c.fillRect(x, 50, 110, h - 54); c.fillStyle = "rgba(255,240,200,.35)"; c.fillRect(x + 6, 60, 40, h - 70); c.fillStyle = "#5a3420"; c.fillRect(x - 6, 44, 6, h); } });
    box(12.5, -YP, 20.6, facR, -54.25, YP / 2, .1);   /* (10.104) en face de la piscine : une longueur de bâtiment, sans étage, sur toute la largeur de la fosse ; son toit au niveau de la promenade */
    const fa = add(new THREE.PlaneGeometry(20.4, -YP - .2), lum(mat({ map: gT, emissive: 0xffffff, emissiveMap: gT, emissiveIntensity: .08 }), .08, .6), -60.52, YP / 2 - .1, .1); fa.material.map.repeat.x = 1; fa.rotation.y = -Math.PI / 2;
    const toitJ = add(new THREE.PlaneGeometry(12.5, 20.6), mat({ color: 0x8a8e88, roughness: .9 }), -54.25, .04, .1); toitJ.rotation.x = -Math.PI / 2; L.solsPlus.push(toitJ);
    const boisR = mat({ color: 0x6a3e22, roughness: .7 });    // (la balustrade de bois du toit)
    { const cr = mat({ color: 0xf0e6c8, roughness: .95 }), mg = mat({ color: 0xa8a49c, roughness: .9 }), corde = mat({ color: 0x8a8070, roughness: .9 }), ac = mat({ color: 0x8a9096, metalness: .7, roughness: .35 }), vg = mat({ color: 0xdcecf0, roughness: .05, transparent: true, opacity: .2, depthWrite: false });
      box(.34, .9, 20.6, cr, -60.4, .45, .1); box(.48, .1, 20.8, mg, -60.4, .95, .1); const rp = cyl(.035, .035, 20.6, corde, -60.22, .72, .1, 6); rp.rotation.x = Math.PI / 2;   // (le muret crème, sa margelle, la corde moulurée)
      for (let z = -10.2; z <= 10.4; z += 2.06) { box(.08, 2, .08, ac, -60.4, 1.95, z); if (z < 10.3) box(.025, 1.9, 1.95, vg, -60.4, 1.95, z + 1.03); } }   // (le grand vitrage au-dessus)
    { const fM = [0xe83a3a, 0xf0c020, 0x2a6ac8, 0xf2f2f2].map(c2 => mat({ color: c2, side: THREE.DoubleSide })); for (let k = 0; k < 33; k++) { const f = add(new THREE.ConeGeometry(.28, .55, 3), fM[k % 4], -60.75, YP + 2.7, -9.8 + k * .62); f.rotation.x = Math.PI; } }   // (les fanions de couleur sous l'auvent)
    /* l'aire de jeux : en hauteur, à droite de la piscine (de l'autre côté de la rue), sur sa terrasse au sol vert, sa rambarde de verre au-dessus du bassin */
    const terr = add(new THREE.PlaneGeometry(23.8, 12), mat({ color: 0x4a8a4a, roughness: .9 }), -72.4, .05, -16.3); terr.rotation.x = -Math.PI / 2; L.solsPlus.push(terr);
    for (let x = -84.2; x < -60.6; x += 2.35) { box(2.3, 1.1, .03, verreP, x + 1.17, .55, -10.5); box(.06, 1.2, .06, poteauP, x, .6, -10.5); }
    const n0J = scene.children.length, o0J = OB.length;
    const coul = [0xe83a3a, 0xf0c020, 0x2a6ac8, 0x3aa84a].map(c2 => mat({ color: c2, roughness: .6 }));
    for (const x of [-57, -53.5]) { cyl(1.4, 1.4, .1, mat({ color: 0x1a1a1a }), x, .7, -6.5, 20); add(new THREE.TorusGeometry(1.45, .08, 6, 24), coul[2], x, .72, -6.5).rotation.x = Math.PI / 2; for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; cyl(.04, .04, 2.2, coul[3], x + Math.cos(a) * 1.45, 1.3, -6.5 + Math.sin(a) * 1.45, 5); } OB.push([x, -6.5, 1.7]); }   // les trampolines
    box(4, 1.4, 3.4, coul[0], -48, .7, -6); for (const [dx, dz] of [[-1.8, -1.5], [1.8, -1.5], [-1.8, 1.5], [1.8, 1.5]]) cyl(.45, .45, 2.4, coul[1], -48 + dx, 1.2, -6 + dz, 10); box(3, .3, 1, coul[2], -48, 2.2, -4.4); OB.push([-48, -6, 2.8]);   // le château gonflable
    { const tn = add(new THREE.ConeGeometry(2.6, 2.4, 4), mat({ color: 0x2a9a4a, roughness: .7 }), -43.5, 2.4, -6.2); tn.rotation.y = Math.PI / 4; for (const [dx, dz] of [[-1.8, -1.8], [1.8, -1.8], [-1.8, 1.8], [1.8, 1.8]]) cyl(.05, .05, 2.4, mat({ color: 0xe8e8e8 }), -43.5 + dx, 1.2, -6.2 + dz, 5); OB.push([-43.5, -6.2, 2.3]); }   // la tente verte
    { const tb = box(.9, .08, 4, coul[1], -52, 1.0, -2.6); tb.rotation.x = -.45; box(1.2, 1.8, 1.2, coul[2], -52, .9, -4.6); OB.push([-52, -3.4, 1.4]); }   // le toboggan
    for (const o of scene.children.slice(n0J)) { o.position.x -= 22; o.position.z -= 10.5; } for (const o of OB.slice(o0J)) { o[0] -= 22; o[1] -= 10.5; }   // (les jeux, posés sur leur terrasse)
    { const grille = (x0, x1, z0, z1, m, dy) => { const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0, Math.ceil((x1 - x0) / 1.5), Math.ceil((z1 - z0) / 1.5)); g.rotateX(-Math.PI / 2); const pp = g.attributes.position;
        for (let i = 0; i < pp.count; i++) { const x = (x0 + x1) / 2 - pp.getX(i), z = pp.getZ(i) + (z0 + z1) / 2; pp.setY(i, HP(x, z) + dy); }   /* (la grille sera retournée : chaque sommet prend la hauteur de son reflet) */ g.computeVertexNormals(); const o = add(g, m, (x0 + x1) / 2, 0, (z0 + z1) / 2); L.solsPlus.push(o); return o; };
      grille(-90, -50, 10.6, 21.2, mat({ map: gravT, roughness: 1 }), .02); grille(-90, -50, 21.2, 34, mat({ map: herbeT, roughness: 1 }), -.02); grille(-90, -84.6, -22, 10.6, mat({ map: herbeT, roughness: 1 }), -.02); }
    /* (10.105, d'après la photo du bas de la rue) le mur de planches sous la terrasse des jeux, sa barrière de bois en haut ; la fresque de l'espace sur la paroi au-dessus du bassin ;
       les enseignes « Igloo » et « Location ski » ; les structures gonflables sur l'eau */
    { const planchM = mat({ map: boisSombre.clone(), roughness: .85 }); planchM.map.repeat.set(8, 2); planchM.map.needsUpdate = true; const bas = HP(-85, -16);
      const pw = add(new THREE.PlaneGeometry(11.6, -bas), planchM, -84.45, bas / 2, -16.3); pw.rotation.y = -Math.PI / 2;
      for (let z = -22; z <= -10.6; z += 1.9) box(.14, 1.1, .14, boisC, -84.35, .55, z); for (const y of [.5, 1.0]) box(.1, .1, 11.4, boisC, -84.35, y, -16.3); }
    { const fr = tT(1024, 160, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#0a1440"); g.addColorStop(1, "#1a2a6a"); c.fillStyle = g; c.fillRect(0, 0, w, h); for (let i = 0; i < 160; i++) { c.fillStyle = `rgba(255,255,255,${.3 + (i % 5) * .14})`; c.fillRect((i * 97) % w, (i * 53) % h, 2, 2); }
        c.fillStyle = "#f0c840"; c.beginPath(); c.arc(320, 80, 52, 0, 7); c.fill(); c.strokeStyle = "#e8a020"; c.lineWidth = 7; c.beginPath(); c.ellipse(320, 80, 92, 18, -.2, 0, 7); c.stroke();
        c.fillStyle = "#3aa0e0"; c.beginPath(); c.arc(860, 110, 34, 0, 7); c.fill(); c.fillStyle = "#e8e8e8"; c.save(); c.translate(620, 70); c.rotate(-.5); c.fillRect(-12, -40, 24, 70); c.beginPath(); c.moveTo(-12, -40); c.lineTo(0, -66); c.lineTo(12, -40); c.fill(); c.fillStyle = "#e83a3a"; c.fillRect(-22, 14, 10, 18); c.fillRect(12, 14, 10, 18); c.fillStyle = "#f0a020"; c.beginPath(); c.moveTo(-8, 30); c.lineTo(0, 54); c.lineTo(8, 30); c.fill(); c.restore();
        c.fillStyle = "#c83a8a"; c.beginPath(); c.arc(120, 120, 22, 0, 7); c.fill(); });
      const fm = add(new THREE.PlaneGeometry(23.4, -YP - .2), mat({ map: fr, roughness: .5 }), -72.3, YP / 2 - .1, -9.99); void fm; }   // la fresque de l'espace
    { const pan = (txt, fond, coul, z, w2) => { const t = tT(256, 64, (c, w, h) => { c.fillStyle = fond; c.fillRect(0, 0, w, h); c.fillStyle = coul; c.font = `bold 34px ${sans}`; c.textAlign = "center"; c.fillText(txt, w / 2, 45); }); const p2 = add(new THREE.PlaneGeometry(w2, .55), lum(mat({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: .12 }), .12, .8), -60.56, YP + 2.75, z); p2.rotation.y = -Math.PI / 2; };
      pan("IGLOO", "#f2f2ee", "#1a1a1a", 7.5, 2); pan("LOCATION SKI · SKI RENTAL", "#f2f2ee", "#c8202a", -6.5, 3.4); }
    { const bl = mat({ color: 0xf2f2f2, roughness: .5 }), bu = mat({ color: 0x2a7ad8, roughness: .5 }), ja = mat({ color: 0xf0c020, roughness: .5 });   // les structures gonflables, sur l'eau
      const t1 = cyl(.45, .45, 5, bu, -76, YP + .4, -1, 12); t1.rotation.x = Math.PI / 2; const ar = add(new THREE.TorusGeometry(1.1, .3, 8, 16, Math.PI), bl, -71, YP + .2, -2); void ar; add(new THREE.TorusGeometry(.7, .22, 8, 16), ja, -71, YP + 1.3, -2); const t2 = cyl(.4, .4, 3.5, bl, -67.5, YP + .38, 1.5, 12); t2.rotation.z = Math.PI / 2; }   // (la rue en pente, l'herbe autour)   // (la rue, en haut, le long du muret)
    // les grandes tours sombres derrière (Les Tours du Corbier)
    const tourT = tT(128, 256, (c, w, h) => { c.fillStyle = "#4a2418"; c.fillRect(0, 0, w, h); for (let y = 6; y < h; y += 18) { c.fillStyle = "#2a1610"; c.fillRect(0, y, w, 8); c.fillStyle = "#c8b8a0"; c.fillRect(0, y + 8, w, 2); for (let x = 4; x < w; x += 32) { c.fillStyle = "#1a1a20"; c.fillRect(x, y + 10, 24, 7); } } }, 3, 1);
    const tourM = lum(mat({ map: tourT, emissive: 0xffc890, emissiveMap: null, emissiveIntensity: 0 }), 0, .08);
    for (const [x, z, h, w] of [[100, -6, 46, 18], [114, 14, 40, 16]]) { box(w, h, 14, tourM, x, h / 2, z); box(w + 1, 1.2, 15, mat({ color: 0x3a2014 }), x, h + .6, z); }   // (la grande tour sombre, au bout du Yéti)
    const tourO = tT(128, 256, (c, w, h) => { c.fillStyle = "#c8761e"; c.fillRect(0, 0, w, h); for (let y = 6; y < h; y += 18) { c.fillStyle = "#7a3a14"; c.fillRect(0, y, w, 7); c.fillStyle = "#e8c070"; c.fillRect(0, y + 7, w, 2); for (let x = 4; x < w; x += 32) { c.fillStyle = ["#e8d8c0", "#c84a3a", "#2a2a30"][(x + y) % 3]; c.fillRect(x, y + 10, 24, 7); } } }, 3, 1);
    for (const [x, z, h, w] of [[-104, -14, 50, 18], [-110, 10, 46, 16], [-100, 34, 42, 15]]) { box(w, h, 15, mat({ map: tourO }), x, h / 2, z); box(w + 1, 1.2, 16, mat({ color: 0x5a2a12 }), x, h + .6, z); } }   // (les tours orangées, au bout de la piscine)

  /* ---------- le bâtiment de l'École du Ski Français, la Fontaine de l'Ours ---------- */
  { const n0E = scene.children.length; residence(-39, -1, -3.2, 3, facG);   /* (10.108 : collé à la longue résidence — plus d'espace entre les deux) */
    const esf = tT(512, 96, (c, w, h) => { c.fillStyle = "#f2f2ee"; c.fillRect(0, 0, w, h); c.fillStyle = "#c8202a"; c.beginPath(); c.arc(40, 48, 30, 0, 7); c.fill(); c.fillStyle = "#1a3a8a"; c.font = `italic bold 40px ${sans}`; c.fillText("ÉCOLE DU SKI FRANÇAIS", 82, 60); });
    const s = add(new THREE.PlaneGeometry(9, 1.7), lum(mat({ map: esf, emissive: 0xffffff, emissiveMap: esf, emissiveIntensity: .1 }), .1, .8), -26, 4.9, -1.9); void s;
    const ours = tT(512, 96, (c, w, h) => { c.fillStyle = "#c8202a"; c.fillRect(0, 0, w, h); c.fillStyle = "#fff"; c.font = `italic bold 30px ${serif}`; c.fillText("Bar - Restaurant", 14, 60); c.font = `italic bold 38px ${serif}`; c.fillText("La Fontaine de l'Ours", 232, 60); });
    add(new THREE.PlaneGeometry(10, 1.4), lum(mat({ map: ours, emissive: 0xffffff, emissiveMap: ours, emissiveIntensity: .12 }), .12, .9), -25, 2.6, -2.15);
    const bas = tT(512, 160, (c, w, h) => { c.fillStyle = "#4a2a18"; c.fillRect(0, 0, w, h); for (let k = 0; k < 5; k++) { c.fillStyle = "#e8d8b0"; c.fillRect(10 + k * 100, 20, 88, h - 34); c.fillStyle = "rgba(90,50,30,.5)"; c.fillRect(30 + k * 100, h - 60, 50, 6); } });
    add(new THREE.PlaneGeometry(38, 1.9), lum(mat({ map: bas, emissive: 0xffffff, emissiveMap: bas, emissiveIntensity: .1 }), .1, .7), -20, .95, -3.18);
    // la terrasse de bois de la Fontaine de l'Ours, sa barrière de rondins
    box(38, .35, 3, boisC, -20, .17, -1.6); for (let x = -38.8; x <= -1.2; x += 1.6) box(.12, 1.0, .12, boisC, x, .85, -.15); for (const y of [.75, 1.25]) box(38, .1, .1, boisC, -20, y, -.15);
    for (const o of scene.children.slice(n0E)) o.position.x -= 9; }   // (10.105, d'après la photo : juste derrière la longueur de bâtiment de la piscine)
  /* (10.107, d'après les photos) le petit chalet de la Fontaine de l'Ours, entre l'École du Ski et la piscine : le soubassement crème, le haut en madriers de bois et ses fenêtres,
     le toit de tôle qui avance ; devant, côté piscine, sa terrasse de dalles claires, ses tables carrées blanches et ses chaises ajourées rouges et noires, sous la grande voile d'ombrage grise ;
     les parasols bleu clair au bout ; côté rue, l'enseigne « CRÊPES », les ardoises Carlsberg, le menu dans sa petite vitrine à toit */
  { const x0 = -57.2, x1 = -49.6, z0 = -9.6, z1 = 9.8, H = 3.1, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, W = x1 - x0, D = z1 - z0;
    const creme = mat({ color: 0xf0e6c8, roughness: .95 }), madrier = mat({ map: boisRouge.clone(), roughness: .8 }); madrier.map.repeat.set(1, 6); madrier.map.rotation = Math.PI / 2; madrier.map.needsUpdate = true;
    box(W, 1.15, D, creme, cx, .575, cz); box(W, H - 1.15, D, madrier, cx, 1.15 + (H - 1.15) / 2, cz);
    const toit = box(W + 1.8, .14, D + .8, mat({ color: 0x7a7e84, metalness: .4, roughness: .5 }), cx - .6, H + .25, cz); toit.rotation.z = -.1; box(.15, .25, D + .8, mat({ color: 0x5a5e64, metalness: .5 }), x0 - 1.4, H + .05, cz);
    const vit = lum(mat({ color: 0x6a8490, roughness: .1, metalness: .2, emissive: 0xffd8a0, emissiveIntensity: 0 }), 0, .55), cadre = mat({ color: 0x6a3e22, roughness: .7 });
    for (let z = z0 + .8; z < z1 - 1; z += 2.4) { box(.06, 1.25, 1.9, vit, x0 - .03, 2.0, z + 1); box(.12, .12, 2.1, cadre, x0 - .06, 2.65, z + 1); box(.12, .12, 2.1, cadre, x0 - .06, 1.35, z + 1); for (const dz of [0, 2]) box(.12, 1.4, .12, cadre, x0 - .06, 2.0, z + dz); }
    box(.08, 2.1, 1.1, mat({ color: 0x5a3420, roughness: .6 }), x0 - .04, 1.05, cz + 3.3);   // la porte
    const rT = tT(1024, 192, (c, w, h) => { c.fillStyle = "#d81c24"; c.fillRect(0, 0, w, h); c.strokeStyle = "#fff"; c.lineWidth = 6; c.strokeRect(6, 6, w - 12, h - 12); c.fillStyle = "#fff"; c.beginPath(); c.moveTo(70, 40); c.lineTo(110, 40); c.lineTo(110, 90); c.lineTo(140, 90); c.lineTo(90, 150); c.lineTo(40, 90); c.lineTo(70, 90); c.fill();
      c.font = `italic bold 64px ${serif}`; c.textAlign = "center"; c.fillText("La Fontaine de l'Ours", 590, 88); c.font = `bold 56px ${sans}`; c.fillText("BAR-RESTAURANT", 590, 160); });
    void rT;   // (l'enseigne rouge à flèche est sur le mur de l'École du Ski, au-dessus)
    const cpT = tT(256, 64, (c, w, h) => { c.fillStyle = "#c8202a"; c.fillRect(0, 0, w, h); c.fillStyle = "#fff"; c.font = `bold 44px ${serif}`; c.textAlign = "center"; c.fillText("CRÊPES", w / 2, 48); });
    add(new THREE.PlaneGeometry(1.5, .4), mat({ map: cpT }), x0 + 1, 2.3, z1 + .02);   // l'enseigne « CRÊPES », au coin, côté rue
    // la terrasse : les dalles claires, les tables carrées blanches, les chaises ajourées rouges et noires
    const dal = add(new THREE.PlaneGeometry(x0 + 60.2, D + .4), mat({ map: dalleT, roughness: .8 }), (x0 - 60.2) / 2, .06, cz); dal.rotation.x = -Math.PI / 2;
    const blancT = mat({ color: 0xf2f0ea, roughness: .4 }), noirP = mat({ color: 0x1a1a1a, roughness: .5 }), rougeC = mat({ color: 0xd02a26, roughness: .55 }), noirC = mat({ color: 0x2a2a2e, roughness: .55 });
    const chaise = (x, z, ry, m) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g); const a = new THREE.Mesh(new THREE.BoxGeometry(.44, .05, .42), m); a.position.y = .46; g.add(a); const d = new THREE.Mesh(new THREE.BoxGeometry(.44, .48, .05), m); d.position.set(0, .72, -.2); d.rotation.x = -.12; g.add(d); for (const [dx, dz] of [[-.19, -.17], [.19, -.17], [-.19, .17], [.19, .17]]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(.018, .018, .46, 5), m); l.position.set(dx, .23, dz); g.add(l); } };
    let k = 0; for (const tx of [-59.3, -57.9]) for (let z = z0 + .9; z < z1 - .6; z += 1.75) { box(.72, .04, .72, blancT, tx, .75, z); cyl(.025, .025, .73, noirP, tx, .37, z, 5); box(.5, .03, .5, noirP, tx, .02, z);
        for (const sg of [-1, 1]) chaise(tx, z + sg * .55, sg < 0 ? 0 : Math.PI, (k++ % 3 === 1) ? noirC : rougeC); OB.push([tx, z, .7]); }
    // la grande voile d'ombrage grise, tendue du toit vers le muret
    { const vo = box(2.9, .03, D - 1.2, mat({ color: 0x9a9c9c, roughness: .9, side: THREE.DoubleSide }), -58.6, 2.75, cz + .4); vo.rotation.z = .16; for (const z of [z0 + 1, z1 - 1]) cyl(.04, .04, 2.6, mat({ color: 0x8a8e92, metalness: .6 }), -60, 1.3, z, 6); }
    // les parasols bleu clair, au bout de la terrasse
    for (const z of [z0 + .6, z0 + 3.2]) { cyl(.04, .04, 2.6, mat({ color: 0xd8d8d8 }), -59.4, 1.3, z, 5); const pa = add(new THREE.ConeGeometry(1.5, .45, 8, 1, true), mat({ color: 0x8ac0e0, side: THREE.DoubleSide, roughness: .8 }), -59.4, 2.7, z); void pa; }
    // côté rue : les deux ardoises Carlsberg, le menu dans sa petite vitrine à toit
    const ardT = tT(128, 192, (c, w, h) => { c.fillStyle = "#1e2420"; c.fillRect(0, 0, w, h); c.strokeStyle = "#c8a040"; c.lineWidth = 8; c.strokeRect(4, 4, w - 8, h - 8); c.fillStyle = "#3a9a3a"; c.fillRect(20, 14, 88, 22); c.fillStyle = "#fff"; c.font = "bold 14px Arial"; c.textAlign = "center"; c.fillText("Carlsberg", 64, 30); c.font = "13px Arial"; ["La Fontaine de l'Ours", "BARBECUE", "Omelettes", "Croque", "Bon appétit !"].forEach((t, i) => c.fillText(t, 64, 60 + i * 24)); });
    for (const [x, z] of [[-55.5, z1 + 1.2], [-53.8, z1 + 1.3]]) { const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g); for (const sg of [-1, 1]) { const pq = new THREE.Mesh(new THREE.BoxGeometry(.6, .95, .04), mat({ map: ardT })); pq.position.set(0, .48, sg * .1); pq.rotation.x = -sg * .14; g.add(pq); } OB.push([x, z, .5]); }
    { const mx = -51.5, mz = z1 + .6; for (const sg of [-1, 1]) box(.08, 1.3, .08, cadre, mx + sg * .35, .65, mz); box(.75, .9, .12, cadre, mx, 1.55, mz); box(.6, .7, .02, mat({ color: 0xf2efe6 }), mx, 1.55, mz + .07); const tt = add(new THREE.ConeGeometry(.6, .35, 4), mat({ color: 0x3a3a3a }), mx, 2.2, mz); tt.rotation.y = Math.PI / 4; OB.push([mx, mz, .5]); }
    OB.push([cx, z0 + 2.5, 3], [cx, cz - 2.5, 3], [cx, cz + 2.5, 3], [cx, z1 - 2.5, 3]); }
  box(12.6, 1.6, .12, mat({ color: 0xf0e6c8, roughness: .95 }), -54.25, -.75, 10.5);   // (côté rue, sous la terrasse : le mur crème, comme le muret)
  // « LE WAGON · Bar - Snack » sur la longueur de bâtiment, sous la terrasse, côté piscine
  { const wT = tT(512, 96, (c, w, h) => { c.fillStyle = "#f2efe6"; c.fillRect(0, 0, w, h); c.strokeStyle = "#8a2a20"; c.lineWidth = 6; c.strokeRect(4, 4, w - 8, h - 8); c.fillStyle = "#8a2a20"; c.font = `bold 46px ${serif}`; c.textAlign = "center"; c.fillText("LE WAGON", w / 2, 52); c.font = `bold 20px ${sans}`; c.fillText("Bar - Snack - Glaces", w / 2, 82); });
    const wp = add(new THREE.PlaneGeometry(3.2, .6), lum(mat({ map: wT, emissive: 0xffffff, emissiveMap: wT, emissiveIntensity: .12 }), .12, .8), -60.57, YP + 2.0, 3); wp.rotation.y = -Math.PI / 2; }
  // (10.108 : le cabanon des crêpes retiré)

  /* ---------- le Yéti, au bout : la salle basse, l'enseigne entre les deux Amstel, la pergola blanche, les tables de pique-nique sur les dalles ---------- */
  { const yT = tT(1024, 128, (c, w, h) => { c.fillStyle = "#5a2a18"; c.fillRect(0, 0, w, h); for (const x of [40, 640, 860]) { c.fillStyle = "#c8202a"; c.fillRect(x, 22, 130, 64); c.fillStyle = "#f0c020"; c.beginPath(); c.ellipse(x + 65, 54, 26, 22, 0, 0, 7); c.fill(); c.fillStyle = "#c8202a"; c.beginPath(); c.ellipse(x + 65, 54, 14, 11, 0, 0, 7); c.fill(); } c.fillStyle = "#c8202a"; c.fillRect(300, 18, 260, 72); c.strokeStyle = "#fff"; c.lineWidth = 4; c.strokeRect(306, 24, 248, 60); c.fillStyle = "#fff"; c.font = `bold 46px ${serif}`; c.textAlign = "center"; c.fillText("LE YETI", 430, 70); });
    box(16, 3.6, 10, facS, 74.5, 1.8, -6); add(new THREE.PlaneGeometry(16, 1.2), lum(mat({ map: yT, emissive: 0xffffff, emissiveMap: yT, emissiveIntensity: .12 }), .12, .9), 74.5, 3.0, -.98);
    const yB = devantureT("Crêpes · Pizzas · Spécialités savoyardes", "#c8202a", "#ffffff", { motif: tables, serif: true }); add(new THREE.PlaneGeometry(16, 2.4), lum(mat({ map: yB, emissive: 0xffffff, emissiveMap: yB, emissiveIntensity: .12 }), .12, .75), 74.5, 1.2, -.98);
    box(16.4, .3, 11, mat({ color: 0x8a5a3a }), 74.5, 3.75, -5.8); }
  // les pergolas blanches (la pizzeria, le Yéti) : les poteaux, les chevrons, la toile
  const pergola = (x0, x1, z0, z1) => { const bl = mat({ color: 0xf2f2f2, roughness: .4, metalness: .2 });
    for (let x = x0; x <= x1 + .01; x += (x1 - x0) / Math.max(1, Math.round((x1 - x0) / 4))) { cyl(.06, .06, 2.7, bl, x, 1.35, z1, 8); OB.push([x, z1, .3]); const ch = box(.08, .08, z1 - z0 + .3, bl, x, 2.7 + (z1 - z0) * .05, (z0 + z1) / 2); ch.rotation.x = -.1; }
    box(x1 - x0, .08, .08, bl, (x0 + x1) / 2, 2.7, z1); const t = box(x1 - x0, .02, z1 - z0, mat({ color: 0xf8f8f4, transparent: true, opacity: .55, side: THREE.DoubleSide }), (x0 + x1) / 2, 2.85, (z0 + z1) / 2); t.rotation.x = -.1; };
  void pergola;
  /* (10.109, d'après la photo) au bout, côté Yéti : la véranda rouge du Yéti, la pergola blanche à toile rayée bleu et blanc de la pizzeria, puis le grand chapiteau bleu
     « RESTAURANT LA PICORAILLE » sous la résidence, sa terrasse de planches et sa bordure, ses tables blanches et ses chaises grises, le parasol Affligem ; un banc de bois sur le gravier */
  const LP = LIGNES.find(l => l.o.pergola);
  { const blanc = mat({ color: 0xf4f4f2, roughness: .4, metalness: .15 }), gris = mat({ color: 0x6e7074, roughness: .6 }), tabB = mat({ color: 0xf2f2f0, roughness: .35 }), noirP = mat({ color: 0x2a2a2a });
    const terrasse = (x0, x1, z0, z1) => { const d = add(new THREE.PlaneGeometry(x1 - x0, z1 - z0), mat({ map: deckT, roughness: .8 }), (x0 + x1) / 2, .09, (z0 + z1) / 2); d.rotation.x = -Math.PI / 2; box(x1 - x0, .16, .18, mat({ color: 0x8a4a32, roughness: .8 }), (x0 + x1) / 2, .08, z1); };
    const chaiseG = (x, z, ry, m) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g); const a = new THREE.Mesh(new THREE.BoxGeometry(.44, .05, .42), m); a.position.y = .45; g.add(a); for (let k = 0; k < 4; k++) { const l = new THREE.Mesh(new THREE.BoxGeometry(.06, .5, .03), m); l.position.set(-.15 + k * .1, .74, -.2); l.rotation.x = -.15; g.add(l); } for (const [dx, dz] of [[-.19, -.17], [.19, -.17], [-.19, .17], [.19, .17]]) { const l = new THREE.Mesh(new THREE.BoxGeometry(.04, .45, .04), m); l.position.set(dx, .22, dz); g.add(l); } };
    const tables = (x0, x1, z0, z1, mC) => { let k = 0; for (let x = x0 + .9; x < x1 - .6; x += 1.8) for (let z = z0 + .9; z < z1 - .6; z += 1.7) { box(.75, .04, .75, tabB, x, .74, z); cyl(.03, .03, .72, noirP, x, .37, z, 5); for (const sg of [-1, 1]) chaiseG(x, z + sg * .55, sg < 0 ? 0 : Math.PI, mC[k++ % mC.length]); OB.push([x, z, .7]); } };
    // la véranda rouge du Yéti : le toit rouge en pente, les poteaux blancs, le vitrage, les chaises rouges et blanches dedans
    { const x0 = 67.2, x1 = 81.6, z0 = .2, z1 = 6.4; terrasse(x0, x1, z0, z1 + .2); const tr = box(x1 - x0 + .4, .1, z1 - z0 + .6, mat({ color: 0xd01c22, roughness: .6 }), (x0 + x1) / 2, 2.9, (z0 + z1) / 2); tr.rotation.x = -.12;
      for (let x = x0; x <= x1 + .01; x += (x1 - x0) / 4) { cyl(.07, .07, 2.6, blanc, x, 1.3, z1, 8); OB.push([x, z1, .3]); } box(x1 - x0, .14, .14, blanc, (x0 + x1) / 2, 2.6, z1);
      const vg = mat({ color: 0xdcecf0, roughness: .05, transparent: true, opacity: .25, depthWrite: false }); box(x1 - x0, 1.9, .03, vg, (x0 + x1) / 2, 1.5, z1); box(.03, 2, z1 - z0, vg, x1, 1.4, (z0 + z1) / 2);
      tables(x0, x1, z0, z1, [mat({ color: 0xd02a26 }), mat({ color: 0xf2f2f2 })]); }
    // la pergola blanche de la pizzeria, sa toile rayée bleu et blanc, « BAR PIZZERIA » sur la poutre
    { const x0 = LP.x0 + .2, x1 = LP.x1 - .2, z0 = .2, z1 = 6.2; terrasse(x0, x1, z0, z1 + .2);
      const rayT = tT(256, 64, (c, w, h) => { for (let x = 0; x < w; x += 32) { c.fillStyle = (x / 32) % 2 ? "#f2f2f2" : "#2a5ab8"; c.fillRect(x, 0, 32, h); } });
      const ty = box(x1 - x0, .04, z1 - z0 + .4, mat({ map: rayT, roughness: .8, side: THREE.DoubleSide }), (x0 + x1) / 2, 2.85, (z0 + z1) / 2); ty.rotation.x = -.08;
      for (let x = x0; x <= x1 + .01; x += (x1 - x0) / 3) { cyl(.07, .07, 2.7, blanc, x, 1.35, z1, 8); OB.push([x, z1, .3]); }
      const pzT = tT(512, 64, (c, w, h) => { c.fillStyle = "#f4f4f2"; c.fillRect(0, 0, w, h); c.fillStyle = "#2a5ab8"; c.font = `bold 40px ${sans}`; c.textAlign = "center"; c.fillText("BAR       PIZZERIA", w / 2, 46); });
      add(new THREE.PlaneGeometry(x1 - x0, .42), mat({ map: pzT }), (x0 + x1) / 2, 2.62, z1 + .08); tables(x0, x1, z0, z1, [gris]); }
    // le grand chapiteau bleu de La Picoraille : le toit bleu à deux pans, l'armature blanche, le lambrequin « RESTAURANT LA PICORAILLE », le panneau blanc au bout
    { const x1 = LP.x0 - .1, x0 = x1 - 13, z0 = .2, z1 = 7.2, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2; terrasse(x0 - 1, x1, z0, z1 + .3);
      const bleu = mat({ color: 0x1f5ec8, roughness: .55, side: THREE.DoubleSide });
      for (const sg of [-1, 1]) { const pan = box(x1 - x0 + .3, .04, (z1 - z0) / 2 + .5, bleu, cx, 3.3, cz + sg * (z1 - z0) / 4); pan.rotation.x = sg * .22; }
      for (let x = x0; x <= x1 + .01; x += (x1 - x0) / 4) { for (const z of [z0 + .2, z1]) cyl(.08, .08, 2.9, blanc, x, 1.45, z, 8); OB.push([x, z1, .35]); } box(x1 - x0, .16, .16, blanc, cx, 2.9, z1);
      const piT = tT(1024, 96, (c, w, h) => { c.fillStyle = "#1f5ec8"; c.fillRect(0, 0, w, h); c.fillStyle = "#fff"; c.fillRect(0, h - 8, w, 8); c.font = `bold 52px ${sans}`; c.textAlign = "center"; c.fillText("RESTAURANT        LA  PICORAILLE", w / 2, 64); });
      add(new THREE.PlaneGeometry(x1 - x0, .75), lum(mat({ map: piT, emissive: 0xffffff, emissiveMap: piT, emissiveIntensity: .12 }), .12, .8), cx, 3.2, z1 + .16);
      box(.05, 2.9, z1 - z0, mat({ color: 0xf2f2f0, transparent: true, opacity: .75, roughness: .6 }), x1, 1.45, cz);   // le panneau blanc, au bout
      tables(x0, x1, z0, z1, [gris]);
      // le parasol Affligem, bleu nuit
      const afT = tT(256, 64, (c, w, h) => { c.fillStyle = "#1c2c50"; c.fillRect(0, 0, w, h); c.fillStyle = "#fff"; c.font = `italic bold 34px ${serif}`; c.textAlign = "center"; c.fillText("Affligem", w / 2, 44); });
      cyl(.05, .05, 2.9, mat({ color: 0xd8d8d8 }), x0 - .2, 1.45, z1 - .6, 6); const pa = add(new THREE.ConeGeometry(2, .55, 4, 1, true), mat({ map: afT, side: THREE.DoubleSide, roughness: .8 }), x0 - .2, 2.95, z1 - .6); pa.rotation.y = Math.PI / 4; OB.push([x0 - .2, z1 - .6, .4]); }
    // le banc de bois sur le gravier, devant
    { const bx = LP.x0 - 6, bz = 9.4; for (let k = 0; k < 3; k++) box(1.9, .05, .12, boisC, bx, .46, bz - .14 + k * .14); for (let k = 0; k < 2; k++) box(1.9, .14, .04, boisC, bx, .68 + k * .2, bz - .3); for (const sx of [-.8, .8]) box(.08, .46, .5, mat({ color: 0x2a2a2a, metalness: .4 }), bx + sx, .23, bz - .05); OB.push([bx, bz, 1]); } }

  /* ---------- le mobilier de la promenade : les lampadaires verts à deux lanternes, les bacs rouges et leurs arbres, les jardinières, les bancs, les tables ---------- */
  const vertL = mat({ color: 0x8aa898, roughness: .45, metalness: .4 }), verreL = lum(mat({ color: 0xf2f0e0, emissive: 0xffe0a0, emissiveIntensity: .05, transparent: true, opacity: .9 }), .05, 2.4), HALO = [];
  const lampadaire = (x, z) => { cyl(.07, .1, 4.6, vertL, x, 2.3, z, 8); cyl(.16, .2, .4, vertL, x, .2, z, 8);
    for (const s of [-1, 1]) { const b = add(new THREE.TorusGeometry(.5, .04, 6, 12, Math.PI * .9), vertL, x + s * .5, 4.4, z); b.rotation.z = s > 0 ? 0 : Math.PI; if (s < 0) b.rotation.y = Math.PI; const l = add(new THREE.CylinderGeometry(.24, .1, .55, 4), verreL, x + s * 1.0, 4.1, z); l.rotation.y = Math.PI / 4; add(new THREE.ConeGeometry(.3, .2, 4), vertL, x + s * 1.0, 4.45, z).rotation.y = Math.PI / 4; HALO.push([x + s, 4.1, z]); }
    OB.push([x, z, .3]); };
  for (let x = -36; x < 82; x += 13) lampadaire(x, 7.3);
  const rougeP = mat({ color: 0xd84838, roughness: .5 }), feuilleM = [mat({ color: 0x4a7a2a }), mat({ color: 0x5a8a34 }), mat({ color: 0x3a6a24 })];
  const bacArbre = (x, z, pin) => { cyl(.65, .45, .55, rougeP, x, .3, z, 14); cyl(.04, .06, 2.4, mat({ color: 0x8a7a6a }), x, 1.5, z, 6); for (let k = 0; k < 4; k++) add(new THREE.IcosahedronGeometry(pin ? .55 : .5, 0), feuilleM[k % 3], x + (al() - .5) * .5, 2.3 + al() * .7, z + (al() - .5) * .5); OB.push([x, z, .8]); };
  void bacArbre;   // (10.100 : les accessoires retirés — l'administrateur les redemande un par un, par les notes)
  const fleurM = [0xe8306a, 0xf090b0, 0xffffff, 0xe85a2a].map(c2 => mat({ color: c2 }));
  const jardiniere = (x, z) => { box(1.8, .45, .7, boisC, x, .23, z); for (let k = 0; k < 14; k++) add(new THREE.IcosahedronGeometry(.13 + al() * .08, 0), fleurM[k % 4], x - .8 + al() * 1.6, .55 + al() * .2, z + (al() - .5) * .5); OB.push([x, z, 1]); };
  void jardiniere;
  const banc = (x, z, ry = 0) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g); for (let k = 0; k < 3; k++) { const l = new THREE.Mesh(new THREE.BoxGeometry(1.8, .05, .12), boisC); l.position.set(0, .45, -.15 + k * .14); g.add(l); } for (let k = 0; k < 2; k++) { const l = new THREE.Mesh(new THREE.BoxGeometry(1.8, .12, .04), boisC); l.position.set(0, .65 + k * .16, -.25); g.add(l); } for (const s of [-.75, .75]) { const p = new THREE.Mesh(new THREE.BoxGeometry(.06, .45, .45), boisC); p.position.set(s, .22, 0); g.add(p); } OB.push([x, z, .9]); return g; };
  const BANCS = []; void banc;
  // les tables de pique-nique du Yéti, les tables de la terrasse des Roches Blanches
  const pique = (x, z) => { box(1.8, .06, .7, boisC, x, .74, z); for (const s of [-1, 1]) { box(1.8, .05, .26, boisC, x, .44, z + s * .55); box(.08, .74, .08, boisC, x + .75, .37, z + s * .25); box(.08, .74, .08, boisC, x - .75, .37, z + s * .25); } OB.push([x, z, 1.1]); };
  void pique;
  const TABLES = [], nappeM = mat({ color: 0xc8202a }), chaiseM = mat({ color: 0x8a5a32 });
  const table = (x, z) => { cyl(.4, .4, .04, nappeM, x, .74, z, 14); cyl(.04, .05, .72, mat({ color: 0x222222 }), x, .37, z, 6); for (const s of [-1, 1]) { box(.42, .05, .42, chaiseM, x + s * .62, .46, z); box(.05, .5, .42, chaiseM, x + s * .85, .72, z); } TABLES.push([x, z]); OB.push([x, z, 1.1]); };
  void table;
  // les voitures garées sur le gravier
  const voiture = (x, z, ry, coul) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g); const c = mat({ color: coul, roughness: .25, metalness: .5 }), vit = mat({ color: 0x1a2228, roughness: .1, metalness: .4 }), pn = mat({ color: 0x141414 });
    const b = new THREE.Mesh(new THREE.BoxGeometry(1.8, .7, 4.3), c); b.position.y = .62; g.add(b); const h = new THREE.Mesh(new THREE.BoxGeometry(1.6, .6, 2.3), vit); h.position.set(0, 1.25, -.2); g.add(h); const t = new THREE.Mesh(new THREE.BoxGeometry(1.62, .06, 2.1), c); t.position.set(0, 1.56, -.2); g.add(t);
    for (const [a, z2] of [[-.85, 1.35], [.85, 1.35], [-.85, -1.35], [.85, -1.35]]) { const r = new THREE.Mesh(new THREE.CylinderGeometry(.33, .33, .22, 14), pn); r.rotation.z = Math.PI / 2; r.position.set(a, .33, z2); g.add(r); }
    const fr = lum(mat({ color: 0xa01010, emissive: 0xff2020, emissiveIntensity: 0 }), 0, .4); for (const s of [-.65, .65]) { const f = new THREE.Mesh(new THREE.BoxGeometry(.3, .12, .04), fr); f.position.set(s, .8, -2.16); g.add(f); }
    OB.push([x + Math.sin(ry) * 1.3, z + Math.cos(ry) * 1.3, 1.2], [x, z, 1.2], [x - Math.sin(ry) * 1.3, z - Math.cos(ry) * 1.3, 1.2]); };
  if (false) [[-30, 11, 0x1a1a24], [-24, 11, 0x5a6470], [-6, 11.5, 0x1a1a1a], [-2.6, 11.5, 0x6a7480], [12, 11.5, 0xe8e8e8], [16, 11.5, 0x9aa0a8], [36, 11.5, 0x3a3a3a], [48, 11.5, 0xe8e8e8], [52, 11.5, 0x8a8a8a]].forEach(([x, z, c2], i) => voiture(x, z, i % 2 ? Math.PI : 0, c2));
  // la camionnette blanche du Yéti
  void voiture;   // (les voitures : retirées pour le moment)

  /* ---------- les arbres : les bouleaux, les mélèzes, les épicéas, à droite au bout et derrière la piscine ---------- */
  const ecorceB = mat({ color: 0xe8e4dc, roughness: .8 }), bouleauM = [mat({ color: 0x8aa04a }), mat({ color: 0xa8b04a }), mat({ color: 0x7a9a3a })], sapinM = mat({ color: 0x2a4a2a, roughness: .9 }), melezeM = mat({ color: 0x6a8a3a });
  const bouleau = (x, z, h = 9) => { cyl(.12, .2, h, ecorceB, x, h / 2, z, 7); for (let k = 0; k < 6; k++) { const s = add(new THREE.IcosahedronGeometry(1.4 + al(), 0), bouleauM[k % 3], x + (al() - .5) * 2.6, h * .55 + al() * h * .45, z + (al() - .5) * 2.6); s.scale.y = 1.4; } OB.push([x, z, .5]); };
  const sapin = (x, z, h = 12, m = sapinM) => { cyl(.18, .3, h * .3, mat({ color: 0x4a3424 }), x, h * .15, z, 6); for (let k = 0; k < 4; k++) add(new THREE.ConeGeometry(h * (.26 - k * .05), h * .4, 8), m, x, h * (.3 + k * .18), z); OB.push([x, z, .6]); };
  for (const [x, z] of [[88, 4], [91, 9], [86, 12], [95, 2]]) bouleau(x, z, 9 + al() * 3);
  for (const [x, z, h] of [[93, -6, 14], [98, 6, 12], [-90, -16, 11], [-92, 20, 13], [-40, -14, 12], [24, -18, 15]]) sapin(x, z, h, al() < .4 ? melezeM : sapinM);
  for (let k = 0; k < 14; k++) sapin(-130 + k * 18 + al() * 6, -78 - al() * 30, 14 + al() * 8);   // la forêt, derrière les tours

  /* ---------- l'arrêt du car (pour revenir à Paris) ---------- */
  L.arretCar = { x: 26, z: 13.8 };
  L.portails.push({ dans: (x, z) => estAdmin() && Math.hypot(x - 57.5, z - 15) < .6, seuil: [57.5, 15], vers: "grande", arrivee: [-4.6, 9], yaw: Math.PI / 2, violet: true, pasApo: true });   // (le cercle violet, à côté de la piscine : retour à la cour d'honneur)   // (l'arrêt du car : sans abri pour le moment — on y prend le car pour rentrer)

  /* ---------- les vacanciers : ceux qui se promènent sur le platelage, ceux qui boivent un verre en terrasse, ceux qui se reposent sur les bancs ---------- */
  const PE = ["#f0c9a6", "#c78f62", "#e8bd95", "#8d5a3b", "#f6d6bc", "#6a4028"], HA = ["#d83a3a", "#2a5ac8", "#f0c020", "#3a3a40", "#5ab05a", "#e8e2d6", "#e86a2a", "#7a3a8a"];
  const gens = (k) => { const f = k % 2 === 1; return personne3D({ taille: f ? 1.64 : 1.76, peau: PE[k % 6], ch: ["#2a1a12", "#5a3a22", "#141010", "#8a8a8a", "#e2c27a"][k % 5], haut: HA[k % 8], bas: ["#26324e", "#2a2a30", "#3a3028", "#5a6a7a"][k % 4], chaussures: ["#1a1a1a", "#e8e8e8"][k % 2], coif: f ? (k % 3 ? "long" : "carre") : k % 4 ? "court" : "chauve", pantalon: !f || k % 3 === 0, robe: f && k % 3 !== 0, parle: k % 3 === 0 }); };
  const GENS = !PETIT || true, MARCH = [], ASSIS = [];
  const ROUTES = [[[-38, 5.5], [64, 5.5]], [[-36, 3.2], [62, 3.2]], [[64, 6.2], [-38, 6.2]], [[-30, 9], [60, 9.5], [80, 10], [80, 4]], [[-60, 15.5], [-20, 15.5], [-20, 8.5]]];
  const nM = 0;   // (les vacanciers : retirés pour le moment)
  for (let k = 0; k < nM; k++) { const R = ROUTES[k % ROUTES.length], m = gens(k * 3 + 1), i0 = 0, u = al(), a = R[0], b = R[1]; m.position.set(a[0] + (b[0] - a[0]) * u, 0, a[1] + (b[1] - a[1]) * u); m.userData.poser("marche", 0); scene.add(m); MARCH.push({ m, R, i: 1, sens: 1, v: .8 + (k % 5) * .12 }); void i0; }
  const nA = 0;
  for (let k = 0; k < Math.min(nA, TABLES.length * 2); k++) { const [x, z] = TABLES[k >> 1], s = k % 2 ? 1 : -1, m = gens(k * 5 + 2); m.position.set(x + s * .62, .5 - m.userData.hipY, z); m.rotation.y = s > 0 ? -Math.PI / 2 : Math.PI / 2; m.userData.poser("assis", 0); scene.add(m); ASSIS.push({ m, k }); }
  for (const [k, [x, z]] of BANCS.slice(0, 0).entries()) { const m = gens(k * 7 + 4); m.position.set(x + (k % 2 ? .4 : -.4), .49 - m.userData.hipY, z); m.userData.poser("assis", 0); scene.add(m); ASSIS.push({ m, k: k + 40 }); }

  /* ---------- les limites : la promenade, le parking, le tour de la piscine, la terrasse du Yéti ---------- */
  const CASES = new Map(); for (const o of OB) { const [a, b, r] = o; for (let i = Math.floor((a - r) / 2); i <= Math.floor((a + r) / 2); i++) for (let j = Math.floor((b - r) / 2); j <= Math.floor((b + r) / 2); j++) { const k = i * 4096 + j; (CASES.get(k) || CASES.set(k, []).get(k)).push(o); } }
  const libre = (x, z) => { const l = CASES.get(Math.floor(x / 2) * 4096 + Math.floor(z / 2)); if (l) for (const [a, b, r] of l) if ((x - a) ** 2 + (z - b) ** 2 < r * r) return false; return true; };
  L.limites = (x, z) => libre(x, z) && ((x > -60.2 && x < 96 && z > 7.6 && z < 34) || (x > -84 && x < -50 && z >= 10.75 && z < 21) || (x > -60.2 && x < -48.2 && z > -22 && z < 7.6)  || (x > -84 && x < -60 && z > -22 && z < -10.8) || (x > -38.6 && x < 82 && z > .5 && z < 7.6) || (x > -71.5 && x < -40.5 && z > 14 && z < 16.4) || (x > -12.6 && x < -9.8 && z > .3 && z < 1.1));
  L.hauteur = (x, z) => { const ox = -x; if (ox < -60.5 && z < 10.2 && z > -10) return YP;  return HP(ox, z); };
  L.depart = [54.5, 15]; L.taille = 1.85; L.suivi = { d: 6.5, h: 4.5, av: 3, vy: 2 }; L.fov = [60, 72];
  L.zone = [-73, 98, -2, 18]; L.cam = { pos: [26, 5, 24], vise: [26, 3, 0] }; L.sansMusique = true;

  /* ---------- le soir : les fenêtres qui s'allument, les lampadaires, le halo des lanternes ---------- */
  { const hT = tT(64, 64, (c) => { const g = c.createRadialGradient(32, 32, 1, 32, 32, 31); g.addColorStop(0, "rgba(255,236,190,1)"); g.addColorStop(.3, "rgba(255,190,110,.5)"); g.addColorStop(1, "rgba(255,150,70,0)"); c.fillStyle = g; c.fillRect(0, 0, 64, 64); });
    const pos = new Float32Array(HALO.length * 3); HALO.forEach(([x, y, z], i) => pos.set([-x, y, z], i * 3));   /* (déjà retournée)*/ const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const hM = new THREE.PointsMaterial({ map: hT, size: 2.6, sizeAttenuation: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0, fog: false }), pts = new THREE.Points(geo, hM); pts.frustumCulled = false; pts.visible = false; scene.add(pts);
    const amb = new THREE.AmbientLight(0xff9a50, 0); scene.add(amb);
    NUIT.push([{ set emissiveIntensity(v) { pts.visible = v > 0; hM.opacity = v; amb.intensity = v * .4; } }, 0, 1]); }

  /* ---------- l'animation ---------- */
  let nV = null, tp = 0;
  const a0 = L.anim; L.anim = (tm) => { try { a0 && a0(tm); } catch (e) {} const n = !!L.nuit; if (n !== nV) { nV = n; for (const [m, j, nn] of NUIT) m.emissiveIntensity = n ? nn : j; }
    const dt = tp ? Math.min(.1, (tm - tp) / 1000) : 0; tp = tm; const c = M && M.camera && M.camera.position, R2 = ((MOBILE || GPU_MODESTE) ? 30 : 60) ** 2;
    for (const W of MARCH) try { const m = W.m, [tx, tz] = W.R[W.i], dx = tx - m.position.x, dz = tz - m.position.z, d = Math.hypot(dx, dz);
      if (d < .15) { if (W.i + W.sens < 0 || W.i + W.sens >= W.R.length) W.sens = -W.sens; W.i += W.sens; continue; }
      const v = Math.min(d, W.v * dt); m.position.x += dx / d * v; m.position.z += dz / d * v; m.rotation.y = Math.atan2(dx, dz); if (!c || (m.position.x - c.x) ** 2 + (m.position.z - c.z) ** 2 < R2) m.userData.poser("marche", tm * W.v / 1.2); } catch (e) {}
    for (const T of TS) for (let i = 0; i < T.nS; i++) { const u = ((tm / 1000 * 2.2 / T.tot) + i / T.nS) % 1, mont = u < .5, v = mont ? u * 2 : (1 - u) * 2, p = T.placer(Math.min(.999, v), mont ? 1 : -1), c2 = T.S[i]; c2.position.set(-p[0], p[1], p[2]); c2.rotation.y = -(T.dir + (mont ? 0 : Math.PI)); }   // (les sièges qui tournent)
    for (const { m, k } of ASSIS) try { if (c && (m.position.x - c.x) ** 2 + (m.position.z - c.z) ** 2 > R2) continue; const P = m.userData.parts, b = (tm / 1000 + k * 1.7) % 7; m.userData.poser("assis", tm); if (b < 1.3) { P.bras[1].e.rotation.x = -1.3; P.bras[1].c.rotation.x = -1.9; } else { P.bras[1].e.rotation.x = -.7; P.bras[1].c.rotation.x = -.9; } } catch (e) {} };

  /* (10.99) d'après les photos du chemin : face aux immeubles, la piscine est à droite et le Yéti à gauche — tout est retourné de gauche à droite (les enseignes restent à l'endroit) */
  { const mir = new Set(TS.flatMap(T => T.S)); for (const o of scene.children) { if (mir.has(o) || o.isLight || o === L.sol) continue; o.position.x = -o.position.x; const q = o.quaternion; q.set(q.x, -q.y, -q.z, q.w); }
    const lim0 = L.limites; L.limites = (x, z) => lim0(-x, z); L.arretCar.x = -L.arretCar.x; L.depart = [54.5, 15]; L.zone = [-98, 73, -2, 40]; L.cam = { pos: [-26, 5, 24], vise: [-26, 3, 0] };
    for (const W of MARCH) for (const pt of W.R) pt[0] = -pt[0]; }
  /* (10.100) le carnet de chantier de l'administrateur : il pose le doigt (ou clique) sur un endroit, il écrit ce qu'il y veut ; la note reste là, numérotée,
     gardée par le serveur ; « Copier » met toutes les notes dans le presse-papier, pour les donner à Claude */
  { const NOTES = new THREE.Group(); NOTES.userData.anime = true; scene.add(NOTES); let mode = false, liste = [];
    const C = M.ctx.conteneur, barre = document.createElement("div"); barre.style.cssText = "position:absolute;left:10px;top:120px;z-index:40;display:flex;flex-direction:column;gap:6px";
    const bt = (txt, f) => { const b = document.createElement("button"); b.type = "button"; b.textContent = txt; b.style.cssText = "padding:9px 12px;border:0;border-radius:12px;background:rgba(40,20,70,.88);color:#fff;font:600 14px Lato,Arial,sans-serif;box-shadow:0 2px 10px rgba(0,0,0,.4);cursor:pointer;text-align:left"; b.onclick = (e) => { e.stopPropagation(); f(b); }; barre.appendChild(b); return b; };
    const bNote = bt("📝 Poser une note", (b) => { mode = !mode; b.textContent = mode ? "👆 Touche l'endroit…  (annuler)" : "📝 Poser une note"; b.style.background = mode ? "rgba(150,60,220,.95)" : "rgba(40,20,70,.88)"; });
    bt("📋 Voir / copier les notes", () => voir());
    const fini = () => { mode = false; bNote.textContent = "📝 Poser une note"; bNote.style.background = "rgba(40,20,70,.88)"; };
    const etiquette = (n, txt) => { const c = document.createElement("canvas"); c.width = 256; c.height = 96; const x = c.getContext("2d"); x.fillStyle = "rgba(60,20,110,.92)"; x.beginPath(); x.roundRect(4, 4, 248, 88, 18); x.fill(); x.strokeStyle = "#e0c0ff"; x.lineWidth = 4; x.stroke();
      x.fillStyle = "#fff"; x.font = "bold 40px Arial"; x.fillText("📝 " + n, 16, 50); x.font = "18px Arial"; x.fillText(txt.length > 22 ? txt.slice(0, 21) + "…" : txt, 16, 80); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
    L.majNotes = (ns) => { liste = ns || []; for (const o of [...NOTES.children]) { NOTES.remove(o); o.traverse(q => { if (q.material) { if (q.material.map) q.material.map.dispose(); q.material.dispose(); } if (q.geometry) q.geometry.dispose(); }); }
      liste.forEach((N, i) => { const g = new THREE.Group(); g.position.set(N.x, N.y, N.z); g.userData.note = N;
        const tige = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, 1.6, 6), new THREE.MeshBasicMaterial({ color: 0xb070ff })); tige.position.y = .8; g.add(tige); const pt = new THREE.Mesh(new THREE.SphereGeometry(.12, 10, 8), new THREE.MeshBasicMaterial({ color: 0xb070ff })); g.add(pt);
        const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: etiquette(i + 1, N.texte), depthTest: false })); sp.scale.set(2.4, .9, 1); sp.position.y = 2.1; sp.renderOrder = 9; sp.userData.note = N; g.add(sp); NOTES.add(g); }); };
    if (M.notesCorbier) L.majNotes(M.notesCorbier);
    const texte = (n) => liste.map((N, i) => `${i + 1}. [x ${N.x}, z ${N.z}, hauteur ${N.y}] ${N.texte}`).join("\n");
    const voir = (seule) => { const d = document.createElement("div"); d.style.cssText = "position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:60;width:min(92vw,520px);max-height:80vh;overflow:auto;background:rgba(24,12,44,.97);color:#fff;border-radius:16px;padding:16px;font:14px Lato,Arial,sans-serif;box-shadow:0 10px 40px rgba(0,0,0,.6)";
      const h = document.createElement("div"); h.style.cssText = "font-weight:700;font-size:16px;margin-bottom:10px"; h.textContent = seule ? "📝 Note" : `📝 Les notes du Corbier (${liste.length})`; d.appendChild(h);
      for (const [i, N] of liste.entries()) { if (seule && N !== seule) continue; const r = document.createElement("div"); r.style.cssText = "display:flex;gap:8px;align-items:flex-start;padding:8px 0;border-top:1px solid rgba(255,255,255,.12)";
        const t = document.createElement("div"); t.style.flex = "1"; t.innerHTML = `<b>${i + 1}.</b> `; t.appendChild(document.createTextNode(N.texte)); r.appendChild(t);
        const x = document.createElement("button"); x.type = "button"; x.textContent = "🗑"; x.title = "Supprimer"; x.style.cssText = "border:0;border-radius:8px;background:rgba(255,80,80,.25);color:#fff;padding:4px 8px;cursor:pointer"; x.onclick = () => { if (confirm("Supprimer la note " + (i + 1) + " ?")) { envoyerWS({ t: "note_corbier_suppr", id: N.id }); d.remove(); } }; r.appendChild(x); d.appendChild(r); }
      if (!liste.length) { const v = document.createElement("div"); v.style.opacity = ".7"; v.textContent = "Aucune note pour l'instant : touche « 📝 Poser une note », puis l'endroit."; d.appendChild(v); }
      const pied = document.createElement("div"); pied.style.cssText = "display:flex;gap:8px;margin-top:12px";
      if (!seule && liste.length) { const cp = document.createElement("button"); cp.type = "button"; cp.textContent = "📋 Copier toutes les notes"; cp.style.cssText = "flex:1;padding:10px;border:0;border-radius:10px;background:#8a3ae0;color:#fff;font-weight:700;cursor:pointer"; cp.onclick = async () => { const tx = "Notes du Corbier :\n" + texte(); try { await navigator.clipboard.writeText(tx); cp.textContent = "✅ Copié — colle-le à Claude"; } catch (e) { const ta = document.createElement("textarea"); ta.value = tx; ta.style.cssText = "width:100%;height:140px;margin-top:8px"; d.insertBefore(ta, pied); ta.select(); cp.textContent = "Sélectionne et copie le texte ci-dessus"; } }; pied.appendChild(cp); }
      const f = document.createElement("button"); f.type = "button"; f.textContent = "Fermer"; f.style.cssText = "flex:1;padding:10px;border:0;border-radius:10px;background:rgba(255,255,255,.14);color:#fff;cursor:pointer"; f.onclick = () => d.remove(); pied.appendChild(f); d.appendChild(pied); C.appendChild(d); };
    // le toucher : en mode note, on vise l'endroit (le sol, un mur, un toit…) ; hors mode, toucher une étiquette l'ouvre
    const ray = new THREE.Raycaster(), cv = M.rendu.domElement; let dn = null;
    const viser = (e) => { const r = cv.getBoundingClientRect(), v = new THREE.Vector2((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(v, M.camera); return ray; };
    const pd = (e) => { if (!M || M.L !== L) return; dn = { x: e.clientX, y: e.clientY }; if (mode) { e.stopImmediatePropagation(); e.preventDefault(); } };
    const pu = (e) => { if (!M || M.L !== L || !dn) return; const bouge = Math.hypot(e.clientX - dn.x, e.clientY - dn.y) > 10; dn = null; if (bouge) return;
      if (!mode) { const h = viser(e).intersectObjects(NOTES.children, true).find(h => h.object.userData.note); if (h) { e.stopImmediatePropagation(); voir(h.object.userData.note); } return; }
      e.stopImmediatePropagation(); e.preventDefault(); const hits = viser(e).intersectObjects(scene.children, true).filter(h => h.object.isMesh && h.object.visible && !NOTES.children.some(g => g === h.object.parent) && !(h.object.material && h.object.material.transparent && h.object.material.opacity < .3));
      const h = hits[0]; if (!h) return; const p = h.point; fini();
      setTimeout(() => { const tx = prompt("📝 Qu'est-ce que je dois mettre ici ?"); if (tx && tx.trim()) envoyerWS({ t: "note_corbier", x: p.x, y: p.y, z: p.z, texte: tx.trim() }); }, 30); };
    for (const [ev, f] of [["pointerdown", pd], ["pointerup", pu]]) cv.addEventListener(ev, f, true);
    const clicStop = (e) => { if (M && M.L === L && mode) e.stopImmediatePropagation(); }; cv.addEventListener("click", clicStop, true);
    const a1 = L.anim; L.anim = (tm) => { try { a1 && a1(tm); } catch (e) {} const ici = !!(M && M.L === L && !M.cine); if (ici && !barre.isConnected) { C.appendChild(barre); envoyerWS({ t: "notes_corbier" }); } else if (!ici && barre.isConnected) { barre.remove(); fini(); } };   // (la barre : seulement quand on est au Corbier)
    const veille = setInterval(() => { if (!M || M.L !== L) { if (barre.isConnected) { barre.remove(); fini(); } if (!M || (M.prets && !Object.values(M.prets).some(q => q && q.L === L) && M.L !== L)) { clearInterval(veille); cv.removeEventListener("pointerdown", pd, true); cv.removeEventListener("pointerup", pu, true); cv.removeEventListener("click", clicStop, true); } } }, 1500); }
  /* (fluidité) tout ce qui ne bouge pas est fondu en quelques pièces */
  { scene.updateMatrixWorld(true); for (const g of scene.children.slice()) { if (!g.isGroup || g.userData.poser || g.userData.parts || g.userData.anime) continue; const ms = []; g.traverse(o => { if (o.isMesh && !o.isSkinnedMesh) ms.push(o); }); for (const m of ms) scene.attach(m); if (!g.children.some(c => c.isMesh || c.isGroup || c.isLight)) scene.remove(g); } }
  fusionStatique(scene, L, 0);
}
({ construireCorbier })
