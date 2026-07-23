import { createComponent as i, template as f, insert as a, effect as I, className as F, memo as w, setAttribute as ne, delegateEvents as re } from "solid-js/web";
import { createSignal as T, createMemo as y, untrack as j, createEffect as oe, Show as $, For as G } from "solid-js";
import { DATE_RANGE_OPERATORS as Q, resolveDateRange as P, formatDateRangeValue as le, toISODate as _, parseISODate as A, operatorMeta as U } from "./index25.js";
import { Button as L } from "./index5.js";
import { Icon as ae } from "./index21.js";
import { Input as ie } from "./index64.js";
import { Popover as se, PopoverTrigger as ce, PopoverContent as ue } from "./index56.js";
import { Calendar as Y } from "./index86.js";
import { cn as M } from "./index106.js";
var ze = /* @__PURE__ */ f("<span>"), de = /* @__PURE__ */ f('<span class="zen-text-xs zen-text-zen-muted-fg">(<!>)'), me = /* @__PURE__ */ f('<p class="zen-m-0 zen-py-8 zen-text-center zen-text-sm zen-text-zen-muted-fg">Pick a period on the left.'), fe = /* @__PURE__ */ f('<div aria-live=polite class="zen-rounded-zen-md zen-bg-zen-muted zen-px-3 zen-py-2 zen-text-xs zen-text-zen-muted-fg">'), ge = /* @__PURE__ */ f('<div class="zen-flex zen-max-w-[34rem] zen-flex-col zen-gap-0 sm:zen-flex-row"><div role=listbox aria-label=Period class="zen-max-h-72 zen-w-48 zen-shrink-0 zen-overflow-y-auto zen-border-b zen-border-zen-border zen-p-1 sm:zen-border-b-0 sm:zen-border-r"></div><div class="zen-flex zen-min-w-[16rem] zen-flex-col zen-gap-3 zen-p-3"><div class="zen-flex zen-justify-end zen-gap-2">'), pe = /* @__PURE__ */ f('<div><div class="zen-px-2 zen-pb-1 zen-pt-2 zen-text-xs zen-font-medium zen-uppercase zen-tracking-wide zen-text-zen-muted-fg">'), ve = /* @__PURE__ */ f("<button type=button role=option>"), xe = /* @__PURE__ */ f('<div class="zen-flex zen-flex-col zen-gap-2"><label class="zen-flex zen-items-center zen-gap-2 zen-text-sm"><span class=zen-text-zen-muted-fg></span><span class=zen-text-zen-muted-fg>s</span></label><label class="zen-flex zen-cursor-pointer zen-items-center zen-gap-2 zen-text-sm zen-text-zen-muted-fg"><input type=checkbox>Include the current ');
const he = ["Day", "Week", "Month", "Quarter", "Year", "Rolling", "Fixed"], Ee = (n) => {
  const [g, S] = T(!1), [H, J] = T(n.defaultValue), V = () => n.value !== void 0, z = () => V() ? n.value : H(), k = () => n.weekStartsOn ?? 0, O = () => n.formatDate ?? ((e) => e.toLocaleDateString()), E = () => n.now ?? /* @__PURE__ */ new Date(), K = y(() => n.operators ? Q.filter((e) => n.operators.includes(e.operator)) : Q), X = y(() => {
    const e = /* @__PURE__ */ new Map();
    for (const l of K()) {
      const t = e.get(l.group) ?? [];
      t.push(l), e.set(l.group, t);
    }
    return he.filter((l) => e.has(l)).map((l) => [l, e.get(l)]);
  }), [s, c] = T(j(z));
  oe(() => {
    g() && c(j(z));
  });
  const D = () => s()?.operator, x = () => {
    const e = D();
    return e ? U(e) : void 0;
  }, R = y(() => P(s(), E(), {
    weekStartsOn: k()
  })), W = () => !!(R().from || R().to), Z = (e) => {
    const l = U(e);
    if (!l) return;
    const t = s(), u = t && "count" in t ? t.count : 1, r = t && "includeCurrent" in t ? t.includeCurrent : !1, o = _(E());
    l.arity === "count" ? c({
      operator: e,
      count: u,
      includeCurrent: r
    }) : l.arity === "date" ? c({
      operator: e,
      date: t && "date" in t ? t.date : o
    }) : l.arity === "range" ? c({
      operator: "BETWEEN",
      from: t && "from" in t ? t.from : o,
      to: t && "to" in t ? t.to : o
    }) : c({
      operator: e
    });
  }, ee = () => {
    const e = s();
    V() || J(e), n.onValueChange?.(e, P(e, n.now ?? /* @__PURE__ */ new Date(), {
      weekStartsOn: k()
    })), S(!1);
  }, te = () => z() ? le(z(), O()) : n.placeholder ?? "Select a period", N = y(() => z() ? P(z(), E(), {
    weekStartsOn: k()
  }) : {});
  return i(se, {
    get open() {
      return g();
    },
    onOpenChange: S,
    placement: "bottom-start",
    get children() {
      return [i(ce, {
        as: L,
        variant: "outline",
        color: "neutral",
        get disabled() {
          return n.disabled;
        },
        get class() {
          return M("zen-justify-start zen-gap-2 zen-font-normal", n.class);
        },
        get children() {
          return [i(ae, {
            name: "calendar",
            size: 16,
            class: "zen-shrink-0 zen-text-zen-muted-fg"
          }), (() => {
            var e = ze();
            return a(e, te), I(() => F(e, M(!z() && "zen-text-zen-muted-fg"))), e;
          })(), i($, {
            get when() {
              return w(() => !!z())() && (N().from || N().to);
            },
            get children() {
              var e = de(), l = e.firstChild, t = l.nextSibling;
              return t.nextSibling, a(e, () => q(N(), O()), t), e;
            }
          })];
        }
      }), i(ue, {
        class: "zen-w-auto zen-p-0",
        get children() {
          var e = ge(), l = e.firstChild, t = l.nextSibling, u = t.firstChild;
          return a(l, i(G, {
            get each() {
              return X();
            },
            children: ([r, o]) => (() => {
              var p = pe(), C = p.firstChild;
              return a(C, r), a(p, i(G, {
                each: o,
                children: (d) => (() => {
                  var v = ve();
                  return v.$$click = () => Z(d.operator), a(v, () => d.label), I((m) => {
                    var h = D() === d.operator, b = M("zen-flex zen-w-full zen-cursor-pointer zen-items-center zen-rounded-zen-sm zen-border-0 zen-px-2 zen-py-1.5", "zen-text-start zen-text-sm zen-transition-colors", "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring", D() === d.operator ? "zen-bg-zen-primary zen-text-zen-primary-fg" : "zen-bg-transparent zen-text-zen-foreground hover:zen-bg-zen-muted");
                    return h !== m.e && ne(v, "aria-selected", m.e = h), b !== m.t && F(v, m.t = b), m;
                  }, {
                    e: void 0,
                    t: void 0
                  }), v;
                })()
              }), null), p;
            })()
          })), a(t, i($, {
            get when() {
              return !s();
            },
            get children() {
              return me();
            }
          }), u), a(t, i($, {
            get when() {
              return w(() => x()?.arity === "count")() ? s() : void 0;
            },
            children: (r) => (() => {
              var o = xe(), p = o.firstChild, C = p.firstChild, d = C.nextSibling, v = d.firstChild, m = p.nextSibling, h = m.firstChild;
              return h.nextSibling, a(C, () => r().operator.startsWith("LAST") ? "Last" : "Next"), a(p, i(ie, {
                type: "number",
                min: 0,
                get value() {
                  return String(r().count);
                },
                onInput: (b) => {
                  const B = Number(b.currentTarget.value);
                  c({
                    ...r(),
                    count: Number.isFinite(B) ? B : 0
                  });
                },
                get "aria-label"() {
                  return `Number of ${x()?.unit}s`;
                },
                class: "zen-h-8 zen-w-20"
              }), d), a(d, () => x()?.unit, v), h.addEventListener("change", (b) => c({
                ...r(),
                includeCurrent: b.currentTarget.checked
              })), a(m, () => x()?.unit, null), I(() => h.checked = !!r().includeCurrent), o;
            })()
          }), u), a(t, i($, {
            get when() {
              return w(() => x()?.arity === "date")() ? s() : void 0;
            },
            children: (r) => i(Y, {
              mode: "single",
              get selected() {
                return A(r().date) ?? void 0;
              },
              onSelect: (o) => o && c({
                ...r(),
                date: _(o)
              })
            })
          }), u), a(t, i($, {
            get when() {
              return w(() => x()?.arity === "range")() ? s() : void 0;
            },
            children: (r) => i(Y, {
              mode: "range",
              get selected() {
                return {
                  from: A(r().from) ?? void 0,
                  to: A(r().to) ?? void 0
                };
              },
              onSelect: (o) => c({
                operator: "BETWEEN",
                from: o?.from ? _(o.from) : r().from,
                to: o?.to ? _(o.to) : o?.from ? _(o.from) : r().to
              })
            })
          }), u), a(t, i($, {
            get when() {
              return s();
            },
            get children() {
              var r = fe();
              return a(r, (() => {
                var o = w(() => !!W());
                return () => o() ? q(R(), O()) : "—";
              })()), r;
            }
          }), u), a(u, i(L, {
            variant: "ghost",
            color: "neutral",
            size: "sm",
            onClick: () => S(!1),
            children: "Cancel"
          }), null), a(u, i(L, {
            size: "sm",
            get disabled() {
              return !s() || !W();
            },
            onClick: ee,
            children: "Apply"
          }), null), e;
        }
      })];
    }
  });
}, q = (n, g) => n.from && n.to ? `${g(n.from)} – ${g(n.to)}` : n.from ? `from ${g(n.from)}` : n.to ? `until ${g(n.to)}` : "—";
re(["click"]);
export {
  Ee as DynamicDateRange
};
//# sourceMappingURL=index24.js.map
