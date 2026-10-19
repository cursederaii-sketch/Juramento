// ===== PANTALLA DE «HAS CAÍDO» (v8.38) =====
//  0) NUEVO: antes de todo, un corazón (anatómico, pixel art) late, se agrieta y se rompe en dos (HB segundos). Al romperse arranca (1).
//  1) dyingScreen(): lo que se ve durante la muerte (2,7 s): flash rojo, el mundo se apaga y pierde color, viñeta de sangre,
//     barras de cine, calavera pixelada, título extruido con glitch, ceniza y almas que suben, almas perdidas y dónde recuperarlas.
//  2) la tarjeta del menú al reaparecer (openRest(true)) con tema carmesí, calavera y resumen de la caída.
(function(){
const HB=1.8,DT=2.7,PI=Math.PI,sin=Math.sin,cos=Math.cos,rd=Math.round;
const cl_=(v,a,b)=>Math.max(a,Math.min(b,v));
const SK=['0000011111100000','0001111111111000','0011111111111100','0111111111111110','0111111111111110','0111001111001110','0110000110000110','0110000110000110','0111001111001110','0011111001111100','0001111111111000','0001011111101000','0001010110101000','0000111111110000'];
window.DIE_TOTAL=HB+DT; // game.js lee esto: duración total de la muerte
const hs=n=>{const x=sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)};
const FR_=['Las cenizas te recuerdan.','Otro nombre que el olvido casi se lleva.','El juramento no se rompe: se vuelve a jurar.','La hoguera sigue encendida para ti.','Cada caída deja una marca.','Levántate. Alguien todavía te espera.'];

function skull(x,y,k,al,glowA){ // calavera pixelada centrada en (x,y)
 const w=16*k,h=14*k,X=rd(x-w/2),Y=rd(y-h/2);
 g.globalAlpha=al;
 for(let j=0;j<SK.length;j++)for(let i=0;i<16;i++)if(SK[j][i]==='1'){g.fillStyle=j<5?'#f2e8dc':j<9?'#d6c8b8':'#a89888';g.fillRect(X+i*k,Y+j*k,k,k)}
 g.fillStyle='#2a0610';g.fillRect(X+4*k,Y+5*k,2*k,k);g.fillRect(X+10*k,Y+5*k,2*k,k); // cuencas más hondas
 const f=.65+.35*sin(performance.now()/110);
 g.fillStyle='rgba(255,'+rd(60+60*f)+',70,'+(.55+.45*f).toFixed(2)+')';g.fillRect(X+4*k,Y+6*k,2*k,2*k);g.fillRect(X+10*k,Y+6*k,2*k,2*k); // brasas en los ojos
 if(glowA>0)glow(x,y,34*k/3+18,'210,36,64',glowA*(.7+.3*f));
 g.globalAlpha=1}

function title(txt,cx,cy,sz,al,t){ // título con extrusión carmesí, degradado y glitch esporádico
 g.save();g.globalAlpha=al;g.font=sz+'px '+FONT;g.textAlign='center';g.textBaseline='alphabetic';
 const gl=(t%1.9)>1.78||(t%5.3)>5.22,ox=gl?(hs(rd(t*30))>.5?2:-2):0;
 if(gl){g.fillStyle='rgba(0,230,255,.7)';g.fillText(txt,cx-2,cy);g.fillStyle='rgba(255,40,70,.8)';g.fillText(txt,cx+2,cy+1)}
 const sh=['#3a0612','#4a0a18','#5e0e20','#760f26','#8e142e','#a41a36'];
 for(let i=sh.length;i>=1;i--){g.fillStyle=sh[i-1];g.fillText(txt,cx+ox,cy+i)}
 g.fillStyle='#14040a';for(const[dx,dy]of[[-1,0],[1,0],[0,-1]])g.fillText(txt,cx+ox+dx,cy+dy);
 const q=g.createLinearGradient(0,cy-sz,0,cy+2);q.addColorStop(0,'#ffe6e6');q.addColorStop(.35,'#ff6a7a');q.addColorStop(.75,'#d02a44');q.addColorStop(1,'#8a1428');
 g.fillStyle=q;g.fillText(txt,cx+ox,cy);g.restore()}


// ---------- corazón que se rompe ----------
const HR=['0000055550044000','0000556655044400','0000560055544400','0011155115554000','0122211222211100','1222322222221110','1223332222222210','1223332222222210','1222322222222110','0122222222221110','0122222222221100','0112222222211000','0011222222110000','0001122221100000','0000112211000000','0000011110000000'];
const HC={1:'#4a0814',2:'#a8132a',3:'#e8485a',4:'#3b2a6b',5:'#c9202f',6:'#ff7a80'};
const CRK=[[8,0.5],[7,3],[9,5],[7,7.5],[9,10],[8,12.5],[8,15.5]]; // grieta en coords del corazón
const bump=(t,c,w)=>{const d=(t-c)/w;return Math.exp(-d*d)};
function heartHalf(x,y,k,al,side){ // side: 0 entero, -1 mitad izquierda, 1 mitad derecha (centrado en x,y)
 g.globalAlpha=al;const X=-8*k,Y=-8*k;
 for(let j=0;j<16;j++)for(let i=0;i<16;i++){const c=HR[j][i];if(c==='0')continue;
  if(side<0&&i>7)continue;if(side>0&&i<8)continue;
  g.fillStyle=(c==='2'&&i===7&&j>=4&&j<=13)?HC[1]:HC[c];g.fillRect(X+i*k,Y+j*k,k,k)}
 g.globalAlpha=1}
function heartPhase(hp){
 const cx=GW/2,cy=GH/2-6,k=4,BRK=1.05,t=performance.now()/1000;
 // sonido: latidos y rotura (una vez por cruce de tiempo)
 if(hp<(heartPhase.pv||0))heartPhase.pv=0;
 const hit=(a)=>(heartPhase.pv||0)<a&&hp>=a;
 try{if(hit(.30)||hit(.74))sfx(70,.14,'sine',.10,45);if(hit(.46)||hit(.88))sfx(58,.12,'sine',.08,40);if(hit(BRK)){sfx(150,.45,'sawtooth',.08,35);sfx(1100,.12,'square',.04,240)}}catch(e){}
 heartPhase.pv=hp;
 // el mundo se apaga y pierde color mientras late
 const dim=cl_(hp/.45,0,1)*.55+cl_((hp-BRK)/.7,0,1)*.07;
 try{g.globalCompositeOperation='saturation';g.fillStyle='rgba(128,128,128,'+(cl_(hp/.6,0,1)*.5).toFixed(2)+')';g.fillRect(0,0,GW,GH)}catch(e){}
 g.globalCompositeOperation='source-over';
 g.fillStyle='rgba(6,0,6,'+dim.toFixed(2)+')';g.fillRect(0,0,GW,GH);
 const bt=bump(hp,.30,.05)+bump(hp,.46,.05)*.7+bump(hp,.74,.04)*.8+bump(hp,.88,.04)*.5;
 {const a=cl_(hp/.4,0,1)*(.55+.35*bt),q=g.createRadialGradient(GW/2,GH/2,GH*.18,GW/2,GH/2,GW*.6);q.addColorStop(0,'rgba(90,0,16,0)');q.addColorStop(1,'rgba(150,8,30,'+(.6*a).toFixed(2)+')');g.fillStyle=q;g.fillRect(0,0,GW,GH)}
 // barras de cine entran con el corazón
 {const b=rd(cl_(hp/.6,0,1)*30);fr(0,0,GW,b,'#050005');fr(0,GH-b,GW,b,'#050005');if(b>3){fr(0,b,GW,1,'#5a0e1e');fr(0,GH-b-1,GW,1,'#5a0e1e')}}
 if(hp<BRK){ // ---- late, se agrieta, tiembla
  const ap=cl_(hp/.3,0,1),sc=(.8+.2*ap)*(1+.16*bt),cp=cl_((hp-.62)/.43,0,1);
  const sh=cp>0?(cp*1.6*(hs(rd(t*40))-.5)*2):0,sy=cp>0?(cp*1.2*(hs(rd(t*40)+9)-.5)*2):0;
  glow(cx,cy,70+bt*18,'210,24,52',(.30+.22*bt)*ap);
  g.save();g.translate(rd(cx+sh),rd(cy+sy));g.scale(sc,sc);heartHalf(0,0,k,ap,0);
  if(cp>0){ // grieta que crece de arriba a abajo
   const n=cp*(CRK.length-1),m=Math.floor(n);g.lineCap='square';g.lineJoin='miter';
   for(const[col,w]of[['#14040a',2.6],['#ff8a92',1]]){g.strokeStyle=col;g.lineWidth=w*(k/4);g.beginPath();
    for(let i=0;i<=m;i++){const px=(CRK[i][0]-8)*k,py=(CRK[i][1]-8)*k;i?g.lineTo(px,py):g.moveTo(px,py)}
    if(m<CRK.length-1){const f=n-m,a=CRK[m],b=CRK[m+1];g.lineTo((a[0]+(b[0]-a[0])*f-8)*k,(a[1]+(b[1]-a[1])*f-8)*k)}
    g.stroke()}
   if(cp>.15)glow(0,0,26,'255,60,70',.35*cp)}
  g.restore();
  // gota que cae del corazón al latir fuerte
  if(hp>.5){const dp=((hp-.5)*1.4)%1,dx=cx-2+rd(hs(rd((hp-.5)*1.4-dp)+3)*8),dyy=cy+16+dp*dp*70;g.globalAlpha=1-dp;fr(dx,dyy,2,3,'#c9202f');g.globalAlpha=1}
 }else{ // ---- se rompe: onda, destello, mitades que caen y esquirlas
  const ag=hp-BRK,e=cl_(ag/.7,0,1);
  if(ag<.28){g.fillStyle='rgba(255,70,80,'+((1-ag/.28)*.65).toFixed(2)+')';g.fillRect(0,0,GW,GH)}
  glow(cx,cy,60+ag*120,'210,24,52',.5*(1-e));
  g.strokeStyle='rgba(255,106,122,'+((1-e)*.8).toFixed(2)+')';g.lineWidth=2*(1-e)+.5;g.beginPath();g.arc(cx,cy,ag*210,0,PI*2);g.stroke();
  const fa=ag<.35?1:cl_(1-(ag-.35)/.35,0,1),dyh=.5*190*ag*ag;
  for(const sd of[-1,1]){g.save();g.translate(cx+sd*(2+ag*42),cy+dyh);g.rotate(sd*Math.min(ag,.9)*1.25);heartHalf(0,0,k,fa,sd);g.restore()}
  g.globalCompositeOperation='lighter';
  for(let i=0;i<34;i++){const a=hs(i+21)*PI*2,v=40+hs(i+55)*120,px=cx+Math.cos(a)*v*ag,py=cy+Math.sin(a)*v*ag*.85+.5*210*ag*ag,al=cl_(1-ag/(.35+hs(i+7)*.55),0,1);
   if(al<=0)continue;g.fillStyle=(i%3===0?'rgba(255,120,120,':'rgba(200,28,50,')+al.toFixed(2)+')';const z=1+(i%4===0)+(i%7===0);g.fillRect(rd(px),rd(py),z,z+(i%2))}
  g.globalCompositeOperation='source-over';
 }
 // oscurece al final para que la calavera arranque desde la oscuridad
 const out=cl_((hp-(HB-.5))/.5,0,1);if(out>0){g.fillStyle='rgba(6,0,6,'+(out*.45).toFixed(2)+')';g.fillRect(0,0,GW,GH)}
}

window.dyingScreen=function(){G.banner=null;G.msgT=0;
 const T=window.DIE_TOTAL||(HB+DT),ela=cl_(T-G.dieT,0,T);
 if(ela<HB){heartPhase(ela);return} // 0) el corazón se rompe; al terminar arranca la pantalla de muerte
 const el=cl_(ela-HB,0,DT),t=performance.now()/1000;
 const dark=cl_(.62+el*.28,0,.9); // continúa oscuro desde la fase del corazón
 // 0) flash rojo al aparecer la calavera
 if(el<.3){g.fillStyle='rgba(255,50,70,'+((1-el/.3)*.4).toFixed(2)+')';g.fillRect(0,0,GW,GH)}
 // 1) el mundo se apaga y pierde el color
 try{g.globalCompositeOperation='saturation';g.fillStyle='rgba(128,128,128,'+cl_(.5+el*.8,0,.9).toFixed(2)+')';g.fillRect(0,0,GW,GH)}catch(e){}
 g.globalCompositeOperation='source-over';
 g.fillStyle='rgba(6,0,6,'+dark.toFixed(2)+')';g.fillRect(0,0,GW,GH);
 // 2) viñeta de sangre que late
 {const a=cl_(el*.8,0,1)*(.8+.2*sin(t*3.2)),q=g.createRadialGradient(GW/2,GH/2,GH*.2,GW/2,GH/2,GW*.62);q.addColorStop(0,'rgba(90,0,16,0)');q.addColorStop(1,'rgba(120,6,28,'+(.62*a).toFixed(2)+')');g.fillStyle=q;g.fillRect(0,0,GW,GH)}
 // 3) barras de cine
 {const b=rd(cl_(el/.7,0,1)*30);fr(0,0,GW,b,'#050005');fr(0,GH-b,GW,b,'#050005');if(b>3){fr(0,b,GW,1,'#5a0e1e');fr(0,GH-b-1,GW,1,'#5a0e1e')}}
 // 4) ceniza y almas que suben (determinista por índice, sin estado)
 g.globalCompositeOperation='lighter';
 for(let i=0;i<54;i++){const sp=.07+hs(i+1)*.16,ph=(el*sp+hs(i+9))%1,x=(hs(i+3)*GW+sin(el*1.3+i)*9),y=GH+6-ph*(GH+12),a=sin(ph*PI)*cl_(el*1.6,0,1);
  if(i%4===0){g.fillStyle='rgba(176,120,255,'+(a*.7).toFixed(2)+')';g.fillRect(rd(x),rd(y),2,3);g.fillStyle='rgba(176,120,255,'+(a*.18).toFixed(2)+')';g.fillRect(rd(x)-1,rd(y)-1,4,5)}
  else{g.fillStyle='rgba(255,'+rd(90+hs(i)*90)+',60,'+(a*.75).toFixed(2)+')';g.fillRect(rd(x),rd(y),1+(i%3===0),1)}}
 g.globalCompositeOperation='source-over';
 // 5) calavera, línea decorativa y título
 const cx=GW/2,cy=GH/2,e1=cl_((el-.35)/.5,0,1),e2=cl_((el-.55)/.45,0,1),e3=cl_((el-1)/.6,0,1);
 if(e1>0)skull(cx,cy-50-(1-e1)*10,3,e1,.38*e1);
 if(e2>0){const w=(GW*.36)*e2;for(const yy of[cy-22,cy+17]){fr(cx-w,yy,w*2,1,'#a41a36');fr(cx-w+8,yy+1,w*2-16,1,'#4a0a18');
   fr(cx-3,yy-2,6,5,'#0b0714');g.fillStyle='#ff6a7a';g.beginPath();g.moveTo(cx,yy-3);g.lineTo(cx+3,yy);g.lineTo(cx,yy+3);g.lineTo(cx-3,yy);g.fill()}
  glow(cx,cy-2,130,'192,30,56',.32*e2);
  const sc=1+(1-e2)*.35;g.save();g.translate(cx,cy);g.scale(sc,sc);title(sp_('HAS CAÍDO'),0,10,17,e2,t);g.restore()}
 // 6) almas perdidas y dónde recuperarlas
 if(e3>0){const d=S.drop;g.globalAlpha=e3;
  if(d&&d.s>0){const nm=(RG[d.r]&&RG[d.r].n)||'';tx(d.s+' almas se dispersan',cx,cy+34,'#c9b8ff','center',8);tx('Recupéralas en '+nm,cx,cy+48,'#8a7aa8','center',6)}
  else tx(FR_[(S.st.deaths||0)%FR_.length],cx,cy+36,'#8a7aa8','center',6);
  g.globalAlpha=1}
 // 7) fundido final hacia la hoguera
 if(G.dieT<.35){g.fillStyle='rgba(0,0,0,'+(1-G.dieT/.35).toFixed(2)+')';g.fillRect(0,0,GW,GH)}
};

// ---------- tarjeta del menú al reaparecer ----------
{const o=openRest;openRest=function(dead){const r=o.apply(this,arguments);
 try{if(dead){const m=document.getElementById('menu'),cd=m&&m.querySelector('.card');if(cd&&!cd.querySelector('.dd')){cd.classList.add('dead');
  const h1=cd.querySelector('h1'),n=S.st.deaths||1,d=S.drop;
  let sv='<svg viewBox="0 0 16 14" width="64" height="56" shape-rendering="crispEdges" aria-hidden="true">';
  for(let j=0;j<SK.length;j++)for(let i=0;i<16;i++)if(SK[j][i]==='1')sv+='<rect x="'+i+'" y="'+j+'" width="1" height="1" fill="'+(j<5?'#f2e8dc':j<9?'#d6c8b8':'#a89888')+'"/>';
  sv+='<rect x="4" y="5" width="2" height="1" fill="#2a0610"/><rect x="10" y="5" width="2" height="1" fill="#2a0610"/><rect class="oj" x="4" y="6" width="2" height="2" fill="#ff5a5a"/><rect class="oj" x="10" y="6" width="2" height="2" fill="#ff5a5a"/></svg>';
  const info=(d&&d.s>0)?'<b>'+d.s+'</b> almas quedaron en <b>'+((RG[d.r]&&RG[d.r].n)||'?')+'</b>.<br>Recupéralas antes de caer otra vez.':'No llevabas almas contigo.';
  const box=document.createElement('div');box.className='dd';
  box.innerHTML=sv+'<div class="ddt"><span>Caída nº '+n+'</span><p>'+info+'</p><i>'+FR_[(n-1)%FR_.length]+'</i></div>';
  h1.insertAdjacentElement('afterend',box)}}}catch(e){console.error('GAMEOVER',e)}
 return r}}
})();
