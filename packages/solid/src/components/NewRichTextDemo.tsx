import { createSignal } from "solid-js";
import { RichText } from "./rich-text/rich-text";
import { DemoPage, DemoSection } from "./demo-helpers";
// Jodit renders its toolbar from its own stylesheet; without it the icons have
// no width and expand to fill the pane. The component JSDoc documents this
// requirement — the demo has to actually honour it.
import "jodit/es2021/jodit.min.css";

const NewRichTextDemo = () => {
  const [html, setHtml] = createSignal("<p>Hello from <strong>zen-ui</strong> 👋</p>");

  return (
    <DemoPage
      title="RichText"
      description="WYSIWYG editor wrapping jodit (an optional peer dependency, lazy-loaded on first render). onChange fires on blur (Jodit's recommended commit point). Install jodit and import its CSS once — import 'jodit/es2021/jodit.min.css'. If Jodit is absent this degrades to a plain contentEditable surface rather than crashing."
    >
      <DemoSection
        title="1. Controlled editor"
        codeTitle="value / onChange"
        code={`const [html, setHtml] = createSignal("<p>Hello…</p>");

<RichText value={html()} onChange={setHtml} placeholder="Write something…" />`}
      >
        <div class="zen-w-full">
          <RichText value={html()} onChange={setHtml} placeholder="Write something…" />
        </div>
      </DemoSection>

      <DemoSection
        title="2. Current HTML"
        codeTitle="onChange output (updates on blur)"
        code={`// html state`}
      >
        <pre class="zen-m-0 zen-w-full zen-overflow-x-auto zen-rounded-zen-md zen-bg-zen-muted zen-p-3 zen-text-xs zen-text-zen-foreground">
          {html()}
        </pre>
      </DemoSection>
    </DemoPage>
  );
};

export default NewRichTextDemo;
