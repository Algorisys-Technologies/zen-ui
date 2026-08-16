import { defaultDateLib as A } from "./index256.js";
import { rangeIncludesDate as p } from "./index276.js";
import { isDatesArray as a, isDateRange as I, isDayOfWeekType as g, isDateInterval as k, isDateAfterType as O, isDateBeforeType as W } from "./index278.js";
function b(f, n, r = A) {
  const t = Array.isArray(n) ? n : [n], { isSameDay: o, differenceInCalendarDays: i, isAfter: D } = r;
  return t.some((e) => {
    if (typeof e == "boolean")
      return e;
    if (r.isDate(e))
      return o(f, e);
    if (a(e, r))
      return e.some((s) => o(f, s));
    if (I(e))
      return p(e, f, !1, r);
    if (g(e))
      return Array.isArray(e.dayOfWeek) ? e.dayOfWeek.includes(f.getDay()) : e.dayOfWeek === f.getDay();
    if (k(e)) {
      const s = i(e.before, f), l = i(e.after, f), y = s > 0, u = l < 0;
      return D(e.before, e.after) ? u && y : y || u;
    }
    return O(e) ? i(f, e.after) > 0 : W(e) ? i(e.before, f) > 0 : typeof e == "function" ? e(f) : !1;
  });
}
export {
  b as dateMatchModifiers
};
//# sourceMappingURL=index344.js.map
