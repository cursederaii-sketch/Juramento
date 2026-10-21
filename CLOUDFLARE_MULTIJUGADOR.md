# Juramento — desplegar el multijugador en Cloudflare Workers

Esta versión conserva el protocolo de `net.js`, `chat.js` y `lobby.js`. El Worker publica los archivos del juego y pasa las conexiones WebSocket a `JuramentoHub`, un Durable Object que coordina el lobby global, los códigos de sala y el reenvío de mensajes. No hay que alquilar una VPS ni mantener un proceso Node encendido.

## Qué queda integrado

- Lobby global: presencia, posiciones, chat global y lista de salas públicas.
- Salas cooperativas de hasta 4 personas, públicas o privadas mediante código.
- Reenvío de snapshots y eventos de combate con el mismo protocolo que usa el proyecto.
- Chat de texto del grupo y señalización WebRTC para voz; la voz sigue yendo de navegador a navegador, no a través del Worker.
- El campo Servidor propone automáticamente el mismo origen donde está publicado el juego.
- `/health` devuelve `ok · Juramento Cloudflare multiplayer`.

## Despliegue (requiere una cuenta Cloudflare)

1. Descomprime todo el ZIP y abre una terminal en esa carpeta (la que contiene `wrangler.toml` e `index.html`).
2. Instala Node.js 20 o una versión compatible reciente.
3. Entra a Cloudflare con Wrangler:

   ```bash
   npx wrangler@latest login
   ```

4. Haz primero una comprobación de configuración/empaquetado:

   ```bash
   npx wrangler@latest deploy --dry-run
   ```

5. Publica:

   ```bash
   npx wrangler@latest deploy
   ```

6. Wrangler mostrará la URL `https://juramento-coop.<tu-subdominio>.workers.dev`. Abre esa dirección, pulsa **Jugar → Multijugador → Unirse al servidor global**, crea una sala pública y prueba con otro navegador/dispositivo desde otra red. Como el juego y el WebSocket usan el mismo origen, no hay que escribir el servidor a mano.

Para comprobar el backend, abre `https://juramento-coop.<tu-subdominio>.workers.dev/health`.

## Cómo funciona el backend

- `wrangler.toml`: configura Workers Static Assets, el binding `JURAMENTO_HUB` y la migración de `JuramentoHub`.
- `cloudflare/worker.js`: sirve los estáticos por `env.ASSETS.fetch()` y las conexiones WebSocket por un Durable Object.
- `.assetsignore`: evita publicar el código de servidor Node, el Worker y archivos de despliegue como recursos web descargables.
- `net.js`: establece por defecto el origen actual como servidor WebSocket cuando se ejecuta por HTTP/HTTPS.

El Durable Object usa la API de WebSocket Hibernation. La pequeña información de cada conexión se serializa en el attachment del socket para que el coordinador pueda reconstruir el lobby y las salas cuando vuelva de hibernación.

## Importante: coste cero y cuotas

Este despliegue no necesita un servidor dedicado, pero **no promete recursos ilimitados sin coste**. La documentación de Cloudflare consultada indica para Durable Objects en el plan Free 100.000 requests/día y 13.000 GB-s de duración/día; si se supera cualquiera de esos límites, las operaciones del tipo afectado pueden fallar hasta el reinicio diario de cuota. La documentación también explica que los mensajes WebSocket entrantes se contabilizan con una proporción 20:1 a efectos de facturación de requests (los mensajes salientes no se cobran como requests). Consulta siempre el plan vigente antes de publicar.

El juego solo envía lo que cambió (desde v8.53). Peor caso, combate continuo de una sala llena: el anfitrión envía snapshots a 15 Hz (54.000 mensajes entrantes/hora ≈ 2.700 requests facturables/hora) y cada invitado su estado a 10 Hz (36.000 mensajes/hora ≈ 1.800 requests/hora por invitado), unos 8.100 requests/hora para cuatro jugadores: igual que antes. Fuera de combate baja bastante:

- **Anfitrión**: si no hay enemigos despiertos, proyectiles, rocas ni jefe, los snapshots bajan de 15 a 8 Hz. Si además no cambió nada (enemigos, muertes, proyectiles, posición o estado de los jugadores), no se envía nada salvo un latido por segundo (≈ 180 requests facturables/hora).
- **Invitados**: el estado propio solo se envía si cambió (10 Hz como máximo mientras se mueven o actúan); quietos mandan un latido por segundo (≈ 180 requests/hora cada uno).
- El estado compartido del mundo (`sh`) se reenvía como mucho cada 5 s si no cambió.

Estos números son estimaciones a partir del código, no mediciones: el ahorro real depende de cuánto tiempo pasen los jugadores en combate. Con la cuota de 100.000 requests/día, una sala llena en combate continuo sigue durando unas 12 horas al día; con exploración tranquila rinde mucho más. Además, una sesión activa puede evitar que el Durable Object hiberne. El límite de 13.000 GB-s/día equivale a unas 28,9 horas de duración a 128 MB; si el objeto permanece activo 24 horas, consume alrededor de 10.800 GB-s/día. Este paquete está pensado como beta de bajo tráfico, no es una garantía de comunidad pública grande e ilimitada a coste cero. Vigila **Workers & Pages → Durable Objects → Usage** en Cloudflare y no actives el plan Workers Paid sin revisar primero el presupuesto.

## Límites funcionales heredados del juego

La red existente sigue usando al anfitrión como autoridad de la simulación: el anfitrión ejecuta enemigos/jefes y los invitados replican snapshots. No se convirtió en un servidor dedicado autoritativo. Los límites listados en `MULTIJUGADOR.md` siguen aplicando (por ejemplo, la ruta entre regiones la guía el anfitrión y el inicio de arenas/emboscadas lo decide el anfitrión).

## Probar localmente con el servidor Node anterior

Si no quieres desplegar todavía, se conserva `server/server.js`:

```bash
cd server
npm install
npm start
```

Abre `http://localhost:8080`. El archivo `net.js` usará `http://localhost:8080` como valor predeterminado mientras abras el juego desde ese servidor.

## Novedades de juego incluidas en esta versión (v8.26 – v8.30)

- **Ruta del Río (`ruta_rio.js`)**: si el puente de los Campos del Exilio cae, el Remanso del Río ya no vuelve a los Campos: lleva directo al Valle de la Corona y de ahí al trono. Las regiones y hogueras anteriores quedan selladas. En cooperativo el sellado lo aplica el anfitrión (que es quien guía el camino); el invitado solo sigue y su partida propia no se modifica.
- **Animaciones de sueño (`suenos_anim.js`)**: cada sueño de las hogueras tiene su escena animada, local a cada jugador (no se sincroniza por red). Consola: `SueAnim.start('d1')` … `'d6'`.
- Ambos se cargan en `index.html` justo después de `arrabales.js`, antes de `net.js`.
- **El Cauce Hundido (`cauce.js`, v8.28)**: región nueva de la ruta alternativa entre el Remanso y el Valle de la Corona. Sala de compuertas con dos palancas, hoguera, cámara secreta y mini-jefe (El Guardacauces). Se carga antes de `ruta_rio.js`.
- **La Cisterna Real (`cisterna.js`, v8.29)**: segundo tramo de la ruta alternativa (Cauce Hundido → Cisterna → Valle de la Corona). Dos puzzles en serie: el coro del agua (memoria sonora, 3 rondas) y cuatro válvulas en orden. Se carga después de `puzzles_v2.js` y `cauce.js`, antes de `ruta_rio.js`.
- **Preludio de los sueños (v8.30, dentro de `suenos_anim.js`)**: antes de cada sueño, ~6 s con el protagonista sentado frente a la hoguera (bebe del frasco, se le cierran los ojos, cabecea) que se disuelve en el sueño. Un toque salta el preludio; el siguiente cierra todo.

## Cambios v8.53

- **Peligros del escenario para todos**: fisuras del salón (`rey_fluido.js`) y grietas, cadenas, pozos, decretos, derrumbes y sentencia del cráter (`caida.js`) ahora se avisan a los invitados y cada uno los esquiva o sufre en su propio cliente. Los golpes de área y tajos anchos de los enemigos alcanzan a todos los jugadores dentro del radio (`net.js`, función `sweep`). Los ataques rojos del Rey tampoco se pueden parar en el invitado.
- **Menos requests**: snapshots del anfitrión y estado de los invitados solo cuando hay cambios (ver arriba).

## Cambios v8.54 — accesibilidad y modo foto (`accesibilidad.js`)

- **Ajustes → Accesibilidad**: daltonismo (protanopia, deuteranopia, tritanopia; corrección aproximada por filtro de color, no clínica), tamaño del texto (100/125/150 %, en menús, diálogos y textos pequeños del juego) y avisos de ataque con forma (triángulo para ataques normales, rombo con X para los rojos, que no se pueden parar).
- **Ajustes → Ayudas de dificultad** (opcionales y locales a cada jugador): daño recibido (100/75/50/25 %; las sentencias de un golpe no se tocan), recuperación de resistencia (×1, ×1,5, ×2) y tiempo de aviso de los enemigos (+25/+50 %, solo en solitario porque el anfitrión simula a los enemigos de todos).
- **Pausa → Modo foto**: cámara libre (flechas/WASD, Shift para ir rápido, o arrastrar), ocultar interfaz (H) y personajes (J), captura PNG a 4× (C/Enter; en móvil abre el menú de compartir si está disponible). En cooperativo el mundo sigue en marcha mientras fotografías. La captura no incluye el filtro de daltonismo.
- Ajustes guardados en `jur_cfg` (`cb`, `fsz`, `cues`, `adm`, `areg`, `awin`). `index.html` carga el módulo justo antes de `net.js`.

## Cambios v8.55 — combate vivo (`combate_anim.js`)

- **Capa solo visual** (no toca daño, IA, colisiones ni red; cada jugador la ve en su propio cliente). `index.html` la carga al final, después de `juice.js`.
- **Jugador**: cada golpe tiene anticipación (se encoge y echa atrás), embestida con estiramiento e inclinación, y recuperación con rebote. Destello en la punta del arma antes del tajo, líneas de velocidad, polvo y empujón de cámara. Los ligeros alternan el giro del torso; el pesado levanta una onda de polvo delante. También reaccionan la esquiva, el golpe recibido, la guardia y el andar/correr.
- **Enemigos**: se encogen al preparar, embisten al golpear y vuelven con rebote; se tambalean aturdidos, vibran al ser golpeados, se balancean en guardia y al morir salen despedidos con un salto corto. Pisotón con polvo y anillo en jefes y brutos.
- **Ajustes → Pantalla → Animación de combate**: Desactivada / Normal / Intensa (`cvivo` en `jur_cfg`). Respeta *Sacudida de cámara* y la calidad gráfica automática.
- Los golpes encadenados (cancelaciones de `combate_fluido.js`) ahora también disparan polvo, líneas y empujón en cada golpe.
