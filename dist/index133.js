const u = [
  "var(--zen-color-primary)",
  "var(--zen-color-info)",
  "var(--zen-color-success)",
  "var(--zen-color-warning)",
  "var(--zen-color-error)",
  "var(--zen-color-neutral)"
], g = (t, n, l, a = u) => {
  const s = t.map((e) => {
    const r = e[l], o = typeof r == "number" && Number.isFinite(r) ? r : Number(r);
    return {
      label: String(e[n] ?? ""),
      value: Number.isFinite(o) ? o : 0
    };
  }).filter((e) => e.value >= 0), i = s.reduce((e, r) => e + r.value, 0);
  let c = 0;
  return s.map((e, r) => {
    const o = i > 0 ? e.value / i : 0, b = c, v = c + o * 360;
    return c = v, {
      label: e.label,
      value: e.value,
      percent: o,
      color: a[r % a.length] ?? u[r % u.length],
      startAngle: b,
      endAngle: v
    };
  });
}, m = (t) => {
  const n = t * 100;
  return `${Number.isInteger(n) ? n : Math.round(n * 10) / 10}%`;
}, p = (t, n = "Pie chart") => {
  if (!t.length) return `${n}: no data`;
  const l = t.map((a) => `${a.label} ${m(a.percent)}`);
  return `${n}: ${l.join(", ")}`;
};
export {
  u as CHART_PALETTE,
  p as describeSlices,
  m as formatPercent,
  g as toSlices
};
//# sourceMappingURL=index133.js.map
