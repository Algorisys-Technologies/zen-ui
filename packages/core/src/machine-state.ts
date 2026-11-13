/**
 * Machine state — the shared vocabulary for shop-floor components.
 *
 *   bun run check:machine-state
 *
 * Each state answers two questions, kept apart on purpose:
 *
 *   tone      — the colour it is drawn in. Six tones, each a `--zen-state-*`
 *               token, so a plant can retheme "down" without restyling form
 *               errors.
 *   category  — how OEE counts the time. A board that colours a machine one
 *               way while the OEE report counts it another is two screens in
 *               disagreement in front of the people who reconcile them, so
 *               every component reads both from here.
 *
 * WAITING (starved or blocked) is drawn and counted as a stop. It is quiet, and
 * quiet reads as fine; it is lost time.
 *
 * A vocabulary that is not this one (PackML's Held / Suspended, a plant's own
 * "Starved") does not need to be squeezed into it: StatePill takes a `tone`
 * and a label instead of a `state`.
 */
import type { MessageKey } from "./messages";

/** The states, in the order a legend or a picker lists them. */
export const MACHINE_STATES = [
  "running",
  "idle",
  "stopped",
  "fault",
  "waiting",
  "setup",
  "cleaning",
  "maintenance",
  "unknown",
] as const;

export type MachineState = (typeof MACHINE_STATES)[number];

/** The colour a state is drawn in — one `--zen-state-<tone>` token family each. */
export type MachineStateTone = "running" | "down" | "setup" | "planned" | "idle" | "unknown";

/**
 * How OEE counts the time.
 *
 * - `productive` — running.
 * - `unplanned-loss` — an availability loss nobody scheduled.
 * - `changeover` — setup; also an availability loss, but a planned one.
 * - `planned-stop` — cleaning and planned maintenance: taken out of planned
 *   production time rather than counted against availability.
 * - `no-demand` — idle with nothing to make: not scheduled, not a loss.
 * - `no-data` — nothing has been heard. Not counted as anything, because any
 *   category would state something about minutes nobody knows about.
 */
export type MachineStateCategory =
  | "productive"
  | "unplanned-loss"
  | "changeover"
  | "planned-stop"
  | "no-demand"
  | "no-data";

const TABLE: Record<MachineState, { tone: MachineStateTone; category: MachineStateCategory }> = {
  running: { tone: "running", category: "productive" },
  idle: { tone: "idle", category: "no-demand" },
  stopped: { tone: "down", category: "unplanned-loss" },
  fault: { tone: "down", category: "unplanned-loss" },
  waiting: { tone: "down", category: "unplanned-loss" },
  setup: { tone: "setup", category: "changeover" },
  cleaning: { tone: "planned", category: "planned-stop" },
  maintenance: { tone: "planned", category: "planned-stop" },
  unknown: { tone: "unknown", category: "no-data" },
};

export function isMachineState(value: string): value is MachineState {
  return Object.prototype.hasOwnProperty.call(TABLE, value);
}

export function machineStateTone(state: MachineState): MachineStateTone {
  return TABLE[state].tone;
}

export function machineStateCategory(state: MachineState): MachineStateCategory {
  return TABLE[state].category;
}

/** Time that counts against availability: unplanned stops and changeovers. */
export function isAvailabilityLoss(state: MachineState): boolean {
  const c = TABLE[state].category;
  return c === "unplanned-loss" || c === "changeover";
}

/** The catalogue key for a state's label ("Running", "No data", …). */
export function machineStateMessageKey(state: MachineState): MessageKey {
  return `machineState.${state}` as MessageKey;
}
