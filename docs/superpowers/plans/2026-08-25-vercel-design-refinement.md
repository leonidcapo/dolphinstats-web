# Vercel + Diseño: Refinamiento de dolphinstats-web — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aprovechar Vercel Analytics/Speed Insights/cache headers y refinar visualmente `dolphinstats-web` (tipografía, animaciones on-scroll, botón de chat, card de pricing destacada) sin cambiar identidad de marca ni introducir un build step.

**Architecture:** Sitio estático de un solo archivo (`index.html` con CSS embebido + `app.js`). Todos los cambios son ediciones directas a esos dos archivos más un `vercel.json` nuevo. Sin bundler, sin dependencias npm.

**Tech Stack:** HTML/CSS/JS vanilla, Vercel (Analytics, Speed Insights, static hosting), Python+Pillow (solo como herramienta local de build de imagen, no se ejecuta en producción).

## Global Constraints

- No introducir build step ni framework (spec: alcance "refinamiento", Approach A).
- CSP existente (`index.html:11`) usa `script-src 'self'` y `connect-src 'self'` — cualquier script agregado debe respetar esto (Vercel Analytics/Speed Insights auto-inyectados por Vercel se sirven desde `/_vercel/...` en el mismo origen, así que no requieren cambios de CSP).
- Todas las animaciones nuevas deben respetar `prefers-reduced-motion: reduce`.
- Trabajo en rama `feature/vercel-design-refinement` (ya existe, creada y con el commit del spec). Cada commit se pushea para generar Preview Deployment.
- No tocar el iframe del chat (`dolphinstats-bot.onrender.com`) ni su backend.

---

### Task 1: Habilitar Vercel Analytics y Speed Insights (dashboard, sin código)

**Files:** ninguno (configuración en el dashboard de Vercel).

- [ ] **Step 1: Habilitar Analytics**

Ir a `https://vercel.com/dolphin-stats/dolphinstats-web/analytics` → click "Enable Analytics".

- [ ] **Step 2: Habilitar Speed Insights**

Ir a `https://vercel.com/dolphin-stats/dolphinstats-web/speed-insights` → click "Enable Speed Insights".

- [ ] **Step 3: Verificar inyección automática**

Tras el próximo deploy, abrir la pestaña Network del navegador en `https://dolphinstats-web.vercel.app` y confirmar que cargan `/_vercel/insights/script.js` y `/_vercel/speed-insights/script.js` con status 200 (mismo origen, no requiere cambio de CSP).

No hay commit en este task (es config de plataforma, no código).

---

### Task 2: `vercel.json` con headers de cache y seguridad

**Files:**
- Create: `vercel.json`

**Interfaces:**
- Produces: archivo de configuración leído automáticamente por Vercel en cada deploy — no expone funciones ni se importa desde otros archivos.

- [ ] **Step 1: Crear `vercel.json`**

```json
{
  "headers": [
    {
      "source": "/logo-dolphin.png",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/logo-dolphin.webp",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/app.js",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=3600" }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

`app.js` usa cache corto (1h, no `immutable`) porque no está versionado por nombre de archivo y puede cambiar entre deploys; las imágenes sí son seguras con cache largo porque este plan no las sobrescribe con el mismo nombre después del Task 4.

- [ ] **Step 2: Validar el JSON**

Run: `python -m json.tool vercel.json`
Expected: imprime el JSON formateado sin errores de sintaxis.

- [ ] **Step 3: Commit**

```bash
git add vercel.json
git commit -m "feat: agrega vercel.json con cache y security headers"
```

---

### Task 3: Preconnect al dominio del chat bot

**Files:**
- Modify: `index.html:19-20` (dentro de `<head>`, después de la línea `og:url`)

**Interfaces:**
- Consumes: ninguno.
- Produces: ninguno (solo hints de red, no cambia comportamiento observable salvo velocidad de carga del iframe).

- [ ] **Step 1: Agregar preconnect/dns-prefetch**

En `index.html`, inmediatamente después de la línea 19 (`<meta property="og:url" ...>`) y antes de la línea 20 (`<link href="https://fonts.googleapis.com...`), insertar:

```html
<link rel="preconnect" href="https://dolphinstats-bot.onrender.com">
<link rel="dns-prefetch" href="https://dolphinstats-bot.onrender.com">
```

- [ ] **Step 2: Verificar que no rompe el CSP**

El CSP de la línea 11 ya incluye `frame-src https://dolphinstats-bot.onrender.com`, así que el preconnect (que no es un fetch, solo negociación de conexión) no requiere cambios de CSP. Confirmar visualmente abriendo `index.html` en el navegador y comprobando que no aparecen errores de CSP en la consola.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "perf: preconnect al dominio del chat bot"
```

---

### Task 4: Logo en WebP con fallback

**Files:**
- Create: `logo-dolphin.webp`
- Modify: `index.html:301` (uso del logo como watermark del hero) y cualquier otro `<img src="logo-dolphin.png"...>` que exista en el archivo.

**Interfaces:**
- Consumes: `logo-dolphin.png` (76KB, existente).
- Produces: `logo-dolphin.webp` referenciado desde `<picture>` en `index.html`.

- [ ] **Step 1: Generar el WebP**

Run:
```bash
python -c "from PIL import Image; im = Image.open('logo-dolphin.png'); im.save('logo-dolphin.webp', 'webp', quality=85)"
```
Expected: se crea `logo-dolphin.webp` en la raíz del repo, de tamaño menor a 76KB.

- [ ] **Step 2: Confirmar el tamaño**

Run: `ls -la logo-dolphin.*`
Expected: `logo-dolphin.webp` visiblemente más liviano que `logo-dolphin.png` (referencia: PNG con transparencia suele bajar 40-70% en WebP).

- [ ] **Step 3: Buscar todos los usos del logo en `index.html`**

Run: `grep -n "logo-dolphin.png" index.html`
Expected: lista de líneas que referencian el PNG (al menos la línea 301, `.hero-watermark`).

- [ ] **Step 4: Envolver cada uso en `<picture>` con fallback**

Para la línea 301, reemplazar:
```html
<img class="hero-watermark" src="logo-dolphin.png" alt="" aria-hidden="true" loading="lazy" decoding="async">
```
por:
```html
<picture>
  <source srcset="logo-dolphin.webp" type="image/webp">
  <img class="hero-watermark" src="logo-dolphin.png" alt="" aria-hidden="true" loading="lazy" decoding="async">
</picture>
```
Repetir el mismo patrón (envolver en `<picture>` con el `<source webp>` antes del `<img>` original, conservando todos los atributos del `<img>`) para cualquier otro uso encontrado en el Step 3.

- [ ] **Step 5: Verificar visualmente**

Abrir `index.html` en el navegador (o `python -m http.server` en la carpeta) y confirmar que el watermark del hero se ve igual que antes.

- [ ] **Step 6: Commit**

```bash
git add logo-dolphin.webp index.html
git commit -m "perf: sirve el logo en WebP con fallback PNG"
```

---

### Task 5: Unificar jerarquía tipográfica

**Files:**
- Modify: `index.html:80` (`.section-title`)

**Interfaces:** ninguna (solo CSS).

**Contexto:** `.hero h1` (línea 68) y los headings de tarjetas (`.svc-card h3` línea 137, `.ctaband-content h2` línea 115) usan `font-family:'Syne',sans-serif`. `.section-title` (línea 80) es la única excepción, usando `Arial,Helvetica,sans-serif` — esto rompe la jerarquía visual entre el H1 del hero y los H2 de cada sección.

- [ ] **Step 1: Corregir la fuente de `.section-title`**

En `index.html:80`, cambiar:
```css
.section-title{font-family:Arial,Helvetica,sans-serif;font-size:clamp(1.8rem,3.4vw,2.6rem);font-weight:700;line-height:1.15;letter-spacing:-.01em;margin-bottom:1.1rem}
```
por:
```css
.section-title{font-family:'Syne',sans-serif;font-size:clamp(1.8rem,3.4vw,2.6rem);font-weight:700;line-height:1.15;letter-spacing:-.02em;margin-bottom:1.1rem}
```
(cambia la familia tipográfica a Syne para consistencia, y ajusta `letter-spacing` a `-.02em` para igualar el tracking más cerrado que ya usa `.hero h1`).

- [ ] **Step 2: Verificar visualmente**

Abrir el sitio en el navegador y comparar el H2 de la sección "Servicios especializados" contra el H1 del hero — ambos deben lucir con la misma familia tipográfica (Syne, geométrica) en vez de mezclar con Arial.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "style: unifica tipografia de section-title a Syne para jerarquia consistente"
```

---

### Task 6: Animaciones on-scroll en tarjetas de servicios y pricing

**Files:**
- Modify: `index.html` (agregar CSS de las clases `.reveal` y `.reveal.in-view`, y las clases `reveal` en el markup de `.svc-card` y `.precio-card`)
- Modify: `app.js` (agregar el `IntersectionObserver`)

**Interfaces:**
- Consumes: elementos con clase `.reveal` presentes en el DOM al cargar `app.js`.
- Produces: clase `.in-view` añadida a cada `.reveal` cuando entra en el viewport (consumida solo por el CSS de este mismo task).

- [ ] **Step 1: Agregar el CSS de reveal (respetando `prefers-reduced-motion`)**

En `index.html`, dentro del bloque `<style>` existente, agregar (por ejemplo después de la regla `.svc-list li::before` en la línea 140):

```css
.reveal{opacity:0;transform:translateY(24px);transition:opacity .6s ease,transform .6s ease}
.reveal.in-view{opacity:1;transform:translateY(0)}
@media (prefers-reduced-motion: reduce){
  .reveal{opacity:1;transform:none;transition:none}
}
```

- [ ] **Step 2: Agregar la clase `reveal` a las tarjetas**

En `index.html`, agregar `reveal` a la lista de clases de cada `.svc-card` (buscar `class="svc-card"` dentro de `<section class="servicios" id="servicios">`, línea 367 en adelante) y de cada `.precio-card` (líneas 539, 556, 574):

```bash
grep -n 'class="svc-card"' index.html
grep -n 'class="precio-card' index.html
```

Cambiar cada `class="svc-card"` a `class="svc-card reveal"`, y cada `class="precio-card"` / `class="precio-card featured"` a `class="precio-card reveal"` / `class="precio-card featured reveal"`.

- [ ] **Step 3: Agregar el IntersectionObserver a `app.js`**

Al inicio de la función auto-ejecutable en `app.js` (después de `(function () {` en la línea 1, antes del bloque "FAQ accordion"), agregar:

```javascript
  // Scroll reveal animations
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal').forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('in-view');
    });
  }
```

- [ ] **Step 4: Verificar en el navegador**

Abrir el sitio, hacer scroll hasta la sección de servicios y pricing, y confirmar que las tarjetas aparecen con fade-in + slide-up al entrar en viewport. Luego, en DevTools → Rendering → "Emulate CSS prefers-reduced-motion: reduce", recargar y confirmar que las tarjetas aparecen inmediatamente sin animación.

- [ ] **Step 5: Commit**

```bash
git add index.html app.js
git commit -m "feat: agrega animaciones on-scroll a tarjetas de servicios y pricing"
```

---

### Task 7: El botón de chat detiene su pulso tras la primera interacción

**Files:**
- Modify: `app.js:37-42` (listener de `btn.addEventListener('click', ...)`)

**Interfaces:**
- Consumes: `#ds-chat-btn` (definido en `index.html:838`), clase CSS existente con `animation: ds-pulse 2s ease-in-out infinite, ds-bounce 2.8s ease-in-out infinite` (`index.html:773`).
- Produces: clase `.ds-settled` en `#ds-chat-btn` tras el primer click.

**Contexto:** Hoy el botón pulsa infinitamente (`index.html:773`), incluso después de que el usuario ya interactuó con el chat — esto es ruido visual innecesario. Se detiene solo en `:hover` (línea 776-780), no de forma persistente.

- [ ] **Step 1: Agregar la regla CSS que detiene la animación**

En `index.html`, después de la regla `#ds-chat-btn:hover` (línea 776-780), agregar:

```css
#ds-chat-btn.ds-settled {
  animation: none;
}
```

- [ ] **Step 2: Agregar la clase en el primer click**

En `app.js`, dentro del listener existente:
```javascript
  if (btn) {
    btn.addEventListener('click', function () {
      overlay.classList.toggle('open');
      ensureFrame();
    });
  }
```
cambiar por:
```javascript
  if (btn) {
    btn.addEventListener('click', function () {
      overlay.classList.toggle('open');
      ensureFrame();
      btn.classList.add('ds-settled');
    });
  }
```

- [ ] **Step 3: Verificar en el navegador**

Cargar el sitio, confirmar que el botón pulsa antes del primer click, hacer click y confirmar que el pulso se detiene (queda estático, sigue funcionando el hover).

- [ ] **Step 4: Commit**

```bash
git add index.html app.js
git commit -m "fix: el boton de chat deja de pulsar tras la primera interaccion"
```

---

### Task 8: Reforzar visualmente la card "Más elegido"

**Files:**
- Modify: `index.html:188` (`.precio-card.featured`)

**Interfaces:** ninguna (solo CSS).

- [ ] **Step 1: Reforzar sombra y borde**

En `index.html:188`, cambiar:
```css
.precio-card.featured{border-color:var(--aqua);background:rgba(0,212,255,.07)}
```
por:
```css
.precio-card.featured{border-color:var(--aqua);background:rgba(0,212,255,.07);box-shadow:0 0 40px rgba(0,212,255,.15);transform:scale(1.02)}
```

- [ ] **Step 2: Verificar que no rompe el hover existente**

`.precio-card:hover{transform:translateY(-6px)}` (línea 187) sigue aplicando sobre `.featured` en hover — confirmar visualmente que la card featured, ya escalada 1.02, también sube al hacer hover sin verse distorsionada.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "style: refuerza el contraste visual de la card de pricing destacada"
```

---

### Task 9: Push, preview y merge

**Files:** ninguno (operación de git/Vercel).

- [ ] **Step 1: Push de la rama**

```bash
git push -u origin feature/vercel-design-refinement
```

- [ ] **Step 2: Obtener la URL de Preview Deployment**

Run: `npx --yes vercel ls --meta gitBranch=feature/vercel-design-refinement 2>&1 | head -20`
Expected: una URL de preview del tipo `https://dolphinstats-web-git-feature-vercel-design-refinement-dolphin-stats.vercel.app`. Alternativamente, revisar el dashboard de Vercel → pestaña Deployments, o el check que GitHub agrega automáticamente al commit/push (ya que "Comentarios de la solicitud de extracción" está habilitado).

- [ ] **Step 3: Checklist de validación manual (usuario)**

Sobre la URL de preview, confirmar:
- [ ] FAQ accordion abre/cierra suave
- [ ] Botón de chat pulsa al cargar, deja de pulsar tras el primer click, el iframe abre correctamente
- [ ] Tarjetas de servicios y pricing aparecen con fade-in al hacer scroll
- [ ] Card "Más elegido" se ve visualmente reforzada
- [ ] Logo watermark se ve igual que en producción actual
- [ ] Responsive en mobile (375px) y tablet (768px) sin overlaps
- [ ] Analytics/Speed Insights aparecen en el dashboard de Vercel tras navegar el preview

- [ ] **Step 4: Merge a main (solo con aprobación explícita del usuario)**

Tras aprobación, abrir un Pull Request en GitHub de `feature/vercel-design-refinement` → `main`, o hacer merge directo si el usuario lo prefiere así. Este paso NO se ejecuta automáticamente — requiere confirmación explícita en el chat antes de tocar `main`.
