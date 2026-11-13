/**
 * Machine-state contract.
 *
 *   bun run check:machine-state
 *
 * The pure half of StatePill and everything after it on a shop-floor screen
 * (andon tiles, the state timeline, OEE). Two separate questions per state:
 *
 *   tone      — what colour it is drawn in. Six tones, so a plant can retheme
 *               "down" without touching form errors.
 *   category  — how OEE counts the time. This is the one that must not drift:
 *               a board that colours a machine one way while the OEE report
 *               counts it another puts two screens in disagreement in front of
 *               the people who have to reconcile them.
 *
 * WAITING is the case that gets this wrong most often. A starved or blocked
 * machine is quiet, and quiet reads as fine; it is lost time, so it is down
 * (tone) and an unplanned loss (category), the same as a stop.
 */
import {
  MACHINE_STATES,
  machineStateTone,
  machineStateCategory,
  isAvailabilityLoss,
  isMachineState,
  machineStateMessageKey,
} from "../packages/core/src/machine-state";
import { DEFAULT_MESSAGES } from "../packages/core/src/messages";

let f = 0;
const t = (got: unknown, want: unknown, name: string) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) f++;
  console.log(
    `  ${ok ? "ok  " : "FAIL"} ${name.padEnd(58)} ${ok ? "" : `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`,
  );
};

console.log("\nvocabulary");
t(
  [...MACHINE_STATES],
  ["running", "idle", "stopped", "fault", "waiting", "setup", "cleaning", "maintenance", "unknown"],
  "the nine states, in display order",
);
t(isMachineState("running"), true, "a known state is recognised");
t(isMachineState("RUNNING"), false, "case matters — the vocabulary is lowercase");
t(isMachineState("held"), false, "a foreign state (PackML 'held') is not ours");

console.log("\ntone — what colour each state is drawn in");
const tones = Object.fromEntries(MACHINE_STATES.map((s) => [s, machineStateTone(s)]));
t(tones, {
  running: "running",
  idle: "idle",
  stopped: "down",
  fault: "down",
  waiting: "down",
  setup: "setup",
  cleaning: "planned",
  maintenance: "planned",
  unknown: "unknown",
}, "every state's tone");

console.log("\ncategory — how OEE counts the time");
const cats = Object.fromEntries(MACHINE_STATES.map((s) => [s, machineStateCategory(s)]));
t(cats, {
  running: "productive",
  idle: "no-demand",
  stopped: "unplanned-loss",
  fault: "unplanned-loss",
  waiting: "unplanned-loss",
  setup: "changeover",
  cleaning: "planned-stop",
  maintenance: "planned-stop",
  unknown: "no-data",
}, "every state's category");
t(
  MACHINE_STATES.filter(isAvailabilityLoss),
  ["stopped", "fault", "waiting", "setup"],
  "availability losses: unplanned stops and changeovers",
);
t(isAvailabilityLoss("idle"), false, "idle is no demand, not a loss");
t(isAvailabilityLoss("unknown"), false, "no data is not counted as a loss either");

console.log("\nconsistency between the two questions");
t(
  MACHINE_STATES.filter((s) => machineStateTone(s) === "down").every(
    (s) => machineStateCategory(s) === "unplanned-loss",
  ),
  true,
  "every state drawn as down is counted as an unplanned loss",
);
t(
  MACHINE_STATES.filter((s) => machineStateCategory(s) === "unplanned-loss").every(
    (s) => machineStateTone(s) === "down",
  ),
  true,
  "and every unplanned loss is drawn as down",
);

console.log("\nlabels — every state has an English message");
const missing = MACHINE_STATES.filter((s) => !DEFAULT_MESSAGES[machineStateMessageKey(s)]);
t(missing, [], `message keys exist (${MACHINE_STATES.length} checked)`);
t(DEFAULT_MESSAGES[machineStateMessageKey("unknown")], "No data", "unknown reads as 'No data', not 'Unknown'");

console.log(`\n${f === 0 ? "all passed" : `${f} FAILED`}`);
process.exit(f === 0 ? 0 : 1);
