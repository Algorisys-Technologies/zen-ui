import { DemoPage } from "./demo-helpers";
import { toast, ToastAction } from "../index";

/**
 * Toast demo — fires transient notifications via the imperative `toast()` helper
 * re-exported from the binding. Toasts are imperative, not elements, so instead of
 * a `<Toaster>` factory we mount ONE <zen-toaster> viewport near the root; it
 * renders purely from the module store and persists across navigation. The trigger
 * buttons are <zen-button> elements.
 */
let toasterMounted = false;
function ensureToaster(): void {
  if (toasterMounted) return;
  toasterMounted = true;
  document.body.append(document.createElement("zen-toaster"));
}

function button(
  attrs: Record<string, string>,
  label: string,
  onClick: () => void,
): HTMLElement {
  const b = document.createElement("zen-button");
  for (const [k, v] of Object.entries(attrs)) b.setAttribute(k, v);
  b.textContent = label;
  b.addEventListener("click", onClick);
  return b;
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
      "Transient notification banners. The imperative toast() helper pairs with a <zen-toaster> viewport mounted once near the root (already on this demo). This binding owns what Radix did for React: the auto-dismiss timer, hover-to-pause, swipe-to-dismiss, the queue cap, and the ARIA live region.",
    sections: [
      {
        title: "1. Basic",
        codeTitle: "toast({ title, description })",
        code: `import { toast } from "@algorisys/zen-ui-web-components";

toast({
  title: "Saved",
  description: "Profile updated.",
});`,
        render: () =>
          button({}, "Show toast", () =>
            toast({ title: "Saved", description: "Profile updated." }),
          ),
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
            button({ color: "success" }, "success", () =>
              toast({
                variant: "success",
                title: "Verified",
                description: "Your ID has been verified.",
              }),
            ),
            button({ color: "warning" }, "warning", () =>
              toast({
                variant: "warning",
                title: "Storage 80% full",
                description: "Consider upgrading your plan.",
              }),
            ),
            button({ color: "error" }, "destructive", () =>
              toast({
                variant: "destructive",
                title: "Couldn't save",
                description: "Check your connection and try again.",
              }),
            ),
            button({ color: "info" }, "info", () =>
              toast({
                variant: "info",
                title: "Update available",
                description: "v6.0.0 is ready.",
              }),
            ),
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
          button({}, "Delete (with undo)", () =>
            toast({
              title: "Item deleted",
              description: "It's gone — for now.",
              action: ToastAction({
                altText: "Undo",
                children: "Undo",
                onClick: () => toast({ title: "Restored" }),
              }),
            }),
          ),
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
          button({ color: "warning" }, "Sticky toast", () =>
            toast({
              variant: "warning",
              title: "Connection lost",
              description: "Reconnecting…",
              duration: Infinity,
            }),
          ),
      },
      {
        title: "5. Update an existing toast",
        codeTitle: "toast() returns { id, update, dismiss }",
        code: `const t = toast({ title: "Uploading…" });
upload.on("progress", (pct) => t.update({ description: \`\${pct}%\` }));
upload.on("done", () => t.update({ variant: "success", title: "Uploaded" }));`,
        render: () =>
          button({}, "Simulate upload", () => {
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
          }),
      },
      {
        title: "6. The Solid binding's calls",
        codeTitle: 'toast("Saved") · toast.success · toast.error · toast.loading · toast.promise',
        codeDescription:
          "The same calls the Solid binding takes, so code moves between the bindings unchanged. toast with a message, rather than an object, shows it as the title and returns the toast's id. success and error pick the variant. loading shows a spinner and stays until you replace it: pass its id to success or error and that toast changes in place. promise does that for you when a promise settles. dismiss closes one toast, or all of them with no id. The object form above still works.",
        code: "toast(\"Saved\");\ntoast.success(\"Profile updated\");\ntoast.error(\"Couldn't save\");\n\nconst id = toast.loading(\"Uploading\u2026\");\n// later, the same toast becomes the result:\ntoast.success(\"Uploaded\", { id });\n\ntoast.promise(save(), {\n  loading: \"Saving\u2026\",\n  success: \"Saved\",\n  error: (err) => `Couldn't save: ${err.message}`,\n});",
        render: () => {
          const box = row(
            button({}, "Default", () => toast("Saved")),
            button({ color: "success" }, "Success", () => toast.success("Profile updated")),
            button({ color: "error" }, "Error", () => toast.error("Couldn't save")),
            button({ variant: "outline" }, "Loading, then done", () => {
              const id = toast.loading("Uploading…");
              setTimeout(() => toast.success("Uploaded", { id }), 1500);
            }),
            button({ variant: "outline" }, "Promise", () => {
              void toast.promise(new Promise((resolve) => setTimeout(resolve, 1500)), {
                loading: "Saving…",
                success: "Saved",
                error: "Couldn't save",
              });
            }),
            button({ variant: "ghost" }, "Dismiss all", () => toast.dismiss()),
          );
          box.setAttribute("data-testid", "toast-solid-calls");
          return box;
        },
      },
    ],
  });
}
