import { normalizeDates as m } from "./index393.js";
import { startOfDay as t } from "./index339.js";
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
//# sourceMappingURL=index332.js.map
