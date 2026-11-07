import { getDefaultOptions as n } from "./index435.js";
import { constructFrom as i } from "./index429.js";
import { getWeekYear as f } from "./index445.js";
import { startOfWeek as c } from "./index393.js";
function D(r, t) {
  const o = n(), s = t?.firstWeekContainsDate ?? t?.locale?.options?.firstWeekContainsDate ?? o.firstWeekContainsDate ?? o.locale?.options?.firstWeekContainsDate ?? 1, a = f(r, t), e = i(t?.in || r, 0);
  return e.setFullYear(a, 0, s), e.setHours(0, 0, 0, 0), c(e, t);
}
export {
  D as startOfWeekYear
};
//# sourceMappingURL=index444.js.map
