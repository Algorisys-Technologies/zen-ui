import { jsxs as o, jsx as e } from "react/jsx-runtime";
import * as i from "react";
import { useLocale as h } from "./index90.js";
import { cn as d } from "./index160.js";
const b = i.forwardRef(
  ({ className: z, showLabel: c, hideLabel: u, disabled: s, autoHideMs: r, ...f }, p) => {
    const l = h(), [n, a] = i.useState(!1);
    return i.useEffect(() => {
      if (!n || !r || r <= 0) return;
      const t = setTimeout(() => a(!1), r);
      return () => clearTimeout(t);
    }, [n, r]), /* @__PURE__ */ o("div", { className: "zen-relative zen-w-full", children: [
      /* @__PURE__ */ e(
        "input",
        {
          ref: p,
          type: n ? "text" : "password",
          disabled: s,
          className: d(
            "zen-flex zen-h-zen-control zen-w-full zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-ps-zen-control-x zen-pe-10 zen-py-2 zen-text-sm",
            "placeholder:zen-text-zen-muted-fg",
            "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
            "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
            z
          ),
          ...f
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          disabled: s,
          "aria-label": n ? u ?? l.t("passwordInput.hide") : c ?? l.t("passwordInput.show"),
          "aria-pressed": n,
          onClick: () => a((t) => !t),
          className: d(
            "zen-absolute zen-top-1/2 -zen-translate-y-1/2 zen-end-2",
            "zen-inline-flex zen-items-center zen-justify-center zen-h-6 zen-w-6 zen-rounded-zen-sm",
            "zen-text-zen-muted-fg hover:zen-text-zen-foreground",
            "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
            "disabled:zen-cursor-not-allowed disabled:zen-opacity-50"
          ),
          children: n ? /* @__PURE__ */ o("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, children: [
            /* @__PURE__ */ e("path", { d: "M9.88 9.88a3 3 0 1 0 4.24 4.24" }),
            /* @__PURE__ */ e("path", { d: "M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" }),
            /* @__PURE__ */ e("path", { d: "M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" }),
            /* @__PURE__ */ e("line", { x1: "2", x2: "22", y1: "2", y2: "22" })
          ] }) : /* @__PURE__ */ o("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, children: [
            /* @__PURE__ */ e("path", { d: "M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" }),
            /* @__PURE__ */ e("circle", { cx: "12", cy: "12", r: "3" })
          ] })
        }
      )
    ] });
  }
);
b.displayName = "PasswordInput";
export {
  b as PasswordInput
};
//# sourceMappingURL=index10.js.map
