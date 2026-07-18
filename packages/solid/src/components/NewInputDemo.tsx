import { Input, Textarea } from "./form/input/input";
import { DemoPage, DemoSection } from "./demo-helpers";

const NewInputDemo = () => (
  <DemoPage title="Input + Textarea" description="Styled native <input> and <textarea>.">
    <DemoSection
      title="Input variants"
      codeTitle="Pass any native input attribute"
      codeDescription="No built-in label / error / icon scaffolding — compose those at the call site."
      code={`<Input type="text" placeholder="Type something" />
<Input type="email" placeholder="you@algorisys.com" />
<Input type="password" placeholder="Password" />
<Input type="text" placeholder="Disabled" disabled />`}
    >
      <div class="zen-w-64 zen-flex zen-flex-col zen-gap-2">
        <Input type="text" placeholder="Type something" />
        <Input type="email" placeholder="you@algorisys.com" />
        <Input type="password" placeholder="Password" />
        <Input type="text" placeholder="Disabled" disabled />
      </div>
    </DemoSection>
    <DemoSection
      title="Textarea"
      codeTitle="Same primitive shape, taller minimum height"
      codeDescription="To control it, read the signal in value and set it from the input event."
      code={`<Textarea placeholder="Tell us about your project…" rows={4} />

{/* controlled */}
const [bio, setBio] = createSignal("");

<Textarea
  rows={4}
  value={bio()}
  onInput={(e) => setBio(e.currentTarget.value)}
/>`}
    >
      <div class="zen-w-64">
        <Textarea placeholder="Tell us about your project…" rows={4} />
      </div>
    </DemoSection>
  </DemoPage>
);

export default NewInputDemo;
