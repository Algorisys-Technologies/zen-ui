import { createComponent as t, mergeProps as l, memo as i } from "solid-js/web";
import { splitProps as a, Show as s } from "solid-js";
import { Tooltip as e } from "./index122.js";
import { cn as c } from "./index103.js";
const g = e, u = e.Trigger, h = e.Portal, T = (n) => {
  const [r, o] = a(n, ["class", "arrow", "children"]);
  return t(e.Portal, {
    get children() {
      return t(e.Content, l(o, {
        get class() {
          return c(
            "zen-z-50 zen-max-w-xs zen-px-2.5 zen-py-1.5",
            "zen-rounded-zen-md zen-bg-zen-neutral zen-text-xs zen-text-zen-neutral-fg",
            "zen-shadow-md",
            // Kobalte sets data-expanded / data-closed on the content.
            "zen-transition-opacity zen-duration-100 data-[closed]:zen-opacity-0",
            r.class
          );
        },
        get children() {
          return [i(() => r.children), t(s, {
            get when() {
              return r.arrow;
            },
            get children() {
              return t(e.Arrow, {
                class: "zen-fill-zen-neutral"
              });
            }
          })];
        }
      }));
    }
  });
};
export {
  g as Tooltip,
  T as TooltipContent,
  h as TooltipPortal,
  u as TooltipTrigger
};
//# sourceMappingURL=index48.js.map
