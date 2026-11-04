/**
 * Saved views: the pure half of ViewManager, shared by every binding.
 *
 *   bun run check:views
 *
 * A view is a name over one serialisable state object: whatever a list screen
 * needs to come back to ("My overdue invoices, this quarter, these columns"):
 * filters (a FilterBuilder value), sort, grouping, column order, widths and
 * visibility. This module does not know the state's shape. It answers the
 * questions every view picker has: has the screen drifted from the view
 * (key order is not a change), is this name usable, which view is the
 * default, and how does a view travel in a link.
 */

export interface SavedView<S = unknown> {
  id: string;
  name: string;
  state: S;
  /** Opens with the screen. At most one view is the default. */
  isDefault?: boolean;
  /** Seen by others (the app decides who). */
  shared?: boolean;
  /** Someone else's, or the app's own: can be used, not saved over, renamed or deleted. */
  readOnly?: boolean;
}

/** JSON with object keys sorted at every depth: equal states give equal strings. */
export function stableStringify(value: unknown): string {
  return JSON.stringify(sortKeys(value)) ?? "null";
}
function sortKeys(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(sortKeys);
  if (v && typeof v === "object" && !(v instanceof Date)) {
    const o = v as Record<string, unknown>;
    // (Keys whose value is undefined need no filtering: JSON.stringify drops them.)
    return Object.fromEntries(
      Object.keys(o)
        .sort()
        .map((k) => [k, sortKeys(o[k])]),
    );
  }
  return v;
}

/** Whether two states mean the same: deep, key order ignored, undefined keys ignored. */
export function sameViewState(a: unknown, b: unknown): boolean {
  return stableStringify(a) === stableStringify(b);
}

/** Whether the screen has drifted from a view (true when there is no view to compare with and a baseline is given that differs). */
export function isViewModified<S>(current: S, view: SavedView<S> | null | undefined, baseline?: S): boolean {
  if (view) return !sameViewState(current, view.state);
  return baseline !== undefined && !sameViewState(current, baseline);
}

const norm = (s: string) => s.trim().replace(/\s+/g, " ").toLocaleLowerCase();

/**
 * Why a name cannot be used, or null if it can. Names are compared trimmed,
 * with runs of spaces as one and case ignored: "My view" and " my  VIEW " are
 * the same view to the person choosing between them.
 */
export function viewNameProblem(name: string, views: readonly SavedView[], exceptId?: string): string | null {
  const n = norm(name);
  if (!n) return "Give the view a name.";
  if (n.length > 80) return "Keep the name under 80 characters.";
  const clash = views.find((v) => v.id !== exceptId && norm(v.name) === n);
  return clash ? `There is already a view called “${clash.name}”.` : null;
}

/** A free name based on `base`: "Overdue", else "Overdue (2)", "Overdue (3)"… */
export function freeViewName(base: string, views: readonly SavedView[]): string {
  const root = base.trim().replace(/\s*\(\d+\)$/, "") || "View";
  if (!viewNameProblem(root, views)) return root;
  for (let i = 2; ; i++) {
    const candidate = `${root} (${i})`;
    if (!viewNameProblem(candidate, views)) return candidate;
  }
}

/** The view the screen opens with: the one marked default, else none. */
export function defaultView<S>(views: readonly SavedView<S>[]): SavedView<S> | null {
  return views.find((v) => v.isDefault) ?? null;
}

/** Make one view the default (or none, with null): every other view loses the mark. Returns new objects only where something changed. */
export function withDefault<S>(views: readonly SavedView<S>[], id: string | null): SavedView<S>[] {
  return views.map((v) => {
    const should = v.id === id;
    if (!!v.isDefault === should) return v;
    const { isDefault: _drop, ...rest } = v;
    return should ? { ...rest, isDefault: true } : (rest as SavedView<S>);
  });
}

// --- Links ---------------------------------------------------------------------

const toBase64Url = (bytes: Uint8Array) => {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
const fromBase64Url = (s: string) => {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  const bin = atob(b64);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};

/** A view's name and state as one URL-safe string, for a share link (?view=…). UTF-8 throughout. */
export function encodeView(view: Pick<SavedView, "name" | "state">): string {
  return toBase64Url(new TextEncoder().encode(stableStringify({ v: 1, name: view.name, state: view.state })));
}

/**
 * Read a shared view back: its name and state, or null for anything that is
 * not one (a truncated link, a hand-edited one, another app's parameter).
 * Never throws. The state is the sender's: check it against today's fields
 * (loadFilter does, for a filter) before applying it.
 */
export function decodeView(text: string | null | undefined): { name: string; state: unknown } | null {
  if (!text || typeof text !== "string" || text.length > 64_000 || !/^[A-Za-z0-9_-]+$/.test(text)) return null;
  try {
    const parsed = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(fromBase64Url(text)));
    if (!parsed || typeof parsed !== "object" || parsed.v !== 1 || typeof parsed.name !== "string" || !("state" in parsed)) return null;
    return { name: parsed.name, state: parsed.state };
  } catch {
    return null;
  }
}
