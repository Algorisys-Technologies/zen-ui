import { Separator } from "./divider/divider";
import { DemoPage } from "./demo-helpers";

function line(text: string): HTMLElement {
  const d = document.createElement("div");
  d.style.padding = "0.375rem 0";
  d.textContent = text;
  return d;
}

export default function SeparatorDemo(): HTMLElement {
  return DemoPage({
    title: "Separator (new — Radix-backed)",
    description:
      "Horizontal or vertical 1px divider. Ported from the Radix Separator for correct ARIA semantics. Themed via --zen-color-border.",
    sections: [
      {
        title: "1. Horizontal",
        codeTitle: "Default orientation",
        code: `<div>Section above</div>
<Separator />
<div>Section below</div>`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.width = "100%";
          wrap.append(line("Section above"), Separator().el, line("Section below"));
          return wrap;
        },
      },
      {
        title: "2. Vertical",
        codeTitle: 'orientation="vertical"',
        codeDescription: "Container needs an explicit height so the separator can stretch.",
        code: `const row = document.createElement("div");
row.style.display = "flex";
row.style.height = "40px";
row.style.alignItems = "center";
row.style.gap = "0.625rem";

const blog = document.createElement("span");
blog.textContent = "Blog";
row.append(
  blog,
  Separator({ orientation: "vertical" }).el,
  docs,
  Separator({ orientation: "vertical" }).el,
  source,
);`,
        render: () => {
          const row = document.createElement("div");
          row.style.display = "flex";
          row.style.height = "40px";
          row.style.alignItems = "center";
          row.style.gap = "0.625rem";
          const span = (t: string) => {
            const s = document.createElement("span");
            s.textContent = t;
            return s;
          };
          row.append(
            span("Blog"),
            Separator({ orientation: "vertical" }).el,
            span("Docs"),
            Separator({ orientation: "vertical" }).el,
            span("Source"),
          );
          return row;
        },
      },
      {
        title: "3. Semantic vs decorative",
        codeTitle: "decorative: false makes it a real ARIA separator",
        codeDescription:
          'Default is decorative (role="none") so screen readers skip it. Pass decorative: false when the separator carries real semantic weight (e.g. between two distinct content regions).',
        code: `Separator({ decorative: false });`,
        render: () => Separator({ decorative: false }).el,
      },
      {
        title: "4. Custom color via class",
        codeTitle: "Override --zen-color-border or pass utility classes",
        code: `Separator({ class: "zen-bg-zen-primary" });
Separator({ class: "zen-bg-zen-error" });`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.width = "100%";
          const gap = document.createElement("div");
          gap.style.height = "8px";
          wrap.append(
            Separator({ class: "zen-bg-zen-primary" }).el,
            gap,
            Separator({ class: "zen-bg-zen-error" }).el,
          );
          return wrap;
        },
      },
    ],
  });
}
