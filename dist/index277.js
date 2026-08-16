import { TZDate as r } from "./index303.js";
import "./index305.js";
function e(n, o) {
  return n instanceof r && n.timeZone === o ? n : new r(n, o);
}
export {
  e as toTimeZone
};
//# sourceMappingURL=index277.js.map
