const E = (t) => (t.trim().endsWith("ms") ? parseFloat(t) : parseFloat(t) * 1e3) || 0;
function h(t, i, f) {
  const o = getComputedStyle(t), a = (n) => Math.max(0, ...n.split(",").map(E)), p = a(o.transitionDuration) + a(o.transitionDelay);
  let r = !1, d = !1;
  const s = /* @__PURE__ */ new Set(), c = (n) => {
    n.target === t && s.add(n.propertyName);
  }, e = (n) => {
    n.target === t && (s.delete(n.propertyName), n.propertyName === i && (d = !0), d && s.size === 0 && m());
  }, v = setTimeout(() => m(), p + 50), u = () => {
    clearTimeout(v), t.removeEventListener("transitionrun", c), t.removeEventListener("transitionend", e), t.removeEventListener("transitioncancel", e);
  };
  function m() {
    r || (r = !0, u(), f());
  }
  return t.addEventListener("transitionrun", c), t.addEventListener("transitionend", e), t.addEventListener("transitioncancel", e), () => {
    r = !0, u();
  };
}
const l = (t, i) => h(t, "width", i);
export {
  h as afterTransition,
  l as afterWidthTransition
};
//# sourceMappingURL=index260.js.map
