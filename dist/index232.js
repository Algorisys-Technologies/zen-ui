import { template as a, insert as s, createComponent as o, spread as m, mergeProps as n, effect as f, setAttribute as c } from "solid-js/web";
import { MainCircle as d, SecondaryCircle as h } from "./index233.js";
import { genSVGCubicBezier as p } from "./index234.js";
var u = /* @__PURE__ */ a('<svg viewBox="0 0 32 32"width=1.25rem height=1.25rem style=overflow:visible><path fill=none stroke-width=4 stroke-dasharray=22 stroke-dashoffset=22 stroke-linecap=round stroke-miterlimit=10 d=M9.8,17.2l3.8,3.6c0.1,0.1,0.3,0.1,0.4,0l9.6-9.7><animate attributeName=stroke-dashoffset values=22;0 dur=0.25s begin=250ms fill=freeze>');
const b = (t) => {
  const i = t.primary || "#34C759";
  return (() => {
    var e = u(), r = e.firstChild, l = r.firstChild;
    return s(e, o(d, {
      fill: i
    }), r), s(e, o(h, {
      fill: i,
      begin: "350ms"
    }), r), m(l, n(() => p("0.0, 0.0, 0.58, 1.0")), !0, !1), f(() => c(r, "stroke", t.secondary || "#FCFCFC")), e;
  })();
};
export {
  b as Success
};
//# sourceMappingURL=index232.js.map
