const HTMLElementBase = globalThis.HTMLElement ?? class {};
const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

const cssLength = (value, fallback) => {
  if (!value) return fallback;
  return /^-?\d+(\.\d+)?$/.test(value) ? `${value}px` : value;
};

const safeStorage = () => {
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
};

const mediaFilters = {
  mono: "grayscale(1) contrast(1.25)",
  posterize: "contrast(1.8) saturate(.75) brightness(1.08)",
  dither: "grayscale(1) contrast(2.25)",
  halftone: "grayscale(1) contrast(1.35) brightness(1.2)",
  duotone: "grayscale(1) contrast(1.35)",
  sepia: "sepia(.92) saturate(.85) contrast(1.12)",
  invert: "invert(1)",
  noir: "grayscale(1) contrast(1.65) brightness(.86)",
  xray: "grayscale(1) invert(1) contrast(1.5)",
  chromatic: "saturate(1.45) contrast(1.1) drop-shadow(-3px 0 0 rgb(255 0 72 / 65%)) drop-shadow(3px 0 0 rgb(0 218 255 / 65%))",
  blueprint: "grayscale(1) contrast(2.2) invert(1)",
  thermal: "saturate(4) contrast(1.5) hue-rotate(155deg)",
  dream: "saturate(1.35) contrast(.9) brightness(1.12)",
  comic: "saturate(1.8) contrast(1.45)",
  glitch: "contrast(1.35) saturate(1.4) drop-shadow(4px 0 0 rgb(255 0 72 / 55%)) drop-shadow(-4px 0 0 rgb(0 226 255 / 55%))",
};

const applyMediaEffects = (image, effects) => {
  const filter = effects
    .split(/\s+/)
    .map((effect) => mediaFilters[effect])
    .filter(Boolean)
    .join(" ");
  if (filter) image.style.filter = filter;
};

const makeButton = (label, symbol, action) => {
  const button = document.createElement("button");
  button.className = "gs-window-control";
  button.type = "button";
  button.ariaLabel = label;
  button.dataset.action = action;
  button.textContent = symbol;
  return button;
};

class GessiDesktop extends HTMLElementBase {
  static layoutVersion = 1;
  #topLayer = 10;
  #saveFrame = 0;

  connectedCallback() {
    if (this.dataset.enhanced) return;
    this.dataset.enhanced = "true";
    const theme = this.getAttribute("theme") || "old-tech";
    this.dataset.gsStyle ||= theme;
    this.classList.add("gs-desktop");
    this.tabIndex ||= -1;

    for (const [attribute, property] of [
      ["background", "--gs-desktop-color"],
      ["pattern-color", "--gs-pattern-color"],
      ["pattern-size", "--gs-pattern-size"],
    ]) {
      if (this.hasAttribute(attribute)) {
        this.style.setProperty(property, this.getAttribute(attribute));
      }
    }
    if (!this.hasAttribute("background")) {
      this.style.setProperty(
        "--gs-desktop-color",
        theme === "classic-os" ? "#fff" : "#9edbd2",
      );
    }
    this.dataset.pattern = this.getAttribute("pattern")
      || (theme === "classic-os" ? "checker" : "dots");

    const customMenu = this.querySelector(':scope > [slot="menu"]');
    const menu = this.getAttribute("menu");
    if (customMenu) {
      customMenu.removeAttribute("slot");
      customMenu.classList.add("gs-menubar");
      customMenu.ariaLabel ||= "Desktop menu";
      this.prepend(customMenu);
    } else if (menu && !this.querySelector(":scope > .gs-menubar")) {
      const bar = document.createElement("nav");
      bar.className = "gs-menubar";
      bar.ariaLabel = "Desktop menu";

      menu.split(",").map((item) => item.trim()).filter(Boolean).forEach((item, index) => {
        const entry = document.createElement(index === 0 ? "strong" : "span");
        entry.textContent = item;
        bar.append(entry);
      });

      const clock = document.createElement("span");
      clock.className = "gs-menubar-end";
      clock.textContent = this.getAttribute("clock") || "";
      bar.append(clock);
      this.prepend(bar);
    }

    this.addEventListener("gs-window-focus", (event) => {
      this.querySelectorAll("gessi-window, gessi-dialog").forEach((window) => {
        window.toggleAttribute("active", window === event.target);
      });
      event.target.style.setProperty("--gs-window-layer", String(++this.#topLayer));
      this.#queueLayoutSave();
    });
    this.addEventListener("gs-layout-change", () => {
      this.#queueLayoutSave();
    });
    this.addEventListener("keydown", (event) => this.#handleKeyboard(event));
    this.addEventListener("click", (event) => {
      const patternControl = event.target.closest("[data-gessi-pattern]");
      const backgroundControl = event.target.closest("[data-gessi-background]");
      if (patternControl) this.dataset.pattern = patternControl.dataset.gessiPattern;
      if (backgroundControl) {
        this.style.setProperty("--gs-desktop-color", backgroundControl.dataset.gessiBackground);
      }
    });

    queueMicrotask(() => {
      this.#restoreStoredLayout();
      const activeWindow = this.querySelector("gessi-window[active], gessi-dialog[active]");
      if (activeWindow) activeWindow.focusWindow();
    });
  }

  disconnectedCallback() {
    if (this.#saveFrame) cancelAnimationFrame(this.#saveFrame);
  }

  serializeLayout() {
    const windows = this.#windows();
    return {
      version: GessiDesktop.layoutVersion,
      windows: windows.map((window, index) => ({
        key: this.#windowKey(window, index),
        id: window.id || "",
        title: window.getAttribute("title") || "",
        index,
        active: window.hasAttribute("active"),
        hidden: window.hidden,
        maximized: window.hasAttribute("maximized"),
        minimized: window.hasAttribute("minimized"),
        x: window.style.getPropertyValue("--gs-window-x") || "",
        y: window.style.getPropertyValue("--gs-window-y") || "",
        width: window.style.getPropertyValue("--gs-window-width") || "",
        height: window.style.getPropertyValue("--gs-window-min-height") || "",
        layer: window.style.getPropertyValue("--gs-window-layer") || "",
      })),
    };
  }

  restoreLayout(layout) {
    let state = layout;
    if (typeof layout === "string") {
      try {
        state = JSON.parse(layout);
      } catch {
        return false;
      }
    }
    if (!state || state.version !== GessiDesktop.layoutVersion || !Array.isArray(state.windows)) {
      return false;
    }

    const before = new CustomEvent("gs-layout-restore-before", {
      cancelable: true,
      detail: { layout: state },
    });
    if (!this.dispatchEvent(before)) return false;

    const windows = this.#windows();
    let topLayer = this.#topLayer;
    for (const item of state.windows) {
      const window = this.#findWindow(item, windows);
      if (!window) continue;
      for (const [property, value] of [
        ["--gs-window-x", item.x],
        ["--gs-window-y", item.y],
        ["--gs-window-width", item.width],
        ["--gs-window-min-height", item.height],
        ["--gs-window-layer", item.layer],
      ]) {
        if (typeof value === "string" && value) window.style.setProperty(property, value);
      }
      window.toggleAttribute("maximized", Boolean(item.maximized));
      window.toggleAttribute("minimized", Boolean(item.minimized));
      window.hidden = Boolean(item.hidden);
      window.toggleAttribute("active", Boolean(item.active));
      topLayer = Math.max(topLayer, Number(item.layer) || topLayer);
      queueMicrotask(() => window.containWithinBounds?.());
    }
    this.#topLayer = topLayer;
    this.dispatchEvent(new CustomEvent("gs-layout-restore-after", {
      detail: { layout: this.serializeLayout() },
    }));
    return true;
  }

  resetLayout() {
    const storage = safeStorage();
    const key = this.getAttribute("storage-key");
    if (storage && key) storage.removeItem(key);
    this.dispatchEvent(new CustomEvent("gs-layout-reset"));
  }

  #handleKeyboard(event) {
    const windows = [...this.querySelectorAll("gessi-window:not([hidden]), gessi-dialog:not([hidden])")];
    if (!windows.length) return;

    if (event.key === "F6") {
      event.preventDefault();
      const activeIndex = windows.findIndex((window) => window.hasAttribute("active"));
      const direction = event.shiftKey ? -1 : 1;
      const nextIndex = (activeIndex + direction + windows.length) % windows.length;
      windows[nextIndex].focusWindow();
      return;
    }

    if (!event.ctrlKey || !event.shiftKey) return;
    const activeWindow = windows.find((window) => window.hasAttribute("active"));
    if (!activeWindow) return;

    const step = event.altKey ? 1 : 8;
    const keyMoves = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    if (keyMoves[event.key]) {
      event.preventDefault();
      activeWindow.moveBy(...keyMoves[event.key]);
    }
    if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      activeWindow.resizeBy(step, step);
    }
    if (event.key === "-") {
      event.preventDefault();
      activeWindow.resizeBy(-step, -step);
    }
  }

  #restoreStoredLayout() {
    const storage = safeStorage();
    const key = this.getAttribute("storage-key");
    if (!storage || !key) return;
    const value = storage.getItem(key);
    if (!value) return;
    try {
      this.restoreLayout(value);
    } catch {
      storage.removeItem(key);
    }
  }

  #queueLayoutSave() {
    const storage = safeStorage();
    const key = this.getAttribute("storage-key");
    if (!storage || !key || this.#saveFrame) return;
    this.#saveFrame = requestAnimationFrame(() => {
      this.#saveFrame = 0;
      storage.setItem(key, JSON.stringify(this.serializeLayout()));
    });
  }

  #windows() {
    return [...this.querySelectorAll("gessi-window, gessi-dialog")];
  }

  #findWindow(item, windows) {
    if (item.id) {
      const found = windows.find((window) => window.id === item.id);
      if (found) return found;
    }
    return windows.find((window, index) => this.#windowKey(window, index) === item.key)
      || windows[item.index];
  }

  #windowKey(window, index) {
    return window.id
      ? `id:${window.id}`
      : `index:${index}:${window.getAttribute("title") || ""}`;
  }
}

class GessiWindow extends HTMLElementBase {
  #dragCleanup;
  #returnFocus;

  connectedCallback() {
    if (this.dataset.enhanced) return;
    this.dataset.enhanced = "true";
    this.classList.add("gs-window");
    this.tabIndex ||= -1;
    if (this.parentElement?.closest("gessi-window")) {
      this.setAttribute("contained", "");
    }

    for (const [attribute, property, fallback, transform = cssLength] of [
      ["x", "--gs-window-x", "auto"],
      ["y", "--gs-window-y", "auto"],
      ["width", "--gs-window-width", "34rem"],
      ["height", "--gs-window-min-height", "12rem"],
      ["padding", "--gs-window-pad", "1rem"],
      ["layer", "--gs-window-layer", "1", (value, defaultValue) => value || defaultValue],
    ]) {
      this.style.setProperty(
        property,
        transform(this.getAttribute(attribute), fallback),
      );
    }

    const nodes = [...this.childNodes];
    const toolbarNodes = nodes.filter((node) => node.nodeType === 1 && node.getAttribute("slot") === "toolbar");
    const sidebarNodes = nodes.filter((node) => node.nodeType === 1 && node.getAttribute("slot") === "sidebar");
    const statusNodes = nodes.filter((node) => node.nodeType === 1 && node.getAttribute("slot") === "status");
    const contentNodes = nodes.filter((node) => !toolbarNodes.includes(node) && !sidebarNodes.includes(node) && !statusNodes.includes(node));

    this.replaceChildren();
    this.append(this.#makeTitlebar());

    if (toolbarNodes.length) {
      const toolbar = document.createElement("div");
      toolbar.className = "gs-window-toolbar";
      toolbar.append(...toolbarNodes);
      this.append(toolbar);
    }

    const body = document.createElement("div");
    body.className = "gs-window-body";

    if (sidebarNodes.length) {
      const sidebar = document.createElement("aside");
      sidebar.className = "gs-window-sidebar";
      sidebar.append(...sidebarNodes);
      body.append(sidebar);
    }

    const content = document.createElement("div");
    content.className = "gs-window-content";
    content.append(...contentNodes);
    body.append(content);
    this.append(body);

    if (statusNodes.length || this.hasAttribute("status")) {
      const status = document.createElement("footer");
      status.className = "gs-statusbar";
      status.append(...statusNodes);
      if (!statusNodes.length) status.textContent = this.getAttribute("status");
      this.append(status);
    }

    if (this.hasAttribute("dialog")) {
      this.classList.add("gs-dialog");
      this.role = "dialog";
      this.ariaModal = "true";
    }

    this.toggleAttribute("active", this.hasAttribute("active"));
    this.addEventListener("pointerdown", (event) => {
      if (event.target.closest(".gs-window") === this) this.focusWindow();
    });
    this.addEventListener("click", (event) => this.#handleControl(event));
    this.addEventListener("keydown", (event) => {
      if (!this.hasAttribute("dialog")) return;
      if (event.key === "Escape") this.close();
      if (event.key === "Tab") this.#trapFocus(event);
    });
    this.#enableDragging();
  }

  disconnectedCallback() {
    this.#dragCleanup?.();
  }

  focusWindow() {
    this.dispatchEvent(new CustomEvent("gs-window-focus", { bubbles: true }));
    this.focus({ preventScroll: true });
  }

  open() {
    this.#returnFocus = document.activeElement;
    this.hidden = false;
    this.focusWindow();
    this.dispatchEvent(new CustomEvent("gs-open"));
    this.#emitLayoutChange();
  }

  close() {
    this.hidden = true;
    this.#returnFocus?.focus?.();
    this.dispatchEvent(new CustomEvent("gs-close"));
    this.#emitLayoutChange();
  }

  moveBy(x, y) {
    const rect = this.getBoundingClientRect();
    const boundary = this.#dragBoundary();
    const boundaryRect = boundary?.getBoundingClientRect();
    const nextX = Math.max(
      0,
      Math.min(
        rect.left - (boundaryRect?.left || 0) + x,
        Math.max(0, (boundaryRect?.width || rect.width) - rect.width),
      ),
    );
    const nextY = Math.max(
      0,
      Math.min(
        rect.top - (boundaryRect?.top || 0) + y,
        Math.max(0, (boundaryRect?.height || rect.height) - rect.height),
      ),
    );
    this.style.setProperty("--gs-window-x", `${nextX}px`);
    this.style.setProperty("--gs-window-y", `${nextY}px`);
    this.#emitLayoutChange();
  }

  resizeBy(width, height) {
    const rect = this.getBoundingClientRect();
    this.style.setProperty("--gs-window-width", `${Math.max(160, rect.width + width)}px`);
    this.style.setProperty("--gs-window-min-height", `${Math.max(80, rect.height + height)}px`);
    this.#emitLayoutChange();
  }

  containWithinBounds() {
    this.moveBy(0, 0);
  }

  #makeTitlebar() {
    const bar = document.createElement("header");
    bar.className = "gs-window-titlebar";

    const start = document.createElement("div");
    start.className = "gs-window-controls";
    if (!this.hasAttribute("no-close")) start.append(makeButton("Close", "×", "close"));

    const title = document.createElement("strong");
    title.className = "gs-window-title";
    title.textContent = this.getAttribute("title") || "Untitled";

    const end = document.createElement("div");
    end.className = "gs-window-controls";
    if (this.hasAttribute("minimizable")) end.append(makeButton("Minimize", "–", "minimize"));
    if (this.hasAttribute("zoomable")) end.append(makeButton("Zoom", "□", "zoom"));

    bar.append(start, title, end);
    return bar;
  }

  #handleControl(event) {
    const control = event.target.closest("[data-action]");
    if (!control) return;

    const action = control.dataset.action;
    if (action === "close") this.close();
    if (action === "minimize") this.toggleAttribute("minimized");
    if (action === "zoom") this.toggleAttribute("maximized");
    if (action !== "close") this.#emitLayoutChange();
  }

  #trapFocus(event) {
    const focusable = [...this.querySelectorAll(focusableSelector)]
      .filter((element) => !element.hidden && element.offsetParent !== null);
    if (!focusable.length) {
      event.preventDefault();
      this.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  #enableDragging() {
    if (
      !this.hasAttribute("draggable")
      || globalThis.matchMedia?.("(max-width: 719px)").matches
    ) return;
    const handle = this.querySelector(".gs-window-titlebar");

    const onPointerDown = (event) => {
      if (event.target.closest("button")) return;
      event.preventDefault();
      this.focusWindow();

      const boundary = this.#dragBoundary();
      const desktopRect = boundary.getBoundingClientRect();
      const windowRect = this.getBoundingClientRect();
      const offsetX = event.clientX - windowRect.left;
      const offsetY = event.clientY - windowRect.top;
      const onPointerMove = (moveEvent) => {
        const x = Math.max(0, Math.min(moveEvent.clientX - desktopRect.left - offsetX, desktopRect.width - windowRect.width));
        const y = Math.max(
          0,
          Math.min(
            moveEvent.clientY - desktopRect.top - offsetY,
            desktopRect.height - windowRect.height,
          ),
        );
        this.style.setProperty("--gs-window-x", `${x}px`);
        this.style.setProperty("--gs-window-y", `${y}px`);
      };

      const onPointerUp = () => {
        document.removeEventListener("pointermove", onPointerMove);
        document.removeEventListener("pointerup", onPointerUp);
        document.removeEventListener("pointercancel", onPointerUp);
        this.#emitLayoutChange();
      };

      document.addEventListener("pointermove", onPointerMove);
      document.addEventListener("pointerup", onPointerUp);
      document.addEventListener("pointercancel", onPointerUp);
    };

    handle.addEventListener("pointerdown", onPointerDown);
    this.#dragCleanup = () => handle.removeEventListener("pointerdown", onPointerDown);
  }

  #dragBoundary() {
    if (this.hasAttribute("contained")) {
      return this.parentElement?.closest(".gs-window-content")
        || this.parentElement;
    }
    return this.closest("gessi-desktop, .gs-desktop");
  }

  #emitLayoutChange() {
    this.dispatchEvent(new CustomEvent("gs-layout-change", { bubbles: true }));
  }
}

class GessiIcon extends HTMLElementBase {
  connectedCallback() {
    if (this.dataset.enhanced) return;
    this.dataset.enhanced = "true";
    this.classList.add("gs-desktop-icon");
    if (this.hasAttribute("x") || this.hasAttribute("y")) {
      this.style.position = "absolute";
      this.style.left = cssLength(this.getAttribute("x"), "auto");
      this.style.top = cssLength(this.getAttribute("y"), "auto");
    }

    const href = this.getAttribute("href");
    const action = this.getAttribute("action");
    const interactive = href || action;
    const surface = document.createElement(href ? "a" : action ? "button" : "span");
    surface.className = "gs-icon-action";
    if (href) {
      surface.href = href;
      for (const attribute of ["target", "rel", "download"]) {
        if (this.hasAttribute(attribute)) {
          surface.setAttribute(attribute, this.getAttribute(attribute));
        }
      }
    }
    if (action) {
      surface.type = "button";
      surface.addEventListener("click", () => this.#runAction(action));
    }

    const icon = document.createElement("span");
    icon.className = "gs-icon";
    icon.ariaHidden = "true";
    if (this.hasAttribute("src")) {
      const image = document.createElement("img");
      image.src = this.getAttribute("src");
      image.alt = "";
      icon.append(image);
    } else {
      icon.textContent = this.getAttribute("icon") || "◇";
    }

    const label = document.createElement("span");
    label.textContent = this.getAttribute("label") || this.textContent.trim();
    surface.append(icon, label);
    this.replaceChildren(surface);
    if (interactive) this.dataset.interactive = "true";
  }

  #runAction(action) {
    const [command, selector] = action.split(":", 2);
    const target = selector ? document.querySelector(selector) : null;
    if (command === "open") target?.open?.();
    if (command === "close") target?.close?.();
    this.dispatchEvent(new CustomEvent("gs-icon-activate", {
      bubbles: true,
      detail: { action, command, target },
    }));
  }
}

class GessiIcons extends HTMLElementBase {
  connectedCallback() {
    if (this.dataset.enhanced) return;
    this.dataset.enhanced = "true";
    this.classList.add(this.hasAttribute("desktop") ? "gs-desktop-icons" : "gs-icon-grid");
    if (this.getAttribute("side") === "left") this.classList.add("gs-left");
    if (this.getAttribute("side") === "right") this.classList.add("gs-right");
  }
}

class GessiDialog extends GessiWindow {
  connectedCallback() {
    this.setAttribute("dialog", "");
    this.setAttribute("active", "");
    super.connectedCallback();
  }
}

class GessiTabs extends HTMLElementBase {
  connectedCallback() {
    if (this.dataset.enhanced) return;
    this.dataset.enhanced = "true";
    this.classList.add("gs-tabs");
    this.setAttribute("role", "tablist");
    this.querySelectorAll(":scope > a, :scope > button").forEach((tab) => {
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-selected", String(tab.hasAttribute("active")));
    });
  }
}

class GessiPanel extends HTMLElementBase {
  connectedCallback() {
    if (this.dataset.enhanced) return;
    this.dataset.enhanced = "true";
    this.classList.add("gs-control-panel");
    this.style.setProperty(
      "--gs-panel-columns",
      this.getAttribute("columns") || "1",
    );
    this.style.setProperty(
      "--gs-panel-gap",
      cssLength(this.getAttribute("gap"), "0.75rem"),
    );
    if (this.hasAttribute("title")) {
      const heading = document.createElement("strong");
      heading.className = "gs-control-panel-title";
      heading.textContent = this.getAttribute("title");
      this.prepend(heading);
    }
  }
}

class GessiMeter extends HTMLElementBase {
  connectedCallback() {
    if (this.dataset.enhanced) return;
    this.dataset.enhanced = "true";
    this.classList.add("gs-meter");
    const value = Math.max(0, Math.min(100, Number(this.getAttribute("value") || 0)));
    const labelText = this.getAttribute("label") || this.textContent.trim();
    const label = document.createElement("span");
    label.textContent = labelText;
    const track = document.createElement("span");
    track.className = "gs-meter-track";
    track.setAttribute("role", "progressbar");
    track.setAttribute("aria-label", labelText || "Progress");
    track.setAttribute("aria-valuemin", "0");
    track.setAttribute("aria-valuemax", "100");
    track.setAttribute("aria-valuenow", String(value));
    const fill = document.createElement("span");
    fill.style.width = `${value}%`;
    track.append(fill);
    const output = document.createElement("output");
    output.textContent = `${value}%`;
    this.replaceChildren(label, track, output);
  }
}

class GessiList extends HTMLElementBase {
  connectedCallback() {
    if (this.dataset.enhanced) return;
    this.dataset.enhanced = "true";
    this.classList.add("gs-listbox");
    this.setAttribute("role", this.getAttribute("role") || "listbox");
    this.querySelectorAll(":scope > a, :scope > button, :scope > label").forEach((item) => {
      item.setAttribute("role", "option");
      item.setAttribute("aria-selected", String(item.hasAttribute("selected")));
    });
  }
}

class GessiAlert extends HTMLElementBase {
  connectedCallback() {
    if (this.dataset.enhanced) return;
    this.dataset.enhanced = "true";
    this.classList.add("gs-alert");
    this.setAttribute("role", this.getAttribute("role") || "alert");
    if (this.hasAttribute("title")) {
      const title = document.createElement("strong");
      title.className = "gs-alert-title";
      title.textContent = this.getAttribute("title");
      this.prepend(title);
    }
    if (this.hasAttribute("dismissible")) {
      const close = makeButton("Dismiss", "×", "dismiss");
      close.classList.add("gs-alert-close");
      close.addEventListener("click", () => {
        this.hidden = true;
        this.dispatchEvent(new CustomEvent("gs-dismiss"));
      });
      this.prepend(close);
    }
  }
}

class GessiToolbar extends HTMLElementBase {
  connectedCallback() {
    if (this.dataset.enhanced) return;
    this.dataset.enhanced = "true";
    this.classList.add("gs-commandbar");
    this.setAttribute("role", this.getAttribute("role") || "toolbar");
    this.ariaLabel ||= this.getAttribute("label") || "Commands";
  }
}

class GessiDock extends HTMLElementBase {
  connectedCallback() {
    if (this.dataset.enhanced) return;
    this.dataset.enhanced = "true";
    this.classList.add("gs-dock");
    this.dataset.position = this.getAttribute("position") || "bottom";
    this.setAttribute("role", this.getAttribute("role") || "toolbar");
    this.ariaLabel ||= this.getAttribute("label") || "Applications";
  }
}

class GessiMenu extends HTMLElementBase {
  #outsideCleanup;

  connectedCallback() {
    if (this.dataset.enhanced) return;
    this.dataset.enhanced = "true";
    this.classList.add("gs-menu");

    const label = this.getAttribute("label");
    if (!label) {
      this.classList.add("gs-menu-list");
      this.setAttribute("role", this.getAttribute("role") || "menu");
      this.#prepareItems(this);
      return;
    }

    const items = [...this.childNodes];
    const button = document.createElement("button");
    const panel = document.createElement("div");
    const id = this.id || `gs-menu-${Math.random().toString(36).slice(2, 9)}`;
    this.id ||= id;
    panel.id = `${id}-panel`;
    button.type = "button";
    button.className = "gs-menu-trigger";
    button.textContent = label;
    button.setAttribute("aria-haspopup", "menu");
    button.setAttribute("aria-controls", panel.id);
    button.setAttribute("aria-expanded", "false");
    panel.className = "gs-menu-panel";
    panel.setAttribute("role", "menu");
    panel.hidden = true;
    panel.append(...items);
    this.#prepareItems(panel);
    this.replaceChildren(button, panel);

    const close = (restoreFocus = false) => {
      panel.hidden = true;
      button.setAttribute("aria-expanded", "false");
      this.removeAttribute("open");
      if (restoreFocus) button.focus();
    };
    const open = () => {
      panel.hidden = false;
      button.setAttribute("aria-expanded", "true");
      this.setAttribute("open", "");
      panel.querySelector(focusableSelector)?.focus();
    };

    button.addEventListener("click", () => panel.hidden ? open() : close());
    this.addEventListener("keydown", (event) => {
      if (event.key === "Escape") close(true);
      if (event.key === "ArrowDown" && document.activeElement === button) {
        event.preventDefault();
        open();
      }
    });
    const onOutsidePointer = (event) => {
      if (!this.contains(event.target)) close();
    };
    document.addEventListener("pointerdown", onOutsidePointer);
    this.#outsideCleanup = () => document.removeEventListener("pointerdown", onOutsidePointer);
  }

  disconnectedCallback() {
    this.#outsideCleanup?.();
  }

  #prepareItems(container) {
    container.querySelectorAll(":scope > a, :scope > button").forEach((item) => {
      item.setAttribute("role", "menuitem");
    });
  }
}

class GessiBreadcrumb extends HTMLElementBase {
  connectedCallback() {
    if (this.dataset.enhanced) return;
    this.dataset.enhanced = "true";
    this.classList.add("gs-breadcrumb");
    this.setAttribute("role", "navigation");
    this.ariaLabel ||= this.getAttribute("label") || "Breadcrumb";
    const links = [...this.querySelectorAll("a")];
    links.at(-1)?.setAttribute("aria-current", "page");
  }
}

class GessiTree extends HTMLElementBase {
  connectedCallback() {
    if (this.dataset.enhanced) return;
    this.dataset.enhanced = "true";
    this.classList.add("gs-tree");
    this.setAttribute("role", "tree");
    this.querySelectorAll("li").forEach((item) => item.setAttribute("role", "treeitem"));
    this.querySelectorAll("ul").forEach((group) => group.setAttribute("role", "group"));
  }
}

class GessiSeparator extends HTMLElementBase {
  connectedCallback() {
    if (this.dataset.enhanced) return;
    this.dataset.enhanced = "true";
    this.classList.add("gs-separator");
    const orientation = this.getAttribute("orientation") || "horizontal";
    this.dataset.orientation = orientation;
    this.setAttribute("role", "separator");
    this.setAttribute("aria-orientation", orientation);
  }
}

class GessiTooltip extends HTMLElementBase {
  connectedCallback() {
    if (this.dataset.enhanced) return;
    this.dataset.enhanced = "true";
    this.classList.add("gs-tooltip");
    const tip = document.createElement("span");
    const id = this.id || `gs-tooltip-${Math.random().toString(36).slice(2, 9)}`;
    this.id ||= id;
    tip.id = `${id}-tip`;
    tip.className = "gs-tooltip-content";
    tip.setAttribute("role", "tooltip");
    tip.textContent = this.getAttribute("text") || this.getAttribute("label") || "";
    this.firstElementChild?.setAttribute("aria-describedby", tip.id);
    this.append(tip);
  }
}

class GessiToast extends GessiAlert {
  connectedCallback() {
    if (!this.hasAttribute("role")) this.setAttribute("role", "status");
    super.connectedCallback();
    this.classList.add("gs-toast");
    this.dataset.position = this.getAttribute("position") || "bottom-right";
  }
}

class GessiMedia extends HTMLElementBase {
  connectedCallback() {
    if (this.dataset.enhanced) return;
    this.dataset.enhanced = "true";
    this.classList.add("gs-media-frame");
    this.dataset.effect = this.getAttribute("effect") || "none";
    this.dataset.frame = this.getAttribute("frame") || "window";
    this.style.setProperty("--gs-media-aspect", this.getAttribute("aspect") || "auto");
    this.style.setProperty("--gs-media-fit", this.getAttribute("fit") || "cover");
    this.style.setProperty("--gs-media-position", this.getAttribute("position") || "center");

    const figure = document.createElement("figure");
    const image = document.createElement("img");
    image.src = this.getAttribute("src") || "";
    image.alt = this.getAttribute("alt") || "";
    image.loading = this.getAttribute("loading") || "lazy";
    image.decoding = "async";
    applyMediaEffects(image, this.dataset.effect);
    image.style.objectPosition = this.getAttribute("position") || "center";
    if (this.hasAttribute("width")) image.width = Number(this.getAttribute("width"));
    if (this.hasAttribute("height")) image.height = Number(this.getAttribute("height"));

    const viewport = document.createElement("span");
    viewport.className = "gs-media-viewport";
    viewport.append(image);
    figure.append(viewport);

    const captionText = this.getAttribute("caption");
    if (captionText) {
      const caption = document.createElement("figcaption");
      caption.textContent = captionText;
      figure.append(caption);
    }

    this.replaceChildren(figure);
    if (this.hasAttribute("zoomable")) {
      this.tabIndex = 0;
      this.setAttribute("role", "button");
      this.setAttribute("aria-label", `Zoom ${image.alt || "image"}`);
      const toggle = () => this.toggleAttribute("expanded");
      this.addEventListener("click", toggle);
      this.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggle();
        }
        if (event.key === "Escape") this.removeAttribute("expanded");
      });
    }
  }
}

class GessiMarker extends HTMLElementBase {
  connectedCallback() {
    if (this.dataset.enhanced) return;
    this.dataset.enhanced = "true";
    this.classList.add("gs-map-marker");
    this.style.left = this.getAttribute("x") || "50%";
    this.style.top = this.getAttribute("y") || "50%";
    this.setAttribute("role", "img");
    this.ariaLabel = this.getAttribute("label") || "Map marker";
    this.textContent ||= "◆";
  }
}

class GessiMap extends HTMLElementBase {
  connectedCallback() {
    if (this.dataset.enhanced) return;
    this.dataset.enhanced = "true";
    this.classList.add("gs-map");
    this.dataset.effect = this.getAttribute("effect") || "none";
    this.style.setProperty("--gs-map-fit", this.getAttribute("fit") || "contain");
    this.style.setProperty("--gs-map-position", this.getAttribute("position") || "center");
    const markers = [...this.querySelectorAll(":scope > gessi-marker")];
    const viewport = document.createElement("div");
    viewport.className = "gs-map-viewport";

    if (this.hasAttribute("src")) {
      const image = document.createElement("img");
      image.src = this.getAttribute("src");
      image.alt = this.getAttribute("alt") || "";
      image.loading = "lazy";
      image.decoding = "async";
      applyMediaEffects(image, this.dataset.effect);
      viewport.append(image);
    } else {
      const content = [...this.childNodes].filter((node) => !markers.includes(node));
      viewport.append(...content);
    }
    viewport.append(...markers);
    this.replaceChildren(viewport);
    if (this.hasAttribute("caption")) {
      const caption = document.createElement("p");
      caption.className = "gs-map-caption";
      caption.textContent = this.getAttribute("caption");
      this.append(caption);
    }
  }
}

class GessiCarousel extends HTMLElementBase {
  #index = 0;
  #timer;

  connectedCallback() {
    if (this.dataset.enhanced) return;
    this.dataset.enhanced = "true";
    this.classList.add("gs-carousel");
    const slides = [...this.children];
    if (!slides.length) return;

    const track = document.createElement("div");
    track.className = "gs-carousel-track";
    slides.forEach((slide, index) => {
      slide.classList.add("gs-carousel-slide");
      slide.dataset.slide = String(index);
      track.append(slide);
    });

    const controls = document.createElement("nav");
    controls.className = "gs-carousel-controls";
    controls.ariaLabel = "Carousel controls";
    const previous = makeButton("Previous slide", "◀", "previous");
    const counter = document.createElement("output");
    const next = makeButton("Next slide", "▶", "next");
    controls.append(previous, counter, next);
    this.replaceChildren(track, controls);

    this.setAttribute("role", "region");
    this.setAttribute("aria-roledescription", "carousel");
    this.tabIndex ||= 0;
    const show = (index) => {
      this.#index = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        const active = slideIndex === this.#index;
        slide.hidden = !active;
        slide.setAttribute("aria-hidden", String(!active));
      });
      counter.value = `${this.#index + 1} / ${slides.length}`;
      this.dispatchEvent(new CustomEvent("gs-slide-change", {
        detail: { index: this.#index },
      }));
    };
    previous.addEventListener("click", () => show(this.#index - 1));
    next.addEventListener("click", () => show(this.#index + 1));
    this.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") show(this.#index - 1);
      if (event.key === "ArrowRight") show(this.#index + 1);
      if (event.key === "Home") show(0);
      if (event.key === "End") show(slides.length - 1);
    });
    show(Number(this.getAttribute("start") || 0));

    const autoplay = Number(this.getAttribute("autoplay") || 0);
    if (autoplay > 0) {
      this.#timer = setInterval(() => show(this.#index + 1), autoplay);
      this.addEventListener("pointerenter", () => clearInterval(this.#timer));
      this.addEventListener("focusin", () => clearInterval(this.#timer));
    }
  }

  disconnectedCallback() {
    clearInterval(this.#timer);
  }
}

if (globalThis.customElements) {
  if (!customElements.get("gessi-desktop")) customElements.define("gessi-desktop", GessiDesktop);
  if (!customElements.get("gessi-window")) customElements.define("gessi-window", GessiWindow);
  if (!customElements.get("gessi-dialog")) customElements.define("gessi-dialog", GessiDialog);
  if (!customElements.get("gessi-icon")) customElements.define("gessi-icon", GessiIcon);
  if (!customElements.get("gessi-icons")) customElements.define("gessi-icons", GessiIcons);
  if (!customElements.get("gessi-tabs")) customElements.define("gessi-tabs", GessiTabs);
  if (!customElements.get("gessi-panel")) customElements.define("gessi-panel", GessiPanel);
  if (!customElements.get("gessi-meter")) customElements.define("gessi-meter", GessiMeter);
  if (!customElements.get("gessi-list")) customElements.define("gessi-list", GessiList);
  if (!customElements.get("gessi-alert")) customElements.define("gessi-alert", GessiAlert);
  if (!customElements.get("gessi-toolbar")) customElements.define("gessi-toolbar", GessiToolbar);
  if (!customElements.get("gessi-dock")) customElements.define("gessi-dock", GessiDock);
  if (!customElements.get("gessi-menu")) customElements.define("gessi-menu", GessiMenu);
  if (!customElements.get("gessi-breadcrumb")) customElements.define("gessi-breadcrumb", GessiBreadcrumb);
  if (!customElements.get("gessi-tree")) customElements.define("gessi-tree", GessiTree);
  if (!customElements.get("gessi-separator")) customElements.define("gessi-separator", GessiSeparator);
  if (!customElements.get("gessi-tooltip")) customElements.define("gessi-tooltip", GessiTooltip);
  if (!customElements.get("gessi-toast")) customElements.define("gessi-toast", GessiToast);
  if (!customElements.get("gessi-media")) customElements.define("gessi-media", GessiMedia);
  if (!customElements.get("gessi-map")) customElements.define("gessi-map", GessiMap);
  if (!customElements.get("gessi-marker")) customElements.define("gessi-marker", GessiMarker);
  if (!customElements.get("gessi-carousel")) customElements.define("gessi-carousel", GessiCarousel);
}

export {
  GessiDesktop,
  GessiDialog,
  GessiIcon,
  GessiIcons,
  GessiMeter,
  GessiPanel,
  GessiTabs,
  GessiWindow,
  GessiList,
  GessiAlert,
  GessiToolbar,
  GessiDock,
  GessiMenu,
  GessiBreadcrumb,
  GessiTree,
  GessiSeparator,
  GessiTooltip,
  GessiToast,
  GessiMedia,
  GessiMap,
  GessiMarker,
  GessiCarousel,
};
