/* Kingston Falls (Gremlins) : tout le jeu — la ville sous la neige, les gremlins, le bar, la quête, l'araignée, les cinématiques et la fin.
   Ce fichier n'est pas un module à part entière : la matrice (matrice.js) le charge la première fois qu'on va à Kingston Falls et l'exécute
   chez elle (eval direct), si bien qu'il utilise tel quel tout ce qu'elle a (M, THREE, tex, voile, sonBruit, changerLieu…).
   Ce qu'il rend (la dernière expression) : les points d'entrée dont la matrice a besoin. */
/* Gremlins : on touche la jaquette — tout de suite l'écran noir, le titre, le thème ; puis le noir s'efface sur Kingston Falls ravagée :
   la caméra survole la ville, descend dans les rues, passe la porte de Dorry's Tavern et vient jusqu'à Gizmo, dans son coin ; à nous de jouer */
function introGremlins() { if (!M || M.cine) return; if (universOccupe("kingston")) { refusUnivers("kingston"); return; }
  const moi = M.gens.get(M.moiNum); if (moi) { moi.cible = null; moi.chemin = []; }
  if (!document.getElementById("styleKF")) { const st = document.createElement("style"); st.id = "styleKF"; st.textContent = "@keyframes kfTitre{0%{opacity:0;transform:scale(.7) rotate(-3deg)}25%{opacity:1;transform:scale(1.04) rotate(1deg)}40%{transform:scale(1) rotate(0)}100%{opacity:1;transform:scale(1.08)}}"; document.head.appendChild(st); }
  const d = document.createElement("div"); d.style.cssText = "position:absolute;inset:0;z-index:9;background:#000;display:flex;align-items:center;justify-content:center;transition:opacity 1.4s;pointer-events:none";
  d.innerHTML = '<img src="images/gremlins/titre.webp" alt="Gremlins" style="width:min(78%,720px);animation:kfTitre 4.5s ease-out forwards;filter:drop-shadow(0 0 24px rgba(255,40,20,.45))">';
  M.ctx.conteneur.appendChild(d); M.kfVoile = d; musiqueLB("kf");
  { const f = new Audio("sons/kf-titre.mp3?v=1"); f.volume = .9; f.play().catch(() => {}); M.kfFanfare = f; M.kfTitreT0 = performance.now();
    const g = setInterval(() => { if (f.paused) return clearInterval(g); if (!M || (M.lieu !== "kingston" && performance.now() - (M.kfTitreT0 || 0) > 5000)) { f.pause(); clearInterval(g); } }, 1000); }   // (on quitte Kingston Falls : elle se tait)   // (la fanfare, dès le titre ; elle accompagne le survol de la ville, et s'efface en entrant dans le bar)
  M.cine = { maj: () => {} };
  setTimeout(() => { if (!M) { d.remove(); return; } finCine(); M.kfIntro = true; changerLieu("kingston", [-33.7, -5.8], Math.PI / 2); }, 900); }   // (la ville se charge pendant le titre)
// la petite boule de poils (un mogwaï tout neuf, roulé en boule, les oreilles repliées sur le dos) : un corps doux, des milliers de petits poils couchés vers l'arrière
function creerBouleKF(B) { const V3 = THREE.Vector3;
  const poil = tex(toile(256, 128, x => { const g = x.createLinearGradient(0, 0, 0, 128); g.addColorStop(0, "#6a4424"); g.addColorStop(.55, "#8a5a32"); g.addColorStop(1, "#efe4d0"); x.fillStyle = g; x.fillRect(0, 0, 256, 128);
    for (let k = 0; k < 4000; k++) { const a = Math.random() * 256, b = Math.random() * 128; x.strokeStyle = b > 80 && Math.random() < .7 ? "#fbf4e6" : Math.random() < .5 ? "#3e2614" : "#b48654"; x.globalAlpha = .45; x.lineWidth = .8; x.beginPath(); x.moveTo(a, b); x.lineTo(a + (Math.random() - .5) * 3, b + 2 + Math.random() * 5); x.stroke(); } }));
  const mP = new THREE.MeshStandardMaterial({ map: poil, roughness: 1, emissive: 0x3a2412, emissiveIntensity: .7 }), corps = new THREE.Mesh(new THREE.SphereGeometry(.15, 32, 20), mP); corps.scale.set(1, .78, 1.12); corps.position.y = .115; B.add(corps);
  { const N = 1600, im = new THREE.InstancedMesh(new THREE.ConeGeometry(.0045, .03, 3).translate(0, .015, 0), new THREE.MeshStandardMaterial({ roughness: 1, emissive: 0x2a1a0e }), N), m = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new V3(0, 1, 0), c = new V3(), col = new THREE.Color();
    for (let k = 0; k < N; k++) { const n = new V3().randomDirection(); if (n.y < -.2) n.y = -n.y * .2; n.normalize(); const p = n.clone().multiply(new V3(.148, .115, .166)).add(new V3(0, .115, 0));
      const t = new V3(0, .3, -1).projectOnPlane(n).normalize(); q.setFromUnitVectors(up, n.clone().multiplyScalar(.35).add(t).normalize());   // (couchés le long du corps, vers l'arrière)
      m.compose(p, q, new V3(1, .7 + Math.random() * .7, 1)); im.setMatrixAt(k, m); im.setColorAt(k, col.set(n.y < .25 ? 0xf6eee0 : Math.random() < .2 ? 0xe9dcc6 : Math.random() < .5 ? 0x5c3a1e : 0x9a6a3e)); }
    B.add(im); }
  return [-1, 1].map(s => { const o = new THREE.Mesh(new THREE.SphereGeometry(.1, 20, 12), mP); o.scale.set(.55, .16, 1.25); o.position.set(s * .075, .2, -.04); o.rotation.set(-.45, s * .35, s * .5); B.add(o); return o; }); }   // (les grandes oreilles repliées sur le dos, comme dans le film)
// le survol de la ville (au début, et à la fin) : le chemin de la caméra, et ce qu'elle regarde
const KF_SURVOL_P = [[2, 28, 44], [-6, 20, 31], [-12, 14.5, 22.5], [-18, 6.5, 15], [-20, 3.2, 12.5], /* (au-dessus des toits de la rangée sud, jamais au travers) */ [-21, 2.6, 2], [-22, 2.2, -8], [-25.4, 1.7, -9.5], [-28.6, 1.5, -9.4], [-31.2, 1.25, -7.8], [-32.4, .95, -6.6]];
const KF_SURVOL_C = [[0, 4, 4], [-4, 3, 10], [-10, 2, 12], [-26.5, 1.4, 10.8], [-27, 2.2, -2], [-27.5, 1.8, -9.5], [-30, 1.4, -9.5], [-33, .8, -7], [-33.7, .4, -5.8], [-33.7, .35, -5.8]];
function cineKingston() { if (!M) return; const d = M.kfVoile; M.kfVoile = null; const V3 = THREE.Vector3;
  const P = new THREE.CatmullRomCurve3(KF_SURVOL_P.map(a => new V3(...a)), false, "centripetal"), C = new THREE.CatmullRomCurve3(KF_SURVOL_C.map(a => new V3(...a)), false, "centripetal");
  const D = 12500, EM = .74, vise = new V3(); let fini = false, t0 = Infinity; M.kfSurvol = true; if (M.L) M.L.silenceKF = true;   // (EM : on s'arrête devant le bar, sans aller jusqu'à Gizmo)
  // l'écran noir et le titre restent tant que la ville se charge (les modèles, puis la préparation de tous les matériaux par la carte graphique) : sinon, ça saccade
  M.camera.position.copy(P.getPointAt(0)); M.camera.lookAt(C.getPointAt(0));
  const attente = Promise.race([Promise.allSettled(KF_ATTENTES.slice()), new Promise(r => setTimeout(r, 6000))])
    .then(() => M && M.rendu.compileAsync ? Promise.race([M.rendu.compileAsync(M.scene, M.camera).catch(() => {}), new Promise(r => setTimeout(r, 2500))]) : null)
    .then(() => new Promise(r => setTimeout(r, Math.max(0, (M && M.kfTitreT0 || 0) + 9800 - performance.now()))));   // (le titre reste au moins 10 secondes, sur la fanfare)
  attente.then(() => new Promise(r => setTimeout(r, 200))).then(() => { if (!M || fini) return; t0 = performance.now() + 600; if (d) { d.style.opacity = "0"; setTimeout(() => d.remove(), 1500); } });
  const fin = () => { if (fini) return; fini = true; M.kfSurvol = false; if (d && d.parentNode) d.remove(); billyKF(); };
  M.cine = { maj: () => { if (t0 === Infinity) { M.camera.position.copy(P.getPointAt(0)); M.camera.lookAt(C.getPointAt(0)); return; } const u = Math.max(0, Math.min(1, (performance.now() - t0) / D)), e = EM * u * u * (3 - 2 * u); M.camera.position.copy(P.getPointAt(e)); vise.copy(C.getPointAt(e)); M.camera.lookAt(vise); M.camera.fov = 58; M.camera.updateProjectionMatrix(); if (u >= 1) fin(); } };
  M.cine.passer = fin; }
// Billy confie Gizmo au bar : la photo, et ce qu'il lui dit, en dessous, ligne à ligne
const BILLY_KF = [
  ["Billy", "Gizmo… écoute-moi bien."],
  ["Billy", "Dehors, c'est le chaos. Il y a des monstres partout dans Kingston Falls."],
  ["Billy", "Toi, tu restes ici, bien caché. Pas question que je te mette en danger."],
  ["Billy", "Moi, je vais au générateur, au pied de l'antenne radio, devant le tribunal : il commande les lampes UV de la ville. Ils ne supportent pas la lumière."],
  ["Billy", "Tiens, je te laisse cette oreillette. Je te tiendrai au courant."],
  ["Gizmo", "Billy… prudent !"]];
// la radio (l'oreillette que Billy a laissée à Gizmo), comme à Resident Evil : la sonnerie, puis l'écran — Billy à gauche, Gizmo à droite ; celui qui parle s'éclaire.
// radioKF([["billy", "…"], ["gizmo", "…"]]) : les répliques passent l'une après l'autre ; un appel qui arrive pendant un autre attend son tour
function radioKF(lignes) { if (!M || !M.ctx || !M.ctx.conteneur) return; (M.radioKFfile = M.radioKFfile || []).push(lignes); if (M.radioKFen) return;
  const suivant = () => { const L2 = M && M.radioKFfile && M.radioKFfile.shift(); if (!L2) { if (M) M.radioKFen = false; return; } M.radioKFen = true; bipRadio();
    setTimeout(() => { if (!M) return; const el = document.createElement("div"); const large = innerWidth > innerHeight; el.style.cssText = "position:absolute;left:50%;bottom:" + (large ? "8px" : "calc(215px + env(safe-area-inset-bottom))") + ";transform:translateX(-50%);width:" + (large ? "min(52%,560px)" : "min(94%,560px)") + ";z-index:11;pointer-events:none;background:linear-gradient(180deg,rgba(10,22,8,.94),rgba(4,10,4,.94));border:2px solid #6fd23a;border-radius:10px;padding:10px 12px 12px;box-shadow:0 0 18px rgba(110,220,60,.4);font-family:'Lato',Arial,sans-serif;animation:codecIn .25s ease-out";
      if (!document.getElementById("styleCodec")) { const st = document.createElement("style"); st.id = "styleCodec"; st.textContent = "@keyframes codecIn{from{opacity:0;transform:translateX(-50%) scaleY(.1)}to{opacity:1;transform:translateX(-50%) scaleY(1)}}"; document.head.appendChild(st); }
      const port = (q, img) => `<div data-q="${q}" style="position:relative;width:22%;aspect-ratio:5/6;border:3px solid #3f8a2a;border-radius:6px;overflow:hidden;background:#071407;transition:filter .2s,opacity .2s"><img src="${img}" alt="" style="width:100%;height:100%;object-fit:cover;display:block"><canvas width="40" height="48" style="position:absolute;inset:0;width:100%;height:100%;opacity:0;image-rendering:pixelated"></canvas></div>`;
      el.innerHTML = `<div style="display:flex;align-items:center;justify-content:space-between;gap:3%">${port("billy", "images/gremlins/radio-billy.webp?v=1")}
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:5px"><div style="color:#8fe36a;font:700 10px Arial;letter-spacing:.3em">OREILLETTE</div>
          <div style="display:flex;align-items:flex-end;gap:8px;background:#061206;border:2px solid #3f8a2a;padding:5px 9px;border-radius:4px"><div class="rb" style="display:flex;align-items:flex-end;gap:2px;height:28px">${[...Array(7)].map((_, i) => `<i style="display:block;width:4px;height:${6 + i * 3.4}px;background:#9dff6a;opacity:.25"></i>`).join("")}</div>
          <div style="color:#9dff6a;font:700 24px 'Courier New',monospace;text-shadow:0 0 8px rgba(150,255,110,.8)">104.5</div></div><div style="color:#8fe36a;font:700 9px Arial;letter-spacing:.25em">KINGSTON FALLS</div></div>
        ${port("gizmo", "images/gremlins/radio-gizmo.webp?v=1")}</div><div class="rt" style="margin-top:9px;min-height:2.9em;color:#fff4d8;font:15px/1.4 'Lato',Arial;text-shadow:0 1px 2px #000"></div>`;
      M.ctx.conteneur.appendChild(el); M.radioKFel = el; const txt = el.querySelector(".rt"), barres = [...el.querySelectorAll(".rb i")]; let parle = false, fx = "";
      const pB = el.querySelector('[data-q="billy"]'), imB = pB.querySelector("img"), cv = pB.querySelector("canvas"), cx = cv.getContext("2d"), px = cx.createImageData(40, 48);
      const anim = setInterval(() => { if (!el.isConnected) return clearInterval(anim); const k = parle ? 2 + Math.floor(Math.random() * 6) : 1; barres.forEach((b, i) => b.style.opacity = i < k ? (fx ? Math.random() : 1) : .2);
        // le brouillage : l'image de Billy saute, se déchire, la neige passe dessus ; signal perdu : plus que la neige
        if (fx) { for (let j = 0; j < px.data.length; j += 4) { const v = Math.random() * 255; px.data[j] = px.data[j + 1] = px.data[j + 2] = v; px.data[j + 3] = 255; } cx.putImageData(px, 0, 0);
          cv.style.opacity = fx === "coupe" ? 1 : (Math.random() < .35 ? .85 : .25 + Math.random() * .3); imB.style.transform = `translate(${(Math.random() - .5) * 14}px,${(Math.random() - .5) * 4}px) skewX(${(Math.random() - .5) * 18}deg)`; imB.style.filter = `hue-rotate(${Math.random() * 90}deg) contrast(1.6)`; }
        else { cv.style.opacity = 0; imB.style.transform = imB.style.filter = ""; } }, 80);
      let i = 0; const ligne = () => { if (!M || !el.isConnected) { M && (M.radioKFen = false); return; } if (i >= L2.length) { el.remove(); clearInterval(anim); if (L2.onFin) setTimeout(L2.onFin, 400); setTimeout(suivant, 900); return; }
        const [q, t, f] = L2[i++]; fx = f || (fx === "coupe" ? "coupe" : ""); if (f) sonBruit(f === "coupe" ? 1.2 : .6, f === "coupe" ? 5000 : 2600, f === "coupe" ? .3 : .16);   /* (une fois coupé, Billy ne revient pas dans cet appel) */
        for (const p of el.querySelectorAll("[data-q]")) { const on = p.dataset.q === q; p.style.filter = on ? "none" : "brightness(.6)";   /* (celui qui écoute : un peu assombri, mais en couleurs) */ p.style.borderColor = on ? "#9dff6a" : "#2a4a22"; }
        txt.innerHTML = f === "coupe" ? `<i style="color:#9dff6a;letter-spacing:.2em">${esc(t)}</i>` : `<b style="color:${q === "billy" ? "#ffcf5a" : "#9fe0ff"}">${q === "billy" ? "Billy" : "Gizmo"}</b> : ${esc(t)}`; parle = f !== "coupe"; const d = Math.min(6000, 1600 + t.length * 45);
        setTimeout(() => { parle = false; }, Math.min(d - 300, 500 + t.length * 38)); setTimeout(ligne, d); };
      ligne(); }, 700); };
  suivant(); }
// couper l'appel en cours (Passer) : la file est vidée, l'écran de la radio disparaît
function couperRadioKF() { if (!M) return; M.radioKFfile = []; if (M.radioKFel) M.radioKFel.remove(); M.radioKFel = null; M.radioKFen = false; }
// les messages du jeu, à la manière du film : les grosses lettres rouges cernées de noir, qui sautent à l'écran, sur un cadre vert de gremlin
function msgKF(titre, texte, ms = 4800) { if (!M || !M.ctx || !M.ctx.conteneur) return;
  if (!document.getElementById("styleMsgKF")) { const st = document.createElement("style"); st.id = "styleMsgKF"; st.textContent = "@font-face{font-family:'Luckiest Guy';src:url(fonts/LuckiestGuy.ttf) format('truetype');font-display:swap}"
    + "@keyframes kfPop{0%{transform:translateX(-50%) scale(.3) rotate(-8deg);opacity:0}55%{transform:translateX(-50%) scale(1.12) rotate(2deg);opacity:1}75%{transform:translateX(-50%) scale(.96) rotate(-1.5deg)}100%{transform:translateX(-50%) scale(1) rotate(-1.5deg)}}"; document.head.appendChild(st); }
  const old = M.kfMsg; if (old) old.remove();
  const d = document.createElement("div"); d.style.cssText = "position:absolute;left:50%;top:14%;z-index:12;max-width:min(88%,620px);padding:12px 22px 14px;text-align:center;pointer-events:none;background:radial-gradient(ellipse at 50% 0%,rgba(40,70,20,.95),rgba(8,14,6,.95));border:3px solid #6fd23a;border-radius:18px 6px 18px 6px;box-shadow:0 0 22px rgba(110,220,60,.55),inset 0 0 18px rgba(0,0,0,.7);animation:kfPop .55s ease-out forwards;transition:opacity .6s;font-family:'Luckiest Guy','Lato',sans-serif";
  d.innerHTML = `<div style="font-size:clamp(24px,5vw,40px);line-height:1.05;color:#ff2a1a;letter-spacing:.04em;-webkit-text-stroke:2px #000;text-shadow:3px 3px 0 #000,0 0 14px rgba(255,40,20,.6)">${titre}</div>`
    + (texte ? `<div style="margin-top:6px;font-size:clamp(14px,2.6vw,19px);line-height:1.25;color:#fff4d8;letter-spacing:.03em;text-shadow:2px 2px 0 #000">${texte}</div>` : "");
  M.ctx.conteneur.appendChild(d); M.kfMsg = d; setTimeout(() => { d.style.opacity = "0"; setTimeout(() => d.remove(), 700); }, ms); }

const vidKF = src => { const v = document.createElement("video"); v.playsInline = true; v.preload = "auto";
  v._pret = videoLocale(src, src.split("?")[0] + "|" + (src.split("?")[1] || "")).then(u => { v.src = u; v.load(); }, () => { v.src = src; v.load(); }); return v; };   // (téléchargée en entier, puis lue depuis l'appareil)
const lancerV = v => (v._pret || Promise.resolve()).then(() => v.play());   // (on attend qu'elle soit là pour la lancer)   // (chargées dès la photo de Billy : elles sont prêtes quand vient leur tour)
const couperFanfareKF = () => { const f = M && M.kfFanfare; if (!f) return; M.kfFanfare = null; { const v0 = f.volume, t0 = performance.now(), i = setInterval(() => { const u = Math.min(1, (performance.now() - t0) / 1500); f.volume = v0 * (1 - u); if (u >= 1) { clearInterval(i); f.pause(); } }, 50); } };   // (la fanfare s'efface : la télé prend le relais)
const MALLE_ROT = Math.PI / 2;   // (l'orientation de la malle : son couvercle sur le côté — il ne cache Gizmo ni de face ni de dos)
function billyKF() { if (!M) return;
  M.kfMalleP = (async () => { gltfMod = gltfMod || await import("./vendor/GLTFLoader.js?v=1"); return new gltfMod.GLTFLoader().loadAsync("avatars/kingston/malle.glb?v=1"); })().catch(e => console.warn("malle", e));   // (la malle de Resident Evil, où se cache Gizmo)
  M.kfVids = { tv: vidKF("videos/kf-rambo3-passage.mp4?v=1") };
  const d = document.createElement("div"); d.style.cssText = "position:absolute;inset:0;z-index:9;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:16px;box-sizing:border-box;opacity:0;transition:opacity .7s;cursor:pointer";
  d.innerHTML = '<img src="images/gremlins/billy.webp" alt="Billy et Gizmo" style="max-width:min(94%,820px);max-height:58%;object-fit:contain;border-radius:6px;box-shadow:0 0 40px rgba(0,0,0,.8)">'
    + '<div style="width:min(94%,820px);min-height:4.4em;background:rgba(14,10,6,.92);border:2px solid #b8862e;border-radius:10px;padding:10px 16px;box-sizing:border-box;color:#fff;font:600 clamp(15px,2.4vw,20px)/1.4 \'Lato\',sans-serif"><b class="qui"></b> <span class="txt"></span></div>';
  M.ctx.conteneur.appendChild(d); requestAnimationFrame(() => { d.style.opacity = "1"; });
  const qui = d.querySelector(".qui"), txt = d.querySelector(".txt"); let i = -1, tape = null, auto = null, fini = false;
  const fin = () => { if (fini) return; fini = true; clearInterval(tape); clearTimeout(auto); finCine(); tvKF(d); };
  const pause = t => 900 + t.length * 22;
  const suivant = () => { if (fini) return; clearInterval(tape); clearTimeout(auto); i++; if (i >= BILLY_KF.length) return fin();
    const [n, t] = BILLY_KF[i]; qui.textContent = n + " :"; qui.style.color = n === "Gizmo" ? "#9fe0ff" : "#ffcf5a"; let k = 0; txt.textContent = "";
    tape = setInterval(() => { k += 2; txt.textContent = t.slice(0, k); if (k >= t.length) { clearInterval(tape); auto = setTimeout(suivant, pause(t)); } }, 22); };
  d.onclick = () => { const t = i >= 0 && BILLY_KF[i] && BILLY_KF[i][1]; if (t && txt.textContent.length < t.length) { clearInterval(tape); txt.textContent = t; clearTimeout(auto); auto = setTimeout(suivant, pause(t)); } else suivant(); };   // (une touche : la phrase entière, puis la suivante)
  M.cine = { maj: () => {}, passer: fin }; M.passerBtn = boutonPasser(fin); setTimeout(suivant, 700); }
// la cinématique de la télé : gros plan sur Gizmo qui regarde la télé du bar (sa lumière qui vacille sur lui) ; la caméra glisse jusqu'à l'écran… Rambo III, la flèche explosive ;
// puis Gizmo se prépare comme Rambo (la scène de Gremlins 2) — et la partie commence, avec son arc et son bandana.
// Pendant les vidéos, la ville n'est plus dessinée derrière : elles passent sans à-coups.
function tvKF(voileB) { if (!M || M.lieu !== "kingston") { if (voileB) voileB.remove(); return; } const L = M.L, moi = M.gens.get(M.moiNum), T = tvBarKF, V = M.kfVids || { tv: vidKF("videos/kf-rambo3-passage.mp4?v=1") };
  L.gizmoRambo = false;   // (ni arc ni bandana tant qu'il n'a pas vu Rambo)
  const n = T ? T.n : new THREE.Vector3(.74, 0, .67).normalize(), c = T ? T.c : new THREE.Vector3(-31.85, 2.13, -10.53), V3 = THREE.Vector3;
  const gx = c.x + n.x * 2.1, gz = c.z + n.z * 2.1; if (moi) { moi.cible = null; moi.chemin = []; moi.g.position.x = gx; moi.g.position.z = gz; }
  const yDos = Math.atan2(n.x, n.z), yTv = Math.atan2(-n.x, -n.z);   // (d'abord le dos à la télé ; le son le fait se retourner)
  M.yaw = Math.atan2(n.x, n.z); L.orienterGizmo && L.orienterGizmo(yDos);
  // à côté de Gizmo, une malle (celle de Resident Evil, à sa taille), ouverte — comme sa boîte à outils avec Billy
  (M.kfMalleP || Promise.resolve(null)).then(g => { if (!g || !M || M.L !== L || L.malleKF) return; const o = g.scene, bb = new THREE.Box3().setFromObject(o), c = bb.getCenter(new THREE.Vector3()), k = .58 / Math.max(bb.max.x - bb.min.x, bb.max.z - bb.min.z);
    const w = new THREE.Group(), inner = new THREE.Group(); o.position.set(-c.x, -bb.min.y, -c.z); inner.add(o); inner.scale.setScalar(k); w.add(inner); w.position.set(gx + sx * .62, (moi ? moi.g.position.y : .12) - .01, gz + sz * .62); w.rotation.y = yDos + MALLE_ROT; /* (posée à côté de lui, du côté où il y a de la place) */ M.scene.add(w); L.malleKF = w; });
  const mus = M.lbMus && M.lbMus.a; if (mus) mus.pause(); couperFanfareKF();   // (la fanfare s'efface : c'est le son de la télé qu'on entend, Rambo III)
  const tv = V.tv; tv.loop = false; tv.currentTime = 0; tv.muted = false; tv.volume = .9; const demarrerTV = () => lancerV(tv).catch(() => { tv.muted = true; lancerV(tv).catch(() => {}); });   // (après l'appel de Billy)
  if (T) { const vt = new THREE.VideoTexture(tv); vt.colorSpace = THREE.SRGBColorSpace; T.ecran.material.map = vt; T.ecran.material.color.set(0xffffff); T.ecran.material.needsUpdate = true; }
  L.tvLueur = t => etape === -1 ? .12 : .22 + .2 * Math.abs(Math.sin(t / 97) * Math.sin(t / 233 + 1));   // (la lumière de l'écran qui vacille sur son visage)
  setTimeout(() => { if (voileB) { voileB.style.opacity = "0"; setTimeout(() => voileB.remove(), 800); } }, 200);
  const gy = () => (moi ? moi.g.position.y : .12); let sx = -n.z, sz = n.x;   // (sx, sz : sur le côté — celui où aucun mur ne gêne la caméra)
  try { const rc = new THREE.Raycaster(), o = new V3(gx, gy() + .25, gz); rc.camera = M.camera; let best = -1, bs = 1; for (const sg of [1, -1]) { const dir = new V3(-n.x * .35 + sx * sg, 0, -n.z * .35 + sz * sg).normalize(); rc.set(o, dir); rc.far = 3; const h = rc.intersectObjects(M.scene.children, true).find(q => q.object.isMesh && !q.object.isSprite && q.object.visible && !q.object.isInstancedMesh); const d = h ? h.distance : 3; if (d > best) { best = d; bs = sg; } } sx *= bs; sz *= bs; } catch (e) {}
  const A0 = new V3(), A1 = new V3(), vise = new V3(); let etape = -1, t0 = performance.now(), fini = false, ecranD = null, ramboD = null, appel = false;
  // d'abord, l'appel de Billy dans l'oreillette : il aura du retard, la ville est K.O.… et l'image se brouille, la liaison coupe. Gizmo reste seul — puis le son de la télé
  const entrer0 = () => { if (etape !== -1 || fini) return; etape = 0; t0 = performance.now(); demarrerTV(); };
  const appelBilly = () => { appel = true; const l = [["billy", "Gizmo ? C'est Billy… tu m'entends ?"], ["gizmo", "Billy !"],
      ["billy", "Je vais avoir du retard… La ville, c'est le K.O. : ils sont partout, ils ont coupé les routes…", "brouille"],
      ["billy", "Il faudrait allumer les lampes UV du générateur… mais sa grille est fermée par une chaîne, et la pince coupante de M. Futterman est tombée quelque part dans la rue…", "brouille"],
      ["billy", "Attends… qu'est-ce que… Non ! Ils sont sur le capot ! Kssshh… Gizmo, reste cach—", "brouille"], ["billy", "— SIGNAL PERDU —", "coupe"], ["gizmo", "Billy… ? BILLY !"]];
    l.onFin = () => setTimeout(entrer0, 900); M.radioKFfile = []; radioKF(l); };
  const plan = (u, a, b, va, vb) => { M.camera.position.lerpVectors(a, b, u); vise.lerpVectors(va, vb, u); M.camera.lookAt(vise); };
  M.cine = { fov: [42, 55], maj: () => { const u = performance.now() - t0, y = gy();
    if (etape === -1) {   // gros plan sur Gizmo, seul, le dos à la télé éteinte : l'oreillette sonne
      const k = Math.min(1, u / 14000), e = k * k * (3 - 2 * k); if (u > 1300 && !appel) appelBilly();
      plan(e, A0.set(gx - n.x * .7 + sx * .12, y + .27, gz - n.z * .7 + sz * .12), A1.set(gx - n.x * .46 + sx * .06, y + .25, gz - n.z * .46 + sz * .06), new V3(gx, y + .24, gz), new V3(gx, y + .26, gz)); }   // (de face : son visage inquiet)
    else if (etape === 0) {   // Gizmo, seul dans le bar, le dos à la télé ; le son de la télé part… il se retourne
      const k = Math.min(1, u / 3600), e = k * k * (3 - 2 * k), r = Math.max(0, Math.min(1, (u - 1100) / 900)), rr = r * r * (3 - 2 * r);
      let dy = yTv - yDos; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); L.orienterGizmo && L.orienterGizmo(yDos + dy * rr);
      plan(e, A0.set(gx + n.x * .8 + sx * .2, y + .26, gz + n.z * .8 + sz * .2), A1.set(gx + n.x * .6 + sx * .14, y + .24, gz + n.z * .6 + sz * .14), new V3(gx, y + .24, gz), new V3(gx, y + .25, gz));
      if (u > 3600) { etape = .5; t0 = performance.now(); } }
    else if (etape === .5) {   // gros plan, de face : les yeux levés vers l'écran
      const k = Math.min(1, u / 3600), e = k * k * (3 - 2 * k); L.orienterGizmo && L.orienterGizmo(yTv);
      plan(e, A0.set(gx - n.x * .55 + sx * .16, y + .2, gz - n.z * .55 + sz * .16), A1.set(gx - n.x * .4 + sx * .1, y + .23, gz - n.z * .4 + sz * .1), new V3(gx, y + .25, gz), new V3(gx, y + .27, gz));   // (entre lui et le comptoir)
      if (u > 3600) { etape = 1; t0 = performance.now(); } }
    else if (etape === 1) {   // par-dessus ses oreilles, la caméra glisse vers la télé, jusqu'à l'écran
      const k = Math.min(1, u / 3200), e = k * k * (3 - 2 * k);
      plan(e, A0.set(gx + n.x * .5, y + .42, gz + n.z * .5), A1.set(c.x + n.x * .38, c.y, c.z + n.z * .38), new V3(c.x, c.y, c.z), new V3(c.x, c.y, c.z));
      if (u > 2700 && !ecranD) ecranD = ecranTV(); }
    else if (etape === 3) { const mo = moi && moi.g.position; majAtelier(u, y);
      if (u < 3200) { let dy = yFace - yTv; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); const r = Math.max(0, Math.min(1, (u - 600) / 800)); L.orienterGizmo && L.orienterGizmo(yTv + dy * r * r * (3 - 2 * r));   // (il se retourne : il les a vus)
        M.camera.position.set(gx - n.x * .35 - sx * .55, y + .62, gz - n.z * .35 - sz * .55); vise.set(Pob.x, y + .03, Pob.z); }   // (par-dessus son épaule : les objets, par terre, qui brillent)
      else if (u < 5800) { const k = (u - 3200) / 2600, e = k * k * (3 - 2 * k); if (mo) { mo.x = gx + (Wk.x - gx) * e; mo.z = gz + (Wk.z - gz) * e; }   // (il y va)
        M.camera.position.set((gx + Wk.x) / 2 - sx * 1.1 + n.x * .25, y + .55, (gz + Wk.z) / 2 - sz * 1.1 + n.z * .25); vise.set((gx + Wk.x) / 2 + n.x * .2, y + .12, (gz + Wk.z) / 2 + n.z * .2); }   // (de profil, du côté libre — la malle est de l'autre)
      else if (u < 12800) { L.gizmoTravail = true; L.orienterGizmo && L.orienterGizmo(yFace); if (mo) { mo.x = Wk.x; mo.z = Wk.z; }   // (de dos : il bricole)
        const k = (u - 5800) / 7000; M.camera.position.set(Wk.x - n.x * (.6 - .1 * k) - sx * .3, y + .66 - .06 * k, Wk.z - n.z * (.6 - .1 * k) - sz * .3); vise.set(Wk.x + n.x * .14, y + .14, Wk.z + n.z * .14); }   // (de dos, un peu de haut : on voit ce qu'il a dans les mains)
      else { if (L.gizmoRambo === false) { L.gizmoRambo = true; L.gizmoTravail = false; accord(); const w = voile("background:#fff;opacity:.7;transition:opacity .7s"); if (w) { requestAnimationFrame(() => requestAnimationFrame(() => { w.style.opacity = "0"; })); setTimeout(() => w.remove(), 800); } }   // (le voilà : bandeau, arc, allumette)
        const k = Math.min(1, (u - 12800) / 4200); M.camera.position.set(Wk.x + n.x * (.9 - .25 * k) + sx * .12, y + .26, Wk.z + n.z * (.9 - .25 * k) + sz * .12); vise.set(Wk.x, y + .24, Wk.z); if (u > 17500) fin(); }
      M.camera.lookAt(vise); } } };
  // la fabrication de l'arc (à la place de la vidéo) : par terre, devant lui, un trombone, un élastique, une allumette ; il les voit, il y va ; de dos, penché, il bricole —
  // chaque objet monte vers ses mains et disparaît (le trombone grince, l'élastique claque, l'allumette craque) ; puis de face : le bandeau, l'arc bandé, l'allumette — et la musique
  let atl = null; const Pob = new V3(gx + n.x * .68, 0, gz + n.z * .68), Wk = new V3(gx + n.x * .42, 0, gz + n.z * .42), yFace = Math.atan2(n.x, n.z);
  const atelier = () => { const g = new THREE.Group(), y = gy(), acier = new THREE.MeshStandardMaterial({ color: 0xd8dde4, metalness: .9, roughness: .25 });
    const pts = [[-.03, .045], [.06, .045], [.075, .03], [.075, .015], [.06, 0], [-.06, 0], [-.075, .015], [-.075, .03], [-.06, .045], [-.05, .04], [-.045, .03], [-.045, .018], [-.03, .012], [.045, .012]].map(([a, b]) => new THREE.Vector3(a, b, 0));   // (le trombone : ses boucles)
    const clip = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, .008, 6), acier); clip.rotation.x = -Math.PI / 2; clip.position.set(Pob.x - n.z * .11, y + .04, Pob.z + n.x * .11); g.add(clip);
    const elas = new THREE.Mesh(new THREE.TorusGeometry(.04, .009, 8, 24), new THREE.MeshStandardMaterial({ color: 0xff5a1a, roughness: .6 })); elas.rotation.x = -Math.PI / 2; elas.position.set(Pob.x, y + .04, Pob.z); g.add(elas);
    const allu = new THREE.Group(); { const b = new THREE.Mesh(new THREE.BoxGeometry(.008, .008, .12), new THREE.MeshStandardMaterial({ color: 0xe8d2a0, roughness: .8 })); allu.add(b); const t2 = new THREE.Mesh(new THREE.SphereGeometry(.009, 8, 6), new THREE.MeshStandardMaterial({ color: 0xb01810, roughness: .5 })); t2.scale.set(1, 1, 1.4); t2.position.z = .064; allu.add(t2); }
    allu.position.set(Pob.x + n.z * .11, y + .035, Pob.z - n.x * .11); allu.rotation.y = yFace + .6; g.add(allu);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: L.halos ? L.halos.material.map : null, color: 0xfff2c0, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); halo.position.set(Pob.x, y + .05, Pob.z); halo.scale.setScalar(.35); g.add(halo);
    const eclats = []; for (let k = 0; k < 8; k++) { const e2 = new THREE.Sprite(new THREE.SpriteMaterial({ map: halo.material.map, color: 0xffffff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); e2.scale.setScalar(.06); g.add(e2); eclats.push(e2); }
    for (const o of [clip, elas, allu]) { o.scale.multiplyScalar(2.5); o.traverse(m => { if (m.isMesh) { m.material = m.material.clone(); m.material.emissive = m.material.color.clone().multiplyScalar(.7); } }); }   // (plus gros que nature : qu'on les voie bien)
    M.scene.add(g); atl = { g, objs: [clip, elas, allu], halo, eclats, y, sons: 0 }; };
  const sonTwang = (f0, d) => { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); const o = actx.createOscillator(), gn = actx.createGain(), t1 = actx.currentTime; o.type = "triangle"; o.frequency.setValueAtTime(f0, t1); o.frequency.exponentialRampToValueAtTime(f0 * .55, t1 + d); gn.gain.setValueAtTime(.18, t1); gn.gain.exponentialRampToValueAtTime(.001, t1 + d); o.connect(gn).connect(actx.destination); o.start(t1); o.stop(t1 + d); } catch (e) {} };
  const accord = () => { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); const t1 = actx.currentTime, lp = actx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2200; lp.connect(actx.destination);
      for (const [f, dt] of [[196, 0], [247, .02], [294, .04], [392, .06], [196, .5], [294, .52], [392, .54], [494, .56]]) { const o = actx.createOscillator(), gn = actx.createGain(); o.type = "sawtooth"; o.frequency.value = f; gn.gain.setValueAtTime(0, t1 + dt); gn.gain.linearRampToValueAtTime(.06, t1 + dt + .04); gn.gain.setValueAtTime(.06, t1 + dt + (dt < .4 ? .32 : 1.1)); gn.gain.linearRampToValueAtTime(0, t1 + dt + (dt < .4 ? .42 : 1.6)); o.connect(gn).connect(lp); o.start(t1 + dt); o.stop(t1 + dt + 1.7); } } catch (e) {} };   // (un petit coup de cuivres : « ta-daa ! »)
  const majAtelier = (u, y) => { const A = atl; if (!A) return; const sx2 = sx * .14, sz2 = sz * .14;
    A.halo.material.opacity = u < 6800 ? .5 + .4 * Math.sin(u / 160) : 0;
    A.objs.forEach((o, k) => { const d0 = 7000 + k * 1800, d1 = d0 + 1500; if (u < d0) return; if (u > d1) { if (o.visible) { o.visible = false; A.sons++; if (k === 0) sonBruit(.25, 4200, .25); else if (k === 1) sonTwang(520, .5); else { sonBruit(.12, 6000, .3); sonTwang(1200, .15); } } return; }
      const e = (u - d0) / 1500, c = new V3(Wk.x + n.x * .1 - sx * .14 * (k - 1) * 1.5, y + .2 + .08 * Math.sin(e * Math.PI), Wk.z + n.z * .1 - sz * .14 * (k - 1) * 1.5); o.position.lerp(c, Math.min(1, e * 1.6)); o.rotation.y += .12; o.rotation.z += .05 * (k + 1); });
    A.eclats.forEach((e2, k) => { const ph = (u / 260 + k * .37) % 1, actif = u > 7000 && u < 12500; e2.material.opacity = actif ? (1 - ph) * .9 : 0; e2.position.set(Wk.x + n.x * .1 + Math.cos(k * 2.4 + u / 300) * .07, y + .1 + ph * .12, Wk.z + n.z * .1 + Math.sin(k * 2.4 + u / 300) * .07); }); };
  const ecranTV = () => {   // l'écran de la télé, plein cadre : son bord arrondi, ses lignes, le son
    const d = document.createElement("div"); d.style.cssText = "position:absolute;inset:0;z-index:9;background:#050505;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .6s";
    // un vrai poste des années 80 : la caisse en bois, l'écran bombé, à droite le haut-parleur et les boutons, les pieds, l'antenne en oreilles de lapin
    const tele = document.createElement("div"); tele.style.cssText = "position:relative;display:flex;gap:2.4%;align-items:stretch;width:min(94%,calc(70vh * 1.9));aspect-ratio:1.9/1;margin-top:6vh;padding:2.6% 2.4% 2.6% 2.8%;box-sizing:border-box;border-radius:3.5% / 6.5%;background:linear-gradient(165deg,#7a4f2a,#4f2f16 38%,#66401f 62%,#3a210f);box-shadow:inset 0 0 0 3px #26150a,inset 0 8px 18px rgba(255,220,170,.22),inset 0 -10px 18px rgba(0,0,0,.45),0 22px 60px rgba(0,0,0,.85)";
    tele.innerHTML = `<div style="position:absolute;left:46%;top:-21%;width:.6%;height:24%;background:linear-gradient(#ccc,#666);transform-origin:bottom;transform:rotate(-28deg);border-radius:2px"></div><div style="position:absolute;left:46%;top:-21%;width:.6%;height:24%;background:linear-gradient(#ccc,#666);transform-origin:bottom;transform:rotate(26deg);border-radius:2px"></div>
      <div style="position:absolute;left:43.5%;top:-3.5%;width:6%;height:4%;background:radial-gradient(ellipse at 50% 30%,#555,#1a1a1a);border-radius:50% 50% 10% 10%"></div>
      <div style="position:absolute;left:9%;bottom:-6%;width:7%;height:6%;background:linear-gradient(#2a1a0c,#120a04);border-radius:0 0 30% 30%"></div><div style="position:absolute;right:9%;bottom:-6%;width:7%;height:6%;background:linear-gradient(#2a1a0c,#120a04);border-radius:0 0 30% 30%"></div>`;
    const cadre = document.createElement("div"); cadre.style.cssText = "position:relative;flex:1;border-radius:8% / 12%;overflow:hidden;background:#000;box-shadow:0 0 0 5px #15110d,0 0 0 9px #3a332b,0 0 0 11px #120d08,0 0 40px rgba(120,160,255,.25)";
    const pan = document.createElement("div"); pan.style.cssText = "width:17%;display:flex;flex-direction:column;align-items:center;gap:7%;padding:3% 0;box-sizing:border-box;border-radius:6px;background:linear-gradient(#2b2520,#1a1612);box-shadow:inset 0 0 0 2px #0c0a08";
    pan.innerHTML = `<div style="color:#d8c08a;font:700 clamp(8px,1.4vw,14px) Georgia,serif;letter-spacing:.12em">ZENITH</div>
      <div style="width:70%;flex:1;border-radius:6px;background:repeating-linear-gradient(0deg,#0b0907 0 3px,#3a322a 3px 5px)"></div>
      ${[0, 1].map(k => `<div style="width:46%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle at 35% 30%,#bbb,#555 45%,#222);box-shadow:0 2px 4px #000;position:relative"><i style="position:absolute;left:47%;top:8%;width:6%;height:40%;background:#111;transform:rotate(${k ? 40 : -30}deg);transform-origin:50% 100%"></i></div>`).join("")}
      <div style="width:12%;aspect-ratio:1;border-radius:50%;background:#ff3a1a;box-shadow:0 0 8px #ff3a1a"></div>`;
    tele.appendChild(cadre); tele.appendChild(pan);
    tv.style.cssText = "width:100%;height:100%;object-fit:cover;filter:saturate(1.08) contrast(1.06)"; cadre.appendChild(tv);
    const lignes = document.createElement("div"); lignes.style.cssText = "position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(transparent 0 2px,rgba(0,0,0,.18) 2px 3px),radial-gradient(ellipse at center,transparent 55%,rgba(0,0,0,.55) 100%)"; cadre.appendChild(lignes);
    d.appendChild(tele); M.ctx.conteneur.appendChild(d); requestAnimationFrame(() => { d.style.opacity = "1"; });
    setTimeout(() => { if (fini || etape > 1) return; etape = 2; M.pauseRendu = true; if (tv.ended) return suite(); tv.volume = 1; if (tv.paused) lancerV(tv).catch(() => {}); }, 650);   // (la vidéo continue, là où elle en était)
    return d; };
  tv.onended = () => { if (etape === 2) suite(); };
  const suite = () => { if (fini) return; if (etape === -1) { couperRadioKF(); entrer0(); return; } if (etape < 2) { if (!ecranD) ecranD = ecranTV(); return; }
    if (etape === 2) { etape = 3; tv.pause(); M.pauseRendu = false; t0 = performance.now(); atelier();   // (Rambo III fini : on revient au bar — Gizmo se fabrique son arc)
      if (ecranD) { const d = ecranD; ecranD = null; d.style.opacity = "0"; setTimeout(() => d.remove(), 600); } return; }
    fin(); };
  const fin = () => { if (fini) return; fini = true; tv.pause(); if (atl) { M.scene.remove(atl.g); atl = null; } L.gizmoTravail = false; M.pauseRendu = false; L.tvLueur = null; finCine(); L.gizmoRambo = true; M.camE = null; L.silenceKF = false; L.apresRamboKF = true;   // (la musique peut partir)
    tv.muted = true; tv.loop = true; tv.style.cssText = ""; tv.play().catch(() => {});   // (la télé du bar continue, sans le son)
    for (const d of [ecranD, ramboD]) if (d) { d.style.opacity = "0"; setTimeout(() => d.remove(), 600); }
    msgKF("GIZMO RAMBO !", "", 4000); };
  const bpF = () => { suite(); if (!fini) M.passerBtn = boutonPasser(bpF); }; M.cine.passer = () => suite(); M.passerBtn = boutonPasser(bpF);   // (Passer : à l'étape suivante)
  const garde = setInterval(() => { if (fini) return clearInterval(garde); if (!M || M.lieu !== "kingston") { clearInterval(garde); fini = true; tv.pause(); couperRadioKF(); if (M) { M.pauseRendu = false; L.tvLueur = null; L.gizmoRambo = true; L.silenceKF = false; } if (ecranD) ecranD.remove(); if (ramboD) ramboD.remove(); } }, 500); }
// la fin : l'écran noir, « First Aid » ; un texte rouge qui monte lentement (tout est rentré dans l'ordre… ou presque), le générique ; le titre, « FIN »… et un point d'interrogation.
// Puis on revient dans la rue, devant le Video Futur.
const TEXTE_FIN_KF = [
  "Cette nuit-là, à Kingston Falls, la lumière a eu raison des gremlins.",
  "Au matin, la neige avait recouvert les carcasses des voitures, et l'on balayait des cendres jusque sur les marches du tribunal.",
  "Billy a tenu parole : il a réparé le désordre, une vitrine après l'autre, une guirlande après l'autre.",
  "Le père Noël a repris sa tournée — le manteau un peu déchiré, mais vivant.",
  "La chorale s'est tue. La voiture de police est rentrée au garage. Les projecteurs, eux, sont restés allumés toute la nuit.",
  "Gizmo a rangé son arc et son bandana rouge au fond de sa boîte, et Kingston Falls a retrouvé son calme, ses chants de Noël, ses rues tranquilles.",
  "Tout était rentré dans l'ordre."];
const GENERIQUE_KF = [["Gizmo", "dans son propre rôle"], ["Billy Peltzer", "le réparateur"], ["Le père Noël", "toujours debout"], ["Stripe et sa bande", "réduits en cendres"], ["La chorale de Kingston Falls", "plus jamais en mesure"],
  ["Une aventure de", "la Caserne de la Nouvelle France"], ["Mise en scène", "Germain-Pierre"], ["Musique", "« First Aid »"], ["Aucun mogwaï n'a été mouillé", "pendant le tournage"]];
function generiqueKF() { if (!M || M.lieu !== "kingston" || M.kfGenerique) return; M.kfGenerique = true; M.L.silenceKF = true; { const L0 = M.L; setTimeout(() => { if (L0.noirFinKF) { L0.noirFinKF.remove(); L0.noirFinKF = null; } }, 1800); }   // (la musique de la ville se tait : seule celle du générique)
  const mus = M.lbMus && M.lbMus.a; if (mus) mus.pause();
  const son = M.kfFinSon || new Audio("sons/kf-fin.mp3?v=1"); M.kfFinSon = null; son.volume = 1; son.loop = true; if (son.paused) son.play().catch(() => {});   // (déjà partie avec le journal, le plus souvent)
  const d = document.createElement("div"); d.style.cssText = "position:absolute;inset:0;z-index:11;background:#000;opacity:0;transition:opacity 1.6s;overflow:hidden;font-family:Georgia,'Times New Roman',serif";
  const rouge = "color:#d81818;text-shadow:0 0 14px rgba(255,20,20,.45)";
  const defile = document.createElement("div"); defile.style.cssText = "position:absolute;left:50%;top:100%;width:min(86%,640px);transform:translateX(-50%);text-align:center;" + rouge;
  defile.innerHTML = TEXTE_FIN_KF.map((t, i) => `<p style="margin:0 0 ${i === 6 ? 70 : 34}px;font-size:clamp(17px,2.6vw,25px);line-height:1.5;">${t}</p>`).join("")
    + `<div style="margin:30px 0 0;font-family:'Luckiest Guy',Georgia,serif;font-size:clamp(22px,4vw,34px);letter-spacing:.05em">Gremlins détruits par Gizmo : ${(M.L && M.L.tuesKF) || 0}</div>`
    + '<div style="height:90px"></div>' + GENERIQUE_KF.map(([a, b]) => `<div style="margin:0 0 26px"><div style="font-size:clamp(13px,1.8vw,16px);letter-spacing:.18em;text-transform:uppercase;opacity:.75">${a}</div><div style="font-size:clamp(18px,2.8vw,26px);font-weight:700">${b}</div></div>`).join("");
  d.appendChild(defile);
  const titre = document.createElement("div"); titre.style.cssText = "position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;opacity:0;transition:opacity 2.4s";
  titre.innerHTML = '<img src="images/gremlins/titre.webp" alt="Gremlins" style="width:min(74%,640px);filter:drop-shadow(0 0 24px rgba(255,40,20,.45))"><div class="fin" style="font:900 clamp(40px,10vw,76px) Georgia,serif;letter-spacing:.35em;padding-left:.35em;' + rouge + '">FIN</div>';
  d.appendChild(titre); M.ctx.conteneur.appendChild(d); requestAnimationFrame(() => { d.style.opacity = "1"; });
  M.cine = { maj: () => {} }; let fini = false; const T = [];
  const fin = () => { if (fini || !M) return; fini = true; T.forEach(clearTimeout); const v0 = son.volume, t0 = performance.now(), f = setInterval(() => { const u = Math.min(1, (performance.now() - t0) / 1200); son.volume = v0 * (1 - u); if (u >= 1) { clearInterval(f); son.pause(); } }, 50);
    M.pauseRendu = false; finCine(); M.kfGenerique = false; changerLieu("rue", [19.1, 5.2], Math.PI); setTimeout(() => { d.style.transition = "opacity 1.2s"; d.style.opacity = "0"; setTimeout(() => d.remove(), 1300); }, 900); };
  M.passerBtn = boutonPasser(fin); M.cine.passer = fin;
  const DUREE = 55;   // (secondes : le texte, puis le générique, montent lentement)
  T.push(setTimeout(() => { if (fini) return; M.pauseRendu = true; const h = defile.offsetHeight + d.offsetHeight; defile.style.transition = `transform ${DUREE}s linear`; defile.style.transform = `translate(-50%,-${h}px)`; }, 1800));   // (la ville n'est plus dessinée derrière le noir)
  T.push(setTimeout(() => { if (!fini) titre.style.opacity = "1"; }, (1.8 + DUREE + 1) * 1000));
  T.push(setTimeout(() => { if (fini) return; const f2 = titre.querySelector(".fin"); f2.textContent = "FIN ?"; f2.style.transition = "opacity .6s"; }, (1.8 + DUREE + 7) * 1000));   // (… une suite ?)
  T.push(setTimeout(fin, (1.8 + DUREE + 13) * 1000)); }

/* Kingston Falls : la devanture du bar — Dorry's Tavern : planches sombres en bas, brique au-dessus, deux petites vitres où brillent les néons de bière,
   la porte ouverte, l'enseigne au néon rouge ; les fenêtres de l'étage éteintes */
function faceTaverneKF(B) { const X0 = -4.5, X1 = 4.5;
  B.mur(X0, X1, 0, 3.6, "planche", "#3a2416", { saillie: .1 }); B.mur(X0, X1, 3.6, 7.4, "brique", "#6a3626");
  B.vitrine(-4.0, -1.2, .12, 2.6, { z: .1, cadre: "#1a120c", bas: "#2a1a10", imposte: false, montants: 1, prof: .3, marchandise: "comptoir" }); B.vitrine(1.2, 4.0, .12, 2.6, { z: .1, cadre: "#1a120c", bas: "#2a1a10", imposte: false, montants: 1, prof: .3, marchandise: "comptoir" });
  B.trou(-.62, .62, 0, 2.66, .46, { z: .1, tableau: "#1a120c" }); for (const s of [-1, 1]) B.boite(.1, 2.75, .1, s * .67, 1.37, .15, "#1a120c"); B.boite(1.44, .1, .1, 0, 2.72, .15, "#1a120c");
  B.enseigne(-2.6, 1.95, 1.7, .42, "COLD BEER", { fond: "#05070a", coul: "#40e0ff", ep: .02, z: .16, neon: true, police: "Arial Black, Arial", style: "" });
  B.enseigne(2.6, 1.95, 1.3, .42, "OPEN", { fond: "#05070a", coul: "#ff3060", ep: .02, z: .16, neon: true, police: "Arial Black, Arial", style: "" });
  B.enseigne(0, 2.95, 1.4, .3, "TAVERN", { fond: "#1a120c", coul: "#ffb030", ep: .04, z: .12 });
  B.enseigne(0, 3.95, 6.6, .95, "Dorry's Tavern", { fond: "#140c08", coul: "#ff3424", bord: "#ffb030", police: "'Brush Script MT', cursive", style: "italic bold", neon: true, degrade: true });
  for (const x of [-2.6, 0, 2.6]) B.fenetre(x, 5.0, 1.3, 1.6, { carreaux: 3, cle: true, volets: "#2a1a10" });
  B.corniche(X0, X1, 6.9, { coul: "#4a3020", frise: .25 }); }
/* Kingston Falls : la salle de Lou's Cafe vidée, et à sa place le vieux bar (Sketchfab, « Old bar » par katydid) — tout le bar, plus profond que la salle de Lou :
   il s'enfonce derrière la façade ; on y entre et on en sort par la même porte (percée dans le mur du modèle) */
let tvBarKF = null;   // (l'écran de la télé du bar de Kingston Falls)
function interieurBarKF() { tvBarKF = null; const S = .85, MX = 7.57;   // (l'échelle ; en x, le mur du modèle qui vient contre la façade)
  const DIM = { ...LOU, X0: -4.3, X1: 4.3, Z0: -15.1, Z1: -.36, H: 3.3, kf: true };
  const g = new THREE.Group(), att = []; let pret = null;
  // l'enveloppe, dehors : les murs et le toit de la partie qui dépasse derrière l'immeuble
  { const brique = new THREE.MeshStandardMaterial({ color: 0x7a4430, roughness: .95 }), z0 = -9, z1 = DIM.Z0 - .7;
    for (const sx of [-1, 1]) { const m = new THREE.Mesh(new THREE.BoxGeometry(.2, DIM.H + .3, z0 - z1), brique); m.position.set(sx * 4.45, (DIM.H + .3) / 2, (z0 + z1) / 2); g.add(m); }
    const t = new THREE.Mesh(new THREE.BoxGeometry(9.1, .25, z0 - z1), brique); t.position.set(0, DIM.H + .25, (z0 + z1) / 2); g.add(t); }
  BAR_KF_MATS.length = 0; BAR_KF_MESHES.length = 0;   // (les matériaux du vieux bar : on les éteindra quand les gremlins l'envahissent)
  KF_ATTENTES.push((async () => { gltfMod = gltfMod || await import("./vendor/GLTFLoader.js?v=1"); const G = await new gltfMod.GLTFLoader().loadAsync("avatars/kingston/bar.glb?v=1"), sc = G.scene;
    sc.updateMatrixWorld(true); const bb = new THREE.Box3().setFromObject(sc), c = bb.getCenter(new THREE.Vector3());
    // la porte : on retire du modèle ce qui bouche l'entrée (le mur côté façade, au milieu, à hauteur d'homme)
    const v = new THREE.Vector3(), inv = new THREE.Matrix4();
    sc.traverse(o => { if (!o.isMesh) return; let ge = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone(); const P = ge.attributes.position, garde = [];
      for (let t = 0; t < P.count; t += 3) { let x = 0, y = 0, z = 0; for (let k = 0; k < 3; k++) { v.fromBufferAttribute(P, t + k).applyMatrix4(o.matrixWorld); x += v.x / 3; y += v.y / 3; z += v.z / 3; }
        if (!(Math.abs(x - c.x - MX) < .4)) garde.push(t); }   // (tout le mur côté façade : on le remplace par le nôtre, la porte découpée net)
      if (garde.length < P.count / 3) { const r = new THREE.BufferGeometry(); for (const k of Object.keys(ge.attributes)) { const a = ge.attributes[k], d = a.itemSize, src = a.array, dst = new src.constructor(garde.length * 3 * d); garde.forEach((t, j) => dst.set(src.subarray(t * d, (t + 3) * d), j * 3 * d)); r.setAttribute(k, new THREE.BufferAttribute(dst, d)); } ge = r; }
      o.geometry = ge; BAR_KF_MESHES.push(o);   // (pour que la caméra ne traverse pas les murs)
      // la salle s'éclaire elle-même (une lumière chaude de vieux bar), sans multiplier les lampes
      for (const m of [].concat(o.material)) { m.side = THREE.DoubleSide; m.needsUpdate = true; }   // (des faces du modèle tournées vers l'extérieur : vues de dedans, on voyait à travers les murs)
      for (const m of [].concat(o.material)) if (m.map && !m.userData.kf) { m.userData.kf = true; m.emissiveMap = m.map; m.emissive = new THREE.Color(0xffd8a8); m.emissiveIntensity = .42; m.needsUpdate = true; BAR_KF_MATS.push(m); } });   // (la salle éclairée : une lumière chaude de vieux bar)
    { const lambris = new THREE.MeshStandardMaterial({ color: 0x3a2214, roughness: .85, emissive: 0x3a2010 }), platre = new THREE.MeshStandardMaterial({ color: 0x8a7e70, roughness: .95, emissive: 0x6a5c4c }), zM = -.52, H = DIM.H, Y = DIM.Y; BAR_KF_MATS.push(lambris, platre);
      const pan = (x0, x1, y0, y1, m, ep = .08) => { const b = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, ep), m); b.position.set((x0 + x1) / 2, Y + (y0 + y1) / 2, zM); g.add(b); };
      for (const [a, b] of [[-4.35, -.68], [.68, 4.35]]) { pan(a, b, 0, 1.05, lambris, .12); pan(a, b, 1.05, H, platre); }   // (de chaque côté de la porte : le lambris, le plâtre)
      pan(-.68, .68, 2.62, H, platre); for (const sx of [-1, 1]) pan(sx * .74 - .06, sx * .74 + .06, 0, 2.68, lambris, .16); pan(-.8, .8, 2.62, 2.74, lambris, .16); }   // (au-dessus de la porte ; le chambranle)
    const w = new THREE.Group(), inner = new THREE.Group(); inner.add(sc); sc.position.set(-c.x, -bb.min.y, -c.z); w.add(inner);
    w.rotation.y = -Math.PI / 2; w.scale.setScalar(S); w.position.set(0, DIM.Y, -MX * S - .45); g.add(w);
    
    // les obstacles : tout ce qui se dresse entre les genoux et la poitrine (comptoir, tables, tabourets, murs), relevé sur une grille de 30 cm
    g.updateWorldMatrix(true, true); inv.copy(g.matrixWorld).invert(); const C = .3, occ = new Set(), m4 = new THREE.Matrix4(), a = new THREE.Vector3(), b = new THREE.Vector3(), d = new THREE.Vector3();
    sc.traverse(o => { if (!o.isMesh) return; m4.multiplyMatrices(inv, o.matrixWorld); const P = o.geometry.attributes.position;
      for (let t = 0; t < P.count; t += 3) { a.fromBufferAttribute(P, t).applyMatrix4(m4); b.fromBufferAttribute(P, t + 1).applyMatrix4(m4); d.fromBufferAttribute(P, t + 2).applyMatrix4(m4);
        const n = Math.min(40, Math.ceil(Math.max(a.distanceTo(b), b.distanceTo(d), d.distanceTo(a)) / .2));
        for (let i = 0; i <= n; i++) for (let j = 0; j <= n - i; j++) { const u = i / n, w2 = j / n, x = a.x + (b.x - a.x) * u + (d.x - a.x) * w2, y = a.y + (b.y - a.y) * u + (d.y - a.y) * w2, z = a.z + (b.z - a.z) * u + (d.z - a.z) * w2;
          if (y > DIM.Y + .3 && y < DIM.Y + 1.4 && !(Math.abs(x) < .8 && z > -1.3)) occ.add(Math.round(x / C) + "," + Math.round(z / C)); } } });
    // la télé au-dessus du comptoir : on retrouve son écran dans le modèle (un plan vertical, de biais, tourné vers la salle) et on y pose le nôtre, où passera la vidéo
    { const tP = new THREE.Vector3(-31.85, 2.13, -10.53), nW = new THREE.Vector3(.74, 0, .67).normalize(), u = new THREE.Vector3(nW.z, 0, -nW.x), A = new THREE.Vector3(), B2 = new THREE.Vector3(), C3 = new THREE.Vector3(), ce = new THREE.Vector3(), fn = new THREE.Vector3(), e1 = new THREE.Vector3(), e2 = new THREE.Vector3();
      let u0 = 1e9, u1 = -1e9, y0 = 1e9, y1 = -1e9;
      sc.traverse(o => { if (!o.isMesh) return; const P = o.geometry.attributes.position;
        for (let t = 0; t < P.count; t += 3) { A.fromBufferAttribute(P, t).applyMatrix4(o.matrixWorld); B2.fromBufferAttribute(P, t + 1).applyMatrix4(o.matrixWorld); C3.fromBufferAttribute(P, t + 2).applyMatrix4(o.matrixWorld);
          fn.crossVectors(e1.subVectors(B2, A), e2.subVectors(C3, A)); const ar = fn.length(); if (ar < 1e-7) continue; fn.divideScalar(ar); if (Math.abs(fn.dot(nW)) < .95) continue;
          ce.copy(A).add(B2).add(C3).divideScalar(3); if (ce.distanceTo(tP) > .9 || Math.abs(e1.subVectors(ce, tP).dot(nW)) > .05) continue;
          for (const q of [A, B2, C3]) { const du = e1.subVectors(q, tP).dot(u); u0 = Math.min(u0, du); u1 = Math.max(u1, du); y0 = Math.min(y0, q.y); y1 = Math.max(y1, q.y); } } });
      const ok = u1 > u0 + .2 && y1 > y0 + .15 && u1 - u0 < 1.8, W = ok ? u1 - u0 : .95, H = ok ? y1 - y0 : .55, c = tP.clone().addScaledVector(u, ok ? (u0 + u1) / 2 : 0); c.y = ok ? (y0 + y1) / 2 : tP.y; c.addScaledVector(nW, .02);
      const ecran = new THREE.Mesh(new THREE.PlaneGeometry(W * .94, H * .92), new THREE.MeshBasicMaterial({ color: 0x080a0e, toneMapped: false })); ecran.position.copy(c); ecran.rotation.y = Math.atan2(nW.x, nW.z); g.attach(ecran);
      tvBarKF = { ecran, c: c.clone(), n: nW.clone() };
      // le poste autour de l'écran (sinon, juste un rectangle d'image) : la caisse en bois, la lunette noire, à droite le haut-parleur, deux boutons et le voyant ; l'antenne
      { const sw = W * .94, sh = H * .92, pw = sw * .3, bw = sw + pw + .14, bh = sh + .16, dp = .45, T = new THREE.Group(), cx = pw / 2;
        const bois = new THREE.MeshStandardMaterial({ color: 0x6a4020, roughness: .55, emissive: 0x2a160a }), noirM = new THREE.MeshStandardMaterial({ color: 0x15110d, roughness: .5, emissive: 0x060504 }), metal = new THREE.MeshStandardMaterial({ color: 0xbdbdbd, metalness: .8, roughness: .3, emissive: 0x2a2a2a });
        const grille = new THREE.MeshStandardMaterial({ map: tex(toile(32, 64, x => { x.fillStyle = "#1a1612"; x.fillRect(0, 0, 32, 64); x.fillStyle = "#4a4036"; for (let y = 2; y < 64; y += 4) x.fillRect(2, y, 28, 2); })), roughness: .8, emissive: 0x0a0806 });
        BAR_KF_MATS.push(bois, noirM, metal, grille);
        const ad = (geo, m, x, y, z, rx = 0, rz = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.set(rx, 0, rz); T.add(o); return o; }, e = .035;
        ad(new THREE.BoxGeometry(bw, bh, dp), bois, cx, 0, -dp / 2 - .014);
        ad(new THREE.BoxGeometry(sw + 2 * e, e, .03), noirM, 0, sh / 2 + e / 2, -.006); ad(new THREE.BoxGeometry(sw + 2 * e, e, .03), noirM, 0, -sh / 2 - e / 2, -.006);
        ad(new THREE.BoxGeometry(e, sh, .03), noirM, -sw / 2 - e / 2, 0, -.006); ad(new THREE.BoxGeometry(e, sh, .03), noirM, sw / 2 + e / 2, 0, -.006);
        const px = sw / 2 + e + .035 + (pw - .05) / 2; ad(new THREE.BoxGeometry(pw - .05, sh, .02), noirM, px, 0, -.01);
        ad(new THREE.PlaneGeometry(pw * .62, sh * .36), grille, px, sh * .2, .002);
        for (const yy of [-.1, -.32]) ad(new THREE.CylinderGeometry(pw * .17, pw * .19, .045, 18), metal, px, sh * yy, .012, Math.PI / 2);
        ad(new THREE.SphereGeometry(.014, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff2a10 }), px, -sh * .45, .004);
        ad(new THREE.SphereGeometry(.05, 12, 8), noirM, cx, bh / 2 - .005, -dp / 2); for (const sg of [-1, 1]) ad(new THREE.CylinderGeometry(.005, .005, .55, 5), metal, cx + sg * .1, bh / 2 + .25, -dp / 2, 0, -sg * .4);
        T.position.z = -.004; ecran.add(T); } }   // (accroché à l'écran : il en suit exactement la place et l'orientation)
    pret = [...occ].map(k => { const [i, j] = k.split(",").map(Number); return [i * C, j * C, .2]; }); att.forEach(f => f(pret)); })().catch(e => console.warn("bar", e)));
  return { g, obst: [], dims: DIM, obstAsync: f => pret ? f(pret) : att.push(f) }; }

/* ---- Kingston Falls (Gremlins) : la même place que Hill Valley, sous la neige, un soir de Noël ----
   (le studio a tourné les deux films sur le même décor : on reprend Hill Valley, on la met en hiver, avec les sapins au milieu de la place) */
/* les gremlins : de vrais modèles 3D (Sketchfab, CC-BY : « Gremlin A.I Model » par pinhead19920604 ; « Gremlins », « Gremlins Coca », « Gremlins Pelado »,
   « Gremlins-skate » par riverlan.teixeira), allégés ; chaque modèle chargé une fois et recopié en instances. Ils ne sont pas animés : la course se fait
   dans le shader — les jambes se balancent autour des hanches, les bras autour des épaules, à la cadence de chacun ; le skateur, lui, roule.
   Ils filent partout en zigzag, s'arrêtent net, guettent, font un bond, repartent ; plus petits que les gens. */
const GREMLINS_GLB = [
  // f, nombre, hanche, épaule (x), épaule (y), amplitude, roule
  { f: "classique", n: 20, hanche: .4, epX: .15, epY: .62, amp: .6 },   // (dont les six de la chorale)
  { f: "coca", n: 4, hanche: .38, epX: .15, epY: .6, amp: .7, queue: true },
  { f: "queue", n: 4, hanche: .4, epX: .15, epY: .62, amp: .7, queue: true },
  { f: "pelado", n: 3, hanche: .2, epX: 9, epY: 9, amp: .35, penche: 0 },
  { f: "skate", n: 4, roule: true }   // (la planche dans la longueur du modèle : il roule de côté, comme un vrai skateur),
];
// le monstre final : l'araignée sans tête, le haut du corps d'un gremlin à la place ; ses huit pattes qu'on anime à la main
function creerAraigneeKF(ara, grem) {
  const g = new THREE.Group(), corps = new THREE.Group(); g.add(corps);
  const sc = ara.scene; corps.add(sc); sc.updateMatrixWorld(true);
  let os = null; sc.traverse(o => { if (o.isSkinnedMesh) { o.frustumCulled = false; os = o.skeleton; o.castShadow = true; } });
  // le haut du gremlin : chaque pièce mise à plat dans le repère du modèle, puis on garde ce qui est au-dessus de la taille
  const gs = grem.scene; gs.updateMatrixWorld(true); const bb = new THREE.Box3().setFromObject(gs), H = bb.max.y - bb.min.y, cut = bb.min.y + H * .42, haut = new THREE.Group();
  gs.traverse(o => { if (!o.isMesh) return; let ge = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone(); ge.applyMatrix4(o.matrixWorld);
    const P = ge.attributes.position, garde = []; for (let t = 0; t < P.count; t += 3) { const y = (P.getY(t) + P.getY(t + 1) + P.getY(t + 2)) / 3; if (y > cut) garde.push(t); }
    const ng = new THREE.BufferGeometry(); for (const k of Object.keys(ge.attributes)) { if (!["position", "normal", "uv"].includes(k)) continue; const A = ge.attributes[k], s = A.itemSize, arr = new Float32Array(garde.length * 3 * s);
      garde.forEach((t, i) => { for (let v = 0; v < 3; v++) for (let c = 0; c < s; c++) arr[(i * 3 + v) * s + c] = A.array[(t + v) * s + c]; }); ng.setAttribute(k, new THREE.BufferAttribute(arr, s)); }
    const m = new THREE.Mesh(ng, o.material); m.castShadow = true; haut.add(m); });
  const k = 1.8 / H; haut.scale.setScalar(k); haut.position.set(-(bb.min.x + bb.max.x) / 2 * k, .36 - cut * k, .42 - (bb.min.z + bb.max.z) / 2 * k); corps.add(haut);   // (la taille, posée là où était la tête)
  // les pattes : la racine de chacune (.001) ; on les fait pivoter dans le repère de l'araignée
  const pattes = []; if (os) { const P = new THREE.Quaternion(), w = new THREE.Vector3(), w2 = new THREE.Vector3();
    for (const b of os.bones) { const n = b.name; const m = n.replace(/\./g, "").match(/^Bone(00[234])?_([LR])001_/); if (!m) continue; const fin = b.children[0] && b.children[0].children[0] && b.children[0].children[0].children[0] || b;
      b.parent.getWorldQuaternion(P); b.getWorldPosition(w); fin.getWorldPosition(w2); const dir = w2.sub(w).setY(0).normalize(), lev = new THREE.Vector3(0, 1, 0).cross(dir).normalize();
      const rang = { "002": 0, "003": 1, "004": 2 }[m[1]] ?? 3, cote = m[2] === "L" ? 1 : -1;
      pattes.push({ b, q0: b.quaternion.clone(), Pi: P.clone().invert(), P: P.clone(), lev, ph: ((rang + (cote > 0 ? 0 : 1)) % 2) * Math.PI }); } }
  const qa = new THREE.Quaternion(), qb = new THREE.Quaternion(), Y = new THREE.Vector3(0, 1, 0);
  const marcher = (ph, am) => { for (const p of pattes) { const a = ph + p.ph, sw = Math.sin(a) * .28 * am, li = Math.max(0, Math.cos(a)) * .35 * am;
      qa.setFromAxisAngle(Y, sw); qb.setFromAxisAngle(p.lev, -li); qa.premultiply(qb); p.b.quaternion.copy(p.Pi).multiply(qa).multiply(p.P).multiply(p.q0); } };
  return { g, corps, haut, marcher, pattes };
}
const BAR_KF_MATS = [];   // (BAR_KF_MESHES, les murs et meubles du bar pour la caméra : dans matrice.js, qui s'en sert)
function gremlinsHV(scene, L) {
  const libre = (x, z) => L.limites(x, z) && !(L.dansLou && L.dansLou(x, z)), Z = L.zone;
  const tirer = () => { for (let k = 0; k < 60; k++) { const x = Z[0] + 2 + Math.random() * (Z[1] - Z[0] - 4), z = Z[2] + 2 + Math.random() * (Z[3] - Z[2] - 4); if (libre(x, z)) return [x, z]; } return null; };
  const gr = [], troupes = []; L.gremlins = gr;
  const ombreT = tex(toile(64, 32, (x) => { const g = x.createRadialGradient(32, 16, 1, 32, 16, 30); g.addColorStop(0, "rgba(40,50,70,.5)"); g.addColorStop(1, "rgba(40,50,70,0)"); x.fillStyle = g; x.save(); x.scale(1, .5); x.fillRect(0, 0, 64, 64); x.restore(); }));
  const NMAX = GREMLINS_GLB.reduce((a, t) => a + t.n, 0), iF = []; for (let i = 0; i < NMAX; i++) iF.push(i * 4, i * 4 + 1, i * 4 + 2, i * 4, i * 4 + 2, i * 4 + 3);
  const gO = new THREE.BufferGeometry(), pO = new Float32Array(NMAX * 12), uO = new Float32Array(NMAX * 8); for (let i = 0; i < NMAX; i++) uO.set([0, 0, 1, 0, 1, 1, 0, 1], i * 8);
  gO.setAttribute("position", new THREE.BufferAttribute(pO, 3)); gO.setAttribute("uv", new THREE.BufferAttribute(uO, 2)); gO.setIndex(iF); gO.setDrawRange(0, 0);
  const mO = new THREE.Mesh(gO, new THREE.MeshBasicMaterial({ map: ombreT, transparent: true, depthWrite: false })); mO.frustumCulled = false; scene.add(mO);
  // un modèle : toutes ses pièces réunies, mis debout à 1 de haut, pieds à 0, centré ; la queue (traînant au sol, loin derrière) coupée
  const preparer = (sc, T) => { sc.updateMatrixWorld(true); const parMat = new Map();
    sc.traverse(o => { if (!o.isMesh) return; const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone(); g.applyMatrix4(o.matrixWorld); for (const k of Object.keys(g.attributes)) if (!["position", "normal", "uv"].includes(k)) g.deleteAttribute(k);
      const m = Array.isArray(o.material) ? o.material[0] : o.material; if (!parMat.has(m)) parMat.set(m, []); parMat.get(m).push(g); });
    const parts = [...parMat].map(([m, l]) => { const n = l.reduce((a, g) => a + g.attributes.position.count, 0), r = new THREE.BufferGeometry();
      for (const [k, d] of [["position", 3], ["normal", 3], ["uv", 2]]) { const a = new Float32Array(n * d); let o = 0; for (const g of l) { if (g.attributes[k]) a.set(g.attributes[k].array, o * d); o += g.attributes.position.count; } r.setAttribute(k, new THREE.BufferAttribute(a, d)); }
      return [r, m]; });
    const bb = new THREE.Box3(); for (const [g] of parts) { g.computeBoundingBox(); bb.union(g.boundingBox); }
    if (T.queue) { // le corps, vu par le haut : ce qui dépasse loin derrière, au ras du sol, c'est la queue
      const H = bb.max.y - bb.min.y, haut = new THREE.Box3(); for (const [g] of parts) { const P = g.attributes.position; for (let i = 0; i < P.count; i++) if (P.getY(i) > bb.min.y + H * .45) haut.expandByPoint(new THREE.Vector3(P.getX(i), P.getY(i), P.getZ(i))); }
      const m = H * .06, dehors = (x, y, z) => y < bb.min.y + H * .4 && (z < haut.min.z - m || z > haut.max.z + m || x < haut.min.x - m || x > haut.max.x + m);
      for (const p of parts) { const g = p[0], P = g.attributes.position, garde = []; for (let t = 0; t < P.count; t += 3) { let x = 0, y = 0, z = 0; for (let k = 0; k < 3; k++) { x += P.getX(t + k); y += P.getY(t + k); z += P.getZ(t + k); } if (!dehors(x / 3, y / 3, z / 3)) garde.push(t); }
        const r = new THREE.BufferGeometry(); for (const [k, d] of [["position", 3], ["normal", 3], ["uv", 2]]) { const s = g.attributes[k].array, a = new Float32Array(garde.length * 3 * d); garde.forEach((t, j) => a.set(s.subarray(t * d, (t + 3) * d), j * 3 * d)); r.setAttribute(k, new THREE.BufferAttribute(a, d)); }
        p[0] = r; }
      bb.makeEmpty(); for (const [g] of parts) { g.computeBoundingBox(); bb.union(g.boundingBox); } }
    const H = bb.max.y - bb.min.y, k = 1 / H, cx = (bb.min.x + bb.max.x) / 2, cz = (bb.min.z + bb.max.z) / 2;
    for (const [g] of parts) { g.translate(-cx, -bb.min.y, -cz); g.scale(k, k, k); g.computeBoundingSphere(); }
    return parts; };
  // la course, dans le shader : par instance, la phase du pas et l'ampleur (0 à l'arrêt)
  const animer = (m, T) => { m = m.clone(); m.onBeforeCompile = sh => {
      const h = T.hanche.toFixed(3), ex = T.epX.toFixed(3), ey = T.epY.toFixed(3);
      sh.vertexShader = sh.vertexShader.replace("#include <common>", `#include <common>
        attribute vec2 aPas;
        vec3 pivote(vec3 p, float py, float a) { float c = cos(a), s = sin(a), y = p.y - py; return vec3(p.x, py + y * c - p.z * s, y * s + p.z * c); }
        vec2 angles(vec3 p) { float cote = p.x > 0. ? 3.1416 : 0., ph = aPas.x + cote, am = aPas.y;
          float wb = smoothstep(${ex} - .03, ${ex} + .03, abs(p.x)) * (1. - smoothstep(${ey} - .02, ${ey} + .08, p.y)) * smoothstep(${h} * .5, ${h} * .8, p.y);   // (les bras, hors des jambes)
          float wj = (1. - smoothstep(${h} - .1, ${h}, p.y)) * smoothstep(.0, .03, abs(p.x)) * (1. - wb);   // (les jambes, sous les hanches)
          if (am < -.5) { float lev = p.x < 0. ? 1. : 0.; return vec2(.35 * sin(ph) * wj, (lev * -2.95 + (1. - lev) * .5 * sin(aPas.x * .7)) * wb); }   // (suspendu d'une main à la guirlande : ce bras-là tendu en l'air ; l'autre et les jambes ballottent)
          return vec2(-am * sin(ph) * wj, am * .9 * sin(ph) * wb); }`)
        .replace("#include <beginnormal_vertex>", `#include <beginnormal_vertex>
          { vec2 a = angles(position); objectNormal = pivote(pivote(objectNormal, 0., a.x), 0., a.y); }`)
        .replace("#include <begin_vertex>", `#include <begin_vertex>
          { vec2 a = angles(position); transformed = pivote(pivote(position, ${h}, a.x), ${ey}, a.y); }`); };
    m.customProgramCacheKey = () => "gremlin-" + T.f; return m; };
  const charger = async T => { gltfMod = gltfMod || await import("./vendor/GLTFLoader.js?v=1");
    const g = await new gltfMod.GLTFLoader().loadAsync("avatars/gremlins/" + T.f + ".glb?v=1"), parts = preparer(g.scene, T);
    const debut = gr.length, n = T.n;
    for (let i = 0; i < n; i++) { const p0 = tirer(); if (!p0) continue;
      const ch = T.f === "classique" && i < 6 ? i : -1, chasse = (T.f === "coca" || T.f === "queue") && i < 2;
      if (ch >= 0) { p0[0] = 10.6 + ch * .56; p0[1] = 21.75 + Math.abs(ch - 2.5) * .16; }   // (la chorale : en arc de cercle sur le trottoir, face à la maison)
      gr.push({ T, chorale: ch, chasse, x: p0[0], z: p0[1], v: T.roule ? 3.5 + Math.random() * 1.5 : 2.6 + Math.random() * 2.2, s: ch >= 0 ? .78 : .62 + Math.random() * .22, grimpeur: (T.f === "classique" && i === 6) || ch < 0 && !chasse && !T.roule && T.f !== "pelado" && Math.random() < .5, dosNoel: T.f === "classique" && i === 6, cible: null, attente: Math.random() * 2, ph: Math.random() * 8, rot: Math.random() * 6.3, saut: 0, vy: 0, am: 0, pen: 0, vire: 0 }); }
    const nb = gr.length - debut, aPas = new THREE.InstancedBufferAttribute(new Float32Array(nb * 2), 2); aPas.setUsage(THREE.DynamicDrawUsage);
    const ims = parts.map(([geo, m]) => { geo.setAttribute("aPas", aPas); const im = new THREE.InstancedMesh(geo, T.roule ? m : animer(m, T), nb); im.frustumCulled = false; scene.add(im); return im; });
    troupes.push({ T, debut, nb, ims, aPas }); gO.setDrawRange(0, gr.length * 6); };
  GREMLINS_GLB.forEach(T => KF_ATTENTES.push(charger(T).catch(e => console.warn("gremlin", T.f, e))));
  const mat = new THREE.Matrix4(), qt = new THREE.Quaternion(), eu = new THREE.Euler(0, 0, 0, "YXZ"), pos = new THREE.Vector3(), ech = new THREE.Vector3();
  // le cri des gremlins : chacun le sien, toutes les 6 à 8 secondes, jamais tous ensemble ; plus ou moins fort selon qu'il est près ou loin de nous, à gauche ou à droite
  let criBuf = null, voix = 0; const bus = () => { if (!L.busKF) { const c = actx.createDynamicsCompressor(); c.threshold.value = -12; c.ratio.value = 6; c.connect(actx.destination); L.busKF = c; } return L.busKF; };   // (un compresseur : forts sans saturer)
  (async () => { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); const r = await fetch("sons/kf-cri.mp3?v=2"); criBuf = await actx.decodeAudioData(await r.arrayBuffer()); } catch (e) { console.warn("cri des gremlins", e); } })();
  const crier = (q, t) => { if ((L.gizmoDedans !== false && !L.barKF) || !criBuf || !actx || actx.state !== "running" || voix >= 7 || !M.camera) return; const moi = M.gens && M.gens.get(M.moiNum), o = moi ? moi.g.position : M.camera.position, d = Math.hypot(q.x - o.x, q.z - o.z), D = 30;
    if (!(d <= D)) return; const g = actx.createGain(), sn = actx.createBufferSource(); sn.buffer = criBuf; sn.playbackRate.value = .9 + Math.random() * .25; g.gain.value = 3.6 * Math.pow(1 - d / D, 1.8);   // (tout près : très fort ; il s'éteint vite en s'éloignant)
    let sortie = g; if (actx.createStereoPanner) { const pn = actx.createStereoPanner(), dr = new THREE.Vector3().setFromMatrixColumn(M.camera.matrixWorld, 0), rx = dr.x, rz = dr.z, cx = M.camera.position.x, cz = M.camera.position.z, l = Math.hypot(q.x - cx, q.z - cz) || 1;   /* (la droite de la caméra) */
      pn.pan.value = Math.max(-1, Math.min(1, ((q.x - cx) * rx + (q.z - cz) * rz) / l)); g.connect(pn); sortie = pn; }
    sn.connect(g); sortie.connect(bus()); voix++; sn.onended = () => { voix--; try { sortie.disconnect(); } catch (e) {} }; sn.start(); };
  // la chorale chante son chant de Noël, en boucle — elle seule ; on l'entend d'autant plus qu'on s'en approche (et plus du tout en quittant Kingston Falls)
  const CH = { x: 10.6 + 2.5 * .56, z: 22 }; let chant = null;
  (async () => { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); const r = await fetch("sons/kf-chorale.mp3?v=2"), b = await actx.decodeAudioData(await r.arrayBuffer());
    const sn = actx.createBufferSource(), g = actx.createGain(); sn.buffer = b; sn.loop = true; g.gain.value = 0; let sortie = g; const pn = actx.createStereoPanner ? actx.createStereoPanner() : null; if (pn) { g.connect(pn); sortie = pn; }
    sn.connect(g); sortie.connect(bus()); sn.start(); chant = { g, pn };
    const garde = setInterval(() => { if (!M || M.lieu !== "kingston") { g.gain.value = 0; if (!M) { try { sn.stop(); } catch (e) {} clearInterval(garde); } } }, 400); } catch (e) { console.warn("la chorale", e); } })();
  // touché par une flèche enflammée : deux fois, et il prend feu, se tord, disparaît… et revient plus loin sur la carte
  // les flammes : des langues de feu (un cœur jaune-blanc dans une flamme orange), qui dansent et vacillent ; une lueur orange autour ; une fumée noire qui monte
  const flammes = [], lueurs = [], fumees = []; { const goutte = (x, w, h, cx, base, c0, c1, c2) => { const g = x.createRadialGradient(cx, base - h * .25, 1, cx, base - h * .35, h * .7); g.addColorStop(0, c0); g.addColorStop(.45, c1); g.addColorStop(1, c2); x.fillStyle = g; x.beginPath(); x.moveTo(cx, base - h); x.bezierCurveTo(cx + w * .55, base - h * .55, cx + w * .5, base - h * .1, cx, base); x.bezierCurveTo(cx - w * .5, base - h * .1, cx - w * .55, base - h * .55, cx, base - h); x.fill(); };
    const fA = tex(toile(64, 128, x => { x.filter = "blur(2px)"; goutte(x, 54, 120, 32, 124, "rgba(255,150,40,1)", "rgba(230,60,10,.85)", "rgba(120,10,0,0)"); goutte(x, 24, 60, 32, 120, "rgba(255,240,170,1)", "rgba(255,190,60,.9)", "rgba(255,120,20,0)"); }));
    const fB = tex(toile(64, 128, x => { x.filter = "blur(2px)"; x.translate(64, 0); x.scale(-1, 1); goutte(x, 46, 110, 36, 124, "rgba(255,130,30,1)", "rgba(220,50,8,.8)", "rgba(110,8,0,0)"); goutte(x, 20, 52, 34, 120, "rgba(255,230,150,1)", "rgba(255,170,50,.85)", "rgba(255,100,20,0)"); }));
    const lu = tex(toile(64, 64, x => { const g = x.createRadialGradient(32, 32, 1, 32, 32, 31); g.addColorStop(0, "rgba(255,170,60,.9)"); g.addColorStop(.4, "rgba(255,90,20,.35)"); g.addColorStop(1, "rgba(255,40,0,0)"); x.fillStyle = g; x.fillRect(0, 0, 64, 64); }));
    const fu = tex(toile(64, 64, x => { const g = x.createRadialGradient(32, 32, 1, 32, 32, 31); g.addColorStop(0, "rgba(40,36,34,.9)"); g.addColorStop(.6, "rgba(50,46,44,.4)"); g.addColorStop(1, "rgba(60,56,54,0)"); x.fillStyle = g; x.fillRect(0, 0, 64, 64); }));
    const fg = new THREE.Group(); scene.add(fg);   // (dans un groupe : la nuit ne les cache pas)
    for (let i = 0; i < 170; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: i % 2 ? fA : fB, blending: i % 4 < 2 ? THREE.NormalBlending : THREE.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false })); sp.visible = false; fg.add(sp); flammes.push(sp); }
    for (let i = 0; i < 45; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: lu, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false })); sp.visible = false; fg.add(sp); lueurs.push(sp); }
    for (let i = 0; i < 90; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: fu, depthWrite: false, transparent: true })); sp.visible = false; fg.add(sp); fumees.push(sp); } }
  L.ejecterGremlin = (q, vx, vz) => { if (q.mort > 0 || q.ejecte || q.chorale >= 0 || q.dosNoel) return; if (q.perche) { q.perche.occ--; q.perche = null; q.grimpeur = false; } q.ejecte = { vx, vz, t: 1.1 }; q.vy = 6.5; q.saut = Math.max(q.saut, .05); };
  L.toucherGremlin = q => { if (q.boss) return L.toucherBoss && L.toucherBoss(); if (q.feu > 0 || q.mort > 0) return; if (q.plafond) { const P = q.plafond; q.plafond = null; q.pen = 0; q.cible = null; q.saut = Math.max(0, q.y - P.sol); q.y = P.sol; q.vy = 0; q.pv = 1; q.attente = .6; return; }   // (touché au plafond : il lâche prise, tombe — et file)
    q.pv = (q.pv ?? 2) - 1; q.vy = 2.4; q.attente = .4; if (q.pv <= 0) { crier(q, 0); L.tueKF && L.tueKF(); }   // (il crie quand il prend feu ; un point au compteur)
   
    if (q.pv <= 0) { q.feu = q.feu0 = 1.4; if (q.perche) { q.perche.occ--; q.perche = null; q.grimpeur = false; } if (q.chorale >= 0) { const a = L.choraleAcc && L.choraleAcc[q.chorale]; if (a) a.visible = false; q.chorale = -1; } } };
  // le bar envahi (une fois le levier relevé) : des gremlins pendus au plafond, au-dessus du comptoir, la tête en bas ; d'autres qui courent partout entre les tables
  const SLb = L.salleLou, libreBar = (x, z) => L.dansLou(x, z) && L.limites(x, z), tirerBar = () => { for (let k = 0; k < 40; k++) { const [x, z] = SLb.vers(-3.8 + Math.random() * 7.6, -1.3 - Math.random() * 13.3); if (libreBar(x, z)) return [x, z]; } return null; };
  L.crierKF = crier; let criBar = 0;
  L.centreG = q => q.boss ? q.y + 1.15 * 1.25 : (q.y || 0) + q.saut + (q.plafond ? .5 : .32) * q.s;   // (là où la flèche le touche)
  const guirlandeY = lz => { const u = Math.max(0, Math.min(1, (-2.3 - lz) / 8.6)), f = (u * 9) % 1; return .125 + 2.3 - Math.sin(f * Math.PI) * .22; };   // (la hauteur de la guirlande au-dessus du comptoir, là où elle pend)
  L.envahirBar = () => { if (!SLb || L.barKF) return; const ok = gr.filter(q => !q.ejecte && !(q.chorale >= 0) && !q.dosNoel), bras = ok.filter(q => !q.T.roule && q.T.epX < 1), pris = [...bras.slice(0, 6), ...ok.filter(q => !bras.slice(0, 6).includes(q)).slice(0, 8)], yb = .125; L.barKF = pris;
    const [ax, az] = SLb.vers(0, 0), [bx, bz] = SLb.vers(-1, 0), face = Math.atan2(bx - ax, bz - az);   // (face à la salle)
    pris.forEach((q, i) => { if (q.perche) { q.perche.occ--; q.perche = null; } q.grimpeur = false; q.attaque = false; q.chasse = false; q.brule = 0; q.mort = 0; q.feu = 0; q.pv = 2; q.saut = 0; q.vy = 0; q.cible = null; q.attente = Math.random(); q.bar = true;
      if (i < 6) { const lz = -3 - i * 1.3, [x, z] = SLb.vers(.55, lz); q.x = x; q.z = z; q.plafond = { x, z, y: guirlandeY(lz), sol: yb, H: 1.02 * q.s, ph: Math.random() * 6 }; q.rot = face; q.y = q.plafond.y - q.plafond.H; q.pen = 0; }
      else { const c = tirerBar() || SLb.vers(0, -6); q.x = c[0]; q.z = c[1]; q.plafond = null; q.pen = 0; } }); };
  const revenir = q => { if (L.gremlinsFinis) { q.mort = 1e9; q.feu = 0; return; }   // (la lumière des projecteurs les a tous brûlés : ils ne reviennent plus)
 const x0 = q.x, z0 = q.z; let p = null; for (let k = 0; k < 40; k++) { const c = tirer(); if (c && Math.hypot(c[0] - x0, c[1] - z0) > 15) { p = c; break; } } if (!p) p = tirer() || [0, 18];
    q.x = p[0]; q.z = p[1]; q.pv = 2; q.mort = 0; q.feu = 0; q.cible = null; q.saut = 0; q.vy = 0; q.attente = .5; };
  // les projecteurs allumés : tous brûlent, l'un après l'autre, en quelques secondes (et aucun ne revient)
  L.brulerTous = (duree, t0) => { L.gremlinsFinis = true; for (const q of gr) { if (q.mort > 0 && !(q.feu > 0)) { q.mort = 1e9; continue; } q.brule = t0 + Math.random() * duree; } };
  // un seul gremlin à la fois s'en prend à Gizmo (dehors seulement) : il fonce, le mord, et détale ; le suivant viendra plus tard
  const ATTAQUES_KF = false; let attaquant = null, prochaineAttaque = 0;
  const choisirAttaquant = (t) => { if (!ATTAQUES_KF) return;   // (retirées : la voiture de police suffit)
    const moi = M && M.gens.get(M.moiNum), ok = moi && M.lieu === "kingston" && !M.cine && L.gizmoDedans === false && !L.gremlinsFinis && L.gizmoRambo !== false;
    if (attaquant && (!ok || attaquant.mort > 0 || attaquant.feu > 0 || attaquant.ejecte || t > attaquant.attaqueFin)) { attaquant.attaque = false; attaquant.cible = null; attaquant = null; prochaineAttaque = t + 3000 + Math.random() * 3000; }
    if (attaquant || !ok || t < prochaineAttaque) return; const o = moi.g.position; let best = null, bd = 20;
    for (const q of gr) { if (q.chorale >= 0 || q.dosNoel || q.chasse || q.mort > 0 || q.feu > 0 || q.ejecte || (q.perche && q.perche.colle)) continue; const d = Math.hypot(q.x - o.x, q.z - o.z); if (d < bd) { bd = d; best = q; } }
    if (!best) { prochaineAttaque = t + 2000; return; }
    if (best.perche) { best.perche.occ--; best.perche = null; } best.grimpeur = false; best.attaque = true; best.attaqueFin = t + 14000; attaquant = best; };
  return (dt, t) => {
    choisirAttaquant(t);
    if (L.barKF && t > criBar) { criBar = t + 900 + Math.random() * 1800; const v = L.barKF.filter(q => !(q.mort > 0) && !(q.feu > 0)); if (v.length) crier(v[Math.floor(Math.random() * v.length)], t); }   // (le bar envahi : ils crient, ricanent, sans arrêt)
    if (L.gremlinsFinis) for (const q of gr) if (q.brule && t >= q.brule) { q.brule = 0; if (q.feu > 0 || q.mort > 0) continue; if (q.ejecte) { q.ejecte = null; q.saut = 0; q.vy = 0; } q.dosNoel = false; q.pv = 1; L.toucherGremlin(q); if (q.feu > 0) q.feu = q.feu0 = 2.4 + Math.random() * .8; }   // (les projecteurs : un grand feu, plus long)
    { let f = 0, lu = 0, fm = 0; for (const q of gr) { if (q.ejecte) { const E = q.ejecte; E.t -= dt; q.x += E.vx * dt; q.z += E.vz * dt; q.rot += dt * 14; q.saut += q.vy * dt; q.vy -= 12 * dt; if (q.saut < 0) q.saut = 0; if (E.t <= 0) { q.ejecte = null; q.saut = 0; q.vy = 0; q.mort = 2; } continue; }   // (catapulté : il tournoie, retombe, disparaît)
        if (q.mort > 0) { q.mort -= dt; if (q.mort <= 0) revenir(q); }
        else if (q.feu > 0) { q.feu -= dt; q.rot += dt * 9; if (q.feu <= 0) { q.mort = 2.5; L.tache && L.tache(q.x, q.z, true, 1.6 * q.s / .7); }   // (une tache de sang vert, là où il est tombé)
          // (il brûle, tourne sur lui-même, puis s'effondre en cendres)
          // (le feu prend, enfle, puis retombe quand il ne reste presque rien de lui)
          const u = 1 - q.feu / (q.feu0 || 1.4), I = Math.min(1, u * 5) * (1 - Math.max(0, (u - .7) / .3) * .7), S2 = q.s * (.8 + .7 * I), y = (q.y || 0) + q.saut;
          for (let k = 0; k < 4 && f < flammes.length; k++, f++) { const sp = flammes[f], a = k * 1.571 + q.ph + t / 700, h = (.7 + .35 * Math.sin(t / 45 + k * 2.3 + q.ph * 3)) * S2; sp.visible = true;
            sp.position.set(q.x + Math.cos(a) * .15 * q.s, y + .1 * q.s + h * .45 + (k % 2) * .08, q.z + Math.sin(a) * .15 * q.s); sp.scale.set(.36 * h, h * (1 + (k % 2) * .25), 1); sp.material.rotation = Math.sin(t / 110 + k * 1.7 + q.ph) * .22; sp.material.opacity = (.45 + .35 * I) * (k % 4 < 2 ? 1 : .7); }
          if (lu < lueurs.length) { const sp = lueurs[lu++]; sp.visible = true; sp.position.set(q.x, y + .35 * q.s, q.z); sp.scale.setScalar(1.4 * S2 * (.9 + .1 * Math.sin(t / 60))); sp.material.opacity = .38 * I; }
          for (let k = 0; k < 2 && fm < fumees.length; k++) { const sp = fumees[fm++], ph = ((t / 1100 + k * .5 + q.ph) % 1); sp.visible = true; sp.position.set(q.x + Math.sin(ph * 4 + k) * .12, y + .55 * q.s + ph * 1.5, q.z + Math.cos(ph * 3 + k) * .12); sp.scale.setScalar((.35 + ph * .9) * q.s * 1.4); sp.material.opacity = (1 - ph) * .45 * I; } } }
      for (; f < flammes.length; f++) flammes[f].visible = false; for (; lu < lueurs.length; lu++) lueurs[lu].visible = false; for (; fm < fumees.length; fm++) fumees[fm].visible = false; }
    // (plus de cris à tout bout de champ : un gremlin ne crie que quand il prend feu)
    if (chant && M.camera) { const moi = M.gens && M.gens.get(M.moiNum), o = moi ? moi.g.position : M.camera.position, d = Math.hypot(CH.x - o.x, CH.z - o.z), D = 26;
      chant.g.gain.value = !(d <= D) || L.gizmoDedans !== false || L.silenceKF || L.gremlinsFinis ? 0 : 3.6 * Math.pow(1 - d / D, 1.6);
      if (chant.pn) { const dr = new THREE.Vector3().setFromMatrixColumn(M.camera.matrixWorld, 0), cx = M.camera.position.x, cz = M.camera.position.z, l = Math.hypot(CH.x - cx, CH.z - cz) || 1; chant.pn.pan.value = Math.max(-1, Math.min(1, ((CH.x - cx) * dr.x + (CH.z - cz) * dr.z) / l)) * .8; } }
    for (let i = 0; i < gr.length; i++) { const q = gr[i]; let court = false; if (q.mort > 0 || q.feu > 0 || q.ejecte) { q.am = 0; if (q.ejecte) q.y = L.hauteur ? L.hauteur(q.x, q.z) : 0; continue; }
      // les grimpeurs : dès qu'une voiture garée est là, ils sautent sur son toit (deux par voiture) et n'en descendent plus — ils y trépignent, y sautillent, y tournent
      if (q.dosNoel && q.perche !== (L.perchesKF && L.perchesKF.find(p => p.dos)) && L.perchesKF) { const P = L.perchesKF.find(p => p.dos);   // (celui-là, toujours sur le dos du père Noël — il y remonte dès qu'il revient)
        if (P) { const o = gr.find(g => g !== q && g.perche === P); if (o) { o.perche = null; o.cible = null; P.occ--; } if (q.perche) q.perche.occ--; q.perche = P; P.occ++; q.grimpeur = true; } }
      if (q.grimpeur && q.perche && !q.perche.colle && L.perchesKF) { const P = L.perchesKF.find(p => p.colle && !p.dos && p.occ < (p.cap || 2)); if (P) { q.perche.occ--; q.perche = P; P.occ++; } }   // (la voiture de police et le dos du père Noël d'abord)
      if (q.grimpeur && !q.perche && L.perchesKF) { const P = L.perchesKF.find(p => !p.dos && p.occ < (p.cap || 2)); if (P) { q.perche = P; P.occ++; q.ox = (Math.random() * 2 - 1) * P.hx; q.oz = (Math.random() * 2 - 1) * P.hz; q.vy = 3; q.cible = null; } }
      if (q.plafond) { const P = q.plafond, th = .32 * Math.sin(t / 650 + P.ph); q.pen = th; q.x = P.x; q.z = P.z - P.H * Math.sin(th); q.y = P.y - P.H * Math.cos(th); q.saut = 0; q.ph += dt * 4; q.am = 0; q.cible = 1; continue; }   // (pendus d'une main à la guirlande : ils se balancent comme un pendule, les jambes gigotent)
      if (q.chorale >= 0) { q.rot = Math.sin(t / 900 + q.chorale) * .1 + (q.chorale - 2.5) * -.06; q.ph += dt * 2.2; q.y = L.hauteur ? L.hauteur(q.x, q.z) : 0; q.am += (.1 - q.am) * Math.min(1, dt * 4); continue; }   // (ils chantent : immobiles, ils se balancent)
      if (q.attaque && !(M.gens.get(M.moiNum))) { q.attaque = false; attaquant = null; }
      if (q.attaque) { const o = M.gens.get(M.moiNum).g.position, ddx = o.x - q.x, ddz = o.z - q.z, l = Math.hypot(ddx, ddz);   // (il fonce sur Gizmo, en zigzag)
        if (l < .5) { L.blesserGizmo && L.blesserGizmo(ddx / (l || 1), ddz / (l || 1)); q.attaque = false; attaquant = null; prochaineAttaque = t + 6000 + Math.random() * 4000; q.vy = 3.2;
          const fx = q.x - ddx / (l || 1) * 9, fz = q.z - ddz / (l || 1) * 9; q.cible = L.limites(fx, fz) ? [fx, fz] : null; q.attente = 0; }   // (il a mordu : il détale)
        else { const zz = Math.sin(t / 200 + q.ph * 3) * .35, ux = ddx / l - ddz / l * zz, uz = ddz / l + ddx / l * zz, ul = Math.hypot(ux, uz), v = 3.3, nx = q.x + ux / ul * v * dt, nz = q.z + uz / ul * v * dt;
          if (libre(nx, nz)) { q.x = nx; q.z = nz; } else if (libre(q.x + ux / ul * v * dt, q.z)) q.x += ux / ul * v * dt; else if (libre(q.x, q.z + uz / ul * v * dt)) q.z += uz / ul * v * dt;
          court = true; let d = Math.atan2(ux, uz) - q.rot; d = Math.atan2(Math.sin(d), Math.cos(d)); q.rot += d * Math.min(1, dt * 12); if (q.saut === 0 && l < 2 && Math.random() < dt * 2) q.vy = 3; } }
      else if (q.chasse && L.victimeKF) { const V = L.victimeKF, a = t / 600 + q.ph * 3, tx = V.x + Math.cos(a) * .85, tz = V.z + Math.sin(a) * .85, ddx = tx - q.x, ddz = tz - q.z, l = Math.hypot(ddx, ddz);   // (ils harcèlent le passant, lui sautent dessus)
        if (l > .05) { const v = Math.min(l, 4.6 * dt); q.x += ddx / l * v; q.z += ddz / l * v; court = true; q.ph += dt * 4.6 * 4.4; let d = Math.atan2(ddx, ddz) - q.rot; d = Math.atan2(Math.sin(d), Math.cos(d)); q.rot += d * Math.min(1, dt * 12); }
        if (q.saut === 0 && Math.random() < dt * 1.2) q.vy = 2.6 + Math.random(); }
      else if (q.perche && q.perche.colle) { const P = q.perche; q.x = P.x; q.z = P.z; q.rot = P.r; q.saut = 0; q.vy = 0; q.ox = q.oz = 0; q.ph += dt * 9; court = true; q.pen = (P.aplat ?? .35) + .12 * Math.sin(t / 90 + i); }   // (agrippé : il mord, il griffe — ou couché à plat ventre sur la voiture)
      else if (q.perche) { const P = q.perche;
        if (q.attente > 0) { q.attente -= dt; if (q.danse) q.rot += dt * 5; }
        else if (!q.cibleL) q.cibleL = [(Math.random() * 2 - 1) * P.hx, (Math.random() * 2 - 1) * P.hz];
        else { const ddx = q.cibleL[0] - q.ox, ddz = q.cibleL[1] - q.oz, l = Math.hypot(ddx, ddz);
          if (l < .08) { q.cibleL = null; q.attente = .3 + Math.random() * 1.8; q.danse = Math.random() < .3; if (Math.random() < .55) q.vy = 2.4 + Math.random(); }
          else { const v = Math.min(l, 1.3 * dt); q.ox += ddx / l * v; q.oz += ddz / l * v; court = true; q.ph += dt * 1.3 * 6;
            const cs = Math.cos(P.r), sn = Math.sin(P.r), wx = ddx * cs + ddz * sn, wz = -ddx * sn + ddz * cs; let d = Math.atan2(wx, wz) - q.rot; d = Math.atan2(Math.sin(d), Math.cos(d)); q.rot += d * Math.min(1, dt * 10); } }
        const cs = Math.cos(P.r), sn = Math.sin(P.r); q.x = P.x + q.ox * cs + q.oz * sn; q.z = P.z - q.ox * sn + q.oz * cs; }
      else if (q.attente > 0) q.attente -= dt;
      else if (!q.cible) { const c = q.bar ? tirerBar() : tirer(); if (c && Math.hypot(c[0] - q.x, c[1] - q.z) > (q.bar ? 1 : 2)) q.cible = c; else q.attente = .2; }
      else { const ddx = q.cible[0] - q.x, ddz = q.cible[1] - q.z, l = Math.hypot(ddx, ddz);
        if (l < .3) { q.cible = null; q.attente = q.T.roule ? Math.random() * .8 : .4 + Math.random() * 2.6; if (Math.random() < .3) q.vy = 3; }   // (arrivé : il s'arrête net, parfois d'un bond)
        else { const zz = Math.sin(t / 260 + q.ph * 3) * (q.T.roule ? .15 : .5), ux = ddx / l - ddz / l * zz, uz = ddz / l + ddx / l * zz, ul = Math.hypot(ux, uz);   // (en zigzag)
          const nx = q.x + ux / ul * q.v * dt, nz = q.z + uz / ul * q.v * dt;
          if ((q.bar ? libreBar : libre)(nx, nz)) { q.x = nx; q.z = nz; court = true; let d = Math.atan2(ux, uz) - q.rot; d = Math.atan2(Math.sin(d), Math.cos(d)); q.rot += d * Math.min(1, dt * (q.T.roule ? 5 : 12)); q.vire = d; }
          else { q.cible = null; q.attente = .1; }
          if (Math.random() < dt * (q.T.roule ? .12 : .2)) q.vy = 2.6; } }
      if (q.vy || q.saut > 0) { q.saut += q.vy * dt; q.vy -= 12 * dt; if (q.saut <= 0) { q.saut = 0; q.vy = 0; } }
      const k = Math.min(1, dt * 8); q.am += ((court && !q.T.roule ? (q.perche && q.perche.colle ? .45 : 1) : 0) - q.am) * k; if (!(q.perche && q.perche.colle)) q.pen += ((court ? (q.T.roule ? q.vire * .6 : q.T.penche ?? .22) : 0) - q.pen) * k;
      if (court && !q.T.roule) q.ph += dt * q.v * 4.4;
      q.y = q.perche ? (q.perche.colle ? (q.perche.aplat != null ? q.perche.y : q.perche.cou - .9 * q.s + (q.perche.dos ? .32 : 0)) : q.perche.y) : (L.hauteur ? L.hauteur(q.x, q.z) : 0); }
    for (const tr of troupes) { const A = tr.aPas.array;
      for (let j = 0; j < tr.nb; j++) { const q = gr[tr.debut + j], bob = q.am * Math.abs(Math.cos(q.ph)) * .035, tremble = q.am ? 0 : Math.sin(t / 90 + q.ph) * .006;
        if (q.T.roule) eu.set(q.pen, q.rot - Math.PI / 2, 0); else eu.set(q.pen + tremble, q.rot + (q.am < .1 && !q.cible ? Math.sin(t / 700 + q.ph) * .35 : 0), 0);
        pos.set(q.x, (q.y || 0) + q.saut + bob, q.z); ech.setScalar(q.mort > 0 ? 0 : q.s * (q.feu > 0 ? .35 + .65 * q.feu / (q.feu0 || 1.4) : 1)); mat.compose(pos, qt.setFromEuler(eu), ech);   // (en brûlant, il se ratatine)
        for (const im of tr.ims) im.setMatrixAt(j, mat);
        A[j * 2] = q.ph; A[j * 2 + 1] = q.plafond ? -1 : q.am * tr.T.amp * (q.saut > 0 ? .4 : 1); }
      for (const im of tr.ims) im.instanceMatrix.needsUpdate = true; tr.aPas.needsUpdate = true; }
    for (let i = 0; i < gr.length; i++) { const q = gr[i], so = q.mort > 0 || q.plafond ? 0 : .26 * q.s * Math.max(.4, 1 - q.saut), y0 = (q.y || 0) + .025;
      pO.set([q.x - so, y0, q.z - so * .7, q.x + so, y0, q.z - so * .7, q.x + so, y0, q.z + so * .7, q.x - so, y0, q.z + so * .7], i * 12); }
    gO.attributes.position.needsUpdate = true; };
}
/* les passants de Kingston Falls, peints comme la foule du concert de Santa Carla : de face et de dos, deux pas de marche, en anorak, doudoune, parka ou manteau de laine,
   bonnet à pompon, écharpe, moufles, après-ski — les couleurs des années 80 ; chacun va où il veut sur la place et les trottoirs, s'arrête un peu, repart */
function passantsHiver(scene, L, obst) {
  const NP = 18, FR = 6, atlas = document.createElement("canvas"); atlas.width = 2048; atlas.height = 2048; const ax = atlas.getContext("2d");
  const PEAUX = ["#f2cfae", "#e8b896", "#d69a72", "#b87850", "#8e5636", "#f6dcc4", "#c88a60", "#efc4a0"];
  const CHEV = ["#1a120c", "#3a2414", "#6a4022", "#a8743a", "#d8b060", "#8a2a1a", "#5a5650", "#c9c4bc"];
  const MANT = ["#c8202a", "#1d3f8a", "#2a7a6a", "#e8602a", "#7a3a9a", "#ff4fa3", "#2ad8d0", "#f2c83a", "#3a3a42", "#6a4a2a", "#b89870", "#1a5a2a", "#9a1a3a", "#e8e2d6"];
  const VIF = ["#ff2a8a", "#2ad8ff", "#ffd21a", "#5aff4a", "#ff6a1a", "#9a4aff", "#ffffff", "#c8202a", "#1d3f8a"];
  const BAS = ["#2a3f6a", "#1a1a1e", "#3a5a8a", "#5a3a22", "#4a4a50", "#2a2a40"];
  const gens = []; for (let k = 0; k < NP; k++) { const r = n => hasard(k * 23.7 + n * 5.3 + 400), f = k % 2 === 1, age = r(14);
    gens.push({ f, age, peau: PEAUX[Math.floor(r(1) * 8)], chev: age > .85 ? "#c9c4bc" : CHEV[Math.floor(r(2) * 7)],
      manteau: f ? ["doudoune", "manteau", "ski", "parka", "doudoune", "manteau"][Math.floor(r(3) * 6)] : ["parka", "doudoune", "ski", "manteau", "parka", "doudoune"][Math.floor(r(3) * 6)],
      c1: MANT[Math.floor(r(4) * MANT.length)], c2: VIF[Math.floor(r(5) * VIF.length)], c3: VIF[Math.floor(r(13) * VIF.length)],
      tete: ["bonnet", "bonnet", "pompon", "chapka", "cache", "cheveux", "pompon", "bonnet"][Math.floor(r(6) * 8)], cBonnet: VIF[Math.floor(r(7) * VIF.length)],
      echarpe: r(8) > .3, cEch: VIF[Math.floor(r(9) * VIF.length)], rayEch: r(10) > .5, bas: BAS[Math.floor(r(11) * BAS.length)],
      pieds: ["moon", "boots", "boots", "moon", "baskets"][Math.floor(r(12) * 5)], cMoon: VIF[Math.floor(r(15) * VIF.length)], large: f ? .9 + r(16) * .1 : 1 + r(16) * .14, coif: f ? ["permanente", "long", "frange", "permanente"][Math.floor(r(17) * 4)] : ["court", "court", "mulet", "moustache"][Math.floor(r(17) * 4)] }); }
  const ombre = (x, x0, x1, k = .35) => { const g = x.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, `rgba(0,0,0,${k})`); g.addColorStop(.3, "rgba(0,0,0,0)"); g.addColorStop(.62, "rgba(255,255,255,.08)"); g.addColorStop(1, `rgba(0,0,0,${k * 1.1})`); return g; };
  const vertical = (x, y0, y1, k = .3) => { const g = x.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, "rgba(255,255,255,.1)"); g.addColorStop(1, `rgba(0,0,0,${k})`); return g; };
  /* un passant : de face (dos = false) ou de dos ; pas = -1, 0, 1 (la jambe qui avance) */
  const perso = (x, P, dos, pas) => {
    const sw = 25 * P.large * (P.f ? .9 : 1), hw = 19 * P.large * (P.f ? 1.05 : 1), long = { doudoune: -108, ski: -110, parka: -92, manteau: -66 }[P.manteau];
    // les jambes (le pantalon), le pas : une jambe devant, l'autre derrière
    for (const s of [-1, 1]) { const av = pas * s, hx = s * hw * .48, fx = s * hw * .46 + av * 3, fy = -2 - Math.max(0, -av) * 5, kx = s * hw * .5 + av * 2, ky = -52 - Math.max(0, av) * 3;
      x.lineCap = "round"; x.strokeStyle = "rgba(0,0,0,.4)"; x.lineWidth = 17; x.beginPath(); x.moveTo(hx, -106); x.lineTo(kx, ky); x.lineTo(fx, fy - 10); x.stroke();
      x.strokeStyle = P.bas; x.lineWidth = 15; x.beginPath(); x.moveTo(hx, -106); x.lineTo(kx, ky); x.lineTo(fx, fy - 10); x.stroke();
      x.strokeStyle = "rgba(255,255,255,.1)"; x.lineWidth = 3; x.beginPath(); x.moveTo(hx - s * 3, -100); x.lineTo(kx - s * 3, ky); x.stroke();   // (le pli du pantalon, la lumière)
      // les chaussures : après-ski (moon boots) bien gonflés, bottes de neige, ou baskets ; un peu de neige collée
      if (P.pieds === "moon") { x.fillStyle = P.cMoon; x.beginPath(); x.roundRect(fx - 10, fy - 26, 20, 26, 7); x.fill(); x.fillStyle = "rgba(0,0,0,.25)"; for (const yy of [-20, -13]) x.fillRect(fx - 10, fy + yy, 20, 2); x.fillStyle = "#e8e8e4"; x.fillRect(fx - 11, fy - 4, 22, 5); }
      else if (P.pieds === "boots") { x.fillStyle = "#4a2e1a"; x.beginPath(); x.roundRect(fx - 8, fy - 24, 16, 24, 4); x.fill(); x.fillStyle = "#d8c8a8"; x.fillRect(fx - 9, fy - 25, 18, 4); x.fillStyle = "#2a1a10"; x.fillRect(fx - 9, fy - 4, 18, 4); }
      else { x.fillStyle = "#f2f2ee"; x.beginPath(); x.roundRect(fx - 8, fy - 13, 16, 13, 4); x.fill(); x.fillStyle = P.c2; x.fillRect(fx - 8, fy - 8, 16, 2); }
      x.fillStyle = "rgba(240,245,250,.8)"; x.beginPath(); x.ellipse(fx, fy - 1, 9, 2.5, 0, 0, 7); x.fill(); }
    // le manteau
    const corps = () => { x.beginPath(); x.moveTo(-sw, -186); x.quadraticCurveTo(-sw - 4, -150, -hw - (P.manteau === "manteau" ? 6 : 2), long);
      x.lineTo(hw + (P.manteau === "manteau" ? 6 : 2), long); x.quadraticCurveTo(sw + 4, -150, sw, -186); x.quadraticCurveTo(0, -194, -sw, -186); };
    x.fillStyle = P.c1; corps(); x.fill(); x.save(); corps(); x.clip();
    if (P.manteau === "doudoune") { x.strokeStyle = "rgba(0,0,0,.28)"; x.lineWidth = 2; for (let y = -176; y < long; y += 13) { x.beginPath(); x.moveTo(-sw - 6, y); x.quadraticCurveTo(0, y + 4, sw + 6, y); x.stroke(); }
      x.fillStyle = "rgba(255,255,255,.16)"; for (let y = -182; y < long; y += 13) { x.beginPath(); x.ellipse(-sw * .25, y + 4, sw * .5, 3, 0, 0, 7); x.fill(); } }   // (les boudins gonflés, leurs reflets)
    if (P.manteau === "ski") { x.fillStyle = P.c2; x.beginPath(); x.moveTo(-sw - 6, -150); x.lineTo(sw + 6, -168); x.lineTo(sw + 6, -152); x.lineTo(-sw - 6, -134); x.fill(); x.fillStyle = P.c3; x.beginPath(); x.moveTo(-sw - 6, -134); x.lineTo(sw + 6, -152); x.lineTo(sw + 6, -144); x.lineTo(-sw - 6, -126); x.fill(); }   // (les bandes de couleur en biais)
    if (P.manteau === "parka") { x.fillStyle = "rgba(0,0,0,.18)"; for (const s of [-1, 1]) x.fillRect(s * sw * .55 - 7, -128, 14, 12); }   // (les poches)
    x.fillStyle = ombre(x, -sw - 4, sw + 4, .4); x.fillRect(-sw - 8, -200, sw * 2 + 16, 220); x.fillStyle = vertical(x, -190, long, .25); x.fillRect(-sw - 8, -200, sw * 2 + 16, 220); x.restore();
    if (!dos) { if (P.manteau === "manteau") { x.fillStyle = "rgba(0,0,0,.35)"; for (let i = 0; i < 3; i++) for (const s of [-1, 1]) { x.beginPath(); x.arc(s * 7, -156 + i * 18, 2.2, 0, 7); x.fill(); }   // (le croisé, ses boutons, le col)
        x.strokeStyle = "rgba(0,0,0,.3)"; x.lineWidth = 1.5; x.beginPath(); x.moveTo(-3, -184); x.lineTo(2, long + 2); x.stroke(); }
      else { x.strokeStyle = "rgba(0,0,0,.35)"; x.lineWidth = 2; x.beginPath(); x.moveTo(0, -184); x.lineTo(0, long); x.stroke(); x.fillStyle = "#c8c8c8"; x.fillRect(-1.5, -184, 3, 6); } }   // (la fermeture éclair)
    if (P.manteau === "parka") { x.fillStyle = "#e8dcc4"; x.beginPath(); x.ellipse(0, -190, sw * .78, 9, 0, 0, 7); x.fill(); x.fillStyle = "rgba(120,100,70,.4)"; for (let i = 0; i < 18; i++) { x.beginPath(); x.arc(-sw * .7 + i * sw * .08, -190 + Math.sin(i) * 4, 2, 0, 7); x.fill(); } }   // (la capuche bordée de fourrure)
    // les bras dans les manches, les moufles ; ils se balancent avec le pas
    for (const s of [-1, 1]) { const b = -pas * s * .22, ex = s * (sw + 3) + Math.sin(b) * 26, ey = -150, hx = ex + Math.sin(b * 1.4) * 24 * 1 + s * 1, hy = -114;
      x.lineCap = "round"; x.strokeStyle = "rgba(0,0,0,.35)"; x.lineWidth = P.manteau === "doudoune" ? 16 : 14; x.beginPath(); x.moveTo(s * (sw - 3), -182); x.lineTo(ex, ey); x.lineTo(hx, hy); x.stroke();
      x.strokeStyle = P.c1; x.lineWidth = P.manteau === "doudoune" ? 14 : 12; x.beginPath(); x.moveTo(s * (sw - 3), -182); x.lineTo(ex, ey); x.lineTo(hx, hy); x.stroke();
      if (P.manteau === "ski") { x.strokeStyle = P.c2; x.lineWidth = 4; x.beginPath(); x.moveTo(s * (sw - 1), -176); x.lineTo(ex + s * 2, ey); x.stroke(); }
      x.strokeStyle = "rgba(255,255,255,.12)"; x.lineWidth = 3; x.beginPath(); x.moveTo(s * (sw - 6), -180); x.lineTo(ex - s * 3, ey); x.stroke();
      x.fillStyle = P.cEch; x.beginPath(); x.ellipse(hx, hy + 3, 6.5, 7.5, 0, 0, 7); x.fill(); x.fillStyle = "rgba(0,0,0,.25)"; x.beginPath(); x.ellipse(hx + 1.5, hy + 5, 4, 5, 0, 0, 7); x.fill(); }   // (les moufles, assorties à l'écharpe)
    // le cou, la tête
    x.fillStyle = P.peau; x.fillRect(-6, -200, 12, 14);
    const tete = () => { x.beginPath(); x.ellipse(0, -214, 13.5, 16, 0, 0, 7); };
    x.fillStyle = P.peau; for (const s of [-1, 1]) { x.beginPath(); x.ellipse(s * 13.5, -212, 3, 5, 0, 0, 7); x.fill(); } tete(); x.fill();
    x.save(); tete(); x.clip(); x.fillStyle = ombre(x, -14, 14, .3); x.fillRect(-16, -232, 32, 36); x.restore();
    const ch = P.chev;
    if (!dos) { // le visage : les sourcils, les yeux, le nez, la bouche, les joues rougies par le froid
      x.fillStyle = "rgba(220,90,90,.28)"; for (const s of [-1, 1]) { x.beginPath(); x.ellipse(s * 7, -207, 4, 3, 0, 0, 7); x.fill(); }
      x.fillStyle = "#1c120c"; for (const s of [-1, 1]) { x.beginPath(); x.ellipse(s * 5, -215, 1.8, 2.1, 0, 0, 7); x.fill(); } x.fillStyle = "rgba(255,255,255,.7)"; for (const s of [-1, 1]) x.fillRect(s * 5 - .3, -216.5, 1, 1);
      x.strokeStyle = ch === "#c9c4bc" ? "#8a8680" : ch; x.lineWidth = 1.8; for (const s of [-1, 1]) { x.beginPath(); x.moveTo(s * 2.5, -220); x.lineTo(s * 8, -221); x.stroke(); }
      x.strokeStyle = "rgba(120,60,40,.45)"; x.lineWidth = 1.5; x.beginPath(); x.moveTo(.5, -214); x.lineTo(1.5, -207); x.lineTo(-1, -206.5); x.stroke();
      x.strokeStyle = P.f ? "#b23a3a" : "rgba(110,50,40,.7)"; x.lineWidth = P.f ? 2.4 : 1.6; x.beginPath(); x.moveTo(-4, -201.5); x.quadraticCurveTo(0, -199.5, 4, -201.5); x.stroke();
      if (P.coif === "moustache" && !P.f) { x.fillStyle = ch; x.beginPath(); x.ellipse(0, -204, 6, 2.2, 0, 0, 7); x.fill(); } }
    // les cheveux (permanente, long, frange ; court, mulet), puis le couvre-chef
    x.fillStyle = ch;
    const cheveuxVus = P.tete === "cheveux" || P.tete === "cache";
    if (P.f && P.coif === "permanente") { for (let i = 0; i < 30; i++) { const a = Math.PI * .75 + i / 29 * Math.PI * 1.5, r = 17 + (i % 3) * 3; x.beginPath(); x.arc(Math.cos(a) * r, -214 + Math.sin(a) * r * .9 + (Math.sin(a) > .2 ? 8 : 0), 6.5, 0, 7); x.fill(); } if (dos) { x.beginPath(); x.ellipse(0, -210, 19, 20, 0, 0, 7); x.fill(); } }
    else if (P.f && (P.coif === "long" || P.coif === "frange")) { x.beginPath(); x.ellipse(0, -218, 16, 14, 0, Math.PI, 0); x.lineTo(16, -184); x.lineTo(-16, -184); x.fill(); if (dos) { x.beginPath(); x.ellipse(0, -212, 16, 17, 0, 0, 7); x.fill(); } }
    else if (P.coif === "mulet") { x.beginPath(); x.ellipse(0, -219, 14, 11, 0, Math.PI, 0); x.fill(); x.fillRect(-12, -206, 24, 18); if (dos) { x.beginPath(); x.ellipse(0, -212, 14, 15, 0, 0, 7); x.fill(); } }
    else { x.beginPath(); x.ellipse(0, -220, 14, 10, 0, Math.PI, 0); x.fill(); if (dos) { x.beginPath(); x.ellipse(0, -213, 14, 15, 0, 0, 7); x.fill(); } }
    if (!dos && cheveuxVus && P.f && P.coif === "frange") { x.fillRect(-12, -229, 24, 7); }
    x.strokeStyle = "rgba(255,255,255,.12)"; x.lineWidth = 1; for (let i = 0; i < 6; i++) { x.beginPath(); x.moveTo(-8 + i * 3, -229); x.quadraticCurveTo(-9 + i * 3.2, -218, -8 + i * 3, -208); x.stroke(); }
    if (P.tete === "bonnet" || P.tete === "pompon") { x.fillStyle = P.cBonnet; x.beginPath(); x.ellipse(0, -221, 15.5, 12, 0, Math.PI, 0); x.lineTo(15.5, -218); x.lineTo(-15.5, -218); x.fill();
      x.fillStyle = "rgba(0,0,0,.2)"; for (let i = -14; i < 15; i += 3) x.fillRect(i, -230, 1.2, 12); x.fillStyle = P.c2; x.fillRect(-16, -221, 32, 5);   // (les côtes du tricot, le revers rayé)
      if (P.tete === "pompon") { x.fillStyle = P.c2; x.beginPath(); x.arc(0, -236, 6.5, 0, 7); x.fill(); x.fillStyle = "rgba(255,255,255,.25)"; x.beginPath(); x.arc(-2, -238, 3, 0, 7); x.fill(); } }
    else if (P.tete === "chapka") { x.fillStyle = "#5a3a22"; x.beginPath(); x.ellipse(0, -223, 16, 11, 0, Math.PI, 0); x.fill(); x.fillStyle = "#c8b090"; x.fillRect(-17, -224, 34, 6); for (const s of [-1, 1]) { x.beginPath(); x.ellipse(s * 15, -210, 5, 10, 0, 0, 7); x.fill(); } }   // (la chapka, ses rabats fourrés)
    else if (P.tete === "cache") { x.strokeStyle = "#555"; x.lineWidth = 2; x.beginPath(); x.arc(0, -214, 16, Math.PI * 1.05, Math.PI * 1.95); x.stroke(); x.fillStyle = P.cBonnet; for (const s of [-1, 1]) { x.beginPath(); x.arc(s * 15, -211, 6, 0, 7); x.fill(); } }   // (le cache-oreilles en fausse fourrure)
    // l'écharpe : enroulée, un pan qui pend devant (ou dans le dos)
    if (P.echarpe) { x.fillStyle = P.cEch; x.beginPath(); x.roundRect(-sw * .55, -197, sw * 1.1, 12, 5); x.fill(); x.beginPath(); x.roundRect(dos ? -2 : 5, -190, 9, 40, 3); x.fill();
      if (P.rayEch) { x.fillStyle = P.c2 === P.cEch ? "#ffffff" : P.c2; for (const y of [-174, -164]) x.fillRect(dos ? -2 : 5, y, 9, 3); } x.fillStyle = "rgba(0,0,0,.2)"; x.fillRect(dos ? -2 : 5, -190, 9, 3); x.fillStyle = "#eee"; for (let i = 0; i < 4; i++) x.fillRect((dos ? -2 : 5) + i * 2.3, -150, 1, 4); }
  };
  gens.forEach((P, k) => [[0, 0], [0, -1], [0, 1], [1, 0], [1, -1], [1, 1]].forEach(([dos, pas], f) => { const idx = k * FR + f, cx = (idx % 16) * 128, cy = Math.floor(idx / 16) * 256;
    ax.save(); ax.beginPath(); ax.rect(cx, cy, 128, 256); ax.clip(); ax.translate(cx + 64, cy + 250); const sc = P.age < .15 ? .78 : .98 + hasard(k * 5.5) * .05; ax.scale(sc, sc); perso(ax, P, !!dos, pas);
    ax.globalCompositeOperation = "source-atop"; const g = ax.createLinearGradient(0, -240, 0, 0); g.addColorStop(0, "rgba(235,240,250,.12)"); g.addColorStop(1, "rgba(20,25,40,.25)"); ax.fillStyle = g; ax.fillRect(-64, -250, 128, 256); ax.restore(); }));
  const tAt = new THREE.CanvasTexture(atlas); tAt.colorSpace = THREE.SRGBColorSpace; tAt.anisotropy = 4;
  // où l'on peut marcher : la place et les trottoirs ; tout droit d'un point à l'autre si rien ne barre le chemin
  const libre = (x, z) => L.limites(x, z) && !(L.dansLou && L.dansLou(x, z)), droit = (x0, z0, x1, z1) => { const n = Math.ceil(Math.hypot(x1 - x0, z1 - z0) / .5); for (let i = 1; i <= n; i++) if (!libre(x0 + (x1 - x0) * i / n, z0 + (z1 - z0) * i / n)) return false; return true; };
  const Z = L.zone, tirer = () => { for (let k = 0; k < 80; k++) { const x = Z[0] + 2 + Math.random() * (Z[1] - Z[0] - 4), z = Z[2] + 2 + Math.random() * (Z[3] - Z[2] - 4); if (libre(x, z)) return [x, z]; } return null; };
  // (la ville est attaquée : il ne reste que trois passants, qui courent se mettre à l'abri — et le père Noël, blessé, un gremlin sur le dos : voir perenoelKF)
  const N = 3, gensP = [];
  for (let i = 0; i < N; i++) { const p0 = tirer(); if (!p0) continue; gensP.push({ x: p0[0], z: p0[1], k: [8, 13, 6][i] % NP, v: 2.4 + Math.random() * .8, cible: null, attente: 0, ph: Math.random() * 6, s: .95 + Math.random() * .1, dx: 0, dz: 1 }); }
  const n = gensP.length, gF = new THREE.BufferGeometry(), pF = new Float32Array(n * 12), uF = new Float32Array(n * 8), iF = [];
  for (let i = 0; i < n; i++) iF.push(i * 4, i * 4 + 1, i * 4 + 2, i * 4, i * 4 + 2, i * 4 + 3);
  gF.setAttribute("position", new THREE.BufferAttribute(pF, 3)); gF.setAttribute("uv", new THREE.BufferAttribute(uF, 2)); gF.setIndex(iF);
  const m = new THREE.Mesh(gF, new THREE.MeshBasicMaterial({ map: tAt, alphaTest: .5, side: THREE.DoubleSide, color: L.nuitKF ? 0x8a8e9c : 0xe2e4e8 })); m.frustumCulled = false; scene.add(m);
  const ombreT = tex(toile(64, 32, (x) => { const g = x.createRadialGradient(32, 16, 1, 32, 16, 30); g.addColorStop(0, "rgba(40,50,70,.45)"); g.addColorStop(1, "rgba(40,50,70,0)"); x.fillStyle = g; x.save(); x.scale(1, .5); x.fillRect(0, 0, 64, 64); x.restore(); }));
  const gO = new THREE.BufferGeometry(), pO = new Float32Array(n * 12), uO = new Float32Array(n * 8); for (let i = 0; i < n; i++) uO.set([0, 0, 1, 0, 1, 1, 0, 1], i * 8);
  gO.setAttribute("position", new THREE.BufferAttribute(pO, 3)); gO.setAttribute("uv", new THREE.BufferAttribute(uO, 2)); gO.setIndex(iF);
  const mO = new THREE.Mesh(gO, new THREE.MeshBasicMaterial({ map: ombreT, transparent: true, depthWrite: false })); mO.frustumCulled = false; scene.add(mO);
  const eps = .5 / 2048;
  L.passants = gensP;
  return (dt, t) => { const cam = M && M.camera; if (!cam) return;
    for (let i = 0; i < n; i++) { const q = gensP[i]; let marche = false;
      if (q.vole) { const nx = q.x + q.vole.vx * dt, nz = q.z + q.vole.vz * dt; if (libre(nx, nz)) { q.x = nx; q.z = nz; } q.sy += q.vy * dt; q.vy -= 12 * dt; if (q.sy <= 0) { q.sy = 0; q.vy = 0; q.vole = null; q.cible = null; q.attente = 1.2; } }   // (catapulté par la voiture de police)
      else if (q.attente > 0) q.attente -= dt;
      else if (!q.cible) { for (let k = 0; k < 12; k++) { const c = tirer(); if (c && Math.hypot(c[0] - q.x, c[1] - q.z) > 3 && droit(q.x, q.z, c[0], c[1])) { q.cible = c; break; } } if (!q.cible) q.attente = .5; }
      else { const ddx = q.cible[0] - q.x, ddz = q.cible[1] - q.z, l = Math.hypot(ddx, ddz);
        if (l < .2) { q.cible = null; q.attente = .1; }
        else { let ux = ddx / l, uz = ddz / l;
          // on s'écarte un peu de celui qui arrive en face (et du joueur)
          for (const o of gensP) if (o !== q) { const ox = o.x - q.x, oz = o.z - q.z, d = Math.hypot(ox, oz); if (d < .9 && d > .01) { ux -= ox / d * .5; uz -= oz / d * .5; } }
          const me = M.gens && M.gens.get(M.moiNum); if (me) { const ox = me.g.position.x - q.x, oz = me.g.position.z - q.z, d = Math.hypot(ox, oz); if (d < 1.1 && d > .01) { ux -= ox / d * .7; uz -= oz / d * .7; } }
          const ul = Math.hypot(ux, uz) || 1; ux /= ul; uz /= ul; const nx = q.x + ux * q.v * dt, nz = q.z + uz * q.v * dt;
          if (libre(nx, nz)) { q.x = nx; q.z = nz; q.dx = ux; q.dz = uz; marche = true; } else { q.cible = null; q.attente = .3; } } }
      const y = (L.hauteur ? L.hauteur(q.x, q.z) : 0) + (q.sy || 0);
      let cx = cam.position.x - q.x, cz = cam.position.z - q.z; const cl = Math.hypot(cx, cz) || 1; cx /= cl; cz /= cl; const rx = cz, rz = -cx;
      const deFace = q.dx * cx + q.dz * cz > -.15, pas = marche ? Math.round(Math.sin((t / 1000) * q.v * 5.2 + q.ph)) : 0, f = (deFace ? 0 : 3) + (pas < 0 ? 1 : pas > 0 ? 2 : 0);
      const H = 1.76 * q.s, W = H / 2, bob = marche ? Math.abs(Math.sin((t / 1000) * q.v * 5.2 + q.ph)) * .03 : 0, o = i * 12;
      pF.set([q.x - rx * W / 2, y + bob, q.z - rz * W / 2, q.x + rx * W / 2, y + bob, q.z + rz * W / 2, q.x + rx * W / 2, y + bob + H, q.z + rz * W / 2, q.x - rx * W / 2, y + bob + H, q.z - rz * W / 2], o);
      const idx = q.k * FR + f, u0 = (idx % 16) / 16 + eps, u1 = (idx % 16 + 1) / 16 - eps, v1 = 1 - Math.floor(idx / 16) / 8 - eps, v0 = 1 - (Math.floor(idx / 16) + 1) / 8 + eps;
      uF.set([u0, v0, u1, v0, u1, v1, u0, v1], i * 8);
      pO.set([q.x - .45, y + .03, q.z - .28, q.x + .45, y + .03, q.z - .28, q.x + .45, y + .03, q.z + .28, q.x - .45, y + .03, q.z + .28], i * 12); }
    gF.attributes.position.needsUpdate = gF.attributes.uv.needsUpdate = gO.attributes.position.needsUpdate = true; };
}
function hiverHV(A, L, scene, obst, y0, feuilles) {
  graine = 1225; L.kingston = true;
  // plus de voitures de 1955 qui tournent autour de la place
  for (const V of L.voituresTour || []) V.v.visible = false; for (const R of L.roulent || []) R.v.visible = false; L.voituresTour = []; L.roulent = []; if (L.delorean) L.delorean.visible = false;   // (ni la DeLorean)
  (L.belAirGarees || []).forEach(v => v.visible = false);   // (ni les Bel Air garées : la Simca et la Coccinelle prennent leurs places)
  // le sol : l'asphalte mouillé, la neige tassée en bandes, les traces de pneus ; les trottoirs et la pelouse sous la neige
  const asphN = toile(512, 512, (x) => { x.fillStyle = "#e6eaef"; x.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 4000; i++) { const v = 205 + alea() * 50; x.fillStyle = `rgba(${v},${v + 2},${Math.min(255, v + 8)},.5)`; x.fillRect(alea() * 512, alea() * 512, 2, 2); }
    // les traces des roues, tassées et grises, dans les deux sens
    x.filter = "blur(3px)"; for (let i = 0; i < 4; i++) { const vert = i % 2, p0 = alea() * 512; x.strokeStyle = `rgba(140,148,160,${.06 + alea() * .06})`; x.lineWidth = 8 + alea() * 6;
      for (const d of [0, 34]) { x.beginPath(); for (let t = 0; t <= 512; t += 32) { const o = p0 + d + Math.sin(t / 90 + i) * 6; vert ? x.lineTo(o, t) : x.lineTo(t, o); } x.stroke(); } } });
  L.sol.material.map = tex(asphN, 26, 26); L.sol.material.roughness = .9; L.sol.material.needsUpdate = true;
  const neigeT = toile(256, 256, (x) => { x.fillStyle = "#eef2f7"; x.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 3500; i++) { const v = 215 + alea() * 40; x.fillStyle = `rgba(${v},${v + 3},${Math.min(255, v + 10)},.6)`; x.fillRect(alea() * 256, alea() * 256, 2, 2); }
    for (let i = 0; i < 18; i++) { x.fillStyle = "rgba(170,185,205,.12)"; x.beginPath(); x.ellipse(alea() * 256, alea() * 256, 14 + alea() * 30, 6 + alea() * 12, alea() * 3, 0, 7); x.fill(); } });
  const nrmN = (() => { const N = 256, h = new Float32Array(N * N); for (let o = 0; o < 4; o++) { const f = 4 << o, a = .5 ** o, g = []; for (let i = 0; i <= f; i++) { g.push([]); for (let j = 0; j <= f; j++) g[i].push(alea()); }
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const fx = x / N * f, fy = y / N * f, i = Math.floor(fy), j = Math.floor(fx), u = fx - j, v = fy - i, s1 = u * u * (3 - 2 * u), s2 = v * v * (3 - 2 * v);
        const q = (a2, b2) => g[a2 % f][b2 % f]; h[y * N + x] += a * ((q(i, j) * (1 - s1) + q(i, j + 1) * s1) * (1 - s2) + (q(i + 1, j) * (1 - s1) + q(i + 1, j + 1) * s1) * s2); } }
    return toile(N, N, (x) => { const d = x.createImageData(N, N); for (let y = 0; y < N; y++) for (let xx = 0; xx < N; xx++) { const H = (a2, b2) => h[((b2 + N) % N) * N + ((a2 + N) % N)], dx = (H(xx + 1, y) - H(xx - 1, y)) * 4, dy = (H(xx, y + 1) - H(xx, y - 1)) * 4, l = Math.hypot(dx, dy, 1), k = (y * N + xx) * 4;
      d.data[k] = (-dx / l * .5 + .5) * 255; d.data[k + 1] = (-dy / l * .5 + .5) * 255; d.data[k + 2] = (1 / l * .5 + .5) * 255; d.data[k + 3] = 255; } x.putImageData(d, 0, 0); }); })();
  const nN = (r) => tex(nrmN, r, r);
  const neige = new THREE.MeshStandardMaterial({ map: tex(neigeT, 6, 6), normalMap: nN(5), normalScale: new THREE.Vector2(.9, .9), roughness: .92, color: 0xffffff });
  L.sol.material.normalMap = nN(30); L.sol.material.normalScale = new THREE.Vector2(.6, .6);
  for (const o of L.solsPlus || []) if (o.material) { o.material = neige; }
  // les arbres de la place : la couronne chargée de neige
  const blob = (det = 3, amp = .16) => { const g = new THREE.IcosahedronGeometry(1, det), p = g.attributes.position, v = new THREE.Vector3(); const ph = alea() * 9;
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const k = 1 + amp * (Math.sin(v.x * 3.1 + ph) * Math.sin(v.y * 2.7 + ph * .7) * Math.sin(v.z * 3.3 + ph * 1.3)); p.setXYZ(i, v.x * k, v.y * k * .85, v.z * k); }
    g.computeVertexNormals(); return g; };
  const neigeArbre = new THREE.MeshStandardMaterial({ color: 0xf3f6fa, roughness: .95, normalMap: nN(1.5), normalScale: new THREE.Vector2(.7, .7) });
  // le coin nord-est de la place, dégagé pour la tour radio (ses arbres, ses haies, ses obstacles)
  const TOUR = { x0: 4.5, x1: 14.2, z0: -14.6, z1: -4.2 }, dansTour = (x, z) => x > TOUR.x0 && x < TOUR.x1 && z > TOUR.z0 && z < TOUR.z1;
  { scene.updateMatrixWorld(true); const c = new THREE.Vector3(); scene.traverse(o => { if (!o.isMesh || o.isInstancedMesh || !o.geometry) return; o.geometry.computeBoundingSphere(); c.copy(o.geometry.boundingSphere.center).applyMatrix4(o.matrixWorld);
      if (dansTour(c.x, c.z) && c.y < 8 && o.geometry.boundingSphere.radius * o.matrixWorld.getMaxScaleOnAxis() < 5) o.visible = false; });
    for (let i = obst.length - 1; i >= 0; i--) if (dansTour(obst[i][0], obst[i][1])) obst.splice(i, 1); }
  { const pts = []; scene.traverse(o => { if (o.isMesh && feuilles.includes(o.material)) { o.visible = false; const w = o.getWorldPosition(new THREE.Vector3()); if (!dansTour(w.x, w.z)) pts.push([w, o.scale.x]); } });
    const sel = pts.filter((_, i) => i % 2 === 0), g = blob(3, .2), im = new THREE.InstancedMesh(g, neigeArbre, sel.length), mt = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    sel.forEach(([p, sc2], i) => { const r = .42 + sc2 * .32; e.set(alea() * 3, alea() * 3, alea() * 3); q.setFromEuler(e); mt.compose(p, q, new THREE.Vector3(r * (1 + alea() * .25), r * (.8 + alea() * .3), r)); im.setMatrixAt(i, mt); });
    im.castShadow = true; im.receiveShadow = true; scene.add(im); }
  // (les normales lissées : on moyenne celles des sommets confondus — les paquets de neige ronds, pas en facettes)
  const lisser = g => { if (!g || !g.attributes || !g.attributes.normal || g.userData.lisse) return; g.userData.lisse = true; const p = g.attributes.position, n = g.attributes.normal, acc = new Map(), cle = i => `${Math.round(p.getX(i) * 200)},${Math.round(p.getY(i) * 200)},${Math.round(p.getZ(i) * 200)}`;
    for (let i = 0; i < p.count; i++) { const k = cle(i), a = acc.get(k) || [0, 0, 0]; a[0] += n.getX(i); a[1] += n.getY(i); a[2] += n.getZ(i); acc.set(k, a); }
    for (let i = 0; i < p.count; i++) { const a = acc.get(cle(i)), l = Math.hypot(...a) || 1; n.setXYZ(i, a[0] / l, a[1] / l, a[2] / l); } n.needsUpdate = true; };
  // les buis, les haies, les collines au loin : tout ce qui est vert disparaît sous la neige (les buis deviennent des bourrelets de neige)
  scene.traverse(o => { if (!o.isMesh || !o.material || feuilles.includes(o.material)) return; for (const m of [].concat(o.material)) { if (!m.color || m.isMeshBasicMaterial) continue; const c = m.color;
    if (c.g > c.r * 1.12 && c.g > c.b * 1.12 && !(m.metalness > .2) && !m.userData.peint) { m.color.setHex(0xf1f4f8); m.map = null; m.normalMap = nN(2); m.roughness = .92; m.flatShading = false; m.needsUpdate = true; lisser(o.geometry); } } });
  // les allées de gravier : enneigées aussi
  scene.traverse(o => { if (o.isMesh && o.material && o.material.color && o.material.color.getHex() === 0xd8ccb0) { o.material.color.setHex(0xeef1f5); } });
  // la neige posée : sur tout ce qui est plat et à l'air libre (toits, corniches, auvents, voitures, bancs, rebords)
  scene.updateMatrixWorld(true);
  const caps = [], up = new THREE.Vector3(), sc = new THREE.Vector3();
  scene.traverse(o => { if (!o.isMesh || !o.geometry || o.geometry.type !== "BoxGeometry" || o.isInstancedMesh) return; for (let q = o; q; q = q.parent) if (!q.visible) return; const pr = o.geometry.parameters;
    up.setFromMatrixColumn(o.matrixWorld, 1); const ly = up.length(); if (ly < 1e-6 || up.y / ly < .97) return;
    sc.setFromMatrixColumn(o.matrixWorld, 0); const lx = sc.length(); sc.setFromMatrixColumn(o.matrixWorld, 2); const lz = sc.length();
    const w = pr.width * lx, d = pr.depth * lz; if (w * d < .12 || w < .18 || d < .18) return;
    const top = new THREE.Vector3(0, pr.height / 2, 0).applyMatrix4(o.matrixWorld).y; if (top < .35 || top > 40) return;
    const m = o.matrixWorld.clone().multiply(new THREE.Matrix4().compose(new THREE.Vector3(0, pr.height / 2 + .035 / ly, 0), new THREE.Quaternion(), new THREE.Vector3((pr.width + .03 / lx) / pr.width, .07 / ly / pr.height, (pr.depth + .03 / lz) / pr.depth)));
    m.multiply(new THREE.Matrix4().makeScale(pr.width, pr.height, pr.depth)); caps.push(m); });
  if (caps.length) { const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), A.mat({ color: 0xf4f7fb, roughness: .8 }), caps.length); caps.forEach((m, i) => im.setMatrixAt(i, m)); im.receiveShadow = true; scene.add(im); }
  // ---- les sapins de Noël, au milieu de la place : un grand, et une ronde de plus petits ----
  const vert = A.mat({ color: 0x1d4a2a, roughness: .9, flatShading: true }), vert2 = A.mat({ color: 0x24583a, roughness: .9, flatShading: true }), blanc = A.mat({ color: 0xf6f9fc, roughness: .8, flatShading: true });
  const troncS = A.mat({ color: 0x4a3222, roughness: 1 }), or = A.mat({ color: 0xffd34a, emissive: 0xffb820, emissiveIntensity: 1.4, metalness: .4, roughness: .3 });
  const ampoules = [], couleurs = [0xff3030, 0xffc830, 0x3a7dff, 0x40e060, 0xff60c0, 0xfff2c0], boules = [];
  // les guirlandes d'ampoules, en festons, le long des façades des boutiques (en face du palais et sur les côtés)
  const feston = (x0, z0, x1, z1, y) => { const l = Math.hypot(x1 - x0, z1 - z0), n = Math.round(l / .45);
    for (let i = 0; i <= n; i++) { const u = i / n, f = (u * 6) % 1, creux = Math.sin(f * Math.PI) * .45; ampoules.push([x0 + (x1 - x0) * u, y - creux, z0 + (z1 - z0) * u, couleurs[i % couleurs.length]]); } };
  feston(-24, 23.4, 24, 23.4, 3.6); feston(-27.4, 21, -27.4, -12, 3.6); feston(27.4, 21, 27.4, -12, 3.6);
  // un fil d'ampoules tendu d'un point à un autre, qui pend au milieu
  const cable = (x0, z0, ya, x1, z1, yb, creux = .6) => { const l = Math.hypot(x1 - x0, z1 - z0), n = Math.max(2, Math.round(l / .42));
    for (let i = 0; i <= n; i++) { const u = i / n; ampoules.push([x0 + (x1 - x0) * u, ya + (yb - ya) * u - 4 * creux * u * (1 - u), z0 + (z1 - z0) * u, couleurs[(i * 5) % couleurs.length]]); } };
  // au-dessus des rues : d'un réverbère du trottoir à celui de la place, en travers ; et le tour de la place, de réverbère en réverbère
  for (const [a, b] of [[[-18, 21.5], [-14.6, 10.6]], [[-6, 21.5], [-7, 10.9]], [[6, 21.5], [7, 10.9]], [[18, 21.5], [14.6, 10.6]], [[-6, 21.5], [7, 10.9]], [[6, 21.5], [-7, 10.9]],
      [[-25.4, 2], [-14.8, -2]], [[25.4, 12], [14.6, 10.6]], [[-25.4, -14], [-14.6, -14.9]], [[25.4, -14], [14.6, -14.9]], [[-25.4, 16], [-14.6, 10.6]]]) cable(a[0], a[1], y0 + 4.2, b[0], b[1], y0 + 4.2, 1);
  for (const [a, b] of [[[-14.6, 10.6], [-7, 10.9]], [[7, 10.9], [14.6, 10.6]], [[14.6, 10.6], [14.8, -2]], [[14.8, -2], [14.6, -14.9]], [[-14.6, 10.6], [-14.8, -2]], [[-14.8, -2], [-14.6, -14.9]], [[-14.6, -14.9], [-5.5, -15.2]], [[5.5, -15.2], [14.6, -14.9]]]) cable(a[0], a[1], y0 + 3.7, b[0], b[1], y0 + 3.7, .55);
  // ---- les modèles 3D (Sketchfab, CC-BY : feu tricolore par Sylvain Delandre, bouche d'incendie par albacaizaresalvrz, Simca 1000 et Volkswagen 1303 par
  //      Configcars / maxipub ; CC-BY-NC-SA : « Mon beau sapin » par koafranck), allégés ; chacun chargé une fois, posé en instances ----
  const kfCache = {}, chargerKF = f => kfCache[f] || (kfCache[f] = KF_ATTENTES[KF_ATTENTES.push((async () => { gltfMod = gltfMod || await import("./vendor/GLTFLoader.js?v=1"); const g = await new gltfMod.GLTFLoader().loadAsync("avatars/kingston/" + f + ".glb?v=1");
    g.scene.updateMatrixWorld(true); const parMat = new Map();
    g.scene.traverse(o => { if (!o.isMesh) return; const m = Array.isArray(o.material) ? o.material[0] : o.material; if (!parMat.has(m)) parMat.set(m, []);
      // (les pièces répétées — les segments d'un mât… — sont des instances : une copie par instance)
      const n = o.isInstancedMesh ? o.count : 1, mi = new THREE.Matrix4(), mw = new THREE.Matrix4();
      for (let i = 0; i < n; i++) { let ge = o.geometry.clone(); if (o.isInstancedMesh) { o.getMatrixAt(i, mi); mw.multiplyMatrices(o.matrixWorld, mi); } else mw.copy(o.matrixWorld);
        ge.applyMatrix4(mw); if (ge.index) ge = ge.toNonIndexed(); for (const k of Object.keys(ge.attributes)) if (!["position", "normal", "uv"].includes(k)) ge.deleteAttribute(k); parMat.get(m).push(ge); } });
    const parts = [...parMat].map(([m, l]) => { const n = l.reduce((a, q) => a + q.attributes.position.count, 0), r = new THREE.BufferGeometry();
      for (const [k, d] of [["position", 3], ["normal", 3], ["uv", 2]]) { const a = new Float32Array(n * d); let o = 0; for (const q of l) { if (q.attributes[k]) a.set(q.attributes[k].array, o * d); o += q.attributes.position.count; } r.setAttribute(k, new THREE.BufferAttribute(a, d)); }
      if (m.transparent && m.opacity > .9) { m.transparent = false; m.alphaTest = .5; } return [r, m]; });
    const bb = new THREE.Box3(); for (const [q] of parts) { q.computeBoundingBox(); bb.union(q.boundingBox); }
    const cx = (bb.min.x + bb.max.x) / 2, cz = (bb.min.z + bb.max.z) / 2; for (const [q] of parts) { q.translate(-cx, -bb.min.y, -cz); q.computeBoundingBox(); q.computeBoundingSphere(); }
    const t = bb.getSize(new THREE.Vector3()); return { parts, t }; })()) - 1]);
  const mt4 = (x, y, z, ry, sx, sy = sx, sz = sx, rx = 0, rz = 0) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, "YXZ")), new THREE.Vector3(sx, sy, sz));
  const poser = (parts, mats, ombre = true, matDe = m => m) => parts.map(([g, m]) => { const im = new THREE.InstancedMesh(g, matDe(m), mats.length); mats.forEach((q, i) => im.setMatrixAt(i, q)); im.castShadow = ombre; im.receiveShadow = true; scene.add(im); return im; });
  // la neige poudrée sur les aiguilles : tout ce qui regarde le ciel blanchit (dans le shader, d'après la normale)
  const poudre = (m, k = .8) => { m = m.clone(); m.onBeforeCompile = sh => {
      sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying float vNeigeY;").replace("#include <begin_vertex>", `#include <begin_vertex>
        vec3 nwN = objectNormal;
        #ifdef USE_INSTANCING
        nwN = mat3(instanceMatrix) * nwN;
        #endif
        vNeigeY = normalize(mat3(modelMatrix) * nwN).y;`);
      sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nvarying float vNeigeY;").replace("#include <map_fragment>", `#include <map_fragment>
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.9, .93, .98), smoothstep(.3, .8, vNeigeY) * ${k.toFixed(2)});`); };
    m.customProgramCacheKey = () => "poudre" + k; return m; };
  // ---- le grand sapin de la place : il domine la ville ; la guirlande d'ampoules en spirale, les boules, l'étoile ----
  const GS = { x: 0, z: 5.2, H: 15, R: 3.3 }, ventes = [];
  { const { x, z, H, R } = GS;
    for (let i = 0; i < 520; i++) { const u = .07 + i / 520 * .86, a = u * 8.5 * Math.PI * 2, r = R * (1 - u) * 1.02 + .12; ampoules.push([x + Math.cos(a) * r, y0 + H * u, z + Math.sin(a) * r, couleurs[i % couleurs.length]]); }
    for (let i = 0; i < 160; i++) { const u = .08 + alea() * .84, a = alea() * 6.283, r = R * (1 - u) * .98 + .08; (i % 3 ? ampoules : boules).push([x + Math.cos(a) * r, y0 + H * u - (i % 3 ? 0 : .15), z + Math.sin(a) * r, couleurs[i % 5]]); }
    const et = new THREE.Shape(); for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2 + Math.PI / 2, r = (k % 2 ? .3 : .75); et[k ? "lineTo" : "moveTo"](Math.cos(a) * r, Math.sin(a) * r); }
    const st = new THREE.Mesh(new THREE.ExtrudeGeometry(et, { depth: .12, bevelEnabled: false }).translate(0, 0, -.06), or); st.position.set(x, y0 + H + .35, z); scene.add(st); L.etoilesNoel = [st];
    const p = new THREE.PointLight(0xffc880, 14, 22, 1.5); p.position.set(x, y0 + 5, z + 4.5); scene.add(p);
    obst.push([x, z, R * .95]); }
  // ---- la vente de sapins, sur la place : des sapins de toutes les tailles serrés les uns contre les autres, la cabane du vendeur, les ampoules au-dessus ----
  const VS = { x0: -14.4, x1: -9.2, z0: 4.2, z1: 10.2 };
  { const bois = A.mat({ color: 0x6a4428, roughness: .9 }), boisC = A.mat({ color: 0x8a5a32, roughness: .85 });
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { const x = VS.x0 + .8 + c * 1.25 + (alea() - .5) * .35, z = VS.z0 + 1 + r * 1.35 + (alea() - .5) * .3, h = 1.2 + alea() * 1.8;
      ventes.push(mt4(x, y0, z, alea() * 6.28, h * .1 * (.8 + alea() * .25), h / 9.81 * 1, h * .1 * (.8 + alea() * .25), (alea() - .5) * .08, (alea() - .5) * .08)); obst.push([x, z, .45]); }
    // ceux qui attendent, appuyés contre la barrière
    for (let i = 0; i < 6; i++) { const z = VS.z0 + .5 + i * .95, h = 2 + alea() * .6; ventes.push(mt4(VS.x0 - .1, y0 + .05, z, alea() * 6, h * .085, h / 9.81, h * .085, 0, -.32)); }
    // la barrière : deux lisses sur des piquets
    for (let i = 0; i <= 6; i++) A.ajoute(new THREE.BoxGeometry(.08, 1.1, .08), bois, VS.x0 - .55, y0 + .55, VS.z0 + i * (VS.z1 - VS.z0) / 6);
    for (const y of [.5, .95]) A.ajoute(new THREE.BoxGeometry(.05, .08, VS.z1 - VS.z0), boisC, VS.x0 - .5, y0 + y, (VS.z0 + VS.z1) / 2);
    // la cabane du vendeur, son enseigne peinte
    { const cx = VS.x1 - .3, cz = VS.z1 - .9; A.ajoute(new THREE.BoxGeometry(1.6, 2.1, 1.3), boisC, cx, y0 + 1.05, cz); A.ajoute(new THREE.BoxGeometry(1.9, .1, 1.6), bois, cx, y0 + 2.15, cz);
      A.ajoute(new THREE.BoxGeometry(1.9, .14, 1.6), neige, cx, y0 + 2.27, cz); A.ajoute(new THREE.BoxGeometry(1.2, .7, .05), A.mat({ color: 0x1a120c }), cx - .1, y0 + 1.25, cz + .66);   // (le guichet ouvert)
      const ens = tex(toile(512, 128, (x) => { x.fillStyle = "#b8141c"; x.fillRect(0, 0, 512, 128); x.strokeStyle = "#f4ead0"; x.lineWidth = 6; x.strokeRect(6, 6, 500, 116); x.fillStyle = "#f4ead0"; x.font = "bold 50px Georgia, serif"; x.textAlign = "center"; x.fillText("CHRISTMAS TREES", 256, 62); x.font = "bold 34px Georgia, serif"; x.fillText("from $15", 256, 106); }));
      const e = new THREE.Mesh(new THREE.PlaneGeometry(2.1, .52), new THREE.MeshStandardMaterial({ map: ens, roughness: .7, emissive: 0xffffff, emissiveMap: ens, emissiveIntensity: .25 })); e.position.set(cx, y0 + 2.62, cz + .82); scene.add(e);
      obst.push([cx, cz, 1.1]); }
    // les ampoules tendues au-dessus du lot, de piquet en piquet
    const pq = [[VS.x0 - .55, VS.z0], [VS.x0 - .55, VS.z1], [VS.x1 + .5, VS.z1], [VS.x1 + .5, VS.z0]];
    for (const [x, z] of pq) A.ajoute(new THREE.CylinderGeometry(.05, .06, 2.9, 8), bois, x, y0 + 1.45, z);
    for (let i = 0; i < 4; i++) cable(...pq[i], y0 + 2.85, ...pq[(i + 1) % 4], y0 + 2.85, .35);
    cable(pq[0][0], pq[0][1], y0 + 2.85, pq[2][0], pq[2][1], y0 + 2.85, .5); cable(pq[1][0], pq[1][1], y0 + 2.85, pq[3][0], pq[3][1], y0 + 2.85, .5); }
  chargerKF("sapin").then(({ parts, t }) => { const k = GS.H / t.y, kx = GS.R * 2 / t.x;
    poser(parts, [mt4(GS.x, y0, GS.z, 0, kx, k, kx), ...ventes], true, m => poudre(m, .55)); }).catch(e => console.warn("sapin", e));
  // ---- les feux tricolores, aux quatre coins des deux carrefours ; ils passent du vert à l'orange au rouge ----
  { const pos = []; for (const sx of [-1, 1]) { const cx = sx * 20.2, cz = 16.2; for (const [x, z] of [[sx * 15.75, 11.75], [sx * 24.65, 20.65], [sx * 15.75, 20.65], [sx * 24.65, 11.75]]) pos.push([x, z, Math.atan2(cx - x, cz - z), Math.abs(x) < 20 === z < 16 ? 0 : 1]); }
    const H = 3.3; L.feux = [];
    chargerKF("feu").then(({ parts, t }) => { const k = H / t.y; poser(parts, pos.map(([x, z, r]) => mt4(x, y0, z, r, k)));
      // les trois lampes : on les rallume par-dessus le modèle (devant chaque optique)
      let zMax = 0; for (const [g] of parts) { const P = g.attributes.position; for (let i = 0; i < P.count; i++) if (P.getY(i) > t.y * .8 && Math.abs(P.getX(i)) < t.x * .3) zMax = Math.max(zMax, P.getZ(i)); }
      const disque = new THREE.CircleGeometry(t.x * .2 * k, 16), C3 = [0xff2a1a, 0xffb020, 0x30ff70];
      pos.forEach(([x, z, r, phase]) => { const g = new THREE.Group(); g.position.set(x, y0, z); g.rotation.y = r; scene.add(g);
        const lp = C3.map((c, i) => { const m = new THREE.Mesh(disque, new THREE.MeshBasicMaterial({ color: c, toneMapped: false })); m.position.set(0, (t.y * (.955 - i * .058)) * k, zMax * k + .012); g.add(m); return m; });
        L.feux.push({ lp, phase }); }); }).catch(e => console.warn("feu", e)); }
  // ---- les bouches d'incendie (le modèle), à la place des jaunes ; un chapeau de neige ----
  { (L.bouchesHV || []).forEach(g => g.visible = false); const pts = (L.bouchesHV || []).map(g => [g.position.x, g.position.z]);
    chargerKF("borne").then(({ parts, t }) => { const k = .82 / t.y; poser(parts, pts.map(([x, z], i) => mt4(x, y0, z, i * 1.3, k)));
      const cap = new THREE.InstancedMesh(blob(2, .2), neigeArbre, pts.length); pts.forEach(([x, z], i) => cap.setMatrixAt(i, mt4(x, y0 + .8, z, i, .13, .06, .13))); scene.add(cap); }).catch(e => console.warn("borne", e)); }
  // ---- les voitures garées le long des trottoirs, ensevelies sous la neige (la Simca, la Coccinelle) ; les gremlins grimpent dessus ----
  // la neige posée sur le toit, le capot, le coffre : on relève le dessus de la voiture (le plus haut point sous chaque case d'une grille), on y pose un coussin
  const coussin = (parts, t, sc) => { const NX = 30, NZ = 64, x0 = -t.x / 2, z0 = -t.z / 2, dx = t.x / NX, dz = t.z / NZ, W = NX + 1, h = new Float32Array(W * (NZ + 1)).fill(-1);
    for (const [g] of parts) { const P = g.attributes.position.array;
      for (let q = 0; q < P.length; q += 9) { const ax = P[q], ay = P[q + 1], az = P[q + 2], bx = P[q + 3], by = P[q + 4], bz = P[q + 5], cx = P[q + 6], cy = P[q + 7], cz = P[q + 8];
        const d = (bz - cz) * (ax - cx) + (cx - bx) * (az - cz); if (Math.abs(d) < 1e-12) continue;
        const i0 = Math.max(0, Math.ceil((Math.min(ax, bx, cx) - x0) / dx)), i1 = Math.min(NX, Math.floor((Math.max(ax, bx, cx) - x0) / dx)), j0 = Math.max(0, Math.ceil((Math.min(az, bz, cz) - z0) / dz)), j1 = Math.min(NZ, Math.floor((Math.max(az, bz, cz) - z0) / dz));
        for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { const px = x0 + i * dx, pz = z0 + j * dz, l1 = ((bz - cz) * (px - cx) + (cx - bx) * (pz - cz)) / d, l2 = ((cz - az) * (px - cx) + (ax - cx) * (pz - cz)) / d, l3 = 1 - l1 - l2;
          if (l1 < -1e-4 || l2 < -1e-4 || l3 < -1e-4) continue; const y = l1 * ay + l2 * by + l3 * cy, kk = j * W + i; if (y > h[kk]) h[kk] = y; } } }
    const ok = new Uint8Array(W * (NZ + 1)); for (let k = 0; k < ok.length; k++) ok[k] = h[k] > t.y * .6 && Math.abs(x0 + (k % W) * dx) < t.x * .43 ? 1 : 0;   // (le dessus seulement : toit, capot, coffre)
    const dist = new Float32Array(ok.length); for (let k = 0; k < ok.length; k++) dist[k] = ok[k] ? 9 : 0;   // (la distance au bord, en cases : le coussin s'arrondit vers les bords)
    for (let it = 0; it < 4; it++) for (let j = 0; j <= NZ; j++) for (let i = 0; i <= NX; i++) { const k = j * W + i; if (!ok[k]) continue; let m = 9; for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const ii = i + a, jj = j + b; m = Math.min(m, ii < 0 || jj < 0 || ii > NX || jj > NZ ? 0 : dist[jj * W + ii] + 1); } dist[k] = Math.min(dist[k], m); }
    const ep = .085 / sc, pos = new Float32Array(ok.length * 3), uv = new Float32Array(ok.length * 2), idx = [];
    for (let j = 0; j <= NZ; j++) for (let i = 0; i <= NX; i++) { const k = j * W + i; pos.set([x0 + i * dx, Math.max(0, h[k]) + .004 / sc + ep * Math.min(1, dist[k] / 2.6) ** .7 * (.85 + .3 * hasard(k * 1.7)), z0 + j * dz], k * 3); uv.set([i / NX * 2, j / NZ * 4], k * 2); }
    for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) { const a = j * W + i, b = a + 1, c = a + W, d2 = c + 1; if (!(ok[a] && ok[b] && ok[c] && ok[d2])) continue;
      const hs = [h[a], h[b], h[c], h[d2]]; if (Math.max(...hs) - Math.min(...hs) > (dx + dz) * 1.1) continue; idx.push(a, c, b, b, c, d2); }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
    // le toit : la zone la plus haute (là où grimpent les gremlins)
    let hm = 0; for (let k = 0; k < h.length; k++) hm = Math.max(hm, h[k]); const toit = new THREE.Box2(); for (let j = 0; j <= NZ; j++) for (let i = 0; i <= NX; i++) if (h[j * W + i] > hm * .94) toit.expandByPoint(new THREE.Vector2(x0 + i * dx, z0 + j * dz));
    return { g, toit, hm: hm + ep }; };
  L.perchesKF = [];
  const GAREES = [["simca", -12, 20.15, Math.PI / 2], ["coccinelle", -6.3, 20.15, -Math.PI / 2, 0x2a5aa8], ["simca", 3.5, 12.3, -Math.PI / 2], ["coccinelle", 9, 12.3, Math.PI / 2, 0xb8241c],
    ["coccinelle", -23.95, 4, Math.PI], ["simca", -23.95, -2.2, 0], ["coccinelle", 23.95, -8.5, 0, 0xe8dcb0], ["simca", 16.3, -6, Math.PI]];
  for (const f of ["simca", "coccinelle"]) { const liste = GAREES.filter(v => v[0] === f), LONG = f === "simca" ? 3.8 : 4.07;
    for (const [, x, z, r] of liste) for (const k of [-1.3, 0, 1.3]) obst.push([x + Math.sin(r) * k, z + Math.cos(r) * k, 1.0]);
    chargerKF(f).then(({ parts, t }) => { const s = LONG / t.z, { g, toit, hm } = coussin(parts, t, s);
      // la Coccinelle : sa carrosserie (la matière « base ») repeinte, une couleur par voiture
      const parCouleur = new Map(); liste.forEach((v, i) => { const c = v[4] ?? -1; if (!parCouleur.has(c)) parCouleur.set(c, []); parCouleur.get(c).push(i); });
      for (const [c, ii] of parCouleur) { const mats = ii.map(i => { const [, x, z, r] = liste[i]; return mt4(x, 0, z, r, s); });
        poser(parts, mats, false, m => { if (c < 0 || m.name !== "base") return m; const m2 = m.clone(); m2.color.setHex(c); return m2; }); }
      const im = new THREE.InstancedMesh(g, neige, liste.length); liste.forEach(([, x, z, r], i) => im.setMatrixAt(i, mt4(x, 0, z, r, s))); im.receiveShadow = true; im.castShadow = true; scene.add(im);
      for (const [, x, z, r] of liste) { const c = toit.getCenter(new THREE.Vector2()), cs = Math.cos(r), sn = Math.sin(r);
        L.perchesKF.push({ x: x + (c.x * cs + c.y * sn) * s, z: z + (-c.x * sn + c.y * cs) * s, y: hm * s, r, hx: Math.max(.15, (toit.max.x - toit.min.x) / 2 * s - .15), hz: Math.max(.2, (toit.max.y - toit.min.y) / 2 * s - .15), occ: 0 }); } }).catch(e => console.warn("voiture", f, e)); }
  // ---- le bus scolaire (un scan) : en travers de la rue qui part au nord-ouest de la place, comme s'il avait dérapé dans la neige ; la neige plein le toit ----
  chargerKF("bus").then(({ parts, t }) => { const s = 9.4 / t.z, M4 = mt4(-23, -.02, -19.3, Math.PI / 2 - .44, s, s, s, 0, .03);
    for (const [ge] of parts) ge.computeVertexNormals();   // (le scan n'a pas de normales : sans elles, il restait tout noir)
    poser(parts, [M4], true, m => new THREE.MeshStandardMaterial({ map: m.map, roughness: .6, metalness: .1, side: THREE.DoubleSide }));
    const { g } = coussin(parts, t, s), im = new THREE.InstancedMesh(g, neige, 1); im.setMatrixAt(0, M4); im.castShadow = im.receiveShadow = true; scene.add(im);
    // des congères contre ses flancs et ses roues (le vent l'a ensablé de neige)
    const r = Math.PI / 2 - .44, cs = Math.cos(r), sn = Math.sin(r), pts = []; for (const lx of [-1.45, 1.45]) for (let lz = -4.4; lz <= 4.5; lz += 1.25) pts.push([lx + (Math.random() - .5) * .2, lz]);
    pts.push([0, -5.1], [0, 5]); const cg = new THREE.InstancedMesh(blob(2, .3), neigeArbre, pts.length);
    pts.forEach(([lx, lz], i) => cg.setMatrixAt(i, mt4(-23 + lx * cs + lz * sn, 0, -19.3 - lx * sn + lz * cs, r + Math.random(), .75 + Math.random() * .3, .3 + Math.random() * .15, .6 + Math.random() * .25))); cg.receiveShadow = true; scene.add(cg); }).catch(e => console.warn("bus", e));
  // ---- la voiture de police (CC-BY : « Police car » par Mateusz Woliński) : attaquée, des gremlins plein le capot et le pare-brise, elle tourne autour de la place
  //      en zigzag, de travers, gyrophares rouge et bleu allumés sans arrêt — ils éclairent la neige et les façades au passage ----
  const gPol = new THREE.Group(), rougeP = new THREE.PointLight(0xff1a1a, 0, 22, 1.3), bleuP = new THREE.PointLight(0x2a5aff, 0, 22, 1.3);
  gPol.add(rougeP, bleuP); gPol.position.set(0, -50, 0); scene.add(gPol);   // (les lampes de la voiture de police, dès la construction : une lampe ajoutée plus tard fait tout recompiler — la saccade)
  chargerKF("police").then(({ parts, t }) => { const s = 5.4 / t.z, g = gPol; L.policeG = g;
    let barre = null, haut = 0;
    for (const [geo, m] of parts) { const m2 = m.name === "roof_lights" ? m.clone() : m, me = new THREE.Mesh(geo, m2); me.scale.setScalar(s); me.castShadow = true; g.add(me);
      if (m.name === "roof_light_bar") barre = geo.boundingBox.clone(); if (m.name === "roof_lights") L.policeOptiques = m2; if (m.name === "body") haut = geo.boundingBox.max.y * s; }
    const yb = barre ? barre.max.y * s + .12 : haut + .2, lb = barre ? (barre.max.x - barre.min.x) * s / 2 : .5, zb = barre ? (barre.min.z + barre.max.z) / 2 * s : 0;
    const rouge = rougeP, bleu = bleuP; rouge.position.set(lb * .7, yb, zb); bleu.position.set(-lb * .7, yb, zb); g.add(rouge, bleu);
    const lueur = c => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: L.halos ? L.halos.material.map : null, color: c, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false })); sp.scale.set(2.2, 2.2, 1); g.add(sp); return sp; };
    const hr = lueur(0xff2020), hb = lueur(0x3060ff); hr.position.copy(rouge.position); hb.position.copy(bleu.position);
    // les phares allumés : deux lueurs blanches devant, deux feux rouges derrière
    for (const sx of [-1, 1]) { const ph = lueur(0xfff4dc); ph.scale.set(1.1, 1.1, 1); ph.position.set(sx * t.x * s * .34, .72, t.z * s / 2 + .02); ph.visible = true;
      const ar = lueur(0xff1a10); ar.scale.set(.7, .7, 1); ar.position.set(sx * t.x * s * .36, .85, -t.z * s / 2 - .02); }
    // les gremlins accrochés : un sur le pare-brise, deux sur le capot, un sur le toit (des perchoirs qui roulent avec la voiture)
    // (couchés à plat ventre, la tête vers l'arrière : les pieds vers l'avant de la voiture ; sur le pare-brise, plus redressé)
    const offs = [[-.25, haut * .74, 1.05, 1.0], [.3, haut * .74, 1.0, 1.0], [-.35, haut * .6, 2.15, 1.5], [.38, haut * .6, 2.2, 1.5], [0, haut * .97, .05, 1.5]];
    const per = offs.map(([, , , ap]) => ({ x: 0, z: 0, y: 0, r: 0, hx: .02, hz: .02, occ: 0, cap: 1, colle: true, aplat: ap })); L.perchesKF.unshift(...per);
    const C = L.circuit, CL = L.circuitL || 100; let u = .15;
    let vP = 8.5, zP = 0, trP = 0;
    L.policeMaj = (dt, tt) => { if (!C) return; vP = L.gremlinsFinis ? Math.max(0, vP - dt * 4) : 8.5; u = (u + vP * dt / CL) % 1; const T = tt / 1000, kv = vP / 8.5;   // (les gremlins brûlés : la voiture freine et s'arrête, de travers, gyrophares allumés)
      if (kv > 0) { zP = Math.sin(T * 1.6) * 1.5 * kv + zP * (1 - kv); trP = .5 * Math.sin(T * 1.6 + 1.1) * kv + trP * (1 - kv); }
      const p = C.getPointAt(u), d = C.getTangentAt(u), zz = zP, travers = trP;   // (il zigzague d'un trottoir à l'autre, l'arrière qui chasse)
      g.position.set(p.x + d.z * zz, 0, p.z - d.x * zz); g.rotation.set(0, Math.atan2(d.x, d.z) + travers, .035 * kv * Math.sin(T * 3.2), "YXZ");
      g.updateMatrixWorld(); const v = new THREE.Vector3();
      offs.forEach(([x, y, z], k) => { v.set(x, y, z).applyMatrix4(g.matrixWorld); Object.assign(per[k], { x: v.x, z: v.z, y: v.y, r: g.rotation.y + Math.PI }); });
      // ce qu'elle touche, elle le catapulte : les passants volent, les gremlins meurent (et reviennent ailleurs), Gizmo perd un cœur
      if (vP > .5) { const cs = Math.cos(g.rotation.y), sn = Math.sin(g.rotation.y), fx = sn, fz = cs, dedans = (x, z, m) => { const dx = x - g.position.x, dz = z - g.position.z, lz = dx * fx + dz * fz, lx = dx * cs - dz * sn; return Math.abs(lz) < 2.75 + m && Math.abs(lx) < 1.0 + m ? Math.sign(lx) || 1 : 0; };
        const sauf = new Set(per.map(p => p));
        for (const q of L.gremlins || []) { if (q.mort > 0 || q.ejecte || (q.perche && sauf.has(q.perche))) continue; const c = dedans(q.x, q.z, .15); if (c) L.ejecterGremlin(q, fx * 9 + c * cs * 5, fz * 9 - c * sn * 5); }
        for (const q of L.passants || []) { if (q.vole) continue; const c = dedans(q.x, q.z, .1); if (c) { q.vole = { vx: fx * 7 + c * cs * 4, vz: fz * 7 - c * sn * 4 }; q.vy = 5.5; q.sy = .05; } }
        const moi = M && M.gens.get(M.moiNum); if (moi && M.lieu === "kingston" && L.blesserGizmo) { const p = moi.g.position, c = dedans(p.x, p.z, .05); if (c) L.blesserGizmo(fx * .6 + c * cs * .8, fz * .6 - c * sn * .8); } }
      // les gyrophares : deux éclats rouges, deux éclats bleus, sans fin
      const f = (T * 1.6) % 1, eclat = (Math.floor(f * 8) % 2) === 0, r = f < .5 ? eclat : !eclat && Math.floor(f * 8) % 4 === 1, b = !r;   // (rouge, bleu, rouge, bleu… jamais éteints tous les deux)
      rouge.intensity = r ? 60 : 0; bleu.intensity = b ? 60 : 0; hr.visible = r; hb.visible = b; hr.scale.setScalar(3); hb.scale.setScalar(3);
      if (L.policeOptiques && L.policeOptiques.emissive) { L.policeOptiques.emissive.setHex(r ? 0xff2020 : b ? 0x2050ff : 0); L.policeOptiques.emissiveIntensity = 3; } };
  }).catch(e => console.warn("police", e));
  // ---- la tour radio (CC-BY : « Radio Communications Tower » par Duane's Mind), dans son enclos grillagé, au coin nord-est de la place : elle domine la ville ;
  //      c'est là qu'il faudra aller pour électrocuter la ville (et ses gremlins). Son feu rouge clignote au sommet ----
  { const cx = (TOUR.x0 + TOUR.x1) / 2, cz = (TOUR.z0 + TOUR.z1) / 2; L.tourRadio = { x: cx, z: cz };
    for (let x = TOUR.x0 + .6; x < TOUR.x1; x += 1.1) for (let z = TOUR.z0 + .6; z < TOUR.z1; z += 1.1) obst.push([x, z, .78]);
    chargerKF("antenne").then(({ parts, t }) => { const k = Math.min(TOUR.x1 - TOUR.x0, TOUR.z1 - TOUR.z0) / Math.max(t.x, t.z); poser(parts, [mt4(cx, y0, cz, 0, k)]);
      const feu = new THREE.Sprite(new THREE.SpriteMaterial({ map: L.halos ? L.halos.material.map : null, color: 0xff2010, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false }));
      feu.scale.set(1.6, 1.6, 1); feu.position.set(cx, y0 + t.y * k + .3, cz); { const gF = new THREE.Group(); gF.add(feu); scene.add(gF); } L.feuTour = feu; }).catch(e => console.warn("tour", e)); }
  // ---- la quête de l'antenne : une pince coupante cachée dehors (à chaque partie, ailleurs) ; une grille autour de l'antenne, fermée d'une chaîne et d'un cadenas ;
  //      on coupe la chaîne, on entre, on abaisse le levier du boîtier électrique : les quatre projecteurs (ceux de la terrasse de Resident Evil) s'allument aux coins de la ville ----
  { const F = { x0: 3.6, x1: 15, z0: -15.4, z1: -2.4 }, GX0 = 8.6, GX1 = 10.6, HG2 = 2.3, LX = 12.8, LZ = -3.3, Q = {};
    const dansGrille = (x, z) => x > F.x0 - .6 && x < F.x1 + .6 && z > F.z0 - .6 && z < F.z1 + .6;
    // le grillage : des losanges de fil de fer (on voit à travers), des poteaux, une barre en haut
    const grT = tex(toile(64, 64, x => { x.clearRect(0, 0, 64, 64); x.strokeStyle = "#c8ccd2"; x.lineWidth = 3; x.beginPath(); x.moveTo(0, 32); x.lineTo(32, 0); x.lineTo(64, 32); x.lineTo(32, 64); x.closePath(); x.stroke(); }));
    grT.wrapS = grT.wrapT = THREE.RepeatWrapping;
    const grM = new THREE.MeshStandardMaterial({ map: grT, alphaTest: .4, side: THREE.DoubleSide, metalness: .6, roughness: .45, color: 0xc0c6cc }), ferM = new THREE.MeshStandardMaterial({ color: 0x7a8088, metalness: .7, roughness: .4 });
    const grillage = (len, h) => { const g = new THREE.PlaneGeometry(len, h), uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * len / .32, uv.getY(i) * h / .32); g.translate(len / 2, h / 2, 0); return new THREE.Mesh(g, grM); };
    const seg = (ax, az, bx, bz) => { const l = Math.hypot(bx - ax, bz - az), r = -Math.atan2(bz - az, bx - ax), m = grillage(l, HG2); m.position.set(ax, y0 + .05, az); m.rotation.y = r; scene.add(m);
      const rail = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, l, 6).rotateZ(Math.PI / 2).translate(l / 2, 0, 0), ferM); rail.position.set(ax, y0 + HG2 + .05, az); rail.rotation.y = r; scene.add(rail);
      const n = Math.max(1, Math.round(l / 2.5)); for (let i = 0; i <= n; i++) { const u = i / n, po = new THREE.Mesh(new THREE.CylinderGeometry(.045, .05, HG2 + .1, 8), ferM); po.position.set(ax + (bx - ax) * u, y0 + (HG2 + .1) / 2, az + (bz - az) * u); scene.add(po); }
      for (let d = 0; d <= l; d += .45) obst.push([ax + (bx - ax) * d / l, az + (bz - az) * d / l, .32]); };
    seg(F.x0, F.z0, F.x1, F.z0); seg(F.x0, F.z0, F.x0, F.z1); seg(F.x1, F.z0, F.x1, F.z1); seg(F.x0, F.z1, GX0, F.z1); seg(GX1, F.z1, F.x1, F.z1);
    // la porte de la grille (elle pivote sur son poteau de gauche), la chaîne enroulée et le gros cadenas
    const porte = new THREE.Group(); porte.position.set(GX0, y0 + .05, F.z1); scene.add(porte);
    { const pg = grillage(GX1 - GX0 - .1, HG2 - .1); pg.position.set(.05, .05, 0); porte.add(pg);
      for (const [l, x, y, r] of [[GX1 - GX0, (GX1 - GX0) / 2, .06, Math.PI / 2], [GX1 - GX0, (GX1 - GX0) / 2, HG2 - .04, Math.PI / 2], [HG2, .04, HG2 / 2, 0], [HG2, GX1 - GX0 - .04, HG2 / 2, 0]]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(.035, .035, l, 6), ferM); b.position.set(x, y, 0); b.rotation.z = r; porte.add(b); } }
    const chaine = new THREE.Group(); chaine.position.set(GX1 - .05, y0 + 1.15, F.z1); scene.add(chaine);
    { const acier = new THREE.MeshStandardMaterial({ color: 0x9aa0a8, metalness: .85, roughness: .3 }), mail = new THREE.TorusGeometry(.045, .012, 6, 12);
      for (let i = 0; i < 9; i++) { const m = new THREE.Mesh(mail, acier), a = i / 9 * Math.PI * 2; m.position.set(Math.cos(a) * .12, Math.sin(a) * .16 - (i % 2) * .02, Math.sin(a) * .06); m.rotation.set(i % 2 ? Math.PI / 2 : 0, a, 0); chaine.add(m); }
      const cad = new THREE.Mesh(new THREE.BoxGeometry(.11, .13, .05), new THREE.MeshStandardMaterial({ color: 0xb08a2a, metalness: .8, roughness: .35 })); cad.position.set(.02, -.26, .07); chaine.add(cad);
      const anse = new THREE.Mesh(new THREE.TorusGeometry(.035, .01, 6, 12, Math.PI), acier); anse.position.set(.02, -.19, .07); chaine.add(anse); }
    const portObs = []; for (let x = GX0; x <= GX1; x += .4) { const o = [x, F.z1, .32]; portObs.push(o); obst.push(o); }
    // le boîtier électrique, dans la cour de l'antenne, et son levier (en haut : éteint)
    const boite = new THREE.Group(); boite.position.set(LX, y0, LZ); scene.add(boite); obst.push([LX, LZ, .4]);
    { const vert = new THREE.MeshStandardMaterial({ color: 0x4a5a48, roughness: .6, metalness: .4 }); const b = new THREE.Mesh(new THREE.BoxGeometry(.6, .8, .3), vert); b.position.y = 1.0; boite.add(b);
      const pied = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, .6, 6), ferM); pied.position.y = .3; boite.add(pied);
      const pl = new THREE.Mesh(new THREE.PlaneGeometry(.22, .14), new THREE.MeshBasicMaterial({ map: tex(toile(64, 40, x => { x.fillStyle = "#f2d020"; x.fillRect(0, 0, 64, 40); x.fillStyle = "#111"; x.font = "bold 30px Arial"; x.textAlign = "center"; x.fillText("⚡", 32, 32); })) })); pl.position.set(-.12, 1.2, .152); boite.add(pl); }
    const levier = new THREE.Group(); levier.position.set(.2, 1.05, .17); boite.add(levier);
    { const bras = new THREE.Mesh(new THREE.CylinderGeometry(.02, .02, .32, 6), ferM); bras.position.y = .16; levier.add(bras); const bout = new THREE.Mesh(new THREE.SphereGeometry(.045, 10, 8), new THREE.MeshStandardMaterial({ color: 0xd01818, roughness: .4 })); bout.position.y = .32; levier.add(bout); }
    levier.rotation.x = -.35;
    // les quatre projecteurs sur leur mât, aux quatre coins : éteints (comme ceux de la terrasse de Resident Evil : la tête braquée vers la place, le cône de lumière, la tache claire au sol)
    const halo = tex(toile(64, 64, x => { const gr = x.createRadialGradient(32, 32, 1, 32, 32, 31); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(.35, "rgba(255,255,255,.45)"); gr.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); }));
    const metalP = new THREE.MeshStandardMaterial({ color: 0x3a3c40, roughness: .5, metalness: .7 }), PJ = [];
    for (const [cx, cz] of [[-26.3, 22.3], [26.3, 22.3], [-26.3, -14.9], [26.3, -14.9]]) { const hM = 5.4, p = new THREE.Group(); p.position.set(cx, y0, cz); scene.add(p); obst.push([cx, cz, .35]);
      { const m2 = new THREE.Mesh(new THREE.CylinderGeometry(.07, .1, hM, 8), metalP); m2.position.y = hM / 2; p.add(m2); const base = new THREE.Mesh(new THREE.BoxGeometry(.45, .14, .45), metalP); base.position.y = .07; p.add(base); }
      const lx = -cx * .55, lz = (4 - cz) * .55, vers = new THREE.Vector3(lx, -hM, lz).normalize(), tete = new THREE.Group(); tete.position.y = hM; tete.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), vers); p.add(tete);
      const corps = new THREE.Mesh(new THREE.CylinderGeometry(.3, .25, .45, 14), metalP); corps.rotation.x = Math.PI / 2; tete.add(corps);
      const vitre = new THREE.Mesh(new THREE.CircleGeometry(.26, 16), new THREE.MeshBasicMaterial({ color: 0x2a2c30 })); vitre.position.z = .23; tete.add(vitre);
      const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: halo, color: 0xffffff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); gl.position.z = .35; gl.scale.setScalar(5.5); gl.visible = false; tete.add(gl);
      const dist = Math.hypot(lx, hM, lz) * .95, gc = new THREE.ConeGeometry(3.6, dist, 24, 1, true); gc.translate(0, -dist / 2, 0); gc.rotateX(-Math.PI / 2);
      const cm = new THREE.Mesh(gc, new THREE.MeshBasicMaterial({ color: 0xfff8e8, transparent: true, opacity: .14, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false })); cm.position.z = .25; cm.visible = false; tete.add(cm);
      const t2 = new THREE.Mesh(new THREE.PlaneGeometry(13, 13), new THREE.MeshBasicMaterial({ map: halo, color: 0xfff6e0, transparent: true, opacity: .5, blending: THREE.AdditiveBlending, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3 })); t2.rotation.x = -Math.PI / 2; t2.position.set(lx * .9, .06, lz * .9); t2.visible = false; p.add(t2);
      PJ.push({ vitre, gl, cm, t2 }); }
    const allumer = (P, on) => { P.vitre.material.color.setHex(on ? 0xffffff : 0x2a2c30); P.gl.visible = P.cm.visible = P.t2.visible = on; if (on) { Q.allumes = (Q.allumes || 0) + 1; } };   // (Q.allumes : la ville s'éclaire de plus en plus)
    // les mini pansements : chaque fois que Gizmo est blessé, un pansement apparaît non loin (trois au plus) ; on marche dessus : un cœur de plus
    const panT = tex(toile(64, 24, x => { x.fillStyle = "#e8c69c"; x.fillRect(0, 0, 64, 24); x.fillStyle = "#fffaf2"; x.fillRect(22, 3, 20, 18); x.fillStyle = "#d42020"; x.fillRect(29, 6, 6, 12); x.fillRect(26, 9, 12, 6); x.fillStyle = "rgba(0,0,0,.18)"; for (let i = 3; i < 64; i += 5) if (i < 21 || i > 43) { x.fillRect(i, 7, 1, 2); x.fillRect(i, 15, 1, 2); } }));
    const panG = new THREE.BoxGeometry(.34, .03, .13), panM = new THREE.MeshStandardMaterial({ map: panT, roughness: .7, emissive: 0x3a2412 }), pansements = [];
    L.poserPansement = () => { if (pansements.length >= 3 || !M) return; const moi = M.gens.get(M.moiNum); if (!moi) return; const p = moi.g.position;
      for (let i = 0; i < 80; i++) { const a = Math.random() * 6.28, r = 2.5 + Math.random() * 2.5, x = p.x + Math.cos(a) * r, z = p.z + Math.sin(a) * r; if (!L.limites(x, z) || dansGrille(x, z)) continue;
        const g = new THREE.Group(); g.position.set(x, p.y + .2, z); const m = new THREE.Mesh(panG, panM); m.rotation.z = .5; g.add(m);
        const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: halo, color: 0xff7070, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); gl.scale.setScalar(.8); g.add(gl); scene.add(g); pansements.push({ g, m, gl, x, z }); return; } };
    // la pince coupante : posée dans la neige, quelque part dehors — chaque partie ailleurs ; une lueur qui scintille pour la repérer
    const P = {}; chargerKF("pince").then(({ parts, t }) => { const k = .75 / Math.max(t.x, t.y, t.z), debout = t.y > Math.max(t.x, t.z), sortie = [-26.5, -9.5];   // (debout : le modèle est dressé — on le couche dans la neige)
      for (let i = 0; i < 400 && !P.x; i++) { const x = -26 + Math.random() * 52, z = -15 + Math.random() * 38; if (L.limites(x, z) && [[1.3, 0], [-1.3, 0], [0, 1.3], [0, -1.3]].every(([a, b]) => L.limites(x + a, z + b)) && !dansGrille(x, z) && !(L.dansLou && L.dansLou(x, z)) && Math.hypot(x - sortie[0], z - sortie[1]) > 8) { P.x = x; P.z = z; } }
      if (!P.x) { P.x = 0; P.z = 18; } P.ims = poser(parts, [debout ? mt4(P.x, y0 + .02 + t.z * k / 2, P.z, Math.random() * 6, k, k, k, Math.PI / 2) : mt4(P.x, y0 + .02, P.z, Math.random() * 6, k)]);
      const gG = new THREE.Group(); scene.add(gG); P.gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: halo, color: 0xbfe0ff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); P.gl.position.set(P.x, y0 + .25, P.z); gG.add(P.gl); L.pinceKF = P; }).catch(e => console.warn("pince", e));
    // l'action : un bouton (E au clavier, A à la manette) quand il y a quelque chose à faire ; et dans l'inventaire, la pince
    const ab = document.createElement("button"); ab.type = "button"; ab.style.cssText = "position:absolute;left:50%;bottom:96px;transform:translateX(-50%);z-index:6;padding:12px 20px;border-radius:99px;border:3px solid #ffd23a;background:rgba(30,20,4,.86);color:#fff;font:800 17px 'Lato',sans-serif;display:none;touch-action:manipulation;box-shadow:0 0 16px rgba(255,200,60,.5)";
    for (const ev of ["pointerdown", "touchstart"]) ab.addEventListener(ev, e => { e.preventDefault(); e.stopPropagation(); L.actionKF && L.actionKF(); }, { passive: false });
    const inv = document.createElement("div"); inv.style.cssText = "position:absolute;left:12px;top:80px;z-index:6;font-size:15px;color:#fff;background:rgba(0,0,0,.55);border-radius:10px;padding:4px 10px;pointer-events:none;display:none;font-family:'Lato',sans-serif"; inv.textContent = "✂️ Pince coupante";
    const toucheE = e => { if (/^(INPUT|TEXTAREA)$/.test((e.target && e.target.tagName) || "")) return; if ((e.key === "e" || e.key === "E") && L.actionKF && M && M.lieu === "kingston") L.actionKF(); }; window.addEventListener("keydown", toucheE);
    const gardeQ = setInterval(() => { const ici = !!M && M.lieu === "kingston"; if (ici && !ab.parentNode && M.ctx && M.ctx.conteneur) { M.ctx.conteneur.appendChild(ab); M.ctx.conteneur.appendChild(inv); }
      if (!ici) { ab.style.display = inv.style.display = "none"; } if (!M) { clearInterval(gardeQ); window.removeEventListener("keydown", toucheE); ab.remove(); inv.remove(); } }, 400);
    const info = t => M && M.ctx.surInfo && M.ctx.surInfo(t);
    const couper = () => { if (Q.coupe) return; Q.coupe = true; L.actionKF = null; sonBruit(.12, 3200, .55); setTimeout(() => sonBruit(.25, 900, .4), 120);
      chaine.visible = false; for (const o of portObs) { const i = obst.indexOf(o); if (i >= 0) obst.splice(i, 1); } Q.ouvre = 0;
 };
    const abaisser = () => { if (Q.levier) return; Q.levier = true; Q.lev = 0; L.actionKF = null; sonBruit(.18, 500, .6);
      PJ.forEach((PP, i) => setTimeout(() => { if (!M || M.L !== L) return; sonBruit(.1, 260, .7); allumer(PP, true); setTimeout(() => allumer(PP, false), 90); setTimeout(() => allumer(PP, true), 200); }, 800 + i * 550));
      setTimeout(() => { msgKF("LUMIÈRE !", ""); cineBrulure(); }, 800 + 4 * 550); };
    // la cinématique : la caméra s'élève au-dessus de la place et en fait le tour ; dans la lumière des projecteurs, les gremlins prennent feu, tous, et se tordent, et tombent en cendres
    // la fin : deux gros plans — un gremlin pris dans la lumière, qui s'embrase ; un autre — puis la caméra s'élève au-dessus de la ville : tous brûlent, dans un éclair blanc.
    // Ensuite, la une du journal de Kingston Falls arrive en tournoyant, comme dans les vieux films ; et le générique
    // l'angle d'où l'on voit un gremlin sans rien devant (ni tas de neige, ni voiture, ni réverbère)
    const vueLibre = q => { const rc = new THREE.Raycaster(), c = new THREE.Vector3(q.x, (q.y || 0) + .4, q.z), objs = scene.children.filter(o => !o.isSprite && !o.isPoints && !o.isLight); rc.camera = M.camera; let best = 0, bd = -1;
      for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2, dir = new THREE.Vector3(Math.cos(a) * 2.4, .65, Math.sin(a) * 2.4), l = dir.length(); dir.divideScalar(l); rc.set(c, dir); rc.far = l + .4;
        const h = rc.intersectObjects(objs, true).find(h => h.object.isMesh && h.object.visible && !h.object.isSprite && !(h.object.geometry && h.object.geometry.attributes.aPas)); const d = h ? h.distance : 99; if (d > bd) { bd = d; best = a; } if (!h) break; }
      return best; };
    const cineBrulure = () => { if (!M || M.L !== L) return; const D = 15000, t0 = performance.now(), C = new THREE.Vector3(0, 1, 4), moi = M.gens.get(M.moiNum); let fini = false;
      if (moi) { moi.cible = null; moi.chemin = []; } L.brulerTous && L.brulerTous(900, t0 + 7900);
      const vivants = (L.gremlins || []).filter(q => !(q.mort > 0) && !(q.feu > 0) && !q.ejecte && !(q.perche && q.perche.colle)).sort((a, b) => Math.hypot(a.x, a.z - 4) - Math.hypot(b.x, b.z - 4)), A = vivants[0], B = vivants.find(q => q !== A && Math.hypot(q.x - (A ? A.x : 0), q.z - (A ? A.z : 0)) > 6) || vivants[1];
      for (const [q, dt] of [[A, 1500], [B, 4900]]) if (q) { q.brule = t0 + dt; q.attente = 99; q.cible = null; q.vueA = vueLibre(q); }   // (eux d'abord, devant la caméra ; ils ne bougent plus)

      setTimeout(() => { const w = voile("background:#fff;opacity:.92;transition:opacity 1.1s ease-out"); if (w) { requestAnimationFrame(() => requestAnimationFrame(() => { w.style.opacity = "0"; })); setTimeout(() => w.remove(), 1300); } }, 7850);   // (le grand embrasement : un éclair blanc)
      const fin = () => { if (fini) return; fini = true; finCine(); M.camE = null; if (L.brulerTous) for (const q of L.gremlins || []) if (q.brule) q.brule = performance.now();
        Q.aRelever = true; M.radioKFfile = [];
        setTimeout(() => { if (M && M.L === L) radioKF([["billy", "Gizmo… ils ont tous fondu ! J'ai pu sortir de la voiture, je n'ai rien."], ["billy", "Relève le levier, sinon le générateur va griller toute la ville. Et rejoins-moi au bar : je t'y retrouve."], ["gizmo", "Gizmo… bar !"]]); }, 2200); };
      const v = new THREE.Vector3(), vise = new THREE.Vector3(), plan = (q, k) => { const a = (q.vueA ?? (q.ph || 0) * 2) + k * .3, r = 2.4 - k * .6; v.set(q.x + Math.cos(a) * r, (q.y || 0) + 1 - k * .3, q.z + Math.sin(a) * r); vise.set(q.x, (q.y || 0) + .35, q.z); };
      M.cine = { fov: [50, 62], passer: fin, maj: () => { const ms = performance.now() - t0;
        if (ms < 4000 && A) plan(A, ms / 4000);   // (gros plan : le premier, dans la lumière ; il s'embrase)
        else if (ms < 7600 && (B || A)) plan(B || A, (ms - 4000) / 3600);   // (un autre)
        else { const u = Math.min(1, (ms - 7600) / (D - 7600)), e = u * u * (3 - 2 * u), a = -Math.PI / 2 + e * Math.PI * 1.1, r = 26 - 6 * e, h = 18 - 6 * e; v.set(C.x + Math.cos(a) * r, h, C.z + Math.sin(a) * r); vise.copy(C); }   // (la caméra s'élève : la ville entière)
        M.camera.position.copy(v); M.camera.lookAt(vise); if (ms >= D) fin(); } };
      M.passerBtn = boutonPasser(fin); };
    // relever le levier : les projecteurs s'éteignent un à un… et au bar, le sapin prend feu ; d'autres gremlins y ont trouvé refuge
    const relever = () => { if (Q.releve) return; Q.releve = true; Q.rel = 0; L.actionKF = null; sonBruit(.18, 500, .6);
      PJ.forEach((PP, i) => setTimeout(() => { if (!M || M.L !== L) return; sonBruit(.08, 220, .5); allumer(PP, false); }, 500 + i * 320)); Q.allumes = 0; if (L.ambKF) L.ambKF.intensity = .22;
      L.allumerSapinKF && L.allumerSapinKF(); L.envahirBar && L.envahirBar(); L.desordreBarKF && L.desordreBarKF();
      for (const m of BAR_KF_MATS) m.emissiveIntensity = m.emissiveMap ? .04 : .08;   // (le bar est éteint : seules les guirlandes clignotent, et le sapin qui brûle) L.chargerBossKF && L.chargerBossKF();   // (l'araignée se charge pendant qu'on va au bar)
    };
    // en entrant dans le bar : la cinématique — pendus au plafond au-dessus du comptoir, d'autres qui courent partout, et le sapin en flammes
    const cineBar = () => { const SL = L.salleLou; if (!SL || !M) return; const V = SL.vers, yb = .125, t0 = performance.now(), moi = M.gens.get(M.moiNum), vise = new THREE.Vector3(); let fini = false;
      if (moi) { moi.cible = null; moi.chemin = []; } const P3 = (a, b, h) => { const [x, z] = V(a, b); return new THREE.Vector3(x, yb + h, z); };
      const BK = L.barKF || [], pend = BK.filter(q => q.plafond && !(q.mort > 0))[3] || BK[3], CB = P3(0, -6.5, 1.3), cour = BK.filter(q => !q.plafond && !(q.mort > 0)).sort((a, b) => Math.hypot(b.x - CB.x, b.z - CB.z) - Math.hypot(a.x - CB.x, a.z - CB.z))[0] || BK[7], ou = (q, dy) => q ? new THREE.Vector3(q.x, (q.y || 0) + dy, q.z) : P3(0, -6, 1);   // (on suit des yeux un pendu, puis un coureur)
      const plans = [[P3(-.6, -1.5, .7), P3(-.5, -2.2, .8), ou(pend, .7), ou(pend, .8), 3800], [CB, CB.clone().setY(CB.y - .3), ou(cour, .3), ou(cour, .3), 3400], [P3(-.6, -11, 1.5), P3(-1.3, -11.8, 1.3), P3(-3.2, -13.8, 1.4), P3(-3.2, -13.8, 1.1), 3600]];
      const D = plans.reduce((a, p) => a + p[4], 0);
      const fin = () => { if (fini) return; fini = true; finCine(); M.camE = null; placerCamera(true); msgKF("LE BAR EST ENVAHI !", "", 3500); };

      M.cine = { fov: [55, 60], passer: fin, maj: () => { let u = performance.now() - t0; if (u >= D) return fin();
        if (cour) plans[1][2].set(cour.x, (cour.y || 0) + .3, cour.z), plans[1][3].copy(plans[1][2]);
        for (const [a, b, c, d, ms] of plans) { if (u < ms) { const k = u / ms, e = k * k * (3 - 2 * k); M.camera.position.lerpVectors(a, b, e); vise.lerpVectors(c, d, e); M.camera.lookAt(vise); return; } u -= ms; } } };
      M.passerBtn = boutonPasser(fin); };
    // le bar nettoyé… le sol tremble : au fond de la salle, l'araignée-gremlin. Elle crache des fils de toile blancs sur Gizmo (pris dedans : il ne bouge plus, un cœur de moins) ;
    // il faut viser le gremlin, vingt flèches ; elle brûle, se recroqueville — Billy arrive enfin
    let bossP = null; L.chargerBossKF = () => bossP = bossP || (async () => { gltfMod = gltfMod || await import("./vendor/GLTFLoader.js?v=1"); const ld = new gltfMod.GLTFLoader();
      fetch("sons/kf-araignee.mp3?v=1").catch(() => {});   /* (la musique du combat : déjà là quand elle arrive) */ const [a, g] = await Promise.all([ld.loadAsync("avatars/kingston/araignee.glb?v=1"), ld.loadAsync("avatars/gremlins/classique.glb?v=1")]); return creerAraigneeKF(a, g); })().catch(e => { console.warn("araignée", e); return null; });
    const barFini = () => { L.chargerBossKF().then(B => { if (!M || M.L !== L) return; if (!B) return finBoss(); lancerBoss(B); }); };
    const SC_B = 1.25, filM = new THREE.MeshBasicMaterial({ color: 0xf4f4ee, transparent: true, opacity: .9 }), filG = new THREE.CylinderGeometry(1, 1, 1, 5).translate(0, .5, 0), axeY = new THREE.Vector3(0, 1, 0);
    const fil = (a, b, r = .012) => { const m = new THREE.Mesh(filG, filM); const d = b.clone().sub(a), l = d.length() || .01; m.position.copy(a); m.quaternion.setFromUnitVectors(axeY, d.divideScalar(l)); m.scale.set(r, l, r); scene.add(m); return m; };
    const lancerBoss = B => { const SL = L.salleLou, V = SL.vers, yb = .125, moi = M.gens.get(M.moiNum), [x0, z0] = V(1, -12.6); L.radioBlesse = true;   // (plus de conseils sur la voiture de police : on est dans le bar)
      B.g.scale.setScalar(SC_B); B.g.position.set(x0, yb, z0); scene.add(B.g); B.haut.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.emissive = new THREE.Color(0); } });
      const Bq = { boss: true, B, x: x0, z: z0, y: yb, s: 1, saut: 0, mort: 0, feu: 0, pv: 20, pvMax: 20, rot: moi ? Math.atan2(moi.g.position.x - x0, moi.g.position.z - z0) : 0, ph: 0, toile: performance.now() + 4500, fils: [], tapis: [], actif: false }; L.bossKF = Bq; B.g.rotation.y = Bq.rot;
      const barre = document.createElement("div"); barre.style.cssText = "position:absolute;left:50%;top:10px;transform:translateX(-50%);width:min(56%,420px);z-index:7;pointer-events:none;font:16px 'Luckiest Guy','Lato',sans-serif;color:#ff3a1a;text-align:center;text-shadow:2px 2px 0 #000;letter-spacing:.05em";
      barre.innerHTML = `L'ARAIGNÉE-GREMLIN<div style="height:12px;margin-top:3px;border:2px solid #000;border-radius:7px;background:#2a0806;overflow:hidden;box-shadow:0 0 10px rgba(255,40,20,.5)"><div class="pv" style="height:100%;width:100%;background:linear-gradient(#ff5a2a,#a01008);transition:width .2s"></div></div>`;
      M.ctx.conteneur.appendChild(barre); Bq.barre = barre;
      L.silenceKF = true; try { const a = new Audio("sons/kf-araignee.mp3?v=1"); a.loop = true; a.volume = .8; sonsCourts.add(a); a.play().catch(() => {}); Bq.mus = a; } catch (e) {}   // (la musique du combat ; celle de la ville se tait)
      // l'arrivée : le sol tremble, elle avance du fond de la salle ; gros plan sur sa tête de gremlin
      sonBruit(1.6, 180, .7); setTimeout(() => sonBruit(1.2, 260, .6), 900); const t0 = performance.now(), vise = new THREE.Vector3(), P3 = (a, b, h) => { const [x, z] = V(a, b); return new THREE.Vector3(x, yb + h, z); };
      const [xa, za] = V(.4, -10.2); let fini = false;
      const fin = () => { if (fini) return; fini = true; Bq.x = xa; Bq.z = za; finCine(); M.camE = null; placerCamera(true); Bq.actif = true; Bq.toile = performance.now() + 2500;
        msgKF("L'ARAIGNÉE-GREMLIN !", "", 3500); };

      M.cine = { fov: [50, 62], passer: fin, maj: () => { const u = performance.now() - t0; if (u > 7000) return fin(); const k = Math.min(1, u / 5200), e = k * k * (3 - 2 * k);
        Bq.x = x0 + (xa - x0) * e; Bq.z = z0 + (za - z0) * e; B.marcher(u / 160, k < 1 ? 1 : .2); B.g.position.set(Bq.x, yb, Bq.z); B.corps.position.y = .03 * Math.sin(u / 80);
        const tr = u < 5200 ? (Math.random() - .5) * .04 : 0; if (u < 4200) { M.camera.position.copy(P3(-1.2, -5.2, .45)); vise.set(Bq.x, yb + .9, Bq.z); }   // (au ras du sol : les pattes qui approchent)
        else { const k2 = Math.min(1, (u - 4200) / 2800); M.camera.position.copy(P3(-.2 - .4 * k2, -7.6 + .4 * k2, 1.5)); vise.set(Bq.x, yb + 1.9 * SC_B * .8, Bq.z); }   // (sa tête de gremlin, qui ricane)
        M.camera.position.x += tr; M.camera.position.y += tr; M.camera.lookAt(vise); } };
      M.passerBtn = boutonPasser(fin); };
    L.toucherBoss = () => { const Bq = L.bossKF; if (!Bq || Bq.mort || !Bq.actif) return; Bq.pv--; Bq.barre.querySelector(".pv").style.width = Math.max(0, Bq.pv / Bq.pvMax * 100) + "%";
      Bq.flash = performance.now() + 160; sonBruit(.15, 900, .35); if (Bq.pv % 5 === 0 && Bq.pv > 0) sonBruit(.6, 420, .5);
      if (Bq.pv <= 0) { const a = Bq.mus; if (a) { const v0 = a.volume, t1 = performance.now(), f = setInterval(() => { const u = Math.min(1, (performance.now() - t1) / 2500); a.volume = v0 * (1 - u); if (u >= 1) { clearInterval(f); a.pause(); sonsCourts.delete(a); } }, 60); }
        Bq.mort = performance.now(); L.colleKF = null; for (const f of Bq.fils) scene.remove(f); Bq.fils = []; sonBruit(1.4, 300, .7); msgKF("ELLE BRÛLE !", "", 2500);
        for (let i = 0; i < 6; i++) setTimeout(() => { if (!M || M.L !== L) return; const a = i * 1.05, r = .6 * SC_B; const f = L.foyerKF && L.foyerKF(Bq.x + Math.cos(a) * r, Bq.y + .3, Bq.z + Math.sin(a) * r, 4, 0, 1.6); setTimeout(() => L.eteindreKF && L.eteindreKF(f), 5200 - i * 180); }, i * 180); } };   // (le feu, le temps qu'elle brûle)
    // à chaque image, pendant le combat
    L.bossMajKF = (dt, now) => { const Bq = L.bossKF; if (!Bq) return; const B = Bq.B, moi = M.gens.get(M.moiNum); if (!moi) return; const p = moi.g.position;
      for (const m of B.haut.children) if (m.material && m.material.emissive) m.material.emissive.setHex(now < (Bq.flash || 0) ? 0xa01000 : 0);
      if (Bq.mort) { const u = Math.min(1, (now - Bq.mort) / 3800); B.g.scale.setScalar(SC_B * (1 - .75 * u)); B.g.rotation.z = Math.sin(now / 60) * .1 * (1 - u); B.marcher(now / 50, 1 - u);   // (elle se tord, se recroqueville)
        if (u >= 1 && !Bq.fin) { Bq.fin = true; scene.remove(B.g); Bq.barre.remove(); L.tache && L.tache(Bq.x, Bq.z, true, 4); L.tueKF && L.tueKF(); setTimeout(() => { if (M && M.L === L) finBoss(); }, 1200); } return; }
      // Gizmo pris dans la toile : il ne bouge plus
      if (L.colleKF) { if (now > L.colleKF.fin) { for (const f of L.colleKF.fils) scene.remove(f); L.colleKF = null; } else { p.x = L.colleKF.x; p.z = L.colleKF.z; } }
      // les fils de toile tombés par terre : ils pâlissent puis disparaissent
      for (let i = Bq.tapis.length - 1; i >= 0; i--) { const T = Bq.tapis[i]; if (now > T.fin) { T.m.forEach(m => scene.remove(m)); Bq.tapis.splice(i, 1); } }
      if (!Bq.actif) return; const dx = p.x - Bq.x, dz = p.z - Bq.z, d = Math.hypot(dx, dz);
      let r = Math.atan2(dx, dz) - Bq.rot; r = Math.atan2(Math.sin(r), Math.cos(r)); Bq.rot += r * Math.min(1, dt * 2.2);
      let v = 0; if (d > 3.4) { v = 1.15; const nx = Bq.x + Math.sin(Bq.rot) * v * dt, nz = Bq.z + Math.cos(Bq.rot) * v * dt; if (L.dansLou(nx, nz)) { Bq.x = nx; Bq.z = nz; } else v = 0; }
      Bq.ph += dt * (v ? 6 : 1.2); B.marcher(Bq.ph, v ? 1 : .25); B.g.position.set(Bq.x, Bq.y, Bq.z); B.g.rotation.y = Bq.rot; B.corps.position.y = .03 * Math.sin(Bq.ph * 2);
      if (d < 1.6 && L.blesserGizmo) L.blesserGizmo(dx / (d || 1), dz / (d || 1));   // (trop près : un coup de patte)
      // le jet de toile : un fil blanc part de ses mains vers Gizmo
      if (now > Bq.toile && d < 11 && !L.colleKF && !M.cine) { Bq.toile = now + 4500 + Math.random() * 2500; const de = B.g.localToWorld(new THREE.Vector3(0, 1.3, .75)), cible = new THREE.Vector3(p.x, p.y + .25, p.z);
        const bl = new THREE.Sprite(new THREE.SpriteMaterial({ map: halo, color: 0xffffff, transparent: true, depthWrite: false })); bl.scale.setScalar(.35); scene.add(bl); sonBruit(.25, 2400, .3);
        Bq.jet = { de, cible, bl, t0: now, f: null }; }
      const J = Bq.jet; if (J) { const u = Math.min(1, (now - J.t0) / 550), q = J.de.clone().lerp(J.cible, u); q.y += Math.sin(u * Math.PI) * .5; J.bl.position.copy(q); if (J.f) scene.remove(J.f); J.f = fil(J.de, q);
        if (u >= 1) { scene.remove(J.bl); scene.remove(J.f); Bq.jet = null; const pris = Math.hypot(p.x - J.cible.x, p.z - J.cible.z) < .75;
          const centre = pris ? new THREE.Vector3(p.x, p.y + .25, p.z) : new THREE.Vector3(J.cible.x, Bq.y + .02, J.cible.z), m = [];   // (pris : un cocon de fils autour de lui ; raté : une toile par terre)
          for (let k = 0; k < (pris ? 9 : 7); k++) { const a = k / (pris ? 9 : 7) * 6.28, e2 = pris ? new THREE.Vector3(Math.cos(a) * .3, (Math.random() - .3) * .5, Math.sin(a) * .3) : new THREE.Vector3(Math.cos(a) * .55, 0, Math.sin(a) * .55); m.push(fil(centre.clone().sub(e2.clone().multiplyScalar(pris ? .4 : 0)), centre.clone().add(e2), pris ? .014 : .01)); }
          if (pris) { const co = new THREE.Mesh(new THREE.SphereGeometry(.3, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .35, depthWrite: false })); co.position.copy(centre); co.scale.set(1, 1.3, 1); scene.add(co); m.push(co);
            L.colleKF = { x: p.x, z: p.z, fin: now + 2400, fils: m }; Bq.toile = Math.max(Bq.toile, now + 2400 + 3500); /* (le temps de se dégager, et de s’éloigner) */ L.blesserGizmo && L.blesserGizmo(0, 0); msgKF("PRIS DANS LA TOILE !", "", 1800); }
          else Bq.tapis.push({ m, fin: now + 7000 }); } } };
    // le bar nettoyé : Billy arrive ; la une du journal, et le générique
    const finBoss = () => { M.radioKFfile = [];
      msgKF("KINGSTON FALLS EST SAUVÉE !", "", 3500); const ok = f => () => { if (M && M.L === L) f(); };
      setTimeout(ok(() => { const nf = L.noirFinKF = voile("background:#000;opacity:0;transition:opacity .8s;z-index:10"); requestAnimationFrame(() => { if (nf) nf.style.opacity = "1"; });   // (du noir derrière, d'une scène à l'autre : on ne revoit plus le bar entre deux)
        journalKF(ok(() => litKF(ok(() => survolFinKF(ok(generiqueKF)))))); }), 4500); };   // (le journal, Billy et Gizmo au lit, la boule de poils au bar, le générique)
    // la une du journal : la Gazette de Kingston Falls, vieux papier jauni, arrive en tournoyant, on la lit (elle avance doucement vers nous)… et elle s'envole
    const journalKF = suite => { if (!M) return suite(); L.silenceKF = true; if (!M.kfFinSon) { const a = M.kfFinSon = new Audio("sons/kf-fin.mp3?v=1"); a.volume = 1; a.loop = true; sonsCourts.add(a); a.play().catch(() => {}); }   // (la musique du générique commence avec le journal, et ne s'arrête plus jusqu'à la fin)
      if (!document.getElementById("styleJournalKF")) { const st = document.createElement("style"); st.id = "styleJournalKF"; st.textContent = "@keyframes kfJournal{0%{transform:scale(.04) rotate(-1080deg)}78%{transform:scale(1.05) rotate(-6deg)}100%{transform:scale(1) rotate(-2.5deg)}}@keyframes kfJournalZ{from{transform:scale(1) rotate(-2.5deg)}to{transform:scale(1.07) rotate(-1deg)}}@keyframes kfJournalS{to{transform:scale(1.6) rotate(25deg) translate(60%,-40%);opacity:0}}"; document.head.appendChild(st); }
      const d = document.createElement("div"); d.style.cssText = "position:absolute;inset:0;z-index:11;background:radial-gradient(ellipse at center,rgba(20,14,8,.82),rgba(0,0,0,.96));display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .6s";
      const n = (M.L && M.L.tuesKF) || 0, col = "font:clamp(10px,1.9vw,13.5px)/1.32 Georgia,serif;text-align:justify;hyphens:auto";
      d.innerHTML = `<div class="j" style="position:relative;width:min(92%,640px);max-height:94%;overflow:hidden;color:#1d1810;padding:14px 18px 16px;box-sizing:border-box;box-shadow:0 14px 50px rgba(0,0,0,.9);animation:kfJournal 1.7s cubic-bezier(.2,.7,.3,1) forwards;
          background:linear-gradient(90deg,transparent 49.6%,rgba(80,60,30,.18) 50%,transparent 50.4%),radial-gradient(ellipse at 30% 20%,#f4ecd4,#e6d8b4 60%,#cdb98c 100%);font-family:Georgia,'Times New Roman',serif">
        <div style="display:flex;justify-content:space-between;font:italic 10px Georgia;border-bottom:1px solid #1d1810;padding-bottom:2px"><span>Vol. LXXXIV — N° 359</span><span>« Toutes les nouvelles de la vallée »</span><span>25 cents</span></div>
        <div style="text-align:center;font:italic 900 clamp(26px,6.4vw,46px)/1 Georgia,serif;letter-spacing:.01em;margin:6px 0 2px;text-shadow:1px 1px 0 rgba(0,0,0,.15)">The Kingston Falls Gazette</div>
        <div style="display:flex;justify-content:space-between;font:10px Georgia;border-top:3px double #1d1810;border-bottom:1px solid #1d1810;padding:2px 0;margin-bottom:8px"><span>ÉDITION SPÉCIALE</span><span>MERCREDI 26 DÉCEMBRE 1984</span><span>NEIGE, −8 °C</span></div>
        <div style="font:900 clamp(26px,6.6vw,48px)/.98 Georgia,serif;text-align:center;text-transform:uppercase;letter-spacing:-.01em">Les monstres réduits en cendres !</div>
        <div style="font:italic clamp(13px,2.6vw,18px) Georgia,serif;text-align:center;margin:5px 0 9px;border-bottom:1px solid #1d1810;padding-bottom:7px">Une petite boule de poils armée d'un arc aurait sauvé la ville</div>
        <div style="display:grid;grid-template-columns:1.05fr 1.2fr 1fr;gap:12px">
          <div><img src="images/gremlins/radio-gizmo.webp?v=1" alt="" style="width:100%;filter:grayscale(1) sepia(.35) contrast(1.2);border:1px solid #1d1810;display:block"><div style="font:italic 10px/1.25 Georgia;margin-top:3px">Le héros de la nuit, surnommé « Gizmo » par M. Peltzer. Il n'a pas souhaité répondre à nos questions.</div></div>
          <div style="${col};border-left:1px solid #1d1810;border-right:1px solid #1d1810;padding:0 10px"><b>KINGSTON FALLS.</b> — Cette nuit, toutes les lampes UV de la ville se sont allumées d'un coup : les étranges créatures qui semaient la terreur ont fondu sous la lumière. Selon des témoins, la petite créature, coiffée d'un bandeau rouge, aurait coupé la chaîne du générateur, puis terrassé au Dorry's Tavern une monstrueuse araignée. <b>${n} créatures détruites.</b></div>
          <div style="${col}"><div style="font:900 12px Georgia;text-transform:uppercase;border-bottom:1px solid #1d1810;margin-bottom:3px">Le père Noël témoigne</div>« J'en avais un sur le dos toute la soirée. » <div style="font:900 12px Georgia;text-transform:uppercase;border-bottom:1px solid #1d1810;margin:7px 0 3px">La police sans voiture</div>Le shérif Frank retrouve son véhicule… au milieu de la place.<div style="margin-top:7px;border:1px solid #1d1810;padding:3px;text-align:center;font:italic 10px Georgia">Dorry's Tavern : fermé jusqu'à nouvel ordre</div></div></div></div>`;
      M.ctx.conteneur.appendChild(d); const j = d.querySelector(".j"); requestAnimationFrame(() => { d.style.opacity = "1"; }); sonBruit(.5, 1800, .25);
      setTimeout(() => { j.style.animation = "kfJournalZ 7.5s ease-in-out forwards"; }, 1750);
      let fini = false; const fin = () => { if (fini) return; fini = true; j.style.animation = "kfJournalS 1s ease-in forwards"; sonBruit(.4, 2200, .2); d.style.transition = "opacity 1s .3s"; d.style.opacity = "0"; setTimeout(() => { d.remove(); suite(); }, 1300); };
      d.style.pointerEvents = "auto"; d.onclick = fin; setTimeout(fin, 10500); };
    // Billy et Gizmo, enfin tranquilles, dans le lit : la photo, et ce qu'ils se disent (pour rire)
    const LIT_KF = [["Billy", "Quelle aventure, hein, Gizmo…"], ["Gizmo", "Gizmo… fatigué."], ["Billy", "Une araignée géante avec une tête de gremlin. Si je raconte ça à Kate, elle va me prendre pour un fou."],
      ["Gizmo", "Kate… pas croire !"], ["Billy", "Et toi, avec ton bandeau et ton arc… Rambo en peluche !"], ["Gizmo", "Gizmo… Rambo !"],
      ["Billy", "Heureusement que tout est fini. Plus d'eau, pas de lumière vive… et surtout, rien à manger après minuit."], ["Gizmo", "…"], ["Billy", "Gizmo ? Pourquoi tu regardes ma canette comme ça ?"], ["Billy", "…Il est quelle heure ?"], ["Gizmo", "Minuit… et une !"], ["Billy", "Oh non."]];
    const litKF = suite => { if (!M) return suite(); const d = document.createElement("div"); d.style.cssText = "position:absolute;inset:0;z-index:11;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:16px;box-sizing:border-box;opacity:0;transition:opacity .9s;cursor:pointer";
      d.innerHTML = '<img src="images/gremlins/billy-lit.webp?v=1" onerror="this.onerror=null;this.src=\'images/gremlins/billy.webp\'" alt="Billy et Gizmo" style="max-width:min(94%,820px);max-height:60%;object-fit:contain;border-radius:6px;box-shadow:0 0 40px rgba(0,0,0,.8)">'
        + '<div style="width:min(94%,820px);min-height:4.4em;background:rgba(14,10,6,.92);border:2px solid #b8862e;border-radius:10px;padding:10px 16px;box-sizing:border-box;color:#fff;font:600 clamp(15px,2.4vw,20px)/1.4 \'Lato\',sans-serif"><b class="qui"></b> <span class="txt"></span></div>';
      M.ctx.conteneur.appendChild(d); requestAnimationFrame(() => { d.style.opacity = "1"; });
      const qui = d.querySelector(".qui"), txt = d.querySelector(".txt"); let i = -1, tape = null, auto = null, fini = false;
      const fin = () => { if (fini) return; fini = true; clearInterval(tape); clearTimeout(auto); d.style.opacity = "0"; setTimeout(() => { d.remove(); suite(); }, 950); };
      const pause = t => 1100 + t.length * 24;
      const suivant = () => { if (fini) return; clearInterval(tape); clearTimeout(auto); i++; if (i >= LIT_KF.length) return fin();
        const [q, t] = LIT_KF[i]; qui.textContent = q + " :"; qui.style.color = q === "Gizmo" ? "#9fe0ff" : "#ffcf5a"; let k = 0; txt.textContent = "";
        tape = setInterval(() => { k += 2; txt.textContent = t.slice(0, k); if (k >= t.length) { clearInterval(tape); auto = setTimeout(suivant, pause(t)); } }, 24); };
      d.onclick = () => { const t = i >= 0 && LIT_KF[i] && LIT_KF[i][1]; if (t && txt.textContent.length < t.length) { clearInterval(tape); txt.textContent = t; clearTimeout(auto); auto = setTimeout(suivant, pause(t)); } else suivant(); };
      setTimeout(suivant, 1000); };
    // la ville au petit matin, vue du ciel comme au début ; la caméra descend jusqu'au bar, entre… et là, par terre, une petite boule de poils, les oreilles repliées, qui respire
    const survolFinKF = suite => { if (!M || M.L !== L || !L.salleLou) return suite(); const SL = L.salleLou, V = SL.vers, yb = .125, V3 = THREE.Vector3, moi = M.gens.get(M.moiNum);
      if (moi) moi.g.visible = false; if (L.bossKF && L.bossKF.tapis) for (const T of L.bossKF.tapis) T.m.forEach(m => scene.remove(m));
      const [bx, bz] = V(-.9, -5.4), B = new THREE.Group(); B.position.set(bx, yb, bz); B.rotation.y = Math.random() * 6; scene.add(B);
      const oreilles = creerBouleKF(B);
      const PP = new THREE.CatmullRomCurve3(KF_SURVOL_P.map(a => new V3(...a)), false, "centripetal"), CC = new THREE.CatmullRomCurve3(KF_SURVOL_C.map(a => new V3(...a)), false, "centripetal"), EM = .74;
      const P3 = (a, b, h) => { const [x, z] = V(a, b); return new V3(x, yb + h, z); }, fin0 = PP.getPointAt(EM), dedans = new THREE.CatmullRomCurve3([fin0, P3(0, 1.4, 1.1), P3(0, -1.6, .9), P3(-.5, -3.6, .55), P3(-.75, -4.75, .32)], false, "centripetal");
      const boule = new V3(bx, yb + .12, bz), vise = new V3(), T1 = 12000, T2 = 18500, T3 = 25000, t0 = performance.now(); let fini = false;
      const noir = voile("background:#000;opacity:1;transition:opacity 1.2s;z-index:10"); if (L.noirFinKF) { L.noirFinKF.remove(); L.noirFinKF = null; } requestAnimationFrame(() => requestAnimationFrame(() => { if (noir) noir.style.opacity = "0"; }));
      const fin = () => { if (fini) return; fini = true; const n2 = voile("background:#000;opacity:0;transition:opacity 1.2s;z-index:10"); requestAnimationFrame(() => { if (n2) n2.style.opacity = "1"; });
        setTimeout(() => { if (noir) noir.remove(); scene.remove(B); if (moi) moi.g.visible = true; finCine(); suite(); setTimeout(() => n2 && n2.remove(), 1600); }, 1300); };
      M.cine = { fov: [56, 64], passer: fin, maj: () => { const u = performance.now() - t0, k = Math.sin(u / 380);
        B.scale.set(1 + .03 * k, 1 + .055 * k, 1 + .03 * k);   // (il respire, tout doucement)
        if (u > 21500 && u < 22300) { const e = Math.sin((u - 21500) / 800 * Math.PI); oreilles.forEach((o, s) => { o.rotation.x = -.45 - .25 * e; o.rotation.z = (s ? .5 : -.5) * (1 + .3 * e); }); }   // (une oreille qui frémit…)
        if (u < T1) { const e = EM * (u / T1) * (u / T1) * (3 - 2 * u / T1); M.camera.position.copy(PP.getPointAt(e)); vise.copy(CC.getPointAt(e)); }
        else if (u < T2) { const v = (u - T1) / (T2 - T1), e = v * v * (3 - 2 * v); M.camera.position.copy(dedans.getPointAt(e)); vise.copy(CC.getPointAt(EM)).lerp(boule, Math.min(1, e * 1.4)); }
        else { const v = Math.min(1, (u - T2) / (T3 - T2)); M.camera.position.copy(dedans.getPointAt(1)).lerp(boule, .18 * v); vise.copy(boule); }   // (tout près : on le regarde respirer)
        M.camera.lookAt(vise); if (u > T3 + 1500) fin(); } };
      M.passerBtn = boutonPasser(fin); };
    L.queteKF = (dt, t) => { const moi = M.gens.get(M.moiNum); if (!moi) return; const p = moi.g.position;
      for (let i = pansements.length - 1; i >= 0; i--) { const P2 = pansements[i]; P2.m.rotation.y += dt * 2; P2.g.position.y = p.y + .2 + Math.sin(t / 300 + i) * .05; P2.gl.material.opacity = .4 + .4 * Math.sin(t / 200 + i);
        if (Math.hypot(p.x - P2.x, p.z - P2.z) < .8 && L.soignerGizmo && L.soignerGizmo()) { scene.remove(P2.g); pansements.splice(i, 1); sonBruit(.06, 5000, .3); msgKF("UN PANSEMENT !", "", 2000); } }
      if (L.ambKF && Q.allumes) { const cible = .2 + Math.min(4, Q.allumes) * .06;   // (à peine : la nuit reste la nuit, ce sont les projecteurs qui éclairent)
        L.ambKF.intensity += (cible - L.ambKF.intensity) * Math.min(1, dt * 1.5); }   // (les projecteurs : la ville entière s'éclaire)
      if (L.pinceKF && !Q.pince) { const PP = L.pinceKF, k = .5 + .5 * Math.sin(t / 180); PP.gl.material.opacity = .35 + .65 * k; PP.gl.scale.setScalar(.35 + .35 * k);
        if (Math.hypot(p.x - PP.x, p.z - PP.z) < 1.1) { Q.pince = true; PP.ims.forEach(im => im.visible = false); PP.gl.visible = false; sonBruit(.08, 4200, .35); inv.style.display = "block";
          setTimeout(() => radioKF([["billy", "Tu l'as trouvée ! Bravo, Gizmo !"], ["billy", "Maintenant, le générateur : au pied de l'antenne radio, devant le tribunal. Coupe la chaîne de la grille."], ["gizmo", "Gizmo… trouve !"]]), 2500); } }
      if (Q.ouvre != null && Q.ouvre < 1) { Q.ouvre = Math.min(1, Q.ouvre + dt * .9); const e = 1 - (1 - Q.ouvre) ** 3; porte.rotation.y = e * 1.9; }   // (elle pivote vers l'intérieur)
      if (Q.lev != null && Q.lev < 1) { Q.lev = Math.min(1, Q.lev + dt * 3); levier.rotation.x = -.35 + Q.lev * 2.3; }
      if (Q.rel != null && Q.rel < 1) { Q.rel = Math.min(1, Q.rel + dt * 3); levier.rotation.x = 1.95 - Q.rel * 2.3; }
      if (Q.releve && !Q.cineBar && !M.cine && L.dansLou && L.dansLou(p.x, p.z)) { Q.cineBar = true; cineBar(); }
      if (L.barKF && !Q.barFini) for (const q of L.barKF) if (!(q.mort > 0) && !(q.feu > 0) && !q.plafond && !L.dansLou(q.x, q.z)) { const [x, z] = L.salleLou.vers(0, -6); q.x = x; q.z = z; q.cible = null; q.ejecte = null; }   // (aucun ne s'échappe du bar)
      if (Q.cineBar && !Q.barFini && !M.cine && L.barKF && L.barKF.every(q => q.mort > 0)) { Q.barFini = true; setTimeout(() => { if (M && M.L === L) barFini(); }, 1200); }
      L.bossMajKF && L.bossMajKF(dt, performance.now());
      let act = null, lab = ""; const dG = Math.hypot(p.x - (GX0 + GX1) / 2, p.z - (F.z1 + .5));
      if (!Q.coupe && dG < 1.9) { if (Q.pince) { act = couper; lab = "✂️ Couper la chaîne"; } }
      else if (Q.coupe && !Q.levier && Math.hypot(p.x - LX, p.z - (LZ + .55)) < 1.3) { act = abaisser; lab = "⚡ Abaisser le levier"; }
      if (Q.coupe && !Q.levier && !Q.radioLevier && Math.hypot(p.x - LX, p.z - LZ) < 3.2) { Q.radioLevier = true; M.radioKFfile = []; radioKF([["billy", "Gizmo… kssh… c'est toi ? Tu es au générateur ?! Le levier, sur le boîtier électrique…", "brouille"], ["billy", "Abaisse-le : toutes les lampes UV de la ville s'allumeront !", "brouille"], ["gizmo", "Gizmo… lumière !"]]); }
      else if (Q.aRelever && !Q.releve && !M.cine && Math.hypot(p.x - LX, p.z - (LZ + .55)) < 1.3) { act = relever; lab = "⚡ Relever le levier"; }
      if (dG > 5) Q.dit = false;
      L.actionKF = act; if (ab.textContent !== lab) ab.textContent = lab; ab.style.display = act && !M.cine ? "block" : "none"; if (Q.pince && !Q.levier) inv.style.display = "block"; else if (Q.levier) inv.style.display = "none"; }; }
  // ---- dans le bar (Dorry's Tavern), lumières éteintes : la guirlande électrique au-dessus du comptoir, les couronnes de sapin aux murs, le sapin éteint dans le coin ----
  if (L.salleLou) { const V = L.salleLou.vers, [ax, az] = V(0, 0), [bx, bz] = V(1, 0), rl = Math.atan2(bz - az, bx - ax);   // (rl : l'angle de l'axe x de la salle dans le monde)
    const yb = L.salleLou.H ? .125 : .125, ampB = [];
    for (let i = 0; i <= 40; i++) { const u = i / 40, bzz = -2.3 - u * 8.6, f = (u * 9) % 1; const [x, z] = V(.55, bzz); ampB.push([x, yb + 2.3 - Math.sin(f * Math.PI) * .22, z, couleurs[i % couleurs.length]]); }
    { const g = new THREE.SphereGeometry(.045, 8, 6), mt = new THREE.Matrix4(); couleurs.forEach((c, ci) => { const l = ampB.filter(a => a[3] === c); if (!l.length) return;
        const im = new THREE.InstancedMesh(g, new THREE.MeshBasicMaterial({ color: c, toneMapped: false }), l.length); l.forEach(([x, y, z], i) => im.setMatrixAt(i, mt.makeTranslation(x, y, z))); scene.add(im); (L.guirlandesBar = L.guirlandesBar || []).push(im); });
    }
    // les couronnes : un anneau d'aiguilles, des baies rouges, le nœud rouge
    const couronne = (ox, oz, oy, ry) => { const [x, z] = V(ox, oz), g = new THREE.Group(); g.position.set(x, yb + oy, z); g.rotation.y = rl * -1 + ry; scene.add(g);
      const vertC = new THREE.MeshStandardMaterial({ color: 0x1f4a26, roughness: .9 }), an = new THREE.Mesh(new THREE.TorusGeometry(.26, .09, 8, 20), vertC); g.add(an);
      const ai = new THREE.InstancedMesh(new THREE.ConeGeometry(.03, .14, 4), vertC, 70), m = new THREE.Matrix4(); for (let i = 0; i < 70; i++) { const a = i / 70 * Math.PI * 2 * 3, r = .26 + (Math.random() - .5) * .14;
        m.compose(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, (Math.random() - .3) * .1), new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.random() * 3, Math.random() * 3, a)), new THREE.Vector3(1, 1, 1)); ai.setMatrixAt(i, m); } g.add(ai);
      const rouge = new THREE.MeshStandardMaterial({ color: 0xb01020, roughness: .4 }); for (let i = 0; i < 9; i++) { const a = i / 9 * 6.28 + .3, b = new THREE.Mesh(new THREE.SphereGeometry(.028, 6, 5), rouge); b.position.set(Math.cos(a) * .27, Math.sin(a) * .27, .08); g.add(b); }
      for (const s of [-1, 1]) { const n = new THREE.Mesh(new THREE.ConeGeometry(.08, .16, 4), rouge); n.rotation.z = s * Math.PI / 2; n.position.set(s * .08, -.27, .1); g.add(n); const r = new THREE.Mesh(new THREE.BoxGeometry(.04, .2, .02), rouge); r.position.set(s * .05, -.4, .1); r.rotation.z = s * .3; g.add(r); } };
    for (const oz of [-3, -6, -9.5, -13]) couronne(-4.05, oz, 2.05, Math.PI / 2);   // (le long mur, face au comptoir)
    couronne(-2.2, -14.85, 2.0, 0); couronne(2.2, -14.85, 2.0, 0);   // (le mur du fond)
    // le sapin éteint, dans le coin de la salle au tapis vert : ses boules, sa guirlande d'ampoules éteintes, sans étoile allumée
    { const [x, z] = V(-3.2, -13.8); chargerKF("sapin").then(({ parts, t }) => { const H = 2.4, k = H / t.y; poser(parts, [mt4(x, yb, z, .4, k * .85, k, k * .85)]);
        const R = t.x / 2 * k * .85; L.sapinKF = { x, z, yb, H, R }; const mt = new THREE.Matrix4(), bo = new THREE.InstancedMesh(new THREE.SphereGeometry(.055, 10, 8), new THREE.MeshStandardMaterial({ color: 0xa01828, metalness: .6, roughness: .25 }), 26),
          am = new THREE.InstancedMesh(new THREE.SphereGeometry(.025, 6, 5), new THREE.MeshStandardMaterial({ color: 0x3a3a30, roughness: .3 }), 60);
        for (let i = 0; i < 26; i++) { const u = .12 + Math.random() * .75, a = Math.random() * 6.28, r = R * (1 - u) * .95; bo.setMatrixAt(i, mt.makeTranslation(x + Math.cos(a) * r, yb + H * u - .05, z + Math.sin(a) * r)); }
        for (let i = 0; i < 60; i++) { const u = .1 + i / 60 * .8, a = u * 5 * 6.28, r = R * (1 - u) * 1.0 + .03; am.setMatrixAt(i, mt.makeTranslation(x + Math.cos(a) * r, yb + H * u, z + Math.sin(a) * r)); }
        scene.add(bo, am); }).catch(e => console.warn("sapin du bar", e)); } }
  // ---- la chorale : six gremlins en arc de cercle devant la maison (le trottoir sud, devant l'agence) ; des bonnets de laine à pompon, des écharpes ----
  { const tricot = c => new THREE.MeshStandardMaterial({ color: c, roughness: .95 }), S = .78;
    const BON = [[0xc81e24, 0xffffff], null, [0x1d6a2a, 0xf2e8d0], [0x2a4aa8, 0xffffff], [0xd8a020, 0xc81e24], [0xc81e24, 0x1d6a2a]], ECH = [null, 0x1d6a2a, 0xc81e24, 0xf2e8d0, null, 0x2a4aa8];
    L.choraleAcc = [];
    for (let k = 0; k < 6; k++) { const x = 10.6 + k * .56, z = 21.75 + Math.abs(k - 2.5) * .16, g = new THREE.Group(); g.position.set(x, (L.hauteur ? L.hauteur(x, z) : y0), z); g.rotation.y = (k - 2.5) * -.06; g.scale.setScalar(S); scene.add(g); L.choraleAcc.push(g);
      if (BON[k]) { const [c1, c2] = BON[k], d = new THREE.Mesh(new THREE.SphereGeometry(.105, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), tricot(c1)); d.position.set(0, .8, -.01); d.scale.set(1, 1.15, 1); g.add(d);
        const rb = new THREE.Mesh(new THREE.TorusGeometry(.102, .028, 8, 18), tricot(c2)); rb.rotation.x = Math.PI / 2; rb.position.set(0, .805, -.01); g.add(rb);
        const pp = new THREE.Mesh(new THREE.SphereGeometry(.04, 10, 8), tricot(c2)); pp.position.set(0, .93, -.01); g.add(pp); }
      if (ECH[k] != null) { const e = new THREE.Mesh(new THREE.TorusGeometry(.085, .032, 8, 18), tricot(ECH[k])); e.rotation.x = Math.PI / 2; e.position.set(0, .63, .0); g.add(e);
        const pan = new THREE.Mesh(new THREE.BoxGeometry(.06, .2, .025), tricot(ECH[k])); pan.position.set(.04, .53, .08); pan.rotation.z = .15; g.add(pan); } } }
  // ---- le père Noël (CC-BY : « Santa claus » par photon / Professor_E12) — un clin d'œil au film : blessé, il arpente les rues en traînant la jambe (la démarche
  //      de blessé de Resident Evil), un gremlin accroché à son dos qui le mord et le griffe ; il se débat, se retourne, essaie de s'en défaire ----
  { const NOMS = { Hips: "Hips", Spine: "Spine", Spine2: "Spine2", Neck: "Neck", Head: "Head", Shoulder_R: "RightShoulder", Arm_R: "RightArm", Forearm_R: "RightForeArm", Hand_R: "RightHand",
      Shoulder_L: "LeftShoulder", Arm_L: "LeftArm", Forearm_L: "LeftForeArm", Hand_L: "LeftHand", Thigh_R: "RightUpLeg", Calf_R: "RightLeg", Foot_R: "RightFoot", Toe_R: "RightToeBase",
      Thigh_L: "LeftUpLeg", Calf_L: "LeftLeg", Foot_L: "LeftFoot", Toe_L: "LeftToeBase" }, nomOs = n => NOMS[n.replace(/_\d+$/, "")] || n;
    // son trajet : le milieu de la rue au sud de la place, puis la rue de l'est ; il va, se retourne, revient
    const CHEMIN = [[-19, 16.3], [-6, 16.6], [6, 16.1], [19.5, 16.4], [20.3, 6], [20.1, -4], [20.4, -11]], PN = { x: CHEMIN[0][0], z: CHEMIN[0][1], dx: 1, dz: 0 };
    const perDos = { x: 0, z: 0, y: 0, r: 0, hx: .03, hz: .03, occ: 0, cap: 1, dos: true }; (L.perchesKF = L.perchesKF || []).unshift(perDos); L.victimeKF = PN;
    KF_ATTENTES.push((async () => { gltfMod = gltfMod || await import("./vendor/GLTFLoader.js?v=1"); const [G, AM] = await Promise.all([new gltfMod.GLTFLoader().loadAsync("avatars/kingston/perenoel.glb?v=1"), chargerAnimsMX("anims/re-heros.json?v=4")]);
      const sc = G.scene, bb = new THREE.Box3().setFromObject(sc), k = 1.82 / (bb.max.y - bb.min.y), g = new THREE.Group(), inner = new THREE.Group(); inner.add(sc); sc.position.y = -bb.min.y; inner.scale.setScalar(k); g.add(inner); scene.add(g);
      sc.traverse(o => { if (o.isMesh) { o.castShadow = true; o.frustumCulled = false; } });
      const mix = new THREE.AnimationMixer(sc), clip = n => { const c = clipMXcible(AM, n, sc, nomOs); return c && mix.clipAction(c); }, marche = clip("h-blesse"), touche = clip("h-touche");
      if (marche) marche.play(); if (touche) { touche.setLoop(THREE.LoopOnce); touche.clampWhenFinished = false; }
      let seg = 0, sens = 1, u = 0, prochain = 3000, tP = 0, arret = 0;
      L.pereNoel = (dt, t) => { mix.update(dt);
        if (t > prochain && touche) { prochain = t + 3500 + Math.random() * 3500; touche.reset().setEffectiveWeight(1).fadeIn(.2).play(); marche && marche.fadeOut(.2); arret = .9; setTimeout(() => { if (marche) { marche.reset().fadeIn(.35).play(); touche.fadeOut(.35); } }, 900); }   // (il se débat : un coup en arrière, il se retourne)
        if (perDos.occ > 0 && arret <= 0 && t > (PN.sangT || 0)) { PN.sangT = t + 1600 + Math.random() * 1400; L.tache && L.tache(PN.x - PN.dx * .3 + (Math.random() - .5) * .3, PN.z - PN.dz * .3 + (Math.random() - .5) * .3, false, .14 + Math.random() * .1); }   // (le gremlin le mord : quelques gouttes de sang dans la neige, sur son chemin)
        if (arret > 0) arret -= dt;
        else { const a = CHEMIN[seg], b = CHEMIN[seg + sens] || null; if (!b) { sens = -sens; } else { const l = Math.hypot(b[0] - a[0], b[1] - a[1]); u += .55 * dt / l; if (u >= 1) { u = 0; seg += sens; if (!CHEMIN[seg + sens]) sens = -sens; }
            const A = CHEMIN[seg], B2 = CHEMIN[seg + sens]; if (B2) { PN.dx = B2[0] - A[0]; PN.dz = B2[1] - A[1]; const ll = Math.hypot(PN.dx, PN.dz) || 1; PN.dx /= ll; PN.dz /= ll; PN.x = A[0] + (B2[0] - A[0]) * u; PN.z = A[1] + (B2[1] - A[1]) * u; } } }
        const yaw = Math.atan2(PN.dx, PN.dz), ys = L.hauteur ? L.hauteur(PN.x, PN.z) : 0; g.position.set(PN.x, ys, PN.z); let d = yaw - g.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); g.rotation.y += d * Math.min(1, dt * 3);
        Object.assign(perDos, { x: PN.x - Math.sin(g.rotation.y) * .27, z: PN.z - Math.cos(g.rotation.y) * .27, y: ys, cou: ys + 1.55, r: g.rotation.y, colle: true }); };   // (le gremlin, collé à son dos, face à lui, la tête à sa nuque)
    })().catch(e => console.warn("père Noël", e))); }
  // ---- Gizmo (CC-BY : « Gizmo » par theamazingdonovan207), notre héros : à Kingston Falls, c'est lui qu'on joue — le bandana rouge noué autour de la tête,
  //      comme Rambo, l'arc à la main ; ses flèches enflammées : deux flèches, et le gremlin prend feu ----
  { const NOMS_G = { "root hips": "Hips", "spine lower": "Spine", "spine upper": "Spine2", "head neck lower": "Neck", "head neck upper": "Head",
      "arm left shoulder 1": "LeftShoulder", "arm left shoulder 2": "LeftArm", "arm left elbow": "LeftForeArm", "arm left wrist": "LeftHand", "arm right shoulder 1": "RightShoulder", "arm right shoulder 2": "RightArm", "arm right elbow": "RightForeArm", "arm right wrist": "RightHand",
      "leg left thigh": "LeftUpLeg", "leg left knee": "LeftLeg", "leg left ankle": "LeftFoot", "leg left toes": "LeftToeBase", "leg right thigh": "RightUpLeg", "leg right knee": "RightLeg", "leg right ankle": "RightFoot", "leg right toes": "RightToeBase" },
      nomOs = n => NOMS_G[n.replace(/_\d+$/, "").replace(/_/g, " ")] || n, HG = .34, KB = HG / .62;   // (Gizmo : 34 cm — tout petit à côté des gens, comme dans le film)   // (le chargeur remplace les espaces des noms d'os par « _ »)
    L.suivi = { d: 3.0, h: 1.35, av: 1.6, vy: .42 };   // (la caméra tout près : Gizmo est petit)
    const racine = new THREE.Group(); racine.name = "gizmo"; let G = null;
    KF_ATTENTES.push((async () => { gltfMod = gltfMod || await import("./vendor/GLTFLoader.js?v=1"); const [g, AM] = await Promise.all([new gltfMod.GLTFLoader().loadAsync("avatars/kingston/gizmo.glb?v=2"), chargerAnimsMX("anims/re-heros.json?v=4")]);
      const sc = g.scene, bb = new THREE.Box3().setFromObject(sc), k = HG / (bb.max.y - bb.min.y), inner = new THREE.Group(); inner.add(sc); sc.position.y = -bb.min.y; inner.scale.setScalar(k); racine.add(inner);
      // son pelage : la texture du modèle (brun et blanc), mate comme des poils — et un peu de lumière propre, qu'on le voie bien la nuit
      sc.traverse(o => { if (o.isMesh) { o.castShadow = true; o.frustumCulled = false; const m0 = o.material, m = new THREE.MeshStandardMaterial({ map: m0.map, normalMap: m0.normalMap, roughness: .92, metalness: 0, side: THREE.DoubleSide, emissive: 0xffffff, emissiveMap: m0.map, emissiveIntensity: .28 }); if (m.map) m.map.colorSpace = THREE.SRGBColorSpace; o.material = m; (L.gizmoMats = L.gizmoMats || []).push(m); } });
      const mix = new THREE.AnimationMixer(sc), act = {}; for (const [n, c] of [["idle", "h-idle"], ["walk", "h-marche"], ["run", "h-rcourse"]]) { const cl = clipMXcible(AM, c, sc, nomOs); if (cl) { act[n] = mix.clipAction(cl); act[n].play(); act[n].setEffectiveWeight(n === "idle" ? 1 : 0); } }
      let tete = null, main = null; const pieds = []; sc.traverse(o => { if (o.isBone && /head.neck.upper/.test(o.name)) tete = o; if (o.isBone && /arm.left.wrist/.test(o.name)) main = o; if (o.isBone && /leg.(left|right).toes/.test(o.name)) pieds.push(o); });
      // le bandana : un bandeau rouge serré autour du front, le nœud et ses deux pans qui flottent derrière
      // (bien visible : un rouge vif, qui ressort même la nuit ; posé au-dessus de la tête, pas dedans)
      const rouge = new THREE.MeshStandardMaterial({ color: 0xe8141c, roughness: .7, emissive: 0x6a0608, side: THREE.DoubleSide }), band = new THREE.Group(); band.scale.setScalar(KB); scene.add(band);
      const bd = new THREE.Mesh(new THREE.CylinderGeometry(.2, .21, .09, 28, 1, true), rouge); band.add(bd);
      const pans = [-1, 1].map(s => { const m = new THREE.Mesh(new THREE.BoxGeometry(.06, .26, .012), rouge); m.position.set(s * .045, -.09, -.22); m.rotation.set(.5, 0, s * .25); band.add(m); return m; });
      const noeud = new THREE.Mesh(new THREE.SphereGeometry(.035, 10, 8), rouge); noeud.position.set(0, 0, -.21); band.add(noeud);
      // l'arc : le bois courbé, la corde ; et la flèche encochée
      // (plus grand et plus épais qu'avant — on ne le voyait pas — ; courbé vers l'avant, la flèche encochée sur la corde, sa pointe rouge)
      const arc = new THREE.Group(); arc.scale.setScalar(KB); scene.add(arc); { const bois = new THREE.MeshStandardMaterial({ color: 0x8a5428, roughness: .6, emissive: 0x2a1406 }), pts = []; for (let i = 0; i <= 16; i++) { const u = i / 16 - .5; pts.push(new THREE.Vector3(-Math.cos(u * Math.PI) * .13, u * .62, 0)); }
        arc.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 28, .02, 7), bois));
        arc.add(new THREE.Mesh(new THREE.CylinderGeometry(.005, .005, .62, 4), new THREE.MeshBasicMaterial({ color: 0xf0e8d0 })));   // (la corde)
        const fl = new THREE.Mesh(new THREE.CylinderGeometry(.009, .009, .56, 6).rotateZ(Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xc8a070, emissive: 0x2a2010 })); fl.position.x = -.24; arc.add(fl);   // (la flèche)
        const pt = new THREE.Mesh(new THREE.SphereGeometry(.024, 10, 8), new THREE.MeshStandardMaterial({ color: 0xc01810, emissive: 0x400806, roughness: .5 })); pt.scale.set(1.6, 1, 1); pt.position.x = -.53; arc.add(pt);   // (une allumette : le bout rouge)
        for (const a of [0, Math.PI / 2]) { const pl = new THREE.Mesh(new THREE.PlaneGeometry(.08, .045), new THREE.MeshStandardMaterial({ color: 0xf2ece0, side: THREE.DoubleSide })); pl.position.x = .0; pl.rotation.x = a; arc.add(pl); } }
      G = { mix, act, tete, main, band, pans, arc, sc, pieds, inner }; L.gizmoG = G; })().catch(e => console.warn("Gizmo", e)));
    // les flèches : une hampe, l'empennage, la pointe qui flambe ; elles filent vers le gremlin visé (et le suivent un peu)
    const fleches = [], hampeG = new THREE.CylinderGeometry(.006, .006, .5, 5).rotateX(Math.PI / 2), hampeM = new THREE.MeshStandardMaterial({ color: 0x8a6a40 }), plumeM = new THREE.MeshStandardMaterial({ color: 0xe8e2d0, side: THREE.DoubleSide });
    const feuF = tex(toile(32, 32, (x) => { const g = x.createRadialGradient(16, 16, 0, 16, 16, 15); g.addColorStop(0, "rgba(255,250,210,1)"); g.addColorStop(.4, "rgba(255,150,30,.9)"); g.addColorStop(1, "rgba(255,40,0,0)"); x.fillStyle = g; x.fillRect(0, 0, 32, 32); }));
    const cibles = () => L.bossKF && L.bossKF.actif && !L.bossKF.mort ? [...(L.gremlins || []), L.bossKF] : (L.gremlins || []);   // (avec l'araignée, pendant le combat)
    const vise = (o, yaw) => { if (L.bossKF && L.bossKF.actif && !L.bossKF.mort) return L.bossKF;   // (pendant le combat : toujours sur l'araignée)
      let best = null, bd = 1e9; for (const q of cibles()) { if (q.mort > 0 || q.feu > 0) continue; const dx = q.x - o.x, dz = q.z - o.z, d = Math.hypot(dx, dz); if (d > 26 || d < .3) continue;
        let da = Math.atan2(dx, dz) - yaw; da = Math.abs(Math.atan2(Math.sin(da), Math.cos(da))); const sc = d + da * 9; if (da < .9 && sc < bd) { bd = sc; best = q; } } return best; };
    let yawG = 0, dernierTir = 0, sautG = 0, vSautG = 0;
    L.orienterGizmo = a => { yawG = a; };
    L.sauterGizmo = () => { if (sautG === 0 && vSautG === 0 && M && M.lieu === "kingston") vSautG = 4.4; };   // (un bond : A à la manette, J au clavier, ou le bouton)
    const tirer = () => { const moi = M && M.gens.get(M.moiNum); if (!moi || M.lieu !== "kingston" || L.gizmoRambo === false || performance.now() - dernierTir < 450) return; dernierTir = performance.now();
      const o = moi.g.position, cible = vise(o, yawG); if (cible) yawG = Math.atan2(cible.x - o.x, cible.z - o.z);
      const g = new THREE.Group(), h = new THREE.Mesh(hampeG, hampeM); g.add(h); for (const a of [0, Math.PI / 2]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(.05, .08), plumeM); p.position.z = -.22; p.rotation.set(0, Math.PI / 2, a); g.add(p); }
      const f = new THREE.Sprite(new THREE.SpriteMaterial({ map: feuF, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false })); f.position.z = .25; f.scale.set(.28, .28, 1); g.add(f);
      g.position.set(o.x + Math.sin(yawG) * .25, o.y + HG * .62, o.z + Math.cos(yawG) * .25); scene.add(g);
      fleches.push({ g, v: new THREE.Vector3(Math.sin(yawG), .04, Math.cos(yawG)).multiplyScalar(24), cible, vie: 1.6 });
      try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); const t0 = actx.currentTime, n = actx.createBufferSource(), b = actx.createBuffer(1, actx.sampleRate * .25, actx.sampleRate), d = b.getChannelData(0);   // (le « vlouf » de la corde)
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3); n.buffer = b; const bp = actx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 900; const gn = actx.createGain(); gn.gain.value = .5; n.connect(bp); bp.connect(gn); gn.connect(actx.destination); n.start(t0); } catch (e) {} };
    L.tirerFleche = tirer;
    // ses six cœurs : la voiture de police lui en prend un (et le projette) ; à zéro, il se relève au bar, six cœurs neufs
    const vies = document.createElement("div"); vies.style.cssText = "position:absolute;left:12px;top:44px;z-index:6;font-size:26px;letter-spacing:2px;text-shadow:0 0 6px #000;pointer-events:none;display:none";
    // le compteur des gremlins détruits : une tête de gremlin (le vrai, à crête blanche), et le score — un point par gremlin
    const tues = document.createElement("div"); tues.style.cssText = "position:absolute;left:236px;top:38px;z-index:6;display:none;align-items:center;gap:6px;padding:2px 10px 2px 4px;border-radius:20px;background:rgba(0,0,0,.5);border:2px solid #6fd23a;pointer-events:none;font:26px 'Luckiest Guy','Lato',sans-serif;color:#fff4d8;text-shadow:2px 2px 0 #000";
    tues.innerHTML = `<img src="images/gremlins/compteur.webp?v=1" alt="" style="height:46px;width:auto;display:block;margin:-4px 0;filter:drop-shadow(0 1px 2px #000)"><span class="n">0</span>`;
    L.tuesKF = 0; L.tueKF = () => { L.tuesKF++; tues.querySelector(".n").textContent = L.tuesKF; tues.animate([{ transform: "scale(1.35)" }, { transform: "scale(1)" }], { duration: 300 });
      };   // (Billy ne commente plus chaque gremlin détruit)
    let nVies = 6, invul = 0, recul = null; const dessinerVies = () => { nVies = Math.max(0, Math.min(6, nVies)); vies.textContent = "❤️".repeat(nVies) + "🖤".repeat(6 - nVies); }; dessinerVies();
    L.blesserGizmo = (dx, dz) => { const now = performance.now(); if (now < invul || nVies <= 0) return;

      // (Billy ne parle plus des blessures : quatre appels seulement, au début, à la pince, au levier, et pour rejoindre le bar)
      invul = now + 2000; nVies--; recul = { dx, dz, t0: now }; dessinerVies();
      voile("background:rgba(200,0,0,.35);opacity:1", 500); sonBruit(.4, 160, .5);
      if (nVies <= 0) { const moi = M.gens.get(M.moiNum); setTimeout(() => { if (!M || M.lieu !== "kingston") return; voile("background:#000;opacity:1", 1600); if (L.colleKF) L.colleKF.fin = 0; if (moi) { moi.cible = null; moi.chemin = []; moi.g.position.set(-33.7, moi.g.position.y, -5.8); } nVies = 6; dessinerVies(); msgKF("AÏE AÏE AÏE !", "Gizmo est à bout de forces… il se relève au bar."); }, 700); } else L.poserPansement && L.poserPansement(); };
    L.soignerGizmo = () => { if (nVies >= 6) return false; nVies++; dessinerVies(); return true; };   // (un pansement : un cœur de plus)
    // le bouton (et la touche F)
    const touche = e => { if (/^(INPUT|TEXTAREA)$/.test((e.target && e.target.tagName) || "")) return; if (e.key === "f" || e.key === "F") tirer(); if (e.key === "j" || e.key === "J") L.sauterGizmo(); }; window.addEventListener("keydown", touche);
    // sur téléphone, comme aux Goonies : la croix pour avancer (à gauche), A pour sauter et B pour tirer (à droite) — elles font comme une manette
    const tactile = !!(window.matchMedia && matchMedia("(pointer: coarse)").matches) || "ontouchstart" in window, pad = document.createElement("div");
    pad.style.cssText = "position:absolute;inset:0;z-index:6;pointer-events:none;display:none";
    const bouton = (txt, css, cle) => { const b = document.createElement("button"); b.type = "button"; b.textContent = txt; b.style.cssText = "position:absolute;width:62px;height:62px;border-radius:50%;border:2px solid rgba(255,220,120,.75);background:rgba(0,0,0,.4);color:#ffe7a0;font:bold 21px sans-serif;touch-action:none;pointer-events:auto;-webkit-user-select:none;user-select:none;" + css;
      const on = e => { e.preventDefault(); e.stopPropagation(); TACT_KF[cle] = true; b.style.background = "rgba(255,200,80,.35)"; }, off = e => { e.preventDefault(); TACT_KF[cle] = false; b.style.background = "rgba(0,0,0,.4)"; };
      b.addEventListener("pointerdown", on); b.addEventListener("pointerup", off); b.addEventListener("pointercancel", off); b.addEventListener("pointerleave", off); b.addEventListener("contextmenu", e => e.preventDefault()); pad.appendChild(b); return b; };
    // le joystick : on pose le pouce dessus et on le fait glisser ; plus on l'écarte du centre, plus Gizmo va vite
    { const joy = document.createElement("div"), bt = document.createElement("div"), RJ = 58; let jid = null;
      joy.style.cssText = "position:absolute;left:18px;bottom:calc(18px + env(safe-area-inset-bottom));width:148px;height:148px;border-radius:50%;border:2px solid rgba(255,220,120,.6);background:radial-gradient(circle,rgba(0,0,0,.2),rgba(0,0,0,.45));touch-action:none;pointer-events:auto;-webkit-user-select:none;user-select:none";
      bt.style.cssText = "position:absolute;left:50%;top:50%;width:62px;height:62px;margin:-31px 0 0 -31px;border-radius:50%;background:rgba(255,215,110,.5);border:2px solid rgba(255,235,170,.9);box-shadow:0 2px 8px rgba(0,0,0,.5);pointer-events:none"; joy.appendChild(bt); pad.appendChild(joy);
      const bouger = e => { const r = joy.getBoundingClientRect(); let dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2); const l = Math.hypot(dx, dy); if (l > RJ) { dx *= RJ / l; dy *= RJ / l; }
        bt.style.transform = `translate(${dx}px,${dy}px)`; const mort = l < 8; TACT_KF.jx = mort ? 0 : dx / RJ; TACT_KF.jy = mort ? 0 : dy / RJ; };
      const lacher = e => { if (e.pointerId !== jid) return; jid = null; TACT_KF.jx = TACT_KF.jy = 0; bt.style.transform = ""; };
      joy.addEventListener("pointerdown", e => { e.preventDefault(); e.stopPropagation(); jid = e.pointerId; try { joy.setPointerCapture(jid); } catch (er) {} bouger(e); });
      joy.addEventListener("pointermove", e => { if (e.pointerId === jid) { e.preventDefault(); bouger(e); } }); joy.addEventListener("pointerup", lacher); joy.addEventListener("pointercancel", lacher); joy.addEventListener("contextmenu", e => e.preventDefault()); }
    bouton("B", "right:104px;bottom:calc(30px + env(safe-area-inset-bottom));width:70px;height:70px", "tir"); bouton("A", "right:16px;bottom:calc(76px + env(safe-area-inset-bottom));width:78px;height:78px", "saut");
    let pos0 = null, enPlace = false; const caches = new Set();
    const garde = setInterval(() => { const ici = !!M && M.lieu === "kingston"; if (ici && !vies.parentNode && M.ctx && M.ctx.conteneur) { M.ctx.conteneur.appendChild(pad); M.ctx.conteneur.appendChild(vies); M.ctx.conteneur.appendChild(tues); }
      const montre = ici && tactile && !M.cine && !M.kfGenerique; pad.style.display = montre ? "block" : "none"; if (!montre) for (const k in TACT_KF) TACT_KF[k] = false; vies.style.display = ici && !M.cine ? "block" : "none"; tues.style.display = ici && !M.cine && L.gizmoRambo !== false ? "flex" : "none";
      if (!ici && (racine.parent || caches.size)) { if (racine.parent) racine.parent.remove(racine); for (const c of caches) { c.visible = true; c.traverse(o => o.layers.set(0)); } caches.clear(); const mo = M && M.gens.get(M.moiNum); if (mo) mo.g.visible = true; enPlace = false; if (G) { G.band.visible = G.arc.visible = false; } }   // (tout ce qu'on avait caché — même déjà passé au personnage de la rue)   // (on quitte Kingston Falls : on redevient soi-même)
      if (!M) { clearInterval(garde); window.removeEventListener("keydown", touche); pad.remove(); vies.remove(); tues.remove(); } }, 300);
    L.gizmoMaj = (dt, t) => { const moi = M && M.gens.get(M.moiNum); if (!moi || !G) return;
      if (racine.parent !== moi.g) { moi.g.add(racine); enPlace = true; } for (const c of moi.g.children) if (c !== racine) { c.visible = false; c.traverse(o => o.layers.set(31)); caches.add(c); }   // (notre bonhomme, caché — sur un calque que la caméra ne voit pas : le jeu le réaffiche à chaque image — c'est Gizmo)
      G.band.visible = G.arc.visible = L.gizmoRambo !== false;
      // la musique : rien dans le bar (ni pendant la cinématique) ; elle commence quand Gizmo sort dans la rue
      // (silence pendant toute l'intro ; la musique part quand Gizmo a fini de se préparer comme Rambo — ou, sans l'intro, quand il sort du bar)
      { const mus = M.lbMus && M.lbMus.cle === "kf" && M.lbMus.a, calme = !!L.silenceKF || (L.gizmoDedans !== false && !L.apresRamboKF);
        if (mus) { if (calme) { if (!mus.paused) mus.pause(); } else if (mus.paused && !M.pauseRendu && !L.tvLueur && performance.now() > (L.musEssai || 0)) { L.musEssai = performance.now() + 1500;
          if (mus.volume < .05) { const t0 = performance.now(), i = setInterval(() => { const u = Math.min(1, (performance.now() - t0) / 1500); mus.volume = .55 * u; if (u >= 1) clearInterval(i); }, 50); }   // (elle avait été créée muette : on la fait monter)
          mus.play().catch(() => {}); } } }
      if (G.inner) { const pen = L.gizmoTravail ? .32 + .07 * Math.sin(t / 140) : 0; G.inner.rotation.x += (pen - G.inner.rotation.x) * Math.min(1, dt * 6); }   // (il se penche sur son bricolage)
      if (L.gizmoMats) { const f = L.tvLueur ? L.tvLueur(t) + .2 : .28; for (const m of L.gizmoMats) m.emissiveIntensity = f; }   // (devant la télé : sa lumière vacille sur lui)   // (avant d'avoir vu Rambo à la télé : ni bandana ni arc)
      const p = moi.g.position, v = pos0 ? Math.hypot(p.x - pos0.x, p.z - pos0.z) / Math.max(dt, 1e-3) : 0; if (pos0 && v > .2) {   /* (il regarde où il va) */ const ya = Math.atan2(p.x - pos0.x, p.z - pos0.z); let d = ya - yawG; d = Math.atan2(Math.sin(d), Math.cos(d)); yawG += d * Math.min(1, dt * 10); }
      { const SL = L.salleLou, dd = !!SL && p.x > SL.x0 && p.x < SL.x1 && p.z > SL.z0 && p.z < SL.z1;   // (dans le bar : la caméra tout près, juste derrière lui — elle ne va plus dans les murs)
        if (dd !== L.gizmoDedans) { 
          L.gizmoDedans = dd; L.suiviRue = L.suiviRue || L.suivi; L.suivi = dd ? { d: 1.6, h: 1.25, av: 2.2, vy: .95 } : L.suiviRue; M.camE = null; } }
      if (recul) { const u = (performance.now() - recul.t0) / 500; if (u >= 1) recul = null; else { const v = (1 - u) * .22, nx = p.x + recul.dx * v, nz = p.z + recul.dz * v; if (L.limites(nx, nz)) { p.x = nx; p.z = nz; moi.cible = null; moi.chemin = []; } } }   // (projeté)
      pos0 = { x: p.x, z: p.z }; racine.rotation.y = yawG - moi.g.rotation.y;
      const wR = Math.min(1, Math.max(0, (v - 2.2) / 1.5)), wW = Math.min(1, v / .8) * (1 - wR), wI = 1 - wW - wR;
      if (G.act.idle) G.act.idle.setEffectiveWeight(wI); if (G.act.walk) { G.act.walk.setEffectiveWeight(wW); G.act.walk.timeScale = 1.4; } if (G.act.run) { G.act.run.setEffectiveWeight(wR); G.act.run.timeScale = 1.2; } G.mix.update(dt);
      // les pieds au sol : le mouvement emprunté le soulève ou l'enfonce un peu ; on le recale sur le plus bas de ses deux pieds
      // (sa vraie taille : mesurée une fois animé — du bout des pieds au sommet du crâne, la tête faisant ~45 % de sa hauteur au-dessus de l'os du cou)
      if (!G.cal && G.tete && G.pieds.length) { racine.updateMatrixWorld(true); const w = new THREE.Vector3(); let ym = 1e9; for (const b of G.pieds) ym = Math.min(ym, b.getWorldPosition(w).y); const hy = G.tete.getWorldPosition(w).y - ym;
        if (hy > .01) { G.inner.scale.multiplyScalar(HG / (hy * 1.5)); G.cal = true; } }
      if (G.pieds.length) { racine.updateMatrixWorld(true); let ym = 1e9; const w = new THREE.Vector3(); for (const b of G.pieds) ym = Math.min(ym, b.getWorldPosition(w).y); if (vSautG || sautG > 0) { sautG += vSautG * dt; vSautG -= 13 * dt; if (sautG <= 0) { sautG = 0; vSautG = 0; } }   // (le bond : il monte, retombe)
        const sol = p.y + .015 + sautG; G.inner.position.y += (sol - ym) * Math.min(1, dt * (sautG > 0 ? 60 : 12)); }
      // le bandana suit la tête, l'arc la main gauche
      const tp = new THREE.Vector3(); if (G.tete) { G.tete.getWorldPosition(tp); } else tp.set(p.x, p.y + HG * .75, p.z); G.band.position.set(tp.x, tp.y + HG * .3, tp.z); G.band.rotation.set(0, yawG, 0);
      G.pans.forEach((m, i) => { m.rotation.x = .5 + Math.sin(t / 120 + i) * .25 + Math.min(.6, v * .15); });
      if (G.main) { G.main.getWorldPosition(tp); G.arc.position.copy(tp); } G.arc.rotation.set(0, yawG + Math.PI / 2, 0);
      // les flèches
      for (let i = fleches.length - 1; i >= 0; i--) { const f = fleches[i]; f.vie -= dt;
        if (f.cible && !(f.cible.mort > 0)) { const c = f.cible, d = new THREE.Vector3(c.x, L.centreG(c), c.z).sub(f.g.position), l = d.length(); if (c.boss) f.v.copy(d.normalize().multiplyScalar(24)); else if (l < 14) f.v.lerp(d.normalize().multiplyScalar(24), Math.min(1, dt * 6)); }
        else f.v.y -= 6 * dt;
        f.g.position.addScaledVector(f.v, dt); f.g.lookAt(f.g.position.clone().add(f.v));
        let touche = null; for (const q of cibles()) { if (q.mort > 0 || q.feu > 0) continue; const dx = q.x - f.g.position.x, dy = L.centreG(q) - f.g.position.y, dz = q.z - f.g.position.z; if (dx * dx + dy * dy + dz * dz < (q.boss ? 2.6 : .16)) { touche = q; break; } }
        const sol = L.hauteur ? L.hauteur(f.g.position.x, f.g.position.z) : 0;
        if (touche) L.toucherGremlin(touche);
        if (touche || f.vie <= 0 || f.g.position.y < sol) { scene.remove(f.g); f.g.traverse(o => { if (o.material && o.material.dispose && o.material !== hampeM && o.material !== plumeM) o.material.dispose(); }); fleches.splice(i, 1); } } }; }
  // ---- l'accident : une Coccinelle repeinte, encastrée dans la vitrine du fleuriste, qui brûle ; le verre brisé sur le trottoir ----
  { const X = -26.35, Z = 11.1, R = -Math.PI / 2 + .22, dx = Math.sin(R), dz = Math.cos(R);
    for (const k of [-1, 0, 1]) obst.push([X + dx * k * 1.3, Z + dz * k * 1.3, 1.0]);
    chargerKF("coccinelle").then(({ parts, t }) => { const s = 4.07 / t.z;
      poser(parts, [mt4(X, y0 + .02, Z, R, s, s, s, -.05, .04)], true, m => { if (m.name !== "base") return m; const m2 = m.clone(); m2.color.setHex(0xe0a020); return m2; }); }).catch(e => console.warn("accident", e));
    // les flammes : des taches de feu qui dansent sur le capot et dans la vitrine ; la fumée noire qui monte
    const flamT = tex(toile(64, 128, (x) => { const g = x.createRadialGradient(32, 92, 2, 32, 80, 60); g.addColorStop(0, "rgba(255,250,200,1)"); g.addColorStop(.25, "rgba(255,190,60,.95)"); g.addColorStop(.6, "rgba(255,80,10,.6)"); g.addColorStop(1, "rgba(120,10,0,0)"); x.fillStyle = g; x.beginPath(); x.moveTo(32, 2); x.quadraticCurveTo(62, 70, 52, 110); x.quadraticCurveTo(32, 128, 12, 110); x.quadraticCurveTo(2, 70, 32, 2); x.fill(); }));
    const fumT = tex(toile(64, 64, (x) => { const g = x.createRadialGradient(32, 32, 2, 32, 32, 31); g.addColorStop(0, "rgba(40,36,34,.7)"); g.addColorStop(1, "rgba(40,36,34,0)"); x.fillStyle = g; x.fillRect(0, 0, 64, 64); }));
    const fl = [], fu = [], cxF = X + dx * 1.15, czF = Z + dz * 1.15, feuxG = new THREE.Group(); scene.add(feuxG);   // (dans un groupe : les sprites posés à même la scène passent pour des nuages, cachés la nuit)
    for (let i = 0; i < 46; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: flamT, blending: i % 3 ? THREE.NormalBlending : THREE.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false })); feuxG.add(sp);
      fl.push({ sp, ox: (Math.random() - .5) * 1.7, oz: (Math.random() - .5) * 1.5, ph: Math.random() * 6, h: .9 + Math.random() * 1.4, av: Math.random() * 1.6 }); }
    for (let i = 0; i < 12; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: fumT, depthWrite: false, transparent: true, opacity: .55 })); feuxG.add(sp); fu.push({ sp, t0: Math.random() * 4, ox: (Math.random() - .5) * .8 }); }
    const lf = new THREE.PointLight(0xff7a20, 16, 14, 1.4); lf.position.set(cxF, y0 + 1.8, czF); scene.add(lf);
    const verre = new THREE.InstancedMesh(new THREE.PlaneGeometry(.12, .08), new THREE.MeshStandardMaterial({ color: 0xcfe0ee, metalness: .8, roughness: .1, transparent: true, opacity: .7, side: THREE.DoubleSide }), 60), mv = new THREE.Matrix4();
    for (let i = 0; i < 60; i++) { const a = Math.random() * 6.28, r = Math.random() * 2.2; mv.compose(new THREE.Vector3(X + dx * 1.6 + Math.cos(a) * r * .6 + 1, y0 + .01, Z + Math.sin(a) * r), new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, Math.random() * 6)), new THREE.Vector3(.5 + Math.random(), .5 + Math.random(), 1)); verre.setMatrixAt(i, mv); } scene.add(verre);
    // les voitures en feu, garées : deux Coccinelles calcinées, les flammes qui sortent de l'habitacle et du capot
    const brulees = [[23.95, 15.2, Math.PI], [14.5, 20.15, Math.PI / 2]]   /* (plus rien devant la porte du bar) */, flB = [];
    for (const [x, z, r] of brulees) { for (const k of [-1.3, 0, 1.3]) obst.push([x + Math.sin(r) * k, z + Math.cos(r) * k, 1.0]);
      for (let i = 0; i < 26; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: flamT, blending: i % 3 ? THREE.NormalBlending : THREE.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false })); feuxG.add(sp);
        const a = (Math.random() - .5) * 2.8; flB.push({ sp, x: x + Math.sin(r) * a + (Math.random() - .5) * .6 * Math.cos(r), z: z + Math.cos(r) * a - (Math.random() - .5) * .6 * Math.sin(r), ph: Math.random() * 6, h: .8 + Math.random() * 1.2 }); }
      for (let i = 0; i < 6; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: fumT, depthWrite: false, transparent: true, opacity: .5 })); feuxG.add(sp); fu.push({ sp, t0: Math.random() * 4, ox: (Math.random() - .5) * .8, cx: x, cz: z }); } }
    chargerKF("coccinelle").then(({ parts, t }) => { const s = 4.07 / t.z; poser(parts, brulees.map(([x, z, r]) => mt4(x, 0, z, r, s)), false, m => { const m2 = m.clone(); if (m2.color) m2.color.multiplyScalar(m.name === "base" ? 0 : .3).add(new THREE.Color(0x1c1612)); return m2; }); }).catch(e => console.warn("voitures brûlées", e));
    L.feuAccident = (t) => { const T = t / 1000;
      for (const f of flB) { const k = .7 + .3 * Math.sin(T * 9 + f.ph * 3); f.sp.position.set(f.x, y0 + .9 + f.h * k * .55, f.z); f.sp.scale.set(.7 * k + .3, f.h * 1.5 * k + .4, 1); } lf.intensity = 13 + 5 * Math.sin(T * 17) + 3 * Math.sin(T * 31);
      for (const f of fl) { const k = .7 + .3 * Math.sin(T * 9 + f.ph * 3), ax = cxF - dx * f.av * 1.4, az = czF - dz * f.av * 1.4;   // (le long du capot, jusqu'au pare-brise)
        f.sp.position.set(ax + f.ox * .5, y0 + 1.0 + f.h * k * .55, az + f.oz * .5); f.sp.scale.set(.75 * k + .3, f.h * 1.6 * k + .4, 1); }
      for (const f of fu) { const u = ((T * .35 + f.t0) % 4) / 4; f.sp.position.set((f.cx ?? cxF) + f.ox + u * 1.5, y0 + 1.8 + u * 7, (f.cz ?? czF) + u * .8); f.sp.scale.setScalar(.8 + u * 3.5); f.sp.material.opacity = .55 * (1 - u); } }; }
  // ---- le carnage : les poubelles renversées, les sacs éventrés, les cartons, les canettes, les papiers ; et les journaux que le vent emporte ----
  { const metal = new THREE.MeshStandardMaterial({ color: 0x8a8e92, metalness: .7, roughness: .45 }), sacM = new THREE.MeshStandardMaterial({ color: 0x141416, roughness: .35, metalness: .1 }),
      carton = new THREE.MeshStandardMaterial({ color: 0xa8845a, roughness: .9 }), canM = new THREE.MeshStandardMaterial({ color: 0xc81e24, metalness: .7, roughness: .3 }), mt = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    const placer = (n, test) => { const r = []; for (let k = 0; r.length < n && k < n * 40; k++) { const x = -26.5 + Math.random() * 53, z = -15 + Math.random() * 38; if (L.limites(x, z) && !(L.dansLou && L.dansLou(x, z)) && (!test || test(x, z))) r.push([x, z]); } return r; };
    const lot = (geo, mat, pts, f) => { const im = new THREE.InstancedMesh(geo, mat, pts.length); pts.forEach((p, i) => { f(p, i); im.setMatrixAt(i, mt); }); im.castShadow = false; im.receiveShadow = true; scene.add(im); return im; };
    const trottoir = (x, z) => Math.abs(x) > 24.6 || z > 20.6 || (Math.abs(x) < 15.6 && z > -15.6 && z < 11.6);
    // les poubelles : la vraie (un scan), debout sur le trottoir — une sur trois renversée
    const pb = placer(12, trottoir); pb.forEach(([x, z]) => obst.push([x, z, .5]));
    // des papiers par terre, partout : des pages de journal à plat dans la neige
    { const pT = tex(toile(128, 90, x => { x.fillStyle = "#ddd6c4"; x.fillRect(0, 0, 128, 90); x.fillStyle = "#333"; x.fillRect(8, 8, 112, 8); x.fillStyle = "#777"; for (let c = 0; c < 3; c++) for (let l = 0; l < 8; l++) x.fillRect(8 + c * 40, 22 + l * 8, 34 - (l % 4 === 3 ? 14 : 0), 3); }));
      // le bar saccagé (quand les gremlins s'y réfugient) : des papiers partout, des verres brisés, des chopes renversées
      L.desordreBarKF = () => { const SL = L.salleLou; if (!SL || L.desordreFait) return; L.desordreFait = true; const yb = .125, pts = n => [...Array(n)].map(() => SL.vers(-4 + Math.random() * 8, -.9 - Math.random() * 13.9));
        lot(new THREE.PlaneGeometry(.38, .27), new THREE.MeshStandardMaterial({ map: pT, roughness: 1, side: THREE.DoubleSide }), pts(45), ([x, z]) => { e.set(-Math.PI / 2 + (Math.random() - .5) * .3, 0, Math.random() * 6, "YXZ"); mt.compose(new THREE.Vector3(x, yb + .012 + Math.random() * .012, z), q.setFromEuler(e), new THREE.Vector3(.6 + Math.random() * .6, .6 + Math.random() * .6, 1)); });
        const verre = new THREE.MeshStandardMaterial({ color: 0xcfe6f0, transparent: true, opacity: .55, roughness: .05, metalness: .3, side: THREE.DoubleSide, emissive: 0x203038 }), eclat = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(.07, 0, .02), new THREE.Vector3(.02, 0, .09)]); eclat.computeVertexNormals();
        const tas = pts(14); lot(eclat, verre, tas.flatMap(([x, z]) => [...Array(9)].map(() => [x + (Math.random() - .5) * .6, z + (Math.random() - .5) * .6])), ([x, z]) => { e.set((Math.random() - .5) * .3, Math.random() * 6, 0); mt.compose(new THREE.Vector3(x, yb + .006, z), q.setFromEuler(e), new THREE.Vector3(1, 1, 1).multiplyScalar(.6 + Math.random())); });
        lot(new THREE.CylinderGeometry(.045, .04, .14, 10, 1, true), verre, pts(10), ([x, z]) => { e.set(Math.PI / 2, Math.random() * 6, 0, "YXZ"); mt.compose(new THREE.Vector3(x, yb + .045, z), q.setFromEuler(e), new THREE.Vector3(1, 1, 1)); }); };   // (les chopes couchées)
      lot(new THREE.PlaneGeometry(.42, .3), new THREE.MeshStandardMaterial({ map: pT, roughness: 1, side: THREE.DoubleSide }), placer(70), ([x, z]) => { e.set(-Math.PI / 2 + (Math.random() - .5) * .25, 0, Math.random() * 6, "YXZ"); mt.compose(new THREE.Vector3(x, (L.hauteur ? L.hauteur(x, z) : 0) + .012 + Math.random() * .01, z), q.setFromEuler(e), new THREE.Vector3(.7 + Math.random() * .6, .7 + Math.random() * .6, 1)); }); }
    // le feu dans les poubelles (une sur trois, debout) : de vraies flammes qui dansent au-dessus, la fumée noire
    { const fT = tex(toile(64, 128, x => { const g = x.createRadialGradient(32, 96, 2, 32, 80, 62); g.addColorStop(0, "rgba(255,245,190,1)"); g.addColorStop(.3, "rgba(255,170,50,.95)"); g.addColorStop(.7, "rgba(240,60,10,.55)"); g.addColorStop(1, "rgba(120,10,0,0)"); x.fillStyle = g; x.beginPath(); x.moveTo(32, 2); x.quadraticCurveTo(62, 70, 52, 112); x.quadraticCurveTo(32, 128, 12, 112); x.quadraticCurveTo(2, 70, 32, 2); x.fill(); }));
      const sT = tex(toile(64, 64, x => { const g = x.createRadialGradient(32, 32, 2, 32, 32, 31); g.addColorStop(0, "rgba(38,34,32,.75)"); g.addColorStop(1, "rgba(38,34,32,0)"); x.fillStyle = g; x.fillRect(0, 0, 64, 64); }));
      const gP = new THREE.Group(); scene.add(gP); const FP = [];   // (dans un groupe : la nuit ne cache pas les sprites)
      const foyer = (x, y, z, nf = 7, nfu = 3, sc = 1) => { const n0 = FP.length; for (let k = 0; k < nf; k++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: fT, blending: k % 3 ? THREE.NormalBlending : THREE.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false })); gP.add(sp); FP.push({ sp, x: x + (Math.random() - .5) * .3 * sc, z: z + (Math.random() - .5) * .3 * sc, y, ph: Math.random() * 6, h: (.45 + Math.random() * .4) * sc, fum: false, sc }); }
        for (let k = 0; k < nfu; k++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: sT, depthWrite: false, transparent: true })); gP.add(sp); FP.push({ sp, x, z, y, ph: k / 3, fum: true, sc }); } return FP.slice(n0); };
      L.eteindreKF = l => { for (const f of l || []) { const i = FP.indexOf(f); if (i >= 0) FP.splice(i, 1); gP.remove(f.sp); f.sp.material.dispose(); } };
      pb.forEach(([x, z], i) => { if (i % 3 !== 1) return; foyer(x, (L.hauteur ? L.hauteur(x, z) : 0) + .92, z); });
      // le sapin du bar qui prend feu (quand Gizmo relève le levier) : des flammes de bas en haut, sa lueur orange qui danse sur les murs
      L.foyerKF = foyer;
      L.allumerSapinKF = () => { const S = L.sapinKF; if (!S || S.feu) return; S.feu = true;
        for (let i = 0; i < 10; i++) { const u = i / 10 * .88, a = i * 2.4, r = S.R * (1 - u) * .65; foyer(S.x + Math.cos(a) * r, S.yb + S.H * u, S.z + Math.sin(a) * r, 4, i % 3 === 0 ? 1 : 0, 1.5 - u * .7); }
        const hT = L.halos ? L.halos.material.map : fT, pl = new THREE.Sprite(new THREE.SpriteMaterial({ map: hT, color: 0xff7a2a, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false })); pl.position.set(S.x, S.yb + 1.2, S.z); gP.add(pl); S.lum = pl; };   // (une grande lueur, pas une vraie lampe : ajouter une lumière ferait recompiler tous les matériaux — un gel de plusieurs secondes)
      L.feuPoubelles = t => { const T = t / 1000; for (const f of FP) { if (f.fum) { const u = (T * .45 + f.ph) % 1; f.sp.position.set(f.x + Math.sin(u * 5) * .15, f.y + .5 + u * 2.4, f.z); f.sp.scale.setScalar(.5 + u * 1.4); f.sp.material.opacity = (1 - u) * .5; continue; }
        const k = .7 + .3 * Math.sin(T * 10 + f.ph * 3); f.sp.position.set(f.x, f.y + f.h * k * .5, f.z); f.sp.scale.set((.35 * k + .2) * (f.sc || 1), f.h * 1.3 * k + .25, 1); }
        const S = L.sapinKF; if (S && S.lum) { const k = .8 + Math.sin(T * 13) * .1 + Math.sin(T * 7.3) * .1; S.lum.scale.setScalar(4.2 * k); S.lum.material.opacity = .55 * k; } }; }
    // les taches de sang sur la neige : vert, là où un gremlin a brûlé ; rouge, les gouttes du père Noël attaqué
    { const tT = tex(toile(64, 64, x => { x.fillStyle = "#fff"; x.beginPath(); x.arc(32, 32, 14, 0, 7); x.fill(); for (let i = 0; i < 9; i++) { const a = i * .7 + Math.random(), r = 14 + Math.random() * 12; x.beginPath(); x.arc(32 + Math.cos(a) * r, 32 + Math.sin(a) * r, 2 + Math.random() * 4, 0, 7); x.fill(); } }));
      const N = 160, mk = c => { const m = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: tT, color: c, transparent: true, opacity: .85, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 }), N); m.frustumCulled = false; const z0 = new THREE.Matrix4().makeScale(0, 0, 0); for (let i = 0; i < N; i++) m.setMatrixAt(i, z0); scene.add(m); return { m, i: 0 }; };
      const vert = mk(0x3fae1a), rouge = mk(0x9a0a0a), m4 = new THREE.Matrix4(), qq = new THREE.Quaternion(), ee = new THREE.Euler();
      L.tache = (x, z, estVert, taille = 1) => { const T = estVert ? vert : rouge; ee.set(-Math.PI / 2, 0, Math.random() * 6, "YXZ"); const s2 = taille * (.6 + Math.random() * .5);
        m4.compose(new THREE.Vector3(x, (L.hauteur ? L.hauteur(x, z) : 0) + .015, z), qq.setFromEuler(ee), new THREE.Vector3(s2, s2, 1)); T.m.setMatrixAt(T.i, m4); T.i = (T.i + 1) % N; T.m.instanceMatrix.needsUpdate = true; }; }
    KF_ATTENTES.push((async () => { gltfMod = gltfMod || await import("./vendor/GLTFLoader.js?v=1"); const G = await new gltfMod.GLTFLoader().loadAsync("avatars/kingston/poubelle.glb?v=1"); let me = null;
      G.scene.updateMatrixWorld(true); G.scene.traverse(o => { if (o.isMesh && !me) me = o; }); if (!me) return;
      const geo = me.geometry.clone().applyMatrix4(me.matrixWorld); geo.computeBoundingBox(); const bb = geo.boundingBox, c = bb.getCenter(new THREE.Vector3()); geo.translate(-c.x, -bb.min.y, -c.z);
      const k = .95 / (bb.max.y - bb.min.y), r = Math.max(bb.max.x - bb.min.x, bb.max.z - bb.min.z) * k / 2, mat = new THREE.MeshStandardMaterial({ map: me.material.map, roughness: .55, metalness: .35, side: THREE.DoubleSide });   // (environ 95 cm de haut)
      const m2 = new THREE.Matrix4(), q2 = new THREE.Quaternion(), e2 = new THREE.Euler(), im = new THREE.InstancedMesh(geo, mat, pb.length);
      pb.forEach(([x, z], i) => { const couche = i % 3 === 0; e2.set(couche ? Math.PI / 2 : 0, Math.random() * 6, 0, "YXZ"); m2.compose(new THREE.Vector3(x, y0 + (couche ? r : 0), z), q2.setFromEuler(e2), new THREE.Vector3(k, k, k)); im.setMatrixAt(i, m2); });
      im.receiveShadow = true; scene.add(im); })().catch(e => console.warn("poubelle", e)));
    lot(blob(2, .3), sacM, placer(22), ([x, z]) => { e.set(0, Math.random() * 6, 0); mt.compose(new THREE.Vector3(x, (L.hauteur ? L.hauteur(x, z) : 0) + .15, z), q.setFromEuler(e), new THREE.Vector3(.32 + Math.random() * .1, .2, .26)); });
    // les cartons : on ne les traverse pas — on les pousse, ils glissent sur la neige (comme ceux de Resident Evil)
    const cartons = placer(34).map(([x, z]) => { const k = .25 + Math.random() * .3; return { x, z, y: L.hauteur ? L.hauteur(x, z) : 0, k, s: k * 2, ry: Math.random() * 6, rx: Math.random() * .5, rz: Math.random() * .5 }; });
    const imC = lot(new THREE.BoxGeometry(1, 1, 1), carton, cartons, () => {}); imC.frustumCulled = false;
    L.cartons = { im: imC, c: cartons, maj: () => { cartons.forEach((c, i) => { e.set(c.rx, c.ry, c.rz); mt.compose(new THREE.Vector3(c.x, (L.hauteur ? L.hauteur(c.x, c.z) : c.y) + c.k * .35, c.z), q.setFromEuler(e), new THREE.Vector3(c.k, c.k * .7, c.k * .8)); imC.setMatrixAt(i, mt); }); imC.instanceMatrix.needsUpdate = true; } }; L.cartons.maj();
    lot(new THREE.CylinderGeometry(.033, .033, .12, 8), canM, placer(50), ([x, z]) => { e.set(Math.PI / 2, Math.random() * 6, 0, "YXZ"); mt.compose(new THREE.Vector3(x, (L.hauteur ? L.hauteur(x, z) : 0) + .035, z), q.setFromEuler(e), new THREE.Vector3(1, 1, 1)); });
    // les journaux : une page imprimée (le titre, les colonnes), qui glisse au ras du sol, se soulève dans les rafales, retombe, tournoie
    const jT = tex(toile(256, 180, (x) => { x.fillStyle = "#e4dfd2"; x.fillRect(0, 0, 256, 180); x.fillStyle = "#1a1a1a"; x.font = "bold 22px Georgia, serif"; x.textAlign = "center"; x.fillText("KINGSTON FALLS", 128, 26); x.fillRect(10, 32, 236, 2);
      x.font = "bold 15px Georgia, serif"; x.fillText("STRANGE CREATURES SEEN IN TOWN", 128, 52); x.fillStyle = "#555"; for (let c = 0; c < 4; c++) for (let l = 0; l < 14; l++) x.fillRect(12 + c * 59, 64 + l * 8, 50 - (l % 5 === 4 ? 20 : 0), 3); x.fillStyle = "#888"; x.fillRect(130, 64, 110, 50); }));
    const jM = new THREE.MeshStandardMaterial({ map: jT, side: THREE.DoubleSide, roughness: .95 }), NJ = 44, jo = [];
    const jG = new THREE.PlaneGeometry(.56, .4, 4, 1); { const P = jG.attributes.position; for (let i = 0; i < P.count; i++) P.setZ(i, Math.sin((P.getX(i) / .56 + .5) * Math.PI) * .05); jG.computeVertexNormals(); }
    const jI = new THREE.InstancedMesh(jG, jM, NJ); jI.frustumCulled = false; scene.add(jI);
    for (let i = 0; i < NJ; i++) { const p = placer(1)[0] || [0, 10]; jo.push({ x: p[0], z: p[1], y: 0, vy: 0, rx: -Math.PI / 2, ry: Math.random() * 6, rz: 0, ph: Math.random() * 9 }); }
    const vent = { x: 1, z: .35 };
    L.journaux = (dt, t) => { const T = t / 1000, raf = Math.max(0, Math.sin(T * .7) * Math.sin(T * .23 + 1)) * 2.2;   // (le vent : des rafales)
      for (let i = 0; i < NJ; i++) { const j = jo[i], loc = .4 + .6 * Math.max(0, Math.sin(T * 1.3 + j.ph)), v = (.6 + raf * 1.6) * loc, sol = L.hauteur ? L.hauteur(j.x, j.z) : 0;
        j.x += vent.x * v * dt; j.z += (vent.z + Math.sin(T * .9 + j.ph) * .5) * v * dt;
        if (raf * loc > 1.1 && j.y < .05 && Math.random() < dt * 2) j.vy = 1.2 + Math.random() * 1.5;   // (une rafale la soulève)
        j.vy -= 2.2 * dt; j.y = Math.max(0, j.y + j.vy * dt); if (j.y === 0) j.vy = 0;
        const vol = Math.min(1, j.y * 2); j.rx = -Math.PI / 2 + vol * Math.sin(T * 4 + j.ph) * 1.4; j.rz = vol * Math.sin(T * 3.1 + j.ph * 2) * 1.2; j.ry += dt * (.3 + vol * 3) * (i % 2 ? 1 : -1);
        if (j.x > 27 || Math.abs(j.z - 4) > 20) { const p = placer(1, (x) => x < -12)[0]; if (p) { j.x = p[0]; j.z = p[1]; j.y = 0; } }
        e.set(j.rx, j.ry, j.rz, "YXZ"); mt.compose(new THREE.Vector3(j.x, sol + .02 + j.y, j.z), q.setFromEuler(e), new THREE.Vector3(1, 1, 1)); jI.setMatrixAt(i, mt); }
      jI.instanceMatrix.needsUpdate = true; }; }
  L.ambKF = new THREE.AmbientLight(0x8090c0, .2); scene.add(L.ambKF); scene.fog = new THREE.Fog(0x1a2132, 22, 95);
  // les réverbères allumés : les globes brillent, quelques-uns éclairent vraiment la neige autour d'eux
  scene.traverse(o => { if (o.isMesh && o.material && o.material.emissive && [0xfff0c8, 0xfff2d0].includes(o.material.emissive.getHex())) o.material.emissiveIntensity = 2.4; });
  for (const [x, z] of [[-14.6, 10.6], [14.6, 10.6]]) { const p = new THREE.PointLight(0xffd49a, 7, 13, 1.5);   /* (deux seulement : chaque lampe coûte sur tout l'écran) */ p.position.set(x, y0 + 3.9, z); scene.add(p); }
  { const g = new THREE.SphereGeometry(.075, 8, 6), mats = couleurs.map(c => new THREE.MeshBasicMaterial({ color: c, toneMapped: false }));
    for (let ci = 0; ci < couleurs.length; ci++) { const l = ampoules.filter(a => a[3] === couleurs[ci]); if (!l.length) continue; const im = new THREE.InstancedMesh(g, mats[ci], l.length); const mt = new THREE.Matrix4();
      l.forEach(([x, y, z], i) => { mt.makeTranslation(x, y, z); im.setMatrixAt(i, mt); }); scene.add(im); (L.guirlandes = L.guirlandes || []).push(im); }
    { const n = ampoules.length, pa = new Float32Array(n * 3), ca = new Float32Array(n * 3), c = new THREE.Color(); ampoules.forEach(([x, y, z, k], i) => { pa.set([x, y, z], i * 3); c.setHex(k); ca.set([c.r, c.g, c.b], i * 3); });
      const gh = new THREE.BufferGeometry(); gh.setAttribute("position", new THREE.BufferAttribute(pa, 3)); gh.setAttribute("color", new THREE.BufferAttribute(ca, 3));
      const halo = tex(toile(64, 64, (x) => { const g = x.createRadialGradient(32, 32, 0, 32, 32, 31); g.addColorStop(0, "rgba(255,255,255,.9)"); g.addColorStop(.2, "rgba(255,255,255,.45)"); g.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = g; x.fillRect(0, 0, 64, 64); }));
      L.halos = new THREE.Points(gh, new THREE.PointsMaterial({ map: halo, size: .38, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, opacity: .8 })); L.halos.frustumCulled = false; scene.add(L.halos); }
    const gb = new THREE.SphereGeometry(.13, 12, 8); for (let ci = 0; ci < 5; ci++) { const l = boules.filter(a => a[3] === couleurs[ci]); if (!l.length) continue;
      const im = new THREE.InstancedMesh(gb, A.mat({ color: couleurs[ci], metalness: .6, roughness: .2 }), l.length); const mt = new THREE.Matrix4(); l.forEach(([x, y, z], i) => { mt.makeTranslation(x, y, z); im.setMatrixAt(i, mt); }); scene.add(im); } }
  // ---- les flocons qui tombent ----
  const NF = 3500, pos = new Float32Array(NF * 3), vit = new Float32Array(NF);
  for (let i = 0; i < NF; i++) { pos[i * 3] = -45 + Math.random() * 90; pos[i * 3 + 1] = Math.random() * 26; pos[i * 3 + 2] = -35 + Math.random() * 80; vit[i] = .7 + Math.random() * .8; }
  const fg = new THREE.BufferGeometry(); fg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const flocon = tex(toile(32, 32, (x) => { const g = x.createRadialGradient(16, 16, 0, 16, 16, 15); g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(.5, "rgba(255,255,255,.7)"); g.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = g; x.fillRect(0, 0, 32, 32); }));
  const flocons = new THREE.Points(fg, new THREE.PointsMaterial({ map: flocon, size: .16, transparent: true, depthWrite: false, opacity: .9, color: 0xb8c2d8 })); flocons.frustumCulled = false; scene.add(flocons);
  // ---- un soir d'hiver : le ciel bas, bleu ardoise, la brume de neige ; les lumières de Noël partout ----
  L.toujoursNuit = true; L.sansLune = true; L.brumePerso = 0x1a2132; L.nuitKF = true;   // (une nuit de neige : pas d'étoiles, les nuages bas que la ville éclaire par-dessous)
  L.cielPerso = tex(toile(512, 512, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#070b16"); g.addColorStop(.5, "#141c2e"); g.addColorStop(.8, "#2a3046"); g.addColorStop(1, "#4a4048"); x.fillStyle = g; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(${alea() < .5 ? "70,78,100" : "20,24,36"},${.08 + alea() * .12})`; x.beginPath(); x.ellipse(alea() * w, alea() * h * .7, 60 + alea() * 120, 14 + alea() * 30, 0, 0, 7); x.fill(); } }));
  const anim0 = L.anim; let tP = 0;
  // ---- les passants : des gens de Kingston Falls, en tenue d'hiver des années 80, qui vont et viennent sur la place ----
  const PASS = passantsHiver(scene, L, obst);
  const GREM = gremlinsHV(scene, L);   // et les gremlins, lâchés dans la ville
  const hemi = scene.children.find(o => o.isHemisphereLight), sol2 = scene.children.find(o => o.isDirectionalLight); if (sol2) sol2.castShadow = false;   // (la nuit : pas d'ombres portées de la lune — tout le décor redessiné une fois de moins à chaque image)
  L.anim = (t) => { anim0 && anim0(t); for (const o of scene.children) if (o.isMesh && o.renderOrder === -1 && o.visible) o.visible = false;   /* (pas les nuages bleus du beau temps : le ciel bas et gris de l'hiver) */ if (hemi) { hemi.intensity = .5; hemi.color.setHex(0x8a9cd0); hemi.groundColor.setHex(0x2a3040); } if (sol2) { sol2.intensity = .38; sol2.color.setHex(0xa8b8e8); }
    const dt = Math.min(.1, (t - (tP || t)) / 1000); tP = t; PASS && PASS(dt, t); L.policeMaj && L.policeMaj(dt, t); GREM && GREM(dt, t);
    const a = fg.attributes.position.array; for (let i = 0; i < NF; i++) { a[i * 3 + 1] -= vit[i] * dt; a[i * 3] += Math.sin(t / 900 + i) * .25 * dt; if (a[i * 3 + 1] < 0) a[i * 3 + 1] += 26; } fg.attributes.position.needsUpdate = true;
    // les guirlandes scintillent, chaque couleur à son rythme
    (L.guirlandes || []).forEach((im, k) => { im.material.color.setHex(couleurs[k]).multiplyScalar(.55 + .45 * (Math.sin(t / 380 + k * 1.9) > -.2 ? 1 : .25)); });
    if (L.halos) L.halos.material.opacity = .7 + .15 * Math.sin(t / 500);
    if (L.feuTour) L.feuTour.visible = (t % 1600) < 700;
    L.feuAccident && L.feuAccident(t); L.journaux && L.journaux(dt, t); L.pereNoel && L.pereNoel(dt, t); L.gizmoMaj && L.gizmoMaj(dt, t); L.queteKF && L.queteKF(Math.min(.05, dt), t); L.feuPoubelles && L.feuPoubelles(t); if (M && M.L === L) pousserCartons(Math.min(.05, dt));
    (L.guirlandesBar || []).forEach((im, k) => { im.material.color.setHex(couleurs[k % couleurs.length]).multiplyScalar(.5 + .5 * (Math.sin(t / 300 + k * 2.3) > 0 ? 1 : .3)); });
    // les feux : vert 7 s, orange 2 s, rouge 9 s ; les deux rues se croisent en alternance
    for (const F of L.feux || []) { const c = ((t / 1000 + F.phase * 9) % 18), e = c < 7 ? 2 : c < 9 ? 1 : 0; F.lp.forEach((m, i) => m.material.color.setHex(i === e ? [0xff2a1a, 0xffb020, 0x30ff70][i] : [0x3a0806, 0x3a2806, 0x063a14][i])); } };
}

({ introGremlins, cineKingston, interieurBarKF, faceTaverneKF, hiverHV });
