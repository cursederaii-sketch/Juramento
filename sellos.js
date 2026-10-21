// ===== LOS SELLOS DEL OLVIDO (v8.57) =====
// El camino al Caballero y al Trono ya no es una línea recta: el Portón del Olvido de las Puertas
// de la Capital solo cede con 4 de los 6 sellos que guardan los minijefes del reino.
// Cada sello cuenta una parte de la verdad. Sin código nuevo de combate: usa los minijefes que ya existen.
(function(){
const NEED=4;
const SEL=[
 {id:'guardiana',z:'Osario Hundido',n:'Sello de la Custodia',h:'Algo duerme bajo la cripta.',
  t:'La reina Maelis no pidió ser protegida. Pidió que no la olvidaran, y alguien confundió una cosa con la otra.'},
 {id:'heraldo',z:'Foso del Rebaño',n:'Sello de la Voz',h:'Un heraldo calló más allá del bosque.',
  t:'El decreto del olvido lo pronunció una sola boca, pero lo firmaron dos manos. Una de ellas era la tuya.'},
 {id:'madre',z:'Marismas Cenicientas',n:'Sello del Fango',h:'Un pantano oculto al oeste del bosque.',
  t:'Lo que el reino arrojó al pantano no era basura: eran cartas, nombres y pruebas. Todo lo que no quiso recordar.'},
 {id:'capataz',z:'Cantera Hundida',n:'Sello de la Piedra',h:'Una mina sellada al sur de Valdora.',
  t:'La galería sur se selló con gente dentro. Hubo una orden escrita, y nadie quiso ser quien la había dado.'},
 {id:'vigia',z:'Torre del Vigía',n:'Sello de la Luz',h:'Un faro apagado sobre las puertas de la capital.',
  t:'Apagaron el faro con la costa aún llena de barcos. El reino prefirió perder a los que llegaban antes que admitir que abría la puerta.'},
 {id:'recaudador',z:'Aldea del Vado',n:'Sello del Nombre',h:'Un vado donde se cobraba el paso en nombres.',
  t:'Los nombres cobrados en el vado no se perdieron: se archivaron para borrarlos con orden y con sello.'}
];
const by=id=>SEL.find(s=>s.id===id);
const cnt=()=>SEL.filter(s=>S.bk[s.id]).length;
// quien ya venció al Caballero (partidas anteriores a esta versión) no queda encerrado fuera del trono
const ok=()=>cnt()>=NEED||!!S.bk.caballero;
const esc=t=>String(t).replace(/</g,'&lt;');
const coop=()=>typeof NET!=='undefined'&&NET&&NET.on;
const client=()=>coop()&&!NET.host;
const need=()=>Math.max(0,NEED-cnt());

window.SELLOS={NEED,SEL,count:cnt,ok};

// llave "virtual": solo para reutilizar el flujo de puertas cerradas (también en cooperativo)
if(typeof KEYN!=='undefined')KEYN.sellos='Marca de los Sellos';

// --- 1. el Portón del Olvido, antes de la arena del Caballero ---
{const r=RG.find(x=>x.id==='puertas');if(r){const b=r.build;r.build=function(W){b.call(this,W);
  if(!S.bk.caballero){
   W.ldoor(28,21,5,1,'sellos','El Portón del Olvido sigue cerrado');
   W.o('brazier',27,21,1,1);W.o('brazier',33,21,1,1);
  }};}}

// --- 2. las puertas del Trono (acceso desde el Gran Salón) piden lo mismo ---
{const r=RG.find(x=>x.id==='gransalon');if(r){const b=r.build;r.build=function(W){b.call(this,W);
  const q=W.portals.find(p=>p.id==='trono');if(!q)return;const c0=q.cond;
  q.cond=()=>(!c0||c0())&&ok();
  Object.defineProperty(q,'lock',{configurable:true,get:()=>S.bk.mariscal?'Las puertas del trono exigen '+NEED+' sellos del Olvido ('+cnt()+'/'+SEL.length+').':'Las puertas del trono siguen selladas.'});
 };}}

// --- 3. interacción con el portón ---
function gateText(){
 const n=cnt();
 let h='Seis huecos con forma de sello recorren el portón. '+(n?'<b>'+n+'</b> arden con luz propia.':'Ninguno arde todavía.')+' Hacen falta <b>'+NEED+'</b>.<br><br>';
 h+=SEL.map(s=>S.bk[s.id]?'✓ '+esc(s.n)+' <small>('+esc(s.z)+')</small>':'· ??? <small>'+esc(s.h)+'</small>').join('<br>');
 return h}
{const ol=openLd;openLd=function(d){
  if(!d||d.key!=='sellos')return ol.apply(this,arguments);
  if(!ok()){
   if(coop())toast('El portón exige '+NEED+' sellos del Olvido ('+cnt()+'/'+SEL.length+')');
   else say(D('El Portón del Olvido',gateText()));
   return}
  const had=S.keys.sellos;S.keys.sellos=1;
  try{ol.apply(this,arguments)}finally{if(!had)delete S.keys.sellos}
  if(!client()){
   toast('Los sellos arden y el Portón del Olvido cede');
   try{G.shake=4;sfx(90,.8,'sawtooth',.07,50);sfx(520,.6,'sine',.05,880)}catch(e){}
   try{SEL.forEach((s,i)=>{if(S.bk[s.id])spark(d.px+(i-2.5)*10,d.py-6,'#ffe66d',6,14)})}catch(e){}
  }
 }}

// --- 4. cada minijefe entrega su sello y su fragmento de verdad ---
function selNode(id){
 const s=by(id),n=cnt(),first=n===NEED;
 let t='<b>'+esc(s.n)+'</b> · '+n+'/'+SEL.length+'<br>'+esc(s.t);
 if(first)t+='<br><br>Ya tienes los sellos que el Portón del Olvido exige. Está en las Puertas de la Capital, antes de la arena del Caballero.';
 else if(n<NEED)t+='<br><br>El portón de la capital pide '+NEED+'. Aún faltan '+need()+'.';
 else t+='<br><br>Los demás sellos te dirán más del reino, aunque el portón ya te basta.';
 return D('Sello del Olvido',t)}
function tail(n,add){ // añade un nodo al final de una cadena de diálogos (los nodos siguientes pueden ser perezosos)
 const nx=n.nx;
 if(n.o)return n;
 n.nx=nx?()=>{const r=typeof nx==='function'?nx():nx;return r?tail(r,add):add()}:add;
 return n}
SEL.forEach(s=>{const c0=CUT[s.id];
 CUT[s.id]=c0?()=>{const d=c0();return d?tail(d,()=>selNode(s.id)):selNode(s.id)}:()=>selNode(s.id)});

// --- 5. el diario recuerda los sellos ---
{const dm=dMem;dMem=function(){
  const h='<h2>Sellos del Olvido · '+cnt()+'/'+SEL.length+' <small>(el portón pide '+NEED+')</small></h2>'
   +SEL.map(s=>S.bk[s.id]?'<div class="ent ok"><b>'+esc(s.n)+'</b><span>'+esc(s.t)+'</span></div>'
     :'<div class="ent lock"><b>???</b><span>'+esc(s.h)+'</span></div>').join('');
  return h+dm.apply(this,arguments)}}

// --- 6. el mapa del reino lo menciona ---
if(typeof REGINFO!=='undefined'&&REGINFO.puertas&&!REGINFO.puertas.includes('Portón del Olvido (4 de 6 sellos)'))
 REGINFO.puertas=REGINFO.puertas.slice(0,-1).concat(['Portón del Olvido (4 de 6 sellos)'],REGINFO.puertas.slice(-1));
})();
