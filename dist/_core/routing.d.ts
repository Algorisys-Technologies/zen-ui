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
export declare function wouldCreateCycle(links: readonly RoutingLink[], from: string, to: string): boolean;
export type LinkRefusal = "self" | "duplicate" | "cycle" | "unknown";
export declare function canAddLink(steps: readonly RoutingStepInput[], links: readonly RoutingLink[], from: string, to: string): {
    ok: boolean;
    reason: LinkRefusal | null;
};
/** The links in force: the explicit ones, or with none the chain in step order. */
export declare function effectiveLinks(steps: readonly RoutingStepInput[], links: readonly RoutingLink[]): {
    links: RoutingLink[];
    implicit: boolean;
};
export declare function routingLayout<S extends RoutingStepInput>(steps: readonly S[], links: readonly RoutingLink[]): RoutingLayout<S>;
/** Steps not done whose every predecessor is done (or skipped), in step order. */
export declare function startableSteps(steps: readonly RoutingStepInput[], links: readonly RoutingLink[], done: ReadonlySet<string>): string[];
