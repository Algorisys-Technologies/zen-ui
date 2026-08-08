const D = 1, G = 10;
const E = (t, n, r) => Math.min(r, Math.max(n, t)), s = (t) => Math.round(t * 1e6) / 1e6, A = (t) => t <= 0 ? [] : Array.from({ length: t }, () => s(100 / t)), H = (t, n) => {
  if (n <= 0) return [];
  if (!t || t.length !== n || t.some((o) => !Number.isFinite(o) || o < 0)) return A(n);
  const r = t.reduce((o, a) => o + a, 0);
  if (r <= 1e-6) return A(n);
  if (Math.abs(r - 100) < 1e-6) return t.map(s);
  const i = t.map((o) => s(o / r * 100)), c = s(100 - i.reduce((o, a) => o + a, 0));
  return i[i.length - 1] = s(i[i.length - 1] + c), i;
}, N = (t, n, r) => {
  if (n < 0 || n >= t.length - 1) return { min: 0, max: 100 };
  const i = s((t[n] ?? 0) + (t[n + 1] ?? 0)), c = r[n] ?? {}, o = r[n + 1] ?? {}, a = Math.max(c.min ?? 0, i - (o.max ?? 100)), m = Math.min(c.max ?? 100, i - (o.min ?? 0));
  return a > m ? { min: s(a), max: s(a) } : { min: s(a), max: s(m) };
}, v = (t, n, r, i) => {
  const c = t.map(s);
  if (n < 0 || n >= c.length - 1 || Number.isNaN(r)) return c;
  const o = n, a = c[o], m = c[o + 1], p = s(a + m), f = i[o] ?? {}, h = i[o + 1] ?? {}, b = f.min ?? 0, w = f.max ?? 100, g = h.min ?? 0, P = f.collapsedSize ?? 0, M = h.collapsedSize ?? 0, l = a + r, { min: u, max: S } = N(c, o, i), x = f.collapsible && Math.abs(a - P) < 1e-6 && r > 0, _ = h.collapsible && Math.abs(m - M) < 1e-6 && r < 0, L = (T, R, B) => T < R - 1e-6 && Math.abs(T - B) < Math.abs(T - R);
  let e;
  return x ? e = E(Math.max(l, b), u, S) : _ ? e = E(Math.min(l, p - g), u, S) : f.collapsible && L(l, b, P) ? e = P : h.collapsible && L(p - l, g, M) ? e = s(p - M) : u > S ? e = E(l, b, w) : e = E(l, u, S), c[o] = s(e), c[o + 1] = s(p - e), c;
}, y = (t, n, r) => {
  if (t === "Home") return -1 / 0;
  if (t === "End") return 1 / 0;
  const i = r ? 10 : 1, c = n === "horizontal" ? "ArrowLeft" : "ArrowUp", o = n === "horizontal" ? "ArrowRight" : "ArrowDown";
  return t === c ? -i : t === o ? i : null;
}, F = (t, n, r) => n === "horizontal" && r === "rtl" ? -t : t;
export {
  D as SPLITTER_STEP,
  G as SPLITTER_STEP_LARGE,
  v as dragHandle,
  N as handleBounds,
  F as mirrorDelta,
  H as normalizeSizes,
  y as splitterKeyDelta
};
//# sourceMappingURL=index114.js.map
