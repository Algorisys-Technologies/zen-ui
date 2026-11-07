const l = (e) => e == null || e === "" ? !0 : Array.isArray(e) ? e.length === 0 || e.every((s) => s == null || s === "") : typeof e == "object" && "value" in e ? l(e.value) : !1;
function c(e) {
  const s = /* @__PURE__ */ new Set(), r = (e.sort ?? []).filter((t) => s.has(t.id) ? !1 : (s.add(t.id), !0)).map((t) => ({ id: t.id, desc: !!t.desc }));
  return {
    version: 1,
    format: e.format,
    filename: e.filename,
    ...e.title ? { title: e.title } : {},
    ...e.locale ? { locale: e.locale } : {},
    scope: e.selectedIds && e.selectedIds.length ? { kind: "selected", ids: [...new Set(e.selectedIds)] } : { kind: "all" },
    columns: e.columns.map((t) => ({ ...t })),
    sort: r,
    filters: {
      ...e.search && e.search.trim() ? { search: e.search.trim() } : {},
      columns: (e.columnFilters ?? []).filter((t) => !l(t.value)).map((t) => ({ id: t.id, value: t.value }))
    },
    grouping: [...new Set(e.grouping ?? [])],
    ...e.context && Object.keys(e.context).length ? { context: e.context } : {}
  };
}
const a = {
  xlsx: { extension: "xlsx", mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
  pdf: { extension: "pdf", mime: "application/pdf" },
  csv: { extension: "csv", mime: "text/csv;charset=utf-8" }
};
export {
  a as EXPORT_FILE,
  c as buildExportRequest
};
//# sourceMappingURL=index211.js.map
