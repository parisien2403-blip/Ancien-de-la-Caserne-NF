/* Montmartre : la place du Tertre (d'après les photos), et le dôme du Sacré-Cœur au-dessus des toits.
   Ce fichier est chargé par la matrice (matrice.js) la première fois qu'on y va, et exécuté chez elle (eval direct) : il se sert
   tel quel de tout ce qu'elle a (THREE, M, personne3D, quitterLieu…). Ce qu'il rend (la dernière expression) : ses points d'entrée. */
function construireTertre(A, L, scene) {
  const tT = (w, h, f, rx, ry) => { const c = document.createElement("canvas"); c.width = w; c.height = h; f(c.getContext("2d"), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; if (rx) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry || rx); } return t; };
  const mat = (o) => new THREE.MeshStandardMaterial({ roughness: .85, ...o });
  const add = (geo, m, x, y, z, par = scene, ry = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.y = ry; o.receiveShadow = true; par.add(o); return o; };
  const box = (w, h, d, m, x, y, z, par = scene, ry = 0) => add(new THREE.BoxGeometry(w, h, d), m, x, y, z, par, ry);
  const cyl = (rt, rb, h, m, x, y, z, par = scene, seg = 12) => add(new THREE.CylinderGeometry(rt, rb, h, seg), m, x, y, z, par);
  let graine = 23; const al = () => (graine = (graine * 16807) % 2147483647) / 2147483647;
  const NUIT = [], TERR = [], PEINT = [], MARCH = [], SERV = []; const lum = (m, j, n) => { NUIT.push([m, j, n]); return m; };
  const serif = "Georgia, 'Times New Roman', serif";
  const fit = (c, txt, maxW, px, font) => { let p = px; c.font = `${font.replace("@", p + "px")}`; while (c.measureText(txt).width > maxW && p > 8) { p -= 2; c.font = `${font.replace("@", p + "px")}`; } return p; };
  const SQ = { x0: -13, x1: 13, z0: -9, z1: 9 }, YS = .14;   // le carré des peintres (surélevé d'une bordure de pierre)
  const XO = -21.5, XE = 19.5, ZN = -16.5, ZS = 15.5;
  const OB = [], LEDC = [], HALO = [];
  /* le soir : sous chaque lampadaire, la flaque de lumière dorée sur les pavés (un seul matériau, fondu avec le reste) ; autour de chaque lanterne, le halo (tous en un seul nuage de points) */
  const flaqueT = tT(128, 128, (c, w, h) => { const g = c.createRadialGradient(64, 64, 2, 64, 64, 62); g.addColorStop(0, "rgba(255,190,110,1)"); g.addColorStop(.45, "rgba(255,160,80,.45)"); g.addColorStop(1, "rgba(255,140,60,0)"); c.fillStyle = g; c.fillRect(0, 0, w, h); });
  const flaqueM = new THREE.MeshBasicMaterial({ map: flaqueT, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  const flaque = (x, z, r, y = .03) => { const p = add(new THREE.PlaneGeometry(r * 2, r * 2), flaqueM, x, y, z); p.rotation.x = -Math.PI / 2; };   /* (toutes fondues en une seule) */   // (les obstacles : arbres, chevalets, poteaux)   // les façades : ouest (les restaurants), est, nord, sud

  /* ---------- le sol : les pavés de granit, gris-bleu, arrondis par les années ; la bordure de pierre du carré ---------- */
  /* les pavés de grès et de granit (d'après les photos) : de petits pavés rectangulaires posés en rangs, aux couleurs mêlées — gris, beige, ocre, brun, un peu de rouille —,
     les joints sombres, les arêtes usées, le luisant de la pluie */
  const PAV = [[128, 126, 126], [146, 138, 126], [160, 150, 134], [132, 118, 104], [142, 120, 104], [110, 106, 104], [170, 162, 148], [120, 118, 120], [136, 130, 124]];   // (des teintes sourdes, comme sur les photos)
  const paves = (teinte) => tT(512, 512, (c, w, h) => { const d = (teinte - 130) * .5; c.fillStyle = "#2e2a26"; c.fillRect(0, 0, w, h); const rh = 21;
    for (let y = 0; y < h; y += rh) { let x = -(al() * 30); while (x < w) { const pw = 22 + al() * 16, [r, g2, b] = PAV[(al() * PAV.length) | 0], v = (al() - .5) * 22 + d;
        const X = x + 1.5, Y = y + 1.5, W2 = pw - 3, H2 = rh - 3; c.fillStyle = `rgb(${r + v | 0},${g2 + v | 0},${b + v | 0})`; c.beginPath(); c.roundRect ? c.roundRect(X, Y, W2, H2, 4) : c.rect(X, Y, W2, H2); c.fill();
        c.fillStyle = "rgba(255,255,255,.13)"; c.fillRect(X + 2, Y + 1, W2 - 5, 3); c.fillStyle = "rgba(0,0,0,.22)"; c.fillRect(X + 2, Y + H2 - 3, W2 - 3, 3);   // l'arête usée, l'ombre
        if (al() < .25) { c.fillStyle = "rgba(255,255,255,.09)"; c.beginPath(); c.ellipse(X + W2 * .5, Y + H2 * .45, W2 * .35, H2 * .25, 0, 0, 7); c.fill(); }   // le luisant
        x += pw; } }
    for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(${al() < .5 ? "40,30,20" : "90,70,40"},.07)`; c.beginPath(); c.ellipse(al() * w, al() * h, 20 + al() * 60, 10 + al() * 30, al() * 3, 0, 7); c.fill(); } }, 1, 1);   // (les taches, l'usure)
  const pavT = paves(118); pavT.repeat.set(340 / 2.4, 200 / 2.4);
  { const s = add(new THREE.PlaneGeometry(340, 200), mat({ map: pavT, roughness: .7, metalness: .05 }), 40, 0, 0); s.rotation.x = -Math.PI / 2; L.sol = s; }
  { const t = paves(132); t.repeat.set((SQ.x1 - SQ.x0) / 2.4, (SQ.z1 - SQ.z0) / 2.4); box(SQ.x1 - SQ.x0, YS, SQ.z1 - SQ.z0, [mat({ color: 0x8a8c90 }), mat({ color: 0x8a8c90 }), mat({ map: t, roughness: .7 }), mat({ color: 0x555 }), mat({ color: 0x8a8c90 }), mat({ color: 0x8a8c90 })], 0, YS / 2, 0);
    const bord = mat({ color: 0xa8a49a, roughness: .8 }); for (const [w, d, x, z] of [[SQ.x1 - SQ.x0 + .4, .3, 0, SQ.z0], [SQ.x1 - SQ.x0 + .4, .3, 0, SQ.z1], [.3, SQ.z1 - SQ.z0, SQ.x0, 0], [.3, SQ.z1 - SQ.z0, SQ.x1, 0]]) box(w, YS + .03, d, bord, x, (YS + .03) / 2, z); }
  // les trottoirs étroits devant les restaurants (ouest et nord), un peu surélevés
  const trotM = mat({ map: (() => { const t = paves(140); t.repeat.set(16, 2); return t; })(), roughness: .75 }), bordT = mat({ color: 0xb0aca2 });
  box(2.6, .14, ZS - ZN, trotM, XO + 1.3, .07, (ZN + ZS) / 2); box(.22, .16, ZS - ZN, bordT, XO + 2.6, .08, (ZN + ZS) / 2);
  box(XE - XO, .14, 2.4, trotM, (XO + XE) / 2, .07, ZN + 1.2); box(XE - XO, .16, .22, bordT, (XO + XE) / 2, .08, ZN + 2.4);
  const hTrot = (x, z) => ((x > XO - .1 && x < XO + 2.6 && z > ZN && z < ZS) || (z > ZN - .1 && z < ZN + 2.4 && x > XO && x < XE)) ? .14 : 0;

  /* ---------- les maisons du vieux village : enduit clair, volets, balcons de fer, toits de zinc en mansarde, cheminées ---------- */
  const facadeT = (W, H, o) => { const k = (MOBILE || GPU_MODESTE) ? (o.cache ? 17 : 20) : o.cache ? 26 : 30,   /* (sur téléphone : des façades moins lourdes en mémoire) */ cw = Math.round(W * k), ch = Math.round(H * k); let jour, nuit;
    jour = tT(cw, ch, (c) => { c.fillStyle = o.teinte; c.fillRect(0, 0, cw, ch); for (let i = 0; i < 1400; i++) { c.fillStyle = `rgba(${al() < .5 ? "0,0,0" : "255,255,255"},${al() * .05})`; c.fillRect(al() * cw, al() * ch, 2 + al() * 10, 2 + al() * 8); }
      if (o.pierre) { const bh = .42 * k; for (let y = ch; y > 0; y -= bh) { const off = ((ch - y) / bh | 0) % 2 ? .45 * k : 0; c.fillStyle = "rgba(90,70,40,.28)"; c.fillRect(0, y, cw, 2); for (let x = off; x < cw; x += .9 * k) { c.fillRect(x, y - bh, 2, bh); c.fillStyle = `rgba(${al() < .5 ? "120,90,50" : "255,240,210"},${al() * .12})`; c.fillRect(x + 2, y - bh + 2, .9 * k - 4, bh - 4); c.fillStyle = "rgba(90,70,40,.28)"; } } }
      for (let i = 0; i < 6; i++) { const x = al() * cw, gr = c.createLinearGradient(0, ch * .3, 0, ch); gr.addColorStop(0, "rgba(70,60,40,0)"); gr.addColorStop(1, "rgba(70,60,40,.12)"); c.fillStyle = gr; c.fillRect(x, ch * .3, 6 + al() * 20, ch * .7); }   // (les coulures, le bas des murs plus sale)
      const nE = o.etages, hE = (H - 3.8) / nE, nF = o.fen || Math.max(2, Math.round(W / 2.6));
      c.fillStyle = "rgba(0,0,0,.12)"; for (let e = 0; e <= nE; e++) c.fillRect(0, ch - (3.8 + e * hE) * k, cw, 4);   // les bandeaux
      /* les fenêtres (d'après les photos) : la haute porte-fenêtre à la française, son encadrement de pierre et son appui, les deux battants blancs à petits carreaux,
         le voilage, le reflet du ciel ; les persiennes ouvertes à lames ; le garde-corps de fer forgé à volutes ; au premier, parfois, le long balcon filant */
      const vol = o.volets === false ? null : (o.volets || "#d8d2c4"), clair = "rgba(255,250,240,.38)", ombreP = "rgba(60,45,25,.35)";
      for (let e = 0; e < nE; e++) { const longB = o.longBalcon === e || (o.longBalcon === undefined && e === 1 && nE >= 3 && (W * 7 | 0) % 3 === 0);
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
    nuit = tT(cw, ch, (c) => { c.fillStyle = "#000"; c.fillRect(0, 0, cw, ch); const nE = o.etages, hE = (H - 3.8) / nE, nF = o.fen || Math.max(2, Math.round(W / 2.6));
      for (let e = 0; e < nE; e++) for (let f = 0; f < nF; f++) if (al() < .45 && !(o.sansEtage && o.sansEtage.includes(e))) { const fx = (W / nF) * (f + .5), fy = 3.8 + e * hE + hE * .14, fw = 1.06, fh = Math.min(hE * .7, 2.15), X = (fx - fw / 2) * k, Y = ch - (fy + fh) * k; const g2 = c.createLinearGradient(0, Y, 0, Y + fh * k); g2.addColorStop(0, "#ffd890"); g2.addColorStop(1, "#e89a40"); c.fillStyle = g2; c.fillRect(X, Y, fw * k, fh * k);
        c.fillStyle = "rgba(255,240,210,.5)"; c.fillRect(X + 2, Y + 2, fw * k * .3, fh * k - 4); c.fillRect(X + fw * k * .68, Y + 2, fw * k * .3, fh * k - 4); c.strokeStyle = "#3a2a1a"; c.lineWidth = Math.max(1.2, .045 * k); c.beginPath(); c.moveTo(X + fw * k / 2, Y); c.lineTo(X + fw * k / 2, Y + fh * k); for (let r = 1; r < 4; r++) { c.moveTo(X, Y + fh * k * r / 4); c.lineTo(X + fw * k, Y + fh * k * r / 4); } c.stroke(); }
      if (o.peint && o.peintNuit) { const [txt, , et, yA, hL] = o.peint, y = ch - (yA ?? (3.8 + (et + 1.03) * hE)) * k; c.textAlign = "center"; c.textBaseline = "middle"; fit(c, txt, cw * .9, Math.round((hL || Math.min(.32 * hE, .62)) * k * 1.35), `bold @ ${serif}`); c.fillStyle = "#ffe0a0"; c.fillText(txt, cw / 2, y); } });
    return lum(mat({ map: jour, emissive: 0xffffff, emissiveMap: nuit, emissiveIntensity: 0, roughness: .9 }), 0, 1.0); };
  const FCACHE = new Map();
  const zinc = mat({ color: 0x5e656c, roughness: .55, metalness: .5 }), briq = mat({ color: 0x9a5a44 }), cote = mat({ color: 0xd9d0bf });
  // une maison : la façade face à +z dans son repère ; o.rdc : la devanture du rez-de-chaussée
  const maison = (x, z, ry, W, H, o) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g); const D = 9;
    const cle = o.cache && [o.teinte, o.volets, o.etages, W, H, o.pierre].join("|"), fM = cle ? (FCACHE.get(cle) || FCACHE.set(cle, facadeT(W, H, o)).get(cle)) : facadeT(W, H, o); const cleC = ["côté", o.teinte, o.volets, o.etages, H].join("|"), cM = o.pignon ? cote : (FCACHE.get(cleC) || FCACHE.set(cleC, facadeT(D, H, { teinte: o.teinte || "#ece6d8", volets: o.volets === false ? "#f2f2ee" : o.volets, etages: o.etages || 3, fen: 3, balcon: false, cache: true })).get(cleC));   // (les murs de côté, ceux qu'on voit dans les passages : des fenêtres aussi)
    box(W, H, D, [cM, cM, cote, cote, fM, cote], 0, H / 2, -D / 2, g);
    if (o.pignon) { const hp = o.pignon, tri = new THREE.Shape(); tri.moveTo(-W / 2 - .15, 0); tri.lineTo(W / 2 + .15, 0); tri.lineTo(0, hp); tri.closePath();   // le pignon blanc sur la place, le toit d'ardoise
      const t = add(new THREE.ExtrudeGeometry(tri, { depth: D, bevelEnabled: false }), [cote, mat({ color: 0x3a3e46, roughness: .6 })], 0, H, -D, g); void t; box(W + .5, .14, .3, cote, 0, H + .05, .1, g);
      box(1.1, 1.4, .1, lum(mat({ color: 0x1c2228, emissive: 0xffc070, emissiveIntensity: 0 }), 0, 1), 0, H + hp * .38, .04, g); box(1.3, .12, .2, cote, 0, H + hp * .38 - .76, .1, g); box(.9, 1.8, .6, briq, W / 2 - .8, H + hp * .5 + .6, -5, g);
      if (o.rdc) o.rdc(g, W); return g; }
    // le toit en mansarde : le brisis de zinc, les lucarnes, les cheminées
    const br = box(W + .1, 2.6, .5, zinc, 0, H + 1.1, -.9, g); br.rotation.x = -.42; box(W + .1, .3, D - 2, zinc, 0, H + 2.25, -D / 2 - .3, g); box(W, 2.2, D - 2.4, zinc, 0, H + 1.1, -D / 2 - .4, g);
    const nL = Math.max(1, Math.round(W / 3.2)); for (let i = 0; i < nL; i++) { const lx = -W / 2 + (i + .5) * W / nL; box(1.0, 1.3, 1.0, cote, lx, H + 1.2, -.75, g); box(1.15, .15, 1.1, zinc, lx, H + 1.9, -.75, g); box(.6, .8, .02, lum(mat({ color: 0x1c2228, emissive: 0xffc070, emissiveIntensity: 0 }), 0, al() < .4 ? 1 : 0), lx, H + 1.15, -.24, g); }
    for (const cx of [-W / 2 + .8, W / 2 - .8]) { box(.9, 1.8, .6, briq, cx, H + 2.7, -4, g); for (let p = 0; p < 3; p++) cyl(.08, .08, .4, mat({ color: 0x9a6a50 }), cx - .25 + p * .25, H + 3.75, -4, g, 6); }
    if (o.rdc) o.rdc(g, W); return g; };

  /* ---------- les devantures : boiseries, vitrines éclairées, stores bannes et leur lambrequin écrit ---------- */
  /* (les tableaux de Montmartre, d'après les peintures envoyées : une planche de 30 toiles, 8 par rang, chacune 128 × 160) */
  const TOILES = { img: null, pret: false, att: [], canv: [] }, NTOILES = 30;
  const toile3 = (c, x, y, w, h, k) => { const go = () => { const q = k % NTOILES; c.drawImage(TOILES.img, (q % 8) * 128, (q / 8 | 0) * 160, 128, 160, x, y, w, h); };
    if (TOILES.pret) go(); else { TOILES.att.push(go); TOILES.canv.push(c.canvas); if (!TOILES.img) { TOILES.img = new Image(); TOILES.img.onload = () => { TOILES.pret = true; for (const f of TOILES.att) f(); TOILES.att = [];
      scene.traverse(o => { for (const m of [].concat(o.material || [])) for (const t of [m && m.map, m && m.emissiveMap]) if (t && t.image && TOILES.canv.includes(t.image)) t.needsUpdate = true; }); }; TOILES.img.src = "images/tableaux-montmartre.jpg"; } } };
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
    if (motif) motif(c, w, h); const rf = c.createLinearGradient(0, 0, w, h); rf.addColorStop(0, "rgba(255,255,255,.14)"); rf.addColorStop(.4, "rgba(255,255,255,0)"); c.fillStyle = rf; c.fillRect(0, 0, w, h); });   // le reflet de la vitre
    if (!motif) VCACHE.set(cle, t); return t; };
  const lanterneD = (g, x, y) => { box(.04, .04, .22, fonteM, x, y + .3, .2, g); add(new THREE.BoxGeometry(.22, .3, .22), lum(mat({ color: 0xf8e8c0, emissive: 0xffd080, emissiveIntensity: .15, roughness: .3 }), .15, 2.2), x, y, .36, g); add(new THREE.ConeGeometry(.18, .14, 4), fonteM, x, y + .22, .36, g).rotation.y = Math.PI / 4; };
  const ardoise = (g, x, txt) => { const t = tT(128, 192, (c, w, h) => { c.fillStyle = "#1e2420"; c.fillRect(0, 0, w, h); c.strokeStyle = "#8a6a3a"; c.lineWidth = 8; c.strokeRect(4, 4, w - 8, h - 8); c.fillStyle = "#f2f0e8"; c.font = "italic bold 18px Georgia"; c.textAlign = "center"; c.fillText(txt || "Menu du jour", w / 2, 34); c.font = "13px Georgia"; ["Soupe à l'oignon", "Croque-monsieur", "Bœuf bourguignon", "Crème brûlée", "Café · 6 F"].forEach((l, i) => c.fillText(l, w / 2, 64 + i * 24)); });
    const a = new THREE.Group(); a.position.set(x, 0, 1.0); g.add(a); for (const s2 of [-1, 1]) { const p = box(.6, .9, .04, mat({ map: t }), 0, .48, s2 * .12, a); p.rotation.x = s2 * .14; } };
  const rideauT = tT(64, 128, (c, w, h) => { c.fillStyle = "#a8a49a"; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 6) { c.fillStyle = "rgba(0,0,0,.25)"; c.fillRect(0, y, w, 2); } }, 1, 1);
  const devanture = (g, W, o) => { const bois = mat({ color: o.bois, roughness: .5 }), moulM = mat({ color: new THREE.Color(o.bois).multiplyScalar(1.25).getHex(), roughness: .45 }), Hd = 3.5;
    box(W, .5, .25, bois, 0, Hd - .1, .12, g); for (let i = 0; i <= o.travees; i++) box(.18, Hd - .3, .22, bois, -W / 2 + .1 + i * (W - .2) / o.travees, (Hd - .3) / 2, .12, g);
    const vt = vitreT(o.fondV || "#c87830", o.motif, o.genre), vM = lum(mat({ map: vt, emissive: 0xffffff, emissiveMap: vt, emissiveIntensity: .35, roughness: .15 }), .35, 1.25);
    for (let i = 0; i < o.travees; i++) { const tw = (W - .2) / o.travees - .2, tx = -W / 2 + .1 + (i + .5) * (W - .2) / o.travees; if (i === o.porte) { box(tw, 2.5, .08, mat({ color: o.porteC || o.bois, roughness: .5 }), tx, 1.25, .05, g); box(tw * .7, 1.2, .02, vM, tx, 1.7, .1, g); } else if (o.rideau) { box(tw, 2.9, .06, mat({ map: rideauT, roughness: .6, metalness: .4 }), tx, 1.45, .06, g); } else { box(tw, .7, .1, bois, tx, .35, .1, g); box(tw - .2, .48, .03, mat({ color: o.bois, roughness: .45, emissive: 0x000000 }), tx, .35, .17, g); box(tw - .28, .4, .02, moulM, tx, .35, .19, g);   // le soubassement et sa moulure
      box(tw, 2.3, .04, vM, tx, 1.85, .04, g); box(tw, .04, .05, bois, tx, 2.55, .08, g); if (tw > 1.2) box(.04, 2.3, .05, bois, tx, 1.85, .08, g); } }   // les petits bois
    if (o.lanternes !== false && W > 4.5) for (const x of [-W / 2 + .45, W / 2 - .45]) lanterneD(g, x, 2.85);
    if (o.ardoise) ardoise(g, -W / 2 + 1.2, o.ardoise === true ? null : o.ardoise);
    // le store banne
    if (o.store) { const [coul, txt, txtC] = o.store, sw = W + .2, sd = o.storeD || 2.2, aT = tT(512, 64, (c, w, h) => { c.fillStyle = coul; c.fillRect(0, 0, w, h); if (o.raye) { c.fillStyle = typeof o.raye === "string" ? o.raye : "rgba(255,255,255,.85)"; for (let x = 0; x < w; x += 32) c.fillRect(x, 0, 16, h); } c.fillStyle = "rgba(0,0,0,.15)"; c.fillRect(0, h - 6, w, 6); });
      const st = box(sw, .06, sd, mat({ map: aT, roughness: .9 }), 0, Hd + .05 - Math.sin(.32) * sd / 2, sd / 2 * Math.cos(.32) + .1, g); st.rotation.x = .32;
      const lT = tT(1024, 72, (c, w, h) => { c.fillStyle = coul; c.fillRect(0, 0, w, h); c.fillStyle = txtC || "#f2ead8"; c.textAlign = "center"; c.textBaseline = "middle"; fit(c, txt, w * .9, 46, `bold @ ${serif}`); c.fillText(txt, w / 2, h / 2 + 2);
        c.fillStyle = "rgba(0,0,0,.25)"; for (let x = 0; x < w; x += 40) { c.beginPath(); c.moveTo(x, h); c.lineTo(x + 20, h - 10); c.lineTo(x + 40, h); c.fill(); } });
      const yB = Hd + .05 - Math.sin(.32) * sd, zB = sd * Math.cos(.32) + .12; box(sw, .42, .03, lumT(lT, .02, .45), 0, yB - .2, zB, g);
      if (o.guirlande) { const bM = lum(mat({ color: 0xfff4d0, emissive: 0xffe0a0, emissiveIntensity: 0 }), 0, 2.4); for (let x = -sw / 2 + .2; x < sw / 2; x += .45) add(new THREE.SphereGeometry(.045, 6, 5), bM, x, yB - .42, zB + .02, g); } }
    if (o.bandeau) { const [txt, fond, coul] = o.bandeau; panneau(g, W - .5, Hd + .52, .66, txt, fond, coul, { cadre: coul, z: .3 }); }   // (le panneau encadré, posé sur la poutre)
    if (!o.store && o.corniche !== false) { box(W + .3, .14, .5, bois, 0, Hd + .97, .16, g); box(W + .2, .06, .44, moulM, 0, Hd + .88, .16, g);   // la corniche de la devanture
      for (const sg of [-1, 1]) { box(.2, .62, .32, bois, sg * (W / 2 - .02), Hd + .55, .2, g); box(.24, .1, .36, moulM, sg * (W / 2 - .02), Hd + .25, .2, g); } }   // les consoles
    for (const sg of [-1, 1]) box(.26, .14, .3, moulM, sg * (W / 2 - .02), Hd - .4, .18, g);   // les chapiteaux des pilastres
    if (o.attable) { const T = new THREE.Group(); T.position.set(o.attable * W * .22, 0, .95); g.add(T); const marbre = mat({ color: 0xe8e4dc, roughness: .3 }), boisC = mat({ color: 0x7a4a24, roughness: .55 });   // la petite table de bistrot et ses deux chaises (photos)
      add(new THREE.CylinderGeometry(.3, .3, .04, 18), marbre, 0, .74, 0, T); add(new THREE.CylinderGeometry(.03, .04, .72, 8), fonteM, 0, .36, 0, T); add(new THREE.CylinderGeometry(.18, .22, .04, 12), fonteM, 0, .02, 0, T);
      for (const sx of [-1, 1]) { const C = new THREE.Group(); C.position.set(sx * .55, 0, 0); C.rotation.y = sx * Math.PI / 2; T.add(C); add(new THREE.CylinderGeometry(.21, .21, .04, 14), boisC, 0, .46, 0, C); for (const [a, b] of [[-.14, -.14], [.14, -.14], [-.14, .14], [.14, .14]]) add(new THREE.CylinderGeometry(.015, .015, .46, 5), boisC, a, .23, b, C);
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
  const table = (x, z, rouge) => { cyl(.32, .32, .03, rouge ? nappe : plateau, x, .74, z); cyl(.025, .025, .72, fonteM, x, .37, z, scene, 6); cyl(.2, .22, .03, fonteM, x, .02, z); };
  const PE = ["#f0c9a6", "#c78f62", "#e8bd95", "#8d5a3b", "#f6d6bc", "#6a4028"], HA = ["#2a3a5a", "#7a2a3a", "#3a3a40", "#e8e2d6", "#5a4636", "#2f5a4a", "#c8a040", "#1a1a1c", "#8a2a2a", "#4a5a7a"];
  const gens = (k, o = {}) => { const f = k % 2 === 1; return personne3D({ taille: f ? 1.64 : 1.76, peau: PE[k % 6], ch: ["#2a1a12", "#5a3a22", "#141010", "#8a8a8a", "#e2c27a", "#a5532a"][k % 6], haut: HA[k % 10], bas: ["#26324e", "#2a2a30", "#3a3028", "#1a1a1c"][k % 4], chaussures: ["#1a1a1a", "#3a2418"][k % 2], coif: f ? (k % 3 ? "long" : "carre") : k % 5 ? "court" : "chauve", pantalon: !f || k % 3 === 0, robe: f && k % 3 !== 0, parle: k % 3 === 0, ...o }); };
  const GENS = false;   // (pour le moment, personne : la place doit rester fluide)
  const nTerr = !GENS ? 0 : PETIT ? 6 : (MOBILE || GPU_MODESTE) ? 12 : 26; let kT = 0;
  // une terrasse : des rangées de tables le long d'une façade ; ax/az : le sens de la façade ; nx/nz : vers la rue
  const terrasse = (x0, z0, ax, az, nx, nz, L2, rangs, rouge) => { for (let r = 0; r < rangs; r++) for (let t = .6; t < L2 - .4; t += 1.25) { const x = x0 + ax * t + nx * (.55 + r * 1.0), z = z0 + az * t + nz * (.55 + r * 1.0); table(x, z, rouge);
      const ry = Math.atan2(nx, nz); for (const sg of [-1, 1]) { const cx = x + ax * sg * .45, cz = z + az * sg * .45, rc = Math.atan2(-ax * sg, -az * sg); chaise(cx, cz, rc);
        if (kT < nTerr && al() < .55) { const m = gens(kT + 3); m.position.set(cx, .02, cz); m.rotation.y = rc; m.userData.poser("assis", 0); scene.add(m); TERR.push(m); kT++; } } void ry; } };

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
    if (pot) { const [px, pz, lx, lz] = pot; const n = Math.floor(Math.max(lx, lz) / 1.7); for (let i = 0; i <= n; i++) { const x = px + (lx ? i * 1.7 : 0), z = pz + (lz ? i * 1.7 : 0); cyl(.07, .08, .85, potM, x, .45, z, scene, 7); add(new THREE.SphereGeometry(.08, 7, 5), potM, x, .88, z); } } };
  trottoir(-80, ZNo0, -21.5, ZNo0 + .85); trottoir(-80, ZNo1 - .85, -30.5, ZNo1, [-79, ZNo1 - .95, 48, 0]);
  trottoir(XSa0, ZSa0, XSa0 + .8, ZSa1); trottoir(XSa1 - .8, ZSa0, XSa1, ZNo0); trottoir(XSa1 - .8, ZNo1, XSa1, ZRu0);
  trottoir(-80, ZRu0, XBUT, ZRu0 + .85); trottoir(-80, ZRu1 - .85, XBUT, ZRu1, [-78, ZRu1 - .95, 132, 0]);
  { const n = Math.floor(132 / 1.7); for (let i = 0; i <= n; i++) { const x = -78 + i * 1.7; if (x > -2 && x < 4) continue; cyl(.07, .08, .85, potM, x, .45, ZRu0 + .95, scene, 7); } }
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
  const fleuriste = (g, W) => { const bois = mat({ color: 0x6a4a2a }), seau = mat({ color: 0x8a8a8a, metalness: .5 }); for (let r = 0; r < 3; r++) { box(W - 1.2, .05, .45, bois, 0, .3 + r * .32, 1.3 - r * .4, g); box(W - 1.2, .3 + r * .32, .04, bois, 0, (.3 + r * .32) / 2, 1.52 - r * .4, g);
      for (let x = -W / 2 + 1; x < W / 2 - .7; x += .45) { cyl(.14, .11, .26, seau, x, .45 + r * .32, 1.3 - r * .4, g, 8); for (let k = 0; k < 3; k++) add(new THREE.IcosahedronGeometry(.11 + al() * .06, 0), fleursM[(r * 7 + k + (x * 3 | 0)) % 5 + (al() < .2 ? 0 : 0)] || fleursM[0], x + (al() - .5) * .2, .72 + r * .32 + al() * .15, 1.3 - r * .4 + (al() - .5) * .15, g); } } };
  // une maison de rue, ordinaire (les façades sont partagées entre maisons pareilles : moins de mémoire)
  const TEINTES = ["#ece6d8", "#e4d8c0", "#f1ece2", "#d9c8a8", "#e9e2d2", "#dccfb4"], VOLETS = ["#f2f2ee", "#f2f2ee", "#6a8a9a", "#7a9a6a", "#f2f2ee", "#c8c2b4"];
  const ordinaire = (k) => ({ teinte: TEINTES[k % 6], volets: VOLETS[k % 2 ? 0 : 2 + (k % 4 === 0)], etages: 3, cache: true, pierre: k % 6 === 3 || k % 6 === 5, lierre: k % 4 === 1 ? 1 : k % 7 === 2 ? 2 : 0 });   // (la pierre de taille, le lierre, par endroits)   // (peu de variantes : les façades pareilles sont partagées)
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
  const rangee = (ax, az, dx, dz, ry, liste) => { let t = 0; for (const [W, H, o] of liste) { if (!o.rdc && W > 3) o.rdc = boutique; if (o.rdc && W > 3) { const r0 = o.rdc; o.rdc = (g, W2) => { r0(g, W2); pots(g, W2); }; } const x = ax + dx * (t + W / 2), z = az + dz * (t + W / 2); const g = maison(x, z, ry, W, H, o);
      if (o.lierre) lierre(g, W, H, o.lierre === 2, undefined, o.rdc ? 4.5 : 0); if (o.jard) jardinieres(g, W, H, o.etages, o.fen); if (o.lanterne !== false) { const nx = Math.sin(ry), nz = Math.cos(ry); lanterneMur(x + dx * (W / 2 - .6), 4.6, z + dz * (W / 2 - .6), nx, nz); }
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
  { const moT = tT(256, 256, (c, w, h) => { c.fillStyle = "#8a8070"; c.fillRect(0, 0, w, h); for (let i = 0; i < 160; i++) { const v = 140 + al() * 60, x = al() * w, y = al() * h; c.fillStyle = `rgb(${v | 0},${(v - 10) | 0},${(v - 28) | 0})`; c.beginPath(); c.ellipse(x, y, 10 + al() * 14, 7 + al() * 8, al() * .5, 0, 7); c.fill(); c.strokeStyle = "rgba(60,50,40,.5)"; c.lineWidth = 2; c.stroke(); } });
    moT.wrapS = moT.wrapT = THREE.RepeatWrapping; moT.repeat.set(2.4, 1.6); const moM = mat({ map: moT, roughness: .95 }), tuile = mat({ color: 0x9a4a32, roughness: .8 }), ZM = ZSa0 - .3;
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
    // derrière le mur : les rangs de vigne qui montent sur la butte, les arbres
    const vigne = mat({ color: 0x4a6a2a, roughness: .9 }), terre = mat({ color: 0x6a5a40, roughness: 1 }); box(16, 4, 26, terre, -83, 2, ZM - 13.5);
    for (let r = 0; r < 9; r++) { const z = ZM - 1.5 - r * 2.6, y = 4 + r * .7; box(16, r * .7 + .01, 2.6, terre, -83, 4 + r * .35, z); for (let x = -90; x < -76; x += .9) add(new THREE.IcosahedronGeometry(.42, 0), vigne, x + al() * .3, y + .55, z); }
    for (const [x, z] of [[-88, -52], [-78, -56], [-85, -62], [-80, -66]]) { cyl(.18, .24, 4, mat({ color: 0x5a4a3a }), x, 6 + (ZM - z) * .25, z, scene, 6); for (let k = 0; k < 4; k++) add(new THREE.IcosahedronGeometry(1.4 + al() * .6, 0), [vertJ, mat({ color: 0x5a7a2a }), mat({ color: 0xc8782a })][k % 3], x + (al() - .5) * 1.6, 9 + (ZM - z) * .25 + al() * 1.4, z + (al() - .5) * 1.6); } }
  // le chanteur des rues, sa guitare, sur son tabouret devant La Bonne Franquette ; et le monsieur au béret qui chante avec lui
  const MUSI = []; if (GENS) { const m = personne3D({ taille: 1.74, peau: "#e8bd95", ch: "#e8e8e8", haut: "#e8b8b8", bas: "#e8e2d2", chaussures: "#5a3a22", coif: "court", pantalon: true }); m.position.set(XSa1 - 1.6, 0, 22); m.rotation.y = -Math.PI / 2 - .4; m.userData.poser("assis", 0); scene.add(m);
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
      box(3.4, 1.5, .1, mat({ color: 0x2a5a7a }), 0, 4.45, .3, g); const d = add(new THREE.CylinderGeometry(.66, .66, .06, 28), lumT(t, .05, .8), 0, 4.45, .38, g); d.rotation.x = Math.PI / 2; } }],
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
    for (let i = 0; i < 12; i++) box(3.1, .17, .42, esc, GX, -.085 - i * .17, ZA + .2 + i * .42, scene); box(3.4, 3.4, .5, mat({ color: 0x1a1a1a }), GX, -1.9, ZB + .1, scene);
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
        c.fillStyle = "#1e4a36"; c.textAlign = "center"; c.textBaseline = "middle"; c.font = "bold 112px Georgia, serif"; c.save(); c.translate(w / 2, h / 2 + 6); c.scale(1, 1.15); c.fillText("METROPOLITAIN", 0, 0); c.restore(); });
      const m = mat({ map: t, transparent: true, alphaTest: .5, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: .08 }); const p = pl2(3.2, .7, m, GX, 3.35, ZA + .02, scene); p.rotation.y = Math.PI; lum(m, .08, .9);
      const p2 = pl2(3.2, .7, m, GX, 3.35, ZA - .02, scene); void p2; }
    // au fond, le plan du quartier sous son fronton orange « Abbesses »
    { const t = tT(256, 300, (c, w, h) => { c.fillStyle = "#2e5a44"; c.fillRect(0, 0, w, h); c.fillStyle = "#e8a030"; c.fillRect(10, 10, w - 20, 50); c.fillStyle = "#3a2a10"; c.font = "bold 34px Georgia, serif"; c.textAlign = "center"; c.fillText("Abbesses", w / 2, 47); const g = c.createLinearGradient(0, 70, 0, h); g.addColorStop(0, "#6a9ad8"); g.addColorStop(1, "#c8d8f0"); c.fillStyle = g; c.fillRect(14, 70, w - 28, h - 84); c.strokeStyle = "#fff"; c.lineWidth = 3; for (let i = 0; i < 9; i++) { c.beginPath(); c.moveTo(20 + al() * 200, 80 + al() * 200); c.lineTo(20 + al() * 200, 80 + al() * 200); c.stroke(); } c.fillStyle = "#c81c24"; c.fillRect(110, 170, 20, 12); });
      const p = box(1.15, 1.35, .08, lumT(t, .1, 1), GX, 1.75, ZB - .1); void p; cyl(.04, .04, 1.1, vertG, GX, .55, ZB - .1, scene, 6); }
    OB.push([X0, (ZA + ZB) / 2, .4], [X1, (ZA + ZB) / 2, .4], [GX, ZB, .5]); for (let z = ZA + .4; z < ZB; z += .7) OB.push([GX, z, 1.5]); }
  L.metroAbbesses = { x: GX, z: GZ - 3.2 };
  // les coins de la place, fermés : entre la galerie du Tertre et La Mère Catherine ; au coin sud-ouest
  rangee(15.4, ZN, 1, 0, 0, [[4.1, 12.5, { ...ordinaire(47), jard: true }]]); rangee(-21.5, ZS, 1, 0, Math.PI, [[1.5, 13, { ...ordinaire(48), lanterne: false }]]);

  /* ---------- le bout des rues, vers l'est : fermé par de petites maisons basses (leur boutique, le lierre) ; au-dessus des toits, au loin, les dômes du Sacré-Cœur ---------- */
  rangee(XBUT, 4.5, 0, 1, EST, [[11, 8.6, { teinte: "#f0ece2", volets: "#7a9a6a", etages: 1, lierre: 2, jard: true, rdc: (g, W) => devanture(g, W, { bois: 0x2a4a3a, travees: 4, porte: 1, fondV: "#f0c070", store: ["#2a4a3a", "AU  PIED  DE  LA  BUTTE", "#f2ead8"], storeD: 1.6, guirlande: true }) }],
    [10.5, 9, { teinte: "#e8e0cc", volets: "#f2f2ee", etages: 2, jard: true }], [7, 8.2, { teinte: "#f2efe6", volets: "#6a8a9a", etages: 1, lierre: 1, rdc: (g, W) => devanture(g, W, { bois: 0x8a1418, travees: 3, porte: 1, fondV: "#f0a050", store: ["#b01820", "LE  PETIT  MONTMARTRE", "#f2ead8"], storeD: 1.6, guirlande: true }) }]]);
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
    const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.Float32BufferAttribute(P2, 3)); const pM = new THREE.PointsMaterial({ color: 0x4a7aff, size: .2, sizeAttenuation: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
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
  const TABL = Array.from({ length: 14 }, (_, k) => mat({ map: tT(128, 160, (c, w, h) => { c.fillStyle = "#8a8070"; c.fillRect(0, 0, w, h); toile3(c, 0, 0, w, h, k * 2 + 1); c.strokeStyle = "#4a3418"; c.lineWidth = 5; c.strokeRect(0, 0, w, h); }), roughness: .8 })),   /* (les toiles des peintres : les vrais tableaux) */ boisC = mat({ color: 0x8a6a42, roughness: .7 });
  const parasolC = [0xf4f2ec, 0xf4f2ec, 0xb8202a, 0xf4f2ec, 0x2a5aa8, 0xf4f2ec];
  const parasol = (x, z, k, y0 = YS, R = 1.3) => { cyl(.03, .03, 2.4, mat({ color: 0xd8d8d8, metalness: .5 }), x, y0 + 1.2, z, scene, 6); const c = add(new THREE.ConeGeometry(R, .55, 10, 1, true), mat({ color: parasolC[k % parasolC.length], side: THREE.DoubleSide, roughness: .9 }), x, y0 + 2.5, z); c.castShadow = true; };
  const chevalet = (x, z, ry, k, y0 = YS) => { const g = new THREE.Group(); g.position.set(x, y0, z); g.rotation.y = ry; scene.add(g); for (const sg of [-1, 1]) { const l = box(.035, 1.7, .035, boisC, sg * .28, .82, .05, g); l.rotation.z = -sg * .1; } const ar = box(.035, 1.7, .035, boisC, 0, .8, -.32, g); ar.rotation.x = .35;
    box(.62, .04, .06, boisC, 0, .82, .1, g); const t = box(.56, .7, .03, TABL[k % TABL.length], 0, 1.2, .1, g); t.rotation.x = -.08; return g; };
  let kP = 0; const nPeint = !GENS ? 0 : PETIT ? 3 : (MOBILE || GPU_MODESTE) ? 6 : 10;
  const coin = (x, z, ry, k) => { chevalet(x, z, ry, k); parasol(x - Math.sin(ry) * .6, z - Math.cos(ry) * .6, k);
    for (let i = 0; i < 2; i++) { const px = x + Math.cos(ry) * (1 + i * .5) * (k % 2 ? 1 : -1), pz = z - Math.sin(ry) * (1 + i * .5) * (k % 2 ? 1 : -1), tb = box(.5, .62, .03, TABL[(k * 3 + i + 7) % TABL.length], px, YS + .7, pz); tb.rotation.set(-.2, ry, 0); }   // les toiles à vendre, posées contre
    const pl = new THREE.Group(); pl.position.set(x - Math.sin(ry) * .75, YS, z - Math.cos(ry) * .75); pl.rotation.y = ry; scene.add(pl); box(.4, .04, .34, mat({ color: 0x3a3a3a }), 0, .44, 0, pl); for (const sg of [-1, 1]) { const p = box(.02, .5, .02, fonteM, sg * .16, .22, 0, pl); p.rotation.x = sg * .4; }
    if (kP < nPeint) { const m = gens(kP * 5 + 1, { haut: ["#c8282a", "#2a3a5a", "#5a4636", "#1a1a1c", "#e8e2d6"][kP % 5] }); m.position.copy(pl.position); m.position.y = YS; m.rotation.y = ry; m.userData.poser("assis", 0); scene.add(m); PEINT.push({ m, k: kP }); kP++; }
    OB.push([x, z, .55], [pl.position.x, pl.position.z, .45]); };
  for (const [x, z, ry, k] of [[-11, -7.4, Math.PI * .25, 0], [-7.2, -7.8, 0, 1], [-1.6, -7.6, -.2, 2], [2.4, -7.9, .3, 3], [-6, -2.6, Math.PI, 7], [0.6, -2.4, Math.PI * .8, 8], [-5.6, 3.2, .4, 9], [-1, 7.4, Math.PI, 10], [-8.6, 7.4, Math.PI, 11], [-11.8, 7.0, Math.PI / 2, 5], [11.6, -1.2, -Math.PI / 2, 12], [5.5, -1.5, -.4, 6]]) coin(x, z, ry, k);
  // les panneaux de caricatures et de portraits au fusain
  const portraitsT = tT(256, 192, (c, w, h) => { c.fillStyle = "#f4f0e6"; c.fillRect(0, 0, w, h); for (let i = 0; i < 6; i++) { const x = 10 + (i % 3) * 82, y = 8 + (i / 3 | 0) * 92; c.fillStyle = "#fff"; c.fillRect(x, y, 72, 84); c.strokeStyle = "#2a2a2a"; c.lineWidth = 3; c.beginPath(); c.ellipse(x + 36, y + 38, 16 + (i % 2) * 6, 22, 0, 0, 7); c.stroke(); c.fillStyle = "#2a2a2a"; c.fillRect(x + 28, y + 34, 4, 3); c.fillRect(x + 40, y + 34, 4, 3); c.beginPath(); c.arc(x + 36, y + 50, 6, 0, Math.PI); c.stroke(); c.fillStyle = ["#c83030", "#3050a0", "#e0a020"][i % 3]; c.fillRect(x + 20, y + 62, 32, 14); } });
  for (const [x, z, ry] of [[12.4, 1.5, -Math.PI / 2], [-12.4, -5.2, Math.PI / 2], [-3.4, -8.4, 0], [2.4, 2.4, Math.PI * .75]]) { const g = new THREE.Group(); g.position.set(x, YS, z); g.rotation.y = ry; scene.add(g); box(1.4, 1.05, .04, mat({ map: portraitsT }), 0, 1.15, 0, g); for (const sg of [-1, 1]) box(.04, 1.7, .04, boisC, sg * .66, .85, -.05, g); OB.push([x, z, .7]); }
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
      if (GENS && kT < nTerr + 10 && al() < .55) { const sx = al() < .5 ? -.45 : .45, m = gens(kT + 11); m.position.set(x + sx, YS, z); m.rotation.y = sx < 0 ? Math.PI / 2 : -Math.PI / 2; m.userData.poser("assis", 0); scene.add(m); TERR.push(m); kT++; } }
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
    const blanc = lum(mat({ color: 0xf6f3ea, roughness: .75, emissive: 0xfff2d8, emissiveIntensity: 0, fog: false }), 0, .55), ombre = mat({ color: 0xd8d2c4, roughness: .8, fog: false }), noirA = mat({ color: 0x2a2a30, fog: false });   /* (net, malgré la brume du lointain) */
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
    // le soir, le Sacré-Cœur est éclairé : sa pierre blanche brille sur le ciel noir
    if (!(MOBILE || GPU_MODESTE)) { const sp = new THREE.SpotLight(0xfff0d8, 0, 220, .5, .5, 1); sp.position.set(0, 10, 120); sp.target.position.set(0, 40, -6); g.add(sp); g.add(sp.target); NUIT.push([{ set emissiveIntensity(v) { sp.intensity = v; } }, 0, 1800]); } }

  /* ---------- les promeneurs : les touristes qui font le tour du carré, regardent les peintres, remontent la rue Saint-Éleuthère ---------- */
  const ROUTES = [[[-78, -12.9], [-23, -12.9]], [[-83, -40], [-83, 34]], [[-78, 29], [54, 29]], [[1, 12], [1, 29], [-40, 29]], [[-23, -12], [-60, -12], [-82, -13], [-82, 28], [-20, 28.5]], [[-70, 30.5], [40, 30.5]],[[-16, -12], [16, -12], [16, 12], [-16, 12], [-16, -12]], [[-17, 12.5], [-17, -12.5], [15, -12.5], [15, 12.5], [-17, 12.5]], [[16, 12], [42, 12]], [[1, ZS - .5], [1, 11], [-15, 11], [-15, -11.5]], [[-12.6, -8.6], [12.6, -8.6], [12.6, 2], [-12.6, 2]]];
  for (let k = 0, n = !GENS ? 0 : PETIT ? 8 : (MOBILE || GPU_MODESTE) ? 14 : 36; k < n; k++) { const R = ROUTES[k % ROUTES.length], m = gens(k * 3 + 2), i0 = k % (R.length - 1), u = al(), a = R[i0], b = R[i0 + 1];
    m.position.set(a[0] + (b[0] - a[0]) * u, 0, a[1] + (b[1] - a[1]) * u); m.userData.poser("marche", 0); scene.add(m); MARCH.push({ m, R, i: i0 + 1, sens: 1, v: .8 + (k % 5) * .12 }); }
  // les serveurs, le long des terrasses : tablier blanc, le plateau
  for (const [x, z, ry] of !GENS ? [] : [[XO + 2.3, 4.5, Math.PI / 2], [XO + 2.3, -3.4, Math.PI / 2], [-2, ZN + 2.3, 0], [8.2, 2.8, Math.PI]]) { const m = personne3D({ taille: 1.78, peau: PE[(x * 3 | 0) & 3], ch: "#141010", haut: "#f2f0ea", bas: "#141414", chaussures: "#0a0a0a", coif: "court", pantalon: true }); m.position.set(x, x > 0 && z > 0 ? YS : hTrot(x, z), z); m.rotation.y = ry; scene.add(m); m.userData.poser("debout", 0);
    const P = m.userData.parts; box(.36, .5, .02, mat({ color: 0xffffff }), 0, -.05, .1, P.bassin); P.bras[1].e.rotation.set(-1.2, 0, .3); P.bras[1].c.rotation.x = -1.4; cyl(.18, .18, .02, mat({ color: 0xc8c8c8, metalness: .7 }), .05, -.32, .12, P.bras[1].c, 12); SERV.push(m); }

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
  const a0 = L.anim; L.anim = (tm) => { a0 && a0(tm); const n = !!L.nuit; if (n !== nV) { nV = n; for (const [m, j, nn] of NUIT) m.emissiveIntensity = n ? nn : j; }
    const dt = tp ? Math.min(.1, (tm - tp) / 1000) : 0; tp = tm; const c = M && M.camera && M.camera.position, R2 = ((MOBILE || GPU_MODESTE) ? 30 : 60) ** 2;
    for (const { m, k } of PEINT) { if (c && (m.position.x - c.x) ** 2 + (m.position.z - c.z) ** 2 > R2) continue; m.userData.poser("assis", tm); const P = m.userData.parts, s = Math.sin(tm / 260 + k * 1.7); P.bras[1].e.rotation.set(-1.15 + s * .12, 0, .25); P.bras[1].c.rotation.x = -.5 + Math.cos(tm / 300 + k) * .15; P.tete.rotation.x = Math.sin(tm / 2400 + k) * .12; }   // (le pinceau qui va et vient)
    for (const [k, m] of TERR.entries()) { if (c && (m.position.x - c.x) ** 2 + (m.position.z - c.z) ** 2 > R2) continue; const P = m.userData.parts, b = (tm / 1000 + k * 1.7) % 7; m.userData.poser("assis", tm); if (b < 1.3) { P.bras[1].e.rotation.x = -1.3; P.bras[1].c.rotation.x = -1.9; } else { P.bras[1].e.rotation.x = -.7; P.bras[1].c.rotation.x = -.9; } }
    for (const { m, gui, k } of MUSI) { m.userData.poser(k ? "debout" : "assis", tm); const P = m.userData.parts; if (!k) { P.bras[1].e.rotation.set(-.9, 0, .3); P.bras[1].c.rotation.x = -1.2 + Math.sin(tm / 90) * .25; P.bras[0].e.rotation.set(-1.3, 0, -.6); P.bras[0].c.rotation.x = -1.1; P.tete.rotation.y = Math.sin(tm / 1400) * .3; void gui; }
      else { P.bras[1].e.rotation.set(-2.2 + Math.sin(tm / 500) * .3, 0, .3); P.buste.rotation.z = Math.sin(tm / 600) * .08; P.tete.rotation.x = -.15; } }
    for (const W of MARCH) { const m = W.m, [tx, tz] = W.R[W.i], dx = tx - m.position.x, dz = tz - m.position.z, d = Math.hypot(dx, dz);
      if (d < .15) { if (W.i + W.sens < 0 || W.i + W.sens >= W.R.length) W.sens = -W.sens; W.i += W.sens; continue; }
      const v = Math.min(d, W.v * dt); m.position.x += dx / d * v; m.position.z += dz / d * v; m.position.y = L.hauteur(m.position.x, m.position.z); m.rotation.y = Math.atan2(dx, dz); if (!c || (m.position.x - c.x) ** 2 + (m.position.z - c.z) ** 2 < R2) m.userData.poser("marche", tm * W.v / 1.2); } };
  /* les lampadaires des rues (d'après les photos) : le socle de fonte, le fût cannelé et ses bagues, la lanterne à quatre pans, son chapeau ; de loin en loin, sur le bord des trottoirs */
  { const fonteL = mat({ color: 0x1e2220, roughness: .45, metalness: .55 }), verreL = lum(mat({ color: 0xfff0d0, emissive: 0xffc870, emissiveIntensity: .06, roughness: .2 }), .06, 2.6);
    const lampadaire = (x, z) => { cyl(.17, .22, .55, fonteL, x, .3, z, scene, 8); cyl(.1, .12, .12, fonteL, x, .62, z, scene, 8); cyl(.06, .085, 3.0, fonteL, x, 2.1, z, scene, 8); for (const y of [1.2, 3.1]) cyl(.1, .1, .07, fonteL, x, y, z, scene, 8);
      cyl(.13, .06, .25, fonteL, x, 3.7, z, scene, 8); const v = add(new THREE.CylinderGeometry(.24, .15, .5, 4), verreL, x, 4.08, z); v.rotation.y = Math.PI / 4; const t = add(new THREE.ConeGeometry(.3, .28, 4), fonteL, x, 4.47, z); t.rotation.y = Math.PI / 4; cyl(.025, .025, .18, fonteL, x, 4.68, z, scene, 4);
      OB.push([x, z, .25]); HALO.push([x, 4.08, z, 1.7]); flaque(x, z, 3.8, .13); };
    for (let x = -76; x < -24; x += 13) lampadaire(x, ZNo1 - .55);   // rue Norvins
    for (let z = -38; z < ZSa1 - 4; z += 13) lampadaire(XSa1 - .55, z);   // rue des Saules
    for (let x = -72, k = 0; x < XBUT - 4; x += 12, k++) lampadaire(x, k % 2 ? ZRu0 + .55 : ZRu1 - .55);   // rue Saint-Rustique
    for (let x = XE + 6; x < XBUT - 4; x += 12) lampadaire(x, 9.55); }   // rue Saint-Éleuthère
  { const hT = tT(64, 64, (c, w, h) => { const g = c.createRadialGradient(32, 32, 1, 32, 32, 31); g.addColorStop(0, "rgba(255,236,190,1)"); g.addColorStop(.25, "rgba(255,190,110,.55)"); g.addColorStop(1, "rgba(255,150,70,0)"); c.fillStyle = g; c.fillRect(0, 0, w, h); });
    const pos = new Float32Array(HALO.length * 3); HALO.forEach(([x, y, z], i) => pos.set([x, y, z], i * 3)); const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const hM = new THREE.PointsMaterial({ map: hT, size: 2.8, sizeAttenuation: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0, fog: false }), pts = new THREE.Points(geo, hM); pts.frustumCulled = false; pts.visible = false; scene.add(pts);
    const amb = new THREE.AmbientLight(0xff9a50, 0); scene.add(amb);   // (le soir, une lumière ambiante orangée, chaleureuse, sur toutes les façades)
    NUIT.push([{ set emissiveIntensity(v) { pts.visible = v > 0; hM.opacity = v; flaqueM.opacity = v * .85; amb.intensity = v * .45; } }, 0, 1]); }
  /* la musique : l'accordéon, en boucle, tant qu'on est à Montmartre ; elle monte doucement, s'arrête quand on repart */
  L.sansMusique = true;
  { const a0 = L.anim; L.anim = (tm) => { a0 && a0(tm); if (!M || M.L !== L) return; const A2 = (window.__accordeon = window.__accordeon || Object.assign(new Audio("sons/montmartre-accordeon.mp3"), { loop: true, preload: "auto" }));
      if (A2.paused && !A2._essai && !A2._attente) { A2._essai = true; A2.volume = 0; A2.play().then(() => { A2._essai = false; }).catch(() => { A2._essai = false; A2._attente = true; }); }
      if (A2._attente && !A2._ecoute) { A2._ecoute = true; const go = () => { A2._attente = false; A2._ecoute = false; if (M && M.L === L) A2.play().catch(() => {}); removeEventListener("pointerdown", go); removeEventListener("keydown", go); }; addEventListener("pointerdown", go); addEventListener("keydown", go); }
      if (!A2.paused) try { A2.volume = Math.min(.5, A2.volume + .006); } catch (e) {} };
    quitterLieu.add(() => { const A2 = window.__accordeon; if (A2) { A2.pause(); try { A2.currentTime = 0; } catch (e) {} } }); }
  /* les pigeons : des petites bandes qui picorent entre les pavés ; on s'approche, ils s'envolent sur les toits, et reviennent un peu plus tard */
  { const G = geoPigeon(), pm = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .75 }), pi = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .35, metalness: .25 }), PG = [];
    const BANDES = [[-4, 4.5, 6], [6, -2, 5], [-16, -4, 4], [-50, -13, 4], [-83, 6, 4], [-20, 29, 5], [30, 12, 3]];
    for (const [bx, bz, n] of BANDES) for (let k = 0; k < ((PETIT || MOBILE || GPU_MODESTE) ? Math.min(n, 2) : n); k++) { const g = new THREE.Group(), c = new THREE.Mesh(G.corps, pm), t = new THREE.Mesh(G.tete, pi), aG = new THREE.Mesh(G.aileG, pm), aD = new THREE.Mesh(G.aileD, pm);
      t.position.set(0, .2, .1); aG.position.set(-.06, .19, .04); aD.position.set(.06, .19, .04); g.add(c, t, aG, aD); g.scale.setScalar(.9 + al() * .2); g.userData.anime = true;
      const hx = bx + (al() - .5) * 3, hz = bz + (al() - .5) * 3; g.position.set(hx, L.hauteur(hx, hz), hz); g.rotation.y = al() * 6.28; scene.add(g);
      PG.push({ g, t, aG, aD, hx, hz, etat: "sol", fin: 0, ph: al() * 10, cible: null }); }
    let tp = 0; const a0 = L.anim; L.anim = (tm) => { a0 && a0(tm); const dt = tp ? Math.min(.1, (tm - tp) / 1000) : 0; tp = tm; const moi = M && M.moiNum && M.gens.get(M.moiNum), q = moi && moi.g.position, c = M && M.camera && M.camera.position;
      for (const P of PG) { const g = P.g; const loin = c && (g.position.x - c.x) ** 2 + (g.position.z - c.z) ** 2 > 1600; g.visible = !loin || P.etat !== "sol"; if (loin && P.etat === "sol") continue;   /* (au loin : ni dessinés ni animés) */
        if (P.etat === "sol") { if (q && Math.hypot(q.x - g.position.x, q.z - g.position.z) < 2.6) { const a = Math.atan2(g.position.z - q.z, g.position.x - q.x) + (al() - .5); P.etat = "vol"; P.t = 0; P.P0 = g.position.clone(); P.P1 = new THREE.Vector3(g.position.x + Math.cos(a) * 12, 12 + al() * 3, g.position.z + Math.sin(a) * 12); P.fin = tm + 12000 + al() * 12000; continue; }
          const s = Math.sin(tm / 260 + P.ph); P.t.rotation.x = s > .6 ? .7 : 0; if (al() < dt * .5) g.rotation.y += (al() - .5) * 2; if (s < -.5) { g.position.x += Math.sin(g.rotation.y) * dt * .25; g.position.z += Math.cos(g.rotation.y) * dt * .25; if (Math.hypot(g.position.x - P.hx, g.position.z - P.hz) > 2.5) g.rotation.y += Math.PI; g.position.y = L.hauteur(g.position.x, g.position.z); } P.aG.rotation.z = P.aD.rotation.z = 0; }
        else if (P.etat === "vol" || P.etat === "retour") { P.t += dt / 2.2; const u = Math.min(1, P.t), A = P.P0, B = P.P1; g.position.set(A.x + (B.x - A.x) * u, A.y + (B.y - A.y) * u + Math.sin(u * Math.PI) * 1.5, A.z + (B.z - A.z) * u); g.rotation.y = Math.atan2(B.x - A.x, B.z - A.z);
          const b = Math.sin(tm / 45) * .9; P.aG.rotation.z = b; P.aD.rotation.z = -b; if (u >= 1) { P.etat = P.etat === "vol" ? "toit" : "sol"; P.aG.rotation.z = P.aD.rotation.z = 0; } }
        else if (P.etat === "toit" && tm > P.fin && (!q || Math.hypot(q.x - P.hx, q.z - P.hz) > 6)) { P.etat = "retour"; P.t = 0; P.P0 = g.position.clone(); const x = P.hx + (al() - .5) * 2, z = P.hz + (al() - .5) * 2; P.P1 = new THREE.Vector3(x, L.hauteur(x, z), z); } } }; }
  /* (fluidité) à Montmartre, pas d'ombres portées : la place et ses rues, avec toutes leurs maisons, coûtaient deux fois plus cher à dessiner */
  { let coupe = null; const a0 = L.anim; L.anim = (tm) => { a0 && a0(tm); if (!M || M.L !== L || coupe) return; coupe = []; scene.traverse(o => { if (o.isLight && o.castShadow) { o.castShadow = false; coupe.push(o); } }); };
    quitterLieu.add(() => { if (coupe) for (const o of coupe) o.castShadow = true; coupe = null; }); }
  /* (fluidité) les maisons, les devantures, les lanternes étaient rangées en groupes : chaque pièce se dessinait à part (plus de 2 000 dessins par image).
     On les sort de leurs groupes, à leur place exacte, pour que tout ce qui se ressemble soit fondu en une seule pièce */
  { const garder = new Set(); scene.updateMatrixWorld(true);
    for (const g of scene.children.slice()) { if (!g.isGroup || garder.has(g) || g.userData.anime) continue; const ms = []; g.traverse(o => { if (o.isMesh && !o.isSkinnedMesh) ms.push(o); }); for (const m of ms) scene.attach(m); if (!g.children.some(c => c.isMesh || c.isGroup || c.isLight)) scene.remove(g); } }
  /* (diagnostic, le temps de trouver ce qui fige la marche sur téléphone : une petite ligne en bas à droite) */
  /* (et l'on guette qui déplace notre bonhomme en dehors de son pas : la première ligne de la pile de l'appel) */
  const guetter = (q) => { if (q.__guet) return; q.__guet = true; for (const k of ["x", "z"]) { let v = q[k]; Object.defineProperty(q, k, { get: () => v, set: (n) => { if (!M.dansPas && Math.abs(n - v) > .02 && M.L === L) { const st = (new Error().stack || "").split("\n").slice(2, 5).map(l => l.trim().replace(/https?:\/\/[^/]+\//, "").slice(0, 60)).join(" < "); M.dbgQui = { t: performance.now(), k, d: n - v, st }; } v = n; }, configurable: true }); } };
  { let el = null, tD = 0; const a0 = L.anim; L.anim = (tm) => { a0 && a0(tm); if (!M || M.L !== L) { if (el) { el.remove(); el = null; } return; } if (tm - tD < 250) return; tD = tm;
      if (!el) { el = document.createElement("div"); el.style.cssText = "position:absolute;right:6px;bottom:6px;z-index:40;pointer-events:none;background:rgba(0,0,0,.6);color:#fff;font:11px monospace;padding:4px 6px;border-radius:6px;max-width:92%;white-space:pre-wrap"; (M.ctx.conteneur || document.body).appendChild(el); quitterLieu.add(() => { if (el) { el.remove(); el = null; } }); }
      const p = M.gens.get(M.moiNum), q = p && p.g.position, T = M.dbgTap, A = M.dbgAller, now = performance.now(); if (q) guetter(q); const Q = M.dbgQui;
      el.textContent = (q ? `pos ${q.x.toFixed(1)} ${q.z.toFixed(1)} ${L.limites(q.x, q.z) ? "ok" : "HORS"}` : "pas de bonhomme") + ` cine ${M.cine ? "OUI" : "non"}\n` +
        `doigt: ${T ? T.r + " il y a " + ((now - T.t) / 1000).toFixed(0) + "s" : "-"}\naller: ${A ? A.x.toFixed(1) + " " + A.z.toFixed(1) + " il y a " + ((now - A.t) / 1000).toFixed(0) + "s" + (A.cine ? " (cine)" : "") : "-"}\n` +
        `cible ${p && p.cible ? p.cible.x.toFixed(1) + " " + p.cible.z.toFixed(1) : "aucune"} vit ${p ? (p.vit || 0).toFixed(1) : "-"} bloq ${p ? p.bloqueN || 0 : "-"}` + (M.dbgPas ? `\npas ${M.dbgPas.pas.toFixed(3)} ok ${M.dbgPas.pasOk.toFixed(3)} dt ${M.dbgPas.dt.toFixed(3)} n ${M.dbgPas.n} ${M.dbgPas.meme ? "même" : "AUTRE"} moi×${M.dbgPas.nMoi} soi ${M.dbgSoi || 0}` : "") + `\nimages ${((M.dbgImg || 0) - (el.img0 || 0)) * 4}/s dessins ${((M.dbgRendu || 0) - (el.r0 || 0)) * 4}/s${M.ctxPerdu ? " CARTE PERDUE" : ""}` + (M.dbgErr ? `\nerreur ×${M.dbgErr.n} il y a ${((now - M.dbgErr.t) / 1000).toFixed(0)}s: ${M.dbgErr.m} @ ${M.dbgErr.l}` : "") + (Q ? `\nbougé par (${Q.k} ${Q.d.toFixed(2)}, il y a ${((now - Q.t) / 1000).toFixed(0)}s): ${Q.st}` : ""); el.img0 = M.dbgImg || 0; el.r0 = M.dbgRendu || 0; }; }
  fusionStatique(scene, L, 0);   // (tout ce qui ne bouge pas, regroupé : fluide sur téléphone)
}
({ construireTertre })
