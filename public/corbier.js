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
  /* (10.117) l'épicéa, fait pour de vrai : une quinzaine d'étages de branches dentelées qui retombent, chaque pointe un peu plus claire, le dessous sombre,
     une silhouette jamais tout à fait régulière, le tronc brun qui se voit en bas ; quatre arbres-modèles, chacun planté à sa taille et tourné à sa façon */
  const EPI = (() => { const V = [], vari = [], fin = !(PETIT || MOBILE || GPU_MODESTE);
    for (let v = 0; v < 4; v++) { const P = [], C = [], N = fin ? 18 : 12, T = fin ? 16 : 11, col = (r, g, b) => C.push(r, g, b), tri = (a, b, c, ca, cb, cc) => { P.push(...a, ...b, ...c); col(...ca); col(...cb); col(...cc); };
      const tr = [.30, .2, .12], R0 = (t) => Math.pow(1 - t, 1.05) * .34 + .015;
      for (let k = 0; k < 8; k++) { const a0 = k / 8 * Math.PI * 2, a1 = (k + 1) / 8 * Math.PI * 2, r0 = .035, r1 = .02; tri([Math.cos(a0) * r0, 0, Math.sin(a0) * r0], [Math.cos(a1) * r0, 0, Math.sin(a1) * r0], [Math.cos(a1) * r1, .3, Math.sin(a1) * r1], tr, tr, tr); tri([Math.cos(a0) * r0, 0, Math.sin(a0) * r0], [Math.cos(a1) * r1, .3, Math.sin(a1) * r1], [Math.cos(a0) * r1, .3, Math.sin(a0) * r1], tr, tr, tr); }
      for (let t = 0; t < T; t++) { const u = t / T, r = R0(u) * (.88 + al() * .24), yt = .14 + u * .82 + .1, th = .12 + (1 - u) * .08, sh = .7 + al() * .4, ofs = al() * 6;
        const dark = [.025 * sh, .07 * sh, .045 * sh], mid = [.05 * sh, .13 * sh, .07 * sh], tip = [.1 * sh, .22 * sh, .1 * sh], under = [.015, .035, .02];   /* (le vert sombre et bleuté de l'épicéa) */
        const top = [], bot = [], inn = []; for (let k = 0; k < N; k++) { const a = k / N * Math.PI * 2 + ofs, sp = k % 2 ? .72 : 1, rr = r * sp * (.82 + al() * .32), dr = th * (k % 2 ? .75 : 1.05) + al() * .03;
          top.push([Math.cos(a) * r * .1, yt, Math.sin(a) * r * .1]); bot.push([Math.cos(a) * rr, yt - dr, Math.sin(a) * rr]); inn.push([Math.cos(a) * r * .3, yt - th * .45, Math.sin(a) * r * .3]); }
        for (let k = 0; k < N; k++) { const k2 = (k + 1) % N, cb = k % 2 ? mid : tip, cb2 = k2 % 2 ? mid : tip;
          tri(top[k], bot[k], bot[k2], dark, cb, cb2); tri(top[k], bot[k2], top[k2], dark, cb2, dark); tri(bot[k], inn[k], inn[k2], cb, under, under); tri(bot[k], inn[k2], bot[k2], cb, under, cb2); } }
      { const yt = 1.04; for (let k = 0; k < 6; k++) { const a0 = k / 6 * Math.PI * 2, a1 = (k + 1) / 6 * Math.PI * 2, rr = .03; tri([Math.cos(a0) * rr, yt - .1, Math.sin(a0) * rr], [Math.cos(a1) * rr, yt - .1, Math.sin(a1) * rr], [0, yt + .02, 0], [.1, .22, .1], [.1, .22, .1], [.18, .34, .15]); } }
      const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3)); g.setAttribute("color", new THREE.Float32BufferAttribute(C, 3)); g.computeVertexNormals(); V.push(g); vari.push(v); }
    return { geos: V, mat: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .95, metalness: 0 }) }; })();
  const epicea = (x, y, z, h, w = 1) => { const m = new THREE.Mesh(EPI.geos[(Math.abs(x * 7 + z * 13) | 0) % 4], EPI.mat); m.position.set(x, y, z); m.scale.set(h * w * (.9 + al() * .2), h, h * w * (.9 + al() * .2)); m.rotation.y = al() * 6.28; m.receiveShadow = true; scene.add(m); return m; };
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
  /* (10.111) le chemin de terre battue : le fond beige-ocre, les cailloux, les graviers clairs, les traces plus sombres, quelques touffes au bord */
  const gravT = tT(512, 512, (c, w, h) => { c.fillStyle = "#b8a88e"; c.fillRect(0, 0, w, h); for (let i = 0; i < 90; i++) { c.fillStyle = `rgba(${al() < .5 ? "120,100,70" : "220,210,190"},${.06 + al() * .08})`; c.beginPath(); c.ellipse(al() * w, al() * h, 20 + al() * 60, 8 + al() * 26, al() * 3, 0, 7); c.fill(); }
    for (let i = 0; i < 5200; i++) { const r = .6 + al() * 1.8; c.fillStyle = ["#8a7a62", "#d8ccb4", "#6e6252", "#c4b498", "#9a9088", "#e6dccb"][i % 6]; c.beginPath(); c.arc(al() * w, al() * h, r, 0, 7); c.fill(); }
    for (let i = 0; i < 70; i++) { const x = al() * w, y = al() * h, r = 2 + al() * 4; c.fillStyle = ["#a8a098", "#8c847a", "#c8c0b4"][i % 3]; c.beginPath(); c.ellipse(x, y, r * 1.3, r, al() * 3, 0, 7); c.fill(); c.fillStyle = "rgba(40,30,20,.25)"; c.beginPath(); c.ellipse(x + 1, y + 1.5, r * 1.2, r * .6, 0, 0, 7); c.fill(); } }, 22, 5);
  /* l'herbe : les taches plus claires et plus sombres, les brins dressés, des touffes jaunies, quelques fleurs blanches et jaunes */
  const herbeT = tT(512, 512, (c, w, h) => { c.fillStyle = "#5f8434"; c.fillRect(0, 0, w, h); for (let i = 0; i < 110; i++) { c.fillStyle = `rgba(${["70,110,40", "120,150,60", "150,140,70", "40,80,30"][i % 4]},.18)`; c.beginPath(); c.ellipse(al() * w, al() * h, 18 + al() * 50, 12 + al() * 30, al() * 3, 0, 7); c.fill(); }
    c.lineWidth = 1.4; for (let i = 0; i < 9000; i++) { const x = al() * w, y = al() * h, l = 3 + al() * 6; c.strokeStyle = ["#4c7028", "#6e9a3c", "#86a84a", "#3c5e22", "#9aa858"][i % 5]; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (al() - .5) * 2.5, y - l); c.stroke(); }
    for (let i = 0; i < 160; i++) { c.fillStyle = ["#f4f2ea", "#f0d040", "#e8e0f0"][i % 3]; c.beginPath(); c.arc(al() * w, al() * h, 1.2, 0, 7); c.fill(); } }, 50, 25);
  /* le bardage du bandeau : les planches verticales de mélèze, grisées par le soleil, les veines plus claires, les joints sombres */
  const bardT = tT(256, 128, (c, w, h) => { c.fillStyle = "#7e6a56"; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 6) { const k = (x * 7 % 11) / 11; c.fillStyle = `rgba(${k > .5 ? "200,190,175" : "70,50,35"},${.12 + k * .2})`; c.fillRect(x, 0, 5, h); c.fillStyle = "rgba(30,20,12,.45)"; c.fillRect(x + 5, 0, 1, h); }
    for (let i = 0; i < 200; i++) { c.fillStyle = `rgba(${al() < .5 ? "230,225,210" : "50,35,25"},.12)`; c.fillRect(al() * w, al() * h, 1, 8 + al() * 30); } c.fillStyle = "rgba(20,12,8,.35)"; c.fillRect(0, h - 6, w, 6); }, 1, 1);
  const dalleT = tT(256, 256, (c, w, h) => { c.fillStyle = "#d8ccb4"; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 32) for (let x = (y / 32 % 2) * 24; x < w; x += 48) { c.fillStyle = ["#e0d4bc", "#cfc2a8", "#d8cab0"][(x + y) % 3]; c.fillRect(x + 1, y + 1, 46, 30); } }, 4, 2);

  /* ---------- le sol : le platelage de la promenade, le parking de gravier, l'herbe, et la vallée qui descend ---------- */
  const sol = (x0, x1, z0, z1, m, y = 0) => { const s = add(new THREE.PlaneGeometry(x1 - x0, z1 - z0), m, (x0 + x1) / 2, y, (z0 + z1) / 2); s.rotation.x = -Math.PI / 2; return s; };
  /* (10.104) la rue qui descend : depuis le petit restaurant jusqu'au bas de la piscine, au fond, la pente — trois mètres de moins au bout ; l'herbe à côté suit */
  const DESC = (x, z) => { const u = Math.min(1, Math.max(0, (-50 - x) / 33)), f = z < 21 ? 1 : z > 34 ? 0 : 1 - (z - 21) / 13; return z < 10.5 && x > -84.5 ? 0 : -3.45 * u * u * (3 - 2 * u) * f * f * (3 - 2 * f); };   /* (en bas, la rue arrive au niveau des plages de la piscine) */   // (au bout, derrière la piscine, le terrain est descendu lui aussi)
  { const hm = mat({ map: herbeT, roughness: 1 }); L.sol = sol(-400, 400, 34, 400, hm, -.02); L.solsPlus = [sol(-400, -90, 14, 34, hm, -.02), sol(-50, 400, 14, 34, hm, -.02), sol(-400, 400, -300, -22, hm, -.02), sol(-400, -90, -22, -10, hm, -.02), sol(-84.6, 400, -22, -10, hm, -.02), sol(-400, -84, -10, 14, hm, -.02), sol(-50, 400, -10, 14, hm, -.02), sol(-60.5, -50, -10, 10.4, hm, -.02)]; }   /* (le trou : la piscine en contrebas) */
  L.solsPlus.push(sol(-48, 66, 0, 7, mat({ map: deckT, roughness: .8 }), .03), sol(-48, -36, 7, 10.4, mat({ map: deckT, roughness: .8 }), .034),   /* (10.120 : le platelage va jusqu'au bâtiment, et avance en L jusqu'à son bout) */ sol(-50, 100, 7, 16, mat({ map: gravT, roughness: 1 }), .01), sol(66, 84, 0, 8, mat({ map: dalleT, roughness: .8 }), .03), sol(-40.5, -38.6, 0, 7, mat({ map: dalleT, roughness: .8 }), .055));
  for (const [x0, x1] of [[-36, 66]]) box(x1 - x0, .08, .2, boisC, (x0 + x1) / 2, .04, 7); box(12, .08, .2, boisC, -42, .04, 10.4); box(.2, .08, 3.4, boisC, -36, .04, 8.7);   // (le rebord du platelage)

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
      const c2 = z < 60 ? [.36 + n * .03, .56, .22] :   /* (en face des immeubles : l'herbe verte, comme sur la photo) */ h > 40 ? [.62 + n * .05, .52, .3] : [.56 + n * .06, .54 + n * .04, .28]; C.push(...c2); }
    g2.setAttribute("color", new THREE.Float32BufferAttribute(C, 3)); g2.computeVertexNormals();
    const preT = tT(256, 256, (c, w, h) => { c.fillStyle = "#d8d0b0"; c.fillRect(0, 0, w, h); for (let i = 0; i < 3000; i++) { c.fillStyle = ["#c8c0a0", "#e8e0c0", "#b8b49a", "#d0d8b0"][i % 4]; c.fillRect(al() * w, al() * h, 2, 3); } }, 70, 40);
    const pente = new THREE.Mesh(g2, new THREE.MeshLambertMaterial({ vertexColors: true, map: preT }));   /* (l'herbe rase, roussie par l'automne) */ pente.position.set(0, .01, 236); pente.receiveShadow = true; scene.add(pente); }
  // la piste de gravier, au pied du talus ; le muret de rochers dans le talus
  L.solsPlus.push(sol(-50, 100, 30.5, 33.5, mat({ map: gravT, roughness: 1 }), .02));   // (10.119, d'après les photos : l'herbe monte depuis le bord du chemin ; plus haut, la piste de gravier)
  /* (10.119) les dalles de béton posées dans l'herbe, en marches, du chemin vers la piste du haut */
  { const dm = mat({ color: 0xb4b0a6, roughness: .95 }); for (let k = 0; k < 9; k++) { const z = 17 + k * 1.5, x = -44 + k * .35, d = box(1.7, .12, .55, dm, x, HP(x, z) + .05, z); d.rotation.y = .12; } }   // (le chemin, l'esplanade de gravier)
  { const rocM = [mat({ color: 0xa8a49a, roughness: .9 }), mat({ color: 0x8a867e, roughness: .9 })]; for (let x = 68; x < 88; x += .9 + al() * .5) { const r = add(new THREE.DodecahedronGeometry(.45 + al() * .25, 0), rocM[(x * 3 | 0) % 2], x, HP(x, 45.6) + .1, 45.4); r.scale.set(1.3, .7, .8); r.rotation.y = al() * 3; } }
  /* (10.113, d'après les photos du côté des pistes) le talus d'herbe qui monte de la piste au plateau : son muret de gros rochers gris sous la gare, les marches de bois ;
     sur le plateau, le jardin des neiges : les bacs rectangulaires rouge sombre en ligne, le toboggan orange, le bonhomme blanc ; au bord de la route, le grand poteau aux panneaux rouges */
  { const rocM = [mat({ color: 0xa8a49a, roughness: .9, flatShading: true }), mat({ color: 0x8a867e, roughness: .9, flatShading: true }), mat({ color: 0xc0bcb2, roughness: .9, flatShading: true })];
    for (let x = 62; x < 100; x += 1.1 + al() * .5) { const z = 45.5 + (al() - .5) * .4, r = add(new THREE.DodecahedronGeometry(.55 + al() * .3, 0), rocM[(x * 3 | 0) % 3], x, HP(x, z) + .15, z); r.scale.set(1.4, .7, .9); r.rotation.y = al() * 3; }
    const bm = mat({ color: 0x7a6a54, roughness: .9 }); for (let k = 0; k < 7; k++) { const z = 44.2 + k * .75; box(1.8, .12, .3, bm, 12, HP(12, z) + .06, z); }
    const bacR = mat({ color: 0x7a2a22, roughness: .8 }); for (const x of [16, 22, 28, 34, 40]) { box(2.2, .5, .7, bacR, x, HP(x, 52) + .25, 52); for (let k = 0; k < 5; k++) add(new THREE.IcosahedronGeometry(.18, 0), mat({ color: 0x9a3a2a }), x - .8 + k * .4, HP(x, 52) + .6, 52); }
    { const tx = 25, tz = 55, y = HP(tx, tz), or = mat({ color: 0xe8701a, roughness: .5 }); for (const s2 of [-1, 1]) { const p = box(.09, 2.4, .09, or, tx + s2 * .5, y + 1.2, tz); p.rotation.z = s2 * .18; } const gl = box(.7, .06, 3.6, or, tx, y + 1.0, tz + 1.4); gl.rotation.x = -.5; }
    { const bx = 33, bz = 55, y = HP(bx, bz), bn = mat({ color: 0xf6f6f2, roughness: .6 }); box(1.6, .1, 1.6, mat({ color: 0xb8b8b0 }), bx, y + .05, bz); add(new THREE.SphereGeometry(.55, 12, 8), bn, bx, y + .6, bz); add(new THREE.SphereGeometry(.38, 12, 8), bn, bx, y + 1.4, bz); add(new THREE.SphereGeometry(.26, 12, 8), bn, bx, y + 1.95, bz); add(new THREE.ConeGeometry(.06, .25, 6), mat({ color: 0xe8701a }), bx, y + 1.95, bz + .3).rotation.x = Math.PI / 2; }
    { const px = -22, pz = 31, y = HP(px, pz); cyl(.08, .12, 8, mat({ color: 0xc0c4c8, metalness: .6 }), px, y + 4, pz, 8); const sT = tT(128, 256, (c, w, h) => { c.fillStyle = "#c8202a"; c.fillRect(0, 0, w, h); c.fillStyle = "#fff"; for (let k = 0; k < 5; k++) { c.fillRect(10, 14 + k * 48, w - 20, 34); } c.fillStyle = "#c8202a"; c.font = "bold 14px Arial"; ["SYBELLES", "PISTES", "ÉCOLE", "PARKING", "TÉLÉSIÈGE"].forEach((t, k) => c.fillText(t, 18, 36 + k * 48)); });
      box(.9, 1.8, .06, mat({ map: sT }), px, y + 3, pz - .1); } }
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
  /* (10.110, d'après la photo prise du bout côté Yéti) en face des immeubles : la place de gravier clair et sa petite scène de bois couverte, la structure d'accrobranche
     aux cadres orange et ses filets, les deux trampolines bleus, le grand cercle orange tracé sur l'herbe, le tapis roulant couvert (le tunnel blanc) qui monte à côté de l'office,
     son enclos au filet vert, les petits bancs le long du chemin */
  { const gravC = mat({ color: 0xc8c2b4, roughness: 1 }), bois2 = mat({ color: 0xb08a5a, roughness: .8 }), orange = mat({ color: 0xe8701a, roughness: .5 }), filet = mat({ color: 0x3a3a3a, wireframe: true });
    const place = add(new THREE.PlaneGeometry(22, 9), gravC, 29, HP(29, 26) + .04, 26); place.rotation.x = -Math.PI / 2;
    // la petite scène
    { const sx = 32, sz = 25, y = HP(sx, sz); box(6, .5, 4, bois2, sx, y + .25, sz); for (let k = 0; k < 3; k++) box(1.2, .15, .35, bois2, sx - 2 + k * 2, y + .07, sz + 2.2);
      for (const [dx, dz] of [[-2.8, -1.8], [2.8, -1.8], [-2.8, 1.8], [2.8, 1.8]]) cyl(.07, .07, 2.6, mat({ color: 0xd8d8d0 }), sx + dx, y + 1.8, sz + dz, 6);
      box(6.4, .1, 4.4, mat({ color: 0xf0ebe0, roughness: .7 }), sx, y + 3.1, sz); OB.push([sx - 1.5, sz, 1.8], [sx + 1.5, sz, 1.8]); }
    // l'accrobranche : les portiques orange, les poutres, les filets
    { const ax = 22, az = 31, y = HP(ax, az); for (const dx of [-3, 0, 3]) for (const sg of [-1, 1]) { const p2 = box(.14, 4.6, .14, orange, ax + dx + sg * .6, y + 2.2, az); p2.rotation.z = sg * -.13; }
      for (const h of [1.6, 3.6]) box(6.6, .1, .1, orange, ax, y + h, az); const f = box(6.2, 1.6, .02, filet, ax, y + 2.6, az + .4); void f; const f2 = box(6.2, .02, 1.2, filet, ax, y + 1.6, az + .2); void f2;
      box(1.5, .1, 1.5, bois2, ax - 3.6, y + 1.6, az); const ech = box(.6, .08, 2.2, bois2, ax - 3.9, y + .8, az + 1.3); ech.rotation.x = .7; OB.push([ax - 2, az, 1.4], [ax + 2, az, 1.4]); }
    // les deux trampolines bleus
    for (const [tx, tz] of [[17, 34], [19.5, 36]]) { const y = HP(tx, tz); cyl(1.3, 1.3, .08, mat({ color: 0x1a1a1a }), tx, y + .6, tz, 20); add(new THREE.TorusGeometry(1.35, .1, 6, 24), mat({ color: 0x2a6ac8 }), tx, y + .62, tz).rotation.x = Math.PI / 2; for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; cyl(.04, .04, .6, mat({ color: 0x8a8a8a }), tx + Math.cos(a) * 1.3, y + .3, tz + Math.sin(a) * 1.3, 5); } OB.push([tx, tz, 1.5]); }
    // le grand cercle orange tracé sur l'herbe, et sa croix
    { const cx = -6, cz = 38, y = HP(cx, cz) + .05, r = add(new THREE.RingGeometry(4.2, 4.6, 40), mat({ color: 0xe8701a, side: THREE.DoubleSide }), cx, y, cz); r.rotation.x = -Math.PI / 2; for (const ry of [0, Math.PI / 2]) { const b = box(5, .02, .3, orange, cx, y, cz); b.rotation.y = ry; } }
    // le tapis roulant couvert : le tunnel blanc en demi-cercle, qui monte le long de la pente, son enclos au filet vert
    { const a0 = [-36, 44], a1 = [-70, 42.5], n = 10, blancT = mat({ color: 0xf2f4f4, roughness: .3, transparent: true, opacity: .85, side: THREE.DoubleSide });
      for (let k = 0; k < n; k++) { const t0 = k / n, t1 = (k + 1) / n, x0 = a0[0] + (a1[0] - a0[0]) * t0, z0 = a0[1] + (a1[1] - a0[1]) * t0, x1 = a0[0] + (a1[0] - a0[0]) * t1, z1 = a0[1] + (a1[1] - a0[1]) * t1, y0 = HP(x0, z0), y1 = HP(x1, z1), L2 = Math.hypot(x1 - x0, z1 - z0, y1 - y0);
        const G = new THREE.Group(); G.position.set((x0 + x1) / 2, (y0 + y1) / 2 + .1, (z0 + z1) / 2); G.rotation.order = "YZX"; G.rotation.y = -Math.atan2(z1 - z0, x1 - x0); G.rotation.z = Math.atan2(y1 - y0, Math.hypot(x1 - x0, z1 - z0)); scene.add(G);
        const tu = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, L2, 14, 1, true, 0, Math.PI), blancT); tu.rotation.z = Math.PI / 2; G.add(tu);
        for (let q = 0; q < 3; q++) { const ar = new THREE.Mesh(new THREE.TorusGeometry(1.12, .04, 4, 14, Math.PI), mat({ color: 0xc8ccd0 })); ar.rotation.y = Math.PI / 2; ar.position.x = -L2 / 2 + q * L2 / 3; G.add(ar); } }      const vert = mat({ color: 0x3aa84a, transparent: true, opacity: .55, side: THREE.DoubleSide }); for (const dz of [-3, 3]) { const x0 = -48, x1 = -64, z = 41 + dz; const v = box(Math.abs(x1 - x0), 1.2, .03, vert, (x0 + x1) / 2, HP((x0 + x1) / 2, z) + .6, z); void v; } }
    // les petits bancs le long du chemin (ceux de la photo)
    for (const [bx, bz, ry] of [[12, 27.5, 0], [40, 32, -.4], [2, 33, .2]]) { const g = new THREE.Group(); g.position.set(bx, HP(bx, bz), bz); g.rotation.y = ry; scene.add(g); for (let k = 0; k < 3; k++) { const l = new THREE.Mesh(new THREE.BoxGeometry(1.6, .05, .12), boisC); l.position.set(0, .45, -.14 + k * .14); g.add(l); } for (const sx of [-.7, .7]) { const l = new THREE.Mesh(new THREE.BoxGeometry(.08, .45, .45), mat({ color: 0x2a2a2a })); l.position.set(sx, .22, 0); g.add(l); } OB.push([bx, bz, .9]); } }
  // les bosquets de sapins sur les pentes
  { const sapM = mat({ color: 0x24402a, roughness: .9 }); for (const [cx, cz, n] of [[-60, 150, 40], [-20, 170, 30], [70, 210, 30], [-140, 120, 26], [130, 130, 22], [20, 90, 8]]) for (let k = 0; k < (PETIT ? n / 3 : n); k++) { const x = cx + (al() - .5) * 50, z = cz + (al() - .5) * 40, h = 8 + al() * 7; epicea(x, HP(x, z) - .3, z, h); } void sapM; }
  // l'office du tourisme : la rotonde sous sa grande pyramide de poutres rouges et blanches, le chapeau blanc
  /* (10.114, d'après la photo) l'office de tourisme : la rotonde de plain-pied tout en vitrages, ceinte d'un large anneau de planches rouge-brun qui déborde
     (« OFFICE DE TOURISME » en lettres blanches) ; les trois grandes jambes en triangle, rouge-brun dehors et blanches dedans, posées sur leurs socles de béton,
     qui se rejoignent tout en haut sous le cône d'aluminium et son disque ; la nappe de câbles qui descend du disque ; l'escalier à rampes inox et main courante de bois,
     les jardinières de géraniums, le panneau du plan, le banc, sur sa butte d'herbe */
  { const n0 = scene.children.length, ox = -32, oz = 46, R0 = 7.5, H = 3.2, bois = mat({ color: 0x8a3a24, roughness: .6 }), blanc2 = mat({ color: 0xf2f0ea, roughness: .5 }), beton = mat({ color: 0xc8c2b6, roughness: .85 }), alu = mat({ color: 0xd8dce0, metalness: .8, roughness: .25 });
    add(new THREE.CylinderGeometry(R0 + 2, R0 + 3.5, 1, 32), mat({ color: 0x5a7a32, roughness: 1 }), ox, -.4, oz);   // la butte d'herbe
    cyl(R0, R0, H, mat({ color: 0x3a4248, roughness: .2, metalness: .3 }), ox, H / 2, oz, 32);   // le vitrage, tout autour
    for (let k = 0; k < 20; k++) { const a = k / 20 * Math.PI * 2; cyl(.06, .06, H, mat({ color: 0x3a3a3a, metalness: .5 }), ox + Math.sin(a) * (R0 + .03), H / 2, oz + Math.cos(a) * (R0 + .03), 5); }   // les montants
    cyl(R0 - .2, R0 - .2, .3, mat({ color: 0x2a2a2a }), ox, H + .15, oz, 32);   // le toit plat
    // le large anneau de planches rouge-brun, qui déborde, et son inscription
    const anT = tT(2048, 128, (c, w, h) => { c.fillStyle = "#7a3220"; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 16) { c.fillStyle = "rgba(0,0,0,.25)"; c.fillRect(0, y, w, 2); c.fillStyle = "rgba(255,200,170,.08)"; c.fillRect(0, y + 3, w, 6); }
      c.fillStyle = "#fff"; c.font = `bold 78px ${sans}`; c.textAlign = "center"; for (const x of [w / 6, w / 2, w * 5 / 6]) { c.fillText("OFFICE DE TOURISME", x + 30, 94); c.fillStyle = "#1a5ab8"; c.fillRect(x - 380, 40, 48, 48); c.fillStyle = "#fff"; } });
    const an = add(new THREE.CylinderGeometry(R0 + 2.4, R0 + 2.6, 1.4, 64, 1, true), mat({ map: anT, side: THREE.DoubleSide, roughness: .6 }), ox, H + .5, oz); void an;
    add(new THREE.RingGeometry(R0 - .2, R0 + 2.4, 64), mat({ color: 0x5a2416, side: THREE.DoubleSide }), ox, H - .2, oz).rotation.x = -Math.PI / 2;   // le dessous de l'anneau
    // la porte d'entrée, sous son petit auvent
    { const a = Math.PI * .1, dx = Math.sin(a) * R0, dz = Math.cos(a) * R0; box(3.2, 2.6, .5, mat({ color: 0x7a3220 }), ox + dx * 1.04, 2.8, oz + dz * 1.04, a); box(2.4, 2.3, .1, mat({ color: 0x4a6878, roughness: .1, metalness: .3 }), ox + dx * 1.08, 1.2, oz + dz * 1.08, a);
      // l'escalier, les rampes inox, la main courante de bois
      for (let k = 0; k < 7; k++) { const t = 1.1 + k * .32; box(2.6, .16, .4, beton, ox + dx * (1 + t / R0 * 1), .9 - k * .16, oz + dz * (1 + t / R0), a); }
      for (const sg of [-1, 1]) { const ex = Math.cos(a) * 1.4 * sg, ez = -Math.sin(a) * 1.4 * sg; const r = box(.06, .06, 2.6, mat({ color: 0xa06a3a }), ox + dx * 1.22 + ex, 1.4, oz + dz * 1.22 + ez, a); r.rotation.x = .3; box(.04, 1, 2.4, mat({ color: 0xc8ccd0, metalness: .7, transparent: true, opacity: .6 }), ox + dx * 1.22 + ex, .9, oz + dz * 1.22 + ez, a);
        for (let k = 0; k < 6; k++) add(new THREE.IcosahedronGeometry(.18, 0), mat({ color: [0xe02a3a, 0xf08090, 0xffffff][k % 3] }), ox + dx * 1.12 + ex * 1.1 + (k % 2) * .2, 1.7 + (k % 3) * .12, oz + dz * 1.12 + ez * 1.1); } }
    // les trois grandes jambes en triangle : rouge-brun dehors, blanches dedans, sur leurs socles de béton
    const top = new THREE.Vector3(ox, 21, oz); for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2 + .9, A = new THREE.Vector3(ox + Math.sin(a) * (R0 + 4.2), 0, oz + Math.cos(a) * (R0 + 4.2)), d = top.clone().sub(A), L2 = d.length(), q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
      for (const [m, w, off] of [[bois, .9, 0], [blanc2, .5, .55]]) { const o = add(new THREE.BoxGeometry(w, L2, .7), m, 0, 0, 0); o.quaternion.copy(q); o.position.copy(A).addScaledVector(d, .5); const n = new THREE.Vector3(-Math.sin(a), 0, -Math.cos(a)).multiplyScalar(off); o.position.add(n); }
      const so = box(2.2, 1.6, 1.4, beton, A.x, .8, A.z); so.rotation.y = a; OB.push([A.x, A.z, 1.4]); }
    // le cône d'aluminium et son disque, tout en haut ; la nappe de câbles jusqu'à l'anneau
    add(new THREE.ConeGeometry(2.4, 4.6, 24), alu, ox, 24, oz); cyl(2.6, 2.6, .5, alu, ox, 21.4, oz, 24); cyl(2.2, 2.2, .25, mat({ color: 0x9a9ea2 }), ox, 21.05, oz, 24);
    for (let k = 0; k < 36; k++) { const a = k / 36 * Math.PI * 2, A = new THREE.Vector3(ox + Math.sin(a) * 2, 21, oz + Math.cos(a) * 2), B = new THREE.Vector3(ox + Math.sin(a) * (R0 + .5), H + 1.2, oz + Math.cos(a) * (R0 + .5)), d = B.clone().sub(A), o = add(new THREE.CylinderGeometry(.018, .018, d.length(), 3), mat({ color: 0xd0d4d8, metalness: .6 }), 0, 0, 0); o.position.copy(A).addScaledVector(d, .5); o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); }
    // devant : le panneau du plan sur ses deux poteaux, le banc, la petite borne jaune
    { const a = Math.PI * -.15, fx = ox + Math.sin(a) * (R0 + 2.5), fz = oz + Math.cos(a) * (R0 + 2.5); const plT = tT(256, 160, (c, w, h) => { c.fillStyle = "#f2efe6"; c.fillRect(0, 0, w, h); c.fillStyle = "#8aa070"; c.fillRect(14, 30, w - 90, h - 44); c.strokeStyle = "#c8202a"; c.lineWidth = 3; for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(20 + k * 20, 40); c.lineTo(60 + k * 14, h - 20); c.stroke(); } c.fillStyle = "#c8202a"; c.fillRect(w - 70, 30, 56, 20); c.fillStyle = "#2a2a2a"; c.font = "bold 12px Arial"; c.fillText("ESPACE TRAIL", 20, 22); });
      box(2.4, 1.6, .08, mat({ map: plT }), fx, 1.6, fz, a); for (const sg of [-1, 1]) box(.12, 2.4, .12, mat({ color: 0x6a4a2a }), fx + Math.cos(a) * 1.25 * sg, 1.2, fz - Math.sin(a) * 1.25 * sg);
      box(1.8, .08, .45, mat({ color: 0x6a3a22 }), fx + 1.8, .45, fz + 1.4, a); box(1.8, .3, .06, mat({ color: 0x6a3a22 }), fx + 1.8, .75, fz + 1.2, a); OB.push([fx, fz, 1.4]); }
    OB.push([ox, oz, R0 + 2]); const yb = HP(ox, oz); for (const o of scene.children.slice(n0)) o.position.y += yb; }
  // (l'aire de jeux, les bacs de fleurs du pré : retirés)
  // le portique rouge des Sybelles et ses tourniquets blancs
  { const rg = mat({ color: 0x9a2030, roughness: .5 }); box(.35, 3.2, .35, rg, 70, HP(70, 47) + 1.6, 47); box(.35, 2.4, .35, rg, 65, HP(65, 47) + 1.2, 47); const pt = box(5.6, .5, .6, rg, 67.5, HP(67, 47) + 3.0, 47); pt.rotation.z = .14;
    for (let k = 0; k < 6; k++) box(.25, 1, .25, mat({ color: 0xf2f2f0 }), 65.6 + k * .7, HP(67, 47) + .5, 47); box(1.3, 1.6, .1, mat({ color: 0x1a1a1a }), 63.5, HP(63, 47) + 1.6, 47.2); }
  /* le télésiège des Sybelles : la gare (la grande coque crème au toit sombre), la poulie, les pylônes qui montent, le câble et les sièges qui tournent */
  const TS = []; const telesiege = (gx, gz, dir, long, gros) => { const y0 = HP(gx, gz), g = new THREE.Group(); g.position.set(gx, y0, gz); g.rotation.y = dir; scene.add(g); const cr = mat({ color: 0xe8e2cc, roughness: .5 }), sombre = mat({ color: 0x2a3036, roughness: .3, metalness: .4 }), gris = mat({ color: 0x9a9ea2, metalness: .6, roughness: .4 });
    if (gros) { const co = new THREE.Mesh(new THREE.CapsuleGeometry(2.6, 6, 6, 16), cr); co.rotation.z = Math.PI / 2; co.scale.set(1, .62, .62); co.position.set(0, 4.0, 0); g.add(co); const to = new THREE.Mesh(new THREE.SphereGeometry(3.6, 22, 10, 0, Math.PI * 2, 0, Math.PI / 2), mat({ color: 0x1e2a36, roughness: .15, metalness: .5 })); to.scale.set(1.45, .5, .62); to.position.set(0, 5.0, 0); g.add(to);   /* (la coque crème, le grand dôme vitré sombre, comme sur les photos) */
      for (const s2 of [-1, 1]) { const rb = new THREE.Mesh(new THREE.TorusGeometry(1.1, .06, 5, 16, Math.PI), gris); rb.position.set(s2 * 3.6, 6.2, 0); rb.rotation.y = Math.PI / 2; g.add(rb); }   // (les arceaux de maintenance sur le toit)
      const pt = new THREE.Mesh(new THREE.BoxGeometry(8, .25, 4), gris); pt.position.set(0, 2.5, 0); g.add(pt);
      const lg = tT(512, 128, (c, w, h) => { c.fillStyle = "#e8e2cc"; c.fillRect(0, 0, w, h); for (let k = 0; k < 3; k++) { c.fillStyle = ["#2a8a4a", "#2a5ac8", "#c83a2a"][k]; c.beginPath(); c.moveTo(40 + k * 50, 90); c.lineTo(65 + k * 50, 30); c.lineTo(90 + k * 50, 90); c.fill(); } c.fillStyle = "#5a5a5a"; c.font = `italic bold 28px ${sans}`; c.fillText("LES SYBELLES", 40, 118); c.fillStyle = "#e85a1a"; c.fillRect(300, 20, 180, 80); c.fillStyle = "#fff"; c.font = `italic bold 30px ${serif}`; c.fillText("Le Corbier", 312, 72); });
      for (const s of [-1, 1]) { const pa = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.05), mat({ map: lg })); pa.position.set(0, 4.1, s * 1.47); if (s < 0) pa.rotation.y = Math.PI; g.add(pa); }
      for (const [a, b] of [[-2, -1], [2, -1], [-2, 1], [2, 1]]) { const pl = new THREE.Mesh(new THREE.CylinderGeometry(.15, .15, 3, 8), gris); pl.position.set(a, 1.5, b); g.add(pl); } }
    else { const pl = new THREE.Mesh(new THREE.CylinderGeometry(.3, .4, 5, 10), gris); pl.position.y = 2.5; g.add(pl); const cb = new THREE.Mesh(new THREE.BoxGeometry(1, 1.4, 1), mat({ color: 0xd8d8d0 })); cb.position.set(.9, 2.6, 0); g.add(cb);
      const ca = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.2, 2.2), mat({ color: 0xd8702a, roughness: .7 })); ca.position.set(-3.5, 1.1, 0); g.add(ca); const ct = new THREE.Mesh(new THREE.BoxGeometry(2.9, .12, 2.7), mat({ color: 0x5a6068, metalness: .4 })); ct.position.set(-3.5, 2.35, 0); ct.rotation.z = .15; g.add(ct); }   // (la petite cabane orange du préposé)
    const roue = new THREE.Mesh(new THREE.TorusGeometry(2.2, .12, 6, 28), mat({ color: gros ? 0x8a8e92 : 0xe8c020, metalness: .5 }));   // (la grande roue jaune des petits télésièges) roue.rotation.x = Math.PI / 2; roue.position.y = gros ? 2.7 : 4.9; g.add(roue);
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
  telesiege(80, 50, .35, 320, true); telesiege(58, 52, .1, 240, false); telesiege(-15, 54, -.1, 200, false);
  // le chalet des remontées : le bardage de bois, le toit de tôle grise, les fenêtres, l'escalier
  { const cx = 91, cz = 52, y = HP(cx, cz); box(9, 3.4, 6, facR, cx, y + 1.7, cz); const r1 = box(5.4, .15, 7, mat({ color: 0x5a6068, metalness: .4, roughness: .5 }), cx - 2.3, y + 4.4, cz); r1.rotation.z = .55; const r2 = box(5.4, .15, 7, mat({ color: 0x5a6068, metalness: .4, roughness: .5 }), cx + 2.3, y + 4.4, cz); r2.rotation.z = -.55;
    for (let k = 0; k < 5; k++) box(1, 1.3, .06, mat({ color: 0x2a3a40, roughness: .2 }), cx - 3.4 + k * 1.7, y + 1.8, cz - 3.02); box(.9, .5, .06, mat({ color: 0x1a5aa8 }), cx + 1, y + 2.9, cz - 3.05); OB.push([cx, cz, 5]); }
  // la petite cabane du préposé, au pied du deuxième télésiège
  { const cx = 44, cz = 56, y = HP(cx, cz); box(3, 2.6, 2.6, facS, cx, y + 1.3, cz); const r = box(3.6, .12, 3.3, mat({ color: 0x4a5058, metalness: .4 }), cx, y + 2.85, cz); r.rotation.x = -.15; box(1.2, .8, .05, mat({ color: 0x9ab0b8, roughness: .1 }), cx + .4, y + 1.7, cz - 1.32); box(.9, 1.4, .9, mat({ color: 0xe8e8e2 }), cx - 2.2, y + .7, cz); }


  /* ---------- la résidence en bois : le rez-de-chaussée des boutiques, trois étages de balcons en caissons, le bandeau de planches qui avance en haut ---------- */
  const verreB = mat({ color: 0xc8d8dc, roughness: .1, metalness: .2, transparent: true, opacity: .35 }), vitreS = lum(mat({ color: 0x2a3a40, emissive: 0xffd8a0, emissiveIntensity: 0, roughness: .2 }), 0, .7);
  const rideauxT = [0, 1, 2, 3].map(k => tT(128, 96, (c, w, h) => { c.fillStyle = "#2c3236"; c.fillRect(0, 0, w, h); const col = ["#e8e4d8", "#d8c8b0", "#c8504a", "#e8e0c8"][k]; c.fillStyle = col; for (let x = 0; x < w; x += 64) { c.fillRect(x + 4, 4, 22, h - 8); c.fillRect(x + 38, 4, 22, h - 8); } c.fillStyle = "rgba(255,255,255,.12)"; c.fillRect(0, 0, w, 6); c.strokeStyle = "#5a3a22"; c.lineWidth = 4; c.strokeRect(2, 2, w - 4, h - 4); c.beginPath(); c.moveTo(w / 2, 0); c.lineTo(w / 2, h); c.stroke(); }));
  const fenM = rideauxT.map(t => lum(mat({ map: t, emissive: 0xffd8a0, emissiveMap: t, emissiveIntensity: 0, roughness: .3 }), 0, .55));
  const residence = (x0, x1, zf, niv, fac, o = {}) => { const W = x1 - x0, cx = (x0 + x1) / 2, HR = 3.4, HE = 2.8, H = HR + niv * HE, D = 12;
    box(W, H, D, facS, cx, H / 2, zf - D / 2 - .6);   // le corps du bâtiment
    box(W + .6, .25, D + 1.6, boisC, cx, H + 1.2, zf - D / 2);   // le toit
    { const f = box(W + .6, 2.2, .35, fac, cx, H + .3, zf + 1.3); f.material = mat({ map: bardT.clone(), roughness: .9, color: o.rouge ? 0xd88a66 : 0xffffff });   /* (le bandeau grisé, ou rouge-brun selon le bloc, comme sur les photos) */ f.material.map.repeat.set(W / 3, 1); f.material.map.needsUpdate = true; }   // le grand bandeau de planches qui avance
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
        for (const sg of [-1, 1]) { const cxx = bx + sg * (bay / 2 - .2); box(.32, .55, .12, blancB, cxx, y - .2, zf + prof - .1); box(.32, .14, .55, blancB, cxx, y + .02, zf + prof - .35); box(.14, .3, .3, blancB, cxx - sg * .1, y - .32, zf + prof - .45); }   // (10.111) les consoles en Z de béton blanc, sous chaque caisson, comme sur les photos
        box(bay - .36, .06, prof - .2, mat({ color: 0x4a2c1c }), bx, y + HE - .2, zf + prof / 2);   // le plafond sombre du caisson
        for (const sg of [-1, 1]) box(.09, HE - .12, .09, mat({ color: 0x3e2414, roughness: .7 }), bx + sg * (bay / 2 - .12), y + HE / 2, zf + prof - .02);   // les montants foncés, devant
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
  /* (10.112, d'après les photos de la promenade) la longue résidence n'est pas d'un seul tenant : des blocs qui avancent et d'autres en renfoncement, le bandeau tantôt gris, tantôt rouge-brun */
  const BLOCS = [[-10, 7, 0, 0], [7, 23, -2, 1], [23, 39, 0, 0], [39, 52, -2.2, 1], [52, 66, 0, 0]];
  const zfAt = (x) => { for (const [a, b, z] of BLOCS) if (x >= a && x < b) return z; return 0; };
  const LIGNES = [];   // (pour placer les terrasses, les bancs, les lampadaires devant)
  { const kW = 76 / BOUT.reduce((a, b) => a + b[0], 0); let x = -10; for (const [w0, txt, fond, coul, o] of BOUT) { const w = w0 * kW; const t = devantureT(txt, fond, coul, o), m = lum(mat({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: .12, roughness: .4 }), .12, .75);
      { const xa = x, xb = x + w; for (const [a, b, z] of BLOCS) { const u0 = Math.max(a, xa), u1 = Math.min(b, xb); if (u1 - u0 < .05) continue; const g = new THREE.PlaneGeometry(u1 - u0 - .05, 3.3), uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setX(i, ((uv.getX(i) ? u1 : u0) - xa) / w); add(g, m, (u0 + u1) / 2, 1.65, z + .02); } } LIGNES.push({ x0: x, x1: x + w, txt, o });   // (la vitrine suit les renfoncements)
      if (o.bleu) box(w - .4, .12, 1.1, mat({ color: 0x2a5ac8, roughness: .6 }), x + w / 2, 3.0, zfAt(x + w / 2) + .55);   // le store bleu d'Intersport
      if (o.croix) { const cr = lum(mat({ color: 0x1a8a3a, emissive: 0x20c050, emissiveIntensity: .3 }), .3, 1.6); box(.18, .6, .08, cr, x + w - .6, 2.6, zfAt(x + w - .6) + .35); box(.6, .18, .08, cr, x + w - .6, 2.6, zfAt(x + w - .6) + .35); }
      x += w; } }
  for (const [a, b, z, r] of BLOCS) residence(a, b, z, 3, r ? facR : facG, { rouge: !!r });   // (chaque bloc, avec son avancée ou son renfoncement)
  { const blancM = mat({ color: 0xece8e0, roughness: .8 }); for (const [a, b, z] of BLOCS) if (z < 0) for (const x of [a, b]) box(.3, 3.4, -z, facS, x, 1.7, z / 2); }   // (les murs en retour, au pied des renfoncements)
  // les stores rouges et bleus des terrasses, au pied de la résidence (d'après la vue du ciel)
  for (const [x0, x1, c2] of [[-9.5, -.5, 0xc8202a], [.5, 6, 0x2a5ac8], [30, 36, 0xd8602a]]) { const st = box(x1 - x0, .08, 2.6, mat({ color: c2, roughness: .8 }), (x0 + x1) / 2, 3.0, zfAt((x0 + x1) / 2) + 1.4); st.rotation.x = .2; }   // (la longue résidence, jusqu'au Yéti)

  /* ---------- à gauche : la piscine, la galerie Charvin, les tours ---------- */
  /* (10.102, d'après les vues du ciel) au bout du Front de Neige : le bâtiment bas dont le toit, au niveau de la promenade, porte l'aire de jeux (trampolines, structure gonflable,
     tente verte, toboggan) ; sa façade de boutiques donne, plus bas, sur la piscine en contrebas et ses plages de dalles ; le chemin qui descend à côté, côté pistes */
  const YP = -3.6;
  { const eau = mat({ color: 0x3aa8e0, roughness: .05, metalness: .1, emissive: 0x0a3a5a, emissiveIntensity: .25 }), dalle2 = mat({ map: dalleT, roughness: .8 }), blancP = mat({ color: 0xe8ecee, roughness: .6 });
    const pl = add(new THREE.PlaneGeometry(23.5, 20.2), dalle2, -72.25, YP, .1); pl.rotation.x = -Math.PI / 2; L.solsPlus.push(pl);   // les plages, en bas
    /* (10.115, d'après la photo) le bassin : la margelle de pierre grise, les grilles blanches des goulottes tout autour, l'eau turquoise, les lignes bleu foncé au fond,
       les deux lignes d'eau à bouées rouges et blanches, les échelles inox, les bâches enroulées au bout, et le tunnel de plexiglas qui entre dans l'eau */
    const BX = -72.5, BZ = -1, BL = 19, BW = 11, eauM = mat({ color: 0x38c4e8, roughness: .04, metalness: .1, emissive: 0x0a4a6a, emissiveIntensity: .3 });
    box(BL + 2.4, .3, BW + 2.4, mat({ color: 0x8a8e90, roughness: .85 }), BX, YP - .1, BZ); const e = add(new THREE.PlaneGeometry(BL, BW), eauM, BX, YP + .07, BZ); e.rotation.x = -Math.PI / 2;
    for (const [w, d, x, z] of [[BL + .6, .35, BX, BZ - BW / 2 - .3], [BL + .6, .35, BX, BZ + BW / 2 + .3], [.35, BW, BX - BL / 2 - .3, BZ], [.35, BW, BX + BL / 2 + .3, BZ]]) { const g2 = add(new THREE.PlaneGeometry(w, d), mat({ map: tT(64, 16, (c, ww, hh) => { c.fillStyle = "#f2f2ee"; c.fillRect(0, 0, ww, hh); c.fillStyle = "#b8bcc0"; for (let x = 2; x < ww; x += 4) c.fillRect(x, 2, 2, hh - 4); }, Math.max(w, d) / .5, 1) }), x, YP + .08, z); g2.rotation.x = -Math.PI / 2; if (d > w) g2.rotation.z = Math.PI / 2; }
    for (let k = 0; k < 5; k++) { const l = add(new THREE.PlaneGeometry(BL - 2, .25), mat({ color: 0x1a4a9a }), BX, YP + .072, BZ - BW / 2 + 1.1 + k * 2.2); l.rotation.x = -Math.PI / 2; }   // (les lignes au fond)
    for (const z of [BZ - BW / 2 + 2.6, BZ - BW / 2 + 4.8]) for (let k = 0; k < 64; k++) add(new THREE.SphereGeometry(.07, 6, 4), mat({ color: k % 4 < 2 ? 0xc8202a : 0xf2f2f2 }), BX - BL / 2 + .15 + k * (BL - .3) / 63, YP + .1, z);   // (les lignes d'eau)
    for (const z of [BZ - BW / 2 + .5, BZ + BW / 2 - .5]) { const r = cyl(.45, .45, BW > 0 ? 4.6 : 1, mat({ color: 0xf0f2f2, roughness: .4 }), BX + BL / 2 + 1.1, YP + .45, z + (z < BZ ? 2.3 : -2.3), 16); r.rotation.x = Math.PI / 2; }   // (les bâches enroulées, au bout)
    for (const z of [BZ - 3, BZ + 3]) for (const sg of [-1, 1]) { const ec = add(new THREE.TorusGeometry(.35, .03, 5, 10, Math.PI), mat({ color: 0xd8dce0, metalness: .9 }), BX + BL / 2 - .2, YP + .55, z + sg * .3); ec.rotation.y = Math.PI / 2; }
    { const tu = new THREE.Group(); tu.position.set(BX - BL / 2 - .2, YP + .1, BZ + 1.5); scene.add(tu); const pl = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 6, 20, 1, true, 0, Math.PI), mat({ color: 0xd8eef0, roughness: .05, transparent: true, opacity: .4, side: THREE.DoubleSide, depthWrite: false })); pl.rotation.z = Math.PI / 2; pl.rotation.y = Math.PI / 2; pl.position.x = 1.5; tu.add(pl);
      for (const dx of [-1.4, .4, 2.2, 4.4]) { const ar = new THREE.Mesh(new THREE.TorusGeometry(1.42, .06, 5, 20, Math.PI), mat({ color: 0x8ab8a8, metalness: .4 })); ar.rotation.y = Math.PI / 2; ar.position.x = dx; tu.add(ar); } }   // (le tunnel de plexiglas)
    
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
    {
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
    const terr = add(new THREE.PlaneGeometry(23.8, 12), mat({ map: deckT, roughness: .8 }), -72.4, .05, -16.3); terr.rotation.x = -Math.PI / 2; L.solsPlus.push(terr);   // (le grand platelage de bois du toit)
    for (let x = -84.2; x < -60.6; x += 2.35) { box(2.3, 1.1, .03, verreP, x + 1.17, .55, -10.5); box(.06, 1.2, .06, poteauP, x, .6, -10.5); }
    /* (10.116, d'après la photo) le parc de loisirs sur le toit, le long de la piscine : l'entrée et sa grande girafe gonflable, l'arche « Bienvenue · Parc de loisirs »,
       les tables blanches et leurs parasols, les maisonnettes, les toboggans gonflables (l'arc-en-ciel au soleil, le vert et jaune), le carré des trampolines et sa barrière,
       la balustrade de bois tout autour */
    { const T0 = -22, T1 = -10.8, X0 = -84.2, X1 = -60.6, g = (c2, r = .55) => mat({ color: c2, roughness: r });
      const boisB = g(0x6a4026, .7); for (let x = X0; x <= X1; x += .5) box(.07, .9, .07, boisB, x, .5, T1 + .15); box(X1 - X0, .1, .12, boisB, (X0 + X1) / 2, .95, T1 + .15); for (let z = T0; z <= T1; z += .5) box(.07, .9, .07, boisB, X0 + .1, .5, z); box(.12, .1, T1 - T0, boisB, X0 + .1, .95, (T0 + T1) / 2);
      // la girafe, à l'entrée (côté rue) : les pattes, le corps, le long cou, la tête et ses cornes ; les taches brunes
      { const gx = -82, gz = -20, orG = mat({ map: tT(128, 128, (c, w, h) => { c.fillStyle = "#f0a020"; c.fillRect(0, 0, w, h); c.fillStyle = "#c8501a"; for (let i = 0; i < 26; i++) { c.beginPath(); c.ellipse((i * 37) % w, (i * 53) % h, 9, 7, i, 0, 7); c.fill(); } }, 2, 2), roughness: .5 });
        for (const [dx, dz] of [[-1, -.6], [1, -.6], [-1, .6], [1, .6]]) cyl(.3, .35, 2.4, orG, gx + dx, 1.2, gz + dz, 10);
        const co = add(new THREE.CapsuleGeometry(1.1, 2.2, 6, 12), orG, gx, 3, gz); co.rotation.z = Math.PI / 2; const cou = add(new THREE.CylinderGeometry(.42, .6, 4.2, 12), orG, gx + 1.6, 5.6, gz); cou.rotation.z = -.35;
        const te = add(new THREE.CapsuleGeometry(.55, 1, 6, 12), orG, gx + 2.6, 7.7, gz); te.rotation.z = Math.PI / 2 - .3; for (const s2 of [-.3, .3]) { cyl(.07, .07, .6, orG, gx + 2.3, 8.4, gz + s2, 6); add(new THREE.SphereGeometry(.13, 8, 6), g(0xc8501a), gx + 2.3, 8.75, gz + s2); }
        box(2.8, 2.4, .1, g(0x2a5ab8), gx - .2, 1.6, gz - 1.2); OB.push([gx, gz, 1.8]); }
      { const aT = tT(512, 96, (c, w, h) => { c.fillStyle = "#1a7a3a"; c.fillRect(0, 0, w, h); c.fillStyle = "#fff"; c.font = `italic bold 40px ${serif}`; c.textAlign = "center"; c.fillText("Parc de loisirs   ·   Bienvenue", w / 2, 62); });
        const ar = add(new THREE.PlaneGeometry(5, .9), mat({ map: aT, side: THREE.DoubleSide }), -78.5, 3.2, -21.6); void ar; for (const dx of [-2.5, 2.5]) box(.25, 3.4, .25, g(0x5a3a22), -78.5 + dx, 1.7, -21.6); }
      // les tables blanches et leurs parasols
      for (const [tx, tz, pc] of [[-76, -18, 0xf2f2f2], [-73.5, -15, 0x8ab8e0], [-71, -18.5, 0xf2f2f2], [-68.5, -15.5, 0xe86a8a]]) { cyl(.45, .45, .04, g(0xf2f2f0, .3), tx, .76, tz, 14); cyl(.04, .04, .7, g(0xd8d8d8), tx, .4, tz, 6); for (const sg of [-1, 1]) box(.42, .5, .42, g(0xf2f2f0, .4), tx + sg * .65, .3, tz); cyl(.03, .03, 2.4, g(0xd8d8d8), tx, 1.25, tz, 5); add(new THREE.ConeGeometry(1.3, .5, 8, 1, true), mat({ color: pc, side: THREE.DoubleSide, roughness: .8 }), tx, 2.45, tz); OB.push([tx, tz, 1]); }
      // les maisonnettes des petits (vertes, rouges), le toboggan rose
      for (const [hx, hz, c2] of [[-79.5, -14, 0x3aa84a], [-74, -12.5, 0xe8502a], [-70.5, -12.5, 0xe8c020]]) { box(1.4, 1.4, 1.4, g(c2), hx, .7, hz); const t = add(new THREE.ConeGeometry(1.15, .9, 4), g(0x2a5ab8), hx, 1.85, hz); t.rotation.y = Math.PI / 4; OB.push([hx, hz, 1.1]); }
      { const tb = box(.7, .08, 2.6, g(0xe86a9a), -77, .7, -12.2); tb.rotation.x = -.4; }
      // les toboggans gonflables : l'arc-en-ciel au grand soleil, le vert et jaune
      { const ax = -66, az = -18.5; for (const [r, c2] of [[3.2, 0xe83a3a], [2.8, 0xf0a020], [2.4, 0xf0e030], [2.0, 0x3aa84a], [1.6, 0x2a6ac8]]) { const a = add(new THREE.TorusGeometry(r, .22, 8, 24, Math.PI), g(c2, .4), ax, .05, az); void a; }
        box(6.6, .5, 3.4, g(0x2a6ac8, .4), ax, .25, az + .4); const so = add(new THREE.CircleGeometry(1, 16), g(0xf0c020, .4), ax, 4.2, az + .1); void so; for (let k = 0; k < 10; k++) { const r2 = box(.18, .7, .05, g(0xf08020), ax + Math.cos(k * .63) * 1.3, 4.2 + Math.sin(k * .63) * 1.3, az + .1); r2.rotation.z = k * .63 - Math.PI / 2; } OB.push([ax - 2, az, 2], [ax + 2, az, 2]); }
      { const vx = -62.5, vz = -19; box(3, 3, 3, g(0x3aa84a, .4), vx, 1.5, vz); for (const dx of [-1.6, 1.6]) cyl(.45, .45, 4, g(0xf0e030, .4), vx + dx, 2, vz - 1.5, 10); const sl = box(2.6, .3, 5, g(0xf0e030, .4), vx, 1.6, vz + 3.2); sl.rotation.x = .45; OB.push([vx, vz, 2.4], [vx, vz + 3, 1.6]); }
      // le carré des trampolines : le tapis noir, le cadre bleu et rouge, la haute barrière
      { const qx = -63.5, qz = -13.2, q = 2.8; box(q * 2, .5, q * 2 - 1, g(0xc8202a), qx, .25, qz); box(q * 2 - .4, .04, q * 2 - 1.4, g(0x1a1a1a, .8), qx, .52, qz);
        for (const [dx, dz] of [[-q, -q + .5], [q, -q + .5], [-q, q - .5], [q, q - .5]]) cyl(.07, .07, 3, g(0x2a6ac8), qx + dx, 1.5, qz + dz, 6); box(q * 2, .08, .08, g(0x2a6ac8), qx, 3, qz - q + .5); box(q * 2, .08, .08, g(0x2a6ac8), qx, 3, qz + q - .5);
        const fil = mat({ color: 0x3a3a3a, wireframe: true }); for (const dz of [-q + .5, q - .5]) box(q * 2, 2.4, .02, fil, qx, 1.7, qz + dz); OB.push([qx, qz, 3.2]); } }
    const n0J = scene.children.length, o0J = OB.length;
    void n0J; void o0J;
    { const grille = (x0, x1, z0, z1, m, dy) => { const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0, Math.ceil((x1 - x0) / 1.5), Math.ceil((z1 - z0) / 1.5)); g.rotateX(-Math.PI / 2); const pp = g.attributes.position;
        for (let i = 0; i < pp.count; i++) { const x = (x0 + x1) / 2 - pp.getX(i), z = pp.getZ(i) + (z0 + z1) / 2; pp.setY(i, HP(x, z) + dy); }   /* (la grille sera retournée : chaque sommet prend la hauteur de son reflet) */ g.computeVertexNormals(); const o = add(g, m, (x0 + x1) / 2, 0, (z0 + z1) / 2); L.solsPlus.push(o); return o; };
      grille(-90, -50, 10.6, 21.2, mat({ map: gravT, roughness: 1 }), .02); grille(-90, -50, 21.2, 34, mat({ map: herbeT, roughness: 1 }), -.02); grille(-90, -84.6, -22, 10.6, mat({ map: herbeT, roughness: 1 }), -.02); }
    /* (10.105, d'après la photo du bas de la rue) le mur de planches sous la terrasse des jeux, sa barrière de bois en haut ; la fresque de l'espace sur la paroi au-dessus du bassin ;
       les enseignes « Igloo » et « Location ski » ; les structures gonflables sur l'eau */
    { const planchM = mat({ map: boisSombre.clone(), roughness: .85 }); planchM.map.repeat.set(8, 2); planchM.map.needsUpdate = true; const bas = HP(-85, -16);
      const pw = add(new THREE.PlaneGeometry(11.6, -bas), planchM, -84.45, bas / 2, -16.3); pw.rotation.y = -Math.PI / 2;
      for (let z = -22; z <= -10.6; z += 1.9) box(.14, 1.1, .14, boisC, -84.35, .55, z); for (const y of [.5, 1.0]) box(.1, .1, 11.4, boisC, -84.35, y, -16.3); }
    /* (10.118, d'après la photo) sous la terrasse des jeux, face à la piscine : pas de mur peint, mais les portes et vitrines des boutiques et des restaurants
       (Le Wagon, Corbier Fromagerie, Galerie Charvin, Ski Presta Location, Agence immobilière, Location Ski, Igloo) ; devant, leurs terrasses, puis la clôture de verre */
    { const vT = tT(2048, 192, (c, w, h) => { c.fillStyle = "#6a3a22"; c.fillRect(0, 0, w, h); for (let y = 0; y < 50; y += 8) { c.fillStyle = "rgba(0,0,0,.2)"; c.fillRect(0, y, w, 2); }
        const E = [["LE WAGON", "#c8202a", "#f2e8d8"], ["Corbier FROMAGERIE", "#7ab83a", "#fff"], ["GALERIE CHARVIN", "#f2f2ee", "#3a3a3a"], ["SKI PRESTA LOCATION", "#f2f2ee", "#c8202a"], ["AGENCE IMMOBILIÈRE", "#f2f2ee", "#3a3a3a"], ["LOCATION SKI · SKI RENTAL", "#1a1a1a", "#fff"], ["igloo", "#f2f2ee", "#1a1a1a"]];
        E.forEach(([t, f, co], k) => { const x = 20 + k * 290; c.fillStyle = f; c.fillRect(x, 8, 240, 38); c.fillStyle = co; c.font = "bold 22px Arial"; c.textAlign = "center"; c.fillText(t, x + 120, 35); });
        for (let x = 6; x < w; x += 72) { const g = c.createLinearGradient(0, 56, 0, h); g.addColorStop(0, "#b8ccd4"); g.addColorStop(1, "#4a5a64"); c.fillStyle = g; c.fillRect(x, 56, 64, h - 62); c.fillStyle = "rgba(255,255,255,.25)"; c.fillRect(x + 4, 60, 18, h - 70); c.fillStyle = "rgba(60,40,30,.5)"; c.fillRect(x + 10, h - 50, 44, 6); c.fillStyle = "#5a3420"; c.fillRect(x - 6, 50, 6, h); } });
      const vf = add(new THREE.PlaneGeometry(23.4, -YP - .2), lum(mat({ map: vT, emissive: 0xffffff, emissiveMap: vT, emissiveIntensity: .1, roughness: .3 }), .1, .6), -72.3, YP / 2 - .1, -9.99); void vf;
      // les terrasses : tables, chaises, parasols blancs
      for (let x = -82; x < -62; x += 3.2) { cyl(.4, .4, .04, mat({ color: 0xf2f2f0, roughness: .3 }), x, YP + .76, -8.7, 14); cyl(.04, .04, .72, mat({ color: 0x2a2a2a }), x, YP + .4, -8.7, 6); for (const sg of [-1, 1]) box(.42, .5, .42, mat({ color: 0x2a2a2a }), x + sg * .65, YP + .3, -8.7); }
      for (const x of [-79, -71, -64]) { cyl(.04, .04, 2.6, mat({ color: 0xd8d8d8 }), x, YP + 1.3, -8.4, 5); add(new THREE.ConeGeometry(1.6, .5, 8, 1, true), mat({ color: 0xf2f2f0, side: THREE.DoubleSide }), x, YP + 2.6, -8.4); }
      // la clôture de verre entre les terrasses et la plage
      for (let x = -84; x < -60.5; x += 2) { box(1.95, 1.1, .03, mat({ color: 0xdcecf0, roughness: .05, transparent: true, opacity: .25, depthWrite: false }), x + 1, YP + .55, -7.4); box(.05, 1.2, .05, mat({ color: 0x9a9ea2, metalness: .6 }), x, YP + .6, -7.4); } }
    { const pan = (txt, fond, coul, z, w2) => { const t = tT(256, 64, (c, w, h) => { c.fillStyle = fond; c.fillRect(0, 0, w, h); c.fillStyle = coul; c.font = `bold 34px ${sans}`; c.textAlign = "center"; c.fillText(txt, w / 2, 45); }); const p2 = add(new THREE.PlaneGeometry(w2, .55), lum(mat({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: .12 }), .12, .8), -60.56, YP + 2.75, z); p2.rotation.y = -Math.PI / 2; };
      pan("IGLOO", "#f2f2ee", "#1a1a1a", 7.5, 2); pan("LOCATION SKI · SKI RENTAL", "#f2f2ee", "#c8202a", -6.5, 3.4); }
    // (les gonflables : retirés, comme sur la photo)
    { const pt2 = cyl(2.2, 2.2, .3, mat({ color: 0xe8ecee }), -64, YP + .05, 6.5, 24); void pt2; const e2 = add(new THREE.CircleGeometry(2, 24), mat({ color: 0x38c4e8, roughness: .04, emissive: 0x0a4a6a, emissiveIntensity: .3 }), -64, YP + .22, 6.5); e2.rotation.x = -Math.PI / 2; }   // (la pataugeoire ronde, au bout)
    // les grandes tours sombres derrière (Les Tours du Corbier)
    const tourT = tT(128, 256, (c, w, h) => { c.fillStyle = "#5a2618"; c.fillRect(0, 0, w, h); for (let y = 4; y < h; y += 16) { c.fillStyle = "rgba(20,10,6,.55)"; c.fillRect(0, y, w, 11); for (let x = 3; x < w; x += 21) { c.fillStyle = ["#1c1c22", "#2a2a30", "#3a3e44"][(x + y) % 3]; c.fillRect(x, y + 2, 15, 8); c.fillStyle = "rgba(200,200,200,.35)"; c.fillRect(x, y + 9, 15, 1); } c.fillStyle = "rgba(255,230,210,.18)"; c.fillRect(0, y + 11, w, 2); } c.fillStyle = "#e8e2d8"; c.fillRect(0, 0, 3, h); c.fillRect(w - 3, 0, 3, h); c.fillStyle = "rgba(232,226,216,.8)"; c.fillRect(w / 2 - 1, 0, 2, h); }, 3, 1);
    const tourM = lum(mat({ fog: false, map: tourT, emissive: 0xffc890, emissiveMap: null, emissiveIntensity: 0 }), 0, .08);
    for (const [x, z, h, w] of []) { box(w, h, 14, tourM, x, h / 2, z); box(w + 1, 1.2, 15, mat({ color: 0x3a2014 }), x, h + .6, z); }   // (la grande tour sombre, au bout du Yéti)
    const tourO = tT(128, 256, (c, w, h) => { c.fillStyle = "#4a2418"; c.fillRect(0, 0, w, h); for (let y = 4; y < h; y += 16) { c.fillStyle = "rgba(20,10,6,.55)"; c.fillRect(0, y, w, 11); for (let x = 3; x < w; x += 21) { c.fillStyle = ["#1c1c22", "#2a2a30", "#3a3e44"][(x + y) % 3]; c.fillRect(x, y + 2, 15, 8); c.fillStyle = "rgba(200,200,200,.35)"; c.fillRect(x, y + 9, 15, 1); } c.fillStyle = "rgba(255,230,210,.18)"; c.fillRect(0, y + 11, w, 2); } c.fillStyle = "#e8e2d8"; c.fillRect(0, 0, 3, h); c.fillRect(w - 3, 0, 3, h); c.fillStyle = "rgba(232,226,216,.8)"; c.fillRect(w / 2 - 1, 0, 2, h); }, 3, 1);
    for (const [x, z, h, w] of [[-104, -14, 50, 18], [-110, 10, 46, 16], [-100, 34, 42, 15]]) { box(w, h, 15, mat({ map: tourO, fog: false }), x, h / 2, z); box(w + 1, 1.2, 16, mat({ color: 0x5a2a12 }), x, h + .6, z); } }   // (les tours orangées, au bout de la piscine)

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
  /* la façade sur la piscine : « ESPACE FITNESS & MUSCULATION », la frise de grands triangles de couleur, l'agence immobilière, « LOCATION SKI » */
  { const fT = tT(1024, 256, (c, w, h) => { c.fillStyle = "#3a2a24"; c.fillRect(0, 0, w, h); const cs = ["#e8c030", "#2a5ab8", "#c82a3a", "#f2f2ee"]; for (let k = 0; k < 18; k++) { c.fillStyle = cs[k % 4]; c.beginPath(); const x = 160 + k * 46; c.moveTo(x, 150); c.lineTo(x + 40, 110 + (k % 3) * 20); c.lineTo(x + 26, 210); c.fill(); }
      c.fillStyle = "#1a2848"; c.fillRect(300, 10, 520, 80); c.fillStyle = "#fff"; c.font = `bold 50px ${sans}`; c.textAlign = "center"; c.fillText("FITNESS & MUSCULATION", 560, 74); c.font = "bold 18px Arial"; c.fillText("ESPACE", 560, 30);
      c.fillStyle = "#f2efe6"; c.fillRect(10, 20, 130, 70); c.fillStyle = "#2a2a2a"; c.font = "bold 16px Arial"; c.fillText("AGENCE", 75, 45); c.fillText("IMMOBILIÈRE", 75, 70); c.fillStyle = "#1a1a1a"; c.fillRect(150, 40, 140, 44); c.fillStyle = "#fff"; c.fillText("LOCATION SKI", 220, 68);
      c.fillStyle = "#1a3a5a"; c.fillRect(870, 60, 150, 190); c.fillStyle = "#e8c030"; c.beginPath(); c.arc(940, 130, 34, 0, 7); c.fill(); c.fillStyle = "#c83a2a"; c.beginPath(); c.arc(990, 200, 18, 0, 7); c.fill(); });
    const fm = add(new THREE.PlaneGeometry(20.4, 2.6), lum(mat({ map: fT, emissive: 0xffffff, emissiveMap: fT, emissiveIntensity: .1 }), .1, .6), -60.54, YP + 2.25, .1); fm.rotation.y = -Math.PI / 2; }
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
  /* (10.111) l'épicéa : le tronc brun, une dizaine d'étages de branches qui retombent, deux verts, la pointe ; légèrement de travers, chacun le sien */
  const sapinM2 = mat({ color: 0x1e3a22, roughness: .95 }), troncM = mat({ color: 0x4a3424, roughness: .9 });
  const sapin = (x, z, h = 12, m = sapinM) => { const y0 = L.hautPiste ? L.hautPiste(x, z) : 0; epicea(x, y0, z, h, m === melezeM ? .85 : 1); void sapinM2; void troncM; OB.push([x, z, .6]); };
  const buisson = (x, z, r = 1) => { const y0 = L.hautPiste ? L.hautPiste(x, z) : 0; for (let k = 0; k < 4; k++) { const b = add(new THREE.IcosahedronGeometry(r * (.6 + al() * .4), 1), [mat({ color: 0x3e6a2a, roughness: 1, flatShading: true }), mat({ color: 0x567a30, roughness: 1, flatShading: true }), mat({ color: 0x2e5222, roughness: 1, flatShading: true })][k % 3], x + (al() - .5) * r, y0 + r * .5 + al() * r * .3, z + (al() - .5) * r); b.scale.y = .75; } };
  for (const [x, z] of [[88, 4], [91, 9], [86, 12], [95, 2]]) bouleau(x, z, 9 + al() * 3);
  for (const [x, z, h] of [[93, -6, 14], [98, 6, 12], [-90, -16, 11], [-92, 20, 13], [-40, -14, 12], [24, -18, 15]]) sapin(x, z, h, al() < .4 ? melezeM : sapinM);
  for (let k = 0; k < 14; k++) sapin(-130 + k * 18 + al() * 6, -78 - al() * 30, 14 + al() * 8);   // la forêt, derrière les tours
  /* (10.111, d'après les photos de la promenade) les arbres et la végétation : les épicéas et mélèzes du talus, au bout côté Yéti et au bout côté piscine, les buissons le long des chemins */
  for (const [x, z, h] of [[-48, 24, 13], [-44, 27, 11], [-62, 20, 14], [72, 22, 12], [78, 26, 14], [86, 20, 11], [-20, 52, 12], [10, 56, 10]]) sapin(x, z, h, al() < .35 ? melezeM : sapinM);
  for (let k = 0; k < (PETIT ? 10 : 26); k++) { const x = -60 + al() * 140, z = 22 + al() * 22; if (Math.abs(x - 30) < 14 && z < 34) continue; buisson(x, z, .7 + al() * .7); }
  /* le mobilier de la promenade : les gros pots rouges et leur petit pin, les barrières de rondins, les bancs de bois contre les vitrines, les jardinières de géraniums roses */
  { const potR = mat({ color: 0xd84a3a, roughness: .55 }), terreM = mat({ color: 0x3a2a1e }), rondin = mat({ color: 0x9a7a58, roughness: .85 }), fleurR = [mat({ color: 0xe86a9a }), mat({ color: 0xf0a0c0 }), mat({ color: 0xffffff })], vertF = mat({ color: 0x3a6a2a });
    for (const x of [-30, -6, 18, 42]) { cyl(.7, .5, .75, potR, x, .4, 5.4, 16); cyl(.62, .62, .04, terreM, x, .76, 5.4, 14); cyl(.04, .05, 1.6, mat({ color: 0xd8d0c0 }), x, 1.5, 5.4, 5); for (let k = 0; k < 4; k++) add(new THREE.IcosahedronGeometry(.5 - k * .08, 1), [vertF, mat({ color: 0x4a7a32 })][k % 2], x + (al() - .5) * .3, 2.0 + k * .32, 5.4 + (al() - .5) * .3); OB.push([x, 5.4, .9]); }
    for (const x of [-22, 6, 30]) { for (const sx of [-1.4, 1.4]) { for (const sg of [-1, 1]) { const j = cyl(.06, .06, .9, rondin, x + sx, .4, 6.2, 6); j.rotation.x = sg * .5; } } for (const y of [.45, .7]) { const r = cyl(.08, .08, 3.2, rondin, x, y, 6.2, 8); r.rotation.z = Math.PI / 2; } OB.push([x - 1, 6.2, .5], [x + 1, 6.2, .5]); }
    for (const x of [-14, 2, 14, 26, 38, 50]) { for (let k = 0; k < 3; k++) box(1.6, .05, .12, boisC, x, .46, .85 + k * .14); for (const sx of [-.7, .7]) box(.08, .46, .4, mat({ color: 0x3a2a1a }), x + sx, .23, 1); box(1.6, .3, .05, boisC, x, .72, .7); OB.push([x, 1, .9]); }
    for (const x of [-26, 10, 34, 54]) { box(1.8, .4, .5, boisC, x, .2, 6.6); for (let k = 0; k < 14; k++) add(new THREE.IcosahedronGeometry(.12, 0), k % 4 === 3 ? vertF : fleurR[k % 3], x - .8 + al() * 1.6, .48 + al() * .2, 6.6 + (al() - .5) * .35); OB.push([x, 6.6, 1]); } }

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
  /* (10.121, d'après les photos) au bout, après le Yéti : le mélèze ; la grande tour blanche aux balcons crème et aux cadres bruns (en bas, Interhome, La Fine Bouche,
     les stores bleus de La Godille, Chauvin Immobilier) ; puis la tour sombre en bois, en retrait ; devant elle, les bâtiments bas à deux étages, tous collés
     (la location de skis, Ski rental, Sport 2000), jusqu'au pub Le Sinoze et sa terrasse à balustrade de bois ; au bout, les barrières de bois qui ferment l'herbe */
  { const orange = mat({ map: planches("#a8582c", "255,200,150") }), blancP = mat({ color: 0xf2f0ea, roughness: .7 }), brunC = mat({ color: 0x4a2418, roughness: .7 }), creme = mat({ color: 0xe8e0d0, roughness: .8 });
    const vitreN = mat({ color: 0x2a3036, roughness: .1, metalness: .3, transparent: true, opacity: .6 }), verreR = mat({ color: 0xdcecf0, roughness: .05, transparent: true, opacity: .3, depthWrite: false });
    const XF = 158;   // (le bout)
    sapin(84.2, 10.5, 15, melezeM);
    // la grande tour blanche
    { const x0 = 86, x1 = 110, cx = (x0 + x1) / 2, W = x1 - x0, N = 11, H0 = 3.4, HE = 3, HT = H0 + N * HE;
      const coteT = tT(128, 256, (c, w, h) => { c.fillStyle = "#7a4a34"; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 4) { c.fillStyle = `rgba(${x % 8 ? "255,220,190" : "40,20,10"},.08)`; c.fillRect(x, 0, 2, h); } for (let y = 20; y < h; y += 23) { c.fillStyle = "#ece6da"; c.fillRect(w * .35, y, w * .65, 3); } }, 1, 1);
      box(W, HT, 11, mat({ map: coteT }), cx, HT / 2, -6.6); box(W + .6, 1.4, 12, mat({ color: 0x8a4a2a, roughness: .7 }), cx, HT + .5, -6.4);
      const etT = tT(1024, 128, (c, w, h) => { c.fillStyle = "#ece6da"; c.fillRect(0, 0, w, h); c.fillStyle = "#d8d0c2"; c.fillRect(0, 0, w, 30); for (let x = 0; x < w; x += 146) { const k = (x / 146) % 3; c.fillStyle = ["#3a4048", "#4a4c52", "#6a4a36"][k]; c.fillRect(x + 18, 40, 110, h - 40); c.fillStyle = "rgba(240,236,228,.85)"; if (k !== 2) for (let m = 0; m < 3; m++) c.fillRect(x + 22 + m * 36, 46, 28, h - 52); c.fillStyle = "#5a2a1a"; for (let m = 0; m < 4; m++) c.fillRect(x + 18 + m * 36, 40, 3, h - 40); } }, 1, N);
      add(new THREE.PlaneGeometry(W, N * HE), mat({ map: etT, roughness: .7 }), cx, H0 + N * HE / 2, -.98);
      for (let k = 0; k <= N; k++) { const y = H0 + k * HE, zb = k ? .4 : 2.4; if (k) box(W, .32, 1.7, creme, cx, y, -.2); else box(W, .4, 3.5, creme, cx, y, .7); if (k < N) { box(W, .95, .03, verreR, cx, y + .6, zb); box(W, .05, .06, brunC, cx, y + 1.08, zb); } }
      for (let i = 0; i <= 8; i++) { const x = x0 + .15 + i * (W - .3) / 8; box(.24, H0 - .2, .24, brunC, x, (H0 - .2) / 2, 2.25); OB.push([x, 2.25, .3]); }   // (10.122 : le porche, sous le premier balcon)
      for (let i = 0; i <= 8; i++) { const x = x0 + .15 + i * (W - .3) / 8; box(.22, N * HE, 1.6, brunC, x, H0 + N * HE / 2, -.25); }
      // en bas, de la droite vers la gauche : Interhome, La Fine Bouche (deux vitrines), Location, La Godille, Vente, Chauvin Immobilier
      const bT = tT(2048, 128, (c, w, h) => { const m = w / W; c.fillStyle = "#6a3a22"; c.fillRect(0, 0, w, h);
        const R = (a, b) => [(x1 - b) * m, (b - a) * m];   // (la scène est retournée : l'est du monde d'origine est à gauche de l'image)
        const vitrines = (a, b, pas, f) => { const [l, L2] = R(a, b); for (let x = l; x < l + L2 - 10; x += pas) f(x); };
        { const [l, L2] = R(86.2, 89.6); c.fillStyle = "#f4f4f2"; c.fillRect(l, 4, L2, 26); c.fillStyle = "#1a5ab8"; c.font = `bold 22px ${sans}`; c.fillText("Interhome", l + 8, 25); c.fillStyle = "#e85a1a"; c.beginPath(); c.arc(l + L2 - 18, 17, 8, 0, 7); c.fill(); }
        vitrines(86.3, 89.5, 46, (x) => { c.fillStyle = "#a8582c"; c.fillRect(x, 34, 42, h - 34); c.fillStyle = "#5a4a40"; c.fillRect(x + 5, 40, 32, h - 44); });
        vitrines(89.7, 97, 100, (x) => { c.fillStyle = "#a8682c"; c.fillRect(x, 30, 96, h - 30); c.fillStyle = "#f2f0ea"; c.fillRect(x + 6, 36, 84, h - 40); });
        vitrines(97.1, 107.5, 92, (x) => { c.fillStyle = "#8a5a30"; c.fillRect(x, 30, 88, h - 30); for (let yy = 36; yy < h; yy += 18) for (let xx = x + 6; xx < x + 82; xx += 10) { c.fillStyle = (xx + yy) % 20 < 10 ? "#f2f2ee" : "#5a5e66"; c.fillRect(xx, yy, 7, 12); } });
        { const [l, L2] = R(107.6, 110); c.fillStyle = "#f2efe6"; c.fillRect(l + 4, 4, L2 - 8, 28); c.fillStyle = "#5a2a1a"; c.font = `bold 17px ${serif}`; c.textAlign = "center"; c.fillText("CHAUVIN IMMOBILIER", l + L2 / 2, 24); c.textAlign = "left";
          c.fillStyle = "#8a6a4a"; c.fillRect(l + 8, 36, L2 - 16, h - 40); for (let yy = 40; yy < h - 8; yy += 13) for (let xx = l + 12; xx < l + L2 - 24; xx += 20) { c.fillStyle = "#f4f2ee"; c.fillRect(xx, yy, 15, 9); c.fillStyle = "#c84a3a"; c.fillRect(xx + 2, yy + 2, 6, 3); } } });
      add(new THREE.PlaneGeometry(W, H0), lum(mat({ map: bT, emissive: 0xffffff, emissiveMap: bT, emissiveIntensity: .08 }), .08, .5), cx, H0 / 2, -.97);
      const store = (xa, xb, txt, coul) => { const rT = tT(256, 64, (c, w, h) => { for (let x = 0; x < w; x += 16) { c.fillStyle = (x / 16) % 2 ? "#f4f4f2" : coul; c.fillRect(x, 0, 16, h); } });
        const st = box(xb - xa, .04, 1.3, mat({ map: rT, roughness: .8 }), (xa + xb) / 2, 3.05, -.4); st.rotation.x = .35; const rouge = coul === "#c8202a";
        const tx = tT(512, 64, (c, w, h) => { c.fillStyle = coul; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 12) { c.fillStyle = "#f4f4f2"; c.fillRect(x, 0, 6, 8); } c.fillStyle = rouge ? "#fff" : "#f0e040"; c.font = `${rouge ? "italic " : ""}bold 34px ${rouge ? serif : sans}`; c.textAlign = "center"; c.fillText(txt, w / 2, 48); });
        add(new THREE.PlaneGeometry(xb - xa, .38), mat({ map: tx }), (xa + xb) / 2, 2.62, .22); };
      store(89.7, 93.3, "La Fine Bouche", "#c8202a"); store(93.4, 97, "La Fine Bouche", "#c8202a"); store(97.1, 100.6, "LOCATION", "#2a5ab8"); store(100.7, 104.2, "LA - GODILLE . COM", "#2a5ab8"); store(104.3, 107.5, "VENTE", "#2a5ab8");
      for (let x = 86.3; x < 89.6; x += .5) box(.05, .9, .05, mat({ color: 0x8a4a2a }), x, H0 + .6, .3);   // (le balcon de bois au-dessus d'Interhome)
      for (const x of [92, 98.8, 105.5]) jardiniere(x, .6); }
    // la tour sombre en bois, en retrait, derrière les bâtiments bas : le bois brun, les loggias aux plafonds crème
    const tourS = tT(256, 512, (c, w, h) => { c.fillStyle = "#6a4a30"; c.fillRect(0, 0, w, h); for (let y = 6; y < h; y += 24) for (let x = 6; x < w; x += 42) { c.fillStyle = "#e0c890"; c.fillRect(x, y, 36, 8); c.fillStyle = "#2a2a2e"; c.fillRect(x, y + 8, 36, 10); c.fillStyle = "rgba(220,230,235,.5)"; c.fillRect(x, y + 14, 36, 4); } }, 2, 3);
    { const x0 = 112, x1 = 134, H = 44; box(x1 - x0, H, 15, mat({ map: tourS, fog: false }), (x0 + x1) / 2, H / 2, -22); box(x1 - x0 + 1.2, 1.4, 16, mat({ color: 0x6a3a1e }), (x0 + x1) / 2, H + .7, -22); }
    // les bâtiments bas à deux étages, tous collés : le rez-de-chaussée sous la galerie blanche, le premier aux volets roulants, le second à la galerie de bois orange
    const deuxEt = (x0, x1, enseignes) => { const cx = (x0 + x1) / 2, W = x1 - x0;
      box(W, 8.2, 10, orange, cx, 4.1, -6.6);
      const rdcT = tT(Math.round(W * 60), 128, (c, w, h) => { c.fillStyle = "#e8e2d4"; c.fillRect(0, 0, w, h); c.fillStyle = "#f4f2ec"; c.fillRect(0, 0, w, 28);
        for (let x = 10; x < w; x += 120) { c.fillStyle = "#5a3420"; c.fillRect(x, 34, 108, h - 34); c.fillStyle = "#7a8a94"; c.fillRect(x + 6, 40, 44, h - 46); c.fillRect(x + 58, 40, 44, h - 46); c.fillStyle = "rgba(255,255,255,.25)"; c.fillRect(x + 8, 42, 10, h - 50); }
        for (const [u, t, f, co] of enseignes) { c.fillStyle = f; c.font = `bold 20px ${sans}`; const tw = c.measureText(t).width + 20; c.fillRect(u * w, 3, tw, 24); c.fillStyle = co; c.fillText(t, u * w + 10, 21); } });
      add(new THREE.PlaneGeometry(W, 3.2), lum(mat({ map: rdcT, emissive: 0xffffff, emissiveMap: rdcT, emissiveIntensity: .08 }), .08, .5), cx, 1.6, -1.58);
      const n = Math.max(2, Math.round(W / 3.4)); for (let k = 0; k <= n; k++) { const x = x0 + .2 + k * (W - .4) / n; box(.22, 3.2, .22, blancP, x, 1.6, 2.2); OB.push([x, 2.2, .3]); }
      box(W, .3, 4, blancP, cx, 3.35, .4); box(W, 1.1, .25, orange, cx, 4.05, 2.25);   // (10.122 : le porche ; au-dessus, le bandeau de bois du balcon)
      const voletT = tT(256, 64, (c, w, h) => { c.fillStyle = "#4a4a4c"; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 4) { c.fillStyle = "rgba(0,0,0,.3)"; c.fillRect(0, y, w, 1); } }, Math.max(1, Math.round(W / 4)), 1);
      add(new THREE.PlaneGeometry(W, 1.6), mat({ map: voletT }), cx, 4.5, -1.58);
      box(W, 1.1, .25, orange, cx, 5.95, -.35); box(W, .2, 1.5, blancP, cx, 6.55, -.9);
      add(new THREE.PlaneGeometry(W, 1.7), vitreN, cx, 7.4, -1.58);
      for (let k = 0; k <= n; k++) { const x = x0 + .2 + k * (W - .4) / n; box(.25, 1.8, .25, orange, x, 7.55, -.3); const br = box(.12, 1.3, .12, orange, x, 7.9, -.9); br.rotation.x = .7; }
      box(W, .9, .05, mat({ color: 0x1e2226, roughness: .1, transparent: true, opacity: .55 }), cx, 7.1, -.3);
      box(W + .3, .9, 2.2, orange, cx, 8.65, -1.3); };
    deuxEt(110, 124, [[.02, "SPORT 2000", "#c8202a", "#fff"], [.3, "LOCATION DE SKIS", "#f4f2ec", "#c8202a"], [.68, "Ski rental", "#f4f2ec", "#555"]]);
    deuxEt(124, 140, [[.1, "LOCATION · SKI SHOP", "#f4f2ec", "#2a5ab8"], [.6, "Ski rental", "#f4f2ec", "#555"]]);
    // le pub Le Sinoze, au pied : la façade de bois, l'enseigne « La Bouille », la terrasse et sa balustrade de bois découpée
    { const x0 = 140, x1 = XF - 2, cx = (x0 + x1) / 2, W = x1 - x0;
      box(W, 8.2, 10, orange, cx, 4.1, -6.6);
      const sT = tT(1024, 160, (c, w, h) => { c.fillStyle = "#7a4426"; c.fillRect(0, 0, w, h); c.fillStyle = "#b8784a"; c.fillRect(0, 0, w, 40); c.fillStyle = "#f2e8d8"; c.font = `italic bold 30px ${serif}`; c.fillText("Bar - Restaurant   LA BOUILLE   Spécialités savoyardes", 20, 30);
        for (let x = 30; x < w; x += 150) { c.fillStyle = "#5a3018"; c.fillRect(x, 50, 120, h - 50); c.fillStyle = "#3a3a3e"; c.fillRect(x + 10, 60, 100, h - 70); } });
      add(new THREE.PlaneGeometry(W, 3.6), lum(mat({ map: sT, emissive: 0xffffff, emissiveMap: sT, emissiveIntensity: .1 }), .1, .6), cx, 1.8, -1.58);
      box(W, .9, 1.4, orange, cx, 4.2, -.9);
      for (let x = x0 + .4; x < x1; x += .45) box(.3, .9, .04, mat({ color: 0x8a5a38 }), x, 4.95, -.25);   // (la balustrade découpée du balcon)
      add(new THREE.PlaneGeometry(W, 3), vitreN, cx, 6.6, -1.58); box(W + .3, .9, 2.2, orange, cx, 8.65, -1.3);
      // la terrasse de planches, sa balustrade, l'enseigne « Le Sinoze, pub restaurant »
      const d = add(new THREE.PlaneGeometry(W, 6), mat({ map: deckT, roughness: .8 }), cx, .12, 1.4); d.rotation.x = -Math.PI / 2;
      for (let x = x0; x < x1; x += .3) box(.22, .9, .04, mat({ color: 0x6a4a32 }), x, .55, 4.4); box(W, .1, .12, mat({ color: 0x5a3a26 }), cx, 1.02, 4.4); box(W, .1, .12, mat({ color: 0x5a3a26 }), cx, .2, 4.4);
      const pT = tT(512, 192, (c, w, h) => { c.fillStyle = "#f2f0ec"; c.fillRect(0, 0, w, h); c.strokeStyle = "#7a5a3a"; c.lineWidth = 10; c.beginPath(); c.arc(80, 96, 60, 0, 7); c.stroke(); c.fillStyle = "#3a2a1e"; c.font = `italic bold 76px ${serif}`; c.fillText("Sino", 160, 110); c.fillStyle = "#3a9ad8"; c.fillText("Ze", 320, 110); c.fillStyle = "#555"; c.font = `24px ${sans}`; c.fillText("PUB   RESTAURANT", 170, 160); });
      add(new THREE.PlaneGeometry(3.4, 1.3), mat({ map: pT }), x0 + 3, 1.4, 4.47);
      { const vC = mat({ color: 0x4a6a5a, roughness: .5 }); for (let k = 0; k < 3; k++) for (let q = 0; q < 6; q++) box(.46, .04, .44, vC, x0 + 6 + k * .6, .5 + q * .12, 2.6); OB.push([x0 + 6.6, 2.6, 1.2]); } }
    // le sol devant : les dalles ; au bout, les barrières de bois (deux lisses sur des poteaux)
    L.solsPlus.push(sol(82.5, XF, -1, 7.6, mat({ map: dalleT, roughness: .85 }), .03), sol(100, XF, 7.6, 16.5, mat({ map: gravT, roughness: 1 }), .01));
    const rond = mat({ color: 0x8a6a48, roughness: .85 });
    const barriere = (xa, za, xb, zb) => { const L2 = Math.hypot(xb - xa, zb - za), n = Math.max(1, Math.round(L2 / 2.2)), a = Math.atan2(zb - za, xb - xa);
      for (let k = 0; k <= n; k++) { const x = xa + (xb - xa) * k / n, z = za + (zb - za) * k / n; cyl(.08, .09, 1.1, rond, x, .55, z, 6); OB.push([x, z, .25]); }
      for (const y of [.45, .9]) { const l = cyl(.05, .05, L2, rond, (xa + xb) / 2, y, (za + zb) / 2, 6); l.rotation.z = Math.PI / 2; l.rotation.y = -a; } };
    barriere(XF - .2, -.9, XF - .2, 16.4); barriere(96, 16.4, XF - .2, 16.4); }

  L.limites = (x, z) => libre(x, z) && ((x > 82.6 && x < 157.8 && z > .3 && z < 16.2) || (x > -60.2 && x < 96 && z > 7.6 && z < 34) || (x > -84 && x < -50 && z >= 10.75 && z < 21) || (x > -60.2 && x < -48.2 && z > -22 && z < 7.6)  || (x > -84 && x < -60 && z > -22 && z < -10.8) || (x > -38.6 && x < 82 && z > zfAt(x) + .5 && z < 7.6) || (x > -71.5 && x < -40.5 && z > 14 && z < 16.4) || (x > -12.6 && x < -9.8 && z > .3 && z < 1.1));
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
