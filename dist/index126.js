const u = { maxGapMs: 35, minLength: 4, terminators: ["Enter"] }, c = (t) => [...t].length === 1, f = (t) => t === "Backspace" || t === "Delete";
function h(t, l = {}) {
  const n = { ...u, ...l };
  let e = 0, i;
  for (const r of t) {
    if (f(r.key)) return "keyboard";
    if (c(r.key)) {
      if (i !== void 0 && r.at - i > n.maxGapMs) return "keyboard";
      i = r.at, e++;
    }
  }
  return e >= n.minLength ? "scanner" : "keyboard";
}
function d(t = {}) {
  const l = { ...u, ...t };
  let n = "", e = -1 / 0, i = !1;
  const r = () => {
    n = "", e = -1 / 0, i = !1;
  }, o = () => {
    const s = !i && [...n].length >= l.minLength ? n : null;
    return r(), s;
  };
  return {
    push(s, a) {
      return n && a - e > l.maxGapMs && r(), l.terminators.includes(s) ? n ? o() : null : f(s) ? (n && (i = !0, e = a), null) : (c(s) && (n += s, e = a), null);
    },
    flush(s) {
      return !n || s - e <= l.maxGapMs ? null : o();
    },
    pending: () => n.length > 0,
    reset: r
  };
}
export {
  u as DEFAULT_SCAN_OPTIONS,
  h as classifyEntry,
  d as createScanBuffer
};
//# sourceMappingURL=index126.js.map
