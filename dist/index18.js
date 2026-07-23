import { createComponent as t, template as s, insert as a, memo as D } from "solid-js/web";
import { createSignal as f, createUniqueId as P, createEffect as q, createMemo as V, Show as d, For as A } from "solid-js";
import { Dialog as Q, DialogContent as j, DialogTitle as F, DialogDescription as G } from "./index54.js";
import { Button as g } from "./index5.js";
import { Input as T } from "./index61.js";
import { Checkbox as N } from "./index46.js";
import { Tabs as W, TabsList as H, TabsTrigger as w, TabsContent as C } from "./index49.js";
import { Select as K } from "./index58.js";
import { SelectSearchField as M, SelectListBody as U } from "./index113.js";
import { filterItems as J } from "./index114.js";
import { cn as X } from "./index103.js";
var Y = /* @__PURE__ */ s('<div class="zen-flex zen-flex-col zen-gap-2 zen-border-b zen-border-zen-border zen-px-6 zen-py-4">'), Z = /* @__PURE__ */ s('<span class="zen-ml-2 zen-rounded-zen-full zen-bg-zen-primary-soft zen-px-1.5 zen-text-xs zen-text-zen-primary-soft-fg">'), ee = /* @__PURE__ */ s('<div class="zen-min-h-0 zen-flex-1 zen-overflow-y-auto zen-px-2 zen-pb-2">'), ne = /* @__PURE__ */ s('<ul class="zen-m-0 zen-flex zen-list-none zen-flex-col zen-gap-2 zen-p-0">'), te = /* @__PURE__ */ s('<div class="zen-flex zen-items-center zen-justify-end zen-gap-2 zen-border-t zen-border-zen-border zen-px-6 zen-py-3">'), re = /* @__PURE__ */ s('<p class="zen-m-0 zen-py-8 zen-text-center zen-text-sm zen-text-zen-muted-fg">No conditions yet.'), le = /* @__PURE__ */ s('<li class="zen-flex zen-items-center zen-gap-2"><label class="zen-flex zen-shrink-0 zen-items-center zen-gap-1.5 zen-text-xs zen-text-zen-muted-fg">Exclude');
const y = {
  EQ: "equals",
  Contains: "contains",
  StartsWith: "starts with",
  EndsWith: "ends with",
  BT: "between",
  LT: "less than",
  LE: "less or equal",
  GT: "greater than",
  GE: "greater or equal"
}, ae = Object.keys(y).map((e) => ({
  value: e,
  label: y[e]
})), ie = (e) => e.value.trim() !== "" && (e.operator !== "BT" || (e.valueTo ?? "").trim() !== ""), be = (e) => {
  const [x, b] = f(""), [v, h] = f([]), [u, z] = f([]), p = P();
  let _ = 0;
  const $ = () => ({
    id: `vh-${_++}`,
    exclude: !1,
    operator: "EQ",
    value: ""
  });
  q(() => {
    e.open && (h(e.selectedIds ? [...e.selectedIds] : []), z((e.conditions ?? []).map((n) => ({
      ...n
    }))), b(""));
  });
  const S = V(() => J(e.items, x(), !!e.onSearch)), k = (n) => h((r) => r.includes(n) ? r.filter((l) => l !== n) : [...r, n]), O = (n) => h([n]), m = (n, r) => z((l) => l.map((o) => o.id === n ? {
    ...o,
    ...r
  } : o)), E = (n) => {
    const r = new Set(n), l = e.items.filter((c) => r.has(c.id)).map((c) => c.id), o = new Set(l);
    return [...l, ...n.filter((c) => !o.has(c))];
  }, L = () => {
    e.onConfirm({
      ids: E(v()),
      conditions: u().filter(ie)
    }), e.onOpenChange(!1);
  }, I = (n) => {
    b(n), e.onSearch?.(n);
  }, R = () => e.searchPlaceholder ?? "Search";
  return t(Q, {
    get open() {
      return e.open;
    },
    get onOpenChange() {
      return e.onOpenChange;
    },
    get children() {
      return t(
        j,
        {
          get class() {
            return X("zen-flex zen-max-h-[85vh] zen-w-full zen-max-w-2xl zen-flex-col zen-overflow-hidden zen-p-0", e.class);
          },
          get "aria-describedby"() {
            return e.description ? p : void 0;
          },
          get children() {
            return [(() => {
              var n = Y();
              return a(n, t(F, {
                class: "zen-pr-8",
                get children() {
                  return e.title;
                }
              }), null), a(n, t(d, {
                get when() {
                  return e.description;
                },
                get children() {
                  return t(G, {
                    id: p,
                    get children() {
                      return e.description;
                    }
                  });
                }
              }), null), n;
            })(), t(W, {
              defaultValue: "select",
              class: "zen-flex zen-min-h-0 zen-flex-1 zen-flex-col",
              get children() {
                return [t(H, {
                  class: "zen-mx-6 zen-mt-3",
                  get children() {
                    return [t(w, {
                      value: "select",
                      get children() {
                        return e.selectTabLabel ?? "Select from list";
                      }
                    }), t(w, {
                      value: "conditions",
                      get children() {
                        return [D(() => e.conditionsTabLabel ?? "Define conditions"), t(d, {
                          get when() {
                            return u().length > 0;
                          },
                          get children() {
                            var n = Z();
                            return a(n, () => u().length), n;
                          }
                        })];
                      }
                    })];
                  }
                }), t(C, {
                  value: "select",
                  class: "zen-flex zen-min-h-0 zen-flex-1 zen-flex-col zen-gap-2 zen-overflow-hidden",
                  get children() {
                    return [t(d, {
                      get when() {
                        return e.searchable ?? !0;
                      },
                      get children() {
                        return t(M, {
                          get value() {
                            return x();
                          },
                          onValueChange: I,
                          get placeholder() {
                            return R();
                          },
                          class: "zen-mx-6 zen-mt-1"
                        });
                      }
                    }), (() => {
                      var n = ee();
                      return a(n, t(U, {
                        get items() {
                          return S();
                        },
                        get multiple() {
                          return e.multiple;
                        },
                        get selected() {
                          return v();
                        },
                        onToggle: k,
                        onPick: O,
                        get emptyText() {
                          return e.emptyText;
                        }
                      })), n;
                    })()];
                  }
                }), t(C, {
                  value: "conditions",
                  class: "zen-min-h-0 zen-flex-1 zen-overflow-y-auto zen-px-6 zen-pb-2 zen-pt-1",
                  get children() {
                    return [t(d, {
                      get when() {
                        return u().length > 0;
                      },
                      get fallback() {
                        return re();
                      },
                      get children() {
                        var n = ne();
                        return a(n, t(A, {
                          get each() {
                            return u();
                          },
                          children: (r) => (() => {
                            var l = le(), o = l.firstChild, c = o.firstChild;
                            return a(o, t(N, {
                              get checked() {
                                return r.exclude;
                              },
                              onChange: (i) => m(r.id, {
                                exclude: i === !0
                              }),
                              get "aria-label"() {
                                return `Exclude condition ${r.id}`;
                              }
                            }), c), a(l, t(K, {
                              options: ae,
                              get value() {
                                return r.operator;
                              },
                              onChange: (i) => m(r.id, {
                                operator: i ?? "EQ"
                              }),
                              "aria-label": "Operator",
                              class: "zen-w-40 zen-shrink-0"
                            }), null), a(l, t(T, {
                              get value() {
                                return r.value;
                              },
                              onInput: (i) => m(r.id, {
                                value: i.currentTarget.value
                              }),
                              placeholder: "Value",
                              "aria-label": "Value"
                            }), null), a(l, t(d, {
                              get when() {
                                return r.operator === "BT";
                              },
                              get children() {
                                return t(T, {
                                  get value() {
                                    return r.valueTo ?? "";
                                  },
                                  onInput: (i) => m(r.id, {
                                    valueTo: i.currentTarget.value
                                  }),
                                  placeholder: "To",
                                  "aria-label": "To value"
                                });
                              }
                            }), null), a(l, t(g, {
                              type: "button",
                              variant: "ghost",
                              color: "neutral",
                              size: "sm",
                              "aria-label": "Remove condition",
                              onClick: () => z((i) => i.filter((B) => B.id !== r.id)),
                              children: "✕"
                            }), null), l;
                          })()
                        })), n;
                      }
                    }), t(g, {
                      type: "button",
                      variant: "outline",
                      color: "neutral",
                      size: "sm",
                      class: "zen-mt-3",
                      onClick: () => z((n) => [...n, $()]),
                      get children() {
                        return e.addConditionLabel ?? "Add condition";
                      }
                    })];
                  }
                })];
              }
            }), (() => {
              var n = te();
              return a(n, t(g, {
                type: "button",
                variant: "outline",
                color: "neutral",
                size: "sm",
                onClick: () => e.onOpenChange(!1),
                get children() {
                  return e.cancelLabel ?? "Cancel";
                }
              }), null), a(n, t(g, {
                type: "button",
                size: "sm",
                onClick: L,
                get children() {
                  return e.confirmLabel ?? "OK";
                }
              }), null), n;
            })()];
          }
        }
      );
    }
  });
};
export {
  be as ValueHelp
};
//# sourceMappingURL=index18.js.map
