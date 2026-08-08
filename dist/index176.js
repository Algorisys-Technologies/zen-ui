import * as f from "react";
import { flushSync as R } from "react-dom";
import { Virtualizer as I, elementScroll as b, observeElementOffset as E, observeElementRect as w } from "./index219.js";
import { defaultKeyExtractor as P, defaultRangeExtractor as _, measureElement as k } from "./index219.js";
const g = typeof document < "u" ? f.useLayoutEffect : f.useEffect;
function $({
  useFlushSync: p = !0,
  directDomUpdates: x = !1,
  directDomUpdatesMode: h = "transform",
  ...m
}) {
  const z = f.useReducer((e) => e + 1, 0)[1], i = f.useRef({
    enabled: x,
    mode: h,
    container: null,
    lastSize: null,
    // Keyed by the element itself so a remounted node (same key, new DOM
    // node — e.g. when `enabled` is toggled off then on) is treated as fresh
    // and gets its style written.
    lastPositions: /* @__PURE__ */ new WeakMap(),
    prevRange: null
  });
  i.current.enabled = x, i.current.mode = h;
  const S = (e) => {
    const t = i.current;
    if (!t.enabled || !t.container) return;
    const n = e.getTotalSize();
    if (n !== t.lastSize) {
      t.lastSize = n;
      const d = e.options.horizontal ? "width" : "height";
      t.container.style[d] = `${n}px`;
    }
    const o = !!e.options.horizontal, s = t.mode === "transform", r = o ? "left" : "top", l = e.options.scrollMargin, y = e.getVirtualItems();
    for (const d of y) {
      const c = d.start - l, u = e.elementsCache.get(d.key);
      u && t.lastPositions.get(u) !== c && (t.lastPositions.set(u, c), s ? u.style.transform = o ? `translate3d(${c}px, 0, 0)` : `translate3d(0, ${c}px, 0)` : u.style[r] = `${c}px`);
    }
  }, v = {
    ...m,
    onChange: (e, t) => {
      var n;
      const o = i.current;
      let s = !0;
      if (o.enabled) {
        S(e);
        const r = e.range, l = o.prevRange;
        s = !l || l.isScrolling !== e.isScrolling || l.startIndex !== r?.startIndex || l.endIndex !== r?.endIndex, s && (o.prevRange = r ? {
          startIndex: r.startIndex,
          endIndex: r.endIndex,
          isScrolling: e.isScrolling
        } : null);
      }
      s && (p && t ? R(z) : z()), (n = m.onChange) == null || n.call(m, e, t);
    }
  }, [a] = f.useState(() => {
    const e = new I(v);
    return Object.assign(e, {
      containerRef: (t) => {
        const n = i.current;
        if (n.container = t, n.lastSize = null, t && n.enabled) {
          const o = e.getTotalSize();
          n.lastSize = o;
          const s = e.options.horizontal ? "width" : "height";
          t.style[s] = `${o}px`;
        }
      }
    });
  });
  return a.setOptions(v), g(() => a._didMount(), []), g(() => a._willUpdate()), g(() => {
    S(a);
  }), a;
}
function V(p) {
  return $({
    observeElementRect: w,
    observeElementOffset: E,
    scrollToFn: b,
    ...p
  });
}
export {
  I as Virtualizer,
  P as defaultKeyExtractor,
  _ as defaultRangeExtractor,
  b as elementScroll,
  k as measureElement,
  E as observeElementOffset,
  w as observeElementRect,
  V as useVirtualizer
};
//# sourceMappingURL=index176.js.map
