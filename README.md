# gessi

[![npm](https://img.shields.io/npm/v/@pol-cova/gessi?color=15151f&label=npm)](https://www.npmjs.com/package/@pol-cova/gessi)
[![license](https://img.shields.io/npm/l/@pol-cova/gessi?color=15151f)](LICENSE)
![zero dependencies](https://img.shields.io/badge/dependencies-0-10c7b0)
![static HTML](https://img.shields.io/badge/static_HTML-ready-ffc118)

An expressive HTML style kit with an optional, framework-free OS component
layer.

Gessi works with plain HTML, static-site generators, server-rendered templates,
and JavaScript frameworks. The browser receives normal light-DOM HTML—there is
no virtual DOM, hydration runtime, build plugin, or utility-class vocabulary.

## Choose your path

| Goal | Use |
| --- | --- |
| Style normal HTML | `gessi.css` and the low-level `gs-` classes |
| Build an old-tech or classic monochrome OS | `gessi.js` and custom elements |
| Ship without a build step | CDN script or stylesheet |
| Use Astro, Eleventy, Hugo, Jekyll, or templates | Write the same HTML in your layout |

## Fastest start: one script

The component module automatically loads its sibling stylesheet.

```html
<script
  type="module"
  src="https://cdn.jsdelivr.net/npm/@pol-cova/gessi/dist/gessi.js"
></script>

<gessi-desktop menu="◆ Product OS,File,Edit,View,Help" clock="09:41">
  <gessi-window title="home.mdx" width="42rem" active>
    <h1>Your page content</h1>
    <p>Window chrome is generated automatically.</p>
  </gessi-window>
</gessi-desktop>
```

For the best first paint, load the CSS explicitly before the module:

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@pol-cova/gessi/dist/gessi.css"
  data-gessi-styles
>
<script
  type="module"
  src="https://cdn.jsdelivr.net/npm/@pol-cova/gessi/dist/gessi.js"
></script>
```

## Install from npm

```bash
npm install @pol-cova/gessi
```

In an application entry point or static-site layout:

```js
import "@pol-cova/gessi/css";
import "@pol-cova/gessi/components";
```

Both files are dependency-free. Importing the component module during an SSR
or static build is safe: registration only happens when browser APIs exist.
The npm component entry does not inject CSS, so bundlers can process the
stylesheet normally without guessing asset URLs.

## Build an environment

```html
<gessi-desktop menu="◆ Product OS,File,Edit,View,Window,Help" clock="09:41">
  <gessi-icons desktop side="left">
    <gessi-icon icon="▰" label="Files"></gessi-icon>
    <gessi-icon icon="▤" label="Notes"></gessi-icon>
  </gessi-icons>

  <gessi-window
    title="Projects"
    x="12%"
    y="4rem"
    width="42rem"
    status="6 items"
    active
    draggable
    minimizable
    zoomable
  >
    <nav slot="toolbar">
      <button>Back</button>
      <button>Forward</button>
    </nav>

    <nav slot="sidebar">
      <a href="/">Home</a>
      <a href="/docs/">Docs</a>
    </nav>

    <gessi-icons>
      <gessi-icon icon="A" label="Launch site"></gessi-icon>
      <gessi-icon icon="◆" label="Design"></gessi-icon>
      <gessi-icon icon="▥" label="Metrics"></gessi-icon>
    </gessi-icons>
  </gessi-window>
</gessi-desktop>
```

On narrow screens, positioned windows automatically become a readable document
flow. You do not need separate mobile markup.

## Component catalog

All components use light DOM, accept ordinary HTML children, and work in plain
HTML or any static framework.

| Area | Elements |
| --- | --- |
| Environment | `gessi-desktop`, `gessi-window`, `gessi-dialog` |
| Navigation | `gessi-menu`, `gessi-toolbar`, `gessi-dock`, `gessi-breadcrumb`, `gessi-tabs` |
| Files and structure | `gessi-icons`, `gessi-icon`, `gessi-tree`, `gessi-list` |
| System UI | `gessi-panel`, `gessi-meter`, `gessi-alert`, `gessi-toast`, `gessi-tooltip`, `gessi-separator` |
| Media | `gessi-media`, `gessi-map`, `gessi-marker`, `gessi-carousel` |

This is intentionally a small vocabulary. Components generate repetitive OS
chrome while page content stays semantic HTML instead of becoming a long list
of styling classes.

## Elements

### `<gessi-desktop>`

The environment and window-stacking context.

| Attribute | Purpose | Example |
| --- | --- | --- |
| `menu` | Comma-separated menu labels | `menu="◆ OS,File,Help"` |
| `clock` | Text at the end of the menu bar | `clock="09:41"` |
| `theme` | Style system; defaults to `old-tech` | `theme="old-tech"` |
| `background` | Desktop base color | `background="#aeb4d8"` |
| `pattern` | Pixel pattern | `pattern="noise"` |
| `pattern-color` | Pattern ink color | `pattern-color="#000"` |
| `pattern-size` | Pattern scale | `pattern-size="7px"` |

Available desktop patterns:

```txt
solid checker dots grid stripes noise crosshatch
```

Patterns are declarative and work in generated static HTML:

```html
<gessi-desktop
  theme="classic-os"
  background="#aeb4d8"
  pattern="noise"
  pattern-color="#000"
  pattern-size="7px"
>
  ...
</gessi-desktop>
```

Normal buttons can change them without project-specific scripting:

```html
<button data-gessi-pattern="checker">Checker</button>
<button data-gessi-pattern="dots">Dots</button>
<button data-gessi-background="#98d7c2">Mint</button>
```

For real navigation, provide a semantic menu instead of the shorthand string:

```html
<gessi-desktop theme="classic-os">
  <nav slot="menu">
    <strong>⌘</strong>
    <a href="/">File</a>
    <a href="/docs/">Docs</a>
    <button type="button">Help</button>
    <span class="gs-menubar-end">09:41</span>
  </nav>
</gessi-desktop>
```

The `menu` attribute remains useful for prototypes; slotted HTML is preferred
when menu items navigate or run actions.

### `<gessi-window>`

Generates its title bar, controls, body, and optional status bar.

| Attribute | Purpose |
| --- | --- |
| `title` | Window title |
| `x`, `y` | Desktop position; accepts CSS units or pixel numbers |
| `width`, `height` | Initial dimensions |
| `padding` | Window content padding |
| `layer` | Initial stacking layer |
| `status` | Simple status-bar text |
| `active` | Initial focused window |
| `draggable` | Enables title-bar dragging |
| `minimizable` | Adds a minimize control |
| `zoomable` | Adds a maximize/restore control |
| `resizable` | Enables the browser resize handle |
| `no-close` | Removes the close control |

Meaningful child slots keep markup small:

```html
<gessi-window title="Editor">
  <nav slot="toolbar">...</nav>
  <nav slot="sidebar">...</nav>

  <article>Your normal HTML content</article>

  <span slot="status">Saved</span>
</gessi-window>
```

### `<gessi-dialog>`

Uses the window API and adds dialog semantics.

```html
<button id="publish">Publish</button>

<gessi-dialog id="confirm" title="Confirm launch" hidden>
  <p>Publish this environment?</p>
  <button id="cancel">Cancel</button>
  <button>Publish</button>
</gessi-dialog>

<script>
  const dialog = document.querySelector("#confirm");
  document.querySelector("#publish").onclick = () => dialog.open();
  document.querySelector("#cancel").onclick = () => dialog.close();
</script>
```

`open()` preserves the current focus and `close()` restores it. The generated
close control and Escape key also close the dialog.

### `<gessi-icons>` and `<gessi-icon>`

```html
<gessi-icons>
  <gessi-icon href="/help/" icon="?" label="Help"></gessi-icon>
  <gessi-icon href="/" src="/icons/home.png" label="Home"></gessi-icon>
  <gessi-icon action="open:#trash" icon="⌫" label="Trash"></gessi-icon>
</gessi-icons>
```

Add `desktop side="left"` or `desktop side="right"` to position a shortcut
column on the desktop. `href` renders a native link. `action="open:#id"` and
`action="close:#id"` control windows or dialogs. Other action names emit a
`gs-icon-activate` event for application code. Use `src` for project-provided
pixel art or SVG icons; images use pixelated rendering in OS themes.

### Content recipes

The OS shell should not force every project to reimplement tabs, grouped
panels, and meters:

```html
<gessi-tabs>
  <a href="#apps">Applications</a>
  <a href="#monitor" active>Monitor</a>
</gessi-tabs>

<gessi-panel title="System" columns="2" gap="8">
  <gessi-meter label="CPU" value="38"></gessi-meter>
  <gessi-meter label="Memory" value="72"></gessi-meter>
</gessi-panel>

<gessi-list aria-label="Available disks">
  <button selected>System</button>
  <button>Archive</button>
</gessi-list>

<gessi-alert title="Disk almost full" dismissible>
  Only 192K remains available.
</gessi-alert>
```

These elements provide structure and theme styling while normal HTML remains
available inside them.

### OS navigation and shell components

Menus preserve native links and buttons while adding keyboard-aware popup
behavior:

```html
<gessi-menu label="File">
  <a href="/new/">New</a>
  <a href="/open/">Open…</a>
  <button type="button">Save</button>
</gessi-menu>
```

Build the rest of the shell from the same small set:

```html
<gessi-toolbar label="Editor commands">
  <button>Undo</button>
  <button>Redo</button>
  <gessi-separator orientation="vertical"></gessi-separator>
  <gessi-tooltip text="Publish this page">
    <button>Publish</button>
  </gessi-tooltip>
</gessi-toolbar>

<gessi-breadcrumb>
  <a href="/">Disk</a>
  <a href="/projects/">Projects</a>
  <a href="/projects/site/">Site</a>
</gessi-breadcrumb>

<gessi-tree>
  <ul>
    <li>Documents
      <ul><li>Notes</li><li>Drafts</li></ul>
    </li>
    <li>Pictures</li>
  </ul>
</gessi-tree>

<gessi-dock position="bottom" label="Applications">
  <a href="#files" aria-label="Files">▰</a>
  <a href="#photos" aria-label="Photos">▧</a>
  <button aria-label="Settings">⚙</button>
</gessi-dock>

<gessi-toast title="Saved" dismissible>
  home.html was written successfully.
</gessi-toast>
```

`gessi-dock` supports `top`, `bottom`, `left`, and `right`. On narrow screens it
becomes a horizontally scrollable block in document flow. Toolbars also scroll
instead of squeezing controls into unusable widths. Popup menus retain native
link navigation, close on outside click or Escape, and open from the keyboard.

## Keyboard controls

The desktop provides keyboard window management without another library:

| Shortcut | Action |
| --- | --- |
| `F6` / `Shift+F6` | Cycle forward/backward through windows |
| `Ctrl+Shift+Arrow` | Move the active window by 8px |
| `Ctrl+Shift+Alt+Arrow` | Move the active window by 1px |
| `Ctrl+Shift++` / `Ctrl+Shift+-` | Resize the active window |
| `Escape` | Close the active dialog |

Dialogs trap Tab focus while open and restore focus to the original trigger
when closed.

## Nested windows

Place a window inside another window and it automatically becomes a movable
child constrained to the parent content area:

```html
<gessi-window title="Image Lab" height="30rem">
  <p>Parent content</p>

  <gessi-window
    title="Image Info"
    x="55%"
    y="60%"
    width="12rem"
    draggable
  >
    320 × 200 · SVG
  </gessi-window>
</gessi-window>
```

On mobile, child windows return to normal document flow.

## Images and media effects

`gessi-media` creates a themed image frame with optional caption, effects, and
keyboard-accessible zoom:

```html
<gessi-media
  src="/images/photo.jpg"
  alt="Team in the studio"
  effect="dither"
  caption="Studio, 1991"
  zoomable
></gessi-media>
```

Available effects:

```txt
none pixel mono posterize dither halftone scanlines duotone
sepia invert noir xray chromatic blueprint thermal dream
grain comic crt glitch
```

Effects compose by separating names with spaces:

```html
<gessi-media
  src="/images/photo.jpg"
  alt="Night market"
  effect="chromatic grain scanlines"
  frame="polaroid"
  aspect="4 / 3"
  fit="cover"
  position="center 30%"
></gessi-media>
```

Frames are `window`, `plain`, `polaroid`, `stamp`, and `terminal`. `aspect`
accepts any CSS aspect-ratio value; `fit` and `position` map to
`object-fit`/`object-position`. Effects use CSS, so the original image remains
unchanged and no canvas or image-processing dependency is shipped.

## Maps

Maps accept an image or inline SVG and declarative percentage-positioned
markers:

```html
<gessi-map
  src="/maps/world.png"
  alt="World map"
  caption="Global network"
  effect="pixel mono"
  fit="contain"
>
  <gessi-marker x="28%" y="58%" label="Studio">S</gessi-marker>
  <gessi-marker x="63%" y="31%" label="Office">O</gessi-marker>
</gessi-map>
```

Map effects use the same composable effect names as `gessi-media`. Markers are
real accessible elements positioned with percentages, so the map remains
responsive without coordinates being recalculated.

## Carousel

Every direct child becomes a slide. The component generates themed controls,
supports Left/Right/Home/End keys, emits `gs-slide-change`, and remains readable
before enhancement:

```html
<gessi-carousel aria-label="Featured work">
  <article>First story</article>
  <article>Second story</article>
  <article>Third story</article>
</gessi-carousel>
```

Set `start="1"` for the initial slide or `autoplay="5000"` for an optional
interval in milliseconds. Autoplay pauses after pointer or keyboard
interaction.

## JavaScript API

Windows expose a deliberately small browser API:

```js
const windowElement = document.querySelector("gessi-window");

windowElement.focusWindow();
windowElement.open();
windowElement.close();

windowElement.addEventListener("gs-open", () => {});
windowElement.addEventListener("gs-close", () => {});
```

Most static pages need no custom JavaScript unless they open a hidden dialog or
coordinate application state.

## Responsive behavior

Gessi handles the OS-to-document transition at `719px`:

- desktop shortcuts hide so content remains primary;
- windows and nested child windows return to normal document flow;
- sidebars collapse;
- command bars and docks become horizontally scrollable;
- maps, media, and carousels remain fluid;
- popup menus are constrained to the viewport.

Override the layout with ordinary CSS when a project needs a different
breakpoint. The components do not require a framework-specific responsive API.

## Page-specific layout recipes

Gessi owns the chrome, not the application’s unique content layout. Use a small
amount of normal CSS for page grids:

```css
.media-library {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
}

.map-with-sidebar {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: minmax(0, 1fr) 12rem;
}

@media (max-width: 719px) {
  .map-with-sidebar {
    grid-template-columns: 1fr;
  }
}
```

This boundary keeps the component API compact and avoids replacing readable CSS
with hundreds of one-purpose classes.

## Static framework recipes

### Plain HTML

Use the CDN tags from the fastest-start example. No bundler or package manager
is required.

### Astro

Import the stylesheet in frontmatter and the browser enhancement in a processed
module script:

```astro
---
import "@pol-cova/gessi/css";
---

<script>
  import "@pol-cova/gessi/components";
</script>

<slot />
```

Then use Gessi elements directly in any `.astro` file. No `client:*` directive
is required because these are native custom elements, not Astro framework
components.

### Eleventy, Hugo, Jekyll, and other generators

Either use the CDN tags in the base layout, or copy these published files into
your static assets:

```txt
node_modules/@pol-cova/gessi/dist/gessi.css
node_modules/@pol-cova/gessi/dist/gessi.js
```

Reference them with normal `<link>` and `<script type="module">` tags. Template
loops and includes can generate `gessi-window` and `gessi-icon` elements like
any other HTML.

### Server-rendered applications

Render the custom-element tags on the server. Their content remains visible
before the module loads; the browser progressively adds window chrome and
interaction.

## Progressive enhancement

Gessi custom elements use light DOM:

- Page content exists in the original HTML.
- Search engines and static output can read the content.
- No shadow DOM blocks project CSS.
- No hydration payload is required.
- If JavaScript fails or is disabled, windows remain readable, bordered panels.
- Interactive behavior—dragging, focus stacking, controls—is the enhancement.

For a completely JavaScript-free page, use `gessi.css` alone with semantic HTML
and the lower-level class API.

## CSS-only components

The original class API remains available for article layouts and full manual
control:

```html
<section class="gs-board" data-gs-style="neo">
  <article class="gs-card gs-tomato gs-stack">
    <h2 class="gs-type-title">Romantic dinner night</h2>
    <p>23 March, 2026</p>
    <button class="gs-btn gs-ink">Open</button>
  </article>
</section>
```

Style systems:

```txt
neo minimal retro old-tech classic-os
```

`classic-os` is a strict monochrome bitmap treatment inspired by early desktop
GUIs: one-pixel borders, striped title bars, stipple fills, inset controls, and
compact independent windows. It embeds
[Departure Mono](https://github.com/rektdeckard/departure-mono), an MIT-licensed
open-source typeface, so static deployments do not depend on a font CDN.

The class reference is intentionally secondary; OS-style pages should normally
use the semantic custom elements instead of assembling window internals
manually.

## htmx

Gessi styles htmx request and swap classes without owning the interaction:

```html
<button
  class="gs-btn gs-action"
  hx-post="/save"
  hx-target="#status"
>
  Save
  <span class="gs-spinner" aria-hidden="true"></span>
</button>

<span id="status" class="gs-chip gs-action-target">Ready</span>
```

Supported states:

```txt
.htmx-request .htmx-swapping .htmx-settling .htmx-added
```

Motion respects `prefers-reduced-motion`.

## Development

```bash
npm run build
npm run pack:check
npm run preview
```

Open `http://localhost:4173/examples/index.html`.

Focused examples:

```txt
examples/standalone.html  one-script plain HTML
examples/no-js.html       CSS-only readable fallback
examples/product-os.html  complete static landing-page environment
examples/classic-os.html  monochrome bitmap desktop and control panels
examples/media-os.html    image effects, nested windows, maps, and carousel
```

Source files:

```txt
src/gessi.css
src/components.js
src/gessi.js
```

`components.js` is the bundler/SSR-safe enhancement module. `gessi.js` is the
CDN-friendly entry that also loads the sibling stylesheet.

## Repository safeguards

Pull requests and pushes to `main` run `.github/workflows/verify.yml`, which:

- Builds all published assets.
- Checks that `dist` matches `src`.
- Verifies SSR-safe imports.
- Confirms required examples and font assets exist.
- Runs `npm pack --dry-run`.

CODEOWNERS and Dependabot configuration are included. See
`.github/BRANCH_PROTECTION.md` for the exact GitHub ruleset settings and
required status-check name.

## License

MIT

Departure Mono is distributed under its own MIT license in
`src/fonts/DEPARTURE-MONO-LICENSE.txt`.
