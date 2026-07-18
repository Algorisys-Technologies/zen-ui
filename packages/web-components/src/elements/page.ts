import { Page, Bar, type PageProps, type BarProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// <zen-page flush>…</zen-page> — a whole-screen container whose content scrolls.
// `header`/`footer` are Child slots (JS properties); `flush` defaults false, so
// it is a plain boolean attribute.
defineZenElement<PageProps>({
  tag: "zen-page",
  factory: Page,
  attrs: { flush: "boolean" },
  props: ["header", "footer"],
});

// Bar's content is its three slot props (start/middle/end), not children — it
// renders no `children`, so the slot is off. `design` is an enum string.
defineZenElement<BarProps>({
  tag: "zen-bar",
  factory: Bar,
  attrs: { design: "string" },
  props: ["startContent", "middleContent", "endContent"],
  childrenProp: false,
});

// BAR_DESIGN is a const, not a component — nothing to register.
