import { Stepper, type StepperProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// Data-driven wizard. `steps` is the primary collection — inline as JSON, or set
// `el.steps = [...]` for steps whose `content` is a Node or a render function.
// `value`/`default-value` are plain strings (the active step). `linear` defaults
// TRUE, so it is a JS property (a boolean attribute could never express false).
// The handle's next()/prev()/goTo()/currentIndex/isFirst/isLast are
// auto-forwarded onto the element.
//
//   <zen-stepper default-value="welcome"
//     steps='[{"value":"welcome","label":"Welcome","content":"Hi"}]'></zen-stepper>
defineZenElement<StepperProps>({
  tag: "zen-stepper",
  factory: Stepper,
  attrs: {
    value: "string",
    "default-value": "string",
    orientation: "string",
    steps: "json",
  },
  props: ["steps", "linear"],
  events: { onValueChange: "zen-value-change" },
  childrenProp: false,
});
