import { type JSX, For, Show, createSignal, onCleanup, splitProps } from "solid-js";
import { machineStateMessageKey, machineStateTone, type MachineState, type MachineStateTone } from "@algorisys/zen-ui-core/machine-state";
import { andonShowsClock, boardFreshness, sortAndonTiles, DEFAULT_ANDON_STALE_MS } from "@algorisys/zen-ui-core/andon";
import { durationMessage } from "@algorisys/zen-ui-core/state-timeline";
import { cn } from "../../lib/cn";
import { useLocale } from "../locale/locale";

/**
 * AndonTile / AndonBoard — the plant board, read from across the room.
 *
 *   <AndonBoard
 *     lastUpdated={fetchedAt()}
 *     items={machines().map((m) => ({ id: m.id, name: m.name, line: m.line,
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

/** A clock that advances every second while something reads it. */
function useSecondClock() {
  const [now, setNow] = createSignal(Date.now());
  const timer = setInterval(() => setNow(Date.now()), 1000);
  onCleanup(() => clearInterval(timer));
  return now;
}

export type AndonTileProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children" | "onClick"> & {
  item: AndonItem;
  /** The time the clock counts to. Defaults to a clock of the tile's own. */
  now?: Date | number;
  /** Makes the tile a button. */
  onClick?: (item: AndonItem) => void;
};

export const AndonTile = (props: AndonTileProps) => {
  const [local, rest] = splitProps(props, ["item", "now", "onClick", "class"]);
  const loc = useLocale();
  // Always created, read only while `now` is not given: deciding at setup
  // would freeze a tile whose `now` prop came or went later.
  const own = useSecondClock();
  const now = () => +(local.now ?? own());
  const tone = () => local.item.tone ?? machineStateTone(local.item.state);
  const stateText = () => loc.t(machineStateMessageKey(local.item.state));
  const elapsed = () => {
    const since = local.item.since;
    if (since === undefined || !andonShowsClock(local.item.state)) return null;
    const d = durationMessage(Math.max(0, now() - +since));
    return loc.t(d.key, d.values);
  };
  const body = () => (
    <>
      <span class="zen-flex zen-flex-col">
        <span class="zen-text-lg zen-font-semibold zen-leading-tight zen-text-zen-foreground">{local.item.name}</span>
        <Show when={local.item.line}>
          {/* Foreground, not muted: muted-fg is tuned for a plain background
              and fell to 4.17:1 over the tinted tile in the blue theme. */}
          <span class="zen-text-xs zen-text-zen-foreground">{local.item.line}</span>
        </Show>
      </span>
      <span class={cn("zen-text-xl zen-font-bold zen-uppercase zen-tracking-wide zen-leading-tight", TEXT[tone()])}>
        {stateText()}
      </span>
      <Show when={local.item.cause}>
        <span class="zen-text-sm zen-text-zen-foreground">{local.item.cause}</span>
      </Show>
      <Show when={elapsed()}>
        {(text) => (
          <span class={cn("zen-mt-auto zen-text-3xl zen-font-bold zen-tabular-nums zen-leading-none", TEXT[tone()])}>{text()}</span>
        )}
      </Show>
    </>
  );
  const frame = () =>
    cn(
      "zen-flex zen-h-full zen-w-full zen-min-h-36 zen-flex-col zen-items-start zen-gap-1.5 zen-rounded-zen-md zen-p-4 zen-text-start",
      // The whole frame in the state's colour, over a wash of it: readable at a
      // distance from either cue, and the label says it in words as well.
      "zen-border-2 zen-border-solid",
      FRAME[tone()],
      local.class,
    );
  return (
    <Show
      when={local.onClick}
      fallback={
        <div data-tone={tone()} class={frame()} {...rest}>
          {body()}
        </div>
      }
    >
      {(click) => (
        <button
          type="button"
          data-tone={tone()}
          class={cn(
            frame(),
            "zen-cursor-pointer hover:zen-brightness-95 focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
          )}
          onClick={() => click()(local.item)}
          {...(rest as JSX.ButtonHTMLAttributes<HTMLButtonElement>)}
        >
          {body()}
        </button>
      )}
    </Show>
  );
};

export type AndonBoardProps = Omit<JSX.HTMLAttributes<HTMLElement>, "children"> & {
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

export const AndonBoard = (props: AndonBoardProps) => {
  const [local, rest] = splitProps(props, [
    "items",
    "lastUpdated",
    "staleAfterMs",
    "sort",
    "now",
    "onTileClick",
    "label",
    "class",
  ]);
  const loc = useLocale();
  const clock = useSecondClock();
  const now = () => +(local.now ?? clock());
  const items = () => (local.sort ? sortAndonTiles(local.items) : local.items);
  const fresh = () => boardFreshness(local.lastUpdated, now(), local.staleAfterMs ?? DEFAULT_ANDON_STALE_MS);
  const age = (msOld: number) => {
    const d = durationMessage(msOld);
    return loc.t(d.key, d.values);
  };

  return (
    <section
      aria-label={local.label ?? loc.t("andon.board")}
      data-stale={fresh().stale ? "" : undefined}
      class={cn("zen-flex zen-flex-col zen-gap-3", local.class)}
      {...rest}
    >
      <Show when={fresh().stale}>
        <p
          role="status"
          class="zen-m-0 zen-rounded-zen-md zen-border zen-border-solid zen-border-zen-warning zen-bg-zen-warning-soft zen-px-4 zen-py-3 zen-text-base zen-font-semibold zen-text-zen-warning-soft-fg"
        >
          {loc.t("andon.stale", { age: age(fresh().ageMs ?? 0) })}
        </p>
      </Show>
      <ul
        // Greyscale, not faded: the last known state is still worth reading
        // while the banner says how old it is.
        class={cn("zen-m-0 zen-grid zen-list-none zen-gap-3 zen-p-0", fresh().stale && "zen-grayscale")}
        style={{
          "grid-template-columns": "repeat(auto-fill, minmax(min(var(--zen-andon-tile-min-width), 100%), 1fr))",
        }}
      >
        <For each={items()}>
          {(item) => (
            <li class="zen-m-0">
              <AndonTile item={item} now={now()} onClick={local.onTileClick} />
            </li>
          )}
        </For>
      </ul>
      <Show when={!fresh().stale && fresh().ageMs !== null}>
        <p class="zen-m-0 zen-text-xs zen-text-zen-muted-fg zen-tabular-nums">
          {(fresh().ageMs ?? 0) < 5_000 ? loc.t("andon.justNow") : loc.t("andon.updated", { age: age(fresh().ageMs ?? 0) })}
        </p>
      </Show>
    </section>
  );
};
