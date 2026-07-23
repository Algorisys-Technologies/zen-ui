import { createComponent as l, template as v, insert as u, effect as b, className as _, setAttribute as x, Portal as ie, memo as $, setStyleProperty as J, use as D, delegateEvents as le } from "solid-js/web";
import { createSignal as V, createEffect as Q, onCleanup as oe, Show as c } from "solid-js";
import { PivotFilterVirtualList as ae } from "./index148.js";
import { Loading as se } from "./index33.js";
import { isFilterActive as ce } from "./index71.js";
import { usePivotFilterOptions as ue } from "./index149.js";
import { Icon as f } from "./index21.js";
import { cn as P } from "./index103.js";
var de = /* @__PURE__ */ v("<button type=button aria-haspopup=dialog>"), ze = /* @__PURE__ */ v('<div class="zen-flex zen-flex-col zen-border-b zen-border-zen-border zen-p-1"><button type=button><span>Sort ascending</span></button><button type=button><span>Sort descending'), fe = /* @__PURE__ */ v('<div class="zen-border-b zen-border-zen-border zen-p-1"><button type=button class="zen-flex zen-w-full zen-cursor-pointer zen-items-center zen-gap-2 zen-rounded-md zen-px-2 zen-py-1.5 zen-text-start zen-text-sm zen-font-medium zen-transition-colors hover:zen-bg-zen-muted hover:zen-text-zen-foreground focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-primary/50"><span aria-hidden=true></span><span>Select all'), ge = /* @__PURE__ */ v('<div role=listbox aria-busy=true class="zen-max-h-64 zen-overflow-y-auto zen-p-1"><div class="zen-flex zen-flex-col zen-items-center zen-justify-center zen-gap-2 zen-px-2 zen-py-6">'), he = /* @__PURE__ */ v('<div class="zen-flex zen-flex-col zen-items-start zen-gap-1 zen-px-2 zen-py-3"role=alert><p class="zen-m-0 zen-text-sm zen-text-zen-error">Could not load values.</p><button type=button class="zen-cursor-pointer zen-border-0 zen-bg-transparent zen-p-0 zen-text-xs zen-text-zen-primary hover:zen-underline">Try again'), me = /* @__PURE__ */ v('<div role=listbox class="zen-max-h-64 zen-overflow-y-auto zen-p-1"><p class="zen-px-2 zen-py-1.5 zen-text-sm zen-text-zen-muted-fg">No matching values'), ve = /* @__PURE__ */ v('<div class="zen-border-t zen-border-zen-border zen-p-1"><button type=button class="zen-w-full zen-cursor-pointer zen-rounded-md zen-px-2 zen-py-1.5 zen-text-start zen-text-sm zen-text-zen-muted-fg zen-transition-colors hover:zen-bg-zen-muted hover:zen-text-zen-foreground focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-primary/50">Clear filter'), be = /* @__PURE__ */ v('<div role=dialog class="zen-fixed zen-z-50 zen-flex zen-w-72 zen-flex-col zen-rounded-md zen-border zen-border-zen-border zen-bg-zen-background zen-text-zen-foreground zen-shadow-md"><div class="zen-border-b zen-border-zen-border zen-px-3 zen-py-2"><input type=text class="zen-h-7 zen-w-full zen-border-0 zen-bg-transparent zen-text-sm zen-text-zen-foreground zen-outline-none placeholder:zen-font-normal placeholder:zen-text-zen-muted-fg">');
const xe = 288, L = 8, O = 4;
function U() {
  if (typeof document > "u")
    return 0;
  const n = document.querySelector("header");
  return n instanceof HTMLElement ? n.getBoundingClientRect().bottom : 0;
}
function we(n) {
  const g = U();
  return !(g > 0 && n.bottom <= g || n.top >= window.innerHeight);
}
const Le = (n) => {
  const [g, w] = V(!1), [E, T] = V(""), [B, F] = V({
    top: 0,
    left: 0
  });
  let d, C, A;
  const {
    loading: p,
    loadingWindow: H,
    optionsWindows: N,
    totalCount: y,
    handleVisibleRange: Y,
    scheduleFetch: Z,
    openPanelFetch: W,
    loadError: M
  } = ue({
    // Getters, not values. Read plainly, these capture whatever columnKey and
    // loadOptions were at setup — so a chip reused for a different field would
    // keep fetching the old one's members. Reading through props is the whole
    // contract of a Solid props object.
    get columnKey() {
      return n.columnKey;
    },
    isOpen: g,
    getOptionSearch: E,
    get loadOptions() {
      return n.loadOptions;
    }
  }), k = () => ce(n.selection()), ee = (e) => n.formatValue ? n.formatValue(e) : e;
  function I(e) {
    n.onSort?.(n.sortDirection === e ? null : e), w(!1);
  }
  function j(e) {
    const r = window.innerWidth - xe - L;
    return Math.min(Math.max(e, L), r);
  }
  function K() {
    if (!d)
      return;
    const e = d.getBoundingClientRect(), r = U() + L;
    let i = e.bottom + O;
    const s = C?.offsetHeight ?? 0;
    s > 0 && i + s > window.innerHeight - L && (i = Math.max(r, e.top - O - s)), F({
      top: i,
      left: j(e.left)
    });
  }
  function ne() {
    if (!d)
      return;
    const e = d.getBoundingClientRect();
    F({
      top: e.bottom + O,
      left: j(e.left)
    });
    const r = n.selection(), i = r?.kind === "all" ? r.optionSearch ?? "" : "";
    T(i), w(!0), W();
  }
  function te(e) {
    if (n.singleSelect) {
      const a = n.selection(), t = a?.kind === "include" ? a.values : [];
      t.length === 1 && t[0] === e ? n.onChange(null) : n.onChange({
        kind: "include",
        values: [e]
      });
      return;
    }
    const r = n.selection();
    if (!r || r.kind === "all") {
      const a = r?.kind === "all" ? r.exclude : [], t = a.includes(e) ? a.filter((o) => o !== e) : [...a, e];
      if (t.length === 0 && (!r || r.kind !== "all" || !r.optionSearch)) {
        n.onChange(null);
        return;
      }
      n.onChange({
        kind: "all",
        ...r?.kind === "all" && r.optionSearch ? {
          optionSearch: r.optionSearch
        } : {},
        exclude: t
      });
      return;
    }
    const i = r.kind === "include" ? r.values : [], s = i.includes(e) ? i.filter((a) => a !== e) : [...i, e];
    n.onChange({
      kind: "include",
      values: s
    });
  }
  const R = () => {
    const e = n.selection();
    return e ? e.kind === "all" && e.exclude.length === 0 : !0;
  }, X = () => {
    const e = n.selection();
    return e ? e.kind === "include" ? e.values.length > 0 : e.exclude.length > 0 : !1;
  };
  function re() {
    const e = n.selection(), r = E().trim();
    if (!e || e.kind === "all" && (e.optionSearch ?? "") === r && e.exclude.length === 0) {
      n.onChange({
        kind: "include",
        values: []
      });
      return;
    }
    r ? n.onChange({
      kind: "all",
      optionSearch: r,
      exclude: []
    }) : n.onChange(null);
  }
  return Q(() => {
    g() && (k(), p(), H(), y(), N(), K());
  }), Q(() => {
    if (!g())
      return;
    A?.focus();
    const e = (s) => {
      const a = s.target;
      d?.contains(a) || C?.contains(a) || w(!1);
    }, r = (s) => {
      s.key === "Escape" && (w(!1), d?.focus());
    }, i = () => {
      if (!d)
        return;
      const s = d.getBoundingClientRect();
      if (!we(s)) {
        w(!1);
        return;
      }
      K();
    };
    document.addEventListener("pointerdown", e), document.addEventListener("keydown", r), window.addEventListener("scroll", i, !0), window.addEventListener("resize", i), oe(() => {
      document.removeEventListener("pointerdown", e), document.removeEventListener("keydown", r), window.removeEventListener("scroll", i, !0), window.removeEventListener("resize", i);
    });
  }), [(() => {
    var e = de();
    e.$$click = (i) => {
      i.stopPropagation(), g() ? w(!1) : ne();
    };
    var r = d;
    return typeof r == "function" ? D(r, e) : d = e, u(e, l(c, {
      get when() {
        return n.triggerChildren;
      },
      get fallback() {
        return [l(f, {
          name: "chevron-down",
          class: "zen-size-3.5",
          "aria-hidden": "true"
        }), l(c, {
          get when() {
            return k();
          },
          get children() {
            return l(f, {
              name: "filter",
              class: "zen-size-3.5",
              "aria-hidden": "true"
            });
          }
        }), l(c, {
          get when() {
            return n.sortDirection === "asc";
          },
          get children() {
            return l(f, {
              name: "arrow-up",
              class: "zen-size-3",
              "aria-hidden": "true"
            });
          }
        }), l(c, {
          get when() {
            return n.sortDirection === "desc";
          },
          get children() {
            return l(f, {
              name: "arrow-down",
              class: "zen-size-3",
              "aria-hidden": "true"
            });
          }
        })];
      },
      get children() {
        return n.triggerChildren;
      }
    })), b((i) => {
      var s = n.triggerClass ?? P("zen-inline-flex zen-min-h-11 zen-min-w-11 zen-cursor-pointer zen-items-center zen-justify-center zen-gap-1 zen-rounded-sm zen-p-2 zen-text-zen-muted-fg zen-transition-colors hover:zen-text-zen-foreground focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-primary/50", (k() || n.sortDirection) && "zen-text-zen-primary"), a = `Sort or filter ${n.label}`, t = g();
      return s !== i.e && _(e, i.e = s), a !== i.t && x(e, "aria-label", i.t = a), t !== i.a && x(e, "aria-expanded", i.a = t), i;
    }, {
      e: void 0,
      t: void 0,
      a: void 0
    }), e;
  })(), l(c, {
    get when() {
      return g();
    },
    get children() {
      return l(ie, {
        get children() {
          var e = be(), r = e.firstChild, i = r.firstChild, s = C;
          typeof s == "function" ? D(s, e) : C = e, u(e, l(c, {
            get when() {
              return n.onSort;
            },
            get children() {
              var t = ze(), o = t.firstChild, z = o.firstChild, h = o.nextSibling, S = h.firstChild;
              return o.$$click = () => {
                I("asc");
              }, u(o, l(f, {
                name: "arrow-up",
                class: "zen-size-3.5",
                "aria-hidden": "true"
              }), z), u(o, l(c, {
                get when() {
                  return n.sortDirection === "asc";
                },
                get children() {
                  return l(f, {
                    name: "check",
                    class: "zen-ml-auto zen-size-3.5",
                    "aria-hidden": "true"
                  });
                }
              }), null), h.$$click = () => {
                I("desc");
              }, u(h, l(f, {
                name: "arrow-down",
                class: "zen-size-3.5",
                "aria-hidden": "true"
              }), S), u(h, l(c, {
                get when() {
                  return n.sortDirection === "desc";
                },
                get children() {
                  return l(f, {
                    name: "check",
                    class: "zen-ml-auto zen-size-3.5",
                    "aria-hidden": "true"
                  });
                }
              }), null), b((m) => {
                var G = P("zen-flex zen-w-full zen-cursor-pointer zen-items-center zen-gap-2 zen-rounded-md zen-px-2 zen-py-1.5 zen-text-start zen-text-sm zen-transition-colors hover:zen-bg-zen-muted hover:zen-text-zen-foreground focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-primary/50", n.sortDirection === "asc" && "zen-font-medium zen-text-zen-primary"), q = P("zen-flex zen-w-full zen-cursor-pointer zen-items-center zen-gap-2 zen-rounded-md zen-px-2 zen-py-1.5 zen-text-start zen-text-sm zen-transition-colors hover:zen-bg-zen-muted hover:zen-text-zen-foreground focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-primary/50", n.sortDirection === "desc" && "zen-font-medium zen-text-zen-primary");
                return G !== m.e && _(o, m.e = G), q !== m.t && _(h, m.t = q), m;
              }, {
                e: void 0,
                t: void 0
              }), t;
            }
          }), r), i.$$input = (t) => {
            T(t.currentTarget.value), Z(t.currentTarget.value);
          };
          var a = A;
          return typeof a == "function" ? D(a, i) : A = i, u(e, l(c, {
            get when() {
              return $(() => y() > 0)() && !n.singleSelect;
            },
            get children() {
              var t = fe(), o = t.firstChild, z = o.firstChild;
              return o.$$click = re, u(z, l(c, {
                get when() {
                  return R();
                },
                get children() {
                  return l(f, {
                    name: "check",
                    class: "zen-size-3"
                  });
                }
              }), null), u(z, l(c, {
                get when() {
                  return $(() => !R())() && X();
                },
                get children() {
                  return l(f, {
                    name: "minus",
                    class: "zen-size-3"
                  });
                }
              }), null), b(() => _(z, P("zen-flex zen-size-4 zen-shrink-0 zen-items-center zen-justify-center zen-rounded-sm zen-border zen-border-zen-border zen-text-zen-primary-fg", (R() || X()) && "zen-border-zen-primary zen-bg-zen-primary"))), t;
            }
          }), null), u(e, l(c, {
            get when() {
              return $(() => !!p())() && y() === 0;
            },
            get children() {
              var t = ge(), o = t.firstChild;
              return u(o, l(se, {
                size: "sm",
                label: "Loading values…"
              })), b(() => x(t, "aria-label", `${n.label} values`)), t;
            }
          }), null), u(e, l(c, {
            get when() {
              return $(() => !p())() && M();
            },
            get children() {
              var t = he(), o = t.firstChild, z = o.nextSibling;
              return z.$$click = () => W(), t;
            }
          }), null), u(e, l(c, {
            get when() {
              return $(() => !p() && !M())() && y() === 0;
            },
            get children() {
              var t = me();
              return b(() => x(t, "aria-label", `${n.label} values`)), t;
            }
          }), null), u(e, l(c, {
            get when() {
              return $(() => y() > 0)() ? y() : !1;
            },
            keyed: !0,
            children: (t) => l(ae, {
              get label() {
                return n.label;
              },
              totalCount: t,
              get optionsWindows() {
                return N();
              },
              get loadingWindow() {
                return H();
              },
              get selection() {
                return n.selection;
              },
              formatValue: ee,
              onToggleValue: te,
              onVisibleRange: Y,
              get singleSelect() {
                return n.singleSelect;
              }
            })
          }), null), u(e, l(c, {
            get when() {
              return k();
            },
            get children() {
              var t = ve(), o = t.firstChild;
              return o.$$click = () => {
                n.onChange(null);
              }, t;
            }
          }), null), b((t) => {
            var o = `${n.label} filter`, z = `${B().top}px`, h = `${B().left}px`, S = `Search ${n.label.toLowerCase()}…`, m = `Search ${n.label.toLowerCase()} values`;
            return o !== t.e && x(e, "aria-label", t.e = o), z !== t.t && J(e, "top", t.t = z), h !== t.a && J(e, "left", t.a = h), S !== t.o && x(i, "placeholder", t.o = S), m !== t.i && x(i, "aria-label", t.i = m), t;
          }, {
            e: void 0,
            t: void 0,
            a: void 0,
            o: void 0,
            i: void 0
          }), b(() => i.value = E()), e;
        }
      });
    }
  })];
};
le(["click", "input"]);
export {
  Le as PivotFilterMenu
};
//# sourceMappingURL=index111.js.map
