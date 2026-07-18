import { DemoPage } from "./demo-helpers";

/**
 * SkipToContent demo — the web-components port. <zen-skip-to-content href="#…">
 * is the first focusable thing on the page, visually hidden until it takes focus.
 */

export default function SkipToContentDemo(): HTMLElement {
  return DemoPage({
    title: "SkipToContent",
    description:
      "The keyboard bypass an app frame owes its users. It is the first focusable thing on the page and is visually hidden until it takes focus, so the first Tab reveals a 'Skip to main content' link and Enter jumps past the header and nav to the content (WCAG 2.4.1, Bypass Blocks).",
    sections: [
      {
        title: "Try it",
        codeTitle: "First Tab reveals the link; Enter jumps to the target",
        code: `<zen-skip-to-content href="#main-content"></zen-skip-to-content>
<main id="main-content" tabindex="-1">…</main>`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.position = "relative";
          wrap.style.display = "grid";
          wrap.style.gap = "12px";

          const skip = document.createElement("zen-skip-to-content");
          skip.setAttribute("href", "#demo-main");

          const hint = document.createElement("p");
          hint.className = "zen-text-sm zen-text-zen-muted-fg";
          hint.innerHTML =
            "Click here, then press <kbd>Tab</kbd> — the link appears at the top-left of the viewport. Press <kbd>Enter</kbd> to move focus to the target below.";

          const target = document.createElement("div");
          target.id = "demo-main";
          target.tabIndex = -1;
          target.className = "zen-rounded-zen-lg zen-border zen-border-zen-border zen-bg-zen-muted zen-p-4";
          target.textContent = 'Main content target (id="demo-main", tabindex=-1).';

          wrap.append(skip, hint, target);
          return wrap;
        },
      },
    ],
  });
}
