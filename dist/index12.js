import { jsxs as d, jsx as o, Fragment as F } from "react/jsx-runtime";
import * as f from "react";
import { cn as h } from "./index143.js";
import { arrowStep as G } from "./index148.js";
import "./index24.js";
import "./index98.js";
const H = { sm: 16, md: 24, lg: 32 }, K = { sm: "gap-0.5", md: "gap-1", lg: "gap-1.5" }, T = f.forwardRef(
  ({
    value: r,
    defaultValue: i,
    onValueChange: k,
    max: a = 5,
    allowHalf: g,
    label: x,
    showValue: S,
    size: v = "md",
    allowClear: M = !0,
    disabled: l,
    readOnly: p,
    className: N,
    name: y
  }, $) => {
    const [D, A] = f.useState(i ?? 0), w = r !== void 0, t = w ? r : D, [C, z] = f.useState(0), I = C || t, c = !l && !p, u = g ? 0.5 : 1, s = (e) => {
      const n = Math.max(0, Math.min(a, e));
      w || A(n), k?.(n);
    }, L = (e) => {
      if (!c) return;
      const n = G(e.key, e.currentTarget);
      n === 1 || e.key === "ArrowUp" ? (e.preventDefault(), s(Math.min(a, t + u))) : n === -1 || e.key === "ArrowDown" ? (e.preventDefault(), s(Math.max(0, t - u))) : e.key === "Home" ? (e.preventDefault(), s(u)) : e.key === "End" && (e.preventDefault(), s(a));
    }, R = Array.from({ length: a }, (e, n) => n + 1), j = u, E = (e) => Math.max(0, Math.min(1, I - (e - 1))), B = (e) => `${e} ${e === 1 ? "star" : "stars"}`, m = (e, n) => /* @__PURE__ */ o(
      "button",
      {
        type: "button",
        role: "radio",
        "aria-checked": t === e,
        "aria-label": B(e),
        disabled: l,
        tabIndex: t === e || t === 0 && e === j ? 0 : -1,
        onClick: () => {
          c && s(M && t === e ? 0 : e);
        },
        onMouseEnter: () => c && z(e),
        onMouseLeave: () => c && z(0),
        onFocus: () => c && z(0),
        className: h(
          "zen-absolute zen-inset-y-0 zen-cursor-pointer zen-border-0 zen-bg-transparent zen-p-0",
          "zen-rounded-zen-sm",
          "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
          (l || p) && "zen-cursor-default",
          n === "left" && "zen-left-0 zen-w-1/2",
          n === "right" && "zen-right-0 zen-w-1/2",
          !n && "zen-inset-x-0"
        )
      },
      `${e}-${n ?? "whole"}`
    );
    return /* @__PURE__ */ d(
      "div",
      {
        ref: $,
        role: "radiogroup",
        "aria-label": x,
        "aria-disabled": l || void 0,
        "aria-readonly": p || void 0,
        onKeyDown: L,
        className: h(
          "zen-inline-flex zen-items-center",
          K[v],
          l && "zen-opacity-50 zen-cursor-not-allowed",
          N
        ),
        children: [
          R.map((e) => (
            // The star is drawn once and the options sit over it, rather than
            // each option drawing half a star: two clipped halves side by side
            // seam visibly down the middle of every star.
            /* @__PURE__ */ d("span", { className: "zen-relative zen-inline-flex zen-p-0.5", children: [
              /* @__PURE__ */ o(U, { size: H[v], fill: E(e) }),
              g ? /* @__PURE__ */ d(F, { children: [
                m(e - 0.5, "left"),
                m(e, "right")
              ] }) : m(e)
            ] }, e)
          )),
          S ? /* @__PURE__ */ o(
            "span",
            {
              className: h(
                "zen-ml-1 zen-text-sm zen-font-medium zen-tabular-nums",
                t > 0 ? "zen-text-zen-foreground" : "zen-text-zen-muted-fg"
              ),
              "aria-hidden": !0,
              children: t > 0 ? `${t} / ${a}` : "—"
            }
          ) : null,
          y ? /* @__PURE__ */ o("input", { type: "hidden", name: y, value: t }) : null
        ]
      }
    );
  }
);
T.displayName = "Rating";
const U = ({ size: r, fill: i }) => /* @__PURE__ */ d(
  "span",
  {
    className: "zen-relative zen-inline-block zen-shrink-0 zen-text-zen-border",
    style: { width: r, height: r },
    children: [
      /* @__PURE__ */ o(b, { size: r, filled: !1 }),
      i > 0 ? /* @__PURE__ */ o(
        "span",
        {
          className: "zen-absolute zen-inset-y-0 zen-start-0 zen-overflow-hidden zen-text-zen-warning",
          style: { width: `${i * 100}%` },
          children: /* @__PURE__ */ o(b, { size: r, filled: !0 })
        }
      ) : null
    ]
  }
), b = ({
  size: r,
  filled: i
}) => /* @__PURE__ */ o(
  "svg",
  {
    width: r,
    height: r,
    viewBox: "0 0 24 24",
    fill: i ? "currentColor" : "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": !0,
    children: /* @__PURE__ */ o("polygon", { points: "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" })
  }
);
export {
  T as Rating
};
//# sourceMappingURL=index12.js.map
