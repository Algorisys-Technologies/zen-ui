import { template as i, spread as o, mergeProps as s, insert as c } from "solid-js/web";
import { mergeProps as f, splitProps as l } from "solid-js";
import { cva as g } from "./index118.js";
import { cn as a } from "./index106.js";
var u = /* @__PURE__ */ i("<div>"), b = /* @__PURE__ */ i("<span aria-hidden=true>"), d = /* @__PURE__ */ i("<p>"), p = /* @__PURE__ */ i('<button type=button aria-label=Dismiss><svg width=14 height=14 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round aria-hidden=true><line x1=18 y1=6 x2=6 y2=18></line><line x1=6 y1=6 x2=18 y2=18>');
const v = g("zen-relative zen-w-full zen-rounded-zen-md zen-p-3 zen-flex zen-items-start zen-gap-2", {
  variants: {
    color: {
      neutral: "",
      primary: "",
      info: "",
      success: "",
      warning: "",
      destructive: ""
    },
    variant: {
      soft: "",
      outline: "zen-bg-zen-background"
    }
  },
  compoundVariants: [{
    variant: "soft",
    color: "neutral",
    class: "zen-bg-zen-muted zen-text-zen-foreground zen-border zen-border-zen-border"
  }, {
    variant: "soft",
    color: "primary",
    class: "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg zen-border zen-border-zen-primary-soft"
  }, {
    variant: "soft",
    color: "info",
    class: "zen-bg-zen-info-soft zen-text-zen-info-soft-fg zen-border zen-border-zen-info-soft"
  }, {
    variant: "soft",
    color: "success",
    class: "zen-bg-zen-success-soft zen-text-zen-success-soft-fg zen-border zen-border-zen-success-soft"
  }, {
    variant: "soft",
    color: "warning",
    class: "zen-bg-zen-warning-soft zen-text-zen-warning-soft-fg zen-border zen-border-zen-warning-soft"
  }, {
    variant: "soft",
    color: "destructive",
    class: "zen-bg-zen-error-soft zen-text-zen-error-soft-fg zen-border zen-border-zen-error-soft"
  }, {
    variant: "outline",
    color: "neutral",
    class: "zen-border zen-border-zen-border zen-text-zen-foreground"
  }, {
    variant: "outline",
    color: "primary",
    class: "zen-border zen-border-zen-primary zen-text-zen-foreground"
  }, {
    variant: "outline",
    color: "info",
    class: "zen-border zen-border-zen-info zen-text-zen-foreground"
  }, {
    variant: "outline",
    color: "success",
    class: "zen-border zen-border-zen-success zen-text-zen-foreground"
  }, {
    variant: "outline",
    color: "warning",
    class: "zen-border zen-border-zen-warning zen-text-zen-foreground"
  }, {
    variant: "outline",
    color: "destructive",
    class: "zen-border zen-border-zen-error zen-text-zen-foreground"
  }],
  defaultVariants: {
    variant: "soft",
    color: "info"
  }
}), w = (t) => {
  const r = f({
    role: "alert"
  }, t), [n, e] = l(r, ["class", "color", "variant", "children"]);
  return (() => {
    var z = u();
    return o(z, s({
      get class() {
        return a(v({
          color: n.color,
          variant: n.variant
        }), n.class);
      }
    }, e), !1, !0), c(z, () => n.children), z;
  })();
}, $ = (t) => {
  const [r, n] = l(t, ["class", "children"]);
  return (() => {
    var e = b();
    return o(e, s({
      get class() {
        return a("zen-shrink-0 zen-inline-flex zen-items-center zen-justify-center zen-mt-0.5", r.class);
      }
    }, n), !1, !0), c(e, () => r.children), e;
  })();
}, _ = (t) => {
  const [r, n] = l(t, ["class", "children"]);
  return (() => {
    var e = u();
    return o(e, s({
      get class() {
        return a("zen-min-w-0 zen-flex-1 zen-flex zen-flex-col zen-gap-1", r.class);
      }
    }, n), !1, !0), c(e, () => r.children), e;
  })();
}, k = (t) => {
  const [r, n] = l(t, ["class", "children"]);
  return (() => {
    var e = d();
    return o(e, s({
      get class() {
        return a("zen-font-semibold zen-leading-tight zen-text-sm", r.class);
      }
    }, n), !1, !0), c(e, () => r.children), e;
  })();
}, A = (t) => {
  const [r, n] = l(t, ["class", "children"]);
  return (() => {
    var e = d();
    return o(e, s({
      get class() {
        return a("zen-text-sm zen-opacity-90 zen-leading-snug", r.class);
      }
    }, n), !1, !0), c(e, () => r.children), e;
  })();
}, P = (t) => {
  const [r, n] = l(t, ["class", "children"]);
  return (() => {
    var e = u();
    return o(e, s({
      get class() {
        return a("zen-ml-auto zen-shrink-0 zen-flex zen-items-center zen-gap-4 zen-self-center", r.class);
      }
    }, n), !1, !0), c(e, () => r.children), e;
  })();
}, j = (t) => {
  const [r, n] = l(t, ["class"]);
  return (() => {
    var e = p();
    return o(e, s({
      get class() {
        return a("zen-shrink-0 zen-inline-flex zen-items-center zen-justify-center zen-h-6 zen-w-6 zen-rounded-zen-sm", "zen-bg-transparent zen-border-0 zen-cursor-pointer zen-text-current zen-opacity-70", "hover:zen-opacity-100 hover:zen-bg-current/10", "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring", r.class);
      }
    }, n), !1, !0), e;
  })();
};
export {
  w as Alert,
  P as AlertActions,
  j as AlertClose,
  _ as AlertContent,
  A as AlertDescription,
  $ as AlertIcon,
  k as AlertTitle,
  v as alertVariants
};
//# sourceMappingURL=index39.js.map
