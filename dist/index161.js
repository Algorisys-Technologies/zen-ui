import { createSignal as s, createMemo as u, untrack as i } from "solid-js";
import { accessWith as v } from "./index166.js";
function r(e) {
  const [t, a] = s(e.defaultValue?.()), l = u(() => e.value?.() !== void 0), o = u(() => l() ? e.value?.() : t());
  return [o, (c) => {
    i(() => {
      const n = v(c, o());
      return Object.is(n, o()) || (l() || a(n), e.onChange?.(n)), n;
    });
  }];
}
function m(e) {
  const [t, a] = r(e);
  return [() => t() ?? !1, a];
}
function C(e) {
  const [t, a] = r(e);
  return [() => t() ?? [], a];
}
export {
  C as createControllableArraySignal,
  m as createControllableBooleanSignal,
  r as createControllableSignal
};
//# sourceMappingURL=index161.js.map
