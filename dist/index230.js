import { template as s, spread as r, effect as n, setAttribute as c } from "solid-js/web";
import { genSVGCubicBezier as u } from "./index231.js";
var f = /* @__PURE__ */ s('<svg><circle cx=16 cy=16 r=0><animate attributeName=opacity values="0; 1; 1"></animate><animate attributeName=r values="0; 17.5; 16"></svg>', !1, !0, !1), m = /* @__PURE__ */ s('<svg><circle cx=16 cy=16 r=12 opacity=0><animate attributeName=opacity values="1; 0"></animate><animate attributeName=r values="12; 26"></svg>', !1, !0, !1);
const b = (i) => {
  const t = {
    dur: "0.35s",
    begin: "100ms",
    fill: "freeze",
    calcMode: "spline",
    keyTimes: "0; 0.6; 1",
    keySplines: "0.25 0.71 0.4 0.88; .59 .22 .87 .63"
  };
  return (() => {
    var e = f(), l = e.firstChild, a = l.nextSibling;
    return r(l, t, !0, !1), r(a, t, !0, !1), n(() => c(e, "fill", i.fill)), e;
  })();
}, v = (i) => {
  const t = {
    dur: "1s",
    begin: i.begin || "320ms",
    fill: "freeze",
    ...u("0.0 0.0 0.2 1")
  };
  return (() => {
    var e = m(), l = e.firstChild, a = l.nextSibling;
    return r(l, t, !0, !1), r(a, t, !0, !1), n(() => c(e, "fill", i.fill)), e;
  })();
};
export {
  b as MainCircle,
  v as SecondaryCircle
};
//# sourceMappingURL=index230.js.map
