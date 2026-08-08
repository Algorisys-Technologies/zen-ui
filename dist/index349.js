import { constructFrom as n } from "./index393.js";
import { toDate as i } from "./index394.js";
function s(t, o, e) {
  const r = i(t, e?.in);
  return isNaN(+r) ? n(t, NaN) : (r.setFullYear(o), r);
}
export {
  s as setYear
};
//# sourceMappingURL=index349.js.map
