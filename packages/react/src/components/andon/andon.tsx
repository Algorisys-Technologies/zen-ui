import * as React from "react";
import { machineStateMessageKey, machineStateTone, type MachineState, type MachineStateTone } from "@algorisys/zen-ui-core/machine-state";
import { andonShowsClock, boardFreshness, sortAndonTiles, DEFAULT_ANDON_STALE_MS } from "@algorisys/zen-ui-core/andon";
import { durationMessage } from "@algorisys/zen-ui-core/state-timeline";
import { cn } from "../../lib/cn";
import { useLocale } from "../locale/locale";

/**
 * AndonTile / AndonBoard — the plant board, read from across the room.
 *
 *   <AndonBoard
 *     lastUpdated={fetchedAt}
 *     items={machines.map((m) => ({ id: m.id, name: m.name, line: m.line,
 *       state: m.state, cause: m.cause, since: m.stateSince }))}
 *     onTileClick={(item) => navigate(`/machines/${item.id}`)}
 *   />
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
 * A clock that advances every second while `enabled`. Keyed on `enabled`
 * rather than decided once, so a tile whose `now` prop comes or goes later
 * starts or stops its own clock.
 */
function useSecondClock(enabled: boolean) {
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    if (!enabled) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [enabled]);
  return now;
}

export type AndonTileProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "onClick"> & {
  item: AndonItem;
  /** The time the clock counts to. Defaults to a clock of the tile's own. */
  now?: Date | number;
  /** Makes the tile a button. */
  onClick?: (item: AndonItem) => void;
};

/** A `<div>`, or a `<button>` when `onClick` is given — the ref follows. */
const AndonTile = React.forwardRef<HTMLElement, AndonTileProps>(
  ({ item, now: nowProp, onClick, className, ...rest }, ref) => {
    const loc = useLocale();
    const own = useSecondClock(nowProp === undefined);
    const now = +(nowProp ?? own);
    const tone = item.tone ?? machineStateTone(item.state);
    const stateText = loc.t(machineStateMessageKey(item.state));
    let elapsed: string | null = null;
    if (item.since !== undefined && andonShowsClock(item.state)) {
      const d = durationMessage(Math.max(0, now - +item.since));
      elapsed = loc.t(d.key, d.values);
    }
    const body = (
      <>
        <span className="zen-flex zen-flex-col">
          <span className="zen-text-lg zen-font-semibold zen-leading-tight zen-text-zen-foreground">{item.name}</span>
          {item.line ? (
            // Foreground, not muted: muted-fg is tuned for a plain background
            // and fell to 4.17:1 over the tinted tile in the blue theme.
            <span className="zen-text-xs zen-text-zen-foreground">{item.line}</span>
          ) : null}
        </span>
        <span className={cn("zen-text-xl zen-font-bold zen-uppercase zen-tracking-wide zen-leading-tight", TEXT[tone])}>
          {stateText}
        </span>
        {item.cause ? <span className="zen-text-sm zen-text-zen-foreground">{item.cause}</span> : null}
        {elapsed ? (
          <span className={cn("zen-mt-auto zen-text-3xl zen-font-bold zen-tabular-nums zen-leading-none", TEXT[tone])}>{elapsed}</span>
        ) : null}
      </>
    );
    const frame = cn(
      "zen-flex zen-h-full zen-w-full zen-min-h-36 zen-flex-col zen-items-start zen-gap-1.5 zen-rounded-zen-md zen-p-4 zen-text-start",
      // The whole frame in the state's colour, over a wash of it: readable at a
      // distance from either cue, and the label says it in words as well.
      "zen-border-2 zen-border-solid",
      FRAME[tone],
      className,
    );
    if (!onClick) {
      return (
        <div ref={ref as React.Ref<HTMLDivElement>} data-tone={tone} className={frame} {...rest}>
          {body}
        </div>
      );
    }
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        data-tone={tone}
        className={cn(
          frame,
          "zen-cursor-pointer hover:zen-brightness-95 focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
        )}
        {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        onClick={() => onClick(item)}
      >
        {body}
      </button>
    );
  },
);
AndonTile.displayName = "AndonTile";

export type AndonBoardProps = Omit<React.HTMLAttributes<HTMLElement>, "children"> & {
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
};

const AndonBoard = React.forwardRef<HTMLElement, AndonBoardProps>(
  ({ items: itemsInput, lastUpdated, staleAfterMs, sort, now: nowProp, onTileClick, label, className, ...rest }, ref) => {
    const loc = useLocale();
    const clock = useSecondClock(nowProp === undefined);
    const now = +(nowProp ?? clock);
    const items = React.useMemo(() => (sort ? sortAndonTiles(itemsInput) : itemsInput), [sort, itemsInput]);
    const fresh = boardFreshness(lastUpdated, now, staleAfterMs ?? DEFAULT_ANDON_STALE_MS);
    const age = (msOld: number) => {
      const d = durationMessage(msOld);
      return loc.t(d.key, d.values);
    };

    return (
      <section
        ref={ref}
        aria-label={label ?? loc.t("andon.board")}
        data-stale={fresh.stale ? "" : undefined}
        className={cn("zen-flex zen-flex-col zen-gap-3", className)}
        {...rest}
      >
        {fresh.stale ? (
          <p
            role="status"
            className="zen-m-0 zen-rounded-zen-md zen-border zen-border-solid zen-border-zen-warning zen-bg-zen-warning-soft zen-px-4 zen-py-3 zen-text-base zen-font-semibold zen-text-zen-warning-soft-fg"
          >
            {loc.t("andon.stale", { age: age(fresh.ageMs ?? 0) })}
          </p>
        ) : null}
        <ul
          // Greyscale, not faded: the last known state is still worth reading
          // while the banner says how old it is.
          className={cn("zen-m-0 zen-grid zen-list-none zen-gap-3 zen-p-0", fresh.stale && "zen-grayscale")}
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(min(var(--zen-andon-tile-min-width), 100%), 1fr))",
          }}
        >
          {items.map((item) => (
            <li key={item.id} className="zen-m-0">
              <AndonTile item={item} now={now} onClick={onTileClick} />
            </li>
          ))}
        </ul>
        {!fresh.stale && fresh.ageMs !== null ? (
          <p className="zen-m-0 zen-text-xs zen-text-zen-muted-fg zen-tabular-nums">
            {(fresh.ageMs ?? 0) < 5_000 ? loc.t("andon.justNow") : loc.t("andon.updated", { age: age(fresh.ageMs ?? 0) })}
          </p>
        ) : null}
      </section>
    );
  },
);
AndonBoard.displayName = "AndonBoard";

export { AndonTile, AndonBoard };
