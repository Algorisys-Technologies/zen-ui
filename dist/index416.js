import { millisecondsInWeek as f } from "./index469.js";
import { startOfISOWeek as i } from "./index431.js";
import { startOfISOWeekYear as m } from "./index480.js";
import { toDate as n } from "./index468.js";
function c(e, o) {
  const t = n(e, o?.in), r = +i(t) - +m(t);
  return Math.round(r / f) + 1;
}
export {
  c as getISOWeek
};
//# sourceMappingURL=index416.js.map
