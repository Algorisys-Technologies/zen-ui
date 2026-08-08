const a = [300, 60], i = (n, t) => Math.max(0, n - t), d = (n) => {
  const t = Math.max(0, Math.ceil(n / 1e3)), r = Math.floor(t / 3600), c = Math.floor(t % 3600 / 60), e = t % 60, o = (s) => String(s).padStart(2, "0");
  return r > 0 ? `${r}:${o(c)}:${o(e)}` : `${o(c)}:${o(e)}`;
}, l = (n, t = a) => {
  if (n <= 0) return "expired";
  const r = n / 1e3, [c, e] = t;
  return e !== void 0 && r <= e ? "critical" : c !== void 0 && r <= c ? "warning" : "normal";
}, f = (n, t, r = a) => {
  if (t >= n) return [];
  const c = n / 1e3, e = t / 1e3;
  return r.filter((o) => c > o && e <= o).sort((o, s) => s - o);
};
export {
  a as DEFAULT_COUNTDOWN_THRESHOLDS,
  l as countdownLevel,
  f as crossedThresholds,
  d as formatCountdown,
  i as remainingMs
};
//# sourceMappingURL=index120.js.map
