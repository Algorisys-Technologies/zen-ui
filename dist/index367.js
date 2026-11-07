import { getTimezoneOffsetInMilliseconds as r } from "./index432.js";
import { normalizeDates as c } from "./index433.js";
import { millisecondsInDay as D } from "./index431.js";
import { startOfDay as a } from "./index390.js";
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
//# sourceMappingURL=index367.js.map
