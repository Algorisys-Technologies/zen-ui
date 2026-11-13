import { constructFrom as n } from "./index467.js";
import { toDate as i } from "./index468.js";
function s(t, o, e) {
  const r = i(t, e?.in);
  return isNaN(+r) ? n(t, NaN) : (r.setFullYear(o), r);
}
export {
  s as setYear
};
//# sourceMappingURL=index429.js.map
