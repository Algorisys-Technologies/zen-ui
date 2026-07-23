import { useFormControlContext as l } from "./index159.js";
import { mergeDefaultProps as o } from "./index164.js";
import { createEffect as t, onCleanup as d } from "solid-js";
import { access as r } from "./index166.js";
var n = ["id", "aria-label", "aria-labelledby", "aria-describedby"];
function f(i) {
  const a = l(), e = o({
    id: a.generateId("field")
  }, i);
  return t(() => d(a.registerField(r(e.id)))), {
    fieldProps: {
      id: () => r(e.id),
      ariaLabel: () => r(e["aria-label"]),
      ariaLabelledBy: () => a.getAriaLabelledBy(r(e.id), r(e["aria-label"]), r(e["aria-labelledby"])),
      ariaDescribedBy: () => a.getAriaDescribedBy(r(e["aria-describedby"]))
    }
  };
}
export {
  n as FORM_CONTROL_FIELD_PROP_NAMES,
  f as createFormControlField
};
//# sourceMappingURL=index201.js.map
