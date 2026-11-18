import type { ReactNode } from "react";
import { Stack } from "../components/stack/stack";
import { CodeExample } from "./demo-helpers";

/** Filler block so each Stack's layout is visible. Prefixed utilities only. */
const Box = ({ children }: { children: ReactNode }) => (
  <div className="zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-muted zen-px-3 zen-py-2 zen-text-sm zen-text-zen-foreground">
    {children}
  </div>
);

/** Outlined frame, so `justify`/`align` have a visible box to work against. */
const Frame = ({ children }: { children: ReactNode }) => (
  <div className="zen-w-full zen-rounded-zen-md zen-border zen-border-zen-border zen-border-dashed">
    {children}
  </div>
);

/** Vertical grid wrapper so a set of Frames stack with even spacing. */
const GRID: React.CSSProperties = { display: "grid", gap: "0.75rem", width: "100%" };

const ALIGN = ["start", "center", "end", "stretch"] as const;
const JUSTIFY = ["start", "center", "end", "between"] as const;

const NewStackDemo: React.FC = () => (
  <div className="demo-page">
    <h1>Stack</h1>
    <p className="lede">
      Minimal flexbox layout primitive — a thin div that lays its children out in a
      row or column with configurable alignment, wrapping, gap and padding. Useful as
      a generic container / drop-target surface (e.g. in low-code builders) and for
      everyday form/section layout without hand-writing flex utilities.
    </p>

    <section className="demo-section">
      <h2>1. Column (default)</h2>
      <CodeExample
        title="direction defaults to column"
        description="gap and padding take a number (px) or any CSS length."
        code={`<Stack gap={8}>
  <Box>First</Box>
  <Box>Second</Box>
  <Box>Third</Box>
</Stack>`}
      >
        <Frame>
          <Stack gap={8} padding={12}>
            <Box>First</Box>
            <Box>Second</Box>
            <Box>Third</Box>
          </Stack>
        </Frame>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>2. Row</h2>
      <CodeExample
        title={`direction="row"`}
        code={`<Stack direction="row" gap={8}>
  <Box>One</Box>
  <Box>Two</Box>
  <Box>Three</Box>
</Stack>`}
      >
        <Frame>
          <Stack direction="row" gap={8} padding={12}>
            <Box>One</Box>
            <Box>Two</Box>
            <Box>Three</Box>
          </Stack>
        </Frame>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>3. Cross-axis alignment</h2>
      <CodeExample
        title="align: start | center | end | stretch"
        code={`<Stack direction="row" align="center" gap={8}>…</Stack>`}
      >
        <div style={GRID}>
          {ALIGN.map((align) => (
            <Frame key={align}>
              <Stack direction="row" align={align} gap={8} padding={12} className="zen-h-24">
                <Box>{`align="${align}"`}</Box>
                <Box>b</Box>
                <Box>c</Box>
              </Stack>
            </Frame>
          ))}
        </div>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>4. Main-axis distribution</h2>
      <CodeExample
        title="justify: start | center | end | between"
        code={`<Stack direction="row" justify="between" gap={8}>…</Stack>`}
      >
        <div style={GRID}>
          {JUSTIFY.map((justify) => (
            <Frame key={justify}>
              <Stack direction="row" justify={justify} gap={8} padding={12}>
                <Box>{`justify="${justify}"`}</Box>
                <Box>b</Box>
                <Box>c</Box>
              </Stack>
            </Frame>
          ))}
        </div>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>5. Wrapping</h2>
      <CodeExample
        title="wrap lets a row spill onto the next line"
        code={`<Stack direction="row" wrap gap={8}>
  {items.map((i) => <Box key={i}>{i}</Box>)}
</Stack>`}
      >
        <Frame>
          <Stack direction="row" wrap gap={8} padding={12}>
            {Array.from({ length: 14 }, (_, i) => (
              <Box key={i}>{`Item ${i + 1}`}</Box>
            ))}
          </Stack>
        </Frame>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>6. Nesting + CSS lengths</h2>
      <CodeExample
        title="Stacks compose; gap/padding accept any CSS length"
        code={`<Stack gap="1rem" padding="1rem">
  <Stack direction="row" justify="between" align="center">
    <strong>Billing</strong>
    <span>Active</span>
  </Stack>
  <Stack direction="row" gap="0.5rem">
    <Box>Save</Box>
    <Box>Cancel</Box>
  </Stack>
</Stack>`}
      >
        <Frame>
          <Stack gap="1rem" padding="1rem">
            <Stack direction="row" justify="between" align="center">
              <strong className="zen-text-sm zen-text-zen-foreground">Billing</strong>
              <span className="zen-text-xs zen-text-zen-muted-fg">Active</span>
            </Stack>
            <Stack direction="row" gap="0.5rem">
              <Box>Save</Box>
              <Box>Cancel</Box>
            </Stack>
          </Stack>
        </Frame>
      </CodeExample>
    </section>
  </div>
);

export default NewStackDemo;
