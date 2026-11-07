import { getBroadcastWeeksInMonth as n } from "./index422.js";
import { startOfBroadcastWeek as s } from "./index362.js";
function d(e, t) {
  const o = s(e, t), r = n(e, t);
  return t.addDays(o, r * 7 - 1);
}
export {
  d as endOfBroadcastWeek
};
//# sourceMappingURL=index361.js.map
