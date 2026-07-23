import { template as u, insert as v, memo as p, createComponent as d, effect as y, style as T, className as S, use as g } from "solid-js/web";
import { createMemo as A, onMount as E } from "solid-js";
import { ToastBar as _ } from "./index231.js";
import { defaultToastOptions as r } from "./index227.js";
import { getWrapperYAxisOffset as D, getToastWrapperStyles as P, updateToastHeight as h } from "./index228.js";
import { dispatch as n } from "./index225.js";
import { ActionType as m } from "./index226.js";
import { resolveValue as w } from "./index229.js";
var x = /* @__PURE__ */ u("<div>");
const b = (e) => {
  const f = () => {
    const t = e.toast.position || r.position, s = D(e.toast, t);
    return P(t, s);
  }, l = A(() => f());
  let i;
  return E(() => {
    i && h(i, e.toast);
  }), (() => {
    var t = x();
    t.addEventListener("mouseleave", () => n({
      type: m.END_PAUSE,
      time: Date.now()
    })), t.addEventListener("mouseenter", () => n({
      type: m.START_PAUSE,
      time: Date.now()
    }));
    var s = i;
    return typeof s == "function" ? g(s, t) : i = t, v(t, (() => {
      var o = p(() => e.toast.type === "custom");
      return () => o() ? w(e.toast.message, e.toast) : d(_, {
        get toast() {
          return e.toast;
        },
        get position() {
          return e.toast.position || r.position;
        }
      });
    })()), y((o) => {
      var c = l(), a = e.toast.visible ? "sldt-active" : "";
      return o.e = T(t, c, o.e), a !== o.t && S(t, o.t = a), o;
    }, {
      e: void 0,
      t: void 0
    }), t;
  })();
};
export {
  b as ToastContainer
};
//# sourceMappingURL=index230.js.map
