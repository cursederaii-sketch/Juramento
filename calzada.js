// ===== CALZADA DEL ÉXODO (v8.40): el camino largo entre Valdora y el Bosque Marchito =====
// Carga DESPUÉS de arrabales.js. Antes, la puerta de la Pastora llevaba directo al Bosque; ahora lleva a esta calzada:
// el camino por el que salieron los desplazados la noche de la ceniza. Un peaje de cadenas cierra el paso al este.
//   CADENAS -> tres palancas repartidas por la calzada abren la barrera del peaje:
//     · Torre de vigía caída (norte)  · Cantera del Peaje (sur)  · Capilla del Éxodo (noreste)
//   OPCIONAL -> Hilario, en el campamento, pide recuperar el amuleto de su hija (está en la capilla).
// Progreso: S.lv['calzada:c1'|'c2'|'c3'], S.rv['calzada:amuleto'|'calzada:amuletoOk'].
(function(){
Object.assign(NOTES,{
 calzada0:['Poste de la calzada','«Calzada del Éxodo. Peaje: una cadena, tres cerraduras. Nadie sale del reino sin que lo cuenten.» Debajo alguien rayó: «Contaron mal».'],
 calzada1:['Carreta quemada','Una cuna, medio colchón y una olla. Se salvó lo que cabía en los brazos, y no era esto.'],
 calzada2:['Diario del vigía','«Me ordenaron mirar al camino y avisar si alguien volvía. Nadie volvió. Entonces empecé a avisar de los que se iban, y me mandaron callar.»'],
 calzada3:['Altar de la capilla','«A los que no saben adónde van, que la calzada les alcance.» Hay velas apagadas, una por cada familia que pasó.'],
 calzada4:['Piedra de la cantera','Los bloques tienen marcas de cantero y debajo, otra marca: tres rayas. Cada raya es una cadena del peaje.'],
 calzada5:['Hoja del peaje','Una lista de nombres con una sola columna rellena: la de «pagó». La de «cruzó» está en blanco.']
});
Object.assign(REGINFO,{
 calzada:['Peaje de tres cadenas','Torre de vigía · Cantera · Capilla (una palanca en cada una)','Campamento con hoguera y Hilario','Salida hacia la Aldea del Vado']
});
if(typeof KITS!=='undefined'&&KITS.aldeano){
 KITS.hilario=Object.assign({},KITS.aldeano,{A:['#5a4a2e','#84703e','#34281a'],hc:['#9a9a92','#c4c4bc','#6a6a64'],buckle:'#e6d9a0'})}

RG.push({id:'calzada',n:'Calzada del Éxodo',act:'Acto II — La verdad del reino',th:'valdora',cols:84,rows:40,m:1.5,dm:1.2,out:1,fl:['',' · Campamento',' · Peaje'],build(W){
 W.th=Object.assign({},W.th,{amb:[44,38,40,.34],fog:'200,160,130',pt:'dust'});
 W.fillG('g');W.ring('wall',2);
 // calzada principal (oeste → este)
 W.path([[4,20],[79,20]],3,'p');
 W.portal('back',4,20,{to:'valdora',at:'exit',k:'Volver a Valdora',sx:22,sy:0});
 W.fire(7,23);
 W.o('cross',9,17,1,1);W.note(9,17,'calzada0');
 W.o('barr',12,19,1,1);W.o('barr',12,21,1,1);   // barricada abierta: deja pasar por el centro
 // ---- campamento de desplazados (centro-oeste) ----
 W.house(15,12,5,4,2);W.path([[17,16],[17,19]],3,'p');
 W.house(24,12,6,4,3);W.path([[27,16],[27,19]],3,'p');
 W.fire(21,24);W.npc('hilario',23,25);
 W.o('crate',18,24,1,1);W.o('barrel',19,26,1,1);W.o('crate',25,22,1,1);W.o('barrel',27,25,1,1);
 W.o('barr',16,23,1,1);W.o('cross',29,26,1,1);W.note(29,26,'calzada1');
 W.item(20,27,{sou:200});W.item(26,27,{n:1});
 W.en('hollow',17,30);W.en('hollow',24,30);W.en('soldier',30,23);
 // ---- torre de vigía caída (norte): palanca 1 ----
 chamber(W,34,4,12,8,'f');W.clr(39,12,2,1);W.g('f',39,12,2,1);W.path([[40,13],[40,18]],3,'p');
 grid(W,'pillar',[36,44],[7,10]);
 W.lever(40,6,'c1',{k:'Alzar la primera cadena',m:'Primera cadena alzada'});
 W.o('crate',35,5,1,1);W.o('barrel',45,5,1,1);W.o('tomb',37,5,1,1);W.note(37,5,'calzada2');
 W.item(44,10,{sou:300});
 W.en('archer',36,6);W.en('archer',44,6);W.en('soldier',40,9);W.en('brute',37,10);
 torches(W,3,36,44,4);
 // ---- cantera del peaje (sur): palanca 2 ----
 chamber(W,40,29,12,7,'f');W.clr(45,27,2,2);W.g('f',45,27,2,2);W.path([[46,22],[46,26]],3,'p');
 W.lever(46,33,'c2',{k:'Alzar la segunda cadena',m:'Segunda cadena alzada'});
 W.o('rock',42,31,1,1);W.o('rock',50,31,1,1);W.o('crate',42,34,1,1);W.o('tomb',49,34,1,1);W.note(49,34,'calzada4');
 W.item(43,32,{n:2});
 W.en('brute',44,31);W.en('brute',48,31);W.en('soldier',42,33);W.en('archer',50,34);W.en('hollow',45,35);
 torches(W,28,41,51,5);
 // ---- capilla del éxodo (noreste): palanca 3 + amuleto ----
 chamber(W,55,4,12,8,'f');W.clr(60,12,2,1);W.g('f',60,12,2,1);W.path([[61,13],[61,18]],3,'p');
 W.o('brazier',56,4,1,1);W.o('brazier',65,4,1,1);
 W.lever(61,6,'c3',{k:'Alzar la tercera cadena',m:'Tercera cadena alzada'});
 W.o('tomb',60,9,1,1);W.note(60,9,'calzada3');
 W.item(64,9,{q:'amuleto',k:'Recoger el amuleto'});W.item(57,9,{sou:350});
 W.en('hollow',57,7);W.en('hollow',65,7);W.en('hollow',57,10);W.en('warden',62,9,{pat:[[58,9],[65,9]]});
 // ---- barrera del peaje (este): se abre con las tres cadenas ----
 W.o('wall',70,2,2,17);W.o('wall',70,22,2,16);
 W.sgate(70,19,2,3,['c1','c2','c3'],{msg:'La barrera del peaje se alza'});
 W.torch(70,18);
 W.room(72,17,9,7,'p');W.portal('aldea',80,20,{to:'aldea',at:'calzada',k:'Seguir a la Aldea del Vado',sx:-22,sy:0});
 W.fire(74,22);
 W.o('crate',73,18,1,1);W.note(73,18,'calzada5');
 // ---- encuentros sueltos a lo largo de la calzada ----
 W.en('soldier',33,22);W.en('hollow',38,17);W.en('archer',52,18);W.en('hollow',54,22);W.en('soldier',58,21);W.en('brute',66,17);W.en('archer',67,23);
 W.amb('cz1',48,18,10,5,[['hollow',49,17],['soldier',57,22],['archer',56,18]],{souls:250});
 W.amb('cz2',62,17,8,6,[['brute',64,22],['soldier',66,18],['hollow',63,17]],{souls:350});
 W.item(52,24,{sou:250});W.item(30,17,{sou:200});W.item(68,21,{f:1});
 W.sc('dtree',46,3,3,66,34,{avoid:'pfwb',seed:101,gap:3});W.sc('rubble',24,3,3,66,34,{avoid:'pfwb',seed:102,gap:1});
 W.sc('rock',16,3,3,66,34,{avoid:'pfwb',seed:103,gap:2});W.sc('crate',8,3,3,66,34,{avoid:'pfwb',seed:104,gap:2});
 W.sc('cross',8,3,3,66,34,{avoid:'pfwb',seed:105,gap:3});
}});

// ---- objetos de misión ----
{const p0=pickIt;pickIt=function(it,key){
 if(it.q==='amuleto'){S.tk[key]=1;S.rv['calzada:amuleto']=1;sfx(520,.25,'sine',.06,880);spark(it.x,it.y,'#ffe66d',14);toast('Amuleto recogido · llévaselo a Hilario, en el campamento');save();return}
 return p0(it,key)}}

// ---- Hilario ----
NPC.hilario=()=>{
 if(S.rv['calzada:amuletoOk'])return D('Hilario','Mi hija lo tendrá otra vez cuando la encuentre. Y la voy a encontrar. Cuando un padre dice eso, todavía no ha dejado de caminar.');
 if(S.rv['calzada:amuleto'])return D('Hilario, desplazado','(Se le quiebra la voz al ver el amuleto.) Es el suyo. Lo perdió en la capilla la noche en que cerraron el peaje. Toma. No es mucho, pero es todo lo que me queda para dar.',null,()=>{S.rv['calzada:amuletoOk']=1;S.souls+=500;S.frag++;toast('+500 almas · +1 fragmento de memoria');save();return null});
 return D('Hilario, desplazado','Salimos de Valdora hace mucho. El peaje nos paró aquí, en esta calzada, y ya no pudimos seguir. Mi hija se adelantó hasta la capilla del noreste para rezar y no volvió con el amuleto de su madre. Si lo ves... Y para abrir la barrera necesitas alzar las tres cadenas: la torre, la cantera y la capilla.',
  [['Lo buscaré',()=>{toast('Hilario espera el amuleto de su hija');return D('Hilario','Que la calzada te sea corta.')}],['Ahora no',null]])};

// ---- Valdora ahora sale a la Calzada (antes iba directo al Bosque) ----
{const V=RG.find(r=>r.id==='valdora');if(V)V.nx='calzada'}
// ---- el Bosque tiene una vuelta a la Calzada junto a la de los Campos ----
{const B=RG.find(r=>r.id==='bosque');if(B){const b=B.build;B.build=function(W){b.call(this,W);
 W.portal('aldea',4,43,{to:'aldea',at:'bosque',k:'Volver a la Aldea del Vado',sx:22,sy:0})}}}

// ---- mapa del reino ----
LAY.calzada=[4,1924]; // capital_mapa.js (se carga después) suma 244 a todo lo que está por debajo de y=534 -> queda en y=2168
{const i=LNK.findIndex(l=>l[0]==='valdora'&&l[1]==='bosque');if(i>=0)LNK.splice(i,1,['valdora','calzada'],['calzada','bosque']);else LNK.push(['valdora','calzada'],['calzada','bosque'])}
})();
