import { jsxs as f, jsx as n, Fragment as F } from "react/jsx-runtime";
import * as w from "react";
import { cn as l } from "./index160.js";
import { arrowStep as O } from "./index168.js";
import "./index28.js";
import "./index110.js";
import { useLocale as _ } from "./index90.js";
const M = [
  ["strongly_disagree", "likert.stronglyDisagree", "likert.stronglyDisagreeShort"],
  ["disagree", "likert.disagree", "likert.disagreeShort"],
  ["neutral", "likert.neutral", "likert.neutralShort"],
  ["agree", "likert.agree", "likert.agreeShort"],
  ["strongly_agree", "likert.stronglyAgree", "likert.stronglyAgreeShort"]
], R = (d) => M.map(([b, p, c]) => ({ value: b, label: d(p), shortLabel: d(c) })), T = w.forwardRef(
  ({
    value: d,
    defaultValue: b,
    onValueChange: p,
    question: c,
    options: N,
    layout: a = "segmented",
    minLabel: h,
    maxLabel: x,
    disabled: t,
    readOnly: u,
    className: D,
    name: S
  }, j) => {
    const A = _(), i = N ?? R(A.t), [I, L] = w.useState(b), v = d !== void 0, g = v ? d : I, s = !t && !u, o = (e) => {
      v || L(e), p?.(e);
    }, m = i.findIndex((e) => e.value === g), C = (e) => {
      if (!s || m < 0) return;
      const z = a === "stacked" ? e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0 : O(e.key, e.currentTarget);
      if (z) {
        e.preventDefault();
        const r = Math.max(0, Math.min(i.length - 1, m + z));
        o(i[r].value);
      } else e.key === "Home" ? (e.preventDefault(), o(i[0].value)) : e.key === "End" && (e.preventDefault(), o(i[i.length - 1].value));
    }, y = S;
    return /* @__PURE__ */ f(
      "div",
      {
        ref: j,
        className: l("zen-flex zen-flex-col zen-gap-2 zen-max-w-full", D),
        children: [
          c ? /* @__PURE__ */ n("p", { className: "zen-text-sm zen-font-medium zen-text-zen-foreground zen-m-0", children: c }) : null,
          /* @__PURE__ */ n(
            "div",
            {
              role: "radiogroup",
              "aria-label": c,
              "aria-disabled": t || void 0,
              "aria-readonly": u || void 0,
              onKeyDown: C,
              className: l(
                a === "segmented" && // scroll the scale horizontally on narrow widths (keep corner clip vertically)
                "zen-flex zen-max-w-full zen-items-stretch zen-rounded-zen-md zen-border zen-border-zen-border zen-overflow-x-auto zen-overflow-y-hidden zen-bg-zen-background",
                a === "stacked" && "zen-flex zen-flex-col zen-gap-1",
                // No border or fill: the marks are the affordance, and the ends are
                // named by the captions underneath rather than by a frame.
                a === "scale" && "zen-flex zen-max-w-full zen-items-end zen-justify-between zen-gap-1 zen-overflow-x-auto",
                t && "zen-opacity-50"
              ),
              children: i.map((e, z) => {
                const r = g === e.value, k = z === 0, E = z === i.length - 1;
                return a === "scale" ? /* @__PURE__ */ f(
                  "button",
                  {
                    type: "button",
                    role: "radio",
                    "aria-checked": r,
                    "aria-label": e.label,
                    disabled: t,
                    tabIndex: r || m < 0 && z === 0 ? 0 : -1,
                    onClick: () => s && o(e.value),
                    title: e.label,
                    className: l(
                      "zen-flex zen-flex-1 zen-flex-col zen-items-center zen-gap-1.5",
                      "zen-min-w-[2.5rem] zen-px-1 zen-py-1.5 zen-rounded-zen-sm",
                      "zen-bg-transparent zen-border-0 zen-cursor-pointer zen-transition-colors",
                      s && "hover:zen-bg-zen-muted",
                      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                      (t || u) && "zen-cursor-default"
                    ),
                    children: [
                      /* @__PURE__ */ n(
                        "span",
                        {
                          "aria-hidden": !0,
                          className: l(
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
                          className: l(
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
                ) : a === "stacked" ? /* @__PURE__ */ f(
                  "button",
                  {
                    type: "button",
                    role: "radio",
                    "aria-checked": r,
                    "aria-label": e.label,
                    disabled: t,
                    tabIndex: r || m < 0 && z === 0 ? 0 : -1,
                    onClick: () => s && o(e.value),
                    className: l(
                      "zen-flex zen-items-center zen-gap-2 zen-px-2 zen-py-1.5 zen-rounded-zen-sm",
                      "zen-bg-transparent zen-border-0 zen-text-start zen-text-sm zen-cursor-pointer",
                      "zen-transition-colors",
                      s && "hover:zen-bg-zen-muted",
                      r && "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg",
                      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                      (t || u) && "zen-cursor-default"
                    ),
                    children: [
                      /* @__PURE__ */ n(
                        "span",
                        {
                          "aria-hidden": !0,
                          className: l(
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
                    disabled: t,
                    tabIndex: r || m < 0 && z === 0 ? 0 : -1,
                    onClick: () => s && o(e.value),
                    title: e.label,
                    className: l(
                      "zen-flex-1 zen-min-w-[3.5rem] zen-px-3 zen-py-2",
                      "zen-inline-flex zen-items-center zen-justify-center",
                      "zen-text-xs zen-font-medium",
                      "zen-bg-transparent zen-border-0 zen-cursor-pointer zen-transition-colors",
                      !k && "zen-border-l zen-border-zen-border",
                      "zen-text-zen-muted-fg",
                      s && "hover:zen-bg-zen-muted hover:zen-text-zen-foreground",
                      r && "zen-bg-zen-primary zen-text-zen-primary-fg hover:zen-bg-zen-primary hover:zen-text-zen-primary-fg",
                      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-inset",
                      (t || u) && "zen-cursor-default",
                      k && "zen-rounded-l-zen-md",
                      E && "zen-rounded-r-zen-md"
                    ),
                    children: e.renderOption ? /* @__PURE__ */ n("span", { "aria-hidden": !0, children: e.renderOption() }) : /* @__PURE__ */ f(F, { children: [
                      /* @__PURE__ */ n("span", { className: "zen-hidden md:zen-inline", children: e.label }),
                      /* @__PURE__ */ n("span", { className: "md:zen-hidden", children: e.shortLabel ?? e.label })
                    ] })
                  },
                  e.value
                );
              })
            }
          ),
          a === "scale" && (h || x) ? (
            // Captions, not controls: they name the ends of the scale and are
            // not themselves answerable.
            /* @__PURE__ */ f("div", { className: "zen-flex zen-items-start zen-justify-between zen-gap-4 zen-text-xs zen-text-zen-muted-fg", children: [
              /* @__PURE__ */ n("span", { children: h }),
              /* @__PURE__ */ n("span", { className: "zen-text-end", children: x })
            ] })
          ) : null,
          y && g !== void 0 ? /* @__PURE__ */ n("input", { type: "hidden", name: y, value: g }) : null
        ]
      }
    );
  }
);
T.displayName = "Likert";
export {
  T as Likert
};
//# sourceMappingURL=index17.js.map
