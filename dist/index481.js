import { differenceInCalendarDays as a } from "./index410.js";
import { startOfYear as e } from "./index437.js";
import { toDate as o } from "./index471.js";
function s(t, f) {
  const r = o(t, f?.in);
  return a(r, e(r)) + 1;
}
export {
  s as getDayOfYear
};
//# sourceMappingURL=index481.js.map
