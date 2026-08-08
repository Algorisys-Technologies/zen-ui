import * as r from "react";
import { createContextScope as y } from "./index195.js";
import { useComposedRefs as M } from "./index192.js";
import { createSlot as x } from "./index150.js";
import { jsx as u } from "react/jsx-runtime";
function D(s) {
  const m = s + "CollectionProvider", [A, N] = y(m), [E, f] = A(
    m,
    { collectionRef: { current: null }, itemMap: /* @__PURE__ */ new Map() }
  ), p = (c) => {
    const { scope: e, children: l } = c, o = r.useRef(null), t = r.useRef(/* @__PURE__ */ new Map()).current;
    return /* @__PURE__ */ u(E, { scope: e, itemMap: t, collectionRef: o, children: l });
  };
  p.displayName = m;
  const a = s + "CollectionSlot", T = x(a), C = r.forwardRef(
    (c, e) => {
      const { scope: l, children: o } = c, t = f(a, l), n = M(e, t.collectionRef);
      return /* @__PURE__ */ u(T, { ref: n, children: o });
    }
  );
  C.displayName = a;
  const d = s + "CollectionItemSlot", R = "data-radix-collection-item", O = x(d), I = r.forwardRef(
    (c, e) => {
      const { scope: l, children: o, ...t } = c, n = r.useRef(null), S = M(e, n), i = f(d, l);
      return r.useEffect(() => (i.itemMap.set(n, { ref: n, ...t }), () => {
        i.itemMap.delete(n);
      })), /* @__PURE__ */ u(O, { [R]: "", ref: S, children: o });
    }
  );
  I.displayName = d;
  function _(c) {
    const e = f(s + "CollectionConsumer", c);
    return r.useCallback(() => {
      const o = e.collectionRef.current;
      if (!o) return [];
      const t = Array.from(o.querySelectorAll(`[${R}]`));
      return Array.from(e.itemMap.values()).sort(
        (i, v) => t.indexOf(i.ref.current) - t.indexOf(v.ref.current)
      );
    }, [e.collectionRef, e.itemMap]);
  }
  return [
    { Provider: p, Slot: C, ItemSlot: I },
    _,
    N
  ];
}
export {
  D as createCollection
};
//# sourceMappingURL=index209.js.map
