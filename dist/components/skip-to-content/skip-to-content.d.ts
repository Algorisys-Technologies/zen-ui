import { type JSX } from "solid-js";
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
export declare const SKIP_TO_CONTENT_CLASS: string;
export declare const SkipToContent: (props: SkipToContentProps) => JSX.Element;
//# sourceMappingURL=skip-to-content.d.ts.map