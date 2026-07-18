import { Toolbar, type ToolbarAction } from "./toolbar/toolbar";
import { DemoPage, DemoSection } from "./demo-helpers";

/**
 * Toolbar demo — mirrors the React binding's sections. The widths are
 * deliberately constrained, because the whole point of the component only shows
 * up when the actions do not fit.
 */

const ACTIONS: ToolbarAction[] = [
  { id: "create", label: "Create", icon: "plus", variant: "solid", color: "primary", overflow: "never" },
  { id: "edit", label: "Edit", icon: "edit" },
  { id: "copy", label: "Duplicate", icon: "file" },
  { id: "share", label: "Share", icon: "external-link" },
  { id: "download", label: "Download", icon: "download" },
  { id: "flag", label: "Flag", icon: "flag" },
  { id: "delete", label: "Delete", icon: "trash", color: "error", separatorBefore: true },
];

const NewToolbarDemo = () => (
  <DemoPage
    title="Toolbar"
    description={
      <>
        A row of actions that collapses into an overflow menu when it runs out of
        room. <code>actions</code> is data rather than children: an overflowed
        action has to re-render as a <em>menu item</em>, which is a different
        element than the button it was — the same element cannot be in two places,
        so the toolbar needs the action's intent to render it either way.
      </>
    }
  >
    <DemoSection
      title="1. Full width — everything fits"
      codeTitle="No overflow when there is room"
      codeDescription="Resize the window: actions collapse into the ••• menu as space runs out."
      code={`const ACTIONS: ToolbarAction[] = [
  { id: "create", label: "Create", icon: "plus", variant: "solid", color: "primary", overflow: "never" },
  { id: "edit", label: "Edit", icon: "edit" },
  { id: "delete", label: "Delete", icon: "trash", color: "error", separatorBefore: true },
];

<Toolbar actions={ACTIONS} aria-label="Order actions">
  <h3>Orders</h3>
</Toolbar>`}
    >
      <div class="zen-w-full zen-rounded-zen-md zen-border zen-border-zen-border zen-p-2">
        <Toolbar actions={ACTIONS} aria-label="Order actions (full width)">
          <h3 class="zen-m-0 zen-text-sm zen-font-semibold">Orders</h3>
        </Toolbar>
      </div>
    </DemoSection>

    <DemoSection
      title="2. Constrained — actions collapse"
      codeTitle="Same actions, 420px of room"
      codeDescription="Create is pinned with overflow:'never', so it stays on the bar however tight it gets."
      code={`<div style={{ width: "420px" }}>
  <Toolbar actions={ACTIONS} aria-label="Order actions" />
</div>`}
    >
      <div
        class="zen-rounded-zen-md zen-border zen-border-zen-border zen-p-2"
        style={{ width: "420px" }}
      >
        <Toolbar actions={ACTIONS} aria-label="Order actions (420px)" />
      </div>
    </DemoSection>

    <DemoSection
      title="3. Very narrow — only the pinned action survives"
      codeTitle="240px"
      codeDescription="Everything collapsible is in the menu; the pinned Create and the ••• trigger remain."
      code={`<div style={{ width: "240px" }}>
  <Toolbar actions={ACTIONS} aria-label="Order actions" />
</div>`}
    >
      <div
        class="zen-rounded-zen-md zen-border zen-border-zen-border zen-p-2"
        style={{ width: "240px" }}
      >
        <Toolbar actions={ACTIONS} aria-label="Order actions (240px)" />
      </div>
    </DemoSection>

    <DemoSection
      title="4. With leading content"
      codeTitle="children are leading content and never overflow"
      codeDescription={
        <>
          A title, a count — whatever names the bar. Only <code>actions</code>{" "}
          collapse.
        </>
      }
      code={`<Toolbar actions={ACTIONS} aria-label="Order actions">
  <h3>Orders</h3>
  <span class="zen-text-xs zen-text-zen-muted-fg">128 items</span>
</Toolbar>`}
    >
      <div
        class="zen-rounded-zen-md zen-border zen-border-zen-border zen-p-2"
        style={{ width: "560px" }}
      >
        <Toolbar actions={ACTIONS} aria-label="Order actions (leading)">
          <h3 class="zen-m-0 zen-text-sm zen-font-semibold">Orders</h3>
          <span class="zen-text-xs zen-text-zen-muted-fg">128 items</span>
        </Toolbar>
      </div>
    </DemoSection>
  </DemoPage>
);

export default NewToolbarDemo;
