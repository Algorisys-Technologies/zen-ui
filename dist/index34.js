import { jsx as e, jsxs as z, Fragment as x } from "react/jsx-runtime";
import * as b from "react";
import { Root as h, Slottable as v } from "./index171.js";
import { cva as g } from "./index161.js";
import { Icon as k } from "./index63.js";
import { useLocale as N } from "./index90.js";
import { cn as y } from "./index160.js";
const j = g(
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
), w = b.forwardRef(
  ({ size: m, inline: c, external: n, disabled: i, asChild: f, className: u, children: r, href: d, target: s, rel: o, ...t }, a) => {
    const p = N(), l = y(j({ size: m, inline: c, disabled: i }), "zen-inline-flex zen-items-center zen-gap-1", u);
    return i ? /* @__PURE__ */ e("span", { ref: a, "aria-disabled": !0, className: l, ...t, children: r }) : /* @__PURE__ */ z(
      f ? h : "a",
      {
        ref: a,
        href: d,
        target: n ? s ?? "_blank" : s,
        rel: n ? o ?? "noopener noreferrer" : o,
        className: l,
        ...t,
        children: [
          /* @__PURE__ */ e(v, { children: r }),
          n ? /* @__PURE__ */ z(x, { children: [
            /* @__PURE__ */ e(k, { name: "external-link", size: 12, "aria-hidden": !0, className: "zen-shrink-0" }),
            /* @__PURE__ */ e("span", { className: "zen-sr-only", children: p.t("link.opensInNewTab") })
          ] }) : null
        ]
      }
    );
  }
);
w.displayName = "Link";
export {
  w as Link,
  j as linkVariants
};
//# sourceMappingURL=index34.js.map
