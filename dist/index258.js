import { DayFlag as e, SelectionState as n, UI as d } from "./index269.js";
function p(o, i, f = {}) {
  return Object.entries(o).filter(([, t]) => t === !0).reduce((t, [r]) => (f[r] ? t.push(f[r]) : i[e[r]] ? t.push(i[e[r]]) : i[n[r]] && t.push(i[n[r]]), t), [i[d.Day]]);
}
export {
  p as getClassNamesForModifiers
};
//# sourceMappingURL=index258.js.map
