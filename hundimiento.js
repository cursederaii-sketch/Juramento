// ===== EL KRAKEN, SEGUNDA PARTE (v8.37): más destrucción en la pelea, la Gaviota se hunde y despiertas en la Costa del Naufragio =====
//  · durante el combate cada embestida del Kraken lanza astillas y géiseres, y al bajar su vida (75 %, 50 %, 25 %) se hunde un
//    trozo de cubierta (3×3 baldosas pasan a ser agua), así la arena se va achicando;
//  · al vencerlo y cerrar el diálogo, el barco se hunde (≈7 s: escora, agua que sube, astillas, fundido) y despiertas en un mapa nuevo,
//    como al caer el puente de los Campos del Exilio. La Costa del Naufragio tiene hoguera, un par de ahogados y la salida al muelle.
// Cargar DESPUÉS de barco_secreto.js (la región nueva va al final de RG para no mover los índices de las partidas guardadas).
(function(){
if(typeof RG==='undefined'||!window.TRVMAR||!window.TRV)return;
const M=TRVMAR.M,TAU=6.283185;
const here=()=>!!(rg&&rg.id==='barco'&&W&&W.hullW);
const clp=(v,a,b)=>Math.max(a,Math.min(b,v));
const sfxS=(...a)=>{try{sfx(...a)}catch(e){}};
const rnd=Math.random;

// ---------- efectos (mismas estructuras que usa travesia_mar.js) ----------
function planks(x,y,n,pow){pow=pow||1;for(let i=0;i<n;i++){const a=rnd()*TAU,sp=(30+rnd()*110)*pow;
 M.deb.push({x,y,z:6+rnd()*10,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp*.55,vz:80+rnd()*170*pow,rot:rnd()*TAU,vr:(rnd()-.5)*14,L:4+rnd()*9,c:rnd()<.7?'#6e4a26':'#a07a48',age:0,st:0})}
 while(M.deb.length>110)M.deb.shift()}
const gey=(x,y,d,H)=>M.gey.push({x,y,t:0,d,H});

// ---------- 1) pelea: más destrucción ----------
function chunk(kb){
 const c=[];
 for(let ty=13;ty<=25;ty++)for(let tx=15;tx<=46;tx++){
  const i=W.i(tx,ty);if(W.gd[i]!=='f'||W.on[i])continue;
  const x=tx*16+8,y=ty*16+8;
  if(Math.hypot(x-P.x,y-P.y)<70)continue;
  if(kb&&Math.hypot(x-kb.x,y-kb.y)<64)continue;
  if(E.some(q=>q.s!=='dead'&&!q.b&&Math.hypot(q.x-x,q.y-y)<30))continue;
  c.push([tx,ty])}
 if(!c.length)return;
 const[cx,cy]=c[(rnd()*c.length)|0];
 for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const tx=cx+dx,ty=cy+dy;if(!W.ok(tx,ty))continue;const i=W.i(tx,ty);if(W.gd[i]==='f'&&!W.on[i])W.gd[i]='w'}
 W._wl=null;W.bake();
 const X=cx*16+8,Y=cy*16+8;
 planks(X,Y,42,1.3);gey(X,Y,1.1,120);gey(X-22,Y+8,.9,84);gey(X+22,Y-6,.9,90);
 G.shake=Math.max(G.shake||0,9);G.flash=Math.max(G.flash||0,.35);M.roll=Math.max(M.roll,2.6);
 sfxS(70,.9,'sawtooth',.11,30);sfxS(130,.4,'square',.05,40);toast('¡Otro trozo de cubierta se hunde!')}
function fightTick(){
 const kb=E.find(q=>q.b&&q.id==='kraken'&&q.s!=='dead');
 if(!kb){return}
 kb._mx=kb._mx||kb.mhp||kb.hp;const r=kb.hp/kb._mx;
 kb._br=kb._br||0;
 const th=[.75,.5,.25];
 while(kb._br<3&&r<=th[kb._br]){kb._br++;chunk(kb)}
 // cada embestida lanza astillas hacia donde golpea y un géiser en la borda
 if(kb.s==='act'){if(!kb._dst){kb._dst=1;
   const x=kb.x+(kb.fx||0)*54,y=kb.y+(kb.fy||0)*34;
   planks(x,y,16,1);gey(x+(rnd()-.5)*40,y+(rnd()-.5)*20,.8,70);G.shake=Math.max(G.shake||0,5)}}
 else kb._dst=0}

// ---------- 2) el hundimiento ----------
const HD={on:0,t:0,tk:0,w:0};const HT=7.2;
function hundir(){
 if(HD.on||!here())return;HD.on=1;HD.t=0;HD.tk=0;HD.w=0;G.mode='puente';
 toast('El casco no aguanta más…');sfxS(50,1.4,'sawtooth',.1,22);G.shake=Math.max(G.shake||0,6)}
function hdTick(dt){
 HD.t+=dt;const t=HD.t;
 G.shake=Math.max(G.shake||0,t<5?2.4+t*.5:1);
 M.roll=Math.max(M.roll,2.2);
 HD.tk-=dt;
 if(HD.tk<=0&&t<5.6){HD.tk=.42-.2*clp(t/5,0,1);
  const x=cam.x+40+rnd()*(GW-80),y=cam.y+GH*(.3+rnd()*.5);
  planks(x,y,7+(t*2|0),.9);gey(x,y,.8,50+rnd()*50);sfxS(60+rnd()*50,.4,'sawtooth',.07,30)}
 if(t>1.4&&!HD.a){HD.a=1;toast('El mar entra por los boquetes');sfxS(40,2,'sawtooth',.1,20)}
 if(t>4.2&&!HD.b){HD.b=1;toast('La Gaviota se va al fondo…');sfxS(34,2.4,'sawtooth',.11,16)}
 if(t>=HT)hdEnd()}
function hdEnd(){
 HD.on=0;HD.a=HD.b=0;
 S.rv['trav:hundido']=1;
 const idx=RG.findIndex(r=>r.id==='naufragio');
 if(idx<0){G.mode='play';return}
 loadRegion(idx,0);
 const k=idx+':0';if(!S.fires.includes(k)){S.fires.push(k);S.bf={r:idx,x:0}}
 P.x=6*16+8;P.y=14*16+8;P.fx=1;P.fy=0;P.ax=1;P.ay=0;
 cam.x=clp(P.x-GW/2,0,W.cols*16-GW);cam.y=clp(P.y-GH/2,0,W.rows*16-GH);W.reveal(P.x,P.y);
 P.hp=Math.max(1,Math.round(P.mhp*.5));P.st=P.mst;G.mode='play';save();
 say(D('La orilla','Sal. Arena fría, tablones astillados y el mar chupando los restos. De La Gaviota solo queda el crujido. No ves a los señores ni al timonel; ni un solo nombre sobre la arena. Y sin embargo, por primera vez en mucho tiempo, hay gaviotas.'))}

// CUT del Kraken: el diálogo final y, al cerrarlo, el hundimiento
CUT.kraken=()=>{const n=D('La Gaviota','(El agua se calma. El casco cruje, se parte y empieza a hundirse despacio. Los señores ya no están, pero por un momento se oye la voz de Doña Ilaria: «Qué raro. Ya no tengo miedo».)');
 n.nx=()=>{hundir();return null};return n};

// ---------- dibujo del hundimiento: escora, agua que sube, fundido ----------
{const d0=draw;draw=function(){
 if(!HD.on||!here())return d0.apply(this,arguments);
 const t=HD.t,e=clp((t-1)/5,0,1),ang=Math.sin(e*Math.PI*.5)*.2*(1+.05*Math.sin(t*6)),sink=e*e*GH*.38;
 g.fillStyle='#030a14';g.fillRect(0,0,GW,GH);
 g.save();g.translate(GW/2,GH/2);g.rotate(ang);g.translate(-GW/2,-GH/2+sink);
 try{d0.apply(this,arguments)}finally{g.restore()}
 // agua que sube desde abajo
 const lv=GH*(1-clp((t-2)/4.4,0,1)*1.05);
 if(lv<GH){const gr=g.createLinearGradient(0,lv,0,GH);gr.addColorStop(0,'rgba(60,130,190,.55)');gr.addColorStop(1,'rgba(4,16,36,.94)');g.fillStyle=gr;g.fillRect(0,lv,GW,GH-lv);
  g.fillStyle='rgba(230,245,255,.55)';for(let x=0;x<GW;x+=6)g.fillRect(x,Math.round(lv+Math.sin(t*5+x*.08)*2),4,1);
  g.fillStyle='rgba(235,248,255,.5)';for(let i=0;i<14;i++){const bx=(i*83+t*20)%GW,by=GH-((t*40+i*37)%(GH-lv+1));if(by>lv)g.fillRect(bx,by,2,2)}}
 const b=Math.round(clp(t/.5,0,1)*20);g.fillStyle='#000';g.fillRect(0,0,GW,b);g.fillRect(0,GH-b,GW,b);
 if(t>HT-1.3){g.fillStyle='rgba(0,0,0,'+clp((t-(HT-1.3))/1.2,0,1).toFixed(2)+')';g.fillRect(0,0,GW,GH)}}}

// ---------- 3) región: Costa del Naufragio ----------
TH.naufragio=Object.assign({},TH.valle||TH.barco,{k:'naufragio',wt:'#0a2644',wh:'#1e5a88',ac:'#9fd8ff',amb:[10,30,50,.18],fog:'160,200,225',pt:'dust',bg:'#030a14'});
Object.assign(NOTES,{
 nauf1:['Tablón de proa','Un trozo del casco con letras blancas medio borradas: «LA GAVIO…». Alguien rascó el resto con una uña y dejó sangre seca de hace años.'],
 nauf2:['Cofre de marinero','Dentro solo hay doce botones de abrigo, ordenados en fila. Cuatro brillan; los otros ocho están verdes de salitre.'],
 nauf3:['Cuaderno empapado','Una sola línea legible: «Si lees esto, el barco por fin descansa. Dile a Tomás que no deje la lámpara encendida».']});
RG.push({id:'naufragio',n:'Costa del Naufragio',act:'Lo que el mar no quiso quedarse',th:'naufragio',cols:44,rows:30,m:1.5,dm:1.25,out:1,fl:[''],build(W){
 W.fillG('w');
 W.g('p',3,9,10,12);W.g('p',13,13,22,4);W.g('g',13,6,22,7);W.g('g',13,17,22,7);W.g('p',35,9,7,12);
 W.fire(8,14);
 W.o('crate',5,11,1,1);W.o('barrel',6,11,1,1);W.o('crate',9,18,1,1);W.o('barrel',4,17,1,1);W.o('rubble',11,12,1,1);W.o('rubble',7,19,1,1);W.o('rubble',10,10,1,1);
 W.o('crate',20,9,1,1);W.o('barrel',27,20,1,1);W.o('rubble',24,15,1,1);W.o('rubble',31,14,1,1);
 W.o('cross',38,11,1,1);W.o('urn',37,18,1,1);
 W.note(5,11,'nauf1');W.note(20,9,'nauf2');W.note(38,11,'nauf3');
 W.item(6,17,{sou:300});W.item(28,8,{sou:500});W.item(25,22,{n:2});W.item(39,19,{sou:700});
 W.en('hollow',19,19);W.en('hollow',27,10);W.en('hollow',33,21);
 W.portal('ribera',40,14,{to:'ribera',at:'naufragio',k:'Seguir la corriente río abajo',sx:-24,sy:0});
 W.sc('tree',12,13,6,22,6,{avoid:'pfwbk',seed:71,gap:2});W.sc('bush',9,13,18,22,6,{avoid:'pwb',seed:72,gap:1});W.sc('rock',7,3,9,36,14,{avoid:'pfwb',seed:73,gap:2})}});
Object.assign(REGINFO,{naufragio:['La orilla donde despiertas tras hundirse La Gaviota','Sin pasajeros ni timonel: solo tú y los restos','Hoguera en la playa','Ahogados que no se resignan','La corriente sigue hacia el Remanso del Río']});
LAY.naufragio=[250,396];LNK.push(['puerto','naufragio',1],['naufragio','ribera',1]);

// al llegar al Remanso del Río desde la costa, apareces en la orilla oeste (igual que tras caer el puente)
{const lr=loadRegion;loadRegion=function(i,fi,at){const r=lr(i,fi,at);
 if(RG[i].id==='ribera'&&at==='naufragio'){P.x=6*16+8;P.y=8*16+8;P.fx=1;P.fy=0;P.ax=1;P.ay=0;cam.x=clp(P.x-GW/2,0,W.cols*16-GW);cam.y=clp(P.y-GH/2,0,W.rows*16-GH);W.reveal(P.x,P.y);
  setTimeout(()=>{if(rg&&rg.id==='ribera')say(D('El río','La corriente te arrastra una vez más y te deja en otro remanso, bajo un cielo gris. Aquí el agua también tiene sus propias reglas.'))},600)}
 return r}}

// el portal de la costa no lleva escalera: un poste con farol
{const d0=drawStairs;drawStairs=function(x,y,open){
 if(rg&&rg.id==='naufragio'){fr(x-1,y-14,3,14,'#5a3a1e');fr(x-5,y-16,11,3,'#8a6238');fr(x-1,y-12,3,3,'#ffd27a');glow(x,y-10,18,'255,200,110',.2+.05*Math.sin(TM*5));return}
 return d0.apply(this,arguments)}}

// ---------- ganchos ----------
{const u=update;update=function(dt){u(dt);
 try{if(HD.on)hdTick(Math.min(dt,.1));else if(here()&&G.mode==='play')fightTick()}catch(e){console.error('HUNDIMIENTO',e);if(HD.on){HD.on=0;G.mode='play'}}}}
})();
