import { ganttWorkingMs as Q, ganttAddWorkingMs as V, ganttSubWorkingMs as _ } from "./index98.js";
import { productionSetupPlan as $, productionPlacement as X, flattenProductionResources as v, productionConflicts as tt, productionSequenceConflicts as et } from "./index100.js";
const N = 6e4, st = {
  "finish-to-start": { from: "end", to: "start" },
  "start-to-start": { from: "start", to: "start" },
  "finish-to-finish": { from: "end", to: "end" },
  "start-to-finish": { from: "start", to: "end" }
}, nt = (r, c, s) => {
  const i = c * N;
  return i === 0 ? r : i > 0 ? s ? V(s, r, i) : new Date(r.getTime() + i) : s ? _(s, r, -i) : new Date(r.getTime() + i);
}, L = (r, c, s, i, a, l = i) => {
  const m = l ? Q(l, c.span.start, c.span.end) : c.span.end.getTime() - c.span.start.getTime(), h = Math.max(0, (r.setupMinutes ?? a ?? 0) * N), d = Math.max(0, (m - h) / N);
  return X(
    { ...r, start: s, end: void 0, runMinutes: d },
    i,
    { setupMinutes: a }
  );
};
function it(r, c, s, i = {}) {
  const { calendar: a, calendarFor: l, resources: m, setupMatrix: h } = i, d = (t) => l?.(t) ?? a, k = h ? $(r, h) : null, I = new Map(r.map((t) => [t.id, t])), o = /* @__PURE__ */ new Map(), y = /* @__PURE__ */ new Map(), f = /* @__PURE__ */ new Map();
  for (const t of r) {
    const e = X(t, d(t.resourceId), {
      setupMinutes: k?.get(t.id)
    });
    e && (o.set(t.id, e), y.set(t.id, e.span), f.set(t.id, t.resourceId));
  }
  const O = { move: s, cascade: [], conflicts: [], cycles: [] }, M = I.get(s.operationId);
  if (!M || !o.has(s.operationId)) return O;
  const S = s.resourceId ?? M.resourceId;
  f.set(s.operationId, S);
  const A = L(
    { ...M, resourceId: S },
    o.get(s.operationId),
    s.start,
    d(S),
    k?.get(s.operationId),
    d(M.resourceId)
  );
  if (!A) return O;
  o.set(s.operationId, A);
  const B = c.filter(
    (t) => t.from !== t.to && o.has(t.from) && o.has(t.to)
  ), g = /* @__PURE__ */ new Map(), x = /* @__PURE__ */ new Map();
  for (const t of o.keys()) g.set(t, 0);
  for (const t of B) {
    g.set(t.to, (g.get(t.to) ?? 0) + 1);
    const e = x.get(t.from);
    e ? e.push(t) : x.set(t.from, [t]);
  }
  const D = [...g.entries()].filter(([, t]) => t === 0).map(([t]) => t), T = [];
  for (; D.length > 0; ) {
    const t = D.shift();
    T.push(t);
    for (const e of x.get(t) ?? []) {
      const n = (g.get(e.to) ?? 0) - 1;
      g.set(e.to, n), n === 0 && D.push(e.to);
    }
  }
  const P = new Set(T), Y = [...o.keys()].filter((t) => !P.has(t)).sort(), b = /* @__PURE__ */ new Map();
  for (const t of B) {
    if (!P.has(t.from) || !P.has(t.to)) continue;
    const e = b.get(t.to);
    e ? e.push(t) : b.set(t.to, [t]);
  }
  for (const t of T) {
    if (t === s.operationId) continue;
    const e = b.get(t);
    if (!e || e.length === 0) continue;
    const n = o.get(t), u = I.get(t), p = d(f.get(t) ?? u.resourceId);
    let w = n.span.start;
    for (const R of e) {
      const G = o.get(R.from), H = st[R.type ?? "finish-to-start"], Z = H.from === "end" ? G.span.end : G.span.start, W = nt(Z, R.lagMinutes ?? 0, p), E = H.to === "end" ? n.span.end : n.span.start;
      if (W.getTime() <= E.getTime()) continue;
      const J = p ? Q(p, E, W) : W.getTime() - E.getTime(), K = p ? V(p, n.span.start, J) : new Date(n.span.start.getTime() + J);
      K.getTime() > w.getTime() && (w = K);
    }
    if (w.getTime() <= n.span.start.getTime()) continue;
    const z = L(u, n, w, p, k?.get(t));
    z && o.set(t, z);
  }
  const C = [], F = (t, e) => {
    const n = y.get(t), u = o.get(t)?.span;
    !n || !u || n.start.getTime() === u.start.getTime() && n.end.getTime() === u.end.getTime() && e === "moved" && f.get(t) === I.get(t)?.resourceId || C.push({
      operationId: t,
      from: n,
      to: u,
      reason: e,
      ...f.get(t) !== I.get(t)?.resourceId ? { resourceId: f.get(t) } : null
    });
  };
  F(s.operationId, "moved");
  for (const t of T) {
    if (t === s.operationId) continue;
    const e = y.get(t), n = o.get(t)?.span;
    !e || !n || (e.start.getTime() !== n.start.getTime() || e.end.getTime() !== n.end.getTime()) && F(t, "pushed");
  }
  const U = r.map((t) => {
    const e = o.get(t.id);
    return e ? {
      ...t,
      resourceId: f.get(t.id) ?? t.resourceId,
      start: e.span.start,
      end: e.span.end,
      runMinutes: void 0,
      setupMinutes: t.setupMinutes
    } : t;
  }), q = [];
  if (m && m.length > 0) {
    const t = v(m, U, () => !0, { calendar: a });
    q.push(...tt(t.rows, U, { calendar: a }));
  }
  const j = /* @__PURE__ */ new Map();
  for (const [t, e] of o) j.set(t, e);
  return q.push(...et(c, j, { calendar: a })), { move: s, cascade: C, conflicts: q, cycles: Y };
}
export {
  it as productionReschedule
};
//# sourceMappingURL=index101.js.map
