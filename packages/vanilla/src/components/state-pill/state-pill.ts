import {
  machineStateMessageKey,
  machineStateTone,
  type MachineState,
  type MachineStateTone,
} from "@algorisys/zen-ui-core/machine-state";
import { cn } from "../../lib/cn";
import { applyProps, Disposer, toNodes, type BaseProps, type ZenComponent } from "../../lib/component";
import { useLocale } from "../locale/locale";

/**
 * StatePill — a machine's (or line's, or station's) state as a labelled pill.
 *
 *   StatePill({ state: "running" })                          // "Running", in the running tone
 *   StatePill({ state: "stopped", children: "Jam at infeed" })
 *   StatePill({ tone: "down", children: "Starved" })         // a state that is not ours
 *
 * Vanilla port; see the React binding for the reasoning. Same API, same output.
 *
 * The label is always drawn: colour alone must not carry the state. `unknown`
 * is a dashed outline with no fill — nothing has been heard from the machine.
 * Colours are the `--zen-state-<tone>` tokens; retheme a tone there, not here.
 */

export type StatePillSize = "sm" | "md";

export interface StatePillProps extends BaseProps {
  /** One of the shared machine states. Gives both the colour and the label. */
  state?: MachineState;
  /**
   * The colour, for a state outside the shared vocabulary (PackML's "Held", a
   * plant's own "Starved"). Wins over the tone `state` would give.
   */
  tone?: MachineStateTone;
  size?: StatePillSize;
  /** The label (`children`). Defaults to the state's own ("Running", "No data", …). */
}

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

export function StatePill(props: StatePillProps = {}): ZenComponent<StatePillProps> {
  let current: StatePillProps = { ...props };
  const loc = useLocale();
  const el = document.createElement("span");
  const dot = document.createElement("span");
  dot.setAttribute("aria-hidden", "true");
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  const render = () => {
    const { state, tone: toneProp, size: sizeProp, class: className, children, ...rest } = current;
    const tone: MachineStateTone = toneProp ?? (state ? machineStateTone(state) : "unknown");
    const size = SIZE[sizeProp ?? "md"];
    el.className = cn(
      "zen-inline-flex zen-items-center zen-whitespace-nowrap zen-rounded-zen-full zen-font-medium zen-leading-tight",
      size.pill,
      PILL[tone],
      className,
    );
    el.setAttribute("data-tone", tone);
    if (state) el.setAttribute("data-state", state);
    else el.removeAttribute("data-state");
    dot.className = cn("zen-shrink-0 zen-rounded-zen-full", size.dot, DOT[tone]);
    const label = toNodes(children);
    el.replaceChildren(
      dot,
      ...(label.length ? label : state ? [document.createTextNode(loc.t(machineStateMessageKey(state)))] : []),
    );
    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  };

  render();
  disposer.add(() => removeProps?.());

  return {
    el,
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
