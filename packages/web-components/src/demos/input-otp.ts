import { DemoPage } from "./demo-helpers";

/**
 * InputOTP demo — the web-components port. <zen-input-otp> is data-driven:
 * `max-length` is an attribute, `group-sizes` (the layout) is a JS property, and
 * `zen-value-change` / `zen-complete` report edits. Mirrors the vanilla demo.
 */

function otp(opts: {
  maxLength: number;
  groupSizes?: number[];
  value?: string;
  disabled?: boolean;
}): HTMLElement {
  const el = document.createElement("zen-input-otp");
  el.setAttribute("max-length", String(opts.maxLength));
  if (opts.value != null) el.setAttribute("value", opts.value);
  if (opts.disabled) el.setAttribute("disabled", "");
  if (opts.groupSizes) (el as unknown as { groupSizes: number[] }).groupSizes = opts.groupSizes;
  return el;
}

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
          "value present makes it controlled: zen-value-change reports the edit, the caller hands it back via el.value = next.",
        code: `<zen-input-otp max-length="6"></zen-input-otp>

const field = document.querySelector("zen-input-otp");
field.groupSizes = [6];
field.addEventListener("zen-value-change", (e) => { field.value = e.detail; });`,
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

          const field = otp({ maxLength: 6, groupSizes: [6], value: "" });
          field.addEventListener("zen-value-change", (e) => {
            const v = (e as CustomEvent).detail as string;
            (field as unknown as { value: string }).value = v;
            valueLabel.textContent = `value: "${v}"`;
          });

          wrap.append(field, valueLabel);
          return wrap;
        },
      },
      {
        title: "2. Grouped with separator",
        codeTitle: "Two 3-slot groups divided by a separator (like 123-456)",
        codeDescription:
          "group-sizes [3, 3] draws two groups; the default separator (a dash) sits between them.",
        code: `const field = document.querySelector("zen-input-otp");
field.groupSizes = [3, 3];`,
        render: () => otp({ maxLength: 6, groupSizes: [3, 3] }),
      },
      {
        title: "3. 4-digit PIN",
        codeTitle: "Any length",
        code: `<zen-input-otp max-length="4"></zen-input-otp>`,
        render: () => otp({ maxLength: 4 }),
      },
      {
        title: "4. Disabled",
        codeTitle: "disabled disables the whole input",
        code: `<zen-input-otp max-length="4" value="1234" disabled></zen-input-otp>`,
        render: () => otp({ maxLength: 4, disabled: true, value: "1234" }),
      },
      {
        title: "5. Auto-submit on complete",
        codeTitle: "zen-complete fires when all slots are filled",
        code: `<zen-input-otp max-length="6"></zen-input-otp>

field.addEventListener("zen-complete", (e) => alert("Verifying " + e.detail));`,
        render: () => {
          const field = otp({ maxLength: 6 });
          field.addEventListener("zen-complete", (e) =>
            alert(`Verifying ${(e as CustomEvent).detail as string}`),
          );
          return field;
        },
      },
    ],
  });
}
