# Gessi repository guide

This file gives coding agents and contributors the context needed to change or
integrate Gessi without first reverse-engineering the repository.

## Product

Gessi is a dependency-free CSS and native Web Component library for expressive
HTML, retro interfaces, and browser-based desktop environments.

The primary usage target is plain HTML:

```html
<script
  type="module"
  src="https://cdn.jsdelivr.net/npm/@pol-cova/gessi/dist/gessi.js"
></script>
```

The same package supports npm, static-site generators, server-rendered
templates, and JavaScript frameworks. Do not make a framework runtime required.

## Design principles

- Plain HTML is the public API.
- Keep the runtime dependency-free.
- Prefer a small semantic component vocabulary over utility-class expansion.
- Preserve light DOM so content is visible to static output, search engines,
  project CSS, and no-JavaScript fallbacks.
- Treat interaction as progressive enhancement.
- Keep imports safe during SSR and static builds.
- Components must remain useful across every visual system.
- Responsive behavior should produce readable document flow without separate
  mobile markup.

## Repository map

```txt
src/gessi.css          source stylesheet and all visual systems
src/components.js      native custom elements and interactions
src/gessi.js           CDN entry; registers components and loads sibling CSS
src/fonts/             bundled font assets and license

dist/                  published package output; generated from src/
docs/                  custom static documentation source
examples/              complete HTML examples and visual fixtures
scripts/               build, verification, preview, and release scripts
.github/workflows/     package verification and GitHub Pages deployment
```

`dist` is committed and must always match `src`.

## Public entry points

The package exports:

```txt
@pol-cova/gessi
@pol-cova/gessi/css
@pol-cova/gessi/components
@pol-cova/gessi/gessi.js
```

- `css` is the stylesheet-only entry.
- `components` is safe for bundlers and SSR. It does not inject CSS.
- `gessi.js` is the one-script CDN entry and automatically loads `gessi.css`.

## Visual systems

All themes are selected with `data-gs-style` or the `theme` attribute on
`gessi-desktop`:

```txt
neo
minimal
retro
old-tech
classic-os
```

Theme CSS must stay scoped. A theme must not alter an unrelated page unless the
page or component explicitly opts into it.

## Component families

Environment:

```txt
gessi-desktop
gessi-window
gessi-dialog
```

Navigation and structure:

```txt
gessi-menu
gessi-toolbar
gessi-dock
gessi-breadcrumb
gessi-tabs
gessi-icons
gessi-icon
gessi-tree
gessi-list
```

System UI:

```txt
gessi-panel
gessi-meter
gessi-alert
gessi-toast
gessi-tooltip
gessi-separator
```

Media:

```txt
gessi-media
gessi-map
gessi-marker
gessi-carousel
```

Use native links, buttons, lists, images, and headings inside components. Do
not replace semantic elements with click handlers on generic containers.

## Component implementation rules

- Extend the SSR-safe `HTMLElementBase`; never access browser-only globals at
  module evaluation time without a guard.
- Enhance once by checking `data-enhanced`.
- Keep content in light DOM; do not introduce Shadow DOM.
- Generated controls need an accessible name and correct native element.
- Public methods and events should be small and documented.
- Clean up global listeners and timers in `disconnectedCallback`.
- Keep attribute APIs declarative and usable in static templates.
- Test keyboard behavior for every interactive component.
- On narrow screens, positioned OS UI must remain readable and reachable.

## CSS rules

- Public class names use the `gs-` prefix.
- Reuse existing layout primitives before adding a new class.
- Scope theme variants beneath `[data-gs-style="…"]`.
- Use custom properties for intentional public configuration.
- Respect `prefers-reduced-motion`.
- Check high contrast, focus-visible states, overflow, and long content.
- Media effects should compose and must not mutate the original file.

## Documentation

The documentation is intentionally custom and dependency-free. It lives in:

```txt
docs/index.html
docs/docs.css
docs/docs.js
```

It provides search, copy-ready snippets, live theme previews, component
reference, media examples, and links to full environments.

When changing public API:

1. Update the relevant docs section.
2. Add or update a copy-ready example.
3. Update an example page when visual interaction is involved.
4. Keep the root README short; detailed reference belongs in `docs/`.

Build the deployable Pages artifact with:

```bash
npm run docs:build
```

The generated `_site/` directory is ignored and must not be committed.

## Development commands

```bash
npm run build        # copy source assets into dist
npm run check        # verify dist parity, imports, docs, and examples
npm run docs:build   # build _site for GitHub Pages
npm run pack:check   # inspect the npm package
npm run preview      # local server on port 4173
```

Before committing a public change, run:

```bash
npm run build
npm run check
npm run docs:build
npm pack --dry-run
git diff --check
```

For visual changes, verify both desktop and mobile in a browser. Check the
custom docs and any affected complete example.

## Integration guidance

When adding Gessi to another repository:

- Use the CDN `gessi.js` entry for plain HTML without a build step.
- In a bundler, import `@pol-cova/gessi/css` and
  `@pol-cova/gessi/components`.
- In Astro, import the CSS in frontmatter and components in a browser module
  script; native custom elements do not require a framework hydration
  directive.
- In SSR code, import `components` normally; registration is browser-guarded.
- Keep project-specific content layout in ordinary CSS. Gessi owns reusable
  chrome and interaction, not every application grid.
- Avoid wrapping custom elements in framework components unless the wrapper
  adds project-specific behavior.

## GitHub automation

- `verify.yml` builds assets, checks source/output parity, builds docs, and
  validates npm package contents.
- `pages.yml` builds `_site` and deploys it to GitHub Pages after pushes to
  `main`.
- Public roadmap work is tracked in GitHub issues instead of repository
  roadmap files.

## Do not

- Add Tailwind-style one-purpose class proliferation.
- Add React, Vue, or another framework as a runtime requirement.
- Add a build requirement for CDN/plain HTML users.
- edit only `dist`; make source changes in `src` and rebuild.
- Commit `_site`, package tarballs, browser QA captures, or temporary files.
- Break semantic links/actions by replacing them with visual-only elements.
