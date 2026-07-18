import { createSignal } from "solid-js";
import { NPS } from "./survey/nps";
import { DemoPage, DemoSection } from "./demo-helpers";

const NewNpsDemo = () => {
  const [score, setScore] = createSignal<number | undefined>();
  return (
    <DemoPage
      title="NPS"
      description="0–10 Net Promoter Score strip with bucket colour cues."
    >
      <DemoSection
        title="Controlled"
        codeTitle="value + onValueChange"
        code={`const [score, setScore] = createSignal<number | undefined>();

<NPS value={score()} onValueChange={setScore} />`}
      >
        <NPS value={score()} onValueChange={setScore} />
      </DemoSection>

      <DemoSection
        title="Default uncontrolled"
        codeTitle="defaultValue — the component owns the score"
        code={`<NPS defaultValue={9} />`}
      >
        <NPS defaultValue={9} />
      </DemoSection>

      <DemoSection
        title="With custom anchors"
        codeTitle="Override the 0 / 10 anchor labels"
        code={`<NPS
  defaultValue={3}
  lowLabel="Wouldn't use it"
  highLabel="Use it every day"
/>`}
      >
        <NPS
          defaultValue={3}
          lowLabel="Wouldn't use it"
          highLabel="Use it every day"
        />
      </DemoSection>

      <DemoSection
        title="Disabled / read-only"
        codeTitle="disabled fades the strip; readOnly keeps it legible"
        code={`<NPS defaultValue={5} disabled />
<NPS defaultValue={8} readOnly />`}
      >
        <NPS defaultValue={5} disabled />
        <NPS defaultValue={8} readOnly />
      </DemoSection>
    </DemoPage>
  );
};

export default NewNpsDemo;
