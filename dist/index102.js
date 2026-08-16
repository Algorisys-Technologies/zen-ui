import { ganttWorkingMs as D, ganttWorkingSegments as F, ganttAddWorkingMs as R, ganttSubWorkingMs as N } from "./index100.js";
function O(i, r, d) {
  const n = i.minutes ?? {}, o = d ?? "*", e = [
    r === null ? void 0 : n[r]?.[o],
    r === null ? void 0 : n[r]?.["*"],
    n["*"]?.[o],
    n["*"]?.["*"]
  ];
  for (const t of e)
    if (typeof t == "number") return Math.max(0, t);
  return Math.max(0, i.fallbackMinutes ?? 0);
}
function B(i, r) {
  const d = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map();
  for (const o of i) {
    const e = n.get(o.resourceId);
    e ? e.push(o) : n.set(o.resourceId, [o]);
  }
  for (const o of n.values()) {
    const e = [...o].sort((s, l) => s.start.getTime() - l.start.getTime());
    let t = null;
    for (const s of e)
      d.set(s.id, O(r, t, s.setupFamily ?? null)), t = s.setupFamily ?? null;
  }
  return d;
}
const L = 6e4;
function G(i, r, d = {}) {
  const n = (u, p) => r ? R(r, u, p) : new Date(u.getTime() + p), o = Math.max(0, (i.setupMinutes ?? d.setupMinutes ?? 0) * L), e = new Date(i.start.getTime()), t = o > 0 ? n(e, o) : e;
  let s;
  if (i.end)
    s = new Date(Math.max(i.end.getTime(), t.getTime()));
  else if (typeof i.runMinutes == "number" && i.runMinutes > 0)
    s = n(t, i.runMinutes * L);
  else
    return null;
  const l = { start: e, end: s };
  if (l.end.getTime() <= l.start.getTime()) return null;
  let a = null, f = l;
  if (r) {
    const u = F(r, l.start, l.end, d);
    u.length > 0 && (f = { start: u[0].start, end: u[u.length - 1].end }, a = u.length > 1 ? u : null);
  }
  return {
    operation: i,
    setup: o > 0 ? { start: e, end: t } : null,
    run: { start: t, end: s },
    span: f,
    segments: a
  };
}
function H(i) {
  const r = [];
  for (const o of i) {
    const e = o.operation.load ?? 1;
    e <= 0 || (r.push({ at: o.span.start.getTime(), delta: e }), r.push({ at: o.span.end.getTime(), delta: -e }));
  }
  r.sort((o, e) => o.at - e.at || o.delta - e.delta);
  let d = 0, n = 0;
  for (const o of r)
    d += o.delta, d > n && (n = d);
  return n;
}
function U(i, r) {
  const d = [...i].sort(
    (t, s) => t.span.start.getTime() - s.span.start.getTime() || t.span.end.getTime() - s.span.end.getTime()
  ), n = [], o = [];
  let e = 0;
  for (const t of d) {
    const s = t.span.start.getTime();
    let l = !1;
    for (let a = 0; a < n.length; a++)
      if (s >= o[a]) {
        n[a].push(t), o[a] = t.span.end.getTime(), l = !0;
        break;
      }
    if (!l) {
      if (n.length >= r) {
        e += 1;
        continue;
      }
      n.push([t]), o.push(t.span.end.getTime());
    }
  }
  return { lanes: n, overflow: e };
}
function z(i, r, d, n = {}) {
  const { calendar: o, maxLanes: e = 3, setupMatrix: t, ...s } = n, l = t ? B(r, t) : null, a = /* @__PURE__ */ new Map();
  for (const c of r) {
    const g = a.get(c.resourceId);
    g ? g.push(c) : a.set(c.resourceId, [c]);
  }
  const f = (c, g) => {
    for (const h of a.get(c.id) ?? []) g.push(h);
    for (const h of c.children ?? []) f(h, g);
    return g;
  }, u = (c) => {
    if (typeof c.capacity == "number" && c.capacity > 0) return c.capacity;
    const g = c.children ?? [];
    return g.length === 0 ? 1 : g.reduce((h, y) => h + u(y), 0);
  }, p = [], m = /* @__PURE__ */ new Map(), k = /* @__PURE__ */ new Map(), T = (c, g) => {
    m.set(c.id, g);
    for (const h of c.children ?? []) T(h, g);
  }, w = (c, g, h) => {
    const y = c.children ?? [], x = y.length > 0, b = x ? d(c) : !1, v = p.length, P = (M) => M.map(
      (I) => G(I, c.calendar ?? o, {
        ...s,
        setupMinutes: l?.get(I.id)
      })
    ).filter((I) => I !== null), S = P(f(c, [])), W = b ? P(a.get(c.id) ?? []) : S, { lanes: C, overflow: A } = U(W, e), E = u(c);
    if (p.push({
      resource: c,
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
    }), m.set(c.id, v), C.forEach((M, I) => {
      for (const q of M)
        k.set(q.operation.id, { rowIndex: v, lane: I });
    }), !!x)
      if (b) for (const M of y) w(M, g + 1, c.id);
      else for (const M of y) T(M, v);
  };
  for (const c of i) w(c, 0, null);
  return { rows: p, rowIndexById: m, operationIndex: k };
}
function J(i, r, d = {}) {
  const { calendar: n, capacity: o = 1 } = d;
  return r.map((e) => {
    const t = e.start.getTime(), s = e.end.getTime(), a = (n ? D(n, e.start, e.end) : Math.max(0, s - t)) * Math.max(0, o);
    let f = 0;
    for (const u of i) {
      const p = u.operation.load ?? 1;
      if (p <= 0) continue;
      const m = u.segments ?? [u.span];
      for (const k of m) {
        const T = Math.max(k.start.getTime(), t), w = Math.min(k.end.getTime(), s);
        w <= T || (f += (n ? D(n, new Date(T), new Date(w)) : w - T) * p);
      }
    }
    return {
      start: e.start,
      end: e.end,
      availableMs: a,
      bookedMs: f,
      utilisation: a > 0 ? f / a : null,
      overloaded: a > 0 && f > a
    };
  });
}
const _ = {
  "finish-to-start": { from: "end", to: "start" },
  "start-to-start": { from: "start", to: "start" },
  "finish-to-finish": { from: "end", to: "end" },
  "start-to-finish": { from: "start", to: "end" }
};
function K(i, r, d = {}) {
  const { calendar: n } = d, o = [];
  for (const e of i) {
    if (e.from === e.to) continue;
    const t = r.get(e.from), s = r.get(e.to);
    if (!t || !s) continue;
    const l = e.type ?? "finish-to-start", a = _[l], f = a.from === "end" ? t.span.end : t.span.start, u = a.to === "end" ? s.span.end : s.span.start, p = (e.lagMinutes ?? 0) * L;
    let m;
    p > 0 ? m = n ? R(n, f, p) : new Date(f.getTime() + p) : p < 0 ? m = n ? N(n, f, -p) : new Date(f.getTime() + p) : m = f, u.getTime() < m.getTime() && o.push({
      kind: "sequence",
      resourceId: s.operation.resourceId,
      operationIds: [e.from, e.to]
    });
  }
  return o;
}
function Q(i, r, d = {}) {
  const n = [], o = /* @__PURE__ */ new Set(), e = (t) => {
    o.add(t.id);
    for (const s of t.children ?? []) e(s);
  };
  for (const t of i) e(t.resource);
  for (const t of i) {
    const s = t.subtree;
    t.overloaded && n.push({
      kind: "over-capacity",
      resourceId: t.resource.id,
      operationIds: s.map((a) => a.operation.id)
    });
    const l = t.resource.calendar ?? d.calendar;
    if (l)
      for (const a of s)
        D(l, a.span.start, a.span.end) === 0 && n.push({
          kind: "non-working",
          resourceId: t.resource.id,
          operationIds: [a.operation.id]
        });
  }
  for (const t of r)
    o.has(t.resourceId) || n.push({ kind: "unknown-resource", resourceId: t.resourceId, operationIds: [t.id] });
  return n;
}
export {
  z as flattenProductionResources,
  U as packProductionLanes,
  Q as productionConflicts,
  J as productionLoad,
  H as productionPeakLoad,
  G as productionPlacement,
  K as productionSequenceConflicts,
  O as productionSetupMinutes,
  B as productionSetupPlan
};
//# sourceMappingURL=index102.js.map
