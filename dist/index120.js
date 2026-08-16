const c = (e, t) => Object.prototype.hasOwnProperty.call(e, t), u = (e) => {
  if (typeof e != "object" || e === null) return !1;
  const t = Object.getPrototypeOf(e);
  return t === Object.prototype || t === null;
}, y = (e, t) => {
  if (e === t) return !0;
  if (typeof e == "number" && typeof t == "number") return Number.isNaN(e) && Number.isNaN(t);
  if (e instanceof Date && t instanceof Date) {
    const [n, r] = [e.getTime(), t.getTime()];
    return n === r || Number.isNaN(n) && Number.isNaN(r);
  }
  if (Array.isArray(e) || Array.isArray(t))
    return !Array.isArray(e) || !Array.isArray(t) || e.length !== t.length ? !1 : e.every((n, r) => y(n, t[r]));
  if (u(e) && u(t)) {
    const n = Object.keys(e);
    return n.length !== Object.keys(t).length ? !1 : n.every((r) => c(t, r) && y(e[r], t[r]));
  }
  return !1;
}, O = (e) => {
  if (typeof e != "string") return e;
  const t = e.trim();
  if (t) {
    if (!/^[[{]/.test(t)) return e;
    try {
      return JSON.parse(t);
    } catch {
      return e;
    }
  }
}, g = (e) => u(e), h = (e, t, n) => e ? t ? n ? "unchanged" : "changed" : "removed" : "added", m = (e, t, n = {}) => {
  const r = e ?? {}, o = t ?? {}, d = n.changedOnly ?? !0, p = n.keys ?? [...Object.keys(r), ...Object.keys(o).filter((s) => !c(r, s))], a = [];
  for (const s of p) {
    const i = c(r, s), f = c(o, s);
    if (!i && !f) continue;
    const l = h(i, f, y(r[s], o[s]));
    d && l === "unchanged" || a.push({
      key: s,
      label: n.labels?.[s] ?? s,
      kind: l,
      before: i ? r[s] : void 0,
      after: f ? o[s] : void 0
    });
  }
  return a;
};
export {
  m as computeDiff,
  g as isKeyed,
  O as parseSnapshot
};
//# sourceMappingURL=index120.js.map
