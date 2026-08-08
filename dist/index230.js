function E(n, i, e) {
  let t = e.initialDeps ?? [], o, s = !0;
  function h() {
    var d;
    const r = process.env.NODE_ENV !== "production" && !!e.key && !!((d = e.debug) != null && d.call(e));
    let m = 0;
    r && (m = Date.now());
    const u = n();
    if (!(u.length !== t.length || u.some((c, a) => t[a] !== c)))
      return o;
    t = u;
    let f = 0;
    if (r && (f = Date.now()), o = i(...u), r) {
      const c = Math.round((Date.now() - m) * 100) / 100, a = Math.round((Date.now() - f) * 100) / 100, p = a / 16, g = (l, w) => {
        for (l = String(l); l.length < w; )
          l = " " + l;
        return l;
      };
      console.info(
        `%c⏱ ${g(a, 5)} /${g(c, 5)} ms`,
        `
            font-size: .6rem;
            font-weight: bold;
            color: hsl(${Math.max(
          0,
          Math.min(120 - 120 * p, 120)
        )}deg 100% 31%);`,
        e?.key
      );
    }
    return e?.onChange && !(s && e.skipInitialOnChange) && e.onChange(o), s = !1, o;
  }
  return h.updateDeps = (d) => {
    t = d;
  }, h;
}
function b(n, i) {
  if (n === void 0)
    throw new Error("Unexpected undefined");
  return n;
}
const T = (n, i) => Math.abs(n - i) < 1.01, v = (n, i, e) => {
  let t;
  return function(...o) {
    n.clearTimeout(t), t = n.setTimeout(() => i.apply(this, o), e);
  };
};
export {
  T as approxEqual,
  v as debounce,
  E as memo,
  b as notUndefined
};
//# sourceMappingURL=index230.js.map
