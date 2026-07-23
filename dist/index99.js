import { template as z, spread as u, mergeProps as c, createComponent as a, Dynamic as h, memo as _, insert as g, effect as y, className as B, setAttribute as I } from "solid-js/web";
import { splitProps as i, createSignal as C, createMemo as O, createContext as T, mergeProps as m, Show as x, createEffect as j, children as L, useContext as A } from "solid-js";
import { Popover as E, PopoverTrigger as G, PopoverContent as H } from "./index56.js";
import { cn as o } from "./index106.js";
var D = /* @__PURE__ */ z("<aside>"), p = /* @__PURE__ */ z("<div>"), k = /* @__PURE__ */ z("<ul>"), P = /* @__PURE__ */ z("<li>"), F = /* @__PURE__ */ z('<svg width=14 height=14 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round aria-hidden=true><polyline points="9 18 15 12 9 6">'), w = /* @__PURE__ */ z("<span>"), N = /* @__PURE__ */ z('<div class="zen-px-2 zen-pb-1.5 zen-text-xs zen-font-semibold zen-text-zen-muted-fg">'), U = /* @__PURE__ */ z('<ul class="zen-mb-0 zen-ml-4 zen-mr-0 zen-mt-0.5 zen-flex zen-list-none zen-flex-col zen-gap-0.5 zen-border-0 zen-border-l zen-border-solid zen-border-zen-border zen-pb-0 zen-pl-3 zen-pr-0 zen-pt-0">'), q = /* @__PURE__ */ z('<svg width=18 height=18 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 aria-hidden=true><line x1=3 y1=6 x2=21 y2=6></line><line x1=3 y1=12 x2=21 y2=12></line><line x1=3 y1=18 x2=21 y2=18>');
const M = T(null);
function b() {
  const n = A(M);
  if (!n) throw new Error("useSidebar must be used within a <SidebarProvider>");
  return n;
}
function Y(n) {
  const [r, e] = C(n.defaultCollapsed ?? !1), t = O(() => n.collapsed ?? r()), l = (d) => {
    n.collapsed === void 0 && e(d), n.onCollapsedChange?.(d);
  }, f = {
    collapsed: t,
    setCollapsed: l,
    toggle: () => l(!t())
  };
  return a(M.Provider, {
    value: f,
    get children() {
      return n.children;
    }
  });
}
const Z = (n) => {
  const {
    collapsed: r
  } = b(), [e, t] = i(n, ["class"]);
  return (() => {
    var l = D();
    return u(l, c({
      get "data-collapsed"() {
        return r() || void 0;
      },
      get class() {
        return o("zen-flex zen-h-full zen-flex-col zen-border-r zen-border-zen-border zen-bg-zen-background zen-text-zen-foreground zen-transition-[width] zen-duration-200 zen-ease-in-out", r() ? "zen-w-16" : "zen-w-64", e.class);
      }
    }, t), !1, !1), l;
  })();
}, ee = (n) => {
  const [r, e] = i(n, ["class"]);
  return (() => {
    var t = p();
    return u(t, c({
      get class() {
        return o("zen-flex zen-items-center zen-gap-2 zen-p-3", r.class);
      }
    }, e), !1, !1), t;
  })();
}, ne = (n) => {
  const [r, e] = i(n, ["class"]);
  return (() => {
    var t = p();
    return u(t, c({
      get class() {
        return o("zen-flex zen-min-h-0 zen-flex-1 zen-flex-col zen-gap-1 zen-overflow-y-auto zen-p-2", r.class);
      }
    }, e), !1, !1), t;
  })();
}, te = (n) => {
  const [r, e] = i(n, ["class"]);
  return (() => {
    var t = p();
    return u(t, c({
      get class() {
        return o("zen-mt-auto zen-flex zen-items-center zen-gap-2 zen-border-t zen-border-zen-border zen-p-3", r.class);
      }
    }, e), !1, !1), t;
  })();
}, re = (n) => {
  const [r, e] = i(n, ["class"]);
  return (() => {
    var t = p();
    return u(t, c({
      get class() {
        return o("zen-flex zen-flex-col zen-gap-1 zen-py-2", r.class);
      }
    }, e), !1, !1), t;
  })();
}, se = (n) => {
  const {
    collapsed: r
  } = b(), [e, t] = i(n, ["class"]);
  return (() => {
    var l = p();
    return u(l, c({
      get class() {
        return o("zen-px-3 zen-py-1 zen-text-xs zen-font-medium zen-uppercase zen-tracking-wide zen-text-zen-muted-fg", r() && "zen-sr-only", e.class);
      }
    }, t), !1, !1), l;
  })();
}, le = (n) => {
  const [r, e] = i(n, ["class"]);
  return (
    // The list reset is the component's own job: zen-ui ships no element reset
    // (it is opt-in via /preflight), so without this the browser default
    // `list-style: disc` + `padding-inline-start: 40px` apply. That 40px ate the
    // collapsed rail — 64px wide, less 16px of padding, less 40px, left 8px of
    // room for a 16px icon.
    (() => {
      var t = k();
      return u(t, c({
        get class() {
          return o("zen-m-0 zen-flex zen-w-full zen-list-none zen-flex-col zen-gap-0.5 zen-p-0", r.class);
        }
      }, e), !1, !1), t;
    })()
  );
}, oe = (n) => {
  const [r, e] = i(n, ["class"]);
  return (() => {
    var t = P();
    return u(t, c({
      get class() {
        return o("zen-w-full", r.class);
      }
    }, e), !1, !1), t;
  })();
}, $ = (n) => {
  const {
    collapsed: r
  } = b(), e = m({
    as: "button",
    active: !1
  }, n), [t, l] = i(e, ["as", "class", "active"]);
  return a(h, c({
    get component() {
      return t.as;
    },
    get "data-active"() {
      return t.active || void 0;
    },
    get class() {
      return o(
        "zen-flex zen-w-full zen-items-center zen-gap-2 zen-rounded-zen-md zen-px-3 zen-py-2 zen-text-sm zen-font-medium zen-transition-colors",
        "hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
        "[&>svg]:zen-size-4 [&>svg]:zen-shrink-0",
        t.active && "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg",
        // sr-only, not hidden: `display: none` drops the label out of the
        // accessibility tree, which left a collapsed rail as a column of
        // buttons with no accessible name at all. Matches SidebarGroupLabel.
        r() && "zen-relative zen-justify-center zen-px-0 [&>span]:zen-sr-only",
        t.class
      );
    }
  }, l));
}, J = (
  // Every side is set explicitly: `zen-m-0`/`zen-p-0` plus a directional
  // `zen-ml-4` are the same specificity, so which one wins would come down to
  // UnoCSS's emit order rather than intent.
  "zen-mb-0 zen-ml-4 zen-mr-0 zen-mt-0.5 zen-flex zen-list-none zen-flex-col zen-gap-0.5 zen-border-0 zen-border-l zen-border-solid zen-border-zen-border zen-pb-0 zen-pl-3 zen-pr-0 zen-pt-0"
), K = (n) => (() => {
  var r = F();
  return y(() => I(r, "class", o("zen-ml-auto zen-transition-transform", n.open && "zen-rotate-90"))), r;
})(), ae = (n) => {
  const {
    collapsed: r
  } = b(), e = m({
    defaultOpen: !1,
    active: !1
  }, n), [t, l] = C(e.defaultOpen), f = () => e.open !== void 0, d = () => f() ? e.open : t(), v = (s) => {
    f() || l(s), e.onOpenChange?.(s);
  };
  j(() => {
    r() && v(!1);
  });
  const S = L(() => e.children);
  return a(x, {
    get when() {
      return r();
    },
    get fallback() {
      return [a($, {
        get active() {
          return e.active;
        },
        get class() {
          return e.class;
        },
        get "aria-expanded"() {
          return d();
        },
        onClick: () => v(!d()),
        get children() {
          return [_(() => e.icon), (() => {
            var s = w();
            return g(s, () => e.label), s;
          })(), a(K, {
            get open() {
              return d();
            }
          })];
        }
      }), a(x, {
        get when() {
          return d();
        },
        get children() {
          var s = U();
          return g(s, S), s;
        }
      })];
    },
    get children() {
      return a(E, {
        get open() {
          return d();
        },
        onOpenChange: v,
        placement: "right-start",
        get children() {
          return [a(G, {
            as: $,
            get active() {
              return e.active;
            },
            get class() {
              return e.class;
            },
            get children() {
              return [_(() => e.icon), (() => {
                var s = w();
                return g(s, () => e.label), s;
              })()];
            }
          }), a(H, {
            class: "zen-w-56 zen-p-2",
            get children() {
              return [(() => {
                var s = N();
                return g(s, () => e.label), s;
              })(), (() => {
                var s = k();
                return g(s, S), y(() => B(s, o(J, "zen-ml-0 zen-border-l-0 zen-pl-0"))), s;
              })()];
            }
          })];
        }
      });
    }
  });
}, ce = (n) => {
  const [r, e] = i(n, ["class"]);
  return (() => {
    var t = P();
    return u(t, c({
      get class() {
        return o("zen-w-full", r.class);
      }
    }, e), !1, !1), t;
  })();
}, ie = (n) => {
  const r = m({
    as: "button",
    active: !1
  }, n), [e, t] = i(r, ["as", "class", "active"]);
  return a(h, c({
    get component() {
      return e.as;
    },
    get "data-active"() {
      return e.active || void 0;
    },
    get class() {
      return o("zen-flex zen-w-full zen-items-center zen-gap-2 zen-rounded-zen-md zen-px-3 zen-py-1.5 zen-text-sm zen-no-underline zen-transition-colors", "hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring", "[&>svg]:zen-size-4 [&>svg]:zen-shrink-0", e.active ? "zen-bg-zen-primary-soft zen-font-medium zen-text-zen-primary-soft-fg" : "zen-text-zen-foreground", e.class);
    }
  }, t));
};
function Q(n, r) {
  n && (typeof n == "function" ? n(r) : n[0](n[1], r));
}
const ze = (n) => {
  const {
    toggle: r
  } = b(), e = m({
    as: "button"
  }, n), [t, l] = i(e, ["as", "class", "onClick", "children"]);
  return a(h, c({
    get component() {
      return t.as;
    },
    "aria-label": "Toggle sidebar",
    onClick: (f) => {
      Q(t.onClick, f), r();
    },
    get class() {
      return o("zen-inline-flex zen-h-9 zen-w-9 zen-items-center zen-justify-center zen-rounded-zen-md zen-text-zen-foreground zen-transition-colors hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2", t.class);
    }
  }, l, {
    get children() {
      return a(x, {
        get when() {
          return t.children;
        },
        get fallback() {
          return q();
        },
        get children() {
          return t.children;
        }
      });
    }
  }));
};
export {
  Z as Sidebar,
  ne as SidebarContent,
  te as SidebarFooter,
  re as SidebarGroup,
  se as SidebarGroupLabel,
  ee as SidebarHeader,
  le as SidebarMenu,
  $ as SidebarMenuButton,
  oe as SidebarMenuItem,
  ae as SidebarMenuSub,
  ie as SidebarMenuSubButton,
  ce as SidebarMenuSubItem,
  Y as SidebarProvider,
  ze as SidebarTrigger,
  b as useSidebar
};
//# sourceMappingURL=index99.js.map
