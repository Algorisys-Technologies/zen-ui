var r = (t, n) => {
  if (t.contains(n)) return !0;
  let e = n;
  for (; e; ) {
    if (e === t) return !0;
    e = e._$host ?? e.parentElement;
  }
  return !1;
};
export {
  r as contains
};
//# sourceMappingURL=index224.js.map
