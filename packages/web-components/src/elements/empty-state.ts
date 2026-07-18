import {
  EmptyState, EmptyStateIcon, EmptyStateTitle, EmptyStateDescription, EmptyStateActions,
  type EmptyStateProps,
} from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

defineZenElement<EmptyStateProps>({
  tag: "zen-empty-state",
  factory: EmptyState,
  attrs: { size: "string", bordered: "boolean" },
});
defineZenElement({ tag: "zen-empty-state-icon", factory: EmptyStateIcon });
defineZenElement({ tag: "zen-empty-state-title", factory: EmptyStateTitle });
defineZenElement({ tag: "zen-empty-state-description", factory: EmptyStateDescription });
defineZenElement({ tag: "zen-empty-state-actions", factory: EmptyStateActions });
