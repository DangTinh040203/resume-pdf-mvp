# Resume PDF MVP

An MVP that proves out one specific architecture for the "resume builder
with PDF export" problem: **write exactly one React/Tailwind component**,
and use it both to render a live preview with real page breaks right in the
browser, and to export an actual PDF from the backend — no parallel markup,
no separate renderer for PDF (`@react-pdf/renderer`, `jsPDF`,
`html2canvas`...).

```
On-screen preview:  React + Tailwind  →  Paged.js (polyfill, runs in the browser)
Real PDF export:    same React + Tailwind  →  native Chromium (Puppeteer, runs on the backend)
```

Both paths read from **the exact same component and the exact same CSS
rule** — that's the entire idea behind this project.

---

## Table of contents

- [Why this architecture](#why-this-architecture)
- [Tech stack](#tech-stack)
- [Requirements](#requirements)
- [Getting started](#getting-started)
- [Project structure](#project-structure)
- [FE — detailed walkthrough](#fe-clientsrc)
- [BE — detailed walkthrough](#be-serverindexjs)
- [Full flow, from FE to BE](#full-flow-from-fe-to-be)
- [How to verify the preview and the PDF actually match](#how-to-verify-the-preview-and-the-pdf-actually-match)
- [What this MVP intentionally does not do](#what-this-mvp-intentionally-does-not-do)

---

## Why this architecture

The "traditional" approach (e.g. `@react-pdf/renderer`) makes you write the
template twice: one `<Page>/<View>/<Text>` version for the PDF, one
HTML/CSS version for the web preview. That's two different renderers —
easy to drift apart when one side gets updated and the other is forgotten,
and the preview isn't real DOM, so drag-and-drop or richer CSS later on is
awkward.

The approach here: **write exactly one HTML/Tailwind component**
(`ResumeContent`). It runs in two places, each paginated by a different
"renderer":

| Where it runs | Who paginates? | What it's for |
| --- | --- | --- |
| The user's browser (`/`) | **Paged.js** (JS polyfill) | Live preview, page breaks visible while editing |
| The backend's headless Chromium (`/print`) | **Chromium itself**, natively, via `page.pdf()` | The actual PDF file to download |

A regular browser **does not paginate content on screen** — CSS Paged
Media (`@page`, `break-inside`...) only kicks in when *printing* (Ctrl+P or
`page.pdf()`). Paged.js polyfills that exact mechanism **directly on the
UI**; at real export time Paged.js isn't needed anymore — Chromium already
does the right thing natively, using the same `@page` CSS you wrote, no
polyfill required.

## Tech stack

| | |
| --- | --- |
| FE | React 19, Vite, Tailwind CSS v4, [Paged.js](https://pagedjs.org) |
| BE | Node.js, Express 5, [Puppeteer](https://pptr.dev) (headless Chromium) |
| Package manager | pnpm |

## Requirements

- Node.js ≥ 18
- pnpm ≥ 9

## Getting started

```bash
# Terminal 1 — frontend
cd client
pnpm install
pnpm dev            # http://localhost:5173

# Terminal 2 — backend
cd server
pnpm install        # downloads Chromium for Puppeteer (~200MB, first run is slow)
pnpm start          # http://localhost:4000
```

Open `http://localhost:5173/` → the resume automatically splits into
separate A4 sheets right in the browser, no printing required. Click
**Download PDF** → the downloaded file matches the preview exactly.

> If the backend runs somewhere other than `localhost:4000`, set the
> `VITE_API_URL` env var on the client. If the frontend runs somewhere
> other than `localhost:5173`, set `FRONTEND_URL` on the server (Puppeteer
> needs that URL to open the `/print` route).

## Project structure

```
resume-pdf-mvp/
├── client/                          # FE — Vite + React + Tailwind
│   ├── src/
│   │   ├── main.jsx                 # entry point (no <StrictMode> — see why below)
│   │   ├── App.jsx                  # "/" vs "/print" routing + the Download PDF button
│   │   ├── index.css                # Tailwind + the @page rule (A4 page size)
│   │   ├── data/
│   │   │   └── sampleResume.js      # hardcoded data, long enough to overflow a page
│   │   └── components/
│   │       ├── ResumeContent.jsx    # the template component — THE ONLY place resume markup lives
│   │       └── PagedPreview.jsx     # bridges ResumeContent ↔ Paged.js for route "/"
│   └── vite.config.js
└── server/                          # BE — Express
    └── index.js                     # exactly one route: GET /api/resume.pdf
```

## FE (`client/src/`)

### `data/sampleResume.js`

A plain JS object, hardcoded with enough content (5 jobs, 3 education
entries, 4 projects...) to overflow a single A4 page — the point is to
*see* a page break, not to represent real user data or an API response.

### `components/ResumeContent.jsx`

**The most important file** — the template component. Takes a `resume`
prop, renders in order: Header (name, headline, contact) → Summary →
Skills → Experience → Education → Projects → Certifications/Languages.
Entirely plain `<div>`/Tailwind — **no PDF-renderer primitives at all**.

Two technical details worth remembering:

- Font sizes use **`pt`** throughout (`text-[10.5pt]`, `text-[9pt]`...) —
  the standard print-typography unit, instead of Tailwind's default
  `px`/`rem` scale.
- Every job/education/project block carries a **`break-inside-avoid`**
  class (a built-in Tailwind utility, maps directly to CSS
  `break-inside: avoid`) — it tells the pagination engine (Paged.js and
  Chromium alike) "don't cut a page in the middle of this block." Without
  it, a job with 5 bullet points could get chopped in half right at a page
  boundary.

This component is **reused verbatim** at both `/` (through `PagedPreview`)
and `/print` (used directly in `App.jsx`) — that's the crux of the whole
architecture: change it in one place, both the preview and the PDF update
together.

### `components/PagedPreview.jsx`

The bridge between `ResumeContent` and the **Paged.js** library, used only
on route `/`.

```js
useEffect(() => {
  const { Previewer } = await import('pagedjs');
  const previewer = new Previewer();
  const content = sourceRef.current.innerHTML;   // ResumeContent's rendered HTML
  await previewer.preview(content, undefined, targetRef.current);
}, []);
```

Two `<div>`s, two different jobs:

- **`sourceRef`** — holds `<ResumeContent>` but hidden (`className='hidden'`).
  Never shown; its only purpose is to have real, rendered HTML available so
  `.innerHTML` can be read off it — Paged.js knows nothing about React, it
  only accepts a plain HTML string.
- **`targetRef`** — an empty div at first; once `preview()` resolves,
  Paged.js stuffs the generated `.pagedjs_page` elements (each exactly
  210mm × 297mm, per the `@page` rule in `index.css`) into it — outside of
  React's own management from that point on.

The two pieces of state, `status`/`pageCount`, exist purely to drive the
status line ("Paginating…" → "Rendered as 3 page(s)."). They don't
participate in the pagination logic itself, which runs entirely inside the
effect, independent of state.

**A real bug hit while building this, worth remembering:** React's
`<StrictMode>` double-invokes `useEffect` in dev mode → two `preview()`
calls run concurrently, both manipulating `targetRef`/`sourceRef` → a
`Cannot read properties of null (reading 'getBoundingClientRect')` error,
because one call wipes the DOM while the other is still mid-layout.
Paged.js does imperative DOM surgery — that isn't safe under Strict Mode's
double-invoke behavior. `<StrictMode>` was removed from `main.jsx` to sidestep
the issue entirely, rather than trying to fix it inside the library.

**Gotcha #2:** a bare `import('pagedjs')` (as opposed to
`'pagedjs/dist/...'`) works fine with Vite (its esbuild pre-bundling
handles the library's CJS/ESM interop cleanly). Under Next.js/Turbopack the
same bare import throws `contains.call is not a function` — Turbopack
processes pagedjs's raw ESM source differently; the workaround there is to
copy `node_modules/pagedjs/dist/paged.esm.js` into `public/` and import it
as a static URL, sidestepping the bundler's resolver entirely.

### `App.jsx`

No router — just one condition on `pathname`:

```js
const isPrintRoute = window.location.pathname === '/print';
return isPrintRoute ? <PrintPage /> : <PreviewPage />;
```

- **`/` → `PreviewPage`** — what the user sees when opening the app: the
  *Download PDF* button + `<PagedPreview>`.
- **`/print` → `PrintPage`** — renders bare `<ResumeContent>` only, no
  header, no button, no Paged.js. This route exists purely for the backend
  to open via Puppeteer — Chromium paginates it natively when `page.pdf()`
  is called, no polyfill needed.

The Download button downloads the file with the standard `fetch` → `blob`
→ temporary `<a>` pattern:

```js
const res = await fetch(`${API_URL}/api/resume.pdf`);
const blob = await res.blob();
const url = URL.createObjectURL(blob);
// create a hidden <a download>, click it, revoke the URL
```

### `index.css`

The single most important line in the whole architecture:

```css
@page {
  size: 210mm 297mm;
  margin: 14mm;
}
```

This rule is **never imported or referenced by name anywhere** — it's a
global CSS at-rule, declared once, and **both engines scan the page's
stylesheets to find it on their own**:

- On the FE, `previewer.preview(content, undefined, targetRef.current)` —
  leaving the `stylesheets` argument `undefined` means "go collect every
  CSS currently loaded on the page," which includes this `@page` rule.
- On the BE, `page.pdf({ preferCSSPageSize: true })` — that flag tells
  Chromium "prefer whatever `@page` rule the currently loaded page
  declares, over any default size."

Declared once, used by both "renderers" — page dimensions are never
defined in two separate places that then have to be kept in sync by hand.

The rest of the file is purely cosmetic CSS (`--color-primary`,
`.pagedjs_page { background: white; box-shadow: ... }`) — Paged.js produces
correctly A4-sized `.pagedjs_page` boxes on its own, but doesn't give them
a white background or shadow; that has to be added separately so they
actually *look* like sheets of paper.

## BE (`server/index.js`)

The entire backend is **one route**:

```js
app.get('/api/resume.pdf', async (req, res) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`${FRONTEND_URL}/print`, { waitUntil: 'networkidle0' });

  const pdf = await page.pdf({
    printBackground: true,
    preferCSSPageSize: true,
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="resume.pdf"');
  res.send(pdf);
});
```

The backend **doesn't draw anything itself**. It opens a real browser
(headless), navigates to the FE's `/print` route, and tells Chromium
"print this page to a PDF."

`preferCSSPageSize: true` is an easy detail to miss but a critical one: if
it's not set, Puppeteer falls back to the size/margin passed via the JS
options object in `page.pdf()` (Letter by default, or whatever `format`
you set), which **overrides** the FE's `@page` CSS rule. Setting it to
`true` makes the FE's CSS the single source of truth for page dimensions.

`FRONTEND_URL` (env var, default `http://localhost:5173`) exists because
this is two separate processes on two separate ports (the Vite dev server
and Express) — the backend needs to know where the frontend is running so
Puppeteer can navigate to the right `/print` route.

### API

| Method | Path | Response |
| --- | --- | --- |
| `GET` | `/api/resume.pdf` | `application/pdf` — the PDF file, with a `Content-Disposition: attachment` header |

## Full flow, from FE to BE

1. The user opens `http://localhost:5173/`.
2. `PreviewPage` renders `PagedPreview`, which `import('pagedjs')`s, reads
   the `innerHTML` of the (hidden) `<ResumeContent>`, and passes it to
   `Previewer.preview()`.
3. Paged.js reads the `@page` rule in `index.css` (210mm × 297mm, 14mm
   margin), splits the content into multiple `.pagedjs_page` boxes, and
   honors `break-inside-avoid` on each job/education/project block.
4. The user sees several separate A4 sheets stacked vertically — real page
   breaks, right on the UI, no printing required.
5. The user clicks **Download PDF** → the FE calls
   `GET http://localhost:4000/api/resume.pdf`.
6. Express receives the request → `puppeteer.launch()` opens headless
   Chromium → `page.goto('http://localhost:5173/print')` — the bare route,
   just `<ResumeContent>`, no Paged.js.
7. `page.pdf({ preferCSSPageSize: true })` → Chromium paginates **natively**
   using that same `@page` rule (no JS polyfill needed at export time).
8. The backend returns the PDF buffer (`Content-Type: application/pdf`) →
   the FE receives it as a `blob`, creates a temporary link, and triggers
   the download.

## How to verify the preview and the PDF actually match

```bash
# 1. Download the latest PDF from the backend
curl -s http://localhost:4000/api/resume.pdf -o /tmp/check.pdf

# 2. Compare page count — the fastest way to catch a large discrepancy
pdfinfo /tmp/check.pdf | grep Pages
# → should match the "Rendered as N page(s)." line shown on http://localhost:5173/

# 3. If you suspect dropped/duplicated text, compare total character count (order-independent)
pdftotext -layout /tmp/check.pdf - | tr -d '[:space:]' | wc -c
# compare against: open devtools console at localhost:5173, run:
#   [...document.querySelectorAll('.pagedjs_page')].map(p=>p.textContent).join('').replace(/\s/g,'').length
```

If the two numbers in step 3 match, no characters were lost or duplicated,
regardless of how the underlying data changes later on.

> **Note:** don't use `pdftotext` to compare **reading order** in areas
> with a 2-column layout (Certifications/Languages) or a date aligned to
> the right (Education) — `pdftotext -layout` reconstructs order based on
> X/Y position on the page, so the extracted order can differ from DOM
> order even though the actual rendered PDF is 100% correct. The most
> reliable way to check order/position is still a direct visual comparison
> (screenshot each page and look), not a text diff.

**Why this matches by construction, not by luck:** both sides read from
exactly one source — the same `ResumeContent` component, the same `@page`
rule, the same `break-inside-avoid`. Paged.js and Chromium are two
different engines, but both implement the same standard (CSS Paged Media);
since the input is identical, the only realistic way they'd pick different
break points is a rare sub-pixel layout rounding disagreement right at a
page boundary — and `break-inside-avoid` significantly reduces that risk by
forcing both engines toward the same decision (push the whole block to the
next page) instead of leaving them free to cut anywhere.

## What this MVP intentionally does not do

Deliberately out of scope, to keep this focused on proving one
architectural idea:

- No real editor (data is hardcoded, no CRUD).
- Only one template (`ResumeContent`), no template picker.
- No `Format` object (color/font/spacing controls) like the original
  `resume-builder` project's plan — every style is hardcoded in
  `ResumeContent.jsx`.
- `FRONTEND_URL` is a hardcoded env var; no service discovery or reverse
  proxy for production.
- Puppeteer launches a fresh browser on **every** request — a production
  setup should keep one long-lived browser instance (`puppeteer.launch()`
  once, `newPage()` per request) to avoid a ~1-2s cold start on every
  export.
