import { TZDate as c } from "./index314.js";
import "./index316.js";
import { differenceInCalendarMonths as h } from "./index328.js";
import { differenceInCalendarDays as O } from "./index327.js";
import { getISOWeek as k } from "./index336.js";
import { getWeek as w } from "./index339.js";
function W(o, D = {}) {
  const { weekStartsOn: d, locale: g } = D, l = d ?? g?.options?.weekStartsOn ?? 0, r = (t) => {
    const e = typeof t == "number" || typeof t == "string" ? new Date(t) : t;
    return new c(e.getFullYear(), e.getMonth(), e.getDate(), 12, 0, 0, o);
  }, u = (t) => {
    const e = r(t);
    return new Date(e.getFullYear(), e.getMonth(), e.getDate(), 0, 0, 0, 0);
  };
  return {
    today: () => r(c.tz(o)),
    newDate: (t, e, n) => new c(t, e, n, 12, 0, 0, o),
    startOfDay: (t) => r(t),
    startOfWeek: (t, e) => {
      const n = r(t), a = e?.weekStartsOn ?? l, s = (n.getDay() - a + 7) % 7;
      return n.setDate(n.getDate() - s), n;
    },
    startOfISOWeek: (t) => {
      const e = r(t), n = (e.getDay() - 1 + 7) % 7;
      return e.setDate(e.getDate() - n), e;
    },
    startOfMonth: (t) => {
      const e = r(t);
      return e.setDate(1), e;
    },
    startOfYear: (t) => {
      const e = r(t);
      return e.setMonth(0, 1), e;
    },
    endOfWeek: (t, e) => {
      const n = r(t), f = (((e?.weekStartsOn ?? l) + 6) % 7 - n.getDay() + 7) % 7;
      return n.setDate(n.getDate() + f), n;
    },
    endOfISOWeek: (t) => {
      const e = r(t), n = (7 - e.getDay()) % 7;
      return e.setDate(e.getDate() + n), e;
    },
    endOfMonth: (t) => {
      const e = r(t);
      return e.setMonth(e.getMonth() + 1, 0), e;
    },
    endOfYear: (t) => {
      const e = r(t);
      return e.setMonth(11, 31), e;
    },
    eachMonthOfInterval: (t) => {
      const e = r(t.start), n = r(t.end), a = [], s = new c(e.getFullYear(), e.getMonth(), 1, 12, 0, 0, o), f = n.getFullYear() * 12 + n.getMonth();
      for (; s.getFullYear() * 12 + s.getMonth() <= f; )
        a.push(new c(s, o)), s.setMonth(s.getMonth() + 1, 1);
      return a;
    },
    // Normalize to noon once before arithmetic (avoid DST/midnight edge cases),
    // mutate the same TZDate, and return it.
    addDays: (t, e) => {
      const n = r(t);
      return n.setDate(n.getDate() + e), n;
    },
    addWeeks: (t, e) => {
      const n = r(t);
      return n.setDate(n.getDate() + e * 7), n;
    },
    addMonths: (t, e) => {
      const n = r(t);
      return n.setMonth(n.getMonth() + e), n;
    },
    addYears: (t, e) => {
      const n = r(t);
      return n.setFullYear(n.getFullYear() + e), n;
    },
    eachYearOfInterval: (t) => {
      const e = r(t.start), n = r(t.end), a = [], s = new c(e.getFullYear(), 0, 1, 12, 0, 0, o);
      for (; s.getFullYear() <= n.getFullYear(); )
        a.push(new c(s, o)), s.setFullYear(s.getFullYear() + 1, 0, 1);
      return a;
    },
    getWeek: (t, e) => {
      const n = u(t);
      return w(n, {
        weekStartsOn: e?.weekStartsOn ?? l,
        firstWeekContainsDate: e?.firstWeekContainsDate ?? g?.options?.firstWeekContainsDate ?? 1
      });
    },
    getISOWeek: (t) => {
      const e = u(t);
      return k(e);
    },
    differenceInCalendarDays: (t, e) => {
      const n = u(t), a = u(e);
      return O(n, a);
    },
    differenceInCalendarMonths: (t, e) => {
      const n = u(t), a = u(e);
      return h(n, a);
    }
  };
}
export {
  W as createNoonOverrides
};
//# sourceMappingURL=index277.js.map
