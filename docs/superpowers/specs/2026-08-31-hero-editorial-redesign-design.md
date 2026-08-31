# Rediseño editorial del hero + tarjeta de invitación al chat

## Contexto

`dolphinstats-web` (`leonidcapo.github.io/DolphinStats`) es un sitio estático de
una sola página (`index.html`, sin build step) con tema oscuro navy/aqua
(`--ocean`, `--aqua`), tipografía Syne (display) + DM Sans (body), y un widget
de chat flotante (`#ds-chat-btn` → overlay con iframe a
`dolphinstats-bot.onrender.com`, función `openChat()` en `app.js`).

El usuario siente que el diseño actual se ve "genérico/plantilla" (glassmorphism
y badges con borde aqua en casi todo), usa fotos de stock de Unsplash poco
creíbles, y quiere subir el nivel percibido inspirándose en el estilo editorial
de OpenAI (calma, tipografía protagonista, uso restringido del color, poco
adorno) — sin abandonar la paleta navy/aqua de marca.

## Alcance de este prototipo

Solo `<nav>` + `.hero` (líneas ~40-100 y ~300-340 de `index.html` aprox.) y una
pieza nueva: la tarjeta de invitación al chat. **No** se tocan las demás ~10
secciones (servicios, diferenciales, método, precios, FAQ, etc.) ni la
estructura del `app.js` existente más allá de lo necesario para la tarjeta.

## Dirección visual

1. **Se mantiene** el fondo navy oscuro y el acento aqua — no hay cambio a tema
   claro.
2. **Tipografía protagonista**: el h1 (Syne) gana peso visual; menos
   dependencia de cajas/cards para jerarquía.
3. **Menos decoración**: el `.hero-tag` (pill con borde + glow) se simplifica a
   una etiqueta minimalista sin caja pesada. Se reduce el blur/glassmorphism
   del nav.
4. **Acento de color restringido**: el aqua deja de bordear todo elemento; se
   reserva para 1-2 momentos (un subrayado, un dato destacado).
5. **Imagen → gráfico abstracto de datos**: la foto de stock del hero
   (`hero-media`) se reemplaza por una pieza SVG/CSS generativa (nube de
   puntos + línea de regresión o distribución estadística), animada
   suavemente. Sin dependencias de imágenes externas.

## Tarjeta de invitación al chat

- **Trigger**: aparece ~8-10s después de cargar la página (timer en `app.js`),
  anclada cerca del botón flotante `#ds-chat-btn`.
- **Contenido**: texto corto invitando a chatear + dos acciones:
  - "Chatear ahora" → llama a la función `openChat()` ya existente en
    `app.js`.
  - "No, gracias" → descarta la tarjeta.
- **Persistencia de descarte**: `sessionStorage` — no se debe volver a mostrar
  en la misma sesión del navegador si el usuario la descarta, si hace clic en
  "Chatear ahora", o si abre el chat por su cuenta desde el botón 🐬.
- **Estilo**: card navy con borde sutil aqua, botón primario aqua, botón
  secundario tipo ghost — coherente con la dirección editorial del punto
  anterior, no una copia literal del estilo Microsoft (amarillo/azul) que
  inspiró la idea.

## Validación

Se implementa directamente en el `index.html` real (no en una herramienta de
mockup aparte) y se muestra corriendo en el navegador (Browser pane) para
revisión en condiciones reales — fuentes cargadas, responsive, animaciones.

## Fuera de alcance

- Las demás secciones del sitio (quedan con el estilo actual hasta una
  siguiente ronda, si el usuario aprueba esta dirección).
- Fotos reales del equipo (el usuario eligió gráficos abstractos, sin depender
  de fotos que aún no tiene).
- Cualquier cambio a `chatbot.py` / `DolphinStatsBot` — este spec es solo del
  sitio estático.
