import { untrack as o } from "solid-js";
import { getFieldAndArrayStores as i } from "./index237.js";
function a(t, e) {
  o(() => t.internal.dirty.set(e || i(t).some((r) => r.active.get() && r.dirty.get())));
}
export {
  a as updateFormDirty
};
//# sourceMappingURL=index244.js.map
