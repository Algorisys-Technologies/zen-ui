import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
/**
 * Slider — built on @radix-ui/react-slider. Supports single-thumb and
 * range (multi-thumb). Radix supplies keyboard control (Arrow keys,
 * PgUp/Dn, Home/End), ARIA, RTL, and form submission.
 *
 *   <Slider defaultValue={[50]} max={100} step={1} />
 *   <Slider defaultValue={[20, 80]} max={100} step={1} />
 *   <Slider defaultValue={[3]} max={5} marks={[{ value: 1, label: "Never" }, …]} />
 */
export interface SliderMark {
    value: number;
    /** Rendered under the tick. A tick with no label is just a tick. */
    label?: React.ReactNode;
}
export interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
    /**
     * Tick marks along the track, with optional labels.
     *
     * Marks are decoration over the scale, not the scale itself: `step` still
     * decides which values are reachable. Marks at values `step` cannot land on
     * would draw a tick the thumb can never sit on.
     *
     * Horizontal only. A vertical slider needs the ticks laid out down the
     * track, and nothing here needed that yet — rather than ship a broken
     * half, marks are ignored when orientation="vertical".
     */
    marks?: SliderMark[];
}
declare const Slider: React.ForwardRefExoticComponent<SliderProps & React.RefAttributes<HTMLSpanElement>>;
export { Slider };
//# sourceMappingURL=slider.d.ts.map