// v8.39 · decoración pixel art de los menús de Hoguera y Pausa (se aplica sobre openRest/openPause sin tocar su lógica)
(function(){
const PAL={o:'#1a0a04',r:'#c2301a',O:'#ff7a1a',y:'#ffc83a',w:'#fff3b0',b:'#6b3a1a',B:'#9a5a2a',g:'#6a6478',G:'#9a94ac',d:'#3a3446',s:'#ffe9a0',p:'#8a6ad8',e:'#e8e0ff',k:'#c9a54a'};
const px=(rows,z,c)=>{let r='';const w=Math.max(...rows.map(l=>l.length));rows.forEach((l,y)=>{let x=0;while(x<l.length){const ch=l[x];if(ch==='.'){x++;continue}let n=1;while(l[x+n]===ch)n++;r+='<rect x="'+x+'" y="'+y+'" width="'+n+'" height="1" fill="'+PAL[ch]+'"/>';x+=n}});
 return '<svg class="px '+(c||'')+'" viewBox="0 0 '+w+' '+rows.length+'" width="'+w*z+'" height="'+rows.length*z+'" shape-rendering="crispEdges">'+r+'</svg>'};
const mir=h=>h.map(l=>l+[...l].reverse().join(''));
const FA=mir([".......y",".......y","......yO",".....yOO","....yOOy","....OOyw","...OOryw","...OryWw","..OOrywy","..OrrOyy","..orrOOO","..ooorrr"].map(l=>l.replace('W','w'))),
 FB=mir(["........",".......y","......yy",".....yOy","....yOOO","...yOOyO","...OOywy","..OOrwww","..OOrywy","..OrrOyy","..orrOOr","..ooorrr"]),
 BS=mir(["...obBBb","..obBBbb","oobbbbbb","GGgobbbb","GgggdGdd","dddddddd"]);
const IC={
 sword:["......ee",".....eee","....eee.","k..eee..",".keee...","..kk....",".kbk....","kb.k...."],
 gem:[".eeee.","epppps","pppppp",".pppp.","..pp.."],
 rune:["...k...","..kyk..",".kyyyk.","kyywyyk",".kyyyk.","..kyk..","...k..."],
 book:[".kkkkk.","kssssbk","ksessbk","kssssbk","ksessbk","kkkkkkk"],
 gear:["..k.k..",".kkkkk.","kk...kk",".k...k.","kk...kk",".kkkkk.","..k.k.."],
 door:[".kkkk.","kBBBBk","kBBBBk","kBBByk","kBBBBk","kBBBBk"],
 play:["k.....","kk....","kkk...","kkkk..","kkk...","kk....","k....."]};
const ic=(n,z)=>px(IC[n],z||3);
// esquinas doradas (se inyectan como variables CSS)
{const T=["ksssss.","kyyyyk.","kyk....","kyk....","kyk....","ksk....","k......"],rv=a=>a.map(l=>[...l].reverse().join('')),
 u=r=>'url("data:image/svg+xml,'+encodeURIComponent(px(r,1).replace('class="px "','xmlns="http://www.w3.org/2000/svg"'))+'")',s=document.documentElement.style;
 s.setProperty('--cTL',u(T));s.setProperty('--cTR',u(rv(T)));s.setProperty('--cBL',u([...T].reverse()));s.setProperty('--cBR',u(rv([...T].reverse())))}
const fire=(z,cls)=>'<div class="'+cls+'" style="width:'+16*z+'px;height:'+(12+6)*z+'px">'+px(FA,z,'fa')+px(FB,z,'fb')+px(BS,z,'bs')+'</div>';
const torch=s=>'<div class="tch '+s+'">'+px(FA.slice(2,12),2,'fa')+px(FB.slice(2,12),2,'fb')+px(["bBb","bBb","bBb","bBb","kkk","bBb","bBb","bBb"],3,'hd')+'</div>';
const SEC={'Juramento':'rune','Atributos':'gem','Arma':'sword','Reliquias':'gem','Viajar':'door','Cólera':'rune'};
function deco(kind,dead){
 const m=document.getElementById('menu'),c=m&&m.querySelector('.card');if(!c)return;
 m.classList.remove('hog','pau');m.classList.add(kind==='rest'?'hog':'pau');
 if(!dead&&!c.querySelector('.hdr')){const h1=c.querySelector('h1');
  const emb=kind==='rest'?'':px(IC.sword,5);
  h1.insertAdjacentHTML('beforebegin','<div class="hdr">'+(kind==='rest'?fire(4,'fire'):'<div class="emb">'+emb+'</div>')+torch('l')+torch('r')+'</div>')}
 const p=c.querySelector('p'),mt=p&&/^(.*) · Almas (\d+) · Fragmentos (\d+)$/.exec(p.textContent);
 if(mt)p.outerHTML='<div class="chips"><span class="nm">'+mt[1].replace(/[<>&]/g,'')+'</span><span>'+ic('rune',2)+mt[2]+' almas</span><span>'+ic('gem',2)+mt[3]+' frag.</span></div>';
 let cur='';[...c.children].forEach(e=>{
  if(e.tagName==='H2'){const k=Object.keys(SEC).find(k=>e.textContent.indexOf(k)===0);cur=k||'';if(k&&!e.querySelector('.px'))e.insertAdjacentHTML('afterbegin',ic(SEC[k],2));return}
  if(e.tagName!=='BUTTON'||e.querySelector('.px,.ico'))return;
  const t=e.textContent,b=e.classList.contains('oath');
  if(e.id==='go'){e.insertAdjacentHTML('afterbegin',ic('play',2));return}
  if(!b&&e.parentNode===c)return;
  if(b){const n=kind==='pause'?(/Diario/.test(t)?'book':/Ajustes/.test(t)?'gear':/Guardar/.test(t)?'door':/Consola/.test(t)?'rune':''):(SEC[cur]==='gem'&&cur==='Reliquias'?'gem':SEC[cur]||'rune');
   if(n){e.classList.add('hi');e.insertAdjacentHTML('afterbegin','<span class="ico">'+ic(n,3)+'</span>')}}});
 c.querySelectorAll('.row button').forEach(e=>{if(e.querySelector('.px')||e.closest('h2'))return;const t=e.textContent,n=/Diario/.test(t)?'book':/Mapa/.test(t)?'door':/Esperar/.test(t)?'rune':'';if(n)e.insertAdjacentHTML('afterbegin',ic(n,2))});
}
const wrap=(name,kind)=>{const o=window[name];if(typeof o!=='function')return;window[name]=function(a){const r=o.apply(this,arguments);try{deco(kind,name==='openRest'&&a)}catch(e){console.error('MENUS_PIXEL',e)}return r}};
wrap('openRest','rest');wrap('openPause','pause');
const cm=window.closeM;if(typeof cm==='function')window.closeM=function(){const m=document.getElementById('menu');if(m)m.classList.remove('hog','pau');return cm.apply(this,arguments)};

// ---- diálogos: texto que se escribe + sonido de voz ----
let tkn=0;const blip=nm=>{try{sfx(140+(hs(nm)%7)*30,.035,'square',.025)}catch(e){}};
function dfx(n){const d=document.getElementById('dlg');if(!d||!n||G.nd!==n)return;
 const p=d.querySelector('p'),pt=null;if(!p)return;const id=++tkn,ns=[],w=document.createTreeWalker(p,NodeFilter.SHOW_TEXT);let t;
 while(t=w.nextNode())ns.push([t,t.nodeValue]);ns.forEach(a=>a[0].nodeValue='');let ni=0,ci=0,tot=0;
 const done=()=>{ns.forEach(a=>a[0].nodeValue=a[1]);if(pt)pt.classList.remove('tk');d._tk=0};
 d._tk=done;if(pt)pt.classList.add('tk');
 const step=()=>{if(id!==tkn||d.style.display==='none')return;
  for(let k=0;k<2;k++){if(ni>=ns.length){done();return}const s=ns[ni][1];ci++;ns[ni][0].nodeValue=s.slice(0,ci);const ch=s[ci-1];if(ch&&ch!==' '&&(++tot%2===0))blip(n.n||'');if(ci>=s.length){ni++;ci=0}}
  setTimeout(step,32)};step()}
if(typeof window.say==='function'){const os=window.say;window.say=function(n){const r=os.apply(this,arguments);try{dfx(n)}catch(e){console.error('DLG_PIXEL',e)}return r}}
{const d=document.getElementById('dlg');if(d)d.addEventListener('click',e=>{if(d._tk){e.stopPropagation();e.preventDefault();d._tk()}},true)}
})();
