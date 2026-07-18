import { Toolbar, type ToolbarAction } from "./toolbar/toolbar";
import { CodeExample } from "./demo-helpers";

/**
 * Toolbar demo. The sections deliberately constrain width, because the whole
 * point of the component only shows up when the actions do not fit.
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
  <div className="demo-page">
    <h1>Toolbar</h1>
    <p className="lede">
      A row of actions that collapses into an overflow menu when it runs out of
      room. <code>actions</code> is data rather than children: an overflowed
      action has to re-render as a <em>menu item</em>, which is a different
      element than the button it was — the same element cannot be in two places,
      so the toolbar needs the action's intent to render it either way.
    </p>

    <section className="demo-section">
      <h2>1. Full width — everything fits</h2>
      <CodeExample
        title="No overflow when there is room"
        description="Resize the window: actions collapse into the ••• menu as space runs out."
        code={`const actions: ToolbarAction[] = [
  { id: "create", label: "Create", icon: "plus", variant: "solid", color: "primary", overflow: "never" },
  { id: "edit", label: "Edit", icon: "edit" },
  { id: "delete", label: "Delete", icon: "trash", color: "error", separatorBefore: true },
];

<Toolbar actions={actions} aria-label="Order actions">
  <h3>Orders</h3>
</Toolbar>`}
      >
        <div className="zen-w-full zen-rounded-zen-md zen-border zen-border-zen-border zen-p-2">
          <Toolbar actions={ACTIONS} aria-label="Order actions (full width)">
            <h3 className="zen-m-0 zen-text-sm zen-font-semibold">Orders</h3>
          </Toolbar>
        </div>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>2. Constrained — actions collapse</h2>
      <CodeExample
        title="Same actions, 420px of room"
        description="Create is pinned with overflow:'never', so it stays on the bar however tight it gets."
        code={`<div style={{ width: 420 }}>
  <Toolbar actions={actions} aria-label="Order actions" />
</div>`}
      >
        <div
          className="zen-rounded-zen-md zen-border zen-border-zen-border zen-p-2"
          style={{ width: 420 }}
        >
          <Toolbar actions={ACTIONS} aria-label="Order actions (420px)" />
        </div>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>3. Very narrow — only the pinned action survives</h2>
      <CodeExample
        title="240px"
        description="Everything collapsible is in the menu; the pinned Create and the ••• trigger remain."
        code={`<div style={{ width: 240 }}>
  <Toolbar actions={actions} aria-label="Order actions" />
</div>`}
      >
        <div
          className="zen-rounded-zen-md zen-border zen-border-zen-border zen-p-2"
          style={{ width: 240 }}
        >
          <Toolbar actions={ACTIONS} aria-label="Order actions (240px)" />
        </div>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>4. With leading content</h2>
      <CodeExample
        title="children are leading content and never overflow"
        description="A title, a count — whatever names the bar. Only `actions` collapse."
        code={`<Toolbar actions={actions} aria-label="Order actions">
  <h3>Orders</h3>
  <span className="zen-text-xs zen-text-zen-muted-fg">128 items</span>
</Toolbar>`}
      >
        <div
          className="zen-rounded-zen-md zen-border zen-border-zen-border zen-p-2"
          style={{ width: 560 }}
        >
          <Toolbar actions={ACTIONS} aria-label="Order actions (leading)">
            <h3 className="zen-m-0 zen-text-sm zen-font-semibold">Orders</h3>
            <span className="zen-text-xs zen-text-zen-muted-fg">128 items</span>
          </Toolbar>
        </div>
      </CodeExample>
    </section>
  </div>
);

export default NewToolbarDemo;
