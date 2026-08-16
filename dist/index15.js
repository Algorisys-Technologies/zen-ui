import { jsxs as u, jsx as n, Fragment as C } from "react/jsx-runtime";
import * as y from "react";
import { cn as t } from "./index145.js";
import { arrowStep as O } from "./index150.js";
import "./index25.js";
import "./index100.js";
const F = [
  { value: "strongly_disagree", label: "Strongly disagree", shortLabel: "SD" },
  { value: "disagree", label: "Disagree", shortLabel: "D" },
  { value: "neutral", label: "Neutral", shortLabel: "N" },
  { value: "agree", label: "Agree", shortLabel: "A" },
  { value: "strongly_agree", label: "Strongly agree", shortLabel: "SA" }
], T = y.forwardRef(
  ({
    value: b,
    defaultValue: w,
    onValueChange: N,
    question: f,
    options: z = F,
    layout: i = "segmented",
    minLabel: g,
    maxLabel: h,
    disabled: a,
    readOnly: d,
    className: k,
    name: D
  }, L) => {
    const [j, I] = y.useState(w), x = b !== void 0, m = x ? b : j, s = !a && !d, o = (e) => {
      x || I(e), N?.(e);
    }, c = z.findIndex((e) => e.value === m), S = (e) => {
      if (!s || c < 0) return;
      const l = i === "stacked" ? e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0 : O(e.key, e.currentTarget);
      if (l) {
        e.preventDefault();
        const r = Math.max(0, Math.min(z.length - 1, c + l));
        o(z[r].value);
      } else e.key === "Home" ? (e.preventDefault(), o(z[0].value)) : e.key === "End" && (e.preventDefault(), o(z[z.length - 1].value));
    }, v = D;
    return /* @__PURE__ */ u(
      "div",
      {
        ref: L,
        className: t("zen-flex zen-flex-col zen-gap-2 zen-max-w-full", k),
        children: [
          f ? /* @__PURE__ */ n("p", { className: "zen-text-sm zen-font-medium zen-text-zen-foreground zen-m-0", children: f }) : null,
          /* @__PURE__ */ n(
            "div",
            {
              role: "radiogroup",
              "aria-label": f,
              "aria-disabled": a || void 0,
              "aria-readonly": d || void 0,
              onKeyDown: S,
              className: t(
                i === "segmented" && // scroll the scale horizontally on narrow widths (keep corner clip vertically)
                "zen-flex zen-max-w-full zen-items-stretch zen-rounded-zen-md zen-border zen-border-zen-border zen-overflow-x-auto zen-overflow-y-hidden zen-bg-zen-background",
                i === "stacked" && "zen-flex zen-flex-col zen-gap-1",
                // No border or fill: the marks are the affordance, and the ends are
                // named by the captions underneath rather than by a frame.
                i === "scale" && "zen-flex zen-max-w-full zen-items-end zen-justify-between zen-gap-1 zen-overflow-x-auto",
                a && "zen-opacity-50"
              ),
              children: z.map((e, l) => {
                const r = m === e.value, p = l === 0, A = l === z.length - 1;
                return i === "scale" ? /* @__PURE__ */ u(
                  "button",
                  {
                    type: "button",
                    role: "radio",
                    "aria-checked": r,
                    "aria-label": e.label,
                    disabled: a,
                    tabIndex: r || c < 0 && l === 0 ? 0 : -1,
                    onClick: () => s && o(e.value),
                    title: e.label,
                    className: t(
                      "zen-flex zen-flex-1 zen-flex-col zen-items-center zen-gap-1.5",
                      "zen-min-w-[2.5rem] zen-px-1 zen-py-1.5 zen-rounded-zen-sm",
                      "zen-bg-transparent zen-border-0 zen-cursor-pointer zen-transition-colors",
                      s && "hover:zen-bg-zen-muted",
                      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                      (a || d) && "zen-cursor-default"
                    ),
                    children: [
                      /* @__PURE__ */ n(
                        "span",
                        {
                          "aria-hidden": !0,
                          className: t(
                            "zen-text-base zen-leading-none",
                            r ? "zen-text-zen-foreground zen-font-semibold" : "zen-text-zen-muted-fg"
                          ),
                          children: e.renderOption ? e.renderOption() : e.label
                        }
                      ),
                      /* @__PURE__ */ n(
                        "span",
                        {
                          "aria-hidden": !0,
                          className: t(
                            "zen-inline-flex zen-items-center zen-justify-center",
                            "zen-h-4 zen-w-4 zen-rounded-zen-full zen-border",
                            r ? "zen-border-zen-primary zen-bg-zen-primary" : "zen-border-zen-border zen-bg-zen-background"
                          ),
                          children: r ? /* @__PURE__ */ n("span", { className: "zen-h-1.5 zen-w-1.5 zen-rounded-zen-full zen-bg-zen-primary-fg" }) : null
                        }
                      )
                    ]
                  },
                  e.value
                ) : i === "stacked" ? /* @__PURE__ */ u(
                  "button",
                  {
                    type: "button",
                    role: "radio",
                    "aria-checked": r,
                    "aria-label": e.label,
                    disabled: a,
                    tabIndex: r || c < 0 && l === 0 ? 0 : -1,
                    onClick: () => s && o(e.value),
                    className: t(
                      "zen-flex zen-items-center zen-gap-2 zen-px-2 zen-py-1.5 zen-rounded-zen-sm",
                      "zen-bg-transparent zen-border-0 zen-text-start zen-text-sm zen-cursor-pointer",
                      "zen-transition-colors",
                      s && "hover:zen-bg-zen-muted",
                      r && "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg",
                      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                      (a || d) && "zen-cursor-default"
                    ),
                    children: [
                      /* @__PURE__ */ n(
                        "span",
                        {
                          "aria-hidden": !0,
                          className: t(
                            "zen-inline-flex zen-items-center zen-justify-center",
                            "zen-h-4 zen-w-4 zen-rounded-zen-full zen-border",
                            r ? "zen-border-zen-primary zen-bg-zen-primary" : "zen-border-zen-border zen-bg-zen-background"
                          ),
                          children: r ? /* @__PURE__ */ n("span", { className: "zen-h-1.5 zen-w-1.5 zen-rounded-zen-full zen-bg-zen-primary-fg" }) : null
                        }
                      ),
                      e.renderOption ? /* @__PURE__ */ n("span", { "aria-hidden": !0, children: e.renderOption() }) : /* @__PURE__ */ n("span", { children: e.label })
                    ]
                  },
                  e.value
                ) : /* @__PURE__ */ n(
                  "button",
                  {
                    type: "button",
                    role: "radio",
                    "aria-checked": r,
                    "aria-label": e.label,
                    disabled: a,
                    tabIndex: r || c < 0 && l === 0 ? 0 : -1,
                    onClick: () => s && o(e.value),
                    title: e.label,
                    className: t(
                      "zen-flex-1 zen-min-w-[3.5rem] zen-px-3 zen-py-2",
                      "zen-inline-flex zen-items-center zen-justify-center",
                      "zen-text-xs zen-font-medium",
                      "zen-bg-transparent zen-border-0 zen-cursor-pointer zen-transition-colors",
                      !p && "zen-border-l zen-border-zen-border",
                      "zen-text-zen-muted-fg",
                      s && "hover:zen-bg-zen-muted hover:zen-text-zen-foreground",
                      r && "zen-bg-zen-primary zen-text-zen-primary-fg hover:zen-bg-zen-primary hover:zen-text-zen-primary-fg",
                      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-inset",
                      (a || d) && "zen-cursor-default",
                      p && "zen-rounded-l-zen-md",
                      A && "zen-rounded-r-zen-md"
                    ),
                    children: e.renderOption ? /* @__PURE__ */ n("span", { "aria-hidden": !0, children: e.renderOption() }) : /* @__PURE__ */ u(C, { children: [
                      /* @__PURE__ */ n("span", { className: "zen-hidden md:zen-inline", children: e.label }),
                      /* @__PURE__ */ n("span", { className: "md:zen-hidden", children: e.shortLabel ?? e.label })
                    ] })
                  },
                  e.value
                );
              })
            }
          ),
          i === "scale" && (g || h) ? (
            // Captions, not controls: they name the ends of the scale and are
            // not themselves answerable.
            /* @__PURE__ */ u("div", { className: "zen-flex zen-items-start zen-justify-between zen-gap-4 zen-text-xs zen-text-zen-muted-fg", children: [
              /* @__PURE__ */ n("span", { children: g }),
              /* @__PURE__ */ n("span", { className: "zen-text-end", children: h })
            ] })
          ) : null,
          v && m !== void 0 ? /* @__PURE__ */ n("input", { type: "hidden", name: v, value: m }) : null
        ]
      }
    );
  }
);
T.displayName = "Likert";
export {
  T as Likert
};
//# sourceMappingURL=index15.js.map
