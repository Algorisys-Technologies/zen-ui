import { MultiCombobox, type ComboboxOption } from "./combobox/multi-combobox";
import { DemoPage } from "./demo-helpers";

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
          (o) =>
            o.label.toLowerCase().includes(needle) ||
            o.value.toLowerCase().includes(needle),
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
        code: `const [tags, setTags] = useState([{ value: "bug", label: "bug" }, …]);
const [picked, setPicked] = useState<string[]>([]);

<MultiCombobox
  options={tags}
  value={picked}
  onValueChange={setPicked}
  creatable
  onCreate={(label) => {
    const opt = { value: label.toLowerCase(), label };
    setTags((prev) => [...prev, opt]);   // adding is always yours
    return opt;                           // returning it appends to the selection
  }}
/>`,
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

          const mc = MultiCombobox({
            options: tags,
            value: picked,
            onValueChange: (v) => {
              picked = v;
              mc.update({ value: picked });
              paint();
            },
            creatable: true,
            onCreate: (label) => {
              const opt = { value: label.toLowerCase(), label };
              tags = [...tags, opt];
              mc.update({ options: tags });
              return opt;
            },
            placeholder: "Pick or create tags",
            searchPlaceholder: "Type a tag…",
            width: 280,
          });
          paint();

          return column(mc.el, info);
        },
      },
      {
        title: "1. Synchronous — pick multiple roles",
        codeTitle: "value as string[] + onValueChange",
        code: `const [roles, setRoles] = useState<string[]>(["engineer", "designer"]);

<MultiCombobox
  options={ROLES}
  value={roles}
  onValueChange={setRoles}
  placeholder="Pick roles"
/>`,
        render: () => {
          let roles: string[] = ["engineer", "designer"];
          const info = note();
          const paint = () => {
            info.replaceChildren(document.createTextNode("Picked: "));
            const code = document.createElement("code");
            code.textContent = JSON.stringify(roles);
            info.append(code);
          };

          const mc = MultiCombobox({
            options: ROLES,
            value: roles,
            onValueChange: (v) => {
              roles = v;
              mc.update({ value: roles });
              paint();
            },
            placeholder: "Pick roles",
            width: 320,
          });
          paint();

          return column(mc.el, info);
        },
      },
      {
        title: '2. Overflow — many selections collapse into "+N more"',
        codeTitle: "maxDisplayed (default 3) caps chips in the trigger",
        codeDescription:
          "Selected items beyond the cap appear as '+N more' so the trigger doesn't grow unbounded. Click the trigger to see / remove items from inside the popover (or click a chip's ✕).",
        code: `<MultiCombobox
  options={COUNTRIES}
  value={countries}
  onValueChange={setCountries}
  maxDisplayed={2}
/>`,
        render: () => {
          let countries: string[] = [];
          const info = note();
          const paint = () => {
            info.textContent =
              countries.length === 0
                ? "Pick a few countries to see the +N overflow"
                : `Picked: ${countries.join(", ")}`;
          };

          const mc = MultiCombobox({
            options: COUNTRIES,
            value: countries,
            onValueChange: (v) => {
              countries = v;
              mc.update({ value: countries });
              paint();
            },
            placeholder: "Pick countries",
            maxDisplayed: 2,
            width: 320,
          });
          paint();

          return column(mc.el, info);
        },
      },
      {
        title: "3. Async — server-driven option loading",
        codeTitle: "onSearch replaces options; same debounce + abort-on-stale as Combobox",
        codeDescription:
          "The label-cache lets chips keep their human label even after the async result page rotates to a different query.",
        code: `<MultiCombobox
  onSearch={async (q) => {
    const res = await fetch(\`/api/users?q=\${q}\`);
    return res.json();
  }}
  value={users}
  onValueChange={setUsers}
  debounceMs={300}
/>`,
        render: () => {
          let users: string[] = [];
          const info = note();
          const paint = () => {
            info.textContent = `Picked ${users.length} user(s). Try typing then clearing the query — chips keep their labels even when the underlying option list rotates.`;
          };

          const mc = MultiCombobox({
            onSearch: fakeSearch,
            value: users,
            onValueChange: (v) => {
              users = v;
              mc.update({ value: users });
              paint();
            },
            placeholder: "Assign users",
            debounceMs: 300,
            width: 360,
          });
          paint();

          return column(mc.el, info);
        },
      },
      {
        title: "4. Uncontrolled + clear-all",
        codeTitle: 'defaultValue + the built-in "Clear all" affordance',
        codeDescription:
          "When ≥ 1 item is selected, a Clear all button shows at the bottom of the popover. Toggle off via showClearAll={false} if you want to hide it.",
        code: `<MultiCombobox
  options={ROLES}
  defaultValue={["engineer", "pm"]}
  placeholder="Pick roles"
/>`,
        render: () =>
          MultiCombobox({
            options: ROLES,
            defaultValue: ["engineer", "pm"],
            placeholder: "Pick roles",
            width: 300,
          }).el,
      },
      {
        title: "5. Disabled",
        codeTitle: "disabled locks the whole control",
        code: `<MultiCombobox options={ROLES} defaultValue={["engineer"]} disabled />`,
        render: () =>
          MultiCombobox({
            options: ROLES,
            defaultValue: ["engineer"],
            disabled: true,
            placeholder: "Locked",
            width: 280,
          }).el,
      },
    ],
  });
}
