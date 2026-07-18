import { createSignal } from "solid-js";
import { Slider } from "./form/slider/slider";
import { DemoPage, DemoSection } from "./demo-helpers";

const NewSliderDemo = () => {
  const [single, setSingle] = createSignal([40]);
  const [range, setRange] = createSignal([20, 80]);
  const [freq, setFreq] = createSignal([3]);

  return (
    <DemoPage
      title="Slider"
      description="Single + range sliders built on Kobalte Slider. Full keyboard control."
    >
      <DemoSection
        title="Marks"
        codeTitle="Ticks along the track, with optional labels"
        codeDescription="Marks are decoration over the scale, not the scale itself — step still decides which values are reachable, so a mark at a value step cannot land on would draw a tick the thumb can never sit on. A mark with no label is just a tick. Horizontal only."
        code={`<Slider
  defaultValue={[3]}
  minValue={1}
  maxValue={5}
  step={1}
  marks={[
    { value: 1, label: "Never" },
    { value: 2 },
    { value: 3, label: "Sometimes" },
    { value: 4 },
    { value: 5, label: "Always" },
  ]}
/>`}
      >
        <div style={{ width: "100%", "max-width": "460px", "padding-bottom": "8px" }}>
          <Slider
            value={freq()}
            onChange={setFreq}
            minValue={1}
            maxValue={5}
            step={1}
            marks={[
              { value: 1, label: "Never" },
              { value: 2 },
              { value: 3, label: "Sometimes" },
              { value: 4 },
              { value: 5, label: "Always" },
            ]}
          />
          <p class="zen-mt-8 zen-mb-0 zen-text-xs zen-text-zen-muted-fg">
            value → <code>{freq()[0]}</code>
          </p>
        </div>
      </DemoSection>

      <DemoSection
        title="Single (controlled)"
        codeTitle="value is a number[] — call the signal to read it"
        code={`const [single, setSingle] = createSignal([40]);

<Slider value={single()} onChange={setSingle} maxValue={100} step={1} />
<div class="zen-text-xs zen-text-zen-muted-fg">Value: {single()[0]}</div>`}
      >
        <div class="zen-w-80 zen-flex zen-flex-col zen-gap-2">
          <Slider value={single()} onChange={setSingle} maxValue={100} step={1} />
          <div class="zen-text-xs zen-text-zen-muted-fg">Value: {single()[0]}</div>
        </div>
      </DemoSection>

      <DemoSection
        title="Range (controlled)"
        codeTitle="Two values make it a multi-thumb range"
        code={`const [range, setRange] = createSignal([20, 80]);

<Slider value={range()} onChange={setRange} maxValue={100} step={5} />
<div class="zen-text-xs zen-text-zen-muted-fg">
  Range: {range()[0]} – {range()[1]}
</div>`}
      >
        <div class="zen-w-80 zen-flex zen-flex-col zen-gap-2">
          <Slider value={range()} onChange={setRange} maxValue={100} step={5} />
          <div class="zen-text-xs zen-text-zen-muted-fg">
            Range: {range()[0]} – {range()[1]}
          </div>
        </div>
      </DemoSection>

      <DemoSection
        title="Disabled"
        codeTitle="disabled prop"
        code={`<Slider defaultValue={[60]} disabled />`}
      >
        <div class="zen-w-80">
          <Slider defaultValue={[60]} disabled />
        </div>
      </DemoSection>
    </DemoPage>
  );
};

export default NewSliderDemo;
