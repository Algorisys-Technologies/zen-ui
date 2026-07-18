import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

/**
 * Banner — page-top persistent callout for app-wide context that needs
 * the user's attention but isn't transient like a Toast or inline like
 * an Alert. Compound API:
 *
 *   <Banner color="warning" sticky>
 *     <BannerIcon><WarningIcon /></BannerIcon>
 *     <BannerContent>
 *       <BannerTitle>Verification required</BannerTitle>
 *       <BannerDescription>
 *         Verify your email before continuing.
 *       </BannerDescription>
 *     </BannerContent>
 *     <BannerActions>
 *       <Button size="sm" variant="outline">Verify now</Button>
 *     </BannerActions>
 *     <BannerClose onClick={() => setShow(false)} />
 *   </Banner>
 *
 * Differs from Alert in three ways:
 *   - Full container width by default (no rounded corners).
 *   - `sticky` opt-in pins the banner to the top of the scroll viewport.
 *   - Centered max-width content area so long lines stay readable on
 *     wide screens.
 *
 * Use cases: "You're impersonating user X · Stop impersonating",
 * "Verify your email · Verify now", "Maintenance window at 22:00 UTC".
 */

const bannerVariants = cva(
  ["zen-w-full zen-flex zen-items-center zen-gap-3 zen-px-4 zen-py-3 zen-text-sm zen-border-y"].join(" "),
  {
    variants: {
      color: {
        neutral:
          "zen-bg-zen-muted zen-text-zen-foreground zen-border-zen-border",
        primary:
          "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg zen-border-zen-primary-soft",
        info: "zen-bg-zen-info-soft zen-text-zen-info-soft-fg zen-border-zen-info-soft",
        success:
          "zen-bg-zen-success-soft zen-text-zen-success-soft-fg zen-border-zen-success-soft",
        warning:
          "zen-bg-zen-warning-soft zen-text-zen-warning-soft-fg zen-border-zen-warning-soft",
        destructive:
          "zen-bg-zen-error-soft zen-text-zen-error-soft-fg zen-border-zen-error-soft",
      },
      sticky: {
        true: "zen-sticky zen-top-0 zen-z-30",
        false: "",
      },
    },
    defaultVariants: {
      color: "info",
      sticky: false,
    },
  },
);

export interface BannerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color">,
    VariantProps<typeof bannerVariants> {}

export const Banner = React.forwardRef<HTMLDivElement, BannerProps>(
  ({ className, color, sticky, children, ...props }, ref) => (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      className={cn(bannerVariants({ color, sticky }), className)}
      {...props}
    >
      {/* Inner row: centers content within a max-width on wide screens
       *  so the banner doesn't span 1600 px of edge-to-edge text. */}
      <div className="zen-flex zen-items-center zen-gap-3 zen-w-full zen-max-w-[100rem] zen-mx-auto">
        {children}
      </div>
    </div>
  ),
);
Banner.displayName = "Banner";

export const BannerIcon = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    aria-hidden
    className={cn("zen-flex-shrink-0 zen-inline-flex zen-items-center", className)}
    {...props}
  />
));
BannerIcon.displayName = "BannerIcon";

export const BannerContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "zen-flex-1 zen-min-w-0 zen-inline-flex zen-flex-wrap zen-items-baseline zen-gap-x-2",
      className,
    )}
    {...props}
  />
));
BannerContent.displayName = "BannerContent";

export const BannerTitle = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn("zen-font-semibold", className)}
    {...props}
  />
));
BannerTitle.displayName = "BannerTitle";

export const BannerDescription = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span ref={ref} className={cn("zen-opacity-90", className)} {...props} />
));
BannerDescription.displayName = "BannerDescription";

export const BannerActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("zen-flex-shrink-0 zen-flex zen-items-center zen-gap-2", className)}
    {...props}
  />
));
BannerActions.displayName = "BannerActions";

export interface BannerCloseProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const BannerClose = React.forwardRef<HTMLButtonElement, BannerCloseProps>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-label="Dismiss banner"
      className={cn(
        "zen-flex-shrink-0 zen-inline-flex zen-items-center zen-justify-center",
        "zen-h-6 zen-w-6 zen-rounded-zen-sm zen-bg-transparent zen-border-0 zen-cursor-pointer",
        "zen-text-current zen-opacity-70 hover:zen-opacity-100 hover:zen-bg-black/10",
        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
        className,
      )}
      {...props}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  ),
);
BannerClose.displayName = "BannerClose";

export { bannerVariants };
