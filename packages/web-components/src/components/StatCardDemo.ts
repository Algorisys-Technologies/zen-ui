import { DemoPage } from "./demo-helpers";

/**
 * StatCard demo — the web-components port. <zen-stat-card>'s `label`, `value`,
 * `icon`, `trend` and `onClick` are set as JS properties (Node / object / callback);
 * `color`, `href` and `loading` are attributes. `href` renders a link, `onClick` a
 * button — both real, focusable controls.
 */

interface Trend {
  value: string;
  direction: "up" | "down" | "flat";
}
interface CardSpec {
  label: string;
  value: string;
  color?: string;
  href?: string;
  loading?: boolean;
  iconName?: string;
  trend?: Trend;
  onClick?: () => void;
}

type CardEl = HTMLElement & { loading: boolean };

function icon(name: string): HTMLElement {
  const i = document.createElement("zen-icon");
  i.setAttribute("name", name);
  i.setAttribute("size", "22");
  return i;
}

function statCard(spec: CardSpec): CardEl {
  const c = document.createElement("zen-stat-card") as CardEl;
  if (spec.color) c.setAttribute("color", spec.color);
  if (spec.href) c.setAttribute("href", spec.href);
  if (spec.loading) c.setAttribute("loading", "");
  Object.assign(c, {
    label: spec.label,
    value: spec.value,
    ...(spec.iconName ? { icon: icon(spec.iconName) } : {}),
    ...(spec.trend ? { trend: spec.trend } : {}),
    ...(spec.onClick ? { onClick: spec.onClick } : {}),
  });
  return c;
}

const GRID = "display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));width:100%";

function grid(...cards: Node[]): HTMLElement {
  const g = document.createElement("div");
  g.setAttribute("style", GRID);
  g.append(...cards);
  return g;
}

function column(...children: Node[]): HTMLElement {
  const c = document.createElement("div");
  c.setAttribute("style", "display:flex;flex-direction:column;gap:12px;width:100%");
  c.append(...children);
  return c;
}

export default function StatCardDemo(): HTMLElement {
  return DemoPage({
    title: "StatCard",
    description:
      "A labelled figure, optionally with an icon, a delta and somewhere to go. Card is a bare surface, so every app rebuilds this on top of it and each copy drifts. The surface here IS Card's — cardVariants, not a second set of class strings — so a change to the card reaches this too.",
    sections: [
      {
        title: "1. Label and value",
        codeTitle: "The whole component, minus the optional parts",
        codeDescription: "Everything except label and value is opt-in. No icon, no delta, no link.",
        code: `const c = document.createElement("zen-stat-card");
c.label = "Total responses";
c.value = "1,284";`,
        render: () =>
          grid(
            statCard({ label: "Total responses", value: "1,284" }),
            statCard({ label: "Active surveys", value: "7" }),
          ),
      },
      {
        title: "2. Colour and icon",
        codeTitle: "color tints the icon; the icon stays bare",
        codeDescription:
          "color maps to --zen-* tokens, so it retints with the theme. The card this replaces computed Bootstrap class names at runtime instead — a string no CSS purge can see. The icon is rendered bare on purpose: an icon inside a tinted tile is the most recognisable machine-made card there is.",
        code: `const c = document.createElement("zen-stat-card");
c.setAttribute("color", "success");
c.label = "Completion rate";
c.value = "87%";
c.icon = Object.assign(document.createElement("zen-icon"), { name: "check-circle", size: 22 });`,
        render: () =>
          grid(
            statCard({ label: "Completion rate", value: "87%", color: "success", iconName: "check-circle" }),
            statCard({ label: "Awaiting review", value: "23", color: "warning", iconName: "inbox" }),
            statCard({ label: "Failed invites", value: "4", color: "error", iconName: "x-circle" }),
          ),
      },
      {
        title: "3. Trend",
        codeTitle: "direction draws the arrow, names it, and picks a colour",
        codeDescription:
          "direction draws the arrow and names it for a screen reader. It also picks a colour by convention — up reads as success, down as error, flat as neutral.",
        code: `c.trend = { value: "+12%", direction: "up" };   // "down" → error, "flat" → neutral`,
        render: () =>
          grid(
            statCard({ label: "Responses", value: "1,284", trend: { value: "+12%", direction: "up" } }),
            statCard({ label: "Errors", value: "12", trend: { value: "-37%", direction: "down" } }),
            statCard({ label: "Time to complete", value: "4m 12s", trend: { value: "no change", direction: "flat" } }),
          ),
      },
      {
        title: "4. Somewhere to go",
        codeTitle: "href renders a link; onClick renders a button",
        codeDescription:
          "Not a div with a click handler bolted on — an interactive card is a real control, so it is focusable and reachable from the keyboard for free. It shifts tone on hover rather than lifting off the page.",
        code: `linkCard.setAttribute("href", "#stat-card-link");
buttonCard.onClick = () => open("drafts");`,
        render: () => {
          const out = document.createElement("p");
          out.className = "zen-m-0 zen-text-xs zen-text-zen-muted-fg";
          const code = document.createElement("code");
          code.textContent = "—";
          out.append("onClick → ", code);
          return column(
            grid(
              statCard({ label: "Responses", value: "1,284", iconName: "users", href: "#stat-card-link" }),
              statCard({
                label: "Drafts",
                value: "3",
                color: "primary",
                iconName: "folder-open",
                onClick: () => {
                  code.textContent = "clicked Drafts";
                },
              }),
            ),
            out,
          );
        },
      },
      {
        title: "5. Loading",
        codeTitle: "The label stays; the figure is what you do not know yet",
        codeDescription:
          "loading swaps the figure for a skeleton and marks the card aria-busy. The label is not a mystery, so it does not shimmer.",
        code: `card.setAttribute("loading", "");
card.loading = false;   // remove it to reveal the figure — a targeted DOM write`,
        render: () => {
          const a = statCard({
            label: "Completion rate",
            value: "87%",
            color: "success",
            iconName: "check-circle",
            trend: { value: "+12%", direction: "up" },
            loading: true,
          });
          const b = statCard({ label: "Total responses", value: "1,284", loading: true });
          let loading = true;
          const btn = document.createElement("zen-button");
          btn.setAttribute("size", "sm");
          btn.setAttribute("variant", "outline");
          btn.setAttribute("color", "neutral");
          btn.textContent = "Resolve";
          btn.addEventListener("click", () => {
            loading = !loading;
            a.loading = loading;
            b.loading = loading;
            btn.textContent = loading ? "Resolve" : "Simulate loading";
          });
          return column(grid(a, b), btn);
        },
      },
    ],
  });
}
