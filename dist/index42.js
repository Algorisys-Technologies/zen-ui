import { template as v, insert as z, createComponent as s, effect as S, setAttribute as u, className as x, memo as E, delegateEvents as P } from "solid-js/web";
import { createMemo as y, createSignal as B, Show as w, For as G, Switch as J, Match as F } from "solid-js";
import { cn as k } from "./index103.js";
import { arrowStep as Q } from "./index112.js";
import "./index25.js";
var R = /* @__PURE__ */ v('<p class="zen-text-sm zen-font-medium zen-text-zen-foreground zen-m-0">'), W = /* @__PURE__ */ v('<div class="zen-flex zen-items-start zen-justify-between zen-gap-4 zen-text-xs zen-text-zen-muted-fg"><span></span><span class=zen-text-end>'), X = /* @__PURE__ */ v("<input type=hidden>"), Y = /* @__PURE__ */ v("<div><div role=radiogroup>"), T = /* @__PURE__ */ v('<span class="zen-h-1.5 zen-w-1.5 zen-rounded-zen-full zen-bg-zen-primary-fg">'), Z = /* @__PURE__ */ v("<button type=button role=radio><span aria-hidden=true></span><span aria-hidden=true>"), p = /* @__PURE__ */ v("<button type=button role=radio><span aria-hidden=true>"), ee = /* @__PURE__ */ v("<button type=button role=radio>"), ne = /* @__PURE__ */ v('<span class="zen-hidden md:zen-inline">'), re = /* @__PURE__ */ v("<span class=md:zen-hidden>"), U = /* @__PURE__ */ v("<span aria-hidden=true>"), te = /* @__PURE__ */ v("<span>");
const le = [{
  value: "strongly_disagree",
  label: "Strongly disagree",
  shortLabel: "SD"
}, {
  value: "disagree",
  label: "Disagree",
  shortLabel: "D"
}, {
  value: "neutral",
  label: "Neutral",
  shortLabel: "N"
}, {
  value: "agree",
  label: "Agree",
  shortLabel: "A"
}, {
  value: "strongly_agree",
  label: "Strongly agree",
  shortLabel: "SA"
}], ue = (r) => {
  const _ = y(() => r.options ?? le), b = y(() => r.layout ?? "segmented"), I = () => r.value !== void 0, [V, H] = B(r.defaultValue), A = y(() => I() ? r.value : V()), L = y(() => !r.disabled && !r.readOnly), C = y(() => _().findIndex((i) => i.value === A())), $ = (i) => {
    I() || H(i), r.onValueChange?.(i);
  }, K = (i) => {
    if (!L()) return;
    const c = C();
    if (c < 0) return;
    const e = b() === "stacked" ? i.key === "ArrowDown" ? 1 : i.key === "ArrowUp" ? -1 : 0 : Q(i.key, i.currentTarget), o = _();
    if (e === 1) {
      i.preventDefault();
      const d = o[Math.min(o.length - 1, c + 1)];
      $(d.value);
    } else if (e === -1) {
      i.preventDefault();
      const d = o[Math.max(0, c - 1)];
      $(d.value);
    } else i.key === "Home" ? (i.preventDefault(), $(o[0].value)) : i.key === "End" && (i.preventDefault(), $(o[o.length - 1].value));
  };
  return (() => {
    var i = Y(), c = i.firstChild;
    return z(i, s(w, {
      get when() {
        return r.question;
      },
      get children() {
        var e = R();
        return z(e, () => r.question), e;
      }
    }), c), c.$$keydown = K, z(c, s(G, {
      get each() {
        return _();
      },
      children: (e, o) => {
        const d = y(() => A() === e.value), D = y(() => o() === 0), j = y(() => o() === _().length - 1);
        return (
          // Segmented is the fallback, so it stays the default exactly as
          // it was when this was a two-way Show.
          s(J, {
            get fallback() {
              return (() => {
                var n = ee();
                return n.$$click = () => L() && $(e.value), z(n, s(w, {
                  get when() {
                    return e.renderOption;
                  },
                  get fallback() {
                    return [(() => {
                      var t = ne();
                      return z(t, () => e.label), t;
                    })(), (() => {
                      var t = re();
                      return z(t, () => e.shortLabel ?? e.label), t;
                    })()];
                  },
                  children: (t) => (() => {
                    var a = U();
                    return z(a, () => t()()), a;
                  })()
                })), S((t) => {
                  var a = d(), l = e.label, g = r.disabled, m = d() || C() < 0 && o() === 0 ? 0 : -1, f = e.label, h = k("zen-flex-1 zen-min-w-[3.5rem] zen-px-3 zen-py-2", "zen-inline-flex zen-items-center zen-justify-center", "zen-text-xs zen-font-medium", "zen-bg-transparent zen-border-0 zen-cursor-pointer zen-transition-colors", !D() && "zen-border-l zen-border-zen-border", "zen-text-zen-muted-fg", L() && "hover:zen-bg-zen-muted hover:zen-text-zen-foreground", d() && "zen-bg-zen-primary zen-text-zen-primary-fg hover:zen-bg-zen-primary hover:zen-text-zen-primary-fg", "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-inset", (r.disabled || r.readOnly) && "zen-cursor-default", D() && "zen-rounded-l-zen-md", j() && "zen-rounded-r-zen-md");
                  return a !== t.e && u(n, "aria-checked", t.e = a), l !== t.t && u(n, "aria-label", t.t = l), g !== t.a && (n.disabled = t.a = g), m !== t.o && u(n, "tabindex", t.o = m), f !== t.i && u(n, "title", t.i = f), h !== t.n && x(n, t.n = h), t;
                }, {
                  e: void 0,
                  t: void 0,
                  a: void 0,
                  o: void 0,
                  i: void 0,
                  n: void 0
                }), n;
              })();
            },
            get children() {
              return [s(F, {
                get when() {
                  return b() === "scale";
                },
                get children() {
                  var n = Z(), t = n.firstChild, a = t.nextSibling;
                  return n.$$click = () => L() && $(e.value), z(t, s(w, {
                    get when() {
                      return e.renderOption;
                    },
                    get fallback() {
                      return e.label;
                    },
                    children: (l) => l()()
                  })), z(a, s(w, {
                    get when() {
                      return d();
                    },
                    get children() {
                      return T();
                    }
                  })), S((l) => {
                    var g = d(), m = e.label, f = r.disabled, h = d() || C() < 0 && o() === 0 ? 0 : -1, O = e.label, M = k("zen-flex zen-flex-1 zen-flex-col zen-items-center zen-gap-1.5", "zen-min-w-[2.5rem] zen-px-1 zen-py-1.5 zen-rounded-zen-sm", "zen-bg-transparent zen-border-0 zen-cursor-pointer zen-transition-colors", L() && "hover:zen-bg-zen-muted", "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring", (r.disabled || r.readOnly) && "zen-cursor-default"), N = k("zen-text-base zen-leading-none", d() ? "zen-text-zen-foreground zen-font-semibold" : "zen-text-zen-muted-fg"), q = k("zen-inline-flex zen-items-center zen-justify-center", "zen-h-4 zen-w-4 zen-rounded-zen-full zen-border", d() ? "zen-border-zen-primary zen-bg-zen-primary" : "zen-border-zen-border zen-bg-zen-background");
                    return g !== l.e && u(n, "aria-checked", l.e = g), m !== l.t && u(n, "aria-label", l.t = m), f !== l.a && (n.disabled = l.a = f), h !== l.o && u(n, "tabindex", l.o = h), O !== l.i && u(n, "title", l.i = O), M !== l.n && x(n, l.n = M), N !== l.s && x(t, l.s = N), q !== l.h && x(a, l.h = q), l;
                  }, {
                    e: void 0,
                    t: void 0,
                    a: void 0,
                    o: void 0,
                    i: void 0,
                    n: void 0,
                    s: void 0,
                    h: void 0
                  }), n;
                }
              }), s(F, {
                get when() {
                  return b() === "stacked";
                },
                get children() {
                  var n = p(), t = n.firstChild;
                  return n.$$click = () => L() && $(e.value), z(t, s(w, {
                    get when() {
                      return d();
                    },
                    get children() {
                      return T();
                    }
                  })), z(n, s(w, {
                    get when() {
                      return e.renderOption;
                    },
                    get fallback() {
                      return (() => {
                        var a = te();
                        return z(a, () => e.label), a;
                      })();
                    },
                    children: (a) => (() => {
                      var l = U();
                      return z(l, () => a()()), l;
                    })()
                  }), null), S((a) => {
                    var l = d(), g = e.label, m = r.disabled, f = d() || C() < 0 && o() === 0 ? 0 : -1, h = k("zen-flex zen-items-center zen-gap-2 zen-px-2 zen-py-1.5 zen-rounded-zen-sm", "zen-bg-transparent zen-border-0 zen-text-start zen-text-sm zen-cursor-pointer", "zen-transition-colors", L() && "hover:zen-bg-zen-muted", d() && "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg", "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring", (r.disabled || r.readOnly) && "zen-cursor-default"), O = k("zen-inline-flex zen-items-center zen-justify-center", "zen-h-4 zen-w-4 zen-rounded-zen-full zen-border", d() ? "zen-border-zen-primary zen-bg-zen-primary" : "zen-border-zen-border zen-bg-zen-background");
                    return l !== a.e && u(n, "aria-checked", a.e = l), g !== a.t && u(n, "aria-label", a.t = g), m !== a.a && (n.disabled = a.a = m), f !== a.o && u(n, "tabindex", a.o = f), h !== a.i && x(n, a.i = h), O !== a.n && x(t, a.n = O), a;
                  }, {
                    e: void 0,
                    t: void 0,
                    a: void 0,
                    o: void 0,
                    i: void 0,
                    n: void 0
                  }), n;
                }
              })];
            }
          })
        );
      }
    })), z(i, s(w, {
      get when() {
        return E(() => b() === "scale")() && (r.minLabel || r.maxLabel);
      },
      get children() {
        var e = W(), o = e.firstChild, d = o.nextSibling;
        return z(o, () => r.minLabel), z(d, () => r.maxLabel), e;
      }
    }), null), z(i, s(w, {
      get when() {
        return E(() => !!r.name)() && A() !== void 0;
      },
      get children() {
        var e = X();
        return S(() => u(e, "name", r.name)), S(() => e.value = A()), e;
      }
    }), null), S((e) => {
      var o = k(
        // Scale spreads its marks with justify-between, which needs free space
        // to distribute — a shrink-wrapped inline-flex root has none, and the
        // marks would bunch up where React's (block-level flex) spread. The
        // other layouts keep the inline-flex they already had.
        b() === "scale" ? "zen-flex zen-max-w-full" : "zen-inline-flex",
        "zen-flex-col zen-gap-2",
        r.class
      ), d = r.question, D = r.disabled || void 0, j = r.readOnly || void 0, n = k(
        b() === "segmented" && "zen-inline-flex zen-items-stretch zen-rounded-zen-md zen-border zen-border-zen-border zen-overflow-hidden zen-bg-zen-background",
        b() === "stacked" && "zen-flex zen-flex-col zen-gap-1",
        // No border or fill: the marks are the affordance, and the ends are
        // named by the captions underneath rather than by a frame.
        b() === "scale" && "zen-flex zen-max-w-full zen-items-end zen-justify-between zen-gap-1 zen-overflow-x-auto",
        r.disabled && "zen-opacity-50"
      );
      return o !== e.e && x(i, e.e = o), d !== e.t && u(c, "aria-label", e.t = d), D !== e.a && u(c, "aria-disabled", e.a = D), j !== e.o && u(c, "aria-readonly", e.o = j), n !== e.i && x(c, e.i = n), e;
    }, {
      e: void 0,
      t: void 0,
      a: void 0,
      o: void 0,
      i: void 0
    }), i;
  })();
};
P(["keydown", "click"]);
export {
  ue as Likert
};
//# sourceMappingURL=index42.js.map
