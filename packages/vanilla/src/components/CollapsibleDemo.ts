import { Collapsible } from "./collapsible/collapsible";
import { Button } from "./button/button";
import { DemoPage } from "./demo-helpers";

export default function CollapsibleDemo(): HTMLElement {
  return DemoPage({
    title: "Collapsible",
    description:
      "One region that shows and hides. Accordion is for a SET of sections that coordinate; this is the single independent disclosure — a 'show more' on a card, an advanced-options block. Like Accordion, it takes its trigger and content as data rather than compound children: with no context to wire parts through, the compound form would be a call site you can get wrong.",
    sections: [
      {
        title: "1. Basic",
        codeTitle: "trigger + content",
        codeDescription:
          "The trigger renders unstyled — the disclosure surface is usually your own row or heading. It still gets the button reset, the focus ring and the cursor.",
        code: `Collapsible({
  trigger: "Advanced settings",
  content: "Retries, timeouts and backoff.",
})`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.width = "20rem";
          const trigger = document.createElement("span");
          trigger.className = "zen-text-sm zen-font-medium";
          trigger.textContent = "Advanced settings";
          const content = document.createElement("div");
          content.className = "zen-pt-2 zen-text-zen-muted-fg";
          content.textContent = "Retries, timeouts and backoff.";
          wrap.append(Collapsible({ trigger, content }).el);
          return wrap;
        },
      },
      {
        title: "2. Open by default",
        codeTitle: "defaultOpen",
        codeDescription:
          "Uncontrolled — the component owns the state after construction. Use when the content is the point of the section and collapsing is the exception.",
        code: `Collapsible({
  trigger: "What is included",
  content: "Two seats, 10 GB, email support.",
  defaultOpen: true,
})`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.width = "20rem";
          const trigger = document.createElement("span");
          trigger.className = "zen-text-sm zen-font-medium";
          trigger.textContent = "What is included";
          const content = document.createElement("div");
          content.className = "zen-pt-2 zen-text-zen-muted-fg";
          content.textContent = "Two seats, 10 GB, email support.";
          wrap.append(Collapsible({ trigger, content, defaultOpen: true }).el);
          return wrap;
        },
      },
      {
        title: "3. Controlled",
        codeTitle: "open + onOpenChange + update()",
        codeDescription:
          "The caller owns the state, so anything on the page can drive it. A controlled component reports the click and refuses to move until you hand back a new `open` through update() — which is what makes the external Button the only thing that opens this one.",
        code: `let open = false;
const panel = Collapsible({ open, content: "…", trigger: "" });

const btn = Button({
  children: "Show the payload",
  size: "sm",
  variant: "outline",
  onClick: () => {
    open = !open;
    panel.update({ open });
  },
})`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.width = "20rem";
          wrap.className = "zen-space-y-2";

          let open = false;
          const content = document.createElement("div");
          content.className =
            "zen-rounded-zen-md zen-bg-zen-muted zen-p-3 zen-font-mono zen-text-xs";
          content.textContent = '{ "employee_id": 41, "status": "active" }';

          // An empty trigger: this section's whole point is that the control
          // driving it lives outside the component.
          const panel = Collapsible({ open, trigger: "", content });

          const btn = Button({
            children: "Show the payload",
            size: "sm",
            variant: "outline",
            onClick: () => {
              open = !open;
              panel.update({ open });
              btn.update({ children: `${open ? "Hide" : "Show"} the payload` });
            },
          });

          wrap.append(btn.el, panel.el);
          return wrap;
        },
      },
      {
        title: "4. Disabled",
        codeTitle: "disabled",
        codeDescription:
          "The trigger stops responding to both click and Enter — a section gated behind a permission or a plan.",
        code: `Collapsible({
  trigger: "Locked section",
  content: "Never reachable.",
  disabled: true,
})`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.width = "20rem";
          const trigger = document.createElement("span");
          trigger.className = "zen-text-sm zen-font-medium";
          trigger.textContent = "Locked section";
          const content = document.createElement("div");
          content.className = "zen-pt-2 zen-text-zen-muted-fg";
          content.textContent = "Never reachable.";
          wrap.append(Collapsible({ trigger, content, disabled: true }).el);
          return wrap;
        },
      },
    ],
  });
}
