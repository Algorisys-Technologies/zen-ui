import { elementScroll as d, observeElementOffset as f, observeElementRect as p, Virtualizer as z } from "./index150.js";
import { defaultKeyExtractor as R, defaultRangeExtractor as b, measureElement as M } from "./index150.js";
import { mergeProps as n, createSignal as S, onMount as v, onCleanup as V, createComputed as x } from "solid-js";
import { createStore as w, reconcile as E } from "solid-js/store";
function I(t) {
  const a = n(t), o = new z(a), [u, s] = w(o.getVirtualItems()), [c, m] = S(o.getTotalSize()), g = {
    get(e, l) {
      switch (l) {
        case "getVirtualItems":
          return () => u;
        case "getTotalSize":
          return () => c();
        default:
          return Reflect.get(e, l);
      }
    }
  }, r = new Proxy(o, g);
  return r.setOptions(a), v(() => {
    const e = r._didMount();
    r._willUpdate(), V(e);
  }), x(() => {
    r.setOptions(n(a, t, {
      onChange: (e, l) => {
        var i;
        e._willUpdate(), s(E(e.getVirtualItems(), {
          key: "index"
        })), m(e.getTotalSize()), (i = t.onChange) == null || i.call(t, e, l);
      }
    })), r.measure();
  }), r;
}
function O(t) {
  return I(n({
    observeElementRect: p,
    observeElementOffset: f,
    scrollToFn: d
  }, t));
}
export {
  z as Virtualizer,
  O as createVirtualizer,
  R as defaultKeyExtractor,
  b as defaultRangeExtractor,
  d as elementScroll,
  M as measureElement,
  f as observeElementOffset,
  p as observeElementRect
};
//# sourceMappingURL=index136.js.map
