import { SelectableCardGroup } from "./card/card.selectable";
import { Badge } from "./badge/badge";
import { DemoPage } from "./demo-helpers";

/**
 * Mirrors the SelectableCard sections of the React NewCardDemo (goal picker,
 * plan picker with badges, disabled). The base Card compound API lives in the
 * Card demo; this page is the "pick one" variant on its own route, matching the
 * data-driven vanilla API.
 */

const svg = (markup: string): SVGSVGElement => {
  const tpl = document.createElement("template");
  tpl.innerHTML = markup;
  return tpl.content.firstChild as SVGSVGElement;
};

const InvoiceIcon = () =>
  svg(
    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>`,
  );
const ExpenseIcon = () =>
  svg(
    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="6" x2="12" y2="12"/><line x1="12" y1="16" x2="12" y2="16"/></svg>`,
  );
const ReportIcon = () =>
  svg(
    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3v18h18"/><path d="M7 14l4-4 4 4 5-5"/></svg>`,
  );

export default function SelectableCardDemo(): HTMLElement {
  return DemoPage({
    title: "SelectableCard",
    description:
      'A radio-as-a-card pattern for "pick one" onboarding questions. Selectable cards beat radio lists for goal pickers / plan selectors / use-case choices — bigger tap targets, room for an icon + description, and they read as decisions rather than options. Built on the roving-focus + controllable primitives, so exactly-one selection, arrow / Home / End navigation and form submission come for free.',
    sections: [
      {
        title: "1. Goal picker",
        codeTitle: "Replaces a radio-button list with rich card choices",
        codeDescription:
          'Underlying radios are visually hidden but keyboard-navigable. data-state="checked" on the selected card paints the primary ring + soft tint + a small check indicator top-right.',
        code: `const group = SelectableCardGroup({
  defaultValue: "invoice",
  onValueChange: (v) => console.log(v),
  "aria-label": "What do you want to do first?",
  items: [
    { value: "invoice", title: "Send invoices", icon: I,
      description: "Bill customers and track payments." },
    { value: "track", title: "Track expenses", icon: E,
      description: "Log receipts and categorize spending." },
    { value: "report", title: "File taxes", icon: R,
      description: "Generate GST + income-tax-ready exports." },
  ],
});
document.body.append(group.el);`,
        render: () => {
          const picked = document.createElement("p");
          picked.className = "zen-text-xs zen-text-zen-muted-fg zen-mt-3";

          const group = SelectableCardGroup({
            defaultValue: "invoice",
            "aria-label": "What do you want to do first?",
            onValueChange: (v) => {
              picked.textContent = "";
              const code = document.createElement("code");
              code.textContent = v;
              picked.append("Picked: ", code);
            },
            items: [
              {
                value: "invoice",
                title: "Send invoices",
                icon: InvoiceIcon(),
                description: "Bill customers and track payments.",
              },
              {
                value: "track",
                title: "Track expenses",
                icon: ExpenseIcon(),
                description: "Log receipts and categorize spending.",
              },
              {
                value: "report",
                title: "File taxes",
                icon: ReportIcon(),
                description: "Generate GST + income-tax-ready exports.",
              },
            ],
          });

          picked.append("Picked: ");
          const code = document.createElement("code");
          code.textContent = "invoice";
          picked.append(code);

          const wrap = document.createElement("div");
          wrap.style.width = "100%";
          wrap.append(group.el, picked);
          return wrap;
        },
      },
      {
        title: "2. Plan picker with badges",
        codeTitle: "Trailing Badge for 'Most popular' / 'Best value'",
        code: `SelectableCardGroup({
  defaultValue: "pro",
  "aria-label": "Pick a plan",
  items: [
    { value: "free", title: "Free",
      description: "₹0 — 10 invoices/month, basic reporting." },
    { value: "pro", title: "Pro",
      badge: Badge({ color: "success", variant: "soft", children: "Most popular" }).el,
      description: "₹999/month — unlimited invoices, custom branding, GST exports." },
    { value: "team", title: "Team",
      badge: Badge({ color: "info", variant: "soft", children: "5+ users" }).el,
      description: "₹2,999/month — everything in Pro plus 5 seats and SSO." },
  ],
});`,
        render: () => {
          const group = SelectableCardGroup({
            defaultValue: "pro",
            "aria-label": "Pick a plan",
            items: [
              {
                value: "free",
                title: "Free",
                description: "₹0 — 10 invoices/month, basic reporting.",
              },
              {
                value: "pro",
                title: "Pro",
                badge: Badge({ color: "success", variant: "soft", children: "Most popular" }).el,
                description:
                  "₹999/month — unlimited invoices, custom branding, GST exports.",
              },
              {
                value: "team",
                title: "Team",
                badge: Badge({ color: "info", variant: "soft", children: "5+ users" }).el,
                description:
                  "₹2,999/month — everything in Pro plus 5 user seats and SSO.",
              },
            ],
          });
          const wrap = document.createElement("div");
          wrap.style.width = "100%";
          wrap.append(group.el);
          return wrap;
        },
      },
      {
        title: "3. Disabled card",
        codeTitle: "disabled locks a single option out",
        code: `SelectableCardGroup({
  defaultValue: "basic",
  "aria-label": "Tier",
  items: [
    { value: "basic", title: "Basic",
      description: "Standard features for individuals." },
    { value: "enterprise", title: "Enterprise", disabled: true,
      badge: Badge({ color: "neutral", variant: "outline", children: "Contact sales" }).el,
      description: "Custom pricing, dedicated CSM, SLA. Disabled here." },
  ],
});`,
        render: () => {
          const group = SelectableCardGroup({
            defaultValue: "basic",
            "aria-label": "Tier",
            items: [
              {
                value: "basic",
                title: "Basic",
                description: "Standard features for individuals.",
              },
              {
                value: "enterprise",
                title: "Enterprise",
                disabled: true,
                badge: Badge({ color: "neutral", variant: "outline", children: "Contact sales" }).el,
                description: "Custom pricing, dedicated CSM, SLA. Disabled here.",
              },
            ],
          });
          const wrap = document.createElement("div");
          wrap.style.width = "100%";
          wrap.append(group.el);
          return wrap;
        },
      },
    ],
  });
}
