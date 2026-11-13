function a(n) {
  const e = n.columnDef.meta;
  if (typeof e?.label == "string" && e.label.trim() !== "") return e.label;
  const t = n.columnDef.header;
  return typeof t == "string" && t.trim() !== "" ? t : n.id;
}
function m(n, e, t, r = n) {
  const l = n.indexOf(e);
  if (l < 0) return null;
  const s = new Set(r), o = t === "earlier" ? -1 : 1;
  let i = l + o;
  for (; i >= 0 && i < n.length && !s.has(n[i]); ) i += o;
  if (i < 0 || i >= n.length) return null;
  const u = n.slice();
  return u.splice(l, 1), u.splice(i, 0, e), u;
}
const c = 16, f = 64;
function h(n, e = {}) {
  const t = e.shift ? f : c, r = e.rtl ? "ArrowLeft" : "ArrowRight", l = e.rtl ? "ArrowRight" : "ArrowLeft";
  return n === r ? t : n === l ? -t : null;
}
function E(n, e, t = 20, r = Number.MAX_SAFE_INTEGER) {
  return Math.min(Math.max(Math.round(n + e), t), r);
}
function S(n) {
  return n.respectColumnSizes ?? !!(n.enableColumnPinning || n.enableColumnResizing);
}
function g(n, e) {
  if (n && !(e.explicitSize === void 0 && !e.resized && !e.pinned))
    return Math.round(e.size);
}
export {
  c as COLUMN_RESIZE_STEP,
  f as COLUMN_RESIZE_STEP_LARGE,
  E as clampColumnSize,
  a as columnLabel,
  g as columnMinWidth,
  h as columnResizeDelta,
  m as moveColumn,
  S as respectsColumnSizes
};
//# sourceMappingURL=index247.js.map
