import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

/**
 * Alert — feedback / message banner. Compound API.
 *
 *   <Alert color="info" variant="soft">
 *     <AlertIcon><InfoIcon /></AlertIcon>
 *     <AlertContent>
 *       <AlertTitle>Heads up</AlertTitle>
 *       <AlertDescription>
 *         Your trial expires in 3 days.
 *       </AlertDescription>
 *     </AlertContent>
 *     <AlertActions>
 *       <button type="button">Action 1</button>
 *       <button type="button">Action 2</button>
 *     </AlertActions>
 *     <AlertClose onClick={dismiss} />
 *   </Alert>
 *
 * Zen theme parts (all opt-in via composition):
 *   icon  ·  title  ·  description (body)  ·  actions  ·  close button
 *
 * Variants per the Zen theme artifact:
 *   color   — destructive | info | neutral | primary | success | warning
 *   variant — soft (default, light tinted bg) | outline (white bg + colored border)
 *
 * Role="alert" announces immediately to screen readers; pass
 * `role="status"` for less-urgent messages.
 */

const alertVariants = cva(
  [
    "zen-relative zen-w-full zen-rounded-zen-md zen-p-3",
    "zen-flex zen-items-start zen-gap-2",
  ].join(" "),
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
      // soft (Zen theme "Sky Bg" / tinted background)
      { variant: "soft", color: "neutral", class: "zen-bg-zen-muted zen-text-zen-foreground zen-border zen-border-zen-border" },
      { variant: "soft", color: "primary", class: "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg zen-border zen-border-zen-primary-soft" },
      { variant: "soft", color: "info", class: "zen-bg-zen-info-soft zen-text-zen-info-soft-fg zen-border zen-border-zen-info-soft" },
      { variant: "soft", color: "success", class: "zen-bg-zen-success-soft zen-text-zen-success-soft-fg zen-border zen-border-zen-success-soft" },
      { variant: "soft", color: "warning", class: "zen-bg-zen-warning-soft zen-text-zen-warning-soft-fg zen-border zen-border-zen-warning-soft" },
      { variant: "soft", color: "destructive", class: "zen-bg-zen-error-soft zen-text-zen-error-soft-fg zen-border zen-border-zen-error-soft" },
      // outline (Zen theme "Opaque Bg" / white surface with colored border)
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

export interface AlertProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color">,
    VariantProps<typeof alertVariants> {}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, color, variant, role = "alert", ...props }, ref) => (
    <div
      ref={ref}
      role={role}
      className={cn(alertVariants({ color, variant, className }))}
      {...props}
    />
  ),
);
Alert.displayName = "Alert";

/* ----------------------------- Icon slot ------------------------------ */
const AlertIcon = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    aria-hidden
    className={cn("zen-shrink-0 zen-inline-flex zen-items-center zen-justify-center zen-mt-0.5", className)}
    {...props}
  />
));
AlertIcon.displayName = "AlertIcon";

/* ----------------------------- Content stack -------------------------- */
const AlertContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("zen-min-w-0 zen-flex-1 zen-flex zen-flex-col zen-gap-1", className)}
    {...props}
  />
));
AlertContent.displayName = "AlertContent";

/* ----------------------------- Title --------------------------------- */
const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("zen-font-semibold zen-leading-tight zen-text-sm", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

/* ----------------------------- Description --------------------------- */
const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("zen-text-sm zen-opacity-90 zen-leading-snug", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

/* ----------------------------- Actions row --------------------------- */
const AlertActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("zen-ml-auto zen-shrink-0 zen-flex zen-items-center zen-gap-4 zen-self-center", className)}
    {...props}
  />
));
AlertActions.displayName = "AlertActions";

/* ----------------------------- Close button -------------------------- */
export type AlertCloseProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

const AlertClose = React.forwardRef<HTMLButtonElement, AlertCloseProps>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-label="Dismiss"
      className={cn(
        "zen-shrink-0 zen-inline-flex zen-items-center zen-justify-center zen-h-6 zen-w-6 zen-rounded-zen-sm",
        "zen-bg-transparent zen-border-0 zen-cursor-pointer zen-text-current zen-opacity-70",
        "hover:zen-opacity-100 hover:zen-bg-current/10",
        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
        className,
      )}
      {...props}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  ),
);
AlertClose.displayName = "AlertClose";

export {
  Alert,
  AlertIcon,
  AlertContent,
  AlertTitle,
  AlertDescription,
  AlertActions,
  AlertClose,
  alertVariants,
};
