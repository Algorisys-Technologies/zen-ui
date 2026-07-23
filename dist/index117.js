const n = (e, t) => e.label.toLowerCase().includes(t) || (e.description?.toLowerCase().includes(t) ?? !1), c = (e, t, o) => {
  const r = t.trim().toLowerCase();
  return o || !r ? e : e.filter((s) => n(s, r));
};
export {
  c as filterItems
};
//# sourceMappingURL=index117.js.map
