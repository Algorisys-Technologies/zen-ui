import { DemoPage } from "./demo-helpers";

/**
 * Theme demo — the web-components port. <zen-theme name="dark"> scopes a theme
 * to its own subtree. The mechanism is pure CSS, so the custom element is doing
 * nothing more than putting data-theme on an element for you.
 */

function el(tag: string, attrs: Record<string, string> = {}, ...kids: Node[]): HTMLElement {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  e.append(...kids);
  return e;
}

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
  const note = el("p");
  note.className = "zen-m-0 zen-text-sm zen-text-zen-muted-fg";
  note.textContent = "Body copy, a border and a muted line — all read from the tokens in scope.";

  const actions = el("div");
  actions.style.display = "flex";
  actions.style.gap = "0.5rem";
  actions.style.alignItems = "center";
  const button = el("zen-button", { size: "sm" });
  button.textContent = "Primary";
  const badge = el("zen-badge");
  badge.textContent = "Badge";
  actions.append(button, badge);

  const title = el("zen-card-title");
  title.textContent = label;

  return el(
    "zen-card",
    {},
    el("zen-card-header", {}, title),
    el("zen-card-content", {}, note, actions),
  );
}

/** Comfortable or compact: an input, a default button and a card. */
function densitySample(label: string): HTMLElement {
  const title = el("p");
  title.className = "zen-m-0 zen-text-sm zen-font-semibold";
  title.textContent = label;
  const save = el("zen-button");
  save.textContent = "Save";
  const row = el("div", {}, el("zen-input", { placeholder: "Customer" }), save);
  row.style.display = "flex";
  row.style.gap = "0.5rem";
  return column(false, title, row, sample("A card"));
}

export default function ThemeDemo(): HTMLElement {
  return DemoPage({
    title: "Theme",
    description:
      "Themes used to be all-or-nothing: setting data-theme on <html> moved the whole document. <zen-theme> narrows that to one subtree, so a dark panel can sit inside a light page.",
    sections: [
      {
        title: "1. A theme for part of the page",
        codeTitle: "Three palettes, one document",
        codeDescription:
          "Each panel below sets its own theme. Nothing else on the page changes, and no JavaScript runs — tokens.css declares each theme as an unanchored [data-theme] block, and CSS custom properties inherit down the tree.",
        code: `<zen-theme name="dark">
  <zen-card>…</zen-card>
</zen-theme>`,
        render: () => [
          grid(
            null,
            sample("Inherited"),
            el("zen-theme", { name: "dark" }, sample("dark")),
            el("zen-theme", { name: "zen-theme" }, sample("zen-theme")),
          ),
        ],
      },
      {
        title: "2. Nesting",
        codeTitle: "The nearest themed ancestor wins",
        codeDescription:
          "Themes nest without any bookkeeping — no level counting, no provider depth. A themed element inside another themed element simply rebinds the tokens for its own subtree, because that is how CSS custom properties already work.",
        code: `<zen-theme name="dark">
  <zen-card>…</zen-card>

  <zen-theme name="zen-theme">
    <zen-card>…</zen-card>   <!-- zen-theme, not dark -->
  </zen-theme>
</zen-theme>`,
        render: () => [
          el(
            "zen-theme",
            { name: "dark" },
            column(
              true,
              sample("dark"),
              el("zen-theme", { name: "zen-theme" }, sample("zen-theme, inside dark")),
            ),
          ),
        ],
      },
      {
        title: "3. transparent — when the wrapper must not be a box",
        codeTitle: "display: contents, for grid and flex children",
        codeDescription:
          "The element renders a div, and a div in the middle of a grid or flex container becomes a layout box that swallows the children's participation in it. transparent renders the wrapper as display: contents so the children lay out as if it were not there. It is off by default because display: contents removes the element from the layout tree, which also drops any border or background set on it.",
        code: `<!-- without transparent, both cards land in ONE grid cell -->
<zen-theme name="dark" transparent>
  <zen-card>…</zen-card>
  <zen-card>…</zen-card>
</zen-theme>`,
        render: () => [
          grid(
            "1fr 1fr",
            el(
              "zen-theme",
              { name: "dark", transparent: "" },
              sample("grid child 1"),
              sample("grid child 2"),
            ),
          ),
        ],
      },
      {
        title: "4. What it does not do yet",
        codeTitle: "Content appended to <body> keeps the document theme",
        codeDescription:
          "Dialogs, popovers, tooltips and sheets append their content to <body> — which is outside the themed element, so they fall back to the document theme. This is a known limitation rather than a bug in your code; the fix is tracked as Phase 2.",
        code: `<zen-theme name="dark">
  <zen-dialog>…</zen-dialog>   <!-- the OVERLAY is not dark -->
</zen-theme>`,
        render: () => {
          const note = el("p");
          note.className = "zen-m-0 zen-text-sm zen-text-zen-muted-fg";
          note.textContent =
            "This panel is dark. Anything it appends to <body> — a dialog, a popover, a tooltip — is not.";
          return [el("zen-theme", { name: "dark" }, column(true, note))];
        },
      },
      {
        title: "5. Density",
        codeTitle: "Comfortable, or compact for people working all day",
        codeDescription: `Comfortable is the default and is the size every component always had. Set data-density="compact" on any element (usually <html>) and what is inside tightens: inputs, selects and md buttons drop from 40px to 32px, table rows, menu items, cards and object-page sections lose padding. Type does not shrink. Like a theme it is a block of custom properties (tokens.css, "Density"), so it scopes to a subtree and needs no JavaScript; menus and popovers portalled to <body> follow the density on <html>.`,
        code: `<html data-density="compact">  <!-- or any element: a compact panel -->`,
        render: () => {
          const g = grid("1fr 1fr", densitySample("comfortable"), el("div", { "data-density": "compact" }, densitySample("compact")));
          g.style.gap = "1.5rem";
          return [g];
        },
      },
      {
        title: "6. Touch density",
        codeTitle: "48px targets for shop-floor tablets and gloved hands",
        codeDescription: `data-density="touch" takes inputs, selects, md buttons, table rows and menu items to 48px. Type does not grow. Checkbox, radio, switch and the sm / xs buttons keep their fixed sizes: on a touch screen, wrap them in a label so the label is the target, or use md.`,
        code: `<html data-density="touch">  <!-- or just the operator panel -->`,
        render: () => {
          const g = el("div", {}, densitySample("comfortable"), el("div", { "data-density": "touch" }, densitySample("touch")));
          g.className = "zen-grid zen-grid-cols-1 zen-gap-6 sm:zen-grid-cols-2";
          return [g];
        },
      },
    ],
  });
}
