/**
 * NPS — Net Promoter Score input. The canonical 0–10 "would you
 * recommend us?" strip with promoter / detractor cues.
 *
 *   const [score, setScore] = createSignal<number | undefined>();
 *   <NPS value={score()} onValueChange={setScore} />
 *
 * Score buckets follow the standard NPS definition:
 *   - 0–6 detractors  → tinted with error-soft
 *   - 7–8 passives    → tinted with warning-soft
 *   - 9–10 promoters  → tinted with success-soft
 *
 * Semantically a radiogroup — keyboard nav (arrows + Home/End) for free.
 */
export interface NPSProps {
    value?: number;
    defaultValue?: number;
    onValueChange?: (value: number) => void;
    label?: string;
    lowLabel?: string;
    highLabel?: string;
    disabled?: boolean;
    readOnly?: boolean;
    class?: string;
    name?: string;
    showBucket?: boolean;
}
export declare const NPS: (props: NPSProps) => import("solid-js").JSX.Element;
//# sourceMappingURL=nps.d.ts.map