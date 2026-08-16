import { defaultDateLib as p } from "./index256.js";
import { dateMatchModifiers as s } from "./index344.js";
import { rangeContainsDayOfWeek as M } from "./index361.js";
import { rangeIncludesDate as l } from "./index276.js";
import { rangeOverlaps as y } from "./index363.js";
import { isDatesArray as a, isDateRange as A, isDayOfWeekType as C, isDateInterval as I, isDateAfterType as v, isDateBeforeType as F } from "./index278.js";
function d(n, t, f = p) {
  const e = Array.isArray(t) ? t : [t];
  if (e.filter((o) => typeof o != "function").some((o) => typeof o == "boolean" ? o : f.isDate(o) ? l(n, o, !1, f) : a(o, f) ? o.some((r) => l(n, r, !1, f)) : A(o) ? o.from && o.to ? y(n, { from: o.from, to: o.to }, f) : !1 : C(o) ? M(n, o.dayOfWeek, f) : I(o) ? f.isAfter(o.before, o.after) ? y(n, {
    from: f.addDays(o.after, 1),
    to: f.addDays(o.before, -1)
  }, f) : s(n.from, o, f) || s(n.to, o, f) : v(o) || F(o) ? s(n.from, o, f) || s(n.to, o, f) : !1))
    return !0;
  const i = e.filter((o) => typeof o == "function");
  if (i.length) {
    let o = n.from;
    const r = f.differenceInCalendarDays(n.to, n.from);
    for (let u = 0; u <= r; u++) {
      if (i.some((D) => D(o)))
        return !0;
      o = f.addDays(o, 1);
    }
  }
  return !1;
}
export {
  d as rangeContainsModifiers
};
//# sourceMappingURL=index362.js.map
