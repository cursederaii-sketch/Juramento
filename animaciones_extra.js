// ===== ANIMACIONES EXTRA · combate, enemigos y mundo =====
// Capa puramente visual por envoltorios (mismo estilo que animaciones.js): no cambia daño, IA ni colisiones.
// Cargar DESPUÉS de rey_fluido.js y ANTES de nitidez.js.
//
//  COMBATE   · destello radial en cada golpe que conecta (más grande con golpe pesado) + chispas en la dirección del golpe
//            · anillo y nube de polvo al morir un enemigo (más grande en jefes)
//            · polvo/hojas bajo los pies al correr
//  ENEMIGOS  · aviso en el suelo durante la preparación del ataque: crece y se enrojece; rojo = no se puede parar
//            · estrellitas girando sobre la cabeza con la postura rota
//            · brasas/aura que suben alrededor de los jefes
//  MUNDO     · destellos sobre el agua · ráfagas de viento en exteriores · luciérnagas de noche en zonas de hierba
//
// Presupuesto: todo respeta PERF.lv (calidad adaptativa): con lv>=1 solo queda lo esencial de combate;
// con lv>=2 se apagan también los avisos de suelo. Nunca se superan ~300 partículas.
(function(){
if(typeof update==='undefined'||typeof drawE==='undefined'||typeof hitE==='undefined'||typeof drawFX==='undefined'||typeof PERF==='undefined')return;
const lvl=()=>PERF.lv|0;
const room=n=>PT.length<(lvl()?160:300)-n;
const T={run:0,emb:0,wat:0,wind:0,fly:0};

// ---------- 1) impacto de golpe ----------
{const h=hitE;hitE=function(e,d,kb,hv){
  const hp0=e?e.hp:null,r=h.apply(this,arguments);
  try{if(e&&hp0!=null&&e.hp<hp0&&G.mode==='play'&&P){
    const a=Math.atan2(e.y-P.y,e.x-P.x),big=!!hv||hp0-e.hp>=20;
    FX.push({k:'xhit',x:e.x,y:e.y-8,a,l:.2,m:.2,big});
    if(room(8))for(let i=0;i<(big?7:4);i++){const s=a+(R()-.5)*1.1,v=60+R()*80;
      PT.push({k:'s',x:e.x,y:e.y,z:8+R()*8,vx:Math.cos(s)*v,vy:Math.sin(s)*v*.6,vz:10+R()*30,l:.25+R()*.2,c:big?'#ffe9a0':'#ffffff'})}}}catch(_){}
  return r}}

{const d0=drawFX;drawFX=function(f){
  if(f.k==='xhit'){const p=1-f.l/f.m,n=f.big?6:4,L=(f.big?16:11)*(.4+p*.8),al=(1-p).toFixed(2);
    g.save();g.translate(Math.round(f.x),Math.round(f.y));g.strokeStyle='rgba(255,245,210,'+al+')';g.lineWidth=f.big?2:1;g.beginPath();
    for(let i=0;i<n;i++){const a=f.a+(i-(n-1)/2)*.55;g.moveTo(Math.cos(a)*L*.3,Math.sin(a)*L*.21);g.lineTo(Math.cos(a)*L,Math.sin(a)*L*.7)}
    g.stroke();g.restore();return}
  if(f.k==='xgl'){const p=1-f.l/f.m,al=Math.sin(p*Math.PI);g.globalAlpha=al;fr(f.x,f.y,1,1,'#ffffff');g.globalAlpha=al*.55;fr(f.x-1,f.y,3,1,'#cfe8ff');fr(f.x,f.y-1,1,3,'#cfe8ff');g.globalAlpha=1;return}
  if(f.k==='xwd'){const p=1-f.l/f.m,al=Math.sin(p*Math.PI)*.16,x=f.x+f.v*p*f.m;g.fillStyle='rgba(235,240,255,'+al.toFixed(3)+')';g.fillRect(Math.round(x-f.len),Math.round(f.y),Math.round(f.len),1);return}
  return d0(f)}}

// ---------- 2) enemigos: aviso de ataque y estrellitas de postura ----------
{const _dE=drawE;drawE=function(e){
  if(e.s==='dead')return _dE(e);
  try{if(e.s==='wind'&&e.cur&&e.wt>0&&!e.cur.proj&&lvl()<2){
    const k=Math.min(1,e.tm/e.wt),rr=Math.min(64,Math.max(18,e.cur.rng||30)),c=e.cur.unb?'255,60,80':'255,190,90',pul=.5+.5*Math.sin(TM*28);
    g.save();g.translate(Math.round(e.x),Math.round(e.y));g.scale(1,.5);
    g.fillStyle='rgba('+c+','+(.05+.2*k*(.6+.4*pul)).toFixed(3)+')';g.beginPath();g.arc(0,0,rr*(.35+.65*k),0,6.283);g.fill();
    g.strokeStyle='rgba('+c+','+(.25+.45*k).toFixed(2)+')';g.lineWidth=1.5;g.beginPath();g.arc(0,0,rr,0,6.283);g.stroke();
    g.restore()}}catch(_){}
  _dE(e);
  try{if(e.brk&&e.s==='stg'){const d=e.b||TY[e.t],hh=d?d.h:24;
    for(let i=0;i<3;i++){const a=TM*5+i*2.094;fr(e.x+Math.cos(a)*9,e.y-hh-6+Math.sin(a)*3,2,2,'#ffe66d')}}}catch(_){}}}

// ---------- 3) tick: muertes, pasos, aura de jefes y ambiente ----------
function dust(x,y,n,c,spd){for(let i=0;i<n;i++){const a=R()*6.283,v=(8+R()*18)*(spd||1);PT.push({k:'d',x,y,z:2+R()*4,vx:Math.cos(a)*v,vy:Math.sin(a)*v*.5,vz:6+R()*10,l:.4,c})}}
function tick(dt){
  if(G.mode!=='play'||!P||!W||!rg)return;
  const L=lvl(),cx=cam.x,cy=cam.y;
  // muerte de enemigos: una sola vez por enemigo
  for(const e of E){if(e.s==='dead'&&!e._xd){e._xd=1;if(e.x<cx-40||e.x>cx+GW+40||e.y<cy-40||e.y>cy+GH+40)continue;
    FX.push({k:'ring',x:e.x,y:e.y-6,l:.5,m:.5,c:'192,140,255',big:!!e.b});
    if(room(10))dust(e.x,e.y,e.b?10:6,'rgba(190,175,200,.55)',e.b?1.6:1)}}
  // pasos al correr
  if(P.s==='idle'&&P.mvg&&!P.run){T.run+=dt;if(T.run>.2){T.run=0;if(room(3)){
    const gi=W.ok(P.x>>4,P.y>>4)?W.gd[W.i(P.x>>4,P.y>>4)]:'';
    if(gi==='g'&&W.th.grass)for(let i=0;i<2;i++)PT.push({k:'s',x:P.x+(R()-.5)*6,y:P.y,z:1,vx:(R()-.5)*24,vy:(R()-.5)*10,vz:22+R()*14,l:.3,c:R()<.5?'#6f9a45':'#8cb85a'});
    else if(gi!=='w'&&gi!=='k')dust(P.x,P.y,1,'rgba(190,175,150,.4)',.6)}}}else T.run=0;
  // aura de jefes
  T.emb+=dt;if(T.emb>.14&&L<2){T.emb=0;for(const e of E){if(!e.b||e.s==='dead'||Math.abs(e.x-P.x)>300||Math.abs(e.y-P.y)>200||!room(2))continue;
    PT.push({k:'a',x:e.x+(R()-.5)*30,y:e.y+(R()-.5)*8,z:2,vx:(R()-.5)*8,vy:0,vz:14+R()*14,l:1.6,c:e.ph===2?'rgba(255,90,120,.85)':'rgba(190,130,255,.85)'})}}
  if(L>=1)return;
  // destellos sobre el agua
  if(W.water&&W.water.length){T.wat+=dt;if(T.wat>.14){T.wat=0;for(let t=0;t<6;t++){const w=W.water[R()*W.water.length|0],x=w.tx*16+R()*16|0,y=w.ty*16+R()*16|0;
    if(x>cx&&x<cx+GW&&y>cy&&y<cy+GH){FX.push({k:'xgl',x,y,l:.5,m:.5});break}}}}
  // ráfagas de viento en exteriores
  if(rg.out&&W.th.grass){T.wind+=dt;if(T.wind>2.2){T.wind=-R()*1.5;FX.push({k:'xwd',x:cx-40,y:cy+20+R()*(GH-40)|0,v:(GW+160)/1.3,len:30+R()*40,l:1.3,m:1.3})}}
  // luciérnagas de noche
  if(S.night&&rg.out&&W.th.grass){T.fly+=dt;if(T.fly>.5&&room(2)){T.fly=0;
    PT.push({k:'a',x:cx+R()*GW,y:cy+40+R()*(GH-40),z:6+R()*14,vx:(R()-.5)*10,vy:(R()-.5)*6,vz:(R()-.5)*5,l:6,c:'rgba(210,255,120,.9)'})}}}
{const u=update;update=function(dt){u.call(this,dt);try{tick(dt)}catch(e){if(!tick.err){tick.err=1;console.error('ANIM_EXTRA',e)}}}}
})();
