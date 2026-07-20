/**
 * Shared component variants.
 *
 * These are pure data: `cva` is framework-agnostic, and a variant table is a
 * design decision — "a solid primary button is `zen-bg-zen-primary` on
 * `zen-text-zen-primary-fg`" — that has nothing to do with which renderer draws
 * it. They lived in each binding instead, byte-for-byte duplicated, with nothing
 * asserting the copies agreed. Solid's button.tsx said the variants came from cva
 * "so styling stays byte-identical", which is a hope, not a mechanism. They had
 * not drifted (measured: 128 identical class tokens for button), but only because
 * someone hand-copied correctly every time. A third binding would have made it
 * three copies.
 *
 * ## What can live here, and what cannot
 *
 * Only variants that carry NO state vocabulary.
 *
 * The primitive library's state attributes leak into the shipped class strings:
 * React selects a tab with a `data-[state=active]` variant where Solid uses
 * `data-[selected]` — the same design decision in two dialects, because Radix and
 * Kobalte disagree. Measured: React uses `data-[state=…]` 58 times and Kobalte's
 * vocabulary 0; Solid is 7 vs 19.
 *
 * (Those variants are named here without the utility half they normally carry, on
 * purpose. Uno extracts from raw text and does not know what a comment is, so a
 * complete class token written in prose is emitted as a real rule — this file is
 * scanned, and a doc comment that invents CSS is its own small bug.)
 *
 * So Button and Badge hoist cleanly — they are styled by props alone. Tabs and
 * Accordion cannot, and their variants stay in each binding until we decide
 * whether to converge the vocabulary. Do not "finish the job" by moving a variant
 * with a `data-[…]` selector in it and papering over the difference; that trades a
 * duplication for a lie.
 */
import { cva, type VariantProps } from "class-variance-authority";

/**
 * Button — shadcn/radix-style.
 *
 * The base resets browser-default <button> chrome: UnoCSS's presetUno preflight
 * does NOT ship Tailwind v3's element reset, so without these every <button>
 * renders with the OS's 3D border and native background.
 */
export const buttonVariants = cva(
  [
    "zen-appearance-none zen-border-0 zen-bg-transparent",
    "zen-inline-flex zen-items-center zen-justify-center zen-gap-2",
    "zen-whitespace-nowrap zen-font-medium",
    "zen-select-none zen-cursor-pointer",
    "zen-transition-colors zen-duration-150",
    "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
    "disabled:zen-opacity-50 disabled:zen-cursor-not-allowed disabled:zen-pointer-events-none",
  ].join(" "),
  {
    variants: {
      variant: {
        solid: "",
        outline: "zen-border zen-bg-transparent",
        soft: "",
        ghost: "zen-bg-transparent hover:zen-bg-zen-muted",
        link: "zen-bg-transparent zen-underline-offset-4 hover:zen-underline zen-p-0 zen-h-auto",
      },
      color: {
        primary: "",
        neutral: "",
        info: "",
        success: "",
        warning: "",
        error: "",
      },
      size: {
        xs: "zen-h-7 zen-px-2 zen-text-xs zen-rounded-zen-sm",
        sm: "zen-h-8 zen-px-3 zen-text-sm zen-rounded-zen-sm",
        md: "zen-h-10 zen-px-4 zen-text-sm zen-rounded-zen-md",
        lg: "zen-h-11 zen-px-6 zen-text-base zen-rounded-zen-md",
        xl: "zen-h-12 zen-px-8 zen-text-base zen-rounded-zen-lg",
      },
      shape: {
        default: "",
        square: "zen-aspect-square zen-px-0",
        circle: "zen-aspect-square zen-px-0 zen-rounded-zen-full",
        block: "zen-w-full",
      },
      // Let the label wrap across lines instead of forcing a single line.
      // Drops the fixed height + nowrap (keeps a min tap height) and
      // start-aligns content — useful for long-text options / list buttons.
      // `text-start`, not `text-left`, to match the `justify-start` beside it:
      // the two sat inconsistent until the RTL audit, so the label alignment
      // did not flip with the direction while the flex alignment did.
      multiline: {
        true: "!zen-whitespace-normal !zen-h-auto zen-min-h-10 !zen-items-start !zen-justify-start zen-text-start zen-py-2",
        false: "",
      },
    },
    compoundVariants: [
      // solid
      { variant: "solid", color: "primary", class: "zen-bg-zen-primary zen-text-zen-primary-fg hover:zen-opacity-90" },
      { variant: "solid", color: "neutral", class: "zen-bg-zen-neutral zen-text-zen-neutral-fg hover:zen-opacity-90" },
      { variant: "solid", color: "info", class: "zen-bg-zen-info zen-text-zen-info-fg hover:zen-opacity-90" },
      { variant: "solid", color: "success", class: "zen-bg-zen-success zen-text-zen-success-fg hover:zen-opacity-90" },
      { variant: "solid", color: "warning", class: "zen-bg-zen-warning zen-text-zen-warning-fg hover:zen-opacity-90" },
      { variant: "solid", color: "error", class: "zen-bg-zen-error zen-text-zen-error-fg hover:zen-opacity-90" },
      // outline
      { variant: "outline", color: "primary", class: "zen-border-zen-primary zen-text-zen-primary hover:zen-bg-zen-primary-soft" },
      { variant: "outline", color: "neutral", class: "zen-border-zen-border zen-text-zen-foreground hover:zen-bg-zen-muted" },
      { variant: "outline", color: "info", class: "zen-border-zen-info zen-text-zen-info hover:zen-bg-zen-info-soft" },
      { variant: "outline", color: "success", class: "zen-border-zen-success zen-text-zen-success hover:zen-bg-zen-success-soft" },
      { variant: "outline", color: "warning", class: "zen-border-zen-warning zen-text-zen-warning hover:zen-bg-zen-warning-soft" },
      { variant: "outline", color: "error", class: "zen-border-zen-error zen-text-zen-error hover:zen-bg-zen-error-soft" },
      // soft
      { variant: "soft", color: "primary", class: "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg hover:zen-opacity-90" },
      { variant: "soft", color: "neutral", class: "zen-bg-zen-neutral-soft zen-text-zen-neutral-soft-fg hover:zen-opacity-90" },
      { variant: "soft", color: "info", class: "zen-bg-zen-info-soft zen-text-zen-info-soft-fg hover:zen-opacity-90" },
      { variant: "soft", color: "success", class: "zen-bg-zen-success-soft zen-text-zen-success-soft-fg hover:zen-opacity-90" },
      { variant: "soft", color: "warning", class: "zen-bg-zen-warning-soft zen-text-zen-warning-soft-fg hover:zen-opacity-90" },
      { variant: "soft", color: "error", class: "zen-bg-zen-error-soft zen-text-zen-error-soft-fg hover:zen-opacity-90" },
      // ghost text color follows the chosen color
      { variant: "ghost", color: "primary", class: "zen-text-zen-primary" },
      { variant: "ghost", color: "neutral", class: "zen-text-zen-foreground" },
      { variant: "ghost", color: "info", class: "zen-text-zen-info" },
      { variant: "ghost", color: "success", class: "zen-text-zen-success" },
      { variant: "ghost", color: "warning", class: "zen-text-zen-warning" },
      { variant: "ghost", color: "error", class: "zen-text-zen-error" },
      // link text color follows the chosen color
      { variant: "link", color: "primary", class: "zen-text-zen-primary" },
      { variant: "link", color: "neutral", class: "zen-text-zen-foreground" },
      { variant: "link", color: "info", class: "zen-text-zen-info" },
      { variant: "link", color: "success", class: "zen-text-zen-success" },
      { variant: "link", color: "warning", class: "zen-text-zen-warning" },
      { variant: "link", color: "error", class: "zen-text-zen-error" },
    ],
    defaultVariants: {
      variant: "solid",
      color: "primary",
      size: "md",
      shape: "default",
      multiline: false,
    },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;

/**
 * Badge — shadcn-style. Not built on a primitive (neither Radix nor Kobalte has a
 * Badge); it is a styled span.
 */
export const badgeVariants = cva(
  [
    "zen-inline-flex zen-items-center zen-gap-1 zen-rounded-zen-full",
    "zen-px-2 zen-py-0.5 zen-text-xs zen-font-medium",
    "zen-border zen-border-transparent",
    "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
    "zen-transition-colors",
  ].join(" "),
  {
    variants: {
      variant: {
        solid: "",
        soft: "",
        outline: "zen-bg-transparent",
      },
      color: {
        primary: "",
        neutral: "",
        info: "",
        success: "",
        warning: "",
        error: "",
      },
    },
    compoundVariants: [
      { variant: "solid", color: "primary", class: "zen-bg-zen-primary zen-text-zen-primary-fg" },
      { variant: "solid", color: "neutral", class: "zen-bg-zen-neutral zen-text-zen-neutral-fg" },
      { variant: "solid", color: "info", class: "zen-bg-zen-info zen-text-zen-info-fg" },
      { variant: "solid", color: "success", class: "zen-bg-zen-success zen-text-zen-success-fg" },
      { variant: "solid", color: "warning", class: "zen-bg-zen-warning zen-text-zen-warning-fg" },
      { variant: "solid", color: "error", class: "zen-bg-zen-error zen-text-zen-error-fg" },
      { variant: "soft", color: "primary", class: "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg" },
      { variant: "soft", color: "neutral", class: "zen-bg-zen-neutral-soft zen-text-zen-neutral-soft-fg" },
      { variant: "soft", color: "info", class: "zen-bg-zen-info-soft zen-text-zen-info-soft-fg" },
      { variant: "soft", color: "success", class: "zen-bg-zen-success-soft zen-text-zen-success-soft-fg" },
      { variant: "soft", color: "warning", class: "zen-bg-zen-warning-soft zen-text-zen-warning-soft-fg" },
      { variant: "soft", color: "error", class: "zen-bg-zen-error-soft zen-text-zen-error-soft-fg" },
      { variant: "outline", color: "primary", class: "zen-border-zen-primary zen-text-zen-primary" },
      { variant: "outline", color: "neutral", class: "zen-border-zen-border zen-text-zen-foreground" },
      { variant: "outline", color: "info", class: "zen-border-zen-info zen-text-zen-info" },
      { variant: "outline", color: "success", class: "zen-border-zen-success zen-text-zen-success" },
      { variant: "outline", color: "warning", class: "zen-border-zen-warning zen-text-zen-warning" },
      { variant: "outline", color: "error", class: "zen-border-zen-error zen-text-zen-error" },
    ],
    defaultVariants: {
      variant: "soft",
      color: "primary",
    },
  },
);

export type BadgeVariantProps = VariantProps<typeof badgeVariants>;
