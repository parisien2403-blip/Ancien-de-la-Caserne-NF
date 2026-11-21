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
    const GA = FA + 4; tr(-GA, GA, -GA, -FA + 3.4); tr(-GA, GA, FA - 3.4, GA); tr(-GA, -FA + 3.4, -FA + 3.4, FA - 3.4); tr(FA - 3.4, GA, -FA + 3.4, FA - 3.4); }
  const TROT = .14, GAL = 4, surTrott = (x, z) => Math.max(Math.abs(x), Math.abs(z)) > FA - 3.4;
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
    else { c.fillStyle = "#c88a70"; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 5) for (let x = (y / 5 % 2) * 6; x < w; x += 12) { const k = a2() * 26; c.fillStyle = `rgb(${196 + k * .8},${108 + k * .6},${80 + k * .5})`; c.fillRect(x, y, 11, 4); } }
    const pierre = (x, y, ww, hh) => { if (nuit) return; c.fillStyle = "#ecdcbc"; c.fillRect(X(x), Y(y + hh), ww * PX, hh * PX); c.strokeStyle = "rgba(120,104,80,.35)"; c.lineWidth = 1; for (let yy = y; yy < y + hh; yy += .55) { c.beginPath(); c.moveTo(X(x), Y(yy)); c.lineTo(X(x + ww), Y(yy)); c.stroke(); } };
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
      if (!nuit) { pierre(cx - 1.15, 6.1, 2.3, haut - 6.6); c.fillStyle = "#c97a5c"; for (let yy = 6.4; yy < haut - .6; yy += 1.1) { if (((yy * 10) | 0) % 2) { c.fillRect(X(cx - 1.15), Y(yy + .5), .22 * PX, .5 * PX); c.fillRect(X(cx + .93), Y(yy + .5), .22 * PX, .5 * PX); } } }
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
  const briqueM = mat({ color: 0xc27458, roughness: .95 }), pierreM = mat({ color: 0xeadbbd, roughness: .9 });
  const ardoiseT = tT(256, 256, (c, w, h) => { c.fillStyle = "#4e5866"; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 16) for (let x = (y / 16 % 2) * 8; x < w; x += 16) { const k = al() * 26; c.fillStyle = `rgb(${82 + k},${92 + k},${108 + k})`; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 15, y); c.lineTo(x + 15, y + 11); c.quadraticCurveTo(x + 7.5, y + 16, x, y + 11); c.closePath(); c.fill(); c.strokeStyle = "rgba(30,34,40,.5)"; c.stroke(); } }, 1, 1);
  ardoiseT.wrapS = ardoiseT.wrapT = THREE.RepeatWrapping; const ardoiseM = mat({ map: ardoiseT, roughness: .55, metalness: .15, side: THREE.DoubleSide });
  const zincM = mat({ color: 0x8a929a, roughness: .4, metalness: .5 });
  // le toit en croupe d'un pavillon : deux longs pans et deux petits, à la française
  const toitG = (W, D, Hr, inset) => { const a = [-W / 2, 0, -D / 2], b = [W / 2, 0, -D / 2], cc = [W / 2, 0, D / 2], d = [-W / 2, 0, D / 2], r1 = [-W / 2 + inset, Hr, 0], r2 = [W / 2 - inset, Hr, 0];
    const tri = [d, cc, r2, d, r2, r1, b, a, r1, b, r1, r2, a, d, r1, cc, b, r2], pos = new Float32Array(tri.length * 3), uv = new Float32Array(tri.length * 2);
    tri.forEach((p, i) => { pos.set(p, i * 3); const pente = Math.abs(p[2]) > .01 || p[1] > 0 ? Math.hypot(D / 2 - Math.abs(p[2]), p[1]) : 0; uv[i * 2] = (p[0] + p[2]) / 3; uv[i * 2 + 1] = (p[1] * 1.15 + (D / 2 - Math.abs(p[2])) * .3) / 3; void pente; });
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); g.computeVertexNormals(); return g; };
  const arcadeT = tT(256, 256, (c, w, h) => { c.fillStyle = "#e0d3b8"; c.fillRect(0, 0, w, h); c.strokeStyle = "rgba(120,104,80,.4)"; c.lineWidth = 2; for (let y = 0; y < h; y += 32) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); for (let x = (y / 32 % 2) * 64; x < w; x += 128) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 32); c.stroke(); } } for (let i = 0; i < 600; i++) { c.fillStyle = `rgba(110,90,60,${al() * .08})`; c.fillRect(al() * w, al() * h, 3, 3); } }); arcadeT.wrapS = arcadeT.wrapT = THREE.RepeatWrapping;
  const voutT = tT(256, 256, (c, w, h) => { c.fillStyle = "#d8c8a6"; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 10) for (let x = ((y / 10) % 2) * 12; x < w; x += 24) { const k = al() * 30; c.fillStyle = `rgb(${168 + k},${84 + k * .6},${60 + k * .4})`; c.save(); c.translate(x + 11, y + 5); c.rotate(((y / 10) % 2 ? .35 : -.35)); c.fillRect(-10, -4, 20, 8); c.restore(); } c.fillStyle = "#e0d2b4"; c.fillRect(0, 0, w, 14); c.fillRect(0, h / 2, w, 10); for (let i = 0; i < 900; i++) { c.fillStyle = `rgba(80,60,40,${al() * .08})`; c.fillRect(al() * w, al() * h, 3, 3); } }); voutT.wrapS = voutT.wrapT = THREE.RepeatWrapping;
  const voutM = mat({ map: voutT, roughness: .95, side: THREE.DoubleSide });
  const arcadeM = mat({ map: arcadeT, roughness: .9, side: THREE.DoubleSide }), arcadeB = mat({ color: 0xdccfb4, roughness: .9 }), plafM = mat({ color: 0xe8dcc6, roughness: .95, side: THREE.DoubleSide }), murGal = mat({ color: 0xd8c8a8, roughness: .95 });
  const ferG = mat({ color: 0x1a1a1a, roughness: .5, metalness: .5 }), lanG = mat({ color: 0xf8e8b8, emissive: 0xffc870, emissiveIntensity: .15 }); NUIT.push([lanG, .15, 2.4]);
  // le fond de la galerie : les devantures des boutiques — galerie d'art, salon de thé, librairie, chapelier, antiquaire, pâtissier, parfumeur — et leurs enseignes
  /* (10.190) les boutiques de 1900, sous les arcades : le pain, la crème, les vins et le charbon, le petit café ; les ateliers (ébéniste, relieur, passementier, horloger) ;
     le brocanteur, le libraire d'occasion ; et les portes à plaque de cuivre — le notaire, le médecin, l'Académie d'architecture */
  const BOUT = [["BOULANGERIE", "#5a1e1e", "pain"], ["CRÈMERIE", "#2a4a6a", "creme"], ["VINS · CHARBONS", "#1e1e1e", "vins"], ["CAFÉ", "#1e3a2a", "cafe"], ["ÉBÉNISTE", "#4a3018", "ebene"], ["RELIURE · DORURE", "#3a1e3a", "livres"],
    ["PASSEMENTERIE", "#2a2a40", "rubans"], ["HORLOGERIE", "#1e1e2a", "horloges"], ["BROCANTE", "#5a4020", "broc"], ["LIBRAIRIE ANCIENNE", "#1e3a2a", "livres"], ["NOTAIRE", null, "plaque"], ["ÉPICERIE", "#6a4a10", "epice"],
    ["MÉDECIN", null, "plaque"], ["CHAPELLERIE", "#2a2a2a", "chapeaux"], ["ACADÉMIE D'ARCHITECTURE", null, "plaque"], ["BOUCHERIE", "#7a1e1e", "viande"]];
  /* (10.190) les enseignes d'époque : le panneau de bois peint pendu à sa potence de fer forgé, l'emblème doré du métier ; les panonceaux du notaire ; côté rue, le nom peint au-dessus de l'arc */
  const ensCache = new Map(), ensM = (sorte, nom, col) => { const cle = sorte + nom; if (ensCache.has(cle)) return ensCache.get(cle);
    const t = tT(256, 320, (c, w, h) => { const or = "#e2b850", fonce = col || "#2a2a2a"; c.clearRect(0, 0, w, h);
      if (sorte === "plaque") {   // le panonceau doré, ovale, aux armes
        c.fillStyle = or; c.beginPath(); c.ellipse(w / 2, h / 2, 118, 150, 0, 0, 7); c.fill(); c.strokeStyle = "#8a6420"; c.lineWidth = 8; c.stroke(); c.lineWidth = 3; c.beginPath(); c.ellipse(w / 2, h / 2, 100, 132, 0, 0, 7); c.stroke();
        c.fillStyle = "#6a4a18"; c.beginPath(); c.moveTo(w / 2, 70); c.lineTo(w / 2 + 40, 110); c.lineTo(w / 2 + 34, 170); c.lineTo(w / 2, 200); c.lineTo(w / 2 - 34, 170); c.lineTo(w / 2 - 40, 110); c.closePath(); c.fill(); c.fillStyle = or; c.font = `bold 26px ${serif}`; c.textAlign = "center"; c.fillText("RF", w / 2, 150);
        c.fillStyle = "#4a3010"; c.font = `bold ${nom.length > 10 ? 17 : 26}px ${serif}`; c.fillText(nom, w / 2, 245); return; }
      // le panneau : bois peint, bord doré, le haut cintré
      c.fillStyle = fonce; c.beginPath(); c.moveTo(16, 60); c.quadraticCurveTo(w / 2, 6, w - 16, 60); c.lineTo(w - 16, h - 14); c.lineTo(16, h - 14); c.closePath(); c.fill(); c.strokeStyle = or; c.lineWidth = 7; c.stroke(); c.lineWidth = 2; c.beginPath(); c.moveTo(30, 66); c.quadraticCurveTo(w / 2, 22, w - 30, 66); c.lineTo(w - 30, h - 28); c.lineTo(30, h - 28); c.closePath(); c.stroke();
      c.save(); c.translate(w / 2, 150); c.fillStyle = or; c.strokeStyle = or; c.lineWidth = 9; c.lineCap = "round";
      const S = { pain: () => { c.beginPath(); c.moveTo(-60, 20); c.bezierCurveTo(-80, -50, -10, -60, 0, 0); c.bezierCurveTo(10, -60, 80, -50, 60, 20); c.bezierCurveTo(40, 50, -40, 50, -60, 20); c.stroke(); c.beginPath(); c.moveTo(-30, 30); c.lineTo(30, -20); c.moveTo(30, 30); c.lineTo(-30, -20); c.stroke(); },
        creme: () => { c.beginPath(); c.moveTo(-30, -50); c.lineTo(30, -50); c.lineTo(40, -30); c.lineTo(40, 55); c.lineTo(-40, 55); c.lineTo(-40, -30); c.closePath(); c.fill(); c.fillStyle = fonce; c.fillRect(-22, -64, 44, 16); c.fillStyle = or; c.fillRect(-26, -72, 52, 10); c.fillStyle = fonce; c.font = `bold 30px ${serif}`; c.textAlign = "center"; c.fillText("LAIT", 0, 22); },
        vins: () => { for (let r = 0; r < 4; r++) for (let m = 0; m <= 3 - r; m++) { c.beginPath(); c.arc(-r * 0 - (3 - r) * 13 + m * 26, -30 + r * 24, 13, 0, 7); c.fill(); } c.beginPath(); c.moveTo(0, -46); c.lineTo(6, -72); c.stroke(); c.beginPath(); c.ellipse(26, -62, 22, 10, -.4, 0, 7); c.fill(); },
        cafe: () => { c.beginPath(); c.moveTo(-50, -20); c.lineTo(40, -20); c.lineTo(30, 40); c.quadraticCurveTo(-5, 58, -40, 40); c.closePath(); c.fill(); c.beginPath(); c.arc(48, 8, 18, -1.4, 1.4); c.stroke(); c.fillRect(-62, 52, 124, 8); c.lineWidth = 4; for (const x of [-20, 0, 20]) { c.beginPath(); c.moveTo(x, -34); c.bezierCurveTo(x - 10, -50, x + 10, -60, x, -76); c.stroke(); } },
        ebene: () => { c.fillRect(-62, -10, 124, 26); c.beginPath(); c.moveTo(-30, -10); c.quadraticCurveTo(-34, -46, -10, -48); c.lineTo(10, -48); c.quadraticCurveTo(28, -46, 24, -10); c.fill(); c.beginPath(); c.moveTo(-50, 22); c.lineTo(50, 22); c.stroke(); c.font = `bold 22px ${serif}`; c.textAlign = "center"; c.fillText("MEUBLES", 0, 62); },
        livres: () => { c.beginPath(); c.moveTo(0, -40); c.quadraticCurveTo(-40, -56, -74, -40); c.lineTo(-74, 40); c.quadraticCurveTo(-40, 26, 0, 42); c.quadraticCurveTo(40, 26, 74, 40); c.lineTo(74, -40); c.quadraticCurveTo(40, -56, 0, -40); c.closePath(); c.fill(); c.strokeStyle = fonce; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -40); c.lineTo(0, 42); c.stroke(); for (let y = -26; y < 30; y += 11) { c.beginPath(); c.moveTo(-62, y); c.lineTo(-12, y + 3); c.moveTo(12, y + 3); c.lineTo(62, y); c.stroke(); } },
        rubans: () => { c.beginPath(); c.ellipse(-34, -16, 34, 20, -.5, 0, 7); c.stroke(); c.beginPath(); c.ellipse(34, -16, 34, 20, .5, 0, 7); c.stroke(); c.beginPath(); c.arc(0, -10, 11, 0, 7); c.fill(); c.beginPath(); c.moveTo(-6, 0); c.lineTo(-30, 60); c.moveTo(6, 0); c.lineTo(30, 60); c.stroke(); },
        horloges: () => { c.beginPath(); c.arc(0, 0, 62, 0, 7); c.fill(); c.fillStyle = "#f2ead8"; c.beginPath(); c.arc(0, 0, 50, 0, 7); c.fill(); c.fillStyle = "#2a1a0a"; c.font = `bold 15px ${serif}`; c.textAlign = "center"; c.textBaseline = "middle"; ["XII", "III", "VI", "IX"].forEach((n, i) => { const a = i * Math.PI / 2 - Math.PI / 2; c.fillText(n, Math.cos(a) * 38, Math.sin(a) * 38); }); c.strokeStyle = "#2a1a0a"; c.lineWidth = 5; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -32); c.moveTo(0, 0); c.lineTo(22, 10); c.stroke(); },
        broc: () => { c.beginPath(); c.moveTo(-18, -60); c.lineTo(18, -60); c.lineTo(12, -44); c.quadraticCurveTo(54, -20, 30, 40); c.lineTo(-30, 40); c.quadraticCurveTo(-54, -20, -12, -44); c.closePath(); c.fill(); c.fillRect(-40, 44, 80, 12); c.fillStyle = fonce; c.beginPath(); c.arc(0, -2, 14, 0, 7); c.fill(); },
        chapeaux: () => { c.fillRect(-36, -64, 72, 84); c.beginPath(); c.ellipse(0, 22, 70, 16, 0, 0, 7); c.fill(); c.fillStyle = fonce; c.fillRect(-36, 2, 72, 10); },
        epice: () => { c.beginPath(); c.moveTo(0, -70); c.lineTo(36, 40); c.lineTo(-36, 40); c.closePath(); c.fill(); c.fillStyle = fonce; c.fillRect(-36, 22, 72, 8); c.fillStyle = or; c.font = `bold 20px ${serif}`; c.textAlign = "center"; c.fillText("DENRÉES COLONIALES", 0, 66); },
        viande: () => { c.beginPath(); c.ellipse(0, 4, 40, 46, 0, 0, 7); c.fill(); c.beginPath(); c.moveTo(-36, -20); c.quadraticCurveTo(-80, -40, -76, -74); c.quadraticCurveTo(-60, -40, -30, -36); c.fill(); c.beginPath(); c.moveTo(36, -20); c.quadraticCurveTo(80, -40, 76, -74); c.quadraticCurveTo(60, -40, 30, -36); c.fill(); c.fillStyle = fonce; c.beginPath(); c.arc(-15, -6, 6, 0, 7); c.arc(15, -6, 6, 0, 7); c.fill(); c.beginPath(); c.ellipse(0, 34, 18, 10, 0, 0, 7); c.fill(); } };
      (S[sorte] || S.broc)(); c.restore();
      c.fillStyle = or; c.font = `bold ${nom.length > 12 ? 19 : 26}px ${serif}`; c.textAlign = "center"; c.textBaseline = "middle"; const mots = nom.split(" · "); mots.forEach((m, j) => c.fillText(m, w / 2, h - 60 + (j - (mots.length - 1) / 2) * 24)); });
    t.colorSpace = THREE.SRGBColorSpace; const m = mat({ map: t, transparent: true, alphaTest: .5, side: THREE.DoubleSide, roughness: .6, metalness: sorte === "plaque" ? .5 : .1, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0 }); NUIT.push([m, 0, .18]); ensCache.set(cle, m); return m; };
  const bandM = (nom, col) => { const cle = "b" + nom; if (ensCache.has(cle)) return ensCache.get(cle); const t = tT(512, 80, (c, w, h) => { c.fillStyle = col || "#2a2a2a"; c.fillRect(0, 0, w, h); c.strokeStyle = "#c8a040"; c.lineWidth = 4; c.strokeRect(6, 6, w - 12, h - 12); c.fillStyle = "#e8c060"; c.textAlign = "center"; c.textBaseline = "middle"; c.font = `bold ${Math.min(46, 860 / nom.length)}px ${serif}`; c.fillText(nom, w / 2, h / 2 + 2); });
    const m = mat({ map: t, roughness: .6, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0 }); NUIT.push([m, 0, .25]); ensCache.set(cle, m); return m; };
  // la planche découpée (le haut cintré), en épaisseur ; son cadre doré ; les emblèmes du métier, en 3D, pendus dessous
  const planche = (() => { const X = (px) => (px / 256 - .5) * .78, Y = (py) => (.5 - py / 320) * .98, sh = new THREE.Shape(); sh.moveTo(X(16), Y(60)); sh.quadraticCurveTo(X(128), Y(6), X(240), Y(60)); sh.lineTo(X(240), Y(306)); sh.lineTo(X(16), Y(306)); sh.closePath();
    const g = new THREE.ExtrudeGeometry(sh, { depth: .07, bevelEnabled: true, bevelThickness: .008, bevelSize: .012, bevelSegments: 1, curveSegments: 10 }); g.translate(0, 0, -.035); return g; })();
  const cadreG = (() => { const X = (px) => (px / 256 - .5) * .78, Y = (py) => (.5 - py / 320) * .98, pts = []; for (let i = 0; i <= 12; i++) { const t = i / 12, x = (1 - t) ** 2 * 16 + 2 * (1 - t) * t * 128 + t * t * 240, y = (1 - t) ** 2 * 60 + 2 * (1 - t) * t * 6 + t * t * 60; pts.push(new THREE.Vector3(X(x), Y(y), 0)); } pts.push(new THREE.Vector3(X(240), Y(306), 0), new THREE.Vector3(X(16), Y(306), 0), new THREE.Vector3(X(16), Y(60), 0));
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, "catmullrom", .05), 48, .014, 5); })();
  const orE = mat({ color: 0xd8a838, roughness: .3, metalness: .85 }), boisCache = new Map(), boisE = (col) => { const c = col || "#3a2a1a"; if (!boisCache.has(c)) boisCache.set(c, mat({ color: new THREE.Color(c).multiplyScalar(.85), roughness: .7 })); return boisCache.get(c); };
  const noirE = mat({ color: 0x141414, roughness: .4 }), blancE = mat({ color: 0xf2ead8, roughness: .5 });
  const sph = (r, m, x, y, z, par) => { const o = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), m); o.position.set(x, y, z); par.add(o); return o; };
  const emblemes = {
    pain: (E) => { for (const sx of [-.07, .07]) { const t = new THREE.Mesh(new THREE.TorusGeometry(.09, .03, 8, 16), mat({ color: 0xc8883a, roughness: .7 })); t.position.set(sx, -.06, 0); E.add(t); } },
    vins: (E) => { const vm = mat({ color: 0x4a1a4a, roughness: .35, metalness: .2 }); for (let r = 0; r < 4; r++) for (let m = 0; m <= 3 - r; m++) for (const dz of [-.03, .03]) sph(.045, vm, -(3 - r) * .045 + m * .09, -r * .075, dz, E); const f = new THREE.Mesh(new THREE.CircleGeometry(.08, 5), mat({ color: 0x3a6a2a, side: THREE.DoubleSide })); f.position.set(.08, .07, 0); E.add(f); },
    horloges: (E) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(.16, .16, .08, 24), orE); c.rotation.x = Math.PI / 2; c.position.y = -.14; E.add(c); for (const sz of [1, -1]) { const d = new THREE.Mesh(new THREE.CircleGeometry(.13, 24), blancE); d.position.set(0, -.14, sz * .042); if (sz < 0) d.rotation.y = Math.PI; E.add(d); box(.012, .1, .01, noirE, 0, -.1, sz * .048, 0, E); box(.07, .012, .01, noirE, .03, -.14, sz * .048, 0, E); } },
    chapeaux: (E) => { cyl(.11, .1, .24, noirE, 0, -.14, 0, 16, E); cyl(.2, .2, .02, noirE, 0, -.27, 0, 20, E); cyl(.112, .112, .04, mat({ color: 0x5a1a1a }), 0, -.24, 0, 16, E); },
    cafe: (E) => { cyl(.1, .07, .14, blancE, 0, -.12, 0, 16, E); const a = new THREE.Mesh(new THREE.TorusGeometry(.05, .015, 6, 12), blancE); a.position.set(.11, -.11, 0); E.add(a); cyl(.15, .15, .015, blancE, 0, -.2, 0, 18, E); },
    livres: (E) => { box(.26, .34, .06, mat({ color: 0x7a2a2a, roughness: .6 }), 0, -.2, 0, 0, E); box(.24, .32, .062, blancE, .012, -.2, 0, 0, E); box(.02, .34, .07, orE, -.13, -.2, 0, 0, E); },
    creme: (E) => { cyl(.09, .11, .26, mat({ color: 0xc8ccd0, roughness: .3, metalness: .7 }), 0, -.16, 0, 14, E); cyl(.06, .09, .06, mat({ color: 0xc8ccd0, roughness: .3, metalness: .7 }), 0, -.01, 0, 14, E); },
    horloges2: null, rubans: (E) => { sph(.06, orE, 0, -.08, 0, E); for (const sx of [-1, 1]) { const b = new THREE.Mesh(new THREE.TorusGeometry(.07, .02, 6, 12), mat({ color: 0xc83a3a })); b.position.set(sx * .08, -.08, 0); b.scale.set(1.3, .8, 1); E.add(b); } },
    ebene: (E) => { box(.3, .05, .1, mat({ color: 0x6a4020 }), 0, -.12, 0, 0, E); box(.06, .08, .04, mat({ color: 0x3a2a1a }), .06, -.07, 0, 0, E); },
    epice: (E) => { const c = new THREE.Mesh(new THREE.ConeGeometry(.09, .3, 12), mat({ color: 0xf2ead8, roughness: .6 })); c.position.y = -.2; E.add(c); cyl(.092, .092, .05, mat({ color: 0x2a3a8a }), 0, -.33, 0, 12, E); },
    broc: (E) => { const v = new THREE.Mesh(new THREE.LatheGeometry([[0, 0], [.07, .01], [.1, .08], [.06, .18], [.08, .24]].map(([a, b]) => new THREE.Vector2(a, b)), 14), orE); v.position.y = -.32; E.add(v); },
    viande: (E) => { const t = new THREE.Mesh(new THREE.SphereGeometry(.12, 12, 10), orE); t.scale.set(1, 1.2, .7); t.position.y = -.16; E.add(t); for (const sx of [-1, 1]) { const c = new THREE.Mesh(new THREE.ConeGeometry(.03, .16, 6), blancE); c.position.set(sx * .13, -.04, 0); c.rotation.z = -sx * .9; E.add(c); } } };
  const enseignes = (G, W, royal, k, fz) => { const nb = Math.round(W / 4);
    for (let i = 0; i < nb; i++) { if (royal && (i === nb / 2 || i === nb / 2 - 1)) continue; const [nom, col, sorte] = BOUT[(k * 3 + i * 5) % BOUT.length], cx = -W / 2 + 2 + i * 4;
      if (sorte === "plaque") { for (const sx of [-1.25, 1.25]) { if (nom !== "NOTAIRE") break; const p = new THREE.Mesh(new THREE.PlaneGeometry(.5, .62), ensM("plaque", nom)); p.position.set(cx + sx * .5 - .4, 3.55, fz - GAL + .03); G.add(p); } continue; }
      // côté rue, au-dessus de l'arc : la planche peinte et son nom
      const b = new THREE.Mesh(new THREE.PlaneGeometry(2.5, .4), bandM(nom, col)); b.position.set(cx, 5.28, fz + .32); G.add(b);
      // sous la voûte : la potence de fer forgé, et le panneau qui pend, de profil (on le voit en marchant sous les arcades)
      const bx = cx + 1.25, bz0 = fz - GAL, L3 = 1.15, yb = 3.95; box(.05, .05, L3, ferG, bx, yb, bz0 + L3 / 2, 0, G); { const vo = new THREE.Mesh(new THREE.TorusGeometry(.22, .02, 4, 12, Math.PI * 1.5), ferG); vo.position.set(bx, yb - .22, bz0 + .26); vo.rotation.y = Math.PI / 2; G.add(vo); }
      box(.04, .04, .04, ferG, bx, yb + .03, bz0 + L3, 0, G); for (const dz of [.3, .95]) box(.015, .16, .015, ferG, bx, yb - .1, bz0 + dz, 0, G);
      { const P = new THREE.Group(); P.position.set(bx, yb - .68, bz0 + .63); P.rotation.y = Math.PI / 2; G.add(P);   /* (le panneau en épaisseur : la planche découpée, son cadre doré en relief, l'image sur les deux faces) */
        P.add(new THREE.Mesh(planche, boisE(col))); for (const sz of [1, -1]) { const f = new THREE.Mesh(new THREE.PlaneGeometry(.78, .98), ensM(sorte, nom, col)); f.position.z = sz * .041; if (sz < 0) f.rotation.y = Math.PI; P.add(f); const c2 = new THREE.Mesh(cadreG, orE); c2.position.z = sz * .045; P.add(c2); }
        for (const dx of [-.26, .26]) box(.015, .14, .015, ferG, dx, .55, 0, 0, P);
        const em = emblemes[sorte]; if (em) { const E2 = new THREE.Group(); E2.position.y = -.68; P.add(E2); box(.012, .16, .012, ferG, 0, .12, 0, 0, E2); em(E2); } }
      const bd = new THREE.Group(); bd.position.set(cx, 5.28, fz + .26); G.add(bd); box(2.62, .5, .06, boisE(col), 0, 0, -.03, 0, bd); for (const [y, h] of [[.27, .06], [-.27, .06]]) box(2.7, h, .1, orE, 0, y, 0, 0, bd); for (const sx of [-1.33, 1.33]) box(.06, .6, .1, orE, sx, 0, 0, 0, bd); } };
  const boutCache = new Map(), boutM = (W, royal, k) => { const cle = W + "|" + royal + "|" + k; if (boutCache.has(cle)) return boutCache.get(cle); const nb = Math.round(W / 4), PXB = 48;
    const dess = (nuit) => (c, w, h) => { let g3 = 911 + k * 31; const a3 = () => (g3 = (g3 * 16807) % 2147483647) / 2147483647; const Y = (m) => h - m * PXB;
      if (nuit) { c.fillStyle = "#000"; c.fillRect(0, 0, w, h); } else { c.fillStyle = "#d4c4a2"; c.fillRect(0, 0, w, h); c.strokeStyle = "rgba(120,100,70,.35)"; c.lineWidth = 1; for (let y = 0; y < h; y += PXB * .55) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); } }
      for (let i = 0; i < nb; i++) { if (royal && (i === nb / 2 || i === nb / 2 - 1)) continue; const [nom, col, sorte] = BOUT[(k * 3 + i * 5) % BOUT.length], x0 = i * 4 * PXB + .4 * PXB, ww = 3.2 * PXB;
        if (sorte === "plaque") {   // une porte cochère de bois, la plaque de cuivre gravée
          if (nuit) { if (a3() < .3) { c.fillStyle = "#ffcf80"; c.fillRect(x0 + .3 * PXB, Y(3.4), .4 * PXB, .5 * PXB); } continue; }
          c.fillStyle = "#3a2414"; c.fillRect(x0 + .8 * PXB, Y(3.3), 1.6 * PXB, 3.3 * PXB); c.strokeStyle = "#20140a"; c.lineWidth = 3; c.strokeRect(x0 + .9 * PXB, Y(3.2), .7 * PXB, 1.4 * PXB); c.strokeRect(x0 + 1.6 * PXB, Y(3.2), .7 * PXB, 1.4 * PXB); c.strokeRect(x0 + .9 * PXB, Y(1.6), .7 * PXB, 1.5 * PXB); c.strokeRect(x0 + 1.6 * PXB, Y(1.6), .7 * PXB, 1.5 * PXB);
          c.fillStyle = "#c8a040"; c.fillRect(x0 + 2.55 * PXB, Y(2.1), .55 * PXB, .4 * PXB); c.fillStyle = "#4a3010"; c.font = `bold ${PXB * .07}px ${serif}`; c.textAlign = "center"; c.fillText(nom, x0 + 2.82 * PXB, Y(1.93)); c.fillStyle = "#e8d8a8"; c.font = `${PXB * .2}px ${serif}`; c.fillText(nom, x0 + 1.6 * PXB, Y(3.55)); continue; }
        // la devanture de bois peint, l'enseigne aux lettres d'or, la vitrine à petits carreaux, la porte vitrée
        if (!nuit) { c.fillStyle = col; c.fillRect(x0, Y(4.0), ww, 4.0 * PXB); c.fillStyle = "#c8a040"; c.fillRect(x0 + 3, Y(3.98), ww - 6, 2); c.fillRect(x0 + 3, Y(3.3), ww - 6, 2);
          c.fillStyle = "#e2c060"; c.font = `bold ${Math.min(PXB * .3, ww / (nom.length * .62))}px ${serif}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(nom, x0 + ww / 2, Y(3.64)); }
        const vx = x0 + .15 * PXB, vw = 1.85 * PXB, vy0 = .55, vh = 2.5;
        if (nuit) { if (a3() < .8) { c.fillStyle = sorte === "cafe" || sorte === "vins" ? "#ffb860" : "#ffd890"; c.fillRect(vx, Y(vy0 + vh), vw, vh * PXB); c.fillRect(x0 + 2.2 * PXB, Y(3.1), .8 * PXB, 1.6 * PXB); c.fillStyle = "#000"; for (let m = 1; m < 4; m++) c.fillRect(vx + vw * m / 4 - 1, Y(vy0 + vh), 2, vh * PXB); for (let m = 1; m < 3; m++) c.fillRect(vx, Y(vy0 + vh * m / 3) - 1, vw, 2); } continue; }
        const gr = c.createLinearGradient(0, Y(vy0 + vh), 0, Y(vy0)); gr.addColorStop(0, "#efe0bc"); gr.addColorStop(1, "#a88a5a"); c.fillStyle = gr; c.fillRect(vx, Y(vy0 + vh), vw, vh * PXB);
        // la marchandise derrière la vitre
        const R0 = (n, f) => { for (let m = 0; m < n; m++) f(vx + 6 + a3() * (vw - 24), Y(vy0 + .15) - a3() * (vh - .6) * PXB); };
        if (sorte === "pain") { for (let r = 0; r < 3; r++) for (let m = 0; m < 4; m++) { c.fillStyle = ["#c88a3a", "#a86a2a", "#d89a4a"][m % 3]; c.beginPath(); c.ellipse(vx + 14 + m * 21, Y(vy0 + .4 + r * .75), r ? 10 : 18, r ? 6 : 5, 0, 0, 7); c.fill(); } }
        else if (sorte === "creme") { for (let m = 0; m < 4; m++) { c.fillStyle = "#f2d88a"; c.beginPath(); c.ellipse(vx + 14 + m * 21, Y(vy0 + .5), 9, 5, 0, 0, 7); c.fill(); c.fillStyle = "#c8ccd0"; c.fillRect(vx + 8 + m * 21, Y(vy0 + 1.7), 12, 22); } }
        else if (sorte === "vins") { for (let m = 0; m < 9; m++) { c.fillStyle = ["#1e3a1e", "#3a1e1e"][m % 2]; c.fillRect(vx + 6 + m * 9.5, Y(vy0 + 1.2), 6, 24); c.fillRect(vx + 7.5 + m * 9.5, Y(vy0 + 1.45), 3, 10); } c.fillStyle = "#2a2a2a"; c.fillRect(vx + 8, Y(vy0 + .4), vw - 16, 12); }
        else if (sorte === "cafe") { c.fillStyle = "#6a4a2a"; c.fillRect(vx, Y(vy0 + .9), vw, 6); for (let m = 0; m < 3; m++) { c.fillStyle = "#e8e0d0"; c.fillRect(vx + 12 + m * 28, Y(vy0 + 1.1), 8, 8); } c.fillStyle = "rgba(60,40,20,.5)"; c.font = `italic ${PXB * .16}px ${serif}`; c.textAlign = "center"; c.fillText("Café · Bière · Liqueurs", vx + vw / 2, Y(vy0 + 2.2)); }
        else if (sorte === "ebene") { c.fillStyle = "#6a4020"; c.fillRect(vx + 10, Y(vy0 + 2.1), 30, 2.1 * PXB - 4); c.fillRect(vx + 50, Y(vy0 + .9), 34, 6); c.fillRect(vx + 52, Y(vy0 + .9), 4, .9 * PXB); c.fillRect(vx + 78, Y(vy0 + .9), 4, .9 * PXB); }
        else if (sorte === "livres") { for (let r = 0; r < 3; r++) for (let m = 0; m < 12; m++) { c.fillStyle = ["#7a2a2a", "#2a4a6a", "#5a4a2a", "#2a5a3a", "#c8a040", "#4a2a4a"][(m + r * 2) % 6]; c.fillRect(vx + 4 + m * 7.4, Y(vy0 + .3 + r * .8 + .6), 6, .6 * PXB - (m % 3) * 2); } }
        else if (sorte === "rubans") { for (let m = 0; m < 10; m++) { c.fillStyle = ["#c83a3a", "#3a6ac8", "#d8b040", "#7a3a9a", "#3a9a6a"][m % 5]; c.fillRect(vx + 6 + m * 8.6, Y(vy0 + vh - .1), 3, (1 + (m % 3) * .4) * PXB); } }
        else if (sorte === "horloges") { for (let m = 0; m < 5; m++) { const cx = vx + 14 + (m % 3) * 30, cy = Y(vy0 + .8 + Math.floor(m / 3) * 1.1); c.fillStyle = "#f2ead8"; c.beginPath(); c.arc(cx, cy, 10, 0, 7); c.fill(); c.strokeStyle = "#5a4020"; c.lineWidth = 2; c.stroke(); c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx, cy - 7); c.moveTo(cx, cy); c.lineTo(cx + 5, cy); c.stroke(); } }
        else if (sorte === "chapeaux") { for (let m = 0; m < 4; m++) { c.fillStyle = ["#1a1a1a", "#5a4a3a", "#2a2a3a", "#e8dcc4"][m]; const cx = vx + 14 + m * 21, cy = Y(vy0 + .8 + (m % 2) * .9); c.fillRect(cx - 7, cy - 14, 14, 14); c.fillRect(cx - 11, cy, 22, 3); } }
        else if (sorte === "epice") { for (let m = 0; m < 8; m++) { c.fillStyle = ["#c86a2a", "#8a6a2a", "#d8b040", "#6a3a1a"][m % 4]; c.fillRect(vx + 6 + (m % 4) * 21, Y(vy0 + .6 + Math.floor(m / 4) * .9), 14, 18); } }
        else if (sorte === "viande") { for (let m = 0; m < 4; m++) { c.fillStyle = "#a83a3a"; c.beginPath(); c.ellipse(vx + 14 + m * 21, Y(vy0 + 1.8), 7, 14, 0, 0, 7); c.fill(); c.fillStyle = "#c8c8c8"; c.fillRect(vx + 13 + m * 21, Y(vy0 + 2.4), 2, 8); } }
        else R0(9, (x, y) => { c.fillStyle = ["#6a4020", "#8a7a5a", "#3a4a5a", "#a88a4a", "#5a2a2a"][Math.floor(a3() * 5)]; c.fillRect(x, y - 14, 10 + a3() * 12, 10 + a3() * 14); });
        c.fillStyle = col; for (let m = 1; m < 4; m++) c.fillRect(vx + vw * m / 4 - 1.5, Y(vy0 + vh), 3, vh * PXB); for (let m = 1; m < 3; m++) c.fillRect(vx, Y(vy0 + vh * m / 3) - 1.5, vw, 3);
        // la porte vitrée
        c.fillStyle = col; c.fillRect(x0 + 2.15 * PXB, Y(3.2), .9 * PXB, 3.2 * PXB); c.fillStyle = "#c8b890"; c.fillRect(x0 + 2.25 * PXB, Y(3.05), .7 * PXB, 1.7 * PXB); c.fillStyle = col; c.fillRect(x0 + 2.58 * PXB, Y(3.05), 3, 1.7 * PXB); c.fillStyle = "#c8a040"; c.fillRect(x0 + 2.9 * PXB, Y(1.4), 3, 4); } };
    const t = tT(W * PXB, 5.2 * PXB, dess(false)), te = tT(W * PXB, 5.2 * PXB, dess(true)); const m = mat({ map: t, roughness: .8, emissive: 0xffffff, emissiveMap: te, emissiveIntensity: 0 }); NUIT.push([m, 0, 1]); boutCache.set(cle, m); return m; };
  const pierreR = mat({ color: 0xeedcbc, roughness: .85 });
  const lucM = mat({ color: 0xe8dcc4, roughness: .8 }), vitreL = mat({ color: 0x2a3440, roughness: .2, metalness: .3, emissive: 0xffd890, emissiveIntensity: 0 }); NUIT.push([vitreL, 0, .5]);
  // un pavillon : la façade sur la place (devant, z local +), la façade arrière, la toiture et ses lucarnes, les cheminées
  const pavillon = (cx, cz, ry, W, royal, k, hugo = false) => { const G = new THREE.Group(); G.position.set(cx, 0, cz); G.rotation.y = ry; scene.add(G); const H = royal ? 18 : 14, D = PROF;
    const fm = facM(W, royal, k % 3), HA = 5.8; { const g = new THREE.PlaneGeometry(W, H - HA), uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setY(i, HA / H + uv.getY(i) * (1 - HA / H)); const av = new THREE.Mesh(g, fm); av.position.set(0, (H + HA) / 2, D / 2); G.add(av); }
    { // (10.190) les vraies arcades : le mur de pierre percé de ses arcs, et derrière, la galerie couverte où l'on se promène — les boutiques au fond, les lanternes suspendues
      const sh = new THREE.Shape(); sh.moveTo(-W / 2, 0); sh.lineTo(W / 2, 0); sh.lineTo(W / 2, HA); sh.lineTo(-W / 2, HA); sh.closePath(); const nb = Math.round(W / 4);
      const arc = (x0, lw, hp) => { const r = lw / 2, h = new THREE.Path(); h.moveTo(x0, 0); h.lineTo(x0 + lw, 0); h.lineTo(x0 + lw, hp); h.absarc(x0 + r, hp, r, 0, Math.PI, false); h.lineTo(x0, 0); sh.holes.push(h); };
      for (let i = 0; i < nb; i++) { if (royal && i === nb / 2) continue; if (royal && i === nb / 2 - 1) { arc(-3.2, 6.4, 3.6); continue; } arc(-W / 2 + i * 4 + .5, 3, 3.2); }
      const gA = new THREE.ShapeGeometry(sh, 16), uv = gA.attributes.uv, pp = gA.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, pp.getX(i) / 3, pp.getY(i) / 3);
      const mA = new THREE.Mesh(gA, arcadeM); mA.position.z = D / 2; G.add(mA); const mB = new THREE.Mesh(gA, arcadeM); mB.position.z = D / 2 - .5; mB.rotation.y = 0; mB.scale.z = -1; G.add(mB);   // (l'épaisseur du mur : le revers, côté galerie)
      for (let i = 0; i <= nb; i++) { const x = -W / 2 + i * 4; if (royal && x === 0) continue; box(1, HA, .5, arcadeB, x, HA / 2, D / 2 - .25, 0, G); }   // (les piles, en épaisseur)
      // la voûte de brique, en berceau, et ses arcs de pierre à chaque pile (comme sur les vieilles cartes postales) ; les lanternes de fer pendues au milieu de chaque travée
      { const VR = 2.4, VA = Math.asin(2 / VR), cy = 4.7 - VR * Math.cos(VA), cz = D / 2 - GAL / 2, g = new THREE.PlaneGeometry(W, 2 * VR * VA, Math.max(2, nb), 14), pp = g.attributes.position, uv = g.attributes.uv;
        for (let i = 0; i < pp.count; i++) { const px = pp.getX(i), py = pp.getY(i), a = py / VR; pp.setXYZ(i, px, cy + VR * Math.cos(a), cz + VR * Math.sin(a)); uv.setXY(i, px / 2, py / 2); } g.computeVertexNormals(); G.add(new THREE.Mesh(g, voutM));
        for (let i = 0; i <= nb; i++) { const x = -W / 2 + i * 4; const r = new THREE.Mesh(new THREE.TorusGeometry(VR - .02, .16, 5, 18, 2 * VA), arcadeB); r.rotation.set(0, Math.PI / 2, Math.PI / 2 - VA); r.position.set(x, cy, cz); G.add(r); } }
      G.updateMatrixWorld(true);
      for (let i = 0; i < nb; i++) { const x = -W / 2 + 2 + i * 4, zc = D / 2 - GAL / 2; if (i % 2 === 0) { box(.02, 1.05, .02, ferG, x, 5.25, zc, 0, G); const l = new THREE.Mesh(new THREE.CylinderGeometry(.2, .13, .5, 6), lanG); l.position.set(x, 4.45, zc); G.add(l); cyl(.05, .26, .2, ferG, x, 4.78, zc, 6, G); cyl(.1, .1, .08, ferG, x, 4.16, zc, 6, G); const w = G.localToWorld(new THREE.Vector3(x, 4.2, zc)); if (i % 4 === 0) LAMPES.push([w.x, w.y, w.z]); } }
      enseignes(G, W, royal, k, D / 2);
      const fb = new THREE.Mesh(new THREE.PlaneGeometry(W, 5.2), boutM(W, royal, k)); fb.position.set(0, 2.6, D / 2 - GAL); G.add(fb);
      if (royal) { const v = new THREE.Mesh(new THREE.PlaneGeometry(6, 5), mat({ color: 0x0e0c0a })); v.position.set(0, 2.5, D / 2 - GAL + .02); G.add(v); } }
    const ar = new THREE.Mesh(new THREE.PlaneGeometry(W, H), facM(W, royal, (k + 1) % 3)); ar.position.set(0, H / 2, -D / 2); ar.rotation.y = Math.PI; G.add(ar);
    const Hr = royal ? 10 : 7.5, t = new THREE.Mesh(toitG(W + .5, D + .6, Hr, royal ? D * .45 : D * .38), ardoiseM); t.position.y = H; G.add(t);
    box(W - D * .76 + .2, .25, .3, zincM, 0, H + Hr + .1, 0, 0, G);   // (le faîtage)
    box(W + .6, .45, D + .7, pierreM, 0, H - .05, 0, 0, G);   // (la corniche)
    const nb = Math.round(W / 4); for (const s of [1, -1]) for (let i = 0; i < nb; i++) { if (PEU && i % 2) continue; const x = -W / 2 + 2 + i * 4, z = s * (D / 2 - 1.3), y = H + 1.8, L2 = new THREE.Group(); L2.position.set(x, y, z); L2.rotation.y = s > 0 ? 0 : Math.PI; G.add(L2);
      box(1.5, 2, 1.6, lucM, 0, 0, -.3, 0, L2); box(1, 1.45, .05, vitreL, 0, -.05, .51, 0, L2); for (const sx of [-.6, .6]) box(.2, 1.7, .14, pierreR, sx, -.05, .55, 0, L2); box(1.5, .16, .18, pierreR, 0, .8, .56, 0, L2); { const fr2 = new THREE.Mesh(new THREE.CylinderGeometry(.72, .72, .2, 14, 1, false, -Math.PI / 2, Math.PI), pierreR); fr2.rotation.x = -Math.PI / 2; fr2.position.set(0, .88, .52); fr2.scale.set(1, 1, .55); L2.add(fr2); } const fr = box(1.9, .7, 1.9, ardoiseM, 0, 1.25, -.3, 0, L2); fr.scale.set(1, 1, 1); const pd = new THREE.Mesh(new THREE.CylinderGeometry(0, 1.05, .8, 4, 1), ardoiseM); pd.rotation.y = Math.PI / 4; pd.scale.set(1.05, 1, 1.1); pd.position.set(0, 1.4, -.3); L2.add(pd); }
    for (const sx of [-1, 1]) { const x = sx * (W / 2 - 1.4), hC = H + Hr + (royal ? 3 : 2.6); box(1.3, hC - H, 2.6, briqueM, x, H + (hC - H) / 2, 0, 0, G); box(1.6, .3, 2.9, pierreM, x, hC + .15, 0, 0, G); for (const dz of [-.8, 0, .8]) cyl(.12, .14, .5, mat({ color: 0xa8604a }), x, hC + .5, dz, 6, G); }
    { /* (10.190, du relief) les chaînes de pierre en saillie, les encadrements moulurés des fenêtres, les appuis, les balcons de fer forgé, les bandeaux, la corniche à moulures */
      const fz = D / 2, etg = royal ? [[6.6, 3.6], [11, 3.2], [14.8, 2.6]] : [[6.6, 3.5], [10.8, 2.8]];
      box(W, .32, .22, pierreR, 0, 5.95, fz + .11, 0, G); box(W, .12, .3, pierreR, 0, 6.15, fz + .15, 0, G);   // (le bandeau au-dessus des arcades)
      for (const [y0] of etg.slice(1)) box(W, .18, .12, pierreR, 0, y0 - .45, fz + .06, 0, G);
      box(W + .1, .22, .34, pierreR, 0, H - .62, fz + .17, 0, G); box(W + .2, .2, .48, pierreR, 0, H - .42, fz + .24, 0, G);   // (les moulures sous la corniche)
      for (let i = 0; i < nb; i++) { const cx = -W / 2 + 2 + i * 4;
        for (const sx of [-1.02, 1.02]) box(.26, H - 6.7, .06, pierreR, cx + sx, (6.3 + H - .4) / 2, fz + .03, 0, G);   // (les chaînes de pierre, de chaque côté, un peu en avant de la brique)
        for (const [y0, hh] of etg) { const xw = cx - .7, ww = 1.4;
          box(ww + .4, .16, .2, pierreR, cx, y0 + hh + .14, fz + .1, 0, G); box(ww + .56, .1, .26, pierreR, cx, y0 + hh + .27, fz + .13, 0, G);   // (le linteau et sa corniche)
          box(.16, hh + .2, .16, pierreR, xw - .1, y0 + hh / 2, fz + .08, 0, G); box(.16, hh + .2, .16, pierreR, xw + ww + .1, y0 + hh / 2, fz + .08, 0, G);   // (les jambages)
          box(ww + .5, .12, .3, pierreR, cx, y0 - .08, fz + .15, 0, G);   // (l'appui)
          if (y0 < 7) { const bz = fz + .42; box(ww + .3, .05, .04, ferG, cx, y0 + .95, bz, 0, G); box(ww + .3, .04, .04, ferG, cx, y0 + .1, bz, 0, G); box(ww + .3, .05, .5, ferG, cx, y0 + .02, fz + .2, 0, G);
            for (let t = -ww / 2; t <= ww / 2 + .01; t += .14) box(.022, .85, .022, ferG, cx + t, y0 + .52, bz, 0, G);
            for (const sx of [-.35, .35]) { const r = new THREE.Mesh(new THREE.TorusGeometry(.14, .018, 4, 10), ferG); r.position.set(cx + sx, y0 + .55, bz); G.add(r); } } } } }
    G.updateMatrixWorld(true); const plat = []; G.traverse(o => { if (o.isMesh) plat.push(o); });   /* (on pose chaque pièce directement dans la scène : la matrice les fusionne, pour que tout reste fluide) */
    for (const o of plat) { o.matrixWorld.decompose(o.position, o.quaternion, o.scale); scene.add(o); } scene.remove(G);
    OBS.push(null); return G; };
  // les quatre côtés : sept pavillons de 16 m chacun ; au milieu du sud, le pavillon du Roi ; au milieu du nord, le pavillon de la Reine ; aux quatre coins, le pavillon d'angle
  for (let i = 0; i < 7; i++) { const u = -FA + 8 + i * 16, royal = i === 3;
    pavillon(u, -FA - PROF / 2, 0, 16, royal, i);                     // le nord (la façade regarde le sud, vers le square)
    pavillon(u, FA + PROF / 2, Math.PI, 16, royal, i + 3, i === 5);   // le sud (le pavillon du Roi au milieu ; la maison de Victor Hugo, le numéro 6, vers l'est)
    pavillon(-FA - PROF / 2, u, Math.PI / 2, 16, false, i + 5);      // l'ouest
    pavillon(FA + PROF / 2, u, -Math.PI / 2, 16, false, i + 1); }    // l'est
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const cx = sx * (FA + PROF / 2), cz = sz * (FA + PROF / 2), c2 = PROF - GAL, cx2 = sx * (FA + GAL + c2 / 2), cz2 = sz * (FA + GAL + c2 / 2); box(c2, 5.2, c2, briqueM, cx2, 2.6, cz2); box(PROF, 8.8, PROF, briqueM, cx, 9.6, cz); { const b = box(GAL, .02, GAL, plafM, sx * (FA + GAL / 2), 5.19, sz * (FA + GAL / 2)); void b; } for (const [w, d, x, z] of [[GAL, .05, sx * (FA + GAL / 2), sz * (FA + GAL)], [.05, GAL, sx * (FA + GAL), sz * (FA + GAL / 2)]]) box(w, 5.2, d, murGal, x, 2.6, z); const t = new THREE.Mesh(toitG(PROF + .6, PROF + .6, 7.5, PROF * .5), ardoiseM); t.position.set(cx, 14, cz); scene.add(t); box(1.3, 11, 2.4, briqueM, cx, 19, cz); }
  // les arcades : les piliers de pierre devant la façade, qui donnent du relief (on voit l'ombre sous les voûtes)
  { const pilG = new THREE.BoxGeometry(.9, 5.6, .7); const pils = []; for (let i = 0; i <= 28; i++) { const u = -FA + i * 4; if (Math.abs(u) > FA - .2) continue; if (u !== 0) pils.push([u, FA - .3, 0], [u, -FA + .3, 0]); pils.push([FA - .3, u, 1], [-FA + .3, u, 1]); }
    const im = new THREE.InstancedMesh(pilG, pierreM, pils.length), mm = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(); pils.forEach(([x, z, r], i) => { q.setFromEuler(e.set(0, r ? Math.PI / 2 : 0, 0)); mm.compose(new THREE.Vector3(x, 2.8, z), q, new THREE.Vector3(1, 1, 1)); im.setMatrixAt(i, mm); }); im.receiveShadow = true; scene.add(im); }

  /* ---------- la maison de Victor Hugo (le numéro 6, au sud-est) : la porte cochère, la plaque bleue, la lanterne ---------- */
  const HUGO = { x: 46, z: FA - .05 };
  { const t = tT(512, 160, (c, w, h) => { c.fillStyle = "#1a3a7a"; c.fillRect(0, 0, w, h); c.strokeStyle = "#f2ead8"; c.lineWidth = 8; c.strokeRect(10, 10, w - 20, h - 20); c.fillStyle = "#f2ead8"; c.textAlign = "center"; c.font = `bold 44px ${serif}`; c.fillText("MAISON DE", w / 2, 68); c.font = `bold 52px ${serif}`; c.fillText("VICTOR HUGO", w / 2, 126); });
    const p = new THREE.Mesh(new THREE.PlaneGeometry(1.6, .5), mat({ map: t, roughness: .4, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0 })); p.position.set(HUGO.x, 4.25, FA + GAL - .06); p.rotation.y = Math.PI; scene.add(p); NUIT.push([p.material, 0, .4]);
    const porte = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 3.6), mat({ map: tT(128, 192, (c, w, h) => { c.fillStyle = "#3a2414"; c.fillRect(0, 0, w, h); c.strokeStyle = "#20140a"; c.lineWidth = 4; for (const [x, y, ww, hh] of [[8, 8, 52, 80], [68, 8, 52, 80], [8, 98, 52, 86], [68, 98, 52, 86]]) c.strokeRect(x, y, ww, hh); c.fillStyle = "#c8a040"; c.beginPath(); c.arc(62, 100, 5, 0, 7); c.fill(); c.beginPath(); c.arc(66, 100, 5, 0, 7); c.fill(); }), roughness: .6 }));
    porte.position.set(HUGO.x, 1.75 + TROT, FA + GAL - .05); porte.rotation.y = Math.PI; scene.add(porte);
    const lan = mat({ color: 0xf8e8b8, emissive: 0xffc870, emissiveIntensity: .1 }); NUIT.push([lan, .1, 2.2]); const l = new THREE.Mesh(new THREE.CylinderGeometry(.16, .12, .4, 6), lan); l.position.set(HUGO.x - 1.6, 3.4, FA + GAL - .3); scene.add(l); LAMPES.push([HUGO.x, 4.2, FA - 1.4]); }

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
  const ARB = [];   /* (10.190 : d'après les photos, plus d'arbres en boule : les tilleuls taillés en rideau, plus bas) */
  if (ARB.length) { /* (10.190, du détail) de vrais tilleuls : le tronc qui se divise en grosses branches, puis le houppier fait de nombreuses touffes de feuillage bosselées,
       de verts différents (plus clair au soleil, en haut ; plus sombre dessous) ; l'ombre douce au pied */
    const ecorceT = tT(64, 256, (c, w, h) => { c.fillStyle = "#4a3c2e"; c.fillRect(0, 0, w, h); for (let i = 0; i < 160; i++) { c.fillStyle = `rgba(${20 + al() * 40},${16 + al() * 30},${10 + al() * 20},.6)`; c.fillRect(al() * w, al() * h, 2 + al() * 3, 10 + al() * 30); } }, 1, 1);
    const troncM = mat({ map: ecorceT, color: 0xb8a890, roughness: 1 });
    const bosse = (sd) => { const g = new THREE.IcosahedronGeometry(1, 3), p = g.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const n = 1 + .16 * Math.sin(v.x * 5.3 + sd) * Math.sin(v.y * 4.7 + sd * 2) + .1 * Math.sin(v.z * 7.1 + v.x * 3 + sd) + .06 * Math.sin(v.y * 13 + v.z * 11); const nr = g.attributes.normal; nr.setXYZ(i, v.x, v.y * 1.2 + .15, v.z); v.multiplyScalar(n); if (v.y < -.3) v.y = -.3 + (v.y + .3) * .45; p.setXYZ(i, v.x, v.y, v.z); } const nr = g.attributes.normal, w = new THREE.Vector3(); for (let i = 0; i < nr.count; i++) { w.fromBufferAttribute(nr, i).normalize(); nr.setXYZ(i, w.x, w.y, w.z); } return g; };
    const feuT = tT(256, 256, (c, w, h) => { c.fillStyle = "#9a9a9a"; c.fillRect(0, 0, w, h); for (let i = 0; i < 1400; i++) { const k = 80 + al() * 175; c.fillStyle = `rgb(${k},${k},${k})`; c.save(); c.translate(al() * w, al() * h); c.rotate(al() * 6.28); c.beginPath(); c.ellipse(0, 0, 7, 3.5, 0, 0, 7); c.fill(); c.restore(); } }, 3, 3);
    const FG = [bosse(1), bosse(2.7), bosse(4.1)], feuM = new THREE.MeshStandardMaterial({ map: feuT, color: 0xffffff, roughness: .85 });
    const tg = new THREE.CylinderGeometry(.16, .3, 1, 8); tg.translate(0, .5, 0); const bg = new THREE.CylinderGeometry(.06, .13, 1, 6); bg.translate(0, .5, 0);
    const NT = ARB.length, NB = PEU ? 14 : 26, it = new THREE.InstancedMesh(tg, troncM, NT), ib = new THREE.InstancedMesh(bg, troncM, NT * 5), ifs = FG.map(g => new THREE.InstancedMesh(g, feuM, NT * NB)), nf = [0, 0, 0];
    const mm = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), sc = new THREE.Vector3(), col = new THREE.Color(); let nb2 = 0;
    ARB.forEach(([x, z], i) => { const ht = 2.6 + al() * .8, hR = 7.2 + al() * 1.6, rR = 3 + al() * .8; mm.compose(v.set(x, 0, z), q.setFromEuler(e.set((al() - .5) * .06, al() * 6, (al() - .5) * .06)), sc.set(1, ht, 1)); it.setMatrixAt(i, mm);
      for (let b = 0; b < 5; b++) { const a = b * 1.256 + al() * .6, inc = .55 + al() * .35, l = 2 + al() * 1.2; mm.compose(v.set(x, ht - .15, z), q.setFromEuler(e.set(Math.cos(a) * inc, 0, -Math.sin(a) * inc, "XZY")), sc.set(1, l, 1)); ib.setMatrixAt(nb2++, mm); }
      for (let j = 0; j < NB; j++) { const u = al(), a = al() * 6.283, rr = Math.sqrt(u) * rR, y = ht + 1.4 + (hR - ht - 1.4) * (.15 + .85 * al()) - (rr / rR) ** 2 * 1.6, r = .9 + al() * .9 - rr / rR * .3, k = j % 3;
        mm.compose(v.set(x + Math.cos(a) * rr, y, z + Math.sin(a) * rr), q.setFromEuler(e.set(al(), al() * 6, al())), sc.set(r, r * .82, r)); ifs[k].setMatrixAt(nf[k], mm);
        const lum = (y - ht) / (hR - ht); col.setHSL(.24 + al() * .05, .42 + al() * .15, .17 + lum * .14 + al() * .04); ifs[k].setColorAt(nf[k]++, col); } });
    it.castShadow = true; ib.castShadow = true; ib.count = nb2; scene.add(it, ib); ifs.forEach((im, k) => { im.count = nf[k]; im.castShadow = true; im.instanceColor.needsUpdate = true; scene.add(im); });
    // l'ombre douce sous chaque arbre (au sol, un disque sombre et flou)
    const omT = tT(64, 64, (c, w, h) => { const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, "rgba(0,0,0,.42)"); g.addColorStop(.6, "rgba(0,0,0,.22)"); g.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = g; c.fillRect(0, 0, w, h); });
    const og = new THREE.PlaneGeometry(1, 1); og.rotateX(-Math.PI / 2); const io = new THREE.InstancedMesh(og, new THREE.MeshBasicMaterial({ map: omT, transparent: true, depthWrite: false }), NT); ARB.forEach(([x, z], i) => { mm.compose(v.set(x + .6, .05, z + .4), q.identity(), sc.set(8, 1, 8)); io.setMatrixAt(i, mm); }); io.renderOrder = 1; scene.add(io); }
  /* (10.190, d'après les photos) les tilleuls taillés au carré, en rideau : un long mur de feuillage vert tendre posé sur les troncs, tout autour du square (coupé aux quatre portes) ;
     et de chaque côté des fontaines, les ifs taillés en cône */
  { const vertT = tT(256, 256, (c, w, h) => { c.fillStyle = "#5e8a32"; c.fillRect(0, 0, w, h); for (let i = 0; i < 2600; i++) { const g = al(); c.fillStyle = `rgb(${70 + g * 70},${110 + g * 80},${30 + g * 40})`; c.save(); c.translate(al() * w, al() * h); c.rotate(al() * 6.28); c.beginPath(); c.ellipse(0, 0, 4 + al() * 3, 2 + al() * 1.5, 0, 0, 7); c.fill(); c.restore(); } for (let i = 0; i < 260; i++) { c.fillStyle = "rgba(20,40,10,.35)"; c.fillRect(al() * w, al() * h, 3, 3); } });
    vertT.wrapS = vertT.wrapT = THREE.RepeatWrapping; const haieM = mat({ map: vertT, roughness: .9 }), troncR = mat({ color: 0x4a3c2e, roughness: 1 });
    const haie = (cx, cz, L, rot) => { const T3 = 3.4, H3 = 4.4, g = new THREE.BoxGeometry(L, H3, T3, Math.ceil(L / .9), 6, 4), p = g.attributes.position, uv = g.attributes.uv, n = g.attributes.normal, v = new THREE.Vector3();
      for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const wx = cx + (rot ? v.z : v.x), wz = cz + (rot ? v.x : v.z), b = .16 * Math.sin(wx * 1.7 + v.y * 2.1) * Math.sin(wz * 1.3 + v.y * 1.6) + .08 * Math.sin(wx * 4.1 + wz * 3.3 + v.y * 5); p.setXYZ(i, v.x + n.getX(i) * b, v.y + n.getY(i) * b * .6, v.z + n.getZ(i) * b);
        const ax = Math.abs(n.getX(i)) > .5, ay = Math.abs(n.getY(i)) > .5; uv.setXY(i, (ax ? v.z : v.x) / 2.2, (ay ? v.z : v.y) / 2.2); } g.computeVertexNormals();
      const o = add(g, haieM, cx, 3.0 + H3 / 2, cz, rot ? Math.PI / 2 : 0); o.castShadow = true; for (let t = -L / 2 + 1.2; t < L / 2; t += 3.4) for (const d of [-.9, .9]) cyl(.13, .2, 3.2, troncR, cx + (rot ? d : t), 1.6, cz + (rot ? t : d), 7); };
    for (const s of [-1, 1]) for (const h of [-1, 1]) { haie(h * 19.3, s * 37.2, 31, false); haie(s * 37.2, h * 19.3, 31, true); }
    // l'ombre sous le rideau
    const omT2 = tT(64, 64, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(.5, "rgba(0,0,0,.35)"); g.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = g; c.fillRect(0, 0, w, h); });
    const omM = new THREE.MeshBasicMaterial({ map: omT2, transparent: true, depthWrite: false }); for (const s of [-1, 1]) { const a1 = add(new THREE.PlaneGeometry(80, 7), omM, 0, .05, s * 37.2); a1.rotation.x = -Math.PI / 2; const a2 = add(new THREE.PlaneGeometry(80, 7), omM, s * 37.2, .051, 0); a2.rotation.x = -Math.PI / 2; a2.rotation.z = Math.PI / 2; }
    const ifM = mat({ map: vertT, color: 0x6a8a5a, roughness: .9 }); for (const [fx, fz] of FONT) for (const sg of [-1, 1]) { const a = Math.atan2(-fz, -fx) + sg * 1.1, x = fx + Math.cos(a) * 7.2, z = fz + Math.sin(a) * 7.2, c2 = add(new THREE.ConeGeometry(.85, 2.6, 16, 3), ifM, x, 1.4, z); c2.castShadow = true; cyl(.12, .14, .2, troncR, x, .1, z, 6); } }
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
    const nappeT = tT(64, 256, (c, w, h) => { c.clearRect(0, 0, w, h); for (let i = 0; i < 70; i++) { const x = al() * w, a = .25 + al() * .45; const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, `rgba(235,245,255,${a})`); g.addColorStop(1, `rgba(200,225,245,${a * .4})`); c.fillStyle = g; c.fillRect(x, 0, 1 + al() * 3, h); } }, 6, 1);
    nappeT.wrapS = nappeT.wrapT = THREE.RepeatWrapping; const nappeM = new THREE.MeshBasicMaterial({ map: nappeT, transparent: true, depthWrite: false, side: THREE.DoubleSide, opacity: .75 }); AMB.push((tm) => { nappeT.offset.y = -(tm / 700) % 1; });
    for (const [fx, fz] of FONT) { const r0 = 4.2; const bord = new THREE.Mesh(new THREE.TorusGeometry(r0, .28, 8, 40), pierreF); bord.rotation.x = Math.PI / 2; bord.position.set(fx, .5, fz); scene.add(bord); cyl(r0, r0, .5, pierreF, fx, .25, fz, 40);
      const e = new THREE.Mesh(new THREE.CircleGeometry(r0 - .1, 40), eauM); e.rotation.x = -Math.PI / 2; e.position.set(fx, .52, fz); scene.add(e);
      cyl(.45, .6, 1.6, pierreF, fx, 1.3, fz, 12); cyl(1.6, .5, .45, pierreF, fx, 2.2, fz, 20); cyl(.25, .3, 1.2, pierreF, fx, 2.9, fz, 10); cyl(.85, .3, .3, pierreF, fx, 3.55, fz, 16); cyl(.12, .2, .5, pierreF, fx, 3.9, fz, 8);
      for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4, m = new THREE.Mesh(new THREE.SphereGeometry(.22, 8, 6), pierreF); m.position.set(fx + Math.cos(a) * .5, 1.5, fz + Math.sin(a) * .5); scene.add(m); }
      const N = PEU ? 90 : 220, pos = new Float32Array(N * 3), geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); const pt = new THREE.Points(geo, new THREE.PointsMaterial({ map: gouT, size: .14, transparent: true, depthWrite: false, opacity: .8 })); pt.frustumCulled = false; scene.add(pt);
      for (const [r, y0, y1] of [[.88, 3.52, 2.45], [1.64, 2.42, .55]]) { const n = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.04, y0 - y1, 32, 1, true), nappeM); n.position.set(fx, (y0 + y1) / 2, fz); n.renderOrder = 2; scene.add(n); }
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
  { const B1 = FA - 1.7, B2 = GR + 3.2, B3 = FA + 2.2, R = [
      [[-B1, -B1], [B1, -B1], [B1, B1], [-B1, B1]], [[B1, B1], [B1, -B1], [-B1, -B1], [-B1, B1]], [[-B3, -B3], [B3, -B3], [B3, B3], [-B3, B3]], [[B3, B3], [B3, -B3], [-B3, -B3], [-B3, B3]], [[-B2, -B2], [B2, -B2], [B2, B2], [-B2, B2]], [[B2, B2], [B2, -B2], [-B2, -B2], [-B2, B2]],
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
  const murArc = (c, u, ns) => { if (Math.abs(c - FA) > .45 || Math.abs(u) >= FA) return false; if (ns && Math.abs(u) < 3) return false; const v = u + FA, off = v - Math.floor(v / 4) * 4 - 2; return Math.abs(off) > 1.3; };   /* (le mur des arcades : on passe sous les arcs, pas dans les piles) */
  L.limites = (x, z) => { const ax = Math.abs(x), az = Math.abs(z); if (ax > FA + GAL - .45 || az > FA + GAL - .45) return false; if (murArc(az, x, true) || murArc(ax, z, false)) return false; if (dansGrille(x, z)) return false;
    for (const o of OBS) if (o && o[4] !== "grille" && x > o[0] && x < o[1] && z > o[2] && z < o[3]) { if (o[4] === "statue" || o[4] === "metro") return false; if (o[4] === "fontaine") { const f = FONT.find(([a, b]) => Math.hypot(x - a, z - b) < 6); if (f && Math.hypot(x - f[0], z - f[1]) < 4.6) return false; continue; } return false; }
    return true; };
  L.hauteur = (x, z) => surTrott(x, z) ? TROT : 0;
  L.depart = [0, 30]; L.taille = 1.8; L.suivi = { d: 6.5, h: 3.6, av: 3, vy: 2 }; L.fov = [60, 74];
  L.zone = [-FA - GAL, FA + GAL, -FA - GAL, FA + GAL]; L.cam = { pos: [0, 9, 50], vise: [0, 6, 0] }; L.sansMusique = true; L.loin = 400;

  /* ---------- la maison de Victor Hugo : on s'approche de la porte du numéro 6 ---------- */
  const PAROLES = ["« Il n'y a rien de plus puissant qu'une idée dont l'heure est venue. »", "« La musique exprime ce qui ne peut être dit et sur quoi il est impossible de rester silencieux. »", "« Aimer, c'est savoir dire je t'aime sans parler. »", "« Le bonheur de la vie est d'être aimé pour soi-même. »",
    "« Respirer Paris, cela conserve l'âme. »", "« Le rire est le soleil qui chasse l'hiver du visage humain. »", "« Ceux qui vivent, ce sont ceux qui luttent. »", "« La mélancolie, c'est le bonheur d'être triste. »", "« On passe une moitié de sa vie à attendre ceux qu'on aimera et l'autre moitié à quitter ceux qu'on aime. »", "« Les souvenirs sont nos forces. »"];
  let iP = Math.floor(al() * PAROLES.length);
  const hugoParle = () => { const d = document.createElement("div"); d.style.cssText = "position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);z-index:52;max-width:min(86vw,520px);background:#f2e8d0;color:#3a2a18;border-radius:6px;padding:18px 22px;font:17px/1.5 Georgia,serif;box-shadow:0 10px 40px rgba(0,0,0,.6);border:1px solid #b8a070;cursor:pointer";
    d.innerHTML = `<div style="font:italic 14px Georgia,serif;opacity:.75;margin-bottom:8px">Place des Vosges, numéro 6. Victor Hugo a vécu ici de 1832 à 1848 ; il y écrivit une grande partie des <i>Misérables</i>.</div>${PAROLES[iP++ % PAROLES.length]}<div style="margin-top:8px;text-align:right;font-style:italic">— Victor Hugo</div><div style="margin-top:10px;font-size:12px;opacity:.6;text-align:right">(toucher pour fermer)</div>`;
    const C = (M && M.ctx && M.ctx.conteneur) || document.body; C.appendChild(d); const f = () => d.remove(); d.onclick = f; setTimeout(f, 16000); };
  const a0 = L.actionLieu; L.actionLieu = (x, z, moi) => { const r = a0 && a0(x, z, moi); if (r) return r; return Math.hypot(x - HUGO.x, z - (FA + 2.4)) < 1.8 ? { type: "lieu", id: "hugo", label: "📜 La maison de Victor Hugo", faire: hugoParle } : null; };
  // une lueur douce au sol devant la porte (comme à Notre-Dame : pas de cercle jaune)
  { const halo = tT(128, 128, (c, w, h) => { const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, "rgba(255,236,170,.75)"); g.addColorStop(.4, "rgba(255,214,120,.35)"); g.addColorStop(1, "rgba(255,196,90,0)"); c.fillStyle = g; c.fillRect(0, 0, w, h); });
    const hm = new THREE.MeshBasicMaterial({ map: halo, transparent: true, depthWrite: false, opacity: .8 }); const o = new THREE.Mesh(new THREE.CircleGeometry(1.1, 24), hm); o.rotation.x = -Math.PI / 2; o.position.set(HUGO.x, TROT + .02, FA + 2.4); scene.add(o); AMB.push((tm) => { hm.opacity = .55 + Math.sin(tm / 600) * .25; }); }

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
