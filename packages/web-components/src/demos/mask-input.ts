import { DemoPage } from "./demo-helpers";

/**
 * MaskInput demo — the web-components mirror of the vanilla page. Renders
 * <zen-mask-input>; `mask`, `default-value` and `placeholder-char` are
 * attributes, `rules` (an object of RegExps) is a JS property, and the change
 * arrives as `zen-value-change` with detail `[masked, raw, complete]`. State the
 * vanilla page writes from onValueChange is a plain readout node here too.
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

function maskInput(attrs: Record<string, string>): HTMLElement {
  const m = document.createElement("zen-mask-input");
  for (const [k, v] of Object.entries(attrs)) m.setAttribute(k, v);
  return m;
}

/** Subscribe to zen-value-change, unpacking its `[masked, raw, complete]` detail. */
function onValue(
  host: HTMLElement,
  fn: (masked: string, raw: string, complete: boolean) => void,
): void {
  host.addEventListener("zen-value-change", (e) => {
    const [masked, raw, complete] = (e as CustomEvent).detail as [string, string, boolean];
    fn(masked, raw, complete);
  });
}

/** "masked → … · raw → …" with live <code> slots. */
function valueReadout(): { el: HTMLParagraphElement; masked: HTMLElement; raw: HTMLElement } {
  const el = note();
  const masked = code("—");
  const raw = code("—");
  el.append("masked → ", masked, " · raw → ", raw);
  return { el, masked, raw };
}

/** A soft <zen-badge>. Its text is slotted, so a new label is a new element. */
function badge(color: string, text: string): HTMLElement {
  const b = document.createElement("zen-badge");
  b.setAttribute("variant", "soft");
  b.setAttribute("color", color);
  b.textContent = text;
  return b;
}

export default function MaskInputDemo(): HTMLElement {
  return DemoPage({
    title: "MaskInput",
    description:
      "One input, a fixed template, and characters that can only land where they are allowed. 9 is a digit, a a letter, * either; everything else is a literal the user never types and never deletes. The engine lives in @algorisys/zen-ui-core/mask, shared by every binding, so they cannot disagree about what a mask means.",
    sections: [
      {
        title: "1. A mask and its two values",
        codeTitle: "value is the masked string; zen-value-change gives you both",
        codeDescription:
          "The literals appear as you reach them — type 12 and the dash arrives on its own. value is what the field shows and what a native form would submit; raw is the same characters without the furniture. Store whichever you need, it is one destructure away.",
        code: `<zen-mask-input mask="aa-9999"></zen-mask-input>

el.addEventListener("zen-value-change", (e) => {
  const [masked, raw, complete] = e.detail;
  plate = { masked, raw, complete };
});

// typing "ab1234"  ->  masked "ab-1234"   raw "ab1234"   complete true`,
        render: () => {
          const out = valueReadout();
          let status = badge("neutral", "incomplete");
          let wasComplete = false;
          out.el.append(" · ", status);
          const input = maskInput({ mask: "aa-9999" });
          onValue(input, (masked, raw, complete) => {
            out.masked.textContent = masked || "—";
            out.raw.textContent = raw || "—";
            if (complete === wasComplete) return;
            wasComplete = complete;
            const next = complete ? badge("success", "complete") : badge("neutral", "incomplete");
            status.replaceWith(next);
            status = next;
          });
          return field([input, out.el]);
        },
      },
      {
        title: "2. The mask rejects, it does not complain",
        codeTitle: "A character that cannot go there never lands",
        codeDescription:
          "Try typing letters into the digits, or digits into the letters. Nothing is rejected with an error, because nothing invalid is ever entered — the wrong character simply does not appear. That is the difference between a mask and validation: validation tells you afterwards.",
        code: `<zen-mask-input mask="aa-9999"></zen-mask-input>   <!-- "ab-12", never "12-ab" -->`,
        render: () => field([maskInput({ mask: "aa-9999", "default-value": "ab-12" })]),
      },
      {
        title: "3. Escaping a literal",
        codeTitle: "A backslash makes the next character a literal",
        codeDescription:
          "A dialling code is the trap this exists for: in '+91 99999 99999' the 9 of +91 IS a rule symbol, so the mask silently holds one more digit than you meant. Escape it and +91 becomes furniture — try it: you cannot delete the prefix.",
        // In an HTML attribute a backslash is just a character, so it is single.
        code: String.raw`<!-- wrong: 11 slots, the +91 is editable -->
<zen-mask-input mask="+91 99999 99999"></zen-mask-input>

<!-- right: 10 slots, +91 is furniture -->
<zen-mask-input mask="+\9\1 99999 99999"></zen-mask-input>`,
        render: () => {
          const out = valueReadout();
          const input = maskInput({ mask: String.raw`+\9\1 99999 99999` });
          onValue(input, (masked, raw) => {
            out.masked.textContent = masked || "—";
            out.raw.textContent = raw || "—";
          });
          return field([input, out.el]);
        },
      },
      {
        title: "4. Your own symbols",
        codeTitle: "rules merges with the defaults; it does not replace them",
        codeDescription:
          "Define A as an uppercase letter and 9 still means a digit. Overriding one symbol must not silently drop the other two.",
        code: `<zen-mask-input mask="AAA-999" placeholder-char="•"></zen-mask-input>

el.rules = { A: /[A-Z]/ };   // an object of RegExps — a property, not an attribute`,
        render: () => {
          const serial = code("—");
          const p = note();
          p.append("lowercase is refused; try ", code("ABC123"), " → ", serial);
          const input = maskInput({ mask: "AAA-999", "placeholder-char": "•" });
          (input as unknown as { rules: Record<string, RegExp> }).rules = { A: /[A-Z]/ };
          onValue(input, (masked) => {
            serial.textContent = masked || "—";
          });
          return field([input, p]);
        },
      },
      {
        title: "5. Paste",
        codeTitle: "Paste is the reason the mask forgives",
        codeDescription:
          "Paste '(020) 7946 0018' into a 10-digit mask and the digits are found; the brackets and spaces are skipped rather than eating slots. Paste is the case a mask has to survive, because nobody types a phone number they were sent.",
        code: `<zen-mask-input mask="99999 999999"></zen-mask-input>
<!-- paste "(020) 7946 0018"  ->  "02079 460018" -->`,
        render: () => {
          const p = note();
          p.textContent = "seeded with the messy string above — the engine kept the digits";
          return field([maskInput({ mask: "99999 999999", "default-value": "(020) 7946 0018" }), p]);
        },
      },
    ],
  });
}
