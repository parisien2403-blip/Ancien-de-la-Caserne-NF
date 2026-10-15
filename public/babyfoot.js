/* Le baby-foot du bar (sous la salle des fêtes) : une partie contre l'ordinateur, vue de dessus. Nos joueurs sont les bleus, en bas ; les rouges, en haut.
   On fait glisser le doigt (ou la souris) de gauche à droite : toutes nos barres suivent. On touche l'écran (ou on clique) : nos joueurs frappent.
   L'ordinateur devient plus fort à chaque but qu'on lui marque. La partie s'arrête quand il en a marqué 5 : le score, ce sont nos buts. */
const W = 400, H = 600, X0 = 22, X1 = W - 22, Y0 = 34, Y1 = H - 34, BUT = 64, R = 8, PIED = 6, FIN = 5;
// les 8 barres, de notre but vers le leur : [qui, y, nombre de joueurs, écart entre eux]
const BARRES = [["moi", 1, 1, 0], ["moi", 2, 2, 150], ["ordi", 3, 3, 108], ["moi", 4, 5, 66], ["ordi", 5, 5, 66], ["moi", 6, 3, 108], ["ordi", 7, 2, 150], ["ordi", 8, 1, 0]]
  .map(([qui, k, n, e]) => { const y = Y1 - (k - .5) * (Y1 - Y0) / 8, demi = (n - 1) * e / 2, lim = Math.min(n === 1 ? BUT * .9 : 999, (X1 - X0) / 2 - demi - PIED - 2);
    return { qui, y, n, e, lim, o: 0, vo: 0, frappe: -1e9 }; });

export function ouvrirBabyFoot({ envoyerScore, surFerme }) {
  const fond = document.createElement("div");
  fond.style.cssText = "position:fixed;inset:0;z-index:2600;background:radial-gradient(circle at 50% 30%,#3a2416,#0b0705 80%);display:flex;flex-direction:column;align-items:center;justify-content:center;touch-action:none;user-select:none;-webkit-user-select:none";
  fond.innerHTML = `<div style="display:flex;gap:16px;align-items:center;color:#f6eee2;font:700 16px Arial;margin:6px 0">
      <span>⚽ TOI <b id="bfMoi" style="color:#7ec8ff;font-family:'Courier New',monospace;font-size:22px">0</b></span><span style="opacity:.6">—</span><span>ORDI <b id="bfOrdi" style="color:#ff8a7a;font-family:'Courier New',monospace;font-size:22px">0</b></span></div>
    <canvas id="bfCanvas" width="${W}" height="${H}" style="max-width:96vw;max-height:calc(100vh - 110px);aspect-ratio:${W}/${H};border-radius:14px;box-shadow:0 0 0 6px #6b4424,0 0 0 9px #c9a06a;touch-action:none"></canvas>
    <div style="color:#e8d8c0;font:14px Arial;margin-top:8px;text-align:center;padding:0 12px">Glisse le doigt pour bouger tes barres (les bleus) — touche l'écran pour frapper.<br>La partie s'arrête quand l'ordi a marqué 5 buts : ton score, ce sont tes buts.</div>
    <button id="bfQuitter" type="button" aria-label="Quitter le baby-foot" style="position:fixed;top:calc(14px + env(safe-area-inset-top));right:14px;width:44px;height:44px;border-radius:50%;border:2px solid rgba(255,255,255,.6);background:rgba(0,0,0,.5);color:#fff;font:700 20px Arial">✕</button>
    <div id="bfFin" style="position:fixed;inset:0;display:none;place-items:center;background:rgba(0,0,0,.6)"><div style="background:#1c120b;border:3px solid #c9a06a;border-radius:16px;padding:22px 26px;color:#f6eee2;text-align:center;font:16px Arial;max-width:86vw">
      <div style="font:900 26px Impact,Arial Black,sans-serif;color:#ffcf3a">FIN DE LA PARTIE</div><div id="bfFinScore" style="font:700 30px 'Courier New',monospace;color:#7ec8ff;margin:10px 0"></div>
      <div id="bfFinTop" style="text-align:left;margin:10px 0 16px"></div>
      <button id="bfRejouer" type="button" style="font:700 16px Arial;padding:10px 18px;border-radius:999px;border:0;background:#c9a06a;color:#1c120b">Revanche</button>
      <button id="bfFermer" type="button" style="font:700 16px Arial;padding:10px 18px;border-radius:999px;border:0;background:#4a3020;color:#f6eee2;margin-left:8px">Lâcher les poignées</button></div></div>`;
  (document.fullscreenElement || document.body).appendChild(fond);
  const $ = id => fond.querySelector("#" + id), cv = $("bfCanvas"), x = cv.getContext("2d");
  for (const r of BARRES) { r.o = 0; r.vo = 0; r.frappe = -1e9; r.decide = 0; r.err = 0; }

  // le terrain, dessiné une fois : la caisse en bois, le tapis vert rayé, les lignes blanches, les buts
  const decor = document.createElement("canvas"); decor.width = W; decor.height = H; { const d = decor.getContext("2d");
    d.fillStyle = "#c9a06a"; d.fillRect(0, 0, W, H); d.fillStyle = "#b08850"; for (let i = 0; i < 60; i++) d.fillRect(0, Math.random() * H, W, 1);
    for (let k = 0; k < 10; k++) { d.fillStyle = k % 2 ? "#2f8a3e" : "#348f43"; d.fillRect(X0, Y0 + k * (Y1 - Y0) / 10, X1 - X0, (Y1 - Y0) / 10 + 1); }
    d.strokeStyle = "rgba(255,255,255,.85)"; d.lineWidth = 2; d.strokeRect(X0 + 2, Y0 + 2, X1 - X0 - 4, Y1 - Y0 - 4);
    d.beginPath(); d.moveTo(X0, H / 2); d.lineTo(X1, H / 2); d.stroke(); d.beginPath(); d.arc(W / 2, H / 2, 46, 0, 7); d.stroke();
    d.fillStyle = "#fff"; d.beginPath(); d.arc(W / 2, H / 2, 3, 0, 7); d.fill();
    for (const s of [-1, 1]) { d.strokeRect(W / 2 - 90, s < 0 ? Y0 + 2 : Y1 - 62, 180, 60); d.strokeRect(W / 2 - 50, s < 0 ? Y0 + 2 : Y1 - 28, 100, 26);
      d.fillStyle = "#1a1a1a"; d.fillRect(W / 2 - BUT, s < 0 ? 6 : Y1, BUT * 2, Y0 - 6); d.strokeStyle = "rgba(255,255,255,.25)"; d.lineWidth = 1;   // le but, et son filet
      for (let a = W / 2 - BUT; a <= W / 2 + BUT; a += 8) { d.beginPath(); d.moveTo(a, s < 0 ? 6 : Y1); d.lineTo(a, s < 0 ? Y0 : H - 6); d.stroke(); }
      d.strokeStyle = "rgba(255,255,255,.85)"; d.lineWidth = 2; }
    d.fillStyle = "#c8102e"; for (const [a, b] of [[0, 0], [W - 14, 0], [0, H - 14], [W - 14, H - 14]]) d.fillRect(a, b, 14, 14); }

  let ac = null; const son = (f = 500, du = .06, v = .3, type = "triangle") => { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
    o.type = type; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * .4, t + du); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + du); o.connect(g).connect(ac.destination); o.start(t); o.stop(t + du + .01); } catch (e) {} };

  let moi = 0, ordi = 0, fini = false, b = null, msg = null, engage = 0, calme = 0, doigt = W / 2;
  const majHaut = () => { $("bfMoi").textContent = moi; $("bfOrdi").textContent = ordi; };
  // l'engagement : la balle tombe au milieu, un peu de travers
  const engager = () => { const a = (Math.random() - .5) * 1.4 + (Math.random() < .5 ? 0 : Math.PI); b = { x: W / 2 + (Math.random() - .5) * 30, y: H / 2, vx: Math.sin(a) * 200, vy: Math.cos(a) * 200 }; calme = 0; son(300, .05, .15); };
  engage = performance.now() + 900;
  const but = pourMoi => { b = null; if (pourMoi) moi++; else ordi++; majHaut(); msg = { t: performance.now(), texte: pourMoi ? "BUT !" : "But de l'ordi…", bon: pourMoi }; son(pourMoi ? 660 : 220, .35, .35, "square");
    for (const r of BARRES) r.frappe = -1e9; if (ordi >= FIN) setTimeout(terminer, 1300); else engage = performance.now() + 1300; };

  // nos barres suivent le doigt ; toucher l'écran : on frappe
  const pos = e => { const r = cv.getBoundingClientRect(); return (e.clientX - r.left) * W / r.width; };
  const frapper = () => { const t = performance.now(); for (const r of BARRES) if (r.qui === "moi" && t - r.frappe > 260) r.frappe = t; son(180, .04, .12); };
  cv.addEventListener("pointerdown", e => { e.preventDefault(); doigt = pos(e); frapper(); try { cv.setPointerCapture(e.pointerId); } catch (er) {} });
  cv.addEventListener("pointermove", e => { e.preventDefault(); doigt = pos(e); });
  const hommes = r => { const L = []; for (let i = 0; i < r.n; i++) L.push(W / 2 + r.o + (i - (r.n - 1) / 2) * r.e); return L; };

  const avancer = (dt, t) => {
    const niv = moi;
    for (const r of BARRES) { let cible;
      if (r.qui === "moi") cible = (doigt - W / 2) * (r.n === 1 ? .55 : 1);
      else { // l'ordinateur : le joueur le plus proche se met devant la balle (il anticipe un peu), plus vite à chaque but qu'on lui marque
        const bx = b ? b.x + b.vx * Math.min(.25, Math.abs((r.y - b.y) / (b.vy || 1))) * .6 : W / 2;
        const L = hommes(r); let best = 0; for (let i = 1; i < L.length; i++) if (Math.abs(L[i] - bx) < Math.abs(L[best] - bx)) best = i;
        if (t > (r.decide || 0)) { r.decide = t + 250 + Math.random() * 250; r.err = (Math.random() - .5) * 2 * Math.max(9, 34 - niv * 4); }   // (il réagit par à-coups, et vise un peu à côté)
        cible = r.o + (bx + (r.err || 0) - L[best]);
        if (b && t - r.frappe > 500 && Math.abs(b.y - r.y) < 26 && b.y > r.y - 6 && Math.abs(L[best] - b.x) < 16 && Math.random() < .3 + niv * .04) r.frappe = t; }
      cible = Math.max(-r.lim, Math.min(r.lim, cible)); const vmax = r.qui === "moi" ? 1600 : 260 + niv * 45, av = r.o;
      r.o += Math.max(-vmax * dt, Math.min(vmax * dt, cible - r.o)); r.vo = (r.o - av) / dt; }
    if (!b) return;
    { const v = Math.hypot(b.vx, b.vy); if (v > 950) { b.vx *= 950 / v; b.vy *= 950 / v; } }
    b.x += b.vx * dt; b.y += b.vy * dt; const fr = Math.pow(.72, dt); b.vx *= fr; b.vy *= fr;   // (le tapis freine la balle)
    // les bandes, et les buts
    if (b.x < X0 + R) { b.x = X0 + R; b.vx = Math.abs(b.vx) * .85; son(900, .02, .08); } if (b.x > X1 - R) { b.x = X1 - R; b.vx = -Math.abs(b.vx) * .85; son(900, .02, .08); }
    const dansBut = Math.abs(b.x - W / 2) < BUT - R * .6;
    if (b.y < Y0 + R && !dansBut) { b.y = Y0 + R; b.vy = Math.abs(b.vy) * .85; son(900, .02, .08); } if (b.y > Y1 - R && !dansBut) { b.y = Y1 - R; b.vy = -Math.abs(b.vy) * .85; son(900, .02, .08); }
    if (b.y < Y0 - R) return but(true); if (b.y > Y1 + R) return but(false);
    // les joueurs : la balle rebondit sur eux ; s'ils frappent à ce moment-là, elle part fort vers le but d'en face
    for (const r of BARRES) { if (Math.abs(b.y - r.y) > PIED + R + 12) continue; const sens = r.qui === "moi" ? -1 : 1, kf = t - r.frappe, coup = kf < 170, avance = coup ? Math.sin(kf / 170 * Math.PI) * 12 : 0;
      if (!coup && b.vy * sens > 260) continue;   // (un tir de son équipe, lancé vers l'avant : ses joueurs se relèvent, la balle passe)
      for (const hx of hommes(r)) { const hy = r.y + sens * avance, dx = b.x - hx, dy = b.y - hy, d = Math.hypot(dx, dy); if (d >= PIED + R || d < .01) continue;
        const nx = dx / d, ny = dy / d; b.x = hx + nx * (PIED + R); b.y = hy + ny * (PIED + R);
        if (coup && ny * sens > -.3) { const fort = r.qui === "moi" ? 800 : 600 + niv * 40, ang = Math.max(-.7, Math.min(.7, dx / (PIED + R) * .9 + (Math.random() - .5) * .15));
          b.vx = Math.sin(ang) * fort + r.vo * .25; b.vy = sens * Math.cos(ang) * fort; r.frappe = -1e9; son(140, .05, .3, "sawtooth"); }
        else { const vn = b.vx * nx + b.vy * ny; if (vn < 0) { b.vx -= 1.5 * vn * nx; b.vy -= 1.5 * vn * ny; } b.vx += Math.max(-200, Math.min(200, r.vo * .2)); b.vy += sens * 30; son(700, .02, .06); } } }
    // la balle s'endort entre deux barres : on la relance au milieu
    calme = Math.hypot(b.vx, b.vy) < 22 ? calme + dt : 0; if (calme > 2.2) { msg = { t, texte: "Remise en jeu", bon: true }; engager(); }
  };

  const joueur = (hx, hy, qui, sens) => { const c = qui === "moi" ? ["#1f5fbf", "#123a78"] : ["#c8102e", "#7a0a1c"];
    x.fillStyle = "rgba(0,0,0,.25)"; x.beginPath(); x.ellipse(hx + 3, hy + 3, 12, 7, 0, 0, 7); x.fill();
    x.fillStyle = "#1a1a1a"; x.fillRect(hx - 3, hy + sens * 9 - 3, 6, 6);   // le pied
    x.fillStyle = c[0]; x.beginPath(); x.roundRect(hx - 12, hy - 6, 24, 12, 5); x.fill(); x.strokeStyle = c[1]; x.lineWidth = 1.5; x.stroke();   // les épaules
    x.fillStyle = "#f0c8a0"; x.beginPath(); x.arc(hx, hy, 5.5, 0, 7); x.fill(); x.fillStyle = "#3a2410"; x.beginPath(); x.arc(hx, hy - 1, 4, Math.PI, 0); x.fill(); };   // la tête
  const dessiner = t => {
    x.drawImage(decor, 0, 0);
    for (const r of BARRES) { x.fillStyle = "#b9bcc0"; x.fillRect(0, r.y - 2, W, 4); x.fillStyle = "#e6e8ea"; x.fillRect(0, r.y - 2, W, 1.5);   // la barre d'acier, et sa poignée
      x.fillStyle = "#111"; const px = r.qui === "moi" ? W - 12 : 0; x.fillRect(px, r.y - 6, 12, 12); }
    if (b) { x.fillStyle = "rgba(0,0,0,.3)"; x.beginPath(); x.arc(b.x + 3, b.y + 3, R, 0, 7); x.fill(); const g = x.createRadialGradient(b.x - 3, b.y - 3, 1, b.x, b.y, R); g.addColorStop(0, "#fff"); g.addColorStop(1, "#e8e0c8"); x.fillStyle = g; x.beginPath(); x.arc(b.x, b.y, R, 0, 7); x.fill(); }
    for (const r of BARRES) { const sens = r.qui === "moi" ? -1 : 1, kf = t - r.frappe, avance = kf < 170 ? Math.sin(kf / 170 * Math.PI) * 9 : 0; for (const hx of hommes(r)) joueur(hx, r.y + sens * avance, r.qui, sens); }
    if (msg && t - msg.t < 1200) { x.fillStyle = msg.bon ? "#ffcf3a" : "#ff8a7a"; x.font = "900 40px Impact, Arial Black, sans-serif"; x.textAlign = "center"; x.strokeStyle = "rgba(0,0,0,.6)"; x.lineWidth = 5; x.strokeText(msg.texte, W / 2, H / 2 - 60); x.fillText(msg.texte, W / 2, H / 2 - 60); }
    if (!b && !fini && engage && t > engage) { engage = 0; engager(); }
  };
  let boucle = 0, avant = performance.now(); const tour = t => { const dt = Math.min(.05, (t - avant) / 1000); avant = t; if (!fini) for (let i = 0; i < 6; i++) avancer(dt / 6, t); dessiner(t); boucle = requestAnimationFrame(tour); };
  boucle = requestAnimationFrame(tour);

  async function terminer() {
    fini = true; b = null; $("bfFinScore").textContent = `${moi} – ${ordi}`; $("bfFinTop").innerHTML = "<small>Enregistrement du score…</small>"; $("bfFin").style.display = "grid";
    try { const r = await envoyerScore(moi);
      $("bfFinTop").innerHTML = `<div style="color:#ffcf3a;font-weight:700;margin-bottom:6px">🏆 Les 3 meilleurs au baby-foot</div>` + (r.top || []).map((e, i) => `<div>${["🥇", "🥈", "🥉"][i]} ${e.nom.replace(/[<>&]/g, "")} — <b>${e.score}</b></div>`).join("")
        + `<div style="margin-top:8px;color:#e8d8c0">Ton record : <b>${r.record || 0}</b> buts</div>`;
    } catch (e) { $("bfFinTop").textContent = "Le score n'a pas pu être enregistré : " + e.message; }
  }
  const rejouer = () => { moi = 0; ordi = 0; fini = false; b = null; msg = null; engage = performance.now() + 900; majHaut(); $("bfFin").style.display = "none"; };
  const fermer = () => { cancelAnimationFrame(boucle); fond.remove(); try { ac && ac.close(); } catch (e) {} surFerme && surFerme(); };
  $("bfRejouer").onclick = rejouer; $("bfFermer").onclick = fermer; $("bfQuitter").onclick = fermer;
  return fermer;
}
