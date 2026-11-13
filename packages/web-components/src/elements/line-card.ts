import { LineCard, type LineCardProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";
import { asTime } from "./live-indicator";

/**
 * <zen-line-card name="Line A" href="/lines/a" state="running" since="…"
 *   order='{"code":"WO-10042","product":"Bracket","target":500,"good":361}'
 *   per-hour="278" oee="0.72" time-zone="Asia/Kolkata">
 *
 * `since` and `now` are `Date | number`, revived from the attribute string the
 * same way as <zen-live-indicator>'s times: all digits is epoch milliseconds,
 * anything else an ISO date. Set as properties they pass through untouched.
 * `order` is json and a property. `oee` is a number attribute; absent is
 * "not shown", the same as the factory's `null`.
 *
 * No slot: the card is drawn from its props.
 */
defineZenElement<LineCardProps>({
  tag: "zen-line-card",
  factory: (props) =>
    LineCard({
      ...props,
      since: asTime(props.since as unknown as string | Date | number | undefined),
      now: asTime(props.now as unknown as string | Date | number | undefined),
    }),
  attrs: {
    name: "string",
    state: "string",
    since: "string",
    cause: "string",
    order: "json",
    "per-hour": "number",
    oee: "number",
    href: "string",
    "time-zone": "string",
    now: "string",
  },
  props: ["since", "order", "now"],
  childrenProp: false,
});
