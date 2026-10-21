// ===== MOTOR (vista cenital) =====
const $=id=>document.getElementById(id),cv=$('cv'),g=cv.getContext('2d',{alpha:false});g.imageSmoothingEnabled=false;
const R=Math.random,cl=(v,a,b)=>Math.max(a,Math.min(b,v)),sgn=v=>v<0?-1:1,hash=k=>{const h=Math.sin(k*12.9898)*43758.5453;return h-Math.floor(h)};
// ---- ajustes (se editan en inicio.js) ----
const KEYD={up:['w','arrowup'],down:['s','arrowdown'],left:['a','arrowleft'],right:['d','arrowright'],light:['j'],heavy:['k'],dodge:['l',' '],block:['q','i'],run:['shift'],flask:['f'],act:['e']};
const CFGD={master:80,sfx:100,music:70,shake:1,vib:1,touch:'auto',tsize:1,topac:100,lefty:0,crt:0,smooth:0,fps:0,hints:1,text:1,mini:1,dmg:1,keys:KEYD};
const CFG=(()=>{try{const s=JSON.parse(localStorage.getItem('jur_cfg')||'{}');const c=Object.assign({},CFGD,s,{keys:Object.assign({},KEYD,s.keys||{})});if(!c.kv2){c.keys.block=['q','i'];c.keys.run=['shift'];c.kv2=1}return c}catch(e){return Object.assign({},CFGD,{keys:Object.assign({},KEYD)})}})();
const saveCfg=()=>{try{localStorage.setItem('jur_cfg',JSON.stringify(CFG))}catch(e){}};
const buzz=ms=>{if(CFG.vib&&navigator.vibrate)try{navigator.vibrate(ms)}catch(e){}};
// ---- entrada ----
const held={},buf={},EDGE={light:1,heavy:1,dodge:1,flask:1,act:1},KM={},joy={on:false,x:0,y:0};
const buildKM=()=>{for(const k in KM)delete KM[k];for(const a in CFG.keys)(CFG.keys[a]||[]).forEach(x=>{if(x)KM[x]=a})};buildKM();
const press=k=>{if(EDGE[k])buf[k]=k==='dodge'?.25:.16;else held[k]=1},rel=k=>{held[k]=0};
addEventListener('keydown',e=>{if(e.target&&e.target.tagName==='INPUT')return;const k=KM[e.key.toLowerCase()];if(k&&!e.repeat){press(k);e.preventDefault()}});
addEventListener('keyup',e=>{const k=KM[e.key.toLowerCase()];if(k)rel(k)});
const btns=[...document.querySelectorAll('[data-k]')];
const relAll=()=>{btns.forEach(b=>{rel(b.dataset.k);b.classList.remove('on')});for(const k in held)held[k]=0;for(const k in buf)buf[k]=0;joy.on=false;joy.x=joy.y=0;const kn=$('knob');if(kn)kn.style.transform=''};
btns.forEach(b=>{const k=b.dataset.k;
 const down=e=>{e.preventDefault();if(e.pointerId!=null)try{b.setPointerCapture(e.pointerId)}catch(_){}if(!b.classList.contains('on')){b.classList.add('on');press(k);buzz(8)}};
 const up=()=>{rel(k);b.classList.remove('on')};
 if(window.PointerEvent){b.addEventListener('pointerdown',down);['pointerup','pointercancel','lostpointercapture'].forEach(ev=>b.addEventListener(ev,up))}
 else{b.addEventListener('touchstart',down,{passive:false});['touchend','touchcancel'].forEach(ev=>b.addEventListener(ev,up))}
 b.addEventListener('touchstart',e=>e.preventDefault(),{passive:false});b.addEventListener('contextmenu',e=>e.preventDefault())});
// cruceta / joystick táctil: un solo dedo, 8 direcciones, analógico
(()=>{const pad=$('pad');if(!pad)return;let id=null;
 const set=(cx,cy)=>{const r=pad.getBoundingClientRect(),ox=r.left+r.width/2,oy=r.top+r.height/2,dx=cx-ox,dy=cy-oy,d=Math.hypot(dx,dy),dz=r.width*.12,mx=r.width*.4;
  if(d<dz){joy.on=false;joy.x=joy.y=0}else{const m=Math.min(1,(d-dz)/(mx-dz));joy.on=true;joy.x=dx/d*m;joy.y=dy/d*m}
  const kn=$('knob');if(kn){const k=Math.min(d,mx*.8);kn.style.transform='translate('+(dx/(d||1)*k)+'px,'+(dy/(d||1)*k)+'px)'}};
 const end=()=>{id=null;joy.on=false;joy.x=joy.y=0;const kn=$('knob');if(kn)kn.style.transform=''};
 pad.addEventListener('pointerdown',e=>{e.preventDefault();id=e.pointerId;try{pad.setPointerCapture(id)}catch(_){}set(e.clientX,e.clientY)});
 pad.addEventListener('pointermove',e=>{if(e.pointerId===id){e.preventDefault();set(e.clientX,e.clientY)}});
 ['pointerup','pointercancel','lostpointercapture'].forEach(ev=>pad.addEventListener(ev,e=>{if(e.pointerId===id||ev==='lostpointercapture')end()}));
 pad.addEventListener('touchstart',e=>e.preventDefault(),{passive:false});pad.addEventListener('contextmenu',e=>e.preventDefault())})();
addEventListener('blur',relAll);addEventListener('pagehide',relAll);document.addEventListener('visibilitychange',relAll);
// ---- estado ----
const DEF=()=>({souls:0,frag:0,ri:0,bf:{r:0,x:0},fires:['0:0'],weapon:'corta',wpns:['corta'],up:{},A:{vig:0,res:0,fue:0},oath:'',oaths:[],mir:0,dorn:0,cab:'',bk:{},tk:{},drop:null,flasks:3,fmax:3,name:'Sin nombre',ab:{},keys:{},rel:[],relOwn:[],mem:{},tr:{},notes:{},rv:{},lv:{},pz:{},am:{},dl:{},q:{mir:0,dorn:0,bre:0,ys:0},rt:0,est:0,aldric:0,bre0:0,st:{kills:0,hollow:0,parries:0,deaths:0,sneak:0,quests:0,falls:0},ach:{},be:{},seen:{},night:0});
let S=DEF(),P,E=[],PR=[],RK=[],PT=[],FX=[],FT=[],W,rg=RG[0],TM=0;
const cam={x:0,y:0},G={mode:'title',hs:0,shake:0,msg:'',msgT:0,banner:null,win:0,dieT:0,bossOn:false,nd:null,flash:0,fade:0};
// ---- slots de partida (3): el 1 conserva la clave original 'jur_s2', así las partidas existentes quedan en el slot 1 sin migrar ----
let SLOT=1;const skey=n=>n>1?'jur_s2_'+n:'jur_s2';const SLOTS=3;
const slotData=n=>{try{const s=localStorage.getItem(skey(n));return s?Object.assign(DEF(),JSON.parse(s)):null}catch(e){return null}};
const save=()=>{try{if(W&&W.seen&&rg)S.seen[rg.id]=W.packSeen();localStorage.setItem(skey(SLOT),JSON.stringify(S))}catch(e){}};
const load=()=>slotData(SLOT);
const hasR=k=>S.rel.includes(k),AB=()=>rg.boss||rg.mini;
const mhp=()=>100+10*S.A.vig,mst=()=>100+8*S.A.res,WPN=()=>WP[S.weapon],toast=s=>{G.msg=s;G.msgT=2.4};
const spark=(x,y,c,n,z=10,sp=1)=>{for(let i=0;i<n;i++){const a=R()*6.283,v=(20+R()*70)*sp;PT.push({k:'s',x,y,z,vx:Math.cos(a)*v,vy:Math.sin(a)*v*.6,vz:20+R()*60,l:.3+R()*.3,c})}};
const ftext=(x,y,t,c)=>{if(CFG.dmg)FT.push({x:x+(R()-.5)*8,y,t:String(t),l:.9,c})};
// ---- sonido ----
let AC;let sfx=(f,d,t,v,f2)=>{try{const V=CFG.master/100*CFG.sfx/100;if(V<=0)return;AC=AC||new AudioContext();AC.resume();const T=AC.currentTime,o=AC.createOscillator(),a=AC.createGain();o.type=t||'square';o.frequency.setValueAtTime(f,T);if(f2)o.frequency.exponentialRampToValueAtTime(f2,T+d);a.gain.setValueAtTime((v||.04)*V,T);a.gain.exponentialRampToValueAtTime(.0001,T+d);o.connect(a);a.connect(AC.destination);o.start();o.stop(T+d)}catch(e){}};
// ---- entidades ----
const ERAD={soldier:[6,9],hollow:[5,8],archer:[5,8],brute:[8,12],warden:[6,9]};
function mk(t,x,y,id){const b=id?BS[id]:null,d=b||TY[t],m=b?1:rg.m,er=b?[Math.min(9,d.w*.5),d.w*.8]:ERAD[t];
 return{t,b,id,x,y,hw:er[0],hh:4,r:er[1],fx:0,fy:1,hp:Math.round(d.hp*m),mhp:Math.round(d.hp*m),dm:b?b.dm:rg.dm,so:Math.round(d.so*m),s:'walk',tm:0,cd:1,fl:0,cur:null,wt:0,hd:false,stgT:0,rip:false,ph:0,rk:2,aw:!!b,nk:null,wp:null,pt:0,seed:R()*10,mvg:0,kx:0,ky:0}}
function spawnEn(){E=[];PR=[];RK=[];G.bossOn=false;G.wv=null;G.amb=null;G.chase=null;if(W)W.setGate(false);W.ens.forEach(en=>{if(en.when&&!en.when())return;const e=mk(en.t,en.x,en.y);if(en.pat){e.pat=en.pat.map(q=>[q[0]*16+8,q[1]*16+8]);e.pi=0;e.pw=0;e.det=0}E.push(e)})}
function see(e){const k=e.id||e.t;if(!S.be[k])S.be[k]={k:0}}
function wake(e){if(e.aw)return;e.aw=true;see(e);sfx(200,.1,'square',.02,300)}
function newP(x,y){P={x,y,hw:5,hh:3,fx:0,fy:1,ax:0,ay:1,hp:mhp(),mhp:mhp(),st:mst(),mst:mst(),sd:0,s:'idle',t:0,hd:false,ex:0,bt:0,dd:{x:0,y:1},bonus:0,kx:0,ky:0,mvg:0,ft:0,hits:0,sk:0,skT:0,sf:0,rv:0,safe:{x,y},wasD:false,cr:0}}
function loadRegion(i,fi,at){if(W&&W.seen&&rg)S.seen[rg.id]=W.packSeen();
 S.ri=i;rg=RG[i];W=new Mapa(rg);rg.build(W);W.applyState();W.bake();W.initSeen(S.seen[rg.id]);spawnEn();PT=[];FX=[];FT=[];RK=[];PR=[];
 let sx,sy;if(at==='exit'&&W.exitP){sx=W.exitP.x;sy=W.exitP.y+22}else if(at){const q=W.portals.find(z=>z.id===at);if(q){sx=q.x+q.sx;sy=q.y+q.sy}}
 const f=W.fires[fi]||W.fires[0];if(sx===undefined){sx=f.x;sy=f.y+22}newP(sx,sy);W.reveal(P.x,P.y);cam.x=cl(P.x-GW/2,0,W.cols*16-GW);cam.y=cl(P.y-GH/2,0,W.rows*16-GH);G.banner={t:rg.act,s:rg.n,l:3.5};G.fade=1}
// ---- jugador ----
const mult=()=>{let m=(1+.08*S.A.fue)*(1+.12*(S.up[S.weapon]||0));if(S.oath==='blood'&&P.bonus<=0)m*=1+(1-P.hp/P.mhp)*.9;if(S.oath==='oblivion')m*=.85;return m};
const spend=n=>{P.st-=n;P.sd=DIF.on?DIF.regenDelay:.7;if(P.st<=0){P.st=0;P.ex=.9}};
// [DIF] coste extra al encadenar esquivas seguidas (se acumula hasta dodgeChainMax escalones)
const dChain=()=>{if(!DIF.on)return 0;const c=P.clk;if(P.dcT!==undefined&&c-P.dcT<DIF.dodgeChainWin)P.dcN=Math.min(DIF.dodgeChainMax,(P.dcN||0)+1);else P.dcN=0;P.dcT=c;return P.dcN*DIF.dodgeChainCost};
const dodging=()=>P.s==='dodge'&&P.t>.03&&P.t<(hasR('paso')?.36:.26);
const inp=()=>{let x=(held.right?1:0)-(held.left?1:0),y=(held.down?1:0)-(held.up?1:0);if(joy.on)return{x:joy.x,y:joy.y};if(x&&y){x*=.7071;y*=.7071}return{x,y}};
function takeHit(d,fx,fy){const p=P;if(p.s==='dead')return;p.hp-=d;p.sk=0;G.shake=4;G.hs=.08;G.flash=.25;p.sd=.5;buzz(40);spark(p.x,p.y,'#ff4d6d',12);spark(p.x,p.y,'#8a1428',6);ftext(p.x,p.y-24,d,'#ff6b7a');
 if(fx!==undefined){const l=Math.hypot(fx,fy)||1;p.kx=fx/l*110;p.ky=fy/l*110}
 if(p.hp<=0){p.hp=0;p.s='dead';p.t=0;G.mode='dying';G.dieT=window.DIE_TOTAL||4.5;if(S.souls>0)S.drop={r:S.ri,x:p.x,y:p.y,s:S.souls};S.souls=0;S.st.deaths++;checkAch();return}
 p.s='hit';p.t=0;p.hd=true}
function hurtP(d,e){const p=P;if(dodging()){spark(p.x,p.y,'#7df9ff',4);ftext(p.x,p.y-26,'esquiva','#7df9ff');p.cnt=1.1;p.st=Math.min(p.mst,p.st+(hasR('cieno')?20:8));return}
 const ax=e.x-p.x,ay=e.y-p.y,l=Math.hypot(ax,ay)||1,front=(ax*p.fx+ay*p.fy)/l>.1;
 if(p.s==='idle'&&held.block&&p.ex<=0&&front){
  if(p.bt<(hasR('vigia')?.28:.2)){spark(p.x+p.fx*9,p.y-10,'#ffe66d',16);G.hs=.12;G.shake=2;p.st=Math.min(p.mst,p.st+20);S.st.parries++;if(hasR('espejo')){p.st=p.mst;p.hp=Math.min(p.mhp,p.hp+6);ftext(p.x,p.y-30,'+6','#7dff9a')}checkAch();if(!e.proj){e.s='stg';e.tm=0;e.stgT=1.1;e.rip=true}FX.push({k:'ring',x:p.x+p.fx*9,y:p.y-8,l:.3,m:.3,c:'255,230,109'});toast('¡Parada!');return}
  p.st-=d*1.3*(S.oath==='guardian'?.5:1);p.sd=.8;spark(p.x+p.fx*8,p.y-8,'#8aa3c7',8);G.hs=.05;G.shake=1.5;p.hp-=Math.round(d*.15);p.kx=-ax/l*50;p.ky=-ay/l*50;
  if(p.hp<=0){takeHit(0);return}
  if(p.st<=0){p.st=0;p.ex=1.2;p.s='hit';p.t=0;p.hd=true}return}
 takeHit(d,-ax,-ay)}
const objs=()=>{const o=[];W.fires.forEach((f,i)=>o.push({x:f.x,y:f.y+6,k:'Descansar',f:()=>bonfire(i)}));
 W.npcs.forEach(n=>{if((n.night&&!S.night)||(n.when&&!n.when()))return;o.push({x:n.x,y:n.y,k:'Hablar',f:()=>say(NPC[n.id]())})});
 W.items.forEach((it,i)=>{const key=S.ri+':'+i;if(S.tk[key]||(it.hid&&!S.ab.see)||(it.when&&!it.when()))return;o.push({x:it.x,y:it.y,k:it.k||'Recoger',f:()=>pickIt(it,key)})});
 W.notes.forEach(n=>o.push({x:n.x,y:n.y+3,k:'Leer',f:()=>say(readNote(n.id))}));
 W.levers.forEach(l=>{if(!S.lv[rg.id+':'+l.id])o.push({x:l.x,y:l.y,k:l.k||'Palanca',f:()=>pull(l)})});
 W.lds.forEach(d=>{if(!S.dl[d.id])o.push({x:d.px,y:d.py,k:'Abrir',f:()=>openLd(d)})});
 W.pzs.forEach(z=>{if(!S.pz[z.id])z.t.forEach(t=>{const on=z.lit.includes(t.i);if(!on||z.kind==='toggle')o.push({x:t.x,y:t.y+8,k:on?'Apagar':'Encender',f:()=>lightT(z,t)})})});
 W.portals.forEach(q=>{if(q.cond&&!q.cond()){if(q.lock)o.push({x:q.x,y:q.y+4,k:'Cerrado',f:()=>toast(q.lock)});return}o.push({x:q.x,y:q.y+4,k:q.k||'Entrar',f:()=>go(q)})});
 if(W.exitP&&S.bk[rg.boss]&&rg.nx)o.push({x:W.exitP.x,y:W.exitP.y+4,k:'Cruzar',f:door});return o};
function pickIt(it,key){S.tk[key]=1;let dl=null;
 if(it.w){getW(it.w);const w=WP[it.w];dl=D(w.n,w.lore[0])}
 else if(it.key)giveKey(it.key);else if(it.rel)giveRel(it.rel);else if(it.ab)giveAb(it.ab);
 else if(it.q==='retrato'){S.rt++;toast('Retrato de Valdora '+S.rt+'/3')}
 else if(it.q==='estandarte'){S.est=1;toast('Estandarte del Tercer Regimiento')}
 else if(it.tr){dl=truD(it.tr);if(rg.id==='archivos')startChase()}
 else if(it.sou){S.souls+=it.sou;toast('+'+it.sou+' almas')}
 else if(it.n){S.frag+=it.n;toast('+'+it.n+' fragmentos de memoria')}
 else{S.frag++;toast('Fragmento de memoria')}
 sfx(520,.25,'sine',.06,880);spark(it.x,it.y,'#ffe66d',16);save();if(dl)say(dl)}
function pull(l){S.lv[rg.id+':'+l.id]=1;W.applyState();{const sg=W.sgs.find(s=>s.need.includes(l.id));if(sg&&(l.m||sg.msg)){const n=sg.need.filter(id=>S.lv[rg.id+':'+id]).length;toast(n>=sg.need.length?(sg.msg||'Algo se abre a lo lejos'):(l.m||'Hecho')+' ('+n+'/'+sg.need.length+')')}else toast('Algo se abre a lo lejos')}sfx(110,.5,'sawtooth',.06,70);G.shake=2.5;save()}
function openLd(d){if(S.keys[d.key]){S.dl[d.id]=1;W.clearT([d.x,d.y,d.w,d.h]);toast('Usas la '+KEYN[d.key]);sfx(300,.3,'triangle',.06,500);save()}else toast(d.lbl||'Está cerrado. Necesitas la '+KEYN[d.key])}
function lightT(z,t){if(t.i===z.order[z.prog]){z.lit.push(t.i);z.prog++;sfx(400+z.prog*80,.3,'sine',.06,800);spark(t.x,t.y-8,'#ffe66d',14,14);
  if(z.prog>=z.order.length){S.pz[z.id]=1;W.clearT(z.door);toast('Algo antiguo recuerda... y se abre');ach('puzzle');G.shake=3;sfx(120,.7,'sawtooth',.07,60);save()}}
 else{z.lit=[];z.prog=0;toast('Las llamas se apagan...');sfx(120,.3,'sawtooth',.05,60);spark(t.x,t.y-6,'#666',10)}}
function go(q){const ti=RG.findIndex(r=>r.id===q.to);if(ti<0)return;save();loadRegion(ti,null,q.at);const k=ti+':0';if(!S.fires.includes(k)){S.fires.push(k);S.bf={r:ti,x:0}}save()}
const near=()=>objs().filter(o=>Math.hypot(P.x-o.x,P.y-o.y)<22).sort((a,b)=>Math.hypot(P.x-a.x,P.y-a.y)-Math.hypot(P.x-b.x,P.y-b.y))[0];
function door(){const ti=RG.findIndex(r=>r.id===rg.nx);loadRegion(ti,0);const k=ti+':0';if(!S.fires.includes(k)){S.fires.push(k);S.bf={r:ti,x:0}}save()}
function bonfire(i){P.hp=P.mhp;P.st=P.mst;S.flasks=S.fmax;S.bf={r:S.ri,x:i};const k=S.ri+':'+i;if(!S.fires.includes(k))S.fires.push(k);spawnEn();FX.push({k:'ring',x:W.fires[i].x,y:W.fires[i].y,l:.8,m:.8,c:'255,160,60',big:1});save();openRest(false)}
function startWaves(){G.wv={i:0,boss:false};G.bossOn=true;W.setGate(true);nextWave()}
function nextWave(){const w=rg.waves[G.wv.i],a=W.arena;w.forEach((t,k)=>{const an=k/w.length*6.283+G.wv.i*1.3;const e=mk(t,cl(a.bx*16+8+Math.cos(an)*70,(a.x+2)*16,(a.x+a.w-2)*16),cl(a.by*16+8+Math.sin(an)*45,(a.y+2)*16,(a.y+a.h-2)*16));e.aw=true;e.wv=1;see(e);E.push(e)});toast('Oleada '+(G.wv.i+1)+' de '+rg.waves.length);sfx(150,.5,'sawtooth',.06,90);G.shake=3}
function startAmb(a){G.amb={id:a.id,o:a.o};a.sp.forEach(q=>{const e=q[3]?mk('boss',q[1]*16+8,q[2]*16+8,q[3]):mk(q[0],q[1]*16+8,q[2]*16+8);e.aw=true;e.amb=a.id;see(e);E.push(e)});toast(a.o.msg||'¡Emboscada!');G.shake=4;sfx(110,.6,'sawtooth',.07,50)}
function startChase(){G.chase={r:1.5};E.forEach(e=>{if(e.pat)wake(e)});(W.chaseSp||[]).forEach(q=>{const e=mk(q[0],q[1]*16+8,q[2]*16+8);e.aw=true;E.push(e)});toast('¡Suena la alarma! ¡Huye!');G.shake=5;sfx(90,.9,'sawtooth',.08,40)}
function fall(){const p=P;S.st.falls++;spark(p.x,p.y,'#b05cff',14,6);p.kx=p.ky=0;p.s='idle';toast('Caes en la grieta...');takeHit(10);if(p.s!=='dead'){p.x=p.safe.x;p.y=p.safe.y}}
function startBoss(){const a=W.arena,id=AB();const be=mk('boss',a.bx*16+8,a.by*16+8,id);be.arena=1;see(be);E.push(be);G.bossOn=true;W.setGate(true);toast(BS[id].n);G.shake=5;sfx(90,.9,'sawtooth',.08,40);FX.push({k:'ring',x:a.bx*16+8,y:a.by*16+8,l:1,m:1,c:'176,92,255',big:1})}
function updP(dt){const p=P,w=WPN(),L=w.l,H=w.h;p.t+=dt;p.clk=(p.clk||0)+dt;if(p.ex>0)p.ex-=dt;if(p.bonus>0)p.bonus-=dt;if(p.cnt>0)p.cnt-=dt;if(p.dl>0)p.dl-=dt;p.sd-=dt;
 for(const k in buf)if(buf[k]>0)buf[k]-=dt;
 const blk=held.block&&p.s==='idle'&&p.ex<=0;if(blk)p.bt+=dt;else p.bt=0;
 const v=inp(),mag=Math.hypot(v.x,v.y);
 if(W.arena&&AB()&&!S.bk[AB()]&&!G.bossOn){const a=W.arena;if(p.x>(a.x+2)*16&&p.x<(a.x+a.w-1)*16&&p.y>(a.y+1.5)*16&&p.y<(a.y+a.h-1)*16){if(rg.waves)startWaves();else startBoss()}}
 if(p.skT>0)p.skT-=dt;
 if(!G.amb)for(const a of W.ambs){if(S.am[a.id])continue;if(p.x>a.x*16&&p.x<(a.x+a.w)*16&&p.y>a.y*16&&p.y<(a.y+a.h)*16){startAmb(a);break}}
 p.rv-=dt;if(p.rv<=0){p.rv=.2;W.reveal(p.x,p.y);
  for(const r of W.fwr){if(S.rv[rg.id+':'+r.id])continue;const cx=cl(p.x,r.x*16,(r.x+r.w)*16),cy=cl(p.y,r.y*16,(r.y+r.h)*16);if(Math.hypot(p.x-cx,p.y-cy)<12){S.rv[rg.id+':'+r.id]=1;W.applyDyn();W.bake();toast('Un muro falso se desvanece...');ach('secreto');sfx(300,.5,'sine',.05,150);G.shake=2;save()}}
  p.sf-=.2;if(p.s==='idle'&&!W.chasmAt(p.x+14,p.y)&&!W.chasmAt(p.x-14,p.y)&&!W.chasmAt(p.x,p.y+14)&&!W.chasmAt(p.x,p.y-14)&&!W.chasmAt(p.x,p.y))p.safe={x:p.x,y:p.y}}
 if(p.s==='idle'&&p.ex<=0){
  if(buf.act>0){buf.act=0;const o=near();if(o){o.f();return}}
  const aim=()=>{if(mag>.3){p.ax=v.x/mag;p.ay=v.y/mag;if(Math.abs(p.ax)>Math.abs(p.ay)*1.2){p.fx=sgn(p.ax);p.fy=0}else if(Math.abs(p.ay)>Math.abs(p.ax)*1.2){p.fx=0;p.fy=sgn(p.ay)}}else{p.ax=p.fx;p.ay=p.fy}};
  if(buf.dodge>0&&p.st>0&&!(p.dl>0)){spend((hasR('paso')?17:24)+dChain());p.s='dodge';p.t=0;buf.dodge=0;if(mag>.3){p.dd={x:v.x/mag,y:v.y/mag}}else p.dd={x:-p.fx,y:-p.fy};sfx(300,.12,'triangle',.03,160);for(let i=0;i<5;i++)PT.push({k:'d',x:p.x,y:p.y,z:2,vx:(R()-.5)*30,vy:(R()-.5)*20,vz:10+R()*20,l:.4,c:'rgba(200,190,230,.5)'})}
  else if(buf.heavy>0&&p.st>=H.c*.5){spend(H.c*1.25);p.cn=0;p.s='heavy';p.t=0;p.hd=false;aim();buf.heavy=0}
  else if(buf.light>0&&p.st>=L.c*.6){p.cn=(p.clk-(p.lastAtk||-9)<.6)?Math.min(3,(p.cn||0)+1):0;p.lastAtk=p.clk;spend(L.c*1.6*(1+.45*p.cn));if(p.cn>=2)ftext(p.x,p.y-30,'cansado','#ffb060');p.s='light';p.t=0;p.hd=false;aim();buf.light=0}
  else if(buf.flask>0&&S.flasks>0){buf.flask=0;if(S.oath==='guardian'&&G.bossOn)toast('El Guardián no puede curarse');else{p.s='flask';p.t=0;p.hd=false}}}
 let vx=0,vy=0;p.run=0;
 if(p.s==='idle'){if(mag>.05){if(p.st>30)p.rx=0;if(!blk&&p.ex<=0&&mag>.3&&!p.rx&&!G.noRun&&(held.run||(window.RUNT&&(RUNT.on||RUNT.gp)))){p.run=1;p.st-=16*dt;p.sd=Math.max(p.sd,.45);if(p.st<=6){p.st=6;p.rx=1;p.run=0}}
   const sp=68*(blk?.45:1)*(p.ex>0?.4:1)*(p.run?1.5:1);vx=v.x*sp;vy=v.y*sp;
   if(!blk){if(Math.abs(v.x)>Math.abs(v.y)*1.2){p.fx=sgn(v.x);p.fy=0}else if(Math.abs(v.y)>Math.abs(v.x)*1.2){p.fy=sgn(v.y);p.fx=0}else if(!p.fx&&!p.fy){p.fx=sgn(v.x)}else if(p.fx)p.fx=sgn(v.x);else p.fy=sgn(v.y)}
   else{p.ax=p.fx;p.ay=p.fy}}
  p.mvg=mag>.05?1:0}
 else if(p.s==='light'){p.mvg=0;if(p.t<L.a[1]){const lg=w.fx==='lunge'?110:40;vx=p.ax*lg;vy=p.ay*lg}if(p.t>L.t*(p.hd?1:1.45))p.s='idle'}
 else if(p.s==='heavy'){p.mvg=0;if(p.t>H.t*(p.hd?1:(DIF.on?DIF.heavyWhiff:1.35)))p.s='idle'}
 else if(p.s==='dodge'){const sp=170*(1-p.t/.38*.6)*(S.ab.dash?1.6:1);vx=p.dd.x*sp;vy=p.dd.y*sp;if(p.t>.38){p.s='idle';p.dl=.14}if(R()<.5)PT.push({k:'d',x:p.x,y:p.y,z:2,vx:(R()-.5)*10,vy:(R()-.5)*10,vz:8,l:.3,c:'rgba(190,180,220,.45)'})}
 else if(p.s==='flask'){p.mvg=0;if(p.t>(DIF.on?DIF.flaskHeal:.5)&&!p.hd){p.hd=true;S.flasks--;p.hp=Math.min(p.mhp,p.hp+45);p.bonus=6;spark(p.x,p.y,'#7dff9a',18,16,.6);ftext(p.x,p.y-26,'+45','#7dff9a');sfx(440,.35,'sine',.05,880)}if(p.t>(DIF.on?DIF.flaskEnd:.9))p.s='idle'}
 else if(p.s==='hit'){p.mvg=0;if(p.t>.3)p.s='idle'}
 vx+=p.kx;vy+=p.ky;p.kx*=Math.pow(.0008,dt);p.ky*=Math.pow(.0008,dt);
 const inD=p.s==='dodge';W.fly=inD&&!!S.ab.leap;W.move(p,vx*dt,vy*dt);W.fly=false;
 if(inD&&W.fly===false&&S.ab.leap&&p.t>.05&&(W.chasmAt(p.x,p.y)))p.cr=1;
 if(p.wasD&&p.s!=='dodge'){if(W.hit(p.x,p.y,p.hw,p.hh)||W.chasmAt(p.x,p.y))fall();else if(p.cr)ach('salto');p.cr=0}p.wasD=p.s==='dodge';
 if(p.mvg&&p.s==='idle'){p.ft-=dt;if(p.ft<=0){p.ft=.26;PT.push({k:'d',x:p.x,y:p.y+1,z:1,vx:(R()-.5)*8,vy:0,vz:6,l:.35,c:'rgba(170,160,200,.35)'})}}
 if(p.sd<=0&&p.st<p.mst&&p.s!=='dodge')p.st=Math.min(p.mst,p.st+(DIF.on?(blk?DIF.regenBlock:DIF.regen):(blk?9:25))*dt);
 const sw=w.fx==='sweep';const A=p.s==='light'?[L.a[0],L.a[1],L.d,L.r,3,0,.45]:p.s==='heavy'?[H.a[0],H.a[1],H.d,H.r,8,1,sw?-1:.1]:null;
 if(A&&p.t>=A[0]&&!p.fxd){p.fxd=true;FX.push({k:'arc',x:p.x,y:p.y-10,a:Math.atan2(p.ay,p.ax),rho:A[5]?(sw?3.1:1.5):1.15,r:A[3]+4,l:.2,m:.2,heavy:A[5]});sfx(A[5]?170:260,.12,'sawtooth',.025,A[5]?90:140)}
 if(!A||p.t<.02)p.fxd=false;
 if(A&&!p.hd&&p.t>=A[0]&&p.t<=A[1]){let n=0;const lim=A[5]?(sw?8:3):1,cs=A[6];
  const cand=E.filter(e=>e.s!=='dead').map(e=>{const dx=e.x-p.x,dy=e.y-p.y,d=Math.hypot(dx,dy)||1;return{e,d,c:(dx*p.ax+dy*p.ay)/d}}).filter(o=>o.d<A[3]+o.e.r&&(o.c>cs||o.d<10)).sort((a,b)=>a.d-b.d);
  for(const o of cand){if(n>=lim)break;n++;p.hd=true;hitE(o.e,A[2],A[4],A[5])}}}
function hitE(e,d,kb,hv){d*=mult();let rp=false;
 if(P.cnt>0){P.cnt=0;d*=1.4;ftext(e.x,e.y-44,'¡Contra!','#7df9ff')}
 if(!e.aw&&!e.b){d*=hasR('sombra')?4:3;S.st.sneak++;ftext(e.x,e.y-38,'¡Sorpresa!','#7df9ff');checkAch()}
 if(e.s==='stg'&&e.rip){d*=WPN().fx==='lunge'?3.5:2.5;rp=true;e.rip=false}
 if(hasR('furia')){P.sk=(P.skT>0?P.sk:0)+1;P.skT=3;if(P.sk%5===0){d*=1.6;spark(P.x,P.y-10,'#ff9a3c',14);ftext(P.x,P.y-32,'¡Furia!','#ff9a3c')}}
 if(WPN().fx==='vigor')P.st=Math.min(P.mst,P.st+3);
 d=Math.round(d);e.hp-=d;e.fl=.12;e.aw=true;const l=Math.hypot(e.x-P.x,e.y-P.y)||1,kx=(e.x-P.x)/l,ky=(e.y-P.y)/l;W.move(e,kx*kb,ky*kb,e.hw,e.hh);
 if(e.arena){const a=W.arena;if(a){e.x=cl(e.x,(a.x+1)*16,(a.x+a.w-1)*16);e.y=cl(e.y,(a.y+1)*16,(a.y+a.h-1)*16)}}
 G.hs=hv||rp?.11:.06;G.shake=hv||rp?3:1.5;buzz(15);P.hits++;
 spark(e.x,e.y,rp?'#ffe66d':'#fff',rp?16:8,12);spark(e.x,e.y,e.b?'#ff4d6d':'#b05cff',5,12);ftext(e.x,e.y-26,d,rp?'#ffe66d':'#fff');
 if(e.hp<=0){e.hp=0;e.s='dead';e.tm=0;onKill(e);for(let i=0;i<10;i++)PT.push({k:'soul',x:e.x,y:e.y,z:10+R()*8,vx:(R()-.5)*60,vy:(R()-.5)*40,vz:30+R()*50,l:1.6,c:'#c08cff',h:1});if(e.b)bossDown(e);return}
 const arm=(e.b&&e.ph>=1)||(TY[e.t]&&TY[e.t].arm);
 if(rp){e.s='stg';e.tm=0;e.stgT=.7}else if(hv&&!arm){e.s='stg';e.tm=0;e.stgT=.45}else if(!e.b&&!arm&&e.s==='wind'&&hv){e.s='stg';e.tm=0;e.stgT=.3}}
function onKill(e){S.souls+=Math.round(e.so*(hasR('alma')?1.35:1));S.st.kills++;if(e.t==='hollow')S.st.hollow++;const k=e.id||e.t,b=S.be[k]=S.be[k]||{k:0};b.k++;if(hasR('sed')){P.hp=Math.min(P.mhp,P.hp+5);ftext(P.x,P.y-28,'+5','#7dff9a')}checkAch()}
function bossDown(e){S.bk[e.id]=1;G.bossOn=false;G.wv=null;W.setGate(false);G.win=2.5;G.winId=e.id;S.frag+=e.b.fr;RK=[];PR=[];
 E.forEach(x=>{if(x!==e&&x.s!=='dead'&&(!e.b.mini||x.ad||x.wv||(e.amb&&x.amb===e.amb))){x.hp=0;x.s='dead';x.tm=0}});
 FX.push({k:'ring',x:e.x,y:e.y,l:1.2,m:1.2,c:'255,230,109',big:1});if(e.id==='caballero')getW('caballero');
 const dr=e.b.drop;if(dr){if(dr.w)getW(dr.w);if(dr.ab)giveAb(dr.ab);if(dr.rel)giveRel(dr.rel)}if(!e.b.mini)ach('jefe');if(e.id==='heraldo')ach('oleadas')}
// ---- enemigos ----
function patrol(e,dt,dist,ux,uy,sh){const pt=e.pat;e.mvg=0;
 if(pt.length===1){e.pa=(e.pa||0)+dt*.7;e.fx=Math.cos(e.pa);e.fy=Math.sin(e.pa)}
 else if(e.pw>0)e.pw-=dt;
 else{const T=pt[e.pi],dx=T[0]-e.x,dy=T[1]-e.y,l=Math.hypot(dx,dy);if(l<3){e.pi=(e.pi+1)%pt.length;e.pw=1.4}else{const pm=W.move(e,dx/l*24*dt,dy/l*24*dt,e.hw,e.hh);e.mvg=1;if(pm<24*dt*.3){e.ps=(e.ps||0)+dt;if(e.ps>1){e.pi=(e.pi+1)%pt.length;e.ps=0;e.pw=.4}}else e.ps=0;const k=Math.min(1,dt*6);e.fx+=(dx/l-e.fx)*k;e.fy+=(dy/l-e.fy)*k;const f=Math.hypot(e.fx,e.fy)||1;e.fx/=f;e.fy/=f}}
 const seen=dist<110*sh&&W.los(e.x,e.y,P.x,P.y)&&((ux*e.fx+uy*e.fy)>.5||dist<22*sh);
 e.det=cl((e.det||0)+(seen?(dist<50?2.4:1.4):-.5)*dt,0,1);
 if(e.det>=1){wake(e);toast('¡Te vieron!');E.forEach(o=>{if(o.pat&&!o.aw&&Math.hypot(o.x-e.x,o.y-e.y)<(DIF.on?DIF.alertR:110))wake(o)})}}
function chase(e,tx,ty,sp,dt){let dx=tx-e.x,dy=ty-e.y,l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;
 if(!W.los(e.x,e.y,tx,ty)){e.pt-=dt;if(e.pt<=0||!e.wp){e.pt=.35;e.wp=W.next(Math.floor(e.x/16),Math.floor(e.y/16),Math.floor(tx/16),Math.floor(ty/16))}
  if(e.wp){dx=e.wp.x-e.x;dy=e.wp.y-e.y;l=Math.hypot(dx,dy)||1;if(l<3){e.pt=0}dx/=l;dy/=l}}else e.wp=null;
 const m=W.move(e,dx*sp*dt,dy*sp*dt,e.hw,e.hh);if(m<sp*dt*.35){W.move(e,dy*sp*dt*.8,-dx*sp*dt*.8,e.hw,e.hh);if(!e.wp)e.pt=0}e.mvg=1}
function updE(e,dt){e.tm+=dt;e.fl-=dt;e.mvg=0;if(e.s==='dead')return;const b=e.b,d=b||TY[e.t];
 const dxp=P.x-e.x,dyp=P.y-e.y,dist=Math.hypot(dxp,dyp)||1,ux=dxp/dist,uy=dyp/dist;
 if(!e.aw){if(P.s==='dead')return;const sh=hasR('sombra')?.5:1;
  if(e.pat){patrol(e,dt,dist,ux,uy,sh);return}
  if(dist<56*sh||(dist<120*sh&&W.los(e.x,e.y,P.x,P.y)))wake(e);return}
 if(!b&&dist>340){e.aw=false;return}
 let ph=null,sp=d.sp*(G.chase?1.2:1);
 if(b){const r=e.hp/e.mhp,n=b.pf?b.pf(r):(r>.66?0:r>.33?1:2);
  if(n!==e.ph){e.ph=n;const q=b.ph[n];G.shake=6;G.hs=.2;spark(e.x,e.y,'#ff4d6d',34,16,1.4);FX.push({k:'ring',x:e.x,y:e.y,l:.9,m:.9,c:'255,60,90',big:1});sfx(100,.6,'sawtooth',.07,50);if(q.msg)toast(q.msg);
   for(let i=0;i<(q.adds||0);i++){let ax=e.x+(i?-48:48);if(e.arena&&W.arena)ax=cl(ax,(W.arena.x+2)*16,(W.arena.x+W.arena.w-2)*16);const a=mk(q.addT||(e.id==='rey'&&S.cab==='tom'?'soldier':'hollow'),ax,e.y+(i?30:-30));a.aw=true;a.ad=1;a.amb=e.amb;E.push(a)}}
  ph=b.ph[e.ph];sp*=ph.s;
  if(ph.rocks){e.rk-=dt;if(e.rk<=0){e.rk=2.2;for(let i=0;i<2;i++)RK.push({x:P.x+(R()-.5)*70,y:P.y+(R()-.5)*50,t:0})}}}
 const sm=Math.min(1,dt*10);e.fx+=(ux-e.fx)*sm;e.fy+=(uy-e.fy)*sm;const fl=Math.hypot(e.fx,e.fy)||1;e.fx/=fl;e.fy/=fl;
 if(e.kx||e.ky){W.move(e,e.kx*dt,e.ky*dt,e.hw,e.hh);e.kx*=Math.pow(.001,dt);e.ky*=Math.pow(.001,dt)}
 if(e.s==='walk'){e.cd-=dt;
  if(!e.nk){const l=b?ph.a:d.at;e.nk=l[Math.floor(R()*l.length)]}
  const at=ATK[e.nk];
  if(e.ck>0)e.ck-=dt;
  if(d.kite&&dist<60&&P.s!=='dead'&&!(e.ck>0)){const mv=W.move(e,-ux*sp*dt,-uy*sp*dt,e.hw,e.hh);if(mv<sp*dt*.3){e.kc=(e.kc||0)+dt;if(e.kc>.4){e.ck=1.5;e.kc=0}}else e.kc=0;e.mvg=1}
  else if(dist>at.sd*.9&&P.s!=='dead')chase(e,P.x,P.y,sp,dt);
  else if(e.cd<=0&&P.s!=='dead'){e.cur=at;e.nk=null;e.s='wind';e.tm=0;e.wt=at.w/(b?Math.min(1.25,ph.s):1)+(ph&&ph.hold?R()*ph.hold:0)+(b?0:R()*.28);e.ax=ux;e.ay=uy}}
 else if(e.s==='wind'){if(e.tm<e.wt*.7){e.ax=ux;e.ay=uy}
  if(e.tm>=e.wt){e.s='act';e.tm=0;e.hd=false;const c=e.cur;e.fx=e.ax;e.fy=e.ay;
   if(c.proj){e.hd=true;const l=Math.hypot(P.x-e.x,P.y-e.y)||1;PR.push({x:e.x+e.fx*8,y:e.y,vx:(P.x-e.x)/l*c.proj,vy:(P.y-e.y)/l*c.proj,d:Math.round(c.d*e.dm),c:c.proj>100?'#ffe66d':'#ff7a3c',age:0});sfx(c.proj>100?700:180,.12,'square',.03,c.proj>100?400:90)}
   if(c.tp){const nx=P.x-P.fx*28,ny=P.y-P.fy*28;spark(e.x,e.y,'#b05cff',14,14);if(!W.hit(nx,ny,e.hw,e.hh)){e.x=nx;e.y=ny}e.fx=P.fx;e.fy=P.fy;spark(e.x,e.y,'#b05cff',14,14)}}}
 else if(e.s==='act'){const c=e.cur;if(c.mv)W.move(e,e.fx*c.mv*dt,e.fy*c.mv*dt,e.hw,e.hh);
  if(!e.hd){const rx=P.x-e.x,ry=P.y-e.y,dd=Math.hypot(rx,ry)||1;if(dd<c.rng+7&&((rx*e.fx+ry*e.fy)/dd>.2||dd<10)){e.hd=true;hurtP(Math.round(c.d*e.dm),e)}}
  if(e.tm>=c.a){e.s='rec';e.tm=0}}
 else if(e.s==='rec'){if(e.tm>=e.cur.r*(ph&&e.ph===2?.7:1)){e.s='walk';e.cd=.3+R()*.6}}
 else if(e.s==='stg'){if(e.tm>=e.stgT){e.s='walk';e.rip=false;e.cd=.3}}
 if(e.arena&&W.arena){const a=W.arena;e.x=cl(e.x,(a.x+1)*16,(a.x+a.w-1)*16);e.y=cl(e.y,(a.y+1)*16,(a.y+a.h-1)*16)}}
// ---- flujo ----
function update(dt){
 if(G.msgT>0)G.msgT-=dt;if(G.banner){G.banner.l-=dt;if(G.banner.l<=0)G.banner=null}if(G.flash>0)G.flash-=dt;if(G.fade>0)G.fade-=dt;
 ambient(dt);
 PT.forEach(p=>{if(p.k==='soul'&&P){const dx=P.x-p.x,dy=P.y-(p.y-p.z*.3),d=Math.hypot(dx,dy)||1;p.age=(p.age||0)+dt;if(p.age>.5){p.vx+=dx/d*400*dt;p.vy+=dy/d*400*dt;p.vx*=.94;p.vy*=.94;p.vz*=.9;if(d<8)p.l=0}else{p.vz*=.96}p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;p.l-=dt;return}
  p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=(p.vz||0)*dt;if(p.k==='s'||p.k==='d')p.vz-=(p.k==='s'?220:0)*dt;if(p.z<0&&p.k==='s'){p.z=0;p.vz*=-.3;p.vx*=.6;p.vy*=.6}p.l-=dt});PT=PT.filter(p=>p.l>0);
 FX.forEach(f=>f.l-=dt);FX=FX.filter(f=>f.l>0);FT.forEach(f=>{f.l-=dt;f.y-=16*dt});FT=FT.filter(f=>f.l>0);
 if(G.mode!=='play'&&G.mode!=='dying')return;
 if(G.hs>0){G.hs-=dt;return}
 if(G.mode==='play')updP(dt);else{P.t+=dt;P.mvg=0}
 E.forEach(e=>updE(e,dt));
 for(let i=0;i<E.length;i++)for(let j=i+1;j<E.length;j++){const a=E[i],b=E[j];if(a.s==='dead'||b.s==='dead')continue;const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),m=a.hw+b.hw+2;if(d<m&&d>.01){const k=(m-d)*.25;W.move(a,-dx/d*k,-dy/d*k,a.hw,a.hh);W.move(b,dx/d*k,dy/d*k,b.hw,b.hh)}}
 E=E.filter(e=>!(e.s==='dead'&&e.tm>2.5&&!e.b));
 PR.forEach(q=>{q.age+=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;W.fly=true;const hh=W.hit(q.x,q.y,2,2);W.fly=false;if(hh||q.age>3)q.k=1;else if(Math.hypot(q.x-P.x,q.y-P.y)<7&&P.s!=='dead'){q.k=1;hurtP(q.d,{x:q.x-q.vx*.1,y:q.y-q.vy*.1,proj:1})}});PR=PR.filter(q=>!q.k);
 RK.forEach(r=>{r.t+=dt;if(r.t>=1){r.d=1;spark(r.x,r.y,'#ff9a6b',14,6);spark(r.x,r.y,'#6b5a4a',8,6);G.shake=3;FX.push({k:'ring',x:r.x,y:r.y,l:.35,m:.35,c:'255,150,100'});if(Math.hypot(P.x-r.x,P.y-r.y)<14&&!dodging()&&P.s!=='dead')takeHit(20,P.x-r.x,P.y-r.y)}});RK=RK.filter(r=>!r.d);
 if(S.drop&&S.drop.r===S.ri&&P.s!=='dead'&&Math.hypot(P.x-S.drop.x,P.y-S.drop.y)<14){S.souls+=S.drop.s;S.drop=null;toast('Almas recuperadas');sfx(400,.3,'sine',.05,800)}
 const tx=cl(P.x-GW/2,0,W.cols*16-GW),ty=cl(P.y-GH/2+6,0,W.rows*16-GH),k=Math.min(1,dt*7);cam.x+=(tx-cam.x)*k;cam.y+=(ty-cam.y)*k;
 if(G.wv&&!G.wv.boss&&!E.some(e=>e.wv&&e.s!=='dead')){G.wv.i++;if(G.wv.i<rg.waves.length)nextWave();else{G.wv.boss=true;startBoss()}}
 if(G.amb&&!E.some(e=>e.amb===G.amb.id&&e.s!=='dead')){const o=G.amb.o;S.am[G.amb.id]=1;if(o.souls)S.souls+=o.souls;if(o.frag)S.frag+=o.frag;toast('Emboscada superada'+(o.souls?' · +'+o.souls+' almas':'')+(o.frag?' · +'+o.frag+' fragmento(s)':''));G.amb=null;save()}
 if(G.chase){G.chase.r-=dt;if(G.chase.r<=0){G.chase.r=1.8;RK.push({x:P.x+(R()-.5)*60,y:P.y+(R()-.5)*40,t:0})}}
 if(G.win>0){G.win-=dt;if(G.win<=0){G.win=0;save();const c=CUT[G.winId];if(c)say(c())}}
 if(G.mode==='dying'){G.dieT-=dt;if(G.dieT<=0){S.flasks=S.fmax;loadRegion(S.bf.r,S.bf.x);openRest(true)}}}
// partículas ambientales según la región
function ambient(dt){if(!W||G.mode==='title'||PT.length>220)return;const t=W.th,n=t.pt;let rate=n==='ash'?14:n==='leaf'?7:n==='ember'?10:5;if(R()<rate*dt){const x=cam.x+R()*GW,y=cam.y+R()*GH;
 if(n==='ash')PT.push({k:'a',x,y,z:30+R()*20,vx:8+R()*8,vy:R()*6,vz:-(8+R()*10),l:4+R()*3,c:'rgba(180,170,170,.55)'});
 else if(n==='leaf')PT.push({k:'a',x,y,z:30+R()*20,vx:6+R()*10,vy:(R()-.5)*8,vz:-(7+R()*8),l:5+R()*3,c:R()<.5?'rgba(120,140,60,.7)':'rgba(90,110,60,.6)'});
 else if(n==='ember')PT.push({k:'a',x,y,z:0,vx:(R()-.5)*8,vy:0,vz:10+R()*14,l:3+R()*2,c:'rgba(255,140,80,.8)'});
 else PT.push({k:'a',x,y,z:10+R()*20,vx:(R()-.5)*5,vy:(R()-.5)*3,vz:(R()-.5)*3,l:5+R()*3,c:'rgba(200,190,240,.35)'})}}
// ---- diálogo y menús (HTML) ----
function say(n){if(!n)return;G.mode='dlg';G.nd=n;const d=$('dlg');d.style.display='block';
 d.innerHTML=(n.n?'<b>'+n.n+'</b>':'')+'<p>'+n.t+'</p>'+(n.o?n.o.map((o,i)=>'<button onclick="pick('+i+')">'+o[0]+'</button>').join(''):'<button onclick="pick(-1)">Continuar</button>')}
function pick(i){const n=G.nd;$('dlg').style.display='none';G.mode='play';relAll();const f=i>=0?n.o[i][1]:null;let nx=f?f():(i<0?n.nx:null);if(typeof nx==='function')nx=nx();if(nx)say(nx);save()}
function closeM(){if(window.hideIntro)hideIntro();$('menu').style.display='none';G.mode='play';relAll();save()}
function openRest(dead){G.mode='menu';const m=$('menu'),lv=60+40*(S.A.vig+S.A.res+S.A.fue),uc=(S.up[S.weapon]||0)+1;m.style.display='flex';m.classList.remove('tt');
 let h='<div class="card"><h1>'+(dead?'Has caído':'Hoguera')+'</h1><p>'+S.name+' · Almas '+S.souls+' · Fragmentos '+S.frag+'</p>';
 h+='<div class="row"><button onclick="openDiary(\'mem\',\'rest\')">Diario</button><button onclick="openDiary(\'map\',\'rest\')">Mapa</button><button onclick="waitTime()">'+(S.night?'Esperar al alba':'Esperar la noche')+'</button></div><h2>Juramento</h2>';
 for(const k in OATHS){const ok=S.oaths.includes(k);h+='<button class="oath'+(S.oath===k?' sel':'')+'" '+(ok?'':'disabled ')+'onclick="eqO(\''+k+'\')"><b>'+OATHS[k][0]+'</b>'+(ok?OATHS[k][1]:'Aún no descubierto')+'</button>'}
 h+='<button class="oath" onclick="eqO(\'\')">Sin juramento</button><h2>Atributos · '+lv+' almas</h2><div class="row">'+[['vig','Vida +10'],['res','Resist. +8'],['fue','Fuerza +8%']].map(a=>'<button '+(S.souls<lv?'disabled ':'')+'onclick="buy(\''+a[0]+'\')">'+a[1]+' ('+S.A[a[0]]+')</button>').join('')+'</div><h2>Arma</h2>';
 h+=S.wpns.map(w=>{const W_=WP[w],up=S.up[w]||0,lo=(W_.lore||[]).filter((t,i)=>up>=i*2).join(' ');return '<button class="oath'+(S.weapon===w?' sel':'')+'" onclick="eqW(\''+w+'\')"><b>'+W_.n+' +'+up+'</b>'+W_.d+(lo?'<span class="lore">'+lo+'</span>':'')+'</button>'}).join('');
 h+='<button '+(S.frag<uc||uc>5?'disabled ':'')+'onclick="upg()">Mejorar arma (+12% daño, revela su historia) · '+uc+' fragmento(s)</button>';
 h+='<h2>Reliquias · '+S.rel.length+'/2</h2>'+(S.relOwn.length?S.relOwn.map(r=>'<button class="oath'+(hasR(r)?' sel':'')+'" onclick="togR(\''+r+'\')"><b>'+RELS[r][0]+'</b>'+RELS[r][1]+'</button>').join(''):'<p class="hint">Aún no tienes reliquias. Explora y busca lo que otros no ven.</p>');
 h+='<h2>Viajar</h2>';
 h+=S.fires.map(f=>{const[r,x]=f.split(':');return '<button class="oath" onclick="trav('+r+','+x+')">'+RG[r].n+((RG[r].fl&&RG[r].fl[x])||(x==0?'':' · antes del jefe'))+'</button>'}).join('');
 m.innerHTML=h+'<button id="go" onclick="closeM()">Continuar</button></div>'}
const togR=r=>{if(hasR(r))S.rel=S.rel.filter(x=>x!==r);else if(S.rel.length<2)S.rel.push(r);else toast('Solo puedes llevar 2 reliquias');openRest()};
function waitTime(){S.night=S.night?0:1;P.hp=P.mhp;P.st=P.mst;S.flasks=S.fmax;spawnEn();toast(S.night?'Cae la noche sobre el reino':'Amanece');openRest()}
const eqO=k=>{S.oath=k;W.applyDyn();W.bake();openRest()},eqW=w=>{S.weapon=w;openRest()},upg=()=>{const u=(S.up[S.weapon]||0)+1;S.frag-=u;S.up[S.weapon]=u;openRest()};
const buy=a=>{const lv=60+40*(S.A.vig+S.A.res+S.A.fue);if(S.souls>=lv){S.souls-=lv;S.A[a]++;P.mhp=mhp();P.mst=mst();P.hp=P.mhp;P.st=P.mst;openRest()}};
const trav=(r,x)=>{S.flasks=S.fmax;loadRegion(r,x);closeM()};
function newGame(name){S=DEF();S.name=name||'Sin nombre';W=null;loadRegion(0,0);S.seen={};closeM();say(INTRO())}
function cont(){S=load();if(S.bk&&S.bk.rey){S.reyDone=1;delete S.bk.rey}W=null;loadRegion(S.bf.r,S.bf.x);closeM()}
function fin(k){const e=typeof ENDS[k]==='function'?ENDS[k]():ENDS[k];ach('fin');save();G.mode='end';const m=$('menu');m.style.display='flex';
 m.innerHTML='<div class="card"><h2>Final</h2><h1>'+e[0]+'</h1><p>'+e[1]+'</p><button id="go" onclick="showTitle()">Volver al título</button></div>'}
// efectos de sonido en acciones clave
{const h=hitE,t=takeHit,b=bossDown,f=bonfire,hp=hurtP;
 hitE=(e,d,k,v)=>{sfx(240,.12,'sawtooth',.05,70);h(e,d,k,v)};takeHit=(d,x,y)=>{sfx(130,.3,'sawtooth',.08,40);t(d,x,y)};
 bossDown=e=>{sfx(110,1.2,'triangle',.1,520);b(e)};bonfire=x=>{sfx(330,.5,'sine',.06,660);f(x)};
 hurtP=(d,e)=>{if(held.block&&P.bt<.2&&!dodging())sfx(900,.15,'triangle',.06,1500);hp(d,e)}}
