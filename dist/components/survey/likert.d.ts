import { type JSX } from "solid-js";
/**
 * Likert — n-point agree/disagree scale. The third leg of the survey
 * triplet (Rating · NPS · Likert), used for attitudinal questions.
 *
 *   const [answer, setAnswer] = createSignal<string | undefined>();
 *   <Likert
 *     value={answer()}
 *     onValueChange={setAnswer}
 *     question="The onboarding was easy to follow."
 *   />
 *
 * Defaults to a 5-point Strongly disagree → Strongly agree scale.
 * Override `options` for variants (frequency, importance, etc.).
 *
 * Three layouts:
 *   - "segmented" (default) — horizontal connected pill strip.
 *   - "stacked"  — vertical list, radio button + label per row.
 *   - "scale"    — the mark above a radio dot, with optional captions
 *     anchoring the ends. The numeric and emoji shape.
 *
 * The scale length is `options`, never markup — see the React binding.
 *
 * Mirrors the React binding's API.
 */
export interface LikertOption {
    value: string;
    label: string;
    /** Short label used by segmented layout when full label is too long. */
    shortLabel?: string;
    /** Custom mark for the option — an emoji, icon or number. Replaces
     *  the option's visible text in any layout.
     *
     *  A thunk rather than a value: a JSX value prop would be evaluated
     *  eagerly at call time and lose reactivity. React mirrors the same
     *  shape with ReactNode.
     *
     *  The output is aria-hidden and `label` stays the accessible name:
     *  a screen reader announcing "slightly smiling face" instead of
     *  "Neutral" is not the answer the respondent gave. */
    renderOption?: () => JSX.Element;
}
export interface LikertProps {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    question?: string;
    options?: LikertOption[];
    /** "segmented" (default) — connected pill strip, short labels.
     *  "stacked"  — vertical list, full radio + label per row.
     *  "scale"    — mark above a radio dot; numeric and emoji scales. */
    layout?: "segmented" | "stacked" | "scale";
    /** Caption anchoring the low end, e.g. "Strongly disagree". A bare
     *  numeric scale means nothing without its ends named. Rendered by
     *  layout="scale" only; a caption, not the accessible name — that
     *  still comes from `question`. */
    minLabel?: string;
    /** Caption anchoring the high end, e.g. "Strongly agree". */
    maxLabel?: string;
    disabled?: boolean;
    readOnly?: boolean;
    class?: string;
    name?: string;
}
export declare const Likert: (props: LikertProps) => JSX.Element;
//# sourceMappingURL=likert.d.ts.map