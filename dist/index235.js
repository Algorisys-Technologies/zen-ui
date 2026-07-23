import { untrack as a } from "solid-js";
import { removeInvalidNames as i } from "./index236.js";
function o(r, t = !0) {
  const e = [...a(r.internal.fieldArrayNames.get)];
  return t && i(r, e), e;
}
export {
  o as getFieldArrayNames
};
//# sourceMappingURL=index235.js.map
