import { template as t, spread as n, mergeProps as s, insert as a } from "solid-js/web";
import { splitProps as c } from "solid-js";
import { cn as i } from "./index106.js";
var p = /* @__PURE__ */ t("<div>");
const v = (l) => {
  const [e, o] = c(l, ["class", "children"]);
  return (() => {
    var r = p();
    return n(r, s(o, {
      get class() {
        return i(
          "zen-relative zen-overflow-auto",
          // Subtle Webkit/Firefox scrollbar styling, falling back to native.
          "zen-[scrollbar-width:thin] zen-[scrollbar-color:var(--zen-color-border)_transparent]",
          e.class
        );
      }
    }), !1, !0), a(r, () => e.children), r;
  })();
}, f = () => null;
export {
  v as ScrollArea,
  f as ScrollBar
};
//# sourceMappingURL=index62.js.map
