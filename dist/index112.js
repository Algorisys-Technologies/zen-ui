import { ganttWorkingMs as D, ganttWorkingSegments as F, ganttAddWorkingMs as R, ganttSubWorkingMs as N } from "./index110.js";
function O(a, s, d) {
  const n = a.minutes ?? {}, o = d ?? "*", e = [
    s === null ? void 0 : n[s]?.[o],
    s === null ? void 0 : n[s]?.["*"],
    n["*"]?.[o],
    n["*"]?.["*"]
  ];
  for (const t of e)
    if (typeof t == "number") return Math.max(0, t);
  return Math.max(0, a.fallbackMinutes ?? 0);
}
function B(a, s) {
  const d = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map();
  for (const o of a) {
    const e = n.get(o.resourceId);
    e ? e.push(o) : n.set(o.resourceId, [o]);
  }
  for (const o of n.values()) {
    const e = [...o].sort((r, u) => r.start.getTime() - u.start.getTime());
    let t = null;
    for (const r of e)
      d.set(r.id, O(s, t, r.setupFamily ?? null)), t = r.setupFamily ?? null;
  }
  return d;
}
const L = 6e4;
function G(a, s, d = {}) {
  const n = (l, p) => s ? R(s, l, p) : new Date(l.getTime() + p), o = Math.max(0, (a.setupMinutes ?? d.setupMinutes ?? 0) * L), e = new Date(a.start.getTime()), t = o > 0 ? n(e, o) : e;
  let r;
  if (a.end)
    r = new Date(Math.max(a.end.getTime(), t.getTime()));
  else if (typeof a.runMinutes == "number" && a.runMinutes > 0)
    r = n(t, a.runMinutes * L);
  else
    return null;
  const u = { start: e, end: r };
  if (u.end.getTime() <= u.start.getTime()) return null;
  let c = null, f = u;
  if (s) {
    const l = F(s, u.start, u.end, d);
    l.length > 0 && (f = { start: l[0].start, end: l[l.length - 1].end }, c = l.length > 1 ? l : null);
  }
  return {
    operation: a,
    setup: o > 0 ? { start: e, end: t } : null,
    run: { start: t, end: r },
    span: f,
    segments: c
  };
}
function H(a) {
  const s = [];
  for (const o of a) {
    const e = o.operation.load ?? 1;
    e <= 0 || (s.push({ at: o.span.start.getTime(), delta: e }), s.push({ at: o.span.end.getTime(), delta: -e }));
  }
  s.sort((o, e) => o.at - e.at || o.delta - e.delta);
  let d = 0, n = 0;
  for (const o of s)
    d += o.delta, d > n && (n = d);
  return n;
}
function U(a, s) {
  const d = [...a].sort(
    (t, r) => t.span.start.getTime() - r.span.start.getTime() || t.span.end.getTime() - r.span.end.getTime()
  ), n = [], o = [];
  let e = 0;
  for (const t of d) {
    const r = t.span.start.getTime();
    let u = !1;
    for (let c = 0; c < n.length; c++)
      if (r >= o[c]) {
        n[c].push(t), o[c] = t.span.end.getTime(), u = !0;
        break;
      }
    if (!u) {
      if (n.length >= s) {
        e += 1;
        continue;
      }
      n.push([t]), o.push(t.span.end.getTime());
    }
  }
  return { lanes: n, overflow: e };
}
function z(a, s, d, n = {}) {
  const { calendar: o, maxLanes: e = 3, setupMatrix: t, ...r } = n, u = t ? B(s, t) : null, c = /* @__PURE__ */ new Map();
  for (const i of s) {
    const g = c.get(i.resourceId);
    g ? g.push(i) : c.set(i.resourceId, [i]);
  }
  const f = (i, g) => {
    for (const h of c.get(i.id) ?? []) g.push(h);
    for (const h of i.children ?? []) f(h, g);
    return g;
  }, l = (i) => {
    if (typeof i.capacity == "number" && i.capacity > 0) return i.capacity;
    const g = i.children ?? [];
    return g.length === 0 ? 1 : g.reduce((h, y) => h + l(y), 0);
  }, p = [], m = /* @__PURE__ */ new Map(), k = /* @__PURE__ */ new Map(), T = (i, g) => {
    m.set(i.id, g);
    for (const h of i.children ?? []) T(h, g);
  }, w = (i, g, h) => {
    const y = i.children ?? [], x = y.length > 0, b = x ? d(i) : !1, v = p.length, P = (M) => M.map(
      (I) => G(I, i.calendar ?? o, {
        ...r,
        setupMinutes: u?.get(I.id)
      })
    ).filter((I) => I !== null), S = P(f(i, [])), W = b ? P(c.get(i.id) ?? []) : S, { lanes: C, overflow: A } = U(W, e), E = l(i);
    if (p.push({
      resource: i,
      depth: g,
      index: v,
      parentId: h,
      hasChildren: x,
      expanded: b,
      capacity: E,
      lanes: C,
      subtree: S,
      overflow: A,
      /* Over the SUBTREE, not over what is drawn: a cell whose children are
         collectively over its capacity is over capacity whether or not it
         happens to be expanded. Expansion is a view state and must not change
         what the schedule says is wrong. */
      overloaded: H(S) > E
    }), m.set(i.id, v), C.forEach((M, I) => {
      for (const q of M)
        k.set(q.operation.id, { rowIndex: v, lane: I });
    }), !!x)
      if (b) for (const M of y) w(M, g + 1, i.id);
      else for (const M of y) T(M, v);
  };
  for (const i of a) w(i, 0, null);
  return { rows: p, rowIndexById: m, operationIndex: k };
}
function J(a, s, d = {}) {
  const { calendar: n, capacity: o = 1 } = d;
  return s.map((e) => {
    const t = e.start.getTime(), r = e.end.getTime(), c = (n ? D(n, e.start, e.end) : Math.max(0, r - t)) * Math.max(0, o);
    let f = 0;
    for (const l of a) {
      const p = l.operation.load ?? 1;
      if (p <= 0) continue;
      const m = l.segments ?? [l.span];
      for (const k of m) {
        const T = Math.max(k.start.getTime(), t), w = Math.min(k.end.getTime(), r);
        w <= T || (f += (n ? D(n, new Date(T), new Date(w)) : w - T) * p);
      }
    }
    return {
      start: e.start,
      end: e.end,
      availableMs: c,
      bookedMs: f,
      utilisation: c > 0 ? f / c : null,
      overloaded: c > 0 && f > c
    };
  });
}
const _ = {
  "finish-to-start": { from: "end", to: "start" },
  "start-to-start": { from: "start", to: "start" },
  "finish-to-finish": { from: "end", to: "end" },
  "start-to-finish": { from: "start", to: "end" }
};
function K(a, s, d = {}) {
  const { calendar: n } = d, o = [];
  for (const e of a) {
    if (e.from === e.to) continue;
    const t = s.get(e.from), r = s.get(e.to);
    if (!t || !r) continue;
    const u = e.type ?? "finish-to-start", c = _[u], f = c.from === "end" ? t.span.end : t.span.start, l = c.to === "end" ? r.span.end : r.span.start, p = (e.lagMinutes ?? 0) * L;
    let m;
    p > 0 ? m = n ? R(n, f, p) : new Date(f.getTime() + p) : p < 0 ? m = n ? N(n, f, -p) : new Date(f.getTime() + p) : m = f, l.getTime() < m.getTime() && o.push({
      kind: "sequence",
      resourceId: r.operation.resourceId,
      operationIds: [e.from, e.to]
    });
  }
  return o;
}
function Q(a, s, d = {}) {
  const n = [], o = /* @__PURE__ */ new Set(), e = (t) => {
    o.add(t.id);
    for (const r of t.children ?? []) e(r);
  };
  for (const t of a) e(t.resource);
  for (const t of a) {
    const r = t.subtree;
    t.overloaded && n.push({
      kind: "over-capacity",
      resourceId: t.resource.id,
      operationIds: r.map((c) => c.operation.id)
    });
    const u = t.resource.calendar ?? d.calendar;
    if (u)
      for (const c of r)
        D(u, c.span.start, c.span.end) === 0 && n.push({
          kind: "non-working",
          resourceId: t.resource.id,
          operationIds: [c.operation.id]
        });
  }
  for (const t of s)
    o.has(t.resourceId) || n.push({ kind: "unknown-resource", resourceId: t.resourceId, operationIds: [t.id] });
  return n;
}
function V(a, s) {
  return s ? Math.max(0, a.getTime() - s.getTime()) : null;
}
export {
  z as flattenProductionResources,
  U as packProductionLanes,
  Q as productionConflicts,
  V as productionLateMs,
  J as productionLoad,
  H as productionPeakLoad,
  G as productionPlacement,
  K as productionSequenceConflicts,
  O as productionSetupMinutes,
  B as productionSetupPlan
};
//# sourceMappingURL=index112.js.map
