import { ReasonCodePicker, type ReasonCodePickerProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

/**
 * <zen-reason-code-picker label="Why did Press 5 stop?" reasons='[…]' value="e05">
 *
 * `reasons` is a JSON attribute or a property. `value` is a controlled string
 * (the chosen reason's `id`); `default-value` seeds an uncontrolled one.
 * `zen-change` fires with `detail: [id, reason]` — the reason is the caller's
 * own object, extra fields and all, which is what the generic `R` is in vanilla.
 * A custom element has one type, so the element is typed over the base
 * `ReasonCode`; the objects pass through untouched.
 *
 * `searchable` and `showCategories` are properties, not boolean attributes:
 * left unset they are decided by the list (search past 12 reasons, chips when
 * there is more than one category), and an absent boolean attribute would read
 * as FALSE and switch both off on every long list. No slot.
 */
defineZenElement<ReasonCodePickerProps>({
  tag: "zen-reason-code-picker",
  factory: ReasonCodePicker,
  attrs: {
    reasons: "json",
    value: "string",
    "default-value": "string",
    label: "string",
  },
  props: ["reasons", "searchable", "showCategories"],
  events: { onChange: "zen-change" },
  childrenProp: false,
});
