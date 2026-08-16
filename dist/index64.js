import { jsx as o, jsxs as h } from "react/jsx-runtime";
import * as n from "react";
import { Button as p } from "./index65.js";
import { Icon as y } from "./index57.js";
import { DropdownMenu as S, DropdownMenuTrigger as B, DropdownMenuContent as w } from "./index67.js";
import { cn as b } from "./index145.js";
const N = n.forwardRef(
  ({ pressed: e, defaultPressed: c = !1, onPressedChange: d, variant: r = "outline", className: s, onClick: t, ...i }, a) => {
    const [m, u] = n.useState(c), l = e ?? m;
    return /* @__PURE__ */ o(
      p,
      {
        ref: a,
        type: "button",
        variant: r,
        "aria-pressed": l,
        className: b(l && "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg zen-border-zen-primary", s),
        onClick: (z) => {
          if (t?.(z), z.defaultPrevented) return;
          const f = !l;
          e === void 0 && u(f), d?.(f);
        },
        ...i
      }
    );
  }
);
N.displayName = "ToggleButton";
const x = n.createContext(null), v = () => {
  const e = n.useContext(x);
  if (!e) throw new Error("SegmentedButtonItem must be used inside a SegmentedButton");
  return e;
}, C = n.forwardRef(
  ({ value: e, defaultValue: c, onValueChange: d, size: r = "sm", className: s, children: t, ...i }, a) => {
    const [m, u] = n.useState(c), l = e ?? m, z = n.useCallback(
      (g) => {
        e === void 0 && u(g), d?.(g);
      },
      [e, d]
    ), f = n.useMemo(() => ({ value: l, select: z, size: r }), [l, z, r]);
    return /* @__PURE__ */ o(x.Provider, { value: f, children: /* @__PURE__ */ o(
      "div",
      {
        ref: a,
        role: "radiogroup",
        className: b(
          "zen-inline-flex zen-items-stretch zen-rounded-zen-md zen-border zen-border-zen-border",
          "[&>button]:zen-rounded-none [&>button]:zen-border-0 [&>button:not(:first-child)]:zen-border-l [&>button:not(:first-child)]:zen-border-zen-border",
          "[&>button:first-child]:zen-rounded-l-zen-md [&>button:last-child]:zen-rounded-r-zen-md",
          s
        ),
        ...i,
        children: t
      }
    ) });
  }
);
C.displayName = "SegmentedButton";
const I = n.forwardRef(
  ({ value: e, className: c, onClick: d, ...r }, s) => {
    const t = v(), i = t.value === e;
    return /* @__PURE__ */ o(
      p,
      {
        ref: s,
        type: "button",
        role: "radio",
        "aria-checked": i,
        variant: "ghost",
        size: t.size,
        className: b(
          i && "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg zen-font-semibold",
          c
        ),
        onClick: (a) => {
          d?.(a), a.defaultPrevented || t.select(e);
        },
        ...r
      }
    );
  }
);
I.displayName = "SegmentedButtonItem";
const M = n.forwardRef(
  ({ menu: e, menuLabel: c = "More actions", menuAlign: d = "end", variant: r = "solid", color: s = "primary", size: t = "md", className: i, children: a, disabled: m, ...u }, l) => (
    // Two real buttons, not one with a nested trigger: a <button> inside a
    // <button> is invalid HTML and breaks keyboard semantics.
    /* @__PURE__ */ h("div", { className: b("zen-inline-flex zen-items-stretch", i), children: [
      /* @__PURE__ */ o(
        p,
        {
          ref: l,
          type: "button",
          variant: r,
          color: s,
          size: t,
          disabled: m,
          className: "zen-rounded-r-none",
          ...u,
          children: a
        }
      ),
      /* @__PURE__ */ h(S, { children: [
        /* @__PURE__ */ o(B, { asChild: !0, children: /* @__PURE__ */ o(
          p,
          {
            type: "button",
            variant: r,
            color: s,
            size: t,
            disabled: m,
            "aria-label": c,
            className: "zen-rounded-l-none zen-border-l zen-border-l-zen-border zen-px-2",
            children: /* @__PURE__ */ o(y, { name: "chevron-down", size: 14 })
          }
        ) }),
        /* @__PURE__ */ o(w, { align: d, children: e })
      ] })
    ] })
  )
);
M.displayName = "SplitButton";
export {
  C as SegmentedButton,
  I as SegmentedButtonItem,
  M as SplitButton,
  N as ToggleButton
};
//# sourceMappingURL=index64.js.map
