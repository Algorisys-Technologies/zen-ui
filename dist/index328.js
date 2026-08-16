import { millisecondsInWeek as f } from "./index391.js";
import { startOfWeek as m } from "./index342.js";
import { startOfWeekYear as i } from "./index404.js";
import { toDate as n } from "./index390.js";
function s(r, t) {
  const e = n(r, t?.in), o = +m(e, t) - +i(e, t);
  return Math.round(o / f) + 1;
}
export {
  s as getWeek
};
//# sourceMappingURL=index328.js.map
