// ===== PUERTAS DE LA CAPITAL (v8.40): más contenido en el camino hasta el Caballero =====
// Carga DESPUÉS de desfiladero.js. La región era la más corta de la ruta (60x44, 6 enemigos): se suman encuentros,
// dos emboscadas y botín a lo largo del camino y de la sala previa a la arena. La arena del Caballero no se toca.
(function(){
const P=RG.find(r=>r.id==='puertas');if(!P)return;
const b=P.build;
P.build=function(W){b.call(this,W);
 // patrulla de un vigilante por el camino ancho del sur-este
 W.en('warden',34,36,{pat:[[31,36],[45,36]]});
 // soldados y arqueros que no estaban: el camino ya no se hace en silencio
 W.en('hollow',12,41);W.en('archer',20,36);W.en('soldier',27,36);W.en('brute',38,38);W.en('archer',44,34);W.en('hollow',47,39);
 // emboscada a campo abierto y otra en la sala previa a la arena
 W.amb('pt1',32,30,14,10,[['soldier',36,33],['archer',43,37],['brute',44,31]],{souls:400});
 W.amb('pt2',24,22,13,5,[['soldier',27,24],['archer',35,24],['hollow',31,25]],{souls:350});
 // botín repartido
 W.item(45,36,{sou:300});W.item(12,40,{n:2});W.item(40,26,{sou:250});W.item(25,34,{f:1});
};
})();
