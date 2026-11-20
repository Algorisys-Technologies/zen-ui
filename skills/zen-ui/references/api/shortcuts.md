<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# shortcuts — API (React, the parity reference)

Exports: `ShortcutProvider`, `ShortcutHelp`, `Kbd`, `useShortcut`, `useShortcuts`, `keyshortcut`, `shortcutLabel`, `detectPlatform`, `ShortcutOptions`, `ShortcutProviderProps`, `ShortcutHelpProps`, `ShortcutHelpGroup`, `KbdProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-shortcuts>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### ShortcutProvider

- `children?: React.ReactNode`
- `platform?: Platform | undefined` — Override the detected platform (tests, a demo showing both).

### ShortcutHelp

- `openKey?: string | null | undefined` — The key that opens it. Default "?". Pass null to open it only through `open`.
- `open?: boolean | undefined`
- `onOpenChange?: ((open: boolean) => void) | undefined`
- `extra?: ShortcutHelpGroup[] | undefined` — Keys handled elsewhere (a table's arrows, a form's own keys), listed after the registered ones.
- `title?: string | undefined`

### Kbd

- `keys: string` — A chord, drawn as key caps spelled for this platform: "Mod+K" is Ctrl K, or ⌘ K on a Mac.
- `platform?: Platform | undefined` — Override the platform (a demo showing both).
- …plus the underlying element's standard props (280 inherited).

### ShortcutOptions (type)

- `description?: string | undefined` — What it does, for the help overlay: "Save", "Close the tab".
- `group?: string | undefined` — The help overlay's heading it goes under: "Forms", "Tabs". Default "General".
- `within?: (() => Element | null | undefined) | React.RefObject<Element | null> | undefined` — Only while focus is inside this element. Wins over a global shortcut on the same keys. A function returning the element (as in Solid), or a ref to it.
- `allowInFields?: boolean | undefined` — Also while typing in a field (a chord with Mod or Alt usually wants this).
- `enabled?: (() => boolean) | undefined` — Turned off while this returns false.
- `hidden?: boolean | undefined` — Left out of the help overlay (a key that is an implementation detail).

### ShortcutHelpGroup (type)

- `title: string`
- `where?: string | undefined` — Where these keys work, when the title does not say.
- `shortcuts: { keys: string[]; description: string; }[]`

### Other exports

- `useShortcut(text: string, handler: (e: KeyboardEvent) => void, options?: ShortcutOptions): void`
- `useShortcuts(): ShortcutRegistry | undefined`
- `keyshortcut(text: string, platform?: Platform): string`
- `shortcutLabel(text: string, platform?: Platform): string`
- `detectPlatform(): Platform`

### Types

- `ShortcutProviderProps` — type (see the component above)
- `ShortcutHelpProps` — type (see the component above)
- `KbdProps` — type (see the component above)
