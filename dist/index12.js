import { template as d, spread as he, mergeProps as ge, insert as l, createComponent as e, memo as z, setAttribute as te, use as C, delegateEvents as ze } from "solid-js/web";
import { splitProps as fe, createUniqueId as me, createSignal as R, createMemo as k, untrack as pe, onMount as be, createEffect as re, on as le, Show as s, For as S, onCleanup as ve } from "solid-js";
import { Button as h } from "./index5.js";
import { Icon as u } from "./index21.js";
import { Input as ae } from "./index61.js";
import { Avatar as we, AvatarImage as $e, AvatarFallback as xe } from "./index43.js";
import { DropdownMenu as H, DropdownMenuTrigger as V, DropdownMenuContent as j, DropdownMenuItem as ie, DropdownMenuLabel as _e, DropdownMenuSeparator as se } from "./index57.js";
import { cn as ye } from "./index103.js";
var Ce = /* @__PURE__ */ d('<span class="zen-truncate zen-text-sm zen-font-semibold zen-text-zen-foreground">'), ke = /* @__PURE__ */ d('<span class="zen-truncate zen-text-xs zen-text-zen-muted-fg">'), Se = /* @__PURE__ */ d('<span class="zen-flex zen-min-w-0 zen-flex-col zen-items-start zen-leading-tight">'), Ie = /* @__PURE__ */ d("<div>"), Te = /* @__PURE__ */ d('<span class="zen-relative zen-flex zen-shrink-0">'), Me = /* @__PURE__ */ d('<div class="zen-absolute zen-inset-0 zen-z-10 zen-flex zen-items-center zen-gap-2 zen-bg-zen-background"><form role=search class="zen-relative zen-flex zen-flex-1 zen-items-center"><label class=zen-sr-only>'), Le = /* @__PURE__ */ d('<header><div class="zen-relative zen-flex zen-h-14 zen-w-full zen-items-center zen-gap-2 zen-overflow-hidden"><div class="zen-flex zen-min-w-0 zen-shrink-0 zen-items-center zen-gap-2"></div><div class="zen-ml-auto zen-flex zen-shrink-0 zen-items-center zen-gap-2"><div class="zen-flex zen-items-center zen-gap-2"></div><div class="zen-flex zen-shrink-0 zen-items-center zen-gap-2"></div></div><div aria-hidden=true class="zen-pointer-events-none zen-absolute zen-left-0 zen-top-0 zen-flex zen-gap-2 zen-opacity-0"style=visibility:hidden>'), Re = /* @__PURE__ */ d('<span class="zen-flex zen-shrink-0 zen-items-center">'), We = /* @__PURE__ */ d('<form role=search class="zen-relative zen-flex zen-items-center"><label class=zen-sr-only>'), qe = /* @__PURE__ */ d('<span aria-hidden=true class="zen-pointer-events-none zen-absolute -zen-end-1 -zen-top-1 zen-flex zen-h-4 zen-min-w-4 zen-items-center zen-justify-center zen-rounded-zen-full zen-bg-zen-error zen-px-1 zen-text-xs zen-font-semibold zen-leading-none zen-text-zen-error-fg">');
const Ae = 640, De = (W) => W.trim().split(/\s+/).slice(0, 2).map((t) => t[0]?.toUpperCase() ?? "").join(""), je = (W) => {
  const [t, oe] = fe(W, ["logo", "primaryTitle", "secondaryTitle", "menuItems", "searchable", "onSearch", "searchPlaceholder", "notificationCount", "onNotificationsClick", "profile", "items", "onLogoClick", "overflowLabel", "class", "children", "aria-label"]);
  let m, q, A, I, D, E;
  const T = me(), [O, U] = R(""), [M, ce] = R(!1), [G, P] = R(!1), w = k(() => t.items ?? []), $ = () => t.searchPlaceholder ?? "Search", [J, ue] = R(pe(() => w().length)), K = k(() => w().filter((r) => r.overflow === "never")), N = k(() => w().filter((r) => r.overflow !== "never")), B = () => {
    if (!m || !I) return;
    const r = m.offsetWidth;
    ce(r < Ae);
    const i = Array.from(I.children).map((n) => n.offsetWidth), c = 8, x = w(), p = q?.offsetWidth ?? 0, f = A?.offsetWidth ?? 0, b = (D?.offsetWidth ?? 32) + c, L = K().reduce((n, a) => n + (i[x.indexOf(a)] ?? 0) + c, 0);
    let _ = r - p - f - L - c, v = 0;
    const y = N();
    for (const n of y) {
      const a = (i[x.indexOf(n)] ?? 0) + c, o = v < y.length - 1;
      if (_ - a < (o ? b : 0)) break;
      _ -= a, v++;
    }
    ue(v);
  };
  be(() => {
    if (!m || typeof ResizeObserver > "u") return;
    B();
    const r = new ResizeObserver(() => B());
    r.observe(m), ve(() => r.disconnect());
  }), re(le([() => t.items, M], () => B())), re(le(M, (r) => {
    r || P(!1);
  }));
  const de = k(() => N().slice(0, J())), Q = k(() => N().slice(J())), X = (r) => {
    r.preventDefault(), t.onSearch?.(O());
  }, Y = () => {
    P(!1), queueMicrotask(() => E?.focus());
  }, F = (r) => e(h, {
    type: "button",
    variant: "ghost",
    color: "neutral",
    size: "sm",
    shape: "square",
    get "aria-label"() {
      return r.label;
    },
    get disabled() {
      return r.disabled;
    },
    onClick: () => r.onSelect?.(),
    get children() {
      return e(u, {
        get name() {
          return r.icon;
        },
        size: 16
      });
    }
  }), Z = (r) => e(S, {
    each: r,
    children: (i) => [e(s, {
      get when() {
        return i.separatorBefore;
      },
      get children() {
        return e(se, {});
      }
    }), e(ie, {
      get disabled() {
        return i.disabled;
      },
      onSelect: () => i.onSelect?.(),
      get children() {
        return [e(s, {
          get when() {
            return i.icon;
          },
          children: (c) => e(u, {
            get name() {
              return c();
            },
            size: 14,
            class: "zen-mr-2"
          })
        }), z(() => i.label)];
      }
    })]
  }), ee = () => (() => {
    var r = Se();
    return l(r, e(s, {
      get when() {
        return t.primaryTitle;
      },
      get children() {
        var i = Ce();
        return l(i, () => t.primaryTitle), i;
      }
    }), null), l(r, e(s, {
      get when() {
        return t.secondaryTitle;
      },
      get children() {
        var i = ke();
        return l(i, () => t.secondaryTitle), i;
      }
    }), null), r;
  })(), ne = () => e(we, {
    size: "sm",
    get children() {
      return [e(s, {
        get when() {
          return t.profile?.image;
        },
        children: (r) => e($e, {
          get src() {
            return r();
          },
          alt: ""
        })
      }), e(xe, {
        get children() {
          return t.profile?.initials ?? De(t.profile?.name ?? "");
        }
      })];
    }
  });
  return (() => {
    var r = Le(), i = r.firstChild, c = i.firstChild, x = c.nextSibling, p = x.firstChild, f = p.nextSibling, b = x.nextSibling;
    he(r, ge({
      get "aria-label"() {
        return t["aria-label"] ?? t.primaryTitle ?? "Application header";
      },
      get class() {
        return ye("zen-w-full zen-border-b zen-border-zen-border zen-bg-zen-background zen-px-3", t.class);
      }
    }, oe), !1, !0);
    var L = m;
    typeof L == "function" ? C(L, i) : m = i;
    var _ = q;
    typeof _ == "function" ? C(_, c) : q = c, l(c, e(s, {
      get when() {
        return t.logo;
      },
      get children() {
        return e(s, {
          get when() {
            return t.onLogoClick;
          },
          get fallback() {
            return (() => {
              var n = Re();
              return l(n, () => t.logo), n;
            })();
          },
          get children() {
            return e(h, {
              type: "button",
              variant: "ghost",
              color: "neutral",
              size: "sm",
              shape: "square",
              "aria-label": "Home",
              onClick: () => t.onLogoClick?.(),
              get children() {
                return t.logo;
              }
            });
          }
        });
      }
    }), null), l(c, e(s, {
      get when() {
        return z(() => !!t.menuItems)() && t.menuItems.length > 0;
      },
      get fallback() {
        return ee();
      },
      get children() {
        return e(H, {
          get children() {
            return [e(V, {
              as: h,
              type: "button",
              variant: "ghost",
              color: "neutral",
              size: "sm",
              class: "zen-min-w-0 zen-px-2",
              get iconRight() {
                return e(u, {
                  name: "chevron-down",
                  size: 14
                });
              },
              get children() {
                return ee();
              }
            }), e(j, {
              align: "start",
              get children() {
                return Z(t.menuItems ?? []);
              }
            })];
          }
        });
      }
    }), null), l(c, () => t.children, null), l(p, e(S, {
      get each() {
        return K();
      },
      children: (n) => F(n)
    }), null), l(p, e(S, {
      get each() {
        return de();
      },
      children: (n) => F(n)
    }), null), l(p, e(s, {
      get when() {
        return Q().length > 0;
      },
      get children() {
        var n = Ie(), a = D;
        return typeof a == "function" ? C(a, n) : D = n, l(n, e(H, {
          get children() {
            return [e(V, {
              as: h,
              type: "button",
              variant: "ghost",
              color: "neutral",
              size: "sm",
              shape: "square",
              get "aria-label"() {
                return t.overflowLabel ?? "More actions";
              },
              get children() {
                return e(u, {
                  name: "more",
                  size: 16
                });
              }
            }), e(j, {
              align: "end",
              get children() {
                return e(S, {
                  get each() {
                    return Q();
                  },
                  children: (o) => e(ie, {
                    get disabled() {
                      return o.disabled;
                    },
                    onSelect: () => o.onSelect?.(),
                    get children() {
                      return [e(u, {
                        get name() {
                          return o.icon;
                        },
                        size: 14,
                        class: "zen-mr-2"
                      }), z(() => o.label)];
                    }
                  })
                });
              }
            })];
          }
        })), n;
      }
    }), null);
    var v = A;
    typeof v == "function" ? C(v, f) : A = f, l(f, e(s, {
      get when() {
        return t.searchable;
      },
      get children() {
        return e(s, {
          get when() {
            return M();
          },
          get fallback() {
            return (() => {
              var n = We(), a = n.firstChild;
              return n.addEventListener("submit", X), te(a, "for", T), l(a, $), l(n, e(u, {
                name: "search",
                size: 14,
                class: "zen-pointer-events-none zen-absolute zen-start-2 zen-text-zen-muted-fg"
              }), null), l(n, e(ae, {
                id: T,
                type: "search",
                get value() {
                  return O();
                },
                get placeholder() {
                  return $();
                },
                onInput: (o) => U(o.currentTarget.value),
                class: "zen-h-8 zen-w-48 zen-pl-7"
              }), null), n;
            })();
          },
          get children() {
            return e(h, {
              ref(n) {
                var a = E;
                typeof a == "function" ? a(n) : E = n;
              },
              type: "button",
              variant: "ghost",
              color: "neutral",
              size: "sm",
              shape: "square",
              get "aria-label"() {
                return $();
              },
              get "aria-expanded"() {
                return G();
              },
              onClick: () => P((n) => !n),
              get children() {
                return e(u, {
                  name: "search",
                  size: 16
                });
              }
            });
          }
        });
      }
    }), null), l(f, e(s, {
      get when() {
        return t.notificationCount !== void 0 || t.onNotificationsClick;
      },
      get children() {
        var n = Te();
        return l(n, e(h, {
          type: "button",
          variant: "ghost",
          color: "neutral",
          size: "sm",
          shape: "square",
          get "aria-label"() {
            return z(() => !!t.notificationCount)() ? `Notifications, ${t.notificationCount} unread` : "Notifications";
          },
          onClick: () => t.onNotificationsClick?.(),
          get children() {
            return e(u, {
              name: "bell",
              size: 16
            });
          }
        }), null), l(n, e(s, {
          get when() {
            return t.notificationCount;
          },
          children: (a) => (() => {
            var o = qe();
            return l(o, (() => {
              var g = z(() => a() > 99);
              return () => g() ? "99+" : a();
            })()), o;
          })()
        }), null), n;
      }
    }), null), l(f, e(s, {
      get when() {
        return t.profile;
      },
      children: (n) => e(s, {
        get when() {
          return z(() => !!n().menuItems)() && n().menuItems.length > 0;
        },
        get fallback() {
          return e(h, {
            type: "button",
            variant: "ghost",
            color: "neutral",
            size: "sm",
            shape: "circle",
            get "aria-label"() {
              return n().name;
            },
            onClick: () => n().onClick?.(),
            get children() {
              return ne();
            }
          });
        },
        get children() {
          return e(H, {
            get children() {
              return [e(V, {
                as: h,
                type: "button",
                variant: "ghost",
                color: "neutral",
                size: "sm",
                shape: "circle",
                get "aria-label"() {
                  return n().name;
                },
                get children() {
                  return ne();
                }
              }), e(j, {
                align: "end",
                get children() {
                  return [e(_e, {
                    get children() {
                      return n().name;
                    }
                  }), e(se, {}), z(() => Z(n().menuItems ?? []))];
                }
              })];
            }
          });
        }
      })
    }), null), l(i, e(s, {
      get when() {
        return z(() => !!(t.searchable && M()))() && G();
      },
      get children() {
        var n = Me(), a = n.firstChild, o = a.firstChild;
        return n.$$keydown = (g) => {
          g.key === "Escape" && (g.stopPropagation(), Y());
        }, a.addEventListener("submit", X), te(o, "for", `${T}-collapsed`), l(o, $), l(a, e(u, {
          name: "search",
          size: 14,
          class: "zen-pointer-events-none zen-absolute zen-start-2 zen-text-zen-muted-fg"
        }), null), l(a, e(ae, {
          id: `${T}-collapsed`,
          type: "search",
          ref: (g) => queueMicrotask(() => g.focus()),
          get value() {
            return O();
          },
          get placeholder() {
            return $();
          },
          onInput: (g) => U(g.currentTarget.value),
          class: "zen-h-8 zen-w-full zen-pl-7"
        }), null), l(n, e(h, {
          type: "button",
          variant: "ghost",
          color: "neutral",
          size: "sm",
          shape: "square",
          "aria-label": "Close search",
          onClick: Y,
          get children() {
            return e(u, {
              name: "x",
              size: 16
            });
          }
        }), null), n;
      }
    }), b);
    var y = I;
    return typeof y == "function" ? C(y, b) : I = b, l(b, e(S, {
      get each() {
        return w();
      },
      children: (n) => F(n)
    })), r;
  })();
};
ze(["keydown"]);
export {
  je as ShellBar
};
//# sourceMappingURL=index12.js.map
