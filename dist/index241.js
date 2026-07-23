import { untrack as o } from "solid-js";
import { getFieldAndArrayStores as i } from "./index234.js";
function a(t, e) {
  o(() => t.internal.dirty.set(e || i(t).some((r) => r.active.get() && r.dirty.get())));
}
export {
  a as updateFormDirty
};
//# sourceMappingURL=index241.js.map
