/**
 * The demo registry — the single source of truth for what `dev:all` runs and
 * where it routes each path. Adding an app is one entry here.
 *
 * Every entry has a `base`, which must match the app's own vite `base`: the
 * proxy passes the path through unrewritten, so the child sees the same URL the
 * browser asked for.
 *
 * The landing page's base is "/", so it is the catch-all and must be matched
 * LAST — the proxy table is sorted longest-base-first for that reason. It used
 * to be linked on its own port instead, because the hub page occupied "/" and
 * only one of them could have it. The hub page is gone: the landing page IS the
 * home now, in dev exactly as on GitHub Pages, so there is no second home page
 * to drift.
 *
 * Deliberately no ports. Children get a free one at runtime — you never type
 * it, so pinning would only invent a collision with the `bun run dev` you may
 * already have on vite's default 5173.
 */
export const DEMOS = [
  {
    id: "react",
    label: "React",
    blurb: "Radix-backed binding. The reference implementation of the API.",
    dir: "packages/react",
    base: "/builder",
    config: "vite.config.demo.ts",
  },
  {
    id: "solid",
    label: "Solid",
    blurb: "Kobalte-backed binding. Mirrors the React API one-for-one.",
    dir: "packages/solid",
    base: "/builder-solid",
    config: "vite.config.demo.ts",
  },
  {
    id: "landing",
    label: "Landing page",
    blurb: "The marketing page. Ships CSS to nobody; depends on core alone.",
    dir: "apps/landing",
    // The home page, at "/" — the same thing GitHub Pages serves at /zen-ui/.
    // Its links to the demos resolve against import.meta.env.BASE_URL, so this
    // is not a re-base: it stays at "/" and simply takes the path the hub used
    // to squat on.
    base: "/",
  },
];

/** The one port you open. Override with ZEN_HUB_PORT when it is taken. */
export const HUB_PORT = 5170;
