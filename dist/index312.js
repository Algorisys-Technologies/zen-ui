import { constructFrom as i } from "./index389.js";
import { toDate as n } from "./index390.js";
function s(e, r, o) {
  const t = n(e, o?.in);
  return isNaN(r) ? i(e, NaN) : (r && t.setDate(t.getDate() + r), t);
}
export {
  s as addDays
};
//# sourceMappingURL=index312.js.map
