import { jsxs as h, jsx as n, Fragment as A } from "react/jsx-runtime";
import * as u from "react";
import { machineStateTone as S, machineStateMessageKey as D } from "./index116.js";
import { sortAndonTiles as E, boardFreshness as C, andonShowsClock as F, DEFAULT_ANDON_STALE_MS as R } from "./index122.js";
import { durationMessage as k } from "./index120.js";
import { useLocale as y } from "./index90.js";
import { cn as z } from "./index197.js";
const j = {
  running: "zen-bg-zen-state-running-soft zen-border-zen-state-running",
  down: "zen-bg-zen-state-down-soft zen-border-zen-state-down",
  setup: "zen-bg-zen-state-setup-soft zen-border-zen-state-setup",
  planned: "zen-bg-zen-state-planned-soft zen-border-zen-state-planned",
  idle: "zen-bg-zen-state-idle-soft zen-border-zen-state-idle",
  unknown: "zen-bg-zen-state-unknown-soft zen-border-zen-state-unknown zen-border-dashed"
}, v = {
  running: "zen-text-zen-state-running-soft-fg",
  down: "zen-text-zen-state-down-soft-fg",
  setup: "zen-text-zen-state-setup-soft-fg",
  planned: "zen-text-zen-state-planned-soft-fg",
  idle: "zen-text-zen-state-idle-soft-fg",
  unknown: "zen-text-zen-state-unknown-soft-fg"
};
function M(e) {
  const [l, s] = u.useState(() => Date.now());
  return u.useEffect(() => {
    if (!e) return;
    s(Date.now());
    const r = setInterval(() => s(Date.now()), 1e3);
    return () => clearInterval(r);
  }, [e]), l;
}
const T = u.forwardRef(
  ({ item: e, now: l, onClick: s, className: r, ...d }, f) => {
    const g = y(), b = M(l === void 0), x = +(l ?? b), o = e.tone ?? S(e.state), a = g.t(D(e.state));
    let i = null;
    if (e.since !== void 0 && F(e.state)) {
      const t = k(Math.max(0, x - +e.since));
      i = g.t(t.key, t.values);
    }
    const c = /* @__PURE__ */ h(A, { children: [
      /* @__PURE__ */ h("span", { className: "zen-flex zen-flex-col", children: [
        /* @__PURE__ */ n("span", { className: "zen-text-lg zen-font-semibold zen-leading-tight zen-text-zen-foreground", children: e.name }),
        e.line ? (
          // Foreground, not muted: muted-fg is tuned for a plain background
          // and fell to 4.17:1 over the tinted tile in the blue theme.
          /* @__PURE__ */ n("span", { className: "zen-text-xs zen-text-zen-foreground", children: e.line })
        ) : null
      ] }),
      /* @__PURE__ */ n("span", { className: z("zen-text-xl zen-font-bold zen-uppercase zen-tracking-wide zen-leading-tight", v[o]), children: a }),
      e.cause ? /* @__PURE__ */ n("span", { className: "zen-text-sm zen-text-zen-foreground", children: e.cause }) : null,
      i ? /* @__PURE__ */ n("span", { className: z("zen-mt-auto zen-text-3xl zen-font-bold zen-tabular-nums zen-leading-none", v[o]), children: i }) : null
    ] }), m = z(
      "zen-flex zen-h-full zen-w-full zen-min-h-36 zen-flex-col zen-items-start zen-gap-1.5 zen-rounded-zen-md zen-p-4 zen-text-start",
      // The whole frame in the state's colour, over a wash of it: readable at a
      // distance from either cue, and the label says it in words as well.
      "zen-border-2 zen-border-solid",
      j[o],
      r
    );
    return s ? /* @__PURE__ */ n(
      "button",
      {
        ref: f,
        type: "button",
        "data-tone": o,
        className: z(
          m,
          "zen-cursor-pointer hover:zen-brightness-95 focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2"
        ),
        ...d,
        onClick: () => s(e),
        children: c
      }
    ) : /* @__PURE__ */ n("div", { ref: f, "data-tone": o, className: m, ...d, children: c });
  }
);
T.displayName = "AndonTile";
const L = u.forwardRef(
  ({ items: e, lastUpdated: l, staleAfterMs: s, sort: r, now: d, onTileClick: f, label: g, className: b, ...x }, o) => {
    const a = y(), i = M(d === void 0), c = +(d ?? i), m = u.useMemo(() => r ? E(e) : e, [r, e]), t = C(l, c, s ?? R), w = (p) => {
      const N = k(p);
      return a.t(N.key, N.values);
    };
    return /* @__PURE__ */ h(
      "section",
      {
        ref: o,
        "aria-label": g ?? a.t("andon.board"),
        "data-stale": t.stale ? "" : void 0,
        className: z("zen-flex zen-flex-col zen-gap-3", b),
        ...x,
        children: [
          t.stale ? /* @__PURE__ */ n(
            "p",
            {
              role: "status",
              className: "zen-m-0 zen-rounded-zen-md zen-border zen-border-solid zen-border-zen-warning zen-bg-zen-warning-soft zen-px-4 zen-py-3 zen-text-base zen-font-semibold zen-text-zen-warning-soft-fg",
              children: a.t("andon.stale", { age: w(t.ageMs ?? 0) })
            }
          ) : null,
          /* @__PURE__ */ n(
            "ul",
            {
              className: z("zen-m-0 zen-grid zen-list-none zen-gap-3 zen-p-0", t.stale && "zen-grayscale"),
              style: {
                gridTemplateColumns: "repeat(auto-fill, minmax(min(var(--zen-andon-tile-min-width), 100%), 1fr))"
              },
              children: m.map((p) => /* @__PURE__ */ n("li", { className: "zen-m-0", children: /* @__PURE__ */ n(T, { item: p, now: c, onClick: f }) }, p.id))
            }
          ),
          !t.stale && t.ageMs !== null ? /* @__PURE__ */ n("p", { className: "zen-m-0 zen-text-xs zen-text-zen-muted-fg zen-tabular-nums", children: (t.ageMs ?? 0) < 5e3 ? a.t("andon.justNow") : a.t("andon.updated", { age: w(t.ageMs ?? 0) }) }) : null
        ]
      }
    );
  }
);
L.displayName = "AndonBoard";
export {
  L as AndonBoard,
  T as AndonTile
};
//# sourceMappingURL=index121.js.map
