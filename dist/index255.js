const p = (e) => new Date(e.getFullYear(), e.getMonth(), e.getDate(), 0, 0, 0, 0), c = (e, n) => new Date(e.getFullYear(), e.getMonth(), e.getDate() + n, 0, 0, 0, 0), y = (e, n) => e.getFullYear() === n.getFullYear() && e.getMonth() === n.getMonth() && e.getDate() === n.getDate(), M = (e) => String(e).padStart(2, "0"), D = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
function F(e) {
  const n = e.getDay(), t = n === 0 ? 6 : n - 1;
  return c(e, -t);
}
function Y(e) {
  return new Date(e.getFullYear(), e.getMonth(), 1, 0, 0, 0, 0);
}
function k(e, n) {
  if (e === "day") {
    const a = p(n);
    return { start: a, end: c(a, 1) };
  }
  if (e === "week") {
    const a = F(n);
    return { start: a, end: c(a, 7) };
  }
  const t = Y(n);
  return { start: t, end: new Date(t.getFullYear(), t.getMonth() + 1, 1, 0, 0, 0, 0) };
}
function H(e, n, t) {
  if (e === "day") return c(n, t);
  if (e === "week") return c(F(n), t * 7);
  const a = Y(n);
  return new Date(a.getFullYear(), a.getMonth() + t, 1, 0, 0, 0, 0);
}
function b(e, n, t = {}) {
  const a = t.now ?? /* @__PURE__ */ new Date(), r = t.nonWorkingDays ?? [0, 6], o = [];
  if (e === "day") {
    const s = t.hourStep && t.hourStep > 0 ? t.hourStep : 1, u = t.dayStartHour ?? 0, $ = t.dayEndHour ?? 24, [h, f] = t.workingHours ?? [9, 18], T = new Date(n.getFullYear(), n.getMonth(), n.getDate(), u, 0, 0, 0), m = new Date(n.getFullYear(), n.getMonth(), n.getDate(), $, 0, 0, 0).getTime();
    for (let i = T.getTime(); i < m; i += s * 36e5) {
      const g = new Date(i), S = new Date(Math.min(i + s * 36e5, m)), w = g.getHours() + g.getMinutes() / 60;
      o.push({
        start: g,
        end: S,
        label: `${M(g.getHours())}:${M(g.getMinutes())}`,
        sublabel: "",
        nonWorking: w < h || w >= f,
        // Every column of a day view is "today" or none of them is, so the flag
        // would paint the whole row. It marks the column containing `now`, which
        // is the only reading that says anything.
        today: y(g, a) && a.getTime() >= g.getTime() && a.getTime() < S.getTime()
      });
    }
    return o;
  }
  const { start: l, end: d } = k(e, n);
  for (let s = l; s.getTime() < d.getTime(); s = c(s, 1)) {
    const u = c(s, 1);
    o.push({
      start: s,
      end: u,
      label: e === "week" ? `${D[s.getDay()]} ${s.getDate()}` : String(s.getDate()),
      sublabel: e === "month" ? D[s.getDay()] : "",
      nonWorking: r.includes(s.getDay()),
      today: y(s, a)
    });
  }
  return o;
}
function E(e, n) {
  const { start: t, end: a } = k(e, n), r = (o) => o.toLocaleString(void 0, { month: "long" });
  if (e === "day")
    return `${D[t.getDay()]} ${t.getDate()} ${r(t)} ${t.getFullYear()}`;
  if (e === "week") {
    const o = new Date(a.getTime() - 864e5);
    return `${t.getFullYear() === o.getFullYear() ? t.getMonth() === o.getMonth() ? `${t.getDate()}` : `${t.getDate()} ${r(t)}` : `${t.getDate()} ${r(t)} ${t.getFullYear()}`} – ${o.getDate()} ${r(o)} ${o.getFullYear()}`;
  }
  return `${r(t)} ${t.getFullYear()}`;
}
function W(e, n, t = 0.5) {
  const a = n.start.getTime(), r = n.end.getTime(), o = r - a;
  if (o <= 0) return null;
  const l = e.start.getTime(), d = e.end.getTime(), s = Math.min(l, d), u = Math.max(l, d);
  if (u <= a || s >= r) return null;
  const $ = s < a, h = u > r, f = Math.max(s, a), T = Math.min(u, r), m = (f - a) / o * 100, i = (T - f) / o * 100, g = Math.min(Math.max(i, t), 100 - m);
  return { startPct: m, widthPct: g, clippedStart: $, clippedEnd: h };
}
function _(e) {
  const n = e.map((r, o) => ({ index: o, start: Math.min(r.start.getTime(), r.end.getTime()), end: Math.max(r.start.getTime(), r.end.getTime()) })).sort((r, o) => r.start - o.start || r.end - o.end), t = [], a = new Array(e.length).fill(0);
  for (const r of n) {
    let o = t.findIndex((l) => l <= r.start);
    o === -1 ? (o = t.length, t.push(r.end)) : t[o] = r.end, a[r.index] = o;
  }
  return { lanes: a, laneCount: t.length };
}
function x(e, n = /* @__PURE__ */ new Date()) {
  const t = e.start.getTime(), a = e.end.getTime(), r = n.getTime();
  return r < t || r >= a ? null : (r - t) / (a - t) * 100;
}
function O(e, n) {
  const t = (a) => `${M(a.getHours())}:${M(a.getMinutes())}`;
  return y(e, n) ? `${t(e)} – ${t(n)}` : `${e.getDate()} ${D[e.getDay()]} ${t(e)} – ${n.getDate()} ${D[n.getDay()]} ${t(n)}`;
}
export {
  O as formatTimeRange,
  _ as layoutLanes,
  x as nowPct,
  W as placeAppointment,
  b as planningColumns,
  k as planningRange,
  E as planningRangeLabel,
  H as shiftPlanningAnchor,
  Y as startOfMonth,
  F as startOfWeek
};
//# sourceMappingURL=index255.js.map
