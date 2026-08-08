import { Label } from "./form/label/label";
import { Input } from "./form/input/input";
import { Checkbox } from "./form/checkbox/checkbox";
import { CodeExample } from "./demo-helpers";

const NewLabelDemo: React.FC = () => {
  return (
    <div className="demo-page">
      <h1>Label</h1>
      <p className="lede">
        The <code>&lt;label&gt;</code> for a control that is not inside a Form.
        Inside <code>&lt;Form&gt;</code>, FormLabel is the right one — it reads
        the field context, wires <code>htmlFor</code> to the generated item id,
        and turns red on error. This is the other half: the label for a control
        the form-builder does not own.
      </p>

      <section className="demo-section">
        <h2>1. With a control</h2>
        <CodeExample
          title="htmlFor names the control"
          description="Clicking the label focuses the input it names — the whole reason to use a <label> rather than a <span>."
          code={`<div className="zen-space-y-1.5 zen-w-72">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="you@example.com" />
</div>`}
        >
          <div className="zen-space-y-1.5 zen-w-72">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Required</h2>
        <CodeExample
          title="required"
          description="The asterisk is decoration — aria-hidden — because a bare '*' is not a word a screen reader conveys as 'required'. The requirement is stated in sr-only text beside it."
          code={`<Label htmlFor="legal-name" required>Legal name</Label>
<Input id="legal-name" />`}
        >
          <div className="zen-space-y-1.5 zen-w-72">
            <Label htmlFor="legal-name" required>
              Legal name
            </Label>
            <Input id="legal-name" placeholder="As printed on your passport" />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. Sizes</h2>
        <CodeExample
          title="sm / md / lg"
          description="md is the default and matches FormLabel, so a page mixing bound and unbound fields stays on one type scale."
          code={`<Label size="sm">Small</Label>
<Label size="md">Medium</Label>
<Label size="lg">Large</Label>`}
        >
          <div className="zen-flex zen-items-baseline zen-gap-6">
            <Label size="sm">Small</Label>
            <Label size="md">Medium</Label>
            <Label size="lg">Large</Label>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. Beside a disabled control</h2>
        <CodeExample
          title="peer-disabled"
          description="Checkbox is a Radix button carrying zen-peer, and a button matches :disabled — so a sibling label dims with no prop. This does NOT hold in the Solid binding, where Kobalte nests its control inside a wrapper."
          code={`<div className="zen-flex zen-items-center zen-gap-2">
  <Checkbox id="terms" disabled />
  <Label htmlFor="terms">Accept the terms</Label>
</div>`}
        >
          <div className="zen-space-y-3">
            <div className="zen-flex zen-items-center zen-gap-2">
              <Checkbox id="terms-on" />
              <Label htmlFor="terms-on">Accept the terms</Label>
            </div>
            <div className="zen-flex zen-items-center zen-gap-2">
              <Checkbox id="terms-off" disabled />
              <Label htmlFor="terms-off">Accept the terms</Label>
            </div>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>5. Disabled</h2>
        <CodeExample
          title="disabled"
          description="Dims the label. It disables nothing — a label takes no input. This is the portable way to dim one, since the peer rules above cannot fire in every binding."
          code={`<Label htmlFor="frozen" disabled>Employee ID</Label>
<Input id="frozen" defaultValue="EMP-0041" disabled />`}
        >
          <div className="zen-space-y-1.5 zen-w-72">
            <Label htmlFor="frozen" disabled>
              Employee ID
            </Label>
            <Input id="frozen" defaultValue="EMP-0041" disabled />
          </div>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewLabelDemo;
