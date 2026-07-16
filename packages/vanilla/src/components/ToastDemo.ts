import { DemoPage } from "./demo-helpers";
import { Button } from "./button/button";
import { Toaster, toast, ToastAction } from "./toast/toaster";

/**
 * Toast demo — fires transient notifications via the imperative `toast()` helper.
 *
 * A single `<Toaster>` viewport is mounted once on `document.body` (the vanilla
 * equivalent of the React demo's `<Toaster>` in App.tsx). It persists across
 * navigation, so re-entering this page does not stack a second viewport.
 */
let toasterMounted = false;
function ensureToaster(): void {
  if (toasterMounted) return;
  toasterMounted = true;
  document.body.append(Toaster().el);
}

const row = (...nodes: Node[]): HTMLElement => {
  const div = document.createElement("div");
  div.style.display = "flex";
  div.style.gap = "8px";
  div.style.flexWrap = "wrap";
  div.append(...nodes);
  return div;
};

export default function ToastDemo(): HTMLElement {
  ensureToaster();

  return DemoPage({
    title: "Toast (Radix-backed parity)",
    description:
      "Transient notification banners. The imperative toast() helper pairs with a Toaster() viewport mounted once near the root (already on this demo). This binding owns what Radix did for React: the auto-dismiss timer, hover-to-pause, swipe-to-dismiss, the queue cap, and the ARIA live region.",
    sections: [
      {
        title: "1. Basic",
        codeTitle: "toast({ title, description })",
        code: `import { toast } from "@algorisys/zen-ui-vanilla";

toast({
  title: "Saved",
  description: "Profile updated.",
});`,
        render: () =>
          Button({
            children: "Show toast",
            onClick: () => toast({ title: "Saved", description: "Profile updated." }),
          }).el,
      },
      {
        title: "2. Variants",
        codeTitle: "default · success · warning · destructive · info",
        code: `toast({ variant: "success",     title: "Verified" });
toast({ variant: "warning",     title: "Storage 80% full" });
toast({ variant: "destructive", title: "Couldn't save" });
toast({ variant: "info",        title: "Update available" });`,
        render: () =>
          row(
            Button({
              color: "success",
              children: "success",
              onClick: () =>
                toast({
                  variant: "success",
                  title: "Verified",
                  description: "Your ID has been verified.",
                }),
            }).el,
            Button({
              color: "warning",
              children: "warning",
              onClick: () =>
                toast({
                  variant: "warning",
                  title: "Storage 80% full",
                  description: "Consider upgrading your plan.",
                }),
            }).el,
            Button({
              color: "error",
              children: "destructive",
              onClick: () =>
                toast({
                  variant: "destructive",
                  title: "Couldn't save",
                  description: "Check your connection and try again.",
                }),
            }).el,
            Button({
              color: "info",
              children: "info",
              onClick: () =>
                toast({
                  variant: "info",
                  title: "Update available",
                  description: "v6.0.0 is ready.",
                }),
            }).el,
          ),
      },
      {
        title: "3. With action button",
        codeTitle: "Use ToastAction for an inline action (Undo / Retry)",
        code: `toast({
  title: "Item deleted",
  description: "It's gone — for now.",
  action: ToastAction({
    altText: "Undo",
    children: "Undo",
    onClick: undo,
  }),
});`,
        render: () =>
          Button({
            children: "Delete (with undo)",
            onClick: () =>
              toast({
                title: "Item deleted",
                description: "It's gone — for now.",
                action: ToastAction({
                  altText: "Undo",
                  children: "Undo",
                  onClick: () => toast({ title: "Restored" }),
                }),
              }),
          }).el,
      },
      {
        title: "4. Sticky (no auto-dismiss)",
        codeTitle: "duration: Infinity",
        code: `toast({
  title: "Connection lost",
  description: "Reconnecting…",
  duration: Infinity,        // user must dismiss manually
});`,
        render: () =>
          Button({
            color: "warning",
            children: "Sticky toast",
            onClick: () =>
              toast({
                variant: "warning",
                title: "Connection lost",
                description: "Reconnecting…",
                duration: Infinity,
              }),
          }).el,
      },
      {
        title: "5. Update an existing toast",
        codeTitle: "toast() returns { id, update, dismiss }",
        code: `const t = toast({ title: "Uploading…" });
upload.on("progress", (pct) => t.update({ description: \`\${pct}%\` }));
upload.on("done", () => t.update({ variant: "success", title: "Uploaded" }));`,
        render: () =>
          Button({
            children: "Simulate upload",
            onClick: () => {
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
            },
          }).el,
      },
    ],
  });
}
