function g(d, s, k, t, f, O, n) {
  const { ISOWeek: o, broadcastCalendar: r } = O, { addDays: W, addMonths: c, addWeeks: l, addYears: u, endOfBroadcastWeek: b, endOfISOWeek: m, endOfWeek: y, max: F, min: I, startOfBroadcastWeek: h, startOfISOWeek: x, startOfWeek: B } = n;
  let a = {
    day: W,
    week: l,
    month: c,
    year: u,
    startOfWeek: (e) => r ? h(e, n) : o ? x(e) : B(e),
    endOfWeek: (e) => r ? b(e) : o ? m(e) : y(e)
  }[d](k, s === "after" ? 1 : -1);
  return s === "before" && t ? a = F([t, a]) : s === "after" && f && (a = I([f, a])), a;
}
export {
  g as getFocusableDate
};
//# sourceMappingURL=index381.js.map
