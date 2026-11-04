import { DateInput, type DateInputProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

/**
 * <zen-date-input locale="en-IN" default-value="2026-03-15" input-id="due"></zen-date-input>
 *
 * Dates are Date objects, so `value`, `defaultValue`, `min` and `max` are JS
 * properties; `default-value`, `min` and `max` are also attributes, read as ISO
 * dates (2026-03-15) for pure-HTML authoring. An attribute cannot say null, so
 * a field the user may clear is best left uncontrolled (`default-value`).
 *
 * The host is a `display: contents` wrapper, which `<label for>` cannot name and
 * an aria-label on it would name nothing useful (and would name the field
 * twice). So the field's id and accessible name land on the INNER input, from
 * `input-id`, `input-aria-label` and `input-aria-labelledby` — the names
 * <zen-tag-input> already uses for its input.
 */
type DateInputElementProps = Omit<DateInputProps, "value" | "defaultValue" | "min" | "max"> & {
  value?: Date | string | null;
  defaultValue?: Date | string | null;
  min?: Date | string;
  max?: Date | string;
  inputId?: string;
  inputAriaLabel?: string;
  inputAriaLabelledby?: string;
};

/** "2026-03-15" -> that day, local time (new Date("2026-03-15") would be UTC midnight). */
function toDate<T>(v: Date | string | T): Date | T {
  if (typeof v !== "string") return v;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v.trim());
  return (m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : undefined) as Date | T;
}

function toProps(p: Partial<DateInputElementProps>): Partial<DateInputProps> {
  const { inputId, inputAriaLabel, inputAriaLabelledby, value, defaultValue, min, max, ...rest } = p;
  const out: Partial<DateInputProps> = { ...rest };
  if ("inputId" in p) out.id = inputId;
  if ("inputAriaLabel" in p) out["aria-label"] = inputAriaLabel;
  if ("inputAriaLabelledby" in p) out["aria-labelledby"] = inputAriaLabelledby;
  if ("value" in p) out.value = toDate(value) as Date | null | undefined;
  if ("defaultValue" in p) out.defaultValue = toDate(defaultValue) as Date | null | undefined;
  if ("min" in p) out.min = toDate(min) as Date | undefined;
  if ("max" in p) out.max = toDate(max) as Date | undefined;
  return out;
}

defineZenElement<DateInputElementProps>({
  tag: "zen-date-input",
  factory: (props) => {
    const inner = DateInput(toProps(props) as DateInputProps);
    return {
      el: inner.el,
      update: (next) => inner.update(toProps(next)),
      destroy: () => inner.destroy(),
    };
  },
  attrs: {
    "default-value": "string",
    min: "string",
    max: "string",
    locale: "string",
    order: "string",
    placeholder: "string",
    invalid: "boolean",
    disabled: "boolean",
    width: "string",
    "input-id": "string",
    "input-aria-label": "string",
    "input-aria-labelledby": "string",
  },
  props: ["value", "defaultValue", "min", "max", "isDateDisabled"],
  events: { onValueChange: "zen-value-change", onInvalidInput: "zen-invalid-input" },
  childrenProp: false,
});
