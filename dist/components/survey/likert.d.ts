import * as React from "react";
/**
 * Likert — n-point agree/disagree scale. The third leg of the survey
 * triplet (Rating · NPS · Likert), used for attitudinal questions:
 *
 *   "The onboarding was easy to follow."
 *     ◉ Strongly disagree   ○ Disagree   ○ Neutral   ○ Agree   ○ Strongly agree
 *
 *   const [answer, setAnswer] = useState<string | undefined>();
 *   <Likert
 *     value={answer}
 *     onValueChange={setAnswer}
 *     question="The onboarding was easy to follow."
 *   />
 *
 * Defaults to the standard 5-point Strongly disagree → Strongly agree
 * scale. Override `options` for variants (3-point, 7-point, frequency
 * scales like Never → Always, importance scales like Not important →
 * Critical, etc.).
 *
 * Three layouts:
 *   - "segmented" (default) — horizontal connected pill strip with
 *     short labels. Compact; fits inline questionnaires.
 *   - "stacked" — vertical list with radio button + label per row.
 *     More readable; better for long option labels and accessibility
 *     in narrow viewports.
 *   - "scale" — the mark above a radio dot, with optional captions
 *     anchoring the ends. This is the numeric ("1 … 5", anchored
 *     "Strongly disagree" → "Strongly agree") and emoji shape.
 *
 * The scale length is `options`, never markup. Apps that hardcode
 * `[1,2,3,4,5].map(...)` beside a variable-length data model silently
 * render a 7-point scale as 5 and lose answers; driving it from
 * `options` makes that unrepresentable.
 *
 * Semantically a radiogroup. Optional `question` prop renders the
 * question itself above the scale and becomes the radiogroup's
 * accessible name.
 */
export interface LikertOption {
    value: string;
    label: string;
    /** Short label used by the segmented layout when the full label is
     *  too long. Falls back to label. */
    shortLabel?: string;
    /** Custom mark for the option — an emoji, icon or number. Replaces
     *  the option's visible text in any layout.
     *
     *  A thunk, not a node, so the Solid binding can mirror this prop
     *  without evaluating it eagerly and losing reactivity.
     *
     *  The output is aria-hidden and `label` stays the accessible name:
     *  a screen reader announcing "slightly smiling face" instead of
     *  "Neutral" is not the answer the respondent gave. */
    renderOption?: () => React.ReactNode;
}
export interface LikertProps {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    /** Renders above the scale + becomes the accessible name. */
    question?: string;
    /** Custom option set. Defaults to the 5-point Strongly disagree →
     *  Strongly agree scale. */
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
    className?: string;
    /** Hidden input name for native form submission. */
    name?: string;
}
export declare const Likert: React.ForwardRefExoticComponent<LikertProps & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=likert.d.ts.map