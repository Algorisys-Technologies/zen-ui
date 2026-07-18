import { createSignal } from "solid-js";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./card/card";
import { SelectableCard, SelectableCardGroup } from "./card/card.selectable";
import { Button } from "./button/button";
import { Badge } from "./badge/badge";
import { DemoPage, DemoSection } from "./demo-helpers";

const InvoiceIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="9" y1="13" x2="15" y2="13" />
    <line x1="9" y1="17" x2="13" y2="17" />
  </svg>
);
const ExpenseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden>
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
const ReportIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden>
    <path d="M3 3v18h18" />
    <path d="M7 15l4-4 4 4 5-5" />
  </svg>
);

const NewCardDemo = () => {
  const [goal, setGoal] = createSignal("invoice");
  return (
    <DemoPage
      title="Card"
      description="Generic surface primitive plus a SelectableCard variant for 'pick one' onboarding questions. Selectable cards beat radio lists for goal pickers / plan selectors / use-case pickers."
    >
      <DemoSection
        title="1. Compound surface — Header / Title / Description / Content / Footer"
        codeTitle="Compound API + variant · padding"
        codeDescription="variant: elevated · outlined (default) · ghost. padding: none · sm · md · lg — set it when you skip the Header/Content/Footer scaffolding, which brings its own padding."
        code={`<Card>
  <CardHeader>
    <CardTitle>Account</CardTitle>
    <CardDescription>Your billing + contact info.</CardDescription>
  </CardHeader>
  <CardContent>
    <p class="zen-text-sm">Pull up of profile info here.</p>
  </CardContent>
  <CardFooter>
    <Button size="sm">Save</Button>
    <Button size="sm" variant="ghost">Cancel</Button>
  </CardFooter>
</Card>

<Card variant="elevated">
  <CardHeader>
    <CardTitle>Elevated</CardTitle>
    <CardDescription>Same shape with a small drop-shadow.</CardDescription>
  </CardHeader>
  <CardContent>
    <p class="zen-text-sm">For features you want to make pop.</p>
  </CardContent>
</Card>

{/* No header/footer — pad the Card itself instead */}
<Card variant="ghost" padding="md">
  <CardTitle>Ghost</CardTitle>
  <CardDescription>
    Transparent border. Useful when nesting inside another surface.
  </CardDescription>
</Card>`}
      >
        <div class="zen-grid zen-grid-cols-2 zen-gap-4 zen-max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Your billing + contact info.</CardDescription>
            </CardHeader>
            <CardContent>
              <p class="zen-text-sm">Pull up of profile info here.</p>
            </CardContent>
            <CardFooter>
              <Button size="sm">Save</Button>
              <Button size="sm" variant="ghost">
                Cancel
              </Button>
            </CardFooter>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Elevated</CardTitle>
              <CardDescription>
                Same shape with a small drop-shadow.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p class="zen-text-sm">For features you want to make pop.</p>
            </CardContent>
          </Card>

          <Card variant="ghost" padding="md">
            <CardTitle>Ghost</CardTitle>
            <CardDescription>
              Transparent border. Useful when nesting inside another surface.
            </CardDescription>
          </Card>

          <Card variant="outlined" padding="lg">
            <CardTitle>Outlined · padding=lg</CardTitle>
            <CardDescription>
              A single content slot without the header/footer scaffolding.
            </CardDescription>
          </Card>
        </div>
      </DemoSection>

      <DemoSection
        title="2. SelectableCard — goal picker (radio-as-card)"
        codeTitle="Replaces a radio-button list with rich card choices"
        codeDescription="Built on Kobalte's RadioGroup — the underlying radios are visually hidden but keyboard-navigable. data-checked on the selected card paints the primary ring + soft tint."
        code={`const [goal, setGoal] = createSignal("invoice");

<SelectableCardGroup value={goal()} onValueChange={setGoal}>
  <SelectableCard
    value="invoice"
    title="Send invoices"
    icon={<InvoiceIcon />}
    badge={<Badge color="success">Popular</Badge>}
  >
    Bill customers and track payments.
  </SelectableCard>
  <SelectableCard value="track" title="Track expenses" icon={<ExpenseIcon />}>
    Log receipts and categorize spending.
  </SelectableCard>
  <SelectableCard value="report" title="File taxes" icon={<ReportIcon />}>
    Generate GST + income-tax-ready exports.
  </SelectableCard>
</SelectableCardGroup>`}
      >
        <div class="zen-w-full zen-max-w-2xl">
          <SelectableCardGroup value={goal()} onValueChange={setGoal}>
            <SelectableCard
              value="invoice"
              title="Send invoices"
              icon={<InvoiceIcon />}
              badge={<Badge color="success">Popular</Badge>}
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
          <div class="zen-text-xs zen-text-zen-muted-fg zen-mt-3">
            Picked: <code>{goal()}</code>
          </div>
        </div>
      </DemoSection>
    </DemoPage>
  );
};

export default NewCardDemo;
