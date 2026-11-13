import { constructFromSymbol as o } from "./index469.js";
function c(r, n) {
  return typeof r == "function" ? r(n) : r && typeof r == "object" && o in r ? r[o](n) : r instanceof Date ? new r.constructor(n) : new Date(n);
}
export {
  c as constructFrom
};
//# sourceMappingURL=index467.js.map
