import { startOfWeek as R, planningRange as z, planningColumns as J, shiftPlanningAnchor as Z, planningRangeLabel as tt } from "./index185.js";
const C = 1440, Tt = {
  id: "24/7",
  week: Array.from({ length: 7 }, () => [{ from: 0, to: C }])
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
), et = (t, e) => t.getFullYear() === e.getFullYear() && t.getMonth() === e.getMonth() && t.getDate() === e.getDate(), L = (t) => {
  const e = t.map((r) => ({ from: Math.max(0, Math.min(C, r.from)), to: Math.max(0, Math.min(C, r.to)) })).filter((r) => r.to > r.from).sort((r, o) => r.from - o.from), n = [];
  for (const r of e) {
    const o = n[n.length - 1];
    o && r.from <= o.to ? o.to = Math.max(o.to, r.to) : n.push({ ...r });
  }
  return n;
};
function N(t, e) {
  const n = t.exceptions?.find((r) => et(r.date, e));
  return L(n ? n.periods : t.week[e.getDay()] ?? []);
}
function pt(t, e) {
  const n = e.getTime();
  for (const r of N(t, e))
    if (n >= $(e, r.from).getTime() && n < $(e, r.to).getTime()) return !0;
  return !1;
}
const O = 366 * 10;
function U(t, e, n) {
  const r = n.getTime();
  if (r <= e.getTime()) return 0;
  let o = 0, i = y(e);
  for (let g = 0; g < O && i.getTime() < r; g++) {
    for (const c of N(t, i)) {
      const s = Math.max($(i, c.from).getTime(), e.getTime()), a = Math.min($(i, c.to).getTime(), r);
      a > s && (o += a - s);
    }
    i = I(i, 1);
  }
  return o;
}
function nt(t, e, n) {
  if (n <= 0) return new Date(e.getTime());
  let r = n, o = y(e);
  for (let i = 0; i < O; i++) {
    for (const g of N(t, o)) {
      const c = Math.max($(o, g.from).getTime(), e.getTime()), s = $(o, g.to).getTime();
      if (s <= c) continue;
      const a = s - c;
      if (a >= r) return new Date(c + r);
      r -= a;
    }
    o = I(o, 1);
  }
  return new Date(o.getTime());
}
function Mt(t, e, n) {
  if (n <= 0) return new Date(e.getTime());
  let r = n, o = y(e);
  for (let i = 0; i < O; i++) {
    const g = N(t, o).slice().reverse();
    for (const c of g) {
      const s = $(o, c.from).getTime(), a = Math.min($(o, c.to).getTime(), e.getTime());
      if (a <= s) continue;
      const l = a - s;
      if (l >= r) return new Date(a - r);
      r -= l;
    }
    o = I(o, -1);
  }
  return new Date(o.getTime());
}
function rt(t, e, n, r = {}) {
  const o = n.getTime();
  if (o <= e.getTime()) return [];
  const i = r.minGapMs ?? 0, g = r.maxSegments ?? 500, c = [];
  let s = y(e);
  for (let a = 0; a < O && s.getTime() < o; a++) {
    for (const l of N(t, s)) {
      const u = Math.max($(s, l.from).getTime(), e.getTime()), m = Math.min($(s, l.to).getTime(), o);
      if (m <= u) continue;
      const f = c[c.length - 1];
      f && u - f.end.getTime() <= i ? f.end = new Date(m) : c.push({ start: new Date(u), end: new Date(m) });
    }
    s = I(s, 1);
  }
  return c.length > g ? [{ start: c[0].start, end: c[c.length - 1].end }] : c;
}
const V = 1440 * 60 * 1e3, y = (t) => new Date(t.getFullYear(), t.getMonth(), t.getDate(), 0, 0, 0, 0), I = (t, e) => new Date(t.getFullYear(), t.getMonth(), t.getDate() + e, 0, 0, 0, 0), k = (t) => new Date(t.getFullYear(), Math.floor(t.getMonth() / 3) * 3, 1, 0, 0, 0, 0), ot = (t) => new Date(t.getFullYear(), 0, 1, 0, 0, 0, 0), E = (t) => t.toLocaleString(void 0, { month: "short" });
function st(t, e) {
  if (t === "quarter") {
    const n = k(e);
    return { start: n, end: new Date(n.getFullYear(), n.getMonth() + 3, 1, 0, 0, 0, 0) };
  }
  if (t === "year") {
    const n = ot(e);
    return { start: n, end: new Date(n.getFullYear() + 1, 0, 1, 0, 0, 0, 0) };
  }
  return z(t, e);
}
function Dt(t, e, n) {
  if (t === "quarter") {
    const r = k(e);
    return new Date(r.getFullYear(), r.getMonth() + n * 3, 1, 0, 0, 0, 0);
  }
  return t === "year" ? new Date(e.getFullYear() + n, 0, 1, 0, 0, 0, 0) : Z(t, e, n);
}
function wt(t, e) {
  if (t === "quarter") {
    const n = k(e);
    return `Q${Math.floor(n.getMonth() / 3) + 1} ${n.getFullYear()}`;
  }
  return t === "year" ? String(e.getFullYear()) : tt(t, e);
}
const P = (t, e) => t.map((n) => ({
  ...n,
  nonWorking: U(e, n.start, n.end) === 0
}));
function $t(t, e, n = {}) {
  const { calendar: r } = n;
  if (t !== "quarter" && t !== "year") {
    const s = J(t, e, n);
    return r ? P(s, r) : s;
  }
  const o = n.now ?? /* @__PURE__ */ new Date(), { start: i, end: g } = st(t, e), c = [];
  if (t === "year") {
    for (let s = i; s.getTime() < g.getTime(); ) {
      const a = new Date(s.getFullYear(), s.getMonth() + 1, 1, 0, 0, 0, 0);
      c.push({
        start: s,
        end: a,
        label: E(s),
        // The year is already in the range label; repeating it in all twelve
        // columns is noise.
        sublabel: "",
        // A week or a month is neither working nor non-working — the weekend is
        // inside every one of them, so shading any of them says nothing.
        nonWorking: !1,
        today: o.getTime() >= s.getTime() && o.getTime() < a.getTime()
      }), s = a;
    }
    return r ? P(c, r) : c;
  }
  for (let s = i; s.getTime() < g.getTime(); ) {
    const a = I(R(s), 7), l = a.getTime() < g.getTime() ? a : g;
    c.push({
      start: s,
      end: l,
      label: `${s.getDate()} ${E(s)}`,
      sublabel: "",
      nonWorking: !1,
      today: o.getTime() >= s.getTime() && o.getTime() < l.getTime()
    }), s = l;
  }
  return r ? P(c, r) : c;
}
const q = 3600 * 1e3, H = (t) => String(t).padStart(2, "0"), at = (t) => new Date(t.getFullYear(), t.getMonth(), 1, 0, 0, 0, 0), it = (t) => new Date(t.getFullYear(), t.getMonth(), t.getDate(), t.getHours(), 0, 0, 0);
function ct(t) {
  const e = t / V;
  return e <= 2 ? "hour" : e <= 45 ? "day" : e <= 315 ? "week" : "month";
}
const A = [0.25, 0.5, 1, 2, 3, 4, 6];
function Ft(t, e = 16) {
  const n = t / q, r = Math.max(1, e);
  for (const o of A)
    if (n / o <= r) return o;
  return A[A.length - 1];
}
const B = (t, e) => {
  if (t.start && t.end) {
    const n = t.start.getTime(), r = t.end.getTime();
    return { start: new Date(Math.min(n, r)), end: new Date(Math.max(n, r)) };
  }
  if (t.start && typeof t.workingMinutes == "number" && t.workingMinutes >= 0) {
    const n = t.workingMinutes * 6e4, r = e ? nt(e, t.start, n) : new Date(t.start.getTime() + n);
    return { start: new Date(t.start.getTime()), end: r };
  }
  return null;
}, K = (t, e) => e === "hour" ? it(t) : e === "day" ? y(t) : e === "week" ? R(t) : at(t), ut = (t, e) => {
  const n = K(t, e);
  return n.getTime() === t.getTime() ? n : e === "hour" ? new Date(n.getFullYear(), n.getMonth(), n.getDate(), n.getHours() + 1, 0, 0, 0) : e === "day" ? I(n, 1) : e === "week" ? I(n, 7) : new Date(n.getFullYear(), n.getMonth() + 1, 1, 0, 0, 0, 0);
};
function Yt(t, e = {}) {
  const { calendar: n, padFraction: r = 0.04, minPadMs: o = q } = e;
  let i = Number.POSITIVE_INFINITY, g = Number.NEGATIVE_INFINITY;
  const c = (l) => {
    const u = B(l, n);
    u && (i = Math.min(i, u.start.getTime()), g = Math.max(g, u.end.getTime()));
    for (const m of l.children ?? []) c(m);
  };
  for (const l of t) c(l);
  if (i === Number.POSITIVE_INFINITY) return null;
  const s = Math.max(o, (g - i) * r), a = ct(g - i + 2 * s);
  return {
    start: K(new Date(i - s), a),
    end: ut(new Date(g + s), a)
  };
}
const gt = ["S", "M", "T", "W", "T", "F", "S"];
function It(t, e, n = {}) {
  const r = n.now ?? /* @__PURE__ */ new Date(), o = n.nonWorkingDays ?? [0, 6], [i, g] = n.workingHours ?? [9, 18], { calendar: c } = n, s = t.end.getTime(), a = [];
  if (s <= t.start.getTime()) return a;
  const l = t.start.getFullYear() !== new Date(s - 1).getFullYear(), u = Math.max(
    1,
    Math.round((n.hourStep && n.hourStep > 0 ? n.hourStep : 1) * 60)
  ), m = (d) => e === "hour" ? new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes() + u, 0, 0) : e === "day" ? I(d, 1) : e === "week" ? I(R(d), 7) : new Date(d.getFullYear(), d.getMonth() + 1, 1, 0, 0, 0, 0);
  let f = t.start, F = -1, Y = -1;
  for (let d = 0; d < 4096 && f.getTime() < s; d++) {
    const p = m(f);
    if (p.getTime() <= f.getTime()) break;
    const D = p.getTime() < s ? p : t.end;
    let T, h = "", w = !1;
    if (e === "hour") {
      T = `${H(f.getHours())}:${H(f.getMinutes())}`, f.getDate() !== F && (h = `${f.getDate()} ${E(f)}`), F = f.getDate();
      const S = f.getHours() + f.getMinutes() / 60;
      w = S < i || S >= g;
    } else e === "day" ? (T = String(f.getDate()), h = gt[f.getDay()], w = o.includes(f.getDay())) : e === "week" ? (T = String(f.getDate()), f.getMonth() !== Y && (h = E(f)), Y = f.getMonth()) : (T = E(f), l && (f.getMonth() === 0 || a.length === 0) && (h = String(f.getFullYear())));
    a.push({
      start: f,
      end: D,
      label: T,
      sublabel: h,
      nonWorking: w,
      today: r.getTime() >= f.getTime() && r.getTime() < D.getTime()
    }), f = D;
  }
  return c ? P(a, c) : a;
}
function St(t) {
  const e = t.start, n = new Date(t.end.getTime() - 1);
  if (t.end.getTime() <= e.getTime()) return "";
  const r = (i) => E(i), o = e.getFullYear() === n.getFullYear();
  return (t.end.getTime() - e.getTime()) / V <= 62 ? o && e.getMonth() === n.getMonth() ? `${e.getDate()} – ${n.getDate()} ${r(n)} ${n.getFullYear()}` : o ? `${e.getDate()} ${r(e)} – ${n.getDate()} ${r(n)} ${n.getFullYear()}` : `${e.getDate()} ${r(e)} ${e.getFullYear()} – ${n.getDate()} ${r(n)} ${n.getFullYear()}` : o && e.getMonth() === n.getMonth() ? `${r(e)} ${e.getFullYear()}` : o ? `${r(e)} – ${r(n)} ${n.getFullYear()}` : `${r(e)} ${e.getFullYear()} – ${r(n)} ${n.getFullYear()}`;
}
const yt = ["name", "assignees", "status", "variance"];
function xt(t, e, n, r) {
  const o = [...t];
  if (o.length <= 1 || n <= 0) return o;
  const i = () => o.reduce((g, c) => g + e[c], 0);
  if (i() + r <= n || e[o[0]] + r > n) return o;
  for (; o.length > 1 && i() + r > n; ) o.pop();
  return o;
}
function Et(t, e, n) {
  const r = e.start.getTime(), o = e.end.getTime() - r;
  if (o <= 0) return t.map(() => 0);
  let i = 0;
  return t.map((g) => {
    const c = (g.end.getTime() - r) / o * n, s = c - i;
    return i = c, s;
  });
}
const W = (t) => Math.min(100, Math.max(0, t));
function G(t, e) {
  const n = B(t, e);
  if (n) return n;
  let r = Number.POSITIVE_INFINITY, o = Number.NEGATIVE_INFINITY;
  for (const i of t.children ?? []) {
    const g = G(i, e);
    g && (r = Math.min(r, g.start.getTime()), o = Math.max(o, g.end.getTime()));
  }
  return r === Number.POSITIVE_INFINITY ? null : { start: new Date(r), end: new Date(o) };
}
function lt(t, e) {
  if (typeof t.percentComplete == "number") return W(t.percentComplete);
  let n = 0, r = 0, o = 0, i = 0, g = !1;
  const c = (a) => {
    const l = G(a, e);
    return l ? e ? U(e, l.start, l.end) : l.end.getTime() - l.start.getTime() : 0;
  }, s = (a) => {
    const l = a.children ?? [];
    if (l.length === 0) {
      const u = typeof a.percentComplete == "number" ? W(a.percentComplete) : 0;
      typeof a.percentComplete == "number" && (g = !0);
      const m = c(a);
      n += u * m, r += m, o += u, i += 1;
      return;
    }
    if (typeof a.percentComplete == "number") {
      g = !0;
      const u = W(a.percentComplete), m = c(a);
      n += u * m, r += m, o += u, i += 1;
      return;
    }
    for (const u of l) s(u);
  };
  for (const a of t.children ?? []) s(a);
  return !g || i === 0 ? null : r > 0 ? n / r : o / i;
}
function Q(t, e) {
  return Math.round((y(t).getTime() - y(e).getTime()) / V);
}
function bt(t) {
  return t === null ? null : t === 0 ? "On time" : t > 0 ? `+${t}d` : `${t}d`;
}
function ft(t, e, n, r = /* @__PURE__ */ new Date()) {
  if (t.status) return t.status;
  if (n !== null && n >= 100) return "complete";
  const o = t.baselineEnd && e ? Q(e.end, t.baselineEnd) > 0 : !1, i = e ? e.end.getTime() < r.getTime() : !1;
  return o || i ? "delayed" : n === null || n <= 0 ? "not-started" : "on-track";
}
function Nt(t, e, n = /* @__PURE__ */ new Date(), r = {}) {
  const { calendar: o, ...i } = r, g = (u) => {
    if (!u || !o) return { span: u, segments: null };
    const m = rt(o, u.start, u.end, i);
    return m.length === 0 ? { span: u, segments: null } : { span: { start: m[0].start, end: m[m.length - 1].end }, segments: m.length > 1 ? m : null };
  }, c = [], s = /* @__PURE__ */ new Map(), a = (u, m) => {
    s.set(u.id, m);
    for (const f of u.children ?? []) a(f, m);
  }, l = (u, m, f) => {
    const F = u.children ?? [], Y = F.length > 0, d = Y ? e(u) : !1, { span: p, segments: D } = g(G(u, o)), T = lt(u, o), h = c.length;
    if (c.push({
      task: u,
      depth: m,
      index: h,
      parentId: f,
      hasChildren: Y,
      expanded: d,
      span: p,
      segments: D,
      progress: T,
      status: ft(u, p, T, n),
      variance: u.baselineEnd && p ? Q(p.end, u.baselineEnd) : null
    }), s.set(u.id, h), !!Y)
      if (d)
        for (const w of F) l(w, m + 1, u.id);
      else
        for (const w of F) a(w, h);
  };
  for (const u of t) l(u, 0, null);
  return { rows: c, rowIndexById: s };
}
const mt = {
  "finish-to-start": { fromEnd: !0, toEnd: !1 },
  "start-to-start": { fromEnd: !1, toEnd: !1 },
  "finish-to-finish": { fromEnd: !0, toEnd: !0 },
  "start-to-finish": { fromEnd: !1, toEnd: !0 }
}, x = (t) => Math.round(t * 100) / 100;
function Pt(t, e, n) {
  const { axisWidth: r, rowHeight: o } = n, i = n.stub ?? 12, g = [], c = /* @__PURE__ */ new Set();
  for (const s of e) {
    const a = s.type ?? "finish-to-start";
    if (s.from === s.to) continue;
    const l = t.get(s.from), u = t.get(s.to);
    if (!l || !u) continue;
    const m = (M) => `${M.rowIndex}:${x(M.startPct)}:${x(M.widthPct)}:${M.yOffset ?? ""}`;
    if (m(l) === m(u)) continue;
    const f = `${m(l)}->${m(u)}:${a}`;
    if (c.has(f)) continue;
    c.add(f);
    const { fromEnd: F, toEnd: Y } = mt[a], d = (M) => M / 100 * r, p = d(F ? l.startPct + l.widthPct : l.startPct), D = d(Y ? u.startPct + u.widthPct : u.startPct), T = l.rowIndex * o + (l.yOffset ?? o / 2), h = u.rowIndex * o + (u.yOffset ?? o / 2), w = F ? 1 : -1, S = Y ? -1 : 1, _ = p + w * i, b = D - S * i, j = (w === S && S * (b - _) >= 0 ? [
      [p, T],
      [b, T],
      [b, h],
      [D, h]
    ] : (() => {
      const M = (T + h) / 2;
      return [
        [p, T],
        [_, T],
        [_, M],
        [b, M],
        [b, h],
        [D, h]
      ];
    })()).map(([M, X], v) => `${v === 0 ? "M" : "L"} ${x(M)} ${x(X)}`).join(" ");
    g.push({
      id: `${s.from}->${s.to}:${a}`,
      from: s.from,
      to: s.to,
      type: a,
      d: j,
      arrow: { x: x(D), y: x(h), dir: S }
    });
  }
  return g;
}
function Ot(t, e, n, r, o = 6) {
  if (t <= 0 || e <= 0)
    return { startIndex: 0, endIndex: 0, paddingTop: 0, paddingBottom: 0 };
  const i = Math.max(0, n), g = Math.floor(i / e), c = Math.ceil((i + Math.max(0, r)) / e), s = Math.min(Math.max(g - o, 0), t), a = Math.min(Math.max(c + o, s), t);
  return {
    startIndex: s,
    endIndex: a,
    paddingTop: s * e,
    paddingBottom: (t - a) * e
  };
}
export {
  Tt as GANTT_CALENDAR_24_7,
  yt as GANTT_PANE_COLUMNS,
  Nt as flattenGanttTasks,
  bt as formatGanttVariance,
  nt as ganttAddWorkingMs,
  Et as ganttColumnWidths,
  $t as ganttColumns,
  Pt as ganttConnectors,
  Ft as ganttFitHourStep,
  Yt as ganttFitRange,
  ct as ganttFitUnit,
  pt as ganttIsWorking,
  xt as ganttPaneColumns,
  lt as ganttProgress,
  st as ganttRange,
  It as ganttRangeColumns,
  wt as ganttRangeLabel,
  Ot as ganttRowWindow,
  G as ganttSpan,
  St as ganttSpanLabel,
  Mt as ganttSubWorkingMs,
  ft as ganttTaskStatus,
  Q as ganttVarianceDays,
  U as ganttWorkingMs,
  N as ganttWorkingPeriodsOn,
  rt as ganttWorkingSegments,
  Dt as shiftGanttAnchor
};
//# sourceMappingURL=index100.js.map
