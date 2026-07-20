import type { ThemeName } from "@algorisys/zen-ui-core";
import { cn } from "../../lib/cn";
import { applyProps, Disposer, setChildren, type BaseProps, type ZenComponent } from "../../lib/component";

/**
 * Theme — scopes a zen-ui theme to a subtree.
 *
 * `applyTheme()` sets `data-theme` on <html> and themes the whole document;
 * this themes one branch of it, so a dark panel can sit inside a light page.
 * The mechanism is entirely CSS: tokens.css declares each theme as an
 * unanchored `[data-theme="…"]` block, custom properties inherit, and the
 * nearest themed ancestor wins.
 *
 * KNOWN LIMITATION — content this library appends to <body> (dialogs, popovers,
 * tooltips, sheets) renders outside this element and falls back to the document
 * theme. See the `<Theme>` entry in todo.md.
 */

export interface ThemeProps extends BaseProps {
  /** the theme to apply to this subtree */
  name: ThemeName;
  /**
   * Render as `display: contents` so the wrapper does not become a box in the
   * parent's layout. Off by default because `display: contents` removes the
   * element from the layout tree, dropping any border/background set on it.
   */
  transparent?: boolean;
}

export function Theme(props: ThemeProps): ZenComponent<ThemeProps> {
  let current = { ...props };
  const el = document.createElement("div");
  const disposer = new Disposer();
  let remove: (() => void) | undefined;
  const render = () => {
    const { class: className, name, transparent, children, ...rest } = current;
    el.setAttribute("data-theme", name);
    el.className = cn(transparent && "zen-contents", className);
    setChildren(el, children);
    remove?.();
    remove = applyProps(el, rest as Record<string, unknown>);
  };
  render();
  disposer.add(() => remove?.());
  return { el, update(n) { current = { ...current, ...n }; render(); }, destroy() { disposer.dispose(); el.remove(); } };
}
