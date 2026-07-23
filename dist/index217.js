import { untrack as c } from "solid-js";
import { getFieldArrayNames as l } from "./index235.js";
import { getFieldNames as m } from "./index237.js";
function F(o, t, a) {
  return c(() => {
    const n = m(o, a), s = l(o, a);
    return typeof t == "string" || Array.isArray(t) ? (typeof t == "string" ? [t] : t).reduce((e, i) => {
      const [d, f] = e;
      return s.includes(i) ? (s.forEach((r) => {
        r.startsWith(i) && f.add(r);
      }), n.forEach((r) => {
        r.startsWith(i) && d.add(r);
      })) : d.add(i), e;
    }, [/* @__PURE__ */ new Set(), /* @__PURE__ */ new Set()]).map((e) => [...e]) : [n, s];
  });
}
export {
  F as getFilteredNames
};
//# sourceMappingURL=index217.js.map
