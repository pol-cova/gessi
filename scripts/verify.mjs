import { access, readdir, readFile } from "node:fs/promises";

const pairs = [
  ["src/gessi.css", "dist/gessi.css"],
  ["src/components.js", "dist/components.js"],
  ["src/gessi.js", "dist/gessi.js"],
  ["src/fonts/departure-mono.woff2", "dist/fonts/departure-mono.woff2"],
  [
    "src/fonts/DEPARTURE-MONO-LICENSE.txt",
    "dist/fonts/DEPARTURE-MONO-LICENSE.txt",
  ],
];

for (const [source, built] of pairs) {
  const [sourceContents, builtContents] = await Promise.all([
    readFile(source),
    readFile(built),
  ]);
  if (!sourceContents.equals(builtContents)) {
    throw new Error(`${built} is stale. Run npm run build.`);
  }
}

const icons = await readdir("src/icons");
await Promise.all(icons.map(async (icon) => {
  const [source, built] = await Promise.all([
    readFile(`src/icons/${icon}`),
    readFile(`dist/icons/${icon}`),
  ]);
  if (!source.equals(built)) throw new Error(`dist/icons/${icon} is stale. Run npm run build.`);
}));

const requiredExamples = [
  "examples/index.html",
  "examples/standalone.html",
  "examples/no-js.html",
  "examples/product-os.html",
  "examples/classic-os.html",
  "examples/media-os.html",
  "examples/custom-theme.html",
  "examples/assets/world-map.png",
  "docs/index.html",
  "docs/CNAME",
  "docs/docs.css",
  "docs/docs.js",
  "docs/llms.txt",
  "docs/reference.md",
  "scripts/build-docs.mjs",
  ".github/workflows/pages.yml",
];

await Promise.all(requiredExamples.map((file) => access(file)));
await import("../src/components.js");
await import("../src/gessi.js");

console.log("Gessi verification passed.");
