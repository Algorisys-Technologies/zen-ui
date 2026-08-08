function h(n, t, e, s) {
  if (e.disableNavigation)
    return;
  const { pagedNavigation: u, numberOfMonths: f = 1 } = e, { startOfMonth: a, addMonths: o, differenceInCalendarMonths: d } = s, i = u ? f : 1, r = a(n);
  if (!t)
    return o(r, i);
  if (!(d(t, n) < f))
    return o(r, i);
}
export {
  h as getNextMonth
};
//# sourceMappingURL=index362.js.map
