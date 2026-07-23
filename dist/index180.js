import { getDocument as s } from "./index164.js";
var E = "data-kb-top-layer", c, r = !1, t = [];
function o(n) {
  return t.findIndex((e) => e.node === n);
}
function l(n) {
  return t[o(n)];
}
function y(n) {
  return t[t.length - 1].node === n;
}
function a() {
  return t.filter((n) => n.isPointerBlocking);
}
function d() {
  return [...a()].slice(-1)[0];
}
function i() {
  return a().length > 0;
}
function u(n) {
  const e = o(d()?.node);
  return o(n) < e;
}
function f(n) {
  t.push(n);
}
function v(n) {
  const e = o(n);
  e < 0 || t.splice(e, 1);
}
function g() {
  for (const {
    node: n
  } of t)
    n.style.pointerEvents = u(n) ? "none" : "auto";
}
function p(n) {
  if (i() && !r) {
    const e = s(n);
    c = document.body.style.pointerEvents, e.body.style.pointerEvents = "none", r = !0;
  }
}
function B(n) {
  if (i())
    return;
  const e = s(n);
  e.body.style.pointerEvents = c, e.body.style.length === 0 && e.body.removeAttribute("style"), r = !1;
}
var b = {
  layers: t,
  isTopMostLayer: y,
  hasPointerBlockingLayer: i,
  isBelowPointerBlockingLayer: u,
  addLayer: f,
  removeLayer: v,
  indexOf: o,
  find: l,
  assignPointerEventToLayers: g,
  disableBodyPointerEvents: p,
  restoreBodyPointerEvents: B
};
export {
  E as DATA_TOP_LAYER_ATTR,
  b as layerStack
};
//# sourceMappingURL=index180.js.map
