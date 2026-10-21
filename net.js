// ===== MULTIJUGADOR COOPERATIVO (2-4 jugadores) · capa de red =====
// Cargar el ÚLTIMO (después de mrdientes.js). Mismo estilo que ia.js/combate_souls.js: solo ENVUELVE funciones, no reescribe el motor.
//
// Modelo "anfitrión autoritativo":
//  · El ANFITRIÓN (jugador 0) ejecuta la simulación de siempre: enemigos, jefes, proyectiles, rocas, emboscadas, arenas.
//    Cada enemigo apunta al jugador vivo más cercano: durante su updE se cambia la global P por el jugador objetivo
//    (un "proxy" por cada invitado). Cuando un ataque enemigo alcanza a un proxy, el anfitrión NO aplica el daño:
//    se lo envía al invitado, que lo resuelve con su propia parada/esquiva (hurtP) y su propia vida.
//  · Los INVITADOS no simulan enemigos: dibujan "fantasmas" que llegan en instantáneas (~15/s, con deltas) y los golpean
//    como siempre; el daño ya calculado (con su arma, atributos y juramento) viaja al anfitrión, que lo aplica.
//  · Mundo compartido (anfitrión): región, enemigos, jefes vencidos, palancas, puertas, puzles, ciclo día/noche.
//  · Progreso propio (cada uno): almas, armas, atributos, reliquias, frascos, inventario y partida guardada.
// Mensajes: ver server/server.js. Todo mensaje de juego es {t:'g',k:<tipo>,...}.
(function () {
'use strict';
const NET = window.NET = { on: false, host: false, id: -1, ws: null, code: '', max: 4, name: '', ri: 0, sync: false, pl: {}, gp: {}, own: null, pend: null };
NET.ext = {}; NET.ev = {}; NET.speak = {};
NET.sub = (n, f) => (NET.ev[n] = NET.ev[n] || []).push(f);
const emit = (n, a) => (NET.ev[n] || []).forEach(f => { try { f(a); } catch (e) { console.error(e); } });
const COL = ['#7df9ff', '#ffe66d', '#7dff9a', '#ff9a6b'];
const GM = new Map();               // invitado: id de red -> fantasma enemigo
const SENT = new Map();             // anfitrión: id de red -> última clave enviada
let NID = 0, sacc = 0, shT = 0, shN = 0, shKey = '', inAcc = 0, inKey = '', inT = 0, fullNext = true;
const isCl = () => NET.on && !NET.host;
const isHo = () => NET.on && NET.host;
const send = o => { const w = NET.ws; if (w && w.readyState === 1) { o.t = 'g'; w.send(JSON.stringify(o)); } };
const sendTo = (id, o) => { o.to = id; send(o); };
const q1 = v => Math.round(v * 2) / 2, q2 = v => Math.round(v * 20) / 20, r1 = v => Math.round(v * 10) / 10;
const peers = () => Object.values(NET.pl);
NET.send = send; NET.sendTo = sendTo; NET.col = id => COL[id & 3];
NET.allIds = () => { const a = new Set([NET.id]); if (NET.host) peers().forEach(q => a.add(q.rid)); else Object.keys(NET.gp).forEach(k => a.add(+k)); return [...a].sort((x, y) => x - y); };
NET.nameOf = id => id === NET.id ? NET.name : (NET.host ? (NET.pl[id] && NET.pl[id].n) : (NET.gp[id] && NET.gp[id].n)) || ('Jugador ' + (id + 1));
const alive = q => q && q.s !== 'dead';
const unbl = e => !!(e && !e.proj && e.cur && (e.cur.unb || (window.CFLU && CFLU.rey && CFLU.rey.RED && e.id === 'rey' && e.b && CFLU.rey.RED.includes(e.cur)))) ? 1 : 0; // ataque rojo: no se para

// ---------------------------------------------------------------- estado de jugadores
function pState(p) {
  return [r1(p.x), r1(p.y), q2(p.fx), q2(p.fy), q2(p.ax), q2(p.ay), p.s, r1(p.t), Math.round(p.hp), p.mhp, p.mvg ? 1 : 0,
    (held.block && p.s === 'idle' && p.ex <= 0) ? 1 : 0, S.weapon, S.oath || '', p.ex > 0 ? 1 : 0];
}
function setP(q, a) {
  q.x = a[0]; q.y = a[1]; q.fx = a[2]; q.fy = a[3]; q.ax = a[4]; q.ay = a[5]; q.s = a[6]; q.t = a[7]; q.hp = a[8]; q.mhp = a[9];
  q.mvg = a[10]; q.blk = a[11]; q.w = a[12]; q.o = a[13]; q.ex = a[14]; q.tx = q.x; q.ty = q.y;
}
function mkProxy(id, n) {
  const x = P ? P.x : 0, y = P ? P.y : 0;
  return { rid: id, n, x, y, tx: x, ty: y, vx: x, vy: y, hw: 5, hh: 3, fx: 0, fy: 1, ax: 0, ay: 1, hp: 100, mhp: 100, st: 100, mst: 100, sd: 0, s: 'idle', t: 0, hd: false,
    ex: 0, bt: 0, dd: { x: 0, y: 1 }, bonus: 0, kx: 0, ky: 0, mvg: 0, cnt: 0, hits: 0, sk: 0, skT: 0, sf: 0, rv: 0, safe: { x, y }, wasD: false, cr: 0, blk: 0, w: 'corta', o: '' };
}
function remotes() { return isHo() ? peers() : Object.values(NET.gp); }
function smooth(dt) {
  const k = Math.min(1, dt * 16);
  for (const o of remotes()) {
    if (o.vx === undefined || Math.hypot(o.tx - o.vx, o.ty - o.vy) > 48) { o.vx = o.tx; o.vy = o.ty; }
    o.vx += (o.tx - o.vx) * k; o.vy += (o.ty - o.vy) * k; if (o.s !== 'dead') o.t += dt;
  }
}

// ---------------------------------------------------------------- instantáneas del anfitrión
function curKey(e) {
  if (e.cur !== e._cc) { e._cc = e.cur; e._ck = null; if (e.cur) for (const k in ATK) if (ATK[k] === e.cur) { e._ck = k; break; } }
  return e._ck;
}
function curRaw(c) { const o = {}; for (const k of ['w', 'a', 'r', 'd', 'rng', 'sd', 'mv', 'aoe', 'proj', 'tp']) if (typeof c[k] === 'number' || c[k] === true) o[k] = c[k]; return o; }
function rec(e) {
  const r = { i: e.nid, t: e.t, x: q1(e.x), y: q1(e.y), fx: q2(e.fx), fy: q2(e.fy), hp: e.hp, mh: e.mhp, s: e.s, ph: e.ph | 0, aw: e.aw ? 1 : 0,
    mv: e.mvg ? 1 : 0, el: e.el ? 1 : 0, rp: e.rip ? 1 : 0, ad: e.ad ? 1 : 0, wt: r1(e.wt || 0), sg: r1(e.stgT || 0) };
  if (e.id) r.b = e.id;
  const k = curKey(e); if (k) r.c = k; else if (e.cur) r.cu = curRaw(e.cur);
  if (e.ax !== undefined) { r.ax = q2(e.ax); r.ay = q2(e.ay); }
  return r;
}
function snapshot(full) {
  const u = [], rm = [], kl = [], seen = new Set();
  for (const e of E) {
    if (!e.nid) e.nid = ++NID; seen.add(e.nid);
    const r = rec(e), key = JSON.stringify(r);
    if (full || SENT.get(e.nid) !== key) { if (!full) SENT.set(e.nid, key); r.tm = r1(e.tm); u.push(r); }
    if (full) SENT.set(e.nid, key);
    if (e.s === 'dead' && !e.kd) { e.kd = 1; kl.push([e.nid, e.nwp ? 1 : 0]); }
  }
  if (!full) for (const id of SENT.keys()) if (!seen.has(id)) { rm.push(id); SENT.delete(id); }
  const p = [[0, NET.name, ...pState(P)]];
  for (const q of peers()) p.push([q.rid, q.n, r1(q.x), r1(q.y), q.fx, q.fy, q.ax, q.ay, q.s, q.t, q.hp, q.mhp, q.mvg, q.blk, q.w, q.o, q.ex]);
  return { k: 's', fl: full ? 1 : 0, u, r: rm, kl, p, bo: G.bossOn ? 1 : 0,
    pr: PR.map(q => [r1(q.x), r1(q.y), r1(q.vx), r1(q.vy), q.c]), rk: RK.map(r => [r1(r.x), r1(r.y), r1(r.t)]) };
}
function shState() {
  const z = {}; for (const q of W.pzs) z[q.id] = [q.lit, q.prog];
  return { k: 'sh', bk: S.bk, lv: S.lv, dl: S.dl, pz: S.pz, rv: S.rv, am: S.am, clk: S.clk, nt: S.night ? 1 : 0, zl: z };
}
let snapKey = '', snapT = 0;
function sendSnap(full) {
  const s = snapshot(full);
  // sin cambios en enemigos, muertes, proyectiles ni jugadores (el reloj de animación de los jugadores, índice 9, no cuenta: cada cliente lo avanza solo)
  const idle = !full && !s.u.length && !s.r.length && !s.kl.length;
  const key = JSON.stringify([s.p.map(a => a.map((v, i) => i === 9 ? 0 : v)), s.pr, s.rk, s.bo]), now = performance.now();
  if (idle && key === snapKey && now - snapT < 1000) return;
  snapKey = key; snapT = now; send(s);
}
function sendSh(to) { if (!W) return; const o = shState(); if (to != null) sendTo(to, o); else send(o); }
function bcRegion(to) {
  const o = { k: 'reg', ri: S.ri, hx: P.x, hy: P.y };
  if (to != null) sendTo(to, o); else send(o);
}

// ---------------------------------------------------------------- anfitrión: objetivos, daño remoto, disparadores
function pickTarget(e) {
  const real = P; let best = alive(real) ? real : null, bd = best ? Math.hypot(e.x - real.x, e.y - real.y) : 1e9;
  for (const q of peers()) if (alive(q)) { const d = Math.hypot(e.x - q.x, e.y - q.y); if (d < bd) { bd = d; best = q; } }
  const cur = e.tg;
  if (cur && alive(cur) && (cur === real || NET.pl[cur.rid] === cur)) { const dc = Math.hypot(e.x - cur.x, e.y - cur.y); if (dc <= bd * 1.3 + 8) return cur; }
  return e.tg = best || real;
}
function applyRemoteHit(pid, m) {
  const e = E.find(x => x.nid === m.i), pp = NET.pl[pid]; if (!e || !pp || e.s === 'dead') return;
  const d = Math.max(0, Math.min(2500, Math.round(+m.d || 0))), kb = Math.max(0, Math.min(60, +m.kb || 0));
  if (!e.aw) wake(e);
  e.hp -= d; e.fl = .12; e.aw = true;
  const l = Math.hypot(e.x - pp.x, e.y - pp.y) || 1;
  W.move(e, (e.x - pp.x) / l * kb, (e.y - pp.y) / l * kb, e.hw, e.hh);
  if (e.arena && W.arena) { const a = W.arena; e.x = cl(e.x, (a.x + 1) * 16, (a.x + a.w - 1) * 16); e.y = cl(e.y, (a.y + 1) * 16, (a.y + a.h - 1) * 16); }
  spark(e.x, e.y, m.rp ? '#ffe66d' : '#fff', m.rp ? 16 : 8, 12); ftext(e.x, e.y - 26, d, m.rp ? '#ffe66d' : '#fff');
  if (e.hp <= 0) {
    e.hp = 0; e.s = 'dead'; e.tm = 0; onKill(e);
    for (let i = 0; i < 10; i++) PT.push({ k: 'soul', x: e.x, y: e.y, z: 10 + R() * 8, vx: (R() - .5) * 60, vy: (R() - .5) * 40, vz: 30 + R() * 50, l: 1.6, c: '#c08cff', h: 1 });
    if (e.b) bossDown(e); return;
  }
  const arm = (e.b && e.ph >= 1) || (TY[e.t] && TY[e.t].arm);
  if (m.rp) { e.s = 'stg'; e.tm = 0; e.stgT = .7; }
  else if (m.hv && !arm) { e.s = 'stg'; e.tm = 0; e.stgT = .45; }
  else if (!e.b && !arm && e.s === 'wind' && m.hv) { e.s = 'stg'; e.tm = 0; e.stgT = .3; }
}
function remoteTriggers() { // arenas y emboscadas que activa un invitado
  for (const q of peers()) {
    if (!alive(q)) continue;
    if (W.arena && AB() && !S.bk[AB()] && !G.bossOn) {
      const a = W.arena;
      if (q.x > (a.x + 2) * 16 && q.x < (a.x + a.w - 1) * 16 && q.y > (a.y + 1.5) * 16 && q.y < (a.y + a.h - 1) * 16) { if (rg.waves) startWaves(); else startBoss(); return; }
    }
    if (!G.amb) for (const a of W.ambs) { if (S.am[a.id]) continue; if (q.x > a.x * 16 && q.x < (a.x + a.w) * 16 && q.y > a.y * 16 && q.y < (a.y + a.h) * 16) { startAmb(a); return; } }
  }
}
function remoteHazards(dt) { // proyectiles y rocas que alcanzan a invitados (el motor solo mira a la P del anfitrión)
  for (const q of PR) {
    if (q.k) continue; const nx = q.x + q.vx * dt, ny = q.y + q.vy * dt;
    for (const p of peers()) if (alive(p) && Math.hypot(nx - p.x, ny - p.y) < 7) { q.k = 1; sendTo(p.rid, { k: 'hit', d: q.d, ex: q.x - q.vx * .1, ey: q.y - q.vy * .1, pj: 1, en: 0 }); break; }
  }
  for (const r of RK) {
    if (r.nt || r.t + dt < 1) continue; r.nt = 1;
    for (const p of peers()) if (alive(p) && Math.hypot(p.x - r.x, p.y - r.y) < 14) sendTo(p.rid, { k: 'th', d: 20, fx: p.x - r.x, fy: p.y - r.y, rock: 1 });
  }
}
function hostMsg(m) {
  const pid = m.from, q = NET.pl[pid];
  switch (m.k) {
    case 'in': if (q && Array.isArray(m.a)) setP(q, m.a); break;
    case 'dmg': if (q) applyRemoteHit(pid, m); break;
    case 'parry': { const e = E.find(x => x.nid === m.i); if (e && e.s !== 'dead') { e.s = 'stg'; e.tm = 0; e.stgT = 1.1; e.rip = true; } break; }
    case 'rs': if (q) { sendSh(pid); sendTo(pid, snapshot(true)); } break;
    case 'act':
      if (m.f === 'pull') { const l = W.levers.find(x => x.id === m.id); if (l && !S.lv[rg.id + ':' + l.id]) pull(l); }
      else if (m.f === 'ld') { const d = W.lds.find(x => x.id === m.id); if (d && !S.dl[d.id]) { const had = S.keys[d.key]; S.keys[d.key] = 1; openLd(d); if (!had) delete S.keys[d.key]; } }
      else if (m.f === 'lt') { const z = W.pzs.find(x => x.id === m.z), t = z && z.t.find(x => x.i === m.i); if (z && t && !S.pz[z.id]) lightT(z, t); }
      break;
    default: if (NET.ext[m.k]) NET.ext[m.k](m);
  }
}
function addPeer(id, n) {
  NET.pl[id] = mkProxy(id, n); info(); toast(n + ' se une a la sala');
  if (W) { sendSh(id); bcRegion(id); sendTo(id, snapshot(true)); }
  emit('peer+', id);
}
function dropPeer(id) { const q = NET.pl[id]; if (!q) return; delete NET.pl[id]; E.forEach(e => { if (e.tg === q) e.tg = null; }); info(); toast(q.n + ' abandona la sala'); emit('peer-', id); }

// ---------------------------------------------------------------- invitado: fantasmas, instantáneas, avisos
function upsert(r) {
  let e = GM.get(r.i);
  if (!e) { e = mk(r.t, r.x, r.y, r.b); e.nid = r.i; e.x = r.x; e.y = r.y; GM.set(r.i, e); E.push(e); }
  else if (E.indexOf(e) < 0) return;
  if (e.hp > r.hp && r.s !== 'dead') e.fl = .12;
  const ch = e.s !== r.s || (r.tm !== undefined && e.wt !== r.wt);
  e.tx = r.x; e.ty = r.y; e.fx = r.fx; e.fy = r.fy; e.hp = r.hp; e.mhp = r.mh; e.s = r.s; e.ph = r.ph; e.aw = !!r.aw; e.mvg = r.mv; e.el = r.el; e.rip = !!r.rp; e.ad = r.ad; e.wt = r.wt; e.stgT = r.sg;
  if (r.ax !== undefined) { e.ax = r.ax; e.ay = r.ay; }
  e.cur = r.c ? ATK[r.c] : (r.cu || null);
  if (ch && r.tm !== undefined) e.tm = r.tm;
}
function applySnap(m) {
  if (m.fl) { GM.clear(); E.length = 0; }
  for (const r of m.u) upsert(r);
  for (const id of m.r) { const g0 = GM.get(id); if (g0) { const i = E.indexOf(g0); if (i >= 0) E.splice(i, 1); GM.delete(id); } }
  const ids = new Set();
  for (const a of m.p) {
    const id = a[0]; if (id === NET.id) continue; ids.add(id);
    let o = NET.gp[id]; if (!o) o = NET.gp[id] = { id, n: a[1], tx: 0, ty: 0 };
    o.n = a[1]; o.tx = a[2]; o.ty = a[3]; o.fx = a[4]; o.fy = a[5]; o.ax = a[6]; o.ay = a[7]; o.s = a[8]; o.t = a[9]; o.hp = a[10]; o.mhp = a[11]; o.mvg = a[12]; o.blk = a[13]; o.w = a[14]; o.o = a[15]; o.ex = a[16];
  }
  for (const id in NET.gp) if (!ids.has(+id)) delete NET.gp[id];
  PR = m.pr.map(a => ({ x: a[0], y: a[1], vx: a[2], vy: a[3], c: a[4], age: 0, d: 0 }));
  RK = m.rk.map(a => ({ x: a[0], y: a[1], t: a[2] }));
  const bo = !!m.bo; if (bo !== G.bossOn) { G.bossOn = bo; if (W) W.setGate(bo); }
  for (const [id, sk] of m.kl) { // muertes: todos cobran almas (los invocados que mueren al caer el jefe no cuentan)
    const g0 = GM.get(id); if (!g0 || sk) continue;
    g0.s = 'dead'; g0.hp = 0; onKill(g0);
    if (g0.b) { bossDown(g0); NET.own && (NET.own.bk[g0.id] = 1); }
  }
  info();
}
function applySh(m) {
  if (!S) return;
  const ch = ['lv', 'dl', 'pz', 'rv'].some(k => JSON.stringify(S[k] || {}) !== JSON.stringify(m[k])), rvCh = JSON.stringify(S.rv || {}) !== JSON.stringify(m.rv);
  S.bk = Object.assign({}, m.bk); S.lv = m.lv; S.dl = m.dl; S.pz = m.pz; S.rv = m.rv; S.am = m.am; S.clk = m.clk; S.night = m.nt;
  if (W) {
    for (const z of W.pzs) { const a = m.zl[z.id]; if (a) { z.lit = a[0]; z.prog = a[1]; } }
    if (ch) { W.applyState(); if (rvCh) { W.applyDyn(); W.bake(); } }
  }
}
function applyReg(m) {
  NET.ri = m.ri; NET.sync = true;
  try { loadRegion(m.ri, 0); } finally { NET.sync = false; }
  GM.clear(); E.length = 0; PR = []; RK = [];
  const ox = (NET.id * 14) - 14; let x = m.hx + ox, y = m.hy + 10;
  if (typeof IA !== 'undefined' && IA.freeSpot) { const f = IA.freeSpot(x, y, P.hw, P.hh); if (f) { x = f.x; y = f.y; } }
  P.x = x; P.y = y; P.safe = { x, y }; cam.x = cl(P.x - GW / 2, 0, W.cols * 16 - GW); cam.y = cl(P.y - GH / 2, 0, W.rows * 16 - GH);
  send({ k: 'rs' });
}
function clientMsg(m) {
  switch (m.k) {
    case 'sh': applySh(m); break;
    case 'reg': applyReg(m); break;
    case 's': if (W) applySnap(m); break;
    case 'hit': { if (!P || P.s === 'dead' || G.mode === 'title') break; const e = { x: m.ex, y: m.ey, proj: m.pj ? 1 : 0, s: '', tm: 0, nid: m.en }; if (m.ub) e.cur = { unb: 1 }; hurtP(m.d, e); if (e.s === 'stg' && m.en) send({ k: 'parry', i: m.en }); break; }
    case 'th': { if (!P || P.s === 'dead' || G.mode === 'title') break; if (m.rock && dodging()) break; takeHit(m.d, m.fx, m.fy); break; }
    default: if (NET.ext[m.k]) NET.ext[m.k](m);
  }
}
function sendIn(dt) {
  // Estado del invitado a 10 Hz: mantiene la interpolación y reduce el consumo de cuota en servicios gratuitos.
  inAcc += dt; if (inAcc < .1 || !P) return;
  const a = pState(P), k = JSON.stringify(a.map((v, i) => i === 7 ? 0 : v)), now = performance.now();   // índice 7 = reloj de animación
  if (k === inKey && now - inT < 1000) return;                                                      // quieto: solo un latido por segundo
  inAcc = 0; inKey = k; inT = now; send({ k: 'in', a });
}

// ---------------------------------------------------------------- enganches al motor
const _up = update;
update = function (dt) {
  if (!NET.on || !W || !P) return _up.call(this, dt);
  return NET.host ? hostUpdate.call(this, dt) : clientUpdate.call(this, dt);
};
function hostUpdate(dt) {
  smooth(dt);
  const np = peers().length, gm = G.mode;
  const force = np > 0 && (gm === 'menu' || gm === 'dlg') && !window.__cine;
  if (force) { // los menús y diálogos del anfitrión no congelan a los demás
    for (const k in held) held[k] = 0; for (const k in buf) buf[k] = 0; joy.on = false; joy.x = joy.y = 0; G.mode = 'play';
  }
  if (np > 0 && G.mode === 'play' && !(G.hs > 0)) { remoteTriggers(); remoteHazards(dt); }
  _up.call(this, dt);
  if (force && G.mode === 'play') G.mode = gm;
  if (np > 0) {
    sacc += dt; shT += dt;
    // Coste en Cloudflare: cada mensaje que entra al Durable Object cuenta como 1/20 de request. 15 Hz solo cuando hay acción
    // (enemigos despiertos, proyectiles, rocas, jefe); en calma baja a 8 Hz y, si nada cambió, no se envía nada salvo un latido por segundo.
    const calm = !G.bossOn && !PR.length && !RK.length && !E.some(e => e.aw && e.s !== 'dead');
    if (sacc >= (calm ? 1 / 8 : 1 / 15)) { sacc = 0; const full = fullNext; fullNext = false; sendSnap(full); }
    if (shT >= 1) { shT = 0; const k = JSON.stringify(Object.assign(shState(), { clk: 0 })); if (k !== shKey || ++shN >= 5) { shKey = k; shN = 0; sendSh(); } }
  } else fullNext = true;
}
function clientUpdate(dt) {
  smooth(dt);
  const k = Math.min(1, dt * 14);
  for (const e of E) {
    if (e.tx !== undefined) { if (Math.hypot(e.tx - e.x, e.ty - e.y) > 60) { e.x = e.tx; e.y = e.ty; } else { e.x += (e.tx - e.x) * k; e.y += (e.ty - e.y) * k; } }
    e.tm += dt; e.fl -= dt;
  }
  const spr = PR, srk = RK; PR = []; RK = [];
  try { _up.call(this, dt); } finally { PR = spr; RK = srk; }
  for (const q of PR) { q.x += q.vx * dt; q.y += q.vy * dt; }
  for (const r of RK) r.t += dt;
  sendIn(dt);
}
{ const u0 = updE; updE = function (e, dt) {
  if (!NET.on) return u0.call(this, e, dt);
  if (!NET.host) return;                                   // invitado: los fantasmas los mueve la instantánea
  if (!peers().length) return u0.call(this, e, dt);
  const real = P, tg = pickTarget(e), s0 = e.s, hd0 = e.hd;
  if (tg === real) u0.call(this, e, dt);
  else { P = tg; try { u0.call(this, e, dt); } finally { P = real; } }
  sweep(e, s0, hd0, tg);
} }
// El motor solo mira al objetivo del enemigo: un golpe de área (o un tajo ancho de jefe) no tocaba a los demás aunque estuvieran dentro.
// Aquí se repite la misma prueba de alcance del motor para el resto de jugadores, una vez por ataque y jugador. Los proyectiles ya los resuelve remoteHazards.
function sweep(e, s0, hd0, tg) {
  const c = e.cur;
  if (e.s !== 'act' || !c || c.proj || c.tp) { e._hs = null; return; }
  if (s0 !== 'act' || !e._hs) e._hs = new Set();      // ataque nuevo
  const hs = e._hs, tid = tg === P ? 0 : tg.rid;
  if (s0 === 'act' && !hd0 && e.hd) hs.add(tid);       // el objetivo ya recibió el golpe
  const d = Math.round(c.d * (e.dm || 1));
  for (const o of [P].concat(peers())) {
    if (o === tg || !alive(o)) continue;
    const id = o === P ? 0 : o.rid; if (hs.has(id)) continue;
    const rx = o.x - e.x, ry = o.y - e.y, dd = Math.hypot(rx, ry) || 1;
    if (dd >= c.rng + 7) continue;
    if (!c.aoe && !((rx * e.fx + ry * e.fy) / dd > .2 || dd < 10)) continue;
    hs.add(id);
    if (o === P) hurtP(d, e); else sendTo(o.rid, { k: 'hit', d, ex: e.x, ey: e.y, pj: 0, en: e.nid || 0, ub: unbl(e) });
  }
}
{ const h = hurtP; hurtP = function (d, e) {
  if (isHo() && P && P.rid !== undefined) { sendTo(P.rid, { k: 'hit', d, ex: e.x, ey: e.y, pj: e.proj ? 1 : 0, en: e.nid || 0, ub: unbl(e) }); return; }
  return h.apply(this, arguments);
} }
{ const t = takeHit; takeHit = function (d, fx, fy) {
  if (isHo() && P && P.rid !== undefined) { sendTo(P.rid, { k: 'th', d, fx, fy }); return; }
  return t.apply(this, arguments);
} }
{ const h = hitE; hitE = function (e, d, kb, hv) { // invitado: el daño se calcula aquí y se aplica en el anfitrión
  if (!(isCl() && e && e.nid)) return h.apply(this, arguments);
  const rp = e.s === 'stg' && e.rip, hp0 = e.hp, mh0 = e.mhp, BIG = 1e9; let dealt = 0, r;
  e.hp = BIG; e.mhp = BIG;
  try { r = h.call(this, e, d, kb, hv); } finally { dealt = BIG - e.hp; e.hp = Math.max(1, hp0 - dealt); e.mhp = mh0; }
  if (dealt > 0) send({ k: 'dmg', i: e.nid, d: Math.round(dealt), kb, hv: hv ? 1 : 0, rp: rp ? 1 : 0 });
  return r;
} }
{ const m0 = mk; mk = function (t, x, y, id) { // más vida con más jugadores
  const e = m0.apply(this, arguments), n = isHo() ? peers().length : 0;
  if (n > 0) { const f = e.b ? 1 + .6 * n : 1 + .25 * n; e.mhp = e.hp = Math.round(e.mhp * f); }
  return e;
} }
{ const b0 = bossDown; bossDown = function (e) { if (isHo()) for (const x of E) if (x !== e && x.s !== 'dead') x.nwp = 1; return b0.apply(this, arguments); } }
{ const l0 = loadRegion; loadRegion = function (i, fi, at) {
  if (isCl() && !NET.sync) { // el invitado no viaja: sigue al anfitrión
    if (i !== NET.ri) toast('Solo el anfitrión guía el camino');
    fi = (S.bf && S.bf.r === NET.ri) ? S.bf.x : 0; i = NET.ri; at = null;
  }
  const r = l0.call(this, i, fi, at);
  if (isCl()) { GM.clear(); E.length = 0; PR = []; RK = []; if (!NET.sync) send({ k: 'rs' }); }
  if (isHo()) { NET.ri = S.ri; SENT.clear(); fullNext = true; for (const q of peers()) { q.x = q.tx = q.vx = P.x; q.y = q.ty = q.vy = P.y; } if (peers().length) { sendSh(); bcRegion(); } }
  return r;
} }
for (const n of ['startBoss', 'startWaves', 'startAmb', 'startChase', 'go', 'door']) {
  const f0 = window[n]; if (typeof f0 !== 'function') continue;
  window[n] = function () { if (isCl()) { if (n === 'go' || n === 'door') toast('Solo el anfitrión guía el camino'); return; } return f0.apply(this, arguments); };
}
{ const s0 = spawnEn; spawnEn = function () { if (isCl()) return; return s0.apply(this, arguments); } }
{ const p0 = pull; pull = function (l) { if (isCl()) { send({ k: 'act', f: 'pull', id: l.id }); toast('Accionas la palanca...'); return; } return p0.apply(this, arguments); } }
{ const o0 = openLd; openLd = function (d) {
  if (isCl()) { if (S.keys[d.key]) { send({ k: 'act', f: 'ld', id: d.id }); toast('Usas la ' + KEYN[d.key]); } else toast(d.lbl || 'Está cerrado. Necesitas la ' + KEYN[d.key]); return; }
  return o0.apply(this, arguments);
} }
{ const l0 = lightT; lightT = function (z, t) { if (isCl()) { send({ k: 'act', f: 'lt', z: z.id, i: t.i }); return; } return l0.apply(this, arguments); } }
// el invitado guarda SU progreso: lo compartido del anfitrión (palancas, puertas, jefes de la sala) no se escribe en su partida
{ const si = Storage.prototype.setItem; Storage.prototype.setItem = function (k, v) {
  if (isCl() && NET.own && /^jur_s2/.test(k)) { try { const o = JSON.parse(v); Object.assign(o, NET.own); v = JSON.stringify(o); } catch (e) {} }
  return si.call(this, k, v);
} }

// ---------------------------------------------------------------- dibujo: jugadores remotos y equipo
window.netDrawPlayers = function (Dr, Lt, cx, cy) {
  if (!NET.on) return;
  for (const o of remotes()) {
    if (o.vx === undefined || o.fx === undefined) continue;
    Dr.push({ y: o.vy, f: () => drawGhost(o) });
    Lt.push({ x: o.vx - cx, y: o.vy - cy - 14, r: 50, i: .45, c: '140,170,255', a: .06 });
  }
};
function drawGhost(o) {
  const d = o.d || (o.d = { hw: 5, hh: 3, hd: true, st: 100, mst: 100, bt: 0, cnt: 0, sk: 0, kx: 0, ky: 0 });
  d.x = o.vx; d.y = o.vy; d.fx = o.fx; d.fy = o.fy; d.ax = o.ax; d.ay = o.ay; d.s = o.s; d.t = o.t; d.hp = o.hp; d.mhp = o.mhp; d.mvg = o.mvg; d.ex = o.ex ? 1 : 0;
  const sp = P, sw = S.weapon, so = S.oath, sb = held.block;
  P = d; S.weapon = WP[o.w] ? o.w : sw; S.oath = o.o || ''; held.block = o.blk ? 1 : 0;
  try { drawP(); } catch (e) {} finally { P = sp; S.weapon = sw; S.oath = so; held.block = sb; }
  const id = o.id !== undefined ? o.id : o.rid, c = COL[id & 3];
  tx(o.n || '', Math.round(o.vx), Math.round(o.vy) - 36, c, 'center', 5);
  if (NET.speak[id]) fr(Math.round(o.vx) - 2, Math.round(o.vy) - 47, 4, 4, '#7dff9a');
  if (o.s !== 'dead') { const w = 22, v = cl(o.hp / (o.mhp || 1), 0, 1); fr(o.vx - w / 2 - 1, o.vy - 33, w + 2, 4, '#000'); fr(o.vx - w / 2, o.vy - 32, Math.round(w * v), 2, '#e8475c'); }
}
{ const h0 = hud; hud = function () {
  h0.apply(this, arguments);
  if (!NET.on || !P) return;
  const list = remotes().map(o => ({ n: o.n, id: o.id !== undefined ? o.id : o.rid, hp: o.hp, mhp: o.mhp })).sort((p, q) => p.id - q.id);
  let y = 76; for (const q of list) {
    const w = 54;
    fr(4, y, 5, 5, COL[q.id & 3]); tx(q.n, 12, y + 5, '#e8e0ff', 'left', 5); if (NET.speak[q.id]) fr(4, y + 7, 5, 4, '#7dff9a'); fr(11, y + 7, w + 2, 4, '#000'); fr(12, y + 8, Math.round(w * cl(q.hp / (q.mhp || 1), 0, 1)), 2, q.hp > 0 ? '#e8475c' : '#555'); y += 15;
  }
} }
{ const p0 = openPause; openPause = function () {
  const r = p0.apply(this, arguments);
  if (NET.on && G.mode === 'menu') { const c = $('menu').querySelector('.card'); if (c && !c.querySelector('.mpl'))
    c.insertAdjacentHTML('beforeend', '<p class="mpl">Sala ' + NET.code + ' · ' + (NET.host ? 'Eres el anfitrión' : 'Invitado') + '. El juego sigue en marcha mientras pausas.</p><button class="oath mpl" onclick="netLeave()"><b>Salir de la sala</b></button>'); }
  return r;
} }
{ const s0 = showTitle; showTitle = function () { if (NET.on) leave(); return s0.apply(this, arguments); } }

// ---------------------------------------------------------------- conexión y lobby
function info() {
  let el = $('mpinfo');
  if (!NET.on) { if (el) el.style.display = 'none'; return; }
  if (!el) { el = document.createElement('div'); el.id = 'mpinfo'; el.style.cssText = 'position:fixed;z-index:30;top:max(4px,env(safe-area-inset-top));left:50%;transform:translateX(-50%);font:8px "Press Start 2P",monospace;color:#c9b8ff;background:rgba(5,3,10,.6);padding:3px 8px;border:1px solid #7a5a1e;pointer-events:none;white-space:nowrap'; document.body.appendChild(el); }
  const n = (isHo() ? peers().length : Object.keys(NET.gp).length) + 1;
  const t = 'SALA ' + NET.code + ' · ' + n + '/' + NET.max; if (el.textContent !== t) el.textContent = t; el.style.display = 'block';
}
function leave(msg) {
  emit('leave');
  const wasCl = isCl(), w = NET.ws;
  NET.ws = null; NET.on = false; NET.pl = {}; NET.gp = {}; NET.id = -1; NET.host = false; GM.clear(); SENT.clear();
  try { if (w) { w.onclose = null; w.close(); } } catch (e) {}
  if (wasCl) { try { if (NET.own) Object.assign(S, NET.own); G.bossOn = false; E = []; PR = []; RK = []; if (W) W.setGate(false); } catch (e) {} }
  NET.own = null; info();
  if (msg) setTimeout(() => { try { tMsg(msg); } catch (e) {} }, 100);
  return wasCl;
}
window.netLeave = function () { const cl_ = leave(); if (cl_) { save(); showTitle(); } else { toast('Saliste de la sala'); if (G.mode === 'menu') closeM(); } };
function onMsg(ev) {
  let m; try { m = JSON.parse(ev.data); } catch (e) { return; }
  if (NET.hubMsg && NET.hubMsg(m)) return;
  switch (m.t) {
    case 'room': NET.id = m.id; NET.code = m.c; NET.max = m.max; NET.host = m.id === 0; NET.on = true; startLocal(); break;
    case 'err': lobbyErr(m.m); try { NET.ws && NET.ws.close(); } catch (e) {} NET.ws = null; break;
    case 'peer+': if (isHo()) addPeer(m.id, m.n); break;
    case 'peer-': if (isHo()) dropPeer(m.id); break;
    case 'closed': { const wasCl = leave('La sala se cerró'); if (wasCl) { toast('El anfitrión cerró la sala'); save(); showTitle(); } break; }
    case 'g': if (NET.on) { if (NET.host) hostMsg(m); else clientMsg(m); } break;
  }
}
function startLocal() {
  const p = NET.pend || { slot: 1, name: NET.name }; NET.pend = null; hideLobby();
  NET.sync = true;
  try { SLOT = p.slot; if (slotData(p.slot)) { cont(); if (isHo() && p.fire && S.fires && S.fires.includes(p.fire) && !(S.bf && S.bf.r + ':' + S.bf.x === p.fire)) { const q = p.fire.split(':').map(Number); loadRegion(q[0], q[1]); } } else newGame(p.name || 'Sin nombre'); } finally { NET.sync = false; }
  NET.name = S.name || p.name || 'Sin nombre';
  NET.ri = S.ri;
  if (!isHo()) NET.own = { lv: JSON.parse(JSON.stringify(S.lv || {})), dl: JSON.parse(JSON.stringify(S.dl || {})), pz: JSON.parse(JSON.stringify(S.pz || {})), rv: JSON.parse(JSON.stringify(S.rv || {})), am: JSON.parse(JSON.stringify(S.am || {})), bk: JSON.parse(JSON.stringify(S.bk || {})) };
  fullNext = true; SENT.clear(); info(); emit('start');
}
function openSocket(url, first, ms) {
  return new Promise((res, rej) => {
    let w; try { w = new WebSocket(url); } catch (e) { return rej(new Error('Dirección no válida')); }
    const to = setTimeout(() => { try { w.close(); } catch (e) {} rej(new Error('El servidor no responde')); }, ms || 8000);
    w.onopen = () => { clearTimeout(to); NET.ws = w; w.onmessage = onMsg; w.onclose = () => { if (NET.on) { const wasCl = leave('Conexión perdida'); if (wasCl) { toast('Conexión perdida'); save(); showTitle(); } else toast('Conexión perdida: sigues en solitario'); } }; res(w); };
    w.onerror = () => { clearTimeout(to); rej(new Error('No se pudo conectar')); };
  });
}
const isApp = () => !/^https?:$/.test(location.protocol) || /androidplatform\.net$|^localhost$/.test(location.hostname) && location.protocol === 'https:';
// Si el juego está servido por Cloudflare Workers, el backend WebSocket vive en el mismo origen.
// En localhost también permite probar el servidor Node local; para APK/file: queda el endpoint anterior.
const SERVIDOR = /^https?:$/.test(location.protocol) ? location.origin : 'https://juramento-servidor.onrender.com';
const defUrl = () => SERVIDOR;
const isLan = h => /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(h) || /^[\w-]+(\.local)?(:\d+)?$/.test(h);
function normUrl(u) {
  u = (u || '').trim().replace(/^https:\/\//i, 'wss://').replace(/^http:\/\//i, 'ws://').replace(/\/+$/, '');
  if (!u) return '';
  if (!/^wss?:\/\//i.test(u)) u = (isLan(u.replace(/\/.*$/, '')) ? 'ws://' : 'wss://') + u;
  return u;
}
const esc_ = s => String(s).replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c]));
let lobby = null, lobSlot = 1;
function lobbyErr(t) { const e = $('mpe'); if (e) e.textContent = t; }
function hideLobby() { if (lobby) lobby.style.display = 'none'; }
function showLobby() {
  if (!lobby) { lobby = document.createElement('div'); lobby.id = 'mp'; document.body.appendChild(lobby); }
  let nm = ''; try { nm = localStorage.getItem('jur_mp_name') || ''; } catch (e) {}
  const css = 'font:9px "Press Start 2P",monospace;color:#e8e0ff;';
  const inp = 'width:100%;box-sizing:border-box;padding:10px;margin:4px 0 10px;background:#0b0714;border:1px solid #c9a54a;color:#fff;font:10px "Press Start 2P",monospace;border-radius:2px';
  const btn = 'padding:12px 10px;margin:4px;background:#1a1026;border:1px solid #c9a54a;color:#ffe9a0;font:9px "Press Start 2P",monospace;border-radius:2px;cursor:pointer';
  let slots = ''; for (let n = 1; n <= SLOTS; n++) { const s = slotData(n); slots += '<button data-s="' + n + '" style="' + btn + (n === lobSlot ? ';background:#3a2a5a' : '') + '">' + n + ' · ' + (s ? esc_(s.name || 'Sin nombre') : 'Nueva') + '</button>'; }
  lobby.style.cssText = 'position:fixed;inset:0;z-index:100;display:flex;align-items:center;justify-content:center;background:rgba(5,3,10,.94);overflow:auto;padding:12px;' + css;
  lobby.innerHTML = '<div style="width:min(440px,100%);max-height:100%"><h1 style="font:16px \'Press Start 2P\',monospace;color:#ffe9a0;text-align:center;margin:0 0 14px">Multijugador</h1>'
    + '<button id="mpg" style="' + btn + ';width:100%;margin:0 0 12px;border-color:#ffe66d;color:#ffe66d;background:#2a1c44">&#127760; Unirse al servidor global</button>'
    + '<label>Personaje (slot)</label><div id="mps" style="display:flex;flex-wrap:wrap;margin:4px 0 10px">' + slots + '</div>'
    + '<label>Tu nombre (si el slot está vacío)</label><input id="mpn" maxlength="14" value="' + esc_(nm) + '" placeholder="Sin nombre" autocomplete="off" style="' + inp + '">'
    + '<label>Servidor</label><input id="mpu" value="' + esc_(defUrl()) + '" placeholder="wss://mi-servidor.com" autocomplete="off" autocapitalize="off" spellcheck="false" style="' + inp + '">'
    + '<button id="mpc" style="' + btn + ';width:100%;margin:4px 0">Crear sala (soy el anfitrión)</button>'
    + '<label style="display:block;margin-top:10px">Código de sala</label><input id="mpk" maxlength="4" placeholder="ABCD" autocomplete="off" autocapitalize="characters" style="' + inp + ';text-transform:uppercase;letter-spacing:6px;text-align:center">'
    + '<button id="mpj" style="' + btn + ';width:100%;margin:4px 0">Unirse</button>'
    + '<div id="mpe" style="color:#ff7a8a;min-height:14px;margin:8px 0;text-align:center"></div>'
    + '<button id="mpx" style="' + btn + ';width:100%;margin:4px 0;color:#c9b8ff">Volver</button></div>';
  lobby.querySelectorAll('input').forEach(i => i.addEventListener('keydown', e => e.stopPropagation()));
  lobby.querySelectorAll('[data-s]').forEach(b => b.onclick = () => { lobSlot = +b.dataset.s; showLobby(); });
  const go = async mode => {
    lobbyErr(''); const name = ($('mpn').value || '').replace(/[<>&"'`]/g, '').trim().slice(0, 14), url = normUrl($('mpu').value), code = ($('mpk').value || '').trim().toUpperCase();
    if (!url) return lobbyErr('Escribe la dirección de tu servidor (ej. wss://mi-servidor.com)');
    if (/androidplatform\.net/.test(url)) return lobbyErr('Esa es la dirección interna de la app, no un servidor');
    if (mode === 'join' && code.length !== 4) return lobbyErr('El código tiene 4 letras');
    try { localStorage.setItem('jur_mp_url', url); localStorage.setItem('jur_mp_name', name); } catch (e) {}
    NET.name = name || 'Sin nombre'; NET.pend = { slot: lobSlot, name: NET.name };
    try { await openSocket(url); } catch (e) { return lobbyErr(e.message + (location.protocol === 'https:' && /^ws:/.test(url) ? ' · desde la app hace falta wss:// (con certificado)' : ' · revisa la dirección y que el servidor esté encendido')); }
    NET.ws.send(JSON.stringify(mode === 'join' ? { t: 'join', c: code, n: NET.name } : { t: 'create', n: NET.name }));
  };
  $('mpg').onclick = () => { if (window.netHub) window.netHub(); else lobbyErr('Lobby global no disponible'); };
  $('mpc').onclick = () => go('create'); $('mpj').onclick = () => go('join'); $('mpx').onclick = hideLobby;
}
window.netLobby = showLobby;
NET.openSocket = openSocket; NET.hideLobby = hideLobby;
NET.lobbyVals = () => ({ slot: lobSlot, name: (($('mpn') && $('mpn').value) || '').replace(/[<>&"'`]/g, '').trim().slice(0, 14), url: normUrl(($('mpu') && $('mpu').value) || defUrl()) });
NET.begin = (mode, o) => { // crear/unirse desde el lobby global (el socket ya está abierto)
  NET.name = o.name || 'Sin nombre'; NET.pend = { slot: o.slot, name: NET.name, fire: mode === 'create' ? o.fire : '' };
  const w = NET.ws; if (!w || w.readyState !== 1) return lobbyErr('Sin conexión con el servidor');
  w.send(JSON.stringify(mode === 'join' ? { t: 'join', c: o.code, n: NET.name } : { t: 'create', n: NET.name, pub: o.pub ? 1 : 0, reg: o.reg || '' }));
};
{ const sp = slotPick; slotPick = function (mode) { // el botón vive dentro de "Jugar"
  const r = sp.apply(this, arguments);
  if (mode === 'play') { const m = $('menu'), box = m && m.querySelector('.tbtns'); if (box && !box.querySelector('.mpm')) {
    const b = document.createElement('button'); b.className = 'tb mpm'; b.innerHTML = '<b>Multijugador</b> <small>Cooperativo online · 2-4 jugadores</small>'; b.onclick = showLobby;
    const back = [...box.querySelectorAll('button')].pop(); box.insertBefore(b, back); } }
  return r;
} }
addEventListener('beforeunload', () => { try { if (NET.ws) NET.ws.close(); } catch (e) {} });
// complementos que cargan antes que la red (caida.js, rey_fluido.js) dejan aquí su registro de mensajes
(window.NET_PLUGINS || []).forEach(f => { try { f(NET); } catch (e) { console.error(e); } });
window.NET_PLUGINS = { push: f => { try { f(NET); } catch (e) { console.error(e); } } };
})();
