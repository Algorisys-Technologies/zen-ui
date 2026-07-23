import { template as b, insert as l, createComponent as g, effect as c, setAttribute as d, className as h, memo as E, delegateEvents as V } from "solid-js/web";
import { createSignal as F, createMemo as m, For as I, Show as M } from "solid-js";
import { cn as x } from "./index103.js";
import { arrowStep as K } from "./index112.js";
import "./index25.js";
var T = /* @__PURE__ */ b("<input type=hidden>"), q = /* @__PURE__ */ b('<div role=radiogroup><div class="zen-flex zen-items-center zen-gap-1"></div><div class="zen-flex zen-justify-between zen-text-xs zen-text-zen-muted-fg zen-px-1"><span></span><span>'), G = /* @__PURE__ */ b("<button type=button role=radio>"), J = /* @__PURE__ */ b("<p aria-live=polite> · ");
const u = (e) => e <= 6 ? "detractor" : e <= 8 ? "passive" : "promoter", Q = {
  detractor: "Detractor",
  passive: "Passive",
  promoter: "Promoter"
}, Z = (e) => {
  const w = () => e.value !== void 0, [N, P] = F(e.defaultValue), s = m(() => w() ? e.value : N()), y = m(() => !e.disabled && !e.readOnly), j = m(() => e.showBucket ?? !0), v = (t) => {
    w() || P(t), e.onValueChange?.(t);
  }, A = (t) => {
    if (!y()) return;
    const z = s();
    if (z === void 0) return;
    const f = K(t.key, t.currentTarget);
    f ? (t.preventDefault(), v(Math.max(0, Math.min(10, z + f)))) : t.key === "Home" ? (t.preventDefault(), v(0)) : t.key === "End" && (t.preventDefault(), v(10));
  }, B = Array.from({
    length: 11
  }, (t, z) => z), k = () => e.lowLabel ?? "Not at all likely", $ = () => e.highLabel ?? "Extremely likely";
  return (() => {
    var t = q(), z = t.firstChild, f = z.nextSibling, C = f.firstChild, H = C.nextSibling;
    return t.$$keydown = A, l(z, g(I, {
      each: B,
      children: (n) => {
        const r = m(() => s() === n), o = u(n);
        return (() => {
          var a = G();
          return a.$$click = () => y() && v(n), l(a, n), c((i) => {
            var S = r(), _ = `${n}${n === 0 ? " — " + k() : n === 10 ? " — " + $() : ""}`, D = e.disabled, L = r() || s() === void 0 && n === 0 ? 0 : -1, O = x(
              "zen-h-9 zen-min-w-9 zen-px-2",
              "zen-inline-flex zen-items-center zen-justify-center",
              "zen-text-sm zen-font-medium zen-tabular-nums",
              "zen-rounded-zen-sm zen-border zen-cursor-pointer zen-transition-colors",
              "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
              // unselected — soft bucket tint
              !r() && "zen-bg-zen-background",
              !r() && o === "detractor" && "zen-border-zen-error-soft zen-text-zen-error-soft-fg hover:zen-bg-zen-error-soft",
              !r() && o === "passive" && "zen-border-zen-warning-soft zen-text-zen-warning-soft-fg hover:zen-bg-zen-warning-soft",
              !r() && o === "promoter" && "zen-border-zen-success-soft zen-text-zen-success-soft-fg hover:zen-bg-zen-success-soft",
              // selected — saturated bucket fill
              r() && o === "detractor" && "zen-bg-zen-error zen-text-zen-error-fg zen-border-zen-error",
              r() && o === "passive" && "zen-bg-zen-warning zen-text-zen-warning-fg zen-border-zen-warning",
              r() && o === "promoter" && "zen-bg-zen-success zen-text-zen-success-fg zen-border-zen-success",
              (e.disabled || e.readOnly) && "zen-cursor-default",
              e.disabled && "hover:!zen-bg-zen-background"
            );
            return S !== i.e && d(a, "aria-checked", i.e = S), _ !== i.t && d(a, "aria-label", i.t = _), D !== i.a && (a.disabled = i.a = D), L !== i.o && d(a, "tabindex", i.o = L), O !== i.i && h(a, i.i = O), i;
          }, {
            e: void 0,
            t: void 0,
            a: void 0,
            o: void 0,
            i: void 0
          }), a;
        })();
      }
    })), l(C, k), l(H, $), l(t, g(M, {
      get when() {
        return E(() => !!j())() && s() !== void 0;
      },
      children: (n) => {
        const r = s();
        return (() => {
          var o = J(), a = o.firstChild;
          return l(o, r, a), l(o, () => Q[u(r)], null), c(() => h(o, x("zen-text-xs zen-mt-1 zen-m-0 zen-font-medium", u(r) === "detractor" && "zen-text-zen-error", u(r) === "passive" && "zen-text-zen-warning-soft-fg", u(r) === "promoter" && "zen-text-zen-success"))), o;
        })();
      }
    }), null), l(t, g(M, {
      get when() {
        return E(() => !!e.name)() && s() !== void 0;
      },
      get children() {
        var n = T();
        return c(() => d(n, "name", e.name)), c(() => n.value = s()), n;
      }
    }), null), c((n) => {
      var r = e.label ?? "How likely are you to recommend us?", o = e.disabled || void 0, a = e.readOnly || void 0, i = x("zen-inline-flex zen-flex-col zen-gap-2", e.disabled && "zen-opacity-50", e.class);
      return r !== n.e && d(t, "aria-label", n.e = r), o !== n.t && d(t, "aria-disabled", n.t = o), a !== n.a && d(t, "aria-readonly", n.a = a), i !== n.o && h(t, n.o = i), n;
    }, {
      e: void 0,
      t: void 0,
      a: void 0,
      o: void 0
    }), t;
  })();
};
V(["keydown", "click"]);
export {
  Z as NPS
};
//# sourceMappingURL=index41.js.map
