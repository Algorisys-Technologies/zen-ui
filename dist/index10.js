import { jsxs as r, jsx as e } from "react/jsx-runtime";
import * as o from "react";
import { cn as t } from "./index145.js";
const p = o.forwardRef(
  ({ className: s, showLabel: d = "Show password", hideLabel: l = "Hide password", disabled: i, ...a }, z) => {
    const [n, c] = o.useState(!1);
    return /* @__PURE__ */ r("div", { className: "zen-relative zen-w-full", children: [
      /* @__PURE__ */ e(
        "input",
        {
          ref: z,
          type: n ? "text" : "password",
          disabled: i,
          className: t(
            "zen-flex zen-h-10 zen-w-full zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-ps-3 zen-pe-10 zen-py-2 zen-text-sm",
            "placeholder:zen-text-zen-muted-fg",
            "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
            "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
            s
          ),
          ...a
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          disabled: i,
          "aria-label": n ? l : d,
          "aria-pressed": n,
          onClick: () => c((u) => !u),
          className: t(
            "zen-absolute zen-top-1/2 -zen-translate-y-1/2 zen-end-2",
            "zen-inline-flex zen-items-center zen-justify-center zen-h-6 zen-w-6 zen-rounded-zen-sm",
            "zen-text-zen-muted-fg hover:zen-text-zen-foreground",
            "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
            "disabled:zen-cursor-not-allowed disabled:zen-opacity-50"
          ),
          children: n ? /* @__PURE__ */ r("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, children: [
            /* @__PURE__ */ e("path", { d: "M9.88 9.88a3 3 0 1 0 4.24 4.24" }),
            /* @__PURE__ */ e("path", { d: "M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" }),
            /* @__PURE__ */ e("path", { d: "M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" }),
            /* @__PURE__ */ e("line", { x1: "2", x2: "22", y1: "2", y2: "22" })
          ] }) : /* @__PURE__ */ r("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, children: [
            /* @__PURE__ */ e("path", { d: "M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" }),
            /* @__PURE__ */ e("circle", { cx: "12", cy: "12", r: "3" })
          ] })
        }
      )
    ] });
  }
);
p.displayName = "PasswordInput";
export {
  p as PasswordInput
};
//# sourceMappingURL=index10.js.map
