import { RichText } from "../components/rich-text/rich-text";
import { DemoPage } from "./demo-helpers";
// Jodit renders its toolbar from its own stylesheet. Without it the toolbar's
// icons have no width attribute and nothing to size them, so they expand to fill
// the pane — a 930px chevron. This pulls from `jodit` (the actual editor), which
// is where the CSS lives; it is the same import the React and Solid demos use.
import "jodit/es2021/jodit.min.css";
// The maths preview is typeset by KaTeX, which needs its stylesheet.
import "katex/dist/katex.min.css";

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
      {
        title: "3. Maths",
        codeTitle: "`math`, rendered with KaTeX beneath the editor",
        codeDescription:
          "Write $…$ inline and $$…$$ for a display equation. The editor keeps the TeX source, which is the only form that survives a round trip through storage; the rendered form is a preview underneath. katex is an optional peer dependency, loaded only when math is on — import its stylesheet once. renderMath is exported, so the question a candidate sees and the printed report render the same string the same way.",
        code: `import "katex/dist/katex.min.css";

RichText({ value: html, onChange: (next) => (html = next), math: true })

// anywhere else the same HTML is shown
const rendered = await renderMath(html);`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.className = "zen-w-full";
          wrap.append(RichText({ value: "<p>The roots of $ax^2 + bx + c = 0$ are</p><p>$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$</p>", math: true }).el);
          return wrap;
        },
      },
      {
        title: "4. Image uploads",
        codeTitle: "`onImageUpload`, so the HTML holds a URL",
        codeDescription:
          "Without it a dropped or pasted image is inlined as a base64 data URI, which works and quietly puts megabytes inside the HTML you store. With it, each file goes to your handler and the URL it resolves to is what gets embedded. Uploading is yours; this demo hands back a blob URL in place of a server's.",
        code: `RichText({
  value: html,
  onChange: (next) => (html = next),
  onImageUpload: async (file) => {
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/uploads", { method: "POST", body });
    return (await res.json()).url;
  },
})`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.className = "zen-flex zen-w-full zen-flex-col zen-gap-2";
          const log = document.createElement("p");
          log.className = "zen-m-0 zen-text-xs zen-text-zen-muted-fg";
          log.setAttribute("data-testid", "rich-text-uploads");
          log.textContent = "No uploads yet.";
          const uploads: string[] = [];
          /* Stands in for a real upload: a blob URL is what a server would hand
             back as a CDN path. The point is what lands in the HTML — a URL,
             not a data URI. */
          const uploadImage = async (file: File) => {
            const url = URL.createObjectURL(file);
            uploads.push(`${file.name} (${file.size} bytes) → ${url}`);
            log.textContent = `Uploaded: ${uploads.join("; ")}`;
            return url;
          };
          wrap.append(RichText({ value: "<p>Drop or paste an image here.</p>", onImageUpload: uploadImage }).el, log);
          return wrap;
        },
      },
    ],
  });
}
