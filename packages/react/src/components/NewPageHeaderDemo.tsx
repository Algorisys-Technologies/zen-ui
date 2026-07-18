import { useState } from "react";
import { PageHeader } from "./page-header/page-header";
import { Button } from "./button/button";
import { Badge } from "./badge/badge";
import { CodeExample } from "./demo-helpers";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./breadcrumb/breadcrumb";

/**
 * PageHeader demo. Every section drives real state where there is state to
 * drive — onBack is the whole point of the component, so it reports.
 */
const NewPageHeaderDemo: React.FC = () => {
  const [went, setWent] = useState("—");

  return (
    <div className="demo-page">
      <h1>PageHeader</h1>
      <p className="lede">
        A heading with a back affordance and one action. <code>DynamicPage</code> and{" "}
        <code>ObjectPageLayout</code> already exist, but they are app-frame weight —
        snapping headers, pinnable title bars, anchored sections. Most screens want none
        of that and just need a title, somewhere to go back to, and a button on the
        right. Everything except <code>title</code> is optional and renders nothing when
        absent.
      </p>

      <section className="demo-section">
        <h2>1. Just a title</h2>
        <CodeExample
          title="The plain case stays plain"
          description="No back button, no actions, no wrapper. The title renders as an h2 — the h1 belongs to the application shell, and a page-level component that claims it fights the app it is dropped into."
          code={`<PageHeader title="Settings" />`}
        >
          <div style={{ width: "100%" }}>
            <PageHeader title="Settings" />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Back, subtitle and actions</h2>
        <CodeExample
          title="The shape most screens want"
          description="onBack renders the back control and is the only way it appears. It is icon-only, so backLabel is its accessible name."
          code={`<PageHeader
  title="Assessment results"
  subtitle="32 responses · last updated 2 hours ago"
  onBack={() => navigate(-1)}
  actions={
    <>
      <Button variant="outline" color="neutral">Share</Button>
      <Button>Export</Button>
    </>
  }
/>`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
            <PageHeader
              title="Assessment results"
              subtitle="32 responses · last updated 2 hours ago"
              onBack={() => setWent("navigate(-1)")}
              actions={
                <>
                  <Button variant="outline" color="neutral" size="sm">
                    Share
                  </Button>
                  <Button size="sm">Export</Button>
                </>
              }
            />
            <p className="zen-m-0 zen-text-xs zen-text-zen-muted-fg">
              onBack → <code>{went}</code>
            </p>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. Breadcrumb and info</h2>
        <CodeExample
          title="Slots, not props"
          description="breadcrumb sits above the title and info beside it. Both take any node, so the header does not need to know what a Breadcrumb is."
          code={`<PageHeader
  breadcrumb={
    <Breadcrumb>
      <BreadcrumbList>…</BreadcrumbList>
    </Breadcrumb>
  }
  title="Onboarding survey"
  info={<Badge variant="soft">Draft</Badge>}
  subtitle="11 questions"
  actions={<Button>Publish</Button>}
/>`}
        >
          <div style={{ width: "100%" }}>
            <PageHeader
              breadcrumb={
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="#">Surveys</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Onboarding survey</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              }
              title="Onboarding survey"
              info={<Badge variant="soft">Draft</Badge>}
              subtitle="11 questions"
              actions={<Button size="sm">Publish</Button>}
            />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. A long title truncates</h2>
        <CodeExample
          title="The title yields, the actions do not"
          description="A title long enough to collide with the actions truncates rather than shoving them off the right edge. Narrow the window to watch it give way."
          code={`<PageHeader
  title="A page title long enough that it has nowhere left to go"
  onBack={() => navigate(-1)}
  actions={<Button>Save</Button>}
/>`}
        >
          <div style={{ width: "100%", maxWidth: 420 }}>
            <PageHeader
              title="A page title long enough that it has nowhere left to go"
              subtitle="The subtitle wraps instead — it has room to"
              onBack={() => setWent("navigate(-1)")}
              actions={<Button size="sm">Save</Button>}
            />
          </div>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewPageHeaderDemo;
