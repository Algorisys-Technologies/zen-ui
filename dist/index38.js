import { template as s, spread as l, mergeProps as a, insert as z } from "solid-js/web";
import { splitProps as c } from "solid-js";
import { cva as o } from "./index115.js";
import { cn as d } from "./index103.js";
var i = /* @__PURE__ */ s("<div role=status>"), m = /* @__PURE__ */ s("<div aria-hidden=true>"), u = /* @__PURE__ */ s("<h3>"), p = /* @__PURE__ */ s("<p>"), f = /* @__PURE__ */ s("<div>");
const g = o("zen-flex zen-flex-col zen-items-center zen-justify-center zen-text-center zen-text-zen-foreground", {
  variants: {
    size: {
      sm: "zen-py-6 zen-px-3 zen-gap-1.5",
      md: "zen-py-10 zen-px-6 zen-gap-3",
      lg: "zen-py-16 zen-px-8 zen-gap-4"
    },
    bordered: {
      true: "zen-border-2 zen-border-dashed zen-border-zen-border zen-rounded-zen-md zen-bg-zen-muted/40",
      false: ""
    }
  },
  defaultVariants: {
    size: "md",
    bordered: !1
  }
}), v = (n) => {
  const [t, r] = c(n, ["class", "size", "bordered", "children"]);
  return (() => {
    var e = i();
    return l(e, a({
      get class() {
        return d(g({
          size: t.size,
          bordered: t.bordered
        }), t.class);
      }
    }, r), !1, !0), z(e, () => t.children), e;
  })();
}, _ = (n) => {
  const [t, r] = c(n, ["class", "children"]);
  return (() => {
    var e = m();
    return l(e, a({
      get class() {
        return d("zen-inline-flex zen-items-center zen-justify-center", "zen-h-12 zen-w-12 zen-rounded-zen-full zen-bg-zen-muted zen-text-zen-muted-fg", "zen-mb-1", t.class);
      }
    }, r), !1, !0), z(e, () => t.children), e;
  })();
}, $ = (n) => {
  const [t, r] = c(n, ["class", "children"]);
  return (() => {
    var e = u();
    return l(e, a({
      get class() {
        return d("zen-text-base zen-font-semibold zen-m-0", t.class);
      }
    }, r), !1, !0), z(e, () => t.children), e;
  })();
}, S = (n) => {
  const [t, r] = c(n, ["class", "children"]);
  return (() => {
    var e = p();
    return l(e, a({
      get class() {
        return d("zen-text-sm zen-text-zen-muted-fg zen-max-w-[40ch] zen-m-0 zen-leading-relaxed", t.class);
      }
    }, r), !1, !0), z(e, () => t.children), e;
  })();
}, E = (n) => {
  const [t, r] = c(n, ["class", "children"]);
  return (() => {
    var e = f();
    return l(e, a({
      get class() {
        return d("zen-flex zen-flex-wrap zen-items-center zen-justify-center zen-gap-2 zen-mt-2", t.class);
      }
    }, r), !1, !0), z(e, () => t.children), e;
  })();
};
export {
  v as EmptyState,
  E as EmptyStateActions,
  S as EmptyStateDescription,
  _ as EmptyStateIcon,
  $ as EmptyStateTitle,
  g as emptyStateVariants
};
//# sourceMappingURL=index38.js.map
