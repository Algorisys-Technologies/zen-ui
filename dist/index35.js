import { jsx as n } from "react/jsx-runtime";
import * as c from "react";
import { Root as a, SwitchThumb as o } from "./index156.js";
import { cn as t } from "./index145.js";
const d = {
  sm: "zen-h-4 zen-w-7",
  md: "zen-h-5 zen-w-9",
  lg: "zen-h-6 zen-w-11"
}, i = {
  sm: "zen-h-3 zen-w-3 data-[state=checked]:zen-translate-x-3 data-[state=unchecked]:zen-translate-x-0.5",
  md: "zen-h-4 zen-w-4 data-[state=checked]:zen-translate-x-4 data-[state=unchecked]:zen-translate-x-0.5",
  lg: "zen-h-5 zen-w-5 data-[state=checked]:zen-translate-x-5 data-[state=unchecked]:zen-translate-x-0.5"
}, l = c.forwardRef(({ className: s, size: e = "md", ...z }, r) => /* @__PURE__ */ n(
  a,
  {
    ref: r,
    className: t(
      "zen-peer zen-inline-flex zen-shrink-0 zen-cursor-pointer zen-items-center zen-rounded-zen-full",
      "zen-transition-colors",
      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
      "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
      "data-[state=checked]:zen-bg-zen-primary data-[state=unchecked]:zen-bg-zen-muted",
      d[e],
      s
    ),
    ...z,
    children: /* @__PURE__ */ n(
      o,
      {
        className: t(
          "zen-block zen-rounded-zen-full zen-bg-zen-background zen-shadow-md zen-ring-0",
          "zen-transition-transform",
          i[e]
        )
      }
    )
  }
));
l.displayName = a.displayName;
export {
  l as Switch
};
//# sourceMappingURL=index35.js.map
