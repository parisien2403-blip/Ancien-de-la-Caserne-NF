/* LES GOONIES — la borne d'arcade du bar (Caserne de la Nouvelle France).
   Un seul joueur ; on choisit l'un des 4 ados (Mikey, Choco, Data, Bagou) ; quand il est épuisé, on en prend un autre parmi ceux qui restent.
   Six niveaux qui suivent le film, des scènes d'histoire avec les portraits entre les niveaux.
   Coordonnées : celles des images de décor (768 px de haut) ; la caméra montre une fenêtre de l'image, agrandie à l'écran (960 × 540). */
"use strict";
(() => {
const C = document.getElementById("jeu"), X = C.getContext("2d");
const LW = 960, LH = 540;
const PARAM = new URLSearchParams(location.search), DEBUG = PARAM.has("debug");
X.imageSmoothingEnabled = false;

// ------------------------------------------------------------------ l'écran : agrandi au mieux, sans déformer
function ajuste() { const s = Math.min(innerWidth / LW, innerHeight / LH); C.style.width = Math.floor(LW * s) + "px"; C.style.height = Math.floor(LH * s) + "px"; }
addEventListener("resize", ajuste); ajuste();
if (matchMedia("(pointer: coarse)").matches) document.body.classList.add("touch");

// ------------------------------------------------------------------ chargement
const IMG = {}, META = {}, VI = 17;   // (VI : la version des images, pour ne pas garder les anciennes en cache)
const charge = (n, src) => new Promise(r => { const i = new Image(); i.onload = () => { IMG[n] = i; r(); }; i.onerror = () => r(); i.src = src; });
const LISTE = { niv1: "niv1.jpg", niv2c: "niv2c.jpg", niv3: "niv3.jpg", niv4a: "niv4a.jpg", niv4b: "niv4b.jpg", niv5: "niv5.jpg", niv6a: "niv6a.jpg", niv6b: "niv6b.jpg",
  ville: "ville.jpg", falaise: "falaise.jpg", logo: "logo.png", sprites: "sprites.png", sprites2: "sprites2.png", sprites3: "sprites3.png", sprites4: "sprites4.png", decor: "decor.png", golf: "scene-golf.png", ...Object.fromEntries(["mikey", "brand", "bagou", "choco", "data", "sloth", "mama", "jake", "francis"].map(n => ["photo_" + n, "photos/" + n + ".png"])), carte: "scene-carte.png", fratelli: "scene-fratelli.png", carte2: "scene-carte2.png", carteTresor: "carte-tresor.png", voitureF: "voiture-fratelli.png", ...Object.fromEntries(["mikey", "bagou", "choco", "data"].map(n => ["ado_" + n, "ados/" + n + ".png"])), ecran: "borne-ecran.jpg" };
let pret = false;
Promise.all([...Object.entries(LISTE).map(([n, f]) => charge(n, "img/" + f + "?v=" + VI)),
  fetch("img/sprites.json?v=" + VI).then(r => r.json()).then(j => { for (const k in j) if (!["mikey", "choco", "data", "bagou"].includes(k)) META[k] = { ...j[k], img: "sprites" }; }),   /* (les 4 ados : la nouvelle planche, sprites4) */
  fetch("img/sprites2.json?v=" + VI).then(r => r.json()).then(j => { for (const k in j) if (k !== "voiture") META[k] = { ...j[k], img: "sprites2" }; })   /* (la voiture : la nouvelle, dans sprites3) */, fetch("img/sprites3.json?v=" + VI).then(r => r.json()).then(j => { for (const k in j) META[k] = { ...j[k], img: "sprites3" }; }), fetch("img/sprites4.json?v=" + VI).then(r => r.json()).then(j => { for (const k in j) META[k] = { ...j[k], img: "sprites4", sc: 1.8 / 3 }; }), fetch("img/decor.json?v=" + VI).then(r => r.json()).then(j => { DEC = j; })]).then(() => { pret = true; demarre(); });

// ------------------------------------------------------------------ les commandes : clavier, manette, tactile
const T = {}, TP = {}, TOUCHES = { ArrowLeft: "gauche", KeyA: "gauche", KeyQ: "gauche", ArrowRight: "droite", KeyD: "droite", ArrowUp: "haut", KeyW: "haut", KeyZ: "haut", ArrowDown: "bas", KeyS: "bas",
  Space: "saut", KeyK: "saut", KeyJ: "tir", KeyX: "tir", KeyL: "tir", ControlLeft: "tir", Enter: "start", Escape: "retour", KeyP: "start" };
addEventListener("keydown", e => { const t = TOUCHES[e.code]; if (!t) return; e.preventDefault(); if (!e.repeat) T["l" + t] = true; T["c" + t] = true; if (t === "retour") quitter(); });
addEventListener("keyup", e => { const t = TOUCHES[e.code]; if (t) T["c" + t] = false; });
addEventListener("blur", () => { for (const k in T) T[k] = false; });
for (const b of document.querySelectorAll("[data-t]")) {
  const t = b.dataset.t, on = e => { e.preventDefault(); T["t" + t] = true; T["l" + t] = true; son("bip0"); }, off = e => { e.preventDefault(); T["t" + t] = false; };
  b.addEventListener("pointerdown", on); b.addEventListener("pointerup", off); b.addEventListener("pointercancel", off); b.addEventListener("pointerleave", off); }
C.addEventListener("pointerdown", () => { T.tclic = true; setTimeout(() => T.tclic = false, 120); });
let quitT = 0;
function lireManette() {
  const pads = navigator.getGamepads ? [...navigator.getGamepads()].filter(g => g && g.connected) : [];
  const g = pads.find(q => q.mapping === "standard" && q.buttons.length >= 12) || pads[0];
  const m = {};
  if (g) { const b = i => !!(g.buttons[i] && (g.buttons[i].pressed || g.buttons[i].value > .5)), ax = (g.axes[0] || 0), ay = (g.axes[1] || 0);
    m.gauche = b(14) || ax < -.45; m.droite = b(15) || ax > .45; m.haut = b(12) || ay < -.55; m.bas = b(13) || ay > .55;
    m.saut = b(0); m.tir = b(2) || b(1) || b(7) || b(5); m.start = b(9); m.retour = b(8);
    if (b(8) && b(9)) { quitT += 1 / 60; if (quitT > 1) { quitT = 0; quitter(); } } else quitT = 0; }
  return m; }
const ACT = ["gauche", "droite", "haut", "bas", "saut", "tir", "start", "retour"];
const IN = {}, PREC = {};
function lireEntrees() { const m = lireManette();
  for (const a of ACT) { const l = !!T["l" + a]; T["l" + a] = false; const v = !!(T["c" + a] || T["t" + a] || m[a]); IN[a] = v || l; IN[a + "P"] = (v && !PREC[a]) || l; PREC[a] = v; }
  IN.ok = IN.sautP || IN.tirP || IN.startP || (T.tclic && !PREC.clic); PREC.clic = T.tclic;
  if (musVoulue && MUS && MUS.paused && ACT.some(k => IN[k + "P"])) MUS.play().catch(() => {}); }   // (à la manette aussi)
function quitter() { try { parent.postMessage({ goonies: "fermer" }, "*"); } catch (e) {} }
document.getElementById("fermer").onclick = quitter;

// ------------------------------------------------------------------ les sons (petits bips façon borne ; les musiques viendront plus tard)
let AC = null;
function son(n) { try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === "suspended") AC.resume();
  const S = { saut: [[520, 880, .12, "square", .06]], tir: [[900, 300, .08, "square", .05]], piece: [[988, 988, .05, "square", .05], [1319, 1319, .12, "square", .05, .05]], coup: [[200, 60, .12, "sawtooth", .08]],
    aie: [[300, 120, .25, "sawtooth", .09]], mort: [[400, 50, .6, "triangle", .12]], boss: [[110, 55, .5, "sawtooth", .12]], bip: [[660, 660, .06, "square", .05]], bip0: [[440, 440, .03, "square", .02]],
    note0: [[523, 523, .35, "triangle", .14]], note1: [[659, 659, .35, "triangle", .14]], note2: [[784, 784, .35, "triangle", .14]], note3: [[1047, 1047, .35, "triangle", .14]], faux: [[160, 80, .5, "sawtooth", .12]],
    klaxon: [[392, 392, .25, "square", .07], [330, 330, .3, "square", .07, .28]],
    gagne: [[523, 523, .12, "square", .06], [659, 659, .12, "square", .06, .12], [784, 784, .12, "square", .06, .24], [1047, 1047, .3, "square", .06, .36]] }[n];
  if (!S) return; const t0 = AC.currentTime;
  for (const [f0, f1, d, type, v, dt = 0] of S) { const o = AC.createOscillator(), g = AC.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t0 + dt); o.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t0 + dt + d);
    g.gain.setValueAtTime(v, t0 + dt); g.gain.exponentialRampToValueAtTime(.0001, t0 + dt + d); o.connect(g).connect(AC.destination); o.start(t0 + dt); o.stop(t0 + dt + d + .02); } } catch (e) {} }

// ------------------------------------------------------------------ dessin des sprites
function spr(nom, f, x, y, flip = false, sc = 1, alpha = 1) {
  const m = META[nom]; if (!m) return; const fr = m.f[((f % m.f.length) + m.f.length) % m.f.length], im = IMG[m.img]; if (!im) return;
  const Z = cam.z * sc * (m.sc || 1), w = fr[2] * Z, h = fr[3] * Z, ax = m.a[0] * Z, ay = m.a[1] * Z, sx = (x - cam.x) * cam.z, sy = (y - cam.y) * cam.z;
  X.save(); X.globalAlpha = alpha; X.translate(Math.round(sx), Math.round(sy)); if (flip) X.scale(-1, 1);
  X.drawImage(im, fr[0], fr[1], fr[2], fr[3], -ax, -ay, w, h); X.restore(); }
function sprEcran(nom, f, x, y, sc = 1, flip = false) { const m = META[nom]; if (!m) return; const fr = m.f[f % m.f.length], im = IMG[m.img];
  X.save(); X.translate(x, y); if (flip) X.scale(-1, 1); X.drawImage(im, fr[0], fr[1], fr[2], fr[3], -fr[2] * sc / 2, -fr[3] * sc / 2, fr[2] * sc, fr[3] * sc); X.restore(); }
const taille = nom => META[nom] ? META[nom].f[0] : [0, 0, 0, 0];
function texte(t, x, y, o = {}) { X.save(); X.font = `${o.gras === false ? "" : "bold "}${o.t || 20}px "Courier New", monospace`; X.textAlign = o.a || "left"; X.textBaseline = "alphabetic";
  X.lineWidth = o.ep || 4; X.strokeStyle = o.bord || "#000"; X.lineJoin = "round"; X.strokeText(t, x, y); X.fillStyle = o.c || "#fff"; X.fillText(t, x, y); X.restore(); }
function medaillon(qui, x, y, t) {   // la photo du personnage (façon borne d'arcade) ; à défaut, son visage dessiné
  const ph = IMG["photo_" + qui]; if (ph) { X.drawImage(ph, x, y, t, t); return; }
  const m = META["portrait_" + qui]; if (m) { const fr = m.f[0]; X.drawImage(IMG[m.img], fr[0], fr[1], fr[2], fr[3], x, y, t, t); } }
/* les 4 ados (images fournies, de face) : animés en découpant l'image — le haut du corps qui balance, les deux jambes qui avancent tour à tour */
const HANCHE = { mikey: .75, bagou: .56, choco: .6, data: .6 };
function adoDessin(id, pose, ph, sx, sy, haut, flip = false, alpha = 1) {   // sx, sy : les pieds, à l'écran ; haut : la taille à l'écran
  const im = IMG["ado_" + id]; if (!im) return; const k = haut / im.height, W = im.width * k, H = haut, hy = Math.round(im.height * HANCHE[id]), cx = im.width / 2;
  X.save(); X.globalAlpha = alpha; X.translate(Math.round(sx), Math.round(sy)); if (flip) X.scale(-1, 1);
  const piece = (x0, y0, w, h, dx, dy, sh = 0) => { X.save(); X.translate(dx, dy); if (sh) X.transform(1, 0, sh, 1, 0, 0); X.drawImage(im, x0, y0, w, h, (x0 - cx) * k, (y0 - im.height) * k, w * k, h * k); X.restore(); };
  // les jambes en deux morceaux, cuisse et mollet, qui plient au genou ; la hanche se place pour que le pied le plus bas touche le sol
  const ky = Math.round(hy + (im.height - hy) * .5), Lt = (ky - hy) * k, Ls = (im.height - ky) * k;
  const corps = (j1, j2, pench = 0, dyT = 0) => {   // j : [angle de la cuisse, pliure du genou] (négatif : vers l'avant)
    const bas = ([a, b]) => Lt * Math.cos(a) + Ls * Math.cos(a + b), hipY = -Math.max(bas(j1), bas(j2));
    const jambe = (x0, w, [a, b], dim) => { const px = (x0 + w / 2 - cx) * k; X.save(); if (dim) X.globalAlpha = alpha * .88; X.translate(px, hipY); X.rotate(a);
      X.drawImage(im, x0, hy, w, ky - hy + 1, (x0 - cx) * k - px, 0, w * k, (ky - hy + 1) * k); X.translate(0, Lt); X.rotate(b);
      X.drawImage(im, x0, ky, w, im.height - ky, (x0 - cx) * k - px, 0, w * k, (im.height - ky) * k); X.restore(); };
    jambe(0, cx, j1, true); jambe(cx, im.width - cx, j2, false);
    X.save(); X.translate(0, hipY + (im.height - hy) * k + dyT); X.rotate(pench); X.drawImage(im, 0, 0, im.width, hy + 3, -cx * k, -im.height * k, im.width * k, (hy + 3) * k); X.restore(); };
  if (pose === "course") { const A = .55, s1 = Math.sin(ph), c1 = Math.cos(ph);   // (la jambe de gauche reste derrière, celle de droite devant : elles ne se croisent pas)
    corps([A * (.5 + .5 * s1), .6 * Math.max(0, c1)], [-A * (.5 - .5 * s1), .6 * Math.max(0, -c1)], .06); }
  else if (pose === "saut") corps([-.7, 1.3], [-.2, .8]);
  else if (pose === "baisse") corps([-1.15, 2.1], [-1.0, 1.9], .1);
  else if (pose === "tir") { X.rotate(.05); piece(0, 0, im.width, im.height, 0, 0); }
  else if (pose === "mal") { X.rotate(-.2); piece(0, 0, im.width, im.height, 0, 0); X.globalCompositeOperation = "source-atop"; X.fillStyle = "rgba(255,40,40,.35)"; X.fillRect(-W, -H, W * 2, H); }
  else if (pose === "echelle") { const s = Math.sin(ph); piece(0, 0, im.width, im.height, s * 2 * k * 2, Math.abs(s) * -3 * k * 2); }
  else { const r = 1 + Math.sin(ph) * .012; X.scale(1, r); piece(0, 0, im.width, im.height, 0, 0); }
  X.restore(); }
const TAILLE_ADO = 112;   // (en unités du décor)
function boite(x, y, w, h, a = .78) { X.save(); X.globalAlpha = a; X.fillStyle = "#07040c"; X.fillRect(x, y, w, h); X.globalAlpha = 1; X.strokeStyle = "#f3c64a"; X.lineWidth = 3; X.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3); X.restore(); }

// ------------------------------------------------------------------ les 4 ados
const ADOS = [
  { id: "mikey", nom: "MIKEY", arme: "Lance-pierre", tirD: .3, desc: "Le chef de la bande. Son lance-pierre tire vite et loin." },
  { id: "choco", nom: "CHOCO", arme: "Barres chocolatées", tirD: .45, desc: "Lance ses barres en cloche. Lent, mais ça fait mal !" },
  { id: "data", nom: "DATA", arme: "Gant de boxe télescopique", tirD: .55, desc: "Le gant jaillit au bout d'un ressort et cogne tout sur son passage." },
  { id: "bagou", nom: "BAGOU", arme: "Peignes", tirD: .24, desc: "Le plus bavard… et le plus rapide à lancer ses peignes." }];
const parId = id => ADOS.find(a => a.id === id);

// ------------------------------------------------------------------ l'histoire (portraits : mikey, brand, bagou, choco, data, sloth, mama, jake, francis)
const H = {
  intro: { fond: "ville", l: [
    [null, "Astoria, Oregon, 1985. Les Goon Docks vont être rasés pour construire un terrain de golf.", "golf"],
    ["mikey", "Demain, on doit tous déménager… C'est notre dernier week-end ensemble.", "golf"],
    ["bagou", "À moins de trouver un miracle d'ici là.", "golf"],
    ["choco", "Moi, un miracle en forme de pizza, ça m'irait très bien.", "golf"],
    ["data", "Le grenier de ton père est plein de vieilleries du musée, Mikey. On y trouvera peut-être quelque chose !", "golf"],
    ["mikey", "Allons-y. Les Goonies ne disent jamais mourir !", "golf"]] },
  apres1: { fond: "niv1", mus: "willy", l: [   // (le morceau commence à 1 min 03 : le fichier est coupé)
    ["mikey", "Une carte ! Regardez… La carte de Willy le Borgne !", "carte"],
    ["data", "Willy le Borgne ? Le pirate de la légende ?", "carte"],
    ["mikey", "Mon père me l'a racontée cent fois. Il y a plus de trois cents ans, Willy et ses pirates pillaient tous les navires du roi d'Angleterre.", "carte"],
    ["mikey", "La flotte du roi l'a poursuivi jusqu'ici, sur la côte de l'Oregon. Il a caché son bateau, l'Inferno, et tout son trésor au fond d'une grotte.", "carte"],
    ["mikey", "Mais les soldats ont fait sauter l'entrée. Willy et son équipage sont restés enfermés dedans… pour toujours.", "carte"],
    ["choco", "Pour toujours ? Genre… ils sont encore là-dessous ?!", "carte"],
    ["mikey", "Avant de mourir, Willy a semé des pièges partout pour protéger son trésor. Personne ne l'a jamais retrouvé.", "carte"],
    ["mikey", "Et cette carte montre le chemin. Si on trouve le trésor, nos familles pourront garder leurs maisons !", "carte2"],
    ["brand", "Mikey ! Maman a dit que tu ne sortais pas ! Et vous allez vous faire tuer avec vos histoires de pirates.", "carte2"],
    ["bagou", "Trop tard, Brand. On a une carte… et un trésor à trouver !", "carte2"],
    ["mikey", "En selle, tout le monde ! Direction le vieux phare !", "carte2"]] },
  avant2: { fond: "ville", mus: "fratelli", l: [
    [null, "Au même moment, à la prison du comté, Jake Fratelli s'évade… Sa famille l'attend dans une vieille voiture noire.", "fratelli"],
    ["jake", "Merci pour l'évasion, Maman ! C'était pas trop tôt.", "fratelli"],
    ["mama", "Arrête de pleurnicher et monte ! Francis, démarre !", "fratelli"],
    ["francis", "Maman… regarde, ces gamins à vélo. Ils nous ont vus !", "fratelli"],
    ["mama", "Alors suis-les ! On ne laisse aucun témoin !", "fratelli"],
    ["mikey", "Les Fratelli ! Pédalez, vite !"]] },
  apres2: { fond: "falaise", l: [
    ["bagou", "Le vieux restaurant du phare… La carte dit qu'on doit passer par là."],
    ["choco", "Il y a une voiture noire garée devant. Ça sent mauvais."],
    ["mikey", "On entre par la cave. Doucement…"]] },
  avant3: { fond: "niv3", l: [
    ["mama", "Qu'est-ce que ces mioches fichent chez moi ? Francis ! Occupe-toi d'eux !"],
    ["francis", "Avec plaisir, Maman…"]] },
  apres3: { fond: "niv3", l: [
    ["francis", "Maman ! Ils m'ont eu !"],
    ["data", "Un passage secret, derrière la cheminée ! Vite !"],
    [null, "Pendant ce temps, Choco découvre Sloth, enchaîné au sous-sol…"],
    ["sloth", "Hey ! You guys !"],
    ["choco", "Tiens, je te donne ma barre chocolatée. On est copains, maintenant !"]] },
  avant4: { fond: "niv4a", l: [
    ["data", "Regardez ce squelette… C'est Chester Copperpot, l'explorateur disparu !"],
    ["mikey", "Il cherchait le trésor, lui aussi. On ne s'arrête pas là."]] },
  boss4: { fond: "niv4b", l: [
    ["jake", "Vous allez m'entendre chanter, les morveux !"]] },
  apres4: { fond: "niv4b", l: [
    ["bagou", "On est sous le puits à vœux ! Toutes ces pièces… ce sont les vœux des gens !"],
    ["mikey", "Alors on n'y touche pas. Ce sont des vœux. On continue."]] },
  avant5: { fond: "niv5", l: [
    ["data", "Un orgue… en os !"],
    ["mikey", "La carte dit : « Joue la bonne mélodie, sinon le sol s'effondre. »"],
    ["choco", "Euh… quelqu'un a pris des cours de piano ?"]] },
  apres5: { fond: "niv5", l: [
    ["mikey", "Le passage s'ouvre ! J'entends la mer…"]] },
  avant6: { fond: "niv6a", l: [
    ["choco", "Un vrai bateau pirate… l'Inferno !"],
    ["mikey", "Le trésor de Willy le Borgne ! On l'a trouvé !"],
    ["mama", "Pas si vite, les mioches ! Ce trésor est à nous !"]] },
  sloth6: { fond: "niv6a", l: [
    ["sloth", "HEY ! YOU GUYS !"],
    ["mama", "Sloth ?! Lâche-moi, espèce de… !"]] },
  apres6: { fond: "niv6a", l: [
    ["sloth", "Mama méchante ! Sloth aime Choco !"],
    ["mikey", "Le bateau bouge… La grotte s'effondre ! Tous dehors !"]] },
  fin: { fond: "niv6b", l: [
    [null, "Les Goonies s'échappent par la grotte. L'Inferno prend la mer, toutes voiles dehors…"],
    ["mikey", "Le bateau s'en va… avec le trésor."],
    ["choco", "Pas tout ! Mikey, regarde dans ton sac !"],
    ["mikey", "Les billes de Willy… des pierres précieuses ! On a de quoi sauver les Goon Docks !"],
    ["data", "Les Goonies…"],
    ["bagou", "… ne disent jamais mourir !"]] } };

// ------------------------------------------------------------------ les niveaux
// p(x0, x1, y0, y1 = y0, dur) : une plateforme (on la traverse par dessous ; « dur » : le sol, on ne la traverse pas en descendant)
const p = (x0, x1, y0, y1 = y0, dur = 0) => ({ x0, x1, y0, y1, dur });
const ech = (x0, x1, y0, y1) => ({ x0, x1, y0, y1 });
const arc = (x0, y0, n, dx = 46, h = 50) => Array.from({ length: n }, (_, k) => [x0 + k * dx, y0 - Math.sin(k / Math.max(1, n - 1) * Math.PI) * h]);
const ligne = (x0, y0, n, dx = 46) => Array.from({ length: n }, (_, k) => [x0 + k * dx, y0]);
const NIVEAUX = [
  { nom: "LE GRENIER", musique: "niv1", but: "Trouve la carte au trésor !", avant: "intro", apres: "apres1", scenes: [() => ({
    img: "niv1", vh: 432, depart: [70, 700], fin: { type: "objet", x: 1300, y: 368 },
    sol: [p(0, 1408, 700, 700, 1), p(280, 475, 605), p(290, 455, 528), p(300, 380, 466), p(315, 372, 420), p(450, 632, 578), p(550, 832, 441), p(0, 318, 362), p(0, 170, 268), p(155, 205, 312), p(1072, 1405, 368), p(905, 1128, 576), p(655, 745, 570), p(678, 745, 527)],
    ech: [ech(1142, 1194, 368, 700), ech(200, 236, 362, 700)],
    pieces: [...arc(520, 660, 5), ...ligne(600, 400, 5), ...arc(330, 380, 3), ...ligne(30, 330, 5), ...ligne(940, 540, 4), ...ligne(1110, 330, 4), ...arc(760, 660, 4)],
    pizzas: [[90, 230]],
    ennemis: [{ t: "rat", x: 420, y: 700, x0: 260, x1: 640 }, { t: "rat", x: 880, y: 700, x0: 760, x1: 1100 }, { t: "rat", x: 640, y: 441, x0: 560, x1: 820 },
      { t: "araignee", x: 610, y0: 120, y1: 330 }, { t: "araignee", x: 990, y0: 160, y1: 520 }, { t: "chauve", x: 760, y: 230 }, { t: "chauve", x: 1240, y: 200 }, { t: "rat", x: 1200, y: 368, x0: 1080, x1: 1260 }] })] },
  { nom: "LA COURSE DANS ASTORIA", musique: "fratelli", but: "Sème la voiture des Fratelli !", avant: "avant2", apres: "apres2", velo: true, scenes: [() => {
    // le quai de la conserverie, trois fois de suite sans s'arrêter, la voiture noire aux trousses
    const im = IMG.niv2c, n = 3, W = im.width, cle = "niv2c_x3"; if (!IMG[cle]) { const c = document.createElement("canvas"); c.width = W * n; c.height = im.height; const x = c.getContext("2d"); for (let k = 0; k < n; k++) x.drawImage(im, k * W, 0); IMG[cle] = c; }
    const pieces = [], ennemis = [], pizzas = [];
    for (let k = 0; k < n; k++) { const o = k * W; pieces.push(...arc(o + 300, 400, 6, 50, 100), ...ligne(o + 800, 370, 6, 55), ...arc(o + 1300, 400, 7, 50, 110)); pizzas.push([o + 1100, 340]);
      ennemis.push({ t: "chien", x: o + 900, y: 455, x0: o + 650, x1: o + 1200, chasse: 1 }, { t: "chien", x: o + 1600, y: 455, x0: o + 1350, x1: o + 1850, chasse: 1 }, { t: "mouette", x: o + 1200, y: 200 }, { t: "mouette", x: o + 1700, y: 180 }); }
    return { img: cle, vh: 500, depart: [260, 455], fin: { type: "x", x: W * n - 60 }, camYfixe: true, sol: [p(0, W * n, 455, 455, 1)], ech: [], pieces, pizzas, ennemis, voiture: { x: -200, depuis: 0 } }; }] },
  { nom: "LE RESTAURANT DES FRATELLI", but: "Échappe à Francis Fratelli !", avant: "avant3", apres: "apres3", scenes: [() => ({
    img: "niv3", vh: 470, depart: [140, 662], bornes: [62, 1346], fin: { type: "boss", x: 900 },
    sol: [p(60, 1346, 662, 662, 1), p(0, 292, 487), p(372, 540, 547), p(645, 812, 507), p(1030, 1336, 487), p(112, 345, 568),
      p(222, 462, 302), p(222, 462, 376), p(222, 462, 448), p(512, 760, 302), p(512, 760, 376), p(512, 760, 448), p(1036, 1290, 302), p(1036, 1290, 376)],
    ech: [], pieces: [...ligne(240, 270, 5), ...ligne(530, 270, 5), ...ligne(1060, 270, 5), ...arc(380, 500, 4), ...arc(1050, 440, 6)], pizzas: [[700, 470]],
    ennemis: [{ t: "rat", x: 300, y: 662, x0: 120, x1: 600 }, { t: "rat", x: 1100, y: 662, x0: 900, x1: 1300 }, { t: "rat", x: 1150, y: 487, x0: 1040, x1: 1320 }, { t: "chauve", x: 900, y: 240 }],
    boss: { t: "francis", x: 1150, y: 662, pv: 14, x0: 380, x1: 1300, declenche: 520 } })] },
  { nom: "LES SOUTERRAINS", but: "Suis la carte à travers les grottes !", avant: "avant4", apres: "apres4", scenes: [() => ({
    img: "niv4a", vh: 470, depart: [40, 520], fin: { type: "x", x: 1340 },
    sol: [p(0, 210, 522, 478), p(205, 472, 476), p(465, 1376, 476), p(0, 305, 266), p(330, 486, 670), p(0, 330, 692), p(875, 1180, 318), p(995, 1376, 670)],
    ech: [ech(195, 240, 266, 476), ech(1108, 1152, 318, 476), ech(1114, 1160, 476, 670)], vide: 740,
    pieces: [...ligne(30, 236, 5), ...arc(520, 440, 6), ...arc(880, 440, 6), ...ligne(900, 290, 6), ...ligne(1040, 640, 6), ...ligne(360, 640, 3)], pizzas: [[1300, 640]],
    ennemis: [{ t: "chauve", x: 420, y: 230 }, { t: "chauve", x: 800, y: 260 }, { t: "chauve", x: 1200, y: 190 }, { t: "araignee", x: 700, y0: 90, y1: 400 }, { t: "araignee", x: 980, y0: 90, y1: 360 },
      { t: "rat", x: 700, y: 476, x0: 480, x1: 1000 }, { t: "rat", x: 1000, y: 318, x0: 890, x1: 1170 }, { t: "rat", x: 1200, y: 670, x0: 1010, x1: 1360 }] }),
    () => ({ img: "niv4b", vh: 470, depart: [60, 585], bornes: [0, 1352], fin: { type: "boss", x: 1300 },
    sol: [p(0, 1352, 588, 588, 1), p(225, 510, 136), p(70, 225, 201), p(340, 580, 346), p(70, 270, 451), p(1100, 1280, 346)],
    ech: [ech(75, 120, 26, 451), ech(530, 556, 0, 346)],
    pieces: [...ligne(240, 106, 6), ...ligne(360, 316, 5), ...ligne(1110, 316, 4), ...ligne(90, 420, 4)], pizzas: [[1250, 300]],
    ennemis: [{ t: "chauve", x: 700, y: 160 }, { t: "chauve", x: 1000, y: 120 }, { t: "araignee", x: 860, y0: 30, y1: 360 }],
    boss: { t: "jake", x: 1100, y: 588, pv: 18, x0: 450, x1: 1300, declenche: 600, histoire: "boss4" } })] },
  { nom: "L'ORGUE D'OS", but: "Joue la bonne mélodie sur l'orgue !", avant: "avant5", apres: "apres5", scenes: [() => ({
    img: "niv5", vh: 470, depart: [60, 540], fin: { type: "orgue", x: 1385 }, vide: 760,
    sol: [p(0, 162, 540), p(160, 380, 548, 556), p(370, 1300, 568), p(785, 990, 606), p(1170, 1300, 588, 478), p(1295, 1408, 478), p(80, 400, 390), p(90, 360, 745)],
    ech: [],
    pieces: [...ligne(110, 356, 6), ...arc(400, 520, 6), ...ligne(810, 575, 4), ...ligne(1310, 448, 3), ...ligne(120, 712, 5)], pizzas: [[300, 700]],
    ennemis: [{ t: "squelette", x: 520, y: 568, x0: 400, x1: 700 }, { t: "squelette", x: 1180, y: 568, x0: 1100, x1: 1290 }, { t: "chauve", x: 300, y: 200 }, { t: "chauve", x: 1250, y: 260 }, { t: "squelette", x: 250, y: 390, x0: 100, x1: 390 }],
    orgue: { x0: 700, x1: 1110, y: 568 } })] },
  { nom: "LE BATEAU DE WILLY LE BORGNE", but: "Arrache le trésor aux Fratelli !", avant: "avant6", apres: "apres6", scenes: [() => ({
    img: "niv6a", vh: 470, depart: [260, 595], bornes: [190, 1376], fin: { type: "boss", x: 1300 },
    sol: [p(190, 1100, 598, 598, 1), p(1100, 1376, 598, 598, 1), p(205, 480, 505), p(1150, 1376, 455), p(1050, 1150, 598, 455)],
    ech: [], pieces: [...ligne(230, 476, 5), ...arc(600, 560, 6), ...ligne(1170, 425, 5)], pizzas: [[460, 470]],
    ennemis: [{ t: "squelette", x: 700, y: 598, x0: 500, x1: 900 }, { t: "squelette", x: 1250, y: 455, x0: 1160, x1: 1360 }, { t: "squelette", x: 380, y: 505, x0: 220, x1: 470 }],
    boss: { t: "mama", x: 1000, y: 598, pv: 24, x0: 420, x1: 1150, declenche: 520 } }),
    () => ({ img: "niv6b", vh: 520, depart: [1300, 640], bornes: [90, 1350], fin: { type: "xg", x: 450 },
    sol: [p(820, 1350, 642), p(720, 830, 745, 650), p(90, 1000, 722, 722, 1)], ech: [],
    pieces: [...ligne(500, 680, 8, 50)], pizzas: [], ennemis: [{ t: "crabe", x: 600, y: 722, x0: 300, x1: 900 }, { t: "crabe", x: 400, y: 722, x0: 150, x1: 700 }] })] }];

// ------------------------------------------------------------------ la rue d'Astoria vue de près (image agrandie)
function imgAgrandie(n, k) { const cle = n + "_x" + k; if (!IMG[cle]) { const im = IMG[n], c = document.createElement("canvas"); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); const x = c.getContext("2d"); x.imageSmoothingEnabled = false; x.drawImage(im, 0, 0, c.width, c.height); IMG[cle] = c; } return cle; }
/* De nouvelles salles, construites avec les objets découpés dans chaque décor (caisses, étagères, tonneaux, coffres, échelles, planches…) :
   une disposition différente à chaque salle (escaliers de caisses, passerelles, trous, étagères à escalader), le décor d'origine au loin, qui défile lentement */
let DEC = null;
function salle(o) {
  const D = DEC.t[o.th], F = DEC.f, H = 768, FY = 650, L = o.L || 3600;
  let g = o.graine * 9301 + 49297; const rnd = () => (g = (g * 9301 + 49297) % 233280) / 233280, choix = l => l[Math.floor(rnd() * l.length)];
  const cle = "salle_" + o.th + "_" + o.graine; const neuf = !IMG[cle];
  const cv = IMG[cle] || document.createElement("canvas"); if (neuf) { cv.width = L; cv.height = H; }
  const x = cv.getContext("2d"), at = IMG.decor;
  const sc = document.createElement("canvas"); if (neuf) { sc.width = L; sc.height = H; } const y_ = sc.getContext("2d");   // (ce qui porte le joueur : dessiné à part, pour le détacher du fond)
  const fr = n => F[n], dessine = (n, dx, dy, w, h) => { if (!neuf) return; const q = fr(n); y_.drawImage(at, q[0], q[1], q[2], q[3], dx, dy, w ?? q[2], h ?? q[3]); };
  const sol = [], ech = [], pieces = [], ennemis = [], trous = [], deco = [];
  const terre = o.ennemis.filter(t => !["chauve", "araignee", "mouette"].includes(t)), air = o.ennemis.filter(t => ["chauve", "araignee"].includes(t));
  const ennemiSol = (x0, x1, y) => { if (terre.length && x1 - x0 > 90) ennemis.push({ t: choix(terre), x: (x0 + x1) / 2, y, x0: x0 + 20, x1: x1 - 20 }); };
  const ennemiAir = (cx, y) => { const t = choix(air.length ? air : ["chauve"]); ennemis.push(t === "araignee" ? { t, x: cx, y0: 60, y1: y } : { t, x: cx, y }); };
  const planche = (x0, w, y) => { const [n, sf] = choix(D.planches), q = fr(n); for (let k = 0; k < w; k += q[2]) { const ww = Math.min(q[2], w - k); if (neuf) y_.drawImage(at, q[0], q[1], ww, q[3], x0 + k, y - sf, ww, q[3]); } sol.push(p(x0, x0 + w, y)); };
  const bloc = (x0, base, b) => { const [n, sf, pl, prof] = b, q = fr(n); dessine(n, x0, base - q[3]); if (prof && prof.length) for (const [a0, a1, y] of prof) sol.push(p(x0 + a0, x0 + a1, base - q[3] + y)); else sol.push(p(x0 + 4, x0 + q[2] - 4, base - q[3] + sf)); for (const y of pl) sol.push(p(x0 + 6, x0 + q[2] - 6, base - q[3] + y)); return q; };
  const echelle = (cx, y0, y1) => { const q = fr(D.echelle), w = q[2]; dessine(D.echelle, cx - w / 2, y0 - 6, w, y1 - y0 + 6); ech.push(ech_(cx - 22, cx + 22, y0, y1)); };
  const ech_ = (x0, x1, y0, y1) => ({ x0, x1, y0, y1 });
  // les morceaux de la salle, de gauche à droite
  let X0 = 0; const segs = [["depart", 340]]; let reste = L - 340 - 260;
  const types = ["escalier", "planches", "trou", "passerelle", "meuble", "couloir", "trou", "escalier", "passerelle", "planches"];
  let ti = Math.floor(rnd() * types.length);
  while (reste > 380) { const t = types[ti++ % types.length], w = { escalier: 460, planches: 520, trou: 420, passerelle: 640, meuble: 420, couloir: 380 }[t]; if (w > reste) break; segs.push([t, w]); reste -= w; }
  segs.push(["fin", reste + 260]);
  // des décorations, au fond
  for (let k = 0; k < L / 380; k++) if (D.deco.length && rnd() < .7) deco.push([choix(D.deco), 120 + k * 380 + rnd() * 200]);
  for (const [n, dx] of deco) { const q = fr(n); if (neuf) { x.globalAlpha = .55; x.drawImage(at, q[0], q[1], q[2], q[3], dx, FY - q[3] + 4, q[2], q[3]); x.globalAlpha = 1; } }
  for (const [t, w] of segs) { const a = X0, b = X0 + w;
    if (t === "trou") { const tw = 130 + Math.floor(rnd() * 50), tx = a + (w - tw) / 2; trous.push([tx, tx + tw]); pieces.push(...arc(tx - 20, FY - 60, 4, (tw + 40) / 3, 110));
      if (rnd() < .5) { planche(tx + 10, tw - 20, FY - 170); ennemiAir(tx + tw / 2, FY - 300); } ennemiSol(tx + tw + 20, b, FY); }
    if (t === "escalier") { let xx = a + 40, base = FY; const n = 2 + Math.floor(rnd() * 2);
      for (let k = 0; k < n; k++) { const bl = choix(D.blocs.filter(q => fr(q[0])[3] < 150 && !q[2].length) .concat([])) || D.blocs[0], q = fr(bl[0]);
        bloc(xx, base, bl); pieces.push(...ligne(xx + 15, base - q[3] - 34, Math.max(1, Math.floor(q[2] / 46)), 46));
        if (k === 0 || rnd() < .5) { const pr = bl[3] && bl[3].length ? Math.min(...bl[3].map(z => z[2])) : bl[1]; base = base - q[3] + pr; } else { base = FY; }
        xx += q[2] - 10; if (xx > b - 120) break; }
      ennemiSol(xx + 10, b, FY); }
    if (t === "planches") { let y = FY - 130; for (let k = 0; k < 3; k++) { const px = a + 30 + k * 160, pw = 120; planche(px, pw, y); pieces.push(...ligne(px + 15, y - 34, 3, 40)); y -= 70 * (k === 1 ? -1 : 1); }
      ennemiSol(a, b, FY); ennemiAir(a + w / 2, FY - 380); }
    if (t === "passerelle") { const yW = FY - 230; echelle(a + 60, yW, FY); planche(a + 30, w - 60, yW); pieces.push(...ligne(a + 120, yW - 34, Math.floor((w - 160) / 46), 46));
      ennemiSol(a + 120, b - 40, yW); ennemiSol(a + 100, b, FY); if (rnd() < .6) ennemiAir(a + w * .7, yW - 150); }
    if (t === "meuble") { const grands = D.blocs.filter(q => q[2].length), bl = grands.length ? choix(grands) : choix(D.blocs), q = fr(bl[0]); const bx = a + (w - q[2]) / 2;
      bloc(bx, FY, bl); pieces.push(...ligne(bx + 20, FY - q[3] + bl[1] - 34, Math.floor((q[2] - 30) / 46), 46)); if (q[3] - bl[1] > 180 && !bl[2].length) echelle(bx - 26, FY - q[3] + bl[1], FY);
      ennemiAir(bx + q[2] / 2, FY - q[3] - 120); }
    if (t === "couloir") { ennemiSol(a, a + w / 2, FY); ennemiSol(a + w / 2, b, FY); pieces.push(...arc(a + 60, FY - 60, 6, (w - 120) / 5, 90)); }
    X0 = b; }
  // le sol, sauf les trous
  let xs = 0; for (const [t0, t1] of [...trous, [L, L]]) { if (t1 > xs) { sol.push(p(xs, t0, FY, FY, 1)); } xs = t1; }
  if (neuf) { const [n, sf] = D.sol, q = fr(n);
    for (let k = 0; k < L; k += q[2]) x.drawImage(at, q[0], q[1], q[2], q[3], k, FY - sf, q[2], q[3]);
    if (o.th === "niv3" || o.th === "niv5") { x.globalCompositeOperation = "lighter"; x.globalAlpha = .18; for (let k = 0; k < L; k += q[2]) x.drawImage(at, q[0], q[1], q[2], q[3], k, FY - sf, q[2], q[3]); x.globalAlpha = 1; x.globalCompositeOperation = "source-over"; }
    if (FY - sf + q[3] < H) { x.fillStyle = "#0a0604"; x.fillRect(0, FY - sf + q[3], L, H); }
    for (const [t0, t1] of trous) { x.clearRect(t0, FY - sf, t1 - t0, H); if (D.eau != null) { const e = fr(D.eau); x.drawImage(at, e[0], e[1], e[2], e[3], t0, FY + 30, t1 - t0, H - FY - 30); }
      else { const gr = x.createLinearGradient(0, FY, 0, H); gr.addColorStop(0, "rgba(0,0,0,.6)"); gr.addColorStop(1, "#000"); x.fillStyle = gr; x.fillRect(t0, FY - sf, t1 - t0, H); } } }
  if (neuf) {   // contour noir, ombre portée, un peu plus de lumière : comme les personnages
    const ombre = document.createElement("canvas"); ombre.width = L; ombre.height = H; const o2 = ombre.getContext("2d"); o2.drawImage(sc, 0, 0); o2.globalCompositeOperation = "source-in"; o2.fillStyle = "#000"; o2.fillRect(0, 0, L, H);
    x.globalAlpha = .45; x.drawImage(ombre, 7, 9); x.globalAlpha = 1; for (const [dx, dy] of [[-3, 0], [3, 0], [0, -3], [0, 3]]) x.drawImage(ombre, dx, dy);
    x.drawImage(sc, 0, 0); x.globalCompositeOperation = "lighter"; x.globalAlpha = ({ niv3: .34, niv5: .28, niv4a: .2 }[o.th] || .14); x.drawImage(sc, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = "source-over"; }
  IMG[cle] = cv;
  return { img: cle, par: o.th, vh: 470, depart: [90, FY], fin: { type: "x", x: L - 80 }, sol, ech, pieces, pizzas: [[L * .5, FY - 150]], ennemis, vide: H - 10 };
}
{ const N = NIVEAUX;
  const S_ = (th, graine, ennemis, L) => () => salle({ th, graine, ennemis, L });
  N[0].scenes.unshift(S_("niv1", 1, ["rat", "araignee", "chauve", "rat"], 3600), S_("niv1", 7, ["rat", "chauve", "araignee"], 3200));
  N[2].scenes.unshift(S_("niv3", 3, ["rat", "chauve", "araignee"], 3600), S_("niv3", 11, ["rat", "rat", "chauve"], 3000));
  N[3].scenes.unshift(S_("niv4a", 5, ["chauve", "rat", "araignee"], 3800));
  N[3].scenes.splice(2, 0, S_("niv4a", 13, ["rat", "chauve", "araignee"], 3200));
  N[4].scenes.unshift(S_("niv5", 2, ["squelette", "chauve", "squelette"], 3600));
  N[5].scenes.unshift(S_("niv6a", 4, ["squelette", "squelette"], 3600)); }

// ------------------------------------------------------------------ l'état du jeu
let etat = "charge", E = {};          // E : les données de l'état courant
const cam = { x: 0, y: 0, z: 1 };
let partie = null;                    // { ko: Set, ado, niv, scene, score, pieces }
let J = null;                         // le joueur
let S = null;                         // la scène en cours
const RECORD = () => +(localStorage.getItem("gooniesRecord") || 0);

function demarre() { allerTitre(); requestAnimationFrame(boucle);
  if (DEBUG && PARAM.get("h")) { partie = { ko: new Set(), ado: "mikey", niv: 0, scene: 0, score: 0, pieces: 0 }; histoire(PARAM.get("h"), () => allerTitre()); }
  if (PARAM.has("direct")) { jouerMus(NIVEAUX[+(PARAM.get("niv") || 1) - 1].musique || null); partie = { ko: new Set(), ado: PARAM.get("ado") || "mikey", niv: +(PARAM.get("niv") || 1) - 1, scene: +(PARAM.get("scene") || 1) - 1, score: 0, pieces: 0 }; chargerScene(); } }
// la musique du début (écran titre, choix du Goonie, histoire d'ouverture) ; elle s'efface quand le premier niveau commence
let MUS = null, musNom = null, musVoulue = false;
const MUSIQUES = {};
function jouerMus(nom, debut = 0) {   // (debut : on démarre le morceau à ce moment, en secondes)   // un seul morceau à la fois ; null : la musique s'efface
  if (nom === musNom && MUS && !MUS.paused) return;
  const ancien = MUS; if (ancien) { const a = ancien; const f = setInterval(() => { a.volume = Math.max(0, a.volume - .06); if (a.volume <= 0) { clearInterval(f); a.pause(); a.currentTime = 0; } }, 80); }
  musNom = nom; musVoulue = !!nom; MUS = null; if (!nom) return;
  const m = MUSIQUES[nom] || (MUSIQUES[nom] = Object.assign(new Audio(`sons/${nom}.mp3?v=3`), { loop: true }));
  m.volume = .8; MUS = m; const cale = () => { try { m.currentTime = debut; } catch (e) {} }; if (m.readyState >= 1) cale(); else m.addEventListener("loadedmetadata", cale, { once: true }); m.play().catch(() => {}); if (DEBUG) window.MUS_ = m; }
const musique = on => jouerMus(on ? "titre" : null);
addEventListener("pointerdown", () => { if (musVoulue && MUS && MUS.paused) MUS.play().catch(() => {}); }, true);   // (le navigateur attend un premier geste pour jouer du son)
addEventListener("keydown", () => { if (musVoulue && MUS && MUS.paused) MUS.play().catch(() => {}); }, true);
function allerTitre() { etat = "titre"; E = { t: 0 }; musique(true); }
function nouvellePartie() { partie = { ko: new Set(), ado: null, niv: +(PARAM.get("niv") || 1) - 1, scene: +(PARAM.get("scene") || 1) - 1, score: 0, pieces: 0 }; allerChoix(() => histoire(partie.niv === 0 && partie.scene === 0 ? "intro" : null, () => debutNiveau())); }
function allerChoix(suite, msg) { etat = "choix"; const libres = ADOS.filter(a => !partie.ko.has(a.id)); E = { t: 0, i: Math.max(0, libres.indexOf(parId(partie.ado)) ), suite, msg }; }
function histoire(cle, suite) { if (!cle || !H[cle]) { suite(); return; } if (H[cle].mus) jouerMus(H[cle].mus, H[cle].musDebut || 0); etat = "histoire"; E = { h: H[cle], i: 0, c: 0, t: 0, suite }; }
function debutNiveau() { const N = NIVEAUX[partie.niv]; etat = "titreNiv"; E = { t: 0, N }; jouerMus(N.musique || null); }
function chargerScene() { const N = NIVEAUX[partie.niv], def = N.scenes[partie.scene]();
  S = { ...def, N, w: IMG[def.img].width, h: IMG[def.img].height, t: 0, ennemis: [], tirs: [], tirsE: [], objets: [], eclats: [], bossMort: false, orgueFait: false, ouvert: false };
  S.ennemis = def.ennemis.filter(e => Math.hypot(e.x - def.depart[0], (e.y ?? e.y1 ?? 0) - def.depart[1]) > 280).map(e => nouvelEnnemi(e));   // (rien ne nous tombe dessus au départ)
  S.objets = def.pieces.map(([x, y]) => ({ t: "piece", x, y })).concat((def.pizzas || []).map(([x, y]) => ({ t: "pizza", x, y })));
  if (def.fin.type === "objet") S.objets.push({ t: "carte", x: def.fin.x, y: def.fin.y - 28 });
  if (def.boss) S.boss = { ...def.boss, pvMax: def.boss.pv, actif: false, tm: 0, dir: -1, vx: 0, inv: 0, x: def.boss.x, y: def.boss.y, tirT: 1.5, slothFait: false };
  if (def.voiture) S.voit = { x: def.voiture.x, actif: false, depuis: def.voiture.depuis };
  if (DEBUG && PARAM.get("dep")) def.depart = PARAM.get("dep").split(",").map(Number);
  J = nouveauJoueur(def.depart[0], def.depart[1]); cam.z = LH / def.vh; cam.x = Math.max(0, J.x - LW / cam.z * .35); cam.y = def.camYfixe ? (def.camY ?? S.h - def.vh) : Math.max(0, Math.min(S.h - def.vh, J.y - def.vh * .65));
  etat = "jeu"; if (def.histoireDebut) pause(def.histoireDebut); }
function nouveauJoueur(x, y) { return { x, y, vx: 0, vy: 0, sol: true, plat: null, echelle: null, dir: 1, inv: 2, tirT: 0, pv: 3, anim: 0, tirA: 0, mal: 0, sur: [x, y], velo: !!S.N.velo, gant: null }; }
function nouvelEnnemi(e) { const pv = { rat: 1, araignee: 1, chauve: 1, chien: 2, mouette: 1, crabe: 2, squelette: 3 }[e.t] || 1;
  return { ...e, pv, vx: 0, dir: -1, tm: Math.random() * 3, mort: 0, inv: 0, xb: e.x, yb: e.y || e.y0 || 0, y: e.y ?? e.y0 }; }

// ------------------------------------------------------------------ physique : les plateformes
function hauteurPlat(pl, x) { if (x < pl.x0 || x > pl.x1) return null; return pl.y0 + (pl.y1 - pl.y0) * (x - pl.x0) / Math.max(1, pl.x1 - pl.x0); }
function sousPieds(x, yAvant, yApres, ignore) { let best = null, by = 1e9;
  for (const pl of S.sol) { if (pl === ignore) continue; const h = hauteurPlat(pl, x); if (h == null) continue; if (yAvant <= h + 6 && yApres >= h - 1 && h < by) { by = h; best = pl; } }
  return best ? [best, by] : null; }
const HB = { w: 34, h: 84 };
function boiteJ() { return J.velo ? [J.x - 40, J.y - 118, 80, 116] : J.baisse ? [J.x - HB.w / 2, J.y - 58, HB.w, 58] : [J.x - HB.w / 2, J.y - HB.h, HB.w, HB.h]; }
const chevauche = (a, b) => a[0] < b[0] + b[2] && a[0] + a[2] > b[0] && a[1] < b[1] + b[3] && a[1] + a[3] > b[1];

// ------------------------------------------------------------------ le joueur
const VIT = 330, GRAV = 2300, SAUT = 960;
function majJoueur(dt) {
  const A = parId(partie.ado); J.baisse = false;
  J.inv = Math.max(0, J.inv - dt); J.tirT = Math.max(0, J.tirT - dt); J.tirA = Math.max(0, J.tirA - dt); J.mal = Math.max(0, J.mal - dt);
  const g = IN.gauche ? -1 : 0, d = IN.droite ? 1 : 0, dirX = g + d;
  if (J.velo) {   // à vélo : on roule toujours un peu, la droite accélère, la gauche freine
    const cible = dirX > 0 ? 430 : 0; J.vx += (cible - J.vx) * Math.min(1, dt * (dirX < 0 ? 4 : dirX > 0 ? 3.2 : 1.6)); J.dir = 1; J.anim += J.vx * dt / 40;   // (on pédale : il roule ; on lâche : il ralentit jusqu'à s'arrêter ; en arrière : il freine)
  } else if (J.echelle) {
    const e = J.echelle; J.vx = 0; J.x += (((e.x0 + e.x1) / 2) - J.x) * Math.min(1, dt * 12);
    const dy = (IN.bas ? 1 : 0) - (IN.haut ? 1 : 0); J.y += dy * 210 * dt; if (dy) J.anim += dt * 8;
    if (J.y <= e.y0) { J.y = e.y0; J.echelle = null; J.sol = true; J.vy = 0; }
    else if (J.y >= e.y1) { J.y = e.y1; J.echelle = null; }
    if (IN.sautP) { J.echelle = null; J.vy = -SAUT * .7; J.sol = false; son("saut"); }
    if (dirX) { J.echelle = null; J.dir = dirX; }
    return finJoueur(dt, A);
  } else {
    J.baisse = IN.bas && J.sol && !IN.saut;   // (se baisser : pour tirer sur les rats et passer sous les tirs)
    const cible = J.baisse ? 0 : dirX * VIT; J.vx += (cible - J.vx) * Math.min(1, dt * (J.sol ? 14 : 6)); if (dirX) J.dir = dirX;
    if (J.sol && Math.abs(J.vx) > 20) J.anim += Math.abs(J.vx) * dt / 22;
    // monter ou descendre une échelle
    for (const e of S.ech || []) { if (J.x > e.x0 - 6 && J.x < e.x1 + 6) {
      if (IN.haut && J.y > e.y0 + 4 && J.y <= e.y1 + 4) { J.echelle = e; J.vy = 0; J.sol = false; return finJoueur(dt, A); }
      if (IN.bas && J.sol && Math.abs(J.y - e.y0) < 8) { J.echelle = e; J.y = e.y0 + 6; J.vy = 0; J.sol = false; return finJoueur(dt, A); } } }
  }
  // sauter ; descendre à travers une plateforme (bas + saut)
  if (IN.sautP && J.sol) { if (IN.bas && J.plat && !J.plat.dur && !J.velo) { J.ignore = J.plat; J.ignoreT = .25; J.sol = false; J.y += 4; } else { J.vy = -SAUT * (J.velo ? .95 : 1); J.sol = false; son("saut"); } }
  if (!IN.saut && J.vy < -300) J.vy += GRAV * dt * 1.2;   // saut plus court si on lâche vite
  J.ignoreT = Math.max(0, (J.ignoreT || 0) - dt); if (!J.ignoreT) J.ignore = null;
  J.vy = Math.min(1400, J.vy + GRAV * dt);
  const xAv = J.x; J.x += J.vx * dt;
  const b = S.bornes || [0, S.w]; J.x = Math.max(b[0] + 18, Math.min(b[1] - 18, J.x));
  const yAv = J.y; J.y += J.vy * dt;
  if (J.vy >= 0) { const s = sousPieds(J.x, yAv, J.y, J.ignore); if (s) { J.y = s[1]; J.vy = 0; if (!J.sol && J.velo) J.anim += 1; J.sol = true; J.plat = s[0]; } else J.sol = false; }
  else J.sol = false;
  if (J.sol && J.plat) { const h = hauteurPlat(J.plat, J.x); if (h == null) { J.sol = false; } else { J.y = h; J.sur = [J.x, J.y]; } }
  if (J.y > (S.vide || S.h + 60)) { blesse(1, true); }
  finJoueur(dt, A, xAv);
}
function finJoueur(dt, A) {
  // tirer
  if (IN.tirP || (IN.tir && J.tirT <= 0 && A.id !== "data")) if (J.tirT <= 0 && !J.gant) tirer(A);
  if (J.gant) { const G = J.gant; G.t += dt; const L = G.t < .16 ? G.t / .16 : G.t < .24 ? 1 : Math.max(0, 1 - (G.t - .24) / .16); G.l = 230 * L; if (G.t > .4) J.gant = null; }
}
function tirer(A) {
  J.tirT = A.tirD; J.tirA = .2; son("tir");
  const yh = J.y - (J.velo ? 92 : J.baisse ? 30 : 58), xh = J.x + J.dir * (J.velo ? 30 : 26);
  if (A.id === "mikey") S.tirs.push({ t: "caillou", x: xh, y: yh, vx: J.dir * 900 + J.vx * .3, vy: -40, g: 260, vie: 1.1, deg: 1, rot: 0 });
  if (A.id === "choco") S.tirs.push({ t: "barre", x: xh, y: yh, vx: J.dir * 600 + J.vx * .3, vy: J.baisse ? -140 : -420, g: 1400, vie: 1.6, deg: 2, rot: 0, vr: 14 * J.dir });
  if (A.id === "bagou") S.tirs.push({ t: "peigne", x: xh, y: yh, vx: J.dir * 760 + J.vx * .3, vy: 0, g: 0, vie: .9, deg: 1, rot: 0, vr: 9 * J.dir });
  if (A.id === "data") J.gant = { t: 0, l: 0, dir: J.dir, touches: new Set(), h: J.baisse ? 30 : 58 };
}
function blesse(n = 1, chute = false) {
  if (!chute && J.inv > 0) return;
  J.pv -= n; J.inv = 1.4; J.mal = .4; son(J.pv > 0 ? "aie" : "mort");
  if (chute) { const xr = J.sur[0] - J.dir * 110, s2 = sousPieds(xr, J.sur[1] - 200, J.sur[1] + 200); if (s2) { J.sur = [xr, s2[1]]; } J.x = J.sur[0]; J.y = J.sur[1] - 2;   // (on revient un peu en arrière du trou)
    J.vx = J.vy = 0; J.echelle = null; } else { J.vy = -420; J.vx = -J.dir * 260; J.sol = false; }
  if (J.pv <= 0) { etat = "ko"; E = { t: 0 }; partie.ko.add(partie.ado); }
}

// ------------------------------------------------------------------ les ennemis
function majEnnemis(dt) {
  for (const e of S.ennemis) { e.tm += dt; e.inv = Math.max(0, e.inv - dt);
    if (e.mort) { e.mort += dt; e.y += 300 * dt * e.mort; continue; }
    if (e.t === "rat" || e.t === "squelette" || e.t === "crabe" || e.t === "chien") {
      const vit = { rat: 120, squelette: 70, crabe: 90, chien: 210 }[e.t] * (e.chasse && Math.abs(J.x - e.x) < 520 ? 1.15 : 1);
      if (e.chasse && Math.abs(J.x - e.x) < 520) e.dir = Math.sign(J.x - e.x) || -1;
      else { if (e.x <= e.x0) e.dir = 1; if (e.x >= e.x1) e.dir = -1; }
      if (e.t === "squelette" && Math.abs(J.x - e.x) < 110 && Math.abs(J.y - e.y) < 60) { e.att = (e.att || 0) + dt; e.dir = Math.sign(J.x - e.x) || 1; }
      else { e.att = 0; e.x += e.dir * vit * dt; }
      e.x = Math.max(e.x0 - 2, Math.min(e.x1 + 2, e.x)); e.y = e.yb;
    } else if (e.t === "araignee") { e.y = e.y0 + (e.y1 - e.y0) * (.5 - .5 * Math.cos(e.tm * 1.1)); }
    else if (e.t === "chauve") { const dx = J.x - e.x, dy = (J.y - 60) - e.y, pres = Math.hypot(dx, dy) < 380;
      if (pres) { e.x += Math.sign(dx) * 120 * dt; e.y += Math.sign(dy) * 90 * dt; } else { e.x = e.xb + Math.sin(e.tm * .9) * 120; e.y += ((e.yb + Math.sin(e.tm * 2.3) * 40) - e.y) * dt * 2; } e.dir = Math.sign(dx) || 1; }
    else if (e.t === "mouette") { e.x -= 170 * dt; e.dir = -1; const dx = e.x - J.x; e.y = e.yb + (dx > -100 && dx < 360 ? Math.max(0, 1 - Math.abs(dx - 130) / 230) * (J.y - 120 - e.yb) : 0) + Math.sin(e.tm * 3) * 12; if (e.x < cam.x - 200) { e.x = cam.x + LW / cam.z + 300; } }
    // contact avec le joueur : on l'écrase en lui sautant dessus, sinon il nous blesse
    const be = boiteE(e), bj = boiteJ();
    if (chevauche(be, bj)) { if (J.vy > 120 && bj[1] + bj[3] < be[1] + be[3] * .55 && e.t !== "araignee") { touche(e, 2); J.vy = -620; son("coup"); } else blesse(1); } }
  S.ennemis = S.ennemis.filter(e => !e.mort || e.mort < 1.2);
}
function boiteE(e) { const T = { rat: [70, 34], araignee: [46, 40], chauve: [62, 30], chien: [84, 50], mouette: [60, 30], crabe: [76, 40], squelette: [36, 90] }[e.t] || [40, 40];
  if (e.t === "araignee" || e.t === "chauve" || e.t === "mouette") return [e.x - T[0] / 2, e.y - T[1] / 2 + (e.t === "araignee" ? 18 : 0), T[0], T[1]];
  return [e.x - T[0] / 2, e.y - T[1], T[0], T[1]]; }
function touche(e, deg) { if (e.inv > 0 || e.mort) return; e.pv -= deg; e.inv = .25; son("coup");
  if (e.pv <= 0) { e.mort = .01; partie.score += { rat: 200, araignee: 250, chauve: 250, chien: 300, mouette: 200, crabe: 300, squelette: 500 }[e.t] || 200; eclats(e.x, e.y - 30, "#ffe070"); } }
function eclats(x, y, c, n = 12) { for (let k = 0; k < n; k++) S.eclats.push({ x, y, vx: (Math.random() - .5) * 500, vy: -Math.random() * 500, t: 0, c }); }

// ------------------------------------------------------------------ les boss (Francis, Jake, Mama Fratelli) et Sloth
function majBoss(dt) {
  const B = S.boss; if (!B || B.mort) { if (B && B.mort) { B.mort += dt; } return; }
  if (!B.actif) { if (Math.abs(J.x - B.x) < B.declenche) { B.actif = true; son("boss"); if (B.histoire) { const h = B.histoire; B.histoire = null; pause(h); } } return; }
  B.tm += dt; B.inv = Math.max(0, B.inv - dt); B.tirT -= dt;
  const vit = B.t === "jake" ? 150 : 120; const loin = Math.abs(J.x - B.x) > 260;
  B.dir = Math.sign(J.x - B.x) || -1;
  if (loin) B.x += B.dir * vit * dt; else B.x -= B.dir * vit * .4 * dt;
  B.x = Math.max(B.x0, Math.min(B.x1, B.x));
  if (B.tirT <= 0) {
    const yb = B.y - 120;
    if (B.t === "francis") { B.tirT = 1.7; S.tirsE.push({ t: "bouteille", x: B.x, y: yb, vx: B.dir * (280 + Math.abs(J.x - B.x) * .5), vy: -520, g: 1200, rot: 0, vr: 10 }); }
    if (B.t === "jake") { B.tirT = 2.1; for (const k of [0, 1]) S.tirsE.push({ t: "rocher", x: B.x, y: yb, vx: B.dir * (240 + k * 160 + Math.abs(J.x - B.x) * .35), vy: -600 + k * 80, g: 1300, rot: 0, vr: 6 }); }
    if (B.t === "mama") { const rage = B.pv <= B.pvMax / 2; B.tirT = rage ? .9 : 1.4; const n = rage ? 3 : 1; for (let k = 0; k < n; k++) S.tirsE.push({ t: "balle", x: B.x + B.dir * 50, y: B.y - 70 - k * 22, vx: B.dir * 520, vy: 0, g: 0, rot: 0, vr: 0 }); }
  }
  // Mama à moitié : Sloth arrive
  if (B.t === "mama" && !B.slothFait && B.pv <= B.pvMax / 2) { B.slothFait = true; S.sloth = { x: cam.x - 120, t: 0 }; pause("sloth6"); }
  const bb = [B.x - 46, B.y - 150, 92, 150];
  if (chevauche(bb, boiteJ())) blesse(1);
}
function toucheBoss(deg) { const B = S.boss; if (!B || B.mort || !B.actif || B.inv > 0) return; B.pv -= deg; B.inv = .18; son("coup");
  if (B.pv <= 0) { B.mort = .01; partie.score += 5000; eclats(B.x, B.y - 80, "#ffd040", 40); S.bossMort = true; son("gagne"); } }
function pause(cle) { const reprise = { etat: "jeu" }; histoire(cle, () => { etat = reprise.etat; }); }

// ------------------------------------------------------------------ tirs, objets, fin de scène
function majTirs(dt) {
  for (const t of S.tirs) { t.vie -= dt; t.vy += t.g * dt; t.x += t.vx * dt; t.y += t.vy * dt; t.rot += (t.vr || 0) * dt;
    const bt = [t.x - 12, t.y - 10, 24, 20];
    for (const e of S.ennemis) if (!e.mort && chevauche(bt, boiteE(e))) { touche(e, t.deg); t.vie = 0; break; }
    if (t.vie > 0 && S.boss && S.boss.actif && !S.boss.mort && chevauche(bt, [S.boss.x - 46, S.boss.y - 150, 92, 150])) { toucheBoss(t.deg); t.vie = 0; }
    if (t.t === "barre" && t.vy > 0) { const s = sousPieds(t.x, t.y - t.vy * dt, t.y); if (s) t.vie = 0; } }
  S.tirs = S.tirs.filter(t => t.vie > 0);
  if (J.gant) { const G = J.gant, y = J.y - G.h, x0 = J.x + G.dir * 20, x1 = x0 + G.dir * G.l, bg = [Math.min(x0, x1), y - 16, Math.abs(x1 - x0) + 20, 32];
    for (const e of S.ennemis) if (!e.mort && !G.touches.has(e) && chevauche(bg, boiteE(e))) { G.touches.add(e); touche(e, 2); }
    if (S.boss && S.boss.actif && !G.touches.has("boss") && chevauche(bg, [S.boss.x - 46, S.boss.y - 150, 92, 150])) { G.touches.add("boss"); toucheBoss(2); } }
  for (const t of S.tirsE) { t.vy += t.g * dt; t.x += t.vx * dt; t.y += t.vy * dt; t.rot += t.vr * dt; if (chevauche([t.x - 12, t.y - 12, 24, 24], boiteJ())) { blesse(1); t.fin = 1; } if (t.y > S.h + 50 || Math.abs(t.x - J.x) > 1400) t.fin = 1;
    if (t.g && t.vy > 0) { const s = sousPieds(t.x, t.y - t.vy * dt, t.y); if (s) { t.fin = 1; eclats(t.x, t.y, t.t === "bouteille" ? "#7fe08a" : "#a08060", 6); } } }
  S.tirsE = S.tirsE.filter(t => !t.fin);
  for (const o of S.objets) { if (o.pris) continue; const bo = [o.x - 16, o.y - 16, 32, 32];
    if (chevauche(bo, boiteJ())) { o.pris = 1;
      if (o.t === "piece") { partie.pieces++; partie.score += 100; son("piece"); }
      if (o.t === "pizza") { J.pv = Math.min(3, J.pv + 1); partie.score += 300; son("gagne"); }
      if (o.t === "carte") { partie.score += 2000; son("gagne"); finScene(); } } }
  for (const c of S.eclats) { c.t += dt; c.vy += 1200 * dt; c.x += c.vx * dt; c.y += c.vy * dt; }
  S.eclats = S.eclats.filter(c => c.t < .8);
  // la voiture des Fratelli (à vélo) : elle arrive par derrière, il faut garder de l'avance
  if (S.voit) { const V = S.voit; if (!V.actif && J.x > V.depuis) { V.actif = true; V.x = cam.x - 300; son("boss"); }
    if (DEBUG && PARAM.has("voit")) { V.actif = true; V.x = J.x - 330; } else
    if (V.actif && S.t < 2.5) V.x = cam.x - 700;   // (elle arrive au bout de quelques secondes)
    else if (V.actif) { V.x += (J.vx > 360 ? 300 : 400) * dt; if (V.x < cam.x - 330) V.x = cam.x - 330; V.klaxon = (V.klaxon || 0) - dt; if (J.x - V.x < 260 && V.klaxon <= 0) { son("klaxon"); V.klaxon = 2.5; }
      if (chevauche([V.x - 130, S.sol[0].y0 - 70, 260, 70], boiteJ())) { blesse(1); V.x -= 750; } } }
  // Sloth fonce sur Mama
  if (S.sloth) { const L2 = S.sloth; L2.t += dt; L2.x += 520 * dt; if (S.boss && !S.boss.mort && Math.abs(L2.x - S.boss.x) < 60 && !L2.frappe) { L2.frappe = 1; toucheBoss(6); S.boss.inv = 0; eclats(S.boss.x, S.boss.y - 90, "#fff", 20); } if (L2.x > cam.x + LW / cam.z + 200) S.sloth = null; }
}
function finScene() { const N = NIVEAUX[partie.niv];
  if (partie.scene + 1 < N.scenes.length) { partie.scene++; etat = "fondu"; E = { t: 0, suite: () => chargerScene() }; return; }
  etat = "fondu"; E = { t: 0, suite: () => histoire(N.apres, () => { partie.niv++; partie.scene = 0; if (partie.niv >= NIVEAUX.length) { histoire("fin", () => { etat = "fin"; E = { t: 0 }; enregistreRecord(); }); } else debutNiveau(); }) }; }
function enregistreRecord() { if (partie.score > RECORD()) localStorage.setItem("gooniesRecord", partie.score); }
function majOrgue(dt) {   // l'orgue d'os : rejouer la mélodie (croix ou flèches), trois manches
  const O = S.orgue; if (!O || S.orgueFait) return;
  if (!S.puz) { if (J.x > O.x0 && J.x < O.x1 && J.sol) { S.puz = { manche: 0, seq: [], i: 0, phase: "montre", t: 0 }; nouvelleManche(); } return; }
  const P = S.puz; P.t += dt;
  if (P.phase === "montre") { const k = Math.floor(P.t / .6); if (k < P.seq.length && k !== P.dk) { P.dk = k; son("note" + P.seq[k]); } if (P.t > P.seq.length * .6 + .3) { P.phase = "joue"; P.i = 0; P.t = 0; } return; }
  if (P.phase === "joue") { const touches = [IN.hautP, IN.droiteP, IN.basP, IN.gaucheP], n = touches.findIndex(v => v);
    if (n >= 0) { son("note" + n); P.dernier = { n, t: 0 }; if (n === P.seq[P.i]) { P.i++; if (P.i >= P.seq.length) { P.manche++; partie.score += 1000; if (P.manche >= 3) { S.orgueFait = true; S.puz = null; son("gagne"); eclats(900, 300, "#fff8c0", 40); } else { P.phase = "pause"; P.t = 0; } } }
      else { son("faux"); P.phase = "faux"; P.t = 0; blesse(1); } } return; }
  if (P.phase === "faux" && P.t > 1.2) { P.phase = "montre"; P.t = 0; P.dk = -1; }
  if (P.phase === "pause" && P.t > .8) { nouvelleManche(); }
  function nouvelleManche() { const Pz = S.puz; Pz.seq = Array.from({ length: 3 + Pz.manche }, () => Math.floor(Math.random() * 4)); Pz.phase = "montre"; Pz.t = 0; Pz.i = 0; Pz.dk = -1; } }

// ------------------------------------------------------------------ la boucle
let tPrec = 0;
function boucle(t) { requestAnimationFrame(boucle); const dt = Math.min(.05, (t - (tPrec || t)) / 1000); tPrec = t; lireEntrees();
  try { maj(dt); dessine(); } catch (e) { console.error(e); } }
function maj(dt) {
  if (etat === "titre") { E.t += dt; if (IN.ok && E.t > .4) { son("bip"); nouvellePartie(); } return; }
  if (etat === "choix") { E.t += dt; const libres = ADOS.filter(a => !partie.ko.has(a.id)); if (IN.gaucheP) { E.i = (E.i + libres.length - 1) % libres.length; son("bip0"); } if (IN.droiteP) { E.i = (E.i + 1) % libres.length; son("bip0"); }
    if (T.tclic && E.zones) { /* au doigt : toucher un portrait */ }
    if (IN.ok && E.t > .3) { partie.ado = libres[E.i].id; son("bip"); const s = E.suite; s(); } return; }
  if (etat === "histoire") { E.t += dt; const ligne = E.h.l[E.i][1]; E.c = Math.min(ligne.length, E.c + dt * 45);
    if (IN.ok && E.t > .2) { if (E.c < ligne.length) E.c = ligne.length; else { E.i++; E.c = 0; E.t = 0; son("bip0"); if (E.i >= E.h.l.length) { const s = E.suite; s(); } } } return; }
  if (etat === "titreNiv") { E.t += dt; if (E.t > 2.6 || (IN.ok && E.t > .5)) { chargerScene(); } return; }
  if (etat === "fondu") { E.t += dt; if (E.t > .5 && !E.fait) { E.fait = 1; E.suite(); } return; }
  if (etat === "ko") { E.t += dt; if (E.t > 2.2) { if (partie.ko.size >= ADOS.length) { etat = "gameover"; E = { t: 0, n: 9 }; enregistreRecord(); } else allerChoix(() => { chargerScene(); }, "Qui prend la relève ?"); } return; }
  if (etat === "gameover") { E.t += dt; E.n = Math.max(0, 9 - Math.floor(E.t)); if (IN.ok && E.t > .6) { partie.ko.clear(); partie.score = Math.floor(partie.score / 2); allerChoix(() => chargerScene(), "On continue !"); } else if (E.t > 10) allerTitre(); return; }
  if (etat === "fin") { E.t += dt; if (IN.ok && E.t > 2) allerTitre(); return; }
  if (etat === "pause") { if (IN.startP) etat = "jeu"; if (IN.retourP) quitter(); return; }
  if (etat !== "jeu") return;
  if (IN.startP) { etat = "pause"; return; }
  S.t += dt; if (!S.puz) majJoueur(dt); else { J.vx = 0; J.inv = Math.max(0, J.inv - dt); } if (etat !== "jeu") return; if (!S.puz) majEnnemis(dt); majBoss(dt); majTirs(dt); majOrgue(dt);
  // ouverture de la sortie
  const F = S.fin; S.ouvert = F.type === "boss" ? S.bossMort : F.type === "orgue" ? S.orgueFait : true;
  if (S.ouvert && ((F.type === "x" && J.x > F.x) || (F.type === "xg" && J.x < F.x) || ((F.type === "boss" || F.type === "orgue") && J.x > F.x - 20 && (!S.boss || S.boss.mort > 1.2 || !S.boss)))) finScene();
  // la caméra
  const vw = LW / cam.z, vh = LH / cam.z;
  const cx = Math.max(0, Math.min(S.w - vw, J.x - vw * (J.velo ? (S.voit && S.voit.actif ? .58 : .3) : .42) + J.dir * 40)); cam.x += (cx - cam.x) * Math.min(1, dt * 5);
  if (!S.camYfixe) { const cy = Math.max(0, Math.min(S.h - vh, J.y - vh * .66)); cam.y += (cy - cam.y) * Math.min(1, dt * 4); }
}

// ------------------------------------------------------------------ le dessin
function fond(nom, a = 1) { const im = IMG[nom]; if (!im) return; const s = Math.max(LW / im.width, LH / im.height); X.save(); X.globalAlpha = a; X.drawImage(im, (LW - im.width * s) / 2, (LH - im.height * s) / 2, im.width * s, im.height * s); X.restore(); }
function dessine() {
  X.setTransform(1, 0, 0, 1, 0, 0); X.fillStyle = "#000"; X.fillRect(0, 0, LW, LH);
  if (!pret) { texte("CHARGEMENT…", LW / 2, LH / 2, { a: "center", c: "#f3c64a", t: 26 }); return; }
  if (DEBUG && PARAM.has("poses")) { X.fillStyle = "#406080"; X.fillRect(0, 0, LW, LH); const id = PARAM.get("poses") || "data", P = [["course", 0], ["course", .8], ["course", 1.6], ["course", 2.4], ["course", 3.2], ["baisse", 0], ["saut", 0], ["repos", 0]];
    P.forEach(([po, ph], k) => adoDessin(id, po, ph, 60 + k * 118, 380, 260)); return; }
  if (etat === "titre") return dTitre();
  if (etat === "choix") return dChoix();
  if (etat === "histoire") return dHistoire();
  if (etat === "titreNiv") return dTitreNiv();
  if (etat === "fin") return dFin();
  if (S) dJeu();
  if (etat === "fondu") { X.fillStyle = `rgba(0,0,0,${Math.min(1, E.t * 2)})`; X.fillRect(0, 0, LW, LH); }
  if (etat === "ko") { X.fillStyle = `rgba(0,0,0,${Math.min(.7, E.t)})`; X.fillRect(0, 0, LW, LH); texte(`${parId(partie.ado).nom} EST ÉPUISÉ !`, LW / 2, LH / 2, { a: "center", c: "#ff6a5a", t: 34 }); }
  if (etat === "gameover") { X.fillStyle = "rgba(0,0,0,.8)"; X.fillRect(0, 0, LW, LH); texte("GAME OVER", LW / 2, LH / 2 - 40, { a: "center", c: "#ff4a3a", t: 52 }); texte(`CONTINUER ?  ${E.n}`, LW / 2, LH / 2 + 20, { a: "center", c: "#fff", t: 28 }); if (Math.floor(E.t * 2) % 2) texte("INSERT COIN · APPUIE SUR A", LW / 2, LH / 2 + 70, { a: "center", c: "#f3c64a", t: 20 }); }
  if (etat === "pause") { X.fillStyle = "rgba(0,0,0,.6)"; X.fillRect(0, 0, LW, LH); texte("PAUSE", LW / 2, LH / 2 - 10, { a: "center", c: "#f3c64a", t: 46 }); texte("START : reprendre · SELECT : quitter la borne", LW / 2, LH / 2 + 34, { a: "center", t: 18 }); }
}
function dTitre() {
  fond("niv6b", .55); X.fillStyle = "rgba(0,0,0,.35)"; X.fillRect(0, 0, LW, LH);
  const lg = IMG.logo, s = Math.min(1.35, 640 / lg.width), bob = Math.sin(E.t * 2) * 6; texte("LES", LW / 2 - lg.width * s / 2 + 30, 110 + bob, { c: "#ffd34a", t: 34, bord: "#5a1a0a", ep: 6 });
  X.drawImage(lg, LW / 2 - lg.width * s / 2, 100 + bob, lg.width * s, lg.height * s);
  texte("LA CHASSE AU TRÉSOR DE WILLY LE BORGNE", LW / 2, 380, { a: "center", c: "#fff", t: 22 });
  if (Math.floor(E.t * 1.6) % 2 === 0) texte("APPUIE SUR START", LW / 2, 440, { a: "center", c: "#ffd34a", t: 30, bord: "#3a0a00", ep: 6 });
  texte(`RECORD ${String(RECORD()).padStart(7, "0")}`, LW / 2, 500, { a: "center", c: "#9fe0ff", t: 18 });
  [["mikey", 90], ["choco", 190], ["data", 770], ["bagou", 870]].forEach(([n, x], k) => sprEcran(n, 1 + Math.floor(E.t * 8 + k) % 4, x, 290 + Math.sin(E.t * 3 + k) * 3, .7, x > LW / 2));
}
function dChoix() {
  fond("niv1", .35); X.fillStyle = "rgba(0,0,0,.45)"; X.fillRect(0, 0, LW, LH);
  texte(E.msg || "CHOISIS TON GOONIE", LW / 2, 62, { a: "center", c: "#ffd34a", t: 34, bord: "#3a0a00", ep: 6 });
  const libres = ADOS.filter(a => !partie.ko.has(a.id));
  ADOS.forEach((A, k) => { const x = 120 + k * 240, y = 210, ko = partie.ko.has(A.id), sel = !ko && libres[E.i] === A;
    X.save(); if (ko) X.globalAlpha = .3; boite(x - 100, y - 110, 200, 300, .85);
    medaillon(A.id, x - 72, y - 92, 144);
    if (sel) { X.strokeStyle = "#fff"; X.lineWidth = 4; X.strokeRect(x - 104, y - 114, 208, 308); }
    texte(A.nom, x, y + 80, { a: "center", c: sel ? "#ffd34a" : "#fff", t: 26 }); texte(A.arme, x, y + 108, { a: "center", c: "#9fe0ff", t: 14 });
    sprEcran(A.id, sel ? 1 + Math.floor(E.t * 9) % 4 : 0, x, y + 150, .5); X.restore();
    if (ko) texte("ÉPUISÉ", x, y + 10, { a: "center", c: "#ff6a5a", t: 26 }); });
  const A = libres[E.i]; if (A) texte(A.desc, LW / 2, 480, { a: "center", t: 17 });
  texte("◀ ▶ pour choisir · A pour valider", LW / 2, 520, { a: "center", c: "#bbb", t: 15 });
}
function dHistoire() {
  const h = E.h, [qui, txt, illu] = h.l[E.i]; if (illu) fond(illu, 1); else { fond(h.fond, .6); X.fillStyle = "rgba(0,0,0,.25)"; X.fillRect(0, 0, LW, LH); }   // (illu : une image du film, façon borne d'arcade)
  boite(30, 340, LW - 60, 180, .85);
  const x0 = qui ? 200 : 60; if (qui) { boite(48, 356, 140, 148, 1); medaillon(qui, 54, 362, 128);
    texte({ mikey: "MIKEY", brand: "BRAND", bagou: "BAGOU", choco: "CHOCO", data: "DATA", sloth: "SLOTH", mama: "MAMA FRATELLI", jake: "JAKE FRATELLI", francis: "FRANCIS FRATELLI" }[qui] || "", x0, 380, { c: "#ffd34a", t: 20 }); }
  const vis = txt.slice(0, Math.floor(E.c)), mots = vis.split(" "), lignes = [""]; X.font = 'bold 21px "Courier New", monospace';
  for (const m of mots) { const essai = (lignes[lignes.length - 1] + " " + m).trim(); if (X.measureText(essai).width > LW - x0 - 70) lignes.push(m); else lignes[lignes.length - 1] = essai; }
  lignes.forEach((l, k) => texte(l, x0, (qui ? 414 : 390) + k * 28, { t: 21, ep: 3 }));
  if (E.c >= txt.length && Math.floor(E.t * 3) % 2) texte("▼", LW - 70, 505, { c: "#ffd34a", t: 20 });
}
function dTitreNiv() { const N = E.N;
  const im = IMG[{ 0: "niv1", 1: "ville", 2: "niv3", 3: "niv4a", 4: "niv5", 5: "niv6a" }[partie.niv]]; if (im) { const s = Math.max(LW / im.width, LH / im.height); X.globalAlpha = .5; X.drawImage(im, 0, 0, im.width * s, im.height * s); X.globalAlpha = 1; }
  boite(140, 170, LW - 280, 200, .85); texte(`NIVEAU ${partie.niv + 1}`, LW / 2, 230, { a: "center", c: "#ffd34a", t: 40, bord: "#3a0a00", ep: 6 });
  texte(N.nom, LW / 2, 285, { a: "center", t: 30 }); texte(N.but, LW / 2, 335, { a: "center", c: "#9fe0ff", t: 19 }); }
function dFin() { fond("niv6b", .7); boite(120, 120, LW - 240, 300, .85);
  texte("FIN", LW / 2, 200, { a: "center", c: "#ffd34a", t: 60, bord: "#3a0a00", ep: 8 }); texte("LES GOON DOCKS SONT SAUVÉS !", LW / 2, 260, { a: "center", t: 26 });
  texte(`SCORE  ${String(partie.score).padStart(7, "0")}`, LW / 2, 320, { a: "center", c: "#9fe0ff", t: 26 }); texte(`DOUBLONS  ${partie.pieces}`, LW / 2, 360, { a: "center", c: "#ffd34a", t: 22 });
  texte(partie.score >= RECORD() ? "NOUVEAU RECORD !" : `RECORD ${RECORD()}`, LW / 2, 400, { a: "center", c: "#ff8a6a", t: 20 }); }
function dJeu() {
  const im = IMG[S.img], vw = LW / cam.z, vh = LH / cam.z;
  if (S.par) { const pi = IMG[S.par], f = Math.max(0, (pi.width - vw) / Math.max(1, S.w - vw)); X.drawImage(pi, cam.x * f, Math.min(pi.height - vh, cam.y), vw, vh, 0, 0, LW, LH); X.fillStyle = "rgba(4,2,8,.62)"; X.fillRect(0, 0, LW, LH); }
  if (PARAM.has("plan")) { const k = Math.min(LW / S.w, LH / S.h); X.drawImage(im, 0, 0, S.w * k, S.h * k); X.lineWidth = 2;
    for (const pl of S.sol) { X.strokeStyle = pl.dur ? "#f0f" : "#0f0"; X.beginPath(); X.moveTo(pl.x0 * k, pl.y0 * k); X.lineTo(pl.x1 * k, pl.y1 * k); X.stroke(); }
    X.strokeStyle = "#0ff"; for (const e of S.ech || []) X.strokeRect(e.x0 * k, e.y0 * k, (e.x1 - e.x0) * k, (e.y1 - e.y0) * k);
    X.fillStyle = "#ff0"; for (const o of S.objets) X.fillRect(o.x * k - 2, o.y * k - 2, 4, 4);
    X.fillStyle = "#f44"; for (const e of S.ennemis) X.fillRect(e.x * k - 4, (e.y || 0) * k - 4, 8, 8); if (S.boss) { X.fillStyle = "#f80"; X.fillRect(S.boss.x * k - 6, S.boss.y * k - 12, 12, 12); }
    X.fillStyle = "#fff"; X.fillRect(S.depart[0] * k - 4, S.depart[1] * k - 8, 8, 8); return; }
  X.drawImage(im, cam.x, cam.y, vw, vh, 0, 0, LW, LH);
  if (DEBUG) { X.strokeStyle = "#0f0"; X.lineWidth = 2; for (const pl of S.sol) { X.beginPath(); X.moveTo((pl.x0 - cam.x) * cam.z, (pl.y0 - cam.y) * cam.z); X.lineTo((pl.x1 - cam.x) * cam.z, (pl.y1 - cam.y) * cam.z); X.stroke(); }
    X.strokeStyle = "#0ff"; for (const e of S.ech || []) X.strokeRect((e.x0 - cam.x) * cam.z, (e.y0 - cam.y) * cam.z, (e.x1 - e.x0) * cam.z, (e.y1 - e.y0) * cam.z); }
  const tt = S.t;
  // le bord des plateformes où l'on peut monter : un liseré clair (sur les décors d'origine, où elles se confondent avec le fond)
  if (!S.par) { X.save(); for (const pl of S.sol) { if (pl.dur) continue; const ax = (pl.x0 - cam.x) * cam.z, ay = (pl.y0 - cam.y) * cam.z, bx = (pl.x1 - cam.x) * cam.z, by = (pl.y1 - cam.y) * cam.z; if (bx < 0 || ax > LW) continue;
    X.lineCap = "round"; X.strokeStyle = "rgba(0,0,0,.75)"; X.lineWidth = 9; X.beginPath(); X.moveTo(ax, ay + 2); X.lineTo(bx, by + 2); X.stroke();
    X.strokeStyle = "rgba(255,226,140,.95)"; X.lineWidth = 4; X.beginPath(); X.moveTo(ax, ay); X.lineTo(bx, by); X.stroke(); } X.restore(); }
  // l'orgue : les touches qui s'allument
  if (S.puz) { const P = S.puz, k = P.phase === "montre" ? Math.floor(P.t / .6) : -1, n = k >= 0 && k < P.seq.length && (P.t % .6) < .45 ? P.seq[k] : P.dernier && P.phase === "joue" && P.t < .25 ? P.dernier.n : -1;
    boite(LW / 2 - 230, 70, 460, 110, .8); texte(P.phase === "montre" ? "ÉCOUTE LA MÉLODIE…" : P.phase === "faux" ? "FAUSSE NOTE ! LE SOL TREMBLE…" : P.phase === "pause" ? "BIEN JOUÉ !" : `À TOI ! (${P.i}/${P.seq.length})`, LW / 2, 100, { a: "center", c: "#ffd34a", t: 20 });
    ["▲", "▶", "▼", "◀"].forEach((s, i) => { X.fillStyle = i === n ? ["#ff5a5a", "#5aff7a", "#5aa0ff", "#ffd84a"][i] : "#2a2030"; X.fillRect(LW / 2 - 170 + i * 90, 115, 70, 52); texte(s, LW / 2 - 135 + i * 90, 152, { a: "center", t: 26 }); });
    texte(`Manche ${P.manche + 1} / 3`, LW / 2, 196, { a: "center", t: 14, c: "#ccc" }); }
  // objets
  for (const o of S.objets) { if (o.pris) continue; const yb = o.y + Math.sin(tt * 3 + o.x) * 4;
    if (o.t === "piece") spr("doublon", Math.floor(tt * 8 + o.x / 50), o.x, yb + 15);
    if (o.t === "pizza") spr("pizza", 0, o.x, yb + 18);
    if (o.t === "carte") { const sx = (o.x - cam.x) * cam.z, sy = (yb - cam.y) * cam.z, cv = IMG.carteTresor, w = 120, h = w * cv.height / cv.width; X.save(); X.translate(sx, sy); X.rotate(Math.sin(tt * 2) * .08);
      X.globalAlpha = .35 + .25 * Math.sin(tt * 4); X.fillStyle = "#ffe8a0"; X.beginPath(); X.ellipse(0, 0, w * .75, h * .8, 0, 0, 7); X.fill(); X.globalAlpha = 1;   // (elle brille)
      X.drawImage(cv, -w / 2, -h / 2, w, h); X.restore(); texte("LA CARTE !", sx, sy - h / 2 - 10, { a: "center", c: "#ffd34a", t: 16 }); } }
  // ennemis
  for (const e of S.ennemis) { const f = Math.floor(e.tm * (e.t === "chauve" || e.t === "mouette" ? 8 : 6)), al = e.mort ? Math.max(0, 1 - e.mort) : e.inv > 0 ? .5 : 1;
    if (e.t === "araignee") { X.strokeStyle = "rgba(220,220,230,.7)"; X.lineWidth = 1.5; X.beginPath(); X.moveTo((e.x - cam.x) * cam.z, (e.y0 - 200 - cam.y) * cam.z); X.lineTo((e.x - cam.x) * cam.z, (e.y - cam.y) * cam.z); X.stroke(); spr("araignee", f, e.x, e.y, false, 1, al); }
    else if (e.t === "squelette") spr("squelette", e.att > 0 ? 4 : f % 4, e.x, e.y, e.dir < 0, 1, al);
    else spr(e.t, f, e.x, e.y, e.dir < 0, 1, al); }
  // boss
  if (S.boss && (S.boss.actif || !S.boss.mort)) { const B = S.boss, al = B.mort ? Math.max(0, 1 - B.mort) : B.inv > 0 && Math.floor(tt * 20) % 2 ? .4 : 1;
    if (!B.mort || B.mort < 1.2) spr("boss_" + B.t, 0, B.x, B.y + Math.abs(Math.sin(tt * 6)) * -4, B.dir > 0, 1, al); }
  if (S.sloth) spr("boss_sloth", 0, S.sloth.x, S.boss ? S.boss.y : J.y, true);
  if (S.voit && S.voit.actif) { const vx = S.voit.x, vy = S.sol[0].y0 + 14; { const v = IMG.voitureF, sx = (vx - cam.x) * cam.z, sy = (vy - cam.y) * cam.z, w = v.width * cam.z, h = v.height * cam.z, sec = Math.sin(S.t * 30) * cam.z; X.drawImage(v, sx - w / 2, sy - h + sec, w, h); }   // (la voiture noire des Fratelli)
    }
  // le joueur
  const A = parId(partie.ado), cl = J.inv > 0 && Math.floor(tt * 16) % 2;
  if (!cl) { if (J.velo) spr("velo_" + A.id, Math.floor(J.anim), J.x, J.y + 12, J.dir < 0);
    else { let f = 0; if (J.mal > 0) f = 7; else if (J.echelle) f = 10 + Math.floor(J.anim / 2) % 2; else if (J.baisse) f = J.tirA > 0 || J.gant ? 9 : 8; else if (J.tirA > 0 || J.gant) f = 6; else if (!J.sol) f = 5; else if (Math.abs(J.vx) > 30) f = 1 + Math.floor(J.anim) % 4;
      spr(A.id, f, J.x, J.y + 4, J.dir < 0, 1.12); } }
  if (J.gant) { const G = J.gant, y = (J.y - G.h - cam.y) * cam.z, x0 = (J.x + G.dir * 26 - cam.x) * cam.z, x1 = x0 + G.dir * G.l * cam.z;
    X.strokeStyle = "#d8c050"; X.lineWidth = 3; X.beginPath(); const n = 10; for (let k = 0; k <= n; k++) { const xx = x0 + (x1 - x0) * k / n, yy = y + (k % 2 ? -7 : 7); k ? X.lineTo(xx, yy) : X.moveTo(xx, yy); } X.stroke();
    spr("gant", 0, J.x + G.dir * (26 + G.l), J.y - G.h + 14, G.dir < 0); }
  for (const t of S.tirs) { const sx = (t.x - cam.x) * cam.z, sy = (t.y - cam.y) * cam.z, m = META[t.t]; if (!m) continue; const fr = m.f[0]; X.save(); X.translate(sx, sy); X.rotate(t.rot); X.drawImage(IMG[m.img], fr[0], fr[1], fr[2], fr[3], -fr[2] * cam.z / 2, -fr[3] * cam.z / 2, fr[2] * cam.z, fr[3] * cam.z); X.restore(); }
  for (const t of S.tirsE) { const sx = (t.x - cam.x) * cam.z, sy = (t.y - cam.y) * cam.z, m = META[t.t]; if (!m) continue; const fr = m.f[0]; X.save(); X.translate(sx, sy); X.rotate(t.rot); X.drawImage(IMG[m.img], fr[0], fr[1], fr[2], fr[3], -fr[2] * cam.z / 2, -fr[3] * cam.z / 2, fr[2] * cam.z, fr[3] * cam.z); X.restore(); }
  for (const c of S.eclats) { X.fillStyle = c.c; X.globalAlpha = 1 - c.t / .8; X.fillRect((c.x - cam.x) * cam.z - 3, (c.y - cam.y) * cam.z - 3, 6, 6); } X.globalAlpha = 1;
  // la sortie ouverte : une flèche
  if (S.ouvert && S.fin.type !== "objet" && Math.floor(tt * 2) % 2 && (S.fin.type === "boss" || S.fin.type === "orgue" || Math.abs(J.x - S.fin.x) < 900)) { const vers = S.fin.type === "xg" ? "◀◀ PAR ICI" : "PAR ICI ▶▶"; texte(vers, S.fin.type === "xg" ? 30 : LW - 30, LH / 2, { a: S.fin.type === "xg" ? "left" : "right", c: "#ffd34a", t: 26 }); }
  hud();
}
function hud() {
  X.save(); X.globalAlpha = .72; X.fillStyle = "#000"; X.fillRect(0, 0, LW, 54); X.globalAlpha = 1; X.fillStyle = "#6a4a14"; X.fillRect(0, 54, LW, 2);
  ADOS.forEach((A, k) => { const x = 10 + k * 52, on = A.id === partie.ado, ko = partie.ko.has(A.id); X.globalAlpha = ko ? .3 : 1; X.fillStyle = on ? "#ffd040" : "#3a2a1a"; X.fillRect(x - 2, 4, 48, 48);
    medaillon(A.id, x, 6, 44); X.globalAlpha = 1; if (ko) texte("✕", x + 22, 38, { a: "center", c: "#ff4a3a", t: 26 }); });
  for (let k = 0; k < 3; k++) { const m = META.coeur.f[0]; X.globalAlpha = k < J.pv ? 1 : .2; X.drawImage(IMG.sprites, m[0], m[1], m[2], m[3], 226 + k * 34, 14, 28, 25); } X.globalAlpha = 1;
  texte(parId(partie.ado).nom, 336, 35, { c: "#ffd34a", t: 20 });
  const m = META.doublon.f[0]; X.drawImage(IMG.sprites, m[0], m[1], m[2], m[3], 600, 12, 30, 30); texte(`× ${partie.pieces}`, 636, 36, { t: 20 });
  texte(String(partie.score).padStart(7, "0"), 870, 36, { a: "right", c: "#ffd34a", t: 24 });
  if (!(S.boss && S.boss.actif && !S.boss.mort) && !S.puz) texte(`${partie.niv + 1}·${S.N.nom}`, 480, 74, { a: "center", c: "#fff", t: 13, ep: 3 });
  if (S.boss && S.boss.actif && !S.boss.mort) { const B = S.boss; boite(LW / 2 - 200, 82, 400, 34, .8); X.fillStyle = "#3a0a0a"; X.fillRect(LW / 2 - 120, 92, 300, 14); X.fillStyle = "#e0302a"; X.fillRect(LW / 2 - 120, 92, 300 * B.pv / B.pvMax, 14);
    texte({ francis: "FRANCIS", jake: "JAKE", mama: "MAMA" }[B.t], LW / 2 - 130, 106, { a: "right", c: "#ffd34a", t: 15 }); }
  if (S.t < 3.5 && !S.boss) texte(S.N.but, LW / 2, LH - 24, { a: "center", c: "#ffd34a", t: 18 });
  X.restore();
}
})();
