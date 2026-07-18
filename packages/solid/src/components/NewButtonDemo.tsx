import { Button } from "./button/button";
import { DemoPage, DemoSection } from "./demo-helpers";

const NewButtonDemo = () => (
  <DemoPage
    title="Button"
    description={
      <>
        Solid port of the React Button. Polymorphic via <code>as</code> instead of{" "}
        <code>asChild</code>.
      </>
    }
  >
    <DemoSection
      title="Variants"
      description="solid · outline · soft · ghost · link"
      codeTitle={`variant — defaults to "solid"`}
      code={`<Button>Solid</Button>
<Button variant="outline">Outline</Button>
<Button variant="soft">Soft</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>`}
    >
      <Button>Solid</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="soft">Soft</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </DemoSection>

    <DemoSection
      title="Colours"
      codeTitle="All six color tokens"
      codeDescription="Colours map to --zen-color-* tokens — override those CSS variables to retheme."
      code={`<Button color="primary">Primary</Button>
<Button color="neutral">Neutral</Button>
<Button color="info">Info</Button>
<Button color="success">Success</Button>
<Button color="warning">Warning</Button>
<Button color="error">Error</Button>`}
    >
      <Button color="primary">Primary</Button>
      <Button color="neutral">Neutral</Button>
      <Button color="info">Info</Button>
      <Button color="success">Success</Button>
      <Button color="warning">Warning</Button>
      <Button color="error">Error</Button>
    </DemoSection>

    <DemoSection
      title="Sizes"
      codeTitle="xs · sm · md · lg · xl"
      code={`<Button size="xs">XS</Button>
<Button size="sm">SM</Button>
<Button size="md">MD</Button>
<Button size="lg">LG</Button>
<Button size="xl">XL</Button>`}
    >
      <Button size="xs">XS</Button>
      <Button size="sm">SM</Button>
      <Button size="md">MD</Button>
      <Button size="lg">LG</Button>
      <Button size="xl">XL</Button>
    </DemoSection>

    <DemoSection
      title="States"
      codeTitle="loading · disabled · iconLeft"
      codeDescription={
        <>
          While loading, a spinner replaces iconLeft and the button is disabled. Icons are
          passed as props (iconLeft / iconRight) rather than in children, so they survive{" "}
          <code>as</code> composition.
        </>
      }
      code={`<Button loading>Loading</Button>
<Button disabled>Disabled</Button>
<Button iconLeft={<span aria-hidden="true">+</span>}>With icon</Button>`}
    >
      <Button loading>Loading</Button>
      <Button disabled>Disabled</Button>
      <Button
        iconLeft={<span aria-hidden="true">+</span>}
      >
        With icon
      </Button>
    </DemoSection>

    <DemoSection
      title="Polymorphic (as)"
      description={
        <>
          Render the button styles on an <code>&lt;a&gt;</code> element.
        </>
      }
      codeTitle="as — Solid's answer to Radix asChild"
      codeDescription={
        <>
          Element-specific props (href, target, …) typecheck against whatever you pass to{" "}
          <code>as</code>. Pass {"as={A}"} from @solidjs/router for a client-side link.
        </>
      }
      code={`<Button as="a" href="#" variant="outline">
  Anchor link
</Button>`}
    >
      <Button as="a" href="#" variant="outline">
        Anchor link
      </Button>
    </DemoSection>
  </DemoPage>
);

export default NewButtonDemo;
