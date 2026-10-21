// ===== AUDIO REAL: efectos con muestras y música por pistas (créditos en CREDITOS-AUDIO.txt) =====
// Sustituye los pitidos de sfx() por sonidos grabados/instrumentos reales. Si algo falla, queda el sonido antiguo como respaldo.
(()=>{
const old=sfx,B={};let started=0,decoded=0;
const ctx=()=>{AC=AC||new(window.AudioContext||window.webkitAudioContext)();return AC};
// decodificación escalonada: antes los 39 efectos se decodificaban de golpe en el primer toque (tirón de ~100 ms en móvil); ahora en porciones de ≤5 ms
function decode(){if(decoded)return;decoded=1;try{const c=ctx(),ks=Object.keys(SFXB);let n=0;
 const one=()=>{const t0=performance.now();while(n<ks.length&&performance.now()-t0<5){const k=ks[n++];try{const t=atob(SFXB[k]),u=new Uint8Array(t.length);for(let i=0;i<t.length;i++)u[i]=t.charCodeAt(i);
  const p=c.decodeAudioData(u.buffer,x=>{B[k]=x},()=>{});if(p&&p.catch)p.catch(()=>{})}catch(e){}}
  if(n<ks.length)setTimeout(one,12)};one()}catch(e){}}
// qué sonido real corresponde a cada llamada antigua (frecuencia, duración, onda, volumen, frecuencia final)
function kind(f,d,t,v,f2){
 const up=f2&&f2>f*1.1,dn=f2&&f2<f*.9;
 if(f<=80)return d>=.8?'boom_long':(v>=.11&&d>=.6?'ult':(v>=.09?'boom':'thud'));
 if(t==='sine'||t==='triangle'){
  if(up){
   if(d>=1)return f<=200?(v>=.09?'win':'choir'):'chime_up';
   if(f>=800&&d<.2)return 'parry';
   if(t==='triangle'&&f<=320&&d>=.25)return 'door';
   if(t==='triangle'&&f>=600)return 'magic';
   if(d>=.45&&f<=360)return 'bell';
   if(f>=470)return d>=.5?'heal':'chime';
   return f<=410?'soul':'heal'}
  if(dn){if(f>=800)return d<.2?'parry':'magic';return d>=.5?'rumble':(d>=.28?'door':'dodge')}
  return d>=1.2?'choir':'chime'}
 if(v<=.021&&f<=400)return 'wake';
 if(f>=900)return d<=.1?'tick':'metal';
 if(f>=600)return 'shoot';
 if(d>=.8)return 'boom_long';
 if(d>=.5)return f<=200?(f>=100&&f<=115&&dn?'lever':'rumble'):(up?'magic':'roar');
 if(d>=.28)return f<=200?(v>=.07?'hurt':'fail'):'swing_h';
 if(dn&&f2<f*.4&&v>=.05)return 'hit';
 return f<=200?'swing_h':'swing_l'}
function play(k,g,rate){const b=B[k];if(!b)return false;try{const V=CFG.master/100*CFG.sfx/100;if(V<=0)return true;const c=ctx();c.resume();
 const s=c.createBufferSource(),a=c.createGain();s.buffer=b;s.playbackRate.value=rate||(.94+Math.random()*.12);a.gain.value=Math.min(1,g)*V;s.connect(a);a.connect(c.destination);s.start();return true}catch(e){return false}}
sfx=function(f,d,t,v,f2){decode();const k=kind(f,d,t||'square',v||.04,f2);if(!play(k,.25+(v||.04)*8))old(f,d,t,v,f2)};
window.playSfx=(k,g,r)=>{decode();return play(k,g==null?.7:g,r)};
// clics de interfaz
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#menu button,#dlg button');if(b&&started)playSfx('click',.35)},true);
// pasos del jugador
let lx=0,ly=0;setInterval(()=>{try{if(!started||G.mode!=='play'||!P||P.s==='dodge'||P.s==='dead')return;const m=Math.hypot(P.x-lx,P.y-ly);lx=P.x;ly=P.y;if(m>2&&m<40)playSfx('step',.2)}catch(e){}},300);
// ---------- música ----------
const TR={dark:['amb_oscuro',.5],calm:['amb_calma',.55],fight:['combate',.75],boss:['jefe',.85]},A={},cur={};let hold=0;
const DARK=new Set(['cripta','osario','archivos','fosa','marisma','cantera','torre','trono','puertas','castillo','cocinas','capilla','biblioteca']);
function el(k){if(A[k])return A[k];const a=new Audio(),n=TR[k][0],ogg=a.canPlayType('audio/ogg; codecs="vorbis"');a.src='musica/'+n+(ogg?'.ogg':'.mp3');a.loop=true;a.preload='auto';a.volume=0;cur[k]=0;return A[k]=a}
function want(){
 if(G.mode==='title')return['dark',.9];
 if(typeof rg==='undefined'||!rg)return[null,0];
 const duck=(G.mode==='play'||G.mode==='intro')?1:.5;
 if(G.bossOn)return['boss',duck];
 const now=Date.now();
 try{if(E.some(e=>e&&e.aw&&e.s!=='dead'&&!e.npc&&Math.hypot(e.x-P.x,e.y-P.y)<190))hold=now+4500}catch(e){}
 if(now<hold)return['fight',duck];
 return[DARK.has(rg.id)?'dark':'calm',duck]}
function tick(){if(!started)return;const[w,duck]=want(),M=CFG.master/100*(CFG.music==null?70:CFG.music)/100;
 for(const k in TR){const tg=k===w?TR[k][1]*duck*M:0,a=el(k);let v=cur[k];
  const step=tg>v?.06:.045;v=Math.abs(tg-v)<step?tg:v+(tg>v?step:-step);cur[k]=v;a.volume=Math.max(0,Math.min(1,v));
  if(v>0.002&&a.paused){if(k==='fight'||k==='boss')try{a.currentTime=0}catch(e){}const p=a.play();if(p&&p.catch)p.catch(()=>{})}
  else if(v<=0.002&&!a.paused&&tg===0)a.pause()}}
setInterval(tick,100);
const go=()=>{if(started)return;started=1;decode();try{ctx().resume()}catch(e){}};
['pointerdown','touchstart','keydown','click'].forEach(ev=>addEventListener(ev,go,{capture:true,passive:true}));
})();
