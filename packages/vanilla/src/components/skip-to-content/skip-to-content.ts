import { cn } from "../../lib/cn";
import { applyProps, Disposer, type ZenComponent } from "../../lib/component";

/**
 * SkipToContent — the keyboard bypass every app frame owes its users. Vanilla
 * port of the React/Solid binding; same props, same behaviour.
 *
 *   const skip = SkipToContent({ href: "#main" });
 *   document.body.prepend(skip.el);   // must be the first focusable element
 *
 * It is visually hidden until it takes focus, so the first Tab reveals "Skip to
 * main content" and Enter jumps past the header and nav to the content (WCAG
 * 2.4.1). The target needs `tabindex="-1"` so following the link moves focus.
 */

export interface SkipToContentProps {
  href?: string;
  children?: string;
  class?: string;
  id?: string;
  [key: `data-${string}`]: unknown;
  [key: `aria-${string}`]: unknown;
}

export const SKIP_TO_CONTENT_CLASS = [
  "zen-sr-only focus:zen-not-sr-only",
  "focus:zen-fixed focus:zen-top-4 focus:zen-left-4 focus:zen-z-50",
  "focus:zen-inline-flex focus:zen-items-center focus:zen-rounded-zen-md",
  "focus:zen-bg-zen-primary focus:zen-px-4 focus:zen-py-2 focus:zen-text-sm focus:zen-font-medium focus:zen-text-zen-primary-fg",
  "focus:zen-shadow-zen-lg focus:zen-outline-none focus:zen-ring-2 focus:zen-ring-zen-ring focus:zen-ring-offset-2",
].join(" ");

export type SkipToContentHandle = ZenComponent<SkipToContentProps, HTMLAnchorElement>;

export function SkipToContent(props: SkipToContentProps): SkipToContentHandle {
  let current: SkipToContentProps = { ...props };
  const el = document.createElement("a");
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  const render = () => {
    const { href, children, class: className, ...rest } = current;
    el.href = href ?? "#main-content";
    el.className = cn(SKIP_TO_CONTENT_CLASS, className);
    el.textContent = children ?? "Skip to main content";
    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  };

  render();
  disposer.add(() => removeProps?.());

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      render();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}
