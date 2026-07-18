import {
  Alert, AlertIcon, AlertContent, AlertTitle, AlertDescription, AlertActions,
  type AlertProps,
} from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// <zen-alert color="info" variant="soft">…</zen-alert> — compound feedback banner.
defineZenElement<AlertProps>({
  tag: "zen-alert",
  factory: Alert,
  attrs: { color: "string", variant: "string" },
});

// Parts carry no props of their own — they only slot children.
defineZenElement({ tag: "zen-alert-icon", factory: AlertIcon });
defineZenElement({ tag: "zen-alert-content", factory: AlertContent });
defineZenElement({ tag: "zen-alert-title", factory: AlertTitle });
defineZenElement({ tag: "zen-alert-description", factory: AlertDescription });
defineZenElement({ tag: "zen-alert-actions", factory: AlertActions });
