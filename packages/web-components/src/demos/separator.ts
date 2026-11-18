import { DemoPage } from "./demo-helpers";

/**
 * Separator demo — the web-components port. <zen-separator> is a thin 1px rule.
 * `orientation` is the one attribute; `decorative` defaults TRUE and is a JS
 * property (a boolean attribute could never express the false a semantic
 * separator needs). Colour is themed through --zen-color-border.
 */

function separator(orientation?: "vertical", decorative?: boolean): HTMLElement {
  const s = document.createElement("zen-separator");
  if (orientation) s.setAttribute("orientation", orientation);
  if (decorative === false) Object.assign(s, { decorative: false });
  return s;
}

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
<zen-separator></zen-separator>
<div>Section below</div>`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.width = "100%";
          wrap.append(line("Section above"), separator(), line("Section below"));
          return wrap;
        },
      },
      {
        title: "2. Vertical",
        codeTitle: 'orientation="vertical"',
        codeDescription: "Container needs an explicit height so the separator can stretch.",
        code: `<div style="display:flex;height:40px;align-items:center;gap:0.625rem">
  <span>Blog</span>
  <zen-separator orientation="vertical"></zen-separator>
  <span>Docs</span>
  <zen-separator orientation="vertical"></zen-separator>
  <span>Source</span>
</div>`,
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
          // The host wraps the rule, so it must itself stretch to the row height
          // for the inner `h-full` to resolve against something.
          const vsep = () => {
            const s = separator("vertical");
            s.style.alignSelf = "stretch";
            return s;
          };
          row.append(span("Blog"), vsep(), span("Docs"), vsep(), span("Source"));
          return row;
        },
      },
      {
        title: "3. Semantic vs decorative",
        codeTitle: "decorative: false makes it a real ARIA separator",
        codeDescription:
          'Default is decorative (role="none") so screen readers skip it. Set decorative to false (a JS property) when the separator carries real semantic weight (e.g. between two distinct content regions).',
        code: `const s = document.createElement("zen-separator");
s.decorative = false;`,
        render: () => separator(undefined, false),
      },
      {
        title: "4. Custom color via token override",
        codeTitle: "Override --zen-color-border on the element",
        codeDescription:
          "The web-components separator styles its inner rule, so a class on the host cannot reach it. Retint it by overriding the --zen-color-border token the rule reads.",
        code: `<zen-separator style="--zen-color-border: var(--zen-color-primary)"></zen-separator>
<zen-separator style="--zen-color-border: var(--zen-color-error)"></zen-separator>`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.width = "100%";
          const primary = separator();
          primary.style.setProperty("--zen-color-border", "var(--zen-color-primary)");
          const error = separator();
          error.style.setProperty("--zen-color-border", "var(--zen-color-error)");
          const gap = document.createElement("div");
          gap.style.height = "8px";
          wrap.append(primary, gap, error);
          return wrap;
        },
      },
    ],
  });
}
