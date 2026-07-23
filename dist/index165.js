import { onCleanup as e, getOwner as a, DEV as u } from "solid-js";
import { isServer as y } from "solid-js/web";
import { isServer as V } from "solid-js/web";
const g = !y, h = g && !!u, N = (() => {
}), p = (o) => o != null, A = (o) => o.filter(p);
function C(o) {
  return (...n) => {
    for (const i of o)
      i && i(...n);
  };
}
const D = (o) => typeof o == "function" && !o.length ? o() : o, E = (o) => Array.isArray(o) ? o : o ? [o] : [];
function k(o, ...n) {
  return typeof o == "function" ? o(...n) : o;
}
const x = h ? (o) => a() ? e(o) : o : e;
function L(o, n, i, c) {
  const l = o.length, f = n.length;
  let t = 0;
  if (!f) {
    for (; t < l; t++)
      i(o[t]);
    return;
  }
  if (!l) {
    for (; t < f; t++)
      c(n[t]);
    return;
  }
  for (; t < f && n[t] === o[t]; t++)
    ;
  let s, r;
  n = n.slice(t), o = o.slice(t);
  for (s of n)
    o.includes(s) || c(s);
  for (r of o)
    n.includes(r) || i(r);
}
export {
  D as access,
  k as accessWith,
  E as asArray,
  C as chain,
  A as filterNonNullable,
  L as handleDiffArray,
  g as isClient,
  h as isDev,
  p as isNonNullable,
  V as isServer,
  N as noop,
  x as tryOnCleanup
};
//# sourceMappingURL=index165.js.map
