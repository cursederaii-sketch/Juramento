// ===== COMBATE VIVO (v8.55): el cuerpo se mueve al pelear =====
// Capa SOLO visual por envoltorios (no cambia daño, IA, colisiones ni red). Cargar AL FINAL, después de juice.js (envuelve drawP, drawE y update).
// Hasta ahora el cuerpo casi no se movía al atacar (3-4 px); aquí cada golpe tiene anticipación, embestida y recuperación:
//  JUGADOR   · ataque: se encoge y echa atrás al preparar, embiste con estiramiento e inclinación al golpear, rebota al recuperar
//            · destello en la punta del arma justo antes del tajo, líneas de velocidad, polvo bajo los pies y un empujón de cámara
//            · esquiva: estiramiento en la dirección del rodillo y estela de polvo
//            · herido: la cabeza se echa atrás con el golpe; guardia: se afirma con el escudo; combate: rebota esperando
//            · correr/andar: se inclina hacia delante
//  ENEMIGOS  · preparar: se encogen y retroceden (más marcado en jefes y brutos); golpear: embestida con estiramiento;
//              recuperar: vuelven con rebote; aturdido: se tambalea; golpeados: la cabeza cede y vibran mientras dura el hit-stop
//            · pisotón con polvo y anillo al golpear los jefes y brutos; en guardia se balancean en lugar de quedarse clavados
//            · al morir salen despedidos con un salto corto en la dirección del golpe
//  COMBOS    · cada ligero alterna el giro del torso (izquierda/derecha); el pesado levanta una onda de polvo delante
// Ajuste: CFG.cvivo (0 = apagado, 1 = normal, 2 = intenso) en Ajustes → Pantalla. Respeta CFG.shake (empujón de cámara) y PERF.lv (partículas).
(function () {
'use strict';
if (typeof drawP === 'undefined' || typeof drawE === 'undefined' || typeof update === 'undefined') return;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), eo = t => 1 - Math.pow(1 - t, 3);
const LV = [0, 1, 1.5];
const k0 = () => { const v = CFG.cvivo === undefined ? 1 : +CFG.cvivo; return LV[v] === undefined ? 1 : LV[v]; };
const lowQ = () => typeof PERF !== 'undefined' && PERF.lv >= 2;
const room = n => PT.length < 260 - n && !lowQ();
const CV = window.CVIVO = { compose: null };

// Compone el movimiento del cuerpo a partir de: f = embestida (-1 atrás … +1 adelante), co = encogimiento 0..1, dirección y tamaño.
// Devuelve desplazamiento, escala (estirar/aplastar) e inclinación (cizalla horizontal anclada a los pies).
function compose(f, co, ux, uy, big, K) {
  const ax = Math.abs(ux), ay = Math.abs(uy), st = Math.max(0, f), amp = 7 * big * K;
  return {
    ox: Math.round(ux * amp * f), oy: Math.round(uy * amp * .6 * f + co * 1.2 * K),
    sx: 1 + K * (co * .07 + st * (.12 * ax - .05 * ay)), sy: 1 - K * (co * .1 + st * (.07 * ax - .1 * ay)),
    lean: ux * (f > 0 ? f * .2 : f * .12) * K
  };
}
CV.compose = compose;
function wrap(x, y, c, fn) {
  g.save();
  try { g.translate(x + c.ox, y + c.oy); g.transform(c.sx, 0, -c.lean, c.sy, 0, 0); g.translate(-x, -y); fn(); }
  finally { g.restore(); }
}

// ---------------------------------------------------------------- jugador
function pCompose(p, K) {
  const w = WPN(), A = p.s === 'light' ? w.l.a : p.s === 'heavy' ? w.h.a : null, m = Math.hypot(p.ax, p.ay) || 1, ux = p.ax / m, uy = p.ay / m;
  if (A) {
    const hv = p.s === 'heavy', t = p.t; let f, co = 0;
    if (t < A[0]) { const u = clamp(t / A[0], 0, 1); f = -.55 * eo(u); co = u; }                          // anticipación: se encoge y se echa atrás
    else if (t < A[1] + .06) { const u = clamp((t - A[0]) / Math.max(.001, A[1] - A[0]), 0, 1); f = -.55 + 1.7 * eo(Math.min(1, u * 1.8)); }   // embestida
    else { const u = clamp((t - A[1] - .06) / .24, 0, 1); f = (1 - u) * (1 - u) * 1.1 - .12 * Math.sin(u * Math.PI); }                          // recuperación con rebote
    const c = compose(f, co, ux, uy, hv ? 1.5 : 1, K), par = p._cvc || 1;
    c.lean += par * .1 * Math.max(0, f) * K;                                                           // el torso gira a un lado u otro según el golpe del combo
    c.ox += Math.round(-uy * par * 2 * Math.max(0, f) * K);
    return c;
  }
  if (p.s === 'dodge') {
    let dx = p.dax !== undefined ? p.dax : (p.kx || p.fx || 0), dy = p.dax !== undefined ? p.day : (p.ky || p.fy || 0); const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
    return compose(1, 0, dx, dy, .15, K);                                                               // estiramiento en la dirección del rodillo, sin desplazar (el rodillo ya se mueve)
  }
  if (p.s === 'hit') { const k = clamp(1 - p.t / .3, 0, 1), s = p.kx > 0 ? 1 : p.kx < 0 ? -1 : 0; return { ox: Math.round(s * 2.5 * k * k * K), oy: 0, sx: 1, sy: 1, lean: s * .3 * k * K }; }   // juice.js ya aplasta; aquí solo retroceso e inclinación
  if (p.s === 'idle') {
    if (held.block && p.ex <= 0) return { ox: 0, oy: 0, sx: 1.03, sy: .96, lean: (p.fx || 0) * .09 * K };      // guardia afirmada
    if (p.mvg) return { ox: 0, oy: 0, sx: 1, sy: 1, lean: (p.fx || 0) * (p.run ? .1 : .05) * K };            // inclinación al andar/correr
    if (p._cvn < 110) { const b = Math.abs(Math.sin(TM * 6)); return { ox: 0, oy: -Math.round(b * .9 * K), sx: 1, sy: 1 + .015 * b * K, lean: (p.fx || 0) * .04 * K }; }   // rebote de combate
  }
  return null;
}
{ const d = drawP; drawP = function () {
  const p = P, K = k0();
  if (!K || !p || p.s === 'dead' || p.ax === undefined) return d.apply(this, arguments);
  let c = null; try { c = pCompose(p, K); } catch (e) {}
  if (!c) return d.apply(this, arguments);
  const self = this, args = arguments;
  wrap(p.x, p.y, c, () => d.apply(self, args));
  try {   // destello en la punta del arma justo antes del tajo
    const w = WPN(), A = p.s === 'light' ? w.l.a : p.s === 'heavy' ? w.h.a : null;
    if (A && p.t >= A[0] - .07 && p.t < A[0] + .03 && !lowQ()) {
      const hv = p.s === 'heavy', rho = hv ? 1.5 : 1.15, a0 = Math.atan2(p.ay, p.ax), ang = a0 - rho * 1.15, ox = p.x + (p.fx ? p.fx * 3 : (p.fy > 0 ? 6 : -6)) + c.ox, oy = p.y - 11 + c.oy,
        tx_ = ox + Math.cos(ang) * w.wl, ty_ = oy + Math.sin(ang) * w.wl, u = 1 - Math.abs(p.t - A[0] + .02) / .07, r = Math.max(0, (hv ? 6 : 4) * u * K);
      if (r > .5) { glow(tx_, ty_, r * 2.2, '255,250,220', .5 * u); g.fillStyle = '#fff'; g.fillRect(Math.round(tx_ - r), Math.round(ty_), Math.round(r * 2), 1); g.fillRect(Math.round(tx_), Math.round(ty_ - r), 1, Math.round(r * 2)); }
    }
  } catch (e) {}
}; }

// ---------------------------------------------------------------- enemigos
function eCompose(e, K) {
  const c = e.cur, big = e.b ? 1.6 : (e.t === 'brute' ? 1.3 : 1), sd = e.seed || 0;
  let ux = e.ax !== undefined ? e.ax : e.fx, uy = e.ay !== undefined ? e.ay : e.fy; const l = Math.hypot(ux, uy) || 1; ux /= l; uy /= l;
  if (e.jq > 0) {   // golpeado: la cabeza cede y vibra
    const k = clamp(e.jq / .22, 0, 1), m = e.jm || 1, jx = e.jx || 0;
    return { ox: Math.round(Math.sin(TM * 90) * 1.2 * k * m), oy: 0, sx: 1, sy: 1, lean: jx * .32 * k * m * K };   // juice.js ya aplasta; aquí vibra y cede la cabeza
  }
  if (e.s === 'wind' && e.wt) { const u = clamp(e.tm / e.wt, 0, 1); return compose(-.6 * eo(u), u, ux, uy, big, K); }
  if (e.s === 'act' && c) {
    const u = clamp(e.tm / Math.max(.01, c.a), 0, 1);
    if (c.proj) return compose(-.5 * (1 - u), 0, ux, uy, big, K);                                       // disparar/lanzar: retroceso
    return compose(-.6 + 1.8 * eo(Math.min(1, u * 2.2)), 0, ux, uy, big, K);                            // embestida
  }
  if (e.s === 'rec' && c) { const u = clamp(e.tm / Math.max(.01, c.r), 0, 1); return compose((1 - u) * (1 - u) * 1.05 - .1 * Math.sin(u * Math.PI), 0, ux, uy, big, K); }
  if (e.s === 'stg') return { ox: 0, oy: 0, sx: 1, sy: .94, lean: (-ux * .18 + Math.sin(e.tm * 55) * .06) * K };            // tambaleo
  if (e.mvg) return { ox: 0, oy: 0, sx: 1, sy: 1, lean: ux * .06 * K };
  if (e.aw) return { ox: 0, oy: -Math.round(Math.abs(Math.sin(TM * 4 + sd)) * .7 * K), sx: 1, sy: 1, lean: Math.sin(TM * 2.6 + sd) * .05 * K };   // en guardia
  return null;
}
{ const d = drawE; drawE = function (e) {
  const K = k0();
  if (K && e && e.s === 'dead' && e.tm < .34 && P) {   // muerte: sale despedido con un salto corto en la dirección del golpe
    const u = clamp(e.tm / .32, 0, 1), big = e.b ? 1.6 : (e.t === 'brute' ? 1.3 : 1);
    let jx = e.jx, jy = e.jy; if (jx === undefined) { jx = e.x - P.x; jy = e.y - P.y; const l = Math.hypot(jx, jy) || 1; jx /= l; jy /= l; }
    const push = eo(u) * 9 * big * K, hop = Math.sin(u * Math.PI) * 4 * big * K, self = this, args = arguments;
    g.save();
    try { g.translate(Math.round(jx * push), Math.round(jy * push * .5 - hop)); return d.apply(self, args); } finally { g.restore(); }
  }
  if (!K || !e || e.s === 'dead' || (e.cur && e.cur.tp && e.s === 'wind')) return d.apply(this, arguments);
  let c = null; try { c = eCompose(e, K); } catch (x) {}
  if (!c) return d.apply(this, arguments);
  const self = this, args = arguments;
  wrap(e.x, e.y, c, () => d.apply(self, args));
}; }

// ---------------------------------------------------------------- eventos por fotograma: polvo, líneas de velocidad, pisotones, empujón de cámara
const dust = (x, y, n, sp, col) => { if (!room(n)) return; for (let i = 0; i < n; i++) PT.push({ k: 'd', x: x + (R() - .5) * 8, y: y + 1, z: 2, vx: (R() - .5) * sp, vy: (R() - .5) * sp * .4, vz: 6 + R() * 12, l: .3 + R() * .25, c: col || 'rgba(190,180,170,.55)' }); };
const camKick = (x, y) => { if (!CFG.shake || lowQ() || !window.JUICE || !JUICE.kick) return; JUICE.kick.x += x; JUICE.kick.y += y; };
let pst = '', pk = 0, dT = 0;
function tick(dt) {
  if (!P || !W || G.mode !== 'play') return; const K = k0(); if (!K) return;
  // distancia al enemigo despierto más cercano (para el rebote de combate)
  let dn = 999; for (const e of E) if (e.aw && e.s !== 'dead' && !e.npc) { const d = Math.hypot(e.x - P.x, e.y - P.y); if (d < dn) dn = d; } P._cvn = dn;
  // jugador: golpe
  const w = WPN(), A = P.s === 'light' ? w.l.a : P.s === 'heavy' ? w.h.a : null;
  if (!A || P.t < A[0]) pk = 0;   // también se rearma al encadenar un golpe con otro sin pasar por reposo
  if (A && !pk && P.t >= A[0]) {
    pk = 1; const hv = P.s === 'heavy', m = Math.hypot(P.ax, P.ay) || 1, ux = P.ax / m, uy = P.ay / m;
    P._cvc = P._cvc === 1 ? -1 : 1;
    dust(P.x - ux * 6, P.y, hv ? 5 : 3, hv ? 50 : 32);
    if (hv) { dust(P.x + ux * 14, P.y + uy * 6, 5, 60); if (!lowQ()) FX.push({ k: 'ring', x: P.x + ux * 14, y: P.y + uy * 6 + 2, l: .28, m: .28, c: '220,205,180' }); }
    if (!lowQ()) FX.push({ k: 'jx', x: P.x - ux * 6, y: P.y - 10 - uy * 3, a: Math.atan2(-uy, -ux), n: hv ? 5 : 3, r: hv ? 22 : 16, c: '255,255,255', sp: .45, l: .16, m: .16 });
    camKick(ux * (hv ? 2.6 : 1.2) * K, uy * (hv ? 2.6 : 1.2) * .7 * K);
  }
  // esquiva: estela de polvo
  if (P.s === 'dodge') { dT -= dt; if (dT <= 0) { dT = .05; dust(P.x, P.y, 1, 26); } } else dT = 0;
  pst = P.s;
  // enemigos: pisotón al golpear
  for (const e of E) {
    if (e.s === 'act' && e.cur && e._cva !== e.cur) {
      e._cva = e.cur;
      if (!e.cur.proj && !e.cur.tp && (e.b || e.t === 'brute') && Math.hypot(e.x - P.x, e.y - P.y) < 260) {
        dust(e.x, e.y, e.b ? 8 : 5, e.b ? 70 : 48);
        if (!lowQ()) FX.push({ k: 'ring', x: e.x, y: e.y + 2, l: .3, m: .3, c: '190,170,150', big: e.b ? 1 : 0 });
        if (CFG.shake) G.shake = Math.max(G.shake || 0, e.b ? 2 * K : 1 * K);
      } else if (!e.cur.proj && !e.cur.tp) dust(e.x, e.y, 2, 28);
    } else if (e.s !== 'act') e._cva = null;
  }
}
{ const u = update; update = function (dt) { const r = u.apply(this, arguments); try { tick(dt); } catch (e) {} return r; }; }

// ---------------------------------------------------------------- ajuste en Ajustes → Pantalla
const NAME = ['Desactivada', 'Normal', 'Intensa'];
window.CVIVO.cycle = () => { CFG.cvivo = ((CFG.cvivo === undefined ? 1 : +CFG.cvivo) + 1) % 3; saveCfg(); openSettings(); };
if (typeof openSettings === 'function') {
  const o = openSettings; openSettings = function () {
    const r = o.apply(this, arguments), m = $('menu'), go = m && m.querySelector('#go'), card = m && m.querySelector('.card');
    if (!go || !card || card.querySelector('.cvv')) return r;
    const sc = m.scrollTop, v = CFG.cvivo === undefined ? 1 : +CFG.cvivo;
    go.insertAdjacentHTML('beforebegin', '<button class="oath cvv' + (v ? ' sel' : '') + '" onclick="CVIVO.cycle()"><b>Animación de combate</b>' + NAME[v] + '</button>');
    m.scrollTop = sc; return r;
  };
}
})();
