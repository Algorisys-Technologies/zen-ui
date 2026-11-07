function h(e) {
  return e.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}
function p(e) {
  return h(e).split(/\s+/).filter(Boolean);
}
function d(e, i) {
  if (i.length === 0) return { rank: 0 };
  const s = e.map(h);
  let r = !0;
  for (const o of i) {
    let f = !1, t = !1;
    for (const n of s) {
      const u = n.indexOf(o);
      if (!(u < 0) && (f = !0, (u === 0 || g(n, o)) && (t = !0), t))
        break;
    }
    if (!f) return null;
    t || (r = !1);
  }
  const l = s[0] ?? "", c = i.join(" ");
  return l === c ? { rank: 1 } : l.startsWith(c) ? { rank: 2 } : { rank: r ? 3 : 4 };
}
function g(e, i) {
  let s = 0;
  for (; ; ) {
    const r = e.indexOf(i, s);
    if (r < 0) return !1;
    if (r === 0 || !/[\p{L}\p{N}]/u.test(e[r - 1])) return !0;
    s = r + 1;
  }
}
function k(e, i, s, r = 1 / 0) {
  const l = p(s), c = [];
  return e.forEach((o, f) => {
    const t = d(i(o), l);
    t && c.push({ row: o, rank: t.rank, i: f });
  }), c.sort((o, f) => o.rank - f.rank || o.i - f.i), c.slice(0, r).map((o) => o.row);
}
function m(e, i) {
  let s = "";
  const r = [];
  let l = 0;
  for (const t of e) {
    const n = h(t);
    for (let u = 0; u < n.length; u++) r.push(l);
    s += n, l += t.length;
  }
  const c = (t) => {
    const n = r[t], u = e.codePointAt(n);
    let a = n + (u > 65535 ? 2 : 1);
    for (; a < e.length && new RegExp("\\p{M}", "u").test(e[a]); ) a++;
    return a;
  }, o = [];
  for (const t of i) {
    if (!t) continue;
    let n = s.indexOf(t);
    for (; n >= 0; )
      o.push([r[n], c(n + t.length - 1)]), n = s.indexOf(t, n + 1);
  }
  o.sort((t, n) => t[0] - n[0] || t[1] - n[1]);
  const f = [];
  for (const t of o) {
    const n = f[f.length - 1];
    n && t[0] <= n[1] ? n[1] = Math.max(n[1], t[1]) : f.push([t[0], t[1]]);
  }
  return f;
}
export {
  k as filterLookup,
  h as foldText,
  m as highlightRanges,
  d as matchLookupRow,
  p as queryWords
};
//# sourceMappingURL=index221.js.map
