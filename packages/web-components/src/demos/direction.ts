import { DemoPage } from "./demo-helpers";

/**
 * DirectionProvider demo — the web-components port. <zen-direction-provider>
 * carries `dir` for its subtree; there is no primitive library to inform, so
 * that attribute is the whole mechanism, and it is what `directionOf()` reads.
 */

function el(tag: string, attrs: Record<string, string> = {}, ...kids: Node[]): HTMLElement {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  e.append(...kids);
  return e;
}

function slide(label: string): HTMLElement {
  const d = el("div");
  d.className = "zen-bg-zen-muted zen-text-zen-foreground";
  d.style.display = "grid";
  d.style.placeItems = "center";
  d.style.minHeight = "96px";
  d.style.borderRadius = "8px";
  const s = el("span");
  s.className = "zen-text-2xl";
  s.textContent = label;
  d.append(s);
  return d;
}

const slides = () =>
  el("zen-carousel", { label: "Example carousel" }, ...["١", "٢", "٣", "٤"].map(slide));

/** One labelled panel: a carousel and a rating, in whichever direction. */
function panel(caption: string): HTMLElement {
  const note = el("p");
  note.className = "zen-mb-2 zen-mt-0 zen-text-xs zen-font-medium zen-text-zen-muted-fg";
  note.textContent = caption;

  const ratingWrap = el("div");
  ratingWrap.className = "zen-mt-3";
  ratingWrap.append(el("zen-rating", { "default-value": "3", label: "Example rating" }));

  const content = el("zen-card-content", {}, note, slides(), ratingWrap);
  content.className = "zen-p-4";
  return el("zen-card", {}, content);
}

export default function DirectionDemo(): HTMLElement {
  return DemoPage({
    title: "DirectionProvider",
    description:
      "CSS mirrors a right-to-left page on its own. What it cannot reach is the JavaScript deciding what the Left and Right arrow keys MEAN. This binding has no headless primitive library, so <zen-direction-provider> sets dir on a real element — which CSS, the BiDi algorithm and zen-ui's own components all already honour.",
    sections: [
      {
        title: "1. Render it once, near the root",
        codeTitle: "With no dir it follows the document",
        codeDescription:
          "Omit dir and it uses the document's own. Set dir to state it outright, which is what a subtree in the other direction needs. The wrapper is display: contents, so it adds no box to your layout.",
        code: `<zen-direction-provider>
  <!-- your app -->
</zen-direction-provider>

<!-- or, for a subtree that disagrees with the page: -->
<zen-direction-provider dir="rtl">…</zen-direction-provider>`,
        render: () => {
          const p = el("p");
          p.className = "zen-m-0 zen-text-sm zen-text-zen-muted-fg";
          p.textContent =
            "Most apps set dir on <html> and never need this. Reach for it to flip a subtree against the document — exactly the case a document-level attribute cannot express.";
          return [p];
        },
      },
      {
        title: "2. The same components, both directions",
        codeTitle: "Next is to the left in RTL",
        codeDescription:
          "Focus a carousel and press the arrow keys. On the left it advances with ArrowRight; on the right it advances with ArrowLeft, because that is what 'next' means when the page reads right-to-left. Neither element asks you for a direction — they resolve it from where they sit in the page, so an RTL panel inside an LTR page is correct with no configuration.",
        code: `<!-- Nothing direction-specific in the markup: -->
<zen-carousel label="Example carousel">…</zen-carousel>
<zen-rating default-value="3" label="Example rating"></zen-rating>`,
        render: () => {
          const grid = el("div");
          grid.className = "zen-grid zen-grid-cols-1 zen-gap-4 md:zen-grid-cols-2";
          grid.append(
            panel("ltr — ArrowRight advances"),
            el("zen-direction-provider", { dir: "rtl" }, panel("rtl — ArrowLeft advances")),
          );
          return [grid];
        },
      },
      {
        title: "3. What reads what",
        codeTitle: "One mechanism here, two in React and Solid",
        codeDescription:
          "zen-ui's own components work direction out from the DOM via directionOf(), so they need no provider and cannot go stale. React and Solid additionally have to inform Radix and Kobalte, which keep direction in a JS context CSS cannot reach; this binding has no such library, so setting dir IS the whole mechanism. The TimePicker is the deliberate exception everywhere: clock notation is left-to-right in every locale, so its segments stay in order while the page mirrors.",
        code: `import { arrowStep } from "@algorisys/zen-ui-core";

// -1 back, +1 forward, 0 not a horizontal arrow
const step = arrowStep(e.key, e.currentTarget);`,
        render: () => {
          const p = el("p");
          p.className = "zen-m-0 zen-text-sm zen-text-zen-muted-fg";
          p.textContent =
            "If you only ever set dir on <html>, you never have to think about this split — it is here so the behaviour is explainable, not so you have to manage it.";
          return [p];
        },
      },
    ],
  });
}
