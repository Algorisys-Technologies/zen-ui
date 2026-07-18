import { DemoPage } from "./demo-helpers";

/**
 * Mirrors the vanilla TextareaDemo, rendered through <zen-textarea>. All of the
 * native-mirroring props (rows, placeholder, disabled, read-only, max-length,
 * default-value) are plain attributes. The counter section listens to the native
 * `input` event that bubbles from the inner <textarea>.
 */
function el(
  tag: string,
  attrs: Record<string, string | number | boolean> = {},
): HTMLElement {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === false) continue;
    n.setAttribute(k, v === true ? "" : String(v));
  }
  return n;
}

export default function TextareaDemo(): HTMLElement {
  return DemoPage({
    title: "Textarea",
    description:
      "Plain styled <textarea> primitive. No config, no built-in label/error/counter scaffolding — compose those at the call site. Same primitive shape as Input, with a taller minimum height.",
    sections: [
      {
        title: "1. Basic",
        codeTitle: "Same primitive shape, taller minimum height",
        code: `<zen-textarea placeholder="Tell us more…" rows="4"></zen-textarea>`,
        render: () => {
          const t = el("zen-textarea", { placeholder: "Tell us more…", rows: 4 });
          t.style.display = "block";
          t.style.maxWidth = "480px";
          return t;
        },
      },
      {
        title: "2. With label + counter",
        codeTitle: "Compose counter, helper text, error in the parent",
        codeDescription:
          "The primitive ships no counter. The native `input` event bubbles from the inner <textarea>, so the counter listens on the element.",
        code: `<label>
  <span>Bio</span>
  <zen-textarea rows="3" max-length="120" placeholder="A short bio…"></zen-textarea>
  <span class="count">0 / 120</span>
</label>
<script>
  bio.addEventListener("input", () =>
    count.textContent = bio.querySelector("textarea").value.length + " / 120");
</script>`,
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

          const bio = el("zen-textarea", {
            rows: 3,
            "max-length": 120,
            placeholder: "A short bio…",
          });
          bio.style.display = "block";
          bio.addEventListener("input", () => {
            const ta = bio.querySelector("textarea");
            count.textContent = `${ta ? ta.value.length : 0} / 120`;
          });

          label.append(title, bio, count);
          return label;
        },
      },
      {
        title: "3. Disabled / readOnly",
        codeTitle: "Standard HTML attributes",
        code: `<zen-textarea disabled default-value="Disabled"></zen-textarea>
<zen-textarea read-only default-value="Read-only"></zen-textarea>`,
        render: () => {
          const grid = document.createElement("div");
          grid.style.display = "grid";
          grid.style.gap = "10px";
          grid.style.width = "100%";
          grid.style.maxWidth = "480px";
          grid.append(
            el("zen-textarea", { rows: 2, disabled: true, "default-value": "Disabled" }),
            el("zen-textarea", { rows: 2, "read-only": true, "default-value": "Read-only" }),
          );
          return grid;
        },
      },
    ],
  });
}
