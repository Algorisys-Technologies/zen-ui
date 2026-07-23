import { filterNonNullable as d, asArray as m, access as l, handleDiffArray as g, noop as b } from "./index166.js";
import { createEffect as w, onCleanup as M } from "solid-js";
import { isServer as v } from "solid-js/web";
function R(o, n) {
  if (v)
    return { observe: b, unobserve: b };
  const e = new ResizeObserver(o);
  return M(e.disconnect.bind(e)), {
    observe: (t) => e.observe(t, n),
    unobserve: e.unobserve.bind(e)
  };
}
function k(o, n, e) {
  if (v)
    return;
  const t = /* @__PURE__ */ new WeakMap(), { observe: h, unobserve: p } = R((s) => {
    for (const r of s) {
      const { contentRect: i, target: a } = r, f = Math.round(i.width), u = Math.round(i.height), c = t.get(a);
      (!c || c.width !== f || c.height !== u) && (n(i, a, r), t.set(a, { width: f, height: u }));
    }
  }, e);
  w((s) => {
    const r = d(m(l(o)));
    return g(r, s, h, p), r;
  }, []);
}
export {
  k as createResizeObserver,
  R as makeResizeObserver
};
//# sourceMappingURL=index187.js.map
