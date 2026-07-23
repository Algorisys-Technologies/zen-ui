import { createComponent as r, template as u, insert as d, memo as g, addEventListener as Pe, effect as b, setStyleProperty as F, className as Fe, setAttribute as Te, delegateEvents as Me } from "solid-js/web";
import { splitProps as De, createSignal as h, createMemo as X, createEffect as Ve, Show as s, For as x } from "solid-js";
import { createVirtualizer as He } from "./index139.js";
import { createSolidTable as Le, flexRender as R } from "./index138.js";
import { cn as I } from "./index106.js";
import { arrowStep as Ae } from "./index115.js";
import "./index25.js";
import { Table as Be, TableHeader as Ge, TableRow as T, TableHead as Ne, TableBody as Ke, TableCell as Y } from "./index73.js";
import { Checkbox as Z } from "./index49.js";
import { Icon as M } from "./index21.js";
import { Input as je } from "./index64.js";
import { Button as D } from "./index5.js";
import { getExpandedRowModel as Oe, getCoreRowModel as Ue, getFilteredRowModel as We, getSortedRowModel as qe, getPaginationRowModel as Je } from "./index143.js";
var Qe = /* @__PURE__ */ u('<div class="zen-flex zen-flex-wrap zen-items-center zen-gap-2">'), ee = /* @__PURE__ */ u("<tr aria-hidden=true>"), Xe = /* @__PURE__ */ u('<select class="zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-2 zen-py-1 zen-text-sm"aria-label="Rows per page">'), Ye = /* @__PURE__ */ u('<div class="zen-flex zen-flex-wrap zen-items-center zen-justify-between zen-gap-2"><p class="zen-m-0 zen-text-sm zen-text-zen-muted-fg">Page <!> of <!> · <!> top-level rows</p><div class="zen-flex zen-items-center zen-gap-2">'), Ze = /* @__PURE__ */ u("<div>"), en = /* @__PURE__ */ u('<button type=button class="zen-inline-flex zen-items-center zen-gap-1 zen-border-0 zen-bg-transparent zen-p-0 zen-font-inherit zen-text-inherit zen-cursor-pointer focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring">'), nn = /* @__PURE__ */ u("<option> per page"), tn = /* @__PURE__ */ u('<span class="zen-inline-block zen-h-3 zen-w-3 zen-animate-spin zen-rounded-zen-full zen-border zen-border-zen-border zen-border-t-zen-primary">'), ln = /* @__PURE__ */ u('<button type=button tabindex=-1 aria-hidden=true class="zen-inline-flex zen-w-4 zen-shrink-0 zen-items-center zen-justify-center zen-border-0 zen-bg-transparent zen-p-0 zen-cursor-pointer zen-text-zen-muted-fg">'), rn = /* @__PURE__ */ u('<span class="zen-flex zen-items-center zen-gap-1">'), an = /* @__PURE__ */ u('<span class="zen-inline-block zen-w-4 zen-shrink-0">');
const on = (t) => t.children;
function wn(t) {
  const [ne] = De(t, ["class"]), [te, le] = h(t.defaultExpanded ?? {}), [re, ie] = h([]), [ae, oe] = h({}), [de, ge] = h(""), [V, se] = h({
    pageIndex: 0,
    pageSize: t.pageSize ?? 10
  }), H = () => t.expanded ?? te(), L = () => t.sorting ?? re(), A = () => t.rowSelection ?? ae(), k = () => t.globalFilter ?? de(), ce = () => t.indent ?? 20, ue = X(() => t.enableRowSelection ? [{
    id: "__select__",
    header: ({
      table: n
    }) => r(Z, {
      get checked() {
        return n.getIsAllRowsSelected();
      },
      get indeterminate() {
        return g(() => !n.getIsAllRowsSelected())() && n.getIsSomeRowsSelected();
      },
      onChange: (l) => n.toggleAllRowsSelected(l),
      "aria-label": "Select all rows"
    }),
    cell: ({
      row: n
    }) => {
      const l = () => n.subRows.length > 0, i = () => l() ? n.getIsSelected() && n.getIsAllSubRowsSelected() : n.getIsSelected(), a = () => !i() && (n.getIsSomeSelected() || l() && n.getIsSelected());
      return r(Z, {
        get checked() {
          return i();
        },
        get indeterminate() {
          return a();
        },
        onChange: (m) => n.toggleSelected(m),
        get "aria-label"() {
          return `Select row ${n.index + 1}`;
        }
      });
    },
    enableSorting: !1,
    enableHiding: !1,
    size: 36
  }, ...t.columns] : t.columns), [E, he] = h({}), [B, G] = h(/* @__PURE__ */ new Set()), [fe, ze] = h(0), v = (e) => t.getRowId?.(e, 0) ?? e.id, be = (e) => (t.getSubRows ?? on)(e), N = (e) => {
    if (!t.loadChildren || !t.hasChildren?.(e)) return !1;
    const n = v(e);
    return n !== void 0 && E()[n] === void 0;
  }, me = async (e) => {
    const n = v(e);
    if (!(n === void 0 || !t.loadChildren) && !(B().has(n) || E()[n] !== void 0)) {
      G((l) => new Set(l).add(n));
      try {
        const l = await t.loadChildren(e);
        he((i) => ({
          ...i,
          [n]: l
        })), ze((i) => i + 1);
      } catch (l) {
        if (t.onLoadChildrenError) t.onLoadChildrenError(l, e);
        else throw l;
      } finally {
        G((l) => {
          const i = new Set(l);
          return i.delete(n), i;
        });
      }
    }
  }, K = (e) => {
    const n = v(e.original);
    return n !== void 0 && B().has(n);
  }, S = (e, n) => {
    n && N(e.original) && me(e.original), e.toggleExpanded(n);
  }, o = Le({
    get data() {
      return fe() > 0 ? [...t.data ?? []] : t.data;
    },
    get columns() {
      return ue();
    },
    state: {
      get expanded() {
        return H();
      },
      get sorting() {
        return L();
      },
      get rowSelection() {
        return A();
      },
      get globalFilter() {
        return k();
      },
      get pagination() {
        return V();
      }
    },
    get getSubRows() {
      const e = E();
      return (n) => {
        const l = v(n);
        return l !== void 0 && e[l] !== void 0 ? e[l] : be(n);
      };
    },
    /* A row that says it has children is expandable before it has any. */
    getRowCanExpand: (e) => e.subRows.length > 0 || N(e.original),
    get getRowId() {
      return t.getRowId;
    },
    get enableSorting() {
      return t.enableSorting ?? !0;
    },
    get enableRowSelection() {
      return !!t.enableRowSelection;
    },
    get enableSubRowSelection() {
      return t.enableSubRowSelection ?? !0;
    },
    /*
     * Filter from the leaves up, so a matching child keeps its ancestors on
     * screen. The default drops any row that does not match ITSELF, which for a
     * tree means a hit three levels down takes its whole path with it and the
     * user sees an empty table while the count says otherwise.
     */
    filterFromLeafRows: !0,
    onExpandedChange: (e) => {
      const n = typeof e == "function" ? e(H()) : e;
      t.expanded === void 0 && le(n), t.onExpandedChange?.(n);
    },
    onSortingChange: (e) => {
      const n = typeof e == "function" ? e(L()) : e;
      t.sorting === void 0 && ie(n), t.onSortingChange?.(n);
    },
    onRowSelectionChange: (e) => {
      const n = typeof e == "function" ? e(A()) : e;
      t.rowSelection === void 0 && oe(n), t.onRowSelectionChange?.(n);
    },
    onGlobalFilterChange: (e) => {
      const n = typeof e == "function" ? e(k()) : e;
      t.globalFilter === void 0 && ge(n), t.onGlobalFilterChange?.(n);
    },
    getCoreRowModel: Ue(),
    getExpandedRowModel: Oe(),
    /*
     * The whole reason pagination is coherent here. With this false, TanStack
     * pages the ROOT rows and keeps every expanded descendant on the same page
     * as its parent. Left at its default (true) it pages the flattened list,
     * which puts half a subtree on page 2 under no parent at all.
     */
    paginateExpandedRows: !1,
    onPaginationChange: (e) => {
      const n = typeof e == "function" ? e(V()) : e;
      se(n), t.onPaginationChange?.(n);
    },
    get getPaginationRowModel() {
      return t.enablePagination ? Je() : void 0;
    },
    get getSortedRowModel() {
      return t.enableSorting ?? !0 ? qe() : void 0;
    },
    get getFilteredRowModel() {
      return t.enableGlobalFilter ? We() : void 0;
    }
  }), c = () => o.getRowModel().rows, xe = () => t.hierarchyColumnId ? t.hierarchyColumnId : o.getVisibleLeafColumns().find((e) => !e.id.startsWith("__"))?.id, ve = X(() => {
    const e = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map();
    for (const l of c()) {
      const i = l.parentId ?? "", a = n.get(i);
      a ? a.push(l) : n.set(i, [l]);
    }
    for (const l of n.values())
      l.forEach((i, a) => e.set(i.id, {
        pos: a + 1,
        size: l.length
      }));
    return e;
  }), j = /* @__PURE__ */ new Map(), [Se, O] = h(null), we = () => Se() ?? c()[0]?.id, w = (e) => {
    e && (O(e), j.get(e)?.focus());
  }, _ = (e, n) => {
    const l = c(), i = l.findIndex((a) => a.id === e.id);
    w(l[i + n]?.id);
  }, Ce = (e, n) => {
    const l = Ae(e.key, e.currentTarget);
    e.key === "ArrowDown" ? (e.preventDefault(), _(n, 1)) : e.key === "ArrowUp" ? (e.preventDefault(), _(n, -1)) : l === 1 ? (e.preventDefault(), n.getCanExpand() && !n.getIsExpanded() ? S(n, !0) : n.getIsExpanded() && _(n, 1)) : l === -1 ? (e.preventDefault(), n.getIsExpanded() ? S(n, !1) : n.parentId && w(n.parentId)) : e.key === "Home" ? (e.preventDefault(), w(c()[0]?.id)) : e.key === "End" ? (e.preventDefault(), w(c()[c().length - 1]?.id)) : (e.key === "Enter" || e.key === " ") && (t.onRowClick ? (e.preventDefault(), t.onRowClick(n)) : n.getCanExpand() && (e.preventDefault(), S(n, !n.getIsExpanded())));
  };
  let U;
  const $ = He({
    get count() {
      return c().length;
    },
    getScrollElement: () => U?.parentElement ?? null,
    estimateSize: () => t.rowEstimatedHeight ?? 44,
    overscan: 8
  }), f = () => !!t.enableVirtualization && !!t.maxBodyHeight, p = () => $.getVirtualItems(), ye = () => f() ? p().map((e) => c()[e.index]).filter(Boolean) : c(), W = () => p()[0]?.start ?? 0, q = () => {
    const e = p(), n = e[e.length - 1];
    return n ? $.getTotalSize() - n.end : 0;
  }, Re = () => t.headerVariant === "branded" ? "zen-bg-zen-primary-soft [&>th]:zen-text-zen-primary-soft-fg [&>th]:zen-font-semibold" : "", Ie = () => t.headerVariant === "underline" ? "[&_tr:last-child]:zen-border-b-2 [&_tr:last-child]:zen-border-zen-primary" : "", ke = () => t.stickyHeader ? t.headerVariant === "branded" ? "zen-sticky zen-top-0 zen-z-10" : "zen-sticky zen-top-0 zen-z-10 zen-bg-zen-background" : "", Ee = () => t.enableGlobalFilter || (t.enableExpandAll ?? !0);
  return Ve(() => {
    t.enableVirtualization && !t.maxBodyHeight && console.warn("[TreeTable] `enableVirtualization` needs `maxBodyHeight` — without a bounded scroller there is no window. Rendering all rows.");
  }), (() => {
    var e = Ze();
    return d(e, r(s, {
      get when() {
        return Ee();
      },
      get children() {
        var n = Qe();
        return d(n, r(s, {
          get when() {
            return t.enableGlobalFilter;
          },
          get children() {
            return r(je, {
              get value() {
                return k();
              },
              onInput: (l) => o.setGlobalFilter(l.currentTarget.value),
              get placeholder() {
                return t.globalFilterPlaceholder ?? "Search…";
              },
              class: "zen-max-w-xs",
              "aria-label": "Search"
            });
          }
        }), null), d(n, r(s, {
          get when() {
            return t.enableExpandAll ?? !0;
          },
          get children() {
            return r(D, {
              variant: "outline",
              size: "sm",
              onClick: () => o.toggleAllRowsExpanded(),
              get "aria-expanded"() {
                return o.getIsAllRowsExpanded();
              },
              get children() {
                return [r(M, {
                  get name() {
                    return o.getIsAllRowsExpanded() ? "chevron-down" : "chevron-right";
                  },
                  size: 14
                }), g(() => o.getIsAllRowsExpanded() ? "Collapse all" : "Expand all")];
              }
            });
          }
        }), null), n;
      }
    }), null), d(e, r(Be, {
      ref: (n) => U = n,
      role: "treegrid",
      get "aria-busy"() {
        return t.loading || void 0;
      },
      get "aria-rowcount"() {
        return g(() => !!f())() ? c().length : void 0;
      },
      get containerClass() {
        return t.maxBodyHeight ? "zen-overflow-auto" : void 0;
      },
      get containerStyle() {
        return g(() => !!t.maxBodyHeight)() ? {
          "max-height": `${t.maxBodyHeight}px`
        } : void 0;
      },
      get children() {
        return [r(Ge, {
          get class() {
            return Ie();
          },
          get children() {
            return r(x, {
              get each() {
                return o.getHeaderGroups();
              },
              children: (n) => r(T, {
                get class() {
                  return I(Re(), ke());
                },
                get children() {
                  return r(x, {
                    get each() {
                      return n.headers;
                    },
                    children: (l) => {
                      const i = () => l.column.getIsSorted();
                      return r(Ne, {
                        get style() {
                          return g(() => !!l.column.getSize())() ? {
                            width: `${l.getSize()}px`
                          } : void 0;
                        },
                        get "aria-sort"() {
                          return g(() => i() === "asc")() ? "ascending" : g(() => i() === "desc")() ? "descending" : l.column.getCanSort() ? "none" : void 0;
                        },
                        get children() {
                          return r(s, {
                            get when() {
                              return !l.isPlaceholder;
                            },
                            get children() {
                              return r(s, {
                                get when() {
                                  return l.column.getCanSort();
                                },
                                get fallback() {
                                  return R(l.column.columnDef.header, l.getContext());
                                },
                                get children() {
                                  var a = en();
                                  return Pe(a, "click", l.column.getToggleSortingHandler(), !0), d(a, () => R(l.column.columnDef.header, l.getContext()), null), d(a, r(s, {
                                    get when() {
                                      return i();
                                    },
                                    get children() {
                                      return r(M, {
                                        get name() {
                                          return i() === "asc" ? "chevron-up" : "chevron-down";
                                        },
                                        size: 12
                                      });
                                    }
                                  }), null), a;
                                }
                              });
                            }
                          });
                        }
                      });
                    }
                  });
                }
              })
            });
          }
        }), r(Ke, {
          get children() {
            return r(s, {
              get when() {
                return g(() => !t.loading)() && c().length > 0;
              },
              get fallback() {
                return r(T, {
                  get children() {
                    return r(Y, {
                      get colSpan() {
                        return o.getVisibleLeafColumns().length;
                      },
                      class: "zen-h-24 zen-text-center zen-text-zen-muted-fg",
                      get children() {
                        return g(() => !!t.loading)() ? "Loading…" : t.emptyMessage ?? "No results.";
                      }
                    });
                  }
                });
              },
              get children() {
                return [r(s, {
                  get when() {
                    return g(() => !!f())() && W() > 0;
                  },
                  get children() {
                    var n = ee();
                    return b((l) => F(n, "height", `${W()}px`)), n;
                  }
                }), r(x, {
                  get each() {
                    return ye();
                  },
                  children: (n) => _e(n)
                }), r(s, {
                  get when() {
                    return g(() => !!f())() && q() > 0;
                  },
                  get children() {
                    var n = ee();
                    return b((l) => F(n, "height", `${q()}px`)), n;
                  }
                })];
              }
            });
          }
        })];
      }
    }), null), d(e, r(s, {
      get when() {
        return t.enablePagination;
      },
      get children() {
        var n = Ye(), l = n.firstChild, i = l.firstChild, a = i.nextSibling, m = a.nextSibling, J = m.nextSibling, $e = J.nextSibling, Q = $e.nextSibling;
        Q.nextSibling;
        var P = l.nextSibling;
        return d(l, () => o.getState().pagination.pageIndex + 1, a), d(l, () => Math.max(1, o.getPageCount()), J), d(l, () => o.getPreFilteredRowModel().rows.filter((z) => z.depth === 0).length, Q), d(P, r(s, {
          get when() {
            return t.pageSizeOptions?.length;
          },
          get children() {
            var z = Xe();
            return z.addEventListener("change", (C) => o.setPageSize(Number(C.currentTarget.value))), d(z, r(x, {
              get each() {
                return t.pageSizeOptions;
              },
              children: (C) => (() => {
                var y = nn(), pe = y.firstChild;
                return y.value = C, d(y, C, pe), y;
              })()
            })), b(() => z.value = o.getState().pagination.pageSize), z;
          }
        }), null), d(P, r(D, {
          variant: "outline",
          size: "sm",
          get disabled() {
            return !o.getCanPreviousPage();
          },
          onClick: () => o.previousPage(),
          children: "Previous"
        }), null), d(P, r(D, {
          variant: "outline",
          size: "sm",
          get disabled() {
            return !o.getCanNextPage();
          },
          onClick: () => o.nextPage(),
          children: "Next"
        }), null), n;
      }
    }), null), b(() => Fe(e, I("zen-flex zen-w-full zen-flex-col zen-gap-3", ne.class))), e;
  })();
  function _e(e) {
    const n = () => ve().get(e.id);
    return r(T, {
      ref: (l) => {
        j.set(e.id, l), f() && $.measureElement(l);
      },
      get "data-index"() {
        return g(() => !!f())() ? c().findIndex((l) => l.id === e.id) : void 0;
      },
      get "data-state"() {
        return e.getIsSelected() ? "selected" : void 0;
      },
      get "data-depth"() {
        return e.depth;
      },
      get class() {
        return I("focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-inset", t.onRowClick && "zen-cursor-pointer", t.rowClassName?.(e));
      },
      get "aria-level"() {
        return e.depth + 1;
      },
      get "aria-expanded"() {
        return g(() => !!e.getCanExpand())() ? e.getIsExpanded() : void 0;
      },
      get "aria-rowindex"() {
        return g(() => !!f())() ? c().findIndex((l) => l.id === e.id) + 1 : void 0;
      },
      get "aria-posinset"() {
        return n()?.pos;
      },
      get "aria-setsize"() {
        return n()?.size;
      },
      get "aria-selected"() {
        return g(() => !!t.enableRowSelection)() ? e.getIsSelected() : void 0;
      },
      get tabIndex() {
        return we() === e.id ? 0 : -1;
      },
      onFocus: () => O(e.id),
      onKeyDown: (l) => Ce(l, e),
      onClick: () => t.onRowClick?.(e),
      get children() {
        return r(x, {
          get each() {
            return e.getVisibleCells();
          },
          children: (l) => r(Y, {
            get children() {
              return r(s, {
                get when() {
                  return l.column.id === xe();
                },
                get fallback() {
                  return R(l.column.columnDef.cell, l.getContext());
                },
                get children() {
                  var i = rn();
                  return d(i, r(s, {
                    get when() {
                      return e.getCanExpand();
                    },
                    get fallback() {
                      return an();
                    },
                    get children() {
                      var a = ln();
                      return a.$$click = (m) => {
                        m.stopPropagation(), S(e, !e.getIsExpanded());
                      }, d(a, r(s, {
                        get when() {
                          return K(e);
                        },
                        get fallback() {
                          return r(M, {
                            name: "chevron-right",
                            size: 14,
                            get class() {
                              return I("zen-transition-transform", e.getIsExpanded() && "zen-rotate-90");
                            }
                          });
                        },
                        get children() {
                          return tn();
                        }
                      })), b(() => Te(a, "aria-busy", K(e) || void 0)), a;
                    }
                  }), null), d(i, () => R(l.column.columnDef.cell, l.getContext()), null), b((a) => F(i, "padding-inline-start", `${e.depth * ce()}px`)), i;
                }
              });
            }
          })
        });
      }
    });
  }
}
Me(["click"]);
export {
  wn as TreeTable
};
//# sourceMappingURL=index76.js.map
