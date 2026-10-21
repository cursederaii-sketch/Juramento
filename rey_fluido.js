// ===== EL REY (Ormund Cineris) · paso 3: jefe adaptado al combate fluido + postura =====
// Cargar DESPUÉS de enemigos_fluido.js (y de caida.js / reyfases.js, que definen sus fases). No toca la lógica narrativa del cráter
// (cadenas, gravedad, derrumbes, decretos, vínculo, sentencia): añade capas encima.
//
//  · POSTURA propia: 140 (se reinicia al cambiar de fase). Parar sus golpes (+38) y esquivarlos justo son la vía rápida de romperla;
//    al romperla, un golpe = REMATE (~7 % de su vida tras la resistencia de la fase).
//  · ATAQUES ROJOS (!) del Rey: estocada (bstab), paso de sombra (blink) y la nueva ESTOCADA DEL ALBA. No se paran: se esquivan.
//    Los demás (bsl, bov, cinder) sí se pueden parar.
//  · ESTOCADA DEL ALBA (rthrust): embestida larga y roja a lo largo del salón. Esquivarla ATRAVESÁNDOLO le quita postura extra.
//  · COMBOS más largos (hasta 3 golpes seguidos) con pausa tras la ráfaga: ritmo de ráfaga y hueco, y cada golpe parado suma a su postura.
//  · SALÓN QUE SE ROMPE (Fase I, Salón del trono): fisuras en línea desde el Rey hacia ti (1 al inicio, 2 en abanico a partir del 90 % de vida).
//    Telegráfico rojo ~1 s, luego estallan: hay que moverse, no quedarse pegado a él.
(function(){
if(typeof CFLU==='undefined'||typeof BS==='undefined'||!BS.rey||typeof DIF==='undefined'||!DIF.on)return;
const CF=CFLU,isCl=()=>typeof NET!=='undefined'&&NET.on&&!NET.host;

// ---------- datos ----------
ATK.rthrust={w:.85,a:.3,r:.95,d:28,rng:40,sd:105,mv:210,unb:1};
BS.rey.mpo=140;
for(const ph of BS.rey.ph)if(!ph.a.includes('rthrust'))ph.a.push('rthrust');
if(DIF.boss)DIF.boss.rey=[
 {c:.4,n:2,nx:['bsl','bstab'],p:.65},
 {c:.5,n:2,nx:['bstab','bov','bsl'],p:.7},
 {c:.55,n:3,nx:['bsl','bstab','bov'],p:.8}];
const RED=[ATK.bstab,ATK.blink].filter(Boolean);   // rojos propios del Rey (rthrust ya lleva unb:1)
const isRed=e=>e&&e.id==='rey'&&e.b&&e.cur&&(e.cur.unb||RED.includes(e.cur));
const FIS={first:3.5,every:5.2,tel:.95,w:10,len:260,dmg:22,fan:.4};
CF.rey={FIS,RED};

// ---------- hurtP: rojos no se paran; esquiva atravesando la estocada = postura extra ----------
{const q3=hurtP;hurtP=function(d,e){
  if(!isRed(e)||e.proj)return q3.call(this,d,e);
  const dd=typeof dodging==='function'&&dodging();
  if(dd&&e.cur===ATK.rthrust&&!isCl()){CF.addPost(e,16);ftext(P.x,P.y-38,'¡Esquiva perfecta!','#7df9ff')}
  if(P.s==='idle'&&held.block){const hb=held.block;held.block=0;try{return q3.call(this,d,e)}finally{held.block=hb}}
  return q3.call(this,d,e)}}

// ---------- fisuras del salón (solo Fase I en el Salón del trono) ----------
const HZ=[];let tm=FIS.first;
// ---------- cooperativo: las fisuras avisan a todos y cada jugador resuelve la suya (esquiva y vida propias) ----------
const isHo=()=>typeof NET!=='undefined'&&NET.on&&NET.host&&Object.keys(NET.pl).length>0;
const pickT=()=>{if(!isHo())return P;const L=[P].concat(Object.values(NET.pl)).filter(q=>q&&q.s!=='dead');return L.length?L[(CF._rr=(CF._rr||0)+1)%L.length]:P};
{const plug=f=>{if(window.NET)f(window.NET);else(window.NET_PLUGINS=window.NET_PLUGINS||[]).push(f)};
 plug(N=>{N.ext.fis=m=>{if(!isCl()||typeof rg==='undefined'||!rg||rg.id!=='trono'||!Array.isArray(m.l))return;for(const a of m.l)HZ.push({x1:a[0],y1:a[1],x2:a[2],y2:a[3],t:0,f:0})}})}
function pseg(px,py,x1,y1,x2,y2){const dx=x2-x1,dy=y2-y1,l2=dx*dx+dy*dy||1,t=Math.max(0,Math.min(1,((px-x1)*dx+(py-y1)*dy)/l2));return Math.hypot(px-(x1+t*dx),py-(y1+t*dy))}
function fissure(e,n){const T=pickT(),a0=Math.atan2(T.y-e.y,T.x-e.x);sfx(180,.4,'sawtooth',.05,360);
 for(let i=0;i<n;i++){const a=a0+(n>1?(i-(n-1)/2)*FIS.fan*2:0);HZ.push({x1:e.x,y1:e.y-4,x2:e.x+Math.cos(a)*FIS.len,y2:e.y-4+Math.sin(a)*FIS.len,t:0,f:0})}
 if(isHo())NET.send({k:'fis',l:HZ.slice(-n).map(h=>[Math.round(h.x1*10)/10,Math.round(h.y1*10)/10,Math.round(h.x2*10)/10,Math.round(h.y2*10)/10])})}
function tickHz(dt){
 const e=E.find(q=>q.id==='rey'&&q.b&&q.s!=='dead'&&q.aw);
 const on=!!e&&typeof rg!=='undefined'&&rg&&rg.id==='trono'&&e.ph===0&&!e.fell&&P&&P.s!=='dead';
 if(!on){HZ.length=0;tm=FIS.first;return}
 for(const h of HZ){h.t+=dt;if(!h.f&&h.t>=FIS.tel){h.f=1;G.shake=Math.max(G.shake,4);sfx(70,.4,'sawtooth',.09,40);
   for(let i=0;i<8;i++){const q=R();spark(h.x1+(h.x2-h.x1)*q,h.y1+(h.y2-h.y1)*q,'#ffd070',2,6,.9)}
   if(!(typeof dodging==='function'&&dodging())&&pseg(P.x,P.y,h.x1,h.y1,h.x2,h.y2)<FIS.w*.5+3)takeHit(FIS.dmg,P.x-h.x1,P.y-h.y1)}}
 for(let i=HZ.length-1;i>=0;i--)if(HZ[i].t>FIS.tel+.4)HZ.splice(i,1);
 if(isCl())return;                              // invitado: solo avanza las fisuras que avisa el anfitrión
 if(e.s==='stg')return;                       // aturdido o roto: respiro
 tm-=dt;if(tm<=0){tm=FIS.every;fissure(e,(e.hp/e.mhp)<.9?2:1);if(!CF._ft){CF._ft=1;toast('El salón se parte: no te quedes quieto')}}}
{const up2=update;update=function(dt){up2.call(this,dt);if(G.mode==='play'&&!(G.hs>0))tickHz(dt);else if(G.mode!=='play'&&G.mode!=='dying')HZ.length=0}}

// ---------- dibujo: aviso rojo del Rey y fisuras ----------
{const d4=drawE;drawE=function(e){
  if(e&&e.id==='rey'&&e.b&&e.s!=='dead'){
   for(const h of HZ){const q=Math.min(1,h.t/FIS.tel);g.save();g.lineCap='round';
    if(!h.f){g.strokeStyle='rgba(255,70,50,'+(.15+.5*q)+')';g.lineWidth=2+FIS.w*.5*q}
    else{g.strokeStyle='rgba(255,230,150,'+Math.max(0,1-(h.t-FIS.tel)/.4)+')';g.lineWidth=FIS.w}
    g.beginPath();g.moveTo(h.x1,h.y1);g.lineTo(h.x2,h.y2);g.stroke();g.restore()}
   if(e.s==='wind'&&isRed(e)){const q=Math.min(1,e.tm/(e.wt||1));
    glow(e.x,e.y-16,24,'255,50,50',.22+.4*q);fr(e.x-2,e.y-(e.b.h||36)-34,3,7,'#ff3b3b');fr(e.x-2,e.y-(e.b.h||36)-24,3,3,'#ff3b3b')}}
  d4.call(this,e)}}
})();
