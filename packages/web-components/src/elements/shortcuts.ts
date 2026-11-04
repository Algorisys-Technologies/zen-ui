import {
  Kbd,
  ShortcutHelp,
  ShortcutProvider,
  useShortcuts,
  type KbdProps,
  type ShortcutHelpProps,
  type ShortcutRegistry,
  type ZenComponent,
} from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

/**
 * <zen-kbd keys="Mod+K"></zen-kbd>
 * <zen-shortcut keys="Mod+S" description="Save" group="Forms" allow-in-fields></zen-shortcut>
 * <zen-shortcut keys="Delete" description="Delete the row" within="#rows"></zen-shortcut>
 * <zen-shortcut-help></zen-shortcut-help>          "?" opens it
 *
 *   document.querySelector("zen-shortcut").addEventListener("zen-shortcut", (e) => save());
 *
 * ONE registry for the document, not a provider element. A vanilla
 * ShortcutProvider hands its registry to the factories its `children` function
 * calls; a provider ELEMENT cannot, because its light-DOM children are parsed,
 * upgraded and connected by the browser, not called by it, and they are
 * captured once at connect (lib/define.ts). Every <zen-shortcut> and
 * <zen-shortcut-help> on a page therefore shares `documentShortcuts()`: one
 * keydown listener, one list for the overlay, the same clash and reserved-chord
 * warnings. An element's keys live exactly as long as the element is connected
 * (disconnect destroys its component, which releases them), which is the
 * lifetime React and Solid give a mounted component. Scoping is what `within`
 * is for, and a second, separate registry is a vanilla ShortcutProvider.
 *
 * <zen-shortcut> is the element form of useShortcut: it renders nothing and
 * fires `zen-shortcut` (detail: the KeyboardEvent) when its keys are pressed.
 * `within` is a CSS selector, read at key time (the scope may render later than
 * the shortcut). `disabled` is `enabled` turned around, because a boolean
 * attribute can only say true. `hidden` keeps it out of the overlay, as the
 * option does (the host renders nothing either way).
 */

let doc: ShortcutRegistry | undefined;

/**
 * The document's shortcut registry, created on first use: what <zen-shortcut>
 * and <zen-shortcut-help> register into. Register from script with
 * `documentShortcuts().register({ text, handler, ...options })`, which returns the release.
 */
export function documentShortcuts(): ShortcutRegistry {
  if (!doc) {
    const provider = ShortcutProvider({
      children: () => {
        doc = useShortcuts();
        return null;
      },
    });
    // A provider answers only while its element is in the document; this one
    // is an empty display:contents marker.
    provider.el.setAttribute("data-zen-shortcuts", "");
    document.body.append(provider.el);
  }
  return doc!;
}

defineZenElement<KbdProps>({
  tag: "zen-kbd",
  factory: Kbd,
  attrs: { keys: "string", platform: "string" },
  childrenProp: false,
});

interface ShortcutElementProps {
  keys?: string;
  description?: string;
  group?: string;
  within?: string;
  allowInFields?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  onShortcut?: (e: KeyboardEvent) => void;
}

/** Registers one key in the document registry; renders an empty, hidden marker. */
function ShortcutElement(props: ShortcutElementProps): ZenComponent<ShortcutElementProps> {
  if (!props.keys) throw new Error("zen-shortcut: keys is required");
  let state = { ...props };
  const el = document.createElement("span");
  el.hidden = true;
  let release = () => {};
  const register = () => {
    release();
    const { keys, description, group, within, allowInFields, hidden } = state;
    if (!keys) {
      release = () => {};
      return;
    }
    release = documentShortcuts().register({
      text: keys,
      description,
      group,
      hidden,
      allowInFields,
      within: within ? () => document.querySelector(within) : undefined,
      enabled: () => !state.disabled,
      handler: (e) => state.onShortcut?.(e),
    });
  };
  register();
  const SHAPE = ["keys", "description", "group", "within", "allowInFields", "hidden"] as const;
  return {
    el,
    update(next) {
      const before = state;
      state = { ...state, ...next };
      // The handler and `disabled` are read at key time; only what the list
      // shows or matches on re-registers (which would move it to the end).
      if (SHAPE.some((k) => before[k] !== state[k])) register();
    },
    destroy() {
      release();
      el.remove();
    },
  };
}

defineZenElement<ShortcutElementProps>({
  tag: "zen-shortcut",
  factory: ShortcutElement,
  attrs: {
    keys: "string",
    description: "string",
    group: "string",
    within: "string",
    "allow-in-fields": "boolean",
    disabled: "boolean",
    hidden: "boolean",
  },
  events: { onShortcut: "zen-shortcut" },
  childrenProp: false,
});

/**
 * <zen-shortcut-help> — the "?" overlay over the document registry. `extra` is
 * a JS property (or a json attribute); `open-key=""` opens it only through
 * `open()`. Open state is the handle's: `open()` / `close()` / `isOpen` are
 * forwarded onto the element, as on <zen-dialog>, and `zen-open-change` fires.
 */
defineZenElement<ShortcutHelpProps>({
  tag: "zen-shortcut-help",
  factory: (props) => ShortcutHelp({ ...props, registry: documentShortcuts() }),
  attrs: { "open-key": "string", title: "string", extra: "json" },
  props: ["extra"],
  events: { onOpenChange: "zen-open-change" },
  childrenProp: false,
});
