// ===== ENEMIGOS FLUIDOS · paso 2 (enemigos normales adaptados al combate fluido + postura) =====
// Cargar DESPUÉS de combate_fluido.js. Mismo estilo: envuelve updE / hitE / hurtP / update / drawE y ajusta datos (TY, ATK, DIF.pat).
//
//  LECTURA DEL ATAQUE
//   · ATAQUE ROJO (!): no se puede parar. Estocada del soldado/vigía, golpe brutal, temblor y embestida del bruto. Hay que esquivar.
//     Los demás ataques sí se pueden parar (la parada rompe su postura).
//  ROLES
//   · Soldado / Vigía: se cubren con escudo tras recibir golpes. Los golpes ligeros de frente casi no hacen daño ni postura
//     y te cuestan resistencia; el golpe PESADO rompe la guardia, y por la espalda (Corte de paso) no hay guardia.
//   · Vacío: rápido y escurridizo. Rodea al jugador y, tras embestir, a veces se retira (golpea y huye). Postura muy baja.
//   · Arquero: ahora también lanza una descarga de 3 flechas en abanico.
//   · Bruto: alterna golpe, temblor (área) y golpe brutal. Postura alta; no sale volando: hay que romperle la postura.
(function(){
if(typeof CFLU==='undefined'||typeof DIF==='undefined'||!DIF.on)return;
const CF=CFLU,isCl=()=>typeof NET!=='undefined'&&NET.on&&!NET.host;
const rnd=(a,b)=>a+R()*(b-a);

// ---------- datos ----------
Object.assign(ATK,{
 thrust:{w:.72,a:.22,r:.85,d:19,rng:34,sd:72,mv:150,unb:1},       // estocada con avance (roja)
 volley:{w:.8,a:.1,r:.95,d:10,proj:140,sd:150,vol:1}});            // descarga de 3 flechas
for(const k of['crush','quake','charge'])if(ATK[k])ATK[k].unb=1;
Object.assign(TY.soldier,{mpo:30});Object.assign(TY.hollow,{mpo:16});Object.assign(TY.archer,{mpo:18});
Object.assign(TY.warden,{mpo:34});Object.assign(TY.brute,{mpo:72});
Object.assign(DIF.pat,{
 soldier:['jab','chop','slash','thrust','jab','slash'],
 warden:['slash','jab','thrust','chop'],
 hollow:['lunge','jab','lunge','lunge'],
 archer:['arrow','arrow','volley'],
 brute:['smash','quake','crush','smash']});
const GUARD={dur:1.5,cd:3.4,chance:.4,lightDmg:.25,lightPo:4,lightStam:4,heavyPo:40,types:['soldier','warden']};
const HOLLOW={strafe:.55,retreat:.45,retreatP:.6,retreatSp:1.6};
CF.enemy={GUARD,HOLLOW};

// ---------- hitE: guardia ----------
{const h2=hitE;hitE=function(e,d,kb,hv){
  if(isCl()||!e||e.s==='dead'||e.b||!(e.gd>0)||e.brk||G.ulting)return h2.call(this,e,d,kb,hv);
  const dist=Math.hypot(P.x-e.x,P.y-e.y)||1,front=((P.x-e.x)*e.fx+(P.y-e.y)*e.fy)/dist>.35;
  if(!front)return h2.call(this,e,d,kb,hv);
  if(hv&&G.src!=='wave'){                                   // pesado: rompe la guardia
   e.gd=0;e.gcd=GUARD.cd;h2.call(this,e,d*1.1,kb,hv);
   if(e.s!=='dead'){CF.addPost(e,GUARD.heavyPo);ftext(e.x,e.y-(TY[e.t]?TY[e.t].h:22)-26,'¡Guardia rota!','#9ad0ff');spark(e.x+e.fx*8,e.y-10,'#cfe3ff',14,14,1.1);sfx(260,.2,'square',.07,90)}
   return}
  // ligero / onda: casi no daña, no llena postura y cuesta resistencia
  const po0=e.po||0;
  h2.call(this,e,Math.max(1,Math.round(d*GUARD.lightDmg)),Math.min(kb,2),0);
  if(e.s==='dead')return;
  if(!e.brk)e.po=Math.max(po0,(e.po||0)-(CF.dLight-GUARD.lightPo));
  if(e.s==='stg'&&!e.brk&&!(e.lz>0)){e.s='walk';e.tm=0}                       // el escudo absorbe el impacto
  e.gd=Math.max(e.gd,.7);
  P.st=Math.max(0,P.st-GUARD.lightStam);P.sd=Math.max(P.sd||0,.5);
  spark(e.x+e.fx*9,e.y-10,'#9fb4d6',6,10,.8);sfx(500,.07,'square',.04,300);
  if(!CF._gt){CF._gt=1;toast('Guardia alzada: usa el golpe pesado o rodéalo')}}}

// ---------- hurtP: ataques rojos no se pueden parar ----------
{const q2=hurtP;hurtP=function(d,e){
  if(e&&!e.proj&&e.cur&&e.cur.unb&&P.s==='idle'){const hb=held.block;held.block=0;try{return q2.call(this,d,e)}finally{held.block=hb}}
  return q2.call(this,d,e)}}

// ---------- updE: roles ----------
{const u2=updE;updE=function(e,dt){
  const s0=e.s,fx0=e.fx,fy0=e.fy;
  u2.call(this,e,dt);
  if(e.gd>0&&!e.b&&e.s==='walk'&&!isCl()){e.fx=fx0+(e.fx-fx0)*.18;e.fy=fy0+(e.fy-fy0)*.18;const l=Math.hypot(e.fx,e.fy)||1;e.fx/=l;e.fy/=l}   // con la guardia alzada gira lento: se le puede rodear
  if(isCl()||e.b||e.s==='dead'||!e.aw||!P||P.s==='dead')return;
  // arquero: abanico
  if(s0==='wind'&&e.s==='act'&&e.cur&&e.cur.vol){const q=PR[PR.length-1];
   if(q&&q.age===0){for(const a of[-.3,.3]){const c=Math.cos(a),s=Math.sin(a);PR.push({x:q.x,y:q.y,vx:q.vx*c-q.vy*s,vy:q.vx*s+q.vy*c,d:q.d,c:q.c,age:0})}}}
  // aviso del primer ataque rojo
  if(s0==='walk'&&e.s==='wind'&&e.cur&&e.cur.unb&&!CF._rt){CF._rt=1;toast('Ataque rojo: no se puede parar, ¡esquiva!')}
  // guardia: temporizadores y activación
  if(e.gd>0){e.gd-=dt;if(e.s!=='walk'&&e.s!=='wind')e.gd=0;else if(e.s==='walk')e.cd=Math.max(e.cd,.25)}
  if(e.gcd>0)e.gcd-=dt;
  // vacío: rodear y huir tras embestir
  if(e.t==='hollow'){
   if(s0==='act'&&e.s==='rec'&&R()<HOLLOW.retreatP)e.rt=HOLLOW.retreat;
   if(e.s==='walk'){
    const dx=P.x-e.x,dy=P.y-e.y,d=Math.hypot(dx,dy)||1,sp=TY.hollow.sp*(G.chase?1.2:1);
    if(e.rt>0){e.rt-=dt;W.move(e,-dx/d*sp*HOLLOW.retreatSp*dt,-dy/d*sp*HOLLOW.retreatSp*dt,e.hw,e.hh);e.mvg=1;e.cd=Math.max(e.cd,.1)}
    else if(d>34&&d<95&&e.cd>.15){e.sg=e.sg||(R()<.5?1:-1);e.sgT=(e.sgT||0)-dt;if(e.sgT<=0){e.sgT=rnd(1,2.4);e.sg=-e.sg}
     W.move(e,-dy/d*e.sg*sp*HOLLOW.strafe*dt,dx/d*e.sg*sp*HOLLOW.strafe*dt,e.hw,e.hh);e.mvg=1}}
  }}}

// ---------- hitE (post): activar guardia tras recibir golpes ----------
{const h3=hitE;hitE=function(e,d,kb,hv){
  const was=e&&e.s;h3.call(this,e,d,kb,hv);
  if(isCl()||!e||e.b||e.s==='dead'||e.brk||e.gd>0||(e.gcd>0)||e.lz>0||G.ulting)return;
  if(!GUARD.types.includes(e.t)||!e.aw)return;
  if((e.s==='walk'||(was==='walk'&&e.s==='stg'))&&!hv&&R()<GUARD.chance){
   e.gd=GUARD.dur;e.gcd=GUARD.cd;if(e.s==='stg'){e.s='walk';e.tm=0}e.cd=Math.max(e.cd,.5);
   const dx=P.x-e.x,dy=P.y-e.y,l=Math.hypot(dx,dy)||1;e.fx=dx/l;e.fy=dy/l;
   ftext(e.x,e.y-(TY[e.t]?TY[e.t].h:22)-20,'Guardia','#9fb4d6');sfx(300,.1,'triangle',.04,200)}}}

// ---------- dibujo: escudo y aviso rojo ----------
{const d3=drawE;drawE=function(e){
  if(e.s!=='dead'){
   const h=e.b?e.b.h:(TY[e.t]?TY[e.t].h:22);
   if(e.s==='wind'&&e.cur&&e.cur.unb&&!e.b){const q=Math.min(1,e.tm/(e.wt||1));
    glow(e.x,e.y-10,16,'255,50,50',.22+.4*q);fr(e.x-1,e.y-h-26,2,5,'#ff3b3b');fr(e.x-1,e.y-h-19,2,2,'#ff3b3b')}
   if(e.gd>0&&!e.b){g.save();g.translate(Math.round(e.x),Math.round(e.y-10-Math.max(0,e.lz||0)));g.rotate(Math.atan2(e.fy,e.fx));
    g.fillStyle='#6c7f9e';g.fillRect(8,-9,4,18);g.fillStyle='#cfe3ff';g.fillRect(11,-8,1,16);g.fillStyle='rgba(159,180,214,'+(.12+.1*Math.min(1,e.gd))+')';g.beginPath();g.arc(0,0,14,-.9,.9);g.lineTo(0,0);g.fill();g.restore()}}
  d3.call(this,e)}}
})();
