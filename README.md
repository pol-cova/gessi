# gessi

[![npm](https://img.shields.io/npm/v/@pol-cova/gessi?color=15151f&label=npm)](https://www.npmjs.com/package/@pol-cova/gessi)
[![license](https://img.shields.io/npm/l/@pol-cova/gessi?color=15151f)](LICENSE)
[![package size](https://img.shields.io/npm/unpacked-size/@pol-cova/gessi?color=15151f)](https://www.npmjs.com/package/@pol-cova/gessi)
![css only](https://img.shields.io/badge/css-only-ffc118)
![no build required](https://img.shields.io/badge/build-not_required-10c7b0)

A tiny style kit for expressive HTML.

Gessi is a single CSS file for making plain markup feel intentional. Use a few
`gs-` classes, pick a style system, and ship from npm or a CDN.

## Install

```bash
npm install @pol-cova/gessi
```

```js
import "@pol-cova/gessi";
```

## CDN

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@pol-cova/gessi/dist/gessi.css">
```

```html
<link rel="stylesheet" href="https://unpkg.com/@pol-cova/gessi/dist/gessi.css">
```

## Quick Start

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@pol-cova/gessi/dist/gessi.css">

<body class="gs-page">
  <main class="gs-wrap">
    <section class="gs-board" data-gs-style="neo">
      <article class="gs-card gs-neo gs-tomato gs-stack">
        <h2 class="gs-type-title">Romantic dinner night</h2>
        <p>33 March, 2020</p>
        <button class="gs-btn gs-ink gs-action">Love button</button>
      </article>
    </section>
  </main>
</body>
```

## Style Systems

Style systems are scoped with `data-gs-style`, so the page shell can stay the
same while a component group changes personality.

```html
<div data-gs-style="neo">...</div>
<div data-gs-style="minimal">...</div>
```

`neo` is loud, bordered, colorful, and shadowed. `minimal` keeps the same
components but turns them quieter: hairline borders, calm surfaces, pill
buttons, and Apple-like blue actions.

## Core Classes

```txt
Layout      gs-page gs-wrap gs-grid gs-board gs-stack gs-cluster gs-split
Type        gs-type-display gs-type-title gs-type-subtitle gs-type-kicker
Blocks      gs-card gs-panel gs-bubble gs-media gs-avatar gs-badge gs-chip
Controls    gs-btn gs-field gs-select gs-switch
Actions     gs-action gs-spinner gs-action-target
Colors      gs-paper gs-tomato gs-sun gs-mint gs-blue gs-ink
Styles      data-gs-style="neo" data-gs-style="minimal"
```

## Actions

Gessi includes small interaction states for HTML-first tools like htmx. It
styles the classes htmx already applies during requests and swaps:

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

<span id="status" class="gs-chip gs-action-target">Ready</span>
```

Supported states:

```txt
.htmx-request
.htmx-swapping
.htmx-settling
.htmx-added
```

Motion respects `prefers-reduced-motion`.

## Development

The source file lives at `src/gessi.css`. The published CSS is copied to
`dist/gessi.css`.

```bash
npm run build
npm run pack:check
```

Preview the example:

```bash
npm run preview
```

Open `http://localhost:4173/examples/index.html`.

## Releasing

Prepare a version bump locally:

```bash
npm run release:patch
```

That command updates `package.json`, rebuilds `dist/gessi.css`, and runs
`npm pack --dry-run`. Review the diff, commit it, then publish manually:

```bash
npm publish --access public
```
