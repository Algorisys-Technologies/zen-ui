import { DirectionProvider } from "./direction/direction";
import { Carousel } from "./carousel/carousel";
import { Rating } from "./survey/rating";
import { Card, CardContent } from "./card/card";
import { DemoPage } from "./demo-helpers";

function slide(label: string): HTMLElement {
  const d = document.createElement("div");
  d.className = "zen-bg-zen-muted zen-text-zen-foreground";
  d.style.display = "grid";
  d.style.placeItems = "center";
  d.style.minHeight = "96px";
  d.style.borderRadius = "8px";
  const s = document.createElement("span");
  s.className = "zen-text-2xl";
  s.textContent = label;
  d.append(s);
  return d;
}

const slides = () =>
  Carousel({ label: "Example carousel", children: ["١", "٢", "٣", "٤"].map(slide) }).el;

/** One labelled panel: a carousel and a rating, in whichever direction. */
function panel(caption: string): HTMLElement {
  const note = document.createElement("p");
  note.className = "zen-mb-2 zen-mt-0 zen-text-xs zen-font-medium zen-text-zen-muted-fg";
  note.textContent = caption;

  const ratingWrap = document.createElement("div");
  ratingWrap.className = "zen-mt-3";
  ratingWrap.append(Rating({ defaultValue: 3, label: "Example rating" }).el);

  return Card({
    children: CardContent({ class: "zen-p-4", children: [note, slides(), ratingWrap] }),
  }).el;
}

/**
 * A panel that reads right-to-left, whatever the page around it does. `dir` on
 * the element is the whole mechanism in this binding — there is no primitive
 * library to inform — and it is what `directionOf()` reads.
 */
const rtlPanel = (caption: string) =>
  DirectionProvider({ dir: "rtl", children: panel(caption) }).el;

export default function DirectionDemo(): HTMLElement {
  return DemoPage({
    title: "DirectionProvider",
    description:
      "CSS mirrors a right-to-left page on its own. What it cannot reach is the JavaScript deciding what the Left and Right arrow keys MEAN. This binding has no headless primitive library, so DirectionProvider sets dir on a real element — which CSS, the BiDi algorithm and zen-ui's own components all already honour.",
    sections: [
      {
        title: "1. Render it once, near the root",
        codeTitle: "With no props it follows the document",
        codeDescription:
          "Omit dir and it uses the document's own. Pass dir to state it outright, which is what a subtree in the other direction needs. The wrapper is display: contents, so it adds no box to your layout.",
        code: `import { DirectionProvider } from "@algorisys/zen-ui-vanilla";

DirectionProvider({ children: app });

// or, for a subtree that disagrees with the page:
DirectionProvider({ dir: "rtl", children: panel });`,
        render: () => {
          const p = document.createElement("p");
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
          "Focus a carousel and press the arrow keys. On the left it advances with ArrowRight; on the right it advances with ArrowLeft, because that is what 'next' means when the page reads right-to-left. Neither component asks you for a direction — they resolve it from where they sit in the page, so an RTL panel inside an LTR page is correct with no configuration.",
        code: `// Nothing direction-specific in the markup:
Carousel({ label: "Example carousel", children: slides });
Rating({ defaultValue: 3, label: "Example rating" });`,
        render: () => {
          const grid = document.createElement("div");
          grid.className = "zen-grid zen-grid-cols-1 zen-gap-4 md:zen-grid-cols-2";
          grid.append(panel("ltr — ArrowRight advances"), rtlPanel("rtl — ArrowLeft advances"));
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
          const p = document.createElement("p");
          p.className = "zen-m-0 zen-text-sm zen-text-zen-muted-fg";
          p.textContent =
            "If you only ever set dir on <html>, you never have to think about this split — it is here so the behaviour is explainable, not so you have to manage it.";
          return [p];
        },
      },
    ],
  });
}
