import { type JSX } from "solid-js";
/**
 * Slider — Solid port built on Kobalte Slider. Supports single-thumb
 * and range (multi-thumb).
 *
 *   <Slider defaultValue={[50]} maxValue={100} step={1} />
 *   <Slider defaultValue={[20, 80]} maxValue={100} step={1} />
 *
 * Kobalte supplies keyboard control (arrows, PgUp/Dn, Home/End), ARIA,
 * RTL and form submission (via name + value).
 *
 *   <Slider defaultValue={[3]} maxValue={5} marks={[{ value: 1, label: "Never" }, …]} />
 *
 * NOTE the bounds are `minValue`/`maxValue` here and `min`/`max` in the React
 * binding — Kobalte's vocabulary against Radix's. That divergence predates
 * `marks` and is not fixed by it.
 */
export interface SliderMark {
    value: number;
    /** Rendered under the tick. A tick with no label is just a tick. */
    label?: JSX.Element;
}
export type SliderProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "onChange"> & {
    value?: number[];
    defaultValue?: number[];
    onChange?: (value: number[]) => void;
    minValue?: number;
    maxValue?: number;
    step?: number;
    minStepsBetweenThumbs?: number;
    orientation?: "horizontal" | "vertical";
    disabled?: boolean;
    name?: string;
    /**
     * Tick marks along the track, with optional labels.
     *
     * Marks are decoration over the scale, not the scale itself: `step` still
     * decides which values are reachable.
     *
     * Horizontal only — marks are ignored when orientation="vertical", rather
     * than shipping a broken half.
     */
    marks?: SliderMark[];
    class?: string;
};
export declare const Slider: (props: SliderProps) => JSX.Element;
//# sourceMappingURL=slider.d.ts.map