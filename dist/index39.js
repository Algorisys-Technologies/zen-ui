import { jsx as e, jsxs as d } from "react/jsx-runtime";
import * as o from "react";
import { Group as q, SelectValue as F, Portal as A, Content as b, SelectViewport as H, Item as S, ItemIndicator as J, ItemText as Q, Label as v, ScrollDownButton as x, ScrollUpButton as y, SelectSeparator as w, SelectTrigger as N, Icon as X, Root as Z } from "./index216.js";
import { cn as i } from "./index199.js";
const I = "\0zen-empty", u = (n) => n === "" ? I : n, ee = (n) => n === I ? "" : n, C = o.createContext(!1), k = ({ invalid: n = !1, ...t }) => /* @__PURE__ */ e(C.Provider, { value: n, children: /* @__PURE__ */ e(Z, { ...t }) }), ne = (n) => {
  const {
    options: t,
    value: r,
    defaultValue: l,
    onChange: s,
    placeholder: z,
    disabled: V,
    required: O,
    name: P,
    className: D,
    label: m,
    errorMessage: c,
    invalid: U,
    defaultOpen: G,
    onOpenChange: K,
    id: W,
    "aria-label": E
  } = n, p = o.useId(), h = W ?? `${p}-trigger`, f = `${p}-error`, g = (a) => a !== void 0 && t.some((_) => _.value === a), M = "value" in n && l === void 0 ? g(r) ? u(r) : "" : void 0, Y = !!c || !!U;
  return /* @__PURE__ */ d("div", { className: D, children: [
    m && /* @__PURE__ */ e("label", { htmlFor: h, className: "zen-text-sm zen-font-medium zen-text-zen-foreground zen-block zen-mb-1", children: m }),
    /* @__PURE__ */ d(
      k,
      {
        value: M,
        defaultValue: l !== void 0 && g(l) ? u(l) : void 0,
        onValueChange: (a) => s?.(a ? ee(a) : null),
        disabled: V,
        required: O,
        name: P,
        defaultOpen: G,
        onOpenChange: K,
        invalid: Y,
        children: [
          /* @__PURE__ */ e($, { id: h, "aria-label": E, "aria-describedby": c ? f : void 0, children: /* @__PURE__ */ e(re, { placeholder: z }) }),
          /* @__PURE__ */ e(j, { children: t.map((a) => /* @__PURE__ */ e(B, { value: u(a.value), disabled: a.disabled, children: a.label }, a.value)) })
        ]
      }
    ),
    c && /* @__PURE__ */ e("p", { id: f, className: "zen-text-xs zen-text-zen-error zen-mt-1", children: c })
  ] });
}, te = (n) => n.options ? /* @__PURE__ */ e(ne, { ...n }) : /* @__PURE__ */ e(k, { ...n });
te.displayName = "Select";
const ue = q, re = F, $ = o.forwardRef(({ className: n, children: t, invalid: r, ...l }, s) => {
  const z = o.useContext(C);
  return /* @__PURE__ */ d(
    N,
    {
      ref: s,
      className: i(
        "zen-flex zen-h-zen-control zen-w-full zen-items-center zen-justify-between zen-gap-2 zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-zen-control-x zen-py-2 zen-text-sm",
        "placeholder:zen-text-zen-muted-fg",
        "focus:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
        "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
        // Marked invalid (aria-invalid="true", from `invalid` or the caller):
        // the error border, as Input and Combobox show theirs.
        "aria-[invalid=true]:zen-border-zen-error",
        "[&>span]:zen-line-clamp-1",
        n
      ),
      ...l,
      "aria-invalid": r || z ? "true" : l["aria-invalid"],
      children: [
        t,
        /* @__PURE__ */ e(X, { asChild: !0, children: /* @__PURE__ */ e(T, {}) })
      ]
    }
  );
});
$.displayName = N.displayName;
const L = o.forwardRef(({ className: n, ...t }, r) => /* @__PURE__ */ e(
  y,
  {
    ref: r,
    className: i("zen-flex zen-cursor-default zen-items-center zen-justify-center zen-py-1", n),
    ...t,
    children: /* @__PURE__ */ e(oe, {})
  }
));
L.displayName = y.displayName;
const R = o.forwardRef(({ className: n, ...t }, r) => /* @__PURE__ */ e(
  x,
  {
    ref: r,
    className: i("zen-flex zen-cursor-default zen-items-center zen-justify-center zen-py-1", n),
    ...t,
    children: /* @__PURE__ */ e(T, {})
  }
));
R.displayName = x.displayName;
const j = o.forwardRef(({ className: n, children: t, position: r = "popper", ...l }, s) => /* @__PURE__ */ e(A, { children: /* @__PURE__ */ d(
  b,
  {
    ref: s,
    position: r,
    className: i(
      "zen-relative zen-z-50 zen-max-h-96 zen-min-w-32 zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-text-zen-foreground zen-shadow-md",
      r === "popper" && "data-[side=bottom]:zen-translate-y-1 data-[side=left]:-zen-translate-x-1 data-[side=right]:zen-translate-x-1 data-[side=top]:-zen-translate-y-1",
      n
    ),
    ...l,
    children: [
      /* @__PURE__ */ e(L, {}),
      /* @__PURE__ */ e(
        H,
        {
          className: i(
            "zen-p-1",
            r === "popper" && "zen-h-[var(--radix-select-trigger-height)] zen-w-full zen-min-w-[var(--radix-select-trigger-width)]"
          ),
          children: t
        }
      ),
      /* @__PURE__ */ e(R, {})
    ]
  }
) }));
j.displayName = b.displayName;
const le = o.forwardRef(({ className: n, ...t }, r) => /* @__PURE__ */ e(
  v,
  {
    ref: r,
    className: i("zen-px-2 zen-py-1.5 zen-text-xs zen-font-semibold zen-text-zen-muted-fg", n),
    ...t
  }
));
le.displayName = v.displayName;
const B = o.forwardRef(({ className: n, children: t, ...r }, l) => /* @__PURE__ */ d(
  S,
  {
    ref: l,
    className: i(
      "zen-relative zen-flex zen-w-full zen-cursor-default zen-select-none zen-items-center zen-rounded-zen-sm zen-py-zen-menu-y zen-pl-8 zen-pr-2 zen-text-sm zen-outline-none",
      "data-[highlighted]:zen-bg-zen-muted",
      "data-[disabled]:zen-pointer-events-none data-[disabled]:zen-opacity-50",
      n
    ),
    ...r,
    children: [
      /* @__PURE__ */ e("span", { className: "zen-absolute zen-start-2 zen-flex zen-h-3.5 zen-w-3.5 zen-items-center zen-justify-center", children: /* @__PURE__ */ e(J, { children: /* @__PURE__ */ e(ie, {}) }) }),
      /* @__PURE__ */ e(Q, { children: t })
    ]
  }
));
B.displayName = S.displayName;
const ae = o.forwardRef(({ className: n, ...t }, r) => /* @__PURE__ */ e(
  w,
  {
    ref: r,
    className: i("-zen-mx-1 zen-my-1 zen-h-px zen-bg-zen-border", n),
    ...t
  }
));
ae.displayName = w.displayName;
const T = () => /* @__PURE__ */ e("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, children: /* @__PURE__ */ e("polyline", { points: "6 9 12 15 18 9" }) }), oe = () => /* @__PURE__ */ e("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, children: /* @__PURE__ */ e("polyline", { points: "18 15 12 9 6 15" }) }), ie = () => /* @__PURE__ */ e("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, children: /* @__PURE__ */ e("polyline", { points: "20 6 9 17 4 12" }) });
export {
  te as Select,
  j as SelectContent,
  ue as SelectGroup,
  B as SelectItem,
  le as SelectLabel,
  R as SelectScrollDownButton,
  L as SelectScrollUpButton,
  ae as SelectSeparator,
  $ as SelectTrigger,
  re as SelectValue
};
//# sourceMappingURL=index39.js.map
