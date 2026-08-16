function c(n, r) {
  let { startMonth: t, endMonth: a } = n;
  const { startOfYear: f, startOfDay: o, startOfMonth: s, endOfMonth: i, addYears: y, endOfYear: h, today: e } = r, d = n.captionLayout === "dropdown" || n.captionLayout === "dropdown-years";
  return t ? t = s(t) : !t && d && (t = f(y(n.today ?? e(), -100))), a ? a = i(a) : !a && d && (a = h(n.today ?? e())), [
    t && o(t),
    a && o(a)
  ];
}
export {
  c as getNavMonths
};
//# sourceMappingURL=index350.js.map
