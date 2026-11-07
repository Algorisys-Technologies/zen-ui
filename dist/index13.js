import { jsx as t, jsxs as y } from "react/jsx-runtime";
import * as d from "react";
/* empty css         */
/* empty css         */
import { Button as C } from "./index71.js";
import { Popover as b, PopoverTrigger as P, PopoverContent as B } from "./index35.js";
import { useLocale as L } from "./index90.js";
import { DayPicker as S } from "./index165.js";
import { cn as h } from "./index160.js";
import { DayButton as A } from "./index166.js";
const M = { ArrowLeft: "ArrowRight", ArrowRight: "ArrowLeft" }, g = (o) => (n) => {
  const { onKeyDown: r } = n;
  return /* @__PURE__ */ t(
    o,
    {
      ...n,
      onKeyDown: (e) => {
        const s = M[e.key];
        if (s && getComputedStyle(e.currentTarget).direction === "rtl") {
          r?.({
            ...e,
            key: s,
            preventDefault: () => e.preventDefault(),
            stopPropagation: () => e.stopPropagation()
          });
          return;
        }
        r?.(e);
      }
    }
  );
}, j = g(A), N = ({ className: o, components: a, ...n }) => {
  const r = a?.DayButton, e = d.useMemo(() => r ? g(r) : void 0, [r]);
  return /* @__PURE__ */ t(
    S,
    {
      className: h(
        "zen-calendar zen-p-3 zen-[--rdp-accent-color:var(--zen-color-primary)] zen-[--rdp-accent-background-color:var(--zen-color-primary-soft)]",
        o
      ),
      components: n.dir === void 0 ? { ...a, DayButton: e ?? j } : a,
      ...n
    }
  );
}, J = ({
  value: o,
  defaultValue: a,
  onValueChange: n,
  placeholder: r,
  disabled: e,
  className: s,
  formatDate: v = (l) => l.toLocaleDateString(),
  initialFocus: u = "first"
}) => {
  const l = L(), w = r ?? l.t("datePicker.placeholder"), [D, p] = d.useState(!1), [x, z] = d.useState(a), f = o !== void 0, c = f ? o : x, k = (i) => {
    f || z(i), n?.(i), i && p(!1);
  };
  return /* @__PURE__ */ y(b, { open: D, onOpenChange: p, children: [
    /* @__PURE__ */ t(P, { asChild: !0, children: /* @__PURE__ */ t(
      C,
      {
        variant: "outline",
        color: "neutral",
        disabled: typeof e == "boolean" ? e : void 0,
        className: h(
          "zen-w-60 zen-justify-between zen-font-normal",
          !c && "zen-text-zen-muted-fg",
          s
        ),
        iconLeft: /* @__PURE__ */ t(R, {}),
        children: c ? v(c) : w
      }
    ) }),
    /* @__PURE__ */ t(
      B,
      {
        className: "zen-w-auto zen-p-0",
        align: "start",
        onOpenAutoFocus: u === "selected" ? (i) => {
          const m = O(i.currentTarget);
          m && (i.preventDefault(), m.focus());
        } : void 0,
        children: /* @__PURE__ */ t(
          N,
          {
            mode: "single",
            selected: c,
            defaultMonth: u === "selected" ? c : void 0,
            onSelect: k,
            disabled: typeof e == "boolean" ? void 0 : e
          }
        )
      }
    )
  ] });
}, O = (o) => o.querySelector("[data-selected]:not([data-outside]) button:not(:disabled)") ?? o.querySelector("[data-today]:not([data-outside]) button:not(:disabled)"), R = () => /* @__PURE__ */ y("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, children: [
  /* @__PURE__ */ t("rect", { x: "3", y: "4", width: "18", height: "18", rx: "2" }),
  /* @__PURE__ */ t("line", { x1: "16", y1: "2", x2: "16", y2: "6" }),
  /* @__PURE__ */ t("line", { x1: "8", y1: "2", x2: "8", y2: "6" }),
  /* @__PURE__ */ t("line", { x1: "3", y1: "10", x2: "21", y2: "10" })
] });
export {
  N as Calendar,
  J as DatePicker,
  O as focusableDay
};
//# sourceMappingURL=index13.js.map
