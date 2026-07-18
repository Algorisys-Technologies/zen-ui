import { cva, type VariantProps } from "class-variance-authority";
import { styled } from "../../lib/styled";
import type { BaseProps, ZenComponent } from "../../lib/component";

/**
 * Alert — feedback / message banner. Compound API.
 *
 *   Alert({ color: "info", variant: "soft", children: [
 *     AlertIcon({ children: Icon({ name: "info" }) }),
 *     AlertContent({ children: [AlertTitle({ children: "Heads up" }), AlertDescription({ children: "…" })] }),
 *   ]})
 *
 * role="alert" announces immediately; pass role="status" for less-urgent messages.
 */
const alertVariants = cva(
  "zen-relative zen-w-full zen-rounded-zen-md zen-p-3 zen-flex zen-items-start zen-gap-2",
  {
    variants: {
      color: { neutral: "", primary: "", info: "", success: "", warning: "", destructive: "" },
      variant: { soft: "", outline: "zen-bg-zen-background" },
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
    defaultVariants: { variant: "soft", color: "info" },
  },
);

export type AlertProps = BaseProps & VariantProps<typeof alertVariants>;

export const Alert = styled<AlertProps>({
  tag: "div",
  role: "alert",
  own: ["color", "variant"],
  className: (p) => alertVariants({ color: p.color, variant: p.variant }),
}) as (props?: AlertProps) => ZenComponent<AlertProps>;

export const AlertIcon = styled({
  tag: "span",
  className: "zen-shrink-0 zen-inline-flex zen-items-center zen-justify-center zen-mt-0.5",
  attrs: () => ({ "aria-hidden": "true" }),
});

export const AlertContent = styled({
  tag: "div",
  className: "zen-min-w-0 zen-flex-1 zen-flex zen-flex-col zen-gap-1",
});

export const AlertTitle = styled({ tag: "p", className: "zen-font-semibold zen-leading-tight zen-text-sm" });

export const AlertDescription = styled({ tag: "p", className: "zen-text-sm zen-opacity-90 zen-leading-snug" });

export const AlertActions = styled({
  tag: "div",
  className: "zen-flex zen-items-center zen-gap-2 zen-mt-2",
});

export { alertVariants };
