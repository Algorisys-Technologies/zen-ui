import { jsx as c } from "react/jsx-runtime";
import * as r from "react";
import { useLocale as z } from "./index90.js";
import { cn as i } from "./index160.js";
const u = [
  "zen-sr-only focus:zen-not-sr-only",
  "focus:zen-fixed focus:zen-top-4 focus:zen-left-4 focus:zen-z-50",
  "focus:zen-inline-flex focus:zen-items-center focus:zen-rounded-zen-md",
  "focus:zen-bg-zen-primary focus:zen-px-4 focus:zen-py-2 focus:zen-text-sm focus:zen-font-medium focus:zen-text-zen-primary-fg",
  "focus:zen-shadow-zen-lg focus:zen-outline-none focus:zen-ring-2 focus:zen-ring-zen-ring focus:zen-ring-offset-2"
].join(" "), m = r.forwardRef(
  ({ className: n, href: o = "#main-content", children: e, ...s }, t) => {
    const f = z();
    return /* @__PURE__ */ c("a", { ref: t, href: o, className: i(u, n), ...s, children: e ?? f.t("skipToContent.skipToMainContent") });
  }
);
m.displayName = "SkipToContent";
export {
  u as SKIP_TO_CONTENT_CLASS,
  m as SkipToContent
};
//# sourceMappingURL=index51.js.map
