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
  L.sol = sol(-400, 400, -300, 400, mat({ map: herbeT, roughness: 1 }), -.02); L.solsPlus = [];
  L.solsPlus.push(sol(-42, 66, 0, 7, mat({ map: deckT, roughness: .8 }), .03), sol(-80, 100, 7, 17, mat({ map: gravT, roughness: 1 }), .01), sol(66, 84, 0, 8, mat({ map: dalleT, roughness: .8 }), .03), sol(-72, -40, 0, 2.3, mat({ color: 0xe6e2da, roughness: .7 }), .03), sol(-72, -40, 11.7, 14, mat({ color: 0xe6e2da, roughness: .7 }), .03), sol(-72, -66.2, 2.3, 11.7, mat({ color: 0xe6e2da, roughness: .7 }), .03), sol(-45.8, -40, 2.3, 11.7, mat({ color: 0xe6e2da, roughness: .7 }), .03));
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
  const HP = (x, z) => { if (z < 21) return 0; const t = Math.min(1, (z - 21) / 4), base = t * t * (3 - 2 * t) * 2.4; if (z < 25) return base;
    const d = z - 25; return base + d * .24 + Math.max(0, d - 120) * .18 + Math.sin(x * .013 + 1.2) * Math.min(1, d / 60) * 14 + Math.sin(x * .031 + z * .02) * Math.min(1, d / 40) * 5; };
  L.hautPiste = HP;
  { const g2 = new THREE.PlaneGeometry(700, 430, 90, 60); g2.rotateX(-Math.PI / 2); const p = g2.attributes.position, C = [];
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i) + 236; p.setZ(i, z - 236); p.setY(i, HP(-x, z)); const h = HP(-x, z), n = Math.sin(x * .07) * Math.sin(z * .05);
      const c2 = z < 25 ? [.42, .56, .24] : h > 40 ? [.62 + n * .05, .52, .3] : [.56 + n * .06, .54 + n * .04, .28]; C.push(...c2); }
    g2.setAttribute("color", new THREE.Float32BufferAttribute(C, 3)); g2.computeVertexNormals();
    const preT = tT(256, 256, (c, w, h) => { c.fillStyle = "#d8d0b0"; c.fillRect(0, 0, w, h); for (let i = 0; i < 3000; i++) { c.fillStyle = ["#c8c0a0", "#e8e0c0", "#b8b49a", "#d0d8b0"][i % 4]; c.fillRect(al() * w, al() * h, 2, 3); } }, 70, 40);
    const pente = new THREE.Mesh(g2, new THREE.MeshLambertMaterial({ vertexColors: true, map: preT }));   /* (l'herbe rase, roussie par l'automne) */ pente.position.set(0, .01, 236); pente.receiveShadow = true; scene.add(pente); }
  // la piste de gravier, au pied du talus ; le muret de rochers dans le talus
  L.solsPlus.push(sol(-80, 100, 18.6, 21.2, mat({ map: gravT, roughness: 1 }), .02));
  { const rocM = [mat({ color: 0xa8a49a, roughness: .9 }), mat({ color: 0x8a867e, roughness: .9 })]; for (let x = 40; x < 64; x += .9 + al() * .5) { const r = add(new THREE.DodecahedronGeometry(.45 + al() * .25, 0), rocM[(x * 3 | 0) % 2], x, HP(x, 22.6) + .1, 22.4); r.scale.set(1.3, .7, .8); r.rotation.y = al() * 3; } }
  if (false) { const mar = mat({ color: 0x8a7a64 }); for (let k = 0; k < 6; k++) box(1.6, .1, .25, mar, 30, HP(30, 21.3 + k * .6) + .05, 21.3 + k * .6); }   // (les marches de bois dans le talus)
  // les bosquets de sapins sur les pentes
  { const sapM = mat({ color: 0x24402a, roughness: .9 }); for (const [cx, cz, n] of [[-60, 150, 40], [-20, 170, 30], [70, 210, 30], [-140, 120, 26], [130, 130, 22], [20, 90, 8]]) for (let k = 0; k < (PETIT ? n / 3 : n); k++) { const x = cx + (al() - .5) * 50, z = cz + (al() - .5) * 40, h = 8 + al() * 7; add(new THREE.ConeGeometry(h * .27, h, 7), sapM, x, HP(x, z) + h / 2 - .5, z); } }
  // l'office du tourisme : la rotonde sous sa grande pyramide de poutres rouges et blanches, le chapeau blanc
  { const ox = 6, oz = 24.5, rouge = mat({ color: 0xa8342a, roughness: .6 }), blanc2 = mat({ color: 0xf2f0ea, roughness: .6 });
    cyl(4.4, 4.4, 3, mat({ color: 0xe8e2d4 }), ox, 1.5, oz, 24); const bd = add(new THREE.CylinderGeometry(4.6, 4.6, .8, 24, 1, true), mat({ color: 0x8a2a20, side: THREE.DoubleSide }), ox, 3.1, oz); void bd; cyl(4.8, 4.8, .2, blanc2, ox, 3.55, oz, 24);
    for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; const w = box(1.6, 1.8, .06, mat({ color: 0x9ab0b8, roughness: .1 }), ox + Math.sin(a) * 4.42, 1.4, oz + Math.cos(a) * 4.42); w.rotation.y = a; }
    const tT2 = tT(1024, 64, (c, w, h) => { c.fillStyle = "#8a2a20"; c.fillRect(0, 0, w, h); c.fillStyle = "#fff"; c.font = `bold 40px ${sans}`; c.textAlign = "center"; for (const x of [w / 4, w * 3 / 4]) c.fillText("CORBIER TOURISME", x, 46); });
    const bnd = add(new THREE.CylinderGeometry(4.62, 4.62, .8, 32, 1, true), mat({ map: tT2, side: THREE.DoubleSide }), ox, 3.1, oz); void bnd;
    const top = [ox, 12.5, oz]; for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2 + .5, bx = ox + Math.sin(a) * 6.5, bz = oz + Math.cos(a) * 6.5, A = new THREE.Vector3(bx, 0, bz), B = new THREE.Vector3(...top), d = B.clone().sub(A);
      for (const [m, off] of [[rouge, 0], [blanc2, .32]]) { const o = add(new THREE.BoxGeometry(.32, d.length(), .5), m, 0, 0, 0); o.position.copy(A).addScaledVector(d, .5); o.position.x += Math.cos(a) * off; o.position.z -= Math.sin(a) * off; o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); } OB.push([bx, bz, .6]); }
    add(new THREE.ConeGeometry(1.7, 2.6, 16), blanc2, ox, 12.4, oz); cyl(1.7, 1.7, .5, blanc2, ox, 11.1, oz, 16);
    for (let k = 0; k < 18; k++) { const a = k / 18 * Math.PI * 2; const f = add(new THREE.CylinderGeometry(.015, .015, 7.5, 3), mat({ color: 0xd8d8d8, metalness: .6 }), ox + Math.sin(a) * 1.4, 7.1, oz + Math.cos(a) * 1.4); f.rotation.z = Math.sin(a) * .35; f.rotation.x = -Math.cos(a) * .35; }   // les haubans
    OB.push([ox, oz, 4.8]); }
  // (l'aire de jeux, les bacs de fleurs du pré : retirés)
  // le portique rouge des Sybelles et ses tourniquets blancs
  { const rg = mat({ color: 0x9a2030, roughness: .5 }); box(.35, 3.2, .35, rg, 41, HP(41, 25) + 1.6, 26); box(.35, 2.4, .35, rg, 36, HP(36, 25) + 1.2, 26); const pt = box(5.6, .5, .6, rg, 38.5, HP(38, 25) + 3.0, 26); pt.rotation.z = .14;
    for (let k = 0; k < 6; k++) box(.25, 1, .25, mat({ color: 0xf2f2f0 }), 36.6 + k * .7, HP(38, 25) + .5, 26); box(1.3, 1.6, .1, mat({ color: 0x1a1a1a }), 34.5, HP(34, 25) + 1.6, 26.2); }
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
  telesiege(52, 27.5, .08, 300, true); telesiege(84, 31, -.1, 220, false); telesiege(-28, 34, .25, 180, false);
  // le chalet des remontées : le bardage de bois, le toit de tôle grise, les fenêtres, l'escalier
  { const cx = 64, cz = 29, y = HP(cx, cz); box(9, 3.4, 6, facR, cx, y + 1.7, cz); const r1 = box(5.4, .15, 7, mat({ color: 0x5a6068, metalness: .4, roughness: .5 }), cx - 2.3, y + 4.4, cz); r1.rotation.z = .55; const r2 = box(5.4, .15, 7, mat({ color: 0x5a6068, metalness: .4, roughness: .5 }), cx + 2.3, y + 4.4, cz); r2.rotation.z = -.55;
    for (let k = 0; k < 5; k++) box(1, 1.3, .06, mat({ color: 0x2a3a40, roughness: .2 }), cx - 3.4 + k * 1.7, y + 1.8, cz - 3.02); box(.9, .5, .06, mat({ color: 0x1a5aa8 }), cx + 1, y + 2.9, cz - 3.05); OB.push([cx, cz, 5]); }
  // la petite cabane du préposé, au pied du deuxième télésiège
  { const cx = 77, cz = 31, y = HP(cx, cz); box(3, 2.6, 2.6, facS, cx, y + 1.3, cz); const r = box(3.6, .12, 3.3, mat({ color: 0x4a5058, metalness: .4 }), cx, y + 2.85, cz); r.rotation.x = -.15; box(1.2, .8, .05, mat({ color: 0x9ab0b8, roughness: .1 }), cx + .4, y + 1.7, cz - 1.32); box(.9, 1.4, .9, mat({ color: 0xe8e8e2 }), cx - 2.2, y + .7, cz); }


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
  const RA = residence(-10, 66, 0, 3, facR); void RA;   // (la longue résidence, jusqu'au Yéti)

  /* ---------- à gauche : la piscine, la galerie Charvin, les tours ---------- */
  { const eau = mat({ color: 0x3aa8e0, roughness: .05, metalness: .1, emissive: 0x0a3a5a, emissiveIntensity: .25 });
    box(20, .4, 9, mat({ color: 0xe8f0f2 }), -56, -.2, 7); const e = add(new THREE.PlaneGeometry(19.4, 8.4), eau, -56, .06, 7); e.rotation.x = -Math.PI / 2;
    for (let k = 1; k < 5; k++) box(19.2, .01, .08, mat({ color: 0x1a5aa8 }), -56, .045, 2.8 + k * 1.7);   // les lignes d'eau, au fond
    for (const x of [-64, -48]) { box(.05, .8, .5, mat({ color: 0xc8ccd0, metalness: .9, roughness: .2 }), x, .4, 2.5); }   // les échelles
    OB.push(...Array.from({ length: 9 }, (_, i) => [-65 + i * 2.25, 7, 4.8]));
    const verreP = mat({ color: 0xd8e8ec, roughness: .05, transparent: true, opacity: .22 }), poteauP = mat({ color: 0x8a8e92, metalness: .6, roughness: .4 });
    for (let x = -71; x < -40; x += 2.4) { box(2.35, 1.6, .03, verreP, x + 1.2, .8, 13.2); box(.08, 2.4, .08, poteauP, x, 1.2, 13.2); }   // la clôture de verre, côté route
    box(32, .9, .4, mat({ color: 0xe8e2d8 }), -56, .45, 13.6);   // le muret blanc
    // la galerie Charvin : un étage de boutiques sous une terrasse de bois
    const gT = tT(1024, 128, (c, w, h) => { c.fillStyle = "#b8582a"; c.fillRect(0, 0, w, 50); c.fillStyle = "#f2efe6"; c.fillRect(20, 8, 190, 34); c.fillStyle = "#5a3a22"; c.font = `bold 24px ${serif}`; c.fillText("GALERIE CHARVIN", 28, 34);
      c.fillStyle = "#f2efe6"; c.fillRect(260, 8, 120, 34); c.fillRect(420, 8, 80, 34); c.fillStyle = "#5a3a22"; c.font = `bold 13px ${sans}`; c.fillText("AGENCE IMMOBILIÈRE", 266, 30); c.fillText("LOCATION", 428, 30);
      c.fillStyle = "#e85a2a"; c.fillRect(700, 6, 130, 38); c.fillStyle = "#fff"; c.font = `bold 22px ${sans}`; c.fillText("CORBIER", 718, 26); c.font = `bold 14px ${sans}`; c.fillText("FROMAGERIE", 722, 40);
      for (let k = 0; k < 8; k++) { const x = 10 + k * 126; c.fillStyle = "#c8d8dc"; c.fillRect(x, 56, 110, h - 60); c.fillStyle = "#5a3420"; c.fillRect(x - 6, 50, 6, h); } });
    add(new THREE.PlaneGeometry(31, 3.6), lum(mat({ map: gT, emissive: 0xffffff, emissiveMap: gT, emissiveIntensity: .08 }), .08, .6), -56, 1.8, -.98);
    box(31, 3.6, 10, facR, -56, 1.8, -6.05); box(31.4, .2, 11, boisC, -56, 3.7, -5.5); for (let x = -71.5; x <= -40.5; x += .9) box(.06, .9, .06, boisC, x, 4.2, -.2); box(31, .08, .1, boisC, -56, 4.65, -.2);   // la terrasse sur le toit, sa barrière
    // les grandes tours sombres derrière (Les Tours du Corbier)
    const tourT = tT(128, 256, (c, w, h) => { c.fillStyle = "#4a2418"; c.fillRect(0, 0, w, h); for (let y = 6; y < h; y += 18) { c.fillStyle = "#2a1610"; c.fillRect(0, y, w, 8); c.fillStyle = "#c8b8a0"; c.fillRect(0, y + 8, w, 2); for (let x = 4; x < w; x += 32) { c.fillStyle = "#1a1a20"; c.fillRect(x, y + 10, 24, 7); } } }, 3, 1);
    const tourM = lum(mat({ map: tourT, emissive: 0xffc890, emissiveMap: null, emissiveIntensity: 0 }), 0, .08);
    for (const [x, z, h, w] of [[-38, -46, 46, 16], [-8, -62, 52, 18], [-86, -30, 38, 14], [104, -36, 40, 15]]) { box(w, h, 14, tourM, x, h / 2, z); box(w + 1, 1.2, 15, mat({ color: 0x3a2014 }), x, h + .6, z); } }

  /* ---------- le bâtiment de l'École du Ski Français, la Fontaine de l'Ours ---------- */
  { residence(-39, -13, -3.2, 3, facG);
    const esf = tT(512, 96, (c, w, h) => { c.fillStyle = "#f2f2ee"; c.fillRect(0, 0, w, h); c.fillStyle = "#c8202a"; c.beginPath(); c.arc(40, 48, 30, 0, 7); c.fill(); c.fillStyle = "#1a3a8a"; c.font = `italic bold 40px ${sans}`; c.fillText("ÉCOLE DU SKI FRANÇAIS", 82, 60); });
    const s = add(new THREE.PlaneGeometry(9, 1.7), lum(mat({ map: esf, emissive: 0xffffff, emissiveMap: esf, emissiveIntensity: .1 }), .1, .8), -26, 4.9, -1.9); void s;
    const ours = tT(512, 96, (c, w, h) => { c.fillStyle = "#c8202a"; c.fillRect(0, 0, w, h); c.fillStyle = "#fff"; c.font = `italic bold 30px ${serif}`; c.fillText("Bar - Restaurant", 14, 60); c.font = `italic bold 38px ${serif}`; c.fillText("La Fontaine de l'Ours", 232, 60); });
    add(new THREE.PlaneGeometry(10, 1.4), lum(mat({ map: ours, emissive: 0xffffff, emissiveMap: ours, emissiveIntensity: .12 }), .12, .9), -25, 2.6, -2.15);
    const bas = tT(512, 160, (c, w, h) => { c.fillStyle = "#4a2a18"; c.fillRect(0, 0, w, h); for (let k = 0; k < 5; k++) { c.fillStyle = "#e8d8b0"; c.fillRect(10 + k * 100, 20, 88, h - 34); c.fillStyle = "rgba(90,50,30,.5)"; c.fillRect(30 + k * 100, h - 60, 50, 6); } });
    add(new THREE.PlaneGeometry(26, 1.9), lum(mat({ map: bas, emissive: 0xffffff, emissiveMap: bas, emissiveIntensity: .1 }), .1, .7), -26, .95, -3.18);
    // la terrasse de bois de la Fontaine de l'Ours, sa barrière de rondins
    box(26, .35, 3, boisC, -26, .17, -1.6); for (let x = -38.8; x <= -13.2; x += 1.6) box(.12, 1.0, .12, boisC, x, .85, -.15); for (const y of [.75, 1.25]) box(26, .1, .1, boisC, -26, y, -.15); }
  /* le chalet des crêpes : sa planche « CRÊPES », sa fenêtre de vente, son toit à lambrequins */
  { const cx = -13.2, cz = 2.6; box(4.2, 2.4, 3, mat({ color: 0xf0ead8 }), cx, 1.2, cz); const tt = box(5.2, .25, 4, mat({ color: 0x4a4a50 }), cx, 2.7, cz); tt.rotation.z = .08;
    const cT = tT(256, 64, (c, w, h) => { c.fillStyle = "#c8202a"; c.fillRect(0, 0, w, h); c.fillStyle = "#fff"; c.font = `bold 44px ${serif}`; c.textAlign = "center"; c.fillText("CRÊPES", w / 2, 48); });
    add(new THREE.PlaneGeometry(1.8, .45), mat({ map: cT }), cx - 1.0, 2.15, cz + 1.52); box(1.9, 1, .06, boisC, cx + .9, 1.6, cz + 1.52); box(1.6, .8, .02, mat({ color: 0x8aa0a8, roughness: .1 }), cx + .9, 1.6, cz + 1.55); box(2, .08, .4, boisC, cx + .9, 1.06, cz + 1.7);
    for (let x = cx - 2.5; x < cx + 2.6; x += .3) { const d = box(.16, .2, .04, boisC, x, 2.48, cz + 2.02); d.rotation.z = .3; }   // les lambrequins
    OB.push([cx - 1, cz, 1.6], [cx + 1, cz, 1.6]); }

  /* ---------- le Yéti, au bout : la salle basse, l'enseigne entre les deux Amstel, la pergola blanche, les tables de pique-nique sur les dalles ---------- */
  { const yT = tT(1024, 128, (c, w, h) => { c.fillStyle = "#5a2a18"; c.fillRect(0, 0, w, h); for (const [x, t] of [[60, "AMSTEL"], [420, "LE YETI"], [780, "AMSTEL"]]) { c.fillStyle = "#c8202a"; c.fillRect(x, 20, 220, 60); c.fillStyle = "#fff"; c.font = `bold 40px ${serif}`; c.textAlign = "center"; c.fillText(t, x + 110, 64); } });
    box(16, 3.6, 10, facS, 74.5, 1.8, -6); add(new THREE.PlaneGeometry(16, 1.2), lum(mat({ map: yT, emissive: 0xffffff, emissiveMap: yT, emissiveIntensity: .12 }), .12, .9), 74.5, 3.0, -.98);
    const yB = devantureT("Crêpes · Pizzas · Spécialités savoyardes", "#c8202a", "#ffffff", { motif: tables, serif: true }); add(new THREE.PlaneGeometry(16, 2.4), lum(mat({ map: yB, emissive: 0xffffff, emissiveMap: yB, emissiveIntensity: .12 }), .12, .75), 74.5, 1.2, -.98);
    box(16.4, .3, 11, mat({ color: 0x8a5a3a }), 74.5, 3.75, -5.8); }
  // les pergolas blanches (la pizzeria, le Yéti) : les poteaux, les chevrons, la toile
  const pergola = (x0, x1, z0, z1) => { const bl = mat({ color: 0xf2f2f2, roughness: .4, metalness: .2 });
    for (let x = x0; x <= x1 + .01; x += (x1 - x0) / Math.max(1, Math.round((x1 - x0) / 4))) { cyl(.06, .06, 2.7, bl, x, 1.35, z1, 8); OB.push([x, z1, .3]); const ch = box(.08, .08, z1 - z0 + .3, bl, x, 2.7 + (z1 - z0) * .05, (z0 + z1) / 2); ch.rotation.x = -.1; }
    box(x1 - x0, .08, .08, bl, (x0 + x1) / 2, 2.7, z1); const t = box(x1 - x0, .02, z1 - z0, mat({ color: 0xf8f8f4, transparent: true, opacity: .55, side: THREE.DoubleSide }), (x0 + x1) / 2, 2.85, (z0 + z1) / 2); t.rotation.x = -.1; };
  const LP = LIGNES.find(l => l.o.pergola); pergola(LP.x0 + .3, LP.x1 - .3, .3, 5.8); pergola(67, 81, .3, 6.5);

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
  for (const [x, z, h] of [[93, -6, 14], [98, 6, 12], [-74, -4, 11], [-76, 8, 13], [-40, -14, 12], [24, -18, 15]]) sapin(x, z, h, al() < .4 ? melezeM : sapinM);
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
  L.limites = (x, z) => libre(x, z) && ((x > -71.5 && x < 96 && z > 7.6 && z < 21 && !(x < -40 && z < 14)) || (x > -38.6 && x < 82 && z > .5 && z < 7.6) || (x > -71.5 && x < -40.5 && z > 14 && z < 16.4) || (x > -12.6 && x < -9.8 && z > .3 && z < 1.1));
  L.hauteur = (x, z) => z > 21 ? HP(-x, z) : 0;
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
