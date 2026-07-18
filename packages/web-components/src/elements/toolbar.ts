import { Toolbar, type ToolbarProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// A row of actions that collapses into an overflow menu. `actions` is the primary
// data collection — authorable inline as JSON or set as `el.actions = [...]` for
// node-valued labels. `children` is leading content (a title) that never
// overflows, so the slot stays on.
//
//   <zen-toolbar aria-label="Order actions"
//     actions='[{"id":"save","label":"Save","icon":"check"}]'></zen-toolbar>
defineZenElement<ToolbarProps>({
  tag: "zen-toolbar",
  factory: Toolbar,
  attrs: {
    "overflow-label": "string",
    size: "string",
    actions: "json",
  },
  props: ["actions"],
});
