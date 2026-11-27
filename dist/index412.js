import { getTimezoneOffsetInMilliseconds as r } from "./index473.js";
import { normalizeDates as c } from "./index474.js";
import { millisecondsInDay as D } from "./index472.js";
import { startOfDay as a } from "./index435.js";
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
//# sourceMappingURL=index412.js.map
