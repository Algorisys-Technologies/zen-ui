import { Button } from "./button/button";
import { Loading } from "./loading/loading";
import { DemoPage } from "./demo-helpers";

const COLORS = ["primary", "neutral", "info", "success", "warning", "error"] as const;

export default function LoadingDemo(): HTMLElement {
  return DemoPage({
    title: "Loading",
    description:
      "Animated spinner. No primitive needed; it is a plain SVG with zen-animate-spin, the same pattern shadcn ships. Carries a visually-hidden label so screen readers announce \"Loading\".",
    sections: [
      {
        title: "1. Default",
        codeTitle: "md primary spinner with sr-only 'Loading' label",
        code: `const spinner = Loading();
document.body.append(spinner.el);`,
        render: () => Loading().el,
      },
      {
        title: "2. Sizes",
        codeTitle: "sm · md · lg · xl",
        code: `Loading({ size: "sm" });
Loading({ size: "md" });
Loading({ size: "lg" });
Loading({ size: "xl" });`,
        render: () =>
          (["sm", "md", "lg", "xl"] as const).map((size) => Loading({ size }).el),
      },
      {
        title: "3. Colors",
        codeTitle: "primary · neutral · info · success · warning · error · current",
        codeDescription:
          'Use "current" to inherit the surrounding text color — useful when nesting Loading inside a Button.',
        code: `Loading({ color: "primary" });
Loading({ color: "success" });
Loading({ color: "error" });
Loading({ color: "current" });`,
        render: () =>
          COLORS.map((color) => Loading({ color, size: "lg", label: `Loading ${color}` }).el),
      },
      {
        title: "4. Inside a Button",
        codeTitle: 'color="current" inherits the button\'s text color',
        code: `Button({
  disabled: true,
  children: [Loading({ color: "current", size: "sm", label: "" }), "Saving…"],
});`,
        render: () => [
          Button({
            disabled: true,
            children: [Loading({ color: "current", size: "sm", label: "" }), "Saving…"],
          }).el,
          Button({
            variant: "outline",
            disabled: true,
            children: [Loading({ color: "current", size: "sm", label: "" }), "Loading…"],
          }).el,
        ],
      },
      {
        title: "5. Decorative (no announcement)",
        codeTitle: 'label="" marks it presentational so the parent provides semantics',
        codeDescription:
          'Useful when the surrounding element already says "Loading" or carries aria-busy.',
        code: `const wrap = document.createElement("div");
wrap.setAttribute("aria-busy", "true");
wrap.append(Loading({ label: "" }).el, document.createTextNode("Fetching results…"));`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.setAttribute("aria-busy", "true");
          wrap.style.display = "inline-flex";
          wrap.style.alignItems = "center";
          wrap.style.gap = "8px";
          wrap.style.fontSize = "0.875rem";
          const span = document.createElement("span");
          span.textContent = "Fetching results…";
          wrap.append(Loading({ label: "" }).el, span);
          return wrap;
        },
      },
      {
        title: "6. Full-page overlay pattern",
        codeTitle: "Compose with a wrapper for blocking states",
        code: `const overlay = document.createElement("div");
Object.assign(overlay.style, {
  position: "fixed", inset: "0",
  background: "rgba(0,0,0,0.4)",
  display: "grid", placeItems: "center",
});
overlay.append(Loading({ size: "xl", color: "current" }).el);`,
        render: () => {
          const box = document.createElement("div");
          Object.assign(box.style, {
            position: "relative",
            width: "240px",
            height: "80px",
            background: "var(--zen-color-muted)",
            borderRadius: "var(--zen-radius-md)",
            display: "grid",
            placeItems: "center",
          });
          box.append(Loading({ size: "lg", color: "primary" }).el);
          return box;
        },
      },
    ],
  });
}
