import * as React from "react";
import { cn } from "../../lib/cn";
import { Icon } from "../icon/icon";

/**
 * PageHeader — a heading with a back affordance and one action.
 *
 *   <PageHeader
 *     title="Assessment results"
 *     subtitle="32 responses"
 *     onBack={() => navigate(-1)}
 *     actions={<Button>Export</Button>}
 *   />
 *
 * The library already has `DynamicPage` and `ObjectPageLayout`, but those are
 * app-frame weight — snapping headers, pinnable title bars, anchored sections.
 * Most screens want none of that and just need a title, somewhere to go back
 * to, and a button on the right. Reaching for DynamicPage to get a heading is
 * how a page ends up with a scroll-linked header it never asked for.
 *
 * Everything except `title` is optional and renders nothing when absent, so
 * the plain case stays a heading and no wrapper divs.
 *
 * Deliberately NOT here: a checkbox. The header this replaces grew one, and a
 * selection control in a page heading has no relationship to the heading — it
 * belongs to whatever it selects. Porting the wart along with the shape is how
 * the next component inherits it.
 *
 * `title` renders as `<h2>`, matching DynamicPage and ObjectPageLayout: the
 * `<h1>` belongs to the application shell, and a page-level component that
 * claims it fights the app it is dropped into.
 */

export interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Renders a back affordance to the left of the title. Without it, none. */
  onBack?: () => void;
  /** Accessible name for the back control — it is icon-only. Default "Back". */
  backLabel?: string;
  /** Right-aligned actions. */
  actions?: React.ReactNode;
  /** Sits beside the title, e.g. an info Tooltip. */
  info?: React.ReactNode;
  /** Sits above the title, e.g. a Breadcrumb. */
  breadcrumb?: React.ReactNode;
  className?: string;
}

export const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  (
    { title, subtitle, onBack, backLabel = "Back", actions, info, breadcrumb, className, ...props },
    ref,
  ) => (
    <div ref={ref} className={cn("zen-flex zen-flex-col zen-gap-2", className)} {...props}>
      {breadcrumb}
      {/* items-start, not items-center: a subtitle that wraps to two or three
          lines would drag a vertically-centred back button and action row down
          with it, away from the title they belong to. */}
      <div className="zen-flex zen-items-start zen-gap-3">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label={backLabel}
            // h-8 matches the title's line box, so the control sits on the
            // title's line rather than floating above it.
            className={cn(
              "zen-inline-flex zen-h-8 zen-w-8 zen-shrink-0 zen-items-center zen-justify-center",
              "zen-cursor-pointer zen-rounded-zen-sm zen-border-0 zen-bg-transparent",
              "zen-text-zen-muted-fg zen-transition-colors",
              "hover:zen-bg-zen-muted hover:zen-text-zen-foreground",
              "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
            )}
          >
            <Icon name="arrow-left" size={18} />
          </button>
        ) : null}

        {/* min-w-0 is what lets the title truncate instead of shoving the
            actions off the right edge. */}
        <div className="zen-flex zen-min-w-0 zen-flex-1 zen-flex-col zen-gap-0.5">
          <div className="zen-flex zen-min-w-0 zen-items-center zen-gap-2">
            <h2 className="zen-m-0 zen-min-w-0 zen-truncate zen-text-xl zen-font-semibold zen-leading-8 zen-text-zen-foreground">
              {title}
            </h2>
            {info ? <span className="zen-inline-flex zen-shrink-0 zen-items-center">{info}</span> : null}
          </div>
          {subtitle ? (
            <p className="zen-m-0 zen-text-sm zen-text-zen-muted-fg">{subtitle}</p>
          ) : null}
        </div>

        {actions ? (
          <div className="zen-flex zen-shrink-0 zen-items-center zen-gap-2">{actions}</div>
        ) : null}
      </div>
    </div>
  ),
);
PageHeader.displayName = "PageHeader";
