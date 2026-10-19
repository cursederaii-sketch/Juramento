// ===== LA GAVIOTA, UN BARCO DE VERDAD (v8.34): casco con proa en punta y popa redonda, castillo de popa, cañones, bauprés, jarcia y espuma =====
// Qué cambia respecto al rectángulo de antes:
//  · silueta: popa redondeada (transom), eslora larga y proa en punta de 45° (se recorta el mapa de baldosas y las esquinas de la escalera se rellenan en diagonal);
//  · costado de casco continuo con tablones, cinta dorada, portas abiertas con cañones asomando y línea de flotación con espuma;
//  · castillo de popa elevado (escalones), timón con rueda y bitácora, bandera que ondea y cae cuando el barco se para;
//  · bauprés con figurón de proa, estayes entre palos, cabrestante con cadena, escotilla con rejilla, rollos de cabo;
//  · estela y ola de proa que corren pegadas al casco mientras navega.
// Cargar DESPUÉS de travesia_mar.js.
(function(){
if(typeof RG==='undefined'||!window.TRVMAR||!window.TRV)return;
const M=TRVMAR.M,CY=19,TAU=6.283185;
const here=()=>!!(rg&&rg.id==='barco'&&W&&W.hullW);
const broken=()=>!!(S&&S.rv&&S.rv['trav:roto']);
const clp=(v,a,b)=>Math.max(a,Math.min(b,v));
// semianchura del casco (en baldosas) según la columna: popa 3→7 en diagonal, 7 en el centro, proa 7→0 en diagonal
const H=x=>x<5||x>52?-1:x<=9?x-2:x<=45?7:52-x;

// ---------- contorno: esquinas salientes de la escalera de baldosas ----------
const T=[[80,256]],B=[[80,368]];
for(let x=6;x<=9;x++){T.push([x*16,(CY-H(x))*16]);B.push([x*16,(CY+H(x)+1)*16])}
T.push([736,192]);B.push([736,432]);
for(let x=46;x<=52;x++){T.push([(x+1)*16,(CY-H(x))*16]);B.push([(x+1)*16,(CY+H(x)+1)*16])}
const TIP=[848,312];
const CAN_N=[16,19,28,31,39,42],CAN_S=[19,22,29,32,35,45];
const CAN=[];for(const x of CAN_N)CAN.push([x,12,-1]);for(const x of CAN_S)CAN.push([x,26,1]);
function ybot(x){for(let i=1;i<B.length;i++){const a=B[i-1],b=B[i];if(x>=a[0]&&x<=b[0])return b[0]===a[0]?a[1]:a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0])}return B[B.length-1][1]}
function hullPath(){g.beginPath();g.moveTo(T[0][0],T[0][1]);for(let i=1;i<T.length;i++)g.lineTo(T[i][0],T[i][1]);for(let i=B.length-1;i>=0;i--)g.lineTo(B[i][0],B[i][1]);g.closePath()}

// ---------- recorte del mapa al nuevo casco (antes de hornear) ----------
{const r=RG.find(q=>q.id==='barco');if(r){const b=r.build;r.build=function(W){b.call(this,W);
 const C=W.cols,R=W.rows;
 for(let ty=0;ty<R;ty++)for(let tx=0;tx<C;tx++){
  const h=H(tx),i=W.i(tx,ty),inside=h>=0&&Math.abs(ty-CY)<=h;
  if(inside){if(W.gd[i]==='w')W.gd[i]='f'}
  else if(tx>=4&&tx<=54&&W.gd[i]==='f'){W.gd[i]='w';W.on[i]=null}}
 const hw=new Uint8Array(C*R),nr=new Uint8Array(C*R);
 for(let i=0;i<hw.length;i++)if(W.gd[i]==='w')hw[i]=1;
 // en popa y proa las barandas las dibuja este archivo en diagonal: se apagan las rectas de la escalera
 for(let ty=0;ty<R;ty++)for(let tx=0;tx<C;tx++){const i=W.i(tx,ty);if(W.gd[i]==='w')continue;
  if(tx<=8||tx>=46)nr[i]=1|2|(tx>5?4:0)|(tx<52?8:0)}
 W.hullW=hw;W.noRail=nr;W.hullBand=1;W._nt=null;
 // bloqueadores invisibles (el arte lo dibuja este archivo): cañones, barandilla del castillo de popa y palo de trinquete
 COL.cannon=COL.cannon||[2,3,14,16];COL.brail=COL.brail||[12,0,16,16];
 const put=(n,x,y)=>{if(W.ok(x,y)&&W.gd[W.i(x,y)]!=='w'&&!W.on[W.i(x,y)])W.o(n,x,y,1,1)};
 put('pillar',46,19);
 for(const c of CAN)put('cannon',c[0],c[1]);
 for(let y=12;y<=26;y++)if(y<18||y>20)put('brail',13,y);
 for(const q of[['crate',14,26],['barrel',21,12],['crate',34,12],['barrel',43,26],['crate',10,26],['barrel',30,26],['crate',44,12]])put(q[0],q[1],q[2])}}}

// ---------- esquinas de la escalera rellenas en diagonal ----------
function notches(){
 if(W._nt)return W._nt;const L=[];
 const f=(x,y)=>W.ok(x,y)&&W.gd[W.i(x,y)]!=='w';
 for(let ty=8;ty<=30;ty++)for(let tx=3;tx<=55;tx++){
  if(!W.ok(tx,ty))continue;const i=W.i(tx,ty);if(W.gd[i]!=='w'||!W.hullW[i])continue;
  const n=f(tx,ty-1),s=f(tx,ty+1),w=f(tx-1,ty),e=f(tx+1,ty);if(n+s+w+e!==2)continue;
  const k=n&&w?0:n&&e?1:s&&w?2:s&&e?3:-1;if(k>=0)L.push([tx*16,ty*16,k])}
 return W._nt=L}
function tri(X,Y,k){
 g.beginPath();
 if(k===0){g.moveTo(X,Y);g.lineTo(X+16,Y);g.lineTo(X,Y+16)}
 else if(k===1){g.moveTo(X,Y);g.lineTo(X+16,Y);g.lineTo(X+16,Y+16)}
 else if(k===2){g.moveTo(X,Y);g.lineTo(X,Y+16);g.lineTo(X+16,Y+16)}
 else{g.moveTo(X+16,Y);g.lineTo(X+16,Y+16);g.lineTo(X,Y+16)}
 g.closePath()}

// ---------- baranda diagonal ----------
function rail(a,b,inward){
 pline(g,a[0]-2,a[1]-2,b[0]-2,b[1]-2,'#2a1a0c',4);
 pline(g,a[0]-1,a[1]-2,b[0]-1,b[1]-2,'#8a6238',2);
 pline(g,a[0]-1,a[1]-2+inward*4,b[0]-1,b[1]-2+inward*4,'rgba(0,0,0,.28)',2)}
function post(x,y){fr(x-1,y-8,3,8,'#5a3a1e');fr(x,y-8,1,7,'#7a5430');fr(x-1,y-9,3,1,'#9a7040');fr(x-2,y-1,5,1,'#2a1a0c')}
const RING=[];
{const seg=(p,q,side)=>{const dx=q[0]-p[0],dy=q[1]-p[1],L=Math.hypot(dx,dy),n=Math.max(1,Math.floor(L/3));
  const nx=side>0?dy/L:-dy/L,ny=side>0?-dx/L:dx/L;for(let k=0;k<n;k++){const u=k/n;RING.push([p[0]+dx*u,p[1]+dy*u,nx,ny,side<0?1:0])}};
 for(let i=0;i<T.length-1;i++)seg(T[i],T[i+1],1);for(let i=0;i<B.length-1;i++)seg(B[i],B[i+1],-1);
 for(let y=256;y<368;y+=3)RING.push([80,y,-1,0,0])}
const POSTS=[];
{const add=(arr,a,b)=>{for(let i=a;i<b;i++){const p=arr[i],q=arr[i+1],L=Math.hypot(q[0]-p[0],q[1]-p[1]),n=Math.max(1,Math.round(L/22));
  for(let k=0;k<n;k++){const u=k/n;POSTS.push([p[0]+(q[0]-p[0])*u,p[1]+(q[1]-p[1])*u])}}};
 add(T,0,4);add(T,5,T.length-1);add(B,0,4);add(B,5,B.length-1);
 for(const y of[272,296,320,344])POSTS.push([82,y]);POSTS.push([TIP[0],TIP[1]-2])}

// ---------- detalles de cubierta a nivel del suelo ----------
function coil(cx,cy){g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=4;g.beginPath();g.ellipse(cx,cy+1,7,3.6,0,0,TAU);g.stroke();
 for(const[rx,ry,c]of[[6,3,'#b8975a'],[4.4,2.2,'#9a7a44'],[2.6,1.3,'#b8975a']]){g.strokeStyle=c;g.lineWidth=1.6;g.beginPath();g.ellipse(cx,cy,rx,ry,0,0,TAU);g.stroke()}}
function hatch(X,Y,w,h,t){fr(X-2,Y-2,w+4,h+4,'#2a1a0c');fr(X,Y,w,h,'#0d0704');fr(X+2,Y+2,w-4,h-4,'rgba(255,140,50,'+(.07+.03*Math.sin(t*7+X)).toFixed(2)+')');
 for(let i=0;i<=w;i+=4)fr(X+i,Y,2,h,'#4a2f18');for(let j=0;j<=h;j+=4)fr(X,Y+j,w,2,'#4a2f18');
 fr(X-2,Y-2,w+4,1,'#8a6238');fr(X-2,Y-2,1,h+4,'#6e4a26');fr(X-2,Y+h+1,w+4,1,'#120804')}
function deckThings(t){
 hatch(272,304,32,32,t);hatch(656,304,32,32,t);hatch(448,240,32,32,t);
 // escotilla de acceso al camarote: marco elevado con dos puertas de tablones
 {const X=416,Y=352;fr(X-3,Y-3,38,30,'#1a0e06');fr(X-2,Y-3,36,1,'#a07a48');fr(X,Y,32,24,'#5e4026');
  for(const dx of[0,16]){fr(X+dx,Y,15,24,'#7a5430');for(let k=0;k<4;k++)fr(X+dx,Y+1+k*6,15,1,'#33200f');fr(X+dx,Y,15,1,'#a07a48');fr(X+dx+(dx?1:12),Y+11,2,3,'#c9a54a')}
  fr(X+15,Y,2,24,'#1a0e06')}
 coil(11*16+8,13*16+9);coil(43*16+8,25*16+5);coil(35*16+8,13*16+9);coil(27*16+8,25*16+4);
 // cabrestante y cadena del ancla
 {const cx=49*16-4,cy=19*16+9;g.fillStyle='rgba(0,0,0,.32)';g.beginPath();g.ellipse(cx,cy+3,10,4.5,0,0,TAU);g.fill();
  g.fillStyle='#3a2512';g.beginPath();g.ellipse(cx,cy,8,4,0,0,TAU);g.fill();g.fillStyle='#6e4a26';g.beginPath();g.ellipse(cx,cy-2,8,4,0,0,TAU);g.fill();
  g.fillStyle='#8a6238';g.beginPath();g.ellipse(cx,cy-2,5,2.4,0,0,TAU);g.fill();g.fillStyle='#c9a54a';g.beginPath();g.ellipse(cx,cy-2,2,1,0,0,TAU);g.fill();
  for(let k=0;k<4;k++){const a=k*1.5708+.5;pline(g,cx,cy-2,cx+Math.cos(a)*11,cy-2+Math.sin(a)*5.5,'#4a2f18',2)}
  for(let k=0;k<4;k++){const x=cx+9+k*5,y=cy+1+k*.15;fr(x,y,3,2,k%2?'#55555f':'#3a3a44');fr(x,y,3,1,'#7a7a86')}}}

// ---------- suelo: relleno diagonal, castillo de popa, baranda, costado, espuma ----------
function ground(){
 const t=M.t,sp=M.sp,cx=Math.round(cam.x),cy=Math.round(cam.y);
 // 1) esquinas diagonales con tablones
 for(const[X,Y,k]of notches()){if(X<cx-20||X>cx+GW+20||Y<cy-20||Y>cy+GH+20)continue;
  g.save();tri(X,Y,k);g.clip();fr(X,Y,16,16,'#6e4e30');fr(X,Y+5,16,1,'rgba(22,11,4,.42)');fr(X,Y+10,16,1,'rgba(22,11,4,.42)');fr(X,Y+6,16,1,'rgba(255,225,170,.08)');fr(X,Y+11,16,1,'rgba(255,225,170,.08)');g.restore()}
 // 2) castillo de popa elevado: tono más claro, contrahuella y escalones al centro
 g.save();hullPath();g.clip();
 fr(80,192,144,240,'rgba(255,226,170,.075)');
 fr(224,192,6,240,'#3a2512');fr(224,192,1,240,'#a07a48');fr(229,192,1,240,'#1a0e06');
 for(let y=192;y<432;y+=8)fr(225,y,4,1,'rgba(0,0,0,.35)');
 fr(230,192,7,240,'rgba(0,0,0,.2)');fr(237,192,4,240,'rgba(0,0,0,.08)');
 fr(222,288,16,48,'#5e4026');for(let i=0;i<4;i++){fr(222+i*4,288,3,48,i%2?'#7a5832':'#8a6238');fr(222+i*4,288,1,48,'#b08a54')}
 g.restore();
 // 3) cubierta: escotilla, cabos, cabrestante
 deckThings(t);
 // 4) barandas en diagonal
 rail(T[0],T[1],1);for(let i=1;i<4;i++)rail(T[i],T[i+1],1);
 for(let i=5;i<T.length-1;i++)rail(T[i],T[i+1],1);
 rail(B[0],B[1],-1);for(let i=1;i<4;i++)rail(B[i],B[i+1],-1);
 for(let i=5;i<B.length-1;i++)rail(B[i],B[i+1],-1);
 pline(g,78,258,78,366,'#2a1a0c',4);pline(g,79,258,79,366,'#8a6238',2);
 pline(g,TIP[0]-2,304,TIP[0]-2,318,'#2a1a0c',4);pline(g,TIP[0]-1,304,TIP[0]-1,318,'#8a6238',2);
 // 5) costado de casco (lado sur): tablones, cinta dorada, portas con cañones, línea de flotación
 const bob=Math.round(Math.sin(t*1.25)*1.3+Math.sin(t*3.1)*M.roll*.35);
 const HB=17;
 g.fillStyle='rgba(2,10,20,.4)';g.beginPath();g.moveTo(B[0][0],B[0][1]+bob+HB);for(const p of B)g.lineTo(p[0],p[1]+bob+HB);for(let k=B.length-1;k>=0;k--)g.lineTo(B[k][0],B[k][1]+bob+HB+4);g.closePath();g.fill();
 g.beginPath();g.moveTo(B[0][0],B[0][1]);for(const p of B)g.lineTo(p[0],p[1]);for(let k=B.length-1;k>=0;k--)g.lineTo(B[k][0],B[k][1]+HB+bob);g.closePath();g.fillStyle='#4a2f18';g.fill();
 g.save();g.clip();
 for(const[dy,c]of[[1,'#8a6238'],[2,'#6e4a26'],[4,'#33200f'],[6,'#c9a54a'],[7,'#8a6a2c'],[9,'#33200f'],[13,'#33200f'],[16,'#1a0e06']]){g.strokeStyle=c;g.lineWidth=1;g.beginPath();g.moveTo(B[0][0],B[0][1]+dy+.5);for(const p of B)g.lineTo(p[0],p[1]+dy+.5);g.stroke()}
 // juntas verticales de los tablones
 for(let x=84;x<TIP[0];x+=11){const y=ybot(x);fr(x+((x*7)%5),y+1,1,HB,'rgba(26,14,6,.55)')}
 // ventanas iluminadas del camarote de popa
 for(const wx of[150,172,194,214]){const y=ybot(wx)+bob;fr(wx-7,y+3,14,11,'#2a1a0c');fr(wx-7,y+3,14,1,'#c9a54a');fr(wx-6,y+4,12,9,'rgba(255,196,96,'+(.85+.1*Math.sin(t*3+wx)).toFixed(2)+')');fr(wx,y+4,1,9,'#2a1a0c');fr(wx-6,y+8,12,1,'#2a1a0c');fr(wx-6,y+12,12,1,'rgba(0,0,0,.35)')}
 // escalas de cuerda colgadas del costado
 for(const lx of[360,684]){const y=ybot(lx)+bob;fr(lx-4,y-2,1,HB+3,'#b89458');fr(lx+4,y-2,1,HB+3,'#b89458');for(let k=0;k<5;k++)fr(lx-4,y+1+k*3,9,1,'#8a6a3a');fr(lx-5,y-3,11,2,'#6e4a26')}
 // portas y cañones
 for(const tx of[12,16,20,24,28,32,36,40,44]){const x=tx*16+8,y=ybot(x)+bob;
  fr(x-8,y+4,16,10,'#120804');fr(x-8,y+3,16,1,'#8a6238');fr(x-8,y+14,16,1,'#2a1a0c');fr(x-8,y+4,1,10,'#33200f');fr(x+7,y+4,1,10,'#33200f');
  const o=(1-Math.min(1,sp))*0+Math.sin(t*1.25+tx)*.5;
  disc(g,Math.round(x),Math.round(y+9+o),4,'#2b2b34');disc(g,Math.round(x),Math.round(y+9+o),2,'#0a0a0e');fr(x-3,y+6+o,3,1,'#8a8a98');fr(x-3,y+13+o,6,1,'#15151b')}
 g.restore();
 // línea de flotación: espuma que corre hacia popa
 for(let x=80;x<TIP[0];x+=2){const y=ybot(x)+HB+bob,w=Math.sin(x*.19-M.sc*.2+t*2.3);if(w>.25){g.fillStyle='rgba(238,248,255,'+(.35+.3*w).toFixed(2)+')';g.fillRect(x,y+(w>.7?-1:0),3,1+(w>.8?1:0))}}
 // 5b) espuma que abraza todo el casco
 for(const r of RING){if(r[0]<cx-10||r[0]>cx+GW+10||r[1]<cy-40||r[1]>cy+GH+40)continue;
  const y0=r[1]+(r[4]?HB+bob:0),d=2+1.6*Math.sin(t*2+r[0]*.2),a=.22+.5*Math.max(0,Math.sin(r[0]*.31+r[1]*.17+t*2.1-M.sc*.05));
  if(a<.3)continue;g.fillStyle='rgba(238,248,255,'+a.toFixed(2)+')';g.fillRect(Math.round(r[0]+r[2]*d),Math.round(y0+r[3]*d),3,2)}
 // 6) ola de proa y espuma pegada a las diagonales
 if(sp>.05){
  const flow=M.sc*.02;
  const sides=[[[852,309],[757,204],[736,186],[640,150],[520,128]],[[852,315],[757,420],[736,440+HB-4],[640,470],[520,490]]];
  for(const[si,P]of sides.entries()){let tot=0;const seg=[];for(let i=1;i<P.length;i++){const l=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);seg.push(l);tot+=l}
   for(let ln=0;ln<2;ln++)for(let j=0;j<18;j++){let u=((j/18)+flow*(1+ln*.4)+ln*.37+si*.11)%1,d=u*tot,k=0;while(k<seg.length-1&&d>seg[k]){d-=seg[k];k++}
    const a=P[k],b=P[k+1],q=seg[k]?d/seg[k]:0,x=a[0]+(b[0]-a[0])*q,y=a[1]+(b[1]-a[1])*q+(si?1:-1)*ln*3;
    g.fillStyle='rgba(238,248,255,'+((1-u)*(.8-ln*.25)*sp).toFixed(2)+')';g.fillRect(Math.round(x),Math.round(y),ln?3:5,ln?1:2)}}
  g.strokeStyle='rgba(238,248,255,'+(.55*sp).toFixed(2)+')';g.lineWidth=2;g.beginPath();g.ellipse(TIP[0]+4,TIP[1],7+Math.sin(t*5)*1.5,12,0,-1.35,1.35);g.stroke();
  g.strokeStyle='rgba(238,248,255,'+(.3*sp).toFixed(2)+')';g.beginPath();g.ellipse(TIP[0]+10,TIP[1],12+Math.sin(t*4)*2,20,0,-1.2,1.2);g.stroke()}}

// ---------- objetos con orden de profundidad: timón, bandera, bauprés, estayes, postes ----------
function sag(x0,y0,x1,y1,s,col,a){g.strokeStyle=col;g.globalAlpha=a;g.lineWidth=1;g.beginPath();g.moveTo(x0,y0);g.quadraticCurveTo((x0+x1)/2,(y0+y1)/2+s,x1,y1);g.stroke();g.globalAlpha=1}
function dr(Dr,Lt,cx,cy){
 const t=M.t,sp=M.sp;
 for(const p of POSTS){if(p[0]<cx-12||p[0]>cx+GW+12||p[1]<cy-12||p[1]>cy+GH+30)continue;const x=p[0],y=p[1];Dr.push({y,f:()=>post(x,y)})}

 // cañones de cubierta en ambas bandas
 for(const c of CAN){const x=c[0]*16+8,y=c[1]*16+9,d=c[2];if(x<cx-14||x>cx+GW+14||y<cy-30||y>cy+GH+30)continue;
  Dr.push({y:y+(d<0?5:9),f:()=>{
   g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(x,y+4,9,3.5,0,0,TAU);g.fill();
   fr(x-6,y-3,12,8,'#4a2f18');fr(x-6,y-3,12,1,'#7a5430');fr(x-6,y+4,12,1,'#2a1a0c');fr(x-8,y-2,2,6,'#241810');fr(x+6,y-2,2,6,'#241810');fr(x-8,y-2,1,6,'#4a3a2a');
   if(d<0){fr(x-2,y-15,5,16,'#1d1d24');fr(x-2,y-15,1,16,'#4c4c5a');fr(x+2,y-15,1,16,'#0d0d12');fr(x-3,y-16,7,2,'#2c2c36');fr(x-3,y-8,7,1,'#c9a54a');fr(x-1,y+1,3,2,'#2c2c36')}
   else{fr(x-2,y-2,5,16,'#1d1d24');fr(x-2,y-2,1,16,'#4c4c5a');fr(x+2,y-2,1,16,'#0d0d12');fr(x-3,y+12,7,2,'#2c2c36');fr(x-3,y+5,7,1,'#c9a54a');fr(x-1,y-3,3,2,'#2c2c36')}}})}
 // balaustrada del castillo de popa (queda libre la escalera central)
 {const seg=(y0,y1)=>{if(220<cx-10||220>cx+GW+10||y1<cy-10||y0>cy+GH+10)return;Dr.push({y:y1+6,f:()=>{
   pline(g,219,y0-7,219,y1-7,'#2a1a0c',3);pline(g,220,y0-7,220,y1-7,'#9a7040',1);
   for(let y=y0;y<=y1;y+=10){fr(220,y-7,3,8,'#5a3a1e');fr(221,y-7,1,7,'#8a6238');fr(220,y-9,3,2,'#c9a54a')}}})};
  seg(196,284);seg(344,broken()?380:428);
  for(const ny of[290,334])Dr.push({y:ny+4,f:()=>{fr(218,ny-14,6,14,'#6e4a26');fr(219,ny-14,2,14,'#9a7040');disc(g,221,ny-15,3,'#c9a54a');fr(220,ny-17,2,1,'#ffe08a')}})}
 // rueda del timón y bitácora (el timonel se queda en la popa elevada)
 {const x=206,y=316;Dr.push({y:y+2,f:()=>{
  g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(x,y,9,3.5,0,0,TAU);g.fill();
  fr(x-2,y-14,4,14,'#4a2f18');fr(x-1,y-14,1,13,'#7a5430');
  const wy=y-20,rot=Math.sin(t*.45)*.55+Math.sin(t*1.3)*.1;
  g.strokeStyle='#5a3a1e';g.lineWidth=3;g.beginPath();g.ellipse(x,wy,3.2,10,0,0,TAU);g.stroke();
  g.strokeStyle='#a07a48';g.lineWidth=1;g.beginPath();g.ellipse(x,wy,3.2,10,0,0,TAU);g.stroke();
  for(let k=0;k<8;k++){const a=k*.7854+rot;g.strokeStyle='#8a6238';g.beginPath();g.moveTo(x,wy);g.lineTo(x+Math.cos(a)*3.2,wy+Math.sin(a)*10);g.stroke();
   fr(x+Math.cos(a)*4.6-.5,wy+Math.sin(a)*12.4-1,2,2,'#c9a54a')}
  fr(x-1,wy-1,3,3,'#c9a54a');
  fr(212,y-12,8,12,'#3a2512');fr(212,y-12,8,2,'#6e4a26');fr(213,y-9,6,4,'#0d0704');fr(214,y-8,4,2,'rgba(255,210,110,'+(.7+.25*Math.sin(t*9)).toFixed(2)+')')}});
  Lt.push({x:216-cx,y:306-cy,r:54,i:.6,c:'255,200,110',a:.13})}
 // bandera de popa: ondea con el viento y cuelga cuando el barco se detiene
 {const px=88,py=312;Dr.push({y:py+3,f:()=>{
  fr(px-2,py-1,5,3,'#2a1a0c');fr(px-1,py-48,2,48,'#3a2512');fr(px-1,py-48,1,47,'#6e4a26');disc(g,px,py-49,2,'#c9a54a');
  const col=TRV.stg()>=4||broken()?['#4a2a5a','#7a5a92']:['#a01c30','#e8e0c8'];
  for(let i=0;i<20;i++){const amp=(.4+i*.2)*(.25+.75*sp),w=Math.sin(t*(3+sp*4)-i*.5)*amp,drop=(1-sp)*i*.55,h=9-i*.22;
   const y=py-46+w+drop;fr(px+1+i,y,1,Math.max(3,h),col[0]);fr(px+1+i,y+h/2-1,1,2,col[1])}}})}
 // bauprés con figurón de proa
 if(!(TIP[0]<cx-120||TIP[0]>cx+GW+120)){Dr.push({y:TIP[1]+14,f:()=>{
  const a=[800,318],b=[890,296];
  pline(g,a[0],a[1]-2,b[0],b[1]-2,'#2a1a0c',5);pline(g,a[0],a[1]-3,b[0],b[1]-3,'#8a6238',2);
  for(const k of[820,846,872])fr(k,a[1]-2-(k-a[0])*(a[1]-b[1])/(b[0]-a[0]),3,3,'#c9a54a');
  // foque: vela triangular en el bauprés
  if(!broken()){const sg=3+Math.sin(t*1.7)*1.5+sp*5;g.save();g.beginPath();g.moveTo(828,314);g.quadraticCurveTo(826+sg*.4,296,838,276);g.quadraticCurveTo(866+sg,282,886,298);g.lineTo(828,314);g.closePath();
   const jg=g.createLinearGradient(828,0,886,0);jg.addColorStop(0,'#cfc3a4');jg.addColorStop(.6,'#f6efd8');jg.addColorStop(1,'#d8cdb0');g.fillStyle=jg;g.fill();
   g.strokeStyle='rgba(60,40,20,.4)';g.lineWidth=1;g.beginPath();g.moveTo(832,310);g.quadraticCurveTo(852+sg*.5,296,870,292);g.stroke();g.beginPath();g.moveTo(830,300);g.quadraticCurveTo(848+sg*.5,290,858,288);g.stroke();g.restore()}
  // estayes: de la punta del bauprés a los palos
  if(!broken()){sag(b[0],b[1]-2,744,236,8+Math.sin(t*1.6)*2,'#241810',.78);sag(744,236,616,212,6,'#241810',.6);sag(616,212,392,196,6,'#241810',.55)}
  // figurón bajo el bauprés
  const fy=TIP[1]+9+Math.sin(t*1.25)*.8;g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(TIP[0]-4,fy+8,8,3,0,0,TAU);g.fill();
  fr(TIP[0]-9,fy-3,10,7,'#c9a54a');fr(TIP[0]-9,fy-3,10,2,'#ffe08a');fr(TIP[0]-11,fy-1,3,4,'#e8c870');disc(g,TIP[0]-4,fy,3,'#e8c870');fr(TIP[0]-5,fy-1,1,1,'#2a1a0c');fr(TIP[0]-3,fy-1,1,1,'#2a1a0c');fr(TIP[0]-9,fy+3,12,2,'#7a5430')}})}
}

// ---------- ganchos (se enganchan tras los de travesia_mar.js) ----------
let hooked=false;
function hook(){if(hooked)return;hooked=true;
 const g0=window.GROUND;window.GROUND=function(){if(g0)g0.apply(this,arguments);if(here())try{ground()}catch(e){console.error('BARCO',e)}};
 const n0=window.netDrawPlayers;window.netDrawPlayers=function(Dr,Lt,cx,cy){if(n0)n0.apply(this,arguments);if(here())try{dr(Dr,Lt,cx,cy)}catch(e){console.error('BARCO',e)}}}
{const u=update;update=function(dt){u(dt);if(here())hook()}}
window.BARCO={H,T,B,TIP};
})();
