import { DEFAULT_MESSAGES, formatMessage, type MessageKey, type ZenMessages } from "@algorisys/zen-ui-core/messages";
import { applyProps, Disposer, setChildren, type BaseProps, type Child, type ZenComponent } from "../../lib/component";

export type { MessageKey, ZenMessages };

/**
 * LocaleProvider — the locale, currency and words zen-ui uses, set once for an
 * app (or a part of one: a vendor's invoice in their currency).
 *
 *   const app = LocaleProvider({
 *     locale: "hi-IN", currency: "INR", messages: hindi,
 *     children: () => [Toolbar(...), DataTable(...)],
 *   });
 *
 * Optional, and nothing changes without it: a component reads its own prop
 * first, then this, then what it did before the provider existed (the
 * browser's locale, the English words). `messages` may be any subset of the
 * catalogue in @algorisys/zen-ui-core/messages; what it leaves out stays
 * English, and a nested provider inherits what it does not set.
 *
 * This binding has no context, and a factory renders its words when it is
 * CALLED, usually before its element is in the document, so looking the
 * provider up through the DOM would find nothing. Hence `children` as a
 * function: the provider calls it with itself as the current locale, and every
 * factory called inside reads it with `useLocale()`, exactly when React's and
 * Solid's components read their context. Plain children are accepted too, but
 * were built before the provider existed and keep the words they were built
 * with. `update()` rebuilds a function's children (destroying the old ones),
 * so changed messages reach them. `localeOf(node)` finds the provider around a
 * node already in the document, for words rendered later (a menu on open).
 */
export interface LocaleContextValue {
  /** BCP 47: "en-IN", "hi-IN", "de-DE". Undefined: the browser's. */
  locale: string | undefined;
  /** ISO 4217 for amounts that do not name their own: "INR". */
  currency: string | undefined;
  /** A built-in string, translated if the app supplied one, filled with `values`. */
  t: (key: MessageKey, values?: Record<string, string | number>) => string;
}

export interface LocaleProviderProps extends Omit<BaseProps, "children"> {
  locale?: string;
  currency?: string;
  /** Translations for any of the built-in strings. */
  messages?: Partial<ZenMessages>;
  /** Prefer a function: the components it builds read this provider. */
  children?: Child | (() => Child);
}

const NONE: LocaleContextValue = {
  locale: undefined,
  currency: undefined,
  t: (key, values) => formatMessage(DEFAULT_MESSAGES[key], values),
};

/** The provider whose `children` function is running now, if any. */
let current: LocaleContextValue | undefined;
const byElement = new WeakMap<Element, LocaleContextValue>();

/** The locale of the provider building this component (the defaults outside one). Call it in a factory, not later. */
export function useLocale(): LocaleContextValue {
  return current ?? NONE;
}

/** The nearest provider around a node in the document (the defaults without one). */
export function localeOf(node: Node | null | undefined): LocaleContextValue {
  for (let n: Node | null | undefined = node; n; n = n.parentNode ?? (n as ShadowRoot).host) {
    const v = n instanceof Element ? byElement.get(n) : undefined;
    if (v) return v;
  }
  return NONE;
}

const isComponent = (v: unknown): v is ZenComponent<never, Element> =>
  typeof v === "object" && v !== null && "el" in v && "destroy" in v;
const componentsIn = (c: Child): ZenComponent<never, Element>[] =>
  Array.isArray(c) ? c.flatMap(componentsIn) : isComponent(c) ? [c] : [];

export function LocaleProvider(props: LocaleProviderProps = {}): ZenComponent<LocaleProviderProps> {
  let state = { ...props };
  // An inner provider built inside an outer one's children inherits what it leaves out.
  const outer = current;
  const el = document.createElement("div");
  // Exists to scope the words, not to be a box: its children stay in the parent's flow.
  el.style.display = "contents";
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;
  let built: ZenComponent<never, Element>[] = [];

  const value = (): LocaleContextValue => {
    const { locale, currency, messages } = state;
    const effective = locale ?? outer?.locale;
    return {
      locale: effective,
      currency: currency ?? outer?.currency,
      t: (key, values) => {
        const own = messages?.[key];
        if (own === undefined && outer) return outer.t(key, values);
        return formatMessage(own ?? DEFAULT_MESSAGES[key], values, effective);
      },
    };
  };

  const render = () => {
    const { locale: _l, currency: _c, messages: _m, children, ...rest } = state;
    const v = value();
    byElement.set(el, v);
    let nodes: Child;
    if (typeof children === "function") {
      for (const c of built) c.destroy();
      const prev = current;
      current = v;
      try {
        nodes = children();
      } finally {
        current = prev;
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
  disposer.add(() => built.forEach((c) => c.destroy()));

  return {
    el,
    update(next) {
      state = { ...state, ...next };
      render();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}
