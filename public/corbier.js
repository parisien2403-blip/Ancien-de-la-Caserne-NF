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
  /* (10.126) les vraies textures du sol : la photo remplace le dessin dès qu'elle est chargée ; m = mètres couverts par une tuile (la taille réelle, partout la même) */
  const NRM = new Map(), TLn = new THREE.TextureLoader(), relief = (t, url) => { const n = TLn.load(url); n.wrapS = n.wrapT = THREE.RepeatWrapping; n.anisotropy = 8; NRM.set(t.source, n); return t; };   /* (10.126 : le relief des rainures, posé par la passe des coordonnées) */
  const vraie = (t, url, m) => { t.repeat.set(1, 1); t.userData.m = m; t.anisotropy = 8; const tous = [t], cl = t.clone.bind(t); t.clone = () => { const c = cl(); tous.push(c); return c; };   /* (les copies suivent aussi la photo) */
    const i = new Image(); i.onload = () => { for (const x of tous) { x.dispose(); x.image = i; x.needsUpdate = true; } }; i.src = url; return t; };   /* (dispose : la photo n'a pas la taille du dessin) */
  /* (10.164) un chevalet en A : deux panneaux qui se rejoignent en haut, l'affiche à l'endroit sur chaque face extérieure, le cadre sombre derrière */
  const panA = (g, m, w, h, ec, inc) => { const dos = new THREE.MeshStandardMaterial({ color: 0x3a2a1e, roughness: .8 });
    ec = (h + .06) * Math.sin(inc) + .015;   /* (10.127 : les pieds assez écartés pour que les deux panneaux se rejoignent en haut — un A, pas un X) */
    for (const sg of [-1, 1]) { const pv = new THREE.Group(); pv.position.set(0, 0, sg * ec); pv.rotation.x = -sg * inc; g.add(pv);
      const b = new THREE.Mesh(new THREE.BoxGeometry(w + .04, h + .04, .025), dos); b.position.y = h / 2 + .02; pv.add(b);
      const f = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); f.position.set(0, h / 2 + .02, sg * .014); if (sg < 0) f.rotation.y = Math.PI; pv.add(f); } };
  const add = (geo, m, x, y, z, ry = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.y = ry; o.receiveShadow = true; scene.add(o); return o; };
  const deux = (o) => { o.material.side = THREE.FrontSide; const c = o.clone(); c.rotateY(Math.PI); scene.add(c); return o; };   // (10.164 : un panneau lisible des deux côtés, jamais à l'envers)
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
  const ARB = []; L.arbres = ARB;
  const loinLigne = (x, z) => { const ax = 80, az = 50, bx = 80 + Math.sin(.35) * 235, bz = 50 + Math.cos(.35) * 235, vx = bx - ax, vz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz))); return Math.hypot(x - ax - vx * t, z - az - vz * t) > 7; };   /* (10.137 : pas de sapin sous le télésiège) */
  const epicea = (x, y, z, h, w = 1) => { if (!loinLigne(x, z)) return; ARB.push([-x, z, h * w * .28 + .6]);   /* (10.136 : les arbres, en coordonnées du monde : la trottinette les évite) */ const m = new THREE.Mesh(EPI.geos[(Math.abs(x * 7 + z * 13) | 0) % 4], EPI.mat); m.position.set(x, y, z); m.scale.set(h * w * (.9 + al() * .2), h, h * w * (.9 + al() * .2)); m.rotation.y = al() * 6.28; m.receiveShadow = true; scene.add(m); return m; };
  const NUIT = []; const lum = (m, j, n) => { NUIT.push([m, j, n]); return m; };
  /* (10.128) les portes battantes : chaque vantail tourne sur ses gonds et s'ouvre quand on approche (base, sens : avant le passage du miroir) */
  const PORTES = [], porteBat = (hx, y, hz, base, sens, dir, larg, haut, m, cx, cz) => { const g = new THREE.Group(); g.position.set(hx, y, hz); g.rotation.y = base; g.userData.anime = true;
    const f = new THREE.Mesh(new THREE.BoxGeometry(.06, haut, larg - .04), m); f.position.z = dir * larg / 2; g.add(f);
    for (const sx of [-1, 1]) { const b = new THREE.Mesh(new THREE.BoxGeometry(.05, .05, larg * .55), mat({ color: 0xb8bcc0, metalness: .6, roughness: .4 })); b.position.set(sx * .07, -.05, dir * larg * .55); g.add(b); }
    scene.add(g); PORTES.push({ g, base, sens, cx, cz, a: 0 }); return g; };
  const serif = "Georgia, 'Times New Roman', serif", sans = "Arial, Helvetica, sans-serif";
  const fit = (c, txt, maxW, px, font) => { let p = px; c.font = font.replace("@", p + "px"); while (c.measureText(txt).width > maxW && p > 8) { p -= 2; c.font = font.replace("@", p + "px"); } };
  const OB = [];
  const SIEGE = (x, z, ry, h = .46) => { const o = new THREE.Object3D(); o.position.set(x, 0, z); o.rotation.y = ry; o.userData.siege = h; scene.add(o); };   /* (10.127 : une place où s'asseoir — suit les décalages et le miroir comme le reste) */
  const banc2 = (x, z, ry, h = .46) => { for (const s of [-.45, .45]) SIEGE(x + Math.cos(ry) * s, z - Math.sin(ry) * s, ry, h); };   // (les obstacles ronds : [x, z, rayon])

  /* ---------- les matières : le bois des façades (planches verticales, brun-rouge ou gris délavé), le platelage, le gravier, l'herbe ---------- */
  const planches = (base, var2) => tT(128, 128, (c, w, h) => { c.fillStyle = base; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 8) { const k = (x * 13 % 7) / 7; c.fillStyle = `rgba(${var2},${.1 + k * .18})`; c.fillRect(x, 0, 7, h); c.fillStyle = "rgba(0,0,0,.28)"; c.fillRect(x + 7, 0, 1, h); }
    for (let i = 0; i < 60; i++) { c.fillStyle = "rgba(0,0,0,.08)"; c.fillRect((i * 37) % w, (i * 53) % h, 1, 6 + i % 9); } }, 1, 1);
  const boisRouge = relief(vraie(planches("#8a4a2c", "255,190,150"), "images/corbier-sol/bardage-rouge.jpg", [1.2, 2.4]), "images/corbier-sol/bardage-rouge-n.jpg"), boisGris = relief(vraie(planches("#7a6a58", "220,210,190"), "images/corbier-sol/bardage-gris.jpg", [1.2, 2.4]), "images/corbier-sol/bardage-gris-n.jpg"), boisSombre = relief(vraie(planches("#4a2c1c", "200,140,100"), "images/corbier-sol/bardage-sombre.jpg", [1.2, 2.4]), "images/corbier-sol/bardage-sombre-n.jpg");   // (10.126 : le vrai bardage de mélèze, planches de 12 cm)
  const facR = mat({ map: boisRouge }), facG = mat({ map: boisGris }), facS = mat({ map: boisSombre }), boisC = mat({ color: 0x6a3e22, roughness: .7 }), blancB = mat({ color: 0xece8e0, roughness: .8 });
  const deckT = vraie(tT(256, 256, (c, w, h) => { c.fillStyle = "#a08670"; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 16) { const k = (y * 7) % 5; c.fillStyle = `rgba(${k % 2 ? "255,240,220" : "60,40,30"},${.06 + k * .02})`; c.fillRect(0, y, w, 15); c.fillStyle = "rgba(40,28,20,.45)"; c.fillRect(0, y + 15, w, 1); for (let x = (y * 3) % 90; x < w; x += 90 + (y % 40)) { c.fillStyle = "rgba(40,28,20,.35)"; c.fillRect(x, y, 1, 15); } } }, 6, 2), "images/corbier-sol/platelage.jpg", 2); relief(deckT, "images/corbier-sol/platelage-n.jpg");
  /* (10.111) le chemin de terre battue : le fond beige-ocre, les cailloux, les graviers clairs, les traces plus sombres, quelques touffes au bord */
  const gravT = vraie(tT(512, 512, (c, w, h) => { c.fillStyle = "#b8a88e"; c.fillRect(0, 0, w, h); for (let i = 0; i < 90; i++) { c.fillStyle = `rgba(${al() < .5 ? "120,100,70" : "220,210,190"},${.06 + al() * .08})`; c.beginPath(); c.ellipse(al() * w, al() * h, 20 + al() * 60, 8 + al() * 26, al() * 3, 0, 7); c.fill(); }
    for (let i = 0; i < 5200; i++) { const r = .6 + al() * 1.8; c.fillStyle = ["#8a7a62", "#d8ccb4", "#6e6252", "#c4b498", "#9a9088", "#e6dccb"][i % 6]; c.beginPath(); c.arc(al() * w, al() * h, r, 0, 7); c.fill(); }
    for (let i = 0; i < 70; i++) { const x = al() * w, y = al() * h, r = 2 + al() * 4; c.fillStyle = ["#a8a098", "#8c847a", "#c8c0b4"][i % 3]; c.beginPath(); c.ellipse(x, y, r * 1.3, r, al() * 3, 0, 7); c.fill(); c.fillStyle = "rgba(40,30,20,.25)"; c.beginPath(); c.ellipse(x + 1, y + 1.5, r * 1.2, r * .6, 0, 0, 7); c.fill(); } }, 22, 5), "images/corbier-sol/gravier.jpg", 3);
  const terreT = vraie(tT(8, 8, (c, w, h) => { c.fillStyle = "#c4b6a0"; c.fillRect(0, 0, w, h); }, 1, 1), "images/corbier-sol/terre.jpg", 4);   // (la terre battue beige, devant la promenade et au bout)
  /* l'herbe : les taches plus claires et plus sombres, les brins dressés, des touffes jaunies, quelques fleurs blanches et jaunes */
  const herbeT = vraie(tT(512, 512, (c, w, h) => { c.fillStyle = "#5f8434"; c.fillRect(0, 0, w, h); for (let i = 0; i < 110; i++) { c.fillStyle = `rgba(${["70,110,40", "120,150,60", "150,140,70", "40,80,30"][i % 4]},.18)`; c.beginPath(); c.ellipse(al() * w, al() * h, 18 + al() * 50, 12 + al() * 30, al() * 3, 0, 7); c.fill(); }
    c.lineWidth = 1.4; for (let i = 0; i < 9000; i++) { const x = al() * w, y = al() * h, l = 3 + al() * 6; c.strokeStyle = ["#4c7028", "#6e9a3c", "#86a84a", "#3c5e22", "#9aa858"][i % 5]; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (al() - .5) * 2.5, y - l); c.stroke(); }
    for (let i = 0; i < 160; i++) { c.fillStyle = ["#f4f2ea", "#f0d040", "#e8e0f0"][i % 3]; c.beginPath(); c.arc(al() * w, al() * h, 1.2, 0, 7); c.fill(); } }, 50, 25), "images/corbier-sol/herbe.jpg", 6);
  /* le bardage du bandeau : les planches verticales de mélèze, grisées par le soleil, les veines plus claires, les joints sombres */
  const bardT = vraie(tT(256, 128, (c, w, h) => { c.fillStyle = "#7e6a56"; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 6) { const k = (x * 7 % 11) / 11; c.fillStyle = `rgba(${k > .5 ? "200,190,175" : "70,50,35"},${.12 + k * .2})`; c.fillRect(x, 0, 5, h); c.fillStyle = "rgba(30,20,12,.45)"; c.fillRect(x + 5, 0, 1, h); }
    for (let i = 0; i < 200; i++) { c.fillStyle = `rgba(${al() < .5 ? "230,225,210" : "50,35,25"},.12)`; c.fillRect(al() * w, al() * h, 1, 8 + al() * 30); } c.fillStyle = "rgba(20,12,8,.35)"; c.fillRect(0, h - 6, w, 6); }, 1, 1), "images/corbier-sol/bardage-gris.jpg", [1.2, 2.4]); relief(bardT, "images/corbier-sol/bardage-gris-n.jpg");
  const dalleT = tT(256, 256, (c, w, h) => { c.fillStyle = "#d8ccb4"; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 32) for (let x = (y / 32 % 2) * 24; x < w; x += 48) { c.fillStyle = ["#e0d4bc", "#cfc2a8", "#d8cab0"][(x + y) % 3]; c.fillRect(x + 1, y + 1, 46, 30); } }, 4, 2);

  /* ---------- le sol : le platelage de la promenade, le parking de gravier, l'herbe, et la vallée qui descend ---------- */
  const sol = (x0, x1, z0, z1, m, y = 0) => { const s = add(new THREE.PlaneGeometry(x1 - x0, z1 - z0), m, (x0 + x1) / 2, y, (z0 + z1) / 2); s.rotation.x = -Math.PI / 2; return s; };
  /* (10.104) la rue qui descend : depuis le petit restaurant jusqu'au bas de la piscine, au fond, la pente — trois mètres de moins au bout ; l'herbe à côté suit */
  const DESC = (x, z) => { const u = Math.min(1, Math.max(0, (-50 - x) / 33)), f = z < 21 ? 1 : z > 34 ? 0 : 1 - (z - 21) / 13; return z < 10.5 && x > -84.5 ? 0 : -3.45 * u * u * (3 - 2 * u) * f * f * (3 - 2 * f); };   /* (en bas, la rue arrive au niveau des plages de la piscine) */   // (au bout, derrière la piscine, le terrain est descendu lui aussi)
  { const hm = mat({ map: herbeT, roughness: 1 }); L.sol = sol(-400, 400, 34, 400, hm, -.02); L.solsPlus = [sol(-400, -90, 14, 34, hm, -.02), sol(-50, 400, 14, 34, hm, -.02), sol(-400, 400, -300, -22, hm, -.02), sol(-400, -90, -22, -10, hm, -.02), sol(-84.6, 84, -22, -10, hm, -.02), sol(96, 400, -22, -10, hm, -.02), sol(84, 96, -22, -20, hm, -.02), sol(-400, -84, -10, 14, hm, -.02), sol(-50, -38.6, -10, 14, hm, -.02), sol(-38.6, -36.6, -10, -6.34, hm, -.02), sol(-38.6, -36.6, -3.48, 14, hm, -.02), sol(-35.2, 84, -10, 14, hm, -.02), sol(-36.6, -35.2, -10, -6.2, hm, -.02), sol(-36.6, -35.2, -3.6, 14, hm, -.02), sol(96, 400, -10, 14, hm, -.02), sol(84, 96, 5.6, 14, hm, -.02), sol(84, 87.6, -1, 5.6, hm, -.02), sol(92.4, 96, -1, 5.6, hm, -.02), sol(-60.5, -50, -10, 10.4, hm, -.02)]; }   /* (le trou : la piscine en contrebas) */
  L.solsPlus.push(sol(-48, 66, -3.6, 7, mat({ map: deckT, roughness: .8 }), .03),   /* (10.123 : le platelage clair va jusqu'au pied des façades, dans les renfoncements aussi) */ sol(-48, -36, 7, 10.4, mat({ map: deckT, roughness: .8 }), .034),   /* (10.120 : le platelage va jusqu'au bâtiment, et avance en L jusqu'à son bout) */ sol(-50, 100, 7, 16, mat({ map: terreT, roughness: 1 }), .01), sol(66, 84, 0, 8, mat({ map: dalleT, roughness: .8 }), .03));
  for (const [x0, x1] of [[-36, 66]]) box(x1 - x0, .08, .2, boisC, (x0 + x1) / 2, .04, 7); box(12, .08, .2, boisC, -42, .04, 10.4); box(.2, .08, 3.4, boisC, -36, .04, 8.7);   // (le rebord du platelage)

  /* ---------- les montagnes de la Maurienne tout autour : les crêtes, les pentes d'herbe, les rochers ; quelques sommets plus hauts ---------- */
  { const geo = new THREE.BufferGeometry(), P = [], C = [], N = 160;
    const crete = (R0, H0, k, teinte) => { for (let i = 0; i < N; i++) { const a0 = i / N * Math.PI * 2, a1 = (i + 1) / N * Math.PI * 2, h = (a) => H0 * (.55 + .45 * Math.abs(Math.sin(a * 3 + k)) + .25 * Math.sin(a * 11 + k * 2) + .12 * Math.sin(a * 29)), r = (a) => R0 * (1 + .08 * Math.sin(a * 5 + k));
        const p0 = [Math.cos(a0) * r(a0), h(a0), Math.sin(a0) * r(a0)], p1 = [Math.cos(a1) * r(a1), h(a1), Math.sin(a1) * r(a1)], b0 = [Math.cos(a0) * r(a0) * .9, -30, Math.sin(a0) * r(a0) * .9], b1 = [Math.cos(a1) * r(a1) * .9, -30, Math.sin(a1) * r(a1) * .9];   /* (10.156 : le pied des montagnes plus loin : plus de mur vert au bout de la promenade) */
        for (const p of [b0, p0, p1, b0, p1, b1]) { P.push(...p); const top = p[1] > 0, roc = p[1] > H0 * .78; const col = roc ? [.4, .37, .34] : top ? teinte : [.2, .3, .14]; C.push(...col); } } };
    crete(300, 130, 1.2, [.34, .32, .24]); crete(240, 80, 3.7, [.26, .34, .16]);
    geo.setAttribute("position", new THREE.Float32BufferAttribute(P, 3)); geo.setAttribute("color", new THREE.Float32BufferAttribute(C, 3)); geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide, fog: false, flatShading: true })); m.position.set(0, -15, 40); m.frustumCulled = false; scene.add(m); }
  /* ---------- (en face des bâtiments) le domaine skiable, d'après les photos : la piste de gravier, le talus et son muret de rochers, puis les pentes d'herbe rousse
     qui montent vers les crêtes, les bosquets de sapins ; l'office « Corbier Tourisme » sous sa pyramide, le portique rouge, la gare du télésiège des Sybelles,
     le chalet des remontées, la cabane, la tête d'un autre télésiège ; les pylônes et les sièges qui montent jusqu'en haut ; l'aire de jeux des enfants ---------- */
  const HP = (x, z) => HP0(x, z) + DESC(x, z), HP0 = (x, z) => { const d = Math.hypot(x + 32, z - 46), t = Math.min(1, Math.max(0, (d - 13) / 12)); return t >= 1 ? HP00(x, z) : HP00(-32, 46) + (HP00(x, z) - HP00(-32, 46)) * t * t * (3 - 2 * t); }, HP00 = (x, z) => {   /* (10.168 : le terrain aplani autour de l'office : la pente ne cache plus son entrée) */ if (z < 44) return z < 30 ? 0 : (z - 30) * .03; const t = Math.min(1, (z - 44) / 5), base = .42 + t * t * (3 - 2 * t) * 2.4; if (z < 49) return base;   /* (devant les immeubles : l'esplanade presque plate, puis le pré qui monte) */
    const d = z - 49; return base + d * .24 + Math.max(0, d - 120) * .18 + Math.sin(x * .013 + 1.2) * Math.min(1, d / 60) * 14 + Math.sin(x * .031 + z * .02) * Math.min(1, d / 40) * 5; };
  L.hautPiste = HP;
  { const g2 = new THREE.PlaneGeometry(700, 430, 280, 172)   /* (10.127 : des mailles de 2,5 m, le sol suit la pente : les pieds ne s'enfoncent plus) */; g2.rotateX(-Math.PI / 2); const p = g2.attributes.position, C = [];
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i) + 236; p.setZ(i, z - 236); p.setY(i, HP(-x, z)); const h = HP(-x, z), n = Math.sin(x * .07) * Math.sin(z * .05);
      const c2 = z < 60 ? [.36 + n * .03, .56, .22] :   /* (en face des immeubles : l'herbe verte, comme sur la photo) */ h > 40 ? [.62 + n * .05, .52, .3] : [.56 + n * .06, .54 + n * .04, .28]; C.push(...(z < 60 ? [1 + n * .06, 1, 1] : c2.map((v, k) => v * [.85, .82, .69][k] / [.43, .48, .25][k]))); }   /* (10.126 : la vraie herbe en photo ; plus haut, teintée de roux) */
    g2.setAttribute("color", new THREE.Float32BufferAttribute(C, 3)); g2.computeVertexNormals();
    const pente = new THREE.Mesh(g2, new THREE.MeshLambertMaterial({ vertexColors: true, map: herbeT }));   /* (l'herbe rase, roussie par l'automne) */ pente.position.set(0, .01, 236); pente.receiveShadow = true; scene.add(pente); L.penteP = g2.attributes.position; }
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
    if (false) { const cx = -6, cz = 38, y = HP(cx, cz) + .05, r = add(new THREE.RingGeometry(4.2, 4.6, 40), mat({ color: 0xe8701a, side: THREE.DoubleSide }), cx, y, cz); r.rotation.x = -Math.PI / 2; for (const ry of [0, Math.PI / 2]) { const b = box(5, .02, .3, orange, cx, y, cz); b.rotation.y = ry; } }
    // le tapis roulant couvert : le tunnel blanc en demi-cercle, qui monte le long de la pente, son enclos au filet vert
    { const a0 = [-36, 44], a1 = [-70, 42.5], n = 10, blancT = mat({ color: 0xf2f4f4, roughness: .3, transparent: true, opacity: .85, side: THREE.DoubleSide });
      for (let k = 0; k < n; k++) { const t0 = k / n, t1 = (k + 1) / n, x0 = a0[0] + (a1[0] - a0[0]) * t0, z0 = a0[1] + (a1[1] - a0[1]) * t0, x1 = a0[0] + (a1[0] - a0[0]) * t1, z1 = a0[1] + (a1[1] - a0[1]) * t1, y0 = HP(x0, z0), y1 = HP(x1, z1), L2 = Math.hypot(x1 - x0, z1 - z0, y1 - y0);
        const G = new THREE.Group(); G.position.set((x0 + x1) / 2, (y0 + y1) / 2 + .1, (z0 + z1) / 2); G.rotation.order = "YZX"; G.rotation.y = -Math.atan2(z1 - z0, x1 - x0); G.rotation.z = Math.atan2(y1 - y0, Math.hypot(x1 - x0, z1 - z0)); scene.add(G);
        const tu = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, L2, 14, 1, true, 0, Math.PI), blancT); tu.rotation.z = Math.PI / 2; G.add(tu);
        for (let q = 0; q < 3; q++) { const ar = new THREE.Mesh(new THREE.TorusGeometry(1.12, .04, 4, 14, Math.PI), mat({ color: 0xc8ccd0 })); ar.rotation.y = Math.PI / 2; ar.position.x = -L2 / 2 + q * L2 / 3; G.add(ar); } }      const vert = mat({ color: 0x3aa84a, transparent: true, opacity: .55, side: THREE.DoubleSide }); for (const dz of [-3, 3]) { const x0 = -48, x1 = -64, z = 41 + dz; const v = box(Math.abs(x1 - x0), 1.2, .03, vert, (x0 + x1) / 2, HP((x0 + x1) / 2, z) + .6, z); void v; } }
    // les petits bancs le long du chemin (ceux de la photo)
    for (const [bx, bz, ry] of [[12, 27.5, 0], [40, 32, -.4], [2, 33, .2]]) { const g = new THREE.Group(); g.position.set(bx, HP(bx, bz), bz); g.rotation.y = ry; scene.add(g); for (let k = 0; k < 3; k++) { const l = new THREE.Mesh(new THREE.BoxGeometry(1.6, .05, .12), boisC); l.position.set(0, .45, -.14 + k * .14); g.add(l); } for (const sx of [-.7, .7]) { const l = new THREE.Mesh(new THREE.BoxGeometry(.08, .45, .45), mat({ color: 0x2a2a2a })); l.position.set(sx, .22, 0); g.add(l); } OB.push([bx, bz, .9]); } }
  // les bosquets de sapins sur les pentes
  { const sapM = mat({ color: 0x24402a, roughness: .9 }); for (const [cx, cz, n] of [[-60, 150, 40], [-20, 170, 30], [70, 210, 30], [-140, 120, 26], [130, 130, 22], [20, 90, 8]]) for (let k = 0; k < (PETIT ? n / 3 : n); k++) { const x = cx + (al() - .5) * 50, z = cz + (al() - .5) * 40, h = 8 + al() * 7; if (Math.abs(x - 6) < 9 && z > 110) continue; epicea(x, HP(x, z) - .3, z, h); }   /* (10.136 : le couloir du départ, sans sapins) */ void sapM; }
  // l'office du tourisme : la rotonde sous sa grande pyramide de poutres rouges et blanches, le chapeau blanc
  /* (10.114, d'après la photo) l'office de tourisme : la rotonde de plain-pied tout en vitrages, ceinte d'un large anneau de planches rouge-brun qui déborde
     (« OFFICE DE TOURISME » en lettres blanches) ; les trois grandes jambes en triangle, rouge-brun dehors et blanches dedans, posées sur leurs socles de béton,
     qui se rejoignent tout en haut sous le cône d'aluminium et son disque ; la nappe de câbles qui descend du disque ; l'escalier à rampes inox et main courante de bois,
     les jardinières de géraniums, le panneau du plan, le banc, sur sa butte d'herbe */
  { const n0 = scene.children.length, ox = -32, oz = 46, R0 = 7.5, H = 3.2, bois = mat({ color: 0x8a3a24, roughness: .6 }), blanc2 = mat({ color: 0xf2f0ea, roughness: .5 }), beton = mat({ color: 0xc8c2b6, roughness: .85 }), alu = mat({ color: 0xd8dce0, metalness: .8, roughness: .25 });
    add(new THREE.CylinderGeometry(R0 + 2, R0 + 3.5, 1, 32), mat({ color: 0x5a7a32, roughness: 1 }), ox, -.4, oz);   // la butte d'herbe
    /* (10.151, d'après les photos) le vitrage : de grandes vitres claires sur montants gris, l'intérieur éclairé, les affiches et les dépliants collés derrière ; le soubassement */
    const vitT = tT(4096, 256, (c, w, h) => { c.fillStyle = "#3a3e42"; c.fillRect(0, 0, w, h); const n = 28, pw = w / n;
      for (let k = 0; k < n; k++) { const x = k * pw; const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#c8d8e0"); g.addColorStop(.5, "#e8e2d0"); g.addColorStop(1, "#a89a84"); c.fillStyle = g; c.fillRect(x + 6, 6, pw - 12, h - 40);
        for (let i = 0; i < 5; i++) { if ((k * 7 + i * 3) % 4 === 0) continue; const px = x + 14 + (i % 3) * (pw / 3 - 6), py = 40 + (i / 3 | 0) * 70 + (k % 3) * 8; c.fillStyle = "#f4f2ea"; c.fillRect(px, py, pw / 4, 52); c.fillStyle = ["#6a8ab0", "#c8a070", "#8aa070", "#d8b040", "#b86a5a"][(k + i) % 5]; c.fillRect(px + 3, py + 3, pw / 4 - 6, 26); c.fillStyle = "#8a8a8a"; c.fillRect(px + 4, py + 34, pw / 4 - 10, 3); c.fillRect(px + 4, py + 41, pw / 6, 3); }
        c.fillStyle = "rgba(255,255,255,.22)"; c.beginPath(); c.moveTo(x + 6, 6); c.lineTo(x + pw * .45, 6); c.lineTo(x + 6, h * .6); c.fill(); c.fillStyle = "#6a6e72"; c.fillRect(x, 0, 6, h); }
      c.fillStyle = "#8a8a86"; c.fillRect(0, h - 34, w, 34); c.fillStyle = "#5a5a58"; c.fillRect(0, h - 36, w, 3); });
    cyl(R0, R0, H, lum(mat({ map: vitT, emissive: 0xffffff, emissiveMap: vitT, emissiveIntensity: .25, roughness: .15, metalness: .2 }), .25, .8), ox, H / 2, oz, 56);   // le vitrage, tout autour
    cyl(R0 - .25, R0 - .25, .05, lum(mat({ color: 0xfff6e8, emissive: 0xfff2dc, emissiveIntensity: .4 }), .4, .9), ox, H - .1, oz, 32);   // (le plafond éclairé, dedans)
    cyl(R0 - .2, R0 - .2, .3, mat({ color: 0x5a4a3e, roughness: .9 }), ox, H + .15, oz, 32);   // le toit plat, brun
    for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; box(2.7, .14, .14, mat({ color: 0xece6da }), ox + Math.sin(a) * (R0 + 1.2), H + .2, oz + Math.cos(a) * (R0 + 1.2), a + Math.PI / 2); }   // (les consoles qui tiennent l'anneau, décollé du toit)
    { const dT = tT(1024, 32, (c, w, h) => { c.fillStyle = "#e8e2d4"; c.fillRect(0, 0, w, h); c.fillStyle = "#1a1a1a"; for (let x = 0; x < w; x += 32) { c.beginPath(); c.moveTo(x, h); c.lineTo(x + 16, 4); c.lineTo(x + 32, h); c.fill(); } }, 3, 1); add(new THREE.CylinderGeometry(R0 + .05, R0 + .05, .35, 56, 1, true), mat({ map: dT }), ox, .2, oz); }
    { const a = 2.4, wx = ox + Math.sin(a) * (R0 + 5), wz = oz + Math.cos(a) * (R0 + 5), wcT = tT(64, 64, (c, w, h) => { c.fillStyle = "#6a4a32"; c.fillRect(0, 0, w, h); c.fillStyle = "#f4f2ee"; c.beginPath(); c.arc(32, 32, 24, 0, 7); c.fill(); c.fillStyle = "#1a1a1a"; c.font = "bold 22px Arial"; c.textAlign = "center"; c.fillText("WC", 32, 40); });
      box(2.2, 2.4, 1.8, mat({ color: 0x6a4a32, roughness: .8 }), wx, 1.2, wz, a); box(2.6, .15, 2.2, mat({ color: 0x4a4e54 }), wx, 2.5, wz, a); add(new THREE.PlaneGeometry(.9, .9), mat({ map: wcT }), wx + Math.sin(a) * .92, 1.5, wz + Math.cos(a) * .92, a); OB.push([wx, wz, 1.4]); }
    // le large anneau de planches rouge-brun, qui déborde, et son inscription
    const aE = Math.PI * .5, uE = 1 - aE / (Math.PI * 2);   // (10.168 : l'entrée à droite, vue de la promenade)   // (10.155 : l'entrée tournée vers les bâtiments)   // (l'entrée ; le passage du miroir retourne l'angle)
    const anT = tT(4096, 96, (c, w, h) => { c.fillStyle = "#7a3a22"; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 12) { c.fillStyle = ["#8a4428", "#7a3a22", "#6e321e"][(y / 12) % 3]; c.fillRect(0, y, w, 11); c.fillStyle = "rgba(0,0,0,.35)"; c.fillRect(0, y + 11, w, 1); }
      for (let i = 0; i < 200; i++) { c.fillStyle = "rgba(255,220,190,.06)"; c.fillRect(Math.random() * w, Math.random() * h, 40 + Math.random() * 120, 2); }
      for (const x of [uE * w, uE * w - w]) { c.fillStyle = "#f6f4ee"; c.font = `bold 50px ${sans}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("OFFICE DE TOURISME", x + 24, h / 2 + 3);
      c.save(); c.translate(x - 290, h / 2); c.rotate(Math.PI / 4); c.fillStyle = "#f6f4ee"; c.fillRect(-17, -17, 34, 34); c.fillStyle = "#c8202a"; c.fillRect(-13, -13, 13, 26); c.fillStyle = "#1a4a9a"; c.fillRect(0, -13, 13, 26); c.restore(); } });
    add(new THREE.CylinderGeometry(R0 + 2.4, R0 + 2.6, 1.3, 96, 1, true), mat({ map: anT, roughness: .6 }), ox, H + .5, oz);
    add(new THREE.CylinderGeometry(R0 + 2.38, R0 + 2.58, 1.3, 96, 1, true), mat({ color: 0x5a2a18, side: THREE.BackSide, roughness: .7 }), ox, H + .5, oz);   // (le dedans de l'anneau)
    add(new THREE.RingGeometry(R0 + .4, R0 + 2.6, 64), mat({ color: 0xece6da, side: THREE.DoubleSide }), ox, H + 1.15, oz).rotation.x = -Math.PI / 2;   // (le dessus, blanc)
    { const a = -.6, cx2 = ox + Math.sin(a) * (R0 - 1.5), cz2 = oz + Math.cos(a) * (R0 - 1.5); box(1.2, 1.6, 1.0, mat({ color: 0x9a9a96, roughness: .7 }), cx2, H + 1.1, cz2); box(1.4, .12, 1.2, mat({ color: 0x5a5a58 }), cx2, H + 1.95, cz2); }   // (le caisson technique, sur le toit)
    add(new THREE.RingGeometry(R0 - .2, R0 + 2.4, 64), mat({ color: 0x5a2416, side: THREE.DoubleSide }), ox, H - .2, oz).rotation.x = -Math.PI / 2;   // le dessous de l'anneau
    // la porte d'entrée, sous son petit auvent
    { const a = aE, dx = Math.sin(a) * R0, dz = Math.cos(a) * R0, ux = Math.sin(a), uz = Math.cos(a), P = (d, s2, y) => [ox + ux * (R0 + d) + uz * s2, y, oz + uz * (R0 + d) - ux * s2], brun = mat({ color: 0x7a3a22, roughness: .6 });
      const sasT = tT(512, 256, (c, w, h) => { c.fillStyle = "#e8e4dc"; c.fillRect(0, 0, w, h); c.fillStyle = "#3a3e42"; c.fillRect(0, 0, w, h);
        for (const [x0, w0, porte] of [[8, 150, 0], [176, 160, 1], [354, 150, 0]]) { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#d8e4ea"); g.addColorStop(1, "#8a9aa4"); c.fillStyle = g; c.fillRect(x0, 10, w0, h - 16);
          if (porte) { c.fillStyle = "#2a2e32"; c.fillRect(x0 + w0 / 2 - 2, 10, 4, h - 16); c.fillStyle = "#f4f2ea"; c.fillRect(x0 + 30, 26, w0 - 60, 30); c.fillStyle = "#2a5ab8"; c.font = "bold 16px Arial"; c.textAlign = "center"; c.fillText("le Corbier", x0 + w0 / 2, 47); }
          else for (let i = 0; i < 6; i++) { c.fillStyle = ["#f4f2ea", "#e8c040", "#2a5ab8", "#c83a3a"][i % 4]; c.fillRect(x0 + 10 + (i % 2) * 70, 24 + (i / 2 | 0) * 70, 60, 60); } } });
      { const [x, , z] = P(.8, 0, 0); box(4.4, .35, 1.8, brun, x, H - .1, z, a); box(4.2, 2.9, .06, lum(mat({ map: sasT, emissive: 0xffffff, emissiveMap: sasT, emissiveIntensity: .25, roughness: .2 }), .25, .7), ...P(1.66, 0, 1.45), a); }
      for (const s2 of [-2.1, 2.1]) { const [x, , z] = P(.8, s2, 0); box(.15, 3.0, 1.8, brun, x, 1.5, z, a); }
      { const [x, , z] = P(1.72, 0, 0); add(new THREE.PlaneGeometry(.9, .22), mat({ color: 0xf4f2ea }), x, 3.1, z, a); }
      // l'escalier de béton, les rampes inox et leur main courante de bois, les jardinières de géraniums
      for (let k = 0; k < 6; k++) { const [x, , z] = P(2.0 + k * .38, 0, 0); box(2.8, .2, .4, beton, x, .1 + (5 - k) * .2, z, a); }
      const inox = mat({ color: 0xc8ccd0, metalness: .75, roughness: .3 }), mc = mat({ color: 0xa06a3a, roughness: .6 });
      for (const s2 of [-1.45, 1.45]) { for (const d of [1.9, 2.9, 4.1]) { const [x, , z] = P(d, s2, 0); cyl(.03, .03, 1.0, inox, x, (4.3 - d) * .5 + .3, z, 5); }
        const [x, , z] = P(3.0, s2, 0); const r = box(.07, .06, 2.4, mc, x, 1.4, z, a); r.rotation.x = .48; const g2 = box(.03, .8, 2.3, mat({ color: 0xc8ccd0, metalness: .5, transparent: true, opacity: .4 }), x, .95, z, a); g2.rotation.x = .48;
        for (let k = 0; k < 6; k++) add(new THREE.IcosahedronGeometry(.17, 0), mat({ color: [0xe02a3a, 0xf08090, 0x3a6a2a][k % 3] }), ...P(1.85, s2 * 1.15 + (k % 2) * .15, 1.6 + (k % 3) * .1)); }
      void dx; void dz; }
    if (false) { const a = Math.PI * .1, dx = Math.sin(a) * R0, dz = Math.cos(a) * R0;
      // l'escalier, les rampes inox, la main courante de bois
      for (let k = 0; k < 7; k++) { const t = 1.1 + k * .32; box(2.6, .16, .4, beton, ox + dx * (1 + t / R0 * 1), .9 - k * .16, oz + dz * (1 + t / R0), a); }
      for (const sg of [-1, 1]) { const ex = Math.cos(a) * 1.4 * sg, ez = -Math.sin(a) * 1.4 * sg; const r = box(.06, .06, 2.6, mat({ color: 0xa06a3a }), ox + dx * 1.22 + ex, 1.4, oz + dz * 1.22 + ez, a); r.rotation.x = .3; box(.04, 1, 2.4, mat({ color: 0xc8ccd0, metalness: .7, transparent: true, opacity: .6 }), ox + dx * 1.22 + ex, .9, oz + dz * 1.22 + ez, a);
        for (let k = 0; k < 6; k++) add(new THREE.IcosahedronGeometry(.18, 0), mat({ color: [0xe02a3a, 0xf08090, 0xffffff][k % 3] }), ox + dx * 1.12 + ex * 1.1 + (k % 2) * .2, 1.7 + (k % 3) * .12, oz + dz * 1.12 + ez * 1.1); } }
    // les trois grandes jambes en triangle : rouge-brun dehors, blanches dedans, sur leurs socles de béton
    const top = new THREE.Vector3(ox, 21, oz); for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2 + aE + Math.PI / 3, A = new THREE.Vector3(ox + Math.sin(a) * (R0 + 4.2), 0, oz + Math.cos(a) * (R0 + 4.2)), d = top.clone().sub(A), L2 = d.length(), q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
      if (k === 2) { const B = new THREE.Vector3(ox + Math.sin(a) * (R0 + 1.2), 0, oz + Math.cos(a) * (R0 + 1.2)), d2 = top.clone().sub(B), q2 = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d2.clone().normalize());   /* (10.152, d'après la webcam : le troisième pied est un mât blanc, presque droit) */
        const o = add(new THREE.CylinderGeometry(.32, .38, d2.length(), 16), mat({ color: 0xeceae4, roughness: .45, metalness: .2 }), 0, 0, 0); o.quaternion.copy(q2); o.position.copy(B).addScaledVector(d2, .5); cyl(.6, .7, .5, beton, B.x, .25, B.z, 12); OB.push([B.x, B.z, .7]); continue; }
      for (const [m, w, off] of [[bois, .7, 0], [blanc2, .42, .42]]) { const o = add(new THREE.BoxGeometry(w, L2, .55), m, 0, 0, 0); o.quaternion.copy(q); o.position.copy(A).addScaledVector(d, .5); const n = new THREE.Vector3(-Math.sin(a), 0, -Math.cos(a)).multiplyScalar(off); o.position.add(n); }
      const so = box(2.2, 1.6, 1.4, beton, A.x, .8, A.z); so.rotation.y = a; OB.push([A.x, A.z, 1.4]); }
    // le cône d'aluminium et son disque, tout en haut ; la nappe de câbles jusqu'à l'anneau
    add(new THREE.ConeGeometry(2.4, 4.6, 24), mat({ color: 0xeceae4, roughness: .4, metalness: .3 }), ox, 24, oz); cyl(2.6, 2.6, .5, alu, ox, 21.4, oz, 24); cyl(2.2, 2.2, .25, mat({ color: 0x9a9ea2 }), ox, 21.05, oz, 24);
    for (let k = 0; k < 36; k++) { const a = k / 36 * Math.PI * 2, A = new THREE.Vector3(ox + Math.sin(a) * 2, 21, oz + Math.cos(a) * 2), B = new THREE.Vector3(ox + Math.sin(a) * (R0 + .5), H + 1.2, oz + Math.cos(a) * (R0 + .5)), d = B.clone().sub(A), o = add(new THREE.CylinderGeometry(.018, .018, d.length(), 3), mat({ color: 0xd0d4d8, metalness: .6 }), 0, 0, 0); o.position.copy(A).addScaledVector(d, .5); o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); }
    // devant : le panneau du plan sur ses deux poteaux, le banc, la petite borne jaune
    { const a = aE + .62, fx = ox + Math.sin(a) * (R0 + 2.5), fz = oz + Math.cos(a) * (R0 + 2.5); const plT = tT(256, 160, (c, w, h) => { c.fillStyle = "#f2efe6"; c.fillRect(0, 0, w, h); c.fillStyle = "#8aa070"; c.fillRect(14, 30, w - 90, h - 44); c.strokeStyle = "#c8202a"; c.lineWidth = 3; for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(20 + k * 20, 40); c.lineTo(60 + k * 14, h - 20); c.stroke(); } c.fillStyle = "#c8202a"; c.fillRect(w - 70, 30, 56, 20); c.fillStyle = "#2a2a2a"; c.font = "bold 12px Arial"; c.fillText("ESPACE TRAIL", 20, 22); });
      box(2.4, 1.6, .08, mat({ map: plT }), fx, 1.6, fz, a); for (const sg of [-1, 1]) box(.12, 2.4, .12, mat({ color: 0x6a4a2a }), fx + Math.cos(a) * 1.25 * sg, 1.2, fz - Math.sin(a) * 1.25 * sg);
      box(1.8, .08, .45, mat({ color: 0x6a3a22 }), fx + 1.8, .45, fz + 1.4, a); box(1.8, .3, .06, mat({ color: 0x6a3a22 }), fx + 1.8, .75, fz + 1.2, a); OB.push([fx, fz, 1.4]); }
    { const a = aE - .55, lx = ox + Math.sin(a) * (R0 + 4.2), lz = oz + Math.cos(a) * (R0 + 4.2), vt = mat({ color: 0x6a9a7a, roughness: .45, metalness: .4 }); cyl(.07, .1, 4.6, vt, lx, 2.3, lz, 8);
      for (const s2 of [-1, 1]) { cyl(.22, .1, .5, lum(mat({ color: 0xf2f0e0, emissive: 0xffe0a0, emissiveIntensity: .05, transparent: true, opacity: .9 }), .05, 2.4), lx + s2 * .9, 4.1, lz, 4); const b2 = add(new THREE.TorusGeometry(.45, .04, 6, 12, Math.PI * .9), vt, lx + s2 * .45, 4.4, lz); b2.rotation.z = s2 > 0 ? 0 : Math.PI; }
      const jt = tT(64, 64, (c, w, h) => { c.fillStyle = "#f0c020"; c.beginPath(); c.moveTo(32, 4); c.lineTo(60, 58); c.lineTo(4, 58); c.closePath(); c.fill(); c.strokeStyle = "#c82020"; c.lineWidth = 5; c.stroke(); c.fillStyle = "#1a1a1a"; c.font = "bold 26px Arial"; c.textAlign = "center"; c.fillText("✕", 32, 50); });
      add(new THREE.PlaneGeometry(.7, .7), mat({ map: jt, transparent: true, side: THREE.DoubleSide }), lx, 2.0, lz + .12); OB.push([lx, lz, .3]); }
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
  telesiege(80, 50, .35, 235, true); telesiege(58, 52, .1, 240, false); telesiege(-15, 54, -.1, 200, false);
  /* (10.153) on prend le télésiège des Sybelles : à la gare, « Prendre le télésiège » ; on s'assoit, le siège monte toute la ligne au-dessus des pentes,
     à la première personne (le siège, la barre, les skis… devant soi), fait le tour de la poulie là-haut et redescend ; on se retrouve à la gare */
  { const T = TS[0], gris = mat({ color: 0x9a9ea2, metalness: .6, roughness: .4 }), bleu = mat({ color: 0x2a3a5a, roughness: .5 });
    const SG = new THREE.Group(); SG.userData.anime = true; SG.visible = false; scene.add(SG);
    for (const [w, h, d, x, y, z, m] of [[2.2, .1, .55, 0, -2.2, 0, bleu], [2.2, .6, .08, 0, -1.9, -.3, bleu], [.06, 2.2, .06, 0, -1.1, -.3, gris], [2.2, .05, .05, 0, -1.98, .62, gris], [.05, .45, .05, -.9, -1.78, .62, gris], [.05, .45, .05, .9, -1.78, .62, gris], [.05, .05, .9, -.9, -1.55, .2, gris], [.05, .05, .9, .9, -1.55, .2, gris], [2.0, .05, .05, 0, -2.6, .6, gris]]) { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); SG.add(o); }
    let RIDE = null; const W = (u, cote) => { const p = T.placer(Math.max(0, Math.min(.999, u)), cote); return new THREE.Vector3(-p[0], p[1], p[2]); };
    const moiP = () => M && M.gens && M.gens.get(M.moiNum);
    const fin = () => { RIDE = null; SG.visible = false; for (const c2 of T.S) c2.visible = true; try { finCine(); } catch (e) { M.cine = null; } const q = moiP(); if (q) { const g0 = W(0, 1); q.g.position.set(g0.x + 1.5, L.hauteur(g0.x + 1.5, g0.z + 6), g0.z + 6); q.g.visible = true; q.cible = null; q.chemin = []; try { envoyerWS({ t: "aller", x: q.g.position.x, z: q.g.position.z }); } catch (e) {} } };
    const monter = () => { if (RIDE || M.cine) return; RIDE = { t0: performance.now(), yaw: 0, pitch: 0 };
      { const cv = M.rendu.domElement; let dn = null; const pd = e => { if (!RIDE) return; dn = [e.clientX, e.clientY]; }, pm = e => { if (!RIDE || !dn) return; RIDE.yaw -= (e.clientX - dn[0]) * .006; RIDE.pitch = Math.max(-.8, Math.min(.6, RIDE.pitch - (e.clientY - dn[1]) * .004)); dn = [e.clientX, e.clientY]; }, pu = () => { dn = null; };
        const kd = e => { if (!RIDE) return; if (e.key === "ArrowLeft") RIDE.yaw += .12; if (e.key === "ArrowRight") RIDE.yaw -= .12; if (e.key === "ArrowUp") RIDE.pitch = Math.min(.6, RIDE.pitch + .08); if (e.key === "ArrowDown") RIDE.pitch = Math.max(-.8, RIDE.pitch - .08); };
        const gp = setInterval(() => { if (!RIDE) { clearInterval(gp); cv.removeEventListener("pointerdown", pd); removeEventListener("pointermove", pm); removeEventListener("pointerup", pu); removeEventListener("keydown", kd); return; } const g = navigator.getGamepads ? [...navigator.getGamepads()].find(x => x) : null; if (g) { const ax = g.axes[2] || g.axes[0] || 0, ay = g.axes[3] || g.axes[1] || 0; if (Math.abs(ax) > .2) RIDE.yaw -= ax * .05; if (Math.abs(ay) > .2) RIDE.pitch = Math.max(-.8, Math.min(.6, RIDE.pitch - ay * .03)); } }, 30);
        cv.addEventListener("pointerdown", pd); addEventListener("pointermove", pm); addEventListener("pointerup", pu); addEventListener("keydown", kd);
        M.ctx.surInfo && M.ctx.surInfo("🚡 Fais glisser le doigt (ou la souris) pour regarder tout autour", 4000); } SG.visible = true; const q = moiP(); if (q) { q.g.visible = false; q.cible = null; q.chemin = []; }
      M.cine = { gel: true, fov: [72, 82], maj: () => { if (!RIDE) return; const t = (performance.now() - RIDE.t0) / 1000, UM = .62, up = T.tot * UM / 4.2, down = T.tot * UM / 5;   /* (10.137 : au pas d'un vrai télésiège ; on fait demi-tour un peu avant la gare du haut, avant la montagne) */
        let u, cote; if (t < up) { u = t / up * UM; cote = 1; } else if (t < up + 3) { u = UM; cote = (t - up) < 1.5 ? 1 : -1; } else if (t < up + 3 + down) { u = UM * (1 - (t - up - 3) / down); cote = -1; } else { fin(); return; }
        let P = W(u, cote), Q = W(u + cote * .01, cote), dir = Q.clone().sub(P); dir.y = 0; dir.normalize();
        if (t >= up && t < up + 3) { const s2 = (t - up) / 3, e = s2 * s2 * (3 - 2 * s2), A = W(UM, 1), B = W(UM, -1), dA = W(UM + .01, 1).sub(A).setY(0).normalize(), dB = W(UM - .01, -1).sub(B).setY(0).normalize(); P = A.clone().lerp(B, e); P.addScaledVector(dA, Math.sin(e * Math.PI) * 2.5); dir = dA.clone().multiplyScalar(Math.cos(e * Math.PI)).add(A.clone().sub(B).setY(0).normalize().multiplyScalar(-Math.sin(e * Math.PI))).normalize(); void dB; }   // (le demi-tour, en douceur, autour de la poulie) P.y = Math.max(P.y, L.hauteur(P.x, P.z) + 3.6); SG.position.copy(P);
        for (const c2 of T.S) c2.visible = c2.position.distanceTo(P) > 6;   // (les autres sièges s'effacent quand ils passent tout près : on ne les traverse plus) SG.rotation.y = Math.atan2(dir.x, dir.z);
        const eye = P.clone(); eye.y -= 1.5; eye.addScaledVector(dir, -.1); M.camera.position.copy(eye); const yw = RIDE.yaw || 0, d2 = new THREE.Vector3(dir.x * Math.cos(yw) + dir.z * Math.sin(yw), 0, -dir.x * Math.sin(yw) + dir.z * Math.cos(yw)), look = eye.clone().addScaledVector(d2, 10); look.y += (cote > 0 ? -.6 : -3.4) * (1 - Math.min(1, Math.abs(RIDE.pitch || 0) * 3)) + (RIDE.pitch || 0) * 10; M.camera.lookAt(look);   /* (10.139 : on regarde tout autour, à 360°) */
        const qq = moiP(); if (qq) qq.g.visible = false; } }; };
    const a0 = L.actionLieu; L.actionLieu = (x, z, moi) => { const r = a0 && a0(x, z, moi); if (r) return r; if (RIDE) return null; const g0 = W(0, 1); return Math.hypot(x - g0.x, z - (g0.z + 4)) < 7 ? { type: "lieu", id: "telesiege", label: "🚡 Prendre le télésiège", faire: monter } : null; }; L.monterTelesiege = monter;
    L.quitterTelesiege = fin; }
  // le chalet des remontées : le bardage de bois, le toit de tôle grise, les fenêtres, l'escalier
  { const cx = 91, cz = 52, y = HP(cx, cz); box(9, 3.4, 6, facR, cx, y + 1.7, cz); const r1 = box(5.4, .15, 7, mat({ color: 0x5a6068, metalness: .4, roughness: .5 }), cx - 2.3, y + 4.4, cz); r1.rotation.z = .55; const r2 = box(5.4, .15, 7, mat({ color: 0x5a6068, metalness: .4, roughness: .5 }), cx + 2.3, y + 4.4, cz); r2.rotation.z = -.55;
    for (let k = 0; k < 5; k++) box(1, 1.3, .06, mat({ color: 0x2a3a40, roughness: .2 }), cx - 3.4 + k * 1.7, y + 1.8, cz - 3.02); box(.9, .5, .06, mat({ color: 0x1a5aa8 }), cx + 1, y + 2.9, cz - 3.05); OB.push([cx, cz, 5]); }
  // la petite cabane du préposé, au pied du deuxième télésiège
  { const cx = 44, cz = 56, y = HP(cx, cz); box(3, 2.6, 2.6, facS, cx, y + 1.3, cz); const r = box(3.6, .12, 3.3, mat({ color: 0x4a5058, metalness: .4 }), cx, y + 2.85, cz); r.rotation.x = -.15; box(1.2, .8, .05, mat({ color: 0x9ab0b8, roughness: .1 }), cx + .4, y + 1.7, cz - 1.32); box(.9, 1.4, .9, mat({ color: 0xe8e8e2 }), cx - 2.2, y + .7, cz); }


  /* ---------- la résidence en bois : le rez-de-chaussée des boutiques, trois étages de balcons en caissons, le bandeau de planches qui avance en haut ---------- */
  const verreB = mat({ color: 0xc8d8dc, roughness: .1, metalness: .2, transparent: true, opacity: .35 }), vitreS = lum(mat({ color: 0x2a3a40, emissive: 0xffd8a0, emissiveIntensity: 0, roughness: .2 }), 0, .7);
  const rideauxT = [0, 1, 2, 3].map(k => vraie(tT(128, 96, (c, w, h) => { c.fillStyle = "#2c3236"; c.fillRect(0, 0, w, h); const col = ["#e8e4d8", "#d8c8b0", "#c8504a", "#e8e0c8"][k]; c.fillStyle = col; for (let x = 0; x < w; x += 64) { c.fillRect(x + 4, 4, 22, h - 8); c.fillRect(x + 38, 4, 22, h - 8); } c.fillStyle = "rgba(255,255,255,.12)"; c.fillRect(0, 0, w, 6); c.strokeStyle = "#5a3a22"; c.lineWidth = 4; c.strokeRect(2, 2, w - 4, h - 4); c.beginPath(); c.moveTo(w / 2, 0); c.lineTo(w / 2, h); c.stroke(); }), `images/corbier-sol/fenetre${k}.jpg`, null));
  const fenM = rideauxT.map(t => lum(mat({ map: t, emissive: 0xffd8a0, emissiveMap: t, emissiveIntensity: 0, roughness: .3 }), 0, .55));
  const residence = (x0, x1, zf, niv, fac, o = {}) => { const W = x1 - x0, cx = (x0 + x1) / 2, HR = 3.4, HE = 2.8, H = HR + niv * HE, D = 12;
    box(W, H - HR, D, facS, cx, HR + (H - HR) / 2, zf - D / 2 - .6); if (o.galerie) box(W, HR, 1.0, facS, cx, HR / 2, zf - D - .1); else box(W, HR, D - 3.0, facS, cx, HR / 2, zf - 3.6 - (D - 3.0) / 2);   // le corps du bâtiment (10.143 : le rez-de-chaussée en retrait — les boutiques ont leur profondeur)
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
  /* (10.144, d'après les photos Street View, boutique par boutique, de l'École du Ski au Yéti) le rez-de-chaussée de la longue résidence :
     l'ESF rouge ; le bar-restaurant-pizzeria Les Roches Blanches, ses quatre enseignes entre les consoles et son lambrequin ; le Sherpa ; la galerie marchande et son kiosque ;
     Skiset (la location fermée de planches, le treillage, « Vêtements · Location ») ; la galerie au drapeau rouge ; « location de skis » ; « quasar · boutique » ;
     les deux Intersport et leurs stores bleus ; la galerie au panneau orangé ; la pharmacie et ses vitraux verts ; la Pâtisserie « La Gourmande » Salon de Thé ;
     la galerie de la caisse des remontées ; la vitrine sombre ; le bar aux lampes rouges ; le Jack ★★ Circus ; La Picoraille ; la location Sport 2000 ; la galerie du coin.
     Au-dessus des vitrines, le bandeau des fenêtres sombres ; partout les montants de bois, les soubassements à losanges, les portes vitrées.
     Chaque boutique traverse jusqu'à la galerie : une vitrine sur la promenade, l'autre dans la galerie. */
  const KB = 76 / 29.1;
  const FAC = [[4.8, "vitres"], [2, "sherpa"], [1, "galA"], [1.3, "skiloc"], [1, "skiset"], [.9, "vet"], [.8, "galB"], [1, "locskis"], [1, "quasar"], [1, "interLR"], [1, "interFN"], [.9, "galC"],
    [2.2, "pharma"], [2, "patis"], [.9, "galD"], [1, "sombre"], [1, "lampes"], [.8, "jack"], [2.5, "pico"], [1, "sport2000"], [1, "galE"]];
  const LIGNES = []; { let x = -10; for (const [b, id] of FAC) { LIGNES.push({ id, x0: x, x1: x + b * KB, o: { pergola: id === "pico" } }); x += b * KB; } }
  const LG = (id) => LIGNES.find(l => l.id === id);
  const BLOCS = [[-10, LG("sherpa").x1, 0, 0], [LG("galA").x0, LG("locskis").x1, -1.6, 1], [LG("quasar").x0, LG("galC").x1, -.8, 0], [LG("pharma").x0, 66, 0, 0]];
  const zfAt = (x) => { for (const [a, b, z] of BLOCS) if (x >= a && x < b) return z; return 0; };
  const GZ = [[4, 16, -3], [16, 30, -3], [30, 40, -3.6], [40, 52, -3], [52, 58, -2.6], [58, 66, -2.6]];   // (le mur de la galerie, derrière : les pièces H, G, F, E2, E, D2 — mêmes valeurs)
  const GALZ = LIGNES.filter(l => l.id.startsWith("gal"));
  const tranches = (a, b, zf) => { const T2 = []; let u = a;
    for (const [g0, g1, gz] of GZ.filter(([g0, g1]) => g1 > a && g0 < b)) { const u0 = Math.max(a, g0), u1 = Math.min(b, g1); if (u0 > u + .01) T2.push([u, u0, zf - 3, false]); T2.push([u0, u1, gz + .15, true]); u = u1; }
    if (u < b - .01) T2.push([u, b, zf - 3, false]); return T2; };
  // les textures
  const repT = (t, rx, ry = 1) => { const c2 = t.clone(); c2.wrapS = c2.wrapT = THREE.RepeatWrapping; c2.repeat.set(rx, ry); c2.needsUpdate = true; return c2; };
  const txT = (W, H, fond, coul, txt, px, police, o = {}) => tT(W, H, (c, w, h) => { c.fillStyle = fond; c.fillRect(0, 0, w, h);
    if (o.raye) for (let x = 0; x < w; x += o.raye * 2) { c.fillStyle = "rgba(255,255,255,.2)"; c.fillRect(x, 0, o.raye, h); }
    if (o.bord) { c.fillStyle = o.bord; c.fillRect(0, h - 5, w, 5); }
    const L3 = txt.split("\n"); c.fillStyle = coul; c.textAlign = "center"; c.textBaseline = "middle"; fit(c, L3.reduce((p, q) => q.length > p.length ? q : p, ""), w - 24, px, police);
    L3.forEach((t, i) => c.fillText(t, w / 2, h * (i + .5) / L3.length + 2)); });
  const boisF = mat({ color: 0x3a2214, roughness: .6 }), verreF = mat({ color: 0xdcecf2, roughness: .04, metalness: .3, transparent: true, opacity: .13, depthWrite: false });
  const losT = tT(128, 64, (c, w, h) => { c.fillStyle = "#6e4228"; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 4) { c.fillStyle = `rgba(${x % 8 ? "40,20,10" : "160,110,70"},.18)`; c.fillRect(x, 0, 2, h); } c.strokeStyle = "#3a2010"; c.lineWidth = 4; c.strokeRect(2, 2, w - 4, h - 4);
    for (const cx of [32, 96]) { c.fillStyle = "#c08a50"; c.beginPath(); c.moveTo(cx, 12); c.lineTo(cx + 20, 32); c.lineTo(cx, 52); c.lineTo(cx - 20, 32); c.closePath(); c.fill(); c.strokeStyle = "#4a2810"; c.lineWidth = 2; c.stroke(); } });
  const impT = tT(256, 128, (c, w, h) => { c.fillStyle = "#3a2214"; c.fillRect(0, 0, w, h); for (const x0 of [8, 132]) { const g = c.createLinearGradient(0, 10, 0, h - 10); g.addColorStop(0, "#6a7884"); g.addColorStop(.45, "#323a42"); g.addColorStop(1, "#1a1e24"); c.fillStyle = g; c.fillRect(x0, 10, 116, h - 20);
    c.fillStyle = "rgba(255,255,255,.1)"; c.beginPath(); c.moveTo(x0, 10); c.lineTo(x0 + 46, 10); c.lineTo(x0, 64); c.fill(); c.fillStyle = "rgba(240,230,210,.3)"; c.fillRect(x0 + 6, 14, 104, 4); } });
  const porteT = tT(64, 160, (c, w, h) => { c.fillStyle = "#6a3c20"; c.fillRect(0, 0, w, h); const g = c.createLinearGradient(0, 8, 0, 100); g.addColorStop(0, "#9ab0bc"); g.addColorStop(1, "#3a4650"); c.fillStyle = g; c.fillRect(8, 8, w - 16, 92); c.fillStyle = "rgba(255,255,255,.25)"; c.fillRect(11, 11, 8, 86);
    c.fillStyle = "#c08a50"; c.beginPath(); c.moveTo(w / 2, 108); c.lineTo(w - 12, 130); c.lineTo(w / 2, 152); c.lineTo(12, 130); c.closePath(); c.fill(); c.strokeStyle = "#3a2010"; c.lineWidth = 2; c.stroke(); });
  const porteM = mat({ map: porteT, roughness: .6 });
  const solB = mat({ color: 0x5e4a3e, roughness: .5 }), plafL = lum(mat({ color: 0xfffaf0, emissive: 0xfff4dc, emissiveIntensity: .55 }), .55, .9), murC = lum(mat({ color: 0xeee6da, roughness: .9, emissive: 0xfff0dc, emissiveIntensity: .22 }), .22, .45);
  const prodT = tT(256, 128, (c, w, h) => { c.fillStyle = "#e8e4dc"; c.fillRect(0, 0, w, h); for (let s = 0; s < 4; s++) { c.fillStyle = "#9a9a96"; c.fillRect(0, 28 + s * 32, w, 3); for (let x = 3; x < w - 8; x += 9 + (x * 7) % 5) { c.fillStyle = ["#d83a2a", "#2a6ac8", "#f0c020", "#3a9a4a", "#f2f2ee", "#8a4a2a", "#e86a9a"][(x + s * 3) % 7]; c.fillRect(x, 8 + s * 32, 7, 20); } } });
  const skisT = tT(256, 128, (c, w, h) => { c.fillStyle = "#3a3e44"; c.fillRect(0, 0, w, h); for (let x = 4; x < w; x += 9) { c.fillStyle = ["#d83a2a", "#2a6ac8", "#f0c020", "#f2f2ee", "#1a1a1a", "#3ab0a0"][(x / 9 | 0) % 6]; c.fillRect(x, 8, 6, h - 14); c.fillStyle = "rgba(0,0,0,.3)"; c.fillRect(x + 4, 8, 2, h - 14); } });
  const habitsT = tT(256, 128, (c, w, h) => { c.fillStyle = "#e8e2d8"; c.fillRect(0, 0, w, h); c.fillStyle = "#8a8a8a"; c.fillRect(0, 14, w, 3); for (let x = 4; x < w - 14; x += 16) { c.fillStyle = ["#2a5ac8", "#d83a5a", "#f0a020", "#3a3a3a", "#5ab05a", "#f2f2ee", "#7a2a8a"][(x / 16 | 0) % 7]; c.beginPath(); c.moveTo(x, 18); c.lineTo(x + 14, 18); c.lineTo(x + 16, 100); c.lineTo(x - 2, 100); c.fill(); } });
  // dedans : les tables, le salon de thé, ou les rayonnages (produits, skis, vêtements, pharmacie)
  const terroirT = tT(256, 128, (c, w, h) => { c.fillStyle = "#e8dcc4"; c.fillRect(0, 0, w, h); for (let s2 = 0; s2 < 3; s2++) { c.fillStyle = "#8a5a32"; c.fillRect(0, 38 + s2 * 40, w, 4);
      for (let x = 6; x < w - 14; x += 20) { const k = (x / 20 + s2) % 5; if (k === 0 || k === 3) { c.fillStyle = "#e8c060"; c.beginPath(); c.ellipse(x + 8, 30 + s2 * 40, 9, 6, 0, 0, 7); c.fill(); c.fillStyle = "#c89a40"; c.fillRect(x - 1, 30 + s2 * 40, 18, 3); }
        else if (k === 1) { c.fillStyle = "#8a2a1a"; c.fillRect(x + 2, 10 + s2 * 40, 6, 26); c.fillStyle = "#f2e8d8"; c.fillRect(x + 2, 14 + s2 * 40, 6, 2); } else if (k === 2) { c.fillStyle = "#d8a030"; c.fillRect(x + 2, 18 + s2 * 40, 12, 18); c.fillStyle = "#f4f2ea"; c.fillRect(x + 2, 16 + s2 * 40, 12, 4); }
        else { c.fillStyle = "#2a5a2a"; c.fillRect(x + 4, 8 + s2 * 40, 6, 28); c.fillStyle = "#f2e8d8"; c.fillRect(x + 4, 20 + s2 * 40, 6, 8); } } } });
  const randoT = tT(256, 128, (c, w, h) => { c.fillStyle = "#ece8e0"; c.fillRect(0, 0, w, h); c.fillStyle = "#8a8a8a"; c.fillRect(0, 12, w * .62, 3);
      for (let x = 4; x < w * .62 - 14; x += 17) { c.fillStyle = ["#d8501a", "#2a6a4a", "#1a3a6a", "#c8a020", "#6a2a6a", "#3a3a3a"][(x / 17 | 0) % 6]; c.beginPath(); c.moveTo(x, 16); c.lineTo(x + 15, 16); c.lineTo(x + 17, 90); c.lineTo(x - 2, 90); c.fill(); c.fillStyle = "rgba(255,255,255,.3)"; c.fillRect(x + 6, 18, 2, 70); }
      for (let s2 = 0; s2 < 3; s2++) { c.fillStyle = "#8a6a4a"; c.fillRect(w * .66, 40 + s2 * 34, w * .32, 3); for (let x = w * .67; x < w - 18; x += 22) { c.fillStyle = ["#5a3a1e", "#3a3a3e", "#8a4a1e"][(x / 22 + s2 | 0) % 3]; c.beginPath(); c.ellipse(x + 8, 34 + s2 * 34, 9, 5, 0, 0, 7); c.fill(); c.fillRect(x + 1, 26 + s2 * 34, 6, 8); } } });
  const contenu = (u0, u1, zf, zb, k) => { const W2 = u1 - u0, cx = (u0 + u1) / 2, D = zf - zb, cz = (zf + zb) / 2; if (D < .8 || W2 < .8) return;
    if (k === "tables" || k === "salon") { for (let u = u0 + .7; u < u1 - .5; u += 1.5) { cyl(.34, .34, .04, mat({ color: k === "salon" ? 0xf2f0ea : 0x8a5a32 }), u, .74, cz, 10); cyl(.04, .04, .72, boisF, u, .37, cz, 5);
        if (k === "tables") for (const s of [-.18, .18]) box(.4, .45, .04, mat({ color: 0x6a3e22 }), u + s, 1.0, cz + s); else for (const s of [-.5, .5]) box(.38, .45, .38, mat({ color: 0x4a2a1a }), u + s, .45, cz); }
      if (k === "salon") box(Math.min(1.6, W2 * .3), 1.0, .5, lum(mat({ color: 0xf6eee6, emissive: 0xfff0e0, emissiveIntensity: .25 }), .25, .4), u1 - .9, .5, cz); return; }
    const t = k === "skis" ? skisT : k === "habits" ? habitsT : k === "terroir" ? terroirT : k === "rando" ? randoT : prodT; box(W2 - .5, 1.6, .45, mat({ map: repT(t, Math.max(1, Math.round(W2 / 1.6))), roughness: .8 }), cx, .8, cz);
    if (k === "pharma") box(Math.min(1.4, W2 * .4), .95, .45, mat({ color: 0xf2f2ee }), u0 + .9, .48, zf - .4); };
  const interieur = (a, b, zf, k, papier) => { const T2 = tranches(a + .1, b - .1, zf);
    for (const [u0, u1, zb, gal] of T2) { const W2 = u1 - u0, cx = (u0 + u1) / 2, D = zf - zb, cz = (zf + zb) / 2;
      const s = add(new THREE.PlaneGeometry(W2, D), solB, cx, .02, cz); s.rotation.x = -Math.PI / 2; const p = add(new THREE.PlaneGeometry(W2, D), plafL, cx, 2.5, cz); p.rotation.x = Math.PI / 2;
      if (!gal) add(new THREE.PlaneGeometry(W2, 2.5), murC, cx, 1.25, zb); if (k) contenu(u0, u1, zf - .25, zb + .1, k); }
    add(new THREE.PlaneGeometry(zf - T2[0][2], 2.5), murC, a + .1, 1.25, (zf + T2[0][2]) / 2, Math.PI / 2);
    add(new THREE.PlaneGeometry(zf - T2[T2.length - 1][2], 2.5), murC, b - .1, 1.25, (zf + T2[T2.length - 1][2]) / 2, -Math.PI / 2);
    if (papier) add(new THREE.PlaneGeometry(b - a - .3, 1.95), lum(mat({ color: 0xf0ece4, roughness: .9, emissive: 0xfff8f0, emissiveIntensity: .12 }), .12, .3), (a + b) / 2, 1.5, zf - .05); };
  // la façade : les montants, le bandeau des fenêtres sombres au-dessus, la vitrine, ses portes ; l'enseigne, le store
  const poteau = (x, z) => box(.2, 2.6, .26, boisF, x, 1.3, z + .04);
  const bandeau = (a, b, z) => { const cx = (a + b) / 2; add(new THREE.PlaneGeometry(b - a, .74), mat({ map: repT(impT, Math.max(1, Math.round((b - a) / 1.35))), roughness: .3, metalness: .2 }), cx, 2.98, z - .02);
    box(b - a, .1, .24, boisF, cx, 2.58, z + .03); box(b - a, .08, .2, boisF, cx, 3.36, z); };
  const vitrine = (a, b, z, o = {}) => { const aa = a + .1, bb = b - .1, LL = bb - aa, cx = (a + b) / 2;
    const sm = o.soub === "bleu" ? mat({ color: 0x23338a, roughness: .5 }) : o.soub === "blanc" ? mat({ color: 0xe8e6de, roughness: .6 }) : o.soub === "rouge" ? mat({ color: 0xc41e26, roughness: .5 }) : o.soub === "bois" ? mat({ color: 0x7a4a2a, roughness: .7 }) : mat({ map: repT(losT, Math.max(1, Math.round(LL / 1.1))), roughness: .7 });
    box(LL, .5, .12, sm, cx, .25, z + .02); add(new THREE.PlaneGeometry(LL, 2.0), verreF, cx, 1.5, z + .01);
    for (const y of [.52, 2.06, 2.5]) box(LL, .07, .13, boisF, cx, y, z + .03);
    const n = Math.max(1, Math.round(LL / (o.pas || 1.15))); for (let k = 1; k < n; k++) box(.07, 2.0, .12, boisF, aa + k * LL / n, 1.5, z + .03);
    for (const [u, w2, m2] of o.portes || []) { box(w2 + .12, 2.16, .1, boisF, u, 1.08, z + .04); add(new THREE.PlaneGeometry(w2, 2.06), m2 || porteM, u, 1.05, z + .1); box(.04, .45, .05, mat({ color: 0xc8ccd0, metalness: .7 }), u + w2 * .3, 1.15, z + .13); } };
  const boutiqueF = (l, o) => { const z = zfAt((l.x0 + l.x1) / 2); poteau(l.x0, z); poteau(l.x1, z); bandeau(l.x0, l.x1, z); if (!o.sansVitrine) vitrine(l.x0, l.x1, z, o); interieur(l.x0, l.x1, z, o.dedans, o.papier); l.g = o.g; return z; };
  const enseigne = (a, b, z, t, h = .5, y = 2.98, e = .08, j = .12) => { const cx = (a + b) / 2; box(b - a, h, e, boisF, cx, y, z + e / 2); add(new THREE.PlaneGeometry(b - a - .04, h - .04), lum(mat({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: j }), j, .9), cx, y, z + e + .005); };
  const store = (a, b, z, t, coul, prof = .85, y = 2.52, hd = .3) => { const cx = (a + b) / 2, m = mat({ color: coul, roughness: .7, side: THREE.DoubleSide }), L3 = Math.hypot(prof, .3);
    const s = box(b - a, .03, L3, m, cx, y - .15, z + prof / 2); s.rotation.x = Math.atan2(.3, prof);
    deux(add(new THREE.PlaneGeometry(b - a, hd), lum(mat({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: .1, side: THREE.DoubleSide }), .1, .7), cx, y - .3 - hd / 2 + .02, z + prof)); };
  const affiche = (u, w2, h2, y, z, t) => add(new THREE.PlaneGeometry(w2, h2), lum(mat({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: .2 }), .2, .4), u, y, z - .04);
  // les enseignes, d'après les photos
  const galT = tT(256, 96, (c, w, h) => { c.fillStyle = "#f2f0ea"; c.fillRect(0, 0, w, h); c.strokeStyle = "#8a8e92"; c.lineWidth = 2; c.strokeRect(2, 2, w - 4, h - 4); c.strokeStyle = "#5a6a7a"; c.lineWidth = 4; c.beginPath(); c.moveTo(14, 60); c.lineTo(34, 30); c.lineTo(46, 46); c.lineTo(60, 24); c.lineTo(84, 60); c.stroke();
    c.fillStyle = "#5a6a7a"; c.font = `italic 13px ${sans}`; c.fillText("le Corbier", 18, 82); c.fillStyle = "#2a2a2a"; c.font = `bold 19px ${sans}`; c.fillText("GALERIE MARCHANDE", 96, 46); c.font = `16px ${sans}`; c.fillText("Shopping Mall", 96, 70); });
  const esfT = tT(512, 96, (c, w, h) => { c.fillStyle = "#f4f4f2"; c.fillRect(0, 0, w, h); c.fillStyle = "#d8202a"; c.beginPath(); c.arc(46, 48, 30, 0, 7); c.fill(); c.fillStyle = "#1a3a8a"; c.font = `italic bold 36px ${sans}`; c.fillText("ÉCOLE DU SKI FRANÇAIS", 88, 60); });
  const esfP = tT(128, 48, (c, w, h) => { c.fillStyle = "#f4f4f2"; c.fillRect(0, 0, w, h); c.strokeStyle = "#d8202a"; c.lineWidth = 4; c.strokeRect(2, 2, w - 4, h - 4); c.fillStyle = "#d8202a"; c.font = `italic bold 30px ${sans}`; c.textAlign = "center"; c.fillText("esf", w / 2, 35); });
  const sherpaT = tT(256, 80, (c, w, h) => { c.fillStyle = "#f6f6f2"; c.fillRect(0, 0, w, h); c.fillStyle = "#d8202a"; c.beginPath(); c.moveTo(14, 64); c.lineTo(40, 16); c.lineTo(66, 64); c.fill(); c.fillStyle = "#1a4a9a"; c.font = `bold 40px ${sans}`; c.fillText("Sherpa", 80, 48); c.fillStyle = "#555"; c.font = `14px ${sans}`; c.fillText("supermarché", 82, 70); });
  const planchesT = tT(128, 128, (c, w, h) => { for (let y = 0; y < h; y += 16) { c.fillStyle = ["#d8b888", "#cba878", "#e0c498"][(y / 16) % 3]; c.fillRect(0, y, w, 15); c.fillStyle = "rgba(90,60,30,.4)"; c.fillRect(0, y + 15, w, 1); } c.fillStyle = "#f4f4f2"; c.fillRect(34, 50, 60, 18); c.fillStyle = "#d8202a"; c.font = `bold 13px ${sans}`; c.fillText("SKISET", 42, 64); });
  const treillisT = tT(128, 128, (c, w, h) => { c.fillStyle = "#d0b088"; c.fillRect(0, 0, w, h); c.strokeStyle = "#5a3a20"; c.lineWidth = 5; for (let k = -h; k < w; k += 16) { c.beginPath(); c.moveTo(k, 0); c.lineTo(k + h, h); c.stroke(); c.beginPath(); c.moveTo(k + h, 0); c.lineTo(k, h); c.stroke(); } c.strokeStyle = "#4a2a16"; c.lineWidth = 8; c.strokeRect(0, 0, w, h); });
  const skisetBande = (txt) => tT(1024, 64, (c, w, h) => { c.fillStyle = "#f4f4f2"; c.fillRect(0, 0, w, h); c.fillStyle = "#6a6e72"; c.font = `32px ${sans}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(txt, w / 2, h / 2 + 2);
    for (const x of [.13, .87]) { c.fillStyle = "#3a3e42"; c.font = `bold 20px ${sans}`; c.fillText("SKISET", x * w - 14, h / 2 + 2); c.fillStyle = "#d8202a"; c.fillRect(x * w + 32, h / 2 - 10, 20, 20); } });
  const locPosT = tT(256, 128, (c, w, h) => { c.fillStyle = "#f4f4f2"; c.fillRect(0, 0, w, h); c.fillStyle = "#d8202a"; c.font = `bold 44px ${sans}`; c.textAlign = "center"; c.fillText("LOCATION", w / 2, 60); c.fillStyle = "#555"; c.font = `20px ${sans}`; c.fillText("Ski · Snowboard · Raquettes", w / 2, 96); });
  const photosT = tT(256, 128, (c, w, h) => { c.fillStyle = "#f4f2ee"; c.fillRect(0, 0, w, h); for (let y = 8; y < h - 20; y += 30) for (let x = 8; x < w - 20; x += 28) { c.fillStyle = "#2a2a2a"; c.fillRect(x, y, 22, 24); c.fillStyle = ["#d8d0c0", "#6a8ab0", "#c8a070", "#f2f2ee"][(x + y) % 4]; c.fillRect(x + 2, y + 2, 18, 20); } });
  const interT = tT(256, 64, (c, w, h) => { c.fillStyle = "#1e3a8a"; c.fillRect(0, 0, w, h); c.fillStyle = "#f4f4f2"; c.fillRect(12, 10, w - 24, h - 20); c.fillStyle = "#d8202a"; c.beginPath(); c.moveTo(24, 22); c.lineTo(32, 42); c.lineTo(44, 18); c.lineTo(38, 18); c.lineTo(32, 31); c.lineTo(30, 22); c.fill();
    c.fillStyle = "#1e3a8a"; c.font = `bold 26px ${sans}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("INTERSPORT", 144, 33); });
  const skieurT = tT(128, 128, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#8ab8e0"); g.addColorStop(1, "#f4f6f8"); c.fillStyle = g; c.fillRect(0, 0, w, h); c.fillStyle = "#f0c020"; c.beginPath(); c.ellipse(64, 60, 18, 30, .5, 0, 7); c.fill(); c.fillStyle = "#1a1a1a"; c.beginPath(); c.arc(76, 30, 9, 0, 7); c.fill(); c.fillRect(30, 96, 70, 5); });
  const interPosT = tT(128, 128, (c, w, h) => { c.fillStyle = "#f4f4f2"; c.fillRect(0, 0, w, h); c.fillStyle = "#d8202a"; c.font = `bold 20px ${sans}`; c.textAlign = "center"; c.fillText("intersport.fr", w / 2, 40); c.fillStyle = "#555"; for (let k = 0; k < 4; k++) c.fillRect(20, 58 + k * 12, 88, 4); });
  const pharT = tT(512, 96, (c, w, h) => { for (const [x0, k] of [[0, 0], [256, 1]]) { const g = c.createLinearGradient(x0, 0, x0 + 256, h); g.addColorStop(0, "#2e7a46"); g.addColorStop(1, "#4a9a5a"); c.fillStyle = g; c.fillRect(x0 + 4, 4, 248, h - 8);
      if (!k) { c.fillStyle = "#e8f4e8"; c.font = `italic bold 46px ${serif}`; c.textAlign = "center"; c.fillText("Pharmacie", x0 + 128, 64); } else for (let y = 14; y < h - 10; y += 26) for (let x = x0 + 16; x < x0 + 244; x += 26) { c.fillStyle = "rgba(220,240,220,.7)"; c.fillRect(x + 7, y, 6, 18); c.fillRect(x + 1, y + 6, 18, 6); } } });
  const pharPosT = tT(128, 160, (c, w, h) => { c.fillStyle = "#f2ecd8"; c.fillRect(0, 0, w, h); c.fillStyle = "#2a6a3a"; c.font = `italic bold 22px ${serif}`; c.textAlign = "center"; c.fillText("Pharmacie", w / 2, 34); for (const [x, y] of [[40, 80], [88, 80], [64, 120]]) { c.fillRect(x - 4, y - 14, 8, 28); c.fillRect(x - 14, y - 4, 28, 8); } });
  const jackT = tT(512, 192, (c, w, h) => { for (let k = 0; k < 24; k++) { c.fillStyle = k % 2 ? "#e8301a" : "#f0c020"; c.beginPath(); c.moveTo(w / 2, h); c.lineTo(w * k / 23 - 20, 0); c.lineTo(w * (k + 1) / 23 + 20, 0); c.fill(); }
    for (let k = 0; k < 14; k++) { c.fillStyle = ["#2a5ac8", "#fff", "#3ac04a", "#c83a9a"][k % 4]; c.beginPath(); c.arc(30 + k * 34, 30 + (k % 3) * 22, 10, 0, 7); c.fill(); } c.fillStyle = "#f4e8a0"; c.fillRect(0, h - 56, w, 50); c.fillStyle = "#1a1a1a"; c.font = `bold 40px ${sans}`; c.textAlign = "center"; c.fillText("JACK ★★ CIRCUS", w / 2, h - 18); });
  const jackMurT = tT(256, 128, (c, w, h) => { c.fillStyle = "#7ac0e8"; c.fillRect(0, 0, w, h); for (let k = 0; k < 18; k++) { c.fillStyle = ["#e8301a", "#f0c020", "#3ac04a", "#c83a9a", "#2a5ac8"][k % 5]; c.beginPath(); c.arc((k * 47) % w, 20 + (k * 29) % 90, 10 + k % 3 * 6, 0, 7); c.fill(); }
    c.fillStyle = "#fff"; c.beginPath(); c.arc(128, 64, 34, 0, 7); c.fill(); c.fillStyle = "#e8301a"; c.beginPath(); c.arc(128, 68, 9, 0, 7); c.fill(); c.fillStyle = "#1a1a1a"; for (const x of [114, 142]) { c.beginPath(); c.arc(x, 54, 4, 0, 7); c.fill(); } c.strokeStyle = "#e8301a"; c.lineWidth = 4; c.beginPath(); c.arc(128, 76, 16, .3, 2.8); c.stroke(); });
  const sport2000T = tT(512, 96, (c, w, h) => { c.fillStyle = "#2a2a30"; c.fillRect(0, 0, w, h); c.fillStyle = "#d8202a"; c.beginPath(); c.arc(56, 48, 34, 0, 7); c.fill(); c.fillStyle = "#fff"; c.font = `bold 14px ${sans}`; c.textAlign = "center"; c.fillText("SPORT", 56, 44); c.fillText("2000", 56, 62); c.font = `bold 44px ${sans}`; c.fillText("LOCATION", 300, 64); });
  const menuT = tT(96, 160, (c, w, h) => { c.fillStyle = "#1a1c1e"; c.fillRect(0, 0, w, h); c.fillStyle = "#f4f2ea"; c.font = `bold 13px ${sans}`; c.textAlign = "center"; c.fillText("PIZZAS", w / 2, 22); for (let k = 0; k < 8; k++) c.fillRect(14, 36 + k * 14, 50 + (k * 11) % 20, 3); });
  // les entrées de la galerie : les panneaux fixes vitrés, les deux battants au milieu, l'enseigne au logo du Corbier
  const galerie = (l, o = {}) => { const a = l.x0, b = l.x1, z = zfAt((a + b) / 2), L2 = b - a, cx = (a + b) / 2, dw = Math.min(.95, (L2 - .6) / 2);
    poteau(a, z); poteau(b, z); bandeau(a, b, z);
    const sl = (L2 - .4 - 2 * dw) / 2; if (sl > .12) for (const u of [a + .2 + sl / 2, b - .2 - sl / 2]) { add(new THREE.PlaneGeometry(sl, 2.0), verreF, u, 1.5, z + .01); box(sl, .5, .12, mat({ map: losT, roughness: .7 }), u, .25, z + .02); }
    for (const u of [cx - dw - .04, cx + dw + .04]) box(.08, 2.5, .13, boisF, u, 1.25, z + .03); box(L2 - .2, .08, .14, boisF, cx, 2.18, z + .03); box(L2 - .2, .07, .13, boisF, cx, 2.5, z + .03); add(new THREE.PlaneGeometry(L2 - .2, .3), verreF, cx, 2.34, z + .01);
    porteBat(cx - dw, 1.08, z + .03, Math.PI / 2, -1, 1, dw, 2.12, porteM, cx, z); porteBat(cx + dw, 1.08, z + .03, Math.PI / 2, 1, -1, dw, 2.12, porteM, cx, z);
    if (o.orange) box(L2 - .25, .64, .06, mat({ color: 0xb8682a, roughness: .7 }), cx, 2.98, z + .03);
    enseigne(cx - .66, cx + .66, z + (o.orange ? .06 : 0), galT, .46, 2.98, .05, .2);
    if (o.caisse) enseigne(cx + .7, cx + 1.1, z, txT(96, 96, "#f2f0ea", "#2a2a2a", "Caisse\nremontées\nSkipass", 18, `bold @ ${sans}`), .4, 2.98, .05, .2); };
  for (const l of LIGNES) { const a = l.x0, b = l.x1, cx = (a + b) / 2, w = b - a;
    if (l.id.startsWith("gal")) { galerie(l, { orange: l.id === "galC", caisse: l.id === "galD" }); continue; }
    const G = (nom, fond, coul) => ({ nom, fond, coul, motif: "souv", police: `bold 46px ${sans}` });
    switch (l.id) {
      case "vitres": { boutiqueF(l, { portes: [[a + 1.2, .9], [a + 2.1, .9], [b - 1.6, .9]], pas: 1.05, dedans: "rayons" }); break; }   /* (10.145 : après les Roches Blanches, les vitrines de bois de la galerie, d'après la photo) */
      case "sherpa": { const z = boutiqueF(l, { portes: [[a + .7, .9], [a + 1.62, .9]], dedans: "rayons", g: G("SHERPA · Supermarché", "#f4f4f2", "#1a4a9a") }); enseigne(b - 1.7, b - .35, z, sherpaT, .42); break; }
      case "skiloc": { const z = boutiqueF(l, { soub: "bois", dedans: "skis", g: G("SKISET · LOCATION DE SKI", "#f2f2ee", "#c8202a") });   // (fermée : les planches claires)
        add(new THREE.PlaneGeometry(w - .3, 1.95), mat({ map: repT(planchesT, Math.max(1, Math.round(w / 1.4))), roughness: .8 }), cx, 1.5, z + .07); store(a + .1, b - .1, z, skisetBande("LOCATION DE SKI  ·  SKI RENTAL"), 0xf2f2ee, .6, 2.55, .26); break; }
      case "skiset": { const z = boutiqueF(l, { soub: "bois", dedans: "skis", g: G("SKISET", "#f2f2ee", "#c8202a") });   // (le treillage)
        add(new THREE.PlaneGeometry(w - .3, 1.95), mat({ map: repT(treillisT, Math.max(1, Math.round(w / 1.2))), roughness: .8 }), cx, 1.5, z + .07); store(a + .1, b - .1, z, skisetBande("SKISET"), 0xf2f2ee, .6, 2.55, .26); break; }
      case "vet": { const z = boutiqueF(l, { soub: "blanc", portes: [[a + .6, .85]], dedans: "habits", g: G("SKISET · VÊTEMENTS · LOCATION", "#f2f2ee", "#c8202a") });
        affiche(cx + .45, 1.2, .8, 1.5, z, locPosT); store(a + .1, b - .1, z, txT(512, 64, "#f4f4f2", "#c8202a", "VÊTEMENTS  ·  LOCATION", 30, `bold @ ${sans}`), 0xf2f2ee, .6, 2.55, .26); break; }
      case "locskis": { const z = boutiqueF(l, { soub: "blanc", portes: [[a + .55, .8]], dedans: "skis", g: G("location de skis", "#e0482a", "#ffffff") });
        affiche(cx + .3, w - 1.4, 1.5, 1.45, z, photosT); store(a + .1, b - .1, z, txT(512, 64, "#e0482a", "#ffffff", "location   de   skis", 38, `bold @ ${sans}`, { raye: 16 }), 0xe0482a, .5, 2.55, .28); break; }
      case "quasar": { const z = boutiqueF(l, { soub: "bois", portes: [[b - .7, .9]], dedans: "habits", pas: 1.2, g: G("quasar · boutique", "#e0482a", "#ffffff") });
        store(a + .1, b - .1, z, txT(512, 64, "#e0482a", "#ffffff", "quasar  ·  boutique", 38, `bold @ ${sans}`, { raye: 16 }), 0xe0482a, .5, 2.55, .28); break; }
      case "interLR": case "interFN": { const fn = l.id === "interFN", z = boutiqueF(l, { soub: "bleu", portes: [[fn ? a + .6 : b - .6, .85]], dedans: "skis", g: G(fn ? "INTERSPORT · FRONT DE NEIGE" : "INTERSPORT · LOCATION RENT", "#1a3a8a", "#ffffff") });
        enseigne(a + .3, b - .3, z, interT, .5); store(a + .1, b - .1, z, txT(512, 64, "#2a5ac8", "#ffffff", fn ? "FRONT DE NEIGE" : "LOCATION RENT", 34, `bold @ ${sans}`), 0x2a5ac8, .9, 2.55, .26);
        affiche(fn ? b - .75 : a + .75, .9, 1.0, 1.35, z, fn ? skieurT : interPosT); affiche(fn ? b - 1.7 : a + 1.7, .8, .9, 1.35, z, fn ? interPosT : skieurT); break; }
      case "pharma": { const z = boutiqueF(l, { portes: [[a + 2.6, .9]], dedans: "pharma", g: G("PHARMACIE", "#2a7a3a", "#ffffff") });   // (les vitraux verts « Pharmacie », la croix verte lumineuse, les affiches)
        enseigne(a + .15, b - .15, z, repT(pharT, Math.max(1, Math.round(w / 2.8))), .62, 2.98, .06, .25); store(a + .1, b - .1, z, txT(256, 32, "#f4f4f2", "#2a7a3a", "", 10, `@ ${sans}`, { bord: "#2a7a3a" }), 0xf2f2ee, .35, 2.5, .1);
        affiche(b - 1.0, 1.0, 1.3, 1.4, z, pharPosT); affiche(a + 1.1, 1.0, 1.1, 1.35, z, skieurT); affiche(a + 4.0, .8, 1.0, 1.35, z, interPosT);
        const cr = lum(mat({ color: 0x1a8a3a, emissive: 0x20c050, emissiveIntensity: .5 }), .5, 1.8); box(.06, .06, 1.2, boisF, b - 1.9, 2.32, z + .6); box(.04, .3, .04, boisF, b - 1.9, 2.17, z + 1.15); box(.08, .6, .2, cr, b - 1.9, 1.72, z + 1.15); box(.08, .2, .6, cr, b - 1.9, 1.72, z + 1.15);   /* (10.127 : la croix sort du store, sur sa potence) */ break; }
      case "patis": { const z = boutiqueF(l, { portes: [[b - .7, .9]], pas: 1.4, dedans: "salon", g: G("Pâtisserie « La Gourmande » · Salon de Thé", "#3c3c3c", "#f4f0e8") });
        store(a + .1, b - .1, z, txT(1024, 64, "#3c3c3c", "#f4f0e8", "Pâtisserie « La Gourmande » Salon de Thé", 36, `italic bold @ ${serif}`), 0x3c3c3c, .5, 2.55, .28); break; }
      case "sombre": { const z = boutiqueF(l, { soub: "bois", portes: [[cx, .9]], g: G("", "#1e1e22", "#f2f2ee") }); add(new THREE.PlaneGeometry(w - .3, 1.95), mat({ color: 0x16181a, roughness: .4 }), cx, 1.5, z - .3); break; }
      case "lampes": { const z = boutiqueF(l, { soub: "bois", papier: true, g: G("", "#5a1a14", "#f4e0c0") });   // (le bar fermé, ses vitres blanchies, les lampes rouges sur leurs potences)
        for (let k = 0; k < 4; k++) { const u = a + (k + .5) * w / 4; box(.05, .05, .5, boisF, u, 2.45, z + .25); cyl(.005, .005, .25, boisF, u, 2.3, z + .48, 3); add(new THREE.SphereGeometry(.09, 10, 8), lum(mat({ color: 0xc81a1a, emissive: 0xff2010, emissiveIntensity: .3 }), .3, 1.6), u, 2.12, z + .48); } break; }
      case "jack": { const z = boutiqueF(l, { sansVitrine: true, g: G("JACK ★★ CIRCUS", "#e8c020", "#c8202a") });   // (le comptoir peint du clown, l'enseigne de fête foraine)
        box(w - .2, 1.0, .5, mat({ map: jackMurT, roughness: .7 }), cx, .5, z + .2); add(new THREE.PlaneGeometry(w - .3, 1.2), verreF, cx, 1.65, z + .01); affiche(cx, w - .4, 1.0, 1.7, z - .3, prodT);
        box(w - .2, .06, .6, mat({ color: 0xf2f2ee }), cx, 1.02, z + .2); enseigne(a + .05, b - .05, z, jackT, .9, 2.85, .12, .2); break; }
      case "pico": { const z = boutiqueF(l, { soub: "bois", portes: [[a + 1.0, .9], [a + 2.0, .9], [b - 1.0, .85, mat({ color: 0xf2f2ee, roughness: .6 })]], papier: true, dedans: "tables", g: G("LA PICORAILLE · Bar Pizzeria", "#1f4fb0", "#ffffff") });
        add(new THREE.PlaneGeometry(.55, .9), mat({ map: menuT }), a + 2.9, 1.3, z + .12); break; }
      case "sport2000": { const z = boutiqueF(l, { soub: "blanc", portes: [[a + .65, .85, mat({ color: 0xf2f2ee, roughness: .6 })]], dedans: "skis", g: G("SPORT 2000 · LOCATION", "#2a2a30", "#ffffff") }); enseigne(a + .2, b - .2, z, sport2000T, .5); break; }
    } }
  // les blocs : la résidence au-dessus, ses avancées et ses renfoncements ; les murs en retour, les bouts
  for (const [a, b, z, r] of BLOCS) { residence(a, b, z, 3, r ? facR : facG, { rouge: !!r, galerie: true }); box(b - a, .08, .66, boisF, (a + b) / 2, 3.42, z - .33); }
  for (let i = 1; i < BLOCS.length; i++) { const zA = BLOCS[i - 1][2], zB = BLOCS[i][2]; if (Math.abs(zA - zB) < .05) continue; box(.3, 3.4, Math.abs(zA - zB), facS, BLOCS[i][0], 1.7, (zA + zB) / 2); }
  for (const x of [-10, 66]) box(.3, 3.4, 12.6, facS, x, 1.7, -6.3);

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
        const ar = deux(add(new THREE.PlaneGeometry(5, .9), mat({ map: aT, side: THREE.DoubleSide }), -78.5, 3.2, -21.6)); void ar; for (const dx of [-2.5, 2.5]) box(.25, 3.4, .25, g(0x5a3a22), -78.5 + dx, 1.7, -21.6); }
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
      grille(-90, -50, 10.6, 13.4, mat({ map: terreT, roughness: 1 }), .02); grille(-90, -50, 13.4, 21.2, mat({ map: herbeT, roughness: 1 }), -.01);   /* (10.127 : plus de large rue grise — le chemin de terre continue, étroit, le long de la piscine ; de l'herbe à côté) */ grille(-90, -50, 21.2, 34, mat({ map: herbeT, roughness: 1 }), -.02); grille(-90, -84.6, -22, 10.6, mat({ map: herbeT, roughness: 1 }), -.02); }
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
    const tourO = vraie(tT(128, 256, (c, w, h) => { c.fillStyle = "#4a2418"; c.fillRect(0, 0, w, h); for (let y = 4; y < h; y += 16) { c.fillStyle = "rgba(20,10,6,.55)"; c.fillRect(0, y, w, 11); for (let x = 3; x < w; x += 21) { c.fillStyle = ["#1c1c22", "#2a2a30", "#3a3e44"][(x + y) % 3]; c.fillRect(x, y + 2, 15, 8); c.fillStyle = "rgba(200,200,200,.35)"; c.fillRect(x, y + 9, 15, 1); } c.fillStyle = "rgba(255,230,210,.18)"; c.fillRect(0, y + 11, w, 2); } c.fillStyle = "#e8e2d8"; c.fillRect(0, 0, 3, h); c.fillRect(w - 3, 0, 3, h); c.fillStyle = "rgba(232,226,216,.8)"; c.fillRect(w / 2 - 1, 0, 2, h); }, 3, 1), "images/corbier-sol/tour-brune.jpg", [11.6, 11.2]);
    for (const [x, z, h, w] of [[-104, -14, 50, 18], [-110, 10, 46, 16], [-100, 34, 42, 15]]) { box(w, h, 15, mat({ map: tourO, fog: false }), x, h / 2, z); box(w + 1, 1.2, 16, mat({ color: 0x5a2a12 }), x, h + .6, z); } }   // (les tours orangées, au bout de la piscine)

  /* ---------- le bâtiment de l'École du Ski Français, la Fontaine de l'Ours ---------- */
  { const n0E = scene.children.length; residence(-39, -1, -3.2, 3, facG);
    { const corps = scene.children[n0E]; scene.remove(corps); const H = 3.4 + 3 * 2.8, zc = -3.2 - 6.6;   /* (10.128 : le corps de l'École du Ski, ouvert au rez-de-chaussée : le passage de la galerie) */
      const bx = (x0, x1, z0, z1, y0 = 0, y1 = H) => box(x1 - x0, y1 - y0, z1 - z0, facS, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);   /* (10.132 : découpé autour du hall final de la galerie et de la porte) */
      bx(-39, -36.25, -15.2, -3.2); bx(-23.35, -14.05, -15.2, -3.2); bx(-11.75, -1, -15.2, -3.2); bx(-14.05, -11.75, -15.2, -7.6); bx(-14.05, -11.75, -7.6, -3.2, 2.7); bx(-36.25, -23.35, -15.2, -13.25); bx(-36.25, -27.6, -3.95, -3.2); bx(-36.25, -23.35, -13.25, -3.2, 3.25); bx(-27.6, -23.35, -3.95, -3.2, 2.6); void zc; }   /* (10.108 : collé à la longue résidence — plus d'espace entre les deux) */
    /* (10.145, d'après la photo du 461 promenade du Front de Neige) le rez-de-chaussée : côté piscine l'ESF (le grand panneau rouge, la porte vitrée, les plaques esf),
       puis le bar-restaurant-pizzeria Les Roches Blanches (ses quatre enseignes brunes entre les consoles, le lambrequin, les chaises retournées derrière les vitres),
       puis la galerie marchande : les portes et les vitrines de bois, son panneau « Galerie marchande · Shopping Mall » */
    { const Z = -3.2, fond = (a, b, t, j2 = .3) => add(new THREE.PlaneGeometry(b - a - .2, 2.0), lum(mat({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: j2 }), j2, .5), (a + b) / 2, 1.5, Z - .7);
      const RBt = tT(256, 128, (c, w, h) => { c.fillStyle = "#3a2a20"; c.fillRect(0, 0, w, h); c.fillStyle = "rgba(255,220,170,.25)"; c.fillRect(0, 0, w, 30); for (let x = 12; x < w; x += 40) { c.fillStyle = "#8a5a32"; c.fillRect(x, 50, 26, 6); for (let k = 0; k < 4; k++) c.fillRect(x + 2 + k * 7, 56, 3, 40); c.fillRect(x, 96, 26, 4); } });
      const galT2 = tT(256, 128, (c, w, h) => { c.fillStyle = "#4a3e36"; c.fillRect(0, 0, w, h); c.fillStyle = "rgba(255,240,210,.35)"; c.fillRect(0, 0, w, 40); c.fillStyle = "#6a5446"; c.fillRect(0, 96, w, 32); });
      const sec = [[-39, -34.3, "esf"], [-34.3, -26.35, "rb"], [-23.65, -19.5, "rb"], [-19.5, -14.2, "gal"], [-11.6, -1.1, "gal"]];
      for (const [a, b, k] of sec) { poteau(a, Z); poteau(b, Z); bandeau(a, b, Z);
        if (k === "esf") { vitrine(a, b, Z, { soub: "rouge", portes: [[a + .7, .9]] }); box((b - a) * .5, 2.0, .06, mat({ color: 0xc41e26, roughness: .5 }), b - .12 - (b - a) * .25, 1.5, Z + .05); fond(a, b, prodT);
          for (const u of [b - 1.9, b - .9]) add(new THREE.PlaneGeometry(.62, .24), mat({ map: esfP }), u, .28, Z + .09); enseigne(a + .1, b - .1, Z, esfT, .5); }
        else if (k === "rb") { vitrine(a, b, Z, { pas: 1.0 }); fond(a, b, RBt, .25); }
        else { vitrine(a, b, Z, { portes: [] }); fond(a, b, galT2, .2); } }   // (10.163 : à côté de la porte battante, plus de portes vitrées)
      { const a = -34.3, b = -19.5, w = b - a; ["SPÉCIALITÉS\nSAVOYARDES", "PIZZERIA", "RESTAURANT", "BAR"].forEach((t, i) => enseigne(a + i * w / 4 + .35, a + (i + 1) * w / 4 - .35, Z, txT(256, 64, "#5a2c18", "#f4ece0", t, t.length > 12 ? 24 : 40, `bold @ ${sans}`), .55, 3.0, .12));
        store(a + .1, b - .1, Z, txT(1024, 48, "#5a2414", "#f4ece0", "BAR      RESTAURANT      PIZZERIA      LES ROCHES BLANCHES", 30, `bold @ ${sans}`), 0x6a2a18, .35, 2.62, .22); }
      enseigne(-9.6, -7.4, Z, galT, .5, 2.98, .05, .2); }
    { const cadre = mat({ color: 0x5a3018, roughness: .7 }), boisP = mat({ map: tT(64, 128, (c, w, h) => { c.fillStyle = "#8a5a32"; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 8) { c.fillStyle = "rgba(0,0,0,.18)"; c.fillRect(x, 0, 1, h); } c.strokeStyle = "#5a3418"; c.lineWidth = 4; c.strokeRect(8, 10, w - 16, 50); c.strokeRect(8, 70, w - 16, 48); c.fillStyle = "#b8ccd4"; c.fillRect(14, 16, w - 28, 38); }), roughness: .7 });
      for (const sx of [-1.35, 1.35]) box(.15, 2.3, .22, cadre, -25 + sx, 1.15, -3.1); box(2.85, .18, .22, cadre, -25, 2.35, -3.1);
      porteBat(-26.25, 1.08, -3.12, Math.PI / 2, -1, 1, 1.25, 2.15, boisP, -25, -3.1); for (const sx of [-1.25, 1.25]) box(.15, 2.3, .22, cadre, -12.9 + sx, 1.15, -3.1); box(2.65, .18, .22, cadre, -12.9, 2.35, -3.1);
      porteBat(-14.0, 1.08, -3.12, Math.PI / 2, -1, 1, 1.1, 2.15, boisP, -12.9, -3.1); porteBat(-11.8, 1.08, -3.12, Math.PI / 2, 1, -1, 1.1, 2.15, boisP, -12.9, -3.1);   /* (10.141 : la seconde double porte battante, au centre de la façade) */ porteBat(-23.75, 1.08, -3.12, Math.PI / 2, 1, -1, 1.25, 2.15, boisP, -25, -3.1); }
    // la terrasse de bois de la Fontaine de l'Ours, sa barrière de rondins
    // (10.123 : le parquet sombre et sa barrière retirés : le platelage clair va jusqu'au bâtiment)
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
    const chaise = (x, z, ry, m) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g); const a = new THREE.Mesh(new THREE.BoxGeometry(.44, .05, .42), m); a.position.y = .46; g.add(a); const d = new THREE.Mesh(new THREE.BoxGeometry(.44, .48, .05), m); d.position.set(0, .72, -.2); d.rotation.x = -.12; g.add(d); for (const [dx, dz] of [[-.19, -.17], [.19, -.17], [-.19, .17], [.19, .17]]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(.018, .018, .46, 5), m); l.position.set(dx, .23, dz); g.add(l); } SIEGE(x, z, ry); };
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
    box(7.8, 3.6, 10, facS, 70.4, 1.8, -6); add(new THREE.PlaneGeometry(16, 1.2), lum(mat({ map: yT, emissive: 0xffffff, emissiveMap: yT, emissiveIntensity: .12 }), .12, .9), 74.5, 3.0, -.98);
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
    const chaiseG = (x, z, ry, m) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g); const a = new THREE.Mesh(new THREE.BoxGeometry(.44, .05, .42), m); a.position.y = .45; g.add(a); for (let k = 0; k < 4; k++) { const l = new THREE.Mesh(new THREE.BoxGeometry(.06, .5, .03), m); l.position.set(-.15 + k * .1, .74, -.2); l.rotation.x = -.15; g.add(l); } for (const [dx, dz] of [[-.19, -.17], [.19, -.17], [-.19, .17], [.19, .17]]) { const l = new THREE.Mesh(new THREE.BoxGeometry(.04, .45, .04), m); l.position.set(dx, .22, dz); g.add(l); } SIEGE(x, z, ry, .45); };
    const tables = (x0, x1, z0, z1, mC) => { let k = 0; for (let x = x0 + .9; x < x1 - .6; x += 1.8) for (let z = z0 + .9; z < z1 - .6; z += 1.7) { box(.75, .04, .75, tabB, x, .74, z); cyl(.03, .03, .72, noirP, x, .37, z, 5); for (const sg of [-1, 1]) chaiseG(x, z + sg * .55, sg < 0 ? 0 : Math.PI, mC[k++ % mC.length]); OB.push([x, z, .7]); } };
    // la véranda rouge du Yéti : le toit rouge en pente, les poteaux blancs, le vitrage, les chaises rouges et blanches dedans
    { const x0 = 67.2, x1 = 81.6, z0 = .2, z1 = 6.4; terrasse(x0, x1, z0, z1 + .2); const tr = box(x1 - x0 + .4, .05, z1 - z0 + .6, mat({ color: 0xf4f4f2, roughness: .5, transparent: true, opacity: .55, side: THREE.DoubleSide, depthWrite: false }), (x0 + x1) / 2, 2.9, (z0 + z1) / 2); tr.rotation.x = -.12;   /* (10.144 : le toit translucide, le lambrequin rouge « LE YETI », comme sur la photo) */
      { const vT = tT(1024, 48, (c, w, h) => { c.fillStyle = "#d01c22"; c.fillRect(0, 0, w, h); c.fillStyle = "#fff"; c.font = `bold 28px ${sans}`; c.textAlign = "center"; c.textBaseline = "middle"; for (let k = 0; k < 3; k++) c.fillText("LE YETI", w * (k + .5) / 3, h / 2 + 2); }); deux(add(new THREE.PlaneGeometry(x1 - x0 + .4, .3), mat({ map: vT, side: THREE.DoubleSide }), (x0 + x1) / 2, 2.62, z1 + .32)); }
      for (let x = x0; x <= x1 + .01; x += (x1 - x0) / 4) { cyl(.07, .07, 2.6, blanc, x, 1.3, z1, 8); OB.push([x, z1, .3]); } box(x1 - x0, .14, .14, blanc, (x0 + x1) / 2, 2.6, z1);
      const vg = mat({ color: 0xdcecf0, roughness: .05, transparent: true, opacity: .25, depthWrite: false }); box(x1 - x0, 1.9, .03, vg, (x0 + x1) / 2, 1.5, z1); box(.03, 2, z1 - z0, vg, x1, 1.4, (z0 + z1) / 2);
      tables(x0, x1, z0, z1, [mat({ color: 0xd02a26 }), mat({ color: 0xf2f2f2 })]); }
    /* (10.144, d'après les photos) La Picoraille : la grande pergola blanche (les poteaux, les chevrons, les lames du toit, le toit translucide), sa bâche bleue
       « BAR · PIZZERIA · RESTAURANT · LA PICORAILLE », la terrasse de planches et ses tables ; devant la location Sport 2000, la tonnelle bleu nuit */
    { const LJ = LG("jack"), LPi = LG("pico"), LS = LG("sport2000"), x0 = LJ.x0 + .2, x1 = LPi.x1 - .1, z0 = .3, z1 = 6.0, cx = (x0 + x1) / 2; terrasse(x0, x1, z0, z1 + .2);
      const n = Math.max(2, Math.round((x1 - x0) / 2.9)); for (let k = 0; k <= n; k++) { const x = x0 + k * (x1 - x0) / n; cyl(.06, .06, 2.8, blanc, x, 1.4, z1, 8); OB.push([x, z1, .3]); const ch = box(.1, .14, z1 - z0 + .3, blanc, x, 2.95, (z0 + z1) / 2); ch.rotation.x = .045; }
      box(x1 - x0, .16, .16, blanc, cx, 2.8, z1); for (let z = z0 + .3; z < z1; z += .42) box(x1 - x0, .05, .14, blanc, cx, 3.06 - (z - z0) * .045, z);
      const tp = box(x1 - x0, .02, z1 - z0, mat({ color: 0xf4f4f2, transparent: true, opacity: .35, side: THREE.DoubleSide, depthWrite: false }), cx, 3.0, (z0 + z1) / 2); tp.rotation.x = .045;
      const bT = tT(1024, 96, (c, w, h) => { c.fillStyle = "#1f4fb0"; c.fillRect(0, 0, w, h); c.fillStyle = "#fff"; c.fillRect(0, h - 12, w, 4); c.font = `bold 44px ${sans}`; c.textBaseline = "middle"; c.textAlign = "center"; ["BAR", "PIZZERIA", "RESTAURANT", "LA PICORAILLE"].forEach((t, i) => c.fillText(t, w * (i + .5) / 4, 42)); });
      add(new THREE.PlaneGeometry(x1 - x0, .42), lum(mat({ map: bT, emissive: 0xffffff, emissiveMap: bT, emissiveIntensity: .12, side: THREE.DoubleSide }), .12, .8), cx, 2.98, z1 + .1);
      tables(x0 + 2.4, x1, z0 + .8, z1 - .3, [gris]);
      const gx = (LS.x0 + LS.x1) / 2, gz = 2.4, nv = mat({ color: 0x1c2a5a, roughness: .7, side: THREE.DoubleSide });
      for (const [sx, sz] of [[-1.4, -1.4], [1.4, -1.4], [-1.4, 1.4], [1.4, 1.4]]) { cyl(.04, .04, 2.2, blanc, gx + sx, 1.1, gz + sz, 6); OB.push([gx + sx, gz + sz, .2]); }
      const tt = add(new THREE.ConeGeometry(2.1, .9, 4, 1, true), nv, gx, 2.65, gz); tt.rotation.y = Math.PI / 4; for (const [w2, d2, ox, oz] of [[2.9, .02, 0, 1.45], [2.9, .02, 0, -1.45], [.02, 2.9, 1.45, 0], [.02, 2.9, -1.45, 0]]) box(w2, .24, d2, nv, gx + ox, 2.1, gz + oz); }
  }

  /* ---------- le mobilier de la promenade : les lampadaires verts à deux lanternes, les bacs rouges et leurs arbres, les jardinières, les bancs, les tables ---------- */
  const vertL = mat({ color: 0x8aa898, roughness: .45, metalness: .4 }), verreL = lum(mat({ color: 0xf2f0e0, emissive: 0xffe0a0, emissiveIntensity: .05, transparent: true, opacity: .9 }), .05, 2.4), HALO = [];
  const lampadaire = (x, z) => { cyl(.07, .1, 4.6, vertL, x, 2.3, z, 8); cyl(.16, .2, .4, vertL, x, .2, z, 8);
    for (const s of [-1, 1]) { const b = add(new THREE.TorusGeometry(.5, .04, 6, 12, Math.PI * .9), vertL, x + s * .5, 4.4, z); b.rotation.z = s > 0 ? 0 : Math.PI; if (s < 0) b.rotation.y = Math.PI; const l = add(new THREE.CylinderGeometry(.24, .1, .55, 4), verreL, x + s * 1.0, 4.1, z); l.rotation.y = Math.PI / 4; add(new THREE.ConeGeometry(.3, .2, 4), vertL, x + s * 1.0, 4.45, z).rotation.y = Math.PI / 4; HALO.push([x + s, 4.1, z]); }
    for (let k = 0; k < 10; k++) add(new THREE.IcosahedronGeometry(.13, 0), FLL[k % 3], x + Math.cos(k * .63) * .3, 2.3 + (k % 3) * .09, z + Math.sin(k * .63) * .3);   // (10.144 : la corbeille de géraniums)
    OB.push([x, z, .3]); };
  const FLL = [mat({ color: 0xe8306a }), mat({ color: 0xf090b0 }), mat({ color: 0x3a6a2a })];
  for (let x = -36; x < 82; x += 13) lampadaire(x, 7.3);
  const rougeP = mat({ color: 0xd84838, roughness: .5 }), feuilleM = [mat({ color: 0x4a7a2a }), mat({ color: 0x5a8a34 }), mat({ color: 0x3a6a24 })];
  const bacArbre = (x, z, pin) => { cyl(.65, .45, .55, rougeP, x, .3, z, 14); cyl(.04, .06, 2.4, mat({ color: 0x8a7a6a }), x, 1.5, z, 6); for (let k = 0; k < 4; k++) add(new THREE.IcosahedronGeometry(pin ? .55 : .5, 0), feuilleM[k % 3], x + (al() - .5) * .5, 2.3 + al() * .7, z + (al() - .5) * .5); OB.push([x, z, .8]); };
  void bacArbre;   // (10.100 : les accessoires retirés — l'administrateur les redemande un par un, par les notes)
  const fleurM = [0xe8306a, 0xf090b0, 0xffffff, 0xe85a2a].map(c2 => mat({ color: c2 }));
  const jardiniere = (x, z) => { box(1.8, .45, .7, boisC, x, .23, z); for (let k = 0; k < 14; k++) add(new THREE.IcosahedronGeometry(.13 + al() * .08, 0), fleurM[k % 4], x - .8 + al() * 1.6, .55 + al() * .2, z + (al() - .5) * .5); OB.push([x, z, 1]); };
  void jardiniere;
  const banc = (x, z, ry = 0) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g); for (let k = 0; k < 3; k++) { const l = new THREE.Mesh(new THREE.BoxGeometry(1.8, .05, .12), boisC); l.position.set(0, .45, -.15 + k * .14); g.add(l); } for (let k = 0; k < 2; k++) { const l = new THREE.Mesh(new THREE.BoxGeometry(1.8, .12, .04), boisC); l.position.set(0, .65 + k * .16, -.25); g.add(l); } for (const s of [-.75, .75]) { const p = new THREE.Mesh(new THREE.BoxGeometry(.06, .45, .45), boisC); p.position.set(s, .22, 0); g.add(p); } OB.push([x, z, .9]); banc2(x, z, ry); return g; };
  const BANCS = []; void banc;
  // les tables de pique-nique du Yéti, les tables de la terrasse des Roches Blanches
  const pique = (x, z) => { box(1.8, .06, .7, boisC, x, .74, z); for (const s of [-1, 1]) { box(1.8, .05, .26, boisC, x, .44, z + s * .55); box(.08, .74, .08, boisC, x + .75, .37, z + s * .25); box(.08, .74, .08, boisC, x - .75, .37, z + s * .25); } OB.push([x, z, 1.1]); };
  void pique;
  const TABLES = [], nappeM = mat({ color: 0xc8202a }), chaiseM = mat({ color: 0x8a5a32 });
  const table = (x, z) => { cyl(.4, .4, .04, nappeM, x, .74, z, 14); cyl(.04, .05, .72, mat({ color: 0x222222 }), x, .37, z, 6); for (const s of [-1, 1]) { box(.42, .05, .42, chaiseM, x + s * .62, .46, z); box(.05, .5, .42, chaiseM, x + s * .85, .72, z); SIEGE(x + s * .62, z, -s * Math.PI / 2); } TABLES.push([x, z]); OB.push([x, z, 1.1]); };
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
  // (10.124 : les quatre bouleaux du bout retirés : à leur place, l'escalier et la passerelle)
  for (const [x, z, h] of [[-90, -16, 11], [-92, 20, 13]]) sapin(x, z, h, al() < .4 ? melezeM : sapinM);
  for (let k = 0; k < 14; k++) sapin(-130 + k * 18 + al() * 6, -78 - al() * 30, 14 + al() * 8);   // la forêt, derrière les tours
  /* (10.127) le terrain de badminton dans l'herbe, devant la promenade : le sable, les lignes blanches, le filet au milieu — on joue de gauche à droite */
  { const cz = 23, sT = vraie(tT(8, 8, (c, w, h) => { c.fillStyle = "#d6c096"; c.fillRect(0, 0, w, h); }), "images/corbier-sol/sable.jpg", 2), blanc = mat({ color: 0xf4f4f0, roughness: .8 });
    L.solsPlus.push(sol(-8, 8, cz - 4.2, cz + 4.2, mat({ map: sT, roughness: 1 }), .02));
    const ligne = (w, d, x, z) => box(w, .012, d, blanc, x, .03, z);
    for (const s2 of [-1, 1]) { ligne(13.4, .05, 0, cz + s2 * 3.05); ligne(13.4, .05, 0, cz + s2 * 2.59); ligne(.05, 6.1, s2 * 6.7, cz); ligne(.05, 6.1, s2 * 5.94, cz); ligne(.05, 6.1, s2 * 1.98, cz); ligne((6.7 - 1.98), .05, s2 * (1.98 + 6.7) / 2, cz); }
    const poteau2 = mat({ color: 0x2a5a3a, metalness: .4, roughness: .5 }); for (const s2 of [-1, 1]) { cyl(.025, .03, 1.55, poteau2, 0, .78, cz + s2 * 3.1, 8); OB.push([0, cz + s2 * 3.1, .15]); }
    box(.02, .72, 6.2, mat({ color: 0x1a1a1a, transparent: true, opacity: .45, depthWrite: false }), 0, 1.16, cz); box(.03, .05, 6.2, blanc, 0, 1.53, cz); }
  /* (10.111, d'après les photos de la promenade) les arbres et la végétation : les épicéas et mélèzes du talus, au bout côté Yéti et au bout côté piscine, les buissons le long des chemins */
  for (const [x, z, h] of [[-48, 24, 13], [-44, 27, 11], [-70, 28, 14], [72, 22, 12], [78, 26, 14], [86, 20, 11], [-20, 52, 12], [10, 56, 10]]) sapin(x, z, h, al() < .35 ? melezeM : sapinM);
  for (let k = 0; k < (PETIT ? 10 : 26); k++) { const x = -60 + al() * 140, z = 22 + al() * 22; if (Math.abs(x - 30) < 14 && z < 34) continue; if (Math.abs(x) < 10 && z > 17.5 && z < 29) continue; buisson(x, z, .7 + al() * .7); }
  /* (10.144, d'après les photos) le mobilier de la promenade : les gros pots rouges et leur petit arbre, les bancs de bois contre les vitrines, les jardinières de géraniums roses,
     le kiosque d'affichage sur son poteau devant la galerie, le panneau Skiset à flèche et les quads bâchés, le drapeau rouge, les poubelles, le chemin de planches et ses barrières de rondins,
     la grande terrasse de bois des Roches Blanches et sa bordure */
  { const potR = mat({ color: 0xd84a3a, roughness: .55 }), terreM = mat({ color: 0x3a2a1e }), rondin = mat({ color: 0x9a7a58, roughness: .85 }), fleurR = [mat({ color: 0xe86a9a }), mat({ color: 0xf0a0c0 }), mat({ color: 0xffffff })], vertF = mat({ color: 0x3a6a2a });
    const fer = mat({ color: 0x3a3c40, metalness: .5, roughness: .5 }), bk = mat({ color: 0x7a5a3a, roughness: .85 });
    const pot = (x, z, nu) => { cyl(.7, .5, .75, potR, x, .4, z, 16); cyl(.62, .62, .04, terreM, x, .76, z, 14); cyl(.04, .05, 1.6, mat({ color: 0xd8d0c0 }), x, 1.5, z, 5);
      if (nu) for (let k = 0; k < 7; k++) { const br = cyl(.012, .02, 1.0, mat({ color: 0x8a7a6a }), x + Math.cos(k * 2.3) * .22, 2.65, z + Math.sin(k * 2.3) * .22, 4); br.rotation.set(Math.sin(k * 2.3) * .5, 0, -Math.cos(k * 2.3) * .5); }
      else for (let k = 0; k < 4; k++) add(new THREE.IcosahedronGeometry(.5 - k * .08, 1), [vertF, mat({ color: 0x4a7a32 })][k % 2], x + (al() - .5) * .3, 2.0 + k * .32, z + (al() - .5) * .3); OB.push([x, z, .9]); };
    { /* (10.127, d'après la photo) entre les deux pots : le petit manège des enfants — le bassin rond bleu, l'eau, six bateaux-chiens qui tournent tous dans le même sens, la tête devant */
      const mx = (LG("galA").x0 - 1.0 + LG("galB").x0 - 1.1) / 2, mz = 3.5, R1 = 1.35, R0 = .62, bleu = mat({ color: 0x2a8ad0, roughness: .45 }), eau = mat({ color: 0x5ac8f0, roughness: .1, metalness: .1, transparent: true, opacity: .85 });
      add(new THREE.CylinderGeometry(R1, R1 + .05, .34, 40, 1, true), mat({ color: 0x2a8ad0, roughness: .45, side: THREE.DoubleSide }), mx, .2, mz); add(new THREE.CylinderGeometry(R0, R0, .38, 32, 1, true), mat({ color: 0x2a8ad0, roughness: .45, side: THREE.DoubleSide }), mx, .22, mz);
      for (const [r, y] of [[R1 + .02, .37], [R0, .41]]) { const t = add(new THREE.TorusGeometry(r, .04, 6, 40), bleu, mx, y, mz); t.rotation.x = Math.PI / 2; }
      const fond = add(new THREE.RingGeometry(R0, R1, 40), eau, mx, .3, mz); fond.rotation.x = -Math.PI / 2; add(new THREE.CylinderGeometry(R0 - .02, R0 - .02, .05, 32), mat({ color: 0x3a3e44, roughness: .9 }), mx, .06, mz);
      const G2 = new THREE.Group(); G2.position.set(mx, 0, mz); G2.userData.anime = true; scene.add(G2); const noirM = mat({ color: 0x141414 }), blancM = mat({ color: 0xf4f4f2 }), rampe = mat({ color: 0xc8ccd0, metalness: .7, roughness: .3 }), Rm = (R0 + R1) / 2;
      [0xd8302a, 0x2a5ad8, 0x3ab04a, 0xf0c820, 0xf0a0c0, 0xf07a20].forEach((col, i) => { const a = i / 6 * Math.PI * 2, b = new THREE.Group(); b.position.set(Math.sin(a) * Rm, .3, Math.cos(a) * Rm); b.rotation.y = a + Math.PI / 2; G2.add(b); const cm = mat({ color: col, roughness: .5 });
        const pc = (g, m, x, y, z) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); b.add(o); return o; };
        pc(new THREE.BoxGeometry(.4, .2, .62), cm, 0, .08, 0); pc(new THREE.BoxGeometry(.34, .14, .12), cm, 0, .24, -.24);   // la coque, le dossier
        pc(new THREE.BoxGeometry(.3, .26, .22), cm, 0, .3, .22);   // la tête du chien, devant
        for (const sx of [-1, 1]) { const e = pc(new THREE.BoxGeometry(.05, .2, .1), noirM, sx * .17, .28, .2); e.rotation.z = sx * .15; pc(new THREE.BoxGeometry(.02, .04, .03), noirM, sx * .06, .36, .335); }   // les oreilles, les yeux
        pc(new THREE.BoxGeometry(.06, .05, .03), noirM, 0, .29, .34); pc(new THREE.BoxGeometry(.1, .015, .02), noirM, 0, .24, .335);   // la truffe, le sourire
        const rp = pc(new THREE.TorusGeometry(.07, .012, 4, 10), rampe, 0, .3, .04); rp.rotation.x = .4; void blancM; });
      L.manege = G2; OB.push([mx, mz, R1 + .15]); }
    pot(-26.6, 6.6); pot(LG("galA").x0 - 1.0, 3.6); pot(LG("galB").x0 - 1.1, 3.4); pot(LG("patis").x0 + 2.6, 3.6); pot(LG("galD").x1 + .8, 3.4, true);
    const bancF = (x) => { const z = zfAt(x); for (let k = 0; k < 3; k++) box(1.6, .05, .12, boisC, x, .46, z + .85 + k * .14); for (const sx of [-.7, .7]) box(.08, .46, .4, mat({ color: 0x3a2a1a }), x + sx, .23, z + 1); box(1.6, .3, .05, boisC, x, .72, z + .7); OB.push([x, z + 1, .9]); banc2(x, z + 1, 0); };
    for (const x of [LG("sherpa").x1 - 1.6, LG("skiloc").x0 + 1.7, LG("pharma").x0 + 1.4, LG("pharma").x0 + 3.9, LG("patis").x0 + 1.1]) bancF(x);
    { const deja = [LG("sherpa").x1 - 1.6, LG("skiloc").x0 + 1.7, LG("pharma").x0 + 1.4, LG("pharma").x0 + 3.9, LG("patis").x0 + 1.1, -26.6, LG("galA").x0 - 1.0, LG("galB").x0 - 1.1, LG("patis").x0 + 2.6, LG("galD").x1 + .8];   /* (10.127) des bancs contre les façades, entre les portes des boutiques (pas devant les galeries) */
      for (let i = 1; i < LIGNES.length; i++) { const A = LIGNES[i - 1], B = LIGNES[i]; if (/^gal|vitres/.test(A.id) || /^gal|vitres/.test(B.id)) continue; const x = B.x0; if (deja.some(d => Math.abs(d - x) < 4.5)) continue; const pres = deja.filter(d => Math.abs(d - x) < 9).length; if (pres >= 1 && deja.filter(d => Math.abs(d - x) < 15).length >= 2) continue; bancF(x); deja.push(x); } }   /* (10.127 : jamais plus de deux bancs à la suite, bien espacés) */
    for (const x of [LG("skiset").x0 + .8, LG("interLR").x0 + .2, LG("jack").x0 + .4]) { const z = 6.5; box(1.8, .4, .5, boisC, x, .2, z); for (let k = 0; k < 14; k++) add(new THREE.IcosahedronGeometry(.12, 0), k % 4 === 3 ? vertF : fleurR[k % 3], x - .8 + al() * 1.6, .48 + al() * .2, z + (al() - .5) * .35); OB.push([x, z, 1]); }
    for (const x of [-22]) { for (const sx of [-1.4, 1.4]) { for (const sg of [-1, 1]) { const j = cyl(.06, .06, .9, rondin, x + sx, .4, 6.2, 6); j.rotation.x = sg * .5; } } for (const y of [.45, .7]) { const r = cyl(.08, .08, 3.2, rondin, x, y, 6.2, 8); r.rotation.z = Math.PI / 2; } OB.push([x - 1, 6.2, .5], [x + 1, 6.2, .5]); }
    // le chemin de planches qui traverse le gravier vers la galerie au panneau orangé, ses barrières de rondins
    { const gC = LG("galC"), xc = (gC.x0 + gC.x1) / 2; L.solsPlus.push(sol(xc - 1.3, xc + 1.3, 7, 12.6, mat({ map: deckT, roughness: .8 }), .035));
      for (const sx of [-1.32, 1.32]) box(.1, .08, 5.6, boisC, xc + sx, .06, 9.8); }   // (10.152 : une simple rampe de planches, sans barrière)
    // (10.153, d'après la photo) deux tables de ping-pong en béton, sur le gravier, le long du plancher
    { const vt = mat({ color: 0x2a6a4a, roughness: .5 }), bl = mat({ color: 0xf4f4f2 }), gr = mat({ color: 0x8a8a86, roughness: .9 }), fil = mat({ color: 0x2a2a2c, transparent: true, opacity: .7 });
      for (const x of [LG("skiset").x0 - .5, LG("vet").x1 + 2.2, LG("pharma").x0 + 4.1, LG("patis").x0 + 6.3]) { const z = 9.2;   /* (10.127 : les deux du milieu, décalées : on joue sans se cogner à la rampe de planches) */ box(2.74, .08, 1.52, vt, x, .76, z); box(2.74, .085, .03, bl, x, .76, z + .74); box(2.74, .085, .03, bl, x, .76, z - .74); box(.03, .085, 1.52, bl, x + 1.35, .76, z); box(.03, .085, 1.52, bl, x - 1.35, .76, z); box(2.74, .086, .02, bl, x, .76, z);
        box(.06, .16, 1.7, fil, x, .88, z); for (const sx of [-.9, .9]) box(.2, .72, 1.1, gr, x + sx, .36, z); OB.push([x - .9, z, 1.1], [x + .9, z, 1.1]); } }
    // le kiosque d'affichage sur son poteau, son petit toit à deux pans, devant la galerie
    { const gA = LG("galA"), kx = (gA.x0 + gA.x1) / 2 + .5, kz = zfAt(kx) + 2.4, affT = tT(128, 80, (c, w, h) => { c.fillStyle = "#3a2a1e"; c.fillRect(0, 0, w, h); for (let k = 0; k < 5; k++) { c.fillStyle = ["#f4f2ea", "#f0e0a0", "#e8f0f4"][k % 3]; c.fillRect(8 + k * 23, 10 + (k % 2) * 8, 19, 26); } });
      cyl(.07, .08, 2.2, bk, kx, 1.1, kz, 6); for (let k = 0; k < 4; k++) { const a2 = k * Math.PI / 2, br = cyl(.03, .03, .8, bk, kx + Math.cos(a2) * .25, .26, kz + Math.sin(a2) * .25, 4); br.rotation.set(-Math.sin(a2) * .9, 0, Math.cos(a2) * .9); }
      box(1.0, .6, .14, bk, kx, 2.05, kz); add(new THREE.PlaneGeometry(.9, .5), mat({ map: affT }), kx, 2.05, kz + .08); for (const sg of [-1, 1]) { const r = box(1.25, .04, .55, mat({ color: 0x5a3a26 }), kx, 2.52, kz + sg * .2); r.rotation.x = sg * .6; } OB.push([kx, kz, .4]); }
    // le panneau Skiset à flèche, sur ses deux poteaux ; les quads bâchés de blanc
    { const v = LG("vet"), sx = (v.x0 + v.x1) / 2 + .3, sz = zfAt(sx) + 3.0, pT = tT(128, 160, (c, w, h) => { c.fillStyle = "#4a2414"; c.fillRect(0, 0, w, h); c.fillStyle = "#f4f4f2"; c.font = `bold 26px ${sans}`; c.textAlign = "center"; c.fillText("SKISET", w / 2 - 10, 38); c.fillStyle = "#d8202a"; c.fillRect(w - 30, 18, 22, 22);
        c.fillStyle = "#f4f4f2"; c.beginPath(); c.moveTo(20, 80); c.lineTo(84, 80); c.lineTo(84, 64); c.lineTo(112, 92); c.lineTo(84, 120); c.lineTo(84, 104); c.lineTo(20, 104); c.fill(); c.font = `11px ${sans}`; c.fillText("LOCATION SKI RENTAL", w / 2, 146); });
      for (const d of [-.6, .6]) box(.12, 2.0, .12, bk, sx + d, 1.0, sz); box(1.3, 1.5, .1, mat({ color: 0x4a2414 }), sx, 1.25, sz); add(new THREE.PlaneGeometry(1.2, 1.4), mat({ map: pT }), sx, 1.25, sz + .056); OB.push([sx, sz, .8]);
      const tarp = mat({ color: 0xe8eaec, roughness: .9 }); for (const [qx, qz, r] of [])   /* (10.126 : les quads bâchés retirés) */ { const g2 = new THREE.Group(); g2.position.set(qx, 0, zfAt(qx) + qz); g2.rotation.y = r; scene.add(g2);
        const b2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, .75, 1.9), tarp); b2.position.y = .55; g2.add(b2); const t2 = new THREE.Mesh(new THREE.SphereGeometry(.62, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), tarp); t2.scale.set(1, .55, 1.5); t2.position.y = .92; g2.add(t2);
        for (const [wx, wz] of [[-.55, -.7], [.55, -.7], [-.55, .7], [.55, .7]]) { const w2 = new THREE.Mesh(new THREE.CylinderGeometry(.24, .24, .2, 12), mat({ color: 0x1a1a1a })); w2.rotation.z = Math.PI / 2; w2.position.set(wx, .24, wz); g2.add(w2); } OB.push([qx, zfAt(qx) + qz, 1.1]); } }
    // le drapeau rouge, devant la galerie de Skiset ; les poubelles orange sur leur poteau
    { const gB = LG("galB"), fx = gB.x0 + .35, fz = zfAt(fx), p2 = cyl(.025, .025, 1.6, fer, fx, 2.3, fz + .55, 5); p2.rotation.x = .9; add(new THREE.PlaneGeometry(.45, .75), mat({ color: 0xd8202a, roughness: .7, side: THREE.DoubleSide }), fx, 2.4, fz + .95, Math.PI / 2); }
    for (const x of [LG("galA").x1 + .3, LG("interFN").x1 - .4, LG("galE").x0 + .3]) { const z = zfAt(x) + .35; cyl(.04, .04, .9, fer, x, .45, z, 5); cyl(.2, .18, .5, mat({ color: 0xd8602a, roughness: .5 }), x, .75, z + .12, 10); OB.push([x, z, .35]); }
    /* (10.146, d'après les photos de l'été) la terrasse des Roches Blanches : le platelage de bois, fermé de grandes vitres sur poteaux noirs, les bâches rouges
       « LES ROCHES BLANCHES » en bas des vitres, les grands parasols carrés rouges Kronenbourg, la guirlande de guinguette, les canapés gris et leurs tables basses,
       les tables rouges et leurs chaises ; l'ardoise devant l'entrée */
    { const HT0 = .45, nT0 = scene.children.length, oT0 = OB.length; const x0 = -42.4, x1 = -29.6, z0 = -2.5, z1 = 3.6, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, porte = [-35.2, -33.4], XS = -36.2;   /* (10.147 : plus petite, scindée en deux par une paroi de verre : le côté restaurant, le côté salon) */
      const noir = mat({ color: 0x1c1e20, roughness: .5, metalness: .4 }), verre = mat({ color: 0xdcecf2, roughness: .04, metalness: .3, transparent: true, opacity: .16, depthWrite: false, side: THREE.DoubleSide }), rouge = mat({ color: 0xd8202a, roughness: .6, side: THREE.DoubleSide });
      L.solsPlus.push(sol(x0, x1, z0, z1, mat({ map: deckT, roughness: .8 }), .06));
      const banT = tT(1024, 96, (c, w, h) => { c.fillStyle = "#d8202a"; c.fillRect(0, 0, w, h); c.fillStyle = "#fff"; c.font = `bold 40px ${sans}`; c.textAlign = "center"; c.textBaseline = "middle"; for (let k = 0; k < 3; k++) { c.fillText("LES ROCHES BLANCHES", w * (k + .5) / 3, h / 2 + 2); } });
      const paroi = (xa, za, xb, zb, bache) => { const L2 = Math.hypot(xb - xa, zb - za), a2 = Math.atan2(zb - za, xb - xa), n = Math.max(1, Math.round(L2 / 2)), mx = (xa + xb) / 2, mz = (za + zb) / 2;
        for (let k = 0; k <= n; k++) { const x = xa + (xb - xa) * k / n, z = za + (zb - za) * k / n; box(.08, 1.6, .08, noir, x, .8, z); }
        box(L2, .06, .08, noir, mx, 1.6, mz, -a2); box(L2, .06, .08, noir, mx, .9, mz, -a2); add(new THREE.PlaneGeometry(L2, 1.5), verre, mx, .8, mz, -a2);
        if (bache) { const t = repT(banT, Math.max(1, Math.round(L2 / 5))); const bm = mat({ map: t, roughness: .7 }); for (const r of [0, Math.PI]) add(new THREE.PlaneGeometry(L2, .55), bm, mx, .45, mz, -a2 + r); }
        for (let k = 0; k <= Math.ceil(L2 / .5); k++) OB.push([xa + (xb - xa) * Math.min(1, k * .5 / L2), za + (zb - za) * Math.min(1, k * .5 / L2), .3]); };
      paroi(x0, z1, porte[0], z1, true); paroi(x0, z0 + .3, x0, z1, true);
      /* (10.149, d'après la photo) côté salon, vers le Sherpa : pas de vitres, mais les paravents de toile rouge sur leurs piquets, et la grande bâche au logo des Roches Blanches */
      const logoT = tT(512, 160, (c, w, h) => { c.fillStyle = "#e0482a"; c.fillRect(0, 0, w, h); c.strokeStyle = "#fff"; c.lineWidth = 6; c.strokeRect(8, 8, w - 16, h - 16); c.fillStyle = "#fff"; c.font = `bold 26px ${sans}`; c.fillText("BLRB", 30, 66);
        c.lineWidth = 5; c.beginPath(); c.moveTo(30, 120); c.lineTo(70, 82); c.lineTo(90, 100); c.lineTo(120, 70); c.lineTo(150, 120); c.stroke(); c.font = `bold 50px ${sans}`; c.fillText("ROCHES", 190, 76); c.fillText("BLANCHES", 190, 132); });
      const toile = mat({ color: 0xd8503a, roughness: .9, side: THREE.DoubleSide }), alu = mat({ color: 0xc8ccd0, metalness: .6, roughness: .4 });
      const paravent = (xa, za, xb, zb, logo) => { const L2 = Math.hypot(xb - xa, zb - za), a2 = Math.atan2(zb - za, xb - xa), n = Math.max(1, Math.round(L2 / 1.4));
        for (let k = 0; k <= n; k++) cyl(.025, .025, 1.05, alu, xa + (xb - xa) * k / n, .52, za + (zb - za) * k / n, 5);
        if (logo) { const lm = mat({ map: logoT, roughness: .8 }); for (const r of [0, Math.PI]) add(new THREE.PlaneGeometry(L2, .85), lm, (xa + xb) / 2, .55, (za + zb) / 2, -a2 + r); } else add(new THREE.PlaneGeometry(L2, .85), toile, (xa + xb) / 2, .55, (za + zb) / 2, -a2);   // (10.162 : la bâche lisible des deux côtés, jamais à l'envers)
        for (let k = 0; k <= Math.ceil(L2 / .5); k++) OB.push([xa + (xb - xa) * Math.min(1, k * .5 / L2), za + (zb - za) * Math.min(1, k * .5 / L2), .3]); };
      paravent(porte[1], z1, porte[1] + 2.6, z1, false); paravent(porte[1] + 2.6, z1, x1 - .6, z1, true); paravent(x1 - .6, z1, x1, z1 - .6, false); paravent(x1, z1 - .6, x1, z0 + .3, false); paroi(XS, z0 + .3, XS, -.2, false); paroi(XS, 1.4, XS, z1, false);   // (la paroi de verre du milieu, son passage)
      // les parasols carrés rouges, sur leur mât, leurs baleines ; « Kronenbourg » sur le lambrequin
      const kroT = tT(512, 64, (c, w, h) => { c.fillStyle = "#c81a22"; c.fillRect(0, 0, w, h); c.fillStyle = "#fff"; c.font = `italic bold 34px ${serif}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("Kronenbourg", w / 2, h / 2 + 2); });
      for (const [px, pz] of [[XS + 1.0, z0 + 1.2], [XS + 2.6, z1 - .9], [x1 - 2.2, z0 + 1.2], [x1 - .9, cz + .6]]) { cyl(.035, .035, 3.1, noir, px, 1.55, pz, 6); add(new THREE.ConeGeometry(.3, 2.2, 8), rouge, px, 1.95, pz); OB.push([px, pz, .25]); }   // (côté salon : les grands parasols rouges, fermés)
      for (const [px, pz] of [[x0 + 1.7, z0 + 1.6], [XS - 1.6, z0 + 1.6], [x0 + 1.7, z1 - 1.6], [XS - 1.6, z1 - 1.6]]) {
        cyl(.06, .06, 3.1, noir, px, 1.55, pz, 8); const toit = add(new THREE.ConeGeometry(2.05, .45, 4, 1, true), rouge, px, 3.25, pz); toit.rotation.y = Math.PI / 4;
        for (const [w2, d2, ox, oz] of [[3.4, .02, 0, 1.7], [3.4, .02, 0, -1.7], [.02, 3.4, 1.7, 0], [.02, 3.4, -1.7, 0]]) { const lb = deux(add(new THREE.PlaneGeometry(2.9, .22), mat({ map: kroT, side: THREE.DoubleSide }), px + ox * .85, 2.95, pz + oz * .85, w2 > 1 ? 0 : Math.PI / 2)); void d2; void lb; }
        OB.push([px, pz, .25]); }
      // la guirlande de guinguette, d'un poteau à l'autre
      const ampM = lum(mat({ color: 0xfff2c0, emissive: 0xffe090, emissiveIntensity: .5 }), .5, 2.2), douille = mat({ color: 0x2a6a5a });
      for (const zl of [z0 + .9, cz, z1 - .3]) { box(XS - x0, .015, .015, noir, (x0 + XS) / 2, 2.55, zl); for (let x = x0 + .3; x < XS; x += .55) { add(new THREE.SphereGeometry(.06, 8, 6), ampM, x, 2.45, zl); cyl(.025, .03, .07, douille, x, 2.52, zl, 6); } }
      // les canapés gris et leurs tables basses, contre la vitre de devant et le long du côté
      const tissu = mat({ color: 0xb8b2aa, roughness: .95 }), pied = mat({ color: 0x2a2a2c, metalness: .4 });
      const canape = (x, z, ry, n2) => { const g = new THREE.Group(); g.position.set(x, .06, z); g.rotation.y = ry; scene.add(g);
        for (let k = 0; k < n2; k++) { const u = (k - (n2 - 1) / 2) * .78; for (const [w2, h2, d2, y2, z2] of [[.74, .2, .7, .32, 0], [.74, .44, .18, .62, -.3]]) { const m2 = new THREE.Mesh(new THREE.BoxGeometry(w2, h2, d2), tissu); m2.position.set(u, y2, z2); g.add(m2); } }
        const b2 = new THREE.Mesh(new THREE.BoxGeometry(n2 * .78, .2, .72), pied); b2.position.y = .12; g.add(b2); for (let k = 0; k < n2; k++) OB.push([x + Math.cos(ry) * (k - (n2 - 1) / 2) * .78, z - Math.sin(ry) * (k - (n2 - 1) / 2) * .78, .45]); };
      const basse = (x, z) => { box(.7, .05, .7, mat({ color: 0x2c2e30, roughness: .6 }), x, .44, z); for (const [dx, dz] of [[-.3, -.3], [.3, -.3], [-.3, .3], [.3, .3]]) box(.04, .4, .04, pied, x + dx, .24, z + dz); OB.push([x, z, .45]); };
      // le côté salon : les canapés en L le long des vitres, les tables basses
      canape(porte[1] + 1.9, z1 - .55, Math.PI, 4); canape(x1 - .55, cz - .3, -Math.PI / 2, 6); /* (10.127 : plus de canapé devant la sortie de la galerie) */
      for (const [x, z] of [[porte[1] + 1.4, z1 - 1.5], [porte[1] + 2.5, z1 - 1.5], [x1 - 1.5, cz - 1.4], [x1 - 1.5, cz + .4]]) basse(x, z);
      // les tables rouges et leurs chaises noires tressées, au fond
      const tR = mat({ color: 0xd8304a, roughness: .5 }), ch = mat({ color: 0x2a2a2c, roughness: .8 });
      for (let x = x0 + .9; x < XS - .5; x += 1.6) for (const z of [z0 + .9, z0 + 2.7, z0 + 4.5]) {   // (le côté restaurant)
        if (z > z1 - .6) continue; box(.8, .05, .8, tR, x, .76, z); box(.06, .72, .06, pied, x, .4, z); for (const sg of [-1, 1]) { box(.45, .05, .45, ch, x, .48, z + sg * .62); box(.45, .45, .05, ch, x, .72, z + sg * .84); SIEGE(x, z + sg * .62, sg > 0 ? Math.PI : 0, .48); } OB.push([x, z, .7]); }
      // l'ardoise « Brasserie · Pizzas » à l'entrée, les jardinières carrées sombres
      { const aT = tT(96, 160, (c, w, h) => { c.fillStyle = "#1a1c1e"; c.fillRect(0, 0, w, h); c.fillStyle = "#f4f2ea"; c.font = `bold 13px ${sans}`; c.textAlign = "center"; c.fillText("BRASSERIE", w / 2, 24); c.fillText("PIZZAS", w / 2, 42); for (let k = 0; k < 7; k++) c.fillRect(14, 58 + k * 13, 50 + (k * 11) % 20, 3); });
        const g = new THREE.Group(); g.position.set(x1 - .4, -HT0, z1 + 1.6); scene.add(g); panA(g, mat({ map: aT }), .6, 1.0, .17, .32); OB.push([x1 - .4, z1 + 1.6, .45]); }
      /* (10.148, d'après la photo au poney) la terrasse est surélevée : tout monte de 45 cm, sur un socle de béton ; deux marches à l'entrée ;
         devant, plus de plancher : le parvis d'enrobé gris ; au bord de la terrasse, les grands parasols rouges fermés ; côté piscine, le poteau
         « École du Ski Français · Les Roches Blanches », les flèches jaunes des sentiers, les grands bacs gris de fleurs */
      const HT = .45; for (const o of scene.children.slice(nT0)) o.position.y += HT;
      for (const x of [x0 - .8, x1 + .8]) { box(.8, .6, .8, mat({ color: 0x2a2e34, roughness: .7 }), x, .3, z1 - .4); for (let k = 0; k < 8; k++) add(new THREE.IcosahedronGeometry(.14, 0), [mat({ color: 0x3a6a2a }), mat({ color: 0xe86a9a })][k % 2], x + (al() - .5) * .5, .7, z1 - .4 + (al() - .5) * .5); OB.push([x, z1 - .4, .6]); }
      void oT0; const beton = mat({ color: 0x9a968e, roughness: .95 });
      box(x1 - x0 + .2, HT, z1 - z0 + .1, beton, cx, HT / 2, cz); for (let k = 0; k < 2; k++) box(porte[1] - porte[0], HT * (2 - k) / 2, .35, beton, (porte[0] + porte[1]) / 2, HT * (2 - k) / 4, z1 + .2 + k * .35);
      const enrobe = tT(256, 256, (c, w, h) => { c.fillStyle = "#6e6e6c"; c.fillRect(0, 0, w, h); for (let k = 0; k < 4000; k++) { c.fillStyle = ["#5a5a58", "#82827e", "#6a6866", "#94928c"][k % 4]; c.fillRect(Math.random() * w, Math.random() * h, 2, 2); } }, 10, 4);
      L.solsPlus.push(sol(-48, -10, 1.8, 10.4, mat({ map: terreT, roughness: 1 }), .045)); box(38, .12, .2, mat({ color: 0x7a3a22, roughness: .8 }), -29, .06, 1.8);   /* (10.150 : le long de la façade, le plancher reste ; l'enrobé commence après sa bordure) */
      const rgP = mat({ color: 0xd8202a, roughness: .7 }); for (const [px, pz] of [[x0 + .5, z1 + .7], [x0 + 3.2, z1 + .7], [porte[1] + 1.4, z1 + .7], [x1 - .5, z1 + .7], [x1 + .7, cz]]) { cyl(.035, .035, 3.0, noir, px, 1.5, pz, 6); const f = add(new THREE.ConeGeometry(.28, 2.1, 8), rgP, px, 1.9, pz); void f; OB.push([px, pz, .3]); }
      { const px = x0 - 2.2, pz = z1 + 1.6; cyl(.06, .06, 3.4, mat({ color: 0x9a9ea2, metalness: .5 }), px, 1.7, pz, 6);
        deux(add(new THREE.PlaneGeometry(1.3, .3), mat({ map: esfT, side: THREE.DoubleSide }), px, 3.0, pz + .05));
        deux(add(new THREE.PlaneGeometry(1.3, .26), mat({ map: txT(256, 48, "#2a2a2a", "#f4f2ea", "Les Roches Blanches", 26, `italic bold @ ${serif}`), side: THREE.DoubleSide }), px, 2.68, pz + .05)); OB.push([px, pz, .2]); }
      { const px = x0 - 3.6, pz = z1 + 3.2, jaune = mat({ color: 0xe8c020, roughness: .6 }); cyl(.06, .06, 2.6, mat({ color: 0x8a6a4a }), px, 1.3, pz, 6); for (const [y, d] of [[2.3, 1], [2.05, -1], [1.8, 1]]) box(.7, .16, .04, jaune, px + d * .32, y, pz); OB.push([px, pz, .2]); }
      for (const [bx, bz] of [[x0 - 4.5, z1 + 5.2], [x1 + 2.6, z1 + 5.6]]) { box(2.0, .7, .9, mat({ color: 0x2a2e36, roughness: .7 }), bx, .35, bz); for (let k = 0; k < 12; k++) add(new THREE.IcosahedronGeometry(.14, 0), [mat({ color: 0x4a7a32 }), mat({ color: 0xf2f0e8 }), mat({ color: 0xe86a9a })][k % 3], bx - .8 + Math.random() * 1.6, .78, bz + (Math.random() - .5) * .6); OB.push([bx - .6, bz, .55], [bx + .6, bz, .55]); } } }

  /* ---------- l'arrêt du car (pour revenir à Paris) ---------- */
  L.arretCar = { x: 26, z: 13.8 };
  if (false) L.portails.push({ dans: (x, z) => estAdmin() && Math.hypot(x - 57.5, z - 15) < .6, seuil: [57.5, 15], vers: "grande", arrivee: [-4.6, 9], yaw: Math.PI / 2, violet: true, pasApo: true });   // (le cercle violet, à côté de la piscine : retour à la cour d'honneur)   // (l'arrêt du car : sans abri pour le moment — on y prend le car pour rentrer)

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

  /* (10.167) sur le gravier, devant la tour : une partie de pétanque — quatre joueurs, les boules, le cochonnet ; l'un lance, les autres regardent */
  const PET = []; { const bx = 116, bz = 11.5, acier = mat({ color: 0xb8bcc2, metalness: .85, roughness: .25 });
    for (const [dx, dz] of [[2.2, .3], [2.6, -.4], [2.0, .8], [2.4, .1], [1.8, -.6]]) add(new THREE.SphereGeometry(.04, 10, 8), acier, bx + dx, .045, bz + dz);
    add(new THREE.SphereGeometry(.018, 8, 6), mat({ color: 0xe8c020 }), bx + 2.3, .02, bz);
    for (let k = 0; k < 4; k++) { const m = gens(k * 11 + 3), a = [Math.PI / 2, Math.PI / 2 + .5, Math.PI / 2 - .6, Math.PI / 2 + .9][k]; m.position.set(bx - [0, .9, .6, 1.4][k], 0, bz + [0, 1.1, -1.0, .2][k]); m.rotation.y = a; m.userData.poser("marche", 0); scene.add(m); PET.push({ m, k }); OB.push([m.position.x, m.position.z, .4]); }
    const a5 = L.anim; L.anim = (tm) => { try { a5 && a5(tm); } catch (e) {} for (const { m, k } of PET) try { const P = m.userData.parts; if (!P) continue; m.userData.poser("marche", 0); if (k === 0) { const t = (tm / 1000) % 5, sw = t < 1.4 ? Math.sin(t / 1.4 * Math.PI) : 0; P.bras[1].e.rotation.x = -.3 - sw * 1.6; m.rotation.x = 0; }
        else { const b = (tm / 1000 + k * 1.3) % 6; P.bras[0].e.rotation.x = b < 1.5 ? -.5 : 0; } } catch (e) {} }; }

  /* ---------- les limites : la promenade, le parking, le tour de la piscine, la terrasse du Yéti ---------- */
  const CASES = new Map(); for (const o of OB) { const [a, b, r] = o; for (let i = Math.floor((a - r) / 2); i <= Math.floor((a + r) / 2); i++) for (let j = Math.floor((b - r) / 2); j <= Math.floor((b + r) / 2); j++) { const k = i * 4096 + j; (CASES.get(k) || CASES.set(k, []).get(k)).push(o); } }
  const libre = (x, z) => { const l = CASES.get(Math.floor(x / 2) * 4096 + Math.floor(z / 2)); if (l) for (const [a, b, r] of l) if ((x - a) ** 2 + (z - b) ** 2 < r * r) return false; return true; };
  /* (10.121, d'après les photos) au bout, après le Yéti : le mélèze ; la grande tour blanche aux balcons crème et aux cadres bruns (en bas, Interhome, La Fine Bouche,
     les stores bleus de La Godille, Chauvin Immobilier) ; puis la tour sombre en bois, en retrait ; devant elle, les bâtiments bas à deux étages, tous collés
     (la location de skis, Ski rental, Sport 2000), jusqu'au pub Le Sinoze et sa terrasse à balustrade de bois ; au bout, les barrières de bois qui ferment l'herbe */
  { const orange = mat({ map: planches("#a8582c", "255,200,150") }), blancP = mat({ color: 0xf2f0ea, roughness: .7 }), brunC = mat({ color: 0x4a2418, roughness: .7 }), creme = mat({ map: vraie(tT(8, 8, (c, w, h) => { c.fillStyle = "#e8e0d0"; c.fillRect(0, 0, w, h); }), "images/corbier-sol/beton.jpg", 2), roughness: .8 });
    const vitreN = mat({ color: 0x2a3036, roughness: .1, metalness: .3, transparent: true, opacity: .6 }), verreR = mat({ color: 0xdcecf0, roughness: .05, transparent: true, opacity: .3, depthWrite: false });
    const XF = 158;   // (le bout)
    sapin(83.9, 4.6, 15, melezeM);
    const n0B = scene.children.length, o0B = OB.length;   // (10.124 : tout ce qui suit est décalé de 12 m, pour l'escalier et la passerelle)
    // la grande tour blanche
    { const x0 = 86, x1 = 110, cx = (x0 + x1) / 2, W = x1 - x0, N = 11, H0 = 3.4, HE = 3, HT = H0 + N * HE;
      const coteT = tT(128, 256, (c, w, h) => { c.fillStyle = "#7a4a34"; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 4) { c.fillStyle = `rgba(${x % 8 ? "255,220,190" : "40,20,10"},.08)`; c.fillRect(x, 0, 2, h); } for (let y = 20; y < h; y += 23) { c.fillStyle = "#ece6da"; c.fillRect(w * .35, y, w * .65, 3); } }, 1, 1);
      box(W, HT - H0, 11, mat({ map: coteT }), cx, H0 + (HT - H0) / 2, -6.6); box(W, H0, 7.6, mat({ map: coteT }), cx, H0 / 2, -8.3);   // (10.154 : le rez-de-chaussée creux, pour les boutiques) box(W + .6, 1.4, 12, mat({ color: 0x8a4a2a, roughness: .7 }), cx, HT + .5, -6.4);
      const etT = vraie(tT(1024, 128, (c, w, h) => { c.fillStyle = "#ece6da"; c.fillRect(0, 0, w, h); c.fillStyle = "#d8d0c2"; c.fillRect(0, 0, w, 30); for (let x = 0; x < w; x += 146) { const k = (x / 146) % 3; c.fillStyle = ["#3a4048", "#4a4c52", "#6a4a36"][k]; c.fillRect(x + 18, 40, 110, h - 40); c.fillStyle = "rgba(240,236,228,.85)"; if (k !== 2) for (let m = 0; m < 3; m++) c.fillRect(x + 22 + m * 36, 46, 28, h - 52); c.fillStyle = "#5a2a1a"; for (let m = 0; m < 4; m++) c.fillRect(x + 18 + m * 36, 40, 3, h - 40); } }, 1, N), "images/corbier-sol/facade-blanche.jpg", [6, 3]);
      add(new THREE.PlaneGeometry(W, N * HE), mat({ map: etT, roughness: .7 }), cx, H0 + N * HE / 2, -.98);
      for (let k = 0; k <= N; k++) { const y = H0 + k * HE, zb = k ? .4 : 2.4; if (k) box(W, .32, 1.7, creme, cx, y, -.2); else box(W, .4, 3.5, creme, cx, y, .7); if (k < N) { box(W, .95, .03, verreR, cx, y + .6, zb); box(W, .05, .06, brunC, cx, y + 1.08, zb); } }   // (10.122 : le premier balcon fait porche, en porte-à-faux, sans poteaux)
      for (let i = 0; i <= 8; i++) { const x = x0 + .15 + i * (W - .3) / 8; box(.22, N * HE, 1.6, brunC, x, H0 + N * HE / 2, -.25); }
      // en bas, de la droite vers la gauche : Interhome, La Fine Bouche (deux vitrines), Location, La Godille, Vente, Chauvin Immobilier
      /* (10.154) au pied de la tour, des boutiques soignées : produits du terroir, vêtements de randonnée, chaussures de marche, comptoir savoyard (la scène est retournée : listées de l'ouest à l'est d'origine) */
      { const Z = -.97, BT = [[86.2, 90.6, "Les Alpages · Produits du terroir", "#3a5a2a", "#f2e8c8", "terroir", 0x3a5a2a], [90.6, 95.6, "MONTAGNE & RANDO · Vêtements outdoor", "#1a3a5a", "#ffffff", "rando", 0x2a5a8a],
          [95.6, 100.2, "La Ferme du Corbier · Fromages · Charcuterie", "#6a3a1e", "#f4e8d0", "terroir", 0x8a4a22], [100.2, 105.2, "ALTITUDE TREK · Chaussures de marche", "#2a2a2e", "#f0a020", "rando", 0x3a3a3e], [105.2, 109.8, "Le Comptoir Savoyard · Miel · Génépi", "#8a2a1e", "#f4e8d0", "terroir", 0x8a2a1e]];
        for (const [a, b, nom, fond, coul, k, sc] of BT) { poteau(a, Z); poteau(b, Z); vitrine(a, b, Z, { soub: "bois", portes: [[b - .75, .9]], pas: 1.25 }); interieur(a, b, Z, k);
          enseigne(a + .15, b - .15, Z, txT(1024, 96, fond, coul, nom, 46, `bold @ ${nom === nom.toUpperCase() ? sans : serif}`), .52, 2.92, .1, .2);
          store(a + .1, b - .1, Z, txT(256, 32, "#f4f4f2", "#000", "", 10, `@ ${sans}`, { raye: 16 }), sc, .9, 2.6, .12); } }
      void store;
      for (let x = 86.3; x < 89.6; x += .5) box(.05, .9, .05, mat({ color: 0x8a4a2a }), x, H0 + .6, .3);   // (le balcon de bois au-dessus d'Interhome)
      for (const x of [90.6, 100.2]) jardiniere(x, 1.4); }
    // la tour sombre en bois, en retrait, derrière les bâtiments bas : le bois brun, les loggias aux plafonds crème
    const tourS = vraie(tT(256, 512, (c, w, h) => { c.fillStyle = "#6a4a30"; c.fillRect(0, 0, w, h); for (let y = 6; y < h; y += 24) for (let x = 6; x < w; x += 42) { c.fillStyle = "#e0c890"; c.fillRect(x, y, 36, 8); c.fillStyle = "#2a2a2e"; c.fillRect(x, y + 8, 36, 10); c.fillStyle = "rgba(220,230,235,.5)"; c.fillRect(x, y + 14, 36, 4); } }, 2, 3), "images/corbier-sol/tour-bois.jpg", [11.6, 11.2]);
    { const x0 = 134, x1 = 157.8, H = 44; box(x1 - x0, H, 15, mat({ map: tourS, fog: false }), (x0 + x1) / 2, H / 2, -17); box(x1 - x0 + 1.2, 1.4, 16, mat({ color: 0x6a3a1e }), (x0 + x1) / 2, H + .7, -17);   /* (10.158, d'après la photo : la grande tour juste derrière La Bouille ; son flanc de bois descend jusqu'au sol, au bout) */
      const flT = tT(128, 512, (c, w, h) => { c.fillStyle = "#7a5236"; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 6) { c.fillStyle = `rgba(${x % 12 ? "255,220,190" : "40,20,10"},.1)`; c.fillRect(x, 0, 3, h); } }, 2, 4); box(.5, H, 15, mat({ map: flT, fog: false }), x1 + .25, H / 2, -17); }
    // les bâtiments bas à deux étages, tous collés : le rez-de-chaussée sous la galerie blanche, le premier aux volets roulants, le second à la galerie de bois orange
    const deuxEt = (x0, x1, enseignes) => { const cx = (x0 + x1) / 2, W = x1 - x0;
      box(W, 8.2 - 3.3, 10, orange, cx, 3.3 + (8.2 - 3.3) / 2, -6.6); box(W, 3.3, 7, orange, cx, 1.65, -8.1);   // (10.154 : le rez-de-chaussée creux)
      const rdcT0 = tT(Math.round(W * 60), 128, (c, w, h) => { c.fillStyle = "#e8e2d4"; c.fillRect(0, 0, w, h); c.fillStyle = "#f4f2ec"; c.fillRect(0, 0, w, 28);
        for (let x = 10; x < w; x += 120) { c.fillStyle = "#5a3420"; c.fillRect(x, 34, 108, h - 34); c.fillStyle = "#7a8a94"; c.fillRect(x + 6, 40, 44, h - 46); c.fillRect(x + 58, 40, 44, h - 46); c.fillStyle = "rgba(255,255,255,.25)"; c.fillRect(x + 8, 42, 10, h - 50); }
        for (const [u, t, f, co] of enseignes) { c.fillStyle = f; c.font = `bold 20px ${sans}`; const tw = c.measureText(t).width + 20; c.fillRect(u * w, 3, tw, 24); c.fillStyle = co; c.fillText(t, u * w + 10, 21); } });
      void rdcT0; { const Z = -1.58, n2 = enseignes.length; for (let k = 0; k < n2; k++) { const a = x0 + k * W / n2, b = x0 + (k + 1) * W / n2, [, t, f, co] = enseignes[k];
          poteau(a, Z); poteau(b, Z); vitrine(a, b, Z, { soub: "blanc", portes: [[a + .8, .9, mat({ color: 0xf2f2ee, roughness: .6 })]], pas: 1.3 }); interieur(a, b, Z, /LOC|rental|SKI/i.test(t) ? "skis" : "habits");
          enseigne(a + .2, b - .2, Z, txT(1024, 80, f, co, t, 44, `bold @ ${sans}`), .42, 2.85, .06, .18); }
        if (enseignes[0][1] === "SPORT 2000") { const r = tT(128, 128, (c, w, h) => { c.fillStyle = "#c8202a"; c.beginPath(); c.arc(64, 64, 60, 0, 7); c.fill(); c.fillStyle = "#fff"; c.font = "bold 24px Arial"; c.textAlign = "center"; c.fillText("SPORT", 64, 58); c.fillText("2000", 64, 88); });
          add(new THREE.CircleGeometry(.45, 24), mat({ map: r }), x0 + .5, 2.3, Z + .35); store(x0 + 1.4, x0 + 4.4, Z, txT(256, 32, "#a81a1e", "#fff", "", 10, `@ ${sans}`, { raye: 16 }), 0xa81a1e, 1.1, 2.6, .14); } }
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
      box(W, 8.2 - 3.3, 10, orange, cx, 3.3 + (8.2 - 3.3) / 2, -6.6); box(W, 3.3, 7, orange, cx, 1.65, -8.1);
      const sT = tT(1024, 160, (c, w, h) => { c.fillStyle = "#7a4426"; c.fillRect(0, 0, w, h); c.fillStyle = "#b8784a"; c.fillRect(0, 0, w, 40); c.fillStyle = "#f2e8d8"; c.font = `italic bold 30px ${serif}`; c.fillText("Bar - Restaurant   LA BOUILLE   Spécialités savoyardes", 20, 30);
        for (let x = 30; x < w; x += 150) { c.fillStyle = "#5a3018"; c.fillRect(x, 50, 120, h - 50); c.fillStyle = "#3a3a3e"; c.fillRect(x + 10, 60, 100, h - 70); } });
      void sT; { const Z = -1.58;   /* (10.158) à gauche du bar, l'entrée du cinéma : sa porte, son enseigne en drapeau */
        { const cT = txT(256, 80, "#b81a1e", "#ffffff", "CINÉMA", 56, `bold @ ${sans}`); for (const r of [0, Math.PI]) add(new THREE.PlaneGeometry(1.4, .44), lum(mat({ map: cT, emissive: 0xffffff, emissiveMap: cT, emissiveIntensity: .3 }), .3, 1.4), x0 + .5, 2.5, Z + .8, r + Math.PI / 2); box(.06, .06, .8, boisF, x0 + .5, 2.75, Z + .4); }
        poteau(x0, Z); poteau(x1, Z); bandeau(x0, x1, Z); vitrine(x0, x1, Z, { soub: "bois", portes: [[x0 + 2.0, .95], [x1 - 1.4, .95]], pas: 1.2 }); interieur(x0, x1, Z, "tables");
        enseigne(x0 + .3, x1 - .3, Z, txT(1024, 80, "#8a4a26", "#f4e8d0", "Bar - Restaurant   LA BOUILLE   Spécialités savoyardes", 40, `italic bold @ ${serif}`), .5, 3.05, .08, .16);
        for (const [u, t] of [[x0 + 4.2, "RACLETTE · FONDUE"], [x0 + 6.4, "TARTIFLETTE"]]) add(new THREE.PlaneGeometry(1.0, .35), mat({ map: txT(256, 64, "#1a1c1e", "#f4f2ea", t, 26, `bold @ ${sans}`) }), u, 2.25, Z + .1); }
      box(W, .9, 1.4, orange, cx, 4.2, -.9);
      for (let x = x0 + .4; x < x1; x += .45) box(.3, .9, .04, mat({ color: 0x8a5a38 }), x, 4.95, -.25);   // (la balustrade découpée du balcon)
      add(new THREE.PlaneGeometry(W, 3), vitreN, cx, 6.6, -1.58); box(W + .3, .9, 2.2, orange, cx, 8.65, -1.3);
      // la terrasse de planches, sa balustrade, l'enseigne « Le Sinoze, pub restaurant »
      const d = add(new THREE.PlaneGeometry(W, 6), mat({ map: deckT, roughness: .8 }), cx, .12, 1.4); d.rotation.x = -Math.PI / 2;
      for (let x = x0; x < x1; x += .3) box(.22, .9, .04, mat({ color: 0x6a4a32 }), x, .55, 4.4);
      /* (10.156, d'après la photo) le coin fermé : le mur de bout du rez-de-chaussée, la balustrade découpée qui tourne sur le côté, l'escalier de bois qui monte à la terrasse le long du côté, sa rampe */
      /* (10.159, d'après la photo) le flanc du bâtiment, au bout : un mur plein, et sur ce mur un restaurant — sa vitrine, sa porte, son enseigne, ses tables dehors */
      { const Zm = -6.5, W2 = 9, cz = Zm + W2 / 2 + 2, mur = mat({ map: planches("#8a4a2c", "255,190,150"), roughness: .8 });
        box(.4, 8.2, 10.1, mur, x1 + .2, 4.1, -.45);
        /* (10.167) sur ce mur, face à la promenade : le petit cinéma — son fronton lumineux « CINÉMA », ses portes, les affiches des films du vidéo-club */
        { const zc3 = 1.5, W3 = 5.6, ci = tT(1024, 128, (c, w, h) => { c.fillStyle = "#1a1416"; c.fillRect(0, 0, w, h); c.strokeStyle = "#f0c040"; c.lineWidth = 6; c.strokeRect(6, 6, w - 12, h - 12); for (let x = 20; x < w; x += 28) { c.fillStyle = "#ffe8a0"; c.beginPath(); c.arc(x, 16, 5, 0, 7); c.fill(); c.beginPath(); c.arc(x, h - 16, 5, 0, 7); c.fill(); } c.fillStyle = "#e82a2a"; c.font = `bold 66px ${sans}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("★ CINÉMA ★", w / 2, h / 2 + 4); });
          add(new THREE.PlaneGeometry(W3, .8), lum(mat({ map: ci, emissive: 0xffffff, emissiveMap: ci, emissiveIntensity: .45 }), .45, 1.6), x1 - .04, 3.55, zc3, -Math.PI / 2);
          box(.12, 3.0, W3 + .2, mat({ color: 0x2a1418, roughness: .6 }), x1 - .02, 1.5, zc3);
          const pt2 = mat({ map: tT(64, 128, (c, w, h) => { c.fillStyle = "#6a1a1e"; c.fillRect(0, 0, w, h); c.fillStyle = "#c8a040"; c.fillRect(6, 6, w - 12, 4); c.fillRect(w - 12, 60, 4, 16); c.fillStyle = "#3a0a0e"; c.fillRect(8, 16, w - 16, h - 24); }), roughness: .5 });
          for (const dz of [-.5, .5]) add(new THREE.PlaneGeometry(.95, 2.1), pt2, x1 - .1, 1.05, zc3 + dz, -Math.PI / 2);
          const TL = new THREE.TextureLoader(); ["bttf", "gb", "grem", "lb", "hw", "re"].forEach((k, i) => { const t = TL.load(`images/videofutur/jaquette-${k}.webp`); t.colorSpace = THREE.SRGBColorSpace; const dz = (i < 3 ? -1.15 - i * .78 : 1.15 + (i - 3) * .78);
            box(.06, 1.14, .74, mat({ color: 0xc8a040, metalness: .5, roughness: .3 }), x1 - .09, 1.6, zc3 + dz); add(new THREE.PlaneGeometry(.64, 1.0), lum(mat({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: .25 }), .25, .6), x1 - .13, 1.6, zc3 + dz, -Math.PI / 2); }); } box(6, 3.8, 8.2, mur, x1 + 3, 1.9, 8.7); box(6.4, .3, 8.6, mat({ color: 0x4a2a18 }), x1 + 3, 3.95, 8.7);   /* (10.160 : l'aile basse du restaurant, devant le flanc ; sa façade regarde la promenade) */
        const fT = tT(1024, 256, (c, w, h) => { c.fillStyle = "#4a2a18"; c.fillRect(0, 0, w, h); c.fillStyle = "#2a3a2e"; c.fillRect(0, 0, w, 56); c.fillStyle = "#f4e8c8"; c.font = `italic bold 40px ${serif}`; c.textAlign = "center"; c.fillText("Le Refuge · Restaurant · Grillades au feu de bois", w / 2, 40);
          for (let x = 20; x < w - 20; x += 165) { const porte = x > 400 && x < 600; const g = c.createLinearGradient(0, 70, 0, h); g.addColorStop(0, "#f0d8a8"); g.addColorStop(1, "#7a5a3a"); c.fillStyle = porte ? "#6a3a20" : g; c.fillRect(x, 72, 150, h - 80);
            if (porte) { c.fillStyle = "#c8dce4"; c.fillRect(x + 14, 86, 122, 90); } else { c.fillStyle = "rgba(60,30,15,.6)"; for (let k = 0; k < 3; k++) { c.fillRect(x + 12 + k * 46, 200, 30, 5); c.fillRect(x + 25 + k * 46, 205, 4, 40); } c.fillStyle = "rgba(255,230,180,.7)"; c.beginPath(); c.arc(x + 75, 100, 10, 0, 7); c.fill(); }
            c.fillStyle = "rgba(255,255,255,.15)"; c.fillRect(x + 6, 76, 20, h - 90); } });
        add(new THREE.PlaneGeometry(7.8, 3.3), lum(mat({ map: fT, emissive: 0xffffff, emissiveMap: fT, emissiveIntensity: .2 }), .2, .7), x1 - .02, 1.65, 8.7, -Math.PI / 2); void cz; void W2;
        box(.9, .1, 7.8, mat({ color: 0x2a3a2e, roughness: .7 }), x1 - .45, 3.35, 8.7);   // (l'auvent)
        for (const tz of [6.3, 8.7, 11.1]) { const tx = x1 - 2.0; box(.75, .05, .75, mat({ color: 0x6a4a2e }), tx, .74, tz); box(.05, .72, .05, mat({ color: 0x2a2a2a }), tx, .37, tz); for (const sz of [-.55, .55]) box(.42, .45, .42, mat({ color: 0x3a2a1e }), tx, .23, tz + sz); OB.push([tx, tz, .9]); }
        for (let z = -5.5; z <= 12.8; z += .5) OB.push([x1 + .3, z, .4]);
      /* (10.161) devant le restaurant : un carré de plancher, fermé d'une barrière de bois (l'entrée au milieu) */
      { const xa = x1 - 5.2, xb = x1, za = 4.8, zb = 12.6, rd = mat({ color: 0x8a6a48, roughness: .85 });
        const d = add(new THREE.PlaneGeometry(xb - xa, zb - za), mat({ map: deckT, roughness: .8 }), (xa + xb) / 2, .06, (za + zb) / 2); d.rotation.x = -Math.PI / 2; box(xb - xa, .12, .15, mat({ color: 0x6a3a22 }), (xa + xb) / 2, .06, zb);
        const cote = (x0b, z0b, x1b, z1b) => { const L3 = Math.hypot(x1b - x0b, z1b - z0b), n = Math.max(1, Math.round(L3 / 1.6)), a = Math.atan2(z1b - z0b, x1b - x0b);
          for (let k = 0; k <= n; k++) { const x = x0b + (x1b - x0b) * k / n, z = z0b + (z1b - z0b) * k / n; cyl(.07, .08, 1.0, rd, x, .5, z, 6); }
          for (const y of [.45, .85]) box(L3, .08, .08, rd, (x0b + x1b) / 2, y, (z0b + z1b) / 2, -a);
          for (let t = 0; t <= L3; t += .45) OB.push([x0b + (x1b - x0b) * t / L3, z0b + (z1b - z0b) * t / L3, .25]); };
        cote(xa, za, xa, 7.8); cote(xa, 9.6, xa, zb); cote(xa, zb, xb, zb); cote(xa, za, xb - .1, za); } } box(W, .1, .12, mat({ color: 0x5a3a26 }), cx, 1.02, 4.4); box(W, .1, .12, mat({ color: 0x5a3a26 }), cx, .2, 4.4);
      const pT = tT(512, 192, (c, w, h) => { c.fillStyle = "#f2f0ec"; c.fillRect(0, 0, w, h); c.strokeStyle = "#7a5a3a"; c.lineWidth = 10; c.beginPath(); c.arc(80, 96, 60, 0, 7); c.stroke(); c.fillStyle = "#3a2a1e"; c.font = `italic bold 76px ${serif}`; c.fillText("Sino", 160, 110); c.fillStyle = "#3a9ad8"; c.fillText("Ze", 320, 110); c.fillStyle = "#555"; c.font = `24px ${sans}`; c.fillText("PUB   RESTAURANT", 170, 160); });
      add(new THREE.PlaneGeometry(3.4, 1.3), mat({ map: pT }), x0 + 3, 1.4, 4.47);
      { const vC = mat({ color: 0x4a6a5a, roughness: .5 }); for (let k = 0; k < 3; k++) for (let q = 0; q < 6; q++) box(.46, .04, .44, vC, x0 + 6 + k * .6, .5 + q * .12, 2.6); OB.push([x0 + 6.6, 2.6, 1.2]); } }
    // le sol devant : les dalles ; au bout, les barrières de bois (deux lisses sur des poteaux)
    L.solsPlus.push(sol(82.5, XF + 8, 2.5, 16.5, mat({ map: terreT, roughness: 1 }), .016), sol(XF, XF + 8, -1, 2.5, mat({ map: terreT, roughness: 1 }), .012), sol(82.5, 86, -1, 2.5, mat({ map: deckT, roughness: .8 }), .03), sol(86, XF, -1, 2.5, mat({ map: terreT, roughness: 1 }), .014)); box(86 - 82.5, .1, .2, boisC, (82.5 + 86) / 2, .05, 2.5);   /* (10.127 : à partir de la tour, le plancher seulement sous les balcons ; devant, la terre) */   // (10.154 : le plancher de la largeur des autres ; au-delà, le gravier)
    const nBar = scene.children.length, oBar = OB.length, solsB = new Set(L.solsPlus);
    const rond = mat({ color: 0x8a6a48, roughness: .85 });
    const barriere = (xa, za, xb, zb) => { const L2 = Math.hypot(xb - xa, zb - za), n = Math.max(1, Math.round(L2 / 2.2)), a = Math.atan2(zb - za, xb - xa);
      for (let k = 0; k <= n; k++) { const x = xa + (xb - xa) * k / n, z = za + (zb - za) * k / n; cyl(.08, .09, 1.1, rond, x, .55, z, 6); OB.push([x, z, .25]); }
      for (const y of [.45, .9]) { const l = cyl(.05, .05, L2, rond, (xa + xb) / 2, y, (za + zb) / 2, 6); l.rotation.z = Math.PI / 2; l.rotation.y = -a; } };
    barriere(XF + 7.8, -.9, XF + 7.8, 16.4); barriere(96, 16.4, XF + 7.8, 16.4);   // (10.159 : repoussée derrière le restaurant du flanc)
    for (const o of scene.children.slice(n0B)) o.position.x += 22; for (const o of OB.slice(o0B)) o[0] += 22;
    for (const o of scene.children.slice(n0B, nBar)) if (!solsB.has(o)) o.position.z -= 3.5; for (const o of OB.slice(o0B, oBar)) o[1] -= 3.5;   // (10.126 : toute la rangée de gauche reculée de 3,5 m)
    L.solsPlus.push(sol(108, XF + 22, -4.6, -1, mat({ map: deckT, roughness: .8 }), .03));
    /* (10.124, d'après les photos) entre le Yéti et la tour : le grand escalier de ferraille qui descend vers la route, ses rampes ; le totem blanc « Le Corbier »,
       le poteau aux panneaux de bois ; le mélèze, le bouleau, l'arbre roux ; au-dessus, la passerelle couverte (toit de bardeaux, murs de bois, fenêtres, piliers de béton)
       qui relie le Yéti à la tour, et arrive sous le porche des balcons */
    { const Y0 = -6, ferM = mat({ color: 0x4a4e54, roughness: .6, metalness: .5 }), galvaM = mat({ color: 0xb8bcc0, roughness: .4, metalness: .6 }), betonM = mat({ color: 0xc8c4bc, roughness: .9 });
      { const dM = mat({ map: dalleT, roughness: .85 }); L.solsPlus.push(sol(82.5, 87.6, -1, 7.6, dM, .03), sol(92.4, 95, -1, 7.6, dM, .03), sol(87.6, 92.4, 5.6, 7.6, dM, .03)); }   // (10.127 : la trémie de l'escalier, dans la promenade)
      /* (10.141) devant la passerelle, entre l'escalier et la tour : la terre battue et l'herbe, l'immense sapin, la table de pique-nique */
      { const tH = vraie(tT(512, 512, (c, w, h) => { c.fillStyle = "#8a7254"; c.fillRect(0, 0, w, h); for (let i = 0; i < 70; i++) { c.fillStyle = `rgba(${al() < .5 ? "70,110,40" : "95,130,50"},${.5 + al() * .4})`; c.beginPath(); c.ellipse(al() * w, al() * h, 20 + al() * 70, 12 + al() * 40, al() * 3, 0, 7); c.fill(); }
          for (let i = 0; i < 4000; i++) { c.fillStyle = ["#6a5640", "#a08a6a", "#5a7a30", "#7a9a40", "#4a3a28"][i % 5]; c.fillRect(al() * w, al() * h, 2, 2 + (i % 5 > 1 && i % 5 < 4 ? 3 : 0)); } }, 3, 2), "images/corbier-sol/sousbois.jpg", 4);
        L.solsPlus.push(sol(95, 108, -1, 7.6, mat({ map: tH, roughness: 1 }), .03));
        epicea(102, 0, 5.2, 24, .8); OB.push([102, 5.2, 1.2]);
        const tb = mat({ color: 0x8a6440, roughness: .8 }), tx = 98, tz = 5.2; box(2.0, .07, .8, tb, tx, .76, tz); for (const sz of [-.75, .75]) box(2.0, .05, .3, tb, tx, .45, tz + sz);
        for (const sx of [-.8, .8]) for (const sg of [-1, 1]) { const p2 = box(.08, .9, .08, tb, tx + sx, .42, tz + sg * .45); p2.rotation.x = sg * .5; } OB.push([tx, tz, 1.1]); }
      L.solsPlus.push(sol(100, 124, 7.6, 16.5, mat({ map: terreT, roughness: 1 }), .01));
      // le creux : les talus d'herbe, le bas goudronné
      const hm2 = mat({ map: herbeT, roughness: 1, side: THREE.DoubleSide });
      const talus = (xa, xb, za, zb, ya, yb) => { const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute([-xa, ya, za, -xb, ya, za, -xa, yb, zb, -xb, yb, zb], 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, (xb - xa) / 4, 0, 0, (zb - za) / 4, (xb - xa) / 4, (zb - za) / 4], 2)); g.setIndex([0, 2, 1, 1, 2, 3]); g.computeVertexNormals(); const m = new THREE.Mesh(g, hm2); scene.add(m); return m; };
      /* (10.127) l'escalier part de la promenade, devant la passerelle, et descend dessous : sous la passerelle, le vide ; derrière, les talus et le bas goudronné */
      const zA = 5.6, zB = -12, yL = (z) => Math.max(Y0, Math.min(0, Y0 * (zA - z) / (zA - zB))), yF = yL(-1.2);
      const bm2 = betonM.clone(); bm2.side = THREE.DoubleSide;
      const mur = (x, pts) => { const P = []; for (let k = 1; k < pts.length - 1; k++) for (const q of [pts[0], pts[k], pts[k + 1]]) P.push(-x, q[1], q[0]); const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3)); g.computeVertexNormals(); scene.add(new THREE.Mesh(g, bm2)); };
      talus(84, 96, -1.2, zB, yF, Y0); add(new THREE.PlaneGeometry(12, 8), mat({ color: 0x5a5c60, roughness: .9 }), 90, Y0, -16).rotation.x = -Math.PI / 2;
      for (const x of [84, 96]) mur(x, [[-1.2, 0], [-20, 0], [-20, Y0], [zB, Y0], [-1.2, yF]]);
      for (const x of [87.6, 92.4]) mur(x, [[zA, 0], [-1.2, 0], [-1.2, yF - .5], [zA, -.5]]);
      for (const [xa, xb] of [[84, 87.6], [92.4, 96]]) box(xb - xa, -yF, .2, betonM, (xa + xb) / 2, yF / 2, -1.2);
      box(12, -Y0, .3, betonM, 90, Y0 / 2, -20); for (let x = 84.4; x < 96; x += .2) box(.04, .9, .04, mat({ color: 0xe8ecee }), x, Y0 + .5, -19.7); box(12, .06, .08, mat({ color: 0xe8ecee }), 90, Y0 + .95, -19.7);
      // les garde-corps galvanisés autour de la trémie
      for (const x of [87.5, 92.5]) { for (let z = -1.2; z <= zA + .01; z += 1.7) cyl(.03, .03, 1, galvaM, x, .5, z, 5); const r = cyl(.035, .035, zA + 1.2, galvaM, x, 1, (zA - 1.2) / 2, 5); r.rotation.x = Math.PI / 2; const r2 = cyl(.025, .025, zA + 1.2, galvaM, x, .55, (zA - 1.2) / 2, 5); r2.rotation.x = Math.PI / 2; }
      // l'escalier : les marches de caillebotis, les limons, deux paliers, les rampes galvanisées
      const nM = 32; for (let k = 0; k < nM; k++) { const z = zA + (zB - zA) * k / nM, y = Y0 * (k + 1) / nM; box(3.2, .06, .62, ferM, 90, y, z - .3); box(3.2, .3, .04, ferM, 90, y - .15, z - .6); }
      for (const sx of [-1.65, 1.65]) { const L2 = Math.hypot(zB - zA, Y0), lm = box(.08, .3, L2, ferM, 90 + sx, Y0 / 2 - .1, (zA + zB) / 2); lm.rotation.x = Math.atan2(-Y0, zA - zB);
        for (let k = 0; k <= 8; k++) { const z = zA + (zB - zA) * k / 8, y = Y0 * k / 8; cyl(.03, .03, 1, galvaM, 90 + sx, y + .5, z, 5); }
        const ra = cyl(.035, .035, L2, galvaM, 90 + sx, Y0 / 2 + 1, (zA + zB) / 2, 5); ra.rotation.x = Math.PI / 2 - Math.atan2(-Y0, zA - zB); }
      // le totem « Le Corbier », le poteau aux panneaux de bois
      const toT = tT(128, 512, (c, w, h) => { c.fillStyle = "#f4f4f2"; c.fillRect(0, 0, w, h); c.strokeStyle = "#2a8aa8"; c.lineWidth = 4; c.beginPath(); c.moveTo(30, 60); c.lineTo(50, 34); c.lineTo(64, 50); c.lineTo(80, 28); c.lineTo(100, 60); c.stroke(); c.fillStyle = "#2a5a7a"; c.font = `italic 18px ${sans}`; c.fillText("le Corbier", 22, 84);
        const L3 = ["Arrêt de bus", "Espace Altas", "Centre équestre", "Promenade raquettes", "Parcours santé", "Ludothèque", "Cinéma"]; L3.forEach((t, k) => { c.fillStyle = "#3a4048"; c.fillRect(10, 104 + k * 50, w - 20, 40); c.fillStyle = "#fff"; c.font = `11px ${sans}`; c.fillText(t, 16, 128 + k * 50); c.fillText(k > 4 ? "←" : "↑", w - 28, 128 + k * 50); }); });
      box(.7, 2.9, .2, mat({ map: toT }), 93.6, 1.45, 4.2); OB.push([93.6, 4.2, .5]);
      cyl(.07, .07, 2.8, mat({ color: 0x7a5a3a }), 86.4, 1.4, 3.6, 6); for (const [y, c2, d] of [[2.5, 0x3a6ab8, 1], [2.15, 0xd8b850, -1], [1.8, 0xf2f2ee, 1], [1.45, 0xd8b850, -1]]) box(.9, .2, .05, mat({ color: c2 }), 86.4 + d * .4, y, 3.6); OB.push([86.4, 3.6, .3]);
      // les arbres
      bouleau(83.3, -7.5, 11); sapin(97, -15.5, 14, melezeM); { const rx = mat({ color: 0xd8862a, roughness: .9 }), vx = mat({ color: 0x6a8a2a, roughness: .9 }); cyl(.15, .22, 6, mat({ color: 0x6a5a4a }), 83.4, 3, -11.5, 7); for (let k = 0; k < 7; k++) add(new THREE.IcosahedronGeometry(1.3 + al(), 1), k % 2 ? rx : vx, 83.6 + al() * 1.6, 5 + al() * 3, -11.5 + (al() - .5) * 2.4); }
      barriere(83.8, -4.7, 83.8, -14); barriere(96.2, -4.7, 96.2, -12); jardiniere(84.8, -.7);   // (la barrière de bois au bord du creux, ses géraniums)
      /* (10.126, d'après le dessin) la passerelle couverte, droite : elle part du flanc du Yéti, passe devant le haut de l'escalier et entre dans le bout du porche
         des balcons de la tour (reculée), qu'elle ferme : on y entre par des portes battantes, depuis le porche */
      { const xa = 82.4, xb = 108, cx = (xa + xb) / 2, W = xb - xa, zc = -2.8, yP = 0, bardT2 = tT(256, 64, (c, w, h) => { c.fillStyle = "#8a6a52"; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 8) for (let x = (y / 8 % 2) * 6; x < w; x += 12) { c.fillStyle = ["#9a7a60", "#7a5a44", "#a88a6e"][(x + y) % 3]; c.fillRect(x, y, 11, 7); } }, 6, 2);
        const murT = tT(512, 64, (c, w, h) => { c.fillStyle = "#7a3e24"; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 6) { c.fillStyle = "rgba(0,0,0,.15)"; c.fillRect(x, 0, 1, h); } for (let x = 20; x < w; x += 64) { c.fillStyle = "#5a2a18"; c.fillRect(x - 3, 10, 46, 34); c.fillStyle = "#8a9aa4"; c.fillRect(x, 13, 40, 28); c.fillStyle = "rgba(255,255,255,.3)"; c.fillRect(x + 2, 15, 10, 24); } }, 1, 1);
        box(W, .5, 3.2, betonM, cx, yP + .25, zc);   // (le tablier, mince : dessous, le vide au-dessus de l'escalier)
        for (const sz of [-1.6, 1.6]) add(new THREE.PlaneGeometry(W, 2.3), mat({ map: murT, side: THREE.DoubleSide }), cx, yP + 1.65, zc + sz);
        for (const sg of [-1, 1]) { const t = box(W + .6, .14, 2.4, mat({ map: bardT2, roughness: .9 }), cx - .3, yP + 3.0, zc + sg * 1.0); t.rotation.x = sg * .5; }
        box(W, .3, .3, mat({ color: 0x5a3a26 }), cx, yP + 3.45, zc);
        for (const x of [85, 95]) for (const sz of [-1.3, 1.3]) { const yT = yL(zc + sz); box(.5, yP - yT, .5, betonM, x, (yP + yT) / 2, zc + sz); }
        // le bout, côté tour : le pignon de bois et ses portes battantes, sous le porche
        const pigM = mat({ color: 0x7a3e24 }), cadreM = mat({ color: 0x5a3018, roughness: .7 }), porteM = mat({ map: tT(64, 128, (c, w, h) => { c.fillStyle = "#6a3a1e"; c.fillRect(0, 0, w, h); c.fillStyle = "#9ab8c4"; c.fillRect(8, 10, w - 16, 66); c.fillStyle = "rgba(255,255,255,.35)"; c.fillRect(12, 14, 10, 58); c.fillStyle = "#4a2612"; c.fillRect(8, 86, w - 16, 30); }), roughness: .6 });
        for (const sz of [-1, 1]) box(.14, 2.3, .5, pigM, xb, yP + 1.65, zc + sz * 1.35); box(.14, 1.0, 3.2, pigM, xb, yP + 3.1, zc);   // (le pignon, ouvert au milieu)
        for (const sz of [-1, 1]) box(.12, 2.2, .1, cadreM, xb + .05, yP + 1.6, zc + sz * 1.08); box(.12, .12, 2.3, cadreM, xb + .05, yP + 2.66, zc);
        porteBat(xb + .02, yP + 1.55, zc - 1.05, 0, 1, 1, 1.05, 2.1, porteM, xb, zc); porteBat(xb + .02, yP + 1.55, zc + 1.05, 0, -1, -1, 1.05, 2.1, porteM, xb, zc);
        OB.push([xb, zc - 1.3, .25], [xb, zc + 1.3, .25]); } } }

  /* (10.130, d'après la vidéo, image par image — 10 images par seconde, et la rotation de la caméra mesurée à chaque image) : le parcours réel.
     La passerelle (17 s de marche : ~25 m), le pignon de bois sombre et sa boîte jaune ; le petit hall aux planches gris-bleu et sa double porte vitrée (à gauche) ;
     le couloir de bois sombre au néon ; tout droit, le couloir blanc (à droite la vitrine du Yéti, à gauche les portes) ; le hall de l'opticien et des Pains spéciaux,
     la poubelle, le pilier ; le couloir de la fresque et ses chevalets ; le hall des cartes postales ; la boulangerie au fond — on longe sa vitrine (virage à gauche) ;
     face aux grandes fenêtres, virage à droite : le couloir des fenêtres et sa balustrade de pin, le pilier rouge, jusqu'à l'affiche Intersport ; virage à droite :
     la pharmacie, Nutergia ; virage à gauche le long de la balustrade : le couloir de l'armoire à incendie, le chat qui dort ; le hall de Skiset et des souvenirs,
     l'ardoise du 1550 ; et la porte battante de bois, sous l'École du Ski. Dedans : la première personne. */
  const nG0 = scene.children.length;
  const GAL = (() => {
    const lu = (m, j = .14) => lum(m, j, j * 1.6);
    const tex = (w, h, f, rx = 1, ry = 1) => tT(w, h, f, rx, ry);
    const rep = (t, rx, ry = 1) => { const c = t.clone(); c.wrapS = c.wrapT = THREE.RepeatWrapping; c.repeat.set(rx, ry); c.needsUpdate = true; return c; };
    const bruit = (c, w, h, n, a, cols) => { for (let i = 0; i < n; i++) { c.fillStyle = cols[i % cols.length]; c.globalAlpha = a; c.fillRect(al() * w, al() * h, 1 + al() * 2, 1 + al() * 2); } c.globalAlpha = 1; };
    const T = {
      blanc: tex(256, 256, (c, w, h) => { c.fillStyle = "#efebe3"; c.fillRect(0, 0, w, h); bruit(c, w, h, 2500, .12, ["#d8d2c6", "#ffffff", "#c8c0b4"]); c.fillStyle = "#7a2e1e"; c.fillRect(0, h - 7, w, 7); c.fillStyle = "#5a2014"; c.fillRect(0, h - 2, w, 2); }),
      sombre: tex(256, 256, (c, w, h) => { c.fillStyle = "#3e2216"; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 16) { c.fillStyle = (x / 16) % 3 ? "#46281a" : "#5a3622"; c.fillRect(x, 0, 15, h); for (let i = 0; i < 6; i++) { c.fillStyle = "rgba(20,10,4,.35)"; c.fillRect(x + 2 + al() * 10, 0, 1, h); } c.fillStyle = "#1a0c06"; c.fillRect(x + 15, 0, 1, h); } }),
      bleu: tex(256, 256, (c, w, h) => { c.fillStyle = "#6a7a84"; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 16) { c.fillStyle = (y / 16) % 2 ? "#71828c" : "#647480"; c.fillRect(0, y, w, 15); c.fillStyle = "#3a464e"; c.fillRect(0, y + 15, w, 1); for (let i = 0; i < 5; i++) { c.fillStyle = "rgba(255,255,255,.06)"; c.fillRect(0, y + 2 + al() * 10, w, 1); } } }),
      pinV: tex(256, 256, (c, w, h) => { c.fillStyle = "#c88e52"; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 18) { c.fillStyle = ["#cf975a", "#c08448", "#d6a066"][(x / 18) % 3]; c.fillRect(x, 0, 17, h); c.fillStyle = "#8a5426"; c.fillRect(x + 17, 0, 1, h); for (let i = 0; i < 3; i++) { c.strokeStyle = "rgba(140,80,30,.3)"; c.beginPath(); const xx = x + 3 + al() * 11; c.moveTo(xx, 0); c.bezierCurveTo(xx + 3, h * .3, xx - 3, h * .6, xx, h); c.stroke(); } } }),
      /* le carrelage : des carreaux rectangulaires posés en quinconce, gris ardoise tirant sur le brun, joints clairs */
      carrelage: tex(512, 512, (c, w, h) => { c.fillStyle = "#4a403a"; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 32) for (let x = -64 + ((y / 32) % 2) * 32; x < w; x += 64) { const k = al(); c.fillStyle = `rgb(${68 + k * 14},${56 + k * 10},${50 + k * 8})`; c.fillRect(x + 1.5, y + 1.5, 61, 29); const g = c.createLinearGradient(x, y, x + 64, y + 32); g.addColorStop(0, "rgba(255,240,225,.06)"); g.addColorStop(1, "rgba(0,0,0,.08)"); c.fillStyle = g; c.fillRect(x + 1.5, y + 1.5, 61, 29); } bruit(c, w, h, 4000, .08, ["#000", "#8a7a6a"]); }),
      carrelageB: tex(512, 512, (c, w, h) => { c.fillStyle = "#7a7c84"; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 32) for (let x = -64 + ((y / 32) % 2) * 32; x < w; x += 64) { const k = al(); c.fillStyle = k < .4 ? "#2e3240" : k < .7 ? "#343846" : "#282c36"; c.fillRect(x + 2, y + 2, 60, 28); } bruit(c, w, h, 3000, .1, ["#000", "#5a6070"]); }),
      moquette: tex(256, 256, (c, w, h) => { c.fillStyle = "#4a525c"; c.fillRect(0, 0, w, h); bruit(c, w, h, 9000, .35, ["#363c44", "#5e6670", "#525a64", "#2a3036"]); }),
      dalles: tex(256, 256, (c, w, h) => { c.fillStyle = "#e8e6e0"; c.fillRect(0, 0, w, h); bruit(c, w, h, 1500, .15, ["#c8c4bc", "#fff"]); c.fillStyle = "#b8b4ac"; for (let k = 0; k <= 4; k++) { c.fillRect(k * 64 - 1, 0, 2, h); c.fillRect(0, k * 64 - 1, w, 2); } }),
      tole: tex(256, 256, (c, w, h) => { c.fillStyle = "#6e7276"; c.fillRect(0, 0, w, h); bruit(c, w, h, 3000, .15, ["#55595e", "#8a8e92"]); for (let y = 0; y < h; y += 16) for (let x = (y / 16 % 2) * 8; x < w; x += 16) { c.save(); c.translate(x + 4, y + 8); c.rotate((y / 16 % 2) ? .8 : -.8); c.fillStyle = "#4a4e52"; c.fillRect(-5, -1.5, 10, 3); c.fillStyle = "#9a9ea2"; c.fillRect(-5, -1.5, 10, 1); c.restore(); } }),
      creux: tex(64, 64, (c, w, h) => { c.fillStyle = "#cfc8bc"; c.fillRect(0, 0, w, h); bruit(c, w, h, 300, .2, ["#a8a090", "#e8e2d8"]); })
    };
    const matMur = (k, L2, H) => { const t = rep(T[k], L2 / (k === "bleu" ? 2.5 : 2), k === "blanc" ? 1 : H / 2.5); return lu(mat({ map: t, roughness: k === "blanc" ? .95 : .75, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: .13 }), .13); };
    const EXT = { crepi: mat({ map: T.creux, roughness: 1 }), bois: facS };
    const neon = lu(mat({ color: 0xffffff, emissive: 0xfff6e6, emissiveIntensity: .95 }), .95);
    const noirP = mat({ color: 0x1a1a1a, roughness: .7 }), blancP = lu(mat({ color: 0xf2f0ea, roughness: .8, emissive: 0xfff4e0, emissiveIntensity: .1 }), .1);
    const pinM = (rx = 1) => { const t = rep(T.pinV, rx, 1); return lu(mat({ map: t, roughness: .7, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: .1 }), .1); };

    /* --- la passerelle, dedans : x 82.4 → 108, z -4.4 → -1.2, plancher à 0,5 --- */
    { const xa = 82.4, xb = 108, cx = (xa + xb) / 2, W = xb - xa, zc = -2.8;
      const pinT = tex(1024, 112, (c, w, h) => { c.fillStyle = "#c8915a"; c.fillRect(0, 0, w, h); for (let y = 54; y < h; y += 7) { c.fillStyle = `rgba(${y % 14 ? "120,70,30" : "255,220,170"},.18)`; c.fillRect(0, y, w, 6); c.fillStyle = "rgba(90,50,20,.35)"; c.fillRect(0, y + 6, w, 1); }
        for (let x = 6; x < w; x += 64) { c.fillStyle = "#a8743e"; c.fillRect(x - 4, 4, 60, 48); const g = c.createLinearGradient(0, 8, 0, 48); g.addColorStop(0, "#eef6fa"); g.addColorStop(1, "#b0c6d0"); c.fillStyle = g; c.fillRect(x, 8, 52, 40); c.fillStyle = "rgba(255,255,255,.45)"; c.fillRect(x + 3, 10, 12, 36); c.fillStyle = "#a8743e"; c.fillRect(x + 24, 8, 4, 40); } }, W / 16, 1);
      for (const [z, ry] of [[zc - 1.5, 0], [zc + 1.5, Math.PI]]) add(new THREE.PlaneGeometry(W, 2.25), lu(mat({ map: pinT, roughness: .8, emissive: 0xffffff, emissiveMap: pinT, emissiveIntensity: .16 }), .16), cx, .5 + 1.125, z, ry);
      const plT = rep(T.pinV, 1, W / 2.5);
      for (const sg of [-1, 1]) { const pl = add(new THREE.PlaneGeometry(W, 1.9), lu(mat({ map: plT, roughness: .85, side: THREE.DoubleSide, emissive: 0xffffff, emissiveMap: plT, emissiveIntensity: .38 }), .38), cx, 3.15, zc + sg * .78); pl.rotation.x = Math.PI / 2 + sg * .52; }
      const chev = mat({ color: 0x9a6a3a, roughness: .7 }); for (let x = xa + .7; x < xb; x += 1.6) { for (const sg of [-1, 1]) { const r = box(.1, .14, 1.85, chev, x, 3.1, zc + sg * .78); r.rotation.x = sg * .52; } }   // (les chevrons de pin)
      box(W, .16, .16, noirP, cx, 3.6, zc);   // (la poutre faîtière, sombre)
      const solG = tex(1024, 128, (c, w, h) => { c.fillStyle = "#3a2216"; c.fillRect(0, 0, w, h); bruit(c, w, h, 6000, .18, ["#2a180e", "#4a2e1e"]);   /* (le balatum marron foncé, ses pastilles rondes antidérapantes) */
        for (let y = 5; y < h; y += 10) for (let x = (y / 10 % 2) * 5 + 3; x < w; x += 10) { c.fillStyle = "#24140a"; c.beginPath(); c.arc(x + .6, y + .6, 2.6, 0, 7); c.fill(); c.fillStyle = "#5a3826"; c.beginPath(); c.arc(x, y, 2.4, 0, 7); c.fill(); c.fillStyle = "rgba(255,220,180,.18)"; c.beginPath(); c.arc(x - .7, y - .7, 1, 0, 7); c.fill(); }
      }, W / 7, 1);
      const sg2 = add(new THREE.PlaneGeometry(W, 2.9), mat({ map: solG, roughness: .9 }), cx, .51, zc); sg2.rotation.x = -Math.PI / 2;
      /* (10.131) les taches de soleil : la lumière des fenêtres posée sur le balatum, en biais, aux bords adoucis ; elles s'en vont la nuit */
      { const ST = tex(512, 128, (c, w, h) => { c.clearRect(0, 0, w, h); c.filter = "blur(3px)"; for (let x = 6; x < w; x += 64) { const g = c.createLinearGradient(0, 30, 0, 98); g.addColorStop(0, "rgba(255,236,190,.0)"); g.addColorStop(.2, "rgba(255,236,190,.85)"); g.addColorStop(.8, "rgba(255,240,205,.95)"); g.addColorStop(1, "rgba(255,236,190,.0)");
            c.fillStyle = g; c.beginPath(); c.moveTo(x + 14, 34); c.lineTo(x + 54, 34); c.lineTo(x + 44, 94); c.lineTo(x + 4, 94); c.closePath(); c.fill(); c.fillStyle = "rgba(60,40,20,.5)"; c.fillRect(x + 30, 34, 3, 60); } c.filter = "none"; }, W / 9, 1);
        const sm = new THREE.MeshBasicMaterial({ map: ST, transparent: true, opacity: .8, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
        const so = add(new THREE.PlaneGeometry(W, 1.4), sm, cx, .515, zc + .25); so.rotation.x = -Math.PI / 2; so.renderOrder = 2; L.solPasserelle = so;
        const a4 = L.anim; L.anim = (tm) => { try { a4 && a4(tm); } catch (e) {} const v = !L.nuit && !(M && M.hiver && false); if (so.visible !== v) so.visible = v; }; }
      // le pignon de bois sombre, au bout côté Yéti, et son ouverture ; la boîte jaune, à droite ; le panneau rouge suspendu
      const sb = mat({ map: rep(T.sombre, 2, 1), roughness: .8 }); for (const sz of [-1.25, 1.25]) box(.12, 2.9, .7, sb, xa + .06, .5 + 1.45, zc + sz); box(.12, 1.0, 3.2, sb, xa + .06, .5 + 2.4, zc);
      { const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute([-(xa + .13), 3.4, zc - 1.6, -(xa + .13), 3.4, zc + 1.6, -(xa + .13), 4.3, zc], 3)); g.computeVertexNormals(); const m = new THREE.Mesh(g, mat({ map: T.sombre, side: THREE.DoubleSide })); scene.add(m); }
      box(.35, .45, .25, mat({ color: 0xf0d020, roughness: .5 }), xa + 2.2, 1.4, zc + 1.35); box(.36, .06, .27, mat({ color: 0xd0b010 }), xa + 2.2, 1.65, zc + 1.35);
      const rs = panneau("SORTIE / EXIT", "#c8202a", "#ffffff", 256, 64, `bold 30px ${sans}`); add(new THREE.PlaneGeometry(.8, .2), lumi(rs, .5), xb - 3, 2.7, zc + 1.0, Math.PI / 2); }

    /* --- les pièces (coordonnées d'origine ; on marche vers les x décroissants ; pour celui qui marche, la droite est du côté des z croissants) --- */
    const P = [];
    const piece = (nom, x0, x1, z0, z1, o) => { const p = { nom, x0, x1, z0, z1, h: 3, mur: "blanc", sol: "carrelage", plaf: "dalles", ext: "crepi", ouv: {}, ...o }; P.push(p); return p; };
    piece("A", 80.4, 82.4, -4.4, -1.2, { h: 2.7, mur: "sombre", sol: "moquette", plaf: "sombre", ext: "bois", pente: [80.4, 0, 82.4, .5], ouv: { xmax: [[-4.4, -1.2]] } });
    piece("B", 75.4, 80.4, -4.4, -1.6, { h: 2.7, mur: "bleu", sol: "moquette", plaf: "dalles", ext: "bois" });
    piece("B2", 77, 79, -8.6, -4.4, { h: 2.6, mur: "bleu", sol: "tole", plaf: "dalles", ext: "bois" });   // (10.134 : le petit couloir étroit de l'ascenseur)
    piece("C", 72.4, 75.4, -4.2, -1.6, { h: 2.6, mur: "sombre", sol: "moquette", plaf: "sombre", ext: "bois" });
    piece("D", 66, 72.4, -6.6, -1.6, { h: 3.3, ouv: { zmin: [[66.4, 71.8]] } });
    piece("ARC", 66.4, 71.8, -11, -6.6, { h: 2.9, ouv: { zmax: [[66.4, 71.8]] } });   // (10.127 : la salle d'arcade, à la place du magasin de presse)
    piece("D2", 58, 66, -5.4, -2.6, { h: 2.9 });   // (10.133 : après le Yéti, le couloir tourne légèrement à droite)
    piece("E", 52, 58, -13, -2.6, { h: 3.2 });
    for (const l of GALZ) { const cx = (l.x0 + l.x1) / 2, g = GZ.find(([g0, g1]) => cx >= g0 && cx < g1); if (g) piece("P" + l.id, l.x0 + .22, l.x1 - .22, g[2], zfAt(cx), { h: 2.6, nofp: true, ouv: { zmax: [[l.x0 + .22, l.x1 - .22]] } }); }   // (10.144 : les cinq passages « Galerie marchande » de la promenade)
    piece("E2", 40, 52, -15, -3.0, { h: 3.2 });   // (derrière le renfoncement de la façade)
    piece("F", 30, 40, -8, -3.6, { h: 2.8 });
    piece("G", 16, 30, -12, -3.0, { h: 3.1 });
    piece("H", 4, 16, -8, -3.0, { h: 2.9 });   // (10.135 : un couloir, pas un hall : la boulangerie au fond)
    piece("H2", 4, 8, -17, -8, { h: 2.9 });
    piece("BO", -6, 4, -7.4, -3.2, { h: 2.9 });   // (10.157 : la boulangerie La Panetière, dans l'angle, toute vitrée)
    piece("I", -14, 8, -20, -17, { h: 2.9, sol: "carrelageB" });
    piece("J", -14, -7, -17, -7.5, { h: 3 });
    piece("K", -24, -14, -11, -7.5, { h: 2.8 });
    piece("K2", -23, -20.8, -7.5, -3.25, { h: 2.6, ouv: { zmax: [[-23, -20.8]] } });   // (le renfoncement, jusqu'à la double porte de la façade)   // (10.137 : le renfoncement et sa double porte vitrée vers le dehors)
    piece("L", -34, -24, -11, -7.5, { h: 2.7 });   // (10.139 : le couloir étroit, façade grise à gauche, vitrines à droite)
    piece("N", -44, -34, -14.5, -7.5, { h: 3.1, ext: "bois" });   // (au bout : le hall lumineux des souvenirs et de Skiset)
    piece("M", -35.2, -32.8, -6.2, -3.25, { h: 2.6, ouv: { zmax: [[-35.2, -32.8]] } });   // (10.141 : le sas — à droite l'escalier qui descend, en face les portes battantes)
    piece("M2", -35.2, -32.8, -7.5, -6.2, { h: 2.5 });
    /* (10.127 : le couloir gris et sa petite porte retirés — la vitrine de Quasar à la place) */   // (le couloir derrière la porte du mur en retour)
    const inter = (a0, a1, b0, b1) => [Math.max(a0, b0), Math.min(a1, b1)];
    for (const p of P) for (const q of P) if (p !== q) {
      const add2 = (cote, iv) => { if (iv[1] - iv[0] > .3) (p.ouv[cote] = p.ouv[cote] || []).push(iv); };
      if (Math.abs(p.x0 - q.x1) < .01) add2("xmin", inter(p.z0, p.z1, q.z0, q.z1)); if (Math.abs(p.x1 - q.x0) < .01) add2("xmax", inter(p.z0, p.z1, q.z0, q.z1));
      if (Math.abs(p.z0 - q.z1) < .01) add2("zmin", inter(p.x0, p.x1, q.x0, q.x1)); if (Math.abs(p.z1 - q.z0) < .01) add2("zmax", inter(p.x0, p.x1, q.x0, q.x1)); }
    const hVois = (p, cote, a) => { for (const q of P) if (q !== p) { const ok = cote === "xmin" ? Math.abs(p.x0 - q.x1) < .01 && a > q.z0 && a < q.z1 : cote === "xmax" ? Math.abs(p.x1 - q.x0) < .01 && a > q.z0 && a < q.z1 : cote === "zmin" ? Math.abs(p.z0 - q.z1) < .01 && a > q.x0 && a < q.x1 : Math.abs(p.z1 - q.z0) < .01 && a > q.x0 && a < q.x1; if (ok) return q.h; } return 2.5; };
    const RES = {}, reserve = (nom, cote, a0, a1) => ((RES[nom + cote] = RES[nom + cote] || []).push([a0, a1])), SEGS = [], OBS = [];
    const Pn = (n) => P.find(q => q.nom === n);
    const repere = (p, cote) => { const ry = { zmin: 0, zmax: Math.PI, xmin: Math.PI / 2, xmax: -Math.PI / 2 }[cote];
      const pos = (u, v, w) => cote === "zmin" ? [u, v, p.z0 + w] : cote === "zmax" ? [u, v, p.z1 - w] : cote === "xmin" ? [p.x0 + w, v, u] : [p.x1 - w, v, u];
      return { ry, pos, plan: (W2, H2, m, u, v, w) => { const [x, y, z] = pos(u, v, w); return add(new THREE.PlaneGeometry(W2, H2), m, x, y, z, ry); },
        boite: (L2, H2, E2, m, u, v, w) => { const [x, y, z] = pos(u, v, w); return box(L2, H2, E2, m, x, y, z, ry); } }; };
    function panneau(txt, fond, coul, w = 512, h = 64, police = `bold 34px ${sans}`) { return tex(w, h, (c, W2, H2) => { c.fillStyle = fond; c.fillRect(0, 0, W2, H2); c.fillStyle = coul; c.font = police; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(txt, W2 / 2, H2 / 2 + 2); }); }
    function lumi(t, j = .35) { return lu(mat({ map: t, roughness: .6, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: j }), j); }

    const MARCH = {
      pain: (c, w, h) => { c.fillStyle = "#e8d8b8"; c.fillRect(0, 0, w, h); for (let s = 0; s < 4; s++) { c.fillStyle = "#8a5a32"; c.fillRect(0, 40 + s * 52, w, 6); for (let x = 8; x < w - 20; x += 22 + al() * 10) { c.fillStyle = ["#b8783a", "#a8682e", "#c8904a", "#9a5a24"][(x | 0) % 4]; c.beginPath(); c.ellipse(x + 8, 34 + s * 52, 10 + al() * 4, 6, 0, 0, 7); c.fill(); c.fillStyle = "rgba(255,230,180,.4)"; c.fillRect(x + 4, 30 + s * 52, 6, 2); } } },
      gateau: (c, w, h) => { c.fillStyle = "#f6eee8"; c.fillRect(0, 0, w, h); for (let s = 0; s < 4; s++) { c.fillStyle = "#c8b8a8"; c.fillRect(0, 44 + s * 52, w, 4); for (let x = 10; x < w - 16; x += 26) { c.fillStyle = ["#f0c8d8", "#e8a040", "#8a4a2a", "#fff", "#c83a5a"][(x / 26 | 0) % 5]; c.fillRect(x, 28 + s * 52, 18, 14); c.fillStyle = "#fff"; c.fillRect(x, 26 + s * 52, 18, 3); } } },
      optique: (c, w, h) => { c.fillStyle = "#f2f2f0"; c.fillRect(0, 0, w, h); for (let s = 0; s < 5; s++) { c.fillStyle = "#d0d0d0"; c.fillRect(0, 40 + s * 42, w, 3); for (let x = 12; x < w - 30; x += 40) { c.strokeStyle = ["#1a1a1a", "#7a4a2a", "#2a4a8a", "#8a2a2a"][(x / 40 | 0) % 4]; c.lineWidth = 3; c.beginPath(); c.arc(x + 6, 30 + s * 42, 6, 0, 7); c.arc(x + 22, 30 + s * 42, 6, 0, 7); c.stroke(); } } c.fillStyle = "#c8a878"; c.fillRect(w * .62, 20, w * .3, 150); c.fillStyle = "#2a2a2a"; c.font = `bold 20px ${sans}`; c.fillText("Ray-Ban", w * .66, 90); },
      souv: (c, w, h) => { c.fillStyle = "#e8e0d0"; c.fillRect(0, 0, w, h); for (let s = 0; s < 5; s++) for (let x = 6; x < w - 10; x += 14) { c.fillStyle = ["#c8202a", "#2a5ab8", "#f0c020", "#2a9a4a", "#fff", "#e86a9a"][(x / 14 + s | 0) % 6]; c.fillRect(x, 14 + s * 46, 11, 34); } },
      ski: (c, w, h) => { c.fillStyle = "#e8e8e4"; c.fillRect(0, 0, w, h); for (let x = 10; x < w - 10; x += 16) { c.fillStyle = ["#c8202a", "#2a5ab8", "#f0c020", "#1a1a1a", "#fff"][(x / 16 | 0) % 5]; c.fillRect(x, 20, 9, h - 30); c.fillStyle = "rgba(0,0,0,.25)"; c.fillRect(x + 7, 20, 2, h - 30); } },
      pharma: (c, w, h) => { c.fillStyle = "#f4f6f4"; c.fillRect(0, 0, w, h); for (let s = 0; s < 5; s++) { c.fillStyle = "#c8ccc8"; c.fillRect(0, 44 + s * 42, w, 3); for (let x = 8; x < w - 12; x += 16) { c.fillStyle = ["#fff", "#2a9a4a", "#2a5ab8", "#e8e8e0", "#c83a3a"][(x / 16 + s | 0) % 5]; c.fillRect(x, 24 + s * 42, 12, 20); } } },
      chaussures: (c, w, h) => { c.fillStyle = "#d8ccbc"; c.fillRect(0, 0, w, h); for (let s = 0; s < 6; s++) for (let x = 8; x < w - 20; x += 24) { c.fillStyle = ["#1a1a1a", "#c8202a", "#2a5ab8", "#f0f0f0", "#f0c020", "#e86a9a"][(x / 24 + s | 0) % 6]; c.beginPath(); c.ellipse(x + 10, 24 + s * 38, 10, 5, 0, 0, 7); c.fill(); } },
      yeti: (c, w, h) => { c.fillStyle = "#f0e8d8"; c.fillRect(0, 0, w, h); for (let s = 0; s < 4; s++) { c.fillStyle = "#b89878"; c.fillRect(0, 50 + s * 50, w, 5); for (let x = 8; x < w - 20; x += 30) { c.fillStyle = ["#c8202a", "#e8c040", "#2a5ab8", "#fff", "#8a5a2a"][(x / 30 + s | 0) % 5]; c.fillRect(x, 26 + s * 50, 22, 24); } } c.fillStyle = "#fff"; c.fillRect(w * .55, 40, w * .3, 160); c.fillStyle = "#c8202a"; c.font = `bold 18px ${sans}`; c.fillText("CRÊPES", w * .58, 90); c.fillText("GAUFRES", w * .58, 120); },
      vide: (c, w, h) => { c.fillStyle = "#d8d4cc"; c.fillRect(0, 0, w, h); }
    };
    /* une devanture en relief : la vitrine en retrait, les montants de bois, le verre, la porte, l'enseigne ; derrière le verre, la boutique éclairée */
    const boutique = (p, cote, a0, a1, d) => { reserve(p.nom, cote, a0, a1); const R = repere(p, cote), L2 = a1 - a0, um = (a0 + a1) / 2, H = p.h, PR = 1.3, cadre = mat({ color: d.cadre || 0x5a3418, roughness: .6 });
      if (!d.traversant) { const mt = tex(512, 256, MARCH[d.motif] || MARCH.vide); R.plan(L2 - .1, 2.5, lumi(mt, .45), um, 1.25, -PR + .02);   // (traversante : la boutique de la promenade fait le dedans)
      for (const s of [-1, 1]) { const [x, y, z] = R.pos(um + s * (L2 / 2 - .03), 1.5, -PR / 2); box(cote[0] === "z" ? .06 : PR, 3, cote[0] === "z" ? PR : .06, blancP, x, y, z); } }
      if (!d.traversant) { const [x, , z] = R.pos(um, 0, -PR / 2); const s = add(new THREE.PlaneGeometry(cote[0] === "z" ? L2 : PR, cote[0] === "z" ? PR : L2), mat({ map: rep(T.carrelage, 1, 1), roughness: .5 }), x, .055, z); s.rotation.x = -Math.PI / 2; const pl = add(new THREE.PlaneGeometry(cote[0] === "z" ? L2 : PR, cote[0] === "z" ? PR : L2), neon, x, 2.62, z); pl.rotation.x = Math.PI / 2; }
      R.boite(L2, .35, .1, cadre, um, .175, 0); R.boite(L2, .12, .1, cadre, um, 2.4, 0);
      const nm = Math.max(2, Math.round(L2 / 1.3)); for (let k = 0; k <= nm; k++) R.boite(.09, 2.4, .12, cadre, a0 + .05 + k * (L2 - .1) / nm, 1.2, 0);
      R.plan(L2, 2.05, mat({ color: 0xdcecf2, roughness: .05, metalness: .3, transparent: true, opacity: .14, depthWrite: false }), um, 1.37, .02);
      const up = d.porte === "gauche" ? a0 + .9 : d.porte === "droite" ? a1 - .9 : um; R.boite(1.0, 2.05, .05, mat({ color: 0xc8dce4, roughness: .05, transparent: true, opacity: .25, depthWrite: false }), up, 1.37, .03); R.boite(.04, .5, .06, mat({ color: 0xb8bcc0, metalness: .7 }), up + .35, 1.15, .1);
      const ens = panneau(d.nom, d.fond, d.coul, 1024, 96, d.police || `bold 52px ${sans}`); R.boite(L2, .5, .1, cadre, um, 2.68, .02); R.plan(L2 - .1, .42, lumi(ens, .5), um, 2.68, .08);
      if (H > 2.95) R.plan(L2, H - 2.93, matMur(p.mur, L2, H - 2.93), um, 2.93 + (H - 2.93) / 2, 0);
      if (d.saillie) { const s2 = panneau(d.saillie, d.fond, d.coul, 256, 96, `bold 40px ${sans}`); const [x, y, z] = R.pos(a1 - .2, 2.45, .5); box(cote[0] === "z" ? .06 : .9, .45, cote[0] === "z" ? .9 : .06, lumi(s2, .5), x, y, z); } };
    // le mobilier
    const ardoise = (x, z, ry, lignes) => { const t = tex(128, 192, (c, w, h) => { c.fillStyle = "#7a5432"; c.fillRect(0, 0, w, h); c.fillStyle = "#1c211e"; c.fillRect(8, 8, w - 16, h - 16); c.fillStyle = "#f4f4ee"; c.font = `bold 16px ${serif}`; c.textAlign = "center"; c.fillText(lignes[0], w / 2, 32); c.font = `12px ${sans}`; lignes.slice(1).forEach((l, i) => c.fillText(l, w / 2, 56 + i * 18)); });
      const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g); const m = mat({ map: t, roughness: .9 });
      panA(g, m, .62, 1.0, .17, .32); OBS.push([x, z, .45]); };
    const chevalet = (x, z, ry) => { const t = tex(128, 192, (c, w, h) => { c.fillStyle = "#3a2a1e"; c.fillRect(0, 0, w, h); c.fillStyle = "#f4f2ec"; c.fillRect(10, 10, w - 20, h - 20); c.fillStyle = "#2a2a2a"; for (let k = 0; k < 9; k++) c.fillRect(18, 22 + k * 16, w - 36 - (k * 13) % 30, 4); });
      const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g); const m = mat({ map: t, roughness: .8 }); panA(g, m, .7, 1.15, .2, .36); OBS.push([x, z, .5]); };
    const pilier = (x, z, m = blancP, c = .42) => { box(c, 3.3, c, m, x, 1.65, z); OBS.push([x, z, c * .8]); };
    const poubelle = (x, z) => { cyl(.36, .32, .95, blancP, x, .48, z, 16); cyl(.38, .38, .08, mat({ color: 0xf0d020, roughness: .5 }), x, 1.0, z, 16); OBS.push([x, z, .5]); };
    const CARTES = tex(128, 512, (c, w, h) => { c.fillStyle = "#2a2c30"; c.fillRect(0, 0, w, h); for (let y = 4; y < h; y += 32) for (let x = 4; x < w; x += 31) { const g = c.createLinearGradient(0, y, 0, y + 26); g.addColorStop(0, ["#5a9ad8", "#7ab0e0", "#f0c070"][(x + y) % 3]); g.addColorStop(.55, ["#e8eef4", "#fff", "#d88a4a"][(x * 3 + y) % 3]); g.addColorStop(1, ["#3a7a3a", "#5a8a4a", "#7a5a3a"][(x + y * 7) % 3]); c.fillStyle = g; c.fillRect(x, y, 26, 26); c.fillStyle = "rgba(200,205,210,.8)"; c.fillRect(x - 2, y + 22, 30, 2); } });
    const presentoir = (x, z) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = al() * 1.5; scene.add(g); const fer = mat({ color: 0x3a3c40, roughness: .5, metalness: .6 }), cm = mat({ map: CARTES, roughness: .7 });   /* (le présentoir grillagé à cartes postales, sur roulettes) */
      for (const [dx, dz] of [[-.24, -.24], [.24, -.24], [-.24, .24], [.24, .24]]) { const p2 = new THREE.Mesh(new THREE.BoxGeometry(.03, 2.0, .03), fer); p2.position.set(dx, 1.08, dz); g.add(p2); const r = new THREE.Mesh(new THREE.SphereGeometry(.045, 6, 4), fer); r.position.set(dx * 1.3, .05, dz * 1.3); g.add(r); }
      const b = new THREE.Mesh(new THREE.BoxGeometry(.7, .04, .7), fer); b.position.y = .1; g.add(b);
      for (let k = 0; k < 4; k++) { const f = new THREE.Mesh(new THREE.PlaneGeometry(.46, 1.8), cm); const a = k * Math.PI / 2; f.position.set(Math.sin(a) * .25, 1.1, Math.cos(a) * .25); f.rotation.y = a; g.add(f); } OBS.push([x, z, .45]); };
    const balustrade = (x0, z0, x1, z1, base = true) => { const L2 = Math.hypot(x1 - x0, z1 - z0), a = Math.atan2(z1 - z0, x1 - x0), pin2 = pinM(L2 / 3), cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
      if (base) box(L2, .45, .3, blancP, cx, .22, cz, -a); const yb = base ? .45 : 0; box(L2, .08, .14, pin2, cx, yb + .95, cz, -a); box(L2, .06, .1, pin2, cx, yb + .1, cz, -a);
      const n = Math.round(L2 / .16); for (let k = 0; k <= n; k++) { const t = k / n; box(.09, .85, .04, pin2, x0 + (x1 - x0) * t, yb + .52, z0 + (z1 - z0) * t, -a); } };
    const banc = (x, z, ry) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g); const m = pinM(1);
      for (const [w, h, d, y, zz] of [[1.8, .06, .4, .46, 0], [1.8, .4, .05, .75, -.2]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(0, y, zz); g.add(b); }
      for (const sx of [-.8, .8]) { const b = new THREE.Mesh(new THREE.BoxGeometry(.08, .46, .38), m); b.position.set(sx, .23, 0); g.add(b); } OBS.push([x, z, 1]); banc2(x, z, ry); };
    const sortie = (x, y, z, ry) => { const t = panneau("🏃 SORTIE", "#1a8a3a", "#ffffff", 256, 80, `bold 36px ${sans}`); add(new THREE.PlaneGeometry(.6, .19), lumi(t, .9), x, y, z, ry); };
    const extincteur = (x, z) => { cyl(.08, .08, .55, mat({ color: 0xd01c1c, roughness: .4 }), x, .95, z, 10); cyl(.03, .03, .1, noirP, x, 1.27, z, 6); };
    const porteBlanche = (R, u, larg = 1.0) => { const t = tex(64, 128, (c, w, h) => { c.fillStyle = "#f4f2ee"; c.fillRect(0, 0, w, h); c.fillStyle = "#e4e0d8"; c.fillRect(6, 6, w - 12, h - 8); c.fillStyle = "#8a8e92"; c.fillRect(w - 16, 62, 9, 3); c.fillRect(w - 18, 58, 4, 12); });
      R.boite(larg + .14, 2.18, .06, mat({ color: 0x4a2a1a, roughness: .6 }), u, 1.09, .01); R.plan(larg, 2.1, mat({ map: t, roughness: .7 }), u, 1.05, .05); };
    const plafonniers = (p) => { const W2 = p.x1 - p.x0, D2 = p.z1 - p.z0, along = W2 >= D2; const n = Math.max(1, Math.round((along ? W2 : D2) / 4.5));
      for (let k = 0; k < n; k++) { const t = (k + .5) / n, x = along ? p.x0 + W2 * t : (p.x0 + p.x1) / 2, z = along ? (p.z0 + p.z1) / 2 : p.z0 + D2 * t; box(along ? 1.2 : .5, .05, along ? .5 : 1.2, neon, x, p.h - .03, z); } };
    const chat = (x, z) => { const m = mat({ color: 0x8a6a4a, roughness: .9 }), g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
      const c1 = new THREE.Mesh(new THREE.SphereGeometry(.22, 10, 8), m); c1.scale.set(1.6, .55, .8); c1.position.y = .12; g.add(c1); const t1 = new THREE.Mesh(new THREE.SphereGeometry(.11, 10, 8), m); t1.position.set(.36, .12, .05); g.add(t1);
      for (const s of [-1, 1]) { const o = new THREE.Mesh(new THREE.ConeGeometry(.04, .08, 4), m); o.position.set(.38, .22, .05 + s * .05); g.add(o); } const q = new THREE.Mesh(new THREE.CylinderGeometry(.025, .02, .45, 5), m); q.rotation.z = Math.PI / 2; q.position.set(-.5, .05, .1); g.add(q); OBS.push([x, z, .5]); };

    /* --- l'habillage, pièce par pièce, d'après la vidéo --- */
    // B : le petit hall gris-bleu ; à gauche, l'ascenseur — ses portes de verre, la cabine d'inox éclairée derrière, l'indicateur d'étage, les boutons d'appel
    { const B_ = Pn("B2"), R = repere(B_, "zmin"), ux = 78; reserve("B2", "zmin", 77, 79);
      const inox = mat({ color: 0xb8bcc2, roughness: .3, metalness: .85 }), inoxT = tex(128, 256, (c, w, h) => { c.fillStyle = "#b4b8be"; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 2) { c.fillStyle = `rgba(${al() < .5 ? "255,255,255" : "60,64,70"},${.05 + al() * .08})`; c.fillRect(0, y, w, 1); } });
      R.boite(2.0, .14, .14, inox, ux, 2.2, 0); for (const u of [77.06, 78.94]) R.boite(.1, 2.2, .14, inox, u, 1.1, 0); R.boite(.04, 2.1, .1, inox, ux, 1.07, .02);
      const verre = mat({ color: 0xc8dce4, roughness: .05, metalness: .2, transparent: true, opacity: .28, depthWrite: false });
      for (const s2 of [-.46, .46]) { R.boite(.9, 2.06, .03, verre, ux + s2, 1.07, .03); R.boite(.9, .05, .05, inox, ux + s2, 2.08, .03); R.boite(.9, .05, .05, inox, ux + s2, .06, .03); }
      R.plan(2.0, .4, matMur("bleu", 2.0, .4), ux, 2.4, 0);
      // la cabine, derrière les portes
      const cab = lu(mat({ map: inoxT, roughness: .35, metalness: .6, emissive: 0xffffff, emissiveMap: inoxT, emissiveIntensity: .35 }), .35), D2 = 1.6;
      { const [x, , z] = R.pos(ux, 0, -D2 / 2); for (const s2 of [-1, 1]) box(.06, 2.3, D2, cab, x + s2 * 1.0, 1.15, z); const [xb, , zb] = R.pos(ux, 0, -D2); box(2.0, 2.3, .06, cab, xb, 1.15, zb);
        box(2.0, .06, D2, lu(mat({ color: 0xfffaf0, emissive: 0xfff6e0, emissiveIntensity: .9 }), .9), x, 2.3, z); const sl = add(new THREE.PlaneGeometry(1.95, D2), mat({ color: 0x3a3c40, roughness: .6 }), x, .02, z); sl.rotation.x = -Math.PI / 2;
        box(1.4, .9, .02, mat({ color: 0xe8f0f4, roughness: .02, metalness: .9 }), xb, 1.45, zb + .05); box(1.8, .05, .05, inox, xb, .95, zb + .1); }
      // l'indicateur d'étage, les boutons d'appel
      const ind = tex(128, 48, (c, w, h) => { c.fillStyle = "#101214"; c.fillRect(0, 0, w, h); c.fillStyle = "#ff3a2a"; c.font = `bold 30px ${sans}`; c.textAlign = "center"; c.fillText("▲ 0", w / 2, 35); }); R.boite(.5, .2, .04, inox, ux, 2.37, .02); R.plan(.44, .15, lumi(ind, .9), ux, 2.37, .05);
      const Rb = repere(B_, "xmin"); Rb.boite(.16, .32, .03, inox, -7.9, 1.15, .02); for (const [v, t] of [[1.22, "▲"], [1.08, "▼"]]) { const bt = tex(32, 32, (c, w, h) => { c.fillStyle = "#c0c4c8"; c.fillRect(0, 0, w, h); c.fillStyle = "#3a8af0"; c.beginPath(); c.arc(16, 16, 10, 0, 7); c.fill(); c.fillStyle = "#fff"; c.font = `bold 12px ${sans}`; c.textAlign = "center"; c.fillText(t, 16, 21); }); Rb.plan(.08, .08, lumi(bt, .5), -7.9, v, .04); }
      { const af = tex(128, 192, (c, w, h) => { c.fillStyle = "#f6f4f0"; c.fillRect(0, 0, w, h); c.fillStyle = "#c8202a"; c.font = `bold 13px ${sans}`; c.textAlign = "center"; c.fillText("ASCENSEUR", w / 2, 26); c.fillStyle = "#3a3a3a"; c.font = `10px ${sans}`; ["Niveau 0 : Galerie", "Niveau 1 : Résidences", "Niveau 2 : Parking", "", "En cas de panne", "appuyer sur l'alarme"].forEach((l, k) => c.fillText(l, w / 2, 56 + k * 16)); c.fillStyle = "#c8202a"; c.fillRect(30, 160, 68, 14); }); Rb.plan(.42, .62, lumi(af, .3), -7.3, 1.75, .02); }
      for (let x = 76; x < 80.4; x += 1.4) box(.14, .14, 2.8, mat({ map: T.sombre }), x, 2.62, -3.0); box(2, .04, .1, mat({ color: 0xd8702a }), 78, .06, -4.5); }
    // C : le couloir de bois sombre, le long tube de néon
    { const C_ = Pn("C"); box(2.6, .05, .1, neon, 73.9, 2.5, -2.0); box(.08, 2.4, .08, mat({ color: 0x2a160c }), 74, 1.2, -4.12); }
    // D : le couloir blanc ; à droite la vitrine du Yéti (son arrière-boutique de crêpes), à gauche les portes de service, le logo rond, l'extincteur
    { const D_ = Pn("D"), D2_ = Pn("D2"), Rd = repere(D_, "zmax"), Rg = repere(D_, "zmin");
      /* le Yéti, vu de la galerie : le fronton de planches, la grande enseigne rouge « LE YETI · crêpes · pizzeria », la porte et les vitrines à cadre blanc */
      { reserve("D", "zmax", 66.2, 71.8); const R = Rd, blancF = mat({ color: 0xf4f2ee, roughness: .5 }), planT = tex(256, 256, (c, w, h) => { c.fillStyle = "#c8a874"; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 20) { c.fillStyle = ["#cfb07c", "#c0a06a", "#d4b886"][(y / 20) % 3]; c.fillRect(0, y, w, 19); c.fillStyle = "rgba(90,60,30,.35)"; c.fillRect(0, y + 19, w, 1); } }, 1, 1);
        const planM = lu(mat({ map: planT, roughness: .8, emissive: 0xffffff, emissiveMap: planT, emissiveIntensity: .12 }), .12), verre = mat({ color: 0xc8d8de, roughness: .05, transparent: true, opacity: .3, depthWrite: false });
        // le mur de planches (le plus loin), la porte ouverte, l'intérieur et ses caisses de bois, le panneau vitré « DU JOUR »
        R.plan(1.6, 2.4, planM, 67.0, 1.2, 0);
        const intT = tex(256, 256, (c, w, h) => { c.fillStyle = "#e8dcc4"; c.fillRect(0, 0, w, h); for (let s2 = 0; s2 < 5; s2++) { c.fillStyle = "#b08a58"; c.fillRect(20, 40 + s2 * 44, w - 40, 30); c.fillStyle = "#8a6a40"; c.fillRect(20, 68 + s2 * 44, w - 40, 3); for (let x = 30; x < w - 40; x += 46) { c.fillStyle = ["#c83a2a", "#f0e0b0", "#3a6a2a", "#e8c040"][(x / 46 + s2 | 0) % 4]; c.fillRect(x, 44 + s2 * 44, 26, 20); } } c.fillStyle = "#f4f4f2"; c.fillRect(150, 20, 70, 50); });
        { const [x, , z] = R.pos(68.5, 0, -1.0); box(1.4, 2.4, .05, lumi(intT, .4), x, 1.2, z - .95 * 0); }
        for (const s2 of [-1, 1]) { const [x, , z] = R.pos(68.5 + s2 * .72, 0, -.5); box(.06, 2.4, 1.0, blancF, x, 1.2, z); }
        { const [x, , z] = R.pos(68.5, 0, -.5); box(1.44, .05, 1.0, blancF, x, 2.4, z); const f2 = add(new THREE.PlaneGeometry(1.44, 1.0), mat({ map: rep(T.carrelage, 1, 1), roughness: .5 }), x, .056, z); f2.rotation.x = -Math.PI / 2; }
        { const g = new THREE.Group(), [hx, , hz] = R.pos(67.8, 0, .02); g.position.set(hx, 0, hz); g.rotation.y = R.ry - 1.1; scene.add(g);   // (la porte ouverte, son cadre blanc, sa vitre, ses affichettes)
          for (const [w2, h2, d2, x2, y2] of [[1.35, .08, .06, .68, 2.32], [1.35, .08, .06, .68, .08], [.08, 2.3, .06, .04, 1.2], [.08, 2.3, .06, 1.32, 1.2], [1.35, .9, .05, .68, .55]]) { const m2 = new THREE.Mesh(new THREE.BoxGeometry(w2, h2, d2), blancF); m2.position.set(x2, y2, 0); g.add(m2); }
          const v2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.3, .02), verre); v2.position.set(.68, 1.65, 0); g.add(v2);
          const ff = tex(64, 96, (c, w, h) => { c.fillStyle = "#f4f2ee"; c.fillRect(0, 0, w, h); c.fillStyle = "#2a2a2a"; for (let k2 = 0; k2 < 8; k2++) c.fillRect(8, 10 + k2 * 10, 40 - (k2 * 7) % 20, 3); }); for (const x2 of [.45, .85]) { const a2 = new THREE.Mesh(new THREE.PlaneGeometry(.3, .42), mat({ map: ff })); a2.position.set(x2, 1.75, .02); g.add(a2); } OBS.push([hx, hz, .5]); }
        // le panneau vitré, à cadre blanc, « DU JOUR » ; le bas blanc
        R.boite(2.6, .08, .1, blancF, 70.5, 2.36, .03); R.boite(2.6, .9, .08, blancF, 70.5, .45, .03); for (const u of [69.24, 71.76]) R.boite(.08, 2.4, .1, blancF, u, 1.2, .03);
        R.plan(2.5, 1.4, lumi(tex(64, 64, (c, w, h) => { c.fillStyle = "#8a8070"; c.fillRect(0, 0, w, h); c.fillStyle = "#b8a080"; c.fillRect(8, 30, 48, 30); c.fillStyle = "rgba(255,255,255,.25)"; c.fillRect(6, 4, 10, 56); }), .35), 70.5, 1.6, -.02);
        R.plan(1.0, .26, lumi(panneau("DU JOUR", "#f4f2ee", "#c8202a", 256, 64, `bold 34px ${sans}`), .3), 70.2, 2.15, .08);
        // le fronton de planches et la grande enseigne rouge
        const fr = tex(1024, 192, (c, w, h) => { c.fillStyle = "#b8925e"; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 22) { c.fillStyle = ["#c09a66", "#ad8654", "#c8a470"][(x / 22) % 3]; c.fillRect(x, 0, 21, h); c.fillStyle = "rgba(60,36,16,.4)"; c.fillRect(x + 21, 0, 1, h); }
          c.fillStyle = "#c8202a"; c.fillRect(260, 0, 560, h); c.fillStyle = "#f4f2ee"; c.save(); c.translate(300, 150); c.rotate(-.12); c.font = `bold 40px ${sans}`; c.fillText("LE", 0, 0); c.font = `900 150px ${sans}`; c.fillText("YETI", 60, 10); c.restore(); c.font = `italic 26px ${serif}`; c.fillText("crêpes · pizzeria", 560, 175); });
        R.plan(5.6, 1.0, lumi(fr, .3), 69, 2.85, .05); }
      { /* (10.127) la Salle d'arcade : la baie vitrée sur le couloir, la porte de bois vitrée grande ouverte, l'enseigne ; dedans, le sol de la galerie, les fenêtres sur la montagne, les bornes */
        const Z = -6.6, cad = mat({ color: 0x5a3418, roughness: .6 }), verreA = mat({ color: 0xdcecf2, roughness: .05, metalness: .3, transparent: true, opacity: .14, depthWrite: false });
        box(4.2, .35, .1, cad, 68.5, .175, Z); box(5.4, .12, .1, cad, 69.1, 2.4, Z); for (const x of [66.45, 67.8, 69.15, 70.5]) box(.09, 2.4, .12, cad, x, 1.2, Z); box(.1, 2.4, .12, cad, 71.75, 1.2, Z);
        add(new THREE.PlaneGeometry(4.05, 2.05), verreA, 68.48, 1.37, Z + .02); for (let x = 66.6; x < 70.5; x += .35) OBS.push([x, Z, .2]);
        const ens = panneau("SALLE D'ARCADE", "#160a2a", "#ff4ad8", 1024, 96, `bold 60px ${sans}`); box(5.5, .5, .1, cad, 69.1, 2.66, Z + .2); add(new THREE.PlaneGeometry(5.4, .42), lumi(ens, .9), 69.1, 2.66, Z + .26);
        { const dT = tex(64, 128, (c, w, h) => { c.fillStyle = "#7a4a26"; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 6) { c.fillStyle = "rgba(0,0,0,.15)"; c.fillRect(x, 0, 1, h); } c.fillStyle = "#c8dce4"; c.fillRect(10, 10, w - 20, 66); c.fillStyle = "rgba(255,255,255,.4)"; c.fillRect(13, 13, 6, 60); });
          const d = box(.05, 2.1, 1.05, mat({ map: dT, roughness: .6 }), 71.65, 1.07, Z - .55); void d; box(.04, .04, .18, mat({ color: 0xb8bcc0, metalness: .7 }), 71.6, 1.05, Z - .95); OBS.push([71.6, Z - .55, .25]); }   // (la porte grande ouverte, rabattue contre le mur)
        // les fenêtres du fond, sur la montagne
        const mT = tex(256, 192, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h * .6); g.addColorStop(0, "#5aa0e0"); g.addColorStop(1, "#cfe4f4"); c.fillStyle = g; c.fillRect(0, 0, w, h);
          c.fillStyle = "#8a9aa8"; c.beginPath(); c.moveTo(0, 110); c.lineTo(50, 60); c.lineTo(90, 85); c.lineTo(150, 30); c.lineTo(205, 80); c.lineTo(256, 55); c.lineTo(256, 192); c.lineTo(0, 192); c.fill();
          c.fillStyle = "#f6f8fa"; c.beginPath(); c.moveTo(130, 50); c.lineTo(150, 30); c.lineTo(172, 54); c.lineTo(160, 50); c.lineTo(150, 58); c.lineTo(140, 48); c.fill(); c.beginPath(); c.moveTo(38, 72); c.lineTo(50, 60); c.lineTo(63, 70); c.fill();
          c.fillStyle = "#6a8a3a"; c.beginPath(); c.moveTo(0, 140); c.quadraticCurveTo(120, 100, 256, 130); c.lineTo(256, 192); c.lineTo(0, 192); c.fill(); c.fillStyle = "#2a4a2a"; for (let k = 0; k < 30; k++) { const x = (k * 37) % w, y = 135 + (k * 13) % 50; c.beginPath(); c.moveTo(x, y - 14); c.lineTo(x + 5, y); c.lineTo(x - 5, y); c.fill(); } });
        for (const x of [67.8, 70.4]) { add(new THREE.PlaneGeometry(1.7, 1.3), lumi(mT, .7), x, 1.55, -10.92); box(1.8, .08, .1, blancP, x, 2.24, -10.9); box(1.8, .1, .16, blancP, x, .88, -10.88); for (const dx of [-.87, 0, .87]) box(.06, 1.3, .1, blancP, x + dx, 1.55, -10.9); }
        // (10.127) les quatre bornes Super Nintendo, chacune à la décoration de son jeu ; devant, on y joue
        const titre = (c, txt, y, px, f1, f2, w) => { c.font = `italic 900 ${px}px Arial`; c.textAlign = "center"; c.lineWidth = px / 5; c.strokeStyle = f2; c.strokeText(txt, w / 2, y); c.fillStyle = f1; c.fillText(txt, w / 2, y); };
        const TH = {
          sf2: { nom: "Street Fighter II", c1: "#ffd23a", fl: (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#1a3ab8"); g.addColorStop(1, "#0a0a3a"); c.fillStyle = g; c.fillRect(0, 0, w, h); c.fillStyle = "#f4f4f2"; c.beginPath(); c.arc(w / 2, 60, 22, 0, 7); c.fill(); c.fillStyle = "#d8202a"; c.fillRect(w / 2 - 22, 48, 44, 8); c.fillStyle = "#f4f4f2"; c.fillRect(w / 2 - 16, 82, 32, 50); c.fillStyle = "#d8202a"; c.fillRect(w / 2 - 30, 90, 60, 16); c.save(); c.translate(w / 2, 200); c.rotate(-Math.PI / 2); titre(c, "SF II", 10, 36, "#ffd23a", "#c8202a", 0); c.restore(); },
            mq: (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#ffb02a"); g.addColorStop(1, "#d83a1a"); c.fillStyle = g; c.fillRect(0, 0, w, h); titre(c, "STREET FIGHTER II", 44, 30, "#ffe85a", "#1a1a8a", w); } },
          ff2: { nom: "Final Fight 2", c1: "#ffd228", fl: () => {}, mq: () => {} },
          sunset: { nom: "Sunset Riders", c1: "#ffa42a", fl: (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#ff7a1a"); g.addColorStop(.5, "#ffc84a"); g.addColorStop(1, "#8a3a1a"); c.fillStyle = g; c.fillRect(0, 0, w, h); c.fillStyle = "#fff0a0"; c.beginPath(); c.arc(w / 2, 110, 24, 0, 7); c.fill(); c.fillStyle = "#3a1a0a"; c.fillRect(0, 150, w, h); c.beginPath(); c.ellipse(w / 2, 60, 26, 7, 0, 0, 7); c.fill(); c.fillRect(w / 2 - 12, 42, 24, 18); c.fillRect(10, 120, 6, 30); c.fillRect(4, 128, 18, 5); c.save(); c.translate(w / 2, 220); c.rotate(-Math.PI / 2); titre(c, "SUNSET", 10, 26, "#ffe85a", "#6a1a0a", 0); c.restore(); },
            mq: (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#ff5a1a"); g.addColorStop(1, "#ffc84a"); c.fillStyle = g; c.fillRect(0, 0, w, h); titre(c, "SUNSET RIDERS", 44, 32, "#fff4c0", "#5a1a0a", w); } },
          dkc: { nom: "Donkey Kong Country", c1: "#5aff6a", fl: (c, w, h) => { c.fillStyle = "#1a5a2a"; c.fillRect(0, 0, w, h); for (let k = 0; k < 14; k++) { c.fillStyle = k % 2 ? "#2a8a3a" : "#3aa04a"; c.beginPath(); c.ellipse((k * 23) % w, (k * 41) % h, 18, 7, k, 0, 7); c.fill(); } c.fillStyle = "#8a4a1a"; c.fillRect(w / 2 - 18, 150, 36, 44); c.fillStyle = "#5a2a0a"; c.fillRect(w / 2 - 18, 160, 36, 4); c.fillRect(w / 2 - 18, 180, 36, 4); c.fillStyle = "#ffe03a"; for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(w / 2 - 8 + k * 8, 70, 20, .2, 1.6); c.lineWidth = 8; c.strokeStyle = "#ffe03a"; c.stroke(); } c.save(); c.translate(w / 2, 240); c.rotate(-Math.PI / 2); titre(c, "DK", 10, 40, "#ffe03a", "#6a2a0a", 0); c.restore(); },
            mq: (c, w, h) => { c.fillStyle = "#1a4a1a"; c.fillRect(0, 0, w, h); titre(c, "DONKEY KONG COUNTRY", 44, 26, "#ffe03a", "#6a2a0a", w); } } };
        const BS = [];
        const borne = (x, z, ry, cle) => { const T3 = TH[cle], g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry + Math.PI / 2; scene.add(g); g.userData.anime = true;   /* (10.127 : le même meuble que la borne des Goonies du bar, habillé des jaquettes du jeu) */
          const tl = new THREE.TextureLoader(), tx = f => { const t = tl.load("images/arcade/" + cle + "-" + f + ".jpg?v=1"); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
          chargerGLB("goonies/img/borne3d.glb?v=1b").then(sc => { if (!sc) return; const m = sc.clone(true); m.scale.setScalar(.01); m.updateMatrixWorld(true);
            const b = new THREE.Box3().setFromObject(m), c = b.getCenter(new THREE.Vector3()); m.position.set(-c.x, -b.min.y, -c.z); m.updateMatrixWorld(true);
            const plan = (o, axe) => { const geo = o.geometry.clone(), pos = geo.attributes.position, v = new THREE.Vector3(), pts = [], bb = new THREE.Box3();
              for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld); pts.push(v.clone()); bb.expandByPoint(v); }
              const uv = new Float32Array(pos.count * 2), sz = bb.getSize(new THREE.Vector3()), cz = (bb.min.z + bb.max.z) / 2;
              pts.forEach((q, i) => { let u = axe === "x" ? (q.x - bb.min.x) / sz.x : (bb.max.z - q.z) / sz.z; if (axe === "x" && cz < 0) u = 1 - u; uv[i * 2] = u; uv[i * 2 + 1] = (q.y - bb.min.y) / sz.y; });
              geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); o.geometry = geo; };
            const mt = (map, l) => new THREE.MeshStandardMaterial({ map, roughness: .45, emissive: l ? 0xffffff : 0, emissiveMap: l ? map : null, emissiveIntensity: l || 0 }), cote = tx("cote"), noir = new THREE.MeshStandardMaterial({ color: 0x15100c, roughness: .55 });
            m.traverse(o => { if (!o.isMesh) return; const n = o.name;
              if (/lateral/i.test(n)) { plan(o, "x"); o.material = mt(cote); }
              else if (/crt_screen/i.test(n)) { plan(o, "z"); o.material = mt(tx("ecran"), 1.05); }
              else if (/logo_haut/i.test(n)) { plan(o, "z"); o.material = mt(tx("fronton"), 1.1); }
              else if (/bas_avant/i.test(n)) { plan(o, "z"); o.material = mt(tx("bas")); }
              else if (/vitre/i.test(n)) o.material = new THREE.MeshStandardMaterial({ color: 0x223040, transparent: true, opacity: .14, roughness: .05, metalness: .3, depthWrite: false });
              else if (/jooysticks_Mat25|Haut_parleurs/i.test(n)) o.material = new THREE.MeshStandardMaterial({ color: 0xc81e1e, roughness: .35 });
              else if (/dessus|arriere|dessous|tiroir|oblique/i.test(n)) o.material = noir; });
            g.add(m); });
          OBS.push([x, z, .5]); BS.push([x + Math.sin(ry) * .85, z + Math.cos(ry) * .85, cle, T3.nom]); };
        borne(66.85, -8.0, Math.PI / 2, "sf2"); borne(66.85, -9.6, Math.PI / 2, "ff2"); borne(71.35, -8.7, -Math.PI / 2, "sunset"); borne(71.35, -10.2, -Math.PI / 2, "dkc");
        L.bornesSNES = BS.map(([x, z, k, n]) => [-x, z, k, n]); }   // (les coordonnées du monde : x retourné par le miroir)   /* (10.141 : en face du Yéti, un magasin) */ { const Rg2 = repere(D2_, "zmin"); porteBlanche(Rg2, 64.6); porteBlanche(Rg2, 60.6); } extincteur(64.6, -5.2);
      const lg = tex(256, 256, (c, w, h) => { c.clearRect(0, 0, w, h); c.strokeStyle = "#c83a3a"; c.lineWidth = 8; c.beginPath(); c.arc(128, 128, 100, .3, 5.6); c.stroke(); c.strokeStyle = "#8a8e92"; c.lineWidth = 5; c.beginPath(); c.arc(128, 128, 76, 2, 7.4); c.stroke(); c.fillStyle = "#5a5e62"; c.font = `bold 22px ${sans}`; c.textAlign = "center"; c.fillText("LE CORBIER", 128, 136); });
      repere(D2_, "zmin").plan(1.3, 1.3, mat({ map: lg, transparent: true, roughness: .8 }), 62.6, 1.7, .03); }
    // E : le hall ; au fond à gauche l'opticien (Trompe l'Œil), les Pains spéciaux et leurs ardoises, le salon de thé ; à droite le pilier, la grosse poubelle ; le panneau vert suspendu
    { const E_ = Pn("E"), E2 = Pn("E2");
      boutique(E2, "xmin", -15, -11.4, { nom: "TROMPE L'ŒIL", fond: "#f4f2ee", coul: "#1a1a1a", motif: "optique", porte: "gauche", cadre: 0x6a7078, police: `bold 64px ${serif}` });
      boutique(E2, "xmin", -11.3, -8.1, { nom: "Pains spéciaux · Viennoiseries", fond: "#3a2418", coul: "#f2e2c0", motif: "pain", porte: "droite", police: `italic bold 46px ${serif}` });
      { const R = repere(E2, "xmin"); R.plan(1.6, .4, lumi(panneau("APOLLO", "#1e1e1e", "#f2f2ee", 256, 64, `bold 40px ${sans}`), .5), -9, 3.0, .12);
        R.plan(1.8, .32, lumi(panneau("la Panetière", "#4a2a18", "#f2e2c0", 256, 48, `italic bold 30px ${serif}`), .4), -9.7, 2.65, .16); }
      { const lg = tex(256, 256, (c, w, h) => { c.clearRect(0, 0, w, h); c.strokeStyle = "#c83a3a"; c.lineWidth = 8; c.beginPath(); c.arc(128, 128, 100, .3, 5.6); c.stroke(); c.strokeStyle = "#8a8e92"; c.lineWidth = 5; c.beginPath(); c.arc(128, 128, 76, 2, 7.4); c.stroke(); });
        repere(E_, "zmin").plan(1.2, 1.2, mat({ map: lg, transparent: true, roughness: .8 }), 56.4, 1.8, .03); }
      ardoise(41.6, -9.2, -1.2, ["PAINS", "Baguette 1,10", "Tradition 1,30", "Croissant 1,20", "Pain au choc. 1,40"]); ardoise(42.0, -11.6, -1.5, ["Menu du jour", "Croque", "Sandwich", "Quiche"]);
      poubelle(42.2, -7.2); pilier(51.6, -5.2); pilier(52.2, -14.6);
      const gv = panneau("Galerie BASSE  ↑", "#2a7a4a", "#ffffff", 512, 80, `bold 36px ${sans}`); box(.06, .3, 1.6, lumi(gv, .5), 50, 2.85, -9); for (const sz of [-.6, .6]) box(.02, .3, .02, noirP, 50, 3.1, -9 + sz); }
    /* (10.143) côté galerie, les mêmes boutiques que sur la promenade : on y entre devant, on en ressort derrière */
    { const PZ = [["H", 4, 16], ["G", 16, 30], ["F", 30, 40], ["E2", 40, 52], ["E", 52, 58], ["D2", 58, 66]];   /* (10.144) côté galerie, les vitrines des boutiques de la promenade : chacune traverse */
      for (const l of LIGNES) { if (!l.g || l.id === "sherpa") continue; for (const [n, g0, g1] of PZ) { const u0 = Math.max(l.x0 + .12, g0 + .1), u1 = Math.min(l.x1 - .12, g1 - .1); if (u1 - u0 >= 1.0) boutique(Pn(n), "zmax", u0, u1, { ...l.g, porte: "milieu", traversant: true }); } } }
    // F : le couloir de la fresque (à gauche), le tableau ; à droite les portes de pin ; les chevalets à l'entrée
    { const F_ = Pn("F"), R = repere(F_, "zmin"), fr = tex(1024, 256, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#b8ccdc"); g.addColorStop(1, "#e8eef2"); c.fillStyle = g; c.fillRect(0, 0, w, h);
        for (const [x0, hh, col] of [[0, 120, "#8a949e"], [180, 160, "#9aa4ae"], [420, 190, "#7a848e"], [700, 150, "#8a949e"]]) { c.fillStyle = col; c.beginPath(); c.moveTo(x0 - 80, h); c.lineTo(x0 + 120, h - hh); c.lineTo(x0 + 360, h); c.fill(); c.fillStyle = "#f6f8fa"; c.beginPath(); c.moveTo(x0 + 70, h - hh + 40); c.lineTo(x0 + 120, h - hh); c.lineTo(x0 + 175, h - hh + 45); c.fill(); }
        c.fillStyle = "#3a4a3a"; for (let i = 0; i < 90; i++) { const x = al() * w, y = h - 20 - al() * 40; c.beginPath(); c.moveTo(x, y - 18); c.lineTo(x - 6, y); c.lineTo(x + 6, y); c.fill(); } });
      R.plan(6.6, 2.0, lumi(fr, .3), 36.4, 1.55, .07); R.boite(6.8, 2.2, .04, mat({ color: 0xf8f8f6 }), 36.4, 1.55, .025);
      const cadreT = tex(128, 96, (c, w, h) => { c.fillStyle = "#5a3a1e"; c.fillRect(0, 0, w, h); c.fillStyle = "#c8d4dc"; c.fillRect(10, 10, w - 20, h - 20); c.fillStyle = "#6a7a5a"; c.fillRect(10, 50, w - 20, 36); }); R.plan(1.1, .8, lumi(cadreT, .2), 31.6, 1.7, .03);
      const Rz = repere(F_, "zmax"), pB = mat({ map: tex(64, 128, (c, w, h) => { c.fillStyle = "#a8743e"; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 8) { c.fillStyle = "rgba(90,50,20,.25)"; c.fillRect(x, 0, 1, h); } c.fillStyle = "#c8ccd0"; c.fillRect(w - 14, 62, 8, 4); }), roughness: .7 });
      void Rz; void pB;
      chevalet(44.6, -8.4, 2.0); chevalet(41.6, -7.3, 1.4); }
    // G : le hall des cartes postales ; à gauche les présentoirs ; le pilier ; le coffret gris ; à droite Sport 2000
    { const G_ = Pn("G"); boutique(G_, "zmin", 18.6, 28.6, { nom: "CARTES POSTALES · SOUVENIRS", fond: "#f4f2ee", coul: "#2a3a6a", motif: "souv", porte: "gauche", cadre: 0x8a8e92 });
      for (const [x, z] of [[27.6, -10.6], [26.6, -10.4], [25.5, -10.7], [24.3, -10.5], [22.6, -10.6], [21.4, -10.4]]) presentoir(x, z); pilier(22.4, -6.4);
      // en face, le pan de mur gris clair et son coffret ; le couloir continue à sa droite
      { const mg = matMur("blanc", 4.6, 3.1); box(.12, .7, .5, mat({ color: 0x9a9ea2, roughness: .5, metalness: .3 }), 16.1, 1.7, -9.6); void mg; } }
    // H : la boulangerie au fond ; sa grande vitrine réfrigérée le long du mur ; la barrière de bois blanc, à droite
    /* (10.157) la boulangerie La Panetière fait l'angle : tout en vitres ; à gauche, dans l'angle, la porte ; derrière les vitres, la grande vitrine des gâteaux et le comptoir,
       les étagères de pain au mur ; à droite, le salon de thé (tables, chaises) ; au fond, la porte qui donne dehors */
    { const H_ = Pn("H"), BO = Pn("BO"); void H_; const X = 4, z0 = -7.4, z1 = -3.2, cadre = mat({ color: 0x5a3418, roughness: .6 }), verre = mat({ color: 0xdcecf2, roughness: .04, metalness: .3, transparent: true, opacity: .12, depthWrite: false });
      // la façade vitrée, ses montants, son bandeau d'enseigne ; la porte dans l'angle gauche
      /* (10.166 : la porte à droite ; à gauche, derrière la vitre, la vitrine des gâteaux) */
      add(new THREE.PlaneGeometry(z1 - z0 - 1.2, 2.3), verre, X, 1.25, (z0 + z1 - 1.2) / 2, Math.PI / 2); box(.1, .3, z1 - z0 - 1.2, cadre, X, .15, (z0 + z1 - 1.2) / 2);
      for (let z = z0; z <= z1 - 1.2 + .01; z += (z1 - z0 - 1.2) / 3) box(.1, 2.5, .1, cadre, X, 1.25, z);
      box(.12, .1, z1 - z0, cadre, X, 2.5, (z0 + z1) / 2); box(.1, 2.5, .1, cadre, X, 1.25, z1);
      { const vg = mat({ color: 0xdcecf2, roughness: .05, transparent: true, opacity: .22, depthWrite: false }); box(.6, .85, 2.6, mat({ color: 0x5a3418, roughness: .6 }), X - .55, .43, z0 + 1.5); box(.52, .55, 2.5, lumi(tex(512, 64, MARCH.gateau), .55), X - .55, 1.13, z0 + 1.5); box(.56, .04, 2.6, vg, X - .55, 1.42, z0 + 1.5); for (let z = z0 + .4; z < z0 + 2.8; z += .6) OBS.push([X - .55, z, .4]); }
      porteBat(X, 1.2, z1 - .05, 0, -1, -1, 1.1, 2.3, mat({ map: tT(64, 128, (c, w, h) => { c.fillStyle = "#5a3418"; c.fillRect(0, 0, w, h); c.fillStyle = "#c8dce4"; c.fillRect(8, 8, w - 16, h - 30); c.fillStyle = "#f4f2ea"; c.fillRect(12, 50, w - 24, 16); }), roughness: .5 }), X, z1 - .6);
      for (let z = z0; z < z1 - 1.25; z += .4) OBS.push([X - .05, z, .25]);
      { const pm = lumi(panneau("La Panetière · Boulangerie · Pâtisserie", "#5a2a14", "#f4e2c0", 1024, 80, `italic bold 44px ${serif}`), .5); box(.06, .38, z1 - z0 - .2, pm, X + .22, 2.66, (z0 + z1) / 2); }
      // dedans : la grande vitrine réfrigérée des gâteaux, le comptoir, la caisse ; au mur, les étagères de pain
      const vit = mat({ color: 0xdcecf2, roughness: .05, transparent: true, opacity: .22, depthWrite: false });
      box(.75, .95, 2.6, mat({ color: 0x5a3418, roughness: .6 }), 1.6, .48, z0 + 2.1); box(.68, .5, 2.5, lumi(tex(512, 64, MARCH.gateau), .55), 1.6, 1.2, z0 + 2.1); box(.04, .55, 2.6, vit, 1.98, 1.22, z0 + 2.1); box(.72, .04, 2.6, vit, 1.6, 1.5, z0 + 2.1);
      box(.7, 1.0, .9, mat({ color: 0x6a4a2e }), 1.6, .5, z0 + 3.8); box(.35, .25, .3, mat({ color: 0x2a2a2c }), 1.6, 1.13, z0 + 3.8);
      for (let z = z0 + .8; z < z0 + 4.2; z += .8) OBS.push([1.6, z, .5]);
      /* (10.127 : le mur de pains retiré, il bouchait la porte) */
      // le salon de thé, à droite : les tables rondes, les chaises bistrot
      for (const [tx, tz] of [[-.4, z1 - .7], [-2.4, z1 - .7], [-.4, z1 - 1.8], [-2.4, z1 - 1.8]]) { cyl(.32, .32, .04, mat({ color: 0xf2f0ea, roughness: .4 }), tx, .74, tz, 14); cyl(.03, .04, .72, mat({ color: 0x2a2a2c }), tx, .37, tz, 6);
        for (const sx of [-.48, .48]) { box(.36, .04, .36, mat({ color: 0x6a3a1e }), tx + sx, .46, tz); box(.04, .42, .34, mat({ color: 0x6a3a1e }), tx + sx * 1.38, .7, tz); SIEGE(tx + sx, tz, sx > 0 ? -Math.PI / 2 : Math.PI / 2); } OBS.push([tx, tz, .65]); }
      // au fond, la porte qui donne dehors (sur la promenade)
      void BO;   // (10.165 : au fond, un mur plein — plus de porte)
      for (const x of [-3, 1]) box(1.2, .05, .45, neon, x, 2.87, (z0 + z1) / 2);
      boutique(H_, "zmin", 8.6, 15.6, { nom: "LA BOUTIQUE DU SKIEUR", fond: "#f2f2ee", coul: "#2a3a6a", motif: "chaussures", porte: "gauche", cadre: 0x8a8e92 });
    }
    // H2 : on longe la vitrine (à droite), la porte blanche à barre anti-panique (à gauche) ; en face, la lumière des grandes fenêtres
    { const H2 = Pn("H2"), Rp = repere(H2, "xmin"); void Rp;   /* (10.136 : la porte de service à barre anti-panique, sur le mur blanc) */
      Rp.boite(.9, .7, .04, mat({ color: 0x8a6a4a }), -14.6, 2.1, .02); Rp.plan(.8, .6, lumi(tex(64, 48, (c, w, h) => { c.fillStyle = "#e8eef2"; c.fillRect(0, 0, w, h); c.fillStyle = "#c8a070"; c.fillRect(20, 20, 24, 20); }), .2), -14.6, 2.1, .05); }
    // I : le couloir des grandes fenêtres (à gauche) et leur balustrade de pin ; le pilier rouge ; le renfoncement ; au bout, l'affiche Intersport sur les lambris
    { const I_ = Pn("I"); reserve("I", "zmin", -14, 8); const R = repere(I_, "zmin"), pin2 = pinM(8);
      R.boite(22, .5, .2, pin2, -3, .25, 0); R.boite(22, .4, .2, blancP, -3, 2.7, 0); R.plan(22, 2.0, mat({ color: 0xdcecf2, roughness: .05, transparent: true, opacity: .1, depthWrite: false }), -3, 1.5, .02);
      for (let u = -13.9; u < 8; u += 2.2) R.boite(.12, 2.0, .16, pin2, u, 1.5, .02); balustrade(-13.8, -19.75, 7.8, -19.75, false);
      { const rouge = mat({ color: 0xc8202a, roughness: .5 }), eT = tT(128, 192, (c, w, h) => { c.fillStyle = "#c8202a"; c.fillRect(0, 0, w, h); c.fillStyle = "#f4f2ee"; c.fillRect(8, 8, w - 16, 26); c.fillStyle = "#c8202a"; c.font = `bold 15px ${sans}`; c.textAlign = "center"; c.fillText("EXTINCTEUR", w / 2, 27);
          c.fillStyle = "#9aaab4"; c.fillRect(16, 44, w - 32, h - 60); c.fillStyle = "rgba(255,255,255,.35)"; c.fillRect(20, 48, 10, h - 68); c.fillStyle = "#d01c1c"; c.fillRect(46, 70, 36, 100); c.beginPath(); c.arc(64, 70, 18, Math.PI, 0); c.fill(); c.fillStyle = "#1a1a1a"; c.fillRect(58, 46, 12, 10); c.fillRect(70, 50, 22, 5); c.fillStyle = "#f4f2ee"; c.fillRect(50, 110, 28, 22); });
        box(.55, .85, .26, rouge, 1.6, 1.35, -17.13); const fr = add(new THREE.PlaneGeometry(.53, .83), mat({ map: eT, roughness: .4 }), 1.6, 1.35, -17.265, Math.PI); void fr; }   /* (10.127 : le coffre rouge accroché au mur, l'extincteur derrière sa vitre — à la place du grand pilier) */
      { const Rz = repere(I_, "zmax"); Rz.boite(1.8, 2.5, .05, mat({ color: 0x5a5e64, roughness: .8 }), -2, 1.25, .02); }
      for (const [x, z, h] of [[-9, -24, 14], [-2, -26.5, 12], [4.5, -23.5, 11], [-13, -27, 13]]) sapin(x, z, h, melezeM); bouleau(1.5, -23, 10); bouleau(-6, -22.6, 9);
      const Rx = repere(I_, "xmin"); Rx.boite(3, 1.1, .04, pinM(2), -18.5, .55, .02);
      const af = tex(1024, 512, (c, w, h) => { c.fillStyle = "#f4f4f2"; c.fillRect(0, 0, w, h); c.fillStyle = "#1a1a1a"; c.fillRect(0, 0, w, 14); c.fillRect(0, h - 14, w, 14);
        c.fillStyle = "#c8202a"; c.font = `bold 64px ${sans}`; c.textAlign = "center"; c.fillText("PLUS TÔT VOUS RÉSERVEZ", w / 2, 100); c.fillStyle = "#2a2a2a"; c.font = `italic 34px ${sans}`; c.fillText("THE EARLIER YOU BOOK", w / 2, 150);
        c.fillStyle = "#1a3a8a"; c.font = `italic bold 130px ${sans}`; c.fillText("intersport.fr", w / 2, 300); c.fillStyle = "#2a2a2a"; c.font = `28px ${sans}`; c.fillText("sur la location de skis en ligne", w / 2, 350); c.fillStyle = "#c8202a"; c.font = `bold 64px ${sans}`; c.fillText("MOINS VOUS PAYEZ !", w / 2, 440); });
      Rx.boite(2.9, 1.5, .06, noirP, -18.5, 1.95, .03); Rx.plan(2.8, 1.4, lumi(af, .45), -18.5, 1.95, .07); }
    // J : à droite la pharmacie (sa croix verte) et le présentoir Nutergia contre le pilier ; en face, la balustrade de pin et son banc
    { const J_ = Pn("J"); boutique(J_, "zmax", -13.0, -7.1, { nom: "PHARMACIE DU CORBIER", fond: "#2a7a3a", coul: "#fff", motif: "pharma", porte: "milieu", cadre: 0xc8a070 });   /* (10.137 : en face, la vitrine et la double porte vitrée de la pharmacie) */
      { const ct = panneau("✚", "#2a9a4a", "#ffffff", 128, 128, `bold 100px ${sans}`); box(.6, .6, .06, lumi(ct, .8), -7.6, 2.45, -8.0); }
      { const nt = tex(128, 256, (c, w, h) => { c.fillStyle = "#1a5ab8"; c.fillRect(0, 0, w, h); c.fillStyle = "#fff"; c.font = `bold 18px ${sans}`; c.fillText("Nutergia", 14, 30); c.font = `bold 14px ${sans}`; c.fillText("ERGYPHILUS", 14, 70); c.font = `11px ${sans}`; c.fillText("L'expertise", 14, 92); c.fillText("probiotiques", 14, 106); c.fillStyle = "#e8eef4"; c.fillRect(20, 130, 88, 90); c.fillStyle = "#2a9a4a"; c.fillRect(44, 150, 40, 50); });
        pilier(-13.55, -8.2, blancP, .7); box(.9, 1.9, .06, lumi(nt, .35), -13.05, 1.25, -8.62); } }
    // K : à gauche les placards de pin, l'armoire à incendie rouge, les portes grises ; le chat qui dort ; à droite la balustrade qui continue
    { const K_ = Pn("K"), R = repere(K_, "zmin"); R.boite(1.6, 2.2, .5, pinM(1), -16.6, 1.1, .25); OBS.push([-16.6, -10.7, .9]); R.boite(1.4, 2.3, .06, pinM(1), -20, 1.15, .03);
      const ria = panneau("R.I.A.", "#c8202a", "#ffffff", 128, 96, `bold 30px ${sans}`); R.boite(.9, .75, .4, mat({ color: 0xc8202a, roughness: .5 }), -18.3, 1.7, .2); R.plan(.8, .6, lumi(ria, .3), -18.3, 1.7, .29);
      porteBlanche(R, -22.4); balustrade(-18.4, -7.75, -14.2, -7.75, true); chat(-21.4, -10.4);
      boutique(K_, "zmax", -20.6, -18.6, { nom: "", fond: "#1e1e22", coul: "#1e1e22", motif: "souv", porte: "aucune", cadre: 0x2a2a2e });   /* (10.138 : au bout à droite, la vitrine sombre) */
      { const mb = matMur("blanc", 1, 2.8); box(.2, 2.8, .6, mb, -24.07, 1.4, -10.7); box(.2, .5, 3.5, mb, -24.07, 2.55, -9.25); box(.24, .1, 2.9, mat({ color: 0x5a3a26 }), -24.07, 2.3, -9.1); OBS.push([-24.07, -10.7, .4]); }   /* (l'ouverture encadrée vers le hall final) */
      sortie(-23.9, 2.4, -9.2, Math.PI / 2); }
    // le sas de l'École du Ski : à droite l'escalier qui descend (fermé par sa rampe), en face deux paires de portes battantes vers la galerie
    { const M_ = Pn("M"), R = repere(M_, "xmin"); reserve("M", "xmin", -6.2, -3.25); const gr = mat({ color: 0x5a5e64, roughness: .7 }), rp = mat({ color: 0xb8bcc0, metalness: .6, roughness: .3 });
      for (let k = 0; k < 12; k++) box(.24, .18, 2.5, gr, -35.36 - k * .24, -.09 - k * .2, -4.91);   // (10.127 : l'escalier face à soi, il descend tout droit devant)
      { const mw = matMur("blanc", 3, 5.4), noirC = mat({ color: 0x0a0a0c, roughness: 1 }); box(.12, 5.4, 2.74, mw, -38.5, 0, -4.91); for (const z of [-3.54, -6.28]) box(3.3, 5.4, .12, mw, -36.85, 0, z);
        box(3.2, .05, 2.6, noirC, -36.85, -2.7, -4.91); box(.05, 2.4, 2.5, noirC, -38.4, -1.5, -4.91); box(3.2, .08, 2.6, mat({ map: T.dalles }), -36.85, 2.62, -4.91); }
      for (const z of [-3.66, -6.16]) { const r = box(3.4, .05, .05, rp, -36.8, -.2, z); r.rotation.z = Math.atan2(2.4, 2.88); for (let k = 0; k < 4; k++) box(.04, .95, .04, rp, -35.4 - k * .7, .48 - k * .58, z); }   // les mains courantes, de chaque côté
      for (let z = -3.7; z > -6.2; z -= .3) OBS.push([-35.15, z, .2]);   /* (l'étage du bas n'est pas construit : on regarde l'escalier, on ne descend pas encore) */
      void R;
      const pB = mat({ map: tex(64, 128, (c, w, h) => { c.fillStyle = "#8a5a32"; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 8) { c.fillStyle = "rgba(0,0,0,.18)"; c.fillRect(x, 0, 1, h); } c.fillStyle = "#b8ccd4"; c.fillRect(12, 14, w - 24, 50); }), roughness: .7 });
      reserve("M", "zmin", -35.2, -32.8);
      porteBat(-35.15, 1.07, -6.2, Math.PI / 2, -1, 1, 1.15, 2.1, pB, -34, -6.2); porteBat(-32.85, 1.07, -6.2, Math.PI / 2, 1, -1, 1.15, 2.1, pB, -34, -6.2);
    }
    // le couloir derrière la porte du mur en retour (x = 23), ses deux portes battantes
    { const pB = mat({ map: tex(64, 128, (c, w, h) => { c.fillStyle = "#8a5a32"; c.fillRect(0, 0, w, h); c.fillStyle = "#b8ccd4"; c.fillRect(12, 14, w - 24, 50); }), roughness: .7 });
      void pB; }
    // L : le couloir étroit — à gauche la façade gris foncé aux fenêtres cadrées de rouge et son néon, à droite les vitrines de bois et l'ardoise du 1550 ; la sortie vers l'École du Ski
    { const L_ = Pn("L"), N_ = Pn("N");
      { const R = repere(L_, "zmin"); reserve("L", "zmin", -34, -24); R.boite(10, 2.7, .05, mat({ color: 0x3a4250, roughness: .7 }), -29, 1.35, .02);
        for (const u of [-32.6, -30.4, -28.2]) { R.boite(1.1, .9, .06, mat({ color: 0xd8202a, roughness: .5 }), u, 1.55, .05); R.plan(.9, .7, lumi(tex(128, 96, MARCH.souv), .4), u, 1.55, .09); }
        R.boite(1.0, 2.1, .06, mat({ color: 0x2e3440, roughness: .6 }), -26.2, 1.05, .05); R.boite(.04, .4, .08, mat({ color: 0xb8bcc0, metalness: .7 }), -25.85, 1.0, .1);
        const neo = panneau("◆ 1550 ◆", "#2a0a0a", "#ff3a3a", 256, 96, `bold 40px ${sans}`); R.plan(.9, .34, lumi(neo, 1.0), -33.3, 2.35, .06); }
      boutique(L_, "zmax", -32.6, -26.8, { nom: "LE 1550 · Snack · Crêpes", fond: "#3a2418", coul: "#f2e2c0", motif: "pain", porte: "gauche", cadre: 0xb07a40 });
      ardoise(-28.6, -8.3, .4, ["Le 1550", "Vente à emporter", "Crêpes", "Gaufres", "Glaces", "Paninis"]);
      sortie(-34, 2.3, -3.35, Math.PI);
      // le panneau suspendu « Cadeaux Souvenirs » au-dessus de l'entrée du hall
      { const cs = tex(512, 160, (c, w, h) => { c.fillStyle = "#f4f2ee"; c.fillRect(0, 0, w, h); c.fillStyle = "#2a2a3a"; c.font = `italic bold 46px ${serif}`; c.fillText("Cadeaux", 20, 62); c.fillText("Souvenirs", 20, 120); c.fillStyle = "#1a1a1a"; c.beginPath(); c.moveTo(330, 120); c.lineTo(400, 40); c.lineTo(470, 120); c.fill(); c.fillStyle = "#c8202a"; c.fillRect(210, 128, 18, 18); });
        box(.06, .5, 1.5, lumi(cs, .45), -34.2, 2.35, -9.25); box(.04, .1, .04, noirP, -34.2, 2.65, -9.8); box(.04, .1, .04, noirP, -34.2, 2.65, -8.7); }
      // N : le hall lumineux — les boutiques de souvenirs tout autour, les présentoirs, Skiset au fond
      boutique(N_, "xmin", -14, -4.8, { nom: "CADEAUX · SOUVENIRS", fond: "#f2f2ee", coul: "#2a3a6a", motif: "souv", porte: "droite" });
      boutique(N_, "zmin", -43.6, -38.4, { nom: "SKISET · LOCATION", fond: "#1a1a1a", coul: "#f0c020", motif: "ski", porte: "gauche", saillie: "SKISET" });
      boutique(N_, "zmax", -43.6, -36.4, { nom: "SOUVENIRS DE SAVOIE", fond: "#f2f2ee", coul: "#c8202a", motif: "chaussures", porte: "droite" });
      for (const [x, z] of [[-36.4, -12.6], [-37.4, -12.8], [-38.4, -12.6], [-40, -8.6], [-41, -8.5]]) presentoir(x, z);
      { const sk = panneau("SKISET", "#f4f2ee", "#c8202a", 256, 64, `bold 40px ${sans}`); box(1.2, .3, .06, lumi(sk, .5), -41, 2.8, -12.3); } }


    /* --- les murs, les sols, les plafonds (dedans habillé, dehors : crépi ou bois sombre) --- */
    const moins = (a0, a1, trous) => { let seg = [[a0, a1]]; for (const [b0, b1] of trous) seg = seg.flatMap(([s0, s1]) => b1 <= s0 || b0 >= s1 ? [[s0, s1]] : [[s0, Math.max(s0, b0)], [Math.min(s1, b1), s1]].filter(([u, v]) => v - u > .02)); return seg; };
    for (const p of P) { const H = p.h, ex = EXT[p.ext];
      for (const cote of ["zmin", "zmax", "xmin", "xmax"]) { const [a0, a1] = cote[0] === "z" ? [p.x0, p.x1] : [p.z0, p.z1], ouv = p.ouv[cote] || [], res = RES[p.nom + cote] || [];
        for (const [s0, s1] of moins(a0, a1, ouv)) SEGS.push({ p, cote, s0, s1 });
        for (const [s0, s1] of moins(a0, a1, [...ouv, ...res])) { const L2 = s1 - s0, mi = matMur(p.mur, L2, H), c = (s0 + s1) / 2;
          const M6 = [ex, ex, ex, ex, ex, ex]; M6[{ zmin: 4, zmax: 5, xmin: 1, xmax: 0 }[cote]] = mi;   /* (xmin/xmax : le miroir de la scène retourne les faces) */
          const b = new THREE.Mesh(cote[0] === "z" ? new THREE.BoxGeometry(L2, H, .14) : new THREE.BoxGeometry(.14, H, L2), M6);
          b.position.set(cote[0] === "z" ? c : cote === "xmin" ? p.x0 - .07 : p.x1 + .07, H / 2, cote[0] === "z" ? (cote === "zmin" ? p.z0 - .07 : p.z1 + .07) : c); scene.add(b); }
        for (const [o0, o1] of ouv) { const hv = Math.min(H, hVois(p, cote, (o0 + o1) / 2)) - .3; if (H - hv > .05) { const L2 = o1 - o0, c = (o0 + o1) / 2, mi = matMur(p.mur, L2, H - hv); const b = new THREE.Mesh(cote[0] === "z" ? new THREE.BoxGeometry(L2, H - hv, .14) : new THREE.BoxGeometry(.14, H - hv, L2), mi); b.position.set(cote[0] === "z" ? c : cote === "xmin" ? p.x0 - .07 : p.x1 + .07, hv + (H - hv) / 2, cote[0] === "z" ? (cote === "zmin" ? p.z0 - .07 : p.z1 + .07) : c); scene.add(b); } } }
      const W2 = p.x1 - p.x0, D2 = p.z1 - p.z0, cx = (p.x0 + p.x1) / 2, cz = (p.z0 + p.z1) / 2;
      const st = rep(T[p.sol], W2 / (p.sol === "moquette" ? 3 : 2.4), D2 / (p.sol === "moquette" ? 3 : 2.4)), sm = lu(mat({ map: st, roughness: p.sol === "moquette" ? .95 : .35, metalness: p.sol === "moquette" ? 0 : .08, emissive: 0xffffff, emissiveMap: st, emissiveIntensity: .1 }), .1);
      if (p.pente) { const [xa, ya, xb, yb] = p.pente, yy = (x) => ya + (yb - ya) * (x - xa) / (xb - xa) + .02, g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute([-p.x0, yy(p.x0), p.z0, -p.x1, yy(p.x1), p.z0, -p.x0, yy(p.x0), p.z1, -p.x1, yy(p.x1), p.z1], 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, 1, 0, 0, 1, 1, 1], 2)); g.setIndex([0, 1, 2, 1, 3, 2]); g.computeVertexNormals(); const s = new THREE.Mesh(g, sm); scene.add(s); }
      else { const s = add(new THREE.PlaneGeometry(W2, D2), sm, cx, .055, cz); s.rotation.x = -Math.PI / 2; }
      const pt = p.plaf === "sombre" ? rep(T.sombre, W2 / 2, D2 / 2) : rep(T.dalles, W2 / 2.4, D2 / 2.4), pm = lu(mat({ map: pt, roughness: .9, emissive: 0xffffff, emissiveMap: pt, emissiveIntensity: .14 }), .14);
      const c6 = new THREE.Mesh(new THREE.BoxGeometry(W2 + .28, .12, D2 + .28), [ex, ex, mat({ color: 0x5a5852, roughness: .95 }), pm, ex, ex]); c6.position.set(cx, H + .06, cz); scene.add(c6);
      if (p.plaf === "sombre") { const along = W2 >= D2; for (let k = .8; k < (along ? W2 : D2); k += 1.4) box(along ? .14 : W2, .16, along ? D2 : .14, noirP, along ? p.x0 + k : cx, H - .08, along ? cz : p.z0 + k); }
      else plafonniers(p); }

    const PAS = (x, z) => x > 82 && x < 108.3 && z > -4.1 && z < -1.5;
    const dans = (x, z) => P.find(p => x >= p.x0 && x <= p.x1 && z >= p.z0 && z <= p.z1);
    const passage = (x, z) => { const p = dans(x, z); return !!(p && p.nofp); };
    const contreMur = (x, z) => SEGS.some(({ p, cote, s0, s1 }) => { const u = cote[0] === "z" ? x : z, d = cote === "zmin" ? z - p.z0 : cote === "zmax" ? p.z1 - z : cote === "xmin" ? x - p.x0 : p.x1 - x; return d < .3 && d > -.3 && u > s0 - .25 && u < s1 + .25; });
    return { P, marche: (x, z) => PAS(x, z) || (!!dans(x, z) && !contreMur(x, z) && !OBS.some(([a, b, r]) => (x - a) ** 2 + (z - b) ** 2 < r * r)),
      dedans: (x, z) => (x > 82 && x < 107.9 && z > -4.2 && z < -1.4) || (!!dans(x, z) && !passage(x, z) && !(z > -3.6 && ((x < -32.6 && x > -35.4) || (x > -23.2 && x < -20.6))) && !(x > 23 && x < 23.6 && z > -1.8)),
      y: (x, z) => { if (PAS(x, z) && x > 82.4) return .5; const p = dans(x, z); if (p && p.pente) { const [xa, ya, xb, yb] = p.pente; return ya + (yb - ya) * Math.min(1, Math.max(0, (x - xa) / (xb - xa))); } return null; } };
  })();
  { let tP = 0; const a2 = L.anim; L.anim = (tm) => { try { a2 && a2(tm); } catch (e) {} const dt = Math.min(.1, (tm - (tP || tm)) / 1000); tP = tm; const moi = M && M.gens && M.gens.get(M.moiNum), p = moi && moi.g && moi.g.position;
      for (const d of PORTES) { const prox = p && Math.hypot(p.x - d.g.position.x, p.z - d.g.position.z) < 2.6; d.a += ((prox ? 1.3 : 0) - d.a) * Math.min(1, dt * 4); d.g.rotation.y = -(d.base + d.sens * d.a); } }; }
  L.premiereIci = (x, z) => GAL.dedans(-x, z);
  /* (10.130) les volumes pleins des bâtiments de la façade traversent la galerie : quand on est dedans, on les cache (dehors, on les revoit) */
  L.corpsGal = scene.children.slice(0, nG0).filter(o => o.isMesh && o.material === facS && o.geometry && o.geometry.type === "BoxGeometry" && (() => { const g = o.geometry.parameters, x0 = o.position.x - g.width / 2, x1 = o.position.x + g.width / 2, z0 = o.position.z - g.depth / 2, z1 = o.position.z + g.depth / 2;
    return GAL.P.some(p => p.x0 < x1 - .05 && p.x1 > x0 + .05 && p.z0 < z1 - .05 && p.z1 > z0 + .05); })());
  { let vu = true; const a3 = L.anim; L.anim = (tm) => { try { a3 && a3(tm); } catch (e) {} const moi = M && M.gens && M.gens.get(M.moiNum), q = moi && moi.g && moi.g.position, dd = !!(q && L.premiereIci(q.x, q.z)); if (dd === !vu) return; vu = !dd; for (const o of L.corpsGal) o.visible = vu; }; }

  L.limites = (x, z) => libre(x, z) && (GAL.marche(x, z) || GALZ.some(l => x > l.x0 + .4 && x < l.x1 - .4 && z > zfAt(x) - .3 && z < zfAt(x) + .8) || (x > -48 && x < -10 && z > -3.3 && z < 7.6) || (x > 82.6 && x < 108.4 && z > -.9 && z < 16.2 && !(x > 87.2 && x < 92.8 && z < 6)) || (x > 108.2 && x < 187.6 && z > -4.1 && z < 16.2) || (x > -60.2 && x < 200 && z > 7.6 && z < 140) || (x > -110 && x < -60.2 && z > 21 && z < 140) || (x > -84 && x < -50 && z >= 10.75 && z < 21) || (x > -60.2 && x < -48.2 && z > -22 && z < 7.6)  || (x > -84 && x < -60 && z > -22 && z < -10.8) || (x > -38.6 && x < 82 && z > zfAt(x) + .5 && z < 7.6) || (x > -71.5 && x < -40.5 && z > 14 && z < 16.4) || (x > -12.6 && x < -9.8 && z > .3 && z < 1.1));
  L.hauteur = (x, z) => { const ox = -x; if (Math.abs(ox - 32) < 3 && Math.abs(z - 25) < 2) return HP(32, 25) + .5;   /* (10.137 : sur la scène) */ const gy = GAL.y(ox, z); if (gy !== null) return gy; if (ox > -42.4 && ox < -29.6 && z > -2.6 && z < 3.6) return .45; if (ox > -35.2 && ox < -33.4 && z >= 3.6 && z < 4.3) return z < 3.95 ? .34 : .17; if (ox < -60.5 && z < 10.2 && z > -10) return YP;  if (z > 30 && L.penteP && Math.abs(x) < 349 && z < 450) { const P = L.penteP, nx = 280, fx0 = (x + 350) / 2.5, fz0 = (z - 21) / 2.5, ix = Math.floor(fx0), iz = Math.floor(fz0), fx = fx0 - ix, fz = fz0 - iz, h = (a, b) => P.getY((iz + b) * (nx + 1) + ix + a) + .01;   /* (10.127 : on marche sur le sol tel qu'il est dessiné, facette par facette : les pieds ne s'enfoncent plus) */
      return fx + fz <= 1 ? h(0, 0) + (h(1, 0) - h(0, 0)) * fx + (h(0, 1) - h(0, 0)) * fz : h(1, 1) + (h(0, 1) - h(1, 1)) * (1 - fx) + (h(1, 0) - h(1, 1)) * (1 - fz); }
    return HP(ox, z); };
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
    const lim0 = L.limites; L.limites = (x, z) => lim0(-x, z); L.arretCar.x = -L.arretCar.x; L.depart = [54.5, 15]; L.zone = [-98, 83, -2, 40]; L.cam = { pos: [-26, 5, 24], vise: [-26, 3, 0] };
    for (const W of MARCH) for (const pt of W.R) pt[0] = -pt[0]; }
  /* (10.140) le petit train : il arrive de Paris (on l'a pris à un arrêt de bus), longe la rue et s'arrête au niveau de la piscine ; on l'y reprend pour rentrer.
     L'arrêt : le poteau, son panneau « Petit train — Le Corbier · Les Sybelles », les horaires */
  { const ax = 57, az = 20.4, y = L.hauteur(ax, az)   /* (10.129 : l'arrêt dans l'herbe, au pied du pré, avec son abribus) */, bl = mat({ color: 0xf4f4f0 }), bleu = mat({ color: 0x1f4fb0 });
    cyl(.05, .05, 2.6, mat({ color: 0x8a8e92, metalness: .6 }), ax - 2.6, y + 1.3, az - .4, 8);
    const pt = tT(256, 160, (c, w, h) => { c.fillStyle = "#1f4fb0"; c.fillRect(0, 0, w, h); c.fillStyle = "#fff"; c.fillRect(6, 6, w - 12, h - 12); c.fillStyle = "#1f4fb0"; c.font = `bold 30px ${sans}`; c.textAlign = "center"; c.fillText("🚂 PETIT TRAIN", w / 2, 50); c.font = `bold 20px ${sans}`; c.fillText("Le Corbier · Les Sybelles", w / 2, 88); c.fillStyle = "#3a3a3a"; c.font = `16px ${sans}`; c.fillText("Paris : toutes les heures", w / 2, 124); });
    for (const r of [0, Math.PI]) add(new THREE.PlaneGeometry(.9, .56), mat({ map: pt, side: THREE.FrontSide }), ax - 2.6, y + 2.25, az - .4, r);
    void bl; void bleu;
    busLigne(L, scene, { ax, az, voie: 18.2, sens: 1, x0: -30, x1: 96, train: true, suitSol: true,
      dest: [{ vers: "rue", nom: "Rue du Faubourg-Poissonnière (la caserne)", arrivee: [10, -4.7], yawA: 0 }, { vers: "grande", nom: "Rue d'Hauteville", arrivee: [-6, -154.6], yawA: Math.PI }, { vers: "rex", nom: "Bonne-Nouvelle (le Grand Rex)", arrivee: [-26, -10.2], yawA: 0 }] }); }
  /* (10.100) le carnet de chantier de l'administrateur : il pose le doigt (ou clique) sur un endroit, il écrit ce qu'il y veut ; la note reste là, numérotée,
     gardée par le serveur ; « Copier » met toutes les notes dans le presse-papier, pour les donner à Claude */
  { const NOTES = new THREE.Group(); NOTES.userData.anime = true; scene.add(NOTES); NOTES.visible = false;   /* (10.127 : les notes et leurs boutons retirés) */ let mode = false, liste = [];
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
    const a1 = L.anim; L.anim = (tm) => { try { a1 && a1(tm); } catch (e) {} const ici = !!(M && M.L === L && !M.cine); if (false && ici && !barre.isConnected) { C.appendChild(barre); envoyerWS({ t: "notes_corbier" }); } else if (!ici && barre.isConnected) { barre.remove(); fini(); } };   // (la barre : seulement quand on est au Corbier)
    const veille = setInterval(() => { if (!M || M.L !== L) { if (barre.isConnected) { barre.remove(); fini(); } if (!M || (M.prets && !Object.values(M.prets).some(q => q && q.L === L) && M.L !== L)) { clearInterval(veille); cv.removeEventListener("pointerdown", pd, true); cv.removeEventListener("pointerup", pu, true); cv.removeEventListener("click", clicStop, true); } } }, 1500); }
  /* (10.126) les sols en vraies textures : les coordonnées de texture suivent les mètres (une planche fait 14 cm partout, l'herbe garde sa taille) */
  { const vus = new Set(); scene.traverse(o => { const t = o.isMesh && o.material && o.material.map; if (!t || !t.userData || !t.userData.m || vus.has(o.geometry)) return; vus.add(o.geometry); const g = o.geometry, P = g.attributes.position, Nn = g.attributes.normal; if (!P) return;
      { const n = NRM.get(t.source); if (n && !o.material.normalMap && o.material.isMeshStandardMaterial) { o.material.normalMap = n; o.material.normalScale.set(.9, .9); o.material.needsUpdate = true; } } const m = t.userData.m, mu = m[0] || m, mv = m[1] || m, tourne = Math.abs(t.rotation) > .1; t.repeat.set(1, 1); t.rotation = 0; t.offset.set(0, 0); g.computeBoundingBox(); const b = g.boundingBox.min;   /* (chaque face prend ses mètres selon son orientation : le sol en x-z, les murs en x-y ou z-y, depuis le pied) */
      const U = new Float32Array(P.count * 2); for (let i = 0; i < P.count; i++) { const x = P.getX(i) - b.x, y = P.getY(i) - b.y, z = P.getZ(i) - b.z, nx = Nn ? Math.abs(Nn.getX(i)) : 0, ny = Nn ? Math.abs(Nn.getY(i)) : 0, nz = Nn ? Math.abs(Nn.getZ(i)) : 1;
        let u, v; if (ny >= nx && ny >= nz) { u = x; v = z; } else if (nx >= nz) { u = z; v = y; } else { u = x; v = y; } if (tourne) [u, v] = [v, u]; U[i * 2] = u / mu; U[i * 2 + 1] = v / mv; }
      g.setAttribute("uv", new THREE.BufferAttribute(U, 2)); }); }
  if (L.manege) { const a2 = L.anim; L.anim = (tm) => { try { a2 && a2(tm); } catch (e) {} L.manege.rotation.y = (tm || performance.now()) * .00035; }; }   // (le manège tourne doucement ; les bateaux avancent tête devant)
  { const T2 = []; for (const o of scene.children.slice()) if (o.userData && o.userData.siege != null) { const e = new THREE.Euler().setFromQuaternion(o.quaternion, "YXZ"); T2.push([o.position.x, o.position.z, e.y, o.userData.siege]); scene.remove(o); }
    L.tabourets = T2.slice(0, 199); L.nbTabouretsSalle = 0; }   /* (10.127 : les bancs et les chaises des terrasses : on s'y assoit) */
  /* (10.127, d'après les photos) la mascotte du Corbier : le chamois en costume, taille adulte — le grand visage crème, les cornes noires, l'écharpe bleue, les gants noirs, le badge ;
     le jour, il se promène sur la promenade et la terre devant (jamais dans la galerie), en saluant de la main */
  { const brun = mat({ color: 0x9a6038, roughness: .95 }), creme = mat({ color: 0xf2e2c4, roughness: .9 }), noir = mat({ color: 0x141414, roughness: .6 }), bleu = mat({ color: 0x6aa8e0, roughness: .95 }), blanc = mat({ color: 0xffffff, roughness: .5 }), rose = mat({ color: 0xc83a3a, roughness: .6 }), brunF = mat({ color: 0x6a3e22, roughness: .9 });
    const G = new THREE.Group(); G.userData.anime = true; scene.add(G); const P = (geo, m, x, y, z, par = G) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; par.add(o); return o; };
    // le corps, le ventre crème
    const corps = P(new THREE.CylinderGeometry(.3, .34, .75, 14), brun, 0, 1.12, 0); corps.scale.z = .85; P(new THREE.SphereGeometry(.26, 14, 10), creme, 0, 1.05, .13).scale.set(1, 1.35, .5);
    P(new THREE.SphereGeometry(.32, 14, 10), brun, 0, 1.47, 0).scale.set(1, .6, .85);
    // les jambes (pivots aux hanches), les bottes
    const jambes = [-1, 1].map(s2 => { const j = new THREE.Group(); j.position.set(s2 * .15, .78, 0); G.add(j); P(new THREE.CylinderGeometry(.12, .13, .62, 10), brun, 0, -.3, 0, j); P(new THREE.BoxGeometry(.24, .14, .36), brunF, 0, -.66, .06, j); return j; });
    // les bras (pivots aux épaules), les gants noirs
    const bras = [-1, 1].map(s2 => { const b = new THREE.Group(); b.position.set(s2 * .36, 1.5, 0); G.add(b); P(new THREE.CylinderGeometry(.09, .1, .6, 10), brun, 0, -.3, 0, b); P(new THREE.SphereGeometry(.11, 10, 8), noir, 0, -.64, .02, b).scale.set(1, 1.15, .8); return b; });
    // l'écharpe bleue et son pan
    P(new THREE.TorusGeometry(.2, .07, 8, 18), bleu, 0, 1.6, 0).rotation.x = Math.PI / 2; P(new THREE.BoxGeometry(.14, .42, .05), bleu, .1, 1.38, .26).rotation.z = .12;
    // le badge rond « le Corbier »
    { const bT = tT(64, 64, (c, w, h) => { c.fillStyle = "#fff"; c.beginPath(); c.arc(32, 32, 30, 0, 7); c.fill(); c.strokeStyle = "#2a3a6a"; c.lineWidth = 3; c.stroke(); c.fillStyle = "#2a3a6a"; c.beginPath(); c.moveTo(14, 34); c.lineTo(24, 18); c.lineTo(32, 28); c.lineTo(40, 16); c.lineTo(50, 34); c.fill(); c.font = "italic bold 11px Arial"; c.textAlign = "center"; c.fillText("le Corbier", 32, 48); });
      P(new THREE.CircleGeometry(.09, 18), mat({ map: bT }), -.12, 1.3, .29); }
    // la grosse tête : brune, le visage crème, les yeux, le museau, le sourire, les oreilles, les cornes noires recourbées
    const T = new THREE.Group(); T.position.set(0, 1.92, 0); G.add(T);
    P(new THREE.SphereGeometry(.3, 16, 12), brun, 0, 0, 0, T).scale.set(1.05, .95, .95); P(new THREE.SphereGeometry(.27, 16, 12), creme, 0, -.05, .1, T).scale.set(1, 1, .8);
    P(new THREE.SphereGeometry(.15, 12, 10), creme, 0, -.13, .25, T).scale.set(1.2, .8, .8);   // le museau
    P(new THREE.SphereGeometry(.05, 10, 8), noir, 0, -.08, .37, T);   // la truffe
    P(new THREE.TorusGeometry(.07, .015, 6, 12, Math.PI), rose, 0, -.18, .34, T).rotation.z = Math.PI;   // le sourire
    for (const s2 of [-1, 1]) { P(new THREE.SphereGeometry(.065, 10, 8), blanc, s2 * .1, .06, .27, T); P(new THREE.SphereGeometry(.035, 8, 6), noir, s2 * .1, .06, .325, T);
      const o = P(new THREE.SphereGeometry(.1, 10, 8), brun, s2 * .32, .08, 0, T); o.scale.set(1.3, .5, .6); o.rotation.z = s2 * -.3;
      const c2 = P(new THREE.TorusGeometry(.17, .05, 6, 14, Math.PI * .8), noir, s2 * .13, .36, -.04, T); c2.rotation.set(0, Math.PI / 2, Math.PI * .45); }
    // le chemin : la promenade, puis la terre devant, en boucle (coordonnées avant le miroir)
    const W2 = [[-28, 5], [10, 5.4], [40, 5], [60, 5.4], [62, 12.5], [30, 13.2], [-10, 12.6], [-30, 12.8]], Lg = W2.map((q, i) => Math.hypot(W2[(i + 1) % W2.length][0] - q[0], W2[(i + 1) % W2.length][1] - q[1])), tot = Lg.reduce((a2, b2) => a2 + b2, 0);
    L.mascPos = (t) => { let d = ((t * .9) % tot + tot) % tot, i = 0; while (d > Lg[i]) { d -= Lg[i]; i++; } const A2 = W2[i], B2 = W2[(i + 1) % W2.length], u = d / Lg[i];
      return { x: -(A2[0] + (B2[0] - A2[0]) * u), z: A2[1] + (B2[1] - A2[1]) * u, ry: Math.atan2(-(B2[0] - A2[0]), B2[1] - A2[1]) }; };
    L.mascotte = G; const a7 = L.anim; L.anim = (tm) => { try { a7 && a7(tm); } catch (e) {} if (!G.visible) G.visible = true;
      const t = (tm || performance.now()) / 1000, q = L.mascPos(t), x = q.x, z = L.evite ? L.evite(G.userData, q.x, q.z, Math.sin(q.ry)) : q.z; G.position.set(x, L.hauteur ? L.hauteur(x, z) : 0, z); G.rotation.y = q.ry;
      const ph = t * 5.2; jambes[0].rotation.x = Math.sin(ph) * .45; jambes[1].rotation.x = -Math.sin(ph) * .45; bras[0].rotation.x = -Math.sin(ph) * .35;
      const salut = Math.sin(t * .4) > .55; bras[1].rotation.x = salut ? 0 : Math.sin(ph) * .35; bras[1].rotation.z = salut ? 2.5 + Math.sin(t * 7) * .3 : 0; T.rotation.y = Math.sin(t * .7) * .25; }; }
  /* (10.127) la station qui vit : le jour, les joueurs de ping-pong et de badminton, les enfants du manège et ceux qui suivent la mascotte, les nageurs de la piscine,
     les gens attablés qui boivent ou mangent, les promeneurs de la galerie ; le soir, le feu d'artifice au pied de la montagne, derrière la scène (coordonnées du monde : x déjà retourné) */
  { const PEU = PETIT || MOBILE || GPU_MODESTE, JOUR = [], ANIM = [], ad = (m) => { m.userData.anime = true; scene.add(m); return m; };
    const enfant = (k) => personne3D({ enfant: true, taille: 1.05 + (k % 3) * .08, peau: PE[k % 6], ch: ["#5a3a22", "#e2c27a", "#141010", "#a5532a"][k % 4], haut: HA[(k * 3) % 8], bas: ["#26324e", "#d83a5a", "#3a3028", "#2a5ac8"][k % 4], chaussures: ["#f4f4f2", "#d83a3a", "#1a1a1a"][k % 3], coif: k % 2 ? "queue" : "court", pantalon: true });
    const H = (x, z) => L.hauteur ? L.hauteur(x, z) : 0, P = m => m.userData.parts;
    /* (10.132) l'évitement : chacun garde sa ligne, mais s'écarte en douceur de tout ce qui barre le passage (pots, bancs, tables, lampadaires, murs) */
    const OFF = [0, .5, -.5, 1, -1, 1.5, -1.5, 2.1, -2.1, 2.8, -2.8], evite = (st, x, z0, dx = 0) => { const ok = (z) => !L.limites || (L.limites(x, z) && L.limites(x + dx * .9, z));
      let b = st.o || 0; if (!ok(z0 + b)) { b = st.o || 0; for (const o of OFF) if (ok(z0 + o)) { b = o; break; } } else if (Math.abs(b) > .01) { for (const o of OFF) { if (Math.abs(o) >= Math.abs(b)) break; if (ok(z0 + o) && ok(z0 + (o + b) / 2)) { b = o; break; } } }
      st.c = (st.c ?? b) + (b - (st.c ?? b)) * .12; st.o = b; return z0 + st.c; };
    L.evite = evite;
    const eviteX = (st, x0, z, dz = 0) => { const ok = (x) => !L.limites || (L.limites(x, z) && L.limites(x, z + dz * .9)); let b = st.o || 0; if (!ok(x0 + b)) for (const o of OFF) if (ok(x0 + o)) { b = o; break; } st.c = (st.c ?? b) + (b - (st.c ?? b)) * .12; st.o = b; return x0 + st.c; };
    const raquette = (m, i = 1) => { const r = new THREE.Group(), c = P(m).bras[i].c; r.position.y = -m.userData.hipY * .38; c.add(r); const mm = new THREE.Mesh(new THREE.CylinderGeometry(.015, .015, .25, 5), mat({ color: 0x2a2a2a })); mm.position.y = -.12; r.add(mm); const t = new THREE.Mesh(new THREE.CylinderGeometry(.11, .11, .015, 12), mat({ color: 0xc8202a })); t.position.y = -.3; t.rotation.x = Math.PI / 2; r.add(t); };
    // le ping-pong : deux joueurs par table, la balle qui va et vient
    { const tabs = [LG("skiset").x0 - .5, LG("vet").x1 + 2.2, LG("pharma").x0 + 4.1, LG("patis").x0 + 6.3].slice(0, PEU ? 2 : 4);
      tabs.forEach((px, i) => { const tx = -px, tz = 9.2, J = [-1, 1].map(sg => { const m = ad(gens(i * 7 + (sg > 0 ? 2 : 5))); m.position.set(tx + sg * 1.85, H(tx, tz), tz); m.rotation.y = -sg * Math.PI / 2; raquette(m); JOUR.push(m); return m; });
        const balle = ad(new THREE.Mesh(new THREE.SphereGeometry(.03, 8, 6), mat({ color: 0xf8f4ea, emissive: 0x444444 }))); JOUR.push(balle);
        ANIM.push((t) => { const T2 = 1.1, ph = ((t + i * .37) % (2 * T2)) / T2, dir = ph < 1 ? 1 : -1, u = ph < 1 ? ph : ph - 1, x0 = tx - dir * 1.5, x1 = tx + dir * 1.5;
          balle.position.set(x0 + (x1 - x0) * u, .8 + (u < .6 ? Math.sin(u / .6 * Math.PI) * .32 : Math.sin((u - .6) / .4 * Math.PI) * .22), tz + Math.sin((t + i) * 1.7) * .4);
          J.forEach((m, k) => { const sg = k ? 1 : -1, frappe = (sg === dir ? 1 - u : u); m.userData.poser("debout", 0); const b = P(m).bras[1]; b.e.rotation.x = -.6 - Math.max(0, 1 - frappe * 5) * .9; b.e.rotation.z = .3; m.position.z = tz + Math.sin((t + i + k) * 1.7) * .3; }); }); }); }
    // le badminton : deux joueurs, le volant en cloche par-dessus le filet
    { const cz = 23, J = [-1, 1].map(sg => { const m = ad(gens(sg > 0 ? 9 : 16)); m.position.set(sg * 4, H(sg * 4, cz), cz); m.rotation.y = -sg * Math.PI / 2; raquette(m); JOUR.push(m); return m; });
      const vol = ad(new THREE.Mesh(new THREE.ConeGeometry(.04, .09, 8), mat({ color: 0xf8f8f4 }))); JOUR.push(vol);
      ANIM.push((t) => { const T2 = 1.6, ph = (t % (2 * T2)) / T2, dir = ph < 1 ? 1 : -1, u = ph < 1 ? ph : ph - 1; vol.position.set(-dir * 3.8 + dir * 7.6 * u, 1.9 + Math.sin(u * Math.PI) * 2.6, cz + Math.sin(t * .9) * .8); vol.rotation.z = dir * (u - .5) * 2;
        J.forEach((m, k) => { const sg = k ? 1 : -1, fr = sg === -dir ? u : 1 - u; m.userData.poser("debout", 0); const b = P(m).bras[1]; b.e.rotation.x = -1.2 - Math.max(0, 1 - fr * 4) * 1.6; b.e.rotation.z = .2; m.position.z = cz + Math.sin(t * .9) * .6; }); }); }
    // les enfants dans les bateaux-chiens du manège
    if (L.manege) L.manege.children.filter(b => b.isGroup).slice(0, PEU ? 3 : 5).forEach((b, k) => { const m = enfant(k + 1); m.position.set(0, .2 - m.userData.hipY * .55, -.08); m.scale.setScalar(.8); m.userData.poser("assis", 0); b.add(m); m.userData.anime = true; JOUR.push(m);
      ANIM.push((t) => { m.userData.poser("assis", t * 1000); P(m).bras[k % 2].e.rotation.x = -.6 - Math.max(0, Math.sin(t * 1.3 + k)) * 1.6; }); });
    // les enfants qui suivent la mascotte, en file
    if (L.mascPos) for (let k = 0; k < (PEU ? 2 : 4); k++) { const m = ad(enfant(k + 4)); JOUR.push(m); ANIM.push((t) => { const q = L.mascPos(t - 1.6 - k * 1.1), off = (k % 2 ? .45 : -.45); const x = q.x + Math.cos(q.ry) * off, z = evite(m.userData, x, q.z - Math.sin(q.ry) * off, Math.sin(q.ry)); m.position.set(x, H(x, z), z); m.rotation.y = q.ry; m.userData.poser("marche", t * 1000 * 1.25); if (Math.sin(t * .6 + k) > .7) P(m).bras[1].e.rotation.x = -2.6; }); }
    // les nageurs : le crawl, d'un bout à l'autre du bassin
    for (let k = 0; k < (PEU ? 2 : 4); k++) { const W3 = new THREE.Group(); ad(W3); const f = k % 2 === 1, pe = PE[(k * 2 + 1) % 6], mail = ["#1a3aa8", "#d8202a", "#1a1a1a", "#e8501a"][k];   /* (en maillot de bain : la peau nue, le slip ou le maillot une pièce, le bonnet) */
      const m = personne3D({ taille: f ? 1.66 : 1.78, peau: pe, ch: ["#2a1a12", "#e2c27a", "#141010", "#8a4a22"][k], haut: f ? mail : pe, bas: mail, chaussures: pe, coif: f ? "queue" : "court", pantalon: false, robe: false });
      { const pm = new THREE.MeshStandardMaterial({ color: pe, roughness: .7 }); for (const b of m.userData.parts.bras) b.e.children[0].material = pm; const bon = new THREE.Mesh(new THREE.SphereGeometry(.13, 12, 8, 0, Math.PI * 2, 0, Math.PI * .55), new THREE.MeshStandardMaterial({ color: ["#f4f4f2", "#f0c020", "#d8202a", "#2a8ad0"][k], roughness: .4 })); bon.position.y = .02; m.userData.parts.tete.add(bon); } m.rotation.x = Math.PI / 2; m.position.y = -.05; W3.add(m); JOUR.push(W3);
      const zL = -1 - 3.3 + k * 2.2, v = .9 + k * .12, x0 = 72.5 - 8.3, x1 = 72.5 + 8.3;
      ANIM.push((t) => { const L2 = x1 - x0, d = (t * v + k * 4) % (2 * L2), aller = d < L2, x = aller ? x0 + d : x1 - (d - L2); W3.position.set(x, YP + .16, zL); W3.rotation.y = aller ? Math.PI / 2 : -Math.PI / 2;
        const B = P(m).bras; B[0].e.rotation.x = -(t * 4 + k) % (Math.PI * 2); B[1].e.rotation.x = -(t * 4 + k + Math.PI) % (Math.PI * 2); for (const [i, J] of P(m).jambes.entries()) J.h.rotation.x = Math.sin(t * 9 + i * Math.PI) * .25; }); }
    // les gens attablés aux terrasses : ils boivent, ils mangent, ils parlent ; leurs places ne sont plus libres
    if (L.tabourets) { const pris = [], T = L.tabourets, max = PEU ? 40 : 64;   /* (10.128 : du monde aux terrasses — un peu plus d'une chaise sur deux, au hasard, les bancs aussi) */
      const cand = T.map((t, i) => i).filter(i => T[i][3] > .44 && T[i][3] < .5 && T[i][1] > -3); for (let i = cand.length - 1; i > 0; i--) { const j = Math.floor(al() * (i + 1)); [cand[i], cand[j]] = [cand[j], cand[i]]; }
      pris.push(...cand.slice(0, Math.min(max, Math.round(cand.length * .62))));   /* (10.129 : tirées au hasard sur toutes les terrasses : La Picoraille aussi a son monde) */
      pris.forEach((i, k) => { const [x, z, ry, h] = T[i], m = ad(gens(k * 3 + 4)); m.position.set(x, H(x, z) + h + .04 - m.userData.hipY, z); m.rotation.y = ry; JOUR.push(m); const mange = k % 3 === 1;
        const v = new THREE.Mesh(new THREE.CylinderGeometry(.035, .03, .12, 8), mat({ color: mange ? 0xd8d8d8 : 0xe8a020, transparent: !mange, opacity: .85 })); v.position.y = -m.userData.hipY * .36; P(m).bras[1].c.add(v);
        ANIM.push((t) => { m.userData.poser("assis", t * 1000); const ph = (t + k * 1.7) % (mange ? 3 : 6); if (ph < 1.2) { const b = P(m).bras[1]; b.e.rotation.x = -1.1; b.c.rotation.x = -1.6; } }); });
      L.tabourets = T.filter((_, i) => !pris.includes(i)); }
    // (10.128) les promeneurs de la promenade et du chemin de terre : ils vont et viennent, chacun à son pas
    for (let k = 0; k < (PEU ? 10 : 20); k++) { const m = ad(gens(k * 5 + 2)), z0 = [4.4, 5.6, 2.4, 11.6, 4.9, 13][k % 6], v = .9 + (k % 4) * .18, xa = -60, xb = 46, L2 = xb - xa, ph = k * 23.7; JOUR.push(m);
      const st = {}; ANIM.push((t) => { const d = (t * v + ph) % (2 * L2), aller = d < L2, x = aller ? xa + d : xb - (d - L2), z = evite(st, x, z0 + Math.sin(t * .3 + k) * .35, aller ? 1 : -1);
        m.position.set(x, H(x, z), z); m.rotation.y = aller ? Math.PI / 2 : -Math.PI / 2; m.userData.poser("marche", t * 1000 * v); }); }
    // (10.132) la promenade à poney, le jour : un enfant sur le poney, l'adulte devant qui le tient par la longe ; ils font des allers-retours sur le chemin de terre
    { const G3 = new THREE.Group(); ad(G3); JOUR.push(G3); const robe = mat({ color: 0x8a5a32, roughness: .9 }), crin = mat({ color: 0x2a1a10, roughness: .9 }), selle = mat({ color: 0x5a2a1a, roughness: .6 }), tapis = mat({ color: 0xc82a3a, roughness: .8 });
      const P3 = (geo, m, x, y, z, par = G3) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; par.add(o); return o; };
      /* (10.133) un vrai poney shetland bai : le tronc rond, le poitrail et la croupe, l'encolure épaisse, la tête au chanfrein blanc, les yeux, les naseaux, les oreilles ;
         la crinière en mèches, le toupet, la queue fournie ; les jambes à genoux et boulets, les sabots ; la bride, la selle, les étriers */
      const blanc = mat({ color: 0xf2ece0, roughness: .8 }), noirP = mat({ color: 0x141010, roughness: .5 }), sabot = mat({ color: 0x2a2420, roughness: .6 }), cuir = mat({ color: 0x3a2214, roughness: .6 }), fer = mat({ color: 0xb8bcc0, metalness: .7, roughness: .3 });
      const cps = new THREE.Group(); G3.add(cps); cps.position.y = .74;
      { const tr = P3(new THREE.SphereGeometry(.3, 18, 14), robe, 0, 0, 0, cps); tr.scale.set(1.75, .95, .85);   // le tronc
        P3(new THREE.SphereGeometry(.26, 16, 12), robe, .34, .04, 0, cps).scale.set(1, 1.05, .9);   // le poitrail
        P3(new THREE.SphereGeometry(.27, 16, 12), robe, -.36, .05, 0, cps).scale.set(1, 1, .95);   // la croupe
        P3(new THREE.SphereGeometry(.22, 14, 10), mat({ color: 0x9a6a40, roughness: .9 }), 0, -.12, 0, cps).scale.set(1.9, .6, .8); }   // (le ventre, un peu plus clair)
      // l'encolure et la tête
      const cou = new THREE.Group(); cou.position.set(.42, .14, 0); cou.rotation.z = -.75; cps.add(cou);
      { const c = P3(new THREE.CylinderGeometry(.11, .17, .48, 12), robe, 0, .22, 0, cou); void c;
        for (let k = 0; k < 7; k++) { const m2 = P3(new THREE.BoxGeometry(.05, .1, .1), crin, -.12 + k * .005, .02 + k * .065, 0, cou); m2.rotation.z = .3 + (k % 2) * .25; } }   // la crinière, en mèches
      const tete = new THREE.Group(); tete.position.set(0, .48, 0); tete.rotation.z = 1.25; cou.add(tete);
      { P3(new THREE.SphereGeometry(.11, 14, 10), robe, 0, 0, 0, tete).scale.set(1.2, 1, .95);   // le crâne
        const ch = P3(new THREE.CylinderGeometry(.065, .095, .26, 12), robe, .17, -.02, 0, tete); ch.rotation.z = Math.PI / 2;   // le chanfrein
        P3(new THREE.SphereGeometry(.075, 12, 10), mat({ color: 0x5a3a28, roughness: .8 }), .31, -.03, 0, tete).scale.set(1, .9, 1.05);   // le bout du nez
        const lis = P3(new THREE.BoxGeometry(.24, .02, .04), blanc, .17, .075, 0, tete); lis.rotation.z = -.15;   // la liste blanche
        for (const sz of [-1, 1]) { P3(new THREE.SphereGeometry(.022, 8, 6), noirP, .03, .04, sz * .1, tete); P3(new THREE.SphereGeometry(.014, 6, 4), noirP, .35, -.02, sz * .035, tete);   // les yeux, les naseaux
          const o = P3(new THREE.ConeGeometry(.035, .11, 6), robe, -.06, .13, sz * .05, tete); o.rotation.z = .25; o.rotation.x = sz * -.25; }   // les oreilles
        P3(new THREE.BoxGeometry(.06, .06, .14), crin, -.02, .12, 0, tete).rotation.z = .5;   // le toupet
        for (const [px, py, w] of [[.12, .0, .26], [.26, -.04, .02]]) { const b2 = P3(new THREE.TorusGeometry(.098, .012, 4, 16), cuir, px, py, 0, tete); b2.rotation.y = Math.PI / 2; void w; }   // la bride
        P3(new THREE.SphereGeometry(.015, 6, 4), fer, .3, -.07, .08, tete); }
      // la queue, fournie, en trois mèches
      const queue = new THREE.Group(); queue.position.set(-.58, .1, 0); cps.add(queue); for (let k = 0; k < 3; k++) { const q2 = P3(new THREE.CylinderGeometry(.035, .06, .55, 6), crin, -.04, -.25, (k - 1) * .035, queue); q2.rotation.z = -.15 + (k - 1) * .08; }
      // la selle, le tapis, les étriers
      P3(new THREE.BoxGeometry(.46, .03, .56), tapis, -.02, .27, 0, cps); { const sl = P3(new THREE.SphereGeometry(.17, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), selle, -.02, .27, 0, cps); sl.scale.set(1.3, .45, 1.05); }
      for (const sz of [-1, 1]) { P3(new THREE.BoxGeometry(.02, .3, .02), cuir, -.02, .1, sz * .24, cps); P3(new THREE.TorusGeometry(.04, .01, 4, 8), fer, -.02, -.07, sz * .24, cps); }
      // les jambes : la cuisse (du corps au genou), le canon, le boulet, le sabot
      const pattes = [[.36, .14], [.36, -.14], [-.36, .14], [-.36, -.14]].map(([px, pz], i) => { const g = new THREE.Group(); g.position.set(px, .62, pz); G3.add(g);
        P3(new THREE.CylinderGeometry(.07, .055, .3, 8), robe, 0, -.13, 0, g); const gn = new THREE.Group(); gn.position.y = -.28; g.add(gn); P3(new THREE.SphereGeometry(.05, 8, 6), robe, 0, 0, 0, gn);
        P3(new THREE.CylinderGeometry(.038, .036, .24, 8), i < 2 ? robe : robe, 0, -.13, 0, gn); P3(new THREE.SphereGeometry(.042, 8, 6), crin, 0, -.26, 0, gn); P3(new THREE.CylinderGeometry(.045, .055, .07, 8), sabot, .01, -.31, 0, gn); g.userData.gn = gn; return g; });
      const enf = enfant(9); enf.scale.setScalar(1); enf.position.set(-.02, 1.09 - enf.userData.hipY + .04, 0); enf.rotation.y = Math.PI / 2; G3.add(enf); enf.userData.poser("assis", 0);
      for (const J of P(enf).jambes) { J.h.rotation.x = -.3; J.h.rotation.z = 0; J.gen.rotation.x = .5; } P(enf).jambes[0].h.rotation.z = .5; P(enf).jambes[1].h.rotation.z = -.5;   // (à califourchon)
      const adu = gens(14); adu.position.set(1.15, 0, .35); adu.rotation.y = Math.PI / 2; G3.add(adu);
      const longe = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), new THREE.LineBasicMaterial({ color: 0x3a2a1a })); G3.add(longe);
      const xa = -58, xb = 44, v = 1.0, L3 = xb - xa, st = {};
      ANIM.push((t) => { const d = (t * v) % (2 * L3), aller = d < L3, u = aller ? d : 2 * L3 - d, x = xa + u, demi = Math.min(Math.abs(u), Math.abs(L3 - u)) < 1.2, z0 = evite(st, x, 11.4, aller ? 1.6 : -1.6);
        G3.position.set(x, H(x, z0), z0); G3.rotation.y = aller ? 0 : Math.PI; if (demi) G3.rotation.y += (aller ? 1 : -1) * 0;
        const ph = t * 6; pattes.forEach((g, i) => { const w = ph + [0, Math.PI, Math.PI, 0][i]; g.rotation.z = Math.sin(w) * .32; g.userData.gn.rotation.z = (i < 2 ? -1 : 1) * Math.max(0, Math.sin(w + 1.2)) * .55; });   // (le pas : les diagonales ensemble, le genou qui plie)
        cps.position.y = .74 + Math.abs(Math.sin(ph)) * .018; cou.rotation.z = -.75 + Math.sin(ph) * .05; queue.rotation.x = Math.sin(t * 1.7) * .25; queue.rotation.z = Math.sin(t * 1.1) * .1;
        adu.userData.poser("marche", t * 1000); const b = P(adu).bras[0]; b.e.rotation.x = -.5; b.c.rotation.x = -.3;   // (la main gauche tient la longe)
        enf.position.y = 1.09 - enf.userData.hipY + .04 + Math.abs(Math.sin(ph)) * .03; if (Math.sin(t * .5) > .8) P(enf).bras[1].e.rotation.x = -2.6; else P(enf).bras[1].e.rotation.x = -.6;
        G3.updateMatrixWorld(true); const h = new THREE.Vector3(); P(adu).bras[0].c.getWorldPosition(h); G3.worldToLocal(h); h.y -= .3; const pos = longe.geometry.attributes.position; pos.setXYZ(0, h.x, h.y, h.z); { const b3 = new THREE.Vector3(); tete.localToWorld(b3.set(.3, -.07, 0)); G3.worldToLocal(b3); pos.setXYZ(1, b3.x, b3.y, b3.z); } pos.needsUpdate = true; }); }
    // les promeneurs de la galerie marchande : ils vont et viennent le long des couloirs (toute la journée et le soir aussi)
    { const GW = [[-5, -5.5], [-16, -5.8], [-30, -5.8], [-40, -5.8], [-52, -6], [-58, -5], [-64, -4]]; for (let k = 0; k < (PEU ? 3 : 6); k++) { const m = ad(gens(k * 4 + 10)), v = .8 + (k % 3) * .15, tot2 = GW.reduce((a2, q, i) => i ? a2 + Math.hypot(q[0] - GW[i - 1][0], q[1] - GW[i - 1][1]) : 0, 0);
      ANIM.push((t) => { let d = (t * v + k * 9) % (2 * tot2); const ret = d > tot2; if (ret) d = 2 * tot2 - d; let i = 1; for (; i < GW.length; i++) { const l = Math.hypot(GW[i][0] - GW[i - 1][0], GW[i][1] - GW[i - 1][1]); if (d <= l) break; d -= l; } i = Math.min(i, GW.length - 1);
        const A2 = GW[i - 1], B2 = GW[i], l = Math.hypot(B2[0] - A2[0], B2[1] - A2[1]) || 1, u = Math.min(1, d / l), off = (k % 3 - 1) * .7, x = A2[0] + (B2[0] - A2[0]) * u, z = evite(m.userData, x, A2[1] + (B2[1] - A2[1]) * u + off, ret ? -1 : 1);
        m.position.set(x, H(x, z), z); m.rotation.y = Math.atan2((B2[0] - A2[0]) * (ret ? -1 : 1), (B2[1] - A2[1]) * (ret ? -1 : 1)); m.userData.poser("marche", t * 1000); }); } }
    // (10.138) le soir, devant la scène : on danse
    const DANSE = [], DANSEF = [];
    for (let k = 0; k < (PEU ? 6 : 12); k++) { const m = ad(gens(k * 3 + 7)), a0 = k * 2.399, rr = 1.2 + (k % 4) * .8, cx = -32 + Math.cos(a0) * rr * 1.6, cz = 19.6 - Math.abs(Math.sin(a0)) * rr; m.position.set(cx, L.hauteur ? L.hauteur(cx, cz) : 0, cz); m.rotation.y = 0; m.visible = false; DANSE.push(m);
      DANSEF.push((t) => { const ph = t * 4.2 + k, P2 = P(m); m.userData.poser("debout", 0); m.position.y = (L.hauteur ? L.hauteur(cx, cz) : 0) + Math.abs(Math.sin(ph)) * .12; m.rotation.y = Math.sin(t * .7 + k) * .5;
        const st = k % 3; P2.bras.forEach((b, i) => { const sg = i ? 1 : -1; if (st === 0) { b.e.rotation.x = -2.8 + Math.sin(ph + i) * .3; b.e.rotation.z = sg * .3; } else if (st === 1) { b.e.rotation.x = -1.2 + Math.sin(ph + i * Math.PI) * .7; b.c.rotation.x = -1.3; } else { b.e.rotation.z = sg * (.6 + Math.sin(ph) * .5); b.e.rotation.x = -.4; } });
        P2.jambes.forEach((J, i) => { J.h.rotation.x = Math.sin(ph + i * Math.PI) * .25; }); P2.bassin.rotation.y = Math.sin(ph * .5) * .3; }); }
    // le feu d'artifice : le soir, sans arrêt, au pied de la montagne derrière la scène
    const FX = { x: -34, z: 70 }; FX.y = HP(34, 70); const BUR = [];   /* (10.128 : plus gros, plus vrai — étincelles rondes et lumineuses, traînées, chrysanthèmes, saules d'or qui retombent, anneaux, crépitements) */
    const etin = (() => { const c = document.createElement("canvas"); c.width = c.height = 64; const x = c.getContext("2d"), g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(.18, "rgba(255,255,255,.9)"); g.addColorStop(.45, "rgba(255,255,255,.25)"); g.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = g; x.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(c); return t; })();
    const NP = PEU ? 180 : 360;
    for (let k = 0; k < (PEU ? 6 : 9); k++) { const g = new THREE.BufferGeometry(), pos = new Float32Array(NP * 3), col = new Float32Array(NP * 3); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("color", new THREE.BufferAttribute(col, 3));
      const m = new THREE.PointsMaterial({ size: 2.4, map: etin, vertexColors: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }), pts = new THREE.Points(g, m);
      const lg = new THREE.BufferGeometry(), lp = new Float32Array(NP * 6), lc = new Float32Array(NP * 6); lg.setAttribute("position", new THREE.BufferAttribute(lp, 3)); lg.setAttribute("color", new THREE.BufferAttribute(lc, 3));
      const lm = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }), tr = new THREE.LineSegments(lg, lm);
      const fus = new THREE.Points(new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(new Float32Array(3), 3)), new THREE.PointsMaterial({ size: 1.6, map: etin, color: 0xffd090, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
      for (const o of [pts, tr, fus]) { o.frustumCulled = false; o.userData.anime = true; o.visible = false; scene.add(o); } BUR.push({ pts, m, tr, lm, fus, t0: -99, vie: 0, c: new THREE.Vector3(), dir: [], sp: [] }); }
    const COUL = [[1, .25, .2], [.3, 1, .4], [.35, .55, 1], [1, .85, .3], [1, .35, 1], [.4, 1, 1], [1, 1, 1], [1, .6, .15]], fl = new THREE.Light();
    const lumFeu = new THREE.PointLight(0xffffff, 0, 160, 1.4); lumFeu.position.set(FX.x, FX.y + 40, FX.z); lumFeu.userData.anime = true; scene.add(lumFeu); void fl;
    let suiv = 0, kB = 0;
    const tirer = (t) => { const b = BUR[kB++ % BUR.length], type = ["pivoine", "pivoine", "saule", "anneau", "double", "palmier"][Math.floor(Math.random() * 6)]; b.t0 = t; b.type = type;
      b.c.set(FX.x + (Math.random() - .5) * 46, FX.y + 38 + Math.random() * 22, FX.z + (Math.random() - .5) * 14); b.v = type === "saule" ? 20 : 22 + Math.random() * 12; b.k = type === "saule" ? .9 : 1.8; b.gr = type === "saule" ? 5 : 3.2; b.vie = type === "saule" ? 5.2 : 3.6;
      const c1 = COUL[Math.floor(Math.random() * COUL.length)], c2 = COUL[Math.floor(Math.random() * COUL.length)], C = b.pts.geometry.attributes.color, LC = b.tr.geometry.attributes.color, ax = new THREE.Vector3(Math.random() - .5, Math.random() - .5, Math.random() - .5).normalize();
      for (let i = 0; i < NP; i++) { let d; if (type === "anneau") { const a2 = i / NP * Math.PI * 2, u = new THREE.Vector3(1, 0, 0).cross(ax).normalize(), w = ax.clone().cross(u); d = u.multiplyScalar(Math.cos(a2)).add(w.multiplyScalar(Math.sin(a2))); }
        else { const a2 = Math.random() * Math.PI * 2, cz = Math.random() * 2 - 1, sz = Math.sqrt(1 - cz * cz); d = new THREE.Vector3(sz * Math.cos(a2), cz, sz * Math.sin(a2)); if (type === "palmier") d.y = Math.abs(d.y) * .6 + .4; }
        b.dir[i] = d; b.sp[i] = (type === "double" && i % 2 ? .55 : 1) * (.85 + Math.random() * .3);
        const cc = type === "saule" ? [1, .72, .3] : type === "double" && i % 2 ? c2 : c1; C.setXYZ(i, ...cc); LC.setXYZ(i * 2, ...cc); LC.setXYZ(i * 2 + 1, cc[0] * .15, cc[1] * .15, cc[2] * .15); }
      C.needsUpdate = true; LC.needsUpdate = true; b.col = c1; };
    const feu = (t) => { if (t > suiv) { tirer(t); if (Math.random() < .3) tirer(t + .05); suiv = t + .35 + Math.random() * .9; } let flash = 0;
      for (const b of BUR) { const a2 = t - b.t0, mont = 1.6; if (a2 < 0 || a2 > mont + b.vie) { b.pts.visible = b.tr.visible = b.fus.visible = false; continue; }
        if (a2 < mont) { const u = a2 / mont, F = b.fus.geometry.attributes.position; b.fus.visible = true; b.pts.visible = b.tr.visible = false; F.setXYZ(0, b.c.x + Math.sin(a2 * 9) * .3, FX.y + (b.c.y - FX.y) * (1 - (1 - u) ** 2), b.c.z); F.needsUpdate = true; continue; }
        b.fus.visible = false; b.pts.visible = b.tr.visible = true; const e = a2 - mont, P2 = b.pts.geometry.attributes.position, LP = b.tr.geometry.attributes.position, pos = (i, ee) => { const r = b.v * b.sp[i] * (1 - Math.exp(-ee * b.k)) / b.k, d = b.dir[i]; return [b.c.x + d.x * r, b.c.y + d.y * r - b.gr * ee * ee * .5, b.c.z + d.z * r]; };
        for (let i = 0; i < NP; i++) { const p = pos(i, e), q = pos(i, Math.max(0, e - (b.type === "saule" ? .55 : .22))); P2.setXYZ(i, ...p); LP.setXYZ(i * 2, ...p); LP.setXYZ(i * 2 + 1, ...q); }
        P2.needsUpdate = true; LP.needsUpdate = true; const f = Math.max(0, 1 - e / b.vie), cr = e > b.vie * .6 ? (Math.random() < .5 ? .3 : 1) : 1;   // (le crépitement, à la fin)
        b.m.opacity = f * cr; b.lm.opacity = f * .8; b.m.size = 2.6 * (b.type === "saule" ? 1 : .6 + f * .5); if (e < .4) flash = Math.max(flash, 1 - e / .4); }
      lumFeu.intensity = flash * 6; };
    const a8 = L.anim; let jourV = null; L.anim = (tm) => { try { a8 && a8(tm); } catch (e) {} const t = (tm || performance.now()) / 1000, jour = !L.nuit;
      if (jour !== jourV) { jourV = jour; for (const o of JOUR) o.visible = true; for (const o of DANSE) o.visible = !jour; if (jour) { for (const b of BUR) { b.pts.visible = b.tr.visible = b.fus.visible = false; } lumFeu.intensity = 0; } }
      for (const f of ANIM) try { f(t); } catch (e) {} if (!jour) { for (const f of DANSEF) try { f(t); } catch (e) {} feu(t); } }; }   /* (10.138 : le même monde de jour comme de nuit ; le soir, en plus, on danse devant la scène) */
  /* (10.128) l'ambiance : le brouhaha des gens qui parlent (le même que la salle des fêtes), sur la promenade, aux terrasses et dans la galerie ; plus doux le soir, coupé à la borne d'arcade */
  if (false) { let son = null, v = 0; const a9 = L.anim; L.anim = (tm) => { try { a9 && a9(tm); } catch (e) {} const ici = M && M.L === L && !M.cine, moi = ici && M.moiNum && M.gens.get(M.moiNum);
      let cible = 0; if (moi && !window.mxArcadeOn && !document.hidden) { const p = moi.g.position, dz = p.z < 16 ? 0 : p.z - 16; cible = Math.max(0, Math.min(1, 1 - dz / 14)) * (L.nuit ? .35 : .6) * (M.barVol ?? 1); }
      if (!son) { if (!cible) return; son = new Audio("sons/fete-discussions.mp3"); son.loop = true; son.volume = 0; }
      v += (cible - v) * .05; try { son.volume = Math.max(0, Math.min(1, v)); } catch (e) {} if (v > .01 && son.paused) son.play().catch(() => {}); else if (v <= .01 && !son.paused) son.pause(); };
    const veille9 = setInterval(() => { if (son && (!M || M.L !== L || M.cine)) { son.pause(); v = 0; } if (!M || (M.prets && !Object.values(M.prets).some(q => q && q.L === L) && M.L !== L)) { clearInterval(veille9); if (son) { son.pause(); son = null; } } }, 500); }   // (on quitte la station : le son s'arrête)
  /* (10.131) dehors, en continu : des enfants qui jouent, au loin (pas trop fort) ; dans la galerie, on ne les entend plus */
  { let son = null, v = 0; const a10 = L.anim; L.anim = (tm) => { try { a10 && a10(tm); } catch (e) {} const moi = M && M.L === L && !M.cine && M.moiNum && M.gens.get(M.moiNum);
      let cible = 0; if (moi && !window.mxArcadeOn && !document.hidden) { const p = moi.g.position; cible = (L.nuit || (L.premiereIci && L.premiereIci(p.x, p.z))) ? 0 : .22; }   /* (10.135 : la nuit, plus d’enfants) */
      if (!son) { if (!cible) return; son = new Audio("sons/corbier-enfants.mp3"); son.loop = true; son.volume = 0; }
      v += (cible - v) * .04; try { son.volume = Math.max(0, Math.min(1, v)); } catch (e) {} if (v > .01 && son.paused) son.play().catch(() => {}); else if (v <= .01 && !son.paused) son.pause(); };
    const veille10 = setInterval(() => { if (son && (!M || M.L !== L || M.cine)) { son.pause(); v = 0; } if (!M || (M.prets && !Object.values(M.prets).some(q => q && q.L === L) && M.L !== L)) { clearInterval(veille10); if (son) { son.pause(); son = null; } } }, 500); }
  /* (10.134) le parapente : à l'office du tourisme, « Faire du parapente » ; on se retrouve là-haut, sur la montagne, face à la vallée ; on court, on décolle,
     et l'on vole, à la première personne, la voile au-dessus de soi ; à gauche, à droite (boutons, flèches, manette) ; on se pose en bas, près de la station */
  { const VOILE = new THREE.Group(); VOILE.userData.anime = true; VOILE.visible = false; scene.add(VOILE);
    { const n = 13, cols = [0xe8301a, 0xf0c020, 0x2a6ad8, 0xf4f4f0]; for (let k = 0; k < n; k++) { const a2 = (k / (n - 1) - .5) * 2.1, c = new THREE.Mesh(new THREE.BoxGeometry(.62, .16, 1.5), new THREE.MeshStandardMaterial({ color: cols[k % 4], roughness: .6, side: THREE.DoubleSide }));
        c.position.set(Math.sin(a2) * 3.6, 1.6 + Math.cos(a2) * 1.5, -2.6); c.rotation.z = -a2 * .45; VOILE.add(c); }
      const ll = []; for (let k = 0; k < 13; k += 2) { const a2 = (k / 12 - .5) * 2.1; for (const sx of [-.3, .3]) if ((sx < 0) === (a2 < .01)) ll.push(new THREE.Vector3(sx, -.5, -.35), new THREE.Vector3(Math.sin(a2) * 3.55, 1.55 + Math.cos(a2) * 1.45, -2.6 + (k % 4 ? .5 : -.5))); }
      VOILE.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(ll), new THREE.LineBasicMaterial({ color: 0x6a6a6a, transparent: true, opacity: .7 })));
      for (const sx of [-.28, .28]) { const e = new THREE.Mesh(new THREE.BoxGeometry(.035, .035, .14), new THREE.MeshStandardMaterial({ color: 0xd8202a })); e.position.set(sx, -.5, -.35); VOILE.add(e); } }   // (les élévateurs, dans les mains)
    let VOL = null, pad = null; const moiP = () => M && M.gens && M.gens.get(M.moiNum);
    const fini = (x, z) => { TROT.visible = false; const q = moiP(); if (VOL && VOL.F0 && scene.fog) { scene.fog.near = VOL.F0.near; scene.fog.far = VOL.F0.far; } VOL = null; VOILE.visible = false; if (pad) { pad.remove(); pad = null; } try { finCine(); } catch (e) { M.cine = null; }
      if (q) { let bx = 24, bz = 46; for (let r = 0; r < 30 && L.limites; r += 1.5) { let ok = false; for (let a2 = 0; a2 < 6.3; a2 += .5) { const tx = x + Math.cos(a2) * r, tz = z + Math.sin(a2) * r; if (L.limites(tx, tz)) { bx = tx; bz = tz; ok = true; break; } } if (ok) break; }
        q.g.position.set(bx, L.hauteur(bx, bz), bz); q.g.visible = true; q.cible = null; q.chemin = []; try { envoyerWS({ t: "aller", x: bx, z: bz }); } catch (e) {} } };
    const TROT = new THREE.Group(); TROT.userData.anime = true; TROT.visible = false; scene.add(TROT);   /* (10.135) la trottinette de descente : verte, ses gros pneus jaunes, le guidon, les poignées */
    { const vert = new THREE.MeshStandardMaterial({ color: 0x2aa84a, roughness: .45, metalness: .2 }), jaune = new THREE.MeshStandardMaterial({ color: 0xf0c820, roughness: .7 }), noirT = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: .6 }), alu = new THREE.MeshStandardMaterial({ color: 0xc8ccd0, metalness: .7, roughness: .3 });
      const b = (geo, m, x, y, z, rx = 0, rz = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.set(rx, 0, rz); TROT.add(o); return o; };
      b(new THREE.BoxGeometry(.26, .07, 1.0), vert, 0, -1.02, -.6);   // le plateau, sous les pieds
      for (const sx of [-.07, .07]) b(new THREE.BoxGeometry(.1, .03, .28), noirT, sx, -.97, -.5);   // (les pieds, dessus)
      for (const z of [-1.4, .2]) { const w = b(new THREE.TorusGeometry(.31, .16, 12, 24), jaune, 0, -1.08, z, 0, 0); w.rotation.y = Math.PI / 2; b(new THREE.CylinderGeometry(.14, .14, .3, 12), alu, 0, -1.08, z, 0, Math.PI / 2); }   // (10.136) les très gros pneus jaunes, gonflés
      const fourche = b(new THREE.CylinderGeometry(.04, .04, 1.1, 8), vert, 0, -.75, -.97, .91); void fourche;
      b(new THREE.CylinderGeometry(.025, .025, .62, 8), alu, 0, -.42, -.55, 0, Math.PI / 2);   // le guidon (10.137 : plus haut)
      for (const sx of [-.28, .28]) b(new THREE.CylinderGeometry(.032, .032, .12, 8), noirT, sx, -.42, -.55, 0, Math.PI / 2);   // les poignées
      b(new THREE.BoxGeometry(.06, .16, .05), vert, 0, -.5, -.57); }
    let MODE = "para";
    const decoller = () => { if (VOL || M.cine) return; const q = moiP(); if (q) { q.g.visible = false; q.cible = null; q.chemin = []; }
      const x0 = -6, z0 = 175, y0 = L.hauteur(x0, z0); const F0 = scene.fog ? { near: scene.fog.near, far: scene.fog.far } : null; if (scene.fog && scene.fog.far) { scene.fog.near = Math.max(scene.fog.near, 200); scene.fog.far = Math.max(scene.fog.far, 900); }   /* (10.134 : là-haut, on voit loin : la brume s'écarte) */
      VOL = { F0, x: x0, z: z0, y: y0 + 1.7, cap: Math.PI, vir: 0, t0: performance.now(), tp: performance.now(), g: 0, d: 0 };
      pad = document.createElement("div"); pad.style.cssText = "position:fixed;left:0;right:0;bottom:22px;z-index:40;display:flex;justify-content:space-between;padding:0 18px;pointer-events:none";
      const bt = (t, f) => { const b = document.createElement("button"); b.type = "button"; b.textContent = t; b.style.cssText = "pointer-events:auto;width:84px;height:84px;border-radius:50%;border:0;background:rgba(20,20,40,.55);color:#fff;font-size:30px;touch-action:none";
        b.onpointerdown = (e) => { e.preventDefault(); e.stopPropagation(); f(1); }; b.onpointerup = b.onpointercancel = b.onpointerleave = (e) => { e.stopPropagation(); f(0); }; return b; };
      pad.appendChild(bt("◀", v => VOL && (VOL.g = v))); const mid = document.createElement("div"); mid.style.cssText = "align-self:center;color:#fff;font:600 14px Arial;text-shadow:0 1px 3px #000;text-align:center"; mid.textContent = MODE === "trott" ? "🛴 Descends jusqu'au front de neige" : "🪂 Vole jusqu'à la station"; pad.appendChild(mid); pad.appendChild(bt("▶", v => VOL && (VOL.d = v)));
      (M.ctx && M.ctx.conteneur || document.body).appendChild(pad);
      M.cine = { gel: true, fov: [72, 80], maj: () => { if (!VOL) return; const now = performance.now(), dt = Math.min(.05, (now - VOL.tp) / 1000), t = (now - VOL.t0) / 1000; VOL.tp = now;
          let st = (window.__clavierG ? 1 : 0); const gp = navigator.getGamepads ? [...navigator.getGamepads()].find(g => g) : null, ax = gp ? gp.axes[0] || 0 : 0;
          let evit = 0; if (MODE === "trott" && L.arbres) { const fx = VOL.x + Math.sin(VOL.cap) * 5, fz = VOL.z + Math.cos(VOL.cap) * 5; for (const [ax2, az2, rr] of L.arbres) { const dx = ax2 - fx, dz = az2 - fz, d2 = Math.hypot(dx, dz); if (d2 < rr + 4) { const cote = Math.cos(VOL.cap) * dx - Math.sin(VOL.cap) * dz; evit += (cote > 0 ? -1 : 1) * (1 - d2 / (rr + 4)) * 3; } } }   // (on contourne les sapins)
          const tour = (VOL.d - VOL.g) + (VOL.kd || 0) - (VOL.kg || 0) + (Math.abs(ax) > .2 ? ax : 0) + evit; void st;
          VOL.vir += (tour * .9 - VOL.vir) * Math.min(1, dt * 2.5); VOL.cap -= VOL.vir * dt * .55;   // (on tourne, en s'inclinant)
          const TR = MODE === "trott", course = !TR && t < 2.2, v = TR ? Math.min(12, 1 + t * 2) : course ? 2 + t * 3.5 : 11, sol = L.hauteur(VOL.x, VOL.z);
          VOL.x += Math.sin(VOL.cap) * v * dt; VOL.z += Math.cos(VOL.cap) * v * dt;
          if (TR) { VOL.y = L.hauteur(VOL.x, VOL.z) + 1.55 + Math.sin(t * 9) * .015; if (VOL.z < 16) { fini(VOL.x, 16); return; } }
          else if (course) VOL.y = L.hauteur(VOL.x, VOL.z) + 1.7 + Math.max(0, t - 1.6) * 1.2;
          else { const h = VOL.y - sol, pose = VOL.z < 95, monte = !pose && t < 16 ? 3.2 : 0, porte = !pose && h < 38 ? (38 - h) * .7 : 0, auto = pose ? Math.max(.6, Math.min(9, (h - 1.2) / Math.max(1, (VOL.z - 12) / v))) : .35;   /* (10.134 : on monte haut, comme sur les photos ; l'air qui remonte la pente nous porte ; au-dessus de la station, on descend se poser) */
            VOL.y += (monte + porte - auto) * dt; VOL.y = Math.max(VOL.y, sol + .4); VOL.pose = pose; }   // (le décollage porte vers le haut ; puis on plane ; au-dessus de la station, on descend se poser)
          const h = VOL.y - L.hauteur(VOL.x, VOL.z); if (!TR && !course && ((VOL.pose && h < .9) || VOL.z < 10 || t > 180)) { fini(VOL.x, Math.max(VOL.z, 12)); return; }
          if (Math.abs(VOL.x) > 300) VOL.cap += (VOL.x > 0 ? -1 : 1) * dt * .6;
          const dir = new THREE.Vector3(Math.sin(VOL.cap), 0, Math.cos(VOL.cap)), eye = new THREE.Vector3(VOL.x, VOL.y, VOL.z);
          M.camera.position.copy(eye); M.camera.up.set(Math.sin(-VOL.vir * .35) * Math.cos(VOL.cap), 1, -Math.sin(-VOL.vir * .35) * Math.sin(VOL.cap)).normalize();
          { const hh = VOL.y - L.hauteur(VOL.x, VOL.z); M.camera.lookAt(eye.clone().addScaledVector(dir, 10).add(new THREE.Vector3(0, TR ? -3.8 : course ? -1.2 : -2.2 - Math.min(4, hh / 20), 0))); } M.camera.up.set(0, 1, 0);
          VOILE.visible = true; VOILE.position.copy(eye); VOILE.rotation.set(0, VOL.cap + Math.PI, 0); VOILE.rotateZ(VOL.vir * .25); if (TR) { VOILE.visible = false; TROT.visible = true; TROT.position.copy(eye); TROT.rotation.set(0, VOL.cap + Math.PI, 0); TROT.rotateZ(VOL.vir * .12); return; } VOILE.visible = !course || t > .8; VOILE.rotateX(course ? .2 * (1 - Math.min(1, t / 1.6)) : 0); } };
    };
    const kd = (e) => { if (!VOL) return; if (e.key === "ArrowLeft" || e.key === "q") VOL.kg = e.type === "keydown" ? 1 : 0; if (e.key === "ArrowRight" || e.key === "d") VOL.kd = e.type === "keydown" ? 1 : 0; };
    addEventListener("keydown", kd); addEventListener("keyup", kd);
    /* (10.135) devant l'escalier de l'office du tourisme : le cercle des activités — parapente, télésiège, trottinette de descente */
    const CX = 19.6, CZ = 46.2, cy = L.hauteur(CX, CZ) + .05; { const ring = new THREE.Mesh(new THREE.RingGeometry(.95, 1.2, 40), new THREE.MeshBasicMaterial({ color: 0x2ad0ff, transparent: true, opacity: .85, side: THREE.DoubleSide })); ring.rotation.x = -Math.PI / 2; ring.position.set(CX, cy, CZ); scene.add(ring);
      const dq = new THREE.Mesh(new THREE.CircleGeometry(.95, 40), new THREE.MeshBasicMaterial({ color: 0x2ad0ff, transparent: true, opacity: .18 })); dq.rotation.x = -Math.PI / 2; dq.position.set(CX, cy - .01, CZ); scene.add(dq); ring.userData.anime = true;
      const a12 = L.anim; L.anim = (tm) => { try { a12 && a12(tm); } catch (e) {} ring.material.opacity = .55 + Math.sin((tm || 0) / 300) * .3; }; }
    const menu = () => { if (M.cine) return; const d = document.createElement("div"); d.style.cssText = "position:absolute;left:50%;bottom:90px;transform:translateX(-50%);z-index:30;background:rgba(18,24,40,.95);color:#fff;border-radius:16px;padding:14px 16px;font:15px Lato,Arial,sans-serif;min-width:260px;max-width:92%;box-shadow:0 8px 30px rgba(0,0,0,.5)";
      d.innerHTML = "<div style='font-weight:700;margin-bottom:10px'>🏔️ Que veux-tu faire ?</div>"; const fermer = () => { d.remove(); M.manMenu = null; };
      for (const [t, f] of [["🪂 Parapente : s'envoler de la montagne", () => { MODE = "para"; decoller(); }], ["🚡 Télésiège : monter et redescendre", () => L.monterTelesiege && L.monterTelesiege()], ["🛴 Trottinette : descendre jusqu'au front de neige", () => { MODE = "trott"; decoller(); }]]) {
        const b = document.createElement("button"); b.type = "button"; b.textContent = t; b.style.cssText = "display:block;width:100%;text-align:left;margin:6px 0;padding:11px 12px;border:0;border-radius:10px;background:#1f6ad0;color:#fff;font:15px Lato,Arial,sans-serif;cursor:pointer"; b.onclick = () => { fermer(); f(); }; d.appendChild(b); }
      const x = document.createElement("button"); x.type = "button"; x.textContent = "Annuler"; x.style.cssText = "display:block;width:100%;margin-top:6px;padding:9px;border:0;border-radius:10px;background:rgba(255,255,255,.12);color:#fff;font:14px Lato,Arial,sans-serif"; x.onclick = fermer; d.appendChild(x);
      (M.ctx.conteneur || document.body).appendChild(d); M.manMenu = { d, fermer }; };
    const a11 = L.actionLieu; L.actionLieu = (x, z, moi) => { const r = a11 && a11(x, z, moi); if (r) return r; if (VOL) return null; return Math.hypot(x - CX, z - CZ) < 1.3 ? { type: "lieu", id: "activites", label: "🏔️ Parapente · Télésiège · Trottinette", faire: menu } : null; }; }
  /* (10.137) le concert sur la petite scène, face aux immeubles : le groupe de la salle des fêtes (la batteuse, le bassiste, le guitariste), les musiques mp3 de la caserne,
     deux boutons sur la tranche de la scène (musique précédente, suivante), trois projecteurs de couleur, et le volume à régler */
  { const SX = -32, SZ = 25, ST = HP(32, 25) + .5, BAT = [SX, 26.3], BAS = [SX - 1.8, 24.7], GUI = [SX + 1.8, 24.7];
    // la batterie
    { const noirK = mat({ color: 0x1a1a1c, roughness: .4, metalness: .3 }), rougeK = mat({ color: 0xa81a22, roughness: .35, metalness: .2 }), chrome = mat({ color: 0xd8dcde, metalness: .9, roughness: .2 }), peau = mat({ color: 0xf2efe6 });
      const gk = new THREE.Group(); gk.position.set(BAT[0], ST, BAT[1] - .55); scene.add(gk); const q = (geo, m, x, y, z, rx = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.x = rx; gk.add(o); };
      q(new THREE.CylinderGeometry(.32, .32, .4, 16), rougeK, 0, .32, .1, Math.PI / 2); q(new THREE.CircleGeometry(.3, 16), peau, 0, .32, -.11, 0);   // la grosse caisse
      for (const [x, y, z, r2] of [[-.38, .62, -.2, .17], [.15, .78, .02, .15], [-.12, .8, .04, .13]]) { q(new THREE.CylinderGeometry(r2, r2, .16, 14), rougeK, x, y, z); q(new THREE.CylinderGeometry(r2 * .96, r2 * .96, .01, 14), peau, x, y + .085, z); }   // caisse claire, toms
      for (const [x, z] of [[-.62, -.05], [.5, .05]]) { q(new THREE.CylinderGeometry(.012, .012, 1.05, 6), chrome, x, .52, z); q(new THREE.CylinderGeometry(.22, .22, .012, 16), mat({ color: 0xd8b040, metalness: .9, roughness: .25 }), x, 1.05, z); }   // les cymbales
      q(new THREE.CylinderGeometry(.16, .16, .45, 10), noirK, .05, .22, .55); }   // le tabouret
    // les amplis
    for (const [x, z] of [[SX - 2.5, 26.4], [SX + 2.5, 26.4]]) { box(.7, .9, .4, mat({ color: 0x141416, roughness: .6 }), x, ST + .45, z); box(.6, .6, .02, mat({ color: 0x2a2a2c, roughness: .9 }), x, ST + .45, z - .21); }
    // les trois projecteurs, sur leurs pieds, qui changent de couleur
    const SPOTS = [], PALS = [0xff1a1a, 0x1aff3a];   // (10.138 : rouge et vert)
    for (const [x, z] of [[SX - 3.3, 22.4], [SX + 3.3, 22.4], [SX - 3.6, 27.6]]) { const y0 = L.hauteur(x, z); cyl(.04, .05, 3, mat({ color: 0x2a2a2c, metalness: .6 }), x, y0 + 1.5, z, 6);
      const tete = new THREE.Mesh(new THREE.CylinderGeometry(.12, .18, .32, 12), new THREE.MeshStandardMaterial({ color: 0x1a1a1a, emissive: 0xffffff, emissiveIntensity: .8 })); tete.position.set(x, y0 + 3.1, z); tete.lookAt(SX, ST + 1, SZ); tete.rotateX(Math.PI / 2); tete.userData.anime = true; scene.add(tete);
      const sp = new THREE.SpotLight(0xffffff, 0, 16, .5, .6, 1.2); sp.position.set(x, y0 + 3.1, z); sp.target.position.set(SX + (x - SX) * .3, ST, SZ); sp.userData.anime = true; scene.add(sp); scene.add(sp.target); SPOTS.push({ sp, tete }); }
    // les deux boutons, sur la tranche de la scène
    const bouton = (x, txt) => { const t = tT(128, 128, (c, w, h) => { c.fillStyle = "#1a1a1c"; c.fillRect(0, 0, w, h); c.fillStyle = "#f0c020"; c.beginPath(); c.arc(64, 64, 54, 0, 7); c.fill(); c.fillStyle = "#1a1a1c"; c.font = "bold 58px Arial"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(txt, 64, 68); });
      box(.42, .42, .06, mat({ color: 0x2a2a2c }), x, ST - .25, 22.98); add(new THREE.PlaneGeometry(.38, .38), lum(mat({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: .35 }), .35, .9), x, ST - .25, 22.94, Math.PI); };
    bouton(SX + 1.2, "⏮"); bouton(SX - 1.2, "⏭");   // (vu de face : précédente à gauche, suivante à droite)
    // la musique : les mp3 de la caserne, l'une après l'autre ; on l'entend autour de la scène, de moins en moins fort en s'éloignant
    let liste = null, i = 0, son = null, vol = .7, en = false; try { const v = parseFloat(localStorage.getItem("corbier-concert-vol")); if (v >= 0 && v <= 1) vol = v; } catch (e) {}
    const charger = () => { if (liste) return; liste = []; fetch("/api/musiques", { headers: { Authorization: "Bearer " + M.ctx.token } }).then(r => r.ok ? r.json() : []).then(l => { liste = Array.isArray(l) ? l : []; i = Math.floor(Math.random() * Math.max(1, liste.length)); }).catch(() => {}); };
    const piste = (d) => { if (!liste || !liste.length) return; i = ((i + d) % liste.length + liste.length) % liste.length; const m = liste[i]; if (son) son.pause(); son = new Audio(`/api/musiques/${m.id}/fichier?t=${encodeURIComponent(M.ctx.token)}`); son.volume = 0; son._t = (m.artiste ? m.artiste + " — " : "") + (m.titre || ""); son.addEventListener("ended", () => { if (M && M.L === L) piste(1); }); son.play().catch(() => {}); if (lab) lab.textContent = "🎵 " + son._t; };
    // le réglage du volume, qui apparaît près de la scène
    let pan = null, lab = null; const panneau = () => { if (pan) return pan; pan = document.createElement("div"); pan.style.cssText = "position:absolute;left:50%;top:64px;transform:translateX(-50%);z-index:25;background:rgba(18,18,30,.85);color:#fff;border-radius:14px;padding:8px 14px;font:13px Lato,Arial,sans-serif;display:flex;align-items:center;gap:10px;max-width:92vw";
      lab = document.createElement("span"); lab.style.cssText = "max-width:46vw;overflow:hidden;white-space:nowrap;text-overflow:ellipsis"; lab.textContent = son ? "🎵 " + son._t : "🎵 Concert"; const rg = document.createElement("input"); rg.type = "range"; rg.min = 0; rg.max = 1; rg.step = .05; rg.value = vol; rg.style.width = "110px";
      rg.oninput = (e) => { e.stopPropagation(); vol = +rg.value; try { localStorage.setItem("corbier-concert-vol", vol); } catch (er) {} }; for (const ev of ["pointerdown", "touchstart", "mousedown"]) rg.addEventListener(ev, e => e.stopPropagation());
      const ic = document.createElement("span"); ic.textContent = "🔊"; pan.append(ic, rg); return pan; };   // (10.139 : sans le titre de la musique)
    // le groupe : on les fait monter sur scène quand on est dans la station
    const GR = [[-60, BAT, "batterie", "La batteuse", "batteuse", "#121214", "#141416", "#1a1a1a", 18], [-61, BAS, "basse", "Le bassiste", "bassiste", "#2c2e31", "#151517", "#1a1a1a", 19], [-62, GUI, "guitare", "Le guitariste", "guitariste", "#151517", "#151517", "#0e0e0e", 20]];
    const a13 = L.anim; L.anim = (tm) => { try { a13 && a13(tm); } catch (e) {} if (!M || M.L !== L) { if (son && !son.paused) son.pause(); if (pan && pan.isConnected) pan.remove(); return; }
      const moi = M.moiNum && M.gens.get(M.moiNum); if (!moi) return; const p = moi.g.position, d = Math.hypot(p.x - SX, p.z - SZ), t = (tm || performance.now());
      if (!L.nuit) { for (const [num] of GR) if (M.gens.has(num)) retirerAncien(num); if (son && !son.paused) son.pause(); if (pan && pan.isConnected) pan.remove(); SPOTS.forEach(S2 => { S2.sp.intensity = 0; S2.tete.material.emissive.setHex(0x222222); }); return; }   /* (10.138 : le concert, seulement le soir) */
      for (const [num, pos, place, nom, tenue, couleur, bas, pieds, id] of GR) { let g = M.gens.get(num);
        if (!g) { const P = (M.ctx.pnjTrio && M.ctx.pnjTrio(id)) || {}; g = ajouterAncien({ numero: num, nom: P.nom || nom, tenue: P.tenue || tenue, couleur: P.couleur || couleur, bas: P.bas || bas, pieds: P.pieds || pieds, reglage: P.reglage || null, initiales: "♪",
            teteUrl: P.tete_v ? M.ctx.urlTetePNJ(P.tete_v, id) : `images/${tenue}-tete.png`, pnj: true, danseur: true, musicien: place, x: pos[0], z: pos[1] }); if (!g) continue; }
        g.info.danse = place === "batterie" ? "batterie" : "guitare"; g.info.enMusique = !!(son && !son.paused);
        if (place !== "batterie") { const k = place === "basse" ? 0 : 2.1, s2 = t / 1000; g.g.position.x = pos[0] + (g.info.enMusique ? Math.sin(s2 * .55 + k) * .35 : 0); g.g.position.z = pos[1] + (g.info.enMusique ? Math.sin(s2 * .4 + k * 1.7) * .25 : 0); } }
      // la musique et son volume
      const pres = true; if (pres) charger();   /* (10.138 : on l'entend dans toute la station ; plus loin, moins fort ; dans la galerie, en sourdine) */ if (pres && !son && liste && liste.length) piste(0);
      if (son) { const gal = L.premiereIci && L.premiereIci(p.x, p.z), c = vol * (d < 25 ? 1 : Math.max(.2, 1 - (d - 25) / 70)) * (gal ? .4 : 1); son._v = (son._v || 0) + (c - (son._v || 0)) * .08; try { son.volume = Math.max(0, Math.min(1, son._v)); } catch (e) {} if (son._v > .01 && son.paused && !M.cine) son.play().catch(() => {}); else if ((son._v <= .01 || M.cine) && !son.paused) son.pause(); }
      const vu = d < 30 && !M.cine; if (vu && !(pan && pan.isConnected)) (M.ctx.conteneur || document.body).appendChild(panneau()); else if (!vu && pan && pan.isConnected) pan.remove();
      // les projecteurs, en rythme
      const on = !!(son && !son.paused); SPOTS.forEach((S2, k) => { const c = PALS[(k + Math.floor(t / 1700)) % PALS.length]; S2.sp.color.setHex(c); S2.sp.intensity = on ? 45 : 0; S2.tete.material.emissive.setHex(on ? c : 0x222222); }); };
    const a14 = L.actionLieu; L.actionLieu = (x, z, moi) => { const r = a14 && a14(x, z, moi); if (r) return r; if (Math.abs(z - 22.4) > 1.1) return null;
      if (Math.abs(x - (SX + 1.2)) < .9) return { type: "lieu", id: "concertPrec", label: "⏮ Musique précédente", faire: () => { charger(); piste(-1); } };
      if (Math.abs(x - (SX - 1.2)) < .9) return { type: "lieu", id: "concertSuiv", label: "⏭ Musique suivante", faire: () => { charger(); piste(1); } }; return null; }; }
  /* (10.138) le chef de poste en vacances : t-shirt vert kaki, short beige, baskets blanches ; le caméscope à l'œil, il se promène partout et filme tout */
  { const CHEF = -63, ETAPES = [[-40, 5.5], [-10, 5], [20, 5.5], [45, 5], [40, 12.5], [10, 13], [-20, 12.5], [-32, 20.5], [-10, 23], [12, 22], [20, 42], [5, 30], [-48, 12.5], [-60, 13]];
    const cam = new THREE.Group(); { const n = new THREE.MeshStandardMaterial({ color: 0x1a1a1c, roughness: .4, metalness: .3 }), v = new THREE.MeshStandardMaterial({ color: 0x3a6ab0, roughness: .1, metalness: .5 });
      const b = new THREE.Mesh(new THREE.BoxGeometry(.11, .1, .22), n); cam.add(b); const o = new THREE.Mesh(new THREE.CylinderGeometry(.035, .04, .08, 12), n); o.rotation.x = Math.PI / 2; o.position.z = .14; cam.add(o);
      const l = new THREE.Mesh(new THREE.CircleGeometry(.03, 12), v); l.position.z = .181; cam.add(l); const ec = new THREE.Mesh(new THREE.BoxGeometry(.015, .08, .1), n); ec.position.set(-.065, 0, 0); cam.add(ec);
      const led = new THREE.Mesh(new THREE.SphereGeometry(.01, 6, 4), new THREE.MeshBasicMaterial({ color: 0xff2020 })); led.position.set(.03, .055, .08); cam.add(led); cam.userData.led = led; } cam.userData.anime = true;
    let k = 0, pause = 0;
    const a15 = L.anim; L.anim = (tm) => { try { a15 && a15(tm); } catch (e) {} if (!M || M.L !== L) return; const t = tm || performance.now(); let p = M.gens.get(CHEF);
      if (!p) { const P = (M.ctx.pnjTrio && M.ctx.pnjTrio(115)) || {}; p = ajouterAncien({ numero: CHEF, nom: P.nom || "Le chef de poste", tenue: P.tenue || "tshirt", couleur: P.couleur || "#6b7a3a", bas: P.bas || "#d8c49a", pieds: P.pieds || "#f4f4f2", short: true, camescope: true, reglage: P.reglage || null,   /* (10.138 : son propre réglage, dans les PNJ de l'administrateur) */
          teteUrl: P.tete_v ? M.ctx.urlTetePNJ(P.tete_v, 115) : "images/pere-tete.png", pnj: true, sansVerre: true, x: ETAPES[0][0], z: ETAPES[0][1] }); if (!p) return; }
      p.info.danse = "camescope"; const pc = p.corps || p.g; if (cam.parent !== pc) pc.add(cam);
      // le caméscope devant l'œil, tourné là où il filme ; la petite lumière rouge clignote
      const h = (typeof tailleBonhomme === "function" ? tailleBonhomme() : 1.75) * (p.corps ? 1 / (p.corps.scale.y || 1) : 1); cam.position.set(h * .2 / 420 * 200 * .0 + h * 200 / 420 * (16 / 200), h * (420 - 100) / 420, .06);   /* (dans la main, devant l'œil, sur le panneau du bonhomme) */ cam.userData.led.visible = Math.floor(t / 500) % 2 === 0;
      const [ex, ez] = ETAPES[k], g = p.g.position, d = Math.hypot(g.x - ex, g.z - ez);
      if (t < pause) { p.cible = null; p.chemin = []; }   // (il s'arrête, et balaie lentement la scène)
      else if (d < 1.2) { k = (k + 1 + Math.floor(al() * 2)) % ETAPES.length; pause = t + 3000 + al() * 5000; }
      else { if (!p.cible) viser(p, ex, ez); } }; }
  /* (fluidité) tout ce qui ne bouge pas est fondu en quelques pièces */
  { scene.updateMatrixWorld(true); for (const g of scene.children.slice()) { if (!g.isGroup || g.userData.poser || g.userData.parts || g.userData.anime) continue; const ms = []; g.traverse(o => { if (o.isMesh && !o.isSkinnedMesh) ms.push(o); }); for (const m of ms) scene.attach(m); if (!g.children.some(c => c.isMesh || c.isGroup || c.isLight)) scene.remove(g); } }
  fusionStatique(scene, L, 0);
}
({ construireCorbier })
