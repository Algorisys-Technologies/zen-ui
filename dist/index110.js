import { startOfWeek as P, planningRange as et, planningColumns as nt, shiftPlanningAnchor as rt, planningRangeLabel as ot } from "./index255.js";
const G = 1440, Ft = {
  id: "24/7",
  week: Array.from({ length: 7 }, () => [{ from: 0, to: G }])
}, Y = (t, e) => new Date(
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
), at = (t, e) => t.getFullYear() === e.getFullYear() && t.getMonth() === e.getMonth() && t.getDate() === e.getDate(), H = (t) => {
  const e = t.map((r) => ({ from: Math.max(0, Math.min(G, r.from)), to: Math.max(0, Math.min(G, r.to)) })).filter((r) => r.to > r.from).sort((r, o) => r.from - o.from), n = [];
  for (const r of e) {
    const o = n[n.length - 1];
    o && r.from <= o.to ? o.to = Math.max(o.to, r.to) : n.push({ ...r });
  }
  return n;
};
function A(t, e) {
  const n = t.exceptions?.find((r) => at(r.date, e));
  return H(n ? n.periods : t.week[e.getDay()] ?? []);
}
function Yt(t, e) {
  const n = e.getTime();
  for (const r of A(t, e))
    if (n >= Y(e, r.from).getTime() && n < Y(e, r.to).getTime()) return !0;
  return !1;
}
const W = 366 * 10;
function B(t, e, n) {
  const r = n.getTime();
  if (r <= e.getTime()) return 0;
  let o = 0, i = E(e);
  for (let a = 0; a < W && i.getTime() < r; a++) {
    for (const u of A(t, i)) {
      const s = Math.max(Y(i, u.from).getTime(), e.getTime()), c = Math.min(Y(i, u.to).getTime(), r);
      c > s && (o += c - s);
    }
    i = I(i, 1);
  }
  return o;
}
function st(t, e, n) {
  if (n <= 0) return new Date(e.getTime());
  let r = n, o = E(e);
  for (let i = 0; i < W; i++) {
    for (const a of A(t, o)) {
      const u = Math.max(Y(o, a.from).getTime(), e.getTime()), s = Y(o, a.to).getTime();
      if (s <= u) continue;
      const c = s - u;
      if (c >= r) return new Date(u + r);
      r -= c;
    }
    o = I(o, 1);
  }
  return new Date(o.getTime());
}
function yt(t, e, n) {
  if (n <= 0) return new Date(e.getTime());
  let r = n, o = E(e);
  for (let i = 0; i < W; i++) {
    const a = A(t, o).slice().reverse();
    for (const u of a) {
      const s = Y(o, u.from).getTime(), c = Math.min(Y(o, u.to).getTime(), e.getTime());
      if (c <= s) continue;
      const g = c - s;
      if (g >= r) return new Date(c - r);
      r -= g;
    }
    o = I(o, -1);
  }
  return new Date(o.getTime());
}
function it(t, e, n, r = {}) {
  const o = n.getTime();
  if (o <= e.getTime()) return [];
  const i = r.minGapMs ?? 0, a = r.maxSegments ?? 500, u = [];
  let s = E(e);
  for (let c = 0; c < W && s.getTime() < o; c++) {
    for (const g of A(t, s)) {
      const f = Math.max(Y(s, g.from).getTime(), e.getTime()), m = Math.min(Y(s, g.to).getTime(), o);
      if (m <= f) continue;
      const l = u[u.length - 1];
      l && f - l.end.getTime() <= i ? l.end = new Date(m) : u.push({ start: new Date(f), end: new Date(m) });
    }
    s = I(s, 1);
  }
  return u.length > a ? [{ start: u[0].start, end: u[u.length - 1].end }] : u;
}
const R = 1440 * 60 * 1e3, E = (t) => new Date(t.getFullYear(), t.getMonth(), t.getDate(), 0, 0, 0, 0), I = (t, e) => new Date(t.getFullYear(), t.getMonth(), t.getDate() + e, 0, 0, 0, 0), k = (t) => new Date(t.getFullYear(), Math.floor(t.getMonth() / 3) * 3, 1, 0, 0, 0, 0), ut = (t) => new Date(t.getFullYear(), 0, 1, 0, 0, 0, 0), F = (t) => t.toLocaleString(void 0, { month: "short" });
function N(t, e) {
  if (t === "quarter") {
    const n = k(e);
    return { start: n, end: new Date(n.getFullYear(), n.getMonth() + 3, 1, 0, 0, 0, 0) };
  }
  if (t === "year") {
    const n = ut(e);
    return { start: n, end: new Date(n.getFullYear() + 1, 0, 1, 0, 0, 0, 0) };
  }
  return et(t, e);
}
function xt(t, e, n) {
  if (t === "quarter") {
    const r = k(e);
    return new Date(r.getFullYear(), r.getMonth() + n * 3, 1, 0, 0, 0, 0);
  }
  return t === "year" ? new Date(e.getFullYear() + n, 0, 1, 0, 0, 0, 0) : rt(t, e, n);
}
function bt(t, e) {
  if (t === "quarter") {
    const n = k(e);
    return `Q${Math.floor(n.getMonth() / 3) + 1} ${n.getFullYear()}`;
  }
  return t === "year" ? String(e.getFullYear()) : ot(t, e);
}
const _ = (t, e) => t.map((n) => ({
  ...n,
  nonWorking: B(e, n.start, n.end) === 0
}));
function Nt(t, e, n = {}) {
  const { calendar: r } = n;
  if (t === "month" && n.monthUnit === "week") {
    const s = n.now ?? /* @__PURE__ */ new Date(), { start: c, end: g } = N(t, e), f = [];
    for (let m = c; m.getTime() < g.getTime(); ) {
      const l = I(P(m), 7), h = l.getTime() < g.getTime() ? l : g, T = I(h, -1);
      f.push({
        start: m,
        end: h,
        // "1–7": a range, because a week column is a span the reader measures
        // a bar against, not a point. One-day stubs (a month ending on a Monday)
        // say just their date.
        label: T.getDate() === m.getDate() ? String(m.getDate()) : `${m.getDate()}–${T.getDate()}`,
        sublabel: n.grouped ? "" : F(m),
        nonWorking: !1,
        today: s.getTime() >= m.getTime() && s.getTime() < h.getTime()
      }), m = h;
    }
    return r ? _(f, r) : f;
  }
  if (t !== "quarter" && t !== "year") {
    const s = nt(t, e, n);
    return r ? _(s, r) : s;
  }
  const o = n.now ?? /* @__PURE__ */ new Date(), { start: i, end: a } = N(t, e), u = [];
  if (t === "year") {
    for (let s = i; s.getTime() < a.getTime(); ) {
      const c = new Date(s.getFullYear(), s.getMonth() + 1, 1, 0, 0, 0, 0);
      u.push({
        start: s,
        end: c,
        label: F(s),
        // The year is already in the range label; repeating it in all twelve
        // columns is noise.
        sublabel: "",
        // A week or a month is neither working nor non-working — the weekend is
        // inside every one of them, so shading any of them says nothing.
        nonWorking: !1,
        today: o.getTime() >= s.getTime() && o.getTime() < c.getTime()
      }), s = c;
    }
    return r ? _(u, r) : u;
  }
  for (let s = i; s.getTime() < a.getTime(); ) {
    const c = I(P(s), 7), g = c.getTime() < a.getTime() ? c : a;
    u.push({
      start: s,
      end: g,
      label: `${s.getDate()} ${F(s)}`,
      sublabel: "",
      nonWorking: !1,
      today: o.getTime() >= s.getTime() && o.getTime() < g.getTime()
    }), s = g;
  }
  return r ? _(u, r) : u;
}
const K = 3600 * 1e3, q = (t) => String(t).padStart(2, "0"), ct = (t) => new Date(t.getFullYear(), t.getMonth(), 1, 0, 0, 0, 0), lt = (t) => new Date(t.getFullYear(), t.getMonth(), t.getDate(), t.getHours(), 0, 0, 0);
function gt(t) {
  const e = t / R;
  return e <= 2 ? "hour" : e <= 45 ? "day" : e <= 315 ? "week" : "month";
}
const U = [0.25, 0.5, 1, 2, 3, 4, 6];
function Et(t, e = 16) {
  const n = t / K, r = Math.max(1, e);
  for (const o of U)
    if (n / o <= r) return o;
  return U[U.length - 1];
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
    const n = t.workingMinutes * 6e4, r = e ? st(e, t.start, n) : new Date(t.start.getTime() + n);
    return { start: new Date(t.start.getTime()), end: r };
  }
  return null;
}, X = (t, e) => {
  if (t.milestone) {
    const r = t.actualEnd ?? t.actualStart;
    return r ? { start: new Date(r.getTime()), end: new Date(r.getTime()), open: !1 } : null;
  }
  if (!t.actualStart) return null;
  const n = t.actualStart.getTime();
  if (t.actualEnd) {
    const r = t.actualEnd.getTime();
    return { start: new Date(Math.min(n, r)), end: new Date(Math.max(n, r)), open: !1 };
  }
  return { start: new Date(n), end: new Date(Math.max(n, e.getTime())), open: !0 };
}, j = (t, e) => e === "hour" ? lt(t) : e === "day" ? E(t) : e === "week" ? P(t) : ct(t), ft = (t, e) => {
  const n = j(t, e);
  return n.getTime() === t.getTime() ? n : e === "hour" ? new Date(n.getFullYear(), n.getMonth(), n.getDate(), n.getHours() + 1, 0, 0, 0) : e === "day" ? I(n, 1) : e === "week" ? I(n, 7) : new Date(n.getFullYear(), n.getMonth() + 1, 1, 0, 0, 0, 0);
};
function Ot(t, e = {}) {
  const { calendar: n, padFraction: r = 0.04, minPadMs: o = K, now: i = /* @__PURE__ */ new Date() } = e;
  let a = Number.POSITIVE_INFINITY, u = Number.NEGATIVE_INFINITY;
  const s = (f) => {
    const m = Q(f, n);
    m && (a = Math.min(a, m.start.getTime()), u = Math.max(u, m.end.getTime()));
    const l = X(f, i);
    l && (a = Math.min(a, l.start.getTime()), u = Math.max(u, l.end.getTime()));
    for (const h of f.children ?? []) s(h);
  };
  for (const f of t) s(f);
  if (a === Number.POSITIVE_INFINITY) return null;
  const c = Math.max(o, (u - a) * r), g = gt(u - a + 2 * c);
  return {
    start: j(new Date(a - c), g),
    end: ft(new Date(u + c), g)
  };
}
const mt = ["S", "M", "T", "W", "T", "F", "S"];
function _t(t, e, n = {}) {
  const r = n.now ?? /* @__PURE__ */ new Date(), o = n.nonWorkingDays ?? [0, 6], [i, a] = n.workingHours ?? [9, 18], { calendar: u } = n, s = t.end.getTime(), c = [];
  if (s <= t.start.getTime()) return c;
  const g = t.start.getFullYear() !== new Date(s - 1).getFullYear(), f = Math.max(
    1,
    Math.round((n.hourStep && n.hourStep > 0 ? n.hourStep : 1) * 60)
  ), m = (d) => e === "hour" ? new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes() + f, 0, 0) : e === "day" ? I(d, 1) : e === "week" ? I(P(d), 7) : new Date(d.getFullYear(), d.getMonth() + 1, 1, 0, 0, 0, 0);
  let l = t.start, h = -1, T = -1;
  for (let d = 0; d < 4096 && l.getTime() < s; d++) {
    const D = m(l);
    if (D.getTime() <= l.getTime()) break;
    const w = D.getTime() < s ? D : t.end;
    let M, p = "", y = !1;
    if (e === "hour") {
      M = `${q(l.getHours())}:${q(l.getMinutes())}`, l.getDate() !== h && !n.grouped && (p = `${l.getDate()} ${F(l)}`), h = l.getDate();
      const $ = l.getHours() + l.getMinutes() / 60;
      y = $ < i || $ >= a;
    } else e === "day" ? (M = String(l.getDate()), p = mt[l.getDay()], y = o.includes(l.getDay())) : e === "week" ? (M = String(l.getDate()), l.getMonth() !== T && !n.grouped && (p = F(l)), T = l.getMonth()) : (M = F(l), g && !n.grouped && (l.getMonth() === 0 || c.length === 0) && (p = String(l.getFullYear())));
    c.push({
      start: l,
      end: w,
      label: M,
      sublabel: p,
      nonWorking: y,
      today: r.getTime() >= l.getTime() && r.getTime() < w.getTime()
    }), l = w;
  }
  return u ? _(c, u) : c;
}
const z = 1500, ht = {
  hour: 36e5,
  day: 864e5,
  week: 7 * 864e5,
  month: 30.44 * 864e5
};
function At(t, e, n) {
  const r = N(t, n);
  if (!e) return { range: r, clamped: !1 };
  const o = new Date(Math.max(e.start.getTime(), e.end.getTime() - 1)), i = {
    start: new Date(Math.min(N(t, e.start).start.getTime(), r.start.getTime())),
    end: new Date(Math.max(N(t, o).end.getTime(), r.end.getTime()))
  }, a = ht[dt(t)];
  if ((i.end.getTime() - i.start.getTime()) / a <= z) return { range: i, clamped: !1 };
  const s = 0.45 * z * a;
  let c = Math.max(i.start.getTime(), n.getTime() - s);
  const g = Math.min(i.end.getTime(), c + 2 * s);
  return c = Math.max(i.start.getTime(), g - 2 * s), {
    range: {
      start: N(t, new Date(c)).start,
      end: N(t, new Date(g - 1)).end
    },
    clamped: !0
  };
}
function Ct(t, e, n, r) {
  const o = e - r, i = e + n + r;
  let a = -1, u = -1;
  const s = [];
  let c = 0;
  for (let g = 0; g < t.length; g++) {
    const f = c + t[g];
    if (f > o && c < i)
      a === -1 && (a = g), u = g, s.push(c);
    else if (c >= i) break;
    c = f;
  }
  return a === -1 ? { first: 0, last: -1, offsets: [] } : { first: a, last: u, offsets: s };
}
function dt(t) {
  return t === "day" ? "hour" : t === "quarter" ? "week" : t === "year" ? "month" : "day";
}
const Tt = (t) => t.toLocaleString(void 0, { month: "long" }), Mt = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
function Pt(t, e) {
  const n = (a) => e === "hour" ? `${a.getFullYear()}-${a.getMonth()}-${a.getDate()}` : e === "month" ? String(a.getFullYear()) : `${a.getFullYear()}-${a.getMonth()}`, r = (a) => e === "hour" ? `${Mt[a.getDay()]} ${a.getDate()} ${F(a)} ${a.getFullYear()}` : e === "month" ? String(a.getFullYear()) : `${Tt(a)} ${a.getFullYear()}`, o = (a) => e === "hour" ? `${a.getDate()} ${F(a)}` : e === "month" ? String(a.getFullYear()) : F(a), i = [];
  return t.forEach((a, u) => {
    const s = i.at(-1);
    if (s && n(t[s.firstColumn].start) === n(a.start)) {
      s.columnCount++, s.end = a.end;
      return;
    }
    i.push({
      start: a.start,
      end: a.end,
      label: r(a.start),
      shortLabel: o(a.start),
      firstColumn: u,
      columnCount: 1
    });
  }), i;
}
function Wt(t) {
  const e = t.start, n = new Date(t.end.getTime() - 1);
  if (t.end.getTime() <= e.getTime()) return "";
  const r = (i) => F(i), o = e.getFullYear() === n.getFullYear();
  return (t.end.getTime() - e.getTime()) / R <= 62 ? o && e.getMonth() === n.getMonth() ? `${e.getDate()} – ${n.getDate()} ${r(n)} ${n.getFullYear()}` : o ? `${e.getDate()} ${r(e)} – ${n.getDate()} ${r(n)} ${n.getFullYear()}` : `${e.getDate()} ${r(e)} ${e.getFullYear()} – ${n.getDate()} ${r(n)} ${n.getFullYear()}` : o && e.getMonth() === n.getMonth() ? `${r(e)} ${e.getFullYear()}` : o ? `${r(e)} – ${r(n)} ${n.getFullYear()}` : `${r(e)} ${e.getFullYear()} – ${r(n)} ${n.getFullYear()}`;
}
const Lt = ["name", "assignees", "status", "variance"];
function Ut(t, e, n, r) {
  const o = [...t];
  if (o.length <= 1 || n <= 0) return o;
  const i = () => o.reduce((a, u) => a + e[u], 0);
  if (i() + r <= n || e[o[0]] + r > n) return o;
  for (; o.length > 1 && i() + r > n; ) o.pop();
  return o;
}
function Vt(t, e, n) {
  const r = e.start.getTime(), o = e.end.getTime() - r;
  if (o <= 0) return t.map(() => 0);
  let i = 0;
  return t.map((a) => {
    const u = (a.end.getTime() - r) / o * n, s = u - i;
    return i = u, s;
  });
}
const V = (t) => Math.min(100, Math.max(0, t));
function L(t, e) {
  const n = Q(t, e);
  if (n) return n;
  let r = Number.POSITIVE_INFINITY, o = Number.NEGATIVE_INFINITY;
  for (const i of t.children ?? []) {
    const a = L(i, e);
    a && (r = Math.min(r, a.start.getTime()), o = Math.max(o, a.end.getTime()));
  }
  return r === Number.POSITIVE_INFINITY ? null : { start: new Date(r), end: new Date(o) };
}
function J(t, e = /* @__PURE__ */ new Date()) {
  const n = X(t, e);
  if (n) return n;
  let r = Number.POSITIVE_INFINITY, o = Number.NEGATIVE_INFINITY, i = !1;
  for (const a of t.children ?? []) {
    const u = J(a, e);
    if (!u) {
      L(a) && (i = !0);
      continue;
    }
    r = Math.min(r, u.start.getTime()), o = Math.max(o, u.end.getTime()), u.open && (i = !0);
  }
  return r === Number.POSITIVE_INFINITY ? null : (i && (o = Math.max(o, e.getTime())), { start: new Date(r), end: new Date(o), open: i });
}
function pt(t, e) {
  if (typeof t.percentComplete == "number") return V(t.percentComplete);
  let n = 0, r = 0, o = 0, i = 0, a = !1;
  const u = (c) => {
    const g = L(c, e);
    return g ? e ? B(e, g.start, g.end) : g.end.getTime() - g.start.getTime() : 0;
  }, s = (c) => {
    const g = c.children ?? [];
    if (g.length === 0) {
      const f = typeof c.percentComplete == "number" ? V(c.percentComplete) : 0;
      typeof c.percentComplete == "number" && (a = !0);
      const m = u(c);
      n += f * m, r += m, o += f, i += 1;
      return;
    }
    if (typeof c.percentComplete == "number") {
      a = !0;
      const f = V(c.percentComplete), m = u(c);
      n += f * m, r += m, o += f, i += 1;
      return;
    }
    for (const f of g) s(f);
  };
  for (const c of t.children ?? []) s(c);
  return !a || i === 0 ? null : r > 0 ? n / r : o / i;
}
function C(t, e) {
  return Math.round((E(t).getTime() - E(e).getTime()) / R);
}
function Gt(t) {
  return t === null ? null : t === 0 ? "On time" : t > 0 ? `+${t}d` : `${t}d`;
}
function Dt(t, e, n, r = /* @__PURE__ */ new Date(), o = null) {
  if (t.status) return t.status;
  if (n !== null && n >= 100 || o && !o.open && n === null) return "complete";
  const i = t.baselineEnd && e ? C(e.end, t.baselineEnd) > 0 : !1, a = e ? e.end.getTime() < r.getTime() : !1;
  return i || a ? "delayed" : o ? "on-track" : n === null || n <= 0 ? "not-started" : "on-track";
}
function Rt(t, e, n = /* @__PURE__ */ new Date(), r = {}) {
  const { calendar: o, deriveFromActuals: i = !0, ...a } = r, u = (l, h, T) => h ? l.baselineEnd ? C(h.end, l.baselineEnd) : !i || !T ? null : T.open ? n.getTime() > h.end.getTime() ? C(n, h.end) : null : C(T.end, h.end) : null, s = (l) => {
    if (!l || !o) return { span: l, segments: null };
    const h = it(o, l.start, l.end, a);
    return h.length === 0 ? { span: l, segments: null } : { span: { start: h[0].start, end: h[h.length - 1].end }, segments: h.length > 1 ? h : null };
  }, c = [], g = /* @__PURE__ */ new Map(), f = (l, h) => {
    g.set(l.id, h);
    for (const T of l.children ?? []) f(T, h);
  }, m = (l, h, T) => {
    const d = l.children ?? [], D = d.length > 0, w = D ? e(l) : !1, { span: M, segments: p } = s(L(l, o)), y = pt(l, o), $ = J(l, n), b = c.length;
    if (c.push({
      task: l,
      depth: h,
      index: b,
      parentId: T,
      hasChildren: D,
      expanded: w,
      span: M,
      segments: p,
      progress: y,
      status: Dt(l, M, y, n, i ? $ : null),
      variance: u(l, M, $),
      actual: $
    }), g.set(l.id, b), !!D)
      if (w)
        for (const x of d) m(x, h + 1, l.id);
      else
        for (const x of d) f(x, b);
  };
  for (const l of t) m(l, 0, null);
  return { rows: c, rowIndexById: g };
}
function kt(t, e, n = "strip") {
  const r = (t - e) / 2;
  if (n === "split") {
    const u = t / 2, s = Math.max(2, Math.floor(Math.min(e, u - 3)));
    return { barTop: u - 1 - s, barHeight: s, actualTop: u + 1, actualHeight: s };
  }
  const o = r, i = o >= 6 ? 2 : o >= 3 ? 1 : 0, a = Math.max(2, Math.min(6, Math.floor(o - i - 1)));
  return { barTop: r, barHeight: e, actualTop: r + e + i, actualHeight: a };
}
const Ht = {
  "not-started": "var(--zen-color-neutral)",
  "on-track": "var(--zen-color-info)",
  delayed: "var(--zen-color-error)",
  complete: "var(--zen-color-success)"
};
function qt(t, e) {
  return wt(t) <= e;
}
function wt(t) {
  return t.length * 6 + 8;
}
function zt(t, e) {
  const n = /* @__PURE__ */ new Set(), r = [];
  for (const o of t) {
    const i = e(o), a = `${i.label}\0${i.color}`;
    n.has(a) || (n.add(a), r.push(i));
  }
  return r;
}
function Bt(t, e, n = "strip") {
  const r = (t - e) / 2, o = r, i = Math.max(2, Math.min(10, o - 1)), a = Math.min(r + e + Math.max(0, (o - i) / 2), t - i);
  return { mainTop: r, mainSize: e, markTop: a, markSize: i };
}
const $t = {
  "finish-to-start": { fromEnd: !0, toEnd: !1 },
  "start-to-start": { fromEnd: !1, toEnd: !1 },
  "finish-to-finish": { fromEnd: !0, toEnd: !0 },
  "start-to-finish": { fromEnd: !1, toEnd: !0 }
}, O = (t) => Math.round(t * 100) / 100;
function Kt(t, e, n) {
  const { axisWidth: r, rowHeight: o } = n, i = n.stub ?? 12, a = [], u = /* @__PURE__ */ new Set();
  for (const s of e) {
    const c = s.type ?? "finish-to-start";
    if (s.from === s.to) continue;
    const g = t.get(s.from), f = t.get(s.to);
    if (!g || !f) continue;
    const m = (S) => `${S.rowIndex}:${O(S.startPct)}:${O(S.widthPct)}:${S.yOffset ?? ""}`;
    if (m(g) === m(f)) continue;
    const l = `${m(g)}->${m(f)}:${c}`;
    if (u.has(l)) continue;
    u.add(l);
    const { fromEnd: h, toEnd: T } = $t[c], d = (S) => S / 100 * r, D = d(h ? g.startPct + g.widthPct : g.startPct), w = d(T ? f.startPct + f.widthPct : f.startPct), M = g.rowIndex * o + (g.yOffset ?? o / 2), p = f.rowIndex * o + (f.yOffset ?? o / 2), y = h ? 1 : -1, $ = T ? -1 : 1, b = D + y * i, x = w - $ * i, Z = (y === $ && $ * (x - b) >= 0 ? [
      [D, M],
      [x, M],
      [x, p],
      [w, p]
    ] : (() => {
      const S = (M + p) / 2;
      return [
        [D, M],
        [b, M],
        [b, S],
        [x, S],
        [x, p],
        [w, p]
      ];
    })()).map(([S, v], tt) => `${tt === 0 ? "M" : "L"} ${O(S)} ${O(v)}`).join(" ");
    a.push({
      id: `${s.from}->${s.to}:${c}`,
      from: s.from,
      to: s.to,
      type: c,
      dependency: s,
      d: Z,
      arrow: { x: O(w), y: O(p), dir: $ }
    });
  }
  return a;
}
function Qt(t, e, n, r, o = 6) {
  if (t <= 0 || e <= 0)
    return { startIndex: 0, endIndex: 0, paddingTop: 0, paddingBottom: 0 };
  const i = Math.max(0, n), a = Math.floor(i / e), u = Math.ceil((i + Math.max(0, r)) / e), s = Math.min(Math.max(a - o, 0), t), c = Math.min(Math.max(u + o, s), t);
  return {
    startIndex: s,
    endIndex: c,
    paddingTop: s * e,
    paddingBottom: (t - c) * e
  };
}
export {
  Ft as GANTT_CALENDAR_24_7,
  z as GANTT_CONTINUOUS_MAX_COLUMNS,
  Lt as GANTT_PANE_COLUMNS,
  Ht as GANTT_STATUS_COLOR,
  Rt as flattenGanttTasks,
  Gt as formatGanttVariance,
  J as ganttActual,
  kt as ganttActualLayout,
  st as ganttAddWorkingMs,
  Vt as ganttColumnWidths,
  Ct as ganttColumnWindow,
  Nt as ganttColumns,
  Kt as ganttConnectors,
  At as ganttContinuousRange,
  Et as ganttFitHourStep,
  Ot as ganttFitRange,
  gt as ganttFitUnit,
  Pt as ganttHeaderGroups,
  Yt as ganttIsWorking,
  qt as ganttLabelFits,
  wt as ganttLabelPx,
  zt as ganttLegendItems,
  Bt as ganttMilestoneLayout,
  Ut as ganttPaneColumns,
  pt as ganttProgress,
  N as ganttRange,
  _t as ganttRangeColumns,
  bt as ganttRangeLabel,
  Qt as ganttRowWindow,
  L as ganttSpan,
  Wt as ganttSpanLabel,
  yt as ganttSubWorkingMs,
  Dt as ganttTaskStatus,
  C as ganttVarianceDays,
  dt as ganttViewUnit,
  B as ganttWorkingMs,
  A as ganttWorkingPeriodsOn,
  it as ganttWorkingSegments,
  xt as shiftGanttAnchor
};
//# sourceMappingURL=index110.js.map
