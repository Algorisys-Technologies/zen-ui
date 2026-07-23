import { template as h, insert as n, createComponent as f, spread as m, mergeProps as d, effect as y, setAttribute as c } from "solid-js/web";
import { MainCircle as b, SecondaryCircle as g } from "./index233.js";
import { genSVGCubicBezier as u } from "./index234.js";
var p = /* @__PURE__ */ h('<svg viewBox="0 0 32 32"width=1.25rem height=1.25rem style=overflow:visible><path fill=none stroke-width=4 stroke-dasharray=9 stroke-dashoffset=9 stroke-linecap=round d=M16,7l0,9><animate attributeName=stroke-dashoffset values=9;0 dur=0.2s begin=250ms fill=freeze></animate></path><circle cx=16 cy=23 r=2.5 opacity=0><animate attributeName=opacity values=0;1 dur=0.25s begin=350ms fill=freeze>');
const x = (i) => {
  const a = i.primary || "#FF3B30";
  return (() => {
    var t = p(), e = t.firstChild, F = e.firstChild, l = e.nextSibling, v = l.firstChild;
    return n(t, f(b, {
      fill: a
    }), e), n(t, f(g, {
      fill: a
    }), e), m(F, d(() => u("0.0, 0.0, 0.58, 1.0")), !0, !1), m(v, d(() => u("0.0, 0.0, 0.58, 1.0")), !0, !1), y((r) => {
      var o = i.secondary || "#FFFFFF", s = i.secondary || "#FFFFFF";
      return o !== r.e && c(e, "stroke", r.e = o), s !== r.t && c(l, "fill", r.t = s), r;
    }, {
      e: void 0,
      t: void 0
    }), t;
  })();
};
export {
  x as Error
};
//# sourceMappingURL=index235.js.map
