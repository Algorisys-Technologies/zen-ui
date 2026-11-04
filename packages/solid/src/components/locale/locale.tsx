import { type JSX, createContext, useContext } from "solid-js";

/**
 * LocaleProvider — the locale and currency zen-ui formats with, set once for
 * an app (or a part of one: a vendor's invoice in their currency).
 *
 *   <LocaleProvider locale="en-IN" currency="INR">
 *     <App />
 *   </LocaleProvider>
 *
 * Optional, and nothing changes without it: a component reads the locale from
 * its own prop first, then from here, then falls back to what it did before
 * the provider existed (the browser's locale). AmountField, QuantityField and
 * ObjectNumber's formatting read it today; the built-in strings will (B1).
 */
export interface LocaleContextValue {
  /** BCP 47: "en-IN", "hi-IN", "de-DE". Undefined: the browser's. */
  locale: () => string | undefined;
  /** ISO 4217 for amounts that do not name their own: "INR". */
  currency: () => string | undefined;
}

const LocaleContext = createContext<LocaleContextValue>();

export type LocaleProviderProps = {
  locale?: string;
  currency?: string;
  children?: JSX.Element;
};

export const LocaleProvider = (props: LocaleProviderProps) => {
  // An inner provider that leaves something out inherits it from the outer one.
  const outer = useContext(LocaleContext);
  const value: LocaleContextValue = {
    locale: () => props.locale ?? outer?.locale(),
    currency: () => props.currency ?? outer?.currency(),
  };
  return <LocaleContext.Provider value={value}>{props.children}</LocaleContext.Provider>;
};

const NONE: LocaleContextValue = { locale: () => undefined, currency: () => undefined };

/** The nearest provider's locale and currency (both undefined without one). */
export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext) ?? NONE;
}
