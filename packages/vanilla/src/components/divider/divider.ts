import { cn } from "../../lib/cn";
import { applyProps, Disposer, type BaseProps, type ZenComponent } from "../../lib/component";

/**
 * Separator — a thin rule. Radix's Separator.Root, written out: a decorative
 * separator is aria-hidden; a semantic one gets role="separator" and, when
 * vertical, aria-orientation.
 */
export interface SeparatorProps extends BaseProps {
  orientation?: "horizontal" | "vertical";
  /** Purely visual (default). false = a real semantic boundary for a screen reader. */
  decorative?: boolean;
}

export function Separator(props: SeparatorProps = {}): ZenComponent<SeparatorProps> {
  let current = { ...props };
  const el = document.createElement("div");
  const disposer = new Disposer();
  let remove: (() => void) | undefined;
  const render = () => {
    const { class: className, orientation = "horizontal", decorative = true, ...rest } = current;
    el.className = cn(
      "zen-shrink-0 zen-bg-zen-border",
      orientation === "horizontal" ? "zen-h-px zen-w-full" : "zen-h-full zen-w-px",
      className,
    );
    if (decorative) {
      el.setAttribute("role", "none");
      el.removeAttribute("aria-orientation");
    } else {
      el.setAttribute("role", "separator");
      if (orientation === "vertical") el.setAttribute("aria-orientation", "vertical");
      else el.removeAttribute("aria-orientation");
    }
    remove?.();
    remove = applyProps(el, rest as Record<string, unknown>);
  };
  render();
  disposer.add(() => remove?.());
  return { el, update(n) { current = { ...current, ...n }; render(); }, destroy() { disposer.dispose(); el.remove(); } };
}
