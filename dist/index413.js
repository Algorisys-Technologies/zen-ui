import { normalizeDates as i } from "./index474.js";
function s(n, r, o) {
  const [e, t] = i(
    o?.in,
    n,
    r
  ), a = e.getFullYear() - t.getFullYear(), f = e.getMonth() - t.getMonth();
  return a * 12 + f;
}
export {
  s as differenceInCalendarMonths
};
//# sourceMappingURL=index413.js.map
