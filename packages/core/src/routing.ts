/**
 * Routing — the pure half of RoutingGraph.
 *
 *   bun run check:routing
 *
 * Steps and links ("to may start once from is done"). Layers by longest path
 * from the starts; with no links the implicit chain in step order (flagged).
 * A link that would close a loop, point at itself, duplicate another or name
 * an unknown step is refused — and such links in stored data are left out of
 * the layout rather than drawn. A step can start when everything it waits for
 * is done.
 */

export interface RoutingStepInput {
  id: string;
}

export interface RoutingLink {
  from: string;
  to: string;
}

export interface RoutingLayout<S extends RoutingStepInput> {
  /** Left to right; within a layer, ordered to reduce crossings. */
  layers: S[][];
  /** The links drawn: the valid explicit ones, or the implicit chain. */
  links: RoutingLink[];
  implicit: boolean;
}

/** Whether adding from → to would let a step wait, through others, for itself. */
export function wouldCreateCycle(links: readonly RoutingLink[], from: string, to: string): boolean {
  if (from === to) return true;
  // A cycle exists if `from` is already reachable from `to`.
  const stack = [to];
  const seen = new Set<string>();
  while (stack.length) {
    const id = stack.pop()!;
    if (id === from) return true;
    if (seen.has(id)) continue;
    seen.add(id);
    for (const l of links) if (l.from === id) stack.push(l.to);
  }
  return false;
}

export type LinkRefusal = "self" | "duplicate" | "cycle" | "unknown";

export function canAddLink(
  steps: readonly RoutingStepInput[],
  links: readonly RoutingLink[],
  from: string,
  to: string,
): { ok: boolean; reason: LinkRefusal | null } {
  const ids = new Set(steps.map((s) => s.id));
  if (!ids.has(from) || !ids.has(to)) return { ok: false, reason: "unknown" };
  if (from === to) return { ok: false, reason: "self" };
  if (links.some((l) => l.from === from && l.to === to)) return { ok: false, reason: "duplicate" };
  if (wouldCreateCycle(links, from, to)) return { ok: false, reason: "cycle" };
  return { ok: true, reason: null };
}

/** Explicit links that are valid against the steps, in order, dropping any that would close a loop. */
function cleanLinks(steps: readonly RoutingStepInput[], links: readonly RoutingLink[]): RoutingLink[] {
  const kept: RoutingLink[] = [];
  for (const l of links) if (canAddLink(steps, kept, l.from, l.to).ok) kept.push(l);
  return kept;
}

/** The links in force: the explicit ones, or with none the chain in step order. */
export function effectiveLinks(steps: readonly RoutingStepInput[], links: readonly RoutingLink[]): { links: RoutingLink[]; implicit: boolean } {
  const clean = cleanLinks(steps, links);
  if (clean.length > 0 || steps.length < 2) return { links: clean, implicit: false };
  return { links: steps.slice(1).map((s, i) => ({ from: steps[i].id, to: s.id })), implicit: true };
}

export function routingLayout<S extends RoutingStepInput>(steps: readonly S[], links: readonly RoutingLink[]): RoutingLayout<S> {
  const { links: drawn, implicit } = effectiveLinks(steps, links);
  const layer = new Map<string, number>();
  const depth = (id: string, guard = new Set<string>()): number => {
    const known = layer.get(id);
    if (known !== undefined) return known;
    if (guard.has(id)) return 0;
    guard.add(id);
    const preds = drawn.filter((l) => l.to === id).map((l) => l.from);
    const d = preds.length ? Math.max(...preds.map((p) => depth(p, guard))) + 1 : 0;
    layer.set(id, d);
    return d;
  };
  steps.forEach((s) => depth(s.id));
  const count = steps.length ? Math.max(...steps.map((s) => layer.get(s.id) ?? 0)) + 1 : 0;
  const layers: S[][] = Array.from({ length: count }, () => []);
  steps.forEach((s) => layers[layer.get(s.id) ?? 0].push(s));
  // Order each layer by the mean position of its predecessors (ties: step order).
  const pos = new Map<string, number>();
  layers.forEach((l, li) => {
    if (li > 0) {
      const idx = new Map(l.map((s, i) => [s.id, i]));
      const score = (s: S) => {
        const p = drawn.filter((x) => x.to === s.id).map((x) => pos.get(x.from)).filter((n): n is number => n !== undefined);
        return p.length ? p.reduce((a, b) => a + b, 0) / p.length : idx.get(s.id)!;
      };
      l.sort((a, b) => score(a) - score(b) || idx.get(a.id)! - idx.get(b.id)!);
    }
    l.forEach((s, i) => pos.set(s.id, i));
  });
  return { layers, links: drawn, implicit };
}

/** Steps not done whose every predecessor is done (or skipped), in step order. */
export function startableSteps(steps: readonly RoutingStepInput[], links: readonly RoutingLink[], done: ReadonlySet<string>): string[] {
  const { links: drawn } = effectiveLinks(steps, links);
  return steps
    .filter((s) => !done.has(s.id) && drawn.filter((l) => l.to === s.id).every((l) => done.has(l.from)))
    .map((s) => s.id);
}
