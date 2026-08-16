import { jsx as n, jsxs as o } from "react/jsx-runtime";
import * as i from "react";
import { Root as m } from "./index152.js";
import { cn as s } from "./index145.js";
const d = i.forwardRef(({ ...e }, r) => /* @__PURE__ */ n("nav", { ref: r, "aria-label": "breadcrumb", ...e }));
d.displayName = "Breadcrumb";
const c = i.forwardRef(({ className: e, ...r }, a) => /* @__PURE__ */ n(
  "ol",
  {
    ref: a,
    className: s(
      "zen-flex zen-flex-wrap zen-items-center zen-gap-1.5 zen-break-words zen-text-sm zen-text-zen-muted-fg sm:zen-gap-2.5",
      e
    ),
    ...r
  }
));
c.displayName = "BreadcrumbList";
const l = i.forwardRef(({ className: e, ...r }, a) => /* @__PURE__ */ n(
  "li",
  {
    ref: a,
    className: s("zen-inline-flex zen-items-center zen-gap-1.5", e),
    ...r
  }
));
l.displayName = "BreadcrumbItem";
const z = i.forwardRef(({ asChild: e, className: r, ...a }, t) => /* @__PURE__ */ n(
  e ? m : "a",
  {
    ref: t,
    className: s(
      "zen-rounded-zen-sm zen-transition-colors hover:zen-text-zen-foreground focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
      r
    ),
    ...a
  }
));
z.displayName = "BreadcrumbLink";
const u = i.forwardRef(({ className: e, ...r }, a) => /* @__PURE__ */ n(
  "span",
  {
    ref: a,
    role: "link",
    "aria-disabled": "true",
    "aria-current": "page",
    className: s("zen-font-medium zen-text-zen-foreground", e),
    ...r
  }
));
u.displayName = "BreadcrumbPage";
const f = ({
  children: e,
  className: r,
  ...a
}) => /* @__PURE__ */ n(
  "li",
  {
    role: "presentation",
    "aria-hidden": "true",
    className: s("[&>svg]:zen-size-3.5 zen-text-zen-muted-fg", r),
    ...a,
    children: e ?? /* @__PURE__ */ n("span", { "aria-hidden": !0, children: "/" })
  }
);
f.displayName = "BreadcrumbSeparator";
const p = ({
  className: e,
  ...r
}) => /* @__PURE__ */ o(
  "span",
  {
    role: "presentation",
    "aria-hidden": "true",
    className: s("zen-flex zen-h-9 zen-w-9 zen-items-center zen-justify-center", e),
    ...r,
    children: [
      "…",
      /* @__PURE__ */ n("span", { className: "zen-sr-only", children: "More" })
    ]
  }
);
p.displayName = "BreadcrumbEllipsis";
export {
  d as Breadcrumb,
  p as BreadcrumbEllipsis,
  l as BreadcrumbItem,
  z as BreadcrumbLink,
  c as BreadcrumbList,
  u as BreadcrumbPage,
  f as BreadcrumbSeparator
};
//# sourceMappingURL=index129.js.map
