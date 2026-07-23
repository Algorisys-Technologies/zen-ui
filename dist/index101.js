const b = [
  "var(--zen-color-primary)",
  "var(--zen-color-info)",
  "var(--zen-color-success)",
  "var(--zen-color-warning)",
  "var(--zen-color-error)",
  "var(--zen-color-neutral)"
], g = ($, a, o, t = b) => {
  const e = $.map((n) => {
    const s = n[o], l = typeof s == "number" && Number.isFinite(s) ? s : Number(s);
    return {
      label: String(n[a] ?? ""),
      value: Number.isFinite(l) ? l : 0
    };
  }).filter((n) => n.value >= 0), u = e.reduce((n, s) => n + s.value, 0);
  let m = 0;
  return e.map((n, s) => {
    const l = u > 0 ? n.value / u : 0, f = m, v = m + l * 360;
    return m = v, {
      label: n.label,
      value: n.value,
      percent: l,
      color: t[s % t.length] ?? b[s % b.length],
      startAngle: f,
      endAngle: v
    };
  });
}, p = ($, a, o, t) => {
  const e = t * Math.PI / 180;
  return [$ + o * Math.sin(e), a - o * Math.cos(e)];
}, c = ($) => Math.round($ * 1e3) / 1e3, H = ($, a, o, t, e, u) => {
  const m = u - e;
  if (m <= 0) return "";
  if (m >= 359.999) {
    const M = e + 180, i = p($, a, o, e).map(c), r = p($, a, o, M).map(c);
    if (t <= 0)
      return `M ${i[0]} ${i[1]} A ${o} ${o} 0 1 1 ${r[0]} ${r[1]} A ${o} ${o} 0 1 1 ${i[0]} ${i[1]} Z`;
    const h = p($, a, t, e).map(c), d = p($, a, t, M).map(c);
    return `M ${i[0]} ${i[1]} A ${o} ${o} 0 1 1 ${r[0]} ${r[1]} A ${o} ${o} 0 1 1 ${i[0]} ${i[1]} Z M ${h[0]} ${h[1]} A ${t} ${t} 0 1 0 ${d[0]} ${d[1]} A ${t} ${t} 0 1 0 ${h[0]} ${h[1]} Z`;
  }
  const n = m > 180 ? 1 : 0, [s, l] = p($, a, o, e).map(c), [f, v] = p($, a, o, u).map(c);
  if (t <= 0)
    return `M ${c($)} ${c(a)} L ${s} ${l} A ${o} ${o} 0 ${n} 1 ${f} ${v} Z`;
  const [A, z] = p($, a, t, u).map(c), [P, Z] = p($, a, t, e).map(c);
  return `M ${s} ${l} A ${o} ${o} 0 ${n} 1 ${f} ${v} L ${A} ${z} A ${t} ${t} 0 ${n} 0 ${P} ${Z} Z`;
}, N = ($) => {
  const a = $ * 100;
  return `${Number.isInteger(a) ? a : Math.round(a * 10) / 10}%`;
}, L = ($, a = "Pie chart") => {
  if (!$.length) return `${a}: no data`;
  const o = $.map((t) => `${t.label} ${N(t.percent)}`);
  return `${a}: ${o.join(", ")}`;
};
export {
  b as CHART_PALETTE,
  H as arcPath,
  L as describeSlices,
  N as formatPercent,
  p as polarPoint,
  g as toSlices
};
//# sourceMappingURL=index101.js.map
