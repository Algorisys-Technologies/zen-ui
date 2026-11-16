import * as React from "react";
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
 * copy: a `label` may be a stateful element, and rendering it twice would
 * mount it twice.
 */

export type StatusBarColor = "info" | "success" | "warning" | "error";

export interface StatusBarItem {
  id: string;
  label?: React.ReactNode;
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

export interface StatusBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  items: StatusBarItem[];
  variant?: "default" | "muted" | "accent";
  size?: "sm" | "md";
  /** The bar's accessible name. Default "Status bar". */
  label?: string;
  /** Called with the ids that gave way, whenever that set changes. */
  onCollapse?: (ids: string[]) => void;
}

const sameIds = (a: string[], b: string[]) => a.length === b.length && a.every((x, i) => x === b[i]);

export const StatusBar = React.forwardRef<HTMLDivElement, StatusBarProps>(
  ({ items, variant, size, label, onCollapse, className, ...rest }, ref) => {
    const loc = useLocale();
    const [collapsed, setCollapsed] = React.useState<string[]>([]);
    const sides = statusBarSides(items);
    // One flex row, not two groups: an empty group would still take a gap, and
    // the collapse arithmetic counts exactly one gap between shown neighbours.
    const ordered = [...sides.start, ...sides.end];
    // The first SHOWN end item pushes the end side over; if it collapses, the next one does.
    const firstEnd = sides.end.find((it) => !collapsed.includes(it.id))?.id;

    const barRef = React.useRef<HTMLDivElement | null>(null);
    // Rendered slots, by position — keyed by index like Solid's <Index>, so a
    // caller that rebuilds `items` every render keeps the same DOM and an
    // `announce` region CHANGES rather than being re-inserted (a screen reader
    // ignores a live region that arrives already holding its text).
    const els = React.useRef<(HTMLElement | null)[]>([]);
    // Last measured width per id. A collapsed item cannot be measured, so the
    // bar remembers what it measured while the item was showing.
    const widths = React.useRef<Record<string, number>>({});
    const latest = React.useRef({ items, ordered, collapsed, onCollapse });
    latest.current = { items, ordered, collapsed, onCollapse };

    const recompute = React.useCallback(() => {
      const bar = barRef.current;
      if (!bar) return;
      const { items, ordered, collapsed, onCollapse } = latest.current;
      const cs = getComputedStyle(bar);
      const room = bar.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0);
      const gap = parseFloat(cs.columnGap) || 0;
      ordered.forEach((it, i) => {
        const el = els.current[i];
        if (el && !collapsed.includes(it.id)) widths.current[it.id] = el.getBoundingClientRect().width;
      });
      const next = statusBarCollapse(items, widths.current, room, gap);
      if (sameIds(next, collapsed)) return;
      latest.current.collapsed = next;
      setCollapsed(next);
      onCollapse?.(next);
    }, []);

    const ro = React.useRef<ResizeObserver | null>(null);
    React.useLayoutEffect(() => {
      if (typeof ResizeObserver === "undefined" || !barRef.current) return;
      const observer = new ResizeObserver(() => recompute());
      ro.current = observer;
      observer.observe(barRef.current);
      for (const el of els.current) if (el) observer.observe(el);
      return () => {
        observer.disconnect();
        ro.current = null;
      };
    }, [recompute]);

    // One stable callback per slot. A fresh arrow each render would make React
    // detach and re-attach every slot on every render, and each re-observe
    // fires the ResizeObserver again.
    const slotRefs = React.useRef<((el: HTMLElement | null) => void)[]>([]);
    const slotRef = (i: number) =>
      (slotRefs.current[i] ??= (el: HTMLElement | null) => {
        const prev = els.current[i];
        if (prev === el) return;
        if (prev) ro.current?.unobserve(prev);
        els.current[i] = el;
        if (el) ro.current?.observe(el);
      });

    const setBarRef = (el: HTMLDivElement | null) => {
      barRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) ref.current = el;
    };

    return (
      <div
        ref={setBarRef}
        role="group"
        aria-label={label ?? loc.t("statusBar.label")}
        className={cn(statusBarVariants({ variant, size }), className)}
        {...rest}
      >
        {ordered.map((it, i) => {
          const isCollapsed = collapsed.includes(it.id);
          const iconOnly = it.label === undefined || it.label === null || it.label === "";
          const cls = statusBarItemVariants({ color: it.color ?? "none", interactive: !!it.onSelect });
          const content = (
            <>
              {it.icon && <Icon name={it.icon} size={size === "sm" ? 12 : 14} />}
              {/* The title is part of the name, not only a tooltip: a button that
                  says "2" means nothing to a screen reader; "Problems 2" does. */}
              {it.title && !(iconOnly && it.onSelect) && <span className="zen-sr-only">{it.title}</span>}
              {!iconOnly && (
                <span className="zen-truncate" role={it.announce ? "status" : undefined}>
                  {it.label}
                </span>
              )}
            </>
          );
          return (
            <span
              // Index, not id: see `els` above.
              key={i}
              ref={slotRef(i)}
              data-status-item={it.id}
              data-collapsed={isCollapsed ? "" : undefined}
              className={cn(
                isCollapsed ? "zen-hidden" : "zen-inline-flex zen-h-full zen-shrink-0 zen-items-center zen-gap-1",
                firstEnd === it.id && "zen-ms-auto",
              )}
            >
              {it.separatorBefore && <span aria-hidden="true" className={statusBarSeparatorClass} />}
              {it.onSelect ? (
                <button
                  type="button"
                  className={cls}
                  title={it.title}
                  aria-label={iconOnly ? it.title : undefined}
                  disabled={it.disabled}
                  onClick={() => it.onSelect?.()}
                >
                  {content}
                </button>
              ) : (
                <span className={cls} title={it.title}>
                  {content}
                </span>
              )}
            </span>
          );
        })}
      </div>
    );
  },
);
StatusBar.displayName = "StatusBar";
