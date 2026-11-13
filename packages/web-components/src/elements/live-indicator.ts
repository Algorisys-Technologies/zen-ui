import { LiveIndicator, type LiveIndicatorProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

/**
 * <zen-live-indicator last-updated="1789286400000" stale-after-ms="15000">
 *
 * `last-updated` and `now` take a `Date | number` in the factory, and an
 * attribute can only hand over a string — so they are string attributes revived
 * here: all digits is epoch milliseconds, anything else is parsed as a date
 * (ISO). A caller who sets the PROPERTY with a Date or a number gets it through
 * untouched. After each successful fetch, `el.lastUpdated = Date.now()`.
 *
 * `connected` defaults to TRUE and is json for that reason (the same rule as
 * <zen-test-countdown-bar>'s `sticky`): an absent boolean attribute coerces to
 * false, which here would read as "offline" on every element that did not say
 * otherwise. As json, absent stays undefined, `connected="false"` is offline and
 * `connected="true"` is connected.
 *
 * No slot: the text is the component's own.
 */

/**
 * A `Date | number` from an attribute string, or the value itself when the
 * property was set. Undefined survives — `lastUpdated` absent is "waiting", and
 * `now` absent is the real clock.
 */
export const asTime = (value: string | Date | number | undefined): Date | number | undefined => {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") return value;
  return /^-?\d+$/.test(value.trim()) ? Number(value) : new Date(value);
};

defineZenElement<LiveIndicatorProps>({
  tag: "zen-live-indicator",
  factory: (props) =>
    LiveIndicator({
      ...props,
      lastUpdated: asTime(props.lastUpdated as unknown as string | Date | number | undefined),
      now: asTime(props.now as unknown as string | Date | number | undefined),
    }),
  attrs: {
    "last-updated": "string",
    "stale-after-ms": "number",
    connected: "json",
    now: "string",
    size: "string",
  },
  props: ["lastUpdated", "connected", "now"],
  childrenProp: false,
});
