import { jsx as t, jsxs as w } from "react/jsx-runtime";
import * as e from "react";
import { Icon as R } from "./index56.js";
import { cn as N } from "./index143.js";
const H = 8, S = e.createContext(null);
function k(s) {
  const i = e.useContext(S);
  if (!i) throw new Error(`<${s}> must be used within a <DynamicPage>`);
  return i;
}
const L = e.forwardRef(
  ({
    headerExpanded: s,
    defaultHeaderExpanded: i = !0,
    onHeaderExpandedChange: z,
    headerPinnable: a = !0,
    showFooter: d = !0,
    className: g,
    children: c,
    ...m
  }, r) => {
    const o = e.useRef(null), l = e.useId(), [u, h] = e.useState(null), [f, y] = e.useState(null), [T, j] = e.useState(i), P = s !== void 0, E = P ? s : T, v = e.useCallback(
      (n) => {
        P || j(n), z?.(n);
      },
      [P, z]
    ), [p, D] = e.useState(!1);
    e.useEffect(() => {
      !a && p && D(!1);
    }, [a, p]), e.useEffect(() => {
      const n = o.current;
      if (!n) return;
      const x = () => {
        if (p) return;
        const b = n.scrollTop;
        if (b <= 0) {
          v(!0);
          return;
        }
        if (b <= H) return;
        const I = f?.offsetHeight ?? 0;
        n.scrollHeight - n.clientHeight - I <= H || v(!1);
      };
      return n.addEventListener("scroll", x, { passive: !0 }), () => n.removeEventListener("scroll", x);
    }, [p, f, v]), e.useLayoutEffect(() => {
      const n = o.current;
      if (!n || !u || typeof ResizeObserver > "u") return;
      const x = () => n.style.setProperty("--zen-dynamic-page-title-h", `${u.offsetHeight}px`);
      x();
      const b = new ResizeObserver(x);
      return b.observe(u), () => b.disconnect();
    }, [u]);
    const C = e.useMemo(
      () => ({
        headerExpanded: E,
        setHeaderExpanded: v,
        pinned: p,
        setPinned: D,
        headerPinnable: a,
        showFooter: d,
        headerId: l,
        setTitleEl: h,
        setHeaderEl: y
      }),
      [E, v, p, a, d, l]
    );
    return /* @__PURE__ */ t(S.Provider, { value: C, children: /* @__PURE__ */ t(
      "div",
      {
        ref: (n) => {
          o.current = n, typeof r == "function" ? r(n) : r && (r.current = n);
        },
        "data-header-expanded": E || void 0,
        "data-header-pinned": p || void 0,
        className: N(
          "zen-relative zen-flex zen-h-full zen-flex-col zen-overflow-y-auto zen-bg-zen-background zen-text-zen-foreground",
          // Scroll anchoring would "helpfully" subtract the collapsing
          // header's height from scrollTop, dropping us back to 0, which
          // re-expands the header — the snap would undo itself.
          "zen-[overflow-anchor:none]",
          g
        ),
        ...m,
        children: c
      }
    ) });
  }
);
L.displayName = "DynamicPage";
const F = e.forwardRef(
  ({ heading: s, subheading: i, actions: z, breadcrumbs: a, expandedContent: d, snappedContent: g, className: c, children: m, ...r }, o) => {
    const { headerExpanded: l, setHeaderExpanded: u, headerId: h, setTitleEl: f } = k("DynamicPageTitle");
    return /* @__PURE__ */ w(
      "div",
      {
        ref: (y) => {
          f(y), typeof o == "function" ? o(y) : o && (o.current = y);
        },
        "data-state": l ? "expanded" : "snapped",
        className: N(
          // Sticky at ALL times — only the header below it ever collapses.
          "zen-sticky zen-top-0 zen-z-20 zen-shrink-0 zen-bg-zen-background zen-px-4 zen-pb-2 zen-pt-3",
          c
        ),
        ...r,
        children: [
          a ? /* @__PURE__ */ t("div", { className: "zen-mb-1 zen-min-w-0", children: a }) : null,
          /* @__PURE__ */ w("div", { className: "zen-flex zen-items-start zen-justify-between zen-gap-4", children: [
            /* @__PURE__ */ w("div", { className: "zen-min-w-0 zen-flex-1", children: [
              /* @__PURE__ */ t("h2", { className: "zen-m-0", children: /* @__PURE__ */ w(
                "button",
                {
                  type: "button",
                  "aria-expanded": l,
                  "aria-controls": h,
                  onClick: () => u(!l),
                  className: "zen-group zen-inline-flex zen-max-w-full zen-items-center zen-gap-1.5 zen-rounded-zen-md zen-bg-transparent zen-px-1 zen-py-0.5 zen-text-lg zen-font-semibold zen-leading-tight zen-text-zen-foreground zen-transition-colors hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                  children: [
                    /* @__PURE__ */ t("span", { className: "zen-truncate", children: s }),
                    /* @__PURE__ */ t(
                      R,
                      {
                        name: l ? "chevron-up" : "chevron-down",
                        size: 16,
                        className: "zen-shrink-0 zen-text-zen-muted-fg"
                      }
                    )
                  ]
                }
              ) }),
              i ? /* @__PURE__ */ t("p", { className: "zen-m-0 zen-px-1 zen-text-sm zen-text-zen-muted-fg", children: i }) : null,
              l ? d : g,
              m
            ] }),
            z ? /* @__PURE__ */ t("div", { className: "zen-flex zen-shrink-0 zen-items-center zen-gap-2", children: z }) : null
          ] })
        ]
      }
    );
  }
);
F.displayName = "DynamicPageTitle";
const O = e.forwardRef(
  ({
    className: s,
    children: i,
    "aria-label": z = "Page header",
    pinLabel: a = "Pin header",
    unpinLabel: d = "Unpin header",
    ...g
  }, c) => {
    const { headerExpanded: m, pinned: r, setPinned: o, headerPinnable: l, headerId: u, setHeaderEl: h } = k("DynamicPageHeader");
    return /* @__PURE__ */ t(
      "div",
      {
        ref: (f) => {
          h(f), typeof c == "function" ? c(f) : c && (c.current = f);
        },
        id: u,
        role: "region",
        "aria-label": z,
        "data-state": m ? "expanded" : "collapsed",
        className: N(
          // 1fr → 0fr on a grid row collapses to zero without anyone measuring
          // the content, and animates, which `height: auto` cannot.
          //
          // The transition-property is spelled as an arbitrary PROPERTY
          // (`zen-[transition-property:…]`), not as `zen-transition-[…]`. Uno has
          // no arbitrary-value form of its `transition-*` rule, so the latter
          // matched nothing and this header collapsed instantly — the one thing
          // the comment above says it does not do. Pinned by check:css-live.
          "zen-grid zen-shrink-0 zen-overflow-hidden zen-border-b zen-border-zen-border zen-bg-zen-background zen-[transition-property:grid-template-rows] zen-duration-200 zen-ease-out",
          m ? "zen-grid-rows-[1fr]" : "zen-grid-rows-[0fr]",
          // Pinned: ride along under the sticky title instead of scrolling away.
          // The border-b sits on THIS element, outside the clipped row, so a
          // collapsed header still draws the line under the title.
          r && "zen-sticky zen-z-10",
          s
        ),
        style: r ? { top: "var(--zen-dynamic-page-title-h, 0px)" } : void 0,
        inert: m ? void 0 : !0,
        ...g,
        children: /* @__PURE__ */ t("div", { className: "zen-min-h-0 zen-overflow-hidden", children: /* @__PURE__ */ w("div", { className: "zen-flex zen-items-end zen-justify-between zen-gap-4 zen-px-4 zen-pb-3 zen-pt-1", children: [
          /* @__PURE__ */ t("div", { className: "zen-min-w-0 zen-flex-1", children: i }),
          l ? /* @__PURE__ */ t(
            "button",
            {
              type: "button",
              "aria-pressed": r,
              "aria-label": r ? d : a,
              onClick: () => o(!r),
              className: N(
                "zen-inline-flex zen-h-7 zen-w-7 zen-shrink-0 zen-items-center zen-justify-center zen-rounded-zen-md zen-bg-transparent zen-text-zen-muted-fg zen-transition-colors hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                r && "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg"
              ),
              children: /* @__PURE__ */ t(R, { name: "lock", size: 14 })
            }
          ) : null
        ] }) })
      }
    );
  }
);
O.displayName = "DynamicPageHeader";
const _ = e.forwardRef(
  ({ className: s, children: i, ...z }, a) => {
    const { showFooter: d } = k("DynamicPageFooter");
    return d ? (
      // mt-auto pins the bar to the bottom when the content is too short to
      // fill the page; sticky keeps it there once the content overflows.
      // pointer-events-none on the rail so the floating bar's margins do not
      // swallow clicks meant for the content scrolling underneath it.
      /* @__PURE__ */ t("div", { className: "zen-pointer-events-none zen-sticky zen-bottom-0 zen-z-30 zen-mt-auto zen-shrink-0 zen-p-3", children: /* @__PURE__ */ t(
        "div",
        {
          ref: a,
          className: N(
            "zen-pointer-events-auto zen-flex zen-items-center zen-justify-end zen-gap-2 zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-3 zen-py-2 zen-shadow-lg",
            s
          ),
          ...z,
          children: i
        }
      ) })
    ) : null;
  }
);
_.displayName = "DynamicPageFooter";
export {
  L as DynamicPage,
  _ as DynamicPageFooter,
  O as DynamicPageHeader,
  F as DynamicPageTitle
};
//# sourceMappingURL=index48.js.map
