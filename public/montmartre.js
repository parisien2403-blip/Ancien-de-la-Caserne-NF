/* Montmartre : la place du Tertre (d'après les photos), et le dôme du Sacré-Cœur au-dessus des toits.
   Ce fichier est chargé par la matrice (matrice.js) la première fois qu'on y va, et exécuté chez elle (eval direct) : il se sert
   tel quel de tout ce qu'elle a (THREE, M, personne3D, quitterLieu…). Ce qu'il rend (la dernière expression) : ses points d'entrée. */
function construireTertre(A, L, scene) {
  const ECH = PETIT ? .5 : (MOBILE || GPU_MODESTE) ? .62 : 1;   /* (sur téléphone : toutes les images de Montmartre à un peu plus de la moitié de leur taille — 140 Mo en tout, c'était trop, le téléphone se figeait en les chargeant) */
  /* (les images de Montmartre : au lieu de 440 images séparées — chacune envoyée à part à la carte graphique —, elles sont rangées sur quelques grandes planches de 2048 × 2048 ;
     chaque enseigne, façade ou vitrine n'en lit que sa case. Seules les images qui se répètent (les pavés, la pierre) et celles qu'on peint plus tard (les tableaux) restent à part) */
  const PAGE = 2048, PAD = 4, PAGES = []; let pg = null;
  const casier = (w, h) => { if (w > PAGE - 2 * PAD || h > PAGE - 2 * PAD) return null;
    if (!pg) { const c = document.createElement("canvas"); c.width = c.height = PAGE; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; pg = { c, x: PAD, y: PAD, hl: 0, t }; PAGES.push(pg); }
    if (pg.x + w + PAD > PAGE) { pg.x = PAD; pg.y += pg.hl + PAD; pg.hl = 0; }
    if (pg.y + h + PAD > PAGE) { pg = null; return casier(w, h); }
    const r = { pg, x: pg.x, y: pg.y }; pg.x += w + PAD; pg.hl = Math.max(pg.hl, h); return r; };
  const tT = (w, h, f, rx, ry, ech = 1, aPart = false) => { const cw = Math.max(8, Math.round(w * ECH * ech)), ch = Math.max(8, Math.round(h * ECH * ech)), place = rx || aPart ? null : casier(cw, ch);
    if (!place) { const c = document.createElement("canvas"); c.width = cw; c.height = ch; const x = c.getContext("2d", { willReadFrequently: true }); x.scale(cw / w, ch / h); f(x, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; if (rx) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry || rx); } return t; }
    const x = place.pg.c.getContext("2d", { willReadFrequently: true }); x.save(); x.translate(place.x, place.y); x.beginPath(); x.rect(0, 0, cw, ch); x.clip(); x.scale(cw / w, ch / h); f(x, w, h); x.restore();
    // les bords recopiés tout autour (sinon, de loin, la case voisine déteint sur les bords)
    for (const [sx, sy, sw, sh, dx, dy, dw, dh] of [[place.x, place.y, cw, 1, place.x, place.y - PAD, cw, PAD], [place.x, place.y + ch - 1, cw, 1, place.x, place.y + ch, cw, PAD], [place.x, place.y - PAD, 1, ch + 2 * PAD, place.x - PAD, place.y - PAD, PAD, ch + 2 * PAD], [place.x + cw - 1, place.y - PAD, 1, ch + 2 * PAD, place.x + cw, place.y - PAD, PAD, ch + 2 * PAD]])
      try { x.drawImage(place.pg.c, sx, sy, sw, sh, dx, dy, dw, dh); } catch (e) {}
    const t = place.pg.t.clone(); t.offset.set(place.x / PAGE, 1 - (place.y + ch) / PAGE); t.repeat.set(cw / PAGE, ch / PAGE); t.needsUpdate = true; return t; };
  const mat = (o) => new THREE.MeshStandardMaterial({ roughness: .85, ...o });
  const add = (geo, m, x, y, z, par = scene, ry = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.y = ry; o.receiveShadow = true; par.add(o); return o; };
  const box = (w, h, d, m, x, y, z, par = scene, ry = 0) => add(new THREE.BoxGeometry(w, h, d), m, x, y, z, par, ry);
  const cyl = (rt, rb, h, m, x, y, z, par = scene, seg = 12) => add(new THREE.CylinderGeometry(rt, rb, h, seg), m, x, y, z, par);
  let graine = 23; const al = () => (graine = (graine * 16807) % 2147483647) / 2147483647;
  const NUIT = [], TERR = [], PEINT = [], MARCH = [], SERV = [], JOUR = []; const lum = (m, j, n) => { NUIT.push([m, j, n]); return m; };
  const serif = "Georgia, 'Times New Roman', serif";
  const fit = (c, txt, maxW, px, font) => { let p = px; c.font = `${font.replace("@", p + "px")}`; while (c.measureText(txt).width > maxW && p > 8) { p -= 2; c.font = `${font.replace("@", p + "px")}`; } return p; };
  const SQ = { x0: -13, x1: 13, z0: -9, z1: 9 }, YS = .14;   // le carré des peintres (surélevé d'une bordure de pierre)
  const XO = -21.5, XE = 19.5, ZN = -16.5, ZS = 15.5;
  const OB = [], LEDC = [], HALO = [], ARD = [], POTS = [], ATT = [], STORES = [], MAISONS = [];
  /* le soir : sous chaque lampadaire, la flaque de lumière dorée sur les pavés (un seul matériau, fondu avec le reste) ; autour de chaque lanterne, le halo (tous en un seul nuage de points) */
  const flaqueT = tT(128, 128, (c, w, h) => { const g = c.createRadialGradient(64, 64, 2, 64, 64, 62); g.addColorStop(0, "rgba(255,190,110,1)"); g.addColorStop(.45, "rgba(255,160,80,.45)"); g.addColorStop(1, "rgba(255,140,60,0)"); c.fillStyle = g; c.fillRect(0, 0, w, h); });
  const flaqueM = new THREE.MeshBasicMaterial({ map: flaqueT, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  const flaque = (MOBILE || GPU_MODESTE) ? () => {} : (x, z, r, y = .03) => { const p = add(new THREE.PlaneGeometry(r * 2, r * 2), flaqueM, x, y, z); p.rotation.x = -Math.PI / 2; };   /* (toutes fondues en une seule) */   // (les obstacles : arbres, chevalets, poteaux)   // les façades : ouest (les restaurants), est, nord, sud

  /* ---------- le sol : les pavés de granit, gris-bleu, arrondis par les années ; la bordure de pierre du carré ---------- */
  /* les pavés de grès et de granit (d'après les photos) : de petits pavés rectangulaires posés en rangs, aux couleurs mêlées — gris, beige, ocre, brun, un peu de rouille —,
     les joints sombres, les arêtes usées, le luisant de la pluie */
  const PAV = [[128, 126, 126], [146, 138, 126], [160, 150, 134], [132, 118, 104], [142, 120, 104], [110, 106, 104], [170, 162, 148], [120, 118, 120], [136, 130, 124]];   // (des teintes sourdes, comme sur les photos)
  const PCACHE = new Map(); const paves = (teinte) => { if (PCACHE.has(teinte)) { const t = PCACHE.get(teinte).clone(); t.needsUpdate = true; return t; } const t0 = paves0(teinte); PCACHE.set(teinte, t0); return t0; };
  const paves0 = (teinte) => tT(512, 512, (c, w, h) => { const d = (teinte - 130) * .5; c.fillStyle = "#2e2a26"; c.fillRect(0, 0, w, h); const rh = 21;
    for (let y = 0; y < h; y += rh) { let x = -(al() * 30); while (x < w) { const pw = 22 + al() * 16, [r, g2, b] = PAV[(al() * PAV.length) | 0], v = (al() - .5) * 22 + d;
        const X = x + 1.5, Y = y + 1.5, W2 = pw - 3, H2 = rh - 3; c.fillStyle = `rgb(${r + v | 0},${g2 + v | 0},${b + v | 0})`; c.beginPath(); c.roundRect ? c.roundRect(X, Y, W2, H2, 4) : c.rect(X, Y, W2, H2); c.fill();
        c.fillStyle = "rgba(255,255,255,.13)"; c.fillRect(X + 2, Y + 1, W2 - 5, 3); c.fillStyle = "rgba(0,0,0,.22)"; c.fillRect(X + 2, Y + H2 - 3, W2 - 3, 3);   // l'arête usée, l'ombre
        if (al() < .25) { c.fillStyle = "rgba(255,255,255,.09)"; c.beginPath(); c.ellipse(X + W2 * .5, Y + H2 * .45, W2 * .35, H2 * .25, 0, 0, 7); c.fill(); }   // le luisant
        x += pw; } }
    for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(${al() < .5 ? "40,30,20" : "90,70,40"},.07)`; c.beginPath(); c.ellipse(al() * w, al() * h, 20 + al() * 60, 10 + al() * 30, al() * 3, 0, 7); c.fill(); } }, 1, 1);   // (les taches, l'usure)
  const pavT = paves(118); pavT.repeat.set(340 / 2.4, (36.6 + 100) / 2.4);
  { const sMat = mat({ map: pavT, roughness: .7, metalness: .05 }); L.solsPlus = []; const TX0 = -84.75, TX1 = -81.25, TZ0 = 36.6, TZ1 = 41.6;   // (le trou de la trémie du métro Abbesses)
    const dalle = (x0, x1, z0, z1, prem) => { const w = x1 - x0, h = z1 - z0, t = pavT.clone(); t.needsUpdate = true; t.repeat.set(w / 2.4, h / 2.4); t.offset.set(((x0 / 2.4) % 1 + 1) % 1, ((-z1 / 2.4) % 1 + 1) % 1);
      const s = add(new THREE.PlaneGeometry(w, h), prem ? sMat : mat({ map: t, roughness: .7, metalness: .05 }), (x0 + x1) / 2, 0, (z0 + z1) / 2); s.rotation.x = -Math.PI / 2; if (prem) L.sol = s; else L.solsPlus.push(s); };
    pavT.offset.set(((-130 / 2.4) % 1 + 1) % 1, ((-100 / 2.4) % 1 + 1) % 1);
    dalle(-130, 210, -100, TZ0, true); dalle(-130, 210, TZ1, 100); dalle(-130, TX0, TZ0, TZ1); dalle(TX1, 210, TZ0, TZ1); }
  { const t = paves(132); t.repeat.set((SQ.x1 - SQ.x0) / 2.4, (SQ.z1 - SQ.z0) / 2.4); box(SQ.x1 - SQ.x0, YS, SQ.z1 - SQ.z0, [mat({ color: 0x8a8c90 }), mat({ color: 0x8a8c90 }), mat({ map: t, roughness: .7 }), mat({ color: 0x555 }), mat({ color: 0x8a8c90 }), mat({ color: 0x8a8c90 })], 0, YS / 2, 0);
    const bord = mat({ color: 0xa8a49a, roughness: .8 }); for (const [w, d, x, z] of [[SQ.x1 - SQ.x0 + .4, .3, 0, SQ.z0], [SQ.x1 - SQ.x0 + .4, .3, 0, SQ.z1], [.3, SQ.z1 - SQ.z0, SQ.x0, 0], [.3, SQ.z1 - SQ.z0, SQ.x1, 0]]) box(w, YS + .03, d, bord, x, (YS + .03) / 2, z); }
  // les trottoirs étroits devant les restaurants (ouest et nord), un peu surélevés
  const trotM = mat({ map: (() => { const t = paves(140); t.repeat.set(16, 2); return t; })(), roughness: .75 }), bordT = mat({ color: 0xb0aca2 });
  box(2.6, .14, ZS - ZN, trotM, XO + 1.3, .07, (ZN + ZS) / 2); box(.22, .16, ZS - ZN, bordT, XO + 2.6, .08, (ZN + ZS) / 2);
  box(XE - XO, .14, 2.4, trotM, (XO + XE) / 2, .07, ZN + 1.2); box(XE - XO, .16, .22, bordT, (XO + XE) / 2, .08, ZN + 2.4);
  const hTrot = (x, z) => ((x > XO - .1 && x < XO + 2.6 && z > ZN && z < ZS) || (z > ZN - .1 && z < ZN + 2.4 && x > XO && x < XE)) ? .14 : 0;

  /* ---------- les maisons du vieux village : enduit clair, volets, balcons de fer, toits de zinc en mansarde, cheminées ---------- */
  const facadeT = (W, H, o) => { const v3 = !!o.vitres3D; const k = (MOBILE || GPU_MODESTE) ? (o.cache ? 26 : 30) : o.cache ? 32 : 38,   /* (sur téléphone : des façades moins lourdes en mémoire) */ cw = Math.round(W * k), ch = Math.round(H * k); let jour, nuit;
    jour = tT(cw, ch, (c) => { c.fillStyle = o.teinte; c.fillRect(0, 0, cw, ch); for (let i = 0; i < 1400; i++) { c.fillStyle = `rgba(${al() < .5 ? "0,0,0" : "255,255,255"},${al() * .05})`; c.fillRect(al() * cw, al() * ch, 2 + al() * 10, 2 + al() * 8); }
      if (o.pierre) { const bh = .42 * k; for (let y = ch; y > 0; y -= bh) { const off = ((ch - y) / bh | 0) % 2 ? .45 * k : 0; c.fillStyle = "rgba(90,70,40,.28)"; c.fillRect(0, y, cw, 2); for (let x = off; x < cw; x += .9 * k) { c.fillRect(x, y - bh, 2, bh); c.fillStyle = `rgba(${al() < .5 ? "120,90,50" : "255,240,210"},${al() * .12})`; c.fillRect(x + 2, y - bh + 2, .9 * k - 4, bh - 4); c.fillStyle = "rgba(90,70,40,.28)"; } } }
      for (let i = 0; i < 6; i++) { const x = al() * cw, gr = c.createLinearGradient(0, ch * .3, 0, ch); gr.addColorStop(0, "rgba(70,60,40,0)"); gr.addColorStop(1, "rgba(70,60,40,.12)"); c.fillStyle = gr; c.fillRect(x, ch * .3, 6 + al() * 20, ch * .7); }   // (les coulures, le bas des murs plus sale)
      const nE = o.etages, hE = (H - 3.8) / nE, nF = o.fen || Math.max(2, Math.round(W / 2.6));
      c.fillStyle = "rgba(0,0,0,.12)"; for (let e = 0; e <= nE; e++) c.fillRect(0, ch - (3.8 + e * hE) * k, cw, 4);   // les bandeaux
      /* les fenêtres (d'après les photos) : la haute porte-fenêtre à la française, son encadrement de pierre et son appui, les deux battants blancs à petits carreaux,
         le voilage, le reflet du ciel ; les persiennes ouvertes à lames ; le garde-corps de fer forgé à volutes ; au premier, parfois, le long balcon filant */
      const vol = o.volets === false ? null : (o.volets || "#d8d2c4"), clair = "rgba(255,250,240,.38)", ombreP = "rgba(60,45,25,.35)";
      if (!v3)       for (let e = 0; e < nE; e++) { const longB = o.longBalcon === e || (o.longBalcon === undefined && e === 1 && nE >= 3 && (W * 7 | 0) % 3 === 0);
        if (longB) { const yB = ch - (3.8 + e * hE + hE * .1) * k; c.fillStyle = "rgba(0,0,0,.28)"; c.fillRect(0, yB, cw, .12 * k); c.fillStyle = "#c8c0b0"; c.fillRect(0, yB - .1 * k, cw, .1 * k); }
        for (let f = 0; f < nF; f++) { if (o.sansEtage && o.sansEtage.includes(e)) continue; const fx = (W / nF) * (f + .5), fy = 3.8 + e * hE + hE * .14, fw = 1.06, fh = Math.min(hE * .7, 2.15), X = (fx - fw / 2) * k, Y = ch - (fy + fh) * k, Wp = fw * k, Hp = fh * k;
          // l'encadrement de pierre, la clé, l'appui
          c.fillStyle = clair; c.fillRect(X - .14 * k, Y - .16 * k, Wp + .28 * k, Hp + .16 * k); c.fillStyle = "rgba(255,250,240,.5)"; c.fillRect(X + Wp / 2 - .1 * k, Y - .2 * k, .2 * k, .2 * k);
          c.fillStyle = "rgba(255,250,240,.55)"; c.fillRect(X - .2 * k, Y + Hp, Wp + .4 * k, .09 * k); c.fillStyle = ombreP; c.fillRect(X - .2 * k, Y + Hp + .09 * k, Wp + .4 * k, .05 * k);
          // la baie : le fond, le voilage, le reflet du ciel
          const gv = c.createLinearGradient(0, Y, 0, Y + Hp); gv.addColorStop(0, "#6c7c88"); gv.addColorStop(.35, "#2a323a"); gv.addColorStop(1, "#1a1e22"); c.fillStyle = gv; c.fillRect(X, Y, Wp, Hp);
          if ((f + e * 3 + (W | 0)) % 3) { c.fillStyle = "rgba(240,236,226,.55)"; c.fillRect(X + .04 * k, Y + .05 * k, Wp * .3, Hp - .1 * k); c.fillRect(X + Wp * .66, Y + .05 * k, Wp * .3, Hp - .1 * k); }   // les voilages
          c.fillStyle = "rgba(255,255,255,.16)"; c.beginPath(); c.moveTo(X, Y + Hp * .1); c.lineTo(X + Wp * .5, Y); c.lineTo(X + Wp * .7, Y); c.lineTo(X, Y + Hp * .4); c.fill();
          c.fillStyle = ombreP; c.fillRect(X, Y, Wp, .05 * k); c.fillRect(X, Y, .04 * k, Hp);   // la feuillure
          // les battants blancs : le dormant, le meneau, quatre rangs de petits carreaux
          c.strokeStyle = "#f4f1ea"; c.lineWidth = Math.max(1.5, .06 * k); c.strokeRect(X + .03 * k, Y + .03 * k, Wp - .06 * k, Hp - .06 * k); c.lineWidth = Math.max(1.2, .045 * k);
          c.beginPath(); c.moveTo(X + Wp / 2, Y); c.lineTo(X + Wp / 2, Y + Hp); for (let r = 1; r < 4; r++) { const yy = Y + Hp * r / 4; c.moveTo(X, yy); c.lineTo(X + Wp, yy); } c.stroke();
          // les persiennes ouvertes, de part et d'autre : le cadre, les lames
          if (vol) for (const sg of [-1, 1]) { const vw = Wp * .5, vx = sg < 0 ? X - .14 * k - vw : X + Wp + .14 * k; c.fillStyle = "rgba(0,0,0,.18)"; c.fillRect(vx + (sg < 0 ? 2 : -2), Y + 2, vw, Hp); c.fillStyle = vol; c.fillRect(vx, Y, vw, Hp);
            c.fillStyle = "rgba(0,0,0,.2)"; for (let l = Y + .08 * k; l < Y + Hp - .06 * k; l += Math.max(3, .09 * k)) { c.fillRect(vx + .05 * k, l, vw - .1 * k, Math.max(1, .03 * k)); } c.fillStyle = "rgba(255,255,255,.18)"; for (let l = Y + .1 * k; l < Y + Hp - .06 * k; l += Math.max(3, .09 * k)) c.fillRect(vx + .05 * k, l, vw - .1 * k, 1);
            c.strokeStyle = "rgba(0,0,0,.3)"; c.lineWidth = 1; c.strokeRect(vx + .5, Y + .5, vw - 1, Hp - 1); c.fillStyle = "rgba(0,0,0,.25)"; c.fillRect(vx, Y + Hp * .5 - 1, vw, 2); }
          // le garde-corps de fer forgé : les lisses, les barreaux, les volutes
          if (!longB || true) { const gy = Y + Hp * .7, gh = Hp * .3, gx0 = longB ? X - .3 * k : X - .02 * k, gx1 = longB ? X + Wp + .3 * k : X + Wp + .02 * k; c.strokeStyle = "#16181a"; c.lineWidth = Math.max(1.5, .04 * k);
            c.beginPath(); c.moveTo(gx0, gy); c.lineTo(gx1, gy); c.moveTo(gx0, gy + gh); c.lineTo(gx1, gy + gh); c.moveTo(gx0, gy + gh * .82); c.lineTo(gx1, gy + gh * .82); c.stroke(); c.lineWidth = Math.max(1, .025 * k);
            const pas = Math.max(6, .22 * k); for (let x = gx0 + pas / 2; x < gx1 - 2; x += pas) { c.beginPath(); c.moveTo(x, gy); c.lineTo(x, gy + gh * .82); c.stroke(); c.beginPath(); c.arc(x + pas / 2, gy + gh * .3, pas * .28, 0, Math.PI * 2); c.stroke(); c.beginPath(); c.arc(x + pas / 2, gy + gh * .62, pas * .2, Math.PI, Math.PI * 2); c.stroke(); } } } }
      if (o.longBalcon !== false) for (let e = 1; e < nE; e++) { const longB = o.longBalcon === e || (o.longBalcon === undefined && e === 1 && nE >= 3 && (W * 7 | 0) % 3 === 0); if (!longB) continue;
        const gy = ch - (3.8 + e * hE + hE * .14 + Math.min(hE * .7, 2.15) * .3) * k, gh = Math.min(hE * .7, 2.15) * .3 * k; c.strokeStyle = "#16181a"; c.lineWidth = Math.max(1.5, .045 * k); c.beginPath(); c.moveTo(0, gy); c.lineTo(cw, gy); c.moveTo(0, gy + gh); c.lineTo(cw, gy + gh); c.stroke();
        c.lineWidth = Math.max(1, .025 * k); const pas = Math.max(6, .22 * k); for (let x = 0; x < cw; x += pas) { c.beginPath(); c.moveTo(x, gy); c.lineTo(x, gy + gh); c.stroke(); c.beginPath(); c.arc(x + pas / 2, gy + gh * .5, pas * .3, 0, Math.PI * 2); c.stroke(); } }   // le long balcon filant
      c.fillStyle = "rgba(255,250,240,.35)"; c.fillRect(0, 0, cw, .18 * k); c.fillStyle = "rgba(0,0,0,.2)"; c.fillRect(0, .18 * k, cw, .06 * k);   // la corniche, en haut
      if (o.peint) { const [txt, coul, et, yA, hL] = o.peint, y = ch - (yA ?? (3.8 + (et + 1.03) * hE)) * k; c.textAlign = "center"; c.textBaseline = "middle"; fit(c, txt, cw * .9, Math.round((hL || Math.min(.32 * hE, .62)) * k * 1.35), `bold @ ${serif}`); c.fillStyle = "rgba(0,0,0,.35)"; c.fillText(txt, cw / 2 + 2, y + 2); c.fillStyle = coul; c.fillText(txt, cw / 2, y); } });
    if (v3 && !o.peintNuit) return lum(mat({ map: jour, roughness: .9 }), 0, 0);
    nuit = tT(cw, ch, (c) => { c.fillStyle = "#000"; c.fillRect(0, 0, cw, ch); const nE = o.etages, hE = (H - 3.8) / nE, nF = o.fen || Math.max(2, Math.round(W / 2.6));
      for (let e = 0; e < nE; e++) for (let f = 0; f < nF; f++) if (!v3 && al() < .45 && !(o.sansEtage && o.sansEtage.includes(e))) { const fx = (W / nF) * (f + .5), fy = 3.8 + e * hE + hE * .14, fw = 1.06, fh = Math.min(hE * .7, 2.15), X = (fx - fw / 2) * k, Y = ch - (fy + fh) * k; const g2 = c.createLinearGradient(0, Y, 0, Y + fh * k); g2.addColorStop(0, "#ffd890"); g2.addColorStop(1, "#e89a40"); c.fillStyle = g2; c.fillRect(X, Y, fw * k, fh * k);
        c.fillStyle = "rgba(255,240,210,.5)"; c.fillRect(X + 2, Y + 2, fw * k * .3, fh * k - 4); c.fillRect(X + fw * k * .68, Y + 2, fw * k * .3, fh * k - 4); c.strokeStyle = "#3a2a1a"; c.lineWidth = Math.max(1.2, .045 * k); c.beginPath(); c.moveTo(X + fw * k / 2, Y); c.lineTo(X + fw * k / 2, Y + fh * k); for (let r = 1; r < 4; r++) { c.moveTo(X, Y + fh * k * r / 4); c.lineTo(X + fw * k, Y + fh * k * r / 4); } c.stroke(); }
      if (o.peint && o.peintNuit) { const [txt, , et, yA, hL] = o.peint, y = ch - (yA ?? (3.8 + (et + 1.03) * hE)) * k; c.textAlign = "center"; c.textBaseline = "middle"; fit(c, txt, cw * .9, Math.round((hL || Math.min(.32 * hE, .62)) * k * 1.35), `bold @ ${serif}`); c.fillStyle = "#ffe0a0"; c.fillText(txt, cw / 2, y); } }, 0, 0, .4);
    return lum(mat({ map: jour, emissive: 0xffffff, emissiveMap: nuit, emissiveIntensity: 0, roughness: .9 }), 0, 1.0); };
  const FCACHE = new Map();
  /* (les fenêtres en relief, d'après les photos : l'embrasure de pierre et son appui, la porte-fenêtre blanche à petits carreaux enfoncée dans le mur, le voilage,
     le reflet du ciel ; les persiennes à lames, ouvertes contre le mur ; le garde-corps de fer forgé. Tout est partagé : une seule matière par sorte) */
  const verreT = (allume, voile) => tT(96, 192, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); if (allume) { g.addColorStop(0, "#ffd890"); g.addColorStop(1, "#d88a3a"); } else { g.addColorStop(0, "#8ea4b4"); g.addColorStop(.4, "#3a4652"); g.addColorStop(1, "#20262c"); } c.fillStyle = g; c.fillRect(0, 0, w, h);
      if (!allume) { c.fillStyle = "rgba(255,255,255,.22)"; c.beginPath(); c.moveTo(0, h * .15); c.lineTo(w * .55, 0); c.lineTo(w * .8, 0); c.lineTo(0, h * .45); c.fill(); }
      if (voile) { c.fillStyle = allume ? "rgba(255,245,220,.55)" : "rgba(245,242,234,.7)"; c.fillRect(4, 4, w * .3, h - 8); c.fillRect(w * .66, 4, w * .3, h - 8); c.fillStyle = "rgba(0,0,0,.08)"; for (let x = 6; x < w * .3; x += 5) { c.fillRect(x, 4, 1, h - 8); c.fillRect(w * .66 + x, 4, 1, h - 8); } }
      c.fillStyle = "#f4f1ea"; c.fillRect(w / 2 - 2.5, 0, 5, h); for (let r = 1; r < 4; r++) c.fillRect(0, h * r / 4 - 2, w, 4); c.fillStyle = "rgba(0,0,0,.25)"; for (let r = 1; r < 4; r++) c.fillRect(0, h * r / 4 + 2, w, 1); });
  const VER = { a: mat({ map: verreT(false, false), roughness: .15, metalness: .25 }), b: mat({ map: verreT(false, true), roughness: .15, metalness: .25 }) };
  { const tA = verreT(true, true); VER.c = lum(mat({ map: VER.b.map, emissive: 0xffffff, emissiveMap: tA, emissiveIntensity: 0, roughness: .15, metalness: .25 }), 0, 1.15); }
  const blancF = mat({ color: 0xf4f1ea, roughness: .5 }), VOL = new Map(), voletT = tT(48, 160, (c, w, h) => { c.fillStyle = "#ffffff"; c.fillRect(0, 0, w, h); c.fillStyle = "rgba(0,0,0,.28)"; for (let y = 8; y < h - 6; y += 6) c.fillRect(4, y, w - 8, 2); c.fillStyle = "rgba(255,255,255,.9)"; for (let y = 10; y < h - 6; y += 6) c.fillRect(4, y, w - 8, 1); c.strokeStyle = "rgba(0,0,0,.35)"; c.lineWidth = 3; c.strokeRect(2, 2, w - 4, h - 4); c.fillStyle = "rgba(0,0,0,.3)"; c.fillRect(2, h / 2 - 2, w - 4, 4); });
  const voletM = (coul) => VOL.get(coul) || VOL.set(coul, mat({ map: voletT, color: coul, roughness: .6 })).get(coul);
  const grilleT = tT(256, 64, (c, w, h) => { c.clearRect(0, 0, w, h); c.strokeStyle = "#141618"; c.lineWidth = 5; c.strokeRect(2, 3, w - 4, h - 6); c.lineWidth = 2.5; for (let x = 10; x < w; x += 16) { c.beginPath(); c.moveTo(x, 4); c.lineTo(x, h - 4); c.stroke(); c.beginPath(); c.arc(x + 8, h * .35, 5, 0, Math.PI * 2); c.stroke(); c.beginPath(); c.arc(x + 8, h * .7, 4, Math.PI, Math.PI * 2); c.stroke(); } }, 0, 0, 1, true);
  const grilleM = new THREE.MeshStandardMaterial({ map: grilleT, transparent: true, alphaTest: .5, side: THREE.DoubleSide, roughness: .6, metalness: .4 });
  const fenetres3D = (g, W, H, o) => { const nE = o.etages, hE = (H - 3.8) / nE, nF = o.fen || Math.max(2, Math.round(W / 2.6)), pierreF = mat({ color: new THREE.Color(o.teinte || "#ece6d8").offsetHSL(0, -.05, .05).getHex(), roughness: .85 }), vol = o.volets === false ? null : o.volets || "#d8d2c4";
    for (let e = 0; e < nE; e++) for (let f = 0; f < nF; f++) { if (o.sansEtage && o.sansEtage.includes(e)) continue; const fx = -W / 2 + (W / nF) * (f + .5), fw = 1.06, fh = Math.min(hE * .7, 2.15), fy = 3.8 + e * hE + hE * .14, cy = fy + fh / 2;
      add(new THREE.PlaneGeometry(fw, fh), al() < .4 ? VER.c : (f + e) % 3 ? VER.b : VER.a, fx, cy, -.14, g);   // la vitre, enfoncée dans le mur
      for (const sx of [-1, 1]) box(.05, fh, .14, blancF, fx + sx * (fw / 2 - .025), cy, -.08, g); box(fw, .05, .14, blancF, fx, fy + fh - .025, -.08, g); box(fw, .07, .14, blancF, fx, fy + .035, -.08, g);   // le dormant blanc
      for (const sx of [-1, 1]) box(.16, fh + .1, .1, pierreF, fx + sx * (fw / 2 + .08), cy + .05, .02, g); box(fw + .42, .2, .12, pierreF, fx, fy + fh + .12, .03, g); box(fw + .5, .08, .26, pierreF, fx, fy - .04, .08, g);   // l'encadrement, le linteau, l'appui
      if (vol) for (const sx of [-1, 1]) box(fw * .5, fh, .035, voletM(vol), fx + sx * (fw / 2 + .16 + fw * .25), cy, .03, g);   // les persiennes ouvertes
      if (e === 0 && o.balcon !== false) add(new THREE.PlaneGeometry(fw + .1, fh * .32), grilleM, fx, fy + fh * .17, .08, g); } };
  const zinc = mat({ color: 0x5e656c, roughness: .55, metalness: .5 }), briq = mat({ color: 0x9a5a44 }), cote = mat({ color: 0xd9d0bf });
  // une maison : la façade face à +z dans son repère ; o.rdc : la devanture du rez-de-chaussée
  /* la salle derrière la vitrine : le fond (l'intérieur peint : comptoir, étagères, lampes, tableaux), le plancher, le plafond et ses globes, les murs ; un comptoir, des tables : de la profondeur derrière le verre */
  const parquetM = mat({ color: 0x6a4428, roughness: .7 }), plafondM = mat({ color: 0xe8dcc0, roughness: .9 }), murSalle = mat({ color: 0xd8c8a4, roughness: .9 }), comptoirM = mat({ color: 0x4a2a16, roughness: .45 }), zincM = mat({ color: 0xb8bcc0, metalness: .7, roughness: .3 });
  const globeM = lum(mat({ color: 0xfff0d0, emissive: 0xffd090, emissiveIntensity: .5 }), .5, 1.6);
  /* (10.86) l'intérieur, selon la boutique : le café (le damier, le comptoir mouluré, le zinc, les tabourets, le percolateur, le miroir et ses étagères de bouteilles, l'ardoise, les tableaux, la plante),
     la galerie (les murs blancs, les toiles encadrées et leurs spots, la banquette), la boulangerie (la vitrine réfrigérée, les pains, les baguettes), la boutique (les rayonnages pleins) ; tout fondu ensuite */
  const damierM = mat({ map: tT(128, 128, (c) => { for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { c.fillStyle = (i + j) % 2 ? "#2a2622" : "#e8e0d0"; c.fillRect(i * 16, j * 16, 16, 16); } }, 3, 2), roughness: .35 });
  const lambrisM = mat({ color: 0x5a3420, roughness: .5 }), moulureM = mat({ color: 0x7a4a28, roughness: .45 }), laitonM = mat({ color: 0xc8a050, metalness: .8, roughness: .3 }), chromeM = mat({ color: 0xd0d4d8, metalness: .9, roughness: .2 }), noirS = mat({ color: 0x1a1a1a, roughness: .5 });
  const miroirM = mat({ color: 0x8a94a0, metalness: .7, roughness: .12 }), cuirM = mat({ color: 0x7a1a1a, roughness: .55 }), marbreS = mat({ color: 0xe8e4dc, roughness: .25 }), boisS = mat({ color: 0x6a3a1c, roughness: .55 }), verreS2 = mat({ color: 0xdfeeee, roughness: .05, transparent: true, opacity: .35 });
  const BOUTL = [0x1f4a22, 0x6a3a10, 0xd8d0a8, 0x4a1218, 0x2a6a5a].map(c2 => mat({ color: c2, roughness: .15, metalness: .1 })), OBJ = [0xc83a2a, 0x2a6aa8, 0xe8c040, 0x3a8a4a, 0xf2efe6, 0x8a3a8a].map(c2 => mat({ color: c2, roughness: .6 }));
  const galMurM = mat({ color: 0xf4f1ea, roughness: .9 }), doreM = mat({ color: 0xb8903a, metalness: .6, roughness: .35 }), painM = mat({ color: 0xc8883a, roughness: .8 }), painC = mat({ color: 0xe0b060, roughness: .85 }), planteM = mat({ color: 0x2a5a24, roughness: .9 }), potS = mat({ color: 0xa85a3a, roughness: .8 });
  const ardoiseM = mat({ map: tT(96, 128, (c, w, h) => { c.fillStyle = "#1e2422"; c.fillRect(0, 0, w, h); c.fillStyle = "#f2efe6"; c.font = "italic bold 15px Georgia, serif"; c.textAlign = "center"; c.fillText("Menu", w / 2, 20); c.font = "9px Georgia, serif"; ["Soupe à l'oignon", "Croque-monsieur", "Bœuf bourguignon", "Crème brûlée", "Café · 2,50"].forEach((t, i) => c.fillText(t, w / 2, 40 + i * 17)); c.strokeStyle = "#7a4a28"; c.lineWidth = 6; c.strokeRect(0, 0, w, h); }), roughness: .8 });
  let kSal = 0; const TBS = (W) => { const r = []; for (let x = -W / 2 + 1.05; x < W / 2 - .9; x += 1.5) r.push(x); return r; };   /* (10.88) les tables de la salle, sur toute la largeur */
  const salleDerriere = (g, W) => { const S = g.userData.salle; if (!S) return; const { HR, PR, D } = S, fond = g.userData.vInt || murSalle, ge = g.userData.genre || "cafe", Q = new THREE.Group(), riche = !PETIT, ks = kSal++; g.add(Q);
    box(W, HR, D - PR, [cote, cote, cote, cote, fond, cote], 0, HR / 2, -PR - (D - PR) / 2, g);   // le fond de la salle, et le reste de la maison
    const pf = add(new THREE.PlaneGeometry(W, PR), ge === "cafe" ? damierM : parquetM, 0, .02, -PR / 2, Q); pf.rotation.x = -Math.PI / 2; const pc = add(new THREE.PlaneGeometry(W, PR), plafondM, 0, HR - .02, -PR / 2, Q); pc.rotation.x = Math.PI / 2;
    for (const sx of [-1, 1]) { const m = add(new THREE.PlaneGeometry(PR, HR), ge === "galerie" ? galMurM : murSalle, sx * (W / 2 - .02), HR / 2, -PR / 2, Q); m.rotation.y = -sx * Math.PI / 2; const mo = add(new THREE.PlaneGeometry(PR, HR), cote, sx * (W / 2 + .005), HR / 2, -PR / 2, Q); mo.rotation.y = sx * Math.PI / 2;   /* (10.88) le mur vu du dehors, au coin d'une rue : plus de trou */
      if (ge !== "galerie") { box(.04, .95, PR - .05, lambrisM, sx * (W / 2 - .04), .48, -PR / 2, Q); box(.07, .05, PR - .05, moulureM, sx * (W / 2 - .05), .98, -PR / 2, Q); if (riche) for (let z = -.4; z > -PR + .25; z -= .6) box(.02, .6, .45, moulureM, sx * (W / 2 - .065), .48, z, Q); } }   // les lambris
    box(W, .12, .1, ge === "galerie" ? galMurM : moulureM, 0, HR - .08, -PR + .06, Q);
    for (let x = -W / 2 + .9; x < W / 2 - .6; x += 1.6) { add(new THREE.SphereGeometry(.13, 8, 6), globeM, x, HR - .45, -PR / 2, Q); cyl(.006, .006, .4, comptoirM, x, HR - .22, -PR / 2, Q, 3); }   // les globes
    const cX = W * .12, cW = W * .55, zC = -PR + .45, tabl = (w, h, k2, x, y, z, ry) => { const f = box(w + .08, h + .08, .04, doreM, x, y, z, Q); f.rotation.y = ry; const t = add(new THREE.PlaneGeometry(w, h), TABL[k2 % TABL.length], x + Math.sin(ry) * .025, y, z + Math.cos(ry) * .025, Q); t.rotation.y = ry; };
    if (ge === "cafe") {
      box(cW, 1.05, .5, comptoirM, cX, .53, zC, Q); box(cW + .1, .05, .58, zincM, cX, 1.08, zC, Q); box(cW, .035, .035, laitonM, cX, .18, zC + .33, Q);   // le comptoir, son zinc, la barre de pied
      if (riche) for (let x = cX - cW / 2 + .3; x < cX + cW / 2 - .15; x += .5) box(.38, .62, .02, moulureM, x, .55, zC + .26, Q);
      for (let x = cX - cW / 2 + .4; x < cX + cW / 2 - .2; x += .75) { cyl(.17, .17, .07, cuirM, x, .78, zC + .66, Q, 10); cyl(.025, .025, .76, laitonM, x, .38, zC + .66, Q, 5); cyl(.16, .16, .02, laitonM, x, .02, zC + .66, Q, 10); }   // les tabourets de bar
      const xm = cX + cW / 2 - .45; box(.46, .42, .32, chromeM, xm, 1.32, zC, Q); box(.48, .05, .34, noirS, xm, 1.56, zC, Q); for (const d of [-.1, .1]) { cyl(.04, .032, .06, marbreS, xm + d, 1.14, zC + .1, Q, 8); cyl(.012, .012, .1, noirS, xm + d, 1.23, zC + .12, Q, 4); }   // le percolateur, les tasses
      for (const d of [-.15, 0, .15]) cyl(.02, .02, .32, laitonM, cX - cW / 4 + d, 1.27, zC - .1, Q, 5);   // les pompes à bière
      for (let i = 0; i < 3; i++) cyl(.035, .028, .12, verreS2, cX - cW / 8 + i * .16, 1.17, zC + .12, Q, 8);
      box(cW, 1.1, .02, miroirM, cX, 2.2, -PR + .03, Q); box(cW + .1, .06, .05, laitonM, cX, 2.78, -PR + .05, Q);   // le miroir du fond
      for (const y of riche ? [1.42, 1.84] : [1.6]) { box(cW, .03, .2, comptoirM, cX, y, -PR + .12, Q); for (let x = cX - cW / 2 + .1, i = 0; x < cX + cW / 2 - .05; x += .13, i++) { const h = .2 + ((i * 7 + ks) % 3) * .05, b = BOUTL[(i + ks) % 5]; cyl(.034, .034, h, b, x, y + .015 + h / 2, -PR + .12, Q, 6); if (riche) cyl(.012, .012, .08, b, x, y + h + .055, -PR + .12, Q, 4); } }   // les bouteilles
      for (const x of TBS(W)) { cyl(.3, .3, .03, marbreS, x, .74, -1.1, Q, 14); cyl(.03, .03, .72, fonteM, x, .37, -1.1, Q, 5); cyl(.18, .2, .03, fonteM, x, .02, -1.1, Q, 10);
        for (const sg of [-1, 1]) { cyl(.19, .19, .04, boisS, x + sg * .52, .46, -1.1, Q, 10); for (const [a, b] of [[-.12, -.12], [.12, -.12], [-.12, .12], [.12, .12]]) cyl(.013, .013, .46, boisS, x + sg * .52 + a, .23, -1.1 + b, Q, 4); box(.03, .38, .32, boisS, x + sg * .68, .75, -1.1, Q); }
        cyl(.035, .03, .12, verreS2, x + .08, .82, -1.05, Q, 8); cyl(.04, .032, .06, marbreS, x - .1, .79, -1.15, Q, 8); }   // les tables de marbre, les chaises de bistrot, un verre, un café
      const ar = add(new THREE.PlaneGeometry(.6, .8), ardoiseM, -W / 2 + .07, 1.75, -PR * .55, Q); ar.rotation.y = Math.PI / 2;   // l'ardoise du menu
      if (riche) { tabl(.42, .52, ks * 3, W / 2 - .06, 1.85, -.75, -Math.PI / 2); tabl(.36, .44, ks * 3 + 1, W / 2 - .06, 1.9, -1.6, -Math.PI / 2); }
      cyl(.16, .12, .32, potS, -W / 2 + .35, .16, -PR + .35, Q, 8); for (let i = 0; i < 4; i++) add(new THREE.IcosahedronGeometry(.17 + i * .03, 0), planteM, -W / 2 + .3 + (i % 2) * .1, .5 + i * .15, -PR + .32 + (i % 3) * .05, Q); }
    else if (ge === "galerie") {
      box(1.1, .75, .5, boisS, W * .28, .38, -PR + .6, Q); cyl(.12, .1, .05, laitonM, W * .28 + .35, .78, -PR + .55, Q, 8); cyl(.01, .01, .3, laitonM, W * .28 + .35, .93, -PR + .55, Q, 3);   // le bureau du galeriste, sa lampe
      box(1.2, .42, .42, cuirM, -W * .1, .21, -1.25, Q);   // la banquette
      for (const sx of [-1, 1]) for (let i = 0; i < 2; i++) { const z = -.7 - i * 1.1; tabl(.62, .76, ks * 5 + i + (sx > 0 ? 2 : 0), sx * (W / 2 - .06), 1.7, z, -sx * Math.PI / 2); cyl(.05, .07, .14, noirS, sx * (W / 2 - .5), HR - .09, z, Q, 6); }
      for (const [i, x] of [-W / 3, 0, W / 3].entries()) { tabl(.7, .86, ks * 7 + i + 4, x, 1.8, -PR + .06, 0); cyl(.05, .07, .14, noirS, x, HR - .09, -PR + .5, Q, 6); } }
    else if (ge === "pain") {
      box(W * .6, .85, .55, comptoirM, cX, .43, zC, Q); box(W * .6, .3, .5, verreS2, cX, 1.0, zC, Q); box(W * .6 + .04, .03, .54, marbreS, cX, 1.16, zC, Q);   // la vitrine des gâteaux
      for (let i = 0; i < 8; i++) add(new THREE.SphereGeometry(.07, 8, 5), [painM, painC, OBJ[0], OBJ[2]][i % 4], cX - W * .27 + i * W * .075, .92, zC + (i % 2) * .12 - .06, Q).scale.y = .6;
      for (const y of [1.3, 1.7, 2.1]) { box(W * .7, .03, .3, boisS, cX, y, -PR + .17, Q); for (let x = cX - W * .33, i = 0; x < cX + W * .33; x += .26, i++) { if ((i + y * 10) % 3 < 1) { const b = cyl(.04, .035, .5, painC, x, y + .06, -PR + .17, Q, 6); b.rotation.z = Math.PI / 2; } else add(new THREE.SphereGeometry(.11, 8, 6), painM, x, y + .08, -PR + .17, Q).scale.y = .6; } }
      { const nap = mat({ color: 0xf2ece0, roughness: .8 }), gat = [0xf0d8e0, 0x6a3a1a, 0xf2e8c8, 0xc83a4a, 0x8ac060].map(c2 => mat({ color: c2, roughness: .6 })), cro = mat({ color: 0xd89a40, roughness: .7 });   /* (10.91) l'étal juste derrière la vitrine : les gâteaux, les tartes, les croissants, les baguettes en panier — vus de la rue */
        box(W - 1, .78, .5, boisS, 0, .39, -.45, Q); box(W - .96, .02, .54, nap, 0, .79, -.45, Q);
        for (let x = -W / 2 + .8, i = 0; x < W / 2 - .6; x += .42, i++) { const k = (i + ks) % 4; if (k === 0) { cyl(.13, .13, .08, gat[i % 5], x, .84, -.45, Q, 12); cyl(.135, .135, .015, gat[(i + 2) % 5], x, .885, -.45, Q, 12); }
          else if (k === 1) { cyl(.14, .14, .02, marbreS, x, .81, -.45, Q, 12); for (let q = 0; q < 3; q++) { const c3 = add(new THREE.TorusGeometry(.045, .022, 5, 8, Math.PI), cro, x + (q - 1) * .08, .845, -.45 + (q % 2) * .06, Q); c3.rotation.x = -Math.PI / 2; } }
          else if (k === 2) { cyl(.15, .15, .03, gat[2], x, .82, -.45, Q, 12); for (let q = 0; q < 6; q++) add(new THREE.SphereGeometry(.025, 6, 4), gat[3], x + Math.cos(q) * .08, .85, -.45 + Math.sin(q) * .08, Q); }
          else { cyl(.12, .1, .2, mat({ color: 0x8a6a3a, roughness: .9 }), x, .9, -.45, Q, 8); for (let q = 0; q < 4; q++) { const b2 = cyl(.025, .025, .55, painC, x + (q - 1.5) * .04, 1.1, -.45, Q, 5); b2.rotation.z = (q - 1.5) * .12; } } } }
        for (const sx of [-1, 1]) for (const y of [.9, 1.35, 1.8]) { box(.3, .03, PR - .6, boisS, sx * (W / 2 - .17), y, -PR / 2, Q); for (let z = -.5, j = 0; z > -PR + .4; z -= .26, j++) add(new THREE.SphereGeometry(.1, 8, 6), j % 2 ? painM : painC, sx * (W / 2 - .2), y + .07, z, Q).scale.y = .6; }   // les étagères à pains, sur les côtés
      cyl(.2, .16, .45, mat({ color: 0x8a6a3a, roughness: .9 }), -W / 2 + .5, .23, -PR + .4, Q, 10); for (let i = 0; i < 7; i++) { const b = cyl(.03, .03, .7, painC, -W / 2 + .45 + (i % 3) * .05, .7, -PR + .35 + (i % 2) * .08, Q, 5); b.rotation.z = (i - 3) * .06; } }   // le panier de baguettes
    else {
      box(1.3, .95, .5, comptoirM, W * .25, .48, -PR + .55, Q); box(.32, .22, .26, noirS, W * .25 + .3, 1.06, -PR + .55, Q);   // le comptoir, la caisse
      for (const sx of [-1, 1]) { for (const z of [-.25, -PR + .25]) box(.32, 2.4, .03, boisS, sx * (W / 2 - .18), 1.2, z, Q);
        for (const y of [.45, .95, 1.45, 1.95]) { box(.32, .03, PR - .5, boisS, sx * (W / 2 - .18), y, -PR / 2, Q); if (riche || y < 1.2) for (let z = -.45, j = 0; z > -PR + .4; z -= .2, j++) box(.12, .14 + ((j * 7 + ks) % 3) * .05, .12, OBJ[(j + ks + y * 10 | 0) % 6], sx * (W / 2 - .2), y + .1, z, Q); } }
      box(1, .75, .6, boisS, -W * .08, .38, -1.25, Q); for (let i = 0; i < 6; i++) box(.16, .1, .2, OBJ[(i + ks) % 6], -W * .08 - .35 + (i % 3) * .35, .8, -1.4 + (i / 3 | 0) * .3, Q); }
    g.updateMatrixWorld(true); if (ge === "cafe") { const pt = (x, z) => new THREE.Vector3(x, 0, z).applyMatrix4(g.matrixWorld), r0 = g.rotation.y, S2 = { bar: [pt(cX - cW / 2 - .38, zC), r0], assis: [] };   /* (les places des gens, dans la salle : le barman au bout du comptoir, les clients aux tables et au bar) */
      for (const x of TBS(W)) for (const sg of [-1, 1]) S2.assis.push([pt(x + sg * .52, -1.1), .5, r0 - sg * Math.PI / 2]);
      for (let x = cX - cW / 2 + .4; x < cX + cW / 2 - .2; x += 1.5) S2.assis.push([pt(x, zC + .66), .83, r0 + Math.PI]); SALLES.push(S2); }
    for (const o of [...Q.children]) scene.attach(o); g.remove(Q); };
  const maison = (x, z, ry, W, H, o) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g); g.userData.W = W; MAISONS.push({ g, W, D: 9 }); const D = 9;
    o.vitres3D = true; const cle = o.cache && [o.teinte, o.volets, o.etages, W, H, o.pierre, 3].join("|"), fM = cle ? (FCACHE.get(cle) || FCACHE.set(cle, facadeT(W, H, o)).get(cle)) : facadeT(W, H, o); const cleC = ["côté", o.teinte, o.volets, o.etages, H].join("|"), cM = o.pignon ? cote : (FCACHE.get(cleC) || FCACHE.set(cleC, facadeT(D, H, { teinte: o.teinte || "#ece6d8", volets: o.volets === false ? "#f2f2ee" : o.volets, etages: o.etages || 3, fen: 3, balcon: false, cache: true })).get(cleC));   // (les murs de côté, ceux qu'on voit dans les passages : des fenêtres aussi)
    const salle = !!o.rdc && !o.pignon && !o.sansSalle, HR = 3.62, PR = 2.6;
    if (salle) { const haut = new THREE.BoxGeometry(W, H - HR, D), uv = haut.attributes.uv, k = HR / H; for (const gi of [0, 1, 4]) for (let v = gi * 4; v < gi * 4 + 4; v++) uv.setY(v, k + uv.getY(v) * (1 - k));   // (l'étage : l'image de la façade sans son bas)
      add(haut, [cM, cM, cote, cote, fM, cote], 0, HR + (H - HR) / 2, -D / 2, g); g.userData.salle = { HR, PR, D }; }
    else box(W, H, D, [cM, cM, cote, cote, fM, cote], 0, H / 2, -D / 2, g);
    fenetres3D(g, W, H, o);
    if (o.pignon) { const hp = o.pignon, tri = new THREE.Shape(); tri.moveTo(-W / 2 - .15, 0); tri.lineTo(W / 2 + .15, 0); tri.lineTo(0, hp); tri.closePath();   // le pignon blanc sur la place, le toit d'ardoise
      const t = add(new THREE.ExtrudeGeometry(tri, { depth: D, bevelEnabled: false }), [cote, mat({ color: 0x3a3e46, roughness: .6 })], 0, H, -D, g); void t; box(W + .5, .14, .3, cote, 0, H + .05, .1, g);
      box(1.1, 1.4, .1, lum(mat({ color: 0x1c2228, emissive: 0xffc070, emissiveIntensity: 0 }), 0, 1), 0, H + hp * .38, .04, g); box(1.3, .12, .2, cote, 0, H + hp * .38 - .76, .1, g); box(.9, 1.8, .6, briq, W / 2 - .8, H + hp * .5 + .6, -5, g);
      if (o.rdc) o.rdc(g, W); return g; }
    // le toit en mansarde : le brisis de zinc, les lucarnes, les cheminées
    const br = box(W + .1, 2.6, .5, zinc, 0, H + 1.1, -.9, g); br.rotation.x = -.42; box(W + .1, .3, D - 2, zinc, 0, H + 2.25, -D / 2 - .3, g); box(W, 2.2, D - 2.4, zinc, 0, H + 1.1, -D / 2 - .4, g);
    const nL = Math.max(1, Math.round(W / 3.2)); for (let i = 0; i < nL; i++) { const lx = -W / 2 + (i + .5) * W / nL; box(1.0, 1.3, 1.0, cote, lx, H + 1.2, -.75, g); box(1.15, .15, 1.1, zinc, lx, H + 1.9, -.75, g); box(.6, .8, .02, lum(mat({ color: 0x1c2228, emissive: 0xffc070, emissiveIntensity: 0 }), 0, al() < .4 ? 1 : 0), lx, H + 1.15, -.24, g); }
    for (const cx of [-W / 2 + .8, W / 2 - .8]) { box(.9, 1.8, .6, briq, cx, H + 2.7, -4, g); for (let p = 0; p < 3; p++) cyl(.08, .08, .4, mat({ color: 0x9a6a50 }), cx - .25 + p * .25, H + 3.75, -4, g, 6); }
    if (o.rdc) o.rdc(g, W); salleDerriere(g, W); return g; };

  /* ---------- les devantures : boiseries, vitrines éclairées, stores bannes et leur lambrequin écrit ---------- */
  /* (les tableaux de Montmartre, d'après les peintures envoyées : une planche de 30 toiles, 8 par rang, chacune 128 × 160) */
  const TOILES = { img: null, pret: false, att: [], canv: [] }, NTOILES = 30;
  const toile3 = (c, x, y, w, h, k) => { const go = () => { const q = k % NTOILES; c.drawImage(TOILES.img, (q % 8) * 128, (q / 8 | 0) * 160, 128, 160, x, y, w, h); };
    if (TOILES.pret) go(); else { TOILES.att.push(go); TOILES.canv.push(c.canvas); if (!TOILES.img) { TOILES.img = new Image(); TOILES.img.onload = () => { TOILES.pret = true; for (const f of TOILES.att) f(); TOILES.att = [];
      scene.traverse(o => { for (const m of [].concat(o.material || [])) for (const t of [m && m.map, m && m.emissiveMap]) if (t && t.image && TOILES.canv.includes(t.image)) t.needsUpdate = true; }); }; TOILES.img.src = "images/tableaux-montmartre.jpg"; } } };
  const TABL = Array.from({ length: 14 }, (_, k) => mat({ map: tT(128, 160, (c, w, h) => { c.fillStyle = "#8a8070"; c.fillRect(0, 0, w, h); toile3(c, 0, 0, w, h, k * 2 + 1); c.strokeStyle = "#4a3418"; c.lineWidth = 5; c.strokeRect(0, 0, w, h); }, 0, 0, 1, true), roughness: .8 })),   /* (les toiles des peintres : les vrais tableaux) */ boisC = mat({ color: 0x8a6a42, roughness: .7 });
  // les panneaux de caricatures et de portraits au fusain
  /* les caricatures au fusain et à la sanguine des portraitistes du Tertre (d'après le dessin envoyé) : le papier beige, le gros nez, les sourcils broussailleux,
     la casquette, le béret, le chapeau, le chignon ; l'écharpe rouge ; des hachures, la signature */
  const caricature = (c, X, Y, W, H, k) => { let gr = 9301 + k * 49297; const r = () => (gr = (gr * 16807) % 2147483647) / 2147483647;
    c.save(); c.translate(X, Y); c.scale(W / 100, H / 130); c.fillStyle = "#e9d8b8"; c.fillRect(0, 0, 100, 130); for (let i = 0; i < 160; i++) { c.fillStyle = `rgba(${r() < .5 ? "120,90,50" : "255,250,235"},.08)`; c.fillRect(r() * 100, r() * 130, 2, 2); }
    const femme = k % 4 === 1 || k % 4 === 2 && k % 3 === 0, peau = ["#d8a888", "#c89070", "#e0b498", "#a87458"][k % 4], trait = (col, w2) => { c.strokeStyle = col; c.lineWidth = w2; c.lineCap = "round"; };
    const hach = (x0, y0, x1, y1, n, col) => { trait(col, .8); for (let i = 0; i < n; i++) { const t = i / n; c.beginPath(); c.moveTo(x0 + (x1 - x0) * t, y0); c.lineTo(x0 + (x1 - x0) * t + 6, y1); c.stroke(); } };
    // le buste, l'écharpe
    c.fillStyle = ["#3a3028", "#2a3040", "#4a3a2a", "#2a2a2a"][k % 4]; c.beginPath(); c.moveTo(18, 130); c.quadraticCurveTo(22, 96, 50, 92); c.quadraticCurveTo(80, 96, 86, 130); c.fill(); hach(24, 104, 80, 128, 18, "rgba(0,0,0,.35)");
    c.fillStyle = ["#a8382a", "#b8502a", "#8a2a3a", "#c8642a"][(k + 1) % 4]; c.beginPath(); c.moveTo(32, 96); c.quadraticCurveTo(50, 106, 70, 95); c.lineTo(66, 116); c.quadraticCurveTo(50, 112, 38, 118); c.fill(); hach(36, 98, 66, 114, 10, "rgba(80,20,10,.4)");
    // la tête : la joue, le menton en avant
    const tx = 50 + (r() - .5) * 6, hx = 21 + r() * 5, hy = 30 + r() * 4; c.fillStyle = peau; c.beginPath(); c.ellipse(tx, 58, hx, hy, (r() - .5) * .2, 0, 7); c.fill();
    trait("rgba(70,40,25,.9)", 1.3); c.stroke(); hach(tx + hx * .3, 44, tx + hx, 80, 9, "rgba(120,60,40,.35)");
    // le nez, énorme
    const nl = 14 + r() * 12; c.fillStyle = peau; c.beginPath(); c.moveTo(tx - 3, 50); c.quadraticCurveTo(tx - nl - 4, 62 + r() * 6, tx - nl, 70); c.quadraticCurveTo(tx - nl + 6, 76, tx + 2, 70); c.fill(); trait("rgba(60,35,20,.95)", 1.4); c.stroke();
    c.fillStyle = "rgba(200,90,70,.35)"; c.beginPath(); c.arc(tx - nl + 4, 68, 4, 0, 7); c.fill();
    // les yeux, les sourcils
    for (const sx of [-1, 1]) { const ex = tx + sx * 8 - 2; c.fillStyle = "#f4ece0"; c.beginPath(); c.ellipse(ex, 50, 3.6, 2.6, 0, 0, 7); c.fill(); c.fillStyle = ["#3a5a7a", "#3a2a1a", "#4a6a4a"][k % 3]; c.beginPath(); c.arc(ex - 1, 50, 1.6, 0, 7); c.fill();
      trait("#1a1210", femme ? 1.4 : 3.2); c.beginPath(); c.moveTo(ex - 5, 45 - (femme ? 0 : r() * 2)); c.quadraticCurveTo(ex, 42 - r() * 2, ex + 5, 45); c.stroke(); }
    // la bouche, la moustache, les rides
    if (femme) { c.fillStyle = "#c02a2a"; c.beginPath(); c.ellipse(tx - 3, 79, 7, 3.2, 0, 0, 7); c.fill(); c.fillStyle = "rgba(220,90,90,.35)"; for (const sx of [-1, 1]) { c.beginPath(); c.arc(tx + sx * 11, 66, 5, 0, 7); c.fill(); } trait("#1a1210", 1.2); for (const sx of [-1, 1]) for (let l = 0; l < 3; l++) { c.beginPath(); c.moveTo(tx + sx * 8 - 2 + l * 1.5 - 1.5, 47.5); c.lineTo(tx + sx * 8 - 3 + l * 2 - 2, 44.5); c.stroke(); } }
    else { if (k % 2 === 0) { c.fillStyle = "#5a4a3a"; c.beginPath(); c.ellipse(tx - 5, 75, 8, 2.6, -.1, 0, 7); c.fill(); } trait("rgba(60,30,20,.9)", 1.6); c.beginPath(); c.moveTo(tx - 10, 80); c.quadraticCurveTo(tx - 3, 83, tx + 4, 79); c.stroke(); }
    trait("rgba(90,55,35,.5)", .9); for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(tx + 6 + i * 3, 66); c.quadraticCurveTo(tx + 12 + i * 2, 74, tx + 8 + i * 2, 84); c.stroke(); }
    // l'oreille
    c.fillStyle = peau; c.beginPath(); c.ellipse(tx + hx - 2, 56, 4, 7, 0, 0, 7); c.fill(); trait("rgba(70,40,25,.8)", 1); c.stroke();
    // la coiffe
    const cf = k % 5; trait("rgba(20,15,10,.9)", 1.3);
    if (femme) { c.fillStyle = ["#5a3a22", "#1a1210", "#a87a3a", "#8a2a1a"][k % 4]; c.beginPath(); c.moveTo(tx - 26, 80); c.quadraticCurveTo(tx - 30, 20, tx + 2, 22); c.quadraticCurveTo(tx + 32, 20, tx + 28, 84); c.quadraticCurveTo(tx + 20, 60, tx + 16, 40); c.quadraticCurveTo(tx, 32, tx - 16, 42); c.quadraticCurveTo(tx - 20, 60, tx - 26, 80); c.fill(); c.beginPath(); c.arc(tx + 4, 18, 10, 0, 7); c.fill();   /* (la chevelure qui tombe, le chignon) */ hach(tx - 18, 22, tx + 26, 36, 14, "rgba(0,0,0,.3)"); c.fillStyle = "#e8d070"; c.beginPath(); c.arc(tx + hx - 2, 66, 2, 0, 7); c.fill(); }
    else if (cf === 0 || cf === 3) { c.fillStyle = ["#4a3a2a", "#3a3a3a", "#5a4a32"][k % 3]; c.beginPath(); c.moveTo(tx - 28, 36); c.quadraticCurveTo(tx - 4, 8, tx + 24, 26); c.lineTo(tx + 24, 34); c.quadraticCurveTo(tx - 4, 30, tx - 28, 38); c.fill(); c.stroke(); hach(tx - 20, 18, tx + 18, 32, 14, "rgba(0,0,0,.3)"); }   // la casquette
    else if (cf === 1) { c.fillStyle = "#1a1a24"; c.beginPath(); c.ellipse(tx + 2, 28, 24, 10, -.15, 0, 7); c.fill(); c.fillRect(tx + 1, 16, 2, 4); }   // le béret
    else if (cf === 2) { c.fillStyle = "#2a2420"; c.fillRect(tx - 14, 8, 30, 22); c.beginPath(); c.ellipse(tx + 1, 30, 26, 5, 0, 0, 7); c.fill(); }   // le chapeau
    else { c.fillStyle = "#c8c4bc"; for (let i = 0; i < 9; i++) { c.beginPath(); c.arc(tx - 14 + i * 4, 30 + Math.sin(i) * 2, 5, 0, 7); c.fill(); } }   // les cheveux blancs en bataille
    // la signature
    trait("rgba(40,30,20,.7)", .8); c.beginPath(); c.moveTo(66, 124); for (let i = 0; i < 6; i++) c.quadraticCurveTo(68 + i * 4, 118 + (i % 2) * 6, 70 + i * 4, 124); c.stroke(); c.restore(); };
  const VCACHE = new Map();
  const vitreT = (fond, motif, genre = "cafe") => { const cle = fond + genre; if (!motif && VCACHE.has(cle)) return VCACHE.get(cle); const t = tT(256, 160, (c, w, h) => {
    const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, fond); gr.addColorStop(1, "#5a2a10"); c.fillStyle = gr; c.fillRect(0, 0, w, h);
    c.fillStyle = "rgba(60,30,10,.55)"; c.fillRect(0, h * .62, w, h * .38); for (let x = 6; x < w; x += 40) { c.strokeStyle = "rgba(40,20,5,.6)"; c.lineWidth = 2; c.strokeRect(x, h * .66, 32, h * .28); }   // la boiserie du fond
    if (genre === "cafe") { c.fillStyle = "rgba(255,240,210,.25)"; c.fillRect(w * .1, h * .12, w * .8, h * .3); c.strokeStyle = "#8a6a30"; c.lineWidth = 3; c.strokeRect(w * .1, h * .12, w * .8, h * .3);   // le grand miroir
      for (let i = 0; i < 18; i++) { c.fillStyle = ["#3a6a2a", "#8a2a1a", "#d8b060", "#2a2a4a"][i % 4]; c.fillRect(w * .14 + i * w * .04, h * .46, 5, 12); } c.fillStyle = "#4a2a14"; c.fillRect(0, h * .56, w, 6);   // les bouteilles, l'étagère
      for (let i = 0; i < 4; i++) { const x = 30 + i * 62; c.fillStyle = "#e8e0d0"; c.beginPath(); c.ellipse(x, h * .8, 18, 5, 0, 0, 7); c.fill(); c.fillStyle = "#2a1a10"; c.fillRect(x - 1, h * .8, 3, h * .2); c.fillStyle = "#8a5a2a"; c.fillRect(x - 26, h * .74, 4, h * .26); c.fillRect(x + 22, h * .74, 4, h * .26); } }
    else if (genre === "boutique") { for (let r = 0; r < 3; r++) { c.fillStyle = "#4a2a14"; c.fillRect(0, h * (.3 + r * .2), w, 4); for (let i = 0; i < 14; i++) { c.fillStyle = ["#c83a2a", "#2a6aa8", "#e8c040", "#f2efe6", "#3a8a4a", "#8a3a8a"][(i + r * 3) % 6]; c.fillRect(8 + i * 18, h * (.3 + r * .2) - 14, 12, 14); } } }
    else if (genre === "pain") { for (let r = 0; r < 3; r++) { c.fillStyle = "#6a3a1a"; c.fillRect(0, h * (.4 + r * .18), w, 4); for (let i = 0; i < 10; i++) { c.fillStyle = ["#c88a40", "#e0a050", "#b87430"][i % 3]; c.beginPath(); c.ellipse(16 + i * 25, h * (.4 + r * .18) - 6, 10, 6, 0, 0, 7); c.fill(); } } }
    else if (genre === "galerie") { c.fillStyle = "#f2efe8"; c.fillRect(0, 0, w, h * .62); const k0 = (fond.length * 7 + VCACHE.size * 5) | 0; for (let i = 0; i < 5; i++) { const x = 10 + i * 50, y = 16 + (i % 2) * 10; c.fillStyle = ["#3a2a1a", "#b8902a", "#1a1a1a"][i % 3]; c.fillRect(x - 2, y - 2, 42, 54); c.fillStyle = "#888"; c.fillRect(x + 2, y + 2, 34, 46); toile3(c, x + 2, y + 2, 34, 46, k0 + i); } }   /* (les vrais tableaux, dans leurs cadres) */
    for (let i = 0; i < 4; i++) { const x = 30 + i * 64, gg = c.createRadialGradient(x, 14, 1, x, 14, 22); gg.addColorStop(0, "rgba(255,240,200,1)"); gg.addColorStop(1, "rgba(255,200,120,0)"); c.fillStyle = gg; c.fillRect(x - 22, 0, 44, 40); c.fillStyle = "#3a2a1a"; c.fillRect(x - 1, 0, 2, 8); }   // les globes suspendus
    if (motif) motif(c, w, h); const rf = c.createLinearGradient(0, 0, w, h); rf.addColorStop(0, "rgba(255,255,255,.14)"); rf.addColorStop(.4, "rgba(255,255,255,0)"); c.fillStyle = rf; c.fillRect(0, 0, w, h); }, 0, 0, 1, genre === "galerie");   // le reflet de la vitre
    if (!motif) VCACHE.set(cle, t); return t; };
  const lanterneD = (g, x, y) => { box(.04, .04, .22, fonteM, x, y + .3, .2, g); add(new THREE.BoxGeometry(.22, .3, .22), lum(mat({ color: 0xf8e8c0, emissive: 0xffd080, emissiveIntensity: .15, roughness: .3 }), .15, 2.2), x, y, .36, g); add(new THREE.ConeGeometry(.18, .14, 4), fonteM, x, y + .22, .36, g).rotation.y = Math.PI / 4; };
  const ardoise = (g, x, txt) => { const t = tT(128, 192, (c, w, h) => { c.fillStyle = "#1e2420"; c.fillRect(0, 0, w, h); c.strokeStyle = "#8a6a3a"; c.lineWidth = 8; c.strokeRect(4, 4, w - 8, h - 8); c.fillStyle = "#f2f0e8"; c.font = "italic bold 18px Georgia"; c.textAlign = "center"; c.fillText(txt || "Menu du jour", w / 2, 34); c.font = "13px Georgia"; ["Soupe à l'oignon", "Croque-monsieur", "Bœuf bourguignon", "Crème brûlée", "Café · 6 F"].forEach((l, i) => c.fillText(l, w / 2, 64 + i * 24)); });
    const a = new THREE.Group(); a.position.set(x, 0, 1.0); g.add(a); for (const s2 of [-1, 1]) { const p = box(.6, .9, .04, mat({ map: t }), 0, .46, s2 * .1, a); p.rotation.x = -s2 * .16; } ARD.push({ a, g, W: g.userData.W || 6 }); };   /* (10.88) le chevalet en A : les deux planches se rejoignent en haut ; posé plus tard, là où il n'y a pas de table */
  const rideauT = tT(64, 128, (c, w, h) => { c.fillStyle = "#a8a49a"; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 6) { c.fillStyle = "rgba(0,0,0,.25)"; c.fillRect(0, y, w, 2); } }, 1, 1);
  const verreVitrine = new THREE.MeshStandardMaterial({ color: 0xc8d8e0, transparent: true, opacity: .16, roughness: .05, metalness: .6, depthWrite: false });
  const devanture = (g, W, o) => { const bois = mat({ color: o.bois, roughness: .5 }), moulM = mat({ color: new THREE.Color(o.bois).multiplyScalar(1.25).getHex(), roughness: .45 }), Hd = 3.5;
    box(W, .5, .25, bois, 0, Hd - .1, .12, g); for (let i = 0; i <= o.travees; i++) box(.18, Hd - .3, .22, bois, -W / 2 + .1 + i * (W - .2) / o.travees, (Hd - .3) / 2, .12, g);
    const vt = vitreT(o.fondV || "#c87830", o.motif, o.genre), vM = lum(mat({ map: vt, emissive: 0xffffff, emissiveMap: vt, emissiveIntensity: .35, roughness: .15 }), .35, 1.25);
    const salle = !!g.userData.salle; g.userData.vInt = vM; { const tx = ((o.store && o.store[1]) || "") + " " + ((o.bandeau && o.bandeau[0]) || ""); g.userData.genre = o.genre || (/GALERIE/.test(tx) ? "galerie" : /BOULANG/.test(tx) ? "pain" : /FLEUR|TABAC|PRESSE|SOUVENIR|PICERIE|PRIMEUR/.test(tx) ? "boutique" : "cafe"); } const vitre = salle ? verreVitrine : vM;
    for (let i = 0; i < o.travees; i++) { const tw = (W - .2) / o.travees - .2, tx = -W / 2 + .1 + (i + .5) * (W - .2) / o.travees; if (i === o.porte) { const pM = mat({ color: o.porteC || o.bois, roughness: .5 }), pw = Math.min(tw, 1.3); box(pw, .62, .08, pM, tx, .31, .05, g); box(pw, .22, .08, pM, tx, 2.39, .05, g); for (const e of [-1, 1]) box(.13, 1.66, .08, pM, tx + e * (pw / 2 - .065), 1.45, .05, g); box(pw - .26, 1.66, .02, vitre, tx, 1.45, .05, g); box(.03, .3, .04, mat({ color: 0xc8a050, metalness: .8, roughness: .3 }), tx + pw / 2 - .2, 1.15, .11, g); box(pw - .22, .05, .1, pM, tx, .64, .07, g);   /* (10.87) la porte vitrée : on voit l'intérieur à travers */ box(tw, .62, .02, vitre, tx, 2.82, .05, g);
      if (tw > pw + .1) { for (const e of [-1, 1]) box((tw - pw) / 2, .7, .1, bois, tx + e * (pw / 2 + (tw - pw) / 4), .35, .1, g); for (const e of [-1, 1]) box((tw - pw) / 2, 1.8, .02, vitre, tx + e * (pw / 2 + (tw - pw) / 4), 1.6, .04, g); box(tw, .2, .08, pM, tx, 2.6, .05, g); } } else if (o.rideau) { box(tw, 2.9, .06, mat({ map: rideauT, roughness: .6, metalness: .4 }), tx, 1.45, .06, g); } else { box(tw, .7, .1, bois, tx, .35, .1, g); box(tw - .2, .48, .03, mat({ color: o.bois, roughness: .45, emissive: 0x000000 }), tx, .35, .17, g); box(tw - .28, .4, .02, moulM, tx, .35, .19, g);   // le soubassement et sa moulure
      box(tw, 2.3, .02, vitre, tx, 1.85, .04, g); box(tw, .04, .05, bois, tx, 2.55, .08, g); if (tw > 1.2) box(.04, 2.3, .05, bois, tx, 1.85, .08, g); } }   // les petits bois
    if (o.lanternes !== false && W > 4.5) for (const x of [-W / 2 + .45, W / 2 - .45]) lanterneD(g, x, 2.85);
    if (o.ardoise) ardoise(g, -W / 2 + 1.2, o.ardoise === true ? null : o.ardoise);
    // le store banne
    if (o.store) { const [coul, txt, txtC] = o.store, sw = o.storeW || W + .2, sX = o.storeX || 0, sd = o.storeD || 2.2; { g.updateMatrixWorld(true); const cs = [[sX - sw / 2, 0], [sX + sw / 2, 0], [sX - sw / 2, sd + .3], [sX + sw / 2, sd + .3]].map(([a, b]) => g.localToWorld(new THREE.Vector3(a, 0, b))); STORES.push([Math.min(...cs.map(v => v.x)), Math.max(...cs.map(v => v.x)), Math.min(...cs.map(v => v.z)), Math.max(...cs.map(v => v.z))]); }   /* (10.93) l'emprise du store : les lampadaires l'évitent */
      const aT = tT(512, 64, (c, w, h) => { c.fillStyle = coul; c.fillRect(0, 0, w, h); if (o.raye) { c.fillStyle = typeof o.raye === "string" ? o.raye : "rgba(255,255,255,.85)"; for (let x = 0; x < w; x += 32) c.fillRect(x, 0, 16, h); } c.fillStyle = "rgba(0,0,0,.15)"; c.fillRect(0, h - 6, w, 6); });
      const st = box(sw, .06, sd, mat({ map: aT, roughness: .9 }), sX, Hd + .05 - Math.sin(.32) * sd / 2, sd / 2 * Math.cos(.32) + .1, g); st.rotation.x = .32;
      const lT = tT(1024, 72, (c, w, h) => { c.fillStyle = coul; c.fillRect(0, 0, w, h); c.fillStyle = txtC || "#f2ead8"; c.textAlign = "center"; c.textBaseline = "middle"; fit(c, txt, w * .9, 46, `bold @ ${serif}`); c.fillText(txt, w / 2, h / 2 + 2);
        c.fillStyle = "rgba(0,0,0,.25)"; for (let x = 0; x < w; x += 40) { c.beginPath(); c.moveTo(x, h); c.lineTo(x + 20, h - 10); c.lineTo(x + 40, h); c.fill(); } });
      const yB = Hd + .05 - Math.sin(.32) * sd, zB = sd * Math.cos(.32) + .12; box(sw, .42, .03, lumT(lT, .02, .45), sX, yB - .2, zB, g);
      if (o.guirlande) { const bM = lum(mat({ color: 0xfff4d0, emissive: 0xffe0a0, emissiveIntensity: 0 }), 0, 2.4); for (let x = -sw / 2 + .2; x < sw / 2; x += .45) add(new THREE.SphereGeometry(.045, 6, 5), bM, sX + x, yB - .42, zB + .02, g); } }
    if (o.bandeau) { const [txt, fond, coul] = o.bandeau; panneau(g, W - .5, Hd + .52, .66, txt, fond, coul, { cadre: coul, z: .3 }); }   // (le panneau encadré, posé sur la poutre)
    if (!o.store && o.corniche !== false) { box(W + .3, .14, .5, bois, 0, Hd + .97, .16, g); box(W + .2, .06, .44, moulM, 0, Hd + .88, .16, g);   // la corniche de la devanture
      for (const sg of [-1, 1]) { box(.2, .62, .32, bois, sg * (W / 2 - .02), Hd + .55, .2, g); box(.24, .1, .36, moulM, sg * (W / 2 - .02), Hd + .25, .2, g); } }   // les consoles
    for (const sg of [-1, 1]) box(.26, .14, .3, moulM, sg * (W / 2 - .02), Hd - .4, .18, g);   // les chapiteaux des pilastres
    if (o.attable) { const T = new THREE.Group(); T.position.set(o.attable * W * .22, 0, .95); g.add(T); g.updateMatrixWorld(true); ATT.push(T.getWorldPosition(new THREE.Vector3())); const marbre = mat({ color: 0xe8e4dc, roughness: .3 }), boisC = mat({ color: 0x7a4a24, roughness: .55 });   // la petite table de bistrot et ses deux chaises (photos)
      add(new THREE.CylinderGeometry(.3, .3, .04, 18), marbre, 0, .74, 0, T); add(new THREE.CylinderGeometry(.03, .04, .72, 8), fonteM, 0, .36, 0, T); add(new THREE.CylinderGeometry(.18, .22, .04, 12), fonteM, 0, .02, 0, T);
      for (const sx of [-1, 1]) { const C = new THREE.Group(); C.position.set(sx * .55, 0, 0); C.rotation.y = -sx * Math.PI / 2; T.add(C);   /* (10.91) la chaise face à la table, le dossier côté rue */ add(new THREE.CylinderGeometry(.21, .21, .04, 14), boisC, 0, .46, 0, C); for (const [a, b] of [[-.14, -.14], [.14, -.14], [-.14, .14], [.14, .14]]) add(new THREE.CylinderGeometry(.015, .015, .46, 5), boisC, a, .23, b, C);
        const d = add(new THREE.TorusGeometry(.18, .018, 5, 12, Math.PI), boisC, 0, .82, -.2, C); d.rotation.x = -.1; add(new THREE.CylinderGeometry(.015, .015, .4, 5), boisC, -.17, .66, -.2, C); add(new THREE.CylinderGeometry(.015, .015, .4, 5), boisC, .17, .66, -.2, C); } }
    if (o.enseigne) o.enseigne(g, W, Hd); };
  const lumT = (t, j, n) => lum(mat({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: j, roughness: .6 }), j, n);
  // une enseigne-panneau sur la façade (lettres peintes ou néon)
  const panneau = (g, W, y, h, txt, fond, coul, o = {}) => { const t = tT(1024, Math.round(1024 * h / W), (c, w, hh) => { c.fillStyle = fond; c.fillRect(0, 0, w, hh); if (o.cadre) { c.strokeStyle = o.cadre; c.lineWidth = 8; c.strokeRect(6, 6, w - 12, hh - 12); }
      c.textAlign = "center"; c.textBaseline = "middle"; fit(c, txt, w * .9, Math.round(hh * .7), `${o.ital ? "italic " : ""}bold @ ${o.police || serif}`); if (o.neon) { c.shadowColor = coul; c.shadowBlur = 18; } c.fillStyle = coul; c.fillText(txt, w / 2, hh / 2 + 3); });
    return box(W, h, .08, lumT(t, o.neon ? .25 : .03, o.neon ? 1.8 : .55), o.x || 0, y, (o.z ?? .28) + (o.dz || 0), g); };

  // les tables de bistrot et les chaises en rotin tressé (rouge et miel, comme sur la photo)
  const rotinT = tT(64, 64, (c, w, h) => { c.fillStyle = "#c08a4a"; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 8) for (let x = 0; x < w; x += 8) { c.fillStyle = (x + y) % 16 ? "#a8322a" : "#d8a868"; c.fillRect(x + 1, y + 1, 6, 6); } }, 1, 1);
  const rotinM = mat({ map: rotinT, roughness: .8 }), rotinCadre = mat({ color: 0x8a5a2a, roughness: .6 }), plateau = mat({ color: 0xe8e2d6, roughness: .3 }), fonteM = mat({ color: 0x1a1a1a, metalness: .5, roughness: .5 }), nappe = mat({ color: 0xb8202a, roughness: .9 });
  const chaise = (x, z, ry) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g); box(.42, .05, .4, rotinM, 0, .46, 0, g); box(.42, .5, .05, rotinM, 0, .74, -.19, g); for (const [a, b] of [[-.19, -.18], [.19, -.18], [-.19, .18], [.19, .18]]) cyl(.016, .016, .46, rotinCadre, a, .23, b, g, 5); return g; };
  const TABLES = []; const table = (x, z, rouge) => { TABLES.push([x, z]); cyl(.32, .32, .03, rouge ? nappe : plateau, x, .74, z); cyl(.025, .025, .72, fonteM, x, .37, z, scene, 6); cyl(.2, .22, .03, fonteM, x, .02, z); };
  const PE = ["#f0c9a6", "#c78f62", "#e8bd95", "#8d5a3b", "#f6d6bc", "#6a4028"], HA = ["#2a3a5a", "#7a2a3a", "#3a3a40", "#e8e2d6", "#5a4636", "#2f5a4a", "#c8a040", "#1a1a1c", "#8a2a2a", "#4a5a7a"];
  const gens = (k, o = {}) => { const f = k % 2 === 1; return personne3D({ taille: f ? 1.64 : 1.76, peau: PE[k % 6], ch: ["#2a1a12", "#5a3a22", "#141010", "#8a8a8a", "#e2c27a", "#a5532a"][k % 6], haut: HA[k % 10], bas: ["#26324e", "#2a2a30", "#3a3028", "#1a1a1c"][k % 4], chaussures: ["#1a1a1a", "#3a2418"][k % 2], coif: f ? (k % 3 ? "long" : "carre") : k % 5 ? "court" : "chauve", pantalon: !f || k % 3 === 0, robe: f && k % 3 !== 0, parle: k % 3 === 0, ...o }); };
  const GENS = true;
  const nTerr = !GENS ? 0 : PETIT ? 16 : (MOBILE || GPU_MODESTE) ? 40 : 110; let kT = 0; const CHS = [], SALLES = [];   /* (10.88) toutes les chaises libres des terrasses ; les salles des cafés : on y met des gens partout, après */
  // une terrasse : des rangées de tables le long d'une façade ; ax/az : le sens de la façade ; nx/nz : vers la rue
  const terrasse = (x0, z0, ax, az, nx, nz, L2, rangs, rouge) => { for (let r = 0; r < rangs; r++) for (let t = .6; t < L2 - .4; t += 1.25) { const x = x0 + ax * t + nx * (.55 + r * 1.0), z = z0 + az * t + nz * (.55 + r * 1.0); table(x, z, rouge);
      const ry = Math.atan2(nx, nz); for (const sg of [-1, 1]) { const cx = x + ax * sg * .45, cz = z + az * sg * .45, rc = Math.atan2(-ax * sg, -az * sg); chaise(cx, cz, rc);
        CHS.push([cx, .5, cz, rc]); } void ry; } };

  /* ---------- côté ouest : Le Sabot Rouge, La Crémaillère 1900, le Restaurant Chez Eugène (du sud au nord) ---------- */
  const OUEST = Math.PI / 2;   // (façades tournées vers l'est, vers le carré)
  maison(XO, 10.5, OUEST, 9, 14, { teinte: "#8a8478", etages: 3, volets: "#6a645a", rdc: (g, W) => devanture(g, W, { bois: 0x7a1a1a, travees: 4, porte: 1, porteC: 0x6a1414, fondV: "#d06a30", ardoise: "Le Sabot Rouge", store: ["#8a1a1c", "LE  SABOT  ROUGE", "#f2e2c0"], storeD: 2.4,
    enseigne: (g2) => { const t = tT(128, 256, (c, w, h) => { c.fillStyle = "#7a1414"; c.fillRect(0, 0, w, h); c.fillStyle = "#f2d890"; c.font = "bold 13px Arial"; c.textAlign = "center"; c.fillText("LE SABOT ROUGE", w / 2, 20); for (let i = 0; i < 18; i++) { c.fillRect(14, 34 + i * 12, 60 + al() * 30, 3); c.fillRect(w - 26, 34 + i * 12, 14, 3); } });
      box(.7, 1.3, .06, lumT(t, .1, .9), -W / 2 + 1.3, 1.6, .3, g2); } }) });
  maison(XO, 2.2, OUEST, 7.6, 15, { teinte: "#e6d8b8", etages: 4, volets: "#e8e2d2", sansEtage: [0], rdc: (g, W) => devanture(g, W, { ardoise: "La Crémaillère", bois: 0x1f5a44, travees: 3, porte: 1, porteC: 0x1f5a44, fondV: "#d89a40", store: ["#1f4a3a", "RESTAURANT  LA CRÉMAILLÈRE", "#f2ead8"], storeD: 2.2,
    enseigne: (g2, W2) => { panneau(g2, W2 - .8, 3.8 + 2.8 * .52, 1.6, "LA CRÉMAILLÈRE", "#0e3a2a", "#7ff0ff", { neon: true, police: "Georgia", cadre: "#c8a040", z: .12 });   // l'enseigne au néon bleu, sur fond vert
      const s = new THREE.Group(); s.position.set(W2 / 2 - 1.0, 4.08, .95); g2.add(s); box(.06, .06, 1.1, fonteM, 0, .5, -.5, s); box(1.6, .45, .05, lumT(tT(512, 128, (c, w, h) => { c.fillStyle = "#123a2a"; c.fillRect(0, 0, w, h); c.strokeStyle = "#c8a040"; c.lineWidth = 6; c.strokeRect(4, 4, w - 8, h - 8); c.fillStyle = "#f0d890"; c.textAlign = "center"; c.font = `bold 46px ${serif}`; c.fillText("La Crémaillère 1900", w / 2, 82); }), .05, 1), 0, 0, 0, s, Math.PI / 2);} }) });   // (la façade verte, éclairée de vert la nuit)
  maison(XO, -5.6, OUEST, 8, 15.5, { teinte: "#efe2c2", etages: 4, volets: "#efe6d2", peint: ["RESTAURANT   CHEZ   EUGÈNE", "#7a4a1a", 0], peintNuit: true, rdc: (g, W) => devanture(g, W, { bois: 0x5a1414, travees: 3, porte: 2, fondV: "#e0a050", store: ["#a01a20", "CAFÉ · PIANO BAR · CHEZ EUGÈNE", "#f2ead8"], storeD: 2.2, guirlande: true }) });
  terrasse(XO + .2, 14.8, 0, -1, 1, 0, 8.4, 2, false); terrasse(XO + .2, 6.2, 0, -1, 1, 0, 7.2, 2, false); terrasse(XO + .2, -1.8, 0, -1, 1, 0, 7.4, 2, true);

  /* ---------- au nord : Au Petit Comptoir, La Bohème ---------- */
  const NORD = 0;
  maison(-16.2, ZN, NORD, 10.4, 13, { teinte: "#f0ece2", etages: 3, volets: "#f2f2ee", rdc: (g, W) => devanture(g, W, { bois: 0x18302a, travees: 4, porte: 0, fondV: "#e8b060", store: ["#16302a", "AU  PETIT  COMPTOIR", "#f2ead8"], storeD: 1.8 }) });
  maison(-3.6, ZN, NORD, 14.8, 12.5, { teinte: "#ece6da", etages: 3, volets: "#f2f2ee", rdc: (g, W) => devanture(g, W, { bois: 0x6a1a1a, travees: 5, porte: 2, fondV: "#f0a040", store: ["#7a1a1a", "LA  BOHÈME  DU  TERTRE", "#f2ead8"], storeD: 2.0 }) });
  maison(9.6, ZN, NORD, 11.6, 13, { teinte: "#efe4cc", etages: 3, volets: "#f2f2ee", rdc: (g, W) => devanture(g, W, { bois: 0x2a3a5a, travees: 4, porte: 1, fondV: "#f0d8a0", genre: "galerie", bandeau: ["GALERIE  DU  TERTRE", "#2a3a5a", "#f2ead8"] }) });
  terrasse(-21, ZN + .2, 1, 0, 0, 1, 10, 2, false); terrasse(-10.5, ZN + .2, 1, 0, 0, 1, 13, 1, true);

  /* ---------- à l'est (d'après les photos) : La Mère Catherine, la petite maison blanche à pignon, sa plaque rouge, sa devanture rouge
     « Ici est né le mot bistro », les sapins et la verdure sur le store ; Au Cadet de Gascogne, ses grandes lettres rouges, ses stores rouges fleuris ---------- */
  const EST = -Math.PI / 2;
  const verdure = (g, W, y, fleurs) => { const vM = [mat({ color: 0x2a5a2a }), mat({ color: 0x3a6a32 }), mat({ color: 0x1e4a26 })], fl = [mat({ color: 0xe8203a }), mat({ color: 0xf0a0c0 }), mat({ color: 0xf6f0e0 })], gM = lum(mat({ color: 0xfff0c0, emissive: 0xffd890, emissiveIntensity: 0 }), 0, 2.4);
    for (let x = -W / 2 + .4; x < W / 2 - .2; x += .55) { if (al() < .35) { const hc = .45 + al() * .2; add(new THREE.ConeGeometry(.24, hc, 7), vM[2], x, y + hc / 2, .55, g); } else add(new THREE.IcosahedronGeometry(.28 + al() * .12, 0), vM[(x * 7 | 0) & 1], x, y + .22, .5, g);
      if (fleurs) add(new THREE.IcosahedronGeometry(.13, 0), fl[(x * 5 | 0) % 3 & 3] || fl[0], x + .2, y + .32, .78, g); add(new THREE.SphereGeometry(.04, 5, 4), gM, x + .1, y + .45, .74, g); } };
  maison(XE, -11.25, EST, 10.5, 8.6, { teinte: "#f2f0ea", etages: 1, volets: "#f2f2ee", balcon: false, pignon: 4.2, rdc: (g, W) => { devanture(g, W, { bois: 0xa8141c, travees: 5, porte: 4, porteC: 0x8a1018, fondV: "#f0a040", store: ["#7a0e14", "ICI EST NÉ LE MOT « BISTRO »  ·  LA MÈRE CATHERINE", "#f2e2c0"], storeD: 2.0 });
      panneau(g, W * .82, 4.5, .62, "LA MÈRE CATHERINE", "#a8141c", "#f6efe0", { cadre: "#f6efe0", z: .2 }); verdure(g, W, 3.55, false); } });
  maison(XE, 1.25, EST, 14, 12, { teinte: "#f2efe6", etages: 3, volets: "#f2f2ee", peint: ["AU  CADET  DE  GASCOGNE", "#b8141c", 1], peintNuit: true, rdc: (g, W) => { devanture(g, W, { bois: 0x9a1418, travees: 5, porte: 2, fondV: "#f0a040", store: ["#b01820", "CAFÉ  ·  RESTAURANT  ·  BAR", "#f2ead8"], storeD: 2.0, guirlande: true }); verdure(g, W, 3.55, true); } });
  terrasse(XE - .2, -15.8, 0, 1, -1, 0, 9.2, 1, false); terrasse(XE - .2, -5.2, 0, 1, -1, 0, 12.6, 1, false);
  // la rue Saint-Éleuthère (entre z = 8,5 et 15,5), qui file vers le Sacré-Cœur : les maisons blanches de part et d'autre ; au bout à droite, l'église Saint-Pierre de Montmartre
  { const g = new THREE.Group(); g.position.set(44, 0, 20.5); g.rotation.y = EST; g.scale.setScalar(.7); scene.add(g); const ocre = lum(mat({ color: 0xdcb878, roughness: .8, emissive: 0xffc070, emissiveIntensity: 0 }), 0, .35), ocreF = mat({ color: 0xc8a060 }), porteM = mat({ color: 0x3a2a1e });
    box(13, 14, 22, ocre, 0, 7, -11, g); for (const x of [-5.6, -2.2, 2.2, 5.6]) { box(.8, 6.4, .5, ocreF, x, 3.2, .2, g); box(.6, 5, .4, ocreF, x * .8, 9.1, .1, g); } box(13.4, .6, .8, ocreF, 0, 6.6, .2, g);
    box(2.6, 4.2, .2, porteM, 0, 2.1, .3, g); add(new THREE.CylinderGeometry(1.3, 1.3, .2, 14, 1, false, 0, Math.PI), porteM, 0, 4.2, .3, g).rotation.set(Math.PI / 2, 0, 0); for (const x of [-3.9, 3.9]) box(1.4, 2.6, .2, porteM, x, 2.2, .3, g);
    const tri = new THREE.Shape(); tri.moveTo(-5.2, 0); tri.lineTo(5.2, 0); tri.lineTo(0, 2.8); tri.closePath(); add(new THREE.ExtrudeGeometry(tri, { depth: .8, bevelEnabled: false }), ocreF, 0, 11.6, -.4, g);
    box(10.4, 5, .4, ocre, 0, 9.1, -.05, g); box(1.6, 2.4, .2, mat({ color: 0x2a2a30 }), 0, 9.2, .2, g); box(3, 6, 3, ocre, 3.5, 16, -6, g); add(new THREE.ConeGeometry(2.2, 2.6, 4), mat({ color: 0x5a5e66 }), 3.5, 20.2, -6, g).rotation.y = Math.PI / 4; }

  /* ---------- au sud : Carette (la boiserie couleur miel, « Maison fondée en 1927 »), la Galerie Montmartre toute rouge ; la rue du Calvaire, ses marches (on repart en métro) ;
     Au Clairon des Chasseurs : le store rayé bleu et blanc, les longues tables à nappe blanche, les tabourets tressés bleus ---------- */
  const SUD = Math.PI;
  maison(-14, ZS, SUD, 12, 13, { teinte: "#ecebe6", etages: 3, volets: "#f4f4f0", rdc: (g, W) => { devanture(g, W, { bois: 0xb07a3a, travees: 6, porte: 3, porteC: 0xa86e30, fondV: "#f0c070", genre: "pain", lanternes: false });
      const t = tT(1024, 72, (c, w, h) => { c.fillStyle = "#b07a3a"; c.fillRect(0, 0, w, h); c.fillStyle = "rgba(0,0,0,.18)"; c.fillRect(0, 0, w, 4); c.fillRect(0, h - 4, w, 4); c.fillStyle = "#141414"; c.beginPath(); c.ellipse(w * .45, h / 2, 150, 28, 0, 0, 7); c.fill();
        c.fillStyle = "#e8c070"; c.textAlign = "center"; c.textBaseline = "middle"; c.font = `bold 44px ${serif}`; c.fillText("CARETTE", w * .45, h / 2 + 2); c.fillStyle = "#3a2410"; c.font = `italic 24px ${serif}`; c.fillText("Maison fondée en 1927", w * .82, h / 2 + 2); c.fillText("Crêpes", w * .1, h / 2 + 2); });
      box(W, .8, .14, lumT(t, .03, .6), 0, 4.1, .3, g); for (const x of [-1.6, 1.6]) { box(.22, .36, .22, lum(mat({ color: 0x2a2a2a, emissive: 0xffc070, emissiveIntensity: .05 }), .05, 1.6), x, 2.85, .35, g); } } });
  maison(-4.6, ZS, SUD, 6.4, 12, { teinte: "#efeeea", etages: 3, volets: "#f4f4f0", rdc: (g, W) => devanture(g, W, { bois: 0xc8141c, travees: 2, porte: 0, porteC: 0xb01218, fondV: "#f8e0c0", genre: "galerie", bandeau: ["GALERIE  MONTMARTRE", "#c8141c", "#f6efe0"] }) });
  maison(11.5, ZS, SUD, 16, 11, { teinte: "#e8dcc4", etages: 3, volets: "#f2f2ee", rdc: (g, W) => devanture(g, W, { bois: 0x161c28, travees: 6, porte: 2, fondV: "#f0c070", ardoise: "Le Clairon", store: ["#1a2a5a", "AU  CLAIRON  DES  CHASSEURS", "#f2ead8"], raye: true, storeD: 2.6, guirlande: true }) });
  { const blancN = mat({ color: 0xf6f6f2, roughness: .9 }), bleuT = mat({ map: tT(64, 64, (c, w, h) => { c.fillStyle = "#1a2a5a"; c.fillRect(0, 0, w, h); c.fillStyle = "#e8e4d8"; for (let y = 0; y < h; y += 8) for (let x = (y / 8 % 2) * 4; x < w; x += 8) c.fillRect(x, y, 4, 4); c.fillStyle = "#e8c040"; c.fillRect(0, 28, w, 8); }, 1, 1) });
    for (let x = 4.3; x < 19; x += 1.5) { box(1.2, .05, .55, blancN, x, 1.02, ZS - 1.1, scene); box(1.2, .3, .02, blancN, x, .86, ZS - 1.38, scene); cyl(.03, .03, 1, fonteM, x, .5, ZS - 1.1, scene, 5);
      for (const dx of [-.3, .3]) { cyl(.2, .2, .09, bleuT, x + dx, .74, ZS - 1.75, scene, 12); cyl(.02, .02, .72, fonteM, x + dx, .36, ZS - 1.75, scene, 4); } } }
  /* ===================== (les rues autour, d'après les photos : rue Norvins, rue des Saules, rue Saint-Rustique ; le vieux Montmartre,
     ses maisons blanches à volets, le lierre, les jardinières fleuries, les lanternes sur potence, les potelets, les pavés) ===================== */
  const ZNo0 = -16.2, ZNo1 = -9.6, XSa0 = -86, XSa1 = -80, ZRu0 = 26, ZRu1 = 32, XBUT = 56, ZSa0 = -44, ZSa1 = 44;
  // les trottoirs étroits, la bordure de granit, les potelets de fonte
  const trottR = mat({ map: (() => { const t = paves(150); t.repeat.set(60, 1); return t; })(), roughness: .75 }), potM = mat({ color: 0x2e3430, roughness: .5, metalness: .4 });
  const bordG = mat({ color: 0x8e8a84, roughness: .8 });
  const trottoir = (x0, z0, x1, z1, pot) => { const w = Math.abs(x1 - x0), d = Math.abs(z1 - z0), t = paves(150); t.repeat.set(w / 1.6, d / 1.6); box(w, .1, d, mat({ map: t, roughness: .7 }), (x0 + x1) / 2, .05, (z0 + z1) / 2);
    if (w > d) for (const z of [Math.min(z0, z1) + .08, Math.max(z0, z1) - .08]) box(w, .13, .16, bordG, (x0 + x1) / 2, .065, z); else for (const x of [Math.min(x0, x1) + .08, Math.max(x0, x1) - .08]) box(.16, .13, d, bordG, x, .065, (z0 + z1) / 2);   // la bordure de granit
    if (pot) { const [px, pz, lx, lz] = pot; const n = Math.floor(Math.max(lx, lz) / 1.7); for (let i = 0; i <= n; i++) { const x = px + (lx ? i * 1.7 : 0), z = pz + (lz ? i * 1.7 : 0); POTS.push([x, z]); } } };   /* (10.91) les potelets : posés à la fin, jamais sous une table ou une chaise */
  trottoir(-80, ZNo0, -21.5, ZNo0 + .85); trottoir(-80, ZNo1 - .85, -30.5, ZNo1, [-79, ZNo1 - .95, 48, 0]);
  trottoir(XSa0, ZSa0, XSa0 + .8, ZSa1); trottoir(XSa1 - .8, ZSa0, XSa1, ZNo0); trottoir(XSa1 - .8, ZNo1, XSa1, ZRu0);
  trottoir(-80, ZRu0, XBUT, ZRu0 + .85); trottoir(-80, ZRu1 - .85, XBUT, ZRu1, [-78, ZRu1 - .95, 132, 0]);
  { const n = Math.floor(132 / 1.7); for (let i = 0; i <= n; i++) { const x = -78 + i * 1.7; if (x > -2 && x < 4) continue; POTS.push([x, ZRu0 + .95]); } }
  // une lanterne sur potence, accrochée au mur (o : la direction de la rue, depuis le mur)
  const lanterneMur = (x, y, z, nx, nz) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = Math.atan2(nx, nz); scene.add(g); box(.04, .04, .7, fonteM, 0, .3, .35, g); const s = box(.03, .5, .03, fonteM, 0, .05, .08, g); s.rotation.x = .7;
    add(new THREE.CylinderGeometry(.17, .11, .4, 6), lum(mat({ color: 0xfff0c8, emissive: 0xffc870, emissiveIntensity: .05, transparent: true, opacity: .92 }), .05, 2.4), 0, .05, .7, g); add(new THREE.ConeGeometry(.22, .18, 6), fonteM, 0, .32, .7, g); const l = Math.hypot(nx, nz) || 1; HALO.push([x + nx / l * .7, y + .05, z + nz / l * .7, 1.1]); flaque(x + nx / l * 1.3, z + nz / l * 1.3, 2.4, .12); };
  // le lierre et la vigne vierge sur les façades (rouge en automne, comme sur la photo)
  const lierreT = (rouge) => tT(256, 512, (c, w, h) => { c.clearRect(0, 0, w, h); for (let i = 0; i < 1600; i++) { const y = h - Math.pow(al(), .7) * h, x = w / 2 + (al() - .5) * w * (.35 + .65 * (h - y) / h) ; const v = al();
      c.fillStyle = rouge && v < .55 ? `hsl(${v * 30},${60 + v * 30}%,${28 + v * 18}%)` : `hsl(${95 + v * 30},${40 + v * 20}%,${18 + v * 22}%)`; c.beginPath(); c.ellipse(x, y, 4 + al() * 5, 3 + al() * 4, al() * 3, 0, 7); c.fill(); } });
  const LIERRE = [lierreT(false), lierreT(true)].map(t => mat({ map: t, transparent: true, alphaTest: .35, side: THREE.DoubleSide, roughness: .9 }));
  const lierre = (g, W, H, rouge, x0, y0 = 0, lw) => { const w = lw || Math.min(W * .55, 5), h = H * .92 - y0; pl2(w, h, LIERRE[rouge ? 1 : 0], x0 ?? (-W / 2 + w / 2 + .2), y0 + h / 2, .1, g); };   // (y0 : au-dessus de la devanture, pour ne rien cacher)
  const pl2 = (w, h, m, x, y, z, g) => add(new THREE.PlaneGeometry(w, h), m, x, y, z, g);
  // les jardinières fleuries aux fenêtres du premier étage
  const fleursM = [0xe8203a, 0xf06090, 0xf2f0f0, 0xc040c0, 0xf0a020].map(c2 => mat({ color: c2, roughness: .9 })), bacM = mat({ color: 0x8a4a2a }), vertJ = mat({ color: 0x3a6a2a });
  const jardinieres = (g, W, H, etages, nF) => { const hE = (H - 3.8) / etages; nF = nF || Math.max(2, Math.round(W / 2.6)); for (let f = 0; f < nF; f++) { if (al() < .3) continue; const x = -W / 2 + (W / nF) * (f + .5), y = 3.8 + hE * .14 + .12 + (al() < .4 && etages > 1 ? hE : 0);
    box(1.0, .2, .22, bacM, x, y, .15, g); add(new THREE.IcosahedronGeometry(.2, 0), vertJ, x - .2, y + .2, .2, g); for (let k = 0; k < 4; k++) add(new THREE.IcosahedronGeometry(.1, 0), fleursM[(f + k) % 5], x - .38 + k * .25, y + .25, .26, g); } };
  // le fleuriste : les seaux de fleurs sur les gradins, devant la boutique, qui débordent sur le trottoir
  /* (10.88) le fleuriste : les gradins, les seaux de zinc ; dans chaque seau un vrai bouquet — les tiges, le feuillage, et des roses, des tulipes, des marguerites, des hortensias ou de la lavande */
  const tigeM = mat({ color: 0x3a6a26, roughness: .8 }), feuilM = [mat({ color: 0x2e5a22, roughness: .8 }), mat({ color: 0x4a7a30, roughness: .8 })], coeurM = mat({ color: 0xe8b820, roughness: .8 }), coeurN = mat({ color: 0x3a2a14, roughness: .9 });
  const FLC = { rose: [0xc8102a, 0xe84a6a, 0xf2d0d8, 0xf0a030, 0xa0102a].map(c2 => mat({ color: c2, roughness: .7 })), tul: [0xe82a2a, 0xf0d020, 0xf07ab0, 0xf2f0ea, 0x8a2a8a].map(c2 => mat({ color: c2, roughness: .6 })), marg: [mat({ color: 0xf8f6f0, roughness: .8 }), mat({ color: 0xf0d040, roughness: .8 })], hort: [0x6a8ae0, 0xd890c8, 0xa080d0, 0xf2f0f0].map(c2 => mat({ color: c2, roughness: .9 })), lav: mat({ color: 0x8a6ac8, roughness: .9 }) };
  const bouquet = (P, x, y, z, k) => { const ty = ["rose", "tul", "marg", "hort", "lav"][k % 5], n = (MOBILE || GPU_MODESTE) ? 5 : 9;
    for (let f = 0; f < 3; f++) { const fe = add(new THREE.IcosahedronGeometry(.07, 0), feuilM[f % 2], x + Math.cos(f * 2.1) * .07, y + .06, z + Math.sin(f * 2.1) * .07, P); fe.scale.set(1.2, .5, 1.2); }
    for (let i = 0; i < n; i++) { const a = i * 2.4 + k, r = .03 + (i % 3) * .035, fx = x + Math.cos(a) * r, fz = z + Math.sin(a) * r, h = .22 + ((i * 7 + k) % 5) * .035, fy = y + h;
      const tg = cyl(.005, .005, h, tigeM, fx * .5 + x * .5, y + h / 2, fz * .5 + z * .5, P, 3); tg.rotation.z = (fx - x) * 1.5; tg.rotation.x = -(fz - z) * 1.5;
      const cM = FLC[ty], m = Array.isArray(cM) ? cM[(i + k) % cM.length] : cM;
      if (ty === "rose") { add(new THREE.SphereGeometry(.035, 7, 5), m, fx, fy, fz, P).scale.set(1, .8, 1); add(new THREE.SphereGeometry(.024, 6, 4), m, fx, fy + .02, fz, P); }
      else if (ty === "tul") { const t2 = add(new THREE.CylinderGeometry(.028, .016, .06, 6), m, fx, fy, fz, P); t2.rotation.z = (fx - x) * 1.2; }
      else if (ty === "marg") { add(new THREE.CylinderGeometry(.04, .04, .008, 9), FLC.marg[0], fx, fy, fz, P); add(new THREE.SphereGeometry(.013, 6, 4), FLC.marg[1], fx, fy + .006, fz, P); }
      else if (ty === "hort") { if (i % 2 === 0) for (let q = 0; q < 4; q++) add(new THREE.SphereGeometry(.03, 6, 4), m, fx + Math.cos(q * 1.6) * .025, fy + (q % 2) * .02, fz + Math.sin(q * 1.6) * .025, P); }
      else { add(new THREE.CylinderGeometry(.012, .008, .09, 5), FLC.lav, fx, fy + .02, fz, P); } } };
  const fleuriste = (g, W) => { const bois = mat({ color: 0x6a4a2a }), seau = mat({ color: 0x9a9ea2, metalness: .6, roughness: .35 }), P = new THREE.Group(); g.add(P); let k = 0;
    for (let r = 0; r < 3; r++) { box(W - 1.2, .05, .45, bois, 0, .3 + r * .32, 1.3 - r * .4, P); box(W - 1.2, .3 + r * .32, .04, bois, 0, (.3 + r * .32) / 2, 1.52 - r * .4, P);
      for (let x = -W / 2 + 1; x < W / 2 - .7; x += .45) { const y = .32 + r * .32, z = 1.3 - r * .4; cyl(.14, .11, .26, seau, x, y + .13, z, P, 10); cyl(.135, .135, .01, mat({ color: 0x2a3a20 }), x, y + .25, z, P, 10); bouquet(P, x, y + .25, z, k++ * 3 + r); } }
    g.updateMatrixWorld(true); for (const o of [...P.children]) scene.attach(o); g.remove(P); };
  // une maison de rue, ordinaire (les façades sont partagées entre maisons pareilles : moins de mémoire)
  const TEINTES = ["#ece6d8", "#e4d8c0", "#f1ece2", "#d9c8a8", "#e9e2d2", "#dccfb4"], VOLETS = ["#f2f2ee", "#f2f2ee", "#6a8a9a", "#7a9a6a", "#f2f2ee", "#c8c2b4"];
  const ordinaire = (k) => ({ teinte: TEINTES[k % 6], volets: VOLETS[k % 2 ? 0 : 2 + (k % 4 === 0)], etages: 3, cache: true, pierre: k % 6 === 3 || k % 6 === 5, lierre: (MOBILE || GPU_MODESTE) ? 0 : k % 4 === 1 ? 1 : k % 7 === 2 ? 2 : 0 });   // (la pierre de taille, le lierre, par endroits)   // (peu de variantes : les façades pareilles sont partagées)
  // une rangée de maisons le long d'une rue : (ax, az) le début, (dx, dz) le sens, ry : l'orientation des façades ; L : [largeur, hauteur, options]
  const BOUT = [["GALERIE", 0xe8e4dc, "#f2efe6", "#3a3a3a"], ["SOUVENIRS", 0x7a1a1a, "#8a1a1c", "#f2ead8", 1], ["CRÊPERIE", 0x8a1418, "#b01820", "#f2ead8", 1], ["FROMAGERIE", 0x2a4a2a, "#f2ead8", "#2a4a2a"], ["LIBRAIRIE", 0x1e3a2a, "#1e3a2a", "#f0d890"],
    ["VINS · CAVISTE", 0x5a1424, "#5a1424", "#f0d890"], ["ÉPICERIE FINE", 0x6a8a5a, "#e8c020", "#3a2a1a", 2], ["CHOCOLATIER", 0x4a2a1a, "#4a2a1a", "#f0d890"], ["ANTIQUITÉS", 0x1a1a1a, "#1a1a1a", "#e8d8a8"], ["ATELIER D'ARTISTE", 0x2a3a5a, "#2a3a5a", "#f2ead8"],
    ["BISTROT", 0x6a1a1a, "#a01a20", "#f2ead8", 1], ["PHARMACIE", 0x1a6a3a, "#f2f2ee", "#1a6a3a"], ["BOULANGERIE · PÂTISSERIE", 0x8a5a2a, "#7a4a1e", "#f0d890"], ["CAFÉ", 0x1a2a4a, "#1a2a4a", "#f0c860", 1], ["MODES · CHAPEAUX", 0x6a3a5a, "#f2e6ee", "#6a3a5a"], ["BRASSERIE", 0x2a1a10, "#e8dcc0", "#2a1a10", 1]];
  let kB = 0; const boutique = (g, W) => { const [txt, bois, fond, coul, st] = BOUT[kB++ % BOUT.length], tr = Math.max(2, Math.round(W / 2.6));
    const genre = /GALERIE|ATELIER|ANTIQ/.test(txt) ? "galerie" : /BOULANG|CHOCOL|FROMAG/.test(txt) ? "pain" : /CAFÉ|BISTROT|BRASSERIE|CRÊPERIE|VINS/.test(txt) ? "cafe" : "boutique";
    const attable = genre === "cafe" || genre === "galerie" ? (kB % 2 ? 1 : -1) : 0;
    if (st) devanture(g, W, { attable, genre, bois, travees: tr, porte: kB % tr, fondV: ["#f0b060", "#f0c880", "#e8a050"][kB % 3], store: [fond, txt, coul], raye: st === 2, storeD: 1.4 });
    else devanture(g, W, { attable, genre, bois, travees: tr, porte: kB % tr, fondV: ["#f0d8a0", "#f0c070", "#f8e8c8"][kB % 3], bandeau: [txt, fond, coul] });
    if (txt === "PHARMACIE") { const cx = tT(64, 64, (c) => { c.fillStyle = "#18a048"; c.fillRect(22, 4, 20, 56); c.fillRect(4, 22, 56, 20); }); box(.06, .7, .7, lum(mat({ map: cx, emissive: 0xffffff, emissiveMap: cx, emissiveIntensity: .3, transparent: true, alphaTest: .5 }), .3, 1.6), W / 2 - .3, 4.6, .7, g); } };
  const potM2 = mat({ color: 0xb0603a, roughness: .9 }), buisM = [mat({ color: 0x3a6a2a, roughness: .9 }), mat({ color: 0x2a5a2a, roughness: .9 })];
  const potC = mat({ color: 0xe4ddd0, roughness: .8 }), boule = mat({ color: 0x2f5a26, roughness: .9 }), fleurP = [0xe8203a, 0xf0c020, 0xf2f0f0, 0xe060a0].map(c2 => mat({ color: c2, roughness: .9 }));
  const plante = (g, x, z, t) => { if (t === 0) { cyl(.26, .2, .5, potM2, x, .25, z, g, 10); add(new THREE.IcosahedronGeometry(.36, 1), buisM[0], x, .85, z, g); }   // le buis en pot
    else if (t === 1) { cyl(.22, .18, .45, potC, x, .23, z, g, 10); cyl(.025, .025, .9, mat({ color: 0x5a4030 }), x, .9, z, g, 5); add(new THREE.IcosahedronGeometry(.32, 1), boule, x, 1.45, z, g); }   // le laurier en boule
    else if (t === 2) { cyl(.2, .16, .36, potM2, x, .18, z, g, 10); add(new THREE.IcosahedronGeometry(.2, 0), buisM[1], x, .45, z, g); for (let k2 = 0; k2 < 5; k2++) add(new THREE.IcosahedronGeometry(.07, 0), fleurP[(k2 + (x * 3 | 0)) & 3], x + (al() - .5) * .3, .55 + al() * .1, z + (al() - .5) * .3, g); }   // les fleurs
    else { cyl(.3, .24, .6, potM2, x, .3, z, g, 10); for (let k2 = 0; k2 < 3; k2++) add(new THREE.ConeGeometry(.3 - k2 * .07, .5, 7), buisM[1], x, .8 + k2 * .35, z, g); } };   // le petit sapin, le thuya
  const pots = (g, W) => { let n = 0; for (const x of [-W / 2 + .4, W / 2 - .4]) if (al() < .8) { plante(g, x, .55, (n++ + (W * 5 | 0)) & 3); if (al() < .4) plante(g, x + (x < 0 ? .5 : -.5), .5, 2); } };
  /* (10.88) autour de la bouche du métro Abbesses : plus de boutiques ni de terrasses — les immeubles parisiens, leurs plantes, de petits arbres le long des murs */
  const verdureM = (g, W) => { for (let x = -W / 2 + .7; x < W / 2 - .5; x += 1.6) plante(g, x, .45, (x * 3 | 0) & 1 ? 0 : 2); for (let x = -W / 2 + 1.5; x < W / 2 - 1; x += 3.6) { cyl(.07, .1, 2.6, tronc0, x, 1.3, .7, g, 6); for (let k = 0; k < 3; k++) add(new THREE.IcosahedronGeometry(.75 - k * .12, 1), [vertJ, mat({ color: 0x4a7a30, roughness: .9 }), mat({ color: 0x2e5a22, roughness: .9 })][k], x + (k - 1) * .25, 2.9 + k * .45, .7 + (k % 2) * .15, g); cyl(.4, .4, .05, mat({ color: 0x2a2a2a, metalness: .5 }), x, .03, .7, g, 12); } box(W - .4, .5, .35, mat({ color: 0x9a8a72, roughness: .9 }), 0, .25, .2, g); for (let x = -W / 2 + .5; x < W / 2 - .4; x += .4) add(new THREE.IcosahedronGeometry(.2, 0), [vertJ, mat({ color: 0x4a7a30 })][(x * 5 | 0) & 1], x, .6, .2, g); };
  const tronc0 = mat({ color: 0x5a4a3a, roughness: .9 });
  const rangee = (ax, az, dx, dz, ry, liste) => { let t = 0; for (const [W, H, o] of liste) { { const cx = ax + dx * (t + W / 2), cz = az + dz * (t + W / 2); if (cx > -95 && cx < -71 && cz > 30 && cz < 50) { o.rdc = verdureM; o.sansSalle = true; o.jard = true; } }   // (autour du métro)
      if (!o.rdc && W > 3 && !o.nue) o.rdc = boutique; if (o.rdc && W > 3) { const r0 = o.rdc; o.rdc = (g, W2) => { r0(g, W2); pots(g, W2); }; } const x = ax + dx * (t + W / 2), z = az + dz * (t + W / 2); const g = maison(x, z, ry, W, H, o);
      if (o.lierre) lierre(g, W, H, o.lierre === 2, undefined, o.rdc ? 4.5 : 0); if (o.jard && !(MOBILE || GPU_MODESTE)) jardinieres(g, W, H, o.etages, o.fen); if (o.lanterne !== false) { const nx = Math.sin(ry), nz = Math.cos(ry); lanterneMur(x + dx * (W / 2 - .6), 4.6, z + dz * (W / 2 - .6), nx, nz); }
      t += W; } };
  // l'enseigne ronde en potence (la droguerie, sur la photo)
  const potence = (g, x, y, txt, fond, coul) => { const t = tT(256, 256, (c, w, h) => { c.fillStyle = fond; c.beginPath(); c.arc(128, 128, 120, 0, 7); c.fill(); c.strokeStyle = coul; c.lineWidth = 8; c.beginPath(); c.arc(128, 128, 108, 0, 7); c.stroke(); c.fillStyle = coul; c.textAlign = "center"; c.textBaseline = "middle"; fit(c, txt, 200, 44, `italic bold @ ${serif}`); c.fillText(txt, 128, 132); });
    box(.04, .04, 1.0, fonteM, x, y + .55, .5, g); const d = add(new THREE.CylinderGeometry(.42, .42, .05, 24), lumT(t, .05, .7), x, y, .9, g); d.rotation.set(0, 0, Math.PI / 2); };
  // le losange rouge du tabac
  const tabac = (g, x, y) => { const t = tT(64, 160, (c, w, h) => { c.fillStyle = "#c8141c"; c.fillRect(0, 0, w, h); c.fillStyle = "#fff"; c.font = "bold 22px Arial"; c.textAlign = "center"; ["T", "A", "B", "A", "C"].forEach((l, i) => c.fillText(l, w / 2, 30 + i * 28)); });
    box(.04, .04, .6, fonteM, x, y + .7, .3, g); box(.06, 1.1, .4, lumT(t, .2, 1.6), x, y, .6, g); };

  /* ---------- la rue Norvins (de la place vers l'ouest) : la boulangerie, La Galette des Moulins (la devanture verte), les galeries, le tabac ; en face, Le Consulat, le café au grand store crème ---------- */
  rangee(-80, ZNo0, 1, 0, 0, [
    [8, 11, { ...ordinaire(1), rdc: (g, W) => { devanture(g, W, { bois: 0x8a5a2a, travees: 3, porte: 0, fondV: "#f0c070", bandeau: ["BOULANGERIE", "#7a4a1e", "#f0d890"] }); } }],
    [7, 10.5, { teinte: "#efe9dc", volets: "#7a9a6a", etages: 3, rdc: (g, W) => { devanture(g, W, { bois: 0x7a9a72, travees: 2, porte: 0, porteC: 0x6a8a62, fondV: "#e8b060", genre: "pain", lanternes: false }); for (let k = 0; k < 9; k++) box(k % 2 ? .7 : .95, .5, .5, mat({ color: 0xd8ccb0, roughness: .95 }), -W / 2 - .05 + (k % 2 ? .12 : 0), .25 + k * .52, .1, g);   /* la chaîne d'angle en pierre */ panneau(g, W - .4, 4.12, .8, "La Galette des Moulins", "#c8d8b8", "#2a3a2a", { cadre: "#5a7a52" });
      lierre(g, W, 10.5, false, W / 2 - 1.2, 4.5, 2); } }],
    [8, 11, { ...ordinaire(2), jard: true, rdc: (g, W) => devanture(g, W, { bois: 0xe8e4dc, travees: 2, porte: 9, rideau: true, lanternes: false }) }],
    [8, 12, { ...ordinaire(3), rdc: (g, W) => { devanture(g, W, { bois: 0x5a1a1a, travees: 3, porte: 1, fondV: "#f0b060", store: ["#8a1a1c", "BAR · TABAC", "#f2ead8"], storeD: 1.4 }); tabac(g, W / 2 - .3, 4.4); } }],
    [9, 11, { ...ordinaire(4), lierre: 2, jard: true, rdc: (g, W) => devanture(g, W, { bois: 0x2a3a5a, travees: 3, porte: 2, fondV: "#f0d8a0", genre: "galerie", bandeau: ["GALERIE  D'ART  ·  MONTMARTRE", "#2a3a5a", "#f2ead8"] }) }],
    [7, 10.5, { ...ordinaire(5), rdc: (g, W) => { devanture(g, W, { bois: 0x3a2a1e, travees: 2, porte: 1, fondV: "#e8a050" }); potence(g, -W / 2 + .4, 4.4, "Droguerie", "#5a3a22", "#e8c890"); } }],
    [11.5, 12, { ...ordinaire(0), jard: true, rdc: (g, W) => devanture(g, W, { bois: 0x6a1a1a, travees: 4, porte: 1, fondV: "#f0a050", genre: "boutique", store: ["#7a1a1a", "SOUVENIRS DE MONTMARTRE", "#f2ead8"], storeD: 1.3 }) }]]);
  rangee(-30.5, ZNo1, -1, 0, Math.PI, [
    [11.5, 12, { teinte: "#efe9da", volets: "#3a5aa8", etages: 3, jard: true, rdc: (g, W) => { devanture(g, W, { bois: 0x1a2a5a, travees: 3, porte: 2, porteC: 0x1a2a5a, fondV: "#f0b860", bandeau: ["CAFÉ", "#1a2a5a", "#f0c860"] });   // le café bleu aux livres (la photo)
      for (const x of [-2.8, 2.8]) add(new THREE.IcosahedronGeometry(.35, 0), vertJ, x, .3, .5, g); lierre(g, W, 12, false, W / 2 - 1.4, 4.5, 2.4); } }],
    [10, 11, { ...ordinaire(6), lierre: 1, rdc: (g, W) => devanture(g, W, { bois: 0xe8e4dc, travees: 3, porte: 1, fondV: "#f8e8c8", genre: "galerie", bandeau: ["GALERIE", "#f2efe6", "#3a3a3a"] }) }],
    [8, 11, { ...ordinaire(7), jard: true }],
    [10, 14, { teinte: "#e6d6b6", volets: false, etages: 4, balcon: true, rdc: (g, W) => devanture(g, W, { bois: 0x1a1a1a, travees: 4, porte: 1, fondV: "#f0b060", store: ["#e8dcc0", "CAFÉ", "#2a2a2a"], storeD: 2.2, guirlande: true }) }],   // le café d'angle au grand store crème (la photo)
    [10, 13, { teinte: "#f2efe6", volets: "#f2f2ee", etages: 3, peint: ["LE  CONSULAT", "#b8141c", 0], peintNuit: true, rdc: (g, W) => devanture(g, W, { bois: 0xa8141c, travees: 4, porte: 0, fondV: "#f0a040", store: ["#b8141c", "LE  CONSULAT", "#f2ead8"], raye: "#1e6a3a", ardoise: "Le Consulat", storeD: 1.8, guirlande: true }) }]]);
  terrasse(-79.5, ZNo1 - .2, 1, 0, 0, -1, 9, 1, false); terrasse(-69.5, ZNo1 - .2, 1, 0, 0, -1, 9, 1, false); terrasse(-41, ZNo1 - .2, 1, 0, 0, -1, 9, 1, false);

  /* ---------- la rue des Saules : au bout de la rue Norvins, La Maison Rose (rose, volets verts, « Restaurant-Café, est. 1908 ») ; la boulangerie aux pains en vitrine ;
     la maison turquoise et son store rayé jaune ; au coin de la rue Saint-Rustique, La Bonne Franquette, ses lettres d'or, « Aimer, Manger, Boire et Chanter !!! » ---------- */
  rangee(XSa0, ZSa0, 0, 1, Math.PI / 2, [
    [14, 12, { ...ordinaire(8), jard: true }], [13.1, 11, { ...ordinaire(9), lierre: 1 }],
    [8, 7.4, { teinte: "#f2b8c0", volets: "#4a7a4a", etages: 1, balcon: false, pignon: 2.6, peint: ["La Maison Rose", "#3a6a3a", 0, 4.3, .42], rdc: (g, W) => { devanture(g, W, { bois: 0x4a7a4a, travees: 3, porte: 1, porteC: 0x3a6a3a, fondV: "#f0b070" }); panneau(g, 2.6, 3.86, .24, "RESTAURANT · CAFÉ  —  EST. 1908", "#f2b8c0", "#3a5a3a", { x: 0 }); } }],
    [10.9, 9, { teinte: "#3aa8a0", volets: "#f2f2ee", etages: 2, jard: true, rdc: (g, W) => devanture(g, W, { bois: 0x6a8a5a, travees: 3, porte: 1, fondV: "#f0c070", store: ["#e8c020", "ÉPICERIE · PRIMEUR", "#3a2a1a"], raye: true, storeD: 1.4 }) }],
    [12, 11, { teinte: "#d8c8a8", volets: "#8aa0b0", etages: 3, jard: true, rdc: (g, W) => { devanture(g, W, { bois: 0x8aa0b0, travees: 3, porte: 2, fondV: "#f0c070", store: ["#e8e4d8", "", "#333"], raye: true, storeD: 1.2 });
      panneau(g, 3.6, 4.6, .6, "Boulangerie Maison", "#4a2a1a", "#f2e8d8", { ital: true, dz: .05, x: -2.4 }); const pain = mat({ color: 0xc88a40 }), panier = mat({ color: 0xa8783a });   // l'étal des pains devant la vitrine
      box(3.2, .06, .8, panier, -2.4, .9, .7, g); for (let i = 0; i < 9; i++) { const b = add(new THREE.CapsuleGeometry(.06, .4, 3, 6), pain, -3.8 + i * .35, .98, .6 + (i % 2) * .2, g); b.rotation.z = Math.PI / 2; } for (let i = 0; i < 4; i++) cyl(.16, .13, .22, panier, -3.6 + i * .8, .14, .7, g, 8); } }],
    [10, 12, { ...ordinaire(10), lierre: 2 }], [8, 11, { ...ordinaire(11), jard: true }], [10, 11, { ...ordinaire(12) }]]);
  rangee(XSa1, ZSa0, 0, 1, -Math.PI / 2, [[14, 11, { ...ordinaire(14), lierre: 1 }], [4.6, 12, { ...ordinaire(15), jard: true }]]);   /* (s'arrête derrière la boulangerie de la rue Norvins : pas de maisons l'une dans l'autre) */
  rangee(XSa1, ZNo1 + 9, 0, 1, -Math.PI / 2, [[8.4, 11, { ...ordinaire(16), jard: true }], [8.6, 10.5, { ...ordinaire(17), lierre: 2 }],
    [9, 11, { teinte: "#efe8d8", volets: "#f2f2ee", etages: 3, rdc: (g, W) => { devanture(g, W, { bois: 0x1e5a4a, travees: 3, porte: 1, porteC: 0x1e5a4a, fondV: "#f0b050" });   // La Bonne Franquette (la photo)
      const t = tT(1024, 96, (c, w, h) => { c.fillStyle = "#123a30"; c.fillRect(0, 0, w, h); c.fillStyle = "#e8c060"; c.textAlign = "center"; c.textBaseline = "middle"; c.font = `bold 52px ${serif}`; c.fillText("CAFÉ · RESTAURANT", w * .62, h / 2 + 3); c.font = `italic 30px ${serif}`; c.fillText("Aimer, Manger,", w * .15, h * .32); c.fillText("Boire et Chanter !!!", w * .15, h * .72); });
      box(W, .8, .14, lumT(t, .05, .9), 0, 4.1, .3, g);
      const f = tT(256, 320, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#e8c890"); gr.addColorStop(1, "#8a5a3a"); c.fillStyle = gr; c.fillRect(0, 0, w, h); c.strokeStyle = "#c8a040"; c.lineWidth = 10; c.strokeRect(5, 5, w - 10, h - 10);
        c.fillStyle = "#6a3a2a"; c.beginPath(); c.ellipse(128, 120, 40, 50, 0, 0, 7); c.fill(); c.fillStyle = "#f0d0b0"; c.beginPath(); c.arc(128, 90, 20, 0, 7); c.fill(); c.fillStyle = "#8a1a1a"; c.fillRect(90, 180, 76, 100); c.fillStyle = "#f6f0e0"; c.beginPath(); c.arc(70, 60, 16, 0, 7); c.fill(); c.beginPath(); c.arc(190, 60, 16, 0, 7); c.fill(); });   // la fresque peinte : le violoneux, les angelots
      box(1.5, 1.9, .06, lumT(f, .05, .7), -W / 2 + 1.1, 1.8, .14, g); } }]]);
  terrasse(XSa1 - .2, 17.4, 0, 1, -1, 0, 8.6, 1, false);
  { const vT = tT(1024, 96, (c, w, h) => { c.fillStyle = "#1a2a26"; c.fillRect(0, 0, w, h); c.fillStyle = "#f2ead8"; c.textAlign = "center"; c.textBaseline = "middle"; c.font = `bold 54px ${serif}`; c.fillText("LA BONNE FRANQUETTE", w / 2, h / 2 + 3); }), vM = lumT(vT, .03, .5), toile = mat({ color: 0xf2ede0, side: THREE.DoubleSide });   // les parasols carrés, leur lambrequin écrit (la photo)
    for (const z of [18.6, 22.8]) { const x = XSa1 - 1.1; cyl(.03, .03, 2.4, fonteM, x, 1.2, z, scene, 6); const t = add(new THREE.ConeGeometry(1.45, .45, 4, 1, true), toile, x, 2.55, z); t.rotation.y = Math.PI / 4;
      for (const [dx, dz, ry] of [[1.02, 0, Math.PI / 2], [-1.02, 0, -Math.PI / 2], [0, 1.02, 0], [0, -1.02, Math.PI]]) pl2(2.04, .26, vM, x + dx, 2.2, z + dz, scene).rotation.y = ry; } }
  { const pq = (txt, x, y, z, ry) => { const t = tT(256, 128, (c, w, h) => { c.fillStyle = "#1a4a3a"; c.fillRect(0, 0, w, h); c.strokeStyle = "#f2f2f2"; c.lineWidth = 5; c.strokeRect(6, 6, w - 12, h - 12); c.fillStyle = "#f2f2f2"; c.textAlign = "center"; c.font = "bold 18px Arial"; c.fillText("18e Arrt", w / 2, 34); c.font = "bold 30px Arial"; const [a, b] = txt.split("|"); c.fillText(a, w / 2, 70); c.fillText(b || "", w / 2, 104); });
      box(.9, .45, .04, mat({ map: t }), x, y, z, scene, ry); };
    pq("RUE DES|SAULES", XSa1 - .04, 3.4, ZRu0 - .9, -Math.PI / 2); pq("RUE SAINT|RUSTIQUE", XSa1 + .9, 3.4, ZRu0 + .04, 0); pq("RUE|NORVINS", -23, 3.4, ZNo1 - .04, Math.PI); pq("RUE|NORVINS", XO + .04, 3.4, ZNo1 + .6, Math.PI / 2); pq("RUE DES|SAULES", XSa0 + .04, 3.4, ZNo0 - .7, Math.PI / 2); }
  /* le bout de la rue des Saules, au nord : le vieux mur de moellons, son chaperon de tuiles, le lierre et la vigne vierge qui grimpent ; la petite porte de bois ;
     derrière, les rangs de vigne du Clos Montmartre qui montent, et les arbres */
  { const moT = tT(256, 256, (c, w, h) => { c.fillStyle = "#8a8070"; c.fillRect(0, 0, w, h); for (let i = 0; i < 160; i++) { const v = 140 + al() * 60, x = al() * w, y = al() * h; c.fillStyle = `rgb(${v | 0},${(v - 10) | 0},${(v - 28) | 0})`; c.beginPath(); c.ellipse(x, y, 10 + al() * 14, 7 + al() * 8, al() * .5, 0, 7); c.fill(); c.strokeStyle = "rgba(60,50,40,.5)"; c.lineWidth = 2; c.stroke(); } }, 2.4, 1.6);
 const moM = mat({ map: moT, roughness: .95 }), tuile = mat({ color: 0x9a4a32, roughness: .8 }), ZM = ZSa0 - .3;
    box(XSa1 - XSa0 + .6, 4.2, .8, moM, (XSa0 + XSa1) / 2, 2.1, ZM); const ch = box(XSa1 - XSa0 + .8, .18, 1.1, tuile, (XSa0 + XSa1) / 2, 4.28, ZM); ch.rotation.x = .08;
    for (let i = 0; i < 18; i++) cyl(.06, .06, .5, tuile, XSa0 - .2 + i * .38, 4.36, ZM, scene, 6).rotation.z = Math.PI / 2;   // (les tuiles canal du chaperon)
    // la petite porte de bois, sa plaque
    box(1.3, 2.3, .1, mat({ color: 0x5a3a22, roughness: .8 }), -82.2, 1.15, ZM + .42); for (let i = 0; i < 5; i++) box(.02, 2.2, .02, mat({ color: 0x3a2414 }), -82.7 + i * .25, 1.15, ZM + .48); box(1.5, .14, .2, moM, -82.2, 2.38, ZM + .45);
    { const t = tT(256, 96, (c, w, h) => { c.fillStyle = "#f2ead8"; c.fillRect(0, 0, w, h); c.strokeStyle = "#3a2a1a"; c.lineWidth = 4; c.strokeRect(4, 4, w - 8, h - 8); c.fillStyle = "#3a2a1a"; c.textAlign = "center"; c.textBaseline = "middle"; c.font = `italic bold 30px ${serif}`; c.fillText("Clos Montmartre", w / 2, 38); c.font = `italic 20px ${serif}`; c.fillText("les vignes", w / 2, 70); });
      box(.9, .34, .04, mat({ map: t }), -84.2, 2.2, ZM + .42); }
    // le lierre et la vigne vierge, plaqués sur le mur, qui retombent par-dessus
    for (const [x, w, r] of [[-85.2, 1.8, 1], [-80.9, 1.7, 0], [-83.7, 1.2, 0]]) pl2(w, 3.9, LIERRE[r], x, 2.4, ZM + .43, scene);
    for (let i = 0; i < 14; i++) add(new THREE.IcosahedronGeometry(.22 + al() * .2, 0), [vertJ, mat({ color: 0x2a5a24 }), mat({ color: 0xa83a1e })][i % 3], XSa0 + .3 + al() * 5.4, 4.3 + al() * .4, ZM + (al() - .5) * .8);
    for (const x of [-85.3, -80.7]) { cyl(.28, .22, .45, mat({ color: 0xa85a3a }), x, .23, ZM + .8, scene, 10); for (let k = 0; k < 4; k++) add(new THREE.IcosahedronGeometry(.18, 0), fleursM[k], x + (al() - .5) * .3, .55 + al() * .2, ZM + .8 + (al() - .5) * .3); }
    lanterneMur(-80.6, 3.4, ZM + .42, 0, 1);
    // (10.88) derrière le mur : un immeuble parisien qui ferme la rue (plus d'arbres ni de vigne qui dépassent)
    maison(-83, ZM - 1.2, 0, 17, 15, { ...ordinaire(61), sansSalle: true, etages: 4 }); }
  // le chanteur des rues, sa guitare, sur son tabouret devant La Bonne Franquette ; et le monsieur au béret qui chante avec lui
  const MUSI = []; if (GENS) { const m = personne3D({ taille: 1.74, peau: "#e8bd95", ch: "#e8e8e8", haut: "#e8b8b8", bas: "#e8e2d2", chaussures: "#5a3a22", coif: "court", pantalon: true }); m.position.set(XSa1 - 1.6, .48 - m.userData.hipY, 22); m.rotation.y = -Math.PI / 2 - .4; m.userData.poser("assis", 0); scene.add(m);
    const P = m.userData.parts, gui = new THREE.Group(); gui.position.set(.05, .05, .18); gui.rotation.set(0, 0, .9); P.buste.add(gui); add(new THREE.SphereGeometry(.17, 12, 8), mat({ color: 0xc8883a, roughness: .4 }), 0, -.05, 0, gui).scale.set(1, 1.25, .35); add(new THREE.BoxGeometry(.05, .5, .03), mat({ color: 0x3a2414 }), 0, .32, 0, gui);
    add(new THREE.CylinderGeometry(.11, .11, .02, 12), mat({ color: 0xf2f2ee }), 0, .08, .21, P.tete).rotation.x = .1; cyl(.06, .07, .08, mat({ color: 0xf2f2ee }), 0, .13, 0, P.tete, 10);   // le chapeau blanc
    cyl(.18, .16, .46, rotinM, XSa1 - 1.6, .23, 22); MUSI.push({ m, gui, k: 0 });
    const b = personne3D({ taille: 1.7, peau: "#f0c9a6", ch: "#8a8a8a", haut: "#e8e8f2", bas: "#3a9a8a", chaussures: "#8a6a4a", coif: "court", pantalon: true }); b.position.set(XSa1 - 2.4, 0, 24); b.rotation.y = -Math.PI * .8; b.userData.poser("debout", 0); scene.add(b);
    add(new THREE.CylinderGeometry(.14, .13, .06, 14), mat({ color: 0x1a2a4a }), 0, .1, -.01, b.userData.parts.tete); MUSI.push({ m: b, k: 1 }); }

  /* ---------- la rue Saint-Rustique : la rue pavée qui file vers la butte et le Sacré-Cœur ; les cafés bleus, la grande horloge, la boulangerie, le fleuriste et ses fleurs sur le trottoir ---------- */
  rangee(-72.3, ZRu0, 1, 0, 0, [   /* (La Bonne Franquette fait l'angle) */
    [8, 11, { teinte: "#f2efe6", volets: "#f2f2ee", etages: 3, rdc: (g, W) => { devanture(g, W, { bois: 0x2a5a7a, travees: 3, porte: 2, porteC: 0x2a5a7a, fondV: "#f0b860" });   // le café bleu et sa grande horloge (la photo)
      const t = tT(256, 256, (c, w, h) => { c.fillStyle = "#f2e6c8"; c.beginPath(); c.arc(128, 128, 122, 0, 7); c.fill(); c.strokeStyle = "#3a2a1a"; c.lineWidth = 6; c.beginPath(); c.arc(128, 128, 116, 0, 7); c.stroke(); c.fillStyle = "#2a1a10"; c.font = `bold 26px ${serif}`; c.textAlign = "center"; c.textBaseline = "middle";
        ["XII", "I", "II", "III", "IIII", "V", "VI", "VII", "VIII", "IX", "X", "XI"].forEach((n, i) => { const a = i / 12 * Math.PI * 2 - Math.PI / 2; c.fillText(n, 128 + Math.cos(a) * 92, 128 + Math.sin(a) * 92); }); c.lineWidth = 6; c.beginPath(); c.moveTo(128, 128); c.lineTo(128 + 50, 128 - 30); c.stroke(); c.lineWidth = 4; c.beginPath(); c.moveTo(128, 128); c.lineTo(128 - 10, 128 - 80); c.stroke(); });
      box(3.4, 1.5, .1, mat({ color: 0x2a5a7a }), 0, 4.45, .55, g); const d = add(new THREE.CylinderGeometry(.66, .66, .06, 28), lumT(t, .05, .8), 0, 4.45, .64, g); d.rotation.x = Math.PI / 2; } }],
    [10, 12, { ...ordinaire(19), lierre: 2 }],
    [7, 10.5, { teinte: "#d8d4ca", volets: "#f2f2ee", etages: 3, rdc: (g, W) => { devanture(g, W, { bois: 0x1e3a5e, travees: 2, porte: 1, porteC: 0x1e3a5e, fondV: "#e8a860", bandeau: ["CAFÉ", "#1e3a5e", "#f0c860"] });   // le café-librairie bleu (la photo)
      lierre(g, W, 5, false, -W / 2 + .25, 0, .45); lierre(g, W, 5, false, W / 2 - .25, 0, .45);   /* (la vigne qui grimpe de chaque côté de la devanture, comme sur la photo) */ const ta = add(new THREE.CylinderGeometry(.3, .3, .03, 14), mat({ color: 0xe8e2d6 }), 0, .74, .9, g); void ta; cyl(.03, .03, .72, fonteM, 0, .37, .9, g, 6); } }],
    [10, 12, { ...ordinaire(20), jard: true }],
    [10, 11, { ...ordinaire(21), rdc: (g, W) => devanture(g, W, { bois: 0x7a1a1a, travees: 4, porte: 1, fondV: "#f0a050", store: ["#b8202a", "RESTAURANT", "#f2ead8"], storeD: 2.0 }) }],
    [9, 11, { ...ordinaire(22), lierre: 1 }],
    [8.6, 11, { ...ordinaire(23), rdc: (g, W) => { devanture(g, W, { bois: 0x5a1a1a, travees: 3, porte: 0, fondV: "#f0b060", bandeau: ["TABAC · PRESSE", "#5a1a1a", "#f2ead8"] }); tabac(g, W / 2 - .3, 4.4); } }],
    [8, 10.5, { ...ordinaire(24), jard: true }]]);
  rangee(3.8, ZRu0, 1, 0, 0, [
    [9, 11, { ...ordinaire(25), lierre: 2, rdc: (g, W) => { devanture(g, W, { bois: 0x2a4a3a, travees: 3, porte: 1, fondV: "#f0d0a0", bandeau: ["FLEURISTE", "#2a4a3a", "#f2ead8"] }); fleuriste(g, W); } }],
    [10, 12, { ...ordinaire(26), lierre: 1 }],
    [12, 11, { teinte: "#efe6d6", volets: "#f2f2ee", etages: 3, rdc: (g, W) => devanture(g, W, { bois: 0xa8141c, travees: 4, porte: 2, fondV: "#f0a050", store: ["#c81c24", "CAFÉ · RESTAURANT", "#f2ead8"], storeD: 2.2 }) }],
    [10, 12, { ...ordinaire(27), lierre: 2, jard: true }], [11.5, 11, { ...ordinaire(28) }]]);
  rangee(-71, ZRu1, 1, 0, Math.PI, [
    [9, 11, { ...ordinaire(30), lierre: 2 }],
    [9, 9, { teinte: "#3aa8a0", volets: "#f2f2ee", etages: 2, jard: true, rdc: (g, W) => devanture(g, W, { bois: 0x7a9a6a, travees: 3, porte: 1, porteC: 0x7a9a6a, fondV: "#f0c070", store: ["#f0d020", "", "#333"], raye: true, storeD: 1.2 }) }],   // la maison turquoise au store rayé jaune
    [10, 12, { ...ordinaire(31) }], [9, 11, { ...ordinaire(32), lierre: 1, rdc: (g, W) => { devanture(g, W, { bois: 0x2a4a3a, travees: 3, porte: 1, fondV: "#f0d0a0", bandeau: ["FLEURS", "#2a4a3a", "#f2ead8"] }); fleuriste(g, W); } }],
    [12, 12, { ...ordinaire(33), jard: true }], [10, 11, { ...ordinaire(34), rdc: (g, W) => devanture(g, W, { bois: 0x8a1418, travees: 4, porte: 1, fondV: "#f0a050", store: ["#b01820", "CRÊPERIE", "#f2ead8"], storeD: 1.8 }) }],
    [10, 12, { ...ordinaire(35), lierre: 2 }], [10, 11, { ...ordinaire(36) }], [10, 12, { ...ordinaire(37), jard: true }], [10, 11, { ...ordinaire(38), lierre: 1 }],
    [9, 11, { ...ordinaire(39) }], [12, 12, { ...ordinaire(40), jard: true }], [7, 10, { ...ordinaire(41) }]]);
  terrasse(23, ZRu0 + .2, 1, 0, 0, 1, 11, 1, true); terrasse(-36.5, ZRu0 + .2, 1, 0, 0, 1, 9, 1, false);
  /* la rue Saint-Éleuthère : des restaurants des deux côtés, leurs stores, leurs petites terrasses */
  const resto = (txt, coul, bois, raye) => (g, W) => devanture(g, W, { bois, travees: 4, porte: 1, fondV: "#f0b060", genre: "cafe", store: [coul, txt, "#f2ead8"], raye, storeD: 1.8, guirlande: true, ardoise: true });
  rangee(XE + 9, 8.5, 1, 0, 0, [[11, 11, { ...ordinaire(50), jard: true, rdc: resto("LE  RELAIS  DE  LA  BUTTE", "#7a1a1a", 0x5a1414) }], [11, 10.5, { ...ordinaire(51), lierre: 2, rdc: resto("CHEZ  PLUMEAU", "#1e4a3a", 0x163a2c) }]]);
  rangee(XE, ZS, 1, 0, Math.PI, [[11, 11, { ...ordinaire(52), jard: true, rdc: resto("LA  CABANE  DU  TERTRE", "#1a2a5a", 0x161c30, "rgba(255,255,255,.85)") }], [11, 11.5, { ...ordinaire(53), lierre: 1, rdc: resto("L'ÉTOILE  DE  MONTMARTRE", "#a8141c", 0x7a1418) }]]);
  terrasse(XE + 9.3, 8.7, 1, 0, 0, 1, 21, 1, true); terrasse(XE + .3, ZS - .2, 1, 0, 0, -1, 21, 1, false);
  // le passage de la place à la rue Saint-Rustique (l'ancienne rue du Calvaire)
  
  // au bout de la rue des Saules, vers le sud : la station Abbesses, sa marquise de Guimard (le verre en éventail, les tiges de fonte verte, les deux lampes orange) ; on y reprend le métro
  rangee(XSa1, ZRu1, 0, 1, -Math.PI / 2, [[12, 11, { ...ordinaire(44), jard: true }]]); rangee(-92, ZSa1, 1, 0, Math.PI, [[18, 11, { ...ordinaire(45) }]]);
  /* la station Abbesses, sa marquise d'Hector Guimard (d'après la photo) : l'éventail de verre dépoli sur ses nervures de fonte verte, le cartouche jaune « METROPOLITAIN »
     aux lettres vertes, les deux piliers qui s'évasent, la rambarde de fonte à écussons, le plan « Abbesses » au fond, les globes au bas des marches */
  const GX = (XSa0 + XSa1) / 2, GZ = 39; { const vertG = mat({ color: 0x2e5a44, roughness: .4, metalness: .55 }), verre = mat({ color: 0xe8ece4, transparent: true, opacity: .8, roughness: .3, side: THREE.DoubleSide, emissive: 0xfff4e0, emissiveIntensity: .05 }), pierreG = mat({ color: 0xe4dccc, roughness: .85 }), esc = mat({ color: 0x9a948a });
    const X0 = GX - 1.75, X1 = GX + 1.75, ZA = GZ - 2.4, ZB = GZ + 2.6;   // (l'entrée au nord, ZA ; le fond au sud, ZB)
    // la trémie : les marches qui descendent, les murets de pierre de chaque côté et au fond
    for (let i = 0; i < 12; i++) box(3.1, .17, .42, esc, GX, -.085 - i * .17, ZA + .2 + i * .42, scene); box(3.4, 3.4, .5, mat({ color: 0x1a1a1a }), GX, -1.9, ZB + .1, scene); { const carM = mat({ color: 0xe8e4da, roughness: .4 }); for (const x of [GX - 1.62, GX + 1.62]) box(.14, 2.6, ZB - ZA + .3, carM, x, -1.3, (ZA + ZB) / 2, scene); box(3.4, .1, 1.2, esc, GX, -2.09, ZB - .4, scene); }   /* (10.88) sous le pavé : les murs carrelés de la trémie, le palier — plus de ciel entre les marches */
    for (const x of [X0, X1]) box(.35, .55, ZB - ZA, pierreG, x, .27, (ZA + ZB) / 2, scene); box(X1 - X0 + .35, .55, .35, pierreG, GX, .27, ZB, scene);
    // en bas des marches : la rangée de globes, le grand panneau bleu « Abbesses »
    for (let i = 0; i < 5; i++) add(new THREE.SphereGeometry(.13, 12, 10), lum(mat({ color: 0xfff0c0, emissive: 0xffe0a0, emissiveIntensity: .6 }), .6, 2.4), GX - 1.1 + i * .55, -.55, ZB - .18);
    { const t = tT(512, 64, (c, w, h) => { c.fillStyle = "#1a2a5a"; c.fillRect(0, 0, w, h); c.fillStyle = "#fff"; c.font = "bold 40px Arial"; c.textBaseline = "middle"; c.fillText("Abbesses", 120, h / 2 + 2); c.beginPath(); c.arc(40, h / 2, 22, 0, 7); c.fillStyle = "#c8a020"; c.fill(); c.fillStyle = "#1a2a5a"; c.font = "bold 24px Arial"; c.textAlign = "center"; c.fillText("12", 40, h / 2 + 2); });
      box(3, .38, .05, lumT(t, .2, 1), GX, -1.05, ZB - .16); }
    // la rambarde de fonte : la main courante, les barreaux, les écussons ronds
    const ecu = new THREE.TorusGeometry(.2, .03, 6, 16);
    for (const [ax, az, bx, bz] of [[X0, ZA + .3, X0, ZB], [X1, ZA + .3, X1, ZB], [X0, ZB, X1, ZB]]) { const l = Math.hypot(bx - ax, bz - az), along = az === bz;
      box(along ? l : .05, .05, along ? .05 : l, vertG, (ax + bx) / 2, 1.5, (az + bz) / 2); box(along ? l : .04, .04, along ? .04 : l, vertG, (ax + bx) / 2, .62, (az + bz) / 2);
      for (let t = 0; t < l; t += .16) box(.025, .9, .025, vertG, ax + (bx - ax) * t / l, 1.06, az + (bz - az) * t / l);
      for (let t = .6; t < l - .3; t += 1.2) { const e = add(ecu, vertG, ax + (bx - ax) * t / l, 1.08, az + (bz - az) * t / l); e.rotation.y = along ? 0 : Math.PI / 2; } }
    // les quatre piliers de fonte, évasés à la base, recourbés en haut ; deux petites lanternes sur les côtés
    for (const [x, z, h] of [[X0, ZA, 3.5], [X1, ZA, 3.5], [X0, ZB - .3, 3.0], [X1, ZB - .3, 3.0]]) { cyl(.07, .16, h, vertG, x, h / 2 + .5, z, scene, 10); cyl(.2, .26, .5, vertG, x, .25, z, scene, 10); add(new THREE.SphereGeometry(.1, 8, 6), vertG, x, h + .5, z); }
    for (const x of [X0 - .15, X1 + .15]) { const l = add(new THREE.SphereGeometry(.14, 10, 8), lum(mat({ color: 0xf0e8c8, emissive: 0xffd890, emissiveIntensity: .1 }), .1, 2.2), x, 3.05, ZA + .2); l.scale.y = 1.4; }
    // l'éventail de verre : la demi-ellipse qui monte vers l'avant, ses nervures rayonnantes, son bord de fonte
    { const C = new THREE.Group(); C.position.set(GX, 3.55, ZB - .3); C.rotation.x = -.16; scene.add(C); const rx = 2.25, rz = 3.6;
      const sh = new THREE.Shape(); sh.moveTo(rx, 0); for (let i = 1; i <= 24; i++) { const a = i / 24 * Math.PI; sh.lineTo(Math.cos(a) * rx, Math.sin(a) * rz); } sh.lineTo(rx, 0);
      const vg = add(new THREE.ShapeGeometry(sh), verre, 0, .55, 0, C); vg.rotation.x = Math.PI / 2;   // (le plan de la forme : l'axe y de la forme devient -z, vers l'entrée)
      const pts = []; for (let i = 0; i <= 32; i++) { const a = i / 32 * Math.PI; pts.push(new THREE.Vector3(Math.cos(a) * rx, .55, -Math.sin(a) * rz)); } add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, .06, 6), vertG, 0, 0, 0, C);
      for (let i = 0; i <= 10; i++) { const a = i / 10 * Math.PI, ex = Math.cos(a) * rx, ez = -Math.sin(a) * rz, l = Math.hypot(ex, ez), n = box(.05, .06, l, vertG, ex / 2, .58, ez / 2, C); n.rotation.y = Math.atan2(ex, ez); }
      box(rx * 2 + .1, .1, .1, vertG, 0, .55, 0, C); add(new THREE.CylinderGeometry(.18, .18, .08, 12), vertG, 0, .65, -rz + .05, C); }   // (l'écusson au sommet)
    // le cartouche jaune « METROPOLITAIN », sous le bord avant
    { const t = tT(1024, 220, (c, w, h) => { c.fillStyle = "#2e5a44"; c.beginPath(); c.ellipse(w / 2, h / 2, w / 2 - 2, h / 2 - 2, 0, 0, 7); c.fill(); c.fillStyle = "#efe2a0"; c.beginPath(); c.ellipse(w / 2, h / 2, w / 2 - 22, h / 2 - 22, 0, 0, 7); c.fill();
        c.fillStyle = "#1e4a36"; c.textAlign = "center"; c.textBaseline = "middle"; fit(c, "METROPOLITAIN", w - 190, 104, "bold @ Georgia, serif"); c.save(); c.translate(w / 2, h / 2 + 6); c.scale(1, 1.1); c.fillText("METROPOLITAIN", 0, 0);   /* (10.88) le mot entier, bien au centre du cartouche */ c.restore(); });
      const m = mat({ map: t, transparent: true, alphaTest: .5, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: .08 }); const p = pl2(3.2, .7, m, GX, 3.35, ZA + .02, scene); p.rotation.y = Math.PI; lum(m, .08, .9);
      const p2 = pl2(3.2, .7, m, GX, 3.35, ZA - .02, scene); void p2; }
    // au fond, le plan du quartier sous son fronton orange « Abbesses »
    { const t = tT(256, 300, (c, w, h) => { c.fillStyle = "#2e5a44"; c.fillRect(0, 0, w, h); c.fillStyle = "#e8a030"; c.fillRect(10, 10, w - 20, 50); c.fillStyle = "#3a2a10"; c.font = "bold 34px Georgia, serif"; c.textAlign = "center"; c.fillText("Abbesses", w / 2, 47); const g = c.createLinearGradient(0, 70, 0, h); g.addColorStop(0, "#6a9ad8"); g.addColorStop(1, "#c8d8f0"); c.fillStyle = g; c.fillRect(14, 70, w - 28, h - 84); c.strokeStyle = "#fff"; c.lineWidth = 3; for (let i = 0; i < 9; i++) { c.beginPath(); c.moveTo(20 + al() * 200, 80 + al() * 200); c.lineTo(20 + al() * 200, 80 + al() * 200); c.stroke(); } c.fillStyle = "#c81c24"; c.fillRect(110, 170, 20, 12); });
      const p = box(1.15, 1.35, .08, lumT(t, .1, 1), GX, 1.75, ZB - .1); void p; cyl(.04, .04, 1.1, vertG, GX, .55, ZB - .1, scene, 6); }
    OB.push([X0, (ZA + ZB) / 2, .4], [X1, (ZA + ZB) / 2, .4], [GX, ZB, .5]); for (let z = ZA + .4; z < ZB; z += .7) OB.push([GX, z, 1.5]); }
  L.metroAbbesses = { x: GX, z: GZ - 3.2 };
  // les coins de la place, fermés : entre la galerie du Tertre et La Mère Catherine ; au coin sud-ouest
  rangee(15.4, ZN, 1, 0, 0, [[4.1, 12.5, { ...ordinaire(47), jard: true, rdc: (g, W) => devanture(g, W, { bois: 0x6a1a1a, travees: 2, porte: 0, porteC: 0x5a1414, fondV: "#f0b060", genre: "cafe", store: ["#a01a20", "BISTROT", "#f2ead8"], storeD: 1.0, storeW: 2.0, storeX: -.9 }) }]]);   /* (10.93) le store du coin, étroit et décalé : il ne passe plus sous celui de La Mère Catherine */ rangee(-21.5, ZS, 1, 0, Math.PI, [[1.5, 13, { ...ordinaire(48), lanterne: false }]]);

  /* ---------- le bout des rues, vers l'est : fermé par de petites maisons basses (leur boutique, le lierre) ; au-dessus des toits, au loin, les dômes du Sacré-Cœur ---------- */
  rangee(XBUT, 4.5, 0, 1, EST, [[4.5, 8.6, { teinte: "#f0ece2", volets: "#7a9a6a", etages: 1, lierre: 2, jard: true, nue: true, sansSalle: true }], [6.5, 8.6, { teinte: "#f0ece2", volets: "#7a9a6a", etages: 1, jard: true, rdc: (g, W) => devanture(g, W, { bois: 0x2a4a3a, travees: 4, porte: 1, fondV: "#f0c070", store: ["#2a4a3a", "AU  PIED  DE  LA  BUTTE", "#f2ead8"], storeD: 1.4, storeW: 5.6, guirlande: true }) }],
    [10.5, 9, { teinte: "#e8e0cc", volets: "#f2f2ee", etages: 2, jard: true }], [7, 8.2, { teinte: "#f2efe6", volets: "#6a8a9a", etages: 1, lierre: 1, rdc: (g, W) => devanture(g, W, { bois: 0x8a1418, travees: 3, porte: 1, fondV: "#f0a050", store: ["#b01820", "LE  PETIT  MONTMARTRE", "#f2ead8"], storeD: 1.3, storeW: 2.8, guirlande: true }) }]]);   /* (10.88) le store étroit : il ne croise plus celui du coin */
  /* (10.88) le bout de la rue Saint-Éleuthère, côté nord : la rue ne s'ouvre plus sur le vide — une maison à fenêtres, ses plantes contre le mur */
  { const g = maison(XE + 31 + 2.75, 8.5, 0, 5.5, 9.5, { teinte: "#ece4d2", volets: "#6a8a9a", etages: 2, sansSalle: true, rdc: (g2, W) => { box(W - .4, .9, .1, mat({ color: 0x9a8a72, roughness: .9 }), 0, .45, .06, g2); for (const x of [-W / 2 + .5, -.9, .9, W / 2 - .5]) plante(g2, x, .45, x > 0 ? 0 : 2); bouquet(g2, -W / 2 + 1.5, .5, .4, 1); bouquet(g2, W / 2 - 1.5, .5, .4, 3); for (const x of [-W / 2 + 1.5, W / 2 - 1.5]) cyl(.2, .16, .45, mat({ color: 0xa85a3a, roughness: .8 }), x, .23, .4, g2, 10); } }); lierre(g, 5.5, 9.5, true, undefined, 0); OB.push([XE + 33.75, 9.2, 2.6]); }
  /* (10.94) le grand mur du bout de la rue Saint-Éleuthère, en moellons de pierre claire (d'après les photos) ; et le Passe-Muraille, le bronze connu de Montmartre :
     l'homme qui sort du mur — le buste penché, la tête, le bras droit tendu, la main ouverte ; la main gauche qui dépasse plus loin ; la jambe et la chaussure plus bas */
  { const pierreT = tT(512, 512, (c, w, h) => { c.fillStyle = "#b8b0a0"; c.fillRect(0, 0, w, h); let gr = 77; const r = () => (gr = (gr * 16807) % 2147483647) / 2147483647;
      for (let y = 0; y < h; ) { const hh = 34 + r() * 30; let x = -r() * 40; while (x < w) { const ww = 50 + r() * 80, t = 200 + r() * 40 | 0, e = r() * 6; c.fillStyle = `rgb(${t},${t - 4 - (r() * 10 | 0)},${t - 14 - (r() * 16 | 0)})`;
          c.beginPath(); c.moveTo(x + 4 + e, y + 4); c.quadraticCurveTo(x + ww / 2, y + 1 + r() * 4, x + ww - 4, y + 5 + e); c.quadraticCurveTo(x + ww - 1 - r() * 4, y + hh / 2, x + ww - 5, y + hh - 4); c.quadraticCurveTo(x + ww / 2, y + hh - r() * 5, x + 5, y + hh - 5 - e); c.quadraticCurveTo(x + 1 + r() * 4, y + hh / 2, x + 4 + e, y + 4); c.fill();
          for (let k = 0; k < 10; k++) { c.fillStyle = `rgba(${r() < .5 ? "110,100,80" : "255,252,245"},${.08 + r() * .1})`; c.beginPath(); c.ellipse(x + 8 + r() * (ww - 16), y + 8 + r() * (hh - 16), 3 + r() * 9, 2 + r() * 6, r() * 3, 0, 7); c.fill(); }
          if (r() < .15) { c.fillStyle = "rgba(90,110,70,.18)"; c.beginPath(); c.ellipse(x + ww / 2, y + hh - 8, ww / 3, 8, 0, 0, 7); c.fill(); } x += ww; } y += hh; } }, 3, 2);
    const mP = add(new THREE.PlaneGeometry(14.3, 9.5), mat({ map: pierreT, roughness: .95 }), 48.75, 4.75, 15.43); mP.rotation.y = Math.PI;
    const bronze = mat({ color: 0x5a4632, metalness: .35, roughness: .42 }), use = mat({ color: 0xc8a068, metalness: .45, roughness: .3 }), S = new THREE.Group(); S.position.set(49, 0, 15.42); S.rotation.y = Math.PI; S.scale.setScalar(1.15); scene.add(S);   /* (le bronze patiné ; la main et le nez lustrés par les passants qui les touchent) */
    const membre = (a, b, r1, r2, m = bronze) => { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A), o = add(new THREE.CylinderGeometry(r2, r1, d.length(), 12), m, 0, 0, 0, S); o.position.copy(A).addScaledVector(d, .5); o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); add(new THREE.SphereGeometry(r2, 10, 8), m, B.x, B.y, B.z, S); return o; };
    const ell = (x, y, z, sx, sy, sz, m = bronze, par = S) => { const o = add(new THREE.SphereGeometry(1, 18, 14), m, x, y, z, par); o.scale.set(sx, sy, sz); return o; };
    const main = (x, y, z, rx, ry, rz, ouv) => { const H = new THREE.Group(); H.position.set(x, y, z); H.rotation.set(rx, ry, rz); S.add(H); ell(0, 0, 0, .065, .08, .028, use, H);   // la paume
      for (let f = 0; f < 4; f++) { const a = (f - 1.5) * (ouv ? .16 : .06), L2 = [.1, .115, .11, .085][f], d = add(new THREE.CylinderGeometry(.013, .016, L2, 7), use, Math.sin(a) * .09 - .045 + f * .03, .07 + L2 / 2, 0, H); d.rotation.z = -a; d.rotation.x = ouv ? -.15 : .5; }
      const p2 = add(new THREE.CylinderGeometry(.014, .017, .08, 7), use, .07, .02, .015, H); p2.rotation.z = -1.0; return H; };
    // le buste, à moitié sorti de la pierre : les épaules larges, la veste ouverte, la chemise, la cravate
    { const sh = new THREE.Shape(), P2 = [[-.42, 0], [-.4, .1], [-.26, .17], [-.08, .2], [.08, .2], [.26, .17], [.4, .1], [.42, 0], [.37, -.22], [.27, -.38], [.12, -.44], [-.02, -.36], [-.16, -.43], [-.3, -.33], [-.39, -.18]]; sh.moveTo(...P2[0]); for (let k = 1; k < P2.length; k++) sh.lineTo(...P2[k]); sh.closePath();
      const bu = add(new THREE.ExtrudeGeometry(sh, { depth: .1, bevelEnabled: true, bevelThickness: .07, bevelSize: .06, bevelSegments: 5, curveSegments: 6 }), bronze, 0, 2.3, -.05, S); bu.scale.set(1, 1, 1.1); }   /* (le buste en relief, sorti de la pierre, coupé net en bas) */
    for (const sx of [-1, 1]) { const rv = add(new THREE.BoxGeometry(.09, .34, .025), bronze, sx * .09, 2.22, .13, S); rv.rotation.z = sx * .32; rv.rotation.x = -.1; }
    ell(0, 2.22, .1, .07, .17, .04, mat({ color: 0x6e5a42, metalness: .35, roughness: .45 })); add(new THREE.BoxGeometry(.045, .2, .02), bronze, 0, 2.18, .145, S);
    membre([0, 2.42, .05], [.01, 2.56, .1], .07, .065);   // le cou
    // la tête : penchée, tournée vers la main levée ; les cheveux plaqués en arrière, le grand nez, les yeux mi-clos, le sourire en coin
    const T = new THREE.Group(); T.position.set(0, 2.72, .13); T.rotation.set(.28, -.42, .05); S.add(T); ell(0, 0, 0, .12, .155, .13, bronze, T); ell(0, -.1, .035, .085, .06, .085, bronze, T);
    ell(0, .06, -.025, .128, .11, .128, mat({ color: 0x4a3a28, metalness: .35, roughness: .5 }), T); for (let k = 0; k < 4; k++) { const m2 = add(new THREE.BoxGeometry(.2, .008, .01), mat({ color: 0x3a2c1e }), 0, .1 - k * .03, .07 - k * .025, T); m2.rotation.x = -.6 - k * .2; }   // les cheveux, les sillons du peigne
    const nz = add(new THREE.ConeGeometry(.024, .085, 8), use, 0, -.005, .135, T); nz.rotation.x = Math.PI / 2 + .25;   // le nez, lustré
    for (const sx of [-1, 1]) { ell(sx * .047, .025, .11, .028, .009, .012, mat({ color: 0x2a2018 }), T); ell(sx * .047, .05, .112, .033, .009, .012, bronze, T); ell(sx * .118, -.005, -.005, .022, .042, .026, bronze, T); }   // les yeux, les sourcils, les oreilles
    { const b2 = add(new THREE.TorusGeometry(.03, .006, 5, 10, Math.PI * .8), mat({ color: 0x2a2018 }), 0, -.07, .125, T); b2.rotation.z = Math.PI + .2; }   // la bouche
    // le bras droit qui sort du mur, tendu, la main ouverte vers les passants
    membre([-.33, 2.32, .02], [-.58, 2.22, .4], .095, .085); membre([-.58, 2.22, .4], [-.66, 2.46, .64], .085, .075); { const mc = add(new THREE.CylinderGeometry(.08, .08, .06, 12), bronze, -.665, 2.48, .655, S); mc.rotation.x = -.6; }
    main(-.68, 2.57, .7, -.4, .3, .25, true);
    // plus loin, la main gauche qui dépasse seule de la pierre, la manchette, les doigts pendants
    membre([.55, 1.74, -.03], [.58, 1.72, .12], .07, .068); main(.6, 1.62, .16, .9, 0, -.15, false);
    // et la jambe : la cuisse, le genou, le mollet, la chaussure qui sort du mur
    membre([.03, 1.5, -.04], [.07, 1.02, .13], .14, .12); membre([.07, 1.02, .13], [.05, .6, .07], .115, .09); ell(.06, .52, .16, .08, .06, .16); ell(.06, .5, .25, .07, .045, .06, use);   // (le bout de la chaussure, lustré)
  }
  /* ---------- les platanes du carré, leurs grilles ; les réverbères à lanterne ---------- */
  const ecorceT = tT(64, 128, (c, w, h) => { c.fillStyle = "#8a8a7a"; c.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { c.fillStyle = ["#a8a890", "#6a6a5a", "#c8c4a8", "#5a5a4a"][i % 4]; c.beginPath(); c.ellipse(al() * w, al() * h, 4 + al() * 8, 6 + al() * 12, 0, 0, 7); c.fill(); } }, 1, 2);
  const tronc = mat({ map: ecorceT }), feuilles = [mat({ color: 0x4a6a2a, roughness: .9 }), mat({ color: 0x5a7a32, roughness: .9 }), mat({ color: 0x3a5a24, roughness: .9 })], grille = mat({ color: 0x2a2a2a, metalness: .6 });
  const platane = (x, z) => { const y0 = YS; cyl(.18, .26, 7.5, tronc, x, y0 + 3.75, z, scene, 8); for (let b = 0; b < 3; b++) { const a = b * 2.1 + al(), br = cyl(.08, .12, 3, tronc, x + Math.cos(a) * .7, y0 + 7.3, z + Math.sin(a) * .7, scene, 6); br.rotation.set(Math.sin(a) * .5, 0, -Math.cos(a) * .5); }
    for (let k = 0; k < 8; k++) { const r = 1.0 + al() * .9; add(new THREE.IcosahedronGeometry(r, 1), feuilles[k % 3], x + (al() - .5) * 3.6, y0 + 8.6 + al() * 2.4, z + (al() - .5) * 3.6); }
    LEDC.push([x, z]); const gr = add(new THREE.RingGeometry(.35, .75, 16), grille, x, y0 + .01, z); gr.rotation.x = -Math.PI / 2; OB.push([x, z, .4]); };
  for (const x of [-10, -3.5, 3.5, 10]) for (const z of [-6, 0.5, 6.5]) if (!(x > 2 && z > 3) && !(x > 2 && z < -3) && !(x < -8 && Math.abs(z) < 3)) platane(x + (al() - .5), z + (al() - .5));
  platane(-17.5, -13);
  // le soir, les guirlandes bleues enroulées dans les branches des platanes (comme sur la photo de nuit)
  { const P2 = []; for (const [x, z] of LEDC) { for (let i = 0; i < 150; i++) { const a = al() * 6.283, h = al(), r = (1 - h * .5) * 2.4 * Math.sqrt(al()); P2.push(x + Math.cos(a) * r, YS + 4 + h * 7.5, z + Math.sin(a) * r); } for (let i = 0; i < 20; i++) { const a = i * 1.1; P2.push(x + Math.cos(a) * .3, YS + 1 + i * .17, z + Math.sin(a) * .3); } }
    const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.Float32BufferAttribute(P2, 3)); const rT = tT(32, 32, (c) => { const g2 = c.createRadialGradient(16, 16, 1, 16, 16, 15); g2.addColorStop(0, "rgba(255,240,210,1)"); g2.addColorStop(.35, "rgba(255,170,80,.7)"); g2.addColorStop(1, "rgba(255,130,40,0)"); c.fillStyle = g2; c.fillRect(0, 0, 32, 32); }), pM = new THREE.PointsMaterial({ map: rT, color: 0xffb060, size: .3, sizeAttenuation: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
    const leds = new THREE.Points(geo, pM); leds.visible = false; scene.add(leds); L.ledsTertre = leds; NUIT.push([{ set emissiveIntensity(v) { leds.visible = v > 0; } }, 0, 1]); }
  const lanterne = (x, z, y0 = 0) => { cyl(.07, .12, 3.6, fonteM, x, y0 + 1.8, z, scene, 8); cyl(.18, .14, .3, fonteM, x, y0 + .15, z, scene, 8); cyl(.04, .2, .12, fonteM, x, y0 + 3.62, z, scene, 6);
    const v = lum(mat({ color: 0xf8f0d8, emissive: 0xffd890, emissiveIntensity: .08, roughness: .2, transparent: true, opacity: .9 }), .08, 2.2); add(new THREE.CylinderGeometry(.24, .15, .55, 6), v, x, y0 + 3.98, z); add(new THREE.ConeGeometry(.3, .25, 6), fonteM, x, y0 + 4.38, z); cyl(.03, .03, .2, fonteM, x, y0 + 4.58, z, scene, 4); OB.push([x, z, .25]); HALO.push([x, y0 + 3.98, z, 1.6]); flaque(x, z, 3.6, y0 + .03); };
  for (const [x, z] of [[-12.3, -8.3], [12.3, -8.3], [-12.3, 8.3], [12.3, 8.3], [0, -8.4], [-12.4, 0]]) lanterne(x, z, YS);
  for (const [x, z] of [[XO + 2.9, -8.5], [XO + 2.9, 7.5], [XE - .4, 0], [-8, ZS - .4], [6, ZN + 2.7]]) lanterne(x, z, 0);
  { const lp = []; if (!(MOBILE || GPU_MODESTE)) for (const [x, z] of [[-12.3, -8.3], [12.3, 8.3], [-12.4, 0], [XO + 2.9, 7.5], [XO + 2.9, -8.5], [6, ZN + 2.7]]) { const p = new THREE.PointLight(0xffc878, 0, 16, 1.6); p.position.set(x, 4.2, z); scene.add(p); lp.push(p); }
    NUIT.push([{ set emissiveIntensity(v) { for (const p of lp) p.intensity = v; } }, 0, 22]); }

  /* ---------- les peintres du carré : chevalets, toiles, pliants, parasols de toutes les couleurs ; les panneaux d'aquarelles et de caricatures ---------- */
  const tableauT = (k) => tT(128, 160, (c, w, h) => { const ciel = ["#9ac0e0", "#f0a860", "#5a6a9a", "#e8d8c0", "#7ab0d8"][k % 5]; const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, ciel); gr.addColorStop(1, "#f4e8d0"); c.fillStyle = gr; c.fillRect(0, 0, w, h);
    if (k % 3 === 0) { c.fillStyle = "#f6f2e8"; c.beginPath(); c.ellipse(64, 74, 22, 28, 0, Math.PI, 0); c.fill(); c.fillRect(42, 74, 44, 40); c.beginPath(); c.ellipse(34, 92, 10, 13, 0, Math.PI, 0); c.fill(); c.beginPath(); c.ellipse(94, 92, 10, 13, 0, Math.PI, 0); c.fill(); c.fillRect(62, 34, 4, 14); }   // le Sacré-Cœur
    else if (k % 3 === 1) { for (let i = 0; i < 5; i++) { c.fillStyle = ["#d8c8a8", "#c8b090", "#e8d8b8"][i % 3]; const x = i * 26, hh = 50 + al() * 50; c.fillRect(x, h - hh - 30, 26, hh); c.fillStyle = "#5a4a3a"; c.fillRect(x + 6, h - hh - 20, 5, 8); c.fillRect(x + 15, h - hh - 20, 5, 8); } c.fillStyle = "#a83030"; c.fillRect(0, h - 40, w, 8); }   // les maisons de Montmartre
    else { c.fillStyle = "#2a5a2a"; for (let i = 0; i < 12; i++) { c.beginPath(); c.arc(al() * w, 40 + al() * 80, 10 + al() * 12, 0, 7); c.fill(); } c.fillStyle = "#8a2a2a"; c.fillRect(20, 110, 90, 30); }   // un jardin, un moulin
    c.fillStyle = "#3a2a1a"; c.fillRect(0, h - 22, w, 22); for (let i = 0; i < 300; i++) { c.fillStyle = `rgba(${al() * 255 | 0},${al() * 200 | 0},${al() * 160 | 0},.12)`; c.fillRect(al() * w, al() * h, 3, 2); } c.strokeStyle = "#5a3a1a"; c.lineWidth = 6; c.strokeRect(0, 0, w, h); });
  const parasolC = [0xf4f2ec, 0xf4f2ec, 0xb8202a, 0xf4f2ec, 0x2a5aa8, 0xf4f2ec];
  const parasol = (x, z, k, y0 = YS, R = 1.3) => { cyl(.03, .03, 2.4, mat({ color: 0xd8d8d8, metalness: .5 }), x, y0 + 1.2, z, scene, 6); const c = add(new THREE.ConeGeometry(R, .55, 10, 1, true), mat({ color: parasolC[k % parasolC.length], side: THREE.DoubleSide, roughness: .9 }), x, y0 + 2.5, z); c.castShadow = true; };
  /* la toile : le tableau du côté du peintre ; de l'autre, le dos de lin tendu sur son châssis (le modèle ne voit rien) */
  const linM = mat({ map: tT(64, 80, (c, w, h) => { c.fillStyle = "#d8ccb0"; c.fillRect(0, 0, w, h); for (let i = 0; i < 300; i++) { c.fillStyle = `rgba(${i % 2 ? "120,100,70" : "255,250,235"},.12)`; c.fillRect((i * 37) % w, (i * 53) % h, 2, 1); } c.strokeStyle = "#8a6a42"; c.lineWidth = 6; c.strokeRect(3, 3, w - 6, h - 6); c.beginPath(); c.moveTo(w / 2, 3); c.lineTo(w / 2, h - 3); c.moveTo(3, h / 2); c.lineTo(w - 3, h / 2); c.lineWidth = 4; c.stroke(); }), roughness: .95 });
  const PORTM = [0, 1, 2].map(i => mat({ map: tT(100, 130, (c, w, h) => { caricature(c, 0, 0, w, h, 40 + i * 3); c.strokeStyle = "#4a3418"; c.lineWidth = 4; c.strokeRect(0, 0, w, h); }, 0, 0, 1, true), roughness: .85 }));
  const chevalet = (x, z, ry, k, y0 = YS, portr = null) => { const g = new THREE.Group(); g.position.set(x, y0, z); g.rotation.y = ry; scene.add(g); for (const sg of [-1, 1]) { const l = box(.035, 1.7, .035, boisC, sg * .28, .82, -.05, g); l.rotation.z = -sg * .1; } const ar = box(.035, 1.7, .035, boisC, 0, .8, .32, g); ar.rotation.x = -.35;   /* (10.92) le pied arrière derrière la toile, loin du peintre */
    box(.62, .04, .06, boisC, 0, .82, -.1, g); const t = box(.56, .7, .03, [linM, linM, linM, linM, portr ? linM : TABL[k % TABL.length], portr || TABL[k % TABL.length]], 0, 1.2, -.1, g); t.rotation.x = .08; return g; };
  let kP = 0; const nPeint = !GENS ? 0 : PETIT ? 3 : (MOBILE || GPU_MODESTE) ? 4 : 8, MODELES = [];
  const coin = (x, z, ry, k) => { chevalet(x, z, ry, k, YS, kP < nPeint && kP < 3 ? PORTM[kP] : null); { const ps = k % 2 ? -1 : 1; parasol(x + Math.cos(ry) * ps * .85 - Math.sin(ry) * 1.15, z - Math.sin(ry) * ps * .85 - Math.cos(ry) * 1.15, k); }   // (le mât à côté, derrière l'épaule du peintre : jamais devant son visage)
    { const sg = k % 2 ? 1 : -1, B = new THREE.Group(); B.position.set(x + Math.cos(ry) * 1.25 * sg, YS, z - Math.sin(ry) * 1.25 * sg); B.rotation.y = ry; scene.add(B);   // le bac à toiles : un casier de bois sur pieds ; les toiles debout dedans, un peu penchées, qu'on feuillette
      for (const [dx, dz] of [[-.36, -.2], [.36, -.2], [-.36, .2], [.36, .2]]) box(.04, .62, .04, boisC, dx, .31, dz, B);
      box(.78, .03, .44, boisC, 0, .3, 0, B); for (const dz of [-.21, .21]) box(.78, .3, .025, boisC, 0, .45, dz, B); for (const dx of [-.38, .38]) box(.025, .3, .44, boisC, dx, .45, 0, B);
      for (let i = 0; i < 4; i++) { const tb = box(.66, .5, .02, TABL[(k * 3 + i + 7) % TABL.length], 0, .55 + (i % 2) * .02, -.15 + i * .09, B); tb.rotation.x = -.18 - i * .05; } OB.push([B.position.x, B.position.z, .5]); }
    const pl = new THREE.Group(); pl.position.set(x - Math.sin(ry) * .75, YS, z - Math.cos(ry) * .75); pl.rotation.y = ry; scene.add(pl); box(.4, .04, .34, mat({ color: 0x3a3a3a }), 0, .44, 0, pl); for (const sg of [-1, 1]) { const p = box(.02, .5, .02, fonteM, sg * .16, .22, 0, pl); p.rotation.x = sg * .4; }
    if (kP < nPeint) { const m = gens(kP * 5 + 1, { haut: ["#e8e2d6", "#3a5a8a", "#e8e2d6", "#5a4636"][kP % 4], pantalon: true, robe: false, coif: "court" }); m.position.copy(pl.position); m.position.y = YS + .48 - m.userData.hipY; m.rotation.y = ry; m.userData.poser("assis", 0); scene.add(m);
      const P = m.userData.parts, beret = new THREE.Mesh(new THREE.CylinderGeometry(.13, .13, .045, 16), mat({ color: kP % 2 ? 0x1a1a24 : 0x8a1a1a, roughness: .9 })); beret.position.set(.02, .1, -.01); beret.rotation.z = .25; P.tete.add(beret);   // le béret
      const blouse = new THREE.Mesh(new THREE.CylinderGeometry(.16, .24, .5, 10, 1, true), mat({ color: kP % 2 ? 0x3a5a8a : 0xece6da, side: THREE.DoubleSide, roughness: .9 })); blouse.position.y = .12; P.buste.add(blouse);   // la blouse de peintre
      const pal = new THREE.Mesh(new THREE.CylinderGeometry(.12, .12, .015, 14), mat({ color: 0xb08a5a, roughness: .6 })); pal.position.set(0, -.3, .08); pal.rotation.x = Math.PI / 2; P.bras[0].c.add(pal);   // la palette
      for (let t = 0; t < 4; t++) { const d = new THREE.Mesh(new THREE.SphereGeometry(.018, 5, 4), mat({ color: [0xc83030, 0x3060c0, 0xe8c030, 0x30a050][t] })); d.position.set(Math.cos(t * 1.4) * .07, -.3 + Math.sin(t * 1.4) * .07, .095); P.bras[0].c.add(d); }
      const pin = new THREE.Mesh(new THREE.CylinderGeometry(.006, .006, .22, 5), mat({ color: 0x6a4020 })); pin.position.set(0, -.32, .05); pin.rotation.x = 1.2; P.bras[1].c.add(pin);   // le pinceau
      PEINT.push({ m, k: kP }); JOUR.push(m);
      if (kP < 3) { let mx = x + Math.sin(ry) * 1.7, mz = z + Math.cos(ry) * 1.7; for (const [d2, lt] of [[1.7, 0], [2.1, 0], [1.7, .7], [1.7, -.7], [2.2, .9], [2.2, -.9], [1.4, 1.1], [1.4, -1.1]]) { const cx = x + Math.sin(ry) * d2 + Math.cos(ry) * lt, cz = z + Math.cos(ry) * d2 - Math.sin(ry) * lt; if (LEDC.every(([tx, tz]) => (tx - cx) ** 2 + (tz - cz) ** 2 > 1.3)) { mx = cx; mz = cz; break; } }   /* (10.92) le modèle jamais dans un arbre */ const rM = Math.atan2(pl.position.x - mx, pl.position.z - mz);
        const f = kP !== 1, mo = gens(kP * 7 + 4, { robe: f, pantalon: !f, coif: f ? "long" : "court", haut: ["#c83a5a", "#2a4a3a", "#e8c040"][kP], parle: false });   // le modèle, assis sur un tabouret, qui pose
        chaise(mx, mz, rM).position.y = YS; mo.position.set(mx, YS + .5 - mo.userData.hipY, mz); mo.rotation.y = rM; mo.userData.poser("assis", 0); scene.add(mo); MODELES.push({ m: mo, k: kP }); JOUR.push(mo); OB.push([mx, mz, .45]); }
      kP++; }
    OB.push([x, z, .55], [pl.position.x, pl.position.z, .45]); };
  for (const [x, z, ry, k] of [[-11, -7.4, Math.PI * .25, 0], [-7.2, -7.8, 0, 1], [-1.6, -7.6, -.2, 2], [2.4, -7.9, .3, 3], [-6, -2.6, Math.PI, 7], [0.6, -2.4, Math.PI * .8, 8], [-5.6, 3.2, .4, 9], [-1, 7.4, Math.PI, 10], [-8.6, 7.4, Math.PI, 11], [-11.8, 7.0, Math.PI / 2, 5], [11.6, -1.2, -Math.PI / 2, 12], [5.5, -1.5, -.4, 6]]) coin(x, z, ry, k);
  const PORTR = [0, 1, 2, 3].map(q => tT(512, 384, (c, w, h) => { c.fillStyle = "#3a2a1a"; c.fillRect(0, 0, w, h); for (let i = 0; i < 4; i++) { const x = 14 + (i % 2) * 250, y = 10 + (i / 2 | 0) * 188; c.fillStyle = "#f4ead8"; c.fillRect(x, y, 234, 178); caricature(c, x + 52, y + 6, 130, 166, q * 4 + i); } })); let kPortr = 0;
  for (const [x, z, ry] of [[12.4, 1.5, -Math.PI / 2], [-12.4, -5.2, Math.PI / 2], [-3.4, -8.4, 0], [2.4, 2.4, Math.PI * .75]]) { const g = new THREE.Group(); g.position.set(x, YS, z); g.rotation.y = ry; scene.add(g); box(1.4, 1.05, .04, mat({ map: PORTR[kPortr++ % 4] }), 0, 1.15, 0, g); for (const sg of [-1, 1]) box(.04, 1.7, .04, boisC, sg * .66, .85, -.05, g); OB.push([x, z, .7]); }
  /* les terrasses couvertes du carré (d'après les photos) : celle de La Mère Catherine (toile blanche, lambrequin rouge « Restaurant La Mère Catherine »),
     celle de Chez Eugène (toile rouge « Café Chez Eugène », les fanions), et la grande terrasse noire, sa rambarde de fer, ses lampes suspendues et ses fleurs */
  const tente = (x0, x1, z0, z1, o) => { const y = YS, H = 2.75, toitM = mat({ color: o.toit, roughness: .85, side: THREE.DoubleSide }), poM = mat({ color: o.poteau, roughness: .5, metalness: .3 });
    for (const x of [x0, x1]) for (let z = z0; z <= z1 + .01; z += (z1 - z0) / Math.max(1, Math.round((z1 - z0) / 3))) cyl(.05, .05, H, poM, x, y + H / 2, z, scene, 6);
    for (const z of [z0, z1]) for (let x = x0; x <= x1 + .01; x += (x1 - x0) / Math.max(1, Math.round((x1 - x0) / 3))) cyl(.05, .05, H, poM, x, y + H / 2, z, scene, 6);
    const tw = x1 - x0 + .4, td = z1 - z0 + .4, tc = add(new THREE.ConeGeometry(Math.hypot(tw, td) / 2, .7, 4, 1, true), toitM, (x0 + x1) / 2, y + H + .35, (z0 + z1) / 2); tc.rotation.y = Math.PI / 4; tc.scale.set(tw / Math.hypot(tw, td) * Math.SQRT2, 1, td / Math.hypot(tw, td) * Math.SQRT2);
    const [txt, fond, coul] = o.lamb, lT = tT(1024, 96, (c, w, h) => { c.fillStyle = fond; c.fillRect(0, 0, w, h); c.fillStyle = coul; c.textAlign = "center"; c.textBaseline = "middle"; fit(c, txt, w * .9, 60, `italic bold @ ${serif}`); c.fillText(txt, w / 2, h / 2 + 3);
      c.fillStyle = "rgba(0,0,0,.2)"; for (let x = 0; x < w; x += 48) { c.beginPath(); c.moveTo(x, h); c.quadraticCurveTo(x + 24, h - 14, x + 48, h); c.fill(); } }), lM = lumT(lT, .03, .5);
    for (const [w, d, x, z] of [[tw, .04, (x0 + x1) / 2, z0 - .2], [tw, .04, (x0 + x1) / 2, z1 + .2], [.04, td, x0 - .2, (z0 + z1) / 2], [.04, td, x1 + .2, (z0 + z1) / 2]]) box(w, .5, d, lM, x, y + H - .05, z);
    // les tables, les clients
    for (let x = x0 + .9; x < x1 - .5; x += 1.6) for (let z = z0 + .8; z < z1 - .4; z += 1.5) { table(x, z, o.nappe); chaise(x - .45, z, Math.PI / 2); chaise(x + .45, z, -Math.PI / 2);
      for (const sx of [-.45, .45]) CHS.push([x + sx, YS + .5, z, sx < 0 ? Math.PI / 2 : -Math.PI / 2]); }
    if (o.rampe) { const fer = mat({ color: 0x141414, metalness: .6, roughness: .5 }); for (const [ax, az, bx, bz] of [[x0, z0, x1, z0], [x0, z1, x1, z1], [x1, z0, x1, z1]]) { const l = Math.hypot(bx - ax, bz - az), ang = Math.atan2(bz - az, bx - ax), r = box(l, .05, .05, fer, (ax + bx) / 2, y + 1.05, (az + bz) / 2); r.rotation.y = -ang;
        for (let t = 0; t < l; t += .14) box(.02, 1, .02, fer, ax + (bx - ax) * t / l, y + .5, az + (bz - az) * t / l); } }
    if (o.lampes) { const lp = lum(mat({ color: 0xffd8a0, emissive: 0xffb860, emissiveIntensity: .1 }), .1, 2.6); for (let x = x0 + .8; x < x1; x += 1.6) for (let z = z0 + .7; z < z1; z += 1.5) { cyl(.006, .006, .5, fonteM, x, y + H - .25, z, scene, 3); add(new THREE.SphereGeometry(.12, 10, 8), lp, x, y + H - .55, z); } }
    if (o.fleurs) { const fl = [mat({ color: 0xe8306a }), mat({ color: 0xf0a0c0 }), mat({ color: 0xf8e8f0 }), mat({ color: 0xe86a2a })]; for (let k = 0; k < 26; k++) add(new THREE.IcosahedronGeometry(.16 + al() * .12, 0), fl[k % 4], x0 + (al() - .5) * .5, y + 1.4 + al() * 1.3, o.fleurs + (al() - .5) * .8); }
    if (o.fanions) { const fM = [0xc8202a, 0x2a4aa8, 0xf2f2f2].map(c2 => mat({ color: c2, side: THREE.DoubleSide })), tri = new THREE.Shape(); tri.moveTo(-.12, 0); tri.lineTo(.12, 0); tri.lineTo(0, -.3); tri.closePath(); const tg = new THREE.ShapeGeometry(tri);
      for (let i = 0, x = x0; x < x1; x += .32, i++) add(tg, fM[i % 3], x, y + H + .05 - Math.sin((x - x0) / (x1 - x0) * Math.PI) * .25, z1 + .25); }
    OB.push(...[[x0 + .1, z0 + .1, .2], [x1 - .1, z0 + .1, .2], [x0 + .1, z1 - .1, .2], [x1 - .1, z1 - .1, .2]]); };
  tente(5, 12.6, -8.6, -4, { toit: 0xf4f2ec, poteau: 0xf4f2ec, lamb: ["Restaurant  La Mère Catherine", "#a8141c", "#f6efe0"], nappe: false });
  tente(-12.6, -8.4, -2.2, 4.4, { toit: 0xa8141c, poteau: 0x8a1018, lamb: ["Café  Chez Eugène", "#a8141c", "#f6efe0"], nappe: true, fanions: true });
  tente(3.6, 12.6, 3.6, 8.6, { toit: 0x1a1a1c, poteau: 0x1a1a1c, lamb: ["", "#1a1a1c", "#1a1a1c"], nappe: false, rampe: true, lampes: true, fleurs: 6.1 });

  /* ---------- le Sacré-Cœur, au-dessus des toits : le grand dôme ovoïde sur son tambour à colonnes, sa lanterne, les quatre petits dômes,
     le porche aux trois arcs, et le campanile ; la pierre blanche de Château-Landon, qui reste blanche ---------- */
  { const g = new THREE.Group(); g.position.set(215, 4, 20); g.rotation.y = -Math.PI / 2; g.scale.setScalar(1.3); scene.add(g);
    const blanc = lum(mat({ color: 0xf6f3ea, roughness: .75, emissive: 0xffe4b8, emissiveIntensity: 0, fog: false }), 0, .62), ombre = mat({ color: 0xd8d2c4, roughness: .8, fog: false }), noirA = mat({ color: 0x2a2a30, fog: false });   /* (net, malgré la brume du lointain) */
    const dome = (r, h, y, x = 0, z = 0) => { const pts = []; for (let i = 0; i <= 16; i++) { const t = i / 16, a = t * Math.PI / 2; pts.push(new THREE.Vector2(Math.cos(a) * r * (1 - .12 * t * t), Math.sin(a) * h)); } return add(new THREE.LatheGeometry(pts, 28), blanc, x, y, z, g); };
    const tambour = (r, h, y, x = 0, z = 0, n = 16) => { cyl(r * .92, r * .92, h, ombre, x, y + h / 2, z, g, 24); for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; cyl(r * .06, r * .06, h * .86, blanc, x + Math.cos(a) * r, y + h / 2, z + Math.sin(a) * r, g, 6); } cyl(r * 1.04, r * 1.04, h * .1, blanc, x, y + h - h * .05, z, g, 24); cyl(r * 1.04, r * 1.04, h * .08, blanc, x, y + h * .04, z, g, 24);
      for (let i = 0; i < n; i += 2) { const a = (i + .5) / n * Math.PI * 2; const f = box(r * .16, h * .5, .1, noirA, x + Math.cos(a) * r * .93, y + h * .5, z + Math.sin(a) * r * .93, g); f.rotation.y = -a + Math.PI / 2; } };
    // la nef, le transept, le chevet
    box(30, 22, 40, blanc, 0, 11, -6, g); box(44, 18, 18, blanc, 0, 9, -8, g); box(26, 26, 22, blanc, 0, 13, -6, g); cyl(13, 13, 20, blanc, 0, 10, -26, g, 20);
    // la base du grand dôme, son tambour, le dôme ovoïde, la lanterne, la croix
    box(22, 6, 22, blanc, 0, 29, -6, g); tambour(9, 13, 32, 0, -6, 20); dome(9.4, 17, 45, 0, -6); tambour(2.6, 5, 61.5, 0, -6, 10); dome(2.8, 3.6, 66.5, 0, -6); cyl(.25, .4, 5, blanc, 0, 72, -6, g, 8); box(.3, 1.8, .3, blanc, 0, 75.5, -6, g); box(1.2, .3, .3, blanc, 0, 75.9, -6, g);
    // les quatre petits dômes autour
    for (const [x, z] of [[-11, 3], [11, 3], [-11, -15], [11, -15]]) { box(7, 4, 7, blanc, x, 28, z, g); tambour(3, 6, 30, x, z, 10); dome(3.2, 5.6, 36, x, z); cyl(.5, .7, 2, blanc, x, 42.2, z, g, 8); add(new THREE.SphereGeometry(.6, 10, 8), blanc, x, 43.6, z, g); }
    // le porche : trois arcs, deux petits dômes, les deux statues équestres
    box(24, 15, 6, blanc, 0, 7.5, 16, g); for (const x of [-7, 0, 7]) { box(4.4, 8, .4, noirA, x, 4.5, 19.05, g); add(new THREE.CylinderGeometry(2.2, 2.2, .4, 16, 1, false, 0, Math.PI), noirA, x, 8.5, 19.05, g).rotation.set(Math.PI / 2, 0, 0); }
    box(25, 1.2, 6.6, blanc, 0, 15.6, 16, g); for (const x of [-9, 9]) { tambour(2.2, 4, 16.2, x, 16, 8); dome(2.4, 4.2, 20.2, x, 16); }
    for (const x of [-10.5, 10.5]) { box(2.6, 4, 2.6, blanc, x, 2, 21.5, g); box(1.2, 1.6, 2.2, mat({ color: 0x5a7a6a, metalness: .5, roughness: .4 }), x, 4.8, 21.5, g); }
    // le parvis, la colline et ses pelouses
    // le campanile, derrière
    box(11, 50, 11, blanc, 0, 25, -40, g); for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) for (let e = 0; e < 3; e++) box(dx ? .2 : 2.2, 6, dz ? .2 : 2.2, noirA, dx * 5.6, 34 + e * 5, -40 + dz * 5.6, g);
    tambour(4.8, 10, 50, 0, -40, 12); dome(5, 9, 60, 0, -40); cyl(.4, .6, 6, blanc, 0, 71, -40, g, 8); box(.3, 2.4, .3, blanc, 0, 75, -40, g); box(1.4, .3, .3, blanc, 0, 75.5, -40, g);
    /* (10.86) les détails, d'après les photos : les côtes des dômes, la galerie à balustres au pied du grand dôme, les fenêtres en plein cintre de la nef, les clochetons,
       la grande baie au-dessus du porche, la terrasse aux arcades et sa balustrade, les arbres de la butte */
    const cotes = (r, h, y, x, z, n, e) => { for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, P = []; for (let j = 0; j <= 10; j++) { const t = j / 10, b = t * Math.PI / 2, rr = Math.cos(b) * r * (1 - .12 * t * t) + e * .5; P.push(new THREE.Vector3(x + Math.cos(a) * rr, y + Math.sin(b) * h + e * .3, z + Math.sin(a) * rr)); } add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(P), 12, e, 4), blanc, 0, 0, 0, g); } };
    cotes(9.4, 17, 45, 0, -6, 16, .24); cotes(5, 9, 60, 0, -40, 10, .14); for (const [x, z] of [[-11, 3], [11, 3], [-11, -15], [11, -15]]) cotes(3.2, 5.6, 36, x, z, 8, .1);
    { const tb = add(new THREE.TorusGeometry(10.1, .16, 4, 48), blanc, 0, 45.9, -6, g); tb.rotation.x = Math.PI / 2; for (let i = 0; i < 48; i++) { const a = i / 48 * Math.PI * 2; cyl(.08, .08, .8, blanc, Math.cos(a) * 10.1, 45.45, -6 + Math.sin(a) * 10.1, g, 4); } }
    for (const sx of [-15.05, 15.05]) for (let z = -22; z <= 10; z += 4) { box(.3, 5, 1.8, noirA, sx, 11.5, z, g); const ar = cyl(.9, .9, .3, noirA, sx, 14, z, g, 10); ar.rotation.z = Math.PI / 2; box(.5, .3, 2.3, blanc, sx, 8.8, z, g); }
    box(4, 4, .3, noirA, 0, 18, 14.05, g); { const ar = cyl(2, 2, .3, noirA, 0, 20, 14.05, g, 14); ar.rotation.x = Math.PI / 2; } box(5, .4, .6, blanc, 0, 15.9, 14.2, g);
    for (const [x, z] of [[-13, 5], [13, 5], [-13, -17], [13, -17], [-12, 19], [12, 19]]) { cyl(.5, .5, 2, blanc, x, z > 15 ? 16.2 : 27, z, g, 8); add(new THREE.ConeGeometry(.6, 2.6, 8), blanc, x, z > 15 ? 18.5 : 29.3, z, g); }
    box(46, 6, 6, blanc, 0, -3, 25, g); for (let x = -19.8; x <= 20; x += 4.4) { box(2.6, 3.2, .3, noirA, x, -4, 28.05, g); const ar = cyl(1.3, 1.3, .3, noirA, x, -2.4, 28.05, g, 10); ar.rotation.x = Math.PI / 2; }
    box(46, .18, .4, blanc, 0, .9, 27.8, g); for (let x = -22.6; x <= 23; x += .9) cyl(.09, .09, .9, blanc, x, .45, 27.8, g, 4);
    for (const [x, z, r] of [[-26, 22, 3], [-29, 10, 3.6], [27, 21, 3.2], [29, 8, 3.8], [-25, -8, 3.4], [26, -10, 3.2]]) add(new THREE.IcosahedronGeometry(r, 1), mat({ color: [0x3a6a2a, 0x4a7a32, 0x6a7a2a][(x * 7 & 3) % 3], roughness: .9, fog: false }), x, r * .6 - 1, z, g);
    // le soir, le Sacré-Cœur est éclairé : sa pierre blanche brille sur le ciel noir
    if (!(MOBILE || GPU_MODESTE)) { const sp = new THREE.SpotLight(0xfff0d8, 0, 220, .5, .5, 1); sp.position.set(0, 10, 120); sp.target.position.set(0, 40, -6); g.add(sp); g.add(sp.target); NUIT.push([{ set emissiveIntensity(v) { sp.intensity = v; } }, 0, 1800]); }
    g.updateMatrixWorld(true); for (const o of [...g.children]) if (o.isMesh) scene.attach(o); }   // (les pierres fondues avec le reste)

  /* ---------- les promeneurs : les touristes qui font le tour du carré, regardent les peintres, remontent la rue Saint-Éleuthère ---------- */
  const ROUTES = [[[-78, -12.9], [-23, -12.9]], [[-83, -40], [-83, 34]], [[-78, 29], [54, 29]], [[1, 12], [1, 29], [-40, 29]], [[-23, -12], [-60, -12], [-82, -13], [-82, 28], [-20, 28.5]], [[-70, 30.5], [40, 30.5]],[[-16, -12], [16, -12], [16, 12], [-16, 12], [-16, -12]], [[-17, 12.5], [-17, -12.5], [15, -12.5], [15, 12.5], [-17, 12.5]], [[16, 12], [42, 12]], [[1, ZS - .5], [1, 11], [-15, 11], [-15, -11.5]], [[-12.6, -8.6], [12.6, -8.6], [12.6, 2], [-12.6, 2]]];
  /* le joueur d'accordéon, dans un coin de la place : la casquette, le gilet, l'accordéon dont le soufflet s'ouvre et se ferme ; son étui ouvert par terre, quelques pièces */
  const ACCORD = [], BANCS = [];
  if (GENS) { const ax = -14.6, az = 13, m = personne3D({ taille: 1.74, peau: "#d8a888", ch: "#8a8a8a", haut: "#3a3028", bas: "#2a2a30", chaussures: "#2a1a14", coif: "court", pantalon: true }); m.position.set(ax, 0, az); m.rotation.y = Math.PI * .85; m.userData.poser("debout", 0); scene.add(m);
    const P = m.userData.parts, cas = new THREE.Mesh(new THREE.CylinderGeometry(.12, .12, .06, 14), mat({ color: 0x2a2a30 })); cas.position.set(0, .1, 0); P.tete.add(cas); const vis = new THREE.Mesh(new THREE.BoxGeometry(.24, .02, .1), mat({ color: 0x2a2a30 })); vis.position.set(0, .07, .12); P.tete.add(vis);   // la casquette
    const ac = new THREE.Group(); ac.position.set(0, .2, .2); P.buste.add(ac); const rouge = mat({ color: 0xa8141c, roughness: .35, metalness: .2 }), nacre = mat({ color: 0xf2efe6, roughness: .3 }), noirA = mat({ color: 0x141414 });
    const gD = box(.08, .32, .2, rouge, -.18, 0, 0, ac), gG = box(.08, .32, .2, rouge, .18, 0, 0, ac); for (let t = 0; t < 7; t++) box(.012, .3, .02, nacre, -.21, -.12 + t * .04, .1, ac);   // les deux caisses, le clavier
    const souf = []; for (let i = 0; i < 6; i++) souf.push(box(.045, .3, .19, i % 2 ? noirA : mat({ color: 0xe8e2d6 }), -.12 + i * .048, 0, 0, ac));   // le soufflet
    P.bras[0].e.rotation.set(-1.1, 0, -.5); P.bras[1].e.rotation.set(-1.1, 0, .5);
    const etui = box(.7, .1, .35, mat({ color: 0x3a2a1e }), ax - .9, .05, az + .6); etui.rotation.y = .3; JOUR.push(m, etui); for (let i = 0; i < 5; i++) JOUR.push(add(new THREE.CylinderGeometry(.02, .02, .005, 8), mat({ color: 0xd8b860, metalness: .8, roughness: .3 }), ax - 1.1 + i * .1, .11, az + .55 + (i % 2) * .05));
    OB.push([ax, az, .5], [ax - .9, az + .6, .45]);
    ACCORD.push((tm) => { m.userData.poser("debout", tm); const o = Math.sin(tm / 330); for (let i = 0; i < 6; i++) souf[i].position.x = (-.12 + i * .048) * (1 + o * .3); gD.position.x = -.18 - o * .05; gG.position.x = .18 + o * .05; P.bras[0].e.rotation.set(-1.1, 0, -.5 - o * .12); P.bras[1].e.rotation.set(-1.1, 0, .5 + o * .12); P.tete.rotation.y = Math.sin(tm / 1500) * .3; P.bassin.rotation.y = Math.sin(tm / 700) * .08; }); }
  /* les bancs de Paris : lattes de bois vert, pieds de fonte ; quelques promeneurs s'y reposent */
  { const vertB = mat({ color: 0x2e5a3a, roughness: .55 }), fonteB = mat({ color: 0x1a1c1a, metalness: .5, roughness: .5 });
    for (const [bx, bz, ry, assis] of [[-5.5, -9.7, 0, 1], [3.2, -9.7, 0, 0], [-6.5, 9.7, Math.PI, 1], [13.7, -3, -Math.PI / 2, 0], [-13.7, -6.6, Math.PI / 2, 1]]) { const g = new THREE.Group(); g.position.set(bx, 0, bz); g.rotation.y = ry; scene.add(g);
      for (let l = 0; l < 3; l++) box(1.8, .04, .1, vertB, 0, .45, -.12 + l * .13, g); for (let l = 0; l < 2; l++) { const d = box(1.8, .1, .03, vertB, 0, .66 + l * .14, -.24, g); d.rotation.x = -.15; }
      for (const sx of [-.75, .75]) { box(.06, .45, .5, fonteB, sx, .23, -.05, g); box(.05, .5, .05, fonteB, sx, .72, -.23, g); box(.06, .05, .4, fonteB, sx, .62, .02, g); }
      OB.push([bx, bz, .9]);
      if (GENS && assis && BANCS.length < ((MOBILE || GPU_MODESTE) ? 2 : 4)) { const k = BANCS.length, mb = gens(k * 11 + 6); mb.position.set(bx + Math.cos(ry) * (k % 2 ? .4 : -.4), .49 - mb.userData.hipY, bz - Math.sin(ry) * (k % 2 ? .4 : -.4)); mb.rotation.y = ry; mb.userData.poser("assis", 0); scene.add(mb); BANCS.push({ m: mb, k }); } } }
  for (let k = 0, n = !GENS ? 0 : PETIT ? 6 : (MOBILE || GPU_MODESTE) ? 10 : 30; k < n; k++) { const R = ROUTES[k % ROUTES.length], m = gens(k * 3 + 2), i0 = k % (R.length - 1), u = al(), a = R[i0], b = R[i0 + 1];
    m.position.set(a[0] + (b[0] - a[0]) * u, 0, a[1] + (b[1] - a[1]) * u); m.userData.poser("marche", 0); scene.add(m); MARCH.push({ m, R, i: i0 + 1, sens: 1, v: .8 + (k % 5) * .12 }); }
  /* les garçons de café : le gilet noir, le nœud papillon, le long tablier blanc, le plateau d'argent sur la main ; ils vont de table en table, s'arrêtent servir, repartent */
  const hPl = (x, z) => (x > SQ.x0 && x < SQ.x1 && z > SQ.z0 && z < SQ.z1) ? YS : hTrot(x, z);
  { const tabM = mat({ color: 0xffffff, roughness: .8 }), giletM = mat({ color: 0x141414, roughness: .7, side: THREE.DoubleSide }), argM = mat({ color: 0xd0d0d0, metalness: .8, roughness: .25 }), verreS = mat({ color: 0xe8b040, roughness: .2, transparent: true, opacity: .85 }), tasseM = mat({ color: 0xf6f4ee, roughness: .3 });
    const nS = !GENS || !TABLES.length ? 0 : PETIT ? 2 : (MOBILE || GPU_MODESTE) ? 4 : 7;
    for (let k = 0; k < nS; k++) { const m = personne3D({ taille: 1.78, peau: PE[(k * 5) % 6], ch: "#141010", haut: "#f2f0ea", bas: "#141414", chaussures: "#0a0a0a", coif: k % 3 ? "court" : "chauve", pantalon: true }), P = m.userData.parts;
      box(.4, .66, .02, tabM, 0, -.16, .11, P.bassin);   // le tablier
      const gi = new THREE.Mesh(new THREE.CylinderGeometry(.165, .19, .34, 10, 1, true), giletM); gi.position.y = .12; P.buste.add(gi); const np = new THREE.Mesh(new THREE.BoxGeometry(.09, .035, .02), giletM); np.position.set(0, .3, .13); P.buste.add(np);
      const pl = new THREE.Group(); pl.position.set(.04, -.34, .1); P.bras[1].c.add(pl); add(new THREE.CylinderGeometry(.18, .18, .015, 14), argM, 0, 0, 0, pl);
      add(new THREE.CylinderGeometry(.035, .028, .14, 8), verreS, -.07, .08, .02, pl); add(new THREE.CylinderGeometry(.035, .028, .14, 8), verreS, .06, .08, -.05, pl); add(new THREE.CylinderGeometry(.04, .032, .06, 8), tasseM, .02, .04, .09, pl);
      const t = TABLES[(k * 11 + 3) % TABLES.length]; m.position.set(t[0] + .8, hPl(t[0] + .8, t[1]), t[1]); m.userData.poser("debout", 0); scene.add(m);
      SERV.push({ m, P, but: null, tab: t, pause: al() * 3, v: .85 + al() * .25, k }); } }
  /* (10.88) les terrasses pleines, partout : on tire des chaises dans toute la liste (pas seulement les premières terrasses) ; et dans chaque café, le barman, les clients */
  for (const { a, g, W } of ARD) { g.updateMatrixWorld(true); let best = null; for (const z of [1.0, .45]) for (const dx of [0, .6, -.6, 1.2, -1.2, 1.8, -1.8, 2.4, -2.4, 3, -3]) { const x = a.position.x + dx; if (Math.abs(x) > W / 2 - .35) continue; const p = g.localToWorld(a.position.clone().set(x, 0, z));
      if (TABLES.every(([tx, tz]) => (tx - p.x) ** 2 + (tz - p.z) ** 2 > .8) && CHS.every(([cx, , cz]) => (cx - p.x) ** 2 + (cz - p.z) ** 2 > .3)) { best = [x, z]; break; } if (best) break; }
    if (best) a.position.set(best[0], 0, best[1]); else a.position.z = .3; }   // (le chevalet du menu : jamais au milieu d'une table)
  for (const [x, z] of POTS) { if (TABLES.some(([tx, tz]) => (tx - x) ** 2 + (tz - z) ** 2 < 1.1) || ATT.some(p => (p.x - x) ** 2 + (p.z - z) ** 2 < 1.4) || CHS.some(([cx, , cz]) => (cx - x) ** 2 + (cz - z) ** 2 < .4)) continue; cyl(.07, .08, .85, potM, x, .45, z, scene, 7); add(new THREE.SphereGeometry(.08, 7, 5), potM, x, .88, z); }
  /* (10.93) le street art de Montmartre (d'après les photos) sur les murs de côté laissés nus au coin des rues : l'homme en costume au pochoir qui tend un os à son chien,
     la cathédrale au pochoir, les portraits collés, la petite fille en robe rouge, le chimpanzé, les tags, les affichettes */
  { const mur = (c, w, h) => { c.fillStyle = "#cdbb98"; c.fillRect(0, 0, w, h); for (let i = 0; i < 60; i++) { c.fillStyle = `rgba(${i % 2 ? "90,70,40" : "255,250,230"},${.04 + (i % 5) * .02})`; c.beginPath(); c.ellipse((i * 97) % w, (i * 53) % h, 20 + (i % 7) * 12, 10 + (i % 4) * 9, 0, 0, 7); c.fill(); } c.fillStyle = "rgba(60,50,40,.35)"; c.fillRect(0, h - 26, w, 26); };
    const tag = (c, x, y, col, s2) => { c.strokeStyle = col; c.lineWidth = 4; c.lineCap = "round"; c.beginPath(); for (let i = 0; i < 9; i++) { const a = i * 1.3; c.lineTo(x + Math.cos(a) * s2 * (1 + (i % 3) * .3) + i * 6, y + Math.sin(a * 1.7) * s2 * .6); } c.stroke(); };
    void mur; void tag; const ARTS = [["images/streetart/art1.png", 498 / 900], ["images/streetart/art2.png", 363 / 715], ["images/streetart/art3.png", 385 / 900], ["images/streetart/art4.png", 630 / 612]];   /* (découpés autour du dessin : le mur de la rue autour) */   /* (10.94) les photos envoyées, telles quelles : le petit chaperon rouge aux jumelles (rue d'Orchampt), le boxeur, la dame de Fred le Chevalier, le chat jaune */
    const artM = ARTS.map(([u]) => { const t = new THREE.TextureLoader().load(u); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return mat({ map: t, roughness: .9, transparent: true, alphaTest: .5 }); }); let kA = 0;
    for (const H of MAISONS) { if (!H.g.userData.salle) continue; H.g.updateMatrixWorld(true);
      for (const sx of [-1, 1]) { const p2 = H.g.localToWorld(new THREE.Vector3(sx * (H.W / 2 + .5), 0, -2.5)); const couvert = MAISONS.some(O => { if (O === H) return false; O.g.updateMatrixWorld(true); const q = O.g.worldToLocal(p2.clone()); return Math.abs(q.x) < O.W / 2 + .2 && q.z < .2 && q.z > -O.D - .2; });
        if (couvert) continue; const q = kA++ % ARTS.length, ar = ARTS[q][1], hA = Math.min(2.4, 3.2 / ar), wA = hA * ar, a = add(new THREE.PlaneGeometry(wA, hA), artM[q], sx * (H.W / 2 + .012), .05 + hA / 2, -2.8, H.g); a.rotation.y = sx * Math.PI / 2; (L.artPos = L.artPos || []).push([H.g.localToWorld(new THREE.Vector3(sx * (H.W / 2), 0, -2.8)), H.g.localToWorld(new THREE.Vector3(sx * (H.W / 2 + 5), 0, -2.8))]); } } }
  /* (10.93) la Vespa rouge : un garçon sans casque, la chemise ouverte, qui se promène tranquillement dans les rues de Montmartre */
  const VESPA = GENS ? (() => { const g = new THREE.Group(); g.userData.anime = true; scene.add(g); const rouge = mat({ color: 0xc8141c, roughness: .3, metalness: .3 }), noirV = mat({ color: 0x141414, roughness: .6 }), chromeV = mat({ color: 0xd8dce0, metalness: .9, roughness: .2 }), pneu = mat({ color: 0x1a1a1a, roughness: .9 });
    const caisse = add(new THREE.SphereGeometry(.32, 14, 10), rouge, 0, .42, -.32, g); caisse.scale.set(.75, .75, 1.25); box(.4, .07, .9, rouge, 0, .22, .05, g); const tab = box(.38, .82, .06, rouge, 0, .62, .44, g); tab.rotation.x = -.18; const tab2 = box(.28, .2, .05, rouge, 0, 1.0, .52, g); tab2.rotation.x = -.18;   // la caisse bombée, le plancher, le tablier
    box(.3, .1, .5, noirV, 0, .76, -.3, g); const gui = box(.56, .045, .05, chromeV, 0, 1.08, .55, g); void gui; for (const sx of [-1, 1]) box(.08, .05, .06, noirV, sx * .3, 1.08, .55, g); box(.14, .1, .1, rouge, 0, 1.1, .58, g); add(new THREE.SphereGeometry(.065, 10, 8), chromeV, 0, 1.1, .64, g); add(new THREE.CircleGeometry(.05, 10), mat({ color: 0xfff6d0, emissive: 0xfff0b0, emissiveIntensity: 1 }), 0, 1.1, .705, g);   // le guidon et son phare rond, le tablier qui monte jusqu'à lui   // la selle, la colonne, le guidon, le phare
    const gardeB = add(new THREE.SphereGeometry(.2, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), rouge, 0, .26, .55, g); gardeB.scale.set(.7, .6, 1); const roues = []; for (const z of [.55, -.45]) { const r = add(new THREE.TorusGeometry(.17, .06, 6, 16), pneu, 0, .2, z, g); r.rotation.y = Math.PI / 2; roues.push(r); add(new THREE.CylinderGeometry(.1, .1, .1, 10), chromeV, 0, .2, z, g).rotation.z = Math.PI / 2; }
    const m = personne3D({ taille: 1.76, peau: "#d8a888", ch: "#2a1a12", haut: "#f2efe6", bas: "#2a3a5a", chaussures: "#5a3a22", coif: "court", pantalon: true }); m.userData.poser("assis", 0); m.position.set(0, .8 - m.userData.hipY, -.28); g.add(m);
    const P = m.userData.parts; for (const b2 of P.bras) { b2.e.rotation.set(-1.25, 0, 0); b2.c.rotation.x = -.25; }
    const R2 = [[-23, -12.6], [-60, -12.6], [-82.6, -13.2], [-82.6, 20], [-82, 28.6], [-40, 28.9], [-5, 29], [20, 29], [40, 29.2]]; g.position.set(R2[0][0], .02, R2[0][1]);
    L.vespa = g; return { g, m, P, roues, R: R2, i: 1, sens: 1, v: 3.2 }; })() : null;
  const animVespa = (tm, dt) => { const V = VESPA; if (!V) return; const g = V.g, [tx, tz] = V.R[V.i], dx = tx - g.position.x, dz = tz - g.position.z, d = Math.hypot(dx, dz);
    if (d < .4) { if (V.i + V.sens < 0 || V.i + V.sens >= V.R.length) V.sens = -V.sens; V.i += V.sens; return; } const v = Math.min(d, V.v * dt); g.position.x += dx / d * v; g.position.z += dz / d * v; g.position.y = L.hauteur(g.position.x, g.position.z) + .02;
    const ry = Math.atan2(dx, dz), dr = Math.atan2(Math.sin(ry - g.rotation.y), Math.cos(ry - g.rotation.y)); g.rotation.y += dr * Math.min(1, dt * 3); g.rotation.z = -dr * .25; for (const r of V.roues) r.rotation.x += v / .23; V.P.tete.rotation.y = Math.sin(tm / 2600) * .35; V.m.userData.poser("assis", 0); for (const b2 of V.P.bras) { b2.e.rotation.set(-1.25, 0, 0); b2.c.rotation.x = -.25; } };
  const BARM = []; if (GENS) { const ordre = CHS.map((c2, i) => [((i * 7919) % 104729) / 104729, c2]).sort((a, b) => a[0] - b[0]);
    for (const [, [x, y, z, ry]] of ordre.slice(0, Math.min(nTerr, Math.round(CHS.length * .6)))) { const m = gens(kT + 3); m.position.set(x, y - m.userData.hipY, z); m.rotation.y = ry; m.userData.poser("assis", 0); scene.add(m); TERR.push(m); kT++; }
    const nA = PETIT ? 0 : (MOBILE || GPU_MODESTE) ? 1 : 3;
    for (const [i, S2] of SALLES.entries()) { if (PETIT && i % 2) continue; const [pb, rb] = S2.bar, b = personne3D({ taille: 1.78, peau: PE[(i * 5 + 1) % 6], ch: "#141010", haut: "#f2f0ea", bas: "#141414", chaussures: "#0a0a0a", coif: i % 3 ? "court" : "chauve", pantalon: true });
      box(.38, .62, .02, mat({ color: 0xffffff, roughness: .8 }), 0, -.14, .11, b.userData.parts.bassin); b.position.copy(pb); b.rotation.y = rb; b.userData.poser("debout", 0); scene.add(b); BARM.push({ m: b, k: i });
      for (const [j, [pa, ya, ra]] of S2.assis.entries()) { if (j >= nA || (j + i) % 4 === 3) continue; const m = gens(i * 7 + j * 3 + 5); m.position.set(pa.x, ya - m.userData.hipY, pa.z); m.rotation.y = ra; m.userData.poser("assis", 0); scene.add(m); TERR.push(m); } } }

  /* ---------- les limites : les rues pavées, le carré, la rue Saint-Éleuthère, le haut des marches de la rue du Calvaire ; ni les arbres ni les chevalets ---------- */
  /* (les obstacles rangés par cases de 2 m : on ne teste que ceux d'à côté — la carte des passages se calculait sur tout Montmartre et bloquait le téléphone) */
  const CASES = new Map(); for (const o of OB) { const [a, b, r] = o; for (let i = Math.floor((a - r) / 2); i <= Math.floor((a + r) / 2); i++) for (let j = Math.floor((b - r) / 2); j <= Math.floor((b + r) / 2); j++) { const k = i * 4096 + j; (CASES.get(k) || CASES.set(k, []).get(k)).push(o); } }
  const libre = (x, z) => { const l = CASES.get(Math.floor(x / 2) * 4096 + Math.floor(z / 2)); if (l) for (const [a, b, r] of l) if ((x - a) ** 2 + (z - b) ** 2 < r * r) return false; return true; };
  L.limites = (x, z) => libre(x, z) && ((x > XO + .4 && x < XE - .4 && z > ZN + .4 && z < ZS - .4) || (x >= XE - 2 && x < XBUT - 5 && z > 9 && z < 15) || (x > -1.1 && x < 3.2 && z >= ZS - 2 && z < ZRu0 + 2)
    || (x > XSa0 + .4 && x < -19.5 && z > ZNo0 + .4 && z < ZNo1 - .4) || (x > XSa0 + .4 && x < XSa1 - .4 && z > ZSa0 + .4 && z < ZSa1 - .4) || (x > XSa0 + .4 && x < XBUT - 5 && z > ZRu0 + .4 && z < ZRu1 - .4));
  L.hauteur = (x, z) => (x > SQ.x0 && x < SQ.x1 && z > SQ.z0 && z < SQ.z1) ? YS : hTrot(x, z);
  L.depart = [L.metroAbbesses.x, L.metroAbbesses.z - .5]; L.taille = 1.85; L.suivi = { d: 6.5, h: 4.5, av: 3, vy: 2 }; L.fov = [60, 72];
  L.zone = [XSa0 - 1, XBUT - 4, ZSa0 - 1, ZSa1 + 1];   /* (seulement là où l'on marche : la carte des passages reste petite) */ L.cam = { pos: [-83, 4, 30], vise: [-83, 3, 10] };

  /* ---------- l'animation : le soir qui s'allume, les peintres au pinceau, les dîneurs, les promeneurs ---------- */
  let nV = null, tp = 0;
  /* (10.92) le chat noir et blanc qui se promène sur la place : le plastron et les chaussettes blancs, la queue en l'air ; il trotte, s'arrête, s'assoit, repart */
  const CHAT = (() => { const noir = mat({ color: 0x141414, roughness: .6 }), blanc = mat({ color: 0xf2f0ea, roughness: .7 }), rose = mat({ color: 0xe0a0a0 }), oeil = mat({ color: 0xc8d040, emissive: 0x303000 }), g = new THREE.Group(); scene.add(g);
    const corps = add(new THREE.SphereGeometry(.12, 10, 8), noir, 0, .2, 0, g); corps.scale.set(.85, .8, 1.7); const pl = add(new THREE.SphereGeometry(.08, 8, 6), blanc, 0, .19, .14, g); pl.scale.set(1, 1.2, .8);
    const tete = new THREE.Group(); tete.position.set(0, .3, .2); g.add(tete); add(new THREE.SphereGeometry(.075, 10, 8), noir, 0, 0, 0, tete); add(new THREE.SphereGeometry(.045, 8, 6), blanc, 0, -.025, .045, tete).scale.set(1, .7, .8); add(new THREE.SphereGeometry(.009, 5, 4), rose, 0, -.01, .085, tete);
    for (const sx of [-1, 1]) { const o2 = add(new THREE.ConeGeometry(.03, .06, 4), noir, sx * .04, .065, -.005, tete); o2.rotation.z = -sx * .25; add(new THREE.SphereGeometry(.012, 6, 4), oeil, sx * .028, .015, .065, tete); }
    const pattes = []; for (const [px, pz] of [[-.05, .12], [.05, .12], [-.05, -.12], [.05, -.12]]) { const pg = new THREE.Group(); pg.position.set(px, .17, pz); g.add(pg); add(new THREE.CylinderGeometry(.018, .016, .15, 6), noir, 0, -.075, 0, pg); add(new THREE.SphereGeometry(.02, 6, 4), blanc, 0, -.155, .005, pg); pattes.push(pg); }
    const queue = new THREE.Group(); queue.position.set(0, .24, -.19); g.add(queue); for (let i = 0; i < 6; i++) add(new THREE.SphereGeometry(.018 - i * .001, 6, 4), noir, 0, i * .045, -i * .012, queue); queue.rotation.x = -.5;
    g.position.set(4, YS, -3); g.userData.anime = true; L.chat = g; return { g, tete, pattes, queue, but: null, pause: 1, assis: false }; })();
  const animChat = (tm, dt) => { const C = CHAT, g = C.g; if (C.pause > 0) { C.pause -= dt; C.pattes.forEach(pg => pg.rotation.x = 0); if (C.assis) { C.pattes[2].rotation.x = C.pattes[3].rotation.x = -1.2; g.children[0].rotation.x = -.35; } C.tete.rotation.y = Math.sin(tm / 900) * .6; C.queue.rotation.z = Math.sin(tm / 400) * .4; return; }
    g.children[0].rotation.x = 0; if (!C.but) { for (let k = 0; k < 8; k++) { const x = SQ.x0 + 1 + al() * (SQ.x1 - SQ.x0 - 2), z = SQ.z0 + 1 + al() * (SQ.z1 - SQ.z0 - 2); if (libre(x, z)) { C.but = [x, z]; break; } } if (!C.but) { C.pause = 1; return; } }
    const dx = C.but[0] - g.position.x, dz = C.but[1] - g.position.z, d = Math.hypot(dx, dz); if (d < .1) { C.but = null; C.assis = al() < .5; C.pause = 2 + al() * 5; return; }
    const v = Math.min(d, .9 * dt); g.position.x += dx / d * v; g.position.z += dz / d * v; g.position.y = L.hauteur(g.position.x, g.position.z); const ry = Math.atan2(dx, dz); g.rotation.y += Math.atan2(Math.sin(ry - g.rotation.y), Math.cos(ry - g.rotation.y)) * Math.min(1, dt * 6);
    const ph = tm / 110; C.pattes.forEach((pg, i) => { pg.rotation.x = Math.sin(ph + (i === 0 || i === 3 ? 0 : Math.PI)) * .5; }); C.tete.rotation.y = 0; C.queue.rotation.z = Math.sin(tm / 300) * .25; };
  let errDer = "", nAppels = 0, dtDer = 0, tmDer = 0; const errA = (e) => { errDer = String(e && e.message || e).slice(0, 90) + " " + String(e && e.stack || "").split("\n").slice(1, 2).join("").trim().replace(/https?:\/\/[^/]+\//, "").slice(0, 60); try { if (M && M.signalerErreur) M.signalerErreur(e); } catch (x) {} };
  /* (10.89) le détecteur : si, au bout de quelques secondes à Montmartre, aucun promeneur n'a bougé, une petite bulle dit pourquoi (rien ne s'affiche quand tout va bien) */
  { let p0 = null, vu = false; const iv = setInterval(() => { try { if (!M || !M.L) return; if (M.L !== L) { if (p0) clearInterval(iv); return; } if (M.cine || vu) return; const pos = MARCH.concat(SERV).map(W => W.m.position.x + W.m.position.z);
      if (!p0) { p0 = { pos, n: nAppels, t: performance.now() }; return; } if (performance.now() - p0.t < 6000) return; const fig = pos.filter((v, i) => Math.abs(v - p0.pos[i]) < .05).length;
      if (pos.length && (fig > pos.length * .3 || errDer)) { vu = true; const d = document.createElement("div"); d.style.cssText = "position:fixed;left:8px;bottom:70px;z-index:99999;background:rgba(20,20,20,.88);color:#ffd890;font:12px/1.4 monospace;padding:8px 10px;border-radius:8px;max-width:92vw;pointer-events:auto";
        d.textContent = "Montmartre — figés " + fig + "/" + pos.length + " : appels anim " + (nAppels - p0.n) + " en 6 s · dt " + dtDer.toFixed(4) + " · tm " + Math.round(tmDer) + " · " + (errDer || "aucune erreur") + " · v" + (window.__versionJeu || ""); d.onclick = () => d.remove(); document.body.appendChild(d); setTimeout(() => d.remove(), 30000); }
      else p0 = { pos, n: nAppels, t: performance.now() }; } catch (e) {} }, 2000); }   /* (10.89) une erreur dans une partie de l'animation n'arrête plus les autres : la marche passe en premier ; l'erreur est signalée, plus jamais avalée */
  const a0 = L.anim; L.anim = (tm) => { try { a0 && a0(tm); } catch (e) { errA(e); } const n = !!L.nuit; if (n !== nV) { nV = n; for (const [m, j, nn] of NUIT) m.emissiveIntensity = n ? nn : j; for (const o of JOUR) o.visible = !n; }   // (le soir, les peintres et l'accordéoniste sont rentrés)
    const dt = tp ? Math.min(.1, (tm - tp) / 1000) : 0; tp = tm; nAppels++; dtDer = dt; tmDer = tm; const c = M && M.camera && M.camera.position, R2 = ((MOBILE || GPU_MODESTE) ? 30 : 60) ** 2;
    try { animChat(tm, dt); } catch (e) { errA(e); } try { animVespa(tm, dt); } catch (e) { errA(e); }
    for (const W of MARCH) try { const m = W.m, [tx, tz] = W.R[W.i], dx = tx - m.position.x, dz = tz - m.position.z, d = Math.hypot(dx, dz);
      if (d < .15) { if (W.i + W.sens < 0 || W.i + W.sens >= W.R.length) W.sens = -W.sens; W.i += W.sens; continue; }
      const v = Math.min(d, W.v * dt); m.position.x += dx / d * v; m.position.z += dz / d * v; m.position.y = L.hauteur(m.position.x, m.position.z); m.rotation.y = Math.atan2(dx, dz); if (!c || (m.position.x - c.x) ** 2 + (m.position.z - c.z) ** 2 < R2) m.userData.poser("marche", tm * W.v / 1.2); } catch (e) { errA(e); }   // (chacun dans son try : un promeneur en erreur ne fige plus les autres)
    for (const S2 of SERV) try { const { m, P } = S2; if (S2.pause > 0) { S2.pause -= dt; m.userData.poser("debout", tm); const s2 = Math.min(1, S2.pause); P.bras[0].e.rotation.set(-.9 * s2, 0, -.15); P.bras[0].c.rotation.x = -.6 * s2; }   // (il pose le verre sur la table)
      else { if (!S2.but) { const pr = TABLES.filter(t => t !== S2.tab && (t[0] - m.position.x) ** 2 + (t[1] - m.position.z) ** 2 < 150); const t = pr.length ? pr[(al() * pr.length) | 0] : TABLES[(al() * TABLES.length) | 0], dx = m.position.x - t[0], dz = m.position.z - t[1], d0 = Math.hypot(dx, dz) || 1; S2.tab = t; S2.but = [t[0] + dx / d0 * .72, t[1] + dz / d0 * .72]; }
        const dx = S2.but[0] - m.position.x, dz = S2.but[1] - m.position.z, d = Math.hypot(dx, dz);
        if (d < .1) { S2.but = null; S2.pause = 2.5 + al() * 2.5; m.rotation.y = Math.atan2(S2.tab[0] - m.position.x, S2.tab[1] - m.position.z); }
        else { const v = Math.min(d, S2.v * dt); m.position.x += dx / d * v; m.position.z += dz / d * v; m.position.y = hPl(m.position.x, m.position.z); m.rotation.y = Math.atan2(dx, dz); if (!c || (m.position.x - c.x) ** 2 + (m.position.z - c.z) ** 2 < R2) m.userData.poser("marche", tm * S2.v / 1.2); } }
      P.bras[1].e.rotation.set(-1.15, 0, .3); P.bras[1].c.rotation.set(-1.45, 0, 0); } catch (e) { errA(e); }   // (le plateau toujours bien à plat sur la main)
    try { if (c && tm - (L.tVis || 0) > 400) { L.tVis = tm; const V2 = ((MOBILE || GPU_MODESTE) ? 38 : 60) ** 2, vis = (m) => { m.visible = (m.position.x - c.x) ** 2 + (m.position.z - c.z) ** 2 < V2; }; for (const m of TERR) vis(m); for (const B of BARM) vis(B.m); for (const W of MARCH) vis(W.m); for (const S3 of SERV) vis(S3.m); } } catch (e) { errA(e); }   // (les gens trop loin : on ne les dessine pas)
    try { for (const { m, k } of MODELES) { if (!m.visible) continue; m.userData.poser("assis", 0); const P = m.userData.parts; P.bras[1].e.rotation.set(-1.9, 0, .4); P.bras[1].c.rotation.x = -1.9; P.tete.rotation.y = Math.sin(tm / 3000 + k) * .08; } } catch (e) { errA(e); }
    try { if (!n) for (const A of ACCORD) A(tm); } catch (e) { errA(e); }
    try { for (const { m, k } of BANCS) { m.userData.poser("assis", tm); const P = m.userData.parts; P.tete.rotation.y = Math.sin(tm / 2400 + k * 2) * .5; } } catch (e) { errA(e); }
    try { for (const { m, k } of PEINT) { if (!m.visible) continue; if (c && (m.position.x - c.x) ** 2 + (m.position.z - c.z) ** 2 > R2) continue; m.userData.poser("assis", tm); const P = m.userData.parts, s = Math.sin(tm / 260 + k * 1.7); P.bras[1].e.rotation.set(-1.15 + s * .12, 0, .25); P.bras[1].c.rotation.x = -.5 + Math.cos(tm / 300 + k) * .15; P.tete.rotation.x = Math.sin(tm / 2400 + k) * .12; } } catch (e) { errA(e); }   // (le pinceau qui va et vient)
    try { for (const [k, m] of TERR.entries()) { if (c && (m.position.x - c.x) ** 2 + (m.position.z - c.z) ** 2 > R2) continue; const P = m.userData.parts, b = (tm / 1000 + k * 1.7) % 7; m.userData.poser("assis", tm); if (b < 1.3) { P.bras[1].e.rotation.x = -1.3; P.bras[1].c.rotation.x = -1.9; } else { P.bras[1].e.rotation.x = -.7; P.bras[1].c.rotation.x = -.9; } } } catch (e) { errA(e); }
    try { for (const { m, gui, k } of MUSI) { m.userData.poser(k ? "debout" : "assis", tm); const P = m.userData.parts; if (!k) { P.bras[1].e.rotation.set(-.9, 0, .3); P.bras[1].c.rotation.x = -1.2 + Math.sin(tm / 90) * .25; P.bras[0].e.rotation.set(-1.3, 0, -.6); P.bras[0].c.rotation.x = -1.1; P.tete.rotation.y = Math.sin(tm / 1400) * .3; void gui; }
      else { P.bras[1].e.rotation.set(-2.2 + Math.sin(tm / 500) * .3, 0, .3); P.buste.rotation.z = Math.sin(tm / 600) * .08; P.tete.rotation.x = -.15; } } } catch (e) { errA(e); }
    try { for (const { m, k } of BARM) { if (c && (m.position.x - c.x) ** 2 + (m.position.z - c.z) ** 2 > R2) continue; m.userData.poser("debout", tm); const P = m.userData.parts, s2 = Math.sin(tm / 400 + k); P.bras[1].e.rotation.set(-.9 + s2 * .15, 0, .3 + s2 * .2); P.bras[1].c.rotation.x = -.8; P.tete.rotation.y = Math.sin(tm / 2100 + k) * .5; } } catch (e) { errA(e); } };   // (le barman essuie son comptoir, regarde la salle)
  /* les lampadaires des rues (d'après les photos) : le socle de fonte, le fût cannelé et ses bagues, la lanterne à quatre pans, son chapeau ; de loin en loin, sur le bord des trottoirs */
  { const fonteL = mat({ color: 0x1e2220, roughness: .45, metalness: .55 }), verreL = lum(mat({ color: 0xfff0d0, emissive: 0xffc870, emissiveIntensity: .06, roughness: .2 }), .06, 2.6);
    const sousStore = (x, z) => STORES.some(([a, b, c2, d]) => x > a - .35 && x < b + .35 && z > c2 - .35 && z < d + .35);
    const lampadaire = (x0, z0, sens = "x") => { let x = x0, z = z0; if (sousStore(x, z)) { const alt = [1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 6, -6].map(k => sens === "x" ? [x0 + k, z0] : [x0, z0 + k]).find(([a, b]) => !sousStore(a, b) && libre(a, b)); if (!alt) return; [x, z] = alt; }   /* (10.93) jamais sous un store : décalé le long de la rue, sinon pas de lampadaire */ cyl(.17, .22, .55, fonteL, x, .3, z, scene, 8); cyl(.1, .12, .12, fonteL, x, .62, z, scene, 8); cyl(.06, .085, 3.0, fonteL, x, 2.1, z, scene, 8); for (const y of [1.2, 3.1]) cyl(.1, .1, .07, fonteL, x, y, z, scene, 8);
      cyl(.13, .06, .25, fonteL, x, 3.7, z, scene, 8); const v = add(new THREE.CylinderGeometry(.24, .15, .5, 4), verreL, x, 4.08, z); v.rotation.y = Math.PI / 4; const t = add(new THREE.ConeGeometry(.3, .28, 4), fonteL, x, 4.47, z); t.rotation.y = Math.PI / 4; cyl(.025, .025, .18, fonteL, x, 4.68, z, scene, 4);
      OB.push([x, z, .25]); HALO.push([x, 4.08, z, 1.7]); flaque(x, z, 3.8, .13); };
    for (let x = -76; x < -24; x += 13) lampadaire(x, ZNo1 - .55);   // rue Norvins
    for (let z = -38; z < ZSa1 - 4; z += 13) lampadaire(XSa1 - .55, z, "z");   // rue des Saules
    for (let x = -72, k = 0; x < XBUT - 4; x += 12, k++) lampadaire(x, k % 2 ? ZRu0 + .55 : ZRu1 - .55);   // rue Saint-Rustique
    for (let x = XE + 6; x < XBUT - 4; x += 12) lampadaire(x, 9.55); }   // rue Saint-Éleuthère
  /* le soir, au-dessus de la place : les guirlandes d'ampoules tendues d'une façade à l'autre, qui pendent un peu ; une lumière douce, orangée */
  { const fils = [], amp = [], brin = (ax, az, bx, bz, y, fl) => { const l = Math.hypot(bx - ax, bz - az), n = Math.max(6, Math.round(l / 1.05)); let px = 0, py = 0, pz = 0; for (let i = 0; i <= n; i++) { const t = i / n, x = ax + (bx - ax) * t, z = az + (bz - az) * t, yy = y - fl * 4 * t * (1 - t); if (i) fils.push(px, py, pz, x, yy, z); if (i && i < n) amp.push(x, yy - .07, z); px = x; py = yy; pz = z; } };
    for (let z = ZN + 3.5, i = 0; z < ZS - 2; z += 4.2, i++) brin(XO + .3, z + (i % 2 ? 1.2 : -1.2), XE - .3, z + (i % 2 ? -1.2 : 1.2), 6.2, 1.2);
    brin(XO + .3, ZN + .5, XE - .3, ZS - .5, 6.8, 1.8); brin(XO + .3, ZS - .5, XE - .3, ZN + .5, 6.8, 1.8); for (const x of [-12, 0, 12]) brin(x, ZN + .3, x + 1.5, ZS - .3, 6.5, 1.3);
    const gF = new THREE.BufferGeometry(); gF.setAttribute("position", new THREE.Float32BufferAttribute(fils, 3)); scene.add(new THREE.LineSegments(gF, new THREE.LineBasicMaterial({ color: 0x1a1612 })));
    const aT = tT(32, 32, (c) => { const g2 = c.createRadialGradient(16, 16, 1, 16, 16, 15); g2.addColorStop(0, "rgba(255,240,200,1)"); g2.addColorStop(.3, "rgba(255,170,80,.75)"); g2.addColorStop(1, "rgba(255,130,40,0)"); c.fillStyle = g2; c.fillRect(0, 0, 32, 32); });
    const gA = new THREE.BufferGeometry(); gA.setAttribute("position", new THREE.Float32BufferAttribute(amp, 3)); const aM = new THREE.PointsMaterial({ map: aT, size: .16, color: 0xd8c8a8, sizeAttenuation: true, transparent: true, depthWrite: false, fog: false }), aP = new THREE.Points(gA, aM); aP.frustumCulled = false; scene.add(aP);
    NUIT.push([{ set emissiveIntensity(v) { aM.size = v ? .75 : .16; aM.color.setHex(v ? 0xffb860 : 0xd8c8a8); aM.blending = v ? THREE.AdditiveBlending : THREE.NormalBlending; aM.needsUpdate = true; } }, 0, 1]);
    L.guirlandes = aP; }
  { const hT = tT(64, 64, (c, w, h) => { const g = c.createRadialGradient(32, 32, 1, 32, 32, 31); g.addColorStop(0, "rgba(255,236,190,1)"); g.addColorStop(.25, "rgba(255,190,110,.55)"); g.addColorStop(1, "rgba(255,150,70,0)"); c.fillStyle = g; c.fillRect(0, 0, w, h); });
    const pos = new Float32Array(HALO.length * 3); HALO.forEach(([x, y, z], i) => pos.set([x, y, z], i * 3)); const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    if (MOBILE || GPU_MODESTE) HALO.length = 0;
    const hM = new THREE.PointsMaterial({ map: hT, size: 2.8, sizeAttenuation: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0, fog: false }), pts = new THREE.Points(geo, hM); pts.frustumCulled = false; pts.visible = false; scene.add(pts);
    const amb = new THREE.AmbientLight(0xff9a50, 0); scene.add(amb);   // (le soir, une lumière ambiante orangée, chaleureuse, sur toutes les façades)
    NUIT.push([{ set emissiveIntensity(v) { pts.visible = v > 0; hM.opacity = v; flaqueM.opacity = v * .85; amb.intensity = v * .45; } }, 0, 1]); }
  L.jour = JOUR; L.sansMusique = true;
  /* la musique : l'accordéon, en boucle, tant qu'on est à Montmartre ; elle monte doucement, s'arrête quand on repart */
  L.sansMusique = true;
  { const a0 = L.anim; L.anim = (tm) => { try { a0 && a0(tm); } catch (e) { try { M && M.signalerErreur && M.signalerErreur(e); } catch (x) {} } if (!M || M.L !== L) return; const A2 = (window.__accordeon = window.__accordeon || Object.assign(new Audio("sons/montmartre-accordeon.mp3"), { loop: true, preload: "auto" }));
      if (A2.paused && !A2._essai && !A2._attente) { A2._essai = true; A2.volume = 0; A2.play().then(() => { A2._essai = false; }).catch(() => { A2._essai = false; A2._attente = true; }); }
      if (A2._attente && !A2._ecoute) { A2._ecoute = true; const go = () => { A2._attente = false; A2._ecoute = false; if (M && M.L === L) A2.play().catch(() => {}); removeEventListener("pointerdown", go); removeEventListener("keydown", go); }; addEventListener("pointerdown", go); addEventListener("keydown", go); }
      if (!A2.paused) try { A2.volume = Math.min(.5, A2.volume + .006); } catch (e) {} };
    quitterLieu.add(() => { const A2 = window.__accordeon; if (A2) { A2.pause(); try { A2.currentTime = 0; } catch (e) {} } }); }
  if (MOBILE || GPU_MODESTE) { const a0 = L.anim; let fait = false; L.anim = (tm) => { try { a0 && a0(tm); } catch (e) { try { M && M.signalerErreur && M.signalerErreur(e); } catch (x) {} } if (fait || !M || M.L !== L) return; fait = true; M.capRes = 1; M.redim && M.redim(); quitterLieu.add(() => { if (M && M.capRes === 1) { M.capRes = null; M.redim && M.redim(); } }); }; }   /* (sur téléphone, à Montmartre : une image un peu moins fine — moins de travail pour la carte graphique) */
  /* les pigeons : des petites bandes qui picorent entre les pavés ; on s'approche, ils s'envolent sur les toits, et reviennent un peu plus tard */
  { const G = geoPigeon(), pm = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .75 }), pi = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .35, metalness: .25 }), PG = [];
    const BANDES = [[-4, 4.5, 6], [6, -2, 5], [-16, -4, 4], [-50, -13, 4], [-83, 6, 4], [-20, 29, 5], [30, 12, 3]];
    for (const [bx, bz, n] of BANDES) for (let k = 0; k < ((PETIT || MOBILE || GPU_MODESTE) ? Math.min(n, 2) : n); k++) { const g = new THREE.Group(), c = new THREE.Mesh(G.corps, pm), t = new THREE.Mesh(G.tete, pi), aG = new THREE.Mesh(G.aileG, pm), aD = new THREE.Mesh(G.aileD, pm);
      t.position.set(0, .2, .1); aG.position.set(-.06, .19, .04); aD.position.set(.06, .19, .04); g.add(c, t, aG, aD); g.scale.setScalar(.9 + al() * .2); g.userData.anime = true;
      const hx = bx + (al() - .5) * 3, hz = bz + (al() - .5) * 3; g.position.set(hx, L.hauteur(hx, hz), hz); g.rotation.y = al() * 6.28; scene.add(g);
      PG.push({ g, t, aG, aD, hx, hz, etat: "sol", fin: 0, ph: al() * 10, cible: null }); }
    let tp = 0; const a0 = L.anim; L.anim = (tm) => { try { a0 && a0(tm); } catch (e) { try { M && M.signalerErreur && M.signalerErreur(e); } catch (x) {} } const dt = tp ? Math.min(.1, (tm - tp) / 1000) : 0; tp = tm; const moi = M && M.moiNum && M.gens.get(M.moiNum), q = moi && moi.g.position, c = M && M.camera && M.camera.position;
      for (const P of PG) { const g = P.g; const loin = c && (g.position.x - c.x) ** 2 + (g.position.z - c.z) ** 2 > 1600; g.visible = !loin || P.etat !== "sol"; if (loin && P.etat === "sol") continue;   /* (au loin : ni dessinés ni animés) */
        if (P.etat === "sol") { if (q && Math.hypot(q.x - g.position.x, q.z - g.position.z) < 2.6) { const a = Math.atan2(g.position.z - q.z, g.position.x - q.x) + (al() - .5); P.etat = "vol"; P.u = 0; P.P0 = g.position.clone(); P.P1 = new THREE.Vector3(g.position.x + Math.cos(a) * 12, 12 + al() * 3, g.position.z + Math.sin(a) * 12); P.fin = tm + 12000 + al() * 12000; continue; }
          const s = Math.sin(tm / 260 + P.ph); P.t.rotation.x = s > .6 ? .7 : 0; if (al() < dt * .5) g.rotation.y += (al() - .5) * 2; if (s < -.5) { g.position.x += Math.sin(g.rotation.y) * dt * .25; g.position.z += Math.cos(g.rotation.y) * dt * .25; if (Math.hypot(g.position.x - P.hx, g.position.z - P.hz) > 2.5) g.rotation.y += Math.PI; g.position.y = L.hauteur(g.position.x, g.position.z); } P.aG.rotation.z = P.aD.rotation.z = 0; }
        else if (P.etat === "vol" || P.etat === "retour") { P.u += dt / 2.2; const u = Math.min(1, P.u), A = P.P0, B = P.P1; g.position.set(A.x + (B.x - A.x) * u, A.y + (B.y - A.y) * u + Math.sin(u * Math.PI) * 1.5, A.z + (B.z - A.z) * u); g.rotation.y = Math.atan2(B.x - A.x, B.z - A.z);
          const b = Math.sin(tm / 45) * .9; P.aG.rotation.z = b; P.aD.rotation.z = -b; if (u >= 1) { P.etat = P.etat === "vol" ? "toit" : "sol"; P.aG.rotation.z = P.aD.rotation.z = 0; } }
        else if (P.etat === "toit" && tm > P.fin && (!q || Math.hypot(q.x - P.hx, q.z - P.hz) > 6)) { P.etat = "retour"; P.u = 0; P.P0 = g.position.clone(); const x = P.hx + (al() - .5) * 2, z = P.hz + (al() - .5) * 2; P.P1 = new THREE.Vector3(x, L.hauteur(x, z), z); } } }; }
  /* (fluidité) à Montmartre, pas d'ombres portées : la place et ses rues, avec toutes leurs maisons, coûtaient deux fois plus cher à dessiner */
  { let coupe = null; const a0 = L.anim; L.anim = (tm) => { try { a0 && a0(tm); } catch (e) { try { M && M.signalerErreur && M.signalerErreur(e); } catch (x) {} } if (!M || M.L !== L || coupe) return; coupe = []; scene.traverse(o => { if (o.isLight && o.castShadow) { o.castShadow = false; coupe.push(o); } }); };
    quitterLieu.add(() => { if (coupe) for (const o of coupe) o.castShadow = true; coupe = null; }); }
  /* (fluidité) les maisons, les devantures, les lanternes étaient rangées en groupes : chaque pièce se dessinait à part (plus de 2 000 dessins par image).
     On les sort de leurs groupes, à leur place exacte, pour que tout ce qui se ressemble soit fondu en une seule pièce */
  { const garder = new Set(); scene.updateMatrixWorld(true);
    for (const g of scene.children.slice()) { if (!g.isGroup || garder.has(g) || g.userData.anime || g.userData.poser || g.userData.parts) continue;   /* (10.93) LA cause des gens figés : les personnages étaient démontés ici, leurs bras et leurs jambes fondus dans le décor — comme les pigeons autrefois */ const ms = []; g.traverse(o => { if (o.isMesh && !o.isSkinnedMesh) ms.push(o); }); for (const m of ms) scene.attach(m); if (!g.children.some(c => c.isMesh || c.isGroup || c.isLight)) scene.remove(g); } }
  fusionStatique(scene, L, 0);
  /* (le blocage sur téléphone : tout se figeait quelques secondes — l'image, les pigeons, le texte — quand une façade, une enseigne ou une vitrine entrait pour la première fois dans le champ :
     le téléphone envoyait alors son image à la carte graphique et préparait sa matière. On fait tout cela dès l'arrivée, une fois pour toutes, pendant le chargement) */
  { let fait = false; const a0 = L.anim; L.anim = (tm) => { try { a0 && a0(tm); } catch (e) { try { M && M.signalerErreur && M.signalerErreur(e); } catch (x) {} } if (fait || !M || M.L !== L || !M.rendu || !M.camera) return; fait = true;
      try { const R = M.rendu, vus = new Set(); scene.traverse(o => { for (const m of [].concat(o.material || [])) if (m) for (const k of ["map", "emissiveMap", "normalMap", "alphaMap"]) { const t = m[k]; if (t && t.isTexture && !vus.has(t)) { vus.add(t); try { R.initTexture(t); } catch (e) {} } } });
        R.compile(scene, M.camera); M.dbgPrep = vus.size; for (const P of PAGES) { P.c.width = P.c.height = 1; }   /* (les planches sont dans la carte graphique : on libère leur copie dans la mémoire du téléphone — 100 Mo) */ } catch (e) { console.warn("préparation", e); } }; }   // (tout ce qui ne bouge pas, regroupé : fluide sur téléphone)
}
({ construireTertre })
