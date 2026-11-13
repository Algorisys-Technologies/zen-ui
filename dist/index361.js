import { useMulti as i } from "./index450.js";
import { useRange as o } from "./index451.js";
import { useSingle as s } from "./index452.js";
function f(e, n) {
  const t = s(e, n), r = i(e, n), u = o(e, n);
  switch (e.mode) {
    case "single":
      return t;
    case "multiple":
      return r;
    case "range":
      return u;
    default:
      return;
  }
}
export {
  f as useSelection
};
//# sourceMappingURL=index361.js.map
