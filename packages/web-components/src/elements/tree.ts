import { Tree, type TreeProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// Data-driven tree with full ARIA keyboard navigation. `items` is the primary
// collection — inline as JSON, or set `el.items = [...]` for node-valued labels.
// `expanded` (string[]) and `selected` (string | null) are controlled JS
// properties; their `default*` counterparts likewise (arrays/nullable can't be
// attributes). Renders purely from data, so no light-DOM slot.
//
//   <zen-tree items='[{"id":"src","label":"src","children":[]}]'></zen-tree>
defineZenElement<TreeProps>({
  tag: "zen-tree",
  factory: Tree,
  props: ["items", "expanded", "defaultExpanded", "selected", "defaultSelected"],
  events: {
    onExpandedChange: "zen-expanded-change",
    onSelectedChange: "zen-selected-change",
  },
  childrenProp: false,
});
