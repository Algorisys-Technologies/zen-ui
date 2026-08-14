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
  attrs: { measure: "string", elevation: "string", padding: "string" },
});

// Parts carry no props of their own — they only slot children.
defineZenElement({ tag: "zen-paper-header", factory: PaperHeader });
defineZenElement({ tag: "zen-paper-title", factory: PaperTitle });
defineZenElement({ tag: "zen-paper-description", factory: PaperDescription });
defineZenElement({ tag: "zen-paper-content", factory: PaperContent });
defineZenElement({ tag: "zen-paper-footer", factory: PaperFooter });
