// ===== ALDEA DEL VADO (v8.49): mapa nuevo entre la Calzada del Éxodo y el Bosque Marchito =====
// Misión larga "Los nombres del vado" (Sabina): campana (a1) abre la Capilla -> 4 páginas del registro -> Sabina libera el cabrestante del pozo (a2)
// v8.49: el portón del Recaudador ya no se puede rodear (vestíbulo cerrado hasta la arena); el sello solo aparece tras vencerlo; el mapa del reino ya no pisa el Desfiladero.
// -> se alza el portón -> mini-jefe El Recaudador (abre el paso al Bosque) -> llevar su sello a Sabina.
// Progreso: S.rv['vado:acepta'|'vp1'..'vp4'|'abierto'|'vsello'|'fin'], palancas S.lv['aldea:a1'|'aldea:a2'].
(function(){
const V=k=>S.rv['vado:'+k],Vs=k=>{S.rv['vado:'+k]=1},np=()=>[1,2,3,4].filter(i=>V('vp'+i)).length;
Object.assign(NOTES,{
 vado0:['Poste del vado','«Aldea del Vado. Aquí se cobraba en nombres: quien no figuraba en el libro, no cruzaba.»'],
 vado1:['Diario de la taberna','«El Recaudador no era cruel. Era puntual. Eso fue lo peor: nunca se saltó un nombre, ni uno solo, ni siquiera el mío.»'],
 vado2:['Saco del granero','Dentro hay grano y, debajo, una hoja doblada con una sola línea repetida: «No consta».'],
 vado3:['Cuerda del pozo','Está atada al cabrestante con un nudo de escriba: solo se deshace sabiendo qué página falta.'],
 vado4:['Mostrador del vado','Un sello de lacre sin usar y una lista tachada. La última tachadura es reciente.']});
Object.assign(REGINFO,{aldea:['Aldea con registro perdido','Mini-jefe: El Recaudador','Misión: Los nombres del vado · campana, 4 páginas, cabrestante y sello','Hoguera en la plaza y antes de la arena','Camino al Bosque Marchito']});
if(typeof KITS!=='undefined'&&KITS.aldeano){KITS.sabina=Object.assign({},KITS.aldeano,{A:['#3a3a5a','#5a5a84','#22223a'],hc:['#cfcfc8','#f0f0e8','#8a8a84'],buckle:'#e6d9a0'})}
BS.recaudador={n:'El Recaudador',mini:1,hp:360,w:18,h:34,c:'#4a3a3a',tr:'#e6c26a',sp:34,so:1700,fr:3,dm:1.25,wl:24,
 ph:[{a:['bsl','bstab'],s:1},{a:['bov','bstab','bsl'],s:1.3,adds:2,addT:'soldier',msg:'Llama a los cobradores'},{a:['bov','bsl','bstab'],s:1.55,hold:.3,msg:'Ya no recuerda a quién cobraba'}]};
if(typeof KITS!=='undefined'&&KITS.caballero)KITS.recaudador=Object.assign({},KITS.caballero,{A:['#3a2e2e','#6a5050','#201818'],hc:['#5a4a44','#8a7468','#2a2220'],eye:'#e6c26a',plume:'#8a6a2a',cape:'#201818',capeE:'#6a5050',buckle:'#e6c26a',chains:0});
if(typeof WK!=='undefined'&&WK.caballero)WK.recaudador=WK.caballero;
PRES.recaudador=()=>[['El Recaudador',V('abierto')?'Traes las páginas, lo sé. Pero el libro dice que nadie cruza sin figurar, y tú no figuras.':'Nombre. Fecha. Motivo del cruce. ¿No constas? Entonces no cruzas.']];
CUT.recaudador=()=>D('El Recaudador','(Suelta el sello.) Cobré todos los nombres y nunca pregunté adónde iban. Pasa… y escríbete tú mismo, si alguien te deja pluma.');
BEST.recaudador=['El Recaudador','Tajos y estocadas rápidas. Llama a cobradores a media pelea.','Guardián del vado. Cobraba el cruce en nombres; cuando el libro se perdió, siguió cobrando de memoria.','Es más ágil que Daren: esquiva hacia los lados y castiga el bloqueo mantenido.'];
NPC.sabina=()=>{
 if(V('fin'))return D('Sabina','Los nombres están otra vez escritos. Ahora, por fin, alguien puede leerlos.');
 if(V('vsello'))return D('Sabina, escriba','(Toma el sello con las dos manos.) Con esto la lista vuelve a valer. Toma: es lo único que cobramos sin pesar nada.',null,()=>{Vs('fin');S.souls+=1500;toast('Misión completa · +1500 almas');save()});
 if(V('abierto'))return D('Sabina','El cabrestante del pozo abre el portón del vado. Vence al Recaudador y tráeme su sello.');
 if(V('acepta')&&np()>=4)return D('Sabina, escriba','(Une las cuatro páginas.) Es el libro del peaje: cobraba en nombres. Tiene sellado el vado con un portón. Ya liberé el cabrestante del pozo: muévelo.',null,()=>{Vs('abierto');toast('El cabrestante del pozo ya se puede mover');save()});
 if(V('acepta'))return D('Sabina','Llevas '+np()+' de 4 páginas: molino, taberna, granero y capilla. La capilla está cerrada: tira de la campana de la torre.');
 return D('Sabina, escriba','Soy la última que lleva el registro del vado. Cuatro páginas del libro se perdieron: molino, taberna, granero y capilla. Sin ellas nadie puede probar que cruzó. ¿Las traerás?',[['Las traeré',()=>{Vs('acepta');toast('Misión: Los nombres del vado');save();return D('Sabina','La capilla está sellada: la campana de la torre, al norte, abre el cerrojo.')}],['Ahora no',null]])};
{const p0=pickIt;pickIt=function(it,key){if(it.q&&/^v(p\d|sello)$/.test(it.q)){S.tk[key]=1;Vs(it.q);sfx(520,.25,'sine',.06,880);spark(it.x,it.y,'#ffe66d',14);toast(it.q==='vsello'?'Sello del Recaudador · llévaselo a Sabina':'Página recuperada ('+np()+'/4)');save();return}return p0(it,key)}}
{const p0=pull;pull=function(l){if(rg.id==='aldea'&&l.id==='a2'&&!S.lv['aldea:a2']&&!V('abierto')){toast('El cabrestante está trabado: habla con Sabina');sfx(90,.2,'square',.04,70);return}p0(l)}}

RG.push({id:'aldea',n:'Aldea del Vado',act:'Acto II — La verdad del reino',th:'valle',cols:96,rows:56,m:1.55,dm:1.2,mini:'recaudador',out:1,fl:['',' · Plaza',' · Antes del Recaudador'],build(W){
 W.fillG('g');W.ring('wall',2);
 W.path([[4,28],[76,28]],3,'p');W.path([[40,22],[56,34]],3,'p');
 W.portal('calzada',4,28,{to:'calzada',at:'aldea',k:'Volver a la Calzada del Éxodo',sx:22,sy:0});
 W.fire(7,31);W.o('cross',9,25,1,1);W.note(9,25,'vado0');
 W.o('barr',12,27,1,1);W.o('barr',12,29,1,1);
 // plaza
 W.fire(48,31);W.npc('sabina',44,25);W.house(36,18,6,4,2);W.house(54,18,6,4,3);
 W.o('crate',42,31,1,1);W.o('barrel',54,31,1,1);W.item(46,33,{sou:250});W.item(52,25,{n:1});
 // molino (NO): página 1
 chamber(W,10,6,10,7,'f');W.clr(14,13,2,1);W.g('f',14,13,2,1);W.path([[15,14],[15,27]],3,'p');
 W.o('barrel',11,7,1,1);W.o('crate',18,7,1,1);W.item(15,9,{q:'vp1',k:'Recoger la página'});
 W.en('hollow',12,10);W.en('hollow',18,10);W.en('archer',15,7);torches(W,4,11,19,4);
 // taberna quemada (NE): página 2
 chamber(W,66,5,12,8,'f');W.clr(71,13,2,1);W.g('f',71,13,2,1);W.path([[72,14],[72,27]],3,'p');
 W.o('tomb',68,6,1,1);W.note(68,6,'vado1');W.item(72,8,{q:'vp2',k:'Recoger la página'});W.item(76,10,{sou:350});
 W.en('soldier',68,10);W.en('soldier',76,10);W.en('brute',72,7);W.en('archer',74,6);torches(W,3,67,77,5);
 // granero (SO): página 3
 chamber(W,12,38,12,8,'f');W.clr(17,36,2,2);W.g('f',17,36,2,2);W.path([[18,29],[18,35]],3,'p');
 W.o('crate',13,39,1,1);W.o('crate',22,39,1,1);W.o('barrel',13,44,1,1);W.o('tomb',22,44,1,1);W.note(22,44,'vado2');
 W.item(18,42,{q:'vp3',k:'Recoger la página'});W.en('brute',15,41);W.en('soldier',21,41);W.en('hollow',15,44);W.en('hollow',21,44);
 // capilla (SE): página 4, cerrada hasta tocar la campana
 chamber(W,66,38,12,8,'f');W.clr(71,36,2,2);W.g('f',71,36,2,2);W.path([[72,29],[72,35]],3,'p');
 W.sgate(71,36,2,2,['a1'],{msg:'El cerrojo de la capilla cede'});W.o('brazier',67,38,1,1);W.o('brazier',76,38,1,1);
 W.item(72,42,{q:'vp4',k:'Recoger la página'});W.item(68,43,{sou:450});
 W.en('hollow',68,41);W.en('hollow',76,41);W.en('hollow',72,44);W.en('warden',72,40,{pat:[[68,41],[76,41]]});
 // campanario (N centro): palanca a1
 chamber(W,41,4,10,6,'f');W.clr(45,10,2,1);W.g('f',45,10,2,1);W.path([[46,11],[46,22]],3,'p');
 W.lever(46,6,'a1',{k:'Tocar la campana',m:'La campana abre el cerrojo de la capilla'});W.o('brazier',42,4,1,1);W.o('brazier',49,4,1,1);
 W.en('archer',43,7);W.en('archer',49,7);W.en('hollow',46,8);
 // pozo (S centro): palanca a2 (hay que hablar antes con Sabina)
 chamber(W,42,38,12,8,'f');W.clr(47,36,2,2);W.g('f',47,36,2,2);W.path([[48,35],[48,34]],3,'p');
 W.lever(48,42,'a2',{k:'Mover el cabrestante',m:'El portón del Recaudador se alza'});W.o('rock',43,39,1,1);W.o('rock',52,39,1,1);W.o('tomb',52,44,1,1);W.note(52,44,'vado3');
 W.en('brute',45,41);W.en('brute',51,41);W.en('archer',44,44);W.en('archer',52,43);W.en('warden',48,40,{pat:[[44,40],[52,40]]});
 // portón + arena del Recaudador (E)
 W.fire(70,31);W.o('wall',73,20,4,7);W.o('wall',73,30,4,5);W.sgate(73,27,2,3,['a2'],{msg:'El portón del vado se alza'});W.torch(73,26);
 chamber(W,78,22,12,12,'f');W.clr(77,27,1,3);W.g('f',77,27,1,3);W.setArena({x:78,y:22,w:12,h:12},[[77,27,1,3]],84,27);
 W.o('brazier',78,22,1,1);W.o('brazier',89,22,1,1);W.o('statue',84,23,1,1);W.o('tomb',87,31,1,1);W.note(87,31,'vado4');
 W.item(84,25,{q:'vsello',k:'Recoger el sello',when:()=>!!S.bk.recaudador});W.item(80,31,{sou:900});
 W.portal('bosque',88,28,{to:'bosque',at:'aldea',k:'Camino al Bosque Marchito',sx:-22,sy:0,cond:()=>!!S.bk.recaudador,lock:'El Recaudador aún guarda el vado'});
 // encuentros en el camino
 W.en('soldier',30,27);W.en('hollow',34,30);W.en('archer',60,26);W.en('hollow',62,30);W.en('brute',66,28);
 W.sc('dtree',60,3,3,90,50,{avoid:'pfwb',seed:121,gap:3});W.sc('rubble',30,3,3,90,50,{avoid:'pfwb',seed:122,gap:1});
 W.sc('rock',16,3,3,90,50,{avoid:'pfwb',seed:123,gap:2});W.sc('crate',8,3,3,90,50,{avoid:'pfwb',seed:124,gap:2});W.sc('cross',6,3,3,90,50,{avoid:'pfwb',seed:125,gap:3});
}});
LAY.aldea=[4,2120]; // capital_mapa.js suma 244 -> y=2364: debajo de la Calzada y sin pisar el Desfiladero (termina en y=2360)
{const i=LNK.findIndex(l=>l[0]==='calzada'&&l[1]==='bosque');if(i>=0)LNK.splice(i,1,['calzada','aldea'],['aldea','bosque']);else LNK.push(['calzada','aldea'],['aldea','bosque'])}
})();
