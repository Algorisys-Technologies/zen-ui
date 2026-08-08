function j(r, n, I, W) {
  const s = r[0], o = r[r.length - 1], { ISOWeek: c, fixedWeeks: u, broadcastCalendar: a } = I ?? {}, { addDays: i, differenceInCalendarDays: M, differenceInCalendarMonths: C, endOfBroadcastWeek: O, endOfISOWeek: k, endOfMonth: h, endOfWeek: l, isAfter: E, startOfBroadcastWeek: F, startOfISOWeek: S, startOfWeek: p } = W, g = a ? F(s, W) : c ? S(s) : p(s), D = a ? O(o) : c ? k(h(o)) : l(h(o)), f = n && (a ? O(n) : c ? k(n) : l(n)), x = f && E(D, f) ? f : D, A = M(x, g), B = C(o, s) + 1, e = [];
  for (let t = 0; t <= A; t++) {
    const d = i(g, t);
    e.push(d);
  }
  const y = (a ? 35 : 42) * B;
  if (u && e.length < y) {
    const t = y - e.length;
    for (let d = 0; d < t; d++) {
      const T = i(e[e.length - 1], 1);
      e.push(T);
    }
  }
  return e;
}
export {
  j as getDates
};
//# sourceMappingURL=index356.js.map
