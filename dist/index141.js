const S = (e) => new Date(e.getFullYear(), e.getMonth(), e.getDate(), 0, 0, 0, 0), u = (e, n) => new Date(e.getFullYear(), e.getMonth(), e.getDate() + n, 0, 0, 0, 0), T = (e, n) => e.getFullYear() === n.getFullYear() && e.getMonth() === n.getMonth() && e.getDate() === n.getDate(), y = (e) => String(e).padStart(2, "0"), D = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
function w(e) {
  const n = e.getDay(), t = n === 0 ? 6 : n - 1;
  return u(e, -t);
}
function F(e) {
  return new Date(e.getFullYear(), e.getMonth(), 1, 0, 0, 0, 0);
}
function Y(e, n) {
  if (e === "day") {
    const a = S(n);
    return { start: a, end: u(a, 1) };
  }
  if (e === "week") {
    const a = w(n);
    return { start: a, end: u(a, 7) };
  }
  const t = F(n);
  return { start: t, end: new Date(t.getFullYear(), t.getMonth() + 1, 1, 0, 0, 0, 0) };
}
function k(e, n, t) {
  if (e === "day") return u(n, t);
  if (e === "week") return u(w(n), t * 7);
  const a = F(n);
  return new Date(a.getFullYear(), a.getMonth() + t, 1, 0, 0, 0, 0);
}
function p(e, n, t = {}) {
  const a = t.now ?? /* @__PURE__ */ new Date(), r = t.nonWorkingDays ?? [0, 6], o = [];
  if (e === "day") {
    const s = t.hourStep && t.hourStep > 0 ? t.hourStep : 1, c = t.dayStartHour ?? 0, f = t.dayEndHour ?? 24, [$, M] = t.workingHours ?? [9, 18], i = S(n);
    for (let g = c; g < f; g += s) {
      const m = new Date(i.getTime() + g * 36e5), h = new Date(Math.min(i.getTime() + (g + s) * 36e5, i.getTime() + f * 36e5));
      o.push({
        start: m,
        end: h,
        label: `${y(g)}:00`,
        sublabel: "",
        nonWorking: g < $ || g >= M,
        // Every column of a day view is "today" or none of them is, so the flag
        // would paint the whole row. It marks the column containing `now`, which
        // is the only reading that says anything.
        today: T(m, a) && a.getTime() >= m.getTime() && a.getTime() < h.getTime()
      });
    }
    return o;
  }
  const { start: l, end: d } = Y(e, n);
  for (let s = l; s.getTime() < d.getTime(); s = u(s, 1)) {
    const c = u(s, 1);
    o.push({
      start: s,
      end: c,
      label: e === "week" ? `${D[s.getDay()]} ${s.getDate()}` : String(s.getDate()),
      sublabel: e === "month" ? D[s.getDay()] : "",
      nonWorking: r.includes(s.getDay()),
      today: T(s, a)
    });
  }
  return o;
}
function b(e, n) {
  const { start: t, end: a } = Y(e, n), r = (o) => o.toLocaleString(void 0, { month: "long" });
  if (e === "day")
    return `${D[t.getDay()]} ${t.getDate()} ${r(t)} ${t.getFullYear()}`;
  if (e === "week") {
    const o = new Date(a.getTime() - 864e5);
    return `${t.getFullYear() === o.getFullYear() ? t.getMonth() === o.getMonth() ? `${t.getDate()}` : `${t.getDate()} ${r(t)}` : `${t.getDate()} ${r(t)} ${t.getFullYear()}`} – ${o.getDate()} ${r(o)} ${o.getFullYear()}`;
  }
  return `${r(t)} ${t.getFullYear()}`;
}
function H(e, n, t = 0.5) {
  const a = n.start.getTime(), r = n.end.getTime(), o = r - a;
  if (o <= 0) return null;
  const l = e.start.getTime(), d = e.end.getTime(), s = Math.min(l, d), c = Math.max(l, d);
  if (c <= a || s >= r) return null;
  const f = s < a, $ = c > r, M = Math.max(s, a), i = Math.min(c, r), g = (M - a) / o * 100, m = (i - M) / o * 100, h = Math.min(Math.max(m, t), 100 - g);
  return { startPct: g, widthPct: h, clippedStart: f, clippedEnd: $ };
}
function _(e) {
  const n = e.map((r, o) => ({ index: o, start: Math.min(r.start.getTime(), r.end.getTime()), end: Math.max(r.start.getTime(), r.end.getTime()) })).sort((r, o) => r.start - o.start || r.end - o.end), t = [], a = new Array(e.length).fill(0);
  for (const r of n) {
    let o = t.findIndex((l) => l <= r.start);
    o === -1 ? (o = t.length, t.push(r.end)) : t[o] = r.end, a[r.index] = o;
  }
  return { lanes: a, laneCount: t.length };
}
function O(e, n = /* @__PURE__ */ new Date()) {
  const t = e.start.getTime(), a = e.end.getTime(), r = n.getTime();
  return r < t || r >= a ? null : (r - t) / (a - t) * 100;
}
function R(e, n) {
  const t = (a) => `${y(a.getHours())}:${y(a.getMinutes())}`;
  return T(e, n) ? `${t(e)} – ${t(n)}` : `${e.getDate()} ${D[e.getDay()]} ${t(e)} – ${n.getDate()} ${D[n.getDay()]} ${t(n)}`;
}
export {
  R as formatTimeRange,
  _ as layoutLanes,
  O as nowPct,
  H as placeAppointment,
  p as planningColumns,
  Y as planningRange,
  b as planningRangeLabel,
  k as shiftPlanningAnchor,
  F as startOfMonth,
  w as startOfWeek
};
//# sourceMappingURL=index141.js.map
