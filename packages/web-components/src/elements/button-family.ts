import {
  ToggleButton, SegmentedButton, SplitButton,
  type ToggleButtonProps, type SegmentedButtonProps, type SplitButtonProps,
} from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// `pressed` is a controlled boolean (presence hands state to the caller) -> JS
// property; its `defaultPressed` counterpart -> boolean attr.
defineZenElement<ToggleButtonProps>({
  tag: "zen-toggle-button",
  factory: ToggleButton,
  attrs: {
    as: "string",
    variant: "string",
    color: "string",
    size: "string",
    shape: "string",
    multiline: "boolean",
    loading: "boolean",
    disabled: "boolean",
    type: "string",
    href: "string",
    target: "string",
    rel: "string",
    "default-pressed": "boolean",
  },
  props: ["pressed", "iconLeft", "iconRight", "onClick"],
  events: { onPressedChange: "zen-pressed-change" },
});

// Data-driven like Tabs: author `items` inline as JSON or set el.items = [...].
// No slot content -> childrenProp false.
defineZenElement<SegmentedButtonProps>({
  tag: "zen-segmented-button",
  factory: SegmentedButton,
  attrs: {
    items: "json",
    value: "string",
    "default-value": "string",
    size: "string",
  },
  props: ["items"],
  events: { onValueChange: "zen-value-change" },
  childrenProp: false,
});

// `menu` is the primary data collection -> json attr AND JS property. The main
// half renders the caller's `children` as its label, so children stays default.
defineZenElement<SplitButtonProps>({
  tag: "zen-split-button",
  factory: SplitButton,
  attrs: {
    as: "string",
    variant: "string",
    color: "string",
    size: "string",
    shape: "string",
    multiline: "boolean",
    loading: "boolean",
    disabled: "boolean",
    type: "string",
    href: "string",
    target: "string",
    rel: "string",
    menu: "json",
    "menu-label": "string",
    "menu-align": "string",
  },
  props: ["menu", "iconLeft", "iconRight", "onClick"],
});
