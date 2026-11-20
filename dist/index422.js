import { millisecondsInWeek as f } from "./index472.js";
import { startOfWeek as m } from "./index436.js";
import { startOfWeekYear as i } from "./index485.js";
import { toDate as n } from "./index471.js";
function s(r, t) {
  const e = n(r, t?.in), o = +m(e, t) - +i(e, t);
  return Math.round(o / f) + 1;
}
export {
  s as getWeek
};
//# sourceMappingURL=index422.js.map
