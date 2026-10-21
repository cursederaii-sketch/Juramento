// ===== COMBATE FLUIDO + POSTURA · paso 1 (jugador y sistema base) =====
// Capa por envoltorios (mismo estilo que combate_souls.js): no reemplaza el motor, solo lo envuelve.
// Cargar DESPUÉS de combate_souls.js (envuelve updP, hitE, hurtP, takeHit, update, drawE, drawP).
//
//  FLUIDEZ (todo cuesta resistencia: fluir no es gratis)
//   · Cancelar con esquiva: tras los fotogramas de golpe de cualquier ataque (acierte o falle) puedes esquivar.
//   · Cancelar tras esquivar: en la 2.ª mitad de la esquiva, ligero/pesado empiezan al instante.
//   · Encadenar al acertar: si el golpe conecta, el siguiente ligero/pesado sale sin esperar la recuperación.
//   · Corte de paso: esquivar atravesando a un enemigo te devuelve resistencia y le resta postura.
//   · Corte fantasma (de habilidades.js) ahora se orienta solo hacia el enemigo más cercano.
//   · Lanzamiento: un golpe pesado manda por los aires a los enemigos normales; se les puede seguir
//     con golpes ligeros (combo aéreo, máx. 4) y estamparlos contra una pared.
//
//  POSTURA (duelo de ritmo, ambos lados)
//   · Cada enemigo tiene barra de postura. Golpear, parar y esquivar justo la llenan; si no presionas, se recupera.
//   · Al romperse queda aturdido: el siguiente golpe es un REMATE (daño enorme, congelación y destello).
//   · Tu propia postura sube al recibir golpes o bloquear: si se rompe, quedas aturdido y recibes +35% de daño.
(function(){
if(typeof updP==='undefined'||typeof hitE==='undefined')return;
const isCl=()=>typeof NET!=='undefined'&&NET.on&&!NET.host;   // el invitado no simula enemigos: solo el anfitrión
const CF={
 cancelDodgeAfterHit:true,
 pBreak:.85,        // aturdimiento del jugador al romperse su postura
 pMax:100,pHit:16,pBlock:10,pRegen:16,pDelay:1.5,pVuln:1.35,
 eDelay:1.6,eDelayB:1.3,eRegen:7,eRegenB:9,
 dLight:10,dHeavy:24,dWave:7,dParry:38,dDodge:14,dPass:6,dSlam:20,
 execMul:3,execFrac:.6,execFracB:.1,  // remate: máx(daño×3, % de vida máx.)
 launchVz:95,launchPush:240,grav:250,jugMax:4,jugMul:1.25,slamDmg:16,
 passRefund:12};
window.CFLU=CF;

// ---------- postura del enemigo ----------
function initPo(e){if(e.mpo)return;const T=TY[e.t],k=T&&T.mpo;   // TY[t].mpo = postura base del tipo (se escala con la vida de élites)
 e.mpo=e.b?(e.b.mpo||Math.round(110+e.mhp*.06)):k?Math.round(k*e.mhp/(T.hp||e.mhp)):Math.round(e.mhp*.55)+6;e.po=0;e.poT=-99;e.lz=0;e.vz=0}
function addPost(e,n){
 if(isCl()||!e||e.s==='dead'||e.brk)return;initPo(e);
 e.po=Math.min(e.mpo,e.po+n);e.poT=TM;e.pf=.22;
 if(e.po>=e.mpo)breakPost(e)}
function breakPost(e){
 e.brk=1;e.po=e.mpo;e.s='stg';e.tm=0;e.stgT=e.b?1.7:2.1;e.rip=false;e.cmb=null;e.pun=0;
 G.shake=Math.max(G.shake,4);G.hs=Math.max(G.hs||0,.1);
 FX.push({k:'ring',x:e.x,y:e.y-8,l:.5,m:.5,c:'255,230,109',big:1});spark(e.x,e.y-12,'#ffe66d',18,14,1.2);
 ftext(e.x,e.y-(e.b?e.b.h:(TY[e.t]?TY[e.t].h:22))-24,'¡POSTURA ROTA!','#ffe66d');sfx(520,.25,'square',.06,260);sfx(90,.3,'sawtooth',.08,40);
 if(!CF._tip){CF._tip=1;toast('Postura rota: golpéalo para el remate')}}

// ---------- postura del jugador ----------
function pPost(n){
 const p=P;if(!p||p.s==='dead'||p.s==='ult'||p.brk>0)return;
 p.po=Math.min(CF.pMax,(p.po||0)+n);p.poT=TM;p.pf=.22;
 if(p.po>=CF.pMax){p.po=0;p.brk=CF.pBreak;p.s='hit';p.t=0;p.hd=true;p.ex=0;G.shake=Math.max(G.shake,5);G.flash=Math.max(G.flash||0,.3);
  FX.push({k:'ring',x:p.x,y:p.y-8,l:.5,m:.5,c:'255,77,109',big:1});spark(p.x,p.y-10,'#ff4d6d',16,14,1.2);ftext(p.x,p.y-34,'Postura rota','#ff6b7a');sfx(110,.4,'sawtooth',.09,40)}}

// ---------- lanzamiento ----------
function launch(e,dirx,diry){
 e.lz=.01;e.vz=CF.launchVz;e.jug=0;e.sl=0;e.s='stg';e.tm=0;e.stgT=1.2;e.cmb=null;e.cur=null;
 e.kx=dirx*CF.launchPush;e.ky=diry*CF.launchPush;
 spark(e.x,e.y,'#b05cff',10,16,1);FX.push({k:'ring',x:e.x,y:e.y,l:.3,m:.3,c:'200,170,255'})}

CF.addPost=addPost;CF.breakPost=breakPost;CF.pPost=pPost;CF.launch=launch;

// ---------- envoltorios: golpes ----------
{const h1=hitE;hitE=function(e,d,kb,hv){
  if(isCl()||!e||e.s==='dead')return h1.call(this,e,d,kb,hv);
  initPo(e);
  const wave=G.src==='wave',ult=!!G.ulting;
  let exec=false;
  // REMATE: golpe sobre un enemigo con la postura rota
  if(e.brk&&e.s==='stg'&&!wave){exec=true;d=Math.max(d*CF.execMul,e.mhp*(e.b?CF.execFracB:CF.execFrac));e.brk=0;e.po=0}
  // combo aéreo
  let air=false;
  if(!exec&&e.lz>2&&!e.b&&!wave&&!ult){e.jug=(e.jug||0)+1;if(e.jug<=CF.jugMax){air=true;d*=CF.jugMul;e.vz=Math.max(e.vz,55);ftext(e.x+8,e.y-e.lz-30,'Aéreo x'+e.jug,'#c9a8ff')}}
  const dirx=(e.x-P.x),diry=(e.y-P.y),l=Math.hypot(dirx,diry)||1;
  h1.call(this,e,d,kb,hv);
  if(e.s==='dead')return;
  if(exec){
   e.s='stg';e.tm=0;e.stgT=e.b?.9:.7;
   G.hs=Math.max(G.hs||0,.3);G.shake=Math.max(G.shake,8);G.flash=Math.max(G.flash||0,.28);
   FX.push({k:'ring',x:e.x,y:e.y-8,l:.6,m:.6,c:'255,236,160',big:1});FX.push({k:'ring',x:e.x,y:e.y-8,l:.4,m:.4,c:'255,255,255'});
   spark(e.x,e.y-10,'#ffe66d',26,18,1.6);spark(e.x,e.y-10,'#fff',12,20,1.2);ftext(e.x,e.y-(e.b?e.b.h:22)-30,'¡REMATE!','#ffe66d');
   sfx(70,.5,'sawtooth',.12,28);sfx(900,.35,'triangle',.06,180);P.st=Math.min(P.mst,P.st+25);return}
  // postura por golpe
  addPost(e,wave?CF.dWave:hv?CF.dHeavy:CF.dLight);
  // lanzamiento con golpe pesado (no jefes, no acorazados, no si acaba de romperse)
  if(hv&&!wave&&!e.b&&!e.brk&&!air&&!(e.lz>0)&&e.s!=='dead'&&!(TY[e.t]&&TY[e.t].arm)&&(P.s==='heavy'||P.mv==='remate'||ult))launch(e,dirx/l,diry/l)}}

{const q1=hurtP;hurtP=function(d,e){
  const dd=typeof dodging==='function'&&dodging(),pa=S.st.parries,st0=P.st,blk=P.s==='idle'&&held.block&&P.ex<=0&&!dd;
  q1.call(this,d,e);
  if(!e||e.proj||P.s==='ult')return;
  if(dd)addPost(e,CF.dDodge);
  else if(S.st.parries>pa){addPost(e,CF.dParry);P.po=Math.max(0,(P.po||0)-14)}
  else if(blk&&P.st<st0-1)pPost(CF.pBlock)}}

{const t1=takeHit;takeHit=function(d,fx,fy){
  if(!P||P.s==='dead'||P.s==='ult')return t1.call(this,d,fx,fy);
  if(P.brk>0)d=Math.round(d*CF.pVuln);
  t1.call(this,d,fx,fy);
  if(P.s!=='dead'&&d>0)pPost(CF.pHit)}}

// ---------- envoltorio: jugador (cancelaciones) ----------
{const u1=updP;updP=function(dt){
  const p=P;
  if(p&&p.s!=='dead'&&G.mode==='play'){
   const w=WPN(),L=w.l,H=w.h;
   if(p.po===undefined){p.po=0;p.brk=0}
   // postura rota: aturdido
   if(p.brk>0){p.brk-=dt;if(p.s!=='ult'){p.s='hit';p.t=0;p.hd=true;p.ex=0}if(p.brk<=0){p.brk=0;p.s='idle';p.po=30}}
   else{
    const a=p.s==='light'?L.a[1]:p.s==='heavy'?H.a[1]:null;
    // cancelar un ataque con esquiva (tras los fotogramas de golpe, acierte o falle)
    if(a!==null&&p.t>=a&&buf.dodge>0&&p.st>0){p.s='idle';p.dl=0;p.hd=false;p.mv=null;p.cx=(p.cx||0)+1}
    // encadenar al acertar: ligero/pesado sin esperar la recuperación
    else if(a!==null&&CF.cancelDodgeAfterHit&&p.hd&&p.t>=a+.03&&(buf.light>0||buf.heavy>0)&&p.mv!=='remate'){p.s='idle';p.hd=false;p.mv=null}
    // cancelar la esquiva con un ataque (2.ª mitad)
    else if(p.s==='dodge'&&p.t>.2&&(buf.light>0||buf.heavy>0)){p.s='idle';p.dl=0}
   }}
  u1.call(this,dt);
  if(!p||p.s==='dead'||G.mode!=='play')return;
  // Corte de paso: atravesar a un enemigo durante la esquiva
  if(p.s==='dodge'){if(!p._pt){for(const e of E){if(e.s==='dead'||!e.aw||e.lz>0)continue;
     if(Math.hypot(e.x-p.x,e.y-p.y)<13){p._pt=1;p.st=Math.min(p.mst,p.st+CF.passRefund);ftext(p.x,p.y-30,'Corte de paso','#9ad0ff');spark(p.x,p.y-8,'#9ad0ff',8,12,.9);addPost(e,CF.dPass);break}}}}
  else p._pt=0;
  // Corte fantasma: apuntar al enemigo más cercano
  if(p.s==='light'&&p.mv==='ghost'&&p.t<.09&&!p._ga){p._ga=1;let b=null,bd=110;
   for(const e of E){if(e.s==='dead')continue;const d=Math.hypot(e.x-p.x,e.y-p.y);if(d<bd){bd=d;b=e}}
   if(b){const dx=b.x-p.x,dy=b.y-p.y,l=Math.hypot(dx,dy)||1;p.ax=dx/l;p.ay=dy/l;if(Math.abs(p.ax)>Math.abs(p.ay)*1.2){p.fx=sgn(p.ax);p.fy=0}else if(Math.abs(p.ay)>Math.abs(p.ax)*1.2){p.fx=0;p.fy=sgn(p.ay)}}}
  if(p.s!=='light')p._ga=0}}

// ---------- tick por fotograma (regeneración de postura, física del lanzamiento) ----------
function tick(dt){
 const p=P;
 if(p&&p.po>0&&!(p.brk>0)&&TM-(p.poT||0)>CF.pDelay)p.po=Math.max(0,p.po-CF.pRegen*dt);
 if(p&&p.pf>0)p.pf-=dt;
 if(isCl())return;
 for(const e of E){
  if(e.s==='dead')continue;
  if(e.mpo){
   if(e.pf>0)e.pf-=dt;
   if(e.b&&e._ph!==e.ph){e._ph=e.ph;if(!e.brk)e.po=0}                                   // cambio de fase: se reinicia la postura
   if(e.brk&&e.s!=='stg'){e.brk=0;e.po=Math.round(e.mpo*.3)}                            // se acabó la ventana
   else if(!e.brk&&e.po>0&&!(e.lz>0)&&TM-e.poT>(e.b?CF.eDelayB:CF.eDelay))e.po=Math.max(0,e.po-(e.b?CF.eRegenB:CF.eRegen)*dt);
  }
  if(e.lz>0){
   if(e.s!=='stg'){e.s='stg';e.tm=0}
   e.vz-=CF.grav*dt;e.lz+=e.vz*dt;
   e.tm=Math.min(e.tm,Math.max(0,(e.stgT||1)-.15));                                     // no se levanta en el aire
   // estampado contra pared
   const sp=Math.hypot(e.kx||0,e.ky||0);
   if(!e.sl&&sp>90){const ux=(e.kx||0)/sp,uy=(e.ky||0)/sp;
    if(W.hit(e.x+ux*7,e.y+uy*7,e.hw,e.hh)){e.sl=1;e.kx=e.ky=0;G.shake=Math.max(G.shake,5);spark(e.x+ux*6,e.y-8,'#ffb347',14,10,1.2);ftext(e.x,e.y-e.lz-34,'¡Estampado!','#ffb347');sfx(120,.25,'square',.08,50);
     const lz0=e.lz,vz0=e.vz;hitE.call(null,e,CF.slamDmg,0,0);if(e.s!=='dead'){e.lz=lz0;e.vz=Math.max(vz0,20);e.jug=0;addPost(e,CF.dSlam)}}}
   if(e.lz<=0&&e.s!=='dead'){e.lz=0;e.vz=0;e.kx=e.ky=0;
    for(let i=0;i<6;i++)PT.push({k:'d',x:e.x,y:e.y,z:2,vx:(R()-.5)*40,vy:(R()-.5)*20,vz:8+R()*14,l:.4,c:'rgba(200,190,230,.5)'});
    G.shake=Math.max(G.shake,1.5);e.s='stg';e.tm=0;e.stgT=e.brk?Math.max(e.stgT,1.2):.55}
  }}}
{const up=update;update=function(dt){up.call(this,dt);if(G.mode==='play'&&!(G.hs>0)&&P)tick(dt)}}

// ---------- dibujo ----------
{const d1=drawE;drawE=function(e){
  if(e.s==='dead')return d1.call(this,e);
  if(e.lz>.5){g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(e.x,e.y,8,3,0,0,6.283);g.fill();
   g.save();g.translate(0,-Math.round(e.lz));d1.call(this,e);g.restore()}
  else d1.call(this,e);
  if(e.mpo&&e.po>3){
   const h=e.b?e.b.h:(TY[e.t]?TY[e.t].h:22),w=e.b?34:16,x=Math.round(e.x-w/2),y=Math.round(e.y-h-17-Math.max(0,e.lz||0)),q=e.po/e.mpo;
   fr(x-1,y-1,w+2,4,'#0a0610');
   fr(x,y,Math.round(w*q),2,e.brk?'#ffffff':q>.75?'#ffe66d':'#d9a441');
   if(e.pf>0)fr(x,y,w,2,'rgba(255,255,255,.55)')}}}
{const dp=drawP;drawP=function(){dp.call(this);
  const p=P;if(!p||p.s==='dead'||!(p.po>3))return;
  const w=22,x=Math.round(p.x-w/2),y=Math.round(p.y-30),q=p.po/CF.pMax;
  fr(x-1,y-1,w+2,4,'#0a0610');fr(x,y,Math.round(w*q),2,q>.75?'#ff4d6d':'#ff9a3c');
  if(p.pf>0)fr(x,y,w,2,'rgba(255,255,255,.5)')}}
})();
