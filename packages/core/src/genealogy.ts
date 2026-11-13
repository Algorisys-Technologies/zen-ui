/**
 * Genealogy — the pure half of GenealogyGraph.
 *
 *   bun run check:genealogy
 *
 * From a focus node, breadth-first both ways: upstream (what it was made
 * from) as negative levels, downstream (what it went into) as positive. Each
 * node once, at its shortest distance; loops end; past `maxDepth` nodes are
 * cut and counted per side, never dropped silently. Within a column, nodes
 * follow the average position of their neighbours nearer the focus, so lines
 * cross less.
 */

export interface GenealogyNodeInput {
  id: string;
}

export interface GenealogyEdge {
  /** The input… */
  from: string;
  /** …and what it went into. */
  to: string;
}

export interface GenealogyTrace<N extends GenealogyNodeInput> {
  columns: { level: number; nodes: N[] }[];
  edges: GenealogyEdge[];
  /** Nodes beyond `maxDepth`, per side. */
  cut: { upstream: number; downstream: number };
}

export function traceGenealogy<N extends GenealogyNodeInput>(
  nodes: readonly N[],
  edges: readonly GenealogyEdge[],
  focusId: string,
  options: { maxDepth?: number } = {},
): GenealogyTrace<N> {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const empty = { columns: [], edges: [], cut: { upstream: 0, downstream: 0 } };
  if (!byId.has(focusId)) return empty;
  const real = edges.filter((e) => byId.has(e.from) && byId.has(e.to));
  const max = options.maxDepth ?? Infinity;

  const level = new Map<string, number>([[focusId, 0]]);
  const cut = { upstream: 0, downstream: 0 };
  const walk = (dir: -1 | 1) => {
    const next = (id: string) => (dir < 0 ? real.filter((e) => e.to === id).map((e) => e.from) : real.filter((e) => e.from === id).map((e) => e.to));
    let frontier = [focusId];
    const seen = new Set<string>([focusId]);
    for (let depth = 1; frontier.length; depth++) {
      const nextFrontier: string[] = [];
      for (const id of frontier) {
        for (const n of next(id)) {
          if (seen.has(n)) continue;
          seen.add(n);
          if (level.has(n)) continue; // placed already, on the other side
          if (depth > max) {
            cut[dir < 0 ? "upstream" : "downstream"]++;
            nextFrontier.push(n); // keep counting what lies beyond
            continue;
          }
          level.set(n, dir * depth);
          nextFrontier.push(n);
        }
      }
      frontier = nextFrontier;
    }
  };
  walk(-1);
  walk(1);

  const kept = real.filter((e) => level.has(e.from) && level.has(e.to));
  const levels = [...new Set(level.values())].sort((a, b) => a - b);
  const order = new Map<string, number>();
  const columns: { level: number; nodes: N[] }[] = levels.map((l) => ({ level: l, nodes: [] }));
  const colOf = new Map(columns.map((c) => [c.level, c]));
  // Input order first, then refine outward from the focus by barycentre.
  nodes.forEach((n) => {
    const l = level.get(n.id);
    if (l !== undefined) colOf.get(l)!.nodes.push(n);
  });
  const place = (c: { nodes: N[] }) => c.nodes.forEach((n, i) => order.set(n.id, i));
  place(colOf.get(0)!);
  const refine = (l: number) => {
    const c = colOf.get(l);
    if (!c) return false;
    const inner = l < 0 ? l + 1 : l - 1;
    const neighbours = (id: string) =>
      kept.filter((e) => (e.from === id && level.get(e.to) === inner) || (e.to === id && level.get(e.from) === inner))
        .map((e) => order.get(e.from === id ? e.to : e.from) ?? 0);
    const score = new Map(c.nodes.map((n, i) => {
      const ns = neighbours(n.id);
      return [n.id, ns.length ? ns.reduce((a, b) => a + b, 0) / ns.length : i] as const;
    }));
    const idx = new Map(c.nodes.map((n, i) => [n.id, i]));
    c.nodes.sort((a, b) => (score.get(a.id)! - score.get(b.id)!) || (idx.get(a.id)! - idx.get(b.id)!));
    place(c);
    return true;
  };
  for (let l = -1; refine(l); l--);
  for (let l = 1; refine(l); l++);
  return { columns, edges: kept, cut };
}
