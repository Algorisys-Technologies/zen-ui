import { untrack as i } from "solid-js";
import { removeInvalidNames as m } from "./index239.js";
function o(e, r = !0) {
  const t = [...i(e.internal.fieldNames.get)];
  return r && m(e, t), t;
}
export {
  o as getFieldNames
};
//# sourceMappingURL=index240.js.map
