# Vercel + Diseño: Refinamiento de dolphinstats-web

## Contexto

Sitio estático (`index.html` + `app.js` + `logo-dolphin.png`, sin build step) ya desplegado en Vercel (`https://dolphinstats-web.vercel.app`, proyecto `dolphin-stats/dolphinstats-web`, repo `leonidcapo/dolphinstats-web` conectado). Objetivo: aprovechar funciones nativas de Vercel para performance/observabilidad, y refinar visualmente el sitio sin cambiar su identidad de marca (colores, logo, estructura de secciones).

## Alcance

- **Técnico (Vercel):** Analytics, Speed Insights, `vercel.json` con headers de cache/seguridad, preconnect al bot externo, optimización del logo a WebP.
- **Visual/flujo (refinamiento):** jerarquía tipográfica, animaciones on-scroll, transición del FAQ accordion, pulso en el botón de chat, refuerzo visual de la card "MÁS ELEGIDO", revisión de breakpoints existentes.
- **Fuera de alcance:** migración a framework (Astro/Vite), rediseño de paleta/logo, cambios de contenido/copy, cambios al backend del chat (Render).

## Diseño técnico

### 1. Vercel Analytics + Speed Insights
Vercel inyecta el script de Analytics automáticamente a nivel de Edge en cualquier proyecto con Analytics habilitado desde el dashboard (Project → Analytics → Enable) — no requiere agregar un `<script>` manual al HTML. Esta es la vía elegida: evita cargar un script de terceros sin control de integridad (SRI) y no depende de un CDN externo hardcodeado en el código fuente.
Acción: habilitar "Analytics" y "Speed Insights" desde el dashboard del proyecto (`dolphin-stats/dolphinstats-web` → Analytics / Speed Insights → Enable). Sin cambios de código.

### 2. `vercel.json`
Nuevo archivo en la raíz con:
- Headers de cache largo (`Cache-Control: public, max-age=31536000, immutable`) para `logo-dolphin.png` y `app.js` (versionado por nombre de archivo si hace falta invalidar).
- Headers de seguridad básicos: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.

### 3. Preconnect al chat bot
En el `<head>` de `index.html`:
```html
<link rel="preconnect" href="https://dolphinstats-bot.onrender.com">
<link rel="dns-prefetch" href="https://dolphinstats-bot.onrender.com">
```

### 4. Optimización de imagen
Convertir `logo-dolphin.png` (76KB) a `.webp` con fallback `<picture>`:
```html
<picture>
  <source srcset="logo-dolphin.webp" type="image/webp">
  <img src="logo-dolphin.png" alt="DolphinStats" loading="lazy">
</picture>
```
Aplicar en todos los usos del logo dentro de `index.html`.

## Diseño visual/flujo

- **Tipografía:** aumentar diferenciación de tamaño/peso entre H1, H2 y body en la hoja de estilos embebida de `index.html` (sin tocar la fuente base).
- **Animaciones on-scroll:** `IntersectionObserver` en `app.js` que añade clase `.in-view` a tarjetas de servicios/pricing; CSS con `transition` de `opacity`/`transform`. Respeta `prefers-reduced-motion`.
- **FAQ accordion:** reemplazar el toggle instantáneo de clases por transición CSS de `max-height`/`opacity` (mismo mecanismo de `aria-expanded` ya existente, solo se anima).
- **Botón de chat:** animación de pulso CSS (`@keyframes`) limitada a las primeras interacciones (ej. se detiene tras el primer click o tras N segundos), respetando `prefers-reduced-motion`.
- **Card "MÁS ELEGIDO":** reforzar sombra/borde en la card de pricing ya marcada como destacada.
- **Responsive:** revisar que las nuevas animaciones/estilos no rompan los breakpoints de tablet/mobile ya corregidos en commits previos (watermark hero, etc.).

## Flujo de trabajo

1. Rama `feature/vercel-design-refinement` sobre `dolphinstats-web` (repo real).
2. Commits incrementales → cada uno dispara Preview Deployment automático (Git ya conectado en Vercel).
3. Validación manual del usuario sobre la URL de preview: accordion FAQ, apertura del chat, pricing cards, responsive mobile/tablet, Analytics/Speed Insights visibles en el dashboard de Vercel.
4. Merge a `main` solo con aprobación explícita del usuario sobre el preview.

## Testing

Sin test automatizado (contenido estático sin lógica de negocio compleja). Validación manual guiada por checklist en el paso 3 del flujo de trabajo.
