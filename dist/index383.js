import { normalizeDates as m } from "./index433.js";
import { startOfDay as t } from "./index390.js";
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
//# sourceMappingURL=index383.js.map
