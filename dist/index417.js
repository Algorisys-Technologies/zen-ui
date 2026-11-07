function p(t) {
  return {
    top: Math.min(t.anchor.row, t.focus.row),
    left: Math.min(t.anchor.col, t.focus.col),
    bottom: Math.max(t.anchor.row, t.focus.row),
    right: Math.max(t.anchor.col, t.focus.col)
  };
}
function m(t, n, o) {
  return n >= t.top && n <= t.bottom && o >= t.left && o <= t.right;
}
function M(t, n, o) {
  if (n <= 0 || o <= 0) return null;
  const u = (r) => ({
    row: Math.min(Math.max(r.row, 0), n - 1),
    col: Math.min(Math.max(r.col, 0), o - 1)
  });
  return { anchor: u(t.anchor), focus: u(t.focus) };
}
const s = /[\t\n\r"]/;
function a(t) {
  return s.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
}
function g(t) {
  return t.map((n) => n.map(a).join("	")).join(`\r
`);
}
function w(t) {
  if (t === "") return [];
  const n = [];
  let o = [], u = "", r = 0, f = !0;
  for (; r < t.length; ) {
    const l = t[r];
    if (f && l === '"') {
      let e = r + 1, h = "", c = !1;
      for (; e < t.length; ) {
        if (t[e] === '"') {
          if (t[e + 1] === '"') {
            h += '"', e += 2;
            continue;
          }
          c = !0, e++;
          break;
        }
        h += t[e++];
      }
      const i = t[e];
      if (c && (e >= t.length || i === "	" || i === `
` || i === "\r")) {
        u = h, r = e, f = !1;
        continue;
      }
    }
    f = !1, l === "	" ? (o.push(u), u = "", f = !0, r++) : l === "\r" || l === `
` ? (o.push(u), n.push(o), o = [], u = "", f = !0, r += l === "\r" && t[r + 1] === `
` ? 2 : 1) : (u += l, r++);
  }
  return (!f || u !== "" || o.length > 0) && (o.push(u), n.push(o)), n;
}
function b(t, n, o, u) {
  const r = [];
  if (t.length === 0 || o <= 0 || u <= 0) return r;
  if (t.length === 1 && t[0].length === 1) {
    for (let l = n.top; l <= Math.min(n.bottom, o - 1); l++)
      for (let e = n.left; e <= Math.min(n.right, u - 1); e++)
        r.push({ row: l, col: e, value: t[0][0] });
    return r;
  }
  for (let l = 0; l < t.length; l++) {
    const e = n.top + l;
    if (e >= o) break;
    for (let h = 0; h < t[l].length; h++) {
      const c = n.left + h;
      if (c >= u) break;
      r.push({ row: e, col: c, value: t[l][h] });
    }
  }
  return r;
}
export {
  M as clampRange,
  m as inRect,
  w as parseTsv,
  b as pastePlan,
  p as rangeRect,
  g as toTsv,
  a as tsvCell
};
//# sourceMappingURL=index417.js.map
