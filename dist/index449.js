import { dateMatchModifiers as u } from "./index437.js";
import { getFocusableDate as g } from "./index466.js";
import { CalendarDay as m } from "./index396.js";
function h(t, i, a, d, f, e, n, s = 0) {
  if (s > 365)
    return;
  const o = g(t, i, a.date, d, f, e, n), r = !!(e.disabled && u(o, e.disabled, n)), l = !!(e.hidden && u(o, e.hidden, n)), D = o, c = new m(o, D, n);
  return !r && !l ? c : h(t, i, c, d, f, e, n, s + 1);
}
export {
  h as getNextFocus
};
//# sourceMappingURL=index449.js.map
