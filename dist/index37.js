import { template as i, insert as p, createComponent as m, mergeProps as l, effect as a, className as z } from "solid-js/web";
import { mergeProps as c, splitProps as f } from "solid-js";
import { cva as g } from "./index118.js";
import { Button as h } from "./index5.js";
import { cn as e } from "./index106.js";
var d = /* @__PURE__ */ i("<div>");
const b = g("zen-fixed zen-z-40", {
  variants: {
    position: {
      "bottom-right": "zen-bottom-6 zen-right-6",
      "bottom-left": "zen-bottom-6 zen-left-6",
      "top-right": "zen-top-6 zen-right-6",
      "top-left": "zen-top-6 zen-left-6"
    }
  },
  defaultVariants: {
    position: "bottom-right"
  }
}), u = {
  md: "zen-h-12 zen-w-12",
  lg: "zen-h-14 zen-w-14",
  xl: "zen-h-16 zen-w-16"
}, B = (r) => {
  const n = c({
    size: "lg",
    color: "primary"
  }, r), [o, s] = f(n, ["position", "size", "class", "color"]);
  return (() => {
    var t = d();
    return p(t, m(h, l({
      get color() {
        return o.color;
      },
      shape: "circle",
      get class() {
        return e("zen-shadow-md hover:zen-shadow-lg", u[o.size], o.class);
      }
    }, s))), a(() => z(t, e(b({
      position: o.position
    })))), t;
  })();
};
export {
  B as FAB
};
//# sourceMappingURL=index37.js.map
