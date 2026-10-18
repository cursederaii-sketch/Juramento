// ===== LA CISTERNA REAL (v8.29): segundo tramo de la ruta alternativa (Cauce Hundido → Valle de la Corona) =====
// Un gran depósito inundado bajo el castillo. Dos puzzles en serie, ambos en la misma sala, cuyas puertas dan al corredor este:
//   1) EL CORO DEL AGUA (nuevo, tipo memoria sonora): cuatro gotas cantan en las esquinas. Se escucha una secuencia y hay que repetirla;
//      cada acierto la alarga (3 → 4 → 5 notas). Un fallo la reinicia. Abre la puerta sellada del corredor.
//   2) LAS CUATRO VÁLVULAS (orden por lectura de notas): solo valen en el orden correcto; una de más abajo antes de tiempo reinicia todas.
//      Vacían la cisterna y alzan la reja del corredor.
// Isla central con recompensa, sin jefe (el Guardacauces ya ocupó ese papel). Hoguera de respiro antes de la subida al Valle de la Corona.
// Cargar DESPUÉS de puzzles_v2.js y cauce.js, ANTES de ruta_rio.js.
(function(){
TH.cisterna=Object.assign({},TH.puertas,{k:'cisterna',fl:['#243a44','#2a4450','#1f3138'],mo:'#0e1a20',hi:'#5a8aa0',wf:['#38586a','#2e4a5a','#263e4c'],wt:'#060e12',wh:'#102028',ac:'#8ad0ff',amb:[2,10,16,.6],fog:'110,170,210',pt:'dust',bg:'#02060a'});

Object.assign(NOTES,{
 cist1:['Tabla de desagüe','«Se abren de lo hondo a lo somero. Primero la válvula del sur. Después las del norte, de poniente a naciente. La última, la que vigila el umbral. Si una baja antes de tiempo, la corriente las devuelve todas.»'],
 cist2:['Canto en la piedra','«Cuatro gotas cantan en las esquinas. Escúchalas una vez entera; luego devuélvelas igual. Si te equivocas, el coro se pierde y hay que oírlo otra vez. Cada vez que acierta, el coro se alarga.»'],
 cist3:['Barca varada','Una barca sin remos. En el casco, grabado por una mano temblorosa: «No hay otra orilla. Hay otra profundidad.»'],
 cist4:['Anotación del cisternero','«El agua de la capital baja hasta aquí y se queda. Dicen que lo que se arroja al río vuelve. Aquí abajo se aprende que no vuelve: se guarda.»'],
 cist5:['Hornacina con velas apagadas','Doce velas, once apagadas. La que arde tiene la cera blanca y un nombre cortado a cuchillo: «Mara».']});

RG.push({id:'cisterna',n:'La Cisterna Real',act:'Lo que el agua de la capital guardó',th:'cisterna',cols:64,rows:40,m:1.9,dm:1.4,out:1,fl:['',' · antes de la subida'],
 build(W){
 W.fillO('wall');
 // --- salas y pasillos ---
 W.room(3,16,9,9,'f');                          // entrada
 W.path([[12,20],[18,20]],3,'f');
 W.room(18,8,28,26,'f');                        // gran sala de la cisterna
 W.path([[45,20],[56,20]],3,'f');               // corredor este (dos puertas en serie)
 W.room(56,14,7,13,'f');                        // antesala de la subida
 // --- estanque central, isla y puente norte ---
 W.g('w',24,13,16,16);W.g('f',29,18,6,6);W.g('b',31,13,2,5);
 // --- entrada ---
 W.fire(6,20);
 W.portal('cauce',4,20,{to:'cauce',at:'cisterna',k:'Volver al Cauce Hundido',sx:22,sy:0});
 W.o('urn',5,17,1,1);W.note(5,17,'cist3');W.o('brazier',4,17,1,1);W.o('brazier',10,17,1,1);
 W.item(8,23,{sou:300});
 W.en('soldier',14,20);
 // --- PUZZLE 1: el coro del agua (4 gotas en las esquinas) → puerta sellada del corredor ---
 W.puzzle('cist_coro',[[19,9,0],[44,9,1],[19,32,2],[44,32,3]],[0,1,2,3],[47,19,1,3]);
 {const z=W.pzs[W.pzs.length-1];z.kind='simon';z.seq=[1,3,0,2,1];z.punish=null;z.rd=0;z.inp=[];z.armed=0;z.busy=0}
 W.o('rock',22,9,1,1);W.note(22,9,'cist2');
 // --- PUZZLE 2: cuatro válvulas, en orden (sur · norte-poniente · norte-naciente · entrada) → reja del corredor ---
 W.lever(31,31,'v3',{k:'Abrir la válvula del sur',m:'Válvula del sur abierta'});
 W.lever(24,10,'v1',{k:'Abrir la válvula del poniente',m:'Válvula del poniente abierta'});
 W.lever(39,10,'v4',{k:'Abrir la válvula del naciente',m:'Válvula del naciente abierta'});
 W.lever(19,23,'v2',{k:'Abrir la válvula del umbral',m:'Válvula del umbral abierta'});
 W.sgate(50,19,1,3,['v1','v2','v3','v4'],{msg:'La cisterna se vacía y la reja del corredor se alza'});
 W.o('crate',20,13,1,1);W.note(20,13,'cist1');
 grid(W,'pillar',[21,42],[12,17,25,29]);W.o('brazier',18,8,1,1);W.o('brazier',45,8,1,1);W.o('brazier',18,33,1,1);W.o('brazier',45,33,1,1);
 // --- isla: recompensa por cruzar el puente norte ---
 W.o('tomb',31,20,1,1);W.note(31,20,'cist4');W.item(30,22,{sou:800});W.item(33,22,{n:3});
 // --- enemigos: Huecos en los paseos, arqueros que cruzan el estanque con la mirada ---
 W.en('hollow',22,16);W.en('hollow',42,16);W.en('hollow',22,28);W.en('hollow',42,26);W.en('archer',27,10);W.en('archer',36,32);W.en('brute',31,10);
 W.item(21,31,{sou:300});W.item(43,12,{n:1});
 // --- antesala: respiro y subida al Valle de la Corona ---
 W.fire(59,24);
 W.o('urn',58,15,1,1);W.note(58,15,'cist5');W.o('brazier',57,15,1,1);W.o('brazier',61,15,1,1);
 W.en('archer',60,17);W.en('brute',58,21);W.item(61,25,{n:2});W.item(57,25,{sou:500});
 W.portal('valcor',61,20,{to:'valcor',k:'Subir al Valle de la Corona'});
}});
LAY.cisterna=[300,1750];

// ---- motor del coro (tipo "simon"): 3 rondas de 3, 4 y 5 notas; se escucha entera, se repite, un fallo reinicia ----
{const prev=lightT,TONE=[262,330,392,523],COL=['#ff7a7a','#7ad0ff','#ffe66d','#9aff9a'];
 lightT=function(z,t){
  if(z.kind!=='simon')return prev(z,t);
  if(S.pz[z.id]||z.busy)return;
  const flash=i=>{const q=z.t[i];if(!q)return;spark(q.x,q.y-8,COL[i],14,16);sfx(TONE[i],.38,'sine',.07,TONE[i]*1.01)};
  const alive=()=>W&&W.pzs&&W.pzs.includes(z);
  const play=()=>{if(!alive())return;z.busy=1;z.inp=[];const n=z.rd+3;let k=0;toast('Escucha el coro…');
   const step=()=>{if(!alive()){z.busy=0;return}if(k<n){flash(z.seq[k]);k++;setTimeout(step,720)}else{z.busy=0;z.armed=1;toast('Repite el coro')}};setTimeout(step,500)};
  if(!z.armed){play();return}
  flash(t.i);z.inp.push(t.i);const k=z.inp.length-1;
  if(t.i!==z.seq[k]){z.armed=0;z.rd=0;z.inp=[];toast('El coro se pierde… escúchalo otra vez');sfx(110,.4,'sawtooth',.05,60);return}
  if(z.inp.length===z.rd+3){
   if(z.rd>=2){S.pz[z.id]=1;W.clearT(z.door);toast('El coro calla… y el paso se abre');ach('puzzle');G.shake=3;sfx(120,.7,'sawtooth',.07,60);save()}
   else{z.rd++;z.armed=0;toast('Bien. El coro se alarga…');setTimeout(play,1000)}}}}

// ---- válvulas: solo valen en el orden sur → poniente → naciente → umbral; si no, se reinician todas ----
{const p1=pull;pull=function(l){
 if(rg.id==='cisterna'&&/^v[1-4]$/.test(l.id)&&!S.lv['cisterna:'+l.id]){
  const ORD=['v3','v1','v4','v2'],k=ORD.indexOf(l.id),req=k>0?ORD[k-1]:null;
  if(req&&!S.lv['cisterna:'+req]){ORD.forEach(i=>{S.lv['cisterna:'+i]=0});toast('La corriente devuelve las válvulas a su sitio');G.shake=5;sfx(70,.6,'sawtooth',.07,40);spark(l.x,l.y-8,'#9fd0ff',16,10);save();return}}
 p1(l)}}

Object.assign(REGINFO,{cisterna:['Gran sala inundada bajo el castillo','Dos puzzles en serie: el coro del agua (memoria sonora) y las cuatro válvulas (orden por notas)','Isla central con recompensa · sin jefe','Hoguera en la entrada y antes de la subida','Salida al Valle de la Corona (sin vuelta a los Campos)']});
})();
