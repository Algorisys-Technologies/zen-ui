import { Button } from "../components/button/button";
import { ToastAction } from "../components/toast/toast";
import { toast } from "../components/toast/use-toast";
import { CodeExample } from "./demo-helpers";

/**
 * The <Toaster /> wrapper is already mounted in App.tsx; this demo just
 * fires toasts via the imperative `toast()` helper.
 */
const NewToastDemo: React.FC = () => (
  <div className="demo-page">
    <h1>Toast (new — Radix-backed)</h1>
    <p className="lede">
      Transient notification banners. Imperative <code>toast()</code> helper
      pairs with <code>&lt;Toaster /&gt;</code> mounted once near the root
      (already on this demo). Radix handles queuing, swipe-to-dismiss,
      hover-to-pause, ARIA live region.
    </p>

    <section className="demo-section">
      <h2>1. Basic</h2>
      <CodeExample
        title="toast({ title, description })"
        code={`import { toast } from "@algorisys/zen-ui-react";

toast({
  title: "Saved",
  description: "Profile updated.",
});`}
      >
        <Button
          onClick={() =>
            toast({ title: "Saved", description: "Profile updated." })
          }
        >
          Show toast
        </Button>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>2. Variants</h2>
      <CodeExample
        title="default · success · warning · destructive · info"
        code={`toast({ variant: "success",     title: "Verified" });
toast({ variant: "warning",     title: "Storage 80% full" });
toast({ variant: "destructive", title: "Couldn't save" });
toast({ variant: "info",        title: "Update available" });`}
      >
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Button
            color="success"
            onClick={() =>
              toast({
                variant: "success",
                title: "Verified",
                description: "Your ID has been verified.",
              })
            }
          >
            success
          </Button>
          <Button
            color="warning"
            onClick={() =>
              toast({
                variant: "warning",
                title: "Storage 80% full",
                description: "Consider upgrading your plan.",
              })
            }
          >
            warning
          </Button>
          <Button
            color="error"
            onClick={() =>
              toast({
                variant: "destructive",
                title: "Couldn't save",
                description: "Check your connection and try again.",
              })
            }
          >
            destructive
          </Button>
          <Button
            color="info"
            onClick={() =>
              toast({
                variant: "info",
                title: "Update available",
                description: "v3.0.0 is ready.",
              })
            }
          >
            info
          </Button>
        </div>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>3. With action button</h2>
      <CodeExample
        title="Use ToastAction for an inline action (Undo / Retry)"
        code={`toast({
  title: "Item deleted",
  description: "It's gone — for now.",
  action: <ToastAction altText="Undo" onClick={undo}>Undo</ToastAction>,
});`}
      >
        <Button
          onClick={() =>
            toast({
              title: "Item deleted",
              description: "It's gone — for now.",
              action: (
                <ToastAction altText="Undo" onClick={() => toast({ title: "Restored" })}>
                  Undo
                </ToastAction>
              ),
            })
          }
        >
          Delete (with undo)
        </Button>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>4. Sticky (no auto-dismiss)</h2>
      <CodeExample
        title="duration: Infinity"
        code={`toast({
  title: "Connection lost",
  description: "Reconnecting…",
  duration: Infinity,        // user must dismiss manually
});`}
      >
        <Button
          color="warning"
          onClick={() =>
            toast({
              variant: "warning",
              title: "Connection lost",
              description: "Reconnecting…",
              duration: Infinity,
            })
          }
        >
          Sticky toast
        </Button>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>5. Update an existing toast</h2>
      <CodeExample
        title="toast() returns { id, update, dismiss }"
        code={`const t = toast({ title: "Uploading…" });
upload.on("progress", (pct) => t.update({ description: \`\${pct}%\` }));
upload.on("done", () => t.update({ variant: "success", title: "Uploaded" }));`}
      >
        <Button
          onClick={() => {
            const t = toast({
              title: "Uploading…",
              description: "0%",
              duration: Infinity,
            });
            let pct = 0;
            const id = setInterval(() => {
              pct += 20;
              if (pct < 100) {
                t.update({ description: `${pct}%` });
              } else {
                clearInterval(id);
                t.update({
                  variant: "success",
                  title: "Uploaded",
                  description: "All files saved.",
                  duration: 4000,
                });
              }
            }, 350);
          }}
        >
          Simulate upload
        </Button>
      </CodeExample>
    </section>
  </div>
);

export default NewToastDemo;
