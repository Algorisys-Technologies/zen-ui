import { createComponent as g, mergeProps as h } from "solid-js/web";
import { splitProps as v, createSignal as y, createMemo as c } from "solid-js";
import { applyMask as s, extractRaw as l, maskSlotCount as C, maskSkeleton as M, isMaskComplete as K } from "./index128.js";
import { Input as x } from "./index64.js";
import { cn as D } from "./index106.js";
const T = (a) => {
  const [e, k] = v(a, ["mask", "rules", "placeholderChar", "value", "defaultValue", "onValueChange", "placeholder", "onKeyDown", "class"]), [i, p] = y(
    // eslint-disable-next-line solid/reactivity
    s(l(a.defaultValue ?? "", a.mask, a.rules), a.mask, a.rules)
  ), o = () => e.value !== void 0, u = c(() => o() ? s(l(e.value, e.mask, e.rules), e.mask, e.rules) : i()), m = (t, r) => {
    const n = s(r, e.mask, e.rules);
    o() || p(n), e.onValueChange?.(n, r, K(r, e.mask, e.rules)), t.value !== n && (t.value = n);
  }, d = (t, r) => m(t, l(r, e.mask, e.rules)), f = c(() => C(e.mask, e.rules) > 0 && l("a".repeat(64), e.mask, e.rules).length === 0 ? "numeric" : "text");
  return g(
    x,
    h({
      type: "text",
      get inputMode() {
        return f();
      },
      get value() {
        return u();
      },
      onInput: (t) => d(t.currentTarget, t.currentTarget.value),
      onKeyDown: (t) => {
        e.onKeyDown?.(t), !t.defaultPrevented && t.key === "Backspace" && !t.altKey && !t.ctrlKey && !t.metaKey && (t.preventDefault(), m(t.currentTarget, l(u(), e.mask, e.rules).slice(0, -1)));
      },
      get placeholder() {
        return e.placeholder ?? M(e.mask, e.placeholderChar ?? "_", e.rules);
      },
      autocomplete: "off",
      get class() {
        return D(e.class);
      }
    }, k)
  );
};
export {
  T as MaskInput
};
//# sourceMappingURL=index54.js.map
