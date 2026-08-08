import * as p from "react";
import { Primitive as v } from "./index203.js";
import { jsx as m } from "react/jsx-runtime";
var d = "Separator", a = "horizontal", l = ["horizontal", "vertical"], i = p.forwardRef((r, n) => {
  const { decorative: e, orientation: t = a, ...s } = r, o = f(t) ? t : a, c = e ? { role: "none" } : { "aria-orientation": o === "vertical" ? o : void 0, role: "separator" };
  return /* @__PURE__ */ m(
    v.div,
    {
      "data-orientation": o,
      ...c,
      ...s,
      ref: n
    }
  );
});
i.displayName = d;
function f(r) {
  return l.includes(r);
}
var T = i;
export {
  T as Root,
  i as Separator
};
//# sourceMappingURL=index162.js.map
