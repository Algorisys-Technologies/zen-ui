import { template as g, insert as o, createComponent as i, effect as c, style as n, mergeProps as m, spread as $, className as w, use as _ } from "solid-js/web";
import { createEffect as b, Switch as T, Match as f } from "solid-js";
import { iconContainer as d, toastBarBase as C, messageContainer as x } from "./index234.js";
import { Loader as B } from "./index236.js";
import { Success as z } from "./index232.js";
import { Error as E } from "./index235.js";
import { getToastYDirection as N } from "./index228.js";
import { resolveValue as P } from "./index229.js";
var u = /* @__PURE__ */ g("<div>"), S = /* @__PURE__ */ g("<div><div>");
const A = (e) => {
  let s;
  return b(() => {
    if (!s) return;
    const r = N(e.toast, e.position);
    e.toast.visible ? s.animate([{
      transform: `translate3d(0,${r * -200}%,0) scale(.6)`,
      opacity: 0.5
    }, {
      transform: "translate3d(0,0,0) scale(1)",
      opacity: 1
    }], {
      duration: 350,
      fill: "forwards",
      easing: "cubic-bezier(.21,1.02,.73,1)"
    }) : s.animate([{
      transform: "translate3d(0,0,-1px) scale(1)",
      opacity: 1
    }, {
      transform: `translate3d(0,${r * -150}%,-1px) scale(.4)`,
      opacity: 0
    }], {
      duration: 400,
      fill: "forwards",
      easing: "cubic-bezier(.06,.71,.55,1)"
    });
  }), (() => {
    var r = S(), l = r.firstChild, v = s;
    return typeof v == "function" ? _(v, r) : s = r, o(r, i(T, {
      get children() {
        return [i(f, {
          get when() {
            return e.toast.icon;
          },
          get children() {
            var t = u();
            return o(t, () => e.toast.icon), c((a) => n(t, d, a)), t;
          }
        }), i(f, {
          get when() {
            return e.toast.type === "loading";
          },
          get children() {
            var t = u();
            return o(t, i(B, m(() => e.toast.iconTheme))), c((a) => n(t, d, a)), t;
          }
        }), i(f, {
          get when() {
            return e.toast.type === "success";
          },
          get children() {
            var t = u();
            return o(t, i(z, m(() => e.toast.iconTheme))), c((a) => n(t, d, a)), t;
          }
        }), i(f, {
          get when() {
            return e.toast.type === "error";
          },
          get children() {
            var t = u();
            return o(t, i(E, m(() => e.toast.iconTheme))), c((a) => n(t, d, a)), t;
          }
        })];
      }
    }), l), $(l, m(() => e.toast.ariaProps), !1, !0), o(l, () => P(e.toast.message, e.toast)), c((t) => {
      var a = e.toast.className, h = {
        ...C,
        ...e.toast.style
      }, y = x;
      return a !== t.e && w(r, t.e = a), t.t = n(r, h, t.t), t.a = n(l, y, t.a), t;
    }, {
      e: void 0,
      t: void 0,
      a: void 0
    }), r;
  })();
};
export {
  A as ToastBar
};
//# sourceMappingURL=index231.js.map
