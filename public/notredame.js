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
  const ESC = [-52, -36], RAMPE_C = [30, 46];   const MX = -70, MZ = 44.15, HX0 = MX - 2.75, HX1 = MX + 2.5, HZ0 = 42.3, HZ1 = 46.0;   // (10.148 : la trémie du métro, contre les immeubles)
   const ESCE = 2.6;   // (l'entrée de l'escalier, en haut, à l'est)   // (le grand escalier de la rive gauche ; la rampe de l'île)
  const OBS = [], VEND = [], AMB = [];
  const contourne = (p) => { const dx = p.x + 57, dz = p.z + 54, d = Math.hypot(dx, dz); if (d < 4.1) { p.x = -57 + dx / (d || 1) * 4.1; p.z = -54 + dz / (d || 1) * 4.1; } };   // (10.153 : personne ne traverse la fontaine — on en fait le tour)   // (ce qu'on ne traverse pas : les kiosques, les tables, les troncs…)
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
  // la rampe de l'île (visible des deux côtés : plus de trou de ciel)
  const paveDS = paveB.clone(); paveDS.side = THREE.DoubleSide;
  { const [r0, r1] = RAMPE_C; box(r1 - r0, -YB, .4, murM, (r0 + r1) / 2, YB / 2, -25.1);
    const g = new THREE.PlaneGeometry(r1 - r0, 2.4); g.rotateX(-Math.PI / 2); const P = g.attributes.position; for (let i = 0; i < P.count; i++) { const x = P.getX(i) + (r0 + r1) / 2, u = (r1 - x) / (r1 - r0); P.setY(i, u < .25 ? 0 : YB * (u - .25) / .75); } g.computeVertexNormals();
    add(g, paveDS, (r0 + r1) / 2, .01, -23.8); }
  // (10.146) le grand escalier de pierre de la rive gauche : il descend le long du mur du quai, parallèle à la Seine ; on y entre depuis le trottoir, par une ouverture du parapet ; un garde-corps côté eau
  { const [e0, e1] = ESC, Lg = e1 - e0, N = 26, D = Lg / N;
    for (let i = 0; i < N; i++) { const top = YB * (i + 1) / N, x = e1 - (i + .5) * D; box(D + .02, top - YB + .02, 2.6, quaiM, x, (top + YB) / 2, 23.8); box(.06, .04, 2.6, lig, e1 - i * D - .03, top + .01, 23.8); }
    box(Lg, -YB, .4, murM, (e0 + e1) / 2, YB / 2, 25.1);
    { const x0 = e0 + 3, x1 = e1, cx = (x0 + x1) / 2, ang = Math.atan(-YB / Lg), lr = (x1 - x0) / Math.cos(ang), r = box(lr, 1, .4, quaiM, cx, YB * (e1 - cx) / Lg + .5, 22.7); r.rotation.z = ang; const r2 = box(lr, .1, .55, quaiM, cx, YB * (e1 - cx) / Lg + 1.04, 22.7); r2.rotation.z = ang; }
    box(.4, 1 - YB, .5, quaiM, e1 + .2, (1 + YB) / 2, 22.7); }
  // les sols : le grand quai pavé (rive gauche), la rue du Petit-Pont, le quai de l'île et sa chaussée, le parvis
  sol(-XS, XS, 25.6, 31, paveM, .02); sol(-XS, XS, 31, HZ0, paveM, .02); sol(-XS, HX0, HZ0, 46, paveM, .02); sol(HX1, XS, HZ0, 46, paveM, .02); sol(-XS, XS, 46, 140, paveM, .01);
  sol(PP[0], PP[1], 25.6, 130, routeM, .03); for (const sx of [PP[0], PP[1]]) box(.25, .14, 104, quaiM, sx, .07, 78);
  sol(-XS, XS, -31, -25.6, trottM, .02); sol(-XS, XS, -30.5, -27.6, routeM, .03); box(XS * 2, .14, .25, quaiM, 0, .07, -30.5);   /* (10.148 : la chaussée de l'île, à sens unique ; le trottoir des bouquinistes le long du parapet) */
  { const pm = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), lig); void pm; }
  { const fond = mat({ color: 0x3a3630, roughness: 1 }); sol(-330, 330, 25.0, HZ0, fond, -.35); sol(-330, HX0, HZ0, 46, fond, -.35); sol(HX1, 330, HZ0, 46, fond, -.35); sol(-330, 330, 46, 300, fond, -.35); sol(-330, 330, -300, -25.0, fond, -.35); sol(-330, 330, 22.4, 25.4, fond, YB - .3); sol(-330, 330, -25.4, -22.4, fond, YB - .3); }   // (un fond sous les quais : aucune fente ne laisse voir le ciel)
  sol(-XS, XS, -232, -31, paveM, .01); sol(-36, 34, -215, -31, parvisM, .015);
  /* (les trottoirs, surélevés, et leurs bordures de granit : le long du parapet, sous les boîtes des bouquinistes ; le long des immeubles, sous les terrasses et les devantures ;
     dans la rue du Petit-Pont ; devant les immeubles de l'île et ceux qui bordent le parvis) */
  const TROT = .15, TR = [], bordM = mat({ color: 0x9a968e, roughness: .8 });
  const trottoir = (x0, x1, z0, z1, bords) => { TR.push([x0, x1, z0, z1]); sol(x0, x1, z0, z1, trottM, TROT); for (const b of bords) { const lz = b === "z0" || b === "z1", c = { x0, x1, z0, z1 }[b]; box(lz ? x1 - x0 : .3, TROT + .03, lz ? .3 : z1 - z0, bordM, lz ? (x0 + x1) / 2 : c + (b === "x0" ? .15 : -.15), (TROT + .03) / 2, lz ? c + (b === "z0" ? .15 : -.15) : (z0 + z1) / 2); } };
  trottoir(-XS, PP[0], 25.6, 30.0, ["z1", "x1"]); trottoir(PP[1], XS, 25.6, 30.0, ["z1", "x0"]);
  trottoir(-XS, PP[0], -27.6, -25.6, ["z0", "x1"]); trottoir(PP[1], XS, -27.6, -25.6, ["z0", "x0"]); trottoir(-XS, HX0, 38.4, 46, ["z0"]); trottoir(HX0, HX1, 38.4, HZ0, ["z0"]); trottoir(HX1, PP[0] - 4, 38.4, 46, ["z0"]); trottoir(PP[0] - 4, PP[0], 38.4, 130, ["x1", "z0"]); trottoir(PP[1], PP[1] + 4, 38.4, 130, ["x0", "z0"]); trottoir(PP[1] + 4, XS, 38.4, 46, ["z0"]);
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
    cyl(.22, .05, .18, fonteR, x, y + 4.82, z, 6); const l = new THREE.PointLight(0xffd08a, 14, 14, 1.5); l.position.set(x, y + 4.3, z); l.visible = false; scene.add(l); L.nuitObjets.push(l); OBS.push([x - .2, x + .2, z - .2, z + .2]); };
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
    for (let z = -80; z > -200; z -= 17) { platane(-29, z, .9); platane(27, z, .9); }
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
          (L.tabourets = L.tabourets || []).push([c.x, c.z, cap, .46]); TERR.push([c.x, c.z, cap]); } }
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
  rangee(-36, -64.6, 0, -1, 65, Math.PI / 2, ["std", "angle", "long"]); rangee(34, -44.6, 0, -1, 85, -Math.PI / 2, ["std", "long", "angle"]);
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
      for (const s of [-1, 1]) { const l = add(new THREE.CylinderGeometry(.2, .13, .48, 8), lanV, x + s * .62, 4.05, z); void l; cyl(.24, .05, .18, fonteV, x + s * .62, 4.36, z, 8); } const pl = new THREE.PointLight(0xffd08a, 14, 14, 1.5); pl.position.set(x, 3.9, z); pl.visible = false; scene.add(pl); L.nuitObjets.push(pl); OBS.push([x - .2, x + .2, z - .2, z + .2]); }
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
      const neM = new THREE.MeshStandardMaterial({ map: neT, transparent: true, alphaTest: .4, side: THREE.DoubleSide, emissive: 0xffffff, emissiveMap: neT, emissiveIntensity: .15, roughness: .6 }); NUIT.push([neM, .15, 1.6]);
      const ne = new THREE.Mesh(new THREE.PlaneGeometry(16, 10), neM); ne.position.set(-46.5, Y + 5.2, ZS); scene.add(ne);
      for (let x = -54; x <= -39; x += 2.5) { box(.12, 9, .12, fonteV, x, Y + 4.5, ZS - .6); } for (const y of [Y + 1, Y + 4.5, Y + 8]) box(16, .1, .1, fonteV, -46.5, y, ZS - .6); for (let x = -54; x < -39; x += 2.5) { const d = box(.08, 3.8, .08, fonteV, x + 1.25, Y + 2.75, ZS - .6); d.rotation.z = .6; }
      const lum = new THREE.PointLight(0xff5a3a, 0, 30, 1.6); lum.position.set(-46.5, Y + 4, ZS + 4); scene.add(lum); NUIT.push([{ set emissiveIntensity(v) { lum.intensity = v > .5 ? 60 : 0; } }, 0, 1]); } }
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
    const a = new THREE.Shape(); a.moveTo(-25.6, 0); a.lineTo(25.6, 0); a.lineTo(25.6, YE - .2); a.lineTo(22.5, YE - .2); a.lineTo(22.5, -1.5); a.lineTo(18, -1.5); a.lineTo(18, YE - .2);
    for (const [c, r, s0, rv] of [[12.7, 4.3, -5.0, 3.6], [0, 7, -5.2, 4.3], [-12.7, 4.3, -5.0, 3.6]]) { a.lineTo(c + r, YE - .2); a.lineTo(c + r, s0); a.absellipse(c, s0, r, rv, 0, Math.PI, false); a.lineTo(c - r, YE - .2); }   /* (l'arche du milieu, la plus haute : les bateaux-mouches passent dessous) */
    a.lineTo(-18, YE - .2); a.lineTo(-18, -1.5); a.lineTo(-22.5, -1.5); a.lineTo(-22.5, YE - .2); a.lineTo(-25.6, YE - .2); a.closePath();
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
      pierreF.emissive.setHex(0xffb860); murF.emissive.setHex(0xffb860); NUIT.push([pierreF, 0, .62], [murF, 0, .55]);   /* (10.149 : la nuit, la façade dorée, illuminée comme sur les photos) */
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
      fbox(-20, 20, 0, 33, -2, 0); fbox(-20, 20, 33, 42.6, -3, -1, ombreF); for (const s of [-1, 1]) fbox(s > 0 ? 6.8 : -20, s > 0 ? 20 : -6.8, 42.6, 63, -2, 0);
      // les contreforts, leurs retraites, leurs pinacles ; une statue dans la niche de chacun
      for (const u of [-19.2, -6.9, 6.9, 19.2]) { fbox(u - .9, u + .9, 0, 11, 0, 1.7); fbox(u - .85, u + .85, 11, 33, 0, 1.25); fbox(u - .8, u + .8, 33, 42.6, 0, .95); fbox(u - .7, u + .7, 42.6, 61, 0, .7);
        F("pin", u, 62.8, .35, .55, 3.6, .55); statue(u, 7.4, 1.95, 1.3); F("p", u, 6.4, 1.85, .7, .2, .5); }
      // les trois portails
      for (const [c, hw, hs] of [[-13.4, 2.5, 5.2], [0, 3.0, 5.8], [13.4, 2.5, 5.2]]) { const NR = 5, t = .34;
        for (let k = 1; k <= NR; k++) { anneau(hw + (k - 1) * t, hs, t, .3 + k * .24, c, 0, k * .24, k % 2 ? pierreF : voussF);
          if (k % 2 === 0) surArc(hw + (k - .5) * t, hs, .5, (x, y) => { if (y > hs - .2) F("stat", c + x, y, k * .24 + .08, .1, .14, .1); });
          if (k <= 4) for (const s of [-1, 1]) { statue(c + s * (hw + (k - .5) * t), 2.4, k * .24 + .12, 1); F("p", c + s * (hw + (k - .5) * t), 1.6, k * .24, .3, .25, .3); } }
        plein(hw, hs, tympM, c, 0, .025);
        for (const s of [-1, 1]) { fbox(s > 0 ? c + .25 : c - hw + .05, s > 0 ? c + hw - .05 : c - .25, 0, 4.6, -.2, .06, boisF); for (const v of [1, 2.4, 3.8]) F("p", c + s * hw / 2, v, .08, hw - .5, .06, .03); }
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
      const chim = (u, v, w, ry, s = 1, M = MF, k = 0) => { const G2 = new THREE.Group(); G2.position.set(u, v, w); G2.rotation.y = ry; G2.scale.setScalar(s); const pm = pierreF, A3 = (geo, x, y, z, rx = 0, sx = 1, sy = 1, sz = 1, rz = 0) => { const o = new THREE.Mesh(geo, pm); o.position.set(x, y, z); o.rotation.set(rx, 0, rz); o.scale.set(sx, sy, sz); G2.add(o); return o; };
        A3(new THREE.SphereGeometry(.42, 10, 8), 0, .55, 0, 0, 1, 1.25, .9); A3(new THREE.SphereGeometry(.3, 10, 8), 0, 1.2, .18, 0, 1, 1.05, 1.1);   // (le corps voûté, la tête)
        if (k % 3 === 1) A3(new THREE.ConeGeometry(.12, .6, 8), 0, 1.15, .65, Math.PI / 2); else { A3(new THREE.BoxGeometry(.32, .14, .3), 0, 1.08, .42); for (const s2 of [-1, 1]) A3(new THREE.ConeGeometry(.06, .3, 6), s2 * .15, 1.48, .1, -.3, 1, 1, 1, s2 * .4); }   // (le bec, ou la gueule et les cornes)
        for (const s2 of [-1, 1]) { A3(new THREE.BoxGeometry(.06, .9, .55), s2 * .38, .75, -.25, .25, 1, 1, 1, s2 * .2); A3(new THREE.CylinderGeometry(.07, .09, .5, 6), s2 * .2, .35, .3, .5); A3(new THREE.CylinderGeometry(.06, .07, .55, 6), s2 * .2, .8, .38, -.9); }   // (les ailes, les pattes, les bras qui tiennent la tête)
        A3(new THREE.BoxGeometry(.7, .12, .8), 0, .03, .1); G2.updateMatrix(); G2.matrix.premultiply(M); G2.matrix.decompose(G2.position, G2.quaternion, G2.scale); scene.add(G2); };
      let kc = 0; for (const u of [-19.6, -7.3, 7.3, 19.6]) chim(u, 42.75, .55, u < 0 ? -.4 : .4, 1.1, MF, kc++);
      for (const c of [-13.4, 13.4]) for (const du of [-6.2, 6.2]) chim(c + du, 61.65, .5, du < 0 ? -.5 : .5, 1.0, MF, kc++);
      for (const M of [MSp, MSm]) for (const du of [-6.2, 6.2]) chim(du, 61.65, .5, du < 0 ? -.5 : .5, 1.0, M, kc++);
      // les gargouilles des tours : longues, penchées en avant, la gueule ouverte, qui crachent l'eau de pluie loin des murs
      const garg = (u, v, w, M = MF) => { const G2 = new THREE.Group(); G2.position.set(u, v, w); const A3 = (geo, x, y, z, rx = 0, sx = 1, sy = 1, sz = 1) => { const o = new THREE.Mesh(geo, pierreF); o.position.set(x, y, z); o.rotation.set(rx, 0, 0); o.scale.set(sx, sy, sz); G2.add(o); return o; };
        A3(new THREE.CylinderGeometry(.16, .26, 2.2, 8), 0, 0, 1.0, Math.PI / 2 + .2); A3(new THREE.SphereGeometry(.24, 8, 6), 0, -.24, 2.15, 0, 1, 1, 1.4); A3(new THREE.BoxGeometry(.18, .08, .3), 0, -.36, 2.3); for (const s2 of [-1, 1]) A3(new THREE.BoxGeometry(.05, .3, .7), s2 * .2, .14, .7, -.3);
        G2.updateMatrix(); G2.matrix.premultiply(M); G2.matrix.decompose(G2.position, G2.quaternion, G2.scale); scene.add(G2); };
      for (const c of [-13.4, 13.4]) for (const du of [-6.5, 6.5]) for (const v of [41.6, 59.8]) garg(c + du, v, .4);
      for (const M of [MSp, MSm]) for (const du of [-6.5, 6.5]) for (const v of [41.6, 59.8]) garg(du, v, .5, M);
      NI.fin(); }
    // les volumes derrière la façade : les tours, le corps central, les contreforts en saillie
    for (const sz of [-1, 1]) { box(12, FH - .2, 13, pierre, FX + 6.6, (FH - .2) / 2, CZ + sz * 13.4); box(13.4, 1, 13.4, pierreS, FX + 6.6, FH - .1, CZ + sz * 13.4);
      for (const [dx, dz] of [[-6, -6], [6, -6], [-6, 6], [6, 6]]) { cyl(.5, .7, 2.2, pierreS, FX + 6.6 + dx, FH + 1.5, CZ + sz * 13.4 + dz, 8); cyl(.02, .5, 3.4, pierreS, FX + 6.6 + dx, FH + 4.2, CZ + sz * 13.4 + dz, 8); }   // les pinacles aux angles des tours
      cyl(.02, 1.2, 5, plomb, FX + 6.6, FH + 2.5, CZ + sz * 13.4, 4); }
    box(12.6, 41.5, 12, pierre, FX + 6.9, 20.75, CZ);
    /* (les contreforts sont dans l'image de la façade) */
    // la nef et le chœur, le toit de plomb, les bas-côtés, les fenêtres hautes
    const NX0 = FX + 12, NX1 = ND.x1, NL = NX1 - NX0, NH = 33, NW = 14;
    const nefT = tT(512, 256, (c, w, h) => { c.fillStyle = PIERRE; c.fillRect(0, 0, w, h); for (let i = 0; i < 300; i++) { c.fillStyle = `rgba(${al() < .5 ? "120,110,90" : "255,250,235"},${al() * .08})`; c.fillRect(al() * w, al() * h, 3 + al() * 14, 2 + al() * 6); }
      for (let k = 0; k < 8; k++) { const x = k * w / 8 + w / 32; c.fillStyle = "#8a7c60"; c.beginPath(); c.moveTo(x, h * .9); c.lineTo(x, h * .35); c.quadraticCurveTo(x, h * .15, x + w / 32, h * .12); c.quadraticCurveTo(x + w / 16, h * .15, x + w / 16, h * .35); c.lineTo(x + w / 16, h * .9); c.fill(); c.fillStyle = "#24304e"; c.fillRect(x + 4, h * .3, w / 16 - 8, h * .58); c.fillStyle = "rgba(200,160,80,.35)"; c.fillRect(x + 6, h * .35, 4, h * .5); } }, NL / 16, 1);
    box(NL, NH, NW, mat({ map: nefT, roughness: .85 }), NX0 + NL / 2, NH / 2, CZ);
    { const tg = new THREE.CylinderGeometry(.01, NW / 2 + .8, 11, 4, 1); tg.rotateY(Math.PI / 4); tg.scale(1, 1, 1); const t = new THREE.Mesh(new THREE.BoxGeometry(NL, .1, .1), plomb); void t;
      const pr = new THREE.Shape(); pr.moveTo(-NW / 2 - .6, 0); pr.lineTo(0, 11); pr.lineTo(NW / 2 + .6, 0); pr.closePath(); const pg = new THREE.ExtrudeGeometry(pr, { depth: NL, bevelEnabled: false }); pg.rotateY(Math.PI / 2); const toit = add(pg, plomb, NX0, NH, CZ); void toit; }
    for (const sz of [-1, 1]) { box(NL, 16, 9, mat({ map: nefT, roughness: .85 }), NX0 + NL / 2, 8, CZ + sz * 11.5);   // les bas-côtés
      const tp = new THREE.Mesh(new THREE.BoxGeometry(NL, .3, 10), plomb); tp.position.set(NX0 + NL / 2, 17.4, CZ + sz * 11.2); tp.rotation.x = sz * .35; scene.add(tp); }
    // les arcs-boutants : de grandes volées de pierre qui s'élancent des culées vers la nef
    for (let x = NX0 + 4; x < NX1 - 4; x += 8.5) for (const sz of [-1, 1]) { const zc = CZ + sz * 16.5; box(2, 26, 2.2, pierreS, x, 13, zc); cyl(.2, .55, 3.5, pierreS, x, 27.6, zc, 4); { const gg = add(new THREE.CylinderGeometry(.14, .24, 2.0, 8), pierre, x, 24.6, zc + sz * 1.6); gg.rotation.x = sz * (Math.PI / 2 - .25); const gt = add(new THREE.SphereGeometry(.22, 8, 6), pierre, x, 24.35, zc + sz * 2.65); gt.scale.z = 1.4; }   /* (les gargouilles de la nef) */   // la culée, son pinacle
      const v = new THREE.Mesh(new THREE.BoxGeometry(.8, .9, 10.5), pierreS); v.position.set(x, 26.5, CZ + sz * 11.6); v.rotation.x = sz * .5; scene.add(v); }
    // le transept : ses deux bras et leurs roses
    { const TX = NX0 + NL * .42, TW = 13; box(TW, NH, NW + 22, mat({ map: nefT, roughness: .85 }), TX, NH / 2, CZ);
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
  { const vus = new Set(); for (const o of scene.children.slice(i0ND)) o.traverse(q => { for (const m of [].concat(q.material || [])) { if (!m || !m.isMeshStandardMaterial || vus.has(m) || m.emissiveIntensity > 0) continue; vus.add(m); if (m.emissive && m.emissive.getHex() !== 0) continue; m.emissive = new THREE.Color(0xffb050); const toit = m.metalness > .3; NUIT.push([m, 0, toit ? .12 : .45]); } }); }   // (la nef, les arcs-boutants, le chevet : illuminés eux aussi)
  { const T = new THREE.Matrix4().makeRotationY(Math.PI / 2).setPosition(58, 0, -96); for (const o of scene.children.slice(i0ND)) o.applyMatrix4(T); }
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
    amarre(bateauMouche(28, 5, false), 36, 15.3, YE + .45);  amarre(taxi(), -100, 16.6, YE + .35); amarre(peniche(), -72, -15.0, YE + .55);
    for (const x of [36]) { box(1.2, .08, 1.4, metB, x - 4, YB + .3, 18.4); }   // (les passerelles)
    /* (10.149, d'après les photos) le restaurant-bateau à quai : la coque noire, le grand salon vitré et ses montants sombres, le toit gris arrondi, les lampadaires ronds aux deux bouts,
       les tables dressées à l'intérieur, la lumière chaude le soir ; sur le bas-port, sa terrasse : le plancher, les jardinières de buis, les parasols blancs, les tables et les chaises en rotin */
    { const X = 76, Z = 14.9, y0 = YE + .5, Lb = 32, Wb = 6.4, g = new THREE.Group(); g.position.set(X, y0, Z); scene.add(g); const b = (w, h, d, m, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); g.add(o); return o; };
      const coqueN = mat({ color: 0x1a1c20, roughness: .5, metalness: .2 }), grisT = mat({ color: 0x8a9096, roughness: .5, metalness: .3 }), montM = mat({ color: 0x24262a, roughness: .5 }), salon = mat({ color: 0xf2d8a8, emissive: 0xffc880, emissiveIntensity: .25, roughness: .8 });
      NUIT.push([salon, .25, 1.3]);
      coque(g, Lb, Wb, 1.8, coqueN, 0); b(Lb + .2, .12, Wb + .2, mat({ color: 0x5a4a3a }), 0, .95, 0);
      b(Lb - 4, 2.3, Wb - .8, salon, 0, 2.2, 0); b(Lb - 3.9, 2.32, Wb - .7, vitreB, 0, 2.2, 0); for (let x = -(Lb - 4) / 2; x <= (Lb - 4) / 2 + .01; x += 1.4) for (const s of [-1, 1]) b(.08, 2.3, .08, montM, x, 2.2, s * (Wb - .7) / 2);
      { const tg = new THREE.CylinderGeometry(Wb / 2, Wb / 2, Lb - 2, 24, 1, false, -Math.PI / 2, Math.PI); tg.rotateZ(Math.PI / 2); tg.scale(1, .22, 1); const t = new THREE.Mesh(tg, grisT); t.position.set(0, 3.35, 0); g.add(t); }
      for (const s of [-1, 1]) { b(.6, 3.6, .6, coqueN, s * (Lb / 2 - .5), 2.3, 0); const gl = new THREE.Mesh(new THREE.SphereGeometry(.28, 12, 10), mat({ color: 0xfff4e0, emissive: 0xffe8c0, emissiveIntensity: .3 })); gl.position.set(s * (Lb / 2 - .5), 4.4, 0); g.add(gl); NUIT.push([gl.material, .3, 1.6]); }
      for (let x = -12; x <= 12; x += 2.4) for (const zz of [-1.6, 1.6]) { b(.8, .06, .8, mat({ color: 0xf8f6f0 }), x, 1.85, zz); b(.06, .8, .06, montM, x, 1.45, zz); }   // (les tables dressées)
      box(1.4, .08, 3.6, metB, X - 6, YB + .25, 18.2); for (const s of [-1, 1]) box(.04, .9, 3.6, metB, X - 6 + s * .7, YB + .7, 18.2);   // (la passerelle)
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
    const TYPES = ["r5", "p205", "deuche", "r4", "bx", "taxi", "p205", "r5"];
    CH.forEach((C, j) => { let lg = 0; const seg = []; for (let i = 1; i < C.P.length; i++) { const d = Math.hypot(C.P[i][0] - C.P[i - 1][0], C.P[i][1] - C.P[i - 1][1]); seg.push([lg, d, C.P[i - 1], C.P[i]]); lg += d; }
      const sAt = ([x, z]) => { for (const [l0, d, a, b] of seg) { const u = ((x - a[0]) * (b[0] - a[0]) + (z - a[1]) * (b[1] - a[1])) / (d * d); if (u >= -.01 && u <= 1.01 && Math.hypot(a[0] + (b[0] - a[0]) * u - x, a[1] + (b[1] - a[1]) * u - z) < .5) return l0 + u * d; } return -1; };
      const stops = C.stops.map(st => [sAt(st), st[2]]), n = PEU ? 3 : (j > 1 ? 4 : 5); for (let k = 0; k < n; k++) VOIT.push({ g: voiture(TYPES[(k + j * 3) % TYPES.length], k + j * 5), seg, lg, stops, s: k * lg / n + j * 11, v: 0, vmax: 8 + (k % 3), ch: j }); }); }
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
  { const R = [[[-140, 28.0], [140, 28.0]], [[140, 27.8], [-140, 27.8]], [[-140, 40.0], [140, 40.0]], [[140, 40.4], [-140, 40.4]], [[-140, 20.4], [58, 20.4]], [[58, 21.2], [-140, 21.2]], [[94, 20.6], [140, 20.6]],
      [[-37.3, 30], [-37.3, 23.8], [-50.5, 23.8], [-50.5, 21], [-120, 21], [-50.5, 21], [-50.5, 23.8], [-37.3, 23.8]], [[-12.4, 70], [-12.4, 28.6], [-8.8, 24], [-8.8, -33], [-30, -56], [28, -56], [6.8, -33], [6.8, 24], [10.5, 28.6], [10.5, 70]],
      [[-28, -40], [26, -40]], [[-30, -48], [-62, -48], [-72, -54], [-62, -60.5], [-45, -60.5], [-30, -55]], [[-44, -59], [-62, -60.5], [-71, -52], [-58, -47.5], [-48, -52]], [[-140, -31.3], [140, -31.3]], [[-26, -75], [-26, -190], [-23, -190], [-23, -75]], [[24, -75], [24, -190], [21.5, -190], [21.5, -75]], [[-29, -62], [27, -62]], [[-27.6, -45], [-27.6, -130], [-27.6, -45]], [[25.6, -130], [25.6, -45], [25.6, -130]], [[-20, -36], [18, -66], [-16, -64], [14, -38]], [[0, -34], [0, -66], [12, -50], [-12, -50]], [[-24, -55], [22, -45], [-6, -40], [8, -62]], [[10, -36], [-18, -48], [6, -58], [20, -66]]];
    for (let k = 0, n = PEU ? 24 : 62; k < n; k++) { const Rr = R[k % R.length], m = gens(k), i0 = (k * 3) % Rr.length, a = Rr[i0], b = Rr[(i0 + 1) % Rr.length], u = ((k * 37) % 100) / 100; m.position.set(a[0] + (b[0] - a[0]) * u, 0, a[1] + (b[1] - a[1]) * u); m.userData.poser("marche", 0); m.userData.anime = true; scene.add(m);
      MARCH.push({ m, R: Rr, i: (i0 + 1) % Rr.length, v: .9 + (k % 5) * .12 }); }
    for (let k = 0; k < (PEU ? 4 : 9); k++) { const m = gens(k + 40), x = -12 + (k % 3) * 9 + al() * 3, z = -40 - Math.floor(k / 3) * 5; m.position.set(x, 0, z); m.rotation.y = Math.PI + (al() - .5) * .6; m.userData.anime = true; scene.add(m); m.userData.poser("debout", 0);
      const P = m.userData.parts; P.bras[1].e.rotation.x = -1.6; P.bras[1].c.rotation.x = -1.1; P.bras[0].e.rotation.x = -1.4; P.bras[0].c.rotation.x = -1.2; P.tete.rotation.x = -.2;   // (ils photographient la cathédrale)
      const ap = new THREE.Mesh(new THREE.BoxGeometry(.14, .09, .05), mat({ color: 0x1a1a1a })); ap.position.y = -m.userData.hipY * .36; P.bras[1].c.add(ap); } }

  /* ---------- (10.147) l'ambiance, comme à Montmartre : des gens attablés aux terrasses, l'accordéoniste du quai et son étui ouvert, le peintre à son chevalet face à la Seine, les pigeons sur les pavés ---------- */
  { for (let i = 0; i < TERR.length; i++) { if ((i * 7) % 10 > 6 || AMB.length > (PEU ? 22 : 90)) continue; const [x, z, cap] = TERR[i], m = gens(i + 60); m.position.set(x, TROT + .48 - m.userData.hipY, z); m.rotation.y = cap; m.userData.poser("assis", 0); m.userData.anime = true; scene.add(m); AMB.push((tm) => { const P = m.userData.parts; P.tete.rotation.y = Math.sin(tm / 1700 + i) * .35; P.bras[(i % 2)].e.rotation.x = -.6 - Math.max(0, Math.sin(tm / 2300 + i * 2)) * .7; }); }
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
      for (let k = 0; k < Math.min(PEU ? 3 : 7, SG.length); k++) { const m = gens(k + 140), [x0, z0] = auHasard(); m.position.set(x0, 0, z0); m.userData.anime = true; scene.add(m);
        const C = { m, etat: "flane", pts: [auHasard()], siege: null, fin: 0, v: .9 + (k % 3) * .15 };
        AMB.push((tm, dt) => { dt = dt || .016; const g = C.m;
          if (C.etat === "assis") { const P = g.userData.parts; P.tete.rotation.y = Math.sin(tm / 1800 + k) * .35; if (tm > C.fin) { C.etat = "part"; const s = C.siege; s.pris = false; C.siege = null; C.pts = [abord(s.s), auHasard(), auHasard()]; g.position.y = 0; } return; }
          const p0 = C.pts[0]; if (!p0) { if (C.etat === "va") { const s = C.siege.s; g.position.set(s[0], TROT + .48 - g.userData.hipY, s[1]); g.rotation.y = s[2]; g.userData.poser("assis", 0); C.etat = "assis"; C.fin = tm + 15000 + al() * 30000; return; }
            const libres = SG.filter(q => !q.pris); if (libres.length && al() < .7) { const q = libres[(al() * libres.length) | 0]; q.pris = true; C.siege = q; C.etat = "va"; C.pts = [abord(q.s), [q.s[0], q.s[1]]]; } else C.pts = [auHasard()]; return; }
          const dx = p0[0] - g.position.x, dz = p0[1] - g.position.z, d = Math.hypot(dx, dz); if (d < .25) { C.pts.shift(); return; }
          const v = Math.min(d, C.v * dt); g.position.x += dx / d * v; g.position.z += dz / d * v; contourne(g.position); g.position.y = L.hauteur(g.position.x, g.position.z); g.rotation.y = Math.atan2(dx, dz); g.userData.poser("marche", tm * C.v / 1.2); }); } }
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
  const enRampe = (x, z) => x > RAMPE_C[0] && x < RAMPE_C[1] && z < -22.5 && z > -25.1;
  const enEsc = (x, z) => x > ESC[0] && x < ESC[1] && z > 22.4 && z < 25.25;
  const libreObs = (x, z) => !(x > -21 && x < 19 && z < -68.4 && z > -208);
  L.hauteur = (x, z, p) => { if (enEsc(x, z)) return YB * Math.max(0, Math.min(1, (ESC[1] - x) / (ESC[1] - ESC[0])));
    for (const [a, b, c, d] of TR) if (x >= a && x <= b && z >= c && z <= d) return TROT;   // (sur le trottoir)
    if (enRampe(x, z)) { const u = (RAMPE_C[1] - x) / (RAMPE_C[1] - RAMPE_C[0]); return u < .25 ? 0 : YB * (u - .25) / .75; }
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
    if (z < -31 && z > -213 && x > -35.4 && x < 33.4) return libreObs(x, z);   // le parvis, les côtés de la cathédrale, le square
    return false; };
  L.dbgMarch = MARCH; L.depart = [MX + 3.8, 43.6]; L.taille = 1.8; L.suivi = { d: 6.5, h: 3.6, av: 3, vy: 2 }; L.fov = [60, 74];
  L.zone = [-XS, XS, -232, 140]; L.cam = { pos: [MX + 6, 7, 40], vise: [FAC.x, 25, FAC.z] }; L.sansMusique = true;
  // l'abribus du quai de l'île, devant le parvis : on y arrive en bus, on y repart
  try { busLigne(L, scene, { ax: 30, az: -31.8, affiche: "orangina", voie: -29.0, sens: 1, x0: -148, x1: 148, dest: [{ vers: "rue", nom: "Rue du Faubourg-Poissonnière (la caserne)", arrivee: [10, -4.7], yawA: 0 }, { vers: "grande", nom: "Rue d'Hauteville", arrivee: [-6, -154.6], yawA: Math.PI }, { vers: "rex", nom: "Bonne-Nouvelle (le Grand Rex)", arrivee: [-26, -10.2], yawA: 0 }] }); } catch (e) { console.warn(e); }

  /* ---------- l'animation : l'eau, les bateaux, les voitures, les promeneurs, la nuit ---------- */
  let nV = null, tp = 0;
  const a0 = L.anim; L.anim = (tm) => { try { a0 && a0(tm); } catch (e) {} const n = !!L.nuit; if (n !== nV) { nV = n; for (const [m, j, nn] of NUIT) m.emissiveIntensity = n ? nn : j; }
    const dt = tp ? Math.min(.1, (tm - tp) / 1000) : 0; tp = tm; const t = tm / 1000;
    eauT.offset.x = (t * .012) % 1; EAU.u.t.value = t % 10000;
    if (n !== EAU.nuit) { EAU.nuit = n; EAU.u.ciel.value.setHex(n ? 0x16203a : 0xe8b8a4); EAU.u.clair.value.setHex(n ? 0x1a2a30 : 0x6a7468); EAU.u.profond.value.setHex(n ? 0x0c1618 : 0x24403a); EAU.u.soleil.value.set(n ? .3 : -.8, n ? .55 : .3, n ? -.6 : .4).normalize(); EAU.u.eclat.value = n ? .08 : 1; }
    for (const B of BAT) { const Lg = XS * 2 + 80, d = ((B.x0 + t * Math.abs(B.v)) % Lg), x = B.v > 0 ? -XS - 40 + d : XS + 40 - d; B.g.position.set(x, B.y + Math.sin(t * 1.3 + B.x0) * .05, B.z); B.g.rotation.y = B.v > 0 ? 0 : Math.PI; B.g.rotation.x = Math.sin(t * .9 + B.x0) * .01; }
    // les feux : cycle de 40 s — A (la rue du Petit-Pont et le pont) vert 0-14, orange 14-17 ; B (le quai) vert 20-34, orange 34-37 ; les piétons traversent le quai pendant A, la rue pendant B
    { const cy = t % 40, A = cy < 14 ? "vert" : cy < 17 ? "orange" : "rouge", B = cy >= 20 && cy < 34 ? "vert" : cy >= 34 && cy < 37 ? "orange" : "rouge", pA = cy > 1 && cy < 13 ? "vert" : "rouge", pB = cy > 21 && cy < 33 ? "vert" : "rouge";
      FEUX.A = A; FEUX.B = B; FEUX.pA = pA; FEUX.pB = pB; const F = L.feuxM, cle = A + B + pA + pB;
      if (F && cle !== FEUX.k0) { FEUX.k0 = cle; for (const [s, ph] of [["A", A], ["B", B]]) { F[s].R.emissiveIntensity = ph === "rouge" ? 2.2 : 0; F[s].O.emissiveIntensity = ph === "orange" ? 2.2 : 0; F[s].V.emissiveIntensity = ph === "vert" ? 2.2 : 0; }
        for (const [s, ph] of [["QA", pA], ["QB", pB]]) { F[s].PR.emissiveIntensity = ph === "rouge" ? 1.8 : 0; F[s].PV.emissiveIntensity = ph === "vert" ? 1.8 : 0; } } }
    for (const V of VOIT) { let cible = V.vmax;
      for (const W of VOIT) if (W !== V && W.ch === V.ch) { const gap = (W.s - V.s + V.lg) % V.lg; if (gap > 0 && gap < 14) cible = Math.min(cible, Math.max(0, (gap - 6.5) * 1.4)); }   // (on garde ses distances)
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
      m.position.x += dx / d * v; m.position.z += dz / d * v; contourne(m.position); m.position.y = L.hauteur(m.position.x, m.position.z, { g: m }); m.rotation.y = Math.atan2(dx, dz);
      if (!c || (m.position.x - c.x) ** 2 + (m.position.z - c.z) ** 2 < R2) m.userData.poser("marche", tm * W.v / 1.2); } catch (e) {} };
  // le soir : la cathédrale illuminée par des projecteurs, les quais à la lueur des réverbères
  { const proj = new THREE.SpotLight(0xffe2b0, 0, 140, .5, .6, 1); proj.position.set(FAC.x, 4, -33); proj.target.position.set(FAC.x, 30, FAC.z); scene.add(proj); scene.add(proj.target); NUIT.push([{ set emissiveIntensity(v) { proj.intensity = v * 1800; } }, 0, 1]); }

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
  { const cielT = tT(512, 512, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#4f86c8"); g.addColorStop(.28, "#8aa8d8"); g.addColorStop(.5, "#d8b0c4"); g.addColorStop(.68, "#f2b090"); g.addColorStop(.84, "#f8a868"); g.addColorStop(1, "#ffd59a"); c.fillStyle = g; c.fillRect(0, 0, w, h);
      for (let i = 0; i < 70; i++) { const x = al() * w, y = 40 + al() * h * .55, rw = 40 + al() * 140, rh = 4 + al() * 10; const gg = c.createRadialGradient(x, y, 1, x, y, rw); gg.addColorStop(0, `rgba(255,${200 + (al() * 40) | 0},${190 + (al() * 40) | 0},${.18 + al() * .22})`); gg.addColorStop(1, "rgba(255,220,210,0)"); c.fillStyle = gg; c.beginPath(); c.ellipse(x, y, rw, rh, -.15 + al() * .1, 0, 7); c.fill(); }
      c.strokeStyle = "rgba(255,255,255,.55)"; c.lineWidth = 2; c.beginPath(); c.moveTo(w * .25, h * .05); c.lineTo(w * .62, h * .36); c.stroke(); c.lineWidth = 1.2; c.beginPath(); c.moveTo(w * .1, h * .2); c.lineTo(w * .45, h * .3); c.stroke(); });
    const cielC = new THREE.Color(0xf0b892), lum = { s: null, h: null }; let jourV = null;
    const a13 = L.anim; L.anim = (tm) => { try { a13 && a13(tm); } catch (e) {} if (!M || M.L !== L) return; const n = !!L.nuit;
      if (!lum.s) for (const o of scene.children) { if (o.isDirectionalLight && !lum.s) lum.s = o; if (o.isHemisphereLight && !lum.h) lum.h = o; }
      if (!n) { if (scene.background !== cielT) scene.background = cielT; if (scene.fog) scene.fog.color.copy(cielC);
        if (lum.s) { lum.s.color.setHex(0xffb878); lum.s.intensity = 2.4; lum.s.position.set(-46, 20, 26); } if (lum.h) { lum.h.color.setHex(0xffd8c0); lum.h.groundColor.setHex(0x7a5a5a); lum.h.intensity = 1.05; } }
      if (n !== jourV) { jourV = n; if (!n) { EAU.u.ciel.value.setHex(0xe8b8a4); EAU.u.soleil.value.set(-.8, .3, .4).normalize(); EAU.u.clair.value.setHex(0x6a7468); } } }; }
  /* (10.146) la musique du quartier, en continu, pas trop fort : la valse d'Amélie ; coupée quand on quitte la carte */
  { const a11 = L.anim; L.anim = (tm) => { try { a11 && a11(tm); } catch (e) {} if (!M || M.L !== L) return; const A2 = (window.__valseND = window.__valseND || Object.assign(new Audio("sons/notredame-valse.mp3?v=2"), { loop: true, preload: "auto" }));   /* (10.151 : comme l'accordéon de Montmartre — si le navigateur bloque le son, il part au premier toucher) */
      if (window.mxArcadeOn) { if (!A2.paused) A2.pause(); return; }
      if (A2.paused && !A2._essai && !A2._attente) { A2._essai = true; A2.volume = 0; A2.play().then(() => { A2._essai = false; }).catch(() => { A2._essai = false; A2._attente = true; }); }
      if (A2._attente && !A2._ecoute) { A2._ecoute = true; const go = () => { A2._attente = false; A2._ecoute = false; if (M && M.L === L) A2.play().catch(() => {}); removeEventListener("pointerdown", go); removeEventListener("keydown", go); }; addEventListener("pointerdown", go); addEventListener("keydown", go); }
      if (!A2.paused) try { A2.volume = Math.min(.35, A2.volume + .006); } catch (e) {} };
    quitterLieu.add(() => { const A2 = window.__valseND; if (A2) { A2.pause(); try { A2.currentTime = 0; } catch (e) {} } }); }
  // (10.146) ce que le doigt touche pour aller quelque part : le quai, l'île et le parvis, le pont, les deux bas-ports (des sols invisibles, à chaque niveau)
  { const inv = new THREE.MeshBasicMaterial({ visible: false }), pl = (x0, x1, z0, z1, y) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), inv); m.rotation.x = -Math.PI / 2; m.position.set((x0 + x1) / 2, y, (z0 + z1) / 2); scene.add(m); m.updateMatrixWorld(true); return m; };
    L.sol = pl(-XS, XS, 22.5, 140, .02); L.solsPlus = [pl(-XS, XS, -232, -22.5, .02), pl(PP[0], PP[1], -22.5, 22.5, .03), pl(-XS, XS, 18, 22.5, YB + .02), pl(-XS, XS, -22.5, -18, YB + .02)]; }
  fusionStatique(scene, L, 0);
  /* (10.148, comme à Montmartre) plus d'à-coups quand une façade ou un décor entre pour la première fois dans le champ : textures et matières préparées dès l'arrivée */
  { let fait = false; const a0p = L.anim; L.anim = (tm) => { try { a0p && a0p(tm); } catch (e) {} if (fait || !M || M.L !== L || !M.rendu || !M.camera) return; fait = true;
      try { const R = M.rendu, vus = new Set(); scene.traverse(o => { for (const m of [].concat(o.material || [])) if (m) for (const k of ["map", "emissiveMap", "normalMap", "alphaMap"]) { const t = m[k]; if (t && t.isTexture && !vus.has(t)) { vus.add(t); try { R.initTexture(t); } catch (e) {} } } }); R.compile(scene, M.camera); } catch (e) { console.warn("préparation", e); } }; }
}
({ construireNotreDame })
