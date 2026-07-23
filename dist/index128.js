const i = {
  9: /\d/,
  a: /[A-Za-z]/,
  "*": /[A-Za-z0-9]/
}, f = (s) => ({ ...i, ...s }), h = (s, c) => {
  const n = f(c), e = [], o = [...s];
  for (let l = 0; l < o.length; l++) {
    const t = o[l];
    if (t === "\\" && l + 1 < o.length) {
      e.push({ slot: !1, ch: o[++l] });
      continue;
    }
    const r = Object.hasOwn(n, t) ? n[t] : void 0;
    e.push(r ? { slot: !0, rule: r } : { slot: !1, ch: t });
  }
  return e;
}, p = (s, c) => h(s, c).reduce((n, e) => n + (e.slot ? 1 : 0), 0), g = (s, c, n) => {
  const e = h(c, n), o = [...s], l = [];
  let t = 0, r = !0;
  for (const a of e) {
    if (!a.slot) {
      r && t < o.length && o[t] === a.ch ? t++ : r = !1;
      continue;
    }
    for (; t < o.length && !a.rule.test(o[t]); ) t++;
    if (t >= o.length) break;
    l.push(o[t]), t++;
  }
  return l.join("");
}, k = (s, c, n) => {
  if (!s) return "";
  const e = h(c, n), o = e.reduce((a, u) => a + (u.slot ? 1 : 0), 0), l = [...s];
  let t = 0, r = "";
  for (const a of e) {
    if (t >= l.length) {
      if (!a.slot && t > 0 && t < o) r += a.ch;
      else break;
      continue;
    }
    a.slot ? (r += l[t], t++) : r += a.ch;
  }
  return r;
}, d = (s, c = "_", n) => h(s, n).map((e) => e.slot ? c : e.ch).join(""), j = (s, c, n) => [...s].length === p(c, n);
export {
  i as DEFAULT_MASK_RULES,
  k as applyMask,
  g as extractRaw,
  j as isMaskComplete,
  d as maskSkeleton,
  p as maskSlotCount
};
//# sourceMappingURL=index128.js.map
