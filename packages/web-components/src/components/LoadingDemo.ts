import { DemoPage } from "./demo-helpers";

/**
 * Loading demo — the web-components port. <zen-loading> is a pure SVG spinner
 * driven by `size` / `color` / `label`; it carries a visually-hidden label so
 * screen readers announce "Loading". label="" marks it decorative.
 */

const COLORS = ["primary", "neutral", "info", "success", "warning", "error"] as const;

function loading(attrs: Record<string, string> = {}): HTMLElement {
  const n = document.createElement("zen-loading");
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  return n;
}

export default function LoadingDemo(): HTMLElement {
  return DemoPage({
    title: "Loading",
    description:
      "Animated spinner. No primitive needed; it is a plain SVG with zen-animate-spin, the same pattern shadcn ships. Carries a visually-hidden label so screen readers announce \"Loading\".",
    sections: [
      {
        title: "1. Default",
        codeTitle: "md primary spinner with sr-only 'Loading' label",
        code: `<zen-loading></zen-loading>`,
        render: () => loading(),
      },
      {
        title: "2. Sizes",
        codeTitle: "sm · md · lg · xl",
        code: `<zen-loading size="sm"></zen-loading>
<zen-loading size="md"></zen-loading>
<zen-loading size="lg"></zen-loading>
<zen-loading size="xl"></zen-loading>`,
        render: () => (["sm", "md", "lg", "xl"] as const).map((size) => loading({ size })),
      },
      {
        title: "3. Colors",
        codeTitle: "primary · neutral · info · success · warning · error · current",
        codeDescription:
          'Use "current" to inherit the surrounding text color — useful when nesting Loading inside a Button.',
        code: `<zen-loading color="primary"></zen-loading>
<zen-loading color="success"></zen-loading>
<zen-loading color="error"></zen-loading>
<zen-loading color="current"></zen-loading>`,
        render: () =>
          COLORS.map((color) => loading({ color, size: "lg", label: `Loading ${color}` })),
      },
      {
        title: "4. Inside a Button",
        codeTitle: 'color="current" inherits the button\'s text color',
        code: `<zen-button disabled>
  <zen-loading color="current" size="sm" label=""></zen-loading>
  Saving…
</zen-button>`,
        render: () => {
          const btn = (variant: string | null, text: string) => {
            const b = document.createElement("zen-button");
            b.setAttribute("disabled", "");
            if (variant) b.setAttribute("variant", variant);
            b.append(loading({ color: "current", size: "sm", label: "" }), document.createTextNode(text));
            return b;
          };
          return [btn(null, "Saving…"), btn("outline", "Loading…")];
        },
      },
      {
        title: "5. Decorative (no announcement)",
        codeTitle: 'label="" marks it presentational so the parent provides semantics',
        codeDescription:
          'Useful when the surrounding element already says "Loading" or carries aria-busy.',
        code: `<div aria-busy="true">
  <zen-loading label=""></zen-loading>
  Fetching results…
</div>`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.setAttribute("aria-busy", "true");
          wrap.style.display = "inline-flex";
          wrap.style.alignItems = "center";
          wrap.style.gap = "8px";
          wrap.style.fontSize = "0.875rem";
          const span = document.createElement("span");
          span.textContent = "Fetching results…";
          wrap.append(loading({ label: "" }), span);
          return wrap;
        },
      },
      {
        title: "6. Full-page overlay pattern",
        codeTitle: "Compose with a wrapper for blocking states",
        code: `const overlay = document.createElement("div");
Object.assign(overlay.style, {
  position: "fixed", inset: "0",
  background: "rgba(0,0,0,0.4)",
  display: "grid", placeItems: "center",
});
overlay.append(document.createElement("zen-loading"));`,
        render: () => {
          const box = document.createElement("div");
          Object.assign(box.style, {
            position: "relative",
            width: "240px",
            height: "80px",
            background: "var(--zen-color-muted)",
            borderRadius: "var(--zen-radius-md)",
            display: "grid",
            placeItems: "center",
          });
          box.append(loading({ size: "lg", color: "primary" }));
          return box;
        },
      },
    ],
  });
}
