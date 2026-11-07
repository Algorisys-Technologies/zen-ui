import { jsx as r, jsxs as w } from "react/jsx-runtime";
import * as e from "react";
import { Icon as R } from "./index63.js";
import { useLocale as L } from "./index90.js";
import { cn as N } from "./index160.js";
const D = 8, S = e.createContext(null);
function k(s) {
  const a = e.useContext(S);
  if (!a) throw new Error(`<${s}> must be used within a <DynamicPage>`);
  return a;
}
const F = e.forwardRef(
  ({
    headerExpanded: s,
    defaultHeaderExpanded: a = !0,
    onHeaderExpandedChange: z,
    headerPinnable: i = !0,
    showFooter: d = !0,
    className: h,
    children: u,
    ...m
  }, o) => {
    const t = e.useRef(null), l = e.useId(), [f, y] = e.useState(null), [g, c] = e.useState(null), [T, j] = e.useState(a), P = s !== void 0, E = P ? s : T, v = e.useCallback(
      (n) => {
        P || j(n), z?.(n);
      },
      [P, z]
    ), [p, H] = e.useState(!1);
    e.useEffect(() => {
      !i && p && H(!1);
    }, [i, p]), e.useEffect(() => {
      const n = t.current;
      if (!n) return;
      const x = () => {
        if (p) return;
        const b = n.scrollTop;
        if (b <= 0) {
          v(!0);
          return;
        }
        if (b <= D) return;
        const I = g?.offsetHeight ?? 0;
        n.scrollHeight - n.clientHeight - I <= D || v(!1);
      };
      return n.addEventListener("scroll", x, { passive: !0 }), () => n.removeEventListener("scroll", x);
    }, [p, g, v]), e.useLayoutEffect(() => {
      const n = t.current;
      if (!n || !f || typeof ResizeObserver > "u") return;
      const x = () => n.style.setProperty("--zen-dynamic-page-title-h", `${f.offsetHeight}px`);
      x();
      const b = new ResizeObserver(x);
      return b.observe(f), () => b.disconnect();
    }, [f]);
    const C = e.useMemo(
      () => ({
        headerExpanded: E,
        setHeaderExpanded: v,
        pinned: p,
        setPinned: H,
        headerPinnable: i,
        showFooter: d,
        headerId: l,
        setTitleEl: y,
        setHeaderEl: c
      }),
      [E, v, p, i, d, l]
    );
    return /* @__PURE__ */ r(S.Provider, { value: C, children: /* @__PURE__ */ r(
      "div",
      {
        ref: (n) => {
          t.current = n, typeof o == "function" ? o(n) : o && (o.current = n);
        },
        "data-header-expanded": E || void 0,
        "data-header-pinned": p || void 0,
        className: N(
          "zen-relative zen-flex zen-h-full zen-flex-col zen-overflow-y-auto zen-bg-zen-background zen-text-zen-foreground",
          // Scroll anchoring would "helpfully" subtract the collapsing
          // header's height from scrollTop, dropping us back to 0, which
          // re-expands the header — the snap would undo itself.
          "zen-[overflow-anchor:none]",
          h
        ),
        ...m,
        children: u
      }
    ) });
  }
);
F.displayName = "DynamicPage";
const O = e.forwardRef(
  ({ heading: s, subheading: a, actions: z, breadcrumbs: i, expandedContent: d, snappedContent: h, className: u, children: m, ...o }, t) => {
    const { headerExpanded: l, setHeaderExpanded: f, headerId: y, setTitleEl: g } = k("DynamicPageTitle");
    return /* @__PURE__ */ w(
      "div",
      {
        ref: (c) => {
          g(c), typeof t == "function" ? t(c) : t && (t.current = c);
        },
        "data-state": l ? "expanded" : "snapped",
        className: N(
          // Sticky at ALL times — only the header below it ever collapses.
          "zen-sticky zen-top-0 zen-z-20 zen-shrink-0 zen-bg-zen-background zen-px-4 zen-pb-2 zen-pt-3",
          u
        ),
        ...o,
        children: [
          i ? /* @__PURE__ */ r("div", { className: "zen-mb-1 zen-min-w-0", children: i }) : null,
          /* @__PURE__ */ w("div", { className: "zen-flex zen-items-start zen-justify-between zen-gap-4", children: [
            /* @__PURE__ */ w("div", { className: "zen-min-w-0 zen-flex-1", children: [
              /* @__PURE__ */ r("h2", { className: "zen-m-0", children: /* @__PURE__ */ w(
                "button",
                {
                  type: "button",
                  "aria-expanded": l,
                  "aria-controls": y,
                  onClick: () => f(!l),
                  className: "zen-group zen-inline-flex zen-max-w-full zen-items-center zen-gap-1.5 zen-rounded-zen-md zen-bg-transparent zen-px-1 zen-py-0.5 zen-text-lg zen-font-semibold zen-leading-tight zen-text-zen-foreground zen-transition-colors hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                  children: [
                    /* @__PURE__ */ r("span", { className: "zen-truncate", children: s }),
                    /* @__PURE__ */ r(
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
              a ? /* @__PURE__ */ r("p", { className: "zen-m-0 zen-px-1 zen-text-sm zen-text-zen-muted-fg", children: a }) : null,
              l ? d : h,
              m
            ] }),
            z ? /* @__PURE__ */ r("div", { className: "zen-flex zen-shrink-0 zen-items-center zen-gap-2", children: z }) : null
          ] })
        ]
      }
    );
  }
);
O.displayName = "DynamicPageTitle";
const _ = e.forwardRef(
  ({
    className: s,
    children: a,
    "aria-label": z,
    pinLabel: i,
    unpinLabel: d,
    ...h
  }, u) => {
    const m = L(), { headerExpanded: o, pinned: t, setPinned: l, headerPinnable: f, headerId: y, setHeaderEl: g } = k("DynamicPageHeader");
    return /* @__PURE__ */ r(
      "div",
      {
        ref: (c) => {
          g(c), typeof u == "function" ? u(c) : u && (u.current = c);
        },
        id: y,
        role: "region",
        "aria-label": z ?? m.t("dynamicPage.pageHeader"),
        "data-state": o ? "expanded" : "collapsed",
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
          o ? "zen-grid-rows-[1fr]" : "zen-grid-rows-[0fr]",
          // Pinned: ride along under the sticky title instead of scrolling away.
          // The border-b sits on THIS element, outside the clipped row, so a
          // collapsed header still draws the line under the title.
          t && "zen-sticky zen-z-10",
          s
        ),
        style: t ? { top: "var(--zen-dynamic-page-title-h, 0px)" } : void 0,
        inert: o ? void 0 : !0,
        ...h,
        children: /* @__PURE__ */ r("div", { className: "zen-min-h-0 zen-overflow-hidden", children: /* @__PURE__ */ w("div", { className: "zen-flex zen-items-end zen-justify-between zen-gap-4 zen-px-4 zen-pb-3 zen-pt-1", children: [
          /* @__PURE__ */ r("div", { className: "zen-min-w-0 zen-flex-1", children: a }),
          f ? /* @__PURE__ */ r(
            "button",
            {
              type: "button",
              "aria-pressed": t,
              "aria-label": t ? d ?? m.t("dynamicPage.unpinHeader") : i ?? m.t("dynamicPage.pinHeader"),
              onClick: () => l(!t),
              className: N(
                "zen-inline-flex zen-h-7 zen-w-7 zen-shrink-0 zen-items-center zen-justify-center zen-rounded-zen-md zen-bg-transparent zen-text-zen-muted-fg zen-transition-colors hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                t && "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg"
              ),
              children: /* @__PURE__ */ r(R, { name: "lock", size: 14 })
            }
          ) : null
        ] }) })
      }
    );
  }
);
_.displayName = "DynamicPageHeader";
const $ = e.forwardRef(
  ({ className: s, children: a, ...z }, i) => {
    const { showFooter: d } = k("DynamicPageFooter");
    return d ? (
      // mt-auto pins the bar to the bottom when the content is too short to
      // fill the page; sticky keeps it there once the content overflows.
      // pointer-events-none on the rail so the floating bar's margins do not
      // swallow clicks meant for the content scrolling underneath it.
      /* @__PURE__ */ r("div", { className: "zen-pointer-events-none zen-sticky zen-bottom-0 zen-z-30 zen-mt-auto zen-shrink-0 zen-p-3", children: /* @__PURE__ */ r(
        "div",
        {
          ref: i,
          className: N(
            "zen-pointer-events-auto zen-flex zen-items-center zen-justify-end zen-gap-2 zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-3 zen-py-2 zen-shadow-lg",
            s
          ),
          ...z,
          children: a
        }
      ) })
    ) : null;
  }
);
$.displayName = "DynamicPageFooter";
export {
  F as DynamicPage,
  $ as DynamicPageFooter,
  _ as DynamicPageHeader,
  O as DynamicPageTitle
};
//# sourceMappingURL=index54.js.map
