# Journal Match Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone journal-search tool (free-text + filters over the Scimago dataset) as a new static page in `dolphinstats-web`, fed by a JSON dataset generated from the existing `knowledge/scimago.csv` in `endes-generator`.

**Architecture:** A Python build script in `endes-generator` converts the third-party Scimago CSV into a compact columnar `journals.json`. That JSON is committed into `dolphinstats-web/data/`. A new static page (`journal-match.html` + `journal-match.js`, no CDN, no inline script — CSP requires `script-src 'self'`) fetches the JSON client-side and runs a lightweight TF-IDF-style match with hard filters.

**Tech Stack:** Python 3 (stdlib `csv`/`json` only) for the build script; vanilla JS (no framework, no dependencies) for the page, consistent with the rest of `dolphinstats-web`.

## Global Constraints

- `dolphinstats-web/vercel.json` CSP: `script-src 'self'` — no inline `<script>` blocks, no CDN-hosted JS. All JS must live in same-origin `.js` files.
- V1 dataset is Scimago-only: no APC/DOAJ/OpenAPC data, no APC budget filter (per spec decision #2).
- `knowledge/scimago.csv` (third-party, 11MB) never leaves `endes-generator` and is never committed anywhere — only the derived `journals.json` is committed, into `dolphinstats-web/data/`.
- No automated tests for the frontend JS (`dolphinstats-web` is a static site with no test runner today) — verified manually in-browser per spec's Testing section. The Python build script IS tested with pytest, following the existing convention in `endes-generator/tests/`.
- Spec: `dolphinstats-web/docs/superpowers/specs/2026-09-16-journal-match-design.md`

---

## File Structure

```
ENDES Journals/endes-generator/
  scripts/
    build_journals.py         ← new: CSV Scimago → JSON columnar
  tests/
    test_build_journals.py    ← new

dolphinstats-web/
  data/
    journals.json             ← new: generated output, committed
  journal-match.html          ← new: standalone page
  journal-match.js            ← new: data load + matching + UI wiring
  index.html                  ← modified: footer link to journal-match.html
  vercel.json                 ← modified: cache header for /data/journals.json
```

---

### Task 1: `build_journals.py` — CSV → JSON columnar converter

**Files:**
- Create: `ENDES Journals/endes-generator/scripts/build_journals.py`
- Test: `ENDES Journals/endes-generator/tests/test_build_journals.py`

**Interfaces:**
- Produces: `FIELDS: list[str]` (column order — `["title","issn","publisher","country","sjr","quartile","h_index","areas","categories","oa","oa_diamond"]`), `leer_filas(ruta: str | Path) -> list[list]`, `construir_json(filas: list[list]) -> dict` (`{"fields": FIELDS, "journals": filas}`), `main(argv: list[str] | None) -> int`.

- [ ] **Step 1: Write the failing tests**

Create `ENDES Journals/endes-generator/tests/test_build_journals.py`:

```python
from scripts.build_journals import leer_filas, construir_json, FIELDS

_CSV = (
    "Rank;Sourceid;Title;Type;Issn;Publisher;Open Access;Open Access Diamond;SJR;"
    "SJR Best Quartile;H index;Total Docs. (2025);Total Docs. (3years);Total Refs.;"
    "Total Citations (3years);Citable Docs. (3years);Citations / Doc. (2years);"
    "Ref. / Doc.;%Female;Overton;Country;Region;Publisher;Coverage;Categories;Areas\n"
    '1;28773;"Ca-A Cancer Journal for Clinicians";journal;"15424863, 00079235";'
    '"John Wiley and Sons Inc";No;No;104,065;Q1;236;48;127;4331;29333;76;285,55;'
    '90,23;46,34;2;United States;Northern America;"John Wiley and Sons Inc";'
    '"1950-2026";"Hematology (Q1); Oncology (Q1)";"Medicine"\n'
    '2;99999;"Some Book Series";book series;"11112222";"Springer";No;No;1,0;Q2;10;'
    '5;5;5;5;5;1,0;1,0;1,0;0;Germany;Europe;"Springer";"2010-2026";'
    '"Medicine (Q2)";"Medicine"\n'
    '3;33333;"Revista Peruana de Ejemplo";journal;"00000000";"UNMSM";Yes;Yes;;;5;2;'
    '2;2;2;2;1,0;1,0;1,0;0;Peru;Latin America;"UNMSM";"2015-2026";"";"Medicine"\n'
)


def test_leer_filas_descarta_no_journal_y_parsea_decimales(tmp_path):
    ruta = tmp_path / "scimago.csv"
    ruta.write_text(_CSV, encoding="utf-8")
    filas = leer_filas(ruta)
    assert len(filas) == 2  # la fila "book series" se descarta

    idx = {f: i for i, f in enumerate(FIELDS)}
    cancer = filas[0]
    assert cancer[idx["title"]] == "Ca-A Cancer Journal for Clinicians"
    assert cancer[idx["issn"]] == "15424863, 00079235"
    assert cancer[idx["publisher"]] == "John Wiley and Sons Inc"
    assert cancer[idx["sjr"]] == 104.065
    assert cancer[idx["quartile"]] == "Q1"
    assert cancer[idx["h_index"]] == 236
    assert cancer[idx["areas"]] == "Medicine"
    assert cancer[idx["categories"]] == "Hematology (Q1); Oncology (Q1)"
    assert cancer[idx["oa"]] is False
    assert cancer[idx["oa_diamond"]] is False

    peru = filas[1]
    assert peru[idx["title"]] == "Revista Peruana de Ejemplo"
    assert peru[idx["sjr"]] is None
    assert peru[idx["quartile"]] == ""
    assert peru[idx["oa"]] is True
    assert peru[idx["oa_diamond"]] is True


def test_construir_json_esquema():
    filas = [["T", "1234", "Pub", "Peru", 1.2, "Q1", 5, "Medicine",
              "Medicine (Q1)", True, False]]
    doc = construir_json(filas)
    assert doc["fields"] == FIELDS
    assert doc["journals"] == filas


def test_leer_filas_archivo_sin_columnas_esperadas_no_revienta(tmp_path):
    ruta = tmp_path / "vacio.csv"
    ruta.write_text("A;B\n1;2\n", encoding="utf-8")
    assert leer_filas(ruta) == []
```

- [ ] **Step 2: Run tests to verify they fail**

Run (from `ENDES Journals/endes-generator/`): `python -m pytest tests/test_build_journals.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'scripts.build_journals'` (or `scripts` has no `__init__.py` yet — that's fine, pytest resolves via rootdir; the import fails because the file doesn't exist).

- [ ] **Step 3: Write the implementation**

Create `ENDES Journals/endes-generator/scripts/build_journals.py`:

```python
"""build_journals.py — convierte knowledge/scimago.csv (Scimago Journal Rank,
formato de terceros, ver agents/cuartil.py) en un journals.json columnar
compacto para el buscador Journal Match de dolphinstats-web.

Formato de salida: {"fields": [...], "journals": [[...], [...], ...]} — cada
revista es un array posicional (no un objeto), igual truco de compresión que
usa investigaciontau/journals.json para no repetir las claves en cada fila.

Descarta filas sin título o cuyo `Type` no sea 'journal' (el CSV de Scimago
también trae 'book series' y 'conference proceeding', que no aplican a este
buscador). El CSV nunca se commitea (ver knowledge/.gitignore) -- solo el
JSON de salida.
"""

from __future__ import annotations

import csv
import json
import sys
from pathlib import Path

FIELDS = ["title", "issn", "publisher", "country", "sjr", "quartile",
          "h_index", "areas", "categories", "oa", "oa_diamond"]

_COL_TITLE = "Title"
_COL_TYPE = "Type"
_COL_ISSN = "Issn"
_COL_PUBLISHER = "Publisher"
_COL_COUNTRY = "Country"
_COL_SJR = "SJR"
_COL_QUARTIL = "SJR Best Quartile"
_COL_HINDEX = "H index"
_COL_AREAS = "Areas"
_COL_CATEGORIES = "Categories"
_COL_OA = "Open Access"
_COL_OA_DIAMOND = "Open Access Diamond"


def _a_float(txt: str) -> float | None:
    """Scimago exporta decimales con coma ('104,065') -- a float o None."""
    txt = (txt or "").strip()
    if not txt:
        return None
    try:
        return float(txt.replace(",", "."))
    except ValueError:
        return None


def _a_int(txt: str) -> int | None:
    txt = (txt or "").strip()
    if not txt:
        return None
    try:
        return int(txt)
    except ValueError:
        return None


def _si_no_a_bool(txt: str) -> bool:
    return (txt or "").strip().lower() == "yes"


def leer_filas(ruta: str | Path) -> list[list]:
    """Lee el CSV de Scimago (delimitador ';', igual que agents/cuartil.py) y
    devuelve una fila por revista en el orden de FIELDS. Descarta filas sin
    título o con Type distinto de 'journal'. Si el CSV no trae la columna
    Title, devuelve [] en vez de reventar (degrada, no muere)."""
    ruta = Path(ruta)
    filas: list[list] = []
    with ruta.open(encoding="utf-8-sig", newline="") as f:
        lector = csv.DictReader(f, delimiter=";")
        campos = lector.fieldnames or []
        if _COL_TITLE not in campos:
            return []
        for fila in lector:
            titulo = (fila.get(_COL_TITLE) or "").strip()
            tipo = (fila.get(_COL_TYPE) or "").strip().lower()
            if not titulo or tipo != "journal":
                continue
            filas.append([
                titulo,
                (fila.get(_COL_ISSN) or "").strip(),
                (fila.get(_COL_PUBLISHER) or "").strip(),
                (fila.get(_COL_COUNTRY) or "").strip(),
                _a_float(fila.get(_COL_SJR) or ""),
                (fila.get(_COL_QUARTIL) or "").strip(),
                _a_int(fila.get(_COL_HINDEX) or ""),
                (fila.get(_COL_AREAS) or "").strip(),
                (fila.get(_COL_CATEGORIES) or "").strip(),
                _si_no_a_bool(fila.get(_COL_OA) or ""),
                _si_no_a_bool(fila.get(_COL_OA_DIAMOND) or ""),
            ])
    return filas


def construir_json(filas: list[list]) -> dict:
    return {"fields": FIELDS, "journals": filas}


def main(argv: list[str] | None = None) -> int:
    argv = sys.argv[1:] if argv is None else argv
    entrada = Path(argv[0]) if len(argv) > 0 else Path("knowledge/scimago.csv")
    salida = Path(argv[1]) if len(argv) > 1 else Path("journals.json")
    filas = leer_filas(entrada)
    salida.write_text(
        json.dumps(construir_json(filas), ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    print(f"{len(filas)} revistas escritas en {salida}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
```

Create `ENDES Journals/endes-generator/scripts/__init__.py` (empty file) if `scripts/` doesn't already exist as a package — check first with `ls scripts/__init__.py`; if it's missing, create it empty so `from scripts.build_journals import ...` resolves the same way other test modules import from `agents`/`core`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `python -m pytest tests/test_build_journals.py -v`
Expected: 3 passed.

- [ ] **Step 5: Commit**

```bash
cd "ENDES Journals/endes-generator"
git add scripts/build_journals.py scripts/__init__.py tests/test_build_journals.py
git commit -m "Agrega build_journals.py: CSV Scimago -> JSON columnar para Journal Match"
```

---

### Task 2: Generate and commit the real `journals.json`

**Files:**
- Create: `dolphinstats-web/data/journals.json`

**Interfaces:**
- Consumes: `leer_filas`/`construir_json`/`main` from Task 1 (`scripts/build_journals.py`).
- Produces: `dolphinstats-web/data/journals.json` with schema `{"fields": [...], "journals": [[...], ...]}`, consumed by `journal-match.js` in Tasks 4-5.

- [ ] **Step 1: Confirm the source CSV exists**

Run: `ls "ENDES Journals/endes-generator/knowledge/scimago.csv"`
Expected: file listed (already present locally, gitignored, ~11MB per `agents/cuartil.py` docstring).

- [ ] **Step 2: Run the build script against the real CSV**

```bash
cd "ENDES Journals/endes-generator"
mkdir -p ../../dolphinstats-web/data
python scripts/build_journals.py knowledge/scimago.csv ../../dolphinstats-web/data/journals.json
```

Expected output: a line like `NNNNN revistas escritas en ../../dolphinstats-web/data/journals.json` with NNNNN in the tens of thousands (the CSV header sample showed ~32k+ rows of `Type=journal` in the wild).

- [ ] **Step 3: Sanity-check the output**

Run: `python -c "import json; d=json.load(open('../../dolphinstats-web/data/journals.json', encoding='utf-8')); print(d['fields']); print(len(d['journals'])); print(d['journals'][0])"`
Expected: prints the `FIELDS` list, a journal count > 0, and one sample row with a non-empty title.

- [ ] **Step 4: Commit in `dolphinstats-web`**

```bash
cd dolphinstats-web
git add data/journals.json
git commit -m "Agrega journals.json (dataset Scimago para Journal Match)"
```

---

### Task 3: `journal-match.html` page skeleton

**Files:**
- Create: `dolphinstats-web/journal-match.html`

**Interfaces:**
- Produces: DOM elements consumed by `journal-match.js` in Task 4 — `#jm-query` (textarea), `#jm-area`, `#jm-publisher` (selects), `#jm-q1`..`#jm-q4` (checkboxes), `#jm-sjrmin` (number input), `#jm-search` (button), `#jm-export` (button), `#jm-results` (results container), `#jm-status` (loading/error message area).
- Consumes: nothing yet (script tag is added but the file is created empty-bodied in Task 4).

- [ ] **Step 1: Create the page**

Create `dolphinstats-web/journal-match.html`:

```html
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Journal Match — DolphinStats</title>
<meta name="description" content="Busca revistas científicas por título o palabras clave de tu manuscrito, con filtros de área, editorial, cuartil SJR y SJR mínimo. Dataset Scimago Journal Rank.">
<link rel="canonical" href="https://dolphinstats-web.vercel.app/journal-match.html">
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin">
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
<style>
  :root{
    --ocean:#ffffff; --aqua:#0075c6; --white:#003060; --muted:#4a6285;
    --accent:#ff3131; --surface:#f5f7fb; --border:rgba(0,48,96,.10);
  }
  *{box-sizing:border-box}
  html,body{margin:0;padding:0}
  body{font-family:'DM Sans',sans-serif;color:var(--white);background:var(--ocean);line-height:1.5}
  .wrap{max-width:960px;margin:0 auto;padding:2rem 1.25rem 4rem}
  nav{display:flex;align-items:center;justify-content:space-between;padding:1rem 1.25rem;border-bottom:1px solid var(--border)}
  .logo{font-family:Arial,sans-serif;font-weight:800;font-size:1.2rem;color:var(--aqua);text-decoration:none}
  .logo span{color:#0899a8}
  nav a.back{color:var(--muted);text-decoration:none;font-size:.85rem}
  h1{font-family:'Syne',sans-serif;font-size:1.9rem;margin:0 0 .4rem}
  p.lead{color:var(--muted);margin:0 0 1.75rem;max-width:640px}
  .panel{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:1.5rem}
  label{display:block;font-size:.78rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.04em;margin-bottom:.35rem}
  textarea,select,input[type=number],input[type=text]{width:100%;padding:.6rem .7rem;border:1px solid var(--border);border-radius:8px;font-family:inherit;font-size:.9rem;background:#fff;color:var(--white)}
  textarea{min-height:70px;resize:vertical}
  .row{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem;margin-top:1rem}
  .quartiles{display:flex;gap:1rem;align-items:center;flex-wrap:wrap}
  .quartiles label{display:flex;align-items:center;gap:.35rem;font-weight:500;text-transform:none;letter-spacing:0;color:var(--white);margin:0}
  .actions{display:flex;gap:.75rem;margin-top:1.25rem;flex-wrap:wrap}
  button{cursor:pointer;border:none;border-radius:100px;padding:.65rem 1.4rem;font-weight:700;font-size:.9rem;font-family:inherit}
  #jm-search{background:var(--aqua);color:#fff}
  #jm-export{background:#fff;color:var(--aqua);border:1px solid var(--aqua)}
  #jm-status{margin-top:1rem;font-size:.85rem;color:var(--muted)}
  #jm-status.error{color:var(--accent)}
  table{width:100%;border-collapse:collapse;margin-top:1.5rem;font-size:.85rem}
  th,td{text-align:left;padding:.6rem .5rem;border-bottom:1px solid var(--border)}
  th{color:var(--muted);font-size:.72rem;text-transform:uppercase;letter-spacing:.04em}
  td a{color:var(--aqua)}
</style>
</head>
<body>
<nav>
  <a class="logo" href="/">Dolphin<span>Stats</span></a>
  <a class="back" href="/">&larr; Volver al inicio</a>
</nav>
<div class="wrap">
  <h1>Journal Match</h1>
  <p class="lead">Encuentra revistas candidatas para tu manuscrito por título o palabras clave, con filtros de área, editorial, cuartil SJR y SJR mínimo. Dataset: Scimago Journal Rank.</p>

  <div class="panel">
    <label for="jm-query">Título o palabras clave del manuscrito</label>
    <textarea id="jm-query" placeholder="Ej.: Efficacy and safety of gastric electrical stimulation for refractory diabetic gastroparesis"></textarea>

    <div class="row">
      <div>
        <label for="jm-area">Área temática</label>
        <select id="jm-area"><option value="">Todas las áreas</option></select>
      </div>
      <div>
        <label for="jm-publisher">Editorial</label>
        <select id="jm-publisher"><option value="">Todas las editoriales</option></select>
      </div>
      <div>
        <label for="jm-sjrmin">SJR mínimo</label>
        <input type="number" id="jm-sjrmin" step="0.1" min="0" placeholder="Sin mínimo">
      </div>
    </div>

    <div class="row">
      <div>
        <label>Cuartil SJR objetivo</label>
        <div class="quartiles">
          <label><input type="checkbox" id="jm-q1" checked> Q1</label>
          <label><input type="checkbox" id="jm-q2" checked> Q2</label>
          <label><input type="checkbox" id="jm-q3" checked> Q3</label>
          <label><input type="checkbox" id="jm-q4" checked> Q4</label>
        </div>
      </div>
    </div>

    <div class="actions">
      <button id="jm-search" type="button">Buscar</button>
      <button id="jm-export" type="button" disabled>Exportar CSV</button>
    </div>
    <div id="jm-status">Cargando dataset de revistas…</div>
  </div>

  <div id="jm-results"></div>
</div>
<script src="journal-match.js"></script>
</body>
</html>
```

- [ ] **Step 2: Manual check — page loads without a matching JS file yet**

Open `dolphinstats-web/journal-match.html` directly (or via `python3 -m http.server` from `dolphinstats-web/`) in a browser.
Expected: page renders (nav, heading, form, buttons), browser console shows a 404 for `journal-match.js` (expected — created in Task 4) and the status line stays on "Cargando dataset de revistas…".

- [ ] **Step 3: Commit**

```bash
cd dolphinstats-web
git add journal-match.html
git commit -m "Agrega esqueleto de journal-match.html"
```

---

### Task 4: `journal-match.js` — data loading and matching engine

**Files:**
- Create: `dolphinstats-web/journal-match.js`

**Interfaces:**
- Consumes: `dolphinstats-web/data/journals.json` (from Task 2) via `fetch`, with schema `{"fields": string[], "journals": Array<Array>}` where `fields` is `["title","issn","publisher","country","sjr","quartile","h_index","areas","categories","oa","oa_diamond"]` (from Task 1's `FIELDS`). DOM ids from Task 3 (`#jm-query`, `#jm-area`, `#jm-publisher`, `#jm-q1`..`#jm-q4`, `#jm-sjrmin`, `#jm-search`, `#jm-export`, `#jm-results`, `#jm-status`).
- Produces (globals used by Task 5's UI-wiring code, appended to the same file): `IDX` (field name → column index map), `J` (loaded journals array), `AREAS` (sorted unique area list), `PUBLISHERS` (sorted unique publisher list), `buildIndex()` (builds the IDF index after data loads), `search(query, filters) -> Array<{journal, score}>` where `filters = {area, publisher, quartiles: Set<string>, sjrMin: number|null}`.

- [ ] **Step 1: Write the data-loading and matching core**

Create `dolphinstats-web/journal-match.js`:

```js
(function () {
  'use strict';

  var IDX = null;      // field name -> column index, set once journals.json loads
  var J = [];           // loaded journals (array of arrays)
  var AREAS = [];
  var PUBLISHERS = [];
  var JT = [];           // normalized "title categories" text per journal, for scoring
  var IDF = new Map();
  var NDOCS = 0;

  var STOP = new Set((
    'a an and are as at be by for from in into is it of on or that the to with ' +
    'study studies effect effects analysis analyses review reviews systematic ' +
    'meta trial trials randomized randomised controlled clinical efficacy safety ' +
    'effectiveness outcome outcomes patient patients adult adults treatment ' +
    'treatments management el la los las de del y en un una para con sobre ' +
    'entre efecto efectos revision sistematica ensayo estudio pacientes ' +
    'tratamiento'
  ).split(' '));

  function normTxt(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }
  function tokens(s) {
    return normTxt(s).split(/[^a-z0-9]+/).filter(function (w) {
      return w.length > 2 && !STOP.has(w);
    });
  }
  function stem(w) { return w.length > 5 ? w.slice(0, 5) : w; }
  function stoks(s) { return tokens(s).map(stem); }

  function buildIndex() {
    NDOCS = J.length;
    var df = new Map();
    JT = new Array(NDOCS);
    for (var i = 0; i < NDOCS; i++) {
      var j = J[i];
      var text = j[IDX.title] + ' ' + j[IDX.categories];
      var seen = new Set(stoks(text));
      seen.forEach(function (w) { df.set(w, (df.get(w) || 0) + 1); });
      JT[i] = ' ' + normTxt(text) + ' ';
    }
    df.forEach(function (c, w) {
      IDF.set(w, Math.log((NDOCS + 1) / (c + 1)) + 1);
    });
  }

  function score(journalIdx, queryToks) {
    var text = JT[journalIdx];
    var total = 0;
    var seen = new Set();
    for (var i = 0; i < queryToks.length; i++) {
      var w = queryToks[i];
      if (seen.has(w)) continue;
      seen.add(w);
      if (text.indexOf(w) !== -1) total += (IDF.get(w) || 1);
    }
    return total;
  }

  function passesFilters(j, filters) {
    if (filters.area && String(j[IDX.areas]).indexOf(filters.area) === -1) return false;
    if (filters.publisher && j[IDX.publisher] !== filters.publisher) return false;
    var q = j[IDX.quartile];
    if (q && filters.quartiles.size > 0 && !filters.quartiles.has(q)) return false;
    if (filters.sjrMin != null) {
      var sjr = j[IDX.sjr];
      if (sjr == null || sjr < filters.sjrMin) return false;
    }
    return true;
  }

  function search(query, filters, topN) {
    topN = topN || 50;
    var queryToks = stoks(query);
    var out = [];
    for (var i = 0; i < J.length; i++) {
      var j = J[i];
      if (!passesFilters(j, filters)) continue;
      var s = queryToks.length > 0 ? score(i, queryToks) : 0;
      if (queryToks.length > 0 && s === 0) continue;
      out.push({ journal: j, score: s });
    }
    out.sort(function (a, b) { return b.score - a.score; });
    return out.slice(0, topN);
  }

  // Cargado del dataset. Igual patrón que investigaciontau: busca primero en
  // data/journals.json y, si no la encuentra, en journals.json (raíz).
  function loadData() {
    var statusEl = document.getElementById('jm-status');
    fetch('data/journals.json')
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .catch(function () {
        return fetch('journals.json').then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status + ' — falta journals.json');
          return r.json();
        });
      })
      .then(function (d) {
        IDX = {};
        d.fields.forEach(function (f, i) { IDX[f] = i; });
        J = d.journals;

        var areaSet = new Set(), pubSet = new Set();
        J.forEach(function (j) {
          String(j[IDX.areas]).split(';').forEach(function (a) {
            a = a.trim(); if (a) areaSet.add(a);
          });
          var pub = j[IDX.publisher];
          if (pub) pubSet.add(pub);
        });
        AREAS = Array.from(areaSet).sort();
        PUBLISHERS = Array.from(pubSet).sort();

        buildIndex();
        statusEl.textContent = J.length.toLocaleString('es-PE') + ' revistas cargadas.';
        statusEl.classList.remove('error');
        if (typeof window.onJournalMatchDataReady === 'function') {
          window.onJournalMatchDataReady();
        }
      })
      .catch(function (e) {
        statusEl.textContent = 'Error cargando datos: ' + e.message +
          '. Si abriste el archivo localmente, usa un servidor local (ej.: ' +
          'python3 -m http.server) o ábrelo desde el sitio publicado.';
        statusEl.classList.add('error');
      });
  }

  window.JournalMatch = {
    getIDX: function () { return IDX; },
    getJournals: function () { return J; },
    getAreas: function () { return AREAS; },
    getPublishers: function () { return PUBLISHERS; },
    search: search,
  };

  document.addEventListener('DOMContentLoaded', loadData);
})();
```

- [ ] **Step 2: Manual verification — data loads and index builds**

Serve the site locally: `cd dolphinstats-web && python3 -m http.server 8777`, open `http://localhost:8777/journal-match.html`.
Expected: status line updates from "Cargando dataset de revistas…" to "`N` revistas cargadas." (N matching the count printed by Task 2's build step). Open the browser console and run `JournalMatch.search("cancer treatment", {quartiles: new Set(['Q1','Q2','Q3','Q4']), area:'', publisher:'', sjrMin:null})` — expect a non-empty array of `{journal, score}` sorted by descending score.

- [ ] **Step 3: Commit**

```bash
cd dolphinstats-web
git add journal-match.js
git commit -m "Agrega journal-match.js: carga de datos + motor de matching TF-IDF"
```

---

### Task 5: Wire filters, results table, and CSV export

**Files:**
- Modify: `dolphinstats-web/journal-match.js`

**Interfaces:**
- Consumes: `window.JournalMatch` (`getIDX`, `getJournals`, `getAreas`, `getPublishers`, `search`) and `window.onJournalMatchDataReady` hook from Task 4. DOM ids from Task 3.
- Produces: fully working page — this is the last task that touches `journal-match.js`.

- [ ] **Step 1: Append UI wiring to `journal-match.js`**

Add at the end of `dolphinstats-web/journal-match.js`, still inside the closing `document.addEventListener('DOMContentLoaded', loadData);` — insert this block **before** that final line (it defines `window.onJournalMatchDataReady`, which `loadData` calls once the fetch resolves, so it must be assigned before `loadData()` runs; since both are wired via `DOMContentLoaded`, add this block right after the `window.JournalMatch = {...}` assignment and before `document.addEventListener('DOMContentLoaded', loadData);`):

```js
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmtN(n) { return n == null || n === '' ? '—' : Number(n).toLocaleString('en-US'); }
  function scimagoUrl(j, idx) {
    return 'https://www.scimagojr.com/journalsearch.php?q=' + encodeURIComponent(j[idx.title]) + '&tip=jou';
  }

  var lastResults = [];

  function populateSelect(id, values) {
    var el = document.getElementById(id);
    values.forEach(function (v) {
      var o = document.createElement('option');
      o.value = v; o.textContent = v;
      el.appendChild(o);
    });
  }

  function currentFilters() {
    var quartiles = new Set();
    ['jm-q1', 'jm-q2', 'jm-q3', 'jm-q4'].forEach(function (id, i) {
      if (document.getElementById(id).checked) quartiles.add('Q' + (i + 1));
    });
    var sjrRaw = document.getElementById('jm-sjrmin').value;
    return {
      area: document.getElementById('jm-area').value,
      publisher: document.getElementById('jm-publisher').value,
      quartiles: quartiles,
      sjrMin: sjrRaw === '' ? null : Number(sjrRaw),
    };
  }

  function renderResults(results, idx) {
    var container = document.getElementById('jm-results');
    if (results.length === 0) {
      container.innerHTML = '<p style="color:var(--muted);margin-top:1.5rem">Sin resultados para los criterios elegidos.</p>';
      return;
    }
    var rows = results.map(function (r) {
      var j = r.journal;
      return '<tr><td><a href="' + scimagoUrl(j, idx) + '" target="_blank" rel="noopener">' +
        esc(j[idx.title]) + '</a></td><td>' + esc(j[idx.publisher]) + '</td><td>' +
        esc(j[idx.country]) + '</td><td>' + esc(j[idx.quartile] || '—') + '</td><td>' +
        fmtN(j[idx.sjr]) + '</td></tr>';
    }).join('');
    container.innerHTML = '<table><thead><tr><th>Revista</th><th>Editorial</th>' +
      '<th>País</th><th>Cuartil</th><th>SJR</th></tr></thead><tbody>' + rows + '</tbody></table>';
  }

  function dlCsv(rows, filename) {
    var csv = '﻿' + rows.map(function (r) {
      return r.map(function (v) {
        v = v == null ? '' : String(v);
        return /[;"\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
      }).join(';');
    }).join('\n');
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function runSearch() {
    var idx = window.JournalMatch.getIDX();
    var query = document.getElementById('jm-query').value.trim();
    var results = window.JournalMatch.search(query, currentFilters());
    lastResults = results;
    renderResults(results, idx);
    document.getElementById('jm-export').disabled = results.length === 0;
    var statusEl = document.getElementById('jm-status');
    statusEl.textContent = results.length + ' revista(s) encontradas.';
    statusEl.classList.remove('error');
  }

  function exportCsv() {
    var idx = window.JournalMatch.getIDX();
    var rows = [['Score', 'Título', 'ISSN', 'Editorial', 'País', 'Cuartil', 'SJR']];
    lastResults.forEach(function (r) {
      var j = r.journal;
      rows.push([r.score.toFixed(2), j[idx.title], j[idx.issn], j[idx.publisher],
        j[idx.country], j[idx.quartile], j[idx.sjr]]);
    });
    dlCsv(rows, 'journal_match_' + lastResults.length + '_revistas.csv');
  }

  window.onJournalMatchDataReady = function () {
    populateSelect('jm-area', window.JournalMatch.getAreas());
    populateSelect('jm-publisher', window.JournalMatch.getPublishers());
    document.getElementById('jm-search').addEventListener('click', runSearch);
    document.getElementById('jm-export').addEventListener('click', exportCsv);
  };
```

- [ ] **Step 2: Manual end-to-end verification**

With the local server still running (`http://localhost:8777/journal-match.html`):
1. Confirm "Área temática" and "Editorial" selects are populated with options after the status line shows the loaded count.
2. Type a manuscript title (e.g. the gastroparesis example from the placeholder) into the query box and click "Buscar". Expected: a results table appears, "Exportar CSV" becomes enabled, status line shows a result count.
3. Uncheck Q3 and Q4, click "Buscar" again. Expected: no Q3/Q4 journal appears in the results.
4. Set "SJR mínimo" to a high value (e.g. `10`), click "Buscar". Expected: only high-SJR journals appear (or "Sin resultados" if none qualify).
5. Clear the query box entirely, clear all filters, click "Buscar". Expected: no crash — with an empty query, `search()` returns results with score 0 up to `topN`, filtered only by the (now permissive) filters.
6. Click "Exportar CSV" after a non-empty search. Expected: a `.csv` file downloads; open it and confirm it has a header row and one row per displayed result.

- [ ] **Step 3: Commit**

```bash
cd dolphinstats-web
git add journal-match.js
git commit -m "Conecta filtros, tabla de resultados y exportación CSV en Journal Match"
```

---

### Task 6: Link from the main site and cache header

**Files:**
- Modify: `dolphinstats-web/index.html:820-830` (footer "Servicios" column area — add a new "Herramientas" column)
- Modify: `dolphinstats-web/vercel.json`

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing consumed by later tasks — this is the last task in the plan.

- [ ] **Step 1: Add a footer column linking to Journal Match**

In `dolphinstats-web/index.html`, insert a new `.footer-col` between the existing "Servicios" and "Contacto" columns (currently at lines 820-830 and 831-841 respectively — insert right after the closing `</div>` of "Servicios", i.e. after line 830):

```html
    <div class="footer-col">
      <h4>Herramientas</h4>
      <ul>
        <li><a href="/journal-match.html">Journal Match</a></li>
      </ul>
    </div>
```

Also change `.footer-inner`'s grid from 3 to 4 columns so the new column fits without squeezing the others. Find this rule (around line 272):

```css
.footer-inner{display:grid;grid-template-columns:2fr 1fr 1fr;gap:3rem;margin-bottom:3rem}
```

Replace with:

```css
.footer-inner{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:2.5rem;margin-bottom:3rem}
```

And in the mobile breakpoint rule (around line 300, inside the responsive media query):

```css
.footer-inner{grid-template-columns:1fr}
```

This rule already collapses to a single column on mobile — no change needed there.

- [ ] **Step 2: Add a cache header for the dataset**

In `dolphinstats-web/vercel.json`, add a new entry to the `headers` array (following the same pattern as the existing `/app.js` entry), inserted after the `/app.js` block:

```json
    {
      "source": "/data/journals.json",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=3600" }
      ]
    },
```

- [ ] **Step 3: Manual verification**

Reload `http://localhost:8777/index.html` (or the deployed preview once pushed) and confirm:
1. The footer now shows four columns (Brand / Servicios / Herramientas / Contacto) with "Journal Match" linking to `/journal-match.html`.
2. Clicking the link navigates to the working Journal Match page.
Run `python -c "import json; json.load(open('vercel.json'))"` from `dolphinstats-web/` to confirm `vercel.json` is still valid JSON after the edit.

- [ ] **Step 4: Commit**

```bash
cd dolphinstats-web
git add index.html vercel.json
git commit -m "Enlaza Journal Match desde el footer del sitio principal"
```

---

## Post-plan note

`journals.json` will need periodic regeneration whenever `knowledge/scimago.csv` is refreshed in `endes-generator` (manual step, per spec — no CI). Re-run Task 2's Step 2 command and commit the updated file in `dolphinstats-web` when that happens.
