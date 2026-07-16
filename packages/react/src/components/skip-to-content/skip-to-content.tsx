import * as React from "react";
import { cn } from "../../lib/cn";

/**
 * SkipToContent — the keyboard bypass every app frame owes its users.
 *
 *   <SkipToContent href="#main" />
 *   …
 *   <main id="main" tabIndex={-1}>…</main>
 *
 * It is the first focusable thing on the page and is visually hidden until it
 * takes focus, so the first Tab reveals "Skip to main content" and Enter jumps
 * past the header and nav straight to the content. WCAG 2.4.1 (Bypass Blocks)
 * asks for exactly this, and a full app frame — ShellBar + Sidebar + Page — is
 * precisely the case it exists for: a keyboard user should not tab through the
 * whole chrome on every route.
 *
 * The target needs `tabIndex={-1}` so it can receive programmatic focus when the
 * link is followed; without it the jump moves the viewport but not the focus.
 */

export type SkipToContentProps = React.AnchorHTMLAttributes<HTMLAnchorElement>;

export const SKIP_TO_CONTENT_CLASS = [
  "zen-sr-only focus:zen-not-sr-only",
  "focus:zen-fixed focus:zen-top-4 focus:zen-left-4 focus:zen-z-50",
  "focus:zen-inline-flex focus:zen-items-center focus:zen-rounded-zen-md",
  "focus:zen-bg-zen-primary focus:zen-px-4 focus:zen-py-2 focus:zen-text-sm focus:zen-font-medium focus:zen-text-zen-primary-fg",
  "focus:zen-shadow-zen-lg focus:zen-outline-none focus:zen-ring-2 focus:zen-ring-zen-ring focus:zen-ring-offset-2",
].join(" ");

const SkipToContent = React.forwardRef<HTMLAnchorElement, SkipToContentProps>(
  ({ className, href = "#main-content", children = "Skip to main content", ...props }, ref) => (
    <a ref={ref} href={href} className={cn(SKIP_TO_CONTENT_CLASS, className)} {...props}>
      {children}
    </a>
  ),
);
SkipToContent.displayName = "SkipToContent";

export { SkipToContent };
