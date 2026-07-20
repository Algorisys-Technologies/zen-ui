import * as React from "react";
import type { ThemeName } from "@algorisys/zen-ui-core";
import { cn } from "../../lib/cn";

/**
 * Theme — scopes a zen-ui theme to a subtree.
 *
 * `applyTheme()` sets `data-theme` on <html> and themes the whole document.
 * This themes one branch of it, so a dark panel can sit inside a light page:
 *
 *   <Theme name="dark">
 *     <Card>…</Card>
 *   </Theme>
 *
 * The mechanism is entirely CSS. tokens.css declares each theme as an
 * unanchored `[data-theme="…"]` block, custom properties inherit, and the
 * nearest themed ancestor wins — so nesting works and needs no bookkeeping.
 * Nothing here re-renders on a document theme change, because nothing has to.
 *
 * KNOWN LIMITATION — portalled content escapes the scope. Dialog, AlertDialog,
 * Popover, Sheet, Tooltip and DropdownMenu render their content through a Radix
 * Portal into <body>, which is outside this element, so they fall back to the
 * document theme. Scoping their content is deliberately not part of this
 * change; see the `<Theme>` entry in todo.md.
 */

export interface ThemeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** the theme to apply to this subtree */
  name: ThemeName;
  /**
   * Render as `display: contents` so the wrapper does not become a box in the
   * parent's layout — the children lay out as if it were not there. Off by
   * default because `display: contents` removes the element from the layout
   * tree, which drops any borders/background you might set on it.
   */
  transparent?: boolean;
}

const Theme = React.forwardRef<HTMLDivElement, ThemeProps>(
  ({ name, transparent = false, className, ...props }, ref) => (
    <div
      ref={ref}
      data-theme={name}
      className={cn(transparent && "zen-contents", className)}
      {...props}
    />
  ),
);
Theme.displayName = "Theme";

export { Theme };
