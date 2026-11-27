import { machineStateTone as x, MACHINE_STATES as N } from "./index116.js";
const c = (i) => typeof i == "number" ? i : i.getTime();
function I(i, s) {
  const t = c(s.from), e = c(s.to), a = c(s.now ?? Date.now()), n = e - t, l = Math.min(e, a);
  if (!(n > 0) || l <= t) return [];
  const f = i.map((o, r) => ({ s: o, i: r, start: c(o.start) })).sort((o, r) => o.start - r.start || o.i - r.i), M = (o, r, k) => ({
    ...k,
    start: o,
    end: r,
    durationMs: r - o,
    left: (o - t) / n,
    width: (r - o) / n
  }), T = (o, r) => M(o, r, { id: `gap-${o}`, state: "unknown", tone: "unknown", gap: !0, open: !1 }), u = [];
  let p = t;
  return f.forEach(({ s: o, i: r, start: k }, E) => {
    const v = o.end == null;
    let m = v ? a : c(o.end);
    const y = f[E + 1];
    y && y.start < m && (m = y.start);
    const g = Math.max(k, t, p);
    m = Math.min(m, l), m > g && (g > p && u.push(T(p, g)), u.push(
      M(g, m, {
        id: o.id ?? `seg-${r}`,
        state: o.state,
        tone: o.tone ?? x(o.state),
        label: o.label,
        gap: !1,
        open: v && m === a
      })
    ), p = m);
  }), p < l && u.push(T(p, l)), u;
}
function w(i) {
  const s = /* @__PURE__ */ new Map();
  for (const t of i) s.set(t.state, (s.get(t.state) ?? 0) + t.durationMs);
  return N.filter((t) => (s.get(t) ?? 0) > 0).map((t) => ({ state: t, ms: s.get(t) }));
}
function C(i, s) {
  const t = c(s.from), e = c(s.to), a = e - t;
  return a > 0 ? i.map((n) => ({ id: n.id, label: n.label, at: c(n.at) })).filter((n) => n.at >= t && n.at <= e).sort((n, l) => n.at - l.at).map((n) => ({ ...n, left: (n.at - t) / a })) : [];
}
const h = 6e4, d = 60 * h, b = [h, 5 * h, 10 * h, 15 * h, 30 * h, d, 2 * d, 3 * d, 6 * d, 12 * d, 24 * d], S = /* @__PURE__ */ new Map();
function O(i, s) {
  const t = s ?? "";
  let e = S.get(t);
  e || (e = new Intl.DateTimeFormat("en-GB", { timeZone: s, hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }), S.set(t, e));
  const a = Object.fromEntries(e.formatToParts(i).map((n) => [n.type, n.value]));
  return ((Number(a.hour) * 60 + Number(a.minute)) * 60 + Number(a.second)) * 1e3 + i % 1e3;
}
function D(i, s, t = {}) {
  const e = c(i), a = c(s), n = a - e, l = t.maxTicks ?? 8;
  if (!(n > 0)) return { stepMs: 0, ticks: [] };
  const f = b.find((u) => n / u <= l) ?? b[b.length - 1], M = O(e, t.timeZone) % f, T = [];
  for (let u = M === 0 ? e : e + (f - M); u <= a; u += f)
    T.push({ at: u, left: (u - e) / n });
  return { stepMs: f, ticks: T };
}
function A(i) {
  const s = Math.max(0, Math.floor(i / 1e3)), t = Math.floor(s / 3600), e = Math.floor(s % 3600 / 60), a = s % 60;
  return t > 0 ? e > 0 ? { key: "stateTimeline.durationHours", values: { h: t, m: e } } : { key: "stateTimeline.durationHoursOnly", values: { h: t } } : e > 0 ? a > 0 ? { key: "stateTimeline.durationMinutes", values: { m: e, s: a } } : { key: "stateTimeline.durationMinutesOnly", values: { m: e } } : { key: "stateTimeline.durationSeconds", values: { s: a } };
}
export {
  A as durationMessage,
  I as layoutStateTimeline,
  C as layoutTimelineEvents,
  w as stateTimelineTotals,
  D as timelineTicks
};
//# sourceMappingURL=index120.js.map
