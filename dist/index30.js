import { jsxs as g, jsx as t } from "react/jsx-runtime";
import * as d from "react";
import { cn as u } from "./index197.js";
import { directionOf as I, arrowStep as R } from "./index205.js";
import "./index28.js";
import "./index110.js";
import { Icon as T } from "./index63.js";
import { useLocale as v } from "./index90.js";
const A = d.forwardRef(
  ({ label: a, arrows: c = !0, dots: f = !0, perView: r = 1, className: p, children: x, ...y }, k) => {
    const s = v(), N = a ?? s.t("carousel.label"), m = d.Children.toArray(x), i = m.length, b = d.useRef(null), [o, C] = d.useState(0), z = Math.max(0, i - r), l = (n) => {
      const e = b.current;
      if (!e) return;
      const S = Math.max(0, Math.min(z, n)), w = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches, j = I(e) === "rtl" ? -1 : 1;
      e.scrollTo({
        left: j * S * (e.clientWidth / r),
        behavior: w ? "auto" : "smooth"
      });
    }, D = () => {
      const n = b.current;
      if (!n) return;
      const e = n.clientWidth / r;
      e > 0 && C(Math.round(Math.abs(n.scrollLeft) / e));
    }, M = (n) => {
      const e = R(n.key, n.currentTarget);
      e ? (n.preventDefault(), l(o + e)) : n.key === "Home" ? (n.preventDefault(), l(0)) : n.key === "End" && (n.preventDefault(), l(z));
    };
    return /* @__PURE__ */ g(
      "div",
      {
        ref: k,
        role: "group",
        "aria-roledescription": s.t("carousel.roleDescription"),
        "aria-label": N,
        className: u("zen-relative zen-flex zen-flex-col zen-gap-2", p),
        ...y,
        children: [
          /* @__PURE__ */ g("div", { className: "zen-relative zen-flex zen-items-center zen-gap-2", children: [
            c && i > r ? /* @__PURE__ */ t(
              h,
              {
                dir: "prev",
                disabled: o <= 0,
                onClick: () => l(o - 1)
              }
            ) : null,
            /* @__PURE__ */ t(
              "div",
              {
                ref: b,
                onScroll: D,
                onKeyDown: M,
                tabIndex: 0,
                className: u(
                  "zen-flex zen-min-w-0 zen-flex-1 zen-gap-3 zen-overflow-x-auto",
                  "zen-snap-x zen-snap-mandatory",
                  "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2 zen-rounded-zen-md",
                  // The scroller IS the control, so its scrollbar is chrome.
                  "zen-[scrollbar-width:none]"
                ),
                children: m.map((n, e) => /* @__PURE__ */ t(
                  "div",
                  {
                    role: "group",
                    "aria-roledescription": s.t("carousel.slideRoleDescription"),
                    "aria-label": s.t("carousel.slideOf", { n: e + 1, count: i }),
                    "aria-hidden": e < o || e >= o + r || void 0,
                    className: "zen-shrink-0 zen-snap-start",
                    style: { width: `calc((100% - ${(r - 1) * 0.75}rem) / ${r})` },
                    children: n
                  },
                  e
                ))
              }
            ),
            c && i > r ? /* @__PURE__ */ t(
              h,
              {
                dir: "next",
                disabled: o >= z,
                onClick: () => l(o + 1)
              }
            ) : null
          ] }),
          f && i > r ? /* @__PURE__ */ t("div", { className: "zen-flex zen-justify-center zen-gap-1.5", children: Array.from({ length: z + 1 }, (n, e) => /* @__PURE__ */ t(
            "button",
            {
              type: "button",
              "aria-label": s.t("carousel.goToSlide", { n: e + 1 }),
              "aria-current": e === o || void 0,
              onClick: () => l(e),
              className: u(
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
A.displayName = "Carousel";
const h = ({
  dir: a,
  disabled: c,
  onClick: f
}) => {
  const r = v();
  return /* @__PURE__ */ t(
    "button",
    {
      type: "button",
      onClick: f,
      disabled: c,
      "aria-label": r.t(a === "prev" ? "carousel.previousSlide" : "carousel.nextSlide"),
      className: u(
        "zen-inline-flex zen-h-8 zen-w-8 zen-shrink-0 zen-items-center zen-justify-center",
        "zen-cursor-pointer zen-rounded-zen-full zen-border zen-border-zen-border zen-bg-zen-background",
        "zen-text-zen-foreground zen-transition-colors hover:zen-bg-zen-muted",
        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
        "disabled:zen-cursor-not-allowed disabled:zen-opacity-40 disabled:hover:zen-bg-zen-background"
      ),
      children: /* @__PURE__ */ t(T, { name: a === "prev" ? "chevron-left" : "chevron-right", size: 16 })
    }
  );
};
export {
  A as Carousel
};
//# sourceMappingURL=index30.js.map
