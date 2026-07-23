import { template as g, insert as a, createComponent as i, effect as W, setAttribute as H, className as K, memo as U, delegateEvents as Z } from "solid-js/web";
import { createSignal as Y, For as _, createMemo as C, Show as q, splitProps as p } from "solid-js";
import { Button as ee } from "./index5.js";
import { Popover as te, PopoverTrigger as ne, PopoverContent as re } from "./index53.js";
import { cn as V } from "./index103.js";
var oe = /* @__PURE__ */ g('<div><div class="zen-flex zen-gap-4">'), le = /* @__PURE__ */ g('<div class="zen-flex zen-items-center zen-justify-between zen-mb-2"><button type=button class="zen-h-7 zen-w-7 zen-inline-flex zen-items-center zen-justify-center zen-rounded-zen-sm zen-bg-transparent zen-border-0 zen-cursor-pointer hover:zen-bg-zen-muted"aria-label="Previous month">‹</button><div class="zen-text-sm zen-font-medium"aria-live=polite></div><button type=button class="zen-h-7 zen-w-7 zen-inline-flex zen-items-center zen-justify-center zen-rounded-zen-sm zen-bg-transparent zen-border-0 zen-cursor-pointer hover:zen-bg-zen-muted"aria-label="Next month">›'), ie = /* @__PURE__ */ g('<div class="zen-text-sm zen-font-medium zen-mb-2 zen-text-center">'), ae = /* @__PURE__ */ g('<div><table class="zen-border-collapse zen-text-sm"><thead><tr></tr></thead><tbody>'), se = /* @__PURE__ */ g('<th class="zen-h-8 zen-w-8 zen-text-xs zen-font-normal zen-text-zen-muted-fg">'), ce = /* @__PURE__ */ g("<tr>"), ue = /* @__PURE__ */ g("<td class=zen-p-0><button type=button>"), de = /* @__PURE__ */ g('<svg width=14 height=14 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round aria-hidden><rect x=3 y=4 width=18 height=18 rx=2></rect><line x1=16 y1=2 x2=16 y2=6></line><line x1=8 y1=2 x2=8 y2=6></line><line x1=3 y1=10 x2=21 y2=10>');
const me = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"], d = (e, t) => !!e && !!t && e.getFullYear() === t.getFullYear() && e.getMonth() === t.getMonth() && e.getDate() === t.getDate(), fe = (e, t) => t?.from ? t.to ? e >= G(t.from) && e <= G(t.to) : d(e, t.from) : !1, G = (e) => {
  const t = new Date(e);
  return t.setHours(0, 0, 0, 0), t;
}, ze = (e) => new Date(e.getFullYear(), e.getMonth(), 1), j = (e, t) => new Date(e.getFullYear(), e.getMonth() + t, 1), ge = (e) => {
  const t = ze(e), v = t.getDay(), m = new Date(t);
  m.setDate(t.getDate() - v);
  const s = [];
  for (let f = 0; f < 6; f++) {
    const x = [];
    for (let o = 0; o < 7; o++)
      x.push(new Date(m.getFullYear(), m.getMonth(), m.getDate() + f * 7 + o));
    s.push(x);
  }
  return s;
}, he = (e) => {
  const t = () => e.defaultMonth ? e.defaultMonth : e.mode === "range" ? e.selected?.from ?? /* @__PURE__ */ new Date() : e.mode === "multiple" ? e.selected?.[0] ?? /* @__PURE__ */ new Date() : e.selected ?? /* @__PURE__ */ new Date(), [v, m] = Y(t()), s = () => e.month ?? v(), f = (n) => {
    e.onMonthChange?.(n), e.month === void 0 && m(n);
  }, x = () => e.mode === "range" ? e.numberOfMonths ?? 1 : 1, o = (n) => {
    const r = e.disabled;
    return typeof r == "function" ? r(n) : r === !0;
  }, k = (n) => {
    if (!o(n))
      if (e.mode === "multiple") {
        const r = e.selected ?? [], b = r.some((D) => d(D, n)) ? r.filter((D) => !d(D, n)) : [...r, n];
        e.onSelect?.(b);
      } else if (e.mode === "range") {
        const r = e.selected;
        !r?.from || r.to ? e.onSelect?.({
          from: n,
          to: void 0
        }) : n < r.from ? e.onSelect?.({
          from: n,
          to: r.from
        }) : e.onSelect?.({
          from: r.from,
          to: n
        });
      } else {
        const r = d(n, e.selected);
        e.onSelect?.(r ? void 0 : n);
      }
  }, F = (n) => e.mode === "multiple" ? (e.selected ?? []).some((r) => d(r, n)) : e.mode === "range" ? fe(n, e.selected) : d(n, e.selected), h = (n) => e.mode !== "range" || !e.selected ? !1 : d(n, e.selected.from) ? "from" : d(n, e.selected.to) ? "to" : !1;
  return (() => {
    var n = oe(), r = n.firstChild;
    return a(r, i(_, {
      get each() {
        return Array.from({
          length: x()
        }, (y, b) => b);
      },
      children: (y) => {
        const b = C(() => j(s(), y)), D = C(() => ge(b())), A = C(() => b().toLocaleDateString(void 0, {
          month: "long",
          year: "numeric"
        }));
        return (() => {
          var S = ae(), P = S.firstChild, E = P.firstChild, J = E.firstChild, Q = E.nextSibling;
          return a(S, i(q, {
            when: y === 0,
            get children() {
              var c = le(), z = c.firstChild, l = z.nextSibling, M = l.nextSibling;
              return z.$$click = () => f(j(s(), -1)), a(l, A), M.$$click = () => f(j(s(), 1)), c;
            }
          }), P), a(S, i(q, {
            when: y > 0,
            get children() {
              var c = ie();
              return a(c, A), c;
            }
          }), P), a(J, i(_, {
            each: me,
            children: (c) => (() => {
              var z = se();
              return a(z, c), z;
            })()
          })), a(Q, i(_, {
            get each() {
              return D();
            },
            children: (c) => (() => {
              var z = ce();
              return a(z, i(_, {
                each: c,
                children: (l) => {
                  const M = () => l.getMonth() !== b().getMonth(), $ = () => F(l), X = () => d(l, /* @__PURE__ */ new Date()), L = () => h(l), O = () => o(l);
                  return (() => {
                    var T = ue(), w = T.firstChild;
                    return w.$$click = () => k(l), a(w, () => l.getDate()), W((u) => {
                      var B = O(), I = l.toDateString(), N = $(), R = V("zen-h-8 zen-w-8 zen-inline-flex zen-items-center zen-justify-center zen-rounded-zen-sm", "zen-bg-transparent zen-border-0 zen-cursor-pointer zen-text-sm zen-transition-colors", "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring", M() && "zen-text-zen-muted-fg zen-opacity-60", !$() && !M() && "hover:zen-bg-zen-muted", $() && e.mode !== "range" && "zen-bg-zen-primary zen-text-zen-primary-fg", $() && e.mode === "range" && !L() && "zen-bg-zen-primary-soft", L() && "zen-bg-zen-primary zen-text-zen-primary-fg", X() && !$() && "zen-border zen-border-zen-border", O() && "zen-opacity-30 zen-cursor-not-allowed");
                      return B !== u.e && (w.disabled = u.e = B), I !== u.t && H(w, "aria-label", u.t = I), N !== u.a && H(w, "aria-pressed", u.a = N), R !== u.o && K(w, u.o = R), u;
                    }, {
                      e: void 0,
                      t: void 0,
                      a: void 0,
                      o: void 0
                    }), T;
                  })();
                }
              })), z;
            })()
          })), S;
        })();
      }
    })), W(() => K(n, V("zen-p-3 zen-inline-block", e.class))), n;
  })();
}, $e = (e) => {
  const [t] = p(e, ["value", "defaultValue", "onValueChange", "placeholder", "disabled", "class", "formatDate"]), v = () => t.value !== void 0, [m, s] = Y(!1), [f, x] = Y(t.defaultValue), o = C(() => v() ? t.value : f()), k = (h) => {
    v() || x(h), t.onValueChange?.(h), h && s(!1);
  }, F = (h) => (t.formatDate ?? ((n) => n.toLocaleDateString()))(h);
  return i(te, {
    get open() {
      return m();
    },
    onOpenChange: s,
    get children() {
      return [i(ne, {
        as: ee,
        variant: "outline",
        color: "neutral",
        get disabled() {
          return t.disabled === !0;
        },
        get iconLeft() {
          return i(be, {});
        },
        get class() {
          return V("zen-w-60 zen-justify-between zen-font-normal", !o() && "zen-text-zen-muted-fg", t.class);
        },
        get children() {
          return U(() => !!o())() ? F(o()) : t.placeholder ?? "Pick a date";
        }
      }), i(re, {
        class: "zen-w-auto zen-p-0",
        get children() {
          return i(he, {
            mode: "single",
            get selected() {
              return o();
            },
            onSelect: k,
            get disabled() {
              return U(() => typeof t.disabled == "function")() ? t.disabled : void 0;
            }
          });
        }
      })];
    }
  });
}, be = () => de();
Z(["click"]);
export {
  he as Calendar,
  $e as DatePicker
};
//# sourceMappingURL=index83.js.map
