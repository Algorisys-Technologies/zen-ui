import { untrack as o } from "solid-js";
import { getFieldAndArrayStores as n } from "./index237.js";
function m(t, r) {
  o(() => {
    t.internal.invalid.set(r || n(t).some((e) => e.active.get() && e.error.get()));
  });
}
export {
  m as updateFormInvalid
};
//# sourceMappingURL=index216.js.map
