import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateActions,
} from "./empty-state/empty-state";
import { Button } from "./button/button";
import { DemoPage, DemoSection } from "./demo-helpers";

const Inbox = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);

const NewEmptyStateDemo = () => (
  <DemoPage
    title="EmptyState"
    description="First-run / no-data surface. Compound API. Use bordered for drop zones."
  >
    <DemoSection
      title="Default"
      codeTitle="Icon + title + description + actions"
      code={`<EmptyState>
  <EmptyStateIcon><Inbox /></EmptyStateIcon>
  <EmptyStateTitle>No invoices yet</EmptyStateTitle>
  <EmptyStateDescription>
    Create your first invoice to track revenue across your team.
  </EmptyStateDescription>
  <EmptyStateActions>
    <Button>Create invoice</Button>
    <Button variant="outline">Import from CSV</Button>
  </EmptyStateActions>
</EmptyState>`}
    >
      <div class="zen-w-full zen-max-w-md">
        <EmptyState>
          <EmptyStateIcon><Inbox /></EmptyStateIcon>
          <EmptyStateTitle>No invoices yet</EmptyStateTitle>
          <EmptyStateDescription>
            Create your first invoice to track revenue across your team.
          </EmptyStateDescription>
          <EmptyStateActions>
            <Button>Create invoice</Button>
            <Button variant="outline">Import from CSV</Button>
          </EmptyStateActions>
        </EmptyState>
      </div>
    </DemoSection>

    <DemoSection
      title="Bordered (drop zone)"
      codeTitle="Dashed border + muted surface"
      codeDescription="The bordered variant says 'this region is empty on purpose' — drop zones, placeholder columns, empty swimlanes. Icon and actions are optional."
      code={`<EmptyState bordered size="sm">
  <EmptyStateTitle>Drop files here</EmptyStateTitle>
  <EmptyStateDescription>
    Or click to browse — PDF, PNG, JPG up to 5 MB.
  </EmptyStateDescription>
</EmptyState>`}
    >
      <div class="zen-w-full zen-max-w-md">
        <EmptyState bordered size="sm">
          <EmptyStateTitle>Drop files here</EmptyStateTitle>
          <EmptyStateDescription>
            Or click to browse — PDF, PNG, JPG up to 5 MB.
          </EmptyStateDescription>
        </EmptyState>
      </div>
    </DemoSection>

    <DemoSection
      title="Large (first-run)"
      codeTitle={`size="sm" | "md" | "lg"`}
      codeDescription="md is the default. sm fits inline (table body, dropdown); lg suits a full-page first-run screen with extra breathing room."
      code={`<EmptyState size="lg">
  <EmptyStateIcon><Inbox /></EmptyStateIcon>
  <EmptyStateTitle>Welcome to your dashboard</EmptyStateTitle>
  <EmptyStateDescription>
    Connect a data source to start tracking metrics in real time.
  </EmptyStateDescription>
  <EmptyStateActions>
    <Button>Connect a source</Button>
  </EmptyStateActions>
</EmptyState>`}
    >
      <div class="zen-w-full zen-max-w-2xl">
        <EmptyState size="lg">
          <EmptyStateIcon><Inbox /></EmptyStateIcon>
          <EmptyStateTitle>Welcome to your dashboard</EmptyStateTitle>
          <EmptyStateDescription>
            Connect a data source to start tracking metrics in real time.
          </EmptyStateDescription>
          <EmptyStateActions>
            <Button>Connect a source</Button>
          </EmptyStateActions>
        </EmptyState>
      </div>
    </DemoSection>
  </DemoPage>
);

export default NewEmptyStateDemo;
