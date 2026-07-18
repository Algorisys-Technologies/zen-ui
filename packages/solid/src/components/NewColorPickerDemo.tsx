import { type JSX, createSignal } from "solid-js";
import { ColorPicker } from "./color-picker/color-picker";
import { ColorPalette } from "./color-picker/color-palette";
import { DemoPage, DemoSection } from "./demo-helpers";

const BRAND = [
  { value: "#1e3a8a", label: "Navy" },
  { value: "#3b82f6", label: "Ocean" },
  { value: "#facc15", label: "Sun" },
  { value: "#22c55e", label: "Moss" },
  { value: "#ef4444", label: "Signal" },
];

const COL: JSX.CSSProperties = {
  display: "flex",
  "flex-direction": "column",
  gap: "10px",
  "align-items": "flex-start",
};

const NewColorPickerDemo = () => {
  const [brand, setBrand] = createSignal("#3b82f6");
  const [swatch, setSwatch] = createSignal("#22c55e");
  const [themed, setThemed] = createSignal("#7c3aed");

  return (
    <DemoPage
      title="ColorPicker"
      description={
        <>
          A swatch that opens a palette, a hex field and the platform's own picker.
          The colour maths lives in <code>@algorisys/zen-ui-core/color</code>,
          shared by both bindings, so the two cannot disagree about what a colour
          is. Hex in, hex out — normalised, so <code>#FFF</code> and{" "}
          <code>#ffffff</code> are one colour rather than two.
        </>
      }
    >
      <DemoSection
        title="1. The picker"
        codeTitle="A palette, a hex field, and the OS picker"
        codeDescription="The gradient area is the platform's own <input type='color'>, not a hand-rolled canvas. That is deliberate: the native one is keyboard-accessible, screen-reader-labelled, eyedropper-equipped and localised everywhere, for free and with no dependency. A canvas would be a worse reimplementation of all of it."
        code={`const [brand, setBrand] = createSignal("#3b82f6");

<ColorPicker value={brand()} onValueChange={setBrand} />`}
      >
        <div style={COL}>
          <ColorPicker value={brand()} onValueChange={setBrand} />
          <p class="zen-m-0 zen-text-xs zen-text-zen-muted-fg">
            value → <code>{brand()}</code>
          </p>
        </div>
      </DemoSection>

      <DemoSection
        title="2. A brand palette, and nothing else"
        codeTitle="allowCustom={false} — when off-brand is not an option"
        codeDescription="Pass your own colours and drop the custom field. The picker then cannot produce a colour outside the palette, which is the point: a brand picker that lets someone type #ff00ff is not a brand picker."
        code={`const BRAND = [
  { value: "#1e3a8a", label: "Navy" },
  { value: "#3b82f6", label: "Ocean" },
  …
];

<ColorPicker colors={BRAND} allowCustom={false} value={c()} onValueChange={setC} />`}
      >
        <div style={COL}>
          <ColorPicker
            colors={BRAND}
            allowCustom={false}
            value={themed()}
            onValueChange={setThemed}
            placeholder="Pick a brand colour"
          />
          <p class="zen-m-0 zen-text-xs zen-text-zen-muted-fg">
            value → <code>{themed()}</code> — starts off-palette, and the picker
            cannot get back there
          </p>
        </div>
      </DemoSection>

      <DemoSection
        title="3. The palette on its own"
        codeTitle="ColorPalette — a radiogroup that happens to be coloured"
        codeDescription="'Pick one of these' is the same question whatever the options look like, so it gets the same contract as Rating and Likert: arrows move, Home/End jump, one tab stop for the group. The tick is black or white depending on the swatch — a fixed colour disappears at one end of every palette. Try arrowing through it."
        code={`<ColorPalette
  colors={BRAND}
  value={colour()}
  onValueChange={setColour}
  label="Accent colour"
/>`}
      >
        <div style={COL}>
          <ColorPalette
            colors={BRAND}
            value={swatch()}
            onValueChange={setSwatch}
            label="Accent colour"
            size="lg"
          />
          <p class="zen-m-0 zen-text-xs zen-text-zen-muted-fg">
            value → <code>{swatch()}</code>
          </p>
        </div>
      </DemoSection>

      <DemoSection
        title="4. Naming the colours"
        codeTitle="A hex is not an accessible name"
        codeDescription="Bare hex strings are accepted, and each is announced as its hex — '#3b82f6' tells a listener nothing. Pass a label and the swatch has a name. The two forms can be mixed, because a design system should not force ceremony on a throwaway palette."
        code={`// announced as "#3b82f6"
<ColorPalette colors={["#3b82f6", "#ef4444"]} />

// announced as "Ocean"
<ColorPalette colors={[{ value: "#3b82f6", label: "Ocean" }]} />`}
      >
        <div style={COL}>
          <ColorPalette colors={["#3b82f6", "#ef4444", "#22c55e"]} label="Unnamed" />
          <ColorPalette colors={BRAND} label="Named" />
        </div>
      </DemoSection>
    </DemoPage>
  );
};

export default NewColorPickerDemo;
