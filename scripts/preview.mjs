import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const port = Number(process.env.PORT ?? 4173);

const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

const server = createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host}`);
  const pathname = decodeURIComponent(url.pathname);
  const relative = normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  let file = join(root, relative);

  if (!file.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  if (existsSync(file) && statSync(file).isDirectory()) {
    file = join(file, "index.html");
  }

  if (!existsSync(file)) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    "content-type": types[extname(file)] ?? "application/octet-stream",
  });

  createReadStream(file).pipe(response);
});

server.listen(port, () => {
  console.log(`Gessi preview: http://localhost:${port}/examples/index.html`);
});
