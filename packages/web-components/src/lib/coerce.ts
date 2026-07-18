/**
 * Attribute strings in, typed prop values out.
 *
 * HTML attributes are always strings (or absent). A vanilla factory wants a
 * boolean, a number, or a whole data array. This is the one place that gap is
 * bridged, so every element coerces the same way.
 */
export type AttrType = "string" | "boolean" | "number" | "json";

/**
 * Coerce a raw attribute value to its declared type.
 *
 * `raw` is what `getAttribute` returned: a string when the attribute is present,
 * `null` when it is absent. A present boolean attribute is `true` whatever its
 * value (`disabled=""` and `disabled="false"` are both "present" in HTML — the
 * value never means false), which is why the caller decides absence, not this.
 */
export function coerce(raw: string | null, type: AttrType): unknown {
  if (type === "boolean") return raw !== null;
  if (raw === null) return undefined;
  if (type === "number") {
    const n = Number(raw);
    return Number.isNaN(n) ? undefined : n;
  }
  if (type === "json") {
    try {
      return JSON.parse(raw);
    } catch {
      // A malformed JSON attribute is a caller error, not ours. Surface it rather
      // than silently rendering an empty component, but do not throw and kill the
      // whole upgrade — one bad attribute should not take the page down.
      console.error(`[zen-ui] could not parse JSON attribute: ${raw}`);
      return undefined;
    }
  }
  return raw;
}

/** `default-value` -> `defaultValue`. Attribute names are kebab; props are camel. */
export const camel = (s: string): string => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

/** `defaultValue` -> `default-value`. The reflecting setter needs the attr name. */
export const kebab = (s: string): string => s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
