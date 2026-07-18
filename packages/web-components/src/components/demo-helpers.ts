import "./demo-helpers.css";

/**
 * DemoPage / DemoSection / CodeExample — the vanilla equivalents of the other
 * bindings' demo chrome. demo-helpers.css is copied verbatim from the React demo
 * so all three render identically.
 *
 * Demo chrome deliberately uses UNPREFIXED classes (`demo-page`, `example`): they
 * are the demo app's own styles, not library output, and they have nothing to
 * collide with.
 */

export interface SectionSpec {
  title: string;
  description?: string;
  /** The snippet that produced `render()`. */
  code?: string;
  codeTitle?: string;
  codeDescription?: string;
  /** Builds the live preview. Called once. */
  render: () => Node | Node[];
}

const nodes = (v: Node | Node[]) => (Array.isArray(v) ? v : [v]);

function codeExample(spec: SectionSpec): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "example";

  const head = document.createElement("div");
  head.className = "example-head";
  const meta = document.createElement("div");
  const h3 = document.createElement("h3");
  h3.textContent = spec.codeTitle ?? spec.title;
  meta.append(h3);
  if (spec.codeDescription) {
    const p = document.createElement("p");
    p.textContent = spec.codeDescription;
    meta.append(p);
  }
  const copy = document.createElement("button");
  copy.type = "button";
  copy.className = "example-copy";
  copy.textContent = "Copy Code";
  copy.addEventListener("click", () => {
    navigator.clipboard
      .writeText(spec.code ?? "")
      .then(() => {
        copy.textContent = "✓ Copied";
        copy.classList.add("copied");
        setTimeout(() => {
          copy.textContent = "Copy Code";
          copy.classList.remove("copied");
        }, 1500);
      })
      .catch(() => {});
  });
  head.append(meta, copy);

  const preview = document.createElement("div");
  preview.className = "example-preview";
  preview.append(...nodes(spec.render()));

  const pre = document.createElement("pre");
  pre.className = "example-code";
  const code = document.createElement("code");
  // textContent, not innerHTML: the snippet is full of angle brackets and would
  // otherwise be parsed as the markup it is describing.
  code.textContent = spec.code ?? "";
  pre.append(code);

  wrap.append(head, preview, pre);
  return wrap;
}

export function DemoPage(spec: {
  title: string;
  description?: string;
  sections: SectionSpec[];
}): HTMLElement {
  const page = document.createElement("div");
  page.className = "demo-page";

  const h1 = document.createElement("h1");
  h1.textContent = spec.title;
  page.append(h1);

  if (spec.description) {
    const lede = document.createElement("p");
    lede.className = "lede";
    lede.textContent = spec.description;
    page.append(lede);
  }

  for (const s of spec.sections) {
    const section = document.createElement("section");
    section.className = "demo-section";
    const h2 = document.createElement("h2");
    h2.textContent = s.title;
    section.append(h2);

    if (s.description) {
      const d = document.createElement("p");
      d.style.fontSize = "0.875rem";
      d.style.color = "var(--zen-color-muted-fg)";
      d.style.margin = "0 0 0.75rem";
      d.textContent = s.description;
      section.append(d);
    }

    if (s.code) {
      section.append(codeExample(s));
    } else {
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.flexWrap = "wrap";
      row.style.gap = "0.5rem";
      row.style.alignItems = "center";
      row.append(...nodes(s.render()));
      section.append(row);
    }
    page.append(section);
  }

  return page;
}
