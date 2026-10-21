// ===== SISTEMAS: diario (recuerdos, bestiario, logros) y mapa =====
let diaryFrom='pause',mapSel=null,mapMode='reino',mapFog=1,mapTm=0,mapAnim=0,mapTD=0;const mapCache={};
const esc=t=>String(t).replace(/</g,'&lt;');
function openDiary(tab,from){if(from)diaryFrom=from;tab=tab||'mem';G.mode='menu';const m=$('menu');m.style.display='flex';m.classList.remove('tt');
 const T=[['mem','Memorias'],['bes','Bestiario'],['ach','Logros'],['map','Mapa']];
 let h='<div class="card"><h1>Diario</h1><div class="tabs">'+T.map(t=>'<button class="'+(t[0]===tab?'sel':'')+'" onclick="openDiary(\''+t[0]+'\')">'+t[1]+'</button>').join('')+'</div>';
 h+=tab==='mem'?dMem():tab==='bes'?dBes():tab==='ach'?dAch():dMap();
 m.innerHTML=h+'<button id="go" onclick="'+(diaryFrom==='rest'?'openRest()':'openPause()')+'">Volver</button></div>';clearTimeout(mapAnim);if(tab==='map'){drawMap(mapSel||rg.id);if(mapMode==='reino')mapLoop()}}
function dMem(){let h='<h2>Recuerdos · '+nMem()+'/5</h2>';
 ['sepulturero','pastora','cazador','caballero','rey'].forEach(k=>{const m=MEM[k];h+=S.mem[k]?'<div class="ent"><b>'+m[0]+'</b><span>'+esc(typeof m[1]==='function'?m[1]():m[1])+'</span></div>':'<div class="ent lock"><b>???</b><span>Un jefe guarda este recuerdo.</span></div>'});
 if(nMem()>=2&&nMem()<5)h+='<p class="hint">Los recuerdos no coinciden entre sí. ¿Quién giró la llave?</p>';
 const hint={osario:'Algo duerme bajo la cripta.',archivos:'Hay un registro quemado en Valdora.',fosa:'Un heraldo calló más allá del bosque.',marisma:'Un pantano oculto al oeste del bosque.',cantera:'Una mina sellada al sur de Valdora.',torre:'Un faro apagado sobre las puertas de la capital.'};
 h+='<h2>Verdades ocultas · '+nTruth()+'/3</h2>';for(const k in TRU)h+=S.tr[k]?'<div class="ent ok"><b>'+TRU[k][0]+'</b><span>'+esc(TRU[k][1])+'</span></div>':'<div class="ent lock"><b>???</b><span>'+hint[k]+'</span></div>';
 const ns=Object.keys(S.notes);h+='<h2>Lápidas · '+ns.length+'</h2>'+(ns.length?ns.map(k=>'<div class="ent"><b>'+NOTES[k][0]+'</b><span>'+esc(NOTES[k][1])+'</span></div>').join(''):'<p class="hint">Busca lápidas con un brillo tenue.</p>');
 const ab=Object.keys(S.ab);if(ab.length)h+='<h2>Habilidades</h2>'+ab.map(k=>'<div class="ent ok"><b>'+ABIL[k][0]+'</b><span>'+ABIL[k][1]+'</span></div>').join('');
 return h}
function dBes(){let h='<h2>Bestiario</h2>';for(const k in BEST){const b=BEST[k],e=S.be[k];if(!e){h+='<div class="ent lock"><b>???</b><span>Aún no te has cruzado con él.</span></div>';continue}
  h+='<div class="ent"><b>'+b[0]+(e.k?' · derrotado '+e.k+'×':'')+'</b><span>'+b[1]+'</span>'+(e.k>=1?'<span style="margin-top:4px;color:#9a8bc5">'+b[2]+'</span>':'')+(e.k>=3||(BS[k]&&e.k>=1)?'<span style="margin-top:4px;color:#7dff9a">Consejo: '+b[3]+'</span>':'')+'</div>'}return h}
function dAch(){const n=Object.keys(S.ach).length;return '<h2>Logros · '+n+'/'+ACH.length+'</h2>'+ACH.map(a=>S.ach[a[0]]?'<div class="ent ok"><b>'+a[1]+'</b><span>'+a[2]+'</span></div>':'<div class="ent lock"><b>'+a[1]+'</b><span>'+a[2]+'</span></div>').join('')}
// ===== MAPA GENERAL "EL REINO": regiones colocadas como en el plano, con niebla, caminos y marcadores =====
const KR=4,OY=34,MW=748,MH=2860;
const LAY={cripta:[30,OY],osario:[356,OY],valdora:[0,OY+208],bosque:[292,OY+212],fosa:[566,OY+244],archivos:[4,OY+430],puertas:[232,OY+424],trono:[508,OY+438],marisma:[14,OY+646],cantera:[262,OY+646],torre:[512,OY+646]};
const LNK=[['cripta','valdora'],['valdora','bosque'],['bosque','puertas'],['puertas','trono'],['cripta','osario',1],['bosque','fosa',1],['valdora','archivos',1],['bosque','marisma',1],['valdora','cantera',1],['puertas','torre',1]];
const NUMR={cripta:1,valdora:2,bosque:3,puertas:4,trono:5};
const visR=id=>id===rg.id||!!S.seen[id];
function dMap(){mapTD=0;const vis=RG.filter(r=>visR(r.id)),cur=mapSel||rg.id;
 let h='<div class="tabs"><button class="'+(mapMode==='reino'?'sel':'')+'" onclick="mapMode=\'reino\';openDiary(\'map\')">El Reino</button><button class="'+(mapMode==='region'?'sel':'')+'" onclick="mapSel=mapSel||rg.id;mapMode=\'region\';openDiary(\'map\')">Región</button></div>';
 if(mapMode==='reino')return h+'<div class="mh">EL REINO<small>MAPA GENERAL</small></div><canvas id="mapc" onclick="mapClick(event)"></canvas><div class="legend"><i style="background:#fff"></i>Tú <i style="background:#e8384f"></i>Jefe <i style="background:#ffd24a"></i>Llave / puerta <i style="background:#b05cff"></i>Portal <i style="background:#ff9a3c"></i>Hoguera <i class="op"></i>Opcional</div>'
  +'<div class="thumbs"><div class="'+(mapFog?'':'sel')+'" onclick="mapFog=0;openDiary(\'map\')"><canvas id="mapt1"></canvas><span>Vista general (sin niebla)</span></div><div class="'+(mapFog?'sel':'')+'" onclick="mapFog=1;openDiary(\'map\')"><canvas id="mapt2"></canvas><span>Mapa del diario (lo visto)</span></div></div><div class="legend">Toca una región visitada para verla en detalle. Estás en: '+rg.n+'</div>'+regPanel();
 return h+'<div class="row" style="flex-wrap:wrap;margin:8px 0">'+vis.map(r=>'<button class="'+(r.id===cur?'sel':'')+'" style="flex:1 1 45%;height:34px;font-size:11px" onclick="mapSel=\''+r.id+'\';openDiary(\'map\')">'+r.n+'</button>').join('')+'</div><canvas id="mapc"></canvas><div class="legend">Naranja: hoguera · Celeste: pasaje · Violeta: salida · Dorado: puerta cerrada · Blanco: tú</div>'}
const REGINFO={cripta:['Despertar del jugador','Jefe: Sepulturero','Osario secreto (grietas)','Puzzle de cirios','Vigía nocturna','Salida hacia Valdora'],valdora:['Pueblo (casas visitables)','Río (divide el pueblo)','Archivo (llave)','Arena de la Pastora','Vuelta a la cripta'],bosque:['Senderos y claros','Lago de agua','Arena del Cazador','Pasaje a Fosa del Rebaño','Isla con grieta (Manto de Sombra)'],puertas:['Muros de la ciudad','Arena del Caballero','Muro de juramento','Camino al trono'],trono:['Jefe final: Ormund Cineris','Finales según tus decisiones'],osario:['2 palancas → Guardiana','Atajo de vuelta'],archivos:['Sigilo (vigilantes + cono de visión)','Fuga con alarma'],fosa:['Supervivencia (3 oleadas)','Heraldo Mudo'],marisma:['Aguas turbias y puentes de tablas','Setas luminosas','Arena de la Madre del Fango'],cantera:['Galerías con cristales','Abismo con un único puente','Arena del Capataz'],torre:['Salas de guardia','Dos palancas abren la azotea','Arena del Vigía']};
function regPanel(){const row=r=>{const v=visR(r.id)||!mapFog,t=(NUMR[r.id]?NUMR[r.id]+'. ':'')+(v?r.n:'???')+' <small>('+r.cols+'×'+r.rows+')</small>';return '<details class="rg"><summary>'+t+'</summary>'+(v?'<ul>'+REGINFO[r.id].map(l=>'<li>'+l+'</li>').join('')+'</ul>':'<p>Aún no has llegado aquí.</p>')+'</details>'};
 return '<h2>Regiones principales</h2>'+RG.filter(r=>NUMR[r.id]).map(row).join('')+'<h2>Zonas opcionales</h2>'+RG.filter(r=>!NUMR[r.id]).map(row).join('')+'<h2>Notas</h2><ul class="nt"><li>El mapa se revela con la niebla.</li><li>El minimapa y el mapa del diario muestran solo lo que ya viste.</li><li>Las regiones se pueden revisitar.</li><li>Cambian según los jefes vencidos y los juramentos elegidos.</li></ul>'}
function mapW(id){if(id===rg.id)return W;const i=RG.findIndex(r=>r.id===id),c=mapCache[id];if(c&&c.v===S.seen[id])return c.w;const w=new Mapa(RG[i]);RG[i].build(w);w.applyState();w.bake();w.initSeen(S.seen[id]);mapCache[id]={w,v:S.seen[id]};return w}
const RS=6,MS=1.5;
function regionArt(id,fog){const w=mapW(id),cw=w.cols*RS,ch=w.rows*RS;
 if(!w.artF){const c=mkc(cw,ch),q=c.getContext('2d');q.imageSmoothingEnabled=true;q.imageSmoothingQuality='high';q.drawImage(w.base,0,0,cw,ch);
  const k=RS/16;for(let ty=0;ty<w.rows;ty++)for(let tx=0;tx<w.cols;tx++){const n=w.on[w.i(tx,ty)];if(!n||WALLISH.has(n)||n==='gate')continue;const art=objArt(n,w.ov[w.i(tx,ty)]%4,w.th);if(!art)continue;const wx=tx*16+8,wy=ty*16+15;q.drawImage(art,(wx-art.width/2)*k,(wy-(art.height-3))*k,art.width*k,art.height*k)}
  w.artF=c}
 if(!fog)return w.artF;
 let n=0;const sn=w.seen;for(let i=0;i<sn.length;i++)n+=sn[i];if(w.artM&&w.artMn===n)return w.artM;
 const c=mkc(cw,ch),q=c.getContext('2d');q.drawImage(w.artF,0,0);
 const m=mkc(cw,ch),mq=m.getContext('2d');mq.imageSmoothingEnabled=false;if('filter'in mq)mq.filter='blur('+(RS*.9)+'px)';mq.drawImage(w.mmv,0,0,w.cols,w.rows,0,0,cw,ch);mq.filter='none';
 const m2=mkc(cw,ch),m2q=m2.getContext('2d');m2q.drawImage(m,0,0);m2q.globalCompositeOperation='lighter';m2q.drawImage(m,0,0);m2q.drawImage(m,0,0);
 q.globalCompositeOperation='destination-in';q.drawImage(m2,0,0);w.artM=c;w.artMn=n;return c}
function mapClick(e){if(mapMode!=='reino')return;const c=$('mapc'),b=c.getBoundingClientRect(),px=(e.clientX-b.left)*MW/b.width,py=(e.clientY-b.top)*MH/b.height;
 for(const r of RG){const l=LAY[r.id];if(l&&px>=l[0]&&px<=l[0]+r.cols*KR&&py>=l[1]&&py<=l[1]+r.rows*KR){if(visR(r.id)||!mapFog){mapSel=r.id;mapMode='region';openDiary('map')}return}}}
function mapLoop(){const c=$('mapc');if(!c||mapMode!=='reino'||G.mode!=='menu'){mapAnim=0;return}mapTm+=.12;drawMap();mapAnim=setTimeout(mapLoop,110)}
function reinoCanvas(fog,labels){const c=mkc(MW*MS,MH*MS),x=c.getContext('2d');x.scale(MS,MS);x.imageSmoothingEnabled=false;x.fillStyle='#05030a';x.fillRect(0,0,MW,MH);
 // niebla a la deriva
 const R=rngS(77);for(let k=0;k<70;k++){const px=R()*MW,py=R()*MH,r=18+R()*34,dr=Math.sin(mapTm*.5+k)*7,gr=x.createRadialGradient(px+dr,py,2,px+dr,py,r);gr.addColorStop(0,'rgba(48,42,72,.6)');gr.addColorStop(1,'rgba(48,42,72,0)');x.fillStyle=gr;x.fillRect(px+dr-r,py-r,r*2,r*2)}
 const rc=r=>{const l=LAY[r.id];return[l[0],l[1],r.cols*KR,r.rows*KR]};
 // caminos (debajo de las regiones: solo se ve el tramo entre ellas)
 x.lineWidth=3;for(const[a,b,op]of LNK){if(fog&&!visR(a)&&!visR(b))continue;const A=rc(RG.find(r=>r.id===a)),B=rc(RG.find(r=>r.id===b));x.setLineDash(op?[6,6]:[10,6]);x.lineDashOffset=-mapTm*6;x.strokeStyle=op?'#6fa8b8':'#c9a54a';x.beginPath();x.moveTo(A[0]+A[2]/2,A[1]+A[3]/2);x.lineTo(B[0]+B[2]/2,B[1]+B[3]/2);x.stroke()}x.setLineDash([]);
 const tag=(t,sub,cx,cy,col)=>{x.font='bold 18px Georgia';let w=x.measureText(t).width;if(sub){x.font='14px Georgia';w=Math.max(w,x.measureText(sub).width)}w+=18;const h=sub?40:26;x.fillStyle='rgba(8,5,16,.94)';x.fillRect(cx-w/2,cy-h/2,w,h);x.strokeStyle=col;x.lineWidth=1;x.strokeRect(cx-w/2+.5,cy-h/2+.5,w-1,h-1);x.textAlign='center';x.textBaseline='middle';x.font='bold 18px Georgia';x.fillStyle='#f0e6ff';x.fillText(t,cx,cy-(sub?9:0));if(sub){x.font='14px Georgia';x.fillStyle='#a89cc8';x.fillText(sub,cx,cy+11)}};
 const badge=(n,cx,cy)=>{x.fillStyle='rgba(8,5,16,.9)';x.beginPath();x.arc(cx,cy,17,0,6.283);x.fill();x.strokeStyle='#c9a54a';x.lineWidth=2;x.stroke();x.fillStyle='#fff';x.font='bold 22px Georgia';x.textAlign='center';x.textBaseline='middle';x.fillText(n,cx,cy+1)};
 for(const r of RG){const[ox,oy,rw,rh]=rc(r),v=visR(r.id),show=v||!fog,op=!NUMR[r.id];
  x.fillStyle='#0a0614';x.fillRect(ox,oy,rw,rh);
  if(show){const w=mapW(r.id);x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';x.drawImage(regionArt(r.id,fog),0,0,r.cols*RS,r.rows*RS,ox,oy,rw,rh);x.imageSmoothingEnabled=false;
   if(fog){x.save();x.beginPath();x.rect(ox,oy,rw,rh);x.clip();for(let k=0;k<6;k++){const cx=ox+((k*97+mapTm*3)%rw),cy=oy+(k*61%rh),rd=40+k%3*12,gr=x.createRadialGradient(cx,cy,2,cx,cy,rd);gr.addColorStop(0,'rgba(40,36,64,.5)');gr.addColorStop(1,'rgba(40,36,64,0)');x.fillStyle=gr;x.fillRect(cx-rd,cy-rd,rd*2,rd*2)}x.restore()}
   const sn=(a,b)=>!fog||w.seen[w.i(a,b)],px=t=>ox+t*KR+KR/2,py=t=>oy+t*KR+KR/2;
   const dot=(cx,cy,col,rad)=>{x.fillStyle='#05030a';x.beginPath();x.arc(cx,cy,rad+1.5,0,6.283);x.fill();x.fillStyle=col;x.beginPath();x.arc(cx,cy,rad,0,6.283);x.fill()};
   const dia=(cx,cy,col)=>{x.fillStyle='#05030a';x.beginPath();x.moveTo(cx,cy-6);x.lineTo(cx+5,cy);x.lineTo(cx,cy+6);x.lineTo(cx-5,cy);x.fill();x.fillStyle=col;x.beginPath();x.moveTo(cx,cy-4);x.lineTo(cx+3,cy);x.lineTo(cx,cy+4);x.lineTo(cx-3,cy);x.fill()};
   w.fires.forEach(f=>sn(f.tx,f.ty)&&dia(px(f.tx),py(f.ty),'#ff9a3c'));
   w.portals.forEach(q=>sn(q.tx,q.ty)&&(dot(px(q.tx),py(q.ty),'#7dd8ff',3.5),dot(px(q.tx),py(q.ty),'#0a0610',1.5)));
   if(w.exitP&&sn(w.exitP.tx,w.exitP.ty)){dot(px(w.exitP.tx),py(w.exitP.ty),'#b05cff',4);dot(px(w.exitP.tx),py(w.exitP.ty),'#0a0610',1.5)}
   w.lds.forEach(d=>sn(d.x,d.y)&&!S.dl[d.id]&&(x.fillStyle='#05030a',x.fillRect(px(d.x)-5,py(d.y)-5,10,10),x.fillStyle='#ffd24a',x.fillRect(px(d.x)-3.5,py(d.y)-3.5,7,7)));
   w.items.forEach(it=>it.key&&!S.keys[it.key]&&sn(it.tx,it.ty)&&(dot(px(it.tx),py(it.ty),'#ffd24a',3.5),x.fillStyle='#ffd24a',x.fillRect(px(it.tx)-1,py(it.ty),2,7)));
   if(w.arena&&(r.boss||r.mini)&&sn(w.arena.bx,w.arena.by)){const bx=px(w.arena.bx),by=py(w.arena.by),dead=S.bk[r.boss||r.mini];dot(bx,by,dead?'#6a6478':'#e8384f',6);x.fillStyle='#fff';x.fillRect(bx-3,by-2,2,2);x.fillRect(bx+1,by-2,2,2);x.fillRect(bx-1,by+2,2,2)}
   if(r.id===rg.id){const pu=1+.35*Math.sin(mapTm*5);x.fillStyle='rgba(255,255,255,.28)';x.beginPath();x.arc(px(P.x/16|0),py(P.y/16|0),8*pu,0,6.283);x.fill();dot(px(P.x/16|0),py(P.y/16|0),'#fff',3.5)}
  }else{ // región aún oculta: bruma y signo de interrogación
   for(let k=0;k<9;k++){const cx=ox+(k*53%rw),cy=oy+(k*37%rh),rd=34+k%3*10+Math.sin(mapTm*.6+k)*5,gr=x.createRadialGradient(cx,cy,2,cx,cy,rd);gr.addColorStop(0,'rgba(60,54,88,.7)');gr.addColorStop(1,'rgba(60,54,88,0)');x.fillStyle=gr;x.fillRect(cx-rd,cy-rd,rd*2,rd*2)}
   x.fillStyle='#4a4468';x.font='bold 44px Georgia';x.textAlign='center';x.textBaseline='middle';x.fillText('?',ox+rw/2,oy+rh/2)}
  x.strokeStyle=!v&&fog?'#2a2440':op?'#7ac8d8':'#c9a54a';x.lineWidth=2;x.setLineDash(op?[6,4]:[]);x.strokeRect(ox+1,oy+1,rw-2,rh-2);x.setLineDash([]);
  if(labels){const nm=!v&&fog?'???':(NUMR[r.id]?NUMR[r.id]+'. ':'')+r.n.toUpperCase();tag(nm,(!v&&fog)?'':'('+r.cols+'×'+r.rows+')'+(op?' · opcional':''),ox+rw/2,oy,!v&&fog?'#3a3456':op?'#7ac8d8':'#c9a54a')}
  else if(NUMR[r.id])badge(NUMR[r.id],ox+rw/2,oy+rh/2)}
 if(labels){x.save();x.translate(690,100);x.strokeStyle='#c9a54a';x.lineWidth=1.5;x.beginPath();x.arc(0,0,24,0,6.283);x.stroke();x.fillStyle='#c9a54a';x.beginPath();x.moveTo(0,-30);x.lineTo(5,0);x.lineTo(0,30);x.lineTo(-5,0);x.fill();x.beginPath();x.moveTo(-30,0);x.lineTo(0,5);x.lineTo(30,0);x.lineTo(0,-5);x.fill();x.fillStyle='#f0e6ff';x.font='bold 13px Georgia';x.textAlign='center';x.textBaseline='middle';x.fillText('N',0,-41);x.fillText('S',0,41);x.fillText('E',43,0);x.fillText('O',-43,0);x.restore()}
 return c}
function drawMap(id){id=id||mapSel||rg.id;const c=$('mapc');if(!c)return;
 if(mapMode==='reino'){c.width=MW*MS;c.height=MH*MS;c.getContext('2d').drawImage(reinoCanvas(mapFog,true),0,0);
  if(!mapTD){mapTD=1;setTimeout(()=>{[['mapt1',0],['mapt2',1]].forEach(([n,f])=>{const t=$(n);if(!t)return;t.width=374;t.height=450;const q=t.getContext('2d');q.imageSmoothingEnabled=true;q.imageSmoothingQuality='high';q.drawImage(reinoCanvas(f,false),0,0,374,450)})},60)}return}
 const w=mapW(id),k=4;c.width=w.cols*k;c.height=w.rows*k;const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.fillStyle='#05030a';x.fillRect(0,0,c.width,c.height);x.drawImage(w.mmv,0,0,c.width,c.height);
 const sn=(a,b)=>w.seen[w.i(a,b)],mk=(tx_,ty_,col,r)=>{x.fillStyle=col;x.fillRect(tx_*k-r+k/2,ty_*k-r+k/2,r*2,r*2)};
 w.fires.forEach(f=>sn(f.tx,f.ty)&&mk(f.tx,f.ty,'#ff9a3c',4));w.portals.forEach(q=>sn(q.tx,q.ty)&&mk(q.tx,q.ty,'#7dd8ff',4));if(w.exitP&&sn(w.exitP.tx,w.exitP.ty))mk(w.exitP.tx,w.exitP.ty,'#b05cff',4);
 w.lds.forEach(d=>sn(d.x,d.y)&&!S.dl[d.id]&&mk(d.x,d.y,'#ffd24a',3));w.npcs.forEach(n=>sn(n.tx,n.ty)&&!(n.night&&!S.night)&&mk(n.tx,n.ty,'#9ad0ff',2));
 if(id===rg.id)mk(P.x/16|0,P.y/16|0,'#fff',4)}
