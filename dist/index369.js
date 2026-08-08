import { useControlledValue as T } from "./index365.js";
import { rangeIncludesDate as h } from "./index285.js";
import { addToRange as k } from "./index371.js";
import { rangeContainsModifiers as q } from "./index373.js";
function v(f, s) {
  const { disabled: d, excludeDisabled: r, resetOnSelect: a, selected: c, required: m, onSelect: l } = f, [u, S] = T(c, l ? c : void 0), o = l ? c : u;
  return {
    selected: o,
    select: (n, y, R) => {
      const { min: p, max: x } = f;
      let e;
      if (n) {
        const t = o?.from, i = o?.to, C = !!t && !!i, F = !!t && !!i && s.isSameDay(t, i) && s.isSameDay(n, t);
        a && (C || !o?.from) ? !m && F ? e = void 0 : e = { from: n, to: void 0 } : e = k(n, o, p, x, m, s);
      }
      return r && d && e?.from && e.to && q({ from: e.from, to: e.to }, d, s) && (e.from = n, e.to = void 0), l || S(e), l?.(e, n, y, R), e;
    },
    isSelected: (n) => o && h(o, n, !1, s)
  };
}
export {
  v as useRange
};
//# sourceMappingURL=index369.js.map
