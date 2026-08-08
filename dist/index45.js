import { jsx as t } from "react/jsx-runtime";
import * as c from "react";
import { cn as z } from "./index143.js";
const i = [
  "zen-sr-only focus:zen-not-sr-only",
  "focus:zen-fixed focus:zen-top-4 focus:zen-left-4 focus:zen-z-50",
  "focus:zen-inline-flex focus:zen-items-center focus:zen-rounded-zen-md",
  "focus:zen-bg-zen-primary focus:zen-px-4 focus:zen-py-2 focus:zen-text-sm focus:zen-font-medium focus:zen-text-zen-primary-fg",
  "focus:zen-shadow-zen-lg focus:zen-outline-none focus:zen-ring-2 focus:zen-ring-zen-ring focus:zen-ring-offset-2"
].join(" "), u = c.forwardRef(
  ({ className: n, href: e = "#main-content", children: o = "Skip to main content", ...s }, f) => /* @__PURE__ */ t("a", { ref: f, href: e, className: z(i, n), ...s, children: o })
);
u.displayName = "SkipToContent";
export {
  i as SKIP_TO_CONTENT_CLASS,
  u as SkipToContent
};
//# sourceMappingURL=index45.js.map
