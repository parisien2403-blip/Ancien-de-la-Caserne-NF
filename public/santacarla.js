/* Santa Carla (Génération perdue) : la jetée, la plage, les vampires de la bande de David.
   Ce fichier est chargé par la matrice (matrice.js) la première fois qu'on va à Santa Carla, et exécuté chez elle (eval direct) : il se sert
   tel quel de tout ce qu'elle a. Ce qu'il rend (la dernière expression) : ses points d'entrée. */
/* ===================== Santa Carla (Génération perdue, 1987) : la jetée de nuit, ses manèges, la plage, l'océan ;
   et les quatre vampires de la bande de David, qu'il faut affronter comme dans le film : l'eau bénite pour les affaiblir, le pieu quand ils sont à terre ===================== */
/* les personnages de Génération perdue (81 à 87) : leur tenue par défaut, et leur tête découpée ; l'inventaire de l'administrateur a le dernier mot */
const LB_DEF = { 81: ["lbsam", "#ecd8a0", "#4a6a9a", "#f2f2f2", "sam"], 82: ["lbedgar", "#5a6a3a", "#4a4a3a", "#f2f2f2", "edgar"], 83: ["lbalan", "#8e8e8a", "#4a6a9a", "#f2f2f2", "alan"],
  89: ["lbdavid", "#141414", "#1a1a1e", "#0e0e0e", "david-vamp"], 90: ["lbpaul", "#3e5070", "#141416", "#0e0e0e", "paul-vamp"], 91: ["lbmarko", "#6a3a5a", "#3a4a6a", "#0e0e0e", "marko-vamp"], 92: ["lbdwayne", "#2a2420", "#1a1a1e", "#0e0e0e", "dwayne-vamp"],
  93: ["lbmichael", "#151312", "#8aa2bc", "#b8b2a6", "michael"], 94: ["lbmichael", "#151312", "#8aa2bc", "#b8b2a6", "michael-vamp"],
  88: ["lbtim", "#d89a68", "#141416", "#1a1a1a", "tim"], 84: ["lbdavid", "#141414", "#1a1a1e", "#0e0e0e", "david"], 85: ["lbpaul", "#3e5070", "#141416", "#0e0e0e", "paul"], 86: ["lbmarko", "#6a3a5a", "#3a4a6a", "#0e0e0e", "marko"], 87: ["lbdwayne", "#2a2420", "#1a1a1e", "#0e0e0e", "dwayne"] };
function habillerLB(info, id) { const D = LB_DEF[id], P = (M.ctx.pnjTrio && M.ctx.pnjTrio(id)) || {};
  return { ...info, tenue: P.tenue || D[0], couleur: P.couleur || D[1], bas: P.tenue ? P.bas : D[2], pieds: P.pieds || D[3], reglage: P.reglage || { devant: true, ...(id >= 81 && id <= 83 ? { k: 1.3, dy: 6 } : {}) }, tete_v: null,
    teteUrl: P.tete_v ? M.ctx.urlTetePNJ(P.tete_v, id) : `images/santacarla/${D[4]}-tete.webp`, lbPerso: id, ...(id === 88 ? { peau: "#c98a5c" } : {}) }; }   // (Tim Cappello : la peau bronzée)
function construireSantaCarla(A, L, scene) {
  L.lb = true;
  L.portails = L.portails || []; L.portails.push({ dans: (x, z) => Math.hypot(x + 6, z - 11) < .9, vers: "rue", arrivee: [19.1, 5.2], yaw: Math.PI, indice: [-6, 11] });   // (le cercle du retour : sur la plage, près de la pancarte ; on revient dans la rue, devant le Video Futur)
  const nuitMat = (c, e = 1) => new THREE.MeshBasicMaterial({ color: c, toneMapped: false, fog: true }), bulbes = [];
  // ---------- le sol : la jetée en planches, la plage, l'océan ----------
  const planches = tex(toile(512, 512, (x, w, h) => { for (let i = 0; i < 16; i++) { const v = hasard(i * 3.1); x.fillStyle = `hsl(28, ${22 + v * 10}%, ${26 + v * 8}%)`; x.fillRect(0, i * 32, w, 31); x.fillStyle = "rgba(0,0,0,.45)"; x.fillRect(0, i * 32 + 30, w, 2);
      for (let k = 0; k < 6; k++) { x.strokeStyle = "rgba(0,0,0,.18)"; x.beginPath(); const y = i * 32 + 4 + hasard(i * 7 + k) * 24; x.moveTo(0, y); x.lineTo(w, y + (hasard(k) - .5) * 4); x.stroke(); } x.fillStyle = "rgba(0,0,0,.5)"; x.fillRect((hasard(i) * w) | 0, i * 32, 2, 30); } }), 6, 1.2);
  const pl2 = (() => { const ld = new THREE.TextureLoader(), t = ld.load("images/santacarla/planches.webp"), n = ld.load("images/santacarla/planches-n.webp"); t.colorSpace = THREE.SRGBColorSpace;   // (les vraies planches : le bois grisé par le sel, les fibres, les nœuds, les clous, les joints)
    for (const q of [t, n]) { q.wrapS = q.wrapT = THREE.RepeatWrapping; q.repeat.set(96 / 3.2, 12 / 3.2); q.anisotropy = 8; } return { t, n }; })();
  const jetee = A.ajoute(new THREE.PlaneGeometry(96, 12), A.mat({ map: pl2.t, normalMap: pl2.n, normalScale: new THREE.Vector2(1, 1), roughness: .85 }), 0, .02, 0, false); jetee.receiveShadow = true; jetee.rotation.x = -Math.PI / 2; L.sol = jetee;
  const sable = (() => { const ld = new THREE.TextureLoader(), t = ld.load("images/santacarla/sable.webp"), n = ld.load("images/santacarla/sable-n.webp"); t.colorSpace = THREE.SRGBColorSpace;   // (le vrai sable : le grain fin, les rides du vent, le relief)
    for (const q of [t, n]) { q.wrapS = q.wrapT = THREE.RepeatWrapping; q.repeat.set(600 / 5, 66 / 5); q.anisotropy = 8; }
    return A.ajoute(new THREE.PlaneGeometry(600, 66), A.mat({ map: t, normalMap: n, normalScale: new THREE.Vector2(1.2, 1.2), roughness: .95, color: 0xffffff }), 0, 0, 38, false); })();   /* (la plage, derrière la scène, jusqu'au bord de l'eau) */ sable.rotation.x = -Math.PI / 2;
  const merT = tex(toile(512, 512, (x, w, h) => { x.fillStyle = "#0a1a30"; x.fillRect(0, 0, w, h); for (let i = 0; i < 260; i++) { x.strokeStyle = `rgba(${hasard(i) > .7 ? "200,220,255" : "60,90,140"},${.15 + hasard(i * 3) * .25})`; x.lineWidth = 1 + hasard(i * 5) * 2; const y = hasard(i * 1.9) * h, x0 = hasard(i * 2.7) * w; x.beginPath(); x.moveTo(x0, y); x.quadraticCurveTo(x0 + 20, y - 4, x0 + 40 + hasard(i) * 40, y); x.stroke(); } }), 20, 10);
  const mer = A.ajoute(new THREE.PlaneGeometry(3000, 1500), A.mat({ map: merT, roughness: .15, metalness: .4, color: 0x8899bb }), 0, -.3, 795, false); merT.repeat.set(7.5, 7.5);   /* (jusqu'à l'horizon : on la voit d'en haut, pendant le survol) */ mer.rotation.x = -Math.PI / 2;
  const reflet = new THREE.Mesh(new THREE.PlaneGeometry(14, 160), new THREE.MeshBasicMaterial({ map: tex(toile(64, 256, (x, w, h) => { const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, "rgba(255,250,220,0)"); g.addColorStop(.5, "rgba(255,250,220,.35)"); g.addColorStop(1, "rgba(255,250,220,0)"); x.fillStyle = g; for (let y = 0; y < h; y += 4) if (hasard(y) > .35) x.fillRect(0, y, w, 2); })), transparent: true, depthWrite: false }));
  reflet.rotation.x = -Math.PI / 2; reflet.position.set(18, .55, 150); reflet.material.blending = THREE.AdditiveBlending; reflet.material.depthWrite = false; scene.add(reflet);   // (la traînée de lune sur les vagues)
  // la mer : de vraies vagues — la houle qui roule vers la plage (plusieurs trains de vagues calculés à chaque image), l'écume sur les crêtes, le ciel qui s'y reflète
  const vagues = { t: { value: 0 } };
  { const geo = new THREE.PlaneGeometry(420, 240, 210, 120), mat = new THREE.MeshStandardMaterial({ color: 0x0c1a2c, roughness: .18, metalness: .6, envMapIntensity: 1 });
    mat.onBeforeCompile = (sh) => { sh.uniforms.uT = vagues.t;
      const ondes = `uniform float uT; varying float vH;
        vec3 houle(vec2 p) { float h = 0.0; vec2 d = vec2(0.0);
          vec4 W[5]; W[0] = vec4(0.0, -1.0, .07, .55); W[1] = vec4(.35, -.94, .11, .32); W[2] = vec4(-.5, -.86, .19, .18); W[3] = vec4(.8, -.6, .31, .09); W[4] = vec4(-.2, -.98, .47, .06);
          for (int i = 0; i < 5; i++) { vec2 dir = normalize(W[i].xy); float k = W[i].z * 6.2831, a = W[i].w, ph = k * dot(dir, p) - uT * sqrt(9.8 * k);
            h += a * sin(ph); d += a * k * cos(ph) * dir; }
          return vec3(h, d); }`;
      sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\n" + ondes)
        .replace("#include <beginnormal_vertex>", "vec3 hv = houle(vec2(position.x, -position.y)); float bord = smoothstep(0.0, 18.0, position.y + 120.0); vec3 objectNormal = normalize(vec3(-hv.y * bord, hv.z * bord, 1.0));")
        .replace("#include <begin_vertex>", "vec3 transformed = vec3(position); transformed.z += hv.x * bord; vH = hv.x * bord;");
      sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nvarying float vH;")
        .replace("#include <dithering_fragment>", "#include <dithering_fragment>\n gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(.62, .68, .78) * (.4 + .6 * gl_FragColor.g * 3.0), smoothstep(.45, .8, vH) * .55);"); };   // (l'écume blanche sur les crêtes)
    const m = new THREE.Mesh(geo, mat); m.rotation.x = -Math.PI / 2; m.position.set(0, -.05, 70 + 120); m.receiveShadow = false; scene.add(m); L.merVagues = mat; }
  // l'écume qui monte et redescend sur le sable, au bord de l'eau
  const ecumeT = tex(toile(512, 64, (x, w, h) => { for (let i = 0; i < 1400; i++) { x.fillStyle = `rgba(235,242,250,${.15 + hasard(i) * .6})`; const px = hasard(i * 2.3) * w, py = h * .5 + (hasard(i * 3.1) - .5) * h * (.2 + hasard(i * 1.7) * .8); x.beginPath(); x.ellipse(px, py, 2 + hasard(i * 5) * 10, 1 + hasard(i * 7) * 2.5, 0, 0, 7); x.fill(); } }), 8, 1);
  const ecumes = [0, 1, 2].map(i => { const m = new THREE.Mesh(new THREE.PlaneGeometry(420, 2.4 + i), new THREE.MeshBasicMaterial({ map: ecumeT, transparent: true, opacity: .7, depthWrite: false, color: 0xb8c4d8 })); m.rotation.x = -Math.PI / 2; m.position.set(0, .04 + i * .01, 70 + i * 2.5); scene.add(m); return m; });   // (le reflet de la lune sur l'eau)
  // l'écume des vagues, qui va et vient sur le sable
  const ecume = new THREE.Mesh(new THREE.PlaneGeometry(140, 2.2), new THREE.MeshBasicMaterial({ color: 0xc8d8e8, transparent: true, opacity: .35, depthWrite: false })); ecume.rotation.x = -Math.PI / 2; ecume.position.set(0, .03, 45); scene.add(ecume); ecume.visible = false;   /* (plus de mer devant la plage : le sable continue) */
  // les pilotis et la rambarde de la jetée, côté plage
  const bois = A.mat({ color: 0x4a3626, roughness: .9 }), blancM = A.mat({ color: 0xe8e4da, roughness: .6 });
  for (let x = -46; x <= 46; x += 2.4) { if (Math.abs(Math.abs(x) - 20) < 1.4) continue; A.ajoute(new THREE.BoxGeometry(.12, 1.05, .12), blancM, x, .55, 6.2); }
  for (const [a, b] of [[-48, -21.4], [-18.6, 18.6], [21.4, 48]]) { A.ajoute(new THREE.BoxGeometry(b - a, .1, .14), blancM, (a + b) / 2, 1.08, 6.2); A.ajoute(new THREE.BoxGeometry(b - a, .08, .1), blancM, (a + b) / 2, .6, 6.2); }   // (la rambarde, ouverte vers la plage)
  // ---------- les stands, le long de la jetée (côté ville), leurs enseignes au néon ----------
  // les textures réelles : le bardage de bois peint et écaillé (il prend la couleur du matériau), l'écorce et les palmes des palmiers
  const TX = (() => { const ld = new THREE.TextureLoader(), T = (f, srgb = true, rw = THREE.RepeatWrapping) => { const t = ld.load("images/santacarla/" + f); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = rw; t.anisotropy = 8; return t; };
    const ec = T("ecorce.webp"); ec.center.set(.5, .5); ec.rotation = Math.PI / 2; ec.repeat.set(2.5, 1);
    return { bard: T("bardage.webp"), bardN: T("bardage-n.webp", false), ecorce: ec, palme: T("palme.webp", true, THREE.ClampToEdgeWrapping) }; })();
  const peint = (c, r = .75) => A.mat({ color: c, map: TX.bard, normalMap: TX.bardN, normalScale: new THREE.Vector2(.8, .8), roughness: r });
  const neon = (txt, coul, w = 3.2) => { const c = toile(512, 128, (x, W, H) => { x.fillStyle = "#0a0a10"; x.fillRect(0, 0, W, H); x.font = "bold 64px 'Arial Black', Arial"; x.textAlign = "center"; x.shadowColor = coul; x.shadowBlur = 18; x.fillStyle = coul; x.fillText(txt, W / 2, 86); x.shadowBlur = 0; x.fillStyle = "#fff"; x.globalAlpha = .55; x.fillText(txt, W / 2, 86); });
    return new THREE.Mesh(new THREE.PlaneGeometry(w, w / 4), new THREE.MeshBasicMaterial({ map: tex(c), toneMapped: false })); };
  const STANDS = [[-38, "HOT DOGS", "#ff5a3a"], [-30, "ARCADE", "#3ad8ff"], [-22, "COMICS", "#ffd23a"], [-14, "TATTOO", "#ff3ab8"], [14, "SKEE BALL", "#5aff6a"], [22, "PIZZA", "#ff8a2a"], [30, "BUMPER CARS", "#c06aff"], [38, "CANDY", "#ff6a9a"]];
  for (const [x, txt, c] of STANDS) { const g = new THREE.Group(); g.position.set(x, 0, -38.4); scene.add(g);
    const PAL = [[0x2aa49a, 0xe8c832], [0xf08a2a, 0x6ac83a], [0xd83a2a, 0xe8c832], [0x7a4ac8, 0x2ad8c8], [0x2a62b8, 0xf0a02a], [0xe8c832, 0xd83a2a]], [cm, ct] = PAL[Math.abs(Math.round(x / 8)) % PAL.length];
    const murs = peint(cm, .7), rayure = tex(toile(128, 32, (q, w, h) => { for (let i = 0; i < 8; i++) { q.fillStyle = i % 2 ? "#e8e2d6" : c; q.fillRect(i * 16, 0, 16, h); } }), 4, 1);
    const b = (dx, dy, dz, m, px, py, pz) => { const o = new THREE.Mesh(new THREE.BoxGeometry(dx, dy, dz), m); o.position.set(px, py, pz); g.add(o); return o; };
    b(5, 3, 3, murs, 0, 1.5, -1.5); b(4.2, 1.6, .05, A.mat({ color: 0x1a1410, emissive: new THREE.Color(c).multiplyScalar(.25) }), 0, 1.5, .02);   // (la cabane, son comptoir éclairé)
    b(5.4, .1, 1.4, A.mat({ map: rayure, roughness: .7 }), 0, 2.6, .55).rotation.x = .25;   // (le store à rayures)
    b(5.1, .16, 3.1, A.mat({ color: ct, roughness: .5 }), 0, 3.05, -1.5);   // (le liseré de couleur du toit)
    for (let i = 0; i < 14; i++) { const bb = new THREE.Mesh(new THREE.SphereGeometry(.055, 6, 4), nuitMat([0xff4a4a, 0xffd23a, 0x4ad8ff, 0x7aff6a][i % 4])); bb.position.set(-2.6 + i * .4, 2.42, 1.25); g.add(bb); bulbes.push(bb); }   // (les ampoules au bord du store)
    b(4.6, .9, .25, A.mat({ color: 0x6a4a30 }), 0, .45, .2); const n = neon(txt, c); n.position.set(0, 3.5, .02); g.add(n); }
  // l'arche d'entrée « SANTA CARLA », bordée d'ampoules
  { const g = new THREE.Group(); g.position.set(0, 0, -8.6); scene.add(g); const rouge = A.mat({ color: 0xa82a24, roughness: .6 });
    for (const sx of [-1, 1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(.5, 6, .5), rouge); p.position.set(sx * 4.5, 3, 0); g.add(p); }
    const n = neon("SANTA CARLA", "#ff3a3a", 8.6); n.position.set(0, 6.4, .3); g.add(n); const c2 = new THREE.Mesh(new THREE.BoxGeometry(9.4, 2.4, .3), rouge); c2.position.set(0, 6.4, 0); g.add(c2);
    for (let i = 0; i < 26; i++) { const a = new THREE.Mesh(new THREE.SphereGeometry(.07, 6, 4), nuitMat(0xffe8a0)); a.position.set(-4.5 + i * .36, 7.68, .2); g.add(a); bulbes.push(a); }
    const n2 = neon("BOARDWALK", "#3ad8ff", 5); n2.position.set(0, 4.6, .2); g.add(n2); }
  // les guirlandes d'ampoules entre les lampadaires, au-dessus de la jetée
  const lampadaire = (x, z) => { A.ajoute(new THREE.CylinderGeometry(.07, .1, 4.4, 8), A.mat({ color: 0x1e1e22, metalness: .6 }), x, 2.2, z); const l = new THREE.Mesh(new THREE.SphereGeometry(.22, 12, 8), nuitMat(0xffe0a0)); l.position.set(x, 4.5, z); scene.add(l); };
  for (let x = -42; x <= 42; x += 12) for (const z of [5.4, -5.4]) A.ajoute(new THREE.CylinderGeometry(.07, .11, 4.4, 8), A.mat({ color: 0x1a2e24, metalness: .5 }), x, 2.2, z);   // (les fûts : les globes sont posés plus bas)
  for (let x = -42; x < 42; x += 12) for (const z of [5.4, -5.4]) for (let i = 1; i < 12; i++) { const t = i / 12, a = new THREE.Mesh(new THREE.SphereGeometry(.06, 6, 4), nuitMat([0xff4a4a, 0xffd23a, 0x4ad8ff, 0x7aff6a][i % 4])); a.position.set(x + t * 12, 4.3 - Math.sin(t * Math.PI) * .7, z); scene.add(a); bulbes.push(a); }
  for (let x = -36; x <= 36; x += 24) { const l = new THREE.PointLight(0xffc880, 9, 16, 1.6); l.position.set(x, 4.2, 0); scene.add(l); }
  // ---------- les montagnes russes (le grand huit en bois blanc, ses wagons rouges), à gauche ----------
  const pts = []; for (let i = 0; i < 64; i++) { const t = i / 64 * Math.PI * 2; pts.push(new THREE.Vector3(-26 + Math.cos(t) * 16 + Math.cos(t * 3) * 2.5, 4 + Math.max(0, Math.sin(t * 2 + .6)) * 10 + Math.sin(t * 5) * 2, -26 + Math.sin(t) * 9)); }
  const voie = new THREE.CatmullRomCurve3(pts, true);
  scene.add(new THREE.Mesh(new THREE.TubeGeometry(voie, 400, .22, 6, true), A.mat({ color: 0x8a1a18, roughness: .5 })));
  const POTEAUX = [];   // (les pieds du grand huit, pour ne pas passer au travers)
  { const n = 180, im = new THREE.InstancedMesh(new THREE.BoxGeometry(.16, 1, .16), A.mat({ color: 0xe8e4da, roughness: .7 }), n * 2), mt = new THREE.Matrix4(), p = new THREE.Vector3(), tg = new THREE.Vector3();
    for (let i = 0; i < n; i++) { voie.getPointAt(i / n, p); voie.getTangentAt(i / n, tg); const nx = -tg.z, nz = tg.x, ln = Math.hypot(nx, nz) || 1;
      for (const s of [-1, 1]) { const x = p.x + nx / ln * .7 * s, z = p.z + nz / ln * .7 * s; mt.compose(new THREE.Vector3(x, p.y / 2, z), new THREE.Quaternion(), new THREE.Vector3(1, p.y, 1)); im.setMatrixAt(i * 2 + (s > 0 ? 1 : 0), mt); if (i % 2 === 0) POTEAUX.push([x, z]); } }
    scene.add(im);   // (les poteaux blancs, sous la voie)
    const im2 = new THREE.InstancedMesh(new THREE.BoxGeometry(1.6, .08, .08), A.mat({ color: 0xe8e4da }), n), q = new THREE.Quaternion();
    for (let i = 0; i < n; i++) { voie.getPointAt(i / n, p); voie.getTangentAt(i / n, tg); q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.atan2(tg.x, tg.z)); mt.compose(new THREE.Vector3(p.x, p.y * .5, p.z), q, new THREE.Vector3(1, 1, 1)); im2.setMatrixAt(i, mt); }
    scene.add(im2);
    // le treillis en croix entre les poteaux (le « Giant Dipper » de la vraie jetée)
    const im3 = new THREE.InstancedMesh(new THREE.BoxGeometry(.07, 1, .07), A.mat({ color: 0xe8e4da, roughness: .7 }), n * 4), a2 = new THREE.Vector3(), b2 = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0); let k3 = 0;
    for (let i = 0; i < n; i++) { voie.getPointAt(i / n, p); const p2 = voie.getPointAt(((i + 1) % n) / n), t1 = voie.getTangentAt(i / n), nx = -t1.z, nz = t1.x, ln = Math.hypot(nx, nz) || 1;
      for (const s of [-1, 1]) { const ox = nx / ln * .7 * s, oz = nz / ln * .7 * s, h = Math.min(p.y, p2.y) * .92;
        for (const [ya, yb] of [[0, h], [h, 0]]) { a2.set(p.x + ox, ya, p.z + oz); b2.set(p2.x + ox, yb, p2.z + oz); const d = b2.clone().sub(a2), L2 = d.length(); q.setFromUnitVectors(up, d.normalize());
          mt.compose(a2.clone().add(b2).multiplyScalar(.5), q, new THREE.Vector3(1, L2, 1)); im3.setMatrixAt(k3++, mt); } } }
    im3.count = k3; scene.add(im3);
    const gare = new THREE.Group(); gare.position.set(-12, 0, -16); scene.add(gare); const tq = peint(0x2aa49a, .7), jn = peint(0xe8c832);
    const bx = (dx, dy, dz, m, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(dx, dy, dz), m); o.position.set(x, y, z); gare.add(o); };
    bx(7, 3.6, 4, tq, 0, 1.8, 0); bx(7.4, .25, 4.4, jn, 0, 3.7, 0); bx(7.6, .4, 4.6, A.mat({ color: 0x1e3a3a }), 0, 4.1, 0); const ng = neon("GIANT DIPPER", "#ffd23a", 5.4); ng.position.set(0, 2.6, 2.02); gare.add(ng);
    let haut = 0, ph = new THREE.Vector3(); for (let i = 0; i < 64; i++) { voie.getPointAt(i / 64, p); if (p.y > haut) { haut = p.y; ph.copy(p); } }
    for (const [dx, c] of [[-.8, "#c8102e"], [.8, "#2a62d0"]]) { const mat2 = new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, 4, 6), A.mat({ color: 0xd8dce2 })); mat2.position.set(ph.x + dx, ph.y + 2, ph.z); scene.add(mat2);
      const dr = new THREE.Mesh(new THREE.PlaneGeometry(1.2, .75), A.mat({ map: tex(toile(64, 40, (x) => { x.fillStyle = "#f4f0e4"; x.fillRect(0, 0, 64, 40); x.fillStyle = c; for (let i = 0; i < 40; i += 8) x.fillRect(0, i, 64, 4); })), side: THREE.DoubleSide })); dr.position.set(ph.x + dx + .62, ph.y + 3.6, ph.z); scene.add(dr); (L.drapeaux = L.drapeaux || []).push(dr); } }
  const wagons = []; for (let k = 0; k < 4; k++) { const w = new THREE.Group(), c = new THREE.Mesh(new THREE.BoxGeometry(.9, .55, 1.4), A.mat({ color: k % 2 ? 0xd8b020 : 0xc82a24, roughness: .4 })); c.position.y = .45; w.add(c); scene.add(w); wagons.push(w); }
  // ---------- la grande roue, au fond à droite : elle tourne lentement, ses nacelles et ses ampoules ----------
  const roue = new THREE.Group(); roue.position.set(14, 12, -26); scene.add(roue); const RR = 10, nac = [];
  const metal = A.mat({ color: 0x2a62d0, metalness: .4, roughness: .4 });
  for (const dz of [-.6, .6]) { const t = new THREE.Mesh(new THREE.TorusGeometry(RR, .1, 6, 64), metal); t.position.z = dz; roue.add(t); }
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, r = new THREE.Mesh(new THREE.BoxGeometry(.08, RR, .08), metal); r.position.set(Math.cos(a) * RR / 2, Math.sin(a) * RR / 2, 0); r.rotation.z = a - Math.PI / 2; roue.add(r);
    for (let j = 0; j < 4; j++) { const bb = new THREE.Mesh(new THREE.SphereGeometry(.09, 6, 4), nuitMat([0xff4a4a, 0xffffff, 0x4ad8ff, 0xffd23a][(i + j) % 4])); bb.position.set(Math.cos(a) * RR * (j + 1) / 4, Math.sin(a) * RR * (j + 1) / 4, .7); roue.add(bb); bulbes.push(bb); } }
  for (let i = 0; i < 12; i++) { const n = new THREE.Group(), coul = [0xe8c020, 0xe0408a, 0xd83a24, 0xf0802a][i % 4], cab = new THREE.Mesh(new THREE.CylinderGeometry(.7, .55, .7, 12, 1, true), A.mat({ color: coul, side: THREE.DoubleSide, roughness: .4 })); cab.position.y = -.9; n.add(cab);
    const fond = new THREE.Mesh(new THREE.CircleGeometry(.55, 12), A.mat({ color: coul })); fond.rotation.x = -Math.PI / 2; fond.position.y = -1.25; n.add(fond);
    const anse = new THREE.Mesh(new THREE.TorusGeometry(.7, .04, 6, 16, Math.PI), A.mat({ color: 0xd8dce2, metalness: .6 })); anse.position.y = -.55; n.add(anse); scene.add(n); nac.push(n); }   // (les nacelles ouvertes, jaunes, roses, rouges, orange)
  { const moyeu = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, .3, 24), A.mat({ color: 0x2a62d0 })); moyeu.rotation.x = Math.PI / 2; moyeu.position.z = .75; roue.add(moyeu);
    const pl = new THREE.Mesh(new THREE.CircleGeometry(.85, 24), new THREE.MeshBasicMaterial({ map: tex(toile(128, 128, (x) => { x.fillStyle = "#f4f0e4"; x.beginPath(); x.arc(64, 64, 62, 0, 7); x.fill(); x.fillStyle = "#2a62d0"; x.font = "bold 22px Arial"; x.textAlign = "center"; x.fillText("SANTA", 64, 58); x.fillText("CARLA", 64, 84); })), toneMapped: false })); pl.position.z = .91; roue.add(pl); }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const j = new THREE.Mesh(new THREE.CylinderGeometry(.18, .25, 13.5, 8), metal); j.position.set(14 + sx * 3.4, 6, -26 + sz * .9); j.rotation.z = -sx * .26; scene.add(j); }
  // ---------- le manège de chevaux de bois, à droite de l'arche ----------
  const manege = new THREE.Group(); manege.position.set(32, 0, -20); scene.add(manege); const chevaux = [];
  { const socle = new THREE.Mesh(new THREE.CylinderGeometry(6, 6.2, .5, 32), A.mat({ color: 0x8a1a24, roughness: .5 })); socle.position.y = .25; manege.add(socle);
    const mat = new THREE.Mesh(new THREE.CylinderGeometry(.5, .5, 5, 12), A.mat({ color: 0xd8b020, metalness: .5 })); mat.position.y = 2.75; manege.add(mat);
    const rayT = tex(toile(512, 64, (x, w, h) => { for (let i = 0; i < 16; i++) { x.fillStyle = i % 2 ? "#f2ece0" : "#c82a24"; x.fillRect(i * 32, 0, 32, h); } }), 1, 1);
    const toit = new THREE.Mesh(new THREE.ConeGeometry(6.6, 2.2, 32, 1), A.mat({ map: rayT, roughness: .6 })); toit.position.y = 6.3; manege.add(toit);
    const frise = new THREE.Mesh(new THREE.CylinderGeometry(6.6, 6.6, .6, 32, 1, true), A.mat({ color: 0xd8b020, side: THREE.DoubleSide })); frise.position.y = 4.9; manege.add(frise);
    for (let i = 0; i < 32; i++) { const a = i / 32 * Math.PI * 2, bb = new THREE.Mesh(new THREE.SphereGeometry(.08, 6, 4), nuitMat(0xffe8a0)); bb.position.set(Math.cos(a) * 6.62, 4.9, Math.sin(a) * 6.62); manege.add(bb); bulbes.push(bb); }
    const robe = [0xf2ece0, 0x3a2418, 0xe8d8b0, 0x6a4a30];
    for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2, c = new THREE.Group(); c.position.set(Math.cos(a) * 4.4, 1.4, Math.sin(a) * 4.4); c.rotation.y = -a; manege.add(c);
      const m = A.mat({ color: robe[i % 4], roughness: .4 }), bx = (dx, dy, dz, px, py, pz, rz = 0) => { const o = new THREE.Mesh(new THREE.BoxGeometry(dx, dy, dz), m); o.position.set(px, py, pz); o.rotation.z = rz; c.add(o); };
      bx(.35, .45, 1.1, 0, 0, 0); bx(.25, .55, .3, 0, .4, .55, 0); bx(.22, .25, .45, 0, .62, .75); for (const [dx, dz] of [[-.1, -.4], [.1, -.4], [-.1, .4], [.1, .4]]) bx(.08, .6, .1, dx, -.45, dz);
      const tige = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, 4, 8), A.mat({ color: 0xd8b020, metalness: .7 })); tige.position.y = .6; c.add(tige); chevaux.push(c); } }
  // ---------- les palmiers, le long de la jetée et sur la plage ----------
  const palmier = (x, z, h = 9, pen = .6) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = hasard(x * 3 + z) * 6.28; scene.add(g);
    const c = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(pen * .3, h * .4, 0), new THREE.Vector3(pen, h, 0)]);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(c, 16, .2, 8), A.mat({ map: TX.ecorce, roughness: 1 })));
    const fm = A.mat({ map: TX.palme, alphaTest: .4, transparent: false, roughness: .8, side: THREE.DoubleSide, color: 0xb8c8a8 });
    for (let i = 0; i < 11; i++) { const f = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 3.6, 1, 6), fm), pa = f.geometry.attributes.position; for (let k = 0; k < pa.count; k++) { const y = pa.getY(k) + 1.8; pa.setZ(k, -y * y * .09); pa.setX(k, pa.getX(k) * (1 - y / 4.2)); }
      f.geometry.translate(0, 1.8, 0); f.rotation.set(-1.15 + (i % 2) * .25, i / 11 * Math.PI * 2, 0, "YXZ"); f.position.set(pen, h, 0); g.add(f); } };
  for (const [x, z] of [[-44, -12], [-36, -11], [6, -12], [44, -12], [40, 12], [-40, 14], [-30, 20], [8, 15], [-48, -30], [-4, -36], [2, -38], [26, -36], [36, -34], [46, -30], [-20, -42], [20, -44]]) palmier(x, z, 8 + hasard(x) * 4);   // (et derrière, en silhouette sur le couchant)
  // la pancarte « Welcome to Santa Carla », peinte, sur ses deux piliers de brique et leurs vases ; au dos, le graffiti du film
  { const g = new THREE.Group(); g.position.set(-11, 0, 15); g.rotation.y = .55; scene.add(g);
    const face = tex(toile(1024, 440, (x, w, h) => { const ci = x.createLinearGradient(0, 0, 0, h * .5); ci.addColorStop(0, "#7ab4e0"); ci.addColorStop(1, "#d8ecf4"); x.fillStyle = ci; x.fillRect(0, 0, w, h);
        x.fillStyle = "#8aa0b4"; x.beginPath(); x.moveTo(0, 210); for (let i = 0; i <= 10; i++) x.lineTo(i * w / 10, 190 - Math.sin(i * 1.3) * 26); x.lineTo(w, h); x.lineTo(0, h); x.fill();   // (les collines au loin)
        x.fillStyle = "#4a8a4a"; x.beginPath(); x.moveTo(0, 250); x.quadraticCurveTo(300, 200, 620, 260); x.lineTo(620, h); x.lineTo(0, h); x.fill();
        x.fillStyle = "#2a62b8"; x.beginPath(); x.moveTo(560, 270); x.quadraticCurveTo(800, 240, w, 250); x.lineTo(w, h); x.lineTo(520, h); x.fill(); x.fillStyle = "#e8d8a0"; x.beginPath(); x.moveTo(520, 300); x.quadraticCurveTo(640, 280, 720, 330); x.quadraticCurveTo(640, 380, 560, h); x.lineTo(500, h); x.fill();
        x.strokeStyle = "rgba(255,255,255,.7)"; x.lineWidth = 3; for (let i = 0; i < 9; i++) { x.beginPath(); x.moveTo(740 + i * 30, 300 + i * 9); x.lineTo(780 + i * 30, 296 + i * 9); x.stroke(); }
        for (const [bx2, by] of [[860, 280], [920, 300], [960, 270]]) { x.fillStyle = "#fff"; x.beginPath(); x.moveTo(bx2, by); x.lineTo(bx2 + 10, by - 24); x.lineTo(bx2 + 12, by); x.fill(); }
        x.fillStyle = "#f2ead8"; x.fillRect(150, 230, 40, 30); x.fillStyle = "#8a2a24"; x.beginPath(); x.moveTo(146, 232); x.lineTo(170, 214); x.lineTo(194, 232); x.fill();   // (une petite église)
        x.fillStyle = "#2a5a2a"; for (const [tx, ty] of [[80, 250], [260, 236], [420, 262], [480, 300]]) { x.beginPath(); x.arc(tx, ty, 22, 0, 7); x.fill(); }
        x.save(); x.translate(60, 120); x.rotate(-.12); x.fillStyle = "#1a1a1a"; x.font = "italic bold 54px 'Brush Script MT', 'Segoe Script', cursive"; x.fillText("Welcome to", 0, 0); x.restore();
        const gr = x.createLinearGradient(0, 70, 0, 200); gr.addColorStop(0, "#ffd23a"); gr.addColorStop(1, "#f06a10"); x.font = "900 128px 'Arial Black', Impact, sans-serif"; x.lineJoin = "round";
        x.lineWidth = 16; x.strokeStyle = "#5a1a0a"; x.textAlign = "center"; x.strokeText("SANTA CARLA", w / 2 + 40, 196, w - 150); x.fillStyle = gr; x.fillText("SANTA CARLA", w / 2 + 40, 196, w - 150); x.textAlign = "left";   /* (rétréci au besoin : il tient toujours entier dans le cadre) */
        x.strokeStyle = "#5a3a2a"; x.lineWidth = 14; x.strokeRect(7, 7, w - 14, h - 14); }));
    const dos = tex(toile(1024, 440, (x, w, h) => { x.fillStyle = "#6a6258"; x.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { x.fillStyle = "rgba(0,0,0,.06)"; x.fillRect(0, i * 11, w, 2); }
        x.save(); x.translate(90, 260); x.rotate(-.06); x.fillStyle = "#c80a10"; x.font = "bold 70px 'Marker Felt', 'Comic Sans MS', sans-serif"; x.fillText("MURDER CAPITAL", 0, 0); x.fillText("OF THE WORLD", 60, 90); x.restore();
        x.fillStyle = "rgba(200,10,16,.6)"; for (let i = 0; i < 14; i++) x.fillRect(110 + i * 55, 270 + (i % 3) * 20, 4, 30 + (i % 4) * 14); }));   // (les coulures de peinture)
    const W2 = 7, H2 = 3;
    const panneau = new THREE.Mesh(new THREE.BoxGeometry(W2, H2, .2), [A.mat({ color: 0x5a3a2a }), A.mat({ color: 0x5a3a2a }), A.mat({ color: 0x5a3a2a }), A.mat({ color: 0x5a3a2a }), A.mat({ map: face, roughness: .6, emissive: 0xffffff, emissiveMap: face, emissiveIntensity: .25 }), A.mat({ map: dos, roughness: .8 })]);
    panneau.position.y = 3.2; g.add(panneau);
    const brique = A.mat({ map: tex(toile(128, 128, (x) => { x.fillStyle = "#8a3a2a"; x.fillRect(0, 0, 128, 128); x.fillStyle = "#c8b8a0"; for (let r = 0; r < 8; r++) { x.fillRect(0, r * 16, 128, 2); for (let c = 0; c < 4; c++) x.fillRect(c * 32 + (r % 2) * 16, r * 16, 2, 16); } }), 1, 3), roughness: .9 });
    const vase = new THREE.LatheGeometry([[0, 0], [.26, 0], [.18, .1], [.3, .35], [.32, .55], [.2, .68], [.12, .7], [.16, .8], [0, .85]].map(([r, y]) => new THREE.Vector2(r, y)), 14);
    for (const sx of [-1, 1]) { const pil = new THREE.Mesh(new THREE.BoxGeometry(.7, 4.9, .7), brique); pil.position.set(sx * (W2 / 2 + .2), 2.45, -.1); g.add(pil);
      const ch = new THREE.Mesh(new THREE.BoxGeometry(.85, .15, .85), A.mat({ color: 0xc8c0b0 })); ch.position.set(sx * (W2 / 2 + .2), 4.97, -.1); g.add(ch);
      const v = new THREE.Mesh(vase, A.mat({ color: 0xb8b0a0, roughness: .7 })); v.position.set(sx * (W2 / 2 + .2), 5.04, -.1); g.add(v); }
    for (const sx of [-1, 1]) { const l = new THREE.SpotLight(0xffe8c0, 25, 9, .7, .5, 1.2); l.position.set(sx * 2, .4, 2.5); l.target.position.set(0, 3.2, 0); g.add(l, l.target); } }
  // ---------- au loin : les falaises, le pont de chemin de fer, et le phare ----------
  const roc = A.mat({ color: 0x1a1c24, roughness: 1 });
  // (les falaises : des blocs de grès arrondis, creusés par la mer — la forme bosselée, les strates, la couleur qui varie)
  const rocT = tex(toile(256, 256, (x, w, h) => { x.fillStyle = "#6a5a4a"; x.fillRect(0, 0, w, h); for (let i = 0; i < 60; i++) { x.fillStyle = `rgba(${hasard(i) > .5 ? "40,32,26" : "150,130,104"},${.12 + hasard(i * 3) * .18})`; x.fillRect(0, hasard(i * 7) * h, w, 2 + hasard(i * 5) * 9); }
    for (let i = 0; i < 2500; i++) { x.fillStyle = `rgba(${hasard(i) > .5 ? "20,16,12" : "190,170,140"},.25)`; x.fillRect(hasard(i * 1.3) * w, hasard(i * 2.1) * h, 2, 2); } }), 3, 3);
  for (const [x, z, sz] of [[-70, 10, 14], [-62, 30, 18], [-78, -10, 16], [70, 0, 12], [80, 24, 16]]) { const geo = new THREE.IcosahedronGeometry(sz, 4), pa = geo.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < pa.count; i++) { v.fromBufferAttribute(pa, i); const n = v.clone().normalize(), b = Math.sin(n.x * 4.1 + x) * Math.cos(n.y * 3.3) * .14 + Math.sin(n.z * 7.3 + n.x * 5.1) * .07 + Math.sin(n.y * 13 + n.z * 11) * .03; v.multiplyScalar(1 + b); if (v.y < 0) v.y *= .2; pa.setXYZ(i, v.x, v.y, v.z); }
    geo.computeVertexNormals(); const m = new THREE.Mesh(geo, A.mat({ map: rocT, roughness: .95, color: 0xb8a898 })); m.position.set(x, sz * .05, z); m.scale.set(1.2, .75, 1); m.rotation.y = hasard(x) * 6; scene.add(m); }
  { const pont = new THREE.Group(); pont.position.set(-58, 0, -40); scene.add(pont); for (let i = 0; i < 14; i++) { const p = new THREE.Mesh(new THREE.BoxGeometry(.4, 18, .4), bois); p.position.set(i * 3, 9, 0); pont.add(p); const c = new THREE.Mesh(new THREE.BoxGeometry(.2, 6, .2), bois); c.position.set(i * 3 + 1.5, 9, 0); c.rotation.z = .45; pont.add(c); }
    const tab = new THREE.Mesh(new THREE.BoxGeometry(42, .6, 3), bois); tab.position.set(19.5, 18.2, 0); pont.add(tab); }   // (le pont de chemin de fer, où David met Michael à l'épreuve)
  { const ph = new THREE.Group(); ph.position.set(74, 0, 22); scene.add(ph); const t = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.4, 12, 12), A.mat({ color: 0xe8e4da })); t.position.y = 16; ph.add(t);
    const f = new THREE.Mesh(new THREE.SphereGeometry(.8, 10, 8), nuitMat(0xfff2c0)); f.position.y = 22.6; ph.add(f); const fais = new THREE.Mesh(new THREE.ConeGeometry(3, 40, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff2c0, transparent: true, opacity: .07, side: THREE.DoubleSide, depthWrite: false }));
    fais.rotation.z = Math.PI / 2; fais.position.set(-20, 22.6, 0); const pivot = new THREE.Group(); pivot.position.y = 0; pivot.add(fais); ph.add(pivot); L.phare = pivot; }
  // ---------- les limites : la jetée et la plage (pas l'eau, pas les stands, pas l'arche) ----------
  { const tb = new THREE.TextureLoader().load("images/santacarla/beton.webp"); tb.colorSpace = THREE.SRGBColorSpace; tb.wrapS = tb.wrapT = THREE.MirroredRepeatWrapping; tb.repeat.set(96 / 5, 40 / 2.5); tb.anisotropy = 8;
    const pl = A.ajoute(new THREE.PlaneGeometry(96, 40), A.mat({ map: tb, roughness: .9 }), 0, .015, -26, false); pl.rotation.x = -Math.PI / 2; pl.receiveShadow = true; L.solsPlus = [pl, sable]; }   // (la grande place, en béton, derrière la jetée en planches)
  L.limites = (x, z) => x > -45 && x < 45 && z > -37.6 && z < 66 && !(z > 5.9 && z < 6.5 && Math.abs(Math.abs(x) - 20) > 1.5)
    && !(x > -15.6 && x < -8.4 && z > -18.2 && z < -13.8)   // (la gare du Giant Dipper : on passe sous le grand huit)
    && !(x > 8.2 && x < 19.8 && z > -28 && z < -24)   // (les pieds de la grande roue)
    && ![[-7.5, -24.4], [-7.5, -17.6], [5.5, -24.4], [5.5, -17.6]].some(([a, b]) => Math.hypot(x - a, z - b) < .6)   // (les pieds du bateau pirate : on passe dessous)
    && Math.hypot(x - 32, z + 20) > 6.3   // (le manège)
    && !(Math.abs(Math.abs(x) - 4.5) < .5 && Math.abs(z + 8.6) < .5)   // (les piliers de l'arche)
    && !(Math.abs(z + 6.95) < .5 && [-40, -13.3, 13.3, 40].some(px => Math.abs(x - px) < .5));   // (les poteaux du télésiège)   // (la rambarde : deux passages vers la plage)
  L.hauteur = (x, z, p) => p && p.vol != null ? p.vol : 0;   // (les vampires volent)
  L.depart = [0, 1.5]; L.cam = { pos: [0, 6, 14], vise: [0, 2.5, -6] }; L.suivi = { d: 6, h: 3, av: 3, vy: 1.6 };
  L.sansPNJ = true; L.sansMusique = true; L.toujoursNuit = true; L.santaCarla = true;
  // le ciel du couchant : la photo envoyée (le bleu, le rose, l'orange au-dessus de la mer, les vrais nuages), tout autour de la place
  L.cielPerso = new THREE.TextureLoader().load("images/santacarla/ciel-nuit.webp"); L.cielAube = new THREE.TextureLoader().load("images/santacarla/ciel.webp"); L.cielAube.colorSpace = THREE.SRGBColorSpace; L.cielPerso.colorSpace = THREE.SRGBColorSpace;   // (le vrai ciel du couchant, d'après la photo : l'orange au-dessus de la mer, le bleu et le rose, les vrais nuages)
  L.cielPerso.mapping = THREE.EquirectangularReflectionMapping; L.cielAube.mapping = THREE.EquirectangularReflectionMapping; L.brumePerso = 0x0a0e1c;
  // ---------- l'animation des manèges ----------
  let tr = 0; const avant = L.anim;
  L.anim = (t) => { avant && avant(t); const s = t / 1000;
    roue.rotation.z = s * .12; nac.forEach((n, i) => { const a = i / 12 * Math.PI * 2 + s * .12; n.position.set(14 + Math.cos(a) * RR, 12 + Math.sin(a) * RR, -26); });
    manege.rotation.y = s * .35; chevaux.forEach((c, i) => { c.position.y = 1.4 + Math.sin(s * 2.2 + i * 1.3) * .3; });
    tr = (s * .045) % 1; wagons.forEach((w, k) => { const u = (tr + 1 - k * .008) % 1, p = voie.getPointAt(u), tg = voie.getTangentAt(u); w.position.copy(p); w.lookAt(p.x + tg.x, p.y + tg.y, p.z + tg.z); });
    if (L.phare) L.phare.rotation.y = s * .6; (L.drapeaux || []).forEach((d, i) => { d.rotation.y = Math.sin(s * 3 + i) * .35; }); merT.offset.x = s * .004; vagues.t.value = s; ecumes.forEach((e, i) => { const u = (s * .14 + i / 3) % 1; e.position.z = 72 - u * 5; e.material.opacity = Math.sin(u * Math.PI) * .75; });
    const cl = Math.floor(s * 3); bulbes.forEach((b, i) => { b.visible = (i + cl) % 7 !== 0; });   // (les ampoules qui clignotent)
    combat(t); };
  // ================= les détails de la vraie jetée (d'après les photos) =================
  const OBST = [];   // (les petits obstacles posés sur la jetée : bancs, tables, panneau, vitrine)
  const bxg = (g, dx, dy, dz, m, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(dx, dy, dz), m); o.position.set(x, y, z); g.add(o); return o; };
  const cyl = (g, r1, r2, h, m, x, y, z, seg = 12) => { const o = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg), m); o.position.set(x, y, z); g.add(o); return o; };
  const tube = (g, a, b, r, m) => { const d = b.clone().sub(a), o = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), 8), m); o.position.copy(a).add(b).multiplyScalar(.5); o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); g.add(o); return o; };
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  // la lumière du couchant (comme sur les photos) : le ciel chaud, la lueur basse à l'ouest ; et les lampadaires de la grande place
  // la nuit : la lumière bleutée de la lune ; à la fin, une fois David tué, le ciel orangé revient peu à peu (crescendo)
  const hemi = new THREE.HemisphereLight(0x5a6898, 0x14141c, .55), lune = new THREE.DirectionalLight(0x8a9ac8, .55); lune.position.set(30, 40, 120); scene.add(hemi, lune);
  { const geo = new THREE.SphereGeometry(280, 48, 24), aube = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: L.cielAube, side: THREE.BackSide, transparent: true, opacity: 0, depthWrite: false, fog: false, toneMapped: true }));
    aube.renderOrder = -10; aube.visible = false; scene.add(aube); L.aube = { k: 0, t0: 0, D: 30000, mesh: aube };
    const C = (h) => new THREE.Color(h), N = { hc: C(0x5a6898), hg: C(0x14141c), hi: .55, lc: C(0x8a9ac8), li: .55, f: C(0x0a0e1c) }, J = { hc: C(0xffc8a0), hg: C(0x30242c), hi: .85, lc: C(0xffa868), li: 1.1, f: C(0x4a3446) };
    const av = L.anim; L.anim = (t) => { av && av(t); const A2 = L.aube; if (A2.t0) A2.k = Math.min(1, (performance.now() - A2.t0) / A2.D); const k = A2.k * A2.k * (3 - 2 * A2.k);
      aube.visible = k > 0; aube.material.opacity = k; if (M && M.camera) aube.position.copy(M.camera.position);
      hemi.color.copy(N.hc).lerp(J.hc, k); hemi.groundColor.copy(N.hg).lerp(J.hg, k); hemi.intensity = N.hi + (J.hi - N.hi) * k; lune.color.copy(N.lc).lerp(J.lc, k); lune.intensity = N.li + (J.li - N.li) * k;
      lune.position.set(30 - 110 * k, 40 - 18 * k, 120 - 90 * k); if (scene.fog) scene.fog.color.copy(N.f).lerp(J.f, k); if (L.merVagues) { const em = k > .5 ? L.cielAube : L.cielPerso; if (L.merVagues.envMap !== em) { L.merVagues.envMap = em; L.merVagues.needsUpdate = true; } } }; }
  for (const [x, z] of [[0, -12], [22, -12], [38, -12], [38, -30], [24, -33], [0, -31], [-4, -12]]) { const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g); const fv = A.mat({ color: 0x1a2e24, metalness: .5, roughness: .4 });
    cyl(g, .08, .12, 4.4, fv, 0, 2.2, 0, 8);
    for (const sx of [-.45, .45]) { const gl = new THREE.Mesh(new THREE.SphereGeometry(.2, 12, 8), new THREE.MeshBasicMaterial({ color: 0xfff0c8, toneMapped: false })); gl.position.set(sx, 4.62, 0); g.add(gl); tube(g, V3(0, 4.1, 0), V3(sx, 4.4, 0), .035, fv); }
    if ((x + z) % 2 === 0) { const l = new THREE.PointLight(0xffd8a0, 16, 18, 1.5); l.position.set(0, 4.3, 0); g.add(l); } }
  // ---------- le télésiège « Sky Glider » : les poteaux rayés de couleurs, les câbles, les nacelles qui glissent au-dessus de la jetée ----------
  const raye = tex(toile(64, 512, (x, w, h) => { const C = ["#d83a2a", "#2a9a5a", "#2aa49a", "#f0a02a", "#e8c832"]; let y = 0, i = 0; while (y < h) { const lg = 40 + hasard(i) * 90; x.fillStyle = C[i % 5]; x.fillRect(0, y, w, lg); y += lg; i++; } }), 1, 1);
  const SG = { x0: -40, x1: 40, za: -6.3, zr: -7.6, h: 9.6 }, cabines = [];
  for (const px of [-40, -13.3, 13.3, 40]) { const g = new THREE.Group(); g.position.set(px, 0, -6.95); scene.add(g); cyl(g, .22, .28, SG.h + .8, A.mat({ map: raye, roughness: .5 }), 0, (SG.h + .8) / 2, 0); cyl(g, .5, .6, .3, A.mat({ color: 0xf0a02a }), 0, .15, 0);
    bxg(g, .25, .25, 1.9, A.mat({ color: 0xd83a2a }), 0, SG.h + .5, 0); for (const dz of [SG.za + 6.95, SG.zr + 6.95]) { const r = cyl(g, .28, .28, .1, A.mat({ color: 0x2a2a2e, metalness: .6 }), 0, SG.h + .3, dz, 16); r.rotation.z = Math.PI / 2; }
    for (let k = 0; k < 18; k++) { const bb = new THREE.Mesh(new THREE.SphereGeometry(.06, 6, 4), nuitMat(0xffe8a0)); bb.position.set(.25, .8 + k * .5, 0); g.add(bb); bulbes.push(bb); } }   // (la rangée d'ampoules le long du poteau)
  for (const z of [SG.za, SG.zr]) { const pts2 = []; for (let i = 0; i <= 60; i++) { const x = SG.x0 + i / 60 * (SG.x1 - SG.x0), f = ((x - SG.x0) % 26.67) / 26.67; pts2.push(V3(x, SG.h + .25 - Math.sin(f * Math.PI) * .5, z)); }
    scene.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts2), 120, .025, 5), A.mat({ color: 0x1a1a1e, metalness: .7 }))); }
  for (let i = 0; i < 14; i++) { const g = new THREE.Group(); scene.add(g); const vert = A.mat({ color: 0x1f6a5a, roughness: .35, metalness: .3 }), noir = A.mat({ color: 0x1a1a1e, metalness: .6 });
    cyl(g, .025, .025, 1.1, noir, 0, -.55, 0, 6); const toit = new THREE.Mesh(new THREE.SphereGeometry(.62, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2), vert); toit.scale.y = .45; toit.position.y = -1.15; g.add(toit);
    cyl(g, .64, .64, .08, vert, 0, -1.17, 0, 18); const bq = new THREE.Mesh(new THREE.CylinderGeometry(.64, .5, .55, 18, 1, true), A.mat({ color: 0x1f6a5a, roughness: .35, metalness: .3, side: THREE.DoubleSide })); bq.position.y = -2.25; g.add(bq);
    cyl(g, .5, .5, .04, vert, 0, -2.52, 0, 18); for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; tube(g, V3(Math.cos(a) * .6, -1.2, Math.sin(a) * .6), V3(Math.cos(a) * .62, -2, Math.sin(a) * .62), .015, A.mat({ color: 0xc8ccd2, metalness: .7 })); }
    const num = new THREE.Mesh(new THREE.PlaneGeometry(.34, .2), new THREE.MeshBasicMaterial({ map: tex(toile(64, 40, (x) => { x.fillStyle = "#1f6a5a"; x.fillRect(0, 0, 64, 40); x.fillStyle = "#f2efe6"; x.font = "italic bold 26px Arial"; x.textAlign = "center"; x.fillText(String(20 + i), 32, 30); })) }));
    num.position.set(0, -2.25, .65); g.add(num); cabines.push(g); }
  // ---------- le bateau pirate : le grand portique blanc, le bateau qui se balance, l'enseigne en ampoules ----------
  const pirate = { pivot: V3(-1, 12, -21) }; { const g = new THREE.Group(); scene.add(g); const blanc2 = A.mat({ color: 0xe8e4da, roughness: .5, metalness: .2 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) tube(g, V3(-1 + sx * 6.5, 0, -21 + sz * 3.4), V3(-1, 12, -21 + sz * 1.6), .2, blanc2);
    for (const sz of [-1, 1]) for (let k = 1; k < 4; k++) { const f = k / 4, y = 12 * f; tube(g, V3(-1 - 6.5 * (1 - f), y, -21 + sz * (3.4 - 1.8 * f)), V3(-1 + 6.5 * (1 - f), y, -21 + sz * (3.4 - 1.8 * f)), .07, blanc2); }
    tube(g, V3(-1, 12, -23.2), V3(-1, 12, -18.8), .3, blanc2);   // (l'axe)
    const lettres = new THREE.TextureLoader().load("images/santacarla/pirate-enseigne.webp"); lettres.colorSpace = THREE.SRGBColorSpace;   // (la vraie enseigne en ampoules, d'après la photo)
    const ens = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 5.7), new THREE.MeshBasicMaterial({ map: lettres, transparent: true, alphaTest: .35, toneMapped: false, side: THREE.DoubleSide, color: 0xe8e0d8 })); ens.position.set(-1.6, 8.7, -18.6); g.add(ens);
    const bras = new THREE.Group(); bras.position.copy(pirate.pivot); scene.add(bras); pirate.bras = bras;
    for (const sz of [-.9, .9]) tube(bras, V3(0, 0, sz), V3(0, -9, sz), .14, blanc2);
    const coque = new THREE.Shape(); coque.moveTo(-4.2, 1.2); coque.quadraticCurveTo(-3.6, -1, 0, -1.3); coque.quadraticCurveTo(3.6, -1, 4.2, 1.2); coque.lineTo(-4.2, 1.2);
    const ship = new THREE.Mesh(new THREE.ExtrudeGeometry(coque, { depth: 2.4, bevelEnabled: false }), A.mat({ map: tex(toile(256, 64, (x, w, h) => { x.fillStyle = "#6a3a1e"; x.fillRect(0, 0, w, h); for (let i = 0; i < 8; i++) { x.fillStyle = "rgba(0,0,0,.25)"; x.fillRect(0, i * 8, w, 1); } x.fillStyle = "#c81e1e"; x.fillRect(0, 10, w, 6); x.fillStyle = "#e8c832"; x.fillRect(0, 18, w, 2); }), 2, 1), roughness: .6 }));
    ship.position.set(0, -10.3, -1.2); bras.add(ship);
    for (let k = -3; k <= 3; k++) bxg(bras, .35, .3, 2.2, A.mat({ color: 0x4a2a14 }), k * 1.05, -9.4, 0);   // (les bancs)
    cyl(bras, .06, .08, 3.2, A.mat({ color: 0x4a2a14 }), 0, -7.6, 0); const voile2 = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.4), A.mat({ color: 0x1a1a1a, side: THREE.DoubleSide })); voile2.position.set(0, -6.6, 0); bras.add(voile2);
    const crane = new THREE.Mesh(new THREE.PlaneGeometry(.7, .7), new THREE.MeshBasicMaterial({ map: tex(toile(64, 64, (x) => { x.fillStyle = "#f2efe6"; x.beginPath(); x.arc(32, 26, 16, 0, 7); x.fill(); x.fillRect(24, 34, 16, 10); x.fillStyle = "#1a1a1a"; x.beginPath(); x.arc(26, 26, 4, 0, 7); x.arc(38, 26, 4, 0, 7); x.fill(); x.strokeStyle = "#f2efe6"; x.lineWidth = 5; x.beginPath(); x.moveTo(12, 46); x.lineTo(52, 60); x.moveTo(52, 46); x.lineTo(12, 60); x.stroke(); })), transparent: true, side: THREE.DoubleSide })); crane.position.set(0, -6.6, .02); bras.add(crane); }
  // ---------- la Colonnade (1907), au bout de la jetée : ses arcades aux colonnes rouges, son étage, sa corniche verte, ses drapeaux ----------
  { const g = new THREE.Group(); g.position.set(46, 0, 0); scene.add(g); const crem = peint(0xece4d2, .8), rougeC = A.mat({ color: 0x8a2a24, roughness: .5 }), vertC = A.mat({ color: 0x2a8a7a });
    const fac = tex(toile(1024, 512, (x, w, h) => { x.fillStyle = "#ece4d2"; x.fillRect(0, 0, w, h); x.fillStyle = "#2a8a7a"; x.fillRect(0, 0, w, 24); x.fillStyle = "#8a2a24"; x.fillRect(0, 24, w, 10); x.fillRect(0, 236, w, 14);
        for (let i = 0; i < 9; i++) { const X = 30 + i * 110; x.fillStyle = "#3a2a24"; x.fillRect(X, 60, 80, 120); x.fillStyle = "#ffcf7a"; x.globalAlpha = .55; x.fillRect(X + 6, 66, 32, 108); x.fillRect(X + 42, 66, 32, 108); x.globalAlpha = 1; x.fillStyle = "#ece4d2"; x.fillRect(X + 38, 60, 4, 120); x.fillRect(X, 118, 80, 4); }
        x.fillStyle = "#3a2420"; x.font = "bold 30px Georgia"; x.textAlign = "center"; x.fillText("THE COLONNADE · 1907", w / 2, 230);
        for (let i = 0; i < 8; i++) { const X = 64 + i * 122; x.fillStyle = "#2a1a14"; x.beginPath(); x.moveTo(X - 52, h); x.lineTo(X - 52, 330); x.arc(X, 330, 52, Math.PI, 0); x.lineTo(X + 52, h); x.fill(); x.fillStyle = "rgba(255,200,120,.35)"; x.beginPath(); x.arc(X, 380, 26, 0, 7); x.fill(); } }));
    { const te = new THREE.TextureLoader().load("images/santacarla/colonnade-etage.webp"); te.colorSpace = THREE.SRGBColorSpace; te.wrapS = THREE.RepeatWrapping; te.repeat.set(4, 1);
      const et = new THREE.Mesh(new THREE.PlaneGeometry(20, 3.9), A.mat({ map: te, roughness: .8, emissive: 0xffffff, emissiveMap: te, emissiveIntensity: .22 })); et.rotation.y = -Math.PI / 2; et.position.set(-.06, 7.1, 0); g.add(et); }   // (l'étage, d'après la photo)
    bxg(g, 6, 9, 20, crem, 3, 4.5, 0); const f = new THREE.Mesh(new THREE.PlaneGeometry(20, 9), A.mat({ map: fac, roughness: .8, emissive: 0xffffff, emissiveMap: fac, emissiveIntensity: .12 })); f.rotation.y = -Math.PI / 2; f.position.set(-.02, 4.5, 0); g.add(f);
    for (let i = 0; i <= 8; i++) { const z = -10 + i * 2.38 + .1; cyl(g, .22, .26, 4.2, rougeC, -.5, 2.1, z); cyl(g, .32, .32, .18, crem, -.5, 4.25, z); }   // (les colonnes rouges, devant les arcades)
    bxg(g, 1.2, .3, 20.4, vertC, -.4, 4.45, 0); bxg(g, 6.4, .5, 20.4, vertC, 3, 9.2, 0); bxg(g, 6.2, .9, 1.4, crem, 3, 9.9, 0);
    for (const z of [-7, 0, 7]) { cyl(g, .03, .03, 3, A.mat({ color: 0xd8dce2 }), 1.5, 11, z, 6); const dr = new THREE.Mesh(new THREE.PlaneGeometry(1.1, .7), A.mat({ color: [0xc81e1e, 0xe8c832, 0x2a62d0][(z / 7 + 1) | 0], side: THREE.DoubleSide })); dr.position.set(1.5, 12.1, z + .56); g.add(dr); (L.drapeaux = L.drapeaux || []).push(dr); }
    for (let i = 0; i < 40; i++) { const bb = new THREE.Mesh(new THREE.SphereGeometry(.06, 6, 4), nuitMat(0xffe8a0)); bb.position.set(-.55, 4.7, -10 + i * .5); g.add(bb); bulbes.push(bb); }
    const l = new THREE.PointLight(0xffc880, 14, 14, 1.6); l.position.set(-2, 3.5, 0); g.add(l); }
  // ---------- les montagnes russes en acier (le Hurricane, sur son restaurant) : la vraie, d'après la photo détourée, dressée à l'angle de la place ----------
  { const t = new THREE.TextureLoader().load("images/santacarla/ouragan.webp"); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(27, 27.4), new THREE.MeshStandardMaterial({ map: t, transparent: true, alphaTest: .4, side: THREE.DoubleSide, roughness: .8, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: .32 }));
    m.position.set(52, 13.7 - .3, -31); m.rotation.y = Math.atan2(-52, 21); scene.add(m); }
  // ---------- les boutiques colorées (façon « World Grill ») et la façade de l'arcade aux triangles rouges percés de ronds ----------
  { const g = new THREE.Group(); g.position.set(-44.2, 0, 0); g.rotation.y = Math.PI / 2; scene.add(g);   // (le vrai World Grill, d'après la photo détourée : au bout de la jetée, face à elle)
    const t = new THREE.TextureLoader().load("images/santacarla/grill.webp"); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; const W = 9.4, H = W * 659 / 561;
    const f = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshStandardMaterial({ map: t, transparent: true, alphaTest: .45, roughness: .8, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: .3 })); f.position.set(0, H / 2, 0); g.add(f);
    bxg(g, W * .9, 5.1, 5, A.mat({ color: 0xd8823a, roughness: .85 }), -.3, 2.55, -2.6);   // (le volume de la boutique, derrière la façade)
    const toitG = new THREE.Mesh(new THREE.ConeGeometry(4.6, 2.2, 4), A.mat({ color: 0x2a2a30, roughness: .9 })); toitG.rotation.y = Math.PI / 4; toitG.scale.set(1.25, 1, .75); toitG.position.set(-.3, 6.2, -2.6); g.add(toitG);
    const lG = new THREE.PointLight(0xffb070, 10, 12, 1.6); lG.position.set(0, 3, 3); g.add(lG); OBST.push([-45, -43.6, -4.9, 4.9]); }
  { const tri = new THREE.Shape(); tri.moveTo(-1.1, 0); tri.lineTo(1.1, 0); tri.lineTo(0, 3.6); tri.closePath(); for (const [y, r] of [[.8, .28], [1.7, .22], [2.5, .15]]) { const h = new THREE.Path(); h.absarc(0, y, r, 0, Math.PI * 2, false); tri.holes.push(h); }
    const triG = new THREE.ExtrudeGeometry(tri, { depth: .12, bevelEnabled: false }), rougeT = A.mat({ color: 0xd8302a, roughness: .5 }), creme = A.mat({ color: 0xf2e6c8 });
    for (const xs of [-30, 30]) for (let k = 0; k < 3; k++) { const m = new THREE.Mesh(triG, k % 2 ? creme : rougeT); m.position.set(xs - 1.6 + k * 1.6, 3.2, -38.32); m.rotation.x = 0; scene.add(m); } }   // (sur l'arcade et les autos tamponneuses)
  // ---------- le panneau « Lookit What I Caught! », où l'on passe la tête ----------
  { const g = new THREE.Group(); g.position.set(8, 0, 4.7); scene.add(g);
    const peint = new THREE.TextureLoader().load("images/santacarla/sirene.webp"); peint.colorSpace = THREE.SRGBColorSpace;   // (le vrai panneau, d'après la photo ; les deux trous pour passer la tête)
    const pan = new THREE.Mesh(new THREE.PlaneGeometry(1.75, 2.12), A.mat({ map: peint, alphaTest: .5, side: THREE.DoubleSide, roughness: .6, emissive: 0xffffff, emissiveMap: peint, emissiveIntensity: .2 })); pan.position.y = 1.2; pan.rotation.y = Math.PI; g.add(pan);
    for (const sx of [-.92, .92]) cyl(g, .04, .04, 2.3, A.mat({ color: 0xd8dce2, metalness: .8, roughness: .2 }), sx, 1.15, 0, 8);
    OBST.push([6.7, 9.3, 4.4, 5.0]); }
  // ---------- Laffing Sal, dans sa vitrine : elle rit quand on s'approche ----------
  const sal = { pos: V3(-9, 0, -6.7) }; { const g = new THREE.Group(); g.position.copy(sal.pos); scene.add(g);
    const tFer = new THREE.TextureLoader().load("images/santacarla/sal.webp"); tFer.colorSpace = THREE.SRGBColorSpace; const tOuv = tFer, mat2 = new THREE.MeshBasicMaterial({ map: tFer, toneMapped: false, color: 0xe8e0e8 }), fig = new THREE.Mesh(new THREE.PlaneGeometry(1.48, 1.46), mat2); fig.position.set(0, 2.0, .05); g.add(fig);   // (la vraie Sal, d'après la photo)
    const bois2 = A.mat({ color: 0x6a3a1e, roughness: .5 }); bxg(g, 1.6, 1, .9, bois2, 0, .5, -.1); bxg(g, 1.6, .2, .9, bois2, 0, 2.9, -.1); for (const sx of [-.78, .78]) bxg(g, .06, 1.9, .9, bois2, sx, 1.95, -.1);
    const vitre2 = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.85), new THREE.MeshBasicMaterial({ color: 0xc8e0ff, transparent: true, opacity: .12, depthWrite: false })); vitre2.position.set(0, 1.95, .34); g.add(vitre2);
    const fond2 = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.85), new THREE.MeshBasicMaterial({ color: 0x8a6ac8, toneMapped: false })); fond2.position.set(0, 1.95, -.5); g.add(fond2);
    const pan2 = neon("LAFFING SAL", "#ffd23a", 1.6); pan2.position.set(0, 3.25, .35); g.add(pan2); const l2 = new THREE.PointLight(0xd8a8ff, 4, 4, 1.6); l2.position.set(0, 2.4, .9); g.add(l2);
    Object.assign(sal, { tOuv, tFer, mat: mat2, fig, rit: 0 }); OBST.push([-9.9, -8.1, -7.2, -6.2]); }
  // ---------- les bancs face à la mer, les tables à parasols rayés, les poubelles ----------
  for (const x of [-34, -18, -6, 18, 34]) { const g = new THREE.Group(); g.position.set(x, 0, 5.3); scene.add(g); const fer = A.mat({ color: 0x1e3a2a, metalness: .5 }), latte = A.mat({ color: 0x8a5a32, roughness: .7 });
    for (let k = 0; k < 4; k++) bxg(g, 2, .05, .1, latte, 0, .48, -.18 + k * .12); for (let k = 0; k < 3; k++) bxg(g, 2, .1, .04, latte, 0, .65 + k * .14, .22); for (const sx of [-.9, .9]) { bxg(g, .06, .48, .5, fer, sx, .24, 0); bxg(g, .06, .5, .06, fer, sx, .72, .22); } OBST.push([x - 1.1, x + 1.1, 4.95, 5.6]); }
  for (const x of [-26, -10, 10, 26]) { const g = new THREE.Group(); g.position.set(x, 0, -4.6); scene.add(g); const bois3 = A.mat({ color: 0x7a5232, roughness: .7 });
    bxg(g, 1.6, .06, .8, bois3, 0, .74, 0); for (const sz of [-.55, .55]) bxg(g, 1.6, .05, .3, bois3, 0, .45, sz); bxg(g, .1, .74, .1, bois3, 0, .37, 0); cyl(g, .025, .025, 2.4, A.mat({ color: 0xd8dce2 }), 0, 1.2, 0, 6);
    const par = new THREE.Mesh(new THREE.ConeGeometry(1.3, .5, 12, 1, true), A.mat({ map: tex(toile(256, 32, (q, w, h) => { const C = ["#d83a2a", "#f0a02a", "#2a9a5a", "#e8c832"]; for (let i = 0; i < 12; i++) { q.fillStyle = C[(i + (x > 0 ? 1 : 0)) % 4]; q.fillRect(i * w / 12, 0, w / 12, h); } })), side: THREE.DoubleSide })); par.position.y = 2.35; g.add(par); OBST.push([x - .9, x + .9, -5.3, -3.9]); }
  for (const x of [-22, -2, 2, 22]) { const g = new THREE.Group(); g.position.set(x, 0, -5.9); scene.add(g); cyl(g, .28, .25, .95, A.mat({ color: x < 0 ? 0x1a3a8a : 0x1a1a1e }), 0, .48, 0); cyl(g, .3, .3, .06, A.mat({ color: 0x2a2a2e }), 0, .98, 0); }
  // les lampadaires à l'ancienne : le fût vert sombre, deux globes de verre sur leurs bras
  for (let x = -42; x <= 42; x += 12) for (const z of [5.4, -5.4]) { const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g); const fv = A.mat({ color: 0x1a2e24, metalness: .5, roughness: .4 });
    for (const sx of [-.45, .45]) { tube(g, V3(0, 4.1, 0), V3(sx, 4.4, 0), .035, fv); const gl = new THREE.Mesh(new THREE.SphereGeometry(.2, 12, 8), nuitMat(0xfff0c8)); gl.position.set(sx, 4.62, 0); g.add(gl); } }
  // ---------- quelques lumières de couleur (les néons qui éclairent la jetée) ----------
  for (const [x, z, c] of [[-30, -6, 0x3ad8ff], [14, -6, 0x5aff6a], [-14, -6, 0xff3ab8], [0, -12, 0xff3a3a]]) { const l = new THREE.PointLight(c, 6, 10, 1.6); l.position.set(x, 3, z); scene.add(l); }
  // les obstacles s'ajoutent aux limites de la jetée
  { const RONDS = [];   // (x, z, rayon)
    for (let x = -42; x <= 42; x += 12) for (const z of [5.4, -5.4]) RONDS.push([x, z, .3]);   // (les lampadaires de la jetée)
    for (const [x, z] of [[0, -12], [22, -12], [38, -12], [38, -30], [24, -33], [0, -31], [-4, -12]]) RONDS.push([x, z, .3]);   // (ceux de la place)
    for (const [x, z] of [[-44, -12], [-36, -11], [6, -12], [44, -12], [40, 12], [-40, 14], [-30, 20], [8, 15]]) RONDS.push([x, z, .45]);   // (les palmiers)
    for (const x of [-22, -2, 2, 22]) RONDS.push([x, -5.9, .4]);   // (les poubelles)
    const lim0 = L.limites; L.limites = (x, z) => lim0(x, z) && !OBST.some(([a, b, c, d]) => x > a - .12 && x < b + .12 && z > c - .12 && z < d + .12)
      && !RONDS.some(([a, b, r]) => Math.hypot(x - a, z - b) < r + .2)
      && !(CONCERT.foule || []).some(q => Math.hypot(x - q.m.position.x, z - q.m.position.z) < .5)   // (les gens du concert)
      && !(x > -45 && x < -6 && z > -38 && z < -13 && POTEAUX.some(([a, b]) => Math.hypot(x - a, z - b) < .32))
      && !(L.vamps || []).some(v => (v.etat === "parle" || v.etat === "terre") && Math.hypot(x - v.g.position.x, z - v.g.position.z) < .55); }
  // l'animation des nouveaux manèges
  { const av = L.anim; let rire = 0; L.anim = (t) => { av && av(t); const s = t / 1000;
      cabines.forEach((c, i) => { const u = ((s * .012) + i / cabines.length) % 1, L2 = SG.x1 - SG.x0, aller = u < .5, x = aller ? SG.x0 + u * 2 * L2 : SG.x1 - (u - .5) * 2 * L2, f = ((x - SG.x0) % 26.67) / 26.67; c.position.set(x, SG.h + .25 - Math.sin(f * Math.PI) * .5, aller ? SG.za : SG.zr); });
      if (pirate.bras) pirate.bras.rotation.z = Math.sin(s * 2 * Math.PI / 7) * 1.05;
      if (L.ouragan) { const { v, train } = L.ouragan; train.forEach((w, k) => { const u = ((s * .07) + 1 - k * .012) % 1, p = v.getPointAt(u), tg = v.getTangentAt(u); w.position.copy(p).add(V3(0, .35, 0)); w.lookAt(w.position.x + tg.x, w.position.y + tg.y, w.position.z + tg.z); }); }
      // Laffing Sal : elle rit (la bouche qui s'ouvre, le corps qui se balance) quand on passe devant
      const p = moiP(); if (p && sal.mat) { const pres = Math.hypot(p.x - sal.pos.x, p.z - sal.pos.z) < 5; if (pres && !sal.rit) { sal.rit = s; rireSal(); } if (!pres && sal.rit && s - sal.rit > 6) sal.rit = 0;
        const riant = sal.rit && s - sal.rit < 5; sal.mat.map = riant && Math.floor(s * 7) % 2 ? sal.tOuv : sal.tFer; sal.fig.rotation.z = riant ? Math.sin(s * 9) * .015 : 0; sal.fig.position.y = 2.0 + (riant ? Math.abs(Math.sin(s * 9)) * .04 : 0); } }; }
  // le rire de Sal, fabriqué : une suite de « ha ! » qui descendent
  const rireSal = () => { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); const t0 = actx.currentTime;
      for (let i = 0; i < 9; i++) { const o = actx.createOscillator(), gn = actx.createGain(), f = actx.createBiquadFilter(); o.type = "sawtooth"; f.type = "bandpass"; f.frequency.value = 900; f.Q.value = 3;
        const d = t0 + i * .19; o.frequency.setValueAtTime(330 - i * 12, d); o.frequency.linearRampToValueAtTime(250 - i * 12, d + .14); gn.gain.setValueAtTime(0, d); gn.gain.linearRampToValueAtTime(.18, d + .02); gn.gain.linearRampToValueAtTime(0, d + .15);
        o.connect(f); f.connect(gn); gn.connect(actx.destination); o.start(d); o.stop(d + .16); } } catch (e) {} };
  // ================= le concert sur la plage, comme dans le film : le saxophoniste torse nu, la scène, les projecteurs, la foule =================
  const CONCERT = { x: 6, z: 30 };   // (la musique : la vidéo de l'écran géant, « I Still Believe »)
  { const g = new THREE.Group(); g.position.set(CONCERT.x, 0, CONCERT.z); scene.add(g); const noir = A.mat({ color: 0x111114, roughness: .8 }), alu = A.mat({ color: 0xb8bcc4, metalness: .8, roughness: .3 });
    bxg(g, 14, 1.4, 6.5, noir, 0, .7, 3); bxg(g, 14, .08, 6.5, A.mat({ color: 0x2a2a30, roughness: .5 }), 0, 1.44, 3);   // (le plateau)
    const jupe = tex(toile(512, 64, (x, w, h) => { x.fillStyle = "#0a0a0c"; x.fillRect(0, 0, w, h); x.strokeStyle = "rgba(255,255,255,.06)"; for (let i = 0; i < 64; i++) { x.beginPath(); x.moveTo(i * 8, 0); x.lineTo(i * 8, h); x.stroke(); } }), 4, 1);
    const jp = new THREE.Mesh(new THREE.PlaneGeometry(14, 1.4), A.mat({ map: jupe })); jp.rotation.y = Math.PI; jp.position.set(0, .7, -.26); g.add(jp);
    // les tours en treillis d'aluminium, la poutre du haut
    const treillis = tex(toile(64, 256, (x, w, h) => { x.clearRect(0, 0, w, h); x.strokeStyle = "#c8ccd4"; x.lineWidth = 5; x.strokeRect(3, 0, w - 6, h); x.lineWidth = 3; for (let y = 0; y < h; y += 32) { x.beginPath(); x.moveTo(3, y); x.lineTo(w - 3, y + 32); x.moveTo(w - 3, y); x.lineTo(3, y + 32); x.stroke(); } }), 1, 3);
    const tmat = new THREE.MeshStandardMaterial({ map: treillis, transparent: true, alphaTest: .4, side: THREE.DoubleSide, metalness: .6, roughness: .4 });
    for (const sx of [-6.6, 6.6]) for (const sz of [.4, 6]) bxg(g, .4, 8.5, .4, tmat, sx, 4.25, sz);
    for (const sz of [.4, 6]) { const b2 = bxg(g, 13.6, .4, .4, tmat, 0, 8.5, sz); } for (const sx of [-6.6, 6.6]) bxg(g, .4, .4, 5.6, tmat, sx, 8.5, 3.2);
    // le rideau noir du fond, le nom du groupe en lettres de lumière
    bxg(g, 13, 7, .1, A.mat({ color: 0x08080a, roughness: 1 }), 0, 4.9, 6.1);
    const nomG = new THREE.Mesh(new THREE.PlaneGeometry(8, 1.4), new THREE.MeshBasicMaterial({ map: tex(toile(1024, 180, (x, w, h) => { x.font = "italic 900 110px 'Arial Black', Impact"; x.textAlign = "center"; x.shadowColor = "#ff3ab8"; x.shadowBlur = 30; x.fillStyle = "#ff8ad8"; x.fillText("I STILL BELIEVE", w / 2, 128); x.shadowBlur = 0; x.fillStyle = "#fff"; x.globalAlpha = .6; x.fillText("I STILL BELIEVE", w / 2, 128); })), transparent: true, toneMapped: false }));
    nomG.rotation.y = Math.PI; nomG.position.set(0, 9.35, .4); g.add(nomG);   // (au-dessus de la poutre de devant)
    // les enceintes empilées, de chaque côté
    const hp = tex(toile(128, 128, (x, w, h) => { x.fillStyle = "#151517"; x.fillRect(0, 0, w, h); x.strokeStyle = "#333"; x.lineWidth = 4; x.strokeRect(2, 2, w - 4, h - 4); for (const [cx, cy, r] of [[64, 76, 36], [64, 24, 12]]) { const gr = x.createRadialGradient(cx, cy, 2, cx, cy, r); gr.addColorStop(0, "#555"); gr.addColorStop(.3, "#1a1a1a"); gr.addColorStop(.9, "#2a2a2a"); gr.addColorStop(1, "#000"); x.fillStyle = gr; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); } }));
    const hpm = [noir, noir, noir, noir, noir, A.mat({ map: hp, roughness: .7 })];
    for (const sx of [-8.4, 8.4]) for (let k = 0; k < 4; k++) { const e = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.3, 1.2), hpm); e.position.set(sx, .65 + k * 1.32, 1.2); e.rotation.y = Math.PI; g.add(e); }
    // la batterie, le clavier, les amplis, les micros
    const kit = new THREE.Group(); kit.position.set(-3, 1.45, 4.2); g.add(kit); const fut = A.mat({ color: 0xa81c2a, metalness: .4, roughness: .3 }), peauT = A.mat({ color: 0xece8de });
    const gc = cyl(kit, .5, .5, .55, fut, 0, .55, 0, 20); gc.rotation.x = Math.PI / 2; cyl(kit, .3, .3, .3, fut, -.7, .7, -.3); cyl(kit, .26, .26, .28, fut, .45, 1, -.2); cyl(kit, .27, .27, .25, fut, -.35, 1.05, -.2); cyl(kit, .3, .3, .5, fut, .9, .45, -.1);
    for (const [cx, cy, cz] of [[-1.1, 1.5, -.1], [1.2, 1.6, 0], [-.9, 1.2, -.6]]) { cyl(kit, .012, .012, cy, alu, cx, cy / 2, cz, 6); const cb = cyl(kit, .38, .3, .02, A.mat({ color: 0xd8b040, metalness: .9, roughness: .25 }), cx, cy, cz, 20); cb.rotation.x = .2; }
    const clav = new THREE.Group(); clav.position.set(3.4, 1.45, 3.6); g.add(clav); for (const sx of [-.6, .6]) tube(clav, V3(sx - .3, 0, 0), V3(sx + .3, .9, 0), .02, alu); bxg(clav, 1.5, .1, .45, noir, 0, .95, 0);
    bxg(clav, 1.4, .02, .18, A.mat({ color: 0xf4f2ea }), 0, 1.01, -.1);
    for (const sx of [-1.6, 4.8]) { bxg(g, 1, .8, .5, A.mat({ color: 0x1a1a1a }), sx, 1.85, 5.2); bxg(g, .9, .6, .02, A.mat({ color: 0x3a3a3a }), sx, 1.85, 4.94); }
    tube(g, V3(0, 1.45, 1.2), V3(0, 3.1, 1.2), .015, alu); cyl(g, .25, .25, .02, alu, 0, 1.46, 1.2, 12);   // (le pied du micro, au bord de la scène)
    // les musiciens : le saxophoniste, torse nu et huilé, sa queue de cheval, ses chaînes, le sax doré ; derrière lui le batteur et le clavier, dans l'ombre
    const sax = new THREE.Object3D(); sax.position.set(0, 2.4, 1.5); g.add(sax);   // (là où se tient Tim Cappello, éclairé par la poursuite)
    // l'écran géant, derrière le groupe : la vidéo du concert
    const ecranV = document.createElement("video"); videoLocale("videos/i-still-believe.mp4", "videos/i-still-believe.mp4").then(u => { ecranV.src = u; }, () => { ecranV.src = "videos/i-still-believe.mp4"; });   /* (téléchargée en entier, lue depuis l'appareil) */ ecranV.loop = true; ecranV.playsInline = true; ecranV.muted = true; ecranV.preload = "auto"; ecranV.setAttribute("playsinline", ""); ecranV.setAttribute("muted", ""); ecranV.style.cssText = "position:fixed;left:0;top:0;width:2px;height:2px;opacity:.01;pointer-events:none;z-index:-1"; document.body.appendChild(ecranV);   /* (dans la page, invisible : l'iPhone ne décode pas l'image d'une vidéo hors de la page) */
    const sonC = new Audio("sons/lb-i-still-believe.mp3"); sonC.loop = true; sonC.preload = "auto"; sonC.volume = 0; CONCERT.son = sonC;
    CONCERT_LB.v = sonC; const tV = new THREE.VideoTexture(ecranV); tV.colorSpace = THREE.SRGBColorSpace;
    bxg(g, 11.6, 6.9, .25, A.mat({ color: 0x0a0a0c, roughness: .6 }), 0, 4.95, 5.85); const ecran = new THREE.Mesh(new THREE.PlaneGeometry(11, 6.2), new THREE.MeshBasicMaterial({ map: tV, toneMapped: false })); ecran.rotation.y = Math.PI; ecran.position.set(0, 4.95, 5.7); g.add(ecran);
    const ombreM = (dessin) => new THREE.Mesh(new THREE.PlaneGeometry(.9, 1.8), new THREE.MeshBasicMaterial({ map: tex(toile(128, 256, dessin)), transparent: true, alphaTest: .4, side: THREE.DoubleSide }));
    const silh = (x) => { x.fillStyle = "#16121a"; x.beginPath(); x.arc(64, 40, 22, 0, 7); x.fill(); x.beginPath(); x.moveTo(26, 80); x.quadraticCurveTo(64, 62, 102, 80); x.lineTo(96, 250); x.lineTo(32, 250); x.fill(); x.fillStyle = "#6a5a7a"; x.fillRect(30, 60, 70, 4); };
    const bat = ombreM(silh); bat.position.set(-3, 2.1, 4.75); bat.rotation.y = Math.PI; g.add(bat); const kb = ombreM(silh); kb.position.set(3.4, 2.35, 4.05); kb.rotation.y = Math.PI; g.add(kb); bat.visible = kb.visible = false;   // (le batteur et le clavier : sur l’écran)
    // les projecteurs sur la poutre, leurs faisceaux de couleur qui balaient ; la fumée de la scène
    const faisceaux = [];
    for (let i = 0; i < 6; i++) { const c = [0xff3ab8, 0x3a8aff, 0xffd23a, 0x8a3aff, 0x3affd8, 0xff5a3a][i], px = -5.5 + i * 2.2; cyl(g, .16, .2, .4, A.mat({ color: 0x1a1a1a, metalness: .5 }), px, 8.05, .4, 10);
      const geo = new THREE.ConeGeometry(1.4, 9, 20, 1, true); geo.translate(0, -4.5, 0); const f = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: .13, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
      f.position.set(px, 7.9, .4); g.add(f); faisceaux.push({ f, ph: i * 1.3 }); }
    const ls = [0xff3ab8, 0x3a8aff].map((c, i) => { const l = new THREE.PointLight(c, 30, 16, 1.6); l.position.set(i ? 3 : -3, 5, -1); g.add(l); return l; });
    const sp2 = new THREE.SpotLight(0xfff0d8, 60, 18, .35, .5, 1.4); sp2.position.set(0, 8, -3); sp2.target = sax; g.add(sp2);
    const fumeeC = tex(toile(64, 64, (x) => { const gr = x.createRadialGradient(32, 32, 2, 32, 32, 30); gr.addColorStop(0, "rgba(255,255,255,.8)"); gr.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); }));
    for (let i = 0; i < 10; i++) { const fm = new THREE.Sprite(new THREE.SpriteMaterial({ map: fumeeC, transparent: true, opacity: .16, depthWrite: false, color: 0xc8b8e0 })); fm.position.set(-6 + i * 1.3, 1.9 + hasard(i) * .6, 2 + hasard(i * 3) * 3); fm.scale.setScalar(2.6); g.add(fm); }
    // la foule devant la scène : une centaine de spectateurs, tous différents (peau, cheveux, maillots, shorts, t-shirts des années 80), vus de dos ;
    // chacun a sa façon de vivre le concert — il saute, se balance, lève les bras, le poing — au rythme de la musique, éclairé par les projecteurs
    const NP = 32, FR = 4, atlas = document.createElement("canvas"); atlas.width = 2048; atlas.height = 2048; const ax = atlas.getContext("2d");
    const PEAUX = ["#f2cfae", "#e8b896", "#d69a72", "#b87850", "#8e5636", "#6a3c22", "#f6dcc4", "#c88a60"];
    const CHEV = ["#1a120c", "#3a2414", "#6a4022", "#a8743a", "#d8b060", "#ecd8a0", "#8a2a1a", "#2a2a2a"];
    const VIF = ["#ff2a8a", "#2ad8ff", "#ffd21a", "#5aff4a", "#ff6a1a", "#9a4aff", "#ff2a3a", "#1a6aff", "#ffffff", "#1a1a1a"];
    const gens = []; for (let k = 0; k < NP; k++) { const r = n => hasard(k * 17.3 + n * 3.7), f = k % 2 === 1;
      gens.push({ f, peau: PEAUX[Math.floor(r(1) * 8)], chev: CHEV[Math.floor(r(2) * 8)], coif: f ? ["long", "queue", "boucles", "long", "boucles", "court"][Math.floor(r(3) * 6)] : ["court", "mulet", "casquette", "boucles", "court", "long"][Math.floor(r(3) * 6)],
        haut: f ? ["bikini", "bikini", "debardeur", "tshirt", "bikini"][Math.floor(r(4) * 5)] : ["nu", "nu", "tshirt", "debardeur", "chemise", "nu"][Math.floor(r(4) * 6)], cHaut: VIF[Math.floor(r(5) * 10)],
        bas: f ? ["bikini", "jean", "bikini", "short"][Math.floor(r(6) * 4)] : ["short", "short", "jean", "short"][Math.floor(r(6) * 4)], cBas: VIF[Math.floor(r(7) * 10)], rayures: r(8) > .5,
        pieds: r(9) > .55 ? "basket" : "nu", large: f ? .92 + r(10) * .12 : 1 + r(10) * .16, cheveuxLg: r(11) }); }
    const ombrer = (x, x0, x1, c, k = .32) => { const g = x.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, `rgba(0,0,0,${k})`); g.addColorStop(.35, "rgba(0,0,0,0)"); g.addColorStop(.7, "rgba(0,0,0,0)"); g.addColorStop(1, `rgba(0,0,0,${k * 1.1})`); return g; };
    const bras = (x, P, sx, sy, a1, a2, vet) => { const L1 = 33, L2 = 31, ex = sx + Math.sin(a1) * L1 * Math.sign(sx), ey = sy + Math.cos(a1) * L1, hx = ex + Math.sin(a2) * L2 * Math.sign(sx), hy = ey + Math.cos(a2) * L2;
      x.lineCap = "round"; x.lineJoin = "round";
      for (const [w, c] of [[11.5, "rgba(0,0,0,.35)"], [10, P.peau]]) { x.strokeStyle = c; x.lineWidth = w; x.beginPath(); x.moveTo(sx, sy); x.lineTo(ex, ey); x.stroke(); x.lineWidth = w - 2; x.beginPath(); x.moveTo(ex, ey); x.lineTo(hx, hy); x.stroke(); }
      x.strokeStyle = "rgba(255,240,220,.22)"; x.lineWidth = 2.5; x.beginPath(); x.moveTo(sx - Math.sign(sx) * 2, sy + 2); x.lineTo(ex - Math.sign(sx) * 2, ey); x.stroke();   // (le reflet de la peau)
      if (vet) { x.strokeStyle = vet; x.lineWidth = 12.5; x.beginPath(); x.moveTo(sx, sy); x.lineTo(sx + (ex - sx) * .42, sy + (ey - sy) * .42); x.stroke(); }   // (la manche)
      x.fillStyle = P.peau; x.beginPath(); x.arc(hx, hy, 5.2, 0, 7); x.fill(); x.fillStyle = "rgba(0,0,0,.22)"; x.beginPath(); x.arc(hx + 1, hy + 1.5, 3.2, 0, 7); x.fill(); };
    const perso = (x, P, pose) => { const saut = pose === 3, sw = 26 * P.large * (P.f ? .86 : 1), ww = 17 * P.large * (P.f ? .86 : 1), hw = 20 * P.large * (P.f ? 1.12 : 1), dos = P.haut === "nu" || P.haut === "bikini";
      // les jambes (pliées pendant le saut), les pieds
      const genou = saut ? -66 : -50, pied = saut ? -26 : 0;
      for (const s of [-1, 1]) { const hx = s * hw * .5, kx = s * (hw * .5 + (saut ? 4 : 1)), fx = s * (hw * .48 + (saut ? 2 : 0));
        x.lineCap = "round"; x.strokeStyle = "rgba(0,0,0,.35)"; x.lineWidth = 15; x.beginPath(); x.moveTo(hx, -100); x.lineTo(kx, genou); x.lineTo(fx, pied - 6); x.stroke();
        x.strokeStyle = P.peau; x.lineWidth = 13; x.beginPath(); x.moveTo(hx, -100); x.lineTo(kx, genou); x.stroke(); x.lineWidth = 10; x.beginPath(); x.moveTo(kx, genou); x.lineTo(fx, pied - 6); x.stroke();
        x.fillStyle = "rgba(0,0,0,.18)"; x.beginPath(); x.ellipse(kx, genou + 14, 4, 9, 0, 0, 7); x.fill();   // (le creux du mollet)
        if (P.pieds === "basket") { x.fillStyle = "#f2f2ee"; x.beginPath(); x.roundRect(fx - 7, pied - 14, 14, 15, 4); x.fill(); x.fillStyle = "#c81e1e"; x.fillRect(fx - 7, pied - 9, 14, 2); x.fillStyle = "#9a9a96"; x.fillRect(fx - 7, pied - 1, 14, 2); }
        else { x.fillStyle = P.peau; x.beginPath(); x.ellipse(fx, pied - 3, 5, 4, 0, 0, 7); x.fill(); } }
      // le bas : le short de bain (rayé ou non), le bas de bikini, le short en jean effrangé
      if (P.bas === "bikini") { x.fillStyle = P.cBas; x.beginPath(); x.moveTo(-hw, -106); x.lineTo(hw, -106); x.quadraticCurveTo(hw * .7, -90, 2, -86); x.lineTo(-2, -86); x.quadraticCurveTo(-hw * .7, -90, -hw, -106); x.fill(); }
      else { const bas = P.bas === "jean" ? "#4a6a9a" : P.cBas, lg = P.bas === "jean" ? -82 : -70; x.fillStyle = bas; x.beginPath(); x.moveTo(-hw - 1, -108); x.lineTo(hw + 1, -108); x.lineTo(hw + 3, lg); x.lineTo(2, lg + 2); x.lineTo(1, -92); x.lineTo(-1, -92); x.lineTo(-2, lg + 2); x.lineTo(-hw - 3, lg); x.fill();
        if (P.rayures && P.bas === "short") { x.fillStyle = "rgba(255,255,255,.45)"; x.fillRect(-hw - 2, -100, 3, 30); x.fillRect(hw - 1, -100, 3, 30); }
        if (P.bas === "jean") { x.fillStyle = "rgba(255,255,255,.5)"; for (let i = 0; i < 14; i++) x.fillRect(-hw - 2 + i * (hw * 2 + 4) / 14, lg - 1, 1.5, 4); x.fillStyle = "rgba(20,30,60,.45)"; x.fillRect(-hw + 4, -100, 10, 8); x.fillRect(hw - 14, -100, 10, 8); }   // (l'effrangé, les poches)
        x.fillStyle = ombrer(x, -hw, hw); x.fillRect(-hw - 3, -108, hw * 2 + 6, 40); x.fillStyle = "rgba(0,0,0,.3)"; x.fillRect(-hw - 1, -108, hw * 2 + 2, 3); }
      // le dos : la peau, l'ombre de la colonne, les omoplates ; ou le haut (t-shirt, débardeur, chemise)
      const torse = () => { x.beginPath(); x.moveTo(-sw, -184); x.quadraticCurveTo(-sw - 2, -150, -ww, -122); x.quadraticCurveTo(-hw - 1, -112, -hw, -104); x.lineTo(hw, -104); x.quadraticCurveTo(hw + 1, -112, ww, -122); x.quadraticCurveTo(sw + 2, -150, sw, -184); x.quadraticCurveTo(0, -192, -sw, -184); };
      x.fillStyle = P.peau; torse(); x.fill(); x.fillStyle = ombrer(x, -sw, sw); torse(); x.fill();
      x.strokeStyle = "rgba(90,50,30,.32)"; x.lineWidth = 2; x.beginPath(); x.moveTo(0, -184); x.quadraticCurveTo(1, -145, 0, -108); x.stroke();   // (la colonne)
      x.fillStyle = "rgba(0,0,0,.12)"; for (const s of [-1, 1]) { x.beginPath(); x.ellipse(s * 11, -162, 8, 12, s * .25, 0, 7); x.fill(); }   // (les omoplates)
      x.fillStyle = "rgba(255,240,220,.14)"; for (const s of [-1, 1]) { x.beginPath(); x.ellipse(s * 13, -172, 7, 5, 0, 0, 7); x.fill(); }   // (la peau qui luit)
      if (P.haut === "bikini") { x.fillStyle = P.cHaut; x.fillRect(-sw + 2, -164, sw * 2 - 4, 6); x.beginPath(); x.ellipse(0, -161, 5, 4, 0, 0, 7); x.fill(); x.strokeStyle = P.cHaut; x.lineWidth = 2; for (const s of [-1, 1]) { x.beginPath(); x.moveTo(s * 2, -161); x.lineTo(s * 5, -150); x.stroke(); x.beginPath(); x.moveTo(s * (sw - 8), -164); x.lineTo(s * 6, -192); x.stroke(); } }
      else if (P.haut !== "nu") { const c = P.haut === "chemise" ? "#2a8a7a" : P.cHaut; x.save(); torse(); x.clip(); x.fillStyle = c;
        if (P.haut === "debardeur") { x.beginPath(); x.moveTo(-sw + 9, -186); x.lineTo(-sw + 15, -186); x.quadraticCurveTo(0, -170, sw - 15, -186); x.lineTo(sw - 9, -186); x.quadraticCurveTo(sw, -150, sw + 2, -100); x.lineTo(-sw - 2, -100); x.quadraticCurveTo(-sw, -150, -sw + 9, -186); x.fill(); }
        else x.fillRect(-sw - 3, -196, sw * 2 + 6, 98);
        if (P.haut === "chemise") { for (let i = 0; i < 30; i++) { x.fillStyle = ["#f4e6c8", "#e8602a", "#f2c83a"][i % 3]; x.beginPath(); x.ellipse(-sw + hasard(i * 3.3) * sw * 2, -190 + hasard(i * 7.1) * 90, 4, 2.5, i, 0, 7); x.fill(); } }
        if (P.haut === "tshirt" && P.cheveuxLg > .5) { x.fillStyle = c === "#ffffff" ? "#1a1a1a" : "#ffffff"; x.font = "bold 10px Arial"; x.textAlign = "center"; x.fillText(["SANTA CARLA", "ROCK ON", "1987", "SURF"][Math.floor(P.cheveuxLg * 4)], 0, -152); }   // (le t-shirt imprimé)
        x.fillStyle = ombrer(x, -sw, sw, null, .38); x.fillRect(-sw - 3, -196, sw * 2 + 6, 98); x.strokeStyle = "rgba(0,0,0,.18)"; x.lineWidth = 1.5; for (const [a, b, c2, d] of [[-14, -150, -6, -112], [12, -146, 6, -116], [-4, -176, 3, -160]]) { x.beginPath(); x.moveTo(a, b); x.lineTo(c2, d); x.stroke(); } x.restore(); }   // (les plis)
      // la nuque, la tête de dos, les oreilles, les cheveux
      x.fillStyle = P.peau; x.fillRect(-6, -200, 12, 16); x.fillStyle = "rgba(0,0,0,.18)"; x.fillRect(-6, -192, 12, 3);
      x.fillStyle = P.peau; for (const s of [-1, 1]) { x.beginPath(); x.ellipse(s * 13, -211, 3, 5, 0, 0, 7); x.fill(); } x.beginPath(); x.ellipse(0, -213, 13, 15, 0, 0, 7); x.fill();
      const ch = P.chev, gl = (x0, y0, x1, y1) => { const g = x.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, ch); g.addColorStop(.5, ch); g.addColorStop(1, "rgba(0,0,0,.85)"); return g; };
      x.fillStyle = ch;
      if (P.coif === "long") { x.beginPath(); x.ellipse(0, -216, 15, 15, 0, Math.PI, 0); x.lineTo(16, -180 + P.cheveuxLg * 18); for (let i = 0; i <= 8; i++) x.lineTo(16 - i * 4, -176 + P.cheveuxLg * 18 + (i % 2) * 5); x.lineTo(-16, -204); x.fill(); }
      else if (P.coif === "queue") { x.beginPath(); x.ellipse(0, -214, 14, 15, 0, Math.PI * 1.02, Math.PI * 1.98 + Math.PI); x.fill(); x.beginPath(); x.moveTo(-4, -206); x.quadraticCurveTo(-8, -188, -2, -172); x.lineTo(3, -172); x.quadraticCurveTo(7, -190, 4, -206); x.fill(); x.fillStyle = P.cHaut; x.fillRect(-4, -208, 8, 3); }
      else if (P.coif === "boucles") { for (let i = 0; i < 26; i++) { const a = Math.PI * .8 + i / 25 * Math.PI * 1.4, r = 16 + (i % 3) * 3; x.beginPath(); x.arc(Math.cos(a) * r * .95, -214 + Math.sin(a) * r * .9 + (Math.sin(a) > 0 ? 6 : 0), 6.5, 0, 7); x.fill(); } x.beginPath(); x.ellipse(0, -213, 17, 17, 0, 0, 7); x.fill(); }
      else if (P.coif === "mulet") { x.beginPath(); x.ellipse(0, -216, 14, 13, 0, Math.PI, 0); x.lineTo(13, -196); x.quadraticCurveTo(10, -178, 0, -176); x.quadraticCurveTo(-10, -178, -13, -196); x.fill(); }
      else { x.beginPath(); x.ellipse(0, -215, 14, 14, 0, Math.PI * .93, Math.PI * 2.07); x.fill(); }
      x.strokeStyle = "rgba(255,255,255,.12)"; x.lineWidth = 1; for (let i = 0; i < 7; i++) { x.beginPath(); x.moveTo(-9 + i * 3, -226); x.quadraticCurveTo(-10 + i * 3.3, -212, -9 + i * 3, -200); x.stroke(); }   // (les mèches)
      x.fillStyle = gl(0, -228, 0, -190); x.globalAlpha = .35; x.beginPath(); x.ellipse(0, -212, 16, 16, 0, 0, 7); x.fill(); x.globalAlpha = 1;
      if (P.coif === "casquette") { x.fillStyle = P.cHaut; x.beginPath(); x.ellipse(0, -219, 15, 11, 0, Math.PI, 0); x.fill(); x.fillStyle = "rgba(0,0,0,.35)"; x.fillRect(-5, -212, 10, 3); }
      // les bras, selon le mouvement : 0 balancés, 1 les deux en l'air, 2 le poing levé, 3 le saut (les bras au ciel)
      const A = [[[.28, .45], [.3, .5]], [[2.75, 2.95], [2.75, 2.95]], [[3.0, 3.1], [.18, .6]], [[2.5, 2.7], [2.5, 2.7]]][pose], man = P.haut === "tshirt" || P.haut === "chemise" ? (P.haut === "chemise" ? "#2a8a7a" : P.cHaut) : null;
      for (const [i, s] of [[0, -1], [1, 1]]) bras(x, P, s * (sw - 4), -180, A[i][0], A[i][1], man); };
    gens.forEach((P, k) => { for (let f = 0; f < FR; f++) { const idx = k * FR + f, cx = (idx % 16) * 128, cy = Math.floor(idx / 16) * 256; ax.save(); ax.beginPath(); ax.rect(cx, cy, 128, 256); ax.clip(); ax.translate(cx + 64, cy + 250); const sc = .98 + hasard(k * 5.5) * .06; ax.scale(sc, sc);
      perso(ax, P, f);
      ax.globalCompositeOperation = "source-atop"; const g = ax.createLinearGradient(0, -240, 0, 0); g.addColorStop(0, "rgba(255,225,240,.2)"); g.addColorStop(.5, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,10,.32)"); ax.fillStyle = g; ax.fillRect(-64, -250, 128, 256); ax.restore(); } });   // (éclairés d'en haut par les projecteurs)
    const tAt = new THREE.CanvasTexture(atlas); tAt.colorSpace = THREE.SRGBColorSpace; tAt.anisotropy = 4;
    // leur place : serrés devant la scène, plus clairsemés vers l'arrière ; jamais l'un dans l'autre
    const foule = [], N = 104; let essai = 0;
    while (foule.length < N && essai < 6000) { essai++; const d = Math.pow(hasard(essai * 1.31), .8) * 15, lx = (hasard(essai * 2.77) - .5) * (16 + d * .9), x0 = CONCERT.x + lx, z0 = CONCERT.z - 1.9 - d;
      if (foule.some(q => Math.hypot(q.x - x0, q.z - z0) < .62)) continue; const k = foule.length % NP, tp = hasard(essai * 4.4);
      foule.push({ x: x0, z: z0, k, s: .9 + hasard(essai * 6.6) * .2, type: tp < .38 ? "saut" : tp < .66 ? "balance" : tp < .84 ? "bras" : "poing", ph: (hasard(essai * 8.8) - .5) * .35, m: { position: new THREE.Vector3(x0, 0, z0) }, lum: 0 }); }
    const gF = new THREE.BufferGeometry(), nF = foule.length, pF = new Float32Array(nF * 12), uF = new Float32Array(nF * 8), cF = new Float32Array(nF * 12), iF = [];
    for (let i = 0; i < nF; i++) iF.push(i * 4, i * 4 + 1, i * 4 + 2, i * 4, i * 4 + 2, i * 4 + 3);
    gF.setAttribute("position", new THREE.BufferAttribute(pF, 3)); gF.setAttribute("uv", new THREE.BufferAttribute(uF, 2)); gF.setAttribute("color", new THREE.BufferAttribute(cF, 3)); gF.setIndex(iF);
    const mFoule = new THREE.Mesh(gF, new THREE.MeshBasicMaterial({ map: tAt, vertexColors: true, alphaTest: .5, side: THREE.DoubleSide })); mFoule.frustumCulled = false; scene.add(mFoule);
    // leurs ombres au sol (elles rétrécissent quand ils sautent)
    const ombreT = tex(toile(64, 32, (x) => { const g = x.createRadialGradient(32, 16, 1, 32, 16, 30); g.addColorStop(0, "rgba(0,0,0,.55)"); g.addColorStop(1, "rgba(0,0,0,0)"); x.fillStyle = g; x.save(); x.scale(1, .5); x.fillRect(0, 0, 64, 64); x.restore(); }));
    const gO = new THREE.BufferGeometry(), pO = new Float32Array(nF * 12), uO = new Float32Array(nF * 8); for (let i = 0; i < nF; i++) uO.set([0, 0, 1, 0, 1, 1, 0, 1], i * 8);
    gO.setAttribute("position", new THREE.BufferAttribute(pO, 3)); gO.setAttribute("uv", new THREE.BufferAttribute(uO, 2)); gO.setIndex(iF);
    const mOmbres = new THREE.Mesh(gO, new THREE.MeshBasicMaterial({ map: ombreT, transparent: true, depthWrite: false })); mOmbres.frustumCulled = false; scene.add(mOmbres);
    // à chaque image : le rythme (environ 118 battements par minute), chacun selon sa façon de danser ; tourné vers nous (on le voit de dos : il regarde la scène) ; la couleur des projecteurs qui balaie la foule
    const BPM = 118, eps = .5 / 2048;
    CONCERT.majFoule = (t, cam) => { const s = t / 1000, beat = s * BPM / 60;
      for (let i = 0; i < nF; i++) { const q = foule[i], f0 = beat + q.ph, fr = f0 - Math.floor(f0); let y = 0, tilt = 0, pose = 0;
        if (q.type === "saut") { const h = Math.sin(Math.PI * fr); y = Math.max(0, h) * .38 * q.s; pose = h > .25 ? 3 : 1; }
        else if (q.type === "balance") { tilt = Math.sin(Math.PI * f0) * .07; y = Math.abs(Math.sin(Math.PI * f0)) * .05; pose = Math.floor(f0 / 8) % 3 === 2 ? 1 : 0; }
        else if (q.type === "bras") { tilt = Math.sin(Math.PI * f0 * .5) * .06; y = Math.abs(Math.sin(Math.PI * f0)) * .07; pose = 1; }
        else { pose = fr < .5 ? 2 : 0; y = Math.abs(Math.sin(Math.PI * f0)) * .06; tilt = Math.sin(Math.PI * f0 * .5) * .03; }
        let dx = cam.x - q.x, dz = cam.z - q.z; const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l; const rx = dz, rz = -dx;   // (tourné vers la caméra)
        const H = 1.78 * q.s, W = H / 2, ct = Math.cos(tilt), st = Math.sin(tilt), o = i * 12;
        const coin = (j, u, v) => { const lx = u * ct - v * st, ly = u * st + v * ct; pF[o + j * 3] = q.x + rx * lx; pF[o + j * 3 + 1] = y + ly; pF[o + j * 3 + 2] = q.z + rz * lx; };
        coin(0, -W / 2, 0); coin(1, W / 2, 0); coin(2, W / 2, H); coin(3, -W / 2, H);
        const idx = q.k * FR + pose, u0 = (idx % 16) / 16 + eps, u1 = (idx % 16 + 1) / 16 - eps, v1 = 1 - Math.floor(idx / 16) / 8 - eps, v0 = 1 - (Math.floor(idx / 16) + 1) / 8 + eps;
        uF.set([u0, v0, u1, v0, u1, v1, u0, v1], i * 8);
        // la lumière : les couleurs des projecteurs qui passent sur la foule, plus fortes près de la scène ; de temps en temps un flash blanc
        const pr = Math.max(0, 1 - (CONCERT.z - q.z) / 20), a = s * .9 + q.x * .25, flash = Math.max(0, Math.sin(s * 9.3) - .985) * 30;
        const r = .42 + pr * .35 + Math.max(0, Math.sin(a)) * .45 * pr + flash, g = .36 + pr * .25 + Math.max(0, Math.sin(a + 2.1)) * .3 * pr + flash, b = .48 + pr * .35 + Math.max(0, Math.sin(a + 4.2)) * .5 * pr + flash;
        for (let j = 0; j < 4; j++) cF.set([Math.min(1.4, r), Math.min(1.4, g), Math.min(1.4, b)], o + j * 3);
        const so = .5 * (1 - y), oo = i * 12; pO.set([q.x - so, .04, q.z - so * .6, q.x + so, .04, q.z - so * .6, q.x + so, .04, q.z + so * .6, q.x - so, .04, q.z + so * .6], oo); }
      gF.attributes.position.needsUpdate = gF.attributes.uv.needsUpdate = gF.attributes.color.needsUpdate = gO.attributes.position.needsUpdate = true; };
    OBST.push([CONCERT.x - 9.3, CONCERT.x + 9.3, CONCERT.z - .3, CONCERT.z + 6.6]);
    Object.assign(CONCERT, { sax, ecranV, faisceaux, foule, ls }); }
  { const av = L.anim; L.anim = (t) => { av && av(t); const s = t / 1000, C = CONCERT;
      // Tim Cappello, sur la scène (un vrai personnage : celui de l'inventaire) ; il se balance au rythme
      if (M.L === L && !M.gens.has(-870)) { const P = (M.ctx.pnjTrio && M.ctx.pnjTrio(88)) || {}; const q = ajouterAncien({ ...habillerLB({ numero: -870, nom: P.nom || "Tim Cappello", initiales: "" }, 88), pnj: true, x: C.x, z: C.z + 1.5 }); if (q) q.vol = 1.45; }
      { const q = M.gens.get(-870); if (q) { q.vol = 1.45 + Math.abs(Math.sin(s * 2.2 * Math.PI)) * .06; q.g.position.x = C.x + Math.sin(s * 1.1 * Math.PI) * .25; } }
      C.faisceaux.forEach((q, i) => { q.f.rotation.z = Math.sin(s * .7 + q.ph) * .5; q.f.rotation.x = -.35 + Math.cos(s * .5 + q.ph) * .3; });
      C.ls.forEach((l, i) => { l.intensity = 22 + Math.sin(s * 4.4 + i * 2) * 10; });
      if (C.majFoule) C.majFoule(t, M.camera.position);   // (la foule danse)
      // la vidéo de l'écran géant : sa musique, plus forte quand on s'approche de la scène (sans le son tant que le téléphone ne l'autorise pas)
      { const V = C.ecranV, p = moiP(); if (!C.garde) C.garde = setInterval(() => { if (!M || M.L !== L) { V.pause(); V.remove(); if (C.son) C.son.pause(); clearInterval(C.garde); } }, 600);
        if (V.paused && !C.essai) { C.essai = true; V.play().catch(() => {}).finally(() => { setTimeout(() => { C.essai = false; }, 2000); }); }
        if (p) { const d = Math.hypot(p.x - C.x, p.z - C.z), v = Math.max(0, Math.min(1, 1 - (d - 6) / 34)); { const cible = M.lbMus || performance.now() < (M.lbSilence || 0) ? 0 : 1, dt4 = Math.min(.1, (now0lb() - (C.vt || now0lb())) / 1000); C.vt = now0lb(); V.volume = Math.max(0, Math.min(1, V.volume + Math.sign(cible - V.volume) * Math.min(Math.abs(cible - V.volume), dt4 / (cible ? 1.5 : 1.2)))); }   /* (le concert s'efface et revient en douceur) */ { const A2 = C.son; if (A2) { A2.volume = V.volume; if (A2.paused && V.volume > 0 && !C.sonEssai) { C.sonEssai = true; A2.play().catch(() => {}).finally(() => setTimeout(() => { C.sonEssai = false; }, 1500)); } } V.muted = true; } } } }; }
  // ================= les bidons enflammés autour du concert, comme dans le film : le métal rouillé, les vraies flammes qui dansent, les braises, la lueur sur le sable et la foule =================
  { const rouille = tex(toile(128, 256, (x, w, h) => { x.fillStyle = "#4a2e1e"; x.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(${hasard(i) > .5 ? "140,70,30" : "30,20,16"},${.2 + hasard(i * 3) * .4})`; x.beginPath(); x.ellipse(hasard(i * 1.3) * w, hasard(i * 2.1) * h, 2 + hasard(i * 5) * 9, 1 + hasard(i * 7) * 5, 0, 0, 7); x.fill(); }
        x.fillStyle = "rgba(20,14,10,.8)"; for (const y of [.18, .5, .82]) x.fillRect(0, y * h - 4, w, 8); x.fillStyle = "rgba(200,120,60,.35)"; for (const y of [.18, .5, .82]) x.fillRect(0, y * h - 5, w, 2); x.fillStyle = "rgba(10,6,4,.9)"; for (let i = 0; i < 30; i++) x.fillRect(hasard(i * 9) * w, 0, 2, 3 + hasard(i) * 20); }));   // (la rouille, les cerclages, les coulures noires)
    const metal = A.mat({ map: rouille, roughness: .85, metalness: .5 }), interieur = new THREE.MeshBasicMaterial({ color: 0xff7a20, toneMapped: false });
    // la flamme : dessinée à chaque image (un bruit qui monte, plus étroit en haut ; le cœur blanc-jaune, l'orange, le rouge sombre sur les bords)
    const flammeU = { t: { value: 0 } }, flammeM = new THREE.ShaderMaterial({ uniforms: { uT: flammeU.t, uS: { value: 0 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `uniform float uT; uniform float uS; varying vec2 vUv;
        float h(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float n(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }
        float fbm(vec2 p) { float v = 0.0, a = .5; for (int i = 0; i < 5; i++) { v += a * n(p); p *= 2.03; a *= .5; } return v; }
        void main() { vec2 uv = vUv; float t = uT * 1.6 + uS * 10.0;
          float x = uv.x - .5; x += (fbm(vec2(uv.y * 3.0 - t * .6, uS)) - .5) * .22 * uv.y;
          float d = fbm(vec2(x * 3.5, uv.y * 2.4 - t * 1.6)), forme = 1.0 - smoothstep(0.0, .42 * (1.0 - uv.y * .78) + .02, abs(x)),
            f = forme * smoothstep(1.0, .15, uv.y + (d - .5) * .7) * smoothstep(0.0, .06, uv.y), i = clamp(f * (.7 + d * .9), 0.0, 1.0);
          vec3 c = mix(vec3(.45, .05, 0.0), vec3(1.0, .42, .05), smoothstep(.15, .55, i)); c = mix(c, vec3(1.0, .86, .45), smoothstep(.55, .85, i)); c = mix(c, vec3(1.0, .98, .9), smoothstep(.85, 1.0, i));
          gl_FragColor = vec4(c * i * 1.4, i); }` });
    const B = [[-7, 23], [19, 23], [-5, 15], [17, 15], [6, 11.5]], fl = [], braises = [], lums = [], foyers = [];
    // le feu : des centaines de petites flammes qui naissent au fond du bidon, montent en tourbillonnant, rétrécissent et passent du blanc-jaune à l'orange, au rouge, puis à la fumée
    const NF = 70, feuPts = [], feuG = new THREE.BufferGeometry(), fpos = new Float32Array(B.length * NF * 3), fcol = new Float32Array(B.length * NF * 4), ftai = new Float32Array(B.length * NF);
    feuG.setAttribute("position", new THREE.BufferAttribute(fpos, 3)); feuG.setAttribute("couleur", new THREE.BufferAttribute(fcol, 4)); feuG.setAttribute("taille", new THREE.BufferAttribute(ftai, 1));
    const pointT = tex(toile(64, 64, (x) => { const g = x.createRadialGradient(32, 34, 0, 32, 34, 30); g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(.35, "rgba(255,255,255,.55)"); g.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = g; x.beginPath(); x.ellipse(32, 36, 22, 28, 0, 0, 7); x.fill(); }));
    const feuMat = new THREE.ShaderMaterial({ uniforms: { uMap: { value: pointT }, uEch: { value: 600 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: "attribute vec4 couleur; attribute float taille; uniform float uEch; varying vec4 vC; void main() { vC = couleur; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = taille * uEch / -mv.z; gl_Position = projectionMatrix * mv; }",
      fragmentShader: "uniform sampler2D uMap; varying vec4 vC; void main() { vec4 t = texture2D(uMap, gl_PointCoord); gl_FragColor = vec4(vC.rgb * t.a * vC.a, t.a * vC.a); }" });
    const feu = new THREE.Points(feuG, feuMat); feu.frustumCulled = false; feu.renderOrder = 4; scene.add(feu);
    for (let i = 0; i < B.length * NF; i++) feuPts.push({ b: Math.floor(i / NF), age: Math.random(), vie: .7 + Math.random() * .6, ax: (Math.random() - .5) * .38, az: (Math.random() - .5) * .38, ph: Math.random() * 6 });
    B.forEach(([x, z], i) => { const g = new THREE.Group(); g.position.set(CONCERT.x + x - 6, 0, z); scene.add(g);
      const b = new THREE.Mesh(new THREE.CylinderGeometry(.3, .3, .9, 18, 1, true), metal); b.position.y = .45; g.add(b); const fond = new THREE.Mesh(new THREE.CircleGeometry(.29, 18), interieur); fond.rotation.x = -Math.PI / 2; fond.position.y = .78; g.add(fond);
      const bord = new THREE.Mesh(new THREE.TorusGeometry(.3, .025, 6, 20), A.mat({ color: 0x2a1a12, metalness: .6, roughness: .6 })); bord.rotation.x = Math.PI / 2; bord.position.y = .9; g.add(bord);
      foyers.push(g);
      for (let k = 0; k < 10; k++) { const e = new THREE.Mesh(new THREE.SphereGeometry(.018, 4, 3), new THREE.MeshBasicMaterial({ color: 0xffa040, toneMapped: false, transparent: true })); g.add(e); braises.push({ e, ph: hasard(i * 10 + k) * 3, vx: (hasard(k * 3 + i) - .5) * .4, vz: (hasard(k * 5 + i) - .5) * .4 }); }
      OBST.push([g.position.x - .4, g.position.x + .4, z - .4, z + .4]); });
    // la lueur des flammes : trois lumières qui vacillent (pas une par bidon : le téléphone ne suivrait pas)
    for (const [a, b2] of [[0, 2], [1, 3], [4, 4]]) { const l = new THREE.PointLight(0xff8a30, 10, 11, 1.5), pa = B[a], pb = B[b2]; l.position.set(CONCERT.x - 6 + (pa[0] + pb[0]) / 2, 1.8, (pa[1] + pb[1]) / 2); scene.add(l); lums.push(l); }
    const av = L.anim; L.anim = (t) => { av && av(t); const s2 = t / 1000; flammeU.t.value = s2;
      { const dt5 = Math.min(.05, (t - (feu.tp || t)) / 1000); feu.tp = t; if (M && M.rendu) feuMat.uniforms.uEch.value = M.rendu.domElement.height * .9;
        feuPts.forEach((q, i) => { q.age += dt5 / q.vie; if (q.age >= 1) { q.age -= 1; q.ax = (Math.random() - .5) * .38; q.az = (Math.random() - .5) * .38; q.vie = .7 + Math.random() * .6; }
          const u = q.age, g = foyers[q.b].position, tour = s2 * 2.2 + q.ph, r = (1 - u) * .9, y = .85 + u * u * 1.5 + u * .35;
          fpos[i * 3] = g.x + q.ax * r + Math.sin(tour + u * 6) * .08 * u; fpos[i * 3 + 1] = y; fpos[i * 3 + 2] = g.z + q.az * r + Math.cos(tour * 1.3 + u * 5) * .08 * u;
          const c = u < .18 ? [1, .95, .75] : u < .45 ? [1, .62 - (u - .18) * .8, .18] : u < .75 ? [.95 - (u - .45), .3 - (u - .45) * .5, .06] : [.25, .16, .12];
          fcol.set([c[0], c[1], c[2], u < .08 ? u / .08 : u > .75 ? (1 - u) * 1.2 : 1], i * 4); ftai[i] = (u < .75 ? .55 * (1 - u * .7) : .5 + (u - .75) * 1.6) * (.8 + Math.sin(q.ph) * .2); });
        feuG.attributes.position.needsUpdate = feuG.attributes.couleur.needsUpdate = feuG.attributes.taille.needsUpdate = true; }
      lums.forEach((l, i) => { l.intensity = 9 + Math.sin(s2 * 11 + i) * 1.6 + Math.sin(s2 * 23.7 + i * 2) * 1.2 + Math.sin(s2 * 5.3 + i) * 1.4; });
      for (const b of braises) { const u = ((s2 * .45 + b.ph) % 1.6) / 1.6; b.e.position.set(b.vx * u * 2 + Math.sin(s2 * 3 + b.ph) * .08, 1.1 + u * 2.8, b.vz * u * 2); b.e.material.opacity = 1 - u; } }; }
  // ================= l'atmosphère : le halo des ampoules et des globes, la brume qui traîne au ras du sable, le grain et le cadre de cinéma =================
  { const halo = tex(toile(64, 64, (x) => { const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(.12, "rgba(255,255,255,.75)"); g.addColorStop(.4, "rgba(255,255,255,.18)"); g.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = g; x.fillRect(0, 0, 64, 64); }));
    // (chaque petite lumière — ampoule, globe — reçoit son halo : regroupés par objet parent, pour qu'ils tournent avec la grande roue ou le manège)
    const groupes = new Map(); scene.updateMatrixWorld(true);
    scene.traverse(o => { if (!o.isMesh || !o.geometry || o.geometry.type !== "SphereGeometry" || o.material.transparent) return; const m = o.material; if (!m || !m.isMeshBasicMaterial || m.toneMapped !== false) return;
      const r = o.geometry.parameters.radius; if (r > .3) return; const k = o.parent.uuid + (r > .15 ? "g" : "b"); if (!groupes.has(k)) groupes.set(k, { parent: o.parent, gros: r > .15, pos: [], col: [] }); const q = groupes.get(k); q.pos.push(o.position.x, o.position.y, o.position.z); q.col.push(m.color.r, m.color.g, m.color.b); });
    for (const q of groupes.values()) { const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(q.pos, 3)); g.setAttribute("color", new THREE.Float32BufferAttribute(q.col, 3));
      const pts = new THREE.Points(g, new THREE.PointsMaterial({ size: q.gros ? 1.9 : .62, map: halo, vertexColors: true, transparent: true, opacity: q.gros ? .55 : .7, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); pts.renderOrder = 3; q.parent.add(pts); }
    // la brume du soir, au ras du sol : de grands voiles qui dérivent lentement
    const brumeT = tex(toile(128, 64, (x) => { const g = x.createRadialGradient(64, 32, 2, 64, 32, 62); g.addColorStop(0, "rgba(255,255,255,.55)"); g.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = g; x.save(); x.scale(1, .5); x.fillRect(0, 0, 128, 128); x.restore(); }));
    const voiles = []; for (let i = 0; i < 26; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: brumeT, color: 0xc8b0c8, transparent: true, opacity: .07 + hasard(i) * .06, depthWrite: false }));
      const x0 = -60 + hasard(i * 3.3) * 120, z0 = -30 + hasard(i * 5.1) * 90; sp.position.set(x0, .6 + hasard(i) * .8, z0); sp.scale.set(14 + hasard(i * 7) * 10, 3 + hasard(i * 9) * 2, 1); scene.add(sp); voiles.push({ sp, x0, v: .3 + hasard(i * 2) * .5 }); }
    // le cadre de cinéma : pendant les cinématiques, deux bandes noires ; toujours, un léger vignetage et le grain de la pellicule
    const cadre = document.createElement("div"); cadre.style.cssText = "position:absolute;inset:0;z-index:6;pointer-events:none";
    cadre.innerHTML = '<div class="h" style="position:absolute;left:0;right:0;top:0;height:0;background:#000;transition:height .9s ease"></div><div class="b" style="position:absolute;left:0;right:0;bottom:0;height:0;background:#000;transition:height .9s ease"></div>'
      + '<div style="position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(0,0,0,0) 55%,rgba(0,0,0,.45) 100%)"></div><canvas class="g" width="4" height="4" style="display:none"></canvas>';
    let posé = false, cine = false; const grain = cadre.querySelector(".g"), gx = grain.getContext("2d"), img = gx.createImageData(256, 256);
    const av = L.anim; L.anim = (t) => { av && av(t); const s = t / 1000;
      if (!posé && M && M.ctx.conteneur) { posé = true; M.ctx.conteneur.appendChild(cadre); const garde = setInterval(() => { if (!M || M.L !== L) { cadre.remove(); clearInterval(garde); } }, 600); }
      const c = !!(M && M.cine); if (c !== cine) { cine = c; cadre.querySelector(".h").style.height = cadre.querySelector(".b").style.height = c ? "11%" : "0"; }
      if (false) { for (let i = 0; i < img.data.length; i += 4) { const v = Math.random() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; } gx.putImageData(img, 0, 0); }   // (le grain qui frémit)
      for (const q of voiles) q.sp.position.x = q.x0 + ((s * q.v) % 40) - 20; }; }
  // ================= le combat : quatre vampires, l'eau bénite, le pieu =================
  // les personnages : ceux de l'inventaire de l'administrateur (tête, tenue, couleurs, taille), sinon les photos découpées et les tenues du film
  const NOMS = ["David", "Paul", "Marko", "Dwayne"], vamps = L.vamps = []; M.lbPerso = null;
  const fumeeT = tex(toile(64, 64, (x) => { const g = x.createRadialGradient(32, 32, 2, 32, 32, 30); g.addColorStop(0, "rgba(230,230,230,.8)"); g.addColorStop(1, "rgba(230,230,230,0)"); x.fillStyle = g; x.fillRect(0, 0, 64, 64); }));
  const feuT = tex(toile(64, 64, (x) => { const g = x.createRadialGradient(32, 32, 2, 32, 32, 30); g.addColorStop(0, "rgba(255,240,180,1)"); g.addColorStop(.4, "rgba(255,140,30,.8)"); g.addColorStop(1, "rgba(200,40,0,0)"); x.fillStyle = g; x.fillRect(0, 0, 64, 64); }));
  const parts = []; const particule = (T, p, n, vy, duree, taille) => { for (let i = 0; i < n; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: T, transparent: true, depthWrite: false, blending: T === feuT ? THREE.AdditiveBlending : THREE.NormalBlending }));
      sp.position.set(p.x + (Math.random() - .5) * .5, p.y + (Math.random() - .5) * .6, p.z + (Math.random() - .5) * .5); sp.scale.setScalar(taille); scene.add(sp); parts.push({ sp, v: new THREE.Vector3((Math.random() - .5) * .8, vy * (.5 + Math.random()), (Math.random() - .5) * .8), t0: performance.now(), d: duree, taille }); } };
  let adosIntro = [], choixT = 0, file = [], courant = null, hud = null, vies = 100, morsures = 0, biere = null, phase = "intro", t0 = performance.now(), dernierTir = 0, fini = false;
  let mi = null; const MICH = -875, GAMIN = -885;   // (la fin avec Michael : son état ; Michael, et notre ado laissé de côté quand on joue Michael)
  const moiP = () => { const m = M && M.gens.get(M.moiNum); return m ? m.g.position : null; };
  const majHud = () => { if (!hud) return; const P = (M.ctx.pnjTrio && M.ctx.pnjTrio(M.lbPerso)) || {}, nom = mi && mi.joue ? "Michael" : (P.nom || (ADOS[(M.lbPerso || 81) - 81] || {}).court || "").split(" ")[0];
    hud.querySelector(".v").innerHTML = `${esc(nom)} <span style="display:inline-block;width:130px;height:13px;border:2px solid #fff;border-radius:8px;background:rgba(60,0,0,.8);overflow:hidden;vertical-align:-2px"><i style="display:block;height:100%;width:${Math.max(0, vies)}%;background:${vies > 40 ? "linear-gradient(90deg,#2aa84a,#7ae86a)" : "linear-gradient(90deg,#c81e1e,#ff6a3a)"};transition:width .3s"></i></span> 🔫∞`; hud.querySelector(".n").textContent = "🧛 " + (file.length + (courant && courant.etat !== "mort" ? 1 : 0)); };
  const message = (html, bouton) => { if (!M) return; const d = document.createElement("div"); d.style.cssText = "position:absolute;left:50%;top:38%;transform:translate(-50%,-50%);z-index:9;background:rgba(10,4,6,.86);color:#fff;border:2px solid #b81c22;border-radius:14px;padding:18px 22px;max-width:86%;text-align:center;font:600 17px Georgia,serif;box-shadow:0 0 30px rgba(184,28,34,.5)";
    d.innerHTML = html; if (bouton) { const b = document.createElement("button"); b.textContent = bouton[0]; b.style.cssText = "margin-top:14px;font:700 16px system-ui;padding:10px 18px;border-radius:10px;border:0;background:#b81c22;color:#fff;cursor:pointer"; b.onclick = e => { e.stopPropagation(); d.remove(); bouton[1](); }; d.appendChild(b); }
    else setTimeout(() => d.remove(), 4200); for (const ev of ["pointerdown", "pointerup", "click"]) d.addEventListener(ev, e => e.stopPropagation()); M.ctx.conteneur.appendChild(d); if (bouton) M.manMenu = { d };
    const gm = setInterval(() => { if (!d.isConnected || !M || M.L !== L) { d.remove(); clearInterval(gm); } }, 600); return d; };   /* (on quitte Santa Carla : le message ne nous suit pas) */
  const barreVie = () => { const cv = document.createElement("canvas"); cv.width = 160; cv.height = 40; const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true })); sp.scale.set(1.7, .42, 1); sp.position.y = 2.6; sp.renderOrder = 5; return { cv, t, sp }; };
  const majBarre = (v) => { const { cv, t } = v.barre, x = cv.getContext("2d"), u = Math.max(0, v.pv) / v.pvMax; x.clearRect(0, 0, 160, 40);
    
    x.fillStyle = "rgba(40,0,0,.85)"; x.fillRect(8, 20, 144, 14); x.fillStyle = u > .5 ? "#d81e2a" : "#ff8a2a"; x.fillRect(10, 22, 140 * u, 10); x.strokeStyle = "#fff"; x.lineWidth = 2; x.strokeRect(8, 20, 144, 14); t.needsUpdate = true; };
  // la bière : elle apparaît non loin quand on a été mordu plus d'une fois ; on va la boire pour reprendre des forces
  const lumBiere = new THREE.PointLight(0xffc060, 0, 5, 1.6); lumBiere.position.set(0, -50, 0); scene.add(lumBiere);
  const poserBiere = () => { const p = moiP(); if (!p) return; let x = p.x + 4, z = p.z;
    for (let k = 0; k < 24; k++) { const a = Math.random() * 6.28, r = 4 + Math.random() * 4, x2 = p.x + Math.cos(a) * r, z2 = p.z + Math.sin(a) * r; if (!L.limites || L.limites(x2, z2)) { x = x2; z = z2; break; } }
    const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g); const verre = A.mat({ color: 0x6a3a10, roughness: .2, metalness: .1, transparent: true, opacity: .9, emissive: 0x3a1a04 });
    cyl(g, .09, .09, .32, verre, 0, .5, 0, 14); cyl(g, .04, .09, .1, verre, 0, .71, 0, 14); cyl(g, .035, .035, .1, verre, 0, .8, 0, 12); cyl(g, .04, .04, .03, A.mat({ color: 0xd8b030, metalness: .7 }), 0, .86, 0, 12);
    const et = new THREE.Mesh(new THREE.CylinderGeometry(.092, .092, .14, 14, 1, true), new THREE.MeshBasicMaterial({ map: tex(toile(128, 48, (q) => { q.fillStyle = "#f2e8c8"; q.fillRect(0, 0, 128, 48); q.fillStyle = "#c81e1e"; q.font = "bold 20px Georgia"; q.textAlign = "center"; q.fillText("BEER", 64, 32); })) })); et.position.y = .5; g.add(et);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: fumeeT, color: 0xffd060, transparent: true, opacity: .55, depthWrite: false, blending: THREE.AdditiveBlending })); halo.scale.setScalar(1.3); halo.position.y = .6; g.add(halo);
    biere = { g }; lumBiere.intensity = 6; lumBiere.position.set(x, 1, z);
    const c = comps[0]; if (c) parle(c.num, "Une bière ! Là-bas ! Va la boire, ça va te requinquer !");  };
  const boireBiere = (now, p) => { if (!biere) return; biere.g.rotation.y = now / 600; biere.g.position.y = Math.abs(Math.sin(now / 400)) * .12;
    if (Math.hypot(p.x - biere.g.position.x, p.z - biere.g.position.z) < 1.1) { scene.remove(biere.g); biere = null; lumBiere.intensity = 0; vies = Math.min(100, vies + 40); majHud(); try { sonBruit(.5, 600, .25); } catch (e) {}
      parle(M.moiNum, "Glou glou… Aaah ! Ça fait du bien !"); voile("background:radial-gradient(circle,rgba(255,200,60,0) 40%,rgba(255,200,60,.45) 100%);transition:opacity .8s", 700); } };
  // ---------- la fin : David vaincu, « Good Times », les ados se parlent ; la caméra part d'eux et monte vers le ciel, où paraît le titre, et « FIN » ; retour au mess, devant l'affiche ----------
  const finale = () => { if (fini) return; fini = true; phase = "fin"; if (L.aube && !L.aube.t0) L.aube.t0 = performance.now();   /* (le jour qui revient : le ciel orangé, crescendo) */ musiqueLB("fin"); if (hud) hud.style.display = "none"; if (biere) { scene.remove(biere.g); biere = null; }
    const moi = M.lbPerso, c0 = comps[0], c1 = comps[1], nomDe = id => (((M.ctx.pnjTrio && M.ctx.pnjTrio(id)) || {}).nom || ADOS[id - 81].nom).split(" ")[0];   // (le prénom)
    const n0 = c0 && c0.num, n1 = c1 && c1.num;
    const avecMi = M.gens.has(MICH);   /* (Michael est là : il fête la victoire avec eux) */
    setTimeout(() => { if (M && M.L === L) dialogue(avecMi ? [[M.moiNum, "On l'a fait… Santa Carla est libre !"], [MICH, "Vous avez été incroyables, tous les trois. Sans vous, je serais devenu comme eux."], [n0, REPL[c0 ? c0.id : 82].fete],
      [MICH, "Merci, les gars. Vraiment. Je vous dois la vie… et mon âme avec."], [n1, `${nomDe(moi)}, t'as été génial. Et toi aussi, Michael !`], [M.moiNum, "Tu crois qu'il en reste d'autres, à Santa Carla ?"],
      [n0, "Il y en a toujours d'autres… Mais pas ce soir."], [MICH, "Allez, on rentre à la maison. Maman doit être morte d'inquiétude."]]
      : [[M.moiNum, "On l'a eu… On a eu leur chef !"], [n0, REPL[c0 ? c0.id : 82].fete], [n1, `${nomDe(moi)}, t'as été génial. Vraiment.`],
      [M.moiNum, "Tu crois qu'il en reste d'autres, à Santa Carla ?"], [n0, "Il y en a toujours d'autres… Mais pas ce soir."], [n1, "Allez, on rentre. Il va bientôt faire jour."]], () => { if (M && M.L === L) envolee(); }); }, 1500); };
  const envolee = () => { const gens = [M.gens.get(M.moiNum), ...comps.map(c => c.p), M.gens.get(MICH)].filter(Boolean); if (!gens.length) return;
    musiqueLB("envol");
    const ctr = V3(0, 0, 0); gens.forEach(q => ctr.add(q.g.position)); ctr.multiplyScalar(1 / gens.length);
    const cam = M.camera, t0 = performance.now(), D = 24000; let fini2 = false, titre = null;
    // (devant les ados, à hauteur de visage ; puis on s'élève en tournant au-dessus de la jetée, la grande roue, le concert ; on finit très haut, la baie entière sous nous)
    const CP = new THREE.CatmullRomCurve3([V3(ctr.x, 1.7, ctr.z + 4.2), V3(ctr.x + 3, 5, ctr.z + 9), V3(ctr.x + 14, 14, ctr.z + 14), V3(26, 22, 20), V3(34, 28, 46), V3(30, 32, 70), V3(22, 34, 86)], false, "centripetal");
    const CC = new THREE.CatmullRomCurve3([V3(ctr.x, 1.4, ctr.z), V3(ctr.x, 1.6, ctr.z), V3(ctr.x - 2, 2, ctr.z - 4), V3(4, 4, -8), V3(2, 3, -8), V3(0, 2, -6), V3(0, 1, -4)], false, "centripetal");
    const lisse = u => u * u * u * (u * (u * 6 - 15) + 10);
    const fin = () => { if (fini2 || !M) return; fini2 = true; const v = document.createElement("div"); v.style.cssText = "position:absolute;inset:0;z-index:20;pointer-events:none;background:#000;opacity:0;transition:opacity 1.6s ease"; M.ctx.conteneur.appendChild(v); requestAnimationFrame(() => { v.style.opacity = 1; });
      // le noir : la musique continue cinq secondes, puis s'éteint doucement ; dans le noir, on rentre en 1990, dans la cour d'honneur ; le noir se lève, la musique de la fête reprend sa place
      if (titre) { titre.style.zIndex = 21; titre.style.background = "none"; } setTimeout(() => { if (M) { M.passerBtn && M.passerBtn.remove(); M.passerBtn = null; } }, 1700);   // (le titre reste, sur le noir)
      setTimeout(() => { const a = M && M.lbMus && M.lbMus.a; if (!a) return; const v0 = a.volume, t1 = performance.now(); const f = setInterval(() => { const u = Math.min(1, (performance.now() - t1) / 3500); a.volume = v0 * (1 - u) * (1 - u); if (u >= 1) { clearInterval(f); a.pause(); } }, 40); }, 1600 + 5000);
      setTimeout(() => { if (titre) { titre.style.transition = "opacity 2.5s"; titre.style.opacity = 0; } }, 1600 + 5000 + 600);   // (il s'efface avec la musique)
      setTimeout(() => { if (titre) titre.remove(); if (!M) return; if (M.lbMus) { try { M.lbMus.a.pause(); } catch (e) {} M.lbMus = null; } finCine(); changerLieu("grande");
        setTimeout(() => { v.style.transition = "opacity 2.2s ease"; v.style.opacity = 0; setTimeout(() => v.remove(), 2400); }, 1200); }, 1600 + 5000 + 3700); };
    M.passerBtn = boutonPasser(fin);
    M.cine = { maj: now => { const u = Math.min(1, (now - t0) / D), e = lisse(u);
        cam.position.copy(CP.getPointAt(e)); cam.lookAt(CC.getPointAt(e)); cam.rotateZ(Math.sin(e * Math.PI) * .06 * (1 - e));
        if (u > .62 && !titre) { titre = document.createElement("div"); titre.style.cssText = "position:absolute;inset:0;z-index:8;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3%;pointer-events:none;opacity:0;transition:opacity 3s;background:radial-gradient(ellipse at center,rgba(0,0,0,.5) 0%,rgba(0,0,0,.2) 45%,rgba(0,0,0,0) 75%)";
          titre.innerHTML = '<img src="images/santacarla/titre.webp" alt="The Lost Boys" style="width:72%;max-width:760px;filter:drop-shadow(0 0 3px #000) drop-shadow(0 0 14px rgba(0,0,0,.9))"><img src="images/santacarla/fin.webp" alt="Fin" style="width:20%;max-width:200px;filter:drop-shadow(0 0 3px #000) drop-shadow(0 0 12px rgba(0,0,0,.9))">';
          M.ctx.conteneur.appendChild(titre); requestAnimationFrame(() => { titre.style.opacity = 1; }); }
        if (now - t0 > D + 6000) fin(); }, fov: [55, 70] }; };
  L.etatLB = () => ({ vies, morsures, biere: !!biere, phase }); L.finLB = () => finale(); L.mordreLB = () => mordu({});   // (pour les essais)
  // (le vampire abattu tombe là où l'on peut marcher : s'il était au-dessus de l'eau, d'un manège ou d'un stand, il glisse jusqu'à l'endroit praticable le plus proche)
  // (au-dessus de là où l'on peut marcher, près des ados : un point trop loin ou hors de portée est ramené vers nous, sur le ponton)
  const pres = (x, z, p, rmax = 9) => { let dx = x - p.x, dz = z - p.z, d = Math.hypot(dx, dz) || 1; if (d > rmax) { dx *= rmax / d; dz *= rmax / d; d = rmax; }
    for (let k = 1; k >= .2; k -= .1) { const cx = p.x + dx * k, cz = p.z + dz * k; if (!L.limites || L.limites(cx, cz)) return [cx, cz]; } return [p.x, p.z]; };
  const poserAuSol = (v) => { const g = v.g, p0 = moiP(); if (p0) { const [x, z] = pres(g.position.x, g.position.z, p0, 5); g.position.x = x; g.position.z = z; return; } const x0 = g.position.x, z0 = g.position.z; if (!L.limites || L.limites(x0, z0)) return;
    const p = moiP(); for (let r = .5; r < 40; r += .5) for (let a = 0; a < 6.28; a += .4) { const x = x0 + Math.cos(a) * r, z = z0 + Math.sin(a) * r; if (L.limites(x, z)) { g.position.x = x; g.position.z = z; return; } }
    if (p) { g.position.x = p.x + 2; g.position.z = p.z; } };
  const creerVampire = (k) => { const a = Math.random() * 6.28, p0 = moiP() || V3(0, 0, 0), P = (M.ctx.pnjTrio && M.ctx.pnjTrio(84 + k)) || {};
    const p = ajouterAncien({ ...habillerLB({ numero: -(860 + k), nom: P.nom || NOMS[k], initiales: "" }, 84 + k), pnj: true, x: p0.x + Math.cos(a) * 30, z: p0.z + Math.sin(a) * 30 }); if (!p) return null;
    p.vol = 14; const barre = barreVie(); p.g.add(barre.sp); const v = { k, barre, nom: P.nom || NOMS[k], p, g: p.g, y: 14, pv: k === 0 ? 6 : 3, pvMax: k === 0 ? 6 : 3, etat: "approche", a, r: 7 + Math.random() * 4, h: 3 + Math.random() * 3, tEtat: performance.now() + 3000 + Math.random() * 4000, vit: k === 0 ? 1.15 : 1 };
    majBarre(v); vamps.push(v); return v; };
  // les vampires viennent un par un : Paul, Marko, Dwayne, puis David ; entre deux, on cherche — mais c'est surtout eux qui nous trouvent
  const ORDRE = [1, 2, 3, 0];
  const AVANT = {   // (le dialogue avant chaque combat : « V » le vampire, « M » nous, « F » l'un des frères Frog (grossiers quand il s'agit des vampires), « A » un autre ado ; les ados ne connaissent pas leurs noms)
    1: [["V", "Hé hé ! Regardez-moi ça… des gamins avec des pistolets à eau !"], ["F", "Rigole, sale suceur de sang. C'est de l'eau bénite, connard."], ["V", "Wouhou ! Ce soir, on fait la fête !"], ["M", "La fête est finie."]],
    2: [["V", "Vous avez tué Paul… Ha ha ha… Il était pénible, de toute façon."], ["M", "T'es le prochain."], ["F", "Regarde ses yeux, à cette ordure… Il a déjà bouffé quelqu'un ce soir."], ["V", "Viens me chercher, petit !"]],
    3: [["V", "Grrr…"], ["F", "Celui-là ne cause pas… Un vrai chien enragé. Attention, il est rapide !"], ["V", "Paul… Marko… Vous allez payer pour mes frères."], ["M", "Qu'il vienne !"]],
    0: [["V", "Alors c'est vous… Vous avez tué Paul, Marko et Dwayne."], ["M", "C'étaient pas des frères. C'étaient des monstres."], ["V", "Tu ne comprends rien. Cette baie était à nous bien avant ta naissance… et elle le sera encore longtemps après."],
      ["F", "Ta gueule, sale parasite. Ce soir, tu crèves."], ["V", "Tuez-moi si vous voulez. Santa Carla appartiendra toujours à ceux de mon espèce."], ["V", "Nous sommes au-dessus de vous. Pour nous, les hommes ne sont que du bétail."],
      ["A", "Le concert va bientôt finir. C'est maintenant ou jamais !"], ["V", "Alors venez… Montrez-moi ce que vous valez."]] };
  const ENTRE = {   // (entre deux combats : les ados reprennent leur souffle et se parlent)
    0: [["M", "On l'a eu… Il a vraiment explosé !"], ["F", "Un de moins. Mais ces enfoirés sont quatre, et ils savent qu'on est là maintenant."], ["A", "Le concert continue… On a encore un peu de temps."], ["F", "Rechargez l'eau bénite. Le prochain arrive, je le sens."]],
    1: [["A", "Deux… Il en reste deux."], ["M", "J'ai les mains qui tremblent."], ["F", "C'est normal. Moi aussi, la première fois. Respire, et vise le cœur."], ["A", "Regardez là-haut… quelque chose bouge au-dessus de la grande roue."]],
    2: [["F", "Trois de ces saloperies en cendres. Plus qu'un."], ["M", "Le chef. Il va venir lui-même, et il sera furieux."], ["A", "Restons ensemble. Quoi qu'il arrive."], ["F", "Ce soir, il crève. Pour Santa Carla."]] };
  const APRES = ["Un de moins. Il en reste encore… Ouvrez l'œil.", "Ils vont venir nous chercher. Restons ensemble.", "Le concert continue… On n'a pas beaucoup de temps.", "Je les sens… Ils nous observent, quelque part au-dessus de la jetée."];
  const prochain = () => { if (!M || M.L !== L || fini) return; const k = file.shift(); if (k == null) { finale(); return; }
    if (k === 0) { phase = "david"; musiqueLB("david"); } courant = creerVampire(k); majHud(); };
  const bandeauCombat = () => { if (!document.getElementById("styleCombatLB")) { const st = document.createElement("style"); st.id = "styleCombatLB"; st.textContent = "@keyframes lbCombat{0%{opacity:0;transform:scale(1.8);letter-spacing:.6em}18%{opacity:1;transform:scale(1);letter-spacing:.18em}75%{opacity:1}100%{opacity:0;transform:scale(.96)}}"; document.head.appendChild(st); }
    const d = voile("display:grid;place-items:center", 2000); d.innerHTML = '<div style="font:900 clamp(40px,11vw,96px) Georgia,serif;color:#e01818;letter-spacing:.18em;text-shadow:0 0 6px #000,0 0 26px rgba(255,0,0,.8);animation:lbCombat 2s ease-out forwards">COMBAT</div>'; try { sonBruit(.5, 300, .5); } catch (e) {} };
  // le visage se transforme : le visage humain se fond dans le visage de vampire (les yeux, les crocs), un grondement, une lueur ; puis il lance son défi
  const DEFI = { 1: "Wouhou ! Venez, les gamins… je vous attends !", 2: "Allez, venez jouer… si vous l'osez !", 3: "Grrraaah… Venez !", 0: "Venez… Je vous attends." };
  const transformer = (v, fin, o = {}) => { const p = v.p, k = v.k, vamp = habillerLB({ numero: p.info.numero, nom: p.info.nom, initiales: "" }, o.id ?? 89 + k), url = vamp.teteUrl;   // (le personnage « … vampire » de l'inventaire : sa tête, sa tenue, sa taille)
    const cam = M.camera, s0 = p.g.position, H = tailleBonhomme() * hauteurDe(p), q = moiP() || V3(s0.x, 0, s0.z + 3); let dx = q.x - s0.x, dz = q.z - s0.z, l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
    { const v1 = choisirVue(s0, H, dx, dz, 4.2, 0, [p.g], .7), v2 = choisirVue(s0, H, ...tourner(dx, dz, v1.r), 2, 0, [p.g], .85); [dx, dz] = tourner(dx, dz, v1.r + (Math.abs(v2.r) > .01 ? v2.r * .5 : 0)); }   /* (le plan sur lui : dégagé, de loin comme de près — personne devant lui) */
    let fait = false; const finir = () => { if (fait) return; fait = true; if (M && M.cine === C) { bulle(null); finCine(); } fin && fin(); };
    const devenir = () => { const nom = p.info.nom; Object.assign(p.info, vamp, { nom }); if (p.corps) { const H2 = tailleBonhomme(); p.corps.scale.set(H2 * .476 * 1.6 * hauteurDe(p), H2 * hauteurDe(p), 1); } };
    const t0 = performance.now(); let ov = null, change = false, dit = false;
    chargerTete(0, null, url).then(img => { if (!img || !M || !p.corps) return; const tx = tex(dessinerBonhomme({ ...p.info, ...vamp, nom: p.info.nom, large: true }, img));
      ov = new THREE.Mesh(p.corps.geometry, new THREE.MeshBasicMaterial({ map: tx, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })); ov.position.z = .002; ov.renderOrder = 3; p.corps.add(ov); });
    const C = { maj: now => { const u = (now - t0) / 1000;
        // le plan sur lui : d'abord en pied, la caméra tourne doucement autour de lui et s'approche jusqu'au gros plan sur son visage, le temps de la transformation
        const z = Math.min(1, u / 3.2), e = z * z * (3 - 2 * z), dd = 4.2 - e * 2.2, tour = (1 - e) * .5, hx = dx * Math.cos(tour) - dz * Math.sin(tour), hz = dx * Math.sin(tour) + dz * Math.cos(tour);
        cam.position.set(s0.x + hx * dd, s0.y + H * (.6 + e * .25), s0.z + hz * dd); cam.lookAt(s0.x, s0.y + H * (.52 + e * .26), s0.z);
        if (u > 2.4 && u < 2.75) { cam.position.x += (Math.random() - .5) * .05; cam.position.y += (Math.random() - .5) * .03; }   // (le tremblement, au moment où il se transforme)
        if (ov) { const a = Math.min(1, Math.max(0, (u - 2.4) / 1.5)); ov.material.opacity = a * a * (3 - 2 * a); }   // (le visage change, en fondu)
        if (u > 2.4 && !change) { change = true; try { sonBruit(1.3, 160, .55); } catch (e) {} voile("background:radial-gradient(circle,rgba(255,180,60,.0) 30%,rgba(120,0,0,.45) 100%);transition:opacity 1.2s", 900); }
        if (u > 4.1 && !dit) { dit = true; devenir(); dessinerCorps(p).then(() => { if (ov && ov.parent) ov.parent.remove(ov); }); bulle(`<b style="color:#ff5a4a">${esc(nomDe(p.info.numero))}</b> : ${esc(o.defi ?? DEFI[k])}`, 2600); if (M.bulleEl) { M.bulleEl.style.top = "auto"; M.bulleEl.style.bottom = "13%"; } }
        if (u > 6.6) finir(); }, fov: [40, 56] };
    M.passerBtn = boutonPasser(() => { if (!dit) { dit = true; devenir(); dessinerCorps(p); if (ov && ov.parent) ov.parent.remove(ov); } finir(); }); M.cine = C; };
  const dialogueAvant = (v) => { const frere = comps.find(c => c.id !== 81), autre = comps.find(c => c !== frere), nums = { V: v.p.info.numero, M: M.moiNum, F: frere ? frere.num : M.moiNum, A: autre ? autre.num : (frere ? frere.num : M.moiNum) };
    dialogue(AVANT[v.k].map(([qui, txt]) => [nums[qui], txt]), () => { if (!M || M.L !== L || v.etat !== "parle") return; transformer(v, () => { if (M && M.L === L && v.etat === "parle") { v.etat = "remonte"; v.tEtat = performance.now() + 1500; phase = v.k === 0 ? "david" : "vague1";
      bandeauCombat(); v.p.info.brasHaut = true; } }); }); };
  const demarrer = () => { musiqueLB(null); finMichael(); for (const v of vamps) retirerAncien(v.p.info.numero); vamps.length = 0; vies = 100; morsures = 0; if (biere) { scene.remove(biere.g); biere = null; } fini = false; phase = "chasse"; file = ORDRE.slice(); majHud();
    setTimeout(prochain, 6000); };
  const blesser = (v, pt) => { const now = performance.now(); if (now - dernierTir < 320) return; dernierTir = now;
    const p = moiP(); if (!p) return; const d = Math.hypot(v.g.position.x - p.x, v.g.position.z - p.z);
    if (mi && mi.joue) { if (v.k === 0 && ["sol", "charge", "recul"].includes(v.etat) && d < 20) lancerPieu(v); return; }   /* (Michael ne tire pas d'eau bénite : il lance des pieux) */
    if (v.etat === "terre") { courirPieu(v); return; }   // (un vampire à terre : on le touche, on court à lui, et on lui plante le pieu)
    if (v.etat === "mort" || v.etat === "brule") return; if (v.etat === "approche" || v.etat === "parle") return; if (d > 16) return;
    // le jet d'eau bénite : des gouttes du pistolet au vampire
    const but = pt || v.g.position.clone().add(new THREE.Vector3(0, 1.4, 0)); ado.vise = { pt: but, t: now }; ado.kick = 1; majAdo(); const dep = buse(but);
    { const moi = M.gens.get(M.moiNum), dx = but.x - p.x, dz = but.z - p.z, l = Math.hypot(dx, dz) || 1; if (moi) { moi.tirT = now; vueTir(moi, dx / l, dz / l); } }   // (le bras se lève, pointé sur lui)
    if (Math.random() < .45) parle(M.moiNum, hasardDe(REPL[M.lbPerso].tir)); setTimeout(() => { if (v.etat !== "mort" && Math.random() < .6) parle(v.p.info.numero, hasardDe(REPL_V[84 + v.k].touche)); }, 450);
    for (let i = 0; i < 12; i++) { const gt = new THREE.Mesh(new THREE.SphereGeometry(.05, 6, 4), new THREE.MeshBasicMaterial({ color: 0xbfe6ff, transparent: true, opacity: .85 })); scene.add(gt); parts.push({ sp: gt, de: dep.clone(), a: but.clone(), t0: now + i * 18, d: 260, goutte: true }); }
    try { sonBruit(.35, 2400, .25); } catch (e) {}
    setTimeout(() => { if (v.etat === "mort") return; v.pv--; majBarre(v); particule(fumeeT, v.g.position.clone().add(new THREE.Vector3(0, 1.5, 0)), 8, 1.2, 1100, .9); try { sonBruit(.6, 900, .35); } catch (e) {}
      if (v.pv <= 0) { v.etat = "terre"; v.tEtat = performance.now() + 9000; poserAuSol(v);  const c = comps[0]; if (c) parle(c.num, hasardDe(REPL[c.id].encourage.concat(["Le pieu ! Vite, avant qu'il se relève !"]))); }
      else { v.etat = "remonte"; v.tEtat = performance.now() + 1600; } }, 260); };
  // le pieu : on l'enfonce dans le cœur ; le sang gicle, puis le vampire explose et brûle
  const sangT2 = tex(toile(64, 64, (x) => { const g = x.createRadialGradient(32, 32, 1, 32, 32, 30); g.addColorStop(0, "rgba(150,0,6,1)"); g.addColorStop(.55, "rgba(110,0,4,.9)"); g.addColorStop(1, "rgba(80,0,0,0)"); x.fillStyle = g; x.fillRect(0, 0, 64, 64); }));
  const flammeT = tex(toile(64, 128, (x) => { const g = x.createRadialGradient(32, 92, 2, 32, 80, 56); g.addColorStop(0, "rgba(255,250,210,1)"); g.addColorStop(.25, "rgba(255,200,60,.95)"); g.addColorStop(.55, "rgba(255,90,10,.75)"); g.addColorStop(1, "rgba(160,20,0,0)");
    x.fillStyle = g; x.beginPath(); x.moveTo(32, 2); x.bezierCurveTo(54, 40, 62, 80, 50, 110); x.quadraticCurveTo(32, 128, 14, 110); x.bezierCurveTo(2, 80, 10, 40, 32, 2); x.fill(); }));
  const fumeeN = tex(toile(64, 64, (x) => { const g = x.createRadialGradient(32, 32, 2, 32, 32, 30); g.addColorStop(0, "rgba(40,34,30,.85)"); g.addColorStop(1, "rgba(20,18,16,0)"); x.fillStyle = g; x.fillRect(0, 0, 64, 64); }));
  const lumBoom = new THREE.PointLight(0xffa040, 0, 22, 1.4); lumBoom.position.set(0, -50, 0); scene.add(lumBoom);   // (préparée d'avance, éteinte)
  const eclat = (T, pos, vel, d, t0, taille, opt = {}) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: T, transparent: true, depthWrite: false, blending: opt.add ? THREE.AdditiveBlending : THREE.NormalBlending, toneMapped: !opt.add }));
    sp.position.copy(pos); sp.scale.setScalar(taille); sp.visible = false; scene.add(sp); parts.push({ sp, v: vel, t0, d, taille, g: opt.g || 0, grandit: opt.grandit ?? 1, flamme: opt.flamme, sol: opt.sol }); };
  // un vrai pieu de bois : le fût veiné, la pointe taillée au couteau (facettes claires), la poignée entourée de ficelle ; l'origine est à la pointe
  let texPieu = null; const modelePieu = (lg = 1, lueur = 0) => { const g = new THREE.Group();
    texPieu = texPieu || tex(toile(64, 256, (x, w, h) => { x.fillStyle = "#7a5130"; x.fillRect(0, 0, w, h); for (let i = 0; i < 26; i++) { x.strokeStyle = `rgba(${hasard(i) > .5 ? "40,22,10" : "170,120,70"},${.25 + hasard(i * 3) * .35})`; x.lineWidth = 1 + hasard(i * 7) * 2; x.beginPath(); const x0 = hasard(i * 11) * w; x.moveTo(x0, 0); x.bezierCurveTo(x0 + 6, h * .3, x0 - 6, h * .6, x0 + 3, h); x.stroke(); }
      for (const [kx, ky] of [[.3, .35], [.7, .7]]) { x.fillStyle = "rgba(40,20,8,.7)"; x.beginPath(); x.ellipse(kx * w, ky * h, 5, 10, 0, 0, 7); x.fill(); } }));
    const bois = new THREE.MeshStandardMaterial({ map: texPieu, roughness: .85, emissive: 0xff6a20, emissiveIntensity: lueur }), taille = new THREE.MeshStandardMaterial({ color: 0xcfa36a, roughness: .7, flatShading: true, emissive: 0xff6a20, emissiveIntensity: lueur });
    const pt = new THREE.Mesh(new THREE.ConeGeometry(.045 * lg, .26 * lg, 6), taille); pt.rotation.x = Math.PI; pt.position.y = .13 * lg; g.add(pt);
    const fut = new THREE.Mesh(new THREE.CylinderGeometry(.05 * lg, .045 * lg, .74 * lg, 10), bois); fut.position.y = .26 * lg + .37 * lg; g.add(fut);
    const bout = new THREE.Mesh(new THREE.CylinderGeometry(.043 * lg, .05 * lg, .03 * lg, 10), taille); bout.position.y = lg; g.add(bout);
    const ficelle = new THREE.MeshStandardMaterial({ color: 0x9a8660, roughness: 1 }); for (let k = 0; k < 6; k++) { const r = new THREE.Mesh(new THREE.TorusGeometry(.052 * lg, .008 * lg, 5, 14), ficelle); r.rotation.x = Math.PI / 2 + (k % 2 ? .12 : -.12); r.position.y = (.74 + k * .028) * lg; g.add(r); }
    g.traverse(o => { if (o.isMesh) o.castShadow = true; }); return g; };
  L.modelePieu = modelePieu;
  // ================= la fin, avec Michael =================
  const lesAdos = () => { const fr = comps.find(c => c.id !== 81), au = comps.find(c => c !== fr), sam = M.lbPerso === 81 ? M.moiNum : (comps.find(c => c.id === 81) || {}).num;
    return { F: fr ? fr.num : M.moiNum, A: au ? au.num : (fr ? fr.num : M.moiNum), S: sam ?? M.moiNum }; };
  const habiller = (q, id, nom) => { const vi = habillerLB({ numero: q.info.numero, nom: nom ?? q.info.nom, initiales: "" }, id); Object.assign(q.info, vi); if (q.corps) { const H2 = tailleBonhomme(); q.corps.scale.set(H2 * .476 * 1.6 * hauteurDe(q), H2 * hauteurDe(q), 1); } return dessinerCorps(q); };
  // 1. on s'approche de David à terre, le pieu à la main… il se relève : l'eau bénite ne lui fait rien
  const releveDavid = (v) => { if (mi) return; mi = { etape: 1 }; ado.pieuVers = null; v.etat = "parle"; v.g.rotation.z = 0; v.g.position.y = 0; v.p.vol = 0; v.pv = v.pvMax; majBarre(v);
    try { sonBruit(1.3, 140, .6); } catch (e) {} voile("background:radial-gradient(circle,rgba(120,0,0,0) 30%,rgba(120,0,0,.5) 100%);transition:opacity 1s", 800);
    const { F, A } = lesAdos(), D = v.p.info.numero;
    setTimeout(() => { if (!M || M.L !== L) return; dialogue([[A, "Il… il se relève !"], [F, "C'est pas possible… L'eau bénite lui fait plus rien !"], [D, "Ha ha ha ha… Vous croyiez vraiment m'avoir avec vos pistolets à eau ?"],
      [M.moiNum, "Il est trop puissant… On n'y arrivera jamais."], [D, "Regardez-vous… Trois gamins trempés, qui tremblent comme des feuilles. Vous me faites pitié."], [F, "C'est foutu… On est foutus, les gars."],
      [D, "Je vais prendre mon temps avec vous. Alors… je commence par lequel ?"]], () => arriveeMichael(v)); }, 900); };
  // 2. Michael arrive — Sam est fou de joie ; David redevient lui-même pour lui parler ; Michael demande qu'on le lui laisse
  const arriveeMichael = (v) => { if (!M || M.L !== L) return; const p = moiP(); if (!p) return; let sx = p.x - 11, sz = p.z;
    for (let k = 0; k < 32; k++) { const a = k / 32 * 6.283, x = p.x + Math.cos(a) * 11, z = p.z + Math.sin(a) * 11; if ((!L.limites || L.limites(x, z)) && Math.hypot(x - v.g.position.x, z - v.g.position.z) > 6) { sx = x; sz = z; break; } }
    const P = (M.ctx.pnjTrio && M.ctx.pnjTrio(93)) || {}, mp = ajouterAncien({ ...habillerLB({ numero: MICH, nom: P.nom || "Michael", initiales: "" }, 93), pnj: true, x: sx, z: sz }); if (!mp) return;
    mi.etape = 2; mp.info.allure = 1.1;
    /* (il s'arrête à côté du groupe, du côté où il arrive, face à David : jamais derrière un ado) */
    let fx = v.g.position.x - p.x, fz = v.g.position.z - p.z; { const l2 = Math.hypot(fx, fz) || 1; fx /= l2; fz /= l2; } const sd = ((sx - p.x) * -fz + (sz - p.z) * fx) >= 0 ? 1 : -1;
    let bx = p.x - fz * sd * 2.6, bz = p.z + fx * sd * 2.6; if (L.limites && !L.limites(bx, bz)) { bx = p.x + fz * sd * 2.6; bz = p.z - fx * sd * 2.6; } mp.cible = V3(bx, 0, bz); mp.chemin = [];
    const Hm = tailleBonhomme() * hauteurDe(mp), vm = choisirVue(V3(bx, 0, bz), Hm, sx - bx, sz - bz, 5, 0, [mp.g], .7), [cx0, cz0] = tourner((sx - bx) / (Math.hypot(sx - bx, sz - bz) || 1), (sz - bz) / (Math.hypot(sx - bx, sz - bz) || 1), vm.r);
    const t0 = performance.now(); let fait = false; const suite = () => { if (fait || !M) return; fait = true; if (M.cine === C) finCine(); mp.g.position.set(bx, 0, bz); mp.cible = null; habiller(v.p, 84);   /* (David reprend son visage d'homme pour lui parler) */
      const { S } = lesAdos(), D = v.p.info.numero;
      dialogue([[S, "Michael ?! MICHAEL !"], [S, "T'es venu… T'es vraiment venu !"], [MICH, "Évidemment, petit frère. Je n'allais pas te laisser tout seul avec lui."], [D, "Michael… Je savais que tu viendrais."],
        [D, "Tu es l'un des nôtres. Tu as bu le sang. On ne lutte pas contre ce qu'on est."], [MICH, "Je ne serai jamais comme toi, David. Jamais."], [D, "Regarde-toi… Tu as faim. Je le vois dans tes yeux."],
        [MICH, "Sam. Recule, et emmène les autres. Laisse-le-moi."], [S, "Mais Michael… il est trop fort !"], [MICH, "Fais-moi confiance. Celui-là, il est pour moi."], [D, "Comme tu voudras… frère."]],
        () => transformer({ p: mp, k: "m" }, () => transformer(v, () => duel(v, mp), { id: 89, defi: "Viens, Michael… Montre-moi ce que tu es devenu." }), { id: 94, defi: "C'est fini, David." })); };
    M.passerBtn = boutonPasser(suite);
    const C = { maj: now => { const u = (now - t0) / 1000, q = mp.g.position; M.camera.position.set(bx + cx0 * vm.dd * .9 - cz0 * 1.2, 1.6, bz + cz0 * vm.dd * .9 + cx0 * 1.2); M.camera.lookAt(q.x, 1.35, q.z);   /* (on le voit arriver, de face, sans personne devant) */
        if (u > 1 && !C.dit) { C.dit = true; bulle(`<b style="color:#ff5a4a">${esc(nomDe(lesAdos().S))}</b> : Attendez… quelqu'un arrive !`, 2200); if (M.bulleEl) { M.bulleEl.style.top = "auto"; M.bulleEl.style.bottom = "13%"; } }
        if (u > 5 || Math.hypot(q.x - bx, q.z - bz) < .5) suite(); }, fov: [45, 60] }; M.cine = C; };
  // 3. le duel : on joue Michael (vampire) ; notre ado reste à l'écart ; Michael lance des pieux, David charge
  const duel = (v, mp) => { if (!M || M.L !== L) return; const moi = M.gens.get(M.moiNum); if (!moi) return;
    const voileN = voile("background:#000;opacity:0;transition:opacity .35s", 1200); requestAnimationFrame(() => { voileN.style.opacity = "1"; });
    setTimeout(() => { if (!M || M.L !== L) return; const q = moi.g.position.clone(), P = (M.ctx.pnjTrio && M.ctx.pnjTrio(M.lbPerso)) || {};
      mi.gamin = ajouterAncien({ ...habillerLB({ numero: GAMIN, nom: P.nom || ADOS[M.lbPerso - 81].nom, initiales: "" }, M.lbPerso), pnj: true, arme: true, armeEau: true, x: q.x, z: q.z });
      mi.vrai = { ...moi.info }; mi.joue = true; mi.etape = 3; moi.g.position.copy(mp.g.position); moi.cible = null; moi.chemin = []; envoyerWS({ t: "aller", x: moi.g.position.x, z: moi.g.position.z });
      retirerAncien(MICH); moi.info.armeEau = false; moi.info.arme = false; habiller(moi, 94, "Michael");
      for (const c of comps) { c.p.cible = null; }   /* (Sam et les autres restent en retrait) */
      vies = 100; morsures = 0; majHud(); phase = "michael"; v.p.info.brasHaut = true; v.etat = "recul"; v.pv = v.pvMax = 8; majBarre(v); v.tEtat = performance.now() + 1500;
      voileN.style.opacity = "0"; bandeauCombat(); setTimeout(() => M && M.L === L && bulle("🗡️ Tu es Michael : touche David (ou la gâchette) pour lui lancer des pieux. Attention à ses charges !", 4500), 2200); }, 450); };
  // un pieu lancé : il file de la main de Michael jusqu'au cœur de David
  const lancerPieu = (v) => { const p = moiP(), moi = M.gens.get(M.moiNum); if (!p || !moi) return; const now = performance.now();
    const de = V3(p.x, 1.25, p.z), a = v.g.position.clone().add(V3(0, 1.2, 0)), dir = a.clone().sub(de).normalize(); moi.tirT = now; vueTir(moi, dir.x, dir.z);
    const pk = modelePieu(.75); pk.quaternion.setFromUnitVectors(V3(0, -1, 0), dir); pk.position.copy(de); scene.add(pk); try { sonBruit(.25, 1800, .3); } catch (e) {}
    const t0 = now, D = Math.max(160, de.distanceTo(a) * 32); const vol = setInterval(() => { const u = Math.min(1, (performance.now() - t0) / D); if (!M || M.L !== L) { clearInterval(vol); scene.remove(pk); return; }
      pk.position.lerpVectors(de, a, u); pk.position.y += Math.sin(u * Math.PI) * .25; if (u < 1) return; clearInterval(vol); scene.remove(pk);
      if (!["sol", "charge", "recul"].includes(v.etat)) return; if (v.g.position.distanceTo(V3(a.x, 0, a.z)) > 2.2) return;   /* (il a esquivé) */
      v.pv--; majBarre(v); for (let i = 0; i < 14; i++) { const an = Math.random() * 6.28; eclat(sangT2, a, V3(Math.cos(an) * 1.5, 1.5 + Math.random() * 2, Math.sin(an) * 1.5), 900, performance.now(), .12, { g: 9, grandit: 0, sol: true }); }
      try { sonBruit(.5, 500, .5); } catch (e) {} if (Math.random() < .6) parle(v.p.info.numero, hasardDe(REPL_V[84].touche), true);
      if (v.pv <= 0) finDavid(v); else { v.etat = "recul"; v.tEtat = performance.now() + 900; } }, 16); };
  // une charge de David : Michael perd des forces
  const chargeMichael = (v) => { if (fini) return; vies -= 20; majHud(); try { sonBruit(.7, 300, .6); } catch (e) {} voile("background:radial-gradient(circle,rgba(160,0,0,0) 30%,rgba(160,0,0,.8) 100%);transition:opacity .8s", 800);
    const p = moiP(); if (p) { const dx = p.x - v.g.position.x, dz = p.z - v.g.position.z, d = Math.hypot(dx, dz) || 1, nx = p.x + dx / d * 1.6, nz = p.z + dz / d * 1.6; if (!L.limites || L.limites(nx, nz)) { p.x = nx; p.z = nz; } }
    if (Math.random() < .5) parle(M.moiNum, hasardDe(["Argh !", "C'est tout ce que tu as, David ?", "Je ne lâcherai pas !"]), true);
    if (vies <= 0 && !fini) { fini = true; phase = "fin"; voile("background:rgba(120,0,0,.55)", 2500); message(`<div style="font-size:22px">Michael est à terre…</div><div style="margin-top:8px">David a gagné. Santa Carla est à lui.</div>`, ["Rejouer", demarrer]); } };
  // 4. David vaincu : le pieu dans le cœur, il redevient un homme… puis il explose
  const finDavid = (v) => { mi.etape = 4; v.etat = "debout"; v.g.rotation.z = 0; v.g.position.y = 0; v.p.vol = 0; v.p.info.brasHaut = false; if (v.barre) v.barre.sp.visible = false;   /* (il reste debout, le pieu dans le cœur) */
    const P0 = v.g.position.clone(), t0 = performance.now(), mp0 = moiP() || V3(P0.x + 3, 0, P0.z); let humain = false, boum = false, fait = false;
    let dx = mp0.x - P0.x, dz = mp0.z - P0.z; { const l2 = Math.hypot(dx, dz) || 1; dx /= l2; dz /= l2; } const H = tailleBonhomme() * hauteurDe(v.p);
    const st = modelePieu(.42); st.quaternion.setFromUnitVectors(V3(0, -1, 0), V3(-dx, 0, -dz)); st.position.set(P0.x + dx * .04, H * .6, P0.z + dz * .04); scene.add(st);   /* (un pieu à sa taille, au cœur) */   /* (planté dans la poitrine, le manche vers Michael) */
    const vu = choisirVue(P0, H, dx, dz, 2.4, .7, [v.g], .75), [cx, cz] = tourner(dx, dz, vu.r); const dire2 = t => { bulle(`<b style="color:#ff5a4a">${esc(nomDe(v.p.info.numero))}</b> : ${esc(t)}`, 2600); if (M.bulleEl) { M.bulleEl.style.top = "auto"; M.bulleEl.style.bottom = "13%"; } };
    const C = { maj: now => { const u = (now - t0) / 1000, k = Math.min(1, u / 3), dd = vu.dd * (1 - k * .3); M.camera.position.set(P0.x + cx * dd - cz * .7, H * (.8 - k * .08), P0.z + cz * dd + cx * .7); M.camera.lookAt(P0.x, H * .7, P0.z);
        if (u > .4 && !C.d1) { C.d1 = true; dire2("Michael… Tu aurais pu vivre pour toujours… avec nous…"); }
        if (u > 3.2 && !humain) { humain = true; habiller(v.p, 84); voile("background:rgba(255,255,255,.5);transition:opacity .9s", 300); }   /* (il redevient humain, un instant) */
        if (u > 3.8 && !C.d2) { C.d2 = true; dire2("…Dis à Star… que je suis désolé."); }
        if (u > 6.6 && !boum) { boum = true; scene.remove(st); v.etat = "terre"; pieu(v, true); }
        if (u > 10.5 && !fait) { fait = true; finCine(); } }, fov: [42, 56] };
    M.cine = C; M.passerBtn = boutonPasser(() => { if (!boum) { boum = true; scene.remove(st); if (!humain) habiller(v.p, 84); v.etat = "terre"; pieu(v, true); } fait = true; finCine(); }); };
  // 5. les ados et Michael : le soleil se lève, Sam s'inquiète… mais Michael redevient lui-même : c'est terminé
  const epilogueMichael = () => { if (!M || M.L !== L || mi.etape >= 5) return; mi.etape = 5; if (L.aube && !L.aube.t0) L.aube.t0 = performance.now(); musiqueLB(null);
    const { S, F, A } = lesAdos(), Sv = S === M.moiNum ? GAMIN : S, moi = M.gens.get(M.moiNum);
    dialogue([[Sv, "Michael ! Tu l'as eu ! Tu l'as vraiment eu !"], [F === M.moiNum ? GAMIN : F, "Il a explosé comme les autres… C'est fini. C'est vraiment fini."], [M.moiNum, "Il ne fera plus jamais de mal à personne."],
      [A === M.moiNum ? GAMIN : A, "Regardez le ciel… Il devient orange."], [Sv, "Le soleil se lève, Michael ! Il faut que tu partes, vite ! Tu vas brûler !"]], () => {
      if (!M || M.L !== L || !moi) return; habiller(moi, 93, "Michael"); voile("background:rgba(255,230,180,.6);transition:opacity 1.2s", 500); try { sonBruit(.8, 900, .3); } catch (e) {}
      setTimeout(() => { if (!M || M.L !== L) return; dialogue([[M.moiNum, "Non, Sam… Regarde-moi. C'est terminé. Je suis redevenu moi."], [Sv, "Michael… T'es redevenu normal !"], [M.moiNum, "Grâce à toi, petit frère. Grâce à vous trois."]], () => {
        // (dans un fondu : on redevient son ado ; Michael reste avec nous)
        const vn = voile("background:#000;opacity:0;transition:opacity .5s", 1500); requestAnimationFrame(() => { vn.style.opacity = "1"; });
        setTimeout(() => { if (!M || M.L !== L) return; const pm = moi.g.position.clone(); finMichael(true); ajouterAncien({ ...habillerLB({ numero: MICH, nom: "Michael", initiales: "" }, 93), pnj: true, x: pm.x, z: pm.z }); vn.style.opacity = "0"; finale(); }, 600); }); }, 900); }); };
  // (rendre son ado au joueur, retirer Michael et le double)
  const finMichael = (garder) => { if (!mi) return; const moi = M && M.gens.get(M.moiNum);
    if (mi.joue && moi) { const g0 = M.gens.get(GAMIN); if (g0) moi.g.position.copy(g0.g.position); Object.assign(moi.info, mi.vrai); dessinerCorps(moi); }
    retirerAncien(GAMIN); retirerAncien(MICH); mi = garder ? { etape: 9 } : null; };
  // le vrai feu : des nappes de flammes vivantes (le même feu que dans les bidons), qui jaillissent puis retombent ; elles font toujours face à la caméra
  const feuReelM = (seed) => new THREE.ShaderMaterial({ uniforms: { uT: { value: 0 }, uS: { value: seed }, uA: { value: 1 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: `uniform float uT; uniform float uS; uniform float uA; varying vec2 vUv;
      float h(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float n(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }
      float fbm(vec2 p) { float v = 0.0, a = .5; for (int i = 0; i < 5; i++) { v += a * n(p); p *= 2.03; a *= .5; } return v; }
      void main() { vec2 uv = vUv; float t = uT * 1.6 + uS * 10.0; float x = uv.x - .5; x += (fbm(vec2(uv.y * 3.0 - t * .6, uS)) - .5) * .26 * uv.y;
        float d = fbm(vec2(x * 3.5, uv.y * 2.4 - t * 1.8)), forme = 1.0 - smoothstep(0.0, .44 * (1.0 - uv.y * .75) + .02, abs(x)),
          f = forme * smoothstep(1.0, .12, uv.y + (d - .5) * .75) * smoothstep(0.0, .06, uv.y), i = clamp(f * (.7 + d * .9), 0.0, 1.0);
        vec3 c = mix(vec3(.45, .05, 0.0), vec3(1.0, .42, .05), smoothstep(.15, .55, i)); c = mix(c, vec3(1.0, .86, .45), smoothstep(.55, .85, i)); c = mix(c, vec3(1.0, .98, .9), smoothstep(.85, 1.0, i));
        gl_FragColor = vec4(c * i * 1.5 * uA, i * uA); }` });
  const feuReel = (pos, duree = 4200) => { const t0 = performance.now(), nappes = [];
    for (let i = 0; i < 9; i++) { const m = feuReelM(Math.random() * 10), w = .7 + Math.random() * .8, h = 1.4 + Math.random() * 1.4, pl = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); pl.geometry.translate(0, h / 2, 0);
      pl.position.set(pos.x + (Math.random() - .5) * 1.1, Math.max(0, pos.y - .3), pos.z + (Math.random() - .5) * 1.1); pl.renderOrder = 5; scene.add(pl); nappes.push({ pl, m, d0: Math.random() * 300, k: .8 + Math.random() * .5 }); }
    const it = setInterval(() => { const now = performance.now(), u = (now - t0) / duree; if (u >= 1 || !M || M.L !== L) { clearInterval(it); for (const q of nappes) { scene.remove(q.pl); q.pl.geometry.dispose(); q.m.dispose(); } return; }
      for (const q of nappes) { const v2 = Math.max(0, (now - t0 - q.d0) / duree); q.m.uniforms.uT.value = (now - t0) / 1000; q.m.uniforms.uA.value = Math.min(1, v2 * 8) * (1 - Math.pow(u, 2.2));
        const sc = q.k * (u < .12 ? .4 + u / .12 * .9 : 1.3 - u * .55); q.pl.scale.set(sc, sc, sc); q.pl.quaternion.copy(M.camera.quaternion); } }, 16); };
  // le vrai sang : des flaques qui restent au sol, là où il est mort (des éclaboussures sombres, luisantes)
  const texFlaque = () => tex(toile(256, 256, (x) => { const r0 = 60 + Math.random() * 30; x.fillStyle = "rgba(70,0,4,.92)";
      x.beginPath(); for (let a = 0; a <= 6.3; a += .25) { const r = r0 * (.75 + Math.random() * .5); x.lineTo(128 + Math.cos(a) * r, 128 + Math.sin(a) * r); } x.fill();
      for (let k = 0; k < 26; k++) { const a = Math.random() * 6.28, d = r0 + Math.random() * 60, rr = 3 + Math.random() * 11; x.fillStyle = `rgba(${80 + Math.random() * 40},0,6,.9)`; x.beginPath(); x.arc(128 + Math.cos(a) * d, 128 + Math.sin(a) * d, rr, 0, 7); x.fill(); }
      const g = x.createRadialGradient(110, 110, 4, 128, 128, r0); g.addColorStop(0, "rgba(255,90,90,.35)"); g.addColorStop(1, "rgba(0,0,0,0)"); x.fillStyle = g; x.fillRect(0, 0, 256, 256); }));
  const flaqueSang = (x0, z0, taille = 1.6) => { for (let k = 0; k < 3; k++) { const s2 = taille * (k ? .45 + Math.random() * .35 : 1), m = new THREE.MeshStandardMaterial({ map: texFlaque(), transparent: true, depthWrite: false, roughness: .15, metalness: .1, polygonOffset: true, polygonOffsetFactor: -3 });
      const f = new THREE.Mesh(new THREE.PlaneGeometry(s2, s2), m); f.rotation.set(-Math.PI / 2, 0, Math.random() * 6.28); const a = Math.random() * 6.28, d = k ? .6 + Math.random() * .9 : 0;
      f.position.set(x0 + Math.cos(a) * d, (L.hauteur ? L.hauteur(x0, z0, {}) : 0) + .015 + k * .002, z0 + Math.sin(a) * d); f.renderOrder = 1; scene.add(f); } };
  const pieu = (v, debout = false) => { if (v.etat !== "terre") return; if (v.k === 0 && !mi) { releveDavid(v); return; }   /* (David : on s'approche avec le pieu… et il se relève) */ ado.pieuVers = null; v.etat = "brule"; const now = performance.now(); v.tEtat = now + 4600; parle(v.p.info.numero, REPL_V[84 + v.k].mort, true); setTimeout(() => parle(M.moiNum, hasardDe(REPL[M.lbPerso].pieu)), 2600);
    const p = v.g.position.clone(), c = p.clone().add(V3(0, debout ? tailleBonhomme() * hauteurDe(v.p) * .6 : .45, 0));
    // le pieu, enfoncé d'un coup dans la poitrine (debout, il y est déjà)
    const st = modelePieu(.55); st.position.copy(c).add(V3(0, .5, 0)); st.visible = !debout; scene.add(st);
    const t0 = now; const enf = setInterval(() => { const u = Math.min(1, (performance.now() - t0) / 160); st.position.y = c.y + .5 - u * .65; if (u >= 1) clearInterval(enf); }, 16); setTimeout(() => scene.remove(st), 900);
    try { sonBruit(.18, 260, .9); } catch (e) {}
    // 1. le sang qui gicle : un jet vers le haut, qui retombe et tache le sol
    for (let i = 0; i < 70; i++) { const a = Math.random() * 6.28, h = 3 + Math.random() * 4, r = .6 + Math.random() * 2.4; eclat(sangT2, c, V3(Math.cos(a) * r, h, Math.sin(a) * r), 2600 + Math.random() * 1200, t0 + 120 + Math.random() * 200, .16 + Math.random() * .22, { g: 11, grandit: 0, sol: true }); }
    voile("background:radial-gradient(circle,rgba(140,0,0,0) 40%,rgba(140,0,0,.5) 100%);transition:opacity .6s", 500);
    // 2. l'explosion : l'éclair, la boule de feu, la fumée noire
    setTimeout(() => { if (!M || M.L !== L) return; try { sonBruit(1.6, 420, .95); } catch (e) {} const t1 = performance.now();
      const lum = lumBoom; lum.intensity = 120; const fin2 = t1 + 4200; lum.position.copy(c).add(V3(0, .8, 0));
      const fl = setInterval(() => { const u = (performance.now() - t1) / 4200; if (u >= 1 || !M) { lum.intensity = 0; clearInterval(fl); return; } lum.intensity = (u < .08 ? 120 : 32 * (1 - u)) * (.75 + Math.random() * .5); }, 50);   // (la lueur vacille avec le feu)
      voile("background:rgba(255,200,120,.55);transition:opacity .4s", 160);
      for (let i = 0; i < 40; i++) { const a = Math.random() * 6.28, e = Math.random() * 1.4, sp = 2 + Math.random() * 5; eclat(feuT, c, V3(Math.cos(a) * Math.cos(e) * sp, Math.sin(e) * sp + 1, Math.sin(a) * Math.cos(e) * sp), 700 + Math.random() * 500, t1 + Math.random() * 80, .8 + Math.random() * .9, { add: true, grandit: 2.2 }); }
      for (let i = 0; i < 22; i++) { const a = Math.random() * 6.28; eclat(fumeeN, c.clone().add(V3(0, .5, 0)), V3(Math.cos(a) * 1.2, 2 + Math.random() * 2, Math.sin(a) * 1.2), 2400 + Math.random() * 1200, t1 + 200 + Math.random() * 400, 1.2 + Math.random(), { grandit: 2.5 }); }
      for (let i = 0; i < 30; i++) { const a = Math.random() * 6.28, r = 2 + Math.random() * 6; eclat(feuT, c, V3(Math.cos(a) * r, 3 + Math.random() * 5, Math.sin(a) * r), 900 + Math.random() * 600, t1, .09, { add: true, g: 9, grandit: 0 }); }   // (les braises)
      // 3. le feu : de vraies flammes sur ce qui reste de lui ; et le sang qui reste au sol
      feuReel(p.clone().add(V3(0, .1, 0)), 4600); flaqueSang(p.x, p.z, 1.8);
      if (false) for (let i = 0; i < 60; i++) eclat(flammeT, p.clone().add(V3((Math.random() - .5) * 1.4, .4 + Math.random() * .3, (Math.random() - .5) * 1.4)), V3((Math.random() - .5) * .4, 1.2 + Math.random() * 1.2, (Math.random() - .5) * .4), 1000 + Math.random() * 600, t1 + 250 + i * 55, 1 + Math.random() * .8, { add: true, flamme: true, grandit: .5 });
      for (let i = 0; i < 16; i++) eclat(fumeeN, p.clone().add(V3((Math.random() - .5), 1.6, (Math.random() - .5))), V3((Math.random() - .5) * .6, 1.6, (Math.random() - .5) * .6), 2600, t1 + 800 + i * 180, 1.2, { grandit: 2 }); }, 650); };   // (le feu brûle trois ou quatre secondes, sa fumée monte)
  const mordu = (v) => { if (fini) return; vies -= 20; morsures++; majHud(); if (morsures >= 2 && !biere && vies > 0) poserBiere(); parle(M.moiNum, REPL[M.lbPerso].mordu); try { sonBruit(.5, 500, .7); } catch (e) {} voile("background:radial-gradient(circle,rgba(160,0,0,0) 30%,rgba(160,0,0,.85) 100%);transition:opacity .9s", 900);
    if (vies <= 0 && !fini) { fini = true; phase = "fin"; voile("background:rgba(120,0,0,.55)", 2500); message(mi && mi.joue ? `<div style="font-size:22px">Michael est à terre…</div><div style="margin-top:8px">David a gagné. Santa Carla est à lui.</div>` : `<div style="font-size:22px">Tu as été mordu…</div><div style="margin-top:8px">Tu deviens l'un d'eux. Bienvenue dans la bande !</div>`, ["Rejouer", demarrer]); } };
  // ================= les trois ados : on joue Sam, Edgar ou Alan Frog ; dans la main, le pistolet à eau bénite =================
  const ADOS = [{ nom: "Sam Emerson", court: "Sam", dit: "Ma mère ne m'a pas élevé pour finir en casse-croûte !" }, { nom: "Edgar Frog", court: "Edgar", dit: "Vérité, justice, et l'american way. Vampires, c'est fini." }, { nom: "Alan Frog", court: "Alan", dit: "Remplis les pistolets d'eau bénite, on y va !" }];
  // le pistolet à eau : le corps en plastique transparent, l'eau bénite dedans, la croix sur le réservoir, la buse orange
  const pistoletEau = () => { const g = new THREE.Group(), M_ = o => new THREE.MeshStandardMaterial(o), ad = (geo, m, x, y, z, rx = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.x = rx; g.add(o); return o; };
    const plast = M_({ color: 0x3aa8ff, transparent: true, opacity: .72, roughness: .15, metalness: .1, emissive: 0x0a3050, emissiveIntensity: .8 }), orange = M_({ color: 0xff7a1a, roughness: .4, emissive: 0x401800 }), eau = M_({ color: 0xc8eeff, transparent: true, opacity: .55, emissive: 0x4a8aaa, emissiveIntensity: .7 });
    ad(new THREE.BoxGeometry(.045, .055, .17), plast, 0, .02, -.06); ad(new THREE.BoxGeometry(.04, .1, .045), plast, 0, -.045, .01, -.3); ad(new THREE.BoxGeometry(.034, .035, .14), eau, 0, .02, -.06);
    ad(new THREE.CylinderGeometry(.03, .03, .1, 14), plast, 0, .075, -.06, Math.PI / 2); ad(new THREE.CylinderGeometry(.025, .025, .09, 14), eau, 0, .072, -.06, Math.PI / 2);
    ad(new THREE.BoxGeometry(.003, .028, .006), M_({ color: 0xffd23a, emissive: 0x806010 }), .031, .075, -.06); ad(new THREE.BoxGeometry(.003, .006, .02), M_({ color: 0xffd23a, emissive: 0x806010 }), .031, .08, -.06);   // (la croix)
    ad(new THREE.CylinderGeometry(.009, .012, .05, 10), orange, 0, .025, -.165, Math.PI / 2); ad(new THREE.BoxGeometry(.01, .03, .012), orange, 0, -.02, -.035); ad(new THREE.BoxGeometry(.012, .02, .02), orange, 0, .08, -.01);
    return g; };
  const ado = { k: null, pist: pistoletEau(), kick: 0, kt: performance.now(), vise: null }; ado.pist.visible = false; scene.add(ado.pist);
  const buse = (but) => { if (ado.pist.visible) return ado.pist.localToWorld(V3(0, .025, -.2)); const p = moiP(); if (!p) return M.camera.position.clone(); const d = V3(but.x - p.x, 0, but.z - p.z).normalize(); return V3(p.x + d.x * .55, p.y + 1.15, p.z + d.z * .55); };   // (la main de l'ado)
  const majAdo = () => { const moi = M.gens.get(M.moiNum); if (ado.k == null || !moi || (mi && mi.joue)) { ado.pist.visible = false; return; }
    const cam = M.camera, now = performance.now(), dk = Math.min(.1, (now - ado.kt) / 1000); ado.kt = now; ado.kick = Math.max(0, ado.kick - dk * 6);
    ado.pist.visible = !!M.premiere && !M.cine; ado.pist.scale.setScalar(.55); cam.updateMatrixWorld(); const f = cam.getWorldDirection(V3(0, 0, 0)), r = V3(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    if (M.premiere) { const u = V3(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 1);
      ado.pist.position.copy(cam.position).addScaledVector(f, .36 - ado.kick * .03).addScaledVector(r, .15).addScaledVector(u, -.12 + ado.kick * .01); ado.pist.quaternion.copy(cam.quaternion); ado.pist.rotateY(.08); ado.pist.rotateX(ado.kick * .3); return; }
    ado.pist.visible = false; };   // (en vue normale : le bonhomme lève le bras, le pistolet dessiné dans sa main)
  // ---------- les dialogues : chacun parle (une bulle au-dessus de sa tête) ----------
  const hasardDe = a => a[Math.floor(Math.random() * a.length)];
  let parleLibre = 0;
  const parle = (num, texte, force) => { const now = performance.now(); if (!M || M.L !== L || !texte || !M.gens.has(num) || M.cine || (!force && now < parleLibre)) return;
    if (!force && (M.gens.get(num).cible || (M.gens.get(M.moiNum) || {}).cible)) return;   /* (personne ne parle en marchant) */ parleLibre = now + 1800 + texte.length * 45; dire(num, texte); };
  const nomDe = (num) => { if (num === M.moiNum && mi && mi.joue) return "Michael"; if (num === M.moiNum) { const P = (M.ctx.pnjTrio && M.ctx.pnjTrio(M.lbPerso)) || {}; return P.nom || ADOS[M.lbPerso - 81].nom; } const q = M.gens.get(num); return (q && q.info.nom) || ""; };
  /* la caméra des cinématiques cherche une vue dégagée : rien (décor, personnage) entre elle et celui qu'elle filme ; sinon elle tourne autour de lui, ou s'approche */
  const rcLB = new THREE.Raycaster();
  const vueLibre = (de, vers, ignore) => { const d = vers.clone().sub(de), L0 = d.length(); if (L0 < .05) return true; rcLB.set(de, d.normalize()); rcLB.far = L0; rcLB.camera = M.camera;
    return !rcLB.intersectObjects(scene.children, true).some(h => { const o = h.object; if (o.isSprite || o.isPoints || o.isLine) return false; for (let a = o; a; a = a.parent) { if (!a.visible) return false; if (ignore && ignore.includes(a)) return false; }
      const m = o.material; if (m && !Array.isArray(m) && ((m.transparent && m.opacity < .4) || m.blending === THREE.AdditiveBlending)) return false; return true; }); };
  const choisirVue = (s0, H, dx, dz, dist, lat, ignore, haut = .82) => { const yeux = V3(s0.x, s0.y + H * .76, s0.z);
    for (const dd of [dist, dist * .75, dist * .55]) for (const r of [0, .3, -.3, .6, -.6, .9, -.9, 1.25, -1.25, 1.6, -1.6, 2.1, -2.1]) { const c = Math.cos(r), sn = Math.sin(r), ex = dx * c - dz * sn, ez = dx * sn + dz * c;
      const pc = V3(s0.x + ex * dd - ez * lat, s0.y + H * haut, s0.z + ez * dd + ex * lat); if (!(!L.limites || L.limites(pc.x, pc.z) || dd < 1.4)) continue;
      /* (trois lignes de vue : le visage, et de part et d'autre — personne ne doit mordre sur lui à l'image) */
      const px = -(pc.z - yeux.z), pz = pc.x - yeux.x, pl = Math.hypot(px, pz) || 1, cote = k => V3(yeux.x + px / pl * k, yeux.y, yeux.z + pz / pl * k);
      if (vueLibre(yeux, pc, ignore) && vueLibre(cote(.45), pc, ignore) && vueLibre(cote(-.45), pc, ignore) && vueLibre(V3(s0.x, s0.y + H * .35, s0.z), pc, ignore)) return { r, dd }; }
    return { r: 0, dd: Math.min(1.3, dist) }; };
  const tourner = (dx, dz, r) => [dx * Math.cos(r) - dz * Math.sin(r), dx * Math.sin(r) + dz * Math.cos(r)];
  /* une scène de dialogue, en cinématique : la caméra cadre celui qui parle (de trois quarts, depuis ceux à qui il parle), son nom et sa phrase en sous-titre, une réplique après l'autre */
  const dialogue = (lignes, fin) => { const cam = M.camera; let i = -1, tFin = 0, fait = false; const qui = [...new Set(lignes.map(l => l[0]).filter(n => n != null))], vamp = qui.find(n => n <= -860 && n >= -869);
    const grp = qui.map(n => M.gens.get(n)).filter(Boolean), ctr = grp.reduce((a, b) => a.add(b.g.position), V3(0, 0, 0)).multiplyScalar(1 / Math.max(1, grp.length)), front = V3(cam.position.x - ctr.x, 0, cam.position.z - ctr.z); if (front.lengthSq() < .01) front.set(0, 0, 1); front.normalize();
    { const vq0 = vamp != null && M.gens.get(vamp), ad = grp.filter(g2 => g2 !== vq0); if (ad.length > 1) { const c2 = ad.reduce((a, b) => a.add(b.g.position), V3(0, 0, 0)).multiplyScalar(1 / ad.length);
        const f = vq0 ? V3(vq0.g.position.x - c2.x, 0, vq0.g.position.z - c2.z) : front.clone(); if (f.lengthSq() < .01) f.copy(front); f.normalize(); const r = V3(-f.z, 0, f.x);
        ad.sort((a, b) => (a.g.position.x - c2.x) * r.x + (a.g.position.z - c2.z) * r.z - ((b.g.position.x - c2.x) * r.x + (b.g.position.z - c2.z) * r.z));
        ad.forEach((q, i) => { const k2 = (i - (ad.length - 1) / 2) * 1.5, x = c2.x + r.x * k2, z = c2.z + r.z * k2; if (!L.limites || L.limites(x, z)) { q.g.position.x = x; q.g.position.z = z; } q.cible = null; q.chemin = []; }); } }   // (les ados côte à côte, face à celui à qui ils parlent : personne ne cache personne)
    const finir = () => { if (fait) return; fait = true; if (M && M.cine === S) { bulle(null); finCine(); } fin && fin(); };
    const S = { maj: now => { if (!M || M.L !== L) return finir();
        if (now > tFin) { do { i++; } while (i < lignes.length && !M.gens.has(lignes[i][0])); if (i >= lignes.length) return finir();
          const [n, t] = lignes[i], d = 1400 + t.length * 60; tFin = now + d; bulle(`<b style="color:#ff5a4a">${esc(nomDe(n))}</b> : ${esc(t)}`, d + 300); if (M.bulleEl) { M.bulleEl.style.top = "auto"; M.bulleEl.style.bottom = "13%"; } }
        const n0 = lignes[i][0], q = M.gens.get(n0); if (!q) return; const s0 = q.g.position, vq = vamp != null && M.gens.get(vamp), ados = grp.filter(g2 => g2 !== vq);
        const o = !vq ? s0.clone().add(front) : n0 === vamp ? ados.reduce((a, b) => a.add(b.g.position), V3(0, 0, 0)).multiplyScalar(1 / Math.max(1, ados.length)) : vq.g.position;   // (sans vampire : face au groupe ; avec lui : on filme chacun depuis l'autre camp)
        let dx = o.x - s0.x, dz = o.z - s0.z, l = Math.hypot(dx, dz); if (l < .3) { dx = 0; dz = 1; l = 1; } dx /= l; dz /= l;
        const H = tailleBonhomme() * hauteurDe(q); if (S.vn !== i) { S.vn = i; S.vue = choisirVue(s0, H, dx, dz, 3, 1.1, [q.g]); }   /* (une vue dégagée, choisie à chaque réplique) */
        { const [ex, ez] = tourner(dx, dz, S.vue.r); dx = ex; dz = ez; } const dd0 = S.vue.dd, tgt = V3(s0.x + dx * dd0 - dz * 1.1, s0.y + H * .82, s0.z + dz * dd0 + dx * 1.1);
        const dt2 = Math.min(.25, (now - (S.tp || now)) / 1000); S.tp = now; if (!S.pret || S.n !== i) { if (!S.pret) cam.position.copy(tgt); S.pret = true; S.n = i; S.k = now; }
        cam.position.lerp(tgt, now - S.k < 900 ? 1 - Math.exp(-5 * dt2) : 1 - Math.exp(-8 * dt2)); cam.position.x += Math.sin(now / 900) * .015; cam.position.y += Math.sin(now / 1300) * .012; cam.lookAt(s0.x, s0.y + H * .74, s0.z); }, fov: [42, 58] };   // (la caméra respire, tenue à la main)   // (la caméra glisse d'un personnage à l'autre, en temps réel)
    M.passerBtn = boutonPasser(finir); M.cine = S; };
  const REPL = {
    81: { intro: "Ces types de la jetée… ce sont des vampires. Je le sais, j'ai vu mon frère flotter devant ma fenêtre !", go: "Ma mère ne m'a pas élevé pour finir en casse-croûte !",
      tir: ["Ça marche ! Ça marche vraiment !", "Prends ça, sale vampire !", "Retourne dans ta crypte !"], pieu: ["Beurk… c'est dégoûtant !", "Un de moins !"], mordu: "Aïe ! Il m'a mordu !",
      encourage: ["Attention, derrière toi !", "Il revient ! Il pique sur nous !", "Vise-le quand il descend !"], fete: "On a réussi ! Santa Carla est à nous !" },
    82: { intro: "Edgar Frog. Mon frère et moi, on chasse les vampires. Ça fait des années qu'on les traque, ici.", go: "Vérité, justice, et l'American way. Vampires : c'est fini.",
      tir: ["Mange de l'eau bénite, sale suceur de sang !", "Crève, enfoiré !", "Bouffe ça, ordure !"], pieu: ["Un pieu en plein cœur, sale vermine. Le seul moyen.", "Retourne en enfer, enfoiré !"], mordu: "Il m'a eu… mais pas pour longtemps !",
      encourage: ["Le pieu, vite, avant que cette ordure se relève !", "Ces saloperies sont là-haut ! Regarde en l'air !", "Ne tourne jamais le dos à ces enfoirés !"], fete: "Les Frog Brothers ont encore frappé." },
    83: { intro: "On a l'eau bénite et les pieux. Il faut juste qu'ils viennent assez près.", go: "Remplis les pistolets d'eau bénite. On y va !",
      tir: ["Dans ta gueule, suceur de sang !", "Ça fume, regarde-moi cette ordure !", "Et vlan, enfoiré !"], pieu: ["Crame, saloperie !", "Il est cuit, le parasite !"], mordu: "Ouille ! Ça pique !",
      encourage: ["Encore un effort !", "Ils tournent autour de nous… prêts ?", "L'eau bénite, ça les ralentit !"], fete: "Génial ! On est des chasseurs de vampires !" } };
  const REPL_V = { 84: { arrive: "Tu ne vieilliras jamais. Tu ne mourras jamais… Mais il faudra te nourrir.", touche: ["Aaargh !", "Tu vas le regretter, gamin !"], mort: "Nooon !" },
    85: { arrive: "Hé ! On fait la fête ce soir ! Wouhou !", touche: ["Ça brûle ! Ça brûle !", "Aïe, aïe, aïe !"], mort: "Aaaah !" },
    86: { arrive: "Ha ha ha ! De la chair fraîche !", touche: ["Hé ! C'est pas drôle !", "Mes yeux !"], mort: "Noooon !" },
    87: { arrive: "Grrr…", touche: ["Grrraaah !"], mort: "Aaargh !" } };
  // les deux autres ados, à nos côtés : ils nous suivent, nous encouragent, arrosent les vampires
  const comps = [];
  const presentation = () => { const p0 = moiP() || V3(0, 0, 1.5), moi = M.lbPerso; comps.length = 0; phase = "briefing";
    [81, 82, 83].filter(id => id !== moi).forEach((id, i) => { const P = (M.ctx.pnjTrio && M.ctx.pnjTrio(id)) || {}, num = -(850 + i);
      const p = ajouterAncien({ ...habillerLB({ numero: num, nom: P.nom || ADOS[id - 81].nom, initiales: "" }, id), pnj: true, arme: true, armeEau: true, x: p0.x + (i ? 1.6 : -1.6), z: p0.z - .8 }); if (p) comps.push({ id, num, p, i, tirT: 0, parleT: 0 }); });
    const c = comps, n0 = c[0] && c[0].num, n1 = c[1] && c[1].num;
    setTimeout(() => { if (M && M.L === L) dialogue([[n0, REPL[c[0] ? c[0].id : 82].intro], [n1, REPL[c[1] ? c[1].id : 83].intro], [M.moiNum, REPL[moi].go],
      [n0, "Tout ce monde au concert, sur la plage… C'est un vrai buffet pour eux."], [n1, "Faut faire vite : buter ces enfoirés avant la fin du concert. Sinon, ça va être un vrai bain de sang !"],
      [M.moiNum, "Alors on y va. Maintenant."], [n0, "Ils sont là, quelque part… Ils vont venir à nous. Un par un."]], () => { if (M && M.L === L && phase === "briefing") demarrer(); }); }, 900); };
  const SANG = [[-12, -3.8, 1.3], [8.5, -10, 1], [24, -13.5, 1.2], [-3, -31, 1.1], [30.5, -33.5, .9], [-31, 2.5, 1.2], [16.5, 3.8, 1], [37, -1.5, 1.1], [-7, 13.5, 1.3], [12, 22.5, 1]];
  const texSang = (k) => tex(toile(256, 256, (x) => { const R = (n) => hasard(k * 13.7 + n);
      for (let i = 0; i < 5; i++) { const cx = 128 + (R(i) - .5) * 70, cy = 128 + (R(i + 9) - .5) * 70, r = 30 + R(i + 3) * 34, g = x.createRadialGradient(cx, cy, 2, cx, cy, r);   // (la flaque, en plusieurs nappes)
        g.addColorStop(0, "rgba(70,0,4,.95)"); g.addColorStop(.6, "rgba(110,6,10,.9)"); g.addColorStop(.92, "rgba(140,10,14,.75)"); g.addColorStop(1, "rgba(140,10,14,0)"); x.fillStyle = g; x.beginPath();
        for (let a = 0; a < 6.3; a += .3) { const rr = r * (.75 + R(i * 7 + a) * .3); x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } x.fill(); }
      for (let i = 0; i < 46; i++) { const a = R(i + 40) * 6.28, d = 70 + R(i + 90) * 50, rr = 1.5 + R(i + 140) * 5; x.fillStyle = `rgba(${100 + R(i) * 40 | 0},4,8,${.7 + R(i + 3) * .3})`; x.beginPath(); x.ellipse(128 + Math.cos(a) * d, 128 + Math.sin(a) * d, rr * 1.6, rr, a, 0, 7); x.fill(); }   // (les éclaboussures)
      x.strokeStyle = "rgba(90,0,6,.85)"; x.lineCap = "round"; for (let i = 0; i < 4; i++) { const a = R(i + 200) * 6.28; x.lineWidth = 3 + R(i + 210) * 4; x.beginPath(); x.moveTo(128 + Math.cos(a) * 40, 128 + Math.sin(a) * 40); x.lineTo(128 + Math.cos(a) * (100 + R(i) * 25), 128 + Math.sin(a) * (100 + R(i) * 25)); x.stroke(); }   // (les traînées)
      x.fillStyle = "rgba(255,200,200,.18)"; x.beginPath(); x.ellipse(112, 112, 16, 7, -.6, 0, 7); x.fill(); }));   // (le reflet, c'est encore frais)
  const sang = SANG.map(([x, z, t], k) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(2.6 * t, 2.6 * t), new THREE.MeshStandardMaterial({ map: texSang(k), transparent: true, depthWrite: false, roughness: .15, metalness: .2, polygonOffset: true, polygonOffsetFactor: -4 }));
    m.rotation.set(-Math.PI / 2, 0, hasard(k) * 6.28); m.position.set(x, .035, z); scene.add(m);
    for (let i = 0; i < 7; i++) { const g2 = new THREE.Mesh(new THREE.CircleGeometry(.05 + hasard(k * 3 + i) * .06, 8), new THREE.MeshBasicMaterial({ color: 0x6a0408, transparent: true, opacity: .9, depthWrite: false })); g2.rotation.x = -Math.PI / 2; const a = hasard(k + 30) * 6.28; g2.position.set(x + Math.cos(a) * (1.6 + i * .55), .036, z + Math.sin(a) * (1.6 + i * .55)); scene.add(g2); }   // (les gouttes qui s'éloignent)
    return { x, z, vu: false }; });
  const REPL_SANG = ["Du sang… Ils ont déjà commencé.", "C'est encore frais. Ils ne sont pas loin…", "Ils ont déjà attaqué quelqu'un ici. On n'a plus beaucoup de temps.", "Regarde ça… Avant la fin du concert, il y en aura partout.", "Ces enfoirés se servent déjà. Faut les buter, vite !"];
  let sangT = 0;
  const voirSang = (now, p) => { if (!comps.length || now < sangT) return; for (const q of sang) if (!q.vu && Math.hypot(p.x - q.x, p.z - q.z) < 3) { q.vu = true; sangT = now + 6000; const c = hasardDe(comps); parle(c.num, hasardDe(REPL_SANG)); break; } };
  // le pieu : le bouton apparaît dès qu'un vampire est à terre ; on y court, on le plante en arrivant ; une flèche rouge au-dessus de lui
  let btnPieu = null, fleche = null;
  const courirPieu = (q) => { const p = moiP(); if (!p) return; const d = Math.hypot(q.g.position.x - p.x, q.g.position.z - p.z); if (d <= 2.6) { pieu(q); return; }
    ado.pieuVers = q; const ux = (p.x - q.g.position.x) / d, uz = (p.z - q.g.position.z) / d; allerVers(q.g.position.x + ux * 1.3, q.g.position.z + uz * 1.3, true); };
  const pieuAuto = (now, p) => { const v = vamps.find(q => q.etat === "terre"); if (!btnPieu) { btnPieu = document.createElement("button"); btnPieu.type = "button"; btnPieu.textContent = "🗡️ Planter le pieu";
      btnPieu.style.cssText = "position:absolute;left:50%;bottom:64px;transform:translateX(-50%);z-index:8;border:2px solid #fff;border-radius:99px;padding:12px 22px;background:#b81c22;color:#fff;font:800 17px system-ui;box-shadow:0 0 18px rgba(255,40,40,.8);cursor:pointer;display:none";
      for (const ev of ["pointerdown", "pointerup"]) btnPieu.addEventListener(ev, e => e.stopPropagation()); btnPieu.onclick = e => { e.stopPropagation(); const q = vamps.find(x => x.etat === "terre"); if (q) courirPieu(q); };
      M.ctx.conteneur.appendChild(btnPieu); const garde = setInterval(() => { if (!M || M.L !== L) { btnPieu.remove(); clearInterval(garde); } }, 600);
      fleche = modelePieu(.9, .07); scene.add(fleche); L.flechePieu = fleche; }   /* (au-dessus du vampire à terre : le pieu lui-même, qui flotte et tourne doucement, la pointe vers lui) */
    btnPieu.style.display = v && !M.cine ? "" : "none"; fleche.visible = !!v; if (v) { fleche.position.set(v.g.position.x, .95 + Math.abs(Math.sin(now / 260)) * .25, v.g.position.z); fleche.rotation.y = now / 700; }
    const c = ado.pieuVers; if (c && c.etat === "terre" && Math.hypot(c.g.position.x - p.x, c.g.position.z - p.z) < 2.7) pieu(c); };
  const vieComps = (now, p) => { for (const q of [M.gens.get(M.moiNum), ...comps.map(c => c.p)]) if (q && q.cible && q.bulle) { q.g.remove(q.bulle); q.bulle = null; }   /* (on se tait en marchant) */ for (const c of comps) { const g = c.p.g, ox = c.i ? 1.8 : -1.8, d = Math.hypot(g.position.x - p.x - ox, g.position.z - p.z - 1);
      if (d > 3.2 && !c.p.cible && phase !== "michael") c.p.cible = V3(p.x + ox, 0, p.z + 1);   // (ils nous suivent ; pendant le duel de Michael, ils restent en retrait)
      if (phase === "vague1" || phase === "david") { const vis = vamps.filter(v => v.etat === "tourne" || v.etat === "pique" || v.etat === "remonte");
        if (now > c.tirT && vis.length) { c.tirT = now + 2600 + Math.random() * 3000; const v = hasardDe(vis), dx = v.g.position.x - g.position.x, dz = v.g.position.z - g.position.z, l2 = Math.hypot(dx, dz) || 1;
          if (l2 < 16) { c.p.tirT = now; vueTir(c.p, dx / l2, dz / l2); const de = V3(g.position.x + dx / l2 * .5, 1.15, g.position.z + dz / l2 * .5), but = v.g.position.clone().add(V3(0, 1.3, 0));
            for (let k = 0; k < 8; k++) { const gt = new THREE.Mesh(new THREE.SphereGeometry(.045, 6, 4), new THREE.MeshBasicMaterial({ color: 0xbfe6ff, transparent: true, opacity: .8 })); scene.add(gt); parts.push({ sp: gt, de: de.clone(), a: but.clone(), t0: now + k * 20, d: 300, goutte: true }); } } }
        if (now > c.parleT) { c.parleT = now + 9000 + Math.random() * 9000; if (Math.random() < .55) parle(c.num, hasardDe(REPL[c.id].encourage)); } } } };
  const choisirAdo = () => { const d = document.createElement("div"); { const gd = setInterval(() => { if (!d.isConnected || !M || M.L !== L) { d.remove(); clearInterval(gd); } }, 600); }   /* (on quitte Santa Carla avant de choisir : le choix ne nous suit pas) */ d.style.cssText = "position:absolute;inset:0;z-index:9;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:radial-gradient(circle,rgba(40,6,10,.82),rgba(0,0,0,.94));color:#fff;font:600 16px Georgia,serif;padding:12px;box-sizing:border-box";
    d.innerHTML = `<div style="font:900 clamp(20px,5vw,30px) Georgia;color:#ff4a3a;text-shadow:0 0 14px #b81c22;letter-spacing:2px">THE LOST BOYS</div><div style="opacity:.85;text-align:center">Qui veux-tu jouer ? Ton arme : le pistolet à eau bénite.</div><div class="c" style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center"></div>`;
    ADOS.forEach((a, k) => { const b = document.createElement("button"); b.style.cssText = "background:linear-gradient(#2a1418,#120a0c);border:2px solid #b81c22;border-radius:12px;color:#fff;padding:8px 8px 10px;cursor:pointer;width:clamp(90px,26vw,150px);font:700 15px Georgia";
      const im = document.createElement("div"); im.style.cssText = "width:100%;aspect-ratio:200/420;display:grid;place-items:center;background:radial-gradient(circle at 50% 40%,#5a4a7a,#1a1424);border-radius:8px;margin-bottom:6px;overflow:hidden"; b.appendChild(im);
      { const info = habillerLB({ numero: 0 }, 81 + k); chargerTete(0, null, info.teteUrl).then(t => { const cv = dessinerBonhomme(info, t); cv.style.cssText = "width:100%;height:100%;object-fit:contain"; im.appendChild(cv); }); }
      b.appendChild(document.createTextNode(a.nom));
      b.onclick = e => { e.stopPropagation(); d.remove(); ado.k = k; M.lbPerso = 81 + k; adosIntro.forEach(q => retirerAncien(q.info.numero)); adosIntro.length = 0; musiqueLB(null); if (CONCERT.son) { CONCERT.son.volume = 0; CONCERT.son.play().catch(() => {}); } if (CONCERT.ecranV) CONCERT.ecranV.play().catch(() => {});   /* (lancé au toucher : le téléphone l'autorise) */   /* (« Cry Little Sister » s'efface ; la musique de la plage, à fond) */ const mo = M.gens.get(M.moiNum); if (mo) { const q = mo.g.position.clone(); ajouterAncien({ ...(mo.info.vrai || mo.info), x: q.x, z: q.z }); } presentation(); }; d.querySelector(".c").appendChild(b); });
    for (const ev of ["pointerdown", "pointerup", "click"]) d.addEventListener(ev, e => e.stopPropagation()); M.ctx.conteneur.appendChild(d); M.manMenu = { d }; };
  const combat = (t) => {
    const now = performance.now(), p = moiP(); if (!p || !M || M.L !== L) return;
    if (!hud) { hud = document.createElement("div"); hud.style.cssText = "position:absolute;left:50%;top:10px;transform:translateX(-50%);z-index:7;background:rgba(10,4,6,.7);color:#fff;border-radius:12px;padding:6px 12px;font:700 16px system-ui;display:flex;gap:14px;pointer-events:none";
      hud.innerHTML = '<span class="v"></span><span class="n"></span>'; M.ctx.conteneur.appendChild(hud); const garde = setInterval(() => { if (!M || M.L !== L) { hud.remove(); clearInterval(garde); } }, 600); }
    { const mo = M.gens.get(M.moiNum); if (mo && ado.k == null) mo.g.visible = false; }   // (tant qu'on n'a pas choisi son ado, on n'est personne)
    majAdo(); vieComps(now, p); pieuAuto(now, p); boireBiere(now, p); voirSang(now, p);
    if (phase === "intro" && !adosIntro.length) [81, 82, 83].forEach((id, i) => { const P = (M.ctx.pnjTrio && M.ctx.pnjTrio(id)) || {}, q = ajouterAncien({ ...habillerLB({ numero: -(880 + i), nom: P.nom || ADOS[i].nom, initiales: "" }, id), pnj: true, arme: true, armeEau: true, x: (i - 1) * 1.7, z: .3 - Math.abs(i - 1) * .5 }); if (q) adosIntro.push(q); });   // (les trois ados, devant l'arche : la caméra du survol arrive sur eux)
    if (phase === "intro" && !M.cine && !M.lbIntro) { if (!choixT) choixT = now + 1800; if (now > choixT) { phase = "choix"; choisirAdo(); } }
    if (courant && courant.etat === "mort" && !fini) { courant = null; if (file.length) { phase = "chasse"; const etape = 3 - file.length; setTimeout(() => { if (!M || M.L !== L || fini) return; const fr = comps.find(c => c.id !== 81), au = comps.find(c => c !== fr), F = fr ? fr.num : M.moiNum, A = au ? au.num : F;
        dialogue((ENTRE[etape] || ENTRE[0]).map(([q, t]) => [q === "M" ? M.moiNum : q === "F" ? F : A, t]), () => { if (M && M.L === L && !fini) setTimeout(prochain, 7000 + Math.random() * 5000); }); }, 2600); } else if (mi) epilogueMichael(); else finale(); }
    // les vampires : ils tournent autour de nous en volant, piquent pour mordre, remontent ; à terre, ils se relèvent si on tarde
    for (const v of vamps) { const g = v.g, dt = 1 / 60;
      // (la fin : David au sol, face à Michael — il tourne autour de lui, charge, recule ; personne ne vole)
      if (v.etat === "sol" || v.etat === "charge" || v.etat === "recul") { const dx = p.x - g.position.x, dz = p.z - g.position.z, d = Math.hypot(dx, dz) || 1, dt2 = Math.min(.05, (now - (v.tp || now)) / 1000); v.tp = now; g.position.y = 0;
        const bouger = (vx, vz) => { const nx = g.position.x + vx, nz = g.position.z + vz; if (!L.limites || L.limites(nx, nz)) { g.position.x = nx; g.position.z = nz; } else if (L.limites(nx, g.position.z)) g.position.x = nx; else if (L.limites(g.position.x, nz)) g.position.z = nz; };
        if (v.etat === "sol") { v.a = (v.a ?? Math.atan2(-dz, -dx)) + dt2 * .7; const cx = p.x + Math.cos(v.a) * 6, cz = p.z + Math.sin(v.a) * 6; bouger((cx - g.position.x) * Math.min(1, dt2 * 2.5), (cz - g.position.z) * Math.min(1, dt2 * 2.5)); if (now > v.tEtat) { v.etat = "charge"; v.tEtat = now + 2600; parle(v.p.info.numero, hasardDe(["Viens là, Michael !", "Tu es à moi !", "Ha ! Trop lent !"]), true); } }
        else if (v.etat === "charge") { bouger(dx / d * 8.5 * dt2, dz / d * 8.5 * dt2); if (d < 1.15) { chargeMichael(v); v.etat = "recul"; v.tEtat = now + 1400; } else if (now > v.tEtat) { v.etat = "recul"; v.tEtat = now + 900; } }
        else { bouger(-dx / d * 5 * dt2, -dz / d * 5 * dt2); if (now > v.tEtat) { v.etat = "sol"; v.a = Math.atan2(-dz, -dx); v.tEtat = now + 1800 + Math.random() * 2200; } }
        v.p.vol = 0; if (v.barre) v.barre.sp.visible = !M.cine; continue; }
      if (v.etat === "approche") { if (!v.pose) { const cam = M.camera.getWorldDirection(V3(0, 0, 0)); cam.y = 0; if (cam.lengthSq() < 1e-4) cam.set(0, 0, -1); cam.normalize(); v.pose = [cam.x, cam.z]; }   // (il fond sur nous du ciel, et se pose à cinq pas, devant nous : face à l'écran)
        const [bx, bz] = pres(p.x + v.pose[0] * 6 - v.pose[1] * 1.3, p.z + v.pose[1] * 6 + v.pose[0] * 1.3, p, 6.5);   // (un peu de côté : on le voit, et nous aussi ; toujours sur le ponton)
        const k2 = 1 - Math.exp(-1.4 * Math.min(.1, (now - (v.tp || now)) / 1000)); v.tp = now;   // (en temps réel : il arrive en trois ou quatre secondes, quel que soit le téléphone)
        g.position.x += (bx - g.position.x) * k2; g.position.z += (bz - g.position.z) * k2; g.position.y += (0 - g.position.y) * k2;
        if (Math.hypot(g.position.x - bx, g.position.z - bz) < .6 && g.position.y < .3) { g.position.y = 0; v.etat = "parle"; dialogueAvant(v); } }
      else if (v.etat === "parle") { g.position.y = 0; }
      else if (v.etat === "tourne") { v.a += dt * .6 * v.vit; const [cx, cz] = pres(p.x + Math.cos(v.a) * Math.min(v.r, 8), p.z + Math.sin(v.a) * Math.min(v.r, 8), p, 8), cy = v.h + Math.sin(now / 500 + v.k) * .5; g.position.x += (cx - g.position.x) * .04; g.position.z += (cz - g.position.z) * .04; g.position.y += (cy - g.position.y) * .04;
        if (now > v.tEtat) { v.etat = "pique"; v.tEtat = now + 3500; } }
      else if (v.etat === "pique") { const dx = p.x - g.position.x, dz = p.z - g.position.z, dy = (p.y + .2) - g.position.y, d = Math.hypot(dx, dz, dy), sp = 7.5 * v.vit * dt;
        g.position.x += dx / d * sp; g.position.z += dz / d * sp; g.position.y += dy / d * sp;
        if (d < 1.1) { mordu(v); v.etat = "remonte"; v.tEtat = now + 1800; } else if (now > v.tEtat) { v.etat = "remonte"; v.tEtat = now + 1500; } }
      else if (v.etat === "remonte") { g.position.y += (7 - g.position.y) * .05; const dx = g.position.x - p.x, dz = g.position.z - p.z, d = Math.hypot(dx, dz) || 1; if (d < 7.5) { const [nx, nz] = pres(g.position.x + dx / d * .08, g.position.z + dz / d * .08, p, 7.5); g.position.x = nx; g.position.z = nz; } else { const [nx, nz] = pres(g.position.x, g.position.z, p, 7.5); g.position.x += (nx - g.position.x) * .05; g.position.z += (nz - g.position.z) * .05; }
        if (now > v.tEtat) { v.etat = "tourne"; v.a = Math.atan2(g.position.z - p.z, g.position.x - p.x); v.tEtat = now + 3000 + Math.random() * 4000; } }
      else if (v.etat === "terre") { const k3 = Math.min(1, g.rotation.z / (Math.PI / 2)); g.position.y += (.44 * k3 - g.position.y) * .14; g.rotation.z = Math.min(Math.PI / 2, g.rotation.z + .05);   /* (il tombe, couché sur le côté, posé sur le sol) */
        if (Math.random() < .03) particule(fumeeT, g.position.clone().add(new THREE.Vector3(0, .4, 0)), 1, .6, 900, .6);
        if (now > v.tEtat) { v.pv = 1; majBarre(v); g.rotation.z = 0; v.etat = "remonte"; v.tEtat = now + 1500; } }
      else if (v.etat === "brule") { const u2 = 1 - (v.tEtat - now) / 4600; g.visible = u2 < .15; if (v.barre) v.barre.sp.visible = false;   /* (il explose : il disparaît dans la boule de feu) */
        if (now > v.tEtat) { v.etat = "mort"; retirerAncien(v.p.info.numero); majHud(); } }
      // le panneau face à nous ; incliné quand il pique ; à terre, couché
      if (v.etat !== "mort") v.p.vol = Math.max(0, g.position.y); if (v.barre) v.barre.sp.visible = !M.cine && ["tourne", "pique", "remonte", "terre"].includes(v.etat); }   // (sa barre de vie : seulement pendant le combat)   // (l'altitude du vol : le moteur la remet à chaque image)
    // les particules (fumée, flammes, gouttes d'eau bénite)
    for (let i = parts.length - 1; i >= 0; i--) { const q = parts[i], u = (now - q.t0) / q.d; if (u < 0) continue;
      if (u >= 1) { scene.remove(q.sp); parts.splice(i, 1); continue; }
      if (q.goutte) q.sp.position.lerpVectors(q.de, q.a, u).add(new THREE.Vector3(0, Math.sin(u * Math.PI) * .25, 0));
      else { q.sp.visible = true; const dt3 = Math.min(.05, (now - (q.tp || now)) / 1000); q.tp = now; if (q.g) q.v.y -= q.g * dt3; q.sp.position.addScaledVector(q.v, q.g || q.flamme || q.grandit !== 1 ? dt3 : 1 / 60);
        if (q.sol && q.sp.position.y < .05) { q.sp.position.y = .05; q.v.set(0, 0, 0); q.g = 0; }   // (la goutte de sang tombe et reste au sol)
        q.sp.material.opacity = q.sol ? Math.min(1, (1 - u) * 3) : q.flamme ? Math.sin(u * Math.PI) : 1 - u; q.sp.scale.setScalar(q.taille * (1 + u * (q.grandit ?? 1)));
        if (q.flamme) { q.sp.scale.y = q.taille * (1.6 + Math.sin(now / 60 + q.t0) * .3) * (1 - u * .5); q.sp.material.rotation = Math.sin(now / 90 + q.t0) * .15; } } } };
  // toucher un vampire : l'eau bénite (ou le pieu, s'il est à terre)
  // à la manette : la gâchette tire ; à la première personne, au centre de l'écran ; sinon, sur le vampire le plus proche, devant soi ; A plante le pieu
  L.tirManette = fp => { if (fp) { const rc = new THREE.Raycaster(); rc.setFromCamera(new THREE.Vector2(0, 0), M.camera); if (L.toucher(rc)) return true; }
    const moi = M.gens.get(M.moiNum); if (!moi) return false; const p = moi.g.position, f = new THREE.Vector3(); M.camera.getWorldDirection(f); f.y = 0; f.normalize(); let best = null, bs = -1e9;
    for (const v of vamps) { if (v.etat === "mort" || v.etat === "brule" || v.etat === "terre") continue; const dx = v.g.position.x - p.x, dz = v.g.position.z - p.z, dd = Math.hypot(dx, dz); if (dd > 16) continue; const sc = (dx * f.x + dz * f.z) / (dd || 1) * 6 - dd; if (sc > bs) { bs = sc; best = v; } }
    if (best) { blesser(best); return true; } return false; };
  L.pieuManette = () => { if (btnPieu && btnPieu.style.display !== "none" && btnPieu.isConnected) { btnPieu.click(); return true; } return false; };
  L.toucher = (ray) => { const vis = vamps.filter(v => v.etat !== "mort" && v.etat !== "brule"); const h = ray.intersectObjects(vis.map(v => v.g), true)[0]; if (!h) {
      { let best = null, bd = .02; for (const v of vis) { const q = v.g.position.clone().add(new THREE.Vector3(0, 1.2, 0)), dir = q.sub(ray.ray.origin).normalize(), d = 1 - dir.dot(ray.ray.direction); if (d < bd) { bd = d; best = v; } } if (best) { blesser(best); return true; } }   // (un peu à côté : on vise le plus proche du doigt)
      return false; }
    const v = vis.find(v => { for (let q = h.object; q; q = q.parent) if (q === v.g) return true; return false; }); if (!v) return false; blesser(v, h.point); return true; };
}

({ construireSantaCarla });
