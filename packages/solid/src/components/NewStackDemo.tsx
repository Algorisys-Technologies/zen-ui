import { type JSX, For } from "solid-js";
import { Stack } from "./stack/stack";
import { DemoPage, DemoSection } from "./demo-helpers";

/**
 * Filler block so each Stack's layout is visible. Uses only prefixed
 * utilities — no raw lengths.
 */
const Box = (props: { children: JSX.Element }) => (
  <div class="zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-muted zen-px-3 zen-py-2 zen-text-sm zen-text-zen-foreground">
    {props.children}
  </div>
);

/** Outlined frame, so `justify`/`align` have a visible box to work against. */
const Frame = (props: { children: JSX.Element }) => (
  <div class="zen-w-full zen-rounded-zen-md zen-border zen-border-zen-border zen-border-dashed">
    {props.children}
  </div>
);

const NewStackDemo = () => (
  <DemoPage
    title="Stack"
    description="Minimal flexbox layout primitive — a thin div that lays its children out in a row or column with configurable alignment, wrapping, gap and padding. Useful as a generic container / drop-target surface (e.g. in low-code builders) and for everyday form/section layout without hand-writing flex utilities."
  >
    <DemoSection
      title="1. Column (default)"
      codeTitle="direction defaults to column"
      codeDescription="gap and padding take a number (px) or any CSS length."
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
    </DemoSection>

    <DemoSection
      title="2. Row"
      codeTitle={`direction="row"`}
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
    </DemoSection>

    <DemoSection
      title="3. Cross-axis alignment"
      codeTitle="align: start | center | end | stretch"
      code={`<Stack direction="row" align="center" gap={8}>…</Stack>`}
      previewStyle={{ display: "grid", gap: "0.75rem" }}
    >
      <For each={["start", "center", "end", "stretch"] as const}>
        {(align) => (
          <Frame>
            <Stack direction="row" align={align} gap={8} padding={12} class="zen-h-24">
              <Box>align="{align}"</Box>
              <Box>b</Box>
              <Box>c</Box>
            </Stack>
          </Frame>
        )}
      </For>
    </DemoSection>

    <DemoSection
      title="4. Main-axis distribution"
      codeTitle="justify: start | center | end | between"
      code={`<Stack direction="row" justify="between" gap={8}>…</Stack>`}
      previewStyle={{ display: "grid", gap: "0.75rem" }}
    >
      <For each={["start", "center", "end", "between"] as const}>
        {(justify) => (
          <Frame>
            <Stack direction="row" justify={justify} gap={8} padding={12}>
              <Box>justify="{justify}"</Box>
              <Box>b</Box>
              <Box>c</Box>
            </Stack>
          </Frame>
        )}
      </For>
    </DemoSection>

    <DemoSection
      title="5. Wrapping"
      codeTitle="wrap lets a row spill onto the next line"
      code={`<Stack direction="row" wrap gap={8}>
  {items.map((i) => <Box>{i}</Box>)}
</Stack>`}
    >
      <Frame>
        <Stack direction="row" wrap gap={8} padding={12}>
          {Array.from({ length: 14 }, (_, i) => (
            <Box>Item {i + 1}</Box>
          ))}
        </Stack>
      </Frame>
    </DemoSection>

    <DemoSection
      title="6. Nesting + CSS lengths"
      codeTitle="Stacks compose; gap/padding accept any CSS length"
      code={`<Stack gap="1rem" padding="1rem">
  <Stack direction="row" justify="between" align="center">
    <strong>Billing</strong>
    <Badge>Active</Badge>
  </Stack>
  <Stack direction="row" gap="0.5rem">
    <Button>Save</Button>
    <Button variant="outline">Cancel</Button>
  </Stack>
</Stack>`}
    >
      <Frame>
        <Stack gap="1rem" padding="1rem">
          <Stack direction="row" justify="between" align="center">
            <strong class="zen-text-sm zen-text-zen-foreground">Billing</strong>
            <span class="zen-text-xs zen-text-zen-muted-fg">Active</span>
          </Stack>
          <Stack direction="row" gap="0.5rem">
            <Box>Save</Box>
            <Box>Cancel</Box>
          </Stack>
        </Stack>
      </Frame>
    </DemoSection>
  </DemoPage>
);

export default NewStackDemo;
