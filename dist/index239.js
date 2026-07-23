import { untrack as f } from "solid-js";
import { getFieldArrayNames as s } from "./index238.js";
import { getFieldArrayStore as c } from "./index209.js";
import { getPathIndex as l } from "./index241.js";
function g(e, r) {
  s(e, !1).forEach((o) => {
    const i = f(c(e, o).items.get).length - 1;
    r.filter((t) => t.startsWith(`${o}.`) && l(o, t) > i).forEach((t) => {
      r.splice(r.indexOf(t), 1);
    });
  });
}
export {
  g as removeInvalidNames
};
//# sourceMappingURL=index239.js.map
