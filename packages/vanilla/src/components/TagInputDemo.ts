import { TagInput } from "./form/tag-input/tag-input";
import { Badge } from "./badge/badge";
import { DemoPage } from "./demo-helpers";

const SUGGESTED_SKILLS = ["react", "typescript", "node", "design", "sql"];

/** Small helper — the `max-width: 480px` wrapper every section shares. */
function frame(...children: Node[]): HTMLDivElement {
  const wrap = document.createElement("div");
  wrap.style.maxWidth = "480px";
  wrap.append(...children);
  return wrap;
}

function note(): HTMLParagraphElement {
  const p = document.createElement("p");
  p.className = "zen-text-xs zen-text-zen-muted-fg zen-mt-2 zen-m-0";
  return p;
}

export default function TagInputDemo(): HTMLElement {
  return DemoPage({
    title: "TagInput",
    description:
      "Type + Enter commits the current input as a chip. Backspace on empty removes the trailing chip. Paste splits on commas (or any delimiters you pass). Common ask in onboarding / journey apps for skills, interests, comma-separated email lists, structured-but-open tag fields.",
    sections: [
      {
        title: "1. Default",
        codeTitle: "Uncontrolled — internal state, just listen via onValueChange",
        code: `<TagInput
  defaultValue={["react", "typescript"]}
  placeholder="Add a skill…"
  onValueChange={(skills) => console.log(skills)}
/>`,
        render: () => {
          let skills = ["react", "typescript"];

          const info = note();
          const strong = document.createElement("strong");
          const code = document.createElement("code");
          const em = document.createElement("em");
          em.textContent =
            "Type something and press Enter; press Backspace on an empty input to remove the trailing chip.";
          info.append(
            strong,
            document.createTextNode(" skill(s): "),
            code,
            document.createElement("br"),
            em,
          );

          const paint = () => {
            strong.textContent = String(skills.length);
            code.textContent = JSON.stringify(skills);
          };

          const ti = TagInput({
            value: skills,
            onValueChange: (next) => {
              skills = next;
              ti.update({ value: skills });
              paint();
            },
            placeholder: "Add a skill…",
            inputAriaLabel: "Skills",
          });
          paint();

          return frame(ti.el, info);
        },
      },
      {
        title: "2. Paste-friendly — comma-separated email list",
        codeTitle: 'Paste "a@x.com, b@x.com, c@x.com" — splits into 3 chips',
        codeDescription:
          "The paste handler splits on the configured delimiters (default `,`) + newlines + tabs. Single-token pastes drop into the input as normal.",
        code: `<TagInput
  value={emails}
  onValueChange={setEmails}
  delimiters={[",", ";"]}
  validate={(e) => /^[^@]+@[^@]+$/.test(e)}
  placeholder="Invite by email"
/>`,
        render: () => {
          let emails: string[] = [];

          const info = note();
          info.append(
            document.createTextNode(
              "Validator rejects anything that doesn't look like an email — the candidate stays in the input so you can fix it instead of losing the typing. Try pasting: ",
            ),
          );
          const code = document.createElement("code");
          code.textContent = "ada@x.com, alan@x.com, grace@x.com";
          info.append(code);

          const ti = TagInput({
            value: emails,
            onValueChange: (next) => {
              emails = next;
              ti.update({ value: emails });
            },
            delimiters: [",", ";"],
            validate: (e) => /^[^@]+@[^@]+\.[^@]+$/.test(e),
            placeholder: "Invite by email — paste a comma list",
            inputAriaLabel: "Email addresses",
          });

          return frame(ti.el, info);
        },
      },
      {
        title: "3. Capped at N tags",
        codeTitle: "max stops further commits",
        code: `<TagInput max={3} value={tags} onValueChange={setTags} />`,
        render: () => {
          let tags: string[] = [];

          const info = note();

          const ti = TagInput({
            value: tags,
            onValueChange: (next) => {
              tags = next;
              ti.update({
                value: tags,
                placeholder: tags.length >= 3 ? "Limit reached" : "Up to 3 tags",
              });
              paint();
            },
            max: 3,
            placeholder: "Up to 3 tags",
          });

          const paint = () => {
            info.textContent = `${tags.length} / 3`;
          };
          paint();

          return frame(ti.el, info);
        },
      },
      {
        title: "4. Suggested tags below",
        codeTitle: "Pair the input with a row of one-click suggestions",
        codeDescription:
          "The TagInput primitive doesn't render suggestions — they're caller-managed, since the data source varies (autocomplete API, recent searches, popular tags). Render a Badge row underneath and call the update loop on click.",
        code: `<TagInput value={skills} onValueChange={setSkills} />
<div className="flex flex-wrap gap-1.5 mt-2">
  {SUGGESTIONS
    .filter(s => !skills.includes(s))
    .map(s => (
      <Badge asChild key={s} variant="outline">
        <button onClick={() => setSkills([...skills, s])}>+ {s}</button>
      </Badge>
    ))}
</div>`,
        render: () => {
          let skills: string[] = [];

          const suggestions = document.createElement("div");
          suggestions.style.marginTop = "8px";
          suggestions.style.display = "flex";
          suggestions.style.flexWrap = "wrap";
          suggestions.style.gap = "6px";

          const ti = TagInput({
            value: skills,
            onValueChange: (next) => {
              skills = next;
              ti.update({ value: skills });
              paintSuggestions();
            },
            placeholder: "Add a skill…",
          });

          const paintSuggestions = () => {
            suggestions.replaceChildren(
              ...SUGGESTED_SKILLS.filter((s) => !skills.includes(s)).map((s) => {
                const badge = Badge({
                  as: "button",
                  variant: "outline",
                  color: "neutral",
                  children: `+ ${s}`,
                });
                const btn = badge.el as HTMLButtonElement;
                btn.type = "button";
                btn.style.background = "transparent";
                btn.style.border = "none";
                btn.style.cursor = "pointer";
                btn.addEventListener("click", () => {
                  skills = [...skills, s];
                  ti.update({ value: skills });
                  paintSuggestions();
                });
                return btn;
              }),
            );
          };
          paintSuggestions();

          return frame(ti.el, suggestions);
        },
      },
      {
        title: "5. Disabled",
        codeTitle: "disabled locks the whole control out",
        code: `<TagInput defaultValue={["read-only", "tags"]} disabled />`,
        render: () => frame(TagInput({ defaultValue: ["read-only", "locked"], disabled: true }).el),
      },
    ],
  });
}
