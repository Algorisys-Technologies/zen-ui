import { jsx as a, jsxs as v } from "react/jsx-runtime";
import * as u from "react";
import { Button as L } from "./index71.js";
import { useLocale as S } from "./index90.js";
import { cn as d } from "./index160.js";
const N = u.createContext(null);
function y() {
  const e = u.useContext(N);
  if (!e)
    throw new Error(
      "useStepper / StepperList / StepperPanel / StepperNavigation must be rendered inside <Stepper>"
    );
  return e;
}
const W = ({
  steps: e,
  value: s,
  defaultValue: r,
  onValueChange: c,
  orientation: t = "horizontal",
  linear: l = !0,
  className: o,
  children: p
}) => {
  const [m, f] = u.useState(
    () => r ?? e[0]?.value ?? ""
  ), b = s ?? m, i = u.useCallback(
    (z) => {
      s === void 0 && f(z), c?.(z);
    },
    [s, c]
  ), n = Math.max(
    0,
    e.findIndex((z) => z.value === b)
  ), g = e[n], k = n === 0, h = n === e.length - 1, w = u.useCallback(() => {
    n < e.length - 1 && i(e[n + 1].value);
  }, [n, e, i]), C = u.useCallback(() => {
    n > 0 && i(e[n - 1].value);
  }, [n, e, i]), j = u.useCallback(
    (z) => {
      const x = e.findIndex((B) => B.value === z);
      x < 0 || e[x].disabled || l && x > n || i(z);
    },
    [e, l, n, i]
  ), I = u.useCallback(
    (z, x) => z.status ? z.status : x < n ? "completed" : x === n ? "current" : "pending",
    [n]
  ), F = {
    value: b,
    setValue: i,
    steps: e,
    orientation: t,
    linear: l,
    currentIndex: n,
    currentStep: g,
    isFirst: k,
    isLast: h,
    next: w,
    prev: C,
    goTo: j,
    statusFor: I
  };
  return /* @__PURE__ */ a(N.Provider, { value: F, children: /* @__PURE__ */ a(
    "div",
    {
      className: d(
        "zen-w-full",
        t === "vertical" ? "zen-flex zen-gap-6" : "zen-flex zen-flex-col zen-gap-6",
        o
      ),
      children: p
    }
  ) });
}, $ = ({ className: e }) => {
  const s = S(), r = y(), c = r.orientation === "horizontal";
  return /* @__PURE__ */ a(
    "ol",
    {
      className: d(
        // zen-ui ships no element reset (it is opt-in), so the list's own
        // margin, indent and markers are reset here.
        "zen-m-0 zen-list-none zen-p-0",
        c ? "zen-flex zen-items-center zen-gap-2 zen-w-full" : "zen-flex zen-flex-col zen-gap-1 zen-min-w-[14rem] zen-shrink-0",
        e
      ),
      "aria-label": s.t("stepper.steps"),
      children: r.steps.map((t, l) => {
        const o = r.statusFor(t, l), p = l === r.steps.length - 1, m = !t.disabled && (!r.linear || o === "completed" || o === "current"), f = t.label ?? t.value;
        return /* @__PURE__ */ v(
          "li",
          {
            className: d(
              "zen-flex",
              c ? "zen-items-center zen-flex-1 zen-min-w-0" : "zen-flex-col zen-items-stretch"
            ),
            "aria-current": o === "current" ? "step" : void 0,
            children: [
              /* @__PURE__ */ v(
                "button",
                {
                  type: "button",
                  onClick: () => r.goTo(t.value),
                  disabled: !m,
                  "aria-label": s.t("stepper.stepLabel", { label: f, n: l + 1, count: r.steps.length, status: s.t(`stepper.status.${o}`) }),
                  className: d(
                    "zen-flex zen-items-start zen-gap-2 zen-text-start zen-min-w-0",
                    "zen-bg-transparent zen-border-0 zen-p-1 zen-rounded-zen-sm",
                    m ? "zen-cursor-pointer hover:zen-bg-zen-muted/50" : "zen-cursor-default",
                    "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                    "disabled:zen-opacity-100"
                  ),
                  children: [
                    /* @__PURE__ */ a(T, { status: o, index: l }),
                    /* @__PURE__ */ v("div", { className: "zen-flex zen-flex-col zen-min-w-0", children: [
                      /* @__PURE__ */ a(
                        "span",
                        {
                          className: d(
                            "zen-text-sm zen-font-medium zen-truncate",
                            o === "current" || o === "completed" ? "zen-text-zen-foreground" : o === "error" ? "zen-text-zen-error" : "zen-text-zen-muted-fg"
                          ),
                          children: f
                        }
                      ),
                      t.description ? /* @__PURE__ */ a("span", { className: "zen-text-xs zen-text-zen-muted-fg zen-truncate", children: t.description }) : null
                    ] })
                  ]
                }
              ),
              p ? null : /* @__PURE__ */ a(
                "div",
                {
                  "aria-hidden": !0,
                  className: d(
                    c ? "zen-flex-1 zen-h-px zen-mx-2 zen-min-w-[1rem]" : "zen-ml-[1.05rem] zen-w-px zen-h-4 zen-my-1",
                    o === "completed" ? "zen-bg-zen-primary" : "zen-bg-zen-border"
                  )
                }
              )
            ]
          },
          t.value
        );
      })
    }
  );
}, T = ({
  status: e,
  index: s
}) => /* @__PURE__ */ a(
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
    children: e === "completed" ? /* @__PURE__ */ a(
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
        children: /* @__PURE__ */ a("polyline", { points: "20 6 9 17 4 12" })
      }
    ) : e === "error" ? "!" : s + 1
  }
), q = ({
  value: e,
  children: s,
  className: r,
  forceMount: c
}) => {
  const t = y(), l = t.value === e;
  return !l && !c ? null : /* @__PURE__ */ a(
    "div",
    {
      role: "tabpanel",
      "data-state": l ? "active" : "inactive",
      hidden: !l,
      className: d(
        t.orientation === "vertical" ? "zen-flex-1 zen-min-w-0" : "zen-w-full",
        r
      ),
      children: s
    }
  );
}, A = ({
  onBeforeNext: e,
  onSubmit: s,
  backLabel: r,
  nextLabel: c,
  submitLabel: t,
  className: l,
  hideBackOnFirst: o = !0
}) => {
  const p = S(), m = r ?? p.t("stepper.back"), f = c ?? p.t("stepper.continue"), b = t ?? p.t("stepper.submit"), i = y(), [n, g] = u.useState(!1), k = async () => {
    if (!n) {
      g(!0);
      try {
        if (e && !await e())
          return;
        i.isLast ? await s?.() : i.next();
      } finally {
        g(!1);
      }
    }
  }, h = !(i.isFirst && o);
  return /* @__PURE__ */ v(
    "div",
    {
      className: d(
        "zen-flex zen-items-center zen-gap-2 zen-mt-6",
        h ? "zen-justify-between" : "zen-justify-end",
        l
      ),
      children: [
        h ? /* @__PURE__ */ a(
          L,
          {
            type: "button",
            variant: "outline",
            color: "neutral",
            disabled: i.isFirst || n,
            onClick: i.prev,
            children: m
          }
        ) : null,
        /* @__PURE__ */ a(L, { type: "button", onClick: k, loading: n, children: i.isLast ? b : f })
      ]
    }
  );
};
export {
  W as Stepper,
  $ as StepperList,
  A as StepperNavigation,
  q as StepperPanel,
  y as useStepper
};
//# sourceMappingURL=index101.js.map
