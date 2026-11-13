import { jsx as a, jsxs as B } from "react/jsx-runtime";
import * as e from "react";
import { Root as j } from "./index208.js";
import { afterWidthTransition as V, afterTransition as Y } from "./index260.js";
import { Popover as J, PopoverAnchor as Q, PopoverContent as X } from "./index35.js";
import { useLocale as Z } from "./index90.js";
import { cn as d } from "./index197.js";
const h = "zen-duration-[var(--zen-sidebar-duration)] zen-ease-[var(--zen-sidebar-ease)]", k = "[[data-collapsed]_&]:zen-overflow-hidden [[data-collapsed]_&]:zen-whitespace-nowrap [[data-transitioning]_&]:zen-overflow-hidden [[data-transitioning]_&]:zen-whitespace-nowrap", U = e.createContext(null);
function N() {
  const t = e.useContext(U);
  if (!t) throw new Error("useSidebar must be used within a <SidebarProvider>");
  return t;
}
function xe({
  children: t,
  defaultCollapsed: r = !1,
  collapsed: n,
  onCollapsedChange: o,
  collapseMode: c = "icon",
  overlay: z
}) {
  const [f, w] = e.useState(r), g = n !== void 0, l = g ? n : f, p = e.useCallback(
    (m) => {
      g || w(m), o?.(m);
    },
    [g, o]
  ), [y, M] = e.useState(!1), b = typeof z == "object" ? z.below : void 0, s = z === !0, C = e.useMemo(
    () => s ? !0 : b !== void 0 ? { below: b } : void 0,
    [s, b]
  ), v = e.useMemo(
    () => ({
      collapsed: l,
      setCollapsed: p,
      toggle: () => p(!l),
      rail: l && c === "icon" && !y,
      collapseMode: c,
      overlayActive: y,
      setOverlayActive: M,
      overlay: C
    }),
    [l, p, c, y, C]
  );
  return /* @__PURE__ */ a(U.Provider, { value: v, children: t });
}
const $ = e.forwardRef(({ className: t, ...r }, n) => {
  const { collapsed: o, setCollapsed: c, collapseMode: z, overlay: f, overlayActive: w, setOverlayActive: g } = N(), l = e.useRef(null), p = e.useCallback(
    (i) => {
      l.current = i, typeof n == "function" ? n(i) : n && (n.current = i);
    },
    [n]
  ), y = typeof f == "object" ? f.below : void 0, [M, b] = e.useState(!1);
  e.useLayoutEffect(() => {
    const i = l.current?.parentElement;
    if (!i || y === void 0) {
      b(!1);
      return;
    }
    const x = () => b(i.clientWidth < y), u = new ResizeObserver(x);
    return u.observe(i), x(), () => u.disconnect();
  }, [y]);
  const s = f === !0 || M, C = e.useRef(!1), v = e.useRef(!1);
  e.useLayoutEffect(() => {
    s !== C.current && (C.current = s, g(s), s ? (v.current = o, c(!0)) : c(v.current));
  }, [s, o, c, g]);
  const m = o && (z === "hidden" || s), A = s && w && !o, R = e.useRef(c);
  e.useLayoutEffect(() => {
    R.current = c;
  }), e.useEffect(() => {
    const i = l.current;
    if (!A || !i) return;
    const x = document.activeElement instanceof HTMLElement ? document.activeElement : null, u = (S) => {
      R.current(!0), S && i.contains(document.activeElement) && x?.focus({ preventScroll: !0 });
    }, I = (S) => {
      S.key === "Escape" && !S.defaultPrevented && u(!0);
    }, q = (S) => {
      const D = S.target;
      i.contains(D) || D.closest?.("[data-sidebar-trigger]") || u(!1);
    }, H = (S) => {
      S.target.closest?.("a[href]") && u(!1);
    };
    document.addEventListener("keydown", I), document.addEventListener("pointerdown", q, !0), i.addEventListener("click", H);
    const K = requestAnimationFrame(() => {
      i.contains(document.activeElement) || i.querySelector('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')?.focus({ preventScroll: !0 });
    });
    return () => {
      cancelAnimationFrame(K), document.removeEventListener("keydown", I), document.removeEventListener("pointerdown", q, !0), i.removeEventListener("click", H);
    };
  }, [A]);
  const [E, _] = e.useState(!1), L = e.useRef(o), T = e.useRef(void 0);
  e.useLayoutEffect(() => {
    if (L.current === o) return;
    L.current = o, T.current?.();
    const i = l.current;
    if (!i || s) {
      _(!1);
      return;
    }
    _(!0), T.current = V(i, () => _(!1));
  }, [o, s]), e.useEffect(() => () => T.current?.(), []);
  const [O, F] = e.useState(!1);
  return e.useEffect(() => {
    if (!s) {
      F(!1);
      return;
    }
    let i = requestAnimationFrame(() => {
      i = requestAnimationFrame(() => F(!0));
    });
    return () => cancelAnimationFrame(i);
  }, [s]), /* @__PURE__ */ a(
    "aside",
    {
      ref: p,
      "data-collapsed": o || void 0,
      "data-transitioning": E || void 0,
      "data-overlay": s ? "" : void 0,
      inert: m || void 0,
      className: d(
        // Only the width animates, and everything inside is laid out so it
        // does not have to: rows keep their place and the aside clips
        // whatever no longer fits. It used to restyle every row on the first
        // frame while the width was still 256px, which threw each icon 100px
        // to the right and back, and on expand drew full labels over the page
        // from a 64px rail.
        "zen-flex zen-h-full zen-flex-col zen-border-r zen-border-zen-border zen-bg-zen-background zen-text-zen-foreground zen-transition-[width]",
        h,
        !s && (o || E) && "zen-overflow-hidden",
        s ? (
          // Overlay: a full-width panel whose negative end margin cancels its
          // own width, so it takes no room in the row and the content that
          // follows starts where it does, underneath it. The same element
          // and children as the in-flow layout (unlike Solid's wrapper
          // panel), so crossing the breakpoint does not remount the menu.
          d(
            "zen-relative zen-z-30 zen-w-64 zen-shrink-0 -zen-me-64 zen-shadow-lg",
            // It slides in from its edge on the sidebar's clock rather than
            // appearing. Visibility is transitioned only on the way out, so
            // the panel stays drawn until the slide has finished. On the way
            // in it must not be: a transition's first frame holds its start
            // value, so the panel was still hidden when focus moved into it,
            // and the focus went nowhere.
            m && "zen-invisible -zen-translate-x-full rtl:zen-translate-x-full",
            O ? m ? "zen-transition-[transform,visibility]" : "zen-transition-transform" : "zen-transition-none"
          )
        ) : m ? "zen-w-0 zen-border-r-0" : o ? "zen-w-16" : "zen-w-64",
        t
      ),
      ...r
    }
  );
});
$.displayName = "Sidebar";
const ee = e.forwardRef(({ className: t, ...r }, n) => {
  const { rail: o } = N();
  return /* @__PURE__ */ a(
    "div",
    {
      ref: n,
      className: d(
        // The header stays a row on the rail: its inline padding grows just
        // enough to centre the 36px toggle, and its text fades and is
        // clipped. It used to restack into a column on the first frame, which
        // moved the toggle you had just clicked 100px out from under the
        // pointer. Faded, not sr-only, so the name is still read.
        "zen-flex zen-items-center zen-gap-2 zen-py-3 zen-transition-[padding]",
        "[&>span]:zen-transition-opacity [&>strong]:zen-transition-opacity",
        h,
        "[&>span]:zen-duration-[var(--zen-sidebar-duration)] [&>strong]:zen-duration-[var(--zen-sidebar-duration)]",
        k,
        o ? "zen-px-3.5 [&>span]:zen-opacity-0 [&>strong]:zen-opacity-0" : "zen-px-3",
        t
      ),
      ...r
    }
  );
});
ee.displayName = "SidebarHeader";
const ne = e.forwardRef(({ className: t, ...r }, n) => {
  const { rail: o } = N();
  return /* @__PURE__ */ a(
    "span",
    {
      ref: n,
      className: d(
        "zen-min-w-0 zen-truncate zen-font-semibold zen-transition-opacity",
        h,
        o && "zen-opacity-0",
        t
      ),
      ...r
    }
  );
});
ne.displayName = "SidebarHeaderLabel";
const P = e.forwardRef(({ className: t, ...r }, n) => /* @__PURE__ */ a(
  "span",
  {
    ref: n,
    "data-sidebar-badge": "",
    className: d(
      "zen-ml-auto zen-min-w-5 zen-rounded-zen-sm zen-bg-zen-muted zen-px-1.5 zen-text-center zen-text-xs zen-font-medium zen-tabular-nums zen-text-zen-muted-fg",
      t
    ),
    ...r
  }
));
P.displayName = "SidebarMenuBadge";
const te = e.forwardRef(({ className: t, ...r }, n) => /* @__PURE__ */ a(
  "div",
  {
    ref: n,
    className: d("zen-flex zen-min-h-0 zen-flex-1 zen-flex-col zen-gap-1 zen-overflow-y-auto zen-p-2", t),
    ...r
  }
));
te.displayName = "SidebarContent";
const re = e.forwardRef(({ className: t, ...r }, n) => {
  const { rail: o } = N();
  return /* @__PURE__ */ a(
    "div",
    {
      ref: n,
      className: d(
        "zen-mt-auto zen-flex zen-items-center zen-gap-2 zen-border-t zen-border-zen-border zen-py-3 zen-transition-[padding]",
        h,
        k,
        // On the rail its inset matches the content's, which is what centres
        // a menu row's icon there; expanded it keeps its 12px.
        o ? "zen-px-2" : "zen-px-3",
        t
      ),
      ...r
    }
  );
});
re.displayName = "SidebarFooter";
const oe = e.forwardRef(({ className: t, ...r }, n) => /* @__PURE__ */ a("div", { ref: n, className: d("zen-flex zen-flex-col zen-gap-1 zen-py-2", t), ...r }));
oe.displayName = "SidebarGroup";
const ae = e.forwardRef(({ className: t, ...r }, n) => {
  const { rail: o } = N();
  return /* @__PURE__ */ a(
    "div",
    {
      ref: n,
      className: d(
        "zen-px-3 zen-py-1 zen-text-xs zen-font-medium zen-uppercase zen-tracking-wide zen-text-zen-muted-fg zen-transition-[margin,opacity]",
        h,
        k,
        // On the rail it folds away: a negative top margin of its own height
        // plus the group's gap, eased, so the rows below glide up with the
        // width instead of jumping 24px on the first frame (shadcn folds it
        // the same way). The height is the type token's line height plus its
        // padding, so a theme's line height carries through. Faded, not
        // sr-only, so the group is still named.
        o && "-zen-mt-[calc(var(--zen-line-height-xs)+var(--zen-space-2)+var(--zen-space-1))] zen-opacity-0",
        t
      ),
      ...r
    }
  );
});
ae.displayName = "SidebarGroupLabel";
const ie = e.forwardRef(({ className: t, ...r }, n) => (
  // The list reset is the component's own job: zen-ui ships no element reset
  // (it is opt-in via /preflight), so without this the browser default
  // `list-style: disc` + `padding-inline-start: 40px` apply. That 40px ate the
  // collapsed rail — 64px wide, less 16px of padding, less 40px, left 8px of
  // room for a 16px icon.
  /* @__PURE__ */ a(
    "ul",
    {
      ref: n,
      className: d("zen-m-0 zen-flex zen-w-full zen-list-none zen-flex-col zen-gap-0.5 zen-p-0", t),
      ...r
    }
  )
));
ie.displayName = "SidebarMenu";
const se = e.forwardRef(({ className: t, ...r }, n) => /* @__PURE__ */ a("li", { ref: n, className: d("zen-w-full", t), ...r }));
se.displayName = "SidebarMenuItem";
const W = e.forwardRef(({ className: t, asChild: r = !1, active: n = !1, ...o }, c) => {
  const { rail: z } = N();
  return /* @__PURE__ */ a(
    r ? j : "button",
    {
      ref: c,
      "data-active": n || void 0,
      className: d(
        "zen-relative zen-flex zen-w-full zen-items-center zen-gap-2 zen-rounded-zen-md zen-py-2 zen-text-sm zen-font-medium zen-no-underline zen-transition-[color,background-color,padding]",
        h,
        k,
        "hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
        "[&>svg]:zen-size-4 [&>svg]:zen-shrink-0",
        "[&>span]:zen-min-w-0 [[data-collapsed]_&>span]:zen-truncate [[data-transitioning]_&>span]:zen-truncate",
        "[&>span]:zen-transition-opacity [&>span]:zen-duration-[var(--zen-sidebar-duration)] [&>span]:zen-ease-[var(--zen-sidebar-ease)]",
        // As a link (asChild <a>) it would otherwise take the browser's
        // underline and link blue: zen-ui ships no element reset.
        // SidebarMenuSubButton has always set both.
        n ? "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg" : "zen-text-zen-foreground",
        // On the rail the icon is centred by padding that eases over — the
        // content's 8px inset plus 16px puts a 16px icon dead centre of the
        // 64px rail — not by `justify-center` flipping on the first frame,
        // which threw it 100px right while the rail was still wide. The label
        // stays in the row, truncated and faded, and the rail clips it: it
        // shrinks with the width instead of vanishing at t=0. Faded, not
        // hidden, so the row keeps its accessible name.
        z ? "zen-px-4 [&>span]:zen-opacity-0" : "zen-px-3",
        t
      ),
      ...o
    }
  );
});
W.displayName = "SidebarMenuButton";
const G = (
  // Every side is set explicitly: `zen-m-0`/`zen-p-0` plus a directional
  // `zen-ml-4` are the same specificity, so which one wins would come down to
  // UnoCSS's emit order rather than intent.
  "zen-mb-0 zen-ml-4 zen-mr-0 zen-mt-0.5 zen-flex zen-list-none zen-flex-col zen-gap-0.5 zen-pb-0 zen-pl-3 zen-pr-0 zen-pt-0"
), le = "zen-border-solid zen-border-y-0 zen-border-r-0 zen-border-l-[length:var(--zen-sidebar-guide-width)] zen-border-l-[color:var(--zen-sidebar-guide)]", de = "zen-ml-0 zen-border-0 zen-pl-0 [--zen-sidebar-guide-current:transparent]", ce = ({ open: t, after: r, faded: n }) => /* @__PURE__ */ a(
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
    className: d(
      r ? "zen-ml-1" : "zen-ml-auto",
      "zen-transition-[transform,opacity]",
      h,
      t && "zen-rotate-90",
      // On the rail it would read as a second icon.
      n && "zen-opacity-0"
    ),
    children: /* @__PURE__ */ a("polyline", { points: "9 18 15 12 9 6" })
  }
);
function Se({
  label: t,
  icon: r,
  defaultOpen: n = !1,
  open: o,
  onOpenChange: c,
  active: z = !1,
  badge: f,
  children: w,
  className: g
}) {
  const { rail: l } = N(), p = f !== void 0, [y, M] = e.useState(n), b = o !== void 0, s = b ? o : y, C = e.useCallback(
    (u) => {
      b || M(u), c?.(u);
    },
    [b, c]
  ), [v, m] = e.useState(!1);
  e.useEffect(() => {
    m(!1);
  }, [l]);
  const A = e.useRef(null), R = e.useRef(null), E = e.useRef(!1), _ = (u) => {
    u || (E.current = !0, setTimeout(() => E.current = !1)), m(u);
  }, L = s && !l, [T, O] = e.useState(L), [F, i] = e.useState(L), x = e.useRef(null);
  return e.useLayoutEffect(() => {
    if (L) {
      O(!0);
      const I = requestAnimationFrame(() => {
        x.current?.offsetHeight, i(!0);
      });
      return () => cancelAnimationFrame(I);
    }
    i(!1);
    const u = x.current;
    if (!u) {
      O(!1);
      return;
    }
    return Y(u, "grid-template-rows", () => O(!1));
  }, [L]), /* @__PURE__ */ B(J, { open: l && v, onOpenChange: _, children: [
    /* @__PURE__ */ a(Q, { asChild: !0, children: /* @__PURE__ */ B(
      W,
      {
        ref: A,
        active: z,
        className: g,
        "aria-expanded": l ? v : s,
        "aria-haspopup": l ? "dialog" : void 0,
        onPointerDown: () => {
          R.current = l ? v || E.current : s;
        },
        onClick: () => {
          l ? m(!(R.current ?? v)) : C(!(R.current ?? s)), R.current = null;
        },
        children: [
          r,
          /* @__PURE__ */ a("span", { children: t }),
          p ? /* @__PURE__ */ a(P, { children: f }) : null,
          /* @__PURE__ */ a(ce, { open: s && !l, after: p, faded: l })
        ]
      }
    ) }),
    T ? /* @__PURE__ */ a(
      "div",
      {
        ref: x,
        inert: !F || void 0,
        className: d(
          "zen-grid zen-transition-[grid-template-rows,margin]",
          h,
          // The list's own top margin moves out here, or a closed track
          // would still hold it open by 2px.
          F ? "zen-mt-0.5 zen-grid-rows-[1fr]" : "zen-mt-0 zen-grid-rows-[0fr]"
        ),
        children: /* @__PURE__ */ a("div", { className: "zen-min-h-0 zen-overflow-hidden", children: /* @__PURE__ */ a("ul", { "data-sidebar": "menu-sub", className: d(G, le, "zen-mt-0"), children: l && v ? null : w }) })
      }
    ) : null,
    /* @__PURE__ */ B(
      X,
      {
        side: "right",
        align: "start",
        className: "zen-w-56 zen-p-2",
        onCloseAutoFocus: (u) => {
          u.preventDefault(), queueMicrotask(() => {
            (!document.activeElement || document.activeElement === document.body) && A.current?.focus({ preventScroll: !0 });
          });
        },
        children: [
          /* @__PURE__ */ B(
            "div",
            {
              className: d(
                "zen-px-2 zen-pb-1.5 zen-text-xs zen-font-semibold zen-text-zen-muted-fg",
                // Only with a badge, so a heading without one renders as before.
                p && "zen-flex zen-items-center zen-gap-2"
              ),
              children: [
                t,
                p ? /* @__PURE__ */ a(P, { children: f }) : null
              ]
            }
          ),
          /* @__PURE__ */ a("ul", { className: d(G, de), children: w })
        ]
      }
    )
  ] });
}
const ue = e.forwardRef(({ className: t, ...r }, n) => /* @__PURE__ */ a("li", { ref: n, className: d("zen-w-full", t), ...r }));
ue.displayName = "SidebarMenuSubItem";
const ze = e.forwardRef(({ className: t, asChild: r = !1, active: n = !1, ...o }, c) => /* @__PURE__ */ a(
  r ? j : "button",
  {
    ref: c,
    "data-active": n || void 0,
    className: d(
      "zen-flex zen-w-full zen-items-center zen-gap-2 zen-rounded-zen-md zen-px-3 zen-py-1.5 zen-text-sm zen-no-underline zen-transition-colors",
      // One line while the sidebar is collapsed or moving: wrapped, a
      // sub-row grew taller as a closing sidebar narrowed and pushed every
      // row below it down mid-animation.
      k,
      "[[data-collapsed]_&>span]:zen-truncate [[data-transitioning]_&>span]:zen-truncate",
      "hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
      "[&>svg]:zen-size-4 [&>svg]:zen-shrink-0",
      n ? "zen-bg-zen-primary-soft zen-font-medium zen-text-zen-primary-soft-fg" : "zen-text-zen-foreground",
      // The current-row mark: a bar centred on the list's guide line, level
      // with this row. Invisible until --zen-sidebar-guide-current is given
      // a colour. The row starts the list's padding (zen-pl-3) right of the
      // guide, and half the guide's width further on.
      n && "zen-relative before:zen-pointer-events-none before:zen-absolute before:zen-inset-y-1 before:-zen-left-3 before:zen-w-[var(--zen-sidebar-guide-current-width)] before:zen-translate-x-[calc(-50%-var(--zen-sidebar-guide-width)/2)] before:zen-rounded-full before:zen-bg-[var(--zen-sidebar-guide-current)] before:zen-content-empty",
      t
    ),
    ...o
  }
));
ze.displayName = "SidebarMenuSubButton";
const fe = e.forwardRef(({ className: t, ...r }, n) => /* @__PURE__ */ a(
  "li",
  {
    ref: n,
    role: "presentation",
    "data-sidebar": "menu-sub-label",
    className: d(
      "zen-w-full zen-px-3 zen-pb-0.5 zen-pt-2 zen-text-xs zen-font-semibold zen-text-zen-muted-fg first:zen-pt-1",
      k,
      "[[data-collapsed]_&]:zen-truncate [[data-transitioning]_&]:zen-truncate",
      t
    ),
    ...r
  }
));
fe.displayName = "SidebarMenuSubLabel";
const me = e.forwardRef(({ className: t, asChild: r = !1, onClick: n, children: o, ...c }, z) => {
  const f = Z(), { toggle: w } = N();
  return /* @__PURE__ */ a(
    r ? j : "button",
    {
      ref: z,
      "aria-label": f.t("sidebar.toggleSidebar"),
      "data-sidebar-trigger": "",
      onClick: (l) => {
        n?.(l), w();
      },
      className: d(
        // Never squeezed by the header's clipped text on the rail.
        "zen-inline-flex zen-h-9 zen-w-9 zen-shrink-0 zen-items-center zen-justify-center zen-rounded-zen-md zen-text-zen-foreground zen-transition-colors hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
        t
      ),
      ...c,
      children: o ?? /* @__PURE__ */ B("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", "aria-hidden": "true", children: [
        /* @__PURE__ */ a("line", { x1: "3", y1: "6", x2: "21", y2: "6" }),
        /* @__PURE__ */ a("line", { x1: "3", y1: "12", x2: "21", y2: "12" }),
        /* @__PURE__ */ a("line", { x1: "3", y1: "18", x2: "21", y2: "18" })
      ] })
    }
  );
});
me.displayName = "SidebarTrigger";
export {
  $ as Sidebar,
  te as SidebarContent,
  re as SidebarFooter,
  oe as SidebarGroup,
  ae as SidebarGroupLabel,
  ee as SidebarHeader,
  ne as SidebarHeaderLabel,
  ie as SidebarMenu,
  P as SidebarMenuBadge,
  W as SidebarMenuButton,
  se as SidebarMenuItem,
  Se as SidebarMenuSub,
  ze as SidebarMenuSubButton,
  ue as SidebarMenuSubItem,
  fe as SidebarMenuSubLabel,
  xe as SidebarProvider,
  me as SidebarTrigger,
  N as useSidebar
};
//# sourceMappingURL=index181.js.map
