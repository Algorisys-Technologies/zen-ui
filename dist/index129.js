import { jsx as o, jsxs as u, Fragment as N } from "react/jsx-runtime";
import * as t from "react";
import { Root as v } from "./index150.js";
import { Popover as C, PopoverTrigger as k, PopoverContent as R } from "./index31.js";
import { cn as s } from "./index143.js";
const w = t.createContext(null);
function m() {
  const e = t.useContext(w);
  if (!e) throw new Error("useSidebar must be used within a <SidebarProvider>");
  return e;
}
function q({
  children: e,
  defaultCollapsed: r = !1,
  collapsed: n,
  onCollapsedChange: i
}) {
  const [a, l] = t.useState(r), z = n !== void 0, c = z ? n : a, d = t.useCallback(
    (p) => {
      z || l(p), i?.(p);
    },
    [z, i]
  ), b = t.useMemo(
    () => ({ collapsed: c, setCollapsed: d, toggle: () => d(!c) }),
    [c, d]
  );
  return /* @__PURE__ */ o(w.Provider, { value: b, children: e });
}
const M = t.forwardRef(({ className: e, ...r }, n) => {
  const { collapsed: i } = m();
  return /* @__PURE__ */ o(
    "aside",
    {
      ref: n,
      "data-collapsed": i || void 0,
      className: s(
        "zen-flex zen-h-full zen-flex-col zen-border-r zen-border-zen-border zen-bg-zen-background zen-text-zen-foreground zen-transition-[width] zen-duration-200 zen-ease-in-out",
        i ? "zen-w-16" : "zen-w-64",
        e
      ),
      ...r
    }
  );
});
M.displayName = "Sidebar";
const B = t.forwardRef(({ className: e, ...r }, n) => /* @__PURE__ */ o(
  "div",
  {
    ref: n,
    className: s("zen-flex zen-items-center zen-gap-2 zen-p-3", e),
    ...r
  }
));
B.displayName = "SidebarHeader";
const I = t.forwardRef(({ className: e, ...r }, n) => /* @__PURE__ */ o(
  "div",
  {
    ref: n,
    className: s("zen-flex zen-min-h-0 zen-flex-1 zen-flex-col zen-gap-1 zen-overflow-y-auto zen-p-2", e),
    ...r
  }
));
I.displayName = "SidebarContent";
const L = t.forwardRef(({ className: e, ...r }, n) => /* @__PURE__ */ o(
  "div",
  {
    ref: n,
    className: s("zen-mt-auto zen-flex zen-items-center zen-gap-2 zen-border-t zen-border-zen-border zen-p-3", e),
    ...r
  }
));
L.displayName = "SidebarFooter";
const j = t.forwardRef(({ className: e, ...r }, n) => /* @__PURE__ */ o("div", { ref: n, className: s("zen-flex zen-flex-col zen-gap-1 zen-py-2", e), ...r }));
j.displayName = "SidebarGroup";
const T = t.forwardRef(({ className: e, ...r }, n) => {
  const { collapsed: i } = m();
  return /* @__PURE__ */ o(
    "div",
    {
      ref: n,
      className: s(
        "zen-px-3 zen-py-1 zen-text-xs zen-font-medium zen-uppercase zen-tracking-wide zen-text-zen-muted-fg",
        i && "zen-sr-only",
        e
      ),
      ...r
    }
  );
});
T.displayName = "SidebarGroupLabel";
const G = t.forwardRef(({ className: e, ...r }, n) => (
  // The list reset is the component's own job: zen-ui ships no element reset
  // (it is opt-in via /preflight), so without this the browser default
  // `list-style: disc` + `padding-inline-start: 40px` apply. That 40px ate the
  // collapsed rail — 64px wide, less 16px of padding, less 40px, left 8px of
  // room for a 16px icon.
  /* @__PURE__ */ o(
    "ul",
    {
      ref: n,
      className: s("zen-m-0 zen-flex zen-w-full zen-list-none zen-flex-col zen-gap-0.5 zen-p-0", e),
      ...r
    }
  )
));
G.displayName = "SidebarMenu";
const P = t.forwardRef(({ className: e, ...r }, n) => /* @__PURE__ */ o("li", { ref: n, className: s("zen-w-full", e), ...r }));
P.displayName = "SidebarMenuItem";
const S = t.forwardRef(({ className: e, asChild: r = !1, active: n = !1, ...i }, a) => {
  const { collapsed: l } = m();
  return /* @__PURE__ */ o(
    r ? v : "button",
    {
      ref: a,
      "data-active": n || void 0,
      className: s(
        "zen-flex zen-w-full zen-items-center zen-gap-2 zen-rounded-zen-md zen-px-3 zen-py-2 zen-text-sm zen-font-medium zen-transition-colors",
        "hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
        "[&>svg]:zen-size-4 [&>svg]:zen-shrink-0",
        n && "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg",
        // sr-only, not hidden: `display: none` drops the label out of the
        // accessibility tree, which left a collapsed rail as a column of
        // buttons with no accessible name at all. Matches SidebarGroupLabel.
        l && "zen-relative zen-justify-center zen-px-0 [&>span]:zen-sr-only",
        e
      ),
      ...i
    }
  );
});
S.displayName = "SidebarMenuButton";
const y = (
  // Every side is set explicitly: `zen-m-0`/`zen-p-0` plus a directional
  // `zen-ml-4` are the same specificity, so which one wins would come down to
  // UnoCSS's emit order rather than intent.
  "zen-mb-0 zen-ml-4 zen-mr-0 zen-mt-0.5 zen-flex zen-list-none zen-flex-col zen-gap-0.5 zen-border-0 zen-border-l zen-border-solid zen-border-zen-border zen-pb-0 zen-pl-3 zen-pr-0 zen-pt-0"
), F = ({ open: e }) => /* @__PURE__ */ o(
  "svg",
  {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
    className: s("zen-ml-auto zen-transition-transform", e && "zen-rotate-90"),
    children: /* @__PURE__ */ o("polyline", { points: "9 18 15 12 9 6" })
  }
);
function D({
  label: e,
  icon: r,
  defaultOpen: n = !1,
  open: i,
  onOpenChange: a,
  active: l = !1,
  children: z,
  className: c
}) {
  const { collapsed: d } = m(), [b, p] = t.useState(n), g = i !== void 0, f = g ? i : b, x = t.useCallback(
    (h) => {
      g || p(h), a?.(h);
    },
    [g, a]
  );
  return t.useEffect(() => {
    d && x(!1);
  }, [d]), d ? /* @__PURE__ */ u(C, { open: f, onOpenChange: x, children: [
    /* @__PURE__ */ o(k, { asChild: !0, children: /* @__PURE__ */ u(S, { active: l, className: c, children: [
      r,
      /* @__PURE__ */ o("span", { children: e })
    ] }) }),
    /* @__PURE__ */ u(R, { side: "right", align: "start", className: "zen-w-56 zen-p-2", children: [
      /* @__PURE__ */ o("div", { className: "zen-px-2 zen-pb-1.5 zen-text-xs zen-font-semibold zen-text-zen-muted-fg", children: e }),
      /* @__PURE__ */ o("ul", { className: s(y, "zen-ml-0 zen-border-l-0 zen-pl-0"), children: z })
    ] })
  ] }) : /* @__PURE__ */ u(N, { children: [
    /* @__PURE__ */ u(
      S,
      {
        active: l,
        className: c,
        "aria-expanded": f,
        onClick: () => x(!f),
        children: [
          r,
          /* @__PURE__ */ o("span", { children: e }),
          /* @__PURE__ */ o(F, { open: f })
        ]
      }
    ),
    f ? /* @__PURE__ */ o("ul", { className: y, children: z }) : null
  ] });
}
const E = t.forwardRef(({ className: e, ...r }, n) => /* @__PURE__ */ o("li", { ref: n, className: s("zen-w-full", e), ...r }));
E.displayName = "SidebarMenuSubItem";
const H = t.forwardRef(({ className: e, asChild: r = !1, active: n = !1, ...i }, a) => /* @__PURE__ */ o(
  r ? v : "button",
  {
    ref: a,
    "data-active": n || void 0,
    className: s(
      "zen-flex zen-w-full zen-items-center zen-gap-2 zen-rounded-zen-md zen-px-3 zen-py-1.5 zen-text-sm zen-no-underline zen-transition-colors",
      "hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
      "[&>svg]:zen-size-4 [&>svg]:zen-shrink-0",
      n ? "zen-bg-zen-primary-soft zen-font-medium zen-text-zen-primary-soft-fg" : "zen-text-zen-foreground",
      e
    ),
    ...i
  }
));
H.displayName = "SidebarMenuSubButton";
const W = t.forwardRef(({ className: e, asChild: r = !1, onClick: n, children: i, ...a }, l) => {
  const { toggle: z } = m();
  return /* @__PURE__ */ o(
    r ? v : "button",
    {
      ref: l,
      "aria-label": "Toggle sidebar",
      onClick: (d) => {
        n?.(d), z();
      },
      className: s(
        "zen-inline-flex zen-h-9 zen-w-9 zen-items-center zen-justify-center zen-rounded-zen-md zen-text-zen-foreground zen-transition-colors hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
        e
      ),
      ...a,
      children: i ?? /* @__PURE__ */ u("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", "aria-hidden": "true", children: [
        /* @__PURE__ */ o("line", { x1: "3", y1: "6", x2: "21", y2: "6" }),
        /* @__PURE__ */ o("line", { x1: "3", y1: "12", x2: "21", y2: "12" }),
        /* @__PURE__ */ o("line", { x1: "3", y1: "18", x2: "21", y2: "18" })
      ] })
    }
  );
});
W.displayName = "SidebarTrigger";
export {
  M as Sidebar,
  I as SidebarContent,
  L as SidebarFooter,
  j as SidebarGroup,
  T as SidebarGroupLabel,
  B as SidebarHeader,
  G as SidebarMenu,
  S as SidebarMenuButton,
  P as SidebarMenuItem,
  D as SidebarMenuSub,
  H as SidebarMenuSubButton,
  E as SidebarMenuSubItem,
  q as SidebarProvider,
  W as SidebarTrigger,
  m as useSidebar
};
//# sourceMappingURL=index129.js.map
