import { jsxs as l, jsx as r } from "react/jsx-runtime";
import * as t from "react";
import { normalizeHex as a, colorLabel as S } from "./index170.js";
import { Button as A } from "./index71.js";
import { Input as D } from "./index4.js";
import { Popover as E, PopoverTrigger as I, PopoverContent as R } from "./index35.js";
import { ColorPalette as T } from "./index26.js";
import { useLocale as B } from "./index90.js";
import { cn as u } from "./index160.js";
const F = [
  { value: "#ef4444", key: "colorPicker.red" },
  { value: "#f97316", key: "colorPicker.orange" },
  { value: "#facc15", key: "colorPicker.yellow" },
  { value: "#22c55e", key: "colorPicker.green" },
  { value: "#3b82f6", key: "colorPicker.blue" },
  { value: "#6366f1", key: "colorPicker.indigo" },
  { value: "#a855f7", key: "colorPicker.purple" },
  { value: "#ec4899", key: "colorPicker.pink" },
  { value: "#78716c", key: "colorPicker.stone" },
  { value: "#000000", key: "colorPicker.black" }
], M = ({
  value: z,
  defaultValue: h,
  onValueChange: g,
  colors: y,
  allowCustom: b = !0,
  label: C,
  placeholder: P,
  disabled: p,
  className: x
}) => {
  const n = B(), c = y ?? F.map((e) => ({ value: e.value, label: n.t(e.key) })), m = C ?? n.t("colorPicker.chooseAColour"), N = P ?? n.t("colorPicker.pickAColour"), [w, j] = t.useState(() => a(h ?? "") ?? ""), f = z !== void 0, o = f ? a(z) ?? "" : w, [d, L] = t.useState(!1), [O, k] = t.useState("");
  t.useEffect(() => k(o), [o, d]);
  const s = (e) => {
    const i = a(e);
    i && (f || j(i), g?.(i));
  }, v = c.map((e) => typeof e == "string" ? { value: e } : e).find(
    (e) => a(e.value) === o
  );
  return /* @__PURE__ */ l(E, { open: d, onOpenChange: L, children: [
    /* @__PURE__ */ r(I, { asChild: !0, children: /* @__PURE__ */ l(
      A,
      {
        variant: "outline",
        color: "neutral",
        disabled: p,
        "aria-label": m,
        className: u("zen-justify-start zen-gap-2 zen-font-normal", x),
        children: [
          /* @__PURE__ */ r(
            "span",
            {
              "aria-hidden": !0,
              className: "zen-h-4 zen-w-4 zen-shrink-0 zen-rounded-zen-sm zen-border zen-border-zen-border",
              style: { backgroundColor: o || "transparent" }
            }
          ),
          /* @__PURE__ */ r("span", { className: u(!o && "zen-text-zen-muted-fg"), children: o ? v ? S(v) : o : N })
        ]
      }
    ) }),
    /* @__PURE__ */ l(R, { align: "start", className: "zen-w-auto zen-flex zen-flex-col zen-gap-3", children: [
      c.length ? /* @__PURE__ */ r(T, { colors: c, value: o, onValueChange: s, label: m }) : null,
      b ? /* @__PURE__ */ l("div", { className: "zen-flex zen-items-center zen-gap-2", children: [
        /* @__PURE__ */ l(
          "label",
          {
            className: u(
              "zen-relative zen-inline-flex zen-h-8 zen-w-8 zen-shrink-0 zen-cursor-pointer",
              "zen-items-center zen-justify-center zen-overflow-hidden zen-rounded-zen-sm",
              "zen-border zen-border-zen-border"
            ),
            style: { backgroundColor: o || "transparent" },
            title: n.t("colorPicker.customColour"),
            children: [
              /* @__PURE__ */ r("span", { className: "zen-sr-only", children: n.t("colorPicker.customColour") }),
              /* @__PURE__ */ r(
                "input",
                {
                  type: "color",
                  value: o || "#000000",
                  onChange: (e) => s(e.target.value),
                  disabled: p,
                  className: "zen-absolute zen-inset-0 zen-cursor-pointer zen-opacity-0"
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ r(
          D,
          {
            value: O,
            onChange: (e) => {
              k(e.target.value), s(e.target.value);
            },
            placeholder: "#3b82f6",
            "aria-label": n.t("colorPicker.hexColour"),
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
  M as ColorPicker
};
//# sourceMappingURL=index25.js.map
