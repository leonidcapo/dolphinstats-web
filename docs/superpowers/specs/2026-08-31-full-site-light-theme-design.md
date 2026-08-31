# Extensión del tema claro a todo el sitio

## Contexto

Las rondas anteriores ya migraron `<nav>` y `.hero` al tema claro definitivo
(paleta de Canva: `#0075c6` azul, `#51d7e7`/`#0899a8` cian, `#ff3131` coral,
`#003060` navy, blanco), usando variables locales `--lp-*` definidas en el
selector `nav, .hero-wrap, .hero`. El resto del sitio (~12 bloques: Proceso,
barra de stats, Servicios, Diferencial, Razón de ser, Método, Principios,
Precios, FAQ, banda CTA, Áreas SEO, Privacidad, Footer) sigue en el tema
oscuro navy/aqua original. Este spec extiende el tema claro a todo lo
restante, dejando **todo el sitio** en la paleta definitiva.

## Decisión arquitectónica: repuntar `:root` en vez de tocar cada regla

Casi todas las reglas del resto del sitio ya usan variables (`var(--white)`,
`var(--muted)`, `var(--aqua)`, `var(--ocean)`, `var(--accent)`,
`var(--lavender)`, `var(--surface)`, `var(--border)`) en vez de hex directo.
En lugar de editar cada regla una por una, la Task 1 redefine estas
variables en el bloque `:root` para que apunten a los valores del tema
claro. Esto hace que la mayoría de las ~150 líneas de CSS del resto del
sitio se vean correctamente en claro **sin tocarlas** — solo hace falta
arreglar a mano los `rgba(...)` literales (no-variable) que siguen
apuntando a tonos oscuros/aqua a mano, y dos excepciones puntuales donde una
variable repuntada rompería un patrón intencional (ver más abajo).

**No se toca** el bloque local `nav, .hero-wrap, .hero{--lp-*}` de las
rondas anteriores — sigue funcionando igual, en paralelo al repunte de
`:root`. Es una duplicación menor y deliberada: tocar el nav/hero ya
aprobado y en producción para unificarlo con el nuevo esquema global no
vale el riesgo de regresión frente al beneficio cosmético de DRY.

### Nueva tabla de tokens `:root`

| Variable | Antes (oscuro) | Ahora (claro) | Uso |
|---|---|---|---|
| `--ocean` | `#0a1628` (fondo) | `#ffffff` | Fondo de página |
| `--white` | `#f0f8ff` (texto claro) | `#003060` | Texto principal (headings, cuerpo fuerte) |
| `--aqua` | `#00d4ff` | `#0075c6` | Acento primario (links, iconos, CTAs, bordes de énfasis) |
| `--muted` | `#8899bb` | `#4a6285` | Texto secundario/atenuado |
| `--accent` | `#00ffcc` (menta) | `#ff3131` | Acento secundario (kickers, números, checks) — se retira el menta, no está en la paleta definitiva |
| `--lavender` | `#7b7fc4` | `#0075c6` (= `--aqua`) | Se retira el lavanda (no está en la paleta definitiva); los chips de "Principios" pasan a usar el azul de marca |
| `--surface` | `rgba(255,255,255,.03)` | `#f5f7fb` | Fondo de tarjetas (antes translúcido sobre oscuro, ahora opaco gris muy claro sobre blanco) |
| `--border` | `rgba(0,212,255,.12)` | `rgba(0,48,96,.10)` | Borde sutil de tarjetas |

`body{background:var(--ocean);color:var(--white)}` no cambia como regla —
al repuntar las variables, automáticamente queda fondo blanco/texto navy.

## Excepciones explícitas (no se dejan a la cascada)

1. **Scrims oscuros sobre fotos se mantienen oscuros.** `.hero-media .chip`,
   `.razon-media .chip`, `.pcard .ov`, `.ctaband-inner .ov` usan un scrim
   `rgba(10,22,40,X)` + texto claro para dar legibilidad a un caption sobre
   una foto — es un patrón de legibilidad ortogonal al tema de la página
   (funciona igual de bien en un sitio claro que oscuro), no un residuo del
   tema oscuro. Estos permanecen sin cambios de color, salvo:
   - `.hero-media .chip`/`.razon-media .chip` usan `color:var(--white)`
     para su texto — como `--white` pasa a significar "navy", hay que
     cambiar estas dos reglas a un literal `#f0f8ff` explícito (texto claro
     fijo), para que el caption siga siendo legible sobre su fondo oscuro
     propio independientemente del repunte global.
   - Los bordes/tintes `rgba(0,212,255,X)` dentro de estos mismos
     componentes (`.hero-media .chip` border, `.razon-media .tint`,
     `.razon-media .chip` border) sí se actualizan a `rgba(0,117,198,X)`
     (aqua→azul), ya que el color del *borde* del chip debe seguir la
     nueva paleta aunque el *fondo* del chip se mantenga oscuro.

2. **El widget de chat flotante (botón + overlay + header) no se toca.**
   `#ds-chat-btn`, `#ds-chat-overlay`, `#ds-chat-header` y sus hijos usan
   hex literal (`#0a1628`, `#f0f8ff`, `#8899bb`) — no variables — así que
   el repunte de `:root` no los afecta, y se mantienen con su identidad
   oscura propia a propósito (es un widget flotante tipo "burbuja de chat",
   visualmente distinto del contenido de la página por diseño, igual que
   antes de este cambio).

3. **La tarjeta de invitación al chat (`#ds-invite-card` y sus hijos) SÍ
   usa variables** (`var(--ocean)`, `var(--white)`, `var(--muted)`,
   `var(--aqua)`) y por tanto **sí** hereda el tema claro automáticamente
   al repuntar `:root` — a diferencia del botón/overlay del punto 2, esto
   es intencional: la tarjeta de invitación es contenido flotante que debe
   verse coherente con el resto de la página, no un widget de marca
   aparte. Solo hacen falta 3 ajustes puntuales de literales `rgba(...)`
   dentro de ese mismo bloque que no son variables y quedarían
   inconsistentes con el nuevo fondo blanco de la tarjeta:
   - `#ds-invite-card` border: `rgba(0,212,255,.3)` → `rgba(0,117,198,.3)`
   - `.ds-invite-btn-primary:hover` box-shadow: `rgba(0,212,255,.5)` →
     `rgba(0,117,198,.5)`
   - `.ds-invite-btn-ghost` border: `rgba(255,255,255,.15)` (invisible
     sobre el nuevo fondo blanco de la tarjeta) → `rgba(0,48,96,.15)`

## Fotos: reemplazo de las 4 restantes de Unsplash

Se reemplazan por fotos ya recortadas y optimizadas del Brochure de Canva
del propio cliente (mismo criterio que la foto del hero), disponibles en
`C:\Users\ASUS\AppData\Local\Temp\claude\C--Users-ASUS-Desktop-nucleo\1d36291f-ef5e-4192-9b4b-27f4a98b151f\scratchpad\`:

| Sección | Antes (Unsplash) | Ahora | Archivos |
|---|---|---|---|
| Proceso, tarjeta 1 ("Para tesistas e investigadores") | `photo-1571260899304-...` | Investigadora con laptop en biblioteca | `proceso-1.jpg` / `proceso-1.webp` (700×1422) |
| Proceso, tarjeta 2 ("Acompañamiento real") | `photo-1522071820081-...` | Dos colegas colaborando sobre una laptop | `proceso-2.jpg` / `proceso-2.webp` (700×1173) |
| Razón de ser (`razon-media`) | `photo-1518152006812-...` (microscopios) | Doctora revisando evidencia científica impresa | `razon-media.jpg` / `razon-media.webp` (700×1974) |
| Banda CTA final | `photo-1454165804606-...` | Doctora frente a monitor con gráficos | `ctaband.jpg` / `ctaband.webp` (460×1820, recorte vertical — se muestra recortado por `object-fit:cover` dentro de la banda ancha) |

Los 8 archivos deben copiarse a la raíz del repo (mismo patrón que
`hero-doctora.jpg`/`.webp`). El `alt` text de cada `<img>` se redacta según
el contenido real de la nueva foto, no el de la foto que reemplaza.

## Alcance

Todo `index.html` salvo: `<nav>`/`.hero-wrap`/`.hero` (ya migrados, no se
tocan), y el widget de chat flotante `#ds-chat-btn`/`#ds-chat-overlay`/
`#ds-chat-header` (explícitamente fuera de alcance, punto 2 arriba). Sí
entran en alcance: `:root`, `body`/`body::before`/`body::after` (glow
ambiental — se atenúa su opacidad ya que un glow neón fuerte no encaja con
un fondo blanco editorial, pero se mantiene el patrón decorativo), y
`#ds-invite-card` y sus hijos (punto 3 arriba).

## Validación

Igual que rondas anteriores: implementar directamente en `index.html` real
y mostrarlo corriendo en el Browser pane (desktop + mobile) antes de dar
por bueno cada bloque, sirviendo el sitio con `python -m http.server` desde
la raíz del repo.

## Fuera de alcance

- El widget de chat flotante (punto 2).
- Cualquier cambio de copy/contenido textual — solo colores, fondos e
  imágenes.
- Unificar el esquema `--lp-*` de nav/hero con el repunte de `:root` del
  resto del sitio (decisión explícita de no tocar código ya aprobado, ver
  arriba).
