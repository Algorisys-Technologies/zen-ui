import { differenceInCalendarDays as a } from "./index407.js";
import { startOfYear as e } from "./index434.js";
import { toDate as o } from "./index468.js";
function s(t, f) {
  const r = o(t, f?.in);
  return a(r, e(r)) + 1;
}
export {
  s as getDayOfYear
};
//# sourceMappingURL=index478.js.map
