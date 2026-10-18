// ===== EL CAUCE HUNDIDO (v8.28): región de la ruta alternativa (Remanso del Río → Valle de la Corona) =====
// El río no termina en el Remanso: sigue por galerías bajo la capital. Es el único camino cuando cae el puente.
//   1) Sala de compuertas: un canal con un único puente y dos palancas, una en cada extremo. Ambas abren la reja del este.
//   2) Antesala con hoguera, y detrás la arena del mini-jefe: El Guardacauces. Vencerlo abre la subida a la Cisterna Real.
//   Secreto: un muro falso junto a la entrada esconde una cámara con un frasco.
// Todo procedural, sin arte nuevo. Cargar DESPUÉS de campos.js y castillo*.js, ANTES de ruta_rio.js.
(function(){
TH.cauce=Object.assign({},TH.puertas,{k:'cauce',fl:['#27393a','#2d4344','#223234'],mo:'#101c1d',hi:'#4a7a78',wf:['#3c5a58','#324c4b','#294140'],wt:'#08100f',wh:'#142624',ac:'#6fe0d0',amb:[2,12,12,.62],fog:'90,170,160',pt:'dust',bg:'#020808'});

Object.assign(NOTES,{
 cauce1:['Reja con muescas','Alguien contó los días con un clavo, de a cinco. Llegan a ciento doce. Luego las marcas se vuelven una sola raya larga, hasta el borde.'],
 cauce2:['Libro de compuertas','«Dos palancas, una a cada lado del canal. Si una sola persona las alza, la reja cree que nadie vino. Hace falta cruzar el puente dos veces.»'],
 cauce3:['Canasta de pan mojado','Pan duro envuelto en un trapo con un nombre bordado: «Orrin». El hilo se ha desteñido, pero se lee todavía.'],
 cauce4:['Nicho tapiado','«Los que bajaron al cauce pidieron que el agua se llevara lo que les pesaba. El agua es amable: se lleva todo, hasta el nombre.»'],
 cauce5:['Cadena del barquero','Una cadena atada a un anillo de piedra. Al otro extremo hay un grillete abierto. Nadie lo cerró; nadie lo necesitó.']});

RG.push({id:'cauce',n:'El Cauce Hundido',act:'Lo que corre bajo la capital',th:'cauce',cols:72,rows:36,m:1.9,dm:1.4,mini:'guardacauces',out:1,fl:['',' · antes del Guardacauces'],
 waves:[['hollow','hollow','soldier'],['archer','hollow','brute']],build(W){
 W.fillO('wall');
 // --- salas y pasillos ---
 W.room(3,13,9,11,'f');                       // entrada
 W.path([[12,18],[20,18]],3,'f');
 W.room(20,8,18,20,'f');                      // sala de compuertas
 W.room(22,3,7,5,'f');                        // alcoba norte (palanca 1)
 W.room(31,28,7,5,'f');                       // alcoba sur (palanca 2)
 W.path([[38,18],[46,18]],3,'f');
 W.room(46,11,9,15,'f');                      // antesala
 W.clr(55,17,1,3);W.g('f',55,17,1,3);         // paso a la arena
 W.room(56,9,14,18,'f');                      // arena del Guardacauces
 W.room(4,3,9,6,'f');W.room(7,9,2,4,'f');    // cámara secreta y su pasillo
 // --- agua: un canal parte la sala en dos y solo se cruza por un puente ---
 W.g('w',28,8,3,20);W.g('b',28,17,3,3);
 // --- entrada ---
 W.fire(6,18);
 W.portal('ribera',4,18,{to:'ribera',at:'este',k:'Volver al Remanso del Río',sx:22,sy:0});
 W.o('urn',5,14,1,1);W.note(5,14,'cauce1');W.o('brazier',4,14,1,1);W.o('brazier',10,14,1,1);
 W.item(9,22,{sou:300});
 // --- sala de compuertas: dos palancas, una a cada lado del canal ---
 W.lever(25,5,'q1',{k:'Alzar la compuerta oeste',m:'Compuerta oeste alzada'});
 W.lever(34,30,'q2',{k:'Alzar la compuerta este',m:'Compuerta este alzada'});
 W.sgate(41,17,1,3,['q1','q2'],{msg:'La reja del cauce se levanta'});
 W.o('crate',22,16,1,1);W.note(22,16,'cauce2');W.o('barrel',36,20,1,1);W.note(36,20,'cauce3');
 W.o('brazier',21,9,1,1);W.o('brazier',37,9,1,1);W.o('pillar',24,13,1,1);W.o('pillar',24,22,1,1);W.o('pillar',34,13,1,1);W.o('pillar',34,23,1,1);
 W.en('hollow',23,12);W.en('hollow',24,24);W.en('hollow',25,6);W.en('archer',34,11);W.en('soldier',35,24);W.en('brute',33,21);
 W.item(21,26,{sou:400});W.item(36,10,{n:1});
 // --- antesala: respiro, hoguera y nota ---
 W.fire(50,23);
 W.o('tomb',48,12,1,1);W.note(48,12,'cauce4');W.o('brazier',47,12,1,1);W.o('brazier',53,12,1,1);
 W.en('archer',50,14);W.en('soldier',52,20);W.en('brute',49,18);
 W.item(53,24,{n:2});W.item(47,24,{sou:600});
 // --- arena: la reja se cierra al entrar y se abre al vencerlo ---
 W.setArena({x:56,y:9,w:14,h:18},[[55,17,1,3]],64,18);
 W.o('statue',58,10,1,1);W.o('statue',68,10,1,1);W.o('brazier',58,25,1,1);W.o('brazier',68,25,1,1);
 W.o('urn',68,18,1,1);W.note(68,18,'cauce5');
 W.item(62,24,{sou:900});
 W.portal('cisterna',69,18,{to:'cisterna',at:'cauce',k:'Subir a la Cisterna Real',sx:-22,sy:0,cond:()=>!!S.bk.guardacauces,lock:'El Guardacauces aún vigila la subida'});
 // --- secreto: muro falso junto a la entrada ---
 W.fwall(7,10,2,1,'sec');W.o('brazier',4,3,1,1);W.o('brazier',12,3,1,1);W.item(7,5,{f:1});W.item(10,6,{n:3});W.item(5,7,{sou:500});
 W.sc('rubble',14,3,3,68,32,{avoid:'fbw',seed:61,gap:2});
}});
LAY.cauce=[4,1750];

// ---- mini-jefe: El Guardacauces ----
BS.guardacauces={n:'El Guardacauces',mini:1,hp:360,w:18,h:34,c:'#2a4a48',tr:'#6fe0d0',sp:34,so:1500,fr:3,dm:1.2,wl:24,
 ph:[{a:['bsl','bov'],s:1},{a:['bsl','bov','bstab'],s:1.3,adds:2,addT:'hollow',msg:'El agua trae a los que se llevó'},{a:['bov','bstab','bsl'],s:1.5,hold:.3,msg:'Ya no distingue quién sube de quién baja'}]};
if(typeof KITS!=='undefined'&&KITS.caballero)KITS.guardacauces=Object.assign({},KITS.caballero,{A:['#2e4a48','#4a7a76','#162826'],hc:['#2a4442','#4a7470','#122220'],eye:'#6fe0d0',plume:'#3a8a84',cape:'#162826',capeE:'#4a7a76',buckle:'#6fe0d0',chains:0});
if(typeof WK!=='undefined'&&WK.caballero)WK.guardacauces=WK.caballero;
PRES.guardacauces=()=>[['El Guardacauces','Nadie sube por aquí. Es lo único que me dijeron, y lo he repetido hasta que el agua lo aprendió. ¿Vienes del río? Entonces ya sabes lo que cuesta volver.']];
CUT.guardacauces=()=>D('El Guardacauces','(Suelta la llave de la reja.) Sube, forastero. Antes subía gente; ahora solo baja el agua. Quizá lo que dejaste atrás también te esperaba arriba.');
BEST.guardacauces=['El Guardacauces','Tajos amplios y embestidas. Cuando se enfurece llama a los Huecos que el cauce se llevó.','Guardia de las compuertas bajo la capital. Recibió la orden de que nadie subiera por el cauce y la cumplió incluso cuando ya no había quien intentara subir.','Sus embestidas cubren mucho terreno: esquiva de lado y castiga cuando termina. Los Huecos que invoca caen rápido; no los ignores.'];
Object.assign(REGINFO,{cauce:['Galerías bajo la capital','Mini-jefe: El Guardacauces','Un canal, un puente y dos palancas · muro falso con frasco junto a la entrada','Hoguera en la entrada y antes de la arena','Salida a la Cisterna Real (sin vuelta a los Campos)']});
})();
