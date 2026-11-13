function O(u, k, f, E = {}) {
  const l = new Map(u.map((t) => [t.id, t])), S = { columns: [], edges: [], cut: { upstream: 0, downstream: 0 } };
  if (!l.has(f)) return S;
  const m = k.filter((t) => l.has(t.from) && l.has(t.to)), b = E.maxDepth ?? 1 / 0, a = /* @__PURE__ */ new Map([[f, 0]]), g = { upstream: 0, downstream: 0 }, h = (t) => {
    const o = (r) => t < 0 ? m.filter((n) => n.to === r).map((n) => n.from) : m.filter((n) => n.from === r).map((n) => n.to);
    let c = [f];
    const i = /* @__PURE__ */ new Set([f]);
    for (let r = 1; c.length; r++) {
      const n = [];
      for (const s of c)
        for (const e of o(s))
          if (!i.has(e) && (i.add(e), !a.has(e))) {
            if (r > b) {
              g[t < 0 ? "upstream" : "downstream"]++, n.push(e);
              continue;
            }
            a.set(e, t * r), n.push(e);
          }
      c = n;
    }
  };
  h(-1), h(1);
  const w = m.filter((t) => a.has(t.from) && a.has(t.to)), D = [...new Set(a.values())].sort((t, o) => t - o), v = /* @__PURE__ */ new Map(), x = D.map((t) => ({ level: t, nodes: [] })), p = new Map(x.map((t) => [t.level, t]));
  u.forEach((t) => {
    const o = a.get(t.id);
    o !== void 0 && p.get(o).nodes.push(t);
  });
  const M = (t) => t.nodes.forEach((o, c) => v.set(o.id, c));
  M(p.get(0));
  const y = (t) => {
    const o = p.get(t);
    if (!o) return !1;
    const c = t < 0 ? t + 1 : t - 1, i = (s) => w.filter((e) => e.from === s && a.get(e.to) === c || e.to === s && a.get(e.from) === c).map((e) => v.get(e.from === s ? e.to : e.from) ?? 0), r = new Map(o.nodes.map((s, e) => {
      const d = i(s.id);
      return [s.id, d.length ? d.reduce((F, G) => F + G, 0) / d.length : e];
    })), n = new Map(o.nodes.map((s, e) => [s.id, e]));
    return o.nodes.sort((s, e) => r.get(s.id) - r.get(e.id) || n.get(s.id) - n.get(e.id)), M(o), !0;
  };
  for (let t = -1; y(t); t--) ;
  for (let t = 1; y(t); t++) ;
  return { columns: x, edges: w, cut: g };
}
export {
  O as traceGenealogy
};
//# sourceMappingURL=index148.js.map
