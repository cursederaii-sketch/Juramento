// ===== INICIO: título, ajustes, pausa, controles táctiles y bucle principal =====
function applyCfg(){
 const d=document.documentElement.style,b=document.body.classList;
 d.setProperty('--ts',CFG.tsize);d.setProperty('--to',CFG.topac/100);
 const touch=CFG.touch==='on'||(CFG.touch==='auto'&&(('ontouchstart' in window)||(window.matchMedia&&matchMedia('(pointer:coarse)').matches)));
 b.toggle('lefty',!!CFG.lefty);b.toggle('notouch',!touch);b.toggle('crt',!!CFG.crt);
 cv.style.imageRendering=CFG.smooth?'auto':'pixelated';
}
const setC=(k,v)=>{CFG[k]=+v;saveCfg();applyCfg()};
let setFrom='title';
function openSettings(from){
 if(from)setFrom=from;G.mode=G.mode==='play'?'menu':G.mode;const m=$('menu'),sc=m.scrollTop;m.style.display='flex';m.classList.remove('tt');
 const sl=(t,k,a,b,s)=>'<h2>'+t+' <span class="hint">'+CFG[k]+'</span></h2><input type="range" min="'+a+'" max="'+b+'" step="'+s+'" value="'+CFG[k]+'" oninput="setC(\''+k+'\',this.value);this.previousElementSibling.lastChild.textContent=this.value">';
 const tg=(t,k)=>'<button class="oath'+(CFG[k]?' sel':'')+'" onclick="CFG[\''+k+'\']=CFG[\''+k+'\']?0:1;saveCfg();applyCfg();openSettings()"><b>'+t+'</b>'+(CFG[k]?'Activado':'Desactivado')+'</button>';
 const tl={auto:'Automático',on:'Siempre visibles',off:'Ocultos (teclado)'};
 m.innerHTML='<div class="card"><h1 style="font-size:24px">Ajustes</h1>'
  +sl('Volumen general','master',0,100,5)+sl('Música','music',0,100,5)+sl('Efectos','sfx',0,100,5)+sl('Sacudida de cámara','shake',0,1,.25)
  +'<h2>Controles</h2><button class="oath" onclick="CFG.touch=CFG.touch===\'auto\'?\'on\':CFG.touch===\'on\'?\'off\':\'auto\';saveCfg();applyCfg();openSettings()"><b>Botones táctiles</b>'+tl[CFG.touch]+'</button>'
  +sl('Tamaño de botones','tsize',.8,1.4,.1)+sl('Opacidad de botones','topac',30,100,5)
  +tg('Modo zurdo','lefty')+tg('Vibración','vib')
  +'<h2>Pantalla</h2>'+tg('Minimapa','mini')+tg('Indicadores de acción','hints')+tg('Números de daño','dmg')+tg('Filtro CRT','crt')+tg('Suavizar píxeles','smooth')
  +'<button id="go" onclick="'+(setFrom==='title'?'showTitle()':'openPause()')+'">Volver</button></div>';
 m.scrollTop=sc}
function openPause(){
 if(G.mode!=='play'&&G.mode!=='menu')return;relAll();G.mode='menu';const m=$('menu');m.style.display='flex';m.classList.remove('tt');
 m.innerHTML='<div class="card"><h1>Pausa</h1><p>'+rg.n+'</p><button id="go" onclick="closeM()">Continuar</button>'
  +'<p>'+S.name+'</p><button class="oath" onclick="openDiary(\'mem\',\'pause\')"><b>Diario</b>Recuerdos, bestiario, logros y mapa</button>'
  +'<button class="oath" onclick="openSettings(\'pause\')"><b>Ajustes</b>Sonido, controles y pantalla</button>'
  +'<button class="oath" onclick="save();showTitle()"><b>Guardar y salir al título</b></button></div>'}
function showTitle(){
 G.mode='title';relAll();$('dlg').style.display='none';const m=$('menu'),has=[1,2,3].some(n=>!!slotData(n));m.style.display='flex';m.classList.add('tt');
 m.innerHTML='<div class="tstage"><button class="tb3" onclick="tPlay()">Jugar</button><button class="tb3" onclick="openSettings(\'title\')">Ajustes</button><button class="tb3'+(has?'':' off')+'" onclick="tLoad()">Cargar<br>partida</button><div id="tmsg"></div></div>'}
function tMsg(t){const e=$('tmsg');if(e){e.textContent=t;clearTimeout(tMsg.t);tMsg.t=setTimeout(()=>{e.textContent=''},2200)}}
// ---- selector de slots (3) ----
function slotLbl(s){const r=RG[s.bf&&s.bf.r];return esc(s.name||'Sin nombre')+'<br><small>'+(r?esc(r.n):'')+' · Jefes '+Object.keys(s.bk||{}).length+'</small>'}
function slotPick(mode){G.mode='title';const m=$('menu');m.style.display='flex';m_off();
 let h='<div class="tbtns sl"><div id="tq">'+(mode==='load'?'Elige la partida a cargar':'Elige un slot')+'</div>';
 for(let n=1;n<=SLOTS;n++){const s=slotData(n);
  h+='<button class="tb slot'+(!s&&mode==='load'?' off':'')+'" onclick="slotGo('+n+',\''+mode+'\')"><b>Slot '+n+'</b> '+(s?slotLbl(s):'<small>Vacío'+(mode==='load'?'':' · Nueva partida')+'</small>')+'</button>'}
 m.innerHTML=h+'<button class="tb" onclick="showTitle()">Volver</button></div>'}
function slotGo(n,mode){const s=slotData(n);
 if(!s){if(mode==='load')return;SLOT=n;return askName()}
 if(mode==='load'){SLOT=n;m_off();return cont()}
 $('menu').innerHTML='<div class="tbtns sl"><div id="tq">Slot '+n+': '+esc(s.name||'Sin nombre')+'</div><button class="tb" onclick="SLOT='+n+';m_off();cont()">Continuar</button><button class="tb" onclick="SLOT='+n+';askName()">Nueva (borra la guardada)</button><button class="tb" onclick="slotPick(\'play\')">Volver</button></div>'}
function tLoad(){if(![1,2,3].some(n=>!!slotData(n)))return tMsg('No hay partida guardada');slotPick('load')}
function askName(){G.mode='title';const m=$('menu');m.style.display='flex';m_off();
 m.innerHTML='<form id="nf" class="card nmcard" autocomplete="off" onsubmit="startGame();return false"><h1>Tu nombre</h1><p>Despiertas sin recordar quién eres. Un nombre te viene a los labios... ¿cuál?</p>'
  +'<div class="nrow"><input id="nm" type="text" maxlength="14" placeholder="Sin nombre" enterkeyhint="go" autocomplete="off" autocapitalize="words" spellcheck="false"><button type="submit" class="tb" id="nok">Despertar</button></div>'
  +'<div id="nerr"></div><button type="button" class="oath" onclick="showTitle()" style="text-align:center">Volver</button></form>';
 const i=$('nm');i.addEventListener('keydown',e=>e.stopPropagation());setTimeout(()=>{try{i.focus()}catch(e){}},80)}
let _sg=0;
function startGame(){if(_sg)return;const er=$('nerr');
 try{const v=(($('nm')||{}).value||'').trim().replace(/[<>&"'`]/g,'').slice(0,14);_sg=1;newGame(v||'Sin nombre');setTimeout(()=>{_sg=0},1000)}
 catch(e){_sg=0;console.error(e);if(er)er.textContent='Error al empezar: '+(e&&e.message||e)}}
function tPlay(){slotPick('play')}
const m_off=()=>$('menu').classList.remove('tt');
addEventListener('keydown',e=>{const k=e.key.toLowerCase();if((k==='escape'||k==='p')&&!e.repeat){if(G.mode==='play')openPause();else if(G.mode==='menu'&&$('menu').querySelector('h1')&&$('menu').querySelector('h1').textContent==='Pausa')closeM()}});
$('pause').addEventListener('click',openPause);
$('pause').addEventListener('touchstart',e=>e.stopPropagation());
// ---- bucle ----
let last=performance.now();
const MENUEL=$('menu');
// calidad adaptativa: si el coste real por fotograma es alto, se desactivan primero los efectos atmosféricos y luego los halos extra
function perfTick(work,gap){const P_=PERF;P_.ema=P_.ema?P_.ema*.94+work*.06:work;P_.fr++;P_.t+=gap;
 if(P_.t<2500)return;const bad=P_.ema>9||P_.gap>42;
 if(bad&&P_.lv<2){P_.lv++;P_.good=0;P_.ema=0}else if(!bad&&P_.ema<4&&P_.lv>0){if(++P_.good>=3){P_.lv--;P_.good=0;P_.ema=0}}else P_.good=0;
 P_.t=0;P_.gap=0}
function loop(t){requestAnimationFrame(loop);if(t-last<10)return;let dt=(t-last)/1000;last=t;if(!(dt>0))return;PERF.gap=PERF.gap?PERF.gap*.9+Math.min(dt,.25)*100:Math.min(dt,.25)*1000;dt=Math.min(dt,.05);TM+=dt;
 try{const a=performance.now();update(dt);const menu=MENUEL.style.display&&MENUEL.style.display!=='none';if(!menu)draw();if(G.mode==='play')perfTick(performance.now()-a,dt*1000)}catch(e){if(!loop.err){loop.err=1;console.error(e)}}}
applyCfg();try{document.fonts&&document.fonts.load('10px "Press Start 2P"')}catch(e){}showTitle();requestAnimationFrame(loop);
