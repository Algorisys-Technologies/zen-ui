import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";
import { applyProps, Disposer, setChildren, type BaseProps, type ZenComponent } from "../../lib/component";
import { styled } from "../../lib/styled";

const bannerVariants = cva("zen-w-full zen-flex zen-items-center zen-gap-3 zen-px-4 zen-py-3 zen-text-sm zen-border-y", {
  variants: {
    color: {
      neutral: "zen-bg-zen-muted zen-text-zen-foreground zen-border-zen-border",
      primary: "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg zen-border-zen-primary-soft",
      info: "zen-bg-zen-info-soft zen-text-zen-info-soft-fg zen-border-zen-info-soft",
      success: "zen-bg-zen-success-soft zen-text-zen-success-soft-fg zen-border-zen-success-soft",
      warning: "zen-bg-zen-warning-soft zen-text-zen-warning-soft-fg zen-border-zen-warning-soft",
      destructive: "zen-bg-zen-error-soft zen-text-zen-error-soft-fg zen-border-zen-error-soft",
    },
    sticky: { true: "zen-sticky zen-top-0 zen-z-30", false: "" },
  },
  defaultVariants: { color: "info", sticky: false },
});

export type BannerProps = BaseProps & VariantProps<typeof bannerVariants>;

/** The outer element wraps an inner max-width row, so this is written out. */
export function Banner(props: BannerProps = {}): ZenComponent<BannerProps> {
  let current = { ...props };
  const el = document.createElement("div");
  const inner = document.createElement("div");
  inner.className = "zen-flex zen-items-center zen-gap-3 zen-w-full zen-max-w-[100rem] zen-mx-auto";
  el.append(inner);
  const disposer = new Disposer();
  let remove: (() => void) | undefined;
  const render = () => {
    const { class: className, color, sticky, children, ...rest } = current;
    el.className = cn(bannerVariants({ color, sticky }), className);
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    setChildren(inner, children);
    remove?.();
    remove = applyProps(el, rest as Record<string, unknown>);
  };
  render();
  disposer.add(() => remove?.());
  return { el, update(n) { current = { ...current, ...n }; render(); }, destroy() { disposer.dispose(); el.remove(); } };
}

export const BannerIcon = styled({
  tag: "span", className: "zen-flex-shrink-0 zen-inline-flex zen-items-center",
  attrs: () => ({ "aria-hidden": "true" }),
});
export const BannerContent = styled({
  tag: "div", className: "zen-flex-1 zen-min-w-0 zen-inline-flex zen-flex-wrap zen-items-baseline zen-gap-x-2",
});
export const BannerActions = styled({ tag: "div", className: "zen-flex-shrink-0 zen-inline-flex zen-items-center zen-gap-2" });
export { bannerVariants };
