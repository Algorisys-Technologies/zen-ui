/**
 * The whole site behind one URL, laid out exactly as it deploys.
 *
 * React and Solid cannot share a vite server — the two JSX transforms fight
 * over the same files — so this runs one child server per app and puts a router
 * in front. You run one command and open one port; the split stays an
 * implementation detail.
 *
 *   bun run dev:all   ->  http://localhost:5170
 *
 *   /                 the landing page   (apps/landing)
 *   /builder/         the React demo     (packages/react)
 *   /builder-solid/   the Solid demo     (packages/solid)
 *
 * That is the same shape ./deploy.sh publishes, one prefix down (/zen-ui/…), so
 * the home page you develop against is the home page that ships. There used to
 * be a hand-written hub page here instead, and the landing page was linked on
 * its own port because the hub had already taken "/" — two home pages, one of
 * which nobody would remember to update.
 *
 * The proxy passes the path through unrewritten, so each child sees the same URL
 * the browser asked for and its configured `base` still matches.
 *
 * Adding an app: one entry in ./demos.mjs.
 */
import { spawn } from "node:child_process";
import { createServer as createSocket } from "node:net";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createServer } from "vite";
import { DEMOS, HUB_PORT } from "./demos.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");

// Launch vite through the runtime already running this script + the locally
// installed vite CLI, rather than `npx vite`. `npx` is not guaranteed on PATH
// (a node install without npm, or a bun-only shell that runs this via the node
// npm-script), and when it is missing every child dies with ENOENT before the
// hub even starts. process.execPath is whatever launched dev-all — always present
// — and vite is a workspace dependency, so this path always resolves.
const VITE_BIN = resolve(ROOT, "node_modules/vite/bin/vite.js");

/** The one port you open. Override when 5170 is taken: ZEN_HUB_PORT=5180. */
const hubPort = Number(process.env.ZEN_HUB_PORT) || HUB_PORT;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Ask the OS for a free port. The children's ports are an implementation
 * detail — nobody types them — so taking whatever is free beats pinning
 * numbers that collide with a `bun run dev` already on vite's default 5173.
 */
const freePort = () =>
  new Promise((ok, fail) => {
    const s = createSocket();
    s.on("error", fail);
    s.listen(0, "127.0.0.1", () => {
      const { port } = s.address();
      s.close(() => ok(port));
    });
  });

const children = [];
let shuttingDown = false;

/**
 * Signal a child's whole process group — vite spawns workers, and killing only
 * the wrapper leaves them holding the port, where they answer the next run's
 * health check and serve stale code.
 *
 * The ESRCH retry is not paranoia. `detached: true` makes the child call
 * setsid() AFTER the fork, so a kill fired in the first moments after spawn
 * races it: the group does not exist yet, process.kill(-pid) throws ESRCH, the
 * signal reaches nobody, and the child lives on as an orphan. The hub failing
 * on a taken port does exactly that — it errors milliseconds after spawn — and
 * it stranded four servers before this loop existed.
 */
const killGroup = async (child, signal) => {
  for (let i = 0; i < 20; i++) {
    if (child.exitCode !== null || child.signalCode) return;
    try {
      process.kill(-child.pid, signal);
      return;
    } catch (err) {
      if (err.code !== "ESRCH") return;
      // Either the group has not formed yet, or it is already gone. Sleeping
      // costs 50ms in the second case and saves an orphan in the first.
      await sleep(50);
    }
  }
};

const shutdown = async (code = 0) => {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const c of children) await killGroup(c, "SIGTERM");
  await sleep(300);
  for (const c of children) await killGroup(c, "SIGKILL"); // anything that ignored TERM
  process.exit(code);
};

process.on("SIGINT", () => void shutdown(0));
process.on("SIGTERM", () => void shutdown(0));

const running = [];

for (const demo of DEMOS) {
  const port = await freePort();
  const child = spawn(
    process.execPath,
    [VITE_BIN, ...(demo.config ? ["--config", demo.config] : []), "--port", String(port), "--strictPort"],
    { cwd: resolve(ROOT, demo.dir), stdio: ["ignore", "pipe", "pipe"], detached: true },
  );
  children.push(child);
  running.push({ ...demo, port });

  // --strictPort makes a taken port fatal rather than letting vite drift to the
  // next one: a child on an unexpected port would leave the hub proxying into a
  // void, or worse, into someone else's server.
  child.stderr.on("data", (d) => {
    const s = String(d);
    if (s.trim()) console.error(`[${demo.id}] ${s.trimEnd()}`);
  });
  child.on("exit", (code) => {
    if (!shuttingDown && code) {
      console.error(`\n[${demo.id}] dev server exited (${code}).`);
      void shutdown(1);
    }
  });
}

/**
 * The proxy table. Two rules, and both have already broken this once:
 *
 *  - LONGEST BASE FIRST. Vite tests the keys in insertion order, and "/" would
 *    otherwise swallow /builder before it was ever reached.
 *  - ANCHORED, not a bare prefix. "/builder" is a PREFIX of "/builder-solid",
 *    so a plain string key sent every Solid URL to the React server, which
 *    answered with its own 404 ("did you mean /builder/builder-solid/…?").
 *    Requiring a "/" or end-of-string after the base keeps them apart whatever
 *    order they are declared in, and keeps a future /builder-vue apart too.
 *
 * "/" is the exception to the anchoring: `^/(/|$)` would match only "/" itself,
 * so the landing page's every asset would fall through to nothing. It is the
 * catch-all, and being last is what makes that safe.
 */
const proxyTable = Object.fromEntries(
  running
    .slice()
    .sort((a, b) => b.base.length - a.base.length)
    .map((d) => [
      d.base === "/" ? "^/" : `^${d.base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(/|$)`,
      { target: `http://localhost:${d.port}`, changeOrigin: true, ws: true },
    ]),
);

// Started inside try/catch for one reason: the children are already spawned and
// detached by now, so a router that throws on the way up (a taken port is the
// usual cause) would exit and strand them holding their ports.
let hub;
try {
  hub = await createServer({
    configFile: false,
    // Every path is proxied to a child, so this server never serves a file of
    // its own. The root only has to exist.
    root: ROOT,
    server: {
      port: hubPort,
      strictPort: true,
      proxy: proxyTable,
    },
    plugins: [],
  });
  await hub.listen();
} catch (err) {
  const taken = /already in use/i.test(String(err?.message));
  console.error(
    taken
      ? `\n  Port ${hubPort} is already in use — another \`dev:all\` is probably still running.\n` +
          `  Stop it, or pick another port:  ZEN_HUB_PORT=5180 bun run dev:all\n`
      : `\n  Hub failed to start: ${err?.message ?? err}\n`,
  );
  await shutdown(1); // never leave the children holding their ports
}

console.log(`\n  zen-ui  ->  http://localhost:${hubPort}/\n`);
for (const d of running.slice().sort((a, b) => a.base.length - b.base.length)) {
  console.log(`    ${d.label.padEnd(13)} http://localhost:${hubPort}${d.base === "/" ? "/" : `${d.base}/`}`);
}
console.log("");
