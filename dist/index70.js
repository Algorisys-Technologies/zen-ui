import { jsx as o, jsxs as g, Fragment as h } from "react/jsx-runtime";
import * as d from "react";
import { Button as b } from "./index71.js";
import { Icon as N } from "./index63.js";
import { DropdownMenu as S, DropdownMenuTrigger as w, DropdownMenuContent as B } from "./index73.js";
import { useLocale as v } from "./index90.js";
import { cn as f } from "./index160.js";
const C = d.forwardRef(
  ({ pressed: e, defaultPressed: u = !1, onPressedChange: a, variant: n = "outline", className: t, onClick: m, ...c }, i) => {
    const [s, l] = d.useState(u), r = e ?? s;
    return /* @__PURE__ */ o(
      b,
      {
        ref: i,
        type: "button",
        variant: n,
        "aria-pressed": r,
        className: f(r && "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg zen-border-zen-primary", t),
        onClick: (z) => {
          if (m?.(z), z.defaultPrevented) return;
          const p = !r;
          e === void 0 && l(p), a?.(p);
        },
        ...c
      }
    );
  }
);
C.displayName = "ToggleButton";
const y = d.createContext(null), I = () => {
  const e = d.useContext(y);
  if (!e) throw new Error("SegmentedButtonItem must be used inside a SegmentedButton");
  return e;
}, R = d.forwardRef(
  ({ value: e, defaultValue: u, onValueChange: a, size: n = "sm", className: t, children: m, ...c }, i) => {
    const [s, l] = d.useState(u), r = e ?? s, z = d.useCallback(
      (x) => {
        e === void 0 && l(x), a?.(x);
      },
      [e, a]
    ), p = d.useMemo(() => ({ value: r, select: z, size: n }), [r, z, n]);
    return /* @__PURE__ */ o(y.Provider, { value: p, children: /* @__PURE__ */ o(
      "div",
      {
        ref: i,
        role: "radiogroup",
        className: f(
          "zen-inline-flex zen-items-stretch zen-rounded-zen-md zen-border zen-border-zen-border",
          "[&>button]:zen-rounded-none [&>button]:zen-border-0 [&>button:not(:first-child)]:zen-border-l [&>button:not(:first-child)]:zen-border-zen-border",
          "[&>button:first-child]:zen-rounded-l-zen-md [&>button:last-child]:zen-rounded-r-zen-md",
          t
        ),
        ...c,
        children: m
      }
    ) });
  }
);
R.displayName = "SegmentedButton";
const k = d.forwardRef(
  ({ value: e, className: u, onClick: a, count: n, children: t, ...m }, c) => {
    const i = I(), s = i.value === e, l = n !== void 0;
    return /* @__PURE__ */ o(
      b,
      {
        ref: c,
        type: "button",
        role: "radio",
        "aria-checked": s,
        "aria-label": l && typeof t == "string" && (typeof n == "number" || typeof n == "string") ? `${t}, ${n}` : void 0,
        variant: "ghost",
        size: i.size,
        className: f(
          s && "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg zen-font-semibold",
          u
        ),
        onClick: (r) => {
          a?.(r), r.defaultPrevented || i.select(e);
        },
        ...m,
        children: l ? /* @__PURE__ */ g(h, { children: [
          t,
          /* @__PURE__ */ o("span", { className: "zen-sr-only", children: ", " }),
          /* @__PURE__ */ o(
            "span",
            {
              "data-count": "",
              className: f(
                "zen-ml-1.5 zen-min-w-5 zen-rounded-zen-sm zen-px-1.5 zen-text-center zen-text-xs zen-font-medium zen-tabular-nums",
                s ? "zen-bg-zen-primary zen-text-zen-primary-fg" : "zen-bg-zen-muted zen-text-zen-muted-fg"
              ),
              children: n
            }
          )
        ] }) : t
      }
    );
  }
);
k.displayName = "SegmentedButtonItem";
const M = d.forwardRef(
  ({ menu: e, menuLabel: u, menuAlign: a = "end", variant: n = "solid", color: t = "primary", size: m = "md", className: c, children: i, disabled: s, ...l }, r) => {
    const z = v();
    return (
      // Two real buttons, not one with a nested trigger: a <button> inside a
      // <button> is invalid HTML and breaks keyboard semantics.
      /* @__PURE__ */ g("div", { className: f("zen-inline-flex zen-items-stretch", c), children: [
        /* @__PURE__ */ o(
          b,
          {
            ref: r,
            type: "button",
            variant: n,
            color: t,
            size: m,
            disabled: s,
            className: "zen-rounded-r-none",
            ...l,
            children: i
          }
        ),
        /* @__PURE__ */ g(S, { children: [
          /* @__PURE__ */ o(w, { asChild: !0, children: /* @__PURE__ */ o(
            b,
            {
              type: "button",
              variant: n,
              color: t,
              size: m,
              disabled: s,
              "aria-label": u ?? z.t("buttonFamily.moreActions"),
              className: "zen-rounded-l-none zen-border-l zen-border-l-zen-border zen-px-2",
              children: /* @__PURE__ */ o(N, { name: "chevron-down", size: 14 })
            }
          ) }),
          /* @__PURE__ */ o(B, { align: a, children: e })
        ] })
      ] })
    );
  }
);
M.displayName = "SplitButton";
export {
  R as SegmentedButton,
  k as SegmentedButtonItem,
  M as SplitButton,
  C as ToggleButton
};
//# sourceMappingURL=index70.js.map
