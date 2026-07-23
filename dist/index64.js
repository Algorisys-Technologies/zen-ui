import { template as s, spread as l, mergeProps as o } from "solid-js/web";
import { splitProps as z } from "solid-js";
import { cn as i } from "./index106.js";
var a = /* @__PURE__ */ s("<input>"), d = /* @__PURE__ */ s("<textarea>");
const p = (r) => {
  const [n, t] = z(r, ["class", "type"]);
  return (() => {
    var e = a();
    return l(e, o({
      get type() {
        return n.type;
      },
      get class() {
        return i("zen-flex zen-h-10 zen-w-full zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-3 zen-py-2 zen-text-sm", "placeholder:zen-text-zen-muted-fg", "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2", "disabled:zen-cursor-not-allowed disabled:zen-opacity-50", "file:zen-border-0 file:zen-bg-transparent file:zen-text-sm file:zen-font-medium", n.class);
      }
    }, t), !1, !1), e;
  })();
}, b = (r) => {
  const [n, t] = z(r, ["class"]);
  return (() => {
    var e = d();
    return l(e, o({
      get class() {
        return i("zen-flex zen-min-h-20 zen-w-full zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-3 zen-py-2 zen-text-sm", "placeholder:zen-text-zen-muted-fg", "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2", "disabled:zen-cursor-not-allowed disabled:zen-opacity-50", n.class);
      }
    }, t), !1, !1), e;
  })();
};
export {
  p as Input,
  b as Textarea
};
//# sourceMappingURL=index64.js.map
