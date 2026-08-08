import { jsx as e, jsxs as z, Fragment as p } from "react/jsx-runtime";
import * as x from "react";
import { Root as b, Slottable as h } from "./index150.js";
import { cva as v } from "./index144.js";
import { Icon as g } from "./index56.js";
import { cn as k } from "./index143.js";
const N = v(
  [
    "zen-rounded-zen-sm zen-transition-colors",
    "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2"
  ].join(" "),
  {
    variants: {
      size: {
        sm: "zen-text-xs",
        md: "zen-text-sm",
        lg: "zen-text-base"
      },
      /**
       * A link in running prose is underlined and takes the sentence's colour
       * and size — colour alone is not an accessible way to say "link" when
       * the link sits inside text.
       */
      inline: {
        true: "zen-text-inherit zen-underline zen-underline-offset-2 hover:zen-text-zen-primary",
        false: "zen-text-zen-primary zen-no-underline hover:zen-underline hover:zen-underline-offset-2"
      },
      disabled: {
        true: "zen-cursor-not-allowed zen-text-zen-muted-fg zen-no-underline hover:zen-no-underline",
        false: "zen-cursor-pointer"
      }
    },
    compoundVariants: [
      // `inline` inherits the surrounding type, so a size would fight it.
      { inline: !0, size: ["sm", "md", "lg"], class: "zen-text-inherit" }
    ],
    defaultVariants: { size: "md", inline: !1, disabled: !1 }
  }
), y = x.forwardRef(
  ({ size: m, inline: d, external: n, disabled: i, asChild: f, className: u, children: r, href: c, target: s, rel: t, ...o }, a) => {
    const l = k(N({ size: m, inline: d, disabled: i }), "zen-inline-flex zen-items-center zen-gap-1", u);
    return i ? /* @__PURE__ */ e("span", { ref: a, "aria-disabled": !0, className: l, ...o, children: r }) : /* @__PURE__ */ z(
      f ? b : "a",
      {
        ref: a,
        href: c,
        target: n ? s ?? "_blank" : s,
        rel: n ? t ?? "noopener noreferrer" : t,
        className: l,
        ...o,
        children: [
          /* @__PURE__ */ e(h, { children: r }),
          n ? /* @__PURE__ */ z(p, { children: [
            /* @__PURE__ */ e(g, { name: "external-link", size: 12, "aria-hidden": !0, className: "zen-shrink-0" }),
            /* @__PURE__ */ e("span", { className: "zen-sr-only", children: "(opens in a new tab)" })
          ] }) : null
        ]
      }
    );
  }
);
y.displayName = "Link";
export {
  y as Link,
  N as linkVariants
};
//# sourceMappingURL=index30.js.map
