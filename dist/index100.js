import { jsx as o, jsxs as f } from "react/jsx-runtime";
import * as t from "react";
import { cva as l } from "./index161.js";
import { useLocale as c } from "./index90.js";
import { cn as s } from "./index160.js";
const d = l(
  ["zen-w-full zen-flex zen-items-center zen-gap-3 zen-px-4 zen-py-3 zen-text-sm zen-border-y"].join(" "),
  {
    variants: {
      color: {
        neutral: "zen-bg-zen-muted zen-text-zen-foreground zen-border-zen-border",
        primary: "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg zen-border-zen-primary-soft",
        info: "zen-bg-zen-info-soft zen-text-zen-info-soft-fg zen-border-zen-info-soft",
        success: "zen-bg-zen-success-soft zen-text-zen-success-soft-fg zen-border-zen-success-soft",
        warning: "zen-bg-zen-warning-soft zen-text-zen-warning-soft-fg zen-border-zen-warning-soft",
        error: "zen-bg-zen-error-soft zen-text-zen-error-soft-fg zen-border-zen-error-soft",
        /** @deprecated spell it `error` — same tokens, same rendering. */
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
  }
), m = t.forwardRef(
  ({ className: e, color: n, sticky: r, children: a, ...i }, z) => /* @__PURE__ */ o(
    "div",
    {
      ref: z,
      role: "status",
      "aria-live": "polite",
      className: s(d({ color: n, sticky: r }), e),
      ...i,
      children: /* @__PURE__ */ o("div", { className: "zen-flex zen-items-center zen-gap-3 zen-w-full zen-max-w-[100rem] zen-mx-auto", children: a })
    }
  )
);
m.displayName = "Banner";
const p = t.forwardRef(({ className: e, ...n }, r) => /* @__PURE__ */ o(
  "span",
  {
    ref: r,
    "aria-hidden": !0,
    className: s("zen-flex-shrink-0 zen-inline-flex zen-items-center", e),
    ...n
  }
));
p.displayName = "BannerIcon";
const x = t.forwardRef(({ className: e, ...n }, r) => /* @__PURE__ */ o(
  "div",
  {
    ref: r,
    className: s(
      "zen-flex-1 zen-min-w-0 zen-inline-flex zen-flex-wrap zen-items-baseline zen-gap-x-2",
      e
    ),
    ...n
  }
));
x.displayName = "BannerContent";
const u = t.forwardRef(({ className: e, ...n }, r) => /* @__PURE__ */ o(
  "span",
  {
    ref: r,
    className: s("zen-font-semibold", e),
    ...n
  }
));
u.displayName = "BannerTitle";
const b = t.forwardRef(({ className: e, ...n }, r) => /* @__PURE__ */ o("span", { ref: r, className: s("zen-opacity-90", e), ...n }));
b.displayName = "BannerDescription";
const g = t.forwardRef(({ className: e, ...n }, r) => /* @__PURE__ */ o(
  "div",
  {
    ref: r,
    className: s("zen-flex-shrink-0 zen-flex zen-items-center zen-gap-2", e),
    ...n
  }
));
g.displayName = "BannerActions";
const y = t.forwardRef(
  ({ className: e, ...n }, r) => {
    const a = c();
    return /* @__PURE__ */ o(
      "button",
      {
        ref: r,
        type: "button",
        "aria-label": a.t("banner.dismissBanner"),
        className: s(
          "zen-flex-shrink-0 zen-inline-flex zen-items-center zen-justify-center",
          "zen-h-6 zen-w-6 zen-rounded-zen-sm zen-bg-transparent zen-border-0 zen-cursor-pointer",
          "zen-text-current zen-opacity-70 hover:zen-opacity-100 hover:zen-bg-black/10",
          "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
          e
        ),
        ...n,
        children: /* @__PURE__ */ f(
          "svg",
          {
            width: "14",
            height: "14",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "2.5",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            "aria-hidden": !0,
            children: [
              /* @__PURE__ */ o("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
              /* @__PURE__ */ o("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
            ]
          }
        )
      }
    );
  }
);
y.displayName = "BannerClose";
export {
  m as Banner,
  g as BannerActions,
  y as BannerClose,
  x as BannerContent,
  b as BannerDescription,
  p as BannerIcon,
  u as BannerTitle,
  d as bannerVariants
};
//# sourceMappingURL=index100.js.map
