function a(c) {
  const e = [];
  return c.reduce((s, t) => {
    const n = t.weeks.reduce((r, i) => r.concat(i.days.slice()), e.slice());
    return s.concat(n.slice());
  }, e.slice());
}
export {
  a as getDays
};
//# sourceMappingURL=index357.js.map
