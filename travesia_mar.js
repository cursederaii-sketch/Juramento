// ===== LA GAVIOTA, EL MAR (v8.33): que se note que estás en un barco, y que el Kraken lo destroce al aparecer =====
// Qué hace este archivo (todo es dibujo y ambiente; las reglas de la misión están en travesia.js):
//  · mar vivo: crestas de olas que corren mientras el barco navega (y se paran cuando se detiene), espuma pegada al casco,
//    estela en la popa, salpicaduras en la proa, casco con costado de tablones, barandas con postes, tablones en cubierta;
//  · balanceo: la cámara cabecea y se mece más cuanto más raro se pone el viaje; crujidos del casco;
//  · dos mástiles con vela, jarcia y banderín (las velas se vuelven pálidas y luego oscuras con cada señor);
//  · CINEMÁTICA DEL KRAKEN (≈7 s): el barco se detiene, una sombra enorme crece bajo el casco, tientan la quilla, seis tentáculos
//    gigantes suben del mar y rodean el barco, estalla la cubierta (escombros, géiseres, palo mayor cayendo) y el Kraken
//    emerge por el boquete. Cuando termina de salir empieza el combate. Mientras dura la pelea los tentáculos siguen
//    agarrando el casco; al morir el Kraken se hunden.
// Cargar justo DESPUÉS de travesia.js.
(function(){
if(typeof RG==='undefined'||!window.TRV)return;
const M={t:0,sp:1,sc:0,roll:0,k:null,tent:[],probe:[],deb:[],gey:[],spr:[],fall:0,deadT:null,cr:3,pan:0};
window.TRVMAR={M};
const here=()=>!!(rg&&rg.id==='barco'&&W&&W.hullW);
const broken=()=>!!(S&&S.rv&&S.rv['trav:roto']);
const stage=()=>TRV.stg();
const hs=(a,b,c)=>hash(a*12.9898+b*78.233+(c||0)*37.719);
const clp=(v,a,b)=>Math.max(a,Math.min(b,v));
const BX=33*16+8,BY=19*16+8; // punto por donde sale el Kraken (centro del boquete)
const sfxS=(...a)=>{try{sfx(...a)}catch(e){}};

// ---------- mástiles ----------
const MASTS=[{id:1,tx:24,ty:19,h:122,w:60},{id:2,tx:38,ty:19,h:106,w:52},{id:3,tx:46,ty:19,h:86,w:40}];

// ---------- los seis tentáculos gigantes que agarran el casco: base (en el agua) y punta (sobre la cubierta) ----------
const TENTS=[
 {bx:30*16,by:9.5*16,hx:30*16,hy:13.7*16,H:86,ph:0},
 {bx:44*16,by:10*16,hx:43*16,hy:15.2*16,H:94,ph:1.7},
 {bx:20*16,by:29*16,hx:21*16,hy:24.7*16,H:92,ph:3.1},
 {bx:37*16,by:29.5*16,hx:36*16,hy:25.2*16,H:98,ph:4.4},
 {bx:4.2*16,by:14*16,hx:7.6*16,hy:17*16,H:82,ph:5.2},
 {bx:51*16,by:23.5*16,hx:50*16,hy:21.2*16,H:84,ph:2.4}];
// tentáculos "de tanteo": suben y bajan junto a la borda antes de la gran emergencia
const PROBES=[{bx:12*16,by:29*16,hx:12.6*16,hy:27.4*16,H:46,ph:.6,t0:1.8},{bx:47*16,by:10*16,hx:46.4*16,hy:11.6*16,H:50,ph:2.2,t0:2.3}];

function reset(){
 M.k=null;M.deb=[];M.gey=[];M.spr=[];M.probe=[];M.deadT=null;G.krk=0;
 M.fall=broken()?1:0;
 M.tent=(broken()&&!S.bk.kraken)?TENTS.map(t=>Object.assign({r:1},t)):[];
}
function down(){M.deadT=M.t;M.roll=Math.max(M.roll,2.2);for(const t of M.tent)t.fall=1;
 for(let i=0;i<24;i++)splash(BX+(Math.random()-.5)*120,BY+(Math.random()-.5)*50)}
window.TRVMAR.reset=reset;window.TRVMAR.down=down;

// ---------- utilidades de efectos ----------
function splash(x,y,n){n=n||1;for(let i=0;i<n*4;i++)M.spr.push({x,y,z:2,vx:(Math.random()-.5)*50,vy:(Math.random()-.5)*20,vz:40+Math.random()*80,l:.7+Math.random()*.6,c:Math.random()<.5?'#e8f6ff':'#9ccff0'})}
function planks(x,y,n,pow){pow=pow||1;for(let i=0;i<n;i++){const a=Math.random()*6.283,sp=(30+Math.random()*110)*pow;
 M.deb.push({x,y,z:6+Math.random()*10,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp*.55,vz:80+Math.random()*170*pow,rot:Math.random()*6.283,vr:(Math.random()-.5)*14,L:4+Math.random()*9,c:Math.random()<.7?'#6e4a26':'#a07a48',age:0,st:0})}
 while(M.deb.length>110)M.deb.shift()}
function safeP(){if(!P||!W.hit(P.x,P.y,5,3))return;
 for(let r=1;r<14;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;
  const x=((P.x>>4)+dx)*16+8,y=((P.y>>4)+dy)*16+8;
  if(!W.hit(x,y,5,3)&&!W.hit(x+10,y,5,3)&&!W.hit(x-10,y,5,3)&&!W.hit(x,y+10,5,3)&&!W.hit(x,y-10,5,3)){P.x=x;P.y=y;return}}}

// ---------- cinemática ----------
function cine(h){
 if(M.k)return;M.k={t:0,h,f:{}};M.tent=[];M.probe=PROBES.map(p=>Object.assign({r:0},p));
}
function cineTick(dt){
 const k=M.k;if(!k)return;const h=k.h;k.t+=dt;const t=k.t,f=k.f;
 if(!f.a){f.a=1;h.envSet(4);toast('El barco se detiene. Nada se mueve.');G.shake=Math.max(G.shake||0,3);sfxS(60,1.2,'sawtooth',.08,30);M.roll=Math.max(M.roll,1.4)}
 if(t>1.8&&!f.b){f.b=1;h.envSet(5);toast('Algo enorme roza la quilla...');G.shake=Math.max(G.shake||0,6);M.roll=Math.max(M.roll,2.4);sfxS(48,1.4,'sawtooth',.1,24);splash(BX,BY+40,3)}
 if(t>3.2&&!f.c){f.c=1;toast('Tentáculos del tamaño de mástiles rodean el casco');sfxS(70,1.6,'sawtooth',.1,30);
  M.tent=TENTS.map((q,i)=>Object.assign({r:0,t0:t+i*.16},q));M.probe=[]}
 if(t>3.2&&t<4.6){k.pp=(k.pp||0)-dt;if(k.pp<=0){k.pp=.36;G.shake=Math.max(G.shake||0,4.5);M.roll=Math.max(M.roll,3);sfxS(52+Math.random()*30,.5,'sawtooth',.08,30);
  const q=TENTS[(Math.random()*TENTS.length)|0];planks(q.hx,q.hy,7,.8);splash(q.hx,q.hy,2)}}
 if(t>4.6&&!f.d){f.d=1;
  h.breakShip();safeP();h.envSet(5);G.shake=13;G.flash=.85;M.roll=4.6;
  sfxS(90,1,'sawtooth',.12,40);sfxS(38,1.8,'sawtooth',.13,18);toast('¡La cubierta se parte en dos!');
  planks(BX,BY,95,1.5);planks(18.5*16,15*16,14,1);planks(40.5*16,14*16,12,1);
  for(const q of [[BX,BY,1.6,150],[BX-62,BY+14,1.2,110],[BX+58,BY-10,1.2,120],[18.5*16,15*16,1,90],[40.5*16,14*16,1,86]])M.gey.push({x:q[0],y:q[1],t:0,d:q[2],H:q[3]});
  for(let i=0;i<3;i++)FX.push({k:'ring',x:BX+(i-1)*34,y:BY+(i%2)*10,l:1.2+i*.2,m:1.2+i*.2,c:'210,235,255',big:1})}
 if(t>4.6)M.fall=clp((t-4.6)/1.5,0,1);
 if(t>5.7&&!f.e){f.e=1;G.shake=Math.max(G.shake||0,7);sfxS(44,1.6,'sawtooth',.12,22);splash(BX,BY,4)}
 if(t>7.1&&!f.g){f.g=1;h.fight();M.k=null}
}
// altura (0..1) con la que va saliendo el Kraken de mentira durante la cinemática
const cineRise=()=>M.k&&M.k.t>4.9?clp((M.k.t-4.9)/2.2,0,1):0;

// ---------- tick general ----------
let hooked=false;
function hook(){if(hooked)return;hooked=true;
 const g0=window.GROUND;window.GROUND=function(){if(g0)g0.apply(this,arguments);if(here())try{seaGround()}catch(e){console.error(e)}};
 const n0=window.netDrawPlayers;window.netDrawPlayers=function(Dr,Lt,cx,cy){if(n0)n0.apply(this,arguments);if(here())try{marDr(Dr,Lt,cx,cy)}catch(e){console.error(e)}}}
function tick(dt){
 if(!here()){if(M.k){M.k=null}M.pan=0;return}
 hook();
 if(G.mode==='title')return;
 dt=Math.min(dt,.1);
 M.t+=dt;
 const moving=!broken()&&stage()<4;
 M.sp+=((moving?1:0)-M.sp)*Math.min(1,dt*.9);
 M.sc+=dt*M.sp*24;
 M.roll*=Math.pow(.25,dt);
 // la cámara se va hacia el boquete mientras sube el Kraken y vuelve al jugador al empezar la pelea
 {const want=(M.k&&M.k.t>2.8)?1:0;M.pan+=(want-M.pan)*Math.min(1,dt*(want?1.7:1.1))}
 M.cr-=dt;if(M.cr<=0){M.cr=3.5+Math.random()*5;sfxS(70+Math.random()*50,.7,'sawtooth',.016,40+Math.random()*30)}
 // salpicaduras de proa
 if(M.sp>.25&&Math.random()<dt*28*M.sp){M.spr.push({x:53*16-2,y:19*16+8+(Math.random()-.5)*8,z:2,vx:30+Math.random()*40,vy:(Math.random()-.5)*26,vz:30+Math.random()*60,l:.6+Math.random()*.5,c:'#eaf6ff'})}
 // espuma que salta por los géiseres
 for(const q of M.gey){q.t+=dt;if(q.t<q.d){const p=q.t/q.d,hh=q.H*Math.pow(Math.sin(Math.min(1,p)*Math.PI),.8);
   if(Math.random()<dt*60)M.spr.push({x:q.x+(Math.random()-.5)*14,y:q.y,z:hh*(.4+Math.random()*.6),vx:(Math.random()-.5)*50,vy:(Math.random()-.5)*20,vz:20+Math.random()*60,l:.8,c:Math.random()<.5?'#e8f6ff':'#9ccff0'})}}
 M.gey=M.gey.filter(q=>q.t<q.d);
 // partículas
 for(const s of M.spr){s.x+=s.vx*dt;s.y+=s.vy*dt;s.z+=s.vz*dt;s.vz-=210*dt;s.l-=dt}
 M.spr=M.spr.filter(s=>s.l>0&&s.z>-2);if(M.spr.length>170)M.spr.splice(0,M.spr.length-170);
 // escombros
 for(const d of M.deb){d.age+=dt;if(d.st)continue;d.x+=d.vx*dt;d.y+=d.vy*dt;d.z+=d.vz*dt;d.vz-=270*dt;d.rot+=d.vr*dt;
   if(d.z<=0&&d.vz<0){const tx=d.x>>4,ty=d.y>>4,wat=!W.ok(tx,ty)||W.gd[W.i(tx,ty)]==='w';
    if(wat){d.dead=1;splash(d.x,d.y,1)}else if(Math.abs(d.vz)>45){d.z=0;d.vz*=-.32;d.vx*=.55;d.vy*=.55;d.vr*=.5}else{d.z=0;d.st=1}}}
 M.deb=M.deb.filter(d=>!d.dead&&d.age<9);
 // la cinemática y los tentáculos
 cineTick(dt);
 for(const T of M.tent){
  if(T.t0!=null&&!T.done){T.r=clp((M.t0x?0:0)+((M.k?M.k.t:99)-T.t0)/1.15,0,1);if(T.r>=1)T.done=1}
  if(M.deadT!=null)T.r=Math.min(T.r,1-clp((M.t-M.deadT)/1.9,0,1))}
 if(M.deadT!=null&&M.t-M.deadT>2.2)M.tent=[];
 for(const p of M.probe){const q=M.k?M.k.t:0;p.r=q<p.t0?0:Math.sin(clp((q-p.t0)/1.3,0,1)*Math.PI)*.62}
 // el barco se sacude cuando el Kraken ataca
 const kb=E.find(q=>q.b&&q.id==='kraken');
 if(kb){if(kb.s==='act'&&!kb._shk){kb._shk=1;M.roll=Math.max(M.roll,1.6);splash(kb.x+(kb.fx||0)*60,kb.y+(kb.fy||0)*40,1)}else if(kb.s!=='act')kb._shk=0}
 // fuera del agua: nada más; en pelea, géiseres pequeños por los boquetes
 if(kb&&kb.s!=='dead'&&Math.random()<dt*.9){const q=[[18.5,15],[40.5,14],[11.5,24.5],[27,24.6]][(Math.random()*4)|0];M.gey.push({x:q[0]*16,y:q[1]*16,t:0,d:.9,H:34+Math.random()*26})}
}
{const u=update;update=function(dt){u(dt);try{tick(dt)}catch(e){console.error('TRVMAR',e)}}}
window.TRVMAR.cine=cine;

// ---------- balanceo: la cámara se mece ----------
function sway(){const a=.7+.28*Math.min(stage(),4)+(broken()?.45:0)+M.roll;
 return[Math.sin(M.t*.85)*a*1.1+Math.sin(M.t*2.1)*.3,Math.sin(M.t*.62+1.3)*a*.9+Math.sin(M.t*1.7)*.22]}
{const d0=draw;draw=function(){
 if(!here()||!cam||G.mode==='title')return d0.apply(this,arguments);
 const s=sway();cam.x+=s[0];cam.y+=s[1];
 let ox=0,oy=0;if(M.pan>.002){const e=M.pan*M.pan*(3-2*M.pan),tx=clp(BX-GW/2,0,W.cols*16-GW),ty=clp(BY-GH/2+24,0,W.rows*16-GH);ox=(tx-cam.x)*e;oy=(ty-cam.y)*e;cam.x+=ox;cam.y+=oy}
 try{return d0.apply(this,arguments)}finally{cam.x-=s[0]+ox;cam.y-=s[1]+oy}}}

// ---------- suelo: tablones, barandas y bordes rotos (se hornea con el mapa) ----------
{const r=RG.find(q=>q.id==='barco');if(r){const b=r.build;r.build=function(W){b.call(this,W);
 // mar exterior (1) vs. boquetes que abra el Kraken en la cubierta (0): se marca ANTES de aplicar la cubierta rota
 {const hw=new Uint8Array(W.cols*W.rows);for(let i=0;i<hw.length;i++)if(W.gd[i]==='w')hw[i]=1;W.hullW=hw}
 W.decorFloor=function(x,T){
  const C=this.cols,R=this.rows,gd=this.gd,hw=this.hullW;
  const hull=(tx,ty)=>this.ok(tx,ty)&&gd[this.i(tx,ty)]==='w'&&hw[this.i(tx,ty)]===1;
  const hole=(tx,ty)=>this.ok(tx,ty)&&gd[this.i(tx,ty)]==='w'&&hw[this.i(tx,ty)]===0;
  for(let ty=0;ty<R;ty++)for(let tx=0;tx<C;tx++){
   if(gd[this.i(tx,ty)]==='w')continue;
   const X=tx*16,Y=ty*16,h=hash(tx*7.3+ty*3.1);
   if(h<.32){x.fillStyle='rgba(0,0,0,.07)';x.fillRect(X,Y+(h*15|0),16,5)}
   // costuras de tablones (3 tablones por baldosa) y juntas
   x.fillStyle='rgba(22,11,4,.42)';x.fillRect(X,Y+5,16,1);x.fillRect(X,Y+10,16,1);
   x.fillStyle='rgba(255,225,170,.08)';x.fillRect(X,Y+6,16,1);x.fillRect(X,Y+11,16,1);x.fillRect(X,Y+1,16,1);
   for(let j=0;j<3;j++){const jx=(hash(tx*5.1+ty*2.7+j*9.3)*13|0)+1;x.fillStyle='rgba(22,11,4,.42)';x.fillRect(X+jx,Y+j*5+(j?1:0),1,j?4:5)}
   if(((tx*3+ty*7)&3)===0){x.fillStyle='#2a1a0c';x.fillRect(X+3,Y+2,1,1);x.fillRect(X+12,Y+8,1,1)}
   // barandas por los bordes del casco
   const nr=this.noRail?this.noRail[this.i(tx,ty)]:0;
   if(hull(tx,ty-1)&&!(nr&1)){x.fillStyle='#2a1a0c';x.fillRect(X,Y,16,1);x.fillStyle='#8a6238';x.fillRect(X,Y+1,16,2);x.fillStyle='#4a2f18';x.fillRect(X,Y+3,16,1);x.fillStyle='rgba(0,0,0,.26)';x.fillRect(X,Y+4,16,2)}
   if(hull(tx,ty+1)&&!(nr&2)){x.fillStyle='rgba(0,0,0,.2)';x.fillRect(X,Y+10,16,2);x.fillStyle='#8a6238';x.fillRect(X,Y+12,16,2);x.fillStyle='#4a2f18';x.fillRect(X,Y+14,16,1);x.fillStyle='#2a1a0c';x.fillRect(X,Y+15,16,1)}
   if(hull(tx-1,ty)&&!(nr&4)){x.fillStyle='#2a1a0c';x.fillRect(X,Y,1,16);x.fillStyle='#8a6238';x.fillRect(X+1,Y,2,16);x.fillStyle='#4a2f18';x.fillRect(X+3,Y,1,16);x.fillStyle='rgba(0,0,0,.24)';x.fillRect(X+4,Y,2,16)}
   if(hull(tx+1,ty)&&!(nr&8)){x.fillStyle='rgba(0,0,0,.24)';x.fillRect(X+10,Y,2,16);x.fillStyle='#8a6238';x.fillRect(X+12,Y,2,16);x.fillStyle='#4a2f18';x.fillRect(X+14,Y,1,16);x.fillStyle='#2a1a0c';x.fillRect(X+15,Y,1,16)}
   // bordes astillados donde la cubierta se ha partido
   const jag=(sd)=>{for(let j=0;j<16;j++){const d=1+(hash(tx*16+j+(sd==='n'||sd==='s'?0:99),ty*3+(sd==='e'||sd==='w'?j:0),sd.charCodeAt(0))*3|0);
     const px=sd==='n'?[X+j,Y,1,d]:sd==='s'?[X+j,Y+16-d,1,d]:sd==='w'?[X,Y+j,d,1]:[X+16-d,Y+j,d,1];
     x.fillStyle='#120804';x.fillRect(px[0],px[1],px[2],px[3]);
     const q=sd==='n'?[X+j,Y+d,1,1]:sd==='s'?[X+j,Y+16-d-1,1,1]:sd==='w'?[X+d,Y+j,1,1]:[X+16-d-1,Y+j,1,1];x.fillStyle='#c8a066';x.fillRect(q[0],q[1],q[2],q[3])}};
   if(hole(tx,ty-1))jag('n');if(hole(tx,ty+1))jag('s');if(hole(tx-1,ty))jag('w');if(hole(tx+1,ty))jag('e')}
 };
 }}}

// ---------- dibujo del mar y del casco (por debajo de los objetos, por encima del agua) ----------
function seaGround(){
 const cx=Math.round(cam.x),cy=Math.round(cam.y),t=M.t,tw=W.cols,st=stage();
 const tx0=Math.max(0,(cx>>4)-1),tx1=Math.min(W.cols-1,((cx+GW)>>4)+1),ty0=Math.max(0,(cy>>4)-1),ty1=Math.min(W.rows-1,((cy+GH)>>4)+1);
 const calm=M.sp>.05||(!broken()&&st<4);
 // 1) crestas de ola que se desplazan hacia popa (el barco avanza hacia la proa → el agua corre al oeste)
 for(let by=(cy/6|0);by<=((cy+GH)/6|0)+1;by++){
  const py=by*6+(hs(by,1)*5|0),par=.55+hs(by,2)*.9,per=46+(hs(by,3)*30|0);
  const off=(((hs(by,4)*per-M.sc*par)%per)+per)%per;
  for(let kx=Math.floor(cx/per)-1;kx<=Math.ceil((cx+GW)/per);kx++){
   const x=kx*per+off,len=6+(hs(by,kx,6)*9|0),tx=(x+len/2)>>4,ty=py>>4;
   if(!W.ok(tx,ty)||W.gd[W.i(tx,ty)]!=='w')continue;
   const al=(.14+.2*Math.sin(t*1.6+hs(by,kx)*9))*(st>=4?.55:1);if(al<.03)continue;
   g.fillStyle='rgba(225,240,255,'+al.toFixed(2)+')';g.fillRect(Math.round(x),py,len,1);
   g.fillStyle='rgba(8,24,44,'+(al*.8).toFixed(2)+')';g.fillRect(Math.round(x)+2,py+1,len-3,1)}}
 // 2) sombra enorme bajo el casco mientras sube el Kraken
 let prog=0;if(M.k)prog=clp(M.k.t/4.6,0,1);else if(broken()&&!S.bk.kraken)prog=1;else if(M.deadT!=null)prog=1-clp((M.t-M.deadT)/2.2,0,1);
 if(prog>0){const rx=60+prog*250*(M.k&&M.k.t>4.6?1.2:1),ry=rx*.58;
  g.save();g.translate(BX,BY);g.scale(1,ry/rx);
  const gr=g.createRadialGradient(0,0,0,0,0,rx);gr.addColorStop(0,'rgba(8,2,22,'+(.5*prog).toFixed(2)+')');gr.addColorStop(1,'rgba(8,2,22,0)');
  g.fillStyle=gr;g.beginPath();g.arc(0,0,rx,0,6.283);g.fill();g.restore()}
 // 3) espuma pegada al casco y costados de tablones
 for(let ty=ty0;ty<=ty1;ty++)for(let tx=tx0;tx<=tx1;tx++){
  const i=W.i(tx,ty),X=tx*16,Y=ty*16;
  if(W.gd[i]==='w'){
   const dN=ty>0&&W.gd[i-tw]!=='w',dW=tx>0&&W.gd[i-1]!=='w',dE=tx<W.cols-1&&W.gd[i+1]!=='w',dS=ty<W.rows-1&&W.gd[i+tw]!=='w';
   if(dN||dW||dE||dS){const a=.34+.22*Math.sin(t*3+tx*.7+ty*.4);g.fillStyle='rgba(235,246,255,'+a.toFixed(2)+')';
    if(dS)g.fillRect(X,Y+14,16,2);if(dW)g.fillRect(X,Y,2,16);if(dE)g.fillRect(X+14,Y,2,16)}
  }else if(!W.hullBand&&ty+1<W.rows&&W.gd[i+tw]==='w'&&W.hullW[i+tw]){
   const X2=X,Y2=Y+16;
   fr(X2,Y2,16,11,'#4a2f18');fr(X2,Y2,16,1,'#8a6238');fr(X2,Y2+1,16,1,'#6e4a26');
   fr(X2,Y2+4,16,1,'#33200f');fr(X2,Y2+8,16,1,'#33200f');
   const bj=(hs(tx,ty,7)*13|0)+1;fr(X2+bj,Y2+1,1,3,'#33200f');fr(X2+((bj+7)%14)+1,Y2+5,1,3,'#33200f');fr(X2+((bj+3)%14)+1,Y2+9,1,2,'#33200f');
   if((tx&1)===0)fr(X2+3,Y2+2,1,1,'#c9a54a');
   fr(X2,Y2+10,16,1,'#1a0e06');
   g.fillStyle='rgba(2,10,20,.38)';g.fillRect(X2,Y2+11,16,3);
   const f=Math.sin(t*2.4+tx*.9);g.fillStyle='rgba(238,248,255,'+(.55+.2*f).toFixed(2)+')';
   g.fillRect(X2+(((tx*5+t*7)%9)|0),Y2+11,5+((f+1)*2|0),1);g.fillRect(X2+(((tx*3+t*5)%7)|0)+8-4,Y2+13,4,1)}}
 // 4) estela en la popa (solo si navega)
 if(M.sp>.05){const sx=5*16-2,sy=19*16+8;
  for(let l=-3;l<=3;l++)for(let s=0;s<9;s++){const x=sx-s*12-((M.sc*.9)%12),y=sy+l*8+l*s*1.5+Math.sin(t*2+s+l)*1.5,a=(1-s/9)*.5*M.sp*(1-Math.abs(l)*.1);
   if(a<=.02||x<0)continue;g.fillStyle='rgba(235,246,255,'+a.toFixed(2)+')';g.fillRect(Math.round(x),Math.round(y),7,1)}}
 // 4b) el boquete por donde sube el Kraken: agua negra con bordes de tablones astillados
 if(broken()){g.fillStyle='#04111f';g.beginPath();g.ellipse(BX,BY+3,52,19,0,0,6.283);g.fill();
  g.fillStyle='rgba(120,170,215,'+(.16+.08*Math.sin(t*2.2)).toFixed(2)+')';g.beginPath();g.ellipse(BX-8,BY+1,34,10,0,0,6.283);g.fill();
  for(let i=0;i<30;i++){const a=i/30*6.283,j=hs(i,5),rx=50+j*7,ry=18+j*3,px=BX+Math.cos(a)*rx,py=BY+3+Math.sin(a)*ry,l=3+(j*5|0);
   pline(g,px,py,px+Math.cos(a)*l,py+Math.sin(a)*l*.6-(j>.5?2:0),i%3?'#120804':'#c8a066',2)}}
 // 5) anillos de agua alrededor del Kraken mientras sube/pelea
 const kb=E.find(q=>q.b&&q.id==='kraken'&&q.s!=='dead');
 const kx=M.k&&M.k.t>4.8?BX:kb?kb.x:null,ky=M.k&&M.k.t>4.8?BY:kb?kb.y:null;
 if(kx!=null){for(let i=0;i<3;i++){const r=((t*.45+i/3)%1);g.strokeStyle='rgba(200,225,255,'+((1-r)*.5).toFixed(2)+')';g.lineWidth=2;g.beginPath();g.ellipse(kx,ky+2,34+r*96,10+r*30,0,0,6.283);g.stroke()}
  g.fillStyle='rgba(6,2,18,.28)';g.beginPath();g.ellipse(kx,ky+2,70,20,0,0,6.283);g.fill()}
}

// ---------- tentáculo gigante ----------
function tentacle(T){
 const r=T.r;if(!(r>.01))return;
 const N=10,pts=[],C1='#3d3070',C2='#6f5cb0',CS='#e0a4c8',sw=T.fall?1.8:1;
 // anillo de espuma en la base
 g.strokeStyle='rgba(225,240,255,'+(.5*Math.min(1,r*2)).toFixed(2)+')';g.lineWidth=2;g.beginPath();g.ellipse(T.bx,T.by,16+Math.sin(M.t*3+T.ph)*2,6,0,0,6.283);g.stroke();
 for(let i=0;i<=N;i++){const s=i/N*r,e=s*s*(3-2*s);
  pts.push([T.bx+(T.hx-T.bx)*e+Math.sin(M.t*1.4+T.ph+s*5)*(5+11*s)*sw,
            T.by+(T.hy-T.by)*e-Math.sin(Math.min(1,s*1.15)*Math.PI*.95)*T.H*(T.fall?.8:1)+Math.sin(M.t*1.1+T.ph*2+s*4)*3.2*s])}
 // v8.37: trazos de canvas (antes cada segmento era una línea pixel a pixel con pline)
 const lc=g.lineCap;g.lineCap='round';
 for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],u=i/N,w=Math.max(2,Math.round(12-u*9));
  g.strokeStyle=i%2?C1:C2;g.lineWidth=w;g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke();
  if(i%2===0){g.strokeStyle='rgba(150,130,220,.5)';g.lineWidth=1;g.beginPath();g.moveTo(a[0]+1,a[1]-w/2+1);g.lineTo(b[0]+1,b[1]-w/2+1);g.stroke()}
  if(u>.18&&u<.95&&i%2===0)fr(b[0],b[1]+w/2-1,2,2,CS)}
 g.lineCap=lc;
 const e=pts[pts.length-1];fr(e[0]-1,e[1]-1,3,3,C2)
}

// ---------- mástiles, velas y jarcia ----------
function sailCol(){const s=stage();return broken()?'#6a3a52':s>=4?'#7a4a60':s>=3?'#b9c4d0':'#e0d6bb'}
function sail(x,top,bot,w,bil,al){
 // vela cuadra hinchada hacia la proa: costados y pie curvos, costuras que siguen la panza
 g.save();g.globalAlpha=al;const c=sailCol(),h=bot-top,bl=Math.max(1,bil*1.6),L=x-w/2,Rr=x+w/2;
 g.beginPath();g.moveTo(L,top);g.lineTo(Rr,top);
 g.bezierCurveTo(Rr+bl*1.1,top+h*.3,Rr+bl*1.5,top+h*.7,Rr-2,bot);
 g.quadraticCurveTo(x+bl*.5,bot-(5+bl*.6),L+2,bot);
 g.bezierCurveTo(L+bl*1.5,top+h*.7,L+bl*1.1,top+h*.3,L,top);g.closePath();
 g.fillStyle=c;g.fill();
 const sh=g.createLinearGradient(0,top,0,bot);sh.addColorStop(0,'rgba(0,0,0,.05)');sh.addColorStop(1,'rgba(0,0,0,.3)');g.fillStyle=sh;g.fill();
 g.save();g.clip();
 const hl=g.createLinearGradient(L,0,Rr+bl*1.5,0);hl.addColorStop(0,'rgba(255,255,255,0)');hl.addColorStop(.55,'rgba(255,248,225,.16)');hl.addColorStop(1,'rgba(0,0,0,.14)');g.fillStyle=hl;g.fillRect(L-4,top,w+bl*2+8,h+10);
 g.restore();
 g.fillStyle='rgba(0,0,0,.18)';g.fillRect(Math.round(L),top,w,3);
 g.strokeStyle='rgba(60,40,20,.38)';g.lineWidth=1;
 for(const k of[-.33,0,.33]){g.beginPath();g.moveTo(Math.round(x+w*k),top+3);g.quadraticCurveTo(x+w*k+bl*1.25,top+h*.5,Math.round(x+w*k+bl*.1),bot+1);g.stroke()}
 for(const f of[.38,.7]){const yy=top+h*f;g.beginPath();g.moveTo(L+bl*.5*f,yy);g.quadraticCurveTo(x+bl*1.3,yy+3,Rr+bl*1.2*Math.sin(f*2.2)-1,yy);g.stroke()}
 if(stage()>=4||broken()){g.fillStyle='rgba(0,0,0,.5)';for(let i=0;i<5;i++){const tx=x-w/2+6+i*(w-12)/4;g.beginPath();g.moveTo(tx-3,bot);g.lineTo(tx,bot-9-(i%2)*6);g.lineTo(tx+3,bot+1);g.fill()}}
 g.restore()}
function drawMast(m){
 const x=m.tx*16+8,y=m.ty*16+14,st=stage(),br=broken();
 const slack=st>=4||br,bil=slack?Math.sin(M.t*.9+m.id*2)*2:(3+Math.sin(M.t*1.3+m.id)*2+M.sp*4);
 const under=P&&P.y<y&&P.y>y-m.h&&P.x>x-10&&P.x<x+m.w*.8,al=(st>=3&&!br?.62:.95)*(under?.55:1);
 const wood='#4a3018',lt='#8a6238',dk='#2a1a0c';
 if(m.id===1&&br){
  // palo mayor caído a la izquierda: cae con aceleración y queda tendido sobre la cubierta
  const th=(M.fall*M.fall)*Math.PI/2,L=m.h;
  const tip=[x-Math.sin(th)*L,y-Math.cos(th)*L*.9+Math.sin(th)*12];
  pline(g,x,y-2,tip[0],tip[1],dk,6);pline(g,x,y-3,tip[0],tip[1]-1,lt,2);
  if(M.fall>.2){const a=[x-Math.sin(th)*L*.2,y-Math.cos(th)*L*.18],b=[x-Math.sin(th)*L*.9,y-Math.cos(th)*L*.8+Math.sin(th)*10];
   g.save();g.globalAlpha=.85;g.fillStyle=sailCol();g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.lineTo(b[0]+6,b[1]+22*M.fall);g.lineTo(a[0]+10,a[1]+28*M.fall);g.closePath();g.fill();g.restore()}
  fr(x-7,y-6,14,7,dk);fr(x-6,y-7,12,2,wood);return}
 if(m.id>=2&&br){ // palos de trinquete y bauprés roto a media altura
  const h=46;fr(x-8,y-5,16,6,dk);fr(x-6,y-6,12,2,lt);pline(g,x,y-4,x,y-h,wood,5);pline(g,x-1,y-4,x-1,y-h,lt,1);
  for(let i=0;i<4;i++)pline(g,x+(i-1.5)*2,y-h,x+(i-1.5)*3-1,y-h-5-(i%2)*3,'#a07a48',1);
  g.save();g.globalAlpha=.8;g.fillStyle=sailCol();g.beginPath();g.moveTo(x+1,y-h+3);g.lineTo(x+22+Math.sin(M.t*1.6)*3,y-h+14);g.lineTo(x+12,y-h+34);g.lineTo(x+1,y-h+26);g.closePath();g.fill();g.restore();return}
 // mástil en pie: fuste grueso con collar y aros dorados, cofa anular y vela en media luna hinchada hacia la proa
 const h=m.h;
 // jarcia: obenques con flechastes desde la cofa hasta las bordas
 g.save();g.globalAlpha=.78;g.strokeStyle='#241810';g.lineWidth=1;
 for(const k of[-1,1])for(const f of[.74,.46]){const sx=x,sy=y-h*f,ex=x+k*(m.w*.5+(f>.6?30:10)),ey=y+(f>.6?9:3);
  g.beginPath();g.moveTo(sx,sy);g.lineTo(ex,ey);g.stroke();
  for(let q=.22;q<.95;q+=.14){const px=sx+(ex-sx)*q,py=sy+(ey-sy)*q;g.beginPath();g.moveTo(px-3,py);g.lineTo(px+3,py);g.stroke()}}
 g.restore();
 g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(x,y+2,14,5,0,0,6.283);g.fill();
 fr(x-10,y-5,20,8,dk);fr(x-9,y-6,18,3,lt);fr(x-10,y-2,20,1,'#c9a54a');fr(x-9,y+1,18,1,'#120804');
 // fuste
 pline(g,x-3,y-4,x-3,y-h,wood,7);pline(g,x-2,y-4,x-2,y-h,lt,2);pline(g,x+3,y-4,x+3,y-h,dk,1);
 for(const f of[.12,.34,.58,.86])fr(x-4,y-h*f,8,2,'#c9a54a');
 // vela en media luna (borde de ataque pegado al palo, panza hacia la proa)
 {const top=y-h*.93,bot=y-h*.13,hh=bot-top,sl=st>=4||br,bw=Math.max(5,(m.w*.55+bil*2.4)*(sl?.55:1)),x0=x+4;
  g.save();g.globalAlpha=al;
  const sailPath=s=>{g.moveTo(x0,top);g.bezierCurveTo(x0+bw*.9*s,top+hh*.12,x0+bw*1.3*s,top+hh*.55,x0+2*s,bot)};
  g.beginPath();sailPath(1);g.lineTo(x0,bot);g.closePath();
  const gr=g.createLinearGradient(x0,0,x0+bw*1.3,0);gr.addColorStop(0,'#a89a7c');gr.addColorStop(.35,sailCol());gr.addColorStop(.75,'#f6efd8');gr.addColorStop(1,'#cfc3a4');
  g.fillStyle=gr;g.fill();
  g.strokeStyle='rgba(70,50,30,.38)';g.lineWidth=1;for(const s of[.26,.5,.75]){g.beginPath();sailPath(s);g.stroke()}
  g.strokeStyle='rgba(40,28,16,.55)';g.beginPath();sailPath(1);g.stroke();
  for(const f of[.3,.55,.8]){const yy=top+hh*f;fr(Math.round(x0),Math.round(yy),Math.round(bw*(.35+.85*Math.sin(f*2.6))),1,'rgba(60,40,20,.25)')}
  if(sl){g.fillStyle='rgba(0,0,0,.45)';for(let i=0;i<4;i++){const ty=bot-6-i*9;g.beginPath();g.moveTo(x0+bw*.6,ty);g.lineTo(x0+bw*(.9+.1*i%2)+3,ty+4);g.lineTo(x0+bw*.5,ty+7);g.fill()}}
  g.restore()}
 // cofa: plataforma anular con barandilla y remates dorados
 {const cy2=y-h*.76;g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(x-3,cy2+4,13,5,0,0,6.283);g.fill();
  g.fillStyle='#3a2512';g.beginPath();g.ellipse(x-3,cy2+1,12,5,0,0,6.283);g.fill();
  g.fillStyle='#120804';g.beginPath();g.ellipse(x-3,cy2,8,3.2,0,0,6.283);g.fill();
  g.strokeStyle='#8a6238';g.lineWidth=2;g.beginPath();g.ellipse(x-3,cy2-1,12,5,0,0,6.283);g.stroke();
  g.strokeStyle='#c9a54a';g.lineWidth=1;g.beginPath();g.ellipse(x-3,cy2-3,12,5,0,0,6.283);g.stroke();
  for(let k=0;k<8;k++){const a=k*.785;fr(x-3+Math.cos(a)*12-1,cy2-1+Math.sin(a)*5-3,2,3,'#6e4a26')}
  pline(g,x-3,cy2,x-3,y-h,wood,7);pline(g,x-2,cy2,x-2,y-h,lt,2)}
 fr(x-6,y-h-3,7,3,lt);
 // banderín en lo alto
 const fl=Math.sin(M.t*(slack?1.2:4)+m.id),fx=x+1,fy=y-h-3;
 g.fillStyle=st>=4?'#c0243c':'#c9a54a';g.beginPath();g.moveTo(fx,fy);g.lineTo(fx+(slack?5:15)+fl*2,fy+2+(slack?5:fl));g.lineTo(fx,fy+5);g.closePath();g.fill()
}
function post(x,y){fr(x-1,y-8,3,8,'#5a3a1e');fr(x,y-8,1,7,'#7a5430');fr(x-1,y-9,3,1,'#9a7040');fr(x-2,y-1,5,1,'#2a1a0c')}
function ripples(x,y,rise){for(let i=0;i<3;i++){const r=((M.t*.5+i/3)%1);g.strokeStyle='rgba(215,235,255,'+((1-r)*.6*Math.min(1,rise*3+.2)).toFixed(2)+')';g.lineWidth=2;g.beginPath();g.ellipse(x,y+3,28+r*(90+rise*30),8+r*(28+rise*8),0,0,6.283);g.stroke()}}

// ---------- objetos con orden de profundidad: postes, mástiles, tentáculos, Kraken de la cinemática, escombros, chorros ----------
function marDr(Dr,Lt,cx,cy){
 const tw=W.cols,tx0=Math.max(0,(cx>>4)-1),tx1=Math.min(W.cols-1,((cx+GW)>>4)+1),ty0=Math.max(0,(cy>>4)-1),ty1=Math.min(W.rows-1,((cy+GH)>>4)+1);
 // postes de baranda (cada tres baldosas)
 for(let ty=ty0;ty<=ty1;ty++)for(let tx=tx0;tx<=tx1;tx++){
  if((tx+ty)%3!==0)continue;const i=W.i(tx,ty);if(W.gd[i]==='w'||(W.noRail&&W.noRail[i]))continue;
  const hw=W.hullW,n=ty>0&&W.gd[i-tw]==='w'&&hw[i-tw],s=ty<W.rows-1&&W.gd[i+tw]==='w'&&hw[i+tw],wv=tx>0&&W.gd[i-1]==='w'&&hw[i-1],ev=tx<W.cols-1&&W.gd[i+1]==='w'&&hw[i+1];
  if(n){const x=tx*16+8,y=ty*16+5;Dr.push({y,f:()=>post(x,y)})}
  if(s){const x=tx*16+8,y=ty*16+15;Dr.push({y,f:()=>post(x,y)})}
  if(wv){const x=tx*16+3,y=ty*16+14;Dr.push({y,f:()=>post(x,y)})}
  if(ev){const x=tx*16+13,y=ty*16+14;Dr.push({y,f:()=>post(x,y)})}}
 // mástiles
 for(const m of MASTS){const x=m.tx*16+8;if(x<cx-110-m.h||x>cx+GW+110+m.h)continue;Dr.push({y:m.ty*16+16,f:()=>drawMast(m)})}
 // tentáculos de tanteo y gigantes
 for(const T of M.probe)if(T.r>.02)Dr.push({y:Math.max(T.hy,T.by)+4,f:()=>tentacle(T)});
 for(const T of M.tent)if(T.r>.02)Dr.push({y:T.hy+22,f:()=>tentacle(T)});
 // Kraken de la cinemática (antes de que exista el jefe de verdad)
 const k=M.k;
 if(k&&k.t>4.8){const r=cineRise();
  Dr.push({y:BY-2,f:()=>{ripples(BX,BY,r);TRV.drawKraken(BX,BY,0,1,'idle',0,{rise:r})}});
  Lt.push({x:BX-cx,y:BY-52-cy,r:130,i:.8,c:'255,200,70',a:.12+.1*r})}
 const kb=E.find(q=>q.b&&q.id==='kraken'&&q.s!=='dead');
 if(kb)Lt.push({x:kb.x-cx,y:kb.y-54-cy,r:130,i:.8,c:'255,200,70',a:.16});
 // escombros, géiseres y salpicaduras: siempre por encima
 Dr.push({y:99990,f:()=>{
  for(const q of M.gey){const p=q.t/q.d,hh=q.H*Math.pow(Math.sin(Math.min(1,p)*Math.PI),.8);if(hh<2)continue;
   for(let yy=0;yy<hh;yy+=3){const w=Math.max(2,Math.round(9-6*yy/hh+Math.sin(M.t*30+yy)*1.5));fr(q.x-w/2,q.y-yy,w,3,yy>hh*.8?'rgba(238,248,255,.85)':'rgba(170,215,245,.6)')}
   fr(q.x-9,q.y-1,18,2,'rgba(238,248,255,.6)')}
  for(const d of M.deb){const a=Math.cos(d.rot)*d.L/2,b=Math.sin(d.rot)*d.L/2*.6;
   if(d.z>1)fr(d.x,d.y,2,1,'rgba(0,0,0,.3)');
   g.globalAlpha=d.age>7?Math.max(0,1-(d.age-7)/2):1;pline(g,d.x-a,d.y-b-d.z,d.x+a,d.y+b-d.z,d.c,2);g.globalAlpha=1}
  for(const s of M.spr){g.globalAlpha=Math.min(1,s.l*2.5);fr(s.x,s.y-s.z,2,2,s.c);g.globalAlpha=1}}})
}
})();
