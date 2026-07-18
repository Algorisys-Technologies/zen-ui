import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

/**
 * EmptyState — surface shown when a list / table / dashboard has no
 * data yet. The first-run experience in any onboarding flow.
 *
 *   <EmptyState>
 *     <EmptyStateIcon><InboxIcon /></EmptyStateIcon>
 *     <EmptyStateTitle>No invoices yet</EmptyStateTitle>
 *     <EmptyStateDescription>
 *       Create your first invoice to track revenue.
 *     </EmptyStateDescription>
 *     <EmptyStateActions>
 *       <Button>Create invoice</Button>
 *       <Button variant="outline">Import from CSV</Button>
 *     </EmptyStateActions>
 *   </EmptyState>
 *
 * The default `size="md"` centers content with comfortable padding for
 * a card-sized container. Use `size="sm"` for inline empty states
 * (table body, dropdown menu) and `size="lg"` for full-page first-run
 * screens. `bordered` adds a dashed border + muted background to
 * communicate "drop something here" / "this is intentionally empty".
 */

const emptyStateVariants = cva(
  [
    "zen-flex zen-flex-col zen-items-center zen-justify-center zen-text-center",
    "zen-text-zen-foreground",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "zen-py-6 zen-px-3 zen-gap-1.5",
        md: "zen-py-10 zen-px-6 zen-gap-3",
        lg: "zen-py-16 zen-px-8 zen-gap-4",
      },
      bordered: {
        true: "zen-border-2 zen-border-dashed zen-border-zen-border zen-rounded-zen-md zen-bg-zen-muted/40",
        false: "",
      },
    },
    defaultVariants: {
      size: "md",
      bordered: false,
    },
  },
);

export interface EmptyStateProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof emptyStateVariants> {}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, size, bordered, ...props }, ref) => (
    <div
      ref={ref}
      role="status"
      className={cn(emptyStateVariants({ size, bordered }), className)}
      {...props}
    />
  ),
);
EmptyState.displayName = "EmptyState";

/**
 * Wraps the leading icon. Renders a muted circular tile around the
 * icon so an SVG passed as a child gets a consistent visual frame
 * without the caller needing to style the surface.
 */
export const EmptyStateIcon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    aria-hidden
    className={cn(
      "zen-inline-flex zen-items-center zen-justify-center",
      "zen-h-12 zen-w-12 zen-rounded-zen-full zen-bg-zen-muted zen-text-zen-muted-fg",
      "zen-mb-1",
      className,
    )}
    {...props}
  />
));
EmptyStateIcon.displayName = "EmptyStateIcon";

export const EmptyStateTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("zen-text-base zen-font-semibold zen-m-0", className)}
    {...props}
  />
));
EmptyStateTitle.displayName = "EmptyStateTitle";

export const EmptyStateDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "zen-text-sm zen-text-zen-muted-fg zen-max-w-[40ch] zen-m-0 zen-leading-relaxed",
      className,
    )}
    {...props}
  />
));
EmptyStateDescription.displayName = "EmptyStateDescription";

export const EmptyStateActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "zen-flex zen-flex-wrap zen-items-center zen-justify-center zen-gap-2 zen-mt-2",
      className,
    )}
    {...props}
  />
));
EmptyStateActions.displayName = "EmptyStateActions";

export { emptyStateVariants };
