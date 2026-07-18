import {
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
  FormField,
  type FormItemProps,
  type FormLabelProps,
  type FormDescriptionProps,
  type FormMessageProps,
  type FormFieldConfig,
} from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// `createForm` is a controller factory, not a component — it has no element and
// is not registered here.

// Display primitives — they render caller content, so childrenProp stays default.
defineZenElement<FormItemProps>({ tag: "zen-form-item", factory: FormItem });

defineZenElement<FormLabelProps>({
  tag: "zen-form-label",
  factory: FormLabel,
  attrs: { for: "string", error: "boolean" },
});

defineZenElement<FormDescriptionProps>({
  tag: "zen-form-description",
  factory: FormDescription,
});

defineZenElement<FormMessageProps>({
  tag: "zen-form-message",
  factory: FormMessage,
  attrs: { message: "string" },
});

// FormField binds to a form controller (JS-object prop) and builds its control
// through the `control` callback (a builder function → prop). `name` names the
// field; state flows through the controller, so there is no change event.
defineZenElement<FormFieldConfig>({
  tag: "zen-form-field",
  factory: FormField,
  attrs: { name: "string" },
  props: ["form", "label", "description", "control"],
  childrenProp: false,
});
