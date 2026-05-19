import type { Component, ParentProps } from "solid-js";
import { For } from "solid-js";
import { A } from "@solidjs/router";
import { useTheme } from "./lib/theme";

/**
 * App shell — sidebar nav + a slot for the active route. Mirrors the
 * packages/react demo layout so the two bindings can be compared
 * side-by-side. New components are added by editing NAV below and
 * registering the corresponding <Route> in main.tsx.
 */

type NavGroup = {
  group: string;
  items: { label: string; path: string }[];
};

const NAV: NavGroup[] = [
  {
    group: "Primitives",
    items: [
      { label: "Button", path: "/button" },
      { label: "Badge", path: "/badge" },
      { label: "Card", path: "/card" },
      { label: "Skeleton", path: "/skeleton" },
      { label: "Loading", path: "/loading" },
      { label: "FAB", path: "/fab" },
      { label: "Separator", path: "/separator" },
    ],
  },
  {
    group: "Surfaces",
    items: [
      { label: "Alert", path: "/alert" },
      { label: "Banner", path: "/banner" },
      { label: "EmptyState", path: "/empty-state" },
    ],
  },
  {
    group: "Flows",
    items: [
      { label: "Stepper", path: "/stepper" },
    ],
  },
  {
    group: "Survey",
    items: [
      { label: "Rating", path: "/rating" },
      { label: "NPS", path: "/nps" },
      { label: "Likert", path: "/likert" },
    ],
  },
  {
    group: "Display (Kobalte)",
    items: [
      { label: "Avatar", path: "/avatar" },
      { label: "Progress", path: "/progress" },
      { label: "Tooltip", path: "/tooltip" },
    ],
  },
  {
    group: "Form (Kobalte)",
    items: [
      { label: "Switch", path: "/switch" },
      { label: "Checkbox", path: "/checkbox" },
      { label: "RadioGroup", path: "/radio-group" },
      { label: "Slider", path: "/slider" },
      { label: "Select", path: "/select" },
    ],
  },
  {
    group: "Disclosure (Kobalte)",
    items: [
      { label: "Tabs", path: "/tabs" },
      { label: "Accordion", path: "/accordion" },
    ],
  },
  {
    group: "Overlays (Kobalte)",
    items: [
      { label: "Popover", path: "/popover" },
      { label: "Dialog", path: "/dialog" },
      { label: "Sheet", path: "/sheet" },
      { label: "DropdownMenu", path: "/dropdown-menu" },
      { label: "Toast", path: "/toast" },
    ],
  },
  {
    group: "Layout",
    items: [
      { label: "ScrollArea", path: "/scroll-area" },
    ],
  },
  {
    group: "Form (custom)",
    items: [
      { label: "Input", path: "/input" },
      { label: "NumberField", path: "/number-field" },
      { label: "TagInput", path: "/tag-input" },
      { label: "PhoneInput", path: "/phone-input" },
      { label: "InputOTP", path: "/otp" },
      { label: "FileUpload", path: "/file-upload" },
    ],
  },
  {
    group: "Data",
    items: [
      { label: "DataTable", path: "/data-table" },
      { label: "Combobox", path: "/combobox" },
      { label: "MultiCombobox", path: "/multi-combobox" },
      { label: "VirtualizedItems", path: "/lazy-options" },
    ],
  },
];

const App: Component<ParentProps> = (props) => {
  const { theme, setTheme, themes } = useTheme();
  return (
    <div class="min-h-full flex bg-zen-background text-zen-foreground">
      <aside class="w-60 shrink-0 border-r border-zen-border p-4 flex flex-col gap-4">
        <div>
          <div class="text-lg font-semibold">Zen UI · Solid</div>
          <div class="text-xs text-zen-muted-fg">@algorisys/zen-ui-solid</div>
        </div>

        <label class="text-xs flex flex-col gap-1">
          <span class="text-zen-muted-fg">Theme</span>
          <select
            class="rounded-zen-md border border-zen-border px-2 py-1 text-sm bg-zen-background"
            value={theme()}
            onChange={(e) => setTheme(e.currentTarget.value as never)}
          >
            <For each={themes}>
              {(t) => <option value={t.name}>{t.label}</option>}
            </For>
          </select>
        </label>

        <nav class="flex flex-col gap-4 mt-2">
          <For each={NAV}>
            {(group) => (
              <div>
                <div class="text-xs uppercase tracking-wide text-zen-muted-fg mb-1">
                  {group.group}
                </div>
                <ul class="flex flex-col gap-0.5">
                  <For each={group.items}>
                    {(item) => (
                      <li>
                        <A
                          href={item.path}
                          class="block px-2 py-1.5 rounded-zen-sm text-sm text-zen-foreground hover:bg-zen-muted"
                          activeClass="bg-zen-primary-soft text-zen-primary-soft-fg"
                          end
                        >
                          {item.label}
                        </A>
                      </li>
                    )}
                  </For>
                </ul>
              </div>
            )}
          </For>
        </nav>
      </aside>

      <main class="flex-1 p-8 overflow-x-hidden">{props.children}</main>
    </div>
  );
};

export default App;
