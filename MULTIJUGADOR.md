# Juramento · cooperativo online (2-4 jugadores)

## Publicarlo gratis en Cloudflare

El paquete ahora incluye un backend compatible con Cloudflare Workers + Durable Objects. Sigue **[CLOUDFLARE_MULTIJUGADOR.md](CLOUDFLARE_MULTIJUGADOR.md)** para desplegar el juego y el multijugador en el mismo dominio. Necesitas iniciar sesión en tu propia cuenta Cloudflare; el ZIP no se publica automáticamente.

El servidor Node.js descrito más abajo sigue disponible para pruebas locales o como alternativa.

## Arrancar
    cd server
    npm install
    npm start            # http://localhost:8080  (PORT=3000 npm start para cambiar el puerto)

El mismo servidor sirve el juego y las salas. Abre la dirección, en el título pulsa MULTIJUGADOR,
elige tu slot y: "Crear sala" (serás el anfitrión) o escribe el código de 4 letras y "Unirse".
Para jugar por internet pon el servidor detrás de HTTPS (el navegador usará wss:// solo).

## Cómo funciona
- Anfitrión: corre la simulación de siempre. Cada enemigo ataca al jugador más cercano.
- Invitados: ven a los enemigos como fantasmas (15 instantáneas/s con interpolación); su daño lo calculan ellos y lo aplica el anfitrión.
- Compartido: región, enemigos, jefes vencidos, palancas, puertas, puzles, día/noche. Propio: almas, armas, atributos, reliquias y partida.
- Más jugadores = más vida (+60 % jefes, +25 % resto por cada invitado). Los menús del anfitrión no detienen el juego.

## Archivos
- net.js (nuevo, se carga el último) · server/ (nuevo) · render.js (+1 línea para dibujar jugadores) · index.html (+1 script)

## Límites conocidos de esta v1
- Solo el anfitrión viaja entre regiones; si muere el anfitrión se recarga la región para todos.
- (Corregido en v8.53) Los peligros de Ormund Cineris ya alcanzan a todos: fisuras del salón (rey_fluido.js) y grietas, cadenas, pozos de gravedad, decretos y sentencia del cráter (caida.js). El anfitrión avisa cada peligro (`{k:'hz'}` / `{k:'fis'}`) y cada jugador lo resuelve en su propio cliente, con su esquiva y su vida. Los golpes de área y los tajos anchos de cualquier enemigo también alcanzan a todos los jugadores dentro del radio, no solo a su objetivo. Los peligros apuntan por turnos a cada jugador vivo. Si el anfitrión acepta el Juramento de los Olvidados, la promesa sostiene a todos una vez frente a la sentencia.
- Las hogueras de un invitado no reaparecen enemigos; descansa el anfitrión para eso.
- No hay reconexión automática: si se cae la conexión hay que volver a unirse.

## Chat (v8)
- Texto: Enter o T para escribir, Enter para enviar, Esc para cancelar (o el botón 💬). Máx. 120 caracteres; el anfitrión limita el ritmo.
- Voz: botón 🎧 para unirse (pide permiso de micrófono), 🎤 / tecla V para silenciarte, 📞 para salir. Un punto verde marca a quien habla (sobre su personaje y en la lista del equipo).
- La voz va directa entre jugadores (WebRTC); el servidor solo reenvía la señalización. Los jugadores ven la IP de los demás en esa conexión.
- El micrófono exige HTTPS (o localhost). Con redes estrictas (móvil, empresa) puede hacer falta un servidor TURN:
  `localStorage.setItem('jur_mp_ice', JSON.stringify([{urls:'stun:stun.l.google.com:19302'},{urls:'turn:tu.servidor:3478',username:'u',credential:'p'}]))`
- Archivos nuevos: chat.js · cambios en net.js (ganchos NET.ext / NET.sub) e index.html (+1 script).

## Desde la app (APK)
El servidor NO va dentro de la app: tiene que estar encendido en otro sitio y la app se conecta a él.
- Lo más simple: en tu PC `cd server && npm start`, y en otra terminal `cloudflared tunnel --url http://localhost:8080`.
  Te da una dirección tipo https://xxxx.trycloudflare.com → en el campo Servidor pon `wss://xxxx.trycloudflare.com` (sin puerto).
- Con ws:// (IP de tu red) la app lo bloquea si usa HTTPS; haría falta permitir contenido mixto en el WebView.
- Para la voz, la app debe declarar el permiso RECORD_AUDIO y aceptar la petición del micrófono en el WebView (onPermissionRequest).
