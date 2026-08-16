function u(i, o, n, e) {
  const { month: s, defaultMonth: M, today: c = e.today(), numberOfMonths: f = 1 } = i;
  let t = s || M || c;
  const { differenceInCalendarMonths: h, addMonths: l, startOfMonth: r } = e;
  if (n && h(n, t) < f - 1) {
    const d = -1 * (f - 1);
    t = l(n, d);
  }
  return o && h(t, o) < 0 && (t = o), r(t);
}
export {
  u as getInitialMonth
};
//# sourceMappingURL=index348.js.map
