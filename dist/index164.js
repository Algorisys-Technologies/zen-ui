const c = 10;
function i(u, e, r, t = 10) {
  if (r <= 0) return null;
  const a = Math.min(Math.max(e, 0), r - 1);
  switch (u) {
    case "ArrowDown":
      return Math.min(a + 1, r - 1);
    case "ArrowUp":
      return Math.max(a - 1, 0);
    case "Home":
      return 0;
    case "End":
      return r - 1;
    case "PageDown":
      return Math.min(a + t, r - 1);
    case "PageUp":
      return Math.max(a - t, 0);
    default:
      return null;
  }
}
function s(u) {
  const e = u;
  if (!e || typeof e.tagName != "string") return !1;
  const r = e.tagName;
  if (r === "INPUT" || r === "TEXTAREA" || r === "SELECT" || e.isContentEditable) return !0;
  const t = e.getAttribute?.("role");
  return t === "combobox" || t === "listbox" || t === "slider" || t === "spinbutton" || t === "menu";
}
function l(u, e, r, t, a = !1) {
  if (r <= 0 || t <= 0) return null;
  const n = Math.min(Math.max(e.row, 0), r - 1), o = Math.min(Math.max(e.col, 0), t - 1);
  switch (u) {
    case "ArrowDown":
      return { row: Math.min(n + 1, r - 1), col: o };
    case "ArrowUp":
      return { row: Math.max(n - 1, 0), col: o };
    case "ArrowRight":
      return { row: n, col: Math.min(o + 1, t - 1) };
    case "ArrowLeft":
      return { row: n, col: Math.max(o - 1, 0) };
    case "Home":
      return a ? { row: 0, col: 0 } : { row: n, col: 0 };
    case "End":
      return a ? { row: r - 1, col: t - 1 } : { row: n, col: t - 1 };
    case "PageDown":
      return { row: Math.min(n + 10, r - 1), col: o };
    case "PageUp":
      return { row: Math.max(n - 10, 0), col: o };
    default:
      return null;
  }
}
export {
  c as ROW_PAGE_STEP,
  l as cellKeyTarget,
  s as ownsArrowKeys,
  i as rowKeyTarget
};
//# sourceMappingURL=index164.js.map
