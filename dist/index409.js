import { getDefaultOptions as k } from "./index399.js";
import { constructFrom as f } from "./index393.js";
import { startOfWeek as l } from "./index353.js";
import { toDate as m } from "./index394.js";
function C(r, e) {
  const s = m(r, e?.in), t = s.getFullYear(), o = k(), i = e?.firstWeekContainsDate ?? e?.locale?.options?.firstWeekContainsDate ?? o.firstWeekContainsDate ?? o.locale?.options?.firstWeekContainsDate ?? 1, a = f(e?.in || r, 0);
  a.setFullYear(t + 1, 0, i), a.setHours(0, 0, 0, 0);
  const c = l(a, e), n = f(e?.in || r, 0);
  n.setFullYear(t, 0, i), n.setHours(0, 0, 0, 0);
  const u = l(n, e);
  return +s >= +c ? t + 1 : +s >= +u ? t : t - 1;
}
export {
  C as getWeekYear
};
//# sourceMappingURL=index409.js.map
