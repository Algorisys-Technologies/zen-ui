function e() {
  return typeof document > "u" ? "ltr" : document.documentElement.getAttribute("dir") === "rtl" ? "rtl" : "ltr";
}
function u(t) {
  if (typeof document > "u") return () => {
  };
  const r = new MutationObserver(() => t(e()));
  return r.observe(document.documentElement, { attributes: !0, attributeFilter: ["dir"] }), () => r.disconnect();
}
function n(t) {
  return !t || typeof window > "u" ? "ltr" : window.getComputedStyle(t).direction === "rtl" ? "rtl" : "ltr";
}
function o(t, r) {
  return t !== "ArrowLeft" && t !== "ArrowRight" ? 0 : t === (r === "rtl" ? "ArrowLeft" : "ArrowRight") ? 1 : -1;
}
function d(t, r) {
  return o(t, n(r));
}
export {
  d as arrowStep,
  n as directionOf,
  o as horizontalStep,
  u as observeDocumentDirection,
  e as readDocumentDirection
};
//# sourceMappingURL=index115.js.map
