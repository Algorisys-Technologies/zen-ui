import { template as s, spread as t, mergeProps as f, insert as c } from "solid-js/web";
import { splitProps as u } from "solid-js";
import { cn as z } from "./index106.js";
var i = /* @__PURE__ */ s("<a>");
const l = ["zen-sr-only focus:zen-not-sr-only", "focus:zen-fixed focus:zen-top-4 focus:zen-left-4 focus:zen-z-50", "focus:zen-inline-flex focus:zen-items-center focus:zen-rounded-zen-md", "focus:zen-bg-zen-primary focus:zen-px-4 focus:zen-py-2 focus:zen-text-sm focus:zen-font-medium focus:zen-text-zen-primary-fg", "focus:zen-shadow-zen-lg focus:zen-outline-none focus:zen-ring-2 focus:zen-ring-zen-ring focus:zen-ring-offset-2"].join(" "), g = (o) => {
  const [e, r] = u(o, ["class", "href", "children"]);
  return (() => {
    var n = i();
    return t(n, f({
      get href() {
        return e.href ?? "#main-content";
      },
      get class() {
        return z(l, e.class);
      }
    }, r), !1, !0), c(n, () => e.children ?? "Skip to main content"), n;
  })();
};
export {
  l as SKIP_TO_CONTENT_CLASS,
  g as SkipToContent
};
//# sourceMappingURL=index11.js.map
