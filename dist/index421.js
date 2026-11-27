import { millisecondsInWeek as f } from "./index472.js";
import { startOfISOWeek as i } from "./index436.js";
import { startOfISOWeekYear as m } from "./index483.js";
import { toDate as n } from "./index471.js";
function c(e, o) {
  const t = n(e, o?.in), r = +i(t) - +m(t);
  return Math.round(r / f) + 1;
}
export {
  c as getISOWeek
};
//# sourceMappingURL=index421.js.map
