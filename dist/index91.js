import { createComponent as s, template as u, insert as o, effect as g, className as h, memo as p, setAttribute as x, setStyleProperty as D, delegateEvents as j } from "solid-js/web";
import { createMemo as w, Show as f, For as _ } from "solid-js";
import { Popover as T, PopoverTrigger as L, PopoverContent as A } from "./index56.js";
import { cn as b } from "./index106.js";
var k = /* @__PURE__ */ u("<span aria-hidden=true>"), Y = /* @__PURE__ */ u('<span class="zen-ml-1.5 zen-text-xs zen-font-normal zen-text-zen-muted-fg">(<!>)'), B = /* @__PURE__ */ u("<button type=button>Mark all as read"), P = /* @__PURE__ */ u('<div class="zen-flex zen-items-center zen-justify-between zen-px-4 zen-py-2.5 zen-border-b zen-border-zen-border"><h3 class="zen-text-sm zen-font-semibold zen-text-zen-foreground zen-m-0">'), F = /* @__PURE__ */ u("<div role=list style=overflow-y:auto>"), H = /* @__PURE__ */ u('<div class="zen-border-t zen-border-zen-border"><button type=button>View all'), I = /* @__PURE__ */ u('<section><h4 class="zen-px-4 zen-pt-3 zen-pb-1 zen-text-[0.65rem] zen-font-semibold zen-uppercase zen-tracking-wide zen-text-zen-muted-fg zen-m-0"></h4><ul class="zen-list-none zen-p-0 zen-m-0">'), N = /* @__PURE__ */ u('<div class="zen-mt-0.5 zen-text-xs zen-text-zen-muted-fg zen-leading-snug">'), O = /* @__PURE__ */ u('<div class="zen-flex zen-items-center zen-gap-1.5">'), R = /* @__PURE__ */ u('<div class="zen-min-w-0 zen-flex-1"><div></div><div class="zen-mt-1 zen-flex zen-items-center zen-justify-between zen-gap-2"><span class="zen-text-[0.65rem] zen-uppercase zen-tracking-wide zen-text-zen-muted-fg">'), V = /* @__PURE__ */ u("<a>"), E = /* @__PURE__ */ u('<li role=listitem class="zen-border-b zen-border-zen-border last:zen-border-b-0">'), U = /* @__PURE__ */ u("<button type=button>"), q = /* @__PURE__ */ u("<div>"), G = /* @__PURE__ */ u('<div class="zen-flex zen-flex-col zen-items-center zen-justify-center zen-px-6 zen-py-10 zen-text-center"><span class="zen-text-zen-muted-fg/60 zen-mb-2"></span><p class="zen-text-sm zen-text-zen-muted-fg zen-m-0">'), J = /* @__PURE__ */ u('<svg viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round aria-hidden=true><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0">');
const S = (e) => e instanceof Date ? e : new Date(e), y = (e) => {
  const n = new Date(e);
  return n.setHours(0, 0, 0, 0), n;
}, K = (e, n) => Math.round((y(n).getTime() - y(e).getTime()) / 864e5), Q = (e, n) => {
  const t = K(e, n);
  if (t === 0) return "Today";
  if (t === 1) return "Yesterday";
  if (t < 7) return e.toLocaleDateString(void 0, {
    weekday: "long"
  });
  const z = e.getFullYear() === n.getFullYear();
  return e.toLocaleDateString(void 0, {
    month: "short",
    day: "numeric",
    year: z ? void 0 : "numeric"
  });
}, W = (e, n) => {
  const t = Math.floor((n.getTime() - e.getTime()) / 1e3);
  return t < 45 ? "just now" : t < 3600 ? `${Math.floor(t / 60)}m ago` : t < 3600 * 24 ? `${Math.floor(t / 3600)}h ago` : t < 3600 * 24 * 7 ? `${Math.floor(t / 86400)}d ago` : e.toLocaleDateString();
}, X = (e, n) => {
  const t = [];
  for (const z of e) {
    const c = Q(S(z.timestamp), n), m = t[t.length - 1];
    m && m.label === c ? m.items.push(z) : t.push({
      label: c,
      items: [z]
    });
  }
  return t;
}, le = (e) => {
  const n = w(() => (e.notifications, /* @__PURE__ */ new Date())), t = w(() => X(e.notifications, n())), z = () => e.unreadCount ?? e.notifications.filter((r) => !r.read).length, c = () => z() > 0, m = () => e.badgeMax ?? 99, d = () => z() > m() ? `${m()}+` : String(z()), i = () => e.triggerLabel ?? "Notifications";
  return s(T, {
    get open() {
      return e.open;
    },
    get onOpenChange() {
      return e.onOpenChange;
    },
    get children() {
      return [s(L, {
        get "aria-label"() {
          return p(() => !!c())() ? `${i()}, ${z()} unread` : i();
        },
        get class() {
          return b("zen-relative zen-inline-flex zen-h-10 zen-w-10 zen-items-center zen-justify-center zen-rounded-zen-full", "zen-text-zen-foreground zen-bg-transparent zen-border-0 zen-cursor-pointer", "hover:zen-bg-zen-muted", "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring", "zen-transition-colors", e.class);
        },
        get children() {
          return [s(C, {
            size: 18
          }), s(f, {
            get when() {
              return c();
            },
            get children() {
              var r = k();
              return o(r, d), g(() => h(r, b("zen-absolute -zen-top-0.5 -zen-end-0.5 zen-inline-flex zen-items-center zen-justify-center", "zen-min-w-[1.25rem] zen-h-5 zen-px-1 zen-rounded-zen-full", "zen-text-[0.65rem] zen-font-semibold zen-leading-none", "zen-bg-zen-error zen-text-zen-error-fg", "zen-ring-2 zen-ring-zen-background"))), r;
            }
          })];
        }
      }), s(A, {
        class: "zen-p-0 zen-overflow-hidden",
        get style() {
          return {
            width: `${e.width ?? 360}px`
          };
        },
        get children() {
          return [(() => {
            var r = P(), a = r.firstChild;
            return o(a, i, null), o(a, s(f, {
              get when() {
                return c();
              },
              get children() {
                var l = Y(), v = l.firstChild, $ = v.nextSibling;
                return $.nextSibling, o(l, z, $), l;
              }
            }), null), o(r, s(f, {
              get when() {
                return p(() => !!c())() && e.onMarkAllRead;
              },
              get children() {
                var l = B();
                return l.$$click = () => e.onMarkAllRead?.(), g(() => h(l, b("zen-text-xs zen-font-medium zen-text-zen-primary", "hover:zen-underline focus-visible:zen-outline-none focus-visible:zen-underline", "zen-bg-transparent zen-border-0 zen-cursor-pointer zen-p-0"))), l;
              }
            }), null), r;
          })(), (() => {
            var r = F();
            return o(r, s(f, {
              get when() {
                return t().length > 0;
              },
              get fallback() {
                return s(ee, {
                  get message() {
                    return e.emptyMessage ?? "You're all caught up.";
                  }
                });
              },
              get children() {
                return s(_, {
                  get each() {
                    return t();
                  },
                  children: (a) => (() => {
                    var l = I(), v = l.firstChild, $ = v.nextSibling;
                    return o(v, () => a.label), o($, s(_, {
                      get each() {
                        return a.items;
                      },
                      children: (M) => s(Z, {
                        notification: M,
                        get now() {
                          return n();
                        },
                        get onSelect() {
                          return e.onItemSelect;
                        }
                      })
                    })), g(() => x(l, "aria-label", a.label)), l;
                  })()
                });
              }
            })), g((a) => {
              var l = i(), v = `${e.maxHeight ?? 420}px`;
              return l !== a.e && x(r, "aria-label", a.e = l), v !== a.t && D(r, "max-height", a.t = v), a;
            }, {
              e: void 0,
              t: void 0
            }), r;
          })(), s(f, {
            get when() {
              return e.onViewAll;
            },
            get children() {
              var r = H(), a = r.firstChild;
              return a.$$click = () => e.onViewAll?.(), g(() => h(a, b("zen-block zen-w-full zen-px-4 zen-py-2.5 zen-text-center zen-text-sm zen-font-medium zen-text-zen-primary", "hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-bg-zen-muted", "zen-bg-transparent zen-border-0 zen-cursor-pointer"))), r;
            }
          })];
        }
      })];
    }
  });
}, Z = (e) => {
  const n = () => e.notification, t = () => !!e.onSelect || !!n().href, z = () => e.onSelect?.(n()), c = [(() => {
    var d = k();
    return o(d, () => n().icon), g(() => h(d, b("zen-mt-1.5 zen-shrink-0 zen-flex zen-items-center zen-justify-center", n().icon ? "zen-h-5 zen-w-5 zen-text-zen-muted-fg" : "zen-h-2 zen-w-2 zen-rounded-zen-full", !n().icon && !n().read && "zen-bg-zen-primary", !n().icon && n().read && "zen-bg-transparent"))), d;
  })(), (() => {
    var d = R(), i = d.firstChild, r = i.nextSibling, a = r.firstChild;
    return o(i, () => n().title), o(d, s(f, {
      get when() {
        return n().description;
      },
      get children() {
        var l = N();
        return o(l, () => n().description), l;
      }
    }), r), o(a, () => W(S(n().timestamp), e.now)), o(r, s(f, {
      get when() {
        return n().actions;
      },
      get children() {
        var l = O();
        return o(l, () => n().actions), l;
      }
    }), null), g(() => h(i, b("zen-text-sm zen-leading-snug", n().read ? "zen-text-zen-muted-fg" : "zen-font-medium zen-text-zen-foreground"))), d;
  })()], m = () => b("zen-flex zen-items-start zen-gap-3 zen-px-4 zen-py-2.5 zen-text-start zen-w-full", "zen-border-l-2", n().read ? "zen-border-transparent" : "zen-border-zen-primary zen-bg-zen-primary-soft/30", t() && "zen-cursor-pointer hover:zen-bg-zen-muted focus-visible:zen-bg-zen-muted focus-visible:zen-outline-none");
  return (() => {
    var d = E();
    return o(d, s(f, {
      get when() {
        return n().href;
      },
      get fallback() {
        return s(f, {
          get when() {
            return t();
          },
          get fallback() {
            return (() => {
              var i = q();
              return o(i, c), g(() => h(i, m())), i;
            })();
          },
          get children() {
            var i = U();
            return i.$$click = z, o(i, c), g(() => h(i, b(m(), "zen-bg-transparent zen-border-0"))), i;
          }
        });
      },
      get children() {
        var i = V();
        return i.$$click = (r) => {
          e.onSelect && (r.preventDefault(), z());
        }, o(i, c), g((r) => {
          var a = n().href, l = b(m(), "zen-no-underline zen-text-inherit");
          return a !== r.e && x(i, "href", r.e = a), l !== r.t && h(i, r.t = l), r;
        }, {
          e: void 0,
          t: void 0
        }), i;
      }
    })), g(() => x(d, "aria-current", n().read ? void 0 : "true")), d;
  })();
}, ee = (e) => (() => {
  var n = G(), t = n.firstChild, z = t.nextSibling;
  return o(t, s(C, {
    size: 28
  })), o(z, () => e.message), n;
})(), C = (e) => (() => {
  var n = J();
  return g((t) => {
    var z = e.size ?? 18, c = e.size ?? 18;
    return z !== t.e && x(n, "width", t.e = z), c !== t.t && x(n, "height", t.t = c), t;
  }, {
    e: void 0,
    t: void 0
  }), n;
})();
j(["click"]);
export {
  le as NotificationsInbox
};
//# sourceMappingURL=index91.js.map
