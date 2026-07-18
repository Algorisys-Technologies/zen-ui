import { type JSX, createSignal } from "solid-js";
import { MaskInput } from "./form/mask-input/mask-input";
import { Badge } from "./badge/badge";
import { DemoPage, DemoSection } from "./demo-helpers";

const FIELD: JSX.CSSProperties = {
  display: "flex",
  "flex-direction": "column",
  gap: "8px",
  "max-width": "320px",
};

const NewMaskInputDemo = () => {
  const [plate, setPlate] = createSignal({ masked: "", raw: "", complete: false });
  const [phone, setPhone] = createSignal({ masked: "", raw: "", complete: false });
  const [serial, setSerial] = createSignal("");

  return (
    <DemoPage
      title="MaskInput"
      description={
        <>
          One input, a fixed template, and characters that can only land where they
          are allowed. <code>9</code> is a digit, <code>a</code> a letter,{" "}
          <code>*</code> either; everything else is a literal the user never types
          and never deletes. The engine lives in{" "}
          <code>@algorisys/zen-ui-core/mask</code>, shared by both bindings, so the
          two cannot disagree about what a mask means.
        </>
      }
    >
      <DemoSection
        title="1. A mask and its two values"
        codeTitle="value is the masked string; onValueChange gives you both"
        codeDescription="The literals appear as you reach them — type 12 and the dash arrives on its own. value is what the field shows and what a native form would submit; raw is the same characters without the furniture. Store whichever you need, it is one destructure away."
        code={`<MaskInput
  mask="aa-9999"
  onValueChange={(masked, raw, complete) => setPlate({ masked, raw, complete })}
/>

// typing "ab1234"  ->  masked "ab-1234"   raw "ab1234"   complete true`}
      >
        <div style={FIELD}>
          <MaskInput
            mask="aa-9999"
            onValueChange={(masked, raw, complete) => setPlate({ masked, raw, complete })}
          />
          <p class="zen-m-0 zen-text-xs zen-text-zen-muted-fg">
            masked → <code>{plate().masked || "—"}</code> · raw →{" "}
            <code>{plate().raw || "—"}</code> ·{" "}
            {plate().complete ? (
              <Badge variant="soft" color="success">complete</Badge>
            ) : (
              <Badge variant="soft" color="neutral">incomplete</Badge>
            )}
          </p>
        </div>
      </DemoSection>

      <DemoSection
        title="2. The mask rejects, it does not complain"
        codeTitle="A character that cannot go there never lands"
        codeDescription="Try typing letters into the digits, or digits into the letters. Nothing is rejected with an error, because nothing invalid is ever entered — the wrong character simply does not appear. That is the difference between a mask and validation: validation tells you afterwards."
        code={`<MaskInput mask="aa-9999" />   // "ab-12", never "12-ab"`}
      >
        <div style={FIELD}>
          <MaskInput mask="aa-9999" defaultValue="ab-12" />
        </div>
      </DemoSection>

      <DemoSection
        title="3. Escaping a literal"
        codeTitle="A backslash makes the next character a literal"
        codeDescription="A dialling code is the trap this exists for: in '+91 99999 99999' the 9 of +91 IS a rule symbol, so the mask silently holds one more digit than you meant. Escape it and +91 becomes furniture — try it: you cannot delete the prefix."
        code={String.raw`// wrong: 11 slots, the +91 is editable
<MaskInput mask="+91 99999 99999" />

// right: 10 slots, +91 is furniture
<MaskInput mask="+\9\1 99999 99999" />`}
      >
        <div style={FIELD}>
          <MaskInput
            mask={String.raw`+\9\1 99999 99999`}
            onValueChange={(masked, raw, complete) => setPhone({ masked, raw, complete })}
          />
          <p class="zen-m-0 zen-text-xs zen-text-zen-muted-fg">
            masked → <code>{phone().masked || "—"}</code> · raw →{" "}
            <code>{phone().raw || "—"}</code>
          </p>
        </div>
      </DemoSection>

      <DemoSection
        title="4. Your own symbols"
        codeTitle="rules merges with the defaults; it does not replace them"
        codeDescription="Define A as an uppercase letter and 9 still means a digit. Overriding one symbol must not silently drop the other two."
        code={`<MaskInput
  mask="AAA-999"
  rules={{ A: /[A-Z]/ }}
  placeholderChar="•"
/>`}
      >
        <div style={FIELD}>
          <MaskInput
            mask="AAA-999"
            rules={{ A: /[A-Z]/ }}
            placeholderChar="•"
            value={serial()}
            onValueChange={(masked) => setSerial(masked)}
          />
          <p class="zen-m-0 zen-text-xs zen-text-zen-muted-fg">
            lowercase is refused; try <code>ABC123</code> → <code>{serial() || "—"}</code>
          </p>
        </div>
      </DemoSection>

      <DemoSection
        title="5. Paste"
        codeTitle="Paste is the reason the mask forgives"
        codeDescription="Paste '(020) 7946 0018' into a 10-digit mask and the digits are found; the brackets and spaces are skipped rather than eating slots. Paste is the case a mask has to survive, because nobody types a phone number they were sent."
        code={`<MaskInput mask="99999 999999" />
// paste "(020) 7946 0018"  ->  "02079 460018"`}
      >
        <div style={FIELD}>
          <MaskInput mask="99999 999999" defaultValue="(020) 7946 0018" />
          <p class="zen-m-0 zen-text-xs zen-text-zen-muted-fg">
            seeded with the messy string above — the engine kept the digits
          </p>
        </div>
      </DemoSection>
    </DemoPage>
  );
};

export default NewMaskInputDemo;
