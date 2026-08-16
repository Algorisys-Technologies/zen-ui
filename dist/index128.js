import { jsx as t, jsxs as m } from "react/jsx-runtime";
import * as d from "react";
import { Command as a } from "./index189.js";
import { cn as r } from "./index145.js";
const s = d.forwardRef(({ className: e, ...n }, o) => /* @__PURE__ */ t(
  a,
  {
    ref: o,
    className: r(
      "zen-flex zen-h-full zen-w-full zen-flex-col zen-overflow-hidden zen-rounded-zen-md zen-bg-zen-background zen-text-zen-foreground",
      e
    ),
    ...n
  }
));
s.displayName = "Command";
const z = d.forwardRef(({ className: e, ...n }, o) => /* @__PURE__ */ m(
  "div",
  {
    className: "zen-flex zen-items-center zen-border-b zen-border-zen-border zen-px-3",
    "cmdk-input-wrapper": "",
    children: [
      /* @__PURE__ */ t(x, {}),
      /* @__PURE__ */ t(
        a.Input,
        {
          ref: o,
          className: r(
            "zen-flex zen-h-10 zen-w-full zen-bg-transparent zen-py-3 zen-text-sm zen-outline-none",
            "placeholder:zen-text-zen-muted-fg",
            "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
            e
          ),
          ...n
        }
      )
    ]
  }
));
z.displayName = a.Input.displayName;
const i = d.forwardRef(({ className: e, ...n }, o) => /* @__PURE__ */ t(
  a.List,
  {
    ref: o,
    className: r("zen-max-h-72 zen-overflow-y-auto zen-overflow-x-hidden", e),
    ...n
  }
));
i.displayName = a.List.displayName;
const l = d.forwardRef((e, n) => /* @__PURE__ */ t(
  a.Empty,
  {
    ref: n,
    className: "zen-py-6 zen-text-center zen-text-sm zen-text-zen-muted-fg",
    ...e
  }
));
l.displayName = a.Empty.displayName;
const p = d.forwardRef(({ className: e, ...n }, o) => /* @__PURE__ */ t(
  a.Loading,
  {
    ref: o,
    className: r("zen-py-4 zen-text-center zen-text-sm zen-text-zen-muted-fg", e),
    ...n
  }
));
p.displayName = a.Loading.displayName;
const c = d.forwardRef(({ className: e, ...n }, o) => /* @__PURE__ */ t(
  a.Group,
  {
    ref: o,
    className: r(
      "zen-overflow-hidden zen-p-1 zen-text-zen-foreground",
      "[&_[cmdk-group-heading]]:zen-px-2 [&_[cmdk-group-heading]]:zen-py-1.5 [&_[cmdk-group-heading]]:zen-text-xs [&_[cmdk-group-heading]]:zen-font-semibold [&_[cmdk-group-heading]]:zen-text-zen-muted-fg",
      e
    ),
    ...n
  }
));
c.displayName = a.Group.displayName;
const f = d.forwardRef(({ className: e, ...n }, o) => /* @__PURE__ */ t(
  a.Separator,
  {
    ref: o,
    className: r("-zen-mx-1 zen-my-1 zen-h-px zen-bg-zen-border", e),
    ...n
  }
));
f.displayName = a.Separator.displayName;
const u = d.forwardRef(({ className: e, ...n }, o) => /* @__PURE__ */ t(
  a.Item,
  {
    ref: o,
    className: r(
      "zen-relative zen-flex zen-cursor-default zen-select-none zen-items-center zen-gap-2 zen-rounded-zen-sm zen-px-2 zen-py-1.5 zen-text-sm zen-outline-none",
      "data-[selected=true]:zen-bg-zen-muted",
      "data-[disabled=true]:zen-pointer-events-none data-[disabled=true]:zen-opacity-50",
      e
    ),
    ...n
  }
));
u.displayName = a.Item.displayName;
const x = () => /* @__PURE__ */ m("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "zen-mr-2 zen-shrink-0 zen-opacity-50", "aria-hidden": !0, children: [
  /* @__PURE__ */ t("circle", { cx: "11", cy: "11", r: "8" }),
  /* @__PURE__ */ t("line", { x1: "21", y1: "21", x2: "16.65", y2: "16.65" })
] });
export {
  s as Command,
  l as CommandEmpty,
  c as CommandGroup,
  z as CommandInput,
  u as CommandItem,
  i as CommandList,
  p as CommandLoading,
  f as CommandSeparator
};
//# sourceMappingURL=index128.js.map
