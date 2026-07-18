import { useState } from "react";
import { FAB } from "./fab/fab";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu/dropdown-menu";
import { CodeExample } from "./demo-helpers";

const NewFABDemo: React.FC = () => {
  const [showAll, setShowAll] = useState(false);

  return (
    <div className="demo-page">
      <h1>FAB (new — shadcn-style composition)</h1>
      <p className="lede">
        Fixed-position floating action button. Wraps the new{" "}
        <code>Button</code> with positioning + elevation. For multi-action
        speed-dial menus, compose <code>FAB</code> with{" "}
        <code>DropdownMenu</code>.
      </p>

      <section className="demo-section">
        <h2>1. Inline preview</h2>
        <p style={{ fontSize: "0.8125rem", color: "var(--zen-color-muted-fg)", marginTop: -8 }}>
          The real FABs render <em>fixed-position</em> over the whole page;
          to keep this docs page tidy they're enabled via the toggle below.
        </p>
        <CodeExample
          title="Toggle to mount fixed-position FABs"
          code={`<FAB onClick={...} iconLeft={<PlusIcon />} />
<FAB position="bottom-left" color="error" iconLeft={<TrashIcon />} />`}
        >
          <button
            onClick={() => setShowAll((v) => !v)}
            style={{
              padding: "0.375rem 0.75rem",
              background: "var(--zen-color-primary)",
              color: "white",
              border: 0,
              borderRadius: 6,
              cursor: "pointer",
              fontSize: "0.8125rem",
            }}
          >
            {showAll ? "Hide fixed FABs" : "Show fixed FABs"}
          </button>
          {showAll ? (
            <>
              <FAB
                position="bottom-right"
                color="primary"
                aria-label="Add"
                iconLeft={<PlusIcon />}
                onClick={() => alert("Primary action")}
              />
              <FAB
                position="bottom-left"
                color="error"
                aria-label="Delete"
                iconLeft={<TrashIcon />}
                onClick={() => alert("Delete action")}
              />
            </>
          ) : null}
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Speed-dial via DropdownMenu</h2>
        <CodeExample
          title="Compose FAB with DropdownMenu for multi-action menus"
          code={`<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <FAB iconLeft={<PlusIcon />} aria-label="Quick actions" />
  </DropdownMenuTrigger>
  <DropdownMenuContent side="top" align="end">
    <DropdownMenuItem>New document</DropdownMenuItem>
    <DropdownMenuItem>New folder</DropdownMenuItem>
    <DropdownMenuItem>Upload file</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`}
        >
          <div style={{ position: "relative", height: 120, width: "100%" }}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div style={{ position: "absolute", bottom: 0, right: 0 }}>
                  <FAB
                    iconLeft={<PlusIcon />}
                    aria-label="Quick actions"
                    /* override the fixed positioning so it stays inside the demo card */
                    className="!zen-static"
                  />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="end">
                <DropdownMenuItem>New document</DropdownMenuItem>
                <DropdownMenuItem>New folder</DropdownMenuItem>
                <DropdownMenuItem>Upload file</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. Sizes</h2>
        <CodeExample
          title="md · lg (default) · xl"
          code={`<FAB size="md" /> <FAB size="lg" /> <FAB size="xl" />`}
        >
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            {(["md", "lg", "xl"] as const).map((size) => (
              <FAB
                key={size}
                size={size}
                className="!zen-static"
                aria-label={`Size ${size}`}
                iconLeft={<PlusIcon />}
              />
            ))}
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. Colors</h2>
        <CodeExample
          title="Any Button color works"
          code={`<FAB color="success" iconLeft={<CheckIcon />} />
<FAB color="error" iconLeft={<TrashIcon />} />
<FAB color="warning" iconLeft={<AlertIcon />} />`}
        >
          <div style={{ display: "flex", gap: 16 }}>
            <FAB color="primary" className="!zen-static" iconLeft={<PlusIcon />} aria-label="Add" />
            <FAB color="success" className="!zen-static" iconLeft={<CheckIcon />} aria-label="Confirm" />
            <FAB color="error" className="!zen-static" iconLeft={<TrashIcon />} aria-label="Delete" />
            <FAB color="warning" className="!zen-static" iconLeft={<AlertIcon />} aria-label="Alert" />
          </div>
        </CodeExample>
      </section>
    </div>
  );
};

const PlusIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const TrashIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
  </svg>
);
const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const AlertIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12" y2="17" />
  </svg>
);

export default NewFABDemo;
