import { DemoPage } from "./demo-helpers";

/**
 * Accordion demo — the web-components port. <zen-accordion> is data-driven: set
 * `el.items = [...]` (an array of { value, trigger, content, disabled? }). `type`
 * and `collapsible` are attributes; `value` / `defaultValue` are JS properties
 * because in "multiple" mode they hold an array a string attribute cannot express.
 */

interface FaqItem {
  value: string;
  trigger: string;
  content: string;
  disabled?: boolean;
}

const FAQ: FaqItem[] = [
  { value: "0", trigger: "When will my account be approved?", content: "Most accounts are approved within one business day. KYC documents are reviewed by a real human, so we'll email you the moment the review finishes." },
  { value: "1", trigger: "Can I change my email later?", content: "Yes — go to Settings → Security → Email and follow the verification link sent to the new address." },
  { value: "2", trigger: "What if my document is rejected?", content: "We'll send you a specific reason (e.g. blurry photo, expired ID) and let you re-upload. There's no limit on retries." },
  { value: "3", trigger: "Is my data shared with anyone?", content: "No — KYC documents are encrypted at rest, accessed only by the review team, and deleted after the legally-mandated retention window." },
];

function accordion(opts: {
  type: "single" | "multiple";
  collapsible?: boolean;
  defaultValue?: string | string[];
  items: FaqItem[];
}): HTMLElement {
  const a = document.createElement("zen-accordion") as HTMLElement & {
    items: FaqItem[];
    defaultValue?: string | string[];
  };
  a.setAttribute("type", opts.type);
  if (opts.collapsible) a.setAttribute("collapsible", "");
  a.items = opts.items;
  if (opts.defaultValue !== undefined) a.defaultValue = opts.defaultValue;

  const wrap = document.createElement("div");
  wrap.style.width = "100%";
  wrap.append(a);
  return wrap;
}

export default function AccordionDemo(): HTMLElement {
  return DemoPage({
    title: "Accordion",
    description:
      "Collapsible sections. This is the component that found the bug: core's keyframes read a Radix-specific variable and the animation class was never generated, so the accordion had never animated in ANY binding. It slides here because this binding measures the height itself and publishes it as --zen-collapsible-content-height.",
    sections: [
      {
        title: "1. Single (default) — one open at a time",
        codeTitle: 'type="single" collapsible',
        codeDescription:
          "Only one section can be open. `collapsible` lets the user click the active section to close it (without it, one is always open) — matching Radix.",
        code: `<zen-accordion type="single" collapsible></zen-accordion>

const acc = document.querySelector("zen-accordion");
acc.items = [
  { value: "0", trigger: "When will my account be approved?", content: "…" },
  { value: "1", trigger: "Can I change my email later?", content: "…" },
];
acc.defaultValue = "0";`,
        render: () => accordion({ type: "single", collapsible: true, defaultValue: "0", items: FAQ }),
      },
      {
        title: "2. Multiple — any number open",
        codeTitle: 'type="multiple"',
        code: `<zen-accordion type="multiple"></zen-accordion>

acc.items = FAQ;
acc.defaultValue = ["0", "2"];   // an array in multiple mode`,
        render: () => accordion({ type: "multiple", defaultValue: ["0", "2"], items: FAQ }),
      },
      {
        title: "3. Disabled item",
        codeTitle: "disabled",
        codeDescription: "A disabled trigger is skipped by the arrow keys, not merely greyed out.",
        code: `acc.items = [
  { value: "a", trigger: "Available", content: "…" },
  { value: "b", trigger: "Locked", content: "…", disabled: true },
  { value: "c", trigger: "Also available", content: "…" },
];`,
        render: () =>
          accordion({
            type: "single",
            collapsible: true,
            items: [
              { value: "a", trigger: "Available", content: "This one opens." },
              { value: "b", trigger: "Locked", content: "Never reachable.", disabled: true },
              { value: "c", trigger: "Also available", content: "Arrow keys skip the locked one." },
            ],
          }),
      },
    ],
  });
}
