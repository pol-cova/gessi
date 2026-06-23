# Contributing to Gessi

Thanks for helping improve Gessi. This project is intentionally small: a CSS
style kit for expressive HTML with a tiny API and no required build step.

## Development

Install dependencies if needed, then work from the repo root:

```bash
npm run build
```

Preview the example locally:

```bash
python3 -m http.server 4173
```

Open `http://localhost:4173/examples/index.html`.

## CSS Guidelines

- Keep class names under the `gs-` prefix.
- Prefer composable classes over one-off component names.
- Keep style systems scoped through `data-gs-style`.
- Do not make a style system change the entire page unless the user opts into it.
- Keep the package usable as plain CSS from a CDN.
- Respect `prefers-reduced-motion` for animations.

## Pull Requests

Before opening a pull request:

```bash
npm run build
npm pack --dry-run
```

Include screenshots or a short screen recording for visual changes.

## Releases

Releases are published manually to npm. Do not publish from a pull request.

