/* (10.190) La place des Vosges, à Paris (d'après les images) : le carré parfait des trente-six pavillons de brique rouge et de pierre blanche, leurs hauts toits d'ardoise,
   les lucarnes, les grandes cheminées ; au rez-de-chaussée, les arcades et leurs boutiques ; au milieu du côté sud, le pavillon du Roi, au nord, le pavillon de la Reine ;
   le square Louis-XIII : la statue équestre du roi, les quatre fontaines, les pelouses, les tilleuls, la grille noire aux pointes dorées ; les pavés, les réverbères, les fiacres ;
   et, au numéro 6, la maison où vécut Victor Hugo. On y arrive par le vieux livre d'un bouquiniste des quais, ou en métro (Bastille).
   Chargé par la matrice (eval direct) la première fois qu'on y va. */
function construireVosges(A, L, scene) {
  const ECH = PETIT ? .5 : (MOBILE || GPU_MODESTE) ? .7 : 1, PEU = PETIT || MOBILE || GPU_MODESTE;
  let graine = 1832; const al = () => (graine = (graine * 16807) % 2147483647) / 2147483647;
  const tT = (w, h, f, rx, ry) => { const c = document.createElement("canvas"); c.width = Math.max(8, Math.round(w * ECH)); c.height = Math.max(8, Math.round(h * ECH)); const x = c.getContext("2d"); x.scale(c.width / w, c.height / h); f(x, w, h);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; if (rx) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry || 1); } return t; };
  const mat = (o) => new THREE.MeshStandardMaterial({ roughness: .85, ...o });
  const add = (geo, m, x, y, z, ry = 0, par = scene) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.y = ry; o.receiveShadow = true; par.add(o); return o; };
  const box = (w, h, d, m, x, y, z, ry = 0, par) => add(new THREE.BoxGeometry(w, h, d), m, x, y, z, ry, par);
  const cyl = (rt, rb, h, m, x, y, z, seg = 10, par) => add(new THREE.CylinderGeometry(rt, rb, h, seg), m, x, y, z, 0, par);
  const plan = (x0, x1, z0, z1, m, y) => { const s = add(new THREE.PlaneGeometry(x1 - x0, z1 - z0), m, (x0 + x1) / 2, y, (z0 + z1) / 2); s.rotation.x = -Math.PI / 2; return s; };
  L.nuitObjets = L.nuitObjets || []; L.silhouettes = L.silhouettes || []; const NUIT = [], AMB = [], LAMPES = [], OBS = [];
  const sousTitre = (nom, texte, ms = 4000) => { const C = (M && M.ctx && M.ctx.conteneur) || document.body; if (L.stEl) L.stEl.remove(); const d = document.createElement("div"); L.stEl = d;
    d.style.cssText = "position:absolute;left:50%;bottom:17%;transform:translateX(-50%);z-index:58;width:min(88vw,760px);text-align:center;pointer-events:none;color:#ffb627;font:700 20px/1.35 Lato,Arial,sans-serif;text-shadow:0 2px 4px rgba(0,0,0,.9),0 0 12px rgba(0,0,0,.6)";
    d.innerHTML = (nom ? `<span style="color:#ffe08a">${nom} :</span> ` : "") + texte; C.appendChild(d); setTimeout(() => { if (d.parentNode) d.remove(); if (L.stEl === d) L.stEl = null; }, ms); return d; };
  L.sousTitre = sousTitre;
  const serif = "Georgia, 'Times New Roman', serif";
  // les repères : la façade des arcades à 56 m du centre ; la grille du square à 40 m ; la chaussée pavée entre les deux
  const FA = 56, GR = 40, PROF = 14;

  /* ---------- le sol : les pavés de la chaussée, le trottoir sous les arcades, le sable du square ---------- */
  const paveM = mat({ map: tT(256, 256, (c, w, h) => { c.fillStyle = "#56524c"; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 16) for (let x = (y / 16 % 2) * 10; x < w; x += 20) { const k = 100 + al() * 40; c.fillStyle = `rgb(${k},${k - 4},${k - 10})`; c.beginPath(); c.roundRect ? c.roundRect(x + 1, y + 1, 18, 14, 4) : c.rect(x + 1, y + 1, 18, 14); c.fill(); } }, 70, 70), roughness: .95 });
  plan(-90, 90, -90, 90, paveM, 0); L.sol = true;
  const trottM = mat({ map: tT(128, 128, (c, w, h) => { c.fillStyle = "#b4aa98"; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 32) for (let x = 0; x < w; x += 64) { c.strokeStyle = "rgba(80,70,60,.35)"; c.strokeRect(x, y, 64, 32); } for (let i = 0; i < 500; i++) { c.fillStyle = `rgba(90,80,70,${al() * .12})`; c.fillRect(al() * w, al() * h, 2, 2); } }, 1, 1), roughness: .9 });
  { const tr = (x0, x1, z0, z1) => { const g = new THREE.BoxGeometry(x1 - x0, .14, z1 - z0), uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (x1 - x0) / 4, uv.getY(i) * (z1 - z0) / 4); add(g, trottM, (x0 + x1) / 2, .07, (z0 + z1) / 2); };
    tr(-FA, FA, -FA, -FA + 3.4); tr(-FA, FA, FA - 3.4, FA); tr(-FA, -FA + 3.4, -FA + 3.4, FA - 3.4); tr(FA - 3.4, FA, -FA + 3.4, FA - 3.4); }
  const TROT = .14, surTrott = (x, z) => Math.max(Math.abs(x), Math.abs(z)) > FA - 3.4;
  const sableM = mat({ map: tT(256, 256, (c, w, h) => { c.fillStyle = "#d8c8a4"; c.fillRect(0, 0, w, h); for (let i = 0; i < 4000; i++) { const k = 170 + al() * 60; c.fillStyle = `rgba(${k},${k - 14},${k - 40},.5)`; c.fillRect(al() * w, al() * h, 2, 2); } }, 26, 26), roughness: 1 });
  plan(-GR, GR, -GR, GR, sableM, .02);
  // les pelouses : quatre quartiers, le rond de la statue au milieu, le rond de chaque fontaine
  const herbeM = mat({ map: tT(256, 256, (c, w, h) => { c.fillStyle = "#4f7a34"; c.fillRect(0, 0, w, h); for (let i = 0; i < 9000; i++) { const g = 90 + al() * 70; c.fillStyle = `rgba(${g * .55},${g},${g * .35},.5)`; c.fillRect(al() * w, al() * h, 1, 3); } for (let i = 0; i < 160; i++) { c.fillStyle = ["#f4f0e0", "#f2d84a", "#e8e0f0"][i % 3]; c.fillRect(al() * w, al() * h, 2, 2); } }, 1, 1), roughness: 1, side: THREE.DoubleSide });
  const FONT = [[-19, -19], [19, -19], [-19, 19], [19, 19]];
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const x0 = 3.2, x1 = 35, yA = Math.sqrt(11.5 * 11.5 - x0 * x0), sh = new THREE.Shape(); sh.moveTo(x0, yA); sh.lineTo(x0, x1); sh.lineTo(x1, x1); sh.lineTo(x1, x0); sh.lineTo(yA, x0); sh.absarc(0, 0, 11.5, Math.atan2(x0, yA), Math.atan2(yA, x0), false);
    const ho = new THREE.Path(); ho.absarc(19, 19, 6.2, 0, Math.PI * 2, true); sh.holes.push(ho); const g = new THREE.ShapeGeometry(sh, 24); g.rotateX(Math.PI / 2); g.scale(sx, 1, sz);
    const uv = g.attributes.uv, p = g.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, p.getX(i) / 6, p.getZ(i) / 6);
    add(g, herbeM, 0, .04, 0);
    // la petite bordure en arceaux, autour de chaque pelouse
    const arcM = mat({ color: 0x1e3a2a, roughness: .5, metalness: .4 }), pts = [[x0, 11.5], [x0, x1], [x1, x1], [x1, x0], [11.5, x0]];
    for (let k = 0; k < pts.length - 1; k++) { const [a1, b1] = pts[k], [a2, b2] = pts[k + 1], l = Math.hypot(a2 - a1, b2 - b1); for (let t = 0; t < l; t += PEU ? 1.6 : .8) { const x = (a1 + (a2 - a1) * t / l) * sx, z = (b1 + (b2 - b1) * t / l) * sz, r = new THREE.Mesh(new THREE.TorusGeometry(.32, .018, 4, 8, Math.PI), arcM); r.position.set(x, .06, z); r.rotation.y = Math.atan2(a2 - a1, b2 - b1) * (sx * sz > 0 ? 1 : -1) + Math.PI / 2; scene.add(r); } } }

  /* ---------- les façades : la brique rouge, les chaînes de pierre blanche autour des fenêtres, les arcades et leurs boutiques ; le soir, les fenêtres allumées ---------- */
  const PX = 32;   // (pixels par mètre)
  const dessFac = (W, H, royal, nuit, graineF) => (c, w, h) => { let g2 = graineF; const a2 = () => (g2 = (g2 * 16807) % 2147483647) / 2147483647; const X = (m) => m * PX, Y = (m) => h - m * PX;
    if (nuit) { c.fillStyle = "#000"; c.fillRect(0, 0, w, h); }
    else { c.fillStyle = "#b0503a"; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 5) for (let x = (y / 5 % 2) * 6; x < w; x += 12) { const k = a2() * 30; c.fillStyle = `rgb(${165 + k},${74 + k * .5},${52 + k * .3})`; c.fillRect(x, y, 11, 4); } }
    const pierre = (x, y, ww, hh) => { if (nuit) return; c.fillStyle = "#e2d5bc"; c.fillRect(X(x), Y(y + hh), ww * PX, hh * PX); c.strokeStyle = "rgba(120,104,80,.35)"; c.lineWidth = 1; for (let yy = y; yy < y + hh; yy += .55) { c.beginPath(); c.moveTo(X(x), Y(yy)); c.lineTo(X(x + ww), Y(yy)); c.stroke(); } };
    const nb = Math.round(W / 4), haut = royal ? 18 : 14;
    // le rez-de-chaussée : le soubassement de pierre et les arcades
    pierre(0, 0, W, 5.8);
    for (let i = 0; i < nb; i++) { const cx = i * 4 + 2, grand = royal && (i === nb / 2 - 1 || i === nb / 2);
      if (royal && i === nb / 2) continue;
      const lw = grand ? 6.4 : 3, xa = grand ? W / 2 - 3.2 : cx - 1.5, hp = grand ? 5.4 : 3.2, r = lw / 2;
      c.beginPath(); c.moveTo(X(xa), Y(0)); c.lineTo(X(xa), Y(hp)); c.arc(X(xa + r), Y(hp), r * PX, Math.PI, 0); c.lineTo(X(xa + lw), Y(0)); c.closePath();
      if (nuit) { c.fillStyle = grand ? "#1a1208" : "#3a2410"; c.fill(); } else { c.fillStyle = "#2a2018"; c.fill(); c.strokeStyle = "#b8a88a"; c.lineWidth = 6; c.stroke(); }
      if (!grand) { // la boutique, au fond de l'arcade
        const cols = ["#5a1e1e", "#1e3a2a", "#2a2a40", "#4a3018", "#6a5020"], col = cols[Math.floor(a2() * cols.length)];
        c.save(); c.clip(); if (!nuit) { c.fillStyle = col; c.fillRect(X(xa + .3), Y(3.4), (lw - .6) * PX, 3.4 * PX); c.fillStyle = "#c8b890"; c.fillRect(X(xa + .5), Y(3.2), (lw - 1) * PX, .4 * PX); c.fillStyle = "#e8d8a8"; c.fillRect(X(xa + .6), Y(2.6), (lw - 1.2) * PX, 1.7 * PX); for (let k = 1; k < 4; k++) { c.fillStyle = col; c.fillRect(X(xa + .6 + k * (lw - 1.2) / 4) - 1, Y(2.6), 2, 1.7 * PX); } c.fillStyle = "#e8c8a0"; c.fillRect(X(cx - .6), Y(4.6), 1.2 * PX, .7 * PX); }
        else if (a2() < .8) { const gr = c.createLinearGradient(0, Y(3.2), 0, Y(0)); gr.addColorStop(0, "#ffcf80"); gr.addColorStop(1, "#a86a28"); c.fillStyle = gr; c.fillRect(X(xa + .4), Y(3.2), (lw - .8) * PX, 3.2 * PX); }
        c.restore(); }
      else if (!nuit) { c.save(); c.clip(); c.fillStyle = "#3a3026"; c.fillRect(X(xa), Y(hp + r), lw * PX, (hp + r) * PX); c.fillStyle = "#c8bca0"; c.fillRect(X(xa + 1), Y(1.2), (lw - 2) * PX, 1.2 * PX); c.restore(); }   // (le grand passage voûté du pavillon royal : on voit la rue derrière)
    }
    if (!nuit) { c.fillStyle = "#cfc0a2"; c.fillRect(0, Y(6.1), w, .3 * PX); }
    // les étages : les chaînes de pierre autour des fenêtres, la brique entre elles
    const etg = royal ? [[6.6, 3.6], [11, 3.2], [14.8, 2.6]] : [[6.6, 3.5], [10.8, 2.8]];
    for (let i = 0; i < nb; i++) { const cx = i * 4 + 2;
      if (!nuit) { pierre(cx - 1.15, 6.1, 2.3, haut - 6.6); c.fillStyle = "#b0503a"; for (let yy = 6.4; yy < haut - .6; yy += 1.1) { if (((yy * 10) | 0) % 2) { c.fillRect(X(cx - 1.15), Y(yy + .5), .22 * PX, .5 * PX); c.fillRect(X(cx + .93), Y(yy + .5), .22 * PX, .5 * PX); } } }
      for (const [y0, hh] of etg) { const xw = cx - .7, ww = 1.4;
        if (nuit) { const lit = a2() < .42; if (lit) { c.fillStyle = ["#ffd890", "#ffc870", "#ffe0a8"][Math.floor(a2() * 3)]; c.fillRect(X(xw + .08), Y(y0 + hh - .08), (ww - .16) * PX, (hh - .16) * PX); c.fillStyle = "#000"; c.fillRect(X(cx) - 1, Y(y0 + hh), 2, hh * PX); for (let yy = y0 + .7; yy < y0 + hh; yy += .7) c.fillRect(X(xw), Y(yy), ww * PX, 2); } continue; }
        c.fillStyle = "#c8b898"; c.fillRect(X(xw - .12), Y(y0 + hh + .12), (ww + .24) * PX, (hh + .24) * PX);
        const gr = c.createLinearGradient(0, Y(y0 + hh), 0, Y(y0)); gr.addColorStop(0, "#5a6a7a"); gr.addColorStop(1, "#2a3440"); c.fillStyle = gr; c.fillRect(X(xw), Y(y0 + hh), ww * PX, hh * PX);
        c.fillStyle = "#f0ece2"; c.fillRect(X(cx) - 2, Y(y0 + hh), 4, hh * PX); for (let yy = y0 + .7; yy < y0 + hh; yy += .7) c.fillRect(X(xw), Y(yy), ww * PX, 3); c.fillRect(X(xw), Y(y0 + hh), 3, hh * PX); c.fillRect(X(xw + ww) - 3, Y(y0 + hh), 3, hh * PX);
        if (y0 < 7) { c.strokeStyle = "#1a1a1a"; c.lineWidth = 2; c.strokeRect(X(xw - .1), Y(y0 + .9), (ww + .2) * PX, .9 * PX); for (let xx = xw; xx < xw + ww; xx += .16) { c.beginPath(); c.moveTo(X(xx), Y(y0 + .9)); c.lineTo(X(xx), Y(y0)); c.stroke(); } }   // (le petit garde-corps de fer)
        c.fillStyle = "#e8dcc4"; c.fillRect(X(xw - .25), Y(y0 + hh + .4), (ww + .5) * PX, .28 * PX); } }
    if (!nuit) { pierre(0, haut - .7, W, .7); c.fillStyle = "#cfc0a2"; c.fillRect(0, 0, w, Y(haut - .25)); }
  };
  const facCache = new Map(), facM = (W, royal, k) => { const cle = W + "|" + royal + "|" + k; if (facCache.has(cle)) return facCache.get(cle); const H = royal ? 18 : 14, s = 1832 + k * 97 + (royal ? 7 : 0);
    const t = tT(W * PX, H * PX, dessFac(W, H, royal, false, s)), te = tT(W * PX, H * PX, dessFac(W, H, royal, true, s)); const m = mat({ map: t, roughness: .9, emissive: 0xffffff, emissiveMap: te, emissiveIntensity: 0 }); NUIT.push([m, 0, 1]); facCache.set(cle, m); return m; };
  const briqueM = mat({ color: 0xa84c38, roughness: .95 }), pierreM = mat({ color: 0xe0d4ba, roughness: .9 });
  const ardoiseT = tT(256, 256, (c, w, h) => { c.fillStyle = "#4e5866"; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 16) for (let x = (y / 16 % 2) * 8; x < w; x += 16) { const k = al() * 26; c.fillStyle = `rgb(${82 + k},${92 + k},${108 + k})`; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 15, y); c.lineTo(x + 15, y + 11); c.quadraticCurveTo(x + 7.5, y + 16, x, y + 11); c.closePath(); c.fill(); c.strokeStyle = "rgba(30,34,40,.5)"; c.stroke(); } }, 1, 1);
  ardoiseT.wrapS = ardoiseT.wrapT = THREE.RepeatWrapping; const ardoiseM = mat({ map: ardoiseT, roughness: .55, metalness: .15, side: THREE.DoubleSide });
  const zincM = mat({ color: 0x8a929a, roughness: .4, metalness: .5 });
  // le toit en croupe d'un pavillon : deux longs pans et deux petits, à la française
  const toitG = (W, D, Hr, inset) => { const a = [-W / 2, 0, -D / 2], b = [W / 2, 0, -D / 2], cc = [W / 2, 0, D / 2], d = [-W / 2, 0, D / 2], r1 = [-W / 2 + inset, Hr, 0], r2 = [W / 2 - inset, Hr, 0];
    const tri = [d, cc, r2, d, r2, r1, b, a, r1, b, r1, r2, a, d, r1, cc, b, r2], pos = new Float32Array(tri.length * 3), uv = new Float32Array(tri.length * 2);
    tri.forEach((p, i) => { pos.set(p, i * 3); const pente = Math.abs(p[2]) > .01 || p[1] > 0 ? Math.hypot(D / 2 - Math.abs(p[2]), p[1]) : 0; uv[i * 2] = (p[0] + p[2]) / 3; uv[i * 2 + 1] = (p[1] * 1.15 + (D / 2 - Math.abs(p[2])) * .3) / 3; void pente; });
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); g.computeVertexNormals(); return g; };
  const lucM = mat({ color: 0xe8dcc4, roughness: .8 }), vitreL = mat({ color: 0x2a3440, roughness: .2, metalness: .3, emissive: 0xffd890, emissiveIntensity: 0 }); NUIT.push([vitreL, 0, .5]);
  // un pavillon : la façade sur la place (devant, z local +), la façade arrière, la toiture et ses lucarnes, les cheminées
  const pavillon = (cx, cz, ry, W, royal, k, hugo = false) => { const G = new THREE.Group(); G.position.set(cx, 0, cz); G.rotation.y = ry; scene.add(G); const H = royal ? 18 : 14, D = PROF;
    const fm = facM(W, royal, k % 3); const av = new THREE.Mesh(new THREE.PlaneGeometry(W, H), fm); av.position.set(0, H / 2, D / 2); G.add(av);
    const ar = new THREE.Mesh(new THREE.PlaneGeometry(W, H), facM(W, royal, (k + 1) % 3)); ar.position.set(0, H / 2, -D / 2); ar.rotation.y = Math.PI; G.add(ar);
    const Hr = royal ? 10 : 7.5, t = new THREE.Mesh(toitG(W + .5, D + .6, Hr, royal ? D * .45 : D * .38), ardoiseM); t.position.y = H; G.add(t);
    box(W - D * .76 + .2, .25, .3, zincM, 0, H + Hr + .1, 0, 0, G);   // (le faîtage)
    box(W + .6, .45, D + .7, pierreM, 0, H - .05, 0, 0, G);   // (la corniche)
    const nb = Math.round(W / 4); for (const s of [1, -1]) for (let i = 0; i < nb; i++) { if (PEU && i % 2) continue; const x = -W / 2 + 2 + i * 4, z = s * (D / 2 - 1.3), y = H + 1.8, L2 = new THREE.Group(); L2.position.set(x, y, z); L2.rotation.y = s > 0 ? 0 : Math.PI; G.add(L2);
      box(1.5, 2, 1.6, lucM, 0, 0, -.3, 0, L2); box(1, 1.45, .05, vitreL, 0, -.05, .51, 0, L2); const fr = box(1.9, .7, 1.9, ardoiseM, 0, 1.25, -.3, 0, L2); fr.scale.set(1, 1, 1); const pd = new THREE.Mesh(new THREE.CylinderGeometry(0, 1.05, .8, 4, 1), ardoiseM); pd.rotation.y = Math.PI / 4; pd.scale.set(1.05, 1, 1.1); pd.position.set(0, 1.4, -.3); L2.add(pd); }
    for (const sx of [-1, 1]) { const x = sx * (W / 2 - 1.4), hC = H + Hr + (royal ? 3 : 2.6); box(1.3, hC - H, 2.6, briqueM, x, H + (hC - H) / 2, 0, 0, G); box(1.6, .3, 2.9, pierreM, x, hC + .15, 0, 0, G); for (const dz of [-.8, 0, .8]) cyl(.12, .14, .5, mat({ color: 0xa8604a }), x, hC + .5, dz, 6, G); }
    if (hugo) G.userData.hugo = true;
    OBS.push(null); return G; };
  // les quatre côtés : sept pavillons de 16 m chacun ; au milieu du sud, le pavillon du Roi ; au milieu du nord, le pavillon de la Reine ; aux quatre coins, le pavillon d'angle
  for (let i = 0; i < 7; i++) { const u = -FA + 8 + i * 16, royal = i === 3;
    pavillon(u, -FA - PROF / 2, 0, 16, royal, i);                     // le nord (la façade regarde le sud, vers le square)
    pavillon(u, FA + PROF / 2, Math.PI, 16, royal, i + 3, i === 5);   // le sud (le pavillon du Roi au milieu ; la maison de Victor Hugo, le numéro 6, vers l'est)
    pavillon(-FA - PROF / 2, u, Math.PI / 2, 16, false, i + 5);      // l'ouest
    pavillon(FA + PROF / 2, u, -Math.PI / 2, 16, false, i + 1); }    // l'est
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const cx = sx * (FA + PROF / 2), cz = sz * (FA + PROF / 2); box(PROF, 14, PROF, briqueM, cx, 7, cz); const t = new THREE.Mesh(toitG(PROF + .6, PROF + .6, 7.5, PROF * .5), ardoiseM); t.position.set(cx, 14, cz); scene.add(t); box(1.3, 11, 2.4, briqueM, cx, 19, cz); }
  // les arcades : les piliers de pierre devant la façade, qui donnent du relief (on voit l'ombre sous les voûtes)
  { const pilG = new THREE.BoxGeometry(.9, 5.6, .7); const pils = []; for (let i = 0; i <= 28; i++) { const u = -FA + i * 4; if (Math.abs(u) > FA - .2) continue; if (u !== 0) pils.push([u, FA - .3, 0], [u, -FA + .3, 0]); pils.push([FA - .3, u, 1], [-FA + .3, u, 1]); }
    const im = new THREE.InstancedMesh(pilG, pierreM, pils.length), mm = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(); pils.forEach(([x, z, r], i) => { q.setFromEuler(e.set(0, r ? Math.PI / 2 : 0, 0)); mm.compose(new THREE.Vector3(x, 2.8, z), q, new THREE.Vector3(1, 1, 1)); im.setMatrixAt(i, mm); }); im.receiveShadow = true; scene.add(im); }

  /* ---------- la maison de Victor Hugo (le numéro 6, au sud-est) : la porte cochère, la plaque bleue, la lanterne ---------- */
  const HUGO = { x: 46, z: FA - .05 };
  { const t = tT(512, 160, (c, w, h) => { c.fillStyle = "#1a3a7a"; c.fillRect(0, 0, w, h); c.strokeStyle = "#f2ead8"; c.lineWidth = 8; c.strokeRect(10, 10, w - 20, h - 20); c.fillStyle = "#f2ead8"; c.textAlign = "center"; c.font = `bold 44px ${serif}`; c.fillText("MAISON DE", w / 2, 68); c.font = `bold 52px ${serif}`; c.fillText("VICTOR HUGO", w / 2, 126); });
    const p = new THREE.Mesh(new THREE.PlaneGeometry(1.6, .5), mat({ map: t, roughness: .4, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0 })); p.position.set(HUGO.x, 5.2, FA - .08); p.rotation.y = Math.PI; scene.add(p); NUIT.push([p.material, 0, .4]);
    const porte = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 3.6), mat({ map: tT(128, 192, (c, w, h) => { c.fillStyle = "#3a2414"; c.fillRect(0, 0, w, h); c.strokeStyle = "#20140a"; c.lineWidth = 4; for (const [x, y, ww, hh] of [[8, 8, 52, 80], [68, 8, 52, 80], [8, 98, 52, 86], [68, 98, 52, 86]]) c.strokeRect(x, y, ww, hh); c.fillStyle = "#c8a040"; c.beginPath(); c.arc(62, 100, 5, 0, 7); c.fill(); c.beginPath(); c.arc(66, 100, 5, 0, 7); c.fill(); }), roughness: .6 }));
    porte.position.set(HUGO.x, 1.75 + TROT, FA - .07); porte.rotation.y = Math.PI; scene.add(porte);
    const lan = mat({ color: 0xf8e8b8, emissive: 0xffc870, emissiveIntensity: .1 }); NUIT.push([lan, .1, 2.2]); const l = new THREE.Mesh(new THREE.CylinderGeometry(.16, .12, .4, 6), lan); l.position.set(HUGO.x - 2, 3.9, FA - .8); scene.add(l); LAMPES.push([HUGO.x, 4.2, FA - 1.4]); }

  /* ---------- le square : la grille noire aux pointes dorées, ses portes au milieu de chaque côté ; les tilleuls ; les bancs ; les réverbères ---------- */
  { const ferM = mat({ color: 0x14161a, roughness: .45, metalness: .6 }), orM = mat({ color: 0xd8a83a, roughness: .3, metalness: .8 }), B = [], P = [];
    for (const s of [-1, 1]) for (let t = -GR; t <= GR; t += .16) { if (Math.abs(t) < 2.6) continue; B.push([t, s * GR], [s * GR, t]); }
    const bg = new THREE.BoxGeometry(.035, 2.1, .035), pg = new THREE.ConeGeometry(.05, .16, 5), mm = new THREE.Matrix4();
    const ib = new THREE.InstancedMesh(bg, ferM, B.length), ip = new THREE.InstancedMesh(pg, orM, B.length); B.forEach(([x, z], i) => { mm.makeTranslation(x, 1.05, z); ib.setMatrixAt(i, mm); mm.makeTranslation(x, 2.18, z); ip.setMatrixAt(i, mm); }); scene.add(ib, ip);
    for (const s of [-1, 1]) for (const h of [.25, 1.85]) { box(GR - 2.6, .05, .06, ferM, -GR / 2 - 1.3, h, s * GR); box(GR - 2.6, .05, .06, ferM, GR / 2 + 1.3, h, s * GR); box(.06, .05, GR - 2.6, ferM, s * GR, h, -GR / 2 - 1.3); box(.06, .05, GR - 2.6, ferM, s * GR, h, GR / 2 + 1.3); }
    for (const s of [-1, 1]) for (const d of [-2.6, 2.6]) for (const [x, z] of [[d, s * GR], [s * GR, d]]) { box(.3, 2.8, .3, ferM, x, 1.4, z); cyl(.0, .16, .4, orM, x, 3, z, 8); }   // (les piliers des portes)
    for (const [x, z] of [[-GR, -GR], [GR, -GR], [-GR, GR], [GR, GR]]) { box(.4, 2.8, .4, ferM, x, 1.4, z); cyl(0, .2, .45, orM, x, 3, z, 8); }
    OBS.push([-GR - .3, GR + .3, -GR - .3, -GR + .3, "grille"]); }
  // les tilleuls : une double rangée le long de la grille, à l'intérieur ; le feuillage taillé, bien rond
  const ARB = []; for (let t = -34; t <= 34; t += PEU ? 8.5 : 6.8) for (const s of [-1, 1]) { if (Math.abs(t) < 4) continue; ARB.push([t, s * 37.4], [s * 37.4, t]); }
  for (const [x, z] of [[-9, -24], [9, -24], [-9, 24], [9, 24], [-24, -9], [-24, 9], [24, -9], [24, 9]]) ARB.push([x, z]);
  { const troncM = mat({ color: 0x4a3a2a, roughness: 1 }), feuM = [mat({ color: 0x3e6a2c, roughness: .9 }), mat({ color: 0x4e7a34, roughness: .9 }), mat({ color: 0x5a8a3a, roughness: .9 })];
    const tg = new THREE.CylinderGeometry(.18, .26, 3.4, 7), fg = new THREE.IcosahedronGeometry(1, 1), mm = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3();
    const it = new THREE.InstancedMesh(tg, troncM, ARB.length); const PARTS = [[0, 4.8, 0, 2.6], [1.2, 4.2, .6, 1.8], [-1.1, 4.4, -.5, 1.9], [.3, 5.9, -.8, 1.7], [-.4, 3.8, 1.1, 1.6]];
    const ifs = feuM.map(m => new THREE.InstancedMesh(fg, m, ARB.length * 2)); const nf = [0, 0, 0];
    ARB.forEach(([x, z], i) => { mm.makeTranslation(x, 1.7, z); it.setMatrixAt(i, mm); PARTS.forEach(([dx, y, dz, r], j) => { const k = (i + j) % 3; if (nf[k] >= ARB.length * 2) return; const rr = r * (.85 + al() * .3); mm.compose(v.set(x + dx, y + .5, z + dz), q, s.set(rr, rr * .85, rr)); ifs[k].setMatrixAt(nf[k]++, mm); }); });
    ifs.forEach((im, k) => { im.count = nf[k]; im.castShadow = true; scene.add(im); }); it.castShadow = true; scene.add(it); }
  // les bancs verts, le long des allées
  const BANCS = []; { const vertB = mat({ color: 0x1e4a32, roughness: .6 }), ferB = mat({ color: 0x1a1a1a, roughness: .5, metalness: .5 });
    const banc = (x, z, ry) => { const G = new THREE.Group(); G.position.set(x, 0, z); G.rotation.y = ry; scene.add(G); for (let i = 0; i < 4; i++) box(1.9, .05, .09, vertB, 0, .45, -.18 + i * .12, 0, G); for (let i = 0; i < 3; i++) { const l = box(1.9, .08, .03, vertB, 0, .62 + i * .12, -.27, 0, G); l.rotation.x = -.15; } for (const sx of [-.8, .8]) { box(.06, .45, .45, ferB, sx, .22, 0, 0, G); box(.06, .5, .05, ferB, sx, .7, -.28, 0, G); } BANCS.push([x, z, ry]); OBS.push([x - .5, x + .5, z - .5, z + .5]); };
    for (const s of [-1, 1]) for (const d of [16, 26]) { banc(d * s, 2.6, Math.PI); banc(d * s, -2.6, 0); banc(2.6, d * s, -Math.PI / 2); banc(-2.6, d * s, Math.PI / 2); } }
  L.tabourets = BANCS.flatMap(([x, z, ry]) => [-.5, .5].map(o => [x + Math.cos(ry) * o, z - Math.sin(ry) * o, ry, .46]));   /* (on peut s'asseoir sur les bancs) */ L.siegesSansVerre = true;
  // les réverbères : la lanterne parisienne sur son mât de fonte verte, le long de la chaussée et dans le square
  { const fonte = mat({ color: 0x1e2e26, roughness: .5, metalness: .5 }), lanM = mat({ color: 0xf2e6c0, roughness: .3, emissive: 0xffd080, emissiveIntensity: .05 }); NUIT.push([lanM, .05, 2.4]);
    const rev = (x, z) => { cyl(.11, .17, 3.8, fonte, x, 1.9, z, 8); cyl(.24, .24, .2, fonte, x, .1, z, 8); const l = new THREE.Mesh(new THREE.CylinderGeometry(.24, .14, .55, 6), lanM); l.position.set(x, 4.1, z); scene.add(l); cyl(.05, .26, .22, fonte, x, 4.48, z, 6); LAMPES.push([x, 3.9, z]); };
    for (let t = -48; t <= 48; t += 16) for (const s of [-1, 1]) { rev(t, s * (GR + 1.4)); rev(s * (GR + 1.4), t); rev(t + 8, s * (FA - 3.9)); rev(s * (FA - 3.9), t + 8); }
    for (const [x, z] of [[-7.4, -7.4], [7.4, -7.4], [-7.4, 7.4], [7.4, 7.4]]) rev(x, z); }

  /* ---------- la statue équestre de Louis XIII, en bronze, sur son piédestal de marbre blanc, dans sa petite grille ---------- */
  const STAT = { x: 0, z: 0 };
  { const marbre = mat({ color: 0xece6da, roughness: .5 }), bronze = mat({ color: 0x3e5446, roughness: .45, metalness: .65 }), ferM = mat({ color: 0x14161a, roughness: .45, metalness: .6 });
    box(5.4, .5, 7.6, marbre, 0, .25, 0); box(4.6, .4, 6.8, marbre, 0, .7, 0); box(3.6, 3.4, 5.6, marbre, 0, 2.6, 0); box(4, .4, 6, marbre, 0, 4.5, 0); box(3.4, .3, 5.2, marbre, 0, 4.85, 0);
    { const t = tT(256, 160, (c, w, h) => { c.fillStyle = "#3a4a3e"; c.fillRect(0, 0, w, h); c.strokeStyle = "#c8a040"; c.lineWidth = 6; c.strokeRect(8, 8, w - 16, h - 16); c.fillStyle = "#d8b860"; c.textAlign = "center"; c.font = `bold 30px ${serif}`; c.fillText("LOUIS XIII", w / 2, 70); c.font = `italic 20px ${serif}`; c.fillText("roi de France et de Navarre", w / 2, 108); });
      for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(2, 1.25), mat({ map: t, metalness: .5, roughness: .4 })); p.position.set(0, 2.7, s * 2.81); p.rotation.y = s > 0 ? 0 : Math.PI; scene.add(p); } }
    const Gs = new THREE.Group(); Gs.position.set(0, 5, 0); scene.add(Gs); const cap = (r, l, x, y, z, rx = 0, rz = 0, par = Gs) => { const o = new THREE.Mesh(new THREE.CapsuleGeometry(r, l, 4, 10), bronze); o.position.set(x, y, z); o.rotation.set(rx, 0, rz); par.add(o); return o; };
    // le cheval, au pas, une jambe avant levée
    const corps = cap(.62, 1.9, 0, 2.05, 0, Math.PI / 2); corps.scale.set(1, 1, 1.05); cap(.34, .9, 0, 2.75, 1.25, -.75); const tete = cap(.24, .62, 0, 3.15, 1.85, -1.95); tete.scale.set(.8, 1, 1);
    for (const sx of [-1, 1]) { const o = new THREE.Mesh(new THREE.ConeGeometry(.07, .2, 5), bronze); o.position.set(sx * .12, 3.5, 1.75); Gs.add(o); }
    const crin = new THREE.Mesh(new THREE.BoxGeometry(.08, .32, .9), bronze); crin.position.set(0, 2.95, 1.15); crin.rotation.x = -.75; Gs.add(crin);
    for (const [x, z, rx] of [[-.32, 1.05, -.0], [.32, 1.05, -1.1], [-.32, -1.05, .08], [.32, -1.05, -.05]]) { const j = cap(.13, 1.3, x, .8, z, rx); if (rx < -.5) { j.position.set(x, 1.3, z + .45); } }
    const q = cap(.1, .9, 0, 1.75, -1.55, .5); q.scale.set(1.4, 1, 1);
    // le roi : la cuirasse, le manteau, le chapeau à plume, le bâton de commandement
    cap(.27, .62, 0, 3.15, -.05); cap(.11, .6, -.36, 2.55, .15, .25, .4); cap(.11, .6, .36, 2.55, .15, .25, -.4); cap(.09, .55, .34, 3.05, .35, -1.2, -.2); cap(.09, .5, -.3, 3.1, .15, -.6, .3);
    const t2 = new THREE.Mesh(new THREE.SphereGeometry(.17, 10, 8), bronze); t2.position.set(0, 3.98, 0); Gs.add(t2); const ch = new THREE.Mesh(new THREE.CylinderGeometry(.34, .34, .07, 14), bronze); ch.position.set(0, 4.12, 0); Gs.add(ch); cyl(.13, .15, .16, bronze, 0, 4.22, 0, 10, Gs);
    const pl = new THREE.Mesh(new THREE.CapsuleGeometry(.05, .4, 3, 6), bronze); pl.position.set(-.18, 4.3, -.2); pl.rotation.set(.6, 0, .6); Gs.add(pl); const bat = cap(.03, .5, .45, 3.35, .62, -1.1); void bat;
    const man = new THREE.Mesh(new THREE.ConeGeometry(.55, 1.1, 10, 1, true), bronze); man.position.set(0, 2.85, -.3); man.rotation.x = .35; man.material = bronze; Gs.add(man);
    // la petite grille autour
    const B = []; for (let a = 0; a < 6.283; a += .05) B.push([Math.cos(a) * 6.2, Math.sin(a) * 7.4]); const ib = new THREE.InstancedMesh(new THREE.BoxGeometry(.03, 1, .03), ferM, B.length), mm = new THREE.Matrix4(); B.forEach(([x, z], i) => { mm.makeTranslation(x, .5, z); ib.setMatrixAt(i, mm); }); scene.add(ib);
    const ru = new THREE.Mesh(new THREE.TorusGeometry(1, .025, 4, 80), ferM); ru.rotation.x = Math.PI / 2; ru.scale.set(6.2, 7.4, 1); ru.position.y = .98; scene.add(ru);
    OBS.push([-6.4, 6.4, -7.6, 7.6, "statue"]); }

  /* ---------- les quatre fontaines : la vasque de pierre, la colonne, les deux coupes, l'eau qui retombe ---------- */
  const EAUX = []; { const pierreF = mat({ color: 0xd8d0c0, roughness: .7 }), eauM = mat({ color: 0x6a8aa0, roughness: .08, metalness: .2, transparent: true, opacity: .85, emissive: 0x1a3048, emissiveIntensity: .2 });
    const gouT = tT(32, 32, (c, w, h) => { const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, "rgba(235,245,255,1)"); g.addColorStop(1, "rgba(200,225,255,0)"); c.fillStyle = g; c.fillRect(0, 0, w, h); });
    for (const [fx, fz] of FONT) { const r0 = 4.2; const bord = new THREE.Mesh(new THREE.TorusGeometry(r0, .28, 8, 40), pierreF); bord.rotation.x = Math.PI / 2; bord.position.set(fx, .5, fz); scene.add(bord); cyl(r0, r0, .5, pierreF, fx, .25, fz, 40);
      const e = new THREE.Mesh(new THREE.CircleGeometry(r0 - .1, 40), eauM); e.rotation.x = -Math.PI / 2; e.position.set(fx, .52, fz); scene.add(e);
      cyl(.45, .6, 1.6, pierreF, fx, 1.3, fz, 12); cyl(1.6, .5, .45, pierreF, fx, 2.2, fz, 20); cyl(.25, .3, 1.2, pierreF, fx, 2.9, fz, 10); cyl(.85, .3, .3, pierreF, fx, 3.55, fz, 16); cyl(.12, .2, .5, pierreF, fx, 3.9, fz, 8);
      for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4, m = new THREE.Mesh(new THREE.SphereGeometry(.22, 8, 6), pierreF); m.position.set(fx + Math.cos(a) * .5, 1.5, fz + Math.sin(a) * .5); scene.add(m); }
      const N = PEU ? 90 : 220, pos = new Float32Array(N * 3), geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); const pt = new THREE.Points(geo, new THREE.PointsMaterial({ map: gouT, size: .14, transparent: true, depthWrite: false, opacity: .8 })); pt.frustumCulled = false; scene.add(pt);
      EAUX.push({ fx, fz, pos, geo, N, ph: al() * 10 }); OBS.push([fx - r0 - .3, fx + r0 + .3, fz - r0 - .3, fz + r0 + .3, "fontaine"]); }
    AMB.push((tm) => { const t = tm / 1000; for (const E of EAUX) { const { pos, N } = E; for (let i = 0; i < N; i++) { const tier = i % 3, u = ((t * (tier === 0 ? .9 : .7) + i * .618 + E.ph) % 1), a = i * 2.399, r0 = tier === 0 ? .12 : tier === 1 ? .82 : 1.58, y0 = tier === 0 ? 4.15 : tier === 1 ? 3.6 : 2.35;
          const vr = tier === 0 ? .9 : .55, vy = tier === 0 ? 1.4 : 0, x = Math.cos(a) * (r0 + vr * u), z = Math.sin(a) * (r0 + vr * u), y = y0 + vy * u - 4.9 * (u * (tier === 0 ? .55 : .7)) ** 2 * (tier === 0 ? 1 : 2.2);
          pos[i * 3] = E.fx + x; pos[i * 3 + 1] = Math.max(.55, y); pos[i * 3 + 2] = E.fz + z; } E.geo.attributes.position.needsUpdate = true; } }); }

  /* ---------- la bouche de métro (Bastille), au coin sud-ouest : la balustrade de fonte, le panneau, les deux lampadaires ---------- */
  { const MX = -48.5, MZ = 47, vert = mat({ color: 0x2e5a44, roughness: .5, metalness: .4 }), G = new THREE.Group(); G.position.set(MX, 0, MZ); scene.add(G);
    const trou = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 5), mat({ map: tT(64, 100, (c, w, h) => { c.fillStyle = "#1a1612"; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 7) { c.fillStyle = `rgba(200,190,170,${.5 - y / h * .45})`; c.fillRect(2, y, w - 4, 2); } }) })); trou.rotation.x = -Math.PI / 2; trou.position.y = .03; G.add(trou);
    for (const [x, z, w, d] of [[-1.7, 0, .08, 5], [1.7, 0, .08, 5], [0, -2.5, 3.4, .08]]) { box(w, .08, d, vert, x, 1.05, z, 0, G); for (let t = -.5; t <= .5; t += .04) box(.03, .95, .03, vert, x + (w > 1 ? t * w : 0), .5, z + (d > 1 ? t * d : 0), 0, G); }
    const t = tT(512, 128, (c, w, h) => { c.fillStyle = "#f2e6b0"; c.fillRect(0, 0, w, h); c.strokeStyle = "#2e5a44"; c.lineWidth = 10; c.strokeRect(5, 5, w - 10, h - 10); c.fillStyle = "#2e5a44"; c.font = `bold 64px ${serif}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("MÉTRO", w / 2, h / 2 + 4); });
    const pm = mat({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: .05 }); NUIT.push([pm, .05, .8]); for (const r of [0, Math.PI]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(2.2, .55), pm); p.position.set(0, 3.1, -2.6); p.rotation.y = r; G.add(p); }
    for (const x of [-1.8, 1.8]) { cyl(.07, .12, 3.4, vert, x, 1.7, -2.5, 8, G); const g = new THREE.Mesh(new THREE.SphereGeometry(.2, 10, 8), mat({ color: 0xf8e0a0, emissive: 0xffc860, emissiveIntensity: .2 })); g.position.set(x, 3.55, -2.5); G.add(g); NUIT.push([g.material, .2, 2.2]); }
    const t2 = tT(256, 64, (c, w, h) => { c.fillStyle = "#1a2a5a"; c.fillRect(0, 0, w, h); c.fillStyle = "#fff"; c.font = "bold 30px Arial"; c.textBaseline = "middle"; c.fillText("Bastille", 70, h / 2 + 2); for (const [i, [n, bg, fg]] of [["1", "#ffcd00", "#000"], ["5", "#ff7e2e", "#000"]].entries()) { c.fillStyle = bg; c.beginPath(); c.arc(20 + i * 0, h / 2, 0, 0, 7); c.fill(); void fg; void n; } c.fillStyle = "#ffcd00"; c.beginPath(); c.arc(32, h / 2, 20, 0, 7); c.fill(); c.fillStyle = "#000"; c.font = "bold 26px Arial"; c.textAlign = "center"; c.fillText("1", 32, h / 2 + 2); });
    const p2 = new THREE.Mesh(new THREE.PlaneGeometry(1.6, .4), mat({ map: t2 })); p2.position.set(0, 2.5, -2.55); G.add(p2);
    L.metroVosges = { x: MX, z: MZ - 1 }; OBS.push([MX - 1.8, MX + 1.8, MZ - 2.6, MZ + 2.6, "metro"]); }

  /* ---------- du monde : les promeneurs sous les arcades et autour du square, les familles dans les allées, des gens assis sur l'herbe ; les fiacres sur les pavés ---------- */
  const MARCH = [], PE = ["#f0c9a6", "#c78f62", "#e8bd95", "#8d5a3b", "#f6d6bc", "#6a4028"], HA = ["#2a3a5a", "#7a2a3a", "#3a3a40", "#e8e2d6", "#5a4636", "#2f5a4a", "#c8a040", "#1a1a1c", "#8a2a2a", "#4a5a7a"];
  const gens = (k, enf = false) => { const f = k % 2 === 1; return personne3D({ taille: enf ? 1.15 : f ? 1.64 : 1.76, enfant: enf, peau: PE[k % 6], ch: ["#2a1a12", "#5a3a22", "#141010", "#8a8a8a", "#e2c27a"][k % 5], haut: HA[k % 10], bas: ["#26324e", "#2a2a30", "#3a3028", "#5a6a7a"][k % 4], chaussures: ["#1a1a1a", "#e8e8e8"][k % 2], coif: f ? (k % 3 ? "long" : "carre") : k % 4 ? "court" : "chauve", pantalon: !f || k % 3 === 0, robe: f && k % 3 !== 0 }); };
  { const B1 = FA - 1.7, B2 = GR + 3.2, R = [
      [[-B1, -B1], [B1, -B1], [B1, B1], [-B1, B1]], [[B1, B1], [B1, -B1], [-B1, -B1], [-B1, B1]], [[-B2, -B2], [B2, -B2], [B2, B2], [-B2, B2]], [[B2, B2], [B2, -B2], [-B2, -B2], [-B2, B2]],
      [[0, -GR - 2], [0, -12], [9, -9], [12, 0], [9, 9], [0, 12], [0, GR + 2], [0, 12], [-9, 9], [-12, 0], [-9, -9], [0, -12]], [[-GR - 2, 0], [-12, 0], [-9, 9], [0, 12], [9, 9], [12, 0], [GR + 2, 0], [12, 0], [9, -9], [0, -12], [-9, -9], [-12, 0]],
      [[-1.6, -36], [-1.6, -13], [-13, -1.6], [-36, -1.6], [-13, -1.6], [-1.6, -13]], [[1.6, 36], [1.6, 13], [13, 1.6], [36, 1.6], [13, 1.6], [1.6, 13]]];
    const n = PEU ? 16 : 34; for (let k = 0; k < n; k++) { const Rr = R[k % R.length], m = gens(k, k % 9 === 4), i0 = (k * 3) % Rr.length, a = Rr[i0], b = Rr[(i0 + 1) % Rr.length], u = ((k * 37) % 100) / 100; m.position.set(a[0] + (b[0] - a[0]) * u, 0, a[1] + (b[1] - a[1]) * u); m.userData.poser("marche", 0); m.userData.anime = true; scene.add(m);
      MARCH.push({ m, R: Rr, i: (i0 + 1) % Rr.length, v: .8 + (k % 5) * .12 }); }
    // sur l'herbe : on pique-nique, on lit, on bavarde, assis en tailleur
    const nappes = [[-22, -28], [26, -12], [-14, 27], [24, 28], [-28, 12]]; for (let i = 0; i < (PEU ? 3 : 5); i++) { const [x, z] = nappes[i]; box(1.6, .02, 1.2, mat({ color: [0xd84a3a, 0x3a6ab0, 0xe8d8a0, 0x5a9a5a, 0xc88ad0][i] }), x, .06, z);
      for (let j = 0; j < 2; j++) { const m = gens(70 + i * 2 + j), a = j * Math.PI + i; m.position.set(x + Math.cos(a) * .9, .14 - m.userData.hipY, z + Math.sin(a) * .7); m.rotation.y = -a - Math.PI / 2; m.userData.poser("assis", 0); m.userData.anime = true; scene.add(m);
        const P = m.userData.parts; for (const jb of P.jambes || []) { if (jb.h) jb.h.rotation.x = -1.45; if (jb.gen) jb.gen.rotation.x = .2; } AMB.push((tm) => { P.tete.rotation.y = Math.sin(tm / 1900 + i * 3 + j) * .4; }); } } }
  // les fiacres : le cheval au trot, la caisse noire et ses grandes roues, le cocher en haut-de-forme ; ils font le tour de la place, sur les pavés
  const FIACRES = []; { const noir = mat({ color: 0x141414, roughness: .35, metalness: .3 }), bai = [mat({ color: 0x5a3420, roughness: .7 }), mat({ color: 0x2a1e18, roughness: .7 }), mat({ color: 0xe8e2d6, roughness: .7 })], roueM = mat({ color: 0x8a2a1a, roughness: .5 }), cuir = mat({ color: 0x3a2a1a });
    const fiacre = (k) => { const G = new THREE.Group(); scene.add(G); const ch = new THREE.Group(); G.add(ch); ch.position.z = 3.1; const cm = bai[k % 3];
      const cap = (r, l, x, y, z, rx, par) => { const o = new THREE.Mesh(new THREE.CapsuleGeometry(r, l, 4, 10), cm); o.position.set(x, y, z); o.rotation.x = rx; par.add(o); return o; };
      cap(.36, 1.1, 0, 1.3, 0, Math.PI / 2, ch); const cou = cap(.18, .55, 0, 1.7, .72, -.6, ch); const tt = cap(.14, .38, 0, 1.95, 1.05, -1.9, ch); void cou; void tt;
      const jambes = [[-.2, .55], [.2, .55], [-.2, -.55], [.2, -.55]].map(([x, z]) => { const h = new THREE.Group(); h.position.set(x, 1.15, z); ch.add(h); const j = new THREE.Mesh(new THREE.CapsuleGeometry(.07, .85, 3, 6), cm); j.position.y = -.5; h.add(j); return h; });
      const q = cap(.06, .5, 0, 1.25, -.75, .6, ch); void q;
      box(1.5, 1.1, 1.8, noir, 0, 1.55, -.2, 0, G); box(1.6, .1, 1.9, noir, 0, 2.15, -.2, 0, G); box(1.2, .5, .02, mat({ color: 0x2a3440, roughness: .1, metalness: .4 }), 0, 1.75, .71, 0, G); box(.9, .3, .6, noir, 0, 1.9, 1.05, 0, G);
      const roues = []; for (const [x, z, r] of [[-.82, -.7, .62], [.82, -.7, .62], [-.78, .75, .42], [.78, .75, .42]]) { const w = new THREE.Mesh(new THREE.TorusGeometry(r, .04, 5, 18), roueM); w.position.set(x, r, z); w.rotation.y = Math.PI / 2; G.add(w); for (let i = 0; i < 6; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(.02, r * 2, .03), roueM); s.rotation.x = i * Math.PI / 6; w.add(s); } roues.push([w, r]); }
      for (const x of [-.4, .4]) { const b = box(.05, .05, 2.4, cuir, x, 1.25, 1.95, 0, G); void b; }
      const co = personne3D({ taille: 1.72, peau: "#e8bd95", ch: "#3a2a1a", haut: "#1a1a20", bas: "#1a1a20", chaussures: "#0a0a0a", coif: "court", pantalon: true }); const hy = co.userData.hipY; co.position.set(0, 2.08 - hy, .95); co.userData.poser("assis", 0); G.add(co); cyl(.13, .13, .3, noir, 0, 2.08 + 1.72 * .52 + .14, .95, 10, G); cyl(.2, .2, .02, noir, 0, 2.08 + 1.72 * .52, .95, 12, G);
      FIACRES.push({ G, jambes, roues, s: k * 110, v: 3.2 + k * .3 }); };
    for (let k = 0; k < (PEU ? 1 : 2); k++) fiacre(k);
    const RF = GR + 7.5, Lr = 8 * RF; AMB.push((tm, dt) => { for (const F of FIACRES) { F.s = (F.s + F.v * dt) % Lr; const u = F.s / RF; let x, z, ry; if (u < 2) { x = -RF + u * RF; z = RF; ry = Math.PI / 2; } else if (u < 4) { x = RF; z = RF - (u - 2) * RF; ry = Math.PI; } else if (u < 6) { x = RF - (u - 4) * RF; z = -RF; ry = -Math.PI / 2; } else { x = -RF; z = -RF + (u - 6) * RF; ry = 0; }
        F.G.position.set(x, 0, z); F.G.rotation.y += ((ry - F.G.rotation.y + Math.PI * 3) % (Math.PI * 2) - Math.PI) * Math.min(1, dt * 3); const t = tm / 1000 * 5.5; F.jambes.forEach((h, i) => { h.rotation.x = Math.sin(t + (i === 0 || i === 3 ? 0 : Math.PI)) * .45; }); for (const [w, r] of F.roues) w.rotation.x -= F.v * dt / r; } }); }
  // les pigeons et les moineaux sur le sable des allées
  { const pm = [mat({ color: 0x7a7e88 }), mat({ color: 0x5a5e68 })], OI = []; for (let i = 0; i < (PEU ? 6 : 14); i++) { const G = new THREE.Group(); const c = new THREE.Mesh(new THREE.SphereGeometry(.13, 8, 6), pm[i % 2]); c.scale.set(.8, .8, 1.3); c.position.y = .14; G.add(c); const t = new THREE.Mesh(new THREE.SphereGeometry(.07, 8, 6), pm[0]); t.position.set(0, .26, .14); G.add(t); const b = new THREE.Mesh(new THREE.ConeGeometry(.02, .06, 4), mat({ color: 0xd8a040 })); b.rotation.x = Math.PI / 2; b.position.set(0, .25, .23); G.add(b);
      const a = al() * 6.28, r = 13 + al() * 3; G.position.set(Math.cos(a) * r, .02, Math.sin(a) * r); G.rotation.y = al() * 6.28; scene.add(G); OI.push({ G, t, ph: al() * 10 }); }
    AMB.push((tm) => { for (const O of OI) { const k = Math.sin(tm / 260 + O.ph); O.t.position.y = .26 - Math.max(0, k) * .1; O.t.position.z = .14 + Math.max(0, k) * .04; if (Math.sin(tm / 3100 + O.ph) > .97) O.G.rotation.y += .05; } }); }

  /* ---------- les limites : la place (la chaussée et le square), pas dans les maisons, ni dans les fontaines, la statue, les bancs ---------- */
  const dansGrille = (x, z) => Math.abs(Math.abs(x) - GR) < .35 && Math.abs(z) < GR + .35 && Math.abs(z) > 2.4 || Math.abs(Math.abs(z) - GR) < .35 && Math.abs(x) < GR + .35 && Math.abs(x) > 2.4;
  L.limites = (x, z) => { if (Math.abs(x) > FA - .7 || Math.abs(z) > FA - .7) return false; if (dansGrille(x, z)) return false;
    for (const o of OBS) if (o && o[4] !== "grille" && x > o[0] && x < o[1] && z > o[2] && z < o[3]) { if (o[4] === "statue" || o[4] === "metro") return false; if (o[4] === "fontaine") { const f = FONT.find(([a, b]) => Math.hypot(x - a, z - b) < 6); if (f && Math.hypot(x - f[0], z - f[1]) < 4.6) return false; continue; } return false; }
    return true; };
  L.hauteur = (x, z) => surTrott(x, z) ? TROT : 0;
  L.depart = [0, 30]; L.taille = 1.8; L.suivi = { d: 6.5, h: 3.6, av: 3, vy: 2 }; L.fov = [60, 74];
  L.zone = [-FA, FA, -FA, FA]; L.cam = { pos: [0, 9, 50], vise: [0, 6, 0] }; L.sansMusique = true; L.loin = 400;

  /* ---------- la maison de Victor Hugo : on s'approche de la porte du numéro 6 ---------- */
  const PAROLES = ["« Il n'y a rien de plus puissant qu'une idée dont l'heure est venue. »", "« La musique exprime ce qui ne peut être dit et sur quoi il est impossible de rester silencieux. »", "« Aimer, c'est savoir dire je t'aime sans parler. »", "« Le bonheur de la vie est d'être aimé pour soi-même. »",
    "« Respirer Paris, cela conserve l'âme. »", "« Le rire est le soleil qui chasse l'hiver du visage humain. »", "« Ceux qui vivent, ce sont ceux qui luttent. »", "« La mélancolie, c'est le bonheur d'être triste. »", "« On passe une moitié de sa vie à attendre ceux qu'on aimera et l'autre moitié à quitter ceux qu'on aime. »", "« Les souvenirs sont nos forces. »"];
  let iP = Math.floor(al() * PAROLES.length);
  const hugoParle = () => { const d = document.createElement("div"); d.style.cssText = "position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);z-index:52;max-width:min(86vw,520px);background:#f2e8d0;color:#3a2a18;border-radius:6px;padding:18px 22px;font:17px/1.5 Georgia,serif;box-shadow:0 10px 40px rgba(0,0,0,.6);border:1px solid #b8a070;cursor:pointer";
    d.innerHTML = `<div style="font:italic 14px Georgia,serif;opacity:.75;margin-bottom:8px">Place des Vosges, numéro 6. Victor Hugo a vécu ici de 1832 à 1848 ; il y écrivit une grande partie des <i>Misérables</i>.</div>${PAROLES[iP++ % PAROLES.length]}<div style="margin-top:8px;text-align:right;font-style:italic">— Victor Hugo</div><div style="margin-top:10px;font-size:12px;opacity:.6;text-align:right">(toucher pour fermer)</div>`;
    const C = (M && M.ctx && M.ctx.conteneur) || document.body; C.appendChild(d); const f = () => d.remove(); d.onclick = f; setTimeout(f, 16000); };
  const a0 = L.actionLieu; L.actionLieu = (x, z, moi) => { const r = a0 && a0(x, z, moi); if (r) return r; return Math.hypot(x - HUGO.x, z - (FA - 2.6)) < 2 ? { type: "lieu", id: "hugo", label: "📜 La maison de Victor Hugo", faire: hugoParle } : null; };
  // une lueur douce au sol devant la porte (comme à Notre-Dame : pas de cercle jaune)
  { const halo = tT(128, 128, (c, w, h) => { const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, "rgba(255,236,170,.75)"); g.addColorStop(.4, "rgba(255,214,120,.35)"); g.addColorStop(1, "rgba(255,196,90,0)"); c.fillStyle = g; c.fillRect(0, 0, w, h); });
    const hm = new THREE.MeshBasicMaterial({ map: halo, transparent: true, depthWrite: false, opacity: .8 }); const o = new THREE.Mesh(new THREE.CircleGeometry(1.1, 24), hm); o.rotation.x = -Math.PI / 2; o.position.set(HUGO.x, TROT + .02, FA - 2.6); scene.add(o); AMB.push((tm) => { hm.opacity = .55 + Math.sin(tm / 600) * .25; }); }

  /* ---------- l'arrivée par le vieux livre : les pages tourbillonnent autour de nous, puis s'envolent au-dessus du square et laissent voir la place ---------- */
  { const papT = tT(64, 88, (c, w, h) => { c.fillStyle = "#f2ead6"; c.fillRect(0, 0, w, h); c.fillStyle = "rgba(60,40,20,.55)"; for (let y = 10; y < h - 8; y += 6) c.fillRect(6, y, w - 12 - (y % 18 ? 0 : 14), 1.5); });
    const scT = tT(64, 64, (c, w, h) => { const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(.3, "rgba(255,255,255,.5)"); g.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = g; c.fillRect(0, 0, w, h); });
    L.arriveeLivre = (coul) => { const p = M && M.moiNum && M.gens.get(M.moiNum); if (!p) return; const C2 = coul || { page: 0x9cffc0, em: 0x20b060, sc: 0x6aff9a }, pm = mat({ map: papT, color: C2.page, emissive: C2.em, emissiveIntensity: .55, side: THREE.DoubleSide, roughness: .9 });
      const G = new THREE.Group(); scene.add(G); const PG = []; for (let i = 0; i < 36; i++) { const g = new THREE.Group(), a1 = new THREE.Mesh(new THREE.PlaneGeometry(.12, .17), pm), a2 = a1.clone(); a1.position.x = -.06; a2.position.x = .06; g.add(a1, a2); const h = new THREE.Sprite(new THREE.SpriteMaterial({ map: scT, color: C2.sc, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); h.scale.setScalar(.6); g.add(h); G.add(g); PG.push({ g, a1, a2, r: .8 + al() * 1.6, a: al() * 6.28, y: al() * 2.4, w: .8 + al() * 1.2, ph: al() * 6.28 }); }
      const t0 = performance.now(), DUR = 11, P0 = p.g.position.clone(), c = M.camera; p.g.visible = false; let dit = 0, fin = false;
      M.cine = { gel: true, fov: [52, 60], maj: () => { const t = (performance.now() - t0) / 1000, k = Math.min(1, t / DUR), e = k * k * (3 - 2 * k);
          const cpos = new THREE.Vector3(P0.x, 1.7 + Math.max(0, 1 - t / 3) * .2, P0.z).lerp(new THREE.Vector3(P0.x + 5, 14, P0.z + 16), Math.min(1, Math.max(0, (t - 3) / 7)) ** 1.4);
          c.position.copy(cpos); c.lookAt(new THREE.Vector3(0, 4 + e * 2, 0).lerp(new THREE.Vector3(P0.x, 1.6, P0.z - 6), Math.max(0, 1 - t / 2.5)));
          PG.forEach((Q, i) => { const sp = t < 3 ? 1 : 1 + (t - 3) * .8, r = Q.r * sp, an = Q.a + t * Q.w * 1.6, y = P0.y + 1 + Q.y + (t > 3 ? (t - 3) * (1.4 + Q.w) : Math.sin(t * 2 + Q.ph) * .3);
            Q.g.position.set(P0.x + Math.cos(an) * r, y, P0.z + Math.sin(an) * r); const bat = Math.sin(t * 14 + Q.ph) * .9; Q.a1.rotation.y = bat; Q.a2.rotation.y = -bat; Q.g.rotation.y = -an; Q.g.scale.setScalar(t > DUR - 2 ? Math.max(0, (DUR - t) / 2) : 1); });
          if (dit < 1 && t > .8) { dit = 1; sousTitre("", "Les pages du vieux livre t'ont emporté…", 3600); }
          if (dit < 2 && t > 4.4) { dit = 2; sousTitre("", "La place des Vosges. La plus ancienne place de Paris, en brique rouge et pierre blanche.", 4600); }
          if (dit < 3 && t > 9) { dit = 3; sousTitre("", "Au numéro 6, là-bas, au coin : la maison où vécut Victor Hugo.", 4200); }
          if (t > DUR && !fin) { fin = true; scene.remove(G); p.g.visible = true; finCine(); placerCamera(true); } } }; }; }

  /* ---------- la nuit, les fenêtres, les lanternes ; l'animation ---------- */
  { const N = (MOBILE || GPU_MODESTE) ? 5 : 8, POOL = []; for (let i = 0; i < N; i++) { const l = new THREE.PointLight(0xffd08a, 14, 15, 1.5); l.visible = false; scene.add(l); L.nuitObjets.push(l); POOL.push(l); }
    let nV = null, tp = 0, fr = 0; const a1 = L.anim; L.anim = (tm) => { try { a1 && a1(tm); } catch (e) {} const n = !!L.nuit; if (n !== nV) { nV = n; for (const [m, j, nn] of NUIT) m.emissiveIntensity = n ? nn : j; }
      const dt = tp ? Math.min(.1, (tm - tp) / 1000) : 0; tp = tm; for (const f of AMB) try { f(tm, dt); } catch (e) {}
      const c = M && M.camera && M.camera.position, R2 = ((MOBILE || GPU_MODESTE) ? 40 : 70) ** 2;
      for (const W of MARCH) try { const m = W.m, [tx, tz] = W.R[W.i], dx = tx - m.position.x, dz = tz - m.position.z, d = Math.hypot(dx, dz); if (d < .3) { W.i = (W.i + 1) % W.R.length; continue; } const v = Math.min(d, W.v * dt);
        m.position.x += dx / d * v; m.position.z += dz / d * v; m.position.y = L.hauteur(m.position.x, m.position.z); m.rotation.y = Math.atan2(dx, dz); if (!c || (m.position.x - c.x) ** 2 + (m.position.z - c.z) ** 2 < R2) m.userData.poser("marche", tm * W.v / 1.2); } catch (e) {}
      if (!M || M.L !== L || !M.camera || fr++ % 20) return; const cp = M.camera.position; const tri = LAMPES.map(p => [p, (p[0] - cp.x) ** 2 + (p[2] - cp.z) ** 2]).sort((u, w) => u[1] - w[1]); POOL.forEach((l, i) => { const p = tri[i] && tri[i][0]; if (p) l.position.set(p[0], p[1], p[2]); }); }; }
  fusionStatique(scene, L, 0);
  // (10.190) on arrive par le livre : dès que le bonhomme est là, la cinématique des pages ; puis le voile de lumière se dissipe
  { const a2 = L.anim; L.anim = (tm) => { try { a2 && a2(tm); } catch (e) {} const A2 = window.__arriveeLivre; if (!A2 || !M || M.L !== L || !M.moiNum || !M.gens.get(M.moiNum)) return; window.__arriveeLivre = null;
      try { if (M.cine) finCine(); L.arriveeLivre(A2.coul); } catch (e) { console.warn(e); } const v = A2.voile; if (v && v.isConnected) setTimeout(() => { v.style.opacity = "0"; setTimeout(() => v.remove(), 1500); }, 400); }; }
}
({ construireVosges })
