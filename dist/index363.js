function c(i, t, e, s) {
  if (e.disableNavigation)
    return;
  const { pagedNavigation: r, numberOfMonths: d } = e, { startOfMonth: u, addMonths: f, differenceInCalendarMonths: a } = s, o = r ? d ?? 1 : 1, n = u(i);
  if (!t)
    return f(n, -o);
  if (!(a(n, t) <= 0))
    return f(n, -o);
}
export {
  c as getPreviousMonth
};
//# sourceMappingURL=index363.js.map
