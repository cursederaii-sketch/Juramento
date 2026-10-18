// ===== RUTA DEL RÍO (v8.26): si el puente cae, ya no hay vuelta atrás =====
// Tras la caída (S.rv['campos:muertos']) el Remanso del Río deja de conectar con los Campos del Exilio y pasa a llevar
// directo al Valle de la Corona (antesala del castillo → trono). Todo lo anterior queda sellado:
//  · el Remanso pierde su portal oeste y su portal este cambia de destino;
//  · cualquier intento de cargar una región fuera de la ruta (hoguera, partida guardada, portal) te deja en el Remanso;
//  · el menú "Viajar" solo ofrece hogueras de la ruta.
// Cargar DESPUÉS de campos.js y castillo*.js.
(function(){
const RUTA=['ribera','cauce','cisterna','valcor','entrada','gransalon','cocinas','capilla','biblioteca','trono','crater'];
const caido=()=>!!(S&&S.rv&&(S.rv['campos:muertos']||S.rv['campos:roto']));
const idx=id=>RG.findIndex(r=>r.id===id);

// Remanso: sin salida oeste; la salida este lleva al Valle de la Corona
{const R=RG.find(r=>r.id==='ribera');if(R){const b=R.build;R.build=function(W){b.call(this,W);if(!caido())return;
 W.portals=W.portals.filter(q=>q.id!=='oeste');
 const q=W.portals.find(p=>p.id==='este');if(q){q.to='cauce';q.at='ribera';q.k='Seguir el río bajo la capital';q.sx=-22;q.sy=0}}}}

// sellado: ninguna carga de región fuera de la ruta; hogueras de fuera desaparecen del menú Viajar
{const lr=loadRegion;loadRegion=function(i,fi,at){
 // en cooperativo el invitado no viaja (net.js lo sigue al anfitrión) y su partida propia no se toca: el sellado solo lo aplica quien manda
 const inv=!!(window.NET&&NET.on&&!NET.host);
 if(caido()&&!inv){
  const keep=k=>{const r=RG[+String(k).split(':')[0]];return r&&RUTA.includes(r.id)};
  S.fires=S.fires.filter(keep);
  if(RG[i]&&!RUTA.includes(RG[i].id)){i=idx('ribera');fi=0;at=undefined}
  if(S.bf&&RG[S.bf.r]&&!RUTA.includes(RG[S.bf.r].id))S.bf={r:idx('ribera'),x:0};
 }
 lr(i,fi,at);
 if(caido()&&!inv&&rg&&rg.id==='valcor'&&!S.rv['ruta:valcor']){S.rv['ruta:valcor']=1;try{toast('El río no vuelve atrás. Delante, solo el castillo.')}catch(e){}}
}}

LNK.push(['ribera','cauce'],['cauce','cisterna'],['cisterna','valcor']);
Object.assign(REGINFO,{valcor:(REGINFO.valcor||[]).concat(['Ruta del río: se llega desde el Remanso, sin vuelta atrás'])});
})();
