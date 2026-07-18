import { Button, type ButtonProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// <zen-button color="primary">Save</zen-button>
// Native `click` bubbles from the inner <button> through the host, so no synthetic
// event is wired — a consumer listens to `click` on <zen-button> directly.
defineZenElement<ButtonProps>({
  tag: "zen-button",
  factory: Button,
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
  },
  props: ["iconLeft", "iconRight", "onClick"],
});
