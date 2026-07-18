import { DemoPage } from "./demo-helpers";

/**
 * Search demo — the web-components port. <zen-search> renders a magnifier, a
 * type="search" input and a keyboard-reachable clear button. `zen-value-change`
 * fires with the current query string; `zen-clear` fires when cleared.
 */

const FRUITS = ["Apple", "Apricot", "Banana", "Blueberry", "Cherry", "Grape", "Lemon", "Mango", "Orange", "Peach"];

function search(attrs: Record<string, string> = {}): HTMLElement {
  const s = document.createElement("zen-search");
  for (const [k, v] of Object.entries(attrs)) s.setAttribute(k, v);
  return s;
}

export default function SearchDemo(): HTMLElement {
  return DemoPage({
    title: "Search",
    description:
      "A search field as one component instead of a pattern reinvented per screen. Magnifier, a type='search' input (role='searchbox'), and a keyboard-reachable clear button that shows only when there is text. zen-ui inlined this affordance seven times before it was extracted here.",
    sections: [
      {
        title: "Basic",
        codeTitle: "Uncontrolled",
        code: `<zen-search placeholder="Search components"></zen-search>`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.width = "100%";
          wrap.style.maxWidth = "360px";
          wrap.append(search({ placeholder: "Search components" }));
          return wrap;
        },
      },
      {
        title: "Controlled, with live filtering",
        codeTitle: "zen-value-change",
        code: `<zen-search placeholder="Filter fruit…"></zen-search>

const s = document.querySelector("zen-search");
s.addEventListener("zen-value-change", (e) => renderList(e.detail));`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.width = "100%";
          wrap.style.maxWidth = "360px";

          const list = document.createElement("ul");
          list.className = "zen-mt-3 zen-grid zen-gap-1 zen-text-sm";

          const renderList = (q: string) => {
            const matches = FRUITS.filter((f) => f.toLowerCase().includes(q.toLowerCase()));
            if (matches.length > 0) {
              list.replaceChildren(
                ...matches.map((m) => {
                  const li = document.createElement("li");
                  li.textContent = m;
                  return li;
                }),
              );
            } else {
              const li = document.createElement("li");
              li.className = "zen-text-zen-muted-fg";
              li.textContent = `No matches for “${q}”.`;
              list.replaceChildren(li);
            }
          };

          const s = search({ placeholder: "Filter fruit…" });
          s.addEventListener("zen-value-change", (e) => renderList((e as CustomEvent).detail as string));
          renderList("");
          wrap.append(s, list);
          return wrap;
        },
      },
      {
        title: "Sizes",
        codeTitle: "sm / md / lg",
        code: `<zen-search size="sm" placeholder="Small"></zen-search>
<zen-search size="md" placeholder="Medium (default)"></zen-search>
<zen-search size="lg" placeholder="Large"></zen-search>`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.className = "zen-grid zen-gap-2.5 zen-w-full";
          wrap.style.maxWidth = "360px";
          wrap.append(
            search({ size: "sm", placeholder: "Small" }),
            search({ size: "md", placeholder: "Medium (default)" }),
            search({ size: "lg", placeholder: "Large" }),
          );
          return wrap;
        },
      },
      {
        title: "Disabled",
        codeTitle: "disabled",
        code: `<zen-search disabled default-value="Read only"></zen-search>`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.width = "100%";
          wrap.style.maxWidth = "360px";
          wrap.append(search({ disabled: "", "default-value": "Read only" }));
          return wrap;
        },
      },
    ],
  });
}
