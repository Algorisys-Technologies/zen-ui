import { ganttWorkingMs as L, ganttAddWorkingMs as Q, ganttSubWorkingMs as Z } from "./index110.js";
import { productionPlacement as F, productionSetupPlan as $, flattenProductionResources as v, productionConflicts as tt, productionSequenceConflicts as et } from "./index112.js";
const E = 6e4, nt = {
  "finish-to-start": { from: "end", to: "start" },
  "start-to-start": { from: "start", to: "start" },
  "finish-to-finish": { from: "end", to: "end" },
  "start-to-finish": { from: "start", to: "end" }
}, st = (s, c, e) => {
  const o = c * E;
  return o === 0 ? s : o > 0 ? e ? Q(e, s, o) : new Date(s.getTime() + o) : e ? Z(e, s, -o) : new Date(s.getTime() + o);
}, K = (s, c, e, o, a, f = o) => {
  const u = f ? L(f, c.span.start, c.span.end) : c.span.end.getTime() - c.span.start.getTime(), d = Math.max(0, (s.setupMinutes ?? a ?? 0) * E), l = Math.max(0, (u - d) / E);
  return F(
    { ...s, start: e, end: void 0, runMinutes: l },
    o,
    { setupMinutes: a }
  );
};
function ot(s, c, e, o = {}) {
  const { calendar: a, calendarFor: f, resources: u, setupMatrix: d } = o, l = (t) => f?.(t) ?? a, k = d ? $(s, d) : null, T = new Map(s.map((t) => [t.id, t])), i = /* @__PURE__ */ new Map(), x = /* @__PURE__ */ new Map(), g = /* @__PURE__ */ new Map();
  for (const t of s) {
    const n = F(t, l(t.resourceId), {
      setupMinutes: k?.get(t.id)
    });
    n && (i.set(t.id, n), x.set(t.id, n.span), g.set(t.id, t.resourceId));
  }
  const W = { move: e, cascade: [], conflicts: [], cycles: [] }, h = T.get(e.operationId);
  if (!h || !i.has(e.operationId)) return W;
  const y = e.resourceId ?? h.resourceId;
  g.set(e.operationId, y);
  const A = K(
    { ...h, resourceId: y },
    i.get(e.operationId),
    e.start,
    l(y),
    k?.get(e.operationId),
    l(h.resourceId)
  );
  if (!A) return W;
  i.set(e.operationId, A);
  const C = c.filter(
    (t) => t.from !== t.to && i.has(t.from) && i.has(t.to)
  ), m = /* @__PURE__ */ new Map(), P = /* @__PURE__ */ new Map();
  for (const t of i.keys()) m.set(t, 0);
  for (const t of C) {
    m.set(t.to, (m.get(t.to) ?? 0) + 1);
    const n = P.get(t.from);
    n ? n.push(t) : P.set(t.from, [t]);
  }
  const S = [...m.entries()].filter(([, t]) => t === 0).map(([t]) => t), M = [];
  for (; S.length > 0; ) {
    const t = S.shift();
    M.push(t);
    for (const n of P.get(t) ?? []) {
      const r = (m.get(n.to) ?? 0) - 1;
      m.set(n.to, r), r === 0 && S.push(n.to);
    }
  }
  const D = new Set(M), V = [...i.keys()].filter((t) => !D.has(t)).sort(), R = /* @__PURE__ */ new Map();
  for (const t of C) {
    if (!D.has(t.from) || !D.has(t.to)) continue;
    const n = R.get(t.to);
    n ? n.push(t) : R.set(t.to, [t]);
  }
  for (const t of M) {
    if (t === e.operationId) continue;
    const n = R.get(t);
    if (!n || n.length === 0) continue;
    const r = i.get(t), p = T.get(t), I = l(g.get(t) ?? p.resourceId);
    let w = r.span.start;
    for (const O of n) {
      const Y = i.get(O.from), j = nt[O.type ?? "finish-to-start"], X = j.from === "end" ? Y.span.end : Y.span.start, b = st(X, O.lagMinutes ?? 0, I), q = j.to === "end" ? r.span.end : r.span.start;
      if (b.getTime() <= q.getTime()) continue;
      const H = I ? L(I, q, b) : b.getTime() - q.getTime(), J = I ? Q(I, r.span.start, H) : new Date(r.span.start.getTime() + H);
      J.getTime() > w.getTime() && (w = J);
    }
    if (w.getTime() <= r.span.start.getTime()) continue;
    const G = K(p, r, w, I, k?.get(t));
    G && i.set(t, G);
  }
  const U = [], _ = (t, n) => {
    const r = x.get(t), p = i.get(t)?.span;
    !r || !p || r.start.getTime() === p.start.getTime() && r.end.getTime() === p.end.getTime() && n === "moved" && g.get(t) === T.get(t)?.resourceId || U.push({
      operationId: t,
      from: r,
      to: p,
      reason: n,
      ...g.get(t) !== T.get(t)?.resourceId ? { resourceId: g.get(t) } : null
    });
  };
  _(e.operationId, "moved");
  for (const t of M) {
    if (t === e.operationId) continue;
    const n = x.get(t), r = i.get(t)?.span;
    !n || !r || (n.start.getTime() !== r.start.getTime() || n.end.getTime() !== r.end.getTime()) && _(t, "pushed");
  }
  const z = s.map((t) => {
    const n = i.get(t.id);
    return n ? {
      ...t,
      resourceId: g.get(t.id) ?? t.resourceId,
      start: n.span.start,
      end: n.span.end,
      runMinutes: void 0,
      setupMinutes: t.setupMinutes
    } : t;
  }), N = [];
  if (u && u.length > 0) {
    const t = v(u, z, () => !0, { calendar: a });
    N.push(...tt(t.rows, z, { calendar: a }));
  }
  const B = /* @__PURE__ */ new Map();
  for (const [t, n] of i) B.set(t, n);
  return N.push(...et(c, B, { calendar: a })), { move: e, cascade: U, conflicts: N, cycles: V };
}
const it = "application/x-zen-operation";
function at(s, c) {
  const e = c * 6e4;
  return e > 0 ? Math.round(s / e) * e : s;
}
function ut(s, c, e, o, a = {}) {
  const u = s.some((d) => d.id === e.id) ? s : [...s, { ...e, resourceId: o.resourceId, start: o.start }];
  return ot(u, c, { operationId: e.id, start: o.start, resourceId: o.resourceId }, a);
}
function dt(s, c, e, o = {}) {
  const a = o.calendarFor?.(c) ?? o.calendar;
  let f = e.getTime();
  for (const u of s) {
    if (u.resourceId !== c) continue;
    const d = F(u, a);
    d && d.span.end.getTime() > f && (f = d.span.end.getTime());
  }
  return new Date(f);
}
export {
  it as PRODUCTION_DRAG_TYPE,
  dt as productionNextFreeStart,
  ut as productionPlaceProposal,
  ot as productionReschedule,
  at as snapToMinutes
};
//# sourceMappingURL=index113.js.map
