import { type JSX, Match, Show, Switch, splitProps } from "solid-js";
import { cn } from "../../lib/cn";
import { cardVariants } from "../card/card";
import { Icon } from "../icon/icon";
import { Skeleton } from "../skeleton/skeleton";

/**
 * StatCard — a labelled figure, optionally with an icon, a delta and somewhere
 * to go.
 *
 *   <StatCard
 *     label="Completion rate"
 *     value="87%"
 *     color="success"
 *     trend={{ value: "+12%", direction: "up" }}
 *     href="/responses"
 *   />
 *
 * `Card` is a bare surface, so every app rebuilds this on top of it and each
 * copy drifts. The surface here IS Card's — `cardVariants` rather than a
 * second set of class strings.
 *
 * `color` maps to `--zen-*` tokens, never to computed class names.
 *
 * Two things it deliberately does NOT do (see slop.md): the icon is bare, with
 * no tinted tile behind it, and an interactive card shifts tone rather than
 * lifting with a shadow bloom.
 *
 * Mirrors the React binding's API.
 */

export type StatCardColor = "primary" | "neutral" | "info" | "success" | "warning" | "error";

export interface StatCardTrend {
  value: JSX.Element;
  direction: "up" | "down" | "flat";
  /**
   * Overrides the direction's default colour. Up is not universally good —
   * churn, cost, error rate and response time all read the other way — so the
   * caller, who knows what the number means, gets the last word.
   */
  color?: StatCardColor;
}

export interface StatCardProps extends Omit<JSX.HTMLAttributes<HTMLElement>, "onClick" | "ref"> {
  /**
   * Declared here rather than inherited: the root is an <a>, <button> or <div>
   * depending on the props, and JSX.HTMLAttributes<HTMLElement>'s ref does not
   * narrow to any of them. Taking HTMLElement is the honest signature — the
   * caller cannot know which element they will get either.
   */
  ref?: (el: HTMLElement) => void;
  label: JSX.Element;
  value: JSX.Element;
  /** Rendered bare, tinted by `color`. Decorative: `label` is the meaning. */
  icon?: JSX.Element;
  /** Default "neutral" — a statistic is not an alert. */
  color?: StatCardColor;
  trend?: StatCardTrend;
  /** Renders the card as a button. */
  onClick?: () => void;
  /** Renders the card as a link. Takes precedence over onClick. */
  href?: string;
  /** Swaps the figure for a skeleton and marks the card busy. */
  loading?: boolean;
  class?: string;
}

const TEXT: Record<StatCardColor, string> = {
  primary: "zen-text-zen-primary",
  neutral: "zen-text-zen-muted-fg",
  info: "zen-text-zen-info",
  success: "zen-text-zen-success",
  warning: "zen-text-zen-warning",
  error: "zen-text-zen-error",
};

/** The conventional reading, overridable per trend because it is only a convention. */
const TREND_COLOR: Record<StatCardTrend["direction"], StatCardColor> = {
  up: "success",
  down: "error",
  flat: "neutral",
};

// No "flat" glyph in the set; a sideways arrow is the flat one.
const TREND_ICON = { up: "arrow-up", down: "arrow-down", flat: "arrow-right" } as const;

/** The arrow is the only thing carrying direction, so it is named, not hidden. */
const TREND_LABEL = { up: "Trending up", down: "Trending down", flat: "Flat" } as const;

export const StatCard = (props: StatCardProps) => {
  const [local, rest] = splitProps(props, [
    "label",
    "value",
    "icon",
    "color",
    "trend",
    "onClick",
    "href",
    "loading",
    "class",
    "ref",
  ]);

  const interactive = () => Boolean(local.href || local.onClick);
  const color = () => local.color ?? "neutral";

  const classes = () =>
    cn(
      // The surface is Card's, not a copy of it.
      cardVariants({ variant: "outlined", padding: "md" }),
      "zen-block zen-w-full zen-text-start",
      interactive() &&
        "zen-cursor-pointer zen-transition-colors hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
      local.class,
    );

  // A component, not a variable: Dynamic re-renders the root when the element
  // changes, and the body must not be built twice (a JSX value read twice
  // mounts two of everything — see demo-helpers' CodeExample).
  const Body = () => (
    <div class="zen-flex zen-items-start zen-justify-between zen-gap-3">
      <div class="zen-flex zen-min-w-0 zen-flex-col zen-gap-1.5">
        <span class="zen-truncate zen-text-sm zen-text-zen-muted-fg">{local.label}</span>
        <Show
          when={!local.loading}
          fallback={<Skeleton class="zen-h-7 zen-w-24" />}
        >
          <span class="zen-text-2xl zen-font-semibold zen-leading-none zen-text-zen-foreground">
            {local.value}
          </span>
        </Show>
        <Show when={local.trend && !local.loading}>
          {(() => {
            const t = local.trend as StatCardTrend;
            return (
              <span
                class={cn(
                  "zen-inline-flex zen-items-center zen-gap-1 zen-text-xs",
                  TEXT[t.color ?? TREND_COLOR[t.direction]],
                )}
              >
                <Icon name={TREND_ICON[t.direction]} size={13} title={TREND_LABEL[t.direction]} />
                {t.value}
              </span>
            );
          })()}
        </Show>
      </div>
      <Show when={local.icon}>
        {/* Bare: no tile, no chip, no rounded square. See the note above. */}
        <span aria-hidden="true" class={cn("zen-shrink-0", TEXT[color()])}>
          {local.icon}
        </span>
      </Show>
    </div>
  );

  // Three concrete branches rather than <Dynamic>: a Dynamic over an
  // "a" | "button" | "div" union cannot reconcile ref (HTMLAnchorElement vs
  // HTMLElement) and only typechecks with a cast. An interactive card has to be
  // a real control, so the element is worth spelling out.
  return (
    <Switch
      fallback={
        <div ref={local.ref} class={classes()} aria-busy={local.loading || undefined} {...rest}>
          <Body />
        </div>
      }
    >
      <Match when={local.href}>
        <a
          ref={local.ref}
          href={local.href}
          class={classes()}
          aria-busy={local.loading || undefined}
          {...rest}
        >
          <Body />
        </a>
      </Match>
      <Match when={local.onClick}>
        <button
          ref={local.ref}
          type="button"
          onClick={() => local.onClick?.()}
          class={classes()}
          aria-busy={local.loading || undefined}
          {...rest}
        >
          <Body />
        </button>
      </Match>
    </Switch>
  );
};
