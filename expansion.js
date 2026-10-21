// ===== EXPANSIÓN v8.50: lugares de pura exploración + misiones sin combate =====
// Carga AL FINAL (después de menus_pixel.js): así los índices de región de las partidas guardadas no cambian.
//
// MAPAS NUEVOS (ninguno tiene enemigos):
//   Colmenar del Camino      -> sale de la Aldea del Vado (camino al sur). Misión "Miel para el camino" (Ibón).
//   Gruta de los Cristales   -> sale del Colmenar (cueva del sureste). Puzzle de las tres lámparas -> bóveda.
//   Mirador de los Desertores-> sale del Paso del Cuervo (corredor al norte del patio). Misión "Cartas sin dirección" (Lope).
//
// MISIONES:
//   Miel para el camino    : 3 panales (soto del Colmenar, capilla caída, Gruta) -> volver con Ibón.
//   Las tres lámparas      : 3 palancas escondidas en la Gruta abren la bóveda (sin PNJ).
//   Cartas sin dirección   : Lope da 3 cartas -> Sabina (Aldea), Tobías (Paso del Cuervo), Soledad (Jardín Derruido) -> volver con Lope.
// Progreso: S.rv['ex:miel'|'ex:panal1..3'|'ex:mfin'|'ex:cartas'|'ex:c1..c3'|'ex:cfin'], palancas S.lv['gruta:g1'..'g3'].
(function(){
const R=k=>S.rv['ex:'+k],Rs=k=>{S.rv['ex:'+k]=1};
const np=()=>[1,2,3].filter(i=>R('panal'+i)).length;
const nd=()=>['c1','c2','c3'].filter(k=>R(k)).length;

// ---------- notas / lápidas ----------
Object.assign(NOTES,{
 colmenar0:['Cartel torcido','«Colmenar del Camino. Quien pase, que no corra: las abejas no olvidan, y ya es mucho decir en este reino.»'],
 colmenar1:['Lápida del apicultor','Aquí descansa quien enseñó a las abejas a volver a casa. Ellas siguen viniendo; él no recuerda por qué.'],
 colmenar2:['Cuaderno de Ibón','«Día 41: la colmena del roble está vacía. Día 42: no está vacía, está callada. Es distinto.»'],
 colmenar3:['Banco junto al estanque','Alguien talló dos nombres en la madera y raspó uno. El otro sigue ahí, pequeño, aguantando.'],
 gruta0:['Inscripción de la entrada','«La cueva no guarda nada. Solo devuelve lo que se le dice, un poco más lento.»'],
 gruta1:['Cristal que susurra','Si lo escuchas bien, repite tu nombre. No el que llevas: el otro.'],
 gruta2:['Marcas de los mineros','Tres lámparas para abrir, una sola persona para cerrar. Los mineros nunca se pusieron de acuerdo en quién.'],
 gruta3:['Dedicatoria de la bóveda','Dejaron esto para quien tuviera paciencia. No es un tesoro: es la prueba de que alguien esperó.'],
 mirador0:['Cartel del sendero','«Mirador de los Desertores. Aquí no se juzga a nadie: desde aquí se ve todo lo que se dejó atrás.»'],
 mirador1:['Espada sin nombre','Una espada hincada, el filo hacia el cielo. Nadie la reclamó; tampoco nadie se atrevió a quitarla.'],
 mirador2:['Espada con un lazo','Un lazo rojo atado a la empuñadura. Se ha desteñido hasta quedar casi blanco, como una promesa que se estira.'],
 mirador3:['Espada partida','La hoja está rota por la mitad y las dos partes siguen juntas, clavadas con cuidado una al lado de la otra.'],
 mirador4:['Telescopio roto','Apunta a las Puertas de la Capital. Alguien lo giró para no verlas y lo dejó así; la lente está empañada por dentro.'],
 mirador5:['Banco del vigía','Desde aquí se ve el abismo y, detrás, la Capital. En el respaldo alguien grabó: «Mirar también es quedarse».']
});
Object.assign(REGINFO,{
 colmenar:['Prado de colmenas, sin enemigos','Misión: Miel para el camino · Ibón, apicultor','Capilla caída · Soto del noreste','Entrada a la Gruta de los Cristales'],
 gruta:['Cueva luminosa, sin enemigos','Puzzle: tres lámparas escondidas','Bóveda sellada con botín grande','Un panal entre los cristales'],
 mirador:['Mirador sobre el abismo, sin enemigos','Misión: Cartas sin dirección · Lope, cartero','Campo de espadas de los desertores','Corredor desde el Paso del Cuervo']
});

// ---------- sprites de PNJ ----------
if(typeof KITS!=='undefined'&&KITS.aldeano){
 KITS.ibon=Object.assign({},KITS.aldeano,{A:['#7a6a2a','#b09a42','#4a3e16'],hc:['#c8c8c0','#ececE4','#8c8c84'],buckle:'#ffe08a'});
 KITS.lope=Object.assign({},KITS.aldeano,{A:['#2e4a5a','#4e7a92','#1a2e38'],hc:['#3a2a20','#5a4232','#1e140e'],buckle:'#e6d9a0'});
}

// ---------- diálogos ----------
NPC.ibon=()=>{
 if(R('mfin'))return D('Ibón','Las abejas volvieron esta mañana. No sé quién les enseñó el camino, pero huelen a cera nueva. Pasa cuando quieras: el estanque es tuyo.');
 if(R('miel')&&np()>=3)return D('Ibón, apicultor','(Huele los tres panales con los ojos cerrados.) Primavera. Hacía años que no la recordaba. Toma: no es mucho, pero lo que vale se come.',null,()=>{Rs('mfin');S.souls+=1000;S.frag+=3;toast('Misión completa · +1000 almas · +3 fragmentos');sfx(520,.3,'sine',.06,880);save()});
 if(R('miel'))return D('Ibón','Llevas '+np()+' de 3 panales. Uno en el soto del noreste, otro en la capilla caída y el último donde la cueva brilla: las abejas anidan donde hay luz.');
 return D('Ibón, apicultor','Mis abejas se fueron cuando cayó la ceniza y no sé adónde. Quedan tres panales viejos, dormidos, escondidos por el prado. Si me los traes, las colmenas vuelven a oler a casa. ¿Me ayudas?',[
  ['Te ayudaré',()=>{Rs('miel');toast('Misión: Miel para el camino');save();return D('Ibón','Soto del noreste, capilla caída y la cueva del sureste. No los aprietes: están dormidos.')}],
  ['Más tarde',null]]);
};
NPC.lope=()=>{
 if(R('cfin'))return D('Lope','Repartí cartas durante años sin saber a quién iban. Ahora sé que a veces la dirección es una persona.');
 if(R('cartas')&&nd()>=3)return D('Lope, cartero','(Te mira como quien contó cada paso.) ¿Las tres? Entonces te debo la cuarta. No estaba en mi saco: la escribí yo mientras esperaba. Dice «para el que no tiene nombre». Quédatela, y quédate también esto.',null,()=>{Rs('cfin');S.souls+=1500;S.frag+=4;toast('Misión completa · +1500 almas · +4 fragmentos');sfx(520,.3,'sine',.06,880);save()});
 if(R('cartas'))return D('Lope','Entregadas '+nd()+' de 3. Sabina, en la Aldea del Vado; Tobías, en el patio del Paso del Cuervo; y Soledad, en el Jardín Derruido.');
 return D('Lope, cartero','Cartero del reino. Repartía hasta que se borraron las direcciones; me quedaron tres sobres y ningún mapa. Sé a quién van por la letra, no por el nombre. ¿Las llevarías tú?',[
  ['Las llevaré',()=>{Rs('cartas');toast('Misión: Cartas sin dirección');save();return D('Lope','Una para Sabina, la escriba del Vado. Otra para Tobías, el desertor del Paso del Cuervo. La última para Soledad, en el Jardín Derruido. No las abras: la letra duele más cuando uno sabe.')}],
  ['Ahora no',null]]);
};
// entregar cartas: los PNJ existentes responden distinto mientras haya una carta pendiente para ellos
const entrega=(id,key,nom,txt)=>{const o=NPC[id];if(!o)return;
 NPC[id]=()=>{if(R('cartas')&&!R(key))return D(nom,txt,null,()=>{Rs(key);toast('Carta entregada ('+nd()+'/3)');sfx(440,.25,'triangle',.06,660);save()});return o()}};
entrega('sabina','c1','Sabina, escriba','(Lee sin tocar el papel.) Me escribe alguien del otro lado del vado. Dice que cruzó y que nadie lo anotó. Lo anotaré yo, aunque sea al margen.');
entrega('desertor','c2','Tobías','Esa letra… es la de mi hermana. Dice que sigue contando a los que pasan, aunque ya nadie le pida el número. Creo que me perdona.');
entrega('soledad','c3','Soledad','(Sostiene el sobre con las dos manos.) Es del jardinero. Pide que riegue lo que quede aunque parezca muerto. Lo haré. Lo hago desde siempre, pero ahora tiene firma.');

// ---------- objetos de misión (panales) ----------
{const p0=pickIt;pickIt=function(it,key){if(it.q&&/^panal\d$/.test(it.q)){S.tk[key]=1;Rs(it.q);sfx(520,.25,'sine',.06,880);spark(it.x,it.y,'#ffd24a',14);toast('Panal recuperado ('+np()+'/3)'+(np()>=3?' · llévaselo a Ibón':''));save();return}return p0(it,key)}}

// ====================================================================================
// COLMENAR DEL CAMINO  (56x40)  — sin enemigos
// ====================================================================================
RG.push({id:'colmenar',n:'Colmenar del Camino',act:'Un prado donde las abejas esperan',th:'valle',cols:56,rows:40,m:1,dm:1,out:1,day:1,fl:[''],build(W){
 W.fillG('g');W.ring('wall',2);
 // caminos
 W.path([[28,4],[28,22]],3,'p');W.path([[6,22],[50,22]],3,'p');
 W.portal('aldea',28,3,{to:'aldea',at:'colmenar',k:'Volver a la Aldea del Vado',sy:22});
 W.o('pillar',26,3,1,1);W.o('pillar',30,3,1,1);
 W.fire(32,6);W.o('cross',25,6,1,1);W.note(25,6,'colmenar0');
 // estanque noroeste con cañas
 W.g('w',8,6,9,6);W.sc('reed',16,6,5,12,9,{seed:211,gap:1});
 // casa de Ibón y colmenas
 W.house(34,9,7,5,3);W.path([[37,14],[37,22]],3,'p');
 W.npc('ibon',25,18);
 [[31,15],[33,15],[31,17],[33,17],[31,19],[33,19]].forEach(([x,y])=>W.o('crate',x,y,1,1));
 W.o('barrel',24,15,1,1);W.note(24,15,'colmenar2');
 // soto noreste: panal 1
 W.path([[49,21],[49,12]],3,'p');W.room(45,5,8,7,'p');
 W.o('dtree',45,5,1,1);W.o('dtree',52,5,1,1);W.o('dtree',45,11,1,1);W.o('dtree',52,11,1,1);
 W.item(49,7,{q:'panal1',k:'Recoger el panal',when:()=>!!R('miel')});W.item(47,9,{n:1});
 // capilla caída suroeste: panal 2
 chamber(W,7,28,11,7,'f');W.clr(18,30,1,2);W.g('f',18,30,1,2);W.path([[28,23],[28,31],[19,31]],3,'p');
 W.o('tomb',9,29,1,1);W.note(9,29,'colmenar1');W.o('statue',12,28,1,1);W.o('brazier',8,28,1,1);W.o('brazier',16,28,1,1);
 W.item(12,32,{q:'panal2',k:'Recoger el panal',when:()=>!!R('miel')});W.item(15,33,{sou:300});
 // estanque sureste y embarcadero
 W.g('w',38,27,11,8);W.g('b',44,26,2,5);W.sc('reed',14,37,26,12,10,{seed:212,gap:1});
 W.o('urn',43,25,1,1);W.note(43,25,'colmenar3');W.item(44,26,{sou:250});
 // cueva de los cristales (sureste)
 W.path([[51,23],[51,33]],3,'p');W.room(48,34,6,3,'p');
 W.o('rock',47,33,1,1);W.o('rock',53,33,1,1);W.o('brazier',49,35,1,1);W.o('brazier',52,35,1,1);
 W.portal('gruta',51,36,{to:'gruta',at:'colmenar',k:'Entrar en la Gruta de los Cristales',sy:-22});
 // botín suelto
 W.item(10,20,{n:1});W.item(40,19,{sou:200});
 W.sc('tree',45,3,3,50,18,{avoid:'pfwbk',seed:213,gap:3});W.sc('bush',60,3,3,50,34,{avoid:'pwb',seed:214,gap:1});
 W.sc('rock',10,3,3,50,34,{avoid:'pfwbk',seed:215,gap:2});
 W.o('lamp',27,10,1,1);W.o('lamp',29,18,1,1);
}});

// ====================================================================================
// GRUTA DE LOS CRISTALES  (60x40)  — sin enemigos · 3 lámparas -> bóveda
// ====================================================================================
RG.push({id:'gruta',n:'Gruta de los Cristales',act:'Lo que la cueva devuelve',th:'cisterna',cols:60,rows:40,m:1,dm:1,fl:[''],build(W){
 W.fillO('wall');
 // sala de entrada
 W.room(4,26,12,10,'f');W.room(16,30,8,3,'f');
 W.portal('colmenar',5,30,{to:'colmenar',at:'gruta',k:'Salir al Colmenar',sx:22,sy:0});
 W.fire(9,29);W.o('cross',7,34,1,1);W.note(7,34,'gruta0');
 W.o('crystal',12,27,1,1);W.o('mushroom',14,34,1,1);W.o('mushroom',6,27,1,1);
 // caverna central
 W.room(24,16,24,20,'f');W.g('w',30,22,7,6);W.g('w',40,28,5,5);
 [[26,18],[44,18],[27,33],[45,33],[34,19],[39,24],[30,31]].forEach(([x,y])=>W.o('crystal',x,y,1,1));
 [[25,25],[46,25],[38,33],[32,17]].forEach(([x,y])=>W.o('mushroom',x,y,1,1));
 W.o('crystal',35,30,1,1);W.note(35,30,'gruta1');W.item(28,34,{sou:250});
 // rama norte: lámpara 1
 W.room(34,8,3,8,'f');W.room(28,2,16,6,'f');
 W.lever(36,4,'g1',{k:'Encender la primera lámpara',m:'Una lámpara se enciende'});
 W.o('crystal',29,3,1,1);W.o('crystal',42,3,1,1);W.o('mushroom',31,6,1,1);W.item(40,5,{n:1});
 // rama oeste: lámpara 2 + panal 3
 W.room(8,14,3,12,'f');W.room(4,4,14,10,'f');
 W.lever(10,6,'g2',{k:'Encender la segunda lámpara',m:'Una lámpara se enciende'});
 W.o('crystal',5,5,1,1);W.o('crystal',16,5,1,1);W.o('mushroom',15,12,1,1);W.o('crystal',5,12,1,1);
 W.item(6,11,{q:'panal3',k:'Recoger el panal',when:()=>!!R('miel')});W.item(14,8,{sou:300});
 // rama este: lámpara 3
 W.room(48,22,6,3,'f');W.room(53,18,2,4,'f');W.room(50,8,8,10,'f');
 W.lever(54,10,'g3',{k:'Encender la tercera lámpara',m:'Una lámpara se enciende'});
 W.o('crystal',51,9,1,1);W.o('crystal',57,9,1,1);W.o('mushroom',52,16,1,1);W.o('crystal',56,15,1,1);W.note(56,15,'gruta2');
 // bóveda sellada
 W.room(48,30,4,3,'f');W.sgate(52,30,1,3,['g1','g2','g3'],{msg:'La bóveda se abre'});
 W.room(53,28,5,7,'f');
 W.o('brazier',53,28,1,1);W.o('brazier',57,28,1,1);W.o('statue',55,29,1,1);
 W.item(55,32,{sou:1500});W.item(54,34,{n:4});W.o('tomb',57,34,1,1);W.note(57,34,'gruta3');
 torches(W,15,25,46,5);torches(W,25,5,14,5);torches(W,1,29,42,6);torches(W,7,51,56,5);
}});

// ====================================================================================
// MIRADOR DE LOS DESERTORES  (52x36)  — sin enemigos
// ====================================================================================
RG.push({id:'mirador',n:'Mirador de los Desertores',act:'Desde aquí se ve todo lo que se dejó atrás',th:'puertas',cols:52,rows:36,m:1,dm:1,out:1,fl:[''],build(W){
 W.fillG('g');W.ring('wall',2);
 W.g('k',3,27,46,6);                    // abismo al sur
 W.path([[4,18],[44,18]],3,'p');
 W.portal('desfiladero',3,18,{to:'desfiladero',at:'mirador',k:'Volver al Paso del Cuervo',sx:22,sy:0});
 W.fire(7,16);
 // campo de espadas
 grid(W,'cross',[16,19,22,25,28],[12,24]);W.note(19,12,'mirador1');W.note(25,24,'mirador2');W.note(28,12,'mirador3');
 // mirador del acantilado
 W.path([[10,19],[10,23]],3,'p');W.room(6,23,9,4,'p');
 W.o('lamp',7,23,1,1);W.o('lamp',13,23,1,1);W.o('urn',10,25,1,1);W.note(10,25,'mirador5');W.item(12,25,{sou:350});
 // torre del cartero
 chamber(W,38,6,10,8,'f');W.clr(42,14,2,1);W.g('f',42,14,2,1);W.path([[42,15],[42,18]],3,'p');
 W.npc('lope',42,9);W.o('brazier',38,6,1,1);W.o('brazier',47,6,1,1);
 W.o('urn',39,12,1,1);W.note(39,12,'mirador4');W.item(45,11,{sou:400});W.item(44,7,{n:1});
 // santuario este
 W.path([[44,19],[44,22]],3,'p');W.room(40,22,8,4,'p');
 W.o('statue',44,23,1,1);W.o('brazier',40,22,1,1);W.o('brazier',47,22,1,1);W.item(42,24,{n:2});
 W.sc('dtree',40,3,3,48,24,{avoid:'pfwbk',seed:231,gap:3});W.sc('rock',14,3,3,48,24,{avoid:'pfwbk',seed:232,gap:2});
 W.sc('bush',40,3,3,48,24,{avoid:'pwb',seed:233,gap:1});
}});

// ====================================================================================
// ENGANCHES con mapas existentes
// ====================================================================================
{ // Aldea del Vado: camino al sur hacia el Colmenar
 const A=RG.find(r=>r.id==='aldea');
 if(A){const b=A.build;A.build=function(W){b.call(this,W);
  W.path([[32,29],[32,52]],3,'p');W.o('pillar',30,52,1,1);W.o('pillar',34,52,1,1);
  W.portal('colmenar',32,53,{to:'colmenar',at:'aldea',k:'Camino del Colmenar',sy:-22})}}
}
{ // Paso del Cuervo: corredor al norte del patio de entrada hacia el Mirador
 const D2=RG.find(r=>r.id==='desfiladero');
 if(D2){const b=D2.build;D2.build=function(W){b.call(this,W);
  W.room(8,12,3,10,'f');W.torch(8,11);W.torch(10,11);
  W.o('cross',10,18,1,1);W.note(10,18,'mirador0');
  W.portal('mirador',9,13,{to:'mirador',at:'desfiladero',k:'Subir al Mirador de los Desertores',sy:22})}}
}

// ---------- mapa del reino ----------
LAY.colmenar=[4,2640];LAY.gruta=[260,2640];LAY.mirador=[470,2410];
LNK.push(['aldea','colmenar',1],['colmenar','gruta',1],['desfiladero','mirador',1]);
})();
