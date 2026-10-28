const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const c = await b.newContext({ viewport: { width: 1280, height: 760 }, hasTouch: false, serviceWorkers: 'block' });
  await c.route('**/__exp/GLTFExporter.js', r => r.fulfill({ contentType: 'application/javascript', body: fs.readFileSync(__dirname + '/GLTFExporter.patch.js', 'utf8') }));
  await c.route('**/__exp/TextureUtils.js', r => r.fulfill({ contentType: 'application/javascript', body: fs.readFileSync(__dirname + '/TextureUtils.patch.js', 'utf8') }));
  await c.route('**/three@0.160.0/**', r => r.fulfill({ contentType: 'application/javascript', body: fs.readFileSync(__dirname + '/dbgsrv/three.module.js', 'utf8') }));
  await c.route('**/modeles/nc/*.json*', r => r.fulfill({ status: 404, body: '' }));
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
  await E("(m.ambiance('jour'), 1)"); const LIEU = 'nc-' + process.env.LIEU; await E(`(m.allerAuLieu('${LIEU}'), 1)`); for (let k = 0; k < 60 && (await E("M.lieu")) !== LIEU; k++) await W(500); await W(8000);
  const etat = () => p.evaluate(async V => { const m = await import(V), M = m._etatMatrice(); const out = [];
    M.scene.traverse(o => { if (!o.isMesh || o.userData.ncI === undefined) return; let v = true; for (let q = o; q; q = q.parent) if (!q.visible) v = false;
      const ms = [].concat(o.material || []).map(x => x ? [x.visible, x.opacity, x.color && x.color.getHex(), x.emissive && x.emissive.getHex(), x.emissiveIntensity, x.map && x.map.uuid, x.map && x.map.offset.x.toFixed(3) + ',' + x.map.offset.y.toFixed(3), x.map && x.map.version].join('|') : '');
      let im = ''; if (o.isInstancedMesh) { im = o.count + ':' + Array.from(o.instanceMatrix.array.slice(0, 64)).map(x => x.toFixed(3)).join(','); }
      out[o.userData.ncI] = [v, o.matrixWorld.elements.map(x => x.toFixed(3)).join(','), ms.join('/'), im].join('#'); }); return out; }, V);
  const s1 = await etat(); await E("(m.ambiance('nuit'), 1)"); await W(3000); const s2 = await etat(); await E("(m.ambiance('jour'), 1)"); await W(5000); const s3 = await etat();
  const bouge = new Set(); for (let i = 0; i < s1.length; i++) if (s1[i] !== s2[i] || s1[i] !== s3[i]) bouge.add(i);
  console.log('MORCEAUX', s1.length, 'QUI BOUGENT', bouge.size);
  const b64 = await p.evaluate(async ([V, bougeL]) => { const m = await import(V), M = m._etatMatrice(); const { GLTFExporter } = await import('/__exp/GLTFExporter.js');
    const T = await import('/vendor/three.module.js?v=160'); const bouge = new Set(bougeL);
    M.scene.updateMatrixWorld(true);
    // (ce que la logique du lieu tient en main — portes, télés, sol à toucher… — et ce qui s'allume la nuit : reste au jeu)
    const tenus = new Set(), vus = new Set();
    const marquer = o => o.traverse(q => tenus.add(q));
    const fouiller = (v, d) => { if (!v || typeof v !== 'object' || vus.has(v) || d > 3) return; vus.add(v); if (v.isObject3D) { if (v !== M.scene) marquer(v); return; } if (v.isMaterial || v.isTexture || v.isBufferGeometry) return; for (const k of Object.keys(v)) { try { fouiller(v[k], d + 1); } catch (e) {} } };
    fouiller(M.L, 0); for (const c of M.cercles || []) if (c.g) marquer(c.g); if (M.repere) marquer(M.repere); for (const q of M.gens.values()) marquer(q.g);
    let n = 0; const statiques = [], cles = [], vv = new T.Vector3(), cleNC = o => { vv.setFromMatrixPosition(o.matrixWorld); const a = o.geometry && o.geometry.attributes && o.geometry.attributes.position; return (o.isInstancedMesh ? 'i' + o.count + ':' : '') + (a ? a.count : 0) + '|' + Math.round(vv.x * 50) + ',' + Math.round(vv.y * 50) + ',' + Math.round(vv.z * 50); }; const liste = []; const mm = new T.Matrix4(), mw = new T.Matrix4();
    M.scene.traverse(o => { if (!o.isMesh || o.userData.ncI === undefined) return; n++;
      let v = true; for (let q = o; q; q = q.parent) if (!q.visible) v = false; if (!v || tenus.has(o) || bouge.has(o.userData.ncI) || o.isSkinnedMesh || o.layers.mask !== 1) return;
      const mats = [].concat(o.material || []); if (!mats.length || mats.some(x => !x || x.visible === false || x.colorWrite === false || (x.transparent && x.opacity < .06) || x.isShaderMaterial)) return;
      if (o.isInstancedMesh) { for (let i = 0; i < Math.min(o.count, 6000); i++) { o.getMatrixAt(i, mm); mw.multiplyMatrices(o.matrixWorld, mm); const q = new T.Mesh(o.geometry, o.material); mw.decompose(q.position, q.quaternion, q.scale); liste.push(q); } }
      else { const q = new T.Mesh(o.geometry, o.material); o.matrixWorld.decompose(q.position, q.quaternion, q.scale); liste.push(q); }
      statiques.push(o.userData.ncI); cles.push(cleNC(o)); });
    const ab = await new GLTFExporter().parseAsync(liste, { binary: true, onlyVisible: true, maxTextureSize: 2048 });
    let s = ''; const u = new Uint8Array(ab); for (let i = 0; i < u.length; i += 32768) s += String.fromCharCode.apply(null, u.subarray(i, i + 32768)); return [s ? btoa(s) : '', JSON.stringify({ n, statiques: statiques.length, cles: [...new Set(cles)] }), liste.length]; }, [V, [...bouge]]);
  require('fs').writeFileSync(__dirname + '/blender/' + process.env.LIEU + '.json', b64[1]); console.log('STATIQUES', JSON.parse(b64[1]).statiques, 'sur', JSON.parse(b64[1]).n, 'objets exportés', b64[2]);
  require('fs').writeFileSync(__dirname + '/blender/' + process.env.LIEU + '-1990.glb', Buffer.from(b64[0], 'base64'));
  console.log('ERRS', JSON.stringify(errs.filter(e=>!/uv1|Failed to load|ERR_TUNNEL/.test(e)).slice(0, 4)));
  await b.close(); })();
