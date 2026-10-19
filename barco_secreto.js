// ===== SALAS SECRETAS DE LA GAVIOTA (v8.36): camarote del capitán, bodega y sala de cañones =====
// Cadena: camarote (llave + 1.ª pista) → escotilla de cubierta → bodega (2.ª pista + mamparo falso con palanca) → sala de cañones (puzzle de mechas) → Brújula del Capitán.
// Solo se puede entrar mientras el barco está entero (antes del Kraken). Cargar el ÚLTIMO de todos los scripts: las regiones nuevas van al final de RG para no mover los índices de las partidas guardadas.
(function(){
if(typeof RG==='undefined'||typeof TH==='undefined'||!TH.barco)return;
const TAU=6.283185,here=id=>!!(rg&&rg.id===id);
const SECRET=new Set(['camarote','bodega','canones']);
const inRoom=()=>!!(rg&&SECRET.has(rg.id)&&W);
const broken=()=>!!(S&&S.rv&&S.rv['trav:roto']);

// ---------- temas ----------
const mkTh=(k,o)=>{TH[k]=Object.assign({},TH.barco,{k},o)};
mkTh('camarote',{fl:['#7a5430','#6a4828','#865f38'],mo:'#2a1a0c',hi:'#b08a54',wf:['#4a2f18','#3a2512','#5a3a1e'],wt:'#120804',wh:'#2a1a0c',ac:'#ffc46a',amb:[30,16,6,.34],fog:'210,150,90',pt:'dust',bg:'#0a0502'});
mkTh('bodega',{fl:['#4a3a2a','#3e3022','#54422e'],mo:'#1a1008',hi:'#8a6a44',wf:['#3a2a1a','#2e2014','#44321e'],wt:'#0a1620',wh:'#1e3a4a',ac:'#9ad0e0',amb:[6,10,14,.5],fog:'90,120,130',pt:'dust',bg:'#04070a'});
mkTh('canones',{fl:['#5e4026','#523620','#6a4a2c'],mo:'#1e120a',hi:'#a07a48',wf:['#3e2a18','#32200f','#4a3420'],wt:'#120804',wh:'#2a1a0c',ac:'#ff9a4a',amb:[26,12,6,.42],fog:'200,120,70',pt:'dust',bg:'#080402'});

// ---------- notas (pistas del puzzle y lore) ----------
Object.assign(NOTES,{
 cam1:['Diario del capitán','«Día 41. El timonel ya no duerme y yo ya no cuento los días. Dejé la llave de la bodega en el cofre. Si alguien baja, que no encienda nada sin leer antes mis notas sobre los cañones.»'],
 cam2:['Carta de navegación','Un rumbo trazado hasta el borde de la carta, donde no hay nada. Al pie, en tinta roja: «Fuego a mi orden: primero el ámbar, luego el azul. El resto lo dejé abajo, con la carga.»'],
 bod1:['Hoja de ruta de la bodega','Ocho hamacas colgadas. Ocho vacías desde el primer día. Las otras cuatro ya no se mecen.'],
 bod2:['Nota clavada al mamparo','«...después el verde, y el rojo al final, como el sol cuando se apaga. Si te equivocas, los cañones despiertan a los que duermen debajo.»'],
 can1:['Cañón sin nombre','Las mechas están frías. La tripulación que no respetó el orden sigue de guardia.'],
 can2:['Libro de fuego','Cuatro mechas, cuatro colores. «Ámbar, azul, verde, rojo» está escrito tantas veces que el papel se ha roto por los dobleces.'],
 can3:['Brújula del capitán','Una brújula cuya aguja no apunta al norte sino hacia abajo. En la tapa: «La guardé para el que baje».']});

// ---------- reliquia nueva: Brújula del Capitán (más resistencia) ----------
RELS.brujula=['Brújula del Capitán','Recuperas resistencia mucho más rápido: +3 por segundo.'];
RELSRC.brujula='Secreta en la Gaviota';

// ---------- mapas ----------
const FURN={camarote:[],bodega:[],canones:[]},CANS={camarote:[],bodega:[],canones:[]};
const furn=(r,t,x,y,w,h)=>{FURN[r].push({t,tx:x,ty:y,w:w||1,h:h||1})};
COL.furn=COL.furn||[0,3,16,16];COL.cannon=COL.cannon||[2,3,14,16];

RG.push({id:'camarote',n:'Camarote del Capitán',act:'La Gaviota · compartimento secreto',th:'camarote',cols:30,rows:22,m:1.5,dm:1.25,fl:[''],build(W){
 W.fillO('wall');
 W.room(4,5,22,12,'f');W.room(12,17,6,3,'f');
 W.portal('barco',14,19,{to:'barco',at:'camarote',k:'Salir a cubierta',sx:0,sy:-26});
 W.fire(23,7);
 // mobiliario
 W.o('furn',5,5,3,2);furn('camarote','bed',5,5,3,2);
 W.o('furn',11,5,4,1);furn('camarote','desk',11,5,4,1);
 W.o('furn',16,5,4,1);furn('camarote','shelf',16,5,4,1);
 W.o('furn',8,5,2,1);furn('camarote','shelf',8,5,2,1);
 W.o('furn',8,10,2,2);furn('camarote','maptable',8,10,2,2);
 W.o('furn',23,13,1,1);furn('camarote','chest',23,13,1,1);
 W.o('barrel',5,15,1,1);W.o('barrel',6,15,1,1);W.o('crate',24,15,1,1);W.o('crate',25,15,1,1);
 W.note(12,7,'cam1');W.note(8,13,'cam2');
 W.item(22,14,{q:'llavebodega',k:'Tomar la llave de la bodega'});W.item(18,15,{sou:300});W.item(7,8,{n:1});
 W.en('hollow',20,12);
 W.torch(7,4);W.torch(15,4);W.torch(21,4);W.torch(25,4)}});

RG.push({id:'bodega',n:'Bodega de la Gaviota',act:'La Gaviota · compartimento secreto',th:'bodega',cols:40,rows:26,m:1.6,dm:1.3,fl:[''],build(W){
 W.fillO('wall');
 W.room(3,3,12,8,'f');W.room(15,5,10,3,'f');W.room(25,3,12,15,'f');
 W.room(29,18,4,1,'f');W.room(27,19,8,4,'f');
 W.portal('barco',5,3,{to:'barco',at:'bodega',k:'Subir a cubierta',sx:0,sy:24});
 W.fire(11,7);
 // carga apilada
 for(const[x,y]of[[13,4],[14,4],[14,5],[3,9],[4,9],[13,9],[14,9],[8,9],[9,9]])W.o('crate',x,y,1,1);
 for(const[x,y]of[[3,5],[3,6],[8,4],[14,8]])W.o('barrel',x,y,1,1);
 for(const x of[27,28,29,31,32,33,34])W.o('crate',x,6,1,1);
 for(const x of[25,26,27,30,31,32,33])W.o('crate',x,10,1,1);
 for(const x of[27,28,29,30,32,33,34,35])W.o('crate',x,13,1,1);
 for(const[x,y]of[[26,15],[36,8],[36,12],[25,4],[36,16]])W.o('barrel',x,y,1,1);
 W.o('furn',3,7,2,1);furn('bodega','sacks',3,7,2,1);W.o('furn',33,16,2,1);furn('bodega','sacks',33,16,2,1);
 W.note(8,5,'bod1');W.note(34,4,'bod2');
 W.item(26,16,{sou:400});W.item(36,4,{n:2});W.item(31,20,{sou:600});W.item(5,5,{n:1});
 W.lever(35,16,'b1',{k:'Apartar la estantería',m:'Algo cede tras las cajas'});
 W.sgate(29,18,4,1,['b1'],{msg:'El mamparo falso se abre'});
 W.portal('canones',30,22,{to:'canones',at:'bodega',k:'Bajar a la sala de cañones',sx:0,sy:-26});
 W.en('hollow',9,8);W.en('hollow',30,8);W.en('hollow',28,11);W.en('archer',35,9);W.en('soldier',31,15);
 W.torch(8,2);W.torch(12,2);W.torch(28,2);W.torch(34,2)}});

RG.push({id:'canones',n:'Sala de Cañones',act:'La Gaviota · compartimento secreto',th:'canones',cols:50,rows:22,m:1.7,dm:1.35,fl:[''],build(W){
 W.fillO('wall');
 W.room(3,4,38,10,'f');W.room(4,14,3,2,'f');W.room(41,7,1,3,'f');W.room(42,5,7,7,'f');
 W.portal('bodega',5,15,{to:'bodega',at:'canones',k:'Subir a la bodega',sx:0,sy:-26});
 W.fire(7,12);
 for(const x of[7,11,15,19,23,27,31,35]){W.o('cannon',x,4,1,1);CANS.canones.push([x,4,-1])}
 for(const x of[9,13,17,21,25,29,33,37]){W.o('cannon',x,13,1,1);CANS.canones.push([x,13,1])}
 for(const[x,y]of[[39,4],[40,4],[39,13],[40,13]])W.o('barrel',x,y,1,1);
 for(const[x,y]of[[3,4],[3,13],[40,5]]){W.o('furn',x,y,1,1);furn('canones','rack',x,y,1,1)}
 W.note(8,8,'can1');W.note(38,8,'can2');
 // mechas: ámbar(2) azul(0) verde(3) rojo(1) → orden de las pistas
 W.puzzle('canones_a',[[12,6,0],[20,11,1],[28,6,2],[36,11,3]],[2,0,3,1],[41,7,1,3]);
 // cámara del tesoro
 W.o('furn',47,5,1,1);furn('canones','chest',47,5,1,1);
 W.item(45,8,{rel:'brujula',k:'Tomar la brújula'});W.item(47,7,{sou:900});W.item(47,10,{n:3});
 W.note(44,6,'can3');
 W.en('soldier',14,8);W.en('hollow',18,6);W.en('archer',24,9);W.en('soldier',30,7);W.en('hollow',33,10);
 for(const x of[5,13,21,29,37])W.torch(x,3);W.torch(44,4);W.torch(47,4)}});

Object.assign(REGINFO,{
 camarote:['El camarote del capitán, detrás de la puerta de tablones de la cubierta','Secreto: busca la llave de la bodega','Hay un cofre, una carta de navegación y un diario','Hoguera: la estufa del capitán','Solo se puede entrar antes del Kraken'],
 bodega:['La bodega bajo la cubierta, llena de carga sin destino','Secreto: abre el mamparo falso con la palanca','Una pista del orden de los cañones está clavada al mamparo','Hoguera junto a la escalera','Solo se puede entrar antes del Kraken'],
 canones:['La sala de cañones, con cuatro mechas de colores','Secreto: enciende las mechas en el orden del capitán','Tras la puerta espera la Brújula del Capitán (reliquia)','Hoguera junto a la escalera','Solo se puede entrar antes del Kraken']});

// ---------- puertas en la cubierta ----------
{const r=RG.find(q=>q.id==='barco');if(r){const b=r.build;r.build=function(W){b.call(this,W);
 W.portal('camarote',26,22,{to:'camarote',at:'barco',k:'Entrar al camarote',sx:0,sy:36,cond:()=>!broken(),lock:'La puerta del camarote está destrozada.'});
 W.portal('bodega',29,16,{to:'bodega',at:'barco',k:'Bajar a la bodega',sx:0,sy:30,cond:()=>!broken()&&!!S.rv['barco:llavebodega'],lock:'La escotilla está cerrada con candado.'})}}}

// ---------- la llave ----------
{const p0=pickIt;pickIt=function(it,key){
 if(it&&it.q==='llavebodega'){S.tk[key]=1;S.rv['barco:llavebodega']=1;sfx(520,.25,'sine',.06,880);spark(it.x,it.y,'#ffe66d',14);toast('Llave de la bodega · la escotilla de cubierta ya se abre');save();return}
 return p0(it,key)}}

// ---------- arte ----------
const ART={
 bed:(x,y)=>{fr(x,y+3,48,29,'#2a1a0c');fr(x+1,y+4,46,27,'#4a2f18');fr(x+1,y+4,46,2,'#8a6238');fr(x+4,y+8,40,21,'#e6dcc2');fr(x+6,y+10,14,9,'#fbf4dc');fr(x+22,y+10,22,19,'#7a2030');fr(x+22,y+10,22,2,'#b04058');for(let i=0;i<4;i++)fr(x+24+i*5,y+13,1,14,'rgba(0,0,0,.18)');fr(x,y,4,32,'#33200f');fr(x+44,y+3,4,29,'#33200f')},
 desk:(x,y,f)=>{const w=f.w*16;fr(x,y+4,w,16,'#33200f');fr(x,y+2,w,14,'#6e4a26');fr(x,y+2,w,2,'#a07a48');fr(x+2,y+16,3,6,'#1a0e06');fr(x+w-5,y+16,3,6,'#1a0e06');
  fr(x+6,y+5,12,8,'#e8dfc6');fr(x+8,y+7,8,1,'#7a6a4a');fr(x+8,y+9,6,1,'#7a6a4a');pline(g,x+22,y+12,x+28,y+4,'#f2ead2',1);fr(x+32,y+4,12,9,'#d8c89a');fr(x+33,y+6,10,1,'#8a6a3a');
  fr(x+w-14,y+5,4,7,'#f2ead2');fr(x+w-14,y+3,4,2,'#ffd27a');glow(x+w-12,y+3,16,'255,200,110',.25+.06*Math.sin(TM*9))},
 shelf:(x,y,f)=>{const w=f.w*16;fr(x,y,w,20,'#1a0e06');fr(x,y,w,2,'#6e4a26');const C=['#7a2030','#2a4a6a','#4a6a30','#8a6a2a','#5a3a6a'];
  for(let r=0;r<2;r++){const yy=y+3+r*9;fr(x+1,yy+8,w-2,1,'#6e4a26');let bx=x+2;for(let i=0;bx<x+w-3;i++){const bw=2+((i*7+r*3)%3),bh=6+((i*5+r)%3);fr(bx,yy+8-bh,bw,bh,C[(i+r*2)%5]);fr(bx,yy+8-bh,bw,1,'rgba(255,255,255,.2)');bx+=bw+1}}},
 maptable:(x,y)=>{fr(x,y+3,32,29,'#33200f');fr(x,y+2,32,26,'#5e4026');fr(x+2,y+4,28,21,'#e0d2a4');fr(x+2,y+4,28,1,'#f2e8c0');
  for(let i=0;i<9;i++)fr(x+5+i*3,y+17-Math.round(Math.sin(i*.8)*5),2,2,'#a02a2a');fr(x+22,y+8,5,5,'#8a6a3a');fr(x+24,y+7,1,7,'#2a1a0c');fr(x+21,y+10,7,1,'#2a1a0c')},
 chest:(x,y)=>{fr(x+1,y+5,14,10,'#4a2f18');fr(x+1,y+3,14,5,'#6e4a26');fr(x+1,y+3,14,1,'#a07a48');fr(x+1,y+8,14,1,'#c9a54a');fr(x+7,y+7,3,4,'#c9a54a');fr(x+1,y+14,14,1,'#1a0e06')},
 sacks:(x,y)=>{for(const[dx,dy,r]of[[6,10,6],[17,11,6],[11,5,5],[24,10,5]]){g.fillStyle='#8a7048';g.beginPath();g.ellipse(x+dx,y+dy,r,r*.75,0,0,TAU);g.fill();g.fillStyle='#b89a6a';g.beginPath();g.ellipse(x+dx,y+dy-1,r-1,r*.6,0,0,TAU);g.fill();fr(x+dx-1,y+dy-r*.7|0,3,2,'#6a5436')}},
 rack:(x,y)=>{fr(x+1,y+6,14,9,'#33200f');fr(x+1,y+6,14,1,'#6e4a26');for(const[dx,dy]of[[4,8],[8,8],[12,8],[6,12],[10,12]]){disc(g,x+dx,y+dy,2,'#1d1d24');fr(x+dx-1,y+dy-1,1,1,'#7a7a88')}}};
function cannon(tx,ty,dir){const x=tx*16+8,y=ty*16+9;
 g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(x,y+4,9,3.5,0,0,TAU);g.fill();
 fr(x-6,y-3,12,8,'#4a2f18');fr(x-6,y-3,12,1,'#7a5430');fr(x-6,y+4,12,1,'#2a1a0c');fr(x-8,y-2,2,6,'#241810');fr(x+6,y-2,2,6,'#241810');
 if(dir<0){fr(x-2,y-15,5,16,'#1d1d24');fr(x-2,y-15,1,16,'#4c4c5a');fr(x+2,y-15,1,16,'#0d0d12');fr(x-3,y-16,7,2,'#2c2c36');fr(x-3,y-8,7,1,'#c9a54a')}
 else{fr(x-2,y-2,5,16,'#1d1d24');fr(x-2,y-2,1,16,'#4c4c5a');fr(x+2,y-2,1,16,'#0d0d12');fr(x-3,y+12,7,2,'#2c2c36');fr(x-3,y+5,7,1,'#c9a54a')}}

function ground(){
 const id=rg.id,t=TM;
 if(id==='camarote'){ // alfombra con greca dorada
  fr(10*16,8*16,10*16,6*16,'#5a1a26');fr(10*16+3,8*16+3,10*16-6,6*16-6,'#7a2434');fr(10*16+6,8*16+6,10*16-12,6*16-12,'#5a1a26');
  for(let x=10*16+8;x<20*16-8;x+=8){fr(x,8*16+4,4,1,'#c9a54a');fr(x,14*16-5,4,1,'#c9a54a')}
  fr(15*16-6,11*16-6,12,12,'#c9a54a');fr(15*16-4,11*16-4,8,8,'#7a2434')}
 else if(id==='bodega'){ // charcos de sentina y paja
  g.fillStyle='rgba(20,40,52,.55)';for(const[x,y,rx,ry]of[[18*16,6*16,22,7],[9*16,5*16,16,5],[30*16,9*16,20,6],[31*16,20*16,24,8]]){g.beginPath();g.ellipse(x,y,rx,ry,0,0,TAU);g.fill();g.fillStyle='rgba(150,200,220,'+(.12+.05*Math.sin(t*2+x)).toFixed(2)+')';g.beginPath();g.ellipse(x-3,y-1,rx*.6,ry*.5,0,0,TAU);g.fill();g.fillStyle='rgba(20,40,52,.55)'}
  for(let i=0;i<40;i++){const x=(4+(i*53%34))*16+(i*7%16),y=(3+(i*31%15))*16+(i*5%16);if(x>13*16&&x<25*16&&(y<5*16||y>8*16))continue;fr(x,y,5,1,'rgba(190,160,90,.4)')}}
 else if(id==='canones'){ // pasillo central con franja y manchas de pólvora
  fr(3*16,8*16,38*16,2*16,'rgba(110,30,30,.28)');fr(3*16,8*16,38*16,1,'rgba(201,165,74,.5)');fr(3*16,10*16-1,38*16,1,'rgba(201,165,74,.5)');
  g.fillStyle='rgba(10,8,8,.45)';for(let i=0;i<14;i++){g.beginPath();g.ellipse((6+i*2.6)*16,(5+(i*7%8))*16,10,4,0,0,TAU);g.fill()}
  for(const[x,y]of[[6,9],[38,9]]){g.strokeStyle='rgba(201,165,74,.5)';g.lineWidth=2;g.beginPath();g.ellipse(x*16,y*16,14,14,0,0,TAU);g.stroke()}}}

function dr(Dr,Lt,cx,cy){
 const id=rg.id;
 for(const f of FURN[id]){const x=f.tx*16,y=f.ty*16;if(x<cx-70||x>cx+GW+70||y<cy-40||y>cy+GH+40)continue;Dr.push({y:y+f.h*16-2,f:()=>ART[f.t](x,y,f)})}
 for(const c of CANS[id]){const x=c[0]*16,y=c[1]*16;if(x<cx-20||x>cx+GW+20||y<cy-30||y>cy+GH+30)continue;Dr.push({y:y+(c[2]<0?5:12),f:()=>cannon(c[0],c[1],c[2])})}
 if(id==='camarote')Lt.push({x:12*16+16-cx,y:6*16-cy,r:60,i:.6,c:'255,200,110',a:.12});
 if(id==='canones'){const S4=S.pz&&S.pz.canones_a;if(S4)Lt.push({x:45*16-cx,y:8*16-cy,r:80,i:.8,c:'255,210,120',a:.16})}}

// ---------- escaleras de los portales: escala de madera (y nada en las puertas de cubierta) ----------
{const d0=drawStairs;drawStairs=function(x,y,open){
 if(rg&&rg.id==='barco'&&((x===424&&y===366)||(x===472&&y===270)))return;
 if(inRoom()&&!(rg.id==='bodega'&&x===488&&y===366)){
  fr(x-9,y-24,2,24,'#6e4a26');fr(x+7,y-24,2,24,'#6e4a26');for(let k=0;k<6;k++)fr(x-9,y-22+k*4,18,2,'#a07a48');fr(x-9,y-26,18,2,'#33200f');
  glow(x,y-12,18,'255,200,110',.12);return}
 return d0.apply(this,arguments)}}

// ---------- ganchos de dibujo y efecto de la reliquia ----------
let hooked=false;
function hook(){if(hooked)return;hooked=true;
 const g0=window.GROUND;window.GROUND=function(){if(g0)g0.apply(this,arguments);if(inRoom())try{ground()}catch(e){console.error('SALAS',e)}};
 const n0=window.netDrawPlayers;window.netDrawPlayers=function(Dr,Lt,cx,cy){if(n0)n0.apply(this,arguments);if(inRoom())try{dr(Dr,Lt,cx,cy)}catch(e){console.error('SALAS',e)}}}
{const u=update;update=function(dt){u(dt);if(inRoom())hook();
 if(typeof hasR==='function'&&P&&P.s!=='dead'&&G.mode==='play'&&hasR('brujula'))P.st=Math.min(P.mst,P.st+dt*3)}}
})();
