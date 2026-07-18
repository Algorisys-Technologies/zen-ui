import { Badge } from "./badge/badge";
import { DemoPage } from "./demo-helpers";

const COLORS = ["primary", "neutral", "info", "success", "warning", "error"] as const;

export default function BadgeDemo(): HTMLElement {
  return DemoPage({
    title: "Badge",
    description:
      "The whole component is variants, cn() and the prefix — no behaviour at all. That is why it is in the slice: it is the cheapest possible proof that the styling layer reaches a third binding unchanged.",
    sections: [
      {
        title: "1. Variants",
        codeTitle: 'variant — defaults to "soft"',
        code: `Badge({ children: "Soft" })
Badge({ variant: "solid", children: "Solid" })
Badge({ variant: "outline", children: "Outline" })`,
        render: () =>
          (["soft", "solid", "outline"] as const).map(
            (variant) => Badge({ variant, children: variant }).el,
          ),
      },
      {
        title: "2. Colours",
        code: COLORS.map((c) => `Badge({ color: "${c}", children: "${c}" })`).join("\n"),
        render: () => COLORS.map((color) => Badge({ color, children: color }).el),
      },
      {
        title: "3. Solid × colour",
        code: `Badge({ variant: "solid", color: "error", children: "Failed" })`,
        render: () => COLORS.map((color) => Badge({ variant: "solid", color, children: color }).el),
      },
    ],
  });
}
