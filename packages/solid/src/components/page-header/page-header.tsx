import { type JSX, splitProps, Show } from "solid-js";
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
 * to, and a button on the right.
 *
 * Deliberately NOT here: a checkbox. The header this replaces grew one, and a
 * selection control in a page heading has no relationship to the heading.
 *
 * `title` renders as `<h2>`, matching DynamicPage and ObjectPageLayout: the
 * `<h1>` belongs to the application shell.
 *
 * Mirrors the React binding's API.
 */

export interface PageHeaderProps
  extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "title"> {
  title: JSX.Element;
  subtitle?: JSX.Element;
  /** Renders a back affordance to the left of the title. Without it, none. */
  onBack?: () => void;
  /** Accessible name for the back control — it is icon-only. Default "Back". */
  backLabel?: string;
  /** Right-aligned actions. */
  actions?: JSX.Element;
  /** Sits beside the title, e.g. an info Tooltip. */
  info?: JSX.Element;
  /** Sits above the title, e.g. a Breadcrumb. */
  breadcrumb?: JSX.Element;
  class?: string;
}

export const PageHeader = (props: PageHeaderProps) => {
  // The rest is forwarded rather than dropped: a binding that accepts only
  // class/children silently swallows a caller's style/id/data-*, which is the
  // PopoverContent divergence this repo already shipped once.
  const [local, rest] = splitProps(props, [
    "title",
    "subtitle",
    "onBack",
    "backLabel",
    "actions",
    "info",
    "breadcrumb",
    "class",
  ]);

  return (
    <div class={cn("zen-flex zen-flex-col zen-gap-2", local.class)} {...rest}>
      {local.breadcrumb}
      {/* items-start, not items-center: a subtitle that wraps to two or three
          lines would drag a vertically-centred back button and action row down
          with it, away from the title they belong to. */}
      <div class="zen-flex zen-items-start zen-gap-3">
        <Show when={local.onBack}>
          <button
            type="button"
            onClick={() => local.onBack?.()}
            aria-label={local.backLabel ?? "Back"}
            // h-8 matches the title's line box, so the control sits on the
            // title's line rather than floating above it.
            class={cn(
              "zen-inline-flex zen-h-8 zen-w-8 zen-shrink-0 zen-items-center zen-justify-center",
              "zen-cursor-pointer zen-rounded-zen-sm zen-border-0 zen-bg-transparent",
              "zen-text-zen-muted-fg zen-transition-colors",
              "hover:zen-bg-zen-muted hover:zen-text-zen-foreground",
              "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
            )}
          >
            <Icon name="arrow-left" size={18} />
          </button>
        </Show>

        {/* min-w-0 is what lets the title truncate instead of shoving the
            actions off the right edge. */}
        <div class="zen-flex zen-min-w-0 zen-flex-1 zen-flex-col zen-gap-0.5">
          <div class="zen-flex zen-min-w-0 zen-items-center zen-gap-2">
            <h2 class="zen-m-0 zen-min-w-0 zen-truncate zen-text-xl zen-font-semibold zen-leading-8 zen-text-zen-foreground">
              {local.title}
            </h2>
            <Show when={local.info}>
              <span class="zen-inline-flex zen-shrink-0 zen-items-center">{local.info}</span>
            </Show>
          </div>
          <Show when={local.subtitle}>
            <p class="zen-m-0 zen-text-sm zen-text-zen-muted-fg">{local.subtitle}</p>
          </Show>
        </div>

        <Show when={local.actions}>
          <div class="zen-flex zen-shrink-0 zen-items-center zen-gap-2">{local.actions}</div>
        </Show>
      </div>
    </div>
  );
};
