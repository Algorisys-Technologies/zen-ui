import { access as i } from "./index223.js";
import { createEffect as s, onCleanup as f } from "solid-js";
var l = /* @__PURE__ */ new Map(), m = (e) => {
  s(() => {
    const c = i(e.style) ?? {}, y = i(e.properties) ?? [], r = {};
    for (const t in c)
      r[t] = e.element.style[t];
    const a = l.get(e.key);
    a ? a.activeCount++ : l.set(e.key, {
      activeCount: 1,
      originalStyles: r,
      properties: y.map((t) => t.key)
    }), Object.assign(e.element.style, e.style);
    for (const t of y)
      e.element.style.setProperty(t.key, t.value);
    f(() => {
      const t = l.get(e.key);
      if (t) {
        if (t.activeCount !== 1) {
          t.activeCount--;
          return;
        }
        l.delete(e.key);
        for (const [n, o] of Object.entries(t.originalStyles))
          e.element.style[n] = o;
        for (const n of t.properties)
          e.element.style.removeProperty(n);
        e.element.style.length === 0 && e.element.removeAttribute("style"), e.cleanup?.();
      }
    });
  });
}, k = m;
export {
  k as default
};
//# sourceMappingURL=index225.js.map
