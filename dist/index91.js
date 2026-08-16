import { jsx as l, jsxs as b } from "react/jsx-runtime";
import * as u from "react";
import { Button as v } from "./index65.js";
import { cn as d } from "./index145.js";
const y = u.createContext(null);
function h() {
  const e = u.useContext(y);
  if (!e)
    throw new Error(
      "useStepper / StepperList / StepperPanel / StepperNavigation must be rendered inside <Stepper>"
    );
  return e;
}
const P = ({
  steps: e,
  value: t,
  defaultValue: s,
  onValueChange: i,
  orientation: o = "horizontal",
  linear: n = !0,
  className: p,
  children: a
}) => {
  const [f, x] = u.useState(
    () => s ?? e[0]?.value ?? ""
  ), g = t ?? f, c = u.useCallback(
    (z) => {
      t === void 0 && x(z), i?.(z);
    },
    [t, i]
  ), r = Math.max(
    0,
    e.findIndex((z) => z.value === g)
  ), k = e[r], w = r === 0, S = r === e.length - 1, N = u.useCallback(() => {
    r < e.length - 1 && c(e[r + 1].value);
  }, [r, e, c]), C = u.useCallback(() => {
    r > 0 && c(e[r - 1].value);
  }, [r, e, c]), L = u.useCallback(
    (z) => {
      const m = e.findIndex((F) => F.value === z);
      m < 0 || e[m].disabled || n && m > r || c(z);
    },
    [e, n, r, c]
  ), j = u.useCallback(
    (z, m) => z.status ? z.status : m < r ? "completed" : m === r ? "current" : "pending",
    [r]
  ), I = {
    value: g,
    setValue: c,
    steps: e,
    orientation: o,
    linear: n,
    currentIndex: r,
    currentStep: k,
    isFirst: w,
    isLast: S,
    next: N,
    prev: C,
    goTo: L,
    statusFor: j
  };
  return /* @__PURE__ */ l(y.Provider, { value: I, children: /* @__PURE__ */ l(
    "div",
    {
      className: d(
        "zen-w-full",
        o === "vertical" ? "zen-flex zen-gap-6" : "zen-flex zen-flex-col zen-gap-6",
        p
      ),
      children: a
    }
  ) });
}, R = ({ className: e }) => {
  const t = h(), s = t.orientation === "horizontal";
  return /* @__PURE__ */ l(
    "ol",
    {
      className: d(
        s ? "zen-flex zen-items-center zen-gap-2 zen-w-full" : "zen-flex zen-flex-col zen-gap-1 zen-min-w-[14rem] zen-shrink-0",
        e
      ),
      "aria-label": "Steps",
      children: t.steps.map((i, o) => {
        const n = t.statusFor(i, o), p = o === t.steps.length - 1, a = !i.disabled && (!t.linear || n === "completed" || n === "current"), f = i.label ?? i.value;
        return /* @__PURE__ */ b(
          "li",
          {
            className: d(
              "zen-flex",
              s ? "zen-items-center zen-flex-1 zen-min-w-0" : "zen-flex-col zen-items-stretch"
            ),
            "aria-current": n === "current" ? "step" : void 0,
            children: [
              /* @__PURE__ */ b(
                "button",
                {
                  type: "button",
                  onClick: () => t.goTo(i.value),
                  disabled: !a,
                  "aria-label": `${f}, step ${o + 1} of ${t.steps.length}, ${n}`,
                  className: d(
                    "zen-flex zen-items-start zen-gap-2 zen-text-start zen-min-w-0",
                    "zen-bg-transparent zen-border-0 zen-p-1 zen-rounded-zen-sm",
                    a ? "zen-cursor-pointer hover:zen-bg-zen-muted/50" : "zen-cursor-default",
                    "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                    "disabled:zen-opacity-100"
                  ),
                  children: [
                    /* @__PURE__ */ l(B, { status: n, index: o }),
                    /* @__PURE__ */ b("div", { className: "zen-flex zen-flex-col zen-min-w-0", children: [
                      /* @__PURE__ */ l(
                        "span",
                        {
                          className: d(
                            "zen-text-sm zen-font-medium zen-truncate",
                            n === "current" || n === "completed" ? "zen-text-zen-foreground" : n === "error" ? "zen-text-zen-error" : "zen-text-zen-muted-fg"
                          ),
                          children: f
                        }
                      ),
                      i.description ? /* @__PURE__ */ l("span", { className: "zen-text-xs zen-text-zen-muted-fg zen-truncate", children: i.description }) : null
                    ] })
                  ]
                }
              ),
              p ? null : /* @__PURE__ */ l(
                "div",
                {
                  "aria-hidden": !0,
                  className: d(
                    s ? "zen-flex-1 zen-h-px zen-mx-2 zen-min-w-[1rem]" : "zen-ml-[1.05rem] zen-w-px zen-h-4 zen-my-1",
                    n === "completed" ? "zen-bg-zen-primary" : "zen-bg-zen-border"
                  )
                }
              )
            ]
          },
          i.value
        );
      })
    }
  );
}, B = ({
  status: e,
  index: t
}) => /* @__PURE__ */ l(
  "span",
  {
    className: d(
      "zen-inline-flex zen-items-center zen-justify-center zen-flex-shrink-0",
      "zen-h-7 zen-w-7 zen-rounded-zen-full",
      "zen-text-xs zen-font-semibold",
      {
        pending: "zen-bg-zen-background zen-border zen-border-zen-border zen-text-zen-muted-fg",
        current: "zen-bg-zen-primary zen-text-zen-primary-fg zen-ring-2 zen-ring-zen-primary-soft zen-ring-offset-1",
        completed: "zen-bg-zen-primary zen-text-zen-primary-fg",
        error: "zen-bg-zen-error zen-text-zen-error-fg"
      }[e]
    ),
    "aria-hidden": !0,
    children: e === "completed" ? /* @__PURE__ */ l(
      "svg",
      {
        width: "14",
        height: "14",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "3",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        children: /* @__PURE__ */ l("polyline", { points: "20 6 9 17 4 12" })
      }
    ) : e === "error" ? "!" : t + 1
  }
), V = ({
  value: e,
  children: t,
  className: s,
  forceMount: i
}) => {
  const o = h(), n = o.value === e;
  return !n && !i ? null : /* @__PURE__ */ l(
    "div",
    {
      role: "tabpanel",
      "data-state": n ? "active" : "inactive",
      hidden: !n,
      className: d(
        o.orientation === "vertical" ? "zen-flex-1 zen-min-w-0" : "zen-w-full",
        s
      ),
      children: t
    }
  );
}, W = ({
  onBeforeNext: e,
  onSubmit: t,
  backLabel: s = "Back",
  nextLabel: i = "Continue",
  submitLabel: o = "Submit",
  className: n,
  hideBackOnFirst: p = !0
}) => {
  const a = h(), [f, x] = u.useState(!1), g = async () => {
    if (!f) {
      x(!0);
      try {
        if (e && !await e())
          return;
        a.isLast ? await t?.() : a.next();
      } finally {
        x(!1);
      }
    }
  }, c = !(a.isFirst && p);
  return /* @__PURE__ */ b(
    "div",
    {
      className: d(
        "zen-flex zen-items-center zen-gap-2 zen-mt-6",
        c ? "zen-justify-between" : "zen-justify-end",
        n
      ),
      children: [
        c ? /* @__PURE__ */ l(
          v,
          {
            type: "button",
            variant: "outline",
            color: "neutral",
            disabled: a.isFirst || f,
            onClick: a.prev,
            children: s
          }
        ) : null,
        /* @__PURE__ */ l(v, { type: "button", onClick: g, loading: f, children: a.isLast ? o : i })
      ]
    }
  );
};
export {
  P as Stepper,
  R as StepperList,
  W as StepperNavigation,
  V as StepperPanel,
  h as useStepper
};
//# sourceMappingURL=index91.js.map
