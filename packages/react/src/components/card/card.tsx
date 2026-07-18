import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

/**
 * Card — generic surface primitive. Compound API for the common
 * Header / Content / Footer layout, but every part is opt-in so you
 * can compose freely.
 *
 *   <Card>
 *     <CardHeader>
 *       <CardTitle>Account</CardTitle>
 *       <CardDescription>Your billing + contact info.</CardDescription>
 *     </CardHeader>
 *     <CardContent>…</CardContent>
 *     <CardFooter>
 *       <Button>Save</Button>
 *     </CardFooter>
 *   </Card>
 *
 * For "pick one of these options" / plan picker / goal picker patterns,
 * use the SelectableCard / SelectableCardGroup variant in
 * card.selectable.tsx — those add radio-group semantics + selected
 * styling on top of the base Card surface.
 */

const cardVariants = cva(
  "zen-rounded-zen-md zen-border zen-bg-zen-background zen-text-zen-foreground",
  {
    variants: {
      variant: {
        elevated: "zen-border-zen-border zen-shadow-zen-sm",
        outlined: "zen-border-zen-border",
        ghost: "zen-border-transparent",
      },
      padding: {
        none: "",
        sm: "zen-p-3",
        md: "zen-p-5",
        lg: "zen-p-6",
      },
    },
    defaultVariants: {
      variant: "outlined",
      padding: "none",
    },
  },
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding }), className)}
      {...props}
    />
  ),
);
Card.displayName = "Card";

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("zen-flex zen-flex-col zen-gap-1 zen-p-5 zen-pb-3", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "zen-text-base zen-font-semibold zen-leading-tight zen-m-0 zen-text-zen-foreground",
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("zen-text-sm zen-text-zen-muted-fg zen-m-0", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("zen-p-5 zen-pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "zen-flex zen-items-center zen-gap-2 zen-p-5 zen-pt-3 zen-border-t zen-border-zen-border",
      className,
    )}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { cardVariants };
