import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateActions,
} from "./empty-state/empty-state";
import { Button } from "./button/button";
import { DemoPage } from "./demo-helpers";

/**
 * Trusted, in-repo SVG markup — never a caller's string (see PORTING.md). The
 * HTML template parser resolves `<svg>` into the SVG namespace, so the returned
 * node is a real SVGElement.
 */
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
        code: `EmptyState({
  children: [
    EmptyStateIcon({ children: InboxIcon() }).el,
    EmptyStateTitle({ children: "No invoices yet" }).el,
    EmptyStateDescription({
      children:
        "Create your first invoice to start tracking revenue. We'll save drafts as you go.",
    }).el,
    EmptyStateActions({
      children: [
        Button({ iconLeft: PlusIcon(), children: "New invoice" }).el,
        Button({ variant: "outline", color: "neutral", children: "Import from CSV" }).el,
      ],
    }).el,
  ],
})`,
        render: () =>
          fullWidth(
            EmptyState({
              children: [
                EmptyStateIcon({ children: InboxIcon() }).el,
                EmptyStateTitle({ children: "No invoices yet" }).el,
                EmptyStateDescription({
                  children:
                    "Create your first invoice to start tracking revenue. We'll save drafts as you go.",
                }).el,
                EmptyStateActions({
                  children: [
                    Button({ iconLeft: PlusIcon(), children: "New invoice" }).el,
                    Button({
                      variant: "outline",
                      color: "neutral",
                      children: "Import from CSV",
                    }).el,
                  ],
                }).el,
              ],
            }).el,
          ),
      },
      {
        title: "2. No-results state",
        codeTitle: "Different copy for empty-filter vs empty-data",
        codeDescription:
          'The "no results" pattern is distinct from first-run — it suggests adjusting the query, not creating data. Same primitive, different content.',
        description:
          'The "no results" pattern is distinct from first-run — it suggests adjusting the query, not creating data. Same primitive, different content.',
        code: `EmptyState({
  children: [
    EmptyStateIcon({ children: SearchIcon() }).el,
    EmptyStateTitle({ children: 'No matches for "acme"' }).el,
    EmptyStateDescription({
      children: "Try a shorter search term or clear the active filters.",
    }).el,
    EmptyStateActions({
      children: Button({ variant: "outline", color: "neutral", children: "Clear filters" }).el,
    }).el,
  ],
})`,
        render: () =>
          fullWidth(
            EmptyState({
              children: [
                EmptyStateIcon({ children: SearchIcon() }).el,
                EmptyStateTitle({ children: 'No matches for "acme"' }).el,
                EmptyStateDescription({
                  children: "Try a shorter search term or clear the active filters.",
                }).el,
                EmptyStateActions({
                  children: Button({
                    variant: "outline",
                    color: "neutral",
                    children: "Clear filters",
                  }).el,
                }).el,
              ],
            }).el,
          ),
      },
      {
        title: "3. Sizes",
        codeTitle: 'size="sm" | "md" | "lg"',
        codeDescription:
          "sm fits inline (table body, dropdown). lg suits a full-page first-run screen with extra breathing room.",
        description:
          "sm fits inline (table body, dropdown). lg suits a full-page first-run screen with extra breathing room.",
        code: `EmptyState({ size: "sm", children: [ /* … */ ] });
EmptyState({ size: "md", children: [ /* … */ ] });  // default
EmptyState({ size: "lg", children: [ /* … */ ] });`,
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
              EmptyState({
                size,
                children: [
                  EmptyStateIcon({ children: InboxIcon() }).el,
                  EmptyStateTitle({ children: `size="${size}"` }).el,
                  EmptyStateDescription({
                    children: "Padding and gap scale with the size variant.",
                  }).el,
                ],
              }).el,
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
        code: `EmptyState({
  bordered: true,
  children: [
    EmptyStateIcon({ children: InboxIcon() }).el,
    EmptyStateTitle({ children: "Drop files here" }).el,
    EmptyStateDescription({ children: "or click to browse" }).el,
  ],
})`,
        render: () =>
          fullWidth(
            EmptyState({
              bordered: true,
              children: [
                EmptyStateIcon({ children: InboxIcon() }).el,
                EmptyStateTitle({ children: "Drop files here" }).el,
                EmptyStateDescription({ children: "or click to browse" }).el,
              ],
            }).el,
          ),
      },
      {
        title: "5. Inline (no icon, no actions)",
        codeTitle: "Just title + description — fits inside a table body or list",
        codeDescription:
          "Skip EmptyStateIcon / EmptyStateActions for the lightest variant. Common inside DataTable when filters return zero rows but the action lives at the toolbar level.",
        description:
          "Skip EmptyStateIcon / EmptyStateActions for the lightest variant. Common inside DataTable when filters return zero rows but the action lives at the toolbar level.",
        code: `EmptyState({
  size: "sm",
  children: EmptyStateTitle({ children: "No rows match the current filters" }).el,
})`,
        render: () =>
          fullWidth(
            EmptyState({
              size: "sm",
              children: EmptyStateTitle({
                children: "No rows match the current filters",
              }).el,
            }).el,
          ),
      },
    ],
  });
}
