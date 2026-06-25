import "./components.js";

if (
  typeof document !== "undefined"
  && !document.querySelector(
    '[data-gessi-styles], link[rel="stylesheet"][href*="gessi.css"]',
  )
) {
  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = new URL("./gessi.css", import.meta.url).href;
  stylesheet.dataset.gessiStyles = "";
  document.head.append(stylesheet);
}
