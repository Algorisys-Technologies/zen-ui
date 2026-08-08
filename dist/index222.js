var m = 1, j = 0.9, k = 0.8, B = 0.17, v = 0.1, w = 0.999, D = 0.9999, G = 0.99, H = /[\\\/_+.#"@\[\(\{&]/, J = /[\\\/_+.#"@\[\(\{&]/g, K = /[\s-]/, A = /[\s-]/g;
function $(t, o, e, i, n, h, u) {
  if (h === o.length) return n === t.length ? m : G;
  var s = `${n},${h}`;
  if (u[s] !== void 0) return u[s];
  for (var d = i.charAt(h), a = e.indexOf(d, n), l = 0, r, g, c, p; a >= 0; ) r = $(t, o, e, i, a + 1, h + 1, u), r > l && (a === n ? r *= m : H.test(t.charAt(a - 1)) ? (r *= k, c = t.slice(n, a - 1).match(J), c && n > 0 && (r *= Math.pow(w, c.length))) : K.test(t.charAt(a - 1)) ? (r *= j, p = t.slice(n, a - 1).match(A), p && n > 0 && (r *= Math.pow(w, p.length))) : (r *= B, n > 0 && (r *= Math.pow(w, a - n))), t.charAt(a) !== o.charAt(h) && (r *= D)), (r < v && e.charAt(a - 1) === i.charAt(h + 1) || i.charAt(h + 1) === i.charAt(h) && e.charAt(a - 1) !== i.charAt(h)) && (g = $(t, o, e, i, a + 1, h + 2, u), g * v > r && (r = g * v)), r > l && (l = r), a = e.indexOf(d, a + 1);
  return u[s] = l, l;
}
function x(t) {
  return t.toLowerCase().replace(A, " ");
}
function M(t, o, e) {
  return t = e && e.length > 0 ? `${t + " " + e.join(" ")}` : t, $(t, o, x(t), x(o), 0, 0, {});
}
export {
  M as a
};
//# sourceMappingURL=index222.js.map
