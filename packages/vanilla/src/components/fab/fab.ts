import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";
import { Disposer, type ZenComponent } from "../../lib/component";
import { Button, type ButtonProps } from "../button/button";

const fabContainer = cva("zen-fixed zen-z-40", {
  variants: {
    position: {
      "bottom-right": "zen-bottom-6 zen-right-6", "bottom-left": "zen-bottom-6 zen-left-6",
      "top-right": "zen-top-6 zen-right-6", "top-left": "zen-top-6 zen-left-6",
    },
  },
  defaultVariants: { position: "bottom-right" },
});

export type FABProps = Omit<ButtonProps, "shape" | "size"> &
  VariantProps<typeof fabContainer> & { size?: "md" | "lg" | "xl" };

const SHAPE: Record<NonNullable<FABProps["size"]>, string> = {
  md: "zen-h-12 zen-w-12", lg: "zen-h-14 zen-w-14", xl: "zen-h-16 zen-w-16",
};

export function FAB(props: FABProps = {}): ZenComponent<FABProps> {
  let current = { ...props };
  const el = document.createElement("div");
  const disposer = new Disposer();
  const { position, size = "lg", class: className, color = "primary", ...buttonProps } = current;
  const btn = Button({
    ...(buttonProps as ButtonProps),
    color,
    shape: "circle",
    class: cn("zen-shadow-md hover:zen-shadow-lg", SHAPE[size], className),
  });
  el.className = cn(fabContainer({ position }));
  el.append(btn.el);
  disposer.add(() => btn.destroy());
  return {
    el,
    // The FAB's button is what a caller usually updates (loading, children).
    update(n) { current = { ...current, ...n }; const { position: _p, size: _s, class: _c, ...rest } = n; btn.update(rest as ButtonProps); },
    destroy() { disposer.dispose(); el.remove(); },
  };
}
