import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./card/card";
import {
  SelectableCard,
  SelectableCardGroup,
} from "./card/card.selectable";
import { Button } from "./button/button";
import { Badge } from "./badge/badge";
import { CodeExample } from "./demo-helpers";

const InvoiceIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="9" y1="13" x2="15" y2="13" />
    <line x1="9" y1="17" x2="15" y2="17" />
  </svg>
);
const ExpenseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="6" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12" y2="16" />
  </svg>
);
const ReportIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M3 3v18h18" />
    <path d="M7 14l4-4 4 4 5-5" />
  </svg>
);

const NewCardDemo: React.FC = () => {
  const [goal, setGoal] = useState("invoice");
  const [plan, setPlan] = useState("pro");

  return (
    <div className="demo-page">
      <h1>Card</h1>
      <p className="lede">
        Generic surface primitive plus a <code>SelectableCard</code>{" "}
        variant for "pick one" onboarding questions. Selectable cards
        beat radio lists for goal pickers / plan selectors / use-case
        choices — bigger tap targets, room for an icon + description,
        and they read as decisions rather than options.
      </p>

      <section className="demo-section">
        <h2>1. Base — compound API</h2>
        <CodeExample
          title="Header / Content / Footer"
          code={`<Card>
  <CardHeader>
    <CardTitle>Account</CardTitle>
    <CardDescription>Your billing + contact info.</CardDescription>
  </CardHeader>
  <CardContent>
    <p>You're on the Pro plan, renewing 14 Jun 2026.</p>
  </CardContent>
  <CardFooter>
    <Button>Manage</Button>
    <Button variant="outline" color="neutral">Cancel plan</Button>
  </CardFooter>
</Card>`}
        >
          <div style={{ width: "100%", maxWidth: "20rem" }}>
            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>Your billing + contact info.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="zen-text-sm zen-m-0">
                  You're on the Pro plan, renewing 14 Jun 2026.
                </p>
              </CardContent>
              <CardFooter>
                <Button>Manage</Button>
                <Button variant="outline" color="neutral">
                  Cancel plan
                </Button>
              </CardFooter>
            </Card>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Variants</h2>
        <CodeExample
          title="elevated · outlined (default) · ghost"
          code={`<Card variant="elevated" padding="md">…</Card>
<Card variant="outlined" padding="md">…</Card>
<Card variant="ghost" padding="md">…</Card>`}
        >
          <div
            style={{
              width: "100%",
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12,
            }}
          >
            {(["elevated", "outlined", "ghost"] as const).map((v) => (
              <Card key={v} variant={v} padding="md">
                <strong className="zen-text-sm">{v}</strong>
                <p className="zen-text-xs zen-text-zen-muted-fg zen-m-0 zen-mt-1">
                  variant="{v}" + padding="md"
                </p>
              </Card>
            ))}
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. SelectableCard — goal picker</h2>
        <CodeExample
          title="Replaces a radio-button list with rich card choices"
          description={`Underlying radios are visually hidden but keyboard-navigable. data-state="checked" on the selected card paints the primary ring + soft tint + a small check indicator top-right.`}
          code={`const [goal, setGoal] = useState("invoice");

<SelectableCardGroup
  value={goal}
  onValueChange={setGoal}
  aria-label="What do you want to do first?"
>
  <SelectableCard value="invoice" title="Send invoices" icon={<I />}>
    Bill customers and track payments.
  </SelectableCard>
  <SelectableCard value="track" title="Track expenses" icon={<E />}>
    Log receipts and categorize spending.
  </SelectableCard>
  <SelectableCard value="report" title="File taxes" icon={<R />}>
    Generate GST + income-tax-ready exports.
  </SelectableCard>
</SelectableCardGroup>`}
        >
          <div style={{ width: "100%" }}>
            <SelectableCardGroup
              value={goal}
              onValueChange={setGoal}
              aria-label="What do you want to do first?"
            >
              <SelectableCard
                value="invoice"
                title="Send invoices"
                icon={<InvoiceIcon />}
              >
                Bill customers and track payments.
              </SelectableCard>
              <SelectableCard
                value="track"
                title="Track expenses"
                icon={<ExpenseIcon />}
              >
                Log receipts and categorize spending.
              </SelectableCard>
              <SelectableCard
                value="report"
                title="File taxes"
                icon={<ReportIcon />}
              >
                Generate GST + income-tax-ready exports.
              </SelectableCard>
            </SelectableCardGroup>
            <p className="zen-text-xs zen-text-zen-muted-fg zen-mt-3">
              Picked: <code>{goal}</code>
            </p>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. SelectableCard — plan picker with badges</h2>
        <CodeExample
          title="Trailing Badge for 'Most popular' / 'Best value'"
          code={`<SelectableCard
  value="pro"
  title="Pro"
  badge={<Badge color="success" variant="soft">Most popular</Badge>}
>
  ₹999 / month — unlimited invoices, custom branding, GST exports.
</SelectableCard>`}
        >
          <div style={{ width: "100%" }}>
            <SelectableCardGroup
              value={plan}
              onValueChange={setPlan}
              aria-label="Pick a plan"
            >
              <SelectableCard value="free" title="Free">
                ₹0 — 10 invoices/month, basic reporting.
              </SelectableCard>
              <SelectableCard
                value="pro"
                title="Pro"
                badge={
                  <Badge color="success" variant="soft">
                    Most popular
                  </Badge>
                }
              >
                ₹999/month — unlimited invoices, custom branding, GST
                exports.
              </SelectableCard>
              <SelectableCard
                value="team"
                title="Team"
                badge={
                  <Badge color="info" variant="soft">
                    5+ users
                  </Badge>
                }
              >
                ₹2,999/month — everything in Pro plus 5 user seats and
                SSO.
              </SelectableCard>
            </SelectableCardGroup>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>5. Disabled card</h2>
        <CodeExample
          title="disabled prop locks the option out"
          code={`<SelectableCard value="enterprise" title="Enterprise" disabled>
  Contact sales for Enterprise pricing.
</SelectableCard>`}
        >
          <div style={{ width: "100%" }}>
            <SelectableCardGroup defaultValue="basic" aria-label="Tier">
              <SelectableCard value="basic" title="Basic">
                Standard features for individuals.
              </SelectableCard>
              <SelectableCard
                value="enterprise"
                title="Enterprise"
                disabled
                badge={
                  <Badge color="neutral" variant="outline">
                    Contact sales
                  </Badge>
                }
              >
                Custom pricing, dedicated CSM, SLA. Disabled here.
              </SelectableCard>
            </SelectableCardGroup>
          </div>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewCardDemo;
