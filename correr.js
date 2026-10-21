// ===== CORRER =====
// Shift (PC) mantenida · botón "Correr" en pantalla táctil (alterna: toque = activar/desactivar) · L3 en mando.
// Velocidad ×1.5 gastando resistencia (16/s, la regeneración espera 0,45 s); si se agota, hay que recuperar hasta 30 para volver a correr.
// La lógica de velocidad vive en updP (game.js, p.run); aquí: tecla, botón, mando y animación (inclinación, polvo, líneas de velocidad).
(function(){
if(typeof update==='undefined'||typeof drawP==='undefined'||typeof drawFX==='undefined'||typeof CFG==='undefined')return;
const RUNT=window.RUNT={on:false,gp:false};
CFG.keys.run=CFG.keys.run||['shift'];buildKM();
addEventListener('blur',()=>{held.run=0});
const b=document.querySelector('#ac button[data-r="run"]');
if(b){const tg=e=>{e.preventDefault();RUNT.on=!RUNT.on;b.classList.toggle('on',RUNT.on);try{buzz(8)}catch(_){}};
 if(window.PointerEvent)b.addEventListener('pointerdown',tg);else b.addEventListener('touchstart',tg,{passive:false});
 b.addEventListener('touchstart',e=>e.preventDefault(),{passive:false});b.addEventListener('contextmenu',e=>e.preventDefault())}

// inclinación hacia delante al correr
{const _d=drawP;drawP=function(){const p=P;if(!p||!p.run||p.s!=='idle')return _d.apply(this,arguments);
 const x=Math.round(p.x),y=Math.round(p.y);g.save();g.translate(x,y);g.transform(1,0,-.17*(p.fx||0),1,0,0);g.translate(-x,-y);
 try{return _d.apply(this,arguments)}finally{g.restore()}}}

// líneas de velocidad
{const d0=drawFX;drawFX=function(f){if(f.k!=='xsl')return d0(f);const p=1-f.l/f.m,L=Math.round(8+6*p);
 g.fillStyle='rgba(235,235,255,'+(.3*(1-p)).toFixed(3)+')';
 if(f.dx)g.fillRect(Math.round(f.x+(f.dx>0?0:-L)),Math.round(f.y),L,1);else g.fillRect(Math.round(f.x),Math.round(f.y+(f.dy>0?0:-L)),1,L)}}

let ts=0,td=0;
{const u=update;update=function(dt){u.call(this,dt);try{
 if(navigator.getGamepads&&document.body.classList.contains('gp')){let on=false;for(const q of navigator.getGamepads()){if(q&&q.buttons[10]&&q.buttons[10].pressed){on=true;break}}RUNT.gp=on}else RUNT.gp=false;
 if(G.mode!=='play'||!P||!P.run){ts=td=0;return}
 ts+=dt;td+=dt;const fx=P.fx||0,fy=P.fy||0;
 if(td>.09&&PT.length<300){td=0;PT.push({k:'d',x:P.x-fx*4,y:P.y,z:2,vx:-fx*22+(R()-.5)*14,vy:-fy*12+(R()-.5)*8,vz:8+R()*10,l:.4,c:'rgba(190,175,150,.45)'})}
 if(ts>.07&&FX.length<60){ts=0;FX.push(fx?{k:'xsl',x:P.x-fx*6,y:P.y-4-R()*14,dx:-fx,dy:0,l:.25,m:.25}:{k:'xsl',x:P.x+(R()-.5)*14,y:P.y-fy*6-8,dx:0,dy:-fy,l:.25,m:.25})}
}catch(e){if(!update.err){update.err=1;console.error('CORRER',e)}}}}
})();
