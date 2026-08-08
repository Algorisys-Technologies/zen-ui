import { jsxs as s, jsx as e } from "react/jsx-runtime";
import * as t from "react";
import { cn as r } from "./index143.js";
const y = {
  sm: { field: "zen-h-9 zen-text-sm", pad: "zen-ps-9 zen-pe-9", icon: "zen-left-2.5" },
  md: { field: "zen-h-10 zen-text-sm", pad: "zen-ps-10 zen-pe-10", icon: "zen-left-3" },
  lg: { field: "zen-h-11 zen-text-base", pad: "zen-ps-11 zen-pe-11", icon: "zen-left-3.5" }
}, C = t.forwardRef(
  ({ className: u, value: l, defaultValue: f, onValueChange: p, onClear: h, size: m = "md", clearLabel: b = "Clear search", disabled: z, ...g }, v) => {
    const o = t.useRef(null);
    t.useImperativeHandle(v, () => o.current);
    const a = l !== void 0, [x, k] = t.useState(f ?? ""), c = a ? l : x, d = (n) => {
      a || k(n), p?.(n);
    }, w = () => {
      d(""), h?.(), o.current?.focus();
    }, i = y[m];
    return /* @__PURE__ */ s("div", { className: r("zen-relative zen-w-full", u), children: [
      /* @__PURE__ */ e(
        "span",
        {
          "aria-hidden": !0,
          className: r(
            "zen-pointer-events-none zen-absolute zen-top-1/2 -zen-translate-y-1/2 zen-text-zen-muted-fg",
            i.icon
          ),
          children: /* @__PURE__ */ s("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
            /* @__PURE__ */ e("circle", { cx: "11", cy: "11", r: "8" }),
            /* @__PURE__ */ e("path", { d: "m21 21-4.3-4.3" })
          ] })
        }
      ),
      /* @__PURE__ */ e(
        "input",
        {
          ref: o,
          type: "search",
          value: c,
          disabled: z,
          onChange: (n) => d(n.target.value),
          className: r(
            "zen-w-full zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-py-2",
            i.field,
            i.pad,
            "placeholder:zen-text-zen-muted-fg",
            "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
            "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
            // Hide the browser's own clear affordance — we render our own.
            "[&::-webkit-search-cancel-button]:zen-appearance-none"
          ),
          ...g
        }
      ),
      c.length > 0 && !z ? /* @__PURE__ */ e(
        "button",
        {
          type: "button",
          "aria-label": b,
          onClick: w,
          className: r(
            "zen-absolute zen-top-1/2 -zen-translate-y-1/2 zen-end-2.5",
            "zen-inline-flex zen-items-center zen-justify-center zen-h-5 zen-w-5 zen-rounded-zen-full",
            "zen-text-zen-muted-fg hover:zen-text-zen-foreground hover:zen-bg-zen-muted",
            "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring"
          ),
          children: /* @__PURE__ */ s("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, children: [
            /* @__PURE__ */ e("path", { d: "M18 6 6 18" }),
            /* @__PURE__ */ e("path", { d: "m6 6 12 12" })
          ] })
        }
      ) : null
    ] });
  }
);
C.displayName = "Search";
export {
  C as Search
};
//# sourceMappingURL=index8.js.map
