# Contributing to Gessi

Thanks for helping improve Gessi. It is a dependency-free CSS and Web Component
library built around plain HTML and progressive enhancement.

Read [AGENTS.md](AGENTS.md) for the architecture, public API constraints, and
repository map.

## Development

Work from the repository root:

```bash
npm run build
npm run check
npm run docs:build
```

Preview the documentation and examples:

```bash
npm run preview
```

Open `http://localhost:4173/docs/`.

## CSS Guidelines

- Keep public class names under the `gs-` prefix.
- Prefer semantic components and composable primitives over utility-class
  proliferation.
- Keep style systems scoped through `data-gs-style`.
- Keep the package usable from a CDN in plain HTML.
- Preserve light DOM, SSR-safe imports, and no-JavaScript readability.
- Respect `prefers-reduced-motion` for animations.

## Pull Requests

Before opening a pull request:

```bash
npm run build
npm run check
npm run docs:build
npm pack --dry-run
```

Include screenshots or a short screen recording for visual changes.

## Releases

Releases are published manually to npm. Do not publish from a pull request.
