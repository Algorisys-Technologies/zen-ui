import { type JSX, splitProps } from "solid-js";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

/**
 * Paper — a document surface. A sheet you read, not a box you put things in.
 *
 *   <Paper>
 *     <PaperHeader>
 *       <PaperTitle>Kickoff notes</PaperTitle>
 *       <PaperDescription>Rajesh · 14 August</PaperDescription>
 *     </PaperHeader>
 *     <PaperContent>
 *       <p>Long-form content, capped at a readable line length.</p>
 *     </PaperContent>
 *     <PaperFooter><Button>Reply</Button></PaperFooter>
 *   </Paper>
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

/**
 * The pile. One or two sheet edges peeking out behind the top sheet — the
 * affordance for "this is a thread / there are more of these", which a column of
 * separate Papers cannot say.
 *
 * Layered box-shadows, and the two techniques that DON'T work are worth
 * recording, because both look obviously right:
 *
 *  - **Absolutely-positioned pseudo-elements at `z-index: -1`.** Built and
 *    measured: the pseudos were correct in every computed property — `content:
 *    ""`, `absolute`, offsets of 6px and 12px — and nothing appeared on screen.
 *    A negative z-index does not go behind its PARENT's background, it goes
 *    behind the nearest stacking-context ROOT's content, so the edges landed
 *    under the surrounding page background as well and were painted over. It
 *    only works if an ancestor isolates, which is the consumer's element and
 *    not ours to require.
 *  - **Real child divs.** Same overlap problem in reverse: they paint ABOVE the
 *    sheet's background, so their borders draw lines across its face. They would
 *    also need `aria-hidden`, where pseudo-elements are simply not in the
 *    accessibility tree — a reader is never told the pile has three documents
 *    when you rendered one.
 *
 * A box-shadow paints strictly behind the element's own background and outside
 * its box, which is exactly a sheet underneath. Two shadows per edge: a filled
 * one inset by 1px for the sheet's face, and a flush one for its hairline.
 *
 * The cost is that `elevation` also owns `box-shadow`, so the combinations are
 * enumerated LITERALLY here rather than composed at runtime. That is not
 * verbosity for its own sake — UnoCSS scans source text, so a class assembled
 * from template pieces generates no CSS at all and the whole feature silently
 * renders nothing.
 */
const STACK_SHADOW = {
  "1-flat":
    "zen-shadow-[6px_6px_0_-1px_var(--zen-color-background),6px_6px_0_0_var(--zen-color-border)]",
  "1-raised":
    "zen-shadow-[6px_6px_0_-1px_var(--zen-color-background),6px_6px_0_0_var(--zen-color-border),var(--zen-shadow-sm)]",
  "1-lifted":
    "zen-shadow-[6px_6px_0_-1px_var(--zen-color-background),6px_6px_0_0_var(--zen-color-border),var(--zen-shadow-lg)]",
  "2-flat":
    "zen-shadow-[6px_6px_0_-1px_var(--zen-color-background),6px_6px_0_0_var(--zen-color-border),12px_12px_0_-1px_var(--zen-color-background),12px_12px_0_0_var(--zen-color-border)]",
  "2-raised":
    "zen-shadow-[6px_6px_0_-1px_var(--zen-color-background),6px_6px_0_0_var(--zen-color-border),12px_12px_0_-1px_var(--zen-color-background),12px_12px_0_0_var(--zen-color-border),var(--zen-shadow-sm)]",
  "2-lifted":
    "zen-shadow-[6px_6px_0_-1px_var(--zen-color-background),6px_6px_0_0_var(--zen-color-border),12px_12px_0_-1px_var(--zen-color-background),12px_12px_0_0_var(--zen-color-border),var(--zen-shadow-lg)]",
} as const;

const paperVariants = cva(
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

export type PaperProps = VariantProps<typeof paperVariants> &
  Omit<JSX.HTMLAttributes<HTMLDivElement>, "class"> & {
    class?: string;
    children?: JSX.Element;
    /**
     * Draw 1 or 2 sheet edges behind this one — a pile rather than a sheet.
     * Purely decorative: the edges are box-shadows, so nothing enters the DOM
     * or the accessibility tree and a reader is never told the pile holds more
     * documents than the one you rendered.
     */
    stack?: 1 | 2;
  };

export const Paper = (props: PaperProps) => {
  const [local, rest] = splitProps(props, [
    "class",
    "measure",
    "elevation",
    "padding",
    "stack",
    "children",
  ]);
  return (
    <div
      {...rest}
      class={cn(
        paperVariants({
          measure: local.measure,
          elevation: local.elevation,
          padding: local.padding,
        }),
        // Appended AFTER the variant classes so tailwind-merge drops the plain
        // elevation shadow in favour of the combined one — the stack shadow
        // already carries that elevation inside it.
        local.stack
          ? STACK_SHADOW[`${local.stack}-${local.elevation ?? "raised"}` as keyof typeof STACK_SHADOW]
          : undefined,
        local.class,
      )}
    >
      {local.children}
    </div>
  );
};

type SectionProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class"> & {
  class?: string;
  children?: JSX.Element;
};

export const PaperHeader = (props: SectionProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <div {...rest} class={cn("zen-flex zen-flex-col zen-gap-1 zen-mb-6", local.class)}>
      {local.children}
    </div>
  );
};

export type PaperTitleProps = Omit<JSX.HTMLAttributes<HTMLHeadingElement>, "class"> & {
  class?: string;
  children?: JSX.Element;
};

export const PaperTitle = (props: PaperTitleProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    // Headings tighten while body opens up — the leading is set explicitly, not
    // inherited, so this holds under every theme rather than only the paper one.
    <h2
      {...rest}
      class={cn(
        "zen-m-0 zen-text-2xl zen-font-semibold zen-leading-tight zen-tracking-tight zen-text-zen-foreground",
        local.class,
      )}
    >
      {local.children}
    </h2>
  );
};

export const PaperDescription = (props: SectionProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <p {...rest} class={cn("zen-m-0 zen-text-sm zen-text-zen-muted-fg", local.class)}>
      {local.children}
    </p>
  );
};

export const PaperContent = (props: SectionProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <div
      {...rest}
      /* The prose region. `leading-relaxed` here rather than on the sheet so a
         caller can put a table or a figure in a Paper without it inheriting
         body leading it does not want. */
      class={cn("zen-text-base zen-leading-relaxed zen-text-zen-foreground", local.class)}
    >
      {local.children}
    </div>
  );
};

export const PaperFooter = (props: SectionProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <div
      {...rest}
      class={cn(
        "zen-mt-8 zen-flex zen-flex-wrap zen-items-center zen-gap-2 zen-border-t zen-border-zen-border zen-pt-5",
        local.class,
      )}
    >
      {local.children}
    </div>
  );
};
