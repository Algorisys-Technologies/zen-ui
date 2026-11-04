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
import { applyProps, Disposer, setChildren, type BaseProps, type Child, type ZenComponent } from "../../lib/component";
import { Dialog } from "../dialog/dialog";
import { useLocale } from "../locale/locale";

/**
 * Keyboard shortcuts as a system: one list of every key the app answers, so
 * a help overlay (`?`) can show them, tooltips and menus can name them, and two
 * features cannot quietly take the same key. The vanilla port of the React
 * reference (behaviour origin: the Solid binding).
 *
 *   const app = ShortcutProvider({
 *     children: () => [Editor(), ShortcutHelp({ extra })],   // "?" opens the help
 *   });
 *   document.body.append(app.el);
 *
 *   // inside a factory the provider's children function calls:
 *   const release = useShortcut("Mod+S", save, { description: "Save", group: "Forms" });
 *   useShortcut("Alt+W", closeTab, { description: "Close the tab", group: "Tabs", within: workspaceEl });
 *   Button({ "aria-keyshortcuts": keyshortcut("Mod+S"), children: ["Save ", Kbd({ keys: "Mod+S" })] });
 *
 * Chords are written once ("Mod+K": Ctrl, or ⌘ on a Mac) and the pure half is
 * @algorisys/zen-ui-core/keys (check:keys). One keydown listener per provider;
 * a shortcut `within` an element answers only while focus is inside it, and
 * wins over a global one with the same keys. Plain keys typed into a field
 * stay the field's unless a shortcut says `allowInFields`. A chord the browser
 * keeps (Ctrl+T, Ctrl+W, F5…) is refused with a warning, as is a second
 * shortcut on the same keys in the same place (the first one keeps it).
 *
 * Vanilla specifics. There is no context and no component lifetime to hang a
 * hook on, so the provider works the way LocaleProvider does: `children` is a
 * function the provider calls with itself as the current registry, and
 * `useShortcut()` registers into the provider whose children function is
 * running. It RETURNS the release function: call it from the registering
 * component's `destroy()`. The provider also releases every key registered
 * while it built its children when it rebuilds them (`update({ children })`)
 * or is destroyed, so a forgotten release cannot outlive the provider. To
 * register later (on a click, after a fetch), keep `useShortcuts()` from the
 * factory body and call its `register()` then.
 *
 * Keys answer only while the provider's element is in the document: a page
 * replaced by a router that never calls `destroy()` stops answering the moment
 * its element is detached, as a React or Solid subtree does on unmount.
 */

export interface ShortcutOptions {
  /** What it does, for the help overlay: "Save", "Close the tab". */
  description?: string;
  /** The help overlay's heading it goes under: "Forms", "Tabs". Default "General". */
  group?: string;
  /**
   * Only while focus is inside this element. Wins over a global shortcut on the same keys.
   * The element, or a function returning it (read at key time, as in Solid).
   */
  within?: Element | (() => Element | null | undefined) | null;
  /** Also while typing in a field (a chord with Mod or Alt usually wants this). */
  allowInFields?: boolean;
  /** Turned off while this returns false. */
  enabled?: () => boolean;
  /** Left out of the help overlay (a key that is an implementation detail). */
  hidden?: boolean;
}

/** What `register()` takes: the chord, its handler, and the options. */
export interface ShortcutRegistration extends ShortcutOptions {
  text: string;
  handler: (e: KeyboardEvent) => void;
}

/** A registered shortcut, as `list` holds it. */
export interface RegisteredShortcut extends ShortcutRegistration {
  id: number;
  chord: Chord;
}

/** A provider's registry: what `useShortcuts()` returns. */
export interface ShortcutRegistry {
  platform: Platform;
  /** Register a key; returns its release. Refused (with a warning, and a no-op release) for a reserved chord. */
  register: (r: ShortcutRegistration) => () => void;
  /** Every registered shortcut, in registration order. */
  readonly list: readonly RegisteredShortcut[];
  /** Called after every register and release; returns the unsubscribe. */
  subscribe: (fn: () => void) => () => void;
}

/** The platform, for spelling and matching: a Mac, or everything else. */
export function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "other";
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  const p = nav.userAgentData?.platform ?? navigator.platform ?? navigator.userAgent ?? "";
  return /mac|iphone|ipad|ipod/i.test(p) ? "mac" : "other";
}

const resolveWithin = (w: ShortcutOptions["within"]): Element | null | undefined =>
  typeof w === "function" ? w() : w;

/** The provider whose `children` function is running now, if any. */
let current: ShortcutRegistry | undefined;
/** Releases owed to the provider building now: what useShortcut registered during the build. */
let currentBuild: (() => void)[] | undefined;

/** The registry of the provider building this component (undefined outside one). Call it in a factory, not later. */
export function useShortcuts(): ShortcutRegistry | undefined {
  return current;
}

/**
 * Answer a key while this component exists. Call it in a factory the provider's
 * `children` function calls; it returns the release, for the component's
 * `destroy()`. Outside a ShortcutProvider it does nothing (and says so).
 */
export function useShortcut(text: string, handler: (e: KeyboardEvent) => void, options: ShortcutOptions = {}): () => void {
  const registry = current;
  if (!registry) {
    console.warn(`[zen-ui shortcuts] useShortcut("${text}") outside a ShortcutProvider does nothing.`);
    return () => {};
  }
  const release = registry.register({ text, handler, ...options });
  currentBuild?.push(release);
  return release;
}

export interface ShortcutProviderProps extends Omit<BaseProps, "children"> {
  /** Prefer a function: the components it builds register into this provider. */
  children?: Child | (() => Child);
  /** Override the detected platform (tests, a demo showing both). Fixed for the provider's life. */
  platform?: Platform;
}

const isComponent = (v: unknown): v is ZenComponent<never, Element> =>
  typeof v === "object" && v !== null && "el" in v && "destroy" in v;
const componentsIn = (c: Child): ZenComponent<never, Element>[] =>
  Array.isArray(c) ? c.flatMap(componentsIn) : isComponent(c) ? [c] : [];

export function ShortcutProvider(props: ShortcutProviderProps = {}): ZenComponent<ShortcutProviderProps> {
  let state = { ...props };
  const platform: Platform = props.platform ?? detectPlatform();
  const el = document.createElement("div");
  // Exists to own the keys, not to be a box: its children stay in the parent's flow.
  el.style.display = "contents";
  const disposer = new Disposer();

  let list: RegisteredShortcut[] = [];
  let next = 1;
  const subscribers = new Set<() => void>();
  const changed = () => subscribers.forEach((fn) => fn());

  const registry: ShortcutRegistry = {
    platform,
    get list() {
      return list;
    },
    register(r) {
      const chord = parseChord(r.text);
      if (isReservedChord(chord, platform)) {
        console.warn(`[zen-ui shortcuts] "${r.text}" is kept by the browser or the system; it was not registered.`);
        return () => {};
      }
      const scoped = !!r.within;
      const clash = list.find(
        (o) => sameChord(o.chord, chord, platform) && !!o.within === scoped && (!scoped || resolveWithin(o.within) === resolveWithin(r.within)),
      );
      if (clash) {
        console.warn(
          `[zen-ui shortcuts] "${r.text}" (${r.description ?? "no description"}) is already "${clash.description ?? clash.text}" in the same place; the first one keeps it.`,
        );
      }
      const entry: RegisteredShortcut = { ...r, id: next++, chord };
      list = [...list, entry];
      changed();
      let released = false;
      return () => {
        if (released) return;
        released = true;
        list = list.filter((x) => x.id !== entry.id);
        changed();
      };
    },
    subscribe(fn) {
      subscribers.add(fn);
      return () => subscribers.delete(fn);
    },
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.defaultPrevented || e.isComposing || !el.isConnected) return;
    const target = e.target as Element | null;
    const typing = isTypingTarget(target);
    const candidates = list.filter(
      (r) => (r.enabled?.() ?? true) && (!typing || !!r.allowInFields) && matchesChord(e, r.chord, platform),
    );
    if (candidates.length === 0) return;
    // Innermost first: a shortcut scoped to where focus is wins over a global one.
    const scoped = candidates.filter((r) => {
      const scope = resolveWithin(r.within);
      return !!scope && !!target && scope.contains(target);
    });
    const pick = scoped.length ? scoped[scoped.length - 1] : candidates.find((r) => !r.within);
    if (!pick) return;
    e.preventDefault();
    pick.handler(e);
  };
  document.addEventListener("keydown", onKey);
  disposer.add(() => document.removeEventListener("keydown", onKey));

  let built: ZenComponent<never, Element>[] = [];
  let buildReleases: (() => void)[] = [];
  let removeProps: (() => void) | undefined;
  const teardownBuild = () => {
    for (const c of built) c.destroy();
    for (const release of buildReleases) release();
    built = [];
    buildReleases = [];
  };

  const render = () => {
    const { platform: _p, children, ...rest } = state;
    let nodes: Child;
    if (typeof children === "function") {
      teardownBuild();
      const prev = current;
      const prevBuild = currentBuild;
      current = registry;
      currentBuild = buildReleases;
      try {
        nodes = children();
      } finally {
        current = prev;
        currentBuild = prevBuild;
      }
      built = componentsIn(nodes);
    } else {
      nodes = children;
    }
    setChildren(el, nodes);
    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  };
  render();
  disposer.add(() => removeProps?.());
  disposer.add(teardownBuild);
  disposer.add(() => {
    list = [];
    subscribers.clear();
  });

  return {
    el,
    update(nextProps) {
      // The platform is fixed for the provider's life, as in React and Solid.
      const { platform: _ignored, ...rest } = nextProps;
      state = { ...state, ...rest };
      render();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}

/** A chord's aria-keyshortcuts value on this platform: put it on the control the shortcut acts as. */
export function keyshortcut(text: string, platform: Platform = detectPlatform()): string {
  return ariaKeyshortcut(parseChord(text), platform);
}

/** A chord spelled for a tooltip on this platform: "Ctrl+S", "⌘S". */
export function shortcutLabel(text: string, platform: Platform = detectPlatform()): string {
  return chordLabel(parseChord(text), platform);
}

export interface KbdProps extends Omit<BaseProps, "children"> {
  /** A chord, drawn as key caps spelled for this platform: "Mod+K" is Ctrl K, or ⌘ K on a Mac. */
  keys: string;
  /** Override the platform (a demo showing both). Default: the provider's, else detected. */
  platform?: Platform;
  [key: string]: unknown;
}

const KEY_CAP =
  "zen-inline-flex zen-min-w-5 zen-items-center zen-justify-center zen-rounded-zen-sm zen-border zen-border-solid zen-border-zen-border zen-bg-zen-muted zen-px-1 zen-font-sans zen-text-xs zen-font-medium zen-leading-5 zen-text-zen-foreground";

/**
 * Key caps for a chord. The caps are drawn for the eye; the group is named by
 * the chord as words ("Ctrl+K", "⌘K") so it reads as one thing.
 */
export function Kbd(props: KbdProps): ZenComponent<KbdProps> {
  let state = { ...props };
  const providerPlatform = useShortcuts()?.platform;
  const el = document.createElement("span");
  let removeProps: (() => void) | undefined;

  const render = () => {
    const { keys, platform, class: className, ...rest } = state;
    const p = platform ?? providerPlatform ?? detectPlatform();
    const chord = parseChord(keys);
    el.setAttribute("role", "group");
    el.setAttribute("aria-label", chordLabel(chord, p));
    el.className = cn("zen-inline-flex zen-items-center zen-gap-0.5 zen-align-middle", className);
    el.replaceChildren(
      ...chordParts(chord, p).map((part) => {
        const k = document.createElement("kbd");
        k.setAttribute("aria-hidden", "true");
        k.className = KEY_CAP;
        k.textContent = part;
        return k;
      }),
    );
    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  };
  render();

  return {
    el,
    update(next) {
      state = { ...state, ...next };
      render();
    },
    destroy() {
      removeProps?.();
      el.remove();
    },
  };
}

/** A group of shortcuts the help overlay lists that are not registered here: a component's own keys. */
export interface ShortcutHelpGroup {
  title: string;
  /** Where these keys work, when the title does not say. */
  where?: string;
  shortcuts: { keys: string[]; description: string }[];
}

export interface ShortcutHelpProps {
  /** The key that opens it. Default "?". Pass null to open it only through `open`. Fixed for the overlay's life. */
  openKey?: string | null;
  /** Controlled open state. Leave it out and the overlay keeps its own. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Keys handled elsewhere (a table's arrows, a form's own keys), listed after the registered ones. */
  extra?: ShortcutHelpGroup[];
  title?: string;
  /**
   * The registry to list and to register the opening key in. Default: the
   * provider building this component (`useShortcuts()`). Vanilla only: React and
   * Solid read it from context; here it is the explicit context object PORTING.md
   * maps context to, for an overlay built outside a provider's children function
   * (the web-components binding's document-level registry).
   */
  registry?: ShortcutRegistry;
}

export interface ShortcutHelpHandle extends ZenComponent<ShortcutHelpProps> {
  /** Ask to open (opens it, or, when controlled, calls onOpenChange(true)). */
  open(): void;
  /** Ask to close. */
  close(): void;
  readonly isOpen: boolean;
  /** The dialog panel, in the document only while open. */
  readonly panel: HTMLElement;
}

/**
 * Every registered shortcut, grouped, with its keys, generated from the
 * registry: a key added with useShortcut shows up here by itself.
 *
 * It renders nothing in place, as in React and Solid: `el` is an empty,
 * hidden marker, so the handle can sit among a provider's children (which then
 * destroys it with them), and the overlay portals itself when open (`panel` is
 * its dialog). Build it inside a ShortcutProvider's children function so it
 * lists that provider's keys and registers its opening key there.
 */
export function ShortcutHelp(props: ShortcutHelpProps = {}): ShortcutHelpHandle {
  let state = { ...props };
  const loc = useLocale();
  const registry = props.registry ?? useShortcuts();
  const disposer = new Disposer();

  const body = document.createElement("div");
  body.className = "zen-flex zen-max-h-[60vh] zen-flex-col zen-gap-5 zen-overflow-y-auto";
  body.setAttribute("data-shortcut-help", "");

  const groups = (): ShortcutHelpGroup[] => {
    const general = loc.t("shortcuts.general");
    const byGroup = new Map<string, { keys: string[]; description: string }[]>();
    for (const r of registry?.list ?? []) {
      if (r.hidden || !r.description) continue;
      const g = r.group ?? general;
      if (!byGroup.has(g)) byGroup.set(g, []);
      const entries = byGroup.get(g)!;
      // The same action on two chords is one line with both.
      const same = entries.find((x) => x.description === r.description);
      if (same) same.keys.push(r.text);
      else entries.push({ keys: [r.text], description: r.description });
    }
    const registered: ShortcutHelpGroup[] = [...byGroup].map(([title, shortcuts]) => ({ title, shortcuts }));
    return [...registered, ...(state.extra ?? [])];
  };

  let caps: ZenComponent<KbdProps>[] = [];
  const paint = () => {
    caps.forEach((c) => c.destroy());
    caps = [];
    const sections = groups().map((g) => {
      const section = document.createElement("section");
      const h3 = document.createElement("h3");
      h3.className = "zen-m-0 zen-text-xs zen-font-semibold zen-uppercase zen-tracking-wide zen-text-zen-muted-fg";
      h3.textContent = g.title;
      section.append(h3);
      if (g.where) {
        const p = document.createElement("p");
        p.className = "zen-m-0 zen-mt-0.5 zen-text-xs zen-text-zen-muted-fg";
        p.textContent = g.where;
        section.append(p);
      }
      const dl = document.createElement("dl");
      dl.className =
        "zen-m-0 zen-mt-2 zen-grid zen-grid-cols-[minmax(0,1fr)_auto] zen-items-center zen-gap-x-4 zen-gap-y-1.5 zen-text-sm";
      for (const s of g.shortcuts) {
        const dt = document.createElement("dt");
        dt.className = "zen-m-0";
        dt.textContent = s.description;
        const dd = document.createElement("dd");
        dd.className = "zen-m-0 zen-flex zen-flex-wrap zen-justify-end zen-gap-1.5";
        for (const k of s.keys) {
          const cap = Kbd({ keys: k, platform: registry?.platform });
          caps.push(cap);
          dd.append(cap.el);
        }
        dl.append(dt, dd);
      }
      section.append(dl);
      return section;
    });
    body.replaceChildren(...sections);
  };

  /** True while this factory drives the dialog itself, so its onOpenChange is not echoed back. */
  let driving = false;
  const dialog = Dialog({
    class: "zen-max-w-xl",
    title: state.title ?? loc.t("shortcuts.keyboardShortcuts"),
    children: body,
    onOpenChange: (v) => {
      // Only a dismissal (Escape, outside, ✕) reaches here undriven.
      if (!driving) state.onOpenChange?.(v);
    },
  });
  const show = (v: boolean) => {
    driving = true;
    try {
      if (v) {
        paint();
        dialog.open();
      } else dialog.close();
    } finally {
      driving = false;
    }
  };
  if (state.open) show(true);

  /** A request to change the state: applied when uncontrolled, reported either way. */
  const setOpen = (v: boolean) => {
    if (state.open === undefined) show(v);
    state.onOpenChange?.(v);
  };

  // The opening key is fixed for the overlay's life, as in React and Solid.
  const openKey = props.openKey === undefined ? "?" : props.openKey;
  if (openKey) {
    const opener = { description: "Show these keys", group: "General" };
    disposer.add(
      props.registry
        ? props.registry.register({ text: openKey, handler: () => setOpen(true), ...opener })
        : useShortcut(openKey, () => setOpen(true), opener),
    );
  }
  // A key registered or released while the overlay is open shows up (or goes) at once.
  if (registry) disposer.add(registry.subscribe(() => dialog.isOpen && paint()));

  const el = document.createElement("span");
  el.hidden = true;

  return {
    el,
    panel: dialog.el,
    get isOpen() {
      return dialog.isOpen;
    },
    open: () => setOpen(true),
    close: () => setOpen(false),
    update(next) {
      state = { ...state, ...next };
      if ("title" in next) dialog.update({ title: state.title ?? loc.t("shortcuts.keyboardShortcuts") });
      if (next.open !== undefined && next.open !== dialog.isOpen) show(next.open);
      else if (dialog.isOpen && "extra" in next) paint();
    },
    destroy() {
      disposer.dispose();
      caps.forEach((c) => c.destroy());
      dialog.destroy();
      el.remove();
    },
  };
}
