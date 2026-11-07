import * as React from "react";
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
export declare const SKIP_TO_CONTENT_CLASS: string;
declare const SkipToContent: React.ForwardRefExoticComponent<SkipToContentProps & React.RefAttributes<HTMLAnchorElement>>;
export { SkipToContent };
//# sourceMappingURL=skip-to-content.d.ts.map