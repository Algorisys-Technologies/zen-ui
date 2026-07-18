import { DemoPage } from "./demo-helpers";

/**
 * Card demo — the web-components port. <zen-card> is the surface (variant /
 * padding attributes); the compound parts (<zen-card-header>, <zen-card-title>,
 * <zen-card-description>, <zen-card-content>, <zen-card-footer>) are opt-in and
 * slot their children in the light DOM.
 */

function el(tag: string, attrs: Record<string, string> = {}, kids?: Node | Node[] | string): HTMLElement {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  if (kids != null) {
    if (typeof kids === "string") n.textContent = kids;
    else if (Array.isArray(kids)) n.append(...kids);
    else n.append(kids);
  }
  return n;
}

const VARIANTS = ["elevated", "outlined", "ghost"] as const;

export default function CardDemo(): HTMLElement {
  return DemoPage({
    title: "Card",
    description:
      "Generic surface primitive. A compound API for the common Header / Content / Footer layout, but every part is opt-in so you can compose freely. Three surface variants and four padding scales, all from the same core token set the other bindings use.",
    sections: [
      {
        title: "1. Base — compound API",
        codeTitle: "Header / Content / Footer",
        code: `<zen-card>
  <zen-card-header>
    <zen-card-title>Account</zen-card-title>
    <zen-card-description>Your billing + contact info.</zen-card-description>
  </zen-card-header>
  <zen-card-content>You're on the Pro plan, renewing 14 Jun 2026.</zen-card-content>
  <zen-card-footer>
    <zen-button>Manage</zen-button>
    <zen-button variant="outline" color="neutral">Cancel plan</zen-button>
  </zen-card-footer>
</zen-card>`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.width = "100%";
          wrap.style.maxWidth = "20rem";
          wrap.append(
            el("zen-card", {}, [
              el("zen-card-header", {}, [
                el("zen-card-title", {}, "Account"),
                el("zen-card-description", {}, "Your billing + contact info."),
              ]),
              el("zen-card-content", {}, el("p", { class: "zen-text-sm zen-m-0" }, "You're on the Pro plan, renewing 14 Jun 2026.")),
              el("zen-card-footer", {}, [
                el("zen-button", {}, "Manage"),
                el("zen-button", { variant: "outline", color: "neutral" }, "Cancel plan"),
              ]),
            ]),
          );
          return wrap;
        },
      },
      {
        title: "2. Variants",
        codeTitle: "elevated · outlined (default) · ghost",
        code: `<zen-card variant="elevated" padding="md">…</zen-card>
<zen-card variant="outlined" padding="md">…</zen-card>
<zen-card variant="ghost" padding="md">…</zen-card>`,
        render: () => {
          const grid = document.createElement("div");
          grid.style.width = "100%";
          grid.style.display = "grid";
          grid.style.gridTemplateColumns = "repeat(3, 1fr)";
          grid.style.gap = "12px";
          grid.append(
            ...VARIANTS.map((variant) =>
              el("zen-card", { variant, padding: "md" }, [
                el("strong", { class: "zen-text-sm" }, variant),
                el("p", { class: "zen-text-xs zen-text-zen-muted-fg zen-m-0 zen-mt-1" }, `variant="${variant}" + padding="md"`),
              ]),
            ),
          );
          return grid;
        },
      },
    ],
  });
}
