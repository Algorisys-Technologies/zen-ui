import * as React from "react";
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
 *   useShortcut("Alt+W", closeTab, { description: "Close the tab", group: "Tabs", within: () => workspaceRef.current });
 *   <Button aria-keyshortcuts={keyshortcut("Mod+S")}>Save <Kbd keys="Mod+S" /></Button>
 *
 * Chords are written once ("Mod+K": Ctrl, or ⌘ on a Mac) and the pure half is
 * @algorisys/zen-ui-core/keys (check:keys). One keydown listener for the whole
 * app; a shortcut `within` an element answers only while focus is inside it,
 * and wins over a global one with the same keys. Plain keys typed into a field
 * stay the field's unless a shortcut says `allowInFields`. A chord the browser
 * keeps (Ctrl+T, Ctrl+W, F5…) is refused with a warning, as is a second
 * shortcut on the same keys in the same place.
 *
 * React specifics. The registry is a ref, written synchronously by register
 * and release, so the keydown listener and the clash check always see the
 * current list — StrictMode's mount/cleanup/mount cannot leave a stale entry
 * behind or warn about a clash with itself. A copy in state drives what the
 * help overlay renders. useShortcut registers once per chord and reads the
 * handler and the `within` / `enabled` / `allowInFields` options through a
 * ref, so a new handler identity on every render neither re-registers (which
 * would reorder the list and change which scoped shortcut wins) nor answers
 * with a stale closure.
 */

export interface ShortcutOptions {
  /** What it does, for the help overlay: "Save", "Close the tab". */
  description?: string;
  /** The help overlay's heading it goes under: "Forms", "Tabs". Default "General". */
  group?: string;
  /**
   * Only while focus is inside this element. Wins over a global shortcut on the same keys.
   * A function returning the element (as in Solid), or a ref to it.
   */
  within?: (() => Element | null | undefined) | React.RefObject<Element | null>;
  /** Also while typing in a field (a chord with Mod or Alt usually wants this). */
  allowInFields?: boolean;
  /** Turned off while this returns false. */
  enabled?: () => boolean;
  /** Left out of the help overlay (a key that is an implementation detail). */
  hidden?: boolean;
}

interface Registration {
  id: number;
  text: string;
  chord: Chord;
  description?: string;
  group?: string;
  hidden?: boolean;
  /** The element the shortcut is scoped to, read now; undefined when it is global. */
  scope: () => Element | null | undefined;
  scoped: boolean;
  allowInFields: () => boolean;
  enabled: () => boolean;
  handler: (e: KeyboardEvent) => void;
}

interface ShortcutRegistry {
  platform: Platform;
  register: (r: Omit<Registration, "id" | "chord">) => () => void;
  /** Every registered shortcut, in registration order. */
  list: Registration[];
}

const ShortcutContext = React.createContext<ShortcutRegistry | undefined>(undefined);

/** The platform, for spelling and matching: a Mac, or everything else. */
export function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "other";
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  const p = nav.userAgentData?.platform ?? navigator.platform ?? navigator.userAgent ?? "";
  return /mac|iphone|ipad|ipod/i.test(p) ? "mac" : "other";
}

function resolveWithin(w: ShortcutOptions["within"]): Element | null | undefined {
  if (!w) return undefined;
  return typeof w === "function" ? w() : w.current;
}

export type ShortcutProviderProps = {
  children?: React.ReactNode;
  /** Override the detected platform (tests, a demo showing both). */
  platform?: Platform;
};

export const ShortcutProvider = ({ children, platform: platformProp }: ShortcutProviderProps) => {
  // Fixed for the app's life, as in Solid.
  const [platform] = React.useState<Platform>(() => platformProp ?? detectPlatform());
  const listRef = React.useRef<Registration[]>([]);
  const [list, setList] = React.useState<Registration[]>([]);
  const nextRef = React.useRef(1);

  const register = React.useCallback<ShortcutRegistry["register"]>(
    (r) => {
      const chord = parseChord(r.text);
      if (isReservedChord(chord, platform)) {
        console.warn(`[zen-ui shortcuts] "${r.text}" is kept by the browser or the system; it was not registered.`);
        return () => {};
      }
      const clash = listRef.current.find(
        (o) => sameChord(o.chord, chord, platform) && o.scoped === r.scoped && (!r.scoped || o.scope() === r.scope()),
      );
      if (clash) {
        console.warn(
          `[zen-ui shortcuts] "${r.text}" (${r.description ?? "no description"}) is already "${clash.description ?? clash.text}" in the same place; the first one keeps it.`,
        );
      }
      const entry: Registration = { ...r, id: nextRef.current++, chord };
      listRef.current = [...listRef.current, entry];
      setList(listRef.current);
      return () => {
        listRef.current = listRef.current.filter((x) => x.id !== entry.id);
        setList(listRef.current);
      };
    },
    [platform],
  );

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.isComposing) return;
      const target = e.target as Element | null;
      const typing = isTypingTarget(target);
      const candidates = listRef.current.filter(
        (r) => r.enabled() && (!typing || r.allowInFields()) && matchesChord(e, r.chord, platform),
      );
      if (candidates.length === 0) return;
      // Innermost first: a shortcut scoped to where focus is wins over a global one.
      const scoped = candidates.filter((r) => {
        const el = r.scope();
        return !!el && !!target && el.contains(target);
      });
      const pick = scoped.length ? scoped[scoped.length - 1] : candidates.find((r) => !r.scoped);
      if (!pick) return;
      e.preventDefault();
      pick.handler(e);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [platform]);

  const value = React.useMemo<ShortcutRegistry>(() => ({ platform, register, list }), [platform, register, list]);
  return <ShortcutContext.Provider value={value}>{children}</ShortcutContext.Provider>;
};

/** The registry and platform, for a component that lists or spells shortcuts. */
export function useShortcuts(): ShortcutRegistry | undefined {
  return React.useContext(ShortcutContext);
}

/** useShortcut, with `null` meaning "register nothing" (a hook cannot be called conditionally). */
function useShortcutRegistration(
  text: string | null,
  handler: (e: KeyboardEvent) => void,
  options: ShortcutOptions,
) {
  const registry = React.useContext(ShortcutContext);
  // The latest handler and options, read at key time: a new identity each
  // render must not re-register, and must not leave a stale closure answering.
  const latest = React.useRef({ handler, options });
  latest.current = { handler, options };
  const register = registry?.register;
  const { description, group, hidden } = options;
  const scoped = !!options.within;

  React.useEffect(() => {
    if (text === null) return;
    if (!register) {
      console.warn(`[zen-ui shortcuts] useShortcut("${text}") outside a ShortcutProvider does nothing.`);
      return;
    }
    return register({
      text,
      description,
      group,
      hidden,
      scoped,
      scope: () => resolveWithin(latest.current.options.within),
      allowInFields: () => !!latest.current.options.allowInFields,
      enabled: () => latest.current.options.enabled?.() ?? true,
      handler: (e) => latest.current.handler(e),
    });
  }, [register, text, description, group, hidden, scoped]);
}

/**
 * Answer a key while this component is mounted. Released when it unmounts.
 * Outside a ShortcutProvider it does nothing (and says so, in development).
 */
export function useShortcut(text: string, handler: (e: KeyboardEvent) => void, options: ShortcutOptions = {}) {
  useShortcutRegistration(text, handler, options);
}

/** A chord's aria-keyshortcuts value on this platform: put it on the control the shortcut acts as. */
export function keyshortcut(text: string, platform: Platform = detectPlatform()): string {
  return ariaKeyshortcut(parseChord(text), platform);
}

/** A chord spelled for a tooltip on this platform: "Ctrl+S", "⌘S". */
export function shortcutLabel(text: string, platform: Platform = detectPlatform()): string {
  return chordLabel(parseChord(text), platform);
}

export type KbdProps = React.HTMLAttributes<HTMLSpanElement> & {
  /** A chord, drawn as key caps spelled for this platform: "Mod+K" is Ctrl K, or ⌘ K on a Mac. */
  keys: string;
  /** Override the platform (a demo showing both). */
  platform?: Platform;
};

/**
 * Key caps for a chord. The caps are drawn for the eye; the group is named by
 * the chord as words ("Ctrl+K", "⌘K") so it reads as one thing.
 */
export const Kbd = React.forwardRef<HTMLSpanElement, KbdProps>(({ keys, platform, className, ...rest }, ref) => {
  const registry = React.useContext(ShortcutContext);
  const p = platform ?? registry?.platform ?? detectPlatform();
  const chord = React.useMemo(() => parseChord(keys), [keys]);
  return (
    <span
      ref={ref}
      role="group"
      aria-label={chordLabel(chord, p)}
      className={cn("zen-inline-flex zen-items-center zen-gap-0.5 zen-align-middle", className)}
      {...rest}
    >
      {chordParts(chord, p).map((part, i) => (
        <kbd
          key={i}
          aria-hidden="true"
          className="zen-inline-flex zen-min-w-5 zen-items-center zen-justify-center zen-rounded-zen-sm zen-border zen-border-solid zen-border-zen-border zen-bg-zen-muted zen-px-1 zen-font-sans zen-text-xs zen-font-medium zen-leading-5 zen-text-zen-foreground"
        >
          {part}
        </kbd>
      ))}
    </span>
  );
});
Kbd.displayName = "Kbd";

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
export const ShortcutHelp = ({ openKey: openKeyProp, open: openProp, onOpenChange, extra, title }: ShortcutHelpProps) => {
  const loc = useLocale();
  const registry = React.useContext(ShortcutContext);
  const [internal, setInternal] = React.useState(false);
  const open = openProp ?? internal;
  const setOpen = (v: boolean) => {
    if (openProp === undefined) setInternal(v);
    onOpenChange?.(v);
  };
  // The opening key is fixed for the overlay's life, as in Solid.
  const [openKey] = React.useState(() => (openKeyProp === undefined ? "?" : openKeyProp));
  useShortcutRegistration(openKey || null, () => setOpen(true), {
    description: loc.t("shortcuts.showTheseKeys"),
    group: loc.t("shortcuts.general"),
  });

  const list = registry?.list;
  const general = loc.t("shortcuts.general");
  const groups = React.useMemo(() => {
    const byGroup = new Map<string, { keys: string[]; description: string }[]>();
    for (const r of list ?? []) {
      if (r.hidden || !r.description) continue;
      const g = r.group ?? general;
      if (!byGroup.has(g)) byGroup.set(g, []);
      const entries = byGroup.get(g)!;
      // The same action on two chords is one line with both.
      const same = entries.find((x) => x.description === r.description);
      if (same) same.keys.push(r.text);
      else entries.push({ keys: [r.text], description: r.description });
    }
    const registered: ShortcutHelpGroup[] = [...byGroup].map(([t, shortcuts]) => ({ title: t, shortcuts }));
    return [...registered, ...(extra ?? [])];
  }, [list, general, extra]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="zen-max-w-xl">
        <DialogHeader>
          <DialogTitle>{title ?? loc.t("shortcuts.keyboardShortcuts")}</DialogTitle>
        </DialogHeader>
        <div className="zen-flex zen-max-h-[60vh] zen-flex-col zen-gap-5 zen-overflow-y-auto" data-shortcut-help="">
          {groups.map((g, gi) => (
            <section key={`${gi}:${g.title}`}>
              <h3 className="zen-m-0 zen-text-xs zen-font-semibold zen-uppercase zen-tracking-wide zen-text-zen-muted-fg">{g.title}</h3>
              {g.where && <p className="zen-m-0 zen-mt-0.5 zen-text-xs zen-text-zen-muted-fg">{g.where}</p>}
              <dl className="zen-m-0 zen-mt-2 zen-grid zen-grid-cols-[minmax(0,1fr)_auto] zen-items-center zen-gap-x-4 zen-gap-y-1.5 zen-text-sm">
                {g.shortcuts.map((s, si) => (
                  <React.Fragment key={si}>
                    <dt className="zen-m-0">{s.description}</dt>
                    <dd className="zen-m-0 zen-flex zen-flex-wrap zen-justify-end zen-gap-1.5">
                      {s.keys.map((k, ki) => (
                        <Kbd key={ki} keys={k} />
                      ))}
                    </dd>
                  </React.Fragment>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
