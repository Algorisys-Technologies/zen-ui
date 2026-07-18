import { Loading, type LoadingProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// Renders an <svg> spinner from props; takes no slot content.
defineZenElement<LoadingProps>({
  tag: "zen-loading",
  factory: Loading,
  attrs: { size: "string", color: "string", label: "string" },
  childrenProp: false,
});
