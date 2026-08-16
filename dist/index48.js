import { jsx as M } from "react/jsx-runtime";
import * as t from "react";
import { cn as S } from "./index145.js";
const F = 300, w = ["start", "mid", "end"], I = {
  OneColumn: { start: "zen-basis-full" },
  TwoColumnsBeginExpanded: { start: "zen-basis-2/3", mid: "zen-basis-1/3" },
  TwoColumnsMidExpanded: { start: "zen-basis-1/3", mid: "zen-basis-2/3" },
  ThreeColumnsMidExpanded: { start: "zen-basis-1/4", mid: "zen-basis-1/2", end: "zen-basis-1/4" },
  ThreeColumnsEndExpanded: { start: "zen-basis-1/4", mid: "zen-basis-1/4", end: "zen-basis-1/2" },
  MidColumnFullScreen: { mid: "zen-basis-full" },
  EndColumnFullScreen: { end: "zen-basis-full" }
}, L = {
  OneColumn: { start: "zen-basis-full" },
  TwoColumnsBeginExpanded: { start: "zen-basis-2/3", mid: "zen-basis-1/3" },
  TwoColumnsMidExpanded: { start: "zen-basis-1/3", mid: "zen-basis-2/3" },
  ThreeColumnsMidExpanded: { mid: "zen-basis-2/3", end: "zen-basis-1/3" },
  ThreeColumnsEndExpanded: { mid: "zen-basis-1/3", end: "zen-basis-2/3" },
  MidColumnFullScreen: { mid: "zen-basis-full" },
  EndColumnFullScreen: { end: "zen-basis-full" }
};
function N(n) {
  return Math.min(3, Math.max(1, Math.floor(n / F)));
}
function _(n, r, u) {
  const a = r === 2 ? L[n] : I[n], i = w.filter((s) => a[s] && u[s]).map((s) => ({
    name: s,
    basis: a[s]
  }));
  if (r === 1) {
    const s = i[i.length - 1];
    return s ? [{ name: s.name, basis: "zen-basis-full" }] : [];
  }
  return i;
}
const D = "zen-flex zen-h-full zen-min-h-0 zen-w-full zen-overflow-hidden", U = "zen-flex zen-h-full zen-min-h-0 zen-min-w-0 zen-shrink zen-grow-0 zen-flex-col zen-overflow-y-auto zen-overflow-x-hidden zen-transition-all zen-duration-200 zen-ease-out", W = t.forwardRef(
  ({ layout: n = "OneColumn", onLayoutChange: r, startColumn: u, midColumn: a, endColumn: i, className: s, ...v }, c) => {
    const b = t.useRef(null), [d, O] = t.useState(3);
    t.useLayoutEffect(() => {
      const e = b.current;
      if (!e || typeof ResizeObserver > "u") return;
      const o = () => {
        const z = e.offsetWidth;
        z && O(N(z));
      };
      o();
      const l = new ResizeObserver(o);
      return l.observe(e), () => l.disconnect();
    }, []);
    const h = u != null, C = a != null, x = i != null, f = t.useMemo(
      () => ({ start: h, mid: C, end: x }),
      [h, C, x]
    ), m = t.useMemo(
      () => _(n, d, f),
      [n, d, f]
    ), E = t.useMemo(
      () => ({ layout: n, maxColumnsCount: d, visibleColumns: m.map((e) => e.name) }),
      [n, d, m]
    ), p = t.useRef(r);
    t.useEffect(() => {
      p.current = r;
    }), t.useEffect(() => {
      p.current?.(E);
    }, [E]);
    const R = {
      start: u,
      mid: a,
      end: i
    }, T = (e) => {
      if (!f[e]) return null;
      const o = m.findIndex((z) => z.name === e), l = o > -1;
      return /* @__PURE__ */ M(
        "div",
        {
          "data-column": e,
          "data-visible": l ? "true" : "false",
          className: S(
            U,
            // `zen-hidden` rather than unmounting: a hidden column keeps its
            // scroll position and its state for when navigation comes back to
            // it, and display:none takes it out of the accessibility tree.
            l ? m[o].basis : "zen-hidden",
            // Separator on every visible column but the first, so the layout
            // never opens or closes with a stray edge.
            l && o > 0 ? "zen-border-l zen-border-zen-border" : null
          ),
          children: R[e]
        },
        e
      );
    };
    return /* @__PURE__ */ M(
      "div",
      {
        ref: (e) => {
          b.current = e, typeof c == "function" ? c(e) : c && (c.current = e);
        },
        "data-layout": n,
        "data-max-columns": d,
        className: S(D, s),
        ...v,
        children: w.map(T)
      }
    );
  }
);
W.displayName = "FlexibleColumnLayout";
export {
  W as FlexibleColumnLayout
};
//# sourceMappingURL=index48.js.map
