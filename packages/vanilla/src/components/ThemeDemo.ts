import { Theme } from "./theme/theme";
import { Card, CardContent, CardHeader, CardTitle } from "./card/card";
import { Button } from "./button/button";
import { Badge } from "./badge/badge";
import { DemoPage } from "./demo-helpers";

/** A column of gapped children. */
function column(padded: boolean, ...kids: Node[]): HTMLElement {
  const d = document.createElement("div");
  d.style.display = "flex";
  d.style.flexDirection = "column";
  d.style.gap = "0.75rem";
  if (padded) {
    d.className = "zen-bg-zen-background";
    d.style.padding = "1rem";
    d.style.borderRadius = "0.5rem";
  }
  d.append(...kids);
  return d;
}

/** `columns` null = the responsive 1-up/3-up used on the Welcome page. */
function grid(columns: string | null, ...kids: Node[]): HTMLElement {
  const d = document.createElement("div");
  if (columns === null) {
    d.className = "zen-grid zen-grid-cols-1 zen-gap-4 sm:zen-grid-cols-3";
    return (d.append(...kids), d);
  }
  d.style.display = "grid";
  d.style.gap = "1rem";
  d.style.gridTemplateColumns = columns;
  d.append(...kids);
  return d;
}

/** One themed sample card — the thing whose tokens visibly change. */
function sample(label: string): HTMLElement {
  const note = document.createElement("p");
  note.className = "zen-m-0 zen-text-sm zen-text-zen-muted-fg";
  note.textContent = "Body copy, a border and a muted line — all read from the tokens in scope.";

  const actions = document.createElement("div");
  actions.style.display = "flex";
  actions.style.gap = "0.5rem";
  actions.style.alignItems = "center";
  actions.append(Button({ size: "sm", children: "Primary" }).el, Badge({ children: "Badge" }).el);

  return Card({
    children: [
      CardHeader({ children: CardTitle({ children: label }) }),
      CardContent({ children: [note, actions] }),
    ],
  }).el;
}

export default function ThemeDemo(): HTMLElement {
  return DemoPage({
    title: "Theme",
    description:
      "Themes used to be all-or-nothing: applyTheme() sets data-theme on <html> and the whole document moves. Theme() narrows that to one subtree, so a dark panel can sit inside a light page.",
    sections: [
      {
        title: "1. A theme for part of the page",
        codeTitle: "Three palettes, one document",
        codeDescription:
          "Each panel below sets its own theme. Nothing else on the page changes, and no JavaScript runs — tokens.css declares each theme as an unanchored [data-theme] block, and CSS custom properties inherit down the tree.",
        code: `Theme({ name: "dark", children: Card({ children: … }) });`,
        render: () => [
          grid(
            null,
            sample("Inherited"),
            Theme({ name: "dark", children: sample("dark") }).el,
            Theme({ name: "zen-theme", children: sample("zen-theme") }).el,
          ),
        ],
      },
      {
        title: "2. Nesting",
        codeTitle: "The nearest themed ancestor wins",
        codeDescription:
          "Themes nest without any bookkeeping — no level counting, no provider depth. A themed element inside another themed element simply rebinds the tokens for its own subtree, because that is how CSS custom properties already work.",
        code: `Theme({
  name: "dark",
  children: [
    Card({ … }),
    Theme({ name: "zen-theme", children: Card({ … }) }),  // zen-theme, not dark
  ],
});`,
        render: () => [
          Theme({
            name: "dark",
            children: column(
              true,
              sample("dark"),
              Theme({ name: "zen-theme", children: sample("zen-theme, inside dark") }).el,
            ),
          }).el,
        ],
      },
      {
        title: "3. transparent — when the wrapper must not be a box",
        codeTitle: "display: contents, for grid and flex children",
        codeDescription:
          "Theme renders a div, and a div in the middle of a grid or flex container becomes a layout box that swallows the children's participation in it. transparent renders the wrapper as display: contents so the children lay out as if it were not there. It is off by default because display: contents removes the element from the layout tree, which also drops any border or background set on it.",
        code: `// without transparent, both cards land in ONE grid cell
Theme({ name: "dark", transparent: true, children: [Card({ … }), Card({ … })] });`,
        render: () => [
          grid(
            "1fr 1fr",
            Theme({
              name: "dark",
              transparent: true,
              children: [sample("grid child 1"), sample("grid child 2")],
            }).el,
          ),
        ],
      },
      {
        title: "4. What it does not do yet",
        codeTitle: "Content appended to <body> keeps the document theme",
        codeDescription:
          "Dialogs, popovers, tooltips and sheets append their content to <body> — which is outside the themed element, so they fall back to the document theme. This is a known limitation rather than a bug in your code; the fix is tracked as Phase 2.",
        code: `Theme({ name: "dark", children: Dialog({ … }) });  // the OVERLAY is not dark`,
        render: () => {
          const note = document.createElement("p");
          note.className = "zen-m-0 zen-text-sm zen-text-zen-muted-fg";
          note.textContent =
            "This panel is dark. Anything it appends to <body> — a dialog, a popover, a tooltip — is not.";
          return [Theme({ name: "dark", children: column(true, note) }).el];
        },
      },
    ],
  });
}
