/* Les fléchettes de la salle des fêtes : 3 volées de 3 fléchettes, au doigt ou à la souris.
   On pose le doigt, on vise avec le viseur (il tremble un peu, comme la main), on lève le doigt : la fléchette part.
   Score : les secteurs (1 à 20), double, triple, le 25 et le bull (50). À la fin, le score part au serveur pour le classement au mur. */
const W = 400, H = 560, CX = 200, CY = 236, R = 186;

export function ouvrirFlechettes({ envoyerScore, dessinerCible, secteurs }) {
  const fond = document.createElement("div");
  fond.style.cssText = "position:fixed;inset:0;z-index:2600;background:radial-gradient(circle at 50% 30%,#2b1a10,#0a0705 80%);display:flex;flex-direction:column;align-items:center;justify-content:center;touch-action:none;user-select:none;-webkit-user-select:none";
  fond.innerHTML = `<div style="display:flex;gap:14px;align-items:center;color:#f4ecd8;font:700 16px Arial;margin:6px 0">
      <span>🎯 SCORE <b id="flScore" style="color:#7ef0ff;font-family:'Courier New',monospace;font-size:20px">0</b></span><span id="flVolee">Volée 1 / 3</span></div>
    <canvas id="flCanvas" width="${W}" height="${H}" style="max-width:96vw;max-height:calc(100vh - 110px);aspect-ratio:${W}/${H};border-radius:14px;box-shadow:0 0 0 6px #3a1d0e,0 0 0 9px #c9a227"></canvas>
    <div style="color:#d8c9a8;font:14px Arial;margin-top:8px;text-align:center">Pose le doigt, vise avec le viseur, lève le doigt pour lancer</div>
    <button id="flQuitter" type="button" aria-label="Quitter les fléchettes" style="position:fixed;top:calc(14px + env(safe-area-inset-top));right:14px;width:44px;height:44px;border-radius:50%;border:2px solid rgba(255,255,255,.6);background:rgba(0,0,0,.55);color:#fff;font-size:20px">✕</button>
    <div id="flFin" style="position:fixed;inset:0;display:none;place-items:center;background:rgba(0,0,0,.6)"><div style="background:#1b130d;border:3px solid #c9a227;border-radius:16px;padding:22px 26px;color:#f4ecd8;text-align:center;font:16px Arial;min-width:250px">
      <div style="font:900 26px Impact,Arial Black,sans-serif;color:#ffcf3a">PARTIE TERMINÉE</div><div id="flFinScore" style="font:700 30px 'Courier New',monospace;color:#7ef0ff;margin:10px 0"></div>
      <div id="flFinTop" style="text-align:left;margin:10px 0 16px"></div>
      <button id="flRejouer" type="button" style="font:700 16px Arial;padding:10px 18px;border-radius:999px;border:0;background:#c9a227;color:#1b130d">Rejouer</button>
      <button id="flFermer" type="button" style="font:700 16px Arial;padding:10px 18px;border-radius:999px;border:0;background:#4a3a2c;color:#f4ecd8;margin-left:8px">Revenir au bar</button></div></div>`;
  (document.fullscreenElement || document.body).appendChild(fond);
  const $ = id => fond.querySelector("#" + id), cv = $("flCanvas"), x = cv.getContext("2d");
  const k = R / 225;
  // la cible, dessinée une fois
  const cible = document.createElement("canvas"); cible.width = W; cible.height = H; dessinerCible(cible.getContext("2d"), CX, CY, R);

  let score = 0, volee = 1, plantees = [], lancers = [], vise = null, fini = false, pause = 0;
  const majHaut = () => { $("flScore").textContent = score; $("flVolee").textContent = `Volée ${Math.min(volee, 3)} / 3`; };
  const valeur = (px, py) => {
    const dx = px - CX, dy = py - CY, d = Math.hypot(dx, dy) / k;
    if (d <= 6.35) return [50, "BULL !"]; if (d <= 15.9) return [25, "25"]; if (d > 170) return [0, "Raté"];
    let a = Math.atan2(dy, dx) + Math.PI / 2 + Math.PI / 20; a = ((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const s = secteurs[Math.floor(a / (Math.PI / 10)) % 20];
    if (d >= 99 && d <= 107) return [s * 3, "Triple " + s]; if (d >= 162) return [s * 2, "Double " + s]; return [s, String(s)];
  };
  // le viseur tremble un peu (la main), un peu plus quand on garde longtemps le doigt posé
  const tremble = t => { const a = 7 + Math.min(8, (vise ? (t - vise.t0) / 600 : 0)); return [Math.sin(t / 470) * a + Math.sin(t / 190) * a * .4, Math.cos(t / 530) * a + Math.cos(t / 230) * a * .4]; };
  const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; };
  const decal = e => e.pointerType === "mouse" ? 0 : 70;   // au doigt, le viseur est au-dessus du doigt, pour bien le voir
  cv.addEventListener("pointerdown", e => { e.preventDefault(); if (fini || pause) return; const [px, py] = pos(e); vise = { x: px, y: py - decal(e), t0: performance.now(), d: decal(e) }; try { cv.setPointerCapture(e.pointerId); } catch (er) {} });
  cv.addEventListener("pointermove", e => { if (!vise) return; const [px, py] = pos(e); vise.x = px; vise.y = py - vise.d; });
  const lacher = () => { if (!vise || fini) return; const t = performance.now(), [tx, ty] = tremble(t), px = vise.x + tx, py = vise.y + ty; vise = null;
    const [v, txt] = valeur(px, py); score += v; plantees.push({ x: px, y: py }); lancers.push({ v, txt, t }); majHaut();
    if (plantees.length === 3) { pause = t + 1300; } };
  cv.addEventListener("pointerup", lacher); cv.addEventListener("pointercancel", () => { vise = null; });

  const dessiner = t => {
    x.fillStyle = "#3a2a1e"; x.fillRect(0, 0, W, H); x.fillStyle = "rgba(0,0,0,.25)"; for (let yy = 0; yy < H; yy += 18) x.fillRect(0, yy, W, 2);   // le mur
    x.drawImage(cible, 0, 0);
    for (const p of plantees) { x.strokeStyle = "#cfd3d8"; x.lineWidth = 3; x.beginPath(); x.moveTo(p.x, p.y); x.lineTo(p.x + 10, p.y + 16); x.stroke();
      x.fillStyle = "#c8102e"; x.beginPath(); x.moveTo(p.x + 9, p.y + 14); x.lineTo(p.x + 20, p.y + 22); x.lineTo(p.x + 12, p.y + 27); x.closePath(); x.fill();
      x.fillStyle = "#fff"; x.beginPath(); x.arc(p.x, p.y, 2.5, 0, 7); x.fill(); }
    if (vise) { const [tx, ty] = tremble(t), vx = vise.x + tx, vy = vise.y + ty;
      x.strokeStyle = "#7ef0ff"; x.lineWidth = 2; x.beginPath(); x.arc(vx, vy, 12, 0, 7); x.moveTo(vx - 20, vy); x.lineTo(vx + 20, vy); x.moveTo(vx, vy - 20); x.lineTo(vx, vy + 20); x.stroke(); }
    // les trois fléchettes de la volée
    x.textAlign = "center"; x.font = "bold 18px Arial";
    for (let i = 0; i < 3; i++) { const l = lancers[lancers.length - plantees.length + i], bx = 80 + i * 120, by = H - 54;
      x.fillStyle = "rgba(0,0,0,.45)"; x.beginPath(); x.roundRect(bx - 50, by - 22, 100, 44, 10); x.fill();
      x.fillStyle = l && i < plantees.length ? "#ffcf3a" : "#7d6a55"; x.fillText(l && i < plantees.length ? `${l.txt}` : "🎯", bx, by + 6); }
    const der = lancers[lancers.length - 1];
    if (der && t - der.t < 900) { x.fillStyle = "#ffcf3a"; x.font = "900 34px Impact, Arial Black, sans-serif"; x.fillText(der.v ? "+" + der.v : "Raté", CX, 40); }
    if (pause && t > pause) { pause = 0; plantees = []; volee++; majHaut(); if (volee > 3) terminer(); }
  };
  let boucle = 0; const tour = t => { dessiner(t); boucle = requestAnimationFrame(tour); }; boucle = requestAnimationFrame(tour);

  async function terminer() {
    fini = true; $("flFinScore").textContent = score + " pts"; $("flFinTop").innerHTML = "<small>Enregistrement du score…</small>"; $("flFin").style.display = "grid";
    try { const r = await envoyerScore(score);
      $("flFinTop").innerHTML = `<div style="color:#ffcf3a;font-weight:700;margin-bottom:6px">🏆 Le classement au mur</div>` + (r.top || []).map((e, i) => `<div>${["🥇", "🥈", "🥉"][i]} ${e.nom.replace(/[<>&]/g, "")} — <b>${e.score}</b></div>`).join("")
        + `<div style="margin-top:8px;color:#d8c9a8">Ton record : <b>${r.record || 0}</b></div>`;
    } catch (e) { $("flFinTop").textContent = "Le score n'a pas pu être enregistré : " + e.message; }
  }
  const rejouer = () => { score = 0; volee = 1; plantees = []; lancers = []; fini = false; pause = 0; majHaut(); $("flFin").style.display = "none"; };
  const fermer = () => { cancelAnimationFrame(boucle); fond.remove(); };
  $("flRejouer").onclick = rejouer; $("flFermer").onclick = fermer; $("flQuitter").onclick = fermer;
  return fermer;
}
