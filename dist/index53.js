import { jsx as v } from "react/jsx-runtime";
import * as n from "react";
import { FLEXIBLE_COLUMN_ORDER as M, resolveFlexibleColumns as F, flexibleColumnsForWidth as N } from "./index182.js";
import { cn as R } from "./index160.js";
const _ = {
  full: "zen-basis-full",
  "2/3": "zen-basis-2/3",
  "1/2": "zen-basis-1/2",
  "1/3": "zen-basis-1/3",
  "1/4": "zen-basis-1/4"
}, A = M, y = N;
function I(s, i, u) {
  return F(s, i, u).map((r) => ({ name: r.name, basis: _[r.share] }));
}
const U = "zen-flex zen-h-full zen-min-h-0 zen-w-full zen-overflow-hidden", W = "zen-flex zen-h-full zen-min-h-0 zen-min-w-0 zen-shrink zen-grow-0 zen-flex-col zen-overflow-y-auto zen-overflow-x-hidden zen-transition-all zen-duration-200 zen-ease-out", k = n.forwardRef(
  ({ layout: s = "OneColumn", onLayoutChange: i, startColumn: u, midColumn: r, endColumn: d, className: L, ...O }, c) => {
    const z = n.useRef(null), [l, S] = n.useState(3);
    n.useLayoutEffect(() => {
      const e = z.current;
      if (!e || typeof ResizeObserver > "u") return;
      const t = () => {
        const f = e.offsetWidth;
        f && S(y(f));
      };
      t();
      const o = new ResizeObserver(t);
      return o.observe(e), () => o.disconnect();
    }, []);
    const b = u != null, h = r != null, x = d != null, m = n.useMemo(
      () => ({ start: b, mid: h, end: x }),
      [b, h, x]
    ), a = n.useMemo(
      () => I(s, l, m),
      [s, l, m]
    ), C = n.useMemo(
      () => ({ layout: s, maxColumnsCount: l, visibleColumns: a.map((e) => e.name) }),
      [s, l, a]
    ), p = n.useRef(i);
    n.useEffect(() => {
      p.current = i;
    }), n.useEffect(() => {
      p.current?.(C);
    }, [C]);
    const w = {
      start: u,
      mid: r,
      end: d
    }, E = (e) => {
      if (!m[e]) return null;
      const t = a.findIndex((f) => f.name === e), o = t > -1;
      return /* @__PURE__ */ v(
        "div",
        {
          "data-column": e,
          "data-visible": o ? "true" : "false",
          className: R(
            W,
            // `zen-hidden` rather than unmounting: a hidden column keeps its
            // scroll position and its state for when navigation comes back to
            // it, and display:none takes it out of the accessibility tree.
            o ? a[t].basis : "zen-hidden",
            // Separator on every visible column but the first, so the layout
            // never opens or closes with a stray edge.
            o && t > 0 ? "zen-border-l zen-border-zen-border" : null
          ),
          children: w[e]
        },
        e
      );
    };
    return /* @__PURE__ */ v(
      "div",
      {
        ref: (e) => {
          z.current = e, typeof c == "function" ? c(e) : c && (c.current = e);
        },
        "data-layout": s,
        "data-max-columns": l,
        className: R(U, L),
        ...O,
        children: A.map(E)
      }
    );
  }
);
k.displayName = "FlexibleColumnLayout";
export {
  k as FlexibleColumnLayout
};
//# sourceMappingURL=index53.js.map
