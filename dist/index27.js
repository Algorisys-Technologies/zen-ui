import { jsxs as m, jsx as t } from "react/jsx-runtime";
import * as z from "react";
import { cn as d } from "./index145.js";
import { directionOf as $, arrowStep as j } from "./index150.js";
import "./index25.js";
import "./index100.js";
import { Icon as D } from "./index57.js";
const I = z.forwardRef(
  ({ label: s = "Carousel", arrows: a = !0, dots: u = !0, perView: r = 1, className: h, children: v, ...p }, x) => {
    const b = z.Children.toArray(v), l = b.length, f = z.useRef(null), [o, y] = z.useState(0), c = Math.max(0, l - r), i = (n) => {
      const e = f.current;
      if (!e) return;
      const C = Math.max(0, Math.min(c, n)), M = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches, w = $(e) === "rtl" ? -1 : 1;
      e.scrollTo({
        left: w * C * (e.clientWidth / r),
        behavior: M ? "auto" : "smooth"
      });
    }, k = () => {
      const n = f.current;
      if (!n) return;
      const e = n.clientWidth / r;
      e > 0 && y(Math.round(Math.abs(n.scrollLeft) / e));
    }, N = (n) => {
      const e = j(n.key, n.currentTarget);
      e ? (n.preventDefault(), i(o + e)) : n.key === "Home" ? (n.preventDefault(), i(0)) : n.key === "End" && (n.preventDefault(), i(c));
    };
    return /* @__PURE__ */ m(
      "div",
      {
        ref: x,
        role: "group",
        "aria-roledescription": "carousel",
        "aria-label": s,
        className: d("zen-relative zen-flex zen-flex-col zen-gap-2", h),
        ...p,
        children: [
          /* @__PURE__ */ m("div", { className: "zen-relative zen-flex zen-items-center zen-gap-2", children: [
            a && l > r ? /* @__PURE__ */ t(
              g,
              {
                dir: "prev",
                disabled: o <= 0,
                onClick: () => i(o - 1)
              }
            ) : null,
            /* @__PURE__ */ t(
              "div",
              {
                ref: f,
                onScroll: k,
                onKeyDown: N,
                tabIndex: 0,
                className: d(
                  "zen-flex zen-min-w-0 zen-flex-1 zen-gap-3 zen-overflow-x-auto",
                  "zen-snap-x zen-snap-mandatory",
                  "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2 zen-rounded-zen-md",
                  // The scroller IS the control, so its scrollbar is chrome.
                  "zen-[scrollbar-width:none]"
                ),
                children: b.map((n, e) => /* @__PURE__ */ t(
                  "div",
                  {
                    role: "group",
                    "aria-roledescription": "slide",
                    "aria-label": `${e + 1} of ${l}`,
                    "aria-hidden": e < o || e >= o + r || void 0,
                    className: "zen-shrink-0 zen-snap-start",
                    style: { width: `calc((100% - ${(r - 1) * 0.75}rem) / ${r})` },
                    children: n
                  },
                  e
                ))
              }
            ),
            a && l > r ? /* @__PURE__ */ t(
              g,
              {
                dir: "next",
                disabled: o >= c,
                onClick: () => i(o + 1)
              }
            ) : null
          ] }),
          u && l > r ? /* @__PURE__ */ t("div", { className: "zen-flex zen-justify-center zen-gap-1.5", children: Array.from({ length: c + 1 }, (n, e) => /* @__PURE__ */ t(
            "button",
            {
              type: "button",
              "aria-label": `Go to slide ${e + 1}`,
              "aria-current": e === o || void 0,
              onClick: () => i(e),
              className: d(
                "zen-h-2 zen-w-2 zen-cursor-pointer zen-rounded-zen-full zen-border-0 zen-p-0",
                "zen-transition-colors",
                "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
                e === o ? "zen-bg-zen-primary" : "zen-bg-zen-border hover:zen-bg-zen-muted-fg"
              )
            },
            e
          )) }) : null
        ]
      }
    );
  }
);
I.displayName = "Carousel";
const g = ({
  dir: s,
  disabled: a,
  onClick: u
}) => /* @__PURE__ */ t(
  "button",
  {
    type: "button",
    onClick: u,
    disabled: a,
    "aria-label": s === "prev" ? "Previous slide" : "Next slide",
    className: d(
      "zen-inline-flex zen-h-8 zen-w-8 zen-shrink-0 zen-items-center zen-justify-center",
      "zen-cursor-pointer zen-rounded-zen-full zen-border zen-border-zen-border zen-bg-zen-background",
      "zen-text-zen-foreground zen-transition-colors hover:zen-bg-zen-muted",
      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
      "disabled:zen-cursor-not-allowed disabled:zen-opacity-40 disabled:hover:zen-bg-zen-background"
    ),
    children: /* @__PURE__ */ t(D, { name: s === "prev" ? "chevron-left" : "chevron-right", size: 16 })
  }
);
export {
  I as Carousel
};
//# sourceMappingURL=index27.js.map
