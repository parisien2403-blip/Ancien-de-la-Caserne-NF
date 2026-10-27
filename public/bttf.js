/* Retour vers le futur : les cinématiques (la DeLorean, l'éclair, le retour), Doc, les habitants de Hill Valley qui se promènent, le juke-box.
   (La ville de Hill Valley elle-même — les immeubles, les voitures — reste dans matrice.js : Kingston Falls la reprend sous la neige.)
   Chargé par la matrice (matrice.js) la première fois qu'on va dans un lieu de Retour vers le futur, et exécuté chez elle (eval direct) :
   il se sert tel quel de tout ce qu'elle a. Ce qu'il rend (la dernière expression) : ses points d'entrée. */
/* ===================== Retour vers le futur =====================
   L'Almanach des sports traîne quelque part dans la caserne (un seul, placé par le serveur, jamais deux fois au même endroit).
   Qui marche dessus peut le ramasser : il quitte la Matrice des autres, la DeLorean de Doc vient le chercher dans une cour d'honneur
   rien qu'à lui, fonce en laissant deux traînées de feu… et le dépose à Hill Valley, le 14 juillet 1955. */
// (l'administrateur) faire venir l'Almanach au sol, à un mètre de soi, à un endroit où l'on peut marcher
// (administrateur) la radio rouge de Silent Hill, posée juste à côté de soi
// l'Almanach posé au sol, l'air de rien
// ---- la musique du voyage : elle part dès qu'on ramasse l'Almanach ; elle s'éteint en fondu ----
// le juke-box de Lou's Cafe : trois chansons, l'une après l'autre, en boucle (seulement dans le café), et son réglage de volume
const CAFE_MUS = ["sons/bttf/cafe-johnny.mp3", "sons/bttf/cafe-earth.mp3", "sons/bttf/cafe-rock.mp3"];
let volCafe = (() => { try { const v = localStorage.getItem("volCafe"); return v == null ? .8 : +v; } catch (e) { return .8; } })();
function jukeboxCafe(i) { couperMusiqueBttf(600); try { const a = new Audio(CAFE_MUS[i % CAFE_MUS.length]); a.volume = volCafe; a.cafe = true; a.onended = () => { if (musBttf === a) jukeboxCafe(i + 1); }; a.play().catch(() => {}); musBttf = a; if (M) M.cafeI = i % CAFE_MUS.length; } catch (e) {} }
function reglageVolumeCafe(voir) { if (!M) return; if (!M.volCafeEl && voir) { const d = document.createElement("label"); d.style.cssText = "position:absolute;left:12px;top:46px;z-index:9;display:flex;align-items:center;gap:8px;padding:6px 12px;border-radius:99px;background:rgba(20,20,24,.78);color:#fff;font:700 13px 'Lato',sans-serif";
    d.innerHTML = '🎵 Juke-box <input type="range" min="0" max="1" step="0.05" style="width:110px;accent-color:#e8b02a">'; const r = d.querySelector("input"); r.value = volCafe;
    r.oninput = () => { volCafe = +r.value; try { localStorage.setItem("volCafe", volCafe); } catch (e) {} if (musBttf && musBttf.cafe) musBttf.volume = volCafe; };
    for (const ev of ["pointerdown", "touchstart", "mousedown"]) d.addEventListener(ev, e => e.stopPropagation()); M.ctx.conteneur.appendChild(d); M.volCafeEl = d; }
  if (M.volCafeEl) M.volCafeEl.style.display = voir ? "flex" : "none"; }
// ---- les bulles de Doc, l'éclair blanc, le fondu : par-dessus la scène ----
// une caméra posée face au bonhomme, du côté où il y a de la place (hors de la cabine), le temps d'une petite cinématique
// le voyage par le téléphone : la musique (elle continue un moment de l'autre côté, puis s'éteint doucement)
// les éclairs qui traversent la cabine téléphonique (comme la DeLorean) : des arcs bleutés qui crépitent autour du bonhomme, une lueur qui clignote
// une bouffée de fumée grise qui monte et s'étale autour d'un point (de simples images, sans lumière : léger pour toutes les cartes graphiques)
// le combiné de la cabine, décroché : il pend seul au bout de son cordon en spirale et se balance (le combiné sur son crochet est caché le temps de la scène)
/* à Silent Hill : pas de bulle — des sous-titres, comme dans le jeu : en bas de l'image, sans cadre, un texte clair ombré de noir, le nom de qui parle en petites capitales ;
   ils ne cachent ni les visages ni la scène */
/* à Resident Evil : des sous-titres comme dans le jeu — un bandeau noir en bas de l'image, le nom de qui parle en rouge, et le texte qui s'écrit lettre après lettre */
// le logo « Retour vers le futur » qui surgit en grand, puis s'efface
function logoCine(ms) { const d = voile("display:grid;place-items:center;opacity:0;transition:opacity .35s, transform 5s ease-out;transform:scale(.7)", ms);
  d.innerHTML = '<img src="images/bttf/logo.webp" alt="Retour vers le futur" style="width:min(88%,620px);filter:drop-shadow(0 0 22px rgba(255,120,0,.7))">';
  requestAnimationFrame(() => requestAnimationFrame(() => { d.style.opacity = 1; d.style.transform = "scale(1.05)"; })); setTimeout(() => { d.style.opacity = 0; }, ms - 450); }
function titreCine(texte, ms) { const d = voile("display:grid;place-items:center;font:900 clamp(26px,7vw,54px)/1 'Marcellus',serif;color:#ffcf3a;text-shadow:0 0 18px #ff6a00,3px 3px 0 #7a1a00;letter-spacing:.04em;opacity:0;transition:opacity .4s", ms);
  d.textContent = texte; requestAnimationFrame(() => requestAnimationFrame(() => { d.style.opacity = 1; })); setTimeout(() => { d.style.opacity = 0; }, ms - 450); }
// le tableau des circuits temporels (DESTINATION / PRESENT / LAST TIME DEPARTED), affiché dans la DeLorean avant le départ ; la destination se tape chiffre à chiffre
function compteurTemps(ms) { const d = voile("display:grid;place-items:center;background:rgba(0,0,0,.55);opacity:0;transition:opacity .35s", ms);
  const MOIS = ["JANV", "FEVR", "MARS", "AVR", "MAI", "JUIN", "JUIL", "AOUT", "SEPT", "OCT", "NOV", "DEC"], n = new Date(), z2 = v => String(v).padStart(2, "0");
  const lignes = [["DESTINATION TIME", "#ff4a2a", ["JUIL", "14", "1955", "13", "00"], true], ["PRESENT TIME", "#4aff5a", [MOIS[n.getMonth()], z2(n.getDate()), String(n.getFullYear()), z2(n.getHours()), z2(n.getMinutes())], n.getHours() >= 12], ["LAST TIME DEPARTED", "#ffd02a", ["JUIL", "04", "1990", "20", "45"], true]];
  const case_ = (lab, val, coul, larg) => `<div style="display:flex;flex-direction:column;align-items:center;gap:3px"><div style="background:#a8201a;color:#f4e8e0;font:800 clamp(7px,1.6vw,11px) Arial;padding:1px 8px;letter-spacing:.06em">${lab}</div>
    <div style="position:relative;background:#0a0606;border:2px solid #2a2a2a;border-radius:3px;padding:2px 6px;min-width:${larg}em;text-align:center;font:italic 700 clamp(18px,5vw,40px)/1 'Courier New',monospace;letter-spacing:.06em">
    <span style="position:absolute;inset:2px 6px;color:${coul};opacity:.13">${"8".repeat(val.length)}</span><span class="cv" data-v="${val}" style="position:relative;color:${coul};text-shadow:0 0 8px ${coul},0 0 2px #fff">${val}</span></div></div>`;
  d.innerHTML = `<div style="background:linear-gradient(#77777a,#5c5c60);padding:10px 12px;border-radius:6px;box-shadow:0 0 0 3px #2a2a2c,0 10px 40px #000;display:flex;flex-direction:column;gap:10px;max-width:96%">` +
    lignes.map(([titre, coul, v, pm], i) => `<div class="ln" style="background:repeating-linear-gradient(45deg,#8a8a8e 0 2px,#7c7c80 2px 4px);border:2px solid #4a4a4e;border-radius:4px;padding:6px 8px 4px;display:flex;flex-direction:column;align-items:center;gap:4px">
      <div style="display:flex;gap:clamp(4px,1.2vw,10px);align-items:flex-end">${case_("MONTH", v[0], coul, 2.6)}${case_("DAY", v[1], coul, 1.5)}${case_("YEAR", v[2], coul, 2.8)}
      <div style="display:flex;flex-direction:column;gap:4px;font:800 9px Arial;color:#f4e8e0;align-items:center"><span style="background:#a8201a;padding:0 3px">AM</span><span style="width:7px;height:7px;border-radius:50%;background:${pm ? "#333" : coul};box-shadow:${pm ? "none" : "0 0 6px " + coul}"></span><span style="background:#a8201a;padding:0 3px">PM</span><span style="width:7px;height:7px;border-radius:50%;background:${pm ? coul : "#333"};box-shadow:${pm ? "0 0 6px " + coul : "none"}"></span></div>
      ${case_("HOUR", v[3], coul, 1.5)}<span style="color:${coul};font:900 26px Arial;text-shadow:0 0 6px ${coul};padding-bottom:6px">:</span>${case_("MIN", v[4], coul, 1.5)}</div>
      <div style="background:#141414;color:#e8e8e8;font:800 clamp(8px,1.8vw,13px) Arial;letter-spacing:.12em;padding:2px 10px">${titre}</div></div>`).join("") + `</div>`;
  // la destination s'efface, puis se tape case par case, avec un bip à chaque touche
  const cases = [...d.querySelectorAll(".ln")[0].querySelectorAll(".cv")]; cases.forEach(c => c.style.visibility = "hidden");
  let k = 0; const taper = () => { if (!d.isConnected || k >= cases.length) return; const c = cases[k++]; c.style.visibility = "visible"; sonBruit(.07, 2600, .25); setTimeout(taper, 230); };
  requestAnimationFrame(() => requestAnimationFrame(() => { d.style.opacity = 1; })); setTimeout(taper, 350); setTimeout(() => cases.forEach(c => c.style.visibility = "visible"), 2000); setTimeout(() => { d.style.opacity = 0; }, ms - 400); return d; }

// ---- la DeLorean (la machine à voyager dans le temps du premier film) : avant vers -z ----
// un petit décor de reflets (ciel, horizon, sol) pour que l'inox de la DeLorean brille comme du métal
// l'inox brossé : de fines rayures horizontales
function ouvrirPortes(car, f) { for (const { pv, sg } of car.userData.portes) pv.rotation.z = sg * f * 1.55; }
// ---- les traînées de feu, derrière les roues ----
function traineeFeu(lst, x, z, y = 0) {
  if (!texFlammes) texFlammes = flammesPixel();
  if (!FEU_M) FEU_M = { sp: texFlammes.map(t => new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, alphaTest: .05, fog: false })), geo: new THREE.PlaneGeometry(.34, .34), brule: new THREE.MeshBasicMaterial({ color: 0x140a04, transparent: true, opacity: .75, depthWrite: false }) };   // (partagés : rien à créer ni à compiler pendant la course)
  const sp = new THREE.Sprite(FEU_M.sp[0]);
  sp.center.set(.5, .05); sp.position.set(x, y + .01, z); sp.scale.set(.55, .9, 1); M.scene.add(sp);
  const brule = new THREE.Mesh(FEU_M.geo, FEU_M.brule);
  brule.rotation.x = -Math.PI / 2; brule.position.set(x, y + .015, z); M.scene.add(brule);
  lst.push({ sp, brule, ph: Math.floor(Math.random() * 8), h: .7 + Math.random() * .6, t0: performance.now() });
}
// les éclairs bleus autour de la voiture, juste avant le saut dans le temps

// ---- les cinématiques : M.cine = { t0, maj(t) } ; la caméra est tenue par la cinématique ----
function ajouterDoc(x, z) { const P = (M.ctx.pnjTrio && M.ctx.pnjTrio(ID_DOC)) || {};
  return ajouterAncien({ numero: DOC, nom: P.nom || "Doc", tenue: P.tenue || "doc", couleur: P.couleur || "#f1efe6", bas: P.bas || "#f1efe6", pieds: P.pieds || "#8a5a34", reglage: P.reglage || null, initiales: "",
    teteUrl: P.tete_v ? M.ctx.urlTetePNJ(P.tete_v, ID_DOC) : "images/bttf/doc-tete.webp", pnj: true, x, z }); }
const prenomMoi = () => esc((M.ctx.moiInfo && M.ctx.moiInfo().nom) || "Marty");
// 1. dans la cour d'honneur (rien qu'à soi) : la DeLorean arrive, Doc appelle, on monte, elle fonce, 88 miles à l'heure… disparue
function cineCour() {
  M.bulleDit = M.monte = M.vroum = M.vroum2 = M.compteur = 0; M.dz = M.dx = 0;
  const car = creerDelorean(); car.position.y = 0; M.scene.add(car); poser(car, 0, 30, 0); const feu = [];
  let fini = false; const fin = () => { if (fini || !M) return; fini = true; finCine(); voile("background:#fff;opacity:1", 1600); M.arriveeHV = true; changerLieu("hv1955", [-22, 16], -Math.PI / 2); };
  M.passerBtn = boutonPasser(fin);
  // (Hill Valley n'est plus préparé pendant la course : sa construction figeait l'image ~2 s quand la DeLorean sortait du préau ; elle se fait sous le flash blanc final)
  sonBruit(2.5, 220, .5);
  M.cine = { t0: performance.now(), feu, maj: (now) => { const tr = (now - M.cine.t0) / 1000, moi = M.gens.get(M.moiNum), cam = M.camera, PAUSE = 5.4;
    // une fois monté et les portes fermées : le compteur des circuits temporels ; la voiture ne démarre qu'après
    if (tr > 12.45 && !M.compteur) { M.compteur = 1; compteurTemps(PAUSE * 1000); }
    const t = tr < 12.45 ? tr : tr < 12.45 + PAUSE ? 12.45 : tr - PAUSE;
    let cx = 0, cz = 0;
    if (t < 5) { const u = lisse((t - .6) / 4.4), z = 30 - 25.5 * (1 - Math.pow(1 - Math.min(1, Math.max(0, (t - .6) / 4.4)), 2)), x = 2.8 * lisse((t - 2) / 2.6);
      rouler(car, Math.abs(z - car.position.z)); poser(car, x, z, 0); cx = x; cz = z;
      cam.position.lerp(new THREE.Vector3(-5.5, 3.2, 13.5), .08); cam.lookAt(x, .9, z); }
    else if (t < 12.5) { if (car.rotation.y) car.rotation.y *= .9;
      ouvrirPortes(car, t < 11.5 ? lisse((t - 5) / 1.2) : 1 - lisse((t - 11.5) / 1)); car.userData.portes.forEach(() => {});
      if (t > 6 && !M.gens.has(DOC)) ajouterDoc(1.0, 3.4);
      if (t > 6.3 && !M.bulleDit) { M.bulleDit = 1; bulle(`🧪 <b>Doc :</b> ${prenomMoi()} ! Vite, monte dans la DeLorean !<br>Il faut partir en <b>1955</b> !`, 4300); }
      if (t > 9 && moi && !M.monte) { M.monte = 1; moi.cible = new THREE.Vector3(1.6, 0, 4.6); moi.chemin = []; moi.rapide = true; }
      if (t > 10.3 && M.gens.has(DOC)) retirerAncien(DOC);
      if (t > 11 && moi) moi.g.visible = false;
      cam.position.lerp(new THREE.Vector3(-1.6, 2.4, 11), .05); cam.lookAt(1.6, 1.3, 5); }
    else if (t < 14.8) { const u = t - 12.5, z = 4.5 - .5 * 7.2 * u * u, x = 2.8 - 2.2 * lisse(u / 2); if (!M.vroum) { M.vroum = 1; sonBruit(2.3, 500, .9); musiqueBttf("sons/bttf/route.mp3", false, 900); }
      const dz = car.position.z - z; rouler(car, dz); poser(car, x, z, 0);
      if (u > .25) { M.dz = (M.dz || 0) + dz; while (M.dz > .22) { M.dz -= .22; for (const sg of [-1, 1]) traineeFeu(feu, x + sg * .9, z + 1.35 + M.dz); } }
      arcs(car, u > 1.1); car.position.y = 0;
      cam.position.lerp(new THREE.Vector3(-4, 1.5, 9.5), .06); cam.lookAt(x, .7, z - 2); }
    else { if (car.visible) { car.visible = false; eclairBlanc(1500); sonBruit(1.6, 260, 1); sonBruit(.25, 5000, .7); setTimeout(() => M && M.cine && logoCine(5600), 450); }
      cam.position.lerp(new THREE.Vector3(-1.2, 1.4, 9.5), .04); cam.lookAt(.7, .3, -8);
      if (t > 20.6) { voile("background:#fff;opacity:0;transition:opacity .7s", 1500).getBoundingClientRect(); setTimeout(fin, 700); M.cine.maj = () => {}; } }
    animerFeu(feu, now, 60000); } };
}
// la foudre qui tombe du ciel : un trait bleu-blanc en zigzag (et ses branches), qui scintille
function foudre(x, z, ms = 650) { if (!M) return; const m = new THREE.LineBasicMaterial({ color: 0xe6f6ff, transparent: true, opacity: 1, fog: false }), g = new THREE.Group(); M.scene.add(g);
  const trait = (x0, y0, z0, y1, ec) => { const pts = []; let px = x0, pz = z0; for (let y = y0; y > y1; y -= .6 + Math.random() * .9) { pts.push(new THREE.Vector3(px, y, pz)); px += (Math.random() - .5) * ec; pz += (Math.random() - .5) * ec; } pts.push(new THREE.Vector3(x, y1, z)); const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), m); l.frustumCulled = false; g.add(l); return pts; };
  const tronc = trait(x + 3, 26, z - 2, .1, 2.2); for (let k = 0; k < 4; k++) { const p = tronc[2 + Math.floor(Math.random() * (tronc.length - 4))]; trait(p.x, p.y, p.z, p.y - 4 - Math.random() * 5, 1.6); }
  const lum = new THREE.PointLight(0xbfe8ff, 60, 40, 1.4); lum.position.set(x, 3, z); g.add(lum);
  const t0 = performance.now(), tic = () => { if (!M) return; const k = (performance.now() - t0) / ms; if (k >= 1) { M.scene.remove(g); g.traverse(o => o.geometry && o.geometry.dispose()); return; }
    g.visible = Math.random() < .75; m.opacity = 1 - k * .6; lum.intensity = 60 * (1 - k); requestAnimationFrame(tic); }; tic(); }
// 2. à Hill Valley : la rue est calme… la foudre tombe, trois éclairs, et la DeLorean surgit en glissant jusqu'au trottoir, deux traînées de feu derrière les roues ; Doc et nous descendons
function cineHV() {
  M.bulleDit = M.monte = M.vroum = M.vroum2 = M.surgi = 0; M.dz = M.dx = 0;
  const car = M.L.delorean, X0 = -26, X1 = -6, T0 = 1.6, TD = 3.4; poser(car, X0, 16, -Math.PI / 2); ouvrirPortes(car, 0); car.visible = false; const feu = [];
  const moi0 = () => M.gens.get(M.moiNum);
  let fini = false; const fin = () => { if (fini || !M) return; fini = true; car.visible = true; poser(car, X1, 16, -Math.PI / 2); ouvrirPortes(car, 0); const moi = moi0(); if (moi) { moi.g.visible = true; moi.g.position.set(-5.2, .12, 13.9); }
    if (!M.gens.has(DOC)) ajouterDoc(-8.7, 15.6); finCine(); musiqueBttf("sons/bttf/sandman.mp3", true, 3000); };
  { const L0 = []; if (!texFlammes) texFlammes = flammesPixel(); traineeFeu(L0, X0, 16, -50); arcs(car, true); car.visible = true;   // (tout ce qui apparaîtra — la voiture, ses arcs, le feu — est préparé pour la carte graphique avant le départ : plus d'à-coup à l'éclair)
    try { M.rendu.compile(M.scene, M.camera); } catch (e) {} car.visible = false; arcs(car, false); for (const f of L0) { M.scene.remove(f.sp); M.scene.remove(f.brule); } }
  M.passerBtn = boutonPasser(fin);
  M.cine = { t0: performance.now(), feu, im: 0, maj: (now) => { { const gap = now - (M.cine.prec || now); M.cine.t0 += M.cine.im < 6 ? gap : Math.max(0, gap - 250); } M.cine.prec = now; M.cine.im++;   // (les premières images, lentes — la carte graphique prépare le lieu — ne comptent pas : la DeLorean surgit quand on la voit)
    const t = (now - M.cine.t0) / 1000, moi = moi0(), cam = M.camera, D = t - T0;
    if (moi && t < T0 + TD + 1.4) moi.g.visible = false;
    if (t < T0) { cam.position.set(-1.5, 1.7, 18.6); cam.lookAt(-20, 1, 16); }   // (la rue, calme, un instant)
    else if (D < TD) {
      if (!M.surgi) { M.surgi = 1; foudre(X0, 16, 700); eclairBlanc(450); sonBruit(1.4, 300, .9); sonBruit(.25, 5000, .7); car.visible = true;
        setTimeout(() => M && M.cine && eclairBlanc(260), 180); setTimeout(() => M && M.cine && eclairBlanc(260), 380); }   // (les trois éclairs)
      const u = Math.min(1, D / TD), x = X0 + (X1 - X0) * (1 - Math.pow(1 - u, 2.4)), dx = x - car.position.x; rouler(car, dx); poser(car, x, 16, -Math.PI / 2);
      if (dx > .005) { M.dx = (M.dx || 0) + dx; while (M.dx > .22) { M.dx -= .22; for (const sg of [-1, 1]) traineeFeu(feu, x - 1.35 - M.dx, 16 + sg * .9); } }
      arcs(car, D < 1.1); cam.position.lerp(new THREE.Vector3(-1.5, 1.7, 18.6), .08); cam.lookAt(x - 3, .7, 16); }
    else if (D < TD + 6.4) { const e = D - TD; arcs(car, false); ouvrirPortes(car, e < 4.9 ? lisse((e - .4) / 1.1) : 1 - lisse((e - 4.9) / 1));
      if (e > 1.4 && moi && !moi.g.visible) { moi.g.visible = true; moi.g.position.set(-5.2, .12, 13.9); }
      if (e > 1.6 && !M.gens.has(DOC)) ajouterDoc(-8.7, 15.6);
      if (e > 2 && !M.bulleDit) { M.bulleDit = 1; bulle(`🧪 <b>Doc :</b> Bienvenue à <b>Hill Valley</b>, ${prenomMoi()} ! Nous sommes le <b>14 juillet 1955</b>.<br>Balade-toi… et reviens à la DeLorean quand tu voudras rentrer !`, 5200); }
      cam.position.lerp(e < 1.4 ? new THREE.Vector3(-1.5, 2.2, 18.6) : new THREE.Vector3(-1.5, 2.5, 10.2), .05); cam.lookAt(e < 1.4 ? -14 : -6, e < 1.4 ? .4 : 1.2, e < 1.4 ? 16 : 15.2); }   // (d'abord les traînées de feu, puis nous)
    else fin();
    animerFeu(feu, now, 16000); } };
  M.feuHV = feu;
}
// 3. rentrer en 2026 : on remonte, la DeLorean file le long de la rue… et l'on se retrouve dans la vraie cour d'honneur
function cineRetour() {
  M.bulleDit = M.monte = M.vroum = M.vroum2 = 0; M.dz = M.dx = 0;
  const car = M.L.delorean, feu = M.feuHV || []; let fini = false;
  const fin = () => { if (fini || !M) return; fini = true; finCine(); voile("background:#fff;opacity:1", 1300); changerLieu("grande", [1.5, 6], 0); setTimeout(() => M && eclairBlanc(1400), 400); };
  musiqueBttf("sons/bttf/retour.mp3", false, 1200);
  M.passerBtn = boutonPasser(fin); bulle(`🧪 <b>Doc :</b> En route pour <b>1990</b> ! Accroche-toi, ${prenomMoi()} !`, 2600);
  M.cine = { t0: performance.now(), maj: (now) => { const t = (now - M.cine.t0) / 1000, moi = M.gens.get(M.moiNum), cam = M.camera;
    if (t < 3) { ouvrirPortes(car, t < 1.6 ? lisse(t / .8) : 1 - lisse((t - 1.6) / .9)); if (t > 1.2) { if (moi) moi.g.visible = false; if (M.gens.has(DOC)) retirerAncien(DOC); }
      cam.position.lerp(new THREE.Vector3(-1.5, 2.5, 10.2), .05); cam.lookAt(-6, 1, 16); }
    else if (t < 5.6) { const u = t - 3, x = -6 + .5 * 8 * u * u, dx = x - car.position.x; rouler(car, dx); poser(car, x, 16, -Math.PI / 2); if (!M.vroum2) { M.vroum2 = 1; sonBruit(2.2, 500, .9); }
      if (u > .2) { M.dx = (M.dx || 0) + dx; while (M.dx > .25) { M.dx -= .25; for (const sg of [-1, 1]) traineeFeu(feu, x - 1.35, 16 + sg * .9); } }
      arcs(car, u > 1.4); cam.position.lerp(new THREE.Vector3(-10, 1.8, 20.5), .06); cam.lookAt(x, .8, 16); }
    else { if (car.visible) { car.visible = false; eclairBlanc(1200); sonBruit(1.5, 260, 1); } if (t > 7) fin(); }
    animerFeu(feu, now, 60000); } };
}
// ---- Hill Valley, la place du palais de justice, 1955 ----
function toileBrique(base = "#8e4630", w = 256, h = 256) { return toile(w, h, (x) => { x.fillStyle = base; x.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 8) for (let i = -1; i < w / 24 + 1; i++) { const v = (Math.sin(i * 12.9 + y * 7.1) * .5 + .5) * 26 - 13; x.fillStyle = `rgba(${v > 0 ? "255,220,200" : "40,10,0"},${Math.abs(v) / 120})`; x.fillRect(i * 24 + (y / 8 % 2) * 12, y, 23, 7); }
  x.fillStyle = "rgba(225,215,200,.35)"; for (let y = 7; y < h; y += 8) x.fillRect(0, y, w, 1); for (let y = 0; y < h; y += 8) for (let i = 0; i < w / 24 + 1; i++) x.fillRect(i * 24 + (y / 8 % 2) * 12 - 1, y, 1, 8); }); }
function voiture50(couleur, toit = 0xf2efe6) {
  const g = new THREE.Group(), carr = new THREE.MeshStandardMaterial({ color: couleur, metalness: .45, roughness: .3 }), chrome = new THREE.MeshStandardMaterial({ color: 0xe6e9ec, metalness: .95, roughness: .15 });
  const vitre = new THREE.MeshStandardMaterial({ color: 0x1c2630, metalness: .5, roughness: .1 }), noir = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: .7 }), blanc = new THREE.MeshStandardMaterial({ color: 0xf5f5f0, roughness: .5 });
  const add = (geo, m, x, y, z) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; g.add(o); return o; };
  add(new THREE.BoxGeometry(1.9, .62, 5), carr, 0, .62, 0); add(new THREE.BoxGeometry(1.84, .12, 4.6), carr, 0, .98, .1);
  add(new THREE.BoxGeometry(1.62, .5, 2.3), vitre, 0, 1.28, .35); add(new THREE.BoxGeometry(1.66, .08, 2.15), new THREE.MeshStandardMaterial({ color: toit, metalness: .4, roughness: .3 }), 0, 1.56, .4);
  for (const z of [-2.53, 2.53]) add(new THREE.BoxGeometry(1.98, .16, .1), chrome, 0, .45, z);
  for (const sg of [-1, 1]) { add(new THREE.CylinderGeometry(.13, .13, .05, 14), new THREE.MeshBasicMaterial({ color: 0xfff6d8 }), sg * .68, .78, -2.52).rotation.x = Math.PI / 2;
    add(new THREE.BoxGeometry(.06, .3, .5), carr, sg * .9, 1.04, 2.2); add(new THREE.BoxGeometry(.03, .06, 4.6), chrome, sg * .96, .7, 0); }
  for (const [x, z] of [[-.88, -1.6], [.88, -1.6], [-.88, 1.6], [.88, 1.6]]) { const r = add(new THREE.CylinderGeometry(.36, .36, .26, 18), noir, x, .36, z); r.rotation.z = Math.PI / 2;
    const f = add(new THREE.TorusGeometry(.2, .06, 6, 18), blanc, x + Math.sign(x) * .135, .36, z); f.rotation.y = Math.PI / 2; }
  return g;
}
// une voiture des années 50 d'après une photo : ses deux flancs (la photo détourée), son capot, son coffre, son toit ; L : longueur, H : hauteur
const VOITURES50 = { belair: { L: 5, H: 1.85, coul: 0xc8251f, toit: 0xf2efe6, ceinture: .5 }, fairlane: { L: 5.1, H: 1.62, coul: 0xe39aa6, toit: 0xf2ecdf, ceinture: .5 },
  buick: { L: 5.4, H: 1.62, coul: 0x6aaedc, toit: 0x6aaedc, ceinture: .52, face: "buick" }, chevy50: { L: 5, H: 1.66, coul: 0xe2357a, toit: null, ceinture: .55 }, green: { L: 4.9, H: 1.72, coul: 0x56b07a, toit: 0x56b07a, ceinture: .55, face: "green", cote: false } };
let texV = {};
function voitureVraie(nom) {
  const V = VOITURES50[nom], g = new THREE.Group(), ld = new THREE.TextureLoader(), T = n => texV[n] || (texV[n] = (() => { const t = ld.load(`images/bttf/v-${n}.webp`); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; })());
  const W = 1.95, carr = new THREE.MeshStandardMaterial({ color: V.coul, metalness: .45, roughness: .3, envMap: reflets(), envMapIntensity: .5 }), chrome = new THREE.MeshStandardMaterial({ color: 0xe6e9ec, metalness: .95, roughness: .15, envMap: reflets() });
  const add = (geo, m, x, y, z) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; g.add(o); return o; };
  const hc = V.H * V.ceinture;
  // la caisse (un peu en retrait des flancs, pour qu'on ne la voie que d'en haut et de face)
  add(new THREE.BoxGeometry(W - .1, hc - .5, V.L * .9), carr, 0, .5 + (hc - .5) / 2, 0);
  if (V.toit != null) add(new THREE.BoxGeometry(W - .3, .06, V.L * .36), new THREE.MeshStandardMaterial({ color: V.toit, roughness: .5 }), 0, V.H * .93, V.L * .06);
  else { add(new THREE.BoxGeometry(W - .3, .08, .5), new THREE.MeshStandardMaterial({ color: 0xf2efe6, roughness: .8 }), 0, hc + .05, V.L * .2); }   // (la capote repliée)
  const pare = add(new THREE.PlaneGeometry(W - .3, V.H * .36), new THREE.MeshStandardMaterial({ color: 0x223040, metalness: .5, roughness: .1, transparent: true, opacity: .7 }), 0, hc + V.H * .17, -V.L * .13); pare.rotation.x = -.5;
  // les flancs : la photo détourée, l'avant vers -z
  if (V.cote !== false) { const t = T(nom + "-cote"), tm = t.clone(); tm.needsUpdate = true; tm.wrapS = THREE.RepeatWrapping; tm.repeat.x = -1;
    for (const [sg, map] of [[1, t], [-1, tm]]) { const f = new THREE.Mesh(new THREE.PlaneGeometry(V.L * 1.04, V.H), new THREE.MeshStandardMaterial({ map, alphaTest: .5, roughness: .35, metalness: .2, side: THREE.DoubleSide }));
      f.position.set(sg * W / 2, V.H / 2, 0); f.rotation.y = sg * Math.PI / 2; f.castShadow = true; g.add(f); } }
  else for (const sg of [-1, 1]) { add(new THREE.BoxGeometry(.04, hc - .25, V.L * .96), carr, sg * W / 2, .25 + (hc - .25) / 2, 0); add(new THREE.BoxGeometry(.05, .05, V.L * .9), chrome, sg * (W / 2 + .01), hc * .8, 0);
    for (const z of [-V.L * .3, V.L * .3]) { const r = add(new THREE.CylinderGeometry(.38, .38, .26, 20), new THREE.MeshStandardMaterial({ color: 0x111111 }), sg * (W / 2 - .1), .38, z); r.rotation.z = Math.PI / 2;
      const j = add(new THREE.CircleGeometry(.24, 18), chrome, sg * (W / 2 + .035), .38, z); j.rotation.y = sg * Math.PI / 2; } }
  // l'avant : la photo de la calandre, sinon les phares et le pare-chocs chromé
  if (V.face) { const f = add(new THREE.PlaneGeometry(W, hc), new THREE.MeshStandardMaterial({ map: T(V.face + "-face"), roughness: .35 }), 0, hc / 2 + .05, -V.L * .47 - .02); f.rotation.y = Math.PI; }
  else { add(new THREE.BoxGeometry(W - .12, .16, .12), chrome, 0, .5, -V.L * .45); for (const sg of [-1, 1]) add(new THREE.CylinderGeometry(.13, .13, .05, 14), new THREE.MeshBasicMaterial({ color: 0xfff6d8 }), sg * .68, hc - .12, -V.L * .45 - .06).rotation.x = Math.PI / 2;
    add(new THREE.BoxGeometry(1.1, .16, .04), chrome, 0, hc - .25, -V.L * .45 - .07); }
  add(new THREE.BoxGeometry(W - .12, .14, .1), chrome, 0, .5, V.L * .45);
  for (const sg of [-1, 1]) add(new THREE.BoxGeometry(.16, .12, .04), new THREE.MeshBasicMaterial({ color: 0xb01515 }), sg * .72, hc - .15, V.L * .45 + .06);
  return g;
}
// ---- peindre une surface de mur ----

// ---- le chantier d'un immeuble ----
// ce qu'on voit dans les vitrines
// ---- les éléments propres aux toits ----

// construit un immeuble à sa place : cx, cz le milieu de la façade au sol, r l'orientation (la façade regarde vers +z local)

// le cadran de l'horloge du palais, net et détaillé : arrêtée à 22 h 04, le soir de la foudre
// un griffon de pierre couché (comme ceux qui encadrent l'horloge)
// le palais de justice de Hill Valley : avant-corps sur un grand escalier, quatre colonnes, fronton et horloge, deux ailes de brique
// un environnement de reflets « en ville » (ciel, soleil, façades, trottoir, chaussée), préfiltré : c'est lui qui donne à la laque et aux chromes leurs vrais reflets
/* ===================== la Chevrolet Bel Air 1957 (cabriolet, hard-top blanc), modelée en 3D d'après les cinq vues =====================
   Repère : l'avant vers +x, la largeur sur z, le sol à y = 0. Longueur 5,1 m, largeur 1,9 m. */

/* ===================== le pick-up Ford F-1 (1948-1952), rouge, modelé en 3D d'après les six vues =====================
   Même repère que la Bel Air : l'avant vers +x, la largeur sur z, le sol à y = 0. Longueur 4,8 m. Le logo TEXACO peint sur les portières. */


/* ===================== Lou's Cafe, 1955 : la salle, ouverte (on y entre par la porte) =====================
   Repère de la façade : la vitrine en z = 0 (la rue vers +z), la salle vers −z, x en travers (la porte en x = 0), le sol à y = 0,125. */

/* --- les habitants de Hill Valley : ils se promènent ; les serveurs restent devant Lou's Cafe ; la bande à Biff rôde… et cogne --- */
const SUIT_HV = { 47: 31, 37: 46 };   // (George marche avec Marty, la fille à la jupe écossaise avec Lorraine)
const TETES_HV = { 46: "images/bttf/p-lorraine-tete.webp", 47: "images/bttf/p-george-tete.webp", 31: "images/bttf/p-marty-tete.webp", 32: "images/bttf/p-biff-tete.webp", 33: "images/bttf/p-match-tete.webp", 34: "images/bttf/p-troisd-tete.webp", 35: "images/bttf/p-skinhead-tete.webp",
  36: "images/bttf/p-pois-tete.webp", 37: "images/bttf/p-ecossaise-tete.webp", 38: "images/bttf/p-bretelles-tete.webp", 39: "images/bttf/p-serveur-tete.webp", 40: "images/bttf/p-serveuse-tete.webp", 41: "images/bttf/p-gilet-tete.webp", 42: "images/bttf/p-varsity-tete.webp", 43: "images/bttf/p-lou-tete.webp", 45: "images/bttf/p-pompiste-tete.webp", 44: "images/bttf/p-goldie-tete.webp" };
function pointLibreHV() { const Z = M.L.zone; for (let k = 0; k < 40; k++) { const x = Z[0] + 2 + Math.random() * (Z[1] - Z[0] - 4), z = Z[2] + 2 + Math.random() * (Z[3] - Z[2] - 4); if (M.L.limites(x, z) && !(M.L.dansLou && M.L.dansLou(x, z))) return [x, z]; } return [0, 10]; }
function animerHV(now) {
  if (M && M.volCafeEl && M.lieu !== "hv1955") reglageVolumeCafe(false);
  if (!M || M.lieu !== "hv1955" || !M.L || !M.L.hv) return;
  for (const p of M.L.polesHV || []) p.rotation.y = now / 450;   // (l'enseigne du barbier tourne)
  if (M.L.kingston) return;   // (Kingston Falls : ni les gens de 1955, ni leurs voitures)
  M.balade = false;   // (les habitants du café restent attablés ; leurs doubles se promènent dans la ville)
  if (LOU.jukeTex) LOU.jukeTex.offset.y = (now / 7000) % 1;   // (les colonnes du juke-box changent doucement de couleur)
  { const moiC = M.gens.get(M.moiNum), q = moiC && moiC.g.position, dedans = !!(q && M.L.dansLou && M.L.dansLou(q.x, q.z)) && !M.cine;
    if (dedans && !(musBttf && musBttf.cafe) && now > voyageFin) jukeboxCafe(M.cafeI || 0); else if (!dedans && musBttf && musBttf.cafe) musiqueBttf("sons/bttf/sandman.mp3", true, 1500);
    else if (!dedans && !M.cine && now > voyageFin && !musVoyage && (!musBttf || musBttf.paused || musBttf.ended) && now > (M.musHVT || 0)) { M.musHVT = now + 5000; musiqueBttf("sons/bttf/sandman.mp3", true); }   // (arrivé par la cabine, ou la musique s'est arrêtée : la ville reprend son air)
    reglageVolumeCafe(dedans);
    // vus du dehors (par la vitrine), il n'y a que Lou dans son café : les autres n'apparaissent qu'une fois entré (sinon on verrait leurs doubles en double)
    { const vu = !!(q && M.L.dansLou && M.L.dansLou(q.x, q.z)); for (const [id] of HABITANTS) { const p = id !== 43 && M.gens.get(-id); if (p) p.g.visible = vu; }
      const gd = M.gens.get(-144); if (gd) gd.g.visible = !vu; }   // (et dedans, Goldie balaie le café : son double qui balaie le trottoir n'est plus visible par la vitrine)
    // Biff embête Marty au comptoir (comme dans le film)
    if (dedans && !M.balade && now > (M.biffT || 0) && M.gens.has(-32)) { M.biffT = now + 7000 + Math.random() * 4000; const k = M.biffK = ((M.biffK ?? -1) + 1) % 4;
      dire(-32, ["Hé, McFly ! T'as quelque chose à me dire, mauviette ?", "Mauviette !", "Qu'est-ce que tu regardes, mauviette ? Allez, dégage de mon tabouret !", "T'as fait mes devoirs, McFly ? Mauviette !"][k]);
      if (k % 2 && M.gens.has(-33)) setTimeout(() => M && dire(-33, "Ha ha ha !"), 1600); } }
  const moi = M.gens.get(M.moiNum), mp = moi && moi.g.position;
  if (!M.hvInit) { M.hvInit = true; M.bandeT = 0;
    for (const [id, role] of HABITANTS) { const P = (M.ctx.pnjTrio && M.ctx.pnjTrio(id)) || {}, url = P.tete_v ? M.ctx.urlTetePNJ(P.tete_v, id) : TETES_HV[id]; if (!url) continue;
      const k = HABITANTS.findIndex(h => h[0] === id), [x, z] = role === "lou" ? (M.L.louPts ? (id === 43 ? M.L.louCafe : M.L.louPts[3]) : [M.L.louCafe[0] + .9, M.L.louCafe[1] + (id === 43 ? -2.6 : 2.6)]) : role === "serveur" ? (M.L.louPts ? M.L.louPts[id === 39 ? 0 : 2] : [M.L.louCafe[0] + .2, M.L.louCafe[1] + (id === 39 ? -1.1 : 1.1)]): M.L.siegesCafe && M.L.siegesCafe[id] ? M.L.siegesCafe[id] : role === "auto" ? M.L.siegesBiff[id] : role === "bande" ? [12 + (k % 2) * 1.2, -8 + (k % 3)] : pointLibreHV();
      const q = ajouterAncien({ numero: -id, nom: P.nom || ("habitant" + id), tenue: P.tenue, couleur: P.couleur, bas: P.bas, pieds: P.pieds, reglage: P.reglage || null, initiales: "", teteUrl: url, pnj: true, role, x, z, ...defautsHV(id, P), ...(id === 44 ? { balai: true, peau: "#4a2e20" } : {}), ...(role === "comptoir" || role === "table" || role === "lorraine" || role === "george" ? { assis: 1 } : {}), ...(id === 43 ? { essuie: true } : {}) });
      if (q && role === "auto") { q.info.auto = true; q.g.position.y = .2; if (q.g.children[0]) q.g.children[0].visible = false; }
      if (q) q.prochain = now + Math.random() * 4000; } }
    // les doubles des habitants du café, dans la ville : la bande en voiture, Marty et George ensemble, Lorraine et la fille à la jupe écossaise ensemble, les autres qui se promènent, Goldie qui balaie le trottoir
    if (!M.hvDoubles) { M.hvDoubles = true;
    for (const [id, role] of DOUBLES_HV) { const P = (M.ctx.pnjTrio && M.ctx.pnjTrio(id)) || {}, url = P.tete_v ? M.ctx.urlTetePNJ(P.tete_v, id) : TETES_HV[id]; if (!url) continue;
      const chef = role === "suit" && M.gens.get(-(SUIT_HV[id] + 100)), [x, z] = role === "balaie" && M.L.salleLou ? M.L.salleLou.vers(0, 1.3) : chef ? [chef.g.position.x + .8, chef.g.position.z + .3] : pointLibreHV();
      const q = ajouterAncien({ numero: -(id + 100), nom: P.nom || ("habitant" + id), tenue: P.tenue, couleur: P.couleur, bas: P.bas, pieds: P.pieds, reglage: P.reglage || null, initiales: "", teteUrl: url, pnj: true, role, x, z, ...defautsHV(id, P), ...(id === 44 ? { balai: true, peau: "#4a2e20" } : {}) });
      if (q && role === "voiture") { q.info.auto = true; if (q.g.children[0]) q.g.children[0].visible = false; } if (q) q.prochain = now + Math.random() * 3000; } }
  // le pompiste de la station Texaco : debout près des pompes, devant le pick-up ; il propose le plein quand on passe
  if (!M.hvPompiste) { M.hvPompiste = true; const P = (M.ctx.pnjTrio && M.ctx.pnjTrio(45)) || {}, url = P.tete_v ? M.ctx.urlTetePNJ(P.tete_v, 45) : TETES_HV[45];
    if (url) { const q = ajouterAncien({ numero: -45, nom: P.nom || "Le pompiste", tenue: P.tenue, couleur: P.couleur, bas: P.bas, pieds: P.pieds, reglage: P.reglage || null, initiales: "", teteUrl: url, pnj: true, role: "pompe", x: 24.7, z: 3.3, ...defautsHV(45, P) }); } }
  { const pp = M.gens.get(-45); if (pp) { pp.cible = null; pp.chemin = []; pp.g.position.set(24.7, pp.g.position.y, 3.3);
    if (mp && now > (M.pompeT || 0) && Math.hypot(mp.x - 24.7, mp.z - 3.3) < 3) { M.pompeT = now + 14000; const k = M.pompeK = ((M.pompeK ?? -1) + 1) % 4; dire(-45, ["Bonjour ! Le plein, monsieur ?", "Super ou ordinaire ? 19 cents et demi le gallon !", "Je vous vérifie l'huile et les pneus ?", "Belle journée, hein ? Repassez quand vous voulez !"][k]); } } }
  const bande = HABITANTS.filter(h => h[1] === "bande").map(h => M.gens.get(-h[0])).filter(Boolean), chef = bande[0];
  // les deux voitures qui font le tour de la place (elles s'arrêtent devant quelqu'un) ; Biff et sa bande dans le cabriolet
  { const dt = Math.min(.1, (now - (M.tourT || now)) / 1000); M.tourT = now; const C = M.L.circuit;
    for (const V of M.L.voituresTour || []) { const pt = C.getPointAt(V.s), tg = C.getTangentAt(V.s), r = Math.atan2(-tg.z, tg.x);
      let bloque = false; for (const q of M.gens.values()) { if (q.info.auto || Number.isInteger(q.info.assis) || q.info.assis === 1) continue; const ax = q.g.position.x - pt.x, az = q.g.position.z - pt.z, av = ax * tg.x + az * tg.z, lat = Math.abs(ax * tg.z - az * tg.x); if (av > 0 && av < 5 && lat < 1.5) bloque = true; }
      for (const W of M.L.voituresTour) if (W !== V) { const d = ((W.s - V.s) % 1 + 1) % 1 * M.L.circuitL; if (d < 7) bloque = true; }
      V.cur += ((bloque ? 0 : 5.2) - V.cur) * Math.min(1, dt * 2.5); V.s = (V.s + V.cur * dt / M.L.circuitL) % 1;
      V.v.position.set(pt.x, 0, pt.z); V.v.rotation.y = r;
      if (V.bande) { const pl = { 32: [-.05, -.4], 33: [-.05, .4], 35: [-.98, -.4], 34: [-.98, .4] };
        for (const id in pl) { const q = M.gens.get(-(+id + 100)); if (!q) continue; const [lx, lz] = pl[id]; q.cible = null; q.chemin = []; q.g.position.set(pt.x + Math.cos(r) * lx + Math.sin(r) * lz, .2, pt.z - Math.sin(r) * lx + Math.cos(r) * lz); }
        const lo = M.gens.get(-146); if (lo && now > (M.dragueT || 0) && lo.g.position.distanceTo(V.v.position) < 7) { M.dragueT = now + 9000; const k = M.dragueK = ((M.dragueK ?? -1) + 1) % 5;
          dire(-132, ["Hé, Lorraine ! Tu montes, poupée ?", "Allez, fais pas ta timide, je t'emmène faire un tour !", "Ouh là là, quelle allure ! Tu viens au bal avec moi ?", "Hé ! Je te parle, Lorraine !", "T'es toute seule ? Ça tombe bien, moi aussi !"][k]);
          setTimeout(() => M && M.gens.has(-146) && dire(-146, ["Laisse-moi tranquille, Biff !", "Non merci !", "Va-t'en, Biff !", "Jamais de la vie !", "Tu ne comprends pas quand on te dit non ?"][k]), 1900); } } } }
  // les doubles qui marchent
  for (const [id, role] of DOUBLES_HV) { const p = M.gens.get(-(id + 100)); if (!p || role === "voiture") continue;
    if (role === "balaie") { if (!p.cible && now > (p.prochain || 0) && M.L.salleLou) { const [a, b] = M.L.salleLou.vers(-3.6 + Math.random() * 7.2, 1.1 + Math.random() * .5); viser(p, a, b); p.prochain = now + 2500 + Math.random() * 3000; } continue; }
    if (role === "suit") { const chef = M.gens.get(-(SUIT_HV[id] + 100)); if (chef && now > (p.prochain || 0)) { p.prochain = now + 600; const d = Math.hypot(chef.g.position.x - p.g.position.x, chef.g.position.z - p.g.position.z); if (d > 1.2) { viser(p, chef.g.position.x + .8, chef.g.position.z + .3); p.rapide = d > 3; } } continue; }
    if (!p.cible && now > (p.prochain || 0)) { const [a, b] = pointLibreHV(); viser(p, a, b); p.prochain = now + (SUIT_HV[47] === id || SUIT_HV[37] === id ? 6000 : 2500) + Math.random() * 5000; } }
  for (const [id, role] of HABITANTS) { const p = M.gens.get(-id); if (!p) continue;
    if (role === "serveur" || (role === "lou" && id !== 43)) { if (!p.cible && now > (p.prochain || 0)) { const P2 = M.L.louPts; if (P2) { const [a, b] = P2[Math.floor(Math.random() * P2.length)]; viser(p, a + (Math.random() - .5) * .5, b + (Math.random() - .5) * .5); } p.prochain = now + 4000 + Math.random() * 7000; } continue; }
    if (role === "lou") { if (!p.cible && now > (p.prochain || 0)) { const SL = M.L.salleLou; if (SL) { const [a, b] = SL.vers(-2.95, -2.3 - Math.random() * 4.6); viser(p, a, b); } p.prochain = now + 5000 + Math.random() * 8000; } continue; }
    // la balade : toutes les 75 s, Lorraine sort se promener sur le trottoir (et Biff la suit dans sa décapotable), Marty et George font un tour sur la place
    const balade = M.balade;
    if (role === "lorraine" || role === "george" || (role === "comptoir" && id === 31)) { const q = M.L.siegesCafe && M.L.siegesCafe[id]; if (!q) continue;
      if (!balade) { if (p.info.assis !== 1) { p.info.assis = 1; p.cible = null; p.chemin = []; } p.g.position.set(q[0], role === "lorraine" ? -.06 : .12, q[1]); continue; }
      if (p.info.assis === 1) { p.info.assis = null; p.cible = null; p.chemin = [];
        if (role === "lorraine") { p.g.position.set(-17, .12, 22.35); p.sens = 1; } else p.g.position.set(id === 31 ? 4 : 5, .12, 10.2); }
      if (role === "lorraine") { if (!p.cible) { p.sens = p.sens > 0 ? -1 : 1; viser(p, p.sens * 17, 22.35); } }
      else if (id === 31) { if (!p.cible && now > (p.prochain || 0)) { const [a, b] = pointLibreHV(); viser(p, a, b); p.prochain = now + 3000 + Math.random() * 4000; } }
      else { const ma = M.gens.get(-31); if (ma && now > (p.prochain || 0)) { p.prochain = now + 700; const d = Math.hypot(ma.g.position.x - p.g.position.x, ma.g.position.z - p.g.position.z); if (d > 1.3) viser(p, ma.g.position.x + .9, ma.g.position.z + .3); } }
      continue; }
    if (role === "cafebande" && id === 32 && balade && M.L.cabrio) {   // Biff au volant, qui suit Lorraine en roulant au pas
      const car = M.L.cabrio, lo = M.gens.get(-46), r = car.rotation.y;
      if (lo) { const sens = lo.sens || 1, cible = lo.g.position.x - sens * 3.4, ry = sens > 0 ? 0 : Math.PI;
        const dt = Math.min(.1, (now - (M.carT || now)) / 1000); M.carT = now;
        car.position.z += (17.6 - car.position.z) * Math.min(1, dt * 1.5); const dx = cible - car.position.x; car.position.x += Math.sign(dx) * Math.min(Math.abs(dx), 4.2 * dt);
        let da = ry - car.rotation.y; da = Math.atan2(Math.sin(da), Math.cos(da)); car.rotation.y += da * Math.min(1, dt * 2);
        if (now > (M.dragueT || 0) && Math.abs(car.position.x - lo.g.position.x) < 6) { M.dragueT = now + 6500; const k = M.dragueK = ((M.dragueK ?? -1) + 1) % 5;
          dire(-32, ["Hé, Lorraine ! Tu montes, poupée ?", "Allez, fais pas ta timide, je t'emmène faire un tour !", "Ouh là là, quelle allure ! Tu viens au bal avec moi ?", "Hé ! Je te parle, Lorraine !", "T'es toute seule ? Ça tombe bien, moi aussi !"][k]);
          setTimeout(() => M && M.gens.has(-46) && dire(-46, ["Laisse-moi tranquille, Biff !", "Non merci !", "Va-t'en, Biff !", "Jamais de la vie !", "Tu ne comprends pas quand on te dit non ?"][k]), 1900); } }
      const [sx, sz] = [car.position.x + Math.cos(car.rotation.y) * -.05 + Math.sin(car.rotation.y) * -.4, car.position.z - Math.sin(car.rotation.y) * -.05 + Math.cos(car.rotation.y) * -.4];
      p.cible = null; p.chemin = []; p.g.position.set(sx, .2, sz); continue; }
    if (role === "cafebande" && id === 32 && M.L.cabrio && M.L.cabrioPos && M.L.cabrio.position.x !== M.L.cabrioPos[0]) { const [cx2, cz2, cr] = M.L.cabrioPos; M.L.cabrio.position.set(cx2, 0, cz2); M.L.cabrio.rotation.y = cr; }
    if (role === "comptoir" || role === "table" || role === "cafebande") { const q = M.L.siegesCafe && M.L.siegesCafe[id]; if (q) { p.cible = null; p.chemin = []; p.g.position.set(q[0], role === "table" ? -.06 : .12, q[1]); } continue; }
    if (role === "auto") { const [sx, sz] = M.L.siegesBiff[id]; p.cible = null; p.chemin = []; p.g.position.set(sx, .2, sz);
      if (id === 32 && mp && now > (M.bandeT || 0) && Math.hypot(mp.x - sx, mp.z - sz) < 4.5) { M.bandeT = now + 14000; bulle(["😏 <b>Biff :</b> Hé, " + prenomMoi() + " ! Tu veux faire un tour ? Ha ! Même pas en rêve !", "😤 <b>Biff :</b> Bas les pattes de ma bagnole !", "😏 <b>Biff :</b> T'as vu la classe ? Ça te change de ton vélo, hein ?"][Math.floor(Math.random() * 3)], 3000); }
      continue; }
    if (role === "promene") { if (!p.cible && now > (p.prochain || 0)) { const [x, z] = pointLibreHV(); viser(p, x, z); p.prochain = now + 3000 + Math.random() * 6000; } continue; }
    // la bande : le chef rôde, les autres le suivent de près
    if (p !== chef && chef && now > (p.prochain || 0) && !M.chasse) { p.prochain = now + 900; const i = bande.indexOf(p); viser(p, chef.g.position.x + (i % 2 ? 1.1 : -1.1), chef.g.position.z + (i > 1 ? 1.2 : .6)); }
    if (p === chef && !p.cible && now > (p.prochain || 0) && !M.chasse) { const [x, z] = pointLibreHV(); viser(p, x, z); p.prochain = now + 4000 + Math.random() * 5000; } }
  // s'ils te repèrent (à moins de 9 m, loin de Doc et de la DeLorean), ils te foncent dessus
  // la poussée : on recule de deux mètres en titubant
  if (M.pousse && mp) { const u = (now - M.pousse.t0) / 450; if (u >= 1) M.pousse = null; else { const v = (1 - u) * .11, nx = mp.x + M.pousse.dx * v, nz = mp.z + M.pousse.dz * v; if (M.L.limites(nx, nz)) { mp.x = nx; mp.z = nz; } moi.corps && (moi.corps.material.rotation = -Math.sin(u * Math.PI) * .25 * Math.sign(M.pousse.dx || 1)); } }
  if (!chef || !mp || M.cine) return;
  const prèsDoc = M.L.posDelorean && Math.hypot(mp.x - M.L.posDelorean[0], mp.z - M.L.posDelorean[1]) < 5;
  const d = Math.hypot(chef.g.position.x - mp.x, chef.g.position.z - mp.z);
  if (now > M.bandeT && !prèsDoc && d < 9) { if (!M.chasse) { M.chasse = true; bulle(`😠 <b>Biff :</b> Hé, ${prenomMoi()} ! Qu'est-ce que tu fiches dans MA ville ?`, 2600); }
    if (now > (M.chasseT || 0)) { M.chasseT = now + 500; bande.forEach((q, i) => { viser(q, mp.x + (i % 2 ? .7 : -.7), mp.z + (i > 1 ? .7 : -.4)); q.rapide = true; }); }
    const q0 = bande.find(q => Math.hypot(q.g.position.x - mp.x, q.g.position.z - mp.z) < 1.1);
    if (q0) {   // il t'attrape : Biff te pousse, et la bande te laisse (pour cette fois)
      M.bandeT = now + 9000; M.chasse = false; bande.forEach(q => { q.cible = null; q.chemin = []; q.rapide = false; });
      const dx = mp.x - q0.g.position.x, dz = mp.z - q0.g.position.z, n = Math.hypot(dx, dz) || 1;
      moi.cible = null; moi.chemin = []; M.pousse = { dx: dx / n, dz: dz / n, t0: now };
      sonBruit(.18, 700, .7); bulle(`😤 <b>Biff :</b> Dégage, ${prenomMoi()} ! Et que je ne te revoie plus traîner par ici !`, 2800); } }
  else if (M.chasse && (d > 14 || prèsDoc)) { M.chasse = false; bande.forEach(q => { q.rapide = false; q.cible = null; q.chemin = []; }); }
}
function defautsHV(id, P) { const D = { 46: ["lorraine", "#8a86c8", null, "#f4f2ec"], 47: ["george", "#b4aaa4", "#7a7c80", "#2a1a10"], 31: ["marty", "#5f86b8", "#4a76ad", "#e2ddd2"], 32: ["biff", "#c8201c", "#1d2433", "#1a1a1a"], 33: ["skinhead", "#151517", "#8a7a5a", "#1a1a1a"], 34: ["troisd", "#e2e0d8", "#3a3a3c", "#1a1a1a"], 35: ["match", "#d9a520", "#2a2a2e", "#1a1a1a"],
    43: ["lou", "#ece4d2", "#3a3a3c", "#1a1a1a"], 44: ["lou", "#e8e2d4", "#3a3a3c", "#1a1a1a"], 45: ["pompiste", "#f2f0ea", "#f0eee6", "#4a2c1a"],
    36: ["pois", "#e0455c", null, "#f2f0ea"], 37: ["ecossaise", "#46543a", null, "#c9932a"], 38: ["bretelles", "#f4f2ec", "#6a5444", "#4a2414"], 39: ["serveur", "#f4f2ec", "#f2f2ee", "#f2f2ee"], 40: ["serveuse", "#c8202a", null, "#c8102e"], 41: ["gilet", "#f2f0ea", "#2f3236", "#3a2414"], 42: ["varsity", "#f2f2ee", "#3c5a86", "#e8e8e8"] }[id];
  return { tenue: P.tenue || D[0], couleur: P.couleur || D[1], bas: P.tenue ? P.bas : D[2], pieds: P.pieds || D[3] }; }

({ animerHV, cineRetour, cineCour, cineHV, ajouterDoc });
