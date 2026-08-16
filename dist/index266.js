function y(t, o, a, n) {
  const s = n ?? t.today(), c = a ? t.startOfBroadcastWeek(s, t) : o ? t.startOfISOWeek(s) : t.startOfWeek(s), r = [];
  for (let e = 0; e < 7; e++) {
    const f = t.addDays(c, e);
    r.push(f);
  }
  return r;
}
export {
  y as getWeekdays
};
//# sourceMappingURL=index266.js.map
