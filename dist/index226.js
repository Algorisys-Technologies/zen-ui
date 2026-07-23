var f = (l, t) => {
  switch (t) {
    case "x":
      return [l.clientWidth, l.scrollLeft, l.scrollWidth];
    case "y":
      return [l.clientHeight, l.scrollTop, l.scrollHeight];
  }
}, v = (l, t) => {
  const r = getComputedStyle(l), o = t === "x" ? r.overflowX : r.overflowY;
  return o === "auto" || o === "scroll" || // The HTML element is a scroll container if it has overflow visible
  l.tagName === "HTML" && o === "visible";
}, S = (l, t, r) => {
  const o = t === "x" && window.getComputedStyle(l).direction === "rtl" ? -1 : 1;
  let e = l, i = 0, s = 0, n = !1;
  do {
    const [d, c, u] = f(e, t), a = u - d - o * c;
    (c !== 0 || a !== 0) && v(e, t) && (i += a, s += c), e === (r ?? document.documentElement) ? n = !0 : e = e._$host ?? e.parentElement;
  } while (e && !n);
  return [i, s];
};
export {
  S as getScrollAtLocation
};
//# sourceMappingURL=index226.js.map
