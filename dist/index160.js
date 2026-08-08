import { jsxs as a, jsx as n, Fragment as m } from "react/jsx-runtime";
import { cn as o } from "./index143.js";
import "./index24.js";
import "./index98.js";
import { Input as p } from "./index4.js";
import { Checkbox as h } from "./index32.js";
import { Icon as c } from "./index56.js";
const S = ({
  value: e,
  onValueChange: s,
  placeholder: l = "Search",
  className: z
}) => /* @__PURE__ */ a("div", { className: o("zen-relative", z), children: [
  /* @__PURE__ */ n(
    c,
    {
      name: "search",
      size: 14,
      className: "zen-pointer-events-none zen-absolute zen-start-3 zen-top-1/2 -zen-translate-y-1/2 zen-text-zen-muted-fg"
    }
  ),
  /* @__PURE__ */ n(
    p,
    {
      value: e,
      onChange: (r) => s(r.target.value),
      placeholder: l,
      "aria-label": l,
      className: "zen-ps-9"
    }
  )
] }), C = ({
  items: e,
  multiple: s = !1,
  selected: l,
  onToggle: z,
  onPick: r,
  emptyText: u = "No matching items"
}) => e.length === 0 ? /* @__PURE__ */ n("p", { className: "zen-m-0 zen-px-4 zen-py-8 zen-text-center zen-text-sm zen-text-zen-muted-fg", children: u }) : /* @__PURE__ */ n("ul", { className: "zen-m-0 zen-flex zen-list-none zen-flex-col zen-p-0", children: e.map((t) => /* @__PURE__ */ n("li", { children: s ? /* @__PURE__ */ n(
  f,
  {
    item: t,
    checked: l.includes(t.id),
    onToggle: () => z(t.id)
  }
) : /* @__PURE__ */ n(
  x,
  {
    item: t,
    current: l.includes(t.id),
    onPick: () => r(t.id)
  }
) }, t.id)) }), i = "zen-flex zen-w-full zen-items-center zen-gap-3 zen-rounded-zen-sm zen-px-4 zen-py-2.5 zen-text-start", d = ({ item: e }) => /* @__PURE__ */ a(m, { children: [
  e.icon ? /* @__PURE__ */ n(c, { name: e.icon, size: 16, className: "zen-shrink-0 zen-text-zen-muted-fg" }) : null,
  /* @__PURE__ */ a("span", { className: "zen-flex zen-min-w-0 zen-flex-1 zen-flex-col", children: [
    /* @__PURE__ */ n("span", { className: "zen-truncate zen-text-sm", children: e.label }),
    e.description ? /* @__PURE__ */ n("span", { className: "zen-truncate zen-text-xs zen-text-zen-muted-fg", children: e.description }) : null
  ] }),
  e.info ? /* @__PURE__ */ n("span", { className: "zen-shrink-0 zen-text-xs zen-text-zen-muted-fg", children: e.info }) : null
] }), x = ({
  item: e,
  current: s,
  onPick: l
}) => /* @__PURE__ */ a(
  "button",
  {
    type: "button",
    disabled: e.disabled,
    "aria-current": s || void 0,
    onClick: l,
    className: o(
      i,
      "zen-border-0 zen-bg-transparent zen-cursor-pointer",
      "hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
      "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
      s && "zen-bg-zen-muted"
    ),
    children: [
      /* @__PURE__ */ n(d, { item: e }),
      s ? /* @__PURE__ */ n(c, { name: "check", size: 16, className: "zen-shrink-0 zen-text-zen-primary" }) : null
    ]
  }
), f = ({
  item: e,
  checked: s,
  onToggle: l
}) => /* @__PURE__ */ a(
  "label",
  {
    className: o(
      i,
      "zen-cursor-pointer hover:zen-bg-zen-muted",
      e.disabled && "zen-cursor-not-allowed zen-opacity-50"
    ),
    children: [
      /* @__PURE__ */ n(h, { checked: s, disabled: e.disabled, onCheckedChange: l }),
      /* @__PURE__ */ n(d, { item: e })
    ]
  }
);
export {
  C as SelectListBody,
  S as SelectSearchField
};
//# sourceMappingURL=index160.js.map
