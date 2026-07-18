import { SkipToContent, type SkipToContentProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// <zen-skip-to-content href="#main"></zen-skip-to-content>
// The keyboard bypass, visually hidden until focused. `href` is the one attribute;
// the link text is the factory's `children` prop, but that prop is typed as a
// plain string (set as `el.textContent` internally), not slottable Child nodes —
// so the slot is off and the default "Skip to main content" label is used. Set a
// custom label via the `children` string property if needed.
defineZenElement<SkipToContentProps>({
  tag: "zen-skip-to-content",
  factory: SkipToContent,
  attrs: { href: "string" },
  childrenProp: false,
});
