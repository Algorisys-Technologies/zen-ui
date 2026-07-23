import { template as z, spread as a, mergeProps as s, insert as l } from "solid-js/web";
import { splitProps as o } from "solid-js";
import { cva as i } from "./index118.js";
import { cn as c } from "./index106.js";
var d = /* @__PURE__ */ z("<div>"), p = /* @__PURE__ */ z("<h3>"), u = /* @__PURE__ */ z("<p>");
const g = i("zen-rounded-zen-md zen-border zen-bg-zen-background zen-text-zen-foreground", {
  variants: {
    variant: {
      elevated: "zen-border-zen-border zen-shadow-zen-sm",
      outlined: "zen-border-zen-border",
      ghost: "zen-border-transparent"
    },
    padding: {
      none: "",
      sm: "zen-p-3",
      md: "zen-p-5",
      lg: "zen-p-6"
    }
  },
  defaultVariants: {
    variant: "outlined",
    padding: "none"
  }
}), b = (n) => {
  const [r, t] = o(n, ["class", "variant", "padding", "children"]);
  return (() => {
    var e = d();
    return a(e, s({
      get class() {
        return c(g({
          variant: r.variant,
          padding: r.padding
        }), r.class);
      }
    }, t), !1, !0), l(e, () => r.children), e;
  })();
}, x = (n) => {
  const [r, t] = o(n, ["class", "children"]);
  return (() => {
    var e = d();
    return a(e, s({
      get class() {
        return c("zen-flex zen-flex-col zen-gap-1 zen-p-5 zen-pb-3", r.class);
      }
    }, t), !1, !0), l(e, () => r.children), e;
  })();
}, _ = (n) => {
  const [r, t] = o(n, ["class", "children"]);
  return (() => {
    var e = p();
    return a(e, s({
      get class() {
        return c("zen-text-base zen-font-semibold zen-leading-tight zen-m-0 zen-text-zen-foreground", r.class);
      }
    }, t), !1, !0), l(e, () => r.children), e;
  })();
}, $ = (n) => {
  const [r, t] = o(n, ["class", "children"]);
  return (() => {
    var e = u();
    return a(e, s({
      get class() {
        return c("zen-text-sm zen-text-zen-muted-fg zen-m-0", r.class);
      }
    }, t), !1, !0), l(e, () => r.children), e;
  })();
}, C = (n) => {
  const [r, t] = o(n, ["class", "children"]);
  return (() => {
    var e = d();
    return a(e, s({
      get class() {
        return c("zen-p-5 zen-pt-0", r.class);
      }
    }, t), !1, !0), l(e, () => r.children), e;
  })();
}, P = (n) => {
  const [r, t] = o(n, ["class", "children"]);
  return (() => {
    var e = d();
    return a(e, s({
      get class() {
        return c("zen-flex zen-items-center zen-gap-2 zen-p-5 zen-pt-3 zen-border-t zen-border-zen-border", r.class);
      }
    }, t), !1, !0), l(e, () => r.children), e;
  })();
};
export {
  b as Card,
  C as CardContent,
  $ as CardDescription,
  P as CardFooter,
  x as CardHeader,
  _ as CardTitle,
  g as cardVariants
};
//# sourceMappingURL=index32.js.map
