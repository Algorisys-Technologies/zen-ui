import { type JSX, Index, Show, createMemo, createSignal, onCleanup, onMount, splitProps } from "solid-js";
import { statusBarCollapse, statusBarSides, type StatusBarAlign } from "@algorisys/zen-ui-core/status-bar";
import { statusBarItemVariants, statusBarSeparatorClass, statusBarVariants } from "@algorisys/zen-ui-core/variants";
import { cn } from "../../lib/cn";
import { Icon, type IconName } from "../icon/icon";
import { useLocale } from "../locale/locale";

/**
 * StatusBar — the strip along the bottom of an app, an editor or a panel.
 *
 *   <StatusBar items={[
 *     { id: "branch", icon: "flag", label: "main" },
 *     { id: "errors", icon: "error", label: "2", color: "error", onSelect: openProblems, align: "end", priority: 5 },
 *   ]} />
 *
 * Items are data, not children, so the bar can decide what fits. When it is
 * too narrow, items give way lowest `priority` first, and among equals the one
 * later in the list — the rest are never squashed or wrapped. A collapsed item
 * is gone from the accessibility tree too, so give anything a user must not
 * miss a high priority.
 *
 * An item with `onSelect` is a button; otherwise it is text. Item text is not
 * announced when it changes (a clock would speak every second) unless the item
 * sets `announce`.
 *
 * Collapse is measured from the rendered items themselves, not from a hidden
 * copy: a `label` may be a live JSX node, and one node cannot be in two places.
 */

export type StatusBarColor = "info" | "success" | "warning" | "error";

export interface StatusBarItem {
  id: string;
  label?: JSX.Element;
  icon?: IconName;
  /** Tooltip, and part of the accessible name ("Problems 2"); the whole name of an icon-only item. */
  title?: string;
  /** Shows the item as a soft chip in that colour. */
  color?: StatusBarColor;
  /** Makes the item a button. */
  onSelect?: () => void;
  disabled?: boolean;
  /** Default "start". */
  align?: StatusBarAlign;
  /** Higher stays longer when the bar is narrow. Default 0. */
  priority?: number;
  hidden?: boolean;
  /** Draws a divider before the item. */
  separatorBefore?: boolean;
  /** Announces changes to this item's text to screen readers (a polite live region). */
  announce?: boolean;
}

export type StatusBarProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> & {
  items: StatusBarItem[];
  variant?: "default" | "muted" | "accent";
  size?: "sm" | "md";
  /** The bar's accessible name. Default "Status bar". */
  label?: string;
  /** Called with the ids that gave way, whenever that set changes. */
  onCollapse?: (ids: string[]) => void;
};

export const StatusBar = (props: StatusBarProps) => {
  const [local, rest] = splitProps(props, ["items", "variant", "size", "label", "onCollapse", "class"]);
  const loc = useLocale();
  const [collapsed, setCollapsed] = createSignal<string[]>([]);
  const sides = createMemo(() => statusBarSides(local.items));
  // One flex row, not two groups: an empty group would still take a gap, and
  // the collapse arithmetic counts exactly one gap between shown neighbours.
  const ordered = createMemo(() => [...sides().start, ...sides().end]);
  const isCollapsed = (id: string) => collapsed().includes(id);
  // The first SHOWN end item pushes the end side over; if it collapses, the next one does.
  const firstEnd = createMemo(() => sides().end.find((it) => !isCollapsed(it.id))?.id);

  let bar: HTMLDivElement | undefined;
  // Rendered slots, by position. <Index>, not <For>: a caller that rebuilds the
  // array on every update (the natural thing to write) keeps the same DOM, so
  // an `announce` region CHANGES rather than being re-inserted — a screen
  // reader ignores a live region that arrives already holding its text.
  const els: (HTMLElement | undefined)[] = [];
  // Last measured width per id. A collapsed item cannot be measured, so the
  // bar remembers what it measured while the item was showing.
  const widths: Record<string, number> = {};
  let ro: ResizeObserver | undefined;

  const recompute = () => {
    if (!bar) return;
    const cs = getComputedStyle(bar);
    const room = bar.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0);
    const gap = parseFloat(cs.columnGap) || 0;
    ordered().forEach((it, i) => {
      const el = els[i];
      if (el && !isCollapsed(it.id)) widths[it.id] = el.getBoundingClientRect().width;
    });
    const next = statusBarCollapse(local.items, widths, room, gap);
    if (next.join("\u0000") === collapsed().join("\u0000")) return;
    setCollapsed(next);
    local.onCollapse?.(next);
  };

  onMount(() => {
    if (typeof ResizeObserver === "undefined" || !bar) return;
    ro = new ResizeObserver(() => recompute());
    ro.observe(bar);
    for (const el of els) if (el) ro.observe(el);
    onCleanup(() => ro?.disconnect());
  });

  const register = (i: number, el: HTMLElement) => {
    els[i] = el;
    ro?.observe(el);
    onCleanup(() => {
      ro?.unobserve(el);
      if (els[i] === el) els[i] = undefined;
    });
  };

  const renderItem = (it: () => StatusBarItem, i: number) => {
    const iconOnly = () => it().label === undefined || it().label === null || it().label === "";
    const content = () => (
      <>
        <Show when={it().icon}>{(name) => <Icon name={name()} size={local.size === "sm" ? 12 : 14} />}</Show>
        {/* The title is part of the name, not only a tooltip: a button that
            says "2" means nothing to a screen reader; "Problems 2" does. */}
        <Show when={it().title && !(iconOnly() && it().onSelect)}>
          <span class="zen-sr-only">{it().title}</span>
        </Show>
        <Show when={!iconOnly()}>
          <span class="zen-truncate" role={it().announce ? "status" : undefined}>{it().label}</span>
        </Show>
      </>
    );
    const cls = () => statusBarItemVariants({ color: it().color ?? "none", interactive: !!it().onSelect });
    return (
      <span
        ref={(el) => register(i, el)}
        data-status-item={it().id}
        data-collapsed={isCollapsed(it().id) ? "" : undefined}
        class={cn(
          isCollapsed(it().id) ? "zen-hidden" : "zen-inline-flex zen-h-full zen-shrink-0 zen-items-center zen-gap-1",
          firstEnd() === it().id && "zen-ms-auto",
        )}
      >
        <Show when={it().separatorBefore}>
          <span aria-hidden="true" class={statusBarSeparatorClass} />
        </Show>
        <Show
          when={!!it().onSelect}
          fallback={
            <span class={cls()} title={it().title}>
              {content()}
            </span>
          }
        >
          <button
            type="button"
            class={cls()}
            title={it().title}
            aria-label={iconOnly() ? it().title : undefined}
            disabled={it().disabled}
            onClick={() => it().onSelect?.()}
          >
            {content()}
          </button>
        </Show>
      </span>
    );
  };

  return (
    <div
      ref={bar}
      role="group"
      aria-label={local.label ?? loc.t("statusBar.label")}
      class={cn(statusBarVariants({ variant: local.variant, size: local.size }), local.class)}
      {...rest}
    >
      <Index each={ordered()}>{renderItem}</Index>
    </div>
  );
};
