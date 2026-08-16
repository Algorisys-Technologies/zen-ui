import { useEffect as D, useMemo as S } from "react";
import { getDates as N } from "./index345.js";
import { getDays as w } from "./index346.js";
import { getDisplayMonths as E } from "./index347.js";
import { getInitialMonth as c } from "./index348.js";
import { getMonths as b } from "./index349.js";
import { getNavMonths as q } from "./index350.js";
import { getNextMonth as F } from "./index351.js";
import { getPreviousMonth as P } from "./index352.js";
import { getWeeks as V } from "./index353.js";
import { useControlledValue as Z } from "./index354.js";
function _(e, n) {
  const [s, a] = q(e, n), { startOfMonth: i, endOfMonth: g } = n, h = c(e, s, a, n), [m, f] = Z(
    h,
    // initialMonth is always computed from props.month if provided
    e.month ? h : void 0
  );
  D(() => {
    const t = c(e, s, a, n);
    f(t);
  }, [e.timeZone]);
  const { months: l, weeks: M, days: u, previousMonth: k, nextMonth: v } = S(() => {
    const t = E(m, a, { numberOfMonths: e.numberOfMonths }, n), o = N(t, e.endMonth ? g(e.endMonth) : void 0, {
      ISOWeek: e.ISOWeek,
      fixedWeeks: e.fixedWeeks,
      broadcastCalendar: e.broadcastCalendar
    }, n), r = b(t, o, {
      broadcastCalendar: e.broadcastCalendar,
      fixedWeeks: e.fixedWeeks,
      ISOWeek: e.ISOWeek,
      reverseMonths: e.reverseMonths
    }, n), C = V(r), y = w(r), I = P(m, s, e, n), T = F(m, a, e, n);
    return {
      months: r,
      weeks: C,
      days: y,
      previousMonth: I,
      nextMonth: T
    };
  }, [
    n,
    m.getTime(),
    a?.getTime(),
    s?.getTime(),
    e.disableNavigation,
    e.broadcastCalendar,
    e.endMonth?.getTime(),
    e.fixedWeeks,
    e.ISOWeek,
    e.numberOfMonths,
    e.pagedNavigation,
    e.reverseMonths
  ]), { disableNavigation: W, onMonthChange: O } = e, x = (t) => M.some((o) => o.days.some((r) => r.isEqualTo(t))), d = (t) => {
    if (W)
      return;
    let o = i(t);
    s && o < i(s) && (o = i(s)), a && o > i(a) && (o = i(a)), f(o), O?.(o);
  };
  return {
    months: l,
    weeks: M,
    days: u,
    navStart: s,
    navEnd: a,
    previousMonth: k,
    nextMonth: v,
    goToMonth: d,
    goToDay: (t) => {
      x(t) || d(t.date);
    }
  };
}
export {
  _ as useCalendar
};
//# sourceMappingURL=index271.js.map
