import { createComponent as s, mergeProps as c } from "solid-js/web";
import { createTagName as l } from "./index188.js";
import { Polymorphic as g } from "./index175.js";
import { __export as u } from "./index159.js";
import { mergeDefaultProps as v } from "./index160.js";
import { splitProps as h } from "solid-js";
import { mergeRefs as P } from "./index161.js";
var d = {};
u(d, {
  Root: () => e,
  Separator: () => _
});
function e(a) {
  let o;
  const i = v({
    orientation: "horizontal"
  }, a), [r, n] = h(i, ["ref", "orientation"]), p = l(() => o, () => "hr");
  return s(g, c({
    as: "hr",
    ref(m) {
      var t = P((f) => o = f, r.ref);
      typeof t == "function" && t(m);
    },
    get role() {
      return p() !== "hr" ? "separator" : void 0;
    },
    get "aria-orientation"() {
      return r.orientation === "vertical" ? "vertical" : void 0;
    },
    get "data-orientation"() {
      return r.orientation;
    }
  }, n));
}
var _ = e;
export {
  _ as Separator,
  e as SeparatorRoot,
  d as separator_exports
};
//# sourceMappingURL=index195.js.map
