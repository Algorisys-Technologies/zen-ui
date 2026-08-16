import { jsx as n } from "react/jsx-runtime";
import * as o from "react";
import { cva as s } from "./index146.js";
import { cn as p } from "./index145.js";
const t = {
  "1-flat": "zen-shadow-[6px_6px_0_-1px_var(--zen-color-background),6px_6px_0_0_var(--zen-color-border)]",
  "1-raised": "zen-shadow-[6px_6px_0_-1px_var(--zen-color-background),6px_6px_0_0_var(--zen-color-border),var(--zen-shadow-sm)]",
  "1-lifted": "zen-shadow-[6px_6px_0_-1px_var(--zen-color-background),6px_6px_0_0_var(--zen-color-border),var(--zen-shadow-lg)]",
  "2-flat": "zen-shadow-[6px_6px_0_-1px_var(--zen-color-background),6px_6px_0_0_var(--zen-color-border),12px_12px_0_-1px_var(--zen-color-background),12px_12px_0_0_var(--zen-color-border)]",
  "2-raised": "zen-shadow-[6px_6px_0_-1px_var(--zen-color-background),6px_6px_0_0_var(--zen-color-border),12px_12px_0_-1px_var(--zen-color-background),12px_12px_0_0_var(--zen-color-border),var(--zen-shadow-sm)]",
  "2-lifted": "zen-shadow-[6px_6px_0_-1px_var(--zen-color-background),6px_6px_0_0_var(--zen-color-border),12px_12px_0_-1px_var(--zen-color-background),12px_12px_0_0_var(--zen-color-border),var(--zen-shadow-lg)]"
}, l = s(
  [
    // Centring is part of `measure`: a capped width that hugs the left edge
    // reads as a broken layout rather than a page.
    "zen-mx-auto zen-w-full",
    // Nothing structural depends on this now that the pile is a box-shadow, but
    // it keeps Paper a positioning context for anything a caller absolutely
    // places inside it.
    "zen-relative",
    "zen-bg-zen-background zen-text-zen-foreground",
    // Paper corners are cut, not moulded. `sm` is 4px by default and 2px under
    // the paper theme, so this tracks the theme without hardcoding either.
    "zen-rounded-zen-sm"
  ],
  {
    variants: {
      /**
       * Reading width. Measured in `ch` rather than px so it tracks the font:
       * the target is a line length, not a box, and 65ch stays ~65 characters
       * whatever the type scale does.
       */
      measure: {
        prose: "zen-max-w-[65ch]",
        wide: "zen-max-w-[80ch]",
        full: "zen-max-w-full"
      },
      elevation: {
        flat: "zen-border zen-border-zen-border",
        /* No border: the shadow IS the edge. A hairline plus a shadow reads as
           a card with a border, which is the look this is trying not to be. */
        raised: "zen-shadow-zen-sm",
        lifted: "zen-shadow-zen-lg"
      },
      /** Document margins. Larger than Card's throughout — that is the point. */
      padding: {
        none: "",
        sm: "zen-p-5",
        md: "zen-p-8",
        lg: "zen-p-12"
      }
    },
    defaultVariants: {
      measure: "prose",
      elevation: "raised",
      padding: "md"
    }
  }
), c = o.forwardRef(
  ({ className: r, measure: a, elevation: e, padding: z, stack: d, ..._ }, x) => /* @__PURE__ */ n(
    "div",
    {
      ref: x,
      className: p(
        l({ measure: a, elevation: e, padding: z }),
        // Appended AFTER the variant classes so tailwind-merge drops the plain
        // elevation shadow in favour of the combined one — the stack shadow
        // already carries that elevation inside it.
        d ? t[`${d}-${e ?? "raised"}`] : void 0,
        r
      ),
      ..._
    }
  )
);
c.displayName = "Paper";
const i = o.forwardRef(
  ({ className: r, ...a }, e) => /* @__PURE__ */ n("div", { ref: e, className: p("zen-flex zen-flex-col zen-gap-1 zen-mb-6", r), ...a })
);
i.displayName = "PaperHeader";
const m = o.forwardRef(
  ({ className: r, ...a }, e) => (
    // Headings tighten while body opens up — the leading is set explicitly, not
    // inherited, so this holds under every theme rather than only the paper one.
    /* @__PURE__ */ n(
      "h2",
      {
        ref: e,
        className: p(
          "zen-m-0 zen-text-2xl zen-font-semibold zen-leading-tight zen-tracking-tight zen-text-zen-foreground",
          r
        ),
        ...a
      }
    )
  )
);
m.displayName = "PaperTitle";
const f = o.forwardRef(({ className: r, ...a }, e) => /* @__PURE__ */ n("p", { ref: e, className: p("zen-m-0 zen-text-sm zen-text-zen-muted-fg", r), ...a }));
f.displayName = "PaperDescription";
const v = o.forwardRef(
  ({ className: r, ...a }, e) => /* @__PURE__ */ n(
    "div",
    {
      ref: e,
      className: p("zen-text-base zen-leading-relaxed zen-text-zen-foreground", r),
      ...a
    }
  )
);
v.displayName = "PaperContent";
const b = o.forwardRef(
  ({ className: r, ...a }, e) => /* @__PURE__ */ n(
    "div",
    {
      ref: e,
      className: p(
        "zen-mt-8 zen-flex zen-flex-wrap zen-items-center zen-gap-2 zen-border-t zen-border-zen-border zen-pt-5",
        r
      ),
      ...a
    }
  )
);
b.displayName = "PaperFooter";
export {
  c as Paper,
  v as PaperContent,
  f as PaperDescription,
  b as PaperFooter,
  i as PaperHeader,
  m as PaperTitle
};
//# sourceMappingURL=index85.js.map
