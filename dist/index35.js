import { template as a, spread as i, mergeProps as s, memo as l } from "solid-js/web";
import { mergeProps as p, splitProps as m } from "solid-js";
import { cn as c } from "./index103.js";
var d = /* @__PURE__ */ a("<div>");
const v = (t) => {
  const o = p({
    orientation: "horizontal",
    decorative: !0
  }, t), [r, n] = m(o, ["orientation", "decorative", "class"]);
  return (() => {
    var e = d();
    return i(e, s({
      get role() {
        return r.decorative ? "none" : "separator";
      },
      get "aria-orientation"() {
        return l(() => !!r.decorative)() ? void 0 : r.orientation;
      },
      get "data-orientation"() {
        return r.orientation;
      },
      get class() {
        return c("zen-shrink-0 zen-bg-zen-border", r.orientation === "horizontal" ? "zen-h-px zen-w-full" : "zen-h-full zen-w-px", r.class);
      }
    }, n), !1, !1), e;
  })();
};
export {
  v as Separator
};
//# sourceMappingURL=index35.js.map
