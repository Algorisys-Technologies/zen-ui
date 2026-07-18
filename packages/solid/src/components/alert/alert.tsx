import { type JSX, splitProps, mergeProps } from "solid-js";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

/**
 * Alert — feedback / message banner. Compound API:
 *
 *   <Alert color="info" variant="soft">
 *     <AlertIcon><InfoIcon /></AlertIcon>
 *     <AlertContent>
 *       <AlertTitle>Heads up</AlertTitle>
 *       <AlertDescription>Your trial expires in 3 days.</AlertDescription>
 *     </AlertContent>
 *     <AlertActions>
 *       <button type="button">Action</button>
 *     </AlertActions>
 *     <AlertClose onClick={dismiss} />
 *   </Alert>
 *
 * Variants:
 *   color   — destructive | info | neutral | primary | success | warning
 *   variant — soft (default) | outline
 *
 * Role="alert" announces immediately to screen readers; pass
 * `role="status"` for less-urgent messages.
 */

const alertVariants = cva(
  "zen-relative zen-w-full zen-rounded-zen-md zen-p-3 zen-flex zen-items-start zen-gap-2",
  {
    variants: {
      color: {
        neutral: "",
        primary: "",
        info: "",
        success: "",
        warning: "",
        destructive: "",
      },
      variant: {
        soft: "",
        outline: "zen-bg-zen-background",
      },
    },
    compoundVariants: [
      { variant: "soft", color: "neutral", class: "zen-bg-zen-muted zen-text-zen-foreground zen-border zen-border-zen-border" },
      { variant: "soft", color: "primary", class: "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg zen-border zen-border-zen-primary-soft" },
      { variant: "soft", color: "info", class: "zen-bg-zen-info-soft zen-text-zen-info-soft-fg zen-border zen-border-zen-info-soft" },
      { variant: "soft", color: "success", class: "zen-bg-zen-success-soft zen-text-zen-success-soft-fg zen-border zen-border-zen-success-soft" },
      { variant: "soft", color: "warning", class: "zen-bg-zen-warning-soft zen-text-zen-warning-soft-fg zen-border zen-border-zen-warning-soft" },
      { variant: "soft", color: "destructive", class: "zen-bg-zen-error-soft zen-text-zen-error-soft-fg zen-border zen-border-zen-error-soft" },
      { variant: "outline", color: "neutral", class: "zen-border zen-border-zen-border zen-text-zen-foreground" },
      { variant: "outline", color: "primary", class: "zen-border zen-border-zen-primary zen-text-zen-foreground" },
      { variant: "outline", color: "info", class: "zen-border zen-border-zen-info zen-text-zen-foreground" },
      { variant: "outline", color: "success", class: "zen-border zen-border-zen-success zen-text-zen-foreground" },
      { variant: "outline", color: "warning", class: "zen-border zen-border-zen-warning zen-text-zen-foreground" },
      { variant: "outline", color: "destructive", class: "zen-border zen-border-zen-error zen-text-zen-foreground" },
    ],
    defaultVariants: {
      variant: "soft",
      color: "info",
    },
  },
);

export type AlertProps = VariantProps<typeof alertVariants> &
  Omit<JSX.HTMLAttributes<HTMLDivElement>, "color" | "class"> & {
    class?: string;
    children?: JSX.Element;
  };

export const Alert = (rawProps: AlertProps) => {
  const props = mergeProps({ role: "alert" as const }, rawProps);
  const [local, rest] = splitProps(props, ["class", "color", "variant", "children"]);
  return (
    <div
      class={cn(alertVariants({ color: local.color, variant: local.variant }), local.class)}
      {...rest}
    >
      {local.children}
    </div>
  );
};

type SectionProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class"> & {
  class?: string;
  children?: JSX.Element;
};
type ParagraphProps = Omit<JSX.HTMLAttributes<HTMLParagraphElement>, "class"> & {
  class?: string;
  children?: JSX.Element;
};
type SpanProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "class"> & {
  class?: string;
  children?: JSX.Element;
};

export const AlertIcon = (props: SpanProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <span
      aria-hidden="true"
      class={cn("zen-shrink-0 zen-inline-flex zen-items-center zen-justify-center zen-mt-0.5", local.class)}
      {...rest}
    >
      {local.children}
    </span>
  );
};

export const AlertContent = (props: SectionProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <div class={cn("zen-min-w-0 zen-flex-1 zen-flex zen-flex-col zen-gap-1", local.class)} {...rest}>
      {local.children}
    </div>
  );
};

export const AlertTitle = (props: ParagraphProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <p class={cn("zen-font-semibold zen-leading-tight zen-text-sm", local.class)} {...rest}>
      {local.children}
    </p>
  );
};

export const AlertDescription = (props: ParagraphProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <p class={cn("zen-text-sm zen-opacity-90 zen-leading-snug", local.class)} {...rest}>
      {local.children}
    </p>
  );
};

export const AlertActions = (props: SectionProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <div
      class={cn("zen-ml-auto zen-shrink-0 zen-flex zen-items-center zen-gap-4 zen-self-center", local.class)}
      {...rest}
    >
      {local.children}
    </div>
  );
};

export type AlertCloseProps = Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "class"> & {
  class?: string;
};

export const AlertClose = (props: AlertCloseProps) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <button
      type="button"
      aria-label="Dismiss"
      class={cn(
        "zen-shrink-0 zen-inline-flex zen-items-center zen-justify-center zen-h-6 zen-w-6 zen-rounded-zen-sm",
        "zen-bg-transparent zen-border-0 zen-cursor-pointer zen-text-current zen-opacity-70",
        "hover:zen-opacity-100 hover:zen-bg-current/10",
        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
        local.class,
      )}
      {...rest}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  );
};

export { alertVariants };
