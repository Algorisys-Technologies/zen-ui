import { createComponent as g, template as h, spread as H, mergeProps as D, insert as a, use as I, setAttribute as w, memo as N, effect as O, className as U, delegateEvents as q } from "solid-js/web";
import { splitProps as L, createUniqueId as X, createSignal as k, createMemo as F, createEffect as S, onMount as B, createContext as G, Show as $, useContext as J, onCleanup as j } from "solid-js";
import { Icon as A } from "./index21.js";
import { cn as _ } from "./index103.js";
var K = /* @__PURE__ */ h("<div>"), Q = /* @__PURE__ */ h('<div class="zen-mb-1 zen-min-w-0">'), V = /* @__PURE__ */ h('<p class="zen-m-0 zen-px-1 zen-text-sm zen-text-zen-muted-fg">'), W = /* @__PURE__ */ h('<div class="zen-flex zen-shrink-0 zen-items-center zen-gap-2">'), Y = /* @__PURE__ */ h('<div><div class="zen-flex zen-items-start zen-justify-between zen-gap-4"><div class="zen-min-w-0 zen-flex-1"><h2 class=zen-m-0><button type=button class="zen-group zen-inline-flex zen-max-w-full zen-items-center zen-gap-1.5 zen-rounded-zen-md zen-bg-transparent zen-px-1 zen-py-0.5 zen-text-lg zen-font-semibold zen-leading-tight zen-text-zen-foreground zen-transition-colors hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring"><span class=zen-truncate>'), Z = /* @__PURE__ */ h("<button type=button>"), ee = /* @__PURE__ */ h('<div role=region><div class="zen-min-h-0 zen-overflow-hidden"><div class="zen-flex zen-items-end zen-justify-between zen-gap-4 zen-px-4 zen-pb-3 zen-pt-1"><div class="zen-min-w-0 zen-flex-1">'), ne = /* @__PURE__ */ h('<div class="zen-pointer-events-none zen-sticky zen-bottom-0 zen-z-30 zen-mt-auto zen-shrink-0 zen-p-3"><div>');
const R = 8, M = G(null);
function T(z) {
  const n = J(M);
  if (!n) throw new Error(`<${z}> must be used within a <DynamicPage>`);
  return n;
}
const ie = (z) => {
  const [n, s] = L(z, ["headerExpanded", "defaultHeaderExpanded", "onHeaderExpandedChange", "headerPinnable", "showFooter", "class", "children"]);
  let d;
  const u = X(), [r, b] = k(null), [i, f] = k(null), [l, v] = k(n.defaultHeaderExpanded ?? !0), o = F(() => n.headerExpanded ?? l()), m = (t) => {
    n.headerExpanded === void 0 && v(t), n.onHeaderExpandedChange?.(t);
  }, [e, c] = k(!1), x = F(() => n.headerPinnable ?? !0), E = F(() => n.showFooter ?? !0);
  S(() => {
    !x() && e() && c(!1);
  }), B(() => {
    const t = d;
    if (!t) return;
    const p = () => {
      if (e()) return;
      const y = t.scrollTop;
      if (y <= 0) {
        m(!0);
        return;
      }
      if (y <= R) return;
      const C = i()?.offsetHeight ?? 0;
      t.scrollHeight - t.clientHeight - C <= R || m(!1);
    };
    t.addEventListener("scroll", p, {
      passive: !0
    }), j(() => t.removeEventListener("scroll", p));
  }), S(() => {
    const t = r(), p = d;
    if (!p || !t || typeof ResizeObserver > "u") return;
    const y = () => p.style.setProperty("--zen-dynamic-page-title-h", `${t.offsetHeight}px`);
    y();
    const C = new ResizeObserver(y);
    C.observe(t), j(() => C.disconnect());
  });
  const P = {
    headerExpanded: o,
    setHeaderExpanded: m,
    pinned: e,
    setPinned: c,
    headerPinnable: x,
    showFooter: E,
    headerId: u,
    setTitleEl: b,
    setHeaderEl: f
  };
  return g(M.Provider, {
    value: P,
    get children() {
      var t = K(), p = d;
      return typeof p == "function" ? I(p, t) : d = t, H(t, D({
        get "data-header-expanded"() {
          return o() || void 0;
        },
        get "data-header-pinned"() {
          return e() || void 0;
        },
        get class() {
          return _(
            "zen-relative zen-flex zen-h-full zen-flex-col zen-overflow-y-auto zen-bg-zen-background zen-text-zen-foreground",
            // Scroll anchoring would "helpfully" subtract the collapsing header's
            // height from scrollTop, dropping us back to 0, which re-expands the
            // header — the snap would undo itself.
            "zen-[overflow-anchor:none]",
            n.class
          );
        }
      }, s), !1, !0), a(t, () => n.children), t;
    }
  });
}, le = (z) => {
  const {
    headerExpanded: n,
    setHeaderExpanded: s,
    headerId: d,
    setTitleEl: u
  } = T("DynamicPageTitle"), [r, b] = L(z, ["heading", "subheading", "actions", "breadcrumbs", "expandedContent", "snappedContent", "class", "children"]);
  return (() => {
    var i = Y(), f = i.firstChild, l = f.firstChild, v = l.firstChild, o = v.firstChild, m = o.firstChild;
    return I((e) => u(e), i), H(i, D({
      get "data-state"() {
        return n() ? "expanded" : "snapped";
      },
      get class() {
        return _(
          // Sticky at ALL times — only the header below it ever collapses.
          "zen-sticky zen-top-0 zen-z-20 zen-shrink-0 zen-bg-zen-background zen-px-4 zen-pb-2 zen-pt-3",
          r.class
        );
      }
    }, b), !1, !0), a(i, g($, {
      get when() {
        return r.breadcrumbs;
      },
      get children() {
        var e = Q();
        return a(e, () => r.breadcrumbs), e;
      }
    }), f), o.$$click = () => s(!n()), w(o, "aria-controls", d), a(m, () => r.heading), a(o, g(A, {
      get name() {
        return n() ? "chevron-up" : "chevron-down";
      },
      size: 16,
      class: "zen-shrink-0 zen-text-zen-muted-fg"
    }), null), a(l, g($, {
      get when() {
        return r.subheading;
      },
      get children() {
        var e = V();
        return a(e, () => r.subheading), e;
      }
    }), null), a(l, (() => {
      var e = N(() => !!n());
      return () => e() ? r.expandedContent : r.snappedContent;
    })(), null), a(l, () => r.children, null), a(f, g($, {
      get when() {
        return r.actions;
      },
      get children() {
        var e = W();
        return a(e, () => r.actions), e;
      }
    }), null), O(() => w(o, "aria-expanded", n())), i;
  })();
}, oe = (z) => {
  const {
    headerExpanded: n,
    pinned: s,
    setPinned: d,
    headerPinnable: u,
    headerId: r,
    setHeaderEl: b
  } = T("DynamicPageHeader"), [i, f] = L(z, ["class", "children", "aria-label", "pinLabel", "unpinLabel"]);
  return (() => {
    var l = ee(), v = l.firstChild, o = v.firstChild, m = o.firstChild;
    return I((e) => b(e), l), w(l, "id", r), H(l, D({
      get "aria-label"() {
        return i["aria-label"] ?? "Page header";
      },
      get "data-state"() {
        return n() ? "expanded" : "collapsed";
      },
      get class() {
        return _(
          // 1fr → 0fr on a grid row collapses to zero without anyone measuring the
          // content, and animates, which `height: auto` cannot.
          //
          // The transition-property is spelled as an arbitrary PROPERTY
          // (`zen-[transition-property:…]`), not as `zen-transition-[…]`. Uno has no
          // arbitrary-value form of its `transition-*` rule, so the latter matched
          // nothing and this header collapsed instantly — the one thing the comment
          // above says it does not do. Pinned by check:css-live.
          "zen-grid zen-shrink-0 zen-overflow-hidden zen-border-b zen-border-zen-border zen-bg-zen-background zen-[transition-property:grid-template-rows] zen-duration-200 zen-ease-out",
          n() ? "zen-grid-rows-[1fr]" : "zen-grid-rows-[0fr]",
          // Pinned: ride along under the sticky title instead of scrolling away.
          // The border-b sits on THIS element, outside the clipped row, so a
          // collapsed header still draws the line under the title.
          s() && "zen-sticky zen-z-10",
          i.class
        );
      },
      get style() {
        return s() ? {
          top: "var(--zen-dynamic-page-title-h, 0px)"
        } : void 0;
      },
      get inert() {
        return n() ? void 0 : !0;
      }
    }, f), !1, !0), a(m, () => i.children), a(o, g($, {
      get when() {
        return u();
      },
      get children() {
        var e = Z();
        return e.$$click = () => d(!s()), a(e, g(A, {
          name: "lock",
          size: 14
        })), O((c) => {
          var x = s(), E = s() ? i.unpinLabel ?? "Unpin header" : i.pinLabel ?? "Pin header", P = _("zen-inline-flex zen-h-7 zen-w-7 zen-shrink-0 zen-items-center zen-justify-center zen-rounded-zen-md zen-bg-transparent zen-text-zen-muted-fg zen-transition-colors hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring", s() && "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg");
          return x !== c.e && w(e, "aria-pressed", c.e = x), E !== c.t && w(e, "aria-label", c.t = E), P !== c.a && U(e, c.a = P), c;
        }, {
          e: void 0,
          t: void 0,
          a: void 0
        }), e;
      }
    }), null), l;
  })();
}, de = (z) => {
  const {
    showFooter: n
  } = T("DynamicPageFooter"), [s, d] = L(z, ["class", "children"]);
  return g($, {
    get when() {
      return n();
    },
    get children() {
      var u = ne(), r = u.firstChild;
      return H(r, D({
        get class() {
          return _("zen-pointer-events-auto zen-flex zen-items-center zen-justify-end zen-gap-2 zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-3 zen-py-2 zen-shadow-lg", s.class);
        }
      }, d), !1, !0), a(r, () => s.children), u;
    }
  });
};
q(["click"]);
export {
  ie as DynamicPage,
  de as DynamicPageFooter,
  oe as DynamicPageHeader,
  le as DynamicPageTitle
};
//# sourceMappingURL=index14.js.map
