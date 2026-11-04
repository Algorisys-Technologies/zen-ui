import {
  type JSX,
  type ValidComponent,
  Show,
  Switch,
  Match,
  onCleanup,
  onMount,
  splitProps,
} from "solid-js";
import { Dynamic } from "solid-js/web";
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
  title: JSX.Element;
  /** A live line under the name: a count, a status, "Open". */
  subtitle?: JSX.Element;
  /** Up to two letters in a square mark ("SI"). Ignored when `icon` is given. */
  avatar?: string;
  /** An icon in the square mark, in place of `avatar`. */
  icon?: JSX.Element;
  /** Makes the tile a link. */
  href?: string;
  /** The link element: a router's `A`, say. Default "a". */
  as?: ValidComponent;
  /** Makes the tile a button (when it has no href). */
  onClick?: (e: MouseEvent) => void;
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
  class?: string;
};

const ROOT =
  "zen-group zen-flex zen-w-full zen-items-center zen-gap-3 zen-rounded-zen-md zen-border zen-border-solid zen-border-zen-border zen-bg-zen-background zen-p-3 zen-text-start zen-text-zen-foreground zen-no-underline";
const INTERACTIVE =
  "zen-cursor-pointer zen-transition-colors hover:zen-border-zen-primary hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2";

export const Tile = (props: TileProps) => {
  const loc = useLocale();
  const [local] = splitProps(props, [
    "title",
    "subtitle",
    "avatar",
    "icon",
    "href",
    "as",
    "onClick",
    "loading",
    "disabled",
    "locked",
    "lockedLabel",
    "class",
  ]);
  const interactive = () => !local.disabled && Boolean(local.href || local.onClick);
  const classes = () =>
    cn(
      ROOT,
      interactive() && INTERACTIVE,
      local.disabled && "zen-cursor-not-allowed zen-opacity-50",
      local.locked && "zen-border-dashed zen-bg-zen-muted/40",
      local.class,
    );

  const Body = () => (
    <>
      <span
        aria-hidden="true"
        class={cn(
          "zen-flex zen-h-10 zen-w-10 zen-shrink-0 zen-items-center zen-justify-center zen-rounded-zen-md zen-text-sm zen-font-semibold",
          local.locked ? "zen-bg-zen-muted zen-text-zen-muted-fg" : "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg",
        )}
      >
        <Show when={local.icon} fallback={(local.avatar ?? "").slice(0, 2).toUpperCase()}>
          {local.icon}
        </Show>
      </span>
      <span class="zen-flex zen-min-w-0 zen-flex-1 zen-flex-col zen-gap-0.5">
        <span class={cn("zen-truncate zen-text-sm zen-font-medium", local.locked && "zen-text-zen-muted-fg")}>
          {local.title}
        </span>
        <Show
          when={!local.loading}
          fallback={<Skeleton class="zen-h-3 zen-w-20" />}
        >
          <Show when={local.locked || local.subtitle !== undefined}>
            <span class="zen-truncate zen-text-xs zen-text-zen-muted-fg">
              {local.locked ? (local.lockedLabel ?? loc.t("tile.locked")) : local.subtitle}
            </span>
          </Show>
        </Show>
      </span>
      <Show when={local.locked}>
        <Icon name="lock" size={14} class="zen-shrink-0 zen-text-zen-muted-fg" />
      </Show>
    </>
  );

  return (
    <Switch
      fallback={
        <div data-tile="" class={classes()} aria-busy={local.loading || undefined} aria-disabled={local.disabled || undefined}>
          <Body />
        </div>
      }
    >
      <Match when={local.href && !local.disabled}>
        <Dynamic
          component={local.as ?? "a"}
          data-tile=""
          href={local.href}
          class={classes()}
          aria-busy={local.loading || undefined}
          onClick={local.onClick}
        >
          <Body />
        </Dynamic>
      </Match>
      <Match when={local.onClick || (local.href && local.disabled)}>
        <button
          type="button"
          data-tile=""
          class={classes()}
          disabled={local.disabled}
          aria-busy={local.loading || undefined}
          onClick={(e) => local.onClick?.(e)}
        >
          <Body />
        </button>
      </Match>
    </Switch>
  );
};

export type TileGridProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class"> & {
  class?: string;
  children?: JSX.Element;
  /** The narrowest a tile gets before the grid drops a column. Default: --zen-tile-min-width. */
  minTileWidth?: string;
};

/**
 * Tiles in responsive columns, one tab stop for all of them. The tab stop is
 * the tile last focused; the arrows move it.
 */
export const TileGrid = (props: TileGridProps) => {
  const [local, rest] = splitProps(props, ["class", "children", "minTileWidth", "style"]);
  let grid: HTMLDivElement | undefined;

  const tiles = () =>
    grid
      ? [...grid.querySelectorAll<HTMLElement>("[data-tile]")].filter(
          (t) => t.tagName !== "DIV" && !(t as HTMLButtonElement).disabled,
        )
      : [];
  // One tab stop: the tile that had focus last (the first, to begin with).
  let current: HTMLElement | null = null;
  const settleTabStops = () => {
    const list = tiles();
    if (!current || !list.includes(current)) current = list[0] ?? null;
    for (const t of list) t.tabIndex = t === current ? 0 : -1;
  };

  // Columns as laid out: the tiles that share the first tile's row.
  const columns = (list: HTMLElement[]) => {
    const top = list[0]?.offsetTop;
    const n = list.filter((t) => t.offsetTop === top).length;
    return Math.max(1, n);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const list = tiles();
    const from = list.indexOf(e.target as HTMLElement);
    if (from < 0) return;
    const rtl = getComputedStyle(grid!).direction === "rtl";
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
    current = target;
    settleTabStops();
    target.focus();
  };
  const onFocusIn = (e: FocusEvent) => {
    const t = (e.target as Element).closest?.("[data-tile]") as HTMLElement | null;
    if (t && tiles().includes(t) && t !== current) {
      current = t;
      settleTabStops();
    }
  };

  onMount(() => {
    if (!grid) return;
    settleTabStops();
    // Tiles come and go (a list that loads, a search that filters): the one
    // tab stop is kept.
    const mo = new MutationObserver(settleTabStops);
    mo.observe(grid, { childList: true, subtree: true });
    onCleanup(() => mo.disconnect());
  });

  return (
    <div
      ref={grid}
      role="group"
      // Full width: in a flex row (most app layouts) a grid otherwise shrinks
      // to one tile and never lays out a second column.
      class={cn("zen-grid zen-w-full zen-gap-3", local.class)}
      style={{
        "grid-template-columns": `repeat(auto-fill, minmax(min(100%, ${local.minTileWidth ?? "var(--zen-tile-min-width)"}), 1fr))`,
        ...(typeof local.style === "object" ? local.style : {}),
      }}
      onKeyDown={onKeyDown}
      onFocusIn={onFocusIn}
      {...rest}
    >
      {local.children}
    </div>
  );
};
