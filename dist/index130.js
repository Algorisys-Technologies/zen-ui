const e = (n) => typeof n == "number" && Number.isFinite(n), p = (...n) => 1e-9 * Math.max(1, ...n.map(Math.abs));
function d(n, i) {
  const u = { verdict: null, side: null, deviation: null };
  if (n === null || !Number.isFinite(n)) return u;
  const { lower: w, upper: r, warnLower: l, warnUpper: s, nominal: o } = i;
  if (!e(w) && !e(r) || e(w) && e(r) && w > r) return u;
  const a = e(o) ? n - o : null, f = (m) => n < m - p(n, m), t = (m) => n > m + p(n, m);
  return e(w) && f(w) ? { verdict: "fail", side: "low", deviation: a } : e(r) && t(r) ? { verdict: "fail", side: "high", deviation: a } : e(l) && f(l) ? { verdict: "warn", side: "low", deviation: a } : e(s) && t(s) ? { verdict: "warn", side: "high", deviation: a } : { verdict: "pass", side: null, deviation: a };
}
function h(n, i) {
  const u = [n.lower, n.upper, n.nominal, n.warnLower, n.warnUpper].filter(e), w = {
    min: 0,
    max: 0,
    lower: null,
    upper: null,
    nominal: null,
    warnLower: null,
    warnUpper: null,
    value: null,
    offScale: !1
  };
  if (u.length === 0) return w;
  let r = Math.min(...u), l = Math.max(...u), s = (l - r) / 4;
  s === 0 && (s = i !== null && Number.isFinite(i) && i !== r ? Math.abs(i - r) * 2 : Math.abs(r) * 0.1 || 1), r -= s, l += s;
  const o = (t) => e(t) ? (t - r) / (l - r) : null;
  let a = null, f = !1;
  if (i !== null && Number.isFinite(i)) {
    const t = (i - r) / (l - r);
    f = t < 0 || t > 1, a = Math.min(1, Math.max(0, t));
  }
  return {
    min: r,
    max: l,
    lower: o(n.lower),
    upper: o(n.upper),
    nominal: o(n.nominal),
    warnLower: o(n.warnLower),
    warnUpper: o(n.warnUpper),
    value: a,
    offScale: f
  };
}
export {
  d as judgeMeasurement,
  h as measurementScale
};
//# sourceMappingURL=index130.js.map
