import { DemoPage } from "./demo-helpers";

/**
 * NumberField demo — the web-components port. <zen-number-field> is a number
 * <input> with −/+ steppers. `value` (or null when cleared), `default-value`,
 * `min` / `max` / `step` are attributes; `zen-value-change` fires the next number.
 */

interface NumberFieldOpts {
  value?: number | null;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

function numberField(opts: NumberFieldOpts): HTMLElement {
  const el = document.createElement("zen-number-field");
  if (opts.value != null) el.setAttribute("value", String(opts.value));
  if (opts.defaultValue != null) el.setAttribute("default-value", String(opts.defaultValue));
  if (opts.min != null) el.setAttribute("min", String(opts.min));
  if (opts.max != null) el.setAttribute("max", String(opts.max));
  if (opts.step != null) el.setAttribute("step", String(opts.step));
  if (opts.disabled) el.setAttribute("disabled", "");
  return el;
}

export default function NumberFieldDemo(): HTMLElement {
  return DemoPage({
    title: "NumberField",
    description:
      "Stepper input: a number <input> with −/+ buttons. No Radix primitive yet (planned upstream); the caller holds the node, clamps to min/max, and keyboard arrows on the input still work natively.",
    sections: [
      {
        title: "1. Basic (controlled)",
        codeTitle: "value + zen-value-change",
        code: `<zen-number-field value="1" min="0" max="10"></zen-number-field>

el.addEventListener("zen-value-change", (e) => { el.value = e.detail; });`,
        render: () => {
          const readout = document.createElement("span");
          readout.style.marginLeft = "12px";
          readout.style.fontSize = "0.8125rem";
          readout.style.color = "var(--zen-color-muted-fg)";

          const el = numberField({ value: 1, min: 0, max: 10 });
          const paint = (v: number | null) => {
            readout.textContent = `qty: ${v ?? "(empty)"}`;
          };
          el.addEventListener("zen-value-change", (e) => {
            const v = (e as CustomEvent).detail as number | null;
            (el as unknown as { value: number | null }).value = v;
            paint(v);
          });
          paint(1);
          return [el, readout];
        },
      },
      {
        title: "2. Uncontrolled",
        codeTitle: "default-value",
        code: `<zen-number-field default-value="5" min="0" max="20"></zen-number-field>`,
        render: () => numberField({ defaultValue: 5, min: 0, max: 20 }),
      },
      {
        title: "3. Custom step",
        codeTitle: "step: 5 snaps to 0/5/10/15/20",
        code: `<zen-number-field default-value="0" min="0" max="20" step="5"></zen-number-field>`,
        render: () => numberField({ defaultValue: 0, min: 0, max: 20, step: 5 }),
      },
      {
        title: "4. Decimal step",
        codeTitle: "step: 0.1 for fractional values",
        code: `<zen-number-field default-value="0.5" min="0" max="1" step="0.1"></zen-number-field>`,
        render: () => numberField({ defaultValue: 0.5, min: 0, max: 1, step: 0.1 }),
      },
      {
        title: "5. Min / max clamping",
        codeTitle: "−/+ disable at bounds; typing past max clamps back",
        code: `<zen-number-field default-value="5" min="0" max="5"></zen-number-field>`,
        render: () => numberField({ defaultValue: 5, min: 0, max: 5 }),
      },
      {
        title: "6. Disabled",
        codeTitle: "disabled on the whole field",
        code: `<zen-number-field default-value="3" disabled></zen-number-field>`,
        render: () => numberField({ defaultValue: 3, disabled: true }),
      },
    ],
  });
}
