import { millisecondsInWeek as f } from "./index469.js";
import { startOfWeek as m } from "./index433.js";
import { startOfWeekYear as i } from "./index482.js";
import { toDate as n } from "./index468.js";
function s(r, t) {
  const e = n(r, t?.in), o = +m(e, t) - +i(e, t);
  return Math.round(o / f) + 1;
}
export {
  s as getWeek
};
//# sourceMappingURL=index419.js.map
