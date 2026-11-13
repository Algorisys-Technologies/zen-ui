import { normalizeDates as m } from "./index471.js";
import { startOfDay as t } from "./index430.js";
function s(r, a, e) {
  const [o, i] = m(
    e?.in,
    r,
    a
  );
  return +t(o) == +t(i);
}
export {
  s as isSameDay
};
//# sourceMappingURL=index423.js.map
