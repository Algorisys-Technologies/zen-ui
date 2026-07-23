import { template as h, spread as C, mergeProps as y, insert as $, createComponent as V, effect as g, setAttribute as S, className as d, memo as j, use as _, delegateEvents as B } from "solid-js/web";
import { splitProps as L, createSignal as P, Show as A } from "solid-js";
import { cn as i } from "./index103.js";
var E = /* @__PURE__ */ h('<button type=button><svg width=14 height=14 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2.5 stroke-linecap=round stroke-linejoin=round aria-hidden=true><path d="M18 6 6 18"></path><path d="m6 6 12 12">'), I = /* @__PURE__ */ h('<div><span aria-hidden=true><svg width=16 height=16 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><circle cx=11 cy=11 r=8></circle><path d="m21 21-4.3-4.3"></path></svg></span><input type=search>');
const M = {
  sm: {
    field: "zen-h-9 zen-text-sm",
    pad: "zen-ps-9 zen-pe-9",
    icon: "zen-left-2.5"
  },
  md: {
    field: "zen-h-10 zen-text-sm",
    pad: "zen-ps-10 zen-pe-10",
    icon: "zen-left-3"
  },
  lg: {
    field: "zen-h-11 zen-text-base",
    pad: "zen-ps-11 zen-pe-11",
    icon: "zen-left-3.5"
  }
}, D = (b) => {
  const [n, m] = L(b, ["class", "value", "defaultValue", "onValueChange", "onClear", "size", "clearLabel", "disabled"]);
  let a;
  const [w, k] = P(n.defaultValue ?? ""), u = () => n.value !== void 0, z = () => u() ? n.value : w(), c = (r) => {
    u() || k(r), n.onValueChange?.(r);
  }, x = () => {
    c(""), n.onClear?.(), a?.focus();
  }, s = () => M[n.size ?? "md"];
  return (() => {
    var r = I(), f = r.firstChild, o = f.nextSibling;
    o.$$input = (e) => c(e.currentTarget.value);
    var v = a;
    return typeof v == "function" ? _(v, o) : a = o, C(o, y({
      get value() {
        return z();
      },
      get disabled() {
        return n.disabled;
      },
      get class() {
        return i("zen-w-full zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-py-2", s().field, s().pad, "placeholder:zen-text-zen-muted-fg", "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2", "disabled:zen-cursor-not-allowed disabled:zen-opacity-50", "[&::-webkit-search-cancel-button]:zen-appearance-none");
      }
    }, m), !1, !1), $(r, V(A, {
      get when() {
        return j(() => z().length > 0)() && !n.disabled;
      },
      get children() {
        var e = E();
        return e.$$click = x, g((t) => {
          var l = n.clearLabel ?? "Clear search", p = i("zen-absolute zen-top-1/2 -zen-translate-y-1/2 zen-end-2.5", "zen-inline-flex zen-items-center zen-justify-center zen-h-5 zen-w-5 zen-rounded-zen-full", "zen-text-zen-muted-fg hover:zen-text-zen-foreground hover:zen-bg-zen-muted", "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring");
          return l !== t.e && S(e, "aria-label", t.e = l), p !== t.t && d(e, t.t = p), t;
        }, {
          e: void 0,
          t: void 0
        }), e;
      }
    }), null), g((e) => {
      var t = i("zen-relative zen-w-full", n.class), l = i("zen-pointer-events-none zen-absolute zen-top-1/2 -zen-translate-y-1/2 zen-text-zen-muted-fg", s().icon);
      return t !== e.e && d(r, e.e = t), l !== e.t && d(f, e.t = l), e;
    }, {
      e: void 0,
      t: void 0
    }), r;
  })();
};
B(["input", "click"]);
export {
  D as Search
};
//# sourceMappingURL=index63.js.map
