import { getDefaultOptions as c } from "./index395.js";
import { toDate as f } from "./index390.js";
function k(s, e) {
  const o = c(), a = e?.weekStartsOn ?? e?.locale?.options?.weekStartsOn ?? o.weekStartsOn ?? o.locale?.options?.weekStartsOn ?? 0, t = f(s, e?.in), n = t.getDay(), r = (n < a ? 7 : 0) + n - a;
  return t.setDate(t.getDate() - r), t.setHours(0, 0, 0, 0), t;
}
export {
  k as startOfWeek
};
//# sourceMappingURL=index342.js.map
