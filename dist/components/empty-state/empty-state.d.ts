import { type JSX } from "solid-js";
import { type VariantProps } from "class-variance-authority";
/**
 * EmptyState — surface shown when a list / table / dashboard has no
 * data yet. Compound: Icon / Title / Description / Actions.
 *
 *   <EmptyState>
 *     <EmptyStateIcon><InboxIcon /></EmptyStateIcon>
 *     <EmptyStateTitle>No invoices yet</EmptyStateTitle>
 *     <EmptyStateDescription>
 *       Create your first invoice to track revenue.
 *     </EmptyStateDescription>
 *     <EmptyStateActions>
 *       <Button>Create invoice</Button>
 *     </EmptyStateActions>
 *   </EmptyState>
 */
declare const emptyStateVariants: (props?: ({
    size?: "sm" | "md" | "lg" | null | undefined;
    bordered?: boolean | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export type EmptyStateProps = VariantProps<typeof emptyStateVariants> & Omit<JSX.HTMLAttributes<HTMLDivElement>, "class"> & {
    class?: string;
    children?: JSX.Element;
};
export declare const EmptyState: (props: EmptyStateProps) => JSX.Element;
type DivProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class"> & {
    class?: string;
    children?: JSX.Element;
};
type ParagraphProps = Omit<JSX.HTMLAttributes<HTMLParagraphElement>, "class"> & {
    class?: string;
    children?: JSX.Element;
};
type HeadingProps = Omit<JSX.HTMLAttributes<HTMLHeadingElement>, "class"> & {
    class?: string;
    children?: JSX.Element;
};
export declare const EmptyStateIcon: (props: DivProps) => JSX.Element;
export declare const EmptyStateTitle: (props: HeadingProps) => JSX.Element;
export declare const EmptyStateDescription: (props: ParagraphProps) => JSX.Element;
export declare const EmptyStateActions: (props: DivProps) => JSX.Element;
export { emptyStateVariants };
//# sourceMappingURL=empty-state.d.ts.map