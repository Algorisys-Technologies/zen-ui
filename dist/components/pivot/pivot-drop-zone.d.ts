import * as React from "react";
import type { PivotZone } from "../../_core/pivot";
import { type IconName } from "../icon/icon";
/**
 * PivotDropZone — one of the four bins a field can live in.
 *
 * Mirrors the Solid binding's API exactly. The only difference is which drag
 * library provides the droppable: @dnd-kit here, @thisbeyond/solid-dnd there.
 * Everything a caller can see is the same.
 */
export interface PivotDropZoneProps {
    id: PivotZone;
    title: string;
    icon?: IconName;
    hideTitle?: boolean;
    className?: string;
    horizontal?: boolean;
    children?: React.ReactNode;
    isEmpty?: boolean;
}
export declare const PivotDropZone: React.FC<PivotDropZoneProps>;
//# sourceMappingURL=pivot-drop-zone.d.ts.map