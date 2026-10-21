// ===== JUICE DE COMBATE (v8.52): impacto, ritmo y emoción sobre el combate existente =====
// Capa solo visual/temporal por envoltorios (no cambia daño, IA ni colisiones). Carga AL FINAL.
//  · Hit-stop escalado (golpe ligero < pesado < remate < muerte < jefe) y CÁMARA que patea en la dirección del golpe
//  · Zoom de impacto y cámara lenta breve en paradas perfectas, remates, muertes y golpes casi mortales (solo en solitario)
//  · Líneas de impacto direccionales, anillos, polvo al esquivar y manchas persistentes en el suelo (sangre / ceniza)
//  · Enemigos: aplastamiento + retroceso al recibir golpe, temblor al preparar un ataque
//  · Jugador: aplastamiento al ser herido; latido y viñeta roja con poca vida
//  · Contador de golpes encadenados con hitos y rótulos grandes (¡PARADA!, REMATE, ¡RACHA!)
// Respeta CFG.shake (si el temblor está apagado, no hay patada ni zoom) y PERF.lv (calidad baja = menos efectos).
(function(){
if(typeof hitE==='undefined'||typeof takeHit==='undefined'||typeof update==='undefined'||typeof draw==='undefined'||typeof drawFX==='undefined'||typeof drawE==='undefined')return;
const JC={kick:{x:0,y:0},zoom:0,zx:GW/2,zy:GH/2,wf:0,slT:0,slS:1,cb:0,ct:0,cp:0,txt:null,hb:0,ps:'idle',pq:0};
window.JUICE=JC;
const lowQ=()=>typeof PERF!=='undefined'&&PERF.lv>=2,fxOn=()=>!!CFG.shake&&!lowQ(),solo=()=>!(typeof NET!=='undefined'&&NET&&NET.on);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const slow=(t,s)=>{if(!solo()||!CFG.shake)return;if(JC.slT<=0){JC.slT=t;JC.slS=s}else{JC.slT=Math.max(JC.slT,t);JC.slS=Math.min(JC.slS,s)}};
const zoomP=(z,x,y)=>{if(!fxOn())return;JC.zoom=Math.max(JC.zoom,z);if(x!==undefined){JC.zx=x;JC.zy=y}};
const kickC=(x,y)=>{if(!fxOn())return;JC.kick.x+=x;JC.kick.y+=y;const m=Math.hypot(JC.kick.x,JC.kick.y);if(m>9){JC.kick.x*=9/m;JC.kick.y*=9/m}};
const say=(t,c,l)=>{JC.txt={t,c:c||'#fff',l:l||1,m:l||1}};
const star=(x,y,a,n,r,c,spread,l)=>{if(lowQ())return;FX.push({k:'jx',x,y,a,n,r,c,sp:spread,l:l||.2,m:l||.2})};
// manchas persistentes en el suelo (se hornean en el canvas base del mapa)
function splat(x,y,r,col){if(lowQ()||!W||!W.base)return;try{const tx=x>>4,ty=y>>4;if(!W.ok(tx,ty))return;const gd=W.gd[W.i(tx,ty)];if(gd==='w'||gd==='k')return;
 const c=W.base.getContext('2d');c.save();c.globalAlpha=.5;c.fillStyle=col;const n=3+(r/3|0);for(let i=0;i<n;i++){const a=R()*6.283,d=R()*r;c.beginPath();c.ellipse(x+Math.cos(a)*d,y+Math.sin(a)*d*.5,1+R()*r*.3,(1+R()*r*.3)*.5,0,0,6.283);c.fill()}c.restore()}catch(e){}}
const bloodCol=e=>e.t==='hollow'?'#1c1226':e.b?'#6a0c28':'#5c0c18';
const sparkCol=e=>e.t==='hollow'?'#8a5cc0':'#d8284a';

// ---------- golpes al enemigo ----------
const _hitE=hitE;hitE=function(e,d,kb,hv){const hp0=e.hp,dead0=e.s==='dead',r=_hitE.apply(this,arguments);
 try{if(!dead0&&e.hp<=hp0&&P){const dmg=hp0-e.hp,l=Math.hypot(e.x-P.x,e.y-P.y)||1,ux=(e.x-P.x)/l,uy=(e.y-P.y)/l,a=Math.atan2(uy,ux);
  const exec=G.hs>=.28,big=!!hv||exec,kill=e.s==='dead',boss=!!e.b;
  // hit-stop escalado
  G.hs=Math.max(G.hs||0,kill?(boss?.3:.17):exec?.3:big?.15:.075);
  kickC(ux*(big?4.5:2),uy*(big?4.5:2)*.7);
  e.jq=.22;e.jx=ux;e.jy=uy;e.jm=big?1.6:1;
  star(e.x,e.y-10,a,big?9:6,big?28:17,big?'255,225,140':'255,255,255',1.0,big?.26:.18);
  spark(e.x,e.y-8,sparkCol(e),big?8:3,14,1.2);
  splat(e.x+ux*6,e.y+4,big?7:4,bloodCol(e));
  if(big)zoomP(.02,e.x-cam.x,e.y-cam.y);
  if(exec){say('REMATE','#ffb347',1);JC.wf=Math.max(JC.wf,.35);slow(.18,.3);if(window.playSfx)playSfx('boom',.5,.9)}
  // racha de golpes
  JC.cb++;JC.ct=2.6;JC.cp=.25;
  if(JC.cb>0&&JC.cb%10===0){say('¡RACHA x'+JC.cb+'!','#ffe66d',1.1);kickC(0,-3);JC.wf=Math.max(JC.wf,.18)}
  if(kill){
   FX.push({k:'ring',x:e.x,y:e.y,l:.5,m:.5,c:boss?'255,230,160':'255,200,200',big:1});
   star(e.x,e.y-12,a,boss?16:11,boss?46:30,boss?'255,240,190':'255,170,170',3.2,boss?.5:.32);
   splat(e.x,e.y+4,boss?14:9,bloodCol(e));splat(e.x+ux*10,e.y+6,5,bloodCol(e));
   spark(e.x,e.y-10,sparkCol(e),boss?24:10,16,1.5);
   kickC(ux*3,uy*2);if(window.playSfx)playSfx(boss?'boom_long':'thud',boss?.7:.45,boss?.8:.85);
   if(boss){JC.wf=Math.max(JC.wf,.55);zoomP(.07,e.x-cam.x,e.y-cam.y);slow(.9,.25)}
   else{const left=E.filter(x=>x!==e&&x.s!=='dead'&&x.aw&&!x.npc&&Math.hypot(x.x-P.x,x.y-P.y)<220).length;
    if(left===0&&JC.cb>=2){zoomP(.035,e.x-cam.x,e.y-cam.y);slow(.4,.35)}else slow(.1,.55)}}
 }}catch(x){}
 return r};

// ---------- golpes al jugador y paradas ----------
const _takeHit=takeHit;takeHit=function(d,fx,fy){const hp0=P.hp,pa0=S.st.parries,r=_takeHit.apply(this,arguments);
 try{
  if(S.st.parries>pa0){ // parada perfecta
   const x=P.x+(P.fx||0)*9,y=P.y-10;star(x,y,Math.atan2(P.fy||0,P.fx||1),12,34,'255,230,109',3.2,.34);
   FX.push({k:'ring',x:P.x,y:P.y,l:.45,m:.45,c:'255,230,109',big:1});
   G.hs=Math.max(G.hs||0,.16);zoomP(.04,P.x-cam.x,P.y-cam.y);slow(.16,.3);JC.wf=Math.max(JC.wf,.25);say('¡PARADA!','#ffe66d',.9)}
  else if(P.hp<hp0){
   const dmg=hp0-P.hp,l=Math.hypot(fx||0,fy||0)||1,ux=(fx||0)/l,uy=(fy||0)/l;
   kickC(ux*clamp(2+dmg/9,2,7),uy*clamp(2+dmg/9,2,7)*.7);P.jq=.22;JC.cb=0;JC.ct=0;
   star(P.x,P.y-10,Math.atan2(uy,ux),8,22,'255,90,110',1.2,.22);splat(P.x,P.y+4,5,'#5c0c18');
   zoomP(.025,P.x-cam.x,P.y-cam.y);
   if(P.hp<=0||dmg>=P.mhp*.28)slow(.18,.35)}
 }catch(x){}
 return r};

// ---------- tiempo: cámara lenta, temporizadores, polvo de esquiva ----------
const _update=update;update=function(dt){
 let k=1;if(JC.slT>0&&G.mode==='play'&&solo()){k=JC.slS;JC.slT-=dt;if(JC.slT<=0){JC.slT=0;JC.slS=1}}
 _update.call(this,dt*k);
 try{if(G.mode==='play'&&P){
  for(const e of E)if(e.jq>0)e.jq-=dt*k;if(P.jq>0)P.jq-=dt*k;
  if(JC.ct>0){JC.ct-=dt;if(JC.ct<=0)JC.cb=0}if(JC.cp>0)JC.cp-=dt;if(JC.wf>0)JC.wf=Math.max(0,JC.wf-dt*2.4);
  if(JC.txt){JC.txt.l-=dt;if(JC.txt.l<=0)JC.txt=null}
  // esquiva: nube de polvo y líneas de velocidad
  if(P.s==='dodge'&&JC.ps!=='dodge'){const a=Math.atan2(P.ky||0,P.kx||0)+Math.PI;star(P.x,P.y-8,(P.dax!==undefined?Math.atan2(P.day,P.dax):a)+Math.PI,5,24,'200,210,230',.5,.22);
   spark(P.x,P.y+2,'#8a8498',6,2,.8);FX.push({k:'ring',x:P.x,y:P.y+2,l:.25,m:.25,c:'200,200,220'})}
  JC.ps=P.s}}catch(e){}};

// ---------- dibujo: patada de cámara, líneas de impacto ----------
const _drawFX=drawFX;drawFX=function(f){
 if(f.k!=='jx')return _drawFX(f);
 const p=1-f.l/f.m,al=Math.max(0,1-p);g.save();g.translate(f.x,f.y);g.strokeStyle='rgba('+f.c+','+al+')';g.lineWidth=p<.4?1.5:1;g.beginPath();
 for(let i=0;i<f.n;i++){const t=f.n>1?i/(f.n-1)-.5:0,j=((i*37)%7)/7-.5,a=f.a+t*2*f.sp+j*.35,r1=f.r*(.18+p*.55),r2=f.r*(.45+p*.75)*(.8+((i*53)%5)/12);
  g.moveTo(Math.cos(a)*r1,Math.sin(a)*r1*.8);g.lineTo(Math.cos(a)*r2,Math.sin(a)*r2*.8)}
 g.stroke();g.restore()};

const _drawE=drawE;drawE=function(e){
 if(e.s==='dead')return _drawE(e);
 const hit=e.jq>0,wind=e.s==='wind'&&!e.b;if(!hit&&!wind)return _drawE(e);
 g.save();g.translate(e.x,e.y);
 if(hit){const k=Math.max(0,e.jq/.22),s=Math.pow(k,1.4),m=e.jm||1;g.translate((e.jx||0)*3*m*s,(e.jy||0)*1.5*m*s);g.scale(1+.13*m*s,1-.15*m*s)}
 else g.translate(Math.sin(TM*70)*.7,0);
 g.translate(-e.x,-e.y);_drawE(e);g.restore()};

const _drawP=typeof drawP!=='undefined'?drawP:null;
if(_drawP)drawP=function(){if(!(P&&P.jq>0)||P.s==='dead')return _drawP.apply(this,arguments);
 const k=Math.max(0,P.jq/.22),s=Math.pow(k,1.4);g.save();g.translate(P.x,P.y);g.scale(1+.1*s,1-.12*s);g.translate(-P.x,-P.y);_drawP.apply(this,arguments);g.restore()};

const _draw=draw;draw=function(){
 if(!W||!P||G.mode==='title')return _draw.apply(this,arguments);
 const ox=cam.x,oy=cam.y;cam.x+=JC.kick.x;cam.y+=JC.kick.y;JC.kick.x*=.78;JC.kick.y*=.78;if(Math.abs(JC.kick.x)+Math.abs(JC.kick.y)<.05)JC.kick.x=JC.kick.y=0;
 try{_draw.apply(this,arguments)}finally{cam.x=ox;cam.y=oy}
 try{
  // zoom de impacto (copia el fotograma y lo reescala hacia el punto del golpe)
  if(JC.zoom>.002&&fxOn()){const cvs=g.canvas;let tc=JC.tc;if(!tc||tc.width!==cvs.width){tc=JC.tc=document.createElement('canvas');tc.width=cvs.width;tc.height=cvs.height}
   const t=tc.getContext('2d');t.drawImage(cvs,0,0);const s=1+JC.zoom,w=GW*s,h=GH*s,cx=clamp(JC.zx,0,GW),cy=clamp(JC.zy,0,GH);
   g.imageSmoothingEnabled=false;g.drawImage(tc,0,0,GW,GH,-(cx*(s-1)),-(cy*(s-1)),w,h);JC.zoom*=.8}else JC.zoom=0;
  if(JC.wf>0){g.fillStyle='rgba(255,255,255,'+Math.min(.55,JC.wf*.6)+')';g.fillRect(0,0,GW,GH)}
  // latido y viñeta con poca vida
  if(P.s!=='dead'&&P.hp/P.mhp<.3){const b=Math.pow(Math.max(0,Math.sin(TM*7.5)),10),a=.1+.22*b,gr=g.createRadialGradient(GW/2,GH/2,GH*.25,GW/2,GH/2,GH*.85);gr.addColorStop(0,'rgba(120,0,20,0)');gr.addColorStop(1,'rgba(120,0,20,'+a+')');g.fillStyle=gr;g.fillRect(0,0,GW,GH);
   if(b>.9&&performance.now()-JC.hb>650&&G.mode==='play'){JC.hb=performance.now();if(window.playSfx)playSfx('thud',.22,.6)}}
  // contador de golpes
  if(JC.cb>=2&&JC.ct>0){const n=JC.cb,pop=JC.cp>0?1+JC.cp*1.2:1,col=n>=15?'#ff6b4a':n>=10?'#ff9a3c':n>=5?'#ffe66d':'#fff',sz=Math.round(10*pop);
   g.globalAlpha=Math.min(1,JC.ct*1.5);tx(n+' GOLPES',9,78,col,'left',sz);fr(9,84,Math.max(0,34*JC.ct/2.6),1,col);g.globalAlpha=1}
  // rótulos grandes
  if(JC.txt){const t=JC.txt,p=1-t.l/t.m,sz=Math.round(14+Math.max(0,.25-p)*40),a=Math.min(1,t.l*3);g.globalAlpha=a;tx(t.t,GW/2,GH/2-48,'#000','center',sz);tx(t.t,GW/2,GH/2-50,t.c,'center',sz);g.globalAlpha=1}
 }catch(e){}};
})();
