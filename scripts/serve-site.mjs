/**
 * Serves dist-site/ the way GitHub Pages serves it, so a preview proves
 * something about the real thing.
 *
 * The two rules that matter, and that an ordinary static server gets wrong:
 *
 *   1. A missing path returns the SITE ROOT's 404.html. Not a per-directory
 *      one — Pages has no such concept — and not index.html, which is what
 *      every SPA-friendly dev server does. That fallback is exactly what hides
 *      broken deep links until they are live.
 *   2. Everything is served under the base path, so the same absolute URLs the
 *      browser will really request are the ones tested here.
 *
 * Used by ./deploy.sh --preview.
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";

const port = Number(process.argv[2] ?? 5180);
const base = process.env.ZEN_BASE ?? "/zen-ui/";
const root = resolve(process.env.ZEN_OUT ?? "dist-site");

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".map": "application/json; charset=utf-8",
};

const readIf = async (p) => {
  try {
    const s = await stat(p);
    if (!s.isFile()) return null;
    return await readFile(p);
  } catch {
    return null;
  }
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  let path = decodeURIComponent(url.pathname);

  // Off the deployment entirely — Pages would not answer at all.
  if (!path.startsWith(base)) {
    res.writeHead(404, { "content-type": "text/plain" });
    res.end(`nothing is deployed at ${path} — the site is at ${base}`);
    return;
  }

  let rel = path.slice(base.length);
  if (rel === "" || rel.endsWith("/")) rel += "index.html";

  // Traversal guard: normalize before joining, so ../ cannot escape the root.
  const file = join(root, normalize("/" + rel));
  if (!file.startsWith(root)) {
    res.writeHead(403).end();
    return;
  }

  let body = await readIf(file);

  // A directory URL without a trailing slash: Pages redirects to the slashed
  // form. Worth mimicking — it is how /zen-ui/builder becomes /zen-ui/builder/.
  if (!body && !extname(file)) {
    const asIndex = await readIf(join(file, "index.html"));
    if (asIndex) {
      res.writeHead(301, { location: path + "/" + url.search });
      res.end();
      return;
    }
  }

  if (body) {
    res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
    res.end(body);
    return;
  }

  // The rule that matters: the root 404.html, with a real 404 status.
  const fallback = await readIf(join(root, "404.html"));
  res.writeHead(404, { "content-type": "text/html; charset=utf-8" });
  res.end(fallback ?? "404");
});

server.listen(port, () => {
  console.log(`  serving ${root} at http://localhost:${port}${base}`);
});
