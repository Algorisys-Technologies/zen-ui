import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./card/card";
import { Button } from "./button/button";
import { DemoPage } from "./demo-helpers";

/**
 * CardDemo — mirrors the React NewCardDemo. The vanilla binding ships the base
 * Card surface + compound parts (Header / Title / Description / Content / Footer);
 * the React demo's SelectableCard sections are backed by card.selectable.tsx,
 * which is not part of this binding, so only the base-Card sections are ported.
 */

const el = (tag: string, className: string, text?: string): HTMLElement => {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

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
        code: `Card({ children: [
  CardHeader({ children: [
    CardTitle({ children: "Account" }),
    CardDescription({ children: "Your billing + contact info." }),
  ] }),
  CardContent({ children: "You're on the Pro plan, renewing 14 Jun 2026." }),
  CardFooter({ children: [
    Button({ children: "Manage" }),
    Button({ variant: "outline", color: "neutral", children: "Cancel plan" }),
  ] }),
] });`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.width = "100%";
          wrap.style.maxWidth = "20rem";
          wrap.append(
            Card({
              children: [
                CardHeader({
                  children: [
                    CardTitle({ children: "Account" }),
                    CardDescription({ children: "Your billing + contact info." }),
                  ],
                }),
                CardContent({
                  children: el(
                    "p",
                    "zen-text-sm zen-m-0",
                    "You're on the Pro plan, renewing 14 Jun 2026.",
                  ),
                }),
                CardFooter({
                  children: [
                    Button({ children: "Manage" }),
                    Button({ variant: "outline", color: "neutral", children: "Cancel plan" }),
                  ],
                }),
              ],
            }).el,
          );
          return wrap;
        },
      },
      {
        title: "2. Variants",
        codeTitle: "elevated · outlined (default) · ghost",
        code: `Card({ variant: "elevated", padding: "md", children: [...] });
Card({ variant: "outlined", padding: "md", children: [...] });
Card({ variant: "ghost", padding: "md", children: [...] });`,
        render: () => {
          const grid = document.createElement("div");
          grid.style.width = "100%";
          grid.style.display = "grid";
          grid.style.gridTemplateColumns = "repeat(3, 1fr)";
          grid.style.gap = "12px";
          grid.append(
            ...VARIANTS.map(
              (variant) =>
                Card({
                  variant,
                  padding: "md",
                  children: [
                    el("strong", "zen-text-sm", variant),
                    el(
                      "p",
                      "zen-text-xs zen-text-zen-muted-fg zen-m-0 zen-mt-1",
                      `variant="${variant}" + padding="md"`,
                    ),
                  ],
                }).el,
            ),
          );
          return grid;
        },
      },
    ],
  });
}
