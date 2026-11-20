import { useMulti as i } from "./index453.js";
import { useRange as o } from "./index454.js";
import { useSingle as s } from "./index455.js";
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
//# sourceMappingURL=index364.js.map
