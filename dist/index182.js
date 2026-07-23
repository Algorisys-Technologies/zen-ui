const x = 200, R = 50;
function c(t, n) {
  return n <= 0 || t <= 0 ? 0 : Math.floor(t / n) * n;
}
function d(t, n, e) {
  if (n < t)
    return [];
  const r = c(t, e), o = c(n, e), s = [];
  for (let a = r; a <= o; a += e)
    s.push(a);
  return s;
}
function h(t, n) {
  return t.find((e) => e.startIndex === n);
}
function g(t, n, e) {
  const r = t.startIndex + t.length - 1;
  return n >= t.startIndex && e <= r;
}
function E(t, n, e, r) {
  const o = d(n, e, r), s = [];
  for (const a of o) {
    const u = a + r - 1, f = Math.max(n, a), l = Math.min(e, u), i = h(t, a);
    i && i.length > 0 && g(i, f, l) || s.push(a);
  }
  return s;
}
function v(t, n, e, r) {
  if (r <= 0 || t.length === 0)
    return [...t];
  const o = Math.max(0, c(n, r) - r), s = c(e, r) + r * 2 - 1;
  return t.filter((a) => a.startIndex + Math.max(a.length, 1) - 1 >= o && a.startIndex <= s);
}
function p(t, n, e) {
  let r = t[0], o = Math.abs(r + e / 2 - n);
  for (let s = 1; s < t.length; s++) {
    const a = t[s], u = Math.abs(a + e / 2 - n);
    u < o && (r = a, o = u);
  }
  return r;
}
const I = 4;
function M(t) {
  return t.map((n) => ({
    startIndex: n.startIndex,
    length: n.values.length
  }));
}
function W(t, n, e) {
  const r = t.startIndex + t.values.length - 1;
  return n < t.startIndex || e > r ? !1 : e - t.startIndex < t.values.length;
}
function C(t, n, e, r) {
  return _(t, n, e, r).length === 0;
}
function _(t, n, e, r) {
  return E(M(t), n, e, r).filter(
    (o) => {
      const s = o + r - 1;
      return !L(n, s, t, e);
    }
  );
}
function L(t, n, e, r) {
  const o = Math.min(r, n);
  if (o < t)
    return !1;
  for (const s of e) {
    if (s.values.length === 0 || r < s.startIndex || s.startIndex - t > I)
      continue;
    const a = Math.min(
      r,
      s.startIndex + s.values.length - 1
    );
    if (o < s.startIndex && W(s, s.startIndex, a))
      return !0;
  }
  return !1;
}
function A(t, n, e, r) {
  return v(
    t.map((o) => ({
      startIndex: o.startIndex,
      length: o.values.length,
      window: o
    })),
    n,
    e,
    r
  ).map((o) => o.window);
}
function O(t, n) {
  for (const e of t) {
    const r = n - e.startIndex;
    if (r >= 0 && r < e.values.length)
      return e.values[r];
  }
}
export {
  I as PIVOT_FILTER_LEADING_OVERSCAN_SLACK,
  x as VIRTUAL_SCROLL_FETCH_DEBOUNCE_MS,
  R as VIRTUAL_SCROLL_WINDOW_PAGE_SIZE,
  c as alignWindowStart,
  E as missingWindowStarts,
  p as pickNearestWindowStart,
  _ as pivotFilterMissingWindowStarts,
  C as pivotFilterWindowCoversRange,
  O as pivotFilterWindowValueAt,
  A as prunePivotFilterWindows,
  v as pruneWindowsByRange,
  d as requiredWindowStarts
};
//# sourceMappingURL=index182.js.map
