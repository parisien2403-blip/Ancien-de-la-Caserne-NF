/* (10.145) Notre-Dame de Paris et les quais de Seine, à l'ancienne (d'après les images du quartier) :
   rive gauche, le grand quai pavé, les kiosques des bouquinistes, les cafés à stores rouges, l'escalier qui descend au bas-port, la bouche de métro ;
   la Seine, les bateaux-mouches, les vedettes, la péniche ; le pont de pierre à arches et demi-lunes, qui mène au parvis ;
   l'île de la Cité : la chaussée du quai et l'abribus, le parvis entouré d'immeubles, la cathédrale — la façade face au pont ; la nef, les arcs-boutants, la flèche, le chevet, le square derrière.
   Chargé par la matrice (eval direct) la première fois qu'on y va. */
function construireNotreDame(A, L, scene) {
  const ECH = PETIT ? .5 : (MOBILE || GPU_MODESTE) ? .7 : 1, PEU = PETIT || MOBILE || GPU_MODESTE;
  let graine = 77; const al = () => (graine = (graine * 16807) % 2147483647) / 2147483647;
  const tT = (w, h, f, rx, ry) => { const c = document.createElement("canvas"); c.width = Math.max(8, Math.round(w * ECH)); c.height = Math.max(8, Math.round(h * ECH)); const x = c.getContext("2d"); x.scale(c.width / w, c.height / h); f(x, w, h);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; if (rx) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry || 1); } return t; };
  const mat = (o) => new THREE.MeshStandardMaterial({ roughness: .85, ...o });
  const add = (geo, m, x, y, z, ry = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.y = ry; o.receiveShadow = true; scene.add(o); return o; };
  const box = (w, h, d, m, x, y, z, ry = 0) => { const g = new THREE.BoxGeometry(w, h, d); if (typeof PIERRES !== "undefined" && PIERRES.has(m)) uvMonde(g, w, h, d); return add(g, m, x, y, z, ry); };
  const cyl = (rt, rb, h, m, x, y, z, seg = 10) => add(new THREE.CylinderGeometry(rt, rb, h, seg), m, x, y, z);
  const sol = (x0, x1, z0, z1, m, y) => { const s = add(new THREE.PlaneGeometry(x1 - x0, z1 - z0), m, (x0 + x1) / 2, y, (z0 + z1) / 2); s.rotation.x = -Math.PI / 2; return s; };
  L.nuitObjets = L.nuitObjets || []; L.silhouettes = L.silhouettes || []; const NUIT = [];
  const serif = "Georgia, 'Times New Roman', serif";
  // les repères : la Seine (z de -18 à 18, à -6,4 m), le bas-port (à -5,4 m), le quai haut (à 0)
  const YE = -6.4, YB = -5.4, XS = 150;   /* (10.145 : les quais plus hauts au-dessus de l'eau, les bateaux-mouches passent sous le pont) */

  /* ---------- les matières ---------- */
  const pierreT = (base, joint, rx, ry, bloc = [64, 32]) => tT(256, 256, (c, w, h) => { c.fillStyle = base; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += bloc[1]) for (let x = (y / bloc[1] % 2) * bloc[0] / 2 - bloc[0]; x < w; x += bloc[0]) { c.fillStyle = `rgba(${al() < .5 ? "90,80,60" : "255,250,235"},${al() * .1})`; c.fillRect(x + 1, y + 1, bloc[0] - 2, bloc[1] - 2); c.fillStyle = joint; c.fillRect(x, y, bloc[0], 1.5); c.fillRect(x, y, 1.5, bloc[1]); }
    for (let i = 0; i < 300; i++) { c.fillStyle = `rgba(60,50,40,${al() * .08})`; c.fillRect(al() * w, al() * h, 2 + al() * 8, 2 + al() * 8); } }, rx, ry);
  const paveT = (base, rx, ry) => tT(256, 256, (c, w, h) => { c.fillStyle = "#4a4640"; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 16) for (let x = (y / 16 % 2) * 10; x < w; x += 20) { const k = al(); c.fillStyle = `rgb(${base[0] + k * 30 - 15},${base[1] + k * 30 - 15},${base[2] + k * 26 - 13})`; c.beginPath(); c.roundRect(x + 1.5, y + 1.5, 17, 13, 3); c.fill(); } }, rx, ry);
  const quaiM = mat({ map: pierreT("#c8bca2", "rgba(90,80,60,.5)", 1, 1, [64, 32]) });   /* (10.145 : la pierre à l'échelle — des blocs d'environ 1,2 m × 0,6 m, sur chaque face) */
  const murM = mat({ map: pierreT("#b8ac92", "rgba(80,70,50,.55)", 1, 1, [64, 32]) });
  const PIERRES = new Set([quaiM, murM]), TUILE = 4.8;
  const uvMonde = (g, w, h, d) => { const uv = g.attributes.uv, dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]]; for (let f = 0; f < 6; f++) for (let v = 0; v < 4; v++) { const i = f * 4 + v; uv.setXY(i, uv.getX(i) * dims[f][0] / TUILE, uv.getY(i) * dims[f][1] / TUILE); } uv.needsUpdate = true; return g; };
  const paveM = mat({ map: paveT([120, 116, 108], 40, 3), roughness: .95 });
  const paveB = mat({ map: paveT([108, 104, 96], 60, 2), roughness: .95 });
  const trottM = mat({ map: tT(128, 128, (c, w, h) => { c.fillStyle = "#a8a296"; c.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { c.fillStyle = ["#9a948a", "#b6b0a4", "#8e887e"][i % 3]; c.fillRect(al() * w, al() * h, 2, 2); } }, 60, 3), roughness: .95 });
  const routeM = mat({ map: tT(128, 128, (c, w, h) => { c.fillStyle = "#4a4a4c"; c.fillRect(0, 0, w, h); for (let i = 0; i < 1200; i++) { c.fillStyle = ["#3e3e40", "#58585a", "#444446"][i % 3]; c.fillRect(al() * w, al() * h, 2, 2); } }, 80, 4), roughness: .95 });
  const parvisM = mat({ map: tT(256, 256, (c, w, h) => { c.fillStyle = "#cfc6b2"; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 32) for (let x = 0; x < w; x += 64) { c.fillStyle = `rgba(${al() < .5 ? "120,110,90" : "255,250,240"},${al() * .12})`; c.fillRect(x + 1, y + 1, 62, 30); c.fillStyle = "rgba(100,90,70,.35)"; c.fillRect(x, y, 64, 1); c.fillRect(x, y, 1, 32); } }, 30, 30), roughness: .9 });

  /* ---------- la Seine : l'eau verte et mouvante, les reflets ---------- */
  const eauT = tT(256, 256, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#3e5a52"); g.addColorStop(1, "#2e4a46"); c.fillStyle = g; c.fillRect(0, 0, w, h); for (let i = 0; i < 260; i++) { c.strokeStyle = `rgba(${al() < .5 ? "190,215,205" : "20,40,36"},${.08 + al() * .14})`; c.lineWidth = 1 + al() * 1.5; c.beginPath(); const x = al() * w, y = al() * h; c.moveTo(x, y); c.quadraticCurveTo(x + 12, y - 3, x + 26 + al() * 20, y); c.stroke(); } }, 30, 8);
  /* (10.147) l'eau de la Seine : une surface vivante — des vaguelettes croisées qui bougent, le reflet du ciel qui grandit vers l'horizon (Fresnel), la profondeur verte sous les pieds,
     les éclats du soleil (de la lune, le soir), un clapotis d'écume le long des murs des quais */
  const EAU = { u: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { t: { value: 0 }, profond: { value: new THREE.Color(0x24403a) }, clair: { value: new THREE.Color(0x587a62) }, ciel: { value: new THREE.Color(0xa8c0c0) }, soleil: { value: new THREE.Vector3(-.45, .75, .35).normalize() }, eclat: { value: 1 } }]) };
  const eauM = new THREE.ShaderMaterial({ uniforms: EAU.u, fog: true,
    vertexShader: `varying vec3 vW; #include <fog_pars_vertex>
      void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vec4 mvPosition = viewMatrix * w; gl_Position = projectionMatrix * mvPosition; #include <fog_vertex> }`.replace(/#include <(\w+)>/g, "\n#include <$1>\n"),
    fragmentShader: `uniform float t; uniform vec3 profond, clair, ciel, soleil; uniform float eclat; varying vec3 vW; #include <fog_pars_fragment>
      float h(vec2 p) { float s = 0.0; s += sin(dot(p, vec2(.31, .07)) * 1.0 + t * 1.3) * .5; s += sin(dot(p, vec2(-.13, .41)) * 1.3 + t * 1.7) * .35; s += sin(dot(p, vec2(.53, -.29)) * 2.1 + t * 2.3) * .2; s += sin(dot(p, vec2(.9, .6)) * 3.7 - t * 2.9) * .1; s += sin(dot(p, vec2(-1.7, 1.1)) * 5.3 + t * 3.7) * .05; return s; }
      void main() { vec2 p = vW.xz + vec2(t * .9, 0.0); float e = .08; float dx = (h(p + vec2(e, 0.)) - h(p - vec2(e, 0.))) / (2. * e), dz = (h(p + vec2(0., e)) - h(p - vec2(0., e))) / (2. * e);
        vec3 n = normalize(vec3(-dx * .22, 1.0, -dz * .22)); vec3 v = normalize(cameraPosition - vW); float fr = .04 + .62 * pow(1.0 - max(dot(n, v), 0.0), 4.0);
        float pr = clamp(length(cameraPosition.xz - vW.xz) / 60.0, 0.0, 1.0); vec3 base = mix(clair, profond, pr * .7 + .3 * (.5 + .5 * h(p * .4)));
        float bord = smoothstep(16.6, 17.95, abs(vW.z)); float ecume = bord * (.35 + .35 * sin(vW.x * 1.7 + t * 2.0) * sin(vW.x * .6 - t * 1.3));
        vec3 r = reflect(-v, n); float sp = pow(max(dot(r, soleil), 0.0), 180.0) * 2.2 * eclat + pow(max(dot(r, soleil), 0.0), 18.0) * .12 * eclat;
        vec3 c = mix(base, ciel * .92, fr) + vec3(1.0, .96, .86) * sp + vec3(.85, .9, .88) * ecume * .5;
        gl_FragColor = vec4(c, 1.0); #include <fog_fragment> }`.replace(/#include <(\w+)>/g, "\n#include <$1>\n") });
  const eau = sol(-XS, XS, -18, 18, eauM, YE); eau.userData.anime = true; L.eau = eau;

  /* ---------- (d'après les images : le quartier exact) rive gauche, le grand quai pavé, ses kiosques de bouquinistes, l'escalier qui descend au bas-port ;
     le pont de pierre à arches, ses demi-lunes et ses réverbères, qui mène tout droit au parvis ; la façade de Notre-Dame face au pont ---------- */
  const PP = [-10, 8], horsPont = (x, m = 2) => !(x > PP[0] - m && x < PP[1] + m);
  const ESC = [-52, -36], RAMPE_C = [30, 46];   const MX = -70, MZ = 41.9, HX0 = MX - 2.75, HX1 = MX + 2.5, HZ0 = 40.05, HZ1 = 43.75;   /* (10.160 : au milieu du trottoir, plus dans le mur) */   // (10.148 : la trémie du métro, contre les immeubles)
   const ESCE = 2.6;   // (l'entrée de l'escalier, en haut, à l'est)   // (le grand escalier de la rive gauche ; la rampe de l'île)
  const OBS = [], VEND = [], AMB = [], LAMPES = [];
  const contourne = (p, tx, tz, v = .05) => { const dx = p.x + 57, dz = p.z + 54, d = Math.hypot(dx, dz) || 1; if (d >= 4.3) return; let ux = -dz / d, uz = dx / d; if (tx != null && ux * (tx - p.x) + uz * (tz - p.z) < 0) { ux = -ux; uz = -uz; } p.x += ux * v * 1.5; p.z += uz * v * 1.5; const d2 = Math.hypot(p.x + 57, p.z + 54) || 1; if (d2 < 4.15) { p.x = -57 + (p.x + 57) / d2 * 4.15; p.z = -54 + (p.z + 54) / d2 * 4.15; } };   /* (10.157 : on longe la fontaine pour en faire le tour, au lieu de rester bloqué devant) */   // (10.153 : personne ne traverse la fontaine — on en fait le tour)   // (ce qu'on ne traverse pas : les kiosques, les tables, les troncs…)
  const lig = mat({ color: 0xe2dccc, roughness: .9 });
  for (const s of [1, -1]) {
    sol(-XS, XS, s > 0 ? 18 : -22.5, s > 0 ? 22.5 : -18, paveB, YB);
    box(XS * 2, YB - YE + .2, .6, murM, 0, (YB + YE) / 2, s * 18);   // (le bord du bas-port, dans l'eau)
    const tr = s > 0 ? ESC : RAMPE_C;   /* (le mur, creusé pour l'escalier) */
    for (const [a, b] of [[-XS, tr[0]], [tr[1], XS]]) box(b - a, -YB, 2.8, murM, (a + b) / 2, YB / 2, s * 23.9);   // le mur de quai, épais
    const pa = s > 0 ? [ESC[1] - ESCE, ESC[1]] : [RAMPE_C[1] - 4, RAMPE_C[1]];
    { let seg = [[-XS, XS]]; for (const [o0, o1] of [pa, PP]) seg = seg.flatMap(([a, b]) => o1 <= a || o0 >= b ? [[a, b]] : [[a, o0], [o1, b]].filter(([u, v]) => v - u > .1));
      for (const [a, b] of seg) { box(b - a, 1, .55, quaiM, (a + b) / 2, .5, s * 25.3); box(b - a, .12, .8, quaiM, (a + b) / 2, 1.06, s * 25.3); } }   // le parapet et sa tablette
  }
  // (10.154) l'escalier de pierre de l'île : il descend le long du mur du quai, de l'ouverture du parapet jusqu'au bas-port ; un garde-corps de pierre côté eau
  const paveDS = paveB.clone(); paveDS.side = THREE.DoubleSide;
  { const [r0, r1] = RAMPE_C, Lg = r1 - r0, N = 26, D = Lg / N; box(Lg, -YB, .4, murM, (r0 + r1) / 2, YB / 2, -25.1);
    for (let i = 0; i < N; i++) { const top = YB * (i + 1) / N, x = r1 - (i + .5) * D; box(D + .02, top - YB + .02, 2.6, quaiM, x, (top + YB) / 2, -23.8); box(.06, .04, 2.6, lig, r1 - i * D - .03, top + .01, -23.8); }
    { const x0 = r0, x1 = r1 - 3, cx = (x0 + x1) / 2, ang = Math.atan(-YB / Lg), lr = (x1 - x0) / Math.cos(ang), yc = YB * (r1 - cx) / Lg; const rb = box(lr, 1, .4, quaiM, cx, yc + .5, -22.7); rb.rotation.z = -ang; const r2 = box(lr, .1, .55, quaiM, cx, yc + 1.04, -22.7); r2.rotation.z = -ang; } }
  // (10.146) le grand escalier de pierre de la rive gauche : il descend le long du mur du quai, parallèle à la Seine ; on y entre depuis le trottoir, par une ouverture du parapet ; un garde-corps côté eau
  { const [e0, e1] = ESC, Lg = e1 - e0, N = 26, D = Lg / N;
    for (let i = 0; i < N; i++) { const top = YB * (i + 1) / N, x = e1 - (i + .5) * D; box(D + .02, top - YB + .02, 2.6, quaiM, x, (top + YB) / 2, 23.8); box(.06, .04, 2.6, lig, e1 - i * D - .03, top + .01, 23.8); }
    box(Lg, -YB, .4, murM, (e0 + e1) / 2, YB / 2, 25.1);
    { const x0 = e0 + 3, x1 = e1, cx = (x0 + x1) / 2, ang = Math.atan(-YB / Lg), lr = (x1 - x0) / Math.cos(ang), r = box(lr, 1, .4, quaiM, cx, YB * (e1 - cx) / Lg + .5, 22.7); r.rotation.z = ang; const r2 = box(lr, .1, .55, quaiM, cx, YB * (e1 - cx) / Lg + 1.04, 22.7); r2.rotation.z = ang; }
    box(.4, 1 - YB, .5, quaiM, e1 + .2, (1 + YB) / 2, 22.7); }
  // les sols : le grand quai pavé (rive gauche), la rue du Petit-Pont, le quai de l'île et sa chaussée, le parvis
  sol(-XS, XS, 25.6, 31, paveM, .02); sol(-XS, XS, 31, HZ0, paveM, .02); sol(-XS, HX0, HZ0, 46, paveM, .02); sol(HX1, XS, HZ0, 46, paveM, .02); sol(HX0, HX1, HZ1, 46, paveM, .02); sol(-XS, XS, 46, 140, paveM, .01);
  sol(PP[0], PP[1], 25.6, 130, routeM, .03); for (const sx of [PP[0], PP[1]]) box(.25, .14, 104, quaiM, sx, .07, 78);
  sol(-XS, XS, -31, -25.6, trottM, .02); sol(-XS, XS, -30.5, -27.6, routeM, .03); box(XS * 2, .14, .25, quaiM, 0, .07, -30.5);   /* (10.148 : la chaussée de l'île, à sens unique ; le trottoir des bouquinistes le long du parapet) */
  { const pm = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), lig); void pm; }
  { const fond = mat({ color: 0x3a3630, roughness: 1 }); sol(-330, 330, 25.0, HZ0, fond, -.35); sol(-330, HX0, HZ0, 46, fond, -.35); sol(HX1, 330, HZ0, 46, fond, -.35); sol(HX0, HX1, HZ1, 46, fond, -.35); sol(-330, 330, 46, 300, fond, -.35); sol(-330, 330, -300, -25.0, fond, -.35); sol(-330, 330, 22.4, 25.4, fond, YB - .3); sol(-330, 330, -25.4, -22.4, fond, YB - .3); }   // (un fond sous les quais : aucune fente ne laisse voir le ciel)
  sol(-XS, XS, -232, -31, paveM, .01); sol(-36, 34, -215, -31, parvisM, .015);
  /* (les trottoirs, surélevés, et leurs bordures de granit : le long du parapet, sous les boîtes des bouquinistes ; le long des immeubles, sous les terrasses et les devantures ;
     dans la rue du Petit-Pont ; devant les immeubles de l'île et ceux qui bordent le parvis) */
  const TROT = .15, TR = [], bordM = mat({ color: 0x9a968e, roughness: .8 });
  const trottoir = (x0, x1, z0, z1, bords) => { TR.push([x0, x1, z0, z1]); sol(x0, x1, z0, z1, trottM, TROT); for (const b of bords) { const lz = b === "z0" || b === "z1", c = { x0, x1, z0, z1 }[b]; box(lz ? x1 - x0 : .3, TROT + .03, lz ? .3 : z1 - z0, bordM, lz ? (x0 + x1) / 2 : c + (b === "x0" ? .15 : -.15), (TROT + .03) / 2, lz ? c + (b === "z0" ? .15 : -.15) : (z0 + z1) / 2); } };
  trottoir(-XS, PP[0], 25.6, 30.0, ["z1", "x1"]); trottoir(PP[1], XS, 25.6, 30.0, ["z1", "x0"]);
  trottoir(-XS, PP[0], -27.6, -25.6, ["z0", "x1"]); trottoir(PP[1], XS, -27.6, -25.6, ["z0", "x0"]); trottoir(-XS, HX0, 38.4, 46, ["z0"]); trottoir(HX0, HX1, 38.4, HZ0, ["z0"]); trottoir(HX0, HX1, HZ1, 46, []); trottoir(HX1, PP[0] - 4, 38.4, 46, ["z0"]); trottoir(PP[0] - 4, PP[0], 38.4, 130, ["x1", "z0"]); trottoir(PP[1], PP[1] + 4, 38.4, 130, ["x0", "z0"]); trottoir(PP[1] + 4, XS, 38.4, 46, ["z0"]);
  trottoir(-XS, -35, -32.2, -30.5, ["z1", "x1"]); trottoir(33, XS, -32.2, -30.5, ["z1", "x0"]); trottoir(-36.2, -33, -131, -44, ["x1", "z0", "z1"]); trottoir(31, 34.2, -131, -44, ["x0", "z0", "z1"]);
  // sur le parvis, le tracé des anciennes rues, en pierre claire
  for (const [a, b, c, d] of [[-44, -22, -64, -40], [-14, 12, -60, -44], [20, 30, -64, -38], [-30, -24, -150, -100]]) { box(b - a, .015, .22, lig, (a + b) / 2, .03, c); box(b - a, .015, .22, lig, (a + b) / 2, .03, d); box(.22, .015, d - c, lig, a, .03, (c + d) / 2); box(.22, .015, d - c, lig, b, .03, (c + d) / 2); }

  /* ---------- les platanes, les réverbères, les bancs ---------- */
  const fonteR = mat({ color: 0x23302a, metalness: .5, roughness: .5 });
  /* (10.152) des platanes plus vrais : l'écorce qui pèle en plaques (beige, vert-de-gris, crème), les grosses branches qui partent en fourche, le feuillage en grappes de feuilles découpées, plus clair au soleil, plus sombre dessous */
  const tronc = mat({ map: tT(128, 256, (c, w, h) => { c.fillStyle = "#a89a80"; c.fillRect(0, 0, w, h); for (let i = 0; i < 90; i++) { c.fillStyle = ["#c8bc9c", "#8a8a6a", "#e2dac0", "#7a7058", "#b0a888"][(al() * 5) | 0]; c.beginPath(); c.ellipse(al() * w, al() * h, 6 + al() * 18, 8 + al() * 26, al() * 3, 0, 7); c.fill(); } }, 1, 2), roughness: .9 });
  const dessFeuilles = (c, w, h, cols, n) => { c.clearRect(0, 0, w, h); for (let i = 0; i < n; i++) { const an = al() * Math.PI * 2, r = Math.sqrt(al()) * w * .46, x = w / 2 + Math.cos(an) * r, y = h / 2 + Math.sin(an) * r * .85, s = 7 + al() * 6; c.save(); c.translate(x, y); c.rotate(al() * 6.3); c.fillStyle = cols[(al() * cols.length) | 0];
      c.beginPath(); c.moveTo(0, -s); for (let k = 1; k <= 5; k++) { const a2 = -Math.PI / 2 + k / 5 * Math.PI * 2, r2 = k % 2 ? s * .55 : s; c.lineTo(Math.cos(a2) * r2, Math.sin(a2) * r2); } c.closePath(); c.fill(); c.restore(); } };
  const feuilM = [["#4a7a2a", "#5a8a34", "#6a9a3a", "#3e6a24"], ["#3a6424", "#4a7430", "#2e5420", "#567e32"], ["#6a9a3e", "#7aa848", "#5a8a34", "#8ab454"]].map(cols => new THREE.MeshStandardMaterial({ map: tT(256, 256, (c, w, h) => dessFeuilles(c, w, h, cols, 900)), alphaTest: .5, side: THREE.DoubleSide, roughness: .9 }));
  const brancheM = tronc;
  const platane = (x, z, k = 1) => { cyl(.2 * k, .34 * k, 5.2 * k, tronc, x, 2.6 * k, z, 10); cyl(.3 * k, .45 * k, .5 * k, tronc, x, .25 * k, z, 10);
    const tete = []; for (let b = 0; b < 4; b++) { const an = b / 4 * Math.PI * 2 + al(), l = (2.6 + al() * 1.2) * k, inc = .55 + al() * .25, br = add(new THREE.CylinderGeometry(.07 * k, .16 * k, l, 7), brancheM, x + Math.cos(an) * Math.sin(inc) * l / 2, 5.1 * k + Math.cos(inc) * l / 2, z + Math.sin(an) * Math.sin(inc) * l / 2); br.rotation.set(Math.sin(an) * inc, 0, -Math.cos(an) * inc); tete.push([x + Math.cos(an) * Math.sin(inc) * l, 5.1 * k + Math.cos(inc) * l, z + Math.sin(an) * Math.sin(inc) * l]); }
    const cx = x, cy = 8.2 * k, R0 = 2.8 * k; for (let i = 0; i < 16; i++) { const t = i / 16, ph = Math.acos(1 - 1.6 * t), th = i * 2.4, px = cx + Math.sin(ph) * Math.cos(th) * R0, pz = z + Math.sin(ph) * Math.sin(th) * R0, py = cy + Math.cos(ph) * R0 * .75, s = (2.3 + al() * .8) * k, m = feuilM[py > cy + .6 * k ? 2 : py < cy - .5 * k ? 1 : 0];
      for (const r of [0, Math.PI / 3, -Math.PI / 3]) { const q = add(new THREE.PlaneGeometry(s, s), m, px, py, pz, th + r); q.rotation.x = (al() - .5) * .6; } } OBS.push([x - .45, x + .45, z - .45, z + .45]); };
  const reverbere = (x, z, y = 0) => { cyl(.06, .11, 4.2, fonteR, x, y + 2.1, z, 8); cyl(.13, .13, .5, fonteR, x, y + .25, z, 8); const lan = new THREE.Mesh(new THREE.CylinderGeometry(.2, .12, .5, 6), new THREE.MeshStandardMaterial({ color: 0xf2e6c4, emissive: 0xffd590, emissiveIntensity: .05 })); lan.position.set(x, y + 4.5, z); scene.add(lan); NUIT.push([lan.material, .05, 1.2]);
    cyl(.22, .05, .18, fonteR, x, y + 4.82, z, 6); LAMPES.push([x, y + 4.3, z]);   /* (10.156 : plus une lumière par réverbère — un petit lot de lumières suit le joueur) */ OBS.push([x - .2, x + .2, z - .2, z + .2]); };
  const banc = (x, z, ry, y = 0, assis = true) => { const v = mat({ color: 0x2e5a3a }), T = new THREE.Matrix4().makeRotationY(ry).setPosition(x, y, z), P = (w, h, d, m, px, py, pz) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(px, py, pz); o.applyMatrix4(T); scene.add(o); };
    for (let l = 0; l < 3; l++) P(1.8, .04, .1, v, 0, .45, -.12 + l * .13); P(1.8, .3, .04, v, 0, .7, -.22); for (const sx of [-.75, .75]) P(.06, .45, .45, fonteR, sx, .22, -.03);
    if (assis) (L.tabourets = L.tabourets || []).push([x + Math.cos(ry) * -.45, z - Math.sin(ry) * -.45, ry, .46], [x + Math.cos(ry) * .45, z - Math.sin(ry) * .45, ry, .46]); };
  L.nbTabouretsSalle = 0;

  /* ---------- (d'après les photos) les boîtes des bouquinistes, posées sur le parapet : la caisse vert wagon, le couvercle levé peint en dedans (rouge ou vert pâle),
     l'auvent et ses tringles de fer, les livres debout dans la caisse, la tablette dépliée et ses livres à plat, les gravures sous pochette, le présentoir de magnets,
     un chevalet sur le pavé ; et les boîtes fermées, cadenassées, taguées ---------- */
  { const vert = mat({ color: 0x2c5a40, roughness: .55, metalness: .25 }), vertF = mat({ color: 0x1f4630, roughness: .6, metalness: .25 }), fer = mat({ color: 0x161616, metalness: .6, roughness: .4 }), bois = mat({ color: 0x8a6a42, roughness: .8 });
    const dedans = [mat({ color: 0xb8402c, roughness: .7 }), mat({ color: 0x8ea890, roughness: .7 }), mat({ color: 0xd8d2c0, roughness: .7 })];
    const affT = [0, 1, 2, 3].map(k => tT(128, 96, (c, w, h) => { c.fillStyle = ["#f2ead2", "#e8dcc0", "#efe6d0", "#e4d8bc"][k]; c.fillRect(0, 0, w, h); for (let i = 0; i < 6; i++) { const x = 6 + (i % 3) * 40, y = 6 + Math.floor(i / 3) * 44; c.fillStyle = ["#c83a2a", "#2a5a9a", "#d8a020", "#3a3a3a", "#6a8a4a", "#8a3a6a"][(i + k) % 6]; c.fillRect(x, y, 34, 38); c.fillStyle = "rgba(255,255,255,.6)"; c.fillRect(x + 4, y + 4, 26, 10); c.fillStyle = "#1a1a1a"; c.font = "bold 7px Georgia"; c.fillText(["PARIS", "1900", "SEINE", "MOULIN", "ROMAN", "AFFICHE"][(i + k * 2) % 6], x + 5, y + 12); } }));
    const gravT = [0, 1, 2].map(k => tT(64, 84, (c, w, h) => { c.fillStyle = "#efe6cc"; c.fillRect(0, 0, w, h); c.strokeStyle = "#3a3024"; c.lineWidth = 2; c.strokeRect(5, 5, w - 10, h - 10); c.strokeStyle = "#5a4a34"; c.lineWidth = 1; if (k === 0) { c.beginPath(); c.moveTo(12, 64); c.lineTo(24, 26); c.lineTo(32, 44); c.lineTo(44, 20); c.lineTo(54, 64); c.stroke(); } else if (k === 1) { c.strokeRect(18, 30, 28, 34); c.beginPath(); c.moveTo(14, 30); c.lineTo(32, 14); c.lineTo(50, 30); c.stroke(); } else { c.beginPath(); c.arc(32, 36, 14, 0, 7); c.stroke(); c.fillStyle = "#6a5a40"; c.fillRect(14, 60, 36, 3); }
      c.fillStyle = "rgba(255,255,255,.18)"; c.fillRect(0, 0, w, h * .3); }));
    const affM = affT.map(t => mat({ map: t, roughness: .5 })), gravM = gravT.map(t => mat({ map: t, roughness: .4 }));
    const magT = tT(64, 112, (c, w, h) => { c.fillStyle = "#e8e4dc"; c.fillRect(0, 0, w, h); for (let y = 4; y < h - 8; y += 12) for (let x = 4; x < w - 8; x += 12) { c.fillStyle = ["#e04a2a", "#2a6ad8", "#f2c020", "#2aa84a", "#d82a8a", "#1a1a1a", "#f2f2f2"][((x * 3 + y * 7) / 4 | 0) % 7]; c.fillRect(x, y, 10, 10); c.fillStyle = "rgba(255,255,255,.4)"; c.fillRect(x + 1, y + 1, 4, 3); } }), magM = mat({ map: magT, roughness: .5 });
    const tagT = tT(128, 48, (c, w, h) => { c.clearRect(0, 0, w, h); c.lineWidth = 4; c.lineCap = "round"; for (const [col, x0] of [["#e8e8e8", 10], ["#c8d8f0", 60]]) { c.strokeStyle = col; c.beginPath(); c.moveTo(x0, 34); for (let i = 0; i < 6; i++) c.quadraticCurveTo(x0 + i * 7 + 4, 6 + (i % 2) * 30, x0 + i * 7 + 8, 24); c.stroke(); } }), tagM = new THREE.MeshStandardMaterial({ map: tagT, transparent: true, alphaTest: .3, roughness: .6 });
    const journT = [0, 1, 2].map(k => tT(96, 128, (c, w, h) => { c.fillStyle = "#ece2c6"; c.fillRect(0, 0, w, h); c.fillStyle = "#2a2018"; c.font = `bold 11px ${serif}`; c.textAlign = "center"; c.fillText(["Le Petit Journal", "Le Petit Parisien", "Le Petit Journal"][k], w / 2, 14); c.fillRect(6, 18, w - 12, 1);
      const g = c.createLinearGradient(0, 24, 0, h - 10); g.addColorStop(0, ["#c8b896", "#a8b8c0", "#d8c0a0"][k]); g.addColorStop(1, ["#8a6a4a", "#5a6a5a", "#a8603a"][k]); c.fillStyle = g; c.fillRect(8, 24, w - 16, h - 36);
      for (let i = 0; i < 9; i++) { c.fillStyle = ["#3a2a1a", "#a82a1a", "#2a3a6a", "#e8d8b0"][i % 4]; const x = 12 + (i * 23) % (w - 30), y = 50 + (i * 17) % 50; c.fillRect(x, y, 5, 14); c.beginPath(); c.arc(x + 2.5, y - 3, 3, 0, 7); c.fill(); } c.fillStyle = "rgba(255,255,255,.2)"; c.fillRect(0, 0, w * .3, h); }));
    const journM = journT.map(t => mat({ map: t, roughness: .45 }));
    const cpT = tT(64, 160, (c, w, h) => { c.fillStyle = "#b8201a"; c.fillRect(0, 0, w, h); for (let y = 4; y < h - 10; y += 19) for (let x = 3; x < w - 10; x += 20) { c.fillStyle = ["#f2c84a", "#4a8ad8", "#e86a3a", "#7ac85a", "#f2f0e6", "#d84a8a", "#3a3a8a"][((x + y * 3) / 7 | 0) % 7]; c.fillRect(x, y, 18, 16); c.fillStyle = "rgba(0,0,0,.25)"; c.fillRect(x + 3, y + 9, 12, 3); } }), cpM = mat({ map: cpT, roughness: .5 }), rougeF = mat({ color: 0xb02018, metalness: .4, roughness: .5 }), drapR = mat({ color: 0xb8442a, roughness: .95 });
    const dosT = tT(32, 64, (c, w, h) => { c.fillStyle = "#ffffff"; c.fillRect(0, 0, w, h); c.fillStyle = "rgba(0,0,0,.25)"; c.fillRect(0, 10, w, 3); c.fillRect(0, h - 14, w, 3); c.fillStyle = "rgba(255,240,200,.7)"; c.fillRect(8, 20, 16, 20); });
    /* (10.148, d'après les couvertures de romans parisiens anciens) les livres présentés de face : seize couvertures dessinées — le titre en grandes lettres, l'auteur, l'éditeur, une scène illustrée, le prix rond */
    const COUV = [["NOTRE-DAME", "DE PARIS", "VICTOR HUGO", "#1a1410", "#e8c87a", 0], ["LES MYSTÈRES", "DE PARIS", "EUGÈNE SUE", "#e8dcc0", "#b8202a", 1], ["LE GOSSE", "DE PARIS", "MICHEL MORPHY", "#d8c8a0", "#2a3a6a", 2], ["PARIS", "MYSTÉRIEUX", "M.-L. PAGLIERI", "#c84a3a", "#f2e6c8", 3],
      ["ROI", "DE PARIS", "GEORGES OHNET", "#e8d040", "#3a2a1a", 4], ["LA PORTEUSE", "DE PAIN", "X. DE MONTÉPIN", "#d8b860", "#2a2a2a", 5], ["NOSTALGIE", "DE PARIS", "FRANCIS CARCO", "#efe6d0", "#a8202a", 6], ["LE SPLEEN", "DE PARIS", "BAUDELAIRE", "#c8202a", "#f2e6c8", 7],
      ["LES", "MISÉRABLES", "VICTOR HUGO", "#3a3028", "#e8d8b0", 0], ["PARIS LE JOUR", "PARIS LA NUIT", "L.-S. MERCIER", "#f2ecdc", "#2a2a2a", 3], ["LA MAFFIA", "ROUGE", "GEORGES STEFF", "#8a2a1a", "#f2d870", 2], ["GAMIN", "DE PARIS", "L. BOUSSENARD", "#d8d060", "#2a5a2a", 1],
      ["LES TROIS", "MOUSQUETAIRES", "ALEXANDRE DUMAS", "#e8e2d2", "#2a3a5a", 4], ["LA PEAU", "DE CHAGRIN", "H. DE BALZAC", "#5a7a8a", "#f2e6c8", 5], ["L'INTRUS", "", "ROMANS POPULAIRES", "#e8c860", "#1a2a5a", 6], ["FANTAISIE", "DE PARIS", "COLLECTION", "#2a7ab8", "#f2d040", 7]];
    const dessinCouv = (c, w, h, [t1, t2, au, fond, enc, sc], k) => { c.fillStyle = fond; c.fillRect(0, 0, w, h); for (let i = 0; i < 160; i++) { c.fillStyle = `rgba(${al() < .5 ? "80,60,30" : "255,250,230"},${al() * .1})`; c.fillRect(al() * w, al() * h, 3, 2); }
      c.strokeStyle = enc; c.lineWidth = 2; c.strokeRect(4, 4, w - 8, h - 8); c.fillStyle = enc; c.textAlign = "center"; c.font = `9px ${serif}`; c.fillText(au, w / 2, 16);
      c.font = `bold ${t1.length > 10 ? 12 : 15}px ${serif}`; c.fillText(t1, w / 2, 33); if (t2) { c.font = `bold ${t2.length > 10 ? 12 : 15}px ${serif}`; c.fillText(t2, w / 2, 49); }
      const y0 = 56, ih = h - 76; c.fillStyle = "rgba(0,0,0,.15)"; c.fillRect(10, y0, w - 20, ih); const g = c.createLinearGradient(0, y0, 0, y0 + ih); g.addColorStop(0, ["#e8b878", "#a8b8c8", "#f0c890", "#3a4a6a", "#c8d8e8", "#e8c8a0", "#b8c8b0", "#2a2a3a"][sc]); g.addColorStop(1, ["#6a4a2a", "#5a6a5a", "#8a6a4a", "#1a1a2a", "#7a8a6a", "#8a5a3a", "#5a6a4a", "#5a2a2a"][sc]); c.fillStyle = g; c.fillRect(12, y0 + 2, w - 24, ih - 4);
      c.fillStyle = "rgba(30,24,18,.75)"; if (sc === 0 || sc === 4) { c.fillRect(w / 2 - 14, y0 + 10, 9, ih - 14); c.fillRect(w / 2 + 5, y0 + 10, 9, ih - 14); c.fillRect(w / 2 - 14, y0 + 26, 28, ih - 30); c.beginPath(); c.arc(w / 2, y0 + 34, 4, 0, 7); c.fillStyle = "#c8a040"; c.fill(); }
      else for (let i = 0; i < 3; i++) { const x = 22 + i * (w - 44) / 2, y = y0 + ih - 8; c.fillStyle = ["#2a1a12", "#a82a2a", "#2a3a6a"][(i + k) % 3]; c.beginPath(); c.ellipse(x, y - 12, 5, 13, 0, 0, 7); c.fill(); c.fillStyle = "#e8c8a0"; c.beginPath(); c.arc(x, y - 29, 4, 0, 7); c.fill(); }
      if (k % 3 === 0) { c.fillStyle = "#c8202a"; c.beginPath(); c.arc(w - 18, h - 16, 10, 0, 7); c.fill(); c.fillStyle = "#fff"; c.font = "bold 9px Arial"; c.fillText(["3F50", "65c", "1F50", "10c"][k % 4], w - 18, h - 13); }
      c.fillStyle = enc; c.font = `8px ${serif}`; c.fillText(["A. FAYARD", "ALBIN MICHEL", "TALLANDIER", "J. ROUFF"][k % 4], w / 2 - (k % 3 === 0 ? 10 : 0), h - 9); };
    const couvM = COUV.map((C, k) => { const t = tT(96, 128, (c, w, h) => dessinCouv(c, w, h, C, k)); return mat({ map: t, roughness: .6 }); });
    /* et les tableaux, les gravures, les affiches anciennes de Paris (à l'endroit) : la tour Eiffel au couchant, la rue et ses cafés, la Seine et ses ponts, le Moulin-Rouge la nuit, Notre-Dame, le Sacré-Cœur, l'affiche « PARIS », la carte postale sépia */
    const TAB = [0, 1, 2, 3, 4, 5, 6, 7].map(k => tT(96, 128, (c, w, h) => { const ciel = [["#f2a868", "#f0d0a0"], ["#a8c8e0", "#e8e0d0"], ["#88b0d0", "#f0e0c8"], ["#141a3a", "#3a2a5a"], ["#e8b090", "#f0d8c0"], ["#b8d0e8", "#f8f0e0"], ["#f2c8a8", "#f8e8d8"], ["#d8c8a8", "#c8b898"]][k];
      const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, ciel[0]); g.addColorStop(1, ciel[1]); c.fillStyle = g; c.fillRect(0, 0, w, h); c.fillStyle = "#2a2018";
      if (k === 0 || k === 6) { c.fillStyle = k === 0 ? "#3a2a2a" : "#8a3a2a"; c.beginPath(); c.moveTo(w / 2, 14); c.lineTo(w / 2 + 22, h - 18); c.lineTo(w / 2 + 10, h - 18); c.lineTo(w / 2, h - 50); c.lineTo(w / 2 - 10, h - 18); c.lineTo(w / 2 - 22, h - 18); c.closePath(); c.fill(); c.fillRect(w / 2 - 14, h - 62, 28, 3); c.fillRect(w / 2 - 9, h - 90, 18, 3);
        if (k === 6) { c.fillStyle = "#c8302a"; c.font = `bold 20px ${serif}`; c.textAlign = "center"; c.fillText("PARIS", w / 2, 26); } }
      else if (k === 1) { for (const [x0, cl] of [[0, "#c8a878"], [w - 30, "#d8b888"]]) { c.fillStyle = cl; c.fillRect(x0, 10, 30, h - 10); for (let y = 20; y < h - 30; y += 16) { c.fillStyle = "#4a5a6a"; c.fillRect(x0 + 6, y, 7, 10); c.fillRect(x0 + 17, y, 7, 10); } c.fillStyle = "#b82a2a"; c.fillRect(x0, h - 34, 30, 6); } c.fillStyle = "#6a6a6a"; c.beginPath(); c.moveTo(30, h); c.lineTo(w / 2 - 3, h * .45); c.lineTo(w / 2 + 3, h * .45); c.lineTo(w - 30, h); c.fill(); for (let i = 0; i < 4; i++) { c.fillStyle = ["#2a2a2a", "#a82a2a", "#2a3a6a", "#e8d8b0"][i]; c.fillRect(36 + i * 7, h - 26 + (i % 2) * 4, 3, 10); } }
      else if (k === 2) { c.fillStyle = "#4a6a7a"; c.fillRect(0, h * .6, w, h * .4); c.fillStyle = "#c8b898"; c.fillRect(0, h * .52, w, 8); for (let i = 0; i < 4; i++) { c.fillStyle = "#4a6a7a"; c.beginPath(); c.arc(12 + i * 24, h * .52 + 8, 9, Math.PI, 0); c.fill(); } c.fillStyle = "#8a9aa8"; c.fillRect(0, h * .3, w, h * .22); c.fillStyle = "rgba(255,255,255,.5)"; for (let i = 0; i < 12; i++) c.fillRect(al() * w, h * .65 + al() * h * .3, 8, 1); }
      else if (k === 3) { c.fillStyle = "#2a1a2a"; c.fillRect(0, h * .55, w, h * .45); c.fillStyle = "#c8202a"; c.fillRect(w / 2 - 16, h * .4, 32, h * .3); c.fillStyle = "#f0d040"; c.font = "bold 9px Arial"; c.textAlign = "center"; c.fillText("MOULIN ROUGE", w / 2, h * .55); c.strokeStyle = "#8a2a1a"; c.lineWidth = 4; c.save(); c.translate(w / 2, h * .36); for (let i = 0; i < 4; i++) { c.rotate(Math.PI / 2); c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 22); c.stroke(); } c.restore(); for (let i = 0; i < 20; i++) { c.fillStyle = "#f8d870"; c.fillRect(al() * w, h * .6 + al() * h * .35, 2, 2); } }
      else if (k === 4) { c.fillStyle = "#c8b898"; c.fillRect(w / 2 - 26, 30, 18, h - 50); c.fillRect(w / 2 + 8, 30, 18, h - 50); c.fillRect(w / 2 - 26, 56, 52, h - 76); c.fillStyle = "#6a5a4a"; c.beginPath(); c.arc(w / 2, 68, 8, 0, 7); c.fill(); c.fillStyle = "#4a6a7a"; c.fillRect(0, h - 20, w, 20); }
      else if (k === 5) { c.fillStyle = "#f2ecdc"; c.beginPath(); c.arc(w / 2, 50, 18, Math.PI, 0); c.fill(); c.fillRect(w / 2 - 24, 50, 48, 28); c.beginPath(); c.arc(w / 2 - 20, 54, 7, Math.PI, 0); c.arc(w / 2 + 20, 54, 7, Math.PI, 0); c.fill(); c.fillStyle = "#5a8a4a"; c.fillRect(0, 78, w, h - 78); for (let i = 0; i < 6; i++) { c.fillStyle = ["#e8487a", "#c8a040", "#d8203a"][i % 3]; c.beginPath(); c.arc(10 + i * 16, 92 + (i % 2) * 8, 6, 0, 7); c.fill(); } }
      else { c.globalAlpha = .8; for (let i = 0; i < 5; i++) { c.fillStyle = "#7a6a4a"; c.fillRect(i * 20, 30 + (i % 2) * 10, 18, h - 40); } c.fillStyle = "#4a3a2a"; c.fillRect(w / 2 - 2, 10, 4, 60); c.globalAlpha = 1; c.fillStyle = "#3a2a1a"; c.font = `italic 11px ${serif}`; c.textAlign = "center"; c.fillText("Carte postale", w / 2, h - 8); }
      c.strokeStyle = "#f8f4ea"; c.lineWidth = 5; c.strokeRect(2, 2, w - 4, h - 4); c.strokeStyle = "rgba(60,40,20,.6)"; c.lineWidth = 1; c.strokeRect(5, 5, w - 10, h - 10); }));
    const tabM = TAB.map(t => mat({ map: t, roughness: .45 }));
    const DOS = [], PLAT = [], cols = [0xc83a2a, 0x2a5aa8, 0xe8d8b0, 0x2a7a4a, 0xd8a020, 0x7a2a6a, 0xf2f0ea, 0x3a2a1a, 0xc86a2a, 0x8a6a4a, 0xe86a8a, 0x4a8ac8];
    const Y0 = 1.12;   // (le dessus du parapet)
    const boite = (x, zc, ry, ouverte, k) => { const T = new THREE.Matrix4().makeRotationY(ry).setPosition(x, 0, zc), q0 = new THREE.Quaternion().setFromRotationMatrix(T);
      const P = (w, h, d, m, px, py, pz, rx = 0) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(px, py, pz); o.rotation.x = rx; o.applyMatrix4(T); scene.add(o); return o; };
      const Q = (w, h, m, px, py, pz, rx = 0) => { const o = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); o.position.set(px, py, pz); o.rotation.x = rx; o.applyMatrix4(T); scene.add(o); return o; };
      const livre = (L2, px, py, pz, sx, sy, sz, rx = 0, rz = 0) => { const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, 0, rz)).premultiply(q0); L2.push([new THREE.Vector3(px, py, pz).applyMatrix4(T), q, new THREE.Vector3(sx, sy, sz), L2 === PLAT ? 0xffffff : cols[(al() * cols.length) | 0], (al() * 16) | 0]); };
      P(2.0, .62, .78, vert, 0, Y0 + .31, 0); P(2.04, .06, .82, vertF, 0, Y0 + .03, 0); for (const sx of [-.995, .995]) P(.03, .62, .8, vertF, sx, Y0 + .31, 0);
      if (!ouverte) { P(2.04, .05, .82, vertF, 0, Y0 + .645, 0); P(.08, .1, .04, fer, .4, Y0 + .55, .41); if (k % 3 === 0) Q(1.4, .4, tagM, -.1, Y0 + .32, .395); return; }
      const din = dedans[k % 3]; if (k % 3 === 0) VEND.push([new THREE.Vector3(1.4, 0, .95).applyMatrix4(T), ry, k]);
      // le couvercle levé (le dos peint) et l'auvent, ses tringles
      P(2.0, .95, .03, vert, 0, Y0 + 1.1, -.4); Q(1.96, .92, din, 0, Y0 + 1.1, -.38);
      P(2.06, .03, 1.15, vert, 0, Y0 + 1.62, .14, -.22); Q(2.0, 1.1, din, 0, Y0 + 1.6, .14, Math.PI / 2 - .22);
      for (const sx of [-.97, .97]) { const r = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, 1.05, 5), fer); r.position.set(sx, Y0 + 1.12, .55); r.rotation.x = -.15; r.applyMatrix4(T); scene.add(r); }
      // les livres debout dans la caisse, trois rangées
      for (const [zr, n] of [[-.25, 22], [0, 22], [.24, 20]]) for (let i = 0; i < n; i++) livre(DOS, -.94 + i * (1.88 / n), Y0 + .6, zr, .07 + al() * .03, .22 + al() * .08, .17, 0, (al() - .5) * .12);
      // la tablette dépliée et ses livres à plat, ses équerres
      P(2.0, .03, .55, bois, 0, Y0 + .48, .66); for (const sx of [-.9, .9]) { const e = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, .62, 5), fer); e.position.set(sx, Y0 + .25, .6); e.rotation.x = .8; e.applyMatrix4(T); scene.add(e); }
      for (let i = 0; i < 10; i++) for (let j = 0; j < 2; j++) if (al() < .9) livre(PLAT, -.9 + i * .2, Y0 + .63 + j * .05, .78 - j * .26, .18, .25, .025, -.32, 0);   // (les livres présentés de face, couverture vers le passant)
      for (let i = 0; i < 9; i++) if (al() < .85) livre(PLAT, -.9 + i * .22, Y0 + .9, .02, .18, .25, .025, -.2, 0);
      for (let i = 0; i < 4; i++) { Q(.44, .62, journM[(k + i) % 3], -.72 + i * .48, Y0 + .1, .43); P(.05, .03, .03, fer, -.72 + i * .48, Y0 + .4, .44); }   // (les vieux journaux pendus devant, sous pochette)
      // les gravures et affiches sous pochette, sur le dos peint ; d'autres pendues à l'auvent
      for (let i = 0; i < 3; i++) Q(.42, .56, tabM[(k * 3 + i) % 8], -.62 + i * .62, Y0 + 1.2, -.365);
      for (let i = 0; i < 4; i++) if (al() < .85) { Q(.4, .52, (i + k) % 3 ? tabM[(k + i * 3) % 8] : gravM[(k + i) % 3], -.72 + i * .48, Y0 + 1.2, .74); P(.05, .03, .03, fer, -.72 + i * .48, Y0 + 1.47, .745); }   // (les gravures sous pochette, pincées à l'auvent)
      // parfois le présentoir de magnets, parfois un chevalet sur le pavé
      if (k % 4 === 1) { for (const sx of [-.3, .3]) P(.025, 1.9, .025, rougeF, .75 + sx, .95, 1.15); P(.62, .025, .025, rougeF, .75, 1.9, 1.15); Q(.58, 1.45, cpM, .75, 1.12, 1.16); P(.3, .04, .3, rougeF, .75, .17, 1.15);   // (le tourniquet de cartes postales)
        const c2 = new THREE.Vector3(.75, 0, 1.15).applyMatrix4(T); OBS.push([c2.x - .35, c2.x + .35, c2.z - .3, c2.z + .3]); }
      if (k % 6 === 3) { P(.04, .3, .48, fer, 1.12, Y0 + .3, .5); Q(.48, .9, magM, 1.12, Y0 + .7, .5).rotation.y += Math.PI / 2; }
      if (k % 5 === 2) { for (const [lx, lz, r] of [[-.28, 1.5, -.3], [.28, 1.5, -.3], [0, 1.02, .38]]) { const l = new THREE.Mesh(new THREE.BoxGeometry(.04, 1.55, .04), bois); l.position.set(lx, .82, lz); l.rotation.x = r; l.applyMatrix4(T); scene.add(l); }
        P(.66, .05, .08, bois, 0, .86, 1.62, -.3); P(.62, .8, .03, bois, 0, 1.28, 1.44, -.3); Q(.56, .74, tabM[(k * 5) % 8], 0, 1.28, 1.465, -.3);   /* (le chevalet, à l'endroit : le tableau face aux passants, la jambe de force derrière) */
        const c = new THREE.Vector3(0, 0, 1.4).applyMatrix4(T); OBS.push([c.x - .4, c.x + .4, c.z - .35, c.z + .35]); }
      const c = new THREE.Vector3(0, 0, .7).applyMatrix4(T); OBS.push([c.x - 1.05, c.x + 1.05, c.z - .5, c.z + .5]); };
    // les rangées sur le parapet de la rive gauche (ouvertes vers le quai) et, plus clairsemées, sur celui de l'île
    const GAPS = []; let kb = 0;
    for (const [zc, ry, pas] of [[25.3, 0, 1], [-25.3, Math.PI, PEU ? 3 : 2]]) for (let x = -XS + 6, g = 0; x < XS - 4; g++) { const n = 7 + (g % 3);
      for (let i = 0; i < n; i++, x += 2.06) { if (!horsPont(x, zc < 0 ? 6 : 2.5) || (zc > 0 && x > ESC[1] - ESCE - 1.5 && x < ESC[1] + 1.5) || (zc < 0 && x > RAMPE_C[1] - 5.5 && x < RAMPE_C[1] + 1.5)) continue; if (g % pas) continue; boite(x, zc, ry, al() < (zc > 0 ? .72 : .55), kb++); }
      if (zc > 0) GAPS.push(x + 2.5); x += 5; }
    const inst = (L2, geo, m) => { if (!L2.length) return; const im = new THREE.InstancedMesh(geo, m, L2.length), m4 = new THREE.Matrix4(), co = new THREE.Color(); L2.forEach(([p, q, s, c], i) => { m4.compose(p, q, s); im.setMatrixAt(i, m4); im.setColorAt(i, co.setHex(c)); }); im.instanceMatrix.needsUpdate = true; im.frustumCulled = false; scene.add(im); };
    inst(DOS, new THREE.BoxGeometry(1, 1, 1), mat({ map: dosT, roughness: .7 })); for (let ci = 0; ci < 16; ci++) inst(PLAT.filter(q => q[4] === ci), new THREE.BoxGeometry(1, 1, 1), couvM[ci]);
    // les bancs dans les allées, entre les rangées ; d'autres au bas-port, face à l'eau
    for (const x of GAPS) { if (!horsPont(x, 5) || (x > ESC[1] - ESCE - 3 && x < ESC[1] + 3) || x > XS - 4) continue; banc(x, 27.2, 0, TROT); }
    for (const x of [-120, -95, -70, -25, 20, 95, 120]) banc(x, 21.9, Math.PI, YB, false);
    for (const x of [-120, -90, -60, -17, 24, 50, 80, 110, 140]) { if (horsPont(x, 3)) reverbere(x, 29.6, TROT); }
    for (const x of [-140, -100, -66, -24, 18, 40, 70, 100, 130]) platane(x, 29.3, x === -24 || x === 18 ? 1.25 : 1);   /* (en bordure du trottoir, pas sur la chaussée) */
    for (let x = -XS + 12; x < XS; x += 24) if (horsPont(x, 5) && Math.abs(x - 38) > 6) reverbere(x, -25.9);
    for (const [x, z] of [[-29.5, -35], [27.5, -35], [-29.5, -68], [27.5, -68], [-29.5, -50], [27.5, -50]]) reverbere(x, z);
    for (const [x, z, r] of [[-8, -37, 0], [6, -37, 0]]) banc(x, z, r);
    for (const [x, z, k] of [[-29.5, -40, 1.1], [27.5, -40, 1.1], [-29.5, -60, 1.0], [27.5, -60, 1.0]]) platane(x, z, k);
    for (let z = -80; z > -200; z -= 17) { platane(-29, z, .9); if (z < -100) platane(27, z, .9); }   /* (10.161 : la place du bal, sans arbre au milieu) */
    { const herbe = mat({ color: 0x5a7a3a, roughness: 1 }); sol(-33, 31, -215, -205, herbe, .03); for (const x of [-30, -15, 0, 15, 30]) platane(x, -211, 1.1); } }

  /* ---------- les immeubles anciens : la façade de pierre, les balcons filants, les toits d'ardoise ; au rez-de-chaussée les cafés à stores rouges, les librairies à stores verts ---------- */
  const teintes = ["#dccaa6", "#d6c39e", "#e2d2b2", "#d2bf98", "#dac8a8"];   /* (la pierre de taille chaude des images) */
  const ENS = [["CAFÉ LE PETIT PONT", "#8a1a1a", 1], ["SHAKESPEARE AND COMPANY", "#1e4a2a", 0], ["BRASSERIE NOTRE-DAME", "#8a1a1a", 1], ["LIBRAIRIE ANCIENNE", "#1e4a3a", 0], ["CAFÉ DE LA SEINE", "#7a1a1a", 1], ["GALERIE D'ESTAMPES", "#2e4a3a", 0], ["LE BISTROT DU PARVIS", "#8a2a1a", 1], ["SOUVENIRS DE PARIS", "#1a4a3a", 0], ["AUX TOURS DE NOTRE-DAME", "#8a1a1a", 1], ["PAPETERIE", "#2a4a3a", 0]];
  const storeR = mat({ color: 0xa82424, roughness: .8 }), storeV = mat({ color: 0x2a4a3a, roughness: .8 }), tableM = mat({ color: 0x2a2a2a, metalness: .4, roughness: .5 }), chaiseM = mat({ color: 0xb8925a, roughness: .7 });
  let kI = 0; const TERR = [], SERV = []; let NOMF = null, DPROF = 12;
  const vitreP = new THREE.MeshStandardMaterial({ color: 0xd8e8ec, transparent: true, opacity: .28, roughness: .05, metalness: .3, depthWrite: false }), boisP = mat({ color: 0x5a2a1a, roughness: .6 }), chaiseR = mat({ color: 0xb02a22, roughness: .6 }), ardoiseM = mat({ map: tT(64, 96, (c, w, h) => { c.fillStyle = "#1e2420"; c.fillRect(0, 0, w, h); c.strokeStyle = "#8a6a42"; c.lineWidth = 6; c.strokeRect(0, 0, w, h); c.fillStyle = "#f2f0e6"; c.font = "bold 10px Georgia"; c.textAlign = "center"; c.fillText("MENU", w / 2, 18); c.font = "8px Georgia"; ["Croque-monsieur", "Soupe à l'oignon", "Crêpe sucre", "Café crème", "Vin chaud"].forEach((t, i) => c.fillText(t, w / 2, 34 + i * 12)); }), roughness: .9 });
  const lierre = [0x2e5a24, 0x3a6a2a, 0x4a7a30].map(cc => mat({ color: cc, roughness: .9 }));
  const feuille = (c, x, y, s, an, col) => { c.save(); c.translate(x, y); c.rotate(an); c.fillStyle = col; c.beginPath(); c.moveTo(0, -s); c.quadraticCurveTo(s * .9, -s * .6, s * .55, s * .15); c.quadraticCurveTo(s * .3, s * .7, 0, s * .45); c.quadraticCurveTo(-s * .3, s * .7, -s * .55, s * .15); c.quadraticCurveTo(-s * .9, -s * .6, 0, -s); c.fill(); c.strokeStyle = "rgba(200,230,170,.35)"; c.lineWidth = 1; c.beginPath(); c.moveTo(0, -s * .8); c.lineTo(0, s * .4); c.stroke(); c.restore(); };
  const vertsL = ["#2a5a20", "#3a6e28", "#4a8030", "#2e6424", "#5a8a36"];
  const lierreT = [0, 1, 2].map(k => { const t = tT(128, 256, (c, w, h) => { c.clearRect(0, 0, w, h); for (let s = 0; s < 6; s++) { let x = 12 + s * 21 + (al() - .5) * 8; const L2 = h * (.45 + al() * .55); c.strokeStyle = "#3a4a22"; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, 0);
      for (let y = 0; y < L2; y += 10) { x += (al() - .5) * 5; c.lineTo(x, y); } c.stroke(); let xx = 12 + s * 21; for (let y = 4; y < L2; y += 9 + al() * 5) { xx += (al() - .5) * 5; feuille(c, xx + (al() - .5) * 10, y, 6 + al() * 5 - y / L2 * 2, (al() - .5) * 1.4 + Math.PI, vertsL[(al() * 5) | 0]); } } }); return new THREE.MeshStandardMaterial({ map: t, alphaTest: .45, side: THREE.DoubleSide, roughness: .85 }); });
  const lierreM = [0, 1, 2].map(k => { const t = tT(128, 64, (c, w, h) => { c.clearRect(0, 0, w, h); for (let i = 0; i < 70; i++) { const x = 8 + al() * (w - 16), y = h * .25 + al() * h * .75 - Math.sin(x / w * Math.PI) * h * .2; feuille(c, x, y, 5 + al() * 4, (al() - .5) * 3, vertsL[(al() * 5) | 0]); } }); return new THREE.MeshStandardMaterial({ map: t, alphaTest: .45, side: THREE.DoubleSide, roughness: .85 }); });
  const fleurs = [0xd8203a, 0xe8487a, 0xf2c040, 0x3a6a2a].map(cc => mat({ color: cc, roughness: .8 }));
  /* ---------- (d'après les images, construits en relief) les immeubles de pierre de taille : les bossages du rez-de-chaussée, les boutiques et leurs stores,
     la porte cochère ; les fenêtres et leurs encadrements, les frontons, les corniches, les balcons filants de fer forgé, les balconnets ; la corniche à denticules ;
     le toit de zinc à la Mansart, ses lucarnes, les souches de cheminée en brique et leurs pots ; le dôme d'angle ---------- */
  const uvBox = (g, w, h, d, tu) => { const uv = g.attributes.uv, dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]]; for (let f = 0; f < 6; f++) for (let v = 0; v < 4; v++) { const i = f * 4 + v; uv.setXY(i, uv.getX(i) * dims[f][0] / tu, uv.getY(i) * dims[f][1] / tu); } uv.needsUpdate = true; return g; };
  const mkInst = () => { const R = {}; return { def: (k, geo, m) => { R[k] = { geo, m, L: [] }; },
    P: (k, T, x, y, z, sx, sy, sz, rx = 0, col = null, ry = 0, rz = 0) => { const m4 = new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new THREE.Vector3(sx, sy, sz)); if (T) m4.premultiply(T); R[k].L.push([m4, col]); },
    fin: () => { const out = []; for (const k in R) { const r = R[k]; if (!r.L.length) continue; const im = new THREE.InstancedMesh(r.geo, r.m, r.L.length), co = new THREE.Color(), aC = r.L.some(q => q[1] != null);
      r.L.forEach(([m4, c], i) => { im.setMatrixAt(i, m4); if (aC) im.setColorAt(i, co.set(c == null ? 0xffffff : c)); }); im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; im.receiveShadow = true; im.frustumCulled = false; scene.add(im); out.push([k, im]); } return out; } }; };
  const pierreFinT = tT(128, 128, (c, w, h) => { c.fillStyle = "#f6f2ea"; c.fillRect(0, 0, w, h); for (let i = 0; i < 500; i++) { c.fillStyle = `rgba(${al() < .5 ? "120,105,80" : "255,255,250"},${al() * .09})`; c.fillRect(al() * w, al() * h, 1 + al() * 5, 1 + al() * 4); } });
  const murT = tT(256, 256, (c, w, h) => { c.fillStyle = "#ffffff"; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 32) for (let x = ((y / 32) % 2) * 32 - 64; x < w; x += 64) { c.fillStyle = `rgba(${al() < .5 ? "130,115,90" : "255,252,245"},${al() * .1})`; c.fillRect(x + 1, y + 1, 62, 30); c.fillStyle = "rgba(120,104,80,.32)"; c.fillRect(x, y, 64, 1.5); c.fillRect(x, y, 1.5, 32); } for (let i = 0; i < 400; i++) { c.fillStyle = `rgba(90,80,60,${al() * .06})`; c.fillRect(al() * w, al() * h, 2 + al() * 6, 1 + al() * 3); } }, 1, 1);
  const vitreT = tT(64, 112, (c, w, h) => { c.fillStyle = "#efe9dc"; c.fillRect(0, 0, w, h); const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#a8bccb"); g.addColorStop(.45, "#4a5a68"); g.addColorStop(1, "#2a333c"); c.fillStyle = g; c.fillRect(5, 5, w - 10, h - 10);
    c.fillStyle = "rgba(238,230,214,.75)"; c.fillRect(6, 6, 9, h * .8); c.fillRect(w - 15, 6, 9, h * .8); c.fillStyle = "#efe9dc"; c.fillRect(w / 2 - 1.5, 0, 3, h); c.fillRect(0, 40, w, 2.5); c.fillRect(0, 76, w, 2.5); c.fillStyle = "rgba(255,255,255,.14)"; c.beginPath(); c.moveTo(8, 60); c.lineTo(30, 8); c.lineTo(40, 8); c.lineTo(14, 70); c.fill(); });
  const ferT = tT(128, 96, (c, w, h) => { c.clearRect(0, 0, w, h); c.strokeStyle = "#000"; c.lineWidth = 5; for (const y of [4, 92]) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); } c.lineWidth = 3; c.beginPath(); c.moveTo(0, 72); c.lineTo(w, 72); c.stroke(); c.beginPath(); c.moveTo(0, 14); c.lineTo(w, 14); c.stroke();
    c.lineWidth = 2; for (let x = 4; x < w; x += 8) { c.beginPath(); c.moveTo(x, 72); c.lineTo(x, 92); c.stroke(); } for (let x = 0; x <= w; x += 32) { c.lineWidth = 3; c.beginPath(); c.moveTo(x, 4); c.lineTo(x, 92); c.stroke(); c.lineWidth = 2.4; for (const s of [-1, 1]) { c.beginPath(); c.arc(x + s * 9, 30, 8, 0, 7); c.stroke(); c.beginPath(); c.arc(x + s * 9, 55, 8, 0, 7); c.stroke(); } c.beginPath(); c.moveTo(x + 16, 14); c.lineTo(x + 16, 72); c.stroke(); } });
  const vitrineT = tT(128, 96, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#f4dcaa"); g.addColorStop(1, "#7a5838"); c.fillStyle = g; c.fillRect(0, 0, w, h); for (let r = 0; r < 4; r++) { const y = 14 + r * 21; c.fillStyle = "#5a3e26"; c.fillRect(0, y + 14, w, 3); for (let x = 2; x < w - 4; x += 4 + al() * 3) { c.fillStyle = ["#a82a22", "#2a4a8a", "#e8d8b0", "#2a6a3a", "#c8902a", "#6a2a5a", "#f2efe6"][(al() * 7) | 0]; c.fillRect(x, y + 2 + al() * 3, 3, 12); } }
    c.fillStyle = "rgba(255,255,255,.16)"; c.beginPath(); c.moveTo(10, h); c.lineTo(50, 0); c.lineTo(66, 0); c.lineTo(26, h); c.fill(); });
  const zincT = tT(64, 64, (c, w, h) => { c.fillStyle = "#8c96a2"; c.fillRect(0, 0, w, h); for (let i = 0; i < 200; i++) { c.fillStyle = `rgba(${al() < .5 ? "60,70,80" : "220,228,236"},${al() * .08})`; c.fillRect(al() * w, al() * h, 3, 3); } for (let x = 0; x < w; x += 16) { c.fillStyle = "#b2bcc6"; c.fillRect(x, 0, 2, h); c.fillStyle = "#5e6874"; c.fillRect(x + 2, 0, 1, h); } }, 1, 1);
  const zincM = mat({ map: zincT, roughness: .45, metalness: .35 }), MURM = {};
  const IM = mkInst(), ub = new THREE.BoxGeometry(1, 1, 1);
  const frS = new THREE.Shape(); frS.moveTo(-.5, 0); frS.lineTo(.5, 0); frS.lineTo(0, 1); frS.closePath(); const frontonG = new THREE.ExtrudeGeometry(frS, { depth: 1, bevelEnabled: false }); frontonG.translate(0, 0, -.5);
  IM.def("pierre", ub, mat({ map: pierreFinT, roughness: .85 })); IM.def("fronton", frontonG, mat({ map: pierreFinT, roughness: .85 }));
  IM.def("vitre", new THREE.PlaneGeometry(1, 1), mat({ map: vitreT, roughness: .25, metalness: .3 }));
  IM.def("fer", new THREE.PlaneGeometry(1, 1), new THREE.MeshStandardMaterial({ map: ferT, alphaTest: .5, side: THREE.DoubleSide, color: 0x1c1c1c, roughness: .6, metalness: .4 }));
  IM.def("zinc", ub, mat({ color: 0x8c96a2, roughness: .45, metalness: .35 })); IM.def("brique", ub, mat({ color: 0xa65a3e, roughness: .9 })); IM.def("pot", new THREE.CylinderGeometry(.5, .6, 1, 8), mat({ color: 0xc0623e, roughness: .8 }));
  IM.def("store", ub, mat({ roughness: .85 })); IM.def("peint", ub, mat({ roughness: .55 })); IM.def("bois", ub, mat({ color: 0x6a4426, roughness: .7 }));
  IM.def("vitrine", new THREE.PlaneGeometry(1, 1), mat({ map: vitrineT, emissive: 0xffe0b0, emissiveMap: vitrineT, emissiveIntensity: .22, roughness: .3 }));
  IM.def("lumiere", new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0xffd48a })); IM.def("fleur", new THREE.IcosahedronGeometry(1, 0), mat({ roughness: .8 })); IM.def("jardin", ub, mat({ color: 0x3a5a2a, roughness: .9 }));
  IM.def("int", ub, mat({ roughness: .8, emissive: 0xffe6c0, emissiveIntensity: .16 })); IM.def("rond", new THREE.CylinderGeometry(1, 1, 1, 12), mat({ roughness: .5, metalness: .4 })); IM.def("lampe", new THREE.SphereGeometry(1, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffe2a8 }));
  IM.def("verre", new THREE.PlaneGeometry(1, 1), new THREE.MeshStandardMaterial({ color: 0xc8dae2, transparent: true, opacity: .16, roughness: .05, metalness: .5, depthWrite: false }));
  const LARG = { long: 30, angle: 18, std: 21 };
  const immeuble = (x, z, rot, W = 18, nE = 5, terrasse = true, type = null, coin = 0) => { const k = kI++, [nom, coul, cafe] = NOMF || ENS[k % ENS.length], te = teintes[k % teintes.length];
    const T = new THREE.Matrix4().makeRotationY(rot).setPosition(x, TROT, z), P = (kk, ...a) => IM.P(kk, T, ...a), HR = 4.4, HE = 3.15, H = HR + nE * HE, D = DPROF;
    const mesh = (g, m, px, py, pz) => { const o = new THREE.Mesh(g, m); o.position.set(px, py, pz); o.applyMatrix4(T); o.receiveShadow = true; scene.add(o); return o; };
    const MM = MURM[te] || (MURM[te] = mat({ map: murT, color: te, roughness: .9 })), PR = 3.2;   // (PR : la profondeur des boutiques)
    { const Hh = H - HR, g = uvBox(new THREE.BoxGeometry(W, Hh, D), W, Hh, D, 4); mesh(g, MM, 0, HR + Hh / 2, -D / 2); }
    { const DB = D - PR, g = uvBox(new THREE.BoxGeometry(W, HR, DB), W, HR, DB, 4); mesh(g, MM, 0, HR / 2, -PR - DB / 2); }
    const n = Math.max(3, Math.round(W / 2.75)), pas = W / n, xs = [...Array(n)].map((_, i) => -W / 2 + pas * (i + .5)), porte = type === "long" ? Math.floor(n / 2) : -1, navy = cafe && (NOMF ? !!NOMF[3] : k % 3 === 0), sc = cafe ? 0x8a1c1c : 0x2a4a38, pc = navy ? 0x1a2440 : cafe ? 0x5a1414 : 0x23382c;   /* (10.149 : certains restaurants, comme celui de la photo : la boiserie bleu nuit, ses moulures dorées) */
    // le rez-de-chaussée : les bossages, les boutiques, leurs stores, la porte cochère
    // les trumeaux de pierre entre les boutiques, leurs bossages
    for (let i = 0; i <= n; i++) { const xb = -W / 2 + i * pas, x0 = Math.max(-W / 2, xb - .45), x1 = Math.min(W / 2, xb + .45); mesh(uvBox(new THREE.BoxGeometry(x1 - x0, HR, PR), x1 - x0, HR, PR, 4), MM, (x0 + x1) / 2, HR / 2, -PR / 2); for (let j = 0; j < 8; j++) P("pierre", (x0 + x1) / 2, .3 + j * .52, .05, x1 - x0, .44, .1, 0, te); }
    xs.forEach((xc, i) => { const w = pas - .9;
      if (i === porte) mesh(new THREE.BoxGeometry(w, HR, PR), MM, xc, HR / 2, -PR / 2 - .02); else mesh(new THREE.BoxGeometry(w, HR - 3.3, PR), MM, xc, (HR + 3.3) / 2, -PR / 2);
      if (i === porte) { P("bois", xc, 1.9, .1, 2.3, 3.8, .1); for (const s of [-1, 1]) { P("pierre", xc + s * 1.35, 2.0, .16, .4, 4.0, .22, 0, te); for (let j = 0; j < 4; j++) P("bois", xc + s * .6, .7 + j * .9, .17, .8, .7, .04, 0, 0x5a3a20); } P("pierre", xc, 4.05, .17, 3.1, .35, .26, 0, te); P("pierre", xc, 4.0, .3, .45, .7, .2, 0, te); return; }
      // l'intérieur de la boutique, en profondeur : le plancher, le plafond, les murs, le fond ; le café (son comptoir, ses tables) ou la librairie (ses rayonnages, sa table de livres) ; la vitre
      P("int", xc, .03, -PR / 2, w, .04, PR, 0, cafe ? 0x5a3420 : 0x7a5a3a); P("int", xc, 3.28, -PR / 2, w, .04, PR, 0, 0xf2e6cc); for (const s of [-1, 1]) P("int", xc + s * (w / 2 - .02), 1.65, -PR / 2, .04, 3.3, PR, 0, cafe ? 0xc89a6a : 0xe8dcc0);
      P("vitrine", xc, 1.65, -PR + .02, w, 3.3, 1); P("lampe", xc, 3.05, -PR / 2, .22, .22, .22);
      if (cafe) { P("int", xc, .55, -PR + .55, w * .75, 1.1, .5, 0, 0x5a2a18); P("int", xc, 1.12, -PR + .55, w * .8, .05, .62, 0, 0xb8b8b0);
        for (const tx of [-w / 4, w / 4]) { P("rond", xc + tx, .74, -1.2, .34, .04, .34, 0, 0x2a2a2a); P("rond", xc + tx, .37, -1.2, .03, .72, .03, 0, 0x2a2a2a); for (const s of [-1, 1]) { P("int", xc + tx + s * .5, .46, -1.2, .4, .05, .4, 0, 0xb8925a); P("int", xc + tx + s * .7, .7, -1.2, .04, .45, .4, 0, 0xb8925a); } } }
      else { for (const s of [-1, 1]) P("vitrine", xc + s * (w / 2 - .06), 1.5, -PR / 2, PR - .2, 2.6, 1, 0, null, -s * Math.PI / 2); P("int", xc, .42, -1.4, w * .5, .84, .9, 0, 0x5a3a20);
        for (let b = 0; b < 8; b++) P("store", xc - w * .22 + (b % 4) * w * .14, .87, -1.65 + ((b / 4) | 0) * .45, .2, .04, .27, -.1, [0xc83a2a, 0x2a5aa8, 0xe8d8b0, 0x2a7a4a, 0xd8a020, 0x7a2a6a][(b + i) % 6]); }
      P("verre", xc, 1.75, .05, w, 3.0, 1);
      if (navy) { for (const [yy, hh] of [[.42, .05], [3.18, .05]]) P("peint", xc, yy, .24, w + .2, hh, .04, 0, 0xc8a040); for (const s of [-1, 1]) { P("peint", xc + s * (w / 2 + .1), 1.8, .24, .05, 2.8, .04, 0, 0xc8a040); P("peint", xc + s * (w / 2 + .1), 3.5, .24, .14, .14, .05, 0, 0xc8a040); } P("peint", xc, 3.5, .3, w * .5, .05, .04, 0, 0xc8a040); }
      for (const s of [-1, 1]) P("peint", xc + s * (w / 2 + .09), 1.8, .16, .18, 3.1, .12, 0, pc); P("peint", xc, .2, .16, w + .36, .4, .14, 0, pc); P("peint", xc, 3.5, .2, w + .45, .55, .16, 0, pc);
      for (let j = 1; j < 3; j++) P("peint", xc - w / 2 + j * w / 3, 1.8, .15, .06, 2.7, .05, 0, pc);
      P("store", xc, 3.15, .95, w + .2, .05, 1.8, .34, sc); P("store", xc, 2.68, 1.8, w + .2, .32, .03, 0, sc); });
    { const j = xs.findIndex((_, i) => i !== porte), xc = xs[j]; const st = tT(512, 64, (c, w, h) => { c.fillStyle = "#" + new THREE.Color(pc).getHexString(); c.fillRect(0, 0, w, h); c.strokeStyle = "#c8a85a"; c.lineWidth = 3; c.strokeRect(4, 4, w - 8, h - 8); c.fillStyle = "#f2e6c8"; c.font = `bold 34px ${serif}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(nom, w / 2, h / 2 + 2); });
      mesh(new THREE.PlaneGeometry(pas - .5, .48), mat({ map: st, roughness: .6 }), xc, 3.5, .29); }
    // les étages : bandeaux, fenêtres et leurs encadrements, frontons, balcons
    P("pierre", 0, HR - .1, .2, W + .3, .32, .42, 0, te);
    for (const s of [-1, 1]) P("pierre", s * (W / 2 - .3), HR + nE * HE / 2, .06, .6, nE * HE, .12, 0, te);
    for (let e = 0; e < nE; e++) { const y0 = HR + e * HE, yc = y0 + 1.55, filant = e === 1 || e === nE - 1;
      if (e > 0) P("pierre", 0, y0 + .05, .07, W, .16, .14, 0, te);
      if (filant) { P("pierre", 0, y0 + .1, .46, W - .3, .16, .92, 0, te); for (const xc of xs) for (const s of [-1, 1]) P("pierre", xc + s * .9, y0 - .14, .35, .2, .3, .6, 0, te);
        for (let xr = -W / 2 + .75; xr < W / 2 - .3; xr += 1.2) P("fer", xr, y0 + .66, .9, 1.2, .95, 1); for (const s of [-1, 1]) P("fer", s * (W / 2 - .17), y0 + .66, .46, .9, .95, 1, 0, null, Math.PI / 2); }
      xs.forEach((xc, i) => { P("vitre", xc, yc, .03, 1.15, 2.05, 1); if (al() < .28) P("lumiere", xc, yc, .036, 1.0, 1.9, 1);
        for (const s of [-1, 1]) P("pierre", xc + s * .69, yc, .06, .22, 2.25, .12, 0, te);
        P("pierre", xc, yc - 1.1, .1, 1.62, .1, .22, 0, te);
        if (e === 0 || e === 2) { P("pierre", xc, yc + 1.2, .1, 1.62, .16, .2, 0, te); if ((i + e) % 2 === 0 || e === 0) P("fronton", xc, yc + 1.28, .1, 1.75, .44, .22, 0, te); else P("pierre", xc, yc + 1.42, .12, 1.7, .14, .26, 0, te); }
        else if (e === 1) { P("pierre", xc, yc + 1.22, .14, 1.72, .14, .3, 0, te); for (const s of [-1, 1]) P("pierre", xc + s * .78, yc + 1.06, .14, .14, .32, .24, 0, te); }
        else P("pierre", xc, yc + 1.17, .08, 1.48, .2, .14, 0, te);
        if (!filant) { P("pierre", xc, yc - .98, .22, 1.36, .08, .34, 0, te); P("fer", xc, yc - .56, .38, 1.3, .84, 1); }
        if (al() < (filant ? .25 : .35)) { const zj = filant ? .75 : .3; P("jardin", xc, yc - .86, zj, 1.0, .2, .2, 0, 0x8a4a2a); for (let f = 0; f < 6; f++) P(f % 3 === 2 ? "jardin" : "fleur", xc - .4 + f * .16, yc - .7 + (f % 2) * .06, zj + .02, .1, .09, .1, 0, f % 3 === 2 ? 0x3a6a2a : [0xd8203a, 0xe8487a, 0xd83a2a, 0xf06a8a][(f + i + e) % 4]); } }); }   // (les géraniums aux balcons)
    // la corniche à denticules
    P("pierre", 0, H - .15, .3, W + .5, .42, .7, 0, te); P("pierre", 0, H + .12, .46, W + .7, .14, .96, 0, te); for (let xd = -W / 2 + .1; xd < W / 2; xd += .5) P("pierre", xd, H - .48, .22, .2, .18, .26, 0, te);
    // le toit de zinc à la Mansart, ses lucarnes, les souches de cheminée
    { const t = new THREE.Shape(); t.moveTo(0, 0); t.lineTo(D, 0); t.lineTo(D - 1.1, 3.0); t.lineTo(D / 2, 4.3); t.lineTo(1.1, 3.0); t.closePath(); const g = new THREE.ExtrudeGeometry(t, { depth: W, bevelEnabled: false }); g.rotateY(Math.PI / 2); g.translate(-W / 2, H + .2, 0); mesh(g, zincM, 0, 0, 0); }
    xs.forEach((xc) => { P("pierre", xc, H + 1.5, -.55, 1.2, 1.8, 1.15, 0, te); P("vitre", xc, H + 1.45, .04, .74, 1.2, 1); P("fronton", xc, H + 2.4, -.5, 1.45, .55, 1.2, 0, te); P("zinc", xc, H + 2.62, -1.2, 1.3, .5, 1.3); });
    for (const [cx, cz] of [[-W / 2 + .7, -D / 2], [W / 2 - .7, -D / 2], [0, -D / 2 - .5]]) { P("brique", cx, H + 3.7, cz, 1.0, 2.6, 2.6); P("pierre", cx, H + 5.05, cz, 1.15, .14, 2.75, 0, te); for (let j = 0; j < 4; j++) P("pot", cx, H + 5.4, cz - .9 + j * .6, .14, .55, .14); }
    // le dôme d'angle
    if (coin) { const dx = coin * (W / 2 - 2.6); P("pierre", dx, H + 2.6, -2.6, 4.6, 1.4, 4.6, 0, te); const dm = mesh(new THREE.SphereGeometry(2.3, 18, 9, 0, Math.PI * 2, 0, Math.PI / 2), zincM, dx, H + 3.3, -2.6); dm.scale.y = 1.25;
      P("pierre", dx, H + 6.4, -2.6, .8, .9, .8, 0, te); P("zinc", dx, H + 7.0, -2.6, .3, .9, .3); for (const a of [0, 1, 2, 3]) P("vitre", dx + Math.sin(a * Math.PI / 2) * 2.31, H + 2.6, -2.6 + Math.cos(a * Math.PI / 2) * 2.31, .9, 1.0, 1, 0, null, a * Math.PI / 2); }
    /* (10.149, d'après la photo) la terrasse : deux rangs de guéridons, les chaises bistrot cannées (rouges ou en rotin), le paravent vitré et ses jardinières fleuries, l'ardoise du jour ; un serveur */
    if (cafe && terrasse) { const pw = new THREE.Vector3(0, 0, 0).applyMatrix4(T); if (Math.abs(pw.x - MX) < 9 && Math.abs(pw.z - MZ) < 6) return;
      const W2 = W / 2 - 1.2, hT = TROT, PT = (w, h, d, m, x, y, z, ry = 0) => { const q = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); q.position.set(x, y, z); q.rotation.y = ry; q.applyMatrix4(T); scene.add(q); return q; };
      // le paravent vitré : le cadre de bois, le verre, les jardinières et leurs fleurs ; les côtés
      PT(W2 * 2, .9, .06, vitreP, 0, hT + .55, 4.2); PT(W2 * 2, .08, .14, boisP, 0, hT + 1.02, 4.2); PT(W2 * 2, .12, .12, boisP, 0, hT + .08, 4.2); for (let x = -W2; x <= W2 + .01; x += W2 / 3) PT(.08, 1.0, .1, boisP, x, hT + .55, 4.2);
      for (const s of [-1, 1]) { PT(.06, .9, 2.6, vitreP, s * W2, hT + .55, 2.9); PT(.14, .08, 2.6, boisP, s * W2, hT + 1.02, 2.9); }
      PT(W2 * 2, .3, .32, mat({ color: 0x6a4a2a, roughness: .8 }), 0, hT + 1.22, 4.2); { const qT = (w, h, m, x, y, z, ry = 0, rx = 0) => { const q = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); q.position.set(x, y, z); q.rotation.set(rx, ry, 0); q.applyMatrix4(T); scene.add(q); };
        for (let x = -W2 + .3; x < W2 - .1; x += .55) { const v = (Math.abs(x * 7.3) | 0) % 3; qT(.62, .32, lierreM[0], x, hT + 1.5, 4.2, 0); qT(.62, .32, lierreM[1], x, hT + 1.5, 4.2, Math.PI / 2.3); qT(.62, .32, lierreM[2], x, hT + 1.5, 4.2, -Math.PI / 2.3);   // (la touffe, en croix)
          qT(.6, .95 + v * .18, lierreT[v], x, hT + 1.33 - (.95 + v * .18) / 2, 4.38, 0, .05); qT(.55, .7, lierreT[(v + 1) % 3], x, hT + 1.33 - .35, 4.03, Math.PI, -.05); } }   /* (10.152 : de vraies plantes retombantes — des feuilles de lierre dessinées, des tiges qui pendent, de part et d'autre du paravent) */
      { const ar = new THREE.Vector3(W2 - .4, 0, 4.7).applyMatrix4(T); PT(.6, .85, .05, ardoiseM, W2 - .4, hT + .95, 4.75, .2); for (const s of [-1, 1]) PT(.04, .9, .04, boisP, W2 - .4 + s * .3, hT + .45, 4.75 + .1, .2); OBS.push([ar.x - .4, ar.x + .4, ar.z - .4, ar.z + .4]); }
      { const a1 = new THREE.Vector3(-W2, 0, 1.6).applyMatrix4(T), a2 = new THREE.Vector3(W2, 0, 4.3).applyMatrix4(T); OBS.push([Math.min(a1.x, a2.x), Math.max(a1.x, a2.x), Math.min(a1.z, a2.z), Math.max(a1.z, a2.z)]); }
      const chM = k % 2 ? chaiseR : chaiseM;
      for (const zt of [2.1, 3.4]) for (let lx = -W2 + .9; lx < W2 - .6; lx += 1.75) { const p = new THREE.Vector3(lx, 0, zt).applyMatrix4(T); cyl(.3, .3, .04, tableM, p.x, .74 + hT, p.z, 14); cyl(.03, .03, .72, tableM, p.x, .37 + hT, p.z, 6); cyl(.18, .2, .03, tableM, p.x, hT + .02, p.z, 10);
        for (const sx of [-.55, .55]) { const c = new THREE.Vector3(lx + sx, 0, zt).applyMatrix4(T), cap = Math.atan2(p.x - c.x, p.z - c.z), dx = Math.sin(cap), dz = Math.cos(cap);
          box(.4, .05, .4, chM, c.x, .46 + hT, c.z, cap); box(.4, .42, .04, chM, c.x - dx * .19, .7 + hT, c.z - dz * .19, cap); for (const [ex, ez] of [[-.16, -.16], [.16, -.16], [-.16, .16], [.16, .16]]) cyl(.015, .015, .46, tableM, c.x + ex * Math.cos(cap) + ez * Math.sin(cap), .23 + hT, c.z - ex * Math.sin(cap) + ez * Math.cos(cap), 4);
          (L.tabourets = L.tabourets || []).push([c.x, c.z, cap, .46]); TERR.push([c.x, c.z, cap, T, lx]); } }
      SERV.push({ T, W2, k }); } };
  // le quai, rive gauche : la rangée face à la Seine, coupée par la rue du Petit-Pont
  // une rangée de façades photographiées, en alternant l'immeuble d'angle et le long immeuble ; (x, z) avancent le long de la rangée
  const rangee = (x0, z0, dx, dz, lim, rot, types, terr = true) => { let s = 0, i = 0; const cs = Math.sign(-(dx * Math.cos(rot) - dz * Math.sin(rot))) || 1; while (s < lim) { const t = types[i % types.length], w = LARG[t], c = s + w / 2; immeuble(x0 + dx * c, z0 + dz * c, rot, w, 5, terr, t, i === 0 && t === "angle" ? cs : 0); s += w; i++; } };
  // le quai, rive gauche : la rangée face à la Seine, coupée par la rue du Petit-Pont
  rangee(PP[0] - 4, 46, -1, 0, XS - 10, Math.PI, ["angle", "long", "std", "angle", "long", "std"]);
  rangee(PP[1] + 4, 46, 1, 0, XS - 8, Math.PI, ["angle", "std", "long", "std", "angle"]);
  // la rue du Petit-Pont, qui file vers le sud
  rangee(PP[0] - 4, 58.2, 0, 1, 70, Math.PI / 2, ["std", "angle"], false); rangee(PP[1] + 4, 58.2, 0, 1, 70, -Math.PI / 2, ["angle", "std"], false);
  immeuble(-1, 134, Math.PI, 30, 5, false, "long");
  // l'île : les immeubles du quai, face à la Seine ; ceux qui bordent le parvis, à droite et à gauche
  DPROF = 7.5; rangee(-37, -32, -1, 0, XS - 34, 0, ["angle", "std", "long"], false); DPROF = 12;   /* (10.153 : moins profonds, pour laisser la place aux boutiques de la petite place, derrière) */ rangee(35, -32, 1, 0, XS - 32, 0, ["angle", "long", "std"], false);
  rangee(-36, -67.6, 0, -1, 62, Math.PI / 2, ["std", "angle", "long"]); rangee(34, -44.6, 0, -1, 85, -Math.PI / 2, ["std", "long", "angle"]);
  /* (10.150) à côté du parvis, une petite place pavée toute parisienne : la fontaine à vasques, les lampadaires à deux lanternes, les bornes, les jardinières et deux jeunes arbres ;
     le bistrot au store rouge et sa terrasse, le restaurant bleu nuit, les enseignes en potence ; sur le toit, une grande enseigne lumineuse au néon, allumée le soir */
  NOMF = ["BISTROT CHEZ LÉON", "#7a1414", 1, 0]; immeuble(-46.5, -44.4, Math.PI, 21, 5, true, "std"); NOMF = ["SOUVENIRS DE LA CITÉ", "#1e4a3a", 0, 0]; immeuble(-67.5, -44.4, Math.PI, 21, 5, false, "angle");
  NOMF = ["AUX DÉLICES DE LUTÈCE", "#1a2440", 1, 1]; immeuble(-46.5, -63.6, 0, 21, 5, true, "long"); NOMF = ["CRÈMERIE", "#5a3a20", 0, 0]; immeuble(-67.5, -63.6, 0, 21, 5, false, "std");
  NOMF = ["CAFÉ DE LA PLACE", "#7a1414", 1, 0]; immeuble(-78.4, -54, Math.PI / 2, 19, 5, true, "std"); NOMF = null;
  { const PX = -57, PZ = -54, pierreFt = mat({ color: 0xe2d8c2, roughness: .75 }), eauF = mat({ color: 0x6a98a8, roughness: .1, metalness: .3, emissive: 0x1a4a5a, emissiveIntensity: .1 }), fonteV = mat({ color: 0x1e2a24, metalness: .55, roughness: .45 });
    /* (10.151) la fontaine, plus fine : le bassin octogonal sur ses deux marches, sa margelle moulurée et ses panneaux sculptés ; quatre mascarons de lion qui crachent l'eau ;
       le piédestal à cannelures et ses feuilles d'acanthe ; la grande vasque au bord festonné, la petite vasque, la pomme de pin au sommet ; les nappes d'eau qui retombent, l'eau qui scintille */
    { const pf = mat({ color: 0xe8dfca, roughness: .7 }), pf2 = mat({ color: 0xd2c6ac, roughness: .8 }), eauT2 = tT(128, 128, (c, w, h) => { c.fillStyle = "#4a8aa0"; c.fillRect(0, 0, w, h); for (let i = 0; i < 90; i++) { c.strokeStyle = `rgba(220,245,255,${.15 + al() * .35})`; c.lineWidth = 1 + al() * 2; c.beginPath(); c.arc(al() * w, al() * h, 4 + al() * 14, 0, 1 + al() * 3); c.stroke(); } }, 2, 2);
      const eauM = mat({ map: eauT2, roughness: .05, metalness: .3, emissive: 0x1a4a5a, emissiveIntensity: .15, transparent: true, opacity: .9 }), nappe = new THREE.MeshStandardMaterial({ color: 0xd8f0f8, transparent: true, opacity: .14, depthWrite: false, side: THREE.DoubleSide, roughness: .05, emissive: 0x6a9aaa, emissiveIntensity: .1 });
      const oct = (r, h, y, m) => { const o = cyl(r, r, h, m, PX, y, PZ, 8); o.rotation.y = Math.PI / 8; return o; };
      oct(3.6, .16, .08, pf2); oct(3.3, .16, .24, pf2);   // (les deux marches)
      oct(3.0, .55, .6, pf); oct(3.15, .1, .9, pf); oct(3.05, .06, .38, pf);   // (le bassin, sa margelle et sa plinthe)
      for (let i = 0; i < 8; i++) { const an = i / 8 * Math.PI * 2 + Math.PI / 8 + Math.PI / 8, r = 2.86; const pn = box(1.6, .3, .04, pf2, PX + Math.cos(an) * r, .6, PZ + Math.sin(an) * r); pn.rotation.y = -an + Math.PI / 2; }   // (les panneaux sculptés)
      { const e = cyl(2.8, 2.8, .04, eauM, PX, .8, PZ, 8); e.rotation.y = Math.PI / 8; }
      cyl(.75, .95, .5, pf2, PX, 1.0, PZ, 16); for (let i = 0; i < 16; i++) { const an = i / 16 * Math.PI * 2; box(.08, 1.1, .08, pf2, PX + Math.cos(an) * .55, 1.75, PZ + Math.sin(an) * .55); } cyl(.5, .5, 1.1, pf, PX, 1.75, PZ, 16);   // (le piédestal cannelé)
      for (let i = 0; i < 8; i++) { const an = i / 8 * Math.PI * 2, f = add(new THREE.ConeGeometry(.18, .55, 4), pf, PX + Math.cos(an) * .55, 2.45, PZ + Math.sin(an) * .55); f.rotation.z = Math.cos(an) * .5; f.rotation.x = -Math.sin(an) * .5; }   // (les feuilles d'acanthe)
      cyl(1.7, .55, .45, pf, PX, 2.65, PZ, 28); cyl(1.6, 1.6, .03, eauM, PX, 2.86, PZ, 28); for (let i = 0; i < 28; i++) { const an = i / 28 * Math.PI * 2; add(new THREE.SphereGeometry(.1, 6, 5), pf, PX + Math.cos(an) * 1.72, 2.86, PZ + Math.sin(an) * 1.72); }   // (la grande vasque festonnée)
      { const n1 = new THREE.Mesh(new THREE.CylinderGeometry(1.74, 1.95, 1.95, 28, 1, true), nappe); n1.position.set(PX, 1.85, PZ); scene.add(n1); }
      cyl(.28, .38, 1.1, pf, PX, 3.4, PZ, 12); cyl(.9, .3, .3, pf, PX, 4.05, PZ, 20); cyl(.82, .82, .03, eauM, PX, 4.2, PZ, 20); for (let i = 0; i < 18; i++) { const an = i / 18 * Math.PI * 2; add(new THREE.SphereGeometry(.07, 6, 5), pf, PX + Math.cos(an) * .92, 4.2, PZ + Math.sin(an) * .92); }   // (la petite vasque)
      { const n2 = new THREE.Mesh(new THREE.CylinderGeometry(.93, 1.05, 1.3, 20, 1, true), nappe); n2.position.set(PX, 3.55, PZ); scene.add(n2); }
      cyl(.12, .2, .5, pf, PX, 4.45, PZ, 10); { const pc = add(new THREE.SphereGeometry(.2, 10, 8), pf, PX, 4.85, PZ); pc.scale.y = 1.5; } add(new THREE.ConeGeometry(.08, .3, 8), pf, PX, 5.25, PZ);   // (la pomme de pin)
      { const jet = new THREE.Mesh(new THREE.CylinderGeometry(.03, .06, .6, 6), nappe); jet.position.set(PX, 5.1, PZ); scene.add(jet); }
      // les quatre mascarons de lion sur le piédestal, leur jet d'eau en arc jusqu'au bassin
      for (let i = 0; i < 4; i++) { const an = i / 4 * Math.PI * 2 + Math.PI / 4, cx = Math.cos(an), cz = Math.sin(an); const t2 = add(new THREE.SphereGeometry(.2, 10, 8), pf2, PX + cx * .95, 1.15, PZ + cz * .95); t2.scale.set(1, 1.1, .8);
        for (let j = 0; j < 7; j++) { const u = j / 6, d = .95 + u * 1.3, y = 1.1 - u * u * .35 + u * .1; const g2 = add(new THREE.SphereGeometry(.05 - u * .02, 6, 4), nappe, PX + cx * d, y, PZ + cz * d); void g2; } }
      AMB.push((tm) => { eauT2.offset.set((tm / 9000) % 1, (tm / 13000) % 1); });
      OBS.push([PX - 3.7, PX + 3.7, PZ - 3.7, PZ + 3.7]); }
    /* (10.153 : les bornes noires autour de la fontaine, retirées) */
    // les lampadaires à deux lanternes
    const lanV = mat({ color: 0xfff0d0, emissive: 0xffd890, emissiveIntensity: .1 }); NUIT.push([lanV, .1, 1.8]);
    for (const [x, z] of [[-41, -48], [-41, -60], [-73, -48], [-73, -60]]) { cyl(.07, .14, 4.4, fonteV, x, 2.2, z, 10); cyl(.18, .18, .5, fonteV, x, .25, z, 10); box(1.3, .06, .06, fonteV, x, 4.3, z);
      for (const s of [-1, 1]) { const l = add(new THREE.CylinderGeometry(.2, .13, .48, 8), lanV, x + s * .62, 4.05, z); void l; cyl(.24, .05, .18, fonteV, x + s * .62, 4.36, z, 8); } LAMPES.push([x, 3.9, z]); OBS.push([x - .2, x + .2, z - .2, z + .2]); }
    // les jardinières, les jeunes arbres, les petits buis
    for (const [x, z] of [[-39, -54], [-75, -54]]) { box(1.4, .6, 1.4, pierreFt, x, .3, z); platane(x, z, .55); }
    for (const [x, z] of [[-40, -46.4], [-52, -46.4], [-40, -61.6], [-52, -61.6]]) { box(1.0, .5, .5, mat({ color: 0x5a3a26 }), x, .25, z); add(new THREE.ConeGeometry(.3, .9, 8), mat({ color: 0x2e5a24, roughness: 1 }), x, .95, z); }
    // les enseignes en potence : le bras de fer forgé, le panneau ovale
    const potence = (x, z, ry, txt, fond) => { const T = new THREE.Matrix4().makeRotationY(ry).setPosition(x, 0, z), Pp = (geo, m, px, py, pz) => { const o = new THREE.Mesh(geo, m); o.position.set(px, py, pz); o.applyMatrix4(T); scene.add(o); return o; };
      Pp(new THREE.BoxGeometry(.05, .05, 1.4), fonteV, 0, 5.0, .7); Pp(new THREE.TorusGeometry(.35, .02, 4, 12, Math.PI), fonteV, 0, 4.75, .55).rotation.y = ry + Math.PI / 2;
      const t = tT(256, 160, (c, w, h) => { c.fillStyle = "#1e2a24"; c.beginPath(); c.ellipse(w / 2, h / 2, w / 2 - 2, h / 2 - 2, 0, 0, 7); c.fill(); c.fillStyle = fond; c.beginPath(); c.ellipse(w / 2, h / 2, w / 2 - 12, h / 2 - 12, 0, 0, 7); c.fill(); c.strokeStyle = "#d8b860"; c.lineWidth = 4; c.stroke(); c.fillStyle = "#f2e2a8"; c.font = `italic bold 40px ${serif}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(txt, w / 2, h / 2 + 2); });
      const pm = mat({ map: t, transparent: true, alphaTest: .5, side: THREE.DoubleSide, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: .05 }); NUIT.push([pm, .05, .5]); const pn = new THREE.Mesh(new THREE.PlaneGeometry(1.2, .75), pm); pn.position.set(0, 4.5, 1.1); pn.rotation.y = Math.PI / 2; pn.applyMatrix4(T); scene.add(pn); };
    potence(-41, -44.4 + 0, Math.PI, "Chez Léon", "#7a1414"); potence(-52, -63.6, 0, "Lutèce", "#1a2440"); potence(-78.4, -50, Math.PI / 2, "Café", "#7a1414");
    // la grande enseigne au néon sur le toit, face à la place : l'échafaudage de fer, le cuisinier à la toque, l'arc, le ruban étoilé, les grandes lettres
    { const Y = 24.6, ZS = -66, neT = tT(1024, 640, (c, w, h) => { c.clearRect(0, 0, w, h); c.lineCap = "round";
        c.strokeStyle = "#e8402a"; c.lineWidth = 26; c.beginPath(); c.arc(w / 2, 330, 210, Math.PI * 1.05, Math.PI * 1.95); c.stroke(); c.strokeStyle = "#ffd0a0"; c.lineWidth = 6; c.beginPath(); c.arc(w / 2, 330, 210, Math.PI * 1.05, Math.PI * 1.95); c.stroke();
        c.fillStyle = "#f4f0e8"; c.beginPath(); c.ellipse(w / 2, 120, 46, 70, 0, 0, 7); c.fill(); c.fillRect(w / 2 - 50, 150, 100, 30);   // (la toque)
        c.fillStyle = "#f0c8a0"; c.beginPath(); c.arc(w / 2, 230, 58, 0, 7); c.fill(); c.fillStyle = "#3a2418"; c.beginPath(); c.arc(w / 2 - 20, 220, 6, 0, 7); c.arc(w / 2 + 20, 220, 6, 0, 7); c.fill(); c.strokeStyle = "#3a2418"; c.lineWidth = 5; c.beginPath(); c.arc(w / 2, 245, 20, .2, Math.PI - .2); c.stroke(); c.fillStyle = "#5a3a22"; c.beginPath(); c.ellipse(w / 2 - 22, 262, 22, 7, .2, 0, 7); c.ellipse(w / 2 + 22, 262, 22, 7, -.2, 0, 7); c.fill();   // (le visage, la moustache)
        c.fillStyle = "#f4f0e8"; c.beginPath(); c.ellipse(w / 2, 340, 120, 60, 0, 0, 7); c.fill(); for (const s of [-1, 1]) { c.fillStyle = "#e8a050"; c.beginPath(); c.arc(w / 2 + s * 130, 330, 42, 0, 7); c.fill(); }   // (le buste, les deux miches de pain)
        c.fillStyle = "#1e3a7a"; c.beginPath(); c.moveTo(150, 360); c.lineTo(w - 150, 360); c.lineTo(w - 120, 400); c.lineTo(w - 150, 440); c.lineTo(150, 440); c.lineTo(120, 400); c.closePath(); c.fill(); c.fillStyle = "#ffd040"; for (let i = 0; i < 5; i++) { const sx = w / 2 - 160 + i * 80, sy = 400; c.beginPath(); for (let j = 0; j < 10; j++) { const r = j % 2 ? 9 : 20, an = j / 10 * Math.PI * 2 - Math.PI / 2; c.lineTo(sx + Math.cos(an) * r, sy + Math.sin(an) * r); } c.fill(); }
        c.font = `bold 150px ${serif}`; { const k = Math.min(1, (w - 70) / c.measureText("CHEZ AUGUSTE").width); c.font = `bold ${Math.floor(150 * k)}px ${serif}`; } c.textAlign = "center";   /* (10.153 : le mot entier tient dans l'enseigne) */ c.lineWidth = 22; c.strokeStyle = "#c82a1a"; c.strokeText("CHEZ AUGUSTE", w / 2, 590); c.lineWidth = 6; c.strokeStyle = "#ffd8b0"; c.strokeText("CHEZ AUGUSTE", w / 2, 590); });
      void neT; const neI = new THREE.TextureLoader().load("images/notredame/enseigne-auguste.webp?v=1"); neI.colorSpace = THREE.SRGBColorSpace; neI.anisotropy = 8;   /* (10.157 : l'enseigne LED « Chez Auguste », celle de l'image) */
      const neM = new THREE.MeshStandardMaterial({ map: neI, transparent: true, alphaTest: .35, side: THREE.DoubleSide, emissive: 0xffffff, emissiveMap: neI, emissiveIntensity: .35, roughness: .6 }); NUIT.push([neM, .35, 1.5]);
      { const lr = new THREE.PointLight(0xff2a2a, 0, 26, 1.6), lb = new THREE.PointLight(0x2a5aff, 0, 22, 1.6); lr.position.set(-49.5, Y + 3.5, ZS + 3); lb.position.set(-43.5, Y + 4.5, ZS + 3); lr.visible = lb.visible = false; scene.add(lr, lb);
        NUIT.push([{ set emissiveIntensity(v) { const on = v > .5; lr.visible = lb.visible = on; lr.intensity = on ? 70 : 0; lb.intensity = on ? 45 : 0; } }, 0, 1]); }   // (le soir : les lueurs rouge et bleue des LED sur le toit)
      const ne = new THREE.Mesh(new THREE.PlaneGeometry(14, 11.8), neM); ne.position.set(-46.5, Y + 5.2, ZS); scene.add(ne);
      for (let x = -54; x <= -39; x += 2.5) { box(.12, 9, .12, fonteV, x, Y + 4.5, ZS - .6); } for (const y of [Y + 1, Y + 4.5, Y + 8]) box(16, .1, .1, fonteV, -46.5, y, ZS - .6); for (let x = -54; x < -39; x += 2.5) { const d = box(.08, 3.8, .08, fonteV, x + 1.25, Y + 2.75, ZS - .6); d.rotation.z = .6; }
      void Y; } }
  for (const [kk, im] of IM.fin()) if (kk === "lumiere") { im.visible = false; L.nuitObjets.push(im); }
  /* (10.148) la bouche de métro Saint-Michel – Notre-Dame, comme celle des Abbesses à Montmartre : la marquise d'Hector Guimard (l'éventail de verre, les nervures et les piliers de fonte verte,
     le cartouche « METROPOLITAIN »), la rambarde à écussons, les marches qui descendent sous le trottoir, les globes, le panneau bleu ; on y entre à l'est, dans le sens de la marche */
  { const G = new THREE.Group(); G.position.set(MX, TROT, MZ); G.rotation.y = -Math.PI / 2; scene.add(G);
    const gb = (w, h, d, m, x, y, z, par = G) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); par.add(o); return o; }, gc = (rt, rb, h, m, x, y, z, s = 10) => { const o = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, s), m); o.position.set(x, y, z); G.add(o); return o; };
    const vertG = mat({ color: 0x2e5a44, roughness: .4, metalness: .55 }), verre = mat({ color: 0xe8ece4, transparent: true, opacity: .8, roughness: .3, side: THREE.DoubleSide, emissive: 0xfff4e0, emissiveIntensity: .05 }), pierreG = mat({ color: 0xe4dccc, roughness: .85 }), esc = mat({ color: 0x9a948a }), carM = mat({ color: 0xe8e4da, roughness: .4 });
    NUIT.push([verre, .05, .5]);
    const X0 = -1.75, X1 = 1.75, ZA = -2.4, ZB = 2.6;
    for (let i = 0; i < 12; i++) gb(3.1, .17, .42, esc, 0, -.085 - i * .17, ZA + .2 + i * .42); gb(3.4, 3.4, .5, mat({ color: 0x1a1a1a }), 0, -1.9, ZB + .1);
    for (const x of [-1.62, 1.62]) gb(.14, 2.6, ZB - ZA + .3, carM, x, -1.3, (ZA + ZB) / 2); gb(3.4, .1, 1.2, esc, 0, -2.09, ZB - .4); gb(3.5, .1, ZB - ZA, mat({ color: 0x2a2622 }), 0, -2.3, (ZA + ZB) / 2);
    for (const x of [X0, X1]) gb(.35, .55, ZB - ZA, pierreG, x, .27, (ZA + ZB) / 2); gb(X1 - X0 + .35, .55, .35, pierreG, 0, .27, ZB);
    const globe = mat({ color: 0xfff0c0, emissive: 0xffe0a0, emissiveIntensity: .6 }); NUIT.push([globe, .6, 2.4]); for (let i = 0; i < 5; i++) { const o = new THREE.Mesh(new THREE.SphereGeometry(.13, 12, 10), globe); o.position.set(-1.1 + i * .55, -.55, ZB - .18); G.add(o); }
    { const t = tT(512, 64, (c, w, h) => { c.fillStyle = "#1a2a5a"; c.fillRect(0, 0, w, h); c.fillStyle = "#fff"; c.font = "bold 34px Arial"; c.textBaseline = "middle"; c.fillText("St-Michel", 110, h / 2 + 2); c.beginPath(); c.arc(40, h / 2, 22, 0, 7); c.fillStyle = "#b02a8a"; c.fill(); c.fillStyle = "#fff"; c.font = "bold 24px Arial"; c.textAlign = "center"; c.fillText("4", 40, h / 2 + 2); });
      gb(3, .38, .05, mat({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: .2 }), 0, -1.05, ZB - .16); }
    const ecu = new THREE.TorusGeometry(.2, .03, 6, 16);
    for (const [ax, az, bx, bz] of [[X0, ZA + .3, X0, ZB], [X1, ZA + .3, X1, ZB], [X0, ZB, X1, ZB]]) { const l = Math.hypot(bx - ax, bz - az), along = az === bz;
      gb(along ? l : .05, .05, along ? .05 : l, vertG, (ax + bx) / 2, 1.5, (az + bz) / 2); gb(along ? l : .04, .04, along ? .04 : l, vertG, (ax + bx) / 2, .62, (az + bz) / 2);
      for (let t = 0; t < l; t += .16) gb(.025, .9, .025, vertG, ax + (bx - ax) * t / l, 1.06, az + (bz - az) * t / l);
      for (let t = .6; t < l - .3; t += 1.2) { const e = new THREE.Mesh(ecu, vertG); e.position.set(ax + (bx - ax) * t / l, 1.08, az + (bz - az) * t / l); e.rotation.y = along ? 0 : Math.PI / 2; G.add(e); } }
    for (const [x, z, h] of [[X0, ZA, 3.5], [X1, ZA, 3.5], [X0, ZB - .3, 3.0], [X1, ZB - .3, 3.0]]) { gc(.07, .16, h, vertG, x, h / 2 + .5, z); gc(.2, .26, .5, vertG, x, .25, z); const s = new THREE.Mesh(new THREE.SphereGeometry(.1, 8, 6), vertG); s.position.set(x, h + .5, z); G.add(s); }
    const lan = mat({ color: 0xf0e8c8, emissive: 0xffd890, emissiveIntensity: .1 }); NUIT.push([lan, .1, 2.2]); for (const x of [X0 - .15, X1 + .15]) { const l = new THREE.Mesh(new THREE.SphereGeometry(.14, 10, 8), lan); l.position.set(x, 3.05, ZA + .2); l.scale.y = 1.4; G.add(l); }
    { const C = new THREE.Group(); C.position.set(0, 3.55, ZB - .3); C.rotation.x = -.16; G.add(C); const rx = 2.25, rz = 3.6;
      const sh = new THREE.Shape(); sh.moveTo(rx, 0); for (let i = 1; i <= 24; i++) { const an = i / 24 * Math.PI; sh.lineTo(Math.cos(an) * rx, Math.sin(an) * rz); } sh.lineTo(rx, 0);
      const vg = new THREE.Mesh(new THREE.ShapeGeometry(sh), verre); vg.position.y = .55; vg.rotation.x = Math.PI / 2; C.add(vg);
      const pts = []; for (let i = 0; i <= 32; i++) { const an = i / 32 * Math.PI; pts.push(new THREE.Vector3(Math.cos(an) * rx, .55, -Math.sin(an) * rz)); } C.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, .06, 6), vertG));
      for (let i = 0; i <= 10; i++) { const an = i / 10 * Math.PI, ex = Math.cos(an) * rx, ez = -Math.sin(an) * rz, l = Math.hypot(ex, ez), nn = gb(.05, .06, l, vertG, ex / 2, .58, ez / 2, C); nn.rotation.y = Math.atan2(ex, ez); }
      gb(rx * 2 + .1, .1, .1, vertG, 0, .55, 0, C); }
    { const t = tT(1024, 220, (c, w, h) => { c.fillStyle = "#2e5a44"; c.beginPath(); c.ellipse(w / 2, h / 2, w / 2 - 2, h / 2 - 2, 0, 0, 7); c.fill(); c.fillStyle = "#efe2a0"; c.beginPath(); c.ellipse(w / 2, h / 2, w / 2 - 22, h / 2 - 22, 0, 0, 7); c.fill();
        c.fillStyle = "#1e4a36"; c.textAlign = "center"; c.textBaseline = "middle"; c.font = "bold 96px Georgia, serif"; c.save(); c.translate(w / 2, h / 2 + 6); const k = Math.min(1, (w - 190) / c.measureText("METROPOLITAIN").width); c.scale(k, 1.1); c.fillText("METROPOLITAIN", 0, 0); c.restore(); });
      const m = mat({ map: t, transparent: true, alphaTest: .5, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: .08 }); NUIT.push([m, .08, .9]); for (const [dz, r] of [[.02, Math.PI], [-.02, 0]]) { const pp = new THREE.Mesh(new THREE.PlaneGeometry(3.2, .7), m); pp.position.set(0, 3.35, ZA + dz); pp.rotation.y = r; G.add(pp); } }
    G.updateMatrixWorld(true);
    L.metroND = { x: MX + 3.0, z: MZ }; OBS.push([HX0 - .1, HX1 + .1, HZ0 - .05, HZ1]); }

  /* ---------- le pont de pierre : trois arches, les piles et leurs avant-becs, les demi-lunes et leurs réverbères, la balustrade, la corniche ; le bas-port passe dessous ---------- */
  { const [x0, x1] = PP, W = x1 - x0, cx = (x0 + x1) / 2;
    sol(x0 + 2.4, x1 - 2.4, -25.6, 25.6, routeM, .03); sol(x0, x0 + 2.4, -25.6, 25.6, trottM, .06); sol(x1 - 2.4, x1, -25.6, 25.6, trottM, .06); for (const sx of [x0 + 2.4, x1 - 2.4]) box(.2, .14, 51.2, quaiM, sx, .07, 0);
    const a = new THREE.Shape(); a.moveTo(-25.6, 0); a.lineTo(25.6, 0); a.lineTo(25.6, YE - .2); a.lineTo(22.56, YE - .2); a.lineTo(22.56, -1.5); a.lineTo(18, -1.5); a.lineTo(18, YE - .2);
    for (const [c, r, s0, rv] of [[12.7, 4.3, -5.0, 3.6], [0, 7, -5.2, 4.3], [-12.7, 4.3, -5.0, 3.6]]) { a.lineTo(c + r, YE - .2); a.lineTo(c + r, s0); a.absellipse(c, s0, r, rv, 0, Math.PI, false); a.lineTo(c - r, YE - .2); }   /* (l'arche du milieu, la plus haute : les bateaux-mouches passent dessous) */
    a.lineTo(-18, YE - .2); a.lineTo(-18, -1.5); a.lineTo(-22.56, -1.5); a.lineTo(-22.56, YE - .2);   /* (10.154 : un poil en retrait du mur du quai — plus de mur qui tremble sous le pont) */ a.lineTo(-25.6, YE - .2); a.closePath();
    const ag = new THREE.ExtrudeGeometry(a, { depth: W, bevelEnabled: false, curveSegments: 18 }); { const uv = ag.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / TUILE, uv.getY(i) / TUILE); } ag.rotateY(Math.PI / 2); add(ag, murM, x0, 0, 0);
    // la corniche, ses consoles
    for (const [sx, d] of [[x0, -1], [x1, 1]]) { box(.5, .3, 51.4, quaiM, sx + d * .1, -.3, 0); for (let z = -24; z <= 24; z += 1.6) box(.25, .45, .3, quaiM, sx + d * .2, -.6, z);
      // les piles et leurs avant-becs arrondis, les demi-lunes au-dessus, avec leur réverbère
      for (const zc of [-7.7, 7.7]) { const ab = new THREE.Mesh(new THREE.CylinderGeometry(.85, .85, 5, 14, 1, false, d > 0 ? 0 : Math.PI, Math.PI), murM); ab.position.set(sx, -4.1, zc); scene.add(ab);
        const co = new THREE.Mesh(new THREE.CylinderGeometry(1.7, .85, 1.2, 14, 1, false, d > 0 ? 0 : Math.PI, Math.PI), quaiM); co.position.set(sx, -1.0, zc); scene.add(co);
        const dl = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, .4, 16, 1, false, d > 0 ? 0 : Math.PI, Math.PI), quaiM); dl.position.set(sx, -.2, zc); scene.add(dl);
        for (let k = 0; k <= 10; k++) { const t = (d > 0 ? 0 : Math.PI) + k / 10 * Math.PI, bx = sx + Math.sin(t) * 1.55, bz = zc + Math.cos(t) * 1.55; cyl(.06, .08, .8, quaiM, bx, .4, bz, 6); }
        const tor = new THREE.Mesh(new THREE.TorusGeometry(1.55, .09, 4, 16, Math.PI), quaiM); tor.rotation.set(-Math.PI / 2, 0, d > 0 ? -Math.PI / 2 : Math.PI / 2); tor.position.set(sx, .86, zc); scene.add(tor);
        reverbere(sx + d * 1.1, zc); }
      // la balustrade : la lisse basse, les balustres, la main courante, les dés
      box(.4, .12, 51.2, quaiM, sx - d * .2, .06, 0); box(.44, .14, 51.2, quaiM, sx - d * .2, .93, 0);
      for (let z = -25.2; z <= 25.2; z += 4.2) box(.5, 1.05, .5, quaiM, sx - d * .2, .52, z); }
    { const pos = []; for (const sx of [x0 + .2, x1 - .2]) for (let z = -25; z <= 25; z += .32) pos.push([sx, z]);
      const im = new THREE.InstancedMesh(new THREE.CylinderGeometry(.06, .09, .74, 6), quaiM, pos.length), m4 = new THREE.Matrix4(); pos.forEach(([x, z], i) => { m4.makeTranslation(x, .5, z); im.setMatrixAt(i, m4); }); scene.add(im); }
    void cx; }

  const i0ND = scene.children.length;
  /* ---------- Notre-Dame ---------- */
  const PIERRE = "#d6cbb0";
  const ND = { x0: -26, x1: 92, z0: -78, z1: -40 }, CZ = (ND.z0 + ND.z1) / 2;   // la nef, de la façade (à l'ouest, vers le parvis) au chevet
  { const pierre = mat({ color: 0xd6cbb0, roughness: .85 }), pierreS = mat({ color: 0xbfb398, roughness: .9 }), plomb = mat({ color: 0x8a98a6, roughness: .4, metalness: .45 }), vitrail = mat({ color: 0x1a2440, roughness: .2, metalness: .3, emissive: 0x2a3a8a, emissiveIntensity: .05 });
    NUIT.push([vitrail, .05, .5]);
    // la façade : les trois portails, la galerie des rois, la rose et ses baies, la galerie à claire-voie, les deux tours et leurs grandes baies
    const facT = 0 ? tT(1024, 1600, (c, w, h) => {   /* (l'ancienne façade dessinée, remplacée par l'image)*/ c.fillStyle = PIERRE; c.fillRect(0, 0, w, h); const sx = w / 40, sy = h / 63;
      for (let i = 0; i < 2600; i++) { c.fillStyle = `rgba(${al() < .5 ? "120,110,90" : "255,250,235"},${al() * .08})`; c.fillRect(al() * w, al() * h, 3 + al() * 20, 2 + al() * 8); }
      for (let y = 0; y < h; y += 14) { c.fillStyle = "rgba(110,95,70,.12)"; c.fillRect(0, y, w, 1); }
      const Y = (m) => h - m * sy, X = (m) => (m + 20) * sx;
      const ogive = (cx, b, lg, ht, fill, n = 0) => { c.fillStyle = fill; c.beginPath(); c.moveTo(X(cx - lg / 2), Y(b)); c.lineTo(X(cx - lg / 2), Y(b + ht - lg * .6)); c.quadraticCurveTo(X(cx - lg / 2), Y(b + ht), X(cx), Y(b + ht)); c.quadraticCurveTo(X(cx + lg / 2), Y(b + ht), X(cx + lg / 2), Y(b + ht - lg * .6)); c.lineTo(X(cx + lg / 2), Y(b)); c.closePath(); c.fill();
        for (let k = 1; k <= n; k++) { c.strokeStyle = `rgba(90,78,60,${.5 - k * .08})`; c.lineWidth = 3; c.beginPath(); const e = k * .35; c.moveTo(X(cx - lg / 2 - e), Y(b)); c.lineTo(X(cx - lg / 2 - e), Y(b + ht - lg * .6)); c.quadraticCurveTo(X(cx - lg / 2 - e), Y(b + ht + e), X(cx), Y(b + ht + e)); c.quadraticCurveTo(X(cx + lg / 2 + e), Y(b + ht + e), X(cx + lg / 2 + e), Y(b + ht - lg * .6)); c.lineTo(X(cx + lg / 2 + e), Y(b)); c.stroke(); } };
      // les contreforts verticaux
      for (const x of [-20, -13.3, -6.8, 6.8, 13.3, 20]) { c.fillStyle = "rgba(150,135,105,.35)"; c.fillRect(X(x) - 6, 0, 12, Y(0)); }
      // les trois portails (Sainte-Anne, le Jugement dernier, la Vierge), leurs tympans sculptés
      for (const [cx, lg] of [[-10, 5.4], [0, 6.2], [10, 5.4]]) { ogive(cx, 0, lg + 2.4, 11, "#a89a7c", 0); ogive(cx, 0, lg, 9.5, "#5a4e3c", 5);
        c.fillStyle = "#c8bc9e"; c.fillRect(X(cx - lg / 2), Y(5.2), lg * sx, 2.2 * sy); for (let k = 0; k < 9; k++) { c.fillStyle = "rgba(90,78,60,.6)"; c.fillRect(X(cx - lg / 2) + k * lg * sx / 9 + 2, Y(5.2), 3, 2.2 * sy); }
        c.fillStyle = "#3a2e22"; c.fillRect(X(cx - lg / 4), Y(3.6), lg / 2 * sx, 3.6 * sy); c.fillStyle = "#c8bc9e"; c.fillRect(X(cx) - 3, Y(3.6), 6, 3.6 * sy); }
      // la galerie des rois : vingt-huit statues sous leurs arcades
      c.fillStyle = "#c2b698"; c.fillRect(X(-19), Y(17), 38 * sx, 3.4 * sy); for (let k = 0; k < 28; k++) { const x = X(-18.5) + k * 37 * sx / 28; ogive(-18.5 + k * 37 / 28 + .66, 13.8, 1.1, 3.0, "#8a7c60"); c.fillStyle = "#e0d4b6"; c.fillRect(x + 6, Y(16.2), 10, 2.2 * sy); c.beginPath(); c.arc(x + 11, Y(16.5), 6, 0, 7); c.fill(); }
      c.fillStyle = "#b8ac8e"; c.fillRect(X(-20), Y(17.3), 40 * sx, 6);
      // la rose ouest, et de chaque côté les deux grandes baies géminées
      { const rx = X(0), ry = Y(25.5), R = 4.8 * sx; c.fillStyle = "#a89a7c"; c.beginPath(); c.arc(rx, ry, R * 1.18, 0, 7); c.fill(); const g = c.createRadialGradient(rx, ry, 4, rx, ry, R); g.addColorStop(0, "#d8a83a"); g.addColorStop(.35, "#2a3a8a"); g.addColorStop(.7, "#8a1a2a"); g.addColorStop(1, "#1a2a6a"); c.fillStyle = g; c.beginPath(); c.arc(rx, ry, R, 0, 7); c.fill();
        c.strokeStyle = "#c8bc9e"; c.lineWidth = 4; for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2; c.beginPath(); c.moveTo(rx + Math.cos(a) * R * .25, ry + Math.sin(a) * R * .25); c.lineTo(rx + Math.cos(a) * R, ry + Math.sin(a) * R); c.stroke(); } for (const r of [.25, .55, .8, 1]) { c.beginPath(); c.arc(rx, ry, R * r, 0, 7); c.stroke(); } }
      for (const cx of [-10, 10]) { ogive(cx, 20.5, 6, 9, "#a89a7c"); for (const dx of [-1.5, 1.5]) ogive(cx + dx, 21, 2.2, 7.5, "#2a2e3a"); }
      // la grande galerie à claire-voie, au-dessus de la rose
      c.fillStyle = "#c2b698"; c.fillRect(X(-20), Y(34), 40 * sx, 6); for (let k = 0; k < 18; k++) ogive(-18.4 + k * 2.15, 34.4, 1.3, 5.6, "#3a3428");
      // les deux tours : leurs baies immenses, à abat-son
      for (const cx of [-13.4, 13.4]) { for (const dx of [-3, 3]) { ogive(cx + dx, 42, 3.2, 15.5, "#8a7c60"); ogive(cx + dx, 42.5, 2.4, 14.5, "#2e2a24"); for (let k = 0; k < 10; k++) { c.fillStyle = "rgba(160,150,130,.55)"; c.fillRect(X(cx + dx - 1.2), Y(43 + k * 1.3), 2.4 * sx, 4); } } }
      c.fillStyle = "#c2b698"; c.fillRect(X(-20), Y(41.5), 40 * sx, 6); c.fillRect(0, Y(60), w, 10);
      for (let k = 0; k < 40; k++) { c.fillStyle = "#b0a486"; c.fillRect(X(-20) + k * sx, Y(62), sx * .6, Y(60) - Y(62)); }   // la balustrade du sommet
      // entre les tours, au-dessus de la galerie : le ciel (la façade s'arrête)
      c.clearRect(X(-7), 0, 14 * sx, Y(41.5));
    }) : null;
    const FX = ND.x0, FH = 63;
    /* ---------- (en relief, d'après les images) la façade occidentale : les contreforts et leurs retraites ; les trois portails et leurs voussures peuplées de statuettes,
       les statues des ébrasements, les tympans sculptés, les vantaux de bois ; la galerie des rois et ses vingt-huit statues ; la galerie de la Vierge ;
       la grande rose et ses rayons, les baies géminées et leurs oculus ; la grande galerie à colonnettes ; les tours et leurs immenses baies à abat-son ---------- */
    { const MF = new THREE.Matrix4().set(0, 0, -1, FX, 0, 1, 0, 0, 1, 0, 0, CZ, 0, 0, 0, 1);   // (u : le long de la façade ; v : la hauteur ; w : vers le parvis)
      const MSp = new THREE.Matrix4().set(1, 0, 0, FX + 6.6, 0, 1, 0, 0, 0, 0, 1, CZ + 19.9, 0, 0, 0, 1), MSm = new THREE.Matrix4().set(-1, 0, 0, FX + 6.6, 0, 1, 0, 0, 0, 0, -1, CZ - 19.9, 0, 0, 0, 1);   // (les faces de côté des tours)
      const NI = mkInst(), pierreF = mat({ map: pierreFinT, color: 0xe6dcc6, roughness: .85, emissive: 0xffe8c0, emissiveIntensity: 0 }), murF = mat({ map: murT, color: 0xe2d8c2, roughness: .9, emissive: 0xffe8c0, emissiveMap: murT, emissiveIntensity: 0 });
      pierreF.emissive.setHex(0xff9a40); murF.emissive.setHex(0xff9a40); NUIT.push([pierreF, 0, .1], [murF, 0, .08]);   /* (10.154 : une lueur ambrée discrète ; ce sont les projecteurs qui sculptent la pierre) */   /* (10.149 : la nuit, la façade dorée, illuminée comme sur les photos) */
      const ombreF = mat({ color: 0x9a8f7a, roughness: 1 }), voussF = mat({ map: pierreFinT, color: 0xcfc3a8, roughness: .9 }), noirF = mat({ color: 0x24211c, roughness: 1 }), boisF = mat({ color: 0x5a3a22, roughness: .7 });
      const vitrT = tT(256, 256, (c, w, h) => { c.fillStyle = "#1a2450"; c.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { c.fillStyle = ["#2a3c9a", "#9a1a2a", "#d8a83a", "#1a5a8a", "#6a1a6a", "#2a6a3a"][(al() * 6) | 0]; c.fillRect(al() * w, al() * h, 6, 6); } c.strokeStyle = "rgba(10,10,20,.8)"; c.lineWidth = 1.5; for (let x = 0; x < w; x += 6) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); c.beginPath(); c.moveTo(0, x); c.lineTo(w, x); c.stroke(); } });
      const vitrM = mat({ map: vitrT, roughness: .2, metalness: .3, emissive: 0xffffff, emissiveMap: vitrT, emissiveIntensity: .04 }); NUIT.push([vitrM, .04, .7]);
      const tympT = tT(256, 320, (c, w, h) => { c.fillStyle = "#d6caae"; c.fillRect(0, 0, w, h); const fig = (x, y, s, t) => { c.fillStyle = `rgba(${t},.55)`; c.beginPath(); c.ellipse(x, y, s * .45, s, 0, 0, 7); c.fill(); c.beginPath(); c.arc(x, y - s * 1.25, s * .32, 0, 7); c.fill(); };
        for (const [y0, n, s] of [[130, 14, 9], [92, 9, 12]]) { c.fillStyle = "rgba(120,105,80,.5)"; c.fillRect(0, y0 + s + 4, w, 4); for (let i = 0; i < n; i++) fig(18 + i * (w - 36) / (n - 1), y0, s, i % 2 ? "120,104,80" : "150,134,108"); }
        c.fillStyle = "rgba(120,104,80,.45)"; c.beginPath(); c.ellipse(w / 2, 48, 26, 34, 0, 0, 7); c.fill(); fig(w / 2, 52, 18, "110,96,72"); for (const s of [-1, 1]) fig(w / 2 + s * 62, 60, 13, "130,114,90"); });
      const tympM = mat({ map: tympT, roughness: .9 });
      const fm = (M, g, m) => { const o = new THREE.Mesh(g, m); o.applyMatrix4(M); o.receiveShadow = true; scene.add(o); return o; };
      const fbox = (u0, u1, v0, v1, w0, w1, m = murF, M = MF) => { const W = u1 - u0, Hh = v1 - v0, Dd = w1 - w0, g = uvBox(new THREE.BoxGeometry(W, Hh, Dd), W, Hh, Dd, 4); g.translate((u0 + u1) / 2, (v0 + v1) / 2, (w0 + w1) / 2); return fm(M, g, m); };
      const ogP = (hw, hs, n = 9) => { const R = 1.6 * hw, c = R - hw, a1 = Math.acos(-c / R), G = []; for (let i = 0; i <= n; i++) { const a = Math.PI - (Math.PI - a1) * i / n; G.push([c + R * Math.cos(a), hs + R * Math.sin(a)]); } const D2 = G.slice(0, n).reverse().map(([x, y]) => [-x, y]); return [[-hw, 0], ...G, ...D2, [hw, 0]]; };
      const apex = (hw, hs) => hs + hw * Math.sqrt(2.2);
      const shp = (pts) => { const s = new THREE.Shape(); s.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) s.lineTo(p[0], p[1]); return s; };
      const anneau = (hw, hs, t, dep, u, v, w, m = pierreF, M = MF) => { const g = new THREE.ExtrudeGeometry(shp([...ogP(hw + t, hs), ...ogP(hw, hs).reverse()]), { depth: dep, bevelEnabled: false }); g.translate(u, v, w - dep); return fm(M, g, m); };
      const plein = (hw, hs, m, u, v, w, M = MF) => { const g = new THREE.ShapeGeometry(shp(ogP(hw, hs))), uv = g.attributes.uv, P2 = g.attributes.position, ap = apex(hw, hs); for (let i = 0; i < uv.count; i++) uv.setXY(i, (P2.getX(i) + hw) / (2 * hw), P2.getY(i) / ap); g.translate(u, v, w); return fm(M, g, m); };
      const surArc = (hw, hs, pas, f) => { const pts = ogP(hw, hs, 16).slice(1, -1); for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], d = Math.hypot(x1 - x0, y1 - y0); for (let s = 0; s < d; s += pas) f(x0 + (x1 - x0) * s / d, y0 + (y1 - y0) * s / d); } };
      NI.def("p", ub, pierreF); NI.def("col", new THREE.CylinderGeometry(1, 1, 1, 8), pierreF); NI.def("stat", new THREE.CapsuleGeometry(1, 1, 3, 8), mat({ color: 0xd2c6aa, roughness: .9 })); NI.def("tete", new THREE.SphereGeometry(1, 8, 6), mat({ color: 0xd2c6aa, roughness: .9 }));
      NI.def("pin", new THREE.ConeGeometry(1, 1, 4), pierreF); NI.def("tore", new THREE.TorusGeometry(1, .12, 4, 14), pierreF);
      { const g = new THREE.ExtrudeGeometry(shp([...ogP(.5, 0), ...ogP(.38, 0).reverse()]), { depth: 1, bevelEnabled: false }); g.translate(0, 0, -.5); NI.def("arc", g, pierreF); }
      const F = (k, u, v, w, su, sv, sw, rz = 0, rx = 0, M = MF) => NI.P(k, M, u, v, w, su, sv, sw, rx, null, 0, rz);
      const statue = (u, v, w, s = 1, M = MF) => { F("stat", u, v, w, .2 * s, .42 * s, .2 * s, 0, 0, M); F("tete", u, v + .82 * s, w, .17 * s, .19 * s, .17 * s, 0, 0, M); };
      // le mur, le recul de la grande galerie, les tours
      fbox(-20, -3.1, 0, 33, -2, 0); fbox(3.1, 20, 0, 33, -2, 0); fbox(-3.1, 3.1, 10.4, 33, -2, 0);   /* (10.159 : le portail central, ouvert) */ fbox(-20, 20, 33, 42.6, -3, -1, ombreF); for (const s of [-1, 1]) fbox(s > 0 ? 6.8 : -20, s > 0 ? 20 : -6.8, 42.6, 63, -2, 0);
      // les contreforts, leurs retraites, leurs pinacles ; une statue dans la niche de chacun
      for (const u of [-19.2, -6.9, 6.9, 19.2]) { fbox(u - .9, u + .9, 0, 11, 0, 1.7); fbox(u - .85, u + .85, 11, 33, 0, 1.25); fbox(u - .8, u + .8, 33, 42.6, 0, .95); fbox(u - .7, u + .7, 42.6, 61, 0, .7);
        F("pin", u, 62.8, .35, .55, 3.6, .55); statue(u, 7.4, 1.95, 1.3); F("p", u, 6.4, 1.85, .7, .2, .5); }
      // les trois portails
      for (const [c, hw, hs] of [[-13.4, 2.5, 5.2], [0, 3.0, 5.8], [13.4, 2.5, 5.2]]) { const NR = 5, t = .34;
        for (let k = 1; k <= NR; k++) { anneau(hw + (k - 1) * t, hs, t, .3 + k * .24, c, 0, k * .24, k % 2 ? pierreF : voussF);
          if (k % 2 === 0) surArc(hw + (k - .5) * t, hs, .5, (x, y) => { if (y > hs - .2) F("stat", c + x, y, k * .24 + .08, .1, .14, .1); });
          if (k <= 4) for (const s of [-1, 1]) { statue(c + s * (hw + (k - .5) * t), 2.4, k * .24 + .12, 1); F("p", c + s * (hw + (k - .5) * t), 1.6, k * .24, .3, .25, .3); } }
        if (c === 0) plein(hw, hs - 5.5, tympM, c, 5.5, .025); else plein(hw, hs, tympM, c, 0, .025);
        if (c === 0) for (const s of [-1, 1]) { const gv = new THREE.BoxGeometry(2.55, 4.5, .12); gv.translate(-s * 1.27, 2.25, 0); gv.rotateY(-s * (Math.PI / 2 - .25)); gv.translate(c + s * hw, 0, -.25); fm(MF, gv, boisF); }   // (les vantaux grands ouverts, vers l'intérieur)
        else for (const s of [-1, 1]) { fbox(s > 0 ? c + .25 : c - hw + .05, s > 0 ? c + hw - .05 : c - .25, 0, 4.6, -.2, .06, boisF); for (const v of [1, 2.4, 3.8]) F("p", c + s * hw / 2, v, .08, hw - .5, .06, .03); }
        F("p", c, 2.3, .15, .55, 4.6, .45); statue(c, 2.9, .45, 1.15);
        fbox(c - hw, c + hw, 4.6, 5.5, -.2, .14, pierreF); for (let x = c - hw + .3; x < c + hw - .2; x += .42) F("stat", x, 5.05, .18, .11, .16, .08); }
      // la frise au-dessus des portails, ses consoles
      fbox(-20.2, 20.2, 10.9, 11.5, 0, 1.0, pierreF); for (let u = -19.8; u < 20; u += .6) F("p", u, 10.72, .62, .22, .3, .7);
      // la galerie des rois : vingt-huit statues sous leurs arcatures
      fbox(-19, 19, 11.5, 16.2, -.04, .02, ombreF);
      for (let i = 0; i <= 28; i++) { const u = -18.9 + i * 37.8 / 28; F("col", u, 13.6, .42, .12, 3.6, .12); if (i < 28) { const um = u + 37.8 / 56; F("arc", um, 15.45, .42, 1.25, 1.1, .3); statue(um, 13.4, .3, 1.15); F("p", um, 14.62, .3, .28, .1, .28); } }
      fbox(-20.2, 20.2, 16.2, 16.7, 0, .95, pierreF);
      // la galerie de la Vierge : sa balustrade ; la Vierge et les anges devant la rose, Adam et Ève
      for (let u = -18.8; u <= 18.8; u += .3) F("col", u, 17.25, .7, .07, .9, .07); fbox(-19, 19, 17.7, 17.92, .5, .9, pierreF);
      statue(0, 18.9, .75, 1.8); for (const s of [-1, 1]) { statue(s * 3.4, 18.7, .75, 1.5); statue(s * 15.4, 18.7, .75, 1.5); }
      // la grande rose : le vitrail, les moulures, les rayons, les petits cercles
      { const rv = 25.6; fm(MF, new THREE.CircleGeometry(4.9, 48).translate(0, rv, .03), vitrM);
        for (const [R, tb] of [[5.35, .42], [4.95, .2], [3.2, .12], [1.6, .14]]) fm(MF, new THREE.TorusGeometry(R, tb, 6, 56).translate(0, rv, .22), pierreF);
        for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; F("p", Math.cos(a) * 3.25, rv + Math.sin(a) * 3.25, .12, .13, 3.3, .24, a - Math.PI / 2); F("tore", Math.cos(a + Math.PI / 24) * 4.1, rv + Math.sin(a + Math.PI / 24) * 4.1, .1, .42, .42, 1); }
        for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; F("p", Math.cos(a) * 1.05, rv + Math.sin(a) * 1.05, .12, .12, 1.1, .2, a - Math.PI / 2); }
        F("col", 0, rv, .1, .5, .3, .5, 0, Math.PI / 2);
        anneau(5.9, 5.0, .45, .7, 0, 19.2, .6, voussF); }
      // les baies géminées des côtés, leurs oculus
      for (const c of [-13.4, 13.4]) { anneau(2.4, 4.2, .4, .8, c, 19.2, .8, voussF);
        for (const s of [-1, 1]) { plein(.8, 3.5, vitrM, c + s * 1.15, 19.6, .03); anneau(.8, 3.5, .2, .45, c + s * 1.15, 19.6, .45); }
        F("col", c, 21.4, .35, .1, 3.6, .1); fm(MF, new THREE.CircleGeometry(.72, 24).translate(c, 25.6, .03), vitrM); F("tore", c, 25.6, .2, .8, .8, 1); }
      fbox(-20.2, 20.2, 32.4, 33.0, 0, .95, pierreF);
      // la grande galerie à colonnettes, sa balustrade
      for (let u = -18.7; u < 18.8; u += 1.0) { if ([-19.2, -6.9, 6.9, 19.2].some(b => Math.abs(u - b) < 1.05)) continue; F("col", u, 36.2, .3, .13, 6.4, .13); F("p", u, 39.45, .3, .36, .24, .36); F("arc", u + .5, 39.55, .3, .95, .95, .3); }
      fbox(-20, 20, 40.6, 41.4, 0, .5, pierreF); for (let u = -19.8; u <= 19.8; u += .32) F("col", u, 41.95, .3, .07, .9, .07); fbox(-20.2, 20.2, 42.4, 42.65, 0, .7, pierreF);
      // les tours : les deux immenses baies à abat-son de chaque face, la corniche, la balustrade du sommet
      const baies = (M, c) => { for (const s of [-1, 1]) { const u = c + s * 3.0; plein(1.3, 11.4, noirF, u, 44.2, .03, M); for (const [k, hw] of [[1, 1.3], [2, 1.62], [3, 1.94]]) anneau(hw, 11.4, .32, .3 * k, u, 44.2, .3 * k, k % 2 ? pierreF : voussF, M);
          for (let v = 45; v < 56.5; v += .62) F("p", u, v, .14, 2.5, .08, .45, 0, .6, M); F("col", u, 50.2, .32, .1, 12, .1, 0, 0, M); }
        F("p", c, 51, .3, .8, 17, .6, 0, 0, M); F("p", c, 60.1, .4, 13.4, .6, .8, 0, 0, M); for (let u = c - 6.4; u <= c + 6.4; u += .32) F("col", u, 60.9, .4, .07, 1.0, .07, 0, 0, M); F("p", c, 61.5, .4, 13.4, .22, .5, 0, 0, M); };
      baies(MF, -13.4); baies(MF, 13.4); baies(MSp, 0); baies(MSm, 0);
      for (const M of [MSp, MSm]) { plein(1.0, 6, vitrM, 0, 24, .03, M); anneau(1.0, 6, .3, .4, 0, 24, .4, pierreF, M); for (const s of [-1, 1]) { fbox(s * 6.3 - .5, s * 6.3 + .5, 0, 61, 0, .8, murF, M); } }
      // (10.149, d'après les photos) les chimères de la galerie, accroupies, ailes repliées, sur la balustrade : aux angles des tours, au-dessus de la grande galerie ; et au sommet des tours
      /* (10.155, d'après tes photos) les chimères sculptées, en vrai volume : la stryge pensive (ailes repliées, cornes, le menton dans les mains, la langue tirée),
         l'oiseau de proie au long bec, aux ailes de plumes, le lion-chien accroupi la gueule ouverte, le pélican au bec crochu ; la pierre grise tachée */
      const pierreC = mat({ map: pierreFinT, color: 0xbab2a0, roughness: .95, emissive: 0xff9a40, emissiveIntensity: 0 }); NUIT.push([pierreC, 0, .12]);
      const chim = (u, v, w, ry, s = 1, M = MF, k = 0) => { const G2 = new THREE.Group(); G2.position.set(u, v, w); G2.rotation.y = ry; G2.scale.setScalar(s);
        const O = (geo, x, y, z, rx = 0, ry2 = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const o = new THREE.Mesh(geo, pierreC); o.position.set(x, y, z); o.rotation.set(rx, ry2, rz); o.scale.set(sx, sy, sz); G2.add(o); return o; };
        const cap = (r, l) => new THREE.CapsuleGeometry(r, l, 6, 12), sph = (r) => new THREE.SphereGeometry(r, 16, 12), cone = (r, h) => new THREE.ConeGeometry(r, h, 10);
        const aile = (sx) => { for (let i = 0; i < 6; i++) O(new THREE.BoxGeometry(.05, .62 - i * .06, .2), sx * (.33 + i * .01), .9 - i * .02, -.18 - i * .11, -.35 - i * .05, 0, sx * .18); for (let i = 0; i < 4; i++) O(cap(.035, .5 - i * .08), sx * .36, .62 - i * .05, -.2 - i * .14, .9, 0, sx * .2); };   // (l'aile repliée : ses plumes ou sa membrane, ses côtes)
        O(new THREE.BoxGeometry(.9, .14, .85), 0, .07, .05);   // (le socle de la balustrade)
        const t = k % 3;
        if (t === 0) {   // la stryge : assise, voûtée, les coudes sur les genoux, le menton dans les mains, les cornes, la langue
          O(sph(.34), 0, .58, -.05, .3, 0, 0, 1, 1.15, .85); O(sph(.27), 0, .98, .05, .5, 0, 0, 1, 1, .9);   // (le bassin, le dos voûté)
          for (const sx of [-1, 1]) { O(cap(.1, .32), sx * .18, .45, .2, -1.3); O(cap(.08, .3), sx * .2, .3, .38, .2); O(sph(.08), sx * .2, .14, .45, 0, 0, 0, 1, .6, 1.4);   // (les cuisses, les jambes, les pieds griffus)
            O(cap(.07, .3), sx * .17, .8, .32, -.4); O(cap(.06, .26), sx * .1, 1.05, .43, .4, 0, sx * .2); O(sph(.07), sx * .08, 1.2, .47); }   // (les bras, les mains sous le menton)
          O(sph(.2), 0, 1.33, .38, 0, 0, 0, .95, 1.05, 1); O(sph(.12), 0, 1.27, .55, 0, 0, 0, 1, .8, 1.1); O(new THREE.BoxGeometry(.06, .02, .12), 0, 1.18, .58, .4);   // (la tête, le museau, la langue)
          for (const sx of [-1, 1]) { O(cone(.05, .32), sx * .12, 1.55, .32, -.3, 0, sx * .45); O(sph(.035), sx * .08, 1.36, .52); O(cone(.05, .12), sx * .18, 1.42, .35, 0, 0, sx * 1.1); }   // (les cornes, les yeux, les oreilles)
          aile(-1); aile(1); }
        else if (t === 1) {   // l'oiseau de proie : dressé, le long bec, les ailes de plumes, les serres
          O(cap(.28, .5), 0, .7, -.05, .25, 0, 0, 1, 1, .9); O(sph(.22), 0, 1.22, .08); O(cone(.07, .5), 0, 1.15, .4, Math.PI / 2 + .45);   // (le corps, la tête, le bec)
          for (const sx of [-1, 1]) { O(sph(.035), sx * .12, 1.28, .2); for (let j = 0; j < 3; j++) O(cone(.025, .14), sx * .14 + (j - 1) * .05, .17, .32, Math.PI / 2); O(cap(.06, .25), sx * .14, .32, .2); }   // (les yeux, les serres)
          for (let i = 0; i < 5; i++) O(new THREE.BoxGeometry(.32 - i * .04, .06, .05), 0, .55 + i * .12, .26 - i * .01, .2);   // (les plumes du poitrail)
          aile(-1); aile(1); O(new THREE.BoxGeometry(.25, .05, .4), 0, .32, -.45, -.5); }
        else if (t === 2) {   // le lion-chien accroupi, la gueule ouverte, une patte sur la balustrade
          O(sph(.34), 0, .45, -.18, 0, 0, 0, 1, .9, 1.25); O(sph(.27), 0, .72, .18, -.3, 0, 0, 1, 1.1, 1);   // (l'arrière-train, le poitrail)
          for (const sx of [-1, 1]) { O(cap(.08, .4), sx * .18, .38, .35, .1); O(sph(.08), sx * .18, .16, .42, 0, 0, 0, 1, .6, 1.3); O(cap(.1, .25), sx * .25, .32, -.25, 1.2); }
          O(sph(.21), 0, 1.02, .38, 0, 0, 0, 1, .95, 1.1); O(new THREE.BoxGeometry(.24, .08, .28), 0, .92, .55, .25); O(new THREE.BoxGeometry(.22, .06, .26), 0, .82, .52, -.15);   // (la tête, les mâchoires ouvertes)
          for (const sx of [-1, 1]) { O(cone(.07, .2), sx * .14, 1.22, .32, 0, 0, sx * .5); O(sph(.035), sx * .09, 1.08, .55); }
          O(cap(.05, .5), 0, .25, -.55, 1.2); O(new THREE.TorusGeometry(.22, .06, 6, 12, Math.PI), 0, .98, .28, 0, Math.PI / 2, 0); }   // (la queue, la crinière)
        else {   // le pélican, le long bec crochu posé sur la poitrine, les ailes ouvertes à demi
          O(cap(.3, .4), 0, .65, -.05, .15); O(cap(.06, .45), 0, 1.15, .15, -.7); O(sph(.13), 0, 1.4, .3); O(cap(.05, .55), 0, 1.15, .62, .45, 0, 0, 1, 1, 1.4); O(sph(.05), 0, .88, .74);   // (le corps, le long cou, la tête, le bec et son crochet)
          for (const sx of [-1, 1]) O(cap(.07, .2), sx * .15, .25, .15);
          aile(-1); aile(1); }
        G2.updateMatrix(); G2.matrix.premultiply(M); G2.matrix.decompose(G2.position, G2.quaternion, G2.scale); scene.add(G2); };
      let kc = 0; for (const u of [-19.6, -7.3, 7.3, 19.6]) chim(u, 42.75, .55, u < 0 ? -.4 : .4, 1.35, MF, kc++); for (const u of [-16.6, -10.2, 10.2, 16.6]) chim(u, 42.75, .5, (u < 0 ? -1 : 1) * .2, 1.25, MF, kc++);
      for (const c of [-13.4, 13.4]) for (const du of [-6.2, 6.2]) chim(c + du, 61.65, .5, du < 0 ? -.5 : .5, 1.25, MF, kc++);
      for (const M of [MSp, MSm]) for (const du of [-6.2, 6.2]) chim(du, 61.65, .5, du < 0 ? -.5 : .5, 1.25, M, kc++);
      // les gargouilles des tours : longues, penchées en avant, la gueule ouverte, qui crachent l'eau de pluie loin des murs
      const garg = (u, v, w, M = MF, k = 0) => { const G2 = new THREE.Group(); G2.position.set(u, v, w); const O = (geo, x, y, z, rx = 0, ry2 = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const o = new THREE.Mesh(geo, pierreC); o.position.set(x, y, z); o.rotation.set(rx, ry2, rz); o.scale.set(sx, sy, sz); G2.add(o); return o; };
        // (la gargouille-gouttière : la bête allongée qui jaillit du mur, le corps penché, les pattes griffues agrippées, la gueule ouverte qui crache l'eau loin)
        O(new THREE.CapsuleGeometry(.2, 1.4, 6, 12), 0, -.05, .9, Math.PI / 2 + .25, 0, 0, 1, 1, .9);   // (le corps)
        for (let i = 0; i < 5; i++) O(new THREE.ConeGeometry(.05, .14, 6), 0, .14 - i * .04, .4 + i * .3, -.6);   // (l'échine)
        for (const sx of [-1, 1]) { O(new THREE.CapsuleGeometry(.06, .35, 4, 8), sx * .17, -.18, .5, .9); O(new THREE.CapsuleGeometry(.06, .3, 4, 8), sx * .17, -.24, 1.3, .3); O(new THREE.BoxGeometry(.03, .35, .5), sx * .2, .1, .7, -.3, 0, sx * .5); }   // (les pattes, les ailes plaquées)
        O(new THREE.SphereGeometry(.2, 14, 10), 0, -.3, 1.75, 0, 0, 0, .9, .85, 1.3); O(new THREE.BoxGeometry(.2, .06, .32), 0, -.36, 1.98, .35); O(new THREE.BoxGeometry(.17, .05, .28), 0, -.44, 1.93, -.15);   // (la tête, les mâchoires)
        for (const sx of [-1, 1]) { O(new THREE.ConeGeometry(.04, .2, 6), sx * .1, -.12, 1.68, -.6, 0, sx * .4); O(new THREE.SphereGeometry(.03, 6, 4), sx * .08, -.24, 1.9); }
        G2.updateMatrix(); G2.matrix.premultiply(M); G2.matrix.decompose(G2.position, G2.quaternion, G2.scale); scene.add(G2); };
      for (const c of [-13.4, 13.4]) for (const du of [-6.5, 6.5]) for (const v of [41.6, 59.8]) garg(c + du, v, .4);
      for (const M of [MSp, MSm]) for (const du of [-6.5, 6.5]) for (const v of [41.6, 59.8]) garg(du, v, .5, M);
      NI.fin(); }
    // les volumes derrière la façade : les tours, le corps central, les contreforts en saillie
    for (const sz of [-1, 1]) { box(12, FH - .2, 13, pierre, FX + 6.6, (FH - .2) / 2, CZ + sz * 13.4); box(13.4, 1, 13.4, pierreS, FX + 6.6, FH - .1, CZ + sz * 13.4);
      for (const [dx, dz] of [[-6, -6], [6, -6], [-6, 6], [6, 6]]) { cyl(.5, .7, 2.2, pierreS, FX + 6.6 + dx, FH + 1.5, CZ + sz * 13.4 + dz, 8); cyl(.02, .5, 3.4, pierreS, FX + 6.6 + dx, FH + 4.2, CZ + sz * 13.4 + dz, 8); }   // les pinacles aux angles des tours
      cyl(.02, 1.2, 5, plomb, FX + 6.6, FH + 2.5, CZ + sz * 13.4, 4); }
    box(12.6, 1.5, 12, pierre, FX + 6.9, 40.75, CZ);   /* (10.159 : le narthex est creux) */
    /* (les contreforts sont dans l'image de la façade) */
    // la nef et le chœur, le toit de plomb, les bas-côtés, les fenêtres hautes
    const NX0 = FX + 12, NX1 = ND.x1, NL = NX1 - NX0, NH = 33, NW = 14;
    const nefT = tT(512, 256, (c, w, h) => { c.fillStyle = PIERRE; c.fillRect(0, 0, w, h); for (let i = 0; i < 300; i++) { c.fillStyle = `rgba(${al() < .5 ? "120,110,90" : "255,250,235"},${al() * .08})`; c.fillRect(al() * w, al() * h, 3 + al() * 14, 2 + al() * 6); }
      for (let k = 0; k < 8; k++) { const x = k * w / 8 + w / 32; c.fillStyle = "#8a7c60"; c.beginPath(); c.moveTo(x, h * .9); c.lineTo(x, h * .35); c.quadraticCurveTo(x, h * .15, x + w / 32, h * .12); c.quadraticCurveTo(x + w / 16, h * .15, x + w / 16, h * .35); c.lineTo(x + w / 16, h * .9); c.fill(); c.fillStyle = "#24304e"; c.fillRect(x + 4, h * .3, w / 16 - 8, h * .58); c.fillStyle = "rgba(200,160,80,.35)"; c.fillRect(x + 6, h * .35, 4, h * .5); } }, NL / 16, 1);
    { const nm = mat({ map: nefT, roughness: .85 }), INV = new THREE.MeshBasicMaterial({ visible: false }); const nb = box(NL, NH, NW, nm, NX0 + NL / 2, NH / 2, CZ); nb.material = [nm, INV, nm, nm, INV, INV]; for (const sz of [-1, 1]) add(new THREE.PlaneGeometry(NL, 17.2), nm, NX0 + NL / 2, 24.6, CZ + sz * 7.01, sz > 0 ? 0 : Math.PI); }   /* (10.160 : les flancs de la nef, creux en bas : depuis les bas-côtés on voit les arcades) */   /* (10.159 : la nef est creuse, on y entre) */
    { const tg = new THREE.CylinderGeometry(.01, NW / 2 + .8, 11, 4, 1); tg.rotateY(Math.PI / 4); tg.scale(1, 1, 1); const t = new THREE.Mesh(new THREE.BoxGeometry(NL, .1, .1), plomb); void t;
      const pr = new THREE.Shape(); pr.moveTo(-NW / 2 - .6, 0); pr.lineTo(0, 11); pr.lineTo(NW / 2 + .6, 0); pr.closePath(); const pg = new THREE.ExtrudeGeometry(pr, { depth: NL, bevelEnabled: false }); pg.rotateY(Math.PI / 2); const toit = add(pg, plomb, NX0, NH, CZ); void toit; }
    for (const sz of [-1, 1]) { { const am = mat({ map: nefT, roughness: .85 }), ab = box(NL, 16, 9, am, NX0 + NL / 2, 8, CZ + sz * 11.5), arr = [am, am, am, am, am, am]; arr[sz > 0 ? 5 : 4] = new THREE.MeshBasicMaterial({ visible: false }); ab.material = arr; }   // les bas-côtés
      { const t0 = NX0 + NL * .42 - 6.6, t1 = NX0 + NL * .42 + 6.6; for (const [x0, x1] of [[NX0, t0], [t1, NX1]]) { const tp = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, .3, 10), plomb); tp.position.set((x0 + x1) / 2, 17.4, CZ + sz * 11.2); tp.rotation.x = sz * .35; scene.add(tp); } }   /* (10.159 : le toit des bas-côtés s'arrête au transept) */ }
    // les arcs-boutants : de grandes volées de pierre qui s'élancent des culées vers la nef
    for (let x = NX0 + 4; x < NX1 - 4; x += 8.5) for (const sz of [-1, 1]) { if (Math.abs(x - (NX0 + NL * .42)) < 8) continue;   /* (10.159 : pas d'arc-boutant à travers le transept) */ const zc = CZ + sz * 16.5; box(2, 26, 2.2, pierreS, x, 13, zc); cyl(.2, .55, 3.5, pierreS, x, 27.6, zc, 4); { const gg = add(new THREE.CylinderGeometry(.14, .24, 2.0, 8), pierre, x, 24.6, zc + sz * 1.6); gg.rotation.x = sz * (Math.PI / 2 - .25); const gt = add(new THREE.SphereGeometry(.22, 8, 6), pierre, x, 24.35, zc + sz * 2.65); gt.scale.z = 1.4; }   /* (les gargouilles de la nef) */   // la culée, son pinacle
      const v = new THREE.Mesh(new THREE.BoxGeometry(.8, .9, 10.5), pierreS); v.position.set(x, 26.5, CZ + sz * 11.6); v.rotation.x = sz * .5; scene.add(v); }
    // le transept : ses deux bras et leurs roses
    { const TX = NX0 + NL * .42, TW = 13; { const tm = mat({ map: nefT, roughness: .85 }), tb = box(TW, NH, NW + 22, tm, TX, NH / 2, CZ), INV = new THREE.MeshBasicMaterial({ visible: false }); tb.material = [INV, INV, tm, tm, tm, tm];
      for (const [fx, ry] of [[TX - TW / 2 - .01, -Math.PI / 2], [TX + TW / 2 + .01, Math.PI / 2]]) for (const s of [-1, 1]) { add(new THREE.PlaneGeometry(11, 17), tm, fx, 24.5, CZ + s * 12.5, ry); add(new THREE.PlaneGeometry(2.5, 16), tm, fx, 8, CZ + s * 16.75, ry); } }
      const pr = new THREE.Shape(); pr.moveTo(-TW / 2 - .5, 0); pr.lineTo(0, 11); pr.lineTo(TW / 2 + .5, 0); pr.closePath(); const pg = new THREE.ExtrudeGeometry(pr, { depth: NW + 22, bevelEnabled: false }); const t2 = add(pg, plomb, TX, NH, CZ - (NW + 22) / 2); void t2;
      const roseT = tT(256, 256, (c, w, h) => { c.fillStyle = PIERRE; c.fillRect(0, 0, w, h); const g = c.createRadialGradient(128, 128, 4, 128, 128, 110); g.addColorStop(0, "#e0b040"); g.addColorStop(.4, "#2a3a9a"); g.addColorStop(.75, "#9a1a3a"); g.addColorStop(1, "#1a2a7a"); c.fillStyle = g; c.beginPath(); c.arc(128, 128, 110, 0, 7); c.fill(); c.strokeStyle = "#c8bc9e"; c.lineWidth = 3; for (let k = 0; k < 32; k++) { const a = k / 32 * Math.PI * 2; c.beginPath(); c.moveTo(128 + Math.cos(a) * 25, 128 + Math.sin(a) * 25); c.lineTo(128 + Math.cos(a) * 110, 128 + Math.sin(a) * 110); c.stroke(); } for (const r of [25, 60, 90, 110]) { c.beginPath(); c.arc(128, 128, r, 0, 7); c.stroke(); } });
      const rm = new THREE.MeshStandardMaterial({ map: roseT, roughness: .5, emissive: 0xffffff, emissiveMap: roseT, emissiveIntensity: .05 }); NUIT.push([rm, .05, .6]);
      for (const sz of [-1, 1]) { const r = add(new THREE.PlaneGeometry(11, 11), rm, TX, 22, CZ + sz * ((NW + 22) / 2 + .02), sz > 0 ? 0 : Math.PI); void r;
        const pg2 = new THREE.Shape(); pg2.moveTo(-TW / 2, 0); pg2.lineTo(0, 9); pg2.lineTo(TW / 2, 0); pg2.closePath(); const pi = add(new THREE.ShapeGeometry(pg2), pierre, TX, NH, CZ + sz * ((NW + 22) / 2 + .05), sz > 0 ? 0 : Math.PI); void pi; }
      // la flèche de Viollet-le-Duc, plomb et bois, au-dessus de la croisée
      cyl(2.2, 2.6, 8, plomb, TX, NH + 11 + 4, CZ, 8); cyl(.05, 2.2, 38, plomb, TX, NH + 11 + 8 + 19, CZ, 8); add(new THREE.SphereGeometry(.45, 8, 6), mat({ color: 0xc8a040, metalness: .8, roughness: .3 }), TX, NH + 11 + 46, CZ);
      for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; cyl(.08, .3, 3, plomb, TX + Math.cos(a) * 2.4, NH + 11 + 9.5, CZ + Math.sin(a) * 2.4, 4); } }
    // le chevet : l'abside arrondie, sa couronne d'arcs-boutants
    { const R = NW / 2 + 9; const ab = new THREE.Mesh(new THREE.CylinderGeometry(NW / 2, NW / 2, NH, 16, 1, false, 0, Math.PI), mat({ map: nefT, roughness: .85 })); ab.position.set(NX1, NH / 2, CZ); scene.add(ab);
      const ab2 = new THREE.Mesh(new THREE.CylinderGeometry(NW / 2 + 4.5, NW / 2 + 4.5, 16, 16, 1, false, 0, Math.PI), mat({ map: nefT, roughness: .85 })); ab2.position.set(NX1, 8, CZ); scene.add(ab2);
      const ct = new THREE.Mesh(new THREE.ConeGeometry(NW / 2 + .6, 11, 16, 1, false, 0, Math.PI), plomb); ct.position.set(NX1, NH + 5.5, CZ); scene.add(ct);
      for (let k = 0; k <= 6; k++) { const a = k / 6 * Math.PI, x = NX1 + Math.sin(a) * R, z = CZ + Math.cos(a) * R; box(2, 24, 2, pierreS, x, 12, z); const v = new THREE.Mesh(new THREE.BoxGeometry(.8, .9, 9), pierreS); v.position.set(NX1 + Math.sin(a) * (R - 4.5), 25, CZ + Math.cos(a) * (R - 4.5)); v.rotation.y = a; v.rotateX(-.5); scene.add(v); } }
    // le jardin au pied du chevet, sa grille
  }
  // (la cathédrale est construite en long sur x : on la tourne d'un quart de tour, la façade face au pont et à la Seine, au fond du parvis)
  { const vus = new Set(); for (const o of scene.children.slice(i0ND)) o.traverse(q => { for (const m of [].concat(q.material || [])) { if (!m || !m.isMeshStandardMaterial || vus.has(m) || m.emissiveIntensity > 0) continue; vus.add(m); if (m.emissive && m.emissive.getHex() !== 0) continue; m.emissive = new THREE.Color(0xffb050); const toit = m.metalness > .3; NUIT.push([m, 0, toit ? .04 : .1]); } }); }   // (la nef, les arcs-boutants, le chevet : illuminés eux aussi)
  { const T = new THREE.Matrix4().makeRotationY(Math.PI / 2).setPosition(58, 0, -96); for (const o of scene.children.slice(i0ND)) o.applyMatrix4(T); }
  /* ---------- (10.159) l'intérieur de Notre-Dame, d'après les photos : on entre par le portail central, grand ouvert ; le narthex, la grande rose et l'orgue au-dessus de la porte ;
     la nef et ses piliers ronds à chapiteaux, les grandes arcades, le triforium, les fenêtres hautes et leurs vitraux ; la voûte d'ogives ; les bas-côtés, leurs vitraux et leurs lustres de cristal ;
     le dallage de marbre noir et blanc en losanges ; les rangs de chaises de bois blond ; les fonts baptismaux de bronze ; à la croisée, l'autel de bronze sur ses marches ;
     les roses du transept ; le chœur, ses stalles de bois sculpté ; le maître-autel, la croix d'or ; l'abside et ses vitraux ; la lumière des vitraux posée sur le sol ---------- */
  const CXI = -1, IOBS = [];
  { const tex2 = (w, h, f, rx, ry) => tT(w, h, f, rx, ry);
    const pierreRep = (rx, ry, col = 0xd8cfbd) => { const t = tex2(128, 128, (c, w, h) => { c.fillStyle = "#ffffff"; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 32) for (let x = ((y / 32) % 2) * 32 - 64; x < w; x += 64) { c.fillStyle = `rgba(${al() < .5 ? "150,135,110" : "255,252,245"},${al() * .14})`; c.fillRect(x + 1, y + 1, 62, 30); c.fillStyle = "rgba(130,115,90,.32)"; c.fillRect(x, y, 64, 1.5); c.fillRect(x, y, 1.5, 32); } }, rx, ry); return mat({ map: t, color: col, roughness: .9 }); };
    const H = (i, j) => { const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return s - Math.floor(s); };
    const VCOL = ["#1a3aa0", "#a01a2a", "#d8a020", "#1a7a4a", "#6a1a8a", "#2a6ad0", "#c84a1a", "#f2e8c0"];
    const arc = (c, x0, x1, ys, ya, yb) => { c.beginPath(); c.moveTo(x0, yb); c.lineTo(x0, ys); c.quadraticCurveTo(x0, ya, (x0 + x1) / 2, ya); c.quadraticCurveTo(x1, ya, x1, ys); c.lineTo(x1, yb); c.closePath(); };
    const vitrail = (c, x0, x1, ys, ya, yb, emis, k = 0) => { c.save(); arc(c, x0, x1, ys, ya, yb); c.clip(); const s = 6; for (let y = ya; y < yb; y += s) for (let x = x0; x < x1; x += s) { c.fillStyle = VCOL[(H(x / s + k, y / s) * 8) | 0]; c.fillRect(x, y, s, s); }
      c.strokeStyle = emis ? "#000" : "#141414"; c.lineWidth = 1.2; for (let y = ya; y < yb; y += s * 4) { c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke(); } c.beginPath(); c.moveTo((x0 + x1) / 2, ya); c.lineTo((x0 + x1) / 2, yb); c.stroke(); c.restore(); };
    const rose = (c, cx, cy, R, emis) => { c.save(); c.beginPath(); c.arc(cx, cy, R, 0, 7); c.clip(); for (let i = 0; i < 2600; i++) { const a = H(i, 1) * 6.283, r = Math.sqrt(H(i, 2)) * R; c.fillStyle = VCOL[(H(i, 3) * 8) | 0]; c.fillRect(cx + Math.cos(a) * r - 3, cy + Math.sin(a) * r - 3, 6, 6); } c.restore();
      c.strokeStyle = emis ? "#000" : "#bfb49c"; c.lineWidth = R * .05; for (const f of [.28, .6, .85, 1]) { c.beginPath(); c.arc(cx, cy, R * f, 0, 7); c.stroke(); } c.lineWidth = R * .03; for (let i = 0; i < 24; i++) { const a = i / 24 * 6.283; c.beginPath(); c.moveTo(cx + Math.cos(a) * R * .28, cy + Math.sin(a) * R * .28); c.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); c.stroke(); } };
    const pierreFond = (c, w, h) => { c.fillStyle = "#d8cfbd"; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 16) for (let x = ((y / 16) % 2) * 16 - 32; x < w; x += 32) { c.fillStyle = `rgba(${H(x, y) < .5 ? "150,135,110" : "255,252,245"},${H(y, x) * .14})`; c.fillRect(x + 1, y + 1, 30, 14); c.fillStyle = "rgba(130,115,90,.28)"; c.fillRect(x, y, 32, 1); c.fillRect(x, y, 1, 16); } };
    const vitreMat = (dess, w, h, j = .85, n = .3) => { const m = new THREE.MeshStandardMaterial({ map: tex2(w, h, (c) => dess(c, false)), emissive: 0xffffff, emissiveMap: tex2(w, h, (c) => { c.fillStyle = "#000"; c.fillRect(0, 0, w, h); dess(c, true); }), emissiveIntensity: j, roughness: .85, side: THREE.DoubleSide }); NUIT.push([m, j, n]); return m; };
    const PL = (w, h, m, x, y, z, ry = 0, rx = 0) => { const o = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); o.position.set(x, y, z); o.rotation.set(rx, ry, 0); scene.add(o); return o; };
    const Z0 = -72.15, ZN = -82.6, ZE = -188, ZT0 = -118.2, ZT1 = -133.4, B = 6.4, PIL = []; for (let z = -86.2; z > ZE + 2; z -= B) if (z > ZT0 + .5 || z < ZT1 - .5) PIL.push(z);
    // le dallage de marbre en losanges noirs et blancs
    { const t = tex2(256, 256, (c, w, h) => { c.fillStyle = "#ece6da"; c.fillRect(0, 0, w, h); c.save(); c.translate(w / 2, h / 2); c.rotate(Math.PI / 4); const s = w / Math.SQRT2 / 2; for (let i = -4; i < 4; i++) for (let j = -4; j < 4; j++) if ((i + j) & 1) { c.fillStyle = "#26262a"; c.fillRect(i * s, j * s, s, s); } c.restore(); for (let i = 0; i < 500; i++) { c.fillStyle = `rgba(255,255,255,${al() * .07})`; c.fillRect(al() * w, al() * h, 4, 1); } }, 30.6 / 2.4, 123 / 2.4);
      const s = sol(-16.3, 14.3, ZE - 7, Z0, new THREE.MeshStandardMaterial({ map: t, roughness: .22, metalness: .15 }), .035); void s; }
    // le mur ouest, du dedans : la porte, l'orgue, la grande rose
    PL(13.8, 40, vitreMat((c, e) => { const w = 276, h = 800, Y = m => h - m * 20; if (!e) { pierreFond(c, w, h); c.fillStyle = "#3a2a1c"; c.fillRect(30, Y(21), w - 60, Y(12.5) - Y(21)); for (let i = 0; i < 34; i++) { const x = 40 + i * 6.2, hh = 40 + Math.abs(Math.sin(i * .5)) * 90; const g = c.createLinearGradient(x, 0, x + 5, 0); g.addColorStop(0, "#8a9098"); g.addColorStop(.5, "#e8ecf0"); g.addColorStop(1, "#7a8088"); c.fillStyle = g; c.fillRect(x, Y(13.2) - hh, 5, hh); } c.fillStyle = "#c8a040"; c.fillRect(30, Y(21) - 6, w - 60, 6); }
      rose(c, w / 2, Y(25.6), 98, e); if (!e) { c.globalCompositeOperation = "destination-out"; arc(c, (6.9 - 2.9) * 20, (6.9 + 2.9) * 20, Y(7.2), Y(9.6), h); c.fill(); c.globalCompositeOperation = "source-over"; } }, 276, 800, .8, .25), CXI, 20, Z0, Math.PI).material.alphaTest = .5;
    // la nef : les piliers ronds et leurs chapiteaux ; les grandes arcades ; le mur haut (triforium, fenêtres hautes) ; la voûte d'ogives
    const pilM = pierreRep(3, 5), capM = mat({ map: pierreFinT, color: 0xe2dac8, roughness: .85 });
    const pilier = (x, z, r = .75, h = 10.5) => { cyl(r * 1.25, r * 1.3, .5, capM, x, .25, z, 16); cyl(r, r, h, pilM, x, h / 2 + .5, z, 16); cyl(r * 1.45, r * .98, .8, capM, x, h + .9, z, 16); for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283, f = add(new THREE.ConeGeometry(.16, .5, 4), capM, x + Math.cos(a) * r * 1.05, h + .75, z + Math.sin(a) * r * 1.05); f.rotation.z = Math.cos(a) * .5; f.rotation.x = -Math.sin(a) * .5; } box(r * 3, .3, r * 3, capM, x, h + 1.45, z); IOBS.push([x - r - .2, x + r + .2, z - r - .2, z + r + .2]); };
    const arcadeT = tex2(128, 88, (c, w, h) => { pierreFond(c, w, h); c.strokeStyle = "#a89a7c"; c.lineWidth = 7; arc(c, 6, w - 6, h - 12, 4, h + 10); c.stroke(); c.globalCompositeOperation = "destination-out"; arc(c, 12, w - 12, h - 10, 12, h + 10); c.fill(); c.globalCompositeOperation = "source-over"; });
    const arcadeM = new THREE.MeshStandardMaterial({ map: arcadeT, alphaTest: .5, side: THREE.DoubleSide, roughness: .9 });
    const murHautM = vitreMat((c, e) => { const w = 128, h = 290; if (!e) { pierreFond(c, w, h); c.fillStyle = "#c8bea6"; c.fillRect(0, h - 104, w, 6); c.fillRect(0, h - 8, w, 8); for (let i = 0; i < 4; i++) { c.fillStyle = "#3a3228"; arc(c, 8 + i * 29, 30 + i * 29, h - 40, h - 88, h - 10); c.fill(); c.fillStyle = "#d8cfbd"; c.fillRect(18 + i * 29, h - 60, 3, 50); } }
      for (const x0 of [22, 70]) { if (!e) { c.fillStyle = "#a89a7c"; arc(c, x0 - 4, x0 + 40, 70, 24, 176); c.fill(); } vitrail(c, x0, x0 + 36, 66, 30, 170, e, x0); } if (!e) { c.fillStyle = "#a89a7c"; c.beginPath(); c.arc(64, 22, 13, 0, 7); c.fill(); } c.save(); c.beginPath(); c.arc(64, 22, 10, 0, 7); c.clip(); vitrail(c, 54, 74, 40, 12, 40, e, 3); c.restore(); }, 128, 290, .85, .3);
    const basCoteM = vitreMat((c, e) => { const w = 128, h = 308; if (!e) { pierreFond(c, w, h); c.fillStyle = "#a89a7c"; arc(c, 30, 98, 110, 40, 236); c.fill(); } vitrail(c, 36, 92, 108, 48, 230, e, 7); }, 128, 308, .85, .3);
    const voutT = tex2(128, 128, (c, w, h) => { c.fillStyle = "#e2d8c2"; c.fillRect(0, 0, w, h); for (let i = 0; i < 300; i++) { c.fillStyle = `rgba(${al() < .5 ? "160,140,110" : "255,250,240"},${al() * .1})`; c.fillRect(al() * w, al() * h, 6, 3); } c.strokeStyle = "#b8aa8c"; c.lineWidth = 5; c.beginPath(); c.moveTo(0, 0); c.lineTo(w, h); c.moveTo(w, 0); c.lineTo(0, h); c.moveTo(0, 0); c.lineTo(w, 0); c.moveTo(0, h); c.lineTo(w, h); c.stroke(); c.fillStyle = "#c8a040"; c.beginPath(); c.arc(w / 2, h / 2, 7, 0, 7); c.fill(); }, 1, 1);
    const voutMat = (t) => { const m = new THREE.MeshStandardMaterial({ map: t, roughness: .9, side: THREE.DoubleSide, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: .55 }); NUIT.push([m, .55, .12]); return m; }, voutM = voutMat(voutT);   // (les voûtes, éclairées par la lumière qui monte du dallage)
    for (const s of [-1, 1]) { const xr = CXI + s * 7, xo = CXI + s * 11.4;
      for (const z of PIL) { pilier(xr, z); pilier(xo, z, .6, 10.5); }
      for (const z of [ZT0, ZT1]) { pilier(xr, z, 1.1, 10.5); pilier(xo, z, .8, 10.5); }
      const baies = []; let zp = ZN; for (const z of [...PIL, ZT0, ZT1].sort((a, b) => b - a)) { baies.push([zp, z]); zp = z; } baies.push([zp, ZE]);
      for (const [za, zb] of baies) { const zc = (za + zb) / 2, L2 = za - zb; if (zc < ZT0 && zc > ZT1) continue;
        for (const x of [xr, xo]) PL(L2, 4.4, arcadeM, x, 13.2, zc, Math.PI / 2);
        PL(L2, 14.5, murHautM, xr, 22.25, zc, Math.PI / 2);
        PL(L2, 15.4, basCoteM, CXI + s * 15.3, 7.7, zc, -s * Math.PI / 2);
        PL(8.3, L2, voutM, CXI + s * 11.15, 15.4, zc, 0, Math.PI / 2); } }
    // la voûte de la nef (l'ogive, ses doubleaux), le plafond du transept, l'abside et son cul-de-four
    { const L2 = ZN - ZE, g = new THREE.CylinderGeometry(7, 7, L2, 28, 1, true, Math.PI / 2, Math.PI); g.rotateX(Math.PI / 2); g.scale(1, .45, 1); const vt = voutT.clone(); vt.needsUpdate = true; vt.repeat.set(1, L2 / B); vt.wrapS = vt.wrapT = THREE.RepeatWrapping;
      add(g, voutMat(vt), CXI, 29.5, (ZN + ZE) / 2);
      PL(14, 14.5, murHautM, CXI - 7, 22.25, (ZT0 + ZT1) / 2, Math.PI / 2).visible = false;
      for (const z of [...PIL, ZT0, ZT1]) { const t = new THREE.Mesh(new THREE.TorusGeometry(7, .13, 6, 28, Math.PI), capM); t.scale.y = .45; t.position.set(CXI, 29.5, z); scene.add(t); } }
    PL(30.6, ZT0 - ZT1, voutM, CXI - 1, 32.6, (ZT0 + ZT1) / 2, 0, Math.PI / 2);
    for (const s of [-1, 1]) PL(ZT0 - ZT1, 33, vitreMat((c, e) => { const w = 304, h = 660; if (!e) pierreFond(c, w, h); rose(c, w / 2, 220, 100, e); for (let i = 0; i < 9; i++) { if (!e) { c.fillStyle = "#a89a7c"; arc(c, 20 + i * 30, 46 + i * 30, 380, 340, 450); c.fill(); } vitrail(c, 23 + i * 30, 43 + i * 30, 378, 346, 446, e, i); } }, 304, 660, .9, .3), CXI + s * 15.3, 16.5, (ZT0 + ZT1) / 2, -s * Math.PI / 2);
    for (const s of [-1, 1]) PL(8.3, 15.4, pierreRep(2, 4), CXI + s * 11.15, 7.7, ZE + .02, 0);
    { const pm = pierreRep(3, 5); pm.side = THREE.DoubleSide; for (const s of [-1, 1]) for (const z of [ZT0, ZT1]) PL(8.6, 17.6, pm, CXI + s * 11.1, 24.2, z, 0); }   // (les murs du transept, au-dessus des bas-côtés)
    { const g = new THREE.CylinderGeometry(7, 7, 33, 24, 1, true, Math.PI / 2, Math.PI); add(g, vitreMat((c, e) => { const w = 440, h = 660; if (!e) pierreFond(c, w, h); for (let i = 0; i < 5; i++) { const x = 40 + i * 80; if (!e) { c.fillStyle = "#a89a7c"; arc(c, x - 6, x + 46, 150, 60, 330); c.fill(); arc(c, x - 4, x + 44, 470, 400, 600); c.fill(); } vitrail(c, x, x + 40, 146, 66, 326, e, i); vitrail(c, x + 2, x + 38, 466, 406, 596, e, i + 9); } }, 440, 660, .9, .3), CXI, 16.5, ZE);
      const d = new THREE.SphereGeometry(7, 24, 10, Math.PI, Math.PI, 0, Math.PI / 2); d.scale(1, .45, 1); const vt = voutT.clone(); vt.needsUpdate = true; add(d, voutMat(vt), CXI, 29.5, ZE); }
    // la lumière des vitraux posée sur le dallage et les piliers (le jour)
    { const lt = tex2(128, 128, (c, w, h) => { c.clearRect(0, 0, w, h); for (let i = 0; i < 60; i++) { const g = c.createRadialGradient(al() * w, al() * h, 1, al() * w, al() * h, 20 + al() * 30); const col = ["255,60,80", "60,90,255", "255,210,80", "120,255,140", "200,80,255"][(al() * 5) | 0]; g.addColorStop(0, `rgba(${col},.5)`); g.addColorStop(1, `rgba(${col},0)`); c.fillStyle = g; c.fillRect(0, 0, w, h); } });
      const lm = new THREE.MeshBasicMaterial({ map: lt, transparent: true, opacity: .45, blending: THREE.AdditiveBlending, depthWrite: false }), LUM = [];
      for (const s of [-1, 1]) for (const z of PIL.filter((_, i) => i % 2 === 0)) { const q = PL(4, 6, lm, CXI + s * 12.8, .05, z - 3.2, 0, -Math.PI / 2); q.rotation.z = s * .5; LUM.push(q); }
      AMB.push(() => { const v = !L.nuit; if (LUM[0].visible !== v) for (const q of LUM) q.visible = v; }); }
    // les lustres de cristal, dans les bas-côtés
    { const orL = mat({ color: 0xc8a040, metalness: .8, roughness: .3 }), crist = mat({ color: 0xfff4e0, emissive: 0xffe2a8, emissiveIntensity: .5, roughness: .1, metalness: .2 }); NUIT.push([crist, .5, 1.8]);
      for (const s of [-1, 1]) for (const z of PIL.filter((_, i) => i % 2 === 1)) { const x = CXI + s * 9.2; cyl(.02, .02, 7.8, orL, x, 11.5, z, 5); const t = new THREE.Mesh(new THREE.TorusGeometry(.75, .04, 6, 20), orL); t.rotation.x = Math.PI / 2; t.position.set(x, 7.3, z); scene.add(t); cyl(.12, .2, .8, orL, x, 7.1, z, 8);
        for (let i = 0; i < 10; i++) { const a = i / 10 * 6.283; add(new THREE.SphereGeometry(.06, 6, 4), crist, x + Math.cos(a) * .75, 7.45, z + Math.sin(a) * .75); add(new THREE.ConeGeometry(.035, .16, 4), crist, x + Math.cos(a) * .7, 7.1, z + Math.sin(a) * .7).rotation.x = Math.PI; } add(new THREE.ConeGeometry(.12, .4, 6), crist, x, 6.55, z).rotation.x = Math.PI; LAMPES.push([x, 6.8, z]); } }
    // les rangs de chaises de bois blond, de part et d'autre de l'allée centrale
    { const CH = []; for (let z = -91; z > -116.5; z -= 1.0) for (const u of [-5.6, -4.7, -3.8, -2.9, -2.0, 2.0, 2.9, 3.8, 4.7, 5.6]) CH.push([CXI + u, z]);
      const boisC = mat({ color: 0xc89a5a, roughness: .6 }), inst = (geo, pts) => { const im = new THREE.InstancedMesh(geo, boisC, pts.length), m4 = new THREE.Matrix4(); pts.forEach(([x, y, z], i) => { m4.makeTranslation(x, y, z); im.setMatrixAt(i, m4); }); im.instanceMatrix.needsUpdate = true; scene.add(im); };
      inst(new THREE.BoxGeometry(.42, .04, .42), CH.map(([x, z]) => [x, .46, z])); inst(new THREE.BoxGeometry(.42, .42, .04), CH.map(([x, z]) => [x, .72, z + .2])); inst(new THREE.BoxGeometry(.04, .04, .42), CH.map(([x, z]) => [x, .62, z]));
      const legs = []; for (const [x, z] of CH) for (const [dx, dz] of [[-.18, -.18], [.18, -.18], [-.18, .18], [.18, .18]]) legs.push([x + dx, .23, z + dz]); inst(new THREE.BoxGeometry(.035, .46, .035), legs);
      IOBS.push([CXI - 6.0, CXI - 1.6, -116.7, -90.5], [CXI + 1.6, CXI + 6.0, -116.7, -90.5]);
      // quelques fidèles assis, recueillis
      const PEI = ["#f0c9a6", "#c78f62", "#e8bd95", "#8d5a3b", "#f6d6bc"]; for (let k = 0; k < (PEU ? 5 : 12); k++) { const [x, z] = CH[(k * 37 + 11) % CH.length], f = k % 2 === 1, m = personne3D({ taille: f ? 1.62 : 1.74, peau: PEI[k % 5], ch: ["#2a1a12", "#8a8a8a", "#5a3a22", "#141010"][k % 4], haut: ["#2a2a3a", "#5a2a2a", "#3a4a5a", "#e8e2d6"][k % 4], bas: "#26324e", chaussures: "#1a1a1a", coif: f ? "long" : "court", pantalon: !f, robe: f });
        m.position.set(x, .48 - m.userData.hipY, z); m.rotation.y = Math.PI; m.userData.poser("assis", 0); m.userData.parts.tete.rotation.x = .3; scene.add(m); } }
    // (10.160) les grands tableaux religieux dans leurs cadres dorés, sur les murs nus : la Crucifixion, l'Assomption, l'ange dans la nuée
    { const fig = (c, x, y, s, robe, manteau, peau = "#e8c4a0", bras = 0) => { c.fillStyle = robe; c.beginPath(); c.moveTo(x - s * .5, y + s * 2.2); c.quadraticCurveTo(x - s * .55, y + s * .6, x, y + s * .3); c.quadraticCurveTo(x + s * .55, y + s * .6, x + s * .5, y + s * 2.2); c.fill();
        c.fillStyle = manteau; c.beginPath(); c.moveTo(x - s * .65, y + s * 2.2); c.quadraticCurveTo(x - s * .7, y + s * .9, x - s * .1, y + s * .25); c.quadraticCurveTo(x - s * .2, y + s * 1.2, x + s * .2, y + s * 2.2); c.fill();
        c.fillStyle = peau; c.beginPath(); c.arc(x, y, s * .26, 0, 7); c.fill(); if (bras) { c.strokeStyle = peau; c.lineWidth = s * .14; c.beginPath(); c.moveTo(x, y + s * .5); c.lineTo(x + bras * s * .7, y - s * .5); c.stroke(); } };
      const toile2 = (k) => tT(256, 320, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h);
        if (k === 0 || k === 2) { g.addColorStop(0, "#1a1a22"); g.addColorStop(.55, k ? "#5a4a3a" : "#3a3028"); g.addColorStop(1, "#2a2218"); c.fillStyle = g; c.fillRect(0, 0, w, h); if (k) { c.fillStyle = "#c8702a"; c.beginPath(); c.ellipse(60, 250, 70, 14, 0, 0, 7); c.fill(); }
          c.fillStyle = "#4a3420"; c.fillRect(w / 2 - 7, 30, 14, 240); c.fillRect(w / 2 - 70, 70, 140, 12);   // (la croix)
          c.fillStyle = "#e8d0b0"; c.beginPath(); c.ellipse(w / 2, 125, 14, 46, 0, 0, 7); c.fill(); c.beginPath(); c.arc(w / 2, 72, 11, 0, 7); c.fill(); c.strokeStyle = "#e8d0b0"; c.lineWidth = 8; c.beginPath(); c.moveTo(w / 2 - 60, 76); c.lineTo(w / 2, 92); c.lineTo(w / 2 + 60, 76); c.stroke(); c.lineWidth = 9; c.beginPath(); c.moveTo(w / 2 - 4, 168); c.lineTo(w / 2 - 2, 222); c.moveTo(w / 2 + 4, 168); c.lineTo(w / 2 + 2, 222); c.stroke(); c.fillStyle = "#f2ece0"; c.fillRect(w / 2 - 15, 150, 30, 14);
          fig(c, 52, 190, 40, "#3a5a8a", "#2a3a6a"); fig(c, 204, 186, 42, "#7a1a14", "#c8281e", "#e8c4a0", -1); fig(c, w / 2 + 18, 236, 30, "#c8a040", "#d8b048", "#f0d0b0", -1); }
        else if (k === 1) { g.addColorStop(0, "#c8a070"); g.addColorStop(.6, "#e8d2a8"); g.addColorStop(1, "#8aa0b8"); c.fillStyle = g; c.fillRect(0, 0, w, h); c.fillStyle = "rgba(255,240,200,.5)"; c.beginPath(); c.arc(w / 2, 60, 70, 0, 7); c.fill();
          c.fillStyle = "#5a5a6a"; c.beginPath(); c.ellipse(w / 2, 260, 80, 26, 0, 0, 7); c.fill(); fig(c, w / 2, 70, 60, "#b8201a", "#1a3a9a", "#f0d0b0", 1); c.strokeStyle = "#f0d0b0"; c.lineWidth = 9; c.beginPath(); c.moveTo(w / 2, 100); c.lineTo(w / 2 - 50, 30); c.stroke();
          fig(c, 60, 140, 34, "#d8a030", "#e8b840"); fig(c, 196, 150, 34, "#2a4a8a", "#3a5aa0"); fig(c, 70, 220, 26, "#d86a6a", "#e88a8a"); c.fillStyle = "#4a6a3a"; c.fillRect(0, 300, w, 20); }
        else { g.addColorStop(0, "#5a7aa8"); g.addColorStop(.5, "#e8d8b8"); g.addColorStop(1, "#4a5a4a"); c.fillStyle = g; c.fillRect(0, 0, w, h); c.fillStyle = "rgba(255,250,230,.55)"; c.beginPath(); c.moveTo(w, 0); c.lineTo(80, 200); c.lineTo(140, 210); c.closePath(); c.fill();
          for (let i = 0; i < 9; i++) { c.fillStyle = `rgba(${200 + i * 5},${200 + i * 5},${210},.6)`; c.beginPath(); c.arc(140 + Math.cos(i) * 60, 110 + Math.sin(i * 1.7) * 40, 40, 0, 7); c.fill(); }
          fig(c, 190, 80, 34, "#f2ece0", "#c8281e", "#f0d0b0", -1); c.fillStyle = "#f8f4ec"; c.beginPath(); c.ellipse(220, 60, 40, 14, -.6, 0, 7); c.fill(); fig(c, 70, 190, 42, "#8a1a14", "#b8281e", "#d8a888", 1); c.fillStyle = "#e8c4a0"; c.beginPath(); c.ellipse(100, 270, 36, 12, 0, 0, 7); c.fill(); }
        c.fillStyle = "rgba(40,30,10,.18)"; c.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { c.fillStyle = `rgba(${al() < .5 ? "0,0,0" : "255,240,200"},${al() * .06})`; c.fillRect(al() * w, al() * h, 2, 2); } });
      const TM = [0, 1, 2, 3].map(k => mat({ map: toile2(k), roughness: .7 })), cadre = mat({ color: 0xc8a040, metalness: .75, roughness: .3 });
      const tableau = (x, y, z, ry, w, h, k) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; scene.add(g); const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), TM[k % 4]); p.position.z = .06; g.add(p);
        for (const [bw, bh, bx, by] of [[w + .5, .25, 0, h / 2 + .12], [w + .5, .25, 0, -h / 2 - .12], [.25, h, w / 2 + .12, 0], [.25, h, -w / 2 - .12, 0]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, .14), cadre); b.position.set(bx, by, .04); g.add(b); } };
      let k = 0; for (const s of [-1, 1]) { tableau(CXI + s * 11.1, 22, ZT0 - .06, Math.PI, 4.4, 5.6, k++); tableau(CXI + s * 11.1, 22, ZT1 + .06, 0, 4.4, 5.6, k++); tableau(CXI + s * 11.15, 6.5, ZE + .06, 0, 3.2, 4.2, k++); tableau(CXI + s * 11.15, 6.5, ZN - .06, Math.PI, 3.2, 4.2, k++); } }
    // les fonts baptismaux de bronze, sur leur estrade de pierre claire
    { const bronze = mat({ color: 0x6a3a1a, metalness: .55, roughness: .35, side: THREE.DoubleSide }), blanc = mat({ color: 0xece4d4, roughness: .5 });
      box(3, .25, 3, blanc, CXI, .125, -86); add(new THREE.LatheGeometry([[0, 0], [.25, 0], [.18, .3], [.22, .55], [.42, .85], [.55, 1.05], [.56, 1.1], [.5, 1.1], [.46, 1.0], [0, .98]].map(([x, y]) => new THREE.Vector2(x, y)), 24), bronze, CXI, .25, -86); cyl(.47, .47, .02, mat({ color: 0x9ab8c0, roughness: .05, metalness: .4 }), CXI, 1.24, -86, 24);   /* (10.160 : le bénitier plein, son eau) */ IOBS.push([CXI - 1.6, CXI + 1.6, -87.6, -84.4]);
      // à la croisée : l'autel de bronze sur ses trois marches
      box(7, .25, 6, blanc, CXI, .125, -126); box(5.6, .25, 4.8, blanc, CXI, .375, -126); box(4.2, .25, 3.6, blanc, CXI, .625, -126);
      add(new THREE.LatheGeometry([[.3, 0], [.6, .15], [1.0, .55], [1.15, .95], [1.1, 1.0]].map(([x, y]) => new THREE.Vector2(x, y)), 28), bronze, CXI, .75, -126); add(new THREE.CylinderGeometry(1.1, 1.1, .04, 28), mat({ color: 0x8a4a22, metalness: .5, roughness: .4 }), CXI, 1.74, -126); IOBS.push([CXI - 3.6, CXI + 3.6, -129.1, -122.9]);
      // le chœur : les stalles de bois sculpté
      const boisS = mat({ map: tex2(128, 64, (c, w, h) => { c.fillStyle = "#4a2a16"; c.fillRect(0, 0, w, h); for (let i = 0; i < 4; i++) { c.strokeStyle = "#2a1608"; c.lineWidth = 3; c.strokeRect(6 + i * 31, 8, 25, h - 16); c.fillStyle = "#5a361e"; c.beginPath(); c.ellipse(18 + i * 31, h / 2, 7, 12, 0, 0, 7); c.fill(); } }, 8, 1), roughness: .6 });
      for (const s of [-1, 1]) { box(1.6, 3.2, 24, boisS, CXI + s * 5.6, 1.6, -150); box(1.9, .3, 24.2, mat({ color: 0x3a2010, roughness: .6 }), CXI + s * 5.6, 3.35, -150); IOBS.push([CXI + s * 5.6 - 1, CXI + s * 5.6 + 1, -162.2, -137.8]); }
      // le maître-autel, la croix d'or, la Pietà, les chandeliers
      const or2 = mat({ color: 0xd8b048, metalness: .85, roughness: .25 }); box(6, .3, 3, blanc, CXI, .15, -182); box(3.2, 1.1, 1.3, blanc, CXI, .85, -182.2); box(.12, 2.6, .12, or2, CXI, 2.7, -182.6); box(1.3, .12, .12, or2, CXI, 3.4, -182.6);
      for (const dx of [-1.3, -.6, .6, 1.3]) { cyl(.05, .08, .8, or2, CXI + dx, 1.8, -182.2, 8); cyl(.03, .03, .25, mat({ color: 0xfff8e8, emissive: 0xffe0a0, emissiveIntensity: .5 }), CXI + dx, 2.32, -182.2, 6); }
      box(2.2, 1.2, 1.2, blanc, CXI, .9, -185.5); add(new THREE.CapsuleGeometry(.35, .9, 4, 10), blanc, CXI, 2.1, -185.5); add(new THREE.SphereGeometry(.2, 10, 8), blanc, CXI, 2.95, -185.4); add(new THREE.CapsuleGeometry(.18, 1.1, 4, 8), blanc, CXI, 1.75, -185.1).rotation.z = Math.PI / 2;
      IOBS.push([CXI - 3, CXI + 3, -186.5, -180.5]);
      // la Vierge du pilier
      cyl(.28, .32, 2.2, blanc, CXI + 5.2, 1.1, -136.4, 12); add(new THREE.CapsuleGeometry(.24, .9, 4, 10), blanc, CXI + 5.2, 2.85, -136.4); add(new THREE.SphereGeometry(.15, 10, 8), blanc, CXI + 5.2, 3.6, -136.4); IOBS.push([CXI + 4.8, CXI + 5.6, -136.8, -136]); } }
  L.dedansOK = (x, z) => { if (!(x > -21 && x < 19 && z < -68.3 && z > -208)) return null; const u = x - CXI;
    const libre = () => !IOBS.some(([a, b, c, d]) => x > a && x < b && z > c && z < d);
    if (z > -72.6) return Math.abs(u) < 2.75 && Math.abs(u) > .55;   // (le portail)
    if (z > -82.8) return Math.abs(u) < 6.4 && libre();   // (le narthex)
    if (z > -187.6) return x > -15.8 && x < 13.8 && libre();
    return Math.hypot(u, z + 188) < 6.2 && libre(); };
  AMB.push(() => { const p = M && M.moiNum && M.gens.get(M.moiNum); L.dedans = !!(p && !L.enHaut && p.g.position.z < -71 && p.g.position.z > -200 && Math.abs(p.g.position.x - CXI) < 17); });
  const FAC = { x: -1, z: -69 };   // (le milieu de la façade, après le quart de tour)
  // le parvis : la statue de Charlemagne à cheval, le point zéro
  /* (10.150, d'après les photos) Charlemagne et ses leudes : le haut socle de pierre, sa corniche moulurée et sa frise ; le bronze vert-de-gris ; le cheval au pas, encolure arquée, crinière, une antérieure levée ;
     l'empereur couronné, la barbe fleurie, le manteau qui tombe sur la croupe, le sceptre fleurdelisé levé haut ; les deux leudes à pied qui tiennent la bride, casqués, la hache et la lance */
  { const bronze = mat({ color: 0x5a8a74, metalness: .45, roughness: .5 }), bronzeF = mat({ color: 0x3e6a58, metalness: .45, roughness: .55 }), socleM = mat({ color: 0xd2c8b2, roughness: .8 }), sx = -26, sz = -50, ry = Math.PI * .85;
    box(5.6, .5, 8.4, socleM, sx, .25, sz); box(5.0, .4, 7.8, socleM, sx, .7, sz); box(4.4, 3.4, 7.2, socleM, sx, 2.6, sz); box(4.8, .35, 7.6, socleM, sx, 4.45, sz); box(5.0, .3, 7.8, socleM, sx, 4.75, sz);
    for (let i = 0; i < 12; i++) { box(4.5, .12, .25, socleM, sx, 4.2, sz - 3.3 + i * .6); }
    const ch = new THREE.Group(); ch.position.set(sx, 4.9, sz); ch.rotation.y = ry; scene.add(ch);
    const B = (geo, x, y, z, rx = 0, sxx = 1, syy = 1, szz = 1, rz = 0, m = bronze) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.set(rx, 0, rz); o.scale.set(sxx, syy, szz); ch.add(o); return o; };
    const cap = (r, l) => new THREE.CapsuleGeometry(r, l, 6, 12);
    // le cheval
    B(cap(.62, 1.6), 0, 2.0, 0, Math.PI / 2, 1, 1, .95);   // (le corps)
    B(new THREE.SphereGeometry(.66, 14, 10), 0, 2.05, -.95, 0, 1, .95, 1);   // (la croupe)
    B(new THREE.SphereGeometry(.6, 14, 10), 0, 2.15, .95, 0, .95, 1, 1);   // (le poitrail)
    B(cap(.32, 1.0), 0, 2.85, 1.45, -.75);   // (l'encolure arquée)
    B(cap(.2, .62), 0, 3.25, 2.05, -1.95, 1, 1, 1.05);   // (la tête)
    for (const s of [-1, 1]) B(new THREE.ConeGeometry(.06, .22, 6), s * .1, 3.62, 1.82, -.4);
    B(new THREE.BoxGeometry(.08, .32, 1.1), 0, 3.12, 1.32, -.75, 1, 1, 1, 0, bronzeF);   // (la crinière)
    for (const [x, z, r1, r2] of [[-.32, .9, -.9, 1.6], [.32, .9, 0, 0], [-.32, -1.05, .1, 0], [.32, -1.05, -.08, 0]]) { const lv = r1 < -.5; B(cap(.12, .55), x, lv ? 1.45 : 1.15, z + (lv ? .3 : 0), r1); B(cap(.09, .5), x, lv ? 1.15 : .45, z + (lv ? .7 : 0), lv ? r2 : 0); B(new THREE.CylinderGeometry(.12, .14, .1, 10), x, lv ? 1.0 : .05, z + (lv ? .95 : 0)); }
    B(cap(.1, 1.0), 0, 1.6, -1.75, .35, 1, 1, 1, 0, bronzeF);   // (la queue)
    // l'empereur
    for (const s of [-1, 1]) { B(cap(.14, .55), s * .55, 2.35, .25, .9, 1, 1, 1, s * .25); B(cap(.11, .45), s * .7, 1.75, .45, -.2); }
    B(cap(.36, .55), 0, 3.15, 0); B(new THREE.ConeGeometry(.78, 1.9, 16, 1, true), 0, 2.85, -.35, -.35, 1, 1, 1, 0, bronzeF);   // (le buste, le manteau)
    B(new THREE.SphereGeometry(.24, 12, 10), 0, 3.85, .05); B(new THREE.SphereGeometry(.2, 10, 8), 0, 3.66, .18, 0, 1, 1.3, .7, 0, bronzeF);   // (la tête, la barbe)
    B(new THREE.CylinderGeometry(.25, .23, .22, 10), 0, 4.08, .05); for (let i = 0; i < 6; i++) { const an = i / 6 * Math.PI * 2; B(new THREE.ConeGeometry(.05, .16, 4), Math.cos(an) * .22, 4.25, .05 + Math.sin(an) * .22); } B(new THREE.BoxGeometry(.04, .2, .04), 0, 4.3, .05); B(new THREE.BoxGeometry(.14, .04, .04), 0, 4.33, .05);
    B(cap(.08, .6), .42, 3.65, .1, 0, 1, 1, 1, -.35); B(new THREE.CylinderGeometry(.035, .035, 2.6, 6), .62, 4.4, .15); B(new THREE.SphereGeometry(.1, 8, 6), .62, 5.7, .15); for (const s of [-1, 1]) B(new THREE.ConeGeometry(.05, .2, 4), .62 + s * .1, 5.68, .15, 0, 1, 1, 1, -s * .6);   // (le bras levé, le sceptre fleurdelisé)
    B(cap(.08, .5), -.4, 3.2, .35, -1.0);   // (l'autre bras, aux rênes)
    // les deux leudes
    for (const s of [-1, 1]) { const x = s * 1.25, z = .9; B(cap(.13, .55), x - .1, .55, z); B(cap(.13, .55), x + .1, .55, z + .15); B(cap(.3, .55), x, 1.45, z); B(new THREE.ConeGeometry(.42, .9, 12, 1, true), x, 1.2, z, 0, 1, 1, 1, 0, bronzeF);
      B(new THREE.SphereGeometry(.19, 10, 8), x, 2.05, z); B(new THREE.ConeGeometry(.21, .3, 10), x, 2.25, z, 0, 1, 1, 1, 0, bronzeF); B(new THREE.SphereGeometry(.15, 8, 6), x, 1.9, z + .1, 0, 1, 1.2, .7, 0, bronzeF);
      B(cap(.07, .5), x - s * .3, 1.7, z + .35, -1.2, 1, 1, 1, s * .4); B(new THREE.CylinderGeometry(.025, .025, s > 0 ? 2.8 : 1.4, 6), x + s * .4, s > 0 ? 1.4 : .9, z + .25, s > 0 ? 0 : .5); if (s < 0) B(new THREE.BoxGeometry(.05, .3, .25), x - .4, 1.5, z + .62); }
    OBS.push([sx - 3.2, sx + 3.2, sz - 4.6, sz + 4.6]);
    const pz = new THREE.Mesh(new THREE.CircleGeometry(.4, 24), mat({ color: 0xc8a040, metalness: .7, roughness: .3 })); pz.rotation.x = -Math.PI / 2; pz.position.set(FAC.x, .03, -58); scene.add(pz); }

  /* ---------- les bateaux (d'après les images) : le bateau-mouche classique et son enseigne, le bateau-mouche à pont ouvert, le bateau-taxi, la vedette en bois, la grande péniche de transport ---------- */
  const blancB = mat({ color: 0xf2f2ee, roughness: .4 }), vitreB = mat({ color: 0x9ab8c8, roughness: .08, metalness: .4, transparent: true, opacity: .42, side: THREE.DoubleSide, depthWrite: false }), boisB = mat({ color: 0x8a4a22, roughness: .5 }), noirB = mat({ color: 0x24282c, roughness: .6 }), orangeB = mat({ color: 0xe86a2a }), metB = mat({ color: 0x9a9ea2, metalness: .6, roughness: .4 });
  const enseigneT = tT(512, 96, (c, w, h) => { c.fillStyle = "#f4f2ea"; c.fillRect(0, 0, w, h); c.strokeStyle = "#2a2a2a"; c.lineWidth = 5; c.strokeRect(3, 3, w - 6, h - 6); c.fillStyle = "#1a2a4a"; c.font = `bold 52px ${serif}`; { const k = Math.min(1, (w - 40) / c.measureText("BATEAU-MOUCHE").width); c.font = `bold ${Math.floor(52 * k)}px ${serif}`; } c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("BATEAU-MOUCHE", w / 2, h / 2 + 3); }), enseigneM = mat({ map: enseigneT, roughness: .6 });
  const drapeau = (g, x, y) => { const b = (c, dz) => { const o = new THREE.Mesh(new THREE.BoxGeometry(.02, .5, .27), mat({ color: c })); o.position.set(x - .02, y + .3, dz); g.add(o); }; const m = new THREE.Mesh(new THREE.CylinderGeometry(.025, .025, 1.2, 5), metB); m.position.set(x, y, 0); g.add(m); b(0x1a3a8a, -.27); b(0xf4f4f4, 0); b(0xc81a2a, .27); };
  const coque = (g, L0, W, h, m, y) => { const b = new THREE.Mesh(new THREE.BoxGeometry(L0, h, W), m); b.position.y = y; g.add(b); for (const [sx, t0] of [[L0 / 2, 0], [-L0 / 2, Math.PI]]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(W / 2, W / 2, h, 16, 1, false, t0, Math.PI), m); p.position.set(sx, y, 0); if (sx > 0) p.scale.x = 1.5; g.add(p); } };
  const rambarde = (g, x0, x1, W, y) => { for (const sz of [-1, 1]) { const r = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, .04, .04), blancB); r.position.set((x0 + x1) / 2, y, sz * (W / 2 - .06)); g.add(r); for (let x = x0; x <= x1; x += 1.2) { const p = new THREE.Mesh(new THREE.BoxGeometry(.04, y - .9, .04), blancB); p.position.set(x, (y + .9) / 2, sz * (W / 2 - .06)); g.add(p); } } };
  const bateauMouche = (L0 = 28, W = 5, ouvert = false) => { const g = new THREE.Group(), b = (w, h, d, m, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); g.add(o); return o; };
    coque(g, L0, W, 1.3, blancB, .25); coque(g, L0 + .1, W + .1, .35, noirB, -.4); b(L0, .06, W - .1, mat({ color: 0x9a8a72 }), 0, .92, 0);
    const c0 = -L0 / 2 + 1.2, c1 = L0 / 2 - 5, cl = c1 - c0, cm = (c0 + c1) / 2, H = 1.9, yt = .95 + H;
    b(cl, .55, W - .5, blancB, cm, 1.22, 0);   // (l'allège)
    if (!ouvert) { for (const sz of [-1, 1]) b(cl, H - .55, .04, vitreB, cm, 1.5 + (H - .55) / 2, sz * (W / 2 - .25)); b(.04, H - .55, W - .5, vitreB, c1, 1.5 + (H - .55) / 2, 0); }
    for (let x = c0; x <= c1 + .01; x += 1.6) { for (const sz of [-1, 1]) b(.07, H, .07, blancB, x, .95 + H / 2, sz * (W / 2 - .25)); const rib = new THREE.Mesh(new THREE.TorusGeometry(W / 2 - .25, .05, 4, 14, Math.PI), blancB); rib.rotation.y = Math.PI / 2; rib.scale.set(1, .45, 1); rib.position.set(x, yt, 0); g.add(rib); }
    { const tg = new THREE.CylinderGeometry(W / 2 - .25, W / 2 - .25, cl, 16, 1, true, 0, Math.PI); tg.rotateZ(Math.PI / 2); tg.scale(1, .45, 1); const t = new THREE.Mesh(tg, ouvert ? mat({ color: 0xe8e8e2, transparent: true, opacity: .0, depthWrite: false }) : vitreB); t.position.set(cm, yt, 0); t.visible = !ouvert; g.add(t); }
    for (const sz of [-1, 1]) b(cl, .06, .08, blancB, cm, yt, sz * (W / 2 - .25));
    for (let x = c0 + 1; x < c1 - .5; x += 1.3) b(.45, .45, W - 1.5, boisB, x, 1.18, 0);   // (les banquettes)
    rambarde(g, c1, L0 / 2, W, 1.9); { const tor = new THREE.Mesh(new THREE.TorusGeometry(W / 2 - .06, .03, 4, 16, Math.PI), blancB); tor.rotation.set(-Math.PI / 2, 0, -Math.PI / 2); tor.scale.set(1.5, 1, 1); tor.position.set(L0 / 2, 1.9, 0); g.add(tor); }
    if (!ouvert) { for (const sx of [-1.8, 1.8]) b(.08, 1.0, .08, blancB, c1 - 2 + sx, yt + .9, 0); for (const r of [0, Math.PI]) { const e = new THREE.Mesh(new THREE.PlaneGeometry(4.4, .82), enseigneM); e.position.set(c1 - 2, yt + 1.55, r ? -.03 : .03); e.rotation.y = r; g.add(e); } }
    for (const sz of [-1, 1]) { const bo = new THREE.Mesh(new THREE.TorusGeometry(.28, .08, 6, 14), orangeB); bo.position.set(c1 + 1.2, 1.4, sz * (W / 2 + .02)); g.add(bo); }
    drapeau(g, -L0 / 2 - 1, 1.9); return g; };
  const taxi = (c = 0x1a2a4a) => { const g = new THREE.Group(), b = (w, h, d, m, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); g.add(o); return o; };
    coque(g, 6.5, 2.4, .95, mat({ color: c, roughness: .4 }), .1); b(7, .05, 2.3, boisB, .3, .6, 0); b(3, 1.0, 2.0, blancB, -.6, 1.1, 0); b(3.02, .38, 2.02, noirB, -.6, 1.3, 0); b(3.3, .08, 2.2, blancB, -.6, 1.64, 0); rambarde(g, -3.2, 2.8, 2.4, 1.15); drapeau(g, -3.6, 1.2); return g; };
  const vedette = () => { const g = new THREE.Group(), b = (w, h, d, m, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); g.add(o); return o; };
    coque(g, 3.6, 1.7, .6, boisB, .1); b(3.6, .06, 1.6, blancB, 0, .43, 0); const pb = new THREE.Mesh(new THREE.BoxGeometry(.05, .4, 1.4), vitreB); pb.position.set(.5, .65, 0); pb.rotation.z = -.4; g.add(pb); b(.6, .3, 1.3, blancB, -.5, .55, 0); return g; };
  const peniche = () => { const g = new THREE.Group(), b = (w, h, d, m, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); g.add(o); return o; }, brun = mat({ color: 0x3a3230, roughness: .7 }), gris = mat({ color: 0x6a6e70, roughness: .6, metalness: .2 });
    coque(g, 40, 5.6, 2.2, brun, 0); b(40, .2, 5.8, mat({ color: 0x5a2a22 }), 0, 1.1, 0);
    for (let i = 0; i < 7; i++) { b(4, .5, 4.6, gris, -11 + i * 4.3, 1.35, 0); b(4, .15, .3, gris, -11 + i * 4.3, 1.65, 0); }
    b(4, 1.8, 4.4, blancB, -17.5, 2.1, 0); b(4.02, .6, 4.42, noirB, -17.5, 2.5, 0); b(4.4, .12, 4.8, noirB, -17.5, 3.05, 0); b(1.6, 1.2, 1.6, mat({ color: 0x8a5a32 }), -15, 3.7, 0); b(1.62, .4, 1.62, noirB, -15, 3.9, 0);
    drapeau(g, -20.5, 2.3); return g; };
  const BAT = [];
  { const amarre = (g, x, z, y, ry = 0) => { g.position.set(x, y, z); g.rotation.y = ry; scene.add(g); };
    amarre(L.bmQuai = bateauMouche(28, 5, false), 36, 15.3, YE + .45);  amarre(taxi(), -100, 16.6, YE + .35); amarre(peniche(), -72, -15.0, YE + .55);
    for (const x of [36]) { box(1.2, .08, 1.4, metB, x - 4, YB + .3, 18.4); }   // (les passerelles)
    /* (10.149, d'après les photos) le restaurant-bateau à quai : la coque noire, le grand salon vitré et ses montants sombres, le toit gris arrondi, les lampadaires ronds aux deux bouts,
       les tables dressées à l'intérieur, la lumière chaude le soir ; sur le bas-port, sa terrasse : le plancher, les jardinières de buis, les parasols blancs, les tables et les chaises en rotin */
    { const X = 76, Z = 14.9, y0 = YE + .5, Lb = 32, Wb = 6.4, g = new THREE.Group(); g.position.set(X, y0, Z); scene.add(g); const b = (w, h, d, m, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); g.add(o); return o; };
      const vitreN = new THREE.MeshStandardMaterial({ color: 0xc8dce4, transparent: true, opacity: .18, roughness: .05, metalness: .4, depthWrite: false, side: THREE.DoubleSide }), coqueN = mat({ color: 0x1a1c20, roughness: .5, metalness: .2 }), grisT = mat({ color: 0x8a9096, roughness: .5, metalness: .3 }), montM = mat({ color: 0x24262a, roughness: .5 }), salon = mat({ color: 0xf2d8a8, emissive: 0xffc880, emissiveIntensity: .25, roughness: .8 });
      NUIT.push([salon, .25, 1.3]);
      coque(g, Lb, Wb, 1.8, coqueN, 0); b(Lb + .2, .12, Wb + .2, mat({ color: 0x5a4a3a }), 0, .95, 0);
      b(Lb - 4, .06, Wb - .8, mat({ color: 0x6a3a22, roughness: .6 }), 0, 1.06, 0); b(Lb - 4, .06, Wb - .8, salon, 0, 3.32, 0); b(.1, 2.3, Wb - .8, salon, -(Lb - 4) / 2 + .05, 2.2, 0); b(.1, 2.3, Wb - .8, salon, (Lb - 4) / 2 - .05, 2.2, 0); for (const s of [-1, 1]) b(Lb - 4, 2.3, .04, vitreN, 0, 2.2, s * (Wb - .8) / 2); b(Lb - 4, .45, .06, montM, 0, 1.25, (Wb - .8) / 2); b(Lb - 4, .45, .06, montM, 0, 1.25, -(Wb - .8) / 2);   /* (10.154 : le salon vitré, on voit les dîneurs à travers) */ for (let x = -(Lb - 4) / 2; x <= (Lb - 4) / 2 + .01; x += 1.4) for (const s of [-1, 1]) b(.08, 2.3, .08, montM, x, 2.2, s * (Wb - .7) / 2);
      { const tg = new THREE.CylinderGeometry(Wb / 2, Wb / 2, Lb - 2, 24, 1, false, -Math.PI / 2, Math.PI); tg.rotateZ(Math.PI / 2); tg.scale(1, .22, 1); const t = new THREE.Mesh(tg, grisT); t.position.set(0, 3.35, 0); g.add(t); }
      for (const s of [-1, 1]) { b(.6, 3.6, .6, coqueN, s * (Lb / 2 - .5), 2.3, 0); const gl = new THREE.Mesh(new THREE.SphereGeometry(.28, 12, 10), mat({ color: 0xfff4e0, emissive: 0xffe8c0, emissiveIntensity: .3 })); gl.position.set(s * (Lb / 2 - .5), 4.4, 0); g.add(gl); NUIT.push([gl.material, .3, 1.6]); }
      for (let x = -12; x <= 12; x += 2.4) for (const zz of [-1.6, 1.6]) { b(.8, .06, .8, mat({ color: 0xf8f6f0 }), x, 1.85, zz); b(.06, .8, .06, montM, x, 1.45, zz); }   // (les tables dressées)
      { let kd = 0; for (let x = -12; x <= 12; x += 2.4) for (const zz of [-1.6, 1.6]) { b(.04, .14, .04, mat({ color: 0xffe8b0, emissive: 0xffd080, emissiveIntensity: .8 }), x, 1.95, zz); for (const s of [-1, 1]) { if ((kd++ * 5) % 7 > 3 || (PEU && kd % 2)) continue; const f = kd % 2 === 1, m = personne3D({ taille: f ? 1.64 : 1.76, peau: ["#f0c9a6", "#c78f62", "#e8bd95", "#8d5a3b"][kd % 4], ch: ["#2a1a12", "#5a3a22", "#141010", "#e2c27a"][kd % 4], haut: ["#1a1a1c", "#7a2a3a", "#f2f0ea", "#2a3a5a", "#5a2a5a"][kd % 5], bas: "#1a1a1c", chaussures: "#1a1a1a", coif: f ? "long" : "court", pantalon: !f, robe: f });
          m.position.set(x + s * .62, 1.09 + .48 - m.userData.hipY, zz); m.rotation.y = s > 0 ? -Math.PI / 2 : Math.PI / 2; m.userData.poser("assis", 0); g.add(m); b(.4, .05, .4, mat({ color: 0x3a2418 }), x + s * .62, 1.55, zz); b(.05, .5, .4, mat({ color: 0x3a2418 }), x + s * .85, 1.8, zz); } } }   // (les dîneurs, à la lueur des bougies)
      box(1.4, .08, 3.6, metB, X - 6, YB + .25, 18.2); for (const s of [-1, 1]) box(.04, .9, 3.6, metB, X - 6 + s * .7, YB + .7, 18.2);   // (la passerelle)
      // le videur, à l'entrée de la terrasse : costume noir, bras croisés ; le cordon rouge et ses poteaux dorés
      { const vx = X - 15.2, vz = 20.4, m = personne3D({ taille: 1.9, peau: "#8d5a3b", ch: "#141010", haut: "#141414", bas: "#141414", chaussures: "#0a0a0a", coif: "chauve", pantalon: true }); m.position.set(vx, YB, vz); m.rotation.y = -Math.PI / 2; m.userData.poser("debout", 0); scene.add(m);
        const P = m.userData.parts; P.bras[0].e.rotation.set(-1.1, 0, .9); P.bras[0].c.rotation.set(-1.4, 0, 0); P.bras[1].e.rotation.set(-1.1, 0, -.9); P.bras[1].c.rotation.set(-1.4, 0, 0);
        const oreil = new THREE.Mesh(new THREE.SphereGeometry(.02, 6, 4), mat({ color: 0x1a1a1a })); oreil.position.set(.11, 0, 0); P.tete.add(oreil);
        const or = mat({ color: 0xc8a040, metalness: .8, roughness: .3 }), rouge = mat({ color: 0x8a1018, roughness: .6 }); for (const z of [19.2, 21.8]) { cyl(.04, .04, .95, or, vx - .6, YB + .48, z, 8); add(new THREE.SphereGeometry(.07, 8, 6), or, vx - .6, YB + 1.0, z); cyl(.18, .2, .05, or, vx - .6, YB + .03, z, 12); }
        const co = box(.05, .05, 2.6, rouge, vx - .6, YB + .8, 20.5); co.scale.y = 1; OBS.push([vx - .8, vx + .3, 19, 22.2]); }
      // la terrasse sur le bas-port
      sol(X - 14, X + 14, 18.3, 22.3, mat({ color: 0x8a6a48, roughness: .8 }), YB + .03);
      for (let x = X - 13.5; x <= X + 13.6; x += 1.5) { box(1.3, .5, .5, mat({ color: 0x5a3a26 }), x, YB + .25, 18.55); for (let i = 0; i < 3; i++) add(new THREE.IcosahedronGeometry(.28, 0), mat({ color: [0x3a6a2a, 0x4a7a34, 0x2e5a24][i] }), x - .35 + i * .35, YB + .72, 18.55); }
      const blancP = mat({ color: 0xf4f2ea, roughness: .7, side: THREE.DoubleSide }), rotin = mat({ color: 0xb8925a, roughness: .7 });
      for (let x = X - 11; x <= X + 11; x += 4.4) { const zc = 20.6; cyl(.04, .04, 2.4, montM, x, YB + 1.2, zc, 6); const pa = new THREE.Mesh(new THREE.ConeGeometry(1.7, .7, 8, 1, true), blancP); pa.position.set(x, YB + 2.5, zc); scene.add(pa);
        cyl(.4, .4, .04, tableM, x, YB + .74, zc, 14); cyl(.03, .03, .72, tableM, x, YB + .37, zc, 6); for (const [dx, dz] of [[-.65, 0], [.65, 0], [0, .65]]) { const cap = Math.atan2(-dx, -dz); box(.42, .05, .42, rotin, x + dx, YB + .46, zc + dz, cap); box(.42, .4, .05, rotin, x + dx * 1.35, YB + .7, zc + dz * 1.35, cap); }
        OBS.push([x - 1.1, x + 1.1, zc - .9, zc + .9]); } }
    // ceux qui passent : un bateau-mouche dans chaque sens sous l'arche du milieu ; la vedette et le bateau-taxi, et leur sillage d'écume
    const sillT = tT(256, 64, (c, w, h) => { c.clearRect(0, 0, w, h); for (let i = 0; i < 1400; i++) { const u = al(), sp = (1 - u) * h * .48, y = h / 2 + (al() < .5 ? -1 : 1) * sp * (.75 + al() * .25); c.fillStyle = `rgba(255,255,255,${u * .7 * al()})`; c.fillRect(u * w, y - 1, 3, 2); } for (let i = 0; i < 300; i++) { const u = al(); c.fillStyle = `rgba(235,245,245,${u * .35})`; c.fillRect(u * w, h / 2 + (al() - .5) * (1 - u) * h * .5, 4, 2); } });
    const sillM = new THREE.MeshBasicMaterial({ map: sillT, transparent: true, depthWrite: false });
    const sillage = (g, lg, lar, dx) => { const s = new THREE.Mesh(new THREE.PlaneGeometry(lg, lar), sillM); s.rotation.x = -Math.PI / 2; s.position.set(dx - lg / 2, .02 - (g.userData.ye || 0), 0); g.add(s); };
    for (const [g, z, v, y, lg, ar] of [[bateauMouche(28, 5, false), -3.2, 3.6, YE + .45, 24, -14], [bateauMouche(26, 5, true), 3.2, -3.0, YE + .45, 22, -13], [vedette(), 11.5, 9, YE + .25, 14, -1.8], [taxi(0x2a2a30), -11.8, -7, YE + .35, 16, -3.3]]) {
      g.userData.ye = y - YE; sillage(g, lg, lg * .35, ar); g.userData.anime = true; scene.add(g); BAT.push({ g, z, v, y, x0: al() * 300 }); } }

  /* ---------- (10.147) les voitures des années 80 : la R5, la 205, la 2CV, la 4L, la BX, le taxi parisien (une 505 et son lumineux) — profils de carrosserie, vitres,
     montants, pare-chocs, phares, feux, plaques (blanche devant, jaune derrière), rétroviseurs, roues et enjoliveurs ; par la rue du Petit-Pont, le pont, le quai de l'île ---------- */
  const VOIT = [], FEUX = { phase: "vert", pv: "rouge" };
  { const COUL = [0xc8102e, 0xf2f0ea, 0xd8c9a3, 0x1f4e8c, 0x2e6b3a, 0x8a8f96, 0xe2b11f, 0x6b1e2b, 0x3a3a3a, 0x9fc2d8, 0xd95f1e, 0x4b3a6b];
    const vitreV = mat({ color: 0x24303a, roughness: .08, metalness: .5 }), noirV = mat({ color: 0x161616, roughness: .7 }), chromeV = mat({ color: 0xd8dadd, metalness: .85, roughness: .2 }), plB = mat({ color: 0xf2f2ee }), plJ = mat({ color: 0xf0c828 });
    const phV = mat({ color: 0xfff6d8, emissive: 0xfff0c0, emissiveIntensity: .25 }), feuV = mat({ color: 0xb8102a, emissive: 0x900010, emissiveIntensity: .3 }), orV = mat({ color: 0xf0a020, emissive: 0xa06000, emissiveIntensity: .2 });
    NUIT.push([phV, .25, 1.4], [feuV, .3, 1.1]);
    const pneu = new THREE.CylinderGeometry(.3, .3, .19, 16), enjo = new THREE.CylinderGeometry(.18, .18, .2, 12);
    // les profils (x : vers l'avant ; y : la hauteur) — la carrosserie, puis la verrière
    const MOD = {
      r5: { c: [[-1.75, .32], [-1.76, .95], [-1.63, 1.38], [.32, 1.4], [.95, .96], [1.7, .86], [1.76, .5], [1.74, .32]], v: [[-1.62, .98], [-1.52, 1.33], [.3, 1.34], [.86, .98]], l: 1.56, ro: [1.12, -1.15], rond: false },
      p205: { c: [[-1.85, .32], [-1.86, .92], [-1.7, 1.37], [.22, 1.4], [.98, .94], [1.8, .8], [1.86, .48], [1.84, .32]], v: [[-1.72, .96], [-1.6, 1.33], [.2, 1.35], [.88, .96]], l: 1.58, ro: [1.2, -1.22], rond: false },
      deuche: { c: [[-1.92, .4], [-1.94, .86], [-1.75, 1.18], [-1.25, 1.5], [-.6, 1.6], [.25, 1.6], [.55, 1.12], [1.35, 1.0], [1.78, .82], [1.92, .58], [1.9, .4]], v: [[-1.5, 1.2], [-1.1, 1.47], [.2, 1.52], [.45, 1.12]], l: 1.48, ro: [1.2, -1.15], rond: true },
      r4: { c: [[-1.83, .34], [-1.84, 1.42], [.32, 1.48], [.7, 1.0], [1.78, .94], [1.84, .55], [1.82, .34]], v: [[-1.74, 1.0], [-1.72, 1.38], [.28, 1.42], [.62, 1.0]], l: 1.5, ro: [1.15, -1.2], rond: true },
      bx: { c: [[-2.1, .32], [-2.14, .92], [-1.4, 1.36], [.15, 1.4], [1.0, .95], [2.12, .8], [2.18, .45], [2.15, .32]], v: [[-1.9, .96], [-1.32, 1.32], [.12, 1.35], [.9, .96]], l: 1.66, ro: [1.4, -1.35], rond: false },
      taxi: { c: [[-2.3, .32], [-2.32, .95], [-1.65, 1.0], [-1.05, 1.42], [.38, 1.44], [1.02, 1.0], [2.25, .9], [2.32, .5], [2.3, .32]], v: [[-1.55, 1.02], [-1.0, 1.38], [.35, 1.4], [.92, 1.02]], l: 1.7, ro: [1.45, -1.4], rond: false } };
    const extr = (pts, w, m, bev) => { const s = new THREE.Shape(); s.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) s.lineTo(p[0], p[1]); s.closePath();
      const g = new THREE.ExtrudeGeometry(s, { depth: w, bevelEnabled: !!bev, bevelThickness: .05, bevelSize: .05, bevelSegments: 2 }); g.translate(0, 0, -w / 2); g.rotateY(-Math.PI / 2); return new THREE.Mesh(g, m); };   // (l'avant vers +z, comme les promeneurs)
    const voiture = (type, k) => { const D = MOD[type], g = new THREE.Group(), cM = type === "taxi" ? mat({ color: [0x2a2a2c, 0xe8e4da, 0x1f2a4a][k % 3], roughness: .35, metalness: .35 }) : mat({ color: COUL[(k * 5 + 3) % COUL.length], roughness: .4, metalness: .25 }), W = D.l, b = (w, h, d, m, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); g.add(o); return o; };
      g.add(extr(D.c, W - .1, cM, true)); { const cx = D.v.reduce((s, q) => s + q[0], 0) / 4, cy = D.v.reduce((s, q) => s + q[1], 0) / 4; g.add(extr(D.v.map(([x, y]) => [cx + (x - cx) * 1.08, cy + (y - cy) * 1.06]), W + .06, vitreV)); }   /* (10.149 : le pare-brise, la lunette, les vitres, qui dépassent de la carrosserie : on les voit) */
      { const xm = (D.v[0][0] + D.v[3][0]) / 2; b(W - .01, .45, .1, cM, 0, 1.15, xm * -1 * 0 + xm); }   // le montant du milieu
      const xa = D.c[D.c.length - 2][0], xr = D.c[1][0];   // (l'avant, l'arrière)
      for (const [zz, s] of [[xa + .04, 1], [xr - .04, -1]]) { b(W + .04, .16, .14, D.rond ? chromeV : noirV, 0, .42, zz); b(.5, .11, .02, s > 0 ? plB : plJ, 0, .58, zz + s * .08); }   // les pare-chocs, les plaques
      for (const sx of [-1, 1]) { if (D.rond) { const p = new THREE.Mesh(new THREE.CylinderGeometry(.1, .1, .06, 12), phV); p.rotation.x = Math.PI / 2; p.position.set(sx * W * .32, .72, xa); g.add(p); } else b(.36, .14, .05, phV, sx * W * .3, .66, xa + .01);
        b(.24, .16, .05, feuV, sx * (W / 2 - .2), .7, xr - .01); b(.08, .06, .05, orV, sx * (W / 2 - .06), .62, xa + .01); b(.08, .07, .14, noirV, sx * (W / 2 + .05), 1.0, (D.v[3][0] + .1)); }   // phares, feux, clignotants, rétroviseurs
      if (!D.rond) b(W * .5, .12, .04, noirV, 0, .62, xa + .02);   // la calandre
      for (const zz of D.ro) for (const sx of [-1, 1]) { const r = new THREE.Mesh(pneu, noirV); r.rotation.z = Math.PI / 2; r.position.set(sx * (W / 2 - .08), .3, zz); g.add(r); const e = new THREE.Mesh(enjo, chromeV); e.rotation.z = Math.PI / 2; e.position.copy(r.position); e.position.x += sx * .01; g.add(e); }
      if (type === "taxi") { b(.62, .16, .22, mat({ color: 0xf2f2ee, emissive: 0xfff2c0, emissiveIntensity: .3 }), 0, 1.53, -.2); }   // le lumineux « TAXI PARISIEN »
      scene.add(g); return g; };
    const CH = [{ P: [[1.6, 138], [1.6, -29.0], [152, -29.0]], stops: [[1.6, 42.8, "A"], [1.6, -24.2, "A"]] }, { P: [[-152, -29.0], [-3.6, -29.0], [-3.6, 138]], stops: [[-12.6, -29.0, "A"], [-3.6, 24.6, "A"]] },
      { P: [[155, 32.4], [-155, 32.4]], stops: [[13.2, 32.4, "B"]] }, { P: [[-155, 36.2], [155, 36.2]], stops: [[-15.2, 36.2, "B"]] }];   /* (10.148 : le quai a sa chaussée pavée, une voie dans chaque sens) */
    const TYPES = ["r5", "taxi", "p205", "deuche", "taxi", "r4", "bx", "taxi", "p205"];   /* (10.160 : plus de taxis) */
    CH.forEach((C, j) => { let lg = 0; const seg = []; for (let i = 1; i < C.P.length; i++) { const d = Math.hypot(C.P[i][0] - C.P[i - 1][0], C.P[i][1] - C.P[i - 1][1]); seg.push([lg, d, C.P[i - 1], C.P[i]]); lg += d; }
      const sAt = ([x, z]) => { for (const [l0, d, a, b] of seg) { const u = ((x - a[0]) * (b[0] - a[0]) + (z - a[1]) * (b[1] - a[1])) / (d * d); if (u >= -.01 && u <= 1.01 && Math.hypot(a[0] + (b[0] - a[0]) * u - x, a[1] + (b[1] - a[1]) * u - z) < .5) return l0 + u * d; } return -1; };
      const stops = C.stops.map(st => [sAt(st), st[2]]), n = PEU ? 3 : (j > 1 ? 4 : 5); for (let k = 0; k < n; k++) { const bus = (j === 0 || j === 2) && k === 1;   /* (10.160 : le bus parisien dans la circulation, sa girouette) */
        let g; if (bus) { g = new THREE.Group(); scene.add(g); GIROU = j ? ["47", "Notre-Dame"] : ["21", "Saint-Michel"]; const b = busCaserne(scene, "ratp", 0, 0, -Math.PI / 2); b.position.set(0, -.15, 0); g.add(b); } else g = voiture(TYPES[(k + j * 3) % TYPES.length], k + j * 5);
        VOIT.push({ g, seg, lg, stops, s: k * lg / n + j * 11, v: 0, vmax: bus ? 6.5 : 8 + (k % 3), ch: j, long: bus ? 7 : 0 }); } }); }
  /* ---------- les feux tricolores (à la parisienne : le mât vert sombre, le boîtier noir et sa visière) et les feux des piétons ; les passages cloutés ---------- */
  { const mt = mat({ color: 0x24302a, metalness: .5, roughness: .5 }), noirF = mat({ color: 0x141414, roughness: .6 });
    const jeu = () => ({ R: mat({ color: 0x3a0a0a, emissive: 0xff2010, emissiveIntensity: 0 }), O: mat({ color: 0x3a2a0a, emissive: 0xff9a10, emissiveIntensity: 0 }), V: mat({ color: 0x0a3a1a, emissive: 0x20ff60, emissiveIntensity: 0 }) });
    const pT = (vert) => tT(32, 32, (c, w, h) => { c.fillStyle = "#111"; c.fillRect(0, 0, w, h); c.fillStyle = vert ? "#ffffff" : "#ffffff"; c.beginPath(); c.arc(16, 7, 3.4, 0, 7); c.fill(); if (vert) { c.fillRect(13, 11, 6, 9); c.fillRect(10, 19, 4, 10); c.fillRect(18, 19, 4, 10); c.fillRect(8, 12, 4, 6); c.fillRect(20, 12, 4, 6); } else { c.fillRect(12, 11, 8, 10); c.fillRect(12, 20, 3, 9); c.fillRect(17, 20, 3, 9); } });
    const tR = pT(false), tV = pT(true), pJeu = () => ({ PR: mat({ color: 0x220808, emissive: 0xff2a1a, emissiveMap: tR, map: tR, emissiveIntensity: 0 }), PV: mat({ color: 0x082208, emissive: 0x30ff70, emissiveMap: tV, map: tV, emissiveIntensity: 0 }) });
    L.feuxM = { A: jeu(), B: jeu(), QA: pJeu(), QB: pJeu() };
    const feu = (x, z, ry, car, pi) => { const T = new THREE.Matrix4().makeRotationY(ry).setPosition(x, TR.some(([a, b, c, d]) => x >= a && x <= b && z >= c && z <= d) ? TROT : 0, z), A2 = (geo, m, px, py, pz, rx = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(px, py, pz); o.rotation.x = rx; o.applyMatrix4(T); scene.add(o); };
      A2(new THREE.CylinderGeometry(.06, .08, car ? 3.0 : 2.2, 8), mt, 0, car ? 1.5 : 1.1, 0);
      if (car) { const J = L.feuxM[car]; A2(new THREE.BoxGeometry(.32, .95, .26), noirF, 0, 2.75, .12); [[J.R, 3.04], [J.O, 2.75], [J.V, 2.46]].forEach(([m, y]) => { A2(new THREE.CircleGeometry(.1, 16), m, 0, y, .26); A2(new THREE.BoxGeometry(.26, .03, .14), noirF, 0, y + .12, .3, .3); }); }
      if (pi) { const J = L.feuxM[pi], y0 = car ? 1.75 : 1.95; A2(new THREE.BoxGeometry(.26, .5, .2), noirF, 0, y0, .1); A2(new THREE.PlaneGeometry(.2, .2), J.PR, 0, y0 + .12, .205); A2(new THREE.PlaneGeometry(.2, .2), J.PV, 0, y0 - .12, .205); }
      OBS.push([x - .15, x + .15, z - .15, z + .15]); };
    // (les feux des voitures, à droite de chaque voie, avant la ligne d'arrêt)
    feu(8.6, 42.6, 0, "A", "QB"); feu(-9.4, 24.0, Math.PI, "A", "QB"); feu(7.4, -23.9, 0, "A", null); feu(-12.9, -31.0, -Math.PI / 2, "A", "QB");
    feu(13.2, 29.6, Math.PI / 2, "B", "QA"); feu(-15.2, 38.7, -Math.PI / 2, "B", "QA");
    // (les feux des piétons, au bout de chaque passage)
    feu(-14.6, 29.7, 0, null, "QA"); feu(-10.4, 38.7, Math.PI, null, "QA"); feu(8.6, 29.7, 0, null, "QA"); feu(12.4, 38.7, Math.PI, null, "QA");
    feu(-10.5, 41.9, Math.PI / 2, null, "QB"); feu(8.5, 29.8, -Math.PI / 2, null, "QB"); feu(-10.4, -31.2, Math.PI / 2, null, "QB"); feu(9.8, -31.2, -Math.PI / 2, null, "QB");
    // les passages cloutés, à chaque carrefour, d'un trottoir à l'autre : à travers la rue du Petit-Pont (le long du parapet, le long des immeubles), à travers la chaussée du quai (des deux côtés de la rue), à travers la chaussée de l'île
    const bl = mat({ color: 0xf0eee6, roughness: .7 });
    for (const [zc, w] of [[27.8, 4.2], [40.2, 3.0]]) for (let x = PP[0] + .5; x < PP[1] - .3; x += 1.0) box(.5, .012, w, bl, x, .04, zc);
    for (const xc of [-12.5, 10.5]) for (let z = 30.6; z < 38.0; z += 1.0) box(3.0, .012, .5, bl, xc, .04, z);
    for (const xc of [-8.8, 6.8]) for (let z = -30.1; z < -27.7; z += 1.0) box(2.4, .012, .5, bl, xc, .04, z);
    box(8.4, .012, .3, bl, 3.8, .04, 42.6); box(6.4, .012, .3, bl, -4.4, .04, 24.8); box(.3, .012, 3.6, bl, 13.4, .04, 32.4); box(.3, .012, 3.6, bl, -15.4, .04, 36.2);   // (les lignes d'arrêt)
    for (let x = -XS; x < XS; x += 6) if (x < -18 || x > 15) box(3, .012, .14, bl, x, .035, 34.3); }   // (la ligne du milieu du quai)

  /* ---------- du monde : les promeneurs sur le quai, au bord de l'eau, sur le pont et le parvis ; des touristes qui photographient la cathédrale ---------- */
  const MARCH = [], PE = ["#f0c9a6", "#c78f62", "#e8bd95", "#8d5a3b", "#f6d6bc", "#6a4028"], HA = ["#2a3a5a", "#7a2a3a", "#3a3a40", "#e8e2d6", "#5a4636", "#2f5a4a", "#c8a040", "#1a1a1c", "#8a2a2a", "#4a5a7a"];
  const gens = (k) => { const f = k % 2 === 1; return personne3D({ taille: f ? 1.64 : 1.76, peau: PE[k % 6], ch: ["#2a1a12", "#5a3a22", "#141010", "#8a8a8a", "#e2c27a"][k % 5], haut: HA[k % 10], bas: ["#26324e", "#2a2a30", "#3a3028", "#5a6a7a"][k % 4], chaussures: ["#1a1a1a", "#e8e8e8"][k % 2], coif: f ? (k % 3 ? "long" : "carre") : k % 4 ? "court" : "chauve", pantalon: !f || k % 3 === 0, robe: f && k % 3 !== 0 }); };
  { const R = [[[-2.5, -62], [-2.5, -76], [-10.2, -89.4], [-10.2, -125.8], [-5.2, -125.8], [-5.2, -131], [-10.2, -131], [-10.2, -170], [-10.2, -89.4], [-2.5, -76], [-2.5, -62]], [[.5, -62], [.5, -76], [8.2, -89.4], [8.2, -125.8], [3.2, -125.8], [3.2, -131], [8.2, -131], [8.2, -170], [8.2, -89.4], [.5, -76], [.5, -62]], [[-1, -88.6], [-1, -121.4]], [[-140, 28.0], [140, 28.0]], [[140, 27.8], [-140, 27.8]], [[-140, 39.2], [140, 39.2]], [[140, 44.8], [-140, 44.8]], [[-140, 20.4], [58, 20.4]], [[58, 21.2], [-140, 21.2]], [[94, 20.6], [140, 20.6]],
      [[-37.3, 30], [-37.3, 23.8], [-50.5, 23.8], [-50.5, 21], [-120, 21], [-50.5, 21], [-50.5, 23.8], [-37.3, 23.8]], [[-12.4, 70], [-12.4, 28.6], [-8.8, 24], [-8.8, -33], [-30, -56], [28, -56], [6.8, -33], [6.8, 24], [10.5, 28.6], [10.5, 70]],
      [[-28, -40], [26, -40]],  [[-140, -31.3], [27, -31.3], [27, -34.2], [33.2, -34.2], [33.2, -31.3], [140, -31.3], [33.2, -31.3], [33.2, -34.2], [27, -34.2], [27, -31.3]], [[-26, -75], [-26, -190], [-23, -190], [-23, -75]], [[21.2, -75], [21.2, -190], [21.6, -190], [21.6, -75]], [[-29, -67], [27, -67]], [[-27.6, -45], [-27.6, -130], [-27.6, -45]], [[20.8, -130], [20.8, -45], [20.8, -130]], [[-20, -36], [18, -66], [-16, -64], [14, -38]], [[0, -34], [0, -66], [12, -50], [-12, -50]], [[-24, -55], [22, -45], [-6, -40], [8, -62]], [[10, -36], [-18, -48], [6, -58], [20, -66]]];
    for (let k = 0, n = PEU ? 18 : 40; k < n; k++) { const Rr = R[k % R.length], m = gens(k), i0 = (k * 3) % Rr.length, a = Rr[i0], b = Rr[(i0 + 1) % Rr.length], u = ((k * 37) % 100) / 100; m.position.set(a[0] + (b[0] - a[0]) * u, 0, a[1] + (b[1] - a[1]) * u); m.userData.poser("marche", 0); m.userData.anime = true; scene.add(m);
      MARCH.push({ m, R: Rr, i: (i0 + 1) % Rr.length, v: .9 + (k % 5) * .12 }); }
    for (let k = 0; k < (PEU ? 4 : 9); k++) { const m = gens(k + 40), x = -12 + (k % 3) * 9 + al() * 3, z = -40 - Math.floor(k / 3) * 5; m.position.set(x, 0, z); m.rotation.y = Math.PI + (al() - .5) * .6; m.userData.anime = true; scene.add(m); m.userData.poser("debout", 0);
      const P = m.userData.parts; P.bras[1].e.rotation.x = -1.6; P.bras[1].c.rotation.x = -1.1; P.bras[0].e.rotation.x = -1.4; P.bras[0].c.rotation.x = -1.2; P.tete.rotation.x = -.2;   // (ils photographient la cathédrale)
      const ap = new THREE.Mesh(new THREE.BoxGeometry(.14, .09, .05), mat({ color: 0x1a1a1a })); ap.position.y = -m.userData.hipY * .36; P.bras[1].c.add(ap); } }

  /* ---------- (10.147) l'ambiance, comme à Montmartre : des gens attablés aux terrasses, l'accordéoniste du quai et son étui ouvert, le peintre à son chevalet face à la Seine, les pigeons sur les pavés ---------- */
  { for (let i = 0; i < TERR.length; i++) { if ((i * 7) % 10 > 6 || AMB.length > (PEU ? 12 : 36)) continue; const [x, z, cap] = TERR[i], m = gens(i + 60); m.position.set(x, TROT + .48 - m.userData.hipY, z); m.rotation.y = cap; m.userData.poser("assis", 0); m.userData.anime = true; scene.add(m); AMB.push((tm) => { const P = m.userData.parts; P.tete.rotation.y = Math.sin(tm / 1700 + i) * .35; P.bras[(i % 2)].e.rotation.x = -.6 - Math.max(0, Math.sin(tm / 2300 + i * 2)) * .7; }); }
    // (10.149) les serveurs : chemise blanche, gilet et tablier noirs, le plateau à la main ; ils vont et viennent entre les guéridons
    for (const S of SERV) { if (PEU && S.k % 2) continue; const m = personne3D({ taille: 1.76, peau: PE[S.k % 6], ch: ["#2a1a12", "#141010", "#5a3a22"][S.k % 3], haut: "#f4f2ec", bas: "#141414", chaussures: "#141414", coif: "court", pantalon: true }); m.userData.anime = true; scene.add(m);
      const P = m.userData.parts, tab = new THREE.Mesh(new THREE.BoxGeometry(.5, .5, .5), mat({ color: 0x141414 })); tab.scale.set(.9, .9, .02); void tab;
      const tbl = new THREE.Mesh(new THREE.CylinderGeometry(.2, .2, .02, 14), mat({ color: 0xc8c8c8, metalness: .7, roughness: .3 })); scene.add(tbl); const verre = new THREE.Mesh(new THREE.CylinderGeometry(.03, .025, .1, 8), mat({ color: 0xc83a2a, transparent: true, opacity: .8 })); scene.add(verre);
      const tablier = new THREE.Mesh(new THREE.BoxGeometry(.36, .6, .02), mat({ color: 0x141414 })); tablier.position.set(0, -.3, .13); P.bassin.add(tablier);
      let u = (S.k * .37) % 1, sens = 1, pause = 0; const z0 = 2.75;
      AMB.push((tm, dt) => { dt = dt || .016; if (pause > 0) { pause -= dt; m.userData.poser("debout", tm); } else { u += sens * dt * .9 / (S.W2 * 2); if (u > 1 || u < 0) { sens = -sens; u = Math.max(0, Math.min(1, u)); pause = 2 + (S.k % 3); } m.userData.poser("marche", tm); }
        const lx = -S.W2 + .4 + u * (S.W2 * 2 - .8), w = new THREE.Vector3(lx, TROT, z0).applyMatrix4(S.T); m.position.copy(w); const f = new THREE.Vector3(sens, 0, 0).transformDirection(S.T); m.rotation.y = Math.atan2(f.x, f.z);
        P.bras[1].e.rotation.set(-1.45, 0, 0); P.bras[1].c.rotation.set(-.15, 0, 0); m.updateMatrixWorld(true); const h = new THREE.Vector3(); P.bras[1].c.getWorldPosition(h); const fw = new THREE.Vector3(Math.sin(m.rotation.y), 0, Math.cos(m.rotation.y));
        tbl.position.set(h.x + fw.x * .32, h.y + .02, h.z + fw.z * .32); verre.position.set(tbl.position.x, tbl.position.y + .06, tbl.position.z); }); }
    // (10.150) les bouquinistes d'autrefois, assis sur leur tabouret près de leur boîte : la barbe blanche, le chapeau, la casquette, le béret, le châle de la vieille dame
    { const boisT = mat({ color: 0x6a4a2a, roughness: .8 }), feutre = ["#2a2420", "#3a3a40", "#5a4a3a", "#1a1a1e"].map(c => mat({ color: c, roughness: .9 })), blanc = mat({ color: 0xe8e4dc, roughness: 1 });
      VEND.forEach(([p, ry, k], i) => { if (PEU && i % 2) return; const f = i % 3 === 1, m = personne3D({ taille: f ? 1.58 : 1.72, peau: ["#e8c8a8", "#d8a888", "#f0d0b8"][i % 3], ch: ["#e8e4dc", "#b8b4ac", "#8a8680"][i % 3], haut: ["#3a3028", "#2a3a4a", "#5a3a2a", "#4a4a3a", "#6a2a2a"][i % 5], bas: ["#2a2a30", "#3a3028", "#4a3a2a"][i % 3], chaussures: "#2a1a14", coif: f ? "carre" : i % 2 ? "court" : "chauve", pantalon: !f, robe: f });
        const y = TR.some(([a1, b1, c1, d1]) => p.x >= a1 && p.x <= b1 && p.z >= c1 && p.z <= d1) ? TROT : 0; m.position.set(p.x, y + .5 - m.userData.hipY, p.z); m.rotation.y = ry + .5; m.userData.poser("assis", 0); m.userData.anime = true; scene.add(m);
        cyl(.18, .16, .04, boisT, p.x, y + .48, p.z, 10); for (let j = 0; j < 3; j++) { const an = j / 3 * Math.PI * 2; cyl(.02, .025, .48, boisT, p.x + Math.cos(an) * .13, y + .24, p.z + Math.sin(an) * .13, 5); }
        const P = m.userData.parts, rT = .1;
        if (f) { const ch2 = new THREE.Mesh(new THREE.ConeGeometry(.3, .35, 12, 1, true), mat({ color: [0x6a3a4a, 0x3a4a6a][i % 2], roughness: 1, side: THREE.DoubleSide })); ch2.position.set(0, .15, 0); P.buste.add(ch2); }   // (le châle)
        else { if (i % 2 === 0) { const b = new THREE.Mesh(new THREE.SphereGeometry(rT * .9, 10, 8), blanc); b.scale.set(1, 1.3, .7); b.position.set(0, -rT * .75, rT * .55); P.tete.add(b); }   // (la barbe blanche)
          const t = i % 4; if (t === 0) { const h1 = new THREE.Mesh(new THREE.CylinderGeometry(rT * 1.05, rT * 1.1, rT * 1.1, 12), feutre[i % 4]); h1.position.y = rT * .95; P.tete.add(h1); const h2 = new THREE.Mesh(new THREE.CylinderGeometry(rT * 1.8, rT * 1.8, .02, 14), feutre[i % 4]); h2.position.y = rT * .45; P.tete.add(h2); }   // (le chapeau)
          else if (t === 2) { const h1 = new THREE.Mesh(new THREE.SphereGeometry(rT * 1.25, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), feutre[(i + 1) % 4]); h1.scale.y = .45; h1.position.set(0, rT * .6, 0); P.tete.add(h1); }   // (le béret)
          else { const h1 = new THREE.Mesh(new THREE.CylinderGeometry(rT * 1.05, rT * 1.1, rT * .5, 12), feutre[(i + 2) % 4]); h1.position.y = rT * .75; P.tete.add(h1); const v = new THREE.Mesh(new THREE.BoxGeometry(rT * 1.6, .015, rT), feutre[(i + 2) % 4]); v.position.set(0, rT * .55, rT * 1.1); P.tete.add(v); } }   // (la casquette)
        OBS.push([p.x - .35, p.x + .35, p.z - .35, p.z + .35]);
        AMB.push((tm) => { P.tete.rotation.y = Math.sin(tm / 2100 + i) * .4; P.tete.rotation.x = Math.max(0, Math.sin(tm / 3700 + i * 2)) * .3; }); }); }
    // (10.151) des clients qui flânent sur la petite place, choisissent une table libre, s'assoient un moment, puis repartent
    { const SG = TERR.map((t, i) => [t[0], t[1], t[2], i]).filter(([x, z, c, i]) => (i * 7) % 10 > 6 && x < -35 && x > -80 && z < -43 && z > -65).map(s => ({ s, pris: false })), CPX = -57, CPZ = -54;
      const auHasard = () => { for (let t = 0; t < 20; t++) { const x = CPX - 13 + al() * 26, z = CPZ - 6.5 + al() * 13; if (Math.hypot(x - CPX, z - CPZ) > 5.2) return [x, z]; } return [CPX - 10, CPZ]; };
      const abord = ([x, z]) => { const dx = CPX - x, dz = CPZ - z, l = Math.hypot(dx, dz) || 1; return [x + dx / l * 3.6, z + dz / l * 3.6]; };
      for (let k = 0; k < Math.min(PEU ? 2 : 5, SG.length); k++) { const m = gens(k + 140), [x0, z0] = auHasard(); m.position.set(x0, 0, z0); m.userData.anime = true; scene.add(m);
        const C = { m, etat: "flane", pts: [auHasard()], siege: null, fin: 0, v: .9 + (k % 3) * .15 };
        AMB.push((tm, dt) => { dt = dt || .016; const g = C.m;
          if (C.etat === "assis") { const P = g.userData.parts; P.tete.rotation.y = Math.sin(tm / 1800 + k) * .35; if (tm > C.fin) { C.etat = "part"; const s = C.siege; s.pris = false; C.siege = null; C.pts = [abord(s.s), auHasard(), auHasard()]; g.position.y = 0; } return; }
          const p0 = C.pts[0]; if (!p0) { if (C.etat === "va") { const s = C.siege.s; g.position.set(s[0], TROT + .48 - g.userData.hipY, s[1]); g.rotation.y = s[2]; g.userData.poser("assis", 0); C.etat = "assis"; C.fin = tm + 15000 + al() * 30000; return; }
            const libres = SG.filter(q => !q.pris); if (libres.length && al() < .7) { const q = libres[(al() * libres.length) | 0]; q.pris = true; C.siege = q; C.etat = "va"; C.pts = [abord(q.s), [q.s[0], q.s[1]]]; } else C.pts = [auHasard()]; return; }
          const dx = p0[0] - g.position.x, dz = p0[1] - g.position.z, d = Math.hypot(dx, dz); if (d < .25) { C.pts.shift(); return; }
          const v = Math.min(d, C.v * dt); g.position.x += dx / d * v; g.position.z += dz / d * v; contourne(g.position, p0[0], p0[1], v); g.position.y = L.hauteur(g.position.x, g.position.z); g.rotation.y = Math.atan2(dx, dz); g.userData.poser("marche", tm * C.v / 1.2); }); } }
    // (10.154) le jongleur du parvis : la marinière, le chapeau melon posé par terre avec quelques pièces ; trois balles, rouge, bleue et jaune, en cascade
    { const jx = 8, jz = -45, m = personne3D({ taille: 1.74, peau: "#e8c4a0", ch: "#3a2a1a", haut: "#f2f2f0", bas: "#1a1a2a", chaussures: "#1a1a1a", coif: "court", pantalon: true }); m.position.set(jx, 0, jz); m.rotation.y = 0; m.userData.poser("debout", 0); m.userData.anime = true; scene.add(m);
      const P = m.userData.parts;
      /* (10.159) le panier d'osier posé par terre, quelques pièces dedans ; et le maquillage de clown triste : le visage blanc, les yeux cernés de noir, la larme, la bouche tombante */
      { const osier = tT(128, 64, (c, w, h) => { c.fillStyle = "#a87a40"; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 8) for (let x = ((y / 8) % 2) * 8; x < w; x += 16) { c.fillStyle = "#c8985a"; c.fillRect(x, y + 1, 12, 6); c.fillStyle = "rgba(60,40,20,.5)"; c.fillRect(x + 12, y, 2, 8); } }, 3, 1), om = mat({ map: osier, roughness: .9, side: THREE.DoubleSide });
        const pan = new THREE.Mesh(new THREE.LatheGeometry([[.12, 0], [.2, .02], [.24, .12], [.25, .16]].map(([x, y]) => new THREE.Vector2(x, y)), 18), om); pan.position.set(jx + .3, .02, jz + 1.0); scene.add(pan); const fd = new THREE.Mesh(new THREE.CircleGeometry(.12, 16), om); fd.rotation.x = -Math.PI / 2; fd.position.set(jx + .3, .03, jz + 1.0); scene.add(fd);
        const bd = new THREE.Mesh(new THREE.TorusGeometry(.25, .02, 6, 20), mat({ color: 0x8a5a2a, roughness: .9 })); bd.rotation.x = Math.PI / 2; bd.position.set(jx + .3, .18, jz + 1.0); scene.add(bd);
        for (let i = 0; i < 6; i++) { const p2 = new THREE.Mesh(new THREE.CylinderGeometry(.022, .022, .006, 10), mat({ color: i % 2 ? 0xd8b860 : 0xb8bcc2, metalness: .8, roughness: .3 })); p2.position.set(jx + .26 + (i % 3) * .04, .05 + i * .004, jz + .97 + (i % 2) * .05); scene.add(p2); }
        const fT = tT(128, 96, (c, w, h) => { c.fillStyle = "#f6f4f0"; c.fillRect(0, 0, w, h); c.fillStyle = "#141414"; for (const ex of [42, 86]) { c.beginPath(); c.moveTo(ex, 22); c.lineTo(ex + 10, 38); c.lineTo(ex, 56); c.lineTo(ex - 10, 38); c.closePath(); c.fill(); }
          c.beginPath(); c.moveTo(84, 58); c.quadraticCurveTo(80, 66, 84, 70); c.quadraticCurveTo(88, 66, 84, 58); c.fill(); c.strokeStyle = "#141414"; c.lineWidth = 3; c.beginPath(); c.arc(64, 84, 12, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); c.fillStyle = "#b02030"; c.beginPath(); c.ellipse(64, 76, 6, 3, 0, 0, 7); c.fill(); });
        const rT = P.tete.children.length ? .108 : .108, masque = new THREE.Mesh(new THREE.SphereGeometry(rT * 1.09, 24, 16, .25, Math.PI - .5, .35, 2.2), mat({ map: fT, roughness: .7 })); masque.position.set(0, 0, .005); P.tete.add(masque); }
      OBS.push([jx - .45, jx + .45, jz - .45, jz + .45], [jx, jx + .6, jz + .7, jz + 1.3]);
      const B3 = [0xd8202a, 0x2a5ad8, 0xf2c820].map(c => { const s = new THREE.Mesh(new THREE.SphereGeometry(.06, 12, 10), mat({ color: c, roughness: .4 })); scene.add(s); return s; });
      AMB.push((tm) => { const t = tm / 1000 * 1.15; for (let i = 0; i < 3; i++) { const u = (t + i / 3) % 1, aller = u < .5, v = aller ? u / .5 : (u - .5) / .5, xa = aller ? -.22 : .22, xb = aller ? .22 : -.22, h = aller ? .85 : .7;
          B3[i].position.set(jx + xa + (xb - xa) * v, 1.12 + 4 * h * v * (1 - v), jz + .36); }
        const k = Math.sin(t * Math.PI * 4); P.bras[0].e.rotation.set(-.6 + k * .12, 0, .15); P.bras[0].c.rotation.set(-1.0, 0, 0); P.bras[1].e.rotation.set(-.6 - k * .12, 0, -.15); P.bras[1].c.rotation.set(-1.0, 0, 0); P.tete.rotation.x = -.35; }); }
    /* ---------- (10.158) le Paris d'autrefois, paisible : la colonne Morris, l'orgue de Barbarie, la marchande de fleurs, les pêcheurs à la ligne, le manège de chevaux de bois, le vélo aux baguettes et le facteur ---------- */
    { const vertM = mat({ color: 0x1f4a36, roughness: .5, metalness: .35 }), orM = mat({ color: 0xc8a040, metalness: .75, roughness: .3 }), boisR = mat({ color: 0x6a2a1a, roughness: .6 }), noirM = mat({ color: 0x141414, roughness: .6 });
      // — la colonne Morris : le socle, le fût couvert d'affiches anciennes, la corniche et son bandeau, le dôme à écailles, l'épi —
      { const cx = 16, cz = -35.5, affT = tT(512, 256, (c, w, h) => { c.fillStyle = "#e8dcc0"; c.fillRect(0, 0, w, h);
          const A = [["LE GUÉPARD", "#e8dcc0", "#c8201a", 0], ["LE BON, LA BRUTE", "#f2d020", "#c81a1a", 1], ["LE CAÏD", "#f2ead8", "#3a2a6a", 2], ["LA GRANDE VADROUILLE", "#9ac8e8", "#f2f2f2", 3], ["LE GENTLEMAN D'EPSOM", "#e8a040", "#c8201a", 4], ["SPARTACUS", "#e85a2a", "#f8f0e0", 5], ["LES VIEUX DE LA VIEILLE", "#f2e6b8", "#c8201a", 6], ["LA SOUPE AUX CHOUX", "#a8c8e8", "#e868a8", 7]];
          A.forEach(([t, f, e, k], i) => { const x = (i % 4) * 128, y = (i / 4 | 0) * 128; c.fillStyle = f; c.fillRect(x + 3, y + 3, 122, 122); c.strokeStyle = "rgba(0,0,0,.25)"; c.lineWidth = 2; c.strokeRect(x + 6, y + 6, 116, 116);
            const tete = (cx, cy, r, peau, chap) => { c.fillStyle = peau; c.beginPath(); c.ellipse(x + cx, y + cy, r * .8, r, 0, 0, 7); c.fill(); c.fillStyle = "rgba(0,0,0,.55)"; c.fillRect(x + cx - r * .4, y + cy - r * .15, r * .25, r * .1); c.fillRect(x + cx + r * .15, y + cy - r * .15, r * .25, r * .1); c.fillRect(x + cx - r * .3, y + cy + r * .45, r * .6, r * .08); if (chap) { c.fillStyle = chap; c.beginPath(); c.ellipse(x + cx, y + cy - r * .8, r * 1.3, r * .3, 0, 0, 7); c.fill(); c.fillRect(x + cx - r * .7, y + cy - r * 1.5, r * 1.4, r * .75); } };
            if (k === 0) { tete(64, 48, 18, "#e8c4a0"); tete(28, 58, 13, "#d8b090", "#141414"); tete(100, 62, 12, "#e8c4a0"); }
            else if (k === 1) { tete(36, 36, 16, "#c8905a", "#8a6a3a"); tete(92, 34, 16, "#b8804a", "#5a4a2a"); tete(64, 70, 16, "#c8905a", "#7a5a2a"); }
            else if (k === 2) { c.fillStyle = "#c8201a"; c.fillRect(x + 12, y + 20, 26, 70); tete(70, 48, 18, "#e8c4a0", "#4a4a5a"); c.fillStyle = "#d8d8dc"; c.fillRect(x + 50, y + 68, 40, 30); }
            else if (k === 3) { c.fillStyle = "#3a3a3a"; c.beginPath(); c.moveTo(x + 22, y + 92); c.lineTo(x + 30, y + 40); c.lineTo(x + 38, y + 92); c.fill(); tete(72, 44, 14, "#e8c4a0", "#5a6a4a"); tete(72, 74, 14, "#e8c4a0", "#5a6a4a"); }
            else if (k === 4) { tete(42, 52, 20, "#e8c4a0"); tete(90, 46, 18, "#f0d0b0"); c.fillStyle = "#f8f8f8"; c.fillRect(x + 78, y + 14, 24, 22); }
            else if (k === 5) { c.fillStyle = "#3a2a1a"; c.fillRect(x + 58, y + 10, 12, 50); c.strokeStyle = "#5a5a5a"; c.lineWidth = 3; c.beginPath(); c.moveTo(x + 52, y + 30); c.lineTo(x + 76, y + 36); c.stroke(); tete(64, 72, 16, "#c88a5a"); c.fillStyle = "#d8d8e0"; c.beginPath(); c.moveTo(x + 84, y + 96); c.lineTo(x + 116, y + 82); c.lineTo(x + 86, y + 90); c.fill(); }
            else if (k === 6) { tete(92, 34, 13, "#e8c4a0", "#2a3a6a"); tete(92, 62, 13, "#e8c4a0"); tete(92, 88, 13, "#e8c4a0", "#1a2a5a"); c.fillStyle = "#f2f2f2"; c.fillRect(x + 82, y + 94, 20, 6); }
            else { tete(40, 64, 17, "#e8c4a0", "#2a2a3a"); tete(88, 64, 17, "#e8c4a0", "#8a7a6a"); c.fillStyle = "#e8d040"; c.beginPath(); c.arc(x + 64, y + 26, 14, 0, 7); c.fill(); c.fillStyle = "#c8201a"; c.beginPath(); c.arc(x + 60, y + 18, 5, 0, 7); c.arc(x + 70, y + 18, 5, 0, 7); c.fill(); }
            c.fillStyle = e; c.textAlign = "center"; let fs = 15; c.font = `bold ${fs}px ${serif}`; while (c.measureText(t).width > 112 && fs > 7) { fs--; c.font = `bold ${fs}px ${serif}`; } c.strokeStyle = "rgba(0,0,0,.6)"; c.lineWidth = 3; c.strokeText(t, x + 64, y + 112); c.fillText(t, x + 64, y + 112); }); }, 2, 1);
        cyl(1.0, 1.1, .35, vertM, cx, .18, cz, 20); cyl(.85, .85, 2.9, mat({ map: affT, roughness: .8 }), cx, 1.8, cz, 24); cyl(.9, .9, .1, vertM, cx, 3.3, cz, 24);
        const bT = tT(512, 48, (c, w, h) => { c.fillStyle = "#1f4a36"; c.fillRect(0, 0, w, h); for (let i = 0; i < 2; i++) { const x = i * w / 2; c.fillStyle = "#efe6c8"; c.beginPath(); c.roundRect(x + 30, 8, w / 2 - 60, 32, 8); c.fill(); c.fillStyle = "#141414"; c.font = "bold 22px Arial"; c.textAlign = "center"; c.fillText("SPECTACLES", x + w / 4, 32); } }, 1, 1);
        { const co = add(new THREE.CylinderGeometry(1.2, .92, .45, 24, 1, true), mat({ map: bT, roughness: .5, side: THREE.DoubleSide }), cx, 3.55, cz); void co; } cyl(1.22, 1.22, .08, vertM, cx, 3.8, cz, 24);
        const dome = add(new THREE.SphereGeometry(.85, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), mat({ map: tT(64, 64, (c, w, h) => { c.fillStyle = "#1f4a36"; c.fillRect(0, 0, w, h); c.strokeStyle = "#163a2a"; c.lineWidth = 2; for (let y = 0; y < h; y += 8) for (let x = (y / 8 % 2) * 4; x < w; x += 8) { c.beginPath(); c.arc(x, y, 4, 0, Math.PI); c.stroke(); } }, 6, 3), roughness: .5, metalness: .3 }), cx, 3.84, cz); dome.scale.y = 1.4;
        add(new THREE.ConeGeometry(.12, .7, 8), vertM, cx, 5.4, cz); add(new THREE.SphereGeometry(.08, 8, 6), vertM, cx, 5.8, cz); OBS.push([cx - 1.2, cx + 1.2, cz - 1.2, cz + 1.2]); }
      // — l'orgue de Barbarie : la caisse peinte sur ses deux roues, les tuyaux dorés, la manivelle ; le joueur au canotier qui tourne —
      const ORG = { x: -15, z: -40 };
      { const { x, z } = ORG, g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = Math.PI * .1; scene.add(g); const b = (w, h, d, m, px, py, pz) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(px, py, pz); g.add(o); return o; };
        const peint = tT(128, 96, (c, w, h) => { c.fillStyle = "#7a1a1a"; c.fillRect(0, 0, w, h); c.strokeStyle = "#d8b860"; c.lineWidth = 4; c.strokeRect(6, 6, w - 12, h - 12); c.fillStyle = "#f2e6c8"; c.beginPath(); c.ellipse(w / 2, h / 2, 34, 26, 0, 0, 7); c.fill(); c.fillStyle = "#3a6a9a"; c.beginPath(); c.ellipse(w / 2, h / 2, 26, 18, 0, 0, 7); c.fill(); c.fillStyle = "#d8b860"; c.font = "bold 10px Georgia"; c.textAlign = "center"; c.fillText("PARIS", w / 2, h / 2 + 4); });
        b(1.1, .8, .6, boisR, 0, 1.15, 0); b(1.12, .82, .02, mat({ map: peint, roughness: .6 }), 0, 1.15, .31); b(1.2, .08, .7, orM, 0, 1.58, 0); b(1.2, .08, .7, orM, 0, .73, 0);
        for (let i = 0; i < 9; i++) { const t = new THREE.Mesh(new THREE.CylinderGeometry(.025, .025, .3 + Math.abs(i - 4) * -.03 + .12, 8), orM); t.position.set(-.4 + i * .1, 1.83, .15); g.add(t); }
        for (const s of [-1, 1]) { const r = new THREE.Mesh(new THREE.TorusGeometry(.32, .04, 6, 16), noirM); r.position.set(s * .5, .32, -.05); r.rotation.y = Math.PI / 2; g.add(r); } b(.06, .55, .06, noirM, 0, .45, .3); b(.9, .04, .04, boisR, 0, .7, -.45);
        const man = new THREE.Group(); man.position.set(.58, 1.2, 0); g.add(man); { const a = new THREE.Mesh(new THREE.BoxGeometry(.04, .25, .04), orM); a.position.y = .12; man.add(a); const p = new THREE.Mesh(new THREE.CylinderGeometry(.025, .025, .14, 6), noirM); p.rotation.z = Math.PI / 2; p.position.set(.07, .24, 0); man.add(p); }
        const m = personne3D({ taille: 1.72, peau: "#e8c4a0", ch: "#6a6a6a", haut: "#2a2a3a", bas: "#3a3028", chaussures: "#1a1a1a", coif: "court", pantalon: true }); m.position.set(x + 1.15, 0, z + .15); m.rotation.y = -Math.PI / 2 + .1; m.userData.poser("debout", 0); scene.add(m);
        const P = m.userData.parts, can = new THREE.Mesh(new THREE.CylinderGeometry(.13, .13, .07, 16), mat({ color: 0xe8d8a0 })); can.position.y = .11; P.tete.add(can); const bord = new THREE.Mesh(new THREE.CylinderGeometry(.2, .2, .015, 16), mat({ color: 0xe8d8a0 })); bord.position.y = .08; P.tete.add(bord); const ru = new THREE.Mesh(new THREE.CylinderGeometry(.132, .132, .025, 16), noirM); ru.position.y = .1; P.tete.add(ru);
        OBS.push([x - .9, x + 1.6, z - .6, z + .7]);
        AMB.push((tm) => { const a = tm / 450; man.rotation.x = a; P.bras[0].e.rotation.set(-.9 + Math.sin(a) * .35, 0, -.2); P.bras[0].c.rotation.set(-.6 - Math.cos(a) * .3, 0, 0); P.tete.rotation.y = Math.sin(tm / 2000) * .3; }); }
      AMB.push(() => { window.__ndDuck = (L.dedans ? .04 : .35) * (1 - (L.duckBal || 0) * .9); });   /* (10.160 : l'orgue tourne sans jouer : la valse d'Amélie reste seule) */
      // — la marchande de fleurs : son étal, les seaux de zinc pleins de bouquets (roses, tulipes, pivoines, lavande), elle-même en tablier —
      { const fx = -64, fz = -47.6, zinc = mat({ color: 0x9aa2a8, metalness: .6, roughness: .4 });
        const fleurT = (k) => tT(128, 128, (c, w, h) => { c.clearRect(0, 0, w, h); const cols = [["#c81a3a", "#e83a5a", "#a81030"], ["#f2c020", "#f8d848", "#e8a010"], ["#f0a0c0", "#f8c8d8", "#e080a8"], ["#8a5ac8", "#a87ad8", "#6a3aa8"], ["#f8f4ec", "#ffffff", "#e8e0d0"], ["#f06a2a", "#f88a48", "#d8501a"]][k];
          for (let i = 0; i < 26; i++) { const x = 64 + (al() - .5) * 90, y = 18 + al() * 60; c.strokeStyle = "#3a6a2a"; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y); c.lineTo(64 + (x - 64) * .2, h); c.stroke(); }
          for (let i = 0; i < 40; i++) { const x = 64 + (al() - .5) * 96, y = 12 + al() * 66; c.fillStyle = "#4a7a30"; c.beginPath(); c.ellipse(x + 4, y + 8, 7, 3, .6, 0, 7); c.fill(); }
          for (let i = 0; i < 24; i++) { const x = 64 + (al() - .5) * 90, y = 14 + al() * 58, r = 5 + al() * 5; if (k === 3) { for (let j = 0; j < 6; j++) { c.fillStyle = cols[j % 3]; c.beginPath(); c.arc(x, y + j * 3, 2.5, 0, 7); c.fill(); } continue; }
            for (let p = 0; p < 7; p++) { const a = p / 7 * Math.PI * 2; c.fillStyle = cols[p % 3]; c.beginPath(); c.ellipse(x + Math.cos(a) * r * .5, y + Math.sin(a) * r * .5, r * .55, r * .35, a, 0, 7); c.fill(); } c.fillStyle = cols[2]; c.beginPath(); c.arc(x, y, r * .35, 0, 7); c.fill(); } });
        const FM = [0, 1, 2, 3, 4, 5].map(k => new THREE.MeshStandardMaterial({ map: fleurT(k), alphaTest: .45, side: THREE.DoubleSide, roughness: .8 }));
        box(2.6, .08, 1.0, mat({ color: 0x6a4a2a }), fx, .7, fz); for (const [ex, ez] of [[-1.2, -.4], [1.2, -.4], [-1.2, .4], [1.2, .4]]) box(.06, .7, .06, mat({ color: 0x4a3420 }), fx + ex, .35, fz + ez);
        const seau = (x, y, z, k) => { const s = add(new THREE.CylinderGeometry(.2, .15, .32, 14, 1, true), zinc, x, y + .16, z); s.material.side = THREE.DoubleSide; for (const r of [0, Math.PI / 2, Math.PI / 4]) add(new THREE.PlaneGeometry(.7, .7), FM[k], x, y + .55, z, r); };
        for (let i = 0; i < 5; i++) seau(fx - 1.0 + i * .5, .74, fz - .15, i % 6); for (let i = 0; i < 4; i++) seau(fx - .75 + i * .5, .74, fz + .25, (i + 3) % 6); for (let i = 0; i < 6; i++) seau(fx - 1.6 + i * .64, 0, fz + .95, (i + 1) % 6);
        const m = personne3D({ taille: 1.6, peau: "#e8c4a0", ch: "#8a6a4a", haut: "#3a5a8a", bas: "#2a2a30", chaussures: "#2a1a14", coif: "carre", robe: true }); m.position.set(fx, 0, fz - .9); m.rotation.y = 0; m.userData.poser("debout", 0); scene.add(m);
        const tab = new THREE.Mesh(new THREE.BoxGeometry(.34, .5, .02), mat({ color: 0xf2f0e6 })); tab.position.set(0, -.3, .14); m.userData.parts.bassin.add(tab);
        const bq = new THREE.Group(); for (const r of [0, Math.PI / 2]) { const q = new THREE.Mesh(new THREE.PlaneGeometry(.4, .4), FM[0]); q.rotation.y = r; bq.add(q); } bq.position.set(0, -.2, .15); m.userData.parts.bras[1].c.add(bq); m.userData.parts.bras[1].e.rotation.set(-.8, 0, 0);
        OBS.push([fx - 1.8, fx + 1.8, fz - 1.3, fz + 1.4]); AMB.push((tm) => { m.userData.parts.tete.rotation.y = Math.sin(tm / 2500) * .5; }); }
      // — les pêcheurs à la ligne, assis au bord du bas-port, les pieds au-dessus de l'eau ; la canne, le fil, le bouchon qui danse ; le seau, le pliant —
      { const canneM = mat({ color: 0x8a6a3a, roughness: .6 }), filM = new THREE.LineBasicMaterial({ color: 0xdddddd, transparent: true, opacity: .6 }), bouM = mat({ color: 0xd82020, emissive: 0x400000 });
        [[-112, 18.6, Math.PI], [-86, 18.6, Math.PI], [118, 18.6, Math.PI], [-120, -18.6, 0], [108, -18.6, 0]].forEach(([x, z, ry], k) => { const s = Math.cos(ry);
          const m = personne3D({ taille: 1.74, peau: PE[(k + 2) % 6], ch: ["#8a8a8a", "#3a2a1a", "#e8e4dc"][k % 3], haut: ["#4a5a3a", "#2a3a5a", "#6a4a2a"][k % 3], bas: "#2a2a30", chaussures: "#2a1a14", coif: k % 2 ? "court" : "chauve", pantalon: true });
          m.position.set(x, YB + .14 - m.userData.hipY, z); m.rotation.y = ry; m.userData.poser("assis", 0); scene.add(m); const P = m.userData.parts; P.bras[0].e.rotation.set(-1.0, 0, .2); P.bras[1].e.rotation.set(-1.0, 0, -.2);
          if (k % 2 === 0) { const h = new THREE.Mesh(new THREE.CylinderGeometry(.12, .14, .1, 12), mat({ color: [0x3a4a2a, 0x2a2a3a][k % 2] })); h.position.y = .1; P.tete.add(h); const v = new THREE.Mesh(new THREE.CylinderGeometry(.2, .2, .015, 12), h.material); v.position.y = .06; P.tete.add(v); }
          const base = new THREE.Vector3(x, YB + .75, z + s * .35), tip = new THREE.Vector3(x + .4, YB + 2.6, z + s * 3.2), L2 = base.distanceTo(tip), cn = new THREE.Mesh(new THREE.CylinderGeometry(.008, .02, L2, 6), canneM); cn.position.copy(base).lerp(tip, .5); cn.lookAt(tip); cn.rotateX(Math.PI / 2); scene.add(cn);
          const bou = new THREE.Mesh(new THREE.SphereGeometry(.05, 8, 6), bouM); bou.position.set(tip.x, YE + .04, tip.z + s * .4); scene.add(bou); const gl = new THREE.BufferGeometry().setFromPoints([tip, bou.position.clone()]); const fil = new THREE.Line(gl, filM); scene.add(fil);
          add(new THREE.CylinderGeometry(.16, .13, .3, 12), mat({ color: 0x7a8a92, metalness: .5, roughness: .4 }), x + .6, YB + .15, z - s * .5);
          OBS.push([x - .5, x + .9, Math.min(z, z - s * .9) - .3, Math.max(z, z - s * .9) + .3]);
          AMB.push((tm) => { const b = Math.sin(tm / 600 + k * 2) * .02 + (Math.sin(tm / 7000 + k) > .97 ? -.05 : 0); bou.position.y = YE + .04 + b; const p = gl.attributes.position; p.setY(1, bou.position.y); p.needsUpdate = true; P.tete.rotation.y = Math.sin(tm / 3000 + k) * .2; }); }); }
      // — le manège de chevaux de bois : le plancher, les colonnes torsadées dorées, les chevaux qui montent et descendent, le cygne, la calèche ; le chapiteau rayé rouge et blanc, sa frise peinte et dorée, ses ampoules —
      { const cx = 17, cz = -57, R = 4.4, G = new THREE.Group(); G.position.set(cx, 0, cz); scene.add(G);
        const plancher = mat({ map: tT(128, 128, (c, w, h) => { c.fillStyle = "#8a5a32"; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 10) { c.fillStyle = `rgba(0,0,0,${.15 + al() * .1})`; c.fillRect(0, y, w, 1.5); } }, 3, 3), roughness: .7 });
        const sol0 = new THREE.Mesh(new THREE.CylinderGeometry(R + .4, R + .5, .35, 32), plancher); sol0.position.y = .18; scene.add(sol0); sol0.position.set(cx, .18, cz);
        const ROT = new THREE.Group(); G.add(ROT); const turquoise = mat({ color: 0x8ac8c0, roughness: .5 });
        const fr = tT(512, 96, (c, w, h) => { c.fillStyle = "#9ad0c8"; c.fillRect(0, 0, w, h); c.fillStyle = "#c8a040"; c.fillRect(0, 0, w, 8); c.fillRect(0, h - 8, w, 8); for (let i = 0; i < 4; i++) { const x = i * 128; c.fillStyle = "#f2ead2"; c.beginPath(); c.ellipse(x + 64, h / 2, 46, 30, 0, 0, 7); c.fill(); c.strokeStyle = "#c8a040"; c.lineWidth = 4; c.stroke();
            for (let j = 0; j < 3; j++) { c.fillStyle = ["#3a6a2a", "#c83a2a", "#2a4a8a"][j]; c.beginPath(); c.arc(x + 44 + j * 20, h / 2 + 4, 6, 0, 7); c.fill(); c.fillRect(x + 41 + j * 20, h / 2 + 8, 6, 12); } c.fillStyle = "#c8a040"; c.beginPath(); c.ellipse(x + 124, h / 2, 6, 14, 0, 0, 7); c.fill(); } }, 4, 1);
        const frise = new THREE.Mesh(new THREE.CylinderGeometry(R + .55, R + .55, .9, 40, 1, true), new THREE.MeshStandardMaterial({ map: fr, side: THREE.DoubleSide, roughness: .5 })); frise.position.y = 3.6; ROT.add(frise);
        const toileT = tT(256, 64, (c, w, h) => { for (let i = 0; i < 16; i++) { c.fillStyle = i % 2 ? "#f4f0e8" : "#c8202a"; c.fillRect(i * w / 16, 0, w / 16 + 1, h); } });
        const toit = new THREE.Mesh(new THREE.ConeGeometry(R + .7, 2.4, 32, 1, true), new THREE.MeshStandardMaterial({ map: toileT, side: THREE.DoubleSide, roughness: .7 })); toit.position.y = 5.25; ROT.add(toit);
        const epi = new THREE.Mesh(new THREE.ConeGeometry(.12, .8, 8), orM); epi.position.y = 6.8; ROT.add(epi);
        const ampM = mat({ color: 0xfff0c0, emissive: 0xffd890, emissiveIntensity: .3 }); NUIT.push([ampM, .3, 1.6]); for (let i = 0; i < 32; i++) { const a = i / 32 * Math.PI * 2, s = new THREE.Mesh(new THREE.SphereGeometry(.05, 6, 4), ampM); s.position.set(Math.cos(a) * (R + .58), 3.1, Math.sin(a) * (R + .58)); ROT.add(s); }
        const col = new THREE.Mesh(new THREE.CylinderGeometry(.9, .9, 3, 16), mat({ map: fr, roughness: .5 })); col.position.y = 1.85; ROT.add(col);
        const robes = [0xf6f2ea, 0x8a4a22, 0xc8c8c4, 0x1c1a18, 0xd8b070, 0x6a3a1a], crins = [0xd8b048, 0x2a1a10, 0x6a6a6a, 0x1a1a1a, 0xf2ead2, 0x1a120a], selles = [0x2a4aa8, 0xc8202a, 0x2a7a4a, 0x8a2a7a, 0xd8a020, 0x2a8ac0], CH = [];
        const torsT = tT(32, 128, (c, w, h) => { c.fillStyle = "#e8c860"; c.fillRect(0, 0, w, h); c.strokeStyle = "#8a6420"; c.lineWidth = 5; for (let y = -w; y < h + w; y += 16) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y + w); c.stroke(); } c.strokeStyle = "#fff4c0"; c.lineWidth = 2; for (let y = -w + 6; y < h + w; y += 16) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y + w); c.stroke(); } }, 1, 8), torsM = mat({ map: torsT, metalness: .8, roughness: .25 });
        // le lambrequin festonné sous la frise, les miroirs ovales, les volutes dorées au-dessus
        { const fest = [mat({ color: 0xc8202a, roughness: .6, side: THREE.DoubleSide }), mat({ color: 0xf2ead8, roughness: .6, side: THREE.DoubleSide })], miroir = mat({ color: 0xe8f0f4, metalness: 1, roughness: .05 });
          for (let i = 0; i < 44; i++) { const a = i / 44 * Math.PI * 2, f = new THREE.Mesh(new THREE.CircleGeometry(.3, 12, Math.PI, Math.PI), fest[i % 2]); f.position.set(Math.cos(a) * (R + .57), 3.15, Math.sin(a) * (R + .57)); f.rotation.y = Math.PI / 2 - a; ROT.add(f); }
          for (let i = 0; i < 12; i++) { const a = (i + .5) / 12 * Math.PI * 2, mr = new THREE.Mesh(new THREE.CircleGeometry(.13, 16), miroir); mr.scale.y = 1.5; mr.position.set(Math.cos(a) * (R + .58), 3.6, Math.sin(a) * (R + .58)); mr.rotation.y = Math.PI / 2 - a; ROT.add(mr);
            const v = new THREE.Mesh(new THREE.TorusGeometry(.2, .045, 6, 12, Math.PI * 1.4), orM); v.position.set(Math.cos(a) * (R + .5), 4.2, Math.sin(a) * (R + .5)); v.rotation.y = Math.PI / 2 - a; ROT.add(v); const pm = new THREE.Mesh(new THREE.ConeGeometry(.07, .3, 8), orM); pm.position.set(Math.cos(a) * (R + .5), 4.45, Math.sin(a) * (R + .5)); ROT.add(pm); } }
        { const rim = new THREE.Mesh(new THREE.TorusGeometry(R + .45, .06, 6, 48), orM); rim.rotation.x = Math.PI / 2; rim.position.set(cx, .36, cz); scene.add(rim); }
        for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, rr = i % 2 ? R - .5 : R - 1.5, x = Math.cos(a) * rr, z = Math.sin(a) * rr;
          const barre = new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, 3.0, 10), torsM); barre.position.set(x, 1.85, z); ROT.add(barre);
          const h = new THREE.Group(); h.position.set(x, 1.0, z); h.rotation.y = -a; ROT.add(h); const bm = mat({ color: robes[i % 6], roughness: .5 }), sm = mat({ color: selles[i % 6], roughness: .5 });
          const HB = (geo, m, px, py, pz, rx = 0, rz = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(px, py, pz); o.rotation.set(rx, 0, rz); h.add(o); return o; };
          if (i === 4) { HB(new THREE.SphereGeometry(.35, 12, 10), bm, 0, .25, 0).scale.set(.8, .9, 1.3); HB(new THREE.CapsuleGeometry(.07, .5, 4, 8), bm, 0, .65, .35, .3); HB(new THREE.SphereGeometry(.1, 8, 6), bm, 0, .95, .42); HB(new THREE.ConeGeometry(.04, .14, 6), mat({ color: 0xe86a1a }), 0, .93, .55, Math.PI / 2); }   // (le cygne)
          else if (i === 9) { HB(new THREE.BoxGeometry(.7, .35, .9), mat({ color: 0xc8302a }), 0, 0, 0); HB(new THREE.BoxGeometry(.7, .4, .06), mat({ color: 0xc8302a }), 0, .3, -.42); for (const s of [-1, 1]) { const r = HB(new THREE.TorusGeometry(.18, .03, 6, 12), orM, s * .38, -.2, .2); r.rotation.y = Math.PI / 2; } }   // (la petite calèche)
          else { /* (10.159) le cheval de bois, sculpté et laqué : au galop, l'encolure arquée, la crinière dorée ou sombre, la queue en panache, la selle, la couverture brodée, les étriers, la bride dorée */
            const bm2 = mat({ color: robes[i % 6], roughness: .28, metalness: .05 }), cm = mat({ color: crins[i % 6], roughness: .4, metalness: crins[i % 6] === 0xd8b048 ? .7 : .05 }), sp = (r) => new THREE.SphereGeometry(r, 16, 12), cp = (r, l) => new THREE.CapsuleGeometry(r, l, 6, 10);
            const S2 = (geo, m, px, py, pz, rx = 0, sx = 1, sy = 1, sz = 1, rz = 0) => { const o = HB(geo, m, px, py, pz, rx, rz); o.scale.set(sx, sy, sz); return o; };
            S2(sp(.24), bm2, 0, 0, 0, 0, .78, .84, 1.6); S2(sp(.22), bm2, 0, .05, .3, 0, .88, .98, .9); S2(sp(.23), bm2, 0, .05, -.32, 0, .92, .95, 1);   // (le corps, le poitrail, la croupe)
            HB(cp(.11, .26), bm2, 0, .3, .44, .62); HB(cp(.09, .16), bm2, 0, .5, .58, .3); HB(cp(.08, .24), bm2, 0, .56, .78, 2.0); S2(sp(.07), bm2, 0, .45, .92, 0, .9, .8, 1.2);   // (l'encolure arquée, la tête, le bout du nez)
            for (const s of [-1, 1]) { HB(new THREE.ConeGeometry(.03, .1, 6), bm2, s * .045, .72, .68, -.2); HB(sp(.022), noirM, s * .07, .6, .82); HB(sp(.015), noirM, s * .03, .44, 1.0); }   // (les oreilles, les yeux, les naseaux)
            for (let m2 = 0; m2 < 9; m2++) { const t2 = m2 / 8; HB(new THREE.BoxGeometry(.035, .13, .08), cm, (m2 % 2 - .5) * .02, .34 + t2 * .36, .36 + t2 * .3, .5 - t2 * .3, (m2 % 2 - .5) * .4); } HB(new THREE.BoxGeometry(.04, .08, .08), cm, 0, .7, .72, .8);   // (la crinière, le toupet)
            { const pts = [new THREE.Vector3(0, .12, -.6), new THREE.Vector3(0, .02, -.78), new THREE.Vector3(0, -.2, -.86), new THREE.Vector3(0, -.42, -.8)]; h.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 12, .045, 6), cm)); }   // (la queue)
            for (const s of [-1, 1]) { HB(cp(.055, .2), bm2, s * .11, -.18, .38, s > 0 ? .5 : 1.0); HB(cp(.045, .2), bm2, s * .11, s > 0 ? -.38 : -.22, s > 0 ? .46 : .6, s > 0 ? -.2 : -.9); HB(new THREE.CylinderGeometry(.05, .055, .06, 8), noirM, s * .11, s > 0 ? -.52 : -.26, s > 0 ? .48 : .74, s > 0 ? 0 : -1.4);   // (les antérieurs, l'un replié)
              HB(cp(.075, .18), bm2, s * .13, -.13, -.4, -.8); HB(cp(.045, .24), bm2, s * .12, -.32, -.6, -1.15); HB(new THREE.CylinderGeometry(.05, .055, .06, 8), noirM, s * .12, -.4, -.76, -1.15); }   // (les postérieurs, tendus)
            S2(sp(.2), sm, 0, .2, 0, 0, .9, .3, 1.15); HB(new THREE.BoxGeometry(.05, .1, .05), orM, 0, .26, .2);   // (la selle, son pommeau)
            for (const s of [-1, 1]) { HB(new THREE.BoxGeometry(.02, .28, .42), sm, s * .2, .06, 0, 0, s * .12); HB(new THREE.BoxGeometry(.022, .03, .44), orM, s * .21, -.07, 0); HB(new THREE.TorusGeometry(.04, .01, 4, 10), orM, s * .24, -.2, .02).rotation.y = Math.PI / 2;   // (la couverture brodée, les étriers)
              HB(new THREE.BoxGeometry(.012, .012, .3), orM, s * .075, .55, .76, 2.0 - Math.PI / 2); }   // (la bride)
            HB(new THREE.BoxGeometry(.012, .2, .012), orM, 0, .36, .55, -.9); }
          CH.push([h, i]); }
        // quelques enfants à cheval
        for (const i of [1, 6, 10]) { const [h] = CH[i], e = personne3D({ taille: 1.15, enfant: true, peau: PE[i % 6], ch: ["#2a1a12", "#e2c27a", "#5a3a22"][i % 3], haut: ["#c83a2a", "#3a6ab0", "#f2c020"][i % 3], bas: "#2a2a40", chaussures: "#1a1a1a", coif: i % 2 ? "court" : "long", pantalon: true }); e.position.set(0, .2 - e.userData.hipY + .02, -.02); e.userData.poser("assis", 0); h.add(e); }
        OBS.push([cx - R - .6, cx + R + .6, cz - R - .6, cz + R + .6]);
        AMB.push((tm) => { ROT.rotation.y = -tm / 1000 * .35; for (const [h, i] of CH) h.position.y = 1.0 + (i === 9 ? 0 : Math.sin(tm / 650 + i * 1.7) * .25); }); }
      // — le vélo aux baguettes, et le facteur à vélo, sur la chaussée du quai (ils s'arrêtent au feu rouge) —
      { const velo = (cadre, panier) => { const g = new THREE.Group(), cm = mat({ color: cadre, metalness: .4, roughness: .4 }), roue = new THREE.TorusGeometry(.34, .025, 6, 20), b = (geo, m, x, y, z, rx = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.x = rx; g.add(o); return o; };
          for (const z of [-.55, .55]) { const r = b(roue, noirM, 0, .34, z); r.rotation.y = Math.PI / 2; } b(new THREE.CylinderGeometry(.02, .02, 1.0, 6), cm, 0, .62, 0, Math.PI / 2 - .2); b(new THREE.CylinderGeometry(.02, .02, .6, 6), cm, 0, .62, -.3, .3); b(new THREE.CylinderGeometry(.02, .02, .55, 6), cm, 0, .62, .45, -.3);
          b(new THREE.BoxGeometry(.12, .04, .22), noirM, 0, .98, -.2); b(new THREE.BoxGeometry(.5, .025, .025), noirM, 0, 1.0, .5);
          if (panier === "pain") { b(new THREE.BoxGeometry(.32, .22, .28), mat({ color: 0xb08a50, roughness: .9 }), 0, .92, .72); for (let i = 0; i < 4; i++) b(new THREE.CapsuleGeometry(.03, .5, 4, 6), mat({ color: 0xd8a050, roughness: .8 }), -.09 + i * .06, 1.1, .72, -.2); }
          else { b(new THREE.BoxGeometry(.36, .3, .25), mat({ color: 0x8a5a2a }), 0, .78, -.62); b(new THREE.BoxGeometry(.3, .2, .3), mat({ color: 0xf2c020 }), 0, .9, .72); }
          scene.add(g); return g; };
        [{ cad: 0x2a5a3a, pan: "pain", z: 37.6, sens: 1, stop: -16, haut: "#e8e2d6", bas: "#3a3028", coif: "court", beret: true }, { cad: 0xf2c020, pan: "poste", z: 30.9, sens: -1, stop: 14, haut: "#2a3a6a", bas: "#2a3a6a", coif: "court", kepi: true }, { cad: 0x8a1a1a, pan: "pain", allee: -27.6, haut: "#c8a040", bas: "#2a2a30", coif: "long", beret: true }, { cad: 0x1a3a6a, pan: "pain", allee: 20.6, haut: "#3a6a3a", bas: "#3a3028", coif: "court" }, { cad: 0x2a2a2a, pan: "pain", allee: -27.0, haut: "#e8e2d6", bas: "#26324e", coif: "court", beret: true, z0: -100 }].forEach((V, k) => {
          const g = velo(V.cad, V.pan); (L.dbgVelos = L.dbgVelos || []).push(g); const m = personne3D({ taille: 1.74, peau: PE[(k + 3) % 6], ch: "#3a2a1a", haut: V.haut, bas: V.bas, chaussures: "#1a1a1a", coif: V.coif, pantalon: true }); m.position.set(0, 1.0 - m.userData.hipY, -.18); g.add(m); const P = m.userData.parts;
          P.bras[0].e.rotation.set(-1.2, 0, .1); P.bras[1].e.rotation.set(-1.2, 0, -.1); P.buste.rotation.x = .25;
          { const cp = new THREE.Mesh(V.beret ? new THREE.SphereGeometry(.11, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2) : new THREE.CylinderGeometry(.1, .11, .1, 12), mat({ color: V.beret ? 0x1a1a2a : 0x1a2a5a })); cp.position.y = V.beret ? .06 : .1; if (V.beret) cp.scale.y = .5; P.tete.add(cp); }
          let x = (k ? 60 : -60), v = 4.2; g.rotation.y = V.sens > 0 ? Math.PI / 2 : -Math.PI / 2;
          if (V.allee != null) { let z = V.z0 || -50, s = k % 2 ? 1 : -1; AMB.push((tm, dt) => { dt = dt || .016; z += s * 3.2 * dt; if (z < -128) { z = -128; s = 1; } if (z > -42) { z = -42; s = -1; } g.position.set(V.allee, .02, z); g.rotation.y = s > 0 ? 0 : Math.PI; m.userData.poser("marche", tm * 2); }); return; }   /* (10.160 : à vélo dans les allées, le long de la cathédrale) */
          AMB.push((tm, dt) => { dt = dt || .016; const avant = (V.stop - x) * V.sens; let c = 4.2; if (FEUX.B !== "vert" && avant > 0 && avant < 8) c = Math.max(0, (avant - .6) * 1.2); v += (c - v) * Math.min(1, dt * 2); x += V.sens * v * dt; if (x > XS) x = -XS; if (x < -XS) x = XS; g.position.set(x, .02, V.z);
            const ph = tm / 1000 * v * 1.6; P.jambes ? 0 : 0; m.userData.poser(v > .3 ? "marche" : "debout", v > .3 ? ph * 400 : 0); }); }); } }
    /* (10.160) la chatte noire et blanche qui se promène sur le bas-port, près des bateaux, et ses trois chatons qui la suivent partout */
    { const noir = mat({ color: 0x141414, roughness: .8 }), blanc = mat({ color: 0xf2f0ea, roughness: .8 }), rose = mat({ color: 0xe8a0a0 });
      const chat = (s, k) => { const g = new THREE.Group(), C = (geo, m, x, y, z, rx = 0, sx = 1, sy = 1, sz = 1) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.x = rx; o.scale.set(sx, sy, sz); g.add(o); return o; };
        const col = [noir, k % 2 ? blanc : noir]; C(new THREE.SphereGeometry(.12, 12, 8), col[0], 0, .2, 0, 0, .8, .75, 1.6); C(new THREE.SphereGeometry(.1, 10, 8), blanc, 0, .17, .08, 0, .7, .6, 1.1);   // (le corps, le ventre et le plastron blancs)
        const t = C(new THREE.SphereGeometry(.085, 12, 10), col[1], 0, .3, .2); C(new THREE.SphereGeometry(.05, 8, 6), blanc, 0, .27, .26, 0, 1, .8, .8); for (const x of [-1, 1]) { C(new THREE.ConeGeometry(.03, .07, 4), noir, x * .045, .38, .19); C(new THREE.SphereGeometry(.013, 6, 4), mat({ color: 0x8ac840, emissive: 0x2a4a10 }), x * .03, .32, .27); } C(new THREE.SphereGeometry(.01, 4, 3), rose, 0, .295, .285);
        const P = []; for (const [x, z] of [[-.05, .1], [.05, .1], [-.05, -.1], [.05, -.1]]) P.push(C(new THREE.CylinderGeometry(.018, .016, .14, 6), x > 0 && z > 0 ? blanc : col[0], x, .07, z));
        const q = C(new THREE.CylinderGeometry(.012, .018, .26, 6), col[0], 0, .3, -.24, -.7); g.scale.setScalar(s); scene.add(g); return { g, P, q, t }; };
      const MAMAN = chat(1, 0), PETITS = [1, 2, 3].map(k => chat(.5, k)), H = [];   // (le chemin de la maman, que les petits suivent à la trace)
      const R2 = [[-40, 21.6], [10, 21.6], [62, 20.6], [96, 21.2], [96, 19.4], [30, 19.4], [-60, 19.6], [-95, 21.4]]; let i = 0, x = R2[0][0], z = R2[0][1], pause = 0;
      AMB.push((tm, dt) => { dt = dt || .016; const [tx, tz] = R2[(i + 1) % R2.length], dx = tx - x, dz = tz - z, d = Math.hypot(dx, dz);
        if (pause > 0) pause -= dt; else if (d < .3) { i = (i + 1) % R2.length; if (Math.random() < .5) pause = 2 + Math.random() * 4; } else { const v = Math.min(d, .9 * dt); x += dx / d * v; z += dz / d * v; MAMAN.g.rotation.y = Math.atan2(dx, dz); H.unshift([x, z, MAMAN.g.rotation.y]); if (H.length > 400) H.pop(); }
        const marche = pause <= 0; MAMAN.g.position.set(x, YB, z); const ph = tm / 120; MAMAN.P.forEach((p, j) => p.rotation.x = marche ? Math.sin(ph + j * 1.6) * .5 : 0); MAMAN.q.rotation.z = Math.sin(tm / 400) * .3; MAMAN.t.rotation.y = marche ? 0 : Math.sin(tm / 900) * .5;
        PETITS.forEach((c, k) => { const h = H[Math.min(H.length - 1, (k + 1) * 28 + k * 4)]; if (!h) { c.g.position.set(x - (k + 1) * .4, YB, z); return; } c.g.position.set(h[0] + Math.sin(tm / 300 + k) * .05, YB, h[1]); c.g.rotation.y = h[2]; c.P.forEach((p, j) => p.rotation.x = marche ? Math.sin(ph * 1.3 + j * 1.6 + k) * .6 : 0); c.q.rotation.z = Math.sin(tm / 250 + k) * .5; }); }); }
    /* ---------- (10.161) le photographe d'époque, le bal musette, la balade en bateau-mouche, l'orgue et les cierges, les mouettes, la péniche-logement ---------- */
    const moiP = () => M && M.moiNum && M.gens.get(M.moiNum);
    const ajouteAction = (f) => { const a0a = L.actionLieu; L.actionLieu = (x, z, moi) => { const r = a0a && a0a(x, z, moi); if (r) return r; return f(x, z, moi); }; };
    const fenetre = (html, ms) => { const d = document.createElement("div"); d.style.cssText = "position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:60;text-align:center;pointer-events:none"; d.innerHTML = html; (M.ctx.conteneur || document.body).appendChild(d); setTimeout(() => d.remove(), ms); return d; };
    // — le photographe : la chambre à soufflet sur son trépied de bois, le voile noir, la poire ; les touristes qui posent devant la cathédrale ; l'éclair du magnésium —
    { const PX = -14, PZ = -56, POSE = [-14, -62.5], bois = mat({ color: 0x6a4a2a, roughness: .6 }), noirC = mat({ color: 0x141414, roughness: .7 }), laiton = mat({ color: 0xc8a040, metalness: .8, roughness: .3 }), cuir = mat({ color: 0x3a2418, roughness: .8 });
      const g = new THREE.Group(); g.position.set(PX, 0, PZ); g.rotation.y = Math.PI; scene.add(g); const b = (geo, m, x, y, z, rx = 0, rz = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.set(rx, 0, rz); g.add(o); return o; };
      for (const [x, z, rx, rz] of [[0, -.25, .18, 0], [-.22, .14, -.12, .15], [.22, .14, -.12, -.15]]) b(new THREE.CylinderGeometry(.018, .025, 1.45, 6), bois, x, .7, z, rx, rz);
      b(new THREE.BoxGeometry(.3, .3, .26), bois, 0, 1.45, -.12); for (let i = 0; i < 5; i++) b(new THREE.BoxGeometry(.27 - i * .02, .27 - i * .02, .045), i % 2 ? cuir : noirC, 0, 1.45, .03 + i * .045);   // (la chambre de bois, le soufflet en accordéon)
      b(new THREE.BoxGeometry(.16, .16, .05), bois, 0, 1.45, .27); b(new THREE.CylinderGeometry(.045, .05, .12, 14), laiton, 0, 1.45, .35, Math.PI / 2); b(new THREE.CylinderGeometry(.035, .035, .02, 14), mat({ color: 0x2a3a4a, metalness: .5, roughness: .1 }), 0, 1.45, .415, Math.PI / 2);   // (l'objectif de laiton)
      b(new THREE.BoxGeometry(.5, .45, .3), noirC, 0, 1.55, -.35, .3);   // (le voile noir)
      const flash = b(new THREE.BoxGeometry(.12, .04, .04), laiton, .28, 1.75, .1); const flashL = new THREE.PointLight(0xfff4e0, 0, 18, 1.5); flashL.position.set(PX + .3, 1.9, PZ - .2); scene.add(flashL); void flash;
      const ph = personne3D({ taille: 1.74, peau: "#e8c4a0", ch: "#5a3a22", haut: "#3a3028", bas: "#2a2a30", chaussures: "#1a1a1a", coif: "court", pantalon: true }); ph.position.set(PX + .1, 0, PZ + .75); ph.rotation.y = Math.PI; ph.userData.poser("debout", 0); scene.add(ph);
      { const P = ph.userData.parts; P.bras[1].e.rotation.set(-1.1, 0, -.3); P.bras[0].e.rotation.set(-.9, 0, .4); P.buste.rotation.x = .35; const h = new THREE.Mesh(new THREE.CylinderGeometry(.11, .11, .08, 12), noirC); h.position.y = .1; P.tete.add(h); const v = new THREE.Mesh(new THREE.CylinderGeometry(.18, .18, .012, 14), noirC); v.position.y = .065; P.tete.add(v); }
      // les touristes qui posent, en famille
      const POSANTS = []; for (let k = 0; k < 3; k++) { const f = k === 1, m = personne3D({ taille: k === 2 ? 1.2 : f ? 1.64 : 1.78, enfant: k === 2, peau: PE[(k + 1) % 6], ch: ["#2a1a12", "#e2c27a", "#5a3a22"][k], haut: ["#2a3a6a", "#c83a5a", "#f2c020"][k], bas: ["#2a2a30", "#2a2a40", "#3a5a8a"][k], chaussures: "#1a1a1a", coif: f ? "long" : "court", pantalon: !f, robe: f });
        m.position.set(POSE[0] - .9 + k * .9, 0, POSE[1] - .3); m.rotation.y = 0; m.userData.poser("debout", 0); scene.add(m); const P = m.userData.parts; if (k === 0) P.bras[0].e.rotation.set(0, 0, .5); if (k === 1) P.bras[1].e.rotation.set(0, 0, -.5); POSANTS.push(m); }
      OBS.push([PX - .5, PX + .5, PZ - .5, PZ + 1.1], [POSE[0] - 1.5, POSE[0] + 1.5, POSE[1] - .7, POSE[1] + .1]);
      let tF = 0; AMB.push((tm) => { const t = tm / 1000; if (t > tF) { tF = t + 14 + Math.random() * 10; flashL.intensity = 260; } flashL.intensity *= .82; ph.userData.parts.tete.rotation.y = Math.sin(tm / 2000) * .2; });
      // le joueur pose pour une photo : la famille s'écarte, l'éclair, et l'on voit le tirage sépia
      let enCours = false; const photo = () => { const p = moiP(); if (!p || enCours) return; enCours = true; for (const m of POSANTS) m.visible = false; p.g.position.set(POSE[0], 0, POSE[1]); p.g.rotation.y = 0; p.cible = null; p.chemin = []; try { envoyerWS({ t: "aller", x: POSE[0], z: POSE[1] }); } catch (e) {}
        const t0 = performance.now(), cam = new THREE.Vector3(PX, 1.5, PZ - .4), vise = new THREE.Vector3(POSE[0], 1.2, POSE[1] - 4); let pris = false;
        M.cine = { gel: true, fov: [40, 46], maj: () => { M.camera.position.copy(cam); M.camera.lookAt(vise); const dt2 = performance.now() - t0;
          if (!pris && dt2 > 2600) { pris = true; flashL.intensity = 400; let url = null; try { M.rendu.render(M.scene, M.camera); url = M.rendu.domElement.toDataURL("image/jpeg", .85); } catch (e) {}
            fenetre("<div style='width:100vw;height:100vh;background:#fff;opacity:.9'></div>", 160);
            if (url) setTimeout(() => fenetre(`<div style="background:#efe6cf;padding:14px 14px 42px;border-radius:4px;box-shadow:0 10px 40px rgba(0,0,0,.6);transform:rotate(-2deg)"><img src="${url}" style="display:block;width:min(70vw,520px);filter:sepia(.9) contrast(1.1) brightness(.95);border:1px solid #8a7a5a"><div style="font:italic 18px Georgia,serif;color:#4a3a22;margin-top:10px">Souvenir de Notre-Dame de Paris</div></div>`, 5200), 250); }
          if (dt2 > 3400) { finCine(); placerCamera(true); for (const m of POSANTS) m.visible = true; enCours = false; } } }; };
      ajouteAction((x, z) => Math.hypot(x - PX, z - (PZ - .9)) < 2.4 ? { type: "lieu", id: "photo", label: "📷 Poser pour une photo d'époque", faire: photo } : null); }
    // — le bal musette, le soir, sur le bas-port : les guirlandes d'ampoules, l'accordéoniste sur sa chaise, les couples qui valsent, quelques chaises —
    { const BX = 27, BZ = -85, BAL = []; const ampoule = mat({ color: 0xfff0c0, emissive: 0xffd080, emissiveIntensity: 1.6 }), fil = new THREE.LineBasicMaterial({ color: 0x222222 }), couleurs = [0xff4a3a, 0xffd040, 0x4ad0ff, 0x7aff6a, 0xff7ad0].map(c => mat({ color: c, emissive: c, emissiveIntensity: 1.4 })); void ampoule;
      /* (10.161 : dans la rue à droite de la cathédrale, face à elle — les guirlandes tendues d'un côté à l'autre de la rue) */
      for (const z of [-75, -81, -87, -93]) for (const x of [21.2, 32.8]) { const m = cyl(.05, .06, 4.2, mat({ color: 0x2a2a2a, metalness: .5 }), x, 2.1, z, 6); BAL.push(m); OBS.push([x - .2, x + .2, z - .2, z + .2]); }
      for (const z of [-75, -81, -87, -93]) { const pts = []; for (let i = 0; i <= 14; i++) { const u = i / 14, px = 21.2 + u * 11.6, py = 4.1 - Math.sin(u * Math.PI) * .9; pts.push(new THREE.Vector3(px, py, z)); if (i % 2) { const a2 = add(new THREE.SphereGeometry(.08, 8, 6), couleurs[(i + Math.round(z)) % 5], px, py - .12, z); BAL.push(a2); } } const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), fil); scene.add(l); BAL.push(l); }
      for (const x of [21.2, 32.8]) { const pts = []; for (let i = 0; i <= 18; i++) { const u = i / 18, pz = -75 - u * 18, py = 4.1 - Math.abs(Math.sin(u * Math.PI * 3)) * .5; pts.push(new THREE.Vector3(x, py, pz)); if (i % 2) BAL.push(add(new THREE.SphereGeometry(.07, 8, 6), couleurs[i % 5], x, py - .1, pz)); } const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), fil); scene.add(l); BAL.push(l); }
      const X0 = 31.2, X1 = 31.2, ZC = BZ; void X1;
      const acc = personne3D({ taille: 1.72, peau: "#e8c4a0", ch: "#8a8a8a", haut: "#3a2a3a", bas: "#2a2a30", chaussures: "#1a1a1a", coif: "court", pantalon: true }); acc.position.set(32, .48 - acc.userData.hipY, -79.2); acc.rotation.y = -Math.PI / 2 - .3; acc.userData.poser("assis", 0); scene.add(acc); BAL.push(acc);
      { const P = acc.userData.parts, ac = new THREE.Group(); ac.position.set(0, .15, .22); P.buste.add(ac); const r = mat({ color: 0xa8141c, roughness: .35 }); for (const s of [-1, 1]) { const o = new THREE.Mesh(new THREE.BoxGeometry(.08, .3, .2), r); o.position.x = s * .17; ac.add(o); } const sf = new THREE.Mesh(new THREE.BoxGeometry(.26, .28, .18), mat({ color: 0xe8e2d6 })); ac.add(sf); BAL.push({ set visible(v) {} }); AMB.push((tm) => { sf.scale.x = 1 + Math.sin(tm / 330) * .3; P.bras[0].e.rotation.set(-1.1, 0, -.5 - Math.sin(tm / 330) * .12); P.bras[1].e.rotation.set(-1.1, 0, .5 + Math.sin(tm / 330) * .12); }); }
      box(.45, .05, .45, mat({ color: 0x6a4a2a }), 32, .46, -79.2); OBS.push([31.6, 32.4, -79.6, -78.8]);
      const COUPLES = []; for (let k = 0; k < (PEU ? 2 : 4); k++) { const c = new THREE.Group(); scene.add(c); const h = personne3D({ taille: 1.76, peau: PE[k % 6], ch: "#2a1a12", haut: ["#1a1a2a", "#3a3028", "#2a3a5a", "#5a2a2a"][k], bas: "#1a1a1a", chaussures: "#1a1a1a", coif: "court", pantalon: true }), f = personne3D({ taille: 1.64, peau: PE[(k + 2) % 6], ch: ["#e2c27a", "#5a3a22", "#141010", "#8a4a2a"][k], haut: ["#c8202a", "#2a5aa8", "#e8d8b0", "#2a7a4a"][k], bas: ["#c8202a", "#2a5aa8", "#e8d8b0", "#2a7a4a"][k], chaussures: "#1a1a1a", coif: "long", robe: true });
        h.position.set(0, 0, -.22); f.position.set(0, 0, .22); f.rotation.y = Math.PI; for (const m of [h, f]) { m.userData.poser("debout", 0); const P = m.userData.parts; P.bras[0].e.rotation.set(-1.2, 0, .3); P.bras[1].e.rotation.set(-.6, 0, -.6); c.add(m); } COUPLES.push({ c, h, f, k }); BAL.push(c); }
      for (const z of [-89.5, -90.3, -91.1]) { box(.42, .05, .42, mat({ color: 0xb8925a }), 32.3, .46, z); box(.04, .45, .42, mat({ color: 0xb8925a }), 32.5, .7, z); }
      let son = null, nB = null; AMB.push((tm) => { const n = !!L.nuit; if (n !== nB) { nB = n; for (const o of BAL) o.visible = n; }
        if (n) for (const C of COUPLES) { const a3 = tm / 1000 * .35 + C.k * Math.PI / 2, cx2 = BX + Math.cos(a3) * 3.4, cz2 = ZC + Math.sin(a3) * 4.2; C.c.position.set(cx2, 0, cz2); C.c.rotation.y = tm / 1000 * 2.2 + C.k; const ph2 = Math.sin(tm / 330 * 1.05); C.h.position.y = Math.abs(ph2) * .03; C.f.position.y = Math.abs(ph2) * .03; C.f.userData.poser("marche", tm * .6); C.h.userData.poser("marche", tm * .6 + 300); }
        const p = moiP(), d = p ? Math.hypot(p.g.position.x - BX, p.g.position.z - ZC) : 99, cible = n && !document.hidden && M.L === L && !M.cine ? Math.max(0, Math.min(1, (40 - d) / 25)) : 0;
        if (cible > .02 && !son) { son = new Audio("sons/montmartre-accordeon.mp3"); son.loop = true; son.volume = 0; }
        if (son) { son.volume += (cible * .6 - son.volume) * .05; son.volume = Math.max(0, Math.min(1, son.volume)); if (son.volume > .01 && son.paused) son.play().catch(() => {}); else if (son.volume <= .01 && !son.paused) son.pause(); }
        L.duckBal = cible; });
      quitterLieu.add(() => { if (son) { son.pause(); son = null; } }); }
    // — la balade en bateau-mouche : on monte par la passerelle, le bateau quitte le quai, passe sous le pont, remonte la Seine, fait demi-tour et revient —
    { const BQ = L.bmQuai, QX = 36, QZ = 15.3; if (BQ) {
        const PATH = [[36, 15.3], [24, 8], [6, 1.5], [-30, 0], [-120, -2], [-140, 4], [-120, 7], [-30, 6], [6, 1.5], [60, 0], [130, -2], [145, 3], [130, 6], [100, 5], [70, 5], [48, 9], [36, 15.3]].map(([x, z]) => new THREE.Vector3(x, 0, z));
        const courbe = new THREE.CatmullRomCurve3(PATH, false, "catmullrom", .3), DUR = 75000;
        let enCours = false; const balade = () => { const p = moiP(); if (!p || enCours) return; enCours = true; p.g.visible = false; const t0 = performance.now(), y0 = BQ.position.y; L.enBalade = true;
          // (10.165) on tourne la tête à 360° en glissant le doigt ou la souris ; les autres bateaux s'écartent (on ne les traverse plus)
          let yawO = 0, pitO = 0, glisse = null; const cv = M.rendu.domElement, dn = (e) => { glisse = [e.clientX, e.clientY]; }, mv = (e) => { if (!glisse) return; yawO -= (e.clientX - glisse[0]) * .006; pitO = Math.max(-.6, Math.min(.5, pitO - (e.clientY - glisse[1]) * .004)); glisse = [e.clientX, e.clientY]; }, up = () => { glisse = null; };
          cv.addEventListener("pointerdown", dn); window.addEventListener("pointermove", mv); window.addEventListener("pointerup", up); const fini = () => { cv.removeEventListener("pointerdown", dn); window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", up); L.enBalade = false; };
          M.cine = { gel: true, fov: [62, 72], maj: () => { const u = Math.min(1, (performance.now() - t0) / DUR), pt = courbe.getPointAt(u), tg = courbe.getTangentAt(Math.min(.999, u + .001)); BQ.position.set(pt.x, y0 + Math.sin(performance.now() / 900) * .06, pt.z); BQ.rotation.y = Math.atan2(-tg.z, tg.x);
            const av = new THREE.Vector3(tg.x, 0, tg.z).normalize(), cp = BQ.position.clone().addScaledVector(av, -6); cp.y = y0 + 4.3; M.camera.position.copy(cp); const dir = av.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), yawO), look = cp.clone().addScaledVector(dir, 20); look.y = cp.y - 1.1 + Math.sin(performance.now() / 4000) * .6 + Math.tan(pitO) * 20; M.camera.lookAt(look);
            if (u >= 1) { fini(); BQ.position.set(QX, y0, QZ); BQ.rotation.y = 0; finCine(); p.g.position.set(QX - 4, YB, 19.6); p.g.visible = true; try { envoyerWS({ t: "aller", x: QX - 4, z: 19.6 }); } catch (e) {} placerCamera(true); enCours = false; } } };
          fenetre("<div style='background:rgba(10,20,40,.8);color:#fff;padding:10px 18px;border-radius:12px;font:600 16px Lato,Arial,sans-serif'>⛴️ Bienvenue à bord — bonne balade sur la Seine !</div>", 3500); };
        ajouteAction((x, z) => Math.abs(x - (QX - 4)) < 2.2 && z > 18.2 && z < 21.5 ? { type: "lieu", id: "bateau", label: "⛴️ Faire une balade en bateau-mouche", faire: balade } : null); } }
    // — dans la cathédrale : le grand orgue qui joue quand on est dedans ; le présentoir des cierges, qu'on allume un à un —
    { let ac = null, gain = null, prochain = 0, i = 0; const ACC = [[130.8, 164.8, 196, 261.6], [110, 164.8, 220, 261.6], [87.3, 174.6, 220, 261.6], [98, 146.8, 196, 246.9], [130.8, 196, 261.6, 329.6], [116.5, 174.6, 233.1, 293.7], [87.3, 130.8, 174.6, 220], [98, 123.5, 196, 293.7]];
      const accord = (fs, t0, d) => { for (const f of fs) for (const [k, v] of [[1, .14], [2, .07], [3, .035], [.5, .06]]) { const o = ac.createOscillator(), g2 = ac.createGain(); o.type = k === 1 ? "sine" : "triangle"; o.frequency.value = f * k; g2.gain.setValueAtTime(0, t0); g2.gain.linearRampToValueAtTime(v, t0 + .6); g2.gain.setValueAtTime(v, t0 + d - .5); g2.gain.linearRampToValueAtTime(0, t0 + d + .8); o.connect(g2).connect(gain); o.start(t0); o.stop(t0 + d + 1); } };
      AMB.push(() => { const cible = L.dedans && M.L === L && !document.hidden ? .5 * (M.volumeGeneral ?? 1) : 0; if (!cible && !ac) return;
        if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); gain = ac.createGain(); gain.gain.value = 0; const dl = ac.createDelay(), fb = ac.createGain(), lp = ac.createBiquadFilter(); dl.delayTime.value = .33; fb.gain.value = .45; lp.type = "lowpass"; lp.frequency.value = 1800; gain.connect(lp); lp.connect(ac.destination); lp.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(ac.destination); prochain = ac.currentTime + .2; } catch (e) { return; } }   // (l'écho de la nef)
        if (ac.state === "suspended") ac.resume().catch(() => {}); gain.gain.value += (cible * .5 - gain.gain.value) * .03; if (cible < .01) return;
        while (prochain < ac.currentTime + 1) { accord(ACC[i % ACC.length], prochain, 3.6); prochain += 3.6; i++; } }); }
    { const SX = -14.6, SZ = -97, fer = mat({ color: 0x1a1a1a, metalness: .6, roughness: .4 }), cire = mat({ color: 0xf6f2e6, roughness: .6 }), N = 21, CIER = [];
      box(1.4, .06, .7, fer, SX, .95, SZ); box(1.2, .06, .5, fer, SX, 1.15, SZ - .1); for (const [x, z] of [[-.6, -.3], [.6, -.3], [-.6, .3], [.6, .3]]) box(.04, .95, .04, fer, SX + x, .48, SZ + z);
      for (let k = 0; k < N; k++) { const r = k < 12 ? 0 : 1, c = k < 12 ? k : k - 12, x = SX - .6 + c * (r ? .14 : .11) + (r ? .05 : 0), y = r ? 1.18 : .98, z = SZ + (r ? -.1 : .15); cyl(.025, .025, .22, cire, x, y + .11, z, 8);
        const fl = new THREE.Mesh(new THREE.ConeGeometry(.018, .06, 6), new THREE.MeshBasicMaterial({ color: 0xffc860 })); fl.position.set(x, y + .26, z); fl.visible = false; scene.add(fl); CIER.push(fl); }
      const lumC = new THREE.PointLight(0xffb060, 0, 6, 1.5); lumC.position.set(SX, 1.6, SZ); scene.add(lumC); IOBS.push([SX - .8, SX + .8, SZ - .45, SZ + .45]);
      let nAll = 3; for (let k = 0; k < nAll; k++) CIER[k * 7].visible = true;
      AMB.push((tm) => { let n = 0; CIER.forEach((f, k) => { if (f.visible) { n++; f.scale.y = 1 + Math.sin(tm / 90 + k * 2) * .2; f.scale.x = 1 + Math.sin(tm / 130 + k) * .1; } }); lumC.intensity = n * .9 + Math.sin(tm / 110) * .3; });
      const allumer = () => { const libre = CIER.filter(f => !f.visible); const f = libre.length ? libre[(Math.random() * libre.length) | 0] : CIER[(Math.random() * CIER.length) | 0]; f.visible = true; fenetre("<div style='background:rgba(30,20,10,.8);color:#ffe8b0;padding:10px 18px;border-radius:12px;font:italic 16px Georgia,serif'>🕯️ Vous avez allumé un cierge</div>", 2500); };
      ajouteAction((x, z) => Math.hypot(x - SX, z - (SZ + .9)) < 1.6 ? { type: "lieu", id: "cierge", label: "🕯️ Allumer un cierge", faire: allumer } : null); }
    // — les mouettes : perchées sur les réverbères du bord de l'eau ; d'autres qui tournent au-dessus de la Seine —
    { const blancM = mat({ color: 0xf4f4f0, roughness: .7 }), grisM = mat({ color: 0xa8b0b8, roughness: .7 }), jauneM = mat({ color: 0xf0c020 }), noirM2 = mat({ color: 0x141414 });
      const mouette = () => { const g = new THREE.Group(), O = (geo, m, x, y, z, sx = 1, sy = 1, sz = 1) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.scale.set(sx, sy, sz); g.add(o); return o; };
        O(new THREE.SphereGeometry(.1, 10, 8), blancM, 0, .12, 0, .85, .8, 1.7); const t = O(new THREE.SphereGeometry(.06, 10, 8), blancM, 0, .22, .14); O(new THREE.ConeGeometry(.015, .07, 6), jauneM, 0, .21, .22).rotation.x = Math.PI / 2;
        const aG = O(new THREE.BoxGeometry(.3, .015, .12), grisM, -.15, .15, -.02), aD = O(new THREE.BoxGeometry(.3, .015, .12), grisM, .15, .15, -.02); O(new THREE.BoxGeometry(.06, .02, .08), noirM2, 0, .14, -.18); scene.add(g); return { g, t, aG, aD }; };
      const PER = []; for (const x of [-120, -60, 24, 80, 140]) { const m = mouette(); m.g.position.set(x, TROT + 4.92, 29.6); m.g.rotation.y = Math.PI + (Math.random() - .5); PER.push(m); }
      for (let x = -XS + 12 + 48; x < XS; x += 72) { const m = mouette(); m.g.position.set(x, 4.92, -25.9); m.g.rotation.y = Math.random() * 6; PER.push(m); }
      const VOL2 = [0, 1, 2, 3].map(k => ({ m: mouette(), k, r: 14 + k * 4, cx: -40 + k * 35, h: 9 + k * 2 }));
      AMB.push((tm) => { for (const [k, M2] of PER.entries()) { M2.t.rotation.y = Math.sin(tm / 1200 + k * 3) * .8; const f = Math.sin(tm / 2600 + k * 5) > .96; M2.aG.rotation.z = f ? Math.sin(tm / 60) * .6 : -.15; M2.aD.rotation.z = f ? -Math.sin(tm / 60) * .6 : .15; }
        for (const V of VOL2) { const a4 = tm / 1000 * (.25 + V.k * .03) + V.k; V.m.g.position.set(V.cx + Math.cos(a4) * V.r, V.h + Math.sin(tm / 1700 + V.k) * 1.2, Math.sin(a4) * 9); V.m.g.rotation.y = -a4; V.m.g.rotation.z = .25; const b3 = Math.sin(tm / 140 + V.k) * .5; V.m.aG.rotation.z = b3 > .2 ? b3 : .1; V.m.aD.rotation.z = -(b3 > .2 ? b3 : .1); } }); }
    // — la péniche-logement amarrée au bas-port de l'île : la coque bleu nuit, la timonerie de bois, les hublots éclairés le soir, les plantes en pots, le vélo, deux transats, la guirlande —
    { const X = 74, Z = -15.2, g = new THREE.Group(); g.position.set(X, YE + .5, Z); scene.add(g); const b = (w, h, d, m, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); g.add(o); return o; };
      const bleuN = mat({ color: 0x1a2a4a, roughness: .5 }), boisP2 = mat({ color: 0x8a5a32, roughness: .7 }), fen = mat({ color: 0xffd890, emissive: 0xffc070, emissiveIntensity: .1 }); NUIT.push([fen, .1, 1.4]);
      coque(g, 26, 5, 1.8, bleuN, 0); b(26, .1, 4.8, mat({ color: 0x6a5040 }), 0, .92, 0); b(26.2, .2, 5.2, mat({ color: 0xc8202a }), 0, .5, 0);
      b(14, 1.8, 4, boisP2, -2, 1.9, 0); b(14.4, .12, 4.4, mat({ color: 0x3a2a1e }), -2, 2.85, 0); for (let i = 0; i < 6; i++) for (const s of [-1, 1]) { const h2 = new THREE.Mesh(new THREE.CircleGeometry(.28, 16), fen); h2.position.set(-8 + i * 2.3, 2.0, s * 2.01); h2.rotation.y = s > 0 ? 0 : Math.PI; g.add(h2); }
      b(3, 1.4, 3, boisP2, 8.5, 1.7, 0); b(3.04, .5, 3.04, fen, 8.5, 2.1, 0); b(3.3, .1, 3.3, mat({ color: 0x3a2a1e }), 8.5, 2.45, 0);
      for (let i = 0; i < 9; i++) { const x = -8 + i * 1.6; b(.4, .35, .4, mat({ color: 0xb8603a }), x, 3.1, -1.6); const pl = new THREE.Mesh(new THREE.IcosahedronGeometry(.32, 0), mat({ color: [0x3a6a2a, 0x4a7a30, 0x2e5a24][i % 3], roughness: .9 })); pl.position.set(x, 3.45, -1.6); g.add(pl); if (i % 3 === 1) { const fl2 = new THREE.Mesh(new THREE.SphereGeometry(.1, 6, 4), mat({ color: [0xd82a4a, 0xf2c020, 0xe86aa8][i % 3] })); fl2.position.set(x + .1, 3.7, -1.5); g.add(fl2); } }
      // le vélo, appuyé contre la timonerie ; deux transats
      { const r = new THREE.TorusGeometry(.32, .025, 6, 18); for (const dx of [-.55, .55]) { const o = new THREE.Mesh(r, mat({ color: 0x141414 })); o.position.set(10.6 + dx, 1.33, 1.6); g.add(o); } b(1.0, .03, .03, mat({ color: 0x2a6a8a }), 10.6, 1.6, 1.6); b(.03, .5, .03, mat({ color: 0x2a6a8a }), 10.4, 1.45, 1.6); b(.18, .03, .1, mat({ color: 0x141414 }), 10.3, 1.75, 1.6); }
      for (const dx of [-11.5, -10]) { b(.6, .05, 1.3, mat({ color: 0xe8e0c8 }), dx, 1.3, 1.2).rotation.x = -.3; b(.6, .05, .4, mat({ color: [0x2a6ab0, 0xd8402a][dx < -11 ? 0 : 1] }), dx, 1.55, .55).rotation.x = .7; }
      { const pts = []; const amp = mat({ color: 0xfff0c0, emissive: 0xffd080, emissiveIntensity: 1.5 }); for (let i = 0; i <= 16; i++) { const x = -12 + i * 1.5, y = 3.6 - Math.sin(i / 16 * Math.PI) * .4; pts.push(new THREE.Vector3(x, y, 1.9)); if (i % 2) { const s = new THREE.Mesh(new THREE.SphereGeometry(.06, 6, 4), amp); s.position.set(x, y - .08, 1.9); g.add(s); } } g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x222222 }))); }
      drapeau(g, -13.5, 1.9); box(1.2, .08, 1.6, metB, X, YB + .3, -18.3); }
    /* ---------- (10.161) en terrasse : on s'assoit, on commande — un café, un croissant, un chocolat chaud, un verre de vin, une crêpe — et le garçon vient servir ---------- */
    { const moiC = () => M && M.moiNum && M.gens.get(M.moiNum), porc = mat({ color: 0xf8f6f0, roughness: .3 }), cafeM = mat({ color: 0x2a1408, roughness: .2 }), choco = mat({ color: 0x5a2a14, roughness: .3 }), creme = mat({ color: 0xf4ead8 }), doré = mat({ color: 0xd8a050, roughness: .6 }), verreM = mat({ color: 0xe8f0f4, transparent: true, opacity: .35, roughness: .05 }), vin = mat({ color: 0x6a0a1a, roughness: .2 });
      const objet = (k) => { const g = new THREE.Group(), O = (geo, m, x, y, z, rx = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.x = rx; g.add(o); return o; };
        if (k === "cafe" || k === "choco") { const r = k === "cafe" ? .035 : .05, h = k === "cafe" ? .05 : .08; O(new THREE.CylinderGeometry(.075, .065, .01, 18), porc, 0, .005, 0); O(new THREE.CylinderGeometry(r, r * .8, h, 16), porc, 0, h / 2 + .01, 0); O(new THREE.CircleGeometry(r * .92, 16), k === "cafe" ? cafeM : choco, 0, h + .006, 0, -Math.PI / 2); const an = O(new THREE.TorusGeometry(r * .5, .006, 6, 10), porc, r + .01, h / 2 + .01, 0); an.rotation.y = Math.PI / 2;
          if (k === "choco") O(new THREE.SphereGeometry(.035, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), creme, 0, h + .005, 0); O(new THREE.BoxGeometry(.02, .005, .012), mat({ color: 0xf2f2f2 }), .06, .012, .03); }   // (la tasse, la soucoupe, le sucre)
        else if (k === "croissant") { O(new THREE.CylinderGeometry(.09, .09, .006, 20), porc, 0, .003, 0); const c = O(new THREE.TorusGeometry(.05, .022, 8, 14, Math.PI * 1.25), doré, 0, .03, 0, -Math.PI / 2); c.rotation.z = .9; for (let i = 0; i < 4; i++) { const b = O(new THREE.TorusGeometry(.05, .026, 6, 4, .12), doré, 0, .03, 0, -Math.PI / 2); b.rotation.z = .9 + .3 + i * .5; } }
        else if (k === "vin") { O(new THREE.CylinderGeometry(.03, .025, .005, 14), verreM, 0, .003, 0); O(new THREE.CylinderGeometry(.004, .004, .07, 6), verreM, 0, .04, 0); O(new THREE.SphereGeometry(.035, 12, 8, 0, Math.PI * 2, Math.PI / 2.4, Math.PI / 1.8), verreM, 0, .11, 0); O(new THREE.SphereGeometry(.03, 12, 8, 0, Math.PI * 2, Math.PI / 1.8, Math.PI / 2.6), vin, 0, .108, 0); }
        else { O(new THREE.CylinderGeometry(.11, .11, .006, 20), porc, 0, .003, 0); const cr = O(new THREE.CylinderGeometry(.09, .09, .012, 20), doré, 0, .012, 0); cr.scale.z = .45; O(new THREE.BoxGeometry(.05, .004, .02), mat({ color: 0x5a2a14 }), 0, .02, 0); }   // (la crêpe pliée, son chocolat)
        g.userData.anime = true; scene.add(g); return g; };
      const CARTE = [["cafe", "☕ Un café", "Et voilà, un petit noir !"], ["croissant", "🥐 Un croissant", "Un croissant tout chaud, bon appétit !"], ["choco", "🍫 Un chocolat chaud", "Un chocolat chaud avec sa chantilly !"], ["vin", "🍷 Un verre de vin rouge", "Un petit bordeaux, à votre santé !"], ["crepe", "🥞 Une crêpe au chocolat", "Une crêpe au chocolat, régalez-vous !"]];
      let bouton = null, cmd = null; const SUR = [];   // (SUR : ce qui est posé sur ma table)
      const garcon = personne3D({ taille: 1.76, peau: "#e8c4a0", ch: "#141010", haut: "#f4f2ec", bas: "#141414", chaussures: "#141414", coif: "court", pantalon: true }); garcon.visible = false; garcon.userData.anime = true; scene.add(garcon);
      { const t = new THREE.Mesh(new THREE.BoxGeometry(.36, .6, .02), mat({ color: 0x141414 })); t.position.set(0, -.3, .13); garcon.userData.parts.bassin.add(t); const n = new THREE.Mesh(new THREE.BoxGeometry(.06, .04, .02), mat({ color: 0x141414 })); n.position.set(0, .26, .12); garcon.userData.parts.buste.add(n); }
      const plateau = new THREE.Mesh(new THREE.CylinderGeometry(.2, .2, .015, 16), mat({ color: 0xc8c8c8, metalness: .7, roughness: .3 })); plateau.visible = false; scene.add(plateau);
      const commander = (k) => { const p = moiC(); if (!p || !Number.isInteger(p.info.assis)) return; const tb = L.tabourets[p.info.assis], t = TERR.find(q => Math.hypot(q[0] - tb[0], q[1] - tb[1]) < .05); if (!t) return;
        const [cx, cz, cap, T, lx] = t, tx = cx + Math.sin(cap) * .55, tz = cz + Math.cos(cap) * .55, porte = new THREE.Vector3(lx, 0, -.6).applyMatrix4(T), avant = new THREE.Vector3(lx, 0, 1.2).applyMatrix4(T), pres = new THREE.Vector3(tx - Math.cos(cap) * .55, 0, tz + Math.sin(cap) * .55);
        cmd = { k, msg: CARTE.find(c => c[0] === k)[2], etape: 0, pts: [porte, avant, pres], ret: [avant, porte], tx, tz, i: 0, pause: 0 }; garcon.position.copy(porte); garcon.position.y = TROT; garcon.visible = true; plateau.visible = true; };
      const menu = () => { if (M.manMenu) return; const d = document.createElement("div"); d.style.cssText = "position:absolute;left:50%;bottom:90px;transform:translateX(-50%);z-index:30;background:rgba(40,18,14,.95);color:#fff;border-radius:16px;padding:14px 16px;font:15px Lato,Arial,sans-serif;min-width:260px;max-width:92%;box-shadow:0 8px 30px rgba(0,0,0,.5)";
        d.innerHTML = "<div style='font-weight:700;margin-bottom:10px;font-family:Georgia,serif'>☕ Qu'est-ce que je vous sers ?</div>"; const fermer = () => { d.remove(); M.manMenu = null; };
        for (const [k, t] of CARTE) { const b = document.createElement("button"); b.type = "button"; b.textContent = t; b.style.cssText = "display:block;width:100%;text-align:left;margin:6px 0;padding:11px 12px;border:0;border-radius:10px;background:#8a1c1c;color:#fff;font:15px Lato,Arial,sans-serif;cursor:pointer"; b.onclick = () => { fermer(); commander(k); }; d.appendChild(b); }
        const x = document.createElement("button"); x.type = "button"; x.textContent = "Rien, merci"; x.style.cssText = "display:block;width:100%;margin-top:6px;padding:9px;border:0;border-radius:10px;background:rgba(255,255,255,.12);color:#fff;font:14px Lato,Arial,sans-serif"; x.onclick = fermer; d.appendChild(x);
        (M.ctx.conteneur || document.body).appendChild(d); M.manMenu = { d, fermer }; };
      const bulleG = (txt) => { const d = document.createElement("div"); d.style.cssText = "position:absolute;left:50%;top:22%;transform:translateX(-50%);z-index:40;background:#fff;color:#2a1a10;border-radius:14px;padding:10px 16px;font:italic 16px Georgia,serif;box-shadow:0 4px 16px rgba(0,0,0,.4);pointer-events:none"; d.textContent = "« " + txt + " »"; (M.ctx.conteneur || document.body).appendChild(d); setTimeout(() => d.remove(), 3500); };
      AMB.push((tm, dt) => { dt = dt || .016; const p = moiC(), assis = p && Number.isInteger(p.info.assis) && M.L === L && !M.cine, tb = assis && L.tabourets[p.info.assis], enTerrasse = !!(tb && TERR.some(q => Math.hypot(q[0] - tb[0], q[1] - tb[1]) < .05));
        if (enTerrasse && !bouton) { bouton = document.createElement("button"); bouton.type = "button"; bouton.textContent = "☕ Commander"; bouton.style.cssText = "position:absolute;left:50%;bottom:150px;transform:translateX(-50%);z-index:30;padding:11px 20px;border:0;border-radius:24px;background:#8a1c1c;color:#fff;font:600 16px Lato,Arial,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.4);cursor:pointer"; bouton.onclick = (e) => { e.stopPropagation(); if (!cmd) menu(); }; (M.ctx.conteneur || document.body).appendChild(bouton); }
        if (!enTerrasse && bouton) { bouton.remove(); bouton = null; if (M.manMenu && M.manMenu.d && M.manMenu.d.textContent.includes("je vous sers")) M.manMenu.fermer(); }
        if (!assis && SUR.length) { for (const o of SUR.splice(0)) scene.remove(o); }   // (on se lève : la table est débarrassée)
        if (!cmd) return; const g = garcon, P = g.userData.parts;
        if (cmd.pause > 0) { cmd.pause -= dt; g.userData.poser("debout", tm); }
        else { const liste = cmd.etape === 0 ? cmd.pts : cmd.ret, cible = liste[cmd.i]; if (!cible) { if (cmd.etape === 0) { const o = objet(cmd.k); o.position.set(cmd.tx + (SUR.length % 3 - 1) * .14, TROT + .765, cmd.tz + ((SUR.length / 3) | 0) * .12); SUR.push(o); bulleG(cmd.msg); cmd.etape = 1; cmd.i = 0; cmd.pause = 1.2; } else { g.visible = false; plateau.visible = false; cmd = null; } return; }
          const dx = cible.x - g.position.x, dz = cible.z - g.position.z, d = Math.hypot(dx, dz); if (d < .1) { cmd.i++; return; } const v = Math.min(d, 1.3 * dt); g.position.x += dx / d * v; g.position.z += dz / d * v; g.rotation.y = Math.atan2(dx, dz); g.userData.poser("marche", tm); }
        P.bras[1].e.rotation.set(-1.45, 0, 0); P.bras[1].c.rotation.set(-.15, 0, 0); g.updateMatrixWorld(true); const h = new THREE.Vector3(); P.bras[1].c.getWorldPosition(h); const fw = new THREE.Vector3(Math.sin(g.rotation.y), 0, Math.cos(g.rotation.y)); plateau.position.set(h.x + fw.x * .3, h.y + .02, h.z + fw.z * .3);
        if (cmd && cmd.etape === 0 && !plateau.userData.o) { const o = objet(cmd.k); plateau.userData.o = o; } if (plateau.userData.o) { if (cmd && cmd.etape === 0) plateau.userData.o.position.set(plateau.position.x, plateau.position.y + .01, plateau.position.z); else { scene.remove(plateau.userData.o); plateau.userData.o = null; } } });
      quitterLieu.add(() => { if (bouton) { bouton.remove(); bouton = null; } }); }
    // l'accordéoniste
    { const ax = -31, az = 28.9, m = personne3D({ taille: 1.74, peau: "#d8a888", ch: "#8a8a8a", haut: "#3a3028", bas: "#2a2a30", chaussures: "#2a1a14", coif: "court", pantalon: true }); m.position.set(ax, TROT, az); m.rotation.y = Math.PI * .1; m.userData.poser("debout", 0); m.userData.anime = true; scene.add(m);
      const P = m.userData.parts, b = (w, h, d, mm, x, y, z, par) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mm); o.position.set(x, y, z); par.add(o); return o; };
      const cas = new THREE.Mesh(new THREE.CylinderGeometry(.12, .12, .06, 14), mat({ color: 0x2a2a30 })); cas.position.set(0, .1, 0); P.tete.add(cas); b(.24, .02, .1, mat({ color: 0x2a2a30 }), 0, .07, .12, P.tete);
      const ac = new THREE.Group(); ac.position.set(0, .2, .2); P.buste.add(ac); const rouge = mat({ color: 0xa8141c, roughness: .35, metalness: .2 }), nacre = mat({ color: 0xf2efe6, roughness: .3 }), noirA = mat({ color: 0x141414 });
      const gD = b(.08, .32, .2, rouge, -.18, 0, 0, ac), gG = b(.08, .32, .2, rouge, .18, 0, 0, ac); for (let t = 0; t < 7; t++) b(.012, .3, .02, nacre, -.21, -.12 + t * .04, .1, ac);
      const souf = []; for (let i = 0; i < 6; i++) souf.push(b(.045, .3, .19, i % 2 ? noirA : mat({ color: 0xe8e2d6 }), -.12 + i * .048, 0, 0, ac));
      box(.7, .1, .35, mat({ color: 0x3a2a1e }), ax + .9, TROT + .05, az + .5); for (let i = 0; i < 5; i++) cyl(.02, .02, .005, mat({ color: 0xd8b860, metalness: .8, roughness: .3 }), ax + .7 + i * .1, TROT + .11, az + .45 + (i % 2) * .05, 8);
      OBS.push([ax - .4, ax + .4, az - .4, az + .4], [ax + .5, ax + 1.3, az + .3, az + .7]);
      AMB.push((tm) => { m.userData.poser("debout", tm); const o = Math.sin(tm / 330); for (let i = 0; i < 6; i++) souf[i].position.x = (-.12 + i * .048) * (1 + o * .3); gD.position.x = -.18 - o * .05; gG.position.x = .18 + o * .05; P.bras[0].e.rotation.set(-1.1, 0, -.5 - o * .12); P.bras[1].e.rotation.set(-1.1, 0, .5 + o * .12); P.tete.rotation.y = Math.sin(tm / 1500) * .3; P.bassin.rotation.y = Math.sin(tm / 700) * .08; }); }
    // le peintre, face à la Seine et à Notre-Dame
    { const px = 30, pz = 27.6, m = gens(77); m.position.set(px, TROT, pz); m.rotation.y = Math.PI + .5; m.userData.poser("debout", 0); m.userData.anime = true; scene.add(m); const P = m.userData.parts; P.bras[1].e.rotation.x = -1.2;
      const bo = mat({ color: 0x8a6a42 }); for (const [lx, lz, r] of [[-.3, -.7, .15], [.3, -.7, .15], [0, -.35, -.3]]) { const l = new THREE.Mesh(new THREE.BoxGeometry(.04, 1.6, .04), bo); l.position.set(px - .5 + lx, TROT + .78, pz + lz); l.rotation.x = r; scene.add(l); }
      const tl = tT(96, 72, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#f2b890"); g.addColorStop(.6, "#e8c8a8"); g.addColorStop(1, "#5a7a6a"); c.fillStyle = g; c.fillRect(0, 0, w, h); c.fillStyle = "#c8b8a0"; c.fillRect(38, 14, 8, 34); c.fillRect(52, 14, 8, 34); c.fillRect(36, 30, 26, 18); c.fillStyle = "#3a4a5a"; c.fillRect(0, 50, w, 4); });
      const cv = new THREE.Mesh(new THREE.BoxGeometry(.7, .55, .03), mat({ map: tl, roughness: .8 })); cv.position.set(px - .5, TROT + 1.35, pz - .78); cv.rotation.y = Math.PI; cv.rotation.x = .12; scene.add(cv); OBS.push([px - 1, px + .3, pz - 1.1, pz + .4]);
      AMB.push((tm) => { P.bras[1].c.rotation.x = -1.0 + Math.sin(tm / 400) * .25; P.tete.rotation.y = Math.sin(tm / 2600) * .4; }); }
    // les pigeons de Paris (les mêmes que partout dans le jeu : gris bleuté, cou irisé) — beaucoup sur le parvis ; ils picorent, et s'envolent sur les toits quand on s'approche, puis reviennent
    { const G = geoPigeon(), pm = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .75 }), pi = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .35, metalness: .25 }), PG = [];
      const BANDES = [[-4, -42, 9], [9, -50, 8], [-16, -56, 7], [22, -40, 7], [2, -62, 8], [-32, -44, 6], [24, -58, 6], [-8, -36, 5], [16, -64, 6], [-24, -64, 5], [-60, 35, 5], [20, 37, 5], [-100, 33, 4], [60, 36, 4]];
      for (const [bx, bz, n] of BANDES) for (let k = 0; k < (PEU ? Math.ceil(n / 2) : n); k++) { const g = new THREE.Group(), c = new THREE.Mesh(G.corps, pm), t = new THREE.Mesh(G.tete, pi), aG = new THREE.Mesh(G.aileG, pm), aD = new THREE.Mesh(G.aileD, pm);
        t.position.set(0, .2, .1); aG.position.set(-.06, .19, .04); aD.position.set(.06, .19, .04); g.add(c, t, aG, aD); g.scale.setScalar(.9 + al() * .2); g.userData.anime = true;
        const hx = bx + (al() - .5) * 3.5, hz = bz + (al() - .5) * 3.5; g.position.set(hx, .02, hz); g.rotation.y = al() * 6.28; scene.add(g);
        PG.push({ g, t, aG, aD, hx, hz, etat: "sol", fin: 0, ph: al() * 10 }); }
      let tpP = 0; AMB.push((tm) => { const dt = tpP ? Math.min(.1, (tm - tpP) / 1000) : 0; tpP = tm; const moi = M && M.moiNum && M.gens.get(M.moiNum), q = moi && moi.g.position, c = M && M.camera && M.camera.position;
        for (const P of PG) { const g = P.g; if (L.nuit) { g.visible = false; continue; } const loin = c && (g.position.x - c.x) ** 2 + (g.position.z - c.z) ** 2 > 1600; g.visible = !loin || P.etat !== "sol"; if (loin && P.etat === "sol") continue;
          if (P.etat === "sol") { if (q && Math.hypot(q.x - g.position.x, q.z - g.position.z) < 2.6) { const a = Math.atan2(g.position.z - q.z, g.position.x - q.x) + (al() - .5); P.etat = "vol"; P.u = 0; P.P0 = g.position.clone(); P.P1 = new THREE.Vector3(g.position.x + Math.cos(a) * 14, 16 + al() * 5, g.position.z + Math.sin(a) * 14); P.fin = tm + 12000 + al() * 12000; continue; }
            const s = Math.sin(tm / 260 + P.ph); P.t.rotation.x = s > .6 ? .7 : 0; if (al() < dt * .5) g.rotation.y += (al() - .5) * 2; if (s < -.5) { g.position.x += Math.sin(g.rotation.y) * dt * .25; g.position.z += Math.cos(g.rotation.y) * dt * .25; if (Math.hypot(g.position.x - P.hx, g.position.z - P.hz) > 2.5) g.rotation.y += Math.PI; g.position.y = L.hauteur(g.position.x, g.position.z) + .02; } P.aG.rotation.z = P.aD.rotation.z = 0; }
          else if (P.etat === "vol" || P.etat === "retour") { P.u += dt / 2.2; const u = Math.min(1, P.u), A = P.P0, B = P.P1; g.position.set(A.x + (B.x - A.x) * u, A.y + (B.y - A.y) * u + Math.sin(u * Math.PI) * 1.5, A.z + (B.z - A.z) * u); g.rotation.y = Math.atan2(B.x - A.x, B.z - A.z);
            const b = Math.sin(tm / 45) * .9; P.aG.rotation.z = b; P.aD.rotation.z = -b; if (u >= 1) { P.etat = P.etat === "vol" ? "toit" : "sol"; P.aG.rotation.z = P.aD.rotation.z = 0; } }
          else if (P.etat === "toit" && tm > P.fin && (!q || Math.hypot(q.x - P.hx, q.z - P.hz) > 6)) { P.etat = "retour"; P.u = 0; P.P0 = g.position.clone(); const x = P.hx + (al() - .5) * 2, z = P.hz + (al() - .5) * 2; P.P1 = new THREE.Vector3(x, L.hauteur(x, z) + .02, z); } } }); } }
  /* ---------- là où l'on marche, la hauteur du sol ---------- */
  const enRampe = (x, z) => x > RAMPE_C[0] && x < RAMPE_C[1] && z < -22.4 && z > -25.8 && !(z > -23.05 && x > RAMPE_C[0] + 1 && x < RAMPE_C[1] - 3.2) && (z > -25.15 || x > RAMPE_C[1] - 4);
  const enEsc = (x, z) => x > ESC[0] && x < ESC[1] && z > 22.4 && z < 25.25;
  const libreObs = (x, z) => !(x > -21 && x < 19 && z < -68.4 && z > -208);
  L.hauteur = (x, z, p) => { if (enEsc(x, z)) return YB * Math.max(0, Math.min(1, (ESC[1] - x) / (ESC[1] - ESC[0])));
    for (const [a, b, c, d] of TR) if (x >= a && x <= b && z >= c && z <= d) return TROT;   // (sur le trottoir)
    if (enRampe(x, z)) return z < -25.15 ? 0 : YB * Math.max(0, Math.min(1, (RAMPE_C[1] - x) / (RAMPE_C[1] - RAMPE_C[0])));
    const pont = x > PP[0] && x < PP[1]; if (Math.abs(z) < 22.5 && Math.abs(z) > 18) return pont && !(p && p.g && p.g.position.y < -2) ? 0 : YB; return 0; };   /* (sous le pont, au bord de l'eau, on reste en bas) */
  // (10.147) les obstacles, rangés par cases de 4 m : la carte des passages se calcule d'un coup, sans figer le jeu
  let OBSH = null; const obsCase = (x, z) => ((Math.floor(x / 4) + 200) << 10) | (Math.floor(z / 4) + 200);
  const obsIci = (x, z) => { if (!OBSH) { OBSH = new Map(); for (const r of OBS) for (let i = Math.floor(r[0] / 4); i <= Math.floor(r[1] / 4); i++) for (let j = Math.floor(r[2] / 4); j <= Math.floor(r[3] / 4); j++) { const k = ((i + 200) << 10) | (j + 200); (OBSH.get(k) || OBSH.set(k, []).get(k)).push(r); } }
    const l = OBSH.get(obsCase(x, z)); if (l) for (const [a, b, c, d] of l) if (x > a && x < b && z > c && z < d) return true; return false; };
  const moiBas = () => { try { const p = M && M.moiNum && M.gens.get(M.moiNum); return !!(p && p.g.position.y < -2); } catch (e) { return false; } };
  L.limites = (x, z) => { if (x < -XS + 2 || x > XS - 2) return false;
    if (obsIci(x, z)) return false;
    if (x > PP[0] + .6 && x < PP[1] - .6 && z > -25.8 && z < 25.8) return true;   // le pont
    if (Math.abs(z) > 18.4 && Math.abs(z) < 22.4) return !(x > PP[0] - .5 && x < PP[1] + .5) || moiBas();   // les bas-ports (sous le pont, seulement quand on est en bas : on ne sort pas du pont par la rambarde)
    if (enEsc(x, z)) return !(z < 22.95 && x > ESC[0] + 3);   // l'escalier (le garde-corps, côté eau)
    if (x > ESC[1] - ESCE + .3 && x < ESC[1] - .2 && z >= 25.25 && z <= 25.7) return true;   // (l'entrée de l'escalier, par le parapet)
    if (enRampe(x, z)) return true;
    if (z > 25.7 && z < 44.4) return true;   // le grand quai
    if (x > PP[0] - 3.5 && x < PP[1] + 3.5 && z >= 44.4 && z < 125) return true;   // la rue du Petit-Pont
    if (z < -25.7 && z >= -31) return true;   // le quai de l'île, sa chaussée
    if (z < -44.6 && z > -63 && x > -77.4 && x <= -35.4) return true;   // la petite place
    { const di = L.dedansOK(x, z); if (di !== null) return di; }   // (10.159 : dans la cathédrale)
    if (z < -31 && z > -213 && x > -35.4 && x < 33.4) return libreObs(x, z);   // le parvis, les côtés de la cathédrale, le square
    return false; };
  L.dbgMarch = MARCH; L.depart = [MX + 3.8, MZ]; L.taille = 1.8; L.suivi = { d: 6.5, h: 3.6, av: 3, vy: 2 }; L.fov = [60, 74];
  L.zone = [-XS, XS, -232, 140]; L.cam = { pos: [MX + 6, 7, 40], vise: [FAC.x, 25, FAC.z] }; L.sansMusique = true;
  // l'abribus du quai de l'île, devant le parvis : on y arrive en bus, on y repart
  try { busLigne(L, scene, { ax: 30, az: -31.8, affiche: "orangina", voie: -29.0, sens: 1, x0: -148, x1: 148, dest: [{ vers: "rue", nom: "Rue du Faubourg-Poissonnière (la caserne)", arrivee: [10, -4.7], yawA: 0 }, { vers: "grande", nom: "Rue d'Hauteville", arrivee: [-6, -154.6], yawA: Math.PI }, { vers: "rex", nom: "Bonne-Nouvelle (le Grand Rex)", arrivee: [-26, -10.2], yawA: 0 }] }); } catch (e) { console.warn(e); }

  /* ---------- l'animation : l'eau, les bateaux, les voitures, les promeneurs, la nuit ---------- */
  let nV = null, tp = 0;
  const a0 = L.anim; L.anim = (tm) => { try { a0 && a0(tm); } catch (e) {} const n = !!L.nuit; if (n !== nV) { nV = n; for (const [m, j, nn] of NUIT) m.emissiveIntensity = n ? nn : j; }
    const dt = tp ? Math.min(.1, (tm - tp) / 1000) : 0; tp = tm; const t = tm / 1000;
    eauT.offset.x = (t * .012) % 1; EAU.u.t.value = t % 10000;
    if (n !== EAU.nuit) { EAU.nuit = n; EAU.u.ciel.value.setHex(n ? 0x16203a : 0xe8b8a4); EAU.u.clair.value.setHex(n ? 0x1a2a30 : 0x6a7468); EAU.u.profond.value.setHex(n ? 0x0c1618 : 0x24403a); EAU.u.soleil.value.set(n ? .3 : -.8, n ? .55 : .3, n ? -.6 : .4).normalize(); EAU.u.eclat.value = n ? .08 : 1; }
    for (const B of BAT) { if (B.g.visible === !!L.enBalade) B.g.visible = !L.enBalade; const Lg = XS * 2 + 80, d = ((B.x0 + t * Math.abs(B.v)) % Lg), x = B.v > 0 ? -XS - 40 + d : XS + 40 - d; B.g.position.set(x, B.y + Math.sin(t * 1.3 + B.x0) * .05, B.z); B.g.rotation.y = B.v > 0 ? 0 : Math.PI; B.g.rotation.x = Math.sin(t * .9 + B.x0) * .01; }
    // les feux : cycle de 40 s — A (la rue du Petit-Pont et le pont) vert 0-14, orange 14-17 ; B (le quai) vert 20-34, orange 34-37 ; les piétons traversent le quai pendant A, la rue pendant B
    { const cy = t % 40, A = cy < 14 ? "vert" : cy < 17 ? "orange" : "rouge", B = cy >= 20 && cy < 34 ? "vert" : cy >= 34 && cy < 37 ? "orange" : "rouge", pA = cy > 1 && cy < 13 ? "vert" : "rouge", pB = cy > 21 && cy < 33 ? "vert" : "rouge";
      FEUX.A = A; FEUX.B = B; FEUX.pA = pA; FEUX.pB = pB; const F = L.feuxM, cle = A + B + pA + pB;
      if (F && cle !== FEUX.k0) { FEUX.k0 = cle; for (const [s, ph] of [["A", A], ["B", B]]) { F[s].R.emissiveIntensity = ph === "rouge" ? 2.2 : 0; F[s].O.emissiveIntensity = ph === "orange" ? 2.2 : 0; F[s].V.emissiveIntensity = ph === "vert" ? 2.2 : 0; }
        for (const [s, ph] of [["QA", pA], ["QB", pB]]) { F[s].PR.emissiveIntensity = ph === "rouge" ? 1.8 : 0; F[s].PV.emissiveIntensity = ph === "vert" ? 1.8 : 0; } } }
    for (const V of VOIT) { let cible = V.vmax;
      for (const W of VOIT) if (W !== V && W.ch === V.ch) { const gap = (W.s - V.s + V.lg) % V.lg, mg = 6.5 + (W.long + V.long) / 2; if (gap > 0 && gap < mg + 8) cible = Math.min(cible, Math.max(0, (gap - mg) * 1.4)); }   // (on garde ses distances)
      for (const [st, s0] of V.stops) { const ph = FEUX[s0]; if (ph === "vert" || st < 0) continue; const d = st - V.s; if (d > -.2 && d < 26 && !(ph === "orange" && d < 4)) cible = Math.min(cible, Math.max(0, (d - .6) * 1.1)); }   // (au feu rouge, on s'arrête à la ligne)
      V.v += (cible - V.v) * Math.min(1, dt * (cible < V.v ? 3 : 1.2)); V.s = (V.s + V.v * dt) % V.lg; const [l0, d, a, b] = V.seg.find(([l0, d]) => V.s < l0 + d) || V.seg[V.seg.length - 1], u = Math.min(1, (V.s - l0) / d); V.g.position.set(a[0] + (b[0] - a[0]) * u, .03, a[1] + (b[1] - a[1]) * u); V.g.rotation.y = Math.atan2(b[0] - a[0], b[1] - a[1]); }
    const c = M && M.camera && M.camera.position, R2 = ((MOBILE || GPU_MODESTE) ? 40 : 70) ** 2;
    for (const f of AMB) try { f(tm, dt); } catch (e) {}
    for (const W of MARCH) try { const m = W.m, [tx, tz] = W.R[W.i], dx = tx - m.position.x, dz = tz - m.position.z, d = Math.hypot(dx, dz);
      if (d < .3) { W.i = (W.i + 1) % W.R.length; continue; } const v = Math.min(d, W.v * dt);
      { const nx = m.position.x + dx / d * Math.max(v, .6), nz = m.position.z + dz / d * Math.max(v, .6);
        const zA = (x, z) => z > 30.2 && z < 38.2 && ((x > -14.2 && x < -10.8) || (x > 8.8 && x < 12.2)), zB = (x, z) => (x > PP[0] && x < PP[1] && ((z > 25.6 && z < 30.0) || (z > 38.7 && z < 41.7))) || (z > -30.5 && z < -27.6 && ((x > -10.2 && x < -7.4) || (x > 5.4 && x < 8.2)));
        const bloque = (FEUX.pA !== "vert" && zA(nx, nz) && !zA(m.position.x, m.position.z)) || (FEUX.pB !== "vert" && zB(nx, nz) && !zB(m.position.x, m.position.z));
        if (bloque) { if (!c || (m.position.x - c.x) ** 2 + (m.position.z - c.z) ** 2 < R2) m.userData.poser("debout", tm); continue; } }   /* (le petit bonhomme est rouge : on attend) */
      m.position.x += dx / d * v; m.position.z += dz / d * v; contourne(m.position, tx, tz, v); m.position.y = L.hauteur(m.position.x, m.position.z, { g: m }); m.rotation.y = Math.atan2(dx, dz);
      if (!c || (m.position.x - c.x) ** 2 + (m.position.z - c.z) ** 2 < R2) m.userData.poser("marche", tm * W.v / 1.2); } catch (e) {} };
  // le soir : la cathédrale illuminée par des projecteurs, les quais à la lueur des réverbères
  { /* (10.154) la mise en lumière, comme sur les photos de nuit : des projecteurs au pied de la façade, dorés, qui l'éclairent en rasant de bas en haut (les reliefs, les ombres des portails,
       plus forts en bas, qui s'estompent vers le haut des tours) ; un projecteur plus doux depuis le pont ; une lueur chaude dans les baies des tours */
    const SP = [], spot = (x, y, z, tx, ty, tz, c, i, an, d) => { const s = new THREE.SpotLight(c, 0, d, an, .55, 1.4); s.position.set(x, y, z); s.target.position.set(tx, ty, tz); scene.add(s); scene.add(s.target); SP.push([s, i]); };
    for (const dx of [-17, -6, 6, 17]) spot(FAC.x + dx, .4, FAC.z + 3.2, FAC.x + dx * .9, 40, FAC.z + .5, 0xffb060, 900, .38, 70);
    spot(FAC.x, 3, -30, FAC.x, 32, FAC.z, 0xffd8a0, 380, .42, 120);
    for (const sx of [-1, 1]) spot(FAC.x + sx * 30, 1, FAC.z + 10, FAC.x + sx * 8, 25, FAC.z, 0xffa850, 300, .45, 60);
    NUIT.push([{ set emissiveIntensity(v) { for (const [s, i] of SP) { s.intensity = v * i; s.visible = v > .5; } } }, 0, 1]); for (const [s] of SP) s.visible = false; }

  /* ---------- (10.146) au loin, pour fermer la vue : la Seine qui continue et ses quais, un pont de pierre à chaque bout, les immeubles parisiens qui se prolongent ;
     derrière, les toits de Paris en plusieurs plans ; au sud, le dôme du Panthéon ; au nord, la tour Saint-Jacques ---------- */
  { const facL = [0, 1, 2].map(k => { const dess = (lit) => (c, w, h) => { const base = ["#dccaa6", "#d6c39e", "#e2d2b2"][k]; c.fillStyle = lit ? "#000" : base; c.fillRect(0, 0, w, h);
        for (let r = 0; r < 7; r++) { const y = 8 + r * 34; if (!lit) { c.fillStyle = "rgba(120,104,80,.35)"; c.fillRect(0, y + 28, w, 2); } for (let i = 0; i < 4; i++) { const x = 10 + i * 62;
          if (r === 6) { if (!lit) { c.fillStyle = "#2a2622"; c.fillRect(x - 4, y, 54, 30); c.fillStyle = ["#8a1c1c", "#2a4a38", "#3a3a5a"][(i + k) % 3]; c.fillRect(x - 6, y - 4, 58, 7); } else if ((i + k) % 2) { c.fillStyle = "#ffcf80"; c.fillRect(x - 2, y + 4, 50, 24); } continue; }
          if (lit) { if ((r * 7 + i * 3 + k) % 5 === 0) { c.fillStyle = "#ffd890"; c.fillRect(x + 8, y + 2, 26, 22); } continue; }
          c.fillStyle = "#e8e0cc"; c.fillRect(x + 6, y, 30, 26); c.fillStyle = "#3a4654"; c.fillRect(x + 9, y + 2, 24, 22); c.fillStyle = "#e8e0cc"; c.fillRect(x + 20, y + 2, 2, 22);
          if (r === 1 || r === 4) { c.fillStyle = "#1a1a1a"; c.fillRect(0, y + 18, w, 2); for (let b = 0; b < w; b += 4) c.fillRect(b, y + 18, 1, 8); } } } };
        const t = tT(256, 256, dess(false), 1, 1), te = tT(256, 256, dess(true), 1, 1); const m = mat({ map: t, roughness: .9, emissive: 0xffffff, emissiveMap: te, emissiveIntensity: 0 }); NUIT.push([m, 0, .9]); return m; });
    const zincL = mat({ color: 0x7e8894, roughness: .5, metalness: .3 }), briqL = mat({ color: 0xa65a3e, roughness: .9 }), murC = mat({ color: 0xcfbf9e, roughness: .95 });
    const loin = (x, z, rot, W, H, k = 0) => { const T = new THREE.Matrix4().makeRotationY(rot).setPosition(x, 0, z), D = 12;
      const g = new THREE.BoxGeometry(W, H, D), uv = g.attributes.uv; for (let f = 0; f < 6; f++) for (let v = 0; v < 4; v++) { const i = f * 4 + v; if (f === 4 || f === 5) uv.setXY(i, uv.getX(i) * W / 15.6, uv.getY(i)); else uv.setXY(i, 0.02, 0.5); }
      const o = new THREE.Mesh(g, [murC, murC, murC, murC, facL[k % 3], murC]); o.position.set(0, H / 2, -D / 2); o.applyMatrix4(T); scene.add(o);
      const t = new THREE.Shape(); t.moveTo(0, 0); t.lineTo(D, 0); t.lineTo(D - 1.2, 3.2); t.lineTo(D / 2, 4.4); t.lineTo(1.2, 3.2); t.closePath(); const rg = new THREE.ExtrudeGeometry(t, { depth: W, bevelEnabled: false }); rg.rotateY(Math.PI / 2); rg.translate(-W / 2, H, 0);
      const r = new THREE.Mesh(rg, zincL); r.applyMatrix4(T); scene.add(r);
      for (const cx of [-W / 2 + .8, W / 2 - .8]) { const c = new THREE.Mesh(new THREE.BoxGeometry(1, 2.4, 2.6), briqL); c.position.set(cx, H + 3.6, -D / 2); c.applyMatrix4(T); scene.add(c); } };
    const rang = (x0, x1, z, rot, H0, saut) => { let k = 0; for (let x = x0; x < x1;) { const W = 16 + ((k * 7) % 4) * 3; if (!saut || !saut(x + W / 2)) loin(x + W / 2, z, rot, W, H0 + ((k * 5) % 3) * 2.2, k); x += W; k++; } };
    // la Seine, les bas-ports, les murs et les parapets, les quais, au-delà des deux bouts
    for (const [a, b] of [[-330, -XS], [XS, 330]]) { const cx = (a + b) / 2, L2 = b - a;
      sol(a, b, -18, 18, eauM, YE);
      for (const s of [1, -1]) { sol(a, b, s > 0 ? 18 : -22.5, s > 0 ? 22.5 : -18, paveB, YB); box(L2, YB - YE + .2, .6, murM, cx, (YB + YE) / 2, s * 18); box(L2, -YB, 2.8, murM, cx, YB / 2, s * 23.9); box(L2, 1, .55, quaiM, cx, .5, s * 25.3); box(L2, .12, .8, quaiM, cx, 1.06, s * 25.3); }
      sol(a, b, 25.6, 46, paveM, .02); sol(a, b, -32, -25.6, trottM, .02); sol(a, b, 46, 300, paveM, .005); sol(a, b, -300, -32, paveM, .005);
      for (let x = a + 6; x < b; x += 18) platane(x, 29.3, 1); }
    // un pont de pierre à chaque bout (le pont Saint-Michel à l'ouest, le pont de l'Archevêché à l'est)
    for (const xp of [-212, 214]) { const W = 18, a = new THREE.Shape(); a.moveTo(-25.6, 0); a.lineTo(25.6, 0); a.lineTo(25.6, YE - .2);
      for (const [c, r, s0, rv] of [[12.7, 4.3, -5.0, 3.6], [0, 7, -5.2, 4.3], [-12.7, 4.3, -5.0, 3.6]]) { a.lineTo(c + r, YE - .2); a.lineTo(c + r, s0); a.absellipse(c, s0, r, rv, 0, Math.PI, false); a.lineTo(c - r, YE - .2); } a.lineTo(-25.6, YE - .2); a.closePath();
      const ag = new THREE.ExtrudeGeometry(a, { depth: W, bevelEnabled: false, curveSegments: 14 }); { const uv = ag.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / TUILE, uv.getY(i) / TUILE); } ag.rotateY(Math.PI / 2); add(ag, murM, xp - W / 2, 0, 0);
      sol(xp - W / 2, xp + W / 2, -25.6, 25.6, routeM, .03); for (const sx of [xp - W / 2 + .2, xp + W / 2 - .2]) { box(.4, .12, 51.2, quaiM, sx, .06, 0); box(.44, .14, 51.2, quaiM, sx, .93, 0); for (let z = -25; z <= 25; z += .5) box(.12, .8, .12, quaiM, sx, .5, z); for (const z of [-7.7, 7.7]) reverbere(sx + (sx > xp ? 1 : -1) * .6, z); } }
    // les immeubles qui prolongent les quais
    rang(-330, -XS - 4, 46, Math.PI, 20); rang(XS + 4, 330, 46, Math.PI, 20); rang(-330, -XS - 4, -32, 0, 20); rang(XS + 4, 330, -32, 0, 20);
    // les toits de Paris derrière, en plusieurs plans : rive gauche, l'île, rive droite
    const rue = (x) => x > PP[0] - 6 && x < PP[1] + 6;
    for (const [z, H] of [[86, 24], [122, 27], [160, 29], [205, 31]]) rang(-320, 320, z, Math.PI, H, z < 140 ? rue : null);
    for (const [z, H] of [[-62, 22], [-100, 23], [-140, 24], [-180, 24], [-222, 25]]) { rang(-320, z === -62 || z === -100 ? -90 : -52, z, 0, H); rang(50, 320, z, 0, H); }
    for (const z of [-141, -158, -175, -192, -209]) { loin(-36, z, Math.PI / 2, 17, 22, (z / 17) | 0); loin(34, z, -Math.PI / 2, 17, 22, ((z / 17) | 0) + 1); }
    for (const [z, H] of [[-262, 27], [-300, 30]]) rang(-320, 320, z, 0, H);
    // le Panthéon, au sud : le péristyle, le tambour et sa colonnade, le dôme, la lanterne
    { const pp = mat({ color: 0xe2d6bc, roughness: .9 }), pd = mat({ color: 0x9aa4ae, roughness: .5, metalness: .3 }), X = -30, Z = 262;
      box(60, 26, 50, pp, X, 13, Z); box(34, 22, 10, pp, X, 11, Z - 30); const fr = new THREE.Shape(); fr.moveTo(-17, 0); fr.lineTo(17, 0); fr.lineTo(0, 7); fr.closePath(); add(new THREE.ExtrudeGeometry(fr, { depth: 2, bevelEnabled: false }), pp, X, 22, Z - 36);
      for (let i = 0; i < 6; i++) cyl(.9, .9, 20, pp, X - 15 + i * 6, 11, Z - 35, 10);
      cyl(15, 15, 6, pp, X, 29, Z, 32); cyl(12, 12, 16, pp, X, 40, Z, 32); for (let i = 0; i < 32; i++) { const a = i / 32 * Math.PI * 2; cyl(.55, .55, 14, pp, X + Math.cos(a) * 13.4, 40, Z + Math.sin(a) * 13.4, 8); }
      box(30, 1.2, 30, pp, X, 48.5, Z); const d = add(new THREE.SphereGeometry(11.5, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), pd, X, 49, Z); d.scale.y = 1.25; cyl(2, 2.6, 6, pp, X, 66, Z, 12); cyl(.1, 1.6, 5, pd, X, 71, Z, 10); }
    // la tour Saint-Jacques, au nord : la tour gothique, ses contreforts, ses pinacles
    { const ts = mat({ color: 0xd8ccb2, roughness: .9 }), X = -95, Z = -278; box(10, 52, 10, ts, X, 26, Z); for (const [dx, dz] of [[-5, -5], [5, -5], [-5, 5], [5, 5]]) { box(1.6, 50, 1.6, ts, X + dx, 25, Z + dz); cyl(.05, .9, 5, ts, X + dx, 54, Z + dz, 4); }
      for (let y = 6; y < 48; y += 9) for (const s of [-1, 1]) { box(2.4, 6, .3, mat({ color: 0x3a3630 }), X - 2.2, y, Z + s * 5.05); box(2.4, 6, .3, mat({ color: 0x3a3630 }), X + 2.2, y, Z + s * 5.05); }
      box(11, 1.2, 11, ts, X, 52.6, Z); }
    // (on voit plus loin : la brume s'écarte, sur cette carte)
    const a12 = L.anim; L.anim = (tm) => { try { a12 && a12(tm); } catch (e) {} if (M && M.L === L && scene.fog && scene.fog.far < 290) { scene.fog.near = 120; scene.fog.far = 295; } }; }
  /* (10.147) le jour, ici, c'est la fin d'après-midi (d'après la photo) : le ciel bleu qui passe au rose puis à l'orange vers l'horizon, les nuages roses, les traînées d'avion ;
     le soleil bas et doré qui chauffe les façades ; la brume rosée au loin ; la Seine qui prend les reflets du couchant */
  { const cielT = tT(1024, 512, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#3a6ab0"); g.addColorStop(.18, "#5a8ac8"); g.addColorStop(.32, "#8aa8d8"); g.addColorStop(.40, "#d8b0c4"); g.addColorStop(.45, "#f2b090"); g.addColorStop(.49, "#f8a868"); g.addColorStop(.5, "#ffd59a"); g.addColorStop(1, "#e8b890"); c.fillStyle = g; c.fillRect(0, 0, w, h);
      for (let i = 0; i < 90; i++) { const x = al() * w, y = h * (.33 + al() * .15), rw = 30 + al() * 110, rh = 3 + al() * 8; for (const dx of [-w, 0, w]) { const gg = c.createRadialGradient(x + dx, y, 1, x + dx, y, rw); gg.addColorStop(0, `rgba(255,${210 + (al() * 30) | 0},${200 + (al() * 30) | 0},${.18 + al() * .22})`); gg.addColorStop(1, "rgba(255,220,210,0)"); c.fillStyle = gg; c.beginPath(); c.ellipse(x + dx, y, rw, rh, 0, 0, 7); c.fill(); } } });   /* (10.157 : un vrai ciel tout autour, accroché au monde — l'orangé à l'horizon, le bleu au zénith ; plus de traînées d'avion) */
    cielT.mapping = THREE.EquirectangularReflectionMapping;
    const cielC = new THREE.Color(0xf0b892), lum = { s: null, h: null }; let jourV = null;
    const a13 = L.anim; L.anim = (tm) => { try { a13 && a13(tm); } catch (e) {} if (!M || M.L !== L) return; const n = !!L.nuit;
      if (!lum.s) for (const o of scene.children) { if (o.isDirectionalLight && !lum.s) lum.s = o; if (o.isHemisphereLight && !lum.h) lum.h = o; }
      if (!n) { if (scene.background !== cielT) scene.background = cielT; if (scene.fog) scene.fog.color.copy(cielC);
        if (lum.s) { lum.s.color.setHex(0xffb878); lum.s.intensity = 2.4; lum.s.position.set(-46, 20, 26); } if (lum.h) { lum.h.color.setHex(0xffd8c0); lum.h.groundColor.setHex(0x7a5a5a); lum.h.intensity = 1.05; } }
      if (n) { if (!lum.nuitT) { lum.nuitT = tT(2048, 1024, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#040814"); g.addColorStop(.42, "#0e1a3a"); g.addColorStop(.5, "#1e2a4e"); g.addColorStop(1, "#141a2a"); c.fillStyle = g; c.fillRect(0, 0, w, h);
          for (let i = 0; i < 900; i++) { const x = al() * w, y = Math.pow(al(), 1.3) * h * .47, b = al(), r = b < .06 ? 2.2 : b < .25 ? 1.3 : .7;   /* (des points brillants, avec leur petit halo) */
            const gg = c.createRadialGradient(x, y, 0, x, y, r * 3); gg.addColorStop(0, `rgba(255,255,${235 + (al() * 20) | 0},1)`); gg.addColorStop(.35, `rgba(220,230,255,${.35 + b * .3})`); gg.addColorStop(1, "rgba(200,210,255,0)"); c.fillStyle = gg; c.fillRect(x - r * 3, y - r * 3, r * 6, r * 6); } }); lum.nuitT.mapping = THREE.EquirectangularReflectionMapping; }
        if (scene.background !== lum.nuitT) scene.background = lum.nuitT;
        if (!lum.spr) { lum.spr = scene.children.filter(s => s.isSprite); lum.lune = lum.spr.find(s => Math.abs(s.position.x - 23.5) < .1 && Math.abs(s.position.y - 29) < .1); }
        for (const s of lum.spr) if (s !== lum.lune) s.visible = false;   /* (10.160 : la nuit, plus de nuages en carrés flous) */
        if (lum.lune) { lum.lune.position.set(-110, 95, 170); lum.lune.scale.set(44, 44, 1); lum.lune.material.fog = false; lum.lune.renderOrder = -1; } }   /* (la lune, loin dans le ciel, derrière la rive gauche ; plus devant la cathédrale) */
      else if (lum.spr) for (const s of lum.spr) if (s !== lum.lune) s.visible = true;   /* (10.160 : les étoiles restent à leur place dans le ciel) */
      if (n !== jourV) { jourV = n; if (!n) { EAU.u.ciel.value.setHex(0xe8b8a4); EAU.u.soleil.value.set(-.8, .3, .4).normalize(); EAU.u.clair.value.setHex(0x6a7468); } } }; }
  /* (10.158) les cloches de Notre-Dame, à l'heure vraie : à chaque demi-heure, un coup ; à l'heure pleine, autant de coups que l'heure ; le bourdon grave, qui résonne longtemps */
  { let ac = null, der = -1; const cloche = (t0, f) => { const g = ac.createGain(); g.connect(ac.destination); const v = .22 * (M.volumeGeneral ?? 1); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(v, t0 + .01); g.gain.exponentialRampToValueAtTime(.0005, t0 + 6.5);
      for (const [k, a] of [[.5, .5], [1, 1], [1.19, .55], [1.5, .35], [2, .45], [2.51, .2], [2.66, .15], [3.01, .12], [4.17, .06]]) { const o = ac.createOscillator(), og = ac.createGain(); o.type = "sine"; o.frequency.value = f * k; og.gain.value = a; o.connect(og).connect(g); o.start(t0); o.stop(t0 + 7); } };
    const a16 = L.anim; L.anim = (tm) => { try { a16 && a16(tm); } catch (e) {} if (!M || M.L !== L || M.cine || document.hidden) return; const d = new Date(), cle = d.getHours() * 2 + (d.getMinutes() >= 30 ? 1 : 0);
      if (der < 0) { der = cle; return; } if (cle === der || d.getSeconds() > 20) { der = cle; return; } der = cle;
      try { if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === "suspended") ac.resume().catch(() => {}); const n = d.getMinutes() < 30 ? ((d.getHours() + 11) % 12) + 1 : 1; for (let i = 0; i < n; i++) cloche(ac.currentTime + .2 + i * 2.6, 110); } catch (e) {} }; }
  /* (10.146) la musique du quartier, en continu, pas trop fort : la valse d'Amélie ; coupée quand on quitte la carte */
  { const a11 = L.anim; L.anim = (tm) => { try { a11 && a11(tm); } catch (e) {} if (!M || M.L !== L) return; const A2 = (window.__valseND = window.__valseND || (() => { const PL = ["sons/notredame-valse.mp3?v=3", "sons/notredame-2.mp3?v=1", "sons/notredame-3.mp3?v=1", "sons/notredame-4.mp3?v=1"], au = Object.assign(new Audio(PL[0]), { loop: false, preload: "auto" }); au._k = 0;   /* (10.160 : les quatre morceaux, l'un après l'autre, puis on recommence) */
        au.addEventListener("ended", () => { au._k = (au._k + 1) % PL.length; au.src = PL[au._k]; au.play().catch(() => {}); }); return au; })());   /* (10.151 : comme l'accordéon de Montmartre — si le navigateur bloque le son, il part au premier toucher) */
      if (window.mxArcadeOn) { if (!A2.paused) A2.pause(); return; }
      if (A2.paused && !A2._essai && !A2._attente) { A2._essai = true; A2.volume = 0; A2.play().then(() => { A2._essai = false; }).catch(() => { A2._essai = false; A2._attente = true; }); }
      if (A2._attente && !A2._ecoute) { A2._ecoute = true; const go = () => { A2._attente = false; A2._ecoute = false; if (M && M.L === L) A2.play().catch(() => {}); removeEventListener("pointerdown", go); removeEventListener("keydown", go); }; addEventListener("pointerdown", go); addEventListener("keydown", go); }
      if (!A2.paused) try { const cv = window.__ndDuck ?? .35; A2.volume = Math.max(0, Math.min(1, A2.volume + Math.max(-.01, Math.min(.006, cv - A2.volume)))); } catch (e) {} };
    quitterLieu.add(() => { const A2 = window.__valseND; if (A2) { A2.pause(); try { A2.currentTime = 0; } catch (e) {} } }); }
  // (10.146) ce que le doigt touche pour aller quelque part : le quai, l'île et le parvis, le pont, les deux bas-ports (des sols invisibles, à chaque niveau)
  { const inv = new THREE.MeshBasicMaterial({ visible: false }), pl = (x0, x1, z0, z1, y) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), inv); m.rotation.x = -Math.PI / 2; m.position.set((x0 + x1) / 2, y, (z0 + z1) / 2); scene.add(m); m.updateMatrixWorld(true); return m; };
    L.sol = pl(-XS, XS, 22.5, 140, .02); L.solsPlus = [pl(-XS, XS, -232, -22.5, .02), pl(PP[0], PP[1], -22.5, 22.5, .03), pl(-XS, XS, 18, 22.5, YB + .02), pl(-XS, XS, -22.5, -18, YB + .02)]; }
  /* (10.160, d'après les photos de nuit) les quais tout illuminés : les projecteurs qui lèchent les murs des quais de lumière dorée, les lanternes du bas-port,
     les arches du pont éclairées par-dessous, et sur la Seine les longs reflets dorés qui tremblent */
  { const lueurT = tT(128, 128, (c, w, h) => { const g = c.createRadialGradient(w / 2, h, 4, w / 2, h, h); g.addColorStop(0, "rgba(255,200,110,.95)"); g.addColorStop(.5, "rgba(255,170,70,.35)"); g.addColorStop(1, "rgba(255,150,50,0)"); c.fillStyle = g; c.fillRect(0, 0, w, h); });
    const refT = tT(32, 256, (c, w, h) => { for (let y = 0; y < h; y += 3) { const a2 = (1 - y / h) * .8 * (.4 + Math.random() * .6); c.fillStyle = `rgba(255,${190 + (Math.random() * 40) | 0},110,${a2})`; const ww = w * (.3 + Math.random() * .7); c.fillRect((w - ww) / 2, y, ww, 2); } });
    const lM = new THREE.MeshBasicMaterial({ map: lueurT, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }), rM = new THREE.MeshBasicMaterial({ map: refT, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }), lanM = mat({ color: 0xfff0c8, emissive: 0xffd080, emissiveIntensity: 1.5 }), fon = mat({ color: 0x1a1a1a, metalness: .6, roughness: .4 });
    const QN = []; for (const s of [1, -1]) for (let x = -XS + 6; x < XS - 4; x += 12) { if (Math.abs(x) < 14) continue; const zw = s * 22.45;
      const p = new THREE.Mesh(new THREE.PlaneGeometry(7, 5.2), lM); p.position.set(x, YB + 2.6, zw - s * .02); p.rotation.y = s > 0 ? Math.PI : 0; scene.add(p); QN.push(p);
      const lan = new THREE.Mesh(new THREE.BoxGeometry(.22, .3, .18), lanM); lan.position.set(x, YB + 2.2, zw - s * .12); scene.add(lan); const br = new THREE.Mesh(new THREE.BoxGeometry(.06, .06, .3), fon); br.position.set(x, YB + 2.4, zw - s * .05); scene.add(br); QN.push(lan);
      const r = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 10), rM); r.rotation.x = -Math.PI / 2; r.rotation.z = s > 0 ? 0 : Math.PI; r.position.set(x, YE + .06, s * 13); scene.add(r); QN.push(r); }
    for (const zc of [-12.7, 0, 12.7]) { const u = new THREE.Mesh(new THREE.PlaneGeometry(PP[1] - PP[0], zc ? 8 : 13), lM); u.rotation.x = Math.PI / 2; u.position.set((PP[0] + PP[1]) / 2, zc ? -1.6 : -1.1, zc); scene.add(u); QN.push(u);
      for (const s of [-1, 1]) { const r = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 8), rM); r.rotation.x = -Math.PI / 2; r.position.set(PP[0] + (s > 0 ? 18 : -2), YE + .07, zc); scene.add(r); QN.push(r); } }
    for (const o of QN) o.visible = false; let nQ = null; AMB.push(() => { const n = !!L.nuit; if (n !== nQ) { nQ = n; for (const o of QN) o.visible = n; } }); }
  /* ---------- (10.162) monter en haut des tours : l'escalier en colimaçon, le beffroi et le bourdon Emmanuel, puis la plate-forme de la tour sud, au milieu des chimères, avec tout Paris autour ---------- */
  { const moiT = () => M && M.moiNum && M.gens.get(M.moiNum), PY = 63.4, PX0 = 6.3, PX1 = 18.5, PZ0 = -82.2, PZ1 = -71, PCX = 12.4, PCZ = -76.6;
    const voileT = (on, txt) => { let v = M.voileTours; if (!v) { v = document.createElement("div"); v.style.cssText = "position:absolute;inset:0;z-index:55;background:#000;opacity:0;transition:opacity .8s;display:flex;align-items:center;justify-content:center;color:#f2e6c8;font:italic 22px Georgia,serif;text-align:center;pointer-events:none"; (M.ctx.conteneur || document.body).appendChild(v); M.voileTours = v; } v.textContent = txt || ""; requestAnimationFrame(() => { v.style.opacity = on ? "1" : "0"; }); };
    quitterLieu.add(() => { if (M && M.voileTours) { M.voileTours.remove(); M.voileTours = null; } L.enHaut = false; L.loin = 0; });
    // le parapet de pierre autour de la plate-forme ; deux longues-vues ; des visiteurs qui regardent la ville
    { const pierreH = mat({ color: 0xd8cfb8, roughness: .85 }), fonteH = mat({ color: 0x2a3a30, metalness: .5, roughness: .4 });
      for (const [w, d, x, z] of [[PX1 - PX0 + 1, .4, PCX, PZ0 - .3], [PX1 - PX0 + 1, .4, PCX, PZ1 + .3], [.4, PZ1 - PZ0 + 1, PX0 - .3, PCZ], [.4, PZ1 - PZ0 + 1, PX1 + .3, PCZ]]) { box(w, 1.05, d, pierreH, x, PY + .52, z); box(w + .1, .1, d + .15, pierreH, x, PY + 1.08, z); }
      for (const [x, z, ry] of [[PX0 + .8, PZ1 - .6, Math.PI * .1], [PX1 - .8, PZ0 + .6, Math.PI * .8]]) { cyl(.05, .07, 1.1, fonteH, x, PY + .55, z, 8); const lv = add(new THREE.CylinderGeometry(.06, .09, .55, 10), fonteH, x, PY + 1.2, z, ry); lv.rotation.z = Math.PI / 2 - .2; }
      for (let k = 0; k < 3; k++) { const m = personne3D({ taille: 1.7, peau: PE[(k + 4) % 6], ch: ["#2a1a12", "#e2c27a", "#5a3a22"][k], haut: ["#c83a2a", "#2a5aa8", "#3a6a3a"][k], bas: "#2a2a30", chaussures: "#1a1a1a", coif: k % 2 ? "long" : "court", pantalon: k !== 1, robe: k === 1 }); m.position.set([PX0 + 1.2, PCX + 2, PX1 - 1.4][k], PY, [PZ1 - 1, PZ1 - .9, PCZ][k]); m.rotation.y = [0, .3, Math.PI / 2][k]; m.userData.poser("debout", 0); m.userData.anime = true; scene.add(m); const P = m.userData.parts; if (k === 0) { P.bras[1].e.rotation.x = -1.6; P.bras[1].c.rotation.x = -1.1; } } }
    // l'intérieur de la tour, à l'écart (on n'y passe qu'en cinématique) : l'escalier en colimaçon dans sa cage de pierre, puis le beffroi et le bourdon
    const TX = 0, TY = -140, TZ = 600, TOUR = new THREE.Group(); TOUR.position.set(TX, TY, TZ); TOUR.visible = false; scene.add(TOUR);
    { const pierreI = mat({ map: tT(128, 128, (c, w, h) => { c.fillStyle = "#b8ad96"; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 16) for (let x = ((y / 16) % 2) * 16; x < w; x += 32) { c.fillStyle = `rgba(${al() < .5 ? "90,80,60" : "230,220,200"},${al() * .2})`; c.fillRect(x + 1, y + 1, 30, 14); c.fillStyle = "rgba(60,50,40,.5)"; c.fillRect(x, y, 32, 1.5); c.fillRect(x, y, 1.5, 16); } }, 4, 12), roughness: .95, side: THREE.BackSide }), marche = mat({ color: 0x9a9080, roughness: .9 }), boisB = mat({ color: 0x5a3a20, roughness: .8 });
      const T = (geo, m, x, y, z, ry = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.y = ry; TOUR.add(o); return o; };
      T(new THREE.CylinderGeometry(1.7, 1.7, 24, 20, 1, true), pierreI, 0, 12, 0); T(new THREE.CylinderGeometry(.28, .28, 24, 12), marche, 0, 12, 0);
      for (let i = 0; i < 120; i++) { const st = T(new THREE.BoxGeometry(1.45, .08, .55), marche, 0, i * .2, 0, -i * .35); st.geometry.translate(.85, 0, 0); }
      for (let k = 0; k < 6; k++) { const l = new THREE.Mesh(new THREE.PlaneGeometry(.2, .9), new THREE.MeshBasicMaterial({ color: 0xfff2d0 })); const a = k * 1.9; l.position.set(Math.cos(a) * 1.68, 3 + k * 3.6, Math.sin(a) * 1.68); l.lookAt(0, l.position.y, 0); TOUR.add(l); }   // (les meurtrières, qui laissent passer le jour)
      const lumE = new THREE.PointLight(0xffe2b0, 30, 12, 1.5); lumE.position.set(0, 12, 0); TOUR.add(lumE); const lumE2 = new THREE.PointLight(0xffe2b0, 30, 12, 1.5); lumE2.position.set(0, 22, 0); TOUR.add(lumE2);
      // le beffroi : la salle de charpente, ses abat-sons, et le grand bourdon de bronze
      const B0 = 24; T(new THREE.BoxGeometry(9, 12, 9), mat({ map: pierreI.map, roughness: .95, side: THREE.BackSide }), 0, B0 + 6, 0);
      for (const [x, z] of [[-3.5, -3.5], [3.5, -3.5], [-3.5, 3.5], [3.5, 3.5]]) T(new THREE.BoxGeometry(.4, 11, .4), boisB, x, B0 + 5.5, z); for (const y of [B0 + 7.5, B0 + 10.5]) { T(new THREE.BoxGeometry(7.4, .35, .35), boisB, 0, y, -3.5); T(new THREE.BoxGeometry(7.4, .35, .35), boisB, 0, y, 3.5); T(new THREE.BoxGeometry(.35, .35, 7.4), boisB, -3.5, y, 0); T(new THREE.BoxGeometry(.35, .35, 7.4), boisB, 3.5, y, 0); }
      for (const s of [-1, 1]) { const d = T(new THREE.BoxGeometry(.3, .3, 9), boisB, s * 2, B0 + 7, 0); d.rotation.x = s * .5; }
      for (const [x, z, ry] of [[0, -4.45, 0], [0, 4.45, Math.PI], [-4.45, 0, Math.PI / 2], [4.45, 0, -Math.PI / 2]]) for (let i = 0; i < 9; i++) { const lm = T(new THREE.BoxGeometry(2.6, .1, .5), boisB, x, B0 + 3 + i * .7, z, ry); lm.rotation.x = .6; const jour = new THREE.Mesh(new THREE.PlaneGeometry(2.4, .2), new THREE.MeshBasicMaterial({ color: 0xfff0d0 })); jour.position.set(x * .995, B0 + 3.2 + i * .7, z * .995); jour.rotation.y = ry; TOUR.add(jour); }
      const bronzeB = mat({ color: 0x8a6a3a, metalness: .75, roughness: .35, side: THREE.DoubleSide }), CL = new THREE.Group(); CL.position.set(0, B0 + 8, 0); TOUR.add(CL);
      CL.add(new THREE.Mesh(new THREE.LatheGeometry([[.05, 0], [.6, -.05], [.85, -.3], [.95, -.9], [1.05, -1.6], [1.3, -2.2], [1.55, -2.45], [1.6, -2.55], [1.45, -2.5]].map(([x, y]) => new THREE.Vector2(x, y)), 32), bronzeB));
      for (const y of [-.5, -1.9]) { const r = new THREE.Mesh(new THREE.TorusGeometry(y > -1 ? .9 : 1.25, .03, 6, 32), bronzeB); r.rotation.x = Math.PI / 2; r.position.y = y; CL.add(r); }
      const bat = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, 2.1, 8), mat({ color: 0x3a3a3a, metalness: .6 })); bat.position.y = -1.1; CL.add(bat); const boule = new THREE.Mesh(new THREE.SphereGeometry(.2, 12, 10), bat.material); boule.position.y = -2.2; CL.add(boule);
      T(new THREE.BoxGeometry(7, .5, .6), boisB, 0, B0 + 8.3, 0); const lumB = new THREE.PointLight(0xffd8a0, 50, 16, 1.4); lumB.position.set(2, B0 + 6, 2); TOUR.add(lumB);
      TOUR.userData.cloche = CL; }
    // le son du bourdon (fabriqué : la note grave, ses partiels)
    let acB = null; const bourdon = () => { try { if (!acB) acB = new (window.AudioContext || window.webkitAudioContext)(); if (acB.state === "suspended") acB.resume(); const t0 = acB.currentTime + .05, g = acB.createGain(); g.connect(acB.destination); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(.35 * (M.volumeGeneral ?? 1), t0 + .02); g.gain.exponentialRampToValueAtTime(.0005, t0 + 9);
        for (const [k, a] of [[.5, .6], [1, 1], [1.19, .5], [1.5, .3], [2, .4], [2.51, .2], [3.01, .1]]) { const o = acB.createOscillator(), og = acB.createGain(); o.frequency.value = 73 * k; og.gain.value = a; o.connect(og).connect(g); o.start(t0); o.stop(t0 + 9.5); } } catch (e) {} };
    const finir = (p, x, z, haut) => { finCine(); TOUR.visible = false; p.g.visible = true; L.enHaut = haut; L.loin = haut ? 1300 : 0; if (M && M.camera) { M.camera.far = Math.min(L.loin || 300, M.camera.far <= 140 && !haut ? 140 : 1e9); M.camera.updateProjectionMatrix(); } L.grille = L.grilleAdmin = null; p.g.position.set(x, haut ? PY : 0, z); p.cible = null; p.chemin = []; try { envoyerWS({ t: "aller", x, z }); } catch (e) {} placerCamera(true); };
    let enCours = false;
    const monter = () => { const p = moiT(); if (!p || enCours) return; enCours = true; voileT(true, "L'escalier de la tour sud… 422 marches");
      setTimeout(() => { p.g.visible = false; TOUR.visible = true; const t0 = performance.now(), DUR = 16000; let sonne = false;
        M.cine = { gel: true, fov: [64, 72], maj: () => { const u = Math.min(1, (performance.now() - t0) / DUR), c = M.camera, base = new THREE.Vector3(TX, TY, TZ);
          if (u < .55) { const v = u / .55, a = -v * 120 * .35 + .3, y = v * 23 + 1.6; c.position.set(TX + Math.cos(a) * .95, TY + y, TZ - Math.sin(a) * .95); const a2 = a - .5; c.lookAt(TX + Math.cos(a2) * .9, TY + y + .6, TZ - Math.sin(a2) * .9); if (v > .05) voileT(false); }
          else { const v = (u - .55) / .45, an = v * 1.2 - .6; c.position.set(TX + Math.cos(an) * 3.6, TY + 24 + 4.2 + v * 1.5, TZ + Math.sin(an) * 3.6); c.lookAt(base.x, TY + 24 + 7, base.z); if (!sonne && v > .25) { sonne = true; bourdon(); } const CL = TOUR.userData.cloche; CL.rotation.z = sonne ? Math.sin((performance.now() - t0) / 700) * .25 * Math.max(0, 1 - (v - .25)) : 0; }
          if (u >= 1 && !M.voileTours.dataset.fin) { M.voileTours.dataset.fin = 1; voileT(true, "La galerie des chimères, au sommet de Notre-Dame"); setTimeout(() => { delete M.voileTours.dataset.fin; finir(p, PCX - 2, PZ1 - 1.5, true); enCours = false; voileT(false); }, 1500); } } }; }, 900); };
    const descendre = () => { const p = moiT(); if (!p || enCours) return; enCours = true; voileT(true, "On redescend les 422 marches…"); setTimeout(() => { finir(p, PCX, -66.6, false); enCours = false; voileT(false); }, 1500); };
    const a15 = L.actionLieu; L.actionLieu = (x, z, moi) => { if (L.enHaut) return { type: "lieu", id: "descendre", label: "⬇️ Redescendre des tours", faire: descendre }; const r = a15 && a15(x, z, moi); if (r) return r; return Math.hypot(x - PCX, z - (-67.4)) < 2.2 ? { type: "lieu", id: "tours", label: "🗼 Monter en haut des tours", faire: monter } : null; };
    const h0 = L.hauteur; L.hauteur = (x, z, p) => L.enHaut && x > PX0 - 1 && x < PX1 + 1 && z > PZ0 - 1 && z < PZ1 + 1 ? PY : h0(x, z, p);
    const l0 = L.limites; L.limites = (x, z) => { if (L.enHaut) return x > PX0 && x < PX1 && z > PZ0 && z < PZ1 && Math.hypot(x - PCX, z - PCZ) > 1.6 && ![[-6, -6], [6, -6], [-6, 6], [6, 6]].some(([dx, dz]) => Math.hypot(x - PCX - dx, z - PCZ - dz) < 1.1); return l0(x, z); };
    { const pk = new THREE.Mesh(new THREE.PlaneGeometry(PX1 - PX0 + 2, PZ1 - PZ0 + 2), new THREE.MeshBasicMaterial({ visible: false })); pk.rotation.x = -Math.PI / 2; pk.position.set(PCX, PY + .01, PCZ); scene.add(pk); pk.updateMatrixWorld(true); (L.solsPlus = L.solsPlus || []).push(pk); }   // (on peut cliquer pour se déplacer, là-haut)
    /* (10.162, d'après les photos prises du haut des tours) au loin, au-delà de la brume : la mer des toits de Paris jusqu'à l'horizon, la tour Eiffel au couchant, la tour Montparnasse,
       les deux tours de Saint-Sulpice, le dôme du Val-de-Grâce, le Sacré-Cœur sur sa butte, et les tours de la Défense ; la tour Eiffel scintille le soir */
    { const HZ = L.horizonMats = [], lointain = (c) => { const m = new THREE.MeshBasicMaterial({ color: c, fog: false }); HZ.push(m); return m; };
      const villeT = tT(2048, 128, (c, w, h) => { c.clearRect(0, 0, w, h); let x = 0; while (x < w) { const bw = 10 + Math.random() * 26, bh = 26 + Math.random() * 46, y = h - bh; c.fillStyle = `rgb(${150 + (Math.random() * 30) | 0},${148 + (Math.random() * 26) | 0},${150 + (Math.random() * 26) | 0})`; c.fillRect(x, y, bw, bh);
          c.fillStyle = "#6a7280"; c.beginPath(); c.moveTo(x - 1, y); c.lineTo(x + 3, y - 7); c.lineTo(x + bw - 3, y - 7); c.lineTo(x + bw + 1, y); c.fill(); for (let i = 0; i < 4; i++) { c.fillStyle = "rgba(60,60,70,.5)"; c.fillRect(x + 3 + Math.random() * (bw - 6), y + 6 + Math.random() * (bh - 12), 2, 3); } x += bw - 2; } }, 6, 1);
      villeT.wrapS = THREE.RepeatWrapping; const villeM = new THREE.MeshBasicMaterial({ map: villeT, transparent: true, alphaTest: .4, fog: false, side: THREE.BackSide, color: 0xd8c8c0 }); HZ.push(villeM);
      const anneau = new THREE.Mesh(new THREE.CylinderGeometry(780, 780, 52, 64, 1, true), villeM); anneau.position.set(0, 10, -60); scene.add(anneau);
      // la tour Eiffel, à l'ouest, vers le couchant
      { const ex = -600, ez = 170, s = .42, eM = lointain(0x8a6a5a), G = new THREE.Group(); G.position.set(ex, 0, ez); G.scale.setScalar(s); scene.add(G);
        // (le profil incurvé de la Dame de fer : 4 faces, larges à la base, effilées vers le sommet)
        const PR = [[62, 0], [46, 30], [34, 57], [26, 80], [17, 115], [11, 160], [7, 210], [4, 260], [2.6, 290], [1.2, 315], [0, 330]], rP = (y) => { for (let k = 1; k < PR.length; k++) if (y <= PR[k][1]) { const [r0, y0] = PR[k - 1], [r1, y1] = PR[k]; return r0 + (r1 - r0) * (y - y0) / (y1 - y0); } return 0; };
        const lathe = new THREE.LatheGeometry(PR.map(([r, y]) => new THREE.Vector2(r, y)), 4); lathe.rotateY(Math.PI / 4); const corps = new THREE.Mesh(lathe, eM); G.add(corps);
        for (const [y, r] of [[57, 36], [115, 19], [276, 4.5]]) { const pl = new THREE.Mesh(new THREE.BoxGeometry(r * 1.5, 5, r * 1.5), eM); pl.position.y = y; G.add(pl); }
        const arcM = lointain(0xe8c8a0), arc = new THREE.Mesh(new THREE.CircleGeometry(24, 16, 0, Math.PI), arcM); for (const ry of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) { const q = arc.clone(); q.rotation.y = ry; q.position.set(Math.sin(ry) * 47.5, 0, Math.cos(ry) * 47.5); G.add(q); }   // (les grandes arches entre les piliers, qui laissent voir le ciel)
        const pts = []; for (let i = 0; i < 700; i++) { const y = Math.random() * 320, r = rP(y) * .72, an = Math.random() * 6.283; pts.push(Math.cos(an) * r, y, Math.sin(an) * r); }
        const sc = new THREE.Points(new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(pts, 3)), new THREE.PointsMaterial({ color: 0xfff6d0, size: 2.4, fog: false, transparent: true, sizeAttenuation: false, depthWrite: false })); G.add(sc);
        const lumE = new THREE.Mesh(new THREE.LatheGeometry(PR.map(([r, y]) => new THREE.Vector2(r * 1.04 + .5, y)), 4).rotateY(Math.PI / 4), new THREE.MeshBasicMaterial({ color: 0xffa030, fog: false, transparent: true, opacity: .55, depthWrite: false })); G.add(lumE);
        const phare = new THREE.Mesh(new THREE.SphereGeometry(5, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false })); phare.position.y = 330; G.add(phare);
        AMB.push((tm) => { const n = !!L.nuit; lumE.visible = n; phare.visible = n; sc.visible = n && (tm / 1000) % 60 < 8; if (sc.visible) sc.material.opacity = .5 + Math.random() * .5; }); }
      // la tour Montparnasse, au sud ; Saint-Sulpice ; le Val-de-Grâce
      { const m = lointain(0x5a5e66); const t = new THREE.Mesh(new THREE.BoxGeometry(16, 84, 20), m); t.position.set(-170, 30, 600); scene.add(t); }
      { const m = lointain(0xb8aca0); for (const dx of [-10, 10]) { const t = new THREE.Mesh(new THREE.BoxGeometry(9, 70, 9), m); t.position.set(-330 + dx, 25, 520); scene.add(t); } const n = new THREE.Mesh(new THREE.BoxGeometry(32, 40, 50), m); n.position.set(-330, 10, 548); scene.add(n); }
      { const m = lointain(0x8a9098), b = new THREE.Mesh(new THREE.CylinderGeometry(9, 9, 18, 16), lointain(0xc8bca8)); b.position.set(40, 30, 640); scene.add(b); const d = new THREE.Mesh(new THREE.SphereGeometry(9, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), m); d.scale.y = 1.3; d.position.set(40, 39, 640); scene.add(d); }
      // le Sacré-Cœur, au nord, sur la butte Montmartre
      { const m = lointain(0xe8e4dc), G = new THREE.Group(); G.position.set(120, 0, -720); scene.add(G); const butte = new THREE.Mesh(new THREE.SphereGeometry(110, 24, 8, 0, Math.PI * 2, 0, Math.PI / 2), lointain(0x9a9088)); butte.scale.y = .1; G.add(butte);
        const B = (geo, x, y, z) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); G.add(o); }; B(new THREE.BoxGeometry(40, 22, 30), 0, 46, 0); B(new THREE.CylinderGeometry(9, 9, 16, 16), 0, 64, 0); { const d = new THREE.Mesh(new THREE.SphereGeometry(9, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), m); d.scale.y = 1.6; d.position.y = 72; G.add(d); } B(new THREE.CylinderGeometry(4, 4, 20, 12), 0, 82, -22); for (const s of [-1, 1]) { B(new THREE.CylinderGeometry(4, 4, 10, 12), s * 15, 60, 8); const d2 = new THREE.Mesh(new THREE.SphereGeometry(4, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), m); d2.scale.y = 1.6; d2.position.set(s * 15, 65, 8); G.add(d2); } }
      // les tours de la Défense, très loin à l'ouest
      { const m = lointain(0x9aa4b0); for (let i = 0; i < 9; i++) { const h = 50 + Math.random() * 70, t = new THREE.Mesh(new THREE.BoxGeometry(14 + Math.random() * 10, h, 14), m); t.position.set(-1000 - Math.random() * 60, h / 2 - 10, -120 + i * 18); scene.add(t); } }
      // le jour, ces silhouettes sont noyées dans le bleu de l'horizon ; le soir, elles passent au bleu nuit
      let nH = null; AMB.push(() => { const n = !!L.nuit; if (n === nH) return; nH = n; for (const m of HZ) { if (!m.userData.c0) m.userData.c0 = m.color.clone(); m.color.copy(m.userData.c0); if (n) m.color.multiplyScalar(.22).lerp(new THREE.Color(0x1a2240), .5); } villeM.color.setHex(n ? 0x3a4058 : 0xd8c8c0); }); }
    L.grille = L.grilleAdmin = null; }
  /* (10.156, fluidité) la nuit, seulement quelques lumières de réverbère, toujours les plus proches de la caméra (une lumière par réverbère, c'était des dizaines : tout ramait) */
  { const N = (MOBILE || GPU_MODESTE) ? 5 : 8, POOL = []; for (let i = 0; i < N; i++) { const l = new THREE.PointLight(0xffd08a, 14, 15, 1.5); l.visible = false; scene.add(l); L.nuitObjets.push(l); POOL.push(l); }
    let fr = 0; const a15 = L.anim; L.anim = (tm) => { try { a15 && a15(tm); } catch (e) {} if (!M || M.L !== L || !M.camera || fr++ % 20) return; const c = M.camera.position;
      const tri = LAMPES.map(p => [p, (p[0] - c.x) ** 2 + (p[2] - c.z) ** 2]).sort((u, w) => u[1] - w[1]); POOL.forEach((l, i) => { const p = tri[i] && tri[i][0]; if (p) l.position.set(p[0], p[1], p[2]); }); }; }
  /* (10.154, fluidité) les gens loin de la caméra ne sont plus dessinés ; les ombres portées, coupées (beaucoup trop de décor à ombrer) */
  { const PERS = []; scene.traverse(o => { if (o.userData && o.userData.parts && o.parent === scene) PERS.push(o); }); let f = 0, ombres = null; const R2 = (MOBILE || GPU_MODESTE ? 35 : 50) ** 2, v = new THREE.Vector3();
    const a14 = L.anim; L.anim = (tm) => { try { a14 && a14(tm); } catch (e) {} if (!M || M.L !== L || !M.camera) return; if (!ombres) { ombres = []; scene.traverse(o => { if (o.isLight && o.castShadow) { o.castShadow = false; ombres.push(o); } }); }
      if (f++ % 8) return; const c = M.camera.position; for (const o of PERS) { o.getWorldPosition(v); o.visible = (v.x - c.x) ** 2 + (v.z - c.z) ** 2 < R2; } };
    quitterLieu.add(() => { if (ombres) for (const o of ombres) o.castShadow = true; ombres = null; }); }
  fusionStatique(scene, L, 0);
  /* (10.148, comme à Montmartre) plus d'à-coups quand une façade ou un décor entre pour la première fois dans le champ : textures et matières préparées dès l'arrivée */
  { let fait = false; const a0p = L.anim; L.anim = (tm) => { try { a0p && a0p(tm); } catch (e) {} if (fait || !M || M.L !== L || !M.rendu || !M.camera) return; fait = true;
      try { const R = M.rendu, vus = new Set(); scene.traverse(o => { for (const m of [].concat(o.material || [])) if (m) for (const k of ["map", "emissiveMap", "normalMap", "alphaMap"]) { const t = m[k]; if (t && t.isTexture && !vus.has(t)) { vus.add(t); try { R.initTexture(t); } catch (e) {} } } }); R.compile(scene, M.camera); } catch (e) { console.warn("préparation", e); } }; }
}
({ construireNotreDame })
