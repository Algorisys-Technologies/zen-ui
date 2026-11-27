function s(o) {
  const r = /* @__PURE__ */ new Map();
  for (const e of o) e.category && r.set(e.category, (r.get(e.category) ?? 0) + 1);
  return [...r].map(([e, t]) => ({ id: e, count: t }));
}
const n = (o) => o.normalize("NFD").replace(new RegExp("\\p{M}", "gu"), "").toLowerCase();
function i(o, r) {
  const e = n(r.query ?? "").split(/\s+/).filter(Boolean);
  return o.filter((t) => {
    if (r.category && t.category !== r.category) return !1;
    if (e.length === 0) return !0;
    const a = n([t.label, t.code ?? "", t.description ?? ""].join(" "));
    return e.every((c) => a.includes(c));
  });
}
export {
  i as filterReasons,
  s as reasonCategories
};
//# sourceMappingURL=index124.js.map
