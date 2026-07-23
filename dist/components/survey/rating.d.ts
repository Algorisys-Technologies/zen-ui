import { type JSX } from "solid-js";
/**
 * Rating — N-star rating input (default 5). Used for feedback
 * collection: "Rate your experience".
 *
 *   const [stars, setStars] = createSignal(0);
 *   <Rating value={stars()} onValueChange={setStars} label="Rate the support agent" />
 *
 * Semantically a radiogroup so screen readers announce "1 of 5",
 * "2 of 5", etc. on arrow-key nav. Hover preview tints stars up to the
 * pointed-at index but doesn't commit until click. Click an
 * already-selected star to clear (disable via `allowClear={false}`).
 *
 * `allowHalf` keeps all of that and doubles the options: each star
 * grows a left and a right hit target, arrows step by 0.5, and the
 * radios announce "2.5 stars". The stars stay whole — it is the
 * options that halve, not the picture.
 *
 * Mirrors the React binding's API.
 */
export interface RatingProps {
    value?: number;
    defaultValue?: number;
    onValueChange?: (value: number) => void;
    /** Number of stars rendered. Default 5. */
    max?: number;
    /**
     * Allow half-star values (0.5, 1, 1.5 …). Each star becomes two
     * options rather than each half becoming a star.
     */
    allowHalf?: boolean;
    /** Accessible name for the radiogroup. Required for a11y. */
    label?: string;
    /** Show "n / max" caption next to the stars. */
    showValue?: boolean;
    /** Star size. Default md (24px). */
    size?: "sm" | "md" | "lg";
    /** Click on the currently-selected star clears it. Default true. */
    allowClear?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    class?: string;
    /** Hidden input for native form submission. */
    name?: string;
}
export declare const Rating: (props: RatingProps) => JSX.Element;
//# sourceMappingURL=rating.d.ts.map