import { template as _, spread as I, mergeProps as E, insert as s, createComponent as t, memo as z, use as v } from "solid-js/web";
import { splitProps as F, createSignal as G, untrack as V, createMemo as b, onMount as j, createEffect as q, on as H, Show as d, For as w, onCleanup as J } from "solid-js";
import { Button as D } from "./index5.js";
import { Icon as S } from "./index21.js";
import { DropdownMenu as K, DropdownMenuTrigger as N, DropdownMenuContent as Q, DropdownMenuSeparator as U, DropdownMenuItem as X } from "./index60.js";
import { cn as Y } from "./index106.js";
var Z = /* @__PURE__ */ _('<div class="zen-flex zen-min-w-0 zen-items-center zen-gap-2">'), ee = /* @__PURE__ */ _("<div>"), ne = /* @__PURE__ */ _('<div role=toolbar><div class="zen-ml-auto zen-flex zen-items-center zen-gap-2"></div><div aria-hidden=true class="zen-pointer-events-none zen-absolute zen-left-0 zen-top-0 zen-flex zen-gap-2 zen-opacity-0"style=visibility:hidden>'), k = /* @__PURE__ */ _('<span class="zen-h-5 zen-w-px zen-shrink-0 zen-bg-zen-border">');
const ce = (O) => {
  const [r, L] = F(O, ["actions", "overflowLabel", "size", "class", "children"]);
  let c, $, f, y;
  const [W, P] = G(V(() => r.actions.length)), R = b(() => r.actions.filter((e) => e.overflow === "never")), x = b(() => r.actions.filter((e) => e.overflow !== "never")), M = () => {
    if (!c || !f) return;
    const e = Array.from(f.children).map((u) => u.offsetWidth), o = 8, a = r.actions, g = R().reduce((u, m) => u + (e[a.indexOf(m)] ?? 0) + o, 0), h = (y?.offsetWidth ?? 36) + o, n = $?.offsetWidth ?? 0;
    let l = c.offsetWidth - n - g, i = 0;
    const p = x();
    for (const u of p) {
      const m = (e[a.indexOf(u)] ?? 0) + o, A = i < p.length - 1;
      if (l - m < (A ? h : 0)) break;
      l -= m, i++;
    }
    P(i);
  };
  j(() => {
    if (!c || typeof ResizeObserver > "u") return;
    M();
    const e = new ResizeObserver(() => M());
    e.observe(c), J(() => e.disconnect());
  }), q(H(() => r.actions, () => M()));
  const T = b(() => x().slice(0, W())), B = b(() => x().slice(W())), C = (e) => t(D, {
    type: "button",
    get size() {
      return r.size ?? "sm";
    },
    get variant() {
      return e.variant ?? "ghost";
    },
    get color() {
      return e.color;
    },
    get disabled() {
      return e.disabled;
    },
    onClick: () => e.onSelect?.(),
    get iconLeft() {
      return z(() => !!e.icon)() ? t(S, {
        get name() {
          return e.icon;
        },
        size: 14
      }) : void 0;
    },
    get children() {
      return e.label;
    }
  });
  return (() => {
    var e = ne(), o = e.firstChild, a = o.nextSibling, g = c;
    typeof g == "function" ? v(g, e) : c = e, I(e, E({
      get class() {
        return Y("zen-relative zen-flex zen-w-full zen-items-center zen-gap-2 zen-overflow-hidden", r.class);
      }
    }, L), !1, !0), s(e, t(d, {
      get when() {
        return r.children;
      },
      get children() {
        var n = Z(), l = $;
        return typeof l == "function" ? v(l, n) : $ = n, s(n, () => r.children), n;
      }
    }), o), s(o, t(w, {
      get each() {
        return R();
      },
      children: (n) => [t(d, {
        get when() {
          return n.separatorBefore;
        },
        get children() {
          return k();
        }
      }), z(() => C(n))]
    }), null), s(o, t(w, {
      get each() {
        return T();
      },
      children: (n) => [t(d, {
        get when() {
          return n.separatorBefore;
        },
        get children() {
          return k();
        }
      }), z(() => C(n))]
    }), null), s(o, t(d, {
      get when() {
        return B().length > 0;
      },
      get children() {
        var n = ee(), l = y;
        return typeof l == "function" ? v(l, n) : y = n, s(n, t(K, {
          get children() {
            return [t(N, {
              as: D,
              type: "button",
              get size() {
                return r.size ?? "sm";
              },
              variant: "ghost",
              get "aria-label"() {
                return r.overflowLabel ?? "More actions";
              },
              get children() {
                return t(S, {
                  name: "more",
                  size: 16
                });
              }
            }), t(Q, {
              align: "end",
              get children() {
                return t(w, {
                  get each() {
                    return B();
                  },
                  children: (i) => [t(d, {
                    get when() {
                      return i.separatorBefore;
                    },
                    get children() {
                      return t(U, {});
                    }
                  }), t(X, {
                    get disabled() {
                      return i.disabled;
                    },
                    onSelect: () => i.onSelect?.(),
                    get children() {
                      return [t(d, {
                        get when() {
                          return i.icon;
                        },
                        children: (p) => t(S, {
                          get name() {
                            return p();
                          },
                          size: 14,
                          class: "zen-mr-2"
                        })
                      }), z(() => i.label)];
                    }
                  })]
                });
              }
            })];
          }
        })), n;
      }
    }), null);
    var h = f;
    return typeof h == "function" ? v(h, a) : f = a, s(a, t(w, {
      get each() {
        return r.actions;
      },
      children: (n) => C(n)
    })), e;
  })();
};
export {
  ce as Toolbar
};
//# sourceMappingURL=index9.js.map
