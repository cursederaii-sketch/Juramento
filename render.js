// ===== RENDER: mundo, personajes, efectos, iluminación y HUD =====
const FONT='"Press Start 2P",monospace';
const fr=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),w,h)};
// Rendimiento: los degradados se pre-renderizan una sola vez (sprites) y cada fotograma sólo se copian con drawImage.
const PERF={lv:0,ema:0,fr:0,t:0,good:0};
const GLS={};
const glowSpr=(rgb,R)=>{const k=rgb+'|'+R;let c=GLS[k];if(!c){c=mkc(R*2,R*2);const x=c.getContext('2d'),q=x.createRadialGradient(R,R,0,R,R,R);q.addColorStop(0,'rgba('+rgb+',1)');q.addColorStop(1,'rgba('+rgb+',0)');x.fillStyle=q;x.fillRect(0,0,R*2,R*2);GLS[k]=c}return c};
const glow=(x,y,rad,rgb,a)=>{if(!(a>0)||!(rad>0))return;const R=Math.max(1,Math.round(rad)),po=g.globalCompositeOperation,pa=g.globalAlpha;g.globalCompositeOperation='lighter';g.globalAlpha=pa*(a>1?1:a);g.drawImage(glowSpr(rgb,R),Math.round(x)-R,Math.round(y)-R);g.globalAlpha=pa;g.globalCompositeOperation=po};
const LGS={};
const lightSpr=(R,i)=>{const k=R+'|'+i;let c=LGS[k];if(!c){c=mkc(R*2,R*2);const x=c.getContext('2d'),q=x.createRadialGradient(R,R,R*.08,R,R,R);q.addColorStop(0,'rgba(0,0,0,'+i+')');q.addColorStop(.55,'rgba(0,0,0,'+i*.5+')');q.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=q;x.fillRect(0,0,R*2,R*2);LGS[k]=c}return c};
const FGS={};
const fogSpr=(rgb,R,r0,al)=>{const k=rgb+'|'+R+'|'+r0+'|'+al;let c=FGS[k];if(!c){c=mkc(R*2,R*2);const x=c.getContext('2d'),q=x.createRadialGradient(R,R,r0,R,R,R);q.addColorStop(0,'rgba('+rgb+','+al+')');q.addColorStop(1,'rgba('+rgb+',0)');x.fillStyle=q;x.fillRect(0,0,R*2,R*2);FGS[k]=c}return c};
const VIGS={};
const vigSpr=(k,r0,rgb,al)=>VIGS[k]||(VIGS[k]=(()=>{const c=mkc(GW,GH),x=c.getContext('2d'),q=x.createRadialGradient(GW/2,GH/2,r0,GW/2,GH/2,GW*.62);q.addColorStop(0,'rgba('+rgb+',0)');q.addColorStop(1,'rgba('+rgb+','+al+')');x.fillStyle=q;x.fillRect(0,0,GW,GH);return c})());
// capa de agua animada: un único canvas del tamaño del mapa por fotograma de animación
const waterSet=th=>th._ws||(th._ws=[0,1,2,3].map(f=>[0,1,2,3,4].map(v=>bakeWater(th,f,v))));
function waterLayers(w){if(w._wl)return w._wl;const ws=waterSet(w.th);w._wl=[0,1,2,3].map(f=>{const c=mkc(w.cols*16,w.rows*16),x=c.getContext('2d');for(const t of w.water){x.drawImage(ws[f][t.v],t.tx*16,t.ty*16);if(t.e.length){x.globalAlpha=.55;for(const[sd,col]of t.e)x.drawImage(edgeStrip(col,sd,t.v),t.tx*16,t.ty*16);x.globalAlpha=1}}return c});return w._wl}
const tx=(s,x,y,c,al,sz)=>{sz=sz||8;g.font=(sz<10&&window.TXK>1?Math.round(sz*window.TXK):sz)+'px '+FONT;g.textAlign=al||'left';g.fillStyle='#000';g.fillText(s,x+1,y+1);g.fillStyle=c;g.fillText(s,x,y)};
const dirOf=(fx,fy)=>Math.abs(fx)>Math.abs(fy)?(fx<0?'l':'r'):(fy<0?'u':'d');
const tint=(c,col)=>cached('tn'+(c._id||(c._id=Math.random()))+col,()=>{const f=mkc(c.width,c.height),x=f.getContext('2d');x.drawImage(c,0,0);x.globalCompositeOperation='source-atop';x.fillStyle=col;x.fillRect(0,0,f.width,f.height);return f});
function shadow(x,y,w,a=.32){g.fillStyle='rgba(0,0,0,'+a+')';g.fillRect(Math.round(x-w/2+2),Math.round(y-1),w-4,1);g.fillRect(Math.round(x-w/2),Math.round(y),w,1);g.fillRect(Math.round(x-w/2+2),Math.round(y+1),w-4,1)}
// dibuja un sprite de cuerpo anclado a los pies (x,y)
function body(id,x,y,fx,fy,pose,fr_,o={}){const dk=dirOf(fx,fy),kind=dk==='d'?'d':dk==='u'?'u':'s';let sp=bodyArt(id,kind,pose,fr_);if(o.flash)sp=flashOf(sp);else if(o.tint)sp=tint(sp,o.tint);
 const ox=Math.round(x-sp.width/2),oy=Math.round(y-(sp.height-3)+(o.dy||0));if(o.al!=null)g.globalAlpha=o.al;
 if(o.rot){g.save();g.translate(Math.round(x),Math.round(y-2));g.rotate(o.rot);g.drawImage(sp,-(sp.width>>1),-(sp.height-3)+2);g.restore()}
 else if(dk==='r'){g.save();g.translate(ox+sp.width,oy);g.scale(-1,1);g.drawImage(sp,0,0);g.restore()}else g.drawImage(sp,ox,oy);g.globalAlpha=1}
// llamas por columnas (píxel perfecto)
function flame(x,y,w,h,ph,al=1){g.globalAlpha=al;for(let c=-w;c<=w;c++){const k=Math.abs(c)/(w+.5),hh=Math.max(1,h*(1-Math.pow(k,1.6))*(.72+.28*Math.sin(TM*13+c*1.7+ph)));
  const o=Math.round(hh),a=Math.round(o*.55),b=Math.round(o*.28);fr(x+c,y-a,1,a,'#ff5a14');fr(x+c,y-a-b,1,b,'#ffa030');fr(x+c,y-o,1,o-a-b,'#ffe08a')}
 for(let c=-w+2;c<=w-2;c++){const k=Math.abs(c)/(w+.5),hh=h*.55*(1-Math.pow(k,1.4))*(.7+.3*Math.sin(TM*17+c*2.1+ph));fr(x+c,y-Math.round(hh),1,Math.round(hh),'#fff4c0')}g.globalAlpha=1}
// armas (líneas de píxeles)
function weapon(k,ox,oy,a,len,o={}){const c=Math.cos(a),s=Math.sin(a),pp=(t,w=0)=>[ox+c*t-s*w,oy+s*t+c*w],L=(t0,w0,t1,w1,col,th=1)=>{const A=pp(t0,w0),B=pp(t1,w1);pline(g,A[0],A[1],B[0],B[1],col,th)};
 if(k==='sword'||k==='greatsword'||k==='dagger'){const big=k==='greatsword',bl=len,tw=big?2:1;L(-3,0,1,0,'#5a4630',2);L(2,-3,2,3,'#c9a54a',1);L(3,0,3+bl,0,'#8d98ad',tw+1);L(3,-.5,3+bl,-.5,'#f4f8ff',1);L(3+bl,0,5+bl,0,'#f4f8ff',1);if(o.glow)glow(ox+c*(3+bl*.6),oy+s*(3+bl*.6),12,o.glow,.25)}
 else if(k==='hammer'){L(-3,0,len,0,'#5a4630',2);L(len-3,-5,len-3,5,'#7a7a88',4);L(len-4,-5,len-4,5,'#a8a8b8',1);L(len,-5,len,5,'#4a4a58',1)}
 else if(k==='shovel'){L(-3,0,len-4,0,'#6a4a2e',2);L(len-6,-3,len-6,3,'#6a4a2e',2);L(len-4,-4,len+3,-4,'#9a9aa8',1);L(len-4,-3,len+3,3,'#7a7a88',3);L(len-4,-3,len+2,-3,'#c0c0cc',1)}
 else if(k==='staff'){L(-4,0,len,0,'#5a4030',2);L(len,0,len+3,-3,'#5a4030',2);L(len+3,-3,len+5,-1,'#5a4030',1);const q=pp(len+4,-1);glow(q[0],q[1],14,'255,150,60',.5);disc(g,Math.round(q[0]),Math.round(q[1]),2,'#ff9a3c');fr(q[0],q[1]-1,1,1,'#fff2b0')}
 else if(k==='bow'){const p0=pp(0,-8),p1=pp(5,0),p2=pp(0,8);pline(g,p0[0],p0[1],p1[0],p1[1],'#7a5a38',2);pline(g,p1[0],p1[1],p2[0],p2[1],'#7a5a38',2);pline(g,p0[0],p0[1],p2[0],p2[1],'rgba(230,230,230,.6)',1)}
 else if(k==='claw'){for(let i=-1;i<=1;i++)L(0,i*2,len*(1-Math.abs(i)*.2),i*2.5,'#d8d0e8',1)}}
const WK={soldier:['sword',11],hollow:['claw',7],archer:['bow',0],brute:['hammer',17],sepulturero:['shovel',22],pastora:['staff',24],cazador:['dagger',9],caballero:['greatsword',24,'255,60,90'],rey:['greatsword',27,'255,230,109'],warden:['sword',11],guardiana:['dagger',13,'153,255,204'],heraldo:['staff',22],capdorn:['sword',20]};
// ---- fuentes de luz ----
const dk=mkc(GW,GH),dg=dk.getContext('2d');
function lighting(L){const a=W.th.amb;let al=a[3]*.86,rgb=a[0]+','+a[1]+','+a[2];const bo=E.find(e=>e.b&&e.s!=='dead'&&e.ph===2);if(bo){rgb='40,2,12';al=Math.min(.78,al+.1)}else if(rg.day){rgb='255,238,200';al=.05}else if(rg.out&&window.skyAmb){const c=skyAmb(a);rgb=c.rgb;al=c.al}else if(S.night&&rg.out){rgb='4,6,32';al=Math.min(.84,al+.22)}
 dg.globalCompositeOperation='source-over';dg.clearRect(0,0,GW,GH);dg.fillStyle='rgba('+rgb+','+al+')';dg.fillRect(0,0,GW,GH);dg.globalCompositeOperation='destination-out';
 for(const l of L){const R=Math.max(1,Math.round(l.r));dg.drawImage(lightSpr(R,l.i),Math.round(l.x)-R,Math.round(l.y)-R)}
 g.drawImage(dk,0,0);for(const l of L)if(l.c)glow(l.x,l.y,l.r*.8,l.c,l.a||.16)}
// ---- dibujo principal ----
function draw(){g.fillStyle='#000';g.fillRect(0,0,GW,GH);if(!W||!P||G.mode==='title')return;
 const ts=TM,sh=G.shake>0?[(R()-.5)*G.shake*2,(R()-.5)*G.shake*2]:[0,0];if(G.shake>0){G.shake*=.85;if(G.shake<.2)G.shake=0}if(!CFG.shake)sh[0]=sh[1]=0;else{sh[0]*=CFG.shake;sh[1]*=CFG.shake}
 const cx=Math.round(cam.x),cy=Math.round(cam.y);g.save();g.translate(-cx+Math.round(sh[0]),-cy+Math.round(sh[1]));
 g.drawImage(W.base,cx,cy,GW,GH,cx,cy,GW,GH);
 const tx0=Math.max(0,(cx>>4)-1),tx1=Math.min(W.cols-1,((cx+GW)>>4)+1),ty0=Math.max(0,(cy>>4)-1),ty1=Math.min(W.rows-1,((cy+GH)>>4)+5),Lt=[],Dr=[];
 // agua animada
 if(W.water.length){const wf=(ts*3|0)&3;g.drawImage(waterLayers(W)[wf],cx,cy,GW,GH,cx,cy,GW,GH)}
  // antorchas
 for(const t of W.torches){if(t.x<cx-20||t.x>cx+GW+20||t.y<cy-30||t.y>cy+GH+30)continue;fr(t.x-1,t.y-1,2,8,'#3a3440');fr(t.x-3,t.y+4,6,2,'#5a5260');fr(t.x-2,t.y-1,4,2,'#2a2630');flame(t.x,t.y-1,2,9,t.tx);Lt.push({x:t.x-cx,y:t.y-cy-4,r:58,i:.85,c:'255,150,70',a:.14})}
 // objetos altos (ordenados)
 const AC=W._ac||(W._ac=new Array(W.on.length));
 for(let ty=ty0;ty<=ty1;ty++)for(let tx=tx0;tx<=tx1;tx++){const i=W.i(tx,ty),n=W.on[i];if(!n||WALLISH.has(n)||n==='gate')continue;let ca=AC[i];if(!ca||ca.n!==n)ca=AC[i]={n,a:objArt(n,W.ov[i]%4,W.th)};const art=ca.a;if(!art)continue;const wx=tx*16+8,wy=ty*16+15;
  Dr.push({y:wy,f:()=>{let al=1;if((n==='tree'||n==='dtree')&&P.y<wy&&P.y>wy-54&&Math.abs(P.x-wx)<22)al=.5;g.globalAlpha=al;drawObjA(art,n,wx,wy,tx,ty);g.globalAlpha=1;
   if(n==='brazier'){flame(wx,wy-12,4,12,tx);}objFx(n,wx,wy,tx,ty);if(n==='ptorch')pflame(wx,wy,tx,ty);if(n==='mdoor'&&Math.floor(ts*3)%2)glow(wx,wy-10,12,'180,120,255',.12);if(n==='tomb'&&W.th.k==='cripta'&&(tx*7+ty)%5===0)glow(wx,wy-8,10,'120,100,200',.08)}});
  if(n==='brazier')Lt.push({x:wx-cx,y:wy-cy-12,r:64,i:.85,c:'255,140,60',a:.14});{const _l=objLight(n,wx,wy,cx,cy);if(_l)Lt.push(_l)}if(n==='ptorch'&&ptLit(tx,ty))Lt.push({x:wx-cx,y:wy-cy-12,r:56,i:.8,c:PCOLR[ptInfo(tx,ty).t.c],a:.16})}
 // hogueras
 W.fires.forEach((f,fi)=>{const x=f.x,y=f.y+6;Dr.push({y:y+3,f:()=>{drawFire(x,y)}});if(x>cx-90&&x<cx+GW+90&&y>cy-90&&y<cy+GH+90)Lt.push({x:x-cx,y:y-cy-12,r:94,i:1,c:'255,150,60',a:.22+.05*Math.sin(ts*13+fi)})});
 // objetos recogibles
 W.items.forEach((it,i)=>{if(S.tk[S.ri+':'+i]||(it.hid&&!S.ab.see)||(it.when&&!it.when()))return;const ic=it.w?'125,249,255':it.rel?'255,140,240':it.ab?'120,255,190':it.key?'255,210,90':it.tr?'255,255,255':it.hid?'150,255,255':'255,230,109';Dr.push({y:it.y+2,f:()=>{const y=it.y-6+Math.sin(ts*3+i)*2,wp=!!it.w;shadow(it.x,it.y+4,8,.25);glow(it.x,y,18,ic,.45);
  if(wp){pline(g,it.x,y+6,it.x,y-8,'#aee8f4',2);fr(it.x-3,y+1,7,2,'#c9a54a');fr(it.x,y-9,1,2,'#fff')}else{g.fillStyle='rgb('+ic+')';g.beginPath();g.moveTo(it.x,y-6);g.lineTo(it.x+4,y);g.lineTo(it.x,y+6);g.lineTo(it.x-4,y);g.fill();fr(it.x-1,y-4,1,3,'#fff')}
  for(let k=0;k<3;k++){const t=(ts*.8+k/3)%1;fr(it.x-6+k*6+Math.sin(ts*2+k)*2,y+6-t*18,1,1,'rgba(255,255,200,'+(1-t)+')')}}});Lt.push({x:it.x-cx,y:it.y-cy-6,r:26,i:.6,c:ic,a:.12})});
 if(S.drop&&S.drop.r===S.ri)Dr.push({y:S.drop.y,f:()=>{const d=S.drop,y=d.y-6+Math.sin(ts*4)*2;glow(d.x,y,20,'176,92,255',.5);disc(g,Math.round(d.x),Math.round(y),3,'#c08cff');disc(g,Math.round(d.x),Math.round(y),1,'#fff');for(let k=0;k<4;k++){const t=(ts*.9+k/4)%1;fr(d.x+Math.sin(ts*3+k*2)*5,y+4-t*14,1,1,'rgba(200,150,255,'+(1-t)+')')}}});
 // PNJ
 W.npcs.forEach(n=>{if((n.night&&!S.night)||(n.when&&!n.when()))return;Dr.push({y:n.y,f:()=>{const k=KITS[n.id]||KITS.aldeano,gh=k.ghost,by=gh?Math.sin(ts*2+n.tx)*2-3:0,dx=P.x-n.x,dy=P.y-n.y;if(!gh)shadow(n.x,n.y,12);else{shadow(n.x,n.y+4,10,.18);glow(n.x,n.y-10,22,'150,170,255',.2)}
  (n.mv?body(KITS[n.id]?n.id:'aldeano',n.x,n.y+by,n.wx,n.wy,'walk',ts*8|0,{al:gh||1}):body(KITS[n.id]?n.id:'aldeano',n.x,n.y+by,dx,dy,'idle',(ts*2|0)+n.tx,{al:gh||1}))}});if(Math.abs(n.x-cx-GW/2)<GW)Lt.push({x:n.x-cx,y:n.y-cy-10,r:32,i:.55,c:n.id==='sombra'||n.id==='voz'?'140,150,255':'255,220,160',a:.1})});
 // lápidas con nota, palancas, portales, muros falsos y runas
 W.notes.forEach(n=>{if(S.notes[n.id]||n.x<cx-20||n.x>cx+GW+20)return;Dr.push({y:n.y+9,f:()=>{const a=.18+.14*Math.sin(ts*3+n.tx);glow(n.x,n.y-2,12,'160,200,255',a);fr(n.x-1+Math.sin(ts*2)*3,n.y-8-((ts*6)%6),1,1,'rgba(200,230,255,.8)')}})});
 W.levers.forEach(l=>{if(l.x<cx-20||l.x>cx+GW+20)return;const on=!!S.lv[rg.id+':'+l.id];Dr.push({y:l.y+6,f:()=>{shadow(l.x,l.y+6,10,.3);fr(l.x-4,l.y+2,8,4,'#4a4260');fr(l.x-4,l.y+2,8,1,'#7a7092');fr(l.x-1,l.y-2,2,5,'#2a2430');pline(g,l.x,l.y,l.x+(on?6:-6),l.y-7,'#c9a54a',2);disc(g,Math.round(l.x+(on?6:-6)),Math.round(l.y-8),2,on?'#7dff9a':'#ff6b7a')}})});
 W.portals.forEach(q=>{if(q.x<cx-30||q.x>cx+GW+30||q.y<cy-30||q.y>cy+GH+30)return;Dr.push({y:q.y+8,f:()=>{drawStairs(q.x,q.y+6,!q.cond||q.cond())}});if(!q.cond||q.cond())Lt.push({x:q.x-cx,y:q.y-cy,r:50,i:.6,c:'125,200,255',a:.12})});
 for(const r of W.fwr){if(S.rv[rg.id+':'+r.id]||!S.ab.see)continue;Dr.push({y:99990,f:()=>{g.fillStyle='rgba(125,249,255,'+(.12+.1*Math.sin(ts*4))+')';g.fillRect(r.x*16,r.y*16,r.w*16,r.h*16);g.strokeStyle='rgba(125,249,255,.6)';g.strokeRect(r.x*16+.5,r.y*16+.5,r.w*16-1,r.h*16-1)}})}
 for(const r of W.owr){if(S.oath===r.oath)continue;Dr.push({y:99990,f:()=>{const c=OATHC[r.oath]||'255,255,255',a=.35+.25*Math.sin(ts*3);g.fillStyle='rgba('+c+','+(a*.35)+')';g.fillRect(r.x*16,r.y*16,r.w*16,r.h*16);const mx=(r.x+r.w/2)*16,my=(r.y+r.h/2)*16;glow(mx,my,14,c,a);g.strokeStyle='rgba('+c+','+a+')';g.beginPath();g.arc(mx,my,5,0,6.283);g.moveTo(mx-5,my);g.lineTo(mx+5,my);g.moveTo(mx,my-5);g.lineTo(mx,my+5);g.stroke()}})}
 // salida / portal
 if(W.exitP){const e=W.exitP,open=!!S.bk[rg.boss];Dr.push({y:e.y+6,f:()=>drawPortal(e.x,e.y+6,open)});if(open)Lt.push({x:e.x-cx,y:e.y-cy-8,r:70,i:.8,c:'150,90,255',a:.2})}
 // compuertas del jefe
 if(W.gateOn&&W.arena)Dr.push({y:99999,f:()=>drawGates()});
 if(window.GROUND)Dr.push({y:-99999,f:window.GROUND});
 // enemigos y jefe
 for(const e of E){Dr.push({y:e.y+(e.s==='dead'?-40:0),f:()=>drawE(e)});if(e.s!=='dead'&&e.aw&&TY[e.t]&&e.t==='hollow')Lt.push({x:e.x-cx,y:e.y-cy-12,r:20,i:.3,c:'255,60,90',a:.1});if(e.b&&e.s!=='dead')Lt.push({x:e.x-cx,y:e.y-cy-14,r:60,i:.7,c:e.ph===2?'255,60,90':'200,120,255',a:.14})}
 RK.forEach(r=>Dr.push({y:r.y+(r.t>.6?20:-30),f:()=>{const p=r.t;g.fillStyle='rgba(255,70,90,'+(.18+.3*Math.sin(p*28)**2)+')';g.beginPath();g.ellipse(r.x,r.y,16*(1-p*.3),8*(1-p*.3),0,0,6.283);g.fill();g.strokeStyle='rgba(255,120,140,.6)';g.lineWidth=1;g.beginPath();g.ellipse(r.x,r.y,16*(1.2-p),8*(1.2-p),0,0,6.283);g.stroke();
  if(p>.6){const h=(1-p)*260;shadow(r.x,r.y,16,.35);fr(r.x-7,r.y-h-14,14,14,'#5a4a42');fr(r.x-7,r.y-h-14,14,3,'#8a7868');fr(r.x+3,r.y-h-11,4,11,'#3a2e28');fr(r.x-7,r.y-h-14,2,14,'#7a6a5a')}}}));
 PR.forEach(q=>Dr.push({y:q.y,f:()=>{const y=q.y-10,hot=q.c==='#ffe66d';shadow(q.x,q.y,6,.2);if(hot){const a=Math.atan2(q.vy,q.vx);glow(q.x,y,12,'255,230,109',.4);pline(g,q.x-Math.cos(a)*9,y-Math.sin(a)*9,q.x,y,'rgba(255,230,109,.6)',1);pline(g,q.x-Math.cos(a)*3,y-Math.sin(a)*3,q.x+Math.cos(a)*3,y+Math.sin(a)*3,'#fff2b0',2)}
  else{glow(q.x,y,16,'255,110,40',.6);disc(g,Math.round(q.x),Math.round(y),3,'#ff7a1c');fr(q.x-1,y-1,2,2,'#ffe9a0');if(R()<.5)PT.push({k:'s',x:q.x,y:q.y,z:10,vx:(R()-.5)*20,vy:(R()-.5)*20,vz:5,l:.3,c:'#ff7a1c'})}}}));
 Dr.push({y:P.y,f:drawP});if(window.netDrawPlayers)netDrawPlayers(Dr,Lt,cx,cy);Lt.push({x:P.x-cx,y:P.y-cy-14,r:56,i:.5,c:'140,170,255',a:.07});
 // indicador de interacción
 if(G.mode==='play'&&P.s==='idle'&&CFG.hints){const o=near();if(o)Dr.push({y:99998,f:()=>promptUI(o,ts)})}
 Dr.sort((a,b)=>a.y-b.y);for(const d of Dr)d.f();
 // efectos por encima
 for(const f of FX)drawFX(f);
 for(const p of PT){const al=Math.min(1,p.l*(p.k==='a'?.6:3)),y=p.y-p.z;if(p.x<cx-8||p.x>cx+GW+8||y<cy-8||y>cy+GH+8)continue;g.globalAlpha=al;
  if(p.k==='soul'){glow(p.x,y,9,'176,92,255',.5);fr(p.x-1,y-1,3,3,'#e0c0ff')}else if(p.k==='d'){const s=2+(1-p.l/.4)*3;fr(p.x-s/2,y-s/2,s,s,p.c)}else if(p.k==='a'){fr(p.x,y,p.c.includes('255,140')?2:1,p.c.includes('255,140')?2:1,p.c)}else fr(p.x,y,2,2,p.c);g.globalAlpha=1}
 for(const f of FT){g.globalAlpha=Math.min(1,f.l*2);tx(f.t,f.x,f.y,f.c,'center',7+Math.round(Math.max(0,f.l-.7)*28));g.globalAlpha=1}
 g.restore();
 // iluminación y ambiente (en coordenadas de pantalla)
 {const sx=Math.round(sh[0]),sy=Math.round(sh[1]);if(sx||sy)for(const l of Lt){l.x+=sx;l.y+=sy}}lighting(Lt);fog();
 g.drawImage(vigSpr('b',GH*.42,'0,0,12',.6),0,0);
 if(P.hp/P.mhp<.3&&P.s!=='dead'){g.fillStyle='rgba(160,0,30,'+(.07+.05*Math.sin(ts*6))+')';g.fillRect(0,0,GW,GH)}
 if(G.flash>0){g.fillStyle='rgba(200,20,40,'+G.flash*.5+')';g.fillRect(0,0,GW,GH)}
 hud();
 if(G.fade>0){g.fillStyle='rgba(0,0,0,'+Math.min(1,G.fade*1.6)+')';g.fillRect(0,0,GW,GH)}}
function fog(){if(PERF.lv>=1)return;const t=W.th.fog,sp=fogSpr(t,120,0,.04);for(let i=0;i<4;i++){const x=((TM*(5+i*3)+i*180)%(GW+300))-150,y=GH*(.2+i*.22)+Math.sin(TM*.4+i*2)*14;g.drawImage(sp,0,60,240,120,Math.round(x-120),Math.round(y-60),240,120)}}
function drawFire(x,y){shadow(x,y+2,24,.3);for(let i=0;i<10;i++){const a=i/10*6.283,sx=x+Math.cos(a)*9,sy=y+Math.sin(a)*4.5;fr(sx-2,sy-3,4,3,i%2?'#5a5260':'#46404e');fr(sx-2,sy-3,4,1,'#7a7288')}
 g.fillStyle='#241c22';g.beginPath();g.ellipse(x,y-1,7,3,0,0,6.283);g.fill();pline(g,x-1,y-2,x-1,y-26,'#aab4c6',2);fr(x-5,y-20,10,2,'#c9a54a');fr(x-2,y-28,3,3,'#8a96ac');
 for(const o of[[-3,0],[3,1],[0,2]])flame(x+o[0],y-3,5-o[1],14+o[1]*3,x+o[0]);
 for(let i=0;i<5;i++){const t=(TM*.6+i*.2)%1;fr(x+Math.sin(TM*2+i*3)*6+i-2,y-12-t*40,1,1,'rgba(255,'+(150+i*20)+',60,'+(1-t)+')')}}
function drawPortal(x,y,open){const w=34,h=46;shadow(x,y+1,w,.3);fr(x-w/2,y-h+8,6,h-8,'#4a4260');fr(x+w/2-6,y-h+8,6,h-8,'#4a4260');fr(x-w/2-2,y-h+4,w+4,8,'#5a5072');fr(x-w/2-2,y-h+4,w+4,2,'#8a80a8');fr(x-w/2,y-h+8,2,h-8,'#6a6088');fr(x+w/2-2,y-h+8,2,h-8,'#2a2438');
 const ix=x-w/2+6,iw=w-12,iy=y-h+12,ih=h-12;fr(ix,iy,iw,ih,'#05030a');
 if(open){g.save();g.beginPath();g.rect(ix,iy,iw,ih);g.clip();for(let k=0;k<6;k++){const r=4+((TM*14+k*7)%30),a=TM*2+k;g.strokeStyle='rgba('+(150+k*14)+',90,255,'+(.55-k*.07)+')';g.lineWidth=2;g.beginPath();g.ellipse(x,y-ih/2,r*.6,r,a,0,5);g.stroke()}glow(x,y-ih/2,24,'190,140,255',.6);g.restore();for(let i=0;i<5;i++){const t=(TM*.7+i*.2)%1;fr(x-8+i*4+Math.sin(TM*3+i)*2,y-4-t*ih,1,2,'rgba(255,255,255,'+(1-t)+')')}}
 else{for(let i=0;i<3;i++){fr(x-5+i*5,y-ih*.6+i*3,1,6,'rgba(122,60,255,.5)')}fr(x-8,y-ih/2-6,16,1,'rgba(122,60,255,.35)');fr(x-8,y-ih/2+6,16,1,'rgba(122,60,255,.35)')}}
function drawGates(){const a=W.arena;a.gates.forEach(([gx,gy,gw,gh])=>{for(let j=0;j<gh;j++)for(let k=0;k<gw;k++){const X=(gx+k)*16,Y=(gy+j)*16;for(let i=0;i<16;i+=2){const hh=16+Math.sin(TM*4+i+gx+gy)*3;g.fillStyle='rgba('+(140+i*6)+',60,255,'+(.22+.14*Math.sin(TM*5+i*.7+k))+')';g.fillRect(X+i,Y+16-hh+(gw>gh?0:0),2,hh+8)}
  if((k+j)%2===0)for(let q=0;q<3;q++){const t=(TM*.9+q/3+k*.1)%1;fr(X+4+q*4,Y+16-t*26,1,2,'rgba(230,200,255,'+(1-t)+')')}}
  glow(gx*16+gw*8,gy*16+gh*8-4,Math.max(gw,gh)*10+22,'150,70,255',.35)})}
function drawP(){const p=P,w=WPN(),L=w.l,H=w.h,fx=p.fx,fy=p.fy,x=p.x,y=p.y,id='player',moving=p.mvg&&p.s==='idle';
 const dead=p.s==='dead';let pose='idle',frm=(TM*2|0),fl=p.s==='hit'&&Math.floor(p.t*30)%2===0;
 if(dead){shadow(x,y,14,.25);body(id,x,y,fx,fy,'idle',0,{rot:Math.min(1,p.t*4)*1.5708*(fx<0?-1:1),al:Math.max(.25,1-Math.max(0,p.t-.6))});return}
 shadow(x,y,p.s==='dodge'?10:13);
 if(p.s==='dodge'){const sp=rollArt(id,(p.t*16|0));g.globalAlpha=.9;g.drawImage(sp,Math.round(x-15),Math.round(y-20));g.globalAlpha=1;return}
 const A=p.s==='light'?L.a:p.s==='heavy'?H.a:null;
 if(moving){pose='walk';frm=(TM*(p.run?14:9)|0)}else if(A){pose=p.t<A[0]?'wind':p.t<A[1]+.06?'act':'rec'}else if(p.s==='hit')pose='hit';else if(p.s==='flask')pose='flask';else if(held.block&&p.s==='idle'&&p.ex<=0)pose='block';
 // arma
 const k=w.n.includes('Lanza')?'sword':'sword',len=w.wl;let ang,rho=(p.s==='heavy'?1.5:1.15),a0=Math.atan2(p.ay,p.ax);
 const ox=x+(fx?fx*3:(fy>0?6:-6)),oy=y-11;
 if(A){const t=p.t;ang=t<A[0]?a0-rho*1.15:t<A[1]?a0-rho+(t-A[0])/(A[1]-A[0])*rho*2:a0+rho*(1-Math.min(1,(t-A[1])/.2)*.35)}
 else if(pose==='block')ang=Math.atan2(fy,fx)-1.1;else if(pose==='flask')ang=1.6;else ang=Math.PI/2+(fx?-fx*.4:(fy>0?-.15:.15));
 const behind=Math.sin(ang)<-.35&&!(pose==='flask');
 const wd=()=>{weapon((window.WSHAPE&&WSHAPE[S.weapon])||'sword',ox,oy,ang,len,{glow:'125,249,255'});if(pose==='block'){const sx=x+fx*7,sy=y-9+fy*3;fr(sx-4,sy-5,8,11,'#3c3c72');fr(sx-4,sy-5,8,1,'#8aa3c7');fr(sx-4,sy+5,8,1,'#14142c');fr(sx-4,sy-5,1,11,'#6a6aa0');fr(sx,sy-3,1,7,'#c9a54a');fr(sx-2,sy,5,1,'#c9a54a');if(p.bt<.2)glow(sx,sy,12,'255,230,109',.5)}
  if(pose==='flask'){fr(x+fx*5-2,y-19,4,5,'#7dff9a');fr(x+fx*5-1,y-21,2,2,'#c9a54a');glow(x+fx*5,y-17,10,'90,255,140',.4)}}
 const bd=()=>body(id,x,y,fx,fy,pose,frm,{flash:fl});
 if(behind){wd();bd()}else{bd();wd()}
 if(p.ex>0&&Math.floor(TM*10)%2){fr(x-4,y-30,8,2,'#ff9a3c')}}
function drawE(e){const d=e.b||TY[e.t],id=e.b?e.id:e.t,wk=WK[id];
 if(e.pat&&!e.aw&&e.s!=='dead'){const rng=110*(hasR('sombra')?.5:1),a=Math.atan2(e.fy,e.fx);g.fillStyle='rgba(255,230,109,'+(.06+.16*(e.det||0))+')';g.beginPath();g.moveTo(e.x,e.y-8);g.arc(e.x,e.y-8,rng,a-1.05,a+1.05);g.closePath();g.fill();if(e.det>.05)tx(e.det>.6?'!':'?',e.x,e.y-d.h-6,e.det>.6?'#ff6b7a':'#ffe66d','center',9)}
 if(e.s==='dead'){const k=Math.min(1,e.tm*3);shadow(e.x,e.y,d.w+4,.25*(1-e.tm/2.5));body(id,e.x,e.y,e.fx,e.fy,'idle',0,{rot:k*1.5708*(e.fx<0?-1:1),al:Math.max(0,1-Math.max(0,e.tm-.8)/1.4)});return}
 shadow(e.x,e.y,Math.max(12,d.w+4));
 const c=e.cur,ax=e.ax!==undefined?e.ax:e.fx,ay=e.ay!==undefined?e.ay:e.fy,a0=Math.atan2(e.s==='wind'||e.s==='act'||e.s==='rec'?ay:e.fy,e.s==='wind'||e.s==='act'||e.s==='rec'?ax:e.fx);
 let pose=e.mvg?'walk':'idle',ang=Math.PI/2+.3,fl=e.fl>0,tn=null;
 if(e.s==='wind'){pose='wind';ang=a0-1.7+.5*Math.min(1,e.tm/e.wt);if(e.tm/e.wt>.7&&Math.floor(e.tm*28)%2)tn='rgba(255,90,90,.55)'}
 else if(e.s==='act'){pose='act';ang=a0-1.5+2.9*Math.min(1,e.tm/c.a)}else if(e.s==='rec'){pose='rec';ang=a0+1.4}else if(e.s==='stg'){pose='stg'}
 if(e.s==='act'&&c&&!c.proj){const pr=Math.min(1,e.tm/c.a);g.save();g.translate(e.x,e.y-10);g.strokeStyle='rgba(255,170,150,'+(.55*(1-pr))+')';g.lineWidth=2;g.beginPath();g.arc(0,0,c.rng*.9,a0-1.1,a0-1.1+2.2*pr);g.stroke();g.restore()}
 // zona de ataque visible (Juramento del Olvido)
 if(S.oath==='oblivion'&&e.s==='wind'&&c&&!c.proj){g.fillStyle='rgba(255,60,90,'+(.1+.22*e.tm/e.wt)+')';g.beginPath();g.moveTo(e.x,e.y);g.arc(e.x,e.y,c.rng+6,a0-1.15,a0+1.15);g.closePath();g.fill()}
 if(e.b){if(e.b.ch&&e.ph===0){g.strokeStyle='#8a8a9a';g.lineWidth=1;g.setLineDash([2,2]);g.beginPath();g.moveTo(e.x-6,e.y-14);g.lineTo(e.x-34,e.y+6);g.moveTo(e.x+6,e.y-14);g.lineTo(e.x+34,e.y+6);g.stroke();g.setLineDash([])}}
 const ghost=c&&c.tp&&e.s==='wind'?.4:1,hy=e.y-(e.b?15:11),ox=e.x+(Math.abs(e.fx)>.5?Math.sign(e.fx)*3:(e.fy>0?6:-6)),behind=Math.sin(ang)<-.35,sk=wk[0]==='bow'||wk[0]==='claw';
 const wd=()=>{if(wk[0]==='bow'){const a=Math.atan2(e.fy,e.fx);weapon('bow',e.x+Math.cos(a)*6,hy+Math.sin(a)*6,a,0);if(e.s==='wind'){const q=e.tm/e.wt;glow(e.x+Math.cos(a)*9,hy+Math.sin(a)*9,6+q*8,'255,230,109',.3+q*.4)}}
  else if(wk[0]==='claw'){if(e.s==='act'||e.s==='wind'){weapon('claw',e.x+Math.cos(a0)*4,hy+Math.sin(a0)*4,a0-.4*(e.s==='wind'?1:-1),wk[1]+6)}}
  else{weapon(wk[0],ox,hy,ang,wk[1],{glow:wk[2]});if(e.s==='wind'&&c&&c.proj){const q=e.tm/e.wt;glow(ox+Math.cos(ang)*wk[1],hy+Math.sin(ang)*wk[1],8+q*10,'255,140,50',.5)}}};
 g.globalAlpha=ghost;const bd=()=>body(id,e.x,e.y,e.fx,e.fy,pose,(TM*(e.mvg?8:2)+e.seed|0),{flash:fl,tint:tn,dy:e.s==='stg'?Math.round(Math.sin(e.tm*50)):0});
 if(behind){wd();bd()}else{bd();wd()}g.globalAlpha=1;
 if(e.s==='stg'&&e.rip){tx('!',e.x,e.y-d.h-14,'#ffe66d','center',10)}
 if(!e.b&&e.aw&&e.hp<e.mhp&&e.s!=='dead'){fr(e.x-9,e.y-d.h-10,18,3,'#0a0610');fr(e.x-8,e.y-d.h-9,16*e.hp/e.mhp,1,'#c0243c')}}
function drawFX(f){const p=1-f.l/f.m;
 if(f.k==='arc'){const a0=f.a-f.rho,a1=a0+f.rho*2*Math.min(1,p*1.6+.25),al=1-p;g.save();g.translate(f.x,f.y);g.fillStyle='rgba(235,245,255,'+(al*.75)+')';g.beginPath();g.arc(0,0,f.r,a0,a1);g.arc(0,0,f.r*.55,a1,a0,true);g.closePath();g.fill();g.strokeStyle='rgba(160,210,255,'+al+')';g.lineWidth=f.heavy?2:1;g.beginPath();g.arc(0,0,f.r,a0,a1);g.stroke();g.restore()}
 else if(f.k==='ring'){const r=(f.big?36:18)*p+4;g.strokeStyle='rgba('+f.c+','+(1-p)+')';g.lineWidth=f.big?2:1;g.beginPath();g.ellipse(f.x,f.y,r,r*.5,0,0,6.283);g.stroke()}}
function hud(){const p=P;
 const bar=(x,y,w,h,v,a,b)=>{fr(x-2,y-2,w+4,h+4,'#c9a54a');fr(x-1,y-1,w+2,h+2,'#0a0610');fr(x,y,w,h,'#2a1424');const q=g.createLinearGradient(0,y,0,y+h);q.addColorStop(0,a);q.addColorStop(1,b);g.fillStyle=q;g.fillRect(x,y,Math.max(0,w*cl(v,0,1)),h);fr(x,y,w*cl(v,0,1),1,'rgba(255,255,255,.35)')};
 bar(8,8,Math.min(130,p.mhp*.9),7,p.hp/p.mhp,'#e8384f','#7a1020');bar(8,19,Math.min(110,p.mst*.8),4,p.st/p.mst,p.ex>0&&Math.floor(TM*10)%2?'#ffb060':'#6be88a','#2a8a4a');
 for(let i=0;i<S.fmax;i++){const x=9+i*9,on=i<S.flasks;fr(x+1,29,3,2,on?'#8a6a3a':'#3a3030');fr(x,31,5,7,on?'#2f9a52':'#2a2430');if(on)fr(x+1,32,1,4,'#9dffb8')}
 tx((S.oath?short(S.oath):'Sin juramento')+' · '+WPN().n,9,49,'#c9b8ff','left',6);tx(S.name+(S.night?' · noche':''),9,58,'#8a80a8','left',5);
 g.fillStyle='#d09aff';g.beginPath();g.arc(GW-60,12,3,0,6.283);g.fill();tx(String(S.souls),GW-8,15,'#ffe66d','right',8);
 g.fillStyle='#ffe66d';g.beginPath();g.moveTo(GW-60,21);g.lineTo(GW-57,24);g.lineTo(GW-60,27);g.lineTo(GW-63,24);g.fill();tx(String(S.frag),GW-8,27,'#ffe66d','right',8);
 if(CFG.mini&&W.mmv){const mw=W.cols,mh=W.rows,k=mw>64?1:1,x0=GW-mw*k-6,y0=34;g.globalAlpha=.78;fr(x0-2,y0-2,mw*k+4,mh*k+4,'#c9a54a');fr(x0-1,y0-1,mw*k+2,mh*k+2,'#0a0610');g.drawImage(W.mmv,x0,y0,mw*k,mh*k);const sn=(tx_,ty_)=>W.seen[W.i(tx_,ty_)];
  g.globalAlpha=1;W.fires.forEach(f=>{if(sn(f.tx,f.ty))fr(x0+f.tx*k-1,y0+f.ty*k-1,3,3,'#ff9a3c')});W.portals.forEach(q=>{if(sn(q.tx,q.ty))fr(x0+q.tx*k-1,y0+q.ty*k-1,3,3,'#7dd8ff')});if(W.exitP&&S.bk[rg.boss]&&sn(W.exitP.tx,W.exitP.ty))fr(x0+W.exitP.tx*k-1,y0+W.exitP.ty*k-1,3,3,'#b05cff');W.npcs.forEach(n=>{if(sn(n.tx,n.ty)&&!(n.night&&!S.night))fr(x0+n.tx*k,y0+n.ty*k,2,2,'#9ad0ff')});
  g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=1;g.strokeRect(x0+cam.x/16*k+.5,y0+cam.y/16*k+.5,GW/16*k,GH/16*k);fr(x0+P.x/16*k-1,y0+P.y/16*k-1,3,3,Math.floor(TM*4)%2?'#7df9ff':'#fff')}
 const b=E.find(e=>e.b&&e.s!=='dead'&&e.aw);
 if(b){tx(b.b.n,GW/2,GH-23,'#f0e6ff','center',8);bar(60,GH-17,264,5,b.hp/b.mhp,'#c0243c','#5a0e1e');for(const s of[-1,1]){fr(GW/2+s*136-3,GH-20,6,10,'#c9a54a');fr(GW/2+s*136-1,GH-19,2,8,'#0a0610')}}
 if(G.banner){const a=Math.min(1,G.banner.l);g.globalAlpha=a;fr(40,GH/2-43,GW-80,1,'#c9a54a');fr(40,GH/2-7,GW-80,1,'#c9a54a');tx(G.banner.t,GW/2,GH/2-30,'#bfa8ff','center',6);tx(G.banner.s,GW/2,GH/2-14,'#fff','center',12);g.globalAlpha=1}
 if(G.msgT>0){g.globalAlpha=Math.min(1,G.msgT);tx(G.msg,GW/2,70,'#ffe66d','center',8);g.globalAlpha=1}
 if(G.win>0){const a=Math.min(.5,(2.5-G.win)*.4);g.fillStyle='rgba(255,230,109,'+a+')';g.fillRect(0,GH/2-24,GW,38);tx('JEFE DERROTADO',GW/2,GH/2+2,'#fff','center',14)}}

// ===== auxiliares de la ampliación =====
const PCOL=['#5aa8ff','#ff5a5a','#ffd24a','#5aff8a','#d57aff'],PCOLR=['90,168,255','255,90,90','255,210,74','90,255,138','213,122,255'],OATHC={guardian:'125,200,255',blood:'255,80,100',oblivion:'200,150,255'};
const ptInfo=(tx_,ty_)=>{if(!W.ptm){W.ptm={};W.pzs.forEach(z=>z.t.forEach(t=>W.ptm[t.tx+','+t.ty]={z,t}))}return W.ptm[tx_+','+ty_]};
const ptLit=(tx_,ty_)=>{const q=ptInfo(tx_,ty_);return q&&(S.pz[q.z.id]||q.z.lit.includes(q.t.i))};
function pflame(wx,wy,tx_,ty_){const q=ptInfo(tx_,ty_);if(!q)return;const c=PCOL[q.t.c];if(ptLit(tx_,ty_)){flame(wx,wy-12,4,12,tx_);glow(wx,wy-14,14,PCOLR[q.t.c],.35)}else{fr(wx-1,wy-15,3,3,c);glow(wx,wy-14,7,PCOLR[q.t.c],.18+.08*Math.sin(TM*3+tx_))}}
function drawStairs(x,y,open){shadow(x,y+1,26,.3);fr(x-12,y-18,24,18,'#05030a');for(let i=0;i<4;i++)fr(x-11+i,y-4-i*3,22-i*2,3,i%2?'#2a2438':'#1c1828');fr(x-14,y-22,28,5,'#4a4260');fr(x-14,y-22,28,1,'#7a7092');fr(x-14,y-22,4,22,'#3a3450');fr(x+10,y-22,4,22,'#3a3450');
 if(open){glow(x,y-10,16,'125,200,255',.3+.1*Math.sin(TM*3))}}
