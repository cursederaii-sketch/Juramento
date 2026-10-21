// ===== CONTROLES EN PC: panel de teclas en una esquina (sustituye al panel de PS4 cuando se juega con teclado) =====
// Solo aparece si IS_PC (puntero fino, sin táctil) y no hay mando conectado. Clic en el panel = plegar/desplegar.
(function(){
if(!window.IS_PC)return;
const rows=[['WASD','Movimiento'],['J','Ataque ligero'],['K','Ataque fuerte'],['Q / I','Bloquear'],['O','Ultimate'],['U','Rayo'],['E','Interactuar'],['L','Esquivar'],['Shift','Correr'],['F','Frasco'],['P','Pausa']];
const el=document.createElement('div');el.id='pcHelp';
el.innerHTML='<div class="ph">⌨ Controles</div><div class="pg">'+rows.map(r=>'<div class="pr"><b>'+r[0]+'</b><span>'+r[1]+'</span></div>').join('')+'</div>';
document.body.appendChild(el);
el.addEventListener('click',()=>el.classList.toggle('min'));
const sync=()=>el.classList.toggle('on',!document.body.classList.contains('gp'));
setInterval(sync,400);sync();
})();
