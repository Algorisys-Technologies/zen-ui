import type { JSX } from "solid-js";
import type { PivotZone } from "@algorisys/zen-ui-core/pivot";
import { type IconName } from "../icon/icon";
export interface PivotDropZoneProps {
    id: PivotZone;
    title: string;
    icon?: IconName;
    hideTitle?: boolean;
    class?: string;
    horizontal?: boolean;
    children?: JSX.Element;
    isEmpty?: boolean;
}
export declare function PivotDropZone(props: PivotDropZoneProps): JSX.Element;
//# sourceMappingURL=pivot-drop-zone.d.ts.map