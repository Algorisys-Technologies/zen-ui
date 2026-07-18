import type { ComboboxOption } from "@algorisys/zen-ui-vanilla";
import { DemoPage } from "./demo-helpers";

/**
 * Combobox demo — the web-components mirror of the vanilla ComboboxDemo. Renders
 * <zen-combobox>; `options` and the `onSearch`/`onCreate` functions are set as JS
 * properties, and zen-value-change carries [value, option] in its detail.
 */

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
  if (!q) return NAMES.slice(0, 10);
  return NAMES.filter((n) => n.label.toLowerCase().includes(q)).slice(0, 30);
};

function el(tag: string, attrs: Record<string, string> = {}): HTMLElement {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  return n;
}

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

/** Read the (value, option) pair out of a zen-value-change event. */
const pairOf = (e: Event): [string, ComboboxOption | undefined] =>
  (e as CustomEvent<[string, ComboboxOption | undefined]>).detail;

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
        code: `const box = document.createElement("zen-combobox");
box.setAttribute("creatable", "");
box.options = tags;              // [{ value, label }, …]
box.onCreate = (label) => {
  const opt = { value: label.toLowerCase(), label };
  tags = [...tags, opt];         // adding is always yours
  box.options = tags;
  return opt;                    // returning it selects it for you
};`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.display = "flex";
          wrap.style.flexDirection = "column";
          wrap.style.gap = "10px";

          let tags: ComboboxOption[] = [
            { value: "bug", label: "bug" },
            { value: "docs", label: "docs" },
          ];
          const note = mutedNote();
          const paintNote = () => {
            note.textContent = `tags → ${tags.map((t) => t.label).join(", ")}`;
          };

          const box = el("zen-combobox", {
            value: "",
            creatable: "",
            placeholder: "Pick or create a tag",
            "search-placeholder": "Type a tag…",
          });
          (box as unknown as { options: ComboboxOption[] }).options = tags;
          box.addEventListener("zen-value-change", (e) => {
            box.setAttribute("value", pairOf(e)[0]);
          });
          (box as unknown as { onCreate: (label: string) => ComboboxOption }).onCreate = (label) => {
            const opt = { value: label.toLowerCase(), label };
            tags = [...tags, opt];
            (box as unknown as { options: ComboboxOption[] }).options = tags;
            paintNote();
            return opt;
          };

          paintNote();
          wrap.append(box, note);
          return wrap;
        },
      },
      {
        title: "1. Basic — in-memory options",
        codeTitle: "Static list, fuzzy-filtered as you type",
        code: `const box = document.createElement("zen-combobox");
box.options = [
  { value: "next", label: "Next.js" },
  { value: "sveltekit", label: "SvelteKit" },
  ...
];
box.setAttribute("placeholder", "Pick a framework");`,
        render: () => {
          const out = valueSpan();
          const box = el("zen-combobox", {
            value: "",
            placeholder: "Pick a framework",
            "search-placeholder": "Search frameworks…",
          });
          (box as unknown as { options: ComboboxOption[] }).options = FRAMEWORKS;
          box.addEventListener("zen-value-change", (e) => {
            const v = pairOf(e)[0];
            box.setAttribute("value", v);
            out.textContent = `value: ${v || "(none)"}`;
          });
          out.textContent = "value: (none)";
          return [box, out];
        },
      },
      {
        title: "2. With keywords — extra fuzzy-match terms",
        codeTitle: "Per-option keywords boost the filter",
        codeDescription:
          "Type 'vercel' or 'router' — the filter matches via the keywords array even though the label doesn't contain those words.",
        code: `box.options = [
  { value: "next", label: "Next.js", keywords: ["vercel", "react"] },
  { value: "remix", label: "Remix", keywords: ["react", "router"] },
  ...
];`,
        render: () => {
          const box = el("zen-combobox", {
            placeholder: "Search by alias",
            "search-placeholder": "Try 'vercel' or 'router'…",
          });
          (box as unknown as { options: ComboboxOption[] }).options = FRAMEWORKS;
          return box;
        },
      },
      {
        title: "3. 500-option list — filters fast",
        codeTitle: "A few hundred items without virtualization",
        codeDescription:
          "For ≥ 5,000 items you'd combine Combobox with VirtualizedItems on the result list.",
        code: `box.options = makeOptions(500);
box.setAttribute("width", "280");`,
        render: () => {
          const box = el("zen-combobox", {
            value: "",
            placeholder: "Pick a contact",
            width: "280",
          });
          (box as unknown as { options: ComboboxOption[] }).options = NAMES;
          box.addEventListener("zen-value-change", (e) => box.setAttribute("value", pairOf(e)[0]));
          return box;
        },
      },
      {
        title: "4. Async — server-driven search",
        codeTitle: "Pass onSearch instead of options",
        codeDescription:
          "Debounced, stale-request-aborted, with loading + empty states. Try typing slowly to see the loader.",
        code: `const box = document.createElement("zen-combobox");
box.setAttribute("debounce-ms", "250");
box.onSearch = async (query) => {
  const res = await fetch(\`/api/contacts?q=\${query}\`);
  return res.json();             // [{ value, label }]
};`,
        render: () => {
          const out = valueSpan();
          const box = el("zen-combobox", {
            value: "",
            placeholder: "Search the server",
            "search-placeholder": "Type to query…",
            width: "280",
            "debounce-ms": "250",
          });
          (box as unknown as { onSearch: typeof fakeSearch }).onSearch = fakeSearch;
          box.addEventListener("zen-value-change", (e) => {
            const v = pairOf(e)[0];
            box.setAttribute("value", v);
            out.textContent = `value: ${v || "(none)"}`;
          });
          out.textContent = "value: (none)";
          return [box, out];
        },
      },
      {
        title: "5. Disabled options",
        codeTitle: "Per-option disabled flag",
        code: `box.options = [
  { value: "free", label: "Free" },
  { value: "pro",  label: "Pro" },
  { value: "team", label: "Team (waitlist)", disabled: true },
];`,
        render: () => {
          const box = el("zen-combobox", { placeholder: "Choose a plan" });
          (box as unknown as { options: ComboboxOption[] }).options = [
            { value: "free", label: "Free" },
            { value: "pro", label: "Pro" },
            { value: "team", label: "Team (waitlist)", disabled: true },
          ];
          return box;
        },
      },
      {
        title: "6. Disabled trigger",
        codeTitle: "Whole combobox disabled",
        code: `<zen-combobox disabled placeholder="Locked"></zen-combobox>`,
        render: () => {
          const box = el("zen-combobox", { disabled: "", placeholder: "Locked" });
          (box as unknown as { options: ComboboxOption[] }).options = FRAMEWORKS;
          return box;
        },
      },
    ],
  });
}
