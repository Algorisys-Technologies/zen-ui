import { DemoPage } from "./demo-helpers";
import type { TabSpec } from "@algorisys/zen-ui-vanilla";

/**
 * Mirrors the vanilla TabsDemo, rendered through <zen-tabs>. The tab list is data:
 * set `el.tabs = [...]` (or author `tabs='[…]'` inline). `variant`, `orientation`,
 * `value` and `default-value` are attributes; onValueChange maps to zen-value-change.
 */
const TABS: TabSpec[] = [
  { value: "overview", label: "Overview", content: "Everything at a glance." },
  { value: "activity", label: "Activity", content: "Who did what, and when." },
  { value: "notes", label: "Notes", content: "Free-text notes on this record." },
];

function tabsEl(attrs: Record<string, string> = {}): HTMLElement {
  const t = document.createElement("zen-tabs");
  for (const [k, v] of Object.entries(attrs)) t.setAttribute(k, v);
  (t as unknown as { tabs: TabSpec[] }).tabs = TABS;
  return t;
}

function fullWidth(child: HTMLElement): HTMLElement {
  const wrap = document.createElement("div");
  wrap.style.width = "100%";
  wrap.append(child);
  return wrap;
}

export default function TabsDemo(): HTMLElement {
  return DemoPage({
    title: "Tabs",
    description:
      "Roving focus written by hand: the tab list is ONE tab stop, arrows move within it, Home/End jump to the ends. That is what Radix's RovingFocusGroup does, and it is a WCAG 2.1.1 requirement rather than a preference.",
    sections: [
      {
        title: "1. Underline (default)",
        codeTitle: 'variant — defaults to "underline"',
        code: `<zen-tabs default-value="overview"
  tabs='[{"value":"overview","label":"Overview","content":"…"},
         {"value":"activity","label":"Activity","content":"…"}]'></zen-tabs>`,
        render: () => fullWidth(tabsEl({ "default-value": "overview" })),
      },
      {
        title: "2. Pills",
        codeTitle: 'variant="pills"',
        codeDescription:
          "The variant is set once on the element and reaches the triggers.",
        code: `<zen-tabs variant="pills" default-value="overview"></zen-tabs>
<script>el.tabs = tabs;</script>`,
        render: () => fullWidth(tabsEl({ variant: "pills", "default-value": "overview" })),
      },
      {
        title: "3. Vertical",
        codeTitle: 'orientation="vertical"',
        codeDescription: "Up/Down replace Left/Right, and aria-orientation follows.",
        code: `<zen-tabs orientation="vertical" variant="pills" default-value="overview"></zen-tabs>`,
        render: () =>
          fullWidth(
            tabsEl({ orientation: "vertical", variant: "pills", "default-value": "overview" }),
          ),
      },
      {
        title: "4. Controlled",
        description: "Pass `value` and the component stops owning it — zen-value-change still fires.",
        codeTitle: "value + zen-value-change",
        code: `const t = document.createElement("zen-tabs");
t.tabs = tabs;
t.setAttribute("value", "activity");
t.addEventListener("zen-value-change", (e) => {
  t.setAttribute("value", e.detail);   // keep driving it
});`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.width = "100%";
          const readout = document.createElement("p");
          readout.style.fontSize = "0.8125rem";
          readout.style.color = "var(--zen-color-muted-fg)";

          const t = tabsEl({ value: "activity" });
          const paint = (v: string) => (readout.textContent = `the caller stored: ${v}`);
          t.addEventListener("zen-value-change", (e) => {
            const v = (e as CustomEvent<string>).detail;
            t.setAttribute("value", v);
            paint(v);
          });
          paint("activity");
          wrap.append(t, readout);
          return wrap;
        },
      },
    ],
  });
}
