<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# code-editor — API (React, the parity reference)

Exports: `CodeEditor`, `IDEWindow`, `CODE_LANGUAGES`, `CodeEditorProps`, `IDEWindowProps`, `CodeFile`, `CodeLanguage`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-code-editor>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### CodeEditor

- `value?: string | undefined`
- `onChange?: ((value: string) => void) | undefined`
- `language?: CodeLanguage | undefined` — Monaco language id. Defaults to `plaintext` so an unset one is never a guess.
- `theme?: "dark" | "light" | undefined` — Follows the zen theme when omitted.
- `fontSize?: number | undefined` — px. Default 14.
- `readOnly?: boolean | undefined`
- `height?: string | undefined` — CSS height for the editor box. Default `"24rem"`.
- `minimap?: boolean | undefined` — Off by default — it costs horizontal room and helps only in long files.
- `lineNumbers?: boolean | undefined`
- `onRun?: ((value: string) => void) | undefined` — Wired to Ctrl/Cmd+Enter as well as any button you render.
- `options?: Record<string, any> | undefined` — Raw Monaco options, merged over the defaults. Everything not named above lives here rather than being re-exported one prop at a time.
- `onMount?: ((editor: any, monaco: any) => void) | undefined` — Monaco's own `onMount`, for a caller that needs the editor instance.
- `loading?: React.ReactNode` — Shown while Monaco loads.
- `className?: string | undefined`

### IDEWindow

- `files: CodeFile[]`
- `activePath?: string | undefined` — Controlled active path.
- `defaultActivePath?: string | undefined`
- `onActivePathChange?: ((path: string) => void) | undefined`
- `onFileChange?: ((path: string, content: string) => void) | undefined`
- `toolbar?: React.ReactNode` — Toolbar slot — a Run button, a language picker, whatever the screen needs.
- `className?: string | undefined`
- `height?: string | undefined` — CSS height for the editor box. Default `"24rem"`.
- `options?: Record<string, any> | undefined` — Raw Monaco options, merged over the defaults. Everything not named above lives here rather than being re-exported one prop at a time.
- `loading?: React.ReactNode` — Shown while Monaco loads.
- `fontSize?: number | undefined` — px. Default 14.
- `theme?: "dark" | "light" | undefined` — Follows the zen theme when omitted.
- `minimap?: boolean | undefined` — Off by default — it costs horizontal room and helps only in long files.
- `lineNumbers?: boolean | undefined`
- `onRun?: ((value: string) => void) | undefined` — Wired to Ctrl/Cmd+Enter as well as any button you render.
- `onMount?: ((editor: any, monaco: any) => void) | undefined` — Monaco's own `onMount`, for a caller that needs the editor instance.

### CodeFile (type)

- `path: string` — Unique; also the display name. Use a path for a tree, e.g. `src/app.ts`.
- `content: string`
- `language?: CodeLanguage | undefined`
- `readOnly?: boolean | undefined` — Shows an "RO" badge and locks the editor on this file.

### CodeLanguage (type)

- …plus the underlying element's standard props (50 inherited).

### Other exports

- `CODE_LANGUAGES: readonly ["javascript", "typescript", "python", "java", "csharp", "go", "rust", "elixir", "ruby", "php", "sql", "html", "css", "json", "yaml", "markdown", "shell", "plaintext"]`

### Types

- `CodeEditorProps` — type (see the component above)
- `IDEWindowProps` — type (see the component above)
