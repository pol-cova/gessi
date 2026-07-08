# Gessi Plain Reference

Gessi is a dependency-free CSS and native Web Component library for expressive HTML, retro interfaces, browser desktops, media effects, and Markdown content.

Use this page when you want the docs without the visual interface. It is also the best source to give an AI coding agent.

## Install

Plain HTML:

```html
<script
  type="module"
  src="https://cdn.jsdelivr.net/npm/@pol-cova/gessi/dist/gessi.js"
></script>
```

Bundlers and SSR:

```js
import "@pol-cova/gessi/css";
import "@pol-cova/gessi/components";
```

## Entry Points

- `@pol-cova/gessi`: package default, component module.
- `@pol-cova/gessi/css`: stylesheet only.
- `@pol-cova/gessi/components`: SSR-safe component registration.
- `@pol-cova/gessi/gessi.js`: CDN entry that loads sibling CSS.

## Design Rules

- Plain HTML is the public API.
- Keep content in light DOM.
- Use semantic elements inside components.
- Do not add React, Vue, or another framework only to use Gessi.
- Use Gessi for reusable chrome, system UI, media effects, and interaction.
- Keep project-specific grids and page layout in your own CSS.
- Make narrow screens readable without duplicate mobile markup.

## Visual Systems

Set `data-gs-style` on any page region:

```html
<main data-gs-style="retro">
  <article class="gs-card">...</article>
</main>
```

Set `theme` on a desktop:

```html
<gessi-desktop theme="classic-os">
  <gessi-window title="hello.html" active>...</gessi-window>
</gessi-desktop>
```

Built-in styles:

- `neo`
- `minimal`
- `retro`
- `old-tech`
- `classic-os`
- `custom`

## Custom Theme Tokens

Use `theme="custom"` or `data-gs-style="custom"`, then set public tokens on the same element.

Common tokens:

- `--gs-ink`: primary text and foreground color.
- `--gs-paper`: base surface color.
- `--gs-line`: border and keyline color.
- `--gs-blue`, `--gs-mint`, `--gs-tomato`, `--gs-sun`: accent palette.
- `--gs-radius`: shared corner radius.
- `--gs-border-width`: shared border thickness.
- `--gs-shadow`, `--gs-shadow-sm`: elevation.
- `--gs-window-bg`, `--gs-window-title-bg`, `--gs-window-body-bg`: window surfaces.
- `--gs-toolbar-bg`, `--gs-control-bg`, `--gs-control-text`: menus, toolbars, and controls.
- `--gs-focus`: focus outline color.

Example:

```html
<gessi-desktop
  theme="custom"
  style="--gs-ink: #1b1026; --gs-paper: #fff7d6; --gs-line: #1b1026;
    --gs-window-title-bg: #ffd447; --gs-control-bg: #2ee6a6;"
>
  <gessi-window title="tokens.html" active>...</gessi-window>
</gessi-desktop>
```

## Desktop Layout Persistence

Add `storage-key` to opt into localStorage-backed layout persistence:

```html
<gessi-desktop theme="classic-os" storage-key="product-desktop-v1">
  <gessi-window title="Projects" active draggable>...</gessi-window>
</gessi-desktop>
```

Public methods:

- `serializeLayout()`: returns JSON-safe state.
- `restoreLayout(layout)`: applies trusted state and returns `true` or `false`.
- `resetLayout()`: clears the stored key.

Restore events:

- `gs-layout-restore-before`: cancelable.
- `gs-layout-restore-after`: fires after restore.

## Markdown Content

Wrap generated Markdown HTML in `gessi-document` or `.gs-prose`.

```html
<gessi-window title="notes.md" active>
  <gessi-document>
    <p class="gs-file-meta">
      <time datetime="2026-07-08">Jul 8, 2026</time>
      <span>6 min read</span>
    </p>
    <h1>Release notes</h1>
    <p>Rendered Markdown stays semantic.</p>
    <div class="gs-callout">
      <strong>Note</strong>
      <p>This is useful for MDX callouts.</p>
    </div>
  </gessi-document>
</gessi-window>
```

Supported Markdown output includes headings, paragraphs, lists, tables, blockquotes, code blocks, footnotes, task lists, images, figures, details, and links.

## Component Families

Environment:

- `gessi-desktop`
- `gessi-window`
- `gessi-dialog`

Navigation:

- `gessi-menu`
- `gessi-toolbar`
- `gessi-dock`
- `gessi-breadcrumb`
- `gessi-tabs`
- `gessi-icons`
- `gessi-icon`
- `gessi-tree`
- `gessi-list`

System UI:

- `gessi-panel`
- `gessi-meter`
- `gessi-alert`
- `gessi-toast`
- `gessi-tooltip`
- `gessi-separator`

Media:

- `gessi-media`
- `gessi-map`
- `gessi-marker`
- `gessi-carousel`

## Image Effects

Use `effect` on `gessi-media` or `gessi-map`.

```html
<gessi-media
  src="/photo.jpg"
  alt="Night market"
  effect="chromatic grain scanlines"
  frame="polaroid"
  zoomable
></gessi-media>
```

Effects compose by space-separated name.

## Static Frameworks

Astro:

```astro
---
import "@pol-cova/gessi/css";
---
<script>
  import "@pol-cova/gessi/components";
</script>
```

Plain static generators can copy:

```txt
node_modules/@pol-cova/gessi/dist/gessi.css
node_modules/@pol-cova/gessi/dist/gessi.js
```

## AI Agent Prompt

Use this prompt as a starting point:

```txt
Build this page with Gessi.

Use @pol-cova/gessi/css and @pol-cova/gessi/components in bundlers, or the CDN gessi.js entry in plain HTML.

Keep content semantic and in light DOM. Use Gessi components for reusable chrome: desktop, windows, dialogs, menus, toolbars, docks, panels, alerts, media, maps, and carousels. Keep project-specific layout in scoped CSS.

Do not add a framework runtime only to use Gessi. Use native links for navigation and native buttons for actions. Preserve keyboard access, focus-visible states, alt text, contrast, long-content handling, and responsive flow below 720px.
```
