import {
  BoundInput,
  BoundTextarea,
  BoundSelect,
  BoundCheckbox,
  BoundSwitch,
  BoundRadioGroup,
  BoundSlider,
  type BoundInputProps,
  type BoundTextareaProps,
  type BoundSelectProps,
  type BoundCheckboxProps,
  type BoundSwitchProps,
  type BoundRadioGroupProps,
  type BoundSliderProps,
} from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// Bound* fields bind to a form controller (from `createForm`). The controller is
// a live object shared across every field of a form, so `form` is a JS property,
// never an attribute. `name` names the field it binds. `label`/`description` are
// Child → props. The control's change is wired to the controller internally, so
// there is no value-change event to expose.
//
//   const form = createForm({ … });
//   const el = document.querySelector("zen-bound-input");
//   el.form = form; el.setAttribute("name", "email");

defineZenElement<BoundInputProps>({
  tag: "zen-bound-input",
  factory: BoundInput,
  attrs: {
    name: "string",
    required: "boolean",
    placeholder: "string",
    type: "string",
    disabled: "boolean",
    "read-only": "boolean",
    "field-class": "string",
  },
  props: ["form", "label", "description"],
  childrenProp: false,
});

defineZenElement<BoundTextareaProps>({
  tag: "zen-bound-textarea",
  factory: BoundTextarea,
  attrs: {
    name: "string",
    required: "boolean",
    placeholder: "string",
    disabled: "boolean",
    "read-only": "boolean",
    rows: "number",
    "field-class": "string",
  },
  props: ["form", "label", "description"],
  childrenProp: false,
});

// `options` is the primary data collection (json attr + prop).
defineZenElement<BoundSelectProps>({
  tag: "zen-bound-select",
  factory: BoundSelect,
  attrs: {
    name: "string",
    required: "boolean",
    placeholder: "string",
    disabled: "boolean",
    "field-class": "string",
    options: "json",
  },
  props: ["form", "label", "description", "options"],
  childrenProp: false,
});

defineZenElement<BoundCheckboxProps>({
  tag: "zen-bound-checkbox",
  factory: BoundCheckbox,
  attrs: {
    name: "string",
    disabled: "boolean",
    "field-class": "string",
  },
  props: ["form", "label", "description"],
  childrenProp: false,
});

defineZenElement<BoundSwitchProps>({
  tag: "zen-bound-switch",
  factory: BoundSwitch,
  attrs: {
    name: "string",
    disabled: "boolean",
    "field-class": "string",
  },
  props: ["form", "label", "description"],
  childrenProp: false,
});

// `options` is the primary data collection (json attr + prop).
defineZenElement<BoundRadioGroupProps>({
  tag: "zen-bound-radio-group",
  factory: BoundRadioGroup,
  attrs: {
    name: "string",
    required: "boolean",
    orientation: "string",
    disabled: "boolean",
    "field-class": "string",
    options: "json",
  },
  props: ["form", "label", "description", "options"],
  childrenProp: false,
});

defineZenElement<BoundSliderProps>({
  tag: "zen-bound-slider",
  factory: BoundSlider,
  attrs: {
    name: "string",
    min: "number",
    max: "number",
    step: "number",
    disabled: "boolean",
    "field-class": "string",
  },
  props: ["form", "label", "description"],
  childrenProp: false,
});
