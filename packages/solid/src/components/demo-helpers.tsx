import type { JSX, ParentProps } from "solid-js";

/**
 * Tiny shared shells used by NewXxxDemo.tsx pages. Mirrors the structure
 * of packages/react/src/components/demo-helpers.tsx without trying to
 * be feature-complete.
 */

export const DemoPage = (
  props: ParentProps<{ title: string; description?: string }>,
) => (
  <div>
    <header class="mb-6">
      <h1 class="text-2xl font-semibold m-0">{props.title}</h1>
      {props.description ? (
        <p class="text-zen-muted-fg mt-1 max-w-2xl">{props.description}</p>
      ) : null}
    </header>
    <div class="flex flex-col gap-8">{props.children}</div>
  </div>
);

export const DemoSection = (
  props: ParentProps<{ title: string; description?: string }>,
) => (
  <section>
    <div class="text-xs uppercase tracking-wide text-zen-muted-fg mb-1">
      {props.title}
    </div>
    {props.description ? (
      <div class="text-sm text-zen-muted-fg mb-3 max-w-2xl">
        {props.description}
      </div>
    ) : null}
    <div class="flex flex-wrap gap-3 items-center">{props.children}</div>
  </section>
);

export const Row = (props: { children: JSX.Element }) => (
  <div class="flex flex-wrap gap-3 items-center">{props.children}</div>
);

/**
 * CodeExample — card showing a live preview + the code that produced it,
 * with a copy-to-clipboard button. Mirrors the React binding's
 * CodeExample so the Solid demos read identically.
 */
import { createSignal } from "solid-js";

export const CodeExample = (props: {
  title: string;
  description?: string;
  code: string;
  children?: JSX.Element;
  previewStyle?: JSX.CSSProperties;
}) => {
  const [copied, setCopied] = createSignal(false);
  const handleCopy = () => {
    navigator.clipboard
      .writeText(props.code)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {});
  };
  return (
    <div class="rounded-zen-md border border-zen-border overflow-hidden">
      <div class="flex items-start justify-between gap-3 px-4 py-3 border-b border-zen-border bg-zen-muted/30">
        <div>
          <h3 class="m-0 text-sm font-semibold">{props.title}</h3>
          {props.description ? (
            <p class="m-0 mt-1 text-xs text-zen-muted-fg max-w-2xl">
              {props.description}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          class={`text-xs px-2 py-1 rounded-zen-sm border border-zen-border bg-zen-background hover:bg-zen-muted cursor-pointer ${
            copied() ? "text-zen-success" : ""
          }`}
        >
          {copied() ? "✓ Copied" : "Copy Code"}
        </button>
      </div>
      {props.children ? (
        <div class="p-4 bg-zen-background" style={props.previewStyle}>
          {props.children}
        </div>
      ) : null}
      <pre class="m-0 px-4 py-3 text-xs bg-zen-muted/40 overflow-x-auto leading-relaxed border-t border-zen-border">
        <code>{props.code}</code>
      </pre>
    </div>
  );
};
