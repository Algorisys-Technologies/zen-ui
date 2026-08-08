import { millisecondsInWeek as f } from "./index395.js";
import { startOfWeek as m } from "./index353.js";
import { startOfWeekYear as i } from "./index408.js";
import { toDate as n } from "./index394.js";
function s(r, t) {
  const e = n(r, t?.in), o = +m(e, t) - +i(e, t);
  return Math.round(o / f) + 1;
}
export {
  s as getWeek
};
//# sourceMappingURL=index339.js.map
