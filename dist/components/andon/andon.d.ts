import * as React from "react";
import { type MachineState, type MachineStateTone } from "../../_core/machine-state";
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
export type AndonTileProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "onClick"> & {
    item: AndonItem;
    /** The time the clock counts to. Defaults to a clock of the tile's own. */
    now?: Date | number;
    /** Makes the tile a button. */
    onClick?: (item: AndonItem) => void;
};
/** A `<div>`, or a `<button>` when `onClick` is given — the ref follows. */
declare const AndonTile: React.ForwardRefExoticComponent<Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "onClick"> & {
    item: AndonItem;
    /** The time the clock counts to. Defaults to a clock of the tile's own. */
    now?: Date | number;
    /** Makes the tile a button. */
    onClick?: (item: AndonItem) => void;
} & React.RefAttributes<HTMLElement>>;
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
declare const AndonBoard: React.ForwardRefExoticComponent<Omit<React.HTMLAttributes<HTMLElement>, "children"> & {
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
} & React.RefAttributes<HTMLElement>>;
export { AndonTile, AndonBoard };
//# sourceMappingURL=andon.d.ts.map