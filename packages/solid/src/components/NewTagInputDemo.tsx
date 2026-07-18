import { createSignal } from "solid-js";
import { TagInput } from "./form/tag-input/tag-input";
import { DemoPage, DemoSection } from "./demo-helpers";

const NewTagInputDemo = () => {
  const [tags, setTags] = createSignal<string[]>(["solid", "kobalte"]);
  return (
    <DemoPage
      title="TagInput"
      description="Chip input. Enter / Tab / comma commits; Backspace removes."
    >
      <DemoSection
        title="Controlled"
        codeTitle="value + onValueChange"
        codeDescription="Enter / Tab / comma commits the typed text; Backspace on an empty input removes the trailing chip; pasting a comma list commits every item at once."
        code={`const [tags, setTags] = createSignal<string[]>(["solid", "kobalte"]);

<TagInput value={tags()} onValueChange={setTags} placeholder="Add a skill…" />`}
      >
        <div class="zen-w-96">
          <TagInput value={tags()} onValueChange={setTags} placeholder="Add a skill…" />
        </div>
      </DemoSection>
      <DemoSection
        title="Max 3 + unique"
        codeTitle="max caps the tag count; unique defaults to true"
        codeDescription="Uncontrolled here — defaultValue seeds the internal state. Commits past max are no-ops, and duplicates are dropped silently."
        code={`<TagInput defaultValue={["a"]} max={3} placeholder="Up to 3 unique tags" />`}
      >
        <div class="zen-w-96">
          <TagInput defaultValue={["a"]} max={3} placeholder="Up to 3 unique tags" />
        </div>
      </DemoSection>
    </DemoPage>
  );
};

export default NewTagInputDemo;
