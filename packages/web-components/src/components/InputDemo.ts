import { DemoPage } from "./demo-helpers";

/**
 * Input + MaskInput demo — the web-components port. <zen-input> is a styled
 * <input>; <zen-mask-input> drives core's applyMask / extractRaw / isMaskComplete
 * and fires `zen-value-change` with [masked, raw, complete].
 */

function field(node: Node, note?: HTMLElement): HTMLElement {
  const w = document.createElement("div");
  w.style.width = "260px";
  w.append(node);
  if (note) w.append(note);
  return w;
}

function readout(): HTMLParagraphElement {
  const p = document.createElement("p");
  p.style.fontSize = "0.75rem";
  p.style.color = "var(--zen-color-muted-fg)";
  p.style.margin = "0.35rem 0 0";
  return p;
}

function input(attrs: Record<string, string>): HTMLElement {
  const n = document.createElement("zen-input");
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  return n;
}

function maskInput(mask: string): HTMLElement {
  const n = document.createElement("zen-mask-input");
  n.setAttribute("mask", mask);
  return n;
}

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
          "The custom element IS the handle — reach the value through the native <input> that bubbles its events.",
        code: `<zen-input type="email" placeholder="you@algorisys.com"></zen-input>`,
        render: () => field(input({ type: "email", placeholder: "you@algorisys.com" })),
      },
      {
        title: "2. Mask — digits",
        codeTitle: 'mask="99-9999"',
        codeDescription:
          "9 is a digit, a is a letter, * is either. Anything else is a literal the user never types and never deletes. The placeholder skeleton comes from maskSkeleton() in core.",
        code: `<zen-mask-input mask="99-9999"></zen-mask-input>

el.addEventListener("zen-value-change", (e) => {
  const [masked, raw, complete] = e.detail;   // detail is [masked, raw, complete]
});`,
        render: () => {
          const out = readout();
          out.textContent = "masked: — · raw: — · complete: false";
          const m = maskInput("99-9999");
          m.addEventListener("zen-value-change", (e) => {
            const [masked, raw, complete] = (e as CustomEvent).detail as [string, string, boolean];
            out.textContent = `masked: ${masked || "—"} · raw: ${raw || "—"} · complete: ${complete}`;
          });
          return field(m, out);
        },
      },
      {
        title: "3. Mask — letters and an escaped literal",
        codeTitle: "backslash escapes a rule symbol",
        codeDescription:
          "The dialling code is escaped so the 9 and 1 are literals rather than digit slots. Backspace deletes a DATA character, not the trailing literal — without that the field jams and swallows every backspace forever.",
        code: `<zen-mask-input mask="aa-99"></zen-mask-input>
<zen-mask-input mask="+\\9\\1 99999 99999"></zen-mask-input>`,
        render: () => {
          const row = document.createElement("div");
          row.style.display = "flex";
          row.style.gap = "0.75rem";
          row.style.flexWrap = "wrap";
          row.append(field(maskInput("aa-99")), field(maskInput("+\\9\\1 99999 99999")));
          return row;
        },
      },
      {
        title: "4. Disabled",
        code: `<zen-input placeholder="Disabled" disabled></zen-input>`,
        render: () => field(input({ placeholder: "Disabled", disabled: "" })),
      },
    ],
  });
}
