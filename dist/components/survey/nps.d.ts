import * as React from "react";
/**
 * NPS — Net Promoter Score input. The canonical "How likely are you to
 * recommend us to a friend?" question rendered as an 0–10 strip with
 * promoter / detractor cues.
 *
 *   const [score, setScore] = useState<number | undefined>();
 *   <NPS value={score} onValueChange={setScore} />
 *
 * Score buckets follow the standard NPS definition:
 *   - 0–6 detractors  → tinted with destructive-soft
 *   - 7–8 passives    → tinted with warning-soft
 *   - 9–10 promoters  → tinted with success-soft
 *
 * The selected score gets the saturated equivalent of its bucket.
 * Below the strip, low/high anchor labels surface the meaning of the
 * extremes (override via `lowLabel` / `highLabel`).
 *
 * Semantically a radiogroup with one radio per integer — full
 * keyboard nav (arrows + Home/End) comes for free.
 */
export interface NPSProps {
    value?: number;
    defaultValue?: number;
    onValueChange?: (value: number) => void;
    /** Accessible name for the radiogroup. Default question copy. */
    label?: string;
    /** Anchor label under the leftmost button. Default "Not at all likely". */
    lowLabel?: string;
    /** Anchor label under the rightmost button. Default "Extremely likely". */
    highLabel?: string;
    disabled?: boolean;
    readOnly?: boolean;
    className?: string;
    /** Optional hidden input name for native form submission. */
    name?: string;
    /** Show the score-bucket caption ("You're a Promoter") under the
     *  selection. Default true. */
    showBucket?: boolean;
}
export declare const NPS: React.ForwardRefExoticComponent<NPSProps & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=nps.d.ts.map