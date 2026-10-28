const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const c = await b.newContext({ viewport: { width: 1280, height: 760 }, hasTouch: false, serviceWorkers: 'block' });
  await c.route('**/__exp/GLTFExporter.js', r => r.fulfill({ contentType: 'application/javascript', body: fs.readFileSync(__dirname + '/GLTFExporter.patch.js', 'utf8') }));
  await c.route('**/__exp/TextureUtils.js', r => r.fulfill({ contentType: 'application/javascript', body: fs.readFileSync(__dirname + '/TextureUtils.patch.js', 'utf8') }));
  await c.route('**/three@0.160.0/**', r => r.fulfill({ contentType: 'application/javascript', body: fs.readFileSync(__dirname + '/../../public/vendor/three.module.js', 'utf8') }));
  const p = await c.newPage(); const errs = []; p.on('pageerror', e => { errs.push(e.message + ' @ ' + (e.stack || '').split('\n').slice(1, 3).join(' ')); console.log('ERR', e.message); }); p.on('console', m => { if (m.type() === 'error' && !/Failed to load/.test(m.text())) errs.push(m.text().slice(0, 300) + ' @' + JSON.stringify(m.location())); }); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 300)); }); p.on('dialog', d => d.accept());
  await p.addInitScript(() => { window.CASERNE_KFAC = 2; window.CASERNE_GREMLINS = true; }); await p.goto('http://localhost:8797/'); await p.waitForTimeout(800);
  await p.click('#enter'); await p.waitForTimeout(400);
  await p.fill('#lPrenom', 'Germain-Pierre'); await p.fill('#lNom', 'Bouquet'); await p.fill('#lSecret', process.env.CASERNE_MDP);
  await p.click('#loginForm [type=submit]'); await p.waitForTimeout(900);
  if (await p.isVisible('#fParent')) { await p.fill('#fParent', 'Bouquet'); await p.click('#stampBtn'); } await p.waitForTimeout(1200);
  await p.evaluate(() => document.querySelector('[data-go=matrice]').click()); await p.waitForTimeout(800);
  await p.evaluate(() => document.querySelector('#mxEntrer').click()); await p.waitForTimeout(8000);
  for (let k = 0; k < 3; k++) { await p.evaluate(() => { const b = [...document.querySelectorAll('button')].filter(x => /Plus tard/.test(x.textContent) && x.offsetParent).pop(); if (b) b.click(); }); await p.waitForTimeout(700); }
  await p.evaluate(() => document.querySelector('#mxScene').scrollIntoView({ block: 'start' }));
  p.on('console', m => { if (m.type() === 'warning' && /avatar|zombie|tyran|lisa/i.test(m.text())) console.log('W', m.text().slice(0, 300), JSON.stringify(m.args().length)); });
  p.on('console', async m => { if (m.type() === 'error' && /reading/.test(m.text())) { try { console.log('STACK', await m.args()[0].evaluate(e => e.stack)); } catch (e) {} } });
  const V = './matrice.js?v=' + (await p.evaluate(() => document.getElementById('versionSplash').textContent)).replace('v', '');
  const E = f => p.evaluate(async ([V, f]) => { const m = await import(V), M = m._etatMatrice(); return eval(f); }, [V, f]);
  const sh = async n => { await p.screenshot({ path: __dirname + '/th/sh-' + n + '.png', timeout: 180000 }); return;  try { const bb = await p.evaluate(() => { const r = document.querySelector('#mxScene').getBoundingClientRect(); return { x: r.left, y: r.top, width: r.width, height: r.height }; }); await p.screenshot({ path: __dirname + '/th/sh-' + n + '.png', clip: bb, timeout: 180000 }); } catch (e) { console.log('capture ratée', n, e.message.slice(0, 80)); } };
  const W = ms => p.waitForTimeout(ms);
  const info = () => E(`JSON.stringify({lieu:M.lieu, e:M.shEtape, vies:M.shVies, arme:M.shArme, cine:!!M.cine, bulle:M.bulleEl&&M.bulleEl.textContent, obj:M.objectifEl&&M.objectifEl.textContent, pos:(()=>{const q=M.gens.get(M.moiNum);return q&&[q.g.position.x.toFixed(1),q.g.position.y.toFixed(2),q.g.position.z.toFixed(1)]})(), monstres:(M.shMonstres||[]).length, pnj:[...M.gens.keys()].filter(k=>k<-600&&k>-610)})`);
  for (let k = 0; k < 20 && !(await p.evaluate(async V => { const m = await import(V); return !!m._etatMatrice(); }, V)); k++) await W(2000);
  await E("(m.allerAuLieu('rue'), 1)"); await W(15000);
  const pos = () => E("JSON.stringify({ lieu: M.lieu, p: (()=>{const q=M.gens.get(M.moiNum).g.position; return [+q.x.toFixed(2), +q.z.toFixed(2)]})(), cercles: (M.cercles||[]).filter(c=>c.g&&c.g.visible).length })");
  await E("(()=>{const q=M.gens.get(M.moiNum); q.cible=null; q.chemin=[]; q.g.position.set(0, q.g.position.y, -10); return 1})()"); await W(2000);
  const shot = async n => { await W(1500); await p.locator('#mxScene').screenshot({ path: '/home/user/apercus/j-' + n + '.png', timeout: 300000 }); };
  await E("(m.ambiance('jour'), 1)"); await E("(m.allerAuLieu('grande'), 1)"); for (let k = 0; k < 60 && (await E("M.lieu")) !== 'grande'; k++) await W(500); await W(6000);
  const b64 = await p.evaluate(async V => { const m = await import(V), M = m._etatMatrice(); const { GLTFExporter } = await import('/__exp/GLTFExporter.js');
    const T = await import('/vendor/three.module.js?v=160');
    const racine = M.L.racineJ || M.scene, b = new T.Box3(), c = new T.Vector3(), garde = [];
    racine.updateMatrixWorld(true);
    // (ce qui ne se voit pas dans le jeu — zones à toucher invisibles, objets de nuit éteints, objets cachés : on ne l'emporte pas)
    racine.traverse(o => { if (!o.isMesh) return; const ms = [].concat(o.material || []); if (ms.length && ms.every(m => !m || m.visible === false || m.colorWrite === false || (m.transparent && m.opacity < .06)) || o.layers.mask !== 1) o.visible = false; });
    for (const o of racine.children) { if (o.isLight || o.isSprite || !o.visible) continue; b.makeEmpty(); if (o.isInstancedMesh) { o.computeBoundingBox(); b.copy(o.boundingBox).applyMatrix4(o.matrixWorld); } else b.setFromObject(o); if (b.isEmpty()) continue; b.getCenter(c);
      if (Math.abs(c.x) < 34 && c.z > -31 && c.z < 30 && b.max.y - b.min.y < 60 && (b.max.x - b.min.x) < 80) garde.push(o); }
    // les objets répétés (InstancedMesh) : remis en objets simples (Blender les lit sans souci)
    const liste = []; const mm = new T.Matrix4();
    for (const o of garde) { if (!o.isInstancedMesh) { liste.push(o); continue; } const g = new T.Group(); g.matrix.copy(o.matrix); g.matrixAutoUpdate = false;
      for (let i = 0; i < Math.min(o.count, 4000); i++) { o.getMatrixAt(i, mm); const q = new T.Mesh(o.geometry, o.material); mm.decompose(q.position, q.quaternion, q.scale); g.add(q); } g.position.setFromMatrixPosition(o.matrixWorld); g.matrixAutoUpdate = true; liste.push(g); }
    const ab = await new GLTFExporter().parseAsync(liste, { binary: true, onlyVisible: true, maxTextureSize: 2048 });
    let s = ''; const u = new Uint8Array(ab); for (let i = 0; i < u.length; i += 32768) s += String.fromCharCode.apply(null, u.subarray(i, i + 32768)); return [btoa(s), garde.length, liste.length]; }, V);
  require('fs').writeFileSync(__dirname + '/blender/cour-1990.glb', Buffer.from(b64[0], 'base64')); console.log('EXPORT', b64[1], b64[2], b64[0].length);
  console.log('ERRS', JSON.stringify(errs.filter(e=>!/uv1|Failed to load|ERR_TUNNEL/.test(e)).slice(0, 4)));
  await b.close(); })();
