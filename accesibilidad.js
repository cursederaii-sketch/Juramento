// ===== ACCESIBILIDAD Y MODO FOTO =====
// Cargar justo antes de net.js. Solo ENVUELVE funciones (openSettings, openPause, draw, hud, drawE, drawP, takeHit, updE), no reescribe el motor.
//  · Daltonismo: filtro de color sobre el lienzo (protanopia, deuteranopia, tritanopia). Es una corrección aproximada, no un tratamiento clínico.
//  · Tamaño del texto: menús y diálogos (HTML) y los textos pequeños del juego (render.js lee window.TXK).
//  · Avisos de ataque con forma: los ataques enemigos se anuncian también con un símbolo, no solo con color.
//  · Ayudas de dificultad (opcionales, locales a cada jugador): menos daño recibido, más resistencia, más tiempo de aviso (solo en solitario).
//  · Modo foto: desde la pausa. Cámara libre, ocultar interfaz y personaje, captura PNG a 4x. En cooperativo el mundo sigue en marcha.
// Ajustes guardados en CFG (jur_cfg): cb, fsz, cues, adm, areg, awin.
(function () {
'use strict';
const ACC = window.ACC = {};
const CB = ['none', 'prot', 'deut', 'trit'], CBN = { none: 'Desactivado', prot: 'Protanopia (rojo)', deut: 'Deuteranopia (verde)', trit: 'Tritanopia (azul)' };
const FSZ = [1, 1.25, 1.5], ADM = [1, .75, .5, .25], AREG = [1, 1.5, 2], AWIN = [0, .25, .5];
const pick = (arr, v) => { const i = arr.indexOf(v); return i < 0 ? 0 : i; };
const get = (k, d) => (CFG[k] === undefined ? d : CFG[k]);
const coop = () => typeof NET !== 'undefined' && NET && NET.on;

// ---------------------------------------------------------------- daltonismo (filtro SVG)
// Machado 2009 (severidad 1) para simular la deficiencia S; la corrección es M = I + E·(I − S), con E que reparte el error hacia los canales que sí se perciben.
const SIM = {
  prot: [[.152286, 1.052583, -.204868], [.114503, .786281, .099216], [-.003882, -.048116, 1.051998]],
  deut: [[.367322, .860646, -.227968], [.280085, .672501, .047413], [-.01182, .04294, .968881]],
  trit: [[1.255528, -.076749, -.178779], [-.078411, .930809, .147602], [.004733, .691367, .3039]]
};
const ERR = {
  prot: [[0, 0, 0], [.7, 1, 0], [.7, 0, 1]], deut: [[0, 0, 0], [.7, 1, 0], [.7, 0, 1]], trit: [[1, 0, .7], [0, 1, .7], [0, 0, 0]]
};
function corr(k) {
  const S = SIM[k], E = ERR[k], I = [[1, 0, 0], [0, 1, 0], [0, 0, 1]], D = I.map((r, i) => r.map((v, j) => v - S[i][j])), M = [];
  for (let i = 0; i < 3; i++) { M[i] = []; for (let j = 0; j < 3; j++) { let s = I[i][j]; for (let t = 0; t < 3; t++) s += E[i][t] * D[t][j]; M[i][j] = s; } }
  return M.map(r => r.map(v => +v.toFixed(5)).join(' ') + ' 0 0').join(' ') + ' 0 0 0 1 0';
}
function buildFilters() {
  if (document.getElementById('acc-svg')) return;
  const s = document.createElement('div'); s.id = 'acc-svg'; s.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
  s.innerHTML = '<svg width="0" height="0" aria-hidden="true">' + ['prot', 'deut', 'trit'].map(k => '<filter id="acc-' + k + '" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="' + corr(k) + '"/></filter>').join('') + '</svg>';
  document.body.appendChild(s);
  const st = document.createElement('style'); st.id = 'acc-css';
  st.textContent = ['prot', 'deut', 'trit'].map(k => 'body.acc-' + k + ' #stage canvas{filter:url(#acc-' + k + ')}').join('\n')
    + '\n:root{--fs:1}'
    + '\n#menu:not(.tt) .card{zoom:var(--fs)}'
    + '\nbody.acc-fs #dlg p{font-size:calc(15px*var(--fs))}body.acc-fs #dlg button{font-size:calc(13px*var(--fs))}body.acc-fs #dlg>b{font-size:calc(11px*var(--fs))}'
    + '\nbody.photo #ui,body.photo #pause,body.photo #dlg{display:none!important}'
    + '\n#phb{position:fixed;z-index:60;left:50%;bottom:max(10px,env(safe-area-inset-bottom));transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:6px;max-width:96vw;font:8px "Press Start 2P",monospace;color:#e8e0ff}'
    + '\n#phb .r{display:flex;gap:6px;flex-wrap:wrap;justify-content:center}'
    + '\n#phb button{height:auto;min-height:34px;padding:8px 10px;font:8px "Press Start 2P",monospace;letter-spacing:0;color:#ffe9a0;background:rgba(10,6,20,.82);border:1px solid #c9a54a;border-radius:2px;cursor:pointer;touch-action:manipulation}'
    + '\n#phb button.off{opacity:.55;border-style:dashed}'
    + '\n#phb .h{background:rgba(5,3,10,.7);padding:4px 8px;border:1px solid #4a3a1e;text-align:center;line-height:1.6;pointer-events:none}'
    + '\n#phf{position:fixed;inset:0;z-index:59;background:#fff;opacity:0;pointer-events:none}'
    + '\n#phf.go{animation:phf .35s ease-out}@keyframes phf{0%{opacity:.85}100%{opacity:0}}';
  document.head.appendChild(st);
}

// ---------------------------------------------------------------- aplicar ajustes
const base = { regen: DIF.regen, regenBlock: DIF.regenBlock };
function applyAcc() {
  buildFilters();
  const b = document.body.classList, cb = CB.includes(CFG.cb) ? CFG.cb : 'none', fs = FSZ.includes(+CFG.fsz) ? +CFG.fsz : 1;
  for (const k of ['prot', 'deut', 'trit']) b.toggle('acc-' + k, cb === k);
  document.documentElement.style.setProperty('--fs', fs);
  b.toggle('acc-fs', fs > 1);
  window.TXK = fs;
  const rg = AREG.includes(+CFG.areg) ? +CFG.areg : 1;
  DIF.regen = base.regen * rg; DIF.regenBlock = base.regenBlock * rg;
}
ACC.apply = applyAcc;
ACC.cycle = k => {
  const L = { cb: CB, fsz: FSZ, adm: ADM, areg: AREG, awin: AWIN }[k], d = { cb: 'none', fsz: 1, adm: 1, areg: 1, awin: 0 }[k];
  CFG[k] = L[(pick(L, get(k, d)) + 1) % L.length]; saveCfg(); applyAcc(); openSettings();
};
ACC.toggle = k => { CFG[k] = CFG[k] ? 0 : 1; saveCfg(); applyAcc(); openSettings(); };

// ---------------------------------------------------------------- sección en Ajustes y botón en Pausa
{ const o = openSettings; openSettings = function () {
  const r = o.apply(this, arguments), m = $('menu'), card = m && m.querySelector('.card'), go = m && m.querySelector('#go'); if (!card || !go || card.querySelector('.acc')) return r;
  const sc = m.scrollTop;
  const btn = (t, v, k) => '<button class="oath acc" onclick="ACC.cycle(\'' + k + '\')"><b>' + t + '</b>' + v + '</button>';
  const pc = v => Math.round(v * 100) + '%';
  const wn = AWIN[pick(AWIN, get('awin', 0))];
  go.insertAdjacentHTML('beforebegin',
    '<h2 class="acc">Accesibilidad</h2>'
    + btn('Daltonismo', CBN[CB.includes(CFG.cb) ? CFG.cb : 'none'], 'cb')
    + btn('Tamaño del texto', pc(FSZ.includes(+CFG.fsz) ? +CFG.fsz : 1), 'fsz')
    + '<button class="oath acc' + (CFG.cues ? ' sel' : '') + '" onclick="ACC.toggle(\'cues\')"><b>Avisos de ataque con forma</b>' + (CFG.cues ? 'Activado' : 'Desactivado') + '</button>'
    + '<h2 class="acc">Ayudas de dificultad</h2>'
    + btn('Daño recibido', pc(ADM[pick(ADM, get('adm', 1))]), 'adm')
    + btn('Recuperación de resistencia', '×' + String(AREG[pick(AREG, get('areg', 1))]).replace('.', ','), 'areg')
    + btn('Tiempo de aviso de los enemigos', wn ? '+' + pc(wn) + (coop() ? ' (solo en solitario)' : '') : 'Normal', 'awin'));
  m.scrollTop = sc; return r;
} }
{ const o = openPause; openPause = function () {
  const r = o.apply(this, arguments), m = $('menu'), card = m && m.querySelector('.card'); if (!card || card.querySelector('.phbtn') || G.mode !== 'menu') return r;
  const save_ = [...card.querySelectorAll('button')].find(b => /Guardar/.test(b.textContent));
  const html = '<button class="oath phbtn" onclick="ACC.photo()"><b>Modo foto</b>Cámara libre, sin interfaz y captura' + (coop() ? ' (el mundo sigue en marcha)' : '') + '</button>';
  if (save_) save_.insertAdjacentHTML('beforebegin', html); else card.insertAdjacentHTML('beforeend', html);
  return r;
} }

// ---------------------------------------------------------------- ayudas: daño recibido y tiempo de aviso
{ const t = takeHit; takeHit = function (d, fx, fy) {
  const f = ADM[pick(ADM, get('adm', 1))];
  if (f < 1 && d > 0 && d < 900) d = Math.max(1, Math.round(d * f));   // las sentencias de un golpe (≥900) no se tocan
  return t.call(this, d, fx, fy);
} }
{ const u = updE; updE = function (e, dt) {
  const s0 = e.s, r = u.apply(this, arguments), w = AWIN[pick(AWIN, get('awin', 0))];
  if (w > 0 && !coop() && s0 !== 'wind' && e.s === 'wind' && e.wt) e.wt *= 1 + w;   // más margen para reaccionar
  return r;
} }

// ---------------------------------------------------------------- avisos de ataque con forma (además del color)
const isRed = e => !!(e.cur && (e.cur.unb || (window.CFLU && CFLU.rey && CFLU.rey.RED && e.id === 'rey' && e.b && CFLU.rey.RED.includes(e.cur))));
{ const d = drawE; drawE = function (e) {
  const r = d.apply(this, arguments);
  if (CFG.cues && e && e.s === 'wind' && e.cur && !e.cur.proj) {
    const h = e.b ? e.b.h : (TY[e.t] ? TY[e.t].h : 22), x = Math.round(e.x), y = Math.round(e.y - h - 14 - Math.max(0, e.lz || 0)), p = Math.min(1, e.tm / (e.wt || 1)), s = 4 + Math.round(p * 3);
    g.save(); g.lineJoin = 'miter'; g.lineWidth = 2; g.strokeStyle = '#000'; g.fillStyle = '#fff';
    g.beginPath();
    if (isRed(e)) { g.moveTo(x, y - s - 2); g.lineTo(x + s + 2, y); g.lineTo(x, y + s + 2); g.lineTo(x - s - 2, y); g.closePath(); g.stroke(); g.fill(); g.strokeStyle = '#000'; g.lineWidth = 2; g.beginPath(); g.moveTo(x - 3, y - 3); g.lineTo(x + 3, y + 3); g.moveTo(x + 3, y - 3); g.lineTo(x - 3, y + 3); g.stroke(); }
    else { g.moveTo(x, y - s); g.lineTo(x + s, y + s - 1); g.lineTo(x - s, y + s - 1); g.closePath(); g.stroke(); g.fill(); g.fillStyle = '#000'; g.fillRect(x - 1, y - 1, 2, 3); g.fillRect(x - 1, y + 3, 2, 1); }
    g.restore();
  }
  return r;
} }

// ---------------------------------------------------------------- modo foto
const PH = ACC.ph = { on: false, x: 0, y: 0, hud: true, pl: true, keys: {}, cap: 0, lt: 0, drag: null };
const menuShown = () => { const m = $('menu'); return !!m && m.style.display && m.style.display !== 'none'; };
function bar() {
  let el = $('phb'); if (!el) { el = document.createElement('div'); el.id = 'phb'; document.body.appendChild(el); const f = document.createElement('div'); f.id = 'phf'; document.body.appendChild(f); }
  el.style.display = 'flex';
  el.innerHTML = '<div class="h">' + (coop() ? 'El mundo sigue en marcha · ' : '') + 'Mover: flechas/WASD (Shift: rápido) o arrastra · C/Enter: foto · H: interfaz · J: personaje · Esc: salir</div>'
    + '<div class="r"><button data-a="cap">&#128247; Foto</button><button data-a="hud" class="' + (PH.hud ? '' : 'off') + '">Interfaz</button><button data-a="pl" class="' + (PH.pl ? '' : 'off') + '">Personaje</button><button data-a="out">Salir</button></div>';
  el.querySelectorAll('button').forEach(b => { b.onclick = () => act(b.dataset.a); b.addEventListener('keydown', e => e.preventDefault()); });
}
function act(a) {
  if (a === 'cap') PH.cap = 1;
  else if (a === 'hud') { PH.hud = !PH.hud; bar(); }
  else if (a === 'pl') { PH.pl = !PH.pl; bar(); }
  else if (a === 'out') endPhoto();
}
ACC.photo = function () {
  if (PH.on || !W || !P || G.mode !== 'menu') return;
  const m = $('menu'); m.style.display = 'none'; m.innerHTML = '';
  PH.on = true; PH.x = cam.x; PH.y = cam.y; PH.keys = {}; PH.lt = performance.now(); PH.drag = null; G.msgT = 0; G.banner = null;
  document.body.classList.add('photo'); bar();
};
function endPhoto(silent) {
  if (!PH.on) return; PH.on = false; PH.keys = {}; PH.drag = null;
  document.body.classList.remove('photo'); const el = $('phb'); if (el) el.style.display = 'none';
  if (!silent) closeM();
}
function snap() {
  const o = document.createElement('canvas'); o.width = GW * 4; o.height = GH * 4;
  const c = o.getContext('2d'); c.imageSmoothingEnabled = false; c.drawImage(cv, 0, 0, GW, GH, 0, 0, o.width, o.height);
  const f = $('phf'); if (f) { f.classList.remove('go'); void f.offsetWidth; f.classList.add('go'); }
  const z = n => String(n).padStart(2, '0'), t = new Date(), name = 'juramento-' + t.getFullYear() + z(t.getMonth() + 1) + z(t.getDate()) + '-' + z(t.getHours()) + z(t.getMinutes()) + z(t.getSeconds()) + '.png';
  o.toBlob(b => {
    if (!b) return;
    try {
      const file = new File([b], name, { type: 'image/png' });
      if (window.matchMedia && matchMedia('(pointer:coarse)').matches && navigator.canShare && navigator.canShare({ files: [file] })) { navigator.share({ files: [file], title: 'Juramento' }).catch(() => dl(b, name)); return; }
    } catch (e) {}
    dl(b, name);
  }, 'image/png');
}
function dl(b, name) { const u = URL.createObjectURL(b), a = document.createElement('a'); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000); }

addEventListener('keydown', e => {
  if (!PH.on) return; if (e.ctrlKey || e.metaKey || e.altKey) return;
  const k = e.key.toLowerCase(); e.preventDefault(); e.stopImmediatePropagation();
  if (e.repeat && !/^(arrow|[wasd]$)/.test(k)) return;
  if (k === 'escape') return endPhoto();
  if (k === 'c' || k === 'enter' || k === ' ') return act('cap');
  if (k === 'h') return act('hud');
  if (k === 'j') return act('pl');
  PH.keys[k] = 1; if (k === 'shift') PH.keys.shift = 1;
}, true);
addEventListener('keyup', e => { if (!PH.on) return; const k = e.key.toLowerCase(); delete PH.keys[k]; e.preventDefault(); e.stopImmediatePropagation(); }, true);
addEventListener('blur', () => { PH.keys = {}; });
{ const st = $('stage');
  st.addEventListener('pointerdown', e => { if (!PH.on || e.target.closest('#phb')) return; PH.drag = { x: e.clientX, y: e.clientY, id: e.pointerId }; try { st.setPointerCapture(e.pointerId); } catch (_) {} });
  st.addEventListener('pointermove', e => {
    if (!PH.on || !PH.drag || PH.drag.id !== e.pointerId) return;
    const r = (document.getElementById('cv2') || cv).getBoundingClientRect(), s = Math.min(r.width / GW, r.height / GH) || 1;
    PH.x -= (e.clientX - PH.drag.x) / s; PH.y -= (e.clientY - PH.drag.y) / s; PH.drag.x = e.clientX; PH.drag.y = e.clientY;
  });
  const up = e => { if (PH.drag && PH.drag.id === e.pointerId) PH.drag = null; };
  st.addEventListener('pointerup', up); st.addEventListener('pointercancel', up); }

{ const d = draw; draw = function () {
  if (!PH.on) return d.apply(this, arguments);
  if (menuShown()) { endPhoto(true); return d.apply(this, arguments); }    // se abrió otro menú (p. ej. la pausa con el mando): se sale sin más
  const now = performance.now(), dt = Math.min(.1, (now - PH.lt) / 1000); PH.lt = now;
  const K = PH.keys, sp = (K.shift ? 220 : 90) * dt;
  if (K.arrowleft || K.a) PH.x -= sp; if (K.arrowright || K.d) PH.x += sp; if (K.arrowup || K.w) PH.y -= sp; if (K.arrowdown || K.s) PH.y += sp;
  PH.x = cl(PH.x, 0, Math.max(0, W.cols * 16 - GW)); PH.y = cl(PH.y, 0, Math.max(0, W.rows * 16 - GH));
  cam.x = PH.x; cam.y = PH.y;
  const r = d.apply(this, arguments);
  if (PH.cap) { PH.cap = 0; snap(); }
  return r;
} }
{ const h = hud; hud = function () { if (PH.on && !PH.hud) return; return h.apply(this, arguments); } }
{ const p = drawP; drawP = function () { if (PH.on && !PH.pl) return; return p.apply(this, arguments); } }
{ const s = showTitle; showTitle = function () { if (PH.on) endPhoto(true); return s.apply(this, arguments); } }

applyAcc();
})();
