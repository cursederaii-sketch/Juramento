// ===== MENÚ DE TÍTULO PROPIO (v8.36): escena dibujada en código, sin vídeo ni imagen =====
// Atardecer sobre un valle: montañas con pinos, castillo sobre un risco con cascada, aldea con luces, río con reflejos y una barca,
// ruinas con hiedra y estandarte, la espada clavada sobre una hoguera, rayos de sol, nubes, pájaros, bruma, brasas, luciérnagas y hojas.
// Se pinta a baja resolución (pixel art) en un <canvas> dentro de #tvw y solo anima mientras el título está visible.
// Cargar DESPUÉS de inicio.js (reemplaza showTitle).
(function(){
if(typeof showTitle!=='function'||typeof G==='undefined')return;
const VER='v8.38',wrap=document.getElementById('tvw');if(!wrap)return;
wrap.innerHTML='<canvas id="tcv"></canvas>';
const cv=document.getElementById('tcv'),c=cv.getContext('2d');
let W=400,H=225,u=1,hz=0,wEnd=0,L=null,on=false,TT=0,last=0;
const PI=Math.PI,sin=Math.sin,cos=Math.cos,rd=Math.round,fl=Math.floor;
const hex=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
const ramp=(st,t)=>{t=Math.max(0,Math.min(1,t));for(let i=1;i<st.length;i++)if(t<=st[i][0]){const a=st[i-1],b=st[i],k=(t-a[0])/(b[0]-a[0]),A=hex(a[1]),B=hex(b[1]);return A.map((v,j)=>rd(v+(B[j]-v)*k))}return hex(st[st.length-1][1])};
const rgb=a=>'rgb('+a[0]+','+a[1]+','+a[2]+')';
const mk=s=>()=>(s=s*16807%2147483647)/2147483647;
const BAY=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
const px=(x,X,Y,w,h,col)=>{x.fillStyle=col;x.fillRect(rd(X),rd(Y),Math.max(1,rd(w)),Math.max(1,rd(h)))};
function layer(w,h){const k=document.createElement('canvas');k.width=w||W;k.height=h||H;const x=k.getContext('2d');x.imageSmoothingEnabled=false;return[k,x]}
const disc=(x,X,Y,r,col)=>{x.fillStyle=col;x.beginPath();x.arc(X,Y,r,0,PI*2);x.fill()};

// nube con volumen: círculos unidos, sombreada de violeta (arriba) a naranja (abajo)
function mkCloud(w,h,seed){const r=mk(seed),[k,x]=layer(w,h);x.fillStyle='#fff';
 for(let i=0;i<10;i++){const cx=w*(.14+.72*r()),cy=h*(.55+.12*(r()-.5)),rr=h*(.26+.24*r());for(let yy=-rr;yy<=rr;yy++){const hw=Math.sqrt(rr*rr-yy*yy);if(cy+yy>h*.93)continue;x.fillRect(rd(cx-hw),rd(cy+yy),rd(hw*2),1)}}
 const im=x.getImageData(0,0,w,h),d=im.data;
 for(let y=0;y<h;y++)for(let xx=0;xx<w;xx++){const i=(y*w+xx)*4;if(!d[i+3])continue;const v=Math.min(1,y/h*1.15),top=y>0&&d[i-w*4+3]>0;
  let a=[96+v*159,72+v*80,150-v*50];if(!top){a[0]+=45;a[1]+=35;a[2]+=25}if(v>.7&&((xx+y)&1))a[1]-=10;
  d[i]=Math.min(255,a[0]);d[i+1]=Math.min(255,a[1]);d[i+2]=Math.min(255,a[2]);d[i+3]=235}
 x.putImageData(im,0,0);return k}

function build(){
 u=H/240;const r=mk(11);hz=rd(H*.62);wEnd=rd(H*.8);
 const o={u,wins:[],lights:[],stars:[],clouds:[],rip:[],parts:[],birds:[],flags:[],spk:[]};
 const sx=rd(W*.74);o.sx=sx;o.sun=[sx+rd(64*u),hz-rd(22*u)];
 // --- cielo y agua con tramado (dithering) ---
 const[sk,s]=layer();
 const SKY=[[0,'#090a26'],[.26,'#271b5e'],[.5,'#7c3b7c'],[.73,'#ee7e4e'],[1,'#ffd088']];
 const WAT=[[0,'#e08e5a'],[.22,'#8e4e82'],[.55,'#2e2a68'],[1,'#10103a']];
 {const N=22,cs=[],cw=[];for(let i=0;i<=N;i++){cs.push(ramp(SKY,i/N));cw.push(ramp(WAT,i/N))}
  const im=s.createImageData(W,H),d=im.data;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const b=BAY[(y&3)*4+(x&3)]/16-.5;let col;
   if(y<hz)col=cs[Math.max(0,Math.min(N,fl(y/hz*N+b+.5)))];
   else if(y<wEnd)col=cw[Math.max(0,Math.min(N,fl((y-hz)/(wEnd-hz)*N+b+.5)))];else col=cw[N];
   const i=(y*W+x)*4;d[i]=col[0];d[i+1]=col[1];d[i+2]=col[2];d[i+3]=255}
  s.putImageData(im,0,0)}
 // luna creciente
 {const mx=rd(W*.93),my=rd(H*.3),mr=rd(7*u);disc(s,mx,my,mr*2.4,'rgba(200,200,255,.06)');disc(s,mx,my,mr,'#e9e6ff');disc(s,mx+mr*.45,my-mr*.2,mr*.95,rgb(ramp(SKY,my/hz)));
  px(s,mx-mr+1,my+mr*.2,1,1,'#b8b4e8')}
 o.sk=sk;
 // --- tierra lejana: 4 capas de montañas con luz rasante, pinos, castillo, aldea ---
 const[ld,l]=layer();
 const ridge=(base,amp,f1,f2,ph,col,lit,trees,tcol)=>{const hh=[];
  for(let x=0;x<W+4;x++){const xu=x/u,n=(sin(xu*f1+ph)+.6*sin(xu*f2+ph*1.9)+.3*sin(xu*f2*2.7+ph))/1.9;hh.push(rd(base-amp*(.5+.5*n)))}
  for(let x=0;x<W;x++){px(l,x,hh[x],1,hz-hh[x]+1,col);
   if(hh[x+3]>hh[x]){px(l,x,hh[x],1,Math.max(2,u*1.4),lit);if(hh[x+3]-hh[x]>2)px(l,x,hh[x]+2*u,1,1,lit)}
   if(r()<.3)px(l,x,hh[x]+3+((r()*14*u)|0),1+((r()*2)|0),1,r()<.5?'rgba(0,0,0,.2)':'rgba(255,160,120,.08)')}
  if(trees)for(let x=2;x<W-2;x+=(3+((r()*4)|0))*u){const h=rd((4+r()*5)*u*trees);for(let k=0;k<h;k++){const w2=Math.max(1,((k+1)/h)*(2+h*.18));px(l,x-w2/2,hh[x]-h+k+1,w2,1,tcol)}}
  return hh};
 ridge(hz-16*u,20*u,.021,.057,1.3,'#5b4088','#b0709c',0);
 px(l,0,hz-10*u,W,10*u,'rgba(255,150,100,.2)');
 const hm=ridge(hz-11*u,16*u,.03,.08,4.1,'#3d2d68','#92548a',.7,'#2e2258');
 {const tx=rd(W*.29),ty=hm[tx]+2*u;px(l,tx-3*u,ty-17*u,6*u,17*u,'#1a1236');px(l,tx-3*u,ty-17*u,2*u,17*u,'#120c28');px(l,tx+2*u,ty-17*u,u,17*u,'#d9784a');px(l,tx-4*u,ty-19*u,8*u,2*u,'#241a48');for(let i=-4;i<=3;i+=2)px(l,tx+i*u,ty-21*u,u*1.2,2*u,'#1a1236');px(l,tx-1*u,ty-12*u,2*u,3*u,'#ffcf7a');px(l,tx-2*u,ty-2*u,4*u,2*u,'#0e0a1c');o.beacon=[tx,ty-22*u]}
 px(l,0,hz-6*u,W,6*u,'rgba(255,140,100,.12)');
 // castillo en un risco
 const cb=hz-rd(17*u),cx0=sx-rd(6*u);o.cb=cb;o.cx0=cx0;
 for(let d=0;d<=hz-cb;d++){const hw=(40+d*.55)*u,j=((r()*2)|0);px(l,cx0-hw+j,cb+d,hw*2,1,'#1f1639')}
 for(let i=0;i<260*u*u;i++){const y=cb+((r()*(hz-cb))|0),x=cx0-44*u+r()*88*u;px(l,x,y,1+((r()*2)|0),1,r()<.5?'#2b2150':'#130d2a')}
 for(let x=cx0-40*u;x<cx0+40*u;x+=3*u){const h=(2+((r()*4)|0))*u;px(l,x,cb-h,2*u,h+1,'#10112a');if(r()<.5)px(l,x,cb-h-u,u,u,'#10112a')}
 const bod='#171033',shd='#0f0a24',rim='#d9784a',roofC='#2a1c50',roofS='#1a1138';
 const cone=(x,base,w,rh)=>{for(let k=0;k<rh;k++){const hw=((k+1)/rh)*(w/2+1.6*u);px(l,x+w/2-hw,base-rh+k,hw*2,1,(k&3)===3?roofS:roofC);px(l,x+w/2+hw-1.4,base-rh+k,1.4,1,rim)}
  px(l,x+w/2-.5,base-rh-6*u,1,6*u,bod)};
 const body=(x,top,w,h)=>{px(l,x,top,w,h,bod);px(l,x,top,Math.max(1,w*.3),h,shd);px(l,x+w-u,top,u,h,rim);for(let y=top+4*u,k=0;y<top+h;y+=4*u,k++){px(l,x,y,w,1,'rgba(255,255,255,.05)');for(let bx=x+(k%2?2*u:0);bx<x+w;bx+=4*u)px(l,bx,y,1,4*u,'rgba(255,255,255,.03)')}};
 const win=(x,y)=>{px(l,x-1,y-1,2*u+2,3*u+2,'#0c0820');px(l,x,y,2*u,3*u,'#ffcf7a');px(l,x,y-u,2*u,u,'#ffb55a');px(l,x+u*.8,y,1,3*u,'#a8602a');o.wins.push({x,y,p:r()*6,w:2*u,h:3*u});o.lights.push({x:x+u,y:y+u,p:r()*6})};
 px(l,cx0-26*u,cb-16*u,50*u,16*u,bod);px(l,cx0-26*u,cb-16*u,50*u,2,'#241a48');
 for(let x=0;x<50*u;x+=4)px(l,cx0-26*u+x,cb-18*u,2,2*u,bod);
 px(l,cx0-26*u+50*u-1,cb-16*u,1,16*u,rim);
 // portón iluminado
 {const gx=cx0-3*u;px(l,gx,cb-9*u,7*u,9*u,'#2a1608');px(l,gx+1,cb-8*u,5*u-0+u,8*u,'#ffb55a');px(l,gx+2,cb-7*u,3*u,7*u,'#ffe0a0');o.lights.push({x:gx+3.5*u,y:cb-4*u,p:1,big:1})}
 for(const[dx,w,h,rh,sq]of[[-42,8,24,10,0],[-32,10,34,14,0],[-19,13,40,0,1],[-3,16,56,24,0],[15,11,42,16,0],[27,9,30,12,0],[37,7,20,8,0]]){
  const x=cx0+dx*u,ww=w*u,hh=h*u;body(x,cb-hh,ww,hh);
  if(sq){for(let i=0;i<ww;i+=4)px(l,x+i,cb-hh-2*u,2,2*u,bod);px(l,x+ww-1,cb-hh-2*u,1,2*u,rim)}else cone(x,cb-hh,ww,rd(rh*u));
  px(l,x-1,cb-hh,ww+2,2,'#241a48');
  for(let j=0;j<Math.max(1,(hh/(11*u))|0);j++)win(x+ww/2-1+(j%2?2:-1),cb-hh+7*u+j*10*u)}
 o.flags=[[cx0+(-3+8)*u,cb-(56+24)*u-6*u],[cx0+(15+5.5)*u,cb-(42+16)*u-6*u],[cx0+(-32+5)*u,cb-(34+14)*u-6*u]];
 // cascada: marca fría en el risco (el agua se anima)
 o.wf=[cx0-38*u,cb+2,hz];
 ridge(hz-4*u,10*u,.045,.11,2.2,'#1c1439','#6a3d68',.55,'#130d2c');
 // aldea de la orilla con luces
 for(let i=0;i<9;i++){const hx=rd(W*(.42+i*.026)+((r()*5)|0)),w=rd((5+r()*4)*u),h=rd((4+r()*3)*u),y=hz-1;
  px(l,hx,y-h,w,h,'#120c28');for(let k=0;k<4*u;k++)px(l,hx-1+k*.45,y-h-4*u+k,w+2-k*.9,1,'#1d1238');
  if(r()<.7){px(l,hx+w*.4,y-h*.65,1.4,1.6,'#ffcf7a');o.lights.push({x:hx+w*.4+.7,y:y-h*.6,p:r()*6})}if(i%3===0){px(l,hx+w-2*u,y-h-5*u,2*u,4*u,'#120c28');o.chim=(o.chim||[]);o.chim.push([hx+w-u,y-h-6*u])}}
 for(let x=0;x<W;x+=2){const h=rd((3+((r()*4)|0)+sin(x/u*.2)*2)*u);px(l,x,hz-h,2,h+1,'#0e0c26');if(r()<.3)px(l,x,hz-h-u,1,2*u,'#0e0c26')}
 o.ld=ld;
 // --- primer plano: suelo, ruinas con ladrillo, hiedra, flores, rama con hojas, asta y farol ---
 const[fo,f]=layer();
 const gy=x=>rd(H*.86+(sin(x/u*.035)*3+sin(x/u*.11+2)*1.5)*u),G0='#0b0a1c';
 for(let x=0;x<W;x++){const y=gy(x);px(f,x,y,1,H-y,G0)}
 for(let i=0;i<W*1.2*u;i++){const x=(r()*W)|0,y=gy(x)+((r()*(H-gy(x)))|0);px(f,x,y,1+((r()*2)|0),1,r()<.5?'#11142a':'#070614')}
 const x1=rd(W*.045),x2=rd(W*.2),y1=rd(H*.15),y2=rd(H*.37),pw1=rd(14*u),pw2=rd(11*u);
 const brick=(x,top,w,h,seed)=>{const rr=mk(seed),bh=rd(5*u),bw=rd(7*u);px(f,x,top,w,h,'#100d22');
  for(let y=top,row=0;y<top+h;y+=bh,row++){px(f,x,y,w,1,'#06050f');for(let bx=x+(row%2?bw/2:0);bx<x+w;bx+=bw){px(f,bx,y,1,bh,'#06050f');if(rr()<.3)px(f,bx+1,y+1,bw-2,bh-2,rr()<.5?'#17132e':'#1c1838');if(rr()<.12)px(f,bx+1,y+1,bw-2,1,'#2e2558')}}
  px(f,x,top,1,h,'#2a2150');px(f,x+w-1,top,1,h,'#08060f');
  for(let k=0;k<h/(9*u);k++){const cx_=x+((rr()*w)|0),cy_=top+((rr()*h)|0),ln=(5+((rr()*8)|0))*u;for(let q=0;q<ln;q++)px(f,cx_+(q>ln/2?1:0)+((q/3)|0)%2,cy_+q,1,1,'#05040c')}
  for(let k=0;k<h/(5*u);k++)px(f,x+((rr()*(w-3))|0),top+((rr()*h)|0),(3+((rr()*3)|0))*u,2*u,rr()<.5?'#1f3a28':'#2a4a30')};
 brick(x1,y1,pw1,gy(x1)-y1,5);brick(x2,y2,pw2,gy(x2)-y2,9);
 for(const[x,top,w]of[[x1,y1,pw1],[x2,y2,pw2]]){for(let k=0;k<4;k++)px(f,x+((r()*w)|0),top-1-((r()*3)|0),2+((r()*3)|0),2+((r()*2)|0),'#100d22');px(f,x-1,top,w+2,2,'#1b1736');px(f,x-1,top,w+2,1,'#2a2150')}
 {const a0=x1+pw1,a1=x2,ac=(a0+a1)/2,rx=(a1-a0)/2,ry=H*.1,by=H*.43;
  for(let a=PI;a>=.4;a-=.02){const X=ac+cos(a)*rx,Y=by-sin(a)*ry;px(f,X-2,Y-2,5,5,'#100d22');px(f,X-2,Y-2,5,1,'#2a2150')}
  for(let a=PI;a>=.4;a-=.2)px(f,ac+cos(a)*rx-2,by-sin(a)*ry-2,1,5,'#06050f');
  o.ac=ac;
  for(let i=0;i<48*u;i++){const t=PI-r()*(PI-.45),X=ac+cos(t)*rx,Y=by-sin(t)*ry,len=(3+((r()*18)|0))*u;px(f,X,Y+2,1,len,i%3?'#17352c':'#21503a');if(r()<.6)px(f,X+1,Y+len-2,2,2,'#2a6a46');if(r()<.2)px(f,X-1,Y+len/2,2,2,'#3a8a50')}
  for(let i=0;i<34*u;i++){const X=x1+((r()*pw1)|0),Y=y1+((r()*60*u)|0);px(f,X,Y,1,(4+((r()*14)|0))*u,'#17352c')}
  // espada clavada en un montículo, entre los pilares
  const sw=rd(ac),sg=gy(sw),top=sg-rd(42*u);o.sw=[sw,top];o.fire=[sw+rd(9*u),sg];
  for(let k=-12;k<=12;k++)px(f,sw+k*u,sg-1-(12-Math.abs(k))*.3*u,u,5,G0);
  for(let k=0;k<26*u;k++)px(f,sw-11*u+r()*22*u,sg-2+((r()*3)|0),2*u,u,r()<.5?'#2a2650':'#1a1636');
  const bl=top+rd(15*u);{const bw2=Math.max(3,rd(3.4*u)),bx0=sw-bw2/2;px(f,bx0,bl,bw2,sg-bl+3,'#aeb9d4');px(f,bx0,bl,Math.max(1,bw2*.3),sg-bl,'#eef4ff');px(f,bx0+bw2*.72,bl,Math.max(1,bw2*.28),sg-bl,'#6a7494');px(f,sw-.5,bl+2,1,sg-bl-6,'#cdd6ea')}
  px(f,sw-9*u,top+rd(12*u),18*u,2,'#c9a54a');px(f,sw-9*u,top+rd(12*u),18*u,1,'#ffe9a0');
  for(const sd of[-1,1]){px(f,sw+sd*9*u-(sd>0?0:1),top+rd(10*u),2,5,'#c9a54a');disc(f,sw+sd*10*u,top+rd(12*u),1.6,'#ffe9a0')}
  px(f,sw,top+rd(3*u),1,rd(9*u),'#5a3a1e');for(let k=0;k<4;k++)px(f,sw-1,top+rd(4*u)+k*2.4*u,3,1,'#2a1a0c');
  px(f,sw-2*u,top,5*u,3*u,'#c9a54a');px(f,sw-2*u,top,5*u,1,'#ffe9a0');px(f,sw-1,top+1,2,1,'#8a2030')}
 // flores y hierba alta
 for(let i=0;i<70*u;i++){const x=(r()*W)|0,y=gy(x)-1-((r()*2*u)|0);px(f,x,y,u,u,r()<.4?'#e8e4ff':r()<.5?'#8aa8ff':'#ffd27a')}
 for(let x=0;x<W;x+=2){const y=gy(x),h=(2+((r()*7)|0))*u;for(let q=0;q<h;q++)px(f,x+Math.round(q*q/(h*h)*2),y-q,1,1,r()<.2?'#173a30':'#10142a');if(r()<.2)px(f,x+2,y-h-1,1,1,'#2a5a3a')}
 // juncos junto a la orilla y rocas en el agua
 for(let i=0;i<14;i++){const x=rd(W*(.74+.1*r())),yb=gy(x),h=rd((16+r()*14)*u),bend=(r()-.5)*5*u;
  for(let q=0;q<h;q++)px(f,x+bend*(q/h)*(q/h),yb-q,Math.max(1,u*.7),1,'#0c1a1a');
  if(i%2===0){const hx=x+bend;px(f,hx-u*.6,yb-h-4*u,1.6*u,5*u,'#3a2210');px(f,hx-u*.6,yb-h-4*u,.6*u,5*u,'#6a4020')}
  else for(let q=0;q<6*u;q++)px(f,x+bend+q*.5,yb-h+q*.6,1,1,'#14302a')}
 o.rocks=[[W*.57,wEnd-7*u,9*u],[W*.66,wEnd-13*u,6*u],[W*.36,wEnd-5*u,11*u]];
 for(const[X,Y,rr]of o.rocks){f.fillStyle='#0d0b1e';f.beginPath();f.ellipse(X,Y,rr,rr*.45,0,0,PI*2);f.fill();f.fillStyle='#2a2150';f.beginPath();f.ellipse(X+rr*.2,Y-rr*.12,rr*.6,rr*.22,0,0,PI*2);f.fill();px(f,X+rr*.1,Y-rr*.35,rr*.5,1,'#4a3a7a')}
 // rama con hojas arriba a la derecha
 {const pts=[];for(let t=0;t<=1;t+=.004)pts.push([W*(1.03-.2*t),H*(-.01+.07*t+.02*sin(t*5))]);
  for(const[X,Y]of pts){const th=Math.max(2,rd((1-(W*1.03-X)/(W*.2))*5*u));px(f,X,Y,2,th,'#0b0f10')}
  for(const[X,Y]of pts)for(let k=0;k<3;k++)if(r()<.12){const lx=X+(r()-.5)*20*u,ly=Y+r()*30*u,c3=r();px(f,lx,ly,3+((r()*3)|0),2+((r()*2)|0),c3<.5?'#0c2a22':c3<.85?'#14402e':'#4a7a3a')}
  for(let k=0;k<80;k++){const lx=W*(.84+.17*r()),ly=r()*H*.2;px(f,lx,ly,2,2,r()<.7?'#0c2a22':'#173f2c')}}
 // asta con estandarte y farol
 const bx=rd(W*.9),lx=rd(W*.96);o.bn=[bx,gy(bx)-rd(76*u)];
 px(f,bx,o.bn[1],2,gy(bx)-o.bn[1],G0);px(f,bx-8*u,o.bn[1]+2,18*u,2,G0);disc(f,bx+1,o.bn[1]-1,2,'#c9a54a');
 px(f,lx,gy(lx)-rd(46*u),2,rd(46*u),G0);px(f,lx-5,gy(lx)-rd(46*u),7,2,G0);px(f,lx-5,gy(lx)-rd(46*u),1,5,G0);
 px(f,lx-8,gy(lx)-rd(41*u),6,8,'#1a1632');px(f,lx-7,gy(lx)-rd(40*u),4,6,'#ffcf7a');o.lt=[lx-5,gy(lx)-rd(37*u)];
 for(let i=0;i<9;i++){const x=rd(W*.84+r()*W*.16),y=gy(x);for(let a=0;a<14;a++)px(f,x-7+a,y-5-sin(a/13*PI)*7,1,7,i%2?'#0a1020':'#0a1a1c')}
 o.fo=fo;
 // --- datos dinámicos ---
 for(let i=0;i<150*u;i++)o.stars.push({x:rd(r()*W),y:rd(r()*hz*.62),p:r()*6,b:r()<.1,c:r()<.2?'200,220,255':'255,246,220'});
 const CL=[mkCloud(rd(70*u),rd(22*u),3),mkCloud(rd(46*u),rd(16*u),8),mkCloud(rd(96*u),rd(26*u),12)];
 for(let i=0;i<7;i++)o.clouds.push({k:CL[i%3],x:r()*(W+120),y:rd(hz*(.1+r()*.5)),sp:1.5+r()*3.5});
 for(let i=0;i<90*u;i++)o.rip.push({x:r()*W,y:hz+2+rd(r()*(wEnd-hz-4)),w:(3+rd(r()*9))*u,sp:1+r()*3,p:r()*6});
 for(let i=0;i<7;i++)o.birds.push({x:r()*(W+60),y:hz*(.25+r()*.35),sp:7+r()*6,p:r()*6,s:r()<.5?1:.7});
 for(let i=0;i<70*u;i++){const k=i%7;o.parts.push({x:r()*W,y:k<3?hz*.3+r()*H*.6:hz+r()*(H-hz),vy:k<3?3+r()*7:0,vx:(r()-.5)*4,p:r()*6,t:k<3?0:k<6?1:2})}
 for(let i=0;i<26*u;i++)o.spk.push({a:r(),p:r()*6});
 // v8.37: decoración extra: antorchas en los pilares, farol bajo el arco, murciélagos, runas y marco ornamental
 o.tx=[[x1+pw1+1,y1+rd(36*u)],[x2-1,y2+rd(14*u)]];o.arc=[o.ac,rd(H*.33)+3];
 o.bats=[];for(let i=0;i<6;i++)o.bats.push({p:r()*6,rx:(26+i*7)*u,ry:(9+r()*10)*u,sp:.5+r()*.5});
 o.runes=[];for(let i=0;i<9;i++)o.runes.push({g:i%6,p:i/9,ph:r()*6});
 {const[k,x]=layer(),p=Math.max(1,rd(u)),m=6*p,GD='#c9a54a',GL='#ffe9a0',GS='#7a5a1e';
  const gem=(X,Y)=>{px(x,X,Y,p,p,GL);px(x,X-p,Y,p,p,GD);px(x,X+p,Y,p,p,GD);px(x,X,Y-p,p,p,GD);px(x,X,Y+p,p,p,GD)};
  for(const[sx_,sy_]of[[1,1],[-1,1],[1,-1],[-1,-1]]){x.save();x.translate(sx_>0?0:W,sy_>0?0:H);x.scale(sx_,sy_);
   px(x,m,m,44*p,p,GD);px(x,m,m,p,44*p,GD);px(x,m+3*p,m+3*p,30*p,p,GS);px(x,m+3*p,m+3*p,p,30*p,GS);
   px(x,m+p,m+p,6*p,p,GL);px(x,m+p,m+p,p,6*p,GL);
   for(let i=10;i<=34;i+=8){px(x,m+i*p,m+2*p,2*p,p,GL);px(x,m+2*p,m+i*p,p,2*p,GL)}
   gem(m+8*p,m+8*p);gem(m+46*p,m+p);gem(m+p,m+46*p);
   px(x,m+10*p,m+10*p,p,p,GS);px(x,m+14*p,m+3*p,p,3*p,GS);px(x,m+3*p,m+14*p,3*p,p,GS);
   x.restore()}
  x.fillStyle='rgba(201,165,74,.28)';x.fillRect(m+52*p,m,W-2*m-104*p,p);x.fillRect(m+52*p,H-m-p,W-2*m-104*p,p);x.fillRect(m,m+52*p,p,H-2*m-104*p);x.fillRect(W-m-p,m+52*p,p,H-2*m-104*p);
  o.fr=k}
 L=o}

function draw(t,dt0){
 const o=L,dt=dt0*o.u;c.imageSmoothingEnabled=false;
 c.drawImage(o.sk,0,0);
 for(const s of o.stars){const a=(.35+.65*Math.abs(sin(t*1.3+s.p)))*(1-s.y/(hz*.66));if(a<=0)continue;c.fillStyle='rgba('+s.c+','+a.toFixed(2)+')';c.fillRect(s.x,s.y,1,1);if(s.b&&a>.55){c.fillRect(s.x-1,s.y,3,1);c.fillRect(s.x,s.y-1,1,3)}}
 // estrella fugaz
 {const ph=(t%11)/11;if(ph<.06){const k=ph/.06,X=W*.15+k*W*.3,Y=H*.06+k*H*.16;for(let i=0;i<10;i++){c.fillStyle='rgba(255,246,220,'+((1-i/10)*(1-k*.5)).toFixed(2)+')';c.fillRect(rd(X-i*1.6),rd(Y-i*.7),1,1)}}}
 // sol, halo y rayos
 const[sxx,sy]=o.sun,k=1+.05*sin(t*.8);
 c.save();c.globalCompositeOperation='lighter';
 for(let i=0;i<9;i++){const a=-PI/2+(i-4)*.2+sin(t*.25+i)*.035;c.fillStyle='rgba(255,170,90,.028)';c.beginPath();c.moveTo(sxx,sy);c.lineTo(sxx+cos(a-.045)*H*1.1,sy+sin(a-.045)*H*1.1);c.lineTo(sxx+cos(a+.045)*H*1.1,sy+sin(a+.045)*H*1.1);c.fill()}
 c.restore();
 for(let r=54*o.u;r>=14;r-=4*o.u){c.fillStyle='rgba(255,170,90,.045)';c.beginPath();c.arc(sxx,sy,r*k,0,PI*2);c.fill()}
 disc(c,sxx,sy,12*o.u,'#ffc87a');disc(c,sxx,sy,10*o.u,'#ffe0a0');disc(c,sxx,sy,7.5*o.u,'#fff3d0');
 for(const q of o.clouds){const X=((q.x+t*q.sp*o.u)%(W+q.k.width+40))-q.k.width;c.drawImage(q.k,rd(X),q.y)}
 // faro de la colina y humo de las chimeneas
 {const[bx3,by3]=o.beacon,fk3=.75+.25*sin(t*8)+.1*sin(t*13);for(let r2=28*o.u;r2>=4;r2-=4*o.u){c.fillStyle='rgba(255,150,60,'+(.05*fk3).toFixed(3)+')';c.beginPath();c.arc(bx3,by3,r2,0,PI*2);c.fill()}
  px(c,bx3-o.u,by3-3*o.u*fk3,2*o.u,3*o.u*fk3,'#ff8a30');px(c,bx3-.5*o.u,by3-2*o.u*fk3,o.u,2*o.u*fk3,'#ffe090')}
 // pájaros
 for(const b of o.birds){const X=((b.x+t*b.sp*o.u)%(W+40))-20,Y=b.y+sin(t*.5+b.p)*5,f=sin(t*9+b.p)>0?1:-1,w=3*b.s*o.u;c.fillStyle='#1a1030';c.fillRect(rd(X),rd(Y),1,1);c.fillRect(rd(X-w),rd(Y-f),rd(w),1);c.fillRect(rd(X+1),rd(Y-f),rd(w),1);c.fillRect(rd(X-w-1),rd(Y-f*2),1,1);c.fillRect(rd(X+w+1),rd(Y-f*2),1,1)}
 c.drawImage(o.ld,0,0);
 for(const[cx_,cy_]of(o.chim||[]))for(let n=0;n<6;n++){const a=(t*.35+n/6)%1;c.fillStyle='rgba(205,175,200,'+((1-a)*.3).toFixed(2)+')';const z=Math.max(1,(1+a*3)*o.u*.7);c.fillRect(rd(cx_+sin(a*7+n)*2*o.u+a*10*o.u),rd(cy_-a*26*o.u),rd(z),rd(z))}
 for(const w of o.wins){if(sin(t*2.2+w.p*7)<-.8){px(c,w.x,w.y,w.w,w.h,'#5a3a2a');continue}c.fillStyle='rgba(255,200,110,.1)';c.fillRect(w.x-1,w.y-1,w.w+2,w.h+2)}
 // banderas del castillo
 for(let j=0;j<o.flags.length;j++){const[X,Y]=o.flags[j];for(let i=0;i<7;i++)px(c,X+1+i,Y+sin(t*4+i*.7+j)*i*.18,1,3,i%3?'#3a3aa0':'#c9a54a')}
 // cascada
 {const[wx,y0,y1]=o.wf;for(let y=y0;y<y1;y++){if(((y*2+t*38)%8)<5)px(c,wx,y,1,1,'rgba(225,238,255,.75)');if(((y*3+t*30+3)%9)<3)px(c,wx+1,y,1,1,'rgba(190,210,240,.5)')}
  for(let i=0;i<8;i++)px(c,wx-3+i+sin(t*3+i)*1.5,y1-1-((i+t*6)%4),1,1,'rgba(230,240,255,'+(.5-i*.04).toFixed(2)+')')}
 // reflejo especular de montañas y castillo en el río
 c.save();c.globalAlpha=.2;for(let y=hz;y<wEnd-2;y++){const sy2=hz-(y-hz)*1.7;if(sy2<0)break;c.drawImage(o.ld,0,rd(sy2),W,1,rd(sin(y*.55+t*2)*1.4*o.u),y,W,1)}c.restore();
 // reflejos de luces, camino del sol, ondas, destellos
 for(const q of o.lights){if(q.big){px(c,q.x-1,hz+4+(hz-q.y)*.4,3,1,'rgba(255,200,110,.35)')}const ry=hz+3+(hz-q.y)*.42;for(let n=0;n<4;n++)px(c,q.x+sin(t*3+q.p+n)*1.3,ry+n*2.2,1,1,'rgba(255,200,110,'+(.34-n*.07).toFixed(2)+')')}
 for(let y=hz+1;y<wEnd-1;y+=2){const v=(y-hz)/(wEnd-hz),w=3+v*26*o.u+sin(y*.9+t*3.5)*3,a=(.5-v*.38).toFixed(2);px(c,sxx-w/2+sin(y*.5+t*2)*2,y,w,1,'rgba(255,226,160,'+a+')')}
 for(const q of o.rip){const X=((q.x+t*q.sp*o.u)%(W+20))-10,a=(.1+.22*Math.abs(sin(t*1.5+q.p))).toFixed(2);px(c,X,q.y,q.w,1,(q.y-hz<(wEnd-hz)*.35?'rgba(255,214,160,':'rgba(150,160,230,')+a+')')}
 for(const p of o.spk){if(sin(t*2.4+p.p*9)>.93)px(c,sxx+(p.a-.5)*60*o.u,hz+4+p.a*(wEnd-hz-8),1,1,'rgba(255,245,210,.9)')}
 // anillos alrededor de las rocas
 for(const[X,Y,rr]of o.rocks){for(let k=0;k<2;k++){const ph=(t*.35+k*.5)%1;c.strokeStyle='rgba(255,215,170,'+((1-ph)*.28).toFixed(2)+')';c.lineWidth=1;c.beginPath();c.ellipse(X,Y+1,rr*(1+ph*1.2),rr*.45*(1+ph*1.2),0,0,PI*2);c.stroke()}}
 // barca con farol
 {const bx2=((t*3.2*o.u)%(W+80*o.u))-40*o.u,by=hz+(wEnd-hz)*.5+sin(t*1.3)*.8,s2=o.u;
  px(c,bx2-7*s2,by,14*s2,2*s2,'#150f2a');px(c,bx2-6*s2,by+2*s2,12*s2,1,'#0e0a1c');px(c,bx2+3*s2,by-11*s2,1,11*s2,'#150f2a');
  for(let i=0;i<9*s2;i++)px(c,bx2+4*s2+i*.4,by-10*s2+i*.9,Math.max(1,(9*s2-i)*.7),1,'#d8c8a0');
  px(c,bx2-7*s2,by-3*s2,1,3*s2,'#150f2a');disc(c,bx2-6.5*s2,by-4*s2,5*s2,'rgba(255,190,90,.14)');px(c,bx2-7*s2,by-4*s2,2,2,'#ffd27a');
  for(let n=0;n<5;n++)px(c,bx2-7*s2+sin(t*3+n)*1.5,by+3*s2+n*2,1,1,'rgba(255,200,110,'+(.3-n*.05).toFixed(2)+')')}
 // bruma en capas
 for(let b=0;b<4;b++){const y=[hz-8*o.u,hz+5,wEnd-3,H*.9][b],h=[8*o.u,6*o.u,9*o.u,10*o.u][b],sp=[.35,.25,.2,.15][b];
  for(let x=0;x<W;x+=4){const a=(b===2?.5:b===3?.6:1)*(.07+.05*sin(x*.045+t*sp+b*2)+.03*sin(x*.13-t*sp*.6));if(a>.02){c.fillStyle='rgba('+(b?'110,110,170':'255,170,130')+','+a.toFixed(3)+')';c.fillRect(x,y,4,h)}}}
 c.drawImage(o.fo,0,0);
 // hoguera de la espada: luz cálida sobre ruinas y suelo, llamas y chispas
 {const[fx,fy]=o.fire,fk=.8+.2*sin(t*9)+.1*sin(t*17);
  for(let r=44*o.u;r>=8;r-=5){c.fillStyle='rgba(255,140,50,'+(.035*fk).toFixed(3)+')';c.beginPath();c.arc(fx,fy-4,r,0,PI*2);c.fill()}
  for(let i=0;i<9;i++){const h=(7+sin(t*9+i*2.1)*3+sin(t*15+i)*2)*o.u*(1-Math.abs(i-4)/6),X=fx+(i-4)*1.5*o.u;px(c,X,fy-h,1.6,h,'#ff5a1a');px(c,X+.3,fy-h*.75,1,h*.75,'#ff9a30');if(h>3)px(c,X+.4,fy-h*.45,1,h*.45,'#fff0a0')}
  px(c,fx-6*o.u,fy-1,12*o.u,2,'#2a1608');px(c,fx-5*o.u,fy-2,10*o.u,1,'#5a2a10')}
 // estandarte colgante de la ruina y el de la asta
 {const X=rd(W*.045)+rd(14*o.u),Y=rd(H*.15)+10;for(let i=0;i<12;i++){const off=sin(t*2+i*.5)*1.2,len=(30-(Math.abs(i-5.5)<2.2?7:0))*o.u;px(c,X+i+off,Y,1,len,i%4===3?'#1d2c66':'#27408a');px(c,X+i+off,Y,1,1,'#c9a54a');if(i>3&&i<8)px(c,X+i+off,Y+10*o.u,1,3*o.u,'#c9a54a')}
  const[bx,by]=o.bn;for(let i=0;i<16;i++){const off=sin(t*2.2+i*.45)*(i*.14),hh=(24-(Math.abs(i-7.5)<1.9?6:0))*o.u;px(c,bx+2+i,by+4+off,1,hh,'#27408a');px(c,bx+2+i,by+4+off,1,1,'#c9a54a');px(c,bx+2+i,by+4+off+hh-1,1,1,'#c9a54a');if(i>4&&i<11)px(c,bx+2+i,by+4+off+8*o.u,1,(2.5-Math.abs(i-7.5)*.5)*2,'#c9a54a')}}
 // destello de la espada
 {const g=Math.max(0,sin(t*1.4)),[X,Y]=o.sw;if(g>.05){const n=1+rd(g*5),yy=Y+rd(12*o.u);c.fillStyle='rgba(255,255,255,'+g.toFixed(2)+')';c.fillRect(X-n,yy,n*2+1,1);c.fillRect(X,yy-n,1,n*2+1)}}
 // farol
 {const[X,Y]=o.lt,f=.14+.05*sin(t*7)+.03*sin(t*13);for(let r=30;r>=6;r-=4){c.fillStyle='rgba(255,190,90,'+(f*.3).toFixed(3)+')';c.beginPath();c.arc(X,Y,r,0,PI*2);c.fill()}}
 // brasas, luciérnagas y hojas
 const[fx2,fy2]=o.fire;
 for(const p of o.parts){
  if(p.t===0){p.x+=(sin(t*.8+p.p)*7+p.vx)*dt;p.y-=p.vy*dt;if(p.y<-4){p.y=H+2;if(p.p>3){p.x=fx2+(p.p-4.5)*8;p.y=fy2}}}
  else if(p.t===1){p.x+=(sin(t*.8+p.p)*7+p.vx)*dt;p.y+=sin(t*.6+p.p*2)*5*dt}
  else{p.x+=(sin(t*1.1+p.p)*14+9)*dt;p.y+=(9+sin(t*.7+p.p)*3)*dt;if(p.y>H*.9){p.y=-4;p.x=W*(.5+Math.random()*.5)}}
  if(p.x<-4)p.x=W+3;if(p.x>W+4)p.x=-3;
  const a=(.35+.65*Math.abs(sin(t*(p.t===1?2:3.5)+p.p))).toFixed(2);
  if(p.t===0){c.fillStyle='rgba(255,163,74,'+a+')';c.fillRect(rd(p.x),rd(p.y),1,1)}
  else if(p.t===1){c.fillStyle='rgba(214,255,138,'+a+')';c.fillRect(rd(p.x),rd(p.y),1,1);if(a>.8){c.fillStyle='rgba(214,255,138,.13)';c.fillRect(rd(p.x),rd(p.y)-1,1,3);c.fillRect(rd(p.x)-1,rd(p.y),3,1)}}
  else{c.fillStyle=p.p>3?'rgba(210,130,60,.8)':'rgba(120,160,70,.8)';c.fillRect(rd(p.x),rd(p.y),2,1);c.fillRect(rd(p.x)+(sin(t*4+p.p)>0?1:0),rd(p.y)+1,1,1)}}
 const U=o.u;
 // antorchas en los pilares
 for(const[X,Y]of o.tx){const fk=.8+.2*sin(t*9+X)+.1*sin(t*17+X*.3);
  for(let r2=30*U;r2>=6;r2-=4*U){c.fillStyle='rgba(255,140,50,'+(.04*fk).toFixed(3)+')';c.beginPath();c.arc(X,Y-4*U,r2,0,PI*2);c.fill()}
  px(c,X-2*U,Y,4*U,U,'#5a3a1e');px(c,X-U,Y+U,2*U,5*U,'#2a1808');px(c,X-2*U,Y-U,4*U,U,'#8a5a2a');
  for(let i=0;i<5;i++){const h=(6+sin(t*10+i*2+X)*2+sin(t*17+i)*1.2)*U*(1-Math.abs(i-2)/3.4),FX=X+(i-2)*U*.9;px(c,FX,Y-h,U*.9,h,'#ff5a1a');px(c,FX+.2*U,Y-h*.72,U*.6,h*.72,'#ff9a30');if(h>3*U)px(c,FX+.3*U,Y-h*.4,U*.4,h*.4,'#fff0a0')}}
 // farol colgante bajo el arco
 {const[ax,ay]=o.arc,sw_=sin(t*1.3)*2.5*U,ly=ay+13*U;
  for(let q=0;q<13*U;q+=Math.max(1,U*.9)){px(c,ax+sw_*(q/(13*U)),ay+q,Math.max(1,U*.5),Math.max(1,U*.9),q%2?'#3a3250':'#6a5a7a')}
  const lx2=ax+sw_,fk=.8+.2*sin(t*8)+.1*sin(t*13);
  for(let r2=26*U;r2>=5;r2-=4*U){c.fillStyle='rgba(255,190,90,'+(.05*fk).toFixed(3)+')';c.beginPath();c.arc(lx2,ly+3*U,r2,0,PI*2);c.fill()}
  px(c,lx2-2*U,ly-U,4*U,U,'#c9a54a');px(c,lx2-2*U,ly,4*U,5*U,'#1a1632');px(c,lx2-1.4*U,ly+.6*U,2.8*U,4*U,'#ffcf7a');px(c,lx2-.7*U,ly+1.4*U,1.4*U,2.6*U,'#fff3d0');px(c,lx2-2*U,ly+5*U,4*U,U,'#c9a54a');px(c,lx2-U*.5,ly+6*U,U,U,'#c9a54a')}
 // murciélagos girando alrededor del castillo
 for(const b of o.bats){const a=t*b.sp+b.p,X=o.cx0+cos(a)*b.rx,Y=o.cb-50*U+sin(a*1.7)*b.ry,fp=sin(t*14+b.p)>0?1:-1,w2=Math.max(2,rd(2.4*U));
  px(c,X,Y,Math.max(1,rd(U)),Math.max(1,rd(U)),'#0c0820');px(c,X-w2,Y-fp,w2,1,'#0c0820');px(c,X+Math.max(1,rd(U)),Y-fp,w2,1,'#0c0820');px(c,X-w2,Y-fp+(fp>0?1:-1),1,1,'#0c0820');px(c,X+Math.max(1,rd(U))+w2-1,Y-fp+(fp>0?1:-1),1,1,'#0c0820')}
 // runas que suben desde la espada
 {const GLY=['10101,01110,11111,01110,10101','11100,00100,01110,00100,00111','01110,10001,10101,10001,01110','10001,01010,00100,01010,10001','00100,01110,00100,11111,00100','11011,10101,01110,10101,11011'],[sx2,sy2]=o.fire,bx2=o.sw[0],ps=Math.max(1,rd(U*1.3));
  for(const q of o.runes){const ph=(t*.12+q.p)%1,a=sin(ph*PI),X=rd(bx2+sin(q.ph+t*.7)*16*U-2.5*ps),Y=rd(sy2-12*U-ph*74*U);if(a<=.05)continue;
   c.fillStyle='rgba('+(q.g%2?'150,225,255':'255,215,130')+','+(a*.1).toFixed(3)+')';c.fillRect(X-2*ps,Y-2*ps,9*ps,9*ps);
   c.fillStyle='rgba('+(q.g%2?'190,240,255':'255,236,170')+','+(a*.95).toFixed(2)+')';
   GLY[q.g].split(',').forEach((row,j)=>{for(let i=0;i<5;i++)if(row[i]==='1')c.fillRect(X+i*ps,Y+j*ps,ps,ps)})}}
 // marco ornamental
 c.drawImage(o.fr,0,0)}


// ===== v8.37: escena de fondo a partir de ilustración pixel art (fondo_titulo.webp) + animaciones por encima =====
// Si la imagen no carga, se usa la escena dibujada por código de arriba.
const IM={ok:0,sc:1,ox:0,oy:0},IMG=new Image();IMG.onload=()=>{IM.ok=1;BG=null};IMG.src='fondo_titulo.webp';
let BG=null,FR=null,AN=null;
const GLY=['10101,01110,11111,01110,10101','11100,00100,01110,00100,00111','01110,10001,10101,10001,01110','10001,01010,00100,01010,10001','00100,01110,00100,11111,00100','11011,10101,01110,10101,11011'];
const IW=1704,IH=729,WINS=[[1282, 233, 3, 10], [1286, 233, 3, 9], [1287, 268, 3, 12], [1282, 274, 3, 7], [1341, 277, 4, 13], [1337, 278, 3, 11], [1220, 293, 3, 8], [1224, 293, 3, 8], [1306, 297, 3, 11], [1166, 303, 7, 14], [1282, 307, 4, 9], [1287, 306, 3, 10], [1373, 324, 3, 8], [1283, 332, 3, 5], [1221, 335, 4, 8], [1128, 339, 7, 13], [1283, 338, 3, 7], [1167, 347, 3, 7], [1336, 349, 8, 14], [1219, 355, 4, 13], [1408, 357, 3, 12], [1372, 361, 3, 7], [1376, 361, 3, 7], [1282, 367, 4, 14], [1287, 367, 4, 14], [1167, 379, 3, 10], [1371, 379, 4, 13], [1171, 381, 3, 8], [1407, 383, 7, 13], [1338, 402, 3, 7], [472, 349, 3, 8]];
function mkFrame(){const[k,x]=layer(),p=Math.max(1,rd(H/240)),m=6*p,GD='#c9a54a',GL='#ffe9a0',GS='#7a5a1e';
 const gem=(X,Y)=>{px(x,X,Y,p,p,GL);px(x,X-p,Y,p,p,GD);px(x,X+p,Y,p,p,GD);px(x,X,Y-p,p,p,GD);px(x,X,Y+p,p,p,GD)};
 for(const[sx_,sy_]of[[1,1],[-1,1],[1,-1],[-1,-1]]){x.save();x.translate(sx_>0?0:W,sy_>0?0:H);x.scale(sx_,sy_);
  px(x,m,m,44*p,p,GD);px(x,m,m,p,44*p,GD);px(x,m+3*p,m+3*p,30*p,p,GS);px(x,m+3*p,m+3*p,p,30*p,GS);
  px(x,m+p,m+p,6*p,p,GL);px(x,m+p,m+p,p,6*p,GL);
  for(let i=10;i<=34;i+=8){px(x,m+i*p,m+2*p,2*p,p,GL);px(x,m+2*p,m+i*p,p,2*p,GL)}
  gem(m+8*p,m+8*p);gem(m+46*p,m+p);gem(m+p,m+46*p);
  px(x,m+10*p,m+10*p,p,p,GS);px(x,m+14*p,m+3*p,p,3*p,GS);px(x,m+3*p,m+14*p,3*p,p,GS);x.restore()}
 x.fillStyle='rgba(201,165,74,.5)';
 const g=6*p,hx=rd(W/2),hy=rd(H/2);
 x.fillRect(m+52*p,m,hx-g-m-52*p,p);x.fillRect(hx+g,m,W-m-52*p-hx-g,p);
 x.fillRect(m+52*p,H-m-p,hx-g-m-52*p,p);x.fillRect(hx+g,H-m-p,W-m-52*p-hx-g,p);
 x.fillRect(m,m+52*p,p,hy-g-m-52*p);x.fillRect(m,hy+g,p,H-m-52*p-hy-g);
 x.fillRect(W-m-p,m+52*p,p,hy-g-m-52*p);x.fillRect(W-m-p,hy+g,p,H-m-52*p-hy-g);
 gem(hx,m);gem(hx,H-m-p);gem(m,hy);gem(W-m-p,hy);
 return k}
function mkImg(){
 const asp=W/H,fit=asp>=2.05&&asp<=IW/IH,sc=fit?W/IW:Math.max(W/IW,H/IH),dw=IW*sc,dh=IH*sc,fp=asp<.9?.72:asp<2.05?.3:.5;
 IM.sc=sc;IM.ox=(W-dw)*fp;IM.oy=(H-dh)*.5;
 const[k,x]=layer();x.imageSmoothingEnabled=sc<1.25;x.imageSmoothingQuality='high';x.drawImage(IMG,IM.ox,IM.oy,dw,dh);
 if(fit&&dh<H-1){const t0=rd(IM.oy),b0=rd(IM.oy+dh);const[tk,tx]=layer(24,2);tx.imageSmoothingEnabled=true;tx.drawImage(IMG,0,0,IW,6,0,0,24,1);tx.drawImage(IMG,0,IH-6,IW,6,0,1,24,1);
  x.imageSmoothingEnabled=true;x.drawImage(tk,0,0,24,1,0,0,W,t0+1);x.drawImage(tk,0,1,24,1,0,b0-1,W,H-b0+1)}
 BG=k;FR=mkFrame();
 const r=mk(4242),X=ix=>IM.ox+ix*sc,Y=iy=>IM.oy+iy*sc;
 AN={X,Y,glint:[],star:[],fly:[],emb:[],bat:[],rune:[]};
 for(let i=0;i<90;i++)AN.glint.push({ix:40+r()*1620,iy:478+Math.pow(r(),1.4)*226,p:r()*6,s:.8+r()*1.6,w:2+r()*4});
 for(let i=0;i<70;i++)AN.star.push({ix:r()*IW,iy:r()*170,p:r()*6,b:r()<.25});
 for(let i=0;i<30;i++)AN.fly.push({ix:r()*IW,iy:470+r()*250,p:r()*6,sp:.25+r()*.5,a:20+r()*40});
 for(let i=0;i<22;i++)AN.emb.push({p:r(),sp:.18+r()*.22,dx:(r()-.5)*40});
 for(let i=0;i<6;i++)AN.bat.push({p:r()*6,rx:70+i*18,ry:26+r()*28,sp:.5+r()*.5});
 for(let i=0;i<9;i++)AN.rune.push({g:i%6,p:i/9,ph:r()*6});
 // nubes pixeladas que derivan despacio por el cielo alto (sprites chicos escalados sin suavizar)
 AN.cloud=[];for(let i=0;i<6;i++){const cw=34+rd(r()*22),ch=9+rd(r()*5),[ck,cx]=layer(cw,ch);cx.imageSmoothingEnabled=false;
  for(let j=0;j<6+rd(r()*3);j++){const ex=2+r()*(cw-4),ey=ch*.55+(r()-.5)*ch*.35,rx=4+r()*7,ry=2+r()*3.2;cx.fillStyle='#d0587a';cx.beginPath();cx.ellipse(ex,ey,rx,ry,0,0,PI*2);cx.fill();cx.fillStyle='#ff9a6a';cx.beginPath();cx.ellipse(ex,ey-ry*.35,rx*.85,ry*.6,0,0,PI*2);cx.fill()}
  AN.cloud.push({k:ck,cw,ch,iy:34+i*24+r()*10,sp:3+r()*5,off:r()*IW,al:.2+r()*.1,z:2.2+r()*1.8})}
 AN.win=WINS.map(([x,y,w,h])=>({x,y,w,h,ph:(((x/9)|0)*7+((y/16)|0)*13)%17+((x/9)|0)*.37}))}
function glowC(x,y,rad,rgb,a){const g=c.createRadialGradient(x,y,0,x,y,rad);g.addColorStop(0,'rgba('+rgb+','+a.toFixed(3)+')');g.addColorStop(1,'rgba('+rgb+',0)');c.fillStyle=g;c.fillRect(x-rad,y-rad,rad*2,rad*2)}
function drawImg(t){
 if(!BG)mkImg();
 const A=AN,sc=IM.sc,X=A.X,Y=A.Y,p1=Math.max(1,rd(sc*1.1));
 c.globalCompositeOperation='source-over';c.drawImage(BG,0,0);
 // franjas que se desplazan: agua que ondula, hiedra y juncos que se mecen, estandarte al viento
 {const sl=Math.max(1,rd(sc*1.5)),ss=Math.max(1,rd(sc));
  const band=(ix0,iy0,ix1,iy1,fn,step)=>{const x0=rd(X(ix0))+2,w=rd(X(ix1))-x0-2;for(let y=rd(Y(iy0));y<Y(iy1);y+=step){const iy=(y-IM.oy)/sc,dx=rd(fn(iy)*sc);if(!dx)continue;c.drawImage(BG,x0-dx,y,w,step,x0,y,w,step)}};
  const wv=(iy,k)=>(Math.sin(t*1.6+iy*.33)*.7+Math.sin(t*.9+iy*.11+k)*.5)*(.5+(iy-470)/240*1.7);
  band(380,470,1568,560,iy=>wv(iy,0),sl);band(520,560,1540,708,iy=>wv(iy,1),sl);
  band(90,232,298,330,iy=>Math.sin(t*1.25+iy*.06)*((iy-232)/98)*2.4,ss);
  band(362,560,525,722,iy=>Math.sin(t*1.7+iy*.05)*Math.max(0,(722-iy)/162)*2.6,ss);
  band(1390,600,1530,708,iy=>Math.sin(t*1.9+iy*.05+2)*Math.max(0,(708-iy)/108)*2.4,ss);
  band(1637,420,1673,522,iy=>(Math.sin(t*2.3+iy*.07)*.8+Math.sin(t*1.1+iy*.03))*((iy-420)/102)*2.8,ss)}
 // nubes que derivan
 c.imageSmoothingEnabled=false;
 for(const n of A.cloud){const w=n.cw*n.z*sc,xx=((n.off+t*n.sp)%(IW+n.cw*n.z*2))-n.cw*n.z;c.globalAlpha=n.al;c.drawImage(n.k,rd(X(xx)),rd(Y(n.iy)),rd(w),rd(n.ch*n.z*sc))}
 c.globalAlpha=1;
 // estrellas que titilan (cielo alto)
 for(const s of A.star){const a=.25+.75*Math.abs(sin(t*1.2+s.p));if(Y(s.iy)<0)continue;c.fillStyle='rgba(255,240,225,'+(a*(1-s.iy/190)).toFixed(2)+')';const x0=rd(X(s.ix)),y0=rd(Y(s.iy));c.fillRect(x0,y0,p1,p1);if(s.b&&a>.6){c.fillRect(x0-p1,y0,p1*3,p1);c.fillRect(x0,y0-p1,p1,p1*3)}}
 // estrella fugaz
 {const ph=(t%11)/11;if(ph<.06){const k=ph/.06,xx=W*.18+k*W*.3,yy=H*.05+k*H*.16;for(let i=0;i<12;i++){c.fillStyle='rgba(255,246,220,'+((1-i/12)*(1-k*.5)).toFixed(2)+')';c.fillRect(rd(xx-i*1.8*p1),rd(yy-i*.8*p1),p1,p1)}}}
 // destellos en el agua
 for(const g of A.glint){const v=Math.pow(Math.max(0,sin(t*g.s+g.p)),5);if(v<.05)continue;const warm=g.ix>1050;c.fillStyle=warm?'rgba(255,205,120,'+(v*.9).toFixed(2)+')':'rgba(190,215,255,'+(v*.75).toFixed(2)+')';c.fillRect(rd(X(g.ix)),rd(Y(g.iy)),Math.max(1,rd(g.w*sc)),p1)}
 // ventanas del castillo que parpadean y a veces se apagan
 for(const w of A.win){const off=Math.sin(t*.33+w.ph*2.7)>.94,n=Math.sin(t*13+w.ph*3)*Math.sin(t*7.3+w.ph);
  if(off){c.fillStyle='rgba(28,12,46,.88)';c.fillRect(rd(X(w.x)),rd(Y(w.y)),Math.max(1,rd(w.w*sc)),Math.max(1,rd(w.h*sc)))}
  else if(n>.15){c.globalCompositeOperation='lighter';c.fillStyle='rgba(255,205,100,'+(.16+.22*n).toFixed(2)+')';c.fillRect(rd(X(w.x)),rd(Y(w.y)),Math.max(1,rd(w.w*sc)),Math.max(1,rd(w.h*sc)));c.globalCompositeOperation='source-over'}}
 // llama viva de la hoguera
 {const fx=X(233),fy=Y(658),F=[['#ff4a14',.85,1],['#ff8a28',.9,.74],['#ffd060',.95,.5],['#fff4b8',1,.28]];
  for(const[col,al,k]of F){c.fillStyle=col;c.globalAlpha=al;for(let i=0;i<7;i++){const d=Math.abs(i-3),hh=(9+13*(1-d/4))*k*(.78+.3*sin(t*(8.5+i*1.9)+i*2.1)+.12*sin(t*21+i)),ww=Math.max(p1,rd(sc*4.2*k)),xx=fx+(i-3)*sc*4*(k*.6+.4)+sin(t*5+i)*sc*.8;c.fillRect(rd(xx-ww/2),rd(fy-hh*sc),ww,rd(hh*sc))}}
  c.globalAlpha=1}
 c.globalCompositeOperation='lighter';
 // rayos del sol que giran muy despacio
 {const sx_=X(1524),sy_=Y(353);for(let i=0;i<14;i++){const a=i*PI*2/14+t*.035,w=.075+.02*sin(t*.6+i);c.fillStyle='rgba(255,175,80,'+(.045+.02*sin(t*.5+i*1.7)).toFixed(3)+')';c.beginPath();c.moveTo(sx_,sy_);c.lineTo(sx_+cos(a-w)*420*sc,sy_+sin(a-w)*420*sc);c.lineTo(sx_+cos(a+w)*420*sc,sy_+sin(a+w)*420*sc);c.closePath();c.fill()}}
 // sol, farol y hoguera respiran
 glowC(X(1524),Y(353),150*sc*(1+.05*sin(t*.8)),'255,170,70',.2+.05*sin(t*.8));
 const fk=.8+.2*sin(t*9)+.1*sin(t*15);
 glowC(X(185),Y(282),46*sc,'255,190,90',.2*(.85+.15*sin(t*3.1)));
 glowC(X(234),Y(646),78*sc*fk,'255,140,50',.26*fk);
 // brasas que suben de la hoguera
 for(const e of A.emb){const ph=(t*e.sp+e.p)%1,xx=X(234)+sin(ph*7+e.p*9)*10*sc+e.dx*ph*sc,yy=Y(640)-ph*130*sc,a=1-ph;c.fillStyle='rgba(255,'+rd(150+80*(1-ph))+',60,'+(a*.9).toFixed(2)+')';c.fillRect(rd(xx),rd(yy),p1,p1)}
 // luciérnagas
 for(const f of A.fly){const xx=X(f.ix)+sin(t*f.sp+f.p)*f.a*sc,yy=Y(f.iy)+cos(t*f.sp*1.3+f.p)*f.a*.5*sc,a=.35+.65*Math.max(0,sin(t*1.7+f.p*3));glowC(xx,yy,9*sc,'210,255,120',.28*a);c.fillStyle='rgba(240,255,170,'+a.toFixed(2)+')';c.fillRect(rd(xx),rd(yy),p1,p1)}
 // bruma sobre el lago
 for(let i=0;i<3;i++){const xx=((t*(6+i*3)*sc+i*W*.37)%(W*1.4))-W*.2,yy=Y(468+i*16);c.save();c.translate(xx,yy);c.scale(5,.5);glowC(0,0,W*.09,'200,170,230',.06);c.restore()}
 c.globalCompositeOperation='source-over';
 // murciélagos alrededor del castillo
 for(const b of A.bat){const a=t*b.sp+b.p,xx=X(1282)+cos(a)*b.rx*sc,yy=Y(250)+sin(a*1.7)*b.ry*sc,fp=sin(t*14+b.p)>0?1:-1,w2=Math.max(2,rd(2.6*sc)),q=Math.max(1,rd(sc*1.1));
  c.fillStyle='#0c0820';c.fillRect(rd(xx),rd(yy),q,q);c.fillRect(rd(xx-w2),rd(yy-fp*q),w2,q);c.fillRect(rd(xx+q),rd(yy-fp*q),w2,q);c.fillRect(rd(xx-w2),rd(yy-fp*q+(fp>0?q:-q)),q,q);c.fillRect(rd(xx+q+w2-q),rd(yy-fp*q+(fp>0?q:-q)),q,q)}
 // runas que suben desde la espada
 {const ps=Math.max(1,rd(sc*1.3));for(const q of A.rune){const ph=(t*.12+q.p)%1,a=sin(ph*PI),xx=rd(X(198)+sin(q.ph+t*.7)*22*sc-2.5*ps),yy=rd(Y(585)-ph*120*sc);if(a<=.05)continue;
  c.fillStyle='rgba('+(q.g%2?'150,225,255':'255,215,130')+','+(a*.1).toFixed(3)+')';c.fillRect(xx-2*ps,yy-2*ps,9*ps,9*ps);
  c.fillStyle='rgba('+(q.g%2?'190,240,255':'255,236,170')+','+(a*.95).toFixed(2)+')';
  GLY[q.g].split(',').forEach((row,j)=>{for(let i=0;i<5;i++)if(row[i]==='1')c.fillRect(xx+i*ps,yy+j*ps,ps,ps)})}}
 c.drawImage(FR,0,0)}
function size(){const dpr=Math.min(3,window.devicePixelRatio||1);H=Math.max(240,Math.min(800,rd(innerHeight*dpr)));W=Math.max(320,Math.ceil(H*innerWidth/Math.max(1,innerHeight)));cv.width=W;cv.height=H;cv.style.imageRendering=innerHeight/H>=1.6?'pixelated':'auto';L=null;BG=null}
let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(size,120)});size();
function frame(ms){requestAnimationFrame(frame);
 const menu=document.getElementById('menu'),vis=G.mode==='title'&&menu&&menu.style.display!=='none'&&!document.hidden;
 if(vis!==on){on=vis;wrap.classList.toggle('on',vis)}
 if(!vis){last=ms;return}
 const dt=Math.min(.05,Math.max(0,(ms-last)/1000));last=ms;TT+=dt;
 if(IM.ok){drawImg(TT);return}
 if(!L)build();
 draw(TT,dt)}
requestAnimationFrame(frame);

// ---------- menú: logo + botones ----------
window.tCont=function(){const sl=[1,2,3].filter(n=>!!slotData(n));if(sl.length===1){SLOT=sl[0];m_off();return cont()}slotPick('load')};
showTitle=function(){
 G.mode='title';relAll();document.getElementById('dlg').style.display='none';
 const m=document.getElementById('menu'),has=[1,2,3].some(n=>!!slotData(n));m.style.display='flex';m.classList.add('tt');
 m.innerHTML='<div class="tp"><div class="tlogo"><span class="t1"><i></i><em>EL ÚLTIMO</em><i></i></span><h1>JURAMENTO</h1><span class="orn"><i></i><b>◆</b><i></i></span><p>No dejes que el olvido te arrebate<br>lo que aún tiene un nombre.</p></div>'
  +'<div class="tnav">'+(has?'<button class="tb tpri" onclick="tCont()">Continuar</button>':'')
  +'<button class="tb" onclick="tPlay()">'+(has?'Nuevo juego':'Jugar')+'</button><button class="tb" onclick="openSettings(\'title\')">Ajustes</button></div>'
  +'<div id="tmsg"></div><small class="tver">'+VER+'</small></div>'};
if(G.mode==='title'&&document.getElementById('menu').classList.contains('tt'))showTitle();
})();
