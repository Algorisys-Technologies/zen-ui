import { MACHINE_STATES as M } from "./index116.js";
const c = (e) => typeof e == "number" ? e : e.getTime();
function g(e) {
  const l = c(e.from), u = c(e.to), s = c(e.now);
  if (!(e.bucketMs > 0) || !(u > l)) return [];
  const a = e.readings.map((t) => ({ at: c(t.at), value: t.value })).sort((t, o) => t.at - o.at), m = (t) => {
    let o = null;
    for (const n of a) n.at <= t && (o = n.value);
    return o;
  }, f = [];
  for (let t = l; t < u && t < s; t += e.bucketMs) {
    const o = Math.min(t + e.bucketMs, u), n = Math.min(o, s);
    let i = m(t), p = 0;
    for (const r of a)
      r.at <= t || r.at > n || (i !== null && (p += r.value >= i ? r.value - i : r.value), i = r.value);
    const v = n - t;
    f.push({
      start: t,
      end: o,
      count: p,
      perHour: v > 0 ? p / v * 36e5 : 0,
      state: b(e.segments ?? [], t, n, s),
      partial: s < o
    });
  }
  return f;
}
function b(e, l, u, s) {
  const a = /* @__PURE__ */ new Map();
  for (const t of e) {
    const o = Math.max(c(t.start), l), n = Math.min(t.end == null ? s : c(t.end), u);
    n > o && a.set(t.state, (a.get(t.state) ?? 0) + (n - o));
  }
  let m = "unknown", f = 0;
  for (const t of M) {
    const o = a.get(t) ?? 0;
    o > f && (f = o, m = t);
  }
  return m;
}
export {
  g as rateBuckets
};
//# sourceMappingURL=index140.js.map
