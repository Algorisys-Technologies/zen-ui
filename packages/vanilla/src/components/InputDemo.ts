import { Input } from "./form/input/input";
import { MaskInput } from "./form/mask-input/mask-input";
import { DemoPage } from "./demo-helpers";

const field = (node: Node, note?: HTMLElement) => {
  const w = document.createElement("div");
  w.style.width = "260px";
  w.append(node);
  if (note) w.append(note);
  return w;
};

const readout = () => {
  const p = document.createElement("p");
  p.style.fontSize = "0.75rem";
  p.style.color = "var(--zen-color-muted-fg)";
  p.style.margin = "0.35rem 0 0";
  return p;
};

export default function InputDemo(): HTMLElement {
  return DemoPage({
    title: "Input + MaskInput",
    description:
      "MaskInput is the proof that core's pure logic reaches a binding with no framework: applyMask, extractRaw and isMaskComplete are the SAME functions React and Solid call. Nothing about what a mask means is reimplemented here — this file is only the DOM half.",
    sections: [
      {
        title: "1. Input",
        codeTitle: "a styled <input>",
        codeDescription:
          "React forwards a ref so the caller can reach the node. Here the node IS the handle, so there is nothing to forward.",
        code: `const email = Input({ type: "email", placeholder: "you@algorisys.com" });
form.append(email.el);
email.el.value;   // just an <input>`,
        render: () => field(Input({ type: "email", placeholder: "you@algorisys.com" }).el),
      },
      {
        title: "2. Mask — digits",
        codeTitle: 'mask="99-9999"',
        codeDescription:
          "9 is a digit, a is a letter, * is either. Anything else is a literal the user never types and never deletes. The placeholder skeleton comes from maskSkeleton() in core.",
        code: `MaskInput({
  mask: "99-9999",
  onValueChange: (masked, raw, complete) => console.log({ masked, raw, complete }),
})`,
        render: () => {
          const out = readout();
          out.textContent = "masked: — · raw: — · complete: false";
          const m = MaskInput({
            mask: "99-9999",
            onValueChange: (masked, raw, complete) =>
              (out.textContent = `masked: ${masked || "—"} · raw: ${raw || "—"} · complete: ${complete}`),
          });
          return field(m.el, out);
        },
      },
      {
        title: "3. Mask — letters and an escaped literal",
        codeTitle: "backslash escapes a rule symbol",
        codeDescription:
          "The dialling code is escaped so the 9 and 1 are literals rather than digit slots. Backspace deletes a DATA character, not the trailing literal — without that the field jams and swallows every backspace forever.",
        code: `MaskInput({ mask: "aa-99" })
MaskInput({ mask: "+\\\\9\\\\1 99999 99999" })`,
        render: () => {
          const a = MaskInput({ mask: "aa-99" });
          const b = MaskInput({ mask: "+\\9\\1 99999 99999" });
          const row = document.createElement("div");
          row.style.display = "flex";
          row.style.gap = "0.75rem";
          row.style.flexWrap = "wrap";
          row.append(field(a.el), field(b.el));
          return row;
        },
      },
      {
        title: "4. Disabled",
        code: `Input({ placeholder: "Read-only", disabled: true })`,
        render: () => field(Input({ placeholder: "Disabled", disabled: true }).el),
      },
    ],
  });
}
