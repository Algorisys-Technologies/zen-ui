import { cva, type VariantProps } from "class-variance-authority";
import { styled } from "../../lib/styled";
import type { BaseProps, ZenComponent } from "../../lib/component";

const emptyStateVariants = cva(
  "zen-flex zen-flex-col zen-items-center zen-justify-center zen-text-center zen-text-zen-foreground",
  {
    variants: {
      size: { sm: "zen-py-6 zen-px-3 zen-gap-1.5", md: "zen-py-10 zen-px-6 zen-gap-3", lg: "zen-py-16 zen-px-8 zen-gap-4" },
      bordered: { true: "zen-border-2 zen-border-dashed zen-border-zen-border zen-rounded-zen-md zen-bg-zen-muted/40", false: "" },
    },
    defaultVariants: { size: "md", bordered: false },
  },
);

export type EmptyStateProps = BaseProps & VariantProps<typeof emptyStateVariants>;

export const EmptyState = styled<EmptyStateProps>({
  tag: "div", role: "status", own: ["size", "bordered"],
  className: (p) => emptyStateVariants({ size: p.size, bordered: p.bordered }),
}) as (props?: EmptyStateProps) => ZenComponent<EmptyStateProps>;

export const EmptyStateIcon = styled({
  tag: "div",
  className: "zen-inline-flex zen-items-center zen-justify-center zen-h-12 zen-w-12 zen-rounded-zen-full zen-bg-zen-muted zen-text-zen-muted-fg zen-mb-1",
  attrs: () => ({ "aria-hidden": "true" }),
});
export const EmptyStateTitle = styled({ tag: "h3", className: "zen-text-base zen-font-semibold zen-m-0" });
export const EmptyStateDescription = styled({ tag: "p", className: "zen-text-sm zen-text-zen-muted-fg zen-max-w-[40ch] zen-m-0 zen-leading-relaxed" });
export const EmptyStateActions = styled({ tag: "div", className: "zen-flex zen-flex-wrap zen-items-center zen-justify-center zen-gap-2 zen-mt-2" });
export { emptyStateVariants };
