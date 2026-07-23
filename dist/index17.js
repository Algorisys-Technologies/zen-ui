import { template as s, insert as i, createComponent as l, effect as m, setAttribute as f, className as k, delegateEvents as B } from "solid-js/web";
import { createSignal as h, Show as a, For as D } from "solid-js";
import { Button as b } from "./index5.js";
import { SelectDialog as G } from "./index15.js";
import { cn as v } from "./index103.js";
var A = /* @__PURE__ */ s('<button type=button class="zen-inline-flex zen-h-7 zen-w-7 zen-shrink-0 zen-cursor-pointer zen-items-center zen-justify-center zen-rounded-zen-sm zen-border-0 zen-bg-transparent zen-text-zen-muted-fg hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring"><svg width=14 height=14 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round aria-hidden=true><polyline points="9 18 15 12 9 6">'), F = /* @__PURE__ */ s("<div>"), O = /* @__PURE__ */ s('<div><div class="zen-flex zen-items-center zen-gap-2"><div class="zen-ml-auto zen-flex zen-items-center zen-gap-2">'), j = /* @__PURE__ */ s('<p class="zen-m-0 zen-py-2 zen-text-sm zen-text-zen-muted-fg">No filters shown. Use <!> to add some.'), N = /* @__PURE__ */ s('<label class="zen-flex zen-flex-col zen-gap-1"><span class="zen-text-xs zen-font-medium zen-text-zen-muted-fg">');
const V = "zen-[grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]", K = (e) => {
  const [u, y] = h(e.defaultExpanded ?? !0), [I, x] = h(!1), [E, L] = h(
    // eslint-disable-next-line solid/reactivity
    e.fields.filter((r) => !r.hiddenByDefault).map((r) => r.id)
  ), C = () => e.visibleIds !== void 0, p = () => C() ? e.visibleIds : E(), S = (r) => {
    C() || L(r), e.onVisibleIdsChange?.(r);
  }, w = () => e.fields.filter((r) => p().includes(r.id)), z = () => e.adaptLabel ?? "Adapt filters";
  return (() => {
    var r = O(), g = r.firstChild, d = g.firstChild;
    return i(g, l(a, {
      get when() {
        return e.collapsible ?? !0;
      },
      get children() {
        var n = A(), o = n.firstChild;
        return n.$$click = () => y((t) => !t), m((t) => {
          var c = u(), $ = u() ? "Collapse filters" : "Expand filters", _ = v("zen-transition-transform", u() && "zen-rotate-90");
          return c !== t.e && f(n, "aria-expanded", t.e = c), $ !== t.t && f(n, "aria-label", t.t = $), _ !== t.a && f(o, "class", t.a = _), t;
        }, {
          e: void 0,
          t: void 0,
          a: void 0
        }), n;
      }
    }), d), i(g, () => e.variant, d), i(d, l(a, {
      get when() {
        return e.adaptable ?? !0;
      },
      get children() {
        return l(b, {
          type: "button",
          variant: "ghost",
          color: "neutral",
          size: "sm",
          onClick: () => x(!0),
          get children() {
            return z();
          }
        });
      }
    }), null), i(d, l(a, {
      get when() {
        return e.onClear;
      },
      get children() {
        return l(b, {
          type: "button",
          variant: "outline",
          color: "neutral",
          size: "sm",
          onClick: () => e.onClear?.(),
          get children() {
            return e.clearLabel ?? "Clear";
          }
        });
      }
    }), null), i(d, l(a, {
      get when() {
        return e.onGo;
      },
      get children() {
        return l(b, {
          type: "button",
          size: "sm",
          onClick: () => e.onGo?.(),
          get children() {
            return e.goLabel ?? "Go";
          }
        });
      }
    }), null), i(r, l(a, {
      get when() {
        return u();
      },
      get children() {
        return l(a, {
          get when() {
            return w().length;
          },
          get fallback() {
            return (() => {
              var n = j(), o = n.firstChild, t = o.nextSibling;
              return t.nextSibling, i(n, z, t), n;
            })();
          },
          get children() {
            var n = F();
            return i(n, l(D, {
              get each() {
                return w();
              },
              children: (o) => (() => {
                var t = N(), c = t.firstChild;
                return i(c, () => o.label), i(t, () => o.render(), null), t;
              })()
            })), m(() => k(n, v("zen-grid zen-gap-3", V))), n;
          }
        });
      }
    }), null), i(r, l(a, {
      get when() {
        return e.adaptable ?? !0;
      },
      get children() {
        return l(G, {
          get open() {
            return I();
          },
          onOpenChange: x,
          get title() {
            return z();
          },
          description: "Choose which filters appear on the bar.",
          get items() {
            return e.fields.map((n) => ({
              id: n.id,
              label: n.label
            }));
          },
          multiple: !0,
          get selectedIds() {
            return p();
          },
          onConfirm: S
        });
      }
    }), null), m(() => k(r, v("zen-flex zen-flex-col zen-gap-3 zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-4 zen-py-3", e.class))), r;
  })();
};
B(["click"]);
export {
  K as FilterBar
};
//# sourceMappingURL=index17.js.map
