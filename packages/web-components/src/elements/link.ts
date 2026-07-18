import { Link, type LinkProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// `onClick` mirrors the native click bubbling through the host, so it is a prop.
defineZenElement<LinkProps>({
  tag: "zen-link",
  factory: Link,
  attrs: {
    size: "string",
    inline: "boolean",
    external: "boolean",
    disabled: "boolean",
    href: "string",
    target: "string",
    rel: "string",
  },
  props: ["onClick"],
});
