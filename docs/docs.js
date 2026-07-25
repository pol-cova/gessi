const sections = [...document.querySelectorAll("[data-doc-page]")].map((section) => ({
  id: section.id,
  title: section.querySelector("h1, h2")?.textContent.trim() || section.id,
  description: section.querySelector("p")?.textContent.trim() || "",
  terms: `${section.dataset.docPage} ${section.textContent}`.toLowerCase(),
}));

const normalize = (value) => value.trim().toLowerCase();

const fallbackCopy = (text) => {
  const fallback = document.createElement("textarea");
  fallback.value = text;
  fallback.setAttribute("readonly", "");
  fallback.style.position = "fixed";
  fallback.style.opacity = "0";
  document.body.append(fallback);
  fallback.select();
  const copied = document.execCommand("copy");
  fallback.remove();
  return copied;
};

const copyText = async (button, text) => {
  let copied = fallbackCopy(text);
  try {
    await navigator.clipboard.writeText(text);
    copied = true;
  } catch {}

  const previous = button.textContent;
  button.textContent = copied ? "Copied" : "Select and copy";
  if (copied) button.dataset.copied = "true";
  window.setTimeout(() => {
    button.textContent = previous;
    delete button.dataset.copied;
  }, 1400);
};

document.querySelectorAll("[data-copy-block]").forEach((block) => {
  const button = block.querySelector("[data-copy]");
  const code = block.querySelector("code");
  button?.addEventListener("click", () => copyText(button, code?.textContent || ""));
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-theme]");
  if (button) {
    document.querySelectorAll("[data-theme]").forEach((candidate) => {
      candidate.setAttribute("aria-pressed", String(candidate === button));
    });
    document.querySelector("[data-theme-preview]").dataset.gsStyle = button.dataset.theme;
  }
});

document.querySelectorAll("[data-doc-tabs]").forEach((tabs) => {
  const buttons = [...tabs.querySelectorAll("[role='tab']")];
  const panels = [...tabs.querySelectorAll("[role='tabpanel']")];
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((candidate) => {
        candidate.setAttribute("aria-selected", String(candidate === button));
      });
      panels.forEach((panel) => {
        panel.hidden = panel.dataset.panel !== button.dataset.tab;
      });
    });
  });
});

const sidebar = document.querySelector("[data-sidebar]");
const navToggle = document.querySelector("[data-nav-toggle]");
const setSidebarOpen = (open) => {
  sidebar.toggleAttribute("data-open", open);
  navToggle?.setAttribute("aria-expanded", String(open));
};

navToggle?.addEventListener("click", () => {
  setSidebarOpen(!sidebar.hasAttribute("data-open"));
});
sidebar.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setSidebarOpen(false));
});

const filterNavigation = (query) => {
  const term = normalize(query);
  sidebar.querySelectorAll("a").forEach((link) => {
    const target = document.querySelector(link.hash);
    const haystack = `${link.textContent} ${target?.dataset.docPage || ""}`.toLowerCase();
    link.hidden = Boolean(term) && !haystack.includes(term);
  });
  sidebar.querySelectorAll("section").forEach((group) => {
    group.hidden = ![...group.querySelectorAll("a")].some((link) => !link.hidden);
  });
};

document.querySelector("[data-doc-filter]")?.addEventListener("input", (event) => {
  filterNavigation(event.target.value);
});

const searchDialog = document.querySelector("[data-search-dialog]");
const searchInput = document.querySelector("[data-search-input]");
const searchResults = document.querySelector("[data-search-results]");

const renderSearch = (query = "") => {
  const term = normalize(query);
  const matches = term
    ? sections.filter((section) => section.terms.includes(term)).slice(0, 8)
    : sections.slice(0, 6);
  searchResults.replaceChildren();

  if (!matches.length) {
    const empty = document.createElement("p");
    empty.className = "docs-empty";
    empty.textContent = "No matching documentation.";
    searchResults.append(empty);
    return;
  }

  matches.forEach((section) => {
    const link = document.createElement("a");
    const title = document.createElement("strong");
    const description = document.createElement("small");
    link.href = `#${section.id}`;
    title.textContent = section.title;
    description.textContent = section.description;
    link.append(title, description);
    link.addEventListener("click", () => searchDialog.close());
    searchResults.append(link);
  });
};

const openSearch = () => {
  renderSearch(searchInput.value);
  searchDialog.showModal();
  requestAnimationFrame(() => searchInput.focus());
};

document.querySelectorAll("[data-search-open]").forEach((button) => {
  button.addEventListener("click", openSearch);
});
searchInput?.addEventListener("input", (event) => renderSearch(event.target.value));
document.addEventListener("keydown", (event) => {
  if (
    event.key === "/"
    && !event.metaKey
    && !event.ctrlKey
    && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)
  ) {
    event.preventDefault();
    openSearch();
  }
});

const navLinks = [...document.querySelectorAll(".docs-sidebar a[href^='#']")];
const observedSections = navLinks
  .map((link) => document.querySelector(link.hash))
  .filter(Boolean);
const observer = new IntersectionObserver((entries) => {
  const visible = entries
    .filter((entry) => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  navLinks.forEach((link) => {
    if (link.hash === `#${visible.target.id}`) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}, {
  rootMargin: "-20% 0px -68%",
  threshold: [0, 0.2, 0.6],
});
observedSections.forEach((section) => observer.observe(section));

const escapeMarkup = (value) => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

document.querySelectorAll("[data-playground]").forEach((playground) => {
  const form = playground.querySelector("[data-playground-controls]");
  const preview = playground.querySelector("[data-playground-preview]");
  const code = playground.querySelector("[data-playground-code] code");
  let active = "window";

  const value = (name) => form.elements[name].value;
  const checked = (name) => form.elements[name].checked;
  const snippetFor = () => {
    if (active === "window") {
      const controls = `${checked("window-minimizable") ? " minimizable" : ""}${checked("window-zoomable") ? " zoomable" : ""}`;
      return `<div data-gs-style="${value("window-theme")}">\n  <gessi-window title="${escapeMarkup(value("window-title"))}" active${controls}\n    style="--gs-window-width: ${value("window-width")}"\n  >\n    <p>Your normal HTML goes here.</p>\n  </gessi-window>\n</div>`;
    }
    if (active === "media") {
      return `<div data-gs-style="${value("media-theme")}">\n  <gessi-media\n    src="/image.jpg"\n    alt="Describe the image"\n    effect="${value("media-effect")}"\n    frame="${value("media-frame")}"\n    aspect="${value("media-aspect")}"\n    fit="${value("media-fit")}"\n  ></gessi-media>\n</div>`;
    }
    const icons = checked("desktop-icons")
      ? "\n  <gessi-icons desktop>\n    <gessi-icon icon=\"◇\" label=\"Projects\"></gessi-icon>\n    <gessi-icon icon=\"◆\" label=\"Archive\"></gessi-icon>\n  </gessi-icons>"
      : "";
    return `<gessi-desktop\n  theme="${value("desktop-theme")}"\n  background="${value("desktop-background")}"\n  pattern="${value("desktop-pattern")}"\n  pattern-color="${value("desktop-pattern-color")}"\n  menu="${escapeMarkup(value("desktop-menu"))}"\n>${icons}\n  <gessi-window title="Welcome" active>\n    Your normal HTML goes here.\n  </gessi-window>\n</gessi-desktop>`;
  };
  const render = () => {
    const snippet = snippetFor();
    preview.innerHTML = snippet;
    code.textContent = snippet;
  };
  playground.querySelectorAll("[data-playground-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      active = button.dataset.playgroundTab;
      playground.querySelectorAll("[data-playground-tab]").forEach((candidate) => {
        candidate.setAttribute("aria-selected", String(candidate === button));
      });
      playground.querySelectorAll("[data-playground-panel]").forEach((panel) => {
        panel.hidden = panel.dataset.playgroundPanel !== active;
      });
      render();
    });
  });
  form.addEventListener("input", render);
  form.addEventListener("change", render);
  render();
});
