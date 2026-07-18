import { Badge } from "./badge/badge";
import { CodeExample } from "./demo-helpers";

const COLORS = ["primary", "neutral", "info", "success", "warning", "error"] as const;

const NewBadgeDemo: React.FC = () => (
  <div className="demo-page">
    <h1>Badge (new — shadcn-style)</h1>
    <p className="lede">
      Small status / label pill. Not built on a Radix primitive (Radix has no
      Badge). Forwards a ref, supports <code>asChild</code> for clickable badges,
      themed via <code>--zen-*</code> tokens.
    </p>

    <section className="demo-section">
      <h2>1. Default (soft + primary)</h2>
      <CodeExample
        title="Defaults"
        code={`<Badge>New</Badge>`}
      >
        <Badge>New</Badge>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>2. Variants × colors</h2>
      <CodeExample
        title="solid · soft · outline"
        code={`<Badge variant="solid" color="primary">primary</Badge>
<Badge variant="soft" color="success">success</Badge>
<Badge variant="outline" color="error">error</Badge>`}
      >
        {(["solid", "soft", "outline"] as const).map((variant) => (
          <div key={variant} style={{ display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
            <span style={{ width: 70, color: "var(--zen-color-muted-fg)", fontSize: "0.8125rem", alignSelf: "center" }}>
              {variant}
            </span>
            {COLORS.map((c) => (
              <Badge key={c} variant={variant} color={c}>
                {c}
              </Badge>
            ))}
          </div>
        ))}
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>3. With icon</h2>
      <CodeExample
        title="Icons go in children as siblings"
        code={`<Badge color="success">
  <CheckIcon /> Verified
</Badge>`}
      >
        <Badge color="success">
          <CheckIcon /> Verified
        </Badge>
        <Badge color="warning">
          <AlertIcon /> Pending
        </Badge>
        <Badge color="error">
          <XIcon /> Failed
        </Badge>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>4. asChild — clickable badge</h2>
      <CodeExample
        title="Project badge styles onto an <a> or NavLink"
        code={`<Badge asChild color="info">
  <a href="https://algorisys.com">Visit site →</a>
</Badge>`}
      >
        <Badge asChild color="info">
          <a href="https://algorisys.com" target="_blank" rel="noreferrer">
            Visit site →
          </a>
        </Badge>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>5. Custom colors via className</h2>
      <CodeExample
        title="className wins over CVA defaults (tailwind-merge)"
        code={`<Badge className="bg-zen-accent-purple text-white">Beta</Badge>
<Badge className="bg-zen-accent-magenta text-white">New</Badge>
<Badge className="bg-zen-accent-orange text-zen-foreground">Hot</Badge>
<Badge className="bg-zen-accent-cream text-zen-foreground">Soft</Badge>`}
      >
        <Badge className="zen-bg-zen-accent-purple zen-text-white">Beta</Badge>
        <Badge className="zen-bg-zen-accent-magenta zen-text-white">New</Badge>
        <Badge className="zen-bg-zen-accent-orange zen-text-zen-foreground">Hot</Badge>
        <Badge className="zen-bg-zen-accent-cream zen-text-zen-foreground">Soft</Badge>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>6. Use cases</h2>
      <CodeExample
        title="Inline with surrounding text and components"
        code={`<h3>Dashboard <Badge color="success">live</Badge></h3>
<p>Storage usage <Badge variant="outline" color="warning">85%</Badge></p>`}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
          <h3 style={{ margin: 0, fontSize: "1rem" }}>
            Dashboard <Badge color="success">live</Badge>
          </h3>
          <p style={{ margin: 0, fontSize: "0.875rem" }}>
            Storage usage{" "}
            <Badge variant="outline" color="warning">
              85%
            </Badge>
          </p>
        </div>
      </CodeExample>
    </section>
  </div>
);

const CheckIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const AlertIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12" y2="16" />
  </svg>
);
const XIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default NewBadgeDemo;
