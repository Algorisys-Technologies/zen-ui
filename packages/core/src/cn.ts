import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";
import { ZEN_PREFIX, zenUnoTheme } from "./uno-preset";

/**
 * tailwind-merge has to understand the `zen-` utility prefix, or it stops
 * recognising our classes as conflicting groups: `cn("zen-p-4", "zen-p-8")`
 * would emit BOTH and the winner would fall to stylesheet order instead of the
 * caller's override — silently breaking the `className` prop on every component.
 *
 * Note we do NOT use `extendTailwindMerge({ prefix })`. That option follows
 * Tailwind v4 prefix semantics, where a prefix is a leading variant (`zen:p-4`).
 * UnoCSS emits the v3 form (`zen-p-4`), so the built-in option silently fails to
 * match and every override breaks. Instead we strip the prefix off the parsed
 * base class: tailwind-merge groups on `p-4` while still returning the original
 * `zen-p-4` string. Classes that are not ours (a consumer's own `p-4`, or demo
 * classes like `sidebar`) fall through the regex untouched.
 *
 * ZEN_PREFIX is shared with uno.config.ts so the generator and the merger cannot
 * drift apart.
 */
const basePattern = new RegExp(`^(-?)${ZEN_PREFIX}(.*)$`);

/**
 * Stripping the prefix is only half the job. tailwind-merge groups colour
 * utilities by "bg-<anything>", so `zen-bg-zen-error` overrides
 * `zen-bg-zen-primary` for free — but its RADIUS group matches a fixed list of
 * values (none / sm / md / full / …), and `zen-md` is not on it. So
 * `cn("zen-rounded-zen-md", "zen-rounded-zen-full")` emitted BOTH, and the
 * winner fell to stylesheet order: Uno happens to emit `full` before `md`, so
 * with equal specificity the component's `md` beat the caller's `full` and the
 * override was silently ignored — while `zen-rounded-zen-sm`, emitted later,
 * happened to work. Value-dependent and invisible, which is the worst kind.
 *
 * Teaching tailwind-merge our radius scale fixes it. The keys come from
 * `zenUnoTheme`, the same object the generator themes from, so a radius added
 * there cannot go missing here.
 *
 * NOTE the theme key is `radius`. This is tailwind-merge v3; v2 called it
 * `borderRadius`, and an unknown key is silently ignored rather than rejected,
 * so a wrong one "fixes" nothing and says nothing.
 */
const zenRadii = Object.keys(zenUnoTheme.borderRadius);

const twMerge = extendTailwindMerge({
  extend: { theme: { radius: zenRadii } },
  experimentalParseClassName({ className, parseClassName }) {
    const parsed = parseClassName(className);
    const m = basePattern.exec(parsed.baseClassName);
    return m ? { ...parsed, baseClassName: `${m[1]}${m[2]}` } : parsed;
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
