import type { ComboboxOption } from "@algorisys/zen-ui-vanilla";
import { DemoPage } from "./demo-helpers";

/**
 * MultiCombobox demo — the web-components port. <zen-multi-combobox> takes its
 * `options` / `value` / `defaultValue` / `onSearch` / `onCreate` as JS properties
 * (arrays and functions can't be attributes) and fires `zen-value-change` with the
 * next string[]. String settings (placeholder, width, max-displayed) are attributes.
 */

const ROLES: ComboboxOption[] = [
  { value: "engineer", label: "Engineer" },
  { value: "designer", label: "Designer" },
  { value: "pm", label: "Product Manager" },
  { value: "sales", label: "Sales" },
  { value: "support", label: "Support" },
  { value: "marketing", label: "Marketing" },
  { value: "ops", label: "Operations" },
  { value: "finance", label: "Finance" },
];

const COUNTRIES: ComboboxOption[] = [
  { value: "in", label: "India", keywords: ["IN"] },
  { value: "us", label: "United States", keywords: ["USA", "America"] },
  { value: "gb", label: "United Kingdom", keywords: ["UK", "Britain"] },
  { value: "de", label: "Germany", keywords: ["DE"] },
  { value: "fr", label: "France", keywords: ["FR"] },
  { value: "jp", label: "Japan", keywords: ["JP"] },
  { value: "br", label: "Brazil", keywords: ["BR"] },
  { value: "au", label: "Australia", keywords: ["AU"] },
];

/* Fake server lookup for the async demo: filter a large in-memory list after a
 * 300ms delay. */
const ALL_USERS: ComboboxOption[] = Array.from({ length: 200 }, (_, i) => ({
  value: `user-${i + 1}`,
  label: `User ${i + 1}`,
  keywords: [`u${i + 1}`],
}));
const fakeSearch = (q: string): Promise<ComboboxOption[]> =>
  new Promise((res) =>
    setTimeout(() => {
      const needle = q.toLowerCase();
      res(
        ALL_USERS.filter(
          (o) => o.label.toLowerCase().includes(needle) || o.value.toLowerCase().includes(needle),
        ).slice(0, 30),
      );
    }, 300),
  );

/** Small helper — a vertical stack for a control plus its status line. */
function column(...children: Node[]): HTMLElement {
  const w = document.createElement("div");
  w.style.display = "flex";
  w.style.flexDirection = "column";
  w.style.gap = "8px";
  w.append(...children);
  return w;
}

function note(): HTMLParagraphElement {
  const p = document.createElement("p");
  p.className = "zen-text-xs zen-text-zen-muted-fg zen-m-0";
  return p;
}

interface MCProps {
  options?: ComboboxOption[];
  value?: string[];
  defaultValue?: string[];
  onSearch?: (q: string) => Promise<ComboboxOption[]>;
  onCreate?: (label: string) => ComboboxOption;
  placeholder?: string;
  searchPlaceholder?: string;
  creatable?: boolean;
  maxDisplayed?: number;
  debounceMs?: number;
  disabled?: boolean;
  width?: string;
}

function multiCombobox(props: MCProps): HTMLElement {
  const el = document.createElement("zen-multi-combobox");
  if (props.placeholder) el.setAttribute("placeholder", props.placeholder);
  if (props.searchPlaceholder) el.setAttribute("search-placeholder", props.searchPlaceholder);
  if (props.creatable) el.setAttribute("creatable", "");
  if (props.maxDisplayed != null) el.setAttribute("max-displayed", String(props.maxDisplayed));
  if (props.debounceMs != null) el.setAttribute("debounce-ms", String(props.debounceMs));
  if (props.disabled) el.setAttribute("disabled", "");
  if (props.width) el.setAttribute("width", props.width);
  const p = el as unknown as Record<string, unknown>;
  if (props.options) p.options = props.options;
  if (props.value) p.value = props.value;
  if (props.defaultValue) p.defaultValue = props.defaultValue;
  if (props.onSearch) p.onSearch = props.onSearch;
  if (props.onCreate) p.onCreate = props.onCreate;
  return el;
}

export default function MultiComboboxDemo(): HTMLElement {
  return DemoPage({
    title: "MultiCombobox",
    description:
      "Multi-select sibling of Combobox. Selected options render as removable chips inside the trigger; clicking an option in the popover toggles it instead of closing. Same sync / async option-loading story.",
    sections: [
      {
        title: "0. Creatable",
        codeTitle: "Create a tag and keep going",
        codeDescription:
          "Same contract as Combobox, one difference that follows from the selection model: returning the new option APPENDS it to the selection rather than replacing it, and the popover stays open — creating one tag usually means creating another. Adding the option to your list is still yours.",
        code: `const mc = document.querySelector("zen-multi-combobox");
mc.options = tags;
mc.creatable = true;
mc.onCreate = (label) => {
  const opt = { value: label.toLowerCase(), label };
  mc.options = [...tags, opt];   // adding is always yours
  return opt;                    // returning it appends to the selection
};
mc.addEventListener("zen-value-change", (e) => { mc.value = e.detail; });`,
        render: () => {
          let tags: ComboboxOption[] = [
            { value: "bug", label: "bug" },
            { value: "docs", label: "docs" },
          ];
          let picked: string[] = [];

          const info = note();
          const paint = () => {
            info.replaceChildren();
            const selCode = document.createElement("code");
            selCode.textContent = picked.join(", ") || "none";
            const tagCode = document.createElement("code");
            tagCode.textContent = tags.map((t) => t.label).join(", ");
            info.append(
              document.createTextNode("selected → "),
              selCode,
              document.createTextNode("  ·  all tags → "),
              tagCode,
            );
          };

          const mc = multiCombobox({
            options: tags,
            value: picked,
            creatable: true,
            placeholder: "Pick or create tags",
            searchPlaceholder: "Type a tag…",
            width: "280px",
          });
          const p = mc as unknown as Record<string, unknown>;
          p.onCreate = (label: string) => {
            const opt = { value: label.toLowerCase(), label };
            tags = [...tags, opt];
            p.options = tags;
            return opt;
          };
          mc.addEventListener("zen-value-change", (e) => {
            picked = (e as CustomEvent).detail as string[];
            p.value = picked;
            paint();
          });
          paint();

          return column(mc, info);
        },
      },
      {
        title: "1. Synchronous — pick multiple roles",
        codeTitle: "value as string[] + zen-value-change",
        code: `const mc = document.querySelector("zen-multi-combobox");
mc.options = ROLES;
mc.value = ["engineer", "designer"];
mc.addEventListener("zen-value-change", (e) => { mc.value = e.detail; });`,
        render: () => {
          let roles: string[] = ["engineer", "designer"];
          const info = note();
          const paint = () => {
            info.replaceChildren(document.createTextNode("Picked: "));
            const code = document.createElement("code");
            code.textContent = JSON.stringify(roles);
            info.append(code);
          };

          const mc = multiCombobox({
            options: ROLES,
            value: roles,
            placeholder: "Pick roles",
            width: "320px",
          });
          mc.addEventListener("zen-value-change", (e) => {
            roles = (e as CustomEvent).detail as string[];
            (mc as unknown as { value: string[] }).value = roles;
            paint();
          });
          paint();

          return column(mc, info);
        },
      },
      {
        title: '2. Overflow — many selections collapse into "+N more"',
        codeTitle: "max-displayed (default 3) caps chips in the trigger",
        codeDescription:
          "Selected items beyond the cap appear as '+N more' so the trigger doesn't grow unbounded. Click the trigger to see / remove items from inside the popover (or click a chip's ✕).",
        code: `<zen-multi-combobox max-displayed="2"></zen-multi-combobox>
mc.options = COUNTRIES;`,
        render: () => {
          let countries: string[] = [];
          const info = note();
          const paint = () => {
            info.textContent =
              countries.length === 0
                ? "Pick a few countries to see the +N overflow"
                : `Picked: ${countries.join(", ")}`;
          };

          const mc = multiCombobox({
            options: COUNTRIES,
            value: countries,
            placeholder: "Pick countries",
            maxDisplayed: 2,
            width: "320px",
          });
          mc.addEventListener("zen-value-change", (e) => {
            countries = (e as CustomEvent).detail as string[];
            (mc as unknown as { value: string[] }).value = countries;
            paint();
          });
          paint();

          return column(mc, info);
        },
      },
      {
        title: "3. Async — server-driven option loading",
        codeTitle: "onSearch replaces options; same debounce + abort-on-stale as Combobox",
        codeDescription:
          "The label-cache lets chips keep their human label even after the async result page rotates to a different query.",
        code: `const mc = document.querySelector("zen-multi-combobox");
mc.debounceMs = 300;
mc.onSearch = async (q) => (await fetch(\`/api/users?q=\${q}\`)).json();
mc.addEventListener("zen-value-change", (e) => { mc.value = e.detail; });`,
        render: () => {
          let users: string[] = [];
          const info = note();
          const paint = () => {
            info.textContent = `Picked ${users.length} user(s). Try typing then clearing the query — chips keep their labels even when the underlying option list rotates.`;
          };

          const mc = multiCombobox({
            onSearch: fakeSearch,
            value: users,
            placeholder: "Assign users",
            debounceMs: 300,
            width: "360px",
          });
          mc.addEventListener("zen-value-change", (e) => {
            users = (e as CustomEvent).detail as string[];
            (mc as unknown as { value: string[] }).value = users;
            paint();
          });
          paint();

          return column(mc, info);
        },
      },
      {
        title: "4. Uncontrolled + clear-all",
        codeTitle: 'defaultValue + the built-in "Clear all" affordance',
        codeDescription:
          "When ≥ 1 item is selected, a Clear all button shows at the bottom of the popover. Toggle off via showClearAll = false if you want to hide it.",
        code: `const mc = document.querySelector("zen-multi-combobox");
mc.options = ROLES;
mc.defaultValue = ["engineer", "pm"];`,
        render: () =>
          multiCombobox({
            options: ROLES,
            defaultValue: ["engineer", "pm"],
            placeholder: "Pick roles",
            width: "300px",
          }),
      },
      {
        title: "5. Disabled",
        codeTitle: "disabled locks the whole control",
        code: `<zen-multi-combobox disabled></zen-multi-combobox>
mc.options = ROLES;
mc.defaultValue = ["engineer"];`,
        render: () =>
          multiCombobox({
            options: ROLES,
            defaultValue: ["engineer"],
            disabled: true,
            placeholder: "Locked",
            width: "280px",
          }),
      },
    ],
  });
}
