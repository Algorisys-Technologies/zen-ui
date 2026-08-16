import { jsx as a } from "react/jsx-runtime";
import * as o from "react";
import { useVirtualizer as z } from "./index178.js";
import { cn as R } from "./index145.js";
const S = (e) => e.totalCount !== void 0;
function w(e) {
  const { estimateSize: s = 36, maxHeight: h = 280, overscan: g = 6, className: x } = e, r = S(e), y = r ? e.totalCount : e.items.length, l = o.useRef(null), u = z({
    count: y,
    getScrollElement: () => l.current,
    estimateSize: typeof s == "function" ? s : () => s,
    overscan: g
  }), i = u.getVirtualItems(), m = r ? e.onVisibleRange : void 0, c = o.useRef(m);
  c.current = m;
  const d = o.useRef("");
  return o.useLayoutEffect(() => {
    if (!i.length || !c.current) return;
    const t = i[0].index, n = i[i.length - 1].index, f = `${t}:${n}`;
    f !== d.current && (d.current = f, c.current(t, n));
  }, [i]), /* @__PURE__ */ a(
    "div",
    {
      ref: l,
      className: R("zen-overflow-y-auto", x),
      style: { maxHeight: h },
      children: /* @__PURE__ */ a(
        "div",
        {
          style: {
            height: u.getTotalSize(),
            position: "relative",
            width: "100%"
          },
          children: i.map((t) => {
            const n = r ? e.getItem(t.index) : e.items[t.index];
            return /* @__PURE__ */ a(
              "div",
              {
                style: {
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${t.start}px)`,
                  height: t.size
                },
                children: r ? e.children({ item: n, index: t.index }) : e.children({ item: n, index: t.index })
              },
              !r && e.getKey && n !== void 0 ? e.getKey(n, t.index) : t.key
            );
          })
        }
      )
    }
  );
}
export {
  w as VirtualizedItems
};
//# sourceMappingURL=index125.js.map
