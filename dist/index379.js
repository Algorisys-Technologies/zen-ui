import { millisecondsInWeek as f } from "./index431.js";
import { startOfWeek as m } from "./index393.js";
import { startOfWeekYear as i } from "./index444.js";
import { toDate as n } from "./index430.js";
function s(r, t) {
  const e = n(r, t?.in), o = +m(e, t) - +i(e, t);
  return Math.round(o / f) + 1;
}
export {
  s as getWeek
};
//# sourceMappingURL=index379.js.map
