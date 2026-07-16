import { badgeVariants, type BadgeVariantProps } from "@algorisys/zen-ui-core/variants";
import { cn } from "../../lib/cn";
import { applyProps, Disposer, setChildren, type BaseProps, type ZenComponent } from "../../lib/component";

/**
 * Badge — a styled span. Neither Radix nor Kobalte has a Badge primitive, so this
 * is the one component in the slice with no behaviour to port: only variants, `cn`
 * and the prefix. That is exactly why it is here — it is the cheapest possible
 * proof that the styling layer reaches a third binding unchanged.
 */
export interface BadgeProps extends BaseProps, BadgeVariantProps {
  /** Element to render. Defaults to "span". Use "a" for a clickable status pill. */
  as?: keyof HTMLElementTagNameMap;
}

export function Badge(props: BadgeProps): ZenComponent<BadgeProps> {
  let current: BadgeProps = { ...props };
  const el = document.createElement(current.as ?? "span");
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  const render = () => {
    const { as: _as, class: className, variant, color, children, ...rest } = current;
    el.className = cn(badgeVariants({ variant, color }), className);
    setChildren(el, children);
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

export { badgeVariants };
