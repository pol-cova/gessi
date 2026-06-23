# gessi

A tiny style kit for expressive HTML.

Gessi gives plain HTML a little more rhythm without asking for classes,
components, or build tooling. Drop in the stylesheet and write semantic markup.

## DX

Use `gs-` classes for expressive blocks:

```html
<body class="gs-page">
  <main data-gs-style="minimal">
    <article class="gs-card gs-neo gs-tomato">
      <h2 class="gs-type-title">Romantic dinner night</h2>
      <p>33 March, 2020</p>
      <button class="gs-btn gs-ink gs-action">Love button</button>
    </article>
  </main>
</body>
```

Core pieces:

```txt
gs-card     gs-btn       gs-badge     gs-bubble
gs-grid     gs-board     gs-stack     gs-cluster
gs-action   gs-spinner   gs-action-target
data-gs-style="neo"      data-gs-style="minimal"
gs-tomato   gs-sun       gs-mint      gs-blue      gs-ink
```

Action classes also understand htmx state classes:

```html
<button
  class="gs-btn gs-action"
  hx-post="/save"
  hx-target="#status"
  hx-swap="outerHTML transition:true"
>
  Save
  <span class="gs-spinner" aria-hidden="true"></span>
</button>
```

## Install

```bash
npm install @pol-cova/gessi
```

## CDN

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@pol-cova/gessi/dist/gessi.css">
```

```html
<link rel="stylesheet" href="https://unpkg.com/@pol-cova/gessi/dist/gessi.css">
```

## Local usage

```html
<link rel="stylesheet" href="./dist/gessi.css">
```

## Development

The source file lives at `src/gessi.css`. The published CSS is copied to
`dist/gessi.css`.
