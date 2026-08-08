import { normalizeDates as i } from "./index397.js";
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
//# sourceMappingURL=index328.js.map
