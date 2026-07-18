import { Progress, type ProgressProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// Omit `value` for an indeterminate bar.
defineZenElement<ProgressProps>({
  tag: "zen-progress",
  factory: Progress,
  attrs: { value: "number", max: "number", size: "string", color: "string" },
});
