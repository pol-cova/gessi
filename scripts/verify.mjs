import { access, readFile } from "node:fs/promises";

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

const requiredExamples = [
  "examples/index.html",
  "examples/standalone.html",
  "examples/no-js.html",
  "examples/product-os.html",
  "examples/classic-os.html",
  "examples/media-os.html",
  "examples/assets/world-map.png",
];

await Promise.all(requiredExamples.map((file) => access(file)));
await import("../src/components.js");
await import("../src/gessi.js");

console.log("Gessi verification passed.");
