import { DemoPage } from "./demo-helpers";

/**
 * Badge demo — the web-components port. <zen-badge> is pure styling: `variant`,
 * `color` and `size` are plain string attributes, the label is the text child.
 */

const COLORS = ["primary", "neutral", "info", "success", "warning", "error"] as const;

function badge(attrs: Record<string, string>, text: string): HTMLElement {
  const b = document.createElement("zen-badge");
  for (const [k, v] of Object.entries(attrs)) b.setAttribute(k, v);
  b.textContent = text;
  return b;
}

export default function BadgeDemo(): HTMLElement {
  return DemoPage({
    title: "Badge",
    description:
      "The whole component is variants, cn() and the prefix — no behaviour at all. That is why it is in the slice: it is the cheapest possible proof that the styling layer reaches a third binding unchanged.",
    sections: [
      {
        title: "1. Variants",
        codeTitle: 'variant — defaults to "soft"',
        code: `<zen-badge>Soft</zen-badge>
<zen-badge variant="solid">Solid</zen-badge>
<zen-badge variant="outline">Outline</zen-badge>`,
        render: () =>
          (["soft", "solid", "outline"] as const).map((variant) => badge({ variant }, variant)),
      },
      {
        title: "2. Colours",
        code: COLORS.map((c) => `<zen-badge color="${c}">${c}</zen-badge>`).join("\n"),
        render: () => COLORS.map((color) => badge({ color }, color)),
      },
      {
        title: "3. Solid × colour",
        code: `<zen-badge variant="solid" color="error">Failed</zen-badge>`,
        render: () => COLORS.map((color) => badge({ variant: "solid", color }, color)),
      },
    ],
  });
}
