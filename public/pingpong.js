/* La salle de ping-pong du sous-sol : une partie contre l'ordinateur, vue de derrière sa raquette.
   On fait glisser le doigt (ou la souris) : la raquette suit. Frapper avec le bord de la raquette envoie la balle en coin ; un coup de doigt vers le haut, au moment de frapper, la fait partir plus vite.
   L'ordinateur sert, et il devient plus fort à chaque point qu'on lui prend. La partie s'arrête quand il atteint 11 points : le score, ce sont nos points ; il part au serveur pour le classement des 3 meilleurs. */
const W = 400, H = 600, FIN = 11;
const TL = 2.74, TW = 1.525, NET = .1525, G = 9.8;   // (la table réglementaire, en mètres ; z = 0 : notre bout, z = TL : celui de l'ordinateur)
const ZJ = -.12, ZO = TL + .12, DEMI = .19;   // (là où l'on frappe, de chaque côté ; la demi-largeur utile de la raquette)
const F = 250, CH = 1.1, D0 = 1, HZ = 150;   // (la caméra : la focale, sa hauteur au-dessus de la table, son recul, l'horizon)

export function ouvrirPingPong({ envoyerScore, surFerme }) {
  const fond = document.createElement("div");
  fond.style.cssText = "position:fixed;inset:0;z-index:2600;background:radial-gradient(circle at 50% 30%,#2a3d31,#070a08 80%);display:flex;flex-direction:column;align-items:center;justify-content:center;touch-action:none;user-select:none;-webkit-user-select:none";
  fond.innerHTML = `<div style="display:flex;gap:16px;align-items:center;color:#eef4e6;font:700 16px Arial;margin:6px 0">
      <span>🏓 TOI <b id="ppMoi" style="color:#7ef0ff;font-family:'Courier New',monospace;font-size:22px">0</b></span><span style="opacity:.6">—</span><span>ORDI <b id="ppOrdi" style="color:#ff8a7a;font-family:'Courier New',monospace;font-size:22px">0</b></span></div>
    <canvas id="ppCanvas" width="${W}" height="${H}" style="max-width:96vw;max-height:calc(100vh - 110px);aspect-ratio:${W}/${H};border-radius:14px;box-shadow:0 0 0 6px #23301f,0 0 0 9px #9cbf96;touch-action:none"></canvas>
    <div style="color:#cfe0c8;font:14px Arial;margin-top:8px;text-align:center;padding:0 12px">Glisse le doigt pour bouger ta raquette — frappe avec le bord pour viser les coins.<br>La partie s'arrête quand l'ordi a 11 points : ton score, ce sont tes points.</div>
    <button id="ppQuitter" type="button" aria-label="Quitter la table de ping-pong" style="position:fixed;top:calc(14px + env(safe-area-inset-top));right:14px;width:44px;height:44px;border-radius:50%;border:2px solid rgba(255,255,255,.6);background:rgba(0,0,0,.5);color:#fff;font:700 20px Arial">✕</button>
    <div id="ppFin" style="position:fixed;inset:0;display:none;place-items:center;background:rgba(0,0,0,.6)"><div style="background:#141c14;border:3px solid #9cbf96;border-radius:16px;padding:22px 26px;color:#eef4e6;text-align:center;font:16px Arial;max-width:86vw">
      <div style="font:900 26px Impact,Arial Black,sans-serif;color:#ffcf3a">FIN DE LA PARTIE</div><div id="ppFinScore" style="font:700 30px 'Courier New',monospace;color:#7ef0ff;margin:10px 0"></div>
      <div id="ppFinTop" style="text-align:left;margin:10px 0 16px"></div>
      <button id="ppRejouer" type="button" style="font:700 16px Arial;padding:10px 18px;border-radius:999px;border:0;background:#9cbf96;color:#141c14">Revanche</button>
      <button id="ppFermer" type="button" style="font:700 16px Arial;padding:10px 18px;border-radius:999px;border:0;background:#3a4a36;color:#eef4e6;margin-left:8px">Poser la raquette</button></div></div>`;
  (document.fullscreenElement || document.body).appendChild(fond);
  const $ = id => fond.querySelector("#" + id), cv = $("ppCanvas"), x = cv.getContext("2d");

  // la projection : un point de la table (x, y au-dessus du plateau, z) vers l'écran
  const ech = z => F / (z + D0), ecran = (px, py, pz) => { const s = ech(pz); return [W / 2 + px * s, HZ + (CH - py) * s, s]; };
  const versX = (sx, z) => (sx - W / 2) / ech(z);   // (l'inverse, en x, à la profondeur z)

  // le décor, dessiné une fois : les murs vert pastel, le sol de béton, la table bleue, ses lignes, le filet
  const decor = document.createElement("canvas"); decor.width = W; decor.height = H; { const d = decor.getContext("2d");
    d.fillStyle = "#a9c7a0"; d.fillRect(0, 0, W, H); d.fillStyle = "#bcd8b2"; d.fillRect(0, 0, W, 60);
    for (const k of [0, 1]) { d.fillStyle = "#fbfdff"; d.fillRect(70 + k * 170, 14, 90, 6); d.fillStyle = "rgba(240,248,255,.25)"; d.fillRect(64 + k * 170, 10, 102, 14); }   // les néons
    const yS = HZ + CH * ech(TL + 2.2), g = d.createLinearGradient(0, yS, 0, H); g.addColorStop(0, "#8d8d88"); g.addColorStop(1, "#b9b9b3"); d.fillStyle = g; d.fillRect(0, yS, W, H - yS);   // le sol
    for (let i = 0; i < 400; i++) { d.fillStyle = `rgba(60,60,55,${Math.random() * .12})`; d.fillRect(Math.random() * W, yS + Math.random() * (H - yS), 2, 2); }
    d.fillStyle = "#e9e4cf"; d.fillRect(0, yS - 4, W, 4);   // la plinthe
    const coin = (px, pz, py = 0) => ecran(px, py, pz).slice(0, 2), poly = (pts, c) => { d.fillStyle = c; d.beginPath(); pts.forEach(([a, b], i) => i ? d.lineTo(a, b) : d.moveTo(a, b)); d.closePath(); d.fill(); };
    // les pieds, puis l'épaisseur et le plateau
    d.fillStyle = "#2a2c30"; for (const [px, pz] of [[-.6, .3], [.6, .3], [-.6, TL - .3], [.6, TL - .3]]) { const [a, b, s] = ecran(px, 0, pz); d.fillRect(a - .025 * s, b, .05 * s, .74 * s); }
    poly([coin(-TW / 2, 0), coin(TW / 2, 0), coin(TW / 2, 0, -.03), coin(-TW / 2, 0, -.03)], "#13324b");
    poly([coin(-TW / 2, 0), coin(TW / 2, 0), coin(TW / 2, TL), coin(-TW / 2, TL)], "#1d4a6e");
    d.strokeStyle = "#f4f4f0"; d.lineWidth = 2; d.beginPath(); for (const [p0, p1] of [[[-TW / 2, 0], [-TW / 2, TL]], [[TW / 2, 0], [TW / 2, TL]], [[-TW / 2, 0], [TW / 2, 0]], [[-TW / 2, TL], [TW / 2, TL]]]) { d.moveTo(...coin(...p0)); d.lineTo(...coin(...p1)); } d.stroke();
    d.lineWidth = 1; d.beginPath(); d.moveTo(...coin(0, 0)); d.lineTo(...coin(0, TL)); d.stroke();   // la ligne du milieu
    // le filet
    const [n0x, n0y] = coin(-TW / 2 - .15, TL / 2), [n1x] = coin(TW / 2 + .15, TL / 2), [, nhy] = coin(0, TL / 2, NET);
    d.fillStyle = "rgba(15,15,15,.55)"; d.fillRect(n0x, nhy, n1x - n0x, n0y - nhy); d.strokeStyle = "rgba(255,255,255,.25)"; d.lineWidth = .5;
    for (let a = n0x; a < n1x; a += 3) { d.beginPath(); d.moveTo(a, nhy); d.lineTo(a, n0y); d.stroke(); }
    d.fillStyle = "#f4f4f0"; d.fillRect(n0x, nhy - 2, n1x - n0x, 3); d.fillStyle = "#2a2c30"; d.fillRect(n0x - 3, nhy - 2, 3, n0y - nhy + 4); d.fillRect(n1x, nhy - 2, 3, n0y - nhy + 4); }

  // le son : un « toc » court (sur la table, plus sec ; sur la raquette, plus rond)
  let ac = null; const toc = (f = 900) => { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const o = ac.createOscillator(), gn = ac.createGain(), t = ac.currentTime;
    o.type = "sine"; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * .5, t + .06); gn.gain.setValueAtTime(.35, t); gn.gain.exponentialRampToValueAtTime(.001, t + .08); o.connect(gn).connect(ac.destination); o.start(t); o.stop(t + .09); } catch (e) {} };

  let moi = 0, ordi = 0, fini = false, b = null, msg = null, service = 0;
  const raq = { x: 0, vx: 0, vy: 0 }, cpu = { x: 0 }, majHaut = () => { $("ppMoi").textContent = moi; $("ppOrdi").textContent = ordi; };
  // un coup : de (x0, y0, z0), la balle rebondit en (xt, zt), en passant au-dessus du filet ; T, la durée du vol jusqu'au rebond
  const coup = (x0, y0, z0, xt, zt, T, par) => { for (let k = 0; k < 12; k++, T *= 1.08) { const vy = (G * T * T / 2 - y0) / T, vz = (zt - z0) / T, tn = (TL / 2 - z0) / vz, hn = y0 + vy * tn - G * tn * tn / 2;
      if (hn > NET + .06 || k === 11) { b = { x: x0, y: y0, z: z0, vx: (xt - x0) / T, vy, vz, rebonds: 0, par, cote: null }; return; } } };
  const servir = () => { cpu.x = (Math.random() - .5) * .5; const n = moi; coup(cpu.x, .28, ZO, (Math.random() - .5) * Math.min(1.1, .5 + n * .04), .55 + Math.random() * .6, Math.max(.38, .62 - n * .015), "ordi"); toc(700); };
  const point = (pourMoi, texte) => { if (!b) return; b = null; if (pourMoi) moi++; else ordi++; majHaut(); msg = { t: performance.now(), texte, bon: pourMoi };
    if (ordi >= FIN) setTimeout(terminer, 1200); else service = performance.now() + 900; };
  service = performance.now() + 800;

  // la raquette suit le doigt (en x, à la hauteur de la frappe) ; on garde sa vitesse pour l'effet et la puissance
  const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; };
  let dernier = null; const bouge = e => { e.preventDefault(); const [sx, sy] = pos(e), t = performance.now(), nx = Math.max(-1.1, Math.min(1.1, versX(sx, ZJ)));
    if (dernier) { const dt = Math.max(8, t - dernier.t) / 1000; raq.vx = raq.vx * .5 + (nx - raq.x) / dt * .5; raq.vy = raq.vy * .5 + (dernier.y - sy) / dt * .5; } raq.x = nx; dernier = { y: sy, t }; };
  cv.addEventListener("pointerdown", e => { dernier = null; bouge(e); try { cv.setPointerCapture(e.pointerId); } catch (er) {} });
  cv.addEventListener("pointermove", bouge);

  // la balle est perdue (par terre, ou passée) : si elle avait rebondi chez l'adversaire, le point est à celui qui l'a frappée ; sinon, c'était dehors
  const perdue = () => { const pourMoi = (b.par === "moi") === (b.rebonds > 0); point(pourMoi, b.rebonds ? (pourMoi ? "Point !" : "Raté…") : "Dehors !"); };
  const avancer = dt => {
    if (!b) return; const n = moi;
    // l'ordinateur se place sous la balle (il anticipe un peu), avec une vitesse limitée qui grandit à chaque point qu'on lui prend
    { const vise = b.vz > 0 ? b.x + b.vx * Math.max(0, (ZO - b.z) / b.vz) : 0, vmax = 1.6 + n * .12; cpu.x += Math.max(-vmax * dt, Math.min(vmax * dt, vise - cpu.x)); }
    const z0 = b.z, y0 = b.y; b.vy -= G * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt;
    // le filet
    if ((z0 - TL / 2) * (b.z - TL / 2) <= 0 && b.y < NET && Math.abs(b.x) < TW / 2 + .15) return point(b.par === "ordi", "Filet !");
    // le rebond sur la table (dans le bon camp), ou à côté
    if (y0 > 0 && b.y <= 0) { const dedans = Math.abs(b.x) <= TW / 2 && b.z >= 0 && b.z <= TL;
      if (dedans) { const cote = b.z < TL / 2 ? "moi" : "ordi";
        if (b.rebonds > 0 || (b.par === "ordi") === (cote === "ordi")) return point(cote === "ordi", cote === "ordi" ? "Point !" : "Raté…");   // (deux rebonds, ou dans son propre camp)
        b.y = 0; b.vy = -b.vy * .86; b.rebonds++; b.cote = cote; toc(1100); } }
    if (b.y < -.9 || b.z < -1.6 || b.z > TL + 1.6) return perdue();
    // notre frappe
    if (b.vz < 0 && z0 > ZJ && b.z <= ZJ) {
      if (!b.rebonds) return point(true, "Dehors !");
      const off = (b.x - raq.x) / DEMI;
      if (Math.abs(off) > 1) return;   // (raté : la balle file, le point viendra)
      const p = Math.max(0, Math.min(1, raq.vy / 2200)), xt = Math.max(-.95, Math.min(.95, off * .72 + raq.vx * .06));
      coup(b.x, Math.max(.12, b.y), ZJ, xt, 1.85 + Math.random() * .6 + p * .15, Math.max(.3, .58 - p * .22 - n * .005), "moi"); toc(650); return; }
    // la frappe de l'ordinateur (s'il est là) : de plus en plus vite, de plus en plus en coin ; il lui arrive de rater, de moins en moins
    if (b.vz > 0 && z0 < ZO && b.z >= ZO) {
      if (!b.rebonds) return point(false, "Dehors !");
      if (Math.abs(b.x - cpu.x) > DEMI * 1.15) return;
      const faute = Math.random() < Math.max(.04, .2 - n * .012), large = Math.min(1.25, .55 + n * .05);
      const xt = faute ? (Math.random() < .5 ? -1 : 1) * (TW / 2 + .1 + Math.random() * .2) : (Math.random() - .5) * large;
      coup(b.x, Math.max(.12, b.y), ZO, xt, faute && Math.random() < .5 ? -.25 : .35 + Math.random() * .75, Math.max(.32, .62 - n * .015), "ordi"); toc(650); }
  };

  const balleSur = (px, py, pz) => { const [a, c, s] = ecran(px, py, pz), r = Math.max(2.6, .03 * s);
    if (Math.abs(px) <= TW / 2 && pz >= 0 && pz <= TL && py >= 0) { const [sa, sc] = ecran(px, 0, pz); x.fillStyle = "rgba(0,0,0,.3)"; x.beginPath(); x.ellipse(sa, sc, r * 1.1, r * .5, 0, 0, 7); x.fill(); }   // son ombre sur la table
    const g = x.createRadialGradient(a - r * .3, c - r * .3, r * .1, a, c, r); g.addColorStop(0, "#fff"); g.addColorStop(1, "#ffb347"); x.fillStyle = g; x.beginPath(); x.arc(a, c, r, 0, 7); x.fill(); };
  const raquette = (px, pz, coul, dos) => { const [a, c, s] = ecran(px, .16, pz), r = .085 * s;
    x.fillStyle = "#c8a06a"; x.fillRect(a - r * .18, c + r * .7, r * .36, r * 1.1);   // le manche
    x.fillStyle = dos ? "#111" : coul; x.globalAlpha = dos ? 1 : .82; x.beginPath(); x.ellipse(a, c, r, r * 1.08, 0, 0, 7); x.fill(); x.globalAlpha = 1; x.strokeStyle = "#2a1a10"; x.lineWidth = Math.max(1, r * .06); x.stroke(); };
  const dessiner = t => {
    x.drawImage(decor, 0, 0);
    { const [a, c, s] = ecran(cpu.x, 0, TL + .35); x.fillStyle = "#1c2a3a"; x.fillRect(a - .2 * s, c - 1.25 * s, .4 * s, .9 * s); x.fillStyle = "#e8c4a0"; x.beginPath(); x.arc(a, c - 1.42 * s, .13 * s, 0, 7); x.fill(); }   // l'adversaire, au fond
    const derriere = b && b.z > TL / 2; if (b && derriere) balleSur(b.x, b.y, b.z);
    raquette(cpu.x + .12, ZO, "#111", true);
    if (b && !derriere) balleSur(b.x, b.y, b.z);
    raquette(raq.x, ZJ, "#c8102e", false);
    if (msg && t - msg.t < 850) { x.fillStyle = msg.bon ? "#ffcf3a" : "#ff8a7a"; x.font = "900 34px Impact, Arial Black, sans-serif"; x.textAlign = "center"; x.strokeStyle = "rgba(0,0,0,.6)"; x.lineWidth = 4; x.strokeText(msg.texte, W / 2, 110); x.fillText(msg.texte, W / 2, 110); }
    if (!b && !fini && service && t > service) { service = 0; servir(); }
  };
  let boucle = 0, avant = performance.now(); const tour = t => { const dt = Math.min(.05, (t - avant) / 1000); avant = t; if (!fini) for (let i = 0; i < 4; i++) avancer(dt / 4); dessiner(t); boucle = requestAnimationFrame(tour); };
  boucle = requestAnimationFrame(tour);

  async function terminer() {
    fini = true; b = null; $("ppFinScore").textContent = `${moi} – ${ordi}`; $("ppFinTop").innerHTML = "<small>Enregistrement du score…</small>"; $("ppFin").style.display = "grid";
    try { const r = await envoyerScore(moi);
      $("ppFinTop").innerHTML = `<div style="color:#ffcf3a;font-weight:700;margin-bottom:6px">🏆 Les 3 meilleurs pongistes</div>` + (r.top || []).map((e, i) => `<div>${["🥇", "🥈", "🥉"][i]} ${e.nom.replace(/[<>&]/g, "")} — <b>${e.score}</b></div>`).join("")
        + `<div style="margin-top:8px;color:#cfe0c8">Ton record : <b>${r.record || 0}</b> points</div>`;
    } catch (e) { $("ppFinTop").textContent = "Le score n'a pas pu être enregistré : " + e.message; }
  }
  const rejouer = () => { moi = 0; ordi = 0; fini = false; b = null; msg = null; service = performance.now() + 1000; majHaut(); $("ppFin").style.display = "none"; };
  const fermer = () => { cancelAnimationFrame(boucle); fond.remove(); try { ac && ac.close(); } catch (e) {} surFerme && surFerme(); };
  $("ppRejouer").onclick = rejouer; $("ppFermer").onclick = fermer; $("ppQuitter").onclick = fermer;
  return fermer;
}
