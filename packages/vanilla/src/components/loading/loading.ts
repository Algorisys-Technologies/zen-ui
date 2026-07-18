import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";
import { Disposer, type ZenComponent } from "../../lib/component";

const spinnerVariants = cva("zen-animate-spin", {
  variants: {
    size: { sm: "zen-h-3 zen-w-3", md: "zen-h-4 zen-w-4", lg: "zen-h-6 zen-w-6", xl: "zen-h-10 zen-w-10" },
    color: {
      primary: "zen-text-zen-primary", neutral: "zen-text-zen-foreground", info: "zen-text-zen-info",
      success: "zen-text-zen-success", warning: "zen-text-zen-warning", error: "zen-text-zen-error", current: "zen-text-current",
    },
  },
  defaultVariants: { size: "md", color: "primary" },
});

export type LoadingProps = VariantProps<typeof spinnerVariants> & {
  /** Accessible label (visually hidden). Default "Loading". Pass "" to mark decorative. */
  label?: string;
  class?: string;
};

const SVG_NS = "http://www.w3.org/2000/svg";

export function Loading(props: LoadingProps = {}): ZenComponent<LoadingProps> {
  let current = { ...props };
  const el = document.createElementNS(SVG_NS, "svg") as SVGSVGElement;
  const disposer = new Disposer();
  const render = () => {
    const { size, color, label = "Loading", class: className } = current;
    el.setAttribute("viewBox", "0 0 24 24");
    el.setAttribute("fill", "none");
    el.setAttribute("class", cn(spinnerVariants({ size, color }), className));
    if (label) { el.setAttribute("role", "status"); el.setAttribute("aria-label", label); el.removeAttribute("aria-hidden"); }
    else { el.setAttribute("role", "presentation"); el.setAttribute("aria-hidden", "true"); el.removeAttribute("aria-label"); }
    el.innerHTML =
      '<circle class="zen-opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>' +
      '<path class="zen-opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>';
  };
  render();
  return {
    el: el as unknown as HTMLElement,
    update(n) { current = { ...current, ...n }; render(); },
    destroy() { disposer.dispose(); el.remove(); },
  } as ZenComponent<LoadingProps>;
}
export { spinnerVariants };
