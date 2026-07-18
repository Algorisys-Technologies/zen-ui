import { useState } from "react";
import { TagInput } from "./form/tag-input/tag-input";
import { Badge } from "./badge/badge";
import { CodeExample } from "./demo-helpers";

const SUGGESTED_SKILLS = ["react", "typescript", "node", "design", "sql"];

const NewTagInputDemo: React.FC = () => {
  const [skills, setSkills] = useState<string[]>(["react", "typescript"]);
  const [emails, setEmails] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  return (
    <div className="demo-page">
      <h1>TagInput</h1>
      <p className="lede">
        Type + Enter commits the current input as a chip. Backspace on
        empty removes the trailing chip. Paste splits on commas (or any{" "}
        <code>delimiters</code> you pass). Common ask in onboarding /
        journey apps for skills, interests, comma-separated email
        lists, structured-but-open tag fields.
      </p>

      <section className="demo-section">
        <h2>1. Default</h2>
        <CodeExample
          title="Uncontrolled — internal state, just listen via onValueChange"
          code={`<TagInput
  defaultValue={["react", "typescript"]}
  placeholder="Add a skill…"
  onValueChange={(skills) => console.log(skills)}
/>`}
        >
          <div style={{ maxWidth: 480 }}>
            <TagInput
              value={skills}
              onValueChange={setSkills}
              placeholder="Add a skill…"
              inputAriaLabel="Skills"
            />
            <p className="zen-text-xs zen-text-zen-muted-fg zen-mt-2 zen-m-0">
              <strong>{skills.length}</strong> skill(s):{" "}
              <code>{JSON.stringify(skills)}</code>
              <br />
              <em>Type something and press Enter; press Backspace on
                an empty input to remove the trailing chip.</em>
            </p>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Paste-friendly — comma-separated email list</h2>
        <CodeExample
          title='Paste "a@x.com, b@x.com, c@x.com" — splits into 3 chips'
          description={`The paste handler splits on the configured delimiters (default \`,\`) + newlines + tabs. Single-token pastes drop into the input as normal.`}
          code={`<TagInput
  value={emails}
  onValueChange={setEmails}
  delimiters={[",", ";"]}
  validate={(e) => /^[^@]+@[^@]+$/.test(e)}
  placeholder="Invite by email"
/>`}
        >
          <div style={{ maxWidth: 480 }}>
            <TagInput
              value={emails}
              onValueChange={setEmails}
              delimiters={[",", ";"]}
              validate={(e) => /^[^@]+@[^@]+\.[^@]+$/.test(e)}
              placeholder="Invite by email — paste a comma list"
              inputAriaLabel="Email addresses"
            />
            <p className="zen-text-xs zen-text-zen-muted-fg zen-mt-2 zen-m-0">
              Validator rejects anything that doesn't look like an
              email — the candidate stays in the input so you can fix
              it instead of losing the typing. Try pasting:{" "}
              <code>ada@x.com, alan@x.com, grace@x.com</code>
            </p>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. Capped at N tags</h2>
        <CodeExample
          title="max stops further commits"
          code={`<TagInput max={3} value={tags} onValueChange={setTags} />`}
        >
          <div style={{ maxWidth: 480 }}>
            <TagInput
              value={tags}
              onValueChange={setTags}
              max={3}
              placeholder={tags.length >= 3 ? "Limit reached" : "Up to 3 tags"}
            />
            <p className="zen-text-xs zen-text-zen-muted-fg zen-mt-2 zen-m-0">
              {tags.length} / 3
            </p>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. Suggested tags below</h2>
        <CodeExample
          title="Pair the input with a row of one-click suggestions"
          description="The TagInput primitive doesn't render suggestions — they're caller-managed, since the data source varies (autocomplete API, recent searches, popular tags). Render a Badge row underneath and call setSkills([...skills, tag]) on click."
          code={`<TagInput value={skills} onValueChange={setSkills} />
<div className="flex flex-wrap gap-1.5 mt-2">
  {SUGGESTIONS
    .filter(s => !skills.includes(s))
    .map(s => (
      <Badge asChild key={s} variant="outline">
        <button onClick={() => setSkills([...skills, s])}>+ {s}</button>
      </Badge>
    ))}
</div>`}
        >
          <div style={{ maxWidth: 480 }}>
            <TagInput
              value={skills}
              onValueChange={setSkills}
              placeholder="Add a skill…"
            />
            <div
              style={{
                marginTop: 8,
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
              }}
            >
              {SUGGESTED_SKILLS.filter((s) => !skills.includes(s)).map((s) => (
                <Badge asChild key={s} variant="outline" color="neutral">
                  <button
                    type="button"
                    onClick={() => setSkills([...skills, s])}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    + {s}
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>5. Disabled</h2>
        <CodeExample
          title="disabled locks the whole control out"
          code={`<TagInput defaultValue={["read-only", "tags"]} disabled />`}
        >
          <div style={{ maxWidth: 480 }}>
            <TagInput defaultValue={["read-only", "locked"]} disabled />
          </div>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewTagInputDemo;
