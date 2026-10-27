/* Resident Evil : l'évacuation de la caserne de l'apocalypse (l'hélicoptère, l'héliport, le fumigène, l'explosion) et l'histoire
   (la radio de Brad, le toit, le GPS, le C4, la pluie, les sursauts). Les zombies et la caserne de l'apocalypse elle-même restent dans matrice.js.
   Chargé par la matrice (matrice.js) la première fois qu'on va dans un lieu de l'apocalypse, et exécuté chez elle (eval direct) :
   il se sert tel quel de tout ce qu'elle a. Ce qu'il rend (la dernière expression) : ses points d'entrée. */
/* ===================== l'évacuation (apocalypse) =====================
   Un fumigène est caché au sol, quelque part dans la caserne (jamais au même endroit d'une partie à l'autre : le serveur tire la cachette).
   Le premier qui le trouve le ramasse ; tout le monde est prévenu : sur la terrasse de la grande cour, au centre du H, un cercle rouge s'allume.
   Un survivant s'y place : le fumigène éclate en une grosse fumée rouge, l'hélicoptère descend, les survivants montent à bord,
   on voit la caserne du ciel… et elle explose. Fin de la partie. */
// sur la terrasse (pas de plateforme : juste un grand H peint, usé) : le cercle rouge et son faisceau (allumés quand le fumigène est trouvé)
function heliportApo(scene, L) {
  const H = helipad(), g = new THREE.Group(); g.position.set(H.x, H.y + .05, H.z); scene.add(g);
  const t = tex(toile(512, 512, (x, w, h) => { x.strokeStyle = "rgba(236,232,220,.92)"; x.lineWidth = 26; x.beginPath(); x.arc(256, 256, 226, 0, 7); x.stroke();
    x.fillStyle = "rgba(236,232,220,.92)"; x.fillRect(150, 120, 58, 272); x.fillRect(304, 120, 58, 272); x.fillRect(150, 228, 212, 56);
    x.globalCompositeOperation = "destination-out"; for (let i = 0; i < 1400; i++) { x.fillStyle = `rgba(0,0,0,${Math.random() * .6})`; x.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 7, 2 + Math.random() * 4); } }));
  const peint = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), new THREE.MeshStandardMaterial({ map: t, alphaTest: .35, roughness: .9, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 })); peint.rotation.x = -Math.PI / 2; peint.renderOrder = 2; g.add(peint);   /* (opaque, découpé, un peu plus haut : sur téléphone, le H transparent disparaissait sous le sol) */
  const rouge = (c, o) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide });
  const cercle = new THREE.Group(); cercle.visible = false; g.add(cercle);
  const anneau = new THREE.Mesh(new THREE.RingGeometry(1.25, 1.6, 48), rouge(0xff1a1a, .9)); anneau.rotation.x = -Math.PI / 2; anneau.position.y = .03; cercle.add(anneau);
  const disque = new THREE.Mesh(new THREE.CircleGeometry(1.25, 48), rouge(0x901010, .5)); disque.rotation.x = -Math.PI / 2; disque.position.y = .025; cercle.add(disque);
  const geoF = new THREE.CylinderGeometry(.6, 1.4, 40, 24, 1, true); geoF.translate(0, 20, 0);
  const faisceau = new THREE.Mesh(geoF, rouge(0xff2020, .1)); cercle.add(faisceau);
  L.heliport = { ...H, cercle, anneau, disque, faisceau };
  // autour de la piste : seize feux de balisage encastrés, qui clignotent en tournant (une lueur qui fait le tour) ; aux quatre coins de la terrasse, un projecteur sur son mât,
  // braqué vers la piste : son cône de lumière dans la pluie, la tache claire au sol (de fausses lumières : rien à recalculer, légères pour les petits téléphones)
  { const halo = tex(toile(64, 64, x => { const gr = x.createRadialGradient(32, 32, 1, 32, 32, 31); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(.35, "rgba(255,255,255,.45)"); gr.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); }));
    const NF = 16, R0 = 4.25, feux = [], boitier = new THREE.MeshStandardMaterial({ color: 0x2a2a2c, roughness: .6, metalness: .5 }), verreF = c => new THREE.MeshBasicMaterial({ color: c, fog: false });
    for (let i = 0; i < NF; i++) { const a = i / NF * Math.PI * 2, x = Math.cos(a) * R0, z = Math.sin(a) * R0, c = i % 2 ? 0xffd040 : 0xff2a1a;   // (jaune et rouge, en alternance)
      const b = new THREE.Mesh(new THREE.CylinderGeometry(.11, .13, .06, 10), boitier); b.position.set(x, .03, z); g.add(b);
      const v = new THREE.Mesh(new THREE.SphereGeometry(.07, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), verreF(c)); v.position.set(x, .06, z); g.add(v);
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: halo, color: c, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); s.position.set(x, .2, z); s.scale.setScalar(.9); g.add(s); feux.push({ v, s, c: new THREE.Color(c) }); }
    const zT = C3.z1 - C3.PP, zt0 = zT - C3.NT * C3.PT, zt1 = zt0 - C3.PTr, mg = .7, coins = [[-C3.LT / 2 + mg, zt0 - mg], [C3.LT / 2 - mg, zt0 - mg], [-C3.LT / 2 + mg, zt1 + mg], [C3.LT / 2 - mg, zt1 + mg]];
    const metal = new THREE.MeshStandardMaterial({ color: 0x3a3c40, roughness: .5, metalness: .7 }), cone = new THREE.MeshBasicMaterial({ color: 0xfff2d8, transparent: true, opacity: .08, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
    const tache = new THREE.MeshBasicMaterial({ map: halo, color: 0xfff0d0, transparent: true, opacity: .32, blending: THREE.AdditiveBlending, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3 });
    for (const [cx, cz] of coins) { const lx = cx - H.x, lz = cz - H.z, hM = 4.2, p = new THREE.Group(); p.position.set(lx, 0, lz); g.add(p);
      { const mat2 = new THREE.Mesh(new THREE.CylinderGeometry(.06, .09, hM, 8), metal); mat2.position.y = hM / 2; p.add(mat2); }
      const base = new THREE.Mesh(new THREE.BoxGeometry(.4, .12, .4), metal); base.position.y = .06; p.add(base);
      const vers = new THREE.Vector3(-lx, -hM, -lz).normalize(), tete = new THREE.Group(); tete.position.y = hM; tete.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), vers); p.add(tete);
      const corps = new THREE.Mesh(new THREE.CylinderGeometry(.24, .2, .38, 14), metal); corps.rotation.x = Math.PI / 2; tete.add(corps);
      const vitre = new THREE.Mesh(new THREE.CircleGeometry(.21, 16), new THREE.MeshBasicMaterial({ color: 0xfffbe8, fog: false })); vitre.position.z = .195; tete.add(vitre);
      const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: halo, color: 0xfff4d8, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); gl.position.z = .3; gl.scale.setScalar(1.6); tete.add(gl);
      const dist = Math.hypot(lx, hM, lz) * .78, gc = new THREE.ConeGeometry(1.9, dist, 20, 1, true); gc.translate(0, -dist / 2, 0); gc.rotateX(-Math.PI / 2); const cm = new THREE.Mesh(gc, cone); cm.position.z = .2; tete.add(cm);   // (le cône de lumière)
      const t2 = new THREE.Mesh(new THREE.PlaneGeometry(5.5, 5.5), tache); t2.rotation.x = -Math.PI / 2; t2.position.set(lx * .25, .04, lz * .25); g.add(t2); }   // (la tache claire, au sol, entre le mât et la piste)
    // le clignotement : une lueur qui tourne autour de la piste, et tous les feux qui pulsent doucement
    feux[0].v.onBeforeRender = () => { const t = performance.now() / 1000, tete = (t * 8) % NF;
      for (let i = 0; i < NF; i++) { const d = Math.min(Math.abs(i - tete), NF - Math.abs(i - tete)), k = Math.max(.15, 1 - d / 2.2) * (.85 + .15 * Math.sin(t * 6)), F = feux[i];
        F.s.material.opacity = k; F.s.scale.setScalar(.6 + k * 1.3); F.v.material.color.copy(F.c).multiplyScalar(.35 + k * .65); } }; }
}
// des détritus au sol : journaux, feuilles, canettes, cartons (quatre dessins en tout : très léger)
/* le vent : quelques feuilles de journal posées au sol ; de temps en temps, une rafale en soulève une, qui vole, tourbillonne et retombe plus loin */
function journauxVolants(scene, L, base, hSol) { if (base === "etage" || L.interieur) return; const zone = L.zone || [-30, 30, -30, 30], J = [];
  const mat = new THREE.MeshStandardMaterial({ map: texJournal, roughness: 1, side: THREE.DoubleSide });
  for (let i = 0; i < 3000 && J.length < 14; i++) { const x = zone[0] + Math.random() * (zone[1] - zone[0]), z = zone[2] + Math.random() * (zone[3] - zone[2]); if (!L.limites(x, z) || (L.repos && L.repos(x, z))) continue;
    const o = new THREE.Mesh(new THREE.PlaneGeometry(.46, .32), mat); const y = hSol(x, z); o.position.set(x, y + .016, z); o.rotation.set(-Math.PI / 2, 0, Math.random() * 7); scene.add(o); J.push({ o, x, z, y, etat: "sol", t: 0 }); }
  L.journaux = { J, hSol, ventA: Math.random() * Math.PI * 2, rafaleT: 0 }; }
function ventJournaux(dt, now) { const V = M.L && M.L.journaux; if (!V) return;
  V.ventA += Math.sin(now / 9000) * dt * .05; const wx = Math.sin(V.ventA), wz = Math.cos(V.ventA);
  if (now > V.rafaleT) { V.rafaleT = now + 1800 + Math.random() * 3500; const j = V.J.filter(q => q.etat === "sol")[Math.floor(Math.random() * V.J.length)]; if (j) Object.assign(j, { etat: "vol", t0: now, d: 2.5 + Math.random() * 3, v: 2 + Math.random() * 2.5, h: .8 + Math.random() * 1.8, sp: (Math.random() - .5) * 9, ph: Math.random() * 7 }); }
  for (const j of V.J) { if (j.etat !== "vol") continue; const u = (now - j.t0) / 1000 / j.d;
    if (u >= 1) { j.etat = "sol"; j.y = V.hSol(j.x, j.z); j.o.position.set(j.x, j.y + .016, j.z); j.o.rotation.set(-Math.PI / 2, 0, j.o.rotation.z); continue; }
    const v = j.v * (1 - u * .5), lat = Math.sin(u * 9 + j.ph) * .8, nx = j.x + (wx * v + wz * lat) * dt, nz = j.z + (wz * v - wx * lat) * dt;
    if (M.L.limites(nx, nz)) { j.x = nx; j.z = nz; } else j.t0 -= 400;   // (contre un mur : elle retombe)
    j.o.position.set(j.x, V.hSol(j.x, j.z) + .02 + Math.sin(Math.PI * Math.min(1, u * 1.15)) * j.h + Math.sin(u * 20 + j.ph) * .08, j.z);
    j.o.rotation.x += j.sp * dt; j.o.rotation.y += j.sp * .6 * dt; j.o.rotation.z += j.sp * .4 * dt; } }
// du sang au sol, en plus des flaques : des corps traînés (de longues traînées), et des pas ensanglantés qui s'éloignent en s'effaçant
function tracesSang(deb, L, base, hSol, libre) { if (!texTrainee.length || !libre.length) return; const y0 = (q) => q[2] ?? hSol(q[0], q[1]);
  const mT = texTrainee.map(t => matSang(t, { sec: true }));
  libre.slice(-(base === "etage" ? 12 : 10)).forEach((q, i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(3 + Math.random() * 1.6, .85 + Math.random() * .3), mT[i % 2]); m.rotation.set(-Math.PI / 2, 0, Math.random() * 7); m.position.set(q[0], y0(q) + .022 + i * .0003, q[1]); deb.add(m); });
  const mP = [.85, .6, .38].map(o => matSang(texPas, { sec: true, opacity: o }));
  libre.slice(-16, -12).forEach((q) => { let x = q[0], z = q[1]; const a = Math.random() * 7, dx = Math.sin(a), dz = Math.cos(a);
    for (let n = 0; n < 10; n++) { const c = n % 2 ? .12 : -.12, px = x + dz * c, pz = z - dx * c; if (!L.limites(px, pz)) { if (n) break; continue; }
      const m = new THREE.Mesh(new THREE.PlaneGeometry(.13, .27), mP[Math.min(2, n / 3.4 | 0)]); m.rotation.set(-Math.PI / 2, 0, a); m.position.set(px, (q[2] ?? hSol(px, pz)) + .023, pz); deb.add(m); x += dx * .62; z += dz * .62; } }); }
// les cachettes possibles du fumigène dans ce lieu (les mêmes chez tout le monde) ; le serveur a tiré laquelle
function candidatsFumi() {
  const L = M.L, base = baseLieu(M.lieu), Z = L.zone || [-20, 20, -20, 20], out = [];
  for (let k = 1; k < 20000 && out.length < 250; k++) { /* (beaucoup de cachettes possibles, partout : le serveur en tire une au hasard à chaque partie) */ const x = Z[0] + hasard(k * 5.3 + 777) * (Z[1] - Z[0]), z = Z[2] + hasard(k * 9.1 + 333) * (Z[3] - Z[2]);
    if (!L.limites(x, z) || (L.repos && L.repos(x, z)) || (L.feuxZ || []).some(([fx, fz, r]) => Math.hypot(x - fx, z - fz) < r + 1)) continue;
    if (base === "etage" && !(Math.abs(x) < ET.CX0 && z > -2.7 && z < -1.1)) continue;
    if (L.heliport && Math.hypot(x - L.heliport.x, z - L.heliport.z) < 9) continue;   // (pas sur le H, ni juste à côté)
    if (out.some(p => Math.hypot(p[0] - x, p[2] - z) < 2.5)) continue;
    const etg = base === "etage" ? Math.floor(hasard(k * 2.7 + 99) * (ET.N + 1)) : 0, y = base === "etage" ? etg * ET.H : (L.hauteur ? L.hauteur(x, z, { g: { position: { y: 0 } } }) : 0);
    if (base !== "etage" && Math.abs(y) > 1.2) continue;   // (au sol, là où l'on marche : ni dans la fosse, ni au sous-sol, ni sous la terre)
    out.push([x, y, z, etg]); }
  return out; }
// le fumigène, posé au sol : un tube rouge qui crache un filet de fumée rouge, une lueur rouge autour
function objetFumi(x, y, z) { const g = new THREE.Group(); g.position.set(x, y, z); M.scene.add(g);
  const c = new THREE.Mesh(new THREE.CylinderGeometry(.045, .045, .24, 12), new THREE.MeshStandardMaterial({ color: 0xc8102e, roughness: .5, emissive: 0x500000 })); c.rotation.z = Math.PI / 2; c.position.y = .05; g.add(c);
  const b = new THREE.Mesh(new THREE.CylinderGeometry(.047, .047, .05, 12), new THREE.MeshStandardMaterial({ color: 0x222222 })); b.rotation.z = Math.PI / 2; b.position.set(.13, .05, 0); g.add(b);
  const lueur = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.8), new THREE.MeshBasicMaterial({ map: texLueurRouge(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); lueur.rotation.x = -Math.PI / 2; lueur.position.y = .02; g.add(lueur);
  const fu = []; for (let i = 0; i < 12; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: texFumeeRouge(), transparent: true, depthWrite: false, fog: false })); g.add(sp); fu.push([sp, i / 12]); }   // (une colonne de fumée rouge, haute : on la voit de loin)
  g.userData.fu = fu; return g; }
// à chaque image, dans la caserne de l'apocalypse : le fumigène (posé, ramassé), le cercle rouge de la terrasse
function fumiApo(moi, now) {
  const F = M.fumi, L = M.L; if (!F) return;
  if (L.heliport) { const c = L.heliport, on = !!F.trouve; c.cercle.visible = on; if (on) { const k = .65 + .35 * Math.sin(now / 260); c.anneau.material.opacity = .9 * k; c.disque.material.opacity = .45 * k; c.faisceau.material.opacity = .1 * k; } }
  if (!F.trouve && F.lieu === M.lieu) {
    if (M.fumiL !== L) { M.fumiL = L; const C = M.lieu === "z-rue" ? [[FUMI_RUE[0], L.hauteur ? L.hauteur(FUMI_RUE[0], FUMI_RUE[1], { g: { position: { y: 0 } } }) : 0, FUMI_RUE[1], 0]] : candidatsFumi();   /* (dans la rue : là où la balise GPS le montre) */ M.fumiPos = C.length ? C[Math.min(C.length - 1, Math.floor(F.r * C.length))] : null; M.fumiObj = M.fumiPos ? objetFumi(M.fumiPos[0], M.fumiPos[1], M.fumiPos[2]) : null; }
    const o = M.fumiObj; if (o) { for (const [sp, d] of o.userData.fu) { const u = ((now / 4200) + d) % 1; sp.position.set(.18 + Math.sin(u * 5 + d * 9) * .3 * u, .12 + u * 7, 0); sp.scale.setScalar(.3 + u * 2.6); sp.material.opacity = .8 * (1 - u * .85); }
      const P = M.fumiPos; if (!APO.zombieFin && Math.hypot(moi.g.position.x - P[0], moi.g.position.z - P[2]) < .9 && (baseLieu(M.lieu) !== "etage" || etageDe(moi) === P[3]) && now > (M.fumiEnvoiT || 0)) { M.fumiEnvoiT = now + 3000; envoyerWS({ t: "z_fumi_pris" }); } } }
  else if (M.fumiObj) { M.scene.remove(M.fumiObj); M.fumiObj = null; }
  // le fumigène trouvé : un survivant sur le cercle rouge, et l'hélicoptère arrive
  if (F.trouve && L.heliport && !APO.zombieFin) { const c = L.heliport, p = moi.g.position;
    const surCercle = Math.hypot(p.x - c.x, p.z - c.z) < 1.6 && Math.abs(p.y - c.y) < 1;
    if (surCercle && !M.tyran && !M.tyranMort) lancerTyran(c);   // (le fumigène posé : le Tyran arrive ; il faut l'abattre avant que l'hélicoptère se pose)
    else if (M.tyranMort && !(M.tyran && M.tyran.mortT && now - M.tyran.mortT < 5000) && (surCercle || Math.hypot(p.x - c.x, p.z - c.z) < 12) && now > (M.fumiEnvoiT || 0)) {   /* (le Tyran à terre depuis cinq secondes — son corps reste là : alors l'hélicoptère descend) */ M.fumiEnvoiT = now + 3000; envoyerWS({ t: "z_fumi_fin" }); } }
}
/* l'arrivée à l'apocalypse : la caserne vue du ciel, les zombies qui errent dans la cour ; le logo RESIDENT EVIL s'abat à l'écran,
   puis la vue plonge vers la déchetterie, où les joueurs viennent d'arriver */
function introApo(moi) { if (!M.apoIntro || M.cine || M.lieu !== "z-grande" || !M.L.apo) return; M.apoIntro = false; M.apoIntroT = 0; cineIntroApo(moi); }
function cineIntroApo(moi) {
  const sc = M.scene, cam = M.camera, Z = M.L.zone || [-30, 30, -60, 10], cx = (Z[0] + Z[1]) / 2, cz = (Z[2] + Z[3]) / 2, p = moi.g.position;
  const brouillard = sc.fog ? [sc.fog.near, sc.fog.far] : null; if (sc.fog) { sc.fog.near = 40; sc.fog.far = 320; }
  const logo = document.createElement("img"); logo.src = "images/apo/re-logo.webp"; logo.alt = "Resident Evil";
  logo.style.cssText = "position:absolute;left:50%;top:42%;width:min(84%,620px);transform:translate(-50%,-50%) scale(1.6);opacity:0;z-index:9;pointer-events:none;filter:drop-shadow(0 6px 18px rgba(0,0,0,.85))";
  M.ctx.conteneur.appendChild(logo); const noir = voile("background:#000;opacity:1");
  const vise = new THREE.Vector3(cx, 0, cz), t0 = performance.now(); let fini = false, boum = false;
  M.calmeT = performance.now() + 9e5; M.reMus = false; const SX = preparerExplo(moi);   // (nos héros, derrière le portail de la voûte de l'horloge jaune : ils vont le faire sauter)
  placerCamera(true); cam.updateMatrixWorld(); let C = cam.position.clone(), Cv = C.clone().add(cam.getWorldDirection(new THREE.Vector3()).multiplyScalar(6));   // (là où la caméra du jeu reprendra)
  if (SX) { C = SX.W(1.8, SX.P.yb + 2.0, 6.2); Cv = SX.W(0, SX.P.yb + 1.3, 0); }   // (la vue plonge sur la petite place, face à la voûte)
  const A = new THREE.Vector3(cx + 24, 50, cz + 34), B = new THREE.Vector3(C.x, Math.max(48, C.y + 40), C.z);   /* (haut au-dessus de la cour, puis on glisse, au-dessus des toits, jusqu'à la verticale de la caméra du jeu,
     et on descend tout droit : on ne traverse plus les bâtiments) */
  let v0 = null, S2 = null, dtI = 0;
  const fin = () => { if (fini || !M) return; fini = true; M.reMus = true; { const e = equipierVivant(); if (e) e.g.visible = true; } logo.remove(); noir && noir.remove(); if (brouillard && sc.fog) { sc.fog.near = brouillard[0]; sc.fog.far = brouillard[1]; } finExplo(SX); finIntro2(S2);
    finCine(); placerCamera(true); M.survolT = performance.now() + 90000; M.survolN = 0; M.sepA = performance.now() + 1200; M.calmeT = performance.now() + 60000; };   /* (puis une minute de calme : aucun monstre ne nous attaque dès l'arrivée) */   // (puis : « séparons-nous »)
  M.passerBtn = boutonPasser(fin);
  let clk = 0, prec = t0;   // (l'horloge n'avance qu'avec les images : le chargement du lieu ne mange pas le début)
  M.cine = { t0, gel: true, nettoyer: () => { fini = true; logo.remove(); noir && noir.remove(); finExplo(SX); finIntro2(S2); }, maj: (now) => { if (fini) return; dtI = Math.min(200, Math.max(0, now - prec)) * (M.vite || 1) / 1000; clk += dtI * 1000; prec = now; const u = clk / 1000; M.cine.u = u;
    if (noir) noir.style.opacity = String(Math.max(0, 1 - u / 1.2));
    // le logo : il tombe d'un coup (un grand boum), reste, puis s'efface quand la vue plonge
    const a = Math.max(0, Math.min(1, (u - .9) / .35)), b = Math.max(0, Math.min(1, (u - 6.2) / .9));
    logo.style.opacity = String(a * (1 - b)); logo.style.transform = `translate(-50%,-50%) scale(${(1.6 - .6 * lisse(a)) * (1 + .05 * Math.max(0, u - 1.25) / 5)})`;
    if (u > 1.2 && !boum) { boum = true; sonBruit(2.4, 110, 1); voile("background:#5a0000;opacity:.35", 160); }
    if (u < 11.05) { const e = equipierVivant(); if (e) e.g.visible = false; }   /* (l'équipier n'existe qu'une fois le lieu prêt : on ne le voit pas traîner au fond avant l'explosion) */
    if (u < 6.5) { const k = lisse(u / 6.5); cam.position.lerpVectors(A, B, k); vise.set(cx + (p.x - cx) * k, p.y * k, cz + (p.z - cz) * k); }
    else if (u < 11) { if (!v0) v0 = vise.clone(); const k = lisse((u - 6.5) / 4.5); cam.position.lerpVectors(B, C, k); vise.lerpVectors(v0, Cv, Math.min(1, k * 1.4)); }
    else if (SX && !SX.fini) { if (majExplo(SX, u - 11, Math.min(.05, dtI))) { finExplo(SX); SX.uFin = u; } return; }
    else { if (!S2) S2 = preparerIntro2(moi); if (!S2 || majIntro2(S2, u - (SX ? SX.uFin - 11 : 0), Math.min(.05, dtI))) { fin(); return; } return; }
    cam.lookAt(vise); } };
}
/* l'arrivée, à l'apocalypse : nos deux héros font sauter le portail de fer, au bout de la voûte de l'horloge jaune ; une explosion, la fumée,
   ils entrent en roulade… et la voûte s'effondre derrière eux. Le portail reste à terre, sur les gravats (plus de retour possible) */
function portailSouffle(scene, L, k = 1) { const P = L.porcheHorloge; if (!P) return; P.gp.rotation.x = k * 1.47;
  if (!P.gravats) { const g = new THREE.Group(), m1 = new THREE.MeshStandardMaterial({ color: 0x55504a, roughness: .95 }), m2 = new THREE.MeshStandardMaterial({ color: 0x7a4a38, roughness: .9 });   // (des pierres, des briques)
    const ea = 2.7, eb = 2.1, ec = 1.5, zc = P.zg - .5, haut = (x, z) => { const q = 1 - (x / ea) ** 2 - ((z - zc) / ec) ** 2; return q > 0 ? eb * Math.sqrt(q) : 0; };   // (le tas : une butte, couverte de pierres et de briques)
    { const b = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), m1); b.scale.set(ea, eb, ec); b.position.set(0, P.yb, zc); b.receiveShadow = true; g.add(b); }
    for (let i = 0; i < (PETIT ? 26 : 56); i++) { const h = hasard(i * 3.7 + 1), h2 = hasard(i * 5.3 + 2), h3 = hasard(i * 1.9 + 3), a = h * Math.PI * 2, rr = Math.sqrt(h2) * .95, x = Math.cos(a) * rr * ea, z = zc + Math.sin(a) * rr * ec, r = .14 + h3 * .3;
      const o = new THREE.Mesh(i % 3 ? new THREE.DodecahedronGeometry(r, 0) : new THREE.BoxGeometry(r * 1.6, r * .8, r), i % 3 ? m1 : m2); o.position.set(x, P.yb + haut(x, z) - r * .25, z); o.rotation.set(h * 6, h2 * 6, h3 * 6); o.castShadow = true; g.add(o); }
    const brule = new THREE.Mesh(new THREE.CircleGeometry(2.3, 24), new THREE.MeshBasicMaterial({ color: 0x0b0806, transparent: true, opacity: .55, depthWrite: false })); brule.rotation.x = -Math.PI / 2; brule.position.set(0, P.yb + .025, P.zg + 1.6); g.add(brule);   // (le sol noirci)
    P.ga.add(g); P.gravats = g; }
  P.gravats.visible = k > 0; if (P.jour) P.jour.material.color.setHex(k > 0 ? 0x4a403a : 0xf2efe6); }   // (derrière, plus le jour : la fumée, la poussière)
// l'explosion : la boule de feu, l'éclair, les éclats, la fumée qui envahit la voûte
/* la boule de feu (Three.js, un petit programme de rendu) : une sphère qui bouillonne — bosselée par un bruit qui bouge —, blanc-jaune au cœur,
   orange, rouge sombre, puis fumée noire à mesure qu'elle refroidit en montant ; plusieurs bouffées, un peu décalées */
const BOULE_GLSL = `vec3 h3(vec3 p) { p = vec3(dot(p, vec3(127.1, 311.7, 74.7)), dot(p, vec3(269.5, 183.3, 246.1)), dot(p, vec3(113.5, 271.9, 124.6))); return fract(sin(p) * 43758.5453); }
  float bruit(vec3 p) { vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); float n = 0.0;
    n = mix(mix(mix(h3(i).x, h3(i + vec3(1,0,0)).x, f.x), mix(h3(i + vec3(0,1,0)).x, h3(i + vec3(1,1,0)).x, f.x), f.y), mix(mix(h3(i + vec3(0,0,1)).x, h3(i + vec3(1,0,1)).x, f.x), mix(h3(i + vec3(0,1,1)).x, h3(i + vec3(1,1,1)).x, f.x), f.y), f.z); return n; }
  float fbm(vec3 p) { return bruit(p) * .55 + bruit(p * 2.1) * .3 + bruit(p * 4.3) * .15; }`;
function bouleDeFeu(hdr, graine) { const m = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, fog: false,
    uniforms: { uT: { value: 0 }, uHdr: { value: hdr }, uG: { value: graine } },
    vertexShader: BOULE_GLSL + `uniform float uT, uG; varying float vN; varying vec3 vNor, vVue;
      void main() { float n = fbm(normal * 2.3 + vec3(0.0, -uT * 1.6, uG)); vN = n; vec3 p = position * (0.78 + 0.5 * n); vec4 mv = modelViewMatrix * vec4(p, 1.0); vNor = normalize(normalMatrix * normal); vVue = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform float uT, uHdr; varying float vN; varying vec3 vNor, vVue;
      void main() { float bord = clamp(dot(vNor, vVue), 0.0, 1.0); float chaud = clamp(1.25 - uT * 0.95 + (vN - 0.5) * 0.9 + bord * 0.35, 0.0, 1.0);
        vec3 fumee = vec3(0.05, 0.045, 0.04), rouge = vec3(0.9, 0.16, 0.03), orange = vec3(1.9, 0.75, 0.15), blanc = vec3(2.8, 2.3, 1.3);
        vec3 c = mix(fumee, rouge, smoothstep(0.12, 0.38, chaud)); c = mix(c, orange, smoothstep(0.38, 0.66, chaud)); c = mix(c, blanc, smoothstep(0.72, 0.95, chaud));
        c *= mix(1.0, uHdr, smoothstep(0.3, 0.9, chaud));
        float a = smoothstep(0.0, 0.25, bord + 0.15) * (1.0 - smoothstep(1.4, 2.6, uT)) * mix(0.35, 1.0, smoothstep(0.1, 0.5, chaud)); gl_FragColor = vec4(c, a); }` });
  return new THREE.Mesh(new THREE.IcosahedronGeometry(1, PETIT ? 3 : 4), m); }
const explosionPorche = P => explosionEn(P.ga, new THREE.Vector3(0, P.yb, P.zg + .4), new THREE.Vector3(0, 0, 1));
// (une explosion en c, soufflée vers dir : la boule de feu, l'éclair, les éclats, la fumée)
function explosionEn(ga, c, dir) { const g = new THREE.Group(); g.position.copy(c); g.rotation.y = Math.atan2(dir.x, dir.z); ga.add(g); const z0 = 0, y0 = 0;
  const feu = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffa040, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); feu.position.set(0, y0 + 1.6, z0); g.add(feu); feu.material.opacity = .5;   /* (l'éclair du tout début, sous les bouffées) */
  const lum = new THREE.PointLight(0xff8a3a, 60, 26, 1.6); lum.position.set(0, y0 + 2, z0 + 1); g.add(lum); const hdr = QUALITE !== "bas" ? 2.6 : 1;   /* (avec les effets d'image, la boule de feu est bien plus lumineuse que tout : elle rayonne) */
  const etinc = []; for (let i = 0; i < (PETIT ? 14 : 40); i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: texLueurRouge(), color: new THREE.Color(1.0, .75, .35).multiplyScalar(hdr * 1.4), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));   /* (les étincelles : des braises qui jaillissent et retombent) */
    sp.scale.setScalar(.12 + Math.random() * .12); sp.position.set((Math.random() - .5) * 1.2, y0 + 1 + Math.random() * 1.5, z0); g.add(sp); etinc.push({ sp, v: new THREE.Vector3((Math.random() - .5) * 9, 3 + Math.random() * 8, 2 + Math.random() * 10), t: .8 + Math.random() * 1.4 }); }
  const onde = new THREE.Mesh(new THREE.RingGeometry(.7, 1, 40), new THREE.MeshBasicMaterial({ color: new THREE.Color(1, .55, .2).multiplyScalar(hdr), transparent: true, opacity: .8, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false })); onde.rotation.x = -Math.PI / 2; onde.position.set(0, y0 + .06, z0 + .5); g.add(onde);   /* (le souffle, qui court au sol) */
  const boules = [[0, 1.5, 0, 0, 2.5], [-1.0, 1.1, .5, .07, 1.9], [1.1, 1.3, .3, .12, 1.8], [.2, 2.4, -.2, .2, 2.0]].slice(0, PETIT ? 2 : 4).map(([x, y, z, d, r], i) => { const b = bouleDeFeu(hdr, i * 7.3); b.position.set(x, y0 + y, z0 + z); b.scale.setScalar(.01); g.add(b); return { b, d, r, y }; });   /* (les bouffées de feu) */
  const eclats = []; for (let i = 0; i < (PETIT ? 10 : 22); i++) { const o = new THREE.Mesh(new THREE.BoxGeometry(.12 + Math.random() * .2, .06 + Math.random() * .1, .1 + Math.random() * .2), new THREE.MeshStandardMaterial({ color: i % 2 ? 0x1c1e20 : 0x5a4a40, roughness: .8 }));
    o.position.set((Math.random() - .5) * 2.5, y0 + .5 + Math.random() * 3, z0); g.add(o); eclats.push({ o, v: new THREE.Vector3((Math.random() - .5) * 7, 2 + Math.random() * 6, 5 + Math.random() * 9), r: new THREE.Vector3(Math.random() * 9, Math.random() * 9, 0) }); }
  const fum = []; for (let i = 0; i < (PETIT ? 12 : 26); i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: texFumee, transparent: true, depthWrite: false, opacity: 0 })); sp.position.set((Math.random() - .5) * 3, y0 + .4 + Math.random() * 3, z0); g.add(sp);
    fum.push({ sp, v: new THREE.Vector3((Math.random() - .5) * 1.6, .25 + Math.random() * .6, .3 + Math.random() * 1.5), d: Math.random() * .4, s: 1.2 + Math.random() * 1.3 }); }
  const S = { g, fini: false, maj: (u, dt) => { if (S.fini) return;
    const kf = Math.min(1, u / .3); feu.scale.set(.3 + 2.4 * Math.sqrt(kf), .3 + 1.9 * Math.sqrt(kf), .3 + 1.3 * Math.sqrt(kf)); feu.material.opacity = Math.max(0, .55 - u / .45); feu.visible = u < .25; feu.material.color.setHSL(.08 - .05 * Math.min(1, u), 1, .6 - .25 * Math.min(1, u)).multiplyScalar(hdr);
    for (const B of boules) { const v = u - B.d; B.b.visible = v > 0 && v < 2.6; if (!B.b.visible) continue; const k = Math.min(1, v / .3); B.b.scale.setScalar(.2 + B.r * (Math.sqrt(k) * .85 + Math.min(.45, v * .18))); B.b.position.y = y0 + B.y + v * .55; B.b.material.uniforms.uT.value = v; B.b.rotation.y += dt * .4; }
    for (const e of etinc) { const k = u / e.t; e.sp.visible = k < 1; if (k >= 1) continue; e.v.y -= 9.8 * dt; e.sp.position.addScaledVector(e.v, dt); e.sp.material.opacity = 1 - k * k; }
    { const k = Math.min(1, u / .55); onde.scale.setScalar(.5 + k * 9); onde.material.opacity = .8 * (1 - k); onde.visible = k < 1; }
    lum.intensity = Math.max(0, 60 * (1 - u / 1.1)) + (u > .15 && u < 2.4 ? 10 * (1 - u / 2.4) * (.7 + .3 * Math.sin(u * 40)) : 0); lum.visible = u < 2.4;   /* (l'éclair, puis la lueur du brasier qui retombe) */
    for (const e of eclats) { if (e.o.position.y <= y0 + .05) continue; e.v.y -= 9.8 * dt; e.o.position.addScaledVector(e.v, dt); e.o.rotation.x += e.r.x * dt; e.o.rotation.y += e.r.y * dt; if (e.o.position.y <= y0 + .05) { e.o.position.y = y0 + .05; } }
    for (const f of fum) { const v = u - f.d; if (v < 0) continue; f.sp.position.addScaledVector(f.v, dt * Math.max(.15, 1 - v / 4)); const s = f.s * (1 + v * .9); f.sp.scale.set(s, s, 1); f.sp.material.opacity = Math.min(.5, v * 2) * Math.max(0, 1 - v / 8); const chaud = Math.max(0, 1 - v / 1.4); f.sp.material.color.setRGB(1 + chaud * 1.6, 1 + chaud * .3, 1 - chaud * .5); }   /* (la fumée, d'abord éclairée par le feu, orange, puis grise) */   // (assez pour qu'ils en jaillissent, pas au point de tout cacher)
    if (u > 10) S.nettoyer(); }, nettoyer: () => { if (S.fini) return; S.fini = true; ga.remove(g); g.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material && o.material.map !== texFumee) o.material.dispose(); }); } };
  return S; }
// la scène : la voûte vue de l'intérieur ; « charge posée » ; boum ; ils roulent sous la fumée, se relèvent ; derrière eux, la voûte s'écroule ; ils sortent sur la place
function preparerExplo(moi) { const L = M.L, P = L.porcheHorloge; if (!P) return null; const eq = equipierVivant(), gens = [moi, eq].filter(Boolean);
  const W = (x, y, z) => P.ga.localToWorld(new THREE.Vector3(x, y, z)); P.ga.updateMatrixWorld(true); portailSouffle(M.scene, L, 0);
  const depart = [[-.6, P.zg - 1.2], [.75, P.zg - 1.2]], roule = [[-.6, P.zg + 2.3], [.8, P.zg + 2.6]], place = [[-.6, 2.2], [.9, 2.4]];
  gens.forEach((q, i) => { const w = W(depart[i][0], 0, depart[i][1]); q.g.position.set(w.x, P.yb, w.z); q.cible = null; q.chemin = []; q.g.visible = false; });
  return { P, W, eq, gens, depart, roule, place, dit: 0, caches: new Set(), yaw: Math.atan2(W(0, 0, 1).x - W(0, 0, 0).x, W(0, 0, 1).z - W(0, 0, 0).z) }; }
function finExplo(S) { if (!S || S.fini) return; S.fini = true; if (S.fx) S.fx.nettoyer(); portailSouffle(M.scene, M.L, 1); for (const z of S.caches) z.g.visible = true;
  S.gens.forEach((q, i) => { const w = S.W(S.place[i][0], 0, S.place[i][1]); q.g.position.set(w.x, M.L.hauteur ? M.L.hauteur(w.x, w.z, q) : S.P.yb, w.z); q.g.visible = true; q.roulade = null; q.cible = null; q.chemin = []; });
  envoyerWS({ t: "aller", x: S.gens[0].g.position.x, z: S.gens[0].g.position.z }); M.yaw = S.yaw + Math.PI; }
function majExplo(S, t, dt) { const cam = M.camera, P = S.P, W = S.W, now = performance.now(), yb = P.yb;
  cacherAutour(W(0, 0, -2), 16, S.caches); if (!S.eq) { S.eq = equipierVivant(); if (S.eq) S.gens.push(S.eq); }   // (l'équipier : il n'existe qu'une fois le lieu prêt)
  if (t > 1.4 && !S.boum) { S.boum = true; M.reMus = true; S.fx = explosionPorche(P); sonPos("sons/re-dynamite.mp3", 1); sonBruit(3.8, 60, .5); voile("background:#ffd8a0;opacity:.75", 140); setTimeout(() => M && voile("background:#ff7a20;opacity:.25", 260), 140); }
  if (S.fx) S.fx.maj(t - 1.4, dt);
  // le portail : il s'arrache et s'abat dans la voûte
  if (S.boum) { const k = Math.min(1, (t - 1.4) / .5); portailSouffle(M.scene, M.L, k < 1 ? k * k * 1.03 : 1); }
  // eux deux : cachés derrière le portail, puis en roulade sous la fumée, puis debout, puis vers la place
  S.gens.forEach((q, i) => { const t0 = 2.05 + i * .35, ms = 1000, a = S.depart[i], b = S.roule[i], c = S.place[i]; let x, z;
    if (t < t0) { x = a[0]; z = a[1]; q.g.visible = false; }
    else if (t < t0 + ms / 1000) { const k = (t - t0) / (ms / 1000); x = a[0] + (b[0] - a[0]) * k; z = a[1] + (b[1] - a[1]) * k; q.g.visible = true; q.roulade = { k }; }
    else if (q.roulade) q.roulade = null;
    else if (t < 12.6) { x = b[0]; z = b[1]; q.g.visible = true; }
    else { const k = Math.min(1, (t - 12.6) / 3.6); x = b[0] + (c[0] - b[0]) * k; z = b[1] + (c[1] - b[1]) * k; q.g.visible = true; }
    const w = W(x, 0, z); q.g.position.set(w.x, yb, w.z); q.cible = null; q.chemin = [];
    if (q.av3 && !q.roulade) { let ry = S.yaw; if (t > 8.6 && t < 12.6) ry = S.yaw + Math.PI * (i ? .85 : 1.1); else if (t > 3.6 && t < 8.6) ry = S.yaw + (i ? -.5 : .4); q.av3.sc.rotation.y = ry; } });   // (ils regardent autour d'eux ; puis derrière, la voûte effondrée)
  // la caméra
  const shake = S.boum ? Math.max(0, 1 - (t - 1.4) / 1.4) * .12 : 0, sx = (Math.random() - .5) * shake, sy = (Math.random() - .5) * shake;
  let c, v; if (t < 1.9) { c = W(1.25 + sx, yb + 1.45 + sy, -1.3); v = W(0, yb + 1.9, P.zg); }   // (dans la voûte, face au portail)
  else if (t < 3.8) { c = W(-1.6 + sx, yb + .7 + sy, P.zg + 6.9); v = W(.2, yb + .75, P.zg + 1.8); }   // (au ras du sol : ils jaillissent de la fumée)
  else if (t < 12.6) { const m = t < 8.6 ? 0 : Math.min(1, (t - 8.6) / 1.5); c = W(1.1 - .2 * m, yb + 1.55, P.zg + 6 - .8 * m); v = W(0, yb + 1.35 + .2 * m, P.zg + 2.2 - 1.6 * m); }   // (de face ; puis vers les gravats, derrière eux)
  else { c = W(1.8, yb + 2.0, 6.2); v = W(0, yb + 1.3, 0); }   // (depuis la place : ils sortent de la voûte)
  cam.position.copy(c); cam.lookAt(v);
  const autre = S.eq ? S.eq.info.numero : M.moiNum, L5 = [[.25, M.moiNum, "Charge posée… À couvert !"], [4.0, M.moiNum, "Ça, c'est ce que j'appelle frapper à la porte."],
    [6.6, autre, "Avec un boucan pareil, tous les morts du quartier savent qu'on est là."], [9.4, M.moiNum, "Et la voûte s'est effondrée derrière nous… Plus de retour possible."], [12.4, autre, "Alors on trouve un autre moyen de sortir d'ici. Allons-y."]];
  while (S.dit < L5.length && t > L5[S.dit][0]) { dire(L5[S.dit][1], L5[S.dit][2]); S.dit++; }
  if (t > 6.6 && t < 6.7 && !S.gronde) { S.gronde = true; sonBruit(1.6, 90, .7); }
  return t > 16.4; }
/* ===================== Resident Evil : l'histoire =====================
   Arrivés par la voûte de l'horloge jaune, l'hélicoptère passe sans les voir. On propose de se séparer pour couvrir plus de terrain ; l'équipier s'en va.
   Brad Vickers, le pilote, appelle à la radio : il a largué un fumigène avec une balise GPS, tombé dans la rue du Faubourg-Poissonnière (le bouton GPS montre où).
   Mais le porche qui mène à la rue est bouché par des gravats : il faut de quoi les faire sauter. Le C4 est dans la salle des fêtes ; juste avant d'y entrer,
   l'équipier nous rejoint, on entre ensemble (Lisa Trevor l'assomme). Le C4 trouvé, on le pose sur les gravats du porche : explosion ; la rue, le fumigène */
const PORTES_FETES = [[15.3, 9.12], [9.81, 6.49]];   // (dans la grande cour : les deux portes de la salle des fêtes — par le vestibule, par la cour)
/* l'appel radio : l'écran de la radio s'ouvre — à gauche, celui qui appelle (Brad), à droite, nous ; au milieu, la fréquence et le signal ;
   dessous, ce qui se dit. Les portraits en vert, comme sur un vieil écran ; celui qui parle s'éclaire. L'écran se referme seul quand on ne parle plus */
/* la sonnerie de l'appel radio : deux fois « bip-bip », aigu et clair, puis le grésillement de la liaison */
const nomEquipier = () => { const e = (M.equipe || []).find(q => !q.mort); return e && HEROS[e.id] ? HEROS[e.id].court : "Ton équipier"; };
// les gravats du porche (dans la grande cour) : une butte de pierres et de poutres, qui bouche le passage vers la rue
function gravatsPorche(scene, L) { if (L.gravatsPorche) return; const g = new THREE.Group(), m1 = new THREE.MeshStandardMaterial({ color: 0x5a554e, roughness: .95 }), m2 = new THREE.MeshStandardMaterial({ color: 0x7a4a38, roughness: .9 }), bois = new THREE.MeshStandardMaterial({ color: 0x4a3524, roughness: .9 });
  const ea = 2.6, eb = 3.0, ec = 1.5, zc = 27.6, haut = (x, z) => { const q = 1 - (x / ea) ** 2 - ((z - zc) / ec) ** 2; return q > 0 ? eb * Math.sqrt(q) : 0; };
  { const b = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), m1); b.scale.set(ea, eb, ec); b.position.set(0, 0, zc); b.receiveShadow = true; g.add(b); }
  for (let i = 0; i < (PETIT ? 24 : 48); i++) { const h = hasard(i * 4.1 + 5), h2 = hasard(i * 6.7 + 1), h3 = hasard(i * 2.3 + 9), a = h * Math.PI * 2, rr = Math.sqrt(h2) * .95, x = Math.cos(a) * rr * ea, z = zc + Math.sin(a) * rr * ec, r = .14 + h3 * .3;
    const o = new THREE.Mesh(i % 3 ? new THREE.DodecahedronGeometry(r, 0) : new THREE.BoxGeometry(r * 1.6, r * .8, r), i % 3 ? m1 : m2); o.position.set(x, haut(x, z) - r * .25, z); o.rotation.set(h * 6, h2 * 6, h3 * 6); o.castShadow = true; g.add(o); }
  for (const [x, y, z, ry, rz] of [[-.6, 1.6, 27.0, .4, .5], [.8, 1.3, 27.9, -.7, -.35], [0, 2.5, 27.5, 1.2, .15], [-.3, 3.0, 28.2, .1, -.6]]) { const p = new THREE.Mesh(new THREE.BoxGeometry(3.2, .2, .22), bois); p.position.set(x, y, z); p.rotation.set(0, ry, rz); p.castShadow = true; g.add(p); }   // (des poutres tombées de la voûte)
  scene.add(g); L.gravatsPorche = g; for (const o of g.children) o.userData.repos = [o.position.clone(), o.rotation.clone(), o.scale.clone()];   /* (pour remettre le tas en place à la partie suivante) */
  if (!L.limPorche) { const lim0 = L.limites; L.limPorche = true; L.limites = (x, z) => lim0(x, z) && (!!(M && M.porcheOuvert) || !(z > PORCHE_Z && Math.abs(x) < 2.8)); } }
// le pain de C4 : un bloc vert olive, ruban noir, un petit minuteur à la diode rouge
function objetC4(diode = false) { const g = new THREE.Group(), pain = new THREE.MeshStandardMaterial({ color: 0x6b6a3e, roughness: .8 }), noir = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: .6 });
  const b = new THREE.Mesh(new THREE.BoxGeometry(.3, .09, .16), pain); b.position.y = .045; g.add(b);
  for (const x of [-.09, .09]) { const r = new THREE.Mesh(new THREE.BoxGeometry(.03, .095, .165), noir); r.position.set(x, .046, 0); g.add(r); }
  const t = new THREE.Mesh(new THREE.BoxGeometry(.09, .03, .07), noir); t.position.set(0, .105, 0); g.add(t);
  const led = new THREE.Mesh(new THREE.SphereGeometry(.012, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff2010 })); led.position.set(.025, .125, .02); g.add(led); g.userData.led = led; led.visible = diode;
  return g; }
/* le GPS, à la manière du menu de Resident Evil : le grand écran (la carte, ou l'objet choisi), MAP · FILE · RADIO · EXIT, l'inventaire (les armes qu'on porte),
   le portrait du héros, l'ECG (l'état de santé du moment : Fine, Caution, Danger) et l'arme équipée ; en bas, le nom de ce qu'on regarde */
// sous la vie : le bouton GPS (dès l'appel de Brad, tant que le fumigène n'est pas ramassé), et le C4 qu'on porte
// une petite scène : la caméra immobile (là où elle est), le temps qu'on se parle ; on ne peut pas être mordu pendant ce temps
function sceneParlee(lignes, finir, opts = {}) { const t0 = performance.now(); let fini = false, dit = 0, clk = 0, prec = t0; const moi = moiApo(), caches = new Set();   /* (les monstres tout près de nous s'effacent le temps de la scène) */
  const fin = () => { if (fini || !M) return; fini = true; for (const z of caches) if (!z.mortT) z.g.visible = true; finCine(); placerCamera(true); finir && finir(); };
  M.passerBtn = boutonPasser(fin);
  M.cine = { t0, gel: true, nettoyer: () => { fini = true; }, maj: (now) => { if (fini) return; clk += Math.min(200, Math.max(0, now - prec)) * (M.vite || 1) / 1000; prec = now; const u = clk; M.cine.u = u;
    if (moi) { moi.cible = null; moi.chemin = []; cacherAutour(moi.g.position, 4.5, caches); } if (opts.maj) opts.maj(u, now);
    while (dit < lignes.length && u > lignes[dit][0]) { const [, qui, txt] = lignes[dit]; if (typeof qui === "function") qui(); else if (typeof qui === "string") parleRadio(qui, txt); else if (qui === M.moiNum && codecOuvert()) codecDire("moi", nomApo(), txt); else if (M.gens.get(qui)) dire(qui, txt); dit++; }
    if (u > (opts.duree || (lignes.length ? lignes[lignes.length - 1][0] + 3.4 : 1))) fin(); } }; }
// 1. on se sépare (juste après le passage de l'hélicoptère, au début)
function cineSeparation() { const moi = moiApo(), eq = equipierVivant(); M.sepFait = true; if (!moi) return;
  if (!eq) { M.separe = true; M.bradT = performance.now() + 15000; return; }
  const nom = nomApo(), mp = moi.g.position.clone(), dir = dirDegagee(mp), cote = new THREE.Vector3(dir.z, 0, -dir.x), ep0 = eq.g.position.clone(); let part = null;
  const cam = mp.clone().addScaledVector(dir, 3.2).addScaledVector(cote, 1.4); cam.y = mp.y + 1.7; const vise = mp.clone().lerp(ep0, .5).setY(mp.y + 1.3);
  eq.cineRE = true;
  sceneParlee([[.6, M.moiNum, "Écoute… À deux, on n'avancera pas assez vite. Séparons-nous : on couvrira plus de terrain."], [4.2, eq.info.numero, "Se séparer ? Avec tout ce qui rôde dans le coin ?"],
    [7.4, M.moiNum, "On garde le contact par radio. Le premier qui trouve un moyen de sortir prévient l'autre."], [11, eq.info.numero, `D'accord… Fais attention à toi, ${nom}.`], [13.2, () => { part = performance.now(); }, ""]],
    () => { M.separe = true; M.bradT = performance.now() + 22000; const q = equipierVivant(); if (q) { q.cineRE = false; } },
    { duree: 19.5, maj: (u, now) => { if (eq.sepCam) { M.camera.position.copy(eq.sepCam); M.camera.lookAt(eq.g.position.x, eq.g.position.y + 1.2, eq.g.position.z); } else { M.camera.position.copy(cam); M.camera.lookAt(vise); }
      if (moi.av3) moi.av3.sc.rotation.y = Math.atan2(eq.g.position.x - mp.x, eq.g.position.z - mp.z);
      if (part) {   /* (il part vers la caserne, en marchant ; une fois sorti du champ de la caméra, on ne le voit plus) */
        if (!eq.sepVise) { eq.sepVise = true; eq.sepBtn = M.passerBtn; for (const c of CASERNE_SEP) { const [tx, tz] = viserLibre(...c); viser(eq, tx, tz); if (eq.cible || (eq.chemin && eq.chemin.length)) break; }
          const c1 = eq.cible || ep0, dv = new THREE.Vector3(c1.x - mp.x, 0, c1.z - mp.z); if (dv.lengthSq() < .01) dv.copy(dir).negate(); dv.normalize();
          eq.sepCam = mp.clone().addScaledVector(dv, -2.8).addScaledVector(new THREE.Vector3(dv.z, 0, -dv.x), .7); eq.sepCam.y = mp.y + 1.8;
          eq.sepChemin = [eq.cible, ...(eq.chemin || [])].filter(Boolean); eq.cible = null; eq.chemin = []; eq.sepPrec = now; }
        { const dt = Math.min(.1, (now - eq.sepPrec) / 1000), c = eq.sepChemin[0]; eq.sepPrec = now;   /* (il marche lui-même le long du chemin : la cinématique fige les autres) */
          if (c) { const dx = c.x - eq.g.position.x, dz = c.z - eq.g.position.z, d = Math.hypot(dx, dz), pas = 1.45 * dt; if (d <= pas) { eq.g.position.x = c.x; eq.g.position.z = c.z; eq.sepChemin.shift(); } else { eq.g.position.x += dx / d * pas; eq.g.position.z += dz / d * pas; }
            if (eq.av3 && d > .01) eq.av3.sc.rotation.y = Math.atan2(dx, dz); } }   /* (la caméra passe derrière nous : on le regarde s'éloigner) */
        M.camera.updateMatrixWorld(); const v = eq.g.position.clone().setY(eq.g.position.y + 1).project(M.camera), dehorsChamp = v.z > 1 || Math.abs(v.x) > 1.02 || Math.abs(v.y) > 1.02 || eq.g.position.distanceTo(mp) > 16;
        eq.horsT = dehorsChamp ? (eq.horsT || now) : 0; if (eq.horsT && now - eq.horsT > 300 && now - part > 800) eq.g.visible = false; if (!eq.g.visible && now - part > 1500 && !eq.sepFin) { eq.sepFin = true; setTimeout(() => M && eq.sepBtn && eq.sepBtn.isConnected && eq.sepBtn.click(), 600); } }   /* (parti : la scène se termine) */
      else if (eq.av3) eq.av3.sc.rotation.y = Math.atan2(mp.x - eq.g.position.x, mp.z - eq.g.position.z); } }); }
const CASERNE_SEP = [[0, -100], [0, -60], [10, -112], [-8, -120], [12, -124], [4, -128]];   /* (vers la cour d'honneur et les bâtiments de la caserne : le premier point où l'on peut aller) */
// 2. Brad Vickers, à la radio : le fumigène, la balise GPS, la rue du Faubourg-Poissonnière
function cineRadioBrad() { const moi = moiApo(); if (!moi) return; M.bradEnCours = true; const nom = nomApo(), eqNom = nomEquipier(), eq = equipierVivant();
  sceneParlee([[.4, "Brad Vickers", "… Ici Brad Vickers, à toutes les unités du S.T.A.R.S… Vous me recevez ?"], [4.4, M.moiNum, `Brad ! Ici ${nom}. On est coincés dans la caserne !`],
    [7.6, "Brad Vickers", "Je ne vous vois pas… Impossible de me poser : ces choses sont partout."], [11.4, "Brad Vickers", "J'ai balancé un fumigène avec une balise. Utilisez votre GPS pour le trouver."],
    [16.2, "Brad Vickers", "Allumez-le au centre du H, sur la terrasse : je viendrai vous chercher. Brad, terminé."], [20.4, () => { M.gps = true; majBoutonsRE(); sonBruit(.08, 4000, .25); }, ""],
    [20.6, M.moiNum, "Bien reçu, Brad. Je vais chercher ce fumigène."], ...(eq ? [] : [[24, eqNom, `${nom}, j'ai tout entendu. Je fouille encore de mon côté… on se retrouve vite.`]])],
    () => { M.gps = true; M.bradEnCours = false; majBoutonsRE(); }, { duree: eq ? 24 : 28 }); }
// 3. les retrouvailles, juste avant la salle des fêtes : il nous rejoint en courant ; le C4, c'est là-dedans
function cineRetrouvailles() { const moi = moiApo(); M.separe = false; M.retrouve = true; if (!moi) return; const k = (M.equipe || []).findIndex(e => !e.mort); if (k < 0) return;
  const e = M.equipe[k], num = EQUIPIER(k), mp = moi.g.position.clone(), dir = dirDegagee(mp); let a0 = null;
  for (const r of [8, 6.5, 5, 3.5]) for (const s of [1, -1]) { const v = dir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), s * .5), x = mp.x + v.x * r, z = mp.z + v.z * r; if (!a0 && M.L.limites(x, z)) a0 = [x, z]; }
  if (!a0) a0 = [mp.x + dir.x * 2, mp.z + dir.z * 2]; retirerAncien(num); const p = ajouterAncien(infoEquipier(e.id, num, a0[0], a0[1], M.moiNum, k)); if (!p) return; p.cineRE = true; p.g.position.y = mp.y;
  const but = [mp.x + dir.x * 1.2 + dir.z * .9, mp.z + dir.z * 1.2 - dir.x * .9], cam = mp.clone().addScaledVector(new THREE.Vector3(dir.z, 0, -dir.x), 3.4).addScaledVector(dir, .6); cam.y = mp.y + 1.7; const nom = nomApo();
  sceneParlee([[.3, num, `${nom} ! Attends-moi !`], [3.2, M.moiNum, "Te voilà ! Tu as trouvé quelque chose ?"], [6.2, num, "Rien de mon côté… Mais j'ai entendu Brad. Et le porche est bouché : j'ai vu les gravats."],
    [10.6, num, "Les démolisseurs avaient stocké du C4 dans la salle des fêtes. Avec ça, on dégage le passage."], [14.6, M.moiNum, "Alors on y va. Ensemble, cette fois."]],
    () => { const q = M.gens.get(num); if (q) { q.cineRE = false; q.cible = null; q.chemin = []; } },
    { maj: (u) => { const k2 = Math.min(1, u / 2.6), x = a0[0] + (but[0] - a0[0]) * k2, z = a0[1] + (but[1] - a0[1]) * k2; p.g.position.x = x; p.g.position.z = z; p.cible = null; p.chemin = [];
      const v = new THREE.Vector3((mp.x + x) / 2, mp.y + 1.25, (mp.z + z) / 2); M.camera.position.copy(cam); M.camera.lookAt(v);
      if (moi.av3) moi.av3.sc.rotation.y = Math.atan2(x - mp.x, z - mp.z); if (p.av3 && k2 >= 1) p.av3.sc.rotation.y = Math.atan2(mp.x - x, mp.z - z); } }); }
/* l'explosion du C4 : les pierres, les briques et les poutres du tas sont projetées vers la cour, rebondissent, et restent éparpillées dans le passage ; la butte s'affaisse */
function volGravats(L) { const G = L.gravatsPorche; if (!G) return null; L.gravatsSouffles = true; const items = G.children.map((o, i) => i === 0 ? { o, butte: true }
    : { o, v: new THREE.Vector3((Math.random() - .5) * 5, 2 + Math.random() * 4.5, -(1.2 + Math.random() * 4.5)), w: new THREE.Vector3((Math.random() - .5) * 12, (Math.random() - .5) * 12, (Math.random() - .5) * 12), r: (q => q.width ? Math.min(q.width, q.height, q.depth) / 2 : (q.radius || .2) * .75)(o.geometry.parameters || {}), pose: false });   /* (r : la demi-épaisseur, pour qu'il repose à plat sur le sol) */
  let t = 0;
  return dt => { const fin = dt >= 99; t += fin ? 9 : dt;
    for (const it of items) { const o = it.o; if (it.butte) { const k = Math.min(1, t / .45); o.scale.y = o.userData.repos[2].y * (1 - .78 * k); continue; }
      if (it.pose) continue; const sol = .02 + it.r * Math.min(o.scale.x, o.scale.y, o.scale.z);
      if (fin) { o.position.y = sol; o.position.z = Math.max(14, o.position.z + it.v.z * .35); o.position.x = Math.max(-1.9, Math.min(1.9, o.position.x + it.v.x * .2)); it.pose = true; continue; }
      it.v.y -= 9.8 * dt; o.position.addScaledVector(it.v, dt); o.rotation.x += it.w.x * dt; o.rotation.y += it.w.y * dt; o.rotation.z += it.w.z * dt;
      if (Math.abs(o.position.x) > 2.1) { o.position.x = Math.sign(o.position.x) * 2.1; it.v.x *= -.4; }   /* (les murs du passage) */
      if (o.position.y <= sol) { o.position.y = sol; if (Math.abs(it.v.y) < 1.2) { it.pose = true; continue; } it.v.y *= -.32; it.v.x *= .6; it.v.z *= .6; it.w.multiplyScalar(.5); } } }; }
// 4. le C4, posé sur les gravats du porche : à couvert… et boum
function cinePoseC4() { const moi = moiApo(); if (!moi) return; M.c4Pose = true; majBoutonsRE(); const eq = equipierVivant(), gens = [moi, eq].filter(Boolean), L = M.L;
  const c4 = objetC4(true); c4.position.set(.2, .35, 26.35); c4.rotation.set(-.35, .3, 0); M.scene.add(c4);
  const dep = gens.map(q => q.g.position.clone()), poseA = [[0, 25.1], [1.2, 24.6]], abri = [[-.6, 15.6], [1.1, 16.2]]; let fx = null, boum = false, prec = 0, vol = null;
  for (const q of gens) q.cineRE = true;
  sceneParlee([[.3, M.moiNum, "Je pose la charge…"], [2.6, M.moiNum, "C'est armé ! À couvert !"], [2.6, () => sonPos("sons/re-minuterie.mp3", .9), ""], [5.6, () => { boum = true; }, ""], ...(eq ? [[8.2, eq.info.numero, "Voilà qui est fait ! La rue est à nous."]] : []), [eq ? 10.8 : 8.6, M.moiNum, "Le fumigène ne doit pas être loin. Allons-y !"]],
    () => { if (fx) fx.nettoyer(); M.scene.remove(c4); for (const q of gens) q.cineRE = false; if (!M.porcheOuvert) { M.porcheOuvert = true; vol = volGravats(L); } if (vol) vol(99); },
    { duree: eq ? 13.6 : 11.4, maj: (u, now) => { const dt = prec ? Math.min(.05, (now - prec) / 1000) : 0; prec = now;
      gens.forEach((q, i) => { const a = dep[i], b = poseA[i], c = abri[i]; let x, z; if (u < 1.2) { const k = u / 1.2; x = a.x + (b[0] - a.x) * k; z = a.z + (b[1] - a.z) * k; } else if (u < 2.9) { x = b[0]; z = b[1]; } else { const k = Math.min(1, (u - 2.9) / 2.2); x = b[0] + (c[0] - b[0]) * k; z = b[1] + (c[1] - b[1]) * k; }
        q.g.position.x = x; q.g.position.z = z; q.cible = null; q.chemin = []; if (q.av3 && (u < 2.9 || u > 5.1)) q.av3.sc.rotation.y = 0; });
      c4.userData.led.visible = Math.floor(now / (u > 3 ? 160 : 450)) % 2 === 0;
      if (boum && !fx) { fx = explosionEn(M.scene, new THREE.Vector3(0, 0, 27.2), new THREE.Vector3(0, 0, -1)); sonPos("sons/re-dynamite.mp3", 1); sonBruit(3.8, 60, .5); voile("background:#ffd8a0;opacity:.7", 140); M.scene.remove(c4); M.porcheOuvert = true;
        vol = volGravats(L); if (L.ajouterFeu && !(L.feuxC4 || []).length) L.feuxC4 = [L.ajouterFeu(-1.3, 0, 25.4, .8), L.ajouterFeu(1.5, 0, 26.9, .62)]; else for (const f of L.feuxC4 || []) f.visible = true; }   /* (les gravats sont projetés ; deux petits feux restent) */
      if (vol) vol(dt);
      if (fx) fx.maj(u - 5.6, dt);
      const sh = fx ? Math.max(0, 1 - (u - 5.6) / 1.3) * .14 : 0; M.camera.position.set(1.3 + (Math.random() - .5) * sh, 1.8 + (Math.random() - .5) * sh, 12.6); M.camera.lookAt(0, 1.3, u < 5.4 ? 24 : 27);   /* (dans l'axe du porche, derrière eux) */ } }); }
/* la pluie, dehors, à Resident Evil (comme la nuit de Raccoon City) : des milliers de gouttes, calculées par la carte graphique (elles tombent, et se répètent
   tout autour de la caméra) ; le bruit de la pluie, doux, fabriqué à la volée */
function pluieRE(now) { const L = M.L; if (!L) return; const dehors = !!(L.apo && !L.sh && !L.interieur && estApo(M.lieu));
  if (!L.pluie && dehors) { const N = MOBILE ? (PETIT ? 600 : 1100) : QUALITE === "haut" ? 3200 : QUALITE === "moyen" ? 1800 : 800, p = new Float32Array(N * 6), bout = new Float32Array(N * 2);
    for (let i = 0; i < N; i++) { const x = Math.random(), y = Math.random(), z = Math.random(); p.set([x, y, z, x, y, z], i * 6); bout[i * 2] = 0; bout[i * 2 + 1] = 1; }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(p, 3)); g.setAttribute("bout", new THREE.BufferAttribute(bout, 1));
    const m = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, fog: false, uniforms: { uT: { value: 0 }, uCam: { value: new THREE.Vector3() } },
      vertexShader: `attribute float bout; uniform float uT; uniform vec3 uCam; varying float vB;
        void main() { const vec3 B = vec3(34.0, 16.0, 34.0); vec3 q = position * B; float y = mod(q.y - uT * 11.0, B.y);
          vec3 w = vec3(mod(q.x - uCam.x, B.x) + uCam.x - B.x * .5, y + uCam.y - B.y * .4, mod(q.z - uCam.z, B.z) + uCam.z - B.z * .5);
          w += vec3(.06, .55, .02) * bout; vB = bout; gl_Position = projectionMatrix * viewMatrix * vec4(w, 1.0); }`,
      fragmentShader: `varying float vB; void main() { gl_FragColor = vec4(.68, .74, .82, .32 * (1.0 - vB * .7)); }` });
    L.pluie = new THREE.LineSegments(g, m); L.pluie.frustumCulled = false; L.pluie.renderOrder = 5; M.scene.add(L.pluie); }
  if (L.pluie) { L.pluie.visible = dehors && !(M.allege >= 2); L.pluie.material.uniforms.uT.value = (now % 600000) / 1000; L.pluie.material.uniforms.uCam.value.copy(M.camera.position); }
  // le son : un bruit blanc adouci, en boucle ; plus faible à l'abri
  const vol = !estApo(M.lieu) || !(L.apo && !L.sh) ? 0 : dehors ? .035 : .01;   /* (discrète : la musique passe devant) */
  if (vol && !M.sonPluie) { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); const n = actx.sampleRate * 2, b = actx.createBuffer(1, n, actx.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      const src = actx.createBufferSource(); src.buffer = b; src.loop = true; const lp = actx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2600; const hp = actx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 350; const gn = actx.createGain(); gn.gain.value = 0;
      src.connect(hp).connect(lp).connect(gn).connect(actx.destination); src.start(); M.sonPluie = { src, gn }; } catch (e) { M.sonPluie = { gn: null }; } }
  if (M.sonPluie && M.sonPluie.gn) { const g = M.sonPluie.gn.gain; g.value += (vol - g.value) * .05; if (!vol && g.value < .002) { try { M.sonPluie.src.stop(); } catch (e) {} M.sonPluie = null; } } }
/* les sursauts (une fois par partie, chacun) : un zombie qui passe à travers une fenêtre du rez-de-chaussée, dans une pluie d'éclats de verre ;
   une nuée de corbeaux qui s'envole d'un coup, en croassant, quand on approche de ce qu'ils picoraient */
let texCorbeau = null;
function sursautsRE(moi, now) { const L = M.L, b = baseLieu(M.lieu), mp = moi.g.position; if (b !== "grande" || L.interieur) return;
  M.sursauts = M.sursauts || new Set();
  // les endroits possibles (une seule fois par lieu) : au pied d'une façade, devant le rez-de-chaussée
  /* les endroits possibles : les vraies fenêtres du rez-de-chaussée, sur le mur du fond (entre les portes A, B, C, D) — pas un mur nu */
  if (!L.ptsFenetre) { L.ptsFenetre = []; for (const px of RU.fenetresFond || []) { const pz = RU.zA, x = px, z = pz + 2.2; if (L.limites(x, z)) L.ptsFenetre.push({ px, pz, nx: 0, nz: 1, x, z, y0: RU.y(pz), wy: 2.0, ww: 1.0, wh: 1.4, ux: 1, uz: 0 }); } }
  if (!M.sursauts.has("fenetre") && !M.cine && M.sepFait && L.ptsFenetre.length) { const q = L.ptsFenetre.find(q => Math.hypot(mp.x - q.x, mp.z - q.z) < 3.4 && Math.hypot(mp.x - q.x, mp.z - q.z) > 1.4);
    if (q) { M.sursauts.add("fenetre"); fenetreBrisee(q); } }
  if (!M.sursauts.has("corbeaux") && !M.cine && M.sepFait) { if (!L.ptCorbeaux) L.ptCorbeaux = [[-4, -14], [6, -26], [-6, -30], [3, 8]].find(([x, z]) => L.limites(x, z)) || null;
    const c = L.ptCorbeaux; if (c && Math.hypot(mp.x - c[0], mp.z - c[1]) < 6) { M.sursauts.add("corbeaux"); envolCorbeaux(c[0], hNiv(L, c[0], c[1], mp.y), c[1]); } } }
function fenetreBrisee(q) { const sc = M.scene, g = new THREE.Group(); sc.add(g); const verre = new THREE.MeshStandardMaterial({ color: 0xc8dce8, roughness: .1, metalness: .3, transparent: true, opacity: .75, side: THREE.DoubleSide });
  const eclats = []; for (let i = 0; i < (PETIT ? 12 : 26); i++) { const o = new THREE.Mesh(new THREE.PlaneGeometry(.08 + Math.random() * .2, .08 + Math.random() * .22), verre); const la = (Math.random() - .5) * (q.ww || 1); o.position.set(q.px + q.nx * .1 + (q.ux ?? 1) * la, (q.y0 || 0) + (q.wy ?? 1.5) + (Math.random() - .5) * (q.wh || 1.1), q.pz + q.nz * .1 + (q.uz ?? 0) * la); g.add(o);   /* (dans le cadre de la fenêtre) */
    eclats.push({ o, v: new THREE.Vector3(q.nx * (2 + Math.random() * 4) + (Math.random() - .5) * 2, 1 + Math.random() * 2.5, q.nz * (2 + Math.random() * 4) + (Math.random() - .5) * 2), w: Math.random() * 14 }); }
  sonBruit(.5, 6500, .9); sonBruit(.25, 3000, .6); setTimeout(() => sonBruit(.4, 5000, .5), 120); sonPos(ZTYPES[0].son, 1);   // (le verre qui éclate, le râle)
  const z = creerZ({ id: Math.floor(Math.random() * 1e9), ty: 0, x: q.px + q.nx * .3, z: q.pz + q.nz * .3 }); if (z) { z.tx = q.x; z.tz = q.z; }   /* (il sort du mur, vers nous) */
  const t0 = performance.now(); let prec = t0; const f = () => { const now = performance.now(), dt = Math.min(.05, (now - prec) / 1000), u = (now - t0) / 1000; prec = now; if (!M || M.scene !== sc || u > 2.4) { sc.remove(g); g.traverse(o => o.geometry && o.geometry.dispose()); verre.dispose(); return; }
    const sol = (q.y0 || 0) + .02; for (const e of eclats) { if (e.o.position.y > sol) { e.v.y -= 9.8 * dt; e.o.position.addScaledVector(e.v, dt); e.o.rotation.x += e.w * dt; e.o.rotation.y += e.w * .7 * dt; if (e.o.position.y < sol) { e.o.position.y = sol; e.o.rotation.set(-Math.PI / 2, 0, Math.random() * 7); } } }
    verre.opacity = .75 * Math.min(1, (2.4 - u) / .6); requestAnimationFrame(f); }; f();
  if (M.camera) { const c0 = performance.now(); const sec = () => { const k = 1 - (performance.now() - c0) / 400; if (!M || k <= 0) return; M.camera.position.x += (Math.random() - .5) * .06 * k; M.camera.position.y += (Math.random() - .5) * .06 * k; requestAnimationFrame(sec); }; sec(); } }
function envolCorbeaux(x, y, z) { texCorbeau = texCorbeau || [0, 1].map(k => tex(toile(64, 32, c => { c.fillStyle = "#0b0b0d"; c.beginPath(); c.ellipse(32, 18, 9, 4, 0, 0, 7); c.fill(); c.beginPath(); c.arc(42, 16, 3.2, 0, 7); c.fill();
    c.beginPath(); if (k) { c.moveTo(26, 16); c.quadraticCurveTo(14, 2, 2, 6); c.lineTo(28, 18); c.moveTo(34, 16); c.quadraticCurveTo(46, 2, 60, 5); c.lineTo(32, 18); } else { c.moveTo(26, 18); c.quadraticCurveTo(14, 28, 2, 30); c.lineTo(28, 17); c.moveTo(34, 18); c.quadraticCurveTo(46, 28, 60, 29); c.lineTo(32, 17); } c.fill(); })));   /* (deux images : les ailes levées, baissées) */
  const sc = M.scene, g = new THREE.Group(); sc.add(g); const N = PETIT ? 6 : 11, ois = [];
  for (let i = 0; i < N; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: texCorbeau[0], transparent: true, depthWrite: false })); s.scale.set(.95, .48, 1); s.position.set(x + (Math.random() - .5) * 2, y + .2 + Math.random() * .3, z + (Math.random() - .5) * 2); g.add(s);
    const a = Math.random() * 7; ois.push({ s, v: new THREE.Vector3(Math.sin(a) * (2 + Math.random() * 3), 3 + Math.random() * 3, Math.cos(a) * (2 + Math.random() * 3)), ph: Math.random() * 7, d: Math.random() * .3 }); }
  for (let k = 0; k < 6; k++) setTimeout(() => sonBruit(.06, 1800 + Math.random() * 900, .35), k * 70);   // (le battement des ailes)
  for (let k = 0; k < 3; k++) setTimeout(() => { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); const t = actx.currentTime, o = actx.createOscillator(), f = actx.createBiquadFilter(), gn = actx.createGain(); o.type = "sawtooth"; o.frequency.setValueAtTime(620, t); o.frequency.linearRampToValueAtTime(420, t + .22);
      f.type = "bandpass"; f.frequency.value = 1100; f.Q.value = 3; gn.gain.setValueAtTime(.12, t); gn.gain.linearRampToValueAtTime(0, t + .25); o.connect(f).connect(gn).connect(actx.destination); o.start(t); o.stop(t + .26); } catch (e) {} }, 150 + k * 260);   /* (les croassements) */
  const t0 = performance.now(); let prec = t0; const f = () => { const now = performance.now(), dt = Math.min(.05, (now - prec) / 1000), u = (now - t0) / 1000; prec = now; if (!M || M.scene !== sc || u > 4) { sc.remove(g); return; }
    for (const o of ois) { if (u < o.d) continue; o.s.position.addScaledVector(o.v, dt); o.v.y += .6 * dt; o.s.material.map = texCorbeau[Math.floor((now / 90) + o.ph) % 2]; o.s.material.opacity = Math.min(1, (4 - u) / .8); }
    requestAnimationFrame(f); }; f(); }
/* le fusil à pompe (dessiné ici en 3D, pièce par pièce) : le canon et le magasin tubulaire, la pompe en bois, la carcasse, la crosse ;
   l'origine dans la main, le canon vers +z. Ramassé près du car de police, à côté d'un képi et d'une mare de sang : chaque tir, une gerbe — gros dégâts de près */
const POMPE_POS = [3.5, -37.5];
// le tir : la gerbe frappe la cible (plus fort de près) et les zombies juste derrière elle, dans le même axe ; un gros bruit, le recul, puis « clac-clac » (on réarme)
function tirPompe(moi, z) { const now = performance.now(); if (now < (M.pompeT || 0)) return; M.pompeT = now + 900;
  const mp = moi.g.position, dx0 = z.x - mp.x, dz0 = z.z - mp.z, d = Math.hypot(dx0, dz0) || 1; if (d > 18) { M.ctx.surInfo && M.ctx.surInfo("Trop loin pour le fusil à pompe… approche-toi."); return; }
  const dx = dx0 / d, dz = dz0 / d; moi.cible = null; moi.chemin = []; moi.tirT = now; if (M.L.interieur || M.L.suivi) M.yaw = Math.atan2(-dx, -dz);
  eclairDuCanon(moi, dx, dz); sonTir();   /* (le même coup de feu que l'arme de base) */
  { const c0 = performance.now(); const sec = () => { const k = 1 - (performance.now() - c0) / 260; if (!M || k <= 0) return; M.camera.position.x += (Math.random() - .5) * .07 * k; M.camera.position.y += Math.random() * .05 * k; requestAnimationFrame(sec); }; sec(); }   /* (le recul) */
  const fort = d < 5 ? 3 : d < 10 ? 2 : 1;
  if (z.tyran || z.lisa || z.licker) { for (let i = 0; i < fort + (d < 4 ? 1 : 0); i++) { if (z.tyran) toucherTyran(z); else if (z.lisa) toucherLisa(z); else toucherLicker(z, dx, dz); } return; }
  for (const q of [...M.zomb.values()]) { if (q.mortT || q.cine || !q.g.visible) continue; const ex = q.x - mp.x, ez = q.z - mp.z, dq = Math.hypot(ex, ez) || 1;
    if (q !== z && (dq > Math.min(d + 2.5, 12) || (ex * dx + ez * dz) / dq < .9)) continue;
    impactZ(q, dx, dz); for (let i = 0; i < (q === z ? fort : 1); i++) { if (q.mortT) break; envoyerWS({ t: "z_tir", id: q.id, dx, dz }); if (estChefZ()) blesserZ(q, dx, dz); } } }
// au bar du sous-sol, à côté du survivant qui s'est tiré une balle : son fusil, un képi, du sang ; on passe dessus, on le ramasse
function pompeAuSol(L, mp, now) { if (M.pompe) { if (L.pompeObj) L.pompeObj.visible = false; return; } const POMPE_POS = M.pompePos;
  if (!L.pompeObj) { if (!L.limites(POMPE_POS[0], POMPE_POS[1])) { L.pompeObj = new THREE.Group(); return; } const g = new THREE.Group(), y = hNiv(L, POMPE_POS[0], POMPE_POS[1], mp.y); g.position.set(POMPE_POS[0], y, POMPE_POS[1]); M.scene.add(g); L.pompeObj = g;
    const f = fusilPompe(); f.rotation.set(0, 0, Math.PI / 2); f.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), .6); f.position.y = .05; g.add(f);   /* (couché sur le flanc, par terre) */
    const kepi = new THREE.Group(), bleu = new THREE.MeshStandardMaterial({ color: 0x1a2440, roughness: .7 }), visiere = new THREE.MeshStandardMaterial({ color: 0x0c0c0e, roughness: .3 }); { const c = new THREE.Mesh(new THREE.CylinderGeometry(.1, .11, .09, 16), bleu); c.position.y = .045; kepi.add(c); const v = new THREE.Mesh(new THREE.CylinderGeometry(.11, .11, .01, 16, 1, false, 0, Math.PI), visiere); v.position.set(0, .01, .04); kepi.add(v); }
    kepi.position.set(-.6, 0, .4); kepi.rotation.set(.25, 1.1, .4); g.add(kepi);
    if (texSang.length) { const s = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6), matSang(texSang[2])); s.rotation.x = -Math.PI / 2; s.position.set(-.2, .025, .1); g.add(s); }
    const lueur = new THREE.PointLight(0xfff0d0, .6, 2.2, 2); lueur.position.set(0, .5, 0); g.add(lueur); g.userData.lueur = lueur; }   /* (un reflet sur le métal : on le remarque) */
  const g = L.pompeObj; if (!g.parent) return; g.visible = true; if (g.userData.lueur) g.userData.lueur.intensity = .5 + .3 * Math.sin(now / 300);
  if (!M.cine && Math.hypot(mp.x - POMPE_POS[0], mp.z - POMPE_POS[1]) < 1.1) { M.pompe = true; g.visible = false; sonBruit(.07, 1800, .45); setTimeout(() => sonBruit(.07, 1300, .5), 160); majHudApo();
    dire(M.moiNum, "Un fusil à pompe… Celui-là ne les fera pas que reculer."); } }
/* sur le toit de la cour d'honneur : un héros que personne n'a choisi se bat contre des zombies, tout au bord ; on lève les yeux…
   ils basculent ensemble et s'écrasent au sol devant nous. Le bruit de la chute. Une fois par partie */
const PNJ_TOIT = -490 - 20;
const heroToit = () => { const pris = new Set([M.perso, ...(M.equipe || []).map(e => e.id)].map(Number)); return [21, 26, 24, 22, 23, 25].find(h => !pris.has(h)) || 24; };
/* avant d'arriver dans la cour d'honneur : Brad, à la radio, a repéré quelqu'un en difficulté sur le toit de la salle des fêtes */
function radioToit() { M.toitRadio = performance.now(); const id = heroToit(), nomH = HEROS[id].court, elle = id === 21;
  const L = [[0, "Brad Vickers", `Ici Brad Vickers ! Je survole la caserne… Il y a quelqu'un sur le toit de la salle des fêtes : c'est ${nomH} !`], [4800, "Brad Vickers", `${elle ? "Elle" : "Il"} est en difficulté, cerné${elle ? "e" : ""} par ces choses… ${elle ? "Elle" : "Il"} ne tiendra pas longtemps !`],
    [9400, M.moiNum, `Bien reçu, Brad ! J'arrive, je suis tout près de la cour d'honneur !`], [12200, "Brad Vickers", "Je l'éclaire avec le projecteur. Faites vite !"]];
  for (const [t, qui, txt] of L) setTimeout(() => { if (!M || !M.L || !M.L.apo || M.toitFait && qui !== M.moiNum) return; if (typeof qui === "string") parleRadio(qui, txt); else if (qui === M.moiNum && codecOuvert()) codecDire("moi", nomApo(), txt); else if (M.gens.get(qui)) dire(qui, txt); }, t);
  sonBruit(.35, 2600, .12); }
function cineToit(moi) { const L = M.L, mp = moi.g.position.clone(); M.toitFait = true;
  // le bord de toit : la façade la plus proche, assez haute, devant nous
  let best = null, bd = 30; for (const [, cadres] of L.facadesFen || []) for (const c of cadres) { if (c.H < 8 || c.H > 26) continue; const nn = Math.hypot(c.n[0], c.n[2]) || 1, nx = c.n[0] / nn, nz = c.n[2] / nn;
      const x = c.o[0] + nx * .55, z = c.o[2] + nz * .55, d = Math.hypot(x - mp.x, z - mp.z); if (d < bd && d > 6 && (mp.x - x) * nx + (mp.z - z) * nz > 0) { bd = d; best = { c, nx, nz, x, z, y: c.o[1] + c.H / 2 }; } }
  if (!best) best = { c: { ux: [0, 0, 1] }, nx: -1, nz: 0, x: 10.7, z: Math.max(-6, Math.min(8, mp.z)), y: 7.0 };   /* (sinon : le toit plat du bâtiment de la salle des fêtes, au bord de la cour d'honneur) */
  const id = heroToit(), femme = id === 21, nomH = HEROS[id].court; M.toitId = id; M.toitNom = nomH;
  const ux = best.c.ux[0], uz = best.c.ux[2], bord = (a, r = 0) => [best.x + ux * a - best.nx * r, best.z + uz * a - best.nz * r];
  /* (le toit lui-même, là où il se tient : un rayon vers le bas — sinon il se tenait dans le vide, au-dessus d'un toit plus bas ou en retrait) */
  const rayT = new THREE.Raycaster(); rayT.camera = M.camera; const yToit = (x, z) => { rayT.set(new THREE.Vector3(x, best.y + 5, z), new THREE.Vector3(0, -1, 0)); rayT.far = 11; const h = rayT.intersectObjects(M.scene.children, true).find(h => h.object.isMesh && !h.object.isSprite && h.object.visible && !(h.object.material && h.object.material.transparent)); return h ? h.point.y : null; };
  let rT = 2.0, yT = best.y; for (const r of [2.0, 1.4, .9, 2.8, 3.6]) { const [x, z] = bord(0, r), y = yToit(x, z); if (y != null && y > best.y - 4) { rT = r; yT = y; break; } }
  const [hx, hz] = bord(0, rT); retirerAncien(PNJ_TOIT);   /* (sur le toit lui-même, en retrait du bord — pas debout sur la corniche) */ const p = ajouterAncien({ ...infoEquipier(id, PNJ_TOIT, hx, hz, M.moiNum, 9), equipier: false }); if (!p) return false; p.g.position.y = yT; p.cineRE = true;
  const zs = [[-1.6, rT + 1.2], [1.5, rT + 1.4]].map(([a, r]) => { const [x, z] = bord(a, r), q = creerZ({ id: Math.floor(Math.random() * 1e9), ty: 0, x, z, y: yT }); q.cine = true; q.y = yT; q.x0 = x; q.z0 = z; return q; });
  const chute = []; let tombe = false, ecrase = false;
  const sol = hNiv(L, hx + best.nx * 1.6, hz + best.nz * 1.6, mp.y), cam = mp.clone().add(new THREE.Vector3(best.nx * 2.4 + ux * 2.3, 0, best.nz * 2.4 + uz * 2.3)); cam.y = mp.y + 2.3;   /* (un peu en retrait de nous, sur le côté : on nous voit lever la tête, sans nous avoir devant l'objectif) */
  /* les flammes entre la caméra et le pied du mur s'effacent le temps de la scène : rien ne masque la chute */
  const feuxCaches = []; { const a = cam.clone(), b = new THREE.Vector3(hx + best.nx * 1.6, sol, hz + best.nz * 1.6), ab = b.clone().sub(a), l2 = ab.lengthSq() || 1;
    for (const g of L.feuxG || []) { if (!g.visible) continue; const t = Math.max(0, Math.min(1, g.position.clone().sub(a).dot(ab) / l2)), pr = a.clone().addScaledVector(ab, t); if (Math.hypot(g.position.x - pr.x, g.position.z - pr.z) < 3.2) { g.visible = false; feuxCaches.push(g); } } }
  const caches = new Set(); cacherAutour(mp, 14, caches); for (const z of zs) { z.g.visible = true; caches.delete(z); }
  moi.poseCine = { t0: performance.now() };   /* (il lève les yeux vers le toit) */
  /* l'hélicoptère de Brad arrive par-dessus le toit, s'arrête au-dessus du bord et braque son projecteur sur le héros ; il suit la chute, puis s'en va */
  const hel = creerHelico(); M.scene.add(hel); const helA = sonHelico(10); helA.volume = 0;
  const hPos = new THREE.Vector3(hx + best.nx * 4 + ux * 7, yT + 10, hz + best.nz * 4 + uz * 7), hDep = hPos.clone().add(new THREE.Vector3(-best.nx * 50 + ux * 15, 16, -best.nz * 50 + uz * 15)), hFin = hPos.clone().add(new THREE.Vector3(ux * 70 - best.nx * 20, 22, uz * 70 - best.nz * 20));
  hel.position.copy(hDep);
  const cone = (() => { const geo = new THREE.ConeGeometry(1, 1, 24, 1, true); geo.translate(0, -.5, 0); return new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xdfe8ff, map: texFaisceau(), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false })); })(); M.scene.add(cone);
  const spot = new THREE.SpotLight(0xe8eeff, 0, 70, .2, .45, 1); M.scene.add(spot, spot.target); const visee = new THREE.Vector3(hx, yT, hz), _bas = new THREE.Vector3(0, -1, 0);
  const finHelico = () => { M.scene.remove(hel, cone, spot, spot.target); try { helA.pause(); } catch (e) {} sonsCourts.delete(helA); };
  sceneParlee([[.6, M.moiNum, "Des coups de feu ?! … Ça vient d'en haut. Sur le toit !"], [3.4, PNJ_TOIT, "Reculez ! Reculez, saletés !"], [6.2, M.moiNum, `${nomH} ?! Tiens bon, j'arrive !`],
      [8.2, () => { tombe = true; sonPos("sons/re-chute.mp3", 1); }, ""], [11.4, M.moiNum, femme ? `${nomH}… Non… Je n'ai rien pu faire pour elle.` : `${nomH}… Non… Je n'ai rien pu faire pour lui.`]],   /* (Brad ne parle plus pendant la scène : l'écran de la radio la cachait — il rappelle juste après) */
    () => { finHelico(); [[500, `${nomApo()}… Ne t'en veux pas. Tu ne pouvais rien faire d'autre.`], [4200, "Trouve vite la balise, et déclenche-la une fois que la zone est libre. Je reviendrai vous chercher. Brad, terminé."]].forEach(([t, txt]) => setTimeout(() => M && M.L && M.L.apo && !M.cine && parleRadio("Brad Vickers", txt), t)); moi.poseCine = null; for (const g of feuxCaches) g.visible = true; for (const z of caches) z.g.visible = true; const q = M.gens.get(PNJ_TOIT); if (q) { q.cineRE = false; if (!q.info.mortT) { q.g.position.set(hx + best.nx * 1.6, sol, hz + best.nz * 1.6); q.info.mortT = performance.now() - 3000; } }
      for (const z of zs) { z.cadavre = true; if (!z.mortT) { z.y = sol; z.mortT = performance.now() - 3000; } } },
    { duree: 17.2, maj: (u, now) => { const dt = Math.min(.05, Math.max(0, u - (M.toitU ?? u))); M.toitU = u;
      { const hp = u < 3.4 ? hDep.clone().lerp(hPos, lisse(u / 3.4)) : u < 13.5 ? hPos.clone().add(new THREE.Vector3(Math.sin(u * .9) * .6, Math.sin(u * 1.3) * .35, Math.cos(u * .7) * .5)) : hPos.clone().lerp(hFin, lisse((u - 13.5) / 3.7));
        const v = hp.clone().sub(hel.position); hel.position.copy(hp); hel.userData.rotor.rotation.y += dt * 9.5; hel.userData.rotorQ.rotation.z += dt * 40; if (hel.userData.feu) hel.userData.feu.visible = Math.floor(now / 450) % 2 === 0;
        const q0 = M.gens.get(PNJ_TOIT); if (q0) visee.lerp(q0.g.position, Math.min(1, dt * 8)); const vd = visee.clone().sub(hp), vise = u < 13.5 ? vd : v.lengthSq() > 1e-6 ? v : vd; hel.rotation.y = Math.atan2(-vise.z, vise.x); hel.rotation.z = u < 3.4 ? -.15 * Math.sin(u / 3.4 * Math.PI) : 0;
        const on = u > 2.2 && u < 16.5 ? Math.min(1, (u - 2.2) / .5) * Math.min(1, (16.5 - u) / .6) : 0, lo = vd.length();   /* (le projecteur s'allume en arrivant au-dessus du toit) */
        cone.position.copy(hp).y -= .6; cone.quaternion.setFromUnitVectors(_bas, vd.clone().normalize()); cone.scale.set(lo * .2, lo, lo * .2); cone.material.opacity = .34 * on; cone.visible = on > 0;
        spot.position.copy(cone.position); spot.target.position.copy(visee); spot.intensity = 260 * on;
        helA.volume = Math.max(0, Math.min(.85, .15 + u / 4)) * (u > 13.5 ? Math.max(0, 1 - (u - 13.5) / 3.7) : 1) * .8; }
      // la caméra : à notre place, le regard vers le bord du toit ; puis elle suit la chute, jusqu'au sol
      const cible = new THREE.Vector3(hx, yT + 1, hz); if (tombe) { const q = M.gens.get(PNJ_TOIT); if (q) cible.lerp(q.g.position.clone().setY(q.g.position.y + .6), .85); }
      if (u < 6.5) cible.lerp(hel.position, .45 * (1 - lisse((u - 3.2) / 3.3)));   /* (on voit l'hélicoptère arriver au-dessus du toit, le projecteur s'allumer ; puis le regard redescend sur le bord) */
      M.camera.position.copy(cam); M.camera.lookAt(cible);
      if (moi.av3) moi.av3.sc.rotation.y = Math.atan2(hx - mp.x, hz - mp.z);
      const q = M.gens.get(PNJ_TOIT); if (!q) return;
      if (!tombe) { const kb = Math.max(0, Math.min(1, (u - 5.2) / 2.8)), [px, pz] = bord(0, rT - (rT - .45) * kb * kb);
        if (u > 7.3 && !M.toitMord) { M.toitMord = true; const z = zs[0]; z.coupT = now; q.flashT = now + 300; sonBruit(.25, 500, .5); for (let i = 0; i < 3; i++) setTimeout(() => M && jetSang(q.g.position.x, yT + 1.45 - i * .1, q.g.position.z, best.nx, best.nz), i * 110); }   /* (l'un d'eux le mord : il recule, chancelle… et bascule) */ q.g.position.set(px, yT, pz); q.cible = null; q.chemin = [];   /* (d'abord sur le toit, en retrait ; les zombies le repoussent pas à pas jusqu'au bord) */
        // il tire, à droite, à gauche ; les zombies avancent sur lui, le long du bord
        zs.forEach((z, i) => { const k = Math.min(1, u / 7), qp = q.g.position; z.x = z.x0 + (qp.x - z.x0) * k * .72; z.z = z.z0 + (qp.z - z.z0) * k * .72; z.tx = z.x; z.tz = z.z; z.y = yT; });
        if (u > 1 && now > (M.toitTir || 0)) { M.toitTir = now + 700 + Math.random() * 500; const z = zs[Math.floor(Math.random() * 2)], dx = z.x - hx, dz = z.z - hz, dd = Math.hypot(dx, dz) || 1; if (q.av3) q.av3.sc.rotation.y = Math.atan2(dx, dz); eclairDuCanon(q, dx / dd, dz / dd); sonTir(.55); impactZ(z, dx / dd, dz / dd); } }
      else { if (!chute.length) { for (const o of [q, ...zs]) { const gp = o.g ? o.g.position : null; chute.push({ o, v: new THREE.Vector3(best.nx * (1.6 + Math.random()), .8 + Math.random() * .6, best.nz * (1.6 + Math.random())), x: o === q ? q.g.position.x : o.x, z: o === q ? q.g.position.z : o.z, y: yT, posee: false, gp }); } q.poseCine = null; q.info.mortT = 0; }
        for (const c of chute) { if (c.posee) continue; c.v.y -= 9.8 * dt; c.x += c.v.x * dt; c.z += c.v.z * dt; c.y += c.v.y * dt;
          if (c.y <= sol) { c.y = sol; c.posee = true; sonBruit(.3, 180, .9); sangAuSol(c.x, c.z, sol, 1.4); if (!ecrase) { ecrase = true; sonBruit(.5, 90, 1); setTimeout(() => sonBruit(.25, 1200, .4), 60); } if (c.o === q) { q.chute = false; q.mortAuSol = true; q.info.mortT = performance.now() - 1300; flaqueMort(q); } else { c.o.mortT = performance.now() - 600; c.o.cadavre = true; c.o.mortSol = true; } }   /* (écrasé : aussitôt à plat — et il reste là) */
          if (c.o === q) { q.g.position.set(c.x, c.y, c.z); q.chute = !c.posee; if (q.av3) q.av3.sc.rotation.x = c.posee ? 0 : Math.min(1.1, (yT - c.y) * .09); }   /* (il tombe à la renverse en battant des bras ; à terre, il ne bouge plus) */
          else { c.o.x = c.o.tx = c.x; c.o.z = c.o.tz = c.z; c.o.y = c.y; const Z = c.o.z3; if (Z) { if (c.posee) Z.pivot.rotation.x = 0; else { c.rot = (c.rot || 0) + dt * (2.2 + (c.vr ??= Math.random() * 1.5)); Z.pivot.rotation.x = -c.rot; } } } } } } });   /* (les zombies culbutent dans le vide ; posés, ils sont déjà à terre) */
  return true; }
// à chaque image, à Resident Evil : où en est l'histoire
function histoireRE(moi, now) { if (!M.L || !M.L.apo || M.L.sh || M.evac || APO.zombieFin) return; const L = M.L, b = baseLieu(M.lieu), mp = moi.g.position;
  if (M.pompePos && M.pompeL === L && !M.cine) pompeAuSol(L, mp, now);
  if (b === "grande") { gravatsPorche(M.scene, L); if (!M.porcheOuvert && L.gravatsSouffles) { L.gravatsSouffles = false; for (const o of L.gravatsPorche.children) { const [p, r, sc] = o.userData.repos; o.position.copy(p); o.rotation.copy(r); o.scale.copy(sc); } for (const f of L.feuxC4 || []) f.visible = false; } }   /* (une nouvelle partie : le tas est de nouveau là) */
  majBoutonsRE();
  /* dans la salle des fêtes : la lueur des feux sur les personnages (une lumière chaude qui nous suit et vacille), pour bien les voir dans la pénombre */
  if (b === "fetes") { if (!L.lueurPersos) { L.lueurPersos = new THREE.PointLight(0xff9a4a, 0, 7.5, 1.5); L.lueurPersos.userData.apo = true; M.scene.add(L.lueurPersos); }
    const lp = L.lueurPersos; lp.position.set(mp.x + 1.1, mp.y + 2.3, mp.z + .8); lp.intensity = 4.2 * (.85 + .15 * Math.sin(now / 90) * Math.sin(now / 57)); }
  if (b === "fetes") { if (!L.c4Obj) { L.c4Obj = objetC4(); L.c4Obj.position.set(C4_FETES[0], 0, C4_FETES[1]); L.c4Obj.rotation.y = .5; M.scene.add(L.c4Obj);
      /* (le monstre abattu : le C4 se signale — un halo rouge qui palpite autour de lui, et un faisceau de lumière qui monte, visible de toute la salle) */
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: lueurGB(), color: 0xff3a1a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); halo.scale.setScalar(1.6); halo.position.set(C4_FETES[0], .35, C4_FETES[1]); M.scene.add(halo);
      const col = new THREE.Mesh(new THREE.CylinderGeometry(.18, .5, 3.2, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xff5a2a, map: texFaisceau(), transparent: true, opacity: .55, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false })); col.rotation.x = Math.PI; col.position.set(C4_FETES[0], 1.6, C4_FETES[1]); M.scene.add(col);
      L.c4Signal = { halo, col }; }
    L.c4Obj.visible = !M.c4; { const v = !!(L.c4Signal && M.lisaMorte && !M.c4); if (L.c4Signal) { L.c4Signal.halo.visible = L.c4Signal.col.visible = v; if (v) { const k = .6 + .4 * Math.sin(now / 260); L.c4Signal.halo.material.opacity = k; L.c4Signal.halo.scale.setScalar(1.3 + .5 * k); } } }
    if (!M.c4 && !M.cine && Math.hypot(mp.x - C4_FETES[0], mp.z - C4_FETES[1]) < 1.1) { M.c4 = true; sonBruit(.06, 3000, .3); majBoutonsRE(); const eq = equipierVivant();
      dire(M.moiNum, "Du C4 ! De quoi faire sauter les gravats du porche."); if (eq && !eq.info.mortT) setTimeout(() => M && M.gens.get(eq.info.numero) === eq && !eq.info.mortT && dire(eq.info.numero, "Parfait. Direction le porche… et reste à couvert quand ça saute."), 3600); } }
  if (M.cine || moi.info.mortT) return;
  if (M.sepA && !M.sepFait && now > M.sepA) { cineSeparation(); return; }
  if (b === "grande" && M.sepFait && !M.toitFait && !M.toitRadio && !M.bradEnCours && Math.abs(mp.x) < 24 && mp.z > -30 && mp.z < 28) radioToit();
  if (b === "grande" && M.sepFait && !M.toitFait && M.toitRadio && now - M.toitRadio > 13500 && !M.bradEnCours && Math.abs(mp.x) < 10 && mp.z > -12 && mp.z < 14 && ![...(M.zomb ? M.zomb.values() : [])].some(z => !z.mortT && !z.cine && Math.hypot(z.x - mp.x, z.z - mp.z) < 6)) { if (cineToit(moi)) return; M.toitFait = true; }   /* (dans la cour d'honneur : la chute depuis le toit) */
  const loinZ = ![...(M.zomb ? M.zomb.values() : [])].some(z => !z.mortT && Math.hypot(z.x - mp.x, z.z - mp.z) < 7);
  if (M.separe && !M.gps && !M.bradEnCours && ((M.bradT && now > M.bradT && loinZ) || b === "fetes" || (b === "grande" && PORTES_FETES.some(([x, z]) => Math.hypot(mp.x - x, mp.z - z) < 8)))) { cineRadioBrad(); return; }
  if (M.separe && M.gps && (b === "fetes" || (b === "grande" && PORTES_FETES.some(([x, z]) => Math.hypot(mp.x - x, mp.z - z) < 8)))) { cineRetrouvailles(); return; }
  if (!M.gps && !M.separe && M.sepFait && !M.bradEnCours && M.bradT && now > M.bradT && loinZ) { cineRadioBrad(); return; }   // (seul depuis le début : Brad appelle quand même)
  if (b === "grande" && !M.porcheOuvert && mp.z > PORCHE_Z - 2.2 && Math.abs(mp.x) < 3) {
    if (M.c4 && !M.c4Pose) { cinePoseC4(); return; }
    if (!M.c4 && now > (M.porcheDitT || 0)) { M.porcheDitT = now + 45000; dire(M.moiNum, "Le porche est bouché par les gravats… Impossible de passer. Il me faudrait de quoi faire sauter tout ça."); } } }
// la direction la plus dégagée autour d'un point (là où le sol est libre le plus loin)
function dirDegagee(p) { let dir = new THREE.Vector3(0, 0, 1), best = 0;
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, dx = Math.sin(a), dz = Math.cos(a); let r = 0; while (r < 30 && M.L.limites(p.x + dx * (r + .5), p.z + dz * (r + .5))) r += .5; if (r > best + .5) { best = r; dir = new THREE.Vector3(dx, 0, dz); } }
  return dir; }
// (les zombies et les monstres trop près : cachés le temps du plan — personne ne passe devant la caméra ni devant les héros)
/* le bruit de l'hélicoptère (son approche, de plus en plus fort) : on part de « debut » secondes, pour que le plus fort tombe quand il est au-dessus de nous ;
   arrivé au bout, on reprend un peu avant, sans retomber au début (là où il est encore loin, tout bas) */
function sonHelico(debut) { const a = new Audio("sons/apo-helico.mp3"); a.volume = 0; sonsCourts.add(a); let pose = false;
  const placer = () => { if (pose) return; pose = true; try { a.currentTime = debut; } catch (e) {} };
  a.addEventListener("loadedmetadata", placer); a.addEventListener("timeupdate", () => { if (a.duration && a.currentTime > a.duration - .9) a.currentTime = Math.max(0, a.duration - 5); });
  a.addEventListener("ended", () => { if (sonsCourts.has(a)) { a.currentTime = Math.max(0, (a.duration || 20) - 5); a.play().catch(() => {}); } });
  if (a.readyState >= 1) placer(); a.play().catch(() => {}); return a; }
/* les feux entre deux points (la caméra et ce qu'elle regarde) : cachés le temps d'un plan, pour que rien ne masque la scène */
/* le faisceau d'un projecteur : vif près de la lampe, il s'estompe en descendant ; plus dense au milieu que sur les bords */
let texFaisc = null;
const texFaisceau = () => texFaisc || (texFaisc = tex(toile(64, 256, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "rgba(255,255,255,.75)"); g.addColorStop(.35, "rgba(255,255,255,.28)"); g.addColorStop(1, "rgba(255,255,255,.05)"); x.fillStyle = g; x.fillRect(0, 0, w, h);
  const r = x.createLinearGradient(0, 0, w, 0); r.addColorStop(0, "rgba(0,0,0,.55)"); r.addColorStop(.5, "rgba(0,0,0,0)"); r.addColorStop(1, "rgba(0,0,0,.55)"); x.globalCompositeOperation = "destination-out"; x.fillStyle = r; x.fillRect(0, 0, w, h); })));
function cacherFeuxEntre(a, b, r) { const ab = b.clone().sub(a), l2 = ab.lengthSq() || 1, out = [];
  for (const g of (M.L && M.L.feuxG) || []) { if (!g.visible) continue; const t = Math.max(0, Math.min(1, g.position.clone().sub(a).dot(ab) / l2)), pr = a.clone().addScaledVector(ab, t); if (Math.hypot(g.position.x - pr.x, g.position.z - pr.z) < r) { g.visible = false; out.push(g); } } return out; }
function preparerIntro2(moi) { const p = moi.g.position.clone(), dir = dirDegagee(p), cote = new THREE.Vector3(dir.z, 0, -dir.x), eq = equipierVivant();
  if (eq) { let s = 1; for (const k of [1, -1]) if (M.L.limites(p.x + cote.x * 1.1 * k, p.z + cote.z * 1.1 * k)) { s = k; break; }
    eq.g.position.set(p.x + cote.x * 1.1 * s, p.y, p.z + cote.z * 1.1 * s); eq.cible = null; eq.chemin = []; }
  const gens = [moi, eq].filter(Boolean), mid = gens.reduce((a, q) => a.add(q.g.position), new THREE.Vector3()).multiplyScalar(1 / gens.length);
  let r = 0; while (r < 4.4 && M.L.limites(mid.x + dir.x * (r + .3), mid.z + dir.z * (r + .3))) r += .2; r = Math.max(2.4, r);
  const hel = creerHelico(); M.scene.add(hel); hel.visible = false; hel.rotation.y = Math.atan2(dir.z, -dir.x);   // (il arrive de face, et passe au-dessus d'eux, vers l'arrière)
  { const geo = new THREE.ConeGeometry(1, 1, 24, 1, true); geo.translate(0, -.5, 0); const cone = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xdfe8ff, map: texFaisceau(), transparent: true, opacity: .4, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
    cone.scale.set(4, 26, 4); cone.position.y = .6; hel.add(cone); hel.userData.cone = cone;
    const tache = new THREE.Mesh(new THREE.CircleGeometry(3.2, 32), new THREE.MeshBasicMaterial({ color: 0xeef3ff, transparent: true, opacity: .6, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); tache.rotation.x = -Math.PI / 2; tache.visible = false; M.scene.add(tache); hel.userData.tache = tache; }   /* (la tache du projecteur, qui quadrille le sol) */   // (son projecteur fouille le sol, devant lui… sans les trouver)
  const helA = sonHelico(12);
  return { moi, eq, gens, dir, p, mid, yaw: Math.atan2(dir.x, dir.z), hel, helA, caches: new Set(), dit: 0,
    camF: mid.clone().addScaledVector(dir, r).setY(p.y + 1.5), viseF: mid.clone().setY(p.y + 1.15), D0: mid.clone().addScaledVector(dir, 34).setY(p.y + 24), F0: mid.clone().addScaledVector(dir, -55).setY(p.y + 21) }; }   // (haut : au-dessus des toits, il passe juste au-dessus d'eux)
function finIntro2(S) { if (!S || S.fini) return; S.fini = true; for (const g of [...(S.feuxCaches || []), ...(S.feuxFace || [])]) g.visible = true; M.scene.remove(S.hel); if (S.hel.userData.tache) M.scene.remove(S.hel.userData.tache); try { S.helA.pause(); } catch (e) {} sonsCourts.delete(S.helA); for (const q of S.gens) q.poseCine = null; for (const z of S.caches) z.g.visible = true; }
function majIntro2(S, u, dt) { const t = u - 11, cam = M.camera, hel = S.hel, now = performance.now();
  cacherAutour(S.mid, 15, S.caches); for (const q of S.gens) { q.cible = null; q.chemin = []; if (q.av3) q.av3.sc.rotation.y = S.yaw; }   // (ils restent face à la caméra, tournés vers la cour)
  const k = (t - .4) / 12.3; hel.visible = k > 0 && k < 1; if (hel.visible) hel.position.lerpVectors(S.D0, S.F0, k);
  hel.rotation.z = .08; hel.userData.rotor.rotation.y += dt * 9.5; hel.userData.rotorQ.rotation.z += dt * 40; hel.userData.feu.visible = Math.floor(now / 450) % 2 === 0;
  { const cn = hel.userData.cone, ta = hel.userData.tache; cn.rotation.z = .3 + Math.sin(t * 1.3) * .35; cn.rotation.x = .25 + Math.sin(t * .8 + 1) * .4;   // (le faisceau balaie)
    if (ta) { cn.scale.y = 26; hel.updateMatrixWorld(true); const o0 = cn.localToWorld(new THREE.Vector3(0, 0, 0)), dv = cn.localToWorld(new THREE.Vector3(0, -1, 0)).sub(o0), kk = dv.y < -.01 ? (S.p.y + .06 - o0.y) / dv.y : 1;
      ta.position.copy(o0).addScaledVector(dv, kk); ta.position.y = S.p.y + .06; cn.scale.y = 26 * Math.max(.2, Math.min(1, kk)); ta.visible = hel.visible && kk > 0 && kk < 1.6; ta.material.opacity = .45 + .15 * Math.sin(t * 9); } }   /* (la tache de lumière court sur les pavés) */
  S.helA.volume = k > 0 && k < 1 ? Math.max(0, Math.min(.85, 1 - Math.abs(k - .45) * 2.2)) : 0;
  if (t > 1.4 && !S.ciel) { S.ciel = true; for (const q of S.gens) q.poseCine = { t0: now }; }   // (ils l'entendent, et lèvent les yeux)
  if (t > 2.2 && !S.main) { S.main = true; S.moi.poseCine.mainT = now; }   // (l'un d'eux tend la main vers lui, désespéré)
  if (t > 9.6 && !S.bas) { S.bas = true; for (const q of S.gens) q.poseCine = null; }
  if (t < 3.4) { if (!S.dos) { S.dos = S.mid.clone().addScaledVector(S.dir, -4.2).setY(S.p.y + 2.1); S.feuxCaches = cacherFeuxEntre(S.dos, S.mid.clone().addScaledVector(S.dir, 16), 2.8); }   /* (derrière eux : on le voit arriver, son projecteur qui fouille la cour devant eux) */
    cam.position.copy(S.dos); cam.lookAt(S.mid.x + S.dir.x * 14, S.p.y + 6.5 + t * .9, S.mid.z + S.dir.z * 14); }
  else if (t > 6.6) { if (S.feuxCaches) { for (const g of S.feuxCaches) g.visible = true; S.feuxCaches = null; } if (!S.feuxFace) S.feuxFace = cacherFeuxEntre(S.camF, S.viseF, 2.6); const z = Math.min(1, Math.max(0, (t - 6.6) / 10)); cam.position.copy(S.camF).lerp(S.viseF, .18 * z); cam.lookAt(S.viseF); }   // (de face, devant la déchetterie)
  else { const oeil = S.mid.clone().addScaledVector(S.dir, 1.8).setY(S.p.y + 1.4);   /* (devant eux, dos à eux : personne dans le champ) */ cam.position.copy(oeil); S.vise = S.vise ? S.vise.lerp(hel.position, 1 - Math.exp(-Math.max(dt, .016) * 7)) : hel.position.clone(); cam.lookAt(S.vise); }   /* (la vue suit l'appareil, même sur un téléphone qui peine) */   // (l'hélicoptère, vu d'en bas : il passe… sans les voir)
  const autre = S.eq ? S.eq.info.numero : M.moiNum, L4 = [[9.2, M.moiNum, "Non… Il ne nous a pas vus !"], [12.2, autre, "Il faut trouver de quoi nous faire repérer, et vite."],
    [15.4, M.moiNum, "Avant que le gouvernement décide de faire sauter toute la caserne…"], [18.6, autre, "Une fusée, un fumigène, n'importe quoi… Fouillons partout !"]];
  while (S.dit < L4.length && t > L4[S.dit][0]) { dire(L4[S.dit][1], L4[S.dit][2]); S.dit++; }
  return t > 22; }
/* de temps en temps, l'hélicoptère du S.T.A.R.S. passe au-dessus de la caserne… sans nous voir (en cinématique, dehors, tant que le fumigène n'est pas trouvé) ;
   un équipier dit ce qu'il faut faire : trouver un fumigène pour lui faire signe */
const PAROLES_SURVOL = [["Hé ! Ici ! On est là !", "Il ne nous voit pas… Il nous faut un fumigène pour lui faire signe ! Il doit bien y en avoir un, quelque part dans la caserne."],
  ["L'hélico ! Par ici !", "Encore raté… Sans fumigène, il ne nous verra jamais ! Cherchons partout."],
  ["Il repasse !", "Trop haut, et avec ce brouillard… Trouvons ce fumigène, vite !"]];
const PAROLES_SURVOL_GPS = [["L'hélico de Brad ! Ici !", "Il ne nous voit toujours pas… Le fumigène, vite : la balise est sur le GPS."], ["Il repasse !", "Il tourne en rond, il nous cherche… Allumons ce fumigène sur le H !"]];
/* au-dessus de nous, un toit ? (un rayon vers le ciel) — son propre rayon, qui connaît la caméra : les flammes et la fumée (des images plates) en ont besoin ; sans elle, il plantait à chaque image et tout le jeu se figeait */
function sousUnToit(moi) { try { const p = moi.g.position, r = M.rayToit || (M.rayToit = new THREE.Raycaster()); r.camera = M.camera; r.set(new THREE.Vector3(p.x, p.y + 2.2, p.z), new THREE.Vector3(0, 1, 0)); r.near = 0; r.far = 40;
  return r.intersectObjects(M.scene.children, true).some(h => h.object.isMesh && !h.object.isSprite && h.object.visible && !h.object.userData.perso && h.face && !(h.object.material && h.object.material.transparent)); } catch (e) { return false; } }
function survolApo(moi, now) { return;   /* (plus d'hélicoptère qui patrouille pendant la partie : seulement au début, et à la fin) */
  if (!M.survolT || now < M.survolT || M.bradEnCours || M.cine || M.evac || APO.zombieFin || !M.L.apo || M.L.sh || M.L.interieur || (M.fumi && M.fumi.trouve) || moi.info.mortT) return;
  M.survolT = now + 5000; if (sousUnToit(moi)) return;   /* (à l'abri — un porche, une voûte — on ne le verrait pas : il passera plus tard) */
  const p = moi.g.position; if ([...(M.zomb || new Map()).values()].some(z => !z.mortT && Math.hypot(z.x - p.x, z.z - p.z) < 9)) { M.survolT = now + 4000; return; }   // (pas au milieu d'une attaque)
  M.survolT = now + 150000 + Math.random() * 60000; { const P = M.gps ? PAROLES_SURVOL_GPS : PAROLES_SURVOL; cineSurvol(moi, P[Math.min(M.survolN || 0, P.length - 1) % P.length]); } M.survolN = (M.survolN || 0) + 1;
}
function cineSurvol(moi, [cri, reponse]) {
  const sc = M.scene, cam = M.camera, p = moi.g.position; placerCamera(true); cam.updateMatrixWorld(); const camP = cam.position.clone(), Z = M.L.zone || [-30, 30, -60, 10];
  /* on regarde vers le côté le plus ouvert (dans la cour, au fond près de la déchetterie, le mur bouchait tout le ciel) */
  let dir = cam.getWorldDirection(new THREE.Vector3()).setY(0).normalize(), best = 0;
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, dx = Math.sin(a), dz = Math.cos(a); let r = 0; while (r < 45 && M.L.limites(p.x + dx * (r + .5), p.z + dz * (r + .5))) r += .5;   // (là où le sol est libre le plus loin : le ciel y est dégagé)
    if (r > best + .5) { best = r; dir = new THREE.Vector3(dx, 0, dz); } }
  const oeil = p.clone().setY(p.y + 1.55).addScaledVector(dir, -.3);   // (à hauteur des yeux : on lève la tête)
  const D = p.clone().addScaledVector(dir, 90).setY(p.y + 26), F = p.clone().addScaledVector(dir, -45).setY(p.y + 24), hel = creerHelico(); sc.add(hel);
  { const geo = new THREE.ConeGeometry(1, 1, 24, 1, true); geo.translate(0, -.5, 0); const cone = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xdfe8ff, map: texFaisceau(), transparent: true, opacity: .4, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
    cone.scale.set(4, 30, 4); cone.rotation.z = .35; cone.position.y = .6; hel.add(cone); hel.userData.cone = cone;
    const tache = new THREE.Mesh(new THREE.CircleGeometry(2.4, 32), new THREE.MeshBasicMaterial({ color: 0xeef3ff, transparent: true, opacity: .55, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); tache.rotation.x = -Math.PI / 2; sc.add(tache); hel.userData.tache = tache; }   // (son projecteur fouille le sol, devant lui… mais pas là où nous sommes)
  // (il arrive de face, son projecteur fouille la cour devant nous, puis il passe au-dessus de nos têtes… sans nous voir)
  hel.rotation.y = Math.atan2(dir.z, -dir.x);   // (le nez vers +x : tourné dans le sens du vol, vers nous)
  const helA = sonHelico(12);
  const eq = (M.equipe || []).map((e, k) => !e.mort && M.gens.get(EQUIPIER(k))).find(Boolean), autre = eq ? eq.info.numero : M.moiNum;
  const haut = p.clone().addScaledVector(dir, 20).setY(p.y + 19), vise = cam.position.clone().add(cam.getWorldDirection(new THREE.Vector3()).multiplyScalar(6)), vise0 = vise.clone(), t0 = performance.now(); let fini = false, dit = 0, prec = t0, clk = 0;
  const fin = () => { if (fini || !M) return; fini = true; moi.g.visible = true; sc.remove(hel); sc.remove(hel.userData.tache); try { helA.pause(); } catch (e) {} sonsCourts.delete(helA); finCine(); placerCamera(true); };
  M.passerBtn = boutonPasser(fin);
  M.cine = { t0, gel: true, nettoyer: () => { if (fini) return; fini = true; moi.g.visible = true; sc.remove(hel); sc.remove(hel.userData.tache); try { helA.pause(); } catch (e) {} sonsCourts.delete(helA); }, maj: (now) => { if (fini) return; const dt = Math.min(.05, Math.max(0, now - prec) / 1000); clk += dt * (M.vite || 1); prec = now; const u = clk; M.cine.u = u; const k = Math.min(1, u / 11);
    hel.position.lerpVectors(D, F, Math.max(0, (u - .5) / 10.5)); const cn = hel.userData.cone, ta = hel.userData.tache; cn.visible = ta.visible = hel.position.clone().sub(p).dot(dir) > 3;   /* (le faisceau, une fois qu'il est passé devant : pas dans l'objectif) */
    cn.rotation.z = .35 + Math.sin(u * 1.1) * .3; cn.rotation.x = .3 + Math.sin(u * .7 + 1) * .35;   /* (le projecteur balaie le sol : il cherche des survivants… à côté de nous) */
    cn.scale.y = 30; hel.updateMatrixWorld(true); const bout = cn.localToWorld(new THREE.Vector3(0, -1, 0)), o0 = cn.localToWorld(new THREE.Vector3(0, 0, 0)), dv = bout.clone().sub(o0), kk = dv.y < -.01 ? (p.y + .06 - o0.y) / dv.y : 1;
    ta.position.copy(o0).addScaledVector(dv, kk); ta.position.y = p.y + .06; cn.scale.y = 30 * Math.max(.2, kk); hel.rotation.z = .08; hel.userData.rotor.rotation.y += dt * 9.5; hel.userData.rotorQ.rotation.z += dt * 40; hel.userData.feu.visible = Math.floor(now / 450) % 2 === 0;
    helA.volume = Math.max(0, Math.min(.8, 1 - Math.abs(k - .5) * 2.2)) * .9;
    // on lève les yeux : la caméra, près de soi, suit l'hélico qui passe, haut dans le ciel
    const devant = hel.position.clone().sub(p).dot(dir);
    moi.g.visible = u > 8;   // (à hauteur de ses yeux, on ne voit pas sa propre tête)
    cam.position.lerp(u > 8 ? camP : oeil, u > 8 ? .07 : .12); if (u > 8) vise.lerp(vise0, .07); else if (u > .8) vise.lerp(devant > 12 ? hel.position.clone().lerp(haut, .5) : haut, .04); cam.lookAt(vise);   // (on lève les yeux vers le ciel, puis, quand l'équipier parle, on revient sur nous)
    if (u > 3.2 && dit === 0) { dit = 1; dire(M.moiNum, cri); }
    if (u > 8.2 && dit === 1) { dit = 2; dire(autre, reponse); }
    if (u > 13.5) fin(); } };
}
// le bandeau de l'objectif, toujours affiché en haut pendant la partie : où chercher, où aller
function surFumi(m) {
  const avant = M.fumi; M.fumi = m; if (!M.ctx.surInfo) return;
  if (m.trouve && !M.musEvac) { M.musEvac = new Audio("sons/re-evil-eye.mp3"); M.musEvac.preload = "auto"; M.musEvac.load(); }   // (prête à partir)
  if (m.trouve && !(avant && avant.trouve) && M.L && M.L.apo && moiApo()) { const eq = equipierVivant(), moiT = Number(m.par) === Number(M.moiNum);
    setTimeout(() => M && dire(M.moiNum, moiT ? "Un fumigène ! On a enfin de quoi se faire repérer par l'hélico !" : "Ils ont trouvé un fumigène ! On a ce qu'il faut pour se faire repérer !"), 500);
    if (eq) setTimeout(() => M && M.gens.get(eq.info.numero) && dire(eq.info.numero, "Parfait ! Vite, sur la terrasse : on l'allume au centre du H, il ne pourra pas le rater !"), 3700); }
  if (m.trouve && !(avant && avant.trouve)) M.ctx.surInfo(Number(m.par) === Number(M.moiNum) ? "🧨 Tu as le fumigène ! Va vite sur la terrasse de la grande cour : au centre du H, le cercle rouge." : `🧨 ${esc(m.nom || "Quelqu'un")} a trouvé le fumigène ! Tous sur la terrasse de la grande cour, au cercle rouge !`);
}
// l'hélicoptère du S.T.A.R.S. (d'après la planche : AgustaWestland AW139 modifié, vert olive, « S.T.A.R.S. », « ST-01 ») ; le nez vers +x, la baie de troupes ouverte côté +z
/* l'hélicoptère et l'héliport en vraie 3D (des modèles) : chargés une fois ; en attendant, l'ancien dessin reste visible */
/* le décor de la caserne : des blocs de climatisation (sur quelques balcons de la cour d'honneur, sous quelques fenêtres des façades),
   et de grands conteneurs à ordures contre le local poubelle, dans la ruelle */
function creerHelico() { const g = creerHelicoDessin(), U = g.userData, dessin = new Set(g.children);   /* (le dessin de remplacement : seul lui s'efface quand le vrai modèle arrive — pas le projecteur, ni les feux) */
  /* les feux de l'appareil, comme sur un vrai : rouge à gauche, vert à droite (fixes), un éclat blanc sous le ventre et un gyrophare rouge sur le dos, qui clignotent */
  { const feuNav = (x, y, z, coul, taille, eclat) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: lueurGB(), color: new THREE.Color(coul).multiplyScalar(QUALITE !== "bas" ? 2.2 : 1.3), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
      sp.scale.setScalar(taille); sp.position.set(x, y, z); g.add(sp); if (eclat) sp.onBeforeRender = () => { const t = performance.now() % eclat[0]; sp.material.opacity = t < eclat[1] || (eclat[2] && t > eclat[2] && t < eclat[2] + eclat[1]) ? 1 : 0; }; return sp; };
    feuNav(1.1, 1.25, -1.05, 0xff2a1a, 1.8); feuNav(1.1, 1.25, 1.05, 0x2aff5a, 1.8);
    feuNav(0, .35, 0, 0xffffff, 4.5, [1100, 90, 220]); feuNav(-.4, 3.25, 0, 0xff2010, 3.6, [900, 200]); feuNav(-8.6, 2.4, 0, 0xffffff, 3.0, [1100, 90]);
    feuNav(2.6, .55, 0, 0xf2f6ff, 5.5); }   /* (la lampe du projecteur, sous le nez : toujours allumée — on le repère dans la nuit) */
  chargerGLB("avatars/re-helico.glb?v=2").then(sc => { if (!sc) return; const garder = new Set([U.rotor, U.rotorQ, U.feu]);
    for (const o of [...g.children]) if (dessin.has(o) && !garder.has(o)) o.visible = false; U.rotorQ.visible = false; for (const o of [...U.rotor.children]) o.visible = false;
    // (le modèle : le nez vers −x, 12 m de long, en centimètres ; le nôtre a le nez vers +x et son moyeu en (0,1 ; 3,42))
    const m = sc.clone(), corps = m.getObjectByName("corps"), rot = m.getObjectByName("rotor"), k = .01;
    const P = new THREE.Group(); P.rotation.y = Math.PI; P.scale.setScalar(k); P.position.set(.1 + .83, .93, 0); g.add(P); if (corps) P.add(corps);
    if (rot) { rot.position.set(0, 0, 0); const R = new THREE.Group(); R.rotation.y = Math.PI; R.scale.setScalar(k); R.add(rot); U.rotor.add(R); U.rotor.position.set(.1, .93 + 3.36, 0);
      const flou = new THREE.Mesh(new THREE.CircleGeometry(6.9, 40), new THREE.MeshBasicMaterial({ color: 0x1a1a1a, transparent: true, opacity: .16, depthWrite: false, side: THREE.DoubleSide })); flou.rotation.x = -Math.PI / 2; flou.position.y = .05; U.rotor.add(flou); }   // (le disque flou des pales qui tournent : à pleine vitesse, l'œil ne voit pas chaque pale)
    U.feu.position.set(-8.3, 4.05, 0); g.traverse(o => { if (o.isMesh) o.castShadow = true; }); });
  return g; }
function creerHelicoDessin() {
  const g = new THREE.Group(), M_ = (o) => new THREE.MeshStandardMaterial(o);
  const vert = M_({ color: 0x55653f, roughness: .5, metalness: .25, emissive: 0x1e2616, emissiveIntensity: .9 }), vertF = M_({ color: 0x3e4b2e, roughness: .55, metalness: .2, emissive: 0x141a0e, emissiveIntensity: .9 });
  const noir = M_({ color: 0x121212, roughness: .5 }), vitre = M_({ color: 0x1a2630, roughness: .08, metalness: .8, emissive: 0x050a10 }), gris = M_({ color: 0xc8c8c4, roughness: .4, metalness: .3, emissive: 0x222222 }), jaune = M_({ color: 0xe0b020, emissive: 0x403000 });
  const ad = (geo, m, x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1, par = g) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); o.scale.set(sx, sy, sz); o.castShadow = true; par.add(o); return o; };
  // la cabine (arrondie), le nez, le pare-brise
  ad(new THREE.CapsuleGeometry(.95, 4.2, 8, 20), vert, 0, 1.55, 0, 0, 0, Math.PI / 2, 1, 1, 1.08);
  ad(new THREE.SphereGeometry(1, 22, 14), vert, 2.95, 1.3, 0, 0, 0, -.12, 1.55, .72, .82);
  ad(new THREE.SphereGeometry(1, 22, 14), vitre, 2.35, 1.95, 0, 0, 0, -.2, 1.15, .52, .86);
  // le carénage des moteurs, les tuyères
  ad(new THREE.CapsuleGeometry(.5, 2.2, 6, 14), vert, -.3, 2.62, 0, 0, 0, Math.PI / 2, 1, .9, 1.25);
  for (const s of [-1, 1]) { ad(new THREE.CylinderGeometry(.2, .24, .45, 12), noir, -1.75, 2.7, s * .5, 0, 0, Math.PI / 2); ad(new THREE.SphereGeometry(.28, 10, 8), vertF, 1.2, 2.55, s * .55); }
  // la poutre de queue, la dérive, le stabilisateur, le rotor de queue
  ad(new THREE.CylinderGeometry(.28, .58, 5, 14), vert, -4.7, 1.9, 0, 0, 0, Math.PI / 2);
  const fin = new THREE.Shape(); fin.moveTo(0, 0); fin.lineTo(1.1, 0); fin.lineTo(.35, 2.1); fin.lineTo(-.35, 2.1); fin.closePath();
  ad(new THREE.ExtrudeGeometry(fin, { depth: .16, bevelEnabled: false }), vert, -7.7, 1.85, -.08, 0, Math.PI, 0);
  ad(new THREE.BoxGeometry(.8, .06, 2.7), vert, -6.6, 2.05, 0); for (const s of [-1, 1]) ad(new THREE.BoxGeometry(.55, .45, .05), vert, -6.6, 2.1, s * 1.35);
  const rotorQ = new THREE.Group(); rotorQ.position.set(-8.05, 3.25, -.22); g.add(rotorQ);
  for (let i = 0; i < 4; i++) { const b = new THREE.Group(); b.rotation.z = i * Math.PI / 2; rotorQ.add(b); ad(new THREE.BoxGeometry(.7, .13, .03), gris, .38, 0, 0, 0, 0, 0, 1, 1, 1, b); ad(new THREE.BoxGeometry(.14, .13, .032), M_({ color: 0xb02020, emissive: 0x300000 }), .62, 0, 0, 0, 0, 0, 1, 1, 1, b); }
  ad(new THREE.SphereGeometry(.1, 8, 6), noir, -8.05, 3.25, -.2);
  // le rotor principal : cinq pales, bouts jaunes
  ad(new THREE.CylinderGeometry(.13, .16, .5, 10), noir, .1, 3.15, 0); ad(new THREE.SphereGeometry(.26, 12, 8), noir, .1, 3.42, 0, 0, 0, 0, 1, .6, 1);
  const rotor = new THREE.Group(); rotor.position.set(.1, 3.42, 0); g.add(rotor);
  for (let i = 0; i < 5; i++) { const b = new THREE.Group(); b.rotation.y = i * Math.PI * 2 / 5; rotor.add(b); ad(new THREE.BoxGeometry(5.9, .05, .34), noir, 3.1, 0, 0, 0, 0, 0, 1, 1, 1, b); ad(new THREE.BoxGeometry(.35, .055, .345), jaune, 5.9, 0, 0, 0, 0, 0, 1, 1, 1, b); }
  // les sponsons, les roues (trois trains), les points d'attache
  for (const s of [-1, 1]) { ad(new THREE.CapsuleGeometry(.24, 1.3, 6, 10), vertF, -.5, .95, s * 1.15, 0, 0, Math.PI / 2);
    ad(new THREE.CylinderGeometry(.3, .3, .2, 16), noir, -.6, .3, s * 1.32, Math.PI / 2); ad(new THREE.BoxGeometry(.08, .55, .08), noir, -.6, .62, s * 1.22); }
  ad(new THREE.CylinderGeometry(.22, .22, .16, 14), noir, 2.6, .22, 0, Math.PI / 2); ad(new THREE.BoxGeometry(.07, .7, .07), noir, 2.6, .55, 0);
  // les vitres de la cabine, des deux côtés ; la baie de troupes ouverte (côté +z), la porte coulissée vers l'arrière
  const fen = new THREE.PlaneGeometry(.52, .48);
  for (const s of [-1, 1]) for (const x of s > 0 ? [-2.0, 1.15] : [-2.0, -1.2, -.4, .4, 1.15]) ad(fen, vitre, x, 1.85, s * 1.035, 0, s > 0 ? 0 : Math.PI);
  ad(new THREE.PlaneGeometry(1.7, 1.3), M_({ color: 0x0a0a0a, emissive: 0x0a0806 }), -.35, 1.55, 1.04);
  ad(new THREE.BoxGeometry(1.6, 1.25, .05), vert, -2.05, 1.6, 1.1);
  // les inscriptions (« S.T.A.R.S. », « ST-01 ») et l'écusson sur la dérive
  const deco = (w, h, f) => new THREE.MeshStandardMaterial({ map: tex(toile(w, h, f)), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, roughness: .6, emissive: 0x222018, emissiveMap: null });
  const stars = deco(512, 160, (x, w, h) => { x.fillStyle = "#e2d8a8"; x.font = "bold 96px Arial Black, Arial, sans-serif"; x.textAlign = "center"; x.fillText("S.T.A.R.S.", w / 2, 98); x.font = "bold 26px Arial"; x.fillText("R.P.D. · MOUNTAIN DIVISION", w / 2, 142); });
  const st01 = deco(256, 96, (x, w, h) => { x.fillStyle = "#e2d8a8"; x.font = "bold 70px Arial Black, Arial, sans-serif"; x.textAlign = "center"; x.fillText("ST-01", w / 2, 72); });
  const logo = deco(128, 128, (x) => { x.fillStyle = "#1b2a44"; x.beginPath(); x.arc(64, 64, 58, 0, 7); x.fill(); x.strokeStyle = "#d8cfa0"; x.lineWidth = 6; x.stroke();
    x.fillStyle = "#e0b020"; x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 18 : 40; x.lineTo(64 + Math.cos(a) * r, 64 + Math.sin(a) * r); } x.closePath(); x.fill(); });
  for (const s of [-1, 1]) { const ry = s > 0 ? 0 : Math.PI;
    ad(new THREE.PlaneGeometry(2.3, .72), stars, -3.4, 1.98, s * .55, 0, ry);   // sur la poutre de queue (son flanc)
    ad(new THREE.PlaneGeometry(1.0, .38), st01, s > 0 ? .7 : .2, 1.12, s * 1.06, 0, ry);
    ad(new THREE.PlaneGeometry(.55, .55), logo, -7.35, 2.95, s * .1, 0, ry); }
  ad(new THREE.PlaneGeometry(1.6, .5), stars, -.3, 2.98, 0, -Math.PI / 2, 0, -Math.PI / 2);   // (sur le toit)
  // le feu rouge qui clignote en haut de la dérive
  const feu = ad(new THREE.SphereGeometry(.1, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff2020, fog: false }), -7.95, 3.95, 0);
  g.userData = { rotor, rotorQ, feu }; return g; }
// la fin de la partie : un carton noir, puis retour dans la vraie caserne
function finPartieApo(titre, texte) {
  const d = voile("background:#000;opacity:0;transition:opacity 1.2s;display:grid;place-items:center;text-align:center;color:#fff;font:700 18px 'Lato',sans-serif");
  if (!d) return; d.innerHTML = `<div><div style="font:900 40px Impact,'Arial Black',sans-serif;letter-spacing:2px;color:#ffcf3a">${titre}</div><div style="margin-top:14px;line-height:1.5;padding:0 18px">${texte}</div><div style="margin-top:18px;font:900 26px Impact,'Arial Black',sans-serif;color:#ff5a4a">FIN DE LA PARTIE</div></div>`;
  requestAnimationFrame(() => { d.style.opacity = "1"; });
  setTimeout(() => { d.remove(); retourCaserneApo(); }, 6500); }
function retourCaserneApo() { if (!M || !estApo(M.lieu)) return; M.evac = false; M.fumi = null; APO.zombieFin = 0; APO.vies = 4; APO.balles = 9; M.ctx.surApoMort && M.ctx.surApoMort(false); changerLieu("grande", [-6.4, -38.5], Math.PI / 2); }
function surEvac(m) {
  if (!M || M.evac) return; M.fumi = null; if (M.fumiObj) { M.scene.remove(M.fumiObj); M.fumiObj = null; }
  if (M.lieu !== "z-grande" || !M.L.heliport) { M.evac = true; M.ctx.surInfo && M.ctx.surInfo("🚁 L'hélicoptère a décollé de la terrasse… sans toi !"); setTimeout(() => { if (M && estApo(M.lieu)) finPartieApo("TROP TARD…", "L'hélicoptère est parti sans toi. La caserne n'a pas tenu."); }, 6000); return; }
  cineEvac(m);
}
/* les immeubles de Paris autour de la caserne (pour la vue du ciel) : les mêmes façades que rue Poissonnière (pierre de taille, balcons filants, fenêtres
   allumées la nuit), coiffées de toits mansardés en zinc et de cheminées ; çà et là un incendie, et des gyrophares bleus et rouges dans les rues : le chaos.
   Quelques maillages en tout (très léger), posés seulement pendant l'évacuation */
let parisVariantes = null;
function parisAutour(sc) { const g = new THREE.Group(); sc.add(g); const SW = 14, PR = 12;   // (un immeuble : 14 m de façade, 12 m de profondeur)
  parisVariantes = parisVariantes || [[5, 0], [6, .3], [7, .1], [6, .6]].map(([n, t], k) => { const H = 4.2 + n * 3.1 + .6, nu = tex(toileImmeuble(SW, n, t, k + 3));
    return { H, mat: new THREE.MeshLambertMaterial({ map: nu, emissive: 0xffffff, emissiveMap: nu, emissiveIntensity: .5 }) }; });   /* (la pierre de taille, claire, comme vue du ciel) */
  const zinc = new THREE.MeshLambertMaterial({ color: 0x9aa2ab, emissive: 0x30353b }), dessus = new THREE.MeshLambertMaterial({ color: 0x7d868f, emissive: 0x272b30 }), pot = new THREE.MeshLambertMaterial({ color: 0xb8582f, emissive: 0x3a160a }),
    sol = new THREE.MeshBasicMaterial({ color: 0x1d1d20 }), cour = new THREE.MeshBasicMaterial({ color: 0x141416 });
  // les îlots : un anneau d'immeubles autour d'une cour ; des rues étroites entre eux ; pas sur la caserne ni sur ses rues
  const segs = [[], [], [], []], ilots = [], V = (x, y, z) => new THREE.Vector3(x, y, z), qy = a => new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), a), mt = new THREE.Matrix4();
  /* collés à la caserne, de l'autre côté de rues étroites (10 m) : la caserne va de x −35 à 38, de z −142 à 30 ; derrière, la barre de brique */
  const XI = [[-215, -159], [-147, -91], [-79, -45], [-35, 38], [48, 84], [94, 150], [160, 216]], ZI = [[-330, -262], [-252, -196], [-186, -152], [-142, -60], [-50, 30], [40, 76], [86, 150], [160, 216]];
  for (const [x0, x1] of XI) for (const [z0, z1] of ZI) { const mx = x0 === -35, mz = z0 >= -142 && z1 <= 30; if (mx && (mz || z0 === -186)) continue;   // (la caserne, et la barre de brique derrière)
    const lx = x1 - x0, lz = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2; ilots.push([cx, cz]);
    const pose = (x, z, rot, w) => { const k = Math.floor(Math.random() * 4); segs[k].push([x, z, rot, parisVariantes[k].H, w]); };
    { const n = Math.max(1, Math.round(lx / 14)), w = lx / n; for (let i = 0; i < n; i++) { pose(x0 + w * (i + .5), z0 + PR / 2, 0, w); pose(x0 + w * (i + .5), z1 - PR / 2, Math.PI, w); } }   // (les deux côtés sur x)
    const lc = lz - 2 * PR; if (lc > 4) { const n = Math.max(1, Math.round(lc / 14)), w = lc / n; for (let j = 0; j < n; j++) { const z = z0 + PR + w * (j + .5); pose(x0 + Math.min(PR, lx / 2) / 2, z, Math.PI / 2, w); if (lx > PR * 1.5) pose(x1 - PR / 2, z, -Math.PI / 2, w); } }   // (les deux côtés sur z)
    if (lx > 2 * PR + 2 && lz > 2 * PR + 2) { const c = new THREE.Mesh(new THREE.PlaneGeometry(lx - 2 * PR, lz - 2 * PR), cour); c.rotation.x = -Math.PI / 2; c.position.set(cx, .02, cz); g.add(c); } }
  const tous = [], murs = []; parisVariantes.forEach((v, k) => { const L = segs[k]; if (!L.length) return; const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), [v.mat, v.mat, dessus, dessus, v.mat, v.mat], L.length);
    L.forEach(([x, z, r, , w], i) => { im.setMatrixAt(i, mt.compose(V(x, v.H / 2, z), qy(r), V(w + .02, v.H, PR))); murs.push([im, i]); }); g.add(im); tous.push(...L); });
  // les toits mansardés en zinc (le brisis en pente raide, le terrasson presque plat), et leurs cheminées aux pots de terre cuite
  const toits = new THREE.InstancedMesh(new THREE.CylinderGeometry(.42, .707, 1, 4, 1).rotateY(Math.PI / 4), zinc, tous.length); tous.forEach(([x, z, r, H, w], i) => toits.setMatrixAt(i, mt.compose(V(x, H + 1.6, z), qy(r), V(w + .02, 3.2, PR)))); g.add(toits);
  const chem = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), pot, tous.length * 2); tous.forEach(([x, z, r, H], i) => { for (const d of [-4, 4]) { const ox = Math.cos(r) * d, oz = -Math.sin(r) * d; chem.setMatrixAt(i * 2 + (d > 0 ? 1 : 0), mt.compose(V(x + ox, H + 3.6, z + oz), qy(r), V(1.6, 1.8, .6))); } }); g.add(chem);
  // derrière la caserne : la grande barre de brique rouge, ses toits de tuiles
  const barres = []; { const brq = new THREE.MeshLambertMaterial({ map: tex(toileBriqueBandes(60, 30)), emissive: 0x6a2a1c, emissiveIntensity: .5 }), tuile = new THREE.MeshLambertMaterial({ color: 0xb8452a, emissive: 0x3e1408 });
    for (const [x, z, lx, lz, h] of [[-4, -160, 52, 14, 27], [4, -176, 44, 14, 30]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(lx, h, lz), [brq, brq, tuile, tuile, brq, brq]); b.position.set(x, h / 2, z); g.add(b);
      const t = new THREE.Mesh(new THREE.CylinderGeometry(.42, .707, 1, 4, 1).rotateY(Math.PI / 4), tuile); t.scale.set(lx, 3, lz); t.position.set(x, h + 1.5, z); g.add(t); barres.push([b, t, x, z, h]); } }
  const s = new THREE.Mesh(new THREE.PlaneGeometry(700, 700), sol); s.rotation.x = -Math.PI / 2; s.position.set(0, -.08, -60); g.add(s);
  const blocs = ilots.map(([x, z]) => [x, z, 0, parisVariantes[1].H]);
  // des incendies, çà et là (sur des toits, dans des rues), avec leur fumée
  const pres = [...blocs].sort((a, b) => Math.hypot(a[0], a[1] + 55) - Math.hypot(b[0], b[1] + 55)).slice(0, 28), unPres = () => pres[Math.floor(Math.random() * pres.length)];   // (les îlots qu'on voit du ciel)
  const feux = [], fum = []; for (let i = 0; i < 12; i++) { const b = unPres(), rue = i % 3 === 0, x = b[0] + (rue ? 34 : (Math.random() < .5 ? -1 : 1) * 22), z = b[1] + (rue ? (Math.random() - .5) * 30 : (Math.random() - .5) * 40), y = rue ? 0 : b[3] + 3;
    for (let k = 0; k < 3; k++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: texFlammes[k], transparent: true, depthWrite: false })); sp.center.set(.5, .1); sp.position.set(x + (k - 1) * 3, y, z + (Math.random() - .5) * 3); const h = 12 + Math.random() * 8; sp.scale.set(h * .75, h, 1); g.add(sp); feux.push([sp, k + i]); }
    const f = new THREE.Sprite(new THREE.SpriteMaterial({ map: texFumee, transparent: true, depthWrite: false, opacity: .7 })); f.position.set(x, y + 22, z); f.scale.setScalar(26); g.add(f); fum.push([f, Math.random() * 7, y]); }
  // les gyrophares : des voitures de police arrêtées dans les rues, leurs feux bleu et rouge qui tournent
  const giro = [], halo = tex(toile(64, 64, c => { const r = c.createRadialGradient(32, 32, 0, 32, 32, 31); r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(.25, "rgba(255,255,255,.6)"); r.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = r; c.fillRect(0, 0, 64, 64); }));
  const carros = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial({ color: 0xd8dade, emissive: 0x30343a }), 12);
  for (let i = 0; i < 12; i++) { const b = unPres(), ax = Math.random() < .5, x = b[0] + (ax ? 34 : (Math.random() - .5) * 40), z = b[1] + (ax ? (Math.random() - .5) * 50 : 41);
    carros.setMatrixAt(i, mt.compose(V(x, .7, z), new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), ax ? 0 : Math.PI / 2), V(1.8, 1.4, 4.4)));
    for (const [c, d] of [[0x2050ff, -.45], [0xff1a1a, .45]]) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: halo, color: c, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); sp.position.set(x + (ax ? d : 0), 1.7, z + (ax ? 0 : d)); sp.scale.setScalar(11); g.add(sp); giro.push([sp, Math.random() * 6, d > 0]); } }
  g.add(carros);
  /* le souffle de l'explosion : il part de la caserne et rase le quartier, immeuble après immeuble (ils s'affaissent sur eux-mêmes) */
  const chute = new Map(); let majChute = 0;
  g.userData.ilots = ilots; g.userData.souffle = (cx, cz, R, now) => { tous.forEach(([x, z], i) => { if (!chute.has(i) && Math.hypot(x - cx, z - cz) < R) chute.set(i, now + Math.random() * 400); });
    for (const B of barres) if (!B.t && Math.hypot(B[2] - cx, B[3] - cz) < R + 20) B.t = now; };
  const affaisser = now => { if (now - majChute < 90) return; majChute = now; let ch = false;
    chute.forEach((t0, i) => { const f = Math.max(.22, 1 - Math.max(0, now - t0) / 1600), [x, z, r, H, w] = tous[i], [im, j] = murs[i]; if (f === .22 && t0 < 0) return; if (f === .22) chute.set(i, -1);
      im.setMatrixAt(j, mt.compose(V(x, H * f / 2, z), qy(r), V(w + .02, H * f, PR))); im.instanceMatrix.needsUpdate = true;
      toits.setMatrixAt(i, mt.compose(V(x, H * f + 1.6 * f, z), qy(r), V(w + .02, 3.2 * f, PR))); for (const d of [-4, 4]) chem.setMatrixAt(i * 2 + (d > 0 ? 1 : 0), mt.compose(V(x, -10, z), qy(r), V(.01, .01, .01))); ch = true; });
    if (ch) { toits.instanceMatrix.needsUpdate = true; chem.instanceMatrix.needsUpdate = true; }
    for (const B of barres) if (B.t) { const f = Math.max(.25, 1 - (now - B.t) / 1800); B[0].scale.y = f; B[0].position.y = B[4] * f / 2; B[1].position.y = B[4] * f + 1.5 * f; B[1].scale.y = 3 * f; } };
  g.userData.maj = now => { if (chute.size || barres.some(B => B.t)) affaisser(now); for (const [sp, k] of feux) sp.material.map = texFlammes[(Math.floor(now / 80) + k) % 8];
    for (const [f, a, y] of fum) { const t = (now / 1000 + a) % 7; f.position.y = y + 18 + t * 4; f.material.opacity = .7 * (1 - t / 7); f.scale.setScalar(22 + t * 5); }
    for (const [sp, a, rouge] of giro) { const ph = (now / 260 + a) % 2; sp.material.opacity = (rouge ? ph >= 1 : ph < 1) ? 1 : .08; } };
  return g; }
function cineEvac(m) {
  if (M.cine && M.cine.nettoyer) { try { M.cine.nettoyer(); } catch (e) {} } if (M.cine) finCine();   /* (l'intro ou le survol en cours s'effacent proprement : l'évacuation prend la main) */
  const sc = M.scene, Hp = M.L.heliport, H = new THREE.Vector3(Hp.x, Hp.y, Hp.z); M.evac = true; if (M.tyran && M.tyran.g && M.tyran.g.parent && Math.hypot(M.tyran.x - H.x, M.tyran.z - H.z) < 5) M.tyran.g.parent.remove(M.tyran.g);   /* (son corps reste, sauf s'il gît sur le H, là où l'hélicoptère se pose) */
  for (const z of (M.zomb || new Map()).values()) z.g.visible = false; for (const l of M.lickers || []) l.g.visible = false;
  const moi = M.gens.get(M.moiNum);
  const vivant = p => !p.info.mortT && (p.moi ? !APO.zombieFin : (!p.info.pnj || p.info.equipier)) && !(p.info.equipier && Number(p.info.proprio) === Number(M.moiNum) && (M.equipe || [])[p.info.slot] && M.equipe[p.info.slot].mort);
  const vivants = [...M.gens.values()].filter(vivant), noms = vivants.map(p => esc(p.info.nom || "?"));
  // ceux qui sont loin sont déjà là, dans la fumée, autour du H
  // ceux qui sont loin sont déjà là, dans la fumée ; ceux qui sont sur le H s'en écartent d'eux-mêmes : tous attendent devant la porte, à distance des pales
  vivants.forEach((p, i) => { const q = p.g.position, ax = H.x - .35 + ((i % 4) - 1.5) * 1.3, az = H.z + 5.6 + Math.floor(i / 4) * .9; p.chemin = [];
    if (Math.hypot(q.x - H.x, q.z - H.z) > 9 || Math.abs(q.y - H.y) > 1) { q.set(ax, H.y, az); p.cible = null; } else p.cible = new THREE.Vector3(ax, q.y, az); });
  if (Hp.cercle) Hp.cercle.visible = false;
  const paris = parisAutour(sc); paris.visible = false;   /* (vus du ciel : les immeubles de Paris, tout autour de la caserne) */
  // les héros encore en vie, que personne n'a choisis : ils accourent vers l'hélicoptère, des zombies à leurs trousses
  const renf = [], renfZ = []; let dirS = null, proie = null;   /* (proie : le second renfort — un zombie le rattrape par derrière, il tombe, ils le dévorent) */
  const lancerRenforts = () => { const L = M.L, used = new Set([M.perso, ...(M.equipe || []).map(e => e.id), M.toitId, M.barId].map(Number)), ids = [21, 26, 24, 22, 23, 25].filter(h => HEROS[h] && !used.has(h)).slice(0, 2); if (!ids.length) return;
    let sp = null; for (const r of [17, 15, 13, 11, 9]) { for (let k = 0; k < 24 && !sp; k++) { const a = k / 24 * Math.PI * 2, x = H.x + Math.cos(a) * r, z = H.z + Math.sin(a) * r;
        if (L.limites(x, z) && Math.abs(hNiv(L, x, z, H.y) - H.y) < .3 && ligneLibre(L, x, z, H.x, H.z)) sp = [x, z]; } if (sp) break; }
    if (!sp) return; dirS = new THREE.Vector3(sp[0] - H.x, 0, sp[1] - H.z).normalize(); const cote = new THREE.Vector3(dirS.z, 0, -dirS.x);
    { const mx = (sp[0] + H.x) / 2, mz = (sp[1] + H.z) / 2; for (const r of [4.5, 3.5, 2.6]) { for (const sg of [1, -1]) { const x = mx + cote.x * r * sg, z = mz + cote.z * r * sg; if (!c.vueR && L.limites(x, z) && ligneLibre(L, x, z, sp[0], sp[1])) c.vueR = new THREE.Vector3(x, H.y + 1.7, z); } } }   /* (la caméra : sur le côté, à mi-chemin — loin de l'hélicoptère qui descend : rien ne cache leur course) */
    ids.forEach((id, i) => { const num = -490 - 22 - i, x = sp[0] + cote.x * (i - .5) * 1.1, z = sp[1] + cote.z * (i - .5) * 1.1; retirerAncien(num);
      const p = ajouterAncien({ ...infoEquipier(id, num, L.limites(x, z) ? x : sp[0], L.limites(x, z) ? z : sp[1], M.moiNum, 9), equipier: false }); if (!p) return; p.g.position.y = H.y; p.cineRE = true; p.rapide = true;
      const j = vivants.length; p.renfCible = new THREE.Vector3(H.x - .35 + ((j % 4) - 1.5) * 1.3, H.y, H.z + 5.6 + Math.floor(j / 4) * .9); p.cible = null; p.chemin = []; p.g.visible = false; vivants.push(p); renf.push(p); });   /* (posés dès le début, cachés : leur modèle a le temps de se charger) */
    for (let i = 0; i < 4; i++) { const q = creerZ({ id: Math.floor(Math.random() * 1e9), ty: i % 3, x: sp[0], z: sp[1], y: H.y }); q.cine = true; q.evacZ = true; q.y = H.y; q.g.visible = false; renfZ.push({ q, t: 6.7 + i * .35, x: sp[0] + cote.x * ((i % 2) - .5) * 1.4, z: sp[1] + cote.z * ((i % 2) - .5) * 1.4 }); }
    for (let i = 0; i < 3; i++) { const x = -C3.LT / 2 + .8, z = H.z + (i - 1) * 1.6, q = creerZ({ id: Math.floor(Math.random() * 1e9), ty: (i + 2) % 3, x, z, y: H.y }); q.cine = true; q.evacZ = true; q.y = H.y; q.g.visible = false; renfZ.push({ q, t: 99, x, z, gauche: true }); }   /* (et par la gauche de la terrasse : trois autres qui se jettent sur lui quand il tombe) */
  };
  const partirRenforts = () => { for (const p of renf) { p.g.visible = true; p.cible = p.renfCible; p.chemin = []; p.rapide = true; }
    if (!renf.length) return; const nm = p => esc((HEROS[p.info.heros] && HEROS[p.info.heros].court) || p.info.nom), moiN = esc(nomApo()), r1 = nm(renf[0]), r2 = renf[1] ? nm(renf[1]) : null;
    if (renf[1] && renfZ.length) { proie = { p: renf[1], elle: [21, 95].includes(Number(renf[1].info.heros)) }; const e = proie.elle;
      c.renfL = [[6.4, r1, "Attendez-nous !!! Ne partez pas sans nous !"], [7.6, moiN, `${r1} ?! ${r2} ?! Vous êtes vivants ! Courez, vite !`], [8.2, r2, "Aaah ! Ma jambe… Aidez-moi !!! Non… NOOON !"], [9.6, r1, `${r2} !!! Relève-toi !`],
        [11.0, moiN, `Ne te retourne pas, ${r1} ! On ne peut plus rien pour ${e ? "elle" : "lui"} ! Monte !`], [12.8, r1, `Ils ${e ? "la" : "le"} dévorent… J'aurais dû ${e ? "l'attendre" : "l'attendre"}…`], [14.4, moiN, "Accroche-toi. On s'en va d'ici."]]; return; }
    c.renfL = [[6.4, r1, "Attendez-nous !!! Ne partez pas sans nous !"], [7.7, moiN, r2 ? `${r1} ?! ${r2} ?! Vous êtes vivants ! Courez, vite !` : `${r1} ?! Tu es vivant ! Cours, vite !`],
      [9.5, r2 || r1, "On s'était retranchés au mess… On a vu la fumée rouge du fumigène, et on a foncé !"], [11.7, r1, "Ils étaient des dizaines derrière nous… Sans vous, on finissait comme eux."], [13.5, moiN, "Montez ! On s'en va d'ici !"]]; };
  const hel = creerHelico(); sc.add(hel); const hp0 = M.L.helicoPos, dep = hp0 ? new THREE.Vector3(hp0[0], hp0[1], hp0[2]) : new THREE.Vector3(H.x - 45, H.y + 40, H.z + 35), haut = new THREE.Vector3(H.x, H.y + 24, H.z), ry0 = hp0 ? Math.atan2(Math.sin(hp0[3]), Math.cos(hp0[3])) : .6;   /* (l'angle ramené entre −π et π : il pivotait de plusieurs tours sur lui-même avant de se poser) */ hel.position.copy(dep); hel.rotation.y = ry0;
  const fum = []; for (let i = 0; i < 34; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: texFumeeRouge(), transparent: true, depthWrite: false, opacity: 0 })); sc.add(sp); fum.push({ sp, a: Math.random() * 7, v: .5 + Math.random(), d: Math.random() * 1.2 }); }
  const explo = [], P = [[0, -50], [-12, -95], [14, -70], [0, 2], [-16, -25], [16, -118], [0, -94.6], [-14, -60]];
  const boule = (x, z, S, nF, nU, now) => { const g = new THREE.Group(); g.position.set(x, 0, z); sc.add(g); const fl = [], fu = [];   // (une boule de feu, sa fumée ; S : sa taille)
    for (let i = 0; i < nF; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: texFlammes[i % 8], transparent: true, depthWrite: false, fog: false })); sp.center.set(.5, .1); sp.position.set((Math.random() - .5) * 10 * S, 0, (Math.random() - .5) * 10 * S); g.add(sp); fl.push([sp, i, .7 + Math.random() * .6]); }
    for (let i = 0; i < nU; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: texFumee, transparent: true, depthWrite: false, fog: false })); g.add(sp); fu.push([sp, Math.random()]); }
    explo.push({ g, fl, fu, t: now, s: S }); };
  const ilotsB = paris.userData.ilots.map(([x, z]) => ({ x, z, d: Math.hypot(x, z + 55) })).filter(I => I.d < 260);   /* (les îlots qu'on voit du ciel) */
  const helA = sonHelico(8);
  // la musique (« The Mansion Explodes ») : la cinématique est calée dessus — l'hélico se pose sur le silence (10 s), la caserne explose sur le grand coup (26 s)
  const mus = M.musEvac || new Audio("sons/re-evil-eye.mp3"); M.musEvac = null; mus.currentTime = 0; mus.volume = 1; sonsCourts.add(mus);   /* (« The Evil Eye » (RE2) : elle part quand l'hélicoptère arrive au-dessus du H, et s'achève juste avant que la caserne explose) */
  sonBruit(1.4, 700, .7);   // (le fumigène éclate)
  const brouillard = sc.fog ? [sc.fog.near, sc.fog.far] : null, cam = M.camera, vise = new THREE.Vector3(), t0 = performance.now();
  let fini = false, monte = false, prec = t0, boum = 0;
  // le générique : le titre RESIDENT EVIL revient sur la caserne en flammes, puis sur fond noir, et « FIN » apparaît dessous
  const logo = document.createElement("img"); logo.src = "images/apo/re-logo.webp"; logo.alt = "Resident Evil";
  logo.style.cssText = "position:absolute;left:50%;top:44%;width:min(80%,600px);transform:translate(-50%,-50%) scale(1.25);opacity:0;z-index:9;pointer-events:none;filter:drop-shadow(0 6px 18px rgba(0,0,0,.85));transition:opacity 2.2s,transform 7s ease-out";
  const motFin = document.createElement("div"); motFin.textContent = "FIN";
  motFin.style.cssText = "position:absolute;left:0;right:0;top:calc(44% + min(17vw,130px));text-align:center;z-index:9;pointer-events:none;opacity:0;transition:opacity 2.5s;font:900 clamp(40px,11vw,80px) 'Times New Roman',Georgia,serif;letter-spacing:.4em;padding-left:.4em;color:#e01010;text-shadow:0 0 18px rgba(255,0,0,.55),0 4px 0 #4a0000";
  let noirF = null;
  const fin = () => { if (fini || !M) return; fini = true; finCine(); try { helA.pause(); mus.pause(); } catch (e) {} sonsCourts.delete(helA); sonsCourts.delete(mus); void noms;
    const n = noirF || voile("background:#000;opacity:1"); n && (n.style.opacity = "1"); logo.remove(); motFin.remove();
    if (sonFin && sonFin.volume > .02) { const s0 = sonFin, v0 = s0.volume, t0f = performance.now(), f = () => { const k = (performance.now() - t0f) / 550; s0.volume = Math.max(0, v0 * (1 - k)); if (k < 1) requestAnimationFrame(f); }; f(); }   /* (passée : elle se baisse vite, sans couper net) */
    setTimeout(() => { n && n.remove(); retourCaserneApo(); }, 600); };
  M.passerBtn = boutonPasser(fin);
  const placer = (px, py, pz, lx, ly, lz, k = .06) => { cam.position.lerp(new THREE.Vector3(px, py, pz), k); vise.lerp(new THREE.Vector3(lx, ly, lz), k); cam.lookAt(vise); };
  cam.position.set(H.x + 9, H.y + 3.5, H.z - 5); vise.set(H.x, H.y + 1, H.z);
  const c = M.cine = { t0, nettoyer: () => { fini = true; logo.remove(); motFin.remove(); noirF && noirF.remove(); sc.remove(paris); }, maj: (now) => { if (fini) return; const dt = Math.min(.05, (now - prec) / 1000);
    /* (au tout début, on attend que tout soit chargé — les survivants, l'hélicoptère —, six secondes au plus : sinon on les voyait absents, ou invisibles) */
    if (!c.pret) { c.pretT = c.pretT || now; if (!c.pretH) { c.pretH = 1; chargerGLB("avatars/re-helico.glb?v=2").then(() => { c.pretH = 2; }); } c.pret = (c.renfPrep && c.pretH === 2 && renf.every(p => p.av3)) || now - c.pretT > 6000; if (!c.pret && (c.clk || 0) > .5) { prec = now; } }
    c.clk = (c.clk || 0) + (c.pret || (c.clk || 0) < .5 ? Math.min(.1, Math.max(0, now - prec) / 1000) * (M.vite || 1) : 0); prec = now; let u = c.clk + (c.saut || 0);   /* (l'horloge de la scène n'avance qu'avec les images : sur un téléphone lent, aucun plan n'est sauté) */
    /* tout le monde est monté : le temps s'arrête là (l'hélicoptère attend sur le H) — plan sur la cour d'honneur, la horde déboule par la voûte ; puis on reprend : le décollage */
    c.enPause = false; if (c.horde && !c.pauseFin && u >= 14.95) { if (c.pauseC == null) c.pauseC = c.clk; const pu = c.clk - c.pauseC; if (pu < 4.8) { c.enPause = true; c.hu = 12.2 + pu; u = 14.95; } else { c.pauseFin = true; c.saut = -pu; u = c.clk - pu; } }
    if (!c.renfPrep) { c.renfPrep = true; lancerRenforts();
      /* la horde : le porche a sauté (le C4) — par là, des dizaines de zombies entrent en courant et remontent la cour d'honneur, entre les bâtiments R et S */
      const nH = PETIT ? 16 : 30; c.horde = []; for (let i = 0; i < nH; i++) { const x0 = (Math.random() - .5) * 2.2, q = creerZ({ id: Math.floor(Math.random() * 1e9), ty: i % 3, x: x0, z: 27.5, y: 0 }); q.cine = true; q.evacZ = true; q.forceZ3 = true; q.court = true; q.y = 0; q.g.visible = false;
        c.horde.push({ q, d: (i / nH) * 2.1 + Math.random() * .25, x: x0, tx: ((i * 7) % nH / nH - .5) * 13 + (Math.random() - .5), v: 5.2 + Math.random() * .6, monte: i % 3 === 1 });   /* (tous par la voûte, puis ils se déploient dans la cour) */ }
      /* et une seconde vague, en masse, par les marches raides en face : droit sur le H — les premiers l'atteignent quand l'hélicoptère décolle */
      const n2 = PETIT ? 12 : 22; c.horde2 = []; for (let i = 0; i < n2; i++) { const x0 = ((i * 5) % n2 / n2 - .5) * 4.6 + (Math.random() - .5) * .4, q = creerZ({ id: Math.floor(Math.random() * 1e9), ty: (i + 1) % 3, x: x0, z: -76, y: C3.hp }); q.cine = true; q.evacZ = true; q.forceZ3 = true; q.court = true; q.y = C3.hp; q.g.visible = false;
        const a = i / n2 * Math.PI * 2; c.horde2.push({ q, x: x0, d: i * .42 + Math.random() * .3, fx: H.x + Math.sin(a) * (1.4 + (i % 3) * .5), fz: H.z + 1.6 + Math.abs(Math.cos(a)) * (1.2 + (i % 4) * .45), v: 4.4 + Math.random() * .7 }); } }
    if (u > 9.8 && !c.bradVite) { c.bradVite = true; bulle(`<b style="color:#e8c46a">Brad Vickers</b> : Dépêchez-vous !!! Ils arrivent !`, 2600); }
    const vueHorde = !!c.enPause, hu = c.hu ?? 0;   /* (le plan sur la cour d'honneur : face aux bâtiments R et S, la horde qui accourt) */
    if (c.horde) for (const Hd of c.horde) { const q = Hd.q, t = hu - 11.4 - Hd.d * .8; if (!vueHorde || t < 0) { q.g.visible = false; continue; } q.g.visible = true;
      q.x = q.tx = Hd.x + (Hd.tx - Hd.x) * Math.max(0, Math.min(1, (t * Hd.v - 8) / 10)); q.z = q.tz = 21 - t * Hd.v; q.y = 0; if (q.z3) eclairer3D(q.z3.sc, .3);
      /* une voiture sur leur chemin : les uns sautent par-dessus sans ralentir, les autres grimpent dessus et courent sur le toit */
      const vt = (M.L.voitures || []).find(([a, b, c2, d]) => q.x > a - .25 && q.x < b + .25 && q.z > c2 - 1.4 && q.z < d + .4);
      if (Hd.monte) { if (vt) { const [, , c2, d] = vt, e = Math.min(q.z - (c2 - 1.4), d + .4 - q.z); q.y = Math.min(1.3, Math.max(0, e) * 1.6); } }
      else { if (vt && (Hd.sautU == null || hu - Hd.sautU > 1.2)) Hd.sautU = hu; q.saute = Hd.sautU != null && hu - Hd.sautU < .75; if (q.saute) q.y = Math.sin((hu - Hd.sautU) / .75 * Math.PI) * 1.15; } q.g.position.set(q.x, q.y || 0, q.z); }
    if (u > 6.2 && !c.renfFait) { c.renfFait = true; partirRenforts(); }
    for (const p of renf) if (p.av3 && p.g.visible) eclairer3D(p.av3.sc, .28);   /* (la nuit, sur la terrasse : on les voit courir) */
    if (proie) { const P = proie, pp = P.p.g.position;
      if (P.tombe && P.p.av3 && P.p.corps) P.p.corps.visible = false;   /* (à terre : seulement son modèle 3D — jamais, en plus, son bonhomme dessiné resté debout) */
      { const A = P.p.av3; if (P.tombe && A && A.cur === "chuteMX" && !P.cale) { P.cale = true; const a = A.act.chuteMX; a.setLoop(THREE.LoopOnce); a.clampWhenFinished = true; a.time = a.getClip().duration * .86; } }
      if (u > 7.9 && !P.tombe) { P.tombe = true; P.p.cible = null; P.p.chemin = []; P.p.chute = true;   /* (il trébuche : il s'étale en avant, les bras en avant — il n'est pas mort, il se débat) */ sonBruit(.3, 160, .8); const i = vivants.indexOf(P.p); if (i >= 0) vivants.splice(i, 1); setTimeout(() => M && P.p.g.parent && flaqueMort(P.p), 2600);   /* (en pleine course, il trébuche et s'étale de tout son long ; les zombies se jettent sur lui) */
        { const d0 = new THREE.Vector3(pp.x - cam.position.x, 0, pp.z - cam.position.z).normalize(), gx = d0.z, gz = -d0.x; let j = 0;   /* (ceux de gauche : ils surgissent à gauche de l'image, à quelques pas) */
          for (const Z of renfZ) if (Z.gauche) { let r = 5; while (r > 1.5 && !M.L.limites(pp.x + gx * r, pp.z + gz * r)) r -= .5; Z.x = pp.x + gx * r + d0.x * (j - 1) * 1.1; Z.z = pp.z + gz * r + d0.z * (j - 1) * 1.1; Z.q.x = Z.q.tx = Z.x; Z.q.z = Z.q.tz = Z.z; j++; } }
        renfZ.forEach((Z, k) => { const a = k / renfZ.length * Math.PI * 2 + .4, r = k % 2 ? .95 : .7; Z.mangeur = [pp.x + Math.sin(a) * r, pp.z + Math.cos(a) * r]; Z.t = Z.gauche ? u + .4 + k * .15 : Math.min(Z.t, u + .15 + k * .25); }); }
      if (P.tombe) for (const Z of renfZ) { if (!Z.mangeur || u < Z.t) continue; const q2 = Z.q, [mx, mz] = Z.mangeur, dx = mx - Z.x, dz = mz - Z.z, d = Math.hypot(dx, dz); q2.g.visible = true;
        if (d > .08) { const v = Math.min(d, (d > 1.5 ? (Z.gauche ? 5.2 : 4.6) : 2.4) * dt); Z.x += dx / d * v; Z.z += dz / d * v; q2.mange = null; } else { q2.mange = { x: pp.x, z: pp.z };
          if (now > (Z.sangT || 0)) { Z.sangT = now + 220 + Math.random() * 380; const mx2 = (Z.x + pp.x) / 2, mz2 = (Z.z + pp.z) / 2, ex = Z.x - pp.x, ez = Z.z - pp.z, e = Math.hypot(ex, ez) || 1;   /* (là où il mord : le sang gicle, vers le haut et sur les côtés) */
            jetSang(mx2, H.y + .25 + Math.random() * .25, mz2, -ez / e + (Math.random() - .5) * .8, ex / e + (Math.random() - .5) * .8); if (Math.random() < .35) sonBruit(.12, 260 + Math.random() * 200, .25); } } q2.x = q2.tx = Z.x; q2.z = q2.tz = Z.z; q2.y = H.y; if (q2.z3) eclairer3D(q2.z3.sc, .22); } }
    for (const Z of renfZ) { if (Z.q.z3) eclairer3D(Z.q.z3.sc, .22); if (u < Z.t || (proie && Z.mangeur)) continue; const q = Z.q, d = Math.hypot(Z.x - H.x, Z.z - H.z) || 1, v = (d > 7 ? 3.4 : d > 4.6 ? .8 : 0) * dt; q.g.visible = true; Z.x += (H.x - Z.x) / d * v; Z.z += (H.z - Z.z) / d * v; q.x = q.tx = Z.x; q.z = q.tz = Z.z; q.y = H.y; }   /* (ils les poursuivent, puis s'arrêtent, à distance des pales) */
    paris.visible = u > 14; if (paris.visible) paris.userData.maj(now);
    for (const l of c.renfL || []) if (u > l[0] && !l.dit) { l.dit = true; bulle(`<b style="color:#e8c46a">${l[1]}</b> : ${l[2]}`, 2400); }   /* (les derniers survivants, et nous) */
    hel.userData.rotor.rotation.y += dt * 9.5; hel.userData.rotorQ.rotation.z += dt * 40; hel.userData.feu.visible = Math.floor(now / 450) % 2 === 0;
    // la fumée rouge : elle jaillit du cercle, puis le souffle des pales la chasse tout autour
    for (const f of fum) { const k = Math.max(0, u - f.d), r = .3 + k * f.v * (u > 6 ? 2.2 : .9), y = H.y + .3 + Math.min(4, k * f.v * .9);
      f.sp.position.set(H.x + Math.cos(f.a + k * .2) * r, y, H.z + Math.sin(f.a + k * .2) * r); f.sp.scale.setScalar(1.2 + k * 1.1); f.sp.material.opacity = u < 18 ? Math.min(.75, k * 1.5) * Math.max(0, 1 - Math.max(0, u - 13) / 5) : 0; }
    if (u > 4.5 && !mus.parti && !M.musFin) { mus.parti = true; mus.play().catch(() => {}); }   /* (« Sweet Dreams » joue déjà depuis l'arrivée du Tyran : elle mène jusqu'au bout) */
    helA.volume = Math.max(0, Math.min(.95, .25 + u / 6)) * (u > 19 ? Math.max(0, 1 - (u - 19) / 3) : 1) * (M.musFin ? .22 : 1);   /* (« Sweet Dreams » devant : l'hélicoptère, loin derrière) */   /* (il approche, se pose — au plus fort —, puis redécolle et s'éloigne) */
    if (u < 2.5) placer(H.x + 9, H.y + 3.5, H.z - 5, H.x, H.y + 1, H.z, .03);
    else if (u < 5.5) { const k = lisse((u - 2.5) / 3); hel.position.lerpVectors(dep, haut, k); hel.rotation.z = Math.sin(k * Math.PI) * .18; hel.rotation.y = ry0 * (1 - k);   // il vient se placer au-dessus du H…
      placer(H.x + 11, H.y + 3, H.z - 9, hel.position.x, hel.position.y, hel.position.z, .06); }
    else if (u < 10) { const k = lisse((u - 5.5) / 4.5); hel.position.set(H.x, H.y + 24 * (1 - k), H.z); hel.rotation.set(0, 0, 0);   // …et descend à la verticale ; la caméra le suit
      if (renf.length && c.vueR && u > 6.2 && u < (proie ? 12.8 : 9.9)) { const m = (proie && u > 7.7 ? proie.p : renf[0]).g.position, w = c.vueR; placer(w.x, w.y, w.z, m.x, H.y + (proie && u > 8.3 ? .6 : 1.1), m.z, c.coupe ? .12 : 1); c.coupe = true; }   // (eux, qui accourent, les zombies derrière)
      else placer(H.x + 11, H.y + 2.2 + 3 * (1 - k), H.z - 9, H.x, hel.position.y + 1.4, H.z, .08); }
    else if (vueHorde) { hel.position.copy(H); for (const p of vivants) p.g.visible = false; cam.position.set(0, 7.5, -7); vise.set(0, 1.2, 12); cam.lookAt(vise); if (!c.feuxH) c.feuxH = [...cacherFeuxEntre(new THREE.Vector3(0, 0, -7), new THREE.Vector3(-6, 0, 14), 4.5), ...cacherFeuxEntre(new THREE.Vector3(0, 0, -7), new THREE.Vector3(6, 0, 14), 4.5)]; }   /* (les feux devant l'objectif s'effacent le temps du plan) */
    /* au décollage : la horde a traversé la cour — elle remonte en courant l'escalier en U de la terrasse, jusqu'au H que l'hélicoptère vient de quitter */
    if (c.horde && c.pauseFin && u > 15 && u < 21.5) { if (!c.escP) { const E = C3.ESC, W = E.W, LT2 = C3.LT / 2, xo = LT2 + W * 1.5, xi = LT2 + W / 2, z1 = E.z0 + E.run, yT = H.y;
        c.escP = [[xo, 0, E.z0 - 7], [xo, 0, E.z0], [xo, yT / 2, z1], [xo, yT / 2, z1 + E.pal / 2], [xi, yT / 2, z1 + E.pal / 2], [xi, yT / 2, z1], [xi, yT, E.z0], [xi, yT, E.zA + .4], [LT2 - 2.5, yT, E.zA + .4], [H.x + 2, yT, H.z]];
        c.escL = []; let a = 0; for (let i = 1; i < c.escP.length; i++) { const [x0, y0, z0] = c.escP[i - 1], [x1, y1, z1b] = c.escP[i]; a += Math.hypot(x1 - x0, y1 - y0, z1b - z0); c.escL.push(a); } }
      c.horde.forEach((Hd, i) => { const q = Hd.q, d = (u - 15 - i * .13) * 3.8 + 4;   /* (toute la horde, serrée, à l'assaut de l'escalier) */ if (d < 0) { q.g.visible = false; return; } let k = c.escL.findIndex(l => l >= d); if (k < 0) { q.g.visible = false; return; }
        const l0 = k ? c.escL[k - 1] : 0, f = (d - l0) / (c.escL[k] - l0), A0 = c.escP[k], B0 = c.escP[k + 1], dec = ((i % 3) - 1) * .35;
        q.g.visible = true; q.x = q.tx = A0[0] + (B0[0] - A0[0]) * f + (k === 0 || k >= 8 ? dec : 0); q.z = q.tz = A0[2] + (B0[2] - A0[2]) * f + (k > 0 && k < 8 ? dec * .6 : 0); q.y = A0[1] + (B0[1] - A0[1]) * f; q.g.position.set(q.x, q.y, q.z); if (q.z3) eclairer3D(q.z3.sc, .3); }); }
    if (c.horde2) { const zT = C3.z1 - C3.PP, zt0 = zT - C3.NT * C3.PT, yM = z => z > zT ? C3.hp : z > zt0 ? C3.hp + (zT - z) / (zT - zt0) * C3.NT * C3.HT2 : H.y;   /* (la hauteur : le passage, puis les marches raides, puis la terrasse) */
      for (const Z of c.horde2) { const q = Z.q, t = u - 14.2 - Z.d * .55; if (!c.pauseFin || u > 21.5 || t < 0) { q.g.visible = false; continue; }
        const dz = Z.fz - (-76), lg = Math.hypot(Z.fx - Z.x, dz), f = Math.min(1, t * Z.v / lg); q.g.visible = true;
        q.x = q.tx = Z.x + (Z.fx - Z.x) * f; q.z = q.tz = -76 + dz * f; q.y = yM(q.z);
        if (f >= 1) { if (Z.sautU == null || u - Z.sautU > 1.1) Z.sautU = u; q.saute = u - Z.sautU < .75; if (q.saute) q.y += Math.sin((u - Z.sautU) / .75 * Math.PI) * .9; }   /* (arrivés sur le H : ils sautent vers l'hélicoptère qui leur échappe) */
        q.g.position.set(q.x, q.y, q.z); if (q.z3) eclairer3D(q.z3.sc, .3); } }
    if (!vueHorde && c.feuxH && !c.feuxR) { c.feuxR = true; for (const f of c.feuxH) f.visible = true; }   /* (en hauteur, face aux bâtiments R et S : la voûte au centre) */
    if (u < 10 || vueHorde) { /* (l'arrivée, la descente, le plan sur la horde : réglés plus haut — sans ce garde-fou, l'embarquement partait dès le début : l'hélico déjà posé, tout le monde caché) */ }
    else if (u < 15) { hel.position.copy(H); hel.rotation.set(0, 0, 0);
      if (!monte) { monte = true; vivants.forEach((p, i) => { p.cible = new THREE.Vector3(H.x - .35 + (i % 3 - 1) * .3, p.g.position.y, H.z + 1.9); }); }
      for (const p of vivants) if (p.g.visible && Math.hypot(p.g.position.x - (H.x - .35), p.g.position.z - (H.z + 1.9)) < .7) p.g.visible = false;
      if (proie && c.vueR && u < 12.8) { const m = proie.p.g.position, w = c.vueR; placer(w.x, w.y, w.z, m.x, H.y + .6, m.z, .12); }   /* (on reste sur lui : le temps de voir qu'on le dévore) */
      else placer(H.x + 4, H.y + 2.6, H.z + 5.6, H.x, H.y + 1.3, H.z + 1, .05); }
    else if (u < 26) { for (const p of vivants) p.g.visible = false;
      { const moiH = HEROS[M.perso] ? M.perso : 25, eqV = (M.equipe || []).find(e => !e.mort && HEROS[e.id]), rv = renf.find(p => !p.info.mortT && HEROS[p.info.heros]), autreH = eqV ? eqV.id : rv ? rv.info.heros : null, A = HEROS[moiH].court, B = autreH ? HEROS[autreH].court : "Brad Vickers",   /* (seulement quelqu'un de vivant : pas Jill, morte dans la salle des fêtes) */ L2 = [[15.6, B, "Accrochez-vous, on décolle !"], [17.6, "Le pilote", "Message radio du gouvernement… Ils ont donné l'ordre : la zone va être rasée. Ils vont tout faire sauter !"],
          [20.6, A, "Tout faire sauter ?! Mais… la caserne, le quartier… tous ces gens…"], [23.2, B, "Il n'y a plus personne à sauver là-dessous. Regardez…"]];
        for (const [tu, qui, txt] of L2) if (u > tu && !(c.dits || (c.dits = new Set())).has(tu)) { c.dits.add(tu); bulle(`<b style="color:#e8c46a">${esc(qui)}</b> : ${txt}`, 2800); } }
      const k = Math.min(1.5, Math.max(0, u - 17.2) / 6); hel.position.set(H.x + k * k * 30, H.y + k * k * 60 + (u < 17.2 ? Math.max(0, u - 16.4) * .4 : 0), H.z + k * k * 25); hel.rotation.z = -.12 * Math.min(1, k * 3);   /* (il ne décolle qu'à la dernière seconde : la horde est déjà sur la terrasse) */
      if (brouillard && sc.fog) { sc.fog.near = 60; sc.fog.far = 700; }
      if (u < 20.5) { const loin = cam.position.distanceTo(new THREE.Vector3(H.x + 3, H.y + 7, H.z - 10)) > 8; placer(H.x + 3, H.y + 7, H.z - 10, H.x + 5, H.y + 1 + Math.min(4, (hel.position.y - H.y) * .2), H.z + 3, loin ? 1 : .08); if (loin) { vise.set(H.x + 5, H.y + 1, H.z + 3); cam.lookAt(vise); }   /* (on voit les deux escaliers : la horde qui monte en face, et celle de l'escalier en U) */ }   /* (l'hélicoptère s'élève ; à gauche, la horde qui remonte l'escalier de la terrasse) */   /* (retour sur l'hélicoptère : d'un coup, après le plan sur la cour d'honneur) */
      else placer(12, 115, -10, 0, 0, -50, .035); }   // la caserne, vue du ciel
    else { if (u < 27.5) placer(12, 115, -10, 0, 0, -50, .035); else placer(30, 230, 120, 0, 0, -60, .02);   /* (on prend de la hauteur : tout le quartier saute) */
      // et elle explose : des boules de feu, l'une après l'autre, le flash, la secousse
      while (boum < P.length && u > 26 + boum * .4) { const [x, z] = P[boum++]; voile("background:#fff6e0;opacity:.75", 160); if (boum % 3 === 1) sonPos("sons/re-bombe.mp3", boum === 1 ? 1 : .8); else sonBruit(1.6, 140 + Math.random() * 140, .45);   /* (la vraie déflagration, et des grondements entre deux) */
        boule(x, z, 1, 8, 6, now); }
      // puis le souffle gagne tout le quartier : les îlots sautent l'un après l'autre, du plus proche au plus loin
      if (u > 27) { const R = (u - 27) * 75; paris.userData.souffle(0, -55, R, now);
        for (const I of ilotsB) if (!I.parti && I.d < R) { I.parti = true; boule(I.x + (Math.random() - .5) * 20, I.z + (Math.random() - .5) * 20, 2.6, 3, 1, now); if ((c.nB = (c.nB || 0) + 1) % 6 === 1) { sonBruit(2.2, 90 + Math.random() * 80, .5); voile("background:#ffb060;opacity:.3", 120); } } }
      for (const e of explo) { const k = (now - e.t) / 1000, S = e.s;
        for (const [sp, ph, h] of e.fl) { sp.material.map = texFlammes[(Math.floor(now / 70) + ph) % 8]; const s = Math.min(1, k / .8) * 16 * h * S; sp.scale.set(s * .8, s * 1.4, 1); }
        for (const [sp, d] of e.fu) { sp.position.set(Math.sin(d * 9) * 6 * S, (6 + k * 9 + d * 8) * S, Math.cos(d * 9) * 6 * S); sp.scale.setScalar((10 + k * 9) * S); sp.material.opacity = Math.min(.8, k) * .8; } }
      const sec = boum && u < 26 + P.length * .4 + 1 ? .6 : u < 31 ? .35 : 0; cam.position.x += (Math.random() - .5) * sec; cam.position.y += (Math.random() - .5) * sec;
      if (u > 30.4 && !logo.isConnected) { M.ctx.conteneur.appendChild(logo); M.ctx.conteneur.appendChild(motFin); requestAnimationFrame(() => { logo.style.opacity = "1"; logo.style.transform = "translate(-50%,-50%) scale(1)"; }); }
      if (u > 34.5 && !noirF) { noirF = voile("background:#000;opacity:0;transition:opacity 2s"); requestAnimationFrame(() => { if (noirF) noirF.style.opacity = "1"; }); }
      if (u > 37 && motFin.style.opacity !== "1") motFin.style.opacity = "1";
      if (u > 39.5 && sonFin) sonFin.volume = Math.max(0, 1 - (u - 39.5) / 3.4);   /* (« Sweet Dreams » s'éteint doucement avec l'écran noir) */
      if (u > 43) fin(); } } };
}

({ heliportApo, detritusApo, tracesSang, journauxVolants, creerHelico, ventJournaux, fumiApo, introApo, survolApo, histoireRE, pluieRE, sursautsRE, portailSouffle, tirPompe, surFumi, surEvac, cineToit });
