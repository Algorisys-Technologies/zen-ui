import { Icon, type IconProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// <zen-icon name="check" size="20"></zen-icon> — renders an <svg>, takes no children.
defineZenElement<IconProps>({
  tag: "zen-icon",
  factory: Icon,
  attrs: {
    name: "string",
    size: "number",
    title: "string",
  },
  childrenProp: false,
});
