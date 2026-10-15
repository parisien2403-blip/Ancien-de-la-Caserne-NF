/* Le stand de tir du sous-sol : 10 balles (2 séries de 5) à la carabine, sur la cible réglementaire (zones 5, 4, 2).
   On pose le doigt (ou on appuie sur la souris) : le viseur apparaît ; il bouge avec la respiration — on retient son souffle, il se calme une à deux secondes,
   puis il se remet à trembler. On lève le doigt : le coup part. À la fin, le score part au serveur pour le classement des 3 meilleurs tireurs. */
const W = 400, H = 560, TX = 120, TY = 92, TW = 160, TH = 223, BALLES = 10;

export function ouvrirTir({ envoyerScore, dessinerCible, score: points, surFerme }) {
  const fond = document.createElement("div");
  fond.style.cssText = "position:fixed;inset:0;z-index:2600;background:radial-gradient(circle at 50% 30%,#23352a,#070a08 80%);display:flex;flex-direction:column;align-items:center;justify-content:center;touch-action:none;user-select:none;-webkit-user-select:none";
  fond.innerHTML = `<div style="display:flex;gap:14px;align-items:center;color:#eef4e6;font:700 16px Arial;margin:6px 0">
      <span>🔫 SCORE <b id="tiScore" style="color:#7ef0ff;font-family:'Courier New',monospace;font-size:20px">0</b></span><span id="tiSerie">Série 1 / 2</span><span id="tiBalles"></span></div>
    <canvas id="tiCanvas" width="${W}" height="${H}" style="max-width:96vw;max-height:calc(100vh - 110px);aspect-ratio:${W}/${H};border-radius:14px;box-shadow:0 0 0 6px #23301f,0 0 0 9px #9cbf96"></canvas>
    <div style="color:#cfe0c8;font:14px Arial;margin-top:8px;text-align:center">Pose le doigt pour viser, retiens ton souffle, lève le doigt pour tirer</div>
    <button id="tiQuitter" type="button" aria-label="Quitter le stand de tir" style="position:fixed;top:calc(14px + env(safe-area-inset-top));right:14px;width:44px;height:44px;border-radius:50%;border:2px solid rgba(255,255,255,.6);background:rgba(0,0,0,.55);color:#fff;font-size:20px">✕</button>
    <div id="tiFin" style="position:fixed;inset:0;display:none;place-items:center;background:rgba(0,0,0,.6)"><div style="background:#141c14;border:3px solid #9cbf96;border-radius:16px;padding:22px 26px;color:#eef4e6;text-align:center;font:16px Arial;min-width:250px">
      <div style="font:900 26px Impact,Arial Black,sans-serif;color:#ffcf3a">CESSEZ LE FEU !</div><div id="tiFinScore" style="font:700 30px 'Courier New',monospace;color:#7ef0ff;margin:10px 0"></div>
      <div id="tiFinTop" style="text-align:left;margin:10px 0 16px"></div>
      <button id="tiRejouer" type="button" style="font:700 16px Arial;padding:10px 18px;border-radius:999px;border:0;background:#9cbf96;color:#141c14">Recharger</button>
      <button id="tiFermer" type="button" style="font:700 16px Arial;padding:10px 18px;border-radius:999px;border:0;background:#3a4a36;color:#eef4e6;margin-left:8px">Poser la carabine</button></div></div>`;
  (document.fullscreenElement || document.body).appendChild(fond);
  const $ = id => fond.querySelector("#" + id), cv = $("tiCanvas"), x = cv.getContext("2d");

  // le décor, dessiné une fois : le couloir de tir vu du poste (murs vert pastel, sol de béton, néons), la cible au fond
  const decor = document.createElement("canvas"); decor.width = W; decor.height = H; { const d = decor.getContext("2d");
    const fx0 = 92, fx1 = 308, fy0 = 60, fy1 = 380;   // le mur du fond
    d.fillStyle = "#a9c7a0"; d.fillRect(0, 0, W, H);
    d.fillStyle = "#bcd8b2"; d.beginPath(); d.moveTo(0, 0); d.lineTo(fx0, fy0); d.lineTo(fx0, fy1); d.lineTo(0, H); d.fill(); d.beginPath(); d.moveTo(W, 0); d.lineTo(fx1, fy0); d.lineTo(fx1, fy1); d.lineTo(W, H); d.fill();   // les murs
    d.fillStyle = "#eeeeea"; d.beginPath(); d.moveTo(0, 0); d.lineTo(W, 0); d.lineTo(fx1, fy0); d.lineTo(fx0, fy0); d.fill();   // le plafond
    const g = d.createLinearGradient(0, fy1, 0, H); g.addColorStop(0, "#8d8d88"); g.addColorStop(1, "#b9b9b3"); d.fillStyle = g; d.beginPath(); d.moveTo(0, H); d.lineTo(W, H); d.lineTo(fx1, fy1); d.lineTo(fx0, fy1); d.fill();   // le sol de béton
    for (let i = 0; i < 300; i++) { d.fillStyle = `rgba(60,60,55,${Math.random() * .12})`; d.fillRect(Math.random() * W, fy1 + Math.random() * (H - fy1), 2, 2); }
    d.fillStyle = "#3a3a38"; d.fillRect(fx0, fy0, fx1 - fx0, fy1 - fy0);   // le pare-balles
    d.strokeStyle = "#e8e2c8"; d.lineWidth = 3; for (const s of [-1, 1]) { d.beginPath(); d.moveTo(W / 2 + s * 46, fy1); d.lineTo(W / 2 + s * 150, H); d.stroke(); }   // les lignes du couloir
    for (const k of [0, 1, 2]) { const y = 6 + k * 18, w = 180 - k * 50; d.fillStyle = "#fbfdff"; d.fillRect(W / 2 - w / 2, y, w, 5); d.fillStyle = "rgba(240,248,255,.25)"; d.fillRect(W / 2 - w / 2 - 6, y - 3, w + 12, 11); }   // les néons
    d.fillStyle = "#5a4632"; d.fillRect(TX - 8, TY - 8, TW + 16, TH + 16); d.fillStyle = "#1c1e22"; d.fillRect(W / 2 - 1, fy0, 2, TY - fy0 - 8);   // le porte-cible
    const c = document.createElement("canvas"); c.width = TW * 2; c.height = TH * 2; dessinerCible(c.getContext("2d"), c.width, c.height); d.drawImage(c, TX, TY, TW, TH);
    d.fillStyle = "#6a4224"; d.fillRect(0, H - 70, W, 70); d.fillStyle = "#8a5a32"; d.fillRect(0, H - 76, W, 12); }   // la tablette

  let score = 0, tires = 0, trous = [], vise = null, fini = false, pause = 0, recul = 0, dernier = null, flash = 0;
  const majHaut = () => { $("tiScore").textContent = score; $("tiSerie").textContent = `Série ${Math.min(2, Math.floor(tires / 5) + 1)} / 2`; $("tiBalles").textContent = "• ".repeat(Math.max(0, BALLES - tires)).trim(); };
  majHaut();
  // la respiration : le viseur décrit une petite boucle ; tenu une à deux secondes, il se calme (on retient son souffle), puis il tremble de plus en plus
  const derive = t => { const h = vise ? (t - vise.t0) / 1000 : 0, a = h < .6 ? 11 - h * 10 : h < 2.4 ? 4.5 : 4.5 + (h - 2.4) * 7;
    return [Math.sin(t / 610) * a + Math.sin(t / 233) * a * .35, Math.cos(t / 820) * a * .8 + Math.sin(t / 290) * a * .3]; };
  const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; };
  const decal = e => e.pointerType === "mouse" ? 0 : 80;   // au doigt : le viseur au-dessus du doigt
  cv.addEventListener("pointerdown", e => { e.preventDefault(); if (fini || pause) return; const [px, py] = pos(e); vise = { x: px, y: py - decal(e), t0: performance.now(), d: decal(e) }; try { cv.setPointerCapture(e.pointerId); } catch (er) {} });
  cv.addEventListener("pointermove", e => { if (!vise) return; const [px, py] = pos(e); vise.x = px; vise.y = py - vise.d; });
  // la détonation (un bruit court, sec, qui résonne un peu dans la salle)
  let ac = null; const pan = () => { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const n = ac.sampleRate * .35, b = ac.createBuffer(1, n, ac.sampleRate), dd = b.getChannelData(0);
    for (let i = 0; i < n; i++) dd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 6) * (i < 60 ? 1 : .8);
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), gn = ac.createGain(); s.buffer = b; f.type = "lowpass"; f.frequency.value = 2600; gn.gain.value = .7; s.connect(f).connect(gn).connect(ac.destination); s.start(); } catch (e) {} };
  const tirer = () => { if (!vise || fini) return; const t = performance.now(), [dx, dy] = derive(t), px = vise.x + dx, py = vise.y + dy; vise = null;
    const u = (px - TX) / TW, v = (py - TY) / TH, dans = u >= 0 && u <= 1 && v >= 0 && v <= 1, p = dans ? points(u, v) : 0;
    score += p; tires++; trous.push({ x: px, y: py }); dernier = { p, t, dans }; recul = t; flash = t; pan(); majHaut();
    if (tires === 5) pause = t + 1400; if (tires >= BALLES) pause = t + 1400; };
  cv.addEventListener("pointerup", tirer); cv.addEventListener("pointercancel", () => { vise = null; });

  const dessiner = t => {
    const kr = Math.max(0, 1 - (t - recul) / 260), sx = kr * Math.sin(t / 9) * 6, sy = -kr * 10;   // le recul : l'image saute
    x.save(); x.translate(sx, sy); x.drawImage(decor, 0, 0);
    for (const h of trous) { x.fillStyle = "rgba(255,255,255,.85)"; x.beginPath(); x.arc(h.x, h.y, 3.2, 0, 7); x.fill(); x.fillStyle = "#3a2a1a"; x.beginPath(); x.arc(h.x, h.y, 2.1, 0, 7); x.fill(); }   // les impacts
    if (vise) { const [dx, dy] = derive(t), vx = vise.x + dx, vy = vise.y + dy;   // le viseur, et la lunette qui grossit la cible
      x.save(); x.beginPath(); x.arc(vx, vy, 38, 0, 7); x.clip(); x.translate(vx, vy); x.scale(1.9, 1.9); x.translate(-vx, -vy); x.drawImage(decor, 0, 0);
      for (const h of trous) { x.fillStyle = "#3a2a1a"; x.beginPath(); x.arc(h.x, h.y, 2.1, 0, 7); x.fill(); } x.restore();
      x.strokeStyle = "#111"; x.lineWidth = 4; x.beginPath(); x.arc(vx, vy, 38, 0, 7); x.stroke();
      x.strokeStyle = "#c8102e"; x.lineWidth = 1.6; x.beginPath(); x.moveTo(vx - 34, vy); x.lineTo(vx - 6, vy); x.moveTo(vx + 6, vy); x.lineTo(vx + 34, vy); x.moveTo(vx, vy - 34); x.lineTo(vx, vy - 6); x.moveTo(vx, vy + 6); x.lineTo(vx, vy + 34); x.stroke();
      x.beginPath(); x.arc(vx, vy, 1.6, 0, 7); x.fillStyle = "#c8102e"; x.fill(); }
    // la carabine, en bas, qui suit un peu le viseur
    { const ax = vise ? vise.x : W / 2, cx = W / 2 + (ax - W / 2) * .25;
      x.fillStyle = "#1c1e22"; x.beginPath(); x.moveTo(cx - 5, H - 150); x.lineTo(cx + 5, H - 150); x.lineTo(cx + 10, H - 40); x.lineTo(cx - 10, H - 40); x.fill();
      x.fillStyle = "#8a5a32"; x.beginPath(); x.moveTo(cx - 22, H - 60); x.lineTo(cx + 22, H - 60); x.lineTo(cx + 34, H + 10); x.lineTo(cx - 34, H + 10); x.fill();
      x.fillStyle = "#2a2c30"; x.fillRect(cx - 9, H - 120, 18, 36); }
    if (t - flash < 70) { x.fillStyle = "rgba(255,230,160,.55)"; x.fillRect(0, 0, W, H); }   // l'éclair du coup
    x.restore();
    if (dernier && t - dernier.t < 1000) { x.fillStyle = dernier.p ? "#ffcf3a" : "#ff8a7a"; x.font = dernier.msg ? "900 24px Impact, Arial Black, sans-serif" : "900 34px Impact, Arial Black, sans-serif"; x.textAlign = "center"; x.fillText(dernier.msg ? "2ᵉ SÉRIE — carton neuf" : dernier.p ? "+" + dernier.p : dernier.dans ? "0" : "Hors cible", W / 2, 46); }
    if (pause && t > pause) { pause = 0; if (tires >= BALLES) terminer(); else { trous = []; dernier = { p: 0, t, dans: true, msg: 1 }; } }   // (après la 1re série : le carton est changé)
  };
  let boucle = 0; const tour = t => { dessiner(t); boucle = requestAnimationFrame(tour); }; boucle = requestAnimationFrame(tour);

  async function terminer() {
    fini = true; $("tiFinScore").textContent = score + " / 50"; $("tiFinTop").innerHTML = "<small>Enregistrement du score…</small>"; $("tiFin").style.display = "grid";
    try { const r = await envoyerScore(score);
      $("tiFinTop").innerHTML = `<div style="color:#ffcf3a;font-weight:700;margin-bottom:6px">🏆 Les 3 meilleurs tireurs</div>` + (r.top || []).map((e, i) => `<div>${["🥇", "🥈", "🥉"][i]} ${e.nom.replace(/[<>&]/g, "")} — <b>${e.score}</b></div>`).join("")
        + `<div style="margin-top:8px;color:#cfe0c8">Ton record : <b>${r.record || 0}</b></div>`;
    } catch (e) { $("tiFinTop").textContent = "Le score n'a pas pu être enregistré : " + e.message; }
  }
  const rejouer = () => { score = 0; tires = 0; trous = []; fini = false; pause = 0; dernier = null; majHaut(); $("tiFin").style.display = "none"; };
  const fermer = () => { cancelAnimationFrame(boucle); fond.remove(); try { ac && ac.close(); } catch (e) {} surFerme && surFerme(); };
  $("tiRejouer").onclick = rejouer; $("tiFermer").onclick = fermer; $("tiQuitter").onclick = fermer;
  return fermer;
}
