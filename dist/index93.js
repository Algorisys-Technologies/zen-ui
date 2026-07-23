import { template as s, spread as n, mergeProps as m } from "solid-js/web";
import { splitProps as o } from "solid-js";
import { cn as p } from "./index106.js";
var l = /* @__PURE__ */ s("<div>");
const u = (t) => {
  const [e, a] = o(t, ["name", "transparent", "class"]);
  return (() => {
    var r = l();
    return n(r, m({
      get "data-theme"() {
        return e.name;
      },
      get class() {
        return p(e.transparent && "zen-contents", e.class);
      }
    }, a), !1, !1), r;
  })();
};
export {
  u as Theme
};
//# sourceMappingURL=index93.js.map
