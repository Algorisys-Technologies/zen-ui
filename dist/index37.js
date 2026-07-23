import { template as c, spread as s, mergeProps as l, insert as a } from "solid-js/web";
import { splitProps as o } from "solid-js";
import { cva as d } from "./index115.js";
import { cn as i } from "./index103.js";
var p = /* @__PURE__ */ c('<div role=status aria-live=polite><div class="zen-flex zen-items-center zen-gap-3 zen-w-full zen-max-w-[100rem] zen-mx-auto">'), g = /* @__PURE__ */ c("<span aria-hidden=true>"), z = /* @__PURE__ */ c("<div>"), f = /* @__PURE__ */ c("<span>"), m = /* @__PURE__ */ c('<button type=button aria-label="Dismiss banner"><svg width=14 height=14 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2.5 stroke-linecap=round stroke-linejoin=round aria-hidden=true><line x1=18 y1=6 x2=6 y2=18></line><line x1=6 y1=6 x2=18 y2=18>');
const x = d("zen-w-full zen-flex zen-items-center zen-gap-3 zen-px-4 zen-py-3 zen-text-sm zen-border-y", {
  variants: {
    color: {
      neutral: "zen-bg-zen-muted zen-text-zen-foreground zen-border-zen-border",
      primary: "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg zen-border-zen-primary-soft",
      info: "zen-bg-zen-info-soft zen-text-zen-info-soft-fg zen-border-zen-info-soft",
      success: "zen-bg-zen-success-soft zen-text-zen-success-soft-fg zen-border-zen-success-soft",
      warning: "zen-bg-zen-warning-soft zen-text-zen-warning-soft-fg zen-border-zen-warning-soft",
      destructive: "zen-bg-zen-error-soft zen-text-zen-error-soft-fg zen-border-zen-error-soft"
    },
    sticky: {
      true: "zen-sticky zen-top-0 zen-z-30",
      false: ""
    }
  },
  defaultVariants: {
    color: "info",
    sticky: !1
  }
}), k = (r) => {
  const [n, t] = o(r, ["class", "color", "sticky", "children"]);
  return (() => {
    var e = p(), u = e.firstChild;
    return s(e, l({
      get class() {
        return i(x({
          color: n.color,
          sticky: n.sticky
        }), n.class);
      }
    }, t), !1, !0), a(u, () => n.children), e;
  })();
}, w = (r) => {
  const [n, t] = o(r, ["class", "children"]);
  return (() => {
    var e = g();
    return s(e, l({
      get class() {
        return i("zen-flex-shrink-0 zen-inline-flex zen-items-center", n.class);
      }
    }, t), !1, !0), a(e, () => n.children), e;
  })();
}, _ = (r) => {
  const [n, t] = o(r, ["class", "children"]);
  return (() => {
    var e = z();
    return s(e, l({
      get class() {
        return i("zen-flex-1 zen-min-w-0 zen-inline-flex zen-flex-wrap zen-items-baseline zen-gap-x-2", n.class);
      }
    }, t), !1, !0), a(e, () => n.children), e;
  })();
}, $ = (r) => {
  const [n, t] = o(r, ["class", "children"]);
  return (() => {
    var e = f();
    return s(e, l({
      get class() {
        return i("zen-font-semibold", n.class);
      }
    }, t), !1, !0), a(e, () => n.children), e;
  })();
}, B = (r) => {
  const [n, t] = o(r, ["class", "children"]);
  return (() => {
    var e = f();
    return s(e, l({
      get class() {
        return i("zen-opacity-90", n.class);
      }
    }, t), !1, !0), a(e, () => n.children), e;
  })();
}, C = (r) => {
  const [n, t] = o(r, ["class", "children"]);
  return (() => {
    var e = z();
    return s(e, l({
      get class() {
        return i("zen-flex-shrink-0 zen-flex zen-items-center zen-gap-2", n.class);
      }
    }, t), !1, !0), a(e, () => n.children), e;
  })();
}, j = (r) => {
  const [n, t] = o(r, ["class"]);
  return (() => {
    var e = m();
    return s(e, l({
      get class() {
        return i("zen-flex-shrink-0 zen-inline-flex zen-items-center zen-justify-center", "zen-h-6 zen-w-6 zen-rounded-zen-sm zen-bg-transparent zen-border-0 zen-cursor-pointer", "zen-text-current zen-opacity-70 hover:zen-opacity-100 hover:zen-bg-black/10", "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring", n.class);
      }
    }, t), !1, !0), e;
  })();
};
export {
  k as Banner,
  C as BannerActions,
  j as BannerClose,
  _ as BannerContent,
  B as BannerDescription,
  w as BannerIcon,
  $ as BannerTitle,
  x as bannerVariants
};
//# sourceMappingURL=index37.js.map
