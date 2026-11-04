import { type JSX, createContext, useContext } from "solid-js";
import { DEFAULT_MESSAGES, formatMessage, type MessageKey, type ZenMessages } from "@algorisys/zen-ui-core/messages";

export type { MessageKey, ZenMessages };

/**
 * LocaleProvider — the locale, currency and words zen-ui uses, set once for an
 * app (or a part of one: a vendor's invoice in their currency).
 *
 *   <LocaleProvider locale="hi-IN" currency="INR" messages={hindi}>
 *     <App />
 *   </LocaleProvider>
 *
 * Optional, and nothing changes without it: a component reads its own prop
 * first, then this, then what it did before the provider existed (the
 * browser's locale, the English words). `messages` may be any subset of the
 * catalogue in @algorisys/zen-ui-core/messages; what it leaves out stays
 * English, and a nested provider inherits what it does not set.
 */
export interface LocaleContextValue {
  /** BCP 47: "en-IN", "hi-IN", "de-DE". Undefined: the browser's. */
  locale: () => string | undefined;
  /** ISO 4217 for amounts that do not name their own: "INR". */
  currency: () => string | undefined;
  /** A built-in string, translated if the app supplied one, filled with `values`. */
  t: (key: MessageKey, values?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextValue>();

export type LocaleProviderProps = {
  locale?: string;
  currency?: string;
  /** Translations for any of the built-in strings. */
  messages?: Partial<ZenMessages>;
  children?: JSX.Element;
};

export const LocaleProvider = (props: LocaleProviderProps) => {
  // An inner provider that leaves something out inherits it from the outer one.
  const outer = useContext(LocaleContext);
  const value: LocaleContextValue = {
    locale: () => props.locale ?? outer?.locale(),
    currency: () => props.currency ?? outer?.currency(),
    t: (key, values) => {
      const own = props.messages?.[key];
      if (own === undefined && outer) return outer.t(key, values);
      return formatMessage(own ?? DEFAULT_MESSAGES[key], values, props.locale ?? outer?.locale());
    },
  };
  return <LocaleContext.Provider value={value}>{props.children}</LocaleContext.Provider>;
};

const NONE: LocaleContextValue = {
  locale: () => undefined,
  currency: () => undefined,
  t: (key, values) => formatMessage(DEFAULT_MESSAGES[key], values),
};

/** The nearest provider's locale, currency and words (the defaults without one). */
export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext) ?? NONE;
}
