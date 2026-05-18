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
  ["w-full flex items-center gap-3 px-4 py-3 text-sm border-y"].join(" "),
  {
    variants: {
      color: {
        neutral:
          "bg-zen-muted text-zen-foreground border-zen-border",
        primary:
          "bg-zen-primary-soft text-zen-primary-soft-fg border-zen-primary-soft",
        info: "bg-zen-info-soft text-zen-info-soft-fg border-zen-info-soft",
        success:
          "bg-zen-success-soft text-zen-success-soft-fg border-zen-success-soft",
        warning:
          "bg-zen-warning-soft text-zen-warning-soft-fg border-zen-warning-soft",
        destructive:
          "bg-zen-error-soft text-zen-error-soft-fg border-zen-error-soft",
      },
      sticky: {
        true: "sticky top-0 z-30",
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
      <div className="flex items-center gap-3 w-full max-w-[100rem] mx-auto">
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
    className={cn("flex-shrink-0 inline-flex items-center", className)}
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
      "flex-1 min-w-0 inline-flex flex-wrap items-baseline gap-x-2",
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
    className={cn("font-semibold", className)}
    {...props}
  />
));
BannerTitle.displayName = "BannerTitle";

export const BannerDescription = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span ref={ref} className={cn("opacity-90", className)} {...props} />
));
BannerDescription.displayName = "BannerDescription";

export const BannerActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-shrink-0 flex items-center gap-2", className)}
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
        "flex-shrink-0 inline-flex items-center justify-center",
        "h-6 w-6 rounded-zen-sm bg-transparent border-0 cursor-pointer",
        "text-current opacity-70 hover:opacity-100 hover:bg-black/10",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zen-ring",
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
