# Rediseño editorial del hero + tarjeta de invitación al chat — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rediseñar el `<nav>` y `.hero` de `dolphinstats-web` con una dirección editorial más calmada (menos badges/glassmorphism, tipografía protagonista, acento aqua restringido, gráfico de datos abstracto en vez de foto de stock), y agregar una tarjeta de invitación al chat que aparece por tiempo.

**Architecture:** Sitio estático de una sola página, sin build step. Todo el CSS vive inline en `<style>` dentro de `index.html` (dos bloques: uno global arriba, uno del chat widget al final del `<body>`); el JS vive en `app.js` (un solo IIFE). No se introduce ningún framework, bundler ni dependencia nueva — se edita HTML/CSS/JS plano directamente.

**Tech Stack:** HTML5, CSS plano, JavaScript vanilla (ES5-compatible, ya es el estilo del `app.js` existente — `var`, `function`, sin arrow functions ni `let/const`). SVG inline para el gráfico del hero.

## Global Constraints

- No se toca ninguna sección del sitio fuera de `<nav>` y `.hero` (líneas ~40-100 y ~286-340 de `index.html`), salvo el widget de chat al final del `<body>` (líneas ~753-874) donde se agrega la tarjeta de invitación.
- Se mantiene el fondo navy oscuro (`--ocean:#0a1628`) y el acento aqua (`--aqua:#00d4ff`) — no hay cambio a tema claro.
- Cero dependencias/imágenes nuevas: el reemplazo del hero-media es SVG inline, no un archivo de imagen.
- El JS sigue el estilo ES5 del `app.js` existente (mismo IIFE, `var`, sin sintaxis moderna) para no introducir un estilo de código distinto en el mismo archivo.
- La tarjeta de invitación reutiliza la función `openChat()` ya definida en `app.js` — no se duplica la lógica de apertura del overlay del chat.
- No hay framework de tests ni `package.json` en este repo (sitio estático puro) — la verificación de cada tarea es manual, vía el Browser pane, abriendo `index.html` directamente (`file://.../index.html`).

---

### Task 1: Simplificar nav y `.hero-tag`

**Files:**
- Modify: `index.html:40` (regla `nav{...}`)
- Modify: `index.html:69` (regla `.hero-tag{...}`)
- Modify: `index.html:317` (markup del `.hero-tag`)

**Interfaces:**
- Consumes: nada (cambio puramente visual, sin JS).
- Produces: nada que otras tareas consuman — es independiente.

- [ ] **Step 1: Reducir el blur/peso visual del nav**

En `index.html:40`, reemplazar:
```css
nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:1.2rem 2rem;display:flex;justify-content:space-between;align-items:center;backdrop-filter:blur(20px);border-bottom:1px solid rgba(0,212,255,.1);background:rgba(10,22,40,.85)}
```
por:
```css
nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:1.2rem 2rem;display:flex;justify-content:space-between;align-items:center;backdrop-filter:blur(10px);border-bottom:1px solid rgba(255,255,255,.06);background:rgba(10,22,40,.92)}
```
(Menos blur, borde más neutro y sutil, fondo un poco más sólido para compensar el blur reducido.)

- [ ] **Step 2: Simplificar `.hero-tag` de badge a eyebrow editorial**

En `index.html:69`, reemplazar:
```css
.hero-tag{display:inline-flex;align-items:center;gap:.5rem;background:rgba(0,212,255,.1);border:1px solid rgba(0,212,255,.3);color:var(--aqua);font-size:.8rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;padding:.4rem 1rem;border-radius:100px;margin-bottom:2rem;width:fit-content;animation:fadeUp .8s ease both}
```
por:
```css
.hero-tag{display:inline-flex;align-items:center;gap:.7rem;color:var(--aqua);font-size:.78rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase;margin-bottom:2rem;width:fit-content;animation:fadeUp .8s ease both}
.hero-tag::before{content:'';width:28px;height:1px;background:var(--aqua)}
```
(Se quita el fondo/borde/padding tipo pill; queda como texto con una línea corta al inicio — patrón "eyebrow" editorial.)

- [ ] **Step 3: Actualizar el markup del hero-tag (sin cambios de texto, la clase ya aplica el nuevo estilo)**

Confirmar que `index.html:317` sigue siendo:
```html
<div class="hero-tag">Consultoría científica especializada · Lima, Perú</div>
```
No requiere cambio de markup — el nuevo look viene solo del CSS de los steps 1-2.

- [ ] **Step 4: Verificar visualmente**

Abrir el Browser pane en `file:///C:/Users/ASUS/Desktop/Claude/dolphinstats-web/index.html` (herramienta `navigate`). Confirmar con `read_page` o una captura que:
- El nav ya no tiene el blur pesado ni el borde aqua tenue anterior.
- El texto "Consultoría científica especializada · Lima, Perú" aparece como texto simple con una línea corta a la izquierda, sin caja/pill de fondo.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "style: simplifica nav y hero-tag a dirección editorial (menos glassmorphism/badges)"
```

---

### Task 2: Reemplazar los pills de `.hero-specs` por texto plano

**Files:**
- Modify: `index.html:84-85` (reglas `.hero-specs`/`.hero-spec`)
- Modify: `index.html:320-326` (markup de la lista de specs)

**Interfaces:**
- Consumes: nada.
- Produces: nada que otras tareas consuman.

- [ ] **Step 1: Reemplazar las reglas CSS**

En `index.html:84-85`, reemplazar:
```css
  .hero-specs{display:flex;flex-wrap:wrap;gap:.6rem;margin-bottom:2.5rem;animation:fadeUp .8s ease .25s both}
  .hero-spec{background:rgba(0,212,255,.07);border:1px solid rgba(0,212,255,.2);color:var(--aqua);font-size:.8rem;font-weight:500;padding:.3rem .85rem;border-radius:100px}
```
por:
```css
  .hero-specs{color:var(--muted);font-size:.85rem;letter-spacing:.01em;line-height:1.7;max-width:520px;margin-bottom:2.5rem;animation:fadeUp .8s ease .25s both}
```

- [ ] **Step 2: Reemplazar el markup**

En `index.html:320-326`, reemplazar:
```html
      <div class="hero-specs">
        <span class="hero-spec">Bioestadística avanzada</span>
        <span class="hero-spec">Epidemiología clínica</span>
        <span class="hero-spec">Tesis ciencias de la salud</span>
        <span class="hero-spec">Publicación Scopus / SciELO</span>
        <span class="hero-spec">IA aplicada a investigación</span>
      </div>
```
por:
```html
      <p class="hero-specs">Bioestadística avanzada · Epidemiología clínica · Tesis ciencias de la salud · Publicación Scopus / SciELO · IA aplicada a investigación</p>
```

- [ ] **Step 3: Verificar visualmente**

En el Browser pane (misma pestaña de la Task 1), recargar y confirmar con `read_page`/`get_page_text` que la línea de especialidades aparece como texto plano en gris (`--muted`), sin cinco cajas con borde aqua.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "style: reemplaza pills de hero-specs por línea de texto (uso restringido del acento)"
```

---

### Task 3: Reemplazar la foto de stock del hero por un gráfico de datos SVG

**Files:**
- Modify: `index.html:93-98` (reglas `.hero-media`)
- Modify: `index.html:332-338` (markup de `.hero-media`)

**Interfaces:**
- Consumes: nada.
- Produces: nada que otras tareas consuman.

- [ ] **Step 1: Actualizar las reglas CSS de `.hero-media`**

En `index.html:93-98`, reemplazar:
```css
  .hero-media{position:relative;animation:fadeUp .8s ease .35s both}
  .hero-media .frame{position:relative;border-radius:18px;overflow:hidden;border:1px solid rgba(0,212,255,.22);box-shadow:0 20px 50px rgba(0,0,0,.45)}
  .hero-media img{width:100%;display:block;aspect-ratio:4/5;object-fit:cover}
  .hero-media .tint{position:absolute;inset:0;background:linear-gradient(160deg,rgba(0,212,255,.10),rgba(10,22,40,.55))}
  .hero-media .chip{position:absolute;bottom:14px;left:14px;background:rgba(10,22,40,.82);border:1px solid rgba(0,212,255,.25);border-radius:12px;padding:.55rem .8rem;font-size:.78rem;color:var(--white);display:flex;align-items:center;gap:.5rem}
  .hero-media .chip b{color:var(--accent);font-weight:600}
```
por:
```css
  .hero-media{position:relative;animation:fadeUp .8s ease .35s both}
  .hero-media .frame{position:relative;aspect-ratio:4/5;border-radius:18px;overflow:hidden;border:1px solid rgba(0,212,255,.22);box-shadow:0 20px 50px rgba(0,0,0,.45);background:linear-gradient(160deg,rgba(0,212,255,.07),rgba(10,22,40,.95))}
  .hero-graphic{width:100%;height:100%;display:block}
  .hero-graphic .pt{transform-box:fill-box;transform-origin:center;opacity:0;animation:ds-pt-in .5s ease forwards}
  .hero-graphic .line{stroke-dasharray:520;stroke-dashoffset:520;animation:ds-line-draw 1.4s ease .5s forwards}
  @keyframes ds-pt-in{from{opacity:0;transform:scale(.3)}to{opacity:1;transform:scale(1)}}
  @keyframes ds-line-draw{to{stroke-dashoffset:0}}
  .hero-media .chip{position:absolute;bottom:14px;left:14px;background:rgba(10,22,40,.82);border:1px solid rgba(0,212,255,.25);border-radius:12px;padding:.55rem .8rem;font-size:.78rem;color:var(--white);display:flex;align-items:center;gap:.5rem}
  .hero-media .chip b{color:var(--accent);font-weight:600}
```
(Se quita `.hero-media img`/`.tint` que ya no existen en el markup; se agrega `.hero-graphic` y las animaciones de entrada de los puntos y el trazo de la línea de regresión. `.chip` se mantiene igual.)

- [ ] **Step 2: Reemplazar el markup de `.hero-media`**

En `index.html:332-338`, reemplazar:
```html
    <div class="hero-media">
      <div class="frame">
        <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=700&q=80&auto=format&fit=crop" alt="Manos analizando datos clínicos en una laptop junto a un estetoscopio — bioestadística DolphinStats" width="700" height="875" fetchpriority="high" decoding="async">
        <div class="tint"></div>
        <div class="chip">🩺 <span>Del <b>dato clínico</b> al resultado</span></div>
      </div>
    </div>
```
por:
```html
    <div class="hero-media">
      <div class="frame">
        <svg class="hero-graphic" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Gráfico de dispersión con línea de regresión, representando análisis bioestadístico">
          <line class="line" x1="20" y1="450" x2="380" y2="140" stroke-width="2" stroke-linecap="round" style="stroke:var(--aqua);opacity:.55"/>
          <circle class="pt" cx="40" cy="420" r="5" style="fill:var(--aqua);animation-delay:.05s"/>
          <circle class="pt" cx="65" cy="395" r="4" style="fill:var(--lavender);animation-delay:.10s"/>
          <circle class="pt" cx="90" cy="430" r="5" style="fill:var(--aqua);animation-delay:.15s"/>
          <circle class="pt" cx="60" cy="380" r="4" style="fill:var(--accent);animation-delay:.20s"/>
          <circle class="pt" cx="110" cy="370" r="5" style="fill:var(--aqua);animation-delay:.25s"/>
          <circle class="pt" cx="95" cy="410" r="4" style="fill:var(--lavender);animation-delay:.30s"/>
          <circle class="pt" cx="140" cy="350" r="5" style="fill:var(--aqua);animation-delay:.35s"/>
          <circle class="pt" cx="125" cy="390" r="4" style="fill:var(--accent);animation-delay:.40s"/>
          <circle class="pt" cx="170" cy="330" r="5" style="fill:var(--aqua);animation-delay:.45s"/>
          <circle class="pt" cx="155" cy="365" r="4" style="fill:var(--lavender);animation-delay:.50s"/>
          <circle class="pt" cx="200" cy="300" r="5" style="fill:var(--aqua);animation-delay:.55s"/>
          <circle class="pt" cx="185" cy="340" r="4" style="fill:var(--accent);animation-delay:.60s"/>
          <circle class="pt" cx="230" cy="280" r="5" style="fill:var(--aqua);animation-delay:.65s"/>
          <circle class="pt" cx="270" cy="240" r="5" style="fill:var(--aqua);animation-delay:.70s"/>
          <circle class="pt" cx="250" cy="270" r="4" style="fill:var(--lavender);animation-delay:.75s"/>
          <circle class="pt" cx="310" cy="200" r="5" style="fill:var(--aqua);animation-delay:.80s"/>
          <circle class="pt" cx="330" cy="175" r="4" style="fill:var(--accent);animation-delay:.85s"/>
          <circle class="pt" cx="360" cy="150" r="5" style="fill:var(--aqua);animation-delay:.90s"/>
        </svg>
        <div class="chip">🩺 <span>Del <b>dato clínico</b> al resultado</span></div>
      </div>
    </div>
```

- [ ] **Step 3: Verificar visualmente**

En el Browser pane, recargar y confirmar:
- Ya no hay ninguna petición de red a `images.unsplash.com` (revisar con `read_network_requests`, filtrando `urlPattern: "unsplash"` — debe devolver 0 resultados).
- El gráfico SVG se ve dentro del frame con el mismo `border-radius`/sombra que antes, con los puntos y la línea animándose al cargar.
- El `chip` "Del dato clínico al resultado" sigue visible sobre el gráfico.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: reemplaza foto de stock del hero por gráfico SVG de dispersión con regresión"
```

---

### Task 4: Markup y estilos de la tarjeta de invitación al chat

**Files:**
- Modify: `index.html:853` (agregar CSS al final del `<style>` del widget de chat, antes de `</style>`)
- Modify: `index.html:868` (agregar el HTML de la tarjeta, entre `#ds-chat-overlay` y el comentario de cierre del widget)

**Interfaces:**
- Consumes: nada.
- Produces: `#ds-invite-card`, `#ds-invite-close`, `#ds-invite-chat`, `#ds-invite-dismiss` (ids que la Task 5 usa desde `app.js`); clases `.ds-open` y `.ds-visible` (que la Task 5 añade/quita para mostrar/ocultar con transición).

- [ ] **Step 1: Agregar el CSS de la tarjeta**

En `index.html`, inmediatamente antes de la línea `</style>` que cierra el bloque de estilos del chat widget (línea 853, justo después de la media query `@media (max-width: 480px) { #ds-chat-overlay {...} }`), agregar:
```css
  #ds-invite-card {
    position: fixed;
    bottom: 112px;
    right: 28px;
    z-index: 9997;
    width: 280px;
    background: #0a1628;
    border: 1px solid rgba(0,212,255,.3);
    border-radius: 16px;
    padding: 18px 18px 16px;
    box-shadow: 0 12px 40px rgba(0,0,0,.5);
    display: none;
    opacity: 0;
    transform: translateY(12px);
    transition: opacity .3s ease, transform .3s ease;
  }
  #ds-invite-card.ds-open { display: block; }
  #ds-invite-card.ds-open.ds-visible { opacity: 1; transform: translateY(0); }
  #ds-invite-close {
    position: absolute;
    top: 8px;
    right: 10px;
    background: none;
    border: none;
    color: #8899bb;
    font-size: 16px;
    cursor: pointer;
    line-height: 1;
    padding: 4px;
  }
  #ds-invite-close:hover { color: #f0f8ff; }
  #ds-invite-text {
    color: #f0f8ff;
    font-size: .88rem;
    line-height: 1.5;
    margin: 0 0 14px;
    padding-right: 12px;
  }
  #ds-invite-actions { display: flex; flex-direction: column; gap: 8px; }
  .ds-invite-btn-primary {
    background: #00d4ff;
    color: #0a1628;
    border: none;
    border-radius: 10px;
    padding: 9px 14px;
    font-weight: 700;
    font-size: .85rem;
    cursor: pointer;
    transition: box-shadow .2s;
  }
  .ds-invite-btn-primary:hover { box-shadow: 0 0 20px rgba(0,212,255,.5); }
  .ds-invite-btn-ghost {
    background: none;
    color: #8899bb;
    border: 1px solid rgba(255,255,255,.15);
    border-radius: 10px;
    padding: 9px 14px;
    font-weight: 600;
    font-size: .85rem;
    cursor: pointer;
    transition: border-color .2s, color .2s;
  }
  .ds-invite-btn-ghost:hover { border-color: #00d4ff; color: #00d4ff; }
  @media (max-width: 480px) {
    #ds-invite-card { width: calc(100vw - 24px); right: 12px; bottom: 108px; }
  }
```

- [ ] **Step 2: Agregar el markup de la tarjeta**

En `index.html`, justo después de `</div>` que cierra `#ds-chat-overlay` (línea 868) y antes del comentario `<!-- ── /DolphinStats Chat Widget ── -->`, agregar:
```html
<div id="ds-invite-card" role="dialog" aria-label="Invitación a chatear">
  <button id="ds-invite-close" aria-label="Cerrar invitación">&times;</button>
  <p id="ds-invite-text">¿Tienes dudas sobre tu proyecto? Te ayudamos a resolverlas ahora mismo.</p>
  <div id="ds-invite-actions">
    <button id="ds-invite-chat" class="ds-invite-btn-primary">Chatear ahora</button>
    <button id="ds-invite-dismiss" class="ds-invite-btn-ghost">No, gracias</button>
  </div>
</div>
```

- [ ] **Step 3: Verificar que la tarjeta existe pero está oculta por defecto**

En el Browser pane, recargar y ejecutar con `javascript_tool`:
```js
getComputedStyle(document.getElementById('ds-invite-card')).display
```
Debe devolver `"none"` (todavía no hay JS que la muestre — eso es la Task 5).

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: agrega markup y estilos de la tarjeta de invitación al chat"
```

---

### Task 5: Comportamiento JS de la tarjeta de invitación

**Files:**
- Modify: `app.js:76-82` (agregar el bloque nuevo después del bloque "Pricing CTAs open the chat widget", dentro del mismo IIFE)

**Interfaces:**
- Consumes: `openChat()` (función ya definida en `app.js:56-61`), `btn` (variable ya definida en `app.js:44`, referencia a `#ds-chat-btn`), y los ids/clases producidos por la Task 4 (`#ds-invite-card`, `#ds-invite-close`, `#ds-invite-chat`, `#ds-invite-dismiss`, clases `.ds-open`/`.ds-visible`).
- Produces: nada que otra tarea consuma — es la última pieza de lógica del feature.

- [ ] **Step 1: Agregar el bloque de la tarjeta de invitación al final del IIFE**

En `app.js`, reemplazar el cierre del archivo:
```js
  // Pricing CTAs open the chat widget
  document.querySelectorAll('.precio-cta').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      openChat();
    });
  });
})();
```
por:
```js
  // Pricing CTAs open the chat widget
  document.querySelectorAll('.precio-cta').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      openChat();
    });
  });

  // Chat invite card — aparece una vez por sesión, por tiempo
  var inviteCard = document.getElementById('ds-invite-card');
  var inviteChatBtn = document.getElementById('ds-invite-chat');
  var inviteDismissBtn = document.getElementById('ds-invite-dismiss');
  var inviteCloseBtn = document.getElementById('ds-invite-close');
  var INVITE_DISMISSED_KEY = 'ds_invite_dismissed';
  var INVITE_DELAY_MS = 9000;

  function inviteDismissed() {
    try {
      return sessionStorage.getItem(INVITE_DISMISSED_KEY) === '1';
    } catch (e) {
      return false;
    }
  }
  function markInviteDismissed() {
    try {
      sessionStorage.setItem(INVITE_DISMISSED_KEY, '1');
    } catch (e) {}
  }
  function hideInvite() {
    if (!inviteCard) return;
    inviteCard.classList.remove('ds-visible');
    setTimeout(function () {
      inviteCard.classList.remove('ds-open');
    }, 300);
  }
  function showInvite() {
    if (!inviteCard || inviteDismissed()) return;
    inviteCard.classList.add('ds-open');
    requestAnimationFrame(function () {
      inviteCard.classList.add('ds-visible');
    });
  }

  if (inviteCard) {
    setTimeout(function () {
      if (!inviteDismissed()) showInvite();
    }, INVITE_DELAY_MS);

    if (inviteChatBtn) {
      inviteChatBtn.addEventListener('click', function () {
        markInviteDismissed();
        hideInvite();
        openChat();
      });
    }
    if (inviteDismissBtn) {
      inviteDismissBtn.addEventListener('click', function () {
        markInviteDismissed();
        hideInvite();
      });
    }
    if (inviteCloseBtn) {
      inviteCloseBtn.addEventListener('click', function () {
        markInviteDismissed();
        hideInvite();
      });
    }
    if (btn) {
      btn.addEventListener('click', function () {
        markInviteDismissed();
        hideInvite();
      });
    }
  }
})();
```

- [ ] **Step 2: Verificar que aparece por tiempo**

En el Browser pane, recargar `index.html`. Ejecutar con `javascript_tool` para adelantar el reloj sin esperar 9s reales (parchear `setTimeout` no es viable desde afuera; en su lugar, esperar con la acción `wait` del Browser pane):
```
computer{action:"wait", duration: 10}
```
Luego:
```js
document.getElementById('ds-invite-card').classList.contains('ds-visible')
```
Debe devolver `true`.

- [ ] **Step 3: Verificar que "No, gracias" la oculta y no vuelve a aparecer en la sesión**

Con la tarjeta visible (tras el Step 2), hacer clic en el botón con texto "No, gracias" (`find` con query "No, gracias" para obtener su `ref`, luego `computer{action:"left_click", ref:...}`). Verificar:
```js
sessionStorage.getItem('ds_invite_dismissed')
```
Debe devolver `"1"`. Recargar la página (`navigate` a la misma URL) y esperar 10s de nuevo — la tarjeta NO debe reaparecer (`classList.contains('ds-visible')` debe seguir siendo `false`), porque `sessionStorage` persiste entre recargas de la misma pestaña/sesión.

- [ ] **Step 4: Verificar que "Chatear ahora" abre el overlay del chat**

En una sesión nueva (limpiar `sessionStorage` con `javascript_tool`: `sessionStorage.clear()`, luego recargar y esperar los 9s), hacer clic en "Chatear ahora". Verificar:
```js
document.getElementById('ds-chat-overlay').classList.contains('open')
```
Debe devolver `true`, y la tarjeta de invitación debe haber quedado oculta (`ds-invite-card` sin la clase `ds-visible`).

- [ ] **Step 5: Commit**

```bash
git add app.js
git commit -m "feat: comportamiento de la tarjeta de invitación al chat (timer + sessionStorage)"
```

---

### Task 6: Verificación final end-to-end (desktop + mobile)

**Files:** ninguno (solo verificación, sin cambios de código).

**Interfaces:**
- Consumes: el resultado completo de las Tasks 1-5.
- Produces: nada.

- [ ] **Step 1: Verificación en viewport desktop**

En el Browser pane, con `index.html` cargado a tamaño desktop (por defecto), tomar una captura (`computer{action:"screenshot"}`) y confirmar visualmente:
- Nav sin blur pesado.
- Hero-tag como texto simple con línea, sin pill.
- Línea de especialidades como texto plano gris.
- Gráfico SVG de dispersión (no foto) en el lado derecho del hero, con el chip "Del dato clínico al resultado" superpuesto.

- [ ] **Step 2: Verificación en viewport mobile**

Usar `resize_window{preset:"mobile"}`, recargar, y confirmar con captura que:
- El hero pasa a una sola columna (`grid-template-columns:1fr`, ya definido en la media query existente de `index.html:264` — no se tocó, debe seguir funcionando).
- El gráfico SVG se sigue viendo correctamente proporcionado (no recortado de forma extraña) dentro de `.hero-media{max-width:420px}`.
- La tarjeta de invitación (tras esperar los 9s) se ajusta al ancho de pantalla (`width: calc(100vw - 24px)` de la media query de la Task 4).

Volver a `resize_window{preset:"desktop"}` al terminar.

- [ ] **Step 3: Revisar la consola del navegador**

Ejecutar `read_console_messages{onlyErrors:true}`. Debe devolver "No console logs" o una lista vacía — cero errores de JS introducidos por los cambios.

- [ ] **Step 4: Commit final (si Step 1-3 requirieron ajustes)**

Si alguno de los checks anteriores llevó a un ajuste de CSS/JS, commitear ese ajuste puntual:
```bash
git add index.html app.js
git commit -m "fix: ajustes de verificación visual del rediseño del hero"
```
Si no hubo ajustes, este paso no aplica — las Tasks 1-5 ya dejaron todo commiteado.
