import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "./breadcrumb/breadcrumb";
import { CodeExample } from "./demo-helpers";

const NewBreadcrumbDemo: React.FC = () => (
  <div className="demo-page">
    <h1>Breadcrumb</h1>
    <p className="lede">
      Navigation trail. Accessible compound built on semantic{" "}
      <code>&lt;nav&gt;/&lt;ol&gt;/&lt;li&gt;</code>, themed via{" "}
      <code>--zen-*</code> tokens. <code>BreadcrumbLink</code> supports{" "}
      <code>asChild</code> so it can wrap a router <code>Link</code>.
    </p>

    <section className="demo-section">
      <h2>1. Basic</h2>
      <CodeExample
        title="Trail ending on the current page"
        code={`<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href="/settings">Settings</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Profile</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>`}
      >
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/settings">Settings</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Profile</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>2. Collapsed with ellipsis</h2>
      <CodeExample
        title="Use BreadcrumbEllipsis for long trails"
        code={`<BreadcrumbItem>
  <BreadcrumbEllipsis />
</BreadcrumbItem>`}
      >
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbEllipsis />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Final page</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>3. Custom separator</h2>
      <CodeExample
        title="Pass children to BreadcrumbSeparator"
        code={`<BreadcrumbSeparator>&rsaquo;</BreadcrumbSeparator>`}
      >
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>&rsaquo;</BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>Reports</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </CodeExample>
    </section>
  </div>
);

export default NewBreadcrumbDemo;
