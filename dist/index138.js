const u = (n) => typeof n == "number" ? n : n.getTime();
function d(n, o) {
  const t = [...n].map((a) => ({ at: u(a.at), value: a.value })).sort((a, e) => a.at - e.at);
  if (t.length === 0 || o < t[0].at) return 0;
  if (o === t[0].at) return t[0].value;
  for (let a = 1; a < t.length; a++)
    if (o <= t[a].at) {
      const e = t[a - 1], l = t[a];
      return l.at === e.at ? l.value : e.value + (l.value - e.value) * (o - e.at) / (l.at - e.at);
    }
  return t[t.length - 1].value;
}
function b(n, o) {
  let t = null;
  for (const a of n) {
    const e = u(a.at);
    e <= o && (!t || e >= t.at) && (t = { at: e, value: a.value });
  }
  return t?.value ?? 0;
}
function I(n) {
  const o = u(n.start), t = u(n.end), a = u(n.now), e = n.plan ?? [
    { at: o, value: 0 },
    { at: t, value: n.planTotal ?? 0 }
  ], l = e.length ? d(e, Number.POSITIVE_INFINITY) : 0, p = a >= t, s = Math.min(Math.max(a, o), t), f = t > o ? d(e, s) : 0, c = b(n.actual, s), r = c - f, i = (n.tolerance ?? 0.02) * l, g = Math.abs(r) <= i ? "on" : r > 0 ? "ahead" : "behind", v = s - o, h = t - o, m = !p && h > 0 && v >= h * 0.15 ? c + c / v * (t - s) : null;
  return { at: s, planNow: f, actualNow: c, gap: r, status: g, planTotal: l, projected: m, final: p };
}
export {
  d as planAt,
  I as plannedVsActual,
  b as readingAt
};
//# sourceMappingURL=index138.js.map
