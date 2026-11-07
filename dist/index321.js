import { TZDate as r } from "./index359.js";
import "./index360.js";
function e(n, o) {
  return n instanceof r && n.timeZone === o ? n : new r(n, o);
}
export {
  e as toTimeZone
};
//# sourceMappingURL=index321.js.map
