import { RichText, type RichTextProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// WYSIWYG editor (jodit is a lazily-imported optional peer). `onChange` maps to an
// event; `value` is a controlled string; `config` is a raw Jodit config object set
// as a JS prop.
defineZenElement<RichTextProps>({
  tag: "zen-rich-text",
  factory: RichText,
  attrs: {
    value: "string",
    placeholder: "string",
  },
  props: ["config"],
  events: { onChange: "zen-change" },
  childrenProp: false,
});
