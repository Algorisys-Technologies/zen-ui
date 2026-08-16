import { ganttWorkingMs as P, ganttAddWorkingMs as _, ganttSubWorkingMs as B } from "./index100.js";
import { productionSetupPlan as G, productionPlacement as H } from "./index102.js";
const j = 6e4, W = {
  "finish-to-start": { from: "end", to: "start" },
  "start-to-start": { from: "start", to: "start" },
  "finish-to-finish": { from: "end", to: "end" },
  "start-to-finish": { from: "start", to: "end" }
}, k = (e, c, o) => (o ? c.getTime() >= e.getTime() ? P(o, e, c) : -P(o, c, e) : c.getTime() - e.getTime()) / j, q = (e, c, o) => {
  const a = c * j;
  return a === 0 ? e : o ? a > 0 ? _(o, e, a) : B(o, e, -a) : new Date(e.getTime() + a);
}, O = (e, c, o) => q(e, -c, o);
function Q(e, c, o = {}) {
  const { calendar: a, calendarFor: v, setupMatrix: S, until: x } = o, y = (t) => v?.(t) ?? a, z = S ? G(e, S) : null, n = /* @__PURE__ */ new Map(), I = /* @__PURE__ */ new Map();
  for (const t of e) {
    const s = H(t, y(t.resourceId), {
      setupMinutes: z?.get(t.id)
    });
    s && (n.set(t.id, s), I.set(t.id, t.resourceId));
  }
  const C = {
    byOperation: /* @__PURE__ */ new Map(),
    critical: [],
    projectEnd: x ?? /* @__PURE__ */ new Date(0),
    cycles: []
  };
  if (n.size === 0) return C;
  const F = x ?? new Date(Math.max(...[...n.values()].map((t) => t.span.end.getTime()))), U = c.filter((t) => t.from !== t.to && n.has(t.from) && n.has(t.to)), p = /* @__PURE__ */ new Map(), h = /* @__PURE__ */ new Map();
  for (const t of n.keys()) p.set(t, 0);
  for (const t of U) {
    p.set(t.to, (p.get(t.to) ?? 0) + 1);
    const s = h.get(t.from);
    s ? s.push(t) : h.set(t.from, [t]);
  }
  const b = [...p.entries()].filter(([, t]) => t === 0).map(([t]) => t), g = [];
  for (; b.length > 0; ) {
    const t = b.shift();
    g.push(t);
    for (const s of h.get(t) ?? []) {
      const i = (p.get(s.to) ?? 0) - 1;
      p.set(s.to, i), i === 0 && b.push(s.to);
    }
  }
  const A = new Set(g), V = [...n.keys()].filter((t) => !A.has(t)).sort(), D = /* @__PURE__ */ new Map();
  for (let t = g.length - 1; t >= 0; t--) {
    const s = g[t], i = n.get(s), f = y(I.get(s)), d = k(i.span.start, i.span.end, f);
    let r = F;
    for (const l of h.get(s) ?? []) {
      if (!A.has(l.to)) continue;
      const u = n.get(l.to), m = D.get(l.to) ?? F, M = k(u.span.start, u.span.end, f), w = W[l.type ?? "finish-to-start"], N = w.to === "end" ? m : O(m, M, f), T = O(N, l.lagMinutes ?? 0, f), L = w.from === "end" ? T : q(T, d, f);
      L.getTime() < r.getTime() && (r = L);
    }
    D.set(s, r);
  }
  const E = /* @__PURE__ */ new Map();
  for (const t of g) {
    const s = n.get(t), i = y(I.get(t)), f = D.get(t), d = k(s.span.end, f, i);
    let r = d;
    const l = (h.get(t) ?? []).filter((u) => A.has(u.to));
    if (l.length > 0) {
      r = Number.POSITIVE_INFINITY;
      for (const u of l) {
        const m = n.get(u.to), M = W[u.type ?? "finish-to-start"], w = M.to === "end" ? m.span.end : m.span.start, N = O(w, u.lagMinutes ?? 0, i), T = M.from === "end" ? s.span.end : s.span.start;
        r = Math.min(r, k(T, N, i));
      }
      r = Math.min(r, d);
    }
    E.set(t, {
      operationId: t,
      freeFloatMinutes: Math.round(r),
      totalFloatMinutes: Math.round(d),
      critical: Math.round(d) <= 0,
      latestFinish: f
    });
  }
  const Y = g.filter((t) => E.get(t)?.critical).sort((t, s) => n.get(t).span.start.getTime() - n.get(s).span.start.getTime());
  return { byOperation: E, critical: Y, projectEnd: F, cycles: V };
}
export {
  Q as productionCriticalPath
};
//# sourceMappingURL=index104.js.map
