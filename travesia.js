// ===== LA TRAVESÍA DE LA GAVIOTA (v8.32): misión secundaria en el Puerto de Valdorra =====
// Tomás, el marinero, ofrece subir al barco que volvió vacío la noche de la ceniza. A bordo viajan cuatro señores y un timonel mudo.
// Cada vez que hablas con un señor nuevo, el mar y el cielo se vuelven más raros (la luz cambia, caen cenizas, los pasajeros
// se vuelven translúcidos). Al hablar con el cuarto, el barco se detiene... y aparece el Kraken, que parte la cubierta.
// Hay que vencerlo para volver al muelle. Recompensa: Arpón del Kraken (arma de gran alcance), almas y fragmentos.
// Estado de la misión en S.rv (se guarda y se sincroniza en cooperativo): trav:ok · trav:t:<señor> · trav:roto · trav:done.
// Cargar DESPUÉS de reino.js, valdorra.js y cuerpos.js, ANTES de ruta_rio.js. (La silueta del arma, w_arpon, va en armas_formas.js.)
(function(){
const LORDS=['ramiro','ilaria','baldric','teodoro'];
const stg=()=>LORDS.filter(k=>S.rv['trav:t:'+k]).length;

// ---------- tema: cubierta de madera y mar abierto ----------
const BASE=TH.puerto||TH.puertas;
TH.barco=Object.assign({},BASE,{k:'barco',fl:['#6e4e30','#5e4026','#7a5a38'],mo:'#2a1a0c',hi:'#a8845a',wf:['#6e4e30','#5e4026','#7a5a38'],wt:'#0a2644',wh:'#1e5a88',ac:'#9fd8ff',amb:[8,24,44,.28],fog:'120,170,210',pt:'dust',bg:'#030a14'});
const ENV=[
 {amb:[8,24,44,.28],fog:'120,170,210',pt:'dust'},   // 0 · al zarpar
 {amb:[8,24,40,.40],fog:'110,170,190',pt:'dust'},   // 1
 {amb:[8,30,28,.50],fog:'100,190,150',pt:'ash'},    // 2
 {amb:[14,14,30,.60],fog:'150,120,200',pt:'ash'},   // 3
 {amb:[18,6,28,.68],fog:'170,60,120',pt:'ember'},   // 4 · todos hablaron
 {amb:[26,4,16,.74],fog:'200,40,60',pt:'ember'},    // 5 · el barco roto
 {amb:[10,30,50,.22],fog:'140,190,220',pt:'dust'}]; // 6 · tras vencer al Kraken
const envFor=()=>S.bk.kraken&&S.rv['trav:roto']?6:S.rv['trav:roto']?5:stg();
function envSet(s){
 const e=ENV[Math.min(s,6)],t=TH.barco;t.amb=e.amb;t.fog=e.fog;t.pt=e.pt;
 for(const k of LORDS.concat(['timonel']))if(KITS[k])KITS[k].ghost=s>=3&&s<6}

// ---------- notas ----------
Object.assign(NOTES,{
 trav1:['Libro de a bordo','«Zarpamos con la marea. Doce pasajeros en el manifiesto. Si alguien cuenta, que cuente bien: siempre salen cuatro. Los otros ocho ya no firman.»'],
 trav2:['Cuaderno de bitácora','Las páginas están en blanco, salvo la última, con una sola frase repetida hasta el borde: «No miren hacia abajo».'],
 trav3:['Faro apagado','Un farolillo de cubierta con la mecha seca. Al acercarte huele a cera nueva, como si alguien lo hubiera apagado hace un segundo.']});

// ---------- NPC del barco: texto según cuántos señores llevas escuchados (0-3) ----------
const KB={A:['#6a2a4a','#9a4a72','#3a1428'],hc:['#4a1c34','#7a3454','#2a0e1c'],buckle:'#ffd24a',head:'hair',hair:'#6a5a4a',hairS:'short'};
KITS.ramiro=Object.assign({},KITS.aldeano,KB);
KITS.ilaria=Object.assign({},KITS.aldeano,{A:['#3a3a52','#5a5a7a','#1e1e30'],hc:['#2a2a40','#46466a','#16162a'],buckle:'#c9a54a',head:'hair',hair:'#c8c8d0',hairS:'bun'});
KITS.baldric=Object.assign({},KITS.aldeano,{A:['#6a6a78','#9a9aa8','#3a3a46'],hc:['#505060','#7a7a8a','#2c2c38'],buckle:'#c9a54a',head:'hair',hair:'#5a4a30',hairS:'short'});
KITS.teodoro=Object.assign({},KITS.aldeano,{A:['#2a3a6a','#4a5e9a','#14203e'],hc:['#1e2a50','#3a4a80','#101830'],buckle:'#9ac8ff',head:'hair',hair:'#c0c0c8',hairS:'bald'});
KITS.timonel=Object.assign({},KITS.aldeano,{A:['#3a4a3a','#5a6e5a','#1c281c'],hc:['#2a362a','#44564a','#141e14'],buckle:'#c9a54a',head:'hair',hair:'#3a2a20',hairS:'short'});

const LINES={
 ramiro:["Don Ramiro Valcastro, mercader de sedas, para servirle. Treinta años cruzando este mar con la bodega llena y la cabeza tranquila. Zarpamos de noche, sí, pero con la marea a favor. ¿Ha hablado ya con los demás señores? Es buena gente.",
  "Don Ramiro Valcastro... Disculpe, ya me presenté, ¿verdad? Es que hoy todo huele a sal, y no recuerdo haber abierto ninguna caja. Las sedas pesan más de lo que deberían. Están mojadas, creo. Siempre lo están.",
  "Mis cuentas no cuadran. Doce cajas en el manifiesto, y yo cuento las mismas doce, pero ninguna tiene nombre. ¿A quién le vendí tanta seda? Todos los compradores se quedaron en el muelle, mirando. No saludaron.",
  "Perdone si tiemblo. Acabo de recordar el último precio que pagué: una cuerda, un clavo y un sitio en este barco. Y lo peor es que la marea nunca estuvo a favor. Ya casi no queda tiempo. Por favor... no mire abajo."],
 ilaria:["Doña Ilaria de Marne. Espero a mi esposo, el almirante; dijo que nos alcanzaría en la próxima isla. Siempre llega tarde, pero siempre llega. Siéntese si quiere: he puesto su plato en la mesa, por si acaso.",
  "El plato sigue ahí, ¿lo ve? Lo repongo cada noche. Es curioso: la sopa nunca se enfría y nunca se acaba. Mi esposo decía que el mar no devuelve nada. Qué cosas decía.",
  "Ya no sé cuántas islas hemos pasado. Ninguna tenía puerto. Pregunté al timonel y no se giró. Pregunté a las gaviotas, y no hay gaviotas. ¿Hace cuánto que no oímos una gaviota?",
  "Mi esposo no va a llegar, ¿verdad? Lo sé desde la primera noche. Es que si lo digo en voz alta el barco deja de navegar. ...Perdone. Hable con los que faltan. Yo solo sé que el agua está muy cerca."],
 baldric:["Sir Baldric de Hierrofrío, caballero retirado. Seis campañas, tres heridas y ningún naufragio. Este mar me debe respeto. Si algo osa asomar por la borda, le enseñaré cómo se corta una cosa que no tiene cuello.",
  "Es una espada excelente. Algo oxidada últimamente. Y con algo pegado... ¿coral? No recuerdo haberla bañado en el mar. No importa: la mano aún la sujeta, aunque ya no siento la mano.",
  "Dije que ningún naufragio, ¿verdad? Mentí. Hubo uno. Esa noche subí a un barco como este, y hubo un golpe bajo la quilla, y luego una cosa enorme, y luego este barco. Siempre este barco.",
  "Prepárese, forastero. Cuando termine de hablar con el último, vendrá. Siempre viene. Y yo siempre desenvaino, y siempre... no sé cómo acaba. Esta vez usted tiene una espada que aún no se ha oxidado. Úsela bien."],
 teodoro:["Maese Teodoro, astrónomo. Anoto las estrellas para el atlas del reino. Esta noche el cielo está muy despejado: veinte constelaciones y ni una nube. Qué suerte tenemos.",
  "Algo extraño: las estrellas no se mueven. Llevo dos horas midiendo y la Corona sigue sobre el mismo mástil. O el barco no avanza o el cielo no gira. Prefiero que sea el cielo.",
  "No son estrellas. Lo he comprobado con el catalejo. Son ojos, miles, abiertos y mirando hacia abajo. Y parpadean todos a la vez cuando alguien dice la palabra «tierra».",
  "He escrito el último capítulo del atlas: «Al final del mar hay algo que no es un monstruo, sino un hambre. Se alimenta de barcos que no saben que se han hundido». No se lo cuente a los demás. Ya lo saben. Prepárese."]};
const REP={
 ramiro:["Hable con los demás señores, se lo ruego. Me da menos miedo si todos saben lo mismo que yo.","Ya casi es la hora. Las sedas están heladas."],
 ilaria:["Hable con los demás, forastero. Mi esposo siempre dijo que la compañía acorta el viaje.","Escuche: el agua ha dejado de chocar contra el casco."],
 baldric:["No hay prisa. Aquí el tiempo es una cuerda que no se acaba.","Mantenga la guardia alta. Todo lo que sube del agua viene con ganas."],
 teodoro:["Cuando conozca a los demás, mire el cielo. Yo ya no puedo.","Las estrellas se han girado hacia usted."]};
const NAMES={ramiro:'Don Ramiro Valcastro',ilaria:'Doña Ilaria de Marne',baldric:'Sir Baldric',teodoro:'Maese Teodoro'};
const SIGNS=['El oleaje se calma de golpe.','Las lámparas se inclinan hacia el mismo lado.','Nadie proyecta sombra en la cubierta.','El mar se queda sin ruido.'];
for(const k of LORDS)NPC[k]=()=>{
 const key='trav:t:'+k,first=!S.rv[key],s=stg();
 if(!first)return D(NAMES[k],REP[k][s>=3?1:0]);
 S.rv[key]=1;envSet(s+1);G.shake=Math.max(G.shake||0,2.5);try{sfx(70+s*14,.8,'sawtooth',.05,40)}catch(e){}
 const n=D(NAMES[k],LINES[k][s]);
 n.nx=()=>{toast(SIGNS[s]);if(s===3)setTimeout(krakenEvent,900);return null};
 return n};
NPC.timonel=()=>{const s=stg();
 return D('Timonel',s<1?'(El timonel no se vuelve. Sujeta el timón como si lo hubiera hecho siempre.)':s<3?'(El timón gira solo, un poco hacia un lado y un poco hacia el otro. Las manos del timonel están abiertas.)':'(El timonel mueve los labios sin sonido. Dice la misma palabra una y otra vez. Parece «ahora».)')};

// ---------- región: cubierta de La Gaviota ----------
RG.push({id:'barco',n:'La Gaviota',act:'Una travesía que no figura en ningún registro',th:'barco',cols:56,rows:38,m:1.7,dm:1.3,mini:'kraken',fl:[''],build(W){
 W.fillG('w');
 // --- casco: cubierta principal, popa y proa ---
 W.g('f',9,12,38,15);W.g('f',6,15,3,9);W.g('f',47,14,4,11);W.g('f',51,17,2,5);
 // --- popa: pasarela, hoguera ---
 W.fire(10,21);
 W.portal('puerto',6,19,{to:'puerto',at:'barco',k:'Bajar al muelle',sx:22,sy:0,cond:()=>!S.rv['trav:roto']||!!S.bk.kraken,lock:'No se ve costa por ninguna parte. Antes tendrás que sobrevivir a lo que viene.'});
 W.o('lamp',7,16,1,1);W.o('lamp',7,22,1,1);
 // --- cubierta: carga, faroles, mástiles ---
 W.o('crate',12,12,1,1);W.o('barrel',13,12,1,1);W.o('crate',24,12,1,1);W.o('barrel',36,12,1,1);W.o('crate',45,12,1,1);
 W.o('barrel',16,26,1,1);W.o('crate',26,26,1,1);W.o('barrel',40,26,1,1);
 W.o('lamp',15,13,1,1);W.o('lamp',30,13,1,1);W.o('lamp',15,25,1,1);W.o('lamp',30,25,1,1);W.o('lamp',45,16,1,1);W.o('lamp',45,22,1,1);
 W.o('pillar',24,19,1,1);W.o('pillar',38,19,1,1);
 W.note(13,12,'trav1');W.note(26,26,'trav2');W.note(30,13,'trav3');
 // --- pasajeros (desaparecen cuando se rompe el barco) ---
 const here=()=>!S.rv['trav:roto'];
 W.npc('ramiro',14,16,{when:here});W.npc('ilaria',20,23,{when:here});W.npc('baldric',31,16,{when:here});W.npc('teodoro',41,22,{when:here});W.npc('timonel',49,19,{when:here});
 // --- cubierta rota (tras el golpe del Kraken): agujeros, palo mayor caído y arena del jefe ---
 W.brk=function(){
  this.g('w',18,14,4,3);this.g('w',34,23,4,3);this.g('w',41,13,3,3);this.g('w',11,24,3,3);
  this.clr(24,19,1,1);this.o('rubble',24,19,1,1);
  [[20,20],[30,18],[36,19],[27,22],[14,17]].forEach(([x,y])=>this.o('rubble',x,y,1,1));
  if(!S.bk.kraken&&!this.arena)this.setArena({x:14,y:12,w:34,h:15},[],33,19)};
 G.krk=0;envSet(envFor());
 // si ya hablaste con los cuatro y el golpe no llegó a producirse (muerte, recarga), el barco lo reanuda
 if(stg()>=4&&!S.rv['trav:roto'])setTimeout(()=>{if(rg&&rg.id==='barco')krakenEvent()},2500);
}});
LAY.barco=[8,420];LNK.push(['puerto','barco',1]);
{const ad=Mapa.prototype.applyDyn;Mapa.prototype.applyDyn=function(){ad.call(this);if(this.rg&&this.rg.id==='barco'&&S.rv['trav:roto']&&this.brk)this.brk()}}

// ---------- evento: el Kraken rompe el barco ----------
function krakenEvent(){
 if(!rg||rg.id!=='barco'||S.rv['trav:roto']||G.krk)return;G.krk=1;
 envSet(4);toast('El barco se detiene. Nada se mueve.');G.shake=3;try{sfx(60,1.2,'sawtooth',.08,30)}catch(e){}
 setTimeout(()=>{if(!rg||rg.id!=='barco'){G.krk=0;return}envSet(5);toast('Algo enorme roza la quilla...');G.shake=6;try{sfx(48,1.2,'sawtooth',.1,24)}catch(e){}},1800);
 setTimeout(()=>{
  if(!rg||rg.id!=='barco'){G.krk=0;return}
  S.rv['trav:roto']=1;W.applyDyn();W.bake();G.shake=10;G.flash=.7;try{sfx(90,1,'sawtooth',.12,40)}catch(e){}
  toast('¡La cubierta se parte en dos!');
  if(W.arena&&!S.bk.kraken&&!G.bossOn&&P&&P.s!=='dead')startBoss();
  save()},3800)}

// ---------- jefe: El Kraken ----------
BS.kraken={n:'El Kraken',mini:1,hp:560,w:34,h:30,c:'#3d3070',tr:'#ffd24a',sp:26,so:3500,fr:5,dm:1.3,wl:30,drop:{w:'arpon'},
 ph:[{a:['smash','bsl'],s:1},{a:['smash','cinder','bov'],s:1.25,adds:2,addT:'hollow',msg:'Los ahogados trepan por la borda'},{a:['bov','smash','cinder','bsl','smash'],s:1.5,hold:.25,rocks:1,msg:'El mar entero se levanta'}]};
KITS.kraken=Object.assign({},KITS.caballero,{A:['#3d3070','#6f5cb0','#1f1840'],hc:['#3d3070','#6f5cb0','#1f1840'],eye:'#ffd24a',wp:'none'});
WK.kraken=['none',0];
PRES.kraken=()=>[['El Kraken','(No habla. El agua, sí: sube por los tablones y repite los nombres de los doce pasajeros, uno tras otro, sin prisa.)']];
CUT.kraken=()=>D('La Gaviota','(El agua se calma. El casco, entero otra vez, cruje y se hunde despacio. Los señores ya no están, pero por un momento se oye la voz de Doña Ilaria: «Qué raro. Ya no tengo miedo».)');
BEST.kraken=['El Kraken','Azota con sus tentáculos en abanico y escupe tinta que quema. Con la ira llama a los ahogados y alza el mar contra la cubierta.','No es un monstruo sino un hambre: se alimenta de barcos que no saben que se han hundido. Los pasajeros de La Gaviota lo esperaban cada noche sin recordarlo.','Su azote cubre mucho frente: rodéalo y castiga cuando recoge los tentáculos. Los ahogados caen rápido; no los ignores.'];

// cuerpo propio (dibujado, sin imagen): manto, ojos que miran al jugador y ocho tentáculos que reaccionan a la pose
function drawKraken(x,y,fx,fy,pose,fr_,o){
 o=o||{};const t=(typeof TM!=='undefined'?TM:0),F=!!o.flash,sd=fx<0?-1:1;
 const C=F?{b:'#ffffff',h:'#ffffff',d:'#dcdcea',s:'#ffffff',e:'#ffffff'}:{b:'#3d3070',h:'#6f5cb0',d:'#1f1840',s:'#e0a4c8',e:'#ffd24a'};
 g.save();if(o.al!=null)g.globalAlpha=o.al;g.translate(Math.round(x),Math.round(y-2));if(o.rot)g.rotate(o.rot);
 const bob=Math.sin(t*3)*1.2;
 for(let i=0;i<8;i++){
  const a=(i/7-.5)*2,front=a*sd>.15,bx=a*10,by=-12,wv=Math.sin(t*(pose==='stg'?30:4)+i*1.7);
  let ex=a*34,ey=3+(1-Math.abs(a))*2;
  if(front&&pose==='wind'){ex=a*10+sd*6;ey=-40+wv*2}
  else if(front&&pose==='act'){ex=sd*(36+Math.abs(a)*10);ey=7}
  else if(pose==='rec')ey+=3;
  let px=bx,py=by;
  for(let s=1;s<=6;s++){
   const u=s/6,nx=bx+(ex-bx)*u+wv*3*u*(1-u)*2,ny=by+(ey-by)*u-Math.sin(u*Math.PI)*((front&&pose==='wind')?0:7);
   pline(g,px,py,nx,ny,i%2?C.b:C.h,Math.max(1,Math.round(5-u*3.5)));
   if(u>.3&&u<.9&&!F)fr(nx,ny+1,1,1,C.s);
   px=nx;py=ny}}
 disc(g,0,-14+bob,12,C.d);disc(g,0,-26+bob,14,C.b);disc(g,-4,-31+bob,8,C.h);
 if(!F){fr(-9,-24+bob,2,2,C.d);fr(8,-27+bob,2,2,C.d);fr(2,-33+bob,2,1,C.d)}
 for(const e of[-6,6]){disc(g,e,-20+bob,3,'#fff');if(!F){disc(g,e+Math.round(fx*1.3),-20+bob+Math.round(fy*1.1),2,C.e);fr(e+Math.round(fx*1.6),-21+bob+Math.round(fy*1.1),1,2,'#000')}}
 g.restore();g.globalAlpha=1}
{const b0=body;body=function(id,x,y,fx,fy,pose,fr_,o){if(id!=='kraken')return b0.apply(this,arguments);drawKraken(x,y,fx,fy,pose,fr_,o)}}

// ---------- arma: Arpón del Kraken ----------
WP.arpon={n:'Arpón del Kraken',d:'Alcance enorme y golpes lentos: mantiene a raya a todo lo que se acerca.',wl:30,l:{d:12,c:11,r:46,t:.38,a:[.12,.24]},h:{d:30,c:26,r:56,t:.86,a:[.34,.5]},
 lore:['Un arpón de hierro negro, con la cuerda aún enrollada al mango. La punta tiene dos garfios y ninguna herrumbre.','Los garfios retienen un resto de tinta morada que no se seca. Si lo acercas a la nariz huele a mar de noche.','Dentro del asta, grabados uno por uno, doce nombres. Los once primeros están tachados. El último dice solo: «Todavía».']};
// misión completada: se registra una vez, el mar vuelve a calmarse
{const b0=bossDown;bossDown=function(e){const r=b0.apply(this,arguments);
 if(e&&e.id==='kraken'&&!S.rv['trav:done']){S.rv['trav:done']=1;doneQ();S.frag+=2;envSet(6);toast('Misión completada: La travesía de la Gaviota')}
 return r}}

// ---------- puerto: Tomás ofrece la misión y el muelle del oeste lleva al barco ----------
{const r=RG.find(q=>q.id==='puerto');if(r){const b=r.build;r.build=function(W){b.call(this,W);
 W.portals.push({id:'barco',tx:15,ty:10,x:15*16+8,y:10*16+8,sx:0,sy:20,to:'barco',at:'puerto',k:'Subir a La Gaviota',
  cond:()=>!!S.rv['trav:ok']&&!S.rv['trav:done'],
  get lock(){return S.rv['trav:done']?'La Gaviota ya no está amarrada.':'El barco aún no está listo. Habla con Tomás, el marinero.'}})}}}
{const m0=NPC.marinero;NPC.marinero=()=>{
 if(S.rv['trav:done'])return D('Tomás, marinero','Amarré la Gaviota tantas noches que ya no sé qué hacer con las manos. Gracias por dejarla descansar. Nadie más lo sabrá, pero yo sí.');
 if(S.rv['trav:ok'])return D('Tomás, marinero','La Gaviota te espera al final del muelle del oeste. Sube cuando quieras. Y si oyes que el agua te llama por tu nombre, no contestes.');
 const n=m0();let l=n;while(l.nx&&typeof l.nx!=='function')l=l.nx;
 l.nx=D('Tomás, marinero','Hay algo más. El barco que volvió vacío tira de sus amarras desde esta noche, como si alguien quisiera zarpar. Dentro hay voces: señores, gente de buena familia, hablando como si nada. Yo no subo. Tú tienes pinta de poder oír lo que yo no quiero.',
  [['Subiré a bordo',()=>{S.rv['trav:ok']=1;toast('Misión secundaria: La travesía de la Gaviota');return D('Tomás, marinero','El muelle del oeste, al fondo. Habla con todos los señores antes de que se haga tarde. Y no mires hacia abajo.')}],['Ahora no']]);
 return n}}

Object.assign(REGINFO,{barco:['Un barco que volvió vacío y que zarpa solo','Misión secundaria: habla con los cuatro señores','El mar cambia con cada conversación','Hoguera en la popa','Jefe: El Kraken (Arpón del Kraken)']});
})();
