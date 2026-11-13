import { constructFrom as i } from "./index467.js";
import { toDate as n } from "./index468.js";
function s(e, r, o) {
  const t = n(e, o?.in);
  return isNaN(r) ? i(e, NaN) : (r && t.setDate(t.getDate() + r), t);
}
export {
  s as addDays
};
//# sourceMappingURL=index403.js.map
