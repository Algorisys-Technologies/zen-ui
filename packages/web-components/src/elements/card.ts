import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
  SelectableCardGroup,
  type CardProps, type SelectableCardGroupProps,
} from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// <zen-card variant="elevated" padding="md">…</zen-card>
defineZenElement<CardProps>({
  tag: "zen-card",
  factory: Card,
  attrs: { variant: "string", padding: "string" },
});

// Parts carry no props of their own — they only slot children.
defineZenElement({ tag: "zen-card-header", factory: CardHeader });
defineZenElement({ tag: "zen-card-title", factory: CardTitle });
defineZenElement({ tag: "zen-card-description", factory: CardDescription });
defineZenElement({ tag: "zen-card-content", factory: CardContent });
defineZenElement({ tag: "zen-card-footer", factory: CardFooter });

// Radio-as-a-card group, data-driven from `items` (authorable inline as JSON or as
// `el.items = [...]`). `value` / `default-value` are plain strings (exactly one
// selection). `disabled` defaults to false, so it is a plain boolean attribute.
defineZenElement<SelectableCardGroupProps>({
  tag: "zen-selectable-card-group",
  factory: SelectableCardGroup,
  attrs: {
    items: "json",
    value: "string",
    "default-value": "string",
    disabled: "boolean",
    name: "string",
  },
  props: ["items"],
  events: { onValueChange: "zen-value-change" },
  childrenProp: false,
});
