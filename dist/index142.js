import { jsx as a, jsxs as m } from "react/jsx-runtime";
import * as t from "react";
import { Root as c } from "./index171.js";
import { useLocale as i } from "./index90.js";
import { cn as s } from "./index160.js";
const l = t.forwardRef(({ ...e }, r) => {
  const n = i();
  return /* @__PURE__ */ a("nav", { ref: r, "aria-label": n.t("breadcrumb.label"), ...e });
});
l.displayName = "Breadcrumb";
const d = t.forwardRef(({ className: e, ...r }, n) => /* @__PURE__ */ a(
  "ol",
  {
    ref: n,
    className: s(
      // Its own reset: without the opt-in preflight every separator <li>
      // drew a list marker ("Home1. › Accounts2. ›") and the row stood 44px.
      "zen-m-0 zen-list-none zen-p-0",
      "zen-flex zen-flex-wrap zen-items-center zen-gap-1.5 zen-break-words zen-text-sm zen-text-zen-muted-fg sm:zen-gap-2.5",
      e
    ),
    ...r
  }
));
d.displayName = "BreadcrumbList";
const z = t.forwardRef(({ className: e, ...r }, n) => /* @__PURE__ */ a(
  "li",
  {
    ref: n,
    className: s("zen-inline-flex zen-items-center zen-gap-1.5", e),
    ...r
  }
));
z.displayName = "BreadcrumbItem";
const u = t.forwardRef(({ asChild: e, className: r, ...n }, o) => /* @__PURE__ */ a(
  e ? c : "a",
  {
    ref: o,
    className: s(
      "zen-rounded-zen-sm zen-transition-colors hover:zen-text-zen-foreground focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
      r
    ),
    ...n
  }
));
u.displayName = "BreadcrumbLink";
const f = t.forwardRef(({ className: e, ...r }, n) => /* @__PURE__ */ a(
  "span",
  {
    ref: n,
    role: "link",
    "aria-disabled": "true",
    "aria-current": "page",
    className: s("zen-font-medium zen-text-zen-foreground", e),
    ...r
  }
));
f.displayName = "BreadcrumbPage";
const p = ({
  children: e,
  className: r,
  ...n
}) => /* @__PURE__ */ a(
  "li",
  {
    role: "presentation",
    "aria-hidden": "true",
    className: s("[&>svg]:zen-size-3.5 zen-text-zen-muted-fg", r),
    ...n,
    children: e ?? /* @__PURE__ */ a("span", { "aria-hidden": !0, children: "/" })
  }
);
p.displayName = "BreadcrumbSeparator";
const b = ({
  className: e,
  ...r
}) => {
  const n = i();
  return /* @__PURE__ */ m(
    "span",
    {
      role: "presentation",
      "aria-hidden": "true",
      className: s("zen-flex zen-h-9 zen-w-9 zen-items-center zen-justify-center", e),
      ...r,
      children: [
        "…",
        /* @__PURE__ */ a("span", { className: "zen-sr-only", children: n.t("breadcrumb.more") })
      ]
    }
  );
};
b.displayName = "BreadcrumbEllipsis";
export {
  l as Breadcrumb,
  b as BreadcrumbEllipsis,
  z as BreadcrumbItem,
  u as BreadcrumbLink,
  d as BreadcrumbList,
  f as BreadcrumbPage,
  p as BreadcrumbSeparator
};
//# sourceMappingURL=index142.js.map
