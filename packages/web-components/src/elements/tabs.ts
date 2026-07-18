import { Tabs, type TabsProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// Data-driven. Author the tabs inline as JSON, or set el.tabs = [...] for tabs
// whose label/content are real Nodes rather than plain strings.
//
//   <zen-tabs default-value="a"
//     tabs='[{"value":"a","label":"A","content":"…"}]'></zen-tabs>
defineZenElement<TabsProps>({
  tag: "zen-tabs",
  factory: Tabs,
  attrs: {
    variant: "string",
    orientation: "string",
    value: "string",
    "default-value": "string",
    "activation-mode": "string",
    tabs: "json",
  },
  props: ["tabs"],
  events: { onValueChange: "zen-value-change" },
  childrenProp: false,
});
