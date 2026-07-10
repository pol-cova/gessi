# gessi

[![npm](https://img.shields.io/npm/v/@pol-cova/gessi?color=15151f&label=npm)](https://www.npmjs.com/package/@pol-cova/gessi)
[![license](https://img.shields.io/npm/l/@pol-cova/gessi?color=15151f)](LICENSE)
[![documentation](https://img.shields.io/badge/docs-live-3468e8)](https://gessi.paulcontre.com/)

Gessi is a dependency-free CSS and Web Component library for expressive HTML,
retro interfaces, and browser-based desktop environments.

It works directly in plain HTML from a CDN and also supports npm, static-site
generators, server-rendered templates, and JavaScript frameworks.

[Documentation](https://gessi.paulcontre.com/) ·
[Examples](https://gessi.paulcontre.com/examples/) ·
[npm](https://www.npmjs.com/package/@pol-cova/gessi)

## Quick start

```html
<script
  type="module"
  src="https://cdn.jsdelivr.net/npm/@pol-cova/gessi/dist/gessi.js"
></script>

<gessi-desktop menu="◆ My OS,File,View,Help" clock="09:41">
  <gessi-window title="hello.html" width="38rem" active draggable>
    <h1>One script, plain HTML</h1>
    <p>No package manager, bundler, or framework required.</p>
  </gessi-window>
</gessi-desktop>
```

The script registers the components and loads the stylesheet. For the earliest
styled paint, include the CSS separately:

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@pol-cova/gessi/dist/gessi.css"
  data-gessi-styles
>
```

## Install

```bash
npm install @pol-cova/gessi
```

```js
import "@pol-cova/gessi/css";
import "@pol-cova/gessi/components";
```

## What is included

- Five visual systems: `neo`, `minimal`, `retro`, `old-tech`, and `classic-os`.
- A public `custom` theme token API for project-specific visual systems.
- Desktop environments, draggable windows, nested windows, and dialogs.
- Optional desktop layout persistence with `storage-key`.
- Menus, toolbars, docks, breadcrumbs, tabs, trees, icons, and notifications.
- Timelines, entries, progressively enhanced forms, and load-more controls for server-rendered content.
- Maps, markers, carousels, and composable image effects.
- Markdown and MDX document styling with `gessi-document` and `.gs-prose`.
- Responsive behavior that converts desktop layouts into readable mobile flow.
- Light DOM, progressive enhancement, SSR-safe imports, and zero dependencies.
- CSS primitives for cards, buttons, forms, layouts, badges, and content pages.

The complete component API, attributes, keyboard controls, effects, and
copy-ready recipes are available in the
[interactive documentation](https://gessi.paulcontre.com/).

## Examples

- [Product OS](https://gessi.paulcontre.com/examples/product-os.html)
- [Classic OS](https://gessi.paulcontre.com/examples/classic-os.html)
- [Media OS](https://gessi.paulcontre.com/examples/media-os.html)
- [Custom Theme](https://gessi.paulcontre.com/examples/custom-theme.html)
- [Markdown Post](https://gessi.paulcontre.com/examples/markdown-post.html)
- [Plain HTML](https://gessi.paulcontre.com/examples/standalone.html)
- [CSS-only fallback](https://gessi.paulcontre.com/examples/no-js.html)

## Development

```bash
npm run build
npm run check
npm run docs:build
npm run preview
```

Open `http://localhost:4173/docs/`.

Source:

```txt
src/gessi.css
src/components.js
src/gessi.js
```

`npm run build` copies the public assets into `dist`. Pushes to `main` verify
the package and deploy the documentation site to GitHub Pages.

## Contributing

Issues and pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md)
before proposing public API changes.

## License

MIT. Departure Mono is included under its own MIT license.
