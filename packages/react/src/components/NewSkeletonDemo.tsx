import { Skeleton } from "./skeleton/skeleton";
import { CodeExample } from "./demo-helpers";

const NewSkeletonDemo: React.FC = () => (
  <div className="demo-page">
    <h1>Skeleton (new — shadcn-style)</h1>
    <p className="lede">
      Loading placeholder. Animated muted box; no Radix primitive required.
      Size and shape are entirely up to the consumer via utility classes —
      use one per visual block you're standing in for.
    </p>

    <section className="demo-section">
      <h2>1. Single line</h2>
      <CodeExample
        title="className controls dimensions"
        code={`<Skeleton className="h-4 w-64" />`}
      >
        <Skeleton className="zen-h-4 zen-w-64" />
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>2. Paragraph</h2>
      <CodeExample
        title="Stack multiple lines"
        code={`<div className="flex flex-col gap-2">
  <Skeleton className="h-4 w-full" />
  <Skeleton className="h-4 w-11/12" />
  <Skeleton className="h-4 w-9/12" />
</div>`}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", maxWidth: 480 }}>
          <Skeleton className="zen-h-4 zen-w-full" />
          <Skeleton className="zen-h-4 zen-w-11/12" />
          <Skeleton className="zen-h-4 zen-w-9/12" />
        </div>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>3. Avatar placeholder</h2>
      <CodeExample
        title="rounded-zen-full for circular shapes"
        code={`<Skeleton className="h-10 w-10 rounded-zen-full" />`}
      >
        <Skeleton className="zen-h-10 zen-w-10 zen-rounded-zen-full" />
        <Skeleton className="zen-h-12 zen-w-12 zen-rounded-zen-full" />
        <Skeleton className="zen-h-16 zen-w-16 zen-rounded-zen-full" />
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>4. Card placeholder</h2>
      <CodeExample
        title="Compose skeletons to mimic the final layout"
        code={`<div className="flex items-center gap-3">
  <Skeleton className="h-12 w-12 rounded-zen-full" />
  <div className="flex flex-col gap-2 flex-1">
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-3 w-3/4" />
  </div>
</div>`}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", maxWidth: 480 }}>
          <Skeleton className="zen-h-12 zen-w-12 zen-rounded-zen-full" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
            <Skeleton className="zen-h-4 zen-w-1/2" />
            <Skeleton className="zen-h-3 zen-w-3/4" />
          </div>
        </div>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>5. Table row</h2>
      <CodeExample
        title="Repeat in a list"
        code={`{Array.from({ length: 3 }).map((_, i) => (
  <div key={i} className="flex gap-4">
    <Skeleton className="h-4 w-20" />
    <Skeleton className="h-4 w-32" />
    <Skeleton className="h-4 w-16" />
  </div>
))}`}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", maxWidth: 480 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ display: "flex", gap: 16 }}>
              <Skeleton className="zen-h-4 zen-w-20" />
              <Skeleton className="zen-h-4 zen-w-32" />
              <Skeleton className="zen-h-4 zen-w-16" />
            </div>
          ))}
        </div>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>6. Custom background via className</h2>
      <CodeExample
        title="Override the muted background"
        code={`<Skeleton className="h-4 w-32 bg-zen-primary-soft" />`}
      >
        <Skeleton className="zen-h-4 zen-w-32 zen-bg-zen-primary-soft" />
        <Skeleton className="zen-h-4 zen-w-32 zen-bg-zen-success-soft" />
        <Skeleton className="zen-h-4 zen-w-32 zen-bg-zen-error-soft" />
      </CodeExample>
    </section>
  </div>
);

export default NewSkeletonDemo;
