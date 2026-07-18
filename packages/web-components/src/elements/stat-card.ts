import { StatCard, type StatCardProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// `label`/`value`/`icon` are Child, `trend` an object -> JS properties. `onClick`
// mirrors the native click that already bubbles through the host, so it is a prop.
// No `children` prop: the card is built entirely from label/value/… -> no slot.
defineZenElement<StatCardProps>({
  tag: "zen-stat-card",
  factory: StatCard,
  attrs: { color: "string", href: "string", loading: "boolean" },
  props: ["label", "value", "icon", "trend", "onClick"],
  childrenProp: false,
});
