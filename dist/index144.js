import { jsx as o, jsxs as w, Fragment as H } from "react/jsx-runtime";
import * as r from "react";
import { Root as L } from "./index171.js";
import { Popover as G, PopoverTrigger as W, PopoverContent as q } from "./index35.js";
import { useLocale as _ } from "./index90.js";
import { cn as l } from "./index160.js";
const T = r.createContext(null);
function S() {
  const e = r.useContext(T);
  if (!e) throw new Error("useSidebar must be used within a <SidebarProvider>");
  return e;
}
function le({
  children: e,
  defaultCollapsed: t = !1,
  collapsed: n,
  onCollapsedChange: s,
  collapseMode: a = "icon",
  overlay: z
}) {
  const [u, g] = r.useState(t), f = n !== void 0, c = f ? n : u, m = r.useCallback(
    (h) => {
      f || g(h), s?.(h);
    },
    [f, s]
  ), [p, C] = r.useState(!1), b = typeof z == "object" ? z.below : void 0, i = z === !0, v = r.useMemo(
    () => i ? !0 : b !== void 0 ? { below: b } : void 0,
    [i, b]
  ), y = r.useMemo(
    () => ({
      collapsed: c,
      setCollapsed: m,
      toggle: () => m(!c),
      rail: c && a === "icon" && !p,
      collapseMode: a,
      overlayActive: p,
      setOverlayActive: C,
      overlay: v
    }),
    [c, m, a, p, v]
  );
  return /* @__PURE__ */ o(T.Provider, { value: y, children: e });
}
const K = r.forwardRef(({ className: e, ...t }, n) => {
  const { collapsed: s, setCollapsed: a, collapseMode: z, overlay: u, overlayActive: g, setOverlayActive: f } = S(), c = r.useRef(null), m = r.useCallback(
    (d) => {
      c.current = d, typeof n == "function" ? n(d) : n && (n.current = d);
    },
    [n]
  ), p = typeof u == "object" ? u.below : void 0, [C, b] = r.useState(!1);
  r.useLayoutEffect(() => {
    const d = c.current?.parentElement;
    if (!d || p === void 0) {
      b(!1);
      return;
    }
    const R = () => b(d.clientWidth < p), N = new ResizeObserver(R);
    return N.observe(d), R(), () => N.disconnect();
  }, [p]);
  const i = u === !0 || C, v = r.useRef(!1), y = r.useRef(!1);
  r.useLayoutEffect(() => {
    i !== v.current && (v.current = i, f(i), i ? (y.current = s, a(!0)) : a(y.current));
  }, [i, s, a, f]);
  const h = s && (z === "hidden" || i), M = i && g && !s, B = r.useRef(a);
  return r.useLayoutEffect(() => {
    B.current = a;
  }), r.useEffect(() => {
    const d = c.current;
    if (!M || !d) return;
    const R = document.activeElement instanceof HTMLElement ? document.activeElement : null, N = (x) => {
      B.current(!0), x && d.contains(document.activeElement) && R?.focus({ preventScroll: !0 });
    }, j = (x) => {
      x.key === "Escape" && !x.defaultPrevented && N(!0);
    }, A = (x) => {
      const O = x.target;
      d.contains(O) || O.closest?.("[data-sidebar-trigger]") || N(!1);
    }, I = (x) => {
      x.target.closest?.("a[href]") && N(!1);
    };
    document.addEventListener("keydown", j), document.addEventListener("pointerdown", A, !0), d.addEventListener("click", I);
    const F = requestAnimationFrame(() => {
      d.contains(document.activeElement) || d.querySelector('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')?.focus({ preventScroll: !0 });
    });
    return () => {
      cancelAnimationFrame(F), document.removeEventListener("keydown", j), document.removeEventListener("pointerdown", A, !0), d.removeEventListener("click", I);
    };
  }, [M]), /* @__PURE__ */ o(
    "aside",
    {
      ref: m,
      "data-collapsed": s || void 0,
      "data-overlay": i ? "" : void 0,
      inert: h || void 0,
      className: l(
        "zen-flex zen-h-full zen-flex-col zen-border-r zen-border-zen-border zen-bg-zen-background zen-text-zen-foreground zen-transition-[width] zen-duration-200 zen-ease-in-out",
        i ? (
          // Overlay: a full-width panel whose negative end margin cancels its
          // own width, so it takes no room in the row and the content that
          // follows starts where it does, underneath it. The same element
          // and children as the in-flow layout (unlike Solid's wrapper
          // panel), so crossing the breakpoint does not remount the menu.
          l("zen-relative zen-z-30 zen-w-64 zen-shrink-0 -zen-me-64 zen-shadow-lg", h && "zen-invisible")
        ) : h ? "zen-w-0 zen-overflow-hidden zen-border-r-0" : s ? "zen-w-16" : "zen-w-64",
        e
      ),
      ...t
    }
  );
});
K.displayName = "Sidebar";
const U = r.forwardRef(({ className: e, ...t }, n) => {
  const { rail: s } = S();
  return /* @__PURE__ */ o(
    "div",
    {
      ref: n,
      className: l(
        "zen-flex zen-items-center zen-gap-2 zen-p-3",
        // On the rail the header stacks (the toggle over a logo) and its text
        // goes to screen readers only, as the menu's labels do. Text left
        // visible spilled out of the 64px rail over the page.
        s && "zen-flex-col zen-px-0 [&>span]:zen-sr-only [&>strong]:zen-sr-only",
        e
      ),
      ...t
    }
  );
});
U.displayName = "SidebarHeader";
const V = r.forwardRef(({ className: e, ...t }, n) => {
  const { rail: s } = S();
  return /* @__PURE__ */ o(
    "span",
    {
      ref: n,
      className: l("zen-min-w-0 zen-truncate zen-font-semibold", s && "zen-sr-only", e),
      ...t
    }
  );
});
V.displayName = "SidebarHeaderLabel";
const k = r.forwardRef(({ className: e, ...t }, n) => /* @__PURE__ */ o(
  "span",
  {
    ref: n,
    "data-sidebar-badge": "",
    className: l(
      "zen-ml-auto zen-min-w-5 zen-rounded-zen-sm zen-bg-zen-muted zen-px-1.5 zen-text-center zen-text-xs zen-font-medium zen-tabular-nums zen-text-zen-muted-fg",
      e
    ),
    ...t
  }
));
k.displayName = "SidebarMenuBadge";
const D = r.forwardRef(({ className: e, ...t }, n) => /* @__PURE__ */ o(
  "div",
  {
    ref: n,
    className: l("zen-flex zen-min-h-0 zen-flex-1 zen-flex-col zen-gap-1 zen-overflow-y-auto zen-p-2", e),
    ...t
  }
));
D.displayName = "SidebarContent";
const J = r.forwardRef(({ className: e, ...t }, n) => /* @__PURE__ */ o(
  "div",
  {
    ref: n,
    className: l("zen-mt-auto zen-flex zen-items-center zen-gap-2 zen-border-t zen-border-zen-border zen-p-3", e),
    ...t
  }
));
J.displayName = "SidebarFooter";
const Q = r.forwardRef(({ className: e, ...t }, n) => /* @__PURE__ */ o("div", { ref: n, className: l("zen-flex zen-flex-col zen-gap-1 zen-py-2", e), ...t }));
Q.displayName = "SidebarGroup";
const X = r.forwardRef(({ className: e, ...t }, n) => {
  const { rail: s } = S();
  return /* @__PURE__ */ o(
    "div",
    {
      ref: n,
      className: l(
        "zen-px-3 zen-py-1 zen-text-xs zen-font-medium zen-uppercase zen-tracking-wide zen-text-zen-muted-fg",
        s && "zen-sr-only",
        e
      ),
      ...t
    }
  );
});
X.displayName = "SidebarGroupLabel";
const Y = r.forwardRef(({ className: e, ...t }, n) => (
  // The list reset is the component's own job: zen-ui ships no element reset
  // (it is opt-in via /preflight), so without this the browser default
  // `list-style: disc` + `padding-inline-start: 40px` apply. That 40px ate the
  // collapsed rail — 64px wide, less 16px of padding, less 40px, left 8px of
  // room for a 16px icon.
  /* @__PURE__ */ o(
    "ul",
    {
      ref: n,
      className: l("zen-m-0 zen-flex zen-w-full zen-list-none zen-flex-col zen-gap-0.5 zen-p-0", e),
      ...t
    }
  )
));
Y.displayName = "SidebarMenu";
const Z = r.forwardRef(({ className: e, ...t }, n) => /* @__PURE__ */ o("li", { ref: n, className: l("zen-w-full", e), ...t }));
Z.displayName = "SidebarMenuItem";
const E = r.forwardRef(({ className: e, asChild: t = !1, active: n = !1, ...s }, a) => {
  const { rail: z } = S();
  return /* @__PURE__ */ o(
    t ? L : "button",
    {
      ref: a,
      "data-active": n || void 0,
      className: l(
        "zen-flex zen-w-full zen-items-center zen-gap-2 zen-rounded-zen-md zen-px-3 zen-py-2 zen-text-sm zen-font-medium zen-no-underline zen-transition-colors",
        "hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
        "[&>svg]:zen-size-4 [&>svg]:zen-shrink-0",
        // As a link (asChild <a>) it would otherwise take the browser's
        // underline and link blue: zen-ui ships no element reset.
        // SidebarMenuSubButton has always set both.
        n ? "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg" : "zen-text-zen-foreground",
        // sr-only, not hidden: `display: none` drops the label out of the
        // accessibility tree, which left a collapsed rail as a column of
        // buttons with no accessible name at all. Matches SidebarGroupLabel.
        z && "zen-relative zen-justify-center zen-px-0 [&>span]:zen-sr-only",
        e
      ),
      ...s
    }
  );
});
E.displayName = "SidebarMenuButton";
const P = (
  // Every side is set explicitly: `zen-m-0`/`zen-p-0` plus a directional
  // `zen-ml-4` are the same specificity, so which one wins would come down to
  // UnoCSS's emit order rather than intent.
  "zen-mb-0 zen-ml-4 zen-mr-0 zen-mt-0.5 zen-flex zen-list-none zen-flex-col zen-gap-0.5 zen-border-0 zen-border-l zen-border-solid zen-border-zen-border zen-pb-0 zen-pl-3 zen-pr-0 zen-pt-0"
), $ = ({ open: e, after: t }) => /* @__PURE__ */ o(
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
    className: l(t ? "zen-ml-1" : "zen-ml-auto", "zen-transition-transform", e && "zen-rotate-90"),
    children: /* @__PURE__ */ o("polyline", { points: "9 18 15 12 9 6" })
  }
);
function de({
  label: e,
  icon: t,
  defaultOpen: n = !1,
  open: s,
  onOpenChange: a,
  active: z = !1,
  badge: u,
  children: g,
  className: f
}) {
  const { rail: c } = S(), m = u !== void 0, [p, C] = r.useState(n), b = s !== void 0, i = b ? s : p, v = r.useCallback(
    (y) => {
      b || C(y), a?.(y);
    },
    [b, a]
  );
  return r.useEffect(() => {
    c && v(!1);
  }, [c]), c ? /* @__PURE__ */ w(G, { open: i, onOpenChange: v, children: [
    /* @__PURE__ */ o(W, { asChild: !0, children: /* @__PURE__ */ w(E, { active: z, className: f, children: [
      t,
      /* @__PURE__ */ o("span", { children: e })
    ] }) }),
    /* @__PURE__ */ w(q, { side: "right", align: "start", className: "zen-w-56 zen-p-2", children: [
      /* @__PURE__ */ w(
        "div",
        {
          className: l(
            "zen-px-2 zen-pb-1.5 zen-text-xs zen-font-semibold zen-text-zen-muted-fg",
            // Only with a badge, so a heading without one renders as before.
            m && "zen-flex zen-items-center zen-gap-2"
          ),
          children: [
            e,
            m ? /* @__PURE__ */ o(k, { children: u }) : null
          ]
        }
      ),
      /* @__PURE__ */ o("ul", { className: l(P, "zen-ml-0 zen-border-l-0 zen-pl-0"), children: g })
    ] })
  ] }) : /* @__PURE__ */ w(H, { children: [
    /* @__PURE__ */ w(
      E,
      {
        active: z,
        className: f,
        "aria-expanded": i,
        onClick: () => v(!i),
        children: [
          t,
          /* @__PURE__ */ o("span", { children: e }),
          m ? /* @__PURE__ */ o(k, { children: u }) : null,
          /* @__PURE__ */ o($, { open: i, after: m })
        ]
      }
    ),
    i ? /* @__PURE__ */ o("ul", { className: P, children: g }) : null
  ] });
}
const ee = r.forwardRef(({ className: e, ...t }, n) => /* @__PURE__ */ o("li", { ref: n, className: l("zen-w-full", e), ...t }));
ee.displayName = "SidebarMenuSubItem";
const ne = r.forwardRef(({ className: e, asChild: t = !1, active: n = !1, ...s }, a) => /* @__PURE__ */ o(
  t ? L : "button",
  {
    ref: a,
    "data-active": n || void 0,
    className: l(
      "zen-flex zen-w-full zen-items-center zen-gap-2 zen-rounded-zen-md zen-px-3 zen-py-1.5 zen-text-sm zen-no-underline zen-transition-colors",
      "hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
      "[&>svg]:zen-size-4 [&>svg]:zen-shrink-0",
      n ? "zen-bg-zen-primary-soft zen-font-medium zen-text-zen-primary-soft-fg" : "zen-text-zen-foreground",
      e
    ),
    ...s
  }
));
ne.displayName = "SidebarMenuSubButton";
const te = r.forwardRef(({ className: e, asChild: t = !1, onClick: n, children: s, ...a }, z) => {
  const u = _(), { toggle: g } = S();
  return /* @__PURE__ */ o(
    t ? L : "button",
    {
      ref: z,
      "aria-label": u.t("sidebar.toggleSidebar"),
      "data-sidebar-trigger": "",
      onClick: (c) => {
        n?.(c), g();
      },
      className: l(
        "zen-inline-flex zen-h-9 zen-w-9 zen-items-center zen-justify-center zen-rounded-zen-md zen-text-zen-foreground zen-transition-colors hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
        e
      ),
      ...a,
      children: s ?? /* @__PURE__ */ w("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", "aria-hidden": "true", children: [
        /* @__PURE__ */ o("line", { x1: "3", y1: "6", x2: "21", y2: "6" }),
        /* @__PURE__ */ o("line", { x1: "3", y1: "12", x2: "21", y2: "12" }),
        /* @__PURE__ */ o("line", { x1: "3", y1: "18", x2: "21", y2: "18" })
      ] })
    }
  );
});
te.displayName = "SidebarTrigger";
export {
  K as Sidebar,
  D as SidebarContent,
  J as SidebarFooter,
  Q as SidebarGroup,
  X as SidebarGroupLabel,
  U as SidebarHeader,
  V as SidebarHeaderLabel,
  Y as SidebarMenu,
  k as SidebarMenuBadge,
  E as SidebarMenuButton,
  Z as SidebarMenuItem,
  de as SidebarMenuSub,
  ne as SidebarMenuSubButton,
  ee as SidebarMenuSubItem,
  le as SidebarProvider,
  te as SidebarTrigger,
  S as useSidebar
};
//# sourceMappingURL=index144.js.map
