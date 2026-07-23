import { template as m, effect as s, setAttribute as n } from "solid-js/web";
var d = /* @__PURE__ */ m('<svg viewBox="0 0 32 32"width=1.25rem height=1.25rem style=overflow:visible><path fill=none stroke-width=4 stroke-miterlimit=10 d=M16,6c3,0,5.7,1.3,7.5,3.4c1.5,1.8,2.5,4,2.5,6.6c0,5.5-4.5,10-10,10S6,21.6,6,16S10.5,6,16,6z></path><path fill=none stroke-width=4 stroke-linecap=round stroke-miterlimit=10 d=M16,6c3,0,5.7,1.3,7.5,3.4c0.6,0.7,1.1,1.4,1.5,2.2><animateTransform attributeName=transform type=rotate from="0 16 16"to="360 16 16"dur=0.75s repeatCount=indefinite>');
const v = (e) => (() => {
  var r = d(), i = r.firstChild, l = i.nextSibling;
  return s((t) => {
    var o = e.primary || "#E5E7EB", a = e.secondary || "#4b5563";
    return o !== t.e && n(i, "stroke", t.e = o), a !== t.t && n(l, "stroke", t.t = a), t;
  }, {
    e: void 0,
    t: void 0
  }), r;
})();
export {
  v as Loader
};
//# sourceMappingURL=index233.js.map
