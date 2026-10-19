// ===== INTERFAZ (HUD en canvas): medallón, barras ornamentadas, frascos, almas, minimapa, jefe, títulos y avisos =====
const sp_=s=>s.toUpperCase().split('').join(' ');
function uiPanel(x,y,w,h,a){g.globalAlpha=a==null?.85:a;fr(x,y,w,h,'#0b0714');g.globalAlpha=1;fr(x,y,w,1,'#e6c26a');fr(x,y+h-1,w,1,'#7a5a1e');fr(x,y,1,h,'#c9a54a');fr(x+w-1,y,1,h,'#7a5a1e');fr(x+1,y+1,w-2,1,'rgba(255,255,255,.08)');
 for(const[a_,b_]of[[x,y],[x+w-1,y],[x,y+h-1],[x+w-1,y+h-1]])fr(a_-1,b_-1,3,3,'#ffe9a0')}
function uiMedal(cx,cy,r){const low=P.hp/P.mhp<.3&&P.s!=='dead',oc=S.oath&&OATHC[S.oath]?OATHC[S.oath]:'201,165,74';
 g.fillStyle='#000';g.beginPath();g.arc(cx,cy,r+2,0,6.283);g.fill();
 g.strokeStyle=low?'rgba(255,70,90,'+(.6+.4*Math.sin(TM*7))+')':'#c9a54a';g.lineWidth=2;g.beginPath();g.arc(cx,cy,r,0,6.283);g.stroke();
 g.fillStyle='#14091f';g.beginPath();g.arc(cx,cy,r-1.5,0,6.283);g.fill();glow(cx,cy,r,oc,.32+.1*Math.sin(TM*2));
 g.strokeStyle='rgb('+oc+')';g.lineWidth=1.3;g.beginPath();g.moveTo(cx,cy-6);g.lineTo(cx,cy+4);g.moveTo(cx-3,cy-1);g.lineTo(cx+3,cy-1);g.stroke();fr(cx-1,cy+5,3,1,'rgb('+oc+')');
 g.fillStyle='#ffe9a0';for(let i=0;i<4;i++){const a=i*1.5708+.785;g.fillRect(Math.round(cx+Math.cos(a)*(r+1))-1,Math.round(cy+Math.sin(a)*(r+1))-1,2,2)}}
function uiBar(x,y,w,h,v,gv,a,b,seg,flash){fr(x-2,y-2,w+4,h+4,'#000');fr(x-1,y-1,w+2,h+2,'#8a6a2a');fr(x,y,w,h,'#10060c');v=cl(v,0,1);gv=cl(gv,0,1);
 if(gv>v)fr(x+w*v,y,Math.round(w*(gv-v)),h,'#ffd9a8');const fw=Math.round(w*v),q=g.createLinearGradient(0,y,0,y+h);q.addColorStop(0,a);q.addColorStop(1,b);g.fillStyle=q;g.fillRect(x,y,fw,h);
 fr(x,y,fw,1,'rgba(255,255,255,.4)');if(seg>3)for(let i=seg;i<w;i+=seg)fr(x+i,y,1,h,'rgba(0,0,0,.4)');if(flash)fr(x,y,fw,h,'rgba(255,255,255,.28)');
 fr(x-3,y+(h>>1)-1,2,3,'#ffe9a0');fr(x+w+1,y+(h>>1)-1,2,3,'#ffe9a0')}
function uiFlask(x,y,on){fr(x+2,y,3,1,on?'#9a6a3a':'#3a3030');fr(x+2,y+1,3,2,on?'#cfd8e8':'#4a4458');fr(x,y+3,7,1,'#000');fr(x+1,y+3,5,5,on?'#2fb866':'#241c2c');fr(x,y+4,1,4,'#000');fr(x+6,y+4,1,4,'#000');fr(x+1,y+8,5,1,'#000');
 if(on){fr(x+2,y+4,1,3,'#b5ffd0');glow(x+3,y+6,7,'80,255,150',.18+.06*Math.sin(TM*3+x))}}
function promptUI(o,ts){const lb=o.k;g.font='7px '+FONT;const w=Math.round(g.measureText(lb).width)+18,yy=Math.round(o.y-38+Math.sin(ts*5)*1.5),x=Math.round(o.x-w/2);
 uiPanel(x,yy,w,13,.92);fr(x+4,yy+5,3,3,'#ffe66d');fr(x+5,yy+4,1,5,'#ffe66d');fr(x+4,yy+6,3,1,'#ffe66d');tx(lb,o.x+4,yy+10,'#fff','center',7);
 fr(o.x-3,yy+13,7,1,'#c9a54a');fr(o.x-2,yy+14,5,1,'#c9a54a');fr(o.x-1,yy+15,3,1,'#c9a54a')}
function hud(){const p=P;if(!p)return;const dt=Math.min(.1,Math.max(0,TM-(AN.lt||TM)));AN.lt=TM;
 if(p.hp/p.mhp<.28&&p.s!=='dead'){const a=.16+.1*Math.sin(TM*5),q=g.createRadialGradient(GW/2,GH/2,GH*.32,GW/2,GH/2,GW*.62);q.addColorStop(0,'rgba(160,0,24,0)');q.addColorStop(1,'rgba(160,0,24,'+a+')');g.fillStyle=q;g.fillRect(0,0,GW,GH)}
 const hpw=Math.min(140,p.mhp*.95)|0,stw=Math.min(118,p.mst*.8)|0,bx=32;uiMedal(15,18,11);
 uiBar(bx,10,hpw,8,p.hp/p.mhp,AN.hg==null?0:AN.hg/p.mhp,'#f0475c','#8a1226',hpw*10/p.mhp,0);
 uiBar(bx,23,stw,5,p.st/p.mst,AN.sg==null?0:AN.sg/p.mst,p.ex>0&&Math.floor(TM*10)%2?'#ffb060':'#7af09a',p.ex>0?'#a85a2a':'#2f9a52',0,p.ex>0&&Math.floor(TM*10)%2);
 tx(String(Math.ceil(p.hp)),bx+hpw+7,17,'#ffd0d6','left',5);
 for(let i=0;i<S.fmax;i++)uiFlask(bx+i*10,33,i<S.flasks);
 tx((S.oath?short(S.oath):'Sin juramento')+' · '+WPN().n,bx,55,'#c9b8ff','left',6);tx(S.name+(S.night?' · noche':''),bx,62,'#8a80a8','left',5);
 // almas y fragmentos
 uiPanel(GW-66,6,60,25,.82);g.fillStyle='#d09aff';g.beginPath();g.arc(GW-57,14,3,0,6.283);g.fill();glow(GW-57,14,9,'208,154,255',.25+.1*Math.sin(TM*3));fr(GW-58,17,2,3,'#d09aff');tx(String(S.souls),GW-10,17,'#ffe66d','right',8);
 g.fillStyle='#ffe66d';g.beginPath();g.moveTo(GW-57,22);g.lineTo(GW-54,25);g.lineTo(GW-57,28);g.lineTo(GW-60,25);g.fill();tx(String(S.frag),GW-10,28,'#ffe66d','right',7);
 if(AN.sp&&AN.sp.t>0){g.globalAlpha=Math.min(1,AN.sp.t*2);tx('+'+AN.sp.d,GW-72,18-(1-AN.sp.t)*8,'#ffe66d','right',7);g.globalAlpha=1}
 // minimapa
 if(CFG.mini&&W.mmv){const mw=W.cols,mh=W.rows,k=1,y0=38,pw=Math.max(mw+8,rg.n.length*5+10),x0=GW-6-((pw+mw)>>1)-0;uiPanel(GW-6-pw,y0-4,pw,mh+8+10,.85);g.globalAlpha=.9;g.drawImage(W.mmv,x0,y0,mw*k,mh*k);const sn=(a,b)=>W.seen[W.i(a,b)];g.globalAlpha=1;
  W.fires.forEach(f=>{if(sn(f.tx,f.ty))fr(x0+f.tx*k-1,y0+f.ty*k-1,3,3,'#ff9a3c')});W.portals.forEach(q=>{if(sn(q.tx,q.ty))fr(x0+q.tx*k-1,y0+q.ty*k-1,3,3,'#7dd8ff')});
  if(W.exitP&&S.bk[rg.boss]&&sn(W.exitP.tx,W.exitP.ty))fr(x0+W.exitP.tx*k-1,y0+W.exitP.ty*k-1,3,3,'#b05cff');W.npcs.forEach(n=>{if(sn(n.tx,n.ty)&&!(n.night&&!S.night))fr(x0+n.tx*k,y0+n.ty*k,2,2,'#9ad0ff')});
  g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=1;g.strokeRect(x0+cam.x/16*k+.5,y0+cam.y/16*k+.5,GW/16*k,GH/16*k);fr(x0+P.x/16*k-1,y0+P.y/16*k-1,3,3,Math.floor(TM*4)%2?'#7df9ff':'#fff');
  tx(rg.n,GW-6-pw/2,y0+mh*k+8,'#c9b8ff','center',5)}
 // jefe
 const b=E.find(e=>e.b&&e.s!=='dead'&&e.aw);
 if(b){if(AN.bb!==b){AN.bb=b;AN.bg=b.hp}if(b.hp>AN.bg)AN.bg=b.hp;else AN.bg=Math.max(b.hp,AN.bg-b.mhp*.25*dt);
  uiPanel(GW/2-152,GH-42,304,36,.7);tx(b.b.n,GW/2,GH-28,'#f0e6ff','center',8);
  for(const s of[-1,1]){const cx=GW/2+s*134;g.fillStyle='#c0243c';g.beginPath();g.arc(cx,GH-30,3,0,6.283);g.fill();fr(cx-1,GH-28,2,3,'#c0243c')}
  uiBar(GW/2-132,GH-20,264,6,b.hp/b.mhp,AN.bg/b.mhp,'#d02a44','#5a0e1e',264/20,0)}
 // título de zona
 if(G.banner){const bn=G.banner;if(!bn.m)bn.m=bn.l;const a=Math.min(1,bn.l,(bn.m-bn.l)*2.2+.01),e=cl((bn.m-bn.l)*1.6,0,1),w=(GW-60)*(1-Math.pow(1-e,3)),cx=GW/2,cy=GH/2-26;g.globalAlpha=a;
  const q=g.createLinearGradient(0,0,GW,0);q.addColorStop(0,'rgba(0,0,0,0)');q.addColorStop(.25,'rgba(0,0,0,.62)');q.addColorStop(.75,'rgba(0,0,0,.62)');q.addColorStop(1,'rgba(0,0,0,0)');
  fr(cx-w/2,cy-22,w,1,'#c9a54a');fr(cx-w/2,cy+25,w,1,'#c9a54a');for(const yy of[cy-22,cy+25]){fr(cx-3,yy-2,6,5,'#0b0714');g.fillStyle='#ffe9a0';g.beginPath();g.moveTo(cx,yy-3);g.lineTo(cx+3,yy);g.lineTo(cx,yy+3);g.lineTo(cx-3,yy);g.fill()}
  glow(cx,cy+6,70,'201,165,74',.14);tx(sp_(bn.t),cx,cy-8,'#c9b8ff','center',5);tx(bn.s,cx,cy+12,'#fff','center',13);g.globalAlpha=1}
 if(G.msgT>0){const a=Math.min(1,G.msgT);g.globalAlpha=a;g.font='8px '+FONT;const w=Math.round(g.measureText(G.msg).width)+22;uiPanel(Math.round(GW/2-w/2),60,w,16,.88);tx(G.msg,GW/2,72,'#ffe66d','center',8);g.globalAlpha=1}
 if(G.mode==='dying')dyingScreen();
 if(G.win>0){const a=Math.min(.55,(2.5-G.win)*.4);g.fillStyle='rgba(255,230,109,'+a+')';g.fillRect(0,GH/2-24,GW,38);fr(0,GH/2-24,GW,1,'#fff');fr(0,GH/2+13,GW,1,'#fff');tx(sp_('JEFE DERROTADO'),GW/2,GH/2+2,'#fff','center',12)}}
