/**
 * cn() override contract.
 *
 *   bun run check:cn
 *
 * cn() is the whole per-instance customisation story: `className` on any
 * component has to REPLACE the component's own utility, not race it in the
 * stylesheet. That is pure-function behaviour, so it is cheap to pin — and it
 * has already broken silently once.
 *
 * The failure it guards: tailwind-merge groups colour utilities by
 * "bg-<anything>", but its radius group matches a fixed value list that
 * `zen-md` is not on. So `cn("zen-rounded-zen-md", "zen-rounded-zen-full")`
 * emitted BOTH classes, equal specificity, and Uno emits `full` before `md` —
 * the component's radius beat the caller's and the override vanished, while
 * `zen-rounded-zen-sm` happened to work because it is emitted later.
 * Value-dependent and invisible.
 */
import { cn } from "../packages/core/src/cn";

let fails = 0;
const check = (got: string, want: string, name: string) => {
  const ok = got === want;
  if (!ok) fails++;
  console.log(`  ${ok ? "ok  " : "FAIL"} ${name.padEnd(42)} ${ok ? "" : `\n       got  ${JSON.stringify(got)}\n       want ${JSON.stringify(want)}`}`);
};

console.log("\ncn() — the caller's class must win\n");

console.log("  spacing + layout");
check(cn("zen-p-5", "zen-p-8"), "zen-p-8", "padding");
check(cn("zen-px-4 zen-py-2", "zen-p-8"), "zen-p-8", "shorthand beats longhand");
check(cn("zen-gap-3", "zen-gap-8"), "zen-gap-8", "gap");
check(cn("zen-w-full", "zen-w-1/2"), "zen-w-1/2", "width");
check(cn("zen-text-sm", "zen-text-2xl"), "zen-text-2xl", "font size");

console.log("  zen-* theme keys");
check(cn("zen-bg-zen-primary", "zen-bg-zen-error"), "zen-bg-zen-error", "background colour");
check(cn("zen-text-zen-foreground", "zen-text-zen-muted-fg"), "zen-text-zen-muted-fg", "text colour");
check(cn("zen-border-zen-border", "zen-border-zen-primary"), "zen-border-zen-primary", "border colour");
check(cn("zen-shadow-zen-sm", "zen-shadow-zen-lg"), "zen-shadow-zen-lg", "shadow");
// The regression this file exists for:
check(cn("zen-rounded-zen-md", "zen-rounded-zen-full"), "zen-rounded-zen-full", "radius md -> full");
check(cn("zen-rounded-zen-full", "zen-rounded-zen-sm"), "zen-rounded-zen-sm", "radius full -> sm");
check(cn("zen-rounded-zen-md", "zen-rounded-none"), "zen-rounded-none", "radius zen key -> stock key");

/*
 * Shadows, same disease one step subtler. Named-against-named already worked,
 * which is why nobody looked: it is named-against-ARBITRARY that emitted both,
 * because `zen-sm` is not a value tailwind-merge knows, so it read
 * `shadow-zen-sm` as a shadow COLOUR and `shadow-[…]` as a shadow SIZE — two
 * groups that never conflict. The winner then fell to stylesheet order, where
 * Uno emits the named utility later, so a component's shadow silently beat the
 * caller's override. Found via Paper's `stack`.
 */
check(cn("zen-shadow-zen-sm", "zen-shadow-zen-lg"), "zen-shadow-zen-lg", "shadow sm -> lg");
check(
  cn("zen-shadow-zen-sm", "zen-shadow-[6px_6px_0_0_#ccc]"),
  "zen-shadow-[6px_6px_0_0_#ccc]",
  "shadow named -> arbitrary",
);
check(
  cn("zen-shadow-[6px_6px_0_0_#ccc]", "zen-shadow-zen-lg"),
  "zen-shadow-zen-lg",
  "shadow arbitrary -> named",
);
check(cn("zen-shadow-zen-md", "zen-shadow-none"), "zen-shadow-none", "shadow zen key -> stock key");
check(cn("zen-rounded-l-zen-md", "zen-rounded-l-zen-full"), "zen-rounded-l-zen-full", "radius, one side");

console.log("  the consumer's own classes");
check(cn("zen-p-5", "p-8"), "p-8", "unprefixed p-8 beats zen-p-5");
check(cn("zen-p-5", undefined), "zen-p-5", "no override -> default survives");
check(cn("zen-p-5", "sidebar"), "zen-p-5 sidebar", "a non-utility class passes through");

console.log("  unrelated utilities must NOT eat each other");
check(cn("zen-rounded-zen-md", "zen-p-8"), "zen-rounded-zen-md zen-p-8", "radius + padding coexist");
check(cn("zen-rounded-zen-md", "zen-rounded-l-zen-full"), "zen-rounded-zen-md zen-rounded-l-zen-full", "all-sides + one-side coexist");

console.log(fails ? `\n${fails} FAILED\n` : "\nall passed\n");
process.exit(fails ? 1 : 0);
