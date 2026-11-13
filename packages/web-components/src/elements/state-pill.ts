import { StatePill, type StatePillProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

/**
 * <zen-state-pill state="running"></zen-state-pill>
 * <zen-state-pill state="stopped">Jam at infeed</zen-state-pill>
 * <zen-state-pill tone="planned">Held</zen-state-pill>
 *
 * Every prop is a plain string, so every prop is an attribute. The text child is
 * the label (`children`): leave it empty and the pill names the state itself, in
 * the active locale — which is the reason not to write "Running" by hand.
 */
defineZenElement<StatePillProps>({
  tag: "zen-state-pill",
  factory: StatePill,
  attrs: {
    state: "string",
    tone: "string",
    size: "string",
  },
});
