// ===== FORMAS DE LAS ARMAS: cada arma del jugador se dibuja con su propia silueta =====
// Carga DESPUÉS de render.js (y de todo lo que redefina weapon). render.js elige la forma con WSHAPE[S.weapon].
// Las armas básicas (corta, larga) siguen siendo la espada de siempre.
(function(){
const WSHAPE={lanza:'w_lanza',mandoble:'w_mandoble',caballero:'w_caballero',hoz:'w_hoz',estoque:'w_estoque',cuchilla:'w_cuchilla',cirial:'w_cirial',pluma:'w_pluma',mandibula:'w_mandibula',pico:'w_pico',arpon:'w_arpon'};
window.WSHAPE=WSHAPE;
const w0=weapon;
weapon=function(k,ox,oy,a,len,o){
 o=o||{};
 if(typeof k!=='string'||k.indexOf('w_')!==0)return w0(k,ox,oy,a,len,o);
 const c=Math.cos(a),s=Math.sin(a),pp=(t,w=0)=>[ox+c*t-s*w,oy+s*t+c*w],L=(t0,w0_,t1,w1,col,th=1)=>{const A=pp(t0,w0_),B=pp(t1,w1);pline(g,A[0],A[1],B[0],B[1],col,th)};
 const shaft=(c1='#5a4630')=>L(-4,0,len-2,0,c1,2);
 if(k==='w_lanza'){shaft('#6a4a2e');L(len-3,0,len+3,0,'#8d98ad',3);L(len+3,0,len+8,0,'#f4f8ff',2);L(len,-3,len,3,'#c9a54a',1);L(len+3,-.5,len+8,-.5,'#f4f8ff',1);glow(...pp(len+5,0),10,'180,220,255',.2)}
 else if(k==='w_mandoble'){L(-4,0,1,0,'#2a2438',2);L(2,-4,2,4,'#6a5a9a',2);L(3,0,3+len,0,'#4a4066',4);L(3,-1,3+len,-1,'#a898e0',1);L(3+len,0,6+len,0,'#d8ccff',2);glow(...pp(len*.6,0),16,'150,120,255',.35)}
 else if(k==='w_caballero'){L(-4,0,1,0,'#4a2a2a',2);L(2,-4,2,4,'#c9a54a',2);L(3,0,3+len,0,'#9aa0b4',3);L(3,-1,3+len,-1,'#ffe0e8',1);L(3+len,0,5+len,0,'#ffe0e8',1);
  for(let i=0;i<4;i++){const p=pp(5+i*len/4,((i%2)?2:-2));fr(p[0],p[1],1,1,'#6a6a78')}glow(...pp(len*.55,0),14,'255,60,90',.35)}
 else if(k==='w_hoz'){shaft('#d8d0b8');const n=8;let px=null;for(let i=0;i<=n;i++){const u=i/n,t=len-3+Math.sin(u*1.6)*10,w=-u*u*13,p=pp(t,w);if(px)pline(g,px[0],px[1],p[0],p[1],'#f0ead8',2);px=p}
  const p=pp(len+3,-12);fr(p[0],p[1],1,1,'#fff');glow(...pp(len+4,-8),10,'200,255,200',.18)}
 else if(k==='w_estoque'){L(-4,0,1,0,'#5a4630',2);L(1,-4,1,4,'#c9a54a',1);L(0,-3,3,-4,'#c9a54a',1);L(0,3,3,4,'#c9a54a',1);L(3,0,3+len,0,'#cfd6e8',1);L(3,-.5,3+len,-.5,'#ffffff',1);glow(...pp(len,0),8,'200,220,255',.2)}
 else if(k==='w_cuchilla'){L(-4,0,2,0,'#5a4630',2);L(3,0,3+len,0,'#7a8094',6);L(3,-3,3+len,-3,'#d0d6e6',1);L(3,3,3+len,3,'#3a3e4e',1);L(3+len,-3,3+len,3,'#e8ecf8',1)}
 else if(k==='w_cirial'){shaft('#8a6a3a');const p=pp(len+2,0);disc(g,Math.round(p[0]),Math.round(p[1]),4,'#c9a54a');disc(g,Math.round(p[0]),Math.round(p[1]),2,'#ffe9a0');L(len-2,-3,len-2,3,'#c9a54a',1);glow(p[0],p[1],14,'255,220,120',.35)}
 else if(k==='w_pluma'){L(-3,0,1,0,'#5a4630',1);L(1,-2,1,2,'#c9a54a',1);L(2,0,2+len,0,'#dfe6f2',1);for(let i=0;i<5;i++){const t=4+i*len/6;L(t,0,t+3,-3,'#aebad0',1);L(t,0,t+3,3,'#aebad0',1)}L(2+len,0,5+len,0,'#ffffff',1)}
 else if(k==='w_mandibula'){shaft('#3a2a24');for(const sg of[-1,1]){let px=null;for(let i=0;i<=6;i++){const u=i/6,p=pp(len-4+u*9,sg*(7-u*6.5)+sg*Math.sin(u*3)*0);if(px)pline(g,px[0],px[1],p[0],p[1],'#c8a060',2);px=p}}glow(...pp(len+2,0),9,'255,190,90',.2)}
 else if(k==='w_arpon'){shaft('#2a2430');L(-4,0,-1,0,'#5a4630',2);for(let i=0;i<3;i++){const t=2+i*3;L(t,-2,t,2,'#8a7a5a',1)}L(len-3,0,len+4,0,'#1a1a24',3);L(len+4,0,len+10,0,'#cfd6e8',2);L(len+4,-.5,len+10,-.5,'#ffffff',1);
  for(const sg of[-1,1]){L(len+2,sg*1,len-1,sg*6,'#9aa0b4',2);L(len-1,sg*6,len-3,sg*5,'#cfd6e8',1)}glow(...pp(len+6,0),11,'170,120,255',.3)}
 else if(k==='w_pico'){shaft('#6a4a2e');L(len-3,-8,len-3,8,'#8a8a98',3);L(len-3,-8,len+2,-10,'#c0c0cc',2);L(len-3,8,len+2,10,'#c0c0cc',2);L(len-4,-8,len-4,8,'#d8d8e4',1)}
};
// Brasa: el filo del arma arde con un brillo rojo (aviso visual de la reliquia)
})();
