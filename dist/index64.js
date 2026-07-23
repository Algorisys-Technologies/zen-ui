import { template as i, spread as f, mergeProps as v, insert as g, createComponent as w, effect as m, setAttribute as c, className as x, delegateEvents as k } from "solid-js/web";
import { splitProps as y, createSignal as C, Show as L } from "solid-js";
import { cn as u } from "./index103.js";
var M = /* @__PURE__ */ i('<svg width=16 height=16 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round aria-hidden=true><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1=2 x2=22 y1=2 y2=22>'), S = /* @__PURE__ */ i('<div class="zen-relative zen-w-full"><input><button type=button>'), $ = /* @__PURE__ */ i('<svg width=16 height=16 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round aria-hidden=true><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx=12 cy=12 r=3>');
const B = (b) => {
  const [t, h] = y(b, ["class", "showLabel", "hideLabel", "disabled"]), [r, p] = C(!1);
  return (() => {
    var o = S(), s = o.firstChild, n = s.nextSibling;
    return f(s, v({
      get type() {
        return r() ? "text" : "password";
      },
      get disabled() {
        return t.disabled;
      },
      get class() {
        return u("zen-flex zen-h-10 zen-w-full zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-ps-3 zen-pe-10 zen-py-2 zen-text-sm", "placeholder:zen-text-zen-muted-fg", "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2", "disabled:zen-cursor-not-allowed disabled:zen-opacity-50", t.class);
      }
    }, h), !1, !1), n.$$click = () => p((e) => !e), g(n, w(L, {
      get when() {
        return r();
      },
      get fallback() {
        return $();
      },
      get children() {
        return M();
      }
    })), m((e) => {
      var l = t.disabled, a = r() ? t.hideLabel ?? "Hide password" : t.showLabel ?? "Show password", d = r(), z = u("zen-absolute zen-top-1/2 -zen-translate-y-1/2 zen-end-2", "zen-inline-flex zen-items-center zen-justify-center zen-h-6 zen-w-6 zen-rounded-zen-sm", "zen-text-zen-muted-fg hover:zen-text-zen-foreground", "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring", "disabled:zen-cursor-not-allowed disabled:zen-opacity-50");
      return l !== e.e && (n.disabled = e.e = l), a !== e.t && c(n, "aria-label", e.t = a), d !== e.a && c(n, "aria-pressed", e.a = d), z !== e.o && x(n, e.o = z), e;
    }, {
      e: void 0,
      t: void 0,
      a: void 0,
      o: void 0
    }), o;
  })();
};
k(["click"]);
export {
  B as PasswordInput
};
//# sourceMappingURL=index64.js.map
