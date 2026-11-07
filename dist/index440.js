import { differenceInCalendarDays as a } from "./index367.js";
import { startOfYear as e } from "./index394.js";
import { toDate as o } from "./index430.js";
function s(t, f) {
  const r = o(t, f?.in);
  return a(r, e(r)) + 1;
}
export {
  s as getDayOfYear
};
//# sourceMappingURL=index440.js.map
