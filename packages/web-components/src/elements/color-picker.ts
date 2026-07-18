import {
  ColorPicker,
  ColorPalette,
  type ColorPickerProps,
  type ColorPaletteProps,
} from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// `colors` is the primary data collection for both (json attr + prop); its
// entries are hex strings or `{ value, label }` objects.
defineZenElement<ColorPaletteProps>({
  tag: "zen-color-palette",
  factory: ColorPalette,
  attrs: {
    value: "string",
    "default-value": "string",
    label: "string",
    size: "string",
    disabled: "boolean",
    colors: "json",
  },
  props: ["colors"],
  events: { onValueChange: "zen-value-change" },
  childrenProp: false,
});

// `allowCustom` defaults TRUE, so it is a prop — a boolean attribute could only
// add presence=true, never the false that hides the hex field.
defineZenElement<ColorPickerProps>({
  tag: "zen-color-picker",
  factory: ColorPicker,
  attrs: {
    value: "string",
    "default-value": "string",
    label: "string",
    placeholder: "string",
    disabled: "boolean",
    colors: "json",
  },
  props: ["colors", "allowCustom"],
  events: { onValueChange: "zen-value-change" },
  childrenProp: false,
});
