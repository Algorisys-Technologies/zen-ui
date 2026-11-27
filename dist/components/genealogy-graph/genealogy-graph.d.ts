import * as React from "react";
import { type GenealogyEdge } from "../../_core/genealogy";
/**
 * GenealogyGraph — trace a lot, order or unit both ways: where it came from
 * (left) and where it went (right). The view a recall or a complaint starts
 * with.
 *
 *   <GenealogyGraph
 *     nodes={[{ id: "LOT-77", label: "LOT-77", kind: "Material lot" }, …]}
 *     edges={[{ from: "LOT-77", to: "WO-10042" }, …]}   // input → what it went into
 *     defaultFocus="WO-10042"
 *   />
 *
 * Each node sits at its shortest distance from the traced item. Clicking a
 * node traces from it instead — how an investigation actually moves. Past
 * `maxDepth` (3 by default) the trace is cut, and the cut is SAID ("4 more
 * further on"): a trace that silently stops looks complete, and in a recall
 * that is the worst possible failure.
 *
 * The lines are drawn over the laid-out cards from their measured positions,
 * so wrapping, resizing and right-to-left all follow. They are decoration for
 * sighted users; every card's accessible name says what it was made from and
 * what it went into.
 */
export interface GenealogyNode {
    id: string;
    label: string;
    /** What it is: "Material lot", "Work order", "Pallet". */
    kind?: string;
    /** A second line: a quantity, a date, a status. */
    detail?: string;
}
export type GenealogyGraphProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
    nodes: GenealogyNode[];
    edges: GenealogyEdge[];
    focus?: string;
    defaultFocus?: string;
    onFocusChange?: (id: string) => void;
    /** Levels each way. Default 3. */
    maxDepth?: number;
};
export declare const GenealogyGraph: React.ForwardRefExoticComponent<Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
    nodes: GenealogyNode[];
    edges: GenealogyEdge[];
    focus?: string;
    defaultFocus?: string;
    onFocusChange?: (id: string) => void;
    /** Levels each way. Default 3. */
    maxDepth?: number;
} & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=genealogy-graph.d.ts.map