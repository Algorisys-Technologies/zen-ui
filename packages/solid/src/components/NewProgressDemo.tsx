import { createSignal, onCleanup, onMount } from "solid-js";
import { Progress } from "./progress/progress";
import { DemoPage, DemoSection } from "./demo-helpers";

const NewProgressDemo = () => {
  const [v, setV] = createSignal(0);
  onMount(() => {
    const id = setInterval(() => {
      setV((p) => (p >= 100 ? 0 : p + 5));
    }, 500);
    onCleanup(() => clearInterval(id));
  });

  return (
    <DemoPage
      title="Progress"
      description="Determinate / indeterminate progress bar built on Kobalte Progress."
    >
      <DemoSection
        title="Animated · primary"
        codeTitle="Drive value from a signal — Kobalte updates aria-valuenow"
        code={`const [v, setV] = createSignal(0);

onMount(() => {
  const id = setInterval(() => {
    setV((p) => (p >= 100 ? 0 : p + 5));
  }, 500);
  onCleanup(() => clearInterval(id));
});

<Progress value={v()} />`}
      >
        <div class="zen-w-80">
          <Progress value={v()} />
        </div>
      </DemoSection>

      <DemoSection
        title="Sizes"
        codeTitle="sm · md · lg — track height only"
        code={`<Progress size="sm" value={45} />
<Progress size="md" value={65} />
<Progress size="lg" value={85} />`}
      >
        <div class="zen-flex zen-flex-col zen-gap-2 zen-w-80">
          <Progress size="sm" value={45} />
          <Progress size="md" value={65} />
          <Progress size="lg" value={85} />
        </div>
      </DemoSection>

      <DemoSection
        title="Colours"
        codeTitle="primary · success · warning · error · info · neutral"
        code={`<Progress value={60} color="primary" />
<Progress value={60} color="success" />
<Progress value={60} color="warning" />
<Progress value={60} color="error" />
<Progress value={60} color="info" />
<Progress value={60} color="neutral" />`}
      >
        <div class="zen-flex zen-flex-col zen-gap-2 zen-w-80">
          <Progress value={60} color="primary" />
          <Progress value={60} color="success" />
          <Progress value={60} color="warning" />
          <Progress value={60} color="error" />
          <Progress value={60} color="info" />
          <Progress value={60} color="neutral" />
        </div>
      </DemoSection>

      <DemoSection
        title="Indeterminate"
        codeTitle="Omit value and set indeterminate for unknown-duration work"
        code={`<Progress indeterminate />`}
      >
        <div class="zen-w-80">
          <Progress indeterminate />
        </div>
      </DemoSection>
    </DemoPage>
  );
};

export default NewProgressDemo;
