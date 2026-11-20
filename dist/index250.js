function m(t) {
  const n = t.columnDef.meta;
  if (typeof n?.label == "string" && n.label.trim() !== "") return n.label;
  const e = t.columnDef.header;
  return typeof e == "string" && e.trim() !== "" ? e : t.id;
}
function g(t, n, e, r = t) {
  const l = t.indexOf(n);
  if (l < 0) return null;
  const c = new Set(r), s = e === "earlier" ? -1 : 1;
  let i = l + s;
  for (; i >= 0 && i < t.length && !c.has(t[i]); ) i += s;
  if (i < 0 || i >= t.length) return null;
  const o = t.slice();
  return o.splice(l, 1), o.splice(i, 0, n), o;
}
const f = 16, a = 64;
function d(t, n = {}) {
  const e = n.shift ? a : f, r = n.rtl ? "ArrowLeft" : "ArrowRight", l = n.rtl ? "ArrowRight" : "ArrowLeft";
  return t === r ? e : t === l ? -e : null;
}
function C(t, n, e = 20, r = Number.MAX_SAFE_INTEGER) {
  return Math.min(Math.max(Math.round(t + n), e), r);
}
function S(t) {
  return t.respectColumnSizes ?? !!(t.enableColumnPinning || t.enableColumnResizing);
}
function p(t, n) {
  if (t && !(n.explicitSize === void 0 && !n.resized && !n.pinned))
    return Math.round(n.size);
}
function E(t, n) {
  const e = t?.className;
  return typeof e == "function" ? n && e(n.original) || void 0 : e || void 0;
}
function w(t) {
  return t?.headerClassName || void 0;
}
const h = ["__drag__", "__expand__", "__select__"], u = (t) => h.includes(t);
function M(t, n) {
  const e = _(t);
  return { left: e.left.length ? [...n.filter(u), ...e.left] : e.left, right: e.right };
}
function _(t) {
  return { left: (t.left ?? []).filter((n) => !u(n)), right: (t.right ?? []).filter((n) => !u(n)) };
}
export {
  f as COLUMN_RESIZE_STEP,
  a as COLUMN_RESIZE_STEP_LARGE,
  h as UTILITY_COLUMN_IDS,
  C as clampColumnSize,
  E as columnCellClass,
  w as columnHeaderClass,
  m as columnLabel,
  p as columnMinWidth,
  d as columnResizeDelta,
  g as moveColumn,
  S as respectsColumnSizes,
  M as withUtilityPins,
  _ as withoutUtilityPins
};
//# sourceMappingURL=index250.js.map
