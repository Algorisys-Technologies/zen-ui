import { SkipToContent } from "./skip-to-content/skip-to-content";
import { DemoPage } from "./demo-helpers";

export default function SkipToContentDemo(): HTMLElement {
  return DemoPage({
    title: "SkipToContent",
    description:
      "The keyboard bypass an app frame owes its users. It is the first focusable thing on the page and is visually hidden until it takes focus, so the first Tab reveals a 'Skip to main content' link and Enter jumps past the header and nav to the content (WCAG 2.4.1, Bypass Blocks).",
    sections: [
      {
        title: "Try it",
        codeTitle: "First Tab reveals the link; Enter jumps to the target",
        code: `const skip = SkipToContent({ href: "#main-content" });\ndocument.body.prepend(skip.el);\n// <main id="main-content" tabindex="-1">…</main>`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.position = "relative";
          wrap.style.display = "grid";
          wrap.style.gap = "12px";

          const hint = document.createElement("p");
          hint.className = "zen-text-sm zen-text-zen-muted-fg";
          hint.innerHTML =
            "Click here, then press <kbd>Tab</kbd> — the link appears at the top-left of the viewport. Press <kbd>Enter</kbd> to move focus to the target below.";

          const target = document.createElement("div");
          target.id = "demo-main";
          target.tabIndex = -1;
          target.className = "zen-rounded-zen-lg zen-border zen-border-zen-border zen-bg-zen-muted zen-p-4";
          target.textContent = "Main content target (id=\"demo-main\", tabindex=-1).";

          wrap.append(SkipToContent({ href: "#demo-main" }).el, hint, target);
          return wrap;
        },
      },
    ],
  });
}
