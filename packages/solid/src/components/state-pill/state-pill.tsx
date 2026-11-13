import { type JSX, splitProps } from "solid-js";
import {
  machineStateMessageKey,
  machineStateTone,
  type MachineState,
  type MachineStateTone,
} from "@algorisys/zen-ui-core/machine-state";
import { cn } from "../../lib/cn";
import { useLocale } from "../locale/locale";

/**
 * StatePill — a machine's (or line's, or station's) state as a labelled pill.
 *
 *   <StatePill state="running" />                 // "Running", in the running tone
 *   <StatePill state="stopped">Jam at infeed</StatePill>
 *   <StatePill tone="down">Starved</StatePill>    // a state that is not ours
 *
 * The label is always drawn: colour alone must not carry the state, and red
 * and green are the pair colour-blind operators most often cannot tell apart.
 * `unknown` is a dashed outline with no fill — nothing has been heard from the
 * machine, and a solid colour would claim something about those minutes.
 *
 * Colours are the `--zen-state-<tone>` tokens; retheme a tone there, not here.
 */

export type StatePillSize = "sm" | "md";

export type StatePillProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "children"> & {
  /** One of the shared machine states. Gives both the colour and the label. */
  state?: MachineState;
  /**
   * The colour, for a state outside the shared vocabulary (PackML's "Held", a
   * plant's own "Starved"). Wins over the tone `state` would give.
   */
  tone?: MachineStateTone;
  size?: StatePillSize;
  /** The label. Defaults to the state's own ("Running", "No data", …). */
  children?: JSX.Element;
};

// Whole class strings per tone: UnoCSS only generates what it can read.
const PILL: Record<MachineStateTone, string> = {
  running: "zen-bg-zen-state-running-soft zen-text-zen-state-running-soft-fg",
  down: "zen-bg-zen-state-down-soft zen-text-zen-state-down-soft-fg",
  setup: "zen-bg-zen-state-setup-soft zen-text-zen-state-setup-soft-fg",
  planned: "zen-bg-zen-state-planned-soft zen-text-zen-state-planned-soft-fg",
  idle: "zen-bg-zen-state-idle-soft zen-text-zen-state-idle-soft-fg",
  unknown:
    "zen-bg-zen-state-unknown-soft zen-text-zen-state-unknown-soft-fg zen-border zen-border-dashed zen-border-zen-state-unknown",
};

const DOT: Record<MachineStateTone, string> = {
  running: "zen-bg-zen-state-running",
  down: "zen-bg-zen-state-down",
  setup: "zen-bg-zen-state-setup",
  planned: "zen-bg-zen-state-planned",
  idle: "zen-bg-zen-state-idle",
  unknown: "zen-border zen-border-solid zen-border-zen-state-unknown",
};

const SIZE: Record<StatePillSize, { pill: string; dot: string }> = {
  sm: { pill: "zen-gap-1 zen-px-1.5 zen-py-px zen-text-xs", dot: "zen-h-1.5 zen-w-1.5" },
  md: { pill: "zen-gap-1.5 zen-px-2 zen-py-0.5 zen-text-sm", dot: "zen-h-2 zen-w-2" },
};

export const StatePill = (props: StatePillProps) => {
  const [local, rest] = splitProps(props, ["state", "tone", "size", "class", "children"]);
  const loc = useLocale();
  const tone = (): MachineStateTone =>
    local.tone ?? (local.state ? machineStateTone(local.state) : "unknown");
  const size = () => SIZE[local.size ?? "md"];
  return (
    <span
      data-tone={tone()}
      data-state={local.state}
      class={cn(
        "zen-inline-flex zen-items-center zen-whitespace-nowrap zen-rounded-zen-full zen-font-medium zen-leading-tight",
        size().pill,
        PILL[tone()],
        local.class,
      )}
      {...rest}
    >
      <span
        aria-hidden="true"
        class={cn("zen-shrink-0 zen-rounded-zen-full", size().dot, DOT[tone()])}
      />
      {local.children ?? (local.state ? loc.t(machineStateMessageKey(local.state)) : null)}
    </span>
  );
};
