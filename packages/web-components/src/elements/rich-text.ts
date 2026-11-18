import { RichText, type RichTextProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// WYSIWYG editor (jodit is a lazily-imported optional peer). `onChange` maps to an
// event; `value` is a controlled string; `config` is a raw Jodit config object set
// as a JS prop.
//
// `math` defaults off, so it is a boolean attribute (an absent attribute is the
// default). It needs the optional `katex` peer, and its stylesheet imported once
// by the app. `onImageUpload` is a JS property, not an event: the editor embeds
// the URL its Promise RESOLVES to, and an event listener returns nothing. Like
// `config`, whether uploads go through it is decided when the editor is built,
// so set it before the element is connected (the latest function is the one
// called after that).
defineZenElement<RichTextProps>({
  tag: "zen-rich-text",
  factory: RichText,
  attrs: {
    value: "string",
    placeholder: "string",
    math: "boolean",
  },
  props: ["config", "onImageUpload"],
  events: { onChange: "zen-change" },
  childrenProp: false,
});
