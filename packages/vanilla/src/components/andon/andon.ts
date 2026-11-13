import {
  machineStateMessageKey,
  machineStateTone,
  type MachineState,
  type MachineStateTone,
} from "@algorisys/zen-ui-core/machine-state";
import { andonShowsClock, boardFreshness, sortAndonTiles, DEFAULT_ANDON_STALE_MS } from "@algorisys/zen-ui-core/andon";
import { durationMessage } from "@algorisys/zen-ui-core/state-timeline";
import { cn } from "../../lib/cn";
import { applyProps, Disposer, type BaseProps, type ZenComponent } from "../../lib/component";
import { useLocale, withLocale } from "../locale/locale";

/**
 * AndonTile / AndonBoard — the plant board, read from across the room.
 *
 *   AndonBoard({
 *     lastUpdated: fetchedAt,
 *     items: machines.map((m) => ({ id: m.id, name: m.name, line: m.line,
 *       state: m.state, cause: m.cause, since: m.stateSince })),
 *     onTileClick: (item) => navigate(`/machines/${item.id}`),
 *   }).el
 *
 * Vanilla port of the React reference; same DOM, classes and message keys.
 *
 * A tile carries a colour, a state in words, a cause and a clock — nothing that
 * needs a cursor to interpret. The clock measures trouble, not uptime: running
 * and idle tiles have none.
 *
 * The board says when it has stopped updating. Pass `lastUpdated` (the time of
 * the last SUCCESSFUL refresh); past `staleAfterMs` the tiles grey out and a
 * banner says how old they are, because a frozen board is indistinguishable
 * from a calm plant.
 *
 * Tiles keep the order given unless `sort` is set: on a wall board people find
 * a machine by where it always is, and tiles that move with every change break
 * that. `sort` puts trouble first instead, for a "needs attention" view.
 *
 * Each runs a one-second clock only while `now` is not given; the board drives
 * its tiles with its own, so a board of forty tiles has one timer, not forty.
 * `destroy()` stops it.
 */

export interface AndonItem {
  id: string;
  /** The machine or station. */
  name: string;
  /** Where it is — a line or cell — shown under the name. */
  line?: string;
  state: MachineState;
  /** Overrides the state's tone. */
  tone?: MachineStateTone;
  /** Why ("Jam at infeed"). Shown under the state. */
  cause?: string;
  /** When it entered this state. Drives the clock. */
  since?: Date | number;
}

const FRAME: Record<MachineStateTone, string> = {
  running: "zen-bg-zen-state-running-soft zen-border-zen-state-running",
  down: "zen-bg-zen-state-down-soft zen-border-zen-state-down",
  setup: "zen-bg-zen-state-setup-soft zen-border-zen-state-setup",
  planned: "zen-bg-zen-state-planned-soft zen-border-zen-state-planned",
  idle: "zen-bg-zen-state-idle-soft zen-border-zen-state-idle",
  unknown: "zen-bg-zen-state-unknown-soft zen-border-zen-state-unknown zen-border-dashed",
};

const TEXT: Record<MachineStateTone, string> = {
  running: "zen-text-zen-state-running-soft-fg",
  down: "zen-text-zen-state-down-soft-fg",
  setup: "zen-text-zen-state-setup-soft-fg",
  planned: "zen-text-zen-state-planned-soft-fg",
  idle: "zen-text-zen-state-idle-soft-fg",
  unknown: "zen-text-zen-state-unknown-soft-fg",
};

/**
 * A one-second clock that runs only while the component's `now` is not given.
 * `sync()` is called on every update, so a `now` that comes or goes later
 * starts or stops it.
 */
function secondClock(isPinned: () => boolean, onTick: () => void) {
  let value = Date.now();
  let timer: ReturnType<typeof setInterval> | undefined;
  const stop = () => {
    clearInterval(timer);
    timer = undefined;
  };
  return {
    now: () => value,
    sync() {
      if (!isPinned() && timer === undefined) {
        value = Date.now();
        timer = setInterval(() => {
          value = Date.now();
          onTick();
        }, 1000);
      } else if (isPinned()) stop();
    },
    stop,
  };
}

export interface AndonTileProps extends Omit<BaseProps, "children"> {
  item: AndonItem;
  /** The time the clock counts to. Defaults to a clock of the tile's own. */
  now?: Date | number;
  /** Makes the tile a button. */
  onClick?: (item: AndonItem) => void;
}

/**
 * A `<div>`, or a `<button>` when `onClick` is given. Which one is decided when
 * the tile is built: `update({ onClick })` that crosses between the two swaps
 * the root element in place (the handle's `el` follows).
 */
export function AndonTile(props: AndonTileProps): ZenComponent<AndonTileProps> {
  let current: AndonTileProps = { ...props };
  const loc = useLocale();
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  const clock = secondClock(
    () => current.now !== undefined,
    () => render(),
  );
  disposer.add(clock.stop);

  let el: HTMLElement = document.createElement(current.onClick ? "button" : "div");
  const onClick = () => current.onClick?.(current.item);

  const render = () => {
    const { item, now: nowProp, onClick: clickProp, class: className, ...rest } = current;

    // The element kind follows `onClick`; swap it if it no longer matches.
    const wantButton = clickProp !== undefined;
    if (wantButton !== el instanceof HTMLButtonElement) {
      const next = document.createElement(wantButton ? "button" : "div");
      el.removeEventListener("click", onClick);
      el.replaceWith(next);
      el = next;
    }

    const now = +(nowProp ?? clock.now());
    const tone = item.tone ?? machineStateTone(item.state);
    let elapsed: string | null = null;
    if (item.since !== undefined && andonShowsClock(item.state)) {
      const d = durationMessage(Math.max(0, now - +item.since));
      elapsed = loc.t(d.key, d.values);
    }

    const head = document.createElement("span");
    head.className = "zen-flex zen-flex-col";
    const name = document.createElement("span");
    name.className = "zen-text-lg zen-font-semibold zen-leading-tight zen-text-zen-foreground";
    name.textContent = item.name;
    head.append(name);
    if (item.line) {
      // Foreground, not muted: muted-fg is tuned for a plain background
      // and fell to 4.17:1 over the tinted tile in the blue theme.
      const line = document.createElement("span");
      line.className = "zen-text-xs zen-text-zen-foreground";
      line.textContent = item.line;
      head.append(line);
    }
    const state = document.createElement("span");
    state.className = cn("zen-text-xl zen-font-bold zen-uppercase zen-tracking-wide zen-leading-tight", TEXT[tone]);
    state.textContent = loc.t(machineStateMessageKey(item.state));
    const body: HTMLElement[] = [head, state];
    if (item.cause) {
      const cause = document.createElement("span");
      cause.className = "zen-text-sm zen-text-zen-foreground";
      cause.textContent = item.cause;
      body.push(cause);
    }
    if (elapsed) {
      const clockEl = document.createElement("span");
      clockEl.className = cn("zen-mt-auto zen-text-3xl zen-font-bold zen-tabular-nums zen-leading-none", TEXT[tone]);
      clockEl.textContent = elapsed;
      body.push(clockEl);
    }

    const frame = cn(
      "zen-flex zen-h-full zen-w-full zen-min-h-36 zen-flex-col zen-items-start zen-gap-1.5 zen-rounded-zen-md zen-p-4 zen-text-start",
      // The whole frame in the state's colour, over a wash of it: readable at a
      // distance from either cue, and the label says it in words as well.
      "zen-border-2 zen-border-solid",
      FRAME[tone],
      className,
    );
    el.dataset.tone = tone;
    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
    if (el instanceof HTMLButtonElement) {
      el.type = "button";
      el.className = cn(
        frame,
        "zen-cursor-pointer hover:zen-brightness-95 focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
      );
      el.removeEventListener("click", onClick);
      el.addEventListener("click", onClick);
    } else {
      el.className = frame;
    }
    el.replaceChildren(...body);
  };

  disposer.add(() => removeProps?.());
  disposer.add(() => el.removeEventListener("click", onClick));
  clock.sync();
  render();

  return {
    get el() {
      return el;
    },
    update(next) {
      current = { ...current, ...next };
      clock.sync();
      render();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}

export interface AndonBoardProps extends Omit<BaseProps, "children"> {
  items: AndonItem[];
  /** Time of the last SUCCESSFUL refresh. Without it the board cannot tell it is stale. */
  lastUpdated?: Date | number;
  /** How old data may get before the board says so. Default 2 minutes. */
  staleAfterMs?: number;
  /** Trouble first (down, no data, setup, planned, idle, running; longest first). Default: the order given. */
  sort?: boolean;
  /** Pins the clock, for tests and screenshots. */
  now?: Date | number;
  onTileClick?: (item: AndonItem) => void;
  /** Names the board. Defaults to "Plant status". */
  label?: string;
}

export function AndonBoard(props: AndonBoardProps): ZenComponent<AndonBoardProps> {
  let current: AndonBoardProps = { ...props };
  const loc = useLocale();
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;
  let tiles = new Map<string, ZenComponent<AndonTileProps>>();

  const clock = secondClock(
    () => current.now !== undefined,
    () => render(),
  );
  disposer.add(clock.stop);

  const el = document.createElement("section");
  const banner = document.createElement("p");
  banner.setAttribute("role", "status");
  banner.className =
    "zen-m-0 zen-rounded-zen-md zen-border zen-border-solid zen-border-zen-warning zen-bg-zen-warning-soft zen-px-4 zen-py-3 zen-text-base zen-font-semibold zen-text-zen-warning-soft-fg";
  const list = document.createElement("ul");
  list.style.gridTemplateColumns = "repeat(auto-fill, minmax(min(var(--zen-andon-tile-min-width), 100%), 1fr))";
  const footer = document.createElement("p");
  footer.className = "zen-m-0 zen-text-xs zen-text-zen-muted-fg zen-tabular-nums";

  const render = () => {
    const {
      items: itemsInput,
      lastUpdated,
      staleAfterMs,
      sort,
      now: nowProp,
      onTileClick,
      label,
      class: className,
      ...rest
    } = current;
    const now = +(nowProp ?? clock.now());
    const items = sort ? sortAndonTiles(itemsInput) : itemsInput;
    const fresh = boardFreshness(lastUpdated, now, staleAfterMs ?? DEFAULT_ANDON_STALE_MS);
    const age = (msOld: number) => {
      const d = durationMessage(msOld);
      return loc.t(d.key, d.values);
    };

    el.setAttribute("aria-label", label ?? loc.t("andon.board"));
    if (fresh.stale) el.setAttribute("data-stale", "");
    else el.removeAttribute("data-stale");
    el.className = cn("zen-flex zen-flex-col zen-gap-3", className);
    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);

    // Greyscale, not faded: the last known state is still worth reading
    // while the banner says how old it is.
    list.className = cn("zen-m-0 zen-grid zen-list-none zen-gap-3 zen-p-0", fresh.stale && "zen-grayscale");
    // Keyed on id and updated in place, so a tick does not rebuild the tiles
    // and a keyboard user's focus on one survives it.
    const next = new Map<string, ZenComponent<AndonTileProps>>();
    for (const item of items) {
      const had = tiles.get(item.id);
      if (had) {
        had.update({ item, now, onClick: onTileClick });
        next.set(item.id, had);
      } else {
        next.set(item.id, withLocale(loc, () => AndonTile({ item, now, onClick: onTileClick })));
      }
    }
    for (const [id, t] of tiles) if (!next.has(id)) t.destroy();
    tiles = next;
    const rows = [...tiles.values()].map((t) => {
      const li = (t.el.parentElement as HTMLLIElement | null) ?? document.createElement("li");
      li.className = "zen-m-0";
      if (t.el.parentElement !== li) li.append(t.el);
      return li;
    });
    list.replaceChildren(...rows);

    const children: HTMLElement[] = [];
    if (fresh.stale) {
      banner.textContent = loc.t("andon.stale", { age: age(fresh.ageMs ?? 0) });
      children.push(banner);
    }
    children.push(list);
    if (!fresh.stale && fresh.ageMs !== null) {
      footer.textContent =
        (fresh.ageMs ?? 0) < 5_000 ? loc.t("andon.justNow") : loc.t("andon.updated", { age: age(fresh.ageMs ?? 0) });
      children.push(footer);
    }
    el.replaceChildren(...children);
  };

  disposer.add(() => removeProps?.());
  disposer.add(() => {
    for (const t of tiles.values()) t.destroy();
    tiles.clear();
  });
  clock.sync();
  render();

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      clock.sync();
      render();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}
