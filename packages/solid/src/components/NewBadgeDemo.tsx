import { Badge } from "./badge/badge";
import { CodeExample, DemoPage } from "./demo-helpers";

const NewBadgeDemo = () => (
  <DemoPage title="Badge" description="Status pill. Defaults to soft + primary.">
    <section class="demo-section">
      <h2>Variants</h2>
      <CodeExample
        title="solid · soft · outline"
        code={`<Badge variant="solid">Solid</Badge>
<Badge variant="soft">Soft</Badge>
<Badge variant="outline">Outline</Badge>`}
      >
        <Badge variant="solid">Solid</Badge>
        <Badge variant="soft">Soft</Badge>
        <Badge variant="outline">Outline</Badge>
      </CodeExample>
    </section>

    <section class="demo-section">
      <h2>Colours · solid</h2>
      <CodeExample
        title="Six semantic colours"
        code={`<Badge variant="solid" color="primary">Primary</Badge>
<Badge variant="solid" color="neutral">Neutral</Badge>
<Badge variant="solid" color="info">Info</Badge>
<Badge variant="solid" color="success">Success</Badge>
<Badge variant="solid" color="warning">Warning</Badge>
<Badge variant="solid" color="error">Error</Badge>`}
      >
        <Badge variant="solid" color="primary">Primary</Badge>
        <Badge variant="solid" color="neutral">Neutral</Badge>
        <Badge variant="solid" color="info">Info</Badge>
        <Badge variant="solid" color="success">Success</Badge>
        <Badge variant="solid" color="warning">Warning</Badge>
        <Badge variant="solid" color="error">Error</Badge>
      </CodeExample>
    </section>

    <section class="demo-section">
      <h2>Colours · soft</h2>
      <CodeExample
        title="soft is the default variant, so it can be omitted"
        code={`<Badge color="primary">Primary</Badge>
<Badge color="neutral">Neutral</Badge>
<Badge color="info">Info</Badge>
<Badge color="success">Success</Badge>
<Badge color="warning">Warning</Badge>
<Badge color="error">Error</Badge>`}
      >
        <Badge color="primary">Primary</Badge>
        <Badge color="neutral">Neutral</Badge>
        <Badge color="info">Info</Badge>
        <Badge color="success">Success</Badge>
        <Badge color="warning">Warning</Badge>
        <Badge color="error">Error</Badge>
      </CodeExample>
    </section>

    <section class="demo-section">
      <h2>With leading dot</h2>
      <CodeExample
        title="Status dots go in children as siblings"
        code={`<Badge color="success">
  <span class="zen-inline-block zen-w-1.5 zen-h-1.5 zen-rounded-zen-full zen-bg-zen-success" />
  Online
</Badge>`}
      >
        <Badge color="success">
          <span class="zen-inline-block zen-w-1.5 zen-h-1.5 zen-rounded-zen-full zen-bg-zen-success" />
          Online
        </Badge>
        <Badge color="warning">
          <span class="zen-inline-block zen-w-1.5 zen-h-1.5 zen-rounded-zen-full zen-bg-zen-warning" />
          Pending
        </Badge>
      </CodeExample>
    </section>

    <section class="demo-section">
      <h2>Polymorphic (`as`)</h2>
      <CodeExample
        title="Render the badge as an <a> (or <A> from @solidjs/router)"
        code={`<Badge as="a" href="#" color="info">
  Linkable badge
</Badge>`}
      >
        <Badge as="a" href="#" color="info">
          Linkable badge
        </Badge>
      </CodeExample>
    </section>
  </DemoPage>
);

export default NewBadgeDemo;
