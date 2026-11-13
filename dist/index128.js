const a = (o) => Number.isFinite(o) && o > 0 ? o : 0;
function m(o) {
  const t = a(o.target), n = a(o.good), e = a(o.scrap);
  let r = t > 0 ? n / t : 0, s = t > 0 ? e / t : 0;
  const c = r + s;
  return c > 1 && (r /= c, s /= c), {
    target: t,
    good: n,
    scrap: e,
    remaining: Math.max(0, t - n),
    over: Math.max(0, n - t),
    done: t > 0 && n >= t,
    started: n + e > 0,
    goodFraction: r,
    scrapFraction: s
  };
}
function g(o, t, n) {
  const e = Math.max(0, Math.floor(a(n))), r = a(t), s = a(o);
  return Array.from({ length: e }, (c, i) => r > 0 ? Math.min(1, Math.max(0, (s - i * r) / r)) : 0);
}
export {
  m as productionProgress,
  g as segmentFill
};
//# sourceMappingURL=index128.js.map
