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

El juego envía snapshots desde el anfitrión a 15 Hz (54.000 mensajes entrantes/hora ≈ 2.700 requests facturables/hora) mientras hay invitados conectados. Ajusté la transmisión del estado del invitado a 10 Hz para controlar el consumo (36.000 mensajes/hora por invitado ≈ 1.800 requests facturables/hora). Una sala completa de cuatro jugadores puede consumir aproximadamente 8.100 requests facturables/hora solo en esos dos flujos; la cuota de 100.000 requests/día equivale a unas 12 horas de actividad de esa sala por día, antes de contar chat, lobby, conexiones y otras partidas. Además, una sesión activa puede evitar que el Durable Object hiberne. El límite de 13.000 GB-s/día equivale a unas 28,9 horas de duración a 128 MB; si el objeto permanece activo 24 horas, consume alrededor de 10.800 GB-s/día. Este paquete está pensado como beta de bajo tráfico, no es una garantía de comunidad pública grande e ilimitada a coste cero. Vigila **Workers & Pages → Durable Objects → Usage** en Cloudflare y no actives el plan Workers Paid sin revisar primero el presupuesto.

## Límites funcionales heredados del juego

La red existente sigue usando al anfitrión como autoridad de la simulación: el anfitrión ejecuta enemigos/jefes y los invitados replican snapshots. No se convirtió en un servidor dedicado autoritativo. Los límites listados en `MULTIJUGADOR.md` siguen aplicando (por ejemplo, la ruta entre regiones la guía el anfitrión y algunos peligros de escenario aún solo afectan al anfitrión).

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
