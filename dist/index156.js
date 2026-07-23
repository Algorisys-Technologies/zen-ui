import { createComponent as i, mergeProps as s, memo as c } from "solid-js/web";
import { useFormControlContext as g } from "./index159.js";
import { createTagName as d } from "./index169.js";
import { Polymorphic as u } from "./index162.js";
import { mergeDefaultProps as b } from "./index164.js";
import { splitProps as C, createEffect as P, onCleanup as x } from "solid-js";
import { mergeRefs as h } from "./index167.js";
function E(m) {
  let r;
  const e = g(), a = b({
    id: e.generateId("label")
  }, m), [f, o] = C(a, ["ref"]), l = d(() => r, () => "label");
  return P(() => x(e.registerLabel(o.id))), i(u, s({
    as: "label",
    ref(n) {
      var t = h((p) => r = p, f.ref);
      typeof t == "function" && t(n);
    },
    get for() {
      return c(() => l() === "label")() ? e.fieldId() : void 0;
    }
  }, () => e.dataset(), o));
}
export {
  E as FormControlLabel
};
//# sourceMappingURL=index156.js.map
