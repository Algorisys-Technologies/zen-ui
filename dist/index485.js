import { getDefaultOptions as n } from "./index476.js";
import { constructFrom as i } from "./index470.js";
import { getWeekYear as f } from "./index486.js";
import { startOfWeek as c } from "./index438.js";
function D(r, t) {
  const o = n(), s = t?.firstWeekContainsDate ?? t?.locale?.options?.firstWeekContainsDate ?? o.firstWeekContainsDate ?? o.locale?.options?.firstWeekContainsDate ?? 1, a = f(r, t), e = i(t?.in || r, 0);
  return e.setFullYear(a, 0, s), e.setHours(0, 0, 0, 0), c(e, t);
}
export {
  D as startOfWeekYear
};
//# sourceMappingURL=index485.js.map
