import { type JSX, splitProps } from "solid-js";
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
 *
 * Solid port of the React binding's Theme. `ref` needs no forwarding here —
 * Solid passes it straight through the props spread onto the root <div>.
 *
 * KNOWN LIMITATION — portalled content escapes the scope. Dialog, AlertDialog,
 * Popover, Sheet, Tooltip, DropdownMenu, Combobox, MultiCombobox and the pivot
 * filter menu render their content through a Kobalte Portal into <body>, which
 * is outside this element, so they fall back to the document theme. Scoping
 * their content is deliberately not part of this change; see the `<Theme>`
 * entry in todo.md.
 */

export type ThemeProps = {
  /** the theme to apply to this subtree */
  name: ThemeName;
  /**
   * Render as `display: contents` so the wrapper does not become a box in the
   * parent's layout — the children lay out as if it were not there. Off by
   * default because `display: contents` removes the element from the layout
   * tree, which drops any borders/background you might set on it.
   */
  transparent?: boolean;
  class?: string;
  style?: JSX.CSSProperties | string;
  children?: JSX.Element;
} & Omit<JSX.HTMLAttributes<HTMLDivElement>, "style" | "children">;

export const Theme = (props: ThemeProps) => {
  const [local, rest] = splitProps(props, ["name", "transparent", "class"]);

  // `name` is read inside the JSX rather than destructured so it stays tracked
  // — a caller may drive it from a signal to preview themes live.
  return (
    <div
      data-theme={local.name}
      class={cn(local.transparent && "zen-contents", local.class)}
      {...rest}
    />
  );
};
