import { MeasurementInput, type MeasurementInputProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

/**
 * <zen-measurement-input label="Bore diameter" unit="mm"
 *   spec='{"nominal":10,"lower":9.9,"upper":10.1}'></zen-measurement-input>
 *
 * `value` is a controlled number, and is BOTH an attribute and a property. The
 * attribute covers markup and framework bindings; the property exists because
 * an attribute cannot say `null`, which is how a controlled caller empties the
 * field (`el.value = null`). Once set as a property it wins over the attribute,
 * as on <zen-production-schedule>'s `date`. `default-value` seeds an
 * uncontrolled field and is read once.
 *
 * `zen-change` fires on every valid change with `detail: [value, judgement]`
 * (value null when the field is empty). The COMMIT — Enter, or leaving the
 * field — is the native `change` event, which bubbles from the inner <input>
 * through the host, so `el.addEventListener("change", …)` hears it; it is not
 * re-wired, exactly as vanilla takes it from the native event.
 *
 * `spec` is a JSON attribute or a property. No slot.
 */
defineZenElement<MeasurementInputProps>({
  tag: "zen-measurement-input",
  factory: MeasurementInput,
  attrs: {
    spec: "json",
    label: "string",
    unit: "string",
    precision: "number",
    value: "number",
    "default-value": "number",
    disabled: "boolean",
  },
  props: ["spec", "value"],
  events: { onChange: "zen-change" },
  childrenProp: false,
});
