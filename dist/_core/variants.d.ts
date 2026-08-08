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
import { type VariantProps } from "class-variance-authority";
/**
 * The semantic palette, named once.
 *
 * Every component that takes a `color` draws from this list. It exists because
 * they did not: Button spelled the red slot `error` and Alert spelled the same
 * slot `destructive`, on a prop of the same name, so a value could not move
 * between them without a translation table. Seven components said `error` and
 * two said `destructive`; the TOKENS have only ever been `--zen-color-error`,
 * with no `--zen-destructive` anywhere, so `error` was already the truth and
 * `destructive` was a second name for it.
 *
 * `destructive` is still ACCEPTED by Alert and Banner and renders identically —
 * nobody's code breaks — but it is deprecated and no longer the documented
 * spelling. New components must use this type rather than inlining a list,
 * which is how the divergence happened in the first place.
 */
export declare const ZEN_SEMANTIC_COLORS: readonly ["primary", "neutral", "info", "success", "warning", "error"];
export type ZenSemanticColor = (typeof ZEN_SEMANTIC_COLORS)[number];
/**
 * @deprecated Spell it `error`. Accepted for compatibility; it maps to the same
 * `--zen-color-error` tokens and renders identically.
 */
export type ZenDeprecatedColorAlias = "destructive";
/**
 * Button — shadcn/radix-style.
 *
 * The base resets browser-default <button> chrome: UnoCSS's presetUno preflight
 * does NOT ship Tailwind v3's element reset, so without these every <button>
 * renders with the OS's 3D border and native background.
 */
export declare const buttonVariants: (props?: ({
    variant?: "solid" | "outline" | "soft" | "ghost" | "link" | null | undefined;
    color?: "warning" | "info" | "error" | "primary" | "neutral" | "success" | null | undefined;
    size?: "xs" | "sm" | "md" | "lg" | "xl" | null | undefined;
    shape?: "default" | "square" | "circle" | "block" | null | undefined;
    multiline?: boolean | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
/**
 * Badge — shadcn-style. Not built on a primitive (neither Radix nor Kobalte has a
 * Badge); it is a styled span.
 */
export declare const badgeVariants: (props?: ({
    variant?: "solid" | "outline" | "soft" | null | undefined;
    color?: "warning" | "info" | "error" | "primary" | "neutral" | "success" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export type BadgeVariantProps = VariantProps<typeof badgeVariants>;
