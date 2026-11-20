import { constructFrom as i } from "./index470.js";
import { toDate as n } from "./index471.js";
function s(e, r, o) {
  const t = n(e, o?.in);
  return isNaN(r) ? i(e, NaN) : (r && t.setDate(t.getDate() + r), t);
}
export {
  s as addDays
};
//# sourceMappingURL=index406.js.map
