import { StatCard } from "./stat-card/stat-card";
import { Icon } from "./icon/icon";
import { Button } from "./button/button";
import { DemoPage } from "./demo-helpers";

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
        codeDescription:
          "Everything except label and value is opt-in. No icon, no delta, no link.",
        code: `StatCard({ label: "Total responses", value: "1,284" })`,
        render: () =>
          grid(
            StatCard({ label: "Total responses", value: "1,284" }).el,
            StatCard({ label: "Active surveys", value: "7" }).el,
          ),
      },
      {
        title: "2. Colour and icon",
        codeTitle: "color tints the icon; the icon stays bare",
        codeDescription:
          "color maps to --zen-* tokens, so it retints with the theme. The card this replaces computed Bootstrap class names at runtime instead — a string no CSS purge can see. The icon is rendered bare on purpose: an icon inside a tinted tile is the most recognisable machine-made card there is.",
        code: `StatCard({
  label: "Completion rate",
  value: "87%",
  color: "success",
  icon: Icon({ name: "check-circle", size: 22 }),
})`,
        render: () =>
          grid(
            StatCard({
              label: "Completion rate",
              value: "87%",
              color: "success",
              icon: Icon({ name: "check-circle", size: 22 }),
            }).el,
            StatCard({
              label: "Awaiting review",
              value: "23",
              color: "warning",
              icon: Icon({ name: "inbox", size: 22 }),
            }).el,
            StatCard({
              label: "Failed invites",
              value: "4",
              color: "error",
              icon: Icon({ name: "x-circle", size: 22 }),
            }).el,
          ),
      },
      {
        title: "3. Trend",
        codeTitle: "direction draws the arrow, names it, and picks a colour",
        codeDescription:
          "direction draws the arrow and names it for a screen reader. It also picks a colour by convention — up reads as success, down as error, flat as neutral.",
        code: `StatCard({ label: "Responses", value: "1,284", trend: { value: "+12%", direction: "up" } })
StatCard({ label: "Errors", value: "12", trend: { value: "-37%", direction: "down" } })
StatCard({ label: "Time to complete", value: "4m 12s", trend: { value: "no change", direction: "flat" } })`,
        render: () =>
          grid(
            StatCard({
              label: "Responses",
              value: "1,284",
              trend: { value: "+12%", direction: "up" },
            }).el,
            StatCard({
              label: "Errors",
              value: "12",
              trend: { value: "-37%", direction: "down" },
            }).el,
            StatCard({
              label: "Time to complete",
              value: "4m 12s",
              trend: { value: "no change", direction: "flat" },
            }).el,
          ),
      },
      {
        title: "4. Somewhere to go",
        codeTitle: "href renders a link; onClick renders a button",
        codeDescription:
          "Not a div with a click handler bolted on — an interactive card is a real control, so it is focusable and reachable from the keyboard for free. It shifts tone on hover rather than lifting off the page.",
        code: `StatCard({ label: "Responses", value: "1,284", href: "#stat-card-link" })
StatCard({ label: "Drafts", value: "3", onClick: () => open("drafts") })`,
        render: () => {
          const out = document.createElement("p");
          out.className = "zen-m-0 zen-text-xs zen-text-zen-muted-fg";
          const code = document.createElement("code");
          code.textContent = "—";
          out.append("onClick → ", code);
          return column(
            grid(
              StatCard({
                label: "Responses",
                value: "1,284",
                icon: Icon({ name: "users", size: 22 }),
                href: "#stat-card-link",
              }).el,
              StatCard({
                label: "Drafts",
                value: "3",
                color: "primary",
                icon: Icon({ name: "folder-open", size: 22 }),
                onClick: () => {
                  code.textContent = "clicked Drafts";
                },
              }).el,
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
        code: `const card = StatCard({ label: "Completion rate", value: "87%", loading: true });
card.update({ loading: false });   // targeted DOM write, no re-render`,
        render: () => {
          const a = StatCard({
            label: "Completion rate",
            value: "87%",
            color: "success",
            icon: Icon({ name: "check-circle", size: 22 }),
            trend: { value: "+12%", direction: "up" },
            loading: true,
          });
          const b = StatCard({ label: "Total responses", value: "1,284", loading: true });
          let loading = true;
          const btn = Button({
            size: "sm",
            variant: "outline",
            color: "neutral",
            children: "Resolve",
          });
          btn.el.addEventListener("click", () => {
            loading = !loading;
            a.update({ loading });
            b.update({ loading });
            btn.update({ children: loading ? "Resolve" : "Simulate loading" });
          });
          return column(grid(a.el, b.el), btn.el);
        },
      },
    ],
  });
}
