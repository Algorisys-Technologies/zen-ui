import { Label, type LabelProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// <zen-label for="email" required>Email</zen-label>
//
// `for` stays `for`. It is the HTML attribute the DOM already has, and this
// binding IS HTML — React renamed it to `htmlFor` only to dodge a JS reserved
// word, which is not a problem an attribute has.
//
// The text is slotted rather than data-driven: a label's content is the one
// thing the caller always writes inline, and `children` is what the vanilla
// factory already takes.
defineZenElement<LabelProps>({
  tag: "zen-label",
  factory: Label,
  attrs: {
    for: "string",
    size: "string",
    required: "boolean",
    disabled: "boolean",
  },
});
