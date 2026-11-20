import { startOfWeek as R, planningRange as v, planningColumns as tt, shiftPlanningAnchor as et, planningRangeLabel as nt } from "./index255.js";
const L = 1440, $t = {
  id: "24/7",
  week: Array.from({ length: 7 }, () => [{ from: 0, to: L }])
}, $ = (t, e) => new Date(
  t.getFullYear(),
  t.getMonth(),
  t.getDate(),
  // Not `midnight + minutes * 60000`: on a DST day that lands an hour out.
  // The constructor normalises 24:00 to the next midnight, which is what a
  // period ending at 1440 means.
  Math.floor(e / 60),
  e % 60,
  0,
  0
), rt = (t, e) => t.getFullYear() === e.getFullYear() && t.getMonth() === e.getMonth() && t.getDate() === e.getDate(), k = (t) => {
  const e = t.map((r) => ({ from: Math.max(0, Math.min(L, r.from)), to: Math.max(0, Math.min(L, r.to)) })).filter((r) => r.to > r.from).sort((r, o) => r.from - o.from), n = [];
  for (const r of e) {
    const o = n[n.length - 1];
    o && r.from <= o.to ? o.to = Math.max(o.to, r.to) : n.push({ ...r });
  }
  return n;
};
function O(t, e) {
  const n = t.exceptions?.find((r) => rt(r.date, e));
  return k(n ? n.periods : t.week[e.getDay()] ?? []);
}
function Ft(t, e) {
  const n = e.getTime();
  for (const r of O(t, e))
    if (n >= $(e, r.from).getTime() && n < $(e, r.to).getTime()) return !0;
  return !1;
}
const C = 366 * 10;
function B(t, e, n) {
  const r = n.getTime();
  if (r <= e.getTime()) return 0;
  let o = 0, i = x(e);
  for (let s = 0; s < C && i.getTime() < r; s++) {
    for (const g of O(t, i)) {
      const a = Math.max($(i, g.from).getTime(), e.getTime()), u = Math.min($(i, g.to).getTime(), r);
      u > a && (o += u - a);
    }
    i = I(i, 1);
  }
  return o;
}
function ot(t, e, n) {
  if (n <= 0) return new Date(e.getTime());
  let r = n, o = x(e);
  for (let i = 0; i < C; i++) {
    for (const s of O(t, o)) {
      const g = Math.max($(o, s.from).getTime(), e.getTime()), a = $(o, s.to).getTime();
      if (a <= g) continue;
      const u = a - g;
      if (u >= r) return new Date(g + r);
      r -= u;
    }
    o = I(o, 1);
  }
  return new Date(o.getTime());
}
function Yt(t, e, n) {
  if (n <= 0) return new Date(e.getTime());
  let r = n, o = x(e);
  for (let i = 0; i < C; i++) {
    const s = O(t, o).slice().reverse();
    for (const g of s) {
      const a = $(o, g.from).getTime(), u = Math.min($(o, g.to).getTime(), e.getTime());
      if (u <= a) continue;
      const l = u - a;
      if (l >= r) return new Date(u - r);
      r -= l;
    }
    o = I(o, -1);
  }
  return new Date(o.getTime());
}
function at(t, e, n, r = {}) {
  const o = n.getTime();
  if (o <= e.getTime()) return [];
  const i = r.minGapMs ?? 0, s = r.maxSegments ?? 500, g = [];
  let a = x(e);
  for (let u = 0; u < C && a.getTime() < o; u++) {
    for (const l of O(t, a)) {
      const c = Math.max($(a, l.from).getTime(), e.getTime()), m = Math.min($(a, l.to).getTime(), o);
      if (m <= c) continue;
      const f = g[g.length - 1];
      f && c - f.end.getTime() <= i ? f.end = new Date(m) : g.push({ start: new Date(c), end: new Date(m) });
    }
    a = I(a, 1);
  }
  return g.length > s ? [{ start: g[0].start, end: g[g.length - 1].end }] : g;
}
const U = 1440 * 60 * 1e3, x = (t) => new Date(t.getFullYear(), t.getMonth(), t.getDate(), 0, 0, 0, 0), I = (t, e) => new Date(t.getFullYear(), t.getMonth(), t.getDate() + e, 0, 0, 0, 0), G = (t) => new Date(t.getFullYear(), Math.floor(t.getMonth() / 3) * 3, 1, 0, 0, 0, 0), st = (t) => new Date(t.getFullYear(), 0, 1, 0, 0, 0, 0), S = (t) => t.toLocaleString(void 0, { month: "short" });
function E(t, e) {
  if (t === "quarter") {
    const n = G(e);
    return { start: n, end: new Date(n.getFullYear(), n.getMonth() + 3, 1, 0, 0, 0, 0) };
  }
  if (t === "year") {
    const n = st(e);
    return { start: n, end: new Date(n.getFullYear() + 1, 0, 1, 0, 0, 0, 0) };
  }
  return v(t, e);
}
function St(t, e, n) {
  if (t === "quarter") {
    const r = G(e);
    return new Date(r.getFullYear(), r.getMonth() + n * 3, 1, 0, 0, 0, 0);
  }
  return t === "year" ? new Date(e.getFullYear() + n, 0, 1, 0, 0, 0, 0) : et(t, e, n);
}
function It(t, e) {
  if (t === "quarter") {
    const n = G(e);
    return `Q${Math.floor(n.getMonth() / 3) + 1} ${n.getFullYear()}`;
  }
  return t === "year" ? String(e.getFullYear()) : nt(t, e);
}
const _ = (t, e) => t.map((n) => ({
  ...n,
  nonWorking: B(e, n.start, n.end) === 0
}));
function yt(t, e, n = {}) {
  const { calendar: r } = n;
  if (t !== "quarter" && t !== "year") {
    const a = tt(t, e, n);
    return r ? _(a, r) : a;
  }
  const o = n.now ?? /* @__PURE__ */ new Date(), { start: i, end: s } = E(t, e), g = [];
  if (t === "year") {
    for (let a = i; a.getTime() < s.getTime(); ) {
      const u = new Date(a.getFullYear(), a.getMonth() + 1, 1, 0, 0, 0, 0);
      g.push({
        start: a,
        end: u,
        label: S(a),
        // The year is already in the range label; repeating it in all twelve
        // columns is noise.
        sublabel: "",
        // A week or a month is neither working nor non-working — the weekend is
        // inside every one of them, so shading any of them says nothing.
        nonWorking: !1,
        today: o.getTime() >= a.getTime() && o.getTime() < u.getTime()
      }), a = u;
    }
    return r ? _(g, r) : g;
  }
  for (let a = i; a.getTime() < s.getTime(); ) {
    const u = I(R(a), 7), l = u.getTime() < s.getTime() ? u : s;
    g.push({
      start: a,
      end: l,
      label: `${a.getDate()} ${S(a)}`,
      sublabel: "",
      nonWorking: !1,
      today: o.getTime() >= a.getTime() && o.getTime() < l.getTime()
    }), a = l;
  }
  return r ? _(g, r) : g;
}
const K = 3600 * 1e3, H = (t) => String(t).padStart(2, "0"), it = (t) => new Date(t.getFullYear(), t.getMonth(), 1, 0, 0, 0, 0), ut = (t) => new Date(t.getFullYear(), t.getMonth(), t.getDate(), t.getHours(), 0, 0, 0);
function gt(t) {
  const e = t / U;
  return e <= 2 ? "hour" : e <= 45 ? "day" : e <= 315 ? "week" : "month";
}
const A = [0.25, 0.5, 1, 2, 3, 4, 6];
function xt(t, e = 16) {
  const n = t / K, r = Math.max(1, e);
  for (const o of A)
    if (n / o <= r) return o;
  return A[A.length - 1];
}
const Q = (t, e) => {
  if (t.milestone) {
    const n = t.start ?? t.end;
    return n ? { start: new Date(n.getTime()), end: new Date(n.getTime()) } : null;
  }
  if (t.start && t.end) {
    const n = t.start.getTime(), r = t.end.getTime();
    return { start: new Date(Math.min(n, r)), end: new Date(Math.max(n, r)) };
  }
  if (t.start && typeof t.workingMinutes == "number" && t.workingMinutes >= 0) {
    const n = t.workingMinutes * 6e4, r = e ? ot(e, t.start, n) : new Date(t.start.getTime() + n);
    return { start: new Date(t.start.getTime()), end: r };
  }
  return null;
}, X = (t, e) => e === "hour" ? ut(t) : e === "day" ? x(t) : e === "week" ? R(t) : it(t), ct = (t, e) => {
  const n = X(t, e);
  return n.getTime() === t.getTime() ? n : e === "hour" ? new Date(n.getFullYear(), n.getMonth(), n.getDate(), n.getHours() + 1, 0, 0, 0) : e === "day" ? I(n, 1) : e === "week" ? I(n, 7) : new Date(n.getFullYear(), n.getMonth() + 1, 1, 0, 0, 0, 0);
};
function bt(t, e = {}) {
  const { calendar: n, padFraction: r = 0.04, minPadMs: o = K } = e;
  let i = Number.POSITIVE_INFINITY, s = Number.NEGATIVE_INFINITY;
  const g = (l) => {
    const c = Q(l, n);
    c && (i = Math.min(i, c.start.getTime()), s = Math.max(s, c.end.getTime()));
    for (const m of l.children ?? []) g(m);
  };
  for (const l of t) g(l);
  if (i === Number.POSITIVE_INFINITY) return null;
  const a = Math.max(o, (s - i) * r), u = gt(s - i + 2 * a);
  return {
    start: X(new Date(i - a), u),
    end: ct(new Date(s + a), u)
  };
}
const lt = ["S", "M", "T", "W", "T", "F", "S"];
function Et(t, e, n = {}) {
  const r = n.now ?? /* @__PURE__ */ new Date(), o = n.nonWorkingDays ?? [0, 6], [i, s] = n.workingHours ?? [9, 18], { calendar: g } = n, a = t.end.getTime(), u = [];
  if (a <= t.start.getTime()) return u;
  const l = t.start.getFullYear() !== new Date(a - 1).getFullYear(), c = Math.max(
    1,
    Math.round((n.hourStep && n.hourStep > 0 ? n.hourStep : 1) * 60)
  ), m = (h) => e === "hour" ? new Date(h.getFullYear(), h.getMonth(), h.getDate(), h.getHours(), h.getMinutes() + c, 0, 0) : e === "day" ? I(h, 1) : e === "week" ? I(R(h), 7) : new Date(h.getFullYear(), h.getMonth() + 1, 1, 0, 0, 0, 0);
  let f = t.start, F = -1, Y = -1;
  for (let h = 0; h < 4096 && f.getTime() < a; h++) {
    const M = m(f);
    if (M.getTime() <= f.getTime()) break;
    const D = M.getTime() < a ? M : t.end;
    let T, d = "", w = !1;
    if (e === "hour") {
      T = `${H(f.getHours())}:${H(f.getMinutes())}`, f.getDate() !== F && !n.grouped && (d = `${f.getDate()} ${S(f)}`), F = f.getDate();
      const y = f.getHours() + f.getMinutes() / 60;
      w = y < i || y >= s;
    } else e === "day" ? (T = String(f.getDate()), d = lt[f.getDay()], w = o.includes(f.getDay())) : e === "week" ? (T = String(f.getDate()), f.getMonth() !== Y && !n.grouped && (d = S(f)), Y = f.getMonth()) : (T = S(f), l && !n.grouped && (f.getMonth() === 0 || u.length === 0) && (d = String(f.getFullYear())));
    u.push({
      start: f,
      end: D,
      label: T,
      sublabel: d,
      nonWorking: w,
      today: r.getTime() >= f.getTime() && r.getTime() < D.getTime()
    }), f = D;
  }
  return g ? _(u, g) : u;
}
const q = 1500, ft = {
  hour: 36e5,
  day: 864e5,
  week: 7 * 864e5,
  month: 30.44 * 864e5
};
function Nt(t, e, n) {
  const r = E(t, n);
  if (!e) return { range: r, clamped: !1 };
  const o = new Date(Math.max(e.start.getTime(), e.end.getTime() - 1)), i = {
    start: new Date(Math.min(E(t, e.start).start.getTime(), r.start.getTime())),
    end: new Date(Math.max(E(t, o).end.getTime(), r.end.getTime()))
  }, s = ft[mt(t)];
  if ((i.end.getTime() - i.start.getTime()) / s <= q) return { range: i, clamped: !1 };
  const a = 0.45 * q * s;
  let u = Math.max(i.start.getTime(), n.getTime() - a);
  const l = Math.min(i.end.getTime(), u + 2 * a);
  return u = Math.max(i.start.getTime(), l - 2 * a), {
    range: {
      start: E(t, new Date(u)).start,
      end: E(t, new Date(l - 1)).end
    },
    clamped: !0
  };
}
function Ot(t, e, n, r) {
  const o = e - r, i = e + n + r;
  let s = -1, g = -1;
  const a = [];
  let u = 0;
  for (let l = 0; l < t.length; l++) {
    const c = u + t[l];
    if (c > o && u < i)
      s === -1 && (s = l), g = l, a.push(u);
    else if (u >= i) break;
    u = c;
  }
  return s === -1 ? { first: 0, last: -1, offsets: [] } : { first: s, last: g, offsets: a };
}
function mt(t) {
  return t === "day" ? "hour" : t === "quarter" ? "week" : t === "year" ? "month" : "day";
}
const ht = (t) => t.toLocaleString(void 0, { month: "long" }), dt = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
function _t(t, e) {
  const n = (s) => e === "hour" ? `${s.getFullYear()}-${s.getMonth()}-${s.getDate()}` : e === "month" ? String(s.getFullYear()) : `${s.getFullYear()}-${s.getMonth()}`, r = (s) => e === "hour" ? `${dt[s.getDay()]} ${s.getDate()} ${S(s)} ${s.getFullYear()}` : e === "month" ? String(s.getFullYear()) : `${ht(s)} ${s.getFullYear()}`, o = (s) => e === "hour" ? `${s.getDate()} ${S(s)}` : e === "month" ? String(s.getFullYear()) : S(s), i = [];
  return t.forEach((s, g) => {
    const a = i.at(-1);
    if (a && n(t[a.firstColumn].start) === n(s.start)) {
      a.columnCount++, a.end = s.end;
      return;
    }
    i.push({
      start: s.start,
      end: s.end,
      label: r(s.start),
      shortLabel: o(s.start),
      firstColumn: g,
      columnCount: 1
    });
  }), i;
}
function Ct(t) {
  const e = t.start, n = new Date(t.end.getTime() - 1);
  if (t.end.getTime() <= e.getTime()) return "";
  const r = (i) => S(i), o = e.getFullYear() === n.getFullYear();
  return (t.end.getTime() - e.getTime()) / U <= 62 ? o && e.getMonth() === n.getMonth() ? `${e.getDate()} – ${n.getDate()} ${r(n)} ${n.getFullYear()}` : o ? `${e.getDate()} ${r(e)} – ${n.getDate()} ${r(n)} ${n.getFullYear()}` : `${e.getDate()} ${r(e)} ${e.getFullYear()} – ${n.getDate()} ${r(n)} ${n.getFullYear()}` : o && e.getMonth() === n.getMonth() ? `${r(e)} ${e.getFullYear()}` : o ? `${r(e)} – ${r(n)} ${n.getFullYear()}` : `${r(e)} ${e.getFullYear()} – ${r(n)} ${n.getFullYear()}`;
}
const Pt = ["name", "assignees", "status", "variance"];
function At(t, e, n, r) {
  const o = [...t];
  if (o.length <= 1 || n <= 0) return o;
  const i = () => o.reduce((s, g) => s + e[g], 0);
  if (i() + r <= n || e[o[0]] + r > n) return o;
  for (; o.length > 1 && i() + r > n; ) o.pop();
  return o;
}
function Wt(t, e, n) {
  const r = e.start.getTime(), o = e.end.getTime() - r;
  if (o <= 0) return t.map(() => 0);
  let i = 0;
  return t.map((s) => {
    const g = (s.end.getTime() - r) / o * n, a = g - i;
    return i = g, a;
  });
}
const W = (t) => Math.min(100, Math.max(0, t));
function V(t, e) {
  const n = Q(t, e);
  if (n) return n;
  let r = Number.POSITIVE_INFINITY, o = Number.NEGATIVE_INFINITY;
  for (const i of t.children ?? []) {
    const s = V(i, e);
    s && (r = Math.min(r, s.start.getTime()), o = Math.max(o, s.end.getTime()));
  }
  return r === Number.POSITIVE_INFINITY ? null : { start: new Date(r), end: new Date(o) };
}
function Tt(t, e) {
  if (typeof t.percentComplete == "number") return W(t.percentComplete);
  let n = 0, r = 0, o = 0, i = 0, s = !1;
  const g = (u) => {
    const l = V(u, e);
    return l ? e ? B(e, l.start, l.end) : l.end.getTime() - l.start.getTime() : 0;
  }, a = (u) => {
    const l = u.children ?? [];
    if (l.length === 0) {
      const c = typeof u.percentComplete == "number" ? W(u.percentComplete) : 0;
      typeof u.percentComplete == "number" && (s = !0);
      const m = g(u);
      n += c * m, r += m, o += c, i += 1;
      return;
    }
    if (typeof u.percentComplete == "number") {
      s = !0;
      const c = W(u.percentComplete), m = g(u);
      n += c * m, r += m, o += c, i += 1;
      return;
    }
    for (const c of l) a(c);
  };
  for (const u of t.children ?? []) a(u);
  return !s || i === 0 ? null : r > 0 ? n / r : o / i;
}
function j(t, e) {
  return Math.round((x(t).getTime() - x(e).getTime()) / U);
}
function Lt(t) {
  return t === null ? null : t === 0 ? "On time" : t > 0 ? `+${t}d` : `${t}d`;
}
function Mt(t, e, n, r = /* @__PURE__ */ new Date()) {
  if (t.status) return t.status;
  if (n !== null && n >= 100) return "complete";
  const o = t.baselineEnd && e ? j(e.end, t.baselineEnd) > 0 : !1, i = e ? e.end.getTime() < r.getTime() : !1;
  return o || i ? "delayed" : n === null || n <= 0 ? "not-started" : "on-track";
}
function Rt(t, e, n = /* @__PURE__ */ new Date(), r = {}) {
  const { calendar: o, ...i } = r, s = (c) => {
    if (!c || !o) return { span: c, segments: null };
    const m = at(o, c.start, c.end, i);
    return m.length === 0 ? { span: c, segments: null } : { span: { start: m[0].start, end: m[m.length - 1].end }, segments: m.length > 1 ? m : null };
  }, g = [], a = /* @__PURE__ */ new Map(), u = (c, m) => {
    a.set(c.id, m);
    for (const f of c.children ?? []) u(f, m);
  }, l = (c, m, f) => {
    const F = c.children ?? [], Y = F.length > 0, h = Y ? e(c) : !1, { span: M, segments: D } = s(V(c, o)), T = Tt(c, o), d = g.length;
    if (g.push({
      task: c,
      depth: m,
      index: d,
      parentId: f,
      hasChildren: Y,
      expanded: h,
      span: M,
      segments: D,
      progress: T,
      status: Mt(c, M, T, n),
      variance: c.baselineEnd && M ? j(M.end, c.baselineEnd) : null
    }), a.set(c.id, d), !!Y)
      if (h)
        for (const w of F) l(w, m + 1, c.id);
      else
        for (const w of F) u(w, d);
  };
  for (const c of t) l(c, 0, null);
  return { rows: g, rowIndexById: a };
}
const pt = {
  "finish-to-start": { fromEnd: !0, toEnd: !1 },
  "start-to-start": { fromEnd: !1, toEnd: !1 },
  "finish-to-finish": { fromEnd: !0, toEnd: !0 },
  "start-to-finish": { fromEnd: !1, toEnd: !0 }
}, b = (t) => Math.round(t * 100) / 100;
function Ut(t, e, n) {
  const { axisWidth: r, rowHeight: o } = n, i = n.stub ?? 12, s = [], g = /* @__PURE__ */ new Set();
  for (const a of e) {
    const u = a.type ?? "finish-to-start";
    if (a.from === a.to) continue;
    const l = t.get(a.from), c = t.get(a.to);
    if (!l || !c) continue;
    const m = (p) => `${p.rowIndex}:${b(p.startPct)}:${b(p.widthPct)}:${p.yOffset ?? ""}`;
    if (m(l) === m(c)) continue;
    const f = `${m(l)}->${m(c)}:${u}`;
    if (g.has(f)) continue;
    g.add(f);
    const { fromEnd: F, toEnd: Y } = pt[u], h = (p) => p / 100 * r, M = h(F ? l.startPct + l.widthPct : l.startPct), D = h(Y ? c.startPct + c.widthPct : c.startPct), T = l.rowIndex * o + (l.yOffset ?? o / 2), d = c.rowIndex * o + (c.yOffset ?? o / 2), w = F ? 1 : -1, y = Y ? -1 : 1, P = M + w * i, N = D - y * i, z = (w === y && y * (N - P) >= 0 ? [
      [M, T],
      [N, T],
      [N, d],
      [D, d]
    ] : (() => {
      const p = (T + d) / 2;
      return [
        [M, T],
        [P, T],
        [P, p],
        [N, p],
        [N, d],
        [D, d]
      ];
    })()).map(([p, J], Z) => `${Z === 0 ? "M" : "L"} ${b(p)} ${b(J)}`).join(" ");
    s.push({
      id: `${a.from}->${a.to}:${u}`,
      from: a.from,
      to: a.to,
      type: u,
      dependency: a,
      d: z,
      arrow: { x: b(D), y: b(d), dir: y }
    });
  }
  return s;
}
function Gt(t, e, n, r, o = 6) {
  if (t <= 0 || e <= 0)
    return { startIndex: 0, endIndex: 0, paddingTop: 0, paddingBottom: 0 };
  const i = Math.max(0, n), s = Math.floor(i / e), g = Math.ceil((i + Math.max(0, r)) / e), a = Math.min(Math.max(s - o, 0), t), u = Math.min(Math.max(g + o, a), t);
  return {
    startIndex: a,
    endIndex: u,
    paddingTop: a * e,
    paddingBottom: (t - u) * e
  };
}
export {
  $t as GANTT_CALENDAR_24_7,
  q as GANTT_CONTINUOUS_MAX_COLUMNS,
  Pt as GANTT_PANE_COLUMNS,
  Rt as flattenGanttTasks,
  Lt as formatGanttVariance,
  ot as ganttAddWorkingMs,
  Wt as ganttColumnWidths,
  Ot as ganttColumnWindow,
  yt as ganttColumns,
  Ut as ganttConnectors,
  Nt as ganttContinuousRange,
  xt as ganttFitHourStep,
  bt as ganttFitRange,
  gt as ganttFitUnit,
  _t as ganttHeaderGroups,
  Ft as ganttIsWorking,
  At as ganttPaneColumns,
  Tt as ganttProgress,
  E as ganttRange,
  Et as ganttRangeColumns,
  It as ganttRangeLabel,
  Gt as ganttRowWindow,
  V as ganttSpan,
  Ct as ganttSpanLabel,
  Yt as ganttSubWorkingMs,
  Mt as ganttTaskStatus,
  j as ganttVarianceDays,
  mt as ganttViewUnit,
  B as ganttWorkingMs,
  O as ganttWorkingPeriodsOn,
  at as ganttWorkingSegments,
  St as shiftGanttAnchor
};
//# sourceMappingURL=index110.js.map
