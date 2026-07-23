import { createComponent as n, Dynamic as u, mergeProps as l, memo as t, template as o, spread as c, insert as m } from "solid-js/web";
import { mergeProps as f, splitProps as p, Show as a } from "solid-js";
import { cva as g } from "./index118.js";
import { Icon as h } from "./index21.js";
import { cn as x } from "./index106.js";
var b = /* @__PURE__ */ o("<span class=zen-sr-only>(opens in a new tab)"), v = /* @__PURE__ */ o("<span aria-disabled=true>");
const k = g(["zen-rounded-zen-sm zen-transition-colors", "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2"].join(" "), {
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
    {
      inline: !0,
      size: ["sm", "md", "lg"],
      class: "zen-text-inherit"
    }
  ],
  defaultVariants: {
    size: "md",
    inline: !1,
    disabled: !1
  }
}), V = (z) => {
  const d = f({
    as: "a"
  }, z), [e, i] = p(d, ["as", "size", "inline", "external", "disabled", "class", "children", "href", "target", "rel"]), s = () => x(k({
    size: e.size,
    inline: e.inline,
    disabled: e.disabled
  }), "zen-inline-flex zen-items-center zen-gap-1", e.class);
  return n(a, {
    get when() {
      return !e.disabled;
    },
    get fallback() {
      return (
        // The rest is typed for an anchor and this branch is a span, so every
        // event handler mismatches. The cast is at the one boundary where the
        // element genuinely changes — a disabled Link is not a link — rather
        // than weakening the props type for the case that matters.
        (() => {
          var r = v();
          return c(r, l({
            get class() {
              return s();
            }
          }, i), !1, !0), m(r, () => e.children), r;
        })()
      );
    },
    get children() {
      return n(u, l({
        get component() {
          return e.as;
        },
        get href() {
          return e.href;
        },
        get target() {
          return t(() => !!e.external)() ? e.target ?? "_blank" : e.target;
        },
        get rel() {
          return t(() => !!e.external)() ? e.rel ?? "noopener noreferrer" : e.rel;
        },
        get class() {
          return s();
        }
      }, i, {
        get children() {
          return [t(() => e.children), n(a, {
            get when() {
              return e.external;
            },
            get children() {
              return [n(h, {
                name: "external-link",
                size: 12,
                "aria-hidden": "true",
                class: "zen-shrink-0"
              }), b()];
            }
          })];
        }
      }));
    }
  });
};
export {
  V as Link,
  k as linkVariants
};
//# sourceMappingURL=index30.js.map
