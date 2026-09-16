# Journal Match — diseño

## Contexto

Al revisar los repositorios de GitHub de jbarbozameca (Dr. Joshuan Barboza), el
portal `investigaciontau` (https://jbarbozameca.github.io/investigaciontau/)
incluye una pestaña "Journal Match": buscador de revistas por título/palabras
clave del manuscrito, con filtros (área, editorial, cuartil SJR, presupuesto
APC), sobre un dataset propio de ~32,193 revistas (Scimago + DOAJ + OpenAPC).

DolphinStats ya tiene un selector de revistas (`agents/journal_matcher.py` en
`endes-generator`), pero cubre un caso distinto: rankea revistas para un
estudio ENDES *ya escrito*, cruzando el corpus propio de estudios previos del
eje temático con Scimago (por título, fallback frágil). No sirve para
búsqueda libre de un manuscrito cualquiera.

Este documento diseña una herramienta **nueva e independiente**: un buscador
de revistas de propósito general, sin depender del corpus ENDES ni del flujo
propose→design→analyze→report, para cualquier manuscrito.

## Decisiones (confirmadas en brainstorming)

1. **Alcance**: herramienta nueva independiente, no una ampliación del
   selector actual (A).
2. **Dataset**: solo Scimago en V1 (ya tenemos `knowledge/scimago.csv` en
   `endes-generator`, 11MB, de terceros, gitignored). Sin DOAJ/OpenAPC —
   sin filtro de presupuesto APC. Puede agregarse como V2 si hace falta.
3. **Ubicación**: página estática nueva en `dolphinstats-web`
   (`journal-match.html`), no una pestaña del Streamlit de `endes-generator`.
   Público, no requiere login.
4. **Estructura del sitio**: página propia con ruta separada, enlazada desde
   el menú/footer del `index.html` principal — no una sección ancla dentro
   de la landing existente.
5. **Pipeline de datos**: script de build convierte `scimago.csv` →
   `journals.json` (formato columnar compacto). Se commitea solo el JSON
   resultante; el CSV crudo nunca sale de `endes-generator` (mismo patrón
   que ya usamos para datos de terceros en el resto del ecosistema).

## Restricción técnica clave

`dolphinstats-web/vercel.json` define un CSP estricto:
`script-src 'self'` — **sin `<script>` inline y sin CDNs externos**. El
patrón de jbarbozameca (todo el JS inline en `index.html`, Chart.js desde
jsdelivr) no es viable tal cual. Todo el JS de Journal Match debe vivir en un
archivo `.js` propio servido desde el mismo dominio, sin dependencias de CDN.
Journal Match no necesita gráficos (Chart.js), así que esto no es un
problema para esta herramienta puntual.

## Arquitectura

```
endes-generator/
  scripts/
    build_journals.py       ← nuevo: CSV Scimago → JSON columnar
  knowledge/
    scimago.csv              ← ya existe (gitignored, fuente)

dolphinstats-web/
  journal-match.html         ← nuevo: página standalone
  journal-match.js           ← nuevo: fetch + matching + filtros + render
  data/
    journals.json             ← nuevo: generado por build_journals.py, commiteado
```

Sin backend. `journal-match.html` hace `fetch('data/journals.json')` al
cargar y todo el matching corre client-side.

## Pipeline de datos: `build_journals.py`

Vive en `endes-generator/scripts/` porque ahí ya está `knowledge/scimago.csv`
y la lógica de parseo de columnas existente (`agents/cuartil.py`).

**Entrada**: `knowledge/scimago.csv` (columnas confirmadas: `Rank, Sourceid,
Title, Type, Issn, Publisher, Open Access, Open Access Diamond, SJR, SJR Best
Quartile, H index, Total Docs..., Country, Region, Categories, Areas`;
separador `;`, decimales con coma).

**Salida**: `journals.json` con esquema columnar (array posicional por
revista, no objeto — igual truco que `investigaciontau/journals.json` para
reducir tamaño):

```js
{
  "fields": ["title","issn","publisher","country","sjr","quartile",
             "h_index","areas","categories","oa","oa_diamond"],
  "journals": [
    ["Ca-A Cancer Journal for Clinicians", "15424863,00079235",
     "John Wiley and Sons Inc", "United States", 104.065, "Q1",
     236, "Medicine", "Hematology (Q1); Oncology (Q1)", false, false],
    ...
  ]
}
```

- `sjr` y demás decimales: convertir coma → punto, parsear a número.
- `quartile`: tomar `SJR Best Quartile` tal cual (Q1–Q4 o vacío).
- Filas sin `Title` o con `Type` distinto de `journal` (ej. `conference
  proceedings`, `book series`, si el CSV los trae) se descartan.
- Regeneración manual, invocada cuando se actualiza el Scimago CSV (no
  automática, no hay CI para esto).

**Test**: `tests/test_build_journals.py` con un CSV fixture de 2-3 filas
(incluyendo un caso con decimal-coma, un `Type` no-`journal` a filtrar, y una
fila con ISSN múltiple) — verifica el esquema de salida (`fields` + filas en
el orden correcto, tipos correctos, filtrado aplicado).

## `journal-match.html` + `journal-match.js`

**UI** (adaptada de investigaciontau, sin la sección de APC):
- Campo de texto: título/palabras clave del manuscrito.
- Filtros: área temática (select, poblado desde `areas` del dataset),
  editorial (select, poblado desde `publisher`), cuartil SJR objetivo
  (checkboxes Q1–Q4), SJR mínimo (input numérico).
- Botón "Buscar" → tabla de resultados ordenada por score de pertinencia,
  con título, editorial, país, cuartil, SJR, link a Scimago.
- Botón de exportar resultados a CSV (generado client-side, sin red).

**Algoritmo de matching** (puerto directo del patrón visto en
`investigaciontau/index.html`, sin dependencias):
1. Tokenizar el texto de búsqueda: minúsculas, sin acentos, quitar
   stopwords (lista mixta ES/EN ya vista en el original), stemming ligero
   (truncar a 5 caracteres).
2. Índice IDF sobre `title + categories` de todas las revistas, construido
   una vez al cargar `journals.json`.
3. Score de cada revista = suma de pesos IDF de los tokens del query que
   aparecen en su título/categorías.
4. Aplicar filtros (área, editorial, cuartil, SJR mínimo) como filtro duro
   antes de rankear.
5. Mostrar top-N (ej. 50) ordenado por score descendente.

**Manejo de errores**: si `fetch('data/journals.json')` falla, mostrar
mensaje de error con sugerencia de servidor local (mismo patrón que el
original: "usa `python3 -m http.server`, o publícalo en GitHub Pages/Vercel").

**Testing**: sin suite automatizada (`dolphinstats-web` es un sitio estático
sin tests hoy). Verificación manual en navegador antes de cada deploy:
carga de datos, búsqueda con y sin resultados, cada filtro por separado,
exportar CSV.

## Fuera de alcance (V1)

- Filtro de presupuesto APC / datos DOAJ-OpenAPC (requiere nuevas fuentes,
  ver decisión #2).
- Integración con el corpus ENDES o el flujo propose→design→analyze→report.
- Gráficos (Chart.js) — no aplica a esta herramienta.
- CI/regeneración automática de `journals.json`.
