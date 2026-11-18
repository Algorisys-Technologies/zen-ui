import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateActions,
} from "../components/empty-state/empty-state";
import { Button } from "../components/button/button";
import { CodeExample } from "./demo-helpers";

const InboxIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);
const SearchIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const NewEmptyStateDemo: React.FC = () => {
  return (
    <div className="demo-page">
      <h1>Empty State</h1>
      <p className="lede">
        First-run / no-data surface for any list, table, or dashboard.
        Compound API: icon → title → description → actions. The
        onboarding equivalent of a blank canvas — the prompt that
        nudges the user to take their first action.
      </p>

      <section className="demo-section">
        <h2>1. Default — first-run prompt</h2>
        <CodeExample
          title="Icon + title + description + primary action"
          code={`<EmptyState>
  <EmptyStateIcon><InboxIcon /></EmptyStateIcon>
  <EmptyStateTitle>No invoices yet</EmptyStateTitle>
  <EmptyStateDescription>
    Create your first invoice to start tracking revenue. We'll save
    drafts as you go.
  </EmptyStateDescription>
  <EmptyStateActions>
    <Button iconLeft={<PlusIcon />}>New invoice</Button>
    <Button variant="outline" color="neutral">Import from CSV</Button>
  </EmptyStateActions>
</EmptyState>`}
        >
          <div style={{ width: "100%" }}>
            <EmptyState>
              <EmptyStateIcon><InboxIcon /></EmptyStateIcon>
              <EmptyStateTitle>No invoices yet</EmptyStateTitle>
              <EmptyStateDescription>
                Create your first invoice to start tracking revenue.
                We'll save drafts as you go.
              </EmptyStateDescription>
              <EmptyStateActions>
                <Button iconLeft={<PlusIcon />}>New invoice</Button>
                <Button variant="outline" color="neutral">
                  Import from CSV
                </Button>
              </EmptyStateActions>
            </EmptyState>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. No-results state</h2>
        <CodeExample
          title="Different copy for empty-filter vs empty-data"
          description={`The "no results" pattern is distinct from first-run — it suggests adjusting the query, not creating data. Same primitive, different content.`}
          code={`<EmptyState>
  <EmptyStateIcon><SearchIcon /></EmptyStateIcon>
  <EmptyStateTitle>No matches for "acme"</EmptyStateTitle>
  <EmptyStateDescription>
    Try a shorter search term or clear the active filters.
  </EmptyStateDescription>
  <EmptyStateActions>
    <Button variant="outline" color="neutral">Clear filters</Button>
  </EmptyStateActions>
</EmptyState>`}
        >
          <div style={{ width: "100%" }}>
            <EmptyState>
              <EmptyStateIcon><SearchIcon /></EmptyStateIcon>
              <EmptyStateTitle>No matches for "acme"</EmptyStateTitle>
              <EmptyStateDescription>
                Try a shorter search term or clear the active filters.
              </EmptyStateDescription>
              <EmptyStateActions>
                <Button variant="outline" color="neutral">
                  Clear filters
                </Button>
              </EmptyStateActions>
            </EmptyState>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. Sizes</h2>
        <CodeExample
          title='size="sm" | "md" | "lg"'
          description="sm fits inline (table body, dropdown). lg suits a full-page first-run screen with extra breathing room."
          code={`<EmptyState size="sm">…</EmptyState>
<EmptyState size="md">…</EmptyState>  /* default */
<EmptyState size="lg">…</EmptyState>`}
        >
          <div style={{ width: "100%", display: "grid", gap: 12 }}>
            {(["sm", "md", "lg"] as const).map((size) => (
              <div key={size} style={{ border: "1px solid var(--zen-color-border)", borderRadius: 6 }}>
                <EmptyState size={size}>
                  <EmptyStateIcon><InboxIcon /></EmptyStateIcon>
                  <EmptyStateTitle>size="{size}"</EmptyStateTitle>
                  <EmptyStateDescription>
                    Padding and gap scale with the size variant.
                  </EmptyStateDescription>
                </EmptyState>
              </div>
            ))}
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. Bordered (drop-zone / placeholder)</h2>
        <CodeExample
          title="Dashed border + muted surface"
          description="The bordered variant communicates 'this region is empty on purpose' — drop-zones, placeholder columns on a kanban, empty Kanban swimlanes."
          code={`<EmptyState bordered>
  <EmptyStateIcon><InboxIcon /></EmptyStateIcon>
  <EmptyStateTitle>Drop files here</EmptyStateTitle>
  <EmptyStateDescription>or click to browse</EmptyStateDescription>
</EmptyState>`}
        >
          <div style={{ width: "100%" }}>
            <EmptyState bordered>
              <EmptyStateIcon><InboxIcon /></EmptyStateIcon>
              <EmptyStateTitle>Drop files here</EmptyStateTitle>
              <EmptyStateDescription>or click to browse</EmptyStateDescription>
            </EmptyState>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>5. Inline (no icon, no actions)</h2>
        <CodeExample
          title="Just title + description — fits inside a table body or list"
          description="Skip EmptyStateIcon / EmptyStateActions for the lightest variant. Common inside DataTable when filters return zero rows but the action lives at the toolbar level."
          code={`<EmptyState size="sm">
  <EmptyStateTitle>No rows match the current filters</EmptyStateTitle>
</EmptyState>`}
        >
          <div style={{ width: "100%" }}>
            <EmptyState size="sm">
              <EmptyStateTitle>No rows match the current filters</EmptyStateTitle>
            </EmptyState>
          </div>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewEmptyStateDemo;
