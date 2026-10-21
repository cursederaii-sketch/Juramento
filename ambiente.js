// ===== SONIDOS DE AMBIENTE (v8.51): capa procedural sobre la música, sin archivos nuevos =====
// Capas continuas (viento, rumor de cueva, agua, mar, abejas, fuego) + eventos al azar (pájaros, grillos, búho, gotas,
// gaviotas, cuervos, cristales, crujidos). Todo se genera con WebAudio y depende de la región, la hora (día/noche),
// la cercanía al agua / hogueras y el volumen de "efectos". Carga AL FINAL. Si algo falla, el juego sigue sin ambiente.
(()=>{
let started=0,L=null,nb=null,nextEv=0,lastId='';
const SEA=new Set(['puerto','naufragio','barco']),WET=new Set(['cripta','osario','cauce','cisterna','gruta','cantera','camaras','ruta','capsub','fosa','archivos']);
const HALL=new Set(['trono','castillo','valcor','entrada','gransalon','cocinas','capilla','biblioteca','puertas','torre','crater']);
const ctx=()=>{AC=AC||new(window.AudioContext||window.webkitAudioContext)();return AC};
const rnd=(a,b)=>a+Math.random()*(b-a);
function noise(c){if(nb)return nb;const n=c.sampleRate*3,b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);let p=0;for(let i=0;i<n;i++){const w=Math.random()*2-1;p=p*.97+w*.03;d[i]=(w*.5+p*6)*.6}return nb=b}
// capa continua: ruido -> filtro -> ganancia (con LFO opcional sobre la ganancia)
function layer(c,out,type,f,q,lfoHz,lfoDepth){const s=c.createBufferSource();s.buffer=noise(c);s.loop=true;const fl=c.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;
 const g=c.createGain();g.gain.value=0;s.connect(fl);fl.connect(g);g.connect(out);s.start(0,Math.random()*2);
 let lf=null;if(lfoHz){const o=c.createOscillator(),d=c.createGain();o.frequency.value=lfoHz;d.gain.value=lfoDepth;o.connect(d);d.connect(fl.frequency);o.start();lf=o}
 return{g,fl,v:0}}
function init(){if(L)return L;const c=ctx(),out=c.createGain();out.gain.value=1;out.connect(c.destination);
 const dly=c.createDelay(1.2);dly.delayTime.value=.34;const fb=c.createGain();fb.gain.value=.38;const wet=c.createGain();wet.gain.value=.5;dly.connect(fb);fb.connect(dly);dly.connect(wet);wet.connect(out);
 L={c,out,dly,
  wind:layer(c,out,'bandpass',420,.7,.09,160),hum:layer(c,out,'lowpass',130,.5,.05,30),water:layer(c,out,'bandpass',1500,.9,.7,500),
  sea:layer(c,out,'lowpass',520,.4,.11,200),bees:layer(c,out,'bandpass',260,6,5.5,40),whisper:layer(c,out,'bandpass',2100,3,.13,300)};
 return L}
// ---- eventos puntuales ----
const env=(c,g,t,a,d,v)=>{g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+a+d)};
function tone(type,f0,f1,t0,dur,v,wet){const c=L.c,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f0,t0);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t0+dur);
 env(c,g,t0,Math.min(.02,dur/4),dur,v);o.connect(g);g.connect(L.out);if(wet)g.connect(L.dly);o.start(t0);o.stop(t0+dur+.1)}
function burst(t0,dur,f,v,type){const c=L.c,s=c.createBufferSource();s.buffer=noise(c);const fl=c.createBiquadFilter();fl.type=type||'highpass';fl.frequency.value=f;const g=c.createGain();env(c,g,t0,.002,dur,v);s.connect(fl);fl.connect(g);g.connect(L.out);s.start(t0,Math.random()*2);s.stop(t0+dur+.05)}
const EV={
 bird(V){const t=L.c.currentTime,n=2+(Math.random()*4|0),b=rnd(2300,4200);for(let i=0;i<n;i++)tone('sine',b*rnd(.9,1.1),b*rnd(1.1,1.5),t+i*.12,.1,.05*V)},
 cricket(V){const t=L.c.currentTime,f=rnd(4200,4800);for(let i=0;i<10;i++)tone('sine',f,f*1.01,t+i*.055,.035,.022*V)},
 owl(V){const t=L.c.currentTime;tone('sine',420,330,t,.45,.07*V,1);tone('sine',400,300,t+.7,.6,.07*V,1)},
 drip(V){const t=L.c.currentTime,f=rnd(700,1800);tone('sine',f*1.4,f,t,.12,.07*V,1)},
 gull(V){const t=L.c.currentTime,f=rnd(1500,2100);tone('triangle',f,f*1.4,t,.25,.04*V);tone('triangle',f*1.3,f*.8,t+.3,.35,.04*V)},
 crow(V){const t=L.c.currentTime;for(let i=0;i<3;i++){tone('sawtooth',rnd(380,460),rnd(250,300),t+i*.32,.2,.035*V);burst(t+i*.32,.12,1200,.012*V,'bandpass')}},
 crystal(V){const t=L.c.currentTime,f=rnd(1400,2600);tone('sine',f,f,t,1.2,.045*V,1);tone('sine',f*1.5,f*1.5,t+.12,1,.03*V,1)},
 creak(V){const t=L.c.currentTime;tone('sawtooth',rnd(70,110),rnd(50,70),t,.9,.03*V,1)},
 spark(V){const t=L.c.currentTime;burst(t,.05,2500,.08*V)}
};
// ---- ajuste por frame lógico (cada ~150 ms) ----
function set(l,tg){l.v+=(tg-l.v)*.18;l.g.gain.value=l.v}
function tick(){try{
 if(!started||!L||typeof rg==='undefined'||!rg||!W||!P){return}
 const c=L.c;if(c.state==='suspended')c.resume();
 const title=G.mode==='title',V0=(CFG.master/100)*(CFG.sfx/100)*(CFG.amb==null?1:CFG.amb/100);
 const duck=title?0.35:G.bossOn?.15:(G.mode==='play'||G.mode==='intro')?1:.5,V=V0*duck;
 if(!rg.th||V<=0||window.__cine){for(const k of['wind','hum','water','sea','bees','whisper'])set(L[k],0);return}
 const id=rg.id,out=!!rg.out,day=!!rg.day||!S.night,night=out&&!rg.day&&!!S.night,sea=SEA.has(id);
 // proximidad al agua (baldosas de agua cercanas)
 let wd=99;if(W.water&&W.water.length&&!title){const px=P.x>>4,py=P.y>>4;for(let i=0;i<W.water.length;i+=2){const w=W.water[i],d=Math.hypot(w.tx-px,w.ty-py);if(d<wd)wd=d}}
 const near=wd<11?(1-wd/11):0;
 // proximidad a hogueras
 let fd=99;if(W.fires&&!title)for(const f of W.fires){const d=Math.hypot(f.x-P.x,f.y-P.y)/16;if(d<fd)fd=d}
 // viento: fuerte al aire libre, más en el mirador; suave en salas
 set(L.wind,V*(out?(id==='mirador'?.22:.12):HALL.has(id)?.05:.02)*(night?1.3:1));
 // rumor grave de cueva/sala
 set(L.hum,V*(out?0:WET.has(id)?.2:.16));
 // agua cercana (arroyo/estanque) y mar
 set(L.water,V*.16*near*(sea?.4:1));
 set(L.sea,V*(sea?.22:0));
 // abejas en el colmenar (más cerca de las colmenas = centro-este del mapa)
 set(L.bees,V*(id==='colmenar'?(.05+.07*Math.max(0,1-Math.hypot(P.x-520,P.y-290)/260)):0));
 // susurros de ceniza
 set(L.whisper,V*((rg.th==='valdora'||id==='crater')?.04:0));
 // ---- eventos ----
 const now=performance.now();
 if(!title&&now>nextEv&&G.mode==='play'){
  const pick=[];
  if(out&&day&&!sea)pick.push('bird','bird','bird');
  if(out&&day&&sea)pick.push('gull','gull');
  if(night&&!sea)pick.push('cricket','cricket','owl');
  if(!out&&WET.has(id))pick.push('drip','drip','drip','creak');
  if(!out&&HALL.has(id))pick.push('creak','drip');
  if(id==='gruta')pick.push('crystal','crystal','crystal');
  if(id==='mirador'||id==='desfiladero'||id==='puertas')pick.push('crow');
  if(rg.th==='valdora'||id==='crater')pick.push('crow','creak');
  if(id==='colmenar')pick.push('bird','bird');
  if(pick.length){const k=pick[Math.random()*pick.length|0];try{EV[k](V*(k==='drip'||k==='crystal'?1.6:1)*8)}catch(e){}}
  nextEv=now+rnd(2500,8000)}
 // crepitar de hoguera cercana
 if(fd<9&&!title&&G.mode==='play'&&Math.random()<.5){try{EV.spark(V*(1-fd/9)*2.5)}catch(e){}}
 lastId=id}catch(e){if(window.__ambDebug)console.log("AMB ERR",e.stack)}}
const go=()=>{if(started)return;started=1;try{init()}catch(e){started=0}};
['pointerdown','touchstart','keydown','click'].forEach(ev=>addEventListener(ev,go,{capture:true,passive:true}));
setInterval(tick,150);
window.__ambTick=tick;window.__ambInit=()=>{started=1;init()};
})();
