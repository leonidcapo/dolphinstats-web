# Extensión del tema claro a todo el sitio — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar el resto de `dolphinstats-web` (todo salvo `<nav>`/`.hero-wrap`/`.hero`, ya migrados, y el widget de chat flotante, fuera de alcance) a la paleta clara definitiva, reemplazando además las 4 fotos de stock restantes por fotos del Brochure de Canva del cliente.

**Architecture:** Sitio estático de un solo archivo (`index.html`, sin build step, CSS inline). La Task 1 repuntea el bloque `:root` para que casi todas las reglas del resto del sitio (que ya usan `var(--white)`, `var(--muted)`, `var(--aqua)`, `var(--ocean)`, `var(--accent)`, `var(--lavender)`, `var(--surface)`, `var(--border)`) se vean correctamente en claro sin tocarlas una por una. Las tareas siguientes solo arreglan a mano los `rgba(...)` literales (no-variable) que siguen apuntando a tonos del tema oscuro, más un puñado de excepciones documentadas donde el repunte automático rompería un patrón intencional.

**Tech Stack:** HTML5, CSS plano. Sin JS nuevo.

## Global Constraints

- Alcance: todo `index.html` salvo `<nav>`/`.hero-wrap`/`.hero` (ya migrados, NO se tocan) y `#ds-chat-btn`/`#ds-chat-overlay`/`#ds-chat-header` (el widget de chat flotante — usa hex literal, no variables, y se mantiene con su identidad oscura propia a propósito, fuera de alcance).
- Paleta definitiva (hex exactos): `#0075c6` azul, `#51d7e7`/`#0899a8` cian, `#ff3131` coral, `#003060` navy, blanco.
- **Excepción — scrims oscuros sobre fotos se mantienen oscuros**: `.hero-media .chip`, `.razon-media .chip`, `.pcard .ov`, `.ctaband-inner .ov` — es un patrón de legibilidad de texto-sobre-foto, no un residuo del tema oscuro. Sus fondos `rgba(10,22,40,X)` NO cambian. Sus bordes `rgba(0,212,255,X)` SÍ cambian a `rgba(0,117,198,X)` (azul). Su texto, si dependía de `var(--white)`/`var(--muted)`/inherit de `body` (que ahora será navy), necesita un color claro explícito para seguir siendo legible sobre su fondo oscuro.
- **No se toca** el bloque local `nav, .hero-wrap, .hero{--lp-*}` — es una duplicación menor y deliberada frente al repunte de `:root`, para no arriesgar el código de nav/hero ya aprobado.
- Los 8 archivos de imagen (`proceso-1.jpg/.webp`, `proceso-2.jpg/.webp`, `razon-media.jpg/.webp`, `ctaband.jpg/.webp`) ya están exportados y optimizados en `C:\Users\ASUS\AppData\Local\Temp\claude\C--Users-ASUS-Desktop-nucleo\1d36291f-ef5e-4192-9b4b-27f4a98b151f\scratchpad\` — deben copiarse (no regenerarse) a la raíz de `dolphinstats-web`.
- No hay framework de tests ni `package.json` — verificación manual vía Browser pane, sirviendo el sitio con `python -m http.server` desde la raíz del repo (`file://` no ejecuta JS/renderiza bien desde un worktree fuera del proyecto principal).

---

### Task 1: Fundamento — repunte de `:root`, glow ambiental, bugfix de botones globales, excepciones de la tarjeta de invitación y del chip del hero

**Files:**
- Modify: `index.html:23-32` (`:root{...}`)
- Modify: `index.html:36-37` (`body::before`, `body::after`)
- Modify: `index.html:98-101` (`.btn-primary`, `.btn-primary:hover`, `.btn-secondary`, `.btn-secondary:hover`)
- Modify: `index.html:107` (`.hero-media .chip`)
- Modify: `index.html` (bloque `#ds-invite-card` / `.ds-invite-btn-primary:hover` / `.ds-invite-btn-ghost`, ~líneas 867, 910, 914)

**Interfaces:**
- Consumes: nada.
- Produces: los tokens `:root` repunteados (`--ocean`, `--aqua`, `--white`, `--muted`, `--accent`, `--lavender`, `--surface`, `--border`) que TODAS las tareas siguientes dan por hecho ya están en claro — no las redefinen.

- [ ] **Step 1: Repuntear `:root`**

Reemplazar:
```css
  :root{
    --ocean:#0a1628;
    --aqua:#00d4ff;
    --white:#f0f8ff;
    --muted:#8899bb;
    --accent:#00ffcc;
    --lavender:#7b7fc4;
    --surface:rgba(255,255,255,.03);
    --border:rgba(0,212,255,.12);
  }
```
por:
```css
  :root{
    --ocean:#ffffff;
    --aqua:#0075c6;
    --white:#003060;
    --muted:#4a6285;
    --accent:#ff3131;
    --lavender:#0075c6;
    --surface:#f5f7fb;
    --border:rgba(0,48,96,.10);
  }
```

- [ ] **Step 2: Atenuar el glow ambiental de `body::before`/`body::after`**

Reemplazar:
```css
  body::before{content:'';position:fixed;inset:0;background:radial-gradient(ellipse 80% 50% at 20% 20%,rgba(0,212,255,.08) 0%,transparent 60%),radial-gradient(ellipse 60% 80% at 80% 80%,rgba(0,180,216,.06) 0%,transparent 60%);pointer-events:none;z-index:0}
  body::after{content:'';position:fixed;inset:0;background-image:linear-gradient(rgba(0,212,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,.04) 1px,transparent 1px);background-size:60px 60px;pointer-events:none;z-index:0}
```
por:
```css
  body::before{content:'';position:fixed;inset:0;background:radial-gradient(ellipse 80% 50% at 20% 20%,rgba(0,117,198,.05) 0%,transparent 60%),radial-gradient(ellipse 60% 80% at 80% 80%,rgba(0,117,198,.035) 0%,transparent 60%);pointer-events:none;z-index:0}
  body::after{content:'';position:fixed;inset:0;background-image:linear-gradient(rgba(0,117,198,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,117,198,.025) 1px,transparent 1px);background-size:60px 60px;pointer-events:none;z-index:0}
```
(Un glow neón intenso no encaja con un fondo blanco editorial — se reduce la opacidad a la mitad/tercio y se cambia el tono de aqua a azul.)

- [ ] **Step 3: Arreglar el bug de scoping de `.btn-primary`/`.btn-secondary`**

Estas reglas son GLOBALES (se usan tanto dentro de `.hero` como en la banda CTA, fuera de `.hero`), pero actualmente referencian `var(--lp-blue)`/`var(--lp-navy)`, que solo existen dentro del selector `nav, .hero-wrap, .hero`. Fuera de ese árbol (ej. la banda CTA, que se arregla en la Task 6) el botón "Solicitar asesoría →" queda con fondo transparente — un bug ya presente en producción que esta tarea corrige.

Reemplazar:
```css
  .btn-primary{background:var(--lp-blue);color:#fff;padding:.9rem 2rem;border-radius:100px;font-weight:700;font-size:1rem;text-decoration:none;transition:transform .2s,box-shadow .2s;box-shadow:0 0 30px rgba(0,117,198,.25)}
  .btn-primary:hover{transform:translateY(-2px);box-shadow:0 0 50px rgba(0,117,198,.4)}
  .btn-secondary{background:transparent;color:var(--lp-navy);padding:.9rem 2rem;border-radius:100px;font-weight:600;font-size:1rem;text-decoration:none;border:1px solid rgba(0,48,96,.2);transition:border-color .2s,color .2s}
  .btn-secondary:hover{border-color:var(--lp-blue);color:var(--lp-blue)}
```
por:
```css
  .btn-primary{background:var(--aqua);color:#fff;padding:.9rem 2rem;border-radius:100px;font-weight:700;font-size:1rem;text-decoration:none;transition:transform .2s,box-shadow .2s;box-shadow:0 0 30px rgba(0,117,198,.25)}
  .btn-primary:hover{transform:translateY(-2px);box-shadow:0 0 50px rgba(0,117,198,.4)}
  .btn-secondary{background:transparent;color:var(--white);padding:.9rem 2rem;border-radius:100px;font-weight:600;font-size:1rem;text-decoration:none;border:1px solid rgba(0,48,96,.2);transition:border-color .2s,color .2s}
  .btn-secondary:hover{border-color:var(--aqua);color:var(--aqua)}
```
(`var(--aqua)`/`var(--white)` son globales, definidas en `:root` — funcionan igual dentro de `.hero` que fuera, y sus valores numéricos coinciden exactamente con `--lp-blue`/`--lp-navy`, así que el hero no cambia visualmente.)

- [ ] **Step 4: Arreglar el texto del chip del hero (excepción — sigue sobre fondo oscuro)**

Reemplazar:
```css
  .hero-media .chip{position:absolute;bottom:14px;left:14px;background:rgba(10,22,40,.82);border:1px solid rgba(0,212,255,.25);border-radius:12px;padding:.55rem .8rem;font-size:.78rem;color:var(--white);display:flex;align-items:center;gap:.5rem}
```
por:
```css
  .hero-media .chip{position:absolute;bottom:14px;left:14px;background:rgba(10,22,40,.82);border:1px solid rgba(0,117,198,.25);border-radius:12px;padding:.55rem .8rem;font-size:.78rem;color:#f0f8ff;display:flex;align-items:center;gap:.5rem}
```
(El fondo del chip sigue oscuro a propósito; su texto usaba `var(--white)`, que ahora significa "navy" — se fija a un blanco literal para seguir siendo legible. El borde sí seguía el azul nuevo.)

- [ ] **Step 5: Arreglar 3 literales en la tarjeta de invitación al chat**

Busca el bloque `#ds-invite-card { ... }` (usa variables como `var(--ocean)`, `var(--white)`, `var(--muted)`, `var(--aqua)` — esas SÍ se repuntean solas y quedan bien automáticamente, no las toques). Dentro de ese mismo bloque de estilos, cambia solo estos 3 literales `rgba(...)` que quedarían inconsistentes con el nuevo fondo blanco de la tarjeta:

En la regla `#ds-invite-card { ... }`, reemplazar:
```css
    border: 1px solid rgba(0,212,255,.3);
```
por:
```css
    border: 1px solid rgba(0,117,198,.3);
```

En `.ds-invite-btn-primary:hover { ... }`, reemplazar:
```css
  .ds-invite-btn-primary:hover { box-shadow: 0 0 20px rgba(0,212,255,.5); }
```
por:
```css
  .ds-invite-btn-primary:hover { box-shadow: 0 0 20px rgba(0,117,198,.5); }
```

En `.ds-invite-btn-ghost { ... }`, reemplazar:
```css
    border: 1px solid rgba(255,255,255,.15);
```
por:
```css
    border: 1px solid rgba(0,48,96,.15);
```
(Este borde blanco-translúcido era invisible sobre fondo oscuro-ya-no-existe; sobre el nuevo fondo blanco de la tarjeta sería invisible igual si se dejara en blanco — se cambia a navy-translúcido.)

- [ ] **Step 6: Verificar visualmente**

Sirviendo el sitio (`python -m http.server` desde la raíz del repo) y abriendo en el Browser pane:
- El nav y el hero se ven exactamente igual que antes de este cambio (sin regresión).
- El fondo general de la página (debajo del hero, donde aún no se ha migrado ninguna sección) es blanco, con un glow azul muy sutil de fondo (no un neón fuerte).
- Con `javascript_tool`, forzar la aparición de la tarjeta de invitación (`sessionStorage.clear()`, recargar, esperar ~10s) y confirmar que se ve con fondo blanco, texto navy, botón "Chatear ahora" azul con texto blanco, y el borde del botón "No, gracias" visible (no invisible).
- El botón "Solicitar asesoría →" del hero se sigue viendo azul sólido (sin regresión — antes y después de este fix debía verse igual dentro del hero).

- [ ] **Step 7: Commit**

```bash
git add index.html
git commit -m "feat: repuntea :root a la paleta clara definitiva (fundamento del resto del sitio)"
```

---

### Task 2: Proceso + barra de stats (con 2 fotos nuevas)

**Files:**
- Create: `proceso-1.jpg`, `proceso-1.webp` (raíz del repo) — copiar desde el scratchpad.
- Create: `proceso-2.jpg`, `proceso-2.webp` (raíz del repo) — copiar desde el scratchpad.
- Modify: `index.html:113,115,118` (`.pcard`, `.pcard .ov` sin cambios — ver nota, `.pcard .txt .t`)
- Modify: `index.html:131` (`.stats-bar`)
- Modify: `index.html` (markup de las 2 `<img>` dentro de `.proceso-grid`)

**Interfaces:**
- Consumes: los tokens `:root` de la Task 1.
- Produces: nada que otra tarea consuma.

- [ ] **Step 1: Copiar las 2 imágenes a la raíz del repo**

```bash
cp "C:\Users\ASUS\AppData\Local\Temp\claude\C--Users-ASUS-Desktop-nucleo\1d36291f-ef5e-4192-9b4b-27f4a98b151f\scratchpad\proceso-1.jpg" ./proceso-1.jpg
cp "C:\Users\ASUS\AppData\Local\Temp\claude\C--Users-ASUS-Desktop-nucleo\1d36291f-ef5e-4192-9b4b-27f4a98b151f\scratchpad\proceso-1.webp" ./proceso-1.webp
cp "C:\Users\ASUS\AppData\Local\Temp\claude\C--Users-ASUS-Desktop-nucleo\1d36291f-ef5e-4192-9b4b-27f4a98b151f\scratchpad\proceso-2.jpg" ./proceso-2.jpg
cp "C:\Users\ASUS\AppData\Local\Temp\claude\C--Users-ASUS-Desktop-nucleo\1d36291f-ef5e-4192-9b4b-27f4a98b151f\scratchpad\proceso-2.webp" ./proceso-2.webp
```
(Ejecutar desde la raíz del worktree — confirmar con `pwd`/`ls index.html` antes.)

- [ ] **Step 2: Actualizar el borde de `.pcard` (línea 113)**

Reemplazar:
```css
  .pcard{position:relative;border-radius:16px;overflow:hidden;border:1px solid rgba(0,212,255,.16);min-height:240px}
```
por:
```css
  .pcard{position:relative;border-radius:16px;overflow:hidden;border:1px solid rgba(0,117,198,.16);min-height:240px}
```

**No tocar** `.pcard .ov` (línea 115) — el scrim oscuro sobre la foto se mantiene igual a propósito (ver Global Constraints).

- [ ] **Step 3: Arreglar el texto `.pcard .txt .t` (excepción — sigue sobre fondo oscuro)**

Reemplazar:
```css
  .pcard .txt .t{font-family:'Syne',sans-serif;font-weight:700;font-size:1.1rem}
```
por:
```css
  .pcard .txt .t{font-family:'Syne',sans-serif;font-weight:700;font-size:1.1rem;color:#f0f8ff}
```
(Antes heredaba `color:var(--white)` de `body` — que era claro sobre el fondo oscuro global. Ahora `body` es navy sobre blanco, pero este texto sigue estando sobre el scrim oscuro de `.ov`, así que necesita su propio color claro explícito. `.pcard .txt .k`, que ya usa `var(--accent)` — ahora coral — no necesita cambio, sigue siendo legible sobre el scrim oscuro.)

- [ ] **Step 4: Actualizar `.stats-bar` (línea 131)**

Reemplazar:
```css
  .stats-bar{border-top:1px solid rgba(0,212,255,.1);border-bottom:1px solid rgba(0,212,255,.1);background:rgba(0,212,255,.03);padding:2rem}
```
por:
```css
  .stats-bar{border-top:1px solid rgba(0,117,198,.1);border-bottom:1px solid rgba(0,117,198,.1);background:rgba(0,117,198,.03);padding:2rem}
```
(`.stat-num` usa `var(--aqua)` y `.stat-label` usa `var(--muted)` — ambos se repuntean solos, no hace falta tocarlos.)

- [ ] **Step 5: Reemplazar las 2 imágenes en el markup**

Reemplazar:
```html
      <img src="https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=700&q=80&auto=format&fit=crop" alt="Estudiantes universitarios de ciencias de la salud revisando apuntes de su tesis en clase" loading="lazy" decoding="async" style="object-position:center 35%">
```
por:
```html
      <picture>
        <source srcset="proceso-1.webp" type="image/webp">
        <img src="proceso-1.jpg" alt="Investigadora revisando datos en su laptop en una biblioteca académica" loading="lazy" decoding="async">
      </picture>
```

Reemplazar:
```html
      <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=700&q=80&auto=format&fit=crop" alt="Equipo de investigadores colaborando con laptops en un proyecto científico" loading="lazy" decoding="async">
```
por:
```html
      <picture>
        <source srcset="proceso-2.webp" type="image/webp">
        <img src="proceso-2.jpg" alt="Dos investigadores colaborando frente a una laptop con libros de metodología" loading="lazy" decoding="async">
      </picture>
```

Nota: `.pcard img{width:100%;height:100%;position:absolute;inset:0;object-fit:cover}` (línea 114) selecciona `img` dentro de `.pcard` — como el nuevo `<img>` queda anidado dentro de un `<picture>` que a su vez está dentro de `.pcard`, el selector `.pcard img` lo sigue alcanzando igual (los combinadores descendientes no requieren hijos directos). No hace falta tocar esa regla.

- [ ] **Step 6: Verificar visualmente**

Recargar en el Browser pane y confirmar:
- Las 2 fotos nuevas se ven dentro de sus tarjetas redondeadas, con el scrim oscuro de abajo hacia arriba y el texto "Para tesistas e investigadores" / "Acompañamiento real" legible en blanco sobre el scrim.
- La barra de stats se ve con fondo muy sutil azulado, no aqua/dark.
- `read_network_requests` filtrando `urlPattern:"unsplash"` no debe devolver las 2 URLs reemplazadas (pueden seguir existiendo otras 2 de `razon`/`ctaband`, todavía no tocadas en esta tarea).

- [ ] **Step 7: Commit**

```bash
git add index.html proceso-1.jpg proceso-1.webp proceso-2.jpg proceso-2.webp
git commit -m "feat: tema claro en Proceso + barra de stats, con fotos reales de Canva"
```

---

### Task 3: Servicios + Diferencial + Principios

**Files:**
- Modify: `index.html:146` (`.svc-card:hover`)
- Modify: `index.html:160` (`.diferencial`)
- Modify: `index.html:165` (`.dif-card:hover`)
- Modify: `index.html:173-175` (`.principio-chip`, `.principio-chip:hover`, `.principio-chip .p-icon`)

**Interfaces:**
- Consumes: los tokens `:root` de la Task 1.
- Produces: nada que otra tarea consuma.

- [ ] **Step 1: Actualizar `.svc-card:hover`**

Reemplazar:
```css
  .svc-card:hover{border-color:rgba(0,212,255,.35);background:rgba(0,212,255,.05);transform:translateY(-4px)}
```
por:
```css
  .svc-card:hover{border-color:rgba(0,117,198,.35);background:rgba(0,117,198,.05);transform:translateY(-4px)}
```
(`.svc-card` usa `var(--surface)`/`var(--border)`, `.svc-card h3` usa `var(--white)`, `.svc-card::before` usa `var(--aqua)`, `.svc-list li::before` usa `var(--aqua)` — todos se repuntean solos.)

- [ ] **Step 2: Actualizar `.diferencial`**

Reemplazar:
```css
  .diferencial{padding:6rem 2rem;background:rgba(0,212,255,.02);border-top:1px solid rgba(0,212,255,.08);border-bottom:1px solid rgba(0,212,255,.08)}
```
por:
```css
  .diferencial{padding:6rem 2rem;background:rgba(0,117,198,.02);border-top:1px solid rgba(0,117,198,.08);border-bottom:1px solid rgba(0,117,198,.08)}
```
(Esta regla la comparten la sección "Diferencial" y "Principios" — ambas reusan `class="diferencial"` en su `<section>` — un solo cambio cubre las dos.)

- [ ] **Step 3: Actualizar `.dif-card:hover`**

Reemplazar:
```css
  .dif-card:hover{border-color:rgba(0,255,204,.3);background:rgba(0,255,204,.04);transform:translateY(-4px)}
```
por:
```css
  .dif-card:hover{border-color:rgba(255,49,49,.3);background:rgba(255,49,49,.04);transform:translateY(-4px)}
```
(El hover usaba un tinte del extinto verde-menta `--accent`; ahora usa un tinte del coral `#ff3131`, ya que `.dif-card::before` — que sí usa `var(--accent)` — se repuntea solo a coral. `.dif-card h3`/`.dif-card p` no tienen literales que tocar.)

- [ ] **Step 4: Actualizar los chips de Principios (se retira el lavanda)**

Reemplazar:
```css
  .principio-chip{flex:1 1 260px;background:rgba(123,127,196,.05);border:1px solid rgba(123,127,196,.22);border-radius:12px;padding:1.1rem 1.25rem;display:flex;gap:.75rem;align-items:flex-start;transition:border-color .3s,background .3s}
  .principio-chip:hover{border-color:rgba(123,127,196,.45);background:rgba(123,127,196,.09)}
  .principio-chip .p-icon{font-size:1.1rem;flex-shrink:0;width:2rem;height:2rem;border-radius:50%;background:rgba(123,127,196,.15);display:flex;align-items:center;justify-content:center}
```
por:
```css
  .principio-chip{flex:1 1 260px;background:rgba(0,117,198,.05);border:1px solid rgba(0,117,198,.22);border-radius:12px;padding:1.1rem 1.25rem;display:flex;gap:.75rem;align-items:flex-start;transition:border-color .3s,background .3s}
  .principio-chip:hover{border-color:rgba(0,117,198,.45);background:rgba(0,117,198,.09)}
  .principio-chip .p-icon{font-size:1.1rem;flex-shrink:0;width:2rem;height:2rem;border-radius:50%;background:rgba(0,117,198,.15);display:flex;align-items:center;justify-content:center}
```
(`.principio-chip h3` usa `var(--lavender)`, que la Task 1 ya repunteó a `#0075c6` — mismo azul que estos literales — no hace falta tocar esa línea.)

- [ ] **Step 5: Verificar visualmente**

Recargar y confirmar: las 6 tarjetas de "Diferencial" (íconos + texto) se ven con fondo gris muy claro y borde sutil azul, sin rastro de fondo oscuro; al pasar el mouse el borde se tiñe de coral. Los chips de "Principios" se ven con fondo/borde azul claro (ya no lavanda/violeta), y su encabezado en azul (antes lavanda).

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "style: tema claro en Servicios, Diferencial y Principios; se retira el lavanda"
```

---

### Task 4: Razón de ser (con 1 foto nueva) + Método

**Files:**
- Create: `razon-media.jpg`, `razon-media.webp` (raíz del repo) — copiar desde el scratchpad.
- Modify: `index.html:183,185,186` (`.razon-media .frame`, `.razon-media .tint`, `.razon-media .chip`)
- Modify: `index.html:193,194` (`.metodo-step:hover`, `.metodo-num`)
- Modify: `index.html` (markup del `<img>` en `.razon-media`)

**Interfaces:**
- Consumes: los tokens `:root` de la Task 1.
- Produces: nada que otra tarea consuma.

- [ ] **Step 1: Copiar la imagen a la raíz del repo**

```bash
cp "C:\Users\ASUS\AppData\Local\Temp\claude\C--Users-ASUS-Desktop-nucleo\1d36291f-ef5e-4192-9b4b-27f4a98b151f\scratchpad\razon-media.jpg" ./razon-media.jpg
cp "C:\Users\ASUS\AppData\Local\Temp\claude\C--Users-ASUS-Desktop-nucleo\1d36291f-ef5e-4192-9b4b-27f4a98b151f\scratchpad\razon-media.webp" ./razon-media.webp
```

- [ ] **Step 2: Actualizar `.razon-media .frame`**

Reemplazar:
```css
  .razon-media .frame{position:relative;border-radius:18px;overflow:hidden;border:1px solid rgba(0,212,255,.22);box-shadow:0 20px 50px rgba(0,0,0,.45)}
```
por:
```css
  .razon-media .frame{position:relative;border-radius:18px;overflow:hidden;border:1px solid rgba(0,117,198,.22);box-shadow:0 20px 50px rgba(0,48,96,.18)}
```
(Mismo tratamiento de sombra navy-tinted que ya se usó en `.hero-media .frame` en la ronda anterior, en vez de negro puro.)

- [ ] **Step 3: Actualizar `.razon-media .tint` (mantiene su mitad oscura a propósito)**

Reemplazar:
```css
  .razon-media .tint{position:absolute;inset:0;background:linear-gradient(160deg,rgba(0,212,255,.10),rgba(10,22,40,.55))}
```
por:
```css
  .razon-media .tint{position:absolute;inset:0;background:linear-gradient(160deg,rgba(0,117,198,.10),rgba(10,22,40,.55))}
```
(Solo cambia la mitad aqua→azul del degradado; la mitad `rgba(10,22,40,.55)` se mantiene — sigue dando ese tinte oscuro sutil sobre la foto real, consistente con el resto de fotos del sitio.)

- [ ] **Step 4: Arreglar `.razon-media .chip` (excepción — sigue sobre fondo oscuro)**

Reemplazar:
```css
  .razon-media .chip{position:absolute;bottom:14px;left:14px;background:rgba(10,22,40,.82);border:1px solid rgba(0,212,255,.25);border-radius:12px;padding:.55rem .8rem;font-size:.78rem;color:var(--white);display:flex;align-items:center;gap:.5rem}
```
por:
```css
  .razon-media .chip{position:absolute;bottom:14px;left:14px;background:rgba(10,22,40,.82);border:1px solid rgba(0,117,198,.25);border-radius:12px;padding:.55rem .8rem;font-size:.78rem;color:#f0f8ff;display:flex;align-items:center;gap:.5rem}
```
(Mismo arreglo que `.hero-media .chip` en la Task 1: fondo se mantiene oscuro, borde pasa a azul, texto se fija a blanco literal ya que `var(--white)` ahora es navy. `.razon-media .chip b`, que usa `var(--accent)` — ahora coral — no necesita cambio.)

- [ ] **Step 5: Actualizar `.metodo-step:hover` y `.metodo-num`**

Reemplazar:
```css
  .metodo-step:hover{border-color:rgba(0,212,255,.35);background:rgba(0,212,255,.05);transform:translateY(-4px)}
  .metodo-num{width:34px;height:34px;border-radius:50%;background:rgba(0,212,255,.15);color:var(--aqua);display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-weight:800;font-size:.95rem;margin-bottom:1rem}
```
por:
```css
  .metodo-step:hover{border-color:rgba(0,117,198,.35);background:rgba(0,117,198,.05);transform:translateY(-4px)}
  .metodo-num{width:34px;height:34px;border-radius:50%;background:rgba(0,117,198,.15);color:var(--aqua);display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-weight:800;font-size:.95rem;margin-bottom:1rem}
```
(`.metodo-step:last-child .metodo-num` usa `background:linear-gradient(135deg,var(--aqua),var(--accent))` y `color:var(--ocean)` — ambos se repuntean solos: gradiente azul→coral con texto blanco encima, funciona bien sin tocarlo. `.metodo-step h3` usa `var(--white)` — se repuntea solo, correcto sobre el fondo claro de `var(--surface)`.)

- [ ] **Step 6: Reemplazar la imagen en el markup**

Reemplazar:
```html
      <img src="https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=900&q=80&auto=format&fit=crop" alt="Microscopios en un laboratorio de investigación científica" loading="lazy" decoding="async">
```
por:
```html
      <picture>
        <source srcset="razon-media.webp" type="image/webp">
        <img src="razon-media.jpg" alt="Doctora revisando evidencia científica impresa junto a gráficos en pantalla" loading="lazy" decoding="async">
      </picture>
```
(`.razon-media img{width:100%;display:block;aspect-ratio:4/5;object-fit:cover}` sigue alcanzando el `<img>` anidado en el nuevo `<picture>` igual que en la Task 2.)

- [ ] **Step 7: Verificar visualmente**

Recargar y confirmar: la foto de la doctora revisando evidencia se ve dentro del marco con esquinas redondeadas y sombra sutil navy; el chip "Ciencia rigurosa, resultados reales" sigue legible en blanco sobre su fondo oscuro; las 5 tarjetas de "Cómo trabajamos" se ven con fondo claro y el número del último paso en el círculo degradado azul→coral con texto blanco legible.

- [ ] **Step 8: Commit**

```bash
git add index.html razon-media.jpg razon-media.webp
git commit -m "feat: tema claro en Razón de ser + Método, con foto real de Canva"
```

---

### Task 5: Precios + FAQ

**Files:**
- Modify: `index.html:206,215,219,220` (`.precio-card.featured`, `.precio-divider`, `.precio-features li .no`, `.precio-cta`)

**Interfaces:**
- Consumes: los tokens `:root` de la Task 1.
- Produces: nada que otra tarea consuma.

- [ ] **Step 1: Actualizar `.precio-card.featured`**

Reemplazar:
```css
  .precio-card.featured{border-color:var(--aqua);background:rgba(0,212,255,.07);box-shadow:0 0 40px rgba(0,212,255,.15);transform:scale(1.02)}
```
por:
```css
  .precio-card.featured{border-color:var(--aqua);background:rgba(0,117,198,.07);box-shadow:0 0 40px rgba(0,117,198,.15);transform:scale(1.02)}
```

- [ ] **Step 2: Actualizar `.precio-divider`**

Reemplazar:
```css
  .precio-divider{border:none;border-top:1px solid rgba(0,212,255,.1);margin:1.5rem 0}
```
por:
```css
  .precio-divider{border:none;border-top:1px solid rgba(0,117,198,.1);margin:1.5rem 0}
```

- [ ] **Step 3: Actualizar `.precio-features li .no`**

Reemplazar:
```css
  .precio-features li .no{color:rgba(255,255,255,.2);flex-shrink:0}
```
por:
```css
  .precio-features li .no{color:rgba(0,48,96,.2);flex-shrink:0}
```
(Marca el ítem "no incluido" con una X tenue — antes blanco-translúcido sobre tarjeta oscura, ahora navy-translúcido sobre la tarjeta clara `var(--surface)`. `.precio-features li .check` usa `var(--aqua)`, se repuntea solo.)

- [ ] **Step 4: Actualizar `.precio-cta`**

Reemplazar:
```css
  .precio-cta{display:block;text-align:center;margin-top:2rem;padding:.75rem;border-radius:100px;font-weight:600;font-size:.9rem;text-decoration:none;border:1px solid rgba(0,212,255,.3);color:var(--aqua);transition:all .2s}
```
por:
```css
  .precio-cta{display:block;text-align:center;margin-top:2rem;padding:.75rem;border-radius:100px;font-weight:600;font-size:.9rem;text-decoration:none;border:1px solid rgba(0,117,198,.3);color:var(--aqua);transition:all .2s}
```
(`.precio-card.featured .precio-cta`/`.precio-cta:hover` usan `background:var(--aqua);color:var(--ocean)` — se repuntean solos a azul con texto blanco, correcto. `.precio-badge` usa `background:var(--aqua);color:var(--ocean)` — mismo caso, se repuntea solo. `.precio-tag`/`.precio-amount`/`.pricing-note`/`.pricing-note a` no tienen literales que tocar.)

- [ ] **Step 5: FAQ — confirmar que no requiere cambios**

`.faq-item` usa `var(--surface)`/`var(--border)`; `.faq-q` usa `var(--white)`; `.faq-q:hover`/`.faq-q .arrow` usan `var(--aqua)`; `.faq-a p` usa `var(--muted)` — todas variables, todas se repuntean solas. No hay ningún `rgba(...)` literal en las reglas de FAQ (líneas 227-236). No se requiere ningún cambio de código en esta sección — solo verificarla visualmente en el Step 6.

- [ ] **Step 6: Verificar visualmente**

Recargar y confirmar: las 3 tarjetas de precios se ven con fondo gris muy claro, la tarjeta destacada (featured) con borde y fondo azul sutil, el badge "Más elegido" en azul con texto blanco; el ítem tachado ("no incluido") se ve como una X gris tenue, no invisible. La lista de FAQ se ve con fondo claro, texto navy, flechas azules, y al hacer clic en una pregunta se expande correctamente.

- [ ] **Step 7: Commit**

```bash
git add index.html
git commit -m "style: tema claro en Precios y verificación de FAQ"
```

---

### Task 6: Banda CTA (con 1 foto nueva) + Áreas SEO + Privacidad + Footer

**Files:**
- Create: `ctaband.jpg`, `ctaband.webp` (raíz del repo) — copiar desde el scratchpad.
- Modify: `index.html:122,126-128` (`.ctaband-inner`, `.ctaband-content .k`/`h2`/`p`)
- Modify: `index.html:241` (`.area-tag`)
- Modify: `index.html:246` (`.privacy-block`)
- Modify: `index.html:251,256,260,261` (`footer`, `.footer-col h4`, `.footer-bottom`, `.footer-bottom p`)
- Modify: `index.html` (markup del `<img>` en `.ctaband-inner`; el `<p>` inline-styled del footer con la misma `rgba(136,153,187,.5)`)

**Interfaces:**
- Consumes: los tokens `:root` de la Task 1.
- Produces: nada que otra tarea consuma.

- [ ] **Step 1: Copiar la imagen a la raíz del repo**

```bash
cp "C:\Users\ASUS\AppData\Local\Temp\claude\C--Users-ASUS-Desktop-nucleo\1d36291f-ef5e-4192-9b4b-27f4a98b151f\scratchpad\ctaband.jpg" ./ctaband.jpg
cp "C:\Users\ASUS\AppData\Local\Temp\claude\C--Users-ASUS-Desktop-nucleo\1d36291f-ef5e-4192-9b4b-27f4a98b151f\scratchpad\ctaband.webp" ./ctaband.webp
```

- [ ] **Step 2: Actualizar el borde de `.ctaband-inner`**

Reemplazar:
```css
  .ctaband-inner{position:relative;border-radius:20px;overflow:hidden;border:1px solid rgba(0,212,255,.2);min-height:280px;display:flex;align-items:center;justify-content:center;text-align:center}
```
por:
```css
  .ctaband-inner{position:relative;border-radius:20px;overflow:hidden;border:1px solid rgba(0,117,198,.2);min-height:280px;display:flex;align-items:center;justify-content:center;text-align:center}
```

**No tocar** `.ctaband-inner .ov` — el scrim oscuro sobre la foto se mantiene igual a propósito (ver Global Constraints).

- [ ] **Step 3: Arreglar `.ctaband-content h2` y `.ctaband-content p` (excepción — siguen sobre fondo oscuro)**

Reemplazar:
```css
  .ctaband-content .k{font-size:.75rem;letter-spacing:.16em;text-transform:uppercase;color:var(--accent);margin-bottom:.9rem}
  .ctaband-content h2{font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(1.6rem,3vw,2.3rem);line-height:1.12;margin:0 auto .9rem;max-width:640px}
  .ctaband-content p{color:var(--muted);font-size:1rem;line-height:1.7;max-width:520px;margin:0 auto 1.6rem}
```
por:
```css
  .ctaband-content .k{font-size:.75rem;letter-spacing:.16em;text-transform:uppercase;color:var(--accent);margin-bottom:.9rem}
  .ctaband-content h2{font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(1.6rem,3vw,2.3rem);line-height:1.12;margin:0 auto .9rem;max-width:640px;color:#f0f8ff}
  .ctaband-content p{color:rgba(240,248,255,.75);font-size:1rem;line-height:1.7;max-width:520px;margin:0 auto 1.6rem}
```
(`.ctaband-content h2` no tenía color propio — heredaba `body`, que era claro sobre fondo oscuro global; ahora `body` es navy sobre blanco, pero este título sigue sobre el scrim oscuro de `.ov`, así que necesita blanco explícito. `.ctaband-content p` usaba `var(--muted)` — gris-azulado pensado para fondo oscuro global; ahora que `--muted` es un gris más oscuro para fondo CLARO, se cambia a un blanco-translúcido para seguir siendo legible sobre el scrim oscuro. `.ctaband-content .k` sigue con `var(--accent)` — ahora coral, sigue siendo legible sobre el scrim, no se toca.)

- [ ] **Step 4: Reemplazar la imagen en el markup**

Reemplazar:
```html
    <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1100&q=80&auto=format&fit=crop" alt="Investigadores analizando datos y anotaciones durante una asesoría estadística" loading="lazy" decoding="async">
```
por:
```html
    <picture>
      <source srcset="ctaband.webp" type="image/webp">
      <img src="ctaband.jpg" alt="Investigadora analizando gráficos de datos en su computadora" loading="lazy" decoding="async">
    </picture>
```
(`.ctaband-inner img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}` sigue alcanzando el `<img>` anidado en el nuevo `<picture>`.)

- [ ] **Step 5: Actualizar `.area-tag`**

Reemplazar:
```css
  .area-tag{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);color:rgba(240,248,255,.55);font-size:.8rem;padding:.35rem .85rem;border-radius:8px}
```
por:
```css
  .area-tag{background:rgba(0,48,96,.04);border:1px solid rgba(0,48,96,.10);color:rgba(0,48,96,.6);font-size:.8rem;padding:.35rem .85rem;border-radius:8px}
```
(Chips blanco-translúcido sobre fondo oscuro → navy-translúcido sobre fondo claro.)

- [ ] **Step 6: Actualizar el borde de `.privacy-block`**

Reemplazar:
```css
  .privacy-block{background:var(--surface);border:1px solid rgba(0,212,255,.1);border-radius:16px;padding:2rem;margin-bottom:1rem}
```
por:
```css
  .privacy-block{background:var(--surface);border:1px solid rgba(0,117,198,.1);border-radius:16px;padding:2rem;margin-bottom:1rem}
```
(`.privacy-block h3` usa `var(--aqua)`, `.privacy-block p` usa `var(--muted)`, `.privacy h2` no tiene color propio y hereda `var(--white)` de `body` — ahora navy sobre blanco, correcto — ninguno necesita cambio.)

- [ ] **Step 7: Actualizar el footer**

Reemplazar:
```css
  footer{border-top:1px solid rgba(0,212,255,.1);padding:4rem 2rem 3rem;max-width:1100px;margin:0 auto}
```
por:
```css
  footer{border-top:1px solid rgba(0,117,198,.1);padding:4rem 2rem 3rem;max-width:1100px;margin:0 auto}
```

Reemplazar:
```css
  .footer-col h4{font-family:'Syne',sans-serif;font-size:.85rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:rgba(240,248,255,.5);margin-bottom:1rem}
```
por:
```css
  .footer-col h4{font-family:'Syne',sans-serif;font-size:.85rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:rgba(0,48,96,.5);margin-bottom:1rem}
```

Reemplazar:
```css
  .footer-bottom{border-top:1px solid rgba(0,212,255,.08);padding-top:1.5rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem}
  .footer-bottom p{color:rgba(136,153,187,.5);font-size:.75rem}
```
por:
```css
  .footer-bottom{border-top:1px solid rgba(0,117,198,.08);padding-top:1.5rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem}
  .footer-bottom p{color:rgba(74,98,133,.75);font-size:.75rem}
```
(`.footer-brand .footer-logo span` usa `var(--aqua)`, `.footer-brand p`/`.footer-col ul li a` usan `var(--muted)`, `.footer-col ul li a:hover` usa `var(--aqua)` — todos se repuntean solos. El `rgba(136,153,187,.5)` de `.footer-bottom p` era un gris claro apenas legible sobre fondo oscuro — sobre blanco, con esa misma opacidad baja, sería casi invisible; se sube la opacidad para mantener legibilidad.)

- [ ] **Step 8: Actualizar el mismo literal en el markup del footer**

Busca en el markup del footer (dentro de `.footer-brand`) un `<p>` con estilo inline `color:rgba(136,153,187,.5)` (el texto "Lima, Perú · Atención Latinoamérica"). Reemplazar:
```html
      <p style="margin-top:.75rem;font-size:.8rem;color:rgba(136,153,187,.5)">Lima, Perú · Atención Latinoamérica</p>
```
por:
```html
      <p style="margin-top:.75rem;font-size:.8rem;color:rgba(74,98,133,.75)">Lima, Perú · Atención Latinoamérica</p>
```
(Mismo ajuste de legibilidad que en `.footer-bottom p`, ya que usa el mismo literal.)

- [ ] **Step 9: Verificar visualmente**

Recargar y confirmar: la banda CTA final se ve con la foto nueva, scrim oscuro y texto "¿Listo para llevar tu investigación al siguiente nivel?" claramente legible en blanco; los chips de "Áreas de especialización" se ven con fondo/borde/texto navy tenue sobre blanco, no invisibles; el bloque de política de privacidad se ve con tarjetas claras; el footer se ve con fondo blanco, encabezados de columna legibles, y el texto "Lima, Perú · Atención Latinoamérica" / "© 2026 DolphinStats..." legible (no un gris casi invisible).

- [ ] **Step 10: Commit**

```bash
git add index.html ctaband.jpg ctaband.webp
git commit -m "feat: tema claro en banda CTA, Áreas SEO, Privacidad y Footer, con foto real de Canva"
```

---

### Task 7: Verificación final end-to-end (desktop + mobile)

**Files:** ninguno (solo verificación, salvo un posible fix puntual).

**Interfaces:**
- Consumes: el resultado completo de las Tasks 1-6.
- Produces: nada.

- [ ] **Step 1: Verificación en viewport desktop**

Con el sitio servido localmente y cargado en el Browser pane, hacer scroll por TODA la página y confirmar con capturas:
- Cero rastros de fondo oscuro/navy fuera de los scrims intencionales sobre fotos (chips, `.ov` de Proceso/CTA band).
- Cero rastros de aqua `#00d4ff` o menta `#00ffcc` — todo acento debe verse azul `#0075c6` o coral `#ff3131`.
- Los chips de "Principios" ya no se ven lavanda/violeta.
- Las 4 fotos nuevas (Proceso ×2, Razón de ser, CTA band) cargan correctamente, sin roturas de layout.
- El botón "Solicitar asesoría →" de la banda CTA final se ve azul sólido (confirma el fix de la Task 1, Step 3).

- [ ] **Step 2: Verificación en viewport mobile**

`resize_window{preset:"mobile"}`, recargar, hacer scroll por toda la página y confirmar que ninguna sección se ve rota o con texto ilegible (especialmente los chips/áreas/footer, que cambian de padding en la media query existente). Volver a `resize_window{preset:"desktop"}` al terminar.

- [ ] **Step 3: Revisar la consola del navegador**

`read_console_messages{onlyErrors:true}` — debe devolver vacío o solo ruido preexistente no relacionado (ej. 404s de analytics de Vercel bajo servidor local). En particular, cero 404 de las 8 imágenes nuevas.

- [ ] **Step 4: Confirmar que no queda ningún literal `rgba(0,212,255` ni `rgba(10,22,40` fuera de las excepciones documentadas**

Ejecutar sobre el `index.html` final:
```bash
grep -n "rgba(0,212,255" index.html
grep -n "rgba(10,22,40" index.html
```
El primer grep debe devolver CERO resultados fuera del bloque del widget de chat (`#ds-chat-btn`/`#ds-chat-overlay`/`#ds-chat-header`, líneas ~760-925 aprox., fuera de alcance) — si aparece alguno fuera de ese bloque, es un literal que esta ronda debió convertir y se pasó por alto; corregirlo.
El segundo grep debe devolver únicamente las 4 excepciones documentadas (`.hero-media .chip`, `.pcard .ov`, `.ctaband-inner .ov`, `.razon-media .chip`) — cualquier otra aparición es inesperada y hay que investigarla.

- [ ] **Step 5: Si algún check reveló un defecto, arreglarlo y commitear**

```bash
git add index.html
git commit -m "fix: ajustes de verificación visual del tema claro en todo el sitio"
```
Si no hubo defectos, este paso no aplica — las Tasks 1-6 ya dejaron todo commiteado.
