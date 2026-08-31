# Adopción de la paleta e identidad de Canva (definitivo) — prototipo del hero

## Contexto

`dolphinstats-web` acaba de pasar por un rediseño editorial en tema oscuro
(navy/aqua, ver [2026-08-31-hero-editorial-redesign-design.md](2026-08-31-hero-editorial-redesign-design.md)),
ya fusionado a `main`. El usuario ahora pidió adoptar, de forma **definitiva**,
el diseño y la paleta de dos piezas de Canva de la marca DolphinStats:

- Brochure (`DAHTpCeIiTY`) — fondo claro, foto real, titular en rojo-coral.
- "El recorrido" (`DAHSjwGx-Ic`) — fondo claro, paleta índigo/morado.

Ambas piezas usan paletas de marca distintas entre sí. El usuario eligió
explícitamente la paleta del **Brochure** como la definitiva. Este spec
**reemplaza** la dirección de tema oscuro del rediseño anterior — no la
extiende.

## Paleta definitiva (hex exactos extraídos de Canva)

| Uso | Color |
|---|---|
| Logo "Dolphin" | `#0075c6` |
| Logo "Stats" | `#51d7e7` |
| Titular de impacto (palabra clave) | `#ff3131` |
| Texto / headings / body | `#003060` |
| Fondo | blanco (`#ffffff`) / gris muy claro |

## Alcance de este prototipo

Solo `<nav>` + `.hero` de `index.html` (el mismo patrón usado en el rediseño
anterior: probar la dirección en el hero primero, extender al resto de las
~10 secciones en una ronda posterior si se aprueba). Este prototipo
**reemplaza** el CSS de tema oscuro de `<nav>`/`.hero` que dejó el rediseño
anterior — no coexisten ambos temas.

## Imagen del hero

Se reemplaza el gráfico SVG de dispersión (del rediseño anterior) por una
foto real: la misma foto usada en el Brochure de Canva (doctora con bata
blanca usando una laptop que muestra gráficos, con un microscopio desenfocado
al fondo). Ya se exportó y optimizó para web, disponible en:

- `C:\Users\ASUS\AppData\Local\Temp\claude\C--Users-ASUS-Desktop-nucleo\1d36291f-ef5e-4192-9b4b-27f4a98b151f\scratchpad\hero-doctora.jpg` (900×741, ~53KB)
- `C:\Users\ASUS\AppData\Local\Temp\claude\C--Users-ASUS-Desktop-nucleo\1d36291f-ef5e-4192-9b4b-27f4a98b151f\scratchpad\hero-doctora.webp` (900×741, ~26KB)

Ambos archivos deben copiarse a la raíz del repo `dolphinstats-web` (mismo
patrón que `logo-dolphin.png`/`logo-dolphin.webp`: un `<picture>` con
`<source type="image/webp">` + `<img>` JPG de fallback).

**Nota de licencia**: la foto proviene de un stock de Canva usado dentro de
un diseño de la cuenta/equipo DolphinStats del usuario. Se asume cubierta
por la licencia estándar de Canva para uso propio de marca (no reventa a
terceros) — el usuario fue informado de esto antes de aprobar y decidió
proceder.

## Dirección visual del hero

1. **Fondo claro**: `nav` y `.hero` pasan de fondo navy oscuro a fondo
   blanco/gris muy claro. Todo el texto que antes usaba `var(--white)`/
   `var(--muted)` sobre fondo oscuro pasa a usar `#003060` (texto principal)
   sobre fondo claro.
2. **Titular con palabra clave en rojo-coral**: el patrón `<em>` del `<h1>`
   (que en el rediseño anterior coloreaba la palabra clave en aqua) ahora la
   colorea en `#ff3131`, igual que "Tu tesis" en el Brochure.
3. **Logo con los dos tonos de marca**: `Dolphin` en `#0075c6`, `Stats` en
   `#51d7e7` (reemplaza el aqua único usado antes en `.logo span`).
4. **CTA primario**: fondo `#0075c6` (azul de marca) en vez del aqua oscuro
   anterior, texto blanco.
5. **hero-tag / hero-specs**: se mantienen como texto simple (ya lo dejó así
   el rediseño anterior — ese patrón editorial de "menos badges" sigue
   vigente, solo cambian los colores a la nueva paleta: `#0075c6` para el
   acento, `#003060`/gris medio para el texto secundario).
6. **hero-media**: la foto (`hero-doctora.jpg`/`.webp`) reemplaza el SVG,
   dentro del mismo contenedor `.frame` (borde sutil, sombra, radio de
   esquina) que ya existía — mismo patrón estructural, solo cambia qué hay
   adentro.

## Variables CSS (`:root`)

El bloque `:root` de `index.html` define hoy `--ocean`, `--aqua`, `--white`,
`--muted`, `--accent`, `--lavender`, `--surface`, `--border` para el tema
oscuro. Este prototipo, al tocar solo `<nav>`/`.hero`, puede optar por:
usar directamente los nuevos valores hex donde haga falta color claro
(sin todavía tocar las variables `:root`, que las demás ~10 secciones
siguen usando en modo oscuro hasta la ronda siguiente) — evitando así que
cambiar `:root` rompa visualmente las secciones que este prototipo no toca.
El plan de implementación decide la forma exacta (hex directos vs. nuevas
variables locales al `.hero`) al bajar esto a tareas concretas.

## Validación

Igual que el rediseño anterior: implementar directamente en `index.html`
real y mostrarlo corriendo en el Browser pane (desktop + mobile) antes de
dar por bueno el prototipo.

## Fuera de alcance

- Las demás ~9 secciones del sitio (siguen en tema oscuro hasta una ronda
  posterior, si el usuario aprueba esta dirección en el hero).
- La tarjeta de invitación al chat (ya implementada, tema-agnóstica en su
  posición/comportamiento — su recoloreado, si hace falta, es parte de la
  ronda siguiente cuando se toque el resto del sitio).
- Actualizar `:root` globalmente (decisión explícita de posponerla, ver
  sección de Variables CSS).
