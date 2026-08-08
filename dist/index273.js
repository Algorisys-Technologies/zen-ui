function d(o, n, s, a, e) {
  const { startOfMonth: r, startOfYear: c, endOfYear: f, eachMonthOfInterval: l, getMonth: p } = e;
  return l({
    start: c(o),
    end: f(o)
  }).map((t) => {
    const O = a.formatMonthDropdown(t, e), h = p(t), u = n && t < r(n) || s && t > r(s) || !1;
    return { value: h, label: O, disabled: u };
  });
}
export {
  d as getMonthOptions
};
//# sourceMappingURL=index273.js.map
