import { millisecondsInWeek as f } from "./index431.js";
import { startOfISOWeek as i } from "./index391.js";
import { startOfISOWeekYear as m } from "./index442.js";
import { toDate as n } from "./index430.js";
function c(e, o) {
  const t = n(e, o?.in), r = +i(t) - +m(t);
  return Math.round(r / f) + 1;
}
export {
  c as getISOWeek
};
//# sourceMappingURL=index376.js.map
