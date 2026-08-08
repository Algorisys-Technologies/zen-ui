import { Collapsible, type CollapsibleProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// <zen-collapsible default-open trigger="Advanced settings" content="…">
//
// Data-driven from `trigger` / `content`, mirroring the vanilla factory — there
// are no compound parts to slot, so `childrenProp` is false and stray light-DOM
// whitespace is discarded.
//
// `open` is the CONTROLLED prop: its presence hands the state to the caller, and
// a boolean attribute can only ever add presence=true, so it is a JS property
// (`el.open = false` must be expressible). `defaultOpen` is the uncontrolled
// seed and stays a boolean attribute — the same split zen-checkbox makes between
// `checked` and `default-checked`.
defineZenElement<CollapsibleProps>({
  tag: "zen-collapsible",
  factory: Collapsible,
  attrs: {
    trigger: "string",
    content: "string",
    "default-open": "boolean",
    disabled: "boolean",
  },
  props: ["open", "trigger", "content"],
  events: { onOpenChange: "zen-open-change" },
  childrenProp: false,
});
