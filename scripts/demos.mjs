import { BINDINGS } from "./bindings.mjs";

/**
 * Every binding, plus the landing page. Derived from scripts/bindings.mjs so a new
 * binding is genuinely one entry: this table, the proxy keys and the spawned
 * servers all fall out of it.
 *
 * The landing page's base is "/", so it is the catch-all and must be matched LAST
 * — the proxy table is sorted longest-base-first for that reason. It used to be
 * linked on its own port instead, because the hub page occupied "/" and only one
 * of them could have it. The hub page is gone: the landing page IS the home now,
 * in dev exactly as on GitHub Pages, so there is no second home page to drift.
 *
 * Deliberately no ports. Children get a free one at runtime — you never type it,
 * so pinning would only invent a collision with the `bun run dev` you may already
 * have on vite's default 5173.
 */
const BLURBS = {
  react: "Radix-backed binding. The reference implementation of the API.",
  solid: "Kobalte-backed binding. Mirrors the React API one-for-one.",
  vanilla: "No framework, no primitive library. Props in, a DOM node out.",
};

export const DEMOS = [
  ...BINDINGS.map((b) => ({
    id: b.id,
    label: b.label,
    blurb: BLURBS[b.id] ?? "",
    dir: b.dir,
    base: b.base,
    config: "vite.config.demo.ts",
  })),
  {
    id: "landing",
    label: "Landing page",
    blurb: "The marketing page. Ships CSS to nobody; depends on core alone.",
    dir: "apps/landing",
    // The home page, at "/" — the same thing GitHub Pages serves at /zen-ui/.
    // Its links to the demos resolve against import.meta.env.BASE_URL, so this is
    // not a re-base: it stays at "/" and simply takes the path the hub used to
    // squat on.
    base: "/",
  },
];

/** The one port you open. Override with ZEN_HUB_PORT when it is taken. */
export const HUB_PORT = 5170;
