import { normalizeDates as m } from "./index397.js";
import { startOfDay as t } from "./index350.js";
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
//# sourceMappingURL=index343.js.map
