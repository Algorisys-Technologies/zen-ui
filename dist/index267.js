function p(e, r, s, t, f = !1) {
  if (!e || !r)
    return;
  const { startOfYear: o, endOfYear: i, eachYearOfInterval: l, getYear: u } = t, Y = o(e), c = i(r), a = l({ start: Y, end: c });
  return f && a.reverse(), a.map((n) => {
    const d = s.formatYearDropdown(n, t);
    return {
      value: u(n),
      label: d,
      disabled: !1
    };
  });
}
export {
  p as getYearOptions
};
//# sourceMappingURL=index267.js.map
