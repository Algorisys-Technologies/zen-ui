import { getDefaultOptions as c } from "./index399.js";
import { toDate as f } from "./index394.js";
function k(s, e) {
  const n = c(), o = e?.weekStartsOn ?? e?.locale?.options?.weekStartsOn ?? n.weekStartsOn ?? n.locale?.options?.weekStartsOn ?? 0, t = f(s, e?.in), a = t.getDay(), r = (a < o ? -7 : 0) + 6 - (a - o);
  return t.setDate(t.getDate() + r), t.setHours(23, 59, 59, 999), t;
}
export {
  k as endOfWeek
};
//# sourceMappingURL=index333.js.map
