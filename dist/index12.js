import { jsx as e, jsxs as d } from "react/jsx-runtime";
import * as s from "react";
/* empty css         */
/* empty css         */
import { Button as g } from "./index65.js";
import { Popover as v, PopoverTrigger as k, PopoverContent as C } from "./index32.js";
import { DayPicker as w } from "./index149.js";
import { cn as p } from "./index145.js";
const P = ({ className: o, ...r }) => /* @__PURE__ */ e(
  w,
  {
    className: p(
      "zen-calendar zen-p-3 zen-[--rdp-accent-color:var(--zen-color-primary)] zen-[--rdp-accent-background-color:var(--zen-color-primary-soft)]",
      o
    ),
    ...r
  }
), O = ({
  value: o,
  defaultValue: r,
  onValueChange: m,
  placeholder: f = "Pick a date",
  disabled: n,
  className: h,
  formatDate: u = (i) => i.toLocaleDateString()
}) => {
  const [i, c] = s.useState(!1), [x, y] = s.useState(r), l = o !== void 0, t = l ? o : x, z = (a) => {
    l || y(a), m?.(a), a && c(!1);
  };
  return /* @__PURE__ */ d(v, { open: i, onOpenChange: c, children: [
    /* @__PURE__ */ e(k, { asChild: !0, children: /* @__PURE__ */ e(
      g,
      {
        variant: "outline",
        color: "neutral",
        disabled: typeof n == "boolean" ? n : void 0,
        className: p(
          "zen-w-60 zen-justify-between zen-font-normal",
          !t && "zen-text-zen-muted-fg",
          h
        ),
        iconLeft: /* @__PURE__ */ e(j, {}),
        children: t ? u(t) : f
      }
    ) }),
    /* @__PURE__ */ e(C, { className: "zen-w-auto zen-p-0", align: "start", children: /* @__PURE__ */ e(
      P,
      {
        mode: "single",
        selected: t,
        onSelect: z,
        disabled: typeof n == "boolean" ? void 0 : n
      }
    ) })
  ] });
}, j = () => /* @__PURE__ */ d("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, children: [
  /* @__PURE__ */ e("rect", { x: "3", y: "4", width: "18", height: "18", rx: "2" }),
  /* @__PURE__ */ e("line", { x1: "16", y1: "2", x2: "16", y2: "6" }),
  /* @__PURE__ */ e("line", { x1: "8", y1: "2", x2: "8", y2: "6" }),
  /* @__PURE__ */ e("line", { x1: "3", y1: "10", x2: "21", y2: "10" })
] });
export {
  P as Calendar,
  O as DatePicker
};
//# sourceMappingURL=index12.js.map
