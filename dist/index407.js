import { getTimezoneOffsetInMilliseconds as r } from "./index470.js";
import { normalizeDates as c } from "./index471.js";
import { millisecondsInDay as D } from "./index469.js";
import { startOfDay as a } from "./index430.js";
function u(o, n, i) {
  const [m, s] = c(
    i?.in,
    o,
    n
  ), t = a(m), e = a(s), f = +t - r(t), l = +e - r(e);
  return Math.round((f - l) / D);
}
export {
  u as differenceInCalendarDays
};
//# sourceMappingURL=index407.js.map
