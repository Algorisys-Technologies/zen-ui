import { RichText } from "./rich-text/rich-text";
import { DemoPage } from "./demo-helpers";
// Jodit renders its toolbar from its own stylesheet. Without it the toolbar's
// icons have no width attribute and nothing to size them, so they expand to fill
// the pane — a 930px chevron. This pulls from `jodit` (the actual editor), which
// is where the CSS lives; it is the same import the React and Solid demos use.
import "jodit/es2021/jodit.min.css";

export default function RichTextDemo(): HTMLElement {
  let html = "<p>Hello from <strong>zen-ui</strong> 👋</p>";

  // Shared across the two sections: the editor commits on blur, and the <pre>
  // below reflects whatever the editor last produced.
  const output = document.createElement("pre");
  output.style.margin = "0";
  output.style.padding = "12px";
  output.style.width = "100%";
  output.style.overflowX = "auto";
  output.style.fontSize = "0.75rem";
  output.style.background = "var(--zen-color-muted)";
  output.style.borderRadius = "6px";
  output.style.color = "var(--zen-color-foreground)";
  output.textContent = html;

  const editor = RichText({
    value: html,
    placeholder: "Write something…",
    onChange: (next) => {
      html = next;
      output.textContent = html;
    },
  });

  return DemoPage({
    title: "RichText",
    description:
      "WYSIWYG editor wrapping jodit (an optional peer dependency, lazy-loaded on first render). onChange fires on blur (Jodit's recommended commit point). Install jodit and import jodit/es2021/jodit.min.css to use it.",
    sections: [
      {
        title: "1. Controlled editor",
        codeTitle: "value / onChange",
        code: `let html = "<p>Hello…</p>";

const editor = RichText({
  value: html,
  onChange: (next) => { html = next; },
  placeholder: "Write something…",
});
document.body.append(editor.el);`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.width = "100%";
          wrap.append(editor.el);
          return wrap;
        },
      },
      {
        title: "2. Current HTML",
        codeTitle: "onChange output (updates on blur)",
        code: `// html state`,
        render: () => output,
      },
    ],
  });
}
