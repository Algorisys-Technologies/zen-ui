import { untrack as e } from "solid-js";
import { getFieldStore as r } from "./index215.js";
function c(o, t) {
  e(() => r(o, t)?.elements.get()[0]?.focus());
}
export {
  c as focus
};
//# sourceMappingURL=index214.js.map
