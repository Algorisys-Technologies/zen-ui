function w(t, c, n) {
  if (c === n) return !0;
  const e = [n], r = /* @__PURE__ */ new Set();
  for (; e.length; ) {
    const o = e.pop();
    if (o === c) return !0;
    if (!r.has(o)) {
      r.add(o);
      for (const h of t) h.from === o && e.push(h.to);
    }
  }
  return !1;
}
function y(t, c, n, e) {
  const r = new Set(t.map((o) => o.id));
  return !r.has(n) || !r.has(e) ? { ok: !1, reason: "unknown" } : n === e ? { ok: !1, reason: "self" } : c.some((o) => o.from === n && o.to === e) ? { ok: !1, reason: "duplicate" } : w(c, n, e) ? { ok: !1, reason: "cycle" } : { ok: !0, reason: null };
}
function M(t, c) {
  const n = [];
  for (const e of c) y(t, n, e.from, e.to).ok && n.push(e);
  return n;
}
function k(t, c) {
  const n = M(t, c);
  return n.length > 0 || t.length < 2 ? { links: n, implicit: !1 } : { links: t.slice(1).map((e, r) => ({ from: t[r].id, to: e.id })), implicit: !0 };
}
function v(t, c) {
  const { links: n, implicit: e } = k(t, c), r = /* @__PURE__ */ new Map(), o = (i, d = /* @__PURE__ */ new Set()) => {
    const s = r.get(i);
    if (s !== void 0) return s;
    if (d.has(i)) return 0;
    d.add(i);
    const l = n.filter((a) => a.to === i).map((a) => a.from), f = l.length ? Math.max(...l.map((a) => o(a, d))) + 1 : 0;
    return r.set(i, f), f;
  };
  t.forEach((i) => o(i.id));
  const h = t.length ? Math.max(...t.map((i) => r.get(i.id) ?? 0)) + 1 : 0, p = Array.from({ length: h }, () => []);
  t.forEach((i) => p[r.get(i.id) ?? 0].push(i));
  const m = /* @__PURE__ */ new Map();
  return p.forEach((i, d) => {
    if (d > 0) {
      const s = new Map(i.map((f, a) => [f.id, a])), l = (f) => {
        const a = n.filter((u) => u.to === f.id).map((u) => m.get(u.from)).filter((u) => u !== void 0);
        return a.length ? a.reduce((u, g) => u + g, 0) / a.length : s.get(f.id);
      };
      i.sort((f, a) => l(f) - l(a) || s.get(f.id) - s.get(a.id));
    }
    i.forEach((s, l) => m.set(s.id, l));
  }), { layers: p, links: n, implicit: e };
}
function x(t, c, n) {
  const { links: e } = k(t, c);
  return t.filter((r) => !n.has(r.id) && e.filter((o) => o.to === r.id).every((o) => n.has(o.from))).map((r) => r.id);
}
export {
  y as canAddLink,
  k as effectiveLinks,
  v as routingLayout,
  x as startableSteps,
  w as wouldCreateCycle
};
//# sourceMappingURL=index150.js.map
