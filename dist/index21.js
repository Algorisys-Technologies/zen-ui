import { jsxs as a, jsx as l } from "react/jsx-runtime";
import * as r from "react";
import { normalizeHex as o, colorLabel as w } from "./index149.js";
import { Button as O } from "./index64.js";
import { Input as S } from "./index4.js";
import { Popover as j, PopoverTrigger as B, PopoverContent as I } from "./index31.js";
import { ColorPalette as L } from "./index22.js";
import { cn as c } from "./index143.js";
const R = [
  { value: "#ef4444", label: "Red" },
  { value: "#f97316", label: "Orange" },
  { value: "#facc15", label: "Yellow" },
  { value: "#22c55e", label: "Green" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#6366f1", label: "Indigo" },
  { value: "#a855f7", label: "Purple" },
  { value: "#ec4899", label: "Pink" },
  { value: "#78716c", label: "Stone" },
  { value: "#000000", label: "Black" }
], U = ({
  value: i,
  defaultValue: h,
  onValueChange: b,
  colors: t = R,
  allowCustom: g = !0,
  label: z = "Choose a colour",
  placeholder: C = "Pick a colour",
  disabled: m,
  className: x
}) => {
  const [k, N] = r.useState(() => o(h ?? "") ?? ""), f = i !== void 0, n = f ? o(i) ?? "" : k, [p, y] = r.useState(!1), [P, d] = r.useState("");
  r.useEffect(() => d(n), [n, p]);
  const s = (e) => {
    const u = o(e);
    u && (f || N(u), b?.(u));
  }, v = t.map((e) => typeof e == "string" ? { value: e } : e).find(
    (e) => o(e.value) === n
  );
  return /* @__PURE__ */ a(j, { open: p, onOpenChange: y, children: [
    /* @__PURE__ */ l(B, { asChild: !0, children: /* @__PURE__ */ a(
      O,
      {
        variant: "outline",
        color: "neutral",
        disabled: m,
        "aria-label": z,
        className: c("zen-justify-start zen-gap-2 zen-font-normal", x),
        children: [
          /* @__PURE__ */ l(
            "span",
            {
              "aria-hidden": !0,
              className: "zen-h-4 zen-w-4 zen-shrink-0 zen-rounded-zen-sm zen-border zen-border-zen-border",
              style: { backgroundColor: n || "transparent" }
            }
          ),
          /* @__PURE__ */ l("span", { className: c(!n && "zen-text-zen-muted-fg"), children: n ? v ? w(v) : n : C })
        ]
      }
    ) }),
    /* @__PURE__ */ a(I, { align: "start", className: "zen-w-auto zen-flex zen-flex-col zen-gap-3", children: [
      t.length ? /* @__PURE__ */ l(L, { colors: t, value: n, onValueChange: s, label: z }) : null,
      g ? /* @__PURE__ */ a("div", { className: "zen-flex zen-items-center zen-gap-2", children: [
        /* @__PURE__ */ a(
          "label",
          {
            className: c(
              "zen-relative zen-inline-flex zen-h-8 zen-w-8 zen-shrink-0 zen-cursor-pointer",
              "zen-items-center zen-justify-center zen-overflow-hidden zen-rounded-zen-sm",
              "zen-border zen-border-zen-border"
            ),
            style: { backgroundColor: n || "transparent" },
            title: "Custom colour",
            children: [
              /* @__PURE__ */ l("span", { className: "zen-sr-only", children: "Custom colour" }),
              /* @__PURE__ */ l(
                "input",
                {
                  type: "color",
                  value: n || "#000000",
                  onChange: (e) => s(e.target.value),
                  disabled: m,
                  className: "zen-absolute zen-inset-0 zen-cursor-pointer zen-opacity-0"
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ l(
          S,
          {
            value: P,
            onChange: (e) => {
              d(e.target.value), s(e.target.value);
            },
            placeholder: "#3b82f6",
            "aria-label": "Hex colour",
            spellCheck: !1,
            autoComplete: "off",
            className: "zen-h-8 zen-w-28 zen-font-mono zen-text-xs"
          }
        )
      ] }) : null
    ] })
  ] });
};
export {
  U as ColorPicker
};
//# sourceMappingURL=index21.js.map
