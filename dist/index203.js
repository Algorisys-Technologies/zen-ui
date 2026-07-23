function o(e, n, t) {
  const s = [...e];
  return s[t] = n, s.sort((r, a) => r - a);
}
function i(e, n) {
  if (e.length === 1) return 0;
  const t = e.map((a) => Math.abs(a - n)), s = Math.min(...t), r = t.indexOf(s);
  return n < e[r] ? r : t.lastIndexOf(s);
}
function c(e) {
  return e.slice(0, -1).map((n, t) => e[t + 1] - n);
}
function l(e, n) {
  if (n > 0) {
    const t = c(e);
    return Math.min(...t) >= n;
  }
  return !0;
}
function f(e, n) {
  return (t) => {
    if (e[0] === e[1] || n[0] === n[1]) return n[0];
    const s = (n[1] - n[0]) / (e[1] - e[0]);
    return n[0] + s * (t - e[0]);
  };
}
function u(e) {
  e.preventDefault(), e.stopPropagation();
}
export {
  i as getClosestValueIndex,
  o as getNextSortedValues,
  l as hasMinStepsBetweenValues,
  f as linearScale,
  u as stopEventDefaultAndPropagation
};
//# sourceMappingURL=index203.js.map
