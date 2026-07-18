import { Combobox, type ComboboxOption } from "./combobox/combobox";
import { DemoPage } from "./demo-helpers";

/* -------------------------- sample data --------------------------- */
const FRAMEWORKS: ComboboxOption[] = [
  { value: "next", label: "Next.js", keywords: ["vercel", "react"] },
  { value: "sveltekit", label: "SvelteKit", keywords: ["svelte"] },
  { value: "nuxt", label: "Nuxt", keywords: ["vue"] },
  { value: "remix", label: "Remix", keywords: ["react", "router"] },
  { value: "astro", label: "Astro", keywords: ["static"] },
  { value: "solid-start", label: "SolidStart", keywords: ["solid"] },
  { value: "qwik", label: "Qwik", keywords: ["resumability"] },
];

// Larger list for the fuzzy-filter demo
const NAMES: ComboboxOption[] = Array.from({ length: 500 }, (_, i) => ({
  value: `n-${i}`,
  label: `Contact #${i + 1}`,
}));

// Simulated remote search — returns results after a fake network delay
const fakeSearch = async (query: string): Promise<ComboboxOption[]> => {
  await new Promise((r) => setTimeout(r, 400 + Math.random() * 300));
  const q = query.trim().toLowerCase();
  if (!q) {
    // Default "starter" list
    return NAMES.slice(0, 10);
  }
  return NAMES.filter((n) => n.label.toLowerCase().includes(q)).slice(0, 30);
};

const mutedNote = (): HTMLParagraphElement => {
  const p = document.createElement("p");
  p.className = "zen-m-0 zen-text-xs zen-text-zen-muted-fg";
  return p;
};

const valueSpan = (): HTMLSpanElement => {
  const s = document.createElement("span");
  s.style.marginLeft = "12px";
  s.style.fontSize = "0.8125rem";
  s.style.color = "var(--zen-color-muted-fg)";
  return s;
};

export default function ComboboxDemo(): HTMLElement {
  return DemoPage({
    title: "Combobox + Async select",
    description:
      "Searchable single-select — the search input, the fuzzy filter, the roving highlight and the keyboard are written out where React leans on cmdk; the panel, its dismissal and its animation are select.ts's Popover half. Sync (in-memory) and async (server-driven with debounce + abort) share one component: pass `options` or `onSearch`.",
    sections: [
      {
        title: "0. Creatable",
        codeTitle: "Offer the typed text when it matches nothing",
        codeDescription:
          "Type a tag that does not exist — 'design', say — and the list offers to create it instead of saying 'No results'. Adding the option is always yours: the component cannot know where your list lives or what a new value should be. RETURN the new option and it is selected for you; return nothing and the value is left alone. Typing an existing label offers nothing, because it already exists.",
        code: `const tags = [{ value: "bug", label: "bug" }, …];

const box = Combobox({
  options: tags,
  value: tag,
  onValueChange: (v) => { tag = v; box.update({ value: tag }); },
  creatable: true,
  onCreate: (label) => {
    const opt = { value: label.toLowerCase(), label };
    tags = [...tags, opt];          // adding is always yours
    box.update({ options: tags });
    return opt;                     // returning it selects it for you
  },
});`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.display = "flex";
          wrap.style.flexDirection = "column";
          wrap.style.gap = "10px";

          let tags: ComboboxOption[] = [
            { value: "bug", label: "bug" },
            { value: "docs", label: "docs" },
          ];
          let tag = "";
          const note = mutedNote();
          const paintNote = () => {
            note.textContent = `tags → ${tags.map((t) => t.label).join(", ")}`;
          };

          const box = Combobox({
            options: tags,
            value: tag,
            onValueChange: (v) => {
              tag = v;
              box.update({ value: tag });
            },
            creatable: true,
            onCreate: (label) => {
              const opt = { value: label.toLowerCase(), label };
              tags = [...tags, opt];
              box.update({ options: tags });
              paintNote();
              return opt;
            },
            placeholder: "Pick or create a tag",
            searchPlaceholder: "Type a tag…",
          });

          paintNote();
          wrap.append(box.el, note);
          return wrap;
        },
      },
      {
        title: "1. Basic — in-memory options",
        codeTitle: "Static list, fuzzy-filtered as you type",
        code: `const options = [
  { value: "next", label: "Next.js" },
  { value: "sveltekit", label: "SvelteKit" },
  ...
];

const box = Combobox({
  options,
  value,
  onValueChange: (v) => { value = v; box.update({ value }); },
  placeholder: "Pick a framework",
});`,
        render: () => {
          let picked = "";
          const out = valueSpan();
          const box = Combobox({
            options: FRAMEWORKS,
            value: picked,
            onValueChange: (v) => {
              picked = v;
              box.update({ value: picked });
              out.textContent = `value: ${picked || "(none)"}`;
            },
            placeholder: "Pick a framework",
            searchPlaceholder: "Search frameworks…",
          });
          out.textContent = "value: (none)";
          return [box.el, out];
        },
      },
      {
        title: "2. With keywords — extra fuzzy-match terms",
        codeTitle: "Per-option keywords boost the filter",
        codeDescription:
          "Type 'vercel' or 'router' — the filter matches via the keywords array even though the label doesn't contain those words.",
        code: `Combobox({
  options: [
    { value: "next", label: "Next.js", keywords: ["vercel", "react"] },
    { value: "remix", label: "Remix", keywords: ["react", "router"] },
    ...
  ],
})`,
        render: () =>
          Combobox({
            options: FRAMEWORKS,
            placeholder: "Search by alias",
            searchPlaceholder: "Try 'vercel' or 'router'…",
          }).el,
      },
      {
        title: "3. 500-option list — filters fast",
        codeTitle: "A few hundred items without virtualization",
        codeDescription:
          "For ≥ 5,000 items you'd combine Combobox with VirtualizedItems on the result list.",
        code: `Combobox({ options: makeOptions(500), width: 280 })`,
        render: () => {
          let picked = "";
          const box = Combobox({
            options: NAMES,
            value: picked,
            onValueChange: (v) => {
              picked = v;
              box.update({ value: picked });
            },
            placeholder: "Pick a contact",
            width: 280,
          });
          return box.el;
        },
      },
      {
        title: "4. Async — server-driven search",
        codeTitle: "Pass onSearch instead of options",
        codeDescription:
          "Debounced, stale-request-aborted, with loading + empty states. Try typing slowly to see the loader.",
        code: `Combobox({
  value,
  onValueChange: (v) => { value = v; box.update({ value }); },
  onSearch: async (query) => {
    const res = await fetch(\`/api/contacts?q=\${query}\`);
    return res.json();        // [{ value, label }]
  },
  debounceMs: 250,
  searchPlaceholder: "Search contacts…",
})`,
        render: () => {
          let picked = "";
          const out = valueSpan();
          const box = Combobox({
            value: picked,
            onValueChange: (v) => {
              picked = v;
              box.update({ value: picked });
              out.textContent = `value: ${picked || "(none)"}`;
            },
            onSearch: fakeSearch,
            placeholder: "Search the server",
            searchPlaceholder: "Type to query…",
            width: 280,
            debounceMs: 250,
          });
          out.textContent = "value: (none)";
          return [box.el, out];
        },
      },
      {
        title: "5. Disabled options",
        codeTitle: "Per-option disabled flag",
        code: `Combobox({
  options: [
    { value: "free", label: "Free" },
    { value: "pro",  label: "Pro" },
    { value: "team", label: "Team (waitlist)", disabled: true },
  ],
})`,
        render: () =>
          Combobox({
            options: [
              { value: "free", label: "Free" },
              { value: "pro", label: "Pro" },
              { value: "team", label: "Team (waitlist)", disabled: true },
            ],
            placeholder: "Choose a plan",
          }).el,
      },
      {
        title: "6. Disabled trigger",
        codeTitle: "Whole combobox disabled",
        code: `Combobox({ options, disabled: true })`,
        render: () => Combobox({ options: FRAMEWORKS, disabled: true, placeholder: "Locked" }).el,
      },
    ],
  });
}
