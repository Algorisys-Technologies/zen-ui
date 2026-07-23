import { template as n, spread as o, mergeProps as l } from "solid-js/web";
import { splitProps as a } from "solid-js";
import { cn as m } from "./index103.js";
var p = /* @__PURE__ */ n("<div>");
const u = (r) => {
  const [t, s] = a(r, ["class"]);
  return (() => {
    var e = p();
    return o(e, l({
      get class() {
        return m("zen-animate-pulse zen-rounded-zen-md zen-bg-zen-muted", t.class);
      }
    }, s), !1, !1), e;
  })();
};
export {
  u as Skeleton
};
//# sourceMappingURL=index32.js.map
