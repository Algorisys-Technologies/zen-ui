import { DayFlag as e } from "./index269.js";
import { dateMatchModifiers as u } from "./index344.js";
function V(b, S, h, M, a) {
  const { disabled: m, hidden: p, modifiers: r, showOutsideDays: y, broadcastCalendar: B, today: g = a.today() } = S, { isSameDay: v, isSameMonth: A, startOfMonth: E, isBefore: F, endOfMonth: j, isAfter: k } = a, O = h && E(h), D = M && j(M), i = {
    [e.focused]: [],
    [e.outside]: [],
    [e.disabled]: [],
    [e.hidden]: [],
    [e.today]: []
  }, d = {};
  for (const s of b) {
    const { date: o, displayMonth: n } = s, t = !!(n && !A(o, n)), f = !!(O && F(o, O)), l = !!(D && k(o, D)), w = !!(m && u(o, m, a)), x = !!(p && u(o, p, a)) || f || l || // Broadcast calendar will show outside days as default
    !B && !y && t || B && y === !1 && t, C = v(o, g);
    t && i.outside.push(s), w && i.disabled.push(s), x && i.hidden.push(s), C && i.today.push(s), r && Object.keys(r).forEach((c) => {
      const N = r?.[c];
      N && u(o, N, a) && (d[c] ? d[c].push(s) : d[c] = [s]);
    });
  }
  return (s) => {
    const o = {
      [e.focused]: !1,
      [e.disabled]: !1,
      [e.hidden]: !1,
      [e.outside]: !1,
      [e.today]: !1
    }, n = {};
    for (const t in i) {
      const f = i[t];
      o[t] = f.some((l) => l === s);
    }
    for (const t in d)
      n[t] = d[t].some((f) => f === s);
    return {
      ...o,
      // custom modifiers should override all the previous ones
      ...n
    };
  };
}
export {
  V as createGetModifiers
};
//# sourceMappingURL=index257.js.map
