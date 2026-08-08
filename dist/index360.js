import { CalendarDay as F } from "./index318.js";
import { CalendarWeek as N } from "./index320.js";
import { CalendarMonth as P } from "./index319.js";
function j(l, f, e, c) {
  const { addDays: y, endOfBroadcastWeek: D, endOfISOWeek: h, endOfMonth: k, endOfWeek: C, getISOWeek: I, getWeek: M, startOfBroadcastWeek: S, startOfISOWeek: g, startOfWeek: w } = c, o = l.reduce((W, t) => {
    const x = e.broadcastCalendar ? S(t, c) : e.ISOWeek ? g(t) : w(t), d = e.broadcastCalendar ? D(t) : e.ISOWeek ? h(k(t)) : C(k(t)), a = f.filter((r) => r >= x && r <= d), O = e.broadcastCalendar ? 35 : 42;
    if (e.fixedWeeks && a.length < O) {
      const r = f.filter((n) => {
        const s = O - a.length;
        return n > d && n <= y(d, s);
      });
      a.push(...r);
    }
    const b = a.reduce((r, n) => {
      const s = e.ISOWeek ? I(n) : M(n), i = r.find((B) => B.weekNumber === s), u = new F(n, t, c);
      return i ? i.days.push(u) : r.push(new N(s, [u])), r;
    }, []), v = new P(t, b);
    return W.push(v), W;
  }, []);
  return e.reverseMonths ? o.reverse() : o;
}
export {
  j as getMonths
};
//# sourceMappingURL=index360.js.map
