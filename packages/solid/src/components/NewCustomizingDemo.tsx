import { type JSX } from "solid-js";
import { Card, CardContent } from "./card/card";
import { Button } from "./button/button";
import { StatCard } from "./stat-card/stat-card";
import { Badge } from "./badge/badge";
import { DemoPage, DemoSection } from "./demo-helpers";

/**
 * Customizing — the three ways to change how a zen-ui component looks, and the
 * one place that does NOT work the way people assume (spacing is not
 * tokenised). Everything claimed here is demonstrated live rather than
 * described. Mirrors the React binding's page.
 */

const ROW: JSX.CSSProperties = {
  display: "flex",
  "flex-wrap": "wrap",
  gap: "16px",
  "align-items": "flex-start",
  width: "100%",
};

const NewCustomizingDemo = () => (
  <DemoPage
    title="Customizing"
    description={
      <>
        Three ways to change how a component looks, in the order you should reach
        for them: a <strong>prop</strong> if one exists, a <strong>class</strong> for
        this one instance, a <strong>token</strong> to move the whole system. The
        first two are local, the third is global — most mistakes are reaching for
        the wrong one.
      </>
    }
  >
    <DemoSection
      title="1. Props first"
      codeTitle="If a prop exists, it is the answer"
      codeDescription="Padding, size and colour are props on the components that have them. Reach for a class only when no prop covers what you need — a prop is API and will keep working; a class is a wager on internals."
      code={`<Card padding="sm">…</Card>
<Card padding="lg">…</Card>

<Button size="sm">Small</Button>
<StatCard label="Churn" value="3.1%" color="error" />`}
      previewStyle={ROW}
    >
      <Card padding="sm" style={{ width: "150px" }}>
        <CardContent style={{ padding: 0 }}>padding="sm"</CardContent>
      </Card>
      <Card padding="lg" style={{ width: "150px" }}>
        <CardContent style={{ padding: 0 }}>padding="lg"</CardContent>
      </Card>
      <Button size="sm">size="sm"</Button>
      <Button size="lg">size="lg"</Button>
    </DemoSection>

    <DemoSection
      title="2. Classes, for one instance"
      codeTitle="class replaces our utility — it does not fight it"
      codeDescription="Every component merges your class through cn(), which is tailwind-merge taught about the zen- prefix. Passing zen-p-8 to a component whose padding is zen-p-5 REPLACES it: only one padding class survives, so there is no specificity race and no !important. Your own unprefixed classes win too."
      code={`// the component's own padding is replaced, not appended
<Card class="zen-p-8" />

// works for anything: spacing, radius, colour, shadow, type
<Card class="zen-rounded-zen-full zen-bg-zen-primary-soft" />

// cn("zen-p-5", "zen-p-8")  ->  "zen-p-8"
// cn("zen-p-5", "p-8")      ->  "p-8"      (your own class wins)`}
      previewStyle={ROW}
    >
      <Card padding="md" style={{ width: "150px" }}>
        <CardContent style={{ padding: 0 }}>default</CardContent>
      </Card>
      <Card padding="md" class="zen-p-8" style={{ width: "150px" }}>
        <CardContent style={{ padding: 0 }}>zen-p-8</CardContent>
      </Card>
      <Card
        padding="md"
        class="zen-rounded-zen-full zen-bg-zen-primary-soft zen-border-zen-primary"
        style={{ width: "190px" }}
      >
        <CardContent style={{ padding: 0 }}>rounded-full + soft</CardContent>
      </Card>
    </DemoSection>

    <DemoSection
      title="3. Tokens, for the whole system"
      codeTitle="Override --zen-* and every component follows"
      codeDescription="Colour, radius and shadow utilities compile to var(--zen-*), so setting a token retints everything under that scope — no props, no classes, no rebuild. Set them on :root for the app, or on any element to re-theme one subtree, which is exactly what the panel on the right does."
      code={`/* app-wide */
:root {
  --zen-color-primary: #7c3aed;
  --zen-radius-md: 2px;
}

/* or scoped to a subtree */
<div style={{ "--zen-color-primary": "#7c3aed", "--zen-radius-md": "2px" }}>
  <Button>Inherits the override</Button>
</div>`}
      previewStyle={ROW}
    >
      <div style={{ display: "flex", "flex-direction": "column", gap: "8px" }}>
        <span class="zen-text-xs zen-text-zen-muted-fg">default tokens</span>
        <div style={{ display: "flex", gap: "8px", "align-items": "center" }}>
          <Button size="sm">Button</Button>
          <Badge>Badge</Badge>
        </div>
      </div>
      <div
        // A real override, not a screenshot: same components, different tokens.
        style={{
          display: "flex",
          "flex-direction": "column",
          gap: "8px",
          "--zen-color-primary": "#7c3aed",
          "--zen-radius-md": "2px",
          "--zen-radius-full": "2px",
        }}
      >
        <span class="zen-text-xs zen-text-zen-muted-fg">
          --zen-color-primary + --zen-radius-*
        </span>
        <div style={{ display: "flex", gap: "8px", "align-items": "center" }}>
          <Button size="sm">Button</Button>
          <Badge>Badge</Badge>
        </div>
      </div>
    </DemoSection>

    <DemoSection
      title="4. What tokens do NOT cover"
      codeTitle="Spacing is per-instance, not global"
      codeDescription="--zen-space-* exists in tokens.css, but the utilities do not use it: zen-p-4 compiles to padding:1rem, a literal, while zen-rounded-zen-md compiles to var(--zen-radius-md). So overriding --zen-space-4 changes nothing. To change spacing, use a prop or a class. This is the one place the token story does not go — worth knowing before you spend an afternoon on it."
      code={`/* compiled output — the difference that matters */
.zen-p-4              { padding: 1rem }                       /* literal   */
.zen-rounded-zen-md   { border-radius: var(--zen-radius-md) } /* token     */
.zen-bg-zen-primary   { background: var(--zen-color-primary) }/* token     */

/* so this does nothing: */
:root { --zen-space-4: 3rem; }

/* do this instead: */
<Card class="zen-p-8" />`}
      previewStyle={ROW}
    >
      <div style={{ "--zen-space-4": "3rem" }}>
        <Card padding="md" class="zen-p-4" style={{ width: "210px" }}>
          <CardContent style={{ padding: 0 }}>
            --zen-space-4: 3rem — unchanged
          </CardContent>
        </Card>
      </div>
      <Card padding="md" class="zen-p-8" style={{ width: "210px" }}>
        <CardContent style={{ padding: 0 }}>zen-p-8 — changed</CardContent>
      </Card>
    </DemoSection>

    <DemoSection
      title="5. Writing zen- classes"
      codeTitle="The prefix sits on the utility, variants sit outside it"
      codeDescription="Utilities are prefixed zen-. Variants, negation and important are NOT part of the prefix — they wrap it. Getting this wrong produces a class that matches nothing, generates no CSS, and fails silently: the build stays green and the style is simply absent."
      code={`hover:zen-bg-zen-primary     ✓   variant outside the prefix
-zen-mt-2                    ✓   negation outside
!zen-p-4                     ✓   important outside
data-[state=open]:zen-p-4    ✓   data variant outside
zen-[grid-template-columns:1fr_2fr]  ✓  prefix before the bracket

zen-hover:bg-zen-primary     ✗   generates nothing, silently
zen--mt-2                    ✗   same`}
      previewStyle={ROW}
    >
      <Button class="hover:zen-bg-zen-error hover:zen-text-zen-error-fg" size="sm">
        Hover me
      </Button>
      <StatCard
        label="With a class override"
        value="42"
        class="zen-max-w-56 zen-rounded-zen-full zen-border-zen-primary"
      />
    </DemoSection>
  </DemoPage>
);

export default NewCustomizingDemo;
