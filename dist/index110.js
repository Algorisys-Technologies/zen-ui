import { template as h, insert as d, createComponent as e, memo as G, effect as H, className as J, use as Q, spread as U, mergeProps as X, delegateEvents as Y } from "solid-js/web";
import { createSignal as D, Show as b, For as y, untrack as M, createEffect as I, onCleanup as ee } from "solid-js";
import { DragDropProvider as te, DragDropSensors as ne, SortableProvider as x, mostIntersecting as E, useDragDropContext as re, createSortable as le } from "./index140.js";
import { Button as ie } from "./index5.js";
import { Alert as F, AlertIcon as R, AlertContent as Z, AlertTitle as K, AlertDescription as P } from "./index39.js";
import { Icon as T } from "./index21.js";
import { PivotDropZone as C } from "./index112.js";
import { PivotFieldChip as oe } from "./index113.js";
import { createEmptyLayout as V, hasActiveFilters as ae, availableFields as se, isLayoutRenderable as ue, fieldLabel as ce, moveFieldToZone as de, describeMove as ge, updateValueAggregation as fe } from "./index74.js";
import { cn as O } from "./index106.js";
var me = /* @__PURE__ */ h("<div>"), he = /* @__PURE__ */ h('<button type=button class="-zen-m-1 zen-cursor-pointer zen-border-0 zen-bg-transparent zen-p-1 zen-text-sm zen-text-zen-muted-fg hover:zen-text-zen-foreground">Clear filters'), ze = /* @__PURE__ */ h('<div class="zen-flex zen-items-center zen-justify-between zen-gap-2"><span class="zen-text-xs zen-text-zen-muted-fg"> rows &middot; <!> cols</span><div class="zen-flex zen-items-center zen-gap-2">'), ve = /* @__PURE__ */ h('<div class="zen-grid zen-grid-cols-1 zen-gap-2 sm:zen-grid-cols-3">'), be = /* @__PURE__ */ h('<div class="zen-flex zen-w-full zen-flex-col zen-gap-2 zen-bg-zen-background zen-p-2">'), we = /* @__PURE__ */ h('<div><div aria-live=polite aria-atomic=true class=zen-sr-only></div><div class="zen-relative zen-min-h-0 zen-min-w-0 zen-flex-1 zen-bg-zen-background zen-p-2">'), ye = /* @__PURE__ */ h('<div class="zen-flex zen-flex-col zen-gap-2">');
const xe = (n, t, c) => {
  const g = t.filter((z) => z.data?.sortable && z.id !== n.id), m = E(n, g, c);
  if (m) return m;
  const f = t.filter((z) => !z.data?.sortable);
  return E(n, f, c);
}, $ = (n) => {
  const t = le(n.fieldKey, {
    zone: n.zone,
    sortable: !0
  });
  return (() => {
    var c = me(), g = t.ref;
    return typeof g == "function" ? Q(g, c) : t.ref = c, U(c, X(() => t.dragActivators, {
      get "data-pivot-chip"() {
        return ce(n.fields, n.fieldKey);
      },
      get class() {
        return O("zen-max-w-full zen-touch-none", n.zone === "rows" || n.zone === "values" ? "zen-flex zen-w-full" : "zen-inline-flex", t.isActiveDraggable && "zen-opacity-50 zen-z-50 zen-relative");
      },
      get style() {
        return {
          transform: t.transform ? `translate3d(${t.transform.x}px, ${t.transform.y}px, 0)` : void 0
        };
      }
    }), !1, !0), d(c, e(oe, n)), c;
  })();
}, Ce = (n) => {
  const t = re();
  if (!t) return null;
  const [c, {
    dragEnd: g
  }] = t;
  return I(() => {
    if (!c.active.draggable) return;
    const m = (f) => {
      f.key === "Escape" && (f.preventDefault(), n.onCancel(), g());
    };
    window.addEventListener("keydown", m, !0), ee(() => window.removeEventListener("keydown", m, !0));
  }), null;
};
function Fe(n) {
  const [t, c] = D(n.initialLayout || V()), [g, m] = D(n.initialLayout || V()), f = () => se(t(), n.fields), [z, S] = D(""), v = (l, u, i) => {
    c((a) => de(a, l, u, {
      index: i
    })), S(ge(M(() => n.fields), l, u, i));
  };
  let p = !1;
  const q = (l) => {
    const {
      draggable: u,
      droppable: i
    } = l;
    if (p) {
      p = !1, S("Move cancelled.");
      return;
    }
    if (!i) return;
    const a = u.id, o = i.data?.zone ?? i.id, r = i.data?.zone ? i.id : void 0, s = r && r !== a ? B(M(t), r, o) : void 0;
    v(a, o, s);
  }, B = (l, u, i) => {
    const a = i === "rows" ? l.rows.indexOf(u) : i === "columns" ? l.columns.indexOf(u) : i === "values" ? l.values.findIndex((o) => o.id === u) : -1;
    return a === -1 ? void 0 : a;
  }, j = () => {
    const l = {
      ...t()
    };
    m(l), n.onLayoutApply?.(l);
  }, N = (l, u) => {
    c((i) => fe(i, l, u));
  }, _ = (l) => v(l, "available"), w = (l, u) => {
    c((i) => {
      const a = {
        ...i.filters
      };
      return u ? a[l] = u : delete a[l], {
        ...i,
        filters: a
      };
    });
  };
  return (() => {
    var l = we(), u = l.firstChild, i = u.nextSibling;
    return d(u, z), d(l, e(te, {
      onDragEnd: q,
      collisionDetector: xe,
      get children() {
        return [e(Ce, {
          onCancel: () => p = !0
        }), e(ne, {
          get children() {
            var a = be();
            return d(a, e(b, {
              get when() {
                return n.showBuilder !== !1;
              },
              get children() {
                return [(() => {
                  var o = ze(), r = o.firstChild, s = r.firstChild, k = s.nextSibling;
                  k.nextSibling;
                  var L = r.nextSibling;
                  return d(r, () => (n.totalRows ?? 0).toLocaleString(), s), d(r, () => (n.totalCols ?? 0).toLocaleString(), k), d(L, e(b, {
                    get when() {
                      return ae(t().filters);
                    },
                    get children() {
                      var A = he();
                      return A.$$click = () => {
                        n.onClearFilters ? n.onClearFilters() : c((W) => ({
                          ...W,
                          filters: {}
                        }));
                      }, A;
                    }
                  }), null), d(L, e(ie, {
                    size: "sm",
                    onClick: j,
                    children: "View Data"
                  }), null), o;
                })(), e(C, {
                  id: "available",
                  title: "Available Fields",
                  horizontal: !0,
                  get isEmpty() {
                    return f().length === 0;
                  },
                  get children() {
                    return e(x, {
                      get ids() {
                        return f().map((o) => o.key);
                      },
                      get children() {
                        return e(y, {
                          get each() {
                            return f();
                          },
                          children: (o) => e($, {
                            get fieldKey() {
                              return o.key;
                            },
                            onMoveToZone: (r) => v(o.key, r),
                            get fields() {
                              return n.fields;
                            },
                            zone: "available",
                            get selection() {
                              return t().filters?.[o.key];
                            },
                            get filters() {
                              return t().filters;
                            },
                            get loadMembers() {
                              return n.loadMembers;
                            },
                            onSelectionChange: (r) => w(o.key, r),
                            singleSelect: !0
                          })
                        });
                      }
                    });
                  }
                }), (() => {
                  var o = ve();
                  return d(o, e(C, {
                    id: "values",
                    title: "Values",
                    get isEmpty() {
                      return t().values.length === 0;
                    },
                    get children() {
                      return e(x, {
                        get ids() {
                          return t().values.map((r) => r.id);
                        },
                        get children() {
                          return e(y, {
                            get each() {
                              return t().values;
                            },
                            children: (r) => e($, {
                              get fieldKey() {
                                return r.id;
                              },
                              onMoveToZone: (s) => v(r.id, s),
                              get fields() {
                                return n.fields;
                              },
                              zone: "values",
                              get aggregation() {
                                return r.aggregation;
                              },
                              onAggregationChange: (s) => N(r.id, s),
                              onRemove: () => _(r.id),
                              get selection() {
                                return t().filters?.[r.id];
                              },
                              get filters() {
                                return t().filters;
                              },
                              get loadMembers() {
                                return n.loadMembers;
                              },
                              onSelectionChange: (s) => w(r.id, s)
                            })
                          });
                        }
                      });
                    }
                  }), null), d(o, e(C, {
                    id: "rows",
                    title: "Rows",
                    get isEmpty() {
                      return t().rows.length === 0;
                    },
                    get children() {
                      return e(x, {
                        get ids() {
                          return t().rows;
                        },
                        get children() {
                          return e(y, {
                            get each() {
                              return t().rows;
                            },
                            children: (r) => e($, {
                              fieldKey: r,
                              onMoveToZone: (s) => v(r, s),
                              get fields() {
                                return n.fields;
                              },
                              zone: "rows",
                              onRemove: () => _(r),
                              get selection() {
                                return t().filters?.[r];
                              },
                              get filters() {
                                return t().filters;
                              },
                              get loadMembers() {
                                return n.loadMembers;
                              },
                              onSelectionChange: (s) => w(r, s)
                            })
                          });
                        }
                      });
                    }
                  }), null), d(o, e(C, {
                    id: "columns",
                    title: "Columns",
                    get isEmpty() {
                      return t().columns.length === 0;
                    },
                    get children() {
                      return e(x, {
                        get ids() {
                          return t().columns;
                        },
                        get children() {
                          return e(y, {
                            get each() {
                              return t().columns;
                            },
                            children: (r) => e($, {
                              fieldKey: r,
                              onMoveToZone: (s) => v(r, s),
                              get fields() {
                                return n.fields;
                              },
                              zone: "columns",
                              onRemove: () => _(r),
                              get selection() {
                                return t().filters?.[r];
                              },
                              get filters() {
                                return t().filters;
                              },
                              get loadMembers() {
                                return n.loadMembers;
                              },
                              onSelectionChange: (s) => w(r, s)
                            })
                          });
                        }
                      });
                    }
                  }), null), o;
                })()];
              }
            })), a;
          }
        })];
      }
    }), i), d(i, e(b, {
      get when() {
        return ue(g());
      },
      get fallback() {
        return (() => {
          var a = ye();
          return d(a, e(b, {
            get when() {
              return g().values.length === 0;
            },
            get children() {
              return e(F, {
                color: "warning",
                get children() {
                  return [e(R, {
                    get children() {
                      return e(T, {
                        name: "info"
                      });
                    }
                  }), e(Z, {
                    get children() {
                      return [e(K, {
                        children: "Value field required"
                      }), e(P, {
                        children: "Drop at least one field into Values to calculate data."
                      })];
                    }
                  })];
                }
              });
            }
          }), null), d(a, e(b, {
            get when() {
              return G(() => g().rows.length === 0)() && g().columns.length === 0;
            },
            get children() {
              return e(F, {
                color: "warning",
                get children() {
                  return [e(R, {
                    get children() {
                      return e(T, {
                        name: "info"
                      });
                    }
                  }), e(Z, {
                    get children() {
                      return [e(K, {
                        children: "Dimension required"
                      }), e(P, {
                        children: "Drop at least one field into Rows or Columns."
                      })];
                    }
                  })];
                }
              });
            }
          }), null), a;
        })();
      },
      get children() {
        return n.children;
      }
    })), H(() => J(l, O("zen-flex zen-h-full zen-w-full zen-min-w-0 zen-flex-col zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border", n.class))), l;
  })();
}
Y(["click"]);
export {
  Fe as PivotWorkbench
};
//# sourceMappingURL=index110.js.map
