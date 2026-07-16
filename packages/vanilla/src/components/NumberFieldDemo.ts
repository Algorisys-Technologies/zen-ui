import { NumberField } from "./form/number-field/number-field";
import { DemoPage } from "./demo-helpers";

export default function NumberFieldDemo(): HTMLElement {
  return DemoPage({
    title: "NumberField",
    description:
      "Stepper input: a number <input> with −/+ buttons. No Radix primitive yet (planned upstream); the caller holds the node, clamps to min/max, and keyboard arrows on the input still work natively.",
    sections: [
      {
        title: "1. Basic (controlled)",
        codeTitle: "value + onValueChange",
        code: `let qty: number | null = 1;
const field = NumberField({
  value: qty,
  min: 0,
  max: 10,
  onValueChange: (v) => {
    qty = v;
    field.update({ value: qty });
  },
});
document.body.append(field.el);`,
        render: () => {
          let qty: number | null = 1;
          const readout = document.createElement("span");
          readout.style.marginLeft = "12px";
          readout.style.fontSize = "0.8125rem";
          readout.style.color = "var(--zen-color-muted-fg)";
          const paint = () => {
            readout.textContent = `qty: ${qty ?? "(empty)"}`;
          };
          const field = NumberField({
            value: qty,
            min: 0,
            max: 10,
            onValueChange: (v) => {
              qty = v;
              field.update({ value: qty });
              paint();
            },
          });
          paint();
          return [field.el, readout];
        },
      },
      {
        title: "2. Uncontrolled",
        codeTitle: "defaultValue",
        code: `NumberField({ defaultValue: 5, min: 0, max: 20 })`,
        render: () => NumberField({ defaultValue: 5, min: 0, max: 20 }).el,
      },
      {
        title: "3. Custom step",
        codeTitle: "step: 5 snaps to 0/5/10/15/20",
        code: `NumberField({ defaultValue: 0, min: 0, max: 20, step: 5 })`,
        render: () => NumberField({ defaultValue: 0, min: 0, max: 20, step: 5 }).el,
      },
      {
        title: "4. Decimal step",
        codeTitle: "step: 0.1 for fractional values",
        code: `NumberField({ defaultValue: 0.5, min: 0, max: 1, step: 0.1 })`,
        render: () => NumberField({ defaultValue: 0.5, min: 0, max: 1, step: 0.1 }).el,
      },
      {
        title: "5. Min / max clamping",
        codeTitle: "−/+ disable at bounds; typing past max clamps back",
        code: `NumberField({ defaultValue: 5, min: 0, max: 5 })`,
        render: () => NumberField({ defaultValue: 5, min: 0, max: 5 }).el,
      },
      {
        title: "6. Disabled",
        codeTitle: "disabled on the whole field",
        code: `NumberField({ defaultValue: 3, disabled: true })`,
        render: () => NumberField({ defaultValue: 3, disabled: true }).el,
      },
    ],
  });
}
