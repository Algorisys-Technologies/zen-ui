import { normalizeDates as m } from "./index474.js";
import { startOfDay as t } from "./index435.js";
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
//# sourceMappingURL=index428.js.map
