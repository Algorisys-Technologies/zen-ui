import { jsxs as o, jsx as n, Fragment as h } from "react/jsx-runtime";
import { cn as i } from "./index160.js";
import "./index28.js";
import "./index110.js";
import { Input as x } from "./index4.js";
import { Checkbox as f } from "./index36.js";
import { Icon as d } from "./index63.js";
import { useLocale as p } from "./index90.js";
const R = ({
  value: e,
  onValueChange: l,
  placeholder: s,
  className: a
}) => {
  const c = p(), r = s ?? c.t("selectList.placeholder");
  return /* @__PURE__ */ o("div", { className: i("zen-relative", a), children: [
    /* @__PURE__ */ n(
      d,
      {
        name: "search",
        size: 14,
        className: "zen-pointer-events-none zen-absolute zen-start-3 zen-top-1/2 -zen-translate-y-1/2 zen-text-zen-muted-fg"
      }
    ),
    /* @__PURE__ */ n(
      x,
      {
        value: e,
        onChange: (z) => l(z.target.value),
        placeholder: r,
        "aria-label": r,
        className: "zen-ps-9"
      }
    )
  ] });
}, j = ({
  items: e,
  multiple: l = !1,
  selected: s,
  onToggle: a,
  onPick: c,
  emptyText: r
}) => {
  const z = p();
  return e.length === 0 ? /* @__PURE__ */ n("p", { className: "zen-m-0 zen-px-4 zen-py-8 zen-text-center zen-text-sm zen-text-zen-muted-fg", children: r ?? z.t("selectList.empty") }) : /* @__PURE__ */ n("ul", { className: "zen-m-0 zen-flex zen-list-none zen-flex-col zen-p-0", children: e.map((t) => /* @__PURE__ */ n("li", { children: l ? /* @__PURE__ */ n(
    g,
    {
      item: t,
      checked: s.includes(t.id),
      onToggle: () => a(t.id)
    }
  ) : /* @__PURE__ */ n(
    b,
    {
      item: t,
      current: s.includes(t.id),
      onPick: () => c(t.id)
    }
  ) }, t.id)) });
}, u = "zen-flex zen-w-full zen-items-center zen-gap-3 zen-rounded-zen-sm zen-px-4 zen-py-2.5 zen-text-start", m = ({ item: e }) => /* @__PURE__ */ o(h, { children: [
  e.icon ? /* @__PURE__ */ n(d, { name: e.icon, size: 16, className: "zen-shrink-0 zen-text-zen-muted-fg" }) : null,
  /* @__PURE__ */ o("span", { className: "zen-flex zen-min-w-0 zen-flex-1 zen-flex-col", children: [
    /* @__PURE__ */ n("span", { className: "zen-truncate zen-text-sm", children: e.label }),
    e.description ? /* @__PURE__ */ n("span", { className: "zen-truncate zen-text-xs zen-text-zen-muted-fg", children: e.description }) : null
  ] }),
  e.info ? /* @__PURE__ */ n("span", { className: "zen-shrink-0 zen-text-xs zen-text-zen-muted-fg", children: e.info }) : null
] }), b = ({
  item: e,
  current: l,
  onPick: s
}) => /* @__PURE__ */ o(
  "button",
  {
    type: "button",
    disabled: e.disabled,
    "aria-current": l || void 0,
    onClick: s,
    className: i(
      u,
      "zen-border-0 zen-bg-transparent zen-cursor-pointer",
      "hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
      "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
      l && "zen-bg-zen-muted"
    ),
    children: [
      /* @__PURE__ */ n(m, { item: e }),
      l ? /* @__PURE__ */ n(d, { name: "check", size: 16, className: "zen-shrink-0 zen-text-zen-primary" }) : null
    ]
  }
), g = ({
  item: e,
  checked: l,
  onToggle: s
}) => /* @__PURE__ */ o(
  "label",
  {
    className: i(
      u,
      "zen-cursor-pointer hover:zen-bg-zen-muted",
      e.disabled && "zen-cursor-not-allowed zen-opacity-50"
    ),
    children: [
      /* @__PURE__ */ n(f, { checked: l, disabled: e.disabled, onCheckedChange: s }),
      /* @__PURE__ */ n(m, { item: e })
    ]
  }
);
export {
  j as SelectListBody,
  R as SelectSearchField
};
//# sourceMappingURL=index183.js.map
