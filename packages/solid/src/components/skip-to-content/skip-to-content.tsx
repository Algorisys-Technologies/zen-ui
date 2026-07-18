import { type JSX, splitProps } from "solid-js";
import { cn } from "../../lib/cn";

/**
 * SkipToContent — the keyboard bypass every app frame owes its users. Solid port
 * of the React binding; same API, same behaviour.
 *
 *   <SkipToContent href="#main" />
 *   …
 *   <main id="main" tabindex={-1}>…</main>
 *
 * It is the first focusable thing on the page and is visually hidden until it
 * takes focus, so the first Tab reveals "Skip to main content" and Enter jumps
 * past the header and nav to the content (WCAG 2.4.1, Bypass Blocks). The target
 * needs `tabindex={-1}` so following the link moves focus, not just the viewport.
 */

export type SkipToContentProps = JSX.AnchorHTMLAttributes<HTMLAnchorElement>;

export const SKIP_TO_CONTENT_CLASS = [
  "zen-sr-only focus:zen-not-sr-only",
  "focus:zen-fixed focus:zen-top-4 focus:zen-left-4 focus:zen-z-50",
  "focus:zen-inline-flex focus:zen-items-center focus:zen-rounded-zen-md",
  "focus:zen-bg-zen-primary focus:zen-px-4 focus:zen-py-2 focus:zen-text-sm focus:zen-font-medium focus:zen-text-zen-primary-fg",
  "focus:zen-shadow-zen-lg focus:zen-outline-none focus:zen-ring-2 focus:zen-ring-zen-ring focus:zen-ring-offset-2",
].join(" ");

export const SkipToContent = (props: SkipToContentProps) => {
  const [local, rest] = splitProps(props, ["class", "href", "children"]);
  return (
    <a href={local.href ?? "#main-content"} class={cn(SKIP_TO_CONTENT_CLASS, local.class)} {...rest}>
      {local.children ?? "Skip to main content"}
    </a>
  );
};
