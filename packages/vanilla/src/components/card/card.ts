import { cva, type VariantProps } from "class-variance-authority";
import { styled } from "../../lib/styled";
import type { BaseProps, ZenComponent } from "../../lib/component";

/**
 * Card — generic surface primitive. Compound API for the common Header / Content /
 * Footer layout, but every part is opt-in so you can compose freely.
 *
 *   Card({ children: [
 *     CardHeader({ children: [CardTitle({ children: "Account" }), CardDescription({ children: "…" })] }),
 *     CardContent({ children: "…" }),
 *     CardFooter({ children: Button({ children: "Save" }) }),
 *   ]})
 */
const cardVariants = cva("zen-rounded-zen-md zen-border zen-bg-zen-background zen-text-zen-foreground", {
  variants: {
    variant: {
      elevated: "zen-border-zen-border zen-shadow-zen-sm",
      outlined: "zen-border-zen-border",
      ghost: "zen-border-transparent",
    },
    padding: { none: "", sm: "zen-p-3", md: "zen-p-5", lg: "zen-p-6" },
  },
  defaultVariants: { variant: "outlined", padding: "none" },
});

export type CardProps = BaseProps & VariantProps<typeof cardVariants>;

export const Card = styled<CardProps>({
  tag: "div",
  own: ["variant", "padding"],
  className: (p) => cardVariants({ variant: p.variant, padding: p.padding }),
}) as (props?: CardProps) => ZenComponent<CardProps>;

export const CardHeader = styled({
  tag: "div",
  className: "zen-flex zen-flex-col zen-gap-1 zen-p-5 zen-pb-3",
});

export const CardTitle = styled({
  tag: "h3",
  className: "zen-text-base zen-font-semibold zen-leading-tight zen-m-0 zen-text-zen-foreground",
});

export const CardDescription = styled({
  tag: "p",
  className: "zen-text-sm zen-text-zen-muted-fg zen-m-0",
});

export const CardContent = styled({ tag: "div", className: "zen-p-5 zen-pt-0" });

export const CardFooter = styled({
  tag: "div",
  className: "zen-flex zen-items-center zen-gap-2 zen-p-5 zen-pt-3 zen-border-t zen-border-zen-border",
});

export { cardVariants };
