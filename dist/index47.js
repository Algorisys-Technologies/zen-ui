import { jsxs as n, jsx as e } from "react/jsx-runtime";
import * as u from "react";
import { Icon as x } from "./index63.js";
import { useLocale as g } from "./index90.js";
import { cn as t } from "./index160.js";
const p = u.forwardRef(
  ({ title: s, subtitle: r, onBack: z, backLabel: a, actions: l, info: i, breadcrumb: o, className: c, ...m }, d) => {
    const f = g();
    return /* @__PURE__ */ n("div", { ref: d, className: t("zen-flex zen-flex-col zen-gap-2", c), ...m, children: [
      o,
      /* @__PURE__ */ n("div", { className: "zen-flex zen-items-start zen-gap-3", children: [
        z ? /* @__PURE__ */ e(
          "button",
          {
            type: "button",
            onClick: z,
            "aria-label": a ?? f.t("pageHeader.back"),
            className: t(
              "zen-inline-flex zen-h-8 zen-w-8 zen-shrink-0 zen-items-center zen-justify-center",
              "zen-cursor-pointer zen-rounded-zen-sm zen-border-0 zen-bg-transparent",
              "zen-text-zen-muted-fg zen-transition-colors",
              "hover:zen-bg-zen-muted hover:zen-text-zen-foreground",
              "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring"
            ),
            children: /* @__PURE__ */ e(x, { name: "arrow-left", size: 18 })
          }
        ) : null,
        /* @__PURE__ */ n("div", { className: "zen-flex zen-min-w-0 zen-flex-1 zen-flex-col zen-gap-0.5", children: [
          /* @__PURE__ */ n("div", { className: "zen-flex zen-min-w-0 zen-items-center zen-gap-2", children: [
            /* @__PURE__ */ e("h2", { className: "zen-m-0 zen-min-w-0 zen-truncate zen-text-xl zen-font-semibold zen-leading-8 zen-text-zen-foreground", children: s }),
            i ? /* @__PURE__ */ e("span", { className: "zen-inline-flex zen-shrink-0 zen-items-center", children: i }) : null
          ] }),
          r ? /* @__PURE__ */ e("p", { className: "zen-m-0 zen-text-sm zen-text-zen-muted-fg", children: r }) : null
        ] }),
        l ? /* @__PURE__ */ e("div", { className: "zen-flex zen-shrink-0 zen-items-center zen-gap-2", children: l }) : null
      ] })
    ] });
  }
);
p.displayName = "PageHeader";
export {
  p as PageHeader
};
//# sourceMappingURL=index47.js.map
