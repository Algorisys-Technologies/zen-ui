import { Loading } from "./loading/loading";
import { DemoPage, DemoSection } from "./demo-helpers";

const NewLoadingDemo = () => (
  <DemoPage
    title="Loading"
    description="Animated spinner with sr-only label. Use inline or in disabled buttons."
  >
    <DemoSection
      title="Sizes"
      codeTitle="sm · md · lg · xl"
      code={`<Loading size="sm" />
<Loading size="md" />
<Loading size="lg" />
<Loading size="xl" />`}
    >
      <Loading size="sm" />
      <Loading size="md" />
      <Loading size="lg" />
      <Loading size="xl" />
    </DemoSection>

    <DemoSection
      title="Colours"
      codeTitle="primary · neutral · info · success · warning · error · current"
      codeDescription={`Use "current" to inherit the surrounding text colour — handy when nesting Loading inside a Button.`}
      code={`<Loading color="primary" />
<Loading color="neutral" />
<Loading color="info" />
<Loading color="success" />
<Loading color="warning" />
<Loading color="error" />

{/* inherits the parent's text colour */}
<Button disabled>
  <Loading color="current" size="sm" label="" />
  Saving…
</Button>`}
    >
      <Loading color="primary" />
      <Loading color="neutral" />
      <Loading color="info" />
      <Loading color="success" />
      <Loading color="warning" />
      <Loading color="error" />
    </DemoSection>

    <DemoSection
      title="Custom label"
      codeTitle="label overrides the sr-only default of “Loading”"
      codeDescription={`Pass label="" to mark the spinner decorative — the parent then carries the loading semantics (e.g. aria-busy).`}
      code={`<Loading size="lg" label="Saving changes" />`}
    >
      <Loading size="lg" label="Saving changes" />
    </DemoSection>
  </DemoPage>
);

export default NewLoadingDemo;
