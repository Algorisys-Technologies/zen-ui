import { getFieldStore as a } from "./index215.js";
import { getPathValue as p } from "./index239.js";
import { createSignal as t } from "./index213.js";
function h(e, i) {
  if (!a(e, i)) {
    const n = p(i, e.internal.initialValues), l = t([]), s = t(n), r = t(n), o = t(n), c = t(""), d = t(!1), u = t(!1), f = t(!1);
    e.internal.fields[i] = {
      // Signals
      elements: l,
      initialValue: s,
      startValue: r,
      value: o,
      error: c,
      active: d,
      touched: u,
      dirty: f,
      // Other
      validate: [],
      validateOn: void 0,
      revalidateOn: void 0,
      transform: [],
      consumers: /* @__PURE__ */ new Set()
    }, e.internal.fieldNames.set((v) => [...v, i]);
  }
  return a(e, i);
}
export {
  h as initializeFieldStore
};
//# sourceMappingURL=index221.js.map
