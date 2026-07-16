import { Search } from "./form/search/search";
import { DemoPage } from "./demo-helpers";

const FRUITS = ["Apple", "Apricot", "Banana", "Blueberry", "Cherry", "Grape", "Lemon", "Mango", "Orange", "Peach"];

export default function SearchDemo(): HTMLElement {
  return DemoPage({
    title: "Search",
    description:
      "A search field as one component instead of a pattern reinvented per screen. Magnifier, a type='search' input (role='searchbox'), and a keyboard-reachable clear button that shows only when there is text. zen-ui inlined this affordance seven times before it was extracted here.",
    sections: [
      {
        title: "Basic",
        codeTitle: "Uncontrolled",
        code: `const s = Search({ placeholder: "Search components" });\ndocument.body.append(s.el);`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.width = "100%";
          wrap.style.maxWidth = "360px";
          wrap.append(Search({ placeholder: "Search components" }).el);
          return wrap;
        },
      },
      {
        title: "Controlled, with live filtering",
        codeTitle: "value + onValueChange",
        code: `Search({\n  placeholder: "Filter fruit…",\n  onValueChange: (q) => renderList(q),\n});`,
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

          const search = Search({ placeholder: "Filter fruit…", onValueChange: renderList });
          renderList("");
          wrap.append(search.el, list);
          return wrap;
        },
      },
      {
        title: "Sizes",
        codeTitle: "sm / md / lg",
        code: `Search({ size: "sm", placeholder: "Small" });\nSearch({ size: "md", placeholder: "Medium (default)" });\nSearch({ size: "lg", placeholder: "Large" });`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.className = "zen-grid zen-gap-2.5 zen-w-full";
          wrap.style.maxWidth = "360px";
          wrap.append(
            Search({ size: "sm", placeholder: "Small" }).el,
            Search({ size: "md", placeholder: "Medium (default)" }).el,
            Search({ size: "lg", placeholder: "Large" }).el,
          );
          return wrap;
        },
      },
      {
        title: "Disabled",
        codeTitle: "disabled",
        code: `Search({ disabled: true, defaultValue: "Read only" });`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.width = "100%";
          wrap.style.maxWidth = "360px";
          wrap.append(Search({ disabled: true, defaultValue: "Read only" }).el);
          return wrap;
        },
      },
    ],
  });
}
