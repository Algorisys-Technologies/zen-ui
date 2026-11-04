import {
  type JSX,
  type Accessor,
  For,
  Show,
  createContext,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
  splitProps,
  useContext,
} from "solid-js";
import {
  ariaKeyshortcut,
  chordLabel,
  chordParts,
  isReservedChord,
  isTypingTarget,
  matchesChord,
  parseChord,
  sameChord,
  type Chord,
  type Platform,
} from "@algorisys/zen-ui-core/keys";
import { cn } from "../../lib/cn";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../dialog/dialog";
import { useLocale } from "../locale/locale";

/**
 * Keyboard shortcuts as a system: one list of every key the app answers, so
 * a help overlay (`?`) can show them, tooltips and menus can name them, and two
 * features cannot quietly take the same key.
 *
 *   <ShortcutProvider>
 *     <App />
 *     <ShortcutHelp />                      // "?" opens it
 *   </ShortcutProvider>
 *
 *   useShortcut("Mod+S", save, { description: "Save", group: "Forms" });
 *   useShortcut("Alt+W", closeTab, { description: "Close the tab", group: "Tabs", within: () => workspace });
 *   <Button aria-keyshortcuts={keyshortcut("Mod+S")}>Save <Kbd keys="Mod+S" /></Button>
 *
 * Chords are written once ("Mod+K": Ctrl, or ⌘ on a Mac) and the pure half is
 * @algorisys/zen-ui-core/keys (check:keys). One keydown listener for the whole
 * app; a shortcut `within` an element answers only while focus is inside it,
 * and wins over a global one with the same keys. Plain keys typed into a field
 * stay the field's unless a shortcut says `allowInFields`. A chord the browser
 * keeps (Ctrl+T, Ctrl+W, F5…) is refused with a warning, as is a second
 * shortcut on the same keys in the same place.
 */

export interface ShortcutOptions {
  /** What it does, for the help overlay: "Save", "Close the tab". */
  description?: string;
  /** The help overlay's heading it goes under: "Forms", "Tabs". Default "General". */
  group?: string;
  /** Only while focus is inside this element. Wins over a global shortcut on the same keys. */
  within?: () => Element | null | undefined;
  /** Also while typing in a field (a chord with Mod or Alt usually wants this). */
  allowInFields?: boolean;
  /** Turned off while this returns false. */
  enabled?: () => boolean;
  /** Left out of the help overlay (a key that is an implementation detail). */
  hidden?: boolean;
}

interface Registration extends ShortcutOptions {
  id: number;
  text: string;
  chord: Chord;
  handler: (e: KeyboardEvent) => void;
}

interface ShortcutRegistry {
  platform: Platform;
  register: (r: Omit<Registration, "id" | "chord">) => () => void;
  list: Accessor<Registration[]>;
}

const ShortcutContext = createContext<ShortcutRegistry>();

/** The platform, for spelling and matching: a Mac, or everything else. */
export function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "other";
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  const p = nav.userAgentData?.platform ?? navigator.platform ?? navigator.userAgent ?? "";
  return /mac|iphone|ipad|ipod/i.test(p) ? "mac" : "other";
}

export type ShortcutProviderProps = {
  children?: JSX.Element;
  /** Override the detected platform (tests, a demo showing both). */
  platform?: Platform;
};

export const ShortcutProvider = (props: ShortcutProviderProps) => {
  // eslint-disable-next-line solid/reactivity -- fixed for the app's life
  const platform = props.platform ?? detectPlatform();
  const [list, setList] = createSignal<Registration[]>([]);
  let next = 1;

  const register: ShortcutRegistry["register"] = (r) => {
    const chord = parseChord(r.text);
    if (isReservedChord(chord, platform)) {
      console.warn(`[zen-ui shortcuts] "${r.text}" is kept by the browser or the system; it was not registered.`);
      return () => {};
    }
    const clash = list().find((o) => sameChord(o.chord, chord, platform) && !!o.within === !!r.within && (!r.within || o.within?.() === r.within?.()));
    if (clash) {
      console.warn(`[zen-ui shortcuts] "${r.text}" (${r.description ?? "no description"}) is already "${clash.description ?? clash.text}" in the same place; the first one keeps it.`);
    }
    const entry: Registration = { ...r, id: next++, chord };
    setList((l) => [...l, entry]);
    return () => setList((l) => l.filter((x) => x.id !== entry.id));
  };

  onMount(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.isComposing) return;
      const target = e.target as Element | null;
      const typing = isTypingTarget(target);
      const candidates = list().filter(
        (r) => (r.enabled?.() ?? true) && (!typing || r.allowInFields) && matchesChord(e, r.chord, platform),
      );
      if (candidates.length === 0) return;
      // Innermost first: a shortcut scoped to where focus is wins over a global one.
      const scoped = candidates.filter((r) => {
        const el = r.within?.();
        return !!el && !!target && el.contains(target);
      });
      const pick = scoped.length ? scoped[scoped.length - 1] : candidates.find((r) => !r.within);
      if (!pick) return;
      e.preventDefault();
      pick.handler(e);
    };
    document.addEventListener("keydown", onKey);
    onCleanup(() => document.removeEventListener("keydown", onKey));
  });

  return (
    <ShortcutContext.Provider value={{ platform, register, list }}>{props.children}</ShortcutContext.Provider>
  );
};

/** The registry and platform, for a component that lists or spells shortcuts. */
export function useShortcuts(): ShortcutRegistry | undefined {
  return useContext(ShortcutContext);
}

/**
 * Answer a key while this component is mounted. Released when it unmounts.
 * Outside a ShortcutProvider it does nothing (and says so once, in development).
 */
export function useShortcut(text: string, handler: (e: KeyboardEvent) => void, options: ShortcutOptions = {}) {
  const registry = useContext(ShortcutContext);
  if (!registry) {
    console.warn(`[zen-ui shortcuts] useShortcut("${text}") outside a ShortcutProvider does nothing.`);
    return;
  }
  onMount(() => {
    const release = registry.register({ text, handler, ...options });
    onCleanup(release);
  });
}

/** A chord's aria-keyshortcuts value on this platform: put it on the control the shortcut acts as. */
export function keyshortcut(text: string, platform: Platform = detectPlatform()): string {
  return ariaKeyshortcut(parseChord(text), platform);
}

/** A chord spelled for a tooltip on this platform: "Ctrl+S", "⌘S". */
export function shortcutLabel(text: string, platform: Platform = detectPlatform()): string {
  return chordLabel(parseChord(text), platform);
}

export type KbdProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "class"> & {
  /** A chord, drawn as key caps spelled for this platform: "Mod+K" is Ctrl K, or ⌘ K on a Mac. */
  keys: string;
  /** Override the platform (a demo showing both). */
  platform?: Platform;
  class?: string;
};

/**
 * Key caps for a chord. The caps are drawn for the eye; the group is named by
 * the chord as words ("Ctrl+K", "⌘K") so it reads as one thing.
 */
export const Kbd = (props: KbdProps) => {
  const [local, rest] = splitProps(props, ["keys", "platform", "class"]);
  const registry = useContext(ShortcutContext);
  const platform = () => local.platform ?? registry?.platform ?? detectPlatform();
  const parts = createMemo(() => chordParts(parseChord(local.keys), platform()));
  return (
    <span
      role="group"
      aria-label={chordLabel(parseChord(local.keys), platform())}
      class={cn("zen-inline-flex zen-items-center zen-gap-0.5 zen-align-middle", local.class)}
      {...rest}
    >
      <For each={parts()}>
        {(part) => (
          <kbd
            aria-hidden="true"
            class="zen-inline-flex zen-min-w-5 zen-items-center zen-justify-center zen-rounded-zen-sm zen-border zen-border-solid zen-border-zen-border zen-bg-zen-muted zen-px-1 zen-font-sans zen-text-xs zen-font-medium zen-leading-5 zen-text-zen-foreground"
          >
            {part}
          </kbd>
        )}
      </For>
    </span>
  );
};

/** A group of shortcuts the help overlay lists that are not registered here: a component's own keys. */
export interface ShortcutHelpGroup {
  title: string;
  /** Where these keys work, when the title does not say. */
  where?: string;
  shortcuts: { keys: string[]; description: string }[];
}

export type ShortcutHelpProps = {
  /** The key that opens it. Default "?". Pass null to open it only through `open`. */
  openKey?: string | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Keys handled elsewhere (a table's arrows, a form's own keys), listed after the registered ones. */
  extra?: ShortcutHelpGroup[];
  title?: string;
};

/**
 * Every registered shortcut, grouped, with its keys, generated from the
 * registry: a key added with useShortcut shows up here by itself.
 */
export const ShortcutHelp = (props: ShortcutHelpProps) => {
  const loc = useLocale();
  const registry = useContext(ShortcutContext);
  const [internal, setInternal] = createSignal(false);
  const open = () => props.open ?? internal();
  const setOpen = (v: boolean) => {
    if (props.open === undefined) setInternal(v);
    props.onOpenChange?.(v);
  };
  // eslint-disable-next-line solid/reactivity -- the opening key is fixed for the overlay's life
  const openKey = props.openKey === undefined ? "?" : props.openKey;
  if (openKey) useShortcut(openKey, () => setOpen(true), { description: "Show these keys", group: "General" });

  const groups = createMemo(() => {
    const byGroup = new Map<string, { keys: string[]; description: string }[]>();
    for (const r of registry?.list() ?? []) {
      if (r.hidden || !r.description) continue;
      const g = r.group ?? loc.t("shortcuts.general");
      if (!byGroup.has(g)) byGroup.set(g, []);
      const list = byGroup.get(g)!;
      // The same action on two chords is one line with both.
      const same = list.find((x) => x.description === r.description);
      if (same) same.keys.push(r.text);
      else list.push({ keys: [r.text], description: r.description });
    }
    const registered: ShortcutHelpGroup[] = [...byGroup].map(([title, shortcuts]) => ({ title, shortcuts }));
    return [...registered, ...(props.extra ?? [])];
  });

  return (
    <Dialog open={open()} onOpenChange={setOpen}>
      <DialogContent class="zen-max-w-xl">
        <DialogHeader>
          <DialogTitle>{props.title ?? loc.t("shortcuts.keyboardShortcuts")}</DialogTitle>
        </DialogHeader>
        <div class="zen-flex zen-max-h-[60vh] zen-flex-col zen-gap-5 zen-overflow-y-auto" data-shortcut-help="">
          <For each={groups()}>
            {(g) => (
              <section>
                <h3 class="zen-m-0 zen-text-xs zen-font-semibold zen-uppercase zen-tracking-wide zen-text-zen-muted-fg">{g.title}</h3>
                <Show when={g.where}>
                  <p class="zen-m-0 zen-mt-0.5 zen-text-xs zen-text-zen-muted-fg">{g.where}</p>
                </Show>
                <dl class="zen-m-0 zen-mt-2 zen-grid zen-grid-cols-[minmax(0,1fr)_auto] zen-items-center zen-gap-x-4 zen-gap-y-1.5 zen-text-sm">
                  <For each={g.shortcuts}>
                    {(s) => (
                      <>
                        <dt class="zen-m-0">{s.description}</dt>
                        <dd class="zen-m-0 zen-flex zen-flex-wrap zen-justify-end zen-gap-1.5">
                          <For each={s.keys}>{(k) => <Kbd keys={k} />}</For>
                        </dd>
                      </>
                    )}
                  </For>
                </dl>
              </section>
            )}
          </For>
        </div>
      </DialogContent>
    </Dialog>
  );
};
