import * as React from "react";
import { type RoutingLink } from "../../_core/routing";
/**
 * RoutingGraph — a process's steps and the links between them: "this step
 * may start once that one is done". Read-only with step status for the
 * operator; editable for the engineer.
 *
 *   <RoutingGraph steps={template.steps} links={links} onLinksChange={setLinks} />
 *
 * Laid out left to right by longest path, so a step sits after everything it
 * waits for and parallel branches line up. With no links the steps run in
 * order (the implicit chain, drawn dashed).
 *
 * Editing is done on the selected step, not by dragging: its panel lists what
 * it runs after, each with a remove button, and a picker offers only steps
 * that would not close a loop. That works the same with a keyboard and a
 * screen reader as with a mouse. While the routing is still the implicit
 * chain, the first edit writes the chain out as real links before applying
 * itself — otherwise adding one link would silently drop all the others.
 */
export type RoutingStepStatus = "done" | "active" | "pending" | "blocked" | "skipped";
export interface RoutingStep {
    id: string;
    label: string;
    /** A second line: a workstation, a time. */
    detail?: string;
    status?: RoutingStepStatus;
}
export type RoutingGraphProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "onSelect"> & {
    steps: RoutingStep[];
    links: RoutingLink[];
    /** Makes the routing editable. */
    onLinksChange?: (links: RoutingLink[]) => void;
    selected?: string;
    onSelect?: (id: string | undefined) => void;
    /** Names the graph. Defaults to "Routing". */
    label?: string;
};
export declare const RoutingGraph: React.ForwardRefExoticComponent<Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "onSelect"> & {
    steps: RoutingStep[];
    links: RoutingLink[];
    /** Makes the routing editable. */
    onLinksChange?: (links: RoutingLink[]) => void;
    selected?: string;
    onSelect?: (id: string | undefined) => void;
    /** Names the graph. Defaults to "Routing". */
    label?: string;
} & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=routing-graph.d.ts.map