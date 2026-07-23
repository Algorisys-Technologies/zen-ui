import { template as v, insert as c, createComponent as s, effect as u, setAttribute as b, className as f, style as S, setStyleProperty as y, use as le } from "solid-js/web";
import { createSignal as q, createEffect as J, createMemo as V, untrack as de, For as D, Show as g, Index as Q, onCleanup as ze } from "solid-js";
import { createVirtualizer as se } from "./index136.js";
import { cn as w } from "./index103.js";
var U = /* @__PURE__ */ v('<tr class="zen-border-0 hover:zen-bg-transparent"><td class="zen-border-0 zen-p-0"aria-hidden=true>'), ce = /* @__PURE__ */ v('<div class="zen-flex zen-flex-col zen-gap-2 zen-w-full zen-h-full zen-min-h-0 zen-min-w-0"><div class="zen-flex-1 zen-min-h-0 zen-min-w-0 zen-w-full zen-overflow-auto zen-overscroll-contain zen-rounded-none zen-border-l zen-border-t zen-border-zen-border zen-bg-zen-background"role=region tabindex=0><table class="zen-w-max zen-min-w-full zen-shrink-0 zen-border-separate zen-border-spacing-0 zen-text-zen-foreground"style=border-collapse:separate><thead class=zen-bg-zen-muted></thead><tbody>'), X = /* @__PURE__ */ v('<th class="zen-sticky zen-z-10 zen-border-0 zen-bg-zen-muted zen-p-0"aria-hidden=true>'), Z = /* @__PURE__ */ v('<tr class="zen-border-b zen-border-zen-border/60 zen-bg-transparent even:zen-bg-transparent hover:zen-bg-transparent">'), he = /* @__PURE__ */ v('<span class="zen-block zen-mt-auto">'), ue = /* @__PURE__ */ v("<th role=columnheader scope=col>"), ge = /* @__PURE__ */ v('<th role=columnheader scope=col class="zen-sticky zen-z-10 zen-bg-zen-background zen-border-b zen-border-r zen-border-zen-border/50 zen-px-2 zen-py-1 zen-text-start zen-text-xs zen-font-medium zen-text-zen-foreground zen-truncate">'), O = /* @__PURE__ */ v("<div>"), ee = /* @__PURE__ */ v("<td aria-hidden=true>"), me = /* @__PURE__ */ v("<span class=zen-block>"), ve = /* @__PURE__ */ v("<th role=rowheader scope=row>"), xe = /* @__PURE__ */ v("<td>");
const be = "zen-px-2 zen-py-1 zen-text-start zen-text-sm zen-font-medium zen-text-zen-muted-fg zen-capitalize", fe = "zen-px-2 zen-py-1 zen-text-start zen-text-xs zen-font-medium zen-normal-case zen-tracking-normal zen-text-zen-foreground zen-break-words zen-leading-tight", we = "zen-sticky zen-z-30 zen-box-border zen-border-r zen-border-zen-border zen-bg-zen-muted zen-shadow-[1px_0_0_0_var(--zen-border)]", $e = "zen-sticky zen-z-20 zen-border-r zen-border-zen-border zen-shadow-[1px_0_0_0_var(--zen-border)]";
function P(d) {
  return d % 2 === 1 ? "zen-bg-zen-muted" : "zen-bg-zen-background";
}
function T(d) {
  return {
    width: `${d}px`,
    "min-width": `${d}px`
  };
}
const B = "zen-rounded-sm zen-bg-zen-muted-fg/25 motion-safe:zen-animate-pulse";
function Le(d) {
  const C = () => d.rowHeight || 25, L = () => d.colWidth || 200, x = () => d.rowHeaderWidth || 160, W = () => ({
    height: `${C()}px`,
    "min-height": `${C()}px`,
    "max-height": `${C()}px`
  });
  function N(o) {
    return {
      left: `${o * x()}px`
    };
  }
  function A(o) {
    return {
      top: `${o * C()}px`
    };
  }
  let $;
  const k = se({
    get count() {
      return d.totalRows;
    },
    getScrollElement: () => $,
    estimateSize: () => C(),
    overscan: 8
  }), [te, ne] = q(0), [re, ae] = q(1024), oe = () => {
    $ && ne($.scrollLeft);
  };
  J(() => {
    if ($) {
      const o = new ResizeObserver((h) => {
        ae(h[0].contentRect.width);
      });
      o.observe($), ze(() => o.disconnect());
    }
  });
  const K = () => d.rowHeaderDepth * x(), m = V(() => {
    const o = d.totalCols, h = K();
    if (o <= 0) return {
      minIndex: 0,
      maxIndex: -1,
      items: [],
      paddingLeft: 0,
      paddingRight: 0
    };
    const H = Math.max(0, te()), _ = Math.max(0, Math.floor((H - h) / L()) - 4), M = Math.min(o - 1, Math.ceil((H + re() - h) / L()) + 4), R = Math.max(_, M), i = [];
    for (let l = _; l <= R; l++)
      i.push({
        index: l,
        size: L()
      });
    return {
      minIndex: _,
      maxIndex: R,
      items: i,
      paddingLeft: _ * L(),
      paddingRight: Math.max(0, (o - R - 1) * L())
    };
  });
  J(() => {
    const o = k.getVirtualItems(), h = m();
    o.length !== 0 && de(() => d.onVisibleRangeChange?.({
      rowStart: o[0].index,
      rowEnd: o[o.length - 1].index,
      colStart: h.minIndex,
      colEnd: h.maxIndex
    }));
  });
  const Y = () => {
    const o = k.getVirtualItems();
    return o.length > 0 ? o[0].start : 0;
  }, F = () => {
    const o = k.getVirtualItems();
    if (o.length === 0) return Math.max(0, k.getTotalSize());
    const h = o[o.length - 1];
    return Math.max(0, k.getTotalSize() - h.end);
  }, ie = () => K() + d.totalCols * L(), G = () => d.rowHeaderDepth + Math.max(m().items.length, 1) + 2, j = () => Array.from({
    length: Math.max(d.colHeaderDepth, 1)
  }, (o, h) => h);
  return (() => {
    var o = ce(), h = o.firstChild, H = h.firstChild, _ = H.firstChild, M = _.nextSibling;
    h.addEventListener("scroll", oe);
    var R = $;
    return typeof R == "function" ? le(R, h) : $ = h, c(_, s(D, {
      get each() {
        return j();
      },
      children: (i) => (() => {
        var l = Z();
        return c(l, s(g, {
          get when() {
            return d.rowHeaderDepth > 0;
          },
          get children() {
            return s(Q, {
              get each() {
                return Array.from({
                  length: d.rowHeaderDepth
                });
              },
              children: (r, e) => {
                const a = V(() => d.layout.rows[e]?.replace(/_/g, " ") || "");
                return (() => {
                  var t = ue();
                  return c(t, s(g, {
                    get when() {
                      return i === j().length - 1;
                    },
                    get children() {
                      var n = he();
                      return c(n, a), u(() => b(n, "title", a())), n;
                    }
                  })), u((n) => {
                    var z = w(we, be, "zen-align-bottom"), p = {
                      // Index hands back a NUMBER, where For hands back
                      // an accessor. Calling it would throw.
                      ...N(e),
                      ...A(i),
                      ...W(),
                      width: `${x()}px`,
                      "min-width": `${x()}px`,
                      "max-width": `${x()}px`
                    };
                    return z !== n.e && f(t, n.e = z), n.t = S(t, p, n.t), n;
                  }, {
                    e: void 0,
                    t: void 0
                  }), t;
                })();
              }
            });
          }
        }), null), c(l, s(g, {
          get when() {
            return m().paddingLeft > 0;
          },
          get children() {
            var r = X();
            return u((e) => S(r, {
              ...A(i),
              ...W(),
              ...T(m().paddingLeft)
            }, e)), r;
          }
        }), null), c(l, s(D, {
          get each() {
            return m().items;
          },
          children: (r) => {
            const e = V(() => d.getColHeader(i, r.index));
            return s(g, {
              get when() {
                return e()?.isVisible !== !1;
              },
              get children() {
                var a = ge();
                return c(a, s(g, {
                  get when() {
                    return !e()?.isLoading;
                  },
                  get fallback() {
                    return (() => {
                      var t = O();
                      return u(() => f(t, w("zen-h-3 zen-w-full", B))), t;
                    })();
                  },
                  get children() {
                    return e()?.value || "";
                  }
                })), u((t) => {
                  var n = e()?.colSpan || 1, z = {
                    width: `${r.size * (e()?.colSpan || 1)}px`,
                    "min-width": `${r.size * (e()?.colSpan || 1)}px`,
                    "max-width": `${r.size * (e()?.colSpan || 1)}px`,
                    ...W(),
                    ...A(i)
                  };
                  return n !== t.e && b(a, "colspan", t.e = n), t.t = S(a, z, t.t), t;
                }, {
                  e: void 0,
                  t: void 0
                }), a;
              }
            });
          }
        }), null), c(l, s(g, {
          get when() {
            return m().paddingRight > 0;
          },
          get children() {
            var r = X();
            return u((e) => S(r, {
              ...A(i),
              ...W(),
              ...T(m().paddingRight)
            }, e)), r;
          }
        }), null), l;
      })()
    })), c(M, s(g, {
      get when() {
        return Y() > 0;
      },
      get children() {
        var i = U(), l = i.firstChild;
        return u((r) => {
          var e = Math.max(G(), 1), a = `${Y()}px`;
          return e !== r.e && b(l, "colspan", r.e = e), a !== r.t && y(l, "height", r.t = a), r;
        }, {
          e: void 0,
          t: void 0
        }), i;
      }
    }), null), c(M, s(D, {
      get each() {
        return k.getVirtualItems();
      },
      children: (i) => {
        const l = i.index;
        return (() => {
          var r = Z();
          return c(r, s(g, {
            get when() {
              return d.rowHeaderDepth > 0;
            },
            get children() {
              return s(Q, {
                get each() {
                  return Array.from({
                    length: d.rowHeaderDepth
                  });
                },
                children: (e, a) => {
                  const t = V(() => d.getRowHeader(l, a));
                  return s(g, {
                    get when() {
                      return t()?.isVisible !== !1;
                    },
                    get children() {
                      var n = ve();
                      return c(n, s(g, {
                        get when() {
                          return !t()?.isLoading;
                        },
                        get fallback() {
                          return (() => {
                            var z = O();
                            return u(() => f(z, w("zen-h-3 zen-w-1/2", B))), z;
                          })();
                        },
                        get children() {
                          var z = me();
                          return c(z, () => t()?.value || ""), u(() => b(z, "title", t()?.value)), z;
                        }
                      })), u((z) => {
                        var p = w($e, fe, "zen-bg-zen-background zen-align-top", l > 0 && t()?.isVisible !== !1 ? "zen-border-t zen-border-zen-border/50" : "zen-border-t-0"), E = t()?.rowSpan || 1, I = {
                          ...N(a),
                          width: `${x()}px`,
                          "min-width": `${x()}px`,
                          "max-width": `${x()}px`
                        };
                        return p !== z.e && f(n, z.e = p), E !== z.t && b(n, "rowspan", z.t = E), z.a = S(n, I, z.a), z;
                      }, {
                        e: void 0,
                        t: void 0,
                        a: void 0
                      }), n;
                    }
                  });
                }
              });
            }
          }), null), c(r, s(g, {
            get when() {
              return m().paddingLeft > 0;
            },
            get children() {
              var e = ee();
              return u((a) => {
                var t = w("zen-border-0 zen-p-0", P(l)), n = T(m().paddingLeft);
                return t !== a.e && f(e, a.e = t), a.t = S(e, n, a.t), a;
              }, {
                e: void 0,
                t: void 0
              }), e;
            }
          }), null), c(r, s(D, {
            get each() {
              return m().items;
            },
            children: (e) => {
              const a = V(() => d.getCell(l, e.index));
              return (() => {
                var t = xe();
                return c(t, s(g, {
                  get when() {
                    return !a()?.isLoading;
                  },
                  get fallback() {
                    return (() => {
                      var n = O();
                      return u(() => f(n, w("zen-ml-auto zen-h-3 zen-w-10", B))), n;
                    })();
                  },
                  get children() {
                    return a()?.value ?? "-";
                  }
                })), u((n) => {
                  var z = w("zen-border-r zen-border-b zen-border-zen-border/50 zen-px-2 zen-py-1 zen-text-end zen-text-sm zen-tabular-nums zen-truncate", P(l)), p = `${e.size}px`, E = `${e.size}px`, I = `${e.size}px`;
                  return z !== n.e && f(t, n.e = z), p !== n.t && y(t, "width", n.t = p), E !== n.a && y(t, "min-width", n.a = E), I !== n.o && y(t, "max-width", n.o = I), n;
                }, {
                  e: void 0,
                  t: void 0,
                  a: void 0,
                  o: void 0
                }), t;
              })();
            }
          }), null), c(r, s(g, {
            get when() {
              return m().paddingRight > 0;
            },
            get children() {
              var e = ee();
              return u((a) => {
                var t = w("zen-border-0 zen-p-0", P(l)), n = T(m().paddingRight);
                return t !== a.e && f(e, a.e = t), a.t = S(e, n, a.t), a;
              }, {
                e: void 0,
                t: void 0
              }), e;
            }
          }), null), u((e) => {
            var a = `${i.size}px`, t = i.index;
            return a !== e.e && y(r, "height", e.e = a), t !== e.t && b(r, "data-index", e.t = t), e;
          }, {
            e: void 0,
            t: void 0
          }), r;
        })();
      }
    }), null), c(M, s(g, {
      get when() {
        return F() > 0;
      },
      get children() {
        var i = U(), l = i.firstChild;
        return u((r) => {
          var e = Math.max(G(), 1), a = `${F()}px`;
          return e !== r.e && b(l, "colspan", r.e = e), a !== r.t && y(l, "height", r.t = a), r;
        }, {
          e: void 0,
          t: void 0
        }), i;
      }
    }), null), u((i) => {
      var l = d.label ?? "Pivot grid", r = `${ie()}px`;
      return l !== i.e && b(h, "aria-label", i.e = l), r !== i.t && y(H, "width", i.t = r), i;
    }, {
      e: void 0,
      t: void 0
    }), o;
  })();
}
export {
  Le as PivotGrid
};
//# sourceMappingURL=index108.js.map
