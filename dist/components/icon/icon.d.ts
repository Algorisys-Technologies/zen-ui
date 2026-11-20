import * as React from "react";
import { type IconName } from "../../_core/icons";
export interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, "name"> {
    name: IconName;
    /** Width and height in px. Default 16 — matches the inline SVGs this replaces. */
    size?: number;
    /** Accessible name. Omit for decorative icons. */
    title?: string;
}
export declare const Icon: React.ForwardRefExoticComponent<Omit<IconProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
export type { IconName };
export { ZEN_ICON_NAMES } from "../../_core/icons";
//# sourceMappingURL=icon.d.ts.map