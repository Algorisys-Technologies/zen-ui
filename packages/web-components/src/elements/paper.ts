import {
  Paper, PaperHeader, PaperTitle, PaperDescription, PaperContent, PaperFooter,
  type PaperProps,
} from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// <zen-paper measure="prose" elevation="raised" padding="md">…</zen-paper>
//
// A document surface — see the vanilla factory for why it is not a Card with
// different padding. `measure` is the reason it exists: a reading length the
// theme layer cannot supply, because the utilities carry no width tokens.
defineZenElement<PaperProps>({
  tag: "zen-paper",
  factory: Paper,
  // `stack` is numeric (1 or 2), so it coerces rather than staying a string —
  // `stack="2"` in markup has to reach the factory as the number 2 or the
  // shadow lookup misses and the pile silently does not draw.
  attrs: { measure: "string", elevation: "string", padding: "string", stack: "number" },
});

// Parts carry no props of their own — they only slot children.
defineZenElement({ tag: "zen-paper-header", factory: PaperHeader });
defineZenElement({ tag: "zen-paper-title", factory: PaperTitle });
defineZenElement({ tag: "zen-paper-description", factory: PaperDescription });
defineZenElement({ tag: "zen-paper-content", factory: PaperContent });
defineZenElement({ tag: "zen-paper-footer", factory: PaperFooter });
