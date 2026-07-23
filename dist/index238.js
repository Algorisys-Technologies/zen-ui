import { untrack as a } from "solid-js";
import { removeInvalidNames as i } from "./index239.js";
function o(r, t = !0) {
  const e = [...a(r.internal.fieldArrayNames.get)];
  return t && i(r, e), e;
}
export {
  o as getFieldArrayNames
};
//# sourceMappingURL=index238.js.map
