import { DemoPage } from "./demo-helpers";

/**
 * Mirrors the vanilla TagInputDemo, rendered through <zen-tag-input>. The tags
 * array is the primary collection: set `el.value = [...]` (or author
 * `value='[…]'`). `delimiters`/`validate` are JS properties; `placeholder`, `max`
 * and `input-aria-label` are attributes; onValueChange maps to zen-value-change.
 */
const SUGGESTED_SKILLS = ["react", "typescript", "node", "design", "sql"];

function el(
  tag: string,
  attrs: Record<string, string | number | boolean> = {},
  text?: string,
): HTMLElement {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === false) continue;
    n.setAttribute(k, v === true ? "" : String(v));
  }
  if (text != null) n.textContent = text;
  return n;
}

/** Set a JS property on a custom element without fighting the typechecker. */
function prop(node: HTMLElement, name: string, value: unknown): void {
  (node as unknown as Record<string, unknown>)[name] = value;
}

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
        codeTitle: "Uncontrolled — listen via zen-value-change",
        code: `<zen-tag-input value='["react","typescript"]'
  placeholder="Add a skill…" input-aria-label="Skills"></zen-tag-input>
<script>
  el.addEventListener("zen-value-change", (e) => console.log(e.detail));
</script>`,
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

          const ti = el("zen-tag-input", {
            placeholder: "Add a skill…",
            "input-aria-label": "Skills",
          });
          prop(ti, "value", skills);
          ti.addEventListener("zen-value-change", (e) => {
            skills = (e as CustomEvent<string[]>).detail;
            prop(ti, "value", skills);
            paint();
          });
          paint();

          return frame(ti, info);
        },
      },
      {
        title: "2. Paste-friendly — comma-separated email list",
        codeTitle: 'Paste "a@x.com, b@x.com, c@x.com" — splits into 3 chips',
        codeDescription:
          "The paste handler splits on the configured delimiters (default `,`) + newlines + tabs. Single-token pastes drop into the input as normal.",
        code: `const el = document.createElement("zen-tag-input");
el.delimiters = [",", ";"];
el.validate = (e) => /^[^@]+@[^@]+$/.test(e);
el.setAttribute("placeholder", "Invite by email");`,
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

          const ti = el("zen-tag-input", {
            placeholder: "Invite by email — paste a comma list",
            "input-aria-label": "Email addresses",
          });
          prop(ti, "value", emails);
          prop(ti, "delimiters", [",", ";"]);
          prop(ti, "validate", (e: string) => /^[^@]+@[^@]+\.[^@]+$/.test(e));
          ti.addEventListener("zen-value-change", (e) => {
            emails = (e as CustomEvent<string[]>).detail;
            prop(ti, "value", emails);
          });

          return frame(ti, info);
        },
      },
      {
        title: "3. Capped at N tags",
        codeTitle: "max stops further commits",
        code: `<zen-tag-input max="3" placeholder="Up to 3 tags"></zen-tag-input>`,
        render: () => {
          let tags: string[] = [];

          const info = note();

          const ti = el("zen-tag-input", { max: 3, placeholder: "Up to 3 tags" });
          prop(ti, "value", tags);
          const paint = () => {
            info.textContent = `${tags.length} / 3`;
          };
          ti.addEventListener("zen-value-change", (e) => {
            tags = (e as CustomEvent<string[]>).detail;
            prop(ti, "value", tags);
            ti.setAttribute("placeholder", tags.length >= 3 ? "Limit reached" : "Up to 3 tags");
            paint();
          });
          paint();

          return frame(ti, info);
        },
      },
      {
        title: "4. Suggested tags below",
        codeTitle: "Pair the input with a row of one-click suggestions",
        codeDescription:
          "The TagInput element doesn't render suggestions — they're caller-managed. Render a Badge row underneath and push into the value on click.",
        code: `<zen-tag-input></zen-tag-input>
<div class="suggestions">
  <zen-badge variant="outline">+ react</zen-badge>
  <zen-badge variant="outline">+ sql</zen-badge>
</div>`,
        render: () => {
          let skills: string[] = [];

          const suggestions = document.createElement("div");
          suggestions.style.marginTop = "8px";
          suggestions.style.display = "flex";
          suggestions.style.flexWrap = "wrap";
          suggestions.style.gap = "6px";

          const ti = el("zen-tag-input", { placeholder: "Add a skill…" });
          prop(ti, "value", skills);

          const paintSuggestions = () => {
            suggestions.replaceChildren(
              ...SUGGESTED_SKILLS.filter((s) => !skills.includes(s)).map((s) => {
                const badge = el("zen-badge", { variant: "outline", color: "neutral" }, `+ ${s}`);
                badge.style.cursor = "pointer";
                badge.addEventListener("click", () => {
                  skills = [...skills, s];
                  prop(ti, "value", skills);
                  paintSuggestions();
                });
                return badge;
              }),
            );
          };
          ti.addEventListener("zen-value-change", (e) => {
            skills = (e as CustomEvent<string[]>).detail;
            prop(ti, "value", skills);
            paintSuggestions();
          });
          paintSuggestions();

          return frame(ti, suggestions);
        },
      },
      {
        title: "5. Disabled",
        codeTitle: "disabled locks the whole control out",
        code: `<zen-tag-input value='["read-only","locked"]' disabled></zen-tag-input>`,
        render: () => {
          const ti = el("zen-tag-input", { disabled: true });
          prop(ti, "defaultValue", ["read-only", "locked"]);
          return frame(ti);
        },
      },
    ],
  });
}
