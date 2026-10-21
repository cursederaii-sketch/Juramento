// ===== ANIMACIONES: capa procedural sobre los sprites (no toca el arte ni la lógica) =====
// respiración y rebote, anticipación/embestida al atacar, estelas de arma, imágenes residuales de esquiva,
// aviso al despertar, runas de jefe, balanceo de árboles, barras con "eco", destellos de golpe y más.
const AN={gh:[],gt:0,ps:'',hg:null,hl:0,hd:0,sg:null,sp:null,ss:0,cap:null,dy:0};
const _sh=shadow;shadow=function(x,y,w,a){return _sh(x,y-(AN.dy||0),w,a)};
const _weapon=weapon;weapon=function(k,ox,oy,a,len,o){if(AN.cap&&k!=='bow'){const c=AN.cap;AN.cap=null;c(ox,oy,a,len)}return _weapon.apply(this,arguments)};

// --- desplazamientos de cuerpo ---
function pOff(p){let dx=0,dy=0;const w=WPN(),A=p.s==='light'?w.l.a:p.s==='heavy'?w.h.a:null,m=Math.hypot(p.ax,p.ay)||1,ux=p.ax/m,uy=p.ay/m;
 if(A){const t=p.t,hv=p.s==='heavy',amp=hv?4:3;let k;if(t<A[0])k=-.7*(t/A[0]);else if(t<=A[1])k=1;else k=Math.max(0,1-(t-A[1])/.18);dx=ux*amp*k;dy=uy*amp*k*.6+(t<A[0]&&hv?1:0)}
 else if(p.s==='idle'){if(p.mvg)dy=p.run?-Math.abs(Math.sin(TM*14))*2.6:-Math.abs(Math.sin(TM*9))*1.6;else{dy=Math.sin(TM*2.2)>.4?-1:0;if(held.block&&p.ex<=0)dy=1}}
 else if(p.s==='hit')dx=Math.sin(p.t*60)*1.5;
 else if(p.s==='flask')dy=-Math.sin(p.t*14);
 return{dx:Math.round(dx),dy:Math.round(dy)}}
function eOff(e){let dx=0,dy=0,ux=e.ax!==undefined?e.ax:e.fx,uy=e.ay!==undefined?e.ay:e.fy;const l=Math.hypot(ux,uy)||1;ux/=l;uy/=l;const sd=e.seed||0;
 if(e.s==='wind'&&e.wt){const k=Math.min(1,e.tm/e.wt);dx=-ux*2.5*k;dy=-uy*1.5*k+k*.8}
 else if(e.s==='act'&&e.cur){const k=Math.min(1,e.tm/e.cur.a);if(e.cur.proj){dx=-ux*1.5*(1-k);dy=-uy}else{dx=ux*3.5*(1-k*.3);dy=uy*2}}
 else if(e.s==='rec'&&e.cur){const k=Math.min(1,e.tm/e.cur.r);dx=ux*3*(1-k)}
 else if(e.s==='stg')dx=Math.sin(e.tm*70)*1.5;
 else if(e.mvg)dy=-Math.abs(Math.sin(TM*8+sd))*1.3;
 else dy=Math.sin(TM*2+sd)>.5?-1:0;
 if(e.b)dx*=1.4;return{dx:Math.round(dx),dy:Math.round(dy)}}

// --- estelas del arma ---
function drawTrail(tr,rgb,maxAge){while(tr.length&&TM-tr[0].t>maxAge)tr.shift();if(tr.length<2)return;
 for(let i=1;i<tr.length;i++){const a=tr[i-1],b=tr[i];if(b.t-a.t>.08)continue;const al=(1-(TM-b.t)/maxAge)*.6;if(al<=0)continue;
  g.fillStyle='rgba('+rgb+','+al+')';g.beginPath();g.moveTo(a.x+Math.cos(a.a)*a.len,a.y+Math.sin(a.a)*a.len);g.lineTo(b.x+Math.cos(b.a)*b.len,b.y+Math.sin(b.a)*b.len);
  g.lineTo(b.x+Math.cos(b.a)*b.len*.4,b.y+Math.sin(b.a)*b.len*.4);g.lineTo(a.x+Math.cos(a.a)*a.len*.4,a.y+Math.sin(a.a)*a.len*.4);g.closePath();g.fill()}}
const pushTrail=(tr,x,y,a,len)=>{const l=tr[tr.length-1];if(l&&l.t===TM)return;tr.push({x,y,a,len,t:TM})};

// --- jugador ---
const _drawP=drawP;drawP=function(){const p=P;
 for(const q of AN.gh){const al=1-(TM-q.t)/.3;if(al<=0)continue;g.globalAlpha=al*.4;g.drawImage(rollArt('player',q.f),Math.round(q.x-15),Math.round(q.y-20))}g.globalAlpha=1;
 AN.gh=AN.gh.filter(q=>TM-q.t<.3);
 if(p.s==='dead')return _drawP();
 p._tr=p._tr||[];drawTrail(p._tr,p.s==='heavy'?'255,230,160':'170,225,255',.2);
 const o=pOff(p),w=WPN(),A=p.s==='light'?w.l.a:p.s==='heavy'?w.h.a:null;
 AN.dy=o.dy;g.save();g.translate(o.dx,o.dy);
 if(A&&p.t>=A[0]-.02&&p.t<=A[1]+.1)AN.cap=(ox,oy,a,len)=>pushTrail(p._tr,ox+o.dx,oy+o.dy,a,len);
 _drawP();AN.cap=null;g.restore();AN.dy=0};

// --- enemigos y jefes ---
const _drawE=drawE;drawE=function(e){
 if(e.s==='dead')return _drawE(e);
 if(e.b){const rgb=e.ph===2?'255,60,90':'200,120,255',al=.3+.15*Math.sin(TM*3);g.save();g.translate(Math.round(e.x),Math.round(e.y));g.scale(1,.5);g.lineWidth=1.5;
  g.setLineDash([5,5]);g.lineDashOffset=-TM*18;g.strokeStyle='rgba('+rgb+','+al+')';g.beginPath();g.arc(0,0,28+Math.sin(TM*2)*1.5,0,6.283);g.stroke();
  g.lineDashOffset=TM*14;g.beginPath();g.arc(0,0,20,0,6.283);g.stroke();g.setLineDash([]);g.restore()}
 e._tr=e._tr||[];drawTrail(e._tr,'255,120,130',.22);
 const o=eOff(e);AN.dy=o.dy;g.save();g.translate(o.dx,o.dy);
 if(e.s==='act'&&e.cur&&!e.cur.proj)AN.cap=(ox,oy,a,len)=>pushTrail(e._tr,ox+o.dx,oy+o.dy,a,len);
 _drawE(e);AN.cap=null;g.restore();AN.dy=0;
 if(e.alert>0){const d=e.b||TY[e.t];tx('!',Math.round(e.x),Math.round(e.y-d.h-10-Math.abs(Math.sin(e.alert*14))*5),'#ff6b7a','center',10+(e.alert>.45?3:0))}};

// --- efectos extra (destello de corte) ---
const _drawFX=drawFX;drawFX=function(f){if(f.k!=='hs')return _drawFX(f);const p=1-f.l/f.m,L=15;g.save();g.translate(f.x,f.y);g.rotate(f.a);g.strokeStyle='rgba(255,255,255,'+(1-p)+')';g.lineWidth=2-p;g.beginPath();g.moveTo(-L,0);g.lineTo(-L+L*2*Math.min(1,p*3),0);g.stroke();g.strokeStyle='rgba(255,90,120,'+(.6*(1-p))+')';g.lineWidth=1;g.beginPath();g.moveTo(-L*.6,2);g.lineTo(-L*.6+L*1.2*Math.min(1,p*3),2);g.stroke();g.restore()};

// --- balanceo de árboles y arbustos ---
function drawObjA(art,n,wx,wy,tx_,ty_){const X=Math.round(wx-art.width/2),Y=Math.round(wy-(art.height-3));
 if(!((n==='tree'||n==='dtree'||n==='bush')&&W.th.grass)){g.drawImage(art,X,Y);return}
 const amp=n==='bush'?1:n==='dtree'?1.2:1.7,s=Math.sin(TM*1.4+tx_*.8+ty_*.37)*(.7+.3*Math.sin(TM*.35+tx_*.1)),h=art.height,w=art.width,s1=Math.round(s*amp),s2=Math.round(s*amp*.45),c1=Math.floor(h*.35),c2=Math.floor(h*.62);
 g.drawImage(art,0,0,w,c1,X+s1,Y,w,c1);g.drawImage(art,0,c1,w,c2-c1,X+s2,Y+c1,w,c2-c1);g.drawImage(art,0,c2,w,h-c2,X,Y+c2,w,h-c2)}

// --- estado por fotograma ---
function animTick(dt){if(!P||!W||G.mode==='title')return;
 if(P.s==='dodge'){AN.gt-=dt;if(AN.gt<=0){AN.gt=.035;AN.gh.push({x:P.x,y:P.y,f:(P.t*16|0),t:TM})}}
 if(P.s==='dodge'&&AN.ps!=='dodge'){FX.push({k:'ring',x:P.x,y:P.y,l:.3,m:.3,c:'200,190,240'});for(let i=0;i<6;i++)PT.push({k:'d',x:P.x,y:P.y,z:2,vx:(R()-.5)*50,vy:(R()-.5)*20,vz:8+R()*14,l:.4,c:'rgba(200,190,230,.5)'})}
 if(P.s==='hit'&&AN.ps!=='hit')FX.push({k:'ring',x:P.x,y:P.y-8,l:.35,m:.35,c:'255,80,100'});
 AN.ps=P.s;
 if(AN.hg==null||P.hp>AN.hg||P.hp>P.mhp-.5&&AN.hg>P.hp){AN.hg=P.hp;AN.hl=P.hp}
 if(P.hp<AN.hl-.01)AN.hd=.45;AN.hl=P.hp;if(AN.hd>0)AN.hd-=dt;else if(AN.hg>P.hp)AN.hg=Math.max(P.hp,AN.hg-P.mhp*.4*dt);
 if(AN.sg==null||P.st>AN.sg)AN.sg=P.st;else AN.sg=Math.max(P.st,AN.sg-P.mst*.7*dt);
 if(AN.ss==null)AN.ss=S.souls;const ds=S.souls-AN.ss;if(ds>0)AN.sp={d:ds,t:1};AN.ss=S.souls;if(AN.sp&&AN.sp.t>0)AN.sp.t-=dt;
 for(const e of E){if(e._n===undefined){e._n=1;e._w0=e.aw;if(e.aw&&(e.ad||e.wv||e.amb||e.arena)){FX.push({k:'ring',x:e.x,y:e.y,l:.5,m:.5,c:'176,92,255'});spark(e.x,e.y,'#b05cff',10,8)}}
  if(!e._w0&&e.aw&&!e._al){e._al=1;e.alert=.6;FX.push({k:'ring',x:e.x,y:e.y,l:.35,m:.35,c:'255,170,80'})}if(e.alert>0)e.alert-=dt;
  if(e.fl>0&&(e._pf||0)<=0&&e.s!=='dead'){const a=Math.atan2(e.y-P.y,e.x-P.x)+(R()<.5?1.2:-1.2);FX.push({k:'hs',x:e.x,y:e.y-12,a,l:.2,m:.2})}e._pf=e.fl}}
const _update=update;update=function(dt){_update(dt);animTick(dt)};

// --- momentos: descanso, recoger, caída de enemigos, golpes recibidos ---
const _bonfire=bonfire;bonfire=function(i){_bonfire(i);const f=W&&W.fires[i];if(!f)return;FX.push({k:'ring',x:f.x,y:f.y+4,l:.9,m:.9,c:'255,154,60',big:1});for(let k=0;k<26;k++)PT.push({k:'s',x:f.x,y:f.y+6,z:4,vx:(R()-.5)*44,vy:(R()-.5)*20,vz:30+R()*60,l:.8+R()*.6,c:k%2?'#ffb060':'#ffe66d'})};
const _pickIt=pickIt;pickIt=function(it,key){const x=it.x,y=it.y;_pickIt(it,key);FX.push({k:'ring',x,y,l:.4,m:.4,c:'255,230,109'});spark(x,y-6,'#ffe66d',16,10,1.1)};
const _onKill=onKill;onKill=function(e){FX.push({k:'ring',x:e.x,y:e.y-6,l:e.b?.9:.45,m:e.b?.9:.45,c:e.b?'255,90,120':'176,92,255',big:e.b?1:0});_onKill(e)};
