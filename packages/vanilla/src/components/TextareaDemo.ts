import { Textarea } from "./form/input/textarea";
import { DemoPage } from "./demo-helpers";

/**
 * TextareaDemo — mirrors the Textarea sections of React's Input + Textarea demo
 * (NewInputDemo.tsx). The same shadcn-style primitive: a styled <textarea> with a
 * taller minimum height and no built-in label/counter/error scaffolding — those are
 * composed at the call site, exactly as the React demo shows.
 */
export default function TextareaDemo(): HTMLElement {
  return DemoPage({
    title: "Textarea",
    description:
      "Plain styled <textarea> primitive. No config, no built-in label/error/counter scaffolding — compose those at the call site. Same primitive shape as Input, with a taller minimum height.",
    sections: [
      {
        title: "1. Basic",
        codeTitle: "Same primitive shape, taller minimum height",
        code: `const t = Textarea({ placeholder: "Tell us more…", rows: 4 });
document.body.append(t.el);   // just a <textarea>`,
        render: () => {
          const t = Textarea({ placeholder: "Tell us more…", rows: 4 });
          t.el.style.maxWidth = "480px";
          return t.el;
        },
      },
      {
        title: "2. With label + counter",
        codeTitle: "Compose counter, helper text, error in the parent",
        codeDescription:
          "The primitive ships no counter. React reads e.target.value on change; here the node IS the handle, so the counter listens on the same element.",
        code: `const label = document.createElement("label");
const count = document.createElement("span");

const bio = Textarea({
  rows: 3,
  maxLength: 120,
  placeholder: "A short bio…",
  onInput: () => (count.textContent = \`\${bio.el.value.length} / 120\`),
});

label.append(titleSpan, bio.el, count);`,
        render: () => {
          const label = document.createElement("label");
          label.style.display = "flex";
          label.style.flexDirection = "column";
          label.style.gap = "6px";
          label.style.maxWidth = "480px";
          label.style.width = "100%";

          const title = document.createElement("span");
          title.style.fontSize = "0.8125rem";
          title.style.fontWeight = "500";
          title.textContent = "Bio";

          const count = document.createElement("span");
          count.style.fontSize = "0.75rem";
          count.style.color = "var(--zen-color-muted-fg)";
          count.style.alignSelf = "flex-end";
          count.textContent = "0 / 120";

          const bio = Textarea({
            rows: 3,
            maxLength: 120,
            placeholder: "A short bio…",
            onInput: () => (count.textContent = `${bio.el.value.length} / 120`),
          });

          label.append(title, bio.el, count);
          return label;
        },
      },
      {
        title: "3. Disabled / readOnly",
        codeTitle: "Standard HTML attributes",
        code: `Textarea({ disabled: true, defaultValue: "Disabled" })
Textarea({ readOnly: true, defaultValue: "Read-only" })`,
        render: () => {
          const grid = document.createElement("div");
          grid.style.display = "grid";
          grid.style.gap = "10px";
          grid.style.width = "100%";
          grid.style.maxWidth = "480px";
          grid.append(
            Textarea({ rows: 2, disabled: true, defaultValue: "Disabled" }).el,
            Textarea({ rows: 2, readOnly: true, defaultValue: "Read-only" }).el,
          );
          return grid;
        },
      },
    ],
  });
}
