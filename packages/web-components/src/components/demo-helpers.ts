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

/** One nav group as the catalogue renders it. Kept structural so both the
 *  vanilla and web-components demos can share the shape without sharing a file. */
type CatalogueGroup = {
  title: string;
  items: { to: string; label: string; description?: string }[];
  catalogue?: boolean;
};

const previewSlug = (route: string) =>
  route === "/" ? "_welcome" : route.replace(/^\//, "").replace(/\//g, "-");

/**
 * The component catalogue: every entry in nav.ts as a card with a generated
 * thumbnail. Rendered from the SAME list the sidebar uses so the two cannot
 * drift — the React landing page once kept its own copy and fell 16 components
 * behind.
 *
 * The thumbnails come from `bun run gen:previews` and are gitignored, so a
 * fresh clone has none until it runs that (or deploys, which regenerates them).
 * On a missing file the <img> removes itself and the card is exactly the text
 * card it used to be: a broken-image glyph in an 83-card grid would be far
 * worse than no picture.
 */
export function catalogue(nav: CatalogueGroup[]): HTMLElement {
  const groups = nav.filter((g) => g.catalogue !== false);
  const total = groups.reduce((n, g) => n + g.items.length, 0);

  const section = document.createElement("section");
  section.className = "demo-section";

  const h2 = document.createElement("h2");
  h2.textContent = `Components (${total})`;
  section.append(h2);

  for (const group of groups) {
    const heading = document.createElement("h3");
    heading.className = "zen-mb-3 zen-mt-6 zen-text-sm zen-font-semibold zen-text-zen-foreground";
    heading.textContent = group.title;
    const count = document.createElement("span");
    count.className = "zen-ms-2 zen-font-normal zen-text-zen-muted-fg";
    count.textContent = String(group.items.length);
    heading.append(count);
    section.append(heading);

    const grid = document.createElement("div");
    grid.className = "zen-grid zen-grid-cols-1 zen-gap-3 sm:zen-grid-cols-2 lg:zen-grid-cols-3";

    for (const item of group.items) {
      const card = document.createElement("a");
      card.href = `${import.meta.env.BASE_URL.replace(/\/$/, "")}${item.to}`;
      card.className =
        "zen-block zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-no-underline zen-transition-colors hover:zen-border-zen-primary focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring";

      const img = document.createElement("img");
      img.src = `${import.meta.env.BASE_URL}previews/${previewSlug(item.to)}.jpg`;
      img.alt = "";
      img.setAttribute("aria-hidden", "true");
      img.loading = "lazy";
      img.className =
        "zen-block zen-w-full zen-border-b zen-border-zen-border zen-bg-zen-background zen-object-cover zen-object-left-top";
      img.style.aspectRatio = "2 / 1";
      img.addEventListener("error", () => {
        img.style.display = "none";
      });

      const body = document.createElement("div");
      body.className = "zen-p-4";
      const label = document.createElement("div");
      label.className = "zen-text-sm zen-font-semibold zen-text-zen-foreground";
      label.textContent = item.label;
      const desc = document.createElement("p");
      desc.className = "zen-mb-0 zen-mt-1 zen-text-xs zen-leading-relaxed zen-text-zen-muted-fg";
      desc.textContent = item.description ?? "";
      body.append(label, desc);

      card.append(img, body);
      grid.append(card);
    }
    section.append(grid);
  }
  return section;
}
