import { createComponent as l, template as i, insert as s, mergeProps as B, memo as I, effect as p, className as P, setStyleProperty as O, setAttribute as V, delegateEvents as D } from "solid-js/web";
import { createSignal as A, createMemo as E, createEffect as H, Show as d, For as S } from "solid-js";
import { Popover as R, PopoverTrigger as W, PopoverContent as Y } from "./index56.js";
import { Icon as f } from "./index21.js";
import { cn as v } from "./index106.js";
var j = /* @__PURE__ */ i("<span class=zen-font-medium>"), q = /* @__PURE__ */ i('<div role=group aria-label="Filter by severity"class="zen-flex zen-flex-wrap zen-gap-1 zen-border-b zen-border-zen-border zen-p-2">'), G = /* @__PURE__ */ i('<ul class="zen-m-0 zen-list-none zen-p-0">'), J = /* @__PURE__ */ i("<div class=zen-overflow-y-auto>"), K = /* @__PURE__ */ i('<p class="zen-m-0 zen-px-4 zen-py-6 zen-text-center zen-text-sm zen-text-zen-muted-fg">'), Q = /* @__PURE__ */ i('<span class="zen-block zen-text-xs zen-text-zen-muted-fg">'), U = /* @__PURE__ */ i('<span class="zen-mt-1 zen-block zen-text-xs zen-leading-relaxed zen-text-zen-muted-fg">'), X = /* @__PURE__ */ i('<li class="zen-border-b zen-border-zen-border last:zen-border-b-0"><button type=button><span class="zen-min-w-0 zen-flex-1"><span class="zen-block zen-font-medium zen-text-zen-foreground">'), Z = /* @__PURE__ */ i("<button type=button>");
const y = [{
  type: "error",
  icon: "error",
  label: "Error",
  text: "zen-text-zen-error"
}, {
  type: "warning",
  icon: "warn",
  label: "Warning",
  text: "zen-text-zen-warning"
}, {
  type: "success",
  icon: "check-circle",
  label: "Success",
  text: "zen-text-zen-success"
}, {
  type: "info",
  icon: "info",
  label: "Information",
  text: "zen-text-zen-info"
}], ee = (n) => y.find((r) => r.type === n), ne = (n) => {
  const r = document.getElementById(n);
  r && (r.scrollIntoView({
    block: "center",
    behavior: "smooth"
  }), r.tabIndex < 0 && !r.hasAttribute("tabindex") && (r.setAttribute("tabindex", "-1"), r.addEventListener("blur", () => r.removeAttribute("tabindex"), {
    once: !0
  })), r.focus({
    preventScroll: !0
  }));
}, oe = (n) => {
  const [r, o] = A(!1), [c, z] = A("all"), m = E(() => {
    const e = {
      error: 0,
      warning: 0,
      success: 0,
      info: 0
    };
    for (const t of n.messages) e[t.type]++;
    return e;
  }), x = () => y.find((e) => m()[e.type] > 0), $ = () => y.filter((e) => m()[e.type] > 0), w = E(() => {
    const e = c();
    return e === "all" ? n.messages : n.messages.filter((t) => t.type === e);
  });
  H(() => {
    const e = c();
    e !== "all" && m()[e] === 0 && z("all");
  });
  const N = () => {
    if (n.triggerLabel) return n.triggerLabel;
    const e = n.messages.length;
    if (e === 0) return "No messages";
    const t = x();
    return `${e} message${e === 1 ? "" : "s"}` + (t ? `, most severe: ${t.label.toLowerCase()}` : "");
  };
  let h = null;
  const L = (e) => {
    n.onMessageSelect?.(e), !n.disableNavigation && e.targetId && (h = e.targetId, o(!1));
  }, M = (e) => {
    const t = h;
    h = null, t && (e.preventDefault(), ne(t));
  };
  return l(R, {
    get open() {
      return r();
    },
    onOpenChange: o,
    get children() {
      return [l(W, {
        get "aria-label"() {
          return N();
        },
        get class() {
          return v("zen-inline-flex zen-items-center zen-gap-2 zen-rounded-zen-md zen-border zen-border-zen-border", "zen-bg-zen-background zen-px-3 zen-py-1.5 zen-text-sm zen-cursor-pointer", "hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring", n.class);
        },
        get children() {
          return [l(f, {
            get name() {
              return x()?.icon ?? "info";
            },
            size: 16,
            get class() {
              return x()?.text ?? "zen-text-zen-muted-fg";
            }
          }), (() => {
            var e = j();
            return s(e, () => n.messages.length), e;
          })()];
        }
      }), l(Y, B({
        class: "zen-w-80 zen-p-0"
      }, {
        onCloseAutoFocus: M
      }, {
        get children() {
          return [l(d, {
            get when() {
              return $().length > 1;
            },
            get children() {
              var e = q();
              return s(e, l(F, {
                get active() {
                  return c() === "all";
                },
                onClick: () => z("all"),
                get children() {
                  return ["All ", I(() => n.messages.length)];
                }
              }), null), s(e, l(S, {
                get each() {
                  return $();
                },
                children: (t) => l(F, {
                  get active() {
                    return c() === t.type;
                  },
                  onClick: () => z(t.type),
                  get children() {
                    return [l(f, {
                      get name() {
                        return t.icon;
                      },
                      size: 12,
                      get class() {
                        return t.text;
                      }
                    }), I(() => m()[t.type])];
                  }
                })
              }), null), e;
            }
          }), (() => {
            var e = J();
            return s(e, l(d, {
              get when() {
                return w().length > 0;
              },
              get fallback() {
                return (() => {
                  var t = K();
                  return s(t, () => n.emptyMessage ?? "No messages"), t;
                })();
              },
              get children() {
                var t = G();
                return s(t, l(S, {
                  get each() {
                    return w();
                  },
                  children: (a) => {
                    const _ = ee(a.type), k = () => !n.disableNavigation && !!a.targetId;
                    return (() => {
                      var C = X(), u = C.firstChild, b = u.firstChild, T = b.firstChild;
                      return u.$$click = () => L(a), s(u, l(f, {
                        get name() {
                          return _.icon;
                        },
                        size: 16,
                        get class() {
                          return v("zen-mt-0.5 zen-shrink-0", _.text);
                        }
                      }), b), s(T, () => a.title), s(b, l(d, {
                        get when() {
                          return a.subtitle;
                        },
                        get children() {
                          var g = Q();
                          return s(g, () => a.subtitle), g;
                        }
                      }), null), s(b, l(d, {
                        get when() {
                          return a.description;
                        },
                        get children() {
                          var g = U();
                          return s(g, () => a.description), g;
                        }
                      }), null), s(u, l(d, {
                        get when() {
                          return k();
                        },
                        get children() {
                          return l(f, {
                            name: "chevron-right",
                            size: 14,
                            class: "zen-mt-0.5 zen-shrink-0 zen-text-zen-muted-fg"
                          });
                        }
                      }), null), p(() => P(u, v("zen-flex zen-w-full zen-items-start zen-gap-2.5 zen-border-0 zen-bg-transparent", "zen-px-4 zen-py-2.5 zen-text-start zen-text-sm", "focus-visible:zen-outline-none focus-visible:zen-bg-zen-muted", k() ? "zen-cursor-pointer hover:zen-bg-zen-muted" : "zen-cursor-default"))), C;
                    })();
                  }
                })), t;
              }
            })), p((t) => O(e, "max-height", `${n.maxBodyHeight ?? 320}px`)), e;
          })()];
        }
      }))];
    }
  });
}, F = (n) => (() => {
  var r = Z();
  return r.$$click = () => n.onClick(), s(r, () => n.children), p((o) => {
    var c = n.active, z = v("zen-inline-flex zen-items-center zen-gap-1 zen-rounded-zen-full zen-border zen-px-2 zen-py-0.5", "zen-text-xs zen-cursor-pointer focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring", n.active ? "zen-border-zen-primary zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg" : "zen-border-zen-border zen-bg-zen-background zen-text-zen-muted-fg hover:zen-bg-zen-muted");
    return c !== o.e && V(r, "aria-pressed", o.e = c), z !== o.t && P(r, o.t = z), o;
  }, {
    e: void 0,
    t: void 0
  }), r;
})();
D(["click"]);
export {
  oe as MessagePopover
};
//# sourceMappingURL=index94.js.map
