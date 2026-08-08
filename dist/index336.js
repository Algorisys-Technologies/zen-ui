import { millisecondsInWeek as f } from "./index395.js";
import { startOfISOWeek as i } from "./index351.js";
import { startOfISOWeekYear as m } from "./index406.js";
import { toDate as n } from "./index394.js";
function c(e, o) {
  const t = n(e, o?.in), r = +i(t) - +m(t);
  return Math.round(r / f) + 1;
}
export {
  c as getISOWeek
};
//# sourceMappingURL=index336.js.map
