// ===== PASO DEL CUERVO (v8.40): el desfiladero entre el Bosque Marchito y las Puertas de la Capital =====
// Carga DESPUÉS de calzada.js. Antes, la salida del Bosque llevaba directo a las Puertas; ahora cruza este paso fortificado:
//   LLAVE DEL CUERVO -> está en la cámara sur de la Garganta (guardada) y abre el Portón del Cuervo.
//   DOS CABRESTANTES -> uno en la cámara norte de la Garganta y otro en la cámara este, al otro lado del puente.
//                      Con los dos accionados se alza la reja que da a las Puertas.
//   OPCIONAL         -> Tobías, el desertor del patio de entrada, da pistas sobre el Caballero de las Puertas.
// Progreso: S.keys.cuervo, S.dl (portón), S.lv['desfiladero:w1'|'desfiladero:w2'].
(function(){
KEYN.cuervo='Llave del Cuervo';
Object.assign(NOTES,{
 desfiladero0:['Cartel del paso','«Paso del Cuervo. Un solo camino, una sola reja. Quien llega hasta aquí viene a la Capital o huye de ella; el cuervo no pregunta.»'],
 desfiladero1:['Brasero apagado','Las cenizas son frescas. Alguien estuvo hace poco y no quiso que se notara la luz desde las Puertas.'],
 desfiladero2:['Estandarte rasgado','Un cuervo negro sobre campo gris. Rasgado de arriba abajo, como si alguien hubiera querido dejar de pertenecer a él.'],
 desfiladero3:['Libro del paso','«Hoy pasaron cuatro. Ayer, ninguno. El caballero de las Puertas pidió que se contaran. No pidió que se les siguiera.»'],
 desfiladero4:['Tumba con espada','Una espada hincada y sin nombre. A los pies, cinco monedas del peaje de la calzada: alguien pagó para llegar solo hasta aquí.'],
 desfiladero5:['Mural descolorido','Pintado a toda prisa: un caballero en una puerta, una reina de espaldas, y entre los dos, una línea que nadie terminó de borrar.']
});
Object.assign(REGINFO,{
 desfiladero:['Desfiladero fortificado con una gran Garganta central','Llave del Cuervo · Portón · Puente sobre el abismo','Dos cabrestantes abren la reja final','Tobías, desertor · Salida hacia las Puertas de la Capital']
});
if(typeof KITS!=='undefined'&&KITS.aldeano){
 KITS.desertor=Object.assign({},KITS.aldeano,{A:['#3a3a44','#585866','#1e1e26'],hc:['#2a2a30','#44444c','#16161a'],buckle:'#c8c8d0'})}

RG.push({id:'desfiladero',n:'Paso del Cuervo',act:'Acto II — La verdad del reino',th:'puertas',cols:90,rows:48,m:1.9,dm:1.35,out:1,fl:['',' · Garganta',' · Reja final'],build(W){
 W.fillO('wall');
 // ---- patio de entrada y corredor ----
 W.room(3,22,12,9,'f');W.room(15,24,14,5,'f');
 W.portal('back',4,26,{to:'bosque',at:'exit',k:'Volver al Bosque Marchito',sx:22,sy:0});
 W.fire(8,27);
 W.npc('desertor',11,24);
 W.o('cross',5,23,1,1);W.note(5,23,'desfiladero0');
 W.o('crate',12,29,1,1);W.o('barrel',13,22,1,1);
 grid(W,'pillar',[19,24],[25,27]);
 W.en('soldier',18,26);W.en('archer',24,28);W.en('hollow',21,26);
 W.item(7,29,{n:1});
 // ---- la Garganta: gran sala central con un abismo en medio ----
 W.room(29,12,22,26,'f');
 W.g('k',37,21,6,9);
 grid(W,'pillar',[32,47],[15,20,30,34]);
 W.fire(31,24);
 W.o('brazier',31,14,1,1);W.o('brazier',48,14,1,1);W.o('tomb',47,24,1,1);W.note(47,24,'desfiladero4');
 W.en('soldier',33,16);W.en('hollow',45,17);W.en('archer',44,32);W.en('brute',34,28);W.en('hollow',40,34);W.en('soldier',41,16);
 W.amb('dz1',30,13,10,5,[['hollow',31,15],['archer',38,13],['soldier',36,17]],{souls:300});
 W.amb('dz2',42,30,8,6,[['brute',44,33],['hollow',48,31],['archer',46,36]],{souls:350});
 W.item(48,35,{sou:350});W.item(31,35,{n:2});
 // cámara norte: cabrestante 1
 W.room(34,4,12,7,'f');W.room(38,11,4,1,'f');
 W.lever(40,6,'w1',{k:'Girar el primer cabrestante',m:'Primer cabrestante girado'});
 W.o('statue',35,5,1,1);W.o('statue',44,5,1,1);W.o('brazier',37,5,1,1);W.o('brazier',42,5,1,1);
 W.o('crate',44,9,1,1);W.note(44,9,'desfiladero3');
 W.en('brute',37,8);W.en('archer',43,8);W.en('hollow',40,9);
 // cámara sur: llave del Cuervo
 W.room(34,39,12,6,'f');W.room(38,38,4,1,'f');
 W.item(40,42,{key:'cuervo'});
 W.o('barrel',35,40,1,1);W.o('crate',44,40,1,1);W.o('urn',36,43,1,1);W.o('urn',43,43,1,1);
 W.en('brute',36,41);W.en('brute',44,41);W.en('archer',40,40);
 W.amb('dz3',34,39,12,6,[['soldier',38,43],['hollow',42,43]],{souls:300});
 // ---- Portón del Cuervo y el puente ----
 W.room(51,25,9,3,'f');
 W.ldoor(60,25,2,3,'cuervo','El Portón del Cuervo está cerrado. Necesitas la Llave del Cuervo');
 W.room(62,17,15,17,'f');
 W.g('k',67,17,4,17);W.g('b',67,24,4,3);
 W.o('statue',63,18,1,1);W.o('statue',63,32,1,1);W.o('brazier',65,24,1,1);W.o('brazier',65,28,1,1);
 W.en('hollow',64,20);W.en('soldier',64,30);W.en('archer',65,26);W.en('brute',73,22);W.en('archer',74,30);W.en('soldier',72,26);W.en('hollow',75,19);
 W.amb('dz4',71,18,6,15,[['brute',73,28],['hollow',75,22],['archer',72,19]],{souls:450});
 W.o('cross',76,31,1,1);W.note(76,31,'desfiladero2');W.item(75,32,{sou:400});
 // cámara este: cabrestante 2
 W.room(66,5,12,8,'f');W.room(72,13,3,4,'f');
 W.lever(71,8,'w2',{k:'Girar el segundo cabrestante',m:'Segundo cabrestante girado'});
 W.o('pillar',68,7,1,1);W.o('pillar',76,7,1,1);W.o('pillar',68,10,1,1);W.o('pillar',76,10,1,1);W.o('brazier',70,5,1,1);W.o('brazier',74,5,1,1);
 W.o('tomb',69,11,1,1);W.note(69,11,'desfiladero1');
 W.en('brute',68,9);W.en('hollow',75,9);W.en('archer',70,10);W.en('warden',72,11,{pat:[[68,11],[76,11]]});
 W.item(76,6,{n:3});
 // ---- reja final y salida ----
 W.room(77,25,3,3,'f');
 W.sgate(77,25,2,3,['w1','w2'],{msg:'La reja final se alza'});
 W.room(79,20,9,13,'f');
 W.fire(81,28);
 W.portal('puertas',86,26,{to:'puertas',k:'Seguir a las Puertas de la Capital',sx:-22,sy:0});
 W.o('statue',86,21,1,1);W.o('statue',86,31,1,1);W.o('barr',83,22,1,1);W.note(83,22,'desfiladero5');
 W.item(82,30,{f:1});
 torches(W,21,5,13,4);torches(W,11,31,48,4);torches(W,16,64,76,4);torches(W,19,80,86,3);torches(W,23,16,28,4);torches(W,24,52,58,3);
 W.sc('rubble',20,3,3,84,42,{avoid:'k',seed:111,gap:2});W.sc('rock',10,3,3,84,42,{avoid:'k',seed:112,gap:3});
}});

// ---- Tobías, el desertor ----
NPC.desertor=()=>{
 const o=[];
 o.push(['¿Qué sabes del caballero?',()=>D('Tobías','Guarda las Puertas desde antes de la ceniza. No es cruel; es peor: es obediente. Si peleas con él, no esperes a que se canse: esquiva el golpe pesado y castiga cuando se recupera.')]);
 o.push(['¿Por qué desertaste?',()=>D('Tobías','Me mandaron contar a los que pasaban y a los que no. Un día dejaron de pedirme el número de los que no. Entendí qué hacían con ellos. Colgué la espada en el primer árbol y bajé aquí.')]);
 o.push(['Nada',null]);
 return D('Tobías, desertor','Si buscas la reja, necesitas la llave del Cuervo —está en la cámara sur de la Garganta— y accionar los dos cabrestantes: uno al norte, otro al este, al otro lado del puente. Yo ya no pasaría. Pero tú sí.',o)};

// ---- el Bosque sale al Paso del Cuervo; las Puertas vuelven a él ----
{const B=RG.find(r=>r.id==='bosque');if(B)B.nx='desfiladero'}
{const P=RG.find(r=>r.id==='puertas');if(P){const b=P.build;P.build=function(W){b.call(this,W);
 const q=W.portals.find(p=>p.id==='back');if(q){q.to='desfiladero';q.at='puertas';q.k='Volver al Paso del Cuervo';q.sx=-22;q.sy=0}}}}

// ---- mapa del reino ----
LAY.desfiladero=[352,1924]; // ídem: queda en y=2168
{const i=LNK.findIndex(l=>l[0]==='bosque'&&l[1]==='puertas');if(i>=0)LNK.splice(i,1,['bosque','desfiladero'],['desfiladero','puertas']);else LNK.push(['bosque','desfiladero'],['desfiladero','puertas'])}
})();
