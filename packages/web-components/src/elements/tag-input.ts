import { TagInput, type TagInputProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// <zen-tag-input value='["react","typescript"]'></zen-tag-input>
// The tags array is the primary data collection: a `json` attribute for pure-HTML
// authoring plus a `value` property (like tabs). `unique` defaults TRUE, so it is
// a property — a boolean attribute could never express the false a caller wants.
// `delimiters`/`defaultValue` are arrays and `validate`/`normalize`/`renderTag`
// are functions, so all are properties.
defineZenElement<TagInputProps>({
  tag: "zen-tag-input",
  factory: TagInput,
  attrs: {
    value: "json",
    placeholder: "string",
    disabled: "boolean",
    max: "number",
    "input-aria-label": "string",
  },
  props: ["value", "defaultValue", "delimiters", "unique", "validate", "normalize", "renderTag"],
  events: { onValueChange: "zen-value-change" },
  childrenProp: false,
});
