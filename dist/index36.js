import { template as l, spread as c, mergeProps as p, insert as t, createComponent as z } from "solid-js/web";
import { mergeProps as m, splitProps as u, Show as d } from "solid-js";
import { cva as g } from "./index118.js";
import { cn as h } from "./index106.js";
var x = /* @__PURE__ */ l("<span style=position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0>"), w = /* @__PURE__ */ l('<span style=display:inline-flex;align-items:center;gap:6px><svg viewBox="0 0 24 24"fill=none><circle class=zen-opacity-25 cx=12 cy=12 r=10 stroke=currentColor stroke-width=4></circle><path class=zen-opacity-75 fill=currentColor d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z">');
const f = g("zen-animate-spin", {
  variants: {
    size: {
      sm: "zen-h-3 zen-w-3",
      md: "zen-h-4 zen-w-4",
      lg: "zen-h-6 zen-w-6",
      xl: "zen-h-10 zen-w-10"
    },
    color: {
      primary: "zen-text-zen-primary",
      neutral: "zen-text-zen-foreground",
      info: "zen-text-zen-info",
      success: "zen-text-zen-success",
      warning: "zen-text-zen-warning",
      error: "zen-text-zen-error",
      current: "zen-text-current"
    }
  },
  defaultVariants: {
    size: "md",
    color: "primary"
  }
}), _ = (o) => {
  const a = m({
    label: "Loading"
  }, o), [e, i] = u(a, ["class", "size", "color", "label"]);
  return (() => {
    var r = w(), s = r.firstChild;
    return c(s, p({
      get role() {
        return e.label ? "status" : "presentation";
      },
      get "aria-label"() {
        return e.label || void 0;
      },
      get "aria-hidden"() {
        return e.label ? void 0 : !0;
      },
      get class() {
        return h(f({
          size: e.size,
          color: e.color
        }), e.class);
      }
    }, i), !0, !0), t(r, z(d, {
      get when() {
        return e.label;
      },
      get children() {
        var n = x();
        return t(n, () => e.label), n;
      }
    }), null), r;
  })();
};
export {
  _ as Loading,
  f as spinnerVariants
};
//# sourceMappingURL=index36.js.map
