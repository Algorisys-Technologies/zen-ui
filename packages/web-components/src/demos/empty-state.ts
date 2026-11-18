import { DemoPage } from "./demo-helpers";

/**
 * Empty State demo — the web-components mirror of the vanilla version. The compound
 * API becomes nested custom elements: <zen-empty-state> holds <zen-empty-state-icon>,
 * <zen-empty-state-title>, <zen-empty-state-description>, <zen-empty-state-actions>
 * as light-DOM children.
 */

/** Trusted, in-repo SVG markup — never a caller's string. */
const svg = (markup: string): Node => {
  const t = document.createElement("template");
  t.innerHTML = markup;
  return t.content.firstChild!;
};

const InboxIcon = () =>
  svg(
    `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>`,
  );

const SearchIcon = () =>
  svg(
    `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  );

const PlusIcon = () =>
  svg(
    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  );

function el(tag: string, attrs: Record<string, string> = {}): HTMLElement {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  return n;
}

/** A compound sub-part with slotted children (nodes or a text string). */
const part = (tag: string, children: Node | string | (Node | string)[]): HTMLElement => {
  const n = document.createElement(tag);
  n.append(...(Array.isArray(children) ? children : [children]));
  return n;
};

const icon = (node: Node) => part("zen-empty-state-icon", node);
const title = (text: string) => part("zen-empty-state-title", text);
const description = (text: string) => part("zen-empty-state-description", text);
const actions = (...nodes: Node[]) => part("zen-empty-state-actions", nodes);

const button = (text: string, attrs: Record<string, string> = {}, iconLeft?: Node): HTMLElement => {
  const b = el("zen-button", attrs);
  if (iconLeft) (b as unknown as { iconLeft: Node }).iconLeft = iconLeft;
  b.append(document.createTextNode(text));
  return b;
};

const emptyState = (attrs: Record<string, string>, ...children: Node[]): HTMLElement => {
  const es = el("zen-empty-state", attrs);
  es.append(...children);
  return es;
};

const fullWidth = (child: Node): HTMLElement => {
  const wrap = document.createElement("div");
  wrap.style.width = "100%";
  wrap.append(child);
  return wrap;
};

export default function EmptyStateDemo(): HTMLElement {
  return DemoPage({
    title: "Empty State",
    description:
      "First-run / no-data surface for any list, table, or dashboard. Compound API: icon → title → description → actions. The onboarding equivalent of a blank canvas — the prompt that nudges the user to take their first action.",
    sections: [
      {
        title: "1. Default — first-run prompt",
        codeTitle: "Icon + title + description + primary action",
        code: `<zen-empty-state>
  <zen-empty-state-icon><!-- InboxIcon --></zen-empty-state-icon>
  <zen-empty-state-title>No invoices yet</zen-empty-state-title>
  <zen-empty-state-description>
    Create your first invoice to start tracking revenue. We'll save drafts as you go.
  </zen-empty-state-description>
  <zen-empty-state-actions>
    <zen-button>New invoice</zen-button>
    <zen-button variant="outline" color="neutral">Import from CSV</zen-button>
  </zen-empty-state-actions>
</zen-empty-state>`,
        render: () =>
          fullWidth(
            emptyState(
              {},
              icon(InboxIcon()),
              title("No invoices yet"),
              description(
                "Create your first invoice to start tracking revenue. We'll save drafts as you go.",
              ),
              actions(
                button("New invoice", {}, PlusIcon()),
                button("Import from CSV", { variant: "outline", color: "neutral" }),
              ),
            ),
          ),
      },
      {
        title: "2. No-results state",
        codeTitle: "Different copy for empty-filter vs empty-data",
        codeDescription:
          'The "no results" pattern is distinct from first-run — it suggests adjusting the query, not creating data. Same primitive, different content.',
        description:
          'The "no results" pattern is distinct from first-run — it suggests adjusting the query, not creating data. Same primitive, different content.',
        code: `<zen-empty-state>
  <zen-empty-state-icon><!-- SearchIcon --></zen-empty-state-icon>
  <zen-empty-state-title>No matches for "acme"</zen-empty-state-title>
  <zen-empty-state-description>Try a shorter search term or clear the active filters.</zen-empty-state-description>
  <zen-empty-state-actions>
    <zen-button variant="outline" color="neutral">Clear filters</zen-button>
  </zen-empty-state-actions>
</zen-empty-state>`,
        render: () =>
          fullWidth(
            emptyState(
              {},
              icon(SearchIcon()),
              title('No matches for "acme"'),
              description("Try a shorter search term or clear the active filters."),
              actions(button("Clear filters", { variant: "outline", color: "neutral" })),
            ),
          ),
      },
      {
        title: "3. Sizes",
        codeTitle: 'size="sm" | "md" | "lg"',
        codeDescription:
          "sm fits inline (table body, dropdown). lg suits a full-page first-run screen with extra breathing room.",
        description:
          "sm fits inline (table body, dropdown). lg suits a full-page first-run screen with extra breathing room.",
        code: `<zen-empty-state size="sm"> … </zen-empty-state>
<zen-empty-state size="md"> … </zen-empty-state>  <!-- default -->
<zen-empty-state size="lg"> … </zen-empty-state>`,
        render: () => {
          const grid = document.createElement("div");
          grid.style.width = "100%";
          grid.style.display = "grid";
          grid.style.gap = "12px";
          for (const size of ["sm", "md", "lg"] as const) {
            const box = document.createElement("div");
            box.style.border = "1px solid var(--zen-color-border)";
            box.style.borderRadius = "6px";
            box.append(
              emptyState(
                { size },
                icon(InboxIcon()),
                title(`size="${size}"`),
                description("Padding and gap scale with the size variant."),
              ),
            );
            grid.append(box);
          }
          return grid;
        },
      },
      {
        title: "4. Bordered (drop-zone / placeholder)",
        codeTitle: "Dashed border + muted surface",
        codeDescription:
          "The bordered variant communicates 'this region is empty on purpose' — drop-zones, placeholder columns on a kanban, empty Kanban swimlanes.",
        description:
          "The bordered variant communicates 'this region is empty on purpose' — drop-zones, placeholder columns on a kanban, empty Kanban swimlanes.",
        code: `<zen-empty-state bordered>
  <zen-empty-state-icon><!-- InboxIcon --></zen-empty-state-icon>
  <zen-empty-state-title>Drop files here</zen-empty-state-title>
  <zen-empty-state-description>or click to browse</zen-empty-state-description>
</zen-empty-state>`,
        render: () =>
          fullWidth(
            emptyState(
              { bordered: "" },
              icon(InboxIcon()),
              title("Drop files here"),
              description("or click to browse"),
            ),
          ),
      },
      {
        title: "5. Inline (no icon, no actions)",
        codeTitle: "Just title + description — fits inside a table body or list",
        codeDescription:
          "Skip zen-empty-state-icon / zen-empty-state-actions for the lightest variant. Common inside DataTable when filters return zero rows but the action lives at the toolbar level.",
        description:
          "Skip zen-empty-state-icon / zen-empty-state-actions for the lightest variant. Common inside DataTable when filters return zero rows but the action lives at the toolbar level.",
        code: `<zen-empty-state size="sm">
  <zen-empty-state-title>No rows match the current filters</zen-empty-state-title>
</zen-empty-state>`,
        render: () =>
          fullWidth(emptyState({ size: "sm" }, title("No rows match the current filters"))),
      },
    ],
  });
}
