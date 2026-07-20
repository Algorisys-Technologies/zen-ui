import { type JSX, createSignal, onCleanup, onMount } from "solid-js";
import { I18nProvider, getReadingDirection } from "@kobalte/core/i18n";
import {
  type Direction,
  readDocumentDirection,
  observeDocumentDirection,
} from "@algorisys/zen-ui-core";

export type { Direction };

export interface DirectionProviderProps {
  /**
   * Reading direction for everything inside. Omit it and the document's own
   * `dir` is used and kept in sync — which is what an app that sets `dir` on
   * <html> already wants, with no zen-ui code at all.
   */
  dir?: Direction;
  /**
   * The locale to hand Kobalte. **Solid only** — see the note below on why this
   * binding needs it and React does not. Defaults to `<html lang>`, then to a
   * representative locale for `dir`.
   */
  locale?: string;
  children?: JSX.Element;
}

/** A locale whose reading direction is `dir`, used only as a last resort. */
const REPRESENTATIVE: Record<Direction, string> = { ltr: "en", rtl: "ar" };

/**
 * DirectionProvider — tells the Kobalte primitives which way the page reads.
 *
 * See the React binding for the general rationale. Two things differ here.
 *
 * WHY THIS TAKES A `locale` AND REACT DOES NOT — a real divergence between the
 * libraries underneath, not an oversight. Radix takes a direction outright.
 * Kobalte has no such input: it takes a LOCALE and derives direction from it,
 * so direction cannot be set independently. Handing it a locale purely to
 * obtain a direction would also change its collator, date and number
 * formatting, which is a side effect nobody asked for.
 *
 * So the locale is resolved in the order that loses the least:
 *   1. an explicit `locale` prop — the caller knows best;
 *   2. `<html lang>`, IF its direction already matches the one we want, so a
 *      real app's real locale survives and formatting is untouched;
 *   3. only then a representative locale ("ar" / "en"), which gets the
 *      direction right and may format dates and numbers unexpectedly.
 *
 * Reaching case 3 means the page claims `dir="rtl"` while `<html lang>` says
 * something left-to-right, which is usually a bug in the page.
 *
 * NOTE — zen-ui's OWN components do not read this; they use `directionOf()`
 * from core against the DOM. This exists purely because Kobalte cannot.
 */
export const DirectionProvider = (props: DirectionProviderProps) => {
  const [documentDir, setDocumentDir] = createSignal<Direction>(readDocumentDirection());
  onMount(() => {
    setDocumentDir(readDocumentDirection());
    onCleanup(observeDocumentDirection(setDocumentDir));
  });

  const wanted = (): Direction => props.dir ?? documentDir();

  const locale = (): string => {
    if (props.locale) return props.locale;
    const lang = typeof document === "undefined" ? "" : document.documentElement.lang;
    if (lang) {
      try {
        if (getReadingDirection(lang) === wanted()) return lang;
      } catch {
        // An unparseable lang is not worth throwing over — fall through.
      }
    }
    return REPRESENTATIVE[wanted()];
  };

  return <I18nProvider locale={locale()}>{props.children}</I18nProvider>;
};
