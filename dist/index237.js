import { untrack as i } from "solid-js";
import { removeInvalidNames as m } from "./index236.js";
function o(e, r = !0) {
  const t = [...i(e.internal.fieldNames.get)];
  return r && m(e, t), t;
}
export {
  o as getFieldNames
};
//# sourceMappingURL=index237.js.map
