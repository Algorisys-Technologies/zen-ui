import { createMemo as I, onCleanup as v, $TRACK as x, untrack as A, createRoot as m, createSignal as g } from "solid-js";
import { isServer as w } from "solid-js/web";
const k = /* @__PURE__ */ Symbol("fallback");
function y(c) {
  for (const f of c)
    f.dispose();
}
function K(c, f, i, d = {}) {
  if (w) {
    const t = c();
    let l = [];
    if (t && t.length)
      for (let o = 0, u = t.length; o < u; o++)
        l.push(i(() => t[o], () => o));
    else d.fallback && (l = [d.fallback()]);
    return () => l;
  }
  const n = /* @__PURE__ */ new Map();
  return v(() => y(n.values())), () => {
    const t = c() || [];
    return t[x], A(() => {
      if (!t.length)
        return y(n.values()), n.clear(), d.fallback ? [m((s) => (n.set(k, { dispose: s }), d.fallback()))] : [];
      const l = new Array(t.length), o = n.get(k);
      if (!n.size || o) {
        o?.dispose(), n.delete(k);
        for (let e = 0; e < t.length; e++) {
          const s = t[e], a = f(s, e);
          b(l, s, e, a);
        }
        return l;
      }
      const u = new Set(n.keys());
      for (let e = 0; e < t.length; e++) {
        const s = t[e], a = f(s, e);
        u.delete(a);
        const r = n.get(a);
        r ? (l[e] = r.mapped, r.setIndex?.(e), r.setItem(() => s)) : b(l, s, e, a);
      }
      for (const e of u)
        n.get(e)?.dispose(), n.delete(e);
      return l;
    });
  };
  function b(t, l, o, u) {
    m((e) => {
      const [s, a] = g(l), r = { setItem: a, dispose: e };
      if (i.length > 1) {
        const [h, p] = g(o);
        r.setIndex = p, r.mapped = i(s, h);
      } else
        r.mapped = i(s);
      n.set(u, r), t[o] = r.mapped;
    });
  }
}
function R(c) {
  const { by: f } = c;
  return I(K(() => c.each, typeof f == "function" ? f : (i) => i[f], c.children, "fallback" in c ? { fallback: () => c.fallback } : void 0));
}
export {
  R as Key,
  K as keyArray
};
//# sourceMappingURL=index180.js.map
