import {
  TimerBadge,
  TestCountdownBar,
  type TimerBadgeProps,
  type TestCountdownBarProps,
} from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

/**
 * <zen-timer-badge deadline="1785312000000" label="Time left">
 * <zen-test-countdown-bar deadline="…" title="Kata 3">
 *
 * `deadline` is a NUMBER attribute — epoch milliseconds, not a duration and not
 * a date string. That is the component's whole design (a clock computed from a
 * fixed point cannot drift in a throttled tab), so the attribute has to carry
 * the same thing rather than something friendlier that would reintroduce the
 * drift by being re-based on load.
 *
 * `thresholds` is json: `thresholds="[600,120]"`.
 *
 * The bar's slot is `content` rather than `children`, matching the vanilla
 * factory — light-DOM children land beside the clock, which is where a question
 * counter or a progress bar belongs.
 */
defineZenElement<TimerBadgeProps>({
  tag: "zen-timer-badge",
  factory: TimerBadge,
  attrs: {
    deadline: "number",
    thresholds: "json",
    paused: "boolean",
    label: "string",
    variant: "string",
    size: "string",
  },
  props: ["thresholds", "onExpire", "onThreshold"],
  events: { onExpire: "zen-expire", onThreshold: "zen-threshold" },
  childrenProp: false,
});

defineZenElement<TestCountdownBarProps>({
  tag: "zen-test-countdown-bar",
  factory: TestCountdownBar,
  attrs: {
    deadline: "number",
    thresholds: "json",
    paused: "boolean",
    title: "string",
    // Defaults to TRUE — json, so absent means "unset" rather than false.
    sticky: "json",
  },
  props: ["thresholds", "content", "actions", "onExpire", "onThreshold"],
  events: { onExpire: "zen-expire", onThreshold: "zen-threshold" },
  childrenProp: "content",
});
