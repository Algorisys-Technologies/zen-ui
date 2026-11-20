function l(e) {
  const r = [], n = [];
  for (const o of e)
    o.hidden || (o.align === "end" ? n : r).push(o);
  return { start: r, end: n };
}
function p(e, r, n, o) {
  if (!(n > 0)) return [];
  const a = e.filter((t) => !t.hidden), f = (t) => t.reduce((i, d) => i + (r[d.id] ?? 0), 0) + o * Math.max(0, t.length - 1), u = a.map((t, i) => ({ it: t, i })).sort((t, i) => (t.it.priority ?? 0) - (i.it.priority ?? 0) || i.i - t.i).map((t) => t.it), c = [];
  let s = a;
  for (const t of u) {
    if (f(s) <= n) break;
    c.push(t.id), s = s.filter((i) => i !== t);
  }
  return c;
}
export {
  p as statusBarCollapse,
  l as statusBarSides
};
//# sourceMappingURL=index136.js.map
