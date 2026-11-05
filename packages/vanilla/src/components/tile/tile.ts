import { cn } from "../../lib/cn";
import { applyProps, Disposer, toNodes, type BaseProps, type Child, type ZenComponent } from "../../lib/component";
import { Icon } from "../icon/icon";
import { Skeleton } from "../skeleton/skeleton";
import { useLocale } from "../locale/locale";

/**
 * Tile and TileGrid — a launchpad: the apps, modules or records a person
 * starts their work from, each a tile with a mark, a name and a live line
 * under it ("131 records").
 *
 *   TileGrid({ "aria-label": "Accounts", children: [
 *     Tile({ avatar: "SI", title: "Sales Invoice", subtitle: "131 records", href: "/sales-invoice" }),
 *     Tile({ icon: Icon({ name: "book" }), title: "Journal Entry", subtitle: "Open", onClick: open }),
 *     Tile({ avatar: "AS", title: "Asset", locked: true, lockedLabel: "Not in your plan", onClick: explain }),
 *   ] })
 *
 * A tile with `href` is an `<a>`, with `onClick` a button. TileGrid is one tab
 * stop: the arrows move between tiles (up and down by the columns as they are
 * laid out), Home and End to the ends. Enter and Space are the tile's own.
 *
 * No `as`. React and Solid take a router's link component there; with no
 * framework there is no router component to take. A tile with `href` is a
 * real anchor, so a client-side router that intercepts anchor clicks (most
 * do) already sees it, and `onClick` alongside `href` runs on the click as in
 * the other bindings, where `preventDefault()` keeps the browser from
 * navigating if the app wants to route itself.
 */

export interface TileProps {
  /** The tile's name. */
  title: Child;
  /** A live line under the name: a count, a status, "Open". */
  subtitle?: Child;
  /** Up to two letters in a square mark ("SI"). Ignored when `icon` is given. */
  avatar?: string;
  /** An icon in the square mark, in place of `avatar`. */
  icon?: Child;
  /** Makes the tile a link. */
  href?: string;
  /** Makes the tile a button (when it has no href). Runs on a link's click too. */
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
}

const ROOT =
  "zen-group zen-flex zen-w-full zen-items-center zen-gap-3 zen-rounded-zen-md zen-border zen-border-solid zen-border-zen-border zen-bg-zen-background zen-p-3 zen-text-start zen-text-zen-foreground zen-no-underline";
const INTERACTIVE =
  "zen-cursor-pointer zen-transition-colors hover:zen-border-zen-primary hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2";

type Kind = "a" | "button" | "div";
const kindOf = (p: TileProps): Kind =>
  p.href && !p.disabled ? "a" : p.onClick || (p.href && p.disabled) ? "button" : "div";

export function Tile(props: TileProps): ZenComponent<TileProps> {
  // Read the provider building this tile now: the words are rendered later, on update too.
  const loc = useLocale();
  let current: TileProps = { ...props };
  let kind = kindOf(current);
  let el: HTMLElement = document.createElement(kind);
  const disposer = new Disposer();
  // One listener for the life of the element; it reads the CURRENT onClick, so
  // update({ onClick }) needs no rebinding.
  const onClick = (e: Event) => current.onClick?.(e as MouseEvent);
  let unbind = () => {};
  const bind = () => {
    el.addEventListener("click", onClick);
    unbind = () => el.removeEventListener("click", onClick);
  };
  bind();

  const render = () => {
    const { title, subtitle, avatar, icon, href, loading, disabled, locked, lockedLabel, class: className } = current;
    const next = kindOf(current);
    if (next !== kind) {
      // The element a tile IS depends on its props (a link, a button, neither):
      // swap it in place, so whatever holds it (a TileGrid) sees one node change.
      const replacement = document.createElement(next);
      unbind();
      el.replaceWith(replacement);
      el = replacement;
      kind = next;
      bind();
    }
    const interactive = !disabled && Boolean(href || current.onClick);
    el.className = cn(
      ROOT,
      interactive && INTERACTIVE,
      disabled && "zen-cursor-not-allowed zen-opacity-50",
      locked && "zen-border-dashed zen-bg-zen-muted/40",
      className,
    );
    el.setAttribute("data-tile", "");
    if (loading) el.setAttribute("aria-busy", "true");
    else el.removeAttribute("aria-busy");

    if (el instanceof HTMLAnchorElement) {
      el.href = href!;
    } else if (el instanceof HTMLButtonElement) {
      el.type = "button";
      el.disabled = Boolean(disabled);
    } else if (disabled) {
      el.setAttribute("aria-disabled", "true");
    } else {
      el.removeAttribute("aria-disabled");
    }

    const mark = document.createElement("span");
    mark.setAttribute("aria-hidden", "true");
    mark.className = cn(
      "zen-flex zen-h-10 zen-w-10 zen-shrink-0 zen-items-center zen-justify-center zen-rounded-zen-md zen-text-sm zen-font-semibold",
      locked ? "zen-bg-zen-muted zen-text-zen-muted-fg" : "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg",
    );
    mark.append(...(icon ? toNodes(icon) : [document.createTextNode((avatar ?? "").slice(0, 2).toUpperCase())]));

    const text = document.createElement("span");
    text.className = "zen-flex zen-min-w-0 zen-flex-1 zen-flex-col zen-gap-0.5";
    const name = document.createElement("span");
    name.className = cn("zen-truncate zen-text-sm zen-font-medium", locked && "zen-text-zen-muted-fg");
    name.append(...toNodes(title));
    text.append(name);
    if (loading) {
      text.append(Skeleton({ class: "zen-h-3 zen-w-20" }).el);
    } else if (locked || subtitle !== undefined) {
      const sub = document.createElement("span");
      sub.className = "zen-truncate zen-text-xs zen-text-zen-muted-fg";
      sub.append(...(locked ? [document.createTextNode(lockedLabel ?? loc.t("tile.locked"))] : toNodes(subtitle)));
      text.append(sub);
    }

    const kids: Node[] = [mark, text];
    if (locked) kids.push(Icon({ name: "lock", size: 14, class: "zen-shrink-0 zen-text-zen-muted-fg" }).el);
    el.replaceChildren(...kids);
  };

  render();
  disposer.add(() => unbind());
  return {
    get el() {
      return el;
    },
    update(next) {
      current = { ...current, ...next };
      render();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}

export type TileGridProps = BaseProps & {
  /** The narrowest a tile gets before the grid drops a column. Default: --zen-tile-min-width. */
  minTileWidth?: string;
  /** Runs before the grid's own keys; `preventDefault()` there keeps the grid out of it. */
  onKeyDown?: (e: KeyboardEvent) => void;
};

/**
 * Tiles in responsive columns, one tab stop for all of them. The tab stop is
 * the tile last focused; the arrows move it.
 */
export function TileGrid(props: TileGridProps = {}): ZenComponent<TileGridProps> {
  let current: TileGridProps = { ...props };
  const el = document.createElement("div");
  el.setAttribute("role", "group");
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;
  let stop: HTMLElement | null = null;

  const tiles = () =>
    [...el.querySelectorAll<HTMLElement>("[data-tile]")].filter(
      (t) => t.tagName !== "DIV" && !(t as HTMLButtonElement).disabled,
    );
  // One tab stop: the tile that had focus last (the first, to begin with).
  const settle = () => {
    const list = tiles();
    if (!stop || !list.includes(stop)) stop = list[0] ?? null;
    for (const t of list) t.tabIndex = t === stop ? 0 : -1;
  };

  // Columns as laid out: the tiles that share the first tile's row. Measured
  // at the key press, so it survives a column dropping on resize.
  const columns = (list: HTMLElement[]) => {
    const top = list[0]?.offsetTop;
    return Math.max(1, list.filter((t) => t.offsetTop === top).length);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    current.onKeyDown?.(e);
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    const list = tiles();
    const from = list.indexOf(e.target as HTMLElement);
    if (from < 0) return;
    const rtl = getComputedStyle(el).direction === "rtl";
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
    stop = target;
    settle();
    target.focus();
  };
  // focusin bubbles: a tile focused by click or by Tab becomes the tab stop.
  const onFocusIn = (e: FocusEvent) => {
    const t = (e.target as Element).closest?.<HTMLElement>("[data-tile]");
    if (t && t !== stop && tiles().includes(t)) {
      stop = t;
      settle();
    }
  };
  el.addEventListener("keydown", onKeyDown);
  el.addEventListener("focusin", onFocusIn);
  disposer.add(() => el.removeEventListener("keydown", onKeyDown));
  disposer.add(() => el.removeEventListener("focusin", onFocusIn));

  // Tiles come and go (a list that loads, a search that filters, a tile that
  // turns from a link into a button): the one tab stop is kept.
  const mo = new MutationObserver(settle);
  mo.observe(el, { childList: true, subtree: true });
  disposer.add(() => mo.disconnect());

  const render = (withChildren: boolean) => {
    const { class: className, children, minTileWidth, style, onKeyDown: _k, ...rest } = current;
    // Full width: in a flex row (most app layouts) a grid otherwise shrinks to
    // one tile and never lays out a second column.
    el.className = cn("zen-grid zen-w-full zen-gap-3", className);
    el.removeAttribute("style");
    el.style.gridTemplateColumns = `repeat(auto-fill, minmax(min(100%, ${minTileWidth ?? "var(--zen-tile-min-width)"}), 1fr))`;
    removeProps?.();
    removeProps = applyProps(el, { ...rest, style } as Record<string, unknown>);
    // Children only when given: an update of other props leaves the tiles alone.
    if (withChildren) el.replaceChildren(...toNodes(children));
    // The observer reports a microtask later; the tab stop is right from the start.
    settle();
  };

  render(true);
  disposer.add(() => removeProps?.());
  return {
    el,
    update(next) {
      current = { ...current, ...next };
      render("children" in next);
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}
