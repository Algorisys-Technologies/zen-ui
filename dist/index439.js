import { isDate as r } from "./index382.js";
import { toDate as i } from "./index430.js";
function e(o) {
  return !(!r(o) && typeof o != "number" || isNaN(+i(o)));
}
export {
  e as isValid
};
//# sourceMappingURL=index439.js.map
