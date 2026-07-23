import { type JSX } from "solid-js";
import { type IconName } from "@algorisys/zen-ui-core/icons";
export type IconProps = Omit<JSX.SvgSVGAttributes<SVGSVGElement>, "name"> & {
    name: IconName;
    /** Width and height in px. Default 16 — matches the inline SVGs this replaces. */
    size?: number;
    /** Accessible name. Omit for decorative icons. */
    title?: string;
};
export declare const Icon: (props: IconProps) => JSX.Element;
export type { IconName };
export { ZEN_ICON_NAMES } from "@algorisys/zen-ui-core/icons";
//# sourceMappingURL=icon.d.ts.map