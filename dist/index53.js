import { createComponent as r, mergeProps as s } from "solid-js/web";
import { splitProps as c } from "solid-js";
import { Popover as o } from "./index127.js";
import { cn as p } from "./index103.js";
const i = o, m = o.Trigger, a = o.Anchor, g = o.CloseButton, u = o.Portal, v = (n) => {
  const [e, t] = c(n, ["class", "children"]);
  return r(o.Portal, {
    get children() {
      return r(o.Content, s(t, {
        get class() {
          return p("zen-z-50 zen-w-72 zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-p-4 zen-text-zen-foreground zen-shadow-md zen-outline-none", e.class);
        },
        get children() {
          return e.children;
        }
      }));
    }
  });
};
export {
  i as Popover,
  a as PopoverAnchor,
  g as PopoverClose,
  v as PopoverContent,
  u as PopoverPortal,
  m as PopoverTrigger
};
//# sourceMappingURL=index53.js.map
