import { DemoPage } from "./demo-helpers";

/**
 * Collapsible demo — the web-components port. <zen-collapsible> is data-driven
 * from `trigger` / `content`, mirroring the vanilla factory: there are no
 * compound parts to slot.
 *
 * `default-open` is a boolean attribute (the uncontrolled seed). `open` is a JS
 * property, because a boolean attribute can only ever add presence=true and a
 * controlled caller has to be able to say `el.open = false`.
 */

type ZenCollapsible = HTMLElement & {
  open?: boolean;
  trigger?: string | Node;
  content?: string | Node;
};

function collapsible(opts: {
  trigger: string;
  content: string;
  defaultOpen?: boolean;
  disabled?: boolean;
}): HTMLElement {
  const c = document.createElement("zen-collapsible") as ZenCollapsible;

  const trigger = document.createElement("span");
  trigger.className = "zen-text-sm zen-font-medium";
  trigger.textContent = opts.trigger;

  const content = document.createElement("div");
  content.className = "zen-pt-2 zen-text-zen-muted-fg";
  content.textContent = opts.content;

  // Nodes, not strings: a string attribute could carry the text but not the
  // classes, and these are the same two nodes the vanilla demo builds.
  c.trigger = trigger;
  c.content = content;

  if (opts.defaultOpen) c.setAttribute("default-open", "");
  if (opts.disabled) c.setAttribute("disabled", "");

  const wrap = document.createElement("div");
  wrap.style.width = "20rem";
  wrap.append(c);
  return wrap;
}

export default function CollapsibleDemo(): HTMLElement {
  return DemoPage({
    title: "Collapsible",
    description:
      "One region that shows and hides. Accordion is for a SET of sections that coordinate; this is the single independent disclosure — a 'show more' on a card, an advanced-options block.",
    sections: [
      {
        title: "1. Basic",
        codeTitle: "trigger + content",
        codeDescription:
          "The trigger renders unstyled — the disclosure surface is usually your own row or heading. It still gets the button reset, the focus ring and the cursor.",
        code: `const c = document.createElement("zen-collapsible");
c.trigger = "Advanced settings";
c.content = "Retries, timeouts and backoff.";`,
        render: () =>
          collapsible({
            trigger: "Advanced settings",
            content: "Retries, timeouts and backoff.",
          }),
      },
      {
        title: "2. Open by default",
        codeTitle: "default-open",
        codeDescription:
          "The uncontrolled seed, so it is a plain boolean attribute — authorable inline in HTML.",
        code: `<zen-collapsible default-open></zen-collapsible>`,
        render: () =>
          collapsible({
            trigger: "What is included",
            content: "Two seats, 10 GB, email support.",
            defaultOpen: true,
          }),
      },
      {
        title: "3. Controlled",
        codeTitle: "el.open + zen-open-change",
        codeDescription:
          "`open` is a JS property, not an attribute: a controlled caller has to be able to set it false. The element reports the user's click as a zen-open-change event and does not move until you hand back a new `open`.",
        code: `const c = document.createElement("zen-collapsible");
c.open = false;
c.addEventListener("zen-open-change", (e) => {
  c.open = e.detail;
});`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.width = "20rem";
          wrap.className = "zen-space-y-2";

          const c = document.createElement("zen-collapsible") as ZenCollapsible;
          const content = document.createElement("div");
          content.className =
            "zen-rounded-zen-md zen-bg-zen-muted zen-p-3 zen-font-mono zen-text-xs";
          content.textContent = '{ "employee_id": 41, "status": "active" }';
          // An empty trigger: this section's point is that the control driving
          // it lives outside the element.
          c.trigger = "";
          c.content = content;
          c.open = false;

          const btn = document.createElement("zen-button") as HTMLElement;
          btn.setAttribute("size", "sm");
          btn.setAttribute("variant", "outline");
          btn.textContent = "Show the payload";
          btn.addEventListener("click", () => {
            c.open = !c.open;
            btn.textContent = `${c.open ? "Hide" : "Show"} the payload`;
          });

          wrap.append(btn, c);
          return wrap;
        },
      },
      {
        title: "4. Disabled",
        codeTitle: "disabled",
        codeDescription:
          "The trigger stops responding to both click and Enter — a section gated behind a permission or a plan.",
        code: `<zen-collapsible disabled></zen-collapsible>`,
        render: () =>
          collapsible({
            trigger: "Locked section",
            content: "Never reachable.",
            disabled: true,
          }),
      },
    ],
  });
}
