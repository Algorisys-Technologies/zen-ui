const f = ["available", "rows", "columns", "values"], b = ["sum", "count", "avg", "min", "max"], w = () => ({
  rows: [],
  columns: [],
  values: [],
  filters: {}
}), m = (e, n) => e.find((r) => r.key === n)?.label ?? n, d = (e) => e === "available" ? "Available fields" : e === "rows" ? "Rows" : e === "columns" ? "Columns" : "Values", g = (e, n) => e.rows.includes(n) ? "rows" : e.columns.includes(n) ? "columns" : e.values.some((r) => r.id === n) ? "values" : "available", x = (e) => e.type === "measure" ? "sum" : "count", h = (e, n) => ({
  ...e,
  rows: e.rows.filter((r) => r !== n),
  columns: e.columns.filter((r) => r !== n),
  values: e.values.filter((r) => r.id !== n)
}), p = (e, n, r, l = {}) => {
  const t = (i, o) => {
    const a = [...i], v = l.index === void 0 ? a.length : Math.max(0, Math.min(a.length, l.index));
    return a.splice(v, 0, o), a;
  }, s = h(e, n);
  switch (r) {
    case "available":
      return s;
    case "rows":
      return { ...s, rows: t(s.rows, n) };
    case "columns":
      return { ...s, columns: t(s.columns, n) };
    case "values":
      return { ...s, values: t(s.values, { id: n, aggregation: l.aggregation ?? "sum" }) };
    default:
      return e;
  }
}, F = (e, n, r) => ({
  ...e,
  values: e.values.map((l) => l.id === n ? { ...l, aggregation: r } : l)
}), A = (e, n) => n.filter((r) => g(e, r.key) === "available"), S = (e) => e.values.length > 0 && (e.rows.length > 0 || e.columns.length > 0), u = (e) => [...new Set(e.filter((n) => n !== ""))], k = (e) => {
  if (e.kind === "include") return { kind: "include", values: u(e.values) };
  const n = e.optionSearch?.trim();
  return {
    kind: "all",
    ...n ? { optionSearch: n } : {},
    exclude: u(e.exclude)
  };
}, c = (e) => e ? e.kind === "include" ? e.values.length > 0 : !!e.optionSearch?.trim() || e.exclude.length > 0 : !1, $ = (e, n) => e ? e.kind === "include" ? e.values.includes(n) : !e.exclude.includes(n) : !0, O = (e) => Object.values(e).some(c), L = (e) => !c(e) || !e ? "" : e.kind === "include" ? e.values.length === 1 ? e.values[0] : `${e.values.length} selected` : e.exclude.length ? `All except ${e.exclude.length}` : "All", V = (e, n, r, l) => {
  const t = m(e, n);
  if (r === "available") return `${t} removed from the layout.`;
  const s = l === void 0 ? "" : ` at position ${l + 1}`;
  return `${t} moved to ${d(r)}${s}.`;
};
export {
  b as PIVOT_AGGREGATIONS,
  f as PIVOT_ZONES,
  A as availableFields,
  w as createEmptyLayout,
  x as defaultAggregationForField,
  L as describeFilterSelection,
  V as describeMove,
  m as fieldLabel,
  O as hasActiveFilters,
  c as isFilterActive,
  S as isLayoutRenderable,
  $ as isValueSelected,
  p as moveFieldToZone,
  k as normalizeFilterSelection,
  h as removeFieldFromLayout,
  F as updateValueAggregation,
  d as zoneLabel,
  g as zoneOf
};
//# sourceMappingURL=index74.js.map
