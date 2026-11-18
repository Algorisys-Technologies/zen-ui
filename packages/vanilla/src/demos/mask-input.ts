import { MaskInput } from "../components/form/mask-input/mask-input";
import { Badge } from "../components/badge/badge";
import { DemoPage } from "./demo-helpers";

/**
 * MaskInput demo — the vanilla mirror of the React page. State that React keeps
 * in useState is a plain readout node here, written from onValueChange.
 */

const field = (children: Node[]): HTMLElement => {
  const d = document.createElement("div");
  d.style.display = "flex";
  d.style.flexDirection = "column";
  d.style.gap = "8px";
  d.style.maxWidth = "320px";
  d.append(...children);
  return d;
};

const note = (): HTMLParagraphElement => {
  const p = document.createElement("p");
  p.className = "zen-m-0 zen-text-xs zen-text-zen-muted-fg";
  return p;
};

const code = (text: string): HTMLElement => {
  const c = document.createElement("code");
  c.textContent = text;
  return c;
};

/** "masked → … · raw → …" with live <code> slots. */
function valueReadout(): { el: HTMLParagraphElement; masked: HTMLElement; raw: HTMLElement } {
  const el = note();
  const masked = code("—");
  const raw = code("—");
  el.append("masked → ", masked, " · raw → ", raw);
  return { el, masked, raw };
}

export default function MaskInputDemo(): HTMLElement {
  return DemoPage({
    title: "MaskInput",
    description:
      "One input, a fixed template, and characters that can only land where they are allowed. 9 is a digit, a a letter, * either; everything else is a literal the user never types and never deletes. The engine lives in @algorisys/zen-ui-core/mask, shared by every binding, so they cannot disagree about what a mask means.",
    sections: [
      {
        title: "1. A mask and its two values",
        codeTitle: "value is the masked string; onValueChange gives you both",
        codeDescription:
          "The literals appear as you reach them — type 12 and the dash arrives on its own. value is what the field shows and what a native form would submit; raw is the same characters without the furniture. Store whichever you need, it is one destructure away.",
        code: `MaskInput({
  mask: "aa-9999",
  onValueChange: (masked, raw, complete) => { plate = { masked, raw, complete }; },
});

// typing "ab1234"  ->  masked "ab-1234"   raw "ab1234"   complete true`,
        render: () => {
          const out = valueReadout();
          const badge = Badge({ variant: "soft", color: "neutral", children: "incomplete" });
          out.el.append(" · ", badge.el);
          const input = MaskInput({
            mask: "aa-9999",
            onValueChange: (masked, raw, complete) => {
              out.masked.textContent = masked || "—";
              out.raw.textContent = raw || "—";
              badge.update(
                complete
                  ? { color: "success", children: "complete" }
                  : { color: "neutral", children: "incomplete" },
              );
            },
          });
          return field([input.el, out.el]);
        },
      },
      {
        title: "2. The mask rejects, it does not complain",
        codeTitle: "A character that cannot go there never lands",
        codeDescription:
          "Try typing letters into the digits, or digits into the letters. Nothing is rejected with an error, because nothing invalid is ever entered — the wrong character simply does not appear. That is the difference between a mask and validation: validation tells you afterwards.",
        code: `MaskInput({ mask: "aa-9999" });   // "ab-12", never "12-ab"`,
        render: () => field([MaskInput({ mask: "aa-9999", defaultValue: "ab-12" }).el]),
      },
      {
        title: "3. Escaping a literal",
        codeTitle: "A backslash makes the next character a literal",
        codeDescription:
          "A dialling code is the trap this exists for: in '+91 99999 99999' the 9 of +91 IS a rule symbol, so the mask silently holds one more digit than you meant. Escape it and +91 becomes furniture — try it: you cannot delete the prefix.",
        // Shown as a JS string literal, so each mask backslash is doubled.
        code: String.raw`// wrong: 11 slots, the +91 is editable
MaskInput({ mask: "+91 99999 99999" });

// right: 10 slots, +91 is furniture
MaskInput({ mask: "+\\9\\1 99999 99999" });`,
        render: () => {
          const out = valueReadout();
          const input = MaskInput({
            mask: String.raw`+\9\1 99999 99999`,
            onValueChange: (masked, raw) => {
              out.masked.textContent = masked || "—";
              out.raw.textContent = raw || "—";
            },
          });
          return field([input.el, out.el]);
        },
      },
      {
        title: "4. Your own symbols",
        codeTitle: "rules merges with the defaults; it does not replace them",
        codeDescription:
          "Define A as an uppercase letter and 9 still means a digit. Overriding one symbol must not silently drop the other two.",
        code: `MaskInput({
  mask: "AAA-999",
  rules: { A: /[A-Z]/ },
  placeholderChar: "•",
});`,
        render: () => {
          const serial = code("—");
          const p = note();
          p.append("lowercase is refused; try ", code("ABC123"), " → ", serial);
          const input = MaskInput({
            mask: "AAA-999",
            rules: { A: /[A-Z]/ },
            placeholderChar: "•",
            onValueChange: (masked) => {
              serial.textContent = masked || "—";
            },
          });
          return field([input.el, p]);
        },
      },
      {
        title: "5. Paste",
        codeTitle: "Paste is the reason the mask forgives",
        codeDescription:
          "Paste '(020) 7946 0018' into a 10-digit mask and the digits are found; the brackets and spaces are skipped rather than eating slots. Paste is the case a mask has to survive, because nobody types a phone number they were sent.",
        code: `MaskInput({ mask: "99999 999999" });
// paste "(020) 7946 0018"  ->  "02079 460018"`,
        render: () => {
          const p = note();
          p.textContent = "seeded with the messy string above — the engine kept the digits";
          return field([MaskInput({ mask: "99999 999999", defaultValue: "(020) 7946 0018" }).el, p]);
        },
      },
    ],
  });
}
