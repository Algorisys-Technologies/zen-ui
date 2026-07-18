import { Badge, type BadgeProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// <zen-badge color="success">Active</zen-badge>
defineZenElement<BadgeProps>({
  tag: "zen-badge",
  factory: Badge,
  attrs: {
    variant: "string",
    color: "string",
    size: "string",
  },
});
