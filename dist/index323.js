import { constructFrom as i } from "./index393.js";
import { toDate as n } from "./index394.js";
function s(e, r, o) {
  const t = n(e, o?.in);
  return isNaN(r) ? i(e, NaN) : (r && t.setDate(t.getDate() + r), t);
}
export {
  s as addDays
};
//# sourceMappingURL=index323.js.map
