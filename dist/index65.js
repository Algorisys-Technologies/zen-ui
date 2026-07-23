import { template as N, spread as V, mergeProps as M, effect as S, className as z, delegateEvents as F } from "solid-js/web";
import { splitProps as I, createSignal as P, createMemo as D } from "solid-js";
import { cn as s } from "./index103.js";
var E = /* @__PURE__ */ N("<div><button type=button aria-label=Decrement>−</button><input type=number inputmode=decimal><button type=button aria-label=Increment>+");
const A = (g) => {
  const [e, x] = I(g, ["class", "value", "defaultValue", "min", "max", "step", "onValueChange", "disabled"]), u = () => e.step ?? 1, m = () => e.value !== void 0, [y, h] = P(e.defaultValue ?? null), r = D(() => m() ? e.value : y()), i = (n) => {
    m() || h(n), e.onValueChange?.(n);
  }, d = (n) => typeof e.min == "number" && n < e.min ? e.min : typeof e.max == "number" && n > e.max ? e.max : n, w = () => {
    const n = r() ?? e.min ?? 0;
    i(d(n - u()));
  }, k = () => {
    const n = r() ?? e.min ?? 0;
    i(d(n + u()));
  }, $ = () => typeof e.min == "number" && r() !== null && r() <= e.min, C = () => typeof e.max == "number" && r() !== null && r() >= e.max;
  return (() => {
    var n = E(), l = n.firstChild, b = l.nextSibling, c = b.nextSibling;
    return l.$$click = w, b.$$input = (t) => {
      const o = t.currentTarget.value;
      if (o === "") {
        i(null);
        return;
      }
      const a = Number(o);
      Number.isFinite(a) && i(d(a));
    }, V(b, M({
      get value() {
        return r() ?? "";
      },
      get min() {
        return e.min;
      },
      get max() {
        return e.max;
      },
      get step() {
        return u();
      },
      get disabled() {
        return e.disabled;
      },
      get class() {
        return s("zen-min-w-0 zen-flex-1 zen-text-center zen-text-sm zen-bg-transparent", "zen-border-x zen-border-zen-border", "focus:zen-outline-none focus-visible:zen-bg-zen-primary-soft", "disabled:zen-cursor-not-allowed", "zen-[appearance:textfield] [&::-webkit-inner-spin-button]:zen-appearance-none [&::-webkit-outer-spin-button]:zen-appearance-none");
      }
    }, x), !1, !1), c.$$click = k, S((t) => {
      var o = s("zen-inline-flex zen-h-10 zen-items-stretch zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-overflow-hidden", e.disabled && "zen-opacity-50 zen-cursor-not-allowed", e.class), a = e.disabled || $(), p = s("zen-px-3 zen-text-base zen-text-zen-foreground zen-bg-transparent", "hover:zen-bg-zen-muted disabled:zen-opacity-50 disabled:zen-cursor-not-allowed", "focus-visible:zen-outline-none focus-visible:zen-bg-zen-muted"), f = e.disabled || C(), v = s("zen-px-3 zen-text-base zen-text-zen-foreground zen-bg-transparent", "hover:zen-bg-zen-muted disabled:zen-opacity-50 disabled:zen-cursor-not-allowed", "focus-visible:zen-outline-none focus-visible:zen-bg-zen-muted");
      return o !== t.e && z(n, t.e = o), a !== t.t && (l.disabled = t.t = a), p !== t.a && z(l, t.a = p), f !== t.o && (c.disabled = t.o = f), v !== t.i && z(c, t.i = v), t;
    }, {
      e: void 0,
      t: void 0,
      a: void 0,
      o: void 0,
      i: void 0
    }), n;
  })();
};
F(["click", "input"]);
export {
  A as NumberField
};
//# sourceMappingURL=index65.js.map
