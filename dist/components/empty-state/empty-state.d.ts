import * as React from "react";
import { type VariantProps } from "class-variance-authority";
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
declare const emptyStateVariants: (props?: ({
    size?: "sm" | "md" | "lg" | null | undefined;
    bordered?: boolean | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof emptyStateVariants> {
}
export declare const EmptyState: React.ForwardRefExoticComponent<EmptyStateProps & React.RefAttributes<HTMLDivElement>>;
/**
 * Wraps the leading icon. Renders a muted circular tile around the
 * icon so an SVG passed as a child gets a consistent visual frame
 * without the caller needing to style the surface.
 */
export declare const EmptyStateIcon: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const EmptyStateTitle: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLHeadingElement> & React.RefAttributes<HTMLHeadingElement>>;
export declare const EmptyStateDescription: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLParagraphElement> & React.RefAttributes<HTMLParagraphElement>>;
export declare const EmptyStateActions: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export { emptyStateVariants };
//# sourceMappingURL=empty-state.d.ts.map