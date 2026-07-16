import { Tabs } from "./tabs/tabs";
import { DemoPage } from "./demo-helpers";

const TABS = [
  { value: "overview", label: "Overview", content: "Everything at a glance." },
  { value: "activity", label: "Activity", content: "Who did what, and when." },
  { value: "notes", label: "Notes", content: "Free-text notes on this record." },
];

export default function TabsDemo(): HTMLElement {
  return DemoPage({
    title: "Tabs",
    description:
      "Roving focus written by hand: the tab list is ONE tab stop, arrows move within it, Home/End jump to the ends. That is what Radix's RovingFocusGroup does, and it is a WCAG 2.1.1 requirement rather than a preference.",
    sections: [
      {
        title: "1. Underline (default)",
        codeTitle: 'variant — defaults to "underline"',
        code: `Tabs({
  defaultValue: "overview",
  tabs: [
    { value: "overview", label: "Overview", content: "…" },
    { value: "activity", label: "Activity", content: "…" },
  ],
})`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.width = "100%";
          wrap.append(Tabs({ defaultValue: "overview", tabs: TABS }).el);
          return wrap;
        },
      },
      {
        title: "2. Pills",
        codeTitle: 'variant="pills"',
        codeDescription:
          "Unlike React and Solid, the variant is set once on the component and reaches the triggers. In those bindings `variant` is a separate prop on the list AND each trigger with nothing passing it down, so setting it on the list alone leaves the triggers styled underline.",
        code: `Tabs({ variant: "pills", defaultValue: "overview", tabs })`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.width = "100%";
          wrap.append(Tabs({ variant: "pills", defaultValue: "overview", tabs: TABS }).el);
          return wrap;
        },
      },
      {
        title: "3. Vertical",
        codeTitle: 'orientation="vertical"',
        codeDescription: "Up/Down replace Left/Right, and aria-orientation follows.",
        code: `Tabs({ orientation: "vertical", variant: "pills", tabs })`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.width = "100%";
          wrap.append(Tabs({ orientation: "vertical", variant: "pills", defaultValue: "overview", tabs: TABS }).el);
          return wrap;
        },
      },
      {
        title: "4. Controlled",
        description: "Pass `value` and the component stops owning it — onValueChange still fires.",
        codeTitle: "value + onValueChange",
        code: `const tabs = Tabs({
  value: current,
  tabs: TABS,
  onValueChange: (v) => { current = v; tabs.update({ value: v }); },
});`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.width = "100%";
          const readout = document.createElement("p");
          readout.style.fontSize = "0.8125rem";
          readout.style.color = "var(--zen-color-muted-fg)";
          let current = "activity";
          const t = Tabs({
            value: current,
            tabs: TABS,
            onValueChange: (v) => {
              current = v;
              readout.textContent = `the caller stored: ${current}`;
              t.update({ value: v });
            },
          });
          readout.textContent = `the caller stored: ${current}`;
          wrap.append(t.el, readout);
          return wrap;
        },
      },
    ],
  });
}
