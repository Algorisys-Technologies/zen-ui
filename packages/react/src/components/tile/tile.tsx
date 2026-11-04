import * as React from "react";
import { cn } from "../../lib/cn";
import { Icon } from "../icon/icon";
import { Skeleton } from "../skeleton/skeleton";
import { useLocale } from "../locale/locale";

/**
 * Tile and TileGrid — a launchpad: the apps, modules or records a person
 * starts their work from, each a tile with a mark, a name and a live line
 * under it ("131 records").
 *
 *   <TileGrid aria-label="Accounts">
 *     <Tile avatar="SI" title="Sales Invoice" subtitle="131 records" href="/sales-invoice" />
 *     <Tile icon={<Icon name="book" />} title="Journal Entry" subtitle="Open" onClick={open} />
 *     <Tile avatar="AS" title="Asset" locked lockedLabel="Not in your plan" onClick={explain} />
 *   </TileGrid>
 *
 * A tile with `href` is a link (`as` takes a router link), with `onClick` a
 * button. TileGrid is one tab stop: the arrows move between tiles (up and down
 * by the columns as they are laid out), Home and End to the ends, as
 * DataTable's keyboard rows do. Enter and Space are the tile's own.
 */

export type TileProps = {
  /** The tile's name. */
  title: React.ReactNode;
  /** A live line under the name: a count, a status, "Open". */
  subtitle?: React.ReactNode;
  /** Up to two letters in a square mark ("SI"). Ignored when `icon` is given. */
  avatar?: string;
  /** An icon in the square mark, in place of `avatar`. */
  icon?: React.ReactNode;
  /** Makes the tile a link. */
  href?: string;
  /**
   * The link element: a router's `Link`, say. Default "a". It is given `href`
   * and, for routers that navigate by `to` (react-router), `to` as well.
   */
  as?: React.ElementType;
  /** Makes the tile a button (when it has no href). */
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  /** The subtitle is still coming: shown as a skeleton, and the tile is marked busy. */
  loading?: boolean;
  /** Not available: not focusable, not activated, dimmed. */
  disabled?: boolean;
  /**
   * Outside what this user has (a module not in their plan): muted, with a
   * lock. Still activatable, so the app can say why or offer an upgrade.
   */
  locked?: boolean;
  /** Read with a locked tile's name, and shown under it. Default "Locked". */
  lockedLabel?: string;
  className?: string;
};

const ROOT =
  "zen-group zen-flex zen-w-full zen-items-center zen-gap-3 zen-rounded-zen-md zen-border zen-border-solid zen-border-zen-border zen-bg-zen-background zen-p-3 zen-text-start zen-text-zen-foreground zen-no-underline";
const INTERACTIVE =
  "zen-cursor-pointer zen-transition-colors hover:zen-border-zen-primary hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2";

export const Tile = ({
  title,
  subtitle,
  avatar,
  icon,
  href,
  as,
  onClick,
  loading,
  disabled,
  locked,
  lockedLabel,
  className,
}: TileProps) => {
  const loc = useLocale();
  const interactive = !disabled && Boolean(href || onClick);
  const classes = cn(
    ROOT,
    interactive && INTERACTIVE,
    disabled && "zen-cursor-not-allowed zen-opacity-50",
    locked && "zen-border-dashed zen-bg-zen-muted/40",
    className,
  );
  const busy = loading || undefined;

  const body = (
    <>
      <span
        aria-hidden="true"
        className={cn(
          "zen-flex zen-h-10 zen-w-10 zen-shrink-0 zen-items-center zen-justify-center zen-rounded-zen-md zen-text-sm zen-font-semibold",
          locked ? "zen-bg-zen-muted zen-text-zen-muted-fg" : "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg",
        )}
      >
        {icon ? icon : (avatar ?? "").slice(0, 2).toUpperCase()}
      </span>
      <span className="zen-flex zen-min-w-0 zen-flex-1 zen-flex-col zen-gap-0.5">
        <span className={cn("zen-truncate zen-text-sm zen-font-medium", locked && "zen-text-zen-muted-fg")}>
          {title}
        </span>
        {loading ? (
          <Skeleton className="zen-h-3 zen-w-20" />
        ) : locked || subtitle !== undefined ? (
          <span className="zen-truncate zen-text-xs zen-text-zen-muted-fg">
            {locked ? (lockedLabel ?? loc.t("tile.locked")) : subtitle}
          </span>
        ) : null}
      </span>
      {locked && <Icon name="lock" size={14} className="zen-shrink-0 zen-text-zen-muted-fg" />}
    </>
  );

  if (href && !disabled) {
    const Link = as ?? "a";
    // A router link navigating by `to` (react-router) gets it; a plain anchor does not.
    const routerProps = as ? { to: href } : {};
    return (
      <Link data-tile="" href={href} {...routerProps} className={classes} aria-busy={busy} onClick={onClick}>
        {body}
      </Link>
    );
  }
  if (onClick || (href && disabled)) {
    return (
      <button
        type="button"
        data-tile=""
        className={classes}
        disabled={disabled}
        aria-busy={busy}
        onClick={(e) => onClick?.(e)}
      >
        {body}
      </button>
    );
  }
  return (
    <div data-tile="" className={classes} aria-busy={busy} aria-disabled={disabled || undefined}>
      {body}
    </div>
  );
};

export type TileGridProps = React.HTMLAttributes<HTMLDivElement> & {
  /** The narrowest a tile gets before the grid drops a column. Default: --zen-tile-min-width. */
  minTileWidth?: string;
};

/**
 * Tiles in responsive columns, one tab stop for all of them. The tab stop is
 * the tile last focused; the arrows move it.
 */
export const TileGrid = React.forwardRef<HTMLDivElement, TileGridProps>(
  ({ className, children, minTileWidth, style, onKeyDown, onFocus, ...props }, ref) => {
    const gridRef = React.useRef<HTMLDivElement | null>(null);
    const current = React.useRef<HTMLElement | null>(null);
    const setRefs = React.useCallback(
      (node: HTMLDivElement | null) => {
        gridRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    const tiles = React.useCallback(() => {
      const grid = gridRef.current;
      return grid
        ? [...grid.querySelectorAll<HTMLElement>("[data-tile]")].filter(
            (t) => t.tagName !== "DIV" && !(t as HTMLButtonElement).disabled,
          )
        : [];
    }, []);
    // One tab stop: the tile that had focus last (the first, to begin with).
    const settleTabStops = React.useCallback(() => {
      const list = tiles();
      if (!current.current || !list.includes(current.current)) current.current = list[0] ?? null;
      for (const t of list) t.tabIndex = t === current.current ? 0 : -1;
    }, [tiles]);

    React.useEffect(() => {
      const grid = gridRef.current;
      if (!grid) return;
      settleTabStops();
      // Tiles come and go (a list that loads, a search that filters): the one
      // tab stop is kept.
      const mo = new MutationObserver(settleTabStops);
      mo.observe(grid, { childList: true, subtree: true });
      return () => mo.disconnect();
    }, [settleTabStops]);

    // Columns as laid out: the tiles that share the first tile's row. Measured
    // at the key press, so it survives a column dropping on resize.
    const columns = (list: HTMLElement[]) => {
      const top = list[0]?.offsetTop;
      return Math.max(1, list.filter((t) => t.offsetTop === top).length);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      const list = tiles();
      const from = list.indexOf(e.target as HTMLElement);
      if (from < 0) return;
      const rtl = getComputedStyle(gridRef.current!).direction === "rtl";
      const cols = columns(list);
      const step: Record<string, number> = {
        ArrowRight: rtl ? -1 : 1,
        ArrowLeft: rtl ? 1 : -1,
        ArrowDown: cols,
        ArrowUp: -cols,
      };
      let to: number | null = null;
      if (e.key in step) to = from + step[e.key];
      else if (e.key === "Home") to = 0;
      else if (e.key === "End") to = list.length - 1;
      if (to === null) return;
      e.preventDefault();
      const target = list[Math.min(Math.max(to, 0), list.length - 1)];
      current.current = target;
      settleTabStops();
      target.focus();
    };
    // React's onFocus bubbles (focusin): a tile focused by click or by Tab
    // becomes the tab stop.
    const handleFocus = (e: React.FocusEvent<HTMLDivElement>) => {
      onFocus?.(e);
      const t = (e.target as Element).closest?.("[data-tile]") as HTMLElement | null;
      if (t && tiles().includes(t) && t !== current.current) {
        current.current = t;
        settleTabStops();
      }
    };

    return (
      <div
        ref={setRefs}
        role="group"
        // Full width: in a flex row (most app layouts) a grid otherwise shrinks
        // to one tile and never lays out a second column.
        className={cn("zen-grid zen-w-full zen-gap-3", className)}
        style={{
          gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${minTileWidth ?? "var(--zen-tile-min-width)"}), 1fr))`,
          ...style,
        }}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        {...props}
      >
        {children}
      </div>
    );
  },
);
TileGrid.displayName = "TileGrid";
