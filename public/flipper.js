/* Le flipper « Viking » de la salle des fêtes : une vraie partie, en plein écran, au doigt ou au clavier.
   3 billes ; les bumpers (100), les trois couloirs du haut (25, et 500 quand les trois sont allumés), les cibles du milieu (50).
   À la fin de la partie, le score part au serveur, qui tient le classement affiché au mur, au-dessus du flipper. */
const W = 400, H = 720, R = 9, G = 1100, VMAX = 1700;

export function ouvrirFlipper({ envoyerScore }) {
  const fond = document.createElement("div");
  fond.style.cssText = "position:fixed;inset:0;z-index:2600;background:radial-gradient(circle at 50% 30%,#2b1a10,#0a0705 80%);display:flex;flex-direction:column;align-items:center;justify-content:center;touch-action:none;user-select:none;-webkit-user-select:none";
  fond.innerHTML = `<div style="display:flex;gap:14px;align-items:center;color:#f4ecd8;font:700 16px Arial;margin:6px 0">
      <span>🎰 SCORE <b id="fpScore" style="color:#7ef0ff;font-family:'Courier New',monospace;font-size:20px">0</b></span><span id="fpBilles">● ● ●</span></div>
    <canvas id="fpCanvas" width="${W}" height="${H}" style="max-width:96vw;max-height:calc(100vh - 110px);aspect-ratio:${W}/${H};border-radius:14px;box-shadow:0 0 0 6px #b31b1b,0 0 0 9px #c9a227"></canvas>
    <div id="fpAide" style="color:#d8c9a8;font:14px Arial;margin-top:8px;text-align:center">Touche à gauche / à droite pour les batteurs · touche pour lancer la bille<br><small>(clavier : ← → et espace)</small></div>
    <button id="fpQuitter" type="button" aria-label="Quitter le flipper" style="position:fixed;top:calc(14px + env(safe-area-inset-top));right:14px;width:44px;height:44px;border-radius:50%;border:2px solid rgba(255,255,255,.6);background:rgba(0,0,0,.55);color:#fff;font-size:20px">✕</button>
    <div id="fpFin" style="position:fixed;inset:0;display:none;place-items:center;background:rgba(0,0,0,.6)"><div style="background:#1b130d;border:3px solid #c9a227;border-radius:16px;padding:22px 26px;color:#f4ecd8;text-align:center;font:16px Arial;min-width:250px">
      <div style="font:900 26px Impact,Arial Black,sans-serif;color:#ffcf3a">PARTIE TERMINÉE</div><div id="fpFinScore" style="font:700 30px 'Courier New',monospace;color:#7ef0ff;margin:10px 0"></div>
      <div id="fpFinTop" style="text-align:left;margin:10px 0 16px"></div>
      <button id="fpRejouer" type="button" style="font:700 16px Arial;padding:10px 18px;border-radius:999px;border:0;background:#c9a227;color:#1b130d">Rejouer</button>
      <button id="fpFermer" type="button" style="font:700 16px Arial;padding:10px 18px;border-radius:999px;border:0;background:#4a3a2c;color:#f4ecd8;margin-left:8px">Revenir au bar</button></div></div>`;
  document.body.appendChild(fond);
  const $ = id => fond.querySelector("#" + id), cv = $("fpCanvas"), x = cv.getContext("2d");

  // --- la table : murs (segments), batteurs, bumpers, couloirs, cibles ---
  const murs = [];
  const seg = (ax, ay, bx, by) => murs.push([ax, ay, bx, by]);
  seg(20, H, 20, 170); seg(380, 170, 380, H);
  for (let i = 0; i < 18; i++) { const a0 = Math.PI + i / 18 * Math.PI, a1 = Math.PI + (i + 1) / 18 * Math.PI; seg(200 + Math.cos(a0) * 180, 170 + Math.sin(a0) * 150, 200 + Math.cos(a1) * 180, 170 + Math.sin(a1) * 150); }
  seg(352, 260, 352, H);                         // le couloir du lanceur
  seg(20, 540, 112, 612); seg(352, 540, 288, 612); // les guides vers les batteurs
  seg(60, 430, 60, 500); seg(60, 500, 100, 540);  // les petits triangles (lance-pierres)
  seg(312, 430, 312, 500); seg(312, 500, 272, 540);
  const bat = [{ px: 112, py: 612, s: 1, a: .5, va: 0, haut: false }, { px: 288, py: 612, s: -1, a: .5, va: 0, haut: false }];
  const LB = 66, BAS = .5, HAUT = -.5;
  const bumpers = [[140, 290, 24], [260, 290, 24], [200, 370, 24]].map(([cx, cy, r]) => ({ cx, cy, r, flash: 0 }));
  const couloirs = [150, 200, 250].map(cx => ({ cx, cy: 200, on: false }));
  const cibles = [[95, 330], [305, 330]].map(([cx, cy]) => ({ cx, cy, flash: 0 }));
  let b = null, billes = 3, score = 0, fini = false, enCouloir = true;
  const nouvelleBille = () => { b = { x: 366, y: H - 30, vx: 0, vy: 0 }; enCouloir = true; };
  const majScore = () => { $("fpScore").textContent = score.toLocaleString("fr-FR"); $("fpBilles").textContent = "● ".repeat(billes).trim() || "—"; };
  nouvelleBille(); majScore();
  const lancer = () => { if (!fini && enCouloir && b.x > 352 && b.y > H - 80) { b.vy = -(1500 + Math.random() * 180); enCouloir = false; } };

  // --- les commandes : le doigt (moitié gauche / droite), le clavier ---
  const doigts = new Map();
  const majBatteurs = () => { bat[0].haut = [...doigts.values()].includes(0) || cl.g; bat[1].haut = [...doigts.values()].includes(1) || cl.d; };
  const cl = { g: false, d: false };
  cv.addEventListener("pointerdown", e => { e.preventDefault(); const r = cv.getBoundingClientRect(), cote = e.clientX - r.left < r.width / 2 ? 0 : 1;
    if (enCouloir) lancer(); doigts.set(e.pointerId, cote); majBatteurs(); });
  const fin = e => { doigts.delete(e.pointerId); majBatteurs(); };
  ["pointerup", "pointercancel", "pointerleave"].forEach(t => cv.addEventListener(t, fin));
  const touche = (e, v) => { if (e.key === "ArrowLeft" || e.key === "z" || e.key === "Shift") cl.g = v; else if (e.key === "ArrowRight" || e.key === "m") cl.d = v; else if ((e.key === " " || e.key === "ArrowDown") && v) lancer(); else return; e.preventDefault(); majBatteurs(); };
  const kd = e => touche(e, true), ku = e => touche(e, false);
  addEventListener("keydown", kd); addEventListener("keyup", ku);

  // --- la physique ---
  const rebond = (nx, ny, vsx = 0, vsy = 0, e = .55) => { const rx = b.vx - vsx, ry = b.vy - vsy, vn = rx * nx + ry * ny; if (vn < 0) { b.vx -= (1 + e) * vn * nx; b.vy -= (1 + e) * vn * ny; } };
  const contreSegment = (ax, ay, bx, by, epais, vs) => {
    const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy, t = Math.max(0, Math.min(1, ((b.x - ax) * dx + (b.y - ay) * dy) / l2));
    const px = ax + dx * t, py = ay + dy * t, ex = b.x - px, ey = b.y - py, d = Math.hypot(ex, ey);
    if (d >= R + epais || d === 0) return false;
    const nx = ex / d, ny = ey / d; b.x = px + nx * (R + epais); b.y = py + ny * (R + epais);
    const [vsx, vsy] = vs ? vs(px, py) : [0, 0]; rebond(nx, ny, vsx, vsy, vs ? .3 : .5); return true;
  };
  const pas = dt => {
    for (const f of bat) { const cible = f.haut ? HAUT : BAS, av = f.a; f.a += Math.sign(cible - f.a) * Math.min(Math.abs(cible - f.a), 22 * dt); f.va = (f.a - av) / dt; }
    if (!b) return;
    b.vy += G * dt; b.x += b.vx * dt; b.y += b.vy * dt;
    for (const [ax, ay, bx, by] of murs) contreSegment(ax, ay, bx, by, 2);
    // la bille ne redescend pas dans le couloir du lanceur par le haut
    if (!enCouloir && b.vy > 0 && b.x > 352 && b.y < 262 && b.y > 160) { b.x = Math.min(b.x, 340); b.vx = -Math.abs(b.vx) - 60; }
    if (b.x > 352 && b.y > H - 30) { b.y = H - 30; b.vy = 0; b.vx = 0; enCouloir = true; }
    for (const f of bat) { const ang = f.s > 0 ? f.a : Math.PI - f.a, tx = f.px + Math.cos(ang) * LB, ty = f.py + Math.sin(ang) * LB, w = f.va * f.s;
      contreSegment(f.px, f.py, tx, ty, 7, (px, py) => [-w * (py - f.py), w * (px - f.px)]); }
    for (const u of bumpers) { const ex = b.x - u.cx, ey = b.y - u.cy, d = Math.hypot(ex, ey);
      if (d < u.r + R && d > 0) { const nx = ex / d, ny = ey / d; b.x = u.cx + nx * (u.r + R); b.y = u.cy + ny * (u.r + R); const v = Math.max(650, Math.hypot(b.vx, b.vy)); b.vx = nx * v; b.vy = ny * v; score += 100; u.flash = .15; majScore(); } }
    for (const c of cibles) { const d = Math.hypot(b.x - c.cx, b.y - c.cy); if (d < 14 + R && c.flash <= 0) { score += 50; c.flash = .4; majScore(); const nx = (b.x - c.cx) / d, ny = (b.y - c.cy) / d; rebond(nx, ny, 0, 0, .8); } }
    for (const c of couloirs) if (!c.on && Math.hypot(b.x - c.cx, b.y - c.cy) < 16) { c.on = true; score += 25;
      if (couloirs.every(q => q.on)) { score += 500; setTimeout(() => couloirs.forEach(q => q.on = false), 600); } majScore(); }
    const v = Math.hypot(b.vx, b.vy); if (v > VMAX) { b.vx *= VMAX / v; b.vy *= VMAX / v; }
    // la bille est perdue entre les batteurs
    if (b.y > H + 20) { billes--; majScore(); if (billes > 0) nouvelleBille(); else terminer(); }
  };

  // --- le dessin ---
  const dessiner = () => {
    const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#0d2a52"); g.addColorStop(.6, "#13396b"); g.addColorStop(1, "#0a1f3d"); x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.fillStyle = "rgba(255,210,80,.08)"; x.font = "900 64px Impact, Arial Black, sans-serif"; x.textAlign = "center"; x.fillText("VIKING", 186, 470);
    x.strokeStyle = "#c9a227"; x.lineWidth = 4; x.lineCap = "round"; x.beginPath(); for (const [ax, ay, bx, by] of murs) { x.moveTo(ax, ay); x.lineTo(bx, by); } x.stroke();
    for (const u of bumpers) { u.flash -= 1 / 60; x.fillStyle = u.flash > 0 ? "#fff6a8" : "#e33b2e"; x.beginPath(); x.arc(u.cx, u.cy, u.r, 0, 7); x.fill(); x.strokeStyle = "#fff"; x.lineWidth = 3; x.stroke();
      x.fillStyle = "#fff"; x.font = "bold 13px Arial"; x.fillText("100", u.cx, u.cy + 5); }
    for (const c of cibles) { c.flash -= 1 / 60; x.fillStyle = c.flash > 0 ? "#7ef0ff" : "#2fb36b"; x.beginPath(); x.arc(c.cx, c.cy, 14, 0, 7); x.fill(); }
    for (const c of couloirs) { x.fillStyle = c.on ? "#ffcf3a" : "#3b4f6e"; x.beginPath(); x.arc(c.cx, c.cy, 9, 0, 7); x.fill(); }
    for (const f of bat) { const ang = f.s > 0 ? f.a : Math.PI - f.a; x.strokeStyle = "#f4f1ea"; x.lineWidth = 14; x.beginPath(); x.moveTo(f.px, f.py); x.lineTo(f.px + Math.cos(ang) * LB, f.py + Math.sin(ang) * LB); x.stroke();
      x.strokeStyle = "#b31b1b"; x.lineWidth = 6; x.stroke(); }
    if (enCouloir && !fini) { x.fillStyle = "rgba(255,255,255,.75)"; x.font = "bold 14px Arial"; x.fillText("▲ LANCE", 366, H - 60); }
    if (b) { const gb = x.createRadialGradient(b.x - 3, b.y - 3, 1, b.x, b.y, R); gb.addColorStop(0, "#fff"); gb.addColorStop(1, "#8b8f96"); x.fillStyle = gb; x.beginPath(); x.arc(b.x, b.y, R, 0, 7); x.fill(); }
  };
  let avant = performance.now(), boucle = 0;
  const tour = t => { const dt = Math.min(.033, (t - avant) / 1000); avant = t; if (!fini) for (let k = 0; k < 8; k++) pas(dt / 8); dessiner(); boucle = requestAnimationFrame(tour); };
  boucle = requestAnimationFrame(tour);

  async function terminer() {
    fini = true; b = null; $("fpFinScore").textContent = score.toLocaleString("fr-FR"); $("fpFinTop").innerHTML = "<small>Enregistrement du score…</small>"; $("fpFin").style.display = "grid";
    try { const r = await envoyerScore(score);
      $("fpFinTop").innerHTML = `<div style="color:#ffcf3a;font-weight:700;margin-bottom:6px">🏆 Le classement au mur</div>` + (r.top || []).map((e, i) => `<div>${["🥇", "🥈", "🥉"][i]} ${e.nom.replace(/[<>&]/g, "")} — <b>${e.score.toLocaleString("fr-FR")}</b></div>`).join("")
        + `<div style="margin-top:8px;color:#d8c9a8">Ton record : <b>${(r.record || 0).toLocaleString("fr-FR")}</b></div>`;
    } catch (e) { $("fpFinTop").textContent = "Le score n'a pas pu être enregistré : " + e.message; }
  }
  const rejouer = () => { billes = 3; score = 0; fini = false; couloirs.forEach(c => c.on = false); nouvelleBille(); majScore(); $("fpFin").style.display = "none"; };
  const fermer = () => { cancelAnimationFrame(boucle); removeEventListener("keydown", kd); removeEventListener("keyup", ku); fond.remove(); };
  $("fpRejouer").onclick = rejouer; $("fpFermer").onclick = fermer; $("fpQuitter").onclick = fermer;
  return fermer;
}
