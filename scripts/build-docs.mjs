import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const output = resolve(root, "_site");

await rm(output, { force: true, recursive: true });
await mkdir(output, { recursive: true });

const html = await readFile(resolve(root, "docs/index.html"), "utf8");
await writeFile(
  resolve(output, "index.html"),
  html
    .replaceAll("../dist/", "./dist/")
    .replaceAll("../examples/", "./examples/")
    .replaceAll("./docs.css", "./assets/docs.css")
    .replaceAll("./docs.js", "./assets/docs.js"),
);

await mkdir(resolve(output, "assets"), { recursive: true });
await cp(resolve(root, "docs/docs.css"), resolve(output, "assets/docs.css"));
await cp(resolve(root, "docs/docs.js"), resolve(output, "assets/docs.js"));
await cp(resolve(root, "docs/CNAME"), resolve(output, "CNAME"));
await cp(resolve(root, "docs/llms.txt"), resolve(output, "llms.txt"));
await cp(resolve(root, "docs/reference.md"), resolve(output, "reference.md"));
await cp(resolve(root, "dist"), resolve(output, "dist"), { recursive: true });
await cp(resolve(root, "examples"), resolve(output, "examples"), { recursive: true });
await writeFile(resolve(output, ".nojekyll"), "");

console.log(`Documentation built at ${output}`);
