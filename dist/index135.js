import { template as m, insert as s, createComponent as n, effect as l, style as c, className as f } from "solid-js/web";
import { createEffect as a, onCleanup as v, For as u } from "solid-js";
import { mergeContainerOptions as d } from "./index221.js";
import { createTimers as C, store as p } from "./index218.js";
import { ToastContainer as h } from "./index230.js";
import { defaultContainerStyle as y } from "./index220.js";
var T = /* @__PURE__ */ m("<div><style>.sldt-active{z-index:9999;}.sldt-active>*{pointer-events:auto;}");
const F = (r) => (a(() => {
  d(r);
}), a(() => {
  const e = C();
  v(() => {
    e && e.forEach((t) => t && clearTimeout(t));
  });
}), (() => {
  var e = T();
  return e.firstChild, s(e, n(u, {
    get each() {
      return p.toasts;
    },
    children: (t) => n(h, {
      toast: t
    })
  }), null), l((t) => {
    var i = {
      ...y,
      ...r.containerStyle
    }, o = r.containerClassName;
    return t.e = c(e, i, t.e), o !== t.t && f(e, t.t = o), t;
  }, {
    e: void 0,
    t: void 0
  }), e;
})());
export {
  F as Toaster
};
//# sourceMappingURL=index135.js.map
