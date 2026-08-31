# Adopción de la paleta de Canva (prototipo del hero) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convertir `<nav>` (incl. mega menú) y `.hero` de `dolphinstats-web` de tema oscuro navy/aqua a tema claro con la paleta definitiva del Brochure de Canva (`#0075c6`/`#51d7e7`/`#ff3131`/`#003060`), reemplazando el gráfico SVG del hero por la foto real exportada del Brochure.

**Architecture:** Mismo sitio estático de un solo archivo (`index.html`, sin build step, CSS inline). Se agregan dos archivos de imagen nuevos (`hero-doctora.jpg`/`.webp`) a la raíz del repo, mismo patrón que `logo-dolphin.png`/`.webp`. Se introducen variables CSS locales (`--lp-*`) compartidas por los selectores `nav, .hero` para no tocar el `:root` global (que las ~9 secciones restantes, todavía en tema oscuro, siguen usando sin cambios hasta una ronda posterior).

**Tech Stack:** HTML5, CSS plano (sin frameworks). Sin JS nuevo en este plan.

## Global Constraints

- Alcance: solo `<nav>` (incluye `.mega`) y la `<section>`/`.hero` que la contiene. No se toca ninguna otra sección del sitio, ni `app.js`, ni la tarjeta de invitación al chat.
- Paleta definitiva (hex exactos, no aproximar): `#0075c6` (azul, "Dolphin"), `#51d7e7` (cian, "Stats"), `#ff3131` (coral, palabra clave del titular), `#003060` (navy, texto principal).
- No se modifica el bloque `:root` global (`--ocean`, `--aqua`, `--white`, `--muted`, `--accent`, `--lavender`, `--surface`, `--border` quedan intactos) — los nuevos colores viven en variables locales `--lp-*` definidas en el selector `nav, .hero`.
- La foto reemplaza por completo el gráfico SVG del hero (incluye eliminar las reglas `.hero-graphic`, `.pt`, `.line`, sus `@keyframes`, y el bloque `@media (prefers-reduced-motion: reduce)` asociado — ya no aplican sin el SVG).
- Las imágenes nuevas ya están exportadas y optimizadas en:
  `C:\Users\ASUS\AppData\Local\Temp\claude\C--Users-ASUS-Desktop-nucleo\1d36291f-ef5e-4192-9b4b-27f4a98b151f\scratchpad\hero-doctora.jpg` y `hero-doctora.webp` — deben copiarse (no regenerarse) a la raíz de `dolphinstats-web`.
- No hay framework de tests ni `package.json` en este repo — la verificación de cada tarea es manual, vía el Browser pane.

---

### Task 1: Nav claro (incl. mega menú)

**Files:**
- Modify: `index.html:40` (`nav{...}`)
- Modify: `index.html:41-42` (`.logo{...}`, `.logo span{...}`)
- Modify: `index.html:44-45` (`.nav-links a{...}`, `.nav-links a:hover{...}`)
- Modify: `index.html:51,55-58` (`.mega{...}`, `.mega a:hover{...}`, `.mega .num{...}`, `.mega b{...}`, `.mega .d{...}`)
- Modify: `index.html:59-60` (`.nav-cta{...}`, `.nav-cta:hover{...}`)

**Interfaces:**
- Consumes: nada.
- Produces: las variables CSS `--lp-blue`, `--lp-cyan`, `--lp-navy`, `--lp-muted` definidas en el selector `nav, .hero` — las Tasks 2 y 3 las reutilizan (no las redefinen).

- [ ] **Step 1: Definir las variables locales de paleta en `nav, .hero`**

Inmediatamente antes de la regla `nav{...}` en `index.html:40`, agregar:
```css
  nav, .hero{
    --lp-blue:#0075c6;
    --lp-cyan:#51d7e7;
    --lp-coral:#ff3131;
    --lp-navy:#003060;
    --lp-muted:#4a6285;
    --lp-bg:#ffffff;
  }
```

- [ ] **Step 2: Reemplazar la regla `nav{...}`**

Reemplazar:
```css
  nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:1.2rem 2rem;display:flex;justify-content:space-between;align-items:center;backdrop-filter:blur(10px);border-bottom:1px solid rgba(255,255,255,.06);background:rgba(10,22,40,.92)}
```
por:
```css
  nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:1.2rem 2rem;display:flex;justify-content:space-between;align-items:center;backdrop-filter:blur(10px);border-bottom:1px solid rgba(0,48,96,.08);background:rgba(255,255,255,.92)}
```

- [ ] **Step 3: Reemplazar `.logo`/`.logo span`**

Reemplazar:
```css
  .logo{font-family:'Syne',sans-serif;font-weight:800;font-size:1.3rem;color:var(--white);display:flex;align-items:center;gap:.5rem;text-decoration:none}
  .logo span{color:var(--aqua)}
```
por:
```css
  .logo{font-family:'Syne',sans-serif;font-weight:800;font-size:1.3rem;color:var(--lp-blue);display:flex;align-items:center;gap:.5rem;text-decoration:none}
  .logo span{color:var(--lp-cyan)}
```

- [ ] **Step 4: Reemplazar `.nav-links a`/`.nav-links a:hover`**

Reemplazar:
```css
  .nav-links a{color:var(--muted);text-decoration:none;font-size:.9rem;font-weight:500;transition:color .2s}
  .nav-links a:hover{color:var(--aqua)}
```
por:
```css
  .nav-links a{color:var(--lp-muted);text-decoration:none;font-size:.9rem;font-weight:500;transition:color .2s}
  .nav-links a:hover{color:var(--lp-blue)}
```

- [ ] **Step 5: Reemplazar el mega menú**

Reemplazar:
```css
  .mega{position:absolute;top:calc(100% + 16px);left:50%;transform:translateX(-50%) translateY(10px);width:600px;background:rgba(10,22,40,.97);backdrop-filter:blur(20px);border:1px solid rgba(0,212,255,.2);border-radius:18px;padding:1rem;display:grid;grid-template-columns:1fr 1fr;gap:.3rem;opacity:0;visibility:hidden;transition:opacity .25s,transform .25s,visibility .25s;box-shadow:0 24px 60px rgba(0,0,0,.55),0 0 0 1px rgba(0,255,204,.05) inset;z-index:200}
  .mega::before{content:'';position:absolute;top:-16px;left:0;right:0;height:16px}
  .nav-drop:hover .mega,.nav-drop:focus-within .mega{opacity:1;visibility:visible;transform:translateX(-50%) translateY(0)}
  .mega a{display:flex;gap:.75rem;align-items:flex-start;padding:.7rem .85rem;border-radius:12px;transition:background .2s}
  .mega a:hover{background:rgba(0,212,255,.08)}
  .mega .num{font-family:'Syne',sans-serif;font-weight:800;font-size:.72rem;color:var(--aqua);margin-top:.2rem;opacity:.85}
  .mega b{display:block;color:var(--white);font-size:.85rem;font-weight:600;margin-bottom:.1rem}
  .mega .d{font-size:.72rem;color:var(--muted);line-height:1.4}
```
por:
```css
  .mega{position:absolute;top:calc(100% + 16px);left:50%;transform:translateX(-50%) translateY(10px);width:600px;background:rgba(255,255,255,.98);backdrop-filter:blur(20px);border:1px solid rgba(0,48,96,.12);border-radius:18px;padding:1rem;display:grid;grid-template-columns:1fr 1fr;gap:.3rem;opacity:0;visibility:hidden;transition:opacity .25s,transform .25s,visibility .25s;box-shadow:0 24px 60px rgba(0,48,96,.18);z-index:200}
  .mega::before{content:'';position:absolute;top:-16px;left:0;right:0;height:16px}
  .nav-drop:hover .mega,.nav-drop:focus-within .mega{opacity:1;visibility:visible;transform:translateX(-50%) translateY(0)}
  .mega a{display:flex;gap:.75rem;align-items:flex-start;padding:.7rem .85rem;border-radius:12px;transition:background .2s}
  .mega a:hover{background:rgba(0,117,198,.08)}
  .mega .num{font-family:'Syne',sans-serif;font-weight:800;font-size:.72rem;color:var(--lp-blue);margin-top:.2rem;opacity:.85}
  .mega b{display:block;color:var(--lp-navy);font-size:.85rem;font-weight:600;margin-bottom:.1rem}
  .mega .d{font-size:.72rem;color:var(--lp-muted);line-height:1.4}
```
(Nota: `.mega::before` y `.nav-drop:hover .mega,...` no cambian de color — se incluyen aquí solo como contexto de dónde caen las líneas que sí cambian, entre ellas.)

- [ ] **Step 6: Reemplazar `.nav-cta`/`.nav-cta:hover`**

Reemplazar:
```css
  .nav-cta{background:var(--aqua);color:var(--ocean)!important;padding:.5rem 1.2rem;border-radius:100px;font-weight:600!important;transition:box-shadow .2s!important}
  .nav-cta:hover{box-shadow:0 0 20px rgba(0,212,255,.4)}
```
por:
```css
  .nav-cta{background:var(--lp-blue);color:#fff!important;padding:.5rem 1.2rem;border-radius:100px;font-weight:600!important;transition:box-shadow .2s!important}
  .nav-cta:hover{box-shadow:0 0 20px rgba(0,117,198,.4)}
```

- [ ] **Step 7: Verificar visualmente**

Abrir `index.html` en el Browser pane (sirviendo el directorio con `python -m http.server` desde la raíz del repo — `file://` no ejecuta JS/renderiza bien fuera del proyecto principal, según lo encontrado en tareas previas) y confirmar con `read_page`/captura:
- El nav tiene fondo blanco translúcido, no navy oscuro.
- El logo dice "Dolphin" en azul y "Stats" en cian.
- Al pasar el mouse sobre "Explorar", el mega menú despliega con fondo blanco y texto navy, no oscuro (la sección `.hero` seguirá en tema oscuro hasta la Task 2 — es un estado intermedio esperado, no un bug).
- El botón "Solicitar asesoría" del nav es azul con texto blanco.

- [ ] **Step 8: Commit**

```bash
git add index.html
git commit -m "feat: nav claro con paleta definitiva de Canva (azul/cian)"
```

---

### Task 2: `.hero` (texto) claro

**Files:**
- Modify: `index.html:64` (`.hero{...}` — agregar background)
- Modify: `index.html:66` (`.hero-watermark{...}`)
- Modify: `index.html:69-70` (`.hero-tag{...}`, `.hero-tag::before{...}`)
- Modify: `index.html:71-73` (`.hero h1{...}`, `.hero h1 em{...}`, `.hero h1 em::after{...}`)
- Modify: `index.html:74` (`.hero-sub{...}`)
- Modify: `index.html:85` (`.hero-specs{...}`)
- Modify: `index.html:87-90` (`.btn-primary{...}`, `.btn-primary:hover{...}`, `.btn-secondary{...}`, `.btn-secondary:hover{...}`)
- Modify: `index.html:317` (markup: agregar `class="hero-wrap"` a la `<section>` del hero)

**Interfaces:**
- Consumes: `--lp-blue`, `--lp-cyan`, `--lp-coral`, `--lp-navy`, `--lp-muted`, `--lp-bg` (definidas en Task 1, Step 1, en el selector `nav, .hero`).
- Produces: la clase `.hero-wrap` con fondo claro — no la consume ninguna otra tarea de este plan, pero queda disponible para la ronda futura que toque el resto del sitio.

- [ ] **Step 1: Marcar la sección del hero para poder darle fondo claro**

`.hero` en sí es una caja centrada (`max-width:1100px;margin:0 auto`) que NO cubre el ancho completo de la página — el fondo debe ir en la `<section>` que la envuelve, no en `.hero`. Como `<section>` (sin clase) es un selector compartido por otras secciones del sitio (`section{position:relative;z-index:1}` en `index.html` ~línea 61, que NO se toca), hace falta una clase propia solo para esta sección.

En `index.html:317`, reemplazar:
```html
<section>
```
por:
```html
<section class="hero-wrap">
```
(Es la única línea de markup que cambia en esta tarea — el resto son reglas CSS.)

- [ ] **Step 2: Agregar la regla `.hero-wrap`**

Inmediatamente antes de la regla `.hero{...}` en `index.html:64`, agregar:
```css
  .hero-wrap{background:var(--lp-bg)}
```

- [ ] **Step 3: Corregir el watermark del logo para fondo claro**

Reemplazar:
```css
  .hero-watermark{position:absolute;top:1rem;left:-60px;width:340px;height:340px;object-fit:contain;opacity:.1;pointer-events:none;z-index:0;filter:brightness(0) invert(1) blur(.3px)}
```
por:
```css
  .hero-watermark{position:absolute;top:1rem;left:-60px;width:340px;height:340px;object-fit:contain;opacity:.08;pointer-events:none;z-index:0}
```
(El filtro anterior forzaba el logo a blanco puro — invisible sobre fondo blanco. Se quita el filtro para que se vea en sus colores naturales, muy tenue por la opacidad baja.)

- [ ] **Step 4: Reemplazar `.hero-tag`/`.hero-tag::before`**

Reemplazar:
```css
  .hero-tag{display:inline-flex;align-items:center;gap:.7rem;color:var(--aqua);font-size:.78rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase;margin-bottom:2rem;width:fit-content;animation:fadeUp .8s ease both}
  .hero-tag::before{content:'';width:28px;height:1px;background:var(--aqua);flex-shrink:0}
```
por:
```css
  .hero-tag{display:inline-flex;align-items:center;gap:.7rem;color:var(--lp-blue);font-size:.78rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase;margin-bottom:2rem;width:fit-content;animation:fadeUp .8s ease both}
  .hero-tag::before{content:'';width:28px;height:1px;background:var(--lp-blue);flex-shrink:0}
```

- [ ] **Step 5: Reemplazar el `<h1>` y su `<em>`**

Reemplazar:
```css
  .hero h1{font-family:'Syne',sans-serif;font-size:clamp(2.6rem,5.5vw,4.6rem);font-weight:800;line-height:1.05;letter-spacing:-.03em;margin-bottom:1.5rem;animation:fadeUp .8s ease .1s both}
  .hero h1 em{font-style:normal;color:var(--aqua);position:relative}
  .hero h1 em::after{content:'';position:absolute;bottom:4px;left:0;right:0;height:3px;background:var(--aqua);opacity:.4;border-radius:2px}
```
por:
```css
  .hero h1{font-family:'Syne',sans-serif;font-size:clamp(2.6rem,5.5vw,4.6rem);font-weight:800;line-height:1.05;letter-spacing:-.03em;margin-bottom:1.5rem;color:var(--lp-navy);animation:fadeUp .8s ease .1s both}
  .hero h1 em{font-style:normal;color:var(--lp-coral);position:relative}
  .hero h1 em::after{content:'';position:absolute;bottom:4px;left:0;right:0;height:3px;background:var(--lp-coral);opacity:.4;border-radius:2px}
```
(Se agrega `color:var(--lp-navy)` al `.hero h1` porque antes heredaba `var(--white)` de `body{color:...}` — necesario ahora que el fondo es claro.)

- [ ] **Step 6: Reemplazar `.hero-sub`**

Reemplazar:
```css
  .hero-sub{font-size:1.1rem;color:var(--muted);max-width:580px;line-height:1.8;margin-bottom:1.5rem;animation:fadeUp .8s ease .2s both}
```
por:
```css
  .hero-sub{font-size:1.1rem;color:var(--lp-muted);max-width:580px;line-height:1.8;margin-bottom:1.5rem;animation:fadeUp .8s ease .2s both}
```

- [ ] **Step 7: Reemplazar `.hero-specs`**

Reemplazar:
```css
  .hero-specs{color:var(--muted);font-size:.85rem;letter-spacing:.01em;line-height:1.7;max-width:520px;margin-bottom:2.5rem;animation:fadeUp .8s ease .25s both}
```
por:
```css
  .hero-specs{color:var(--lp-muted);font-size:.85rem;letter-spacing:.01em;line-height:1.7;max-width:520px;margin-bottom:2.5rem;animation:fadeUp .8s ease .25s both}
```

- [ ] **Step 8: Reemplazar los botones del hero**

Reemplazar:
```css
  .btn-primary{background:var(--aqua);color:var(--ocean);padding:.9rem 2rem;border-radius:100px;font-weight:700;font-size:1rem;text-decoration:none;transition:transform .2s,box-shadow .2s;box-shadow:0 0 30px rgba(0,212,255,.3)}
  .btn-primary:hover{transform:translateY(-2px);box-shadow:0 0 50px rgba(0,212,255,.5)}
  .btn-secondary{background:transparent;color:var(--white);padding:.9rem 2rem;border-radius:100px;font-weight:600;font-size:1rem;text-decoration:none;border:1px solid rgba(255,255,255,.2);transition:border-color .2s,color .2s}
  .btn-secondary:hover{border-color:var(--aqua);color:var(--aqua)}
```
por:
```css
  .btn-primary{background:var(--lp-blue);color:#fff;padding:.9rem 2rem;border-radius:100px;font-weight:700;font-size:1rem;text-decoration:none;transition:transform .2s,box-shadow .2s;box-shadow:0 0 30px rgba(0,117,198,.25)}
  .btn-primary:hover{transform:translateY(-2px);box-shadow:0 0 50px rgba(0,117,198,.4)}
  .btn-secondary{background:transparent;color:var(--lp-navy);padding:.9rem 2rem;border-radius:100px;font-weight:600;font-size:1rem;text-decoration:none;border:1px solid rgba(0,48,96,.2);transition:border-color .2s,color .2s}
  .btn-secondary:hover{border-color:var(--lp-blue);color:var(--lp-blue)}
```

- [ ] **Step 9: Verificar visualmente**

Recargar en el Browser pane y confirmar:
- El fondo de toda la sección del hero (no solo el texto) es blanco, sin ningún resto de navy oscuro visible detrás.
- El watermark del delfín se ve tenue en su color natural (no invisible, no un bloque blanco).
- "Consultoría científica especializada · Lima, Perú" está en azul.
- El `<h1>` "Del dato / al artículo" está en navy, con "al artículo" en rojo-coral con su línea de subrayado también coral.
- El párrafo y la línea de especialidades están en gris-azulado legible sobre blanco.
- El botón "Solicitar asesoría →" es azul sólido con texto blanco; "Explorar servicios" es un botón outline navy.
- (La foto del `hero-media` todavía muestra el SVG viejo — se reemplaza en la Task 3, es esperado en este punto.)

- [ ] **Step 10: Commit**

```bash
git add index.html
git commit -m "feat: hero claro con paleta definitiva de Canva (texto, botones, watermark)"
```

---

### Task 3: Foto real en `hero-media` (reemplaza el SVG)

**Files:**
- Create: `index.html` (raíz del repo) `hero-doctora.jpg` — copiar desde `C:\Users\ASUS\AppData\Local\Temp\claude\C--Users-ASUS-Desktop-nucleo\1d36291f-ef5e-4192-9b4b-27f4a98b151f\scratchpad\hero-doctora.jpg`
- Create: `index.html` (raíz del repo) `hero-doctora.webp` — copiar desde `C:\Users\ASUS\AppData\Local\Temp\claude\C--Users-ASUS-Desktop-nucleo\1d36291f-ef5e-4192-9b4b-27f4a98b151f\scratchpad\hero-doctora.webp`
- Modify: `index.html:93-103` (reglas `.hero-media`, `.hero-graphic`, `.pt`, `.line`, `@media (prefers-reduced-motion)`, `@keyframes ds-pt-in`, `@keyframes ds-line-draw`)
- Modify: `index.html:333-358` (markup de `.hero-media`: el `<svg class="hero-graphic">` completo con sus 18 `<circle>` + 1 `<line>`, reemplazado por un `<picture>`/`<img>`)

**Interfaces:**
- Consumes: `--lp-*` (Task 1); la clase `.hero-wrap` no se usa aquí directamente.
- Produces: nada que otra tarea de este plan consuma.

- [ ] **Step 1: Copiar los archivos de imagen a la raíz del repo**

```bash
cp "C:\Users\ASUS\AppData\Local\Temp\claude\C--Users-ASUS-Desktop-nucleo\1d36291f-ef5e-4192-9b4b-27f4a98b151f\scratchpad\hero-doctora.jpg" ./hero-doctora.jpg
cp "C:\Users\ASUS\AppData\Local\Temp\claude\C--Users-ASUS-Desktop-nucleo\1d36291f-ef5e-4192-9b4b-27f4a98b151f\scratchpad\hero-doctora.webp" ./hero-doctora.webp
```
(Ejecutar desde la raíz del worktree de `dolphinstats-web` — confirmar con `pwd`/`ls index.html` antes de copiar que estás en el directorio correcto.)

- [ ] **Step 2: Reemplazar las reglas CSS de `.hero-media`**

Reemplazar (desde `.hero-media{...}` hasta `@keyframes ds-line-draw{...}` inclusive — NO tocar las dos líneas siguientes, `.hero-media .chip{...}` y `.hero-media .chip b{...}`, que quedan igual):
```css
  .hero-media{position:relative;animation:fadeUp .8s ease .35s both}
  .hero-media .frame{position:relative;aspect-ratio:4/5;border-radius:18px;overflow:hidden;border:1px solid rgba(0,212,255,.22);box-shadow:0 20px 50px rgba(0,0,0,.45);background:linear-gradient(160deg,rgba(0,212,255,.07),rgba(10,22,40,.95))}
  .hero-graphic{width:100%;height:100%;display:block}
  .hero-graphic .pt{transform-box:fill-box;transform-origin:center;opacity:0;animation:ds-pt-in .5s ease forwards}
  .hero-graphic .line{stroke-dasharray:520;stroke-dashoffset:520;animation:ds-line-draw 1.4s ease .5s forwards}
  @media (prefers-reduced-motion: reduce){
    .hero-graphic .pt{opacity:1;animation:none}
    .hero-graphic .line{stroke-dashoffset:0;animation:none}
  }
  @keyframes ds-pt-in{from{opacity:0;transform:scale(.3)}to{opacity:1;transform:scale(1)}}
  @keyframes ds-line-draw{to{stroke-dashoffset:0}}
```
por:
```css
  .hero-media{position:relative;animation:fadeUp .8s ease .35s both}
  .hero-media .frame{position:relative;aspect-ratio:4/5;border-radius:18px;overflow:hidden;border:1px solid rgba(0,48,96,.12);box-shadow:0 20px 50px rgba(0,48,96,.18)}
  .hero-media .frame img{width:100%;height:100%;object-fit:cover;display:block}
```

- [ ] **Step 3: Reemplazar el markup de `.hero-media`**

Reemplazar (todo el bloque desde `<div class="hero-media">` hasta su `</div>` de cierre — el `<div class="chip">...</div>` se conserva sin cambios, solo cambia lo que está antes de él):
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
por:
```html
    <div class="hero-media">
      <div class="frame">
        <picture>
          <source srcset="hero-doctora.webp" type="image/webp">
          <img src="hero-doctora.jpg" alt="Investigadora en bata blanca revisando gráficos de análisis estadístico en su laptop, con equipo de laboratorio de fondo" width="900" height="741" fetchpriority="high" decoding="async">
        </picture>
        <div class="chip">🩺 <span>Del <b>dato clínico</b> al resultado</span></div>
      </div>
    </div>
```

- [ ] **Step 4: Verificar visualmente**

Recargar en el Browser pane y confirmar:
- La foto de la investigadora con laptop se ve dentro del `.frame` (con el borde/esquinas redondeadas/sombra), llenando el recuadro sin deformarse (gracias a `object-fit:cover`).
- El chip "Del dato clínico al resultado" sigue visible sobre la foto, legible.
- Con `read_network_requests` filtrando `urlPattern: "unsplash"` o `"svg"`, confirmar que ya no hay ningún rastro del SVG anterior ni de peticiones a Unsplash.
- Probar en `resize_window{preset:"mobile"}` que la foto se sigue viendo bien recortada (no distorsionada) en una columna.

- [ ] **Step 5: Commit**

```bash
git add hero-doctora.jpg hero-doctora.webp index.html
git commit -m "feat: reemplaza el SVG del hero por la foto real del Brochure de Canva"
```

---

### Task 4: Verificación final end-to-end (desktop + mobile)

**Files:** ninguno (solo verificación).

**Interfaces:**
- Consumes: el resultado completo de las Tasks 1-3.
- Produces: nada.

- [ ] **Step 1: Verificación en viewport desktop**

Con el sitio servido localmente (`python -m http.server` desde la raíz del repo) y cargado en el Browser pane, tomar una captura y confirmar:
- Todo el nav + hero se ve en tema claro coherente (blanco/navy/azul/coral), sin ningún resto de navy oscuro, aqua, ni el SVG anterior.
- El resto del sitio (todo debajo de `</section>` del hero) sigue en tema oscuro sin cambios — es el estado esperado de este prototipo, no un defecto.
- La tarjeta de invitación al chat (de la ronda anterior) sigue funcionando: esperar ~10s y confirmar que aparece (su estilo propio, oscuro, no se toca en este plan).

- [ ] **Step 2: Verificación en viewport mobile**

Usar `resize_window{preset:"mobile"}`, recargar, y confirmar:
- El hero colapsa a una columna (la media query existente `@media(max-width:768px){.hero{grid-template-columns:1fr...}}` no se tocó en este plan y debe seguir funcionando).
- La foto se sigue viendo proporcionada dentro de `.hero-media{max-width:420px}` en mobile.
- El nav en mobile (con `.nav-links{display:none}`) muestra el logo claro correctamente sobre el fondo blanco del nav.

Volver a `resize_window{preset:"desktop"}` al terminar.

- [ ] **Step 3: Revisar la consola del navegador**

Ejecutar `read_console_messages{onlyErrors:true}` — debe devolver "No console logs" o vacío. En particular, confirmar que no hay errores 404 por `hero-doctora.jpg`/`.webp` (rutas mal escritas) ni por el `logo-dolphin.png`/`.webp` del watermark.

- [ ] **Step 4: Commit final (solo si Steps 1-3 revelaron un ajuste)**

Si algún check anterior llevó a un ajuste puntual de CSS/HTML, commitear:
```bash
git add index.html hero-doctora.jpg hero-doctora.webp
git commit -m "fix: ajustes de verificación visual del hero claro"
```
Si no hubo ajustes, este paso no aplica.
