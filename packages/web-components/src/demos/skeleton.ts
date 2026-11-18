import { DemoPage } from "./demo-helpers";

/**
 * Skeleton demo — the web-components port. <zen-skeleton> renders its pulsing box
 * as an inner element, so the caller sizes and restyles that box through the
 * `[&>*]:…` child variant on the host's class (e.g. `[&>*]:zen-h-4 [&>*]:zen-w-64`).
 */

function skeleton(childClasses: string): HTMLElement {
  const s = document.createElement("zen-skeleton");
  s.className = childClasses;
  return s;
}

/** A flex column/row wrapper for composing skeletons, matching the React demo's inline styles. */
function box(styles: Partial<CSSStyleDeclaration>, ...children: Node[]): HTMLDivElement {
  const div = document.createElement("div");
  Object.assign(div.style, styles);
  div.append(...children);
  return div;
}

export default function SkeletonDemo(): HTMLElement {
  return DemoPage({
    title: "Skeleton (new — shadcn-style)",
    description:
      "Loading placeholder. Animated muted box; no primitive required. Size and shape are entirely up to the consumer via utility classes — use one per visual block you're standing in for. In web-components the box is styled through the `[&>*]:` child variant, since the element wraps the rendered box.",
    sections: [
      {
        title: "1. Single line",
        codeTitle: "class controls dimensions",
        code: `<zen-skeleton class="[&>*]:zen-h-4 [&>*]:zen-w-64"></zen-skeleton>`,
        render: () => skeleton("[&>*]:zen-h-4 [&>*]:zen-w-64"),
      },
      {
        title: "2. Paragraph",
        codeTitle: "Stack multiple lines",
        code: `<zen-skeleton class="[&>*]:zen-h-4 [&>*]:zen-w-full"></zen-skeleton>
<zen-skeleton class="[&>*]:zen-h-4 [&>*]:zen-w-11/12"></zen-skeleton>
<zen-skeleton class="[&>*]:zen-h-4 [&>*]:zen-w-9/12"></zen-skeleton>`,
        render: () =>
          box(
            { display: "flex", flexDirection: "column", gap: "8px", width: "100%", maxWidth: "480px" },
            skeleton("[&>*]:zen-h-4 [&>*]:zen-w-full"),
            skeleton("[&>*]:zen-h-4 [&>*]:zen-w-11/12"),
            skeleton("[&>*]:zen-h-4 [&>*]:zen-w-9/12"),
          ),
      },
      {
        title: "3. Avatar placeholder",
        codeTitle: "rounded-zen-full for circular shapes",
        code: `<zen-skeleton class="[&>*]:zen-h-10 [&>*]:zen-w-10 [&>*]:zen-rounded-zen-full"></zen-skeleton>`,
        render: () => [
          skeleton("[&>*]:zen-h-10 [&>*]:zen-w-10 [&>*]:zen-rounded-zen-full"),
          skeleton("[&>*]:zen-h-12 [&>*]:zen-w-12 [&>*]:zen-rounded-zen-full"),
          skeleton("[&>*]:zen-h-16 [&>*]:zen-w-16 [&>*]:zen-rounded-zen-full"),
        ],
      },
      {
        title: "4. Card placeholder",
        codeTitle: "Compose skeletons to mimic the final layout",
        code: `<div style="display:flex;align-items:center;gap:12px">
  <zen-skeleton class="[&>*]:zen-h-12 [&>*]:zen-w-12 [&>*]:zen-rounded-zen-full"></zen-skeleton>
  <div style="display:flex;flex-direction:column;gap:8px;flex:1">
    <zen-skeleton class="[&>*]:zen-h-4 [&>*]:zen-w-1/2"></zen-skeleton>
    <zen-skeleton class="[&>*]:zen-h-3 [&>*]:zen-w-3/4"></zen-skeleton>
  </div>
</div>`,
        render: () =>
          box(
            { display: "flex", alignItems: "center", gap: "12px", width: "100%", maxWidth: "480px" },
            skeleton("[&>*]:zen-h-12 [&>*]:zen-w-12 [&>*]:zen-rounded-zen-full"),
            box(
              { display: "flex", flexDirection: "column", gap: "8px", flex: "1" },
              skeleton("[&>*]:zen-h-4 [&>*]:zen-w-1/2"),
              skeleton("[&>*]:zen-h-3 [&>*]:zen-w-3/4"),
            ),
          ),
      },
      {
        title: "5. Table row",
        codeTitle: "Repeat in a list",
        code: `Array.from({ length: 3 }).map(() => {
  const row = document.createElement("div");
  row.style.display = "flex";
  row.style.gap = "16px";
  row.innerHTML = \`
    <zen-skeleton class="[&>*]:zen-h-4 [&>*]:zen-w-20"></zen-skeleton>
    <zen-skeleton class="[&>*]:zen-h-4 [&>*]:zen-w-32"></zen-skeleton>
    <zen-skeleton class="[&>*]:zen-h-4 [&>*]:zen-w-16"></zen-skeleton>\`;
  return row;
});`,
        render: () =>
          box(
            { display: "flex", flexDirection: "column", gap: "8px", width: "100%", maxWidth: "480px" },
            ...Array.from({ length: 3 }, () =>
              box(
                { display: "flex", gap: "16px" },
                skeleton("[&>*]:zen-h-4 [&>*]:zen-w-20"),
                skeleton("[&>*]:zen-h-4 [&>*]:zen-w-32"),
                skeleton("[&>*]:zen-h-4 [&>*]:zen-w-16"),
              ),
            ),
          ),
      },
      {
        title: "6. Custom background via class",
        codeTitle: "Override the muted background",
        code: `<zen-skeleton class="[&>*]:zen-h-4 [&>*]:zen-w-32 [&>*]:zen-bg-zen-primary-soft"></zen-skeleton>`,
        render: () => [
          skeleton("[&>*]:zen-h-4 [&>*]:zen-w-32 [&>*]:zen-bg-zen-primary-soft"),
          skeleton("[&>*]:zen-h-4 [&>*]:zen-w-32 [&>*]:zen-bg-zen-success-soft"),
          skeleton("[&>*]:zen-h-4 [&>*]:zen-w-32 [&>*]:zen-bg-zen-error-soft"),
        ],
      },
    ],
  });
}
