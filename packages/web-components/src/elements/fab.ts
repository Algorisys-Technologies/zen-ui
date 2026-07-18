import { FAB, type FABProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// Floating action button. `shape`/`size` from ButtonProps are omitted by FABProps
// (`shape` is fixed circle; `size` is FAB's own md/lg/xl). `onClick` bubbles
// natively through the host -> prop.
defineZenElement<FABProps>({
  tag: "zen-fab",
  factory: FAB,
  attrs: {
    as: "string",
    variant: "string",
    color: "string",
    position: "string",
    size: "string",
    multiline: "boolean",
    loading: "boolean",
    disabled: "boolean",
    type: "string",
    href: "string",
    target: "string",
    rel: "string",
  },
  props: ["iconLeft", "iconRight", "onClick"],
});
