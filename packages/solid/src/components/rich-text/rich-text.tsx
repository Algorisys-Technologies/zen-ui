/* eslint-disable @typescript-eslint/no-explicit-any */
import { createEffect, createMemo, createSignal, on, onCleanup, onMount, Show } from "solid-js";
import { cn } from "../../lib/cn";

/**
 * RichText — WYSIWYG editor wrapping `jodit` (an OPTIONAL peer dependency).
 * Lazy-loaded so it never weighs on consumers who don't edit rich text.
 * Install `jodit` to use it, and import its CSS once in your app:
 * `import "jodit/es2021/jodit.min.css"`.
 *
 *   <RichText value={html()} onChange={setHtml} placeholder="Write…" />
 *
 * `onChange` fires on blur (Jodit's recommended commit point — its
 * per-keystroke event is noisy and can fight controlled state).
 *
 * The React binding reaches for `jodit-pro-react`; Jodit's own package is
 * vanilla JS, so Solid drives it directly and `config` keeps the same meaning.
 * If Jodit is absent, the import failure is caught and this degrades to a plain
 * contentEditable surface — same props, no toolbar — with a hint naming the
 * package to install. React crashes the tree in that case; this does not.
 */

export interface RichTextProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  /** raw Jodit config, merged over the defaults */
  config?: Record<string, any>;
  class?: string;
}

export const RichText = (props: RichTextProps) => {
  const [status, setStatus] = createSignal<"loading" | "jodit" | "fallback">("loading");

  let mountPoint: HTMLDivElement | undefined;
  let fallbackEl: HTMLDivElement | undefined;
  let editor: any = null;

  const value = () => props.value ?? "";

  const editorConfig = createMemo(() => ({
    readonly: false,
    placeholder: props.placeholder ?? "",
    // Jodit's beforeInitHook fetches `<basePath>config.js` when
    // loadExternalConfig is on (its default), so every RichText mount fired a
    // request for a file zen-ui does not ship and never will — a guaranteed 404
    // in the console of any app using it. Nothing reads the response; turning it
    // off removes a failed request per mount and nothing else. A caller who DOES
    // host a jodit config can turn it back on through `config`, since theirs is
    // spread after this.
    loadExternalConfig: false,
    ...props.config,
  }));

  onMount(async () => {
    let mod: any;
    try {
      mod = await import("jodit");
    } catch {
      // Optional dep missing — degrade instead of throwing past the caller.
      setStatus("fallback");
      return;
    }
    const Jodit = mod?.Jodit ?? mod?.default?.Jodit;
    if (!mountPoint || typeof Jodit?.make !== "function") {
      setStatus("fallback");
      return;
    }
    try {
      editor = Jodit.make(mountPoint, editorConfig());
    } catch {
      setStatus("fallback");
      return;
    }
    editor.value = value();
    editor.events.on("blur", () => props.onChange?.(editor.value));
    setStatus("jodit");
  });

  onCleanup(() => {
    editor?.destruct?.();
    editor = null;
  });

  // Controlled-value sync. Only push when the value genuinely differs, or every
  // keystroke round-trips through the editor and the caret jumps to the end.
  createEffect(
    on(value, (html) => {
      if (editor && editor.value !== html) editor.value = html;
      if (fallbackEl && fallbackEl.innerHTML !== html) fallbackEl.innerHTML = html;
    }),
  );

  // Jodit reads config at construction; rebuilding on every config change would
  // blow away editor state, so later changes are ignored — same as React, where
  // `config` is passed once per mount by JoditEditor.

  return (
    <div class={props.class}>
      <Show when={status() !== "loading"}>
        <Show when={status() === "fallback"}>
          <div
            class="zen-mb-2 zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-muted zen-px-3 zen-py-2 zen-text-xs zen-text-zen-muted-fg"
            role="status"
          >
            Rich-text toolbar unavailable — run <code>npm install jodit</code> and import{" "}
            <code>jodit/es2021/jodit.min.css</code>. Editing still works below as plain text.
          </div>
        </Show>
      </Show>

      <Show when={status() === "loading"}>
        <div class="zen-text-sm zen-text-zen-muted-fg">Loading editor…</div>
      </Show>

      {/*
        Two nodes on purpose. Jodit takes ownership of the inner div and sets
        its own `display` on it; visibility is toggled on the outer wrapper so
        Solid never clears what Jodit wrote. The inner node must already exist
        when onMount runs.
      */}
      <div style={{ display: status() === "jodit" ? undefined : "none" }}>
        <div ref={mountPoint} />
      </div>

      <Show when={status() === "fallback"}>
        <div
          ref={(el) => {
            fallbackEl = el;
            // Seed on attach: the sync effect below ran at mount, long before
            // this node existed, and `fallbackEl` is not reactive.
            el.innerHTML = value();
          }}
          contentEditable
          role="textbox"
          aria-multiline="true"
          aria-label={props.placeholder}
          data-placeholder={props.placeholder}
          class={cn(
            "zen-min-h-32 zen-w-full zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-p-3 zen-text-sm zen-text-zen-foreground",
            "focus:zen-outline-none focus:zen-ring-2 focus:zen-ring-zen-ring focus:zen-ring-offset-2",
            "empty:before:zen-text-zen-muted-fg empty:before:zen-content-[attr(data-placeholder)]",
          )}
          onBlur={(e) => props.onChange?.(e.currentTarget.innerHTML)}
        />
      </Show>
    </div>
  );
};
