import { InputOTP } from "./form/otp/otp";
import { DemoPage } from "./demo-helpers";

/**
 * Mirrors the React NewOTPDemo section-for-section. React shows the compound
 * markup (`<InputOTPGroup>` / `<InputOTPSlot>`); vanilla is data-driven, so each
 * layout is expressed as `groupSizes` — the same shape React derives internally
 * from `maxLength`/`groupSizes` when no children are passed. See otp.ts for the
 * divergence rationale.
 */
export default function InputOTPDemo(): HTMLElement {
  return DemoPage({
    title: "InputOTP",
    description:
      "One-time-code input — one <input> per digit, zero dependencies. Handles paste, keyboard nav, mobile autocomplete (one-time-code), and backspace-across-slots. Themed via --zen-*. The React compound parts collapse into a data-driven groupSizes here — the same divergence Select makes.",
    sections: [
      {
        title: "1. 6-digit OTP",
        codeTitle: "Basic 6-slot OTP, controlled",
        codeDescription:
          "value present makes it controlled: onValueChange reports the edit, the caller hands it back through update({ value }).",
        code: `let code = "";
const field = InputOTP({
  maxLength: 6,
  groupSizes: [6],
  value: code,
  onValueChange: (v) => {
    code = v;
    field.update({ value: v });
  },
});
document.body.append(field.el);`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.display = "flex";
          wrap.style.flexDirection = "column";
          wrap.style.gap = "8px";
          wrap.style.alignItems = "flex-start";

          const valueLabel = document.createElement("span");
          valueLabel.style.fontSize = "0.8125rem";
          valueLabel.style.color = "var(--zen-color-muted-fg)";
          valueLabel.textContent = 'value: ""';

          let code = "";
          const field = InputOTP({
            maxLength: 6,
            groupSizes: [6],
            value: code,
            onValueChange: (v) => {
              code = v;
              field.update({ value: v });
              valueLabel.textContent = `value: "${v}"`;
            },
          });

          wrap.append(field.el, valueLabel);
          return wrap;
        },
      },
      {
        title: "2. Grouped with separator",
        codeTitle: "Two 3-slot groups divided by a separator (like 123-456)",
        codeDescription:
          "groupSizes: [3, 3] draws two groups; the default separator (a dash) sits between them.",
        code: `InputOTP({ maxLength: 6, groupSizes: [3, 3] });`,
        render: () => InputOTP({ maxLength: 6, groupSizes: [3, 3] }).el,
      },
      {
        title: "3. 4-digit PIN",
        codeTitle: "Any length",
        code: `InputOTP({ maxLength: 4 });`,
        render: () => InputOTP({ maxLength: 4 }).el,
      },
      {
        title: "4. Disabled",
        codeTitle: "disabled prop disables the whole input",
        code: `InputOTP({ maxLength: 4, disabled: true, value: "1234" });`,
        render: () => InputOTP({ maxLength: 4, disabled: true, value: "1234" }).el,
      },
      {
        title: "5. Auto-submit on complete",
        codeTitle: "onComplete fires when all slots are filled",
        code: `InputOTP({
  maxLength: 6,
  onComplete: (value) => alert("Verifying " + value),
});`,
        render: () =>
          InputOTP({
            maxLength: 6,
            onComplete: (value) => alert(`Verifying ${value}`),
          }).el,
      },
    ],
  });
}
