import { type JSX, splitProps } from "solid-js";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

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

const emptyStateVariants = cva(
  "zen-flex zen-flex-col zen-items-center zen-justify-center zen-text-center zen-text-zen-foreground",
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

export type EmptyStateProps = VariantProps<typeof emptyStateVariants> &
  Omit<JSX.HTMLAttributes<HTMLDivElement>, "class"> & {
    class?: string;
    children?: JSX.Element;
  };

export const EmptyState = (props: EmptyStateProps) => {
  const [local, rest] = splitProps(props, ["class", "size", "bordered", "children"]);
  return (
    <div
      role="status"
      class={cn(
        emptyStateVariants({ size: local.size, bordered: local.bordered }),
        local.class,
      )}
      {...rest}
    >
      {local.children}
    </div>
  );
};

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

export const EmptyStateIcon = (props: DivProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <div
      aria-hidden="true"
      class={cn(
        "zen-inline-flex zen-items-center zen-justify-center",
        "zen-h-12 zen-w-12 zen-rounded-zen-full zen-bg-zen-muted zen-text-zen-muted-fg",
        "zen-mb-1",
        local.class,
      )}
      {...rest}
    >
      {local.children}
    </div>
  );
};

export const EmptyStateTitle = (props: HeadingProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <h3 class={cn("zen-text-base zen-font-semibold zen-m-0", local.class)} {...rest}>
      {local.children}
    </h3>
  );
};

export const EmptyStateDescription = (props: ParagraphProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <p
      class={cn(
        "zen-text-sm zen-text-zen-muted-fg zen-max-w-[40ch] zen-m-0 zen-leading-relaxed",
        local.class,
      )}
      {...rest}
    >
      {local.children}
    </p>
  );
};

export const EmptyStateActions = (props: DivProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <div
      class={cn(
        "zen-flex zen-flex-wrap zen-items-center zen-justify-center zen-gap-2 zen-mt-2",
        local.class,
      )}
      {...rest}
    >
      {local.children}
    </div>
  );
};

export { emptyStateVariants };
