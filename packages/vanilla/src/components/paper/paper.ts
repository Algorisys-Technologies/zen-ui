import { cva, type VariantProps } from "class-variance-authority";
import { styled } from "../../lib/styled";
import type { BaseProps, ZenComponent } from "../../lib/component";

/**
 * Paper — a document surface. A sheet you read, not a box you put things in.
 *
 *   Paper({ children: [
 *     PaperHeader({ children: [
 *       PaperTitle({ children: "Kickoff notes" }),
 *       PaperDescription({ children: "Rajesh · 14 August" }),
 *     ]}),
 *     PaperContent({ children: "Long-form content, capped at a readable line length." }),
 *     PaperFooter({ children: Button({ children: "Reply" }) }),
 *   ]})
 *
 * The compound shape deliberately mirrors Card's — Header / Title /
 * Description / Content / Footer — so there is nothing new to learn. What Card
 * cannot express is the reason this exists:
 *
 *  - **`measure`** caps the sheet at a readable line length. A page of prose is
 *    unreadable at 1400px however nice the box is, and this is the one property
 *    a theme cannot supply: `--zen-*` reaches colour, radius, shadow and type,
 *    but the utility layer has no spacing or width tokens, so `zen-p-6` and
 *    `max-w-lg` are literals no override can reach. The `paper` THEME therefore
 *    gets you a warm box; this gets you a page.
 *  - **Document typography.** Body leading opens, headings tighten, and both are
 *    set HERE rather than inherited, so Paper reads the same under every theme.
 *    Under `data-theme="paper"` the two compound, which is the intended pairing
 *    but not a requirement — Paper is not theme-dependent.
 *
 * The sheet centres itself, because a page lies on a desk rather than filling
 * it. Put it on a `bg-zen-muted` ground to get the contact the shadow implies;
 * see the note in tokens.css about ground vs sheet.
 */
const paperVariants = cva(
  [
    // Centring is part of `measure`: a capped width that hugs the left edge
    // reads as a broken layout rather than a page.
    "zen-mx-auto zen-w-full",
    "zen-bg-zen-background zen-text-zen-foreground",
    // Paper corners are cut, not moulded. `sm` is 4px by default and 2px under
    // the paper theme, so this tracks the theme without hardcoding either.
    "zen-rounded-zen-sm",
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
        full: "zen-max-w-full",
      },
      elevation: {
        flat: "zen-border zen-border-zen-border",
        /* No border: the shadow IS the edge. A hairline plus a shadow reads as
           a card with a border, which is the look this is trying not to be. */
        raised: "zen-shadow-zen-sm",
        lifted: "zen-shadow-zen-lg",
      },
      /** Document margins. Larger than Card's throughout — that is the point. */
      padding: {
        none: "",
        sm: "zen-p-5",
        md: "zen-p-8",
        lg: "zen-p-12",
      },
    },
    defaultVariants: {
      measure: "prose",
      elevation: "raised",
      padding: "md",
    },
  },
);

export type PaperProps = BaseProps & VariantProps<typeof paperVariants>;

export const Paper = styled<PaperProps>({
  tag: "div",
  own: ["measure", "elevation", "padding"],
  className: (p) =>
    paperVariants({ measure: p.measure, elevation: p.elevation, padding: p.padding }),
}) as (props?: PaperProps) => ZenComponent<PaperProps>;

export const PaperHeader = styled({
  tag: "div",
  className: "zen-flex zen-flex-col zen-gap-1 zen-mb-6",
});

// Headings tighten while body opens up — the leading is set explicitly, not
// inherited, so this holds under every theme rather than only the paper one.
export const PaperTitle = styled({
  tag: "h2",
  className:
    "zen-m-0 zen-text-2xl zen-font-semibold zen-leading-tight zen-tracking-tight zen-text-zen-foreground",
});

export const PaperDescription = styled({
  tag: "p",
  className: "zen-m-0 zen-text-sm zen-text-zen-muted-fg",
});

/* The prose region. `leading-relaxed` here rather than on the sheet so a caller
   can put a table or a figure in a Paper without it inheriting body leading it
   does not want. */
export const PaperContent = styled({
  tag: "div",
  className: "zen-text-base zen-leading-relaxed zen-text-zen-foreground",
});

export const PaperFooter = styled({
  tag: "div",
  className:
    "zen-mt-8 zen-flex zen-flex-wrap zen-items-center zen-gap-2 zen-border-t zen-border-zen-border zen-pt-5",
});
