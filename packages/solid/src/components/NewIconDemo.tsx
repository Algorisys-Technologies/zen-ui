import { type JSX, For } from "solid-js";
import { Icon, ZEN_ICON_NAMES } from "./icon/icon";
import { Button } from "./button/button";
import { DemoPage, DemoSection } from "./demo-helpers";

const row: JSX.CSSProperties = {
  display: "flex",
  gap: "1rem",
  "flex-wrap": "wrap",
  "align-items": "center",
};

const cell: JSX.CSSProperties = {
  display: "flex",
  "flex-direction": "column",
  "align-items": "center",
  gap: "0.375rem",
  padding: "0.75rem 0.25rem",
  border: "1px solid var(--zen-color-border)",
  "border-radius": "var(--zen-radius-md)",
  "font-size": "0.6875rem",
  color: "var(--zen-color-muted-fg)",
  "text-align": "center",
  "word-break": "break-word",
};

const NewIconDemo = () => (
  <DemoPage
    title="Icon"
    description={`Renders a glyph from the zen-ui icon set — ${ZEN_ICON_NAMES.length} icons, no runtime dependency. Geometry lives in @algorisys/zen-ui-core/icons, so both bindings draw the same set. Icons are stroke-based with stroke="currentColor", so they inherit text colour: zen-text-zen-error on the icon or a parent just works, with no colour prop. Decorative by default (aria-hidden) — pass title when the glyph is the only thing carrying meaning.`}
  >
    <DemoSection
      title="1. Basic"
      codeTitle="name is the only required prop"
      code={`<Icon name="check" />
<Icon name="bell" />
<Icon name="search" />`}
    >
      <div style={row}>
        <Icon name="check" />
        <Icon name="bell" />
        <Icon name="search" />
        <Icon name="star" />
        <Icon name="cog" />
      </div>
    </DemoSection>

    <DemoSection
      title="2. The full set"
      codeTitle={`All ${ZEN_ICON_NAMES.length} icons, rendered from ZEN_ICON_NAMES`}
      codeDescription="ZEN_ICON_NAMES is exported alongside Icon. IconName is a union of these literals, so a typo is a type error rather than a blank box."
      code={`import { Icon, ZEN_ICON_NAMES } from "@algorisys/zen-ui-solid";

<For each={ZEN_ICON_NAMES}>
  {(name) => (
    <figure>
      <Icon name={name} size={20} />
      <figcaption>{name}</figcaption>
    </figure>
  )}
</For>`}
      previewStyle={{
        display: "grid",
        "grid-template-columns": "repeat(auto-fill, minmax(84px, 1fr))",
        gap: "0.5rem",
      }}
    >
      <For each={ZEN_ICON_NAMES}>
        {(name) => (
          <div style={cell}>
            <Icon name={name} size={20} class="zen-text-zen-foreground" />
            <span>{name}</span>
          </div>
        )}
      </For>
    </DemoSection>

    <DemoSection
      title="3. Sizes"
      codeTitle="size is width and height in px — default 16"
      code={`<Icon name="star" size={12} />
<Icon name="star" size={16} />
<Icon name="star" size={24} />
<Icon name="star" size={48} />`}
    >
      <div style={row}>
        <For each={[12, 14, 16, 20, 24, 32, 48, 64]}>
          {(s) => (
            <div
              style={{
                display: "flex",
                "flex-direction": "column",
                "align-items": "center",
                gap: "0.25rem",
              }}
            >
              <Icon name="star" size={s} />
              <span style={{ "font-size": "0.6875rem", color: "var(--zen-color-muted-fg)" }}>
                {s}
              </span>
            </div>
          )}
        </For>
      </div>
    </DemoSection>

    <DemoSection
      title="4. Colour — inherited from text colour"
      codeTitle="stroke=currentColor, so zen-text-* is the whole colour API"
      codeDescription="No colour prop: put the utility on the icon, or on any parent."
      code={`<Icon name="check-circle" class="zen-text-zen-success" />
<Icon name="warn" class="zen-text-zen-warning" />
<Icon name="error" class="zen-text-zen-error" />

{/* or let it inherit from a parent */}
<span class="zen-text-zen-primary">
  <Icon name="info" /> Inherited
</span>`}
    >
      <div style={{ display: "flex", "flex-direction": "column", gap: "0.75rem" }}>
        <div style={row}>
          <Icon name="check-circle" size={24} class="zen-text-zen-success" />
          <Icon name="warn" size={24} class="zen-text-zen-warning" />
          <Icon name="error" size={24} class="zen-text-zen-error" />
          <Icon name="info" size={24} class="zen-text-zen-info" />
          <Icon name="star" size={24} class="zen-text-zen-primary" />
          <Icon name="dot" size={24} class="zen-text-zen-muted-fg" />
        </div>
        <span
          class="zen-text-zen-primary"
          style={{
            display: "inline-flex",
            "align-items": "center",
            gap: "0.375rem",
            "font-size": "0.875rem",
          }}
        >
          <Icon name="info" size={16} /> Colour inherited from the parent span
        </span>
      </div>
    </DemoSection>

    <DemoSection
      title="5. Accessibility — title"
      codeTitle="title promotes the icon to role='img' with an accessible name"
      codeDescription="Without title an icon is aria-hidden, which is right when a text label sits next to it. With title it is announced — use it when the glyph is the only message."
      code={`{/* decorative — the word "Delete" already says it */}
<Icon name="trash" /> Delete

{/* meaningful — the glyph is the whole message */}
<Icon name="lock" title="Locked" />`}
    >
      <div style={row}>
        <span
          style={{
            display: "inline-flex",
            "align-items": "center",
            gap: "0.375rem",
            "font-size": "0.875rem",
          }}
        >
          <Icon name="trash" size={16} /> Delete (icon is aria-hidden)
        </span>
        <Icon name="lock" size={20} title="Locked" />
        <Icon name="eye" size={20} title="Visible to everyone" />
      </div>
    </DemoSection>

    <DemoSection
      title="6. In context"
      codeTitle="Icons compose with everything — they are just SVGs"
      code={`<Button iconLeft={<Icon name="plus" size={16} />}>New</Button>
<Button variant="outline" color="neutral" shape="square" aria-label="Settings">
  <Icon name="cog" size={16} />
</Button>`}
    >
      <div style={row}>
        <Button iconLeft={<Icon name="plus" size={16} />}>New</Button>
        <Button variant="outline" color="neutral" iconLeft={<Icon name="download" size={16} />}>
          Download
        </Button>
        <Button variant="soft" color="error" iconLeft={<Icon name="trash" size={16} />}>
          Delete
        </Button>
        <Button variant="outline" color="neutral" shape="square" aria-label="Settings">
          <Icon name="cog" size={16} />
        </Button>
        <Button variant="ghost" color="neutral" shape="square" aria-label="More actions">
          <Icon name="more" size={16} />
        </Button>
      </div>
    </DemoSection>
  </DemoPage>
);

export default NewIconDemo;
