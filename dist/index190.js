import { createControllableArraySignal as C } from "./index174.js";
import { mergeDefaultProps as g, getDocument as D, addItemToArray as I } from "./index160.js";
import { createEffect as l, onCleanup as f, useContext as h, createContext as p, createComponent as O } from "solid-js";
import { access as P } from "./index178.js";
var m = p();
function E() {
  return h(m);
}
function v() {
  const e = E();
  if (e === void 0)
    throw new Error("[kobalte]: `useDomCollectionContext` must be used within a `DomCollectionProvider` component");
  return e;
}
function a(e, o) {
  return !!(o.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_PRECEDING);
}
function b(e, o) {
  const t = o.ref();
  if (!t)
    return -1;
  let n = e.length;
  if (!n)
    return -1;
  for (; n--; ) {
    const c = e[n]?.ref();
    if (c && a(c, t))
      return n + 1;
  }
  return 0;
}
function x(e) {
  const o = e.map((n, c) => [c, n]);
  let t = !1;
  return o.sort(([n, c], [r, i]) => {
    const s = c.ref(), u = i.ref();
    return s === u || !s || !u ? 0 : a(s, u) ? (n > r && (t = !0), -1) : (n < r && (t = !0), 1);
  }), t ? o.map(([n, c]) => c) : e;
}
function d(e, o) {
  const t = x(e);
  e !== t && o(t);
}
function w(e) {
  const o = e[0], t = e[e.length - 1]?.ref();
  let n = o?.ref()?.parentElement;
  for (; n; ) {
    if (t && n.contains(t))
      return n;
    n = n.parentElement;
  }
  return D(n).body;
}
function T(e, o) {
  l(() => {
    const t = setTimeout(() => {
      d(e(), o);
    });
    f(() => clearTimeout(t));
  });
}
function M(e, o) {
  if (typeof IntersectionObserver != "function") {
    T(e, o);
    return;
  }
  let t = [];
  l(() => {
    const n = () => {
      const i = !!t.length;
      t = e(), i && d(e(), o);
    }, c = w(e()), r = new IntersectionObserver(n, {
      root: c
    });
    for (const i of e()) {
      const s = i.ref();
      s && r.observe(s);
    }
    f(() => r.disconnect());
  });
}
function S(e = {}) {
  const [o, t] = C({
    value: () => P(e.items),
    onChange: (r) => e.onItemsChange?.(r)
  });
  M(o, t);
  const n = (r) => (t((i) => {
    const s = b(i, r);
    return I(i, r, s);
  }), () => {
    t((i) => {
      const s = i.filter((u) => u.ref() !== r.ref());
      return i.length === s.length ? i : s;
    });
  });
  return {
    DomCollectionProvider: (r) => O(m.Provider, {
      value: {
        registerItem: n
      },
      get children() {
        return r.children;
      }
    })
  };
}
function _(e) {
  const o = v(), t = g({
    shouldRegisterItem: !0
  }, e);
  l(() => {
    if (!t.shouldRegisterItem)
      return;
    const n = o.registerItem(t.getItem());
    f(n);
  });
}
export {
  m as DomCollectionContext,
  S as createDomCollection,
  _ as createDomCollectionItem,
  v as useDomCollectionContext,
  E as useOptionalDomCollectionContext
};
//# sourceMappingURL=index190.js.map
