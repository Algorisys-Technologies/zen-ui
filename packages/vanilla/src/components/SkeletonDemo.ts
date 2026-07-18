import { Skeleton } from "./skeleton/skeleton";
import { DemoPage } from "./demo-helpers";

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
      "Loading placeholder. Animated muted box; no primitive required. Size and shape are entirely up to the consumer via utility classes — use one per visual block you're standing in for.",
    sections: [
      {
        title: "1. Single line",
        codeTitle: "class controls dimensions",
        code: `Skeleton({ class: "zen-h-4 zen-w-64" })`,
        render: () => Skeleton({ class: "zen-h-4 zen-w-64" }).el,
      },
      {
        title: "2. Paragraph",
        codeTitle: "Stack multiple lines",
        code: `const para = document.createElement("div");
para.style.display = "flex";
para.style.flexDirection = "column";
para.style.gap = "8px";
para.append(
  Skeleton({ class: "zen-h-4 zen-w-full" }).el,
  Skeleton({ class: "zen-h-4 zen-w-11/12" }).el,
  Skeleton({ class: "zen-h-4 zen-w-9/12" }).el,
);`,
        render: () =>
          box(
            { display: "flex", flexDirection: "column", gap: "8px", width: "100%", maxWidth: "480px" },
            Skeleton({ class: "zen-h-4 zen-w-full" }).el,
            Skeleton({ class: "zen-h-4 zen-w-11/12" }).el,
            Skeleton({ class: "zen-h-4 zen-w-9/12" }).el,
          ),
      },
      {
        title: "3. Avatar placeholder",
        codeTitle: "rounded-zen-full for circular shapes",
        code: `Skeleton({ class: "zen-h-10 zen-w-10 zen-rounded-zen-full" })`,
        render: () => [
          Skeleton({ class: "zen-h-10 zen-w-10 zen-rounded-zen-full" }).el,
          Skeleton({ class: "zen-h-12 zen-w-12 zen-rounded-zen-full" }).el,
          Skeleton({ class: "zen-h-16 zen-w-16 zen-rounded-zen-full" }).el,
        ],
      },
      {
        title: "4. Card placeholder",
        codeTitle: "Compose skeletons to mimic the final layout",
        code: `const row = document.createElement("div");
row.style.display = "flex";
row.style.alignItems = "center";
row.style.gap = "12px";

const lines = document.createElement("div");
lines.style.display = "flex";
lines.style.flexDirection = "column";
lines.style.gap = "8px";
lines.style.flex = "1";
lines.append(
  Skeleton({ class: "zen-h-4 zen-w-1/2" }).el,
  Skeleton({ class: "zen-h-3 zen-w-3/4" }).el,
);

row.append(
  Skeleton({ class: "zen-h-12 zen-w-12 zen-rounded-zen-full" }).el,
  lines,
);`,
        render: () =>
          box(
            { display: "flex", alignItems: "center", gap: "12px", width: "100%", maxWidth: "480px" },
            Skeleton({ class: "zen-h-12 zen-w-12 zen-rounded-zen-full" }).el,
            box(
              { display: "flex", flexDirection: "column", gap: "8px", flex: "1" },
              Skeleton({ class: "zen-h-4 zen-w-1/2" }).el,
              Skeleton({ class: "zen-h-3 zen-w-3/4" }).el,
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
  row.append(
    Skeleton({ class: "zen-h-4 zen-w-20" }).el,
    Skeleton({ class: "zen-h-4 zen-w-32" }).el,
    Skeleton({ class: "zen-h-4 zen-w-16" }).el,
  );
  return row;
});`,
        render: () =>
          box(
            { display: "flex", flexDirection: "column", gap: "8px", width: "100%", maxWidth: "480px" },
            ...Array.from({ length: 3 }, () =>
              box(
                { display: "flex", gap: "16px" },
                Skeleton({ class: "zen-h-4 zen-w-20" }).el,
                Skeleton({ class: "zen-h-4 zen-w-32" }).el,
                Skeleton({ class: "zen-h-4 zen-w-16" }).el,
              ),
            ),
          ),
      },
      {
        title: "6. Custom background via class",
        codeTitle: "Override the muted background",
        code: `Skeleton({ class: "zen-h-4 zen-w-32 zen-bg-zen-primary-soft" })`,
        render: () => [
          Skeleton({ class: "zen-h-4 zen-w-32 zen-bg-zen-primary-soft" }).el,
          Skeleton({ class: "zen-h-4 zen-w-32 zen-bg-zen-success-soft" }).el,
          Skeleton({ class: "zen-h-4 zen-w-32 zen-bg-zen-error-soft" }).el,
        ],
      },
    ],
  });
}
