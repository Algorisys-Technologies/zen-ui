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
    columns: {
        level: number;
        nodes: N[];
    }[];
    edges: GenealogyEdge[];
    /** Nodes beyond `maxDepth`, per side. */
    cut: {
        upstream: number;
        downstream: number;
    };
}
export declare function traceGenealogy<N extends GenealogyNodeInput>(nodes: readonly N[], edges: readonly GenealogyEdge[], focusId: string, options?: {
    maxDepth?: number;
}): GenealogyTrace<N>;
