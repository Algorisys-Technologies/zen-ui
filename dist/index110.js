import { template as c, insert as a, createComponent as t, memo as z, effect as f, className as $, setAttribute as M, delegateEvents as A } from "solid-js/web";
import { createMemo as d, Show as u, For as D, untrack as K } from "solid-js";
import { Badge as T } from "./index28.js";
import { Icon as v } from "./index21.js";
import { fieldLabel as y, zoneLabel as _, PIVOT_ZONES as L, defaultAggregationForField as N } from "./index71.js";
import { DropdownMenu as P, DropdownMenuTrigger as O, DropdownMenuContent as R, DropdownMenuGroup as I, DropdownMenuLabel as U, DropdownMenuItem as k, DropdownMenuSeparator as Z } from "./index57.js";
import { PivotFilterMenu as E } from "./index111.js";
import { cn as h } from "./index103.js";
var V = /* @__PURE__ */ c('<div class="zen-flex zen-shrink-0">'), j = /* @__PURE__ */ c("<span><span class=zen-font-medium>"), G = /* @__PURE__ */ c('<button type=button class="zen-ml-1 zen-rounded-sm hover:zen-bg-zen-muted zen-p-1 zen-text-zen-muted-fg focus:zen-outline-none"title="Remove field">'), B = /* @__PURE__ */ c("<div>"), X = /* @__PURE__ */ c("<span class=zen-font-normal>: "), q = /* @__PURE__ */ c("<span class=zen-font-normal>: All (except <!>)"), H = /* @__PURE__ */ c('<div class="zen-inline-block zen-shrink-0 zen-text-xs"><select class="zen-h-6 zen-min-w-14 zen-rounded-sm zen-px-1.5 zen-py-0 zen-text-xs zen-uppercase zen-bg-transparent zen-border-transparent hover:zen-bg-zen-muted focus:zen-ring-0"><option value=sum>SUM</option><option value=count>COUNT</option><option value=avg>AVG</option><option value=min>MIN</option><option value=max>MAX');
function re(e) {
  const g = d(() => y(e.fields, e.fieldKey)), w = d(() => e.fields.find((s) => s.key === e.fieldKey)), b = d(() => w()?.type === "measure"), x = d(() => e.hasActiveFilter ?? (e.selection && (e.selection.kind === "include" ? e.selection.values.length > 0 : !0))), C = d(() => e.selection?.kind === "include" && e.selection.values.length > 0 ? e.selection : void 0), S = d(() => e.selection?.kind === "all" && e.selection.exclude.length > 0 ? e.selection : void 0);
  return (() => {
    var s = B();
    return a(s, t(T, {
      variant: "outline",
      get class() {
        return h("zen-cursor-grab zen-select-none active:zen-cursor-grabbing zen-bg-zen-background zen-shadow-sm zen-max-w-full zen-h-7", (e.zone === "rows" || e.zone === "values") && "zen-w-full", x() ? "zen-text-zen-primary zen-border-zen-primary/30" : "zen-text-zen-foreground", e.disabled && "zen-opacity-50 zen-cursor-not-allowed");
      },
      get children() {
        return [t(u, {
          get when() {
            return e.onMoveToZone;
          },
          get fallback() {
            return t(v, {
              name: "more-vertical",
              class: "zen-h-3 zen-w-3 zen-text-zen-muted-fg/50 zen-shrink-0"
            });
          },
          get children() {
            var n = V();
            return n.$$pointerdown = (r) => r.stopPropagation(), a(n, t(P, {
              get children() {
                return [t(O, {
                  class: "zen-flex zen-shrink-0 zen-cursor-pointer zen-items-center zen-rounded-zen-sm zen-border-0 zen-bg-transparent zen-p-0 zen-text-zen-muted-fg hover:zen-text-zen-foreground focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                  get "aria-label"() {
                    return `Move ${g()}`;
                  },
                  get disabled() {
                    return e.disabled;
                  },
                  get children() {
                    return t(v, {
                      name: "more-vertical",
                      class: "zen-h-3 zen-w-3"
                    });
                  }
                }), t(R, {
                  get children() {
                    return [t(I, {
                      get children() {
                        return [t(U, {
                          get children() {
                            return ["Move ", z(() => g()), " to"];
                          }
                        }), t(D, {
                          get each() {
                            return L.filter((r) => r !== "available" && r !== e.zone);
                          },
                          children: (r) => t(k, {
                            onSelect: () => e.onMoveToZone?.(r),
                            get children() {
                              return _(r);
                            }
                          })
                        })];
                      }
                    }), t(u, {
                      get when() {
                        return e.zone !== "available";
                      },
                      get children() {
                        return [t(Z, {}), t(k, {
                          onSelect: () => e.onMoveToZone?.("available"),
                          children: "Remove from layout"
                        })];
                      }
                    })];
                  }
                })];
              }
            })), n;
          }
        }), t(v, {
          get name() {
            return e.zone === "values" ? "plus" : "file";
          },
          class: "zen-h-3 zen-w-3 zen-text-zen-muted-fg zen-shrink-0"
        }), (() => {
          var n = j(), r = n.firstChild;
          return a(r, g), a(n, t(u, {
            get when() {
              return C();
            },
            children: (l) => (() => {
              var i = X();
              return i.firstChild, a(i, (() => {
                var o = z(() => l().values.length === 1);
                return () => o() ? z(() => !!b())() ? Number(l().values[0]).toLocaleString("en-US", {
                  maximumFractionDigits: 2
                }) : l().values[0] : `${l().values.length} selected`;
              })(), null), i;
            })()
          }), null), a(n, t(u, {
            get when() {
              return S();
            },
            children: (l) => (() => {
              var i = q(), o = i.firstChild, m = o.nextSibling;
              return m.nextSibling, a(i, () => l().exclude.length, m), i;
            })()
          }), null), f(() => $(n, h("zen-truncate zen-flex-1 zen-min-w-0", x() && "zen-italic"))), n;
        })(), t(u, {
          get when() {
            return z(() => !!(e.zone === "values" && b() && e.onAggregationChange))() && w();
          },
          children: (n) => (() => {
            var r = H(), l = r.firstChild;
            return r.$$pointerdown = (i) => i.stopPropagation(), l.addEventListener("change", (i) => e.onAggregationChange?.(i.currentTarget.value)), f(() => M(l, "aria-label", `Aggregation for ${y(e.fields, e.fieldKey)}`)), f(() => l.value = e.aggregation ?? N(n())), r;
          })()
        }), t(u, {
          get when() {
            return z(() => !!(e.zone !== "values" && e.loadMembers))() && e.onSelectionChange;
          },
          get children() {
            return t(E, {
              get columnKey() {
                return e.fieldKey;
              },
              get label() {
                return g();
              },
              selection: () => e.selection,
              onChange: (n) => e.onSelectionChange?.(n),
              loadOptions: async (n, r, l) => {
                const i = K(() => {
                  if (!e.filters) return;
                  const o = {};
                  for (const [m, F] of Object.entries(e.filters))
                    m !== e.fieldKey && (o[m] = F);
                  return o;
                });
                return e.loadMembers({
                  fieldKey: n,
                  search: r.trim() ? r.trim() : void 0,
                  offset: l?.offset,
                  limit: l?.limit,
                  filters: i
                }).then((o) => ({
                  values: o.values,
                  hasMore: o.hasMore,
                  total: o.total ?? o.values.length
                }));
              },
              formatValue: (n) => b() ? Number(n).toLocaleString("en-US", {
                maximumFractionDigits: 2
              }) : n,
              get triggerClass() {
                return h("zen-flex zen-shrink-0 zen-items-center zen-justify-center zen-rounded-sm zen-p-1 zen-transition-colors", x() ? "zen-text-zen-primary hover:zen-bg-zen-muted hover:zen-text-zen-primary-fg" : "zen-text-zen-muted-fg hover:zen-bg-zen-muted hover:zen-text-zen-foreground");
              },
              get triggerChildren() {
                return t(v, {
                  name: "chevron-down",
                  class: "zen-h-3.5 zen-w-3.5"
                });
              },
              get singleSelect() {
                return e.singleSelect;
              }
            });
          }
        }), t(u, {
          get when() {
            return z(() => e.zone !== "available")() && e.onRemove;
          },
          get children() {
            var n = G();
            return n.$$click = (r) => {
              r.stopPropagation(), e.onRemove?.();
            }, a(n, t(v, {
              name: "x",
              class: "zen-h-3.5 zen-w-3.5"
            })), f(() => M(n, "aria-label", `Remove ${g()} from ${_(e.zone ?? "available")}`)), n;
          }
        })];
      }
    })), f(() => $(s, h("zen-group zen-relative zen-flex zen-items-center zen-gap-1 zen-max-w-full"))), s;
  })();
}
A(["pointerdown", "click"]);
export {
  re as PivotFieldChip
};
//# sourceMappingURL=index110.js.map
