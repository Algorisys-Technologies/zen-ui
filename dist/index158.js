import { createComponent as t, mergeProps as m } from "solid-js/web";
import { useFormControlContext as a } from "./index159.js";
import { Polymorphic as c } from "./index162.js";
import { mergeDefaultProps as p } from "./index164.js";
import { splitProps as f, createEffect as l, onCleanup as d, Show as g } from "solid-js";
function M(n) {
  const r = a(), s = p({
    id: r.generateId("error-message")
  }, n), [i, o] = f(s, ["forceMount"]), e = () => r.validationState() === "invalid";
  return l(() => {
    e() && d(r.registerErrorMessage(o.id));
  }), t(g, {
    get when() {
      return i.forceMount || e();
    },
    get children() {
      return t(c, m({
        as: "div"
      }, () => r.dataset(), o));
    }
  });
}
export {
  M as FormControlErrorMessage
};
//# sourceMappingURL=index158.js.map
