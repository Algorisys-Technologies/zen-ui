import {
  Toaster, ToastAction,
  type ToasterProps, type ToastActionProps,
} from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// `toast()` / `dismiss()` are imperative functions, not components — not elements.

// The viewport, mounted once near the root. Renders purely from the module store,
// so it takes no slotted children.
defineZenElement<ToasterProps>({
  tag: "zen-toaster",
  factory: Toaster,
  childrenProp: false,
});

// The inline Undo / Retry button passed as a toast's `action`. `onClick` mirrors a
// native bubbling event, so it stays a JS property (the native `click` bubbles
// through the host).
defineZenElement<ToastActionProps>({
  tag: "zen-toast-action",
  factory: ToastAction,
  attrs: { "alt-text": "string" },
  props: ["onClick"],
});
