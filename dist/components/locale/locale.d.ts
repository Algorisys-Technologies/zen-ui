import * as React from "react";
import { type MessageKey, type ZenMessages } from "../../_core/messages";
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
    locale: string | undefined;
    /** ISO 4217 for amounts that do not name their own: "INR". */
    currency: string | undefined;
    /** A built-in string, translated if the app supplied one, filled with `values`. */
    t: (key: MessageKey, values?: Record<string, string | number>) => string;
}
export type LocaleProviderProps = {
    locale?: string;
    currency?: string;
    /** Translations for any of the built-in strings. */
    messages?: Partial<ZenMessages>;
    children?: React.ReactNode;
};
export declare const LocaleProvider: ({ locale, currency, messages, children }: LocaleProviderProps) => React.JSX.Element;
/** The nearest provider's locale, currency and words (the defaults without one). */
export declare function useLocale(): LocaleContextValue;
//# sourceMappingURL=locale.d.ts.map