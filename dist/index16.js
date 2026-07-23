import { createComponent as n, template as u, insert as i, memo as m, effect as S, className as F } from "solid-js/web";
import { createSignal as O, createUniqueId as P, createEffect as G, untrack as N, Show as d, For as h } from "solid-js";
import { Dialog as V, DialogContent as j, DialogTitle as E, DialogDescription as q } from "./index54.js";
import { Button as b } from "./index5.js";
import { Switch as I } from "./index45.js";
import { Tabs as K, TabsList as M, TabsTrigger as R, TabsContent as U } from "./index49.js";
import { SelectListBody as x } from "./index113.js";
import { cn as $ } from "./index103.js";
var Y = /* @__PURE__ */ u('<div class="zen-flex zen-flex-col zen-gap-3">'), A = /* @__PURE__ */ u('<div><div class="zen-px-4 zen-pb-1 zen-text-xs zen-font-semibold zen-uppercase zen-tracking-wide zen-text-zen-muted-fg">'), H = /* @__PURE__ */ u('<div class="zen-flex zen-flex-col zen-gap-2 zen-border-b zen-border-zen-border zen-px-6 zen-py-4">'), J = /* @__PURE__ */ u('<div class="zen-flex zen-items-center zen-justify-end zen-gap-2 zen-border-t zen-border-zen-border zen-px-6 zen-py-3">'), Q = /* @__PURE__ */ u('<div class="zen-min-h-0 zen-flex-1 zen-overflow-y-auto zen-px-2 zen-py-2">'), W = /* @__PURE__ */ u('<span class="zen-ml-2 zen-rounded-zen-full zen-bg-zen-primary-soft zen-px-1.5 zen-text-xs zen-text-zen-primary-soft-fg">'), X = /* @__PURE__ */ u("<label>");
const p = {
  sortBy: null,
  sortDescending: !1,
  groupBy: null,
  groupDescending: !1,
  filters: {}
}, Z = (t) => Object.values(t ?? {}).reduce((r, c) => r + c.length, 0), se = (t) => {
  const [r, c] = O(p), y = P();
  G(() => {
    if (!t.open) return;
    const e = N(() => t.value);
    c({
      ...p,
      ...e,
      filters: {
        ...e?.filters ?? {}
      }
    });
  });
  const a = () => [t.sortItems?.length ? "sort" : null, t.groupItems?.length ? "group" : null, t.filterGroups?.length ? "filter" : null].filter(Boolean), f = (e) => c((l) => ({
    ...l,
    ...e
  })), v = (e) => f({
    sortBy: r().sortBy === e ? null : e
  }), B = (e) => f({
    groupBy: r().groupBy === e ? null : e
  }), C = (e, l, o) => c((s) => {
    const g = s.filters?.[e] ?? [], z = o ? g.includes(l) ? g.filter((L) => L !== l) : [...g, l] : g.includes(l) ? [] : [l];
    return {
      ...s,
      filters: {
        ...s.filters,
        [e]: z
      }
    };
  }), w = () => {
    t.onConfirm(r()), t.onOpenChange(!1);
  }, T = () => Z(r().filters), k = (e) => e === "sort" ? t.sortTabLabel ?? "Sort" : e === "group" ? t.groupTabLabel ?? "Group" : t.filterTabLabel ?? "Filter", D = (e) => n(d, {
    get when() {
      return e.section !== "filter";
    },
    get fallback() {
      return (() => {
        var l = Y();
        return i(l, n(h, {
          get each() {
            return t.filterGroups ?? [];
          },
          children: (o) => (() => {
            var s = A(), g = s.firstChild;
            return i(g, () => o.label), i(s, n(x, {
              get items() {
                return o.items;
              },
              get multiple() {
                return o.multiple ?? !0;
              },
              get selected() {
                return r().filters?.[o.id] ?? [];
              },
              onToggle: (z) => C(o.id, z, o.multiple ?? !0),
              onPick: (z) => C(o.id, z, o.multiple ?? !0),
              emptyText: "No values"
            }), null), s;
          })()
        })), l;
      })();
    },
    get children() {
      return n(d, {
        get when() {
          return e.section === "sort";
        },
        get fallback() {
          return [n(x, {
            get items() {
              return t.groupItems ?? [];
            },
            get selected() {
              return m(() => !!r().groupBy)() ? [r().groupBy] : [];
            },
            onToggle: B,
            onPick: B,
            emptyText: "No group fields"
          }), n(_, {
            label: "Descending",
            get checked() {
              return !!r().groupDescending;
            },
            get disabled() {
              return !r().groupBy;
            },
            onChange: (l) => f({
              groupDescending: l
            })
          })];
        },
        get children() {
          return [n(x, {
            get items() {
              return t.sortItems ?? [];
            },
            get selected() {
              return m(() => !!r().sortBy)() ? [r().sortBy] : [];
            },
            onToggle: v,
            onPick: v,
            emptyText: "No sort fields"
          }), n(_, {
            label: "Descending",
            get checked() {
              return !!r().sortDescending;
            },
            get disabled() {
              return !r().sortBy;
            },
            onChange: (l) => f({
              sortDescending: l
            })
          })];
        }
      });
    }
  });
  return n(V, {
    get open() {
      return t.open;
    },
    get onOpenChange() {
      return t.onOpenChange;
    },
    get children() {
      return n(
        j,
        {
          get class() {
            return $("zen-flex zen-max-h-[85vh] zen-flex-col zen-overflow-hidden zen-p-0", t.class);
          },
          get "aria-describedby"() {
            return t.description ? y : void 0;
          },
          get children() {
            return [(() => {
              var e = H();
              return i(e, n(E, {
                class: "zen-pr-8",
                get children() {
                  return t.title ?? "View settings";
                }
              }), null), i(e, n(d, {
                get when() {
                  return t.description;
                },
                get children() {
                  return n(q, {
                    id: y,
                    get children() {
                      return t.description;
                    }
                  });
                }
              }), null), e;
            })(), n(d, {
              get when() {
                return a().length > 1;
              },
              get fallback() {
                return (() => {
                  var e = Q();
                  return i(e, n(d, {
                    get when() {
                      return a().length;
                    },
                    get children() {
                      return n(D, {
                        get section() {
                          return a()[0];
                        }
                      });
                    }
                  })), e;
                })();
              },
              get children() {
                return n(K, {
                  get defaultValue() {
                    return a()[0];
                  },
                  class: "zen-flex zen-min-h-0 zen-flex-1 zen-flex-col",
                  get children() {
                    return [n(M, {
                      class: "zen-mx-6 zen-mt-3",
                      get children() {
                        return n(h, {
                          get each() {
                            return a();
                          },
                          children: (e) => n(R, {
                            value: e,
                            get children() {
                              return [m(() => k(e)), n(d, {
                                get when() {
                                  return e === "filter" && T() > 0;
                                },
                                get children() {
                                  var l = W();
                                  return i(l, T), l;
                                }
                              })];
                            }
                          })
                        });
                      }
                    }), n(h, {
                      get each() {
                        return a();
                      },
                      children: (e) => n(U, {
                        value: e,
                        class: "zen-min-h-0 zen-flex-1 zen-overflow-y-auto zen-px-2 zen-py-2",
                        get children() {
                          return n(D, {
                            section: e
                          });
                        }
                      })
                    })];
                  }
                });
              }
            }), (() => {
              var e = J();
              return i(e, n(b, {
                type: "button",
                variant: "ghost",
                color: "neutral",
                size: "sm",
                class: "zen-mr-auto",
                onClick: () => c({
                  ...p,
                  filters: {}
                }),
                get children() {
                  return t.resetLabel ?? "Reset";
                }
              }), null), i(e, n(b, {
                type: "button",
                variant: "outline",
                color: "neutral",
                size: "sm",
                onClick: () => t.onOpenChange(!1),
                get children() {
                  return t.cancelLabel ?? "Cancel";
                }
              }), null), i(e, n(b, {
                type: "button",
                size: "sm",
                onClick: w,
                get children() {
                  return t.confirmLabel ?? "OK";
                }
              }), null), e;
            })()];
          }
        }
      );
    }
  });
}, _ = (t) => (() => {
  var r = X();
  return i(r, n(I, {
    get checked() {
      return t.checked;
    },
    get disabled() {
      return t.disabled;
    },
    onChange: (c) => t.onChange(c)
  }), null), i(r, () => t.label, null), S(() => F(r, $("zen-mt-2 zen-flex zen-items-center zen-gap-2 zen-border-0 zen-border-t zen-border-solid zen-border-zen-border zen-px-4 zen-pt-3 zen-text-sm", t.disabled && "zen-opacity-50"))), r;
})();
export {
  se as ViewSettingsDialog
};
//# sourceMappingURL=index16.js.map
