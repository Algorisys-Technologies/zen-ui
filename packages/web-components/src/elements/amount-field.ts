import {
  AmountField, QuantityField,
  type AmountFieldProps, type QuantityFieldProps,
} from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// The scalars both fields share. `value` is a controlled number, `default-value`
// seeds an uncontrolled one; an attribute cannot say null, so a field the user
// may clear is best left uncontrolled (as <zen-number-field>'s is).
const COMMON = {
  value: "number",
  "default-value": "number",
  locale: "string",
  precision: "number",
  min: "number",
  max: "number",
  "allow-negative": "boolean",
  placeholder: "string",
  invalid: "boolean",
  disabled: "boolean",
  "read-only": "boolean",
  name: "string",
  width: "string",
} as const;

// `shorthand` defaults to TRUE, so it is a property (el.shorthand = false), not a
// boolean attribute: an absent attribute reads as false and would switch it off.
// Neither field reads a LocaleProvider (the element builds its field on connect,
// outside any provider's children function); give it `locale` / `currency`.

// <zen-amount-field currency="INR" locale="en-IN" default-value="1250.5"></zen-amount-field>
defineZenElement<AmountFieldProps>({
  tag: "zen-amount-field",
  factory: AmountField,
  attrs: { ...COMMON, currency: "string" },
  props: ["shorthand"],
  events: { onValueChange: "zen-value-change", onInvalidInput: "zen-invalid-input" },
  childrenProp: false,
});

// <zen-quantity-field unit="Kg" precision="3" default-value="12.5"></zen-quantity-field>
defineZenElement<QuantityFieldProps>({
  tag: "zen-quantity-field",
  factory: QuantityField,
  attrs: { ...COMMON, unit: "string" },
  props: ["shorthand"],
  events: { onValueChange: "zen-value-change", onInvalidInput: "zen-invalid-input" },
  childrenProp: false,
});
