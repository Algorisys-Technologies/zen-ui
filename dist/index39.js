import { createComponent as f, template as h, insert as d, effect as w, className as m, setAttribute as B, memo as I, delegateEvents as T } from "solid-js/web";
import { createMemo as s, createSignal as j, createContext as V, For as E, Show as y, useContext as O } from "solid-js";
import { Button as N } from "./index5.js";
import { cn as v } from "./index103.js";
var A = /* @__PURE__ */ h("<div>"), q = /* @__PURE__ */ h("<ol aria-label=Steps>"), D = /* @__PURE__ */ h('<span class="zen-text-xs zen-text-zen-muted-fg zen-truncate">'), G = /* @__PURE__ */ h("<div aria-hidden=true>"), H = /* @__PURE__ */ h('<li><button type=button><div class="zen-flex zen-flex-col zen-min-w-0"><span>'), J = /* @__PURE__ */ h('<svg width=14 height=14 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=3 stroke-linecap=round stroke-linejoin=round><polyline points="20 6 9 17 4 12">'), K = /* @__PURE__ */ h("<span aria-hidden=true>"), Q = /* @__PURE__ */ h("<div role=tabpanel>");
const M = V(null);
function F() {
  const e = O(M);
  if (!e)
    throw new Error("useStepper / StepperList / StepperPanel / StepperNavigation must be rendered inside <Stepper>");
  return e;
}
const Z = (e) => {
  const n = s(() => e.steps), o = s(() => e.orientation ?? "horizontal"), a = s(() => e.linear ?? !0), [l, u] = j(
    // A DEFAULT value, read once. The controlled path is `value` below, which
    // reads props reactively.
    // eslint-disable-next-line solid/reactivity
    e.defaultValue ?? e.steps[0]?.value ?? ""
  ), r = s(() => e.value ?? l()), g = (t) => {
    e.value === void 0 && u(t), e.onValueChange?.(t);
  }, z = s(() => {
    const t = n().findIndex((c) => c.value === r());
    return Math.max(0, t);
  }), k = s(() => n()[z()]), b = s(() => z() === 0), x = s(() => z() === n().length - 1), $ = {
    value: r,
    setValue: g,
    steps: n,
    orientation: o,
    linear: a,
    currentIndex: z,
    currentStep: k,
    isFirst: b,
    isLast: x,
    next: () => {
      const t = z(), c = n();
      t < c.length - 1 && g(c[t + 1].value);
    },
    prev: () => {
      const t = z();
      t > 0 && g(n()[t - 1].value);
    },
    goTo: (t) => {
      const c = n(), p = c.findIndex((P) => P.value === t);
      p < 0 || c[p].disabled || a() && p > z() || g(t);
    },
    statusFor: (t, c) => t.status ? t.status : c < z() ? "completed" : c === z() ? "current" : "pending"
  };
  return f(M.Provider, {
    value: $,
    get children() {
      var t = A();
      return d(t, () => e.children), w(() => m(t, v("zen-w-full", o() === "vertical" ? "zen-flex zen-gap-6" : "zen-flex zen-flex-col zen-gap-6", e.class))), t;
    }
  });
}, ee = (e) => {
  const n = F(), o = s(() => n.orientation() === "horizontal");
  return (() => {
    var a = q();
    return d(a, f(E, {
      get each() {
        return n.steps();
      },
      children: (l, u) => {
        const r = s(() => n.statusFor(l, u())), g = s(() => u() === n.steps().length - 1), z = s(() => !l.disabled && (!n.linear() || r() === "completed" || r() === "current")), k = l.label ?? l.value;
        return (() => {
          var b = H(), x = b.firstChild, S = x.firstChild, C = S.firstChild;
          return x.$$click = () => n.goTo(l.value), d(x, f(R, {
            get status() {
              return r();
            },
            get index() {
              return u();
            }
          }), S), d(C, k), d(S, f(y, {
            get when() {
              return l.description;
            },
            get children() {
              var i = D();
              return d(i, () => l.description), i;
            }
          }), null), d(b, f(y, {
            get when() {
              return !g();
            },
            get children() {
              var i = G();
              return w(() => m(i, v(o() ? "zen-flex-1 zen-h-px zen-mx-2 zen-min-w-[1rem]" : "zen-ml-[1.05rem] zen-w-px zen-h-4 zen-my-1", r() === "completed" ? "zen-bg-zen-primary" : "zen-bg-zen-border"))), i;
            }
          }), null), w((i) => {
            var _ = v("zen-flex", o() ? "zen-items-center zen-flex-1 zen-min-w-0" : "zen-flex-col zen-items-stretch"), $ = r() === "current" ? "step" : void 0, t = !z(), c = `${k}, step ${u() + 1} of ${n.steps().length}, ${r()}`, p = v("zen-flex zen-items-start zen-gap-2 zen-text-start zen-min-w-0", "zen-bg-transparent zen-border-0 zen-p-1 zen-rounded-zen-sm", z() ? "zen-cursor-pointer hover:zen-bg-zen-muted/50" : "zen-cursor-default", "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring", "disabled:zen-opacity-100"), L = v("zen-text-sm zen-font-medium zen-truncate", r() === "error" ? "zen-text-zen-error" : r() === "pending" ? "zen-text-zen-muted-fg" : "zen-text-zen-foreground");
            return _ !== i.e && m(b, i.e = _), $ !== i.t && B(b, "aria-current", i.t = $), t !== i.a && (x.disabled = i.a = t), c !== i.o && B(x, "aria-label", i.o = c), p !== i.i && m(x, i.i = p), L !== i.n && m(C, i.n = L), i;
          }, {
            e: void 0,
            t: void 0,
            a: void 0,
            o: void 0,
            i: void 0,
            n: void 0
          }), b;
        })();
      }
    })), w(() => m(a, v(o() ? "zen-flex zen-items-center zen-gap-2 zen-w-full" : "zen-flex zen-flex-col zen-gap-1 zen-min-w-[14rem] zen-shrink-0", e.class))), a;
  })();
}, R = (e) => {
  const n = {
    pending: "zen-bg-zen-background zen-border zen-border-zen-border zen-text-zen-muted-fg",
    current: "zen-bg-zen-primary zen-text-zen-primary-fg zen-ring-2 zen-ring-zen-primary-soft zen-ring-offset-1",
    completed: "zen-bg-zen-primary zen-text-zen-primary-fg",
    error: "zen-bg-zen-error zen-text-zen-error-fg"
  };
  return (() => {
    var o = K();
    return d(o, f(y, {
      get when() {
        return e.status === "completed";
      },
      get fallback() {
        return I(() => e.status === "error")() ? "!" : e.index + 1;
      },
      get children() {
        return J();
      }
    })), w(() => m(o, v("zen-inline-flex zen-items-center zen-justify-center zen-flex-shrink-0", "zen-h-7 zen-w-7 zen-rounded-zen-full", "zen-text-xs zen-font-semibold", n[e.status]))), o;
  })();
}, ne = (e) => {
  const n = F(), o = s(() => n.value() === e.value);
  return f(y, {
    get when() {
      return o() || e.forceMount;
    },
    get children() {
      var a = Q();
      return d(a, () => e.children), w((l) => {
        var u = o() ? "active" : "inactive", r = !o(), g = v(n.orientation() === "vertical" ? "zen-flex-1 zen-min-w-0" : "zen-w-full", e.class);
        return u !== l.e && B(a, "data-state", l.e = u), r !== l.t && (a.hidden = l.t = r), g !== l.a && m(a, l.a = g), l;
      }, {
        e: void 0,
        t: void 0,
        a: void 0
      }), a;
    }
  });
}, te = (e) => {
  const n = F(), [o, a] = j(!1), l = async () => {
    if (!o()) {
      a(!0);
      try {
        if (e.onBeforeNext && !await e.onBeforeNext())
          return;
        n.isLast() ? await e.onSubmit?.() : n.next();
      } finally {
        a(!1);
      }
    }
  }, u = s(() => !(n.isFirst() && (e.hideBackOnFirst ?? !0)));
  return (() => {
    var r = A();
    return d(r, f(y, {
      get when() {
        return u();
      },
      get children() {
        return f(N, {
          type: "button",
          variant: "outline",
          color: "neutral",
          get disabled() {
            return n.isFirst() || o();
          },
          get onClick() {
            return n.prev;
          },
          get children() {
            return e.backLabel ?? "Back";
          }
        });
      }
    }), null), d(r, f(N, {
      type: "button",
      onClick: l,
      get loading() {
        return o();
      },
      get children() {
        return I(() => !!n.isLast())() ? e.submitLabel ?? "Submit" : e.nextLabel ?? "Continue";
      }
    }), null), w(() => m(r, v("zen-flex zen-items-center zen-gap-2 zen-mt-6", u() ? "zen-justify-between" : "zen-justify-end", e.class))), r;
  })();
};
T(["click"]);
export {
  Z as Stepper,
  ee as StepperList,
  te as StepperNavigation,
  ne as StepperPanel,
  F as useStepper
};
//# sourceMappingURL=index39.js.map
