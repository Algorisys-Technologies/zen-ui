import { Card, CardContent } from "./card/card";
import { Button } from "./button/button";
import { StatCard } from "./stat-card/stat-card";
import { Badge } from "./badge/badge";
import { CodeExample } from "./demo-helpers";

/**
 * Customizing — the three ways to change how a zen-ui component looks, and the
 * one place that does NOT work the way people assume (spacing is not
 * tokenised). Everything claimed here is demonstrated live on the page rather
 * than described, because a customisation guide that is wrong is worse than
 * none.
 */

const ROW: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 16,
  alignItems: "flex-start",
  width: "100%",
};

const NewCustomizingDemo: React.FC = () => (
  <div className="demo-page">
    <h1>Customizing</h1>
    <p className="lede">
      Three ways to change how a component looks, in the order you should reach
      for them: a <strong>prop</strong> if one exists, a <strong>class</strong> for
      this one instance, a <strong>token</strong> to move the whole system. The
      first two are local, the third is global — most mistakes are reaching for
      the wrong one.
    </p>

    <section className="demo-section">
      <h2>1. Props first</h2>
      <CodeExample
        title="If a prop exists, it is the answer"
        description="Padding, size and colour are props on the components that have them. Reach for a class only when no prop covers what you need — a prop is API and will keep working; a class is a wager on internals."
        code={`<Card padding="sm">…</Card>
<Card padding="lg">…</Card>

<Button size="sm">Small</Button>
<StatCard label="Churn" value="3.1%" color="error" />`}
      >
        <div style={ROW}>
          <Card padding="sm" style={{ width: 150 }}>
            <CardContent style={{ padding: 0 }}>padding="sm"</CardContent>
          </Card>
          <Card padding="lg" style={{ width: 150 }}>
            <CardContent style={{ padding: 0 }}>padding="lg"</CardContent>
          </Card>
          <Button size="sm">size="sm"</Button>
          <Button size="lg">size="lg"</Button>
        </div>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>2. Classes, for one instance</h2>
      <CodeExample
        title="className replaces our utility — it does not fight it"
        description="Every component merges your className through cn(), which is tailwind-merge taught about the zen- prefix. Passing zen-p-8 to a component whose padding is zen-p-5 REPLACES it: only one padding class survives, so there is no specificity race and no !important. Your own unprefixed classes win too."
        code={`// the component's own padding is replaced, not appended
<Card className="zen-p-8" />

// works for anything: spacing, radius, colour, shadow, type
<Card className="zen-rounded-zen-full zen-bg-zen-primary-soft" />

// cn("zen-p-5", "zen-p-8")  ->  "zen-p-8"
// cn("zen-p-5", "p-8")      ->  "p-8"      (your own class wins)`}
      >
        <div style={ROW}>
          <Card padding="md" style={{ width: 150 }}>
            <CardContent style={{ padding: 0 }}>default</CardContent>
          </Card>
          <Card padding="md" className="zen-p-8" style={{ width: 150 }}>
            <CardContent style={{ padding: 0 }}>zen-p-8</CardContent>
          </Card>
          <Card
            padding="md"
            className="zen-rounded-zen-full zen-bg-zen-primary-soft zen-border-zen-primary"
            style={{ width: 190 }}
          >
            <CardContent style={{ padding: 0 }}>rounded-full + soft</CardContent>
          </Card>
        </div>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>3. Tokens, for the whole system</h2>
      <CodeExample
        title="Override --zen-* and every component follows"
        description="Colour, radius and shadow utilities compile to var(--zen-*), so setting a token retints everything under that scope — no props, no classes, no rebuild. Set them on :root for the app, or on any element to re-theme one subtree, which is exactly what the panel on the right does."
        code={`/* app-wide */
:root {
  --zen-color-primary: #7c3aed;
  --zen-radius-md: 2px;
}

/* or scoped to a subtree */
<div style={{ "--zen-color-primary": "#7c3aed", "--zen-radius-md": "2px" }}>
  <Button>Inherits the override</Button>
</div>`}
      >
        <div style={ROW}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span className="zen-text-xs zen-text-zen-muted-fg">default tokens</span>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Button size="sm">Button</Button>
              <Badge>Badge</Badge>
            </div>
          </div>
          <div
            // A real override, not a screenshot: same components, different tokens.
            style={
              {
                display: "flex",
                flexDirection: "column",
                gap: 8,
                "--zen-color-primary": "#7c3aed",
                "--zen-radius-md": "2px",
                "--zen-radius-full": "2px",
              } as React.CSSProperties
            }
          >
            <span className="zen-text-xs zen-text-zen-muted-fg">
              --zen-color-primary + --zen-radius-*
            </span>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Button size="sm">Button</Button>
              <Badge>Badge</Badge>
            </div>
          </div>
        </div>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>4. What tokens do NOT cover</h2>
      <CodeExample
        title="Spacing is per-instance, not global"
        description="--zen-space-* exists in tokens.css, but the utilities do not use it: zen-p-4 compiles to padding:1rem, a literal, while zen-rounded-zen-md compiles to var(--zen-radius-md). So overriding --zen-space-4 changes nothing. To change spacing, use a prop or a class. This is the one place the token story does not go — worth knowing before you spend an afternoon on it."
        code={`/* compiled output — the difference that matters */
.zen-p-4              { padding: 1rem }                       /* literal   */
.zen-rounded-zen-md   { border-radius: var(--zen-radius-md) } /* token     */
.zen-bg-zen-primary   { background: var(--zen-color-primary) }/* token     */

/* so this does nothing: */
:root { --zen-space-4: 3rem; }

/* do this instead: */
<Card className="zen-p-8" />`}
      >
        <div style={ROW}>
          <div
            style={{ "--zen-space-4": "3rem" } as React.CSSProperties}
          >
            <Card padding="md" className="zen-p-4" style={{ width: 210 }}>
              <CardContent style={{ padding: 0 }}>
                --zen-space-4: 3rem — unchanged
              </CardContent>
            </Card>
          </div>
          <Card padding="md" className="zen-p-8" style={{ width: 210 }}>
            <CardContent style={{ padding: 0 }}>zen-p-8 — changed</CardContent>
          </Card>
        </div>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>5. Writing zen- classes</h2>
      <CodeExample
        title="The prefix sits on the utility, variants sit outside it"
        description="Utilities are prefixed zen-. Variants, negation and important are NOT part of the prefix — they wrap it. Getting this wrong produces a class that matches nothing, generates no CSS, and fails silently: the build stays green and the style is simply absent."
        code={`hover:zen-bg-zen-primary     ✓   variant outside the prefix
-zen-mt-2                    ✓   negation outside
!zen-p-4                     ✓   important outside
data-[state=open]:zen-p-4    ✓   data variant outside
zen-[grid-template-columns:1fr_2fr]  ✓  prefix before the bracket

zen-hover:bg-zen-primary     ✗   generates nothing, silently
zen--mt-2                    ✗   same`}
      >
        <div style={ROW}>
          <Button className="hover:zen-bg-zen-error hover:zen-text-zen-error-fg" size="sm">
            Hover me
          </Button>
          <StatCard
            label="With a class override"
            value="42"
            className="zen-max-w-56 zen-rounded-zen-full zen-border-zen-primary"
          />
        </div>
      </CodeExample>
    </section>
  </div>
);

export default NewCustomizingDemo;
